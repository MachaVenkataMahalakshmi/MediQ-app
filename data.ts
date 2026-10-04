import type { Hospital } from '@/types';

export const DEFAULT_CITY = {
  name: 'Bengaluru',
  lat: 12.9716,
  lng: 77.5946,
};

const DEPT_NAMES = [
  'General',
  'Cardiology',
  'Pediatrics',
  'Orthopedics',
  'Dermatology',
  'ENT',
  'Gynecology',
  'Dental',
];

const DOCTOR_NAMES = [
  'Dr. Anitha Rao', 'Dr. Vikram Reddy', 'Dr. Sunitha Menon', 'Dr. Arjun Nair',
  'Dr. Lakshmi Iyer', 'Dr. Rohan Gupta', 'Dr. Deepa Sharma', 'Dr. Karthik Verma',
  'Dr. Nisha Patel', 'Dr. Aditya Kumar', 'Dr. Meera Joshi', 'Dr. Sanjay Rao',
];

const DOCTOR_STATUSES = ['Available', 'Available', 'On Break', 'Not Available'] as const;

function seedRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function makeDepartments(seed: number) {
  const rand = seedRandom(seed);
  // Pick a random subset of 4-6 departments
  const shuffled = [...DEPT_NAMES].sort(() => rand() - 0.5);
  const count = 4 + Math.floor(rand() * 3);
  const chosen = shuffled.slice(0, count);
  return chosen.map((name, i) => {
    const totalTokens = 30 + Math.floor(rand() * 30);
    const tokensBooked = Math.floor(rand() * (totalTokens + 1));
    const currentToken = Math.min(tokensBooked, Math.floor(rand() * (tokensBooked + 1)));
    return {
      name,
      doctor: DOCTOR_NAMES[(seed + i) % DOCTOR_NAMES.length],
      doctorStatus: DOCTOR_STATUSES[Math.floor(rand() * DOCTOR_STATUSES.length)],
      totalTokens,
      tokensBooked,
      currentToken,
    };
  });
}

export const HOSPITALS: Hospital[] = [
  {
    id: 'h1',
    name: 'Apollo Specialty Hospital',
    type: 'Hospital',
    address: '154 Richmond Road, Richmond Town',
    lat: 12.9698, lng: 77.5990,
    phone: '+91 80 4612 4400',
    openHours: '24x7',
    rating: 4.6,
    is24x7: true,
    departments: makeDepartments(101),
  },
  {
    id: 'h2',
    name: 'Manipal Hospital Old Airport Road',
    type: 'Hospital',
    address: '98 HAL Old Airport Road, Kodihalli',
    lat: 12.9595, lng: 77.6493,
    phone: '+91 80 2502 4444',
    openHours: '24x7',
    rating: 4.5,
    is24x7: true,
    departments: makeDepartments(202),
  },
  {
    id: 'h3',
    name: 'Narayana Health City',
    type: 'Hospital',
    address: '258/A Bommasandra Industrial Area, Hosur Road',
    lat: 12.8030, lng: 77.6620,
    phone: '+91 80 7122 2222',
    openHours: '24x7',
    rating: 4.4,
    is24x7: true,
    departments: makeDepartments(303),
  },
  {
    id: 'h4',
    name: 'Fortis Hospital Bannerghatta',
    type: 'Hospital',
    address: '154 Bannerghatta Main Road, opp. IIM-B',
    lat: 12.8906, lng: 77.5956,
    phone: '+91 80 6621 4444',
    openHours: '24x7',
    rating: 4.3,
    is24x7: true,
    departments: makeDepartments(404),
  },
  {
    id: 'h5',
    name: 'Columbia Asia Hebbal',
    type: 'Hospital',
    address: '10 Beside Manyata Tech Park, Hebbal',
    lat: 13.0350, lng: 77.5970,
    phone: '+91 80 6165 6262',
    openHours: '24x7',
    rating: 4.2,
    is24x7: true,
    departments: makeDepartments(505),
  },
  {
    id: 'h6',
    name: 'Sakra World Hospital',
    type: 'Hospital',
    address: '52/2 Devarabeesanahalli, Outer Ring Road, Marathahalli',
    lat: 12.9370, lng: 77.6860,
    phone: '+91 80 4962 4962',
    openHours: '24x7',
    rating: 4.4,
    is24x7: true,
    departments: makeDepartments(606),
  },
  {
    id: 'h7',
    name: 'Aster CMI Hospital',
    type: 'Hospital',
    address: '43/2, NH 7, Next to Jnana Jyothi, Hebbal',
    lat: 13.0310, lng: 77.5820,
    phone: '+91 80 4342 0100',
    openHours: '24x7',
    rating: 4.3,
    is24x7: true,
    departments: makeDepartments(707),
  },
  {
    id: 'h8',
    name: 'Cloudnine Hospital Malleshwaram',
    type: 'Hospital',
    address: '8/1, 11th Main Road, Malleshwaram',
    lat: 13.0030, lng: 77.5650,
    phone: '+91 80 4612 4400',
    openHours: '09:00-21:00',
    rating: 4.5,
    is24x7: false,
    departments: makeDepartments(808),
  },
  {
    id: 'h9',
    name: 'HealthCare Clinic Indiranagar',
    type: 'Clinic',
    address: '100 Feet Road, Indiranagar, 1st Stage',
    lat: 12.9719, lng: 77.6412,
    phone: '+91 80 2520 5500',
    openHours: '08:00-20:00',
    rating: 4.1,
    is24x7: false,
    departments: makeDepartments(909),
  },
  {
    id: 'h10',
    name: 'Koru Pediatrics Clinic Koramangala',
    type: 'Clinic',
    address: '5th Block, Koramangala, 80 Feet Road',
    lat: 12.9352, lng: 77.6245,
    phone: '+91 80 4155 2200',
    openHours: '09:00-18:00',
    rating: 4.0,
    is24x7: false,
    departments: makeDepartments(1010),
  },
  {
    id: 'h11',
    name: 'Suguna Emergency Care',
    type: 'Emergency',
    address: 'Magadi Road, near Prasannanagar, Rajajinagar',
    lat: 12.9860, lng: 77.5490,
    phone: '+91 80 2312 8800',
    openHours: '24x7',
    rating: 3.9,
    is24x7: true,
    departments: makeDepartments(1111),
  },
  {
    id: 'h12',
    name: 'Rainbow Children\u2019s Clinic Whitefield',
    type: 'Clinic',
    address: 'Whitefield Main Road, near Hope Farm Circle',
    lat: 12.9698, lng: 77.7500,
    phone: '+91 80 6712 1100',
    openHours: '10:00-19:00',
    rating: 4.2,
    is24x7: false,
    departments: makeDepartments(1212),
  },
];
