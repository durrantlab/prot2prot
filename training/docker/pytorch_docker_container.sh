echo Be sure to specify path via parameter.

sudo docker build -t jdurrant/pytorch . 
#sudo docker run -u $(id -u):$(id -g) -p 7000-8000:7000-8000 -p 80:80 --gpus all --ipc=host -it --rm -v $(realpath ${1}):/mnt jdurrant/tensorflow
# nvcr.io/nvidia/pytorch:21.06-py3

# sudo docker run -u $(id -u):$(id -g) --gpus all --ipc=host -it --rm -v $(realpath ${1}):/mnt jdurrant/tensorflow

sudo docker run --gpus all --ipc=host -it --rm -v $(realpath ${1}):/mnt jdurrant/pytorch
