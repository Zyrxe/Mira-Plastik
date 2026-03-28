import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { formatRupiah, capitalizeWords } from '../lib/utils';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export default function OmsetHarian() {
  const { transactions, debts, addTransaction, updateDebt } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  // Form states
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  // Omset states
  const [omsetAmount, setOmsetAmount] = useState('');
  const [omsetDescription, setOmsetDescription] = useState('Omset Harian');
  
  // Expense states
  const [hasExpense, setHasExpense] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [selectedDebtId, setSelectedDebtId] = useState('');
  const [paymentType, setPaymentType] = useState<'lunas' | 'cicil'>('lunas');

  const activeDebts = debts.filter(d => d.remainingAmount > 0);

  // Group transactions by date for the selected month
  const { dailyData, totalOmset, totalPengeluaran, saldo } = useMemo(() => {
    const filtered = transactions.filter(t => t.date.startsWith(selectedMonth));
    
    const grouped = filtered.reduce((acc, t) => {
      if (!acc[t.date]) {
        acc[t.date] = { date: t.date, revenue: 0, expense: 0, details: [] };
      }
      if (t.type === 'revenue') {
        acc[t.date].revenue += t.amount;
        acc[t.date].details.push({ type: 'revenue', text: t.description, amount: t.amount });
      } else {
        acc[t.date].expense += t.amount;
        const prefix = t.paymentType ? `Bayar Hutang (${t.paymentType})` : 'Pengeluaran';
        acc[t.date].details.push({ type: 'expense', text: `${prefix}: ${t.description}`, amount: t.amount });
      }
      return acc;
    }, {} as Record<string, { date: string, revenue: number, expense: number, details: {type: string, text: string, amount: number}[] }>);

    const dailyArr = Object.values(grouped).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const tOmset = dailyArr.reduce((sum: number, d: any) => sum + d.revenue, 0);
    const tPengeluaran = dailyArr.reduce((sum: number, d: any) => sum + d.expense, 0);
    
    return { dailyData: dailyArr, totalOmset: tOmset, totalPengeluaran: tPengeluaran, saldo: Number(tOmset) - Number(tPengeluaran) };
  }, [transactions, selectedMonth]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numOmset = parseFloat(omsetAmount) || 0;
    const numExpense = parseFloat(expenseAmount) || 0;

    if (numOmset === 0 && (!hasExpense || numExpense === 0)) {
      alert('Masukkan nominal omset atau pengeluaran');
      return;
    }

    if (numOmset > 0) {
      addTransaction({
        id: crypto.randomUUID(),
        date,
        type: 'revenue',
        amount: numOmset,
        description: omsetDescription || 'Omset Harian',
      });
    }

    if (hasExpense && numExpense > 0) {
      const debt = debts.find(d => d.id === selectedDebtId);
      
      addTransaction({
        id: crypto.randomUUID(),
        date,
        type: 'expense',
        amount: numExpense,
        description: debt ? `Pembayaran Hutang: ${debt.ptName}` : expenseDescription || 'Pengeluaran',
        debtId: selectedDebtId || undefined,
        ptName: debt?.ptName,
        paymentType: selectedDebtId ? paymentType : undefined,
      });

      if (debt) {
        const newRemaining = Math.max(0, debt.remainingAmount - numExpense);
        updateDebt(debt.id, {
          remainingAmount: newRemaining,
          status: newRemaining === 0 ? 'paid' : 'partial',
        });
      }
    }

    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setOmsetAmount('');
    setOmsetDescription('Omset Harian');
    setHasExpense(false);
    setExpenseAmount('');
    setExpenseDescription('');
    setSelectedDebtId('');
    setPaymentType('lunas');
  };

  const handleDebtSelection = (debtId: string) => {
    setSelectedDebtId(debtId);
    const debt = debts.find(d => d.id === debtId);
    if (debt && paymentType === 'lunas') {
      setExpenseAmount(debt.remainingAmount.toString());
    }
  };

  const handlePaymentTypeChange = (type: 'lunas' | 'cicil') => {
    setPaymentType(type);
    const debt = debts.find(d => d.id === selectedDebtId);
    if (debt && type === 'lunas') {
      setExpenseAmount(debt.remainingAmount.toString());
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Omset Harian & Pengeluaran</h1>
          <p className="text-gray-500">Catat pemasukan dan pengeluaran harian Anda.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-auto"
          />
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-500 hover:bg-blue-400 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-[0_4px_0_0_#1d4ed8] active:shadow-none active:translate-y-1 whitespace-nowrap"
          >
            + Catat Harian
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_8px_0_0_#e5e7eb] border-2 border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4 text-right">Total Omset</th>
                <th className="px-6 py-4 text-right">Total Pengeluaran</th>
                <th className="px-6 py-4 text-right">Saldo Harian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dailyData.map(d => (
                <tr key={d.date} className="hover:bg-gray-50 align-top">
                  <td className="px-6 py-4">
                    <div className="group cursor-pointer inline-block relative">
                      <div className="font-medium text-gray-900 whitespace-nowrap inline-flex items-center gap-2">
                        <span className="border-b border-dashed border-gray-400">
                          {format(new Date(d.date), 'dd MMM yyyy', { locale: localeId })}
                        </span>
                        <span className="text-[10px] text-gray-400 group-hover:text-blue-500 transition-colors">
                          (Sentuh/Hover untuk rincian)
                        </span>
                      </div>
                      
                      <div className="hidden group-hover:block absolute z-10 left-0 mt-2 p-3 bg-white rounded-xl border-2 border-gray-100 shadow-[0_8px_0_0_#e5e7eb] min-w-[250px] whitespace-normal">
                        <p className="text-xs font-semibold text-gray-700 mb-2 border-b border-gray-100 pb-1">Rincian Transaksi:</p>
                        <div className="space-y-2 text-xs">
                          {d.details.map((detail, idx) => (
                            <div key={idx} className={`flex items-start gap-2 ${detail.type === 'revenue' ? 'text-blue-700' : 'text-red-700'}`}>
                              <span className="font-bold mt-0.5">{detail.type === 'revenue' ? '+' : '-'}</span>
                              <div>
                                <span className="font-medium">{formatRupiah(detail.amount)}</span>
                                <span className="text-gray-500 ml-1">({detail.text})</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-blue-600">
                    {d.revenue > 0 ? formatRupiah(d.revenue) : '-'}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-red-600">
                    {d.expense > 0 ? formatRupiah(d.expense) : '-'}
                  </td>
                  <td className={`px-6 py-4 text-right font-bold ${d.revenue - d.expense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatRupiah(d.revenue - d.expense)}
                  </td>
                </tr>
              ))}
              {dailyData.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Belum ada transaksi di bulan ini.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-gray-50 font-bold text-gray-900 border-t border-gray-200">
              <tr>
                <td className="px-6 py-4 text-right">Total Bulan Ini:</td>
                <td className="px-6 py-4 text-right text-blue-600">{formatRupiah(totalOmset)}</td>
                <td className="px-6 py-4 text-right text-red-600">{formatRupiah(totalPengeluaran)}</td>
                <td className={`px-6 py-4 text-right ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatRupiah(saldo)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-[0_8px_0_0_#e5e7eb] border-2 border-gray-100 w-full max-w-md overflow-hidden my-8 transform transition-all">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">Catat Harian</h3>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              {/* Bagian Omset */}
              <div className="p-4 border border-blue-100 bg-blue-50/50 rounded-xl space-y-4">
                <h4 className="font-semibold text-blue-800">Pemasukan / Omset</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Omset (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={omsetAmount}
                    onChange={(e) => setOmsetAmount(e.target.value)}
                    placeholder="0"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan Omset</label>
                  <input
                    type="text"
                    value={omsetDescription}
                    onChange={(e) => setOmsetDescription(capitalizeWords(e.target.value))}
                    placeholder="Penjualan hari ini"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Toggle Pengeluaran */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasExpense"
                  checked={hasExpense}
                  onChange={(e) => setHasExpense(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="hasExpense" className="text-sm font-medium text-gray-700">
                  Ada Pengeluaran Hari Ini?
                </label>
              </div>

              {/* Bagian Pengeluaran */}
              {hasExpense && (
                <div className="p-4 border border-red-100 bg-red-50/50 rounded-xl space-y-4">
                  <h4 className="font-semibold text-red-800">Pengeluaran</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Pengeluaran</label>
                    <select
                      value={selectedDebtId}
                      onChange={(e) => handleDebtSelection(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:ring-4 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                    >
                      <option value="">Pengeluaran Lainnya</option>
                      <optgroup label="Bayar Hutang PT/CV">
                        {activeDebts.map(d => (
                          <option key={d.id} value={d.id}>
                            {d.ptName} - Sisa: {formatRupiah(d.remainingAmount)}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  {selectedDebtId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status Pembayaran</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="paymentType"
                            checked={paymentType === 'lunas'}
                            onChange={() => handlePaymentTypeChange('lunas')}
                            className="text-red-600 focus:ring-red-500"
                          />
                          <span className="text-sm">Lunas</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="paymentType"
                            checked={paymentType === 'cicil'}
                            onChange={() => handlePaymentTypeChange('cicil')}
                            className="text-red-600 focus:ring-red-500"
                          />
                          <span className="text-sm">Cicil</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {!selectedDebtId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan Pengeluaran</label>
                      <input
                        type="text"
                        value={expenseDescription}
                        onChange={(e) => setExpenseDescription(capitalizeWords(e.target.value))}
                        placeholder="Beli perlengkapan"
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:ring-4 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Pengeluaran (Rp)</label>
                    <input
                      type="number"
                      min="1"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      placeholder="0"
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:ring-4 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-5 py-2.5 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all shadow-[0_4px_0_0_#d1d5db] active:shadow-none active:translate-y-1"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-bold text-white bg-blue-500 hover:bg-blue-400 rounded-xl transition-all shadow-[0_4px_0_0_#1d4ed8] active:shadow-none active:translate-y-1"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
