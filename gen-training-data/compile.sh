# Clean previous
rm -rf src/InputImage
rm -rf dist

# Copy files here
cp -r ../web-app/src/Pix2Pix/InputImage ./src/

# Compile
tsc --project ./

# Fix dist directory
cd dist
cp -r gen-training-data/src/* ./
rm -rf gen-training-data
find . -name "*.d.ts" -exec rm '{}' \;

# Copy some extra files over.
cd ..
cp src/other_scripts/*.sh ./dist/
