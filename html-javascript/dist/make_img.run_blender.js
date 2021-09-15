// Transcrypt'ed from Python, 2021-08-23 22:00:29
import {AssertionError, AttributeError, BaseException, DeprecationWarning, Exception, IndexError, IterableError, KeyError, NotImplementedError, RuntimeWarning, StopIteration, UserWarning, ValueError, Warning, __JsIterator__, __PyIterator__, __Terminal__, __add__, __and__, __call__, __class__, __envir__, __eq__, __floordiv__, __ge__, __get__, __getcm__, __getitem__, __getslice__, __getsm__, __gt__, __i__, __iadd__, __iand__, __idiv__, __ijsmod__, __ilshift__, __imatmul__, __imod__, __imul__, __in__, __init__, __ior__, __ipow__, __irshift__, __isub__, __ixor__, __jsUsePyNext__, __jsmod__, __k__, __kwargtrans__, __le__, __lshift__, __lt__, __matmul__, __mergefields__, __mergekwargtrans__, __mod__, __mul__, __ne__, __neg__, __nest__, __or__, __pow__, __pragma__, __proxy__, __pyUseJsNext__, __rshift__, __setitem__, __setproperty__, __setslice__, __sort__, __specialattrib__, __sub__, __super__, __t__, __terminal__, __truediv__, __withblock__, __xor__, abs, all, any, assert, bool, bytearray, bytes, callable, chr, copy, deepcopy, delattr, dict, dir, divmod, enumerate, filter, float, getattr, hasattr, input, int, isinstance, issubclass, len, list, map, max, min, object, ord, pow, print, property, py_TypeError, py_iter, py_metatype, py_next, py_reversed, py_typeof, range, repr, round, set, setattr, sorted, str, sum, tuple, zip} from './org.transcrypt.__runtime__.js';
var __name__ = 'make_img.run_blender';
export var abspth = function (pth, node_params) {
	return node_params ['abspath'] (pth);
};
export var runit = function (cmd, node_params) {
	node_params ['execSync'] (cmd, dict ({'shell': 1}));
	return null;
};
export var run_blender = function (pdb_filename, img_filename, blender_exec_path, vmd_path, img_size, blender_script_dir, node_params) {
	var PDB_OUT_ABS_PATH = abspth (pdb_filename, node_params);
	var PNG_OUT = abspth (img_filename, node_params) + '.2.png';
	var background = [' -b', ''] [0];
	var cmd = ((((((((((((('cd ' + blender_script_dir) + '; ') + blender_exec_path) + background) + ' base.blend -P blender.py -- "') + PDB_OUT_ABS_PATH) + '" "') + vmd_path) + '" ') + str (img_size)) + ' ') + '"') + PNG_OUT) + '"';
	print (cmd);
	runit (cmd, node_params);
};

//# sourceMappingURL=make_img.run_blender.map