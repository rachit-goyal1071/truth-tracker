export interface Promise {
  id: string;
  party: string;
  year: number;
  election_type: string;
  title: string;
  description: string;
  status: 'Kept' | 'Broken' | 'In Progress' | 'Dropped';
  proof_links: string[];
  date_added: string;
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
