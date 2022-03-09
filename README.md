# Prot2Prot

## Introduction

Prot2Prot is a deep-learning model that imitates a Blender-rendered molecular
image given a much simpler representation ("sketch") of a protein surface.
Prot2Prot outputs an image that is often indistinguishable from a BlendMol-based
visualization in a fraction of the time, allowing image "rendering" even in a
web browser.

Prot2Prot is released under the terms of the Apache License, Version 2.0. See
`LICENSE.md` for details.

## Usage

The vast majority of users should simply visit 

# Directories

* `./py-gen-training-data/` : Code to generate training data (images).
* `./html-javascript/` : HTML/JavaScript files (generating input images in the
  browser, inference in the browser)
* `./pdbs/` : Code that puts PDB data in a Python module (for convenience in
  testing).
* `./py-tensorflow-training/` : Code for training the pix2pix model.

# TODO

* Get training code in this repo.
* Clean up code some for Harrison.
  * Training code
  * Also HTML/Javascript code.