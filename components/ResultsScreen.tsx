
import React from 'react';
import { Trip } from '../types';
import { INITIAL_COMPANIES } from '../constants';

interface ResultsScreenProps {
  params: { from: string; to: string; date: string; fromStationId: string; toStationId: string };
  trips: Trip[];
  status: 'IDLE' | 'SEARCHING' | 'SUCCESS' | 'EMPTY' | 'ERROR';
  onRetry: () => void;
  onSelect: (trip: Trip) => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ params, trips, status, onRetry, onSelect }) => {
  const isLoading = status === 'SEARCHING';

  return (
    <div className="space-y-6 animate-fadeIn pb-24">
      {/* Route Badge */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-10">
          <i className="fas fa-route text-8xl"></i>
        </div>
        <div className="flex items-center justify-between gap-4 relative z-10">
            <div className="text-right flex-1">
                <p className="text-[10px] text-blue-200 font-bold uppercase mb-1">قيام</p>
                <h3 className="text-lg font-black truncate">{params.from}</h3>
            </div>
            <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-xs">
                    <i className="fas fa-arrow-left"></i>
                </div>
            </div>
            <div className="text-left flex-1">
                <p className="text-[10px] text-blue-200 font-bold uppercase mb-1">وصول</p>
                <h3 className="text-lg font-black truncate">{params.to}</h3>
            </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-[10px] font-bold">
            <span className="bg-white/10 px-3 py-1 rounded-full"><i className="far fa-calendar-alt ml-1"></i> {params.date}</span>
            <span className="text-blue-100 uppercase tracking-widest">{trips.length} رحلة متاحة</span>
        </div>
      </div>

      {isLoading && (
        <div className="py-16 text-center space-y-6">
           <div className="relative inline-block">
              <div className="w-16 h-16 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <i className="fas fa-bolt text-blue-600 animate-pulse"></i>
              </div>
           </div>
           <div className="space-y-2">
              <h4 className="text-slate-900 font-black">جاري سحب البيانات...</h4>
              <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Connected to Live Transports API</p>
           </div>
        </div>
      )}

      {status === 'SUCCESS' && trips.length > 0 && (
        <div className="space-y-4">
          {trips.map(trip => {
            const company = INITIAL_COMPANIES.find(c => c.id === trip.companyId) || INITIAL_COMPANIES[0];
            return (
              <div key={trip.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-4 relative overflow-hidden group">
                {trip.remainingSeats < 5 && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-black px-3 py-1 rounded-bl-xl z-10 animate-pulse">
                    متبقي {trip.remainingSeats} مقاعد فقط!
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center p-2">
                        <img src={company.logo} className="w-full h-full object-contain" alt={company.name} />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800 text-xs">{company.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                           <span className="bg-amber-100 text-amber-700 text-[9px] px-2 py-0.5 rounded-md font-black">{trip.time}</span>
                           <span className="text-[9px] text-slate-400 font-bold">{trip.busType}</span>
                        </div>
                      </div>
                   </div>
                   <div className="text-left">
                      <div className="text-xl font-black text-blue-600 tracking-tighter">{trip.price} <span className="text-[9px] uppercase">EGP</span></div>
                      <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">سعر نهائي</p>
                   </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-emerald-500">
                        <i className="fas fa-check-double text-[10px]"></i>
                        <span className="text-[9px] font-black uppercase tracking-tighter">مؤكد من النظام الرسمي</span>
                    </div>
                    <button 
                      onClick={() => onSelect(trip)}
                      className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black text-[10px] hover:bg-blue-600 transition-all flex items-center gap-2 shadow-sm"
                    >
                      احجز الآن
                      <i className="fas fa-chevron-left text-[8px]"></i>
                    </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {status === 'EMPTY' && (
        <div className="py-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <i className="fas fa-bus-alt text-3xl"></i>
            </div>
            <h3 className="font-black text-slate-800 mb-2">لا يوجد رحلات حالياً</h3>
            <p className="text-slate-400 text-xs px-10">جرب تغيير التاريخ أو المحطة للبحث في المزيد من شركات النقل.</p>
            <button onClick={onRetry} className="mt-6 text-blue-600 font-black text-xs border-b border-blue-600 pb-1">إعادة المحاولة</button>
        </div>
      )}

      {status === 'ERROR' && (
        <div className="bg-red-50 text-red-700 p-8 rounded-3xl text-center border border-red-100">
           <i className="fas fa-wifi text-2xl mb-4"></i>
           <p className="font-bold text-xs mb-4 uppercase tracking-widest">Connection Failure</p>
           <button onClick={onRetry} className="bg-red-600 text-white px-8 py-2.5 rounded-xl font-black text-[10px] shadow-lg">إعادة الاتصال بالشبكة</button>
        </div>
      )}
    </div>
  );
};

export default ResultsScreen;
