import { Ticket, MapPin, Phone, Navigation, Clock, Users, X, Calendar, Stethoscope, Trash2 } from 'lucide-react';
import type { BookedToken } from '@/types';
import { estimatedWaitTime, leaveByTime, formatDistance } from '@/utils';

interface MyTokensPageProps {
  tokens: BookedToken[];
  hospitals: { id: string; departments: { name: string; currentToken: number; tokensBooked: number }[] }[];
  onCancel: (tokenId: string) => void;
  onBrowse: () => void;
}

export function MyTokensPage({ tokens, hospitals, onCancel, onBrowse }: MyTokensPageProps) {
  if (tokens.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <Ticket className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">No tokens booked yet</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-xs">Browse hospitals and book a token to skip the queue.</p>
          <button
            onClick={onBrowse}
            className="mt-4 px-5 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-all"
          >
            Browse Hospitals
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Ticket className="w-5 h-5 text-teal-600" /> My Tokens
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tokens.map((token) => {
          const hospital = hospitals.find((h) => h.id === token.hospitalId);
          const dept = hospital?.departments.find((d) => d.name === token.departmentName);
          const liveCurrentToken = dept?.currentToken ?? token.tokenNumber - token.peopleAhead;
          const livePeopleAhead = Math.max(0, token.tokenNumber - liveCurrentToken - 1);
          const isReady = livePeopleAhead <= 3;
          const leaveBy = leaveByTime(livePeopleAhead, token.distance);
          const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${token.lat},${token.lng}`;

          return (
            <div
              key={token.id}
              className={`bg-white rounded-2xl border p-5 shadow-sm transition-all ${
                isReady ? 'border-teal-300 shadow-md ring-2 ring-teal-100' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-teal-600">#{token.tokenNumber}</span>
                    {isReady && (
                      <span className="flex items-center gap-1 text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md animate-pulse">
                        <Clock className="w-3 h-3" /> Time to leave!
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-800 text-sm mt-1">{token.hospitalName}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Stethoscope className="w-3 h-3" /> {token.departmentName} • {token.doctor}
                  </p>
                </div>
                <div className="w-14 h-14 bg-slate-50 rounded-xl p-1.5 flex-shrink-0">
                  <div className="w-full h-full grid grid-cols-5 gap-px">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div key={i} className={`${(i * 7 + token.tokenNumber) % 3 === 0 ? 'bg-slate-700' : 'bg-white'}`} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-slate-50 rounded-xl p-2.5 text-center">
                  <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1"><Users className="w-3 h-3" /> People Ahead</p>
                  <p className={`text-lg font-bold ${isReady ? 'text-teal-600' : 'text-slate-700'}`}>{livePeopleAhead}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-2.5 text-center">
                  <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1"><Clock className="w-3 h-3" /> Est. Wait</p>
                  <p className="text-lg font-bold text-slate-700">{estimatedWaitTime(livePeopleAhead)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                <span>Slot: {token.slot}</span>
                <span>•</span>
                <span>Est. time: <strong className="text-slate-700">{token.estimatedTime}</strong></span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                <Navigation className="w-3.5 h-3.5 text-teal-600" />
                <span>{formatDistance(token.distance)} away</span>
                <span>•</span>
                <span className="font-semibold text-teal-700">Leave by {leaveBy}</span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-all"
                >
                  <Navigation className="w-3.5 h-3.5" /> Directions
                </a>
                <a
                  href={`tel:${token.phone}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-all"
                >
                  <Phone className="w-3.5 h-3.5" /> Call
                </a>
                <button
                  onClick={() => onCancel(token.id)}
                  className="flex items-center justify-center py-2 px-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
