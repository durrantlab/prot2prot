// Transcrypt'ed from Python, 2021-08-23 22:00:29
import {AssertionError, AttributeError, BaseException, DeprecationWarning, Exception, IndexError, IterableError, KeyError, NotImplementedError, RuntimeWarning, StopIteration, UserWarning, ValueError, Warning, __JsIterator__, __PyIterator__, __Terminal__, __add__, __and__, __call__, __class__, __envir__, __eq__, __floordiv__, __ge__, __get__, __getcm__, __getitem__, __getslice__, __getsm__, __gt__, __i__, __iadd__, __iand__, __idiv__, __ijsmod__, __ilshift__, __imatmul__, __imod__, __imul__, __in__, __init__, __ior__, __ipow__, __irshift__, __isub__, __ixor__, __jsUsePyNext__, __jsmod__, __k__, __kwargtrans__, __le__, __lshift__, __lt__, __matmul__, __mergefields__, __mergekwargtrans__, __mod__, __mul__, __ne__, __neg__, __nest__, __or__, __pow__, __pragma__, __proxy__, __pyUseJsNext__, __rshift__, __setitem__, __setproperty__, __setslice__, __sort__, __specialattrib__, __sub__, __super__, __t__, __terminal__, __truediv__, __withblock__, __xor__, abs, all, any, assert, bool, bytearray, bytes, callable, chr, copy, deepcopy, delattr, dict, dir, divmod, enumerate, filter, float, getattr, hasattr, input, int, isinstance, issubclass, len, list, map, max, min, object, ord, pow, print, property, py_TypeError, py_iter, py_metatype, py_next, py_reversed, py_typeof, range, repr, round, set, setattr, sorted, str, sum, tuple, zip} from './org.transcrypt.__runtime__.js';
var __name__ = 'make_img.out_pdb';
export var rjust = function (s, cnt) {
	while (len (s) < cnt) {
		var s = ' ' + s;
	}
	return s;
};
export var format_num = function (num) {
	var s = num.toFixed (3);
	return s;
};
export var out_pdb = function (pdb_filename, coors, elems, node_params) {
	if (typeof node_params == 'undefined' || (node_params != null && node_params.hasOwnProperty ("__kwargtrans__"))) {;
		var node_params = null;
	};
	var i = 1;
	var pdb_txt = '';
	for (var [c, e] of zip (coors, elems)) {
		var i_str = rjust (str (i), 6);
		var e = rjust (e, 2);
		var x = rjust (format_num (c [0]), 8);
		var y = rjust (format_num (c [1]), 8);
		var z = rjust (format_num (c [2]), 8);
		var line = 'ATOM {} {}   XXX A  99    {}{}{}  1.00  0.00          {}  '.format (i_str, e, x, y, z, e);
		var pdb_txt = (pdb_txt + line) + '\n';
		var i = i + 1;
	}
	if (node_params !== null) {
		node_params ['fs'].writeFileSync (pdb_filename, pdb_txt);
	}
};

//# sourceMappingURL=make_img.out_pdb.map