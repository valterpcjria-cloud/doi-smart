import { ExtractionResult } from "../types";

// Em produção (Hostgator), usar caminho relativo para API PHP
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const extractDataFromDeed = async (text: string): Promise<ExtractionResult> => {
  const response = await fetch(`${API_BASE_URL}/api/extract/text`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Falha na extração' }));
    throw new Error(error.error || 'Failed to extract data from deed');
  }

  return response.json();
};

export const extractDataFromImage = async (base64Data: string, mimeType: string): Promise<ExtractionResult> => {
  const response = await fetch(`${API_BASE_URL}/api/extract/image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ base64Data, mimeType }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Falha na extração' }));
    throw new Error(error.error || 'Failed to extract data from image');
  }

  return response.json();
};
