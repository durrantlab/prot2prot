import math

class ColorSchemeParent:
    def make_rgb_str(self, color):
        color_str = (
            "rgb("
            + str(int(color[0]))
            + ","
            + str(int(color[1]))
            + ","
            + str(int(color[2]))
            + ")"
        )

        return color_str

    def get_colors_for_many_radii(self, base_color, atom_radius, atom_center_dist, max_dist):
        data = []
        num_steps = 3.0
        for f in [r / num_steps for r in range(int(num_steps), 0, -1)]:
            new_perpendicular_radius = f * atom_radius
            new_dist = atom_center_dist - atom_radius * math.sqrt(1 - f * f)
            color_str = self.color_from_dist(
                base_color, new_dist, max_dist
            )
            data.append((new_perpendicular_radius, color_str))
            # print(new_dist, new_perpendicular_radius, color_str)
        return data

    def color_from_dist(self, base_color, dist, max_dist):
        # To be overwritten
        return ""

    def get_alpha_from_dist(self, dist, max_dist):
        return 1 - dist / max_dist