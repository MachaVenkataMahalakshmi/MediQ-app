import { MapPin, Star, Clock, Activity } from 'lucide-react';
import type { Hospital } from '@/types';
import { formatDistance, getOpenStatus, statusColor, tokensLeft, getCrowdLevel, crowdColor } from '@/utils';

interface HospitalCardProps {
  hospital: Hospital;
  distance: number;
  onClick: () => void;
}

export function HospitalCard({ hospital, distance, onClick }: HospitalCardProps) {
  const status = getOpenStatus(hospital);
  const totalTokens = hospital.departments.reduce((s, d) => s + d.totalTokens, 0);
  const bookedTokens = hospital.departments.reduce((s, d) => s + d.tokensBooked, 0);
  const leftTokens = Math.max(0, totalTokens - bookedTokens);
  const pct = totalTokens > 0 ? (leftTokens / totalTokens) * 100 : 0;
  const crowd = getCrowdLevel(hospital);

  return (
    <button
      onClick={onClick}
      className="group w-full text-left bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-200 animate-fade-in"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-800 group-hover:text-teal-700 transition-colors truncate">
            {hospital.name}
          </h3>
          <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{hospital.address}</span>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${statusColor(status)}`}>
          {status}
        </span>
      </div>

      <div className="flex items-center gap-3 mb-3 text-xs">
        <span className={`px-2 py-0.5 rounded-md font-medium ${
          hospital.type === 'Emergency' ? 'bg-red-50 text-red-600' :
          hospital.type === 'Hospital' ? 'bg-blue-50 text-blue-600' :
          'bg-slate-100 text-slate-600'
        }`}>
          {hospital.type}
        </span>
        {hospital.is24x7 && (
          <span className="flex items-center gap-1 text-teal-600 font-medium">
            <Activity className="w-3 h-3" /> 24x7
          </span>
        )}
        <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          {hospital.rating.toFixed(1)}
        </span>
        <span className="text-slate-500 font-medium">{formatDistance(distance)}</span>
        <span className={`px-2 py-0.5 rounded-md font-medium ${crowdColor(crowd)}`}>
          {crowd} crowd
        </span>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-slate-500 font-medium">Tokens available</span>
          <span className="text-slate-700 font-semibold">{leftTokens} / {totalTokens}</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              pct > 50 ? 'bg-emerald-500' : pct > 20 ? 'bg-amber-500' : 'bg-red-500'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-1 mt-3 text-xs text-slate-400">
        <Clock className="w-3 h-3" />
        <span>{hospital.is24x7 ? 'Open 24x7' : hospital.openHours}</span>
        <span className="mx-1">•</span>
        <span>{hospital.departments.length} departments</span>
      </div>
    </button>
  );
}

export function HospitalCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm animate-pulse">
      <div className="h-5 w-2/3 bg-slate-200 rounded mb-3" />
      <div className="h-3 w-1/2 bg-slate-100 rounded mb-3" />
      <div className="flex gap-2 mb-3">
        <div className="h-5 w-16 bg-slate-100 rounded" />
        <div className="h-5 w-12 bg-slate-100 rounded" />
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full" />
    </div>
  );
}
