export reso=${1}

cd pytorch-CycleGAN-and-pix2pix

#python train.py --display_id 0 --dataroot ../imgs/size_${reso}_full/ --name prot_render_${reso} --model pix2pix --load_size ${reso} --crop_size ${reso} --n_epochs 200 --n_epochs_decay 800

# Using --norm instance based on this: https://github.com/junyanz/pytorch-CycleGAN-and-pix2pix/issues/1276

export loadsize=`python -c "print(round(${reso}*286/256.0))"`

python train.py --no_flip --norm instance --display_id 0 --dataroot ../imgs/size_${reso}_full/ --name prot_render_${reso} --model pix2pix --load_size ${loadsize} --crop_size ${reso} --preprocess resize_and_crop --n_epochs 1000 --n_epochs_decay 1000 --netG unet_128 # | tee pytorch-CycleGAN-and-pix2pix/checkpoints/prot_render_${reso}_output.txt

# --continue_train 
