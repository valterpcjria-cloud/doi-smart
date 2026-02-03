
import React, { useState, useRef } from 'react';
import { extractDataFromDeed, extractDataFromImage } from '../services/geminiService';
import { ExtractionResult } from '../types';
import { useNotification } from '../hooks/useNotification';
import {
  Loader2, FileText, Sparkles, X, Check, Upload,
  Image as ImageIcon, FileType, User, Home,
  CreditCard, Hash, MapPin, Scale, Plus, Trash2
} from 'lucide-react';

interface ExtractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (result: ExtractionResult) => void;
  initialData?: ExtractionResult | null;
  mode?: 'extract' | 'review' | 'edit';
}

const ExtractionModal: React.FC<ExtractionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  mode = 'extract'
}) => {
  const [text, setText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const notification = useNotification();

  React.useEffect(() => {
    if (isOpen && initialData) {
      setResult(initialData);
    } else if (isOpen && !initialData) {
      setResult(null);
      setText('');
      setFile(null);
      setFilePreview(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setText('');
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setFilePreview(reader.result as string);
        reader.readAsDataURL(selectedFile);
      } else {
        setFilePreview(null);
      }
    }
  };

  const clearInputs = () => {
    setText('');
    setFile(null);
    setFilePreview(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExtract = async () => {
    setIsExtracting(true);
    try {
      let data: ExtractionResult;
      if (file) {
        const base64 = await fileToBase64(file);
        const base64Clean = base64.split(',')[1];
        data = await extractDataFromImage(base64Clean, file.type);
      } else if (text.trim()) {
        data = await extractDataFromDeed(text);
      } else {
        return;
      }
      setResult(data);
      notification.success('Dados extraídos com sucesso!');
    } catch (err: any) {
      console.error(err);
      notification.error(`Erro na extração: ${err.message || 'Verifique a legibilidade do documento.'}`);
    } finally {
      setIsExtracting(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };


  const handleConfirm = () => {
    if (result) {
      onSave(result);
      clearInputs();
      onClose();
    }
  };


  const handleUpdate = (section: keyof ExtractionResult, field: string, value: any, subIndex?: number, subField?: string) => {
    if (!result) return;

    setResult((prev) => {
      if (!prev) return null;
      const newData = { ...prev };

      if (section === 'sellers' || section === 'buyers') {
        if (typeof subIndex === 'number' && subField) {
          // @ts-ignore
          newData[section][subIndex][subField] = value;
        }
      } else {
        // @ts-ignore
        newData[section] = {
          ...newData[section],
          [field]: value
        };
      }
      return newData;
    });
  };

  const handleAddParty = (type: 'sellers' | 'buyers') => {
    if (!result) return;
    setResult((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        [type]: [...prev[type], { name: '', id: '', share: 0, civilStatus: '' }]
      };
    });
  };

  const handleRemoveParty = (type: 'sellers' | 'buyers', index: number) => {
    if (!result) return;
    setResult((prev) => {
      if (!prev) return null;
      const newList = [...prev[type]];
      newList.splice(index, 1);
      return {
        ...prev,
        [type]: newList
      };
    });
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div className="bg-white w-full max-w-7xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 text-white rounded-2xl ring-8 ring-blue-50/50 shadow-lg">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="font-black text-slate-900 text-xl tracking-tight">
                {mode === 'extract' ? 'Análise Técnica RFB (v4.0.1)' : mode === 'edit' ? 'Editar Dados da DOI' : 'Revisão de Detalhes'}
              </h2>
              <p className="text-sm text-slate-400 font-medium tracking-tight">
                {mode === 'extract' ? 'Extração Inteligente: Dados da Operação, Imóvel, Envolvidos e Financeiro' : 'Visualize e confira os dados completos do registro.'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
            <X size={22} />
          </button>
        </div>

        <div className={`flex-1 overflow-hidden grid grid-cols-1 ${mode === 'extract' ? 'lg:grid-cols-12' : 'lg:grid-cols-1'}`}>
          {/* Input Panel (3 columns) - Only in Extract Mode */}
          {mode === 'extract' && (
            <div className="lg:col-span-3 p-6 border-r border-slate-100 flex flex-col gap-6 overflow-y-auto bg-slate-50/30">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Origem</label>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-[2rem] p-6 transition-all cursor-pointer group flex flex-col items-center justify-center text-center ${file ? 'border-blue-400 bg-blue-50/30' : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'
                  }`}
              >
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf" onChange={handleFileChange} />
                {file ? (
                  <div className="animate-in fade-in zoom-in-95">
                    {filePreview ? <img src={filePreview} className="w-16 h-16 object-cover rounded-xl mx-auto shadow-md mb-2" alt="Preview" /> : <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-2"><FileType size={24} /></div>}
                    <p className="text-xs font-bold text-slate-800 truncate px-2">{file.name}</p>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 mb-2 group-hover:scale-110 transition-all"><Upload size={20} /></div>
                    <p className="text-xs font-bold text-slate-700">Upload (IMG/PDF)</p>
                  </>
                )}
              </div>

              <textarea
                value={text}
                onChange={(e) => { setText(e.target.value); if (e.target.value) setFile(null); }}
                placeholder="Ou cole o texto da escritura aqui..."
                className="flex-1 bg-white border border-slate-200 rounded-3xl p-4 text-xs font-medium text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none resize-none min-h-[150px] transition-all"
              />

              <button
                onClick={handleExtract}
                disabled={(!text.trim() && !file) || isExtracting}
                className="w-full h-12 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95"
              >
                {isExtracting ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {isExtracting ? 'Processando...' : 'Extrair Dados'}
              </button>
            </div>
          )}

          {/* Preview Panel (9 columns or full) */}
          <div className={`${mode === 'extract' ? 'lg:col-span-9' : 'lg:col-span-1'} p-8 bg-slate-50 overflow-y-auto`}>
            {result ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">

                {/* 1. DADOS DA OPERAÇÃO E FINANCEIROS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="col-span-2 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><FileText size={18} /></div>
                      <h3 className="font-bold text-slate-800 text-sm uppercase">Dados da Operação</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Tipo</p>
                        <EditableField mode={mode}
                          value={result.operation.type}
                          onChange={(v) => handleUpdate('operation', 'type', v)}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Natureza</p>
                        <EditableField mode={mode}
                          value={result.operation.nature}
                          onChange={(v) => handleUpdate('operation', 'nature', v)}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Documento</p>
                        <EditableField mode={mode}
                          value={result.operation.documentType}
                          onChange={(v) => handleUpdate('operation', 'documentType', v)}
                          className="text-xs text-slate-700"
                        />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Data Ato</p>
                        <EditableField mode={mode}
                          value={result.operation.date}
                          onChange={(v) => handleUpdate('operation', 'date', v)}
                          className="text-xs font-bold text-slate-700"
                          formatter={formatDate}
                          type="date"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-green-100 text-green-600 rounded-lg"><CreditCard size={18} /></div>
                      <h3 className="font-bold text-slate-800 text-sm uppercase">Financeiro</h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Valor Operação</p>
                        <EditableField mode={mode}
                          value={result.property.value}
                          onChange={(v) => handleUpdate('property', 'value', Number(v) || 0)}
                          className="text-lg font-black text-green-600"
                          formatter={formatCurrency}
                          type="currency"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">ITBI</p>
                          <EditableField mode={mode}
                            value={result.operation.itbiValue}
                            onChange={(v) => handleUpdate('operation', 'itbiValue', Number(v) || 0)}
                            className="text-xs font-bold text-slate-700"
                            formatter={formatCurrency}
                            type="number"
                          />
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">ITCD</p>
                          <EditableField mode={mode}
                            value={result.operation.itcdValue}
                            onChange={(v) => handleUpdate('operation', 'itcdValue', Number(v) || 0)}
                            className="text-xs font-bold text-slate-700"
                            formatter={formatCurrency}
                            type="number"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. DADOS DOS ENVOLVIDOS (Adquirentes e Alienantes) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Alienantes (Vendedores) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between ml-1">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Alienantes ({result.sellers.length})</h3>
                      {mode === 'edit' && (
                        <button onClick={() => handleAddParty('sellers')} className="text-blue-600 hover:text-blue-700 text-[10px] font-bold flex items-center gap-1">
                          <Plus size={12} /> ADICIONAR
                        </button>
                      )}
                    </div>
                    <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
                      {result.sellers.map((seller, idx) => (
                        <div key={idx} className="flex items-start gap-3 pb-3 border-b border-slate-50 last:border-0 last:pb-0 relative group">
                          <div className="mt-1 p-1.5 bg-red-50 text-red-500 rounded-full"><User size={14} /></div>
                          <div className="flex-1">
                            <EditableField mode={mode}
                              value={seller.name}
                              onChange={(v) => handleUpdate('sellers', 'name', v, idx, 'name')}
                              className="text-xs font-bold text-slate-800"
                              placeholder="Nome do Alienante"
                            />
                            <div className="flex gap-2 text-[10px] font-medium text-slate-500 mt-1">
                              <EditableField mode={mode} value={seller.id} onChange={(v) => handleUpdate('sellers', 'id', v, idx, 'id')} className="" placeholder="CPF/CNPJ" />
                              <span>•</span>
                              <EditableField mode={mode} value={seller.civilStatus} onChange={(v) => handleUpdate('sellers', 'civilStatus', v, idx, 'civilStatus')} className="" placeholder="Estado Civil" />
                              <span className="text-red-500 font-bold flex gap-1 items-center">
                                • <EditableField mode={mode} value={seller.share} onChange={(v) => handleUpdate('sellers', 'share', Number(v) || 0, idx, 'share')} className="w-10 text-center" /> %
                              </span>
                            </div>
                          </div>
                          {mode === 'edit' && (
                            <button onClick={() => handleRemoveParty('sellers', idx)} className="absolute top-0 right-0 p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                      {result.sellers.length === 0 && <p className="text-center text-xs text-slate-300 italic py-2">Nenhum alienante listado</p>}
                    </div>
                  </div>

                  {/* Adquirentes (Compradores) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between ml-1">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Adquirentes ({result.buyers.length})</h3>
                      {mode === 'edit' && (
                        <button onClick={() => handleAddParty('buyers')} className="text-blue-600 hover:text-blue-700 text-[10px] font-bold flex items-center gap-1">
                          <Plus size={12} /> ADICIONAR
                        </button>
                      )}
                    </div>
                    <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
                      {result.buyers.map((buyer, idx) => (
                        <div key={idx} className="flex items-start gap-3 pb-3 border-b border-slate-50 last:border-0 last:pb-0 relative group">
                          <div className="mt-1 p-1.5 bg-blue-50 text-blue-500 rounded-full"><User size={14} /></div>
                          <div className="flex-1">
                            <EditableField mode={mode}
                              value={buyer.name}
                              onChange={(v) => handleUpdate('buyers', 'name', v, idx, 'name')}
                              className="text-xs font-bold text-slate-800"
                              placeholder="Nome do Adquirente"
                            />
                            <div className="flex gap-2 text-[10px] font-medium text-slate-500 mt-1">
                              <EditableField mode={mode} value={buyer.id} onChange={(v) => handleUpdate('buyers', 'id', v, idx, 'id')} className="" placeholder="CPF/CNPJ" />
                              <span>•</span>
                              <EditableField mode={mode} value={buyer.civilStatus} onChange={(v) => handleUpdate('buyers', 'civilStatus', v, idx, 'civilStatus')} className="" placeholder="Estado Civil" />
                              <span className="text-blue-500 font-bold flex gap-1 items-center">
                                • <EditableField mode={mode} value={buyer.share} onChange={(v) => handleUpdate('buyers', 'share', Number(v) || 0, idx, 'share')} className="w-10 text-center" /> %
                              </span>
                            </div>
                          </div>
                          {mode === 'edit' && (
                            <button onClick={() => handleRemoveParty('buyers', idx)} className="absolute top-0 right-0 p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                      {result.buyers.length === 0 && <p className="text-center text-xs text-slate-300 italic py-2">Nenhum adquirente listado</p>}
                    </div>
                  </div>
                </div>

                {/* 3. DADOS DO IMÓVEL E CARTÓRIO */}
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Imóvel e Registro</h3>
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Home size={16} className="text-purple-500" />
                          <h4 className="text-xs font-bold text-slate-900 uppercase">Dados do Imóvel</h4>
                        </div>
                        {mode === 'edit' ? (
                          <textarea
                            className="w-full h-20 bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-700 font-bold mb-4 outline-none focus:ring-2 focus:ring-blue-500/20"
                            value={result.property.address}
                            onChange={(e) => handleUpdate('property', 'address', e.target.value)}
                          />
                        ) : (
                          <p className="text-sm text-slate-700 leading-relaxed mb-4">{cleanAddress(result.property.address)}</p>
                        )}
                        <div className="flex flex-wrap gap-3">
                          <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                            <p className="text-[8px] font-black text-slate-400 uppercase whitespace-nowrap">Matrícula</p>
                            <EditableField mode={mode} value={result.property.registry} onChange={(v) => handleUpdate('property', 'registry', v)} className="text-[10px] whitespace-nowrap" />
                          </div>
                          <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                            <p className="text-[8px] font-black text-slate-400 uppercase whitespace-nowrap">NIRF</p>
                            <EditableField mode={mode} value={result.property.nirf} onChange={(v) => handleUpdate('property', 'nirf', v)} className="text-[10px] whitespace-nowrap" />
                          </div>
                          <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                            <p className="text-[8px] font-black text-slate-400 uppercase whitespace-nowrap">IPTU</p>
                            <EditableField mode={mode} value={result.property.iptu} onChange={(v) => handleUpdate('property', 'iptu', v)} className="text-[10px] whitespace-nowrap" />
                          </div>
                          <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                            <p className="text-[8px] font-black text-slate-400 uppercase whitespace-nowrap">Área</p>
                            <EditableField mode={mode} value={result.property.area} onChange={(v) => handleUpdate('property', 'area', v)} className="text-[10px] whitespace-nowrap" />
                          </div>
                          <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                            <p className="text-[8px] font-black text-slate-400 uppercase whitespace-nowrap">Tipo</p>
                            <EditableField mode={mode} value={result.property.type} onChange={(v) => handleUpdate('property', 'type', v)} className="text-[10px] whitespace-nowrap" />
                          </div>
                        </div>
                      </div>
                      <div className="w-px bg-slate-100 hidden md:block"></div>
                      <div className="w-full md:w-1/3">
                        <div className="flex items-center gap-2 mb-2">
                          <Scale size={16} className="text-orange-500" />
                          <h4 className="text-xs font-bold text-slate-900 uppercase">Cartório</h4>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">Nome da Serventia</p>
                            <EditableField mode={mode} value={result.registryOffice.name || ''} onChange={(v) => handleUpdate('registryOffice', 'name', v)} className="text-xs font-bold text-slate-800" />
                          </div>
                          <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">Tabelião/Oficial</p>
                            <EditableField mode={mode} value={result.registryOffice.official || ''} onChange={(v) => handleUpdate('registryOffice', 'official', v)} className="text-xs font-bold text-slate-800" />
                          </div>
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <p className="text-[9px] font-bold text-slate-400 uppercase">Livro</p>
                              <EditableField mode={mode} value={result.operation.book} onChange={(v) => handleUpdate('operation', 'book', v)} className="text-xs" />
                            </div>
                            <div className="flex-1">
                              <p className="text-[9px] font-bold text-slate-400 uppercase">Folha</p>
                              <EditableField mode={mode} value={result.operation.page} onChange={(v) => handleUpdate('operation', 'page', v)} className="text-xs" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {mode !== 'review' && (
                  <button
                    onClick={handleConfirm}
                    className="w-full h-16 bg-green-600 hover:bg-green-700 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3 shadow-2xl shadow-green-100 active:scale-95"
                  >
                    <Check size={20} strokeWidth={3} />
                    {mode === 'edit' ? 'Salvar Alterações' : 'Confirmar e Importar'}
                  </button>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-40">
                <Sparkles size={64} className="text-slate-200 mb-6" />
                <h4 className="text-slate-900 font-black text-xl mb-2">Motor de Conformidade</h4>
                <p className="text-slate-500 text-sm font-medium max-w-xs">Cole o texto da escritura ou envie uma imagem/PDF para análise completa.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Badge = ({ label, value }: { label: string, value?: string }) => (
  <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
    <p className="text-[8px] font-black text-slate-400 uppercase whitespace-nowrap">{label}</p>
    <p className="text-[10px] font-bold text-slate-700 whitespace-nowrap">{value || '--'}</p>
  </div>
);

const TechStat = ({ icon, label, value }: { icon: any, label: string, value: string }) => (
  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
    <div className="text-slate-400 mb-2">{icon}</div>
    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
    <p className="text-xs font-black text-slate-800 uppercase">{value || 'N/A'}</p>
  </div>
);

const formatDate = (dateString: string) => {
  if (!dateString) return '--';
  if (dateString.includes('/')) return dateString;
  const parts = dateString.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return dateString;
};

const cleanAddress = (address: string) => {
  if (!address) return '';
  return address.replace(/, null/g, '').replace(/undefined/g, '').trim();
};

const formatCurrency = (value: number | string) => {
  const num = Number(value);
  if (isNaN(num)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
};

interface EditableFieldProps {
  mode: string;
  value: string | number;
  onChange: (val: string) => void;
  className?: string;
  placeholder?: string;
  placeholder?: string;
  formatter?: (val: any) => string;
  type?: 'text' | 'number' | 'date' | 'currency';
}

const EditableField = ({
  mode,
  value,
  onChange,
  className = "",
  placeholder = "",
  formatter,
  type = 'text'
}: EditableFieldProps) => {
  if (mode === 'edit') {
    if (type === 'currency') {
      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Remove tudo que não é dígito
        const rawValue = e.target.value.replace(/\D/g, '');
        // Converte para float (centavos)
        const floatValue = rawValue ? parseInt(rawValue, 10) / 100 : 0;
        onChange(floatValue.toString());
      };

      // Formata o valor atual para exibir no input
      const displayValue = value || value === 0
        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value))
        : '';

      return (
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          className={`w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 outline-none ${className}`}
          placeholder={placeholder}
        />
      );
    }

    return (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 outline-none ${className}`}
        placeholder={placeholder}
      />
    );
  }
  const displayValue = formatter ? formatter(value) : value;
  return <p className={`text-slate-900 font-bold ${className}`}>{displayValue || '--'}</p>;
};

export default ExtractionModal;
