# Should be run from main directory.
rm -rf dist/*

# Copy over latest version of FileLoaderSystem
rsync -avhr ../vuejs_components/src/UI/FileLoaderSystem src/UI/Forms/
