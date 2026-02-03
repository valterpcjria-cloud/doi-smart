
import React, { useState, useRef, useEffect } from 'react';
import { DOIEntry, DOIStatus } from '../types';
import { STATUS_CONFIG } from '../constants';
import {
  Search, Filter, Send, Download, MoreHorizontal,
  FileText, CheckSquare, Square, Trash2, Eye,
  ExternalLink, FileCheck, Edit3
} from 'lucide-react';

interface DOIListProps {
  entries: DOIEntry[];
  onTransmit: (ids: string[]) => void;
  onDelete: (id: string) => void;
  onReview: (entry: DOIEntry) => void;
  onEdit: (entry: DOIEntry) => void;
}

const DOIList: React.FC<DOIListProps> = ({ entries, onTransmit, onDelete, onReview, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = entries.filter(e =>
    e.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.registryNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(e => e.id)));
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por imóvel, ID ou matrícula..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none shadow-sm transition-all placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Filter size={20} />
          </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {selectedIds.size > 0 && (
            <button
              onClick={() => onTransmit(Array.from(selectedIds))}
              className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all animate-in fade-in zoom-in-95"
            >
              <Send size={18} />
              Transmitir Selecionadas ({selectedIds.size})
            </button>
          )}
          <button className="flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm">
            <Download size={18} />
            Exportar Excel
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-visible">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="py-6 px-6 w-12 text-center">
                  <button onClick={toggleSelectAll} className="transition-colors hover:text-blue-600 outline-none">
                    {selectedIds.size === filtered.length && filtered.length > 0 ? <CheckSquare size={22} className="text-blue-600" /> : <Square size={22} />}
                  </button>
                </th>
                <th className="py-6 px-6">ID / Competência</th>
                <th className="py-6 px-6">Imóvel / Matrícula</th>
                <th className="py-6 px-6">Valor</th>
                <th className="py-6 px-6">Status</th>
                <th className="py-6 px-6">Recibo RFB</th>
                <th className="py-6 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((entry) => (
                <tr key={entry.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-6 px-6 text-center">
                    <button onClick={() => toggleSelect(entry.id)} className={`transition-all outline-none ${selectedIds.has(entry.id) ? 'text-blue-600' : 'text-slate-200 group-hover:text-slate-300'}`}>
                      {selectedIds.has(entry.id) ? <CheckSquare size={22} /> : <Square size={22} />}
                    </button>
                  </td>
                  <td className="py-6 px-6">
                    <p className="font-extrabold text-slate-800 tracking-tight text-sm uppercase">{entry.id}</p>
                    <p className="text-[10px] text-slate-400 font-black mt-0.5">{entry.competence}</p>
                  </td>
                  <td className="py-6 px-6 max-w-sm">
                    <p className="text-sm font-semibold text-slate-700 truncate mb-1 leading-snug">{entry.propertyAddress}</p>
                    <p className="text-[9px] text-slate-400 uppercase font-black tracking-tight">MATRÍCULA: {entry.registryNumber}</p>
                  </td>
                  <td className="py-6 px-6">
                    <p className="text-sm font-black text-slate-900">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(entry.value)}
                    </p>
                  </td>
                  <td className="py-6 px-6">
                    <div className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${STATUS_CONFIG[entry.status].color.includes('green') ? 'border-green-100 ring-4 ring-green-50/50' : STATUS_CONFIG[entry.status].color.includes('red') ? 'border-red-100 ring-4 ring-red-50/50' : 'border-slate-100'} ${STATUS_CONFIG[entry.status].color}`}>
                      {STATUS_CONFIG[entry.status].icon}
                      {STATUS_CONFIG[entry.status].label}
                    </div>
                  </td>
                  <td className="py-6 px-6">
                    {entry.receiptNumber ? (
                      <div className="flex flex-col gap-1.5 items-start">
                        <span className="text-[10px] font-mono font-black text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/50 leading-none">
                          {entry.receiptNumber}
                        </span>
                        <button className="text-[9px] text-blue-600 font-black uppercase tracking-widest hover:text-blue-800 flex items-center gap-1.5 transition-colors group/link">
                          Ver Comprovante <ExternalLink size={10} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-300 font-medium">—</span>
                    )}
                  </td>
                  <td className="py-6 px-6 text-right relative">
                    <button
                      onClick={() => setActiveMenu(activeMenu === entry.id ? null : entry.id)}
                      className={`w-12 h-10 rounded-2xl transition-all flex items-center justify-center ${activeMenu === entry.id ? 'bg-[#0f172a] text-white shadow-xl scale-110' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
                    >
                      <MoreHorizontal size={24} strokeWidth={2.5} />
                    </button>

                    {/* Enhanced Dropdown Menu */}
                    {activeMenu === entry.id && (
                      <div
                        ref={menuRef}
                        className="absolute right-8 top-16 w-60 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 py-3 z-50 animate-in fade-in zoom-in-95 duration-200"
                      >
                        <div className="px-5 py-2.5 mb-1.5 border-b border-slate-50">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] leading-none">Ações para {entry.id}</p>
                        </div>

                        {(entry.status === DOIStatus.READY || entry.status === DOIStatus.ERROR) && (
                          <button
                            onClick={() => { onTransmit([entry.id]); setActiveMenu(null); }}
                            className="w-full flex items-center gap-3.5 px-5 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Send size={18} /> Transmitir Agora
                          </button>
                        )}

                        <button
                          onClick={() => { onReview(entry); setActiveMenu(null); }}
                          className="w-full flex items-center gap-3.5 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors group/item"
                        >
                          <Eye size={18} className="text-slate-400 group-hover/item:text-slate-700" /> Detalhes / Revisão
                        </button>

                        <button
                          onClick={() => { onEdit(entry); setActiveMenu(null); }}
                          className="w-full flex items-center gap-3.5 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors group/item"
                        >
                          <Edit3 size={18} className="text-slate-400 group-hover/item:text-slate-700" /> Editar Dados
                        </button>

                        {entry.status === DOIStatus.TRANSMITTED && (
                          <button className="w-full flex items-center gap-3.5 px-5 py-3 text-sm font-bold text-green-600 hover:bg-green-50 transition-colors">
                            <FileCheck size={18} /> Baixar Recibo (PDF)
                          </button>
                        )}

                        <div className="h-px bg-slate-50 my-2 mx-2" />

                        <button
                          onClick={() => { onDelete(entry.id); setActiveMenu(null); }}
                          disabled={entry.status === DOIStatus.TRANSMITTED}
                          className="w-full flex items-center gap-3.5 px-5 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                          <Trash2 size={18} /> Excluir Registro
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-32 text-center flex flex-col items-center animate-in fade-in duration-700">
            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 mb-8 shadow-inner ring-8 ring-slate-50/50">
              <FileText size={48} />
            </div>
            <h3 className="text-slate-900 font-extrabold text-xl mb-2">Nenhuma DOI encontrada</h3>
            <p className="text-slate-400 text-sm font-medium max-w-xs mx-auto px-4 leading-relaxed">Não encontramos resultados para sua busca. Experimente termos menos específicos ou remova os filtros.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DOIList;
