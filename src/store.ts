import { useState, useEffect } from 'react';
import { Debt, Transaction, Item, ExpiredItem } from './types';

export function useAppStore() {
  const [debts, setDebts] = useState<Debt[]>(() => {
    const saved = localStorage.getItem('app_debts');
    return saved ? JSON.parse(saved) : [];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('app_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [items, setItems] = useState<Item[]>(() => {
    const saved = localStorage.getItem('app_items');
    return saved ? JSON.parse(saved) : [];
  });

  const [expiredItems, setExpiredItems] = useState<ExpiredItem[]>(() => {
    const saved = localStorage.getItem('app_expired_items');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('app_debts', JSON.stringify(debts));
  }, [debts]);

  useEffect(() => {
    localStorage.setItem('app_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('app_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('app_expired_items', JSON.stringify(expiredItems));
  }, [expiredItems]);

  const addDebt = (debt: Debt) => setDebts((prev) => [...prev, debt]);
  
  const updateDebt = (id: string, updates: Partial<Debt>) => 
    setDebts((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  
  const addTransaction = (txn: Transaction) => setTransactions((prev) => [...prev, txn]);

  const addItem = (item: Item) => setItems((prev) => [...prev, item]);
  
  const updateItem = (id: string, updates: Partial<Item>) => 
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  
  const deleteItem = (id: string) => 
    setItems((prev) => prev.filter((i) => i.id !== id));

  const addExpiredItem = (item: ExpiredItem) => setExpiredItems((prev) => [...prev, item]);
  
  const deleteExpiredItem = (id: string) => 
    setExpiredItems((prev) => prev.filter((i) => i.id !== id));

  return { 
    debts, transactions, items, expiredItems, 
    addDebt, updateDebt, addTransaction, 
    addItem, updateItem, deleteItem,
    addExpiredItem, deleteExpiredItem
  };
}
