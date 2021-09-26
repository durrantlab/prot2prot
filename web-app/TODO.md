ONGOING
=======

titles on all buttons to explain controls

Create models that are tiny (maybe 64x64) for fast previewrendering. User can
choose between that and simpel spheres.

Don't draw spheres outside viewport. Would have a little time, perhaps.

Don't let protein get so close (increase that min distance). It doesn't look
good up close.

Put things in webworkers.

Click and drag on image to rotate? Would be great.

Make sure you never run inference until previous one finished.

IF YOU NEED TO REDO IMAGE:

- Don't even do ones that are very close up. Min dist 15, perhaps?
- Modify the pdbparse itself with consolate same-colored atoms. Do it on the
  level of the PDB.
- Remove waters optionally (if present).
- Good to have atom => symbol => color mapping all in one place. Get confusing.

DONE
====

tf.tidy

Ability to specify dimension size and model quality.

Description in .json file. Color scheme, etc.

Add hydrogens, swap in other atoms to make sure represented.

No offsets. This will futher encourage whole-protein visualizations.

