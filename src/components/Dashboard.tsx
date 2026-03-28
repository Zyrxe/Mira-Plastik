import React, { useMemo } from 'react';
import { useAppStore } from '../store';
import { formatRupiah } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

export default function Dashboard() {
  const { transactions, debts, expiredItems } = useAppStore();

  const currentYear = new Date().getFullYear();

  const { totalRevenue, totalExpense, profit } = useMemo(() => {
    let rev = 0;
    let exp = 0;
    transactions.forEach(t => {
      if (new Date(t.date).getFullYear() === currentYear) {
        if (t.type === 'revenue') rev += t.amount;
        if (t.type === 'expense') exp += t.amount;
      }
    });
    return { totalRevenue: rev, totalExpense: exp, profit: rev - exp };
  }, [transactions, currentYear]);

  const totalExpiredLoss = useMemo(() => {
    return expiredItems.reduce((sum, item) => {
      if (new Date(item.date).getFullYear() === currentYear) {
        return sum + item.totalLoss;
      }
      return sum;
    }, 0);
  }, [expiredItems, currentYear]);

  const netProfit = profit - totalExpiredLoss;

  const totalOutstandingDebt = useMemo(() => {
    return debts.reduce((sum, d) => sum + d.remainingAmount, 0);
  }, [debts]);

  const monthlyData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => ({
      name: format(new Date(currentYear, i, 1), 'MMM', { locale: id }),
      Omset: 0,
      Pengeluaran: 0,
    }));

    transactions.forEach(t => {
      const date = new Date(t.date);
      if (date.getFullYear() === currentYear) {
        const monthIndex = date.getMonth();
        if (t.type === 'revenue') months[monthIndex].Omset += t.amount;
        if (t.type === 'expense') months[monthIndex].Pengeluaran += t.amount;
      }
    });

    return months;
  }, [transactions, currentYear]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Profit ({currentYear})</h1>
        <p className="text-gray-500">Ringkasan omset, pengeluaran, dan profit tahunan.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-[0_8px_0_0_#e5e7eb] border-2 border-gray-100 transform transition-all hover:-translate-y-1 hover:shadow-[0_12px_0_0_#e5e7eb]">
          <p className="text-sm font-medium text-gray-500">Total Omset</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{formatRupiah(totalRevenue)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-[0_8px_0_0_#e5e7eb] border-2 border-gray-100 transform transition-all hover:-translate-y-1 hover:shadow-[0_12px_0_0_#e5e7eb]">
          <p className="text-sm font-medium text-gray-500">Total Pengeluaran</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{formatRupiah(totalExpense)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-[0_8px_0_0_#e5e7eb] border-2 border-gray-100 transform transition-all hover:-translate-y-1 hover:shadow-[0_12px_0_0_#e5e7eb]">
          <p className="text-sm font-medium text-gray-500">Kerugian Expired</p>
          <p className="text-2xl font-bold text-red-600 mt-2">{formatRupiah(totalExpiredLoss)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-[0_8px_0_0_#e5e7eb] border-2 border-gray-100 transform transition-all hover:-translate-y-1 hover:shadow-[0_12px_0_0_#e5e7eb]">
          <p className="text-sm font-medium text-gray-500">Profit Bersih</p>
          <p className={`text-2xl font-bold mt-2 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatRupiah(netProfit)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-[0_8px_0_0_#e5e7eb] border-2 border-gray-100 transform transition-all hover:-translate-y-1 hover:shadow-[0_12px_0_0_#e5e7eb]">
          <p className="text-sm font-medium text-gray-500">Total Hutang Berjalan</p>
          <p className="text-2xl font-bold text-orange-600 mt-2">{formatRupiah(totalOutstandingDebt)}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-[0_8px_0_0_#e5e7eb] border-2 border-gray-100 h-[400px] transform transition-all hover:-translate-y-1 hover:shadow-[0_12px_0_0_#e5e7eb]">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Grafik Bulanan</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(val) => `Rp ${val / 1000}k`} />
            <Tooltip formatter={(value: number) => formatRupiah(value)} />
            <Legend />
            <Bar dataKey="Omset" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
