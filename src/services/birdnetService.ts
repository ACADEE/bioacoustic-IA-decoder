/**
 * BirdNET Service
 * Communicates with the BirdNET backend API for bird identification
 */

const BIRDNET_API_URL = import.meta.env.VITE_BIRDNET_API_URL || 'http://localhost:5000';

export interface BirdDetection {
  species: string;
  scientific_name: string;
  confidence: number;
  time_range: {
    start: number;
    end: number;
  };
  photo: {
    url: string;
    width: number;
    height: number;
    source: string;
  };
  description: string;
}

export interface BirdNetResponse {
  success: boolean;
  detections_count: number;
  detections: BirdDetection[];
  threshold: number;
  error?: string;
}

/**
 * Check if BirdNET backend is available
 */
export const checkBirdNetHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${BIRDNET_API_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('BirdNET backend health:', data);
      return true;
    }

    return false;
  } catch (error) {
    console.warn('BirdNET backend not available:', error);
    return false;
  }
};

/**
 * Analyze audio file with BirdNET backend
 * @param audioBlob - Audio blob to analyze
 * @returns Bird detection results
 */
export const analyzeBirdSound = async (audioBlob: Blob): Promise<BirdNetResponse> => {
  try {
    console.log('Sending audio to BirdNET backend...');

    // Create FormData to send audio file
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');

    // Send to backend
    const response = await fetch(`${BIRDNET_API_URL}/api/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'BirdNET analysis failed');
    }

    const data: BirdNetResponse = await response.json();
    console.log('BirdNET analysis complete:', data);

    return data;
  } catch (error) {
    console.error('Error analyzing with BirdNET:', error);
    throw error;
  }
};

/**
 * Get information about a specific bird species
 * @param speciesName - Common name of the bird species
 */
export const getBirdSpeciesInfo = async (speciesName: string) => {
  try {
    const response = await fetch(
      `${BIRDNET_API_URL}/api/species/info/${encodeURIComponent(speciesName)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch bird species info');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching bird species info:', error);
    throw error;
  }
};

/**
 * Convert audio features to a format suitable for display
 */
export const formatBirdDetection = (detection: BirdDetection) => {
  return {
    title: detection.species,
    subtitle: detection.scientific_name,
    confidence: Math.round(detection.confidence * 100),
    imageUrl: detection.photo.url,
    description: detection.description,
    timeRange: `${detection.time_range.start.toFixed(1)}s - ${detection.time_range.end.toFixed(1)}s`,
  };
};
