# Should be run from main directory.
rm -rf dist/*

# Copy over latest version of FileLoaderSystem
rsync -avhr /Users/jdurrant/Documents/Work/durrant_git/vuejs_components/src/UI/FileLoaderSystem src/UI/Forms/
