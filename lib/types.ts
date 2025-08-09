export interface Promise {
  id: string;
  party: string; // e.g., "BJP"
  electionYear: number; // e.g., 2019
  category: string; // e.g., "Economy"
  title: string;
  description: string;
  sourceManifestoUrl: string; // Link to original manifesto
  status: 'Kept' | 'Broken' | 'In Progress' | 'Dropped';
  evidence: Array<{
    status: string;
    date: string; // ISO format
    sourceUrl: string;
  }>;
  lastVerified: string; // ISO date
  createdAt: string;
  updatedAt: string;
}

export interface ElectoralBond {
  id: string;
  company_name: string;
  party: string;
  amount: number;
  date: string;
  source_link: string;
}

export interface PriceData {
  id: string;
  item: string;
  state: string;
  date: string;
  price_per_litre: number;
}

export interface Incident {
  id: string;
  title: string;
  category: 'Violence' | 'Corruption' | 'Policy Failure';
  date: string;
  location: {
    lat: number;
    lng: number;
  };
  summary: string;
  proof_links: string[];
}

export interface FactCheck {
  id: string;
  myth: string;
  truth: string;
  category: 'Economy' | 'Jobs' | 'Security' | 'Social Policy';
  proof_link: string;
}

export interface CommodityPrice {
  id: string;
  name: string;
  unit: string;
  category: 'Fuel' | 'Food' | 'Utilities' | 'Transport';
  yearlyData: Record<string, number>;
  lastUpdated: string;
  description?: string;
}

export interface NationalIndicator {
  id: string;
  name: string;
  unit: string;
  category: 'Economic' | 'Social' | 'Development' | 'Governance';
  yearlyData: Record<string, number>;
  lastUpdated: string;
  description?: string;
  source?: string;
}

export interface User {
  uid: string;
  email: string;
  isAdmin: boolean;
}

export type FilterOptions = {
  party?: string;
  year?: number;
  status?: string;
  category?: string;
  state?: string;
  dateRange?: {
    start: string;
    end: string;
  };
};
