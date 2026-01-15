import * as tf from '@tensorflow/tfjs';
import Meyda from 'meyda';

let isModelReady = false;

/**
 * Initialize the AI model (TensorFlow.js backend)
 */
export const loadYAMNetModel = async (): Promise<void> => {
  try {
    console.log('Initializing TensorFlow.js and audio analysis...');

    // Initialize TensorFlow.js backend
    await tf.ready();

    // Set up Meyda
    Meyda.windowingFunction = 'hanning';
    Meyda.bufferSize = 512;

    isModelReady = true;
    console.log('Audio analysis engine initialized successfully!');
  } catch (error) {
    console.error('Error initializing audio analysis:', error);
    throw error;
  }
};

/**
 * Extract audio features using Meyda
 * Creates a rich audio fingerprint with multiple features
 */
const extractMeydaFeatures = (audioData: Float32Array, sampleRate: number) => {
  const features: number[] = [];

  // Define frame parameters
  const hopSize = 256;
  const frameSize = 512;
  const numFrames = Math.floor((audioData.length - frameSize) / hopSize);

  // Extract features for each frame
  for (let i = 0; i < Math.min(numFrames, 100); i++) {
    const start = i * hopSize;
    const end = start + frameSize;
    const frame = audioData.slice(start, end);

    // Extract multiple audio features
    const featureSet = Meyda.extract([
      'mfcc',           // Mel-frequency cepstral coefficients (13 values)
      'spectralCentroid', // Where most of the energy is concentrated
      'spectralRolloff',  // Frequency below which 85% of spectrum is contained
      'zcr',             // Zero crossing rate
      'rms',             // Root mean square energy
    ], frame);

    // Compile features into a single vector
    if (featureSet) {
      if (Array.isArray(featureSet.mfcc)) {
        features.push(...featureSet.mfcc);
      }
      if (typeof featureSet.spectralCentroid === 'number') {
        features.push(featureSet.spectralCentroid / 10000); // Normalize
      }
      if (typeof featureSet.spectralRolloff === 'number') {
        features.push(featureSet.spectralRolloff / 10000); // Normalize
      }
      if (typeof featureSet.zcr === 'number') {
        features.push(featureSet.zcr);
      }
      if (typeof featureSet.rms === 'number') {
        features.push(featureSet.rms);
      }
    }
  }

  return features;
};

/**
 * Compute statistical features (mean, std, max, min) across frames
 */
const computeStatisticalFeatures = (features: number[], numFeatures: number) => {
  const stats: number[] = [];
  const numFrames = features.length / numFeatures;

  for (let i = 0; i < numFeatures; i++) {
    const values: number[] = [];

    for (let j = 0; j < numFrames; j++) {
      values.push(features[j * numFeatures + i]);
    }

    // Calculate statistics
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const std = Math.sqrt(variance);
    const max = Math.max(...values);
    const min = Math.min(...values);

    stats.push(mean, std, max, min);
  }

  return stats;
};

/**
 * Extract audio embedding from audio data
 * @param audioBuffer - Web Audio API AudioBuffer
 * @returns Embedding vector (variable dimension based on features)
 */
export const extractAudioEmbedding = async (audioBuffer: AudioBuffer): Promise<number[]> => {
  if (!isModelReady) {
    throw new Error('Audio analysis not initialized. Call loadYAMNetModel() first.');
  }

  try {
    // Get audio data from the first channel
    const audioData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;

    console.log(`Extracting features from ${audioData.length} samples at ${sampleRate}Hz...`);

    // Extract raw features using Meyda
    const rawFeatures = extractMeydaFeatures(audioData, sampleRate);

    // Features per frame: 13 (MFCC) + 4 (other features) = 17
    const featuresPerFrame = 17;

    // Compute statistical aggregation
    const embedding = computeStatisticalFeatures(rawFeatures, featuresPerFrame);

    console.log(`Extracted ${embedding.length}-dimensional audio fingerprint`);

    // Normalize the embedding using TensorFlow
    const tensor = tf.tensor1d(embedding);
    const normalized = tf.div(
      tf.sub(tensor, tf.min(tensor)),
      tf.sub(tf.max(tensor), tf.min(tensor))
    );
    const result = Array.from(await normalized.data());

    // Clean up tensors
    tensor.dispose();
    normalized.dispose();

    // Ensure fixed size (pad or truncate to 128 dimensions for consistency)
    const FIXED_SIZE = 128;
    if (result.length < FIXED_SIZE) {
      return [...result, ...new Array(FIXED_SIZE - result.length).fill(0)];
    }
    return result.slice(0, FIXED_SIZE);

  } catch (error) {
    console.error('Error extracting audio embedding:', error);
    throw error;
  }
};

/**
 * Convert audio blob to AudioBuffer
 */
export const audioBufferFromBlob = async (blob: Blob): Promise<AudioBuffer> => {
  const arrayBuffer = await blob.arrayBuffer();
  const audioContext = new AudioContext();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  return audioBuffer;
};

/**
 * Convert audio file to AudioBuffer
 */
export const audioBufferFromFile = async (file: File): Promise<AudioBuffer> => {
  return audioBufferFromBlob(file);
};

/**
 * Get audio features for visualization (simplified version)
 */
export const getAudioFeatures = (audioBuffer: AudioBuffer) => {
  const audioData = audioBuffer.getChannelData(0);

  return {
    duration: audioBuffer.duration,
    sampleRate: audioBuffer.sampleRate,
    numberOfChannels: audioBuffer.numberOfChannels,
    length: audioBuffer.length,
    audioData: audioData,
  };
};
