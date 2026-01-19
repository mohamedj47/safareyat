
import React from 'react';

interface NavbarProps {
  currentScreen: string;
  goBack: () => void;
  onAdmin: () => void;
  onCompany: () => void;
  onHome: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentScreen, goBack, onAdmin, onCompany, onHome }) => {
  const getTitle = () => {
    switch (currentScreen) {
      case 'SEARCH': return 'سفريات - حجز أتوبيس';
      case 'RESULTS': return 'الرحلات المتاحة';
      case 'DETAILS': return 'تفاصيل الرحلة';
      case 'SEAT': return 'اختيار المقعد';
      case 'PAYMENT': return 'الدفع';
      case 'CONFIRMATION': return 'تم الحجز';
      case 'ADMIN': return 'لوحة التحكم (أدمن)';
      case 'COMPANY': return 'لوحة تحكم الشركة';
      default: return 'سفريات';
    }
  };

  return (
    <nav className="bg-blue-700 text-white p-4 sticky top-0 z-50 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-3">
        {currentScreen !== 'SEARCH' && (
          <button onClick={goBack} className="p-2 -mr-2">
            <i className="fas fa-arrow-right"></i>
          </button>
        )}
        <h1 className="text-lg font-bold">{getTitle()}</h1>
      </div>
      <div className="flex gap-4">
         <i className="fas fa-headset text-xl"></i>
      </div>
    </nav>
  );
};

export default Navbar;
