export reso=${1}
clear

basename $(ls -th pytorch-CycleGAN-and-pix2pix/checkpoints/prot_render_${reso}/web/images/* | head -n 1)
echo ""

ls -th pytorch-CycleGAN-and-pix2pix/checkpoints/prot_render_${reso}/web/images/* | head -n 3 | sort | awk '{print "kitty +kitten icat " $1}' > t
. t
rm t
