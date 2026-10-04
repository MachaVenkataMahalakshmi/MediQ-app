import { Activity, Home as HomeIcon, Ticket, X } from 'lucide-react';

export type Tab = 'home' | 'hospitals' | 'tokens';

interface HeaderProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  tokenCount: number;
}

const TABS: { id: Tab; label: string; icon: typeof HomeIcon }[] = [
  { id: 'home', label: 'Home', icon: HomeIcon },
  { id: 'hospitals', label: 'Hospitals', icon: Activity },
  { id: 'tokens', label: 'My Tokens', icon: Ticket },
];

export function Header({ activeTab, onTabChange, tokenCount }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onTabChange('home')}>
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center shadow-sm">
              <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-none">
                Medi<span className="text-teal-600">Q</span>
              </h1>
              <p className="text-[10px] text-slate-400 leading-none mt-0.5 hidden sm:block">
                Find Care, Skip the Queue
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-1 sm:gap-2">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className={`relative flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === id
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
                {id === 'tokens' && tokenCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-teal-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {tokenCount}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

export function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="flex items-center gap-3 bg-slate-800 text-white px-5 py-3 rounded-2xl shadow-xl max-w-sm">
        <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse flex-shrink-0" />
        <p className="text-sm font-medium flex-1">{message}</p>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
