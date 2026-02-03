import { describe, it, expect, beforeEach } from 'vitest';
import { useDoiStore } from '../doiStore';
import { DOIStatus } from '../../types';

describe('doiStore', () => {
    beforeEach(() => {
        // Reset store to initial state before each test
        useDoiStore.setState({ dois: [] });
    });

    it('should add a new DOI', () => {
        const { addDoi, dois } = useDoiStore.getState();

        const newDoi = {
            id: 'DOI-TEST-001',
            date: '2026-01-01',
            competence: '01/2026',
            propertyAddress: 'Rua Teste, 123',
            registryNumber: '12.345',
            value: 500000,
            status: DOIStatus.READY,
            lastUpdate: new Date().toISOString(),
            operationType: 'Compra e Venda',
            paymentMethod: 'VISTA',
            parties: [
                { name: 'Vendedor Teste', id: '111.222.333-44', role: 'SELLER' as const },
                { name: 'Comprador Teste', id: '555.666.777-88', role: 'BUYER' as const }
            ]
        };

        addDoi(newDoi);

        const updatedState = useDoiStore.getState();
        expect(updatedState.dois).toHaveLength(1);
        expect(updatedState.dois[0].id).toBe('DOI-TEST-001');
    });

    it('should delete a DOI', () => {
        const { addDoi, deleteDoi } = useDoiStore.getState();

        const doi = {
            id: 'DOI-TO-DELETE',
            date: '2026-01-01',
            competence: '01/2026',
            propertyAddress: 'Rua Delete, 456',
            registryNumber: '98.765',
            value: 300000,
            status: DOIStatus.DRAFT,
            lastUpdate: new Date().toISOString(),
            operationType: 'Doação',
            paymentMethod: 'VISTA',
            parties: []
        };

        addDoi(doi);
        expect(useDoiStore.getState().dois).toHaveLength(1);

        deleteDoi('DOI-TO-DELETE');
        expect(useDoiStore.getState().dois).toHaveLength(0);
    });

    it('should update DOI status', () => {
        const { addDoi, updateDoiStatus } = useDoiStore.getState();

        const doi = {
            id: 'DOI-STATUS-TEST',
            date: '2026-01-01',
            competence: '01/2026',
            propertyAddress: 'Rua Status, 789',
            registryNumber: '11.111',
            value: 750000,
            status: DOIStatus.READY,
            lastUpdate: new Date().toISOString(),
            operationType: 'Compra e Venda',
            paymentMethod: 'PRAZO',
            parties: []
        };

        addDoi(doi);
        updateDoiStatus('DOI-STATUS-TEST', DOIStatus.TRANSMITTED, '20260101.123456');

        const updatedDoi = useDoiStore.getState().dois[0];
        expect(updatedDoi.status).toBe(DOIStatus.TRANSMITTED);
        expect(updatedDoi.receiptNumber).toBe('20260101.123456');
    });

    it('should update multiple DOIs status at once', () => {
        const { addDoi, updateMultipleDoisStatus } = useDoiStore.getState();

        const doi1 = {
            id: 'DOI-BATCH-001',
            date: '2026-01-01',
            competence: '01/2026',
            propertyAddress: 'Rua Batch 1',
            registryNumber: '22.222',
            value: 100000,
            status: DOIStatus.READY,
            lastUpdate: new Date().toISOString(),
            operationType: 'Compra e Venda',
            paymentMethod: 'VISTA',
            parties: []
        };

        const doi2 = {
            id: 'DOI-BATCH-002',
            date: '2026-01-01',
            competence: '01/2026',
            propertyAddress: 'Rua Batch 2',
            registryNumber: '33.333',
            value: 200000,
            status: DOIStatus.READY,
            lastUpdate: new Date().toISOString(),
            operationType: 'Doação',
            paymentMethod: 'VISTA',
            parties: []
        };

        addDoi(doi1);
        addDoi(doi2);

        const statusUpdates = new Map([
            ['DOI-BATCH-001', { status: DOIStatus.TRANSMITTED, receipt: 'REC-001' }],
            ['DOI-BATCH-002', { status: DOIStatus.ERROR, error: 'Test error' }]
        ]);

        updateMultipleDoisStatus(statusUpdates);

        const state = useDoiStore.getState();
        const updated1 = state.dois.find(d => d.id === 'DOI-BATCH-001');
        const updated2 = state.dois.find(d => d.id === 'DOI-BATCH-002');

        expect(updated1?.status).toBe(DOIStatus.TRANSMITTED);
        expect(updated1?.receiptNumber).toBe('REC-001');
        expect(updated2?.status).toBe(DOIStatus.ERROR);
        expect(updated2?.errorMessage).toBe('Test error');
    });
});
