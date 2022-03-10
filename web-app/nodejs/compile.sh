# Clean previous
rm -rf dist

# Compile
tsc --project ./

# Fix dist directory
cd dist
cp -r nodejs/src/* ./
rm -rf nodejs
find . -name "*.d.ts" -exec rm '{}' \;
mv src/* lib/core/
rm -rf src
find . -name "*.js" | awk '{print "cat " $1 " | sed \"s|../../src/|./lib/core/|g\" > t; mv t " $1}' | bash
cp ../src/tests.sh ./

# Below is temp
ln -s ../prot2prot_models ./
