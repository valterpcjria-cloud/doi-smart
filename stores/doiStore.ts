import { create } from 'zustand';
import { DOIEntry, DOIStatus } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

interface DOIState {
    dois: DOIEntry[];
    isLoading: boolean;
    error: string | null;
    fetchDois: () => Promise<void>;
    addDoi: (doi: DOIEntry) => Promise<void>;
    updateDoi: (id: string, updates: Partial<DOIEntry>) => Promise<void>;
    deleteDoi: (id: string) => Promise<void>;
    updateDoiStatus: (id: string, status: DOIStatus, receipt?: string, error?: string) => Promise<void>;
    updateMultipleDoisStatus: (results: Map<string, { status: DOIStatus; receipt?: string; error?: string }>) => Promise<void>;
}

export const useDoiStore = create<DOIState>((set, get) => ({
    dois: [],
    isLoading: false,
    error: null,

    fetchDois: async () => {
        set({ isLoading: true });
        try {
            const response = await fetch(`${API_BASE_URL}/api/dois`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const serverError = errorData.error || `HTTP ${response.status}`;
                throw new Error(`Falha ao buscar DOIs: ${serverError}`);
            }
            const data = await response.json();
            set({ dois: data, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    addDoi: async (doi) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/dois`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(doi),
            });
            if (!response.ok) throw new Error('Falha ao salvar DOI');
            const result = await response.json();
            if (result.success) {
                await get().fetchDois(); // Recarregar do banco para garantir consistência
            }
        } catch (error: any) {
            set({ error: error.message });
            throw error;
        }
    },

    updateDoi: async (id, updates) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/dois/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
            if (!response.ok) throw new Error('Falha ao atualizar DOI');
            await get().fetchDois();
        } catch (error: any) {
            set({ error: error.message });
            throw error;
        }
    },

    deleteDoi: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/dois/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Falha ao excluir DOI');
            await get().fetchDois();
        } catch (error: any) {
            set({ error: error.message });
            throw error;
        }
    },

    updateDoiStatus: async (id, status, receipt, error) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/dois/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, receipt, error }),
            });
            if (!response.ok) throw new Error('Falha ao atualizar status da DOI');
            await get().fetchDois();
        } catch (error: any) {
            set({ error: error.message });
            throw error;
        }
    },

    updateMultipleDoisStatus: async (results) => {
        // Para múltiplos, podemos otimizar ou fazer em loop
        // Por simplicidade aqui, vamos fazer em loop ou implementar endpoint batch no futuro
        for (const [id, result] of results.entries()) {
            await get().updateDoiStatus(id, result.status, result.receipt, result.error);
        }
    }
}));

