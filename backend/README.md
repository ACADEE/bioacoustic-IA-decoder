# BirdNET Backend API

Backend service for bird sound identification using [BirdNET-Analyzer](https://github.com/kahst/BirdNET-Analyzer).

## Features

- **Bird Sound Identification**: Analyze audio files and detect bird species
- **Automatic Photo Fetching**: Retrieves bird photos from Wikipedia/Wikimedia
- **Species Information**: Provides descriptions and metadata for detected birds
- **REST API**: Simple HTTP API for integration with frontend applications

## Requirements

- Python 3.8 or higher
- pip (Python package manager)
- Git

## Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Setup BirdNET Model (Optional but Recommended)

Run the setup script to download BirdNET-Analyzer and its model:

```bash
chmod +x setup_birdnet.sh
./setup_birdnet.sh
```

This will:
- Clone the BirdNET-Analyzer repository
- Download the latest BirdNET model (~80MB)
- Download species labels (~6000+ bird species)

**Note**: The backend will work in "demo mode" without the model, but real bird identification requires the full BirdNET setup.

### 3. Start the Server

```bash
python app.py
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Health Check

```http
GET /health
```

Returns server status.

**Response:**
```json
{
  "status": "healthy",
  "service": "BirdNET Backend API",
  "version": "1.0.0"
}
```

### Analyze Audio

```http
POST /api/analyze
Content-Type: multipart/form-data
```

Analyzes an audio file and returns detected bird species.

**Parameters:**
- `audio` (file): Audio file (.wav, .mp3, .ogg, etc.)

**Response:**
```json
{
  "success": true,
  "detections_count": 2,
  "detections": [
    {
      "species": "American Robin",
      "scientific_name": "Turdus migratorius",
      "confidence": 0.92,
      "time_range": {
        "start": 0.0,
        "end": 3.0
      },
      "photo": {
        "url": "https://upload.wikimedia.org/...",
        "width": 500,
        "height": 400,
        "source": "Wikipedia"
      },
      "description": "The American Robin is a migratory songbird..."
    }
  ],
  "threshold": 0.25
}
```

### Get Species Info

```http
GET /api/species/info/<species_name>
```

Get detailed information about a specific bird species.

**Example:**
```http
GET /api/species/info/American Robin
```

**Response:**
```json
{
  "success": true,
  "species": "American Robin",
  "photo": { ... },
  "description": "..."
}
```

## Configuration

Edit `app.py` to customize:

```python
# Minimum confidence threshold (0.0 to 1.0)
CONFIDENCE_THRESHOLD = 0.25

# Server host and port
app.run(host='0.0.0.0', port=5000)
```

## Integration with Frontend

The React frontend automatically connects to this backend. To configure:

1. Create a `.env` file in the root directory:

```bash
VITE_BIRDNET_API_URL=http://localhost:5000
```

2. Start the backend before launching the frontend.

## Troubleshooting

### BirdNET model not found

If you see "Using fallback detection", run the setup script:

```bash
./setup_birdnet.sh
```

### Permission denied on setup script

```bash
chmod +x setup_birdnet.sh
```

### Port already in use

Change the port in `app.py`:

```python
app.run(host='0.0.0.0', port=5001)  # Different port
```

Then update `.env` in the frontend:

```bash
VITE_BIRDNET_API_URL=http://localhost:5001
```

### Wikipedia API rate limiting

If photo fetching fails frequently, the API may be rate-limited. The backend will automatically use placeholders when this happens.

## How It Works

1. **Audio Preprocessing**: Converts audio to 48kHz mono format using librosa
2. **Feature Extraction**: Extracts spectral features (MFCC, spectral centroid, etc.)
3. **BirdNET Inference**: Runs audio through BirdNET model to detect species
4. **Post-processing**: Filters by confidence threshold and enriches with metadata
5. **Photo Retrieval**: Fetches bird photos from Wikipedia API

## Production Deployment

For production use:

1. Use a production WSGI server (e.g., Gunicorn):

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

2. Consider adding:
   - Request rate limiting
   - API authentication
   - Caching for photos and metadata
   - Error monitoring (e.g., Sentry)

3. Use environment variables for configuration

## Credits

- **BirdNET-Analyzer**: Stefan Kahl, Cornell Lab of Ornithology
- **Wikipedia API**: Wikimedia Foundation
- **librosa**: Audio analysis library

## License

This backend uses BirdNET-Analyzer which is released under the MIT License.

---

**Built with ❤️ for bird conservation and bioacoustics research**
