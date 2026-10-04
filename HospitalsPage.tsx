import { useMemo, useState } from 'react';
import { Search, Filter, SlidersHorizontal, SearchX, Activity, AlertTriangle } from 'lucide-react';
import type { Hospital, BookedToken, SortOption } from '@/types';
import { HospitalCard, HospitalCardSkeleton } from './HospitalCard';
import { haversineDistance, getOpenStatus } from '@/utils';
import { DEFAULT_CITY } from '@/data';

interface HospitalsPageProps {
  hospitals: Hospital[];
  userLat: number;
  userLng: number;
  loading: boolean;
  geoError: string | null;
  emergencyOnly: boolean;
  onClearEmergency: () => void;
  onSelectHospital: (hospital: Hospital) => void;
  existingTokens: BookedToken[];
}

const DEPARTMENT_OPTIONS = ['All', 'General', 'Cardiology', 'Pediatrics', 'Orthopedics', 'Dermatology', 'ENT', 'Gynecology', 'Dental'];
const TYPE_OPTIONS = ['All', 'Hospital', 'Clinic', 'Emergency'];
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'nearest', label: 'Nearest' },
  { value: 'shortest-wait', label: 'Shortest Wait' },
  { value: 'top-rated', label: 'Top Rated' },
];

export function HospitalsPage({
  hospitals, userLat, userLng, loading, geoError, emergencyOnly, onClearEmergency, onSelectHospital,
}: HospitalsPageProps) {
  const [search, setSearch] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [openNow, setOpenNow] = useState(false);
  const [dept, setDept] = useState('All');
  const [type, setType] = useState('All');
  const [emergency247, setEmergency247] = useState(false);
  const [sort, setSort] = useState<SortOption>('nearest');

  const enriched = useMemo(() => {
    return hospitals
      .map((h) => ({ hospital: h, distance: haversineDistance(userLat, userLng, h.lat, h.lng) }))
      .filter(({ hospital }) => {
        if (emergencyOnly && !(hospital.is24x7 && hospital.type === 'Emergency')) return false;
        if (openNow && getOpenStatus(hospital) !== 'Open') return false;
        if (dept !== 'All' && !hospital.departments.some((d) => d.name === dept)) return false;
        if (type !== 'All' && hospital.type !== type) return false;
        if (emergency247 && !hospital.is24x7) return false;
        if (search) {
          const q = search.toLowerCase();
          if (!hospital.name.toLowerCase().includes(q) && !hospital.address.toLowerCase().includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sort === 'nearest') return a.distance - b.distance;
        if (sort === 'top-rated') return b.hospital.rating - a.hospital.rating;
        // shortest wait: sum of people ahead across departments
        const aWait = a.hospital.departments.reduce((s, d) => s + (d.tokensBooked - d.currentToken), 0);
        const bWait = b.hospital.departments.reduce((s, d) => s + (d.tokensBooked - d.currentToken), 0);
        return aWait - bWait;
      });
  }, [hospitals, userLat, userLng, emergencyOnly, openNow, dept, type, emergency247, search, sort]);

  const hasActiveFilters = openNow || dept !== 'All' || type !== 'All' || emergency247 || search || emergencyOnly;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      {geoError && (
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-2xl text-sm mb-4">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          Showing results near default location ({DEFAULT_CITY.name})
        </div>
      )}

      {emergencyOnly && (
        <div className="flex items-center justify-between gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm mb-4">
          <span className="flex items-center gap-2 font-semibold"><Activity className="w-4 h-4" /> Showing emergency facilities only</span>
          <button onClick={onClearEmergency} className="text-xs font-bold underline hover:no-underline">Clear</button>
        </div>
      )}

      {/* Search & Sort */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or area..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 bg-white outline-none focus:border-teal-400 cursor-pointer"
        >
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className={`p-2.5 rounded-xl border transition-all flex-shrink-0 ${filterOpen || hasActiveFilters ? 'bg-teal-50 border-teal-200 text-teal-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Panel */}
      {filterOpen && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 space-y-4 animate-slide-up">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Quick Filters</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setOpenNow(!openNow)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${openNow ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}>Open Now</button>
              <button onClick={() => setEmergency247(!emergency247)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${emergency247 ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}>Emergency 24x7</button>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Department</p>
            <div className="flex flex-wrap gap-2">
              {DEPARTMENT_OPTIONS.map((d) => (
                <button key={d} onClick={() => setDept(d)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${dept === d ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{d}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Type</p>
            <div className="flex flex-wrap gap-2">
              {TYPE_OPTIONS.map((t) => (
                <button key={t} onClick={() => setType(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${type === t ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{t}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <HospitalCardSkeleton key={i} />)}
        </div>
      ) : enriched.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <SearchX className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">No hospitals found</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-xs">Try adjusting your filters or search to find more results.</p>
          {hasActiveFilters && (
            <button
              onClick={() => { setOpenNow(false); setDept('All'); setType('All'); setEmergency247(false); setSearch(''); onClearEmergency(); }}
              className="mt-4 px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-all"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-400 mb-3">{enriched.length} hospital{enriched.length !== 1 ? 's' : ''} found</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enriched.map(({ hospital, distance }) => (
              <HospitalCard key={hospital.id} hospital={hospital} distance={distance} onClick={() => onSelectHospital(hospital)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
