
import React from 'react';
import { Certificate } from '../types';
import { ShieldCheck, Calendar, Cpu, Trash2, RefreshCw, AlertCircle, Plus, CheckCircle2, Star } from 'lucide-react';

interface CertificatesViewProps {
  certificates: Certificate[];
  onAdd: () => void;
  onDelete: (id: string) => void;
  onSetActive: (id: string) => void;
}

const CertificatesView: React.FC<CertificatesViewProps> = ({ certificates, onAdd, onDelete, onSetActive }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Cofre de Certificados</h2>
          <p className="text-sm text-slate-500 font-medium">Gerencie suas identidades digitais para comunicação com a Receita Federal.</p>
        </div>
        <button 
          onClick={onAdd}
          className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95"
        >
          <Plus size={18} strokeWidth={3} />
          Registrar Novo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((cert) => (
          <div 
            key={cert.id} 
            className={`relative bg-white p-7 rounded-[2.5rem] border transition-all group ${
              cert.isActive 
                ? 'border-blue-500 shadow-2xl shadow-blue-100 ring-4 ring-blue-50' 
                : 'border-slate-100 shadow-sm hover:shadow-md'
            }`}
          >
            {/* Status & Active Badge */}
            <div className="flex items-start justify-between mb-6">
              <div className={`p-3.5 rounded-2xl transition-colors ${
                cert.isActive ? 'bg-blue-600 text-white' : cert.type === 'A1' ? 'bg-slate-100 text-slate-400' : 'bg-slate-100 text-slate-400'
              }`}>
                {cert.type === 'A1' ? <ShieldCheck size={24} /> : <Cpu size={24} />}
              </div>
              
              <div className="flex flex-col items-end gap-2">
                 {cert.isActive && (
                   <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest animate-in zoom-in-50 duration-500">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                      Ativo
                   </div>
                 )}
                 <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                   cert.status === 'VALID' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                 }`}>
                   {cert.status === 'VALID' ? 'Válido' : 'Expirado'}
                 </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-black text-slate-800 text-sm leading-tight uppercase line-clamp-2 min-h-[2.5rem]">{cert.owner}</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">ID: #{cert.id}</p>
              </div>
              
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2.5 text-slate-400 text-xs">
                  <div className="p-1.5 bg-slate-50 rounded-lg"><Calendar size={14} /></div>
                  <span className="font-bold">Expira: <span className="text-slate-800">{new Date(cert.expiryDate).toLocaleDateString('pt-BR')}</span></span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-400 text-xs">
                  <div className="p-1.5 bg-slate-50 rounded-lg"><RefreshCw size={14} /></div>
                  <span className="font-bold">Formato: <span className="text-slate-800">{cert.type === 'A1' ? 'Arquivo .PFX' : 'Hardware Token'}</span></span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
              {!cert.isActive ? (
                <button 
                  onClick={() => onSetActive(cert.id)}
                  className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors"
                >
                  <Star size={14} /> Definir como Ativo
                </button>
              ) : (
                <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest">
                  <CheckCircle2 size={14} strokeWidth={3} /> Principal em Uso
                </div>
              )}
              
              <button 
                onClick={() => onDelete(cert.id)}
                className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}

        {/* Add Card */}
        <button 
          onClick={onAdd}
          className="border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-slate-400 hover:bg-slate-50 hover:border-blue-300 hover:text-blue-400 transition-all min-h-[300px] group"
        >
          <div className="w-16 h-16 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-blue-50 transition-all">
            <Plus size={32} />
          </div>
          <span className="font-black uppercase tracking-widest text-[11px]">Adicionar Certificado</span>
        </button>
      </div>
    </div>
  );
};

export default CertificatesView;
