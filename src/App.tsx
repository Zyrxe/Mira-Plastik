import React, { useState } from 'react';
import { LayoutDashboard, Wallet, ReceiptText, Package, Archive, ShoppingBag, PackageMinus } from 'lucide-react';
import Dashboard from './components/Dashboard';
import OmsetHarian from './components/OmsetHarian';
import HutangSales from './components/HutangSales';
import DataBarang from './components/DataBarang';
import ModalAwal from './components/ModalAwal';
import BarangExpired from './components/BarangExpired';
import { cn } from './lib/utils';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'omset' | 'hutang' | 'barang' | 'modal_awal' | 'expired'>('dashboard');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard Profit', icon: LayoutDashboard },
    { id: 'omset', label: 'Omset Harian', icon: Wallet },
    { id: 'hutang', label: 'Hutang Sales', icon: ReceiptText },
    { id: 'barang', label: 'Data Barang Harian', icon: Package },
    { id: 'modal_awal', label: 'Modal Pertama', icon: Archive },
    { id: 'expired', label: 'Barang Expired', icon: PackageMinus },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl shadow-sm">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Mira Plastik</h1>
            <p className="text-xs text-gray-500 mt-1">Manajemen Omset & Hutang</p>
          </div>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all",
                  isActive 
                    ? "bg-blue-100 text-blue-700 shadow-[0_4px_0_0_#93c5fd] border-2 border-blue-200 transform -translate-y-1" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-2 border-transparent hover:border-gray-100"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-blue-600" : "text-gray-400")} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'omset' && <OmsetHarian />}
          {activeTab === 'hutang' && <HutangSales />}
          {activeTab === 'barang' && <DataBarang />}
          {activeTab === 'modal_awal' && <ModalAwal />}
          {activeTab === 'expired' && <BarangExpired />}
        </div>
      </main>
    </div>
  );
}
