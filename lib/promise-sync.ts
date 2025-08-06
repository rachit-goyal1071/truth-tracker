import { AIPromiseAgent, ExtractedPromise } from './ai-agent';
import { DataFetcher, AUTHORIZED_SOURCES } from './data-fetcher';
import { db } from './firebase';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';

export interface SyncResult {
  success: boolean;
  totalFetched: number;
  totalExtracted: number;
  totalSaved: number;
  duplicatesSkipped: number;
  errors: string[];
  duration: number;
}

export interface SyncLog {
  id: string;
  timestamp: Date;
  result: SyncResult;
  details: string;
}

export class PromiseSyncService {
  private aiAgent: AIPromiseAgent;
  private dataFetcher: DataFetcher;

  constructor() {
    this.aiAgent = new AIPromiseAgent();
    this.dataFetcher = new DataFetcher();
  }

  async syncPromises(): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      success: false,
      totalFetched: 0,
      totalExtracted: 0,
      totalSaved: 0,
      duplicatesSkipped: 0,
      errors: [],
      duration: 0
    };

    try {
      console.log('Starting promise sync...');

      // Get existing promises to check for duplicates
      const existingPromises = await this.getExistingPromises();
      console.log(`Found ${existingPromises.length} existing promises`);

      // Fetch content from all sources
      const sourceData = await this.dataFetcher.getAllContent();
      
      for (const { source, content } of sourceData) {
        console.log(`Processing ${content.length} items from ${source.name}`);
        result.totalFetched += content.length;

        for (const item of content) {
          try {
            // Extract promises using AI
            const extractedPromises = await this.aiAgent.extractPromises(
              item, 
              source.name, 
              source.url
            );

            result.totalExtracted += extractedPromises.length;

            // Check for duplicates and save new promises
            for (const promise of extractedPromises) {
              const isDuplicate = await this.aiAgent.checkDuplicate(promise, existingPromises);
              
              if (isDuplicate) {
                result.duplicatesSkipped++;
                console.log(`Skipping duplicate: ${promise.title}`);
              } else {
                await this.savePromise(promise);
                existingPromises.push(promise); // Add to existing list
                result.totalSaved++;
                console.log(`Saved new promise: ${promise.title}`);
              }
            }

            // Rate limiting between AI calls
            await new Promise(resolve => setTimeout(resolve, 500));

          } catch (error) {
            const errorMsg = `Error processing item from ${source.name}: ${error}`;
            console.error(errorMsg);
            result.errors.push(errorMsg);
          }
        }
      }

      result.success = result.errors.length === 0 || result.totalSaved > 0;
      result.duration = Date.now() - startTime;

      // Log the sync result
      await this.logSyncResult(result);

      console.log('Sync completed:', result);
      return result;

    } catch (error) {
      const errorMsg = `Sync failed: ${error}`;
      console.error(errorMsg);
      result.errors.push(errorMsg);
      result.duration = Date.now() - startTime;
      
      await this.logSyncResult(result);
      return result;
    }
  }

  private async getExistingPromises(): Promise<ExtractedPromise[]> {
    try {
      const promisesRef = collection(db, 'promises');
      const q = query(promisesRef, orderBy('extractedAt', 'desc'), limit(100));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ExtractedPromise));
    } catch (error) {
      console.error('Error fetching existing promises:', error);
      return [];
    }
  }

  private async savePromise(promise: ExtractedPromise): Promise<void> {
    try {
      const promisesRef = collection(db, 'promises');
      await addDoc(promisesRef, {
        ...promise,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'pending_verification'
      });
    } catch (error) {
      console.error('Error saving promise:', error);
      throw error;
    }
  }

  private async logSyncResult(result: SyncResult): Promise<void> {
    try {
      const logsRef = collection(db, 'sync_logs');
      await addDoc(logsRef, {
        timestamp: new Date(),
        result,
        details: `Fetched: ${result.totalFetched}, Extracted: ${result.totalExtracted}, Saved: ${result.totalSaved}, Duplicates: ${result.duplicatesSkipped}`,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Error logging sync result:', error);
    }
  }

  async getSyncHistory(): Promise<SyncLog[]> {
    try {
      const logsRef = collection(db, 'sync_logs');
      const q = query(logsRef, orderBy('timestamp', 'desc'), limit(20));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      } as SyncLog));
    } catch (error) {
      console.error('Error fetching sync history:', error);
      return [];
    }
  }
}

export const promiseSyncService = new PromiseSyncService();
