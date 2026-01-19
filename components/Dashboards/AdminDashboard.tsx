
import React, { useState } from 'react';
import { Company, Booking, Province } from '../../types';

interface AdminDashboardProps {
  companies: Company[];
  setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;
  bookings: Booking[];
  provinces: Province[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ companies, setCompanies, bookings, provinces }) => {
  const [tab, setTab] = useState<'COMPANIES' | 'REVENUE'>('COMPANIES');

  const totalCommission = bookings.reduce((acc, b) => acc + b.appFee, 0);

  return (
    <div className="space-y-6">
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
        <button 
          onClick={() => setTab('COMPANIES')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold ${tab === 'COMPANIES' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
        >
          إدارة الشركات
        </button>
        <button 
          onClick={() => setTab('REVENUE')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold ${tab === 'REVENUE' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
        >
          الأرباح
        </button>
      </div>

      {tab === 'COMPANIES' ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold">قائمة الشركات</h3>
            <button className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg">+ شركة جديدة</button>
          </div>
          {companies.map(c => (
            <div key={c.id} className="bg-white border rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={c.logo} className="w-10 h-10 rounded border" />
                <div>
                  <div className="font-bold text-sm">{c.name}</div>
                  <div className="text-xs text-gray-400">{c.provinces.length} محافظة</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <div className={`w-3 h-3 rounded-full ${c.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                 <button className="text-gray-400 hover:text-blue-600"><i className="fas fa-edit"></i></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
                <div className="text-xs text-blue-600 mb-1">إجمالي الحجوزات</div>
                <div className="text-2xl font-bold">{bookings.length}</div>
              </div>
              <div className="bg-green-50 border border-green-100 p-4 rounded-2xl">
                <div className="text-xs text-green-600 mb-1">إجمالي العمولات</div>
                <div className="text-2xl font-bold text-green-700">{totalCommission} ج.م</div>
              </div>
           </div>

           <div className="bg-white border rounded-2xl overflow-hidden">
              <h4 className="p-4 bg-gray-50 font-bold border-b text-sm">أحدث الحجوزات</h4>
              <div className="divide-y max-h-[300px] overflow-y-auto">
                {bookings.length === 0 ? (
                    <div className="p-10 text-center text-gray-400 italic">لا توجد حجوزات بعد</div>
                ) : (
                    bookings.map(b => (
                        <div key={b.id} className="p-3 text-xs flex justify-between items-center">
                           <div className="flex flex-col">
                             <span className="font-bold">{b.id}</span>
                             <span className="text-gray-400">{new Date(b.timestamp).toLocaleString('ar-EG')}</span>
                           </div>
                           <div className="font-bold text-green-600">+{b.appFee} ج.م</div>
                        </div>
                    ))
                )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
