
import React, { useState, useRef } from 'react';
import { Trip, Company } from './types';
import { PROVINCES, INITIAL_COMPANIES, BLUEBUS_ENDPOINTS, CITY_MAP_BLUEBUS } from './constants';
import SearchScreen from './components/SearchScreen';
import ResultsScreen from './components/ResultsScreen';
import Navbar from './components/Navbar';
import { GoogleGenAI } from "@google/genai";

// وصول آمن لمتغيرات البيئة في بيئة المتصفح والـ Build
const getApiKey = () => (globalThis as any).process?.env?.API_KEY || '';
const getBlueBusToken = () => (globalThis as any).process?.env?.API_KEY_1 || '';

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
          'Authorization': getBlueBusToken()
        },
        body: JSON.stringify({ fromCityId: fromId, toCityId: toId, date: date })
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
      console.warn("Direct fetch failed, falling back to AI...");
      return [];
    }
  };

  const performHybridSearch = async (from: string, to: string, date: string, fromStationId: string, toStationId: string): Promise<void> => {
    const searchId = Math.random().toString(36).substr(2, 9);
    activeSearchId.current = searchId;
    
    setTrips([]);
    setSearchStatus('SEARCHING');
    setScanningStatus(`جاري البحث عن رحلات من ${from} إلى ${to}...`);

    try {
      // 1. Fetch BlueBus directly
      const bbTrips = await fetchDirectBlueBus(from, to, date);
      if (activeSearchId.current === searchId && bbTrips.length > 0) {
        setTrips(bbTrips);
      }

      // 2. AI Search Grounding
      const apiKey = getApiKey();
      if (!apiKey) throw new Error("API_KEY missing");

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Search for bus trips from ${from} to ${to} on ${date} for Go Bus, Superjet, and Blue Bus. 
      Return JSON: [{"company": "name", "time": "HH:mm", "price": number, "type": "class", "bookingUrl": "url"}]. 
      If none, return [].`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { tools: [{ googleSearch: {} }], temperature: 0 }
      });

      if (activeSearchId.current !== searchId) return;

      if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        setGroundingLinks(response.candidates[0].groundingMetadata.groundingChunks);
      }

      const jsonStr = response.text?.match(/\[[\s\S]*\]/)?.[0] || '[]';
      const aiResults = JSON.parse(jsonStr);
      
      const aiMapped: Trip[] = aiResults.map((item: any) => ({
        id: `ai_${Math.random().toString(36).substr(2, 5)}`,
        companyId: INITIAL_COMPANIES.find(c => item.company.toLowerCase().includes(c.name.toLowerCase()))?.id || 'c1',
        from, to, date,
        time: item.time || '10:00',
        price: Number(item.price) || 250,
        busType: item.type || 'Standard',
        remainingSeats: 8,
        officialBookingUrl: item.bookingUrl || 'https://safareyat.com',
        dataSource: 'WEB_EXTRACTED' as const,
        totalSeats: 48,
        availableSeats: []
      }));

      setTrips(prev => {
        const seen = new Set(prev.map(t => `${t.companyId}-${t.time}`));
        const filteredAi = aiMapped.filter(t => !seen.has(`${t.companyId}-${t.time}`));
        const combined = [...prev, ...filteredAi];
        setSearchStatus(combined.length > 0 ? 'SUCCESS' : 'EMPTY');
        return combined;
      });

    } catch (e) {
      console.error("Search Error:", e);
      if (activeSearchId.current === searchId) {
        setSearchStatus(trips.length > 0 ? 'SUCCESS' : 'ERROR');
      }
    } finally {
      if (activeSearchId.current === searchId) setScanningStatus('');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative shadow-2xl border-x font-['Cairo']">
      <Navbar currentScreen={currentScreen} goBack={() => setCurrentScreen('SEARCH')} onAdmin={()=>{}} onCompany={()=>{}} onHome={()=>setCurrentScreen('SEARCH')} />
      
      {scanningStatus && (
        <div className="bg-blue-600 text-white text-[10px] py-2 px-4 text-center sticky top-[60px] z-50 flex items-center justify-center gap-2">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
          <span>{scanningStatus}</span>
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
        <div className="p-4 bg-gray-50 text-[8px] text-gray-400 border-t flex flex-wrap gap-2">
           <span className="font-bold opacity-50 uppercase italic">مصادر حية:</span>
           {groundingLinks.map((link, i) => (
             <a key={i} href={link.web?.uri} target="_blank" className="text-blue-500 underline truncate max-w-[120px]">
               {link.web?.title || 'Source'}
             </a>
           ))}
        </div>
      )}
    </div>
  );
};

export default App;
