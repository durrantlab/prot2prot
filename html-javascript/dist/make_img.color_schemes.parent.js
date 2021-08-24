// Transcrypt'ed from Python, 2021-08-23 22:00:29
var math = {};
import {AssertionError, AttributeError, BaseException, DeprecationWarning, Exception, IndexError, IterableError, KeyError, NotImplementedError, RuntimeWarning, StopIteration, UserWarning, ValueError, Warning, __JsIterator__, __PyIterator__, __Terminal__, __add__, __and__, __call__, __class__, __envir__, __eq__, __floordiv__, __ge__, __get__, __getcm__, __getitem__, __getslice__, __getsm__, __gt__, __i__, __iadd__, __iand__, __idiv__, __ijsmod__, __ilshift__, __imatmul__, __imod__, __imul__, __in__, __init__, __ior__, __ipow__, __irshift__, __isub__, __ixor__, __jsUsePyNext__, __jsmod__, __k__, __kwargtrans__, __le__, __lshift__, __lt__, __matmul__, __mergefields__, __mergekwargtrans__, __mod__, __mul__, __ne__, __neg__, __nest__, __or__, __pow__, __pragma__, __proxy__, __pyUseJsNext__, __rshift__, __setitem__, __setproperty__, __setslice__, __sort__, __specialattrib__, __sub__, __super__, __t__, __terminal__, __truediv__, __withblock__, __xor__, abs, all, any, assert, bool, bytearray, bytes, callable, chr, copy, deepcopy, delattr, dict, dir, divmod, enumerate, filter, float, getattr, hasattr, input, int, isinstance, issubclass, len, list, map, max, min, object, ord, pow, print, property, py_TypeError, py_iter, py_metatype, py_next, py_reversed, py_typeof, range, repr, round, set, setattr, sorted, str, sum, tuple, zip} from './org.transcrypt.__runtime__.js';
import * as __module_math__ from './math.js';
__nest__ (math, '', __module_math__);
var __name__ = 'make_img.color_schemes.parent';
export var ColorSchemeParent =  __class__ ('ColorSchemeParent', [object], {
	__module__: __name__,
	get make_rgb_str () {return __get__ (this, function (self, color) {
		var color_str = ((((('rgb(' + str (int (color [0]))) + ',') + str (int (color [1]))) + ',') + str (int (color [2]))) + ')';
		return color_str;
	});},
	get get_colors_for_many_radii () {return __get__ (this, function (self, base_color, atom_radius, atom_center_dist, max_dist) {
		var data = [];
		var num_steps = 3.0;
		for (var f of (function () {
			var __accu0__ = [];
			for (var r = int (num_steps); r > 0; r--) {
				__accu0__.append (r / num_steps);
			}
			return __accu0__;
		}) ()) {
			var new_perpendicular_radius = f * atom_radius;
			var new_dist = atom_center_dist - atom_radius * math.sqrt (1 - f * f);
			var color_str = self.color_from_dist (base_color, new_dist, max_dist);
			data.append (tuple ([new_perpendicular_radius, color_str]));
		}
		return data;
	});},
	get color_from_dist () {return __get__ (this, function (self, base_color, dist, max_dist) {
		return '';
	});},
	get get_alpha_from_dist () {return __get__ (this, function (self, dist, max_dist) {
		return 1 - dist / max_dist;
	});}
});

//# sourceMappingURL=make_img.color_schemes.parent.map