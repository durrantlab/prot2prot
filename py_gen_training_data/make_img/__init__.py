# Python3

from make_img.run_blender import run_blender
from make_img.out_pdb import out_pdb
import random
import math
import make_img
from make_img.image import get_image_mod, get_image_draw, draw_ellipse
from make_img.prep_pdbs import from_pdb_txt
from make_img.color_schemes.new import ColorScheme

# __pragma__ ('skip')
import os

sep = os.sep
# __pragma__ ('noskip')

"""?
sep = "/"
?"""

from make_img import pdbs

PDB_FILENAME = random.choice(list(pdbs.pdb_files.keys()))
PDB_DIST = 150 * random.random()  # Distance from camera to protein COG
IMG_SIZE = 256  # Size of image (pixels)
ZOOM_FACTOR = 1  # e.g., if you use 256 IMG_SIZE instead of 1024, use 0.25.

FOCAL_LENGTH = 1418.5  # 10/0.050  # If using 1/dist to define magnification.

VMD_PATH = "/Applications/VMD 1.9.1.app/Contents/vmd/vmd_MACOSXX86"
BLENDER_EXEC_PATH = "/Applications/Blender.app/Contents/MacOS/Blender"

# VMD_PATH = "/ihome/crc/install/vmd/1.9.3/bin/vmd"
# BLENDER_EXEC_PATH = "/ihome/jdurrant/durrantj/programs/blender-2.92.0-linux64/blender"

BLENDER_SCRIPT_DIR = "/Users/jdurrant/Documents/Work/ml_protein_render/blender/"

"""?
# Transcrypt
import numscrypt as numpy
?"""

# __pragma__ ('skip')
import numpy

# __pragma__ ('noskip')

color_scheme = ColorScheme()


def map_to_viewport(coor_2d):
    global IMG_SIZE, ZOOM_FACTOR
    coor_2d = [v * ZOOM_FACTOR + 0.5 * IMG_SIZE for v in coor_2d]
    return coor_2d


def randomly_rotate(coors):
    # do the rotation
    thetax = random.random() * math.pi
    thetay = random.random() * math.pi
    thetaz = random.random() * math.pi

    sinx = math.sin(thetax)
    siny = math.sin(thetay)
    sinz = math.sin(thetaz)
    cosx = math.cos(thetax)
    cosy = math.cos(thetay)
    cosz = math.cos(thetaz)

    rot_matrix = numpy.array(
        [
            [
                (cosy * cosz),
                (sinx * siny * cosz + cosx * sinz),
                (sinx * sinz - cosx * siny * cosz),
            ],
            [
                -(cosy * sinz),
                (cosx * cosz - sinx * siny * sinz),
                (cosx * siny * sinz + sinx * cosz),
            ],
            [siny, -(sinx * cosy), (cosx * cosy)],
        ]
    )

    new_coors = (rot_matrix @ coors.transpose()).transpose()

    return new_coors


def project_to_2d_plane(world_coor, focal_length):
    # See https://brilliant.org/wiki/3d-coordinate-geometry-equation-of-a-line/
    # http://www.cs.toronto.edu/~jepson/csc420/notes/imageProjection.pdf
    l, m, n = world_coor

    x = focal_length * l / n
    y = focal_length * m / n

    return [x, y]


def move_pdb_coors(coors):
    coors = randomly_rotate(coors).tolist()
    coors = [[c[0], c[1], c[2] + PDB_DIST] for c in coors]
    return coors


def main(node_params=None, pdb_txt=None):
    global BLENDER_EXEC_PATH, VMD_PATH, IMG_SIZE, BLENDER_SCRIPT_DIR

    if pdb_txt is None:
        # print(PDB_FILENAME)
        pdb_data = pdbs.pdb_files[PDB_FILENAME]
        coors = numpy.array(pdb_data["coors"])

        # Move and randomly rotate
        coors = move_pdb_coors(coors)

        # Assign random id
        iden = str(random.random()).replace(".", "")
    else:
        pdb_data = from_pdb_txt(pdb_txt)
        coors = pdb_data["coors"]
        iden = "output.new_color"

    elems = pdb_data["elems"]
    vdws = pdb_data["vdws"]

    # Give up if any z < -1 (behind camera)
    for c in coors:
        if c[2] < 0:
            print("Some atoms were behind the camera. Cancelling...")
            # __pragma__ ('js', "alert('Please reload the page and try again...');")
            return

    # Get the atoms from farthest to closest.
    dists = [
        [math.sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]), i]
        for i, d in enumerate(coors)
    ]

    # __pragma__ ('skip')
    dists.sort(reverse=True)
    # __pragma__ ('noskip')

    """?
    def compare(a, b):
        return b[0] - a[0]
    ?"""

    

    max_dist = dists[0][0]
    min_dist = dists[len(dists) - 1][0]

    # Draw circles
    img = get_image_mod(IMG_SIZE, node_params, color_scheme)
    draw = get_image_draw(img)

    for dist, i in dists:
        coor = coors[i]
        element = elems[i]

        atom_coor_2d = project_to_2d_plane(coor, FOCAL_LENGTH)
        atom_coor_2d = map_to_viewport(atom_coor_2d)

        outline_str, shading_data = color_scheme.colors(
            dist, max_dist, element, vdws[i]
        )

        # color_str, outline_str = color_scheme.colors(dist, max_dist, element, radius)
        first = True
        for new_radius, color_str in shading_data:

            # print(new_radius, color_str, outline_str)
            # sdf

            coor_radius_edge = [v for v in coor]
            coor_radius_edge[1] = coor_radius_edge[1] + new_radius
            coor_2d_radius_edge = project_to_2d_plane(coor_radius_edge, FOCAL_LENGTH)
            coor_2d_radius_edge = map_to_viewport(coor_2d_radius_edge)

            draw_radius = coor_2d_radius_edge[1] - atom_coor_2d[1]

            draw_ellipse(
                draw,
                (
                    atom_coor_2d[0] - draw_radius,
                    atom_coor_2d[1] - draw_radius,
                    atom_coor_2d[0] + draw_radius,
                    atom_coor_2d[1] + draw_radius,
                ),
                color_str,
                outline_str if first else color_str,
            )

            first = False

    iden_dir = "." + sep + iden + sep
    img_filename = iden_dir + iden + ".png"
    pdb_filename = iden_dir + iden + ".pdb"

    # __pragma__ ('skip')
    os.mkdir(iden_dir)
    # __pragma__ ('noskip')
    """?
    if node_params is not None:
        node_params["fs"].mkdirSync(iden_dir)
    ?"""

    img.save(img_filename)

    # out_pdb(pdb_filename, coors, elems, node_params)

    # __pragma__ ('skip')
    # run_blender(pdb_filename, img_filename, BLENDER_EXEC_PATH, VMD_PATH, IMG_SIZE, BLENDER_SCRIPT_DIR, node_params)
    # __pragma__ ('noskip')
    """?
    # if node_params is not None:
    #     run_blender(pdb_filename, img_filename, BLENDER_EXEC_PATH, VMD_PATH, IMG_SIZE, BLENDER_SCRIPT_DIR, node_params)
    ?"""