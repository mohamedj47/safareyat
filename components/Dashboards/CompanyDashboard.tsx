
import React, { useState } from 'react';
import { Trip, Company, Booking, Province } from '../../types';

interface CompanyDashboardProps {
  trips: Trip[];
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
  company: Company;
  bookings: Booking[];
  provinces: Province[];
}

const CompanyDashboard: React.FC<CompanyDashboardProps> = ({ trips, setTrips, company, bookings, provinces }) => {
  const [showAddTrip, setShowAddTrip] = useState(false);
  const [newTrip, setNewTrip] = useState<Partial<Trip>>({
    from: '',
    to: '',
    price: 0,
    time: '12:00 PM',
    busType: 'Ordinary',
    totalSeats: 48,
    availableSeats: Array.from({ length: 48 }, (_, i) => i + 1)
  });

  const companyTrips = trips.filter(t => t.companyId === company.id);
  const companyBookings = bookings.filter(b => companyTrips.some(t => t.id === b.tripId));

  const handleAddTrip = () => {
    if (newTrip.from && newTrip.to && newTrip.price) {
      // Added missing mandatory properties as required by the Trip interface
      const tripToAdd: Trip = {
        ...newTrip as Trip,
        id: `t_${Date.now()}`,
        companyId: company.id,
        date: new Date().toISOString().split('T')[0],
        availableSeats: Array.from({ length: newTrip.totalSeats || 48 }, (_, i) => i + 1),
        lastInventorySync: Date.now(),
        dataSource: 'OFFICIAL_PARTNER'
      };
      setTrips(prev => [...prev, tripToAdd]);
      setShowAddTrip(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
              <img src={company.logo} className="w-12 h-12 rounded border" />
              <div>
                  <h3 className="font-bold">{company.name}</h3>
                  <p className="text-xs text-gray-500">لوحة تحكم الشركة</p>
              </div>
          </div>
          <button 
            onClick={() => setShowAddTrip(!showAddTrip)}
            className="bg-blue-600 text-white text-xs px-3 py-2 rounded-lg font-bold"
          >
            {showAddTrip ? 'إغلاق' : '+ إضافة رحلة'}
          </button>
      </div>

      {showAddTrip && (
        <div className="bg-gray-50 p-4 rounded-2xl border-2 border-blue-100 space-y-4">
           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">من</label>
                <select 
                   className="w-full p-2 bg-white border rounded"
                   onChange={(e) => setNewTrip({...newTrip, from: e.target.value})}
                >
                    <option value="">اختر</option>
                    {provinces.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">إلى</label>
                <select 
                   className="w-full p-2 bg-white border rounded"
                   onChange={(e) => setNewTrip({...newTrip, to: e.target.value})}
                >
                    <option value="">اختر</option>
                    {provinces.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              </div>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">السعر (ج.م)</label>
                <input 
                    type="number" 
                    className="w-full p-2 bg-white border rounded" 
                    onChange={(e) => setNewTrip({...newTrip, price: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">النوع</label>
                <select 
                   className="w-full p-2 bg-white border rounded"
                   onChange={(e) => setNewTrip({...newTrip, busType: e.target.value as any})}
                >
                    <option value="Ordinary">عادي</option>
                    <option value="A/C">مكيف</option>
                    <option value="VIP">VIP</option>
                </select>
              </div>
           </div>
           <button 
              onClick={handleAddTrip}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold"
           >
              نشر الرحلة الآن
           </button>
        </div>
      )}

      <div className="space-y-4">
          <h4 className="font-bold border-r-4 border-blue-600 pr-3">الرحلات الحالية ({companyTrips.length})</h4>
          {companyTrips.length === 0 ? (
              <div className="p-10 text-center bg-white border rounded-2xl text-gray-400">لا توجد رحلات مضافة بعد</div>
          ) : (
              companyTrips.map(t => (
                  <div key={t.id} className="bg-white border rounded-xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-bold text-sm">{t.from} ➔ {t.to}</div>
                        <div className="text-blue-600 font-bold text-sm">{t.price} ج.م</div>
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                         <div className="flex gap-2">
                            <span><i className="fas fa-clock"></i> {t.time}</span>
                            <span><i className="fas fa-user"></i> {t.availableSeats.length} متاح</span>
                         </div>
                         <button className="text-red-500 font-bold">إلغاء</button>
                      </div>
                  </div>
              ))
          )}
      </div>

      <div className="space-y-4">
          <h4 className="font-bold border-r-4 border-green-600 pr-3">أحدث الحجوزات لديك</h4>
          {companyBookings.length === 0 ? (
              <div className="p-10 text-center bg-white border rounded-2xl text-gray-400 italic text-sm">لم يقم أحد بالحجز بعد</div>
          ) : (
              <div className="bg-white border rounded-2xl overflow-hidden divide-y">
                  {companyBookings.map(b => (
                      <div key={b.id} className="p-4 flex justify-between items-center text-sm">
                         <div>
                            <div className="font-bold">مقعد {b.seatNumber}</div>
                            <div className="text-xs text-gray-400">كود: {b.id.split('_')[1]}</div>
                         </div>
                         <div className="text-green-600 font-bold">{b.ticketPrice} ج.م</div>
                      </div>
                  ))}
              </div>
          )}
      </div>
    </div>
  );
};

export default CompanyDashboard;