#!/bin/bash
# deploy.sh

# Create build directory
rm -rf build/
mkdir build/

# Copy files (excluding unwanted ones)
rsync -av --exclude='.git*' --exclude='node_modules' --exclude='*.log' --exclude='.env' --exclude='build' . build/

# Create zip file with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
cd build/
zip -r "../extension_${TIMESTAMP}.zip" .
cd ..

echo "Extension packaged as extension_${TIMESTAMP}.zip"