## How to create / update a docker image for a desktop machine

**Important:** These instructions are for creating your own OpenDataCam image/fork.
Official releases must use the workflow described in the [development notes](DEVELOPMENT_NOTES.md).

### 1. Pre-requisite

#### 1.1 Hardware pre-requisite

- An Ubuntu computer/server with a Nvidia CUDA GPU : https://developer.nvidia.com/cuda-gpus

#### 1.2 Software pre-requisite

- [Docker installed](https://docs.docker.com/install/linux/docker-ce/ubuntu/)
- [Docker compose installed](https://docs.docker.com/compose/install/)
- [Nvidia drivers installed](https://developer.nvidia.com/cuda-downloads) (you don't need all CUDA but we didn't found a easy install process for only the drivers)
- [Nvidia Container toolkit installed](https://github.com/NVIDIA/nvidia-docker)

### 2. Build the image

```bash
# Go to the docker/build/desktop directory
cd opendatacam/docker/build/desktop
# Download the weights you want to include ( currently yolov4 )
wget https://github.com/AlexeyAB/darknet/releases/download/darknet_yolo_v3_optimal/yolov4.weights
# Build
sudo docker build -t opendatacam .

# If you are building a second time, use this to pull the latest opendatacam code
# TODO change this by adding the tag of the version in the Dockerfile
# Technique to rebuild the docker file from here : https://stackoverflow.com/a/49831094/1228937
# Build using date > marker && docker build .
date > marker && sudo docker build -t opendatacam .

# Test the image with docker-compose
cd opendatacam/docker/run/desktop
# copy config.json and edit with the parameters you need
cp ../../../config.json .
# change
# PATH_TO_YOLO_DARKNET=/var/local/darknet
# VIDEO_INPUTS_PARAMS=file
# NEURAL_NETWORK=yolov4

#tag the local image
sudo docker tag <IMAGEID> <your dockerhub username>/opendatacam:<version>-desktop

# start containers
sudo docker-compose up
```

### 3. Publish the docker image

```bash
# Log into the Docker Hub
sudo docker login --username=opendatacam
# Check the image ID using
sudo docker images
# You will see something like:
# REPOSITORY              TAG       IMAGE ID         CREATED           SIZE
# opendatacam             latest    023ab91c6291     3 minutes ago     1.975 GB

# Tag your image
sudo docker tag <IMAGEID> <your dockerhub username>/opendatacam:<version>-desktop

# Untag image (if you made a tipo)
sudo docker rmi <IMAGEID> <your dockerhub username>/opendatacam:<version>-desktop

# Push image
sudo docker push <IMAGEID> <your dockerhub username>/opendatacam:<version>-desktop
```