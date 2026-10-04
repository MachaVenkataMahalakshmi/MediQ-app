import type { Hospital, OpenStatus, Department } from '@/types';

export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6371; // km
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function getOpenStatus(hospital: Hospital, now: Date = new Date()): OpenStatus {
  if (hospital.is24x7) return 'Open';
  const hours = hospital.openHours;
  const match = hours.match(/^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/);
  if (!match) return 'Closed';
  const [, oh, om, ch, cm] = match;
  const closeH = parseInt(ch, 10);
  const closeM = parseInt(cm, 10);
  const openH = parseInt(oh, 10);
  const openM = parseInt(om, 10);

  const currentMin = now.getHours() * 60 + now.getMinutes();
  const openMin = openH * 60 + openM;
  const closeMin = closeH * 60 + closeM;

  if (currentMin < openMin || currentMin >= closeMin) return 'Closed';
  if (closeMin - currentMin <= 60) return 'Closing Soon';
  return 'Open';
}

export function tokensLeft(dept: Department): number {
  return Math.max(0, dept.totalTokens - dept.tokensBooked);
}

export function peopleAhead(dept: Department, tokenNumber: number): number {
  return Math.max(0, tokenNumber - dept.currentToken - 1);
}

export function estimatedWaitTime(peopleAheadCount: number): string {
  const totalMin = peopleAheadCount * 8;
  if (totalMin === 0) return 'Now';
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

export function estimatedClockTime(peopleAheadCount: number, now: Date = new Date()): string {
  const totalMin = now.getHours() * 60 + now.getMinutes() + peopleAheadCount * 8;
  const h = Math.floor(totalMin / 60) % 24;
  const m = totalMin % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function leaveByTime(
  peopleAheadCount: number,
  distanceKm: number,
  now: Date = new Date(),
): string {
  const travelMin = Math.round(distanceKm * 3) + 10;
  const etaMin = peopleAheadCount * 8;
  const buffer = Math.max(0, etaMin - travelMin);
  const totalMin = now.getHours() * 60 + now.getMinutes() + buffer;
  const h = Math.floor(totalMin / 60) % 24;
  const m = totalMin % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function getCrowdLevel(hospital: Hospital, now: Date = new Date()): 'Low' | 'Medium' | 'High' {
  const hour = now.getHours();
  // Rush hours: 9-11, 17-19
  if ((hour >= 9 && hour <= 11) || (hour >= 17 && hour <= 19)) return 'High';
  if (hour >= 12 && hour <= 14) return 'Medium';
  if (hour >= 7 && hour <= 8) return 'Medium';
  if (hour >= 20 || hour <= 6) return 'Low';
  return 'Low';
}

export function crowdColor(level: 'Low' | 'Medium' | 'High'): string {
  if (level === 'Low') return 'text-emerald-600 bg-emerald-50';
  if (level === 'Medium') return 'text-amber-600 bg-amber-50';
  return 'text-red-600 bg-red-50';
}

export function statusColor(status: OpenStatus): string {
  if (status === 'Open') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (status === 'Closing Soon') return 'bg-amber-100 text-amber-700 border-amber-200';
  return 'bg-red-100 text-red-700 border-red-200';
}

export function doctorStatusColor(status: string): string {
  if (status === 'Available') return 'bg-emerald-100 text-emerald-700';
  if (status === 'On Break') return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
}

export function timeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 9; h <= 20; h++) {
    slots.push(`${h.toString().padStart(2, '0')}:00`);
    slots.push(`${h.toString().padStart(2, '0')}:30`);
  }
  return slots;
}

export function validatePhone(phone: string): boolean {
  return /^[+]?[\d\s-]{10,15}$/.test(phone.trim());
}

export function validateName(name: string): boolean {
  return name.trim().length >= 2;
}
