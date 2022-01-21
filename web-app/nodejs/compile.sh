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
ls *.js | awk '{print "cat " $1 " | sed \"s|../../src/|./modules/|g\" > t; mv t " $1}' | bash
# cat render.js  | sed "s|../../src/|./modules/|g" > t; mv t render.js 

# Below is temp
ln -s ../models ./

# Copy some extra files over.
# cd ..
# cp src/other_scripts/*.sh ./dist/
