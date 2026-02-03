
import React from 'react';
import { MENU_ITEMS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  onViewChange: (view: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onViewChange }) => {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0 shadow-xl">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl">D</div>
          <div>
            <h1 className="font-bold text-lg leading-none">DOI Smart</h1>
            <span className="text-xs text-slate-400">Versão 2.0.0</span>
          </div>
        </div>

        <nav className="flex-1 mt-4 px-4 space-y-1">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeView === item.id 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800">
          <div className="flex items-center gap-3 bg-slate-800 p-3 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs">MS</div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">Maria Silva</p>
              <p className="text-[10px] text-slate-400">Escrevente • Cartório 1º</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Sistema</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-semibold">
              {MENU_ITEMS.find(i => i.id === activeView)?.label}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-100 text-xs font-semibold">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                RFB Webservice: Online
             </div>
             <button className="text-slate-400 hover:text-slate-600">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
