#!/bin/bash
# Build and package the plugin for distribution

set -e  # Exit on error

echo "======================================"
echo "Game Progress Tracker - Build Script"
echo "======================================"

# Get version from package.json or use default
VERSION=${1:-"dev"}

echo "Building version: $VERSION"

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf plugin-build
rm -f game-progress-tracker-*.zip

# Install dependencies
echo "Installing Node.js dependencies..."
npm install

# Build frontend
echo "Building TypeScript/React frontend..."
npm run build

# Verify build output
if [ ! -f "dist/index.js" ]; then
    echo "Error: Frontend build failed - dist/index.js not found"
    exit 1
fi

# Create plugin directory structure
echo "Creating plugin directory structure..."
mkdir -p plugin-build/game-progress-tracker

# Copy required files
echo "Copying plugin files..."
cp -r dist plugin-build/game-progress-tracker/
cp -r backend plugin-build/game-progress-tracker/
cp main.py plugin-build/game-progress-tracker/
cp plugin.json plugin-build/game-progress-tracker/
cp package.json plugin-build/game-progress-tracker/
cp requirements.txt plugin-build/game-progress-tracker/
cp LICENSE plugin-build/game-progress-tracker/
cp README.md plugin-build/game-progress-tracker/

# Create version file
echo "$VERSION" > plugin-build/game-progress-tracker/VERSION

# Create release zip using Python (cross-platform)
echo "Creating release zip..."
python3 -c "
import zipfile
import os

version = '${VERSION}'
zip_name = f'game-progress-tracker-{version}.zip'

with zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk('plugin-build/game-progress-tracker'):
        for file in files:
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, 'plugin-build')
            zipf.write(file_path, arcname)

print(f'\n{\"=\"*42}')
print('Zip file created successfully!')
print('='*42)
print(f'File: {zip_name}')

# List contents
print('\nContents (first 20 items):')
with zipfile.ZipFile(zip_name, 'r') as zipf:
    for i, name in enumerate(zipf.namelist()[:20]):
        print(f'  {name}')
    if len(zipf.namelist()) > 20:
        print(f'  ... and {len(zipf.namelist()) - 20} more files')
"

# Calculate file size
SIZE=$(du -h game-progress-tracker-${VERSION}.zip | cut -f1)
echo ""
echo "File: game-progress-tracker-${VERSION}.zip"
echo "Size: $SIZE"

# Create test URL file
cat > INSTALL_URL.txt << EOF
============================================
Installation URL for Decky Loader
============================================

After uploading to GitHub Release, use this URL in Decky Loader:

https://github.com/YOUR_USERNAME/YOUR_REPO/releases/download/${VERSION}/game-progress-tracker-${VERSION}.zip

To install:
1. Open Decky Loader settings
2. Enable Developer Mode
3. Go to Developer tab
4. Enter the URL above in "Install Plugin from URL"
5. Click Install

============================================
EOF

echo ""
echo "Installation instructions saved to: INSTALL_URL.txt"
echo ""
echo "Next steps:"
echo "1. Test the zip file locally"
echo "2. Create a GitHub release with tag: ${VERSION}"
echo "3. Upload game-progress-tracker-${VERSION}.zip to the release"
echo "4. Share the installation URL with users"
echo ""
echo "Done! ✅"