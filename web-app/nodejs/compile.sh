# Clean previous
rm -rf dist

# Compile
tsc --project ./

# Fix dist directory
cd dist
cp -r nodejs/src/* ./
rm -rf nodejs
find . -name "*.d.ts" -exec rm '{}' \;
mv src modules
cat render.js  | sed "s|../../src/|./modules/|g" > t; mv t render.js 

# Copy some extra files over.
# cd ..
# cp src/other_scripts/*.sh ./dist/
