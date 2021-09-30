ONGOING
=======

titles on all buttons to explain controls

Create models that are tiny (maybe 64x64) for fast previewrendering. User can
choose between that and simpel spheres.

Put things in webworkers. Still a good idea, but note that you can use offcanvas
  on Firefox. So maybe justs tensorflow render stuff? Perhaps other
  calculations, but be judicious. Also, make sure you have non-webworker options
  available, because no easy webworkers in node. 

Click and drag on image to rotate? Would be great.

Try using unet128 instead of unet256. How does size compare? Possible to get
reasonable results? (I think you'll have to use 128 for the 128x128 images, but
could try with 256 too.)

Experiments
===========

Don't draw spheres outside viewport. Would have a little time, perhaps.

Make sure you never run inference until previous one finished.

Don't let protein get so close (increase that min distance). It doesn't look
good up close.

training=True, with normalization:

- Training on CPU, saving with CPU, works in JavaScript but bad image.
- Training on GPU, saving with CPU, works if you replace NaN with null in
  model.json, but blank JavaScript.

Note that if you do use batch normalization, very important to set training to
True. Black screen even from python otherwise.

DONE
====

IF YOU NEED TO REDO IMAGE:

- Don't even do ones that are very close up. Min dist 15, perhaps?
- Modify the pdbparse itself with consolate same-colored atoms. Do it on the
  level of the PDB.
- Good to have atom => symbol => color mapping all in one place. Get confusing.
- Remove waters optionally (if present).

tf.tidy

Ability to specify dimension size and model quality.

Description in .json file. Color scheme, etc.

Add hydrogens, swap in other atoms to make sure represented.

No offsets. This will futher encourage whole-protein visualizations.

