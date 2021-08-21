# __pragma__ ('skip')
from PIL import Image, ImageDraw
# __pragma__ ('noskip')

class WebImage:
    create_canvas = None

    def __init__(self, size, bgcolor_hex, node_params=None):
        self.size = size

        """?
        if node_params is None:
            # In browser
            canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            canvas.id = "canvasRenderer";

            # For debugging
            document.body.appendChild(canvas);
        else:
            # In node.
            self.create_canvas = node_params["createCanvas"]
            self.fs = node_params["fs"]
            canvas = node_params["createCanvas"](size, size)

        context = canvas.getContext('2d');
        context.fillStyle = bgcolor_hex
        context.fillRect(0, 0, size, size)

        ?"""

        # print("Should fog drop of exponentially? Match what Blender does. Perhaps even with starting point? Not sure.")

        self.canvas = canvas
        self.context = context

    def save(self, img_filename):
        """?
        if self.create_canvas is not None:
            # Works only in node...
            buffer = self.canvas.toBuffer('image/png')
            self.fs.writeFileSync(img_filename, buffer)
        ?"""
        return None

class WebImageDraw:
    def __init__(self, img):
        self.img = img

    def ellipse(self, bounds, fill_color, outline_color):
        context = self.img.context
        center_x = 0.5 * (bounds[0] + bounds[2])
        center_y = 0.5 * (bounds[1] + bounds[3])
        radius = 0.5 * (bounds[2] - bounds[0])
        fls = False

        """?
        context.beginPath();
        context.arc(center_x, center_y, radius, 0, 2 * Math.PI, fls);
        context.fillStyle = fill_color;
        context.fill();
        context.lineWidth = 1;
        context.strokeStyle = outline_color;
        context.stroke();
        ?"""

def draw_ellipse(draw, bounds, fill_color, outline_color):
    # __pragma__ ('skip')
    draw.ellipse(
        bounds,
        fill=fill_color,
        outline=outline_color,
    )
    # __pragma__ ('noskip')

    """?
    draw.ellipse(bounds, fill_color, outline_color)
    ?"""

def get_image_mod(size, node_params, color_scheme):
    """?
    return WebImage(size, color_scheme.background_color_hex, node_params)
    ?"""

    # __pragma__ ('skip')
    return Image.new("RGB", (size, size), color_scheme.background_color_rgb)
    # __pragma__ ('noskip')

def get_image_draw(img):
    """?
    return WebImageDraw(img)
    ?"""

    # __pragma__ ('skip')
    return ImageDraw.Draw(img)
    # __pragma__ ('noskip')