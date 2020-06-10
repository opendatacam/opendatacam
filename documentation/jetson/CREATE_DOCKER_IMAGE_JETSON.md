## How to create / update a docker image for a Jetson device

### 1 Hardware pre-requisite

In order to build the docker image, you need to build the docker image on the same architecture as the target device that will use the docker image. (ie: build docker image for Jetson Xavier on a Jetson Xavier)

*A docker image for TX2 would work on Xavier but wouldn't have the best performance possible, that is why we need several docker image for each architecture ([More on this](http://arnon.dk/matching-sm-architectures-arch-and-gencode-for-various-nvidia-cards/))*

### 2. Create the docker image

```bash
# Go to the opendatacam build directory for you platform (xavier or nano)
# Nano
cd opendatacam/docker/build/nano
# Xavier
cd opendatacam/docker/build/xavier

# Download the weights you want to include ( currently yolov3-tiny-prn for Nano and yolov4 for xavier )
# Nano
go to https://drive.google.com/file/d/18yYZWyKbo4XSDVyztmsEcF9B_6bxrhUY/view (or https://github.com/AlexeyAB/darknet#pre-trained-models)
and download yolov3-tiny-prn.weights
# Xavier
wget https://github.com/AlexeyAB/darknet/releases/download/darknet_yolo_v3_optimal/yolov4.weights

# Build
sudo docker build -t opendatacam .

# If you are building a second time, use this to pull the latest opendatacam code
# TODO change this by adding the tag of the version in the Dockerfile
# Technique to rebuild the docker file from here : https://stackoverflow.com/a/49831094/1228937
# Build using date > marker && docker build .
date > marker && sudo docker build -t opendatacam .

# Test the image with docker-compose
# nano
cd opendatacam/docker/run/nano
# xavier
cd opendatacam/docker/run/nano
# copy config.json and edit with the parameters you need
cp ../../../config.json .
# change
# PATH_TO_YOLO_DARKNET=/var/local/darknet
# VIDEO_INPUTS_PARAMS=file
# NEURAL_NETWORK=yolov4 (xavier) | yolov3-tiny-prn (nano)
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
sudo docker tag <IMAGEID> opendatacam/opendatacam:v3.0.0-beta.3-nano

# Or for xavier : opendatacam/opendatacam:v3.0.0-beta.3-xavier

# Push image
sudo docker push opendatacam/opendatacam:v3.0.0-beta.3-nano

# (optional) Useful Untag image (if you made a tipo)
sudo docker rmi opendatacam/opendatacam:v3.0.0-beta.3-nano
```