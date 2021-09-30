# Argument must be directory with PDB and input.png file.

export FILE="${1}/target.png"
if test -f "$FILE"; then
    echo "$FILE exists."
    exit
fi

# Copy files to the directory where rendering will take place.
cp ../blender/base.blend ../blender/blender.py ../blender/paths.sh ../blender/vis.template.vmd ${1}/

# Change to that directory
cd ${1}/

# Load some key variables
. paths.sh

# Render the target.png file
echo "${BLENDER_PATH} -b base.blend -P blender.py -- \"$(realpath ./model.pdb)\" \"${VMD_PATH}\" 1024 target.png"
${BLENDER_PATH} -b base.blend -P blender.py -- "$(realpath ./model.pdb)" "${VMD_PATH}" 1024 target.png

# Clean up
rm base.blend blender.py paths.sh vis.template.vmd # vis.vmd