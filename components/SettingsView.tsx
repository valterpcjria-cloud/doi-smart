
import React, { useState } from 'react';
import { 
  User, Building2, Globe, ShieldCheck, 
  Save, RefreshCw, Check, 
  ChevronRight, Laptop, Smartphone,
  Lock, Loader2, Wifi, ShieldAlert,
  Key, LogOut, ShieldInfo, Fingerprint
} from 'lucide-react';

const SettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // States for Security tab
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(true);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passChanged, setPassChanged] = useState(false);

  // States for Integrations tab
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [connStatus, setConnStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1500);
  };

  const testConnection = async () => {
    setIsTestingConn(true);
    setConnStatus('IDLE');
    await new Promise(r => setTimeout(r, 2000));
    setConnStatus(Math.random() > 0.2 ? 'SUCCESS' : 'ERROR');
    setIsTestingConn(false);
  };

  const handleChangePassword = () => {
    setIsChangingPass(true);
    setTimeout(() => {
      setIsChangingPass(false);
      setPassChanged(true);
      setTimeout(() => setPassChanged(false), 3000);
    }, 2000);
  };

  const tabs = [
    { id: 'profile', label: 'Meu Perfil', icon: <User size={18} /> },
    { id: 'office', label: 'Dados do Cartório', icon: <Building2 size={18} /> },
    { id: 'integrations', label: 'Integrações RFB', icon: <Globe size={18} /> },
    { id: 'security', label: 'Segurança & Acesso', icon: <ShieldCheck size={18} /> },
  ];

  const sessions = [
    { id: 1, device: 'MacBook Pro 14"', location: 'São Paulo, BR', ip: '191.185.20.104', current: true, icon: <Laptop size={18} /> },
    { id: 2, device: 'iPhone 15 Pro', location: 'São Paulo, BR', ip: '187.12.98.22', current: false, icon: <Smartphone size={18} /> },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-72 shrink-0 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
                activeTab === tab.id 
                  ? 'bg-white text-blue-600 shadow-sm border border-slate-100' 
                  : 'text-slate-400 hover:bg-white/50 hover:text-slate-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl transition-all ${
                  activeTab === tab.id ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                }`}>
                  {tab.icon}
                </div>
                <span className="font-bold text-sm">{tab.label}</span>
              </div>
              <ChevronRight size={14} className={`transition-transform ${activeTab === tab.id ? 'rotate-90 text-blue-300' : 'opacity-0'}`} />
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          {activeTab === 'profile' && (
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-6">
                <div className="relative group">
                   <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-xl flex items-center justify-center text-3xl font-black text-slate-300 overflow-hidden">
                      MS
                   </div>
                   <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:scale-110 transition-all border-2 border-white">
                      <RefreshCw size={14} />
                   </button>
                </div>
                <div>
                   <h3 className="text-xl font-black text-slate-800 tracking-tight">Maria Silva</h3>
                   <p className="text-sm text-slate-400 font-medium">Escrevente Autorizada • Desde Out/2023</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nome Completo</label>
                    <input type="text" defaultValue="Maria Aparecida Silva" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">E-mail Institucional</label>
                    <input type="email" defaultValue="maria.silva@cartorio.com.br" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all" />
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-2xl"><Globe size={24} /></div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800 tracking-tight">Conectividade RFB</h3>
                      <p className="text-sm text-slate-400 font-medium">Configurações de endpoint e validação de túnel VPN/mTLS.</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                    connStatus === 'SUCCESS' ? 'bg-green-100 text-green-700 border-green-200' : 
                    connStatus === 'ERROR' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}>
                     <div className={`w-2 h-2 rounded-full ${connStatus === 'SUCCESS' ? 'bg-green-500 animate-pulse' : connStatus === 'ERROR' ? 'bg-red-500' : 'bg-slate-300'}`}></div>
                     {connStatus === 'SUCCESS' ? 'Online' : connStatus === 'ERROR' ? 'Falha de Conexão' : 'Desconhecido'}
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Endpoint do Webservice DOI (Homologação/Produção)</label>
                       <input 
                         type="text" 
                         defaultValue="https://ws.doi.receita.fazenda.gov.br/transmissao/v2" 
                         className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-mono focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                       />
                    </div>

                    <button 
                      onClick={testConnection}
                      disabled={isTestingConn}
                      className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-95"
                    >
                      {isTestingConn ? <Loader2 size={16} className="animate-spin" /> : <Wifi size={16} />}
                      {isTestingConn ? 'Pingando Servidores...' : 'Testar Comunicação'}
                    </button>

                    {connStatus === 'SUCCESS' && (
                      <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in-95">
                         <Check size={18} className="text-green-600" />
                         <span className="text-xs font-bold text-green-700">Handshake concluído com sucesso. Servidor respondeu em 142ms.</span>
                      </div>
                    )}
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
               {/* Change Password Block */}
               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-900 text-white rounded-2xl"><Lock size={24} /></div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800 tracking-tight">Alterar Senha</h3>
                      <p className="text-sm text-slate-400 font-medium">Recomendamos uma senha forte com caracteres especiais.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Senha Atual</label>
                        <input type="password" placeholder="••••••••" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all" />
                     </div>
                     <div className="space-y-2 md:col-start-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nova Senha</label>
                        <input type="password" placeholder="Mínimo 8 caracteres" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Confirmar Nova Senha</label>
                        <input type="password" placeholder="Repita a nova senha" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all" />
                     </div>
                  </div>

                  <button 
                    onClick={handleChangePassword}
                    disabled={isChangingPass}
                    className={`flex items-center gap-3 px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
                      passChanged ? 'bg-green-600 text-white shadow-green-100' : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {isChangingPass ? <Loader2 size={16} className="animate-spin" /> : passChanged ? <Check size={16} /> : <Key size={16} />}
                    {isChangingPass ? 'Atualizando...' : passChanged ? 'Senha Alterada' : 'Atualizar Credenciais'}
                  </button>
               </div>

               {/* 2FA & Biometrics Block */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Fingerprint size={24} /></div>
                      <h3 className="font-black text-slate-800">Duplo Fator (2FA)</h3>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">Adicione uma camada extra de segurança à sua conta exigindo um código do seu telefone ao entrar.</p>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <span className="text-xs font-bold text-slate-700">Autenticação por App</span>
                       <button 
                        onClick={() => setIsTwoFactorEnabled(!isTwoFactorEnabled)}
                        className={`w-12 h-6 rounded-full transition-all relative ${isTwoFactorEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}
                       >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isTwoFactorEnabled ? 'left-7' : 'left-1'}`}></div>
                       </button>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl"><ShieldAlert size={24} /></div>
                      <h3 className="font-black text-slate-800">Alertas Críticos</h3>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">Notificar por e-mail sempre que houver uma tentativa de login de um dispositivo não reconhecido.</p>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <span className="text-xs font-bold text-slate-700">Notificações Ativas</span>
                       <button className="w-12 h-6 rounded-full bg-blue-600 relative">
                          <div className="absolute top-1 left-7 w-4 h-4 bg-white rounded-full"></div>
                       </button>
                    </div>
                  </div>
               </div>

               {/* Active Sessions */}
               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-100 text-slate-600 rounded-2xl"><Laptop size={24} /></div>
                      <div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Sessões Ativas</h3>
                        <p className="text-sm text-slate-400 font-medium">Dispositivos logados atualmente em sua conta.</p>
                      </div>
                    </div>
                    <button className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline">Sair de todas as sessões</button>
                  </div>

                  <div className="space-y-3">
                    {sessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-blue-200 transition-all">
                        <div className="flex items-center gap-5">
                          <div className={`p-3 rounded-2xl ${session.current ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white text-slate-400'}`}>
                            {session.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-black text-slate-800">{session.device}</p>
                              {session.current && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-black uppercase tracking-widest rounded-md">Este Dispositivo</span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold mt-0.5">{session.location} • {session.ip}</p>
                          </div>
                        </div>
                        {!session.current && (
                          <button className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                            <LogOut size={18} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'office' && (
             <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300">
                   <Building2 size={40} />
                </div>
                <div>
                   <h3 className="text-xl font-black text-slate-800 tracking-tight">Configurações do Cartório</h3>
                   <p className="text-sm text-slate-400 max-w-sm mt-2">Personalize os dados da sua serventia para emissão correta das DOIs.</p>
                </div>
                <button className="px-8 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg">Editar Serventia</button>
             </div>
          )}

          {/* Action Button Area */}
          {activeTab !== 'security' && (
            <div className="flex items-center justify-end gap-4 pt-4">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className={`flex items-center gap-2 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl active:scale-95 ${
                  saved 
                  ? 'bg-green-600 text-white shadow-green-100' 
                  : 'bg-slate-900 text-white shadow-slate-200 hover:bg-slate-800'
                }`}
              >
                  {isSaving ? <RefreshCw size={18} className="animate-spin" /> : saved ? <Check size={18} strokeWidth={3} /> : <Save size={18} />}
                  {isSaving ? 'Salvando...' : saved ? 'Salvo com Sucesso' : 'Salvar Alterações'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
