// Transcrypt'ed from Python, 2021-08-23 22:00:28
var make_img = {};
var math = {};
var random = {};
import {AssertionError, AttributeError, BaseException, DeprecationWarning, Exception, IndexError, IterableError, KeyError, NotImplementedError, RuntimeWarning, StopIteration, UserWarning, ValueError, Warning, __JsIterator__, __PyIterator__, __Terminal__, __add__, __and__, __call__, __class__, __envir__, __eq__, __floordiv__, __ge__, __get__, __getcm__, __getitem__, __getslice__, __getsm__, __gt__, __i__, __iadd__, __iand__, __idiv__, __ijsmod__, __ilshift__, __imatmul__, __imod__, __imul__, __in__, __init__, __ior__, __ipow__, __irshift__, __isub__, __ixor__, __jsUsePyNext__, __jsmod__, __k__, __kwargtrans__, __le__, __lshift__, __lt__, __matmul__, __mergefields__, __mergekwargtrans__, __mod__, __mul__, __ne__, __neg__, __nest__, __or__, __pow__, __pragma__, __proxy__, __pyUseJsNext__, __rshift__, __setitem__, __setproperty__, __setslice__, __sort__, __specialattrib__, __sub__, __super__, __t__, __terminal__, __truediv__, __withblock__, __xor__, abs, all, any, assert, bool, bytearray, bytes, callable, chr, copy, deepcopy, delattr, dict, dir, divmod, enumerate, filter, float, getattr, hasattr, input, int, isinstance, issubclass, len, list, map, max, min, object, ord, pow, print, property, py_TypeError, py_iter, py_metatype, py_next, py_reversed, py_typeof, range, repr, round, set, setattr, sorted, str, sum, tuple, zip} from './org.transcrypt.__runtime__.js';
import * as numpy from './numscrypt.js';
import * as pdbs from './make_img.pdbs.js';
import {ColorScheme} from './make_img.color_schemes.new.js';
import {from_pdb_txt} from './make_img.prep_pdbs.js';
import {draw_ellipse, get_image_draw, get_image_mod} from './make_img.image.js';
import * as __module_make_img__ from './make_img.js';
__nest__ (make_img, '', __module_make_img__);
import * as __module_math__ from './math.js';
__nest__ (math, '', __module_math__);
import * as __module_random__ from './random.js';
__nest__ (random, '', __module_random__);
import {out_pdb} from './make_img.out_pdb.js';
import {run_blender} from './make_img.run_blender.js';
export {get_image_draw, ColorScheme, out_pdb, from_pdb_txt, draw_ellipse, run_blender, pdbs, get_image_mod, numpy};
var __name__ = '__main__';
export var sep = '/';
export var PDB_FILENAME = random.choice (list (pdbs.pdb_files.py_keys ()));
export var PDB_DIST = 150 * random.random ();
export var IMG_SIZE = 256;
export var ZOOM_FACTOR = 1;
export var FOCAL_LENGTH = 1418.5;
export var VMD_PATH = '/Applications/VMD 1.9.1.app/Contents/vmd/vmd_MACOSXX86';
export var BLENDER_EXEC_PATH = '/Applications/Blender.app/Contents/MacOS/Blender';
export var BLENDER_SCRIPT_DIR = '/Users/jdurrant/Documents/Work/ml_protein_render/blender/';
export var color_scheme = ColorScheme ();
export var map_to_viewport = function (coor_2d) {
	var coor_2d = (function () {
		var __accu0__ = [];
		for (var v of coor_2d) {
			__accu0__.append (v * ZOOM_FACTOR + 0.5 * IMG_SIZE);
		}
		return __accu0__;
	}) ();
	return coor_2d;
};
export var randomly_rotate = function (coors) {
	var thetax = random.random () * math.pi;
	var thetay = random.random () * math.pi;
	var thetaz = random.random () * math.pi;
	var sinx = math.sin (thetax);
	var siny = math.sin (thetay);
	var sinz = math.sin (thetaz);
	var cosx = math.cos (thetax);
	var cosy = math.cos (thetay);
	var cosz = math.cos (thetaz);
	var rot_matrix = numpy.array ([[cosy * cosz, (sinx * siny) * cosz + cosx * sinz, sinx * sinz - (cosx * siny) * cosz], [-(cosy * sinz), cosx * cosz - (sinx * siny) * sinz, (cosx * siny) * sinz + sinx * cosz], [siny, -(sinx * cosy), cosx * cosy]]);
	var new_coors = (__matmul__ (rot_matrix, coors.transpose ())).transpose ();
	return new_coors;
};
export var project_to_2d_plane = function (world_coor, focal_length) {
	var __left0__ = world_coor;
	var l = __left0__ [0];
	var m = __left0__ [1];
	var n = __left0__ [2];
	var x = (focal_length * l) / n;
	var y = (focal_length * m) / n;
	return [x, y];
};
export var move_pdb_coors = function (coors) {
	var coors = randomly_rotate (coors).tolist ();
	var coors = (function () {
		var __accu0__ = [];
		for (var c of coors) {
			__accu0__.append ([c [0], c [1], c [2] + PDB_DIST]);
		}
		return __accu0__;
	}) ();
	return coors;
};
export var main = function (node_params, pdb_txt) {
	if (typeof node_params == 'undefined' || (node_params != null && node_params.hasOwnProperty ("__kwargtrans__"))) {;
		var node_params = null;
	};
	if (typeof pdb_txt == 'undefined' || (pdb_txt != null && pdb_txt.hasOwnProperty ("__kwargtrans__"))) {;
		var pdb_txt = null;
	};
	if (pdb_txt === null) {
		var pdb_data = pdbs.pdb_files [PDB_FILENAME];
		var coors = numpy.array (pdb_data ['coors']);
		var coors = move_pdb_coors (coors);
		var iden = str (random.random ()).py_replace ('.', '');
	}
	else {
		var pdb_data = from_pdb_txt (pdb_txt);
		var coors = pdb_data ['coors'];
		var iden = 'output.new_color';
	}
	var elems = pdb_data ['elems'];
	var vdws = pdb_data ['vdws'];
	for (var c of coors) {
		if (c [2] < 0) {
			print ('Some atoms were behind the camera. Cancelling...');
			alert('Please reload the page and try again...');
			return ;
		}
	}
	var dists = (function () {
		var __accu0__ = [];
		for (var [i, d] of enumerate (coors)) {
			__accu0__.append ([math.sqrt ((d [0] * d [0] + d [1] * d [1]) + d [2] * d [2]), i]);
		}
		return __accu0__;
	}) ();
	var compare = function (a, b) {
		return b [0] - a [0];
	};
	var max_dist = dists [0] [0];
	var min_dist = dists [len (dists) - 1] [0];
	var img = get_image_mod (IMG_SIZE, node_params, color_scheme);
	var draw = get_image_draw (img);
	for (var [dist, i] of dists) {
		var coor = coors [i];
		var element = elems [i];
		var atom_coor_2d = project_to_2d_plane (coor, FOCAL_LENGTH);
		var atom_coor_2d = map_to_viewport (atom_coor_2d);
		var __left0__ = color_scheme.colors (dist, max_dist, element, vdws [i]);
		var outline_str = __left0__ [0];
		var shading_data = __left0__ [1];
		var first = true;
		for (var [new_radius, color_str] of shading_data) {
			var coor_radius_edge = (function () {
				var __accu0__ = [];
				for (var v of coor) {
					__accu0__.append (v);
				}
				return __accu0__;
			}) ();
			coor_radius_edge [1] = coor_radius_edge [1] + new_radius;
			var coor_2d_radius_edge = project_to_2d_plane (coor_radius_edge, FOCAL_LENGTH);
			var coor_2d_radius_edge = map_to_viewport (coor_2d_radius_edge);
			var draw_radius = coor_2d_radius_edge [1] - atom_coor_2d [1];
			draw_ellipse (draw, tuple ([atom_coor_2d [0] - draw_radius, atom_coor_2d [1] - draw_radius, atom_coor_2d [0] + draw_radius, atom_coor_2d [1] + draw_radius]), color_str, (first ? outline_str : color_str));
			var first = false;
		}
	}
	var iden_dir = (('.' + sep) + iden) + sep;
	var img_filename = (iden_dir + iden) + '.png';
	var pdb_filename = (iden_dir + iden) + '.pdb';
	if (node_params !== null) {
		node_params ['fs'].mkdirSync (iden_dir);
	}
	img.save (img_filename);
};

//# sourceMappingURL=make_img.map