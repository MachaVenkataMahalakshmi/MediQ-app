import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Hospital, BookedToken } from '@/types';
import { DEFAULT_CITY } from '@/data';
import { loadHospitals, saveHospitals, loadTokens, saveTokens, useLiveTokenUpdates, useGeolocation } from '@/hooks';
import { haversineDistance, tokensLeft, getOpenStatus } from '@/utils';
import { Header, Toast } from '@/components/Header';
import type { Tab } from '@/components/Header';
import { HomePage } from '@/components/HomePage';
import { HospitalsPage } from '@/components/HospitalsPage';
import { HospitalModal } from '@/components/HospitalModal';
import { MyTokensPage } from '@/components/MyTokensPage';

export default function App() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [tokens, setTokens] = useState<BookedToken[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [toastShownFor, setToastShownFor] = useState<Set<string>>(new Set());

  const { coords, error: geoError, loading: geoLoading } = useGeolocation();

  const userLat = coords?.lat ?? DEFAULT_CITY.lat;
  const userLng = coords?.lng ?? DEFAULT_CITY.lng;

  // Load from localStorage on mount
  useEffect(() => {
    setHospitals(loadHospitals());
    setTokens(loadTokens());
  }, []);

  // Persist
  useEffect(() => { if (hospitals.length > 0) saveHospitals(hospitals); }, [hospitals]);
  useEffect(() => { saveTokens(tokens); }, [tokens]);

  // Simulate live token updates
  useLiveTokenUpdates(hospitals, setHospitals);

  // Toast: when any token reaches <= 3 people ahead
  useEffect(() => {
    if (tokens.length === 0 || hospitals.length === 0) return;
    for (const token of tokens) {
      const hospital = hospitals.find((h) => h.id === token.hospitalId);
      if (!hospital) continue;
      const dept = hospital.departments.find((d) => d.name === token.departmentName);
      if (!dept) continue;
      const ahead = Math.max(0, token.tokenNumber - dept.currentToken - 1);
      if (ahead <= 3 && ahead > 0 && !toastShownFor.has(token.id)) {
        setToast(`Time to leave! Your token #${token.tokenNumber} at ${hospital.name} is ${ahead} people away.`);
        setToastShownFor((prev) => new Set(prev).add(token.id));
        break;
      }
    }
  }, [tokens, hospitals, toastShownFor]);

  const handleBook = useCallback((token: BookedToken) => {
    setTokens((prev) => [...prev, token]);
    // Update hospital's booked count
    setHospitals((prev) =>
      prev.map((h) =>
        h.id === token.hospitalId
          ? {
              ...h,
              departments: h.departments.map((d) =>
                d.name === token.departmentName
                  ? { ...d, tokensBooked: d.tokensBooked + 1 }
                  : d,
              ),
            }
          : h,
      ),
    );
  }, []);

  const handleCancel = useCallback((tokenId: string) => {
    const token = tokens.find((t) => t.id === tokenId);
    if (!token) return;
    setTokens((prev) => prev.filter((t) => t.id !== tokenId));
    setHospitals((prev) =>
      prev.map((h) =>
        h.id === token.hospitalId
          ? {
              ...h,
              departments: h.departments.map((d) =>
                d.name === token.departmentName
                  ? { ...d, tokensBooked: Math.max(0, d.tokensBooked - 1) }
                  : d,
              ),
            }
          : h,
      ),
    );
    setToast(`Token #${token.tokenNumber} cancelled.`);
  }, [tokens]);

  const handleSuggest = useCallback((hospitalId: string) => {
    const h = hospitals.find((hosp) => hosp.id === hospitalId);
    if (h) setSelectedHospital(h);
  }, [hospitals]);

  // Live hospital data for MyTokensPage (just current token numbers)
  const liveHospitalData = useMemo(
    () => hospitals.map((h) => ({
      id: h.id,
      departments: h.departments.map((d) => ({ name: d.name, currentToken: d.currentToken, tokensBooked: d.tokensBooked })),
    })),
    [hospitals],
  );

  const hospitalsReady = hospitals.length > 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header activeTab={activeTab} onTabChange={setActiveTab} tokenCount={tokens.length} />

      <main>
        {activeTab === 'home' && (
          <HomePage
            hospitals={hospitals}
            userLat={userLat}
            userLng={userLng}
            loading={geoLoading || !hospitalsReady}
            geoError={geoError ?? null}
            onSelectHospital={setSelectedHospital}
            onEmergencyClick={() => { setEmergencyOnly(true); setActiveTab('hospitals'); }}
            onBrowseAll={() => setActiveTab('hospitals')}
            existingTokens={tokens}
          />
        )}

        {activeTab === 'hospitals' && (
          <HospitalsPage
            hospitals={hospitals}
            userLat={userLat}
            userLng={userLng}
            loading={geoLoading || !hospitalsReady}
            geoError={geoError ?? null}
            emergencyOnly={emergencyOnly}
            onClearEmergency={() => setEmergencyOnly(false)}
            onSelectHospital={setSelectedHospital}
            existingTokens={tokens}
          />
        )}

        {activeTab === 'tokens' && (
          <MyTokensPage
            tokens={tokens}
            hospitals={liveHospitalData}
            onCancel={handleCancel}
            onBrowse={() => setActiveTab('hospitals')}
          />
        )}
      </main>

      {selectedHospital && (
        <HospitalModal
          hospital={selectedHospital}
          distance={haversineDistance(userLat, userLng, selectedHospital.lat, selectedHospital.lng)}
          onClose={() => setSelectedHospital(null)}
          onBook={handleBook}
          existingTokens={tokens}
          allHospitals={hospitals}
          onSuggest={handleSuggest}
        />
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        MediQ – Find Care, Skip the Queue. Demo data for illustrative purposes.
      </footer>
    </div>
  );
}
