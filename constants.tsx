
import React from 'react';
import { DOIEntry, DOIStatus, Certificate } from './types';
import { 
  FileText, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  LayoutDashboard,
  Settings,
  History,
  TrendingUp,
  FileSearch
} from 'lucide-react';

export const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'extraction', label: 'Extração IA', icon: <FileSearch size={20} /> },
  { id: 'doi-list', label: 'Lista de DOIs', icon: <FileText size={20} /> },
  { id: 'certificates', label: 'Certificados', icon: <ShieldCheck size={20} /> },
  { id: 'history', label: 'Histórico', icon: <History size={20} /> },
  { id: 'settings', label: 'Configurações', icon: <Settings size={20} /> },
];

export const STATUS_CONFIG = {
  [DOIStatus.DRAFT]: { color: 'bg-slate-100 text-slate-600', label: 'Rascunho', icon: <Clock size={14} /> },
  [DOIStatus.READY]: { color: 'bg-yellow-100 text-yellow-700', label: 'Pronta', icon: <Clock size={14} /> },
  [DOIStatus.TRANSMITTING]: { color: 'bg-blue-100 text-blue-700', label: 'Transmitindo', icon: <TrendingUp size={14} className="animate-pulse" /> },
  [DOIStatus.TRANSMITTED]: { color: 'bg-green-100 text-green-700', label: 'Transmitida', icon: <CheckCircle size={14} /> },
  [DOIStatus.ERROR]: { color: 'bg-red-100 text-red-700', label: 'Erro', icon: <AlertCircle size={14} /> },
};

export const MOCK_DOIS: DOIEntry[] = [
  {
    id: 'DOI-2026-001',
    date: '2026-01-15',
    competence: '01/2026',
    propertyAddress: 'Av. Paulista, 1000, Apto 12 - São Paulo/SP',
    registryNumber: '123.456',
    value: 850000.00,
    status: DOIStatus.TRANSMITTED,
    receiptNumber: '20260115.123987456',
    lastUpdate: '2026-01-16T10:00:00Z',
    // Added missing properties to fix type errors
    operationType: 'Compra e Venda',
    paymentMethod: 'VISTA',
    parties: [
      { name: 'João da Silva', id: '123.456.789-00', role: 'SELLER' },
      { name: 'Maria Oliveira', id: '987.654.321-11', role: 'BUYER' }
    ]
  },
  {
    id: 'DOI-2026-002',
    date: '2026-01-20',
    competence: '01/2026',
    propertyAddress: 'Rua das Flores, 45, Casa 2 - Campinas/SP',
    registryNumber: '98.765',
    value: 420000.00,
    status: DOIStatus.READY,
    lastUpdate: '2026-01-21T14:30:00Z',
    // Added missing properties to fix type errors
    operationType: 'Compra e Venda',
    paymentMethod: 'PRAZO',
    parties: [
      { name: 'Pedro Santos', id: '111.222.333-44', role: 'SELLER' },
      { name: 'Construtora ABC Ltda', id: '12.345.678/0001-99', role: 'BUYER' }
    ]
  },
  {
    id: 'DOI-2026-003',
    date: '2026-01-22',
    competence: '01/2026',
    propertyAddress: 'Alameda Santos, 500, Sala 101 - São Paulo/SP',
    registryNumber: '45.123',
    value: 1200000.00,
    status: DOIStatus.ERROR,
    errorMessage: 'E007 - CPF do comprador inválido no banco de dados RFB',
    lastUpdate: '2026-01-23T09:15:00Z',
    // Added missing properties to fix type errors
    operationType: 'Doação',
    paymentMethod: 'VISTA',
    parties: [
      { name: 'Carlos Ferreira', id: '555.444.333-22', role: 'SELLER' },
      { name: 'Joana Dark', id: '000.000.000-00', role: 'BUYER' }
    ]
  }
];

export const MOCK_CERTIFICATES: Certificate[] = [
  { id: '1', owner: 'Cartório do 1º Ofício', expiryDate: '2027-10-12', type: 'A1', status: 'VALID' },
  { id: '2', owner: 'Maria Silva (Escrevente)', expiryDate: '2026-03-01', type: 'A1', status: 'WARNING' },
];
