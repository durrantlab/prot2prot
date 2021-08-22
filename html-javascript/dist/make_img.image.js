// Transcrypt'ed from Python, 2021-08-22 00:46:41
import {AssertionError, AttributeError, BaseException, DeprecationWarning, Exception, IndexError, IterableError, KeyError, NotImplementedError, RuntimeWarning, StopIteration, UserWarning, ValueError, Warning, __JsIterator__, __PyIterator__, __Terminal__, __add__, __and__, __call__, __class__, __envir__, __eq__, __floordiv__, __ge__, __get__, __getcm__, __getitem__, __getslice__, __getsm__, __gt__, __i__, __iadd__, __iand__, __idiv__, __ijsmod__, __ilshift__, __imatmul__, __imod__, __imul__, __in__, __init__, __ior__, __ipow__, __irshift__, __isub__, __ixor__, __jsUsePyNext__, __jsmod__, __k__, __kwargtrans__, __le__, __lshift__, __lt__, __matmul__, __mergefields__, __mergekwargtrans__, __mod__, __mul__, __ne__, __neg__, __nest__, __or__, __pow__, __pragma__, __proxy__, __pyUseJsNext__, __rshift__, __setitem__, __setproperty__, __setslice__, __sort__, __specialattrib__, __sub__, __super__, __t__, __terminal__, __truediv__, __withblock__, __xor__, abs, all, any, assert, bool, bytearray, bytes, callable, chr, copy, deepcopy, delattr, dict, dir, divmod, enumerate, filter, float, getattr, hasattr, input, int, isinstance, issubclass, len, list, map, max, min, object, ord, pow, print, property, py_TypeError, py_iter, py_metatype, py_next, py_reversed, py_typeof, range, repr, round, set, setattr, sorted, str, sum, tuple, zip} from './org.transcrypt.__runtime__.js';
var __name__ = 'make_img.image';
export var WebImage =  __class__ ('WebImage', [object], {
	__module__: __name__,
	create_canvas: null,
	get __init__ () {return __get__ (this, function (self, size, bgcolor_hex, node_params) {
		if (typeof node_params == 'undefined' || (node_params != null && node_params.hasOwnProperty ("__kwargtrans__"))) {;
			var node_params = null;
		};
		self.size = size;
		if (node_params === null) {
			var canvas = document.createElement ('canvas');
			canvas.width = size;
			canvas.height = size;
			canvas.id = 'canvasRenderer';
			document.body.appendChild (canvas);
		}
		else {
			self.create_canvas = node_params ['createCanvas'];
			self.fs = node_params ['fs'];
			var canvas = node_params ['createCanvas'] (size, size);
		}
		var context = canvas.getContext ('2d');
		context.fillStyle = bgcolor_hex;
		context.fillRect (0, 0, size, size);
		self.canvas = canvas;
		self.context = context;
	});},
	get save () {return __get__ (this, function (self, img_filename) {
		if (self.create_canvas !== null) {
			var buffer = self.canvas.toBuffer ('image/png');
			self.fs.writeFileSync (img_filename, buffer);
		}
		return null;
	});}
});
export var WebImageDraw =  __class__ ('WebImageDraw', [object], {
	__module__: __name__,
	get __init__ () {return __get__ (this, function (self, img) {
		self.img = img;
	});},
	get ellipse () {return __get__ (this, function (self, bounds, fill_color, outline_color) {
		var context = self.img.context;
		var center_x = 0.5 * (bounds [0] + bounds [2]);
		var center_y = 0.5 * (bounds [1] + bounds [3]);
		var radius = 0.5 * (bounds [2] - bounds [0]);
		var fls = false;
		context.beginPath ();
		context.arc (center_x, center_y, radius, 0, 2 * Math.PI, fls);
		context.fillStyle = fill_color;
		context.fill ();
		context.lineWidth = 1;
		context.strokeStyle = outline_color;
		context.stroke ();
	});}
});
export var draw_ellipse = function (draw, bounds, fill_color, outline_color) {
	draw.ellipse (bounds, fill_color, outline_color);
};
export var get_image_mod = function (size, node_params, color_scheme) {
	return WebImage (size, color_scheme.background_color_hex, node_params);
};
export var get_image_draw = function (img) {
	return WebImageDraw (img);
};

//# sourceMappingURL=make_img.image.map