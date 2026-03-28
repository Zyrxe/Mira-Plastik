import React, { useState } from 'react';
import { useAppStore } from '../store';
import { formatRupiah, capitalizeWords } from '../lib/utils';
import { Item } from '../types';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';

export default function DataBarang() {
  const { items, addItem, updateItem, deleteItem } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  
  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [itemCategory, setItemCategory] = useState('');
  const [unit, setUnit] = useState('Pcs');
  const [buyPrice, setBuyPrice] = useState('');
  const [sellPrice, setSellPrice] = useState('');

  const harianItems = items.filter(item => item.category === 'harian');
  const existingCategories = Array.from(new Set(harianItems.map(i => i.itemCategory).filter(Boolean)));

  const filteredItems = harianItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.itemCategory && item.itemCategory.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategoryFilter ? item.itemCategory === selectedCategoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  const handleOpenModal = (item?: Item) => {
    if (item) {
      setEditingId(item.id);
      setName(item.name);
      setItemCategory(item.itemCategory || '');
      setUnit(item.unit);
      setBuyPrice(item.buyPrice.toString());
      setSellPrice((item.sellPrice || 0).toString());
    } else {
      setEditingId(null);
      setName('');
      setItemCategory(selectedCategoryFilter || '');
      setUnit('Pcs');
      setBuyPrice('');
      setSellPrice('');
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const numBuyPrice = parseFloat(buyPrice);
    const numSellPrice = parseFloat(sellPrice);

    if (isNaN(numBuyPrice) || isNaN(numSellPrice)) return;

    if (editingId) {
      updateItem(editingId, {
        name,
        itemCategory,
        unit,
        buyPrice: numBuyPrice,
        sellPrice: numSellPrice,
      });
    } else {
      addItem({
        id: crypto.randomUUID(),
        name,
        itemCategory,
        unit,
        buyPrice: numBuyPrice,
        sellPrice: numSellPrice,
        category: 'harian',
        createdAt: new Date().toISOString(),
      });
    }

    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus barang ini?')) {
      deleteItem(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Barang</h1>
          <p className="text-gray-500">Kelola daftar barang, stok, dan harga.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-500 hover:bg-blue-400 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-[0_4px_0_0_#1d4ed8] active:shadow-none active:translate-y-1 flex items-center gap-2 whitespace-nowrap"
        >
          <Plus className="w-5 h-5" /> Tambah Barang
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_8px_0_0_#e5e7eb] border-2 border-gray-100 overflow-hidden mb-4">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari nama atau kategori barang..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          {existingCategories.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-4">
              <button
                onClick={() => setSelectedCategoryFilter(null)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${!selectedCategoryFilter ? 'bg-blue-500 text-white shadow-[0_4px_0_0_#1d4ed8] active:shadow-none active:translate-y-1' : 'bg-white border-2 border-gray-200 text-gray-600 hover:bg-gray-50 shadow-[0_4px_0_0_#e5e7eb] active:shadow-none active:translate-y-1'}`}
              >
                Semua
              </button>
              {existingCategories.map((cat) => (
                <button
                  key={cat as string}
                  onClick={() => setSelectedCategoryFilter(cat as string)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedCategoryFilter === cat ? 'bg-blue-500 text-white shadow-[0_4px_0_0_#1d4ed8] active:shadow-none active:translate-y-1' : 'bg-white border-2 border-gray-200 text-gray-600 hover:bg-gray-50 shadow-[0_4px_0_0_#e5e7eb] active:shadow-none active:translate-y-1'}`}
                >
                  {cat as string}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Nama Barang</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Satuan</th>
                <th className="px-6 py-4 text-right">Harga Beli</th>
                <th className="px-6 py-4 text-right">Harga Jual</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.sort((a, b) => a.name.localeCompare(b.name)).map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {item.itemCategory ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-600">
                        {item.itemCategory}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{item.unit}</td>
                  <td className="px-6 py-4 text-right">{formatRupiah(item.buyPrice)}</td>
                  <td className="px-6 py-4 text-right font-medium text-green-600">{formatRupiah(item.sellPrice || 0)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenModal(item)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all shadow-[0_4px_0_0_#e5e7eb] active:shadow-none active:translate-y-1 border-2 border-gray-100"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
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
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    {searchQuery ? 'Barang tidak ditemukan.' : 'Belum ada data barang harian. Silakan tambah barang baru.'}
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
              <h3 className="text-lg font-bold text-gray-900">
                {editingId ? 'Edit Barang' : 'Tambah Barang Harian'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Barang</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(capitalizeWords(e.target.value))}
                  placeholder="Contoh: Beras 5kg"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <input
                    type="text"
                    list="harian-categories"
                    value={itemCategory}
                    onChange={(e) => setItemCategory(capitalizeWords(e.target.value))}
                    placeholder="Contoh: Sembako..."
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                  <datalist id="harian-categories">
                    {existingCategories.map((cat, idx) => (
                      <option key={idx} value={cat as string} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Satuan</label>
                  <select
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga Beli (Modal)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  placeholder="0"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga Jual</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                  placeholder="0"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
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
