
import React from 'react';
import { Trip, Company } from '../types';

interface TripDetailsScreenProps {
  trip: Trip;
  company: Company;
  onProceed: () => void;
}

const TripDetailsScreen: React.FC<TripDetailsScreenProps> = ({ trip, company, onProceed }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-50 shadow-sm relative overflow-hidden">
        <div className="absolute -right-6 -top-6 opacity-5 rotate-12"><i className="fas fa-bus text-9xl"></i></div>
        
        <div className="flex items-center gap-5 mb-8">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center p-3">
            <img src={company.logo} className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 leading-tight">{company.name}</h2>
            <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-black uppercase tracking-tighter">درجة: {trip.busType}</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded font-black uppercase tracking-tighter">مؤكد</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-3xl p-6 space-y-5 border border-slate-100">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">خط السير</span>
            <span className="font-black text-slate-800 text-sm">{trip.from} <i className="fas fa-long-arrow-alt-left mx-2 text-slate-300"></i> {trip.to}</span>
          </div>
          <div className="h-[1px] bg-slate-200/50"></div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">التاريخ والوقت</span>
            <span className="font-black text-slate-800 text-sm">{trip.date} • {trip.time}</span>
          </div>
          <div className="h-[1px] bg-slate-200/50"></div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">سعر التذكرة</span>
            <span className="font-black text-blue-800 text-xl tracking-tighter">{trip.price} <span className="text-xs uppercase">ج.م</span></span>
          </div>
        </div>

        {trip.officialBookingUrl && (
          <div className="mt-6">
            <a 
              href={trip.officialBookingUrl} 
              target="_blank" 
              className="flex items-center justify-center gap-2 w-full py-3 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black hover:bg-slate-200 transition-all border border-slate-200"
            >
              <i className="fas fa-external-link-alt"></i>
              فتح صفحة الحجز الرسمية لشركة {company.name}
            </a>
          </div>
        )}
      </div>

      <button 
        onClick={onProceed}
        className="w-full bg-blue-700 text-white font-black py-5 rounded-[2rem] shadow-2xl hover:bg-blue-800 active:scale-95 transition-all flex items-center justify-center gap-3"
      >
        حجز عبر سفريات (فودافون كاش)
        <i className="fas fa-chevron-left text-xs"></i>
      </button>
    </div>
  );
};

export default TripDetailsScreen;
