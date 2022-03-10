ONGOING
=======

What about downloading prot2prot models from web automatically? Or could
prepackage. For CLi version.

Phone doesn't look good, and doesn't work. Need to debug.

What about only 1024x1024mdodels (not smaller)? See if it would work on phones.

Experiments
===========

Make sure scroll zoom work on phones. (not zoom yet)
  https://stackoverflow.com/questions/11183174/simplest-way-to-detect-a-pinch

Works on firefox?
  https://stackoverflow.com/questions/63475815/tensorflowjs-initialization-of-backend-webgl-failed-on-firefox-and-safari-with

Report file sizes. Maybe also on progress bar.

Warn that first render takes longer.

Make sure css generally looks alright on phones. Some touchups needed.

Can you detect GPU memory and give warning? Probably not.

Does "protein only atoms" do anything?

Search for: the "Download" button(s) in the "Output" tab.

When load protein, scroll down.

Example files should work

Gray out prot2prot render when rendering.

Save button. (DONE, but make look better.)

Lots of Webina cruft

Some subpanels only show up if molecule loaded.

Enable change model after render (consider model path as id).

Mouse leave canvas should be same as mouse up.

Put max-width on canvas (1024x1024 too big).

No need for worker message to vanish.

Report messages from webworker in main thread.

tfjs way to indicate progress of download (so user not left wondering...)
  Yes: https://www.geeksforgeeks.org/tensorflow-js-tf-loadgraphmodel-function/

Replace slider and rotate buttons with instructions re. use (drag, scroll).

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

When loading models, spin mouse (to show doing something).

Need to make durrantlab.com/prot2prot work.

If it's trying to render on the webworker, but you move the protein again,
cancel webworker calculations and don't return image.

Add more descriptions to model names (where to use, eg.). Also, wanring with
1024x1024.

Option to specify max atoms. Don't emit if exceeds.

Figur eout if memoty lleaks:
  console.log(tf.memory());
  tf.profile
  https://js.tensorflow.org/api/latest/#memory

Check memory leaks. Also in PDB loading/parsing side? Good to keep memory
footprint as low as possible. You crashed even your new laptop once. Way to
prevent by detecting GPU available?

Good to automatically remove rotamers. See 6MDW.pdb for example.

Catch errors. Try 4V7Q to get one.

What about showing only limited atoms in viewport (stride)? That way, won't ever
be too many. But use all atoms to visualize the protein in the end. I think I
have the code for this, but haven't tested it.

Need unified function for trying to parse format, based on extension, perhaps
contents, etc. Currently assuming PDBMol in too many places.

Pure white (no shadow) looks bad. Retrain. Checked earlier versions, and doesn't
look good. Need to start from scratch I think.

Option to remove hydrogen atoms from protein.

Resize length of multi-frame PDB to match specified frames. Throw warning if not
the same. Make sure first and last match always.

On nodejs versions, description at start of every program.

Images not saved until end of rendering. Why?

Update filenames when strip everything but protein.

Fileloading should work through all the general functions, even if they aren't
needed.

What about PDB frames for videos (from command line only)

Get rid of ribbon ones (don't work).

Add chalk white without shadow.

Update file system so you can remove certain chains.

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

