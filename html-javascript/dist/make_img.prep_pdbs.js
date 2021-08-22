// Transcrypt'ed from Python, 2021-08-22 00:46:41
import {AssertionError, AttributeError, BaseException, DeprecationWarning, Exception, IndexError, IterableError, KeyError, NotImplementedError, RuntimeWarning, StopIteration, UserWarning, ValueError, Warning, __JsIterator__, __PyIterator__, __Terminal__, __add__, __and__, __call__, __class__, __envir__, __eq__, __floordiv__, __ge__, __get__, __getcm__, __getitem__, __getslice__, __getsm__, __gt__, __i__, __iadd__, __iand__, __idiv__, __ijsmod__, __ilshift__, __imatmul__, __imod__, __imul__, __in__, __init__, __ior__, __ipow__, __irshift__, __isub__, __ixor__, __jsUsePyNext__, __jsmod__, __k__, __kwargtrans__, __le__, __lshift__, __lt__, __matmul__, __mergefields__, __mergekwargtrans__, __mod__, __mul__, __ne__, __neg__, __nest__, __or__, __pow__, __pragma__, __proxy__, __pyUseJsNext__, __rshift__, __setitem__, __setproperty__, __setslice__, __sort__, __specialattrib__, __sub__, __super__, __t__, __terminal__, __truediv__, __withblock__, __xor__, abs, all, any, assert, bool, bytearray, bytes, callable, chr, copy, deepcopy, delattr, dict, dir, divmod, enumerate, filter, float, getattr, hasattr, input, int, isinstance, issubclass, len, list, map, max, min, object, ord, pow, print, property, py_TypeError, py_iter, py_metatype, py_next, py_reversed, py_typeof, range, repr, round, set, setattr, sorted, str, sum, tuple, zip} from './org.transcrypt.__runtime__.js';
var __name__ = 'make_img.prep_pdbs';
export var vdw = dict ({'H': 1.2, 'C': 1.7, 'N': 1.55, 'O': 1.52, 'F': 1.47, 'P': 1.8, 'S': 1.8, 'B': 2.0, 'LI': 1.82, 'NA': 2.27, 'MG': 1.73, 'AL': 2.0, 'CL': 1.75, 'CA': 2.0, 'MN': 2.0, 'FE': 2.0, 'CO': 2.0, 'CU': 1.4, 'ZN': 1.39, 'AS': 1.85, 'BR': 1.85, 'MO': 2.0, 'RH': 2.0, 'AG': 1.72, 'AU': 1.66, 'PB': 2.02, 'BI': 2.0, 'K': 2.75, 'I': 1.98});
export var from_pdb_txt = function (pdb_txt) {
	var lines = pdb_txt.py_split ('\n');
	var lines = (function () {
		var __accu0__ = [];
		for (var l of lines) {
			if ((l.startswith ('ATOM ') || __in__ ('ENDMDL', l)) && !(__in__ (' HOH ', l)) && !(__in__ (' WAT ', l)) && !(__in__ (' TIP', l))) {
				__accu0__.append (l.strip ());
			}
		}
		return __accu0__;
	}) ();
	if (__in__ ('ENDMDL', lines)) {
		var lines = lines.__getslice__ (0, lines.index ('ENDMDL'), 1);
	}
	var coors = (function () {
		var __accu0__ = [];
		for (var l of lines) {
			__accu0__.append (tuple ([float (l.__getslice__ (30, 38, 1)), float (l.__getslice__ (38, 46, 1)), float (l.__getslice__ (46, 54, 1))]));
		}
		return __accu0__;
	}) ();
	var elems = (function () {
		var __accu0__ = [];
		for (var l of lines) {
			__accu0__.append (l.__getslice__ (-(2), null, 1).strip ());
		}
		return __accu0__;
	}) ();
	var vdws = (function () {
		var __accu0__ = [];
		for (var e of elems) {
			__accu0__.append (vdw [e]);
		}
		return __accu0__;
	}) ();
	return dict ({'coors': coors, 'elems': elems, 'vdws': vdws});
};

//# sourceMappingURL=make_img.prep_pdbs.map