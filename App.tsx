
import React, { useState, useRef } from 'react';
import { Trip, Company } from './types';
import { PROVINCES, INITIAL_COMPANIES, GEMINI_API_KEY, BLUEBUS_TOKEN, BLUEBUS_ENDPOINTS, CITY_MAP_BLUEBUS } from './constants';
import SearchScreen from './components/SearchScreen';
import ResultsScreen from './components/ResultsScreen';
import Navbar from './components/Navbar';
import { GoogleGenAI } from "@google/genai";

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

      const response = await fetch(BLUEBUS_ENDPOINTS.SEARCH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': BLUEBUS_TOKEN
        },
        body: JSON.stringify({
          fromCityId: fromId,
          toCityId: toId,
          date: date
        })
      });

      if (!response.ok) return [];
      const data = await response.json();
      
      // تحويل بيانات Blue Bus API لشكل Trip الخاص بنا
      return (data.tours || []).map((t: any) => ({
        id: `bb_${t.id}`,
        companyId: 'c5',
        from, to, date,
        time: t.departureTime,
        price: t.price,
        busType: t.busType || 'Premium',
        remainingSeats: t.availableSeats || 5,
        officialBookingUrl: 'https://bluebus.com.eg',
        dataSource: 'OFFICIAL_PARTNER',
        totalSeats: 48,
        availableSeats: []
      }));
    } catch (e) {
      console.error("BlueBus Direct API Fail:", e);
      return [];
    }
  };

  const performHybridSearch = async (from: string, to: string, date: string, fromStationId: string, toStationId: string): Promise<void> => {
    const searchId = Math.random().toString(36).substr(2, 9);
    activeSearchId.current = searchId;
    
    setTrips([]);
    setSearchStatus('SEARCHING');
    setScanningStatus(`جاري فحص التوفر لرحلات ${from} إلى ${to}...`);

    try {
      // 1. جلب مباشر من Blue Bus API أولاً (أسرع وأضمن)
      const blueBusTrips = await fetchDirectBlueBus(from, to, date);
      if (activeSearchId.current === searchId) {
        setTrips(prev => [...prev, ...blueBusTrips]);
      }

      // 2. استخدام Gemini لجلب الشركات الأخرى عبر أداة البحث
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const prompt = `Search for bus trips from ${from} to ${to} on ${date} for Go Bus, Superjet, and We Bus. 
      Return ONLY a JSON array: [{"company": "String", "time": "HH:mm", "price": Number, "type": "String", "url": "String"}]`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview', // فلاش أسرع وأكثر استقراراً للـ Search Grounding
        contents: prompt,
        config: { 
          tools: [{ googleSearch: {} }],
          temperature: 0.1,
        }
      });

      if (activeSearchId.current !== searchId) return;

      // تخزين روابط المصادر (Grounding) كما تنص التعليمات
      if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        setGroundingLinks(response.candidates[0].groundingMetadata.groundingChunks);
      }

      const text = response.text || "";
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      
      if (jsonMatch) {
        const aiResults = JSON.parse(jsonMatch[0]);
        const mappedTrips: Trip[] = aiResults.map((item: any) => {
          const companyName = item.company.toLowerCase();
          let companyMatch = INITIAL_COMPANIES.find(c => companyName.includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(companyName));
          if (!companyMatch) companyMatch = INITIAL_COMPANIES[1]; // Fallback to Go Bus

          return {
            id: `ai_${Math.random().toString(36).substr(2, 9)}`,
            companyId: companyMatch.id,
            from, to, date,
            time: item.time,
            price: Number(item.price) || 250,
            busType: item.type || 'Standard',
            remainingSeats: 8,
            officialBookingUrl: item.url || 'https://safareyat.com',
            dataSource: 'WEB_EXTRACTED',
            totalSeats: 48,
            availableSeats: []
          };
        });

        setTrips(prev => {
          const uniqueIds = new Set(prev.map(t => t.id));
          const newTrips = mappedTrips.filter(t => !uniqueIds.has(t.id));
          return [...prev, ...newTrips];
        });
        setSearchStatus('SUCCESS');
      } else if (blueBusTrips.length > 0) {
        setSearchStatus('SUCCESS');
      } else {
        setSearchStatus('EMPTY');
      }

    } catch (e) {
      console.error("Search Fail:", e);
      if (activeSearchId.current === searchId && trips.length === 0) {
        setSearchStatus('ERROR');
      } else if (trips.length > 0) {
        setSearchStatus('SUCCESS');
      }
    }
    setScanningStatus('');
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative shadow-2xl border-x font-['Cairo']">
      <Navbar currentScreen={currentScreen} goBack={() => setCurrentScreen('SEARCH')} onAdmin={()=>{}} onCompany={()=>{}} onHome={()=>setCurrentScreen('SEARCH')} />
      
      {scanningStatus && (
        <div className="bg-blue-600 text-white text-[10px] py-2 px-4 text-center sticky top-[60px] z-50 flex items-center justify-center gap-2">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
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
           <p className="mb-2 font-bold uppercase">مصادر البيانات المباشرة:</p>
           <div className="flex flex-wrap gap-2">
              {groundingLinks.map((link, i) => (
                <a key={i} href={link.web?.uri} target="_blank" className="text-blue-400 underline truncate max-w-[100px]">
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
