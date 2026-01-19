
import React, { useState, useEffect } from 'react';
import { Province } from '../types';

interface SearchScreenProps {
  onSearch: (from: string, to: string, date: string, fromStationId: string, toStationId: string) => void;
  provinces: Province[];
}

const SearchScreen: React.FC<SearchScreenProps> = ({ onSearch, provinces }) => {
  // اختيار القاهرة كمدينة افتراضية من قائمة المحافظات المتاحة
  const defaultProvince = provinces.find(p => p.name === 'القاهرة') || provinces[0];
  
  const [fromCity, setFromCity] = useState(defaultProvince.name);
  const [toCity, setToCity] = useState('');
  const [fromStation, setFromStation] = useState(defaultProvince.stations?.[0]?.id || '');
  const [toStation, setToStation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const fromProvince = provinces.find(p => p.name === fromCity);
  const toProvince = provinces.find(p => p.name === toCity);

  // تحديث محطة القيام فور تغيير مدينة القيام
  useEffect(() => {
    if (fromProvince?.stations?.length) {
      setFromStation(fromProvince.stations[0].id);
    }
  }, [fromCity, provinces]);

  // تحديث محطة الوصول فور اختيار مدينة وصول
  useEffect(() => {
    if (toProvince?.stations?.length) {
      setToStation(toProvince.stations[0].id);
    }
  }, [toCity, provinces]);

  const handleSearch = () => {
    if (fromCity && toCity && date) {
      onSearch(fromCity, toCity, date, fromStation, toStation);
    } else {
      alert('يرجى اختيار وجهة الوصول وتاريخ السفر');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-blue-900/10">
        <div className="space-y-5">
          {/* قسم اختيار مدينة القيام */}
          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest italic">التحرك من</p>
            <div className="bg-slate-50 rounded-2xl p-4 border-2 border-transparent focus-within:border-blue-500 transition-all shadow-inner">
                <select 
                  value={fromCity}
                  onChange={(e) => setFromCity(e.target.value)}
                  className="w-full bg-transparent border-none text-sm font-black focus:ring-0 text-slate-800 cursor-pointer"
                >
                  {provinces.map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
                <div className="flex items-center gap-2 mt-1">
                  <i className="fas fa-map-marker-alt text-[10px] text-blue-500"></i>
                  <select 
                    value={fromStation}
                    onChange={(e) => setFromStation(e.target.value)}
                    className="flex-1 bg-transparent border-none text-[10px] font-bold text-blue-600 focus:ring-0 p-0"
                  >
                    {fromProvince?.stations?.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
            </div>
          </div>

          <div className="flex justify-center -my-6 relative z-10">
            <div className="bg-blue-600 text-white w-10 h-10 rounded-full shadow-lg flex items-center justify-center ring-4 ring-white">
              <i className="fas fa-exchange-alt rotate-90"></i>
            </div>
          </div>

          {/* قسم اختيار مدينة الوصول */}
          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest italic">التوجه إلى</p>
            <div className="bg-slate-50 rounded-2xl p-4 border-2 border-transparent focus-within:border-blue-500 transition-all shadow-inner">
                <select 
                  value={toCity}
                  onChange={(e) => setToCity(e.target.value)}
                  className="w-full bg-transparent border-none text-sm font-black focus:ring-0 text-slate-800 cursor-pointer"
                >
                  <option value="">اختر الوجهة</option>
                  {provinces.filter(p => p.name !== fromCity).map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
                {toCity && (
                  <div className="flex items-center gap-2 mt-1">
                    <i className="fas fa-map-pin text-[10px] text-emerald-500"></i>
                    <select 
                      value={toStation}
                      onChange={(e) => setToStation(e.target.value)}
                      className="flex-1 bg-transparent border-none text-[10px] font-bold text-emerald-600 focus:ring-0 p-0"
                    >
                      {toProvince?.stations?.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                )}
            </div>
          </div>

          <div className="pt-2">
            <p className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest mb-2 italic">تاريخ الرحلة</p>
            <div className="relative">
                <input 
                  type="date"
                  value={date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-black focus:ring-2 focus:ring-blue-500 text-slate-800 shadow-inner appearance-none"
                />
                <i className="far fa-calendar-alt absolute left-4 top-1/2 -translate-y-1/2 text-blue-300 pointer-events-none"></i>
            </div>
          </div>

          <button 
            onClick={handleSearch}
            className="w-full bg-blue-700 text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-blue-200 hover:bg-blue-800 transition active:scale-95 flex items-center justify-center gap-3 mt-4"
          >
            <span>عرض كل الرحلات المتاحة</span>
            <i className="fas fa-search text-sm"></i>
          </button>
        </div>
      </div>

      <div className="px-4 pb-10">
         <h3 className="font-black text-slate-800 text-[10px] mb-4 flex items-center gap-2 uppercase tracking-widest opacity-60">
            <i className="fas fa-check-circle text-emerald-500"></i>
            شركاء النقل المعتمدون
         </h3>
         <div className="grid grid-cols-5 gap-2">
            {['Superjet', 'Go Bus', 'We Bus', 'Blue Bus', 'HighJet'].map(brand => (
              <div key={brand} className="bg-white p-2 rounded-xl border border-slate-100 flex flex-col items-center gap-1 shadow-sm">
                  <div className="w-6 h-6 bg-blue-50 rounded flex items-center justify-center">
                    <i className="fas fa-bus text-blue-600 text-[10px]"></i>
                  </div>
                  <span className="text-[7px] font-black text-slate-500 truncate w-full text-center">{brand}</span>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default SearchScreen;
