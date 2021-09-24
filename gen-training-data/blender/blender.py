import os
import bpy
from mathutils import Vector
import sys
import addon_utils

# See
# https://blender.stackexchange.com/questions/6817/how-to-pass-command-line-arguments-to-a-blender-python-script
argv = sys.argv
argv = argv[argv.index("--") + 1 :]  # get all args after "--"

pdb_filename, vmd_exec_path, dimen, out_png_file = argv
dimen = int(dimen)

# Make sure blendmol enabled
# addon_utils.enable("blendmol")

pth = os.path.dirname(__file__) + os.sep

# Make the vmd file
vmd = open("vis.template.vmd").read()
vmd = vmd.replace("FILENAME", pdb_filename)
open(pth + "vis.vmd", "w").write(vmd)

# Import the PDB file
bpy.ops.import_mesh.vmd(
    filepath=pth + "vis.vmd",
    vmd_exec_path=vmd_exec_path,
)

# Cast ray from camera to protein, to get interest point.
ray_begin = Vector((0, 0, 0))
ray_direction = Vector((0, 0, 1))
context = bpy.context
hit = context.scene.ray_cast(
    context.evaluated_depsgraph_get(), ray_begin, ray_direction
)

if not hit[0]:
    # Ray didn't hit anything. Happens, for example, when surf surface is
    # incomplete.

    with open(out_png_file + ".err.txt", "w") as f:
        f.write("Ray never hit anything!")
        sys.exit(0)

hit = hit[1]

# Update camera focus point
bpy.context.scene.objects["focus_pt"].location = hit

# Update fog
bpy.data.worlds["World"].mist_settings.start = hit[2] + 1

# Update materials to be better quality (subsurface scattering is nice).
mol_obj = [o for o in bpy.context.scene.objects if o.name.startswith("BldM")][0]
material_slots = mol_obj.material_slots
new_mat_name = {
    "0": "blue", 
    "1": "red", 
    "2": "gray", 
    "4": "yellow", 
    "5": "tan",
    "6": "silver", 
    "7": "green", 
    "8": "white", 
    "11": "purple", 
}
for mat_slot in material_slots:
    idx = mat_slot.name.replace("vmd_mat_cindex_", "")
    # material_slots[mat_slot.name] = bpy.data.materials[new_mat_name[idx]]
    mat_slot.material = bpy.data.materials[new_mat_name[idx]]

# Set size of output
bpy.context.scene.render.resolution_x = dimen
bpy.context.scene.render.resolution_y = dimen

# Render
bpy.context.scene.render.filepath = out_png_file
bpy.ops.render.render(write_still=True)

# Save blend file for debugging
# bpy.ops.wm.save_as_mainfile(filepath=out_png_file + ".blend")
