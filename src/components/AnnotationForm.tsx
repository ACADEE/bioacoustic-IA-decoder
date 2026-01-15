import React, { useState } from 'react';
import { AnnotationFormData } from '../types';

interface AnnotationFormProps {
  onSubmit: (data: AnnotationFormData) => void;
  isLoading: boolean;
}

const AnnotationForm: React.FC<AnnotationFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<AnnotationFormData>({
    species: '',
    name: '',
    intent: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!formData.species || !formData.name || !formData.intent) {
      alert('Please fill in all fields');
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="bg-gray-900 rounded-lg p-8 border-2 border-yellow-600">
      <div className="flex items-center space-x-3 mb-6">
        <svg
          className="w-8 h-8 text-yellow-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h3 className="text-2xl font-bold text-yellow-500">Unknown Pattern Detected</h3>
      </div>

      <p className="text-gray-400 mb-6">
        This sound pattern is not in the knowledge base. Please help us learn by
        providing the following information:
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Species/Family */}
        <div>
          <label
            htmlFor="species"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Species / Family <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="species"
            name="species"
            value={formData.species}
            onChange={handleChange}
            placeholder="e.g., Bird / Nightingale"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Enter in English for database consistency
          </p>
        </div>

        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Individual Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Tweety"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
            required
          />
        </div>

        {/* Intent/Context */}
        <div>
          <label
            htmlFor="intent"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Context / Intent (Translation) <span className="text-red-500">*</span>
          </label>
          <textarea
            id="intent"
            name="intent"
            value={formData.intent}
            onChange={handleChange}
            placeholder="e.g., Warning call, Mating song, Danger alert"
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent resize-none"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            What does this sound mean? Enter in English.
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full font-bold py-4 px-6 rounded-lg transition-all duration-300 ${
            isLoading
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-neon-green hover:bg-green-600 text-black transform hover:scale-105'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center space-x-2">
              <svg
                className="animate-spin h-5 w-5"
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
              <span>Saving to Knowledge Base...</span>
            </span>
          ) : (
            'Save to Knowledge Base'
          )}
        </button>
      </form>
    </div>
  );
};

export default AnnotationForm;
