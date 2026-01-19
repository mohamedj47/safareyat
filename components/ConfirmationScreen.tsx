
import React from 'react';
import { Booking, Trip, Company } from '../types';

interface ConfirmationScreenProps {
  booking: Booking;
  trip: Trip;
  company: Company;
  onDone: () => void;
}

const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({ booking, trip, company, onDone }) => {
  return (
    <div className="text-center py-6">
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <i className="fas fa-check text-4xl"></i>
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-2">تم الحجز بنجاح!</h2>
      <p className="text-gray-500 mb-8">رقم العملية: {booking.id.split('_')[1]}</p>

      <div className="bg-white border-2 border-dashed border-gray-200 p-6 rounded-2xl text-right mb-8">
        <div className="flex justify-between items-center mb-6">
            <img src={company.logo} className="w-12 h-12 rounded" />
            <div className="text-xs text-gray-400">تذكرة سفر إلكترونية</div>
        </div>

        <div className="grid grid-cols-2 gap-y-4 text-sm">
          <div>
            <div className="text-gray-400">الشركة</div>
            <div className="font-bold text-blue-700">{company.name}</div>
          </div>
          <div>
            <div className="text-gray-400">رقم المقعد</div>
            <div className="font-bold text-red-600">{booking.seatNumber}</div>
          </div>
          <div>
            <div className="text-gray-400">التحرك من</div>
            <div className="font-bold">{trip.from}</div>
          </div>
          <div>
            <div className="text-gray-400">الوجهة</div>
            <div className="font-bold">{trip.to}</div>
          </div>
          <div>
            <div className="text-gray-400">التاريخ</div>
            <div className="font-bold">{trip.date}</div>
          </div>
          <div>
            <div className="text-gray-400">الوقت</div>
            <div className="font-bold">{trip.time}</div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t flex items-center justify-center">
            <div className="bg-gray-100 p-2 rounded">
                 <i className="fas fa-qrcode text-6xl opacity-50"></i>
            </div>
        </div>
      </div>

      <button 
        onClick={onDone}
        className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg"
      >
        العودة للرئيسية
      </button>
    </div>
  );
};

export default ConfirmationScreen;
