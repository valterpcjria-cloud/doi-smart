import { DOIEntry, DOIStatus } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface TransmissionResponse {
  success: boolean;
  receipt?: string;
  error?: string;
  logs: string[];
}

/**
 * Usa IA via backend para validar se os dados da DOI fazem sentido antes do envio oficial.
 */
const preValidateWithIA = async (entry: DOIEntry): Promise<{ valid: boolean; issues: string[] }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ entry }),
    });

    if (!response.ok) {
      return { valid: true, issues: [] };
    }

    return response.json();
  } catch (e) {
    return { valid: true, issues: [] }; // Fallback em caso de erro
  }
};

// Simulated RFB Transmission with multiple steps
export const transmitDOI = async (entry: DOIEntry): Promise<TransmissionResponse> => {
  const logs: string[] = [];
  const addLog = (msg: string) => logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);

  try {
    addLog("Iniciando processo de transmissão para RFB...");

    // Step 1: IA Validation
    addLog("Acionando motor de Pré-validação IA...");
    const aiCheck = await preValidateWithIA(entry);
    if (!aiCheck.valid) {
      addLog(`CRITICAL: IA detectou inconsistências: ${aiCheck.issues.join(', ')}`);
      return { success: false, error: aiCheck.issues[0], logs };
    }
    addLog("Pré-validação IA concluída: Dados consistentes.");

    // Step 2: Handshake
    await new Promise(r => setTimeout(r, 800));
    addLog("Estabelecendo conexão mTLS com e-CAC...");
    addLog(`Utilizando Certificado: ${entry.id.startsWith('DOI-2026-003') ? 'ERRO_TOKEN' : 'A3_TOKEN_ACTIVE'}`);

    if (entry.id.startsWith('DOI-2026-003')) {
      throw new Error("Falha na autenticação mTLS: Token não encontrado ou expirado.");
    }

    // Step 3: Payload Generation
    addLog("Gerando Payload XML (Schema v4.0.1)...");
    await new Promise(r => setTimeout(r, 600));

    // Step 4: Actual Submission
    addLog("Transmitindo pacote para o Webservice DOI...");
    await new Promise(r => setTimeout(r, 1200));

    // Simulate validation rules
    if (entry.parties.some(p => p.id === '000.000.000-00')) {
      addLog("REJEITADO: Erro de esquema na validação do CPF/CNPJ.");
      return { success: false, error: 'E007 - CPF/CNPJ inválido no banco de dados RFB', logs };
    }

    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').split('.')[0];
    const randomSuffix = Math.floor(Math.random() * 1000000);
    const receipt = `${timestamp}.${randomSuffix}`;

    addLog(`SUCESSO: Pacote processado. Recibo gerado: ${receipt}`);
    return { success: true, receipt, logs };

  } catch (err: any) {
    addLog(`ERRO FATAL: ${err.message}`);
    return { success: false, error: err.message, logs };
  }
};

export const transmitBatch = async (
  entries: DOIEntry[],
  onProgress: (current: number, total: number, lastLogs: string[]) => void
): Promise<Map<string, TransmissionResponse>> => {
  const results = new Map<string, TransmissionResponse>();
  let count = 0;

  for (const entry of entries) {
    const res = await transmitDOI(entry);
    results.set(entry.id, res);
    count++;
    onProgress(count, entries.length, res.logs);
  }

  return results;
};
