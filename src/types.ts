export type PaymentTerm = '1_week' | '2_weeks' | '3_weeks' | '1_month';

export interface Debt {
  id: string;
  ptName: string;
  totalAmount: number;
  remainingAmount: number;
  arrivalDate: string;
  term: PaymentTerm;
  dueDate: string;
  status: 'unpaid' | 'partial' | 'paid';
  createdAt: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: 'revenue' | 'expense';
  amount: number;
  description: string;
  debtId?: string; // If this expense is paying a debt
  ptName?: string; // Denormalized for easy display
  paymentType?: 'lunas' | 'cicil'; // Only for debt payments
}

export interface Item {
  id: string;
  name: string;
  stock?: number;
  unit: string;
  buyPrice: number;
  sellPrice?: number;
  category: 'harian' | 'modal_awal';
  itemCategory?: string;
  createdAt: string;
}

export interface ExpiredItem {
  id: string;
  date: string;
  itemName: string;
  quantity: number;
  unit: string;
  buyPrice: number;
  totalLoss: number;
  notes: string;
  createdAt: string;
}
