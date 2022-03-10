# Prot2Prot

Prot2Prot is a deep-learning model that imitates a Blender-rendered molecular
image given a much simpler representation ("sketch") of a protein surface.
Prot2Prot outputs an image that is often indistinguishable from a BlendMol-based
visualization in a fraction of the time, allowing image "rendering" even in a
web browser.

Prot2Prot is released under the terms of the Apache License, Version 2.0. See
`LICENSE.md` for details.

## Usage

### Prot2Prot Web App

The Prot2Prot web app works on all major operating systems. Most users should
simply visit the [Prot2Prot website](http://durrantlab.com/prot2prot) to use the
model in their browser.

You can also download a [copy of the Prot2Prot
web app](http://durrantlab.com/prot2prot/prot2prot.zip) (including the Prot2Prot
models themselves) to run on your own server.

### Command-line-interface Prot2Prot

Comand-line-interface (CLI) Prot2Prot requires Linux. Users can compile and run
CLI Prot2Prot by following these steps:

```bash
# Clone the repository
git clone https://git.durrantlab.pitt.edu/jdurrant/ml-protein-render.git

# Change into the ml-protein-render directory
cd ml-protein-render/

# Install the third-party dependencies
npm install

# Change into the nodejs directory
cd nodejs/

# Compile command-line prot2prot
./compile.sh

# Change into the newly created dist/ directory
cd dist/

# You must separately download and uncompress the trained prot2prot models
wget durrantlab.com/prot2prot/prot2prot_models.zip
unzip prot2prot_models.zip
rm prot2prot_models.zip

# You can now use the CLI using the render_*.js files
ls render_*js

# For help, use the -h flag like this:
node render_still.js -h

# See ./tests.sh for examples of use
./tests.sh

```
