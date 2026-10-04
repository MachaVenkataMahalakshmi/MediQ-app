import { useState } from 'react';
import { Search, MapPin, Activity, Siren, Navigation, Zap, Hospital as HospitalIcon, Clock, TrendingUp, Ticket, X, Phone } from 'lucide-react';
import type { Hospital, BookedToken } from '@/types';
import { HospitalCard } from './HospitalCard';
import { haversineDistance, getOpenStatus, tokensLeft, formatDistance } from '@/utils';
import { DEFAULT_CITY } from '@/data';

interface HomePageProps {
  hospitals: Hospital[];
  userLat: number;
  userLng: number;
  loading: boolean;
  geoError: string | null;
  onSelectHospital: (h: Hospital) => void;
  onEmergencyClick: () => void;
  onBrowseAll: () => void;
  existingTokens: BookedToken[];
}

export function HomePage({
  hospitals, userLat, userLng, loading, geoError, onSelectHospital, onEmergencyClick, onBrowseAll,
}: HomePageProps) {
  const [search, setSearch] = useState('');

  const enriched = hospitals
    .map((h) => ({ hospital: h, distance: haversineDistance(userLat, userLng, h.lat, h.lng) }))
    .sort((a, b) => a.distance - b.distance);

  const openNow = enriched.filter(({ hospital }) => getOpenStatus(hospital) === 'Open').length;
  const totalTokens = hospitals.reduce(
    (s, h) => s + h.departments.reduce((ds, d) => ds + tokensLeft(d), 0), 0,
  );

  // Smart recommendation: fastest option = nearest open hospital with most tokens available
  const fastest = enriched
    .filter(({ hospital }) => getOpenStatus(hospital) === 'Open')
    .map(({ hospital, distance }) => ({
      hospital, distance,
      wait: hospital.departments.reduce((s, d) => s + (d.tokensBooked - d.currentToken), 0),
    }))
    .sort((a, b) => a.wait - b.wait || a.distance - b.distance)[0];

  const filtered = search
    ? enriched.filter(({ hospital }) =>
        hospital.name.toLowerCase().includes(search.toLowerCase()) ||
        hospital.address.toLowerCase().includes(search.toLowerCase()))
    : enriched.slice(0, 6);

  // Emergency hospitals
  const emergencyHospitals = enriched
    .filter(({ hospital }) => hospital.is24x7 && hospital.type === 'Emergency' && getOpenStatus(hospital) === 'Open')
    .slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-50 via-white to-teal-50/50 pt-12 pb-8 sm:pt-16 sm:pb-12 overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-teal-100/30 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-100 px-3 py-1 rounded-full text-xs font-semibold text-teal-700 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              Live hospital availability
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold text-slate-800 leading-tight">
              Find nearby hospitals. Check availability.<br />
              <span className="text-teal-600">Book your token. No waiting.</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-500 mt-4">
              Skip the queue at hospitals and clinics across {DEFAULT_CITY.name}. Real-time token availability, smart recommendations, and instant booking.
            </p>

            {/* Search Bar */}
            <div className="mt-6 flex items-center gap-2 max-w-lg mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') onBrowseAll(); }}
                  placeholder="Search hospital or area..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 text-sm bg-white shadow-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all"
                />
              </div>
              <button
                onClick={onBrowseAll}
                className="px-5 py-3.5 rounded-2xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-all shadow-sm flex-shrink-0"
              >
                Search
              </button>
            </div>
          </div>

          {/* Stats Strip */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto mt-8">
            <StatCard icon={HospitalIcon} label="Hospitals Nearby" value={loading ? '—' : hospitals.length} color="text-blue-600 bg-blue-50" />
            <StatCard icon={Clock} label="Open Now" value={loading ? '—' : openNow} color="text-emerald-600 bg-emerald-50" />
            <StatCard icon={Ticket} label="Tokens Available" value={loading ? '—' : totalTokens} color="text-teal-600 bg-teal-50" />
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        {geoError && (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-2xl text-sm">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            Showing results near default location ({DEFAULT_CITY.name})
          </div>
        )}

        {/* Emergency Quick Button */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Siren className="w-5 h-5 text-red-500" /> Emergency
            </h2>
            <button onClick={onEmergencyClick} className="text-sm text-teal-600 font-semibold hover:text-teal-700">View all →</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {emergencyHospitals.length === 0 ? (
              <p className="text-sm text-slate-400 col-span-full">No emergency facilities open right now.</p>
            ) : (
              emergencyHospitals.map(({ hospital, distance }) => (
                <div key={hospital.id} className="bg-red-50/50 border border-red-100 rounded-2xl p-4 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 text-sm truncate">{hospital.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{formatDistance(distance)} • 24x7</p>
                  </div>
                  <a
                    href={`tel:${hospital.phone}`}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-all flex-shrink-0"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call
                  </a>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Smart Recommendation */}
        {fastest && (
          <section>
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-5 text-white shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-teal-200" />
                <h2 className="text-sm font-bold uppercase tracking-wide text-teal-100">Fastest option for you right now</h2>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold">{fastest.hospital.name}</h3>
                  <p className="text-sm text-teal-100 mt-1">
                    {formatDistance(fastest.distance)} • {fastest.hospital.departments.length} departments • ⭐ {fastest.hospital.rating.toFixed(1)}
                  </p>
                </div>
                <button
                  onClick={() => onSelectHospital(fastest.hospital)}
                  className="px-4 py-2.5 rounded-xl bg-white text-teal-700 text-sm font-bold hover:bg-teal-50 transition-all flex-shrink-0"
                >
                  View
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Nearby Hospitals */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-teal-600" /> Hospitals Near You
            </h2>
            <button onClick={onBrowseAll} className="text-sm text-teal-600 font-semibold hover:text-teal-700">Browse all →</button>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm animate-pulse">
                  <div className="h-5 w-2/3 bg-slate-200 rounded mb-3" />
                  <div className="h-3 w-1/2 bg-slate-100 rounded mb-3" />
                  <div className="h-2 w-full bg-slate-100 rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(({ hospital, distance }) => (
                <HospitalCard key={hospital.id} hospital={hospital} distance={distance} onClick={() => onSelectHospital(hospital)} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Activity; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-sm text-center">
      <div className={`w-9 h-9 mx-auto rounded-xl flex items-center justify-center mb-2 ${color}`}>
        <Icon className="w-4.5 h-4.5" />
      </div>
      <p className="text-xl sm:text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5">{label}</p>
    </div>
  );
}
