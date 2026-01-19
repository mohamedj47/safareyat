
export enum UserRole {
  USER = 'USER',
  COMPANY = 'COMPANY',
  ADMIN = 'ADMIN'
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  isActive: boolean;
  provinces: string[];
}

export interface Station {
  id: string;
  name: string;
}

export interface Trip {
  id: string;
  companyId: string;
  from: string;
  to: string;
  date: string;
  time: string;
  price: number; 
  busType: string;
  remainingSeats: number;
  officialBookingUrl: string;
  dataSource: 'OFFICIAL_PARTNER' | 'WEB_EXTRACTED';
  totalSeats: number;
  availableSeats: number[];
  lastInventorySync?: number;
}

export interface Booking {
  id: string;
  tripId: string;
  seatNumber: number;
  ticketPrice: number;
  appFee: number;
  timestamp: number;
}

export interface Province {
  id: string;
  name: string;
  stations?: Station[];
}
