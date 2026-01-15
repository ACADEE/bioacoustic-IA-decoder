import React, { useState, useEffect } from 'react';
import AudioIngestion from './components/AudioIngestion';
import AudioVisualization from './components/AudioVisualization';
import AnnotationForm from './components/AnnotationForm';
import TranslationDisplay from './components/TranslationDisplay';
import {
  loadYAMNetModel,
  extractAudioEmbedding,
  audioBufferFromBlob,
} from './services/aiService';
import {
  saveAudioFile,
  saveAudioPrint,
  findSimilarAudioPrint,
} from './services/firebaseService';
import { AudioPrint, AnnotationFormData } from './types';

type AnalysisState = 'idle' | 'analyzing' | 'unknown' | 'matched';

function App() {
  // Audio state
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // AI state
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelLoading, setModelLoading] = useState(true);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [embedding, setEmbedding] = useState<number[] | null>(null);

  // Analysis state
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [matchedPrint, setMatchedPrint] = useState<AudioPrint | null>(null);
  const [similarity, setSimilarity] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load AI model on mount
  useEffect(() => {
    const initModel = async () => {
      try {
        await loadYAMNetModel();
        setModelLoaded(true);
        setModelLoading(false);
      } catch (error) {
        console.error('Failed to load AI model:', error);
        setModelLoading(false);
        alert('Failed to load AI model. Some features may not work.');
      }
    };

    initModel();
  }, []);

  // Handle new audio ready
  const handleAudioReady = async (blob: Blob, url: string) => {
    setAudioBlob(blob);
    setAudioUrl(url);
    setAnalysisState('idle');
    setMatchedPrint(null);
    setSimilarity(0);

    // Process audio
    if (modelLoaded) {
      await analyzeAudio(blob);
    }
  };

  // Analyze audio with AI
  const analyzeAudio = async (blob: Blob) => {
    setAnalysisState('analyzing');
    setIsProcessing(true);

    try {
      // Convert to AudioBuffer
      const buffer = await audioBufferFromBlob(blob);
      setAudioBuffer(buffer);

      // Extract embedding
      const embeddingVector = await extractAudioEmbedding(buffer);
      setEmbedding(embeddingVector);

      // Search for similar patterns
      const { match, similarity: sim } = await findSimilarAudioPrint(
        embeddingVector,
        0.85 // 85% threshold
      );

      if (match) {
        // Pattern recognized!
        setMatchedPrint(match);
        setSimilarity(sim);
        setAnalysisState('matched');
      } else {
        // Unknown pattern
        setAnalysisState('unknown');
      }
    } catch (error) {
      console.error('Error analyzing audio:', error);
      alert('Error analyzing audio. Please try again.');
      setAnalysisState('idle');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle annotation form submission
  const handleAnnotationSubmit = async (data: AnnotationFormData) => {
    if (!audioBlob || !embedding) {
      alert('No audio data available');
      return;
    }

    setIsProcessing(true);

    try {
      // Upload audio file to Firebase Storage
      const audioStorageUrl = await saveAudioFile(audioBlob, 'recorded_audio.wav');

      // Save audio print to Firestore
      await saveAudioPrint(
        audioStorageUrl,
        embedding,
        {
          species_en: data.species,
          name: data.name,
          intent_en: data.intent,
          // TODO: Add automatic translation to French if needed
        },
        1.0
      );

      alert('Audio pattern saved to knowledge base successfully!');

      // Reset
      setAnalysisState('idle');
      setAudioBlob(null);
      setAudioUrl(null);
      setEmbedding(null);
    } catch (error) {
      console.error('Error saving annotation:', error);
      alert('Error saving to knowledge base. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 border-b-2 border-gray-700 py-6 px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-neon-green to-neon-blue bg-clip-text text-transparent">
            Bioacoustic AI Decoder
          </h1>
          <p className="text-gray-400 mt-2">
            Transform animal sounds into clear intentions using AI
          </p>
        </div>
      </header>

      {/* Model Loading */}
      {modelLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="text-center">
            <svg
              className="animate-spin h-16 w-16 text-neon-green mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <h2 className="text-2xl font-semibold text-neon-green">
              Loading AI Model...
            </h2>
            <p className="text-gray-400 mt-2">
              Initializing YAMNet for audio analysis
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Processing Overlay */}
        {isProcessing && analysisState === 'analyzing' && (
          <div className="mb-8 bg-gradient-to-r from-gray-900 to-blue-900 rounded-lg p-8 border-2 border-neon-blue text-center">
            <svg
              className="animate-spin h-12 w-12 text-neon-blue mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <h3 className="text-2xl font-bold text-neon-blue">Analyzing Audio...</h3>
            <p className="text-gray-400 mt-2">
              Extracting features and searching for patterns
            </p>
          </div>
        )}

        {/* Layout: 2 columns on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Module A - Ingestion & Visualization */}
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-300">
                Module A: Audio Input
              </h2>
              <AudioIngestion
                onAudioReady={handleAudioReady}
                isRecording={isRecording}
                setIsRecording={setIsRecording}
              />
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-300">
                Audio Visualization
              </h2>
              <AudioVisualization audioUrl={audioUrl} />
            </section>
          </div>

          {/* Right Column: Module C - Analysis Result */}
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-300">
              Module C: Analysis & Translation
            </h2>

            {/* Idle State */}
            {analysisState === 'idle' && !isProcessing && (
              <div className="bg-gray-900 rounded-lg p-12 border-2 border-gray-800 text-center">
                <svg
                  className="mx-auto h-20 w-20 text-gray-700 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                <h3 className="text-xl font-semibold text-gray-500">
                  Ready for Analysis
                </h3>
                <p className="text-gray-600 mt-2">
                  Record or upload audio to begin
                </p>
              </div>
            )}

            {/* Matched State */}
            {analysisState === 'matched' && matchedPrint && (
              <TranslationDisplay match={matchedPrint} similarity={similarity} />
            )}

            {/* Unknown State */}
            {analysisState === 'unknown' && (
              <AnnotationForm
                onSubmit={handleAnnotationSubmit}
                isLoading={isProcessing}
              />
            )}
          </div>
        </div>

        {/* Info Footer */}
        <footer className="mt-12 text-center text-gray-600 text-sm">
          <p>
            Powered by TensorFlow.js (YAMNet) • Firebase • React • Tailwind CSS
          </p>
          <p className="mt-1">
            Module B (AI Engine) runs automatically in the background
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
