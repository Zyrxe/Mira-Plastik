import React, { useState } from 'react';
import { useAppStore } from '../store';
import { formatRupiah, capitalizeWords } from '../lib/utils';
import { Search, Plus, Trash2, PackageMinus } from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export default function BarangExpired() {
  const { items, expiredItems, addExpiredItem, deleteExpiredItem } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form states
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('Pcs');
  const [buyPrice, setBuyPrice] = useState('');
  const [notes, setNotes] = useState('');

  const filteredItems = expiredItems.filter(item => 
    item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.notes.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setItemName('');
    setQuantity('');
    setUnit('Pcs');
    setBuyPrice('');
    setNotes('');
    setShowModal(true);
  };

  const handleItemNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = capitalizeWords(e.target.value);
    setItemName(val);
    
    // Try to auto-fill unit and buyPrice if it matches an existing item
    const foundItem = items.find(i => i.name.toLowerCase() === val.toLowerCase());
    if (foundItem) {
      setUnit(foundItem.unit);
      setBuyPrice(foundItem.buyPrice.toString());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const numQuantity = parseFloat(quantity);
    const numBuyPrice = parseFloat(buyPrice);

    if (isNaN(numQuantity) || isNaN(numBuyPrice)) return;

    addExpiredItem({
      id: crypto.randomUUID(),
      date,
      itemName,
      quantity: numQuantity,
      unit,
      buyPrice: numBuyPrice,
      totalLoss: numQuantity * numBuyPrice,
      notes,
      createdAt: new Date().toISOString(),
    });

    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      deleteExpiredItem(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Barang Expired / Rusak</h1>
          <p className="text-gray-500">Catat barang yang kadaluarsa atau rusak untuk perhitungan kerugian.</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="bg-red-500 hover:bg-red-400 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-[0_4px_0_0_#b91c1c] active:shadow-none active:translate-y-1 flex items-center gap-2 whitespace-nowrap"
        >
          <Plus className="w-5 h-5" /> Tambah Data
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_8px_0_0_#e5e7eb] border-2 border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari nama barang atau keterangan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Nama Barang</th>
                <th className="px-6 py-4 text-right">Jumlah</th>
                <th className="px-6 py-4 text-right">Harga Beli</th>
                <th className="px-6 py-4 text-right">Total Kerugian</th>
                <th className="px-6 py-4">Keterangan</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-500">
                    {format(new Date(item.date), 'dd MMM yyyy', { locale: localeId })}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{item.itemName}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-medium text-gray-900">{item.quantity}</span>
                    <span className="text-gray-500 ml-1">{item.unit}</span>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500">{formatRupiah(item.buyPrice)}</td>
                  <td className="px-6 py-4 text-right font-medium text-red-600">{formatRupiah(item.totalLoss)}</td>
                  <td className="px-6 py-4 text-gray-500">{item.notes || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-[0_4px_0_0_#e5e7eb] active:shadow-none active:translate-y-1 border-2 border-gray-100"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    {searchQuery ? 'Data tidak ditemukan.' : 'Belum ada data barang expired/rusak.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-[0_8px_0_0_#e5e7eb] border-2 border-gray-100 w-full max-w-md overflow-hidden transform transition-all">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <PackageMinus className="w-5 h-5 text-red-600" />
                Tambah Barang Expired
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Barang</label>
                <input
                  type="text"
                  required
                  list="existing-items"
                  value={itemName}
                  onChange={handleItemNameChange}
                  placeholder="Contoh: Susu Kotak"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:ring-4 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                />
                <datalist id="existing-items">
                  {items.map(item => (
                    <option key={item.id} value={item.name} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="any"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:ring-4 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Satuan</label>
                  <select
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:ring-4 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                  >
                    <option value="Pcs">Pcs</option>
                    <option value="Tali">Tali</option>
                    <option value="Pack">Pack</option>
                    <option value="Kg">Kg</option>
                    <option value="Kardus">Kardus</option>
                    <option value="Ball">Ball</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga Beli (Per Satuan)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  placeholder="0"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:ring-4 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan (Opsional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(capitalizeWords(e.target.value))}
                  placeholder="Contoh: Expired bulan ini"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:ring-4 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
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
                  className="px-5 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-400 rounded-xl transition-all shadow-[0_4px_0_0_#b91c1c] active:shadow-none active:translate-y-1"
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
