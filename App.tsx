
import React, { useState, useRef } from 'react';
import { Trip, Company } from './types';
import { PROVINCES, INITIAL_COMPANIES, BLUEBUS_ENDPOINTS, CITY_MAP_BLUEBUS } from './constants';
import SearchScreen from './components/SearchScreen';
import ResultsScreen from './components/ResultsScreen';
import Navbar from './components/Navbar';
import { GoogleGenAI } from "@google/genai";

// تعريف process لتجنب أخطاء Vite أثناء البناء
declare var process: {
  env: {
    API_KEY: string;
    API_KEY_1?: string;
  };
};

type SearchStatus = 'IDLE' | 'SEARCHING' | 'SUCCESS' | 'EMPTY' | 'ERROR';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<string>('SEARCH');
  const [searchStatus, setSearchStatus] = useState<SearchStatus>('IDLE');
  const [scanningStatus, setScanningStatus] = useState<string>('');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [groundingLinks, setGroundingLinks] = useState<any[]>([]);
  const [searchParams, setSearchParams] = useState<{ from: string; to: string; date: string; fromStationId: string; toStationId: string } | null>(null);
  
  const activeSearchId = useRef<string | null>(null);

  const fetchDirectBlueBus = async (from: string, to: string, date: string): Promise<Trip[]> => {
    try {
      const fromId = CITY_MAP_BLUEBUS[from];
      const toId = CITY_MAP_BLUEBUS[to];
      if (!fromId || !toId) return [];

      // استخدام المفتاح المخصص لـ Blue Bus من البيئة
      const token = process.env.API_KEY_1 || "";

      const response = await fetch(BLUEBUS_ENDPOINTS.SEARCH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          fromCityId: fromId,
          toCityId: toId,
          date: date
        })
      });

      if (!response.ok) return [];
      const data = await response.json();
      
      return (data.tours || []).map((t: any) => ({
        id: `bb_${t.id || Math.random().toString(36).substr(2, 5)}`,
        companyId: 'c5',
        from, to, date,
        time: t.departureTime || '00:00',
        price: t.price || 0,
        busType: t.busType || 'Premium',
        remainingSeats: t.availableSeats || 5,
        officialBookingUrl: 'https://bluebus.com.eg',
        dataSource: 'OFFICIAL_PARTNER' as const,
        totalSeats: 48,
        availableSeats: []
      }));
    } catch (e) {
      console.warn("Direct API check failed, relying on AI Grounding...");
      return [];
    }
  };

  const performHybridSearch = async (from: string, to: string, date: string, fromStationId: string, toStationId: string): Promise<void> => {
    const searchId = Math.random().toString(36).substr(2, 9);
    activeSearchId.current = searchId;
    
    setTrips([]);
    setSearchStatus('SEARCHING');
    setScanningStatus(`جاري فحص رحلات ${from} إلى ${to}...`);

    try {
      // 1. محاولة الجلب المباشر أولاً
      const blueBusTrips = await fetchDirectBlueBus(from, to, date);
      if (activeSearchId.current === searchId && blueBusTrips.length > 0) {
        setTrips(blueBusTrips);
      }

      // 2. استخدام Gemini Search Grounding للبحث الشامل
      // يجب إنشاء مثيل جديد دائماً باستخدام المفتاح المحقون
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = `Find available bus trips from ${from} to ${to} on ${date}. 
      Focus on Go Bus, Superjet, and Blue Bus. 
      Return only a JSON array of objects: [{"company": "String", "time": "HH:mm", "price": Number, "type": "String", "bookingUrl": "String"}] 
      If no trips found, return [].`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { 
          tools: [{ googleSearch: {} }],
          temperature: 0,
        }
      });

      if (activeSearchId.current !== searchId) return;

      // استخراج روابط المصادر (Grounding)
      if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        setGroundingLinks(response.candidates[0].groundingMetadata.groundingChunks);
      }

      const textOutput = response.text || "";
      const jsonMatch = textOutput.match(/\[[\s\S]*\]/);
      
      let aiTrips: Trip[] = [];
      if (jsonMatch) {
        const rawResults = JSON.parse(jsonMatch[0]);
        aiTrips = rawResults.map((item: any) => {
          const companyMatch = INITIAL_COMPANIES.find(c => 
            item.company.toLowerCase().includes(c.name.toLowerCase()) || 
            c.name.toLowerCase().includes(item.company.toLowerCase())
          );
          
          return {
            id: `ai_${Math.random().toString(36).substr(2, 9)}`,
            companyId: companyMatch ? companyMatch.id : 'c1',
            from, to, date,
            time: item.time || '12:00',
            price: Number(item.price) || 200,
            busType: item.type || 'Standard',
            remainingSeats: 10,
            officialBookingUrl: item.bookingUrl || 'https://safareyat.com',
            dataSource: 'WEB_EXTRACTED' as const,
            totalSeats: 48,
            availableSeats: []
          };
        });
      }

      setTrips(prev => {
        // منع التكرار بناءً على وقت الرحلة والشركة
        const seen = new Set(prev.map(t => `${t.companyId}-${t.time}`));
        const filteredAi = aiTrips.filter(t => !seen.has(`${t.companyId}-${t.time}`));
        const combined = [...prev, ...filteredAi];
        
        // تحديث الحالة النهائية بناءً على وجود نتائج
        setSearchStatus(combined.length > 0 ? 'SUCCESS' : 'EMPTY');
        return combined;
      });

    } catch (error) {
      console.error("Search Flow Failed:", error);
      if (activeSearchId.current === searchId) {
        // إذا كان هناك نتائج سابقة (مثل Blue Bus) نبقي الحالة SUCCESS
        setSearchStatus(prevTrips => (prevTrips.length > 0 || trips.length > 0) ? 'SUCCESS' : 'ERROR');
      }
    } finally {
      if (activeSearchId.current === searchId) {
        setScanningStatus('');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative shadow-2xl border-x font-['Cairo']">
      <Navbar 
        currentScreen={currentScreen} 
        goBack={() => setCurrentScreen('SEARCH')} 
        onAdmin={()=>{}} 
        onCompany={()=>{}} 
        onHome={()=>setCurrentScreen('SEARCH')} 
      />
      
      {scanningStatus && (
        <div className="bg-blue-600 text-white text-[10px] py-2 px-4 text-center sticky top-[60px] z-50 flex items-center justify-center gap-2 animate-fadeIn shadow-lg">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
          <span className="font-bold tracking-wide">{scanningStatus}</span>
        </div>
      )}

      <div className="p-4">
        {currentScreen === 'SEARCH' && (
          <SearchScreen 
            onSearch={(f,t,d, fs, ts) => { 
                setSearchParams({from:f,to:t,date:d, fromStationId: fs, toStationId: ts}); 
                setCurrentScreen('RESULTS'); 
                performHybridSearch(f,t,d, fs, ts); 
            }} 
            provinces={PROVINCES} 
          />
        )}
        {currentScreen === 'RESULTS' && searchParams && (
          <ResultsScreen 
            params={searchParams} 
            trips={trips} 
            status={searchStatus}
            onRetry={() => performHybridSearch(searchParams.from, searchParams.to, searchParams.date, searchParams.fromStationId, searchParams.toStationId)}
            onSelect={(t) => window.open(t.officialBookingUrl, '_blank')} 
          />
        )}
      </div>

      {groundingLinks.length > 0 && currentScreen === 'RESULTS' && (
        <div className="p-4 bg-gray-50 text-[8px] text-gray-400 border-t flex flex-wrap gap-2 animate-slideUp">
           <span className="font-black opacity-50 uppercase italic">البيانات مستخرجة من:</span>
           {groundingLinks.map((link, i) => (
             <a key={i} href={link.web?.uri} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline truncate max-w-[150px] hover:text-blue-700">
               {link.web?.title || 'مصدر رسمي'}
             </a>
           ))}
        </div>
      )}
    </div>
  );
};

export default App;
