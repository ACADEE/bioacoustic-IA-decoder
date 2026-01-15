import React, { useRef, useState } from 'react';

interface AudioIngestionProps {
  onAudioReady: (audioBlob: Blob, audioUrl: string) => void;
  isRecording: boolean;
  setIsRecording: (value: boolean) => void;
}

const AudioIngestion: React.FC<AudioIngestionProps> = ({
  onAudioReady,
  isRecording,
  setIsRecording,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Start microphone recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        onAudioReady(audioBlob, audioUrl);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Handle file drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  // Process audio file
  const handleFile = (file: File) => {
    if (!file.type.startsWith('audio/')) {
      alert('Please upload an audio file (.wav, .mp3, etc.)');
      return;
    }

    const audioUrl = URL.createObjectURL(file);
    onAudioReady(file, audioUrl);
  };

  return (
    <div className="space-y-6">
      {/* Microphone Recording */}
      <div className="bg-gray-900 rounded-lg p-6 border-2 border-gray-800">
        <h3 className="text-xl font-semibold mb-4 text-neon-green">
          Microphone Recording
        </h3>
        <div className="flex items-center justify-center">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="flex items-center space-x-3 bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105"
            >
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Start Recording</span>
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex items-center space-x-3 bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 animate-pulse"
            >
              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
              <span>Stop Recording</span>
            </button>
          )}
        </div>
      </div>

      {/* File Upload - Drag & Drop */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        className={`bg-gray-900 rounded-lg p-12 border-2 border-dashed transition-all duration-300 ${
          isDragging
            ? 'border-neon-blue bg-gray-800'
            : 'border-gray-700 hover:border-gray-600'
        }`}
      >
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-500"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h3 className="mt-4 text-xl font-semibold text-neon-blue">
            Drag & Drop Audio File
          </h3>
          <p className="mt-2 text-gray-400">or</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 bg-neon-blue hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Browse Files
          </button>
          <p className="mt-4 text-sm text-gray-500">
            Supports .wav, .mp3, and other audio formats
          </p>
        </div>
      </div>
    </div>
  );
};

export default AudioIngestion;
