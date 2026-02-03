
import React, { useState } from 'react';
import { DOIEntry, DOIStatus } from '../types';
import { 
  History, Search, Calendar, CheckCircle2, 
  AlertCircle, Sparkles, Send, FileText, 
  ArrowUpRight, Clock, Filter, Download
} from 'lucide-react';

interface HistoryViewProps {
  entries: DOIEntry[];
}

const HistoryView: React.FC<HistoryViewProps> = ({ entries }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('30d');

  // Gerando logs simulados baseados nas entradas existentes
  const activityLogs = entries.flatMap(entry => {
    const logs = [];
    
    // Log de Transmissão (se aplicável)
    if (entry.status === DOIStatus.TRANSMITTED || entry.status === DOIStatus.ERROR) {
      logs.push({
        id: `log-tx-${entry.id}`,
        timestamp: entry.lastUpdate,
        type: 'TRANSMISSION',
        subject: entry.id,
        description: entry.status === DOIStatus.TRANSMITTED 
          ? `Transmissão concluída com sucesso. Recibo: ${entry.receiptNumber}`
          : `Falha na transmissão: ${entry.errorMessage}`,
        status: entry.status === DOIStatus.TRANSMITTED ? 'SUCCESS' : 'ERROR',
        user: 'Maria Silva'
      });
    }

    // Log de Extração (sempre presente para mock)
    logs.push({
      id: `log-ext-${entry.id}`,
      timestamp: new Date(new Date(entry.date).getTime() - 3600000).toISOString(),
      type: 'EXTRACTION',
      subject: entry.id,
      description: `Extração via IA realizada a partir de escritura digitalizada.`,
      status: 'SUCCESS',
      user: 'Maria Silva'
    });

    return logs;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const filteredLogs = activityLogs.filter(log => 
    log.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Mini Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
           <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <History size={28} />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total de Atividades</p>
              <h4 className="text-2xl font-black text-slate-900">{activityLogs.length}</h4>
           </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
           <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
              <CheckCircle2 size={28} />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sucesso Global</p>
              <h4 className="text-2xl font-black text-slate-900">
                {Math.round((activityLogs.filter(l => l.status === 'SUCCESS').length / activityLogs.length) * 100)}%
              </h4>
           </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
           <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center">
              <Download size={28} />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Exportar Logs</p>
              <button className="text-sm font-bold text-blue-600 hover:underline">Gerar Relatório PDF</button>
           </div>
        </div>
      </div>

      {/* Filters Header */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Filtrar por ID, ação ou descrição..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl overflow-hidden w-full md:w-auto">
          {['24h', '7d', '30d'].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPeriod(p)}
              className={`flex-1 md:flex-none px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                filterPeriod === p ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {p === '24h' ? 'Hoje' : p === '7d' ? '7 Dias' : '30 Dias'}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="py-6 px-8">Data e Hora</th>
                <th className="py-6 px-8">Evento</th>
                <th className="py-6 px-8">Descrição da Atividade</th>
                <th className="py-6 px-8">Usuário</th>
                <th className="py-6 px-8 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                  <td className="py-6 px-8 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700">
                        {new Date(log.timestamp).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 mt-1">
                        <Clock size={10} />
                        {new Date(log.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </td>
                  <td className="py-6 px-8">
                    <div className="flex items-center gap-3">
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                         log.type === 'TRANSMISSION' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                       }`}>
                         {log.type === 'TRANSMISSION' ? <Send size={18} /> : <Sparkles size={18} />}
                       </div>
                       <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                           {log.type === 'TRANSMISSION' ? 'Envio RFB' : 'IA Engine'}
                         </p>
                         <p className="text-xs font-extrabold text-slate-800">{log.subject}</p>
                       </div>
                    </div>
                  </td>
                  <td className="py-6 px-8">
                    <div className="flex items-start gap-3 max-w-md">
                      {log.status === 'SUCCESS' ? (
                        <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
                      ) : (
                        <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                      )}
                      <p className="text-sm text-slate-600 font-medium leading-relaxed">
                        {log.description}
                      </p>
                    </div>
                  </td>
                  <td className="py-6 px-8">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                         {log.user.split(' ').map(n => n[0]).join('')}
                       </div>
                       <span className="text-xs font-bold text-slate-600">{log.user}</span>
                    </div>
                  </td>
                  <td className="py-6 px-8 text-right">
                    <button className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all">
                       <ArrowUpRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="py-32 text-center flex flex-col items-center">
             <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 mb-8">
                <History size={48} />
             </div>
             <h3 className="text-slate-900 font-extrabold text-xl mb-2">Nenhum histórico encontrado</h3>
             <p className="text-slate-400 text-sm font-medium max-w-xs mx-auto">Não há registros de atividades para os filtros selecionados.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;
