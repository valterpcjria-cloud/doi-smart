
import React, { useState, useEffect } from 'react';
import { Certificate } from '../types';
import { 
  X, ShieldCheck, Loader2, Cpu, Check, AlertTriangle, 
  Key, FileUp, Eye, EyeOff, Radio, RefreshCcw, 
  Usb, Smartphone, MonitorSmartphone, ChevronRight, Info,
  Calendar as CalendarIcon, User as UserIcon
} from 'lucide-react';

interface FoundDevice {
  id: string;
  name: string;
  serial: string;
  provider: string;
  owner: string;
  expiry: string;
}

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cert: Omit<Certificate, 'id' | 'status'>) => void;
}

const CertificateModal: React.FC<CertificateModalProps> = ({ isOpen, onClose, onSave }) => {
  const [type, setType] = useState<'A1' | 'A3'>('A3');
  const [owner, setOwner] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // A3 Specific State
  const [isScanning, setIsScanning] = useState(false);
  const [foundDevices, setFoundDevices] = useState<FoundDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) {
      setOwner('');
      setExpiryDate('');
      setPassword('');
      setFoundDevices([]);
      setSelectedDeviceId(null);
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleScanDevices = async () => {
    setIsScanning(true);
    setFoundDevices([]);
    setSelectedDeviceId(null);
    setErrors({});
    
    // Simulating hardware discovery across USB ports
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockDevices: FoundDevice[] = [
      { 
        id: 'dev-1', 
        name: 'SafeNet eToken 5110', 
        serial: 'SN-882199', 
        provider: 'Certisign',
        owner: 'CARTÓRIO DO 1º OFÍCIO - 12.345.678/0001-90',
        expiry: '2028-12-31'
      },
      { 
        id: 'dev-2', 
        name: 'G&D StarSign Crypto USB', 
        serial: 'SN-441022', 
        provider: 'Soluti',
        owner: 'MARIA APARECIDA SILVA - 123.456.789-00',
        expiry: '2027-05-15'
      }
    ];
    
    setFoundDevices(mockDevices);
    setIsScanning(false);
  };

  const selectDevice = (device: FoundDevice) => {
    setSelectedDeviceId(device.id);
    setOwner(device.owner);
    setExpiryDate(device.expiry);
    setErrors(prev => ({ ...prev, device: '', owner: '', expiryDate: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Titular validation
    if (!owner.trim()) {
      newErrors.owner = "O titular é obrigatório.";
    } else if (owner.trim().length < 5) {
      newErrors.owner = "O nome do titular deve ter pelo menos 5 caracteres.";
    }

    // Expiry Date validation
    if (!expiryDate) {
      newErrors.expiryDate = "A data de validade é obrigatória.";
    } else {
      const selectedDate = new Date(expiryDate);
      if (selectedDate <= today) {
        newErrors.expiryDate = "A data de validade deve ser futura.";
      }
    }

    // Password validation (A1 only)
    if (type === 'A1') {
      if (!password) {
        newErrors.password = "A senha de importação é obrigatória.";
      } else if (password.length < 4) {
        newErrors.password = "A senha deve ter pelo menos 4 caracteres.";
      }
    }

    // Hardware selection (A3 only)
    if (type === 'A3' && !selectedDeviceId) {
      newErrors.device = "Selecione um hardware A3 detectado antes de prosseguir.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave({ owner, expiryDate, type });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 fade-in duration-300 border border-white/20">
        
        {/* Header */}
        <div className="p-7 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg ring-4 ring-blue-50">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="font-black text-slate-800 text-xl tracking-tight">Nova Identidade Digital</h2>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-0.5">Gestão de Certificados e Tokens</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 text-slate-400 hover:bg-white rounded-full transition-all border border-transparent hover:border-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-7 overflow-y-auto max-h-[70vh] custom-scrollbar">
          {/* Type Selector */}
          <div className="flex p-1.5 bg-slate-100 rounded-[1.25rem] border border-slate-200/40">
            <button 
              onClick={() => { setType('A1'); setErrors({}); }}
              className={`flex-1 py-3 text-[11px] font-black uppercase tracking-wider rounded-[1rem] transition-all flex items-center justify-center gap-2.5 ${type === 'A1' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <FileUp size={16} /> Certificado A1
            </button>
            <button 
              onClick={() => { setType('A3'); setErrors({}); }}
              className={`flex-1 py-3 text-[11px] font-black uppercase tracking-wider rounded-[1rem] transition-all flex items-center justify-center gap-2.5 ${type === 'A3' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Usb size={16} /> Token / A3
            </button>
          </div>

          {type === 'A3' ? (
            <div className="space-y-6 animate-in fade-in duration-500">
              {/* Scan Button */}
              <button 
                onClick={handleScanDevices}
                disabled={isScanning}
                className={`w-full py-6 border-2 border-dashed rounded-[2rem] text-xs font-black uppercase tracking-widest transition-all flex flex-col items-center justify-center gap-3 ${
                  isScanning ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                {isScanning ? (
                  <>
                    <Loader2 size={32} className="animate-spin" />
                    <span className="animate-pulse">Escaneando portas USB...</span>
                  </>
                ) : (
                  <>
                    <Usb size={32} />
                    <span>Detectar Tokens Conectados</span>
                  </>
                )}
              </button>

              {/* Devices List */}
              {foundDevices.length > 0 && (
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">Dispositivos Encontrados ({foundDevices.length})</label>
                  {foundDevices.map((device) => (
                    <button
                      key={device.id}
                      onClick={() => selectDevice(device)}
                      className={`w-full p-5 rounded-3xl border-2 text-left transition-all flex items-center gap-4 group ${
                        selectedDeviceId === device.id 
                          ? 'bg-blue-50 border-blue-600 shadow-lg shadow-blue-50' 
                          : 'bg-white border-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <div className={`p-3 rounded-2xl transition-colors ${selectedDeviceId === device.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                        <Cpu size={20} />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-center mb-1">
                          <p className={`text-sm font-black ${selectedDeviceId === device.id ? 'text-blue-900' : 'text-slate-800'}`}>{device.name}</p>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{device.serial}</span>
                        </div>
                        <p className={`text-[10px] font-bold truncate ${selectedDeviceId === device.id ? 'text-blue-700' : 'text-slate-400'}`}>Titular: {device.owner}</p>
                      </div>
                      <div className={`p-1.5 rounded-full transition-all ${selectedDeviceId === device.id ? 'bg-blue-600 text-white scale-110' : 'text-slate-200 opacity-0 group-hover:opacity-100'}`}>
                        <Check size={14} strokeWidth={3} />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {errors.device && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-in shake">
                  <AlertTriangle size={16} className="text-red-500" />
                  <p className="text-[10px] font-black text-red-600 uppercase tracking-widest leading-tight">{errors.device}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-500">
               <div className="group">
                  <label className="text-[10px] font-black uppercase tracking-[0.15em] mb-2 block ml-1 text-slate-400">Upload Certificado (.pfx / .p12)</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-8 text-center hover:bg-slate-50 transition-all cursor-pointer group/upload">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover/upload:bg-blue-600 group-hover/upload:text-white transition-all">
                      <FileUp size={28} />
                    </div>
                    <p className="text-xs font-black text-slate-800 uppercase">Selecionar Arquivo</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 gap-5">
                  <div className="space-y-2">
                    <label className={`text-[10px] font-black uppercase tracking-[0.15em] ml-1 flex items-center gap-1.5 ${errors.owner ? 'text-red-500' : 'text-slate-400'}`}>
                      <UserIcon size={12} /> Titular do Certificado
                    </label>
                    <input 
                      type="text"
                      value={owner}
                      onChange={(e) => setOwner(e.target.value)}
                      placeholder="Nome completo ou Razão Social"
                      className={`w-full px-5 py-3.5 bg-slate-50 border rounded-2xl text-sm font-semibold outline-none focus:ring-4 transition-all ${
                        errors.owner ? 'border-red-300 focus:ring-red-500/10' : 'border-slate-200 focus:ring-blue-500/10'
                      }`}
                    />
                    {errors.owner && <p className="text-[9px] font-bold text-red-500 ml-1">{errors.owner}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className={`text-[10px] font-black uppercase tracking-[0.15em] ml-1 flex items-center gap-1.5 ${errors.expiryDate ? 'text-red-500' : 'text-slate-400'}`}>
                      <CalendarIcon size={12} /> Data de Validade
                    </label>
                    <input 
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className={`w-full px-5 py-3.5 bg-slate-50 border rounded-2xl text-sm font-semibold outline-none focus:ring-4 transition-all ${
                        errors.expiryDate ? 'border-red-300 focus:ring-red-500/10' : 'border-slate-200 focus:ring-blue-500/10'
                      }`}
                    />
                    {errors.expiryDate && <p className="text-[9px] font-bold text-red-500 ml-1">{errors.expiryDate}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className={`text-[10px] font-black uppercase tracking-[0.15em] ml-1 flex items-center gap-1.5 ${errors.password ? 'text-red-500' : 'text-slate-400'}`}>
                      <Key size={12} /> Senha de Importação
                    </label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Senha do arquivo .pfx"
                        className={`w-full pl-5 pr-12 py-3.5 bg-slate-50 border rounded-2xl text-sm font-semibold outline-none focus:ring-4 transition-all ${
                          errors.password ? 'border-red-300 focus:ring-red-500/10' : 'border-slate-200 focus:ring-blue-500/10'
                        }`}
                      />
                      <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 p-1">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.password && <p className="text-[9px] font-bold text-red-500 ml-1">{errors.password}</p>}
                  </div>
               </div>
            </div>
          )}

          {/* Device Summary (A3 only) */}
          {type === 'A3' && selectedDeviceId && (
            <div className="pt-4 space-y-5 animate-in slide-in-from-top-4 duration-500">
              <div className="p-5 bg-blue-50/50 rounded-3xl border border-blue-100 space-y-4">
                 <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest">
                    <Info size={14} /> Metadados do Hardware
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                      <label className="text-[8px] font-black uppercase text-slate-400 block mb-0.5">Titular</label>
                      <p className="text-[11px] font-black text-slate-800 leading-tight">{owner}</p>
                   </div>
                   <div>
                      <label className="text-[8px] font-black uppercase text-slate-400 block mb-0.5">Validade</label>
                      <p className={`text-[11px] font-black leading-tight ${errors.expiryDate ? 'text-red-500' : 'text-slate-800'}`}>
                        {expiryDate ? new Date(expiryDate).toLocaleDateString('pt-BR') : '—'}
                      </p>
                   </div>
                 </div>
                 {errors.expiryDate && <p className="text-[9px] font-bold text-red-500 leading-none">{errors.expiryDate}</p>}
              </div>
            </div>
          )}

          {/* Action Footer */}
          <button 
            onClick={handleSave}
            className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95 mt-4"
          >
            <Check size={20} strokeWidth={3} />
            Confirmar e Registrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificateModal;
