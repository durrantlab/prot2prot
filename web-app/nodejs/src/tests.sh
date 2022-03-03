rm -rf tests
mkdir -p tests/still
mkdir -p tests/rock
mkdir -p tests/turn_table
mkdir -p tests/zoom

node render_still.js -p ../5iy4.pdb -o tests/still/out.png --x_rot 0.5 --y_rot 1.0 --z_rot .75 --dist 100 --debug --mode both --color FF0000 --color_strength 0.25 --color_blend 2

node render_rock.js -p ../5iy4.pdb -o tests/rock/out.png --x_rot 0.5 --y_rot 1.0 --z_rot .75 --dist 200 --debug --mode both --rock_mag 45 --frames 5 --color 00FF00 --color_strength 0.75

node render_turn_table.js -p ../5iy4.pdb -o tests/turn_table/out.png --x_rot 0.5 --y_rot 1.0 --z_rot .75 --dist 200 --debug --mode both --turn_table_axis y --frames 5 --color 0000FF

node render_zoom.js -p ../5iy4.pdb -o tests/zoom/out.png --x_rot 0.5 --y_rot 1.0 --z_rot .75 --dist 200 --debug --mode both --zoom_min_dist 150 --zoom_max_dist 300 --frames 5 --color FF00FF
