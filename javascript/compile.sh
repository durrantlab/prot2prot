# This script only works if transcrypt is installed.
# pip install transcrypt

# Clean previous version.
rm -rf ../py_gen_training_data/__target__/ ./dist/

# Compile the python file to javascript.
cd ../py_gen_training_data/
# --nomin
transcrypt --nomin --build --ecom --verbose make_img
cd -

# Move the javascript library to the dist directory.
mv ../py_gen_training_data/__target__/ ./dist

# Copy some additional files.
cp -r src_aux/* dist/
cp -r node_modules/canvas dist/
cp ../blender/blender.py  dist/

# change into dist directory and start a server
cd dist
http-server
