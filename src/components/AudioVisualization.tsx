import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import SpectrogramPlugin from 'wavesurfer.js/dist/plugins/spectrogram.js';

interface AudioVisualizationProps {
  audioUrl: string | null;
  onTimeUpdate?: (time: number) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

const AudioVisualization: React.FC<AudioVisualizationProps> = ({
  audioUrl,
  onTimeUpdate,
  onPlayStateChange,
}) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const spectrogramRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (!audioUrl || !waveformRef.current || !spectrogramRef.current) return;

    // Initialize WaveSurfer
    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#06b6d4',
      progressColor: '#10b981',
      cursorColor: '#ffffff',
      barWidth: 2,
      barRadius: 3,
      cursorWidth: 2,
      height: 100,
      barGap: 2,
    });

    // Add Spectrogram plugin
    wavesurfer.registerPlugin(
      SpectrogramPlugin.create({
        container: spectrogramRef.current!,
        labels: true,
        height: 256,
        splitChannels: false,
        // Thermal color map (cold to hot)
        colorMap: [
          [0, 0, 0, 0],        // Transparent
          [30, 58, 138, 255],  // Cold (blue)
          [59, 130, 246, 255], // Cool (light blue)
          [251, 191, 36, 255], // Warm (yellow)
          [239, 68, 68, 255],  // Hot (red)
        ],
      })
    );

    // Load audio
    wavesurfer.load(audioUrl);

    // Event listeners
    wavesurfer.on('ready', () => {
      setDuration(wavesurfer.getDuration());
    });

    wavesurfer.on('play', () => {
      setIsPlaying(true);
      if (onPlayStateChange) onPlayStateChange(true);
    });

    wavesurfer.on('pause', () => {
      setIsPlaying(false);
      if (onPlayStateChange) onPlayStateChange(false);
    });

    wavesurfer.on('timeupdate', (time) => {
      setCurrentTime(time);
      if (onTimeUpdate) onTimeUpdate(time);
    });

    wavesurferRef.current = wavesurfer;

    // Cleanup
    return () => {
      wavesurfer.destroy();
    };
  }, [audioUrl]);

  const togglePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!audioUrl) {
    return (
      <div className="bg-gray-900 rounded-lg p-12 border-2 border-gray-800 text-center">
        <svg
          className="mx-auto h-16 w-16 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
          />
        </svg>
        <p className="mt-4 text-gray-500">
          No audio loaded. Record or upload audio to see visualization.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Waveform */}
      <div className="bg-gray-900 rounded-lg p-6 border-2 border-gray-800">
        <h3 className="text-xl font-semibold mb-4 text-neon-green">Waveform</h3>
        <div ref={waveformRef} className="mb-4"></div>

        {/* Playback controls */}
        <div className="flex items-center justify-between">
          <button
            onClick={togglePlayPause}
            className="flex items-center space-x-2 bg-neon-green hover:bg-green-600 text-black font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            {isPlaying ? (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Pause</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Play</span>
              </>
            )}
          </button>

          <div className="text-gray-400 font-mono">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
      </div>

      {/* Spectrogram */}
      <div className="bg-gray-900 rounded-lg p-6 border-2 border-gray-800">
        <h3 className="text-xl font-semibold mb-4 text-neon-blue">
          Spectrogram Analysis
        </h3>
        <div ref={spectrogramRef} className="rounded-lg overflow-hidden"></div>
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-thermal-cold rounded"></div>
              <span className="text-gray-400">Calm</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-thermal-warm rounded"></div>
              <span className="text-gray-400">Moderate</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-thermal-hot rounded"></div>
              <span className="text-gray-400">Intense</span>
            </div>
          </div>
          <span className="text-gray-500">Frequency (Hz) vs Time (s)</span>
        </div>
      </div>
    </div>
  );
};

export default AudioVisualization;
