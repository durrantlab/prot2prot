from make_img.color_schemes.parent import ColorSchemeParent
import math


class ColorScheme(ColorSchemeParent):
    background_color_rgb = (0, 0, 0)
    background_color_hex = "#000"

    def colors(self, atom_center_dist, max_dist, element, atom_radius):
        
        base_color = {
            "C": [255, 255, 0],
            "N": [255, 0, 0],
            "O": [0, 255, 0],
            "H": [0, 128, 0],
            "S": [128, 0, 0],
        }[element]

        outline_str = self.outline_color_from_dist(atom_center_dist, max_dist)

        data = self.get_colors_for_many_radii(
            base_color, atom_radius, atom_center_dist, max_dist
        )

        return outline_str, data

    def color_from_dist(self, base_color, dist, max_dist):
        alpha = self.get_alpha_from_dist(dist, max_dist)
        base_color_to_use = base_color[:]
        base_color_to_use[2] = 255 * (1 - alpha)

        color_str = self.make_rgb_str(base_color_to_use)

        return color_str

    def outline_color_from_dist(self, dist, max_dist):
        alpha = self.get_alpha_from_dist(dist, max_dist)
        inv_alph = str(int(255 * (1 - alpha)))
        outline_str = self.make_rgb_str([inv_alph, inv_alph, inv_alph])
        return outline_str

 