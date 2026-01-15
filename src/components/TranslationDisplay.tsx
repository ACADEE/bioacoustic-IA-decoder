import React from 'react';
import { AudioPrint } from '../types';

interface TranslationDisplayProps {
  match: AudioPrint;
  similarity: number;
}

const TranslationDisplay: React.FC<TranslationDisplayProps> = ({
  match,
  similarity,
}) => {
  // Determine translation to display (prefer French if available, otherwise English)
  const translationText = match.metadata.intent_fr || match.metadata.intent_en;

  return (
    <div className="bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 rounded-lg p-12 border-4 border-neon-green translate-appear">
      {/* Success Icon */}
      <div className="flex justify-center mb-6">
        <div className="bg-neon-green rounded-full p-4 animate-pulse-slow">
          <svg
            className="w-16 h-16 text-black"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* Match Found Header */}
      <h2 className="text-2xl font-bold text-neon-green text-center mb-4">
        Pattern Recognized!
      </h2>

      {/* Translation - The Main Event */}
      <div className="bg-black rounded-lg p-8 mb-6 text-center">
        <p className="text-6xl font-bold text-white leading-tight">
          {translationText.toUpperCase()}
        </p>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Species</div>
          <div className="text-xl font-semibold text-neon-blue">
            {match.metadata.species_en}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Name</div>
          <div className="text-xl font-semibold text-neon-blue">
            {match.metadata.name}
          </div>
        </div>
      </div>

      {/* Confidence Score */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Confidence Level</span>
          <span className="text-lg font-bold text-neon-green">
            {(similarity * 100).toFixed(1)}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-neon-green to-green-400 h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${similarity * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Original Intent in English (if French was shown) */}
      {match.metadata.intent_fr && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            English: <span className="text-gray-300">{match.metadata.intent_en}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default TranslationDisplay;
