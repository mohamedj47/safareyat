
import React, { useState } from 'react';
// Fix: Import Trip type from types.ts instead of constants.tsx
import { Trip } from '../types';
import { SERVICE_FEE, VODAFONE_CASH_NUMBER } from '../constants';

interface PaymentScreenProps {
  trip: Trip;
  onSuccess: () => void;
}

const PaymentScreen: React.FC<PaymentScreenProps> = ({ trip, onSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDone = () => {
    setIsProcessing(true);
    // محاكاة تأكيد الدفع
    setTimeout(() => {
      onSuccess();
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm text-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-shield-alt text-2xl"></i>
        </div>
        <h2 className="text-xl font-black text-gray-900 mb-2">تأكيد حجز المقعد</h2>
        <p className="text-gray-500 text-xs leading-relaxed px-4">
            سيتم تحويلك الآن لموقع شركة <span className="text-blue-600 font-bold">{trip.companyId === 'c2' ? 'سوبر جيت' : ''}</span> الرسمي لإتمام الحجز.
        </p>

        <div className="my-6 bg-gray-50 rounded-3xl p-5 border border-dashed border-gray-200">
           <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-400 font-bold">رسوم الخدمة والتحويل</span>
              <span className="text-lg font-black text-blue-700">{SERVICE_FEE} ج.م</span>
           </div>
           <p className="text-[10px] text-gray-400 text-right leading-relaxed">
              * هذه الرسوم مقابل توفير البيانات اللحظية وضمان مكان الحجز، ولا تُخصم من ثمن التذكرة.
           </p>
        </div>

        <div className="bg-red-600 rounded-3xl p-6 text-white text-right relative overflow-hidden shadow-xl">
           <div className="absolute left-0 top-0 opacity-10 -translate-x-4 -translate-y-4">
              <i className="fas fa-wallet text-8xl"></i>
           </div>
           <h4 className="font-black mb-3 flex items-center gap-2">
              <i className="fas fa-mobile-alt"></i>
              فودافون كاش
           </h4>
           <p className="text-xs opacity-80 mb-4">حول رسوم الخدمة (5 ج.م) للرقم التالي:</p>
           <div className="bg-white/10 p-4 rounded-2xl flex items-center justify-between border border-white/20">
              <span className="text-2xl font-black tracking-tighter">{VODAFONE_CASH_NUMBER}</span>
              <button className="bg-white/20 p-2 rounded-lg hover:bg-white/30"><i className="fas fa-copy"></i></button>
           </div>
        </div>
      </div>

      <div className="space-y-3">
        <button 
          onClick={handleDone}
          disabled={isProcessing}
          className="w-full bg-blue-700 text-white font-black py-5 rounded-[2rem] shadow-2xl hover:bg-blue-800 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
        >
          {isProcessing ? 'جاري التحويل...' : 'تم التحويل.. افتح صفحة الحجز'}
          <i className="fas fa-external-link-alt text-xs"></i>
        </button>
        <p className="text-[9px] text-center text-gray-400 font-bold uppercase tracking-widest">
            Redirecting to Official Company System
        </p>
      </div>
    </div>
  );
};

export default PaymentScreen;
