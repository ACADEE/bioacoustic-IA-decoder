// Data types for the bioacoustic decoder

export interface AudioPrint {
  id?: string;
  created_at: number;
  audio_url: string;
  embedding_vector: number[];
  metadata: {
    species_en: string;
    name: string;
    intent_en: string;
    intent_fr?: string;
  };
  confidence_score: number;
}

export interface AnalysisResult {
  isMatch: boolean;
  confidence: number;
  matchedPrint?: AudioPrint;
}

export interface AnnotationFormData {
  species: string;
  name: string;
  intent: string;
}
