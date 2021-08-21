# __pragma__ ('skip')
from os.path import abspath
from os import system

# __pragma__ ('noskip')


def abspth(pth, node_params):
    """?
    return node_params["abspath"](pth)
    ?"""

    # __pragma__ ('skip')
    return abspath(pth)
    # __pragma__ ('noskip')


def runit(cmd, node_params):
    """?
    node_params["execSync"](cmd, {"shell": 1})
    return None
    ?"""

    # __pragma__ ('skip')
    system(cmd)
    return None
    # __pragma__ ('noskip')


def run_blender(
    pdb_filename,
    img_filename,
    blender_exec_path,
    vmd_path,
    img_size,
    blender_script_dir,
    node_params,
):
    PDB_OUT_ABS_PATH = abspth(pdb_filename, node_params)
    PNG_OUT = abspth(img_filename, node_params) + ".2.png"

    # Now launch blender and render the image
    background = [" -b", ""][0]
    cmd = (
        "cd "
        + blender_script_dir
        + "; "
        + blender_exec_path
        + background
        + ' base.blend -P blender.py -- "'
        + PDB_OUT_ABS_PATH
        + '" "'
        + vmd_path
        + '" '
        + str(img_size)
        + " "
        + '"'
        + PNG_OUT
        + '"'
    )
    print(cmd)
    runit(cmd, node_params)