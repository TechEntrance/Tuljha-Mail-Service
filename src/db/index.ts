import Dexie, { Table } from 'dexie';

export interface User {
  id?: number;
  email: string;
  password: string;
  name: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

export interface Organization {
  id?: number;
  name: string;
  contactPerson: string;
  email: string;
  createdAt: Date;
  userId: number;
}

export interface FoodOrder {
  id?: number;
  organizationId: number;
  peopleServed: number;
  foodItems: string[];
  totalCost: number;
  orderDate: Date;
  userId: number;
}

export interface Invoice {
  id?: number;
  organizationId: number;
  orderId: number;
  amount: number;
  status: 'paid' | 'pending';
  createdAt: Date;
  userId: number;
}

export interface Expense {
  id?: number;
  description: string;
  amount: number;
  category: string;
  date: Date;
  userId: number;
}

export class HotelDatabase extends Dexie {
  users!: Table<User>;
  organizations!: Table<Organization>;
  foodOrders!: Table<FoodOrder>;
  invoices!: Table<Invoice>;
  expenses!: Table<Expense>;

  constructor() {
    super('HotelDB');
    this.version(2).stores({
      users: '++id, email, status',
      organizations: '++id, name, email, userId',
      foodOrders: '++id, organizationId, orderDate, userId',
      invoices: '++id, organizationId, orderId, status, userId',
      expenses: '++id, category, date, userId'
    });
  }
}

export const db = new HotelDatabase();