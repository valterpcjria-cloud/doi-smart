
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import DOIList from './components/DOIList';
import ExtractionModal from './components/ExtractionModal';
import TransmissionModal from './components/TransmissionModal';
import CertificatesView from './components/CertificatesView';
import CertificateModal from './components/CertificateModal';
import HistoryView from './components/HistoryView';
import SettingsView from './components/SettingsView';
import { DOIEntry, DOIStatus, ExtractionResult, Certificate } from './types';
import { TransmissionResponse } from './services/transmissionService';
import { useDoiStore, useCertificateStore } from './stores';
import { useNotification } from './hooks/useNotification';
import { Plus, WifiOff } from 'lucide-react';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [isExtractionOpen, setIsExtractionOpen] = useState(false);
  const [isTransmissionOpen, setIsTransmissionOpen] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [batchToTransmit, setBatchToTransmit] = useState<DOIEntry[]>([]);

  const [selectedDoi, setSelectedDoi] = useState<DOIEntry | null>(null);
  const [extractionMode, setExtractionMode] = useState<'extract' | 'review' | 'edit'>('extract');

  // Zustand stores
  const { dois, fetchDois, addDoi, deleteDoi, updateMultipleDoisStatus, isLoading: isDoiLoading, error: doiError } = useDoiStore();
  const { certificates, fetchCertificates, addCertificate, deleteCertificate, setActiveCertificate, isLoading: isCertLoading } = useCertificateStore();

  // Notifications
  const notification = useNotification();

  // Fetch inicial
  useEffect(() => {
    fetchDois();
    fetchCertificates();
  }, [fetchDois, fetchCertificates]);

  const doiToResult = (doi: DOIEntry): ExtractionResult => ({
    sellers: doi.parties.filter(p => p.role === 'SELLER').map(p => ({ ...p, civilStatus: p.civilStatus || '', share: p.share || 0 })),
    buyers: doi.parties.filter(p => p.role === 'BUYER').map(p => ({ ...p, civilStatus: p.civilStatus || '', share: p.share || 0 })),
    property: {
      address: doi.propertyAddress,
      registry: doi.registryNumber,
      value: doi.value,
      area: doi.area || '',
      type: 'URBANO',
      nirf: doi.nirf || '',
      iptu: doi.iptu || ''
    },
    operation: {
      type: doi.operationType,
      nature: doi.operationNature || '',
      documentType: doi.documentType || '',
      paymentMethod: doi.paymentMethod as any,
      book: doi.book || '',
      page: doi.page || '',
      date: doi.date,
      itbiValue: doi.itbiValue || 0,
      itcdValue: doi.itcdValue || 0
    },
    registryOffice: {
      name: doi.registryOffice?.name || '',
      official: doi.registryOffice?.official || '',
      code: doi.registryOffice?.code || ''
    }
  });

  const handleReview = (doi: DOIEntry) => {
    setSelectedDoi(doi);
    setExtractionMode('review');
    setIsExtractionOpen(true);
  };

  const handleEdit = (doi: DOIEntry) => {
    setSelectedDoi(doi);
    setExtractionMode('edit');
    setIsExtractionOpen(true);
  };

  const handleExtractionSave = async (result: ExtractionResult) => {
    if (extractionMode === 'edit' && selectedDoi) {
      // UPDATE LOGIC
      const updatedDoi: Partial<DOIEntry> = {
        date: result.operation.date,
        propertyAddress: result.property.address,
        registryNumber: result.property.registry,
        value: result.property.value,
        lastUpdate: new Date().toISOString(),
        operationType: result.operation.type,
        operationNature: result.operation.nature,
        documentType: result.operation.documentType,
        paymentMethod: result.operation.paymentMethod,
        book: result.operation.book,
        page: result.operation.page,
        area: result.property.area,
        nirf: result.property.nirf,
        iptu: result.property.iptu,
        itbiValue: result.operation.itbiValue,
        itcdValue: result.operation.itcdValue,
        registryOffice: result.registryOffice,
        parties: [
          ...result.sellers.map(s => ({ name: s.name, id: s.id, role: 'SELLER' as const, share: s.share, civilStatus: s.civilStatus })),
          ...result.buyers.map(b => ({ name: b.name, id: b.id, role: 'BUYER' as const, share: b.share, civilStatus: b.civilStatus }))
        ]
      };

      try {
        await useDoiStore.getState().updateDoi(selectedDoi.id, updatedDoi);
        await fetchDois(); // Forçar atualização garantida da lista
        notification.success('DOI atualizada com sucesso!');
        setIsExtractionOpen(false);
      } catch (e: any) {
        notification.error(`Erro ao atualizar DOI: ${e.message}`);
      }
      return;
    }

    const newDoi: DOIEntry = {
      id: '', // Backend gera o ID (codigo) baseado no ano/sequencial
      date: result.operation.date || new Date().toISOString().split('T')[0],
      competence: `${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${new Date().getFullYear()}`,
      propertyAddress: result.property.address,
      registryNumber: result.property.registry,
      value: result.property.value,
      status: DOIStatus.READY,
      lastUpdate: new Date().toISOString(),
      operationType: result.operation.type,
      operationNature: result.operation.nature,
      documentType: result.operation.documentType,
      paymentMethod: result.operation.paymentMethod,
      book: result.operation.book,
      page: result.operation.page,
      area: result.property.area,
      nirf: result.property.nirf,
      iptu: result.property.iptu,
      itbiValue: result.operation.itbiValue,
      itcdValue: result.operation.itcdValue,
      registryOffice: result.registryOffice,
      parties: [
        ...result.sellers.map(s => ({ name: s.name, id: s.id, role: 'SELLER' as const, share: s.share, civilStatus: s.civilStatus })),
        ...result.buyers.map(b => ({ name: b.name, id: b.id, role: 'BUYER' as const, share: b.share, civilStatus: b.civilStatus }))
      ]
    };

    try {
      await addDoi(newDoi);
      await fetchDois(); // Forçar atualização garantida
      notification.success('DOI extraída e salva com sucesso!');
      setActiveView('doi-list');
    } catch (e: any) {
      notification.error(`Falha ao salvar DOI: ${e.message}`);
    }
  };

  const handleTransmit = (ids: string[]) => {
    const batch = dois.filter(d => ids.includes(d.id));
    setBatchToTransmit(batch);
    setIsTransmissionOpen(true);
  };

  const handleTransmissionComplete = async (results: Map<string, TransmissionResponse>) => {
    const statusUpdates = new Map<string, { status: DOIStatus; receipt?: string; error?: string }>();

    results.forEach((result, id) => {
      statusUpdates.set(id, {
        status: result.success ? DOIStatus.TRANSMITTED : DOIStatus.ERROR,
        receipt: result.receipt,
        error: result.error
      });
    });

    try {
      await updateMultipleDoisStatus(statusUpdates);
      setIsTransmissionOpen(false);

      const successCount = Array.from(results.values()).filter(r => r.success).length;
      const errorCount = results.size - successCount;

      if (errorCount === 0) {
        notification.success(`${successCount} DOI(s) transmitida(s) com sucesso!`);
      } else if (successCount === 0) {
        notification.error(`Falha ao transmitir ${errorCount} DOI(s). Verifique os erros.`);
      } else {
        notification.warning(`${successCount} transmitida(s), ${errorCount} com erro.`);
      }
    } catch (e: any) {
      notification.error('Erro ao atualizar status após transmissão.');
    }
  };

  const handleAddCertificate = async (newCert: Omit<Certificate, 'id' | 'status'>) => {
    try {
      await addCertificate(newCert);
      notification.success('Certificado adicionado com sucesso!');
    } catch (e: any) {
      notification.error('Erro ao adicionar certificado.');
    }
  };

  const handleSetActiveCertificate = async (id: string) => {
    try {
      await setActiveCertificate(id);
      notification.info('Certificado ativo alterado.');
    } catch (e: any) {
      notification.error('Erro ao alterar certificado ativo.');
    }
  };

  const handleDeleteCertificate = (id: string) => {
    notification.confirm(
      'Tem certeza que deseja excluir este certificado?',
      async () => {
        try {
          await deleteCertificate(id);
          notification.success('Certificado excluído.');
        } catch (e: any) {
          notification.error('Erro ao excluir certificado.');
        }
      }
    );
  };

  const handleDeleteDoi = (id: string) => {
    notification.confirm(
      'Tem certeza que deseja excluir esta DOI?',
      async () => {
        try {
          await deleteDoi(id);
          notification.success('DOI excluída com sucesso.');
        } catch (e: any) {
          notification.error('Erro ao excluir DOI.');
        }
      }
    );
  };

  if (doiError && dois.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm text-center">
          <WifiOff size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Erro de Conexão</h2>
          <p className="text-slate-500 mb-2">Não foi possível conectar ao banco de dados MySQL na Hostgator.</p>
          <div className="bg-red-50 p-3 rounded-xl mb-6 text-left border border-red-100">
            <p className="text-[10px] font-bold text-red-600 mb-1 uppercase tracking-tighter">Erro de Sistema:</p>
            <p className="text-[11px] font-mono text-red-500 break-words leading-tight">{doiError}</p>
          </div>
          <button onClick={() => fetchDois()} className="w-full py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700">Tentar Novamente</button>
        </div>
      </div>
    );
  }

  return (
    <Layout activeView={activeView} onViewChange={setActiveView}>
      {(isDoiLoading || isCertLoading) && (
        <div className="fixed top-20 right-8 z-50">
          <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200 shadow-lg flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sincronizando Banco</span>
          </div>
        </div>
      )}

      {activeView === 'dashboard' && <Dashboard entries={dois} />}
      {activeView === 'doi-list' && (
        <DOIList
          entries={dois}
          onTransmit={handleTransmit}
          onDelete={handleDeleteDoi}
          onReview={handleReview}
          onEdit={handleEdit}
        />
      )}
      {activeView === 'certificates' && (
        <CertificatesView
          certificates={certificates}
          onAdd={() => setIsCertificateModalOpen(true)}
          onDelete={handleDeleteCertificate}
          onSetActive={handleSetActiveCertificate}
        />
      )}
      {activeView === 'history' && <HistoryView entries={dois} />}
      {activeView === 'settings' && <SettingsView />}
      {activeView === 'extraction' && (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-blue-100 ring-8 ring-blue-50">
            <Plus size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Extração de Conformidade</h2>
          <p className="text-slate-500 max-w-md mb-8 font-medium">Extração IA validada conforme as normas da DOI/Receita Federal v4.0.1.</p>
          <button onClick={() => { setExtractionMode('extract'); setSelectedDoi(null); setIsExtractionOpen(true); }} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl active:scale-95">Iniciar Análise</button>
        </div>
      )}

      <ExtractionModal
        isOpen={isExtractionOpen}
        onClose={() => setIsExtractionOpen(false)}
        onSave={handleExtractionSave}
        initialData={selectedDoi ? doiToResult(selectedDoi) : null}
        mode={extractionMode}
      />
      <TransmissionModal isOpen={isTransmissionOpen} entries={batchToTransmit} onClose={() => setIsTransmissionOpen(false)} onComplete={handleTransmissionComplete} />
      <CertificateModal isOpen={isCertificateModalOpen} onClose={() => setIsCertificateModalOpen(false)} onSave={handleAddCertificate} />
    </Layout>
  );
};

export default App;
