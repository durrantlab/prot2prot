# This script only works if transcrypt is installed.
# pip install transcrypt

# Clean previous version.
rm -rf ../py-gen-training-data/__target__/ ./dist/

# Compile the python file to javascript.
cd ../py-gen-training-data/
# --nomin
transcrypt --nomin --build --ecom --verbose make_img
cd -

# Move the javascript library to the dist directory.
mv ../py-gen-training-data/__target__/ ./dist

