
import React, { useState, useRef } from 'react';
import { Trip, Company } from './types';
import { PROVINCES, INITIAL_COMPANIES, GEMINI_API_KEY } from './constants';
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
  const [searchParams, setSearchParams] = useState<{ from: string; to: string; date: string; fromStationId: string; toStationId: string } | null>(null);
  
  const activeSearchId = useRef<string | null>(null);

  const performRealTimeSearch = async (from: string, to: string, date: string, fromStationId: string, toStationId: string): Promise<void> => {
    const searchId = Math.random().toString(36).substr(2, 9);
    activeSearchId.current = searchId;
    
    setTrips([]);
    setSearchStatus('SEARCHING');
    setScanningStatus(`جاري المسح المباشر لرحلات ${from} إلى ${to}...`);

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || GEMINI_API_KEY });
    
    try {
      const prompt = `Find actual bus trips from ${from} to ${to} on ${date}. 
      Check official websites like Go Bus, Superjet, and Blue Bus. 
      Return JSON only: [{"company": "String", "time": "HH:mm", "price": Number, "type": "String", "url": "String"}]`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview', 
        contents: prompt,
        config: { 
          tools: [{ googleSearch: {} }],
          temperature: 0,
        }
      });

      if (activeSearchId.current !== searchId) return;

      const text = response.text || "";
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      
      if (jsonMatch) {
        const rawResults = JSON.parse(jsonMatch[0]);
        const mappedTrips: Trip[] = rawResults.map((item: any) => {
          const companyName = item.company.toLowerCase();
          let companyMatch = INITIAL_COMPANIES.find(c => companyName.includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(companyName));
          if (!companyMatch) companyMatch = INITIAL_COMPANIES[2]; 

          let bookingUrl = item.url;
          if (companyMatch.id === 'c1') bookingUrl = 'https://go-bus.com';
          if (companyMatch.id === 'c2') bookingUrl = 'https://superjet.com.eg';
          if (companyMatch.id === 'c5') bookingUrl = 'https://bluebus.com.eg';

          return {
            id: `tr_${Math.random().toString(36).substr(2, 9)}`,
            companyId: companyMatch.id,
            from, to, date,
            time: item.time,
            price: Number(item.price) < 100 ? 250 : Number(item.price), 
            busType: item.type || 'Classic',
            remainingSeats: 5,
            officialBookingUrl: bookingUrl,
            dataSource: 'WEB_EXTRACTED',
            totalSeats: 48,
            availableSeats: [1,2,3]
          };
        });

        setTrips(mappedTrips);
        setSearchStatus('SUCCESS');
      } else {
        setSearchStatus('EMPTY');
      }

    } catch (e) {
      console.error("Aggregation Fail:", e);
      if (activeSearchId.current === searchId) setSearchStatus('ERROR');
    }
    setScanningStatus('');
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative shadow-2xl border-x font-['Cairo']">
      <Navbar currentScreen={currentScreen} goBack={() => setCurrentScreen('SEARCH')} onAdmin={()=>{}} onCompany={()=>{}} onHome={()=>setCurrentScreen('SEARCH')} />
      
      {scanningStatus && (
        <div className="bg-blue-600 text-white text-[10px] py-2 px-4 text-center sticky top-[60px] z-50 flex items-center justify-center gap-2">
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
                performRealTimeSearch(f,t,d, fs, ts); 
            }} 
            provinces={PROVINCES} 
          />
        )}
        {currentScreen === 'RESULTS' && searchParams && (
          <ResultsScreen 
            params={searchParams} 
            trips={trips} 
            status={searchStatus}
            onRetry={() => performRealTimeSearch(searchParams.from, searchParams.to, searchParams.date, searchParams.fromStationId, searchParams.toStationId)}
            onSelect={(t) => window.open(t.officialBookingUrl, '_blank')} 
          />
        )}
      </div>
    </div>
  );
};

export default App;
