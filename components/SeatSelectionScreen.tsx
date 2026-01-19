
import React, { useState } from 'react';
import { Trip, Company } from '../types';

interface SeatSelectionScreenProps {
  trip: Trip;
  company: Company;
  onConfirm: (seat: number) => void;
}

const SeatSelectionScreen: React.FC<SeatSelectionScreenProps> = ({ trip, onConfirm }) => {
  const [selected, setSelected] = useState<number | null>(null);

  const rows = Math.ceil(trip.totalSeats / 4);
  const seats = Array.from({ length: trip.totalSeats }, (_, i) => i + 1);

  return (
    <div className="flex flex-col h-[70vh]">
      <div className="flex justify-center gap-6 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-200 border"></div>
          <span>متاح</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-600"></div>
          <span>محدد</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-100"></div>
          <span>محجوز</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-100 p-8 rounded-3xl border-4 border-gray-200 relative">
        {/* Driver Seat Icon */}
        <div className="absolute top-4 left-8 text-gray-400">
           <i className="fas fa-life-ring text-2xl rotate-45"></i>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-12 max-w-[240px] mx-auto">
          {seats.map((num) => {
            const isAvailable = trip.availableSeats.includes(num);
            const isSelected = selected === num;
            const isAisle = (num % 4 === 2); // Simple aisle logic after 2nd seat in row

            return (
              <React.Fragment key={num}>
                <button
                  disabled={!isAvailable}
                  onClick={() => setSelected(num)}
                  className={`
                    h-12 w-10 rounded-lg flex items-center justify-center text-xs font-bold transition
                    ${isAvailable ? (isSelected ? 'bg-blue-600 text-white shadow-inner scale-110' : 'bg-white border text-gray-700') : 'bg-gray-300 text-gray-400 cursor-not-allowed opacity-50'}
                  `}
                >
                  {num}
                </button>
                {isAisle && <div className="w-4"></div>}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="mt-6 sticky bottom-0 bg-white pt-4">
        {selected && (
          <div className="bg-blue-50 p-3 rounded-lg mb-4 text-center text-blue-800 font-bold border border-blue-200">
             تم اختيار المقعد رقم {selected}
          </div>
        )}
        <button 
          disabled={!selected}
          onClick={() => selected && onConfirm(selected)}
          className="w-full bg-blue-600 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl shadow-lg"
        >
          تأكيد وحجز
        </button>
      </div>
    </div>
  );
};

export default SeatSelectionScreen;
