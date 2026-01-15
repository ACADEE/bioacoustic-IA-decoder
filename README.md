# Bioacoustic AI Decoder 🎵🧠

Transform raw animal sounds into clear intentions using state-of-the-art AI technology.

![Dark Mode](https://img.shields.io/badge/UI-Dark%20Mode-black)
![React](https://img.shields.io/badge/React-18.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)
![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-4.15-orange)

## Overview

This application uses AI to analyze animal sounds and translate them into human-understandable intentions. It combines advanced audio processing, machine learning, and real-time visualization to bridge the gap between human and animal communication.

### Key Features

- **Real-time Audio Analysis**: Record from microphone or upload audio files
- **Advanced Visualization**: Waveform and spectrogram display with thermal color mapping
- **AI-Powered Pattern Recognition**: Uses TensorFlow.js with YAMNet model for audio fingerprinting
- **Smart Pattern Matching**: Cosine similarity search with 85% confidence threshold
- **Knowledge Base**: Store and retrieve learned audio patterns in Firebase
- **Beautiful Dark UI**: Modern interface with neon accents and smooth animations

## Tech Stack

### Frontend
- **React 18.2** with TypeScript
- **Vite** for blazing-fast development
- **Tailwind CSS** for styling
- **wavesurfer.js** for audio visualization
- **Spectrogram Plugin** for frequency analysis

### AI/ML
- **TensorFlow.js** - Client-side machine learning
- **YAMNet** - Pre-trained audio classification model
- Audio embeddings (1024 dimensions)
- Cosine similarity for pattern matching

### Backend
- **Firebase Firestore** - NoSQL database
- **Firebase Storage** - Audio file storage
- **Firebase Analytics** - Usage tracking

## Architecture

The application consists of 3 main modules:

### Module A: Ingestion & Visualization
- Microphone recording with Web Audio API
- Drag & drop file upload
- Real-time waveform display
- Thermal-colored spectrogram

### Module B: AI Engine (Automatic)
- Audio fingerprint extraction using YAMNet
- 1024-dimensional embedding vectors
- K-Nearest Neighbors pattern matching
- Cosine similarity calculation

### Module C: Annotation & Translation
- **Case 1 - Unknown Pattern**: Form for manual labeling
  - Species/Family
  - Individual name
  - Intent/Context
- **Case 2 - Recognized Pattern**: Translation display
  - Large, prominent intent text
  - Species and name information
  - Confidence score visualization

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Modern browser with Web Audio API support
- Microphone access (for recording)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bioacoustic-IA-decoder
```

2. Install dependencies:
```bash
npm install
```

3. Firebase is already configured with the provided credentials

4. Start the development server:
```bash
npm run dev
```

5. Open your browser to `http://localhost:3000`

### First Run

On the first launch:
1. The AI model will load (takes 10-30 seconds)
2. Record or upload an audio file
3. Since no patterns exist yet, you'll be prompted to annotate
4. Fill in the species, name, and intent
5. Save to knowledge base
6. Future similar sounds will be automatically recognized!

## Firebase Configuration

The app is connected to Firebase with these services:
- **Firestore Database**: `bioacoustic-ai-decoder`
- **Storage Bucket**: `bioacoustic-ai-decoder.firebasestorage.app`

### Database Structure

Collection: `audio_prints`
```typescript
{
  id: string;
  created_at: number;
  audio_url: string;
  embedding_vector: number[]; // 1024 dimensions
  metadata: {
    species_en: string;
    name: string;
    intent_en: string;
    intent_fr?: string;
  };
  confidence_score: number;
}
```

See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for detailed Firebase configuration.

## Usage Guide

### Recording Audio

1. Click the **"Start Recording"** button
2. Make sounds or play animal audio near the microphone
3. Click **"Stop Recording"** when done
4. The audio will automatically be analyzed

### Uploading Audio

1. Drag and drop an audio file (.wav, .mp3) onto the upload zone
2. Or click **"Browse Files"** to select a file
3. The audio will automatically be analyzed

### Understanding Results

**Pattern Recognized** (Green):
- Shows the translated intent in large text
- Displays species and individual name
- Shows confidence percentage

**Unknown Pattern** (Yellow):
- Prompts you to teach the AI
- Fill in species, name, and intent in English
- Click "Save to Knowledge Base"

### Tips for Best Results

- Use high-quality audio recordings
- Keep background noise minimal
- Record at least 1-2 seconds of audio
- Annotate patterns consistently
- Use English for database entries (for consistency)

## Development

### Project Structure

```
bioacoustic-IA-decoder/
├── src/
│   ├── components/          # React components
│   │   ├── AudioIngestion.tsx
│   │   ├── AudioVisualization.tsx
│   │   ├── AnnotationForm.tsx
│   │   └── TranslationDisplay.tsx
│   ├── services/           # Business logic
│   │   ├── aiService.ts    # TensorFlow.js AI engine
│   │   └── firebaseService.ts  # Firebase operations
│   ├── firebaseConfig.ts   # Firebase initialization
│   ├── types.ts           # TypeScript interfaces
│   ├── App.tsx            # Main application
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── firestore.rules        # Database security rules
├── package.json
└── vite.config.ts
```

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Building for Production

```bash
npm run build
```

The optimized build will be in the `dist/` folder.

## AI Model Details

### YAMNet (Yet Another Mobile Network)
- Pre-trained on AudioSet dataset
- Classifies 521 audio event classes
- Generates 1024-dimensional embeddings
- Optimized for browser performance

### Pattern Matching Algorithm
1. Extract audio features using YAMNet
2. Generate 1024-dimensional embedding vector
3. Calculate cosine similarity with all stored patterns
4. If similarity > 85%, return match
5. Otherwise, prompt for annotation

### Similarity Threshold

The default threshold is **85%** (0.85). You can adjust this in:
```typescript
// src/services/firebaseService.ts
export const findSimilarAudioPrint = async (
  embeddingVector: number[],
  threshold: number = 0.85  // Adjust here
)
```

## Customization

### Color Scheme

Thermal colors are defined in `tailwind.config.js`:
```javascript
colors: {
  thermal: {
    cold: '#1e3a8a',   // Blue
    cool: '#3b82f6',   // Light blue
    warm: '#fbbf24',   // Yellow
    hot: '#ef4444',    // Red
  }
}
```

### Confidence Threshold

Adjust in `src/App.tsx`:
```typescript
const { match, similarity: sim } = await findSimilarAudioPrint(
  embeddingVector,
  0.85  // Change this value (0.0 to 1.0)
);
```

## Troubleshooting

### AI Model Not Loading
- Check internet connection (model downloads from CDN)
- Clear browser cache
- Try a different browser

### Microphone Not Working
- Check browser permissions
- Use HTTPS (required for getUserMedia)
- Ensure microphone is not in use by another app

### Firebase Errors
- Verify Firebase credentials in `firebaseConfig.ts`
- Check Firebase Console for service status
- Review security rules in Firestore

## Performance Tips

- The AI model loads once on first visit (cached afterward)
- Audio processing happens client-side (no server delay)
- Firestore queries are optimized with indexes
- Waveform rendering uses Web Audio API for efficiency

## Future Enhancements

- [ ] Automatic English-to-French translation API
- [ ] User authentication and profiles
- [ ] Audio library browser
- [ ] Export analysis results
- [ ] Batch processing
- [ ] Mobile app version
- [ ] Real-time collaborative learning
- [ ] Advanced filtering and search

## Contributing

Contributions are welcome! Please follow these guidelines:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the MIT License.

## Acknowledgments

- TensorFlow.js team for YAMNet model
- wavesurfer.js for audio visualization
- Firebase for backend infrastructure
- Tailwind CSS for beautiful styling

---

**Built with ❤️ for the bioacoustics community**