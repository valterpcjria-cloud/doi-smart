
export enum DOIStatus {
  DRAFT = 'DRAFT',
  READY = 'READY',
  TRANSMITTING = 'TRANSMITTING',
  TRANSMITTED = 'TRANSMITTED',
  ERROR = 'ERROR'
}

export interface Party {
  name: string;
  id: string; // CPF or CNPJ
  role: 'SELLER' | 'BUYER';
  share?: number; // Fração ideal %
  civilStatus?: string;
}

export interface DOIEntry {
  id: string;
  date: string;
  competence: string;
  propertyAddress: string;
  registryNumber: string;
  value: number;
  status: DOIStatus;
  parties: Party[];
  receiptNumber?: string;
  errorMessage?: string;
  lastUpdate: string;
  // Novos campos para conformidade RFB
  operationType: string;
  operationNature?: string;
  documentType?: string;
  paymentMethod: string;
  book?: string;
  page?: string;
  area?: string;
  nirf?: string;
  iptu?: string;
  itbiValue?: number;
  itcdValue?: number;
  registryOffice?: {
    name?: string;
    official?: string;
    code?: string;
  };
}

// Added Certificate interface to fix missing exported member error
export interface Certificate {
  id: string;
  owner: string;
  expiryDate: string;
  type: 'A1' | 'A3';
  status: 'VALID' | 'WARNING' | 'EXPIRED';
  isActive?: boolean; // Novo campo para gerenciar o certificado em uso
}

export interface ExtractionResult {
  sellers: Array<{ name: string; id: string; share: number; civilStatus: string }>;
  buyers: Array<{ name: string; id: string; share: number; civilStatus: string }>;
  property: {
    address: string;
    registry: string;
    nirf?: string;
    iptu?: string;
    value: number;
    area: string;
    type: 'URBANO' | 'RURAL';
  };
  operation: {
    type: string; // Venda, Doação, etc.
    nature: string; // Compra e Venda, Alienação Fiduciária
    paymentMethod: 'VISTA' | 'PRAZO';
    book: string;
    page: string;
    date: string; // Data da operação
    itbiValue?: number;
    itcdValue?: number;
    documentType: string; // Escritura, Instrumento Particular
  };
  registryOffice: {
    code?: string;
    name?: string;
    official?: string;
  };
}
