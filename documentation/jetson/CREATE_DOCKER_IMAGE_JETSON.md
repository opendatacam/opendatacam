## How to create / update a docker image for a Jetson device

**Important:** These instructions are for creating your own OpenDataCam image/fork.
Official releases must use the workflow described in the [development notes](../DEVELOPMENT_NOTES.md).

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

# Download the weights you want to include ( currently yolov4-tiny for Nano and yolov4 for xavier )
# Nano
wget https://github.com/AlexeyAB/darknet/releases/download/darknet_yolo_v4_pre/yolov4-tiny.weights
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
cd opendatacam/docker/run/xavier
# copy config.json and edit with the parameters you need
cp ../../../config.json .
# change
# PATH_TO_YOLO_DARKNET=/var/local/darknet
# VIDEO_INPUTS_PARAMS=file
# NEURAL_NETWORK=yolov4 (xavier) | yolov4-tiny (nano)

# Tag the local image
sudo docker tag <IMAGEID> <your dockerhub username>/opendatacam:<version>-<platform, e.g. nano or xavier>
# Spin containers
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
sudo docker tag <IMAGEID> <your dockerhub username>/opendatacam:<version>-<platform, e.g. nano or xavier>

# Push image
sudo docker push <your dockerhub username>/opendatacam:<version>-<platform, e.g. nano or xavier>

# (optional) Useful Untag image (if you made a tipo)
sudo docker rmi <your dockerhub username>/opendatacam:<version>-<platform, e.g. nano or xavier>
```


### Note about Darknet Makefile differences for docker build

Change:

```Makefile
NVCC=nvcc
# to
NVCC=/usr/local/cuda-10.0/bin/nvcc
```

Change:

```Makefile
COMMON+= -DGPU -I/usr/local/cuda/include/
# to
COMMON+= -DGPU -I/usr/local/cuda-10.0/include/
```
Change:

```Makefile
LDFLAGS+= -L/usr/local/cuda/lib -lcuda -lcudart -lcublas -lcurand
# to
LDFLAGS+= -L/usr/local/cuda-10.0/lib -lcuda -lcudart -lcublas -lcurand
```
Change:

```Makefile
LDFLAGS+= -L/usr/local/cuda/lib64 -lcuda -lcudart -lcublas -lcurand
# to
LDFLAGS+= -L/usr/local/cuda-10.0/lib64 -lcuda -lcudart -lcublas -lcurand
```

Change:

```Makefile
CFLAGS+= -DCUDNN -I/usr/local/cuda/include
LDFLAGS+= -L/usr/local/cuda/lib -lcudnn
# to
CFLAGS+= -DCUDNN -I/usr/local/cuda-10.0/include
LDFLAGS+= -L/usr/local/cuda-10.0/lib -lcudnn
```

Change:

```Makefile
CFLAGS+= -DCUDNN -I/usr/local/cudnn/include
LDFLAGS+= -L/usr/local/cudnn/lib64 -lcudnn
# to
CFLAGS+= -DCUDNN -I/usr/local/cuda-10.0/include
LDFLAGS+= -L/usr/local/cuda-10.0/lib64 -lcudnn
```
