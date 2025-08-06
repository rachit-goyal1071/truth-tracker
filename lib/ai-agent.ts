import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export interface ExtractedPromise {
  id: string;
  title: string;
  description: string;
  party: string;
  politician: string;
  category: string;
  credibilityScore: number;
  source: string;
  sourceUrl: string;
  extractedAt: Date;
  analysis: {
    feasibility: string;
    specificity: string;
    redFlags: string[];
    confidence: number;
  };
}

export class AIPromiseAgent {
  private openaiApiKey: string;

  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY || '';
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key is required for AI promise extraction');
    }
  }

  async extractPromises(content: string, source: string, sourceUrl: string): Promise<ExtractedPromise[]> {
    try {
      const { text } = await generateText({
        model: openai('gpt-4o'),
        system: `You are an expert political analyst specializing in Indian politics. Extract political promises from the given content.

INSTRUCTIONS:
1. Identify specific, actionable political promises or commitments
2. Ignore general statements or opinions
3. Focus on promises that can be measured or verified
4. Rate credibility from 0-100 based on feasibility and specificity
5. Identify any red flags (unrealistic claims, vague language, etc.)

Return a JSON array of promises with this exact structure:
{
  "promises": [
    {
      "title": "Brief promise title",
      "description": "Detailed description of the promise",
      "party": "Political party name",
      "politician": "Politician name if mentioned",
      "category": "Category (economy, healthcare, education, etc.)",
      "credibilityScore": 85,
      "analysis": {
        "feasibility": "Assessment of how realistic this promise is",
        "specificity": "How specific and measurable the promise is",
        "redFlags": ["Array of concerning aspects if any"],
        "confidence": 90
      }
    }
  ]
}`,
        prompt: `Extract political promises from this content:

Source: ${source}
URL: ${sourceUrl}

Content:
${content}

Focus on Indian political context and parties. Only extract genuine promises, not general statements.`
      });

      const parsed = JSON.parse(text);
      const promises: ExtractedPromise[] = parsed.promises.map((p: any) => ({
        id: this.generateId(),
        title: p.title,
        description: p.description,
        party: p.party,
        politician: p.politician || 'Unknown',
        category: p.category,
        credibilityScore: p.credibilityScore,
        source,
        sourceUrl,
        extractedAt: new Date(),
        analysis: p.analysis
      }));

      // Filter out low-quality promises
      return promises.filter(p => p.credibilityScore >= 60);

    } catch (error) {
      console.error('Error extracting promises:', error);
      return [];
    }
  }

  async checkDuplicate(newPromise: ExtractedPromise, existingPromises: ExtractedPromise[]): Promise<boolean> {
    if (existingPromises.length === 0) return false;

    try {
      const { text } = await generateText({
        model: openai('gpt-4o'),
        system: `You are a duplicate detection expert. Compare the new promise with existing promises and determine if it's a duplicate.

Return JSON: {"isDuplicate": true/false, "reason": "explanation"}`,
        prompt: `New Promise: "${newPromise.title} - ${newPromise.description}"

Existing Promises:
${existingPromises.slice(0, 10).map(p => `"${p.title} - ${p.description}"`).join('\n')}

Is the new promise substantially similar to any existing promise?`
      });

      const result = JSON.parse(text);
      return result.isDuplicate;
    } catch (error) {
      console.error('Error checking duplicate:', error);
      return false;
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
