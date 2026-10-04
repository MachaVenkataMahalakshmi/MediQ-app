export type HospitalType = 'Hospital' | 'Clinic' | 'Emergency';

export type DoctorStatus = 'Available' | 'On Break' | 'Not Available';

export type OpenStatus = 'Open' | 'Closed' | 'Closing Soon';

export interface Department {
  name: string;
  doctor: string;
  doctorStatus: DoctorStatus;
  totalTokens: number;
  tokensBooked: number;
  currentToken: number;
}

export interface Hospital {
  id: string;
  name: string;
  type: HospitalType;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  openHours: string; // "09:00-21:00" or "24x7"
  rating: number;
  is24x7: boolean;
  departments: Department[];
}

export interface BookedToken {
  id: string;
  tokenNumber: number;
  hospitalId: string;
  hospitalName: string;
  departmentName: string;
  doctor: string;
  patientName: string;
  patientPhone: string;
  peopleAhead: number;
  estimatedTime: string; // HH:MM
  bookedAt: number;
  lat: number;
  lng: number;
  distance: number;
  address: string;
  phone: string;
  slot: string;
}

export type SortOption = 'nearest' | 'shortest-wait' | 'top-rated';
