import { describe, it, expect, beforeEach } from 'vitest';
import { useCertificateStore } from '../certificateStore';

describe('certificateStore', () => {
    beforeEach(() => {
        useCertificateStore.setState({ certificates: [] });
    });

    it('should add a new certificate', () => {
        const { addCertificate } = useCertificateStore.getState();

        addCertificate({
            owner: 'Cartório Teste',
            expiryDate: '2027-12-31',
            type: 'A1'
        });

        const state = useCertificateStore.getState();
        expect(state.certificates).toHaveLength(1);
        expect(state.certificates[0].owner).toBe('Cartório Teste');
        expect(state.certificates[0].status).toBe('VALID');
        expect(state.certificates[0].isActive).toBe(true); // First cert is active by default
    });

    it('should set certificate status as EXPIRED for past dates', () => {
        const { addCertificate } = useCertificateStore.getState();

        addCertificate({
            owner: 'Certificado Expirado',
            expiryDate: '2020-01-01',
            type: 'A3'
        });

        const state = useCertificateStore.getState();
        expect(state.certificates[0].status).toBe('EXPIRED');
    });

    it('should delete a certificate', () => {
        const { addCertificate, deleteCertificate } = useCertificateStore.getState();

        addCertificate({
            owner: 'To Delete',
            expiryDate: '2027-12-31',
            type: 'A1'
        });

        const certId = useCertificateStore.getState().certificates[0].id;
        deleteCertificate(certId);

        expect(useCertificateStore.getState().certificates).toHaveLength(0);
    });

    it('should set active certificate', () => {
        const { addCertificate, setActiveCertificate } = useCertificateStore.getState();

        addCertificate({ owner: 'Cert 1', expiryDate: '2027-12-31', type: 'A1' });
        addCertificate({ owner: 'Cert 2', expiryDate: '2027-12-31', type: 'A3' });

        const certs = useCertificateStore.getState().certificates;
        const cert2Id = certs[1].id;

        setActiveCertificate(cert2Id);

        const updatedCerts = useCertificateStore.getState().certificates;
        expect(updatedCerts.find(c => c.id === cert2Id)?.isActive).toBe(true);
        expect(updatedCerts.find(c => c.id !== cert2Id)?.isActive).toBe(false);
    });

    it('should get active certificate', () => {
        const { addCertificate, getActiveCertificate, setActiveCertificate } = useCertificateStore.getState();

        addCertificate({ owner: 'Active Cert', expiryDate: '2027-12-31', type: 'A1' });
        addCertificate({ owner: 'Inactive Cert', expiryDate: '2027-12-31', type: 'A3' });

        const certs = useCertificateStore.getState().certificates;
        setActiveCertificate(certs[0].id);

        const activeCert = useCertificateStore.getState().getActiveCertificate();
        expect(activeCert?.owner).toBe('Active Cert');
    });
});
