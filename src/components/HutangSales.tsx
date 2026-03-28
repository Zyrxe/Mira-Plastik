import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { formatRupiah, capitalizeWords } from '../lib/utils';
import { PaymentTerm } from '../types';
import { format, addWeeks, addMonths } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

const calculateDueDate = (arrivalDate: string, term: PaymentTerm) => {
  const date = new Date(arrivalDate);
  switch (term) {
    case '1_week': return addWeeks(date, 1).toISOString();
    case '2_weeks': return addWeeks(date, 2).toISOString();
    case '3_weeks': return addWeeks(date, 3).toISOString();
    case '1_month': return addMonths(date, 1).toISOString();
    default: return date.toISOString();
  }
};

export default function HutangSales() {
  const { debts, addDebt, transactions } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  // Form states
  const [ptName, setPtName] = useState('');
  const [amount, setAmount] = useState('');
  const [arrivalDate, setArrivalDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [term, setTerm] = useState<PaymentTerm>('1_week');

  const { filteredDebts, totalHutang, totalSisaHutang } = useMemo(() => {
    const filtered = debts.filter(d => {
      try {
        return format(new Date(d.arrivalDate), 'yyyy-MM') === selectedMonth;
      } catch {
        return false;
      }
    });
    
    const tHutang = filtered.reduce((sum, d) => sum + d.totalAmount, 0);
    const tSisa = filtered.reduce((sum, d) => sum + d.remainingAmount, 0);
    
    return { filteredDebts: filtered, totalHutang: tHutang, totalSisaHutang: tSisa };
  }, [debts, selectedMonth]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    const dueDate = calculateDueDate(arrivalDate, term);

    addDebt({
      id: crypto.randomUUID(),
      ptName,
      totalAmount: numAmount,
      remainingAmount: numAmount,
      arrivalDate: new Date(arrivalDate).toISOString(),
      term,
      dueDate,
      status: 'unpaid',
      createdAt: new Date().toISOString(),
    });

    setShowModal(false);
    setPtName('');
    setAmount('');
    setTerm('1_week');
  };

  const getTermLabel = (t: PaymentTerm) => {
    switch (t) {
      case '1_week': return '1 Minggu';
      case '2_weeks': return '2 Minggu';
      case '3_weeks': return '3 Minggu';
      case '1_month': return '1 Bulan';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hutang Sales (PT/CV)</h1>
          <p className="text-gray-500">Kelola hutang barang datang dari supplier.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none w-full sm:w-auto"
          />
          <button
            onClick={() => setShowModal(true)}
            className="bg-orange-500 hover:bg-orange-400 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-[0_4px_0_0_#c2410c] active:shadow-none active:translate-y-1 whitespace-nowrap"
          >
            + Tambah Hutang Baru
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_8px_0_0_#e5e7eb] border-2 border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">PT / CV</th>
                <th className="px-6 py-4">Tgl Datang</th>
                <th className="px-6 py-4">Jatuh Tempo</th>
                <th className="px-6 py-4">Termin</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Total Hutang</th>
                <th className="px-6 py-4 text-right">Sisa Hutang</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDebts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(d => {
                const payments = transactions.filter(t => t.debtId === d.id);
                return (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{d.ptName}</td>
                  <td className="px-6 py-4">
                    <div className="group cursor-pointer inline-block relative">
                      <div className="font-medium text-gray-900 whitespace-nowrap inline-flex items-center gap-2">
                        <span className="border-b border-dashed border-gray-400">
                          {format(new Date(d.arrivalDate), 'dd MMM yyyy', { locale: localeId })}
                        </span>
                        <span className="text-[10px] text-gray-400 group-hover:text-orange-500 transition-colors">
                          (Riwayat)
                        </span>
                      </div>
                      
                      <div className="hidden group-hover:block absolute z-10 left-0 mt-2 p-3 bg-white rounded-xl border-2 border-gray-100 shadow-[0_8px_0_0_#e5e7eb] min-w-[250px] whitespace-normal">
                        <p className="text-xs font-semibold text-gray-700 mb-2 border-b border-gray-100 pb-1">Riwayat Pembayaran:</p>
                        {payments.length > 0 ? (
                          <div className="space-y-2 text-xs">
                            {payments.map((p, idx) => (
                              <div key={idx} className="flex justify-between items-start gap-4 border-b border-gray-50 pb-1 last:border-0">
                                <div>
                                  <div className="font-medium text-gray-900">{format(new Date(p.date), 'dd MMM yyyy', { locale: localeId })}</div>
                                  <div className="text-gray-500 capitalize">{p.paymentType || 'Cicil'}</div>
                                </div>
                                <div className="font-medium text-green-600">
                                  {formatRupiah(p.amount)}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500 italic">Belum ada pembayaran</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-orange-600 font-medium">{format(new Date(d.dueDate), 'dd MMM yyyy', { locale: localeId })}</td>
                  <td className="px-6 py-4">{getTermLabel(d.term)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      d.status === 'paid' ? 'bg-green-100 text-green-800' :
                      d.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {d.status === 'paid' ? 'Lunas' : d.status === 'partial' ? 'Dicicil' : 'Belum Dibayar'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">{formatRupiah(d.totalAmount)}</td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">{formatRupiah(d.remainingAmount)}</td>
                </tr>
              )})}
              {filteredDebts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Belum ada data hutang di bulan ini.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-gray-50 font-bold text-gray-900 border-t border-gray-200">
              <tr>
                <td colSpan={5} className="px-6 py-4 text-right">Total Keseluruhan Bulan Ini:</td>
                <td className="px-6 py-4 text-right">{formatRupiah(totalHutang)}</td>
                <td className="px-6 py-4 text-right text-orange-600">{formatRupiah(totalSisaHutang)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-[0_8px_0_0_#e5e7eb] border-2 border-gray-100 w-full max-w-md overflow-hidden transform transition-all">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Tambah Hutang Sales</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama PT / CV</label>
                <input
                  type="text"
                  required
                  value={ptName}
                  onChange={(e) => setPtName(capitalizeWords(e.target.value))}
                  placeholder="Contoh: PT. Sumber Makmur"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Datang Barang</label>
                <input
                  type="date"
                  required
                  value={arrivalDate}
                  onChange={(e) => setArrivalDate(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Termin Pembayaran</label>
                <select
                  value={term}
                  onChange={(e) => setTerm(e.target.value as PaymentTerm)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                >
                  <option value="1_week">1 Minggu</option>
                  <option value="2_weeks">2 Minggu</option>
                  <option value="3_weeks">3 Minggu</option>
                  <option value="1_month">1 Bulan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Hutang (Rp)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all shadow-[0_4px_0_0_#d1d5db] active:shadow-none active:translate-y-1"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-bold text-white bg-orange-500 hover:bg-orange-400 rounded-xl transition-all shadow-[0_4px_0_0_#c2410c] active:shadow-none active:translate-y-1"
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
