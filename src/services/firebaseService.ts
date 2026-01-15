import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebaseConfig';
import { AudioPrint } from '../types';

/**
 * Save audio file to Firebase Storage
 */
export const saveAudioFile = async (audioBlob: Blob, filename: string): Promise<string> => {
  const storageRef = ref(storage, `audio_files/${Date.now()}_${filename}`);
  const snapshot = await uploadBytes(storageRef, audioBlob);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
};

/**
 * Save audio print (embedding + metadata) to Firestore
 */
export const saveAudioPrint = async (
  audioUrl: string,
  embeddingVector: number[],
  metadata: {
    species_en: string;
    name: string;
    intent_en: string;
    intent_fr?: string;
  },
  confidenceScore: number = 1.0
): Promise<string> => {
  const audioPrint: Omit<AudioPrint, 'id'> = {
    created_at: Date.now(),
    audio_url: audioUrl,
    embedding_vector: embeddingVector,
    metadata,
    confidence_score: confidenceScore,
  };

  const docRef = await addDoc(collection(db, 'audio_prints'), audioPrint);
  return docRef.id;
};

/**
 * Get all audio prints from Firestore
 */
export const getAllAudioPrints = async (): Promise<AudioPrint[]> => {
  const q = query(collection(db, 'audio_prints'), orderBy('created_at', 'desc'));
  const querySnapshot = await getDocs(q);

  const prints: AudioPrint[] = [];
  querySnapshot.forEach((doc) => {
    prints.push({
      id: doc.id,
      ...doc.data(),
    } as AudioPrint);
  });

  return prints;
};

/**
 * Calculate cosine similarity between two vectors
 */
export const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Find the most similar audio print using cosine similarity
 */
export const findSimilarAudioPrint = async (
  embeddingVector: number[],
  threshold: number = 0.85
): Promise<{ match: AudioPrint | null; similarity: number }> => {
  const allPrints = await getAllAudioPrints();

  if (allPrints.length === 0) {
    return { match: null, similarity: 0 };
  }

  let bestMatch: AudioPrint | null = null;
  let bestSimilarity = 0;

  for (const print of allPrints) {
    const similarity = cosineSimilarity(embeddingVector, print.embedding_vector);

    if (similarity > bestSimilarity) {
      bestSimilarity = similarity;
      bestMatch = print;
    }
  }

  // Only return match if similarity exceeds threshold
  if (bestSimilarity >= threshold) {
    return { match: bestMatch, similarity: bestSimilarity };
  }

  return { match: null, similarity: bestSimilarity };
};
