
import React, { useState, useRef } from 'react';
import { Trip, Company } from './types';
import { PROVINCES, INITIAL_COMPANIES, BLUEBUS_ENDPOINTS, CITY_MAP_BLUEBUS } from './constants';
import SearchScreen from './components/SearchScreen';
import ResultsScreen from './components/ResultsScreen';
import Navbar from './components/Navbar';
import { GoogleGenAI } from "@google/genai";

// الوصول الآمن لمتغيرات البيئة لتجنب أخطاء Vite و Vercel
const getEnv = (key: string): string | undefined => {
  try {
    return (window as any).process?.env?.[key] || (globalThis as any).process?.env?.[key];
  } catch {
    return undefined;
  }
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

      const token = getEnv('API_KEY_1') || "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2FwaS5ibHVlYnVzLmNvbS5lZy9ncmFwaHFsIiwiaWF0IjoxNzY4ODE1MTk1LCJleHAiOjc3Njg4MTUxOTUsIm5iZiI6MTc2ODgxNTE5NSwianRpIjoiRUpjckE3SGQwQXB4M1VoYyIsInN1YiI6ODMzMTUwLCJwcnYiOiIxZDBhMDIwYWNmNWM0YjZjNDk3OTg5ZGYxYWJmMGZiZDRlOGM4ZDYzIiwicGhvbmUiOiIwMTIyMTc0NjU1NCJ9.ssZIJ8puXegceIagHst1QUJglACinMGxPxdhvTTo8";

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
        id: `bb_${t.id || Math.random()}`,
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
      console.warn("Direct API failed (likely CORS). Using AI fallback.");
      return [];
    }
  };

  const performHybridSearch = async (from: string, to: string, date: string, fromStationId: string, toStationId: string): Promise<void> => {
    const searchId = Math.random().toString(36).substr(2, 9);
    activeSearchId.current = searchId;
    
    setTrips([]);
    setSearchStatus('SEARCHING');
    setScanningStatus(`جاري فحص التوفر من ${from} إلى ${to}...`);

    try {
      // 1. جلب مباشر إذا أمكن
      const blueBusTrips = await fetchDirectBlueBus(from, to, date);
      if (activeSearchId.current === searchId && blueBusTrips.length > 0) {
        setTrips(prev => [...prev, ...blueBusTrips]);
      }

      // 2. استخدام Gemini 3 Flash للبحث الأرضي لجميع الشركات
      const apiKey = getEnv('API_KEY') || "AIzaSyCsamL-x7uNkx8LtNk8jfgaiqlG-Fne6E";
      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `Search for bus trips from ${from} to ${to} on date ${date} for companies like Go Bus, Superjet, and Blue Bus. 
      Return JSON array: [{"company": "name", "time": "HH:mm", "price": number, "type": "class", "bookingUrl": "url"}]. 
      If no trips, return empty array [].`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { 
          tools: [{ googleSearch: {} }],
          temperature: 0,
        }
      });

      if (activeSearchId.current !== searchId) return;

      if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        setGroundingLinks(response.candidates[0].groundingMetadata.groundingChunks);
      }

      const text = response.text || "";
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      
      let aiMappedTrips: Trip[] = [];
      if (jsonMatch) {
        try {
          const aiResults = JSON.parse(jsonMatch[0]);
          aiMappedTrips = aiResults.map((item: any) => {
            const companyMatch = INITIAL_COMPANIES.find(c => 
              item.company.toLowerCase().includes(c.name.toLowerCase()) || 
              c.name.toLowerCase().includes(item.company.toLowerCase())
            );
            
            return {
              id: `ai_${Math.random().toString(36).substr(2, 9)}`,
              companyId: companyMatch ? companyMatch.id : 'c1',
              from, to, date,
              time: item.time || '12:00',
              price: Number(item.price) || 250,
              busType: item.type || 'Standard',
              remainingSeats: 10,
              officialBookingUrl: item.bookingUrl || 'https://safareyat.com',
              dataSource: 'WEB_EXTRACTED' as const,
              totalSeats: 48,
              availableSeats: []
            };
          });
        } catch (e) { console.error("Parse Error"); }
      }

      setTrips(prev => {
        const existing = new Set(prev.map(t => `${t.companyId}-${t.time}`));
        const newResults = aiMappedTrips.filter(t => !existing.has(`${t.companyId}-${t.time}`));
        return [...prev, ...newResults];
      });

      setSearchStatus(prev => (trips.length > 0 || aiMappedTrips.length > 0 || blueBusTrips.length > 0) ? 'SUCCESS' : 'EMPTY');

    } catch (e) {
      console.error("Exception:", e);
      if (activeSearchId.current === searchId) {
        setSearchStatus(prev => trips.length > 0 ? 'SUCCESS' : 'ERROR');
      }
    } finally {
      setScanningStatus('');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative shadow-2xl border-x font-['Cairo']">
      <Navbar currentScreen={currentScreen} goBack={() => setCurrentScreen('SEARCH')} onAdmin={()=>{}} onCompany={()=>{}} onHome={()=>setCurrentScreen('SEARCH')} />
      
      {scanningStatus && (
        <div className="bg-blue-600 text-white text-[10px] py-2 px-4 text-center sticky top-[60px] z-50 flex items-center justify-center gap-2 animate-fadeIn">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
          <span className="font-bold">{scanningStatus}</span>
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
        <div className="p-4 bg-gray-50 text-[8px] text-gray-400 border-t">
           <p className="mb-2 font-black opacity-50 uppercase tracking-widest italic">مصادر البيانات اللحظية:</p>
           <div className="flex flex-wrap gap-2">
              {groundingLinks.map((link, i) => (
                <a key={i} href={link.web?.uri} target="_blank" className="text-blue-500 underline truncate max-w-[120px]">
                  {link.web?.title || 'Source'}
                </a>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
