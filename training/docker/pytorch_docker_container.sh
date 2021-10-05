echo Be sure to specify path via parameter.

sudo docker build -t jdurrant/pytorch . 

sudo docker run --gpus all --ipc=host -it --rm -v $(realpath ${1}):/mnt jdurrant/pytorch
