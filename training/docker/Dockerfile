FROM nvidia/cuda:11.4.2-cudnn8-runtime-ubuntu20.04
# FROM nvidia/cuda:11.4.2-base-ubuntu20.04
# FROM nvidia/cuda:10.1-base
  
RUN apt update && apt install -y wget unzip curl bzip2 git
RUN curl -LO http://repo.continuum.io/miniconda/Miniconda3-latest-Linux-x86_64.sh
RUN bash Miniconda3-latest-Linux-x86_64.sh -p /miniconda -b
RUN rm Miniconda3-latest-Linux-x86_64.sh
ENV PATH=/miniconda/bin:${PATH}
RUN conda update -y conda

#RUN conda install -y pytorch torchvision -c pytorch -c nvidia
RUN conda install -y pytorch torchvision torchaudio cudatoolkit=11.1 -c pytorch -c nvidia

RUN conda install -y pip
RUN python3 -m pip install --upgrade pip

RUN mkdir /workspace/ && cd /workspace/ && git clone https://github.com/junyanz/pytorch-CycleGAN-and-pix2pix.git && cd pytorch-CycleGAN-and-pix2pix && python3 -m pip install -r requirements.txt

RUN apt-get update && \
    apt-get -y install sudo
RUN apt-get -y install vim
RUN mkdir /.local
RUN python3 -m pip install tensorflowjs[wizard]
RUN python3 -m pip install wandb
RUN python3 -m pip install onnx-tf

WORKDIR /mnt
