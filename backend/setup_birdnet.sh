#!/bin/bash

# Setup script for BirdNET-Analyzer integration

echo "================================================"
echo "BirdNET-Analyzer Setup Script"
echo "================================================"

# Create models directory
mkdir -p models

# Clone BirdNET-Analyzer (if not already cloned)
if [ ! -d "BirdNET-Analyzer" ]; then
    echo "Cloning BirdNET-Analyzer repository..."
    git clone https://github.com/kahst/BirdNET-Analyzer.git
else
    echo "BirdNET-Analyzer already cloned"
fi

# Download BirdNET model
echo "Downloading BirdNET model..."
cd BirdNET-Analyzer

# Download the latest model
if [ ! -f "checkpoints/V2.4/BirdNET_GLOBAL_6K_V2.4_Model_FP32.tflite" ]; then
    echo "Downloading BirdNET V2.4 model..."
    mkdir -p checkpoints/V2.4
    wget -O checkpoints/V2.4/BirdNET_GLOBAL_6K_V2.4_Model_FP32.tflite \
        "https://github.com/kahst/BirdNET-Analyzer/raw/main/checkpoints/V2.4/BirdNET_GLOBAL_6K_V2.4_Model_FP32.tflite"
fi

# Download labels
if [ ! -f "checkpoints/V2.4/BirdNET_GLOBAL_6K_V2.4_Labels.txt" ]; then
    echo "Downloading species labels..."
    wget -O checkpoints/V2.4/BirdNET_GLOBAL_6K_V2.4_Labels.txt \
        "https://github.com/kahst/BirdNET-Analyzer/raw/main/checkpoints/V2.4/BirdNET_GLOBAL_6K_V2.4_Labels.txt"
fi

# Copy labels to models directory
cp checkpoints/V2.4/BirdNET_GLOBAL_6K_V2.4_Labels.txt ../models/labels.txt

cd ..

echo "================================================"
echo "BirdNET-Analyzer setup complete!"
echo "================================================"
echo "To start the backend server:"
echo "  1. Install dependencies: pip install -r requirements.txt"
echo "  2. Run server: python app.py"
echo "================================================"
