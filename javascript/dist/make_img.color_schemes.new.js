// Transcrypt'ed from Python, 2021-08-21 02:09:21
var math = {};
import {AssertionError, AttributeError, BaseException, DeprecationWarning, Exception, IndexError, IterableError, KeyError, NotImplementedError, RuntimeWarning, StopIteration, UserWarning, ValueError, Warning, __JsIterator__, __PyIterator__, __Terminal__, __add__, __and__, __call__, __class__, __envir__, __eq__, __floordiv__, __ge__, __get__, __getcm__, __getitem__, __getslice__, __getsm__, __gt__, __i__, __iadd__, __iand__, __idiv__, __ijsmod__, __ilshift__, __imatmul__, __imod__, __imul__, __in__, __init__, __ior__, __ipow__, __irshift__, __isub__, __ixor__, __jsUsePyNext__, __jsmod__, __k__, __kwargtrans__, __le__, __lshift__, __lt__, __matmul__, __mergefields__, __mergekwargtrans__, __mod__, __mul__, __ne__, __neg__, __nest__, __or__, __pow__, __pragma__, __proxy__, __pyUseJsNext__, __rshift__, __setitem__, __setproperty__, __setslice__, __sort__, __specialattrib__, __sub__, __super__, __t__, __terminal__, __truediv__, __withblock__, __xor__, abs, all, any, assert, bool, bytearray, bytes, callable, chr, copy, deepcopy, delattr, dict, dir, divmod, enumerate, filter, float, getattr, hasattr, input, int, isinstance, issubclass, len, list, map, max, min, object, ord, pow, print, property, py_TypeError, py_iter, py_metatype, py_next, py_reversed, py_typeof, range, repr, round, set, setattr, sorted, str, sum, tuple, zip} from './org.transcrypt.__runtime__.js';
import * as __module_math__ from './math.js';
__nest__ (math, '', __module_math__);
import {ColorSchemeParent} from './make_img.color_schemes.parent.js';
var __name__ = 'make_img.color_schemes.new';
export var ColorScheme =  __class__ ('ColorScheme', [ColorSchemeParent], {
	__module__: __name__,
	background_color_rgb: tuple ([0, 0, 0]),
	background_color_hex: '#000',
	get colors () {return __get__ (this, function (self, atom_center_dist, max_dist, element, atom_radius) {
		var base_color = dict ({'C': [255, 255, 0], 'N': [255, 0, 0], 'O': [0, 255, 0], 'H': [0, 128, 0], 'S': [128, 0, 0]}) [element];
		var outline_str = self.outline_color_from_dist (atom_center_dist, max_dist);
		var data = self.get_colors_for_many_radii (base_color, atom_radius, atom_center_dist, max_dist);
		return tuple ([outline_str, data]);
	});},
	get color_from_dist () {return __get__ (this, function (self, base_color, dist, max_dist) {
		var alpha = self.get_alpha_from_dist (dist, max_dist);
		var base_color_to_use = base_color.__getslice__ (0, null, 1);
		base_color_to_use [2] = 255 * (1 - alpha);
		var color_str = self.make_rgb_str (base_color_to_use);
		return color_str;
	});},
	get outline_color_from_dist () {return __get__ (this, function (self, dist, max_dist) {
		var alpha = self.get_alpha_from_dist (dist, max_dist);
		var inv_alph = str (int (255 * (1 - alpha)));
		var outline_str = self.make_rgb_str ([inv_alph, inv_alph, inv_alph]);
		return outline_str;
	});}
});

//# sourceMappingURL=make_img.color_schemes.new.map