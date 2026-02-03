
import React, { useState, useEffect, useRef } from 'react';
import { DOIEntry, DOIStatus } from '../types';
import { transmitBatch, TransmissionResponse } from '../services/transmissionService';
import { CheckCircle, AlertCircle, Loader2, Send, Download, X, Terminal, ChevronRight } from 'lucide-react';

interface TransmissionModalProps {
  isOpen: boolean;
  entries: DOIEntry[];
  onClose: () => void;
  onComplete: (results: Map<string, TransmissionResponse>) => void;
}

const TransmissionModal: React.FC<TransmissionModalProps> = ({ isOpen, entries, onClose, onComplete }) => {
  const [progress, setProgress] = useState({ current: 0, total: entries.length });
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [finished, setFinished] = useState(false);
  const [results, setResults] = useState<Map<string, TransmissionResponse>>(new Map());
  const [allLogs, setAllLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !isTransmitting && !finished) {
      startTransmission();
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [allLogs]);

  const startTransmission = async () => {
    setIsTransmitting(true);
    setAllLogs(["[SISTEMA] Iniciando fila de transmissão automatizada..."]);
    
    const transmissionResults = await transmitBatch(entries, (current, total, logs) => {
      setProgress({ current, total });
      setAllLogs(prev => [...prev, ...logs]);
    });
    
    setResults(transmissionResults);
    setIsTransmitting(false);
    setFinished(true);
  };

  if (!isOpen) return null;

  const successCount = Array.from(results.values()).filter((r: TransmissionResponse) => r.success).length;
  const errorCount = entries.length - successCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${finished ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'} transition-colors shadow-sm`}>
               {isTransmitting ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
            </div>
            <div>
               <h2 className="text-xl font-black text-slate-800 tracking-tight">
                 {isTransmitting ? 'Integração RFB Ativa' : finished ? 'Processamento Finalizado' : 'Pronto para Transmitir'}
               </h2>
               <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Gateway de Comunicação Webservice DOI</p>
            </div>
          </div>
          {finished && (
            <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-all">
              <X size={20} />
            </button>
          )}
        </div>

        <div className="p-8 space-y-8">
          {/* Progress Section */}
          <div className="space-y-3">
             <div className="flex justify-between items-end">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Progresso do Lote</span>
                <span className="text-sm font-black text-blue-600">{Math.round((progress.current / progress.total) * 100)}%</span>
             </div>
             <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1 border border-slate-200/50">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-700 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
             </div>
             <p className="text-center text-xs font-bold text-slate-500">
               {isTransmitting ? `Sincronizando DOI ${progress.current} de ${progress.total}...` : 'Fila de transmissão processada.'}
             </p>
          </div>

          {/* Console Output */}
          <div className="relative group">
            <div className="absolute -top-3 left-6 px-3 py-1 bg-slate-900 text-[9px] font-black text-white rounded-lg uppercase tracking-widest flex items-center gap-2 z-10">
               <Terminal size={10} /> Output do Sistema
            </div>
            <div 
              ref={scrollRef}
              className="h-48 bg-[#0f172a] rounded-[2rem] p-6 font-mono text-[11px] text-slate-300 overflow-y-auto shadow-inner border border-white/5 space-y-1.5 custom-scrollbar"
            >
               {allLogs.map((log, i) => (
                 <div key={i} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                    <span className="text-slate-600 shrink-0">{(i + 1).toString().padStart(3, '0')}</span>
                    <span className={log.includes('ERRO') || log.includes('CRITICAL') ? 'text-red-400 font-bold' : log.includes('SUCESSO') ? 'text-green-400 font-bold' : 'text-slate-300'}>
                      {log}
                    </span>
                 </div>
               ))}
               {isTransmitting && (
                 <div className="flex gap-2 items-center text-blue-400 animate-pulse ml-8 mt-2">
                    <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                    <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></span>
                    <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                 </div>
               )}
            </div>
          </div>

          {/* Results Grid */}
          {finished && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="bg-green-50 border border-green-100 p-5 rounded-3xl flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-green-100">
                     <CheckCircle size={24} />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Sucesso</p>
                     <p className="text-xl font-black text-green-900">{successCount}</p>
                  </div>
               </div>
               <div className="bg-red-50 border border-red-100 p-5 rounded-3xl flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-red-100">
                     <AlertCircle size={24} />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Falhas</p>
                     <p className="text-xl font-black text-red-900">{errorCount}</p>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-8 bg-slate-50 flex gap-4">
           {finished ? (
             <>
               <button 
                 onClick={() => onComplete(results)}
                 className="flex-1 h-14 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
               >
                 Concluir Processo
               </button>
               {successCount > 0 && (
                 <button className="flex items-center justify-center gap-2 px-8 h-14 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all shadow-sm">
                   <Download size={18} />
                   Recibos
                 </button>
               )}
             </>
           ) : (
             <div className="w-full flex items-center justify-center gap-3 py-4 text-slate-400 italic text-sm font-medium">
                <Loader2 size={18} className="animate-spin" />
                Sincronizando com o servidor do Governo...
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default TransmissionModal;
