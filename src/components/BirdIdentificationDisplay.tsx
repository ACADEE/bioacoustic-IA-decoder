import React from 'react';
import { BirdDetection } from '../services/birdnetService';

interface BirdIdentificationDisplayProps {
  detections: BirdDetection[];
  onSelectDetection?: (detection: BirdDetection) => void;
}

const BirdIdentificationDisplay: React.FC<BirdIdentificationDisplayProps> = ({
  detections,
  onSelectDetection,
}) => {
  if (detections.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg p-8 border-2 border-gray-800 text-center">
        <svg
          className="mx-auto h-16 w-16 text-gray-700 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-xl font-semibold text-gray-500 mb-2">
          No Birds Detected
        </h3>
        <p className="text-gray-600">
          Try recording in an area with more bird activity
        </p>
      </div>
    );
  }

  // Top detection (most confident)
  const topDetection = detections[0];

  return (
    <div className="space-y-6">
      {/* Primary Detection - Large Display */}
      <div className="bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 rounded-lg overflow-hidden border-4 border-neon-green translate-appear">
        {/* Bird Photo */}
        <div className="relative h-64 bg-gray-800">
          <img
            src={topDetection.photo.url}
            alt={topDetection.species}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src =
                'https://via.placeholder.com/800x400/10b981/ffffff?text=Bird+Photo';
            }}
          />
          <div className="absolute top-4 right-4 bg-neon-green text-black px-4 py-2 rounded-full font-bold text-lg">
            {Math.round(topDetection.confidence * 100)}% Match
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            <p className="text-xs text-gray-400">
              Source: {topDetection.photo.source}
            </p>
          </div>
        </div>

        {/* Bird Info */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-white mb-1">
                {topDetection.species}
              </h2>
              <p className="text-lg text-neon-blue italic">
                {topDetection.scientific_name}
              </p>
            </div>
            <svg
              className="w-12 h-12 text-neon-green"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
            </svg>
          </div>

          {/* Description */}
          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-semibold text-neon-green mb-2">
              About this species
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              {topDetection.description}
            </p>
          </div>

          {/* Time Range */}
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              Detected at {topDetection.time_range.start.toFixed(1)}s -{' '}
              {topDetection.time_range.end.toFixed(1)}s
            </span>
          </div>
        </div>
      </div>

      {/* Additional Detections */}
      {detections.length > 1 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-300 mb-3">
            Other Possible Species ({detections.length - 1})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {detections.slice(1).map((detection, index) => (
              <div
                key={index}
                className="bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-800 hover:border-neon-blue transition-all cursor-pointer"
                onClick={() => onSelectDetection && onSelectDetection(detection)}
              >
                <div className="flex">
                  {/* Thumbnail */}
                  <div className="w-32 h-32 flex-shrink-0 bg-gray-800">
                    <img
                      src={detection.photo.url}
                      alt={detection.species}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://via.placeholder.com/200x200/06b6d4/ffffff?text=Bird';
                      }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 p-4">
                    <h4 className="font-semibold text-white mb-1">
                      {detection.species}
                    </h4>
                    <p className="text-xs text-gray-400 italic mb-2">
                      {detection.scientific_name}
                    </p>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-neon-blue h-full rounded-full transition-all"
                          style={{ width: `${detection.confidence * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-neon-blue">
                        {Math.round(detection.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Powered by BirdNET Badge */}
      <div className="text-center text-xs text-gray-600 mt-4">
        Identified using{' '}
        <a
          href="https://github.com/kahst/BirdNET-Analyzer"
          target="_blank"
          rel="noopener noreferrer"
          className="text-neon-green hover:underline"
        >
          BirdNET-Analyzer
        </a>
      </div>
    </div>
  );
};

export default BirdIdentificationDisplay;
