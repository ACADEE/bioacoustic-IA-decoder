"""
BirdNET Backend API
Flask server for bird sound identification using BirdNET-Analyzer
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import tempfile
import requests
from birdnet_wrapper import get_birdnet_analyzer
from aves_wrapper import get_aves_analyzer

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Configuration
CONFIDENCE_THRESHOLD = 0.25  # Minimum confidence for bird detection

# Get analyzer instances
birdnet = get_birdnet_analyzer()
aves = get_aves_analyzer()


def get_bird_photo(bird_name):
    """
    Fetch bird photo from Wikipedia/Wikimedia Commons
    """
    try:
        # Wikipedia API to get bird image
        search_url = "https://en.wikipedia.org/w/api.php"

        # First, search for the bird article
        search_params = {
            'action': 'query',
            'format': 'json',
            'titles': bird_name,
            'prop': 'pageimages',
            'pithumbsize': 500
        }

        response = requests.get(search_url, params=search_params, timeout=5)
        data = response.json()

        pages = data.get('query', {}).get('pages', {})
        for page_id, page_data in pages.items():
            if 'thumbnail' in page_data:
                return {
                    'url': page_data['thumbnail']['source'],
                    'width': page_data['thumbnail']['width'],
                    'height': page_data['thumbnail']['height'],
                    'source': 'Wikipedia'
                }

        # Fallback: return placeholder
        return {
            'url': f'https://via.placeholder.com/500x400/10b981/ffffff?text={bird_name.replace(" ", "+")}',
            'width': 500,
            'height': 400,
            'source': 'Placeholder'
        }

    except Exception as e:
        print(f"Error fetching bird photo: {e}")
        return {
            'url': 'https://via.placeholder.com/500x400/10b981/ffffff?text=Bird',
            'width': 500,
            'height': 400,
            'source': 'Placeholder'
        }


def get_bird_info(bird_name):
    """
    Fetch additional bird information from Wikipedia
    """
    try:
        api_url = "https://en.wikipedia.org/w/api.php"

        params = {
            'action': 'query',
            'format': 'json',
            'titles': bird_name,
            'prop': 'extracts',
            'exintro': True,
            'explaintext': True
        }

        response = requests.get(api_url, params=params, timeout=5)
        data = response.json()

        pages = data.get('query', {}).get('pages', {})
        for page_id, page_data in pages.items():
            if 'extract' in page_data:
                # Get first 2 sentences
                extract = page_data['extract']
                sentences = extract.split('.')[:2]
                return '. '.join(sentences) + '.'

        return "No additional information available."

    except Exception as e:
        print(f"Error fetching bird info: {e}")
        return "No additional information available."


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'BirdNET Backend API',
        'version': '1.0.0'
    })


@app.route('/api/analyze', methods=['POST'])
def analyze_audio():
    """
    Analyze audio file and identify bird species
    Expects: multipart/form-data with 'audio' file
    Returns: JSON with bird detections, photos, and metadata
    """
    try:
        # Check if audio file is present
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400

        audio_file = request.files['audio']

        if audio_file.filename == '':
            return jsonify({'error': 'Empty filename'}), 400

        # Save audio to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            audio_file.save(temp_file.name)
            temp_path = temp_file.name

        try:
            # Analyze audio with BirdNET
            detections = birdnet.analyze_audio(temp_path, CONFIDENCE_THRESHOLD)

            # Filter by confidence threshold
            filtered_detections = [
                d for d in detections
                if d['confidence'] >= CONFIDENCE_THRESHOLD
            ]

            # Enrich detections with photos and info
            results = []
            for detection in filtered_detections[:3]:  # Top 3 detections
                bird_name = detection['common_name']

                # Get photo
                photo = get_bird_photo(bird_name)

                # Get info
                info = get_bird_info(bird_name)

                results.append({
                    'species': bird_name,
                    'scientific_name': detection.get('scientific_name', ''),
                    'confidence': detection['confidence'],
                    'time_range': {
                        'start': detection['start_time'],
                        'end': detection['end_time']
                    },
                    'photo': photo,
                    'description': info
                })

            return jsonify({
                'success': True,
                'detections_count': len(results),
                'detections': results,
                'threshold': CONFIDENCE_THRESHOLD
            })

        finally:
            # Clean up temp file
            if os.path.exists(temp_path):
                os.unlink(temp_path)

    except Exception as e:
        print(f"Error in analyze_audio: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/species/info/<species_name>', methods=['GET'])
def get_species_info(species_name):
    """
    Get detailed information about a specific bird species
    """
    try:
        photo = get_bird_photo(species_name)
        info = get_bird_info(species_name)

        return jsonify({
            'success': True,
            'species': species_name,
            'photo': photo,
            'description': info
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/analyze/3d', methods=['POST'])
def analyze_audio_3d():
    """
    Analyze audio and return 3D embeddings for visualization
    Uses AVES for animal vocalization analysis
    """
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400

        audio_file = request.files['audio']

        if audio_file.filename == '':
            return jsonify({'error': 'Empty filename'}), 400

        # Save to temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            audio_file.save(temp_file.name)
            temp_path = temp_file.name

        try:
            # Extract AVES embeddings and 3D coordinates
            embeddings_data = aves.extract_embeddings(temp_path)

            # Get temporal features for animation
            temporal_features = aves.get_temporal_features(temp_path)

            return jsonify({
                'success': True,
                'embeddings': embeddings_data,
                'temporal_features': temporal_features,
                'visualization_ready': True
            })

        finally:
            if os.path.exists(temp_path):
                os.unlink(temp_path)

    except Exception as e:
        print(f"Error in 3D analysis: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


if __name__ == '__main__':
    # Create models directory if it doesn't exist
    models_dir = os.path.join(os.path.dirname(__file__), 'models')
    os.makedirs(models_dir, exist_ok=True)

    print("=" * 50)
    print("Bioacoustic AI Decoder - Backend API")
    print("=" * 50)
    print("Features:")
    print("  - BirdNET bird identification")
    print("  - AVES audio embeddings")
    print("  - 3D visualization support")
    print("=" * 50)
    print("Starting server on http://localhost:5000")
    print("=" * 50)

    app.run(host='0.0.0.0', port=5000, debug=True)
