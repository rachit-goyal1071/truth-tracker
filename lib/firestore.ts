import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Query,
  DocumentData
} from 'firebase/firestore';
import { db } from './firebase';
import { Promise, ElectoralBond, PriceData, Incident, FactCheck, FilterOptions, CommodityPrice, NationalIndicator } from './types';

// Generic CRUD operations
export const createDocument = async (collectionName: string, data: any) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating document:', error);
    throw error;
  }
};

export const getDocument = async (collectionName: string, id: string) => {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting document:', error);
    throw error;
  }
};

export const updateDocument = async (collectionName: string, id: string, data: any) => {
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
};

export const deleteDocument = async (collectionName: string, id: string) => {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};

// Filtered queries
export const getFilteredDocuments = async (
  collectionName: string, 
  filters: FilterOptions = {},
  limitCount?: number
) => {
  try {
    let q: Query<DocumentData> = collection(db, collectionName);
    
    // Apply filters
    if (filters.party) {
      q = query(q, where('party', '==', filters.party));
    }
    
    if (filters.year) {
      q = query(q, where('year', '==', filters.year));
    }
    
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }
    
    if (filters.category) {
      q = query(q, where('category', '==', filters.category));
    }
    
    if (filters.state) {
      q = query(q, where('state', '==', filters.state));
    }
    
    // Add ordering
    q = query(q, orderBy('createdAt', 'desc'));
    
    // Add limit if specified
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting filtered documents:', error);
    throw error;
  }
};

// Collection-specific functions
export const getPromises = (filters?: FilterOptions) => 
  getFilteredDocuments('promises', filters);

export const getElectoralBonds = (filters?: FilterOptions) => 
  getFilteredDocuments('electoral_bonds', filters);

export const getPriceData = (filters?: FilterOptions) => 
  getFilteredDocuments('price_data', filters);

export const getIncidents = (filters?: FilterOptions) => 
  getFilteredDocuments('incidents', filters);

export const getFactChecks = (filters?: FilterOptions) => 
  getFilteredDocuments('fact_checks', filters);

// Commodity Prices functions
export const getCommodityPrices = (filters?: FilterOptions) => 
  getFilteredDocuments('commodity_prices', filters);

export const getCommodityPrice = (id: string) => 
  getDocument('commodity_prices', id);

export const createCommodityPrice = (data: Omit<CommodityPrice, 'id'>) => 
  createDocument('commodity_prices', data);

export const updateCommodityPrice = (id: string, data: Partial<CommodityPrice>) => 
  updateDocument('commodity_prices', id, data);

export const deleteCommodityPrice = (id: string) => 
  deleteDocument('commodity_prices', id);

// National Indicators functions
export const getNationalIndicators = (filters?: FilterOptions) => 
  getFilteredDocuments('national_indicators', filters);

export const getNationalIndicator = (id: string) => 
  getDocument('national_indicators', id);

export const createNationalIndicator = (data: Omit<NationalIndicator, 'id'>) => 
  createDocument('national_indicators', data);

export const updateNationalIndicator = (id: string, data: Partial<NationalIndicator>) => 
  updateDocument('national_indicators', id, data);

export const deleteNationalIndicator = (id: string) => 
  deleteDocument('national_indicators', id);

// Search functionality
export const searchDocuments = async (collectionName: string, searchTerm: string) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const results = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter((doc: any) => {
        const searchableFields = Object.values(doc).join(' ').toLowerCase();
        return searchableFields.includes(searchTerm.toLowerCase());
      });
    
    return results;
  } catch (error) {
    console.error('Error searching documents:', error);
    throw error;
  }
};
