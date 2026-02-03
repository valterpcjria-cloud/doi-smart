import { create } from 'zustand';
import { Certificate } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

interface CertificateState {
    certificates: Certificate[];
    isLoading: boolean;
    error: string | null;
    fetchCertificates: () => Promise<void>;
    addCertificate: (cert: Omit<Certificate, 'id' | 'status'>) => Promise<void>;
    deleteCertificate: (id: string) => Promise<void>;
    setActiveCertificate: (id: string) => Promise<void>;
    getActiveCertificate: () => Certificate | undefined;
}

export const useCertificateStore = create<CertificateState>((set, get) => ({
    certificates: [],
    isLoading: false,
    error: null,

    fetchCertificates: async () => {
        set({ isLoading: true });
        try {
            const response = await fetch(`${API_BASE_URL}/api/certificados`);
            if (!response.ok) throw new Error('Falha ao buscar certificados');
            const data = await response.json();
            set({ certificates: data, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    addCertificate: async (newCert) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/certificados`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCert),
            });
            if (!response.ok) throw new Error('Falha ao salvar certificado');
            await get().fetchCertificates();
        } catch (error: any) {
            set({ error: error.message });
            throw error;
        }
    },

    deleteCertificate: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/certificados/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Falha ao excluir certificado');
            await get().fetchCertificates();
        } catch (error: any) {
            set({ error: error.message });
            throw error;
        }
    },

    setActiveCertificate: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/certificados/${id}/ativar`, {
                method: 'PUT',
            });
            if (!response.ok) throw new Error('Falha ao ativar certificado');
            await get().fetchCertificates();
        } catch (error: any) {
            set({ error: error.message });
            throw error;
        }
    },

    getActiveCertificate: () => {
        return get().certificates.find((c) => c.isActive);
    }
}));

