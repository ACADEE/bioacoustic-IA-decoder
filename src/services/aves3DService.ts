/**
 * AVES 3D Service
 * Handles 3D audio visualization data from backend
 */

const BIRDNET_API_URL = import.meta.env.VITE_BIRDNET_API_URL || 'http://localhost:5000';

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface TemporalFeature {
  timestamp: number;
  energy: number;
  frequency: number;
  pitch: number;
  active: boolean;
}

export interface Embeddings3DData {
  embeddings: number[][];  // Full dimensional embeddings
  embeddings_3d: Point3D[]; // 3D coordinates for visualization
  timestamps: number[];     // Timestamp for each point
  sample_rate: number;
  duration: number;
  n_frames: number;
}

export interface Audio3DAnalysisResponse {
  success: boolean;
  embeddings: Embeddings3DData;
  temporal_features: TemporalFeature[];
  visualization_ready: boolean;
  error?: string;
}

/**
 * Analyze audio and get 3D embeddings for visualization
 */
export const analyze3DAudio = async (audioBlob: Blob): Promise<Audio3DAnalysisResponse> => {
  try {
    console.log('Analyzing audio for 3D visualization...');

    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');

    const response = await fetch(`${BIRDNET_API_URL}/api/analyze/3d`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '3D analysis failed');
    }

    const data: Audio3DAnalysisResponse = await response.json();
    console.log('3D analysis complete:', data);

    return data;
  } catch (error) {
    console.error('Error in 3D audio analysis:', error);
    throw error;
  }
};

/**
 * Find which point should be active at a given timestamp
 */
export const getActivePointIndex = (
  timestamps: number[],
  currentTime: number
): number => {
  if (timestamps.length === 0) return -1;

  // Find the closest timestamp
  let closestIndex = 0;
  let minDiff = Math.abs(timestamps[0] - currentTime);

  for (let i = 1; i < timestamps.length; i++) {
    const diff = Math.abs(timestamps[i] - currentTime);
    if (diff < minDiff) {
      minDiff = diff;
      closestIndex = i;
    }
  }

  // Only return if within reasonable threshold (100ms)
  return minDiff < 0.1 ? closestIndex : -1;
};

/**
 * Get active points based on temporal features
 */
export const getActivePoints = (
  temporalFeatures: TemporalFeature[],
  currentTime: number,
  windowSize: number = 0.05 // 50ms window
): number[] => {
  const activeIndices: number[] = [];

  temporalFeatures.forEach((feature, index) => {
    const timeDiff = Math.abs(feature.timestamp - currentTime);

    if (timeDiff <= windowSize && feature.active) {
      activeIndices.push(index);
    }
  });

  return activeIndices;
};

/**
 * Interpolate point color based on audio features
 */
export const getPointColor = (
  feature: TemporalFeature,
  isActive: boolean
): string => {
  if (isActive) {
    // Active points: vibrant colors based on frequency
    const hue = (feature.frequency / 8000) * 360; // 0-8kHz mapped to color spectrum
    const saturation = 100;
    const lightness = 50 + feature.energy * 30; // Brighter with more energy

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  } else {
    // Inactive points: subtle gray
    return '#444444';
  }
};

/**
 * Calculate point size based on energy
 */
export const getPointSize = (
  feature: TemporalFeature,
  isActive: boolean
): number => {
  const baseSize = 0.02;
  const maxSize = 0.08;

  if (isActive) {
    return baseSize + (feature.energy * (maxSize - baseSize));
  }

  return baseSize;
};

/**
 * Generate connections between sequential points
 */
export const generateConnections = (
  points3d: Point3D[]
): [number, number][] => {
  const connections: [number, number][] = [];

  for (let i = 0; i < points3d.length - 1; i++) {
    connections.push([i, i + 1]);
  }

  return connections;
};
