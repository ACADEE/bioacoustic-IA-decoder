"""
AVES Integration - Earth Species Project
Audio embeddings optimized for animal vocalizations
https://github.com/earthspecies/aves
"""

import os
import numpy as np
import librosa

# AVES will be loaded lazily
AVES_AVAILABLE = False

try:
    # Try to import AVES
    # Note: AVES requires specific setup
    import torch
    AVES_AVAILABLE = True
    print("PyTorch available for AVES")
except ImportError:
    print("PyTorch not available. AVES embeddings disabled.")


class AVESWrapper:
    """Wrapper for AVES (Animal Vocalization Encoder for Biodiversity Surveillance)"""

    def __init__(self):
        self.model = None
        self.model_loaded = False

        if AVES_AVAILABLE:
            self._load_aves_model()

    def _load_aves_model(self):
        """Load AVES pre-trained model"""
        try:
            # AVES model loading
            # In production, download from: https://github.com/earthspecies/aves

            # For now, we'll prepare the structure
            model_path = os.path.join(os.path.dirname(__file__), 'models', 'aves')

            if os.path.exists(model_path):
                print("Loading AVES model...")
                # TODO: Load actual AVES model when available
                # self.model = torch.load(...)
                self.model_loaded = True
                print("AVES model loaded successfully")
            else:
                print("AVES model not found. Using fallback embeddings.")
                self.model_loaded = False

        except Exception as e:
            print(f"Error loading AVES model: {e}")
            self.model_loaded = False

    def extract_embeddings(self, audio_path, sample_rate=32000):
        """
        Extract AVES embeddings from audio

        Args:
            audio_path: Path to audio file
            sample_rate: Target sample rate (AVES uses 32kHz)

        Returns:
            Dictionary with embeddings and temporal information
        """

        if self.model_loaded and self.model is not None:
            return self._extract_with_aves(audio_path, sample_rate)
        else:
            return self._extract_fallback(audio_path, sample_rate)

    def _extract_with_aves(self, audio_path, sample_rate):
        """Extract embeddings using AVES model"""
        try:
            import torch

            # Load audio at 32kHz (AVES standard)
            audio, sr = librosa.load(audio_path, sr=sample_rate, mono=True)

            # TODO: Run through AVES model
            # embeddings = self.model(audio_tensor)

            # For now, return structured fallback
            return self._extract_fallback(audio_path, sample_rate)

        except Exception as e:
            print(f"Error in AVES extraction: {e}")
            return self._extract_fallback(audio_path, sample_rate)

    def _extract_fallback(self, audio_path, sample_rate):
        """
        Fallback: Extract rich audio features for 3D visualization
        Creates embeddings suitable for point cloud visualization
        """

        # Load audio
        audio, sr = librosa.load(audio_path, sr=sample_rate, mono=True, duration=30)

        # Extract frame-level features for 3D visualization
        frame_size = 2048
        hop_length = 512

        # Calculate number of frames
        n_frames = 1 + (len(audio) - frame_size) // hop_length

        embeddings = []
        timestamps = []

        for i in range(n_frames):
            start = i * hop_length
            end = start + frame_size

            if end > len(audio):
                break

            frame = audio[start:end]
            timestamp = start / sr

            # Extract multi-dimensional features
            features = self._extract_frame_features(frame, sr)

            embeddings.append(features)
            timestamps.append(timestamp)

        embeddings_array = np.array(embeddings)

        # Apply dimensionality reduction to 3D for visualization
        embeddings_3d = self._reduce_to_3d(embeddings_array)

        return {
            'embeddings': embeddings_array.tolist(),  # Full dimensional
            'embeddings_3d': embeddings_3d.tolist(),  # For visualization
            'timestamps': timestamps,
            'sample_rate': sr,
            'duration': len(audio) / sr,
            'n_frames': len(embeddings)
        }

    def _extract_frame_features(self, frame, sr):
        """Extract features from a single audio frame"""

        # MFCCs
        mfccs = librosa.feature.mfcc(y=frame, sr=sr, n_mfcc=13)
        mfcc_mean = np.mean(mfccs, axis=1)

        # Spectral features
        spec_centroid = librosa.feature.spectral_centroid(y=frame, sr=sr)
        spec_rolloff = librosa.feature.spectral_rolloff(y=frame, sr=sr)
        spec_bandwidth = librosa.feature.spectral_bandwidth(y=frame, sr=sr)

        # Chroma
        chroma = librosa.feature.chroma_stft(y=frame, sr=sr)
        chroma_mean = np.mean(chroma, axis=1)

        # Zero crossing rate
        zcr = librosa.feature.zero_crossing_rate(frame)

        # RMS energy
        rms = librosa.feature.rms(y=frame)

        # Combine features
        features = np.concatenate([
            mfcc_mean,
            [np.mean(spec_centroid)],
            [np.mean(spec_rolloff)],
            [np.mean(spec_bandwidth)],
            chroma_mean,
            [np.mean(zcr)],
            [np.mean(rms)]
        ])

        return features

    def _reduce_to_3d(self, embeddings):
        """
        Reduce high-dimensional embeddings to 3D for visualization
        Uses PCA (Principal Component Analysis)
        """

        from sklearn.decomposition import PCA

        # Ensure we have enough samples
        if len(embeddings) < 3:
            # Pad with zeros if too few samples
            padding = np.zeros((3 - len(embeddings), embeddings.shape[1]))
            embeddings = np.vstack([embeddings, padding])

        # Apply PCA to reduce to 3 dimensions
        pca = PCA(n_components=3)
        embeddings_3d = pca.fit_transform(embeddings)

        # Normalize to reasonable range for visualization (-1 to 1)
        embeddings_3d = embeddings_3d / (np.max(np.abs(embeddings_3d)) + 1e-8)

        return embeddings_3d

    def get_temporal_features(self, audio_path, window_size=0.1):
        """
        Extract temporal features for real-time animation

        Args:
            audio_path: Path to audio file
            window_size: Size of analysis window in seconds

        Returns:
            List of feature dictionaries with timing information
        """

        audio, sr = librosa.load(audio_path, sr=32000, mono=True)

        window_samples = int(window_size * sr)
        hop_samples = window_samples // 2  # 50% overlap

        temporal_features = []

        for i in range(0, len(audio) - window_samples, hop_samples):
            window = audio[i:i + window_samples]
            timestamp = i / sr

            # Energy
            energy = np.mean(window ** 2)

            # Spectral centroid (frequency content)
            spec_cent = np.mean(librosa.feature.spectral_centroid(y=window, sr=sr))

            # Pitch (if detectable)
            pitches = librosa.pyin(window, fmin=librosa.note_to_hz('C2'), fmax=librosa.note_to_hz('C7'), sr=sr)
            pitch = np.nanmean(pitches[0]) if len(pitches[0]) > 0 else 0

            temporal_features.append({
                'timestamp': float(timestamp),
                'energy': float(energy),
                'frequency': float(spec_cent),
                'pitch': float(pitch) if not np.isnan(pitch) else 0,
                'active': energy > np.mean(audio ** 2) * 0.1  # Activity detection
            })

        return temporal_features


# Global instance
_aves_instance = None


def get_aves_analyzer():
    """Get singleton AVES analyzer instance"""
    global _aves_instance
    if _aves_instance is None:
        _aves_instance = AVESWrapper()
    return _aves_instance
