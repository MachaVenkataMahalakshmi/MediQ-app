import { useEffect, useState } from 'react';
import type { Hospital, Department } from '@/types';
import { HOSPITALS } from '@/data';

const STORAGE_KEY = 'mediq_hospital_state_v1';
const TOKENS_KEY = 'mediq_booked_tokens_v1';

interface PersistedState {
  hospitals: Hospital[];
}

export function loadHospitals(): Hospital[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: PersistedState = JSON.parse(raw);
      if (parsed.hospitals && parsed.hospitals.length > 0) return parsed.hospitals;
    }
  } catch {
    // ignore
  }
  return JSON.parse(JSON.stringify(HOSPITALS));
}

export function saveHospitals(hospitals: Hospital[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ hospitals }));
  } catch {
    // ignore
  }
}

export function loadTokens() {
  try {
    const raw = localStorage.getItem(TOKENS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [];
}

export function saveTokens(tokens: any[]) {
  try {
    localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
  } catch {
    // ignore
  }
}

/** Simulate live token updates every 10 seconds */
export function useLiveTokenUpdates(hospitals: Hospital[], setHospitals: (h: Hospital[]) => void) {
  useEffect(() => {
    const interval = setInterval(() => {
      setHospitals(
        hospitals.map((h) => ({
          ...h,
          departments: h.departments.map((d) => {
            if (d.tokensBooked <= d.currentToken) return d;
            // Advance current token by 1 occasionally
            if (Math.random() < 0.4 && d.currentToken < d.tokensBooked) {
              return { ...d, currentToken: d.currentToken + 1 };
            }
            return d;
          }),
        })),
      );
    }, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hospitals]);
}

export function useGeolocation() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'Permission denied');
        setLoading(false);
      },
      { timeout: 8000, enableHighAccuracy: false },
    );
  }, []);

  return { coords, error, loading };
}
