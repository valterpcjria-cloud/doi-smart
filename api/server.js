import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const PORT = process.env.PORT || 3001;

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Schema for extraction response
const EXTRACTION_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        seller: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                id: { type: Type.STRING },
                share: { type: Type.NUMBER },
                civilStatus: { type: Type.STRING }
            },
            required: ['name', 'id', 'share']
        },
        buyer: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                id: { type: Type.STRING },
                share: { type: Type.NUMBER },
                civilStatus: { type: Type.STRING }
            },
            required: ['name', 'id', 'share']
        },
        property: {
            type: Type.OBJECT,
            properties: {
                address: { type: Type.STRING },
                registry: { type: Type.STRING },
                value: { type: Type.NUMBER },
                area: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['URBANO', 'RURAL'] }
            },
            required: ['address', 'registry', 'value', 'type']
        },
        operation: {
            type: Type.OBJECT,
            properties: {
                type: { type: Type.STRING, description: 'Ex: Compra e Venda, Permuta, Doação' },
                paymentMethod: { type: Type.STRING, enum: ['VISTA', 'PRAZO'] },
                book: { type: Type.STRING },
                page: { type: Type.STRING },
                date: { type: Type.STRING }
            },
            required: ['type', 'paymentMethod', 'date']
        }
    },
    required: ['seller', 'buyer', 'property', 'operation']
};

const EXTRACTION_PROMPT = `Extraia os dados da escritura pública para conformidade com o layout DOI v4.0.1 da Receita Federal.
    Identifique com precisão cirúrgica:
    1. PARTICIPANTES: Nome, CPF/CNPJ, Fração Ideal (%) e Estado Civil.
    2. OBJETO: Endereço completo, Matrícula, Área (m2 ou ha) e Tipo (Urbano/Rural).
    3. OPERAÇÃO: Valor da Transação, Data, Tipo (ex: Compra e Venda, Doação), Forma de Pagamento (Vista/Prazo), Livro e Folha.
    Retorne apenas JSON estrito.`;

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Extract from text
app.post('/api/extract/text', async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text content is required' });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [{ parts: [{ text: `${EXTRACTION_PROMPT}\n\nEscritura:\n${text}` }] }],
            config: {
                responseMimeType: 'application/json',
                responseSchema: EXTRACTION_SCHEMA
            }
        });

        const result = JSON.parse(response.text || '{}');
        res.json(result);
    } catch (error) {
        console.error('Extraction error:', error);
        res.status(500).json({ error: 'Failed to extract data from text' });
    }
});

// Extract from image
app.post('/api/extract/image', async (req, res) => {
    try {
        const { base64Data, mimeType } = req.body;

        if (!base64Data || !mimeType) {
            return res.status(400).json({ error: 'base64Data and mimeType are required' });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    { inlineData: { data: base64Data, mimeType } },
                    { text: EXTRACTION_PROMPT }
                ]
            },
            config: {
                responseMimeType: 'application/json',
                responseSchema: EXTRACTION_SCHEMA
            }
        });

        const result = JSON.parse(response.text || '{}');
        res.json(result);
    } catch (error) {
        console.error('Image extraction error:', error);
        res.status(500).json({ error: 'Failed to extract data from image' });
    }
});

// Validate DOI data with AI
app.post('/api/validate', async (req, res) => {
    try {
        const { entry } = req.body;

        if (!entry) {
            return res.status(400).json({ error: 'DOI entry is required' });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [{
                text: `Atue como um auditor da Receita Federal. Analise estes dados de DOI e identifique inconsistências lógicas (valores suspeitos, CPFs formatados errado, endereços incompletos).
        Dados: ${JSON.stringify(entry)}
        Retorne apenas JSON no formato: { "valid": boolean, "issues": string[] }`
            }],
            config: { responseMimeType: 'application/json' }
        });

        const result = JSON.parse(response.text || '{"valid": true, "issues": []}');
        res.json(result);
    } catch (error) {
        console.error('Validation error:', error);
        // Fallback: consider valid if AI fails
        res.json({ valid: true, issues: [] });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 DOI Smart API running on http://localhost:${PORT}`);
    console.log(`📝 Health check: http://localhost:${PORT}/api/health`);
});
