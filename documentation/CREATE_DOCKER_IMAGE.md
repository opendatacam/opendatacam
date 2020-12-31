## How to create / update a Docker Image

Opendatacam provides Docker images for the last release as well as automatic developer previews through [Opendatacam's Docker Hub](https://hub.docker.com/r/opendatacam/opendatacam).

This document explains the generic steps to create the Docker images for

- Desktop
- Xavier
- Nano

platforms.

### 1. Build environment

In order to build the docker images you can either build them natively if you have access to the required Hardware (e.g. a Jetson Nano device), or you can use [Docker Buildx](https://docs.docker.com/buildx/working-with-buildx/) for cross platform builds.

The build environment should have the following software installed:

- [Docker installed](https://docs.docker.com/install/linux/docker-ce/ubuntu/)
- [Docker compose installed](https://docs.docker.com/compose/install/)
- [Nvidia drivers installed](https://developer.nvidia.com/cuda-downloads) (you don't need all CUDA but we didn't found a easy install process for only the drivers)
- [Nvidia Container toolkit installed](https://github.com/NVIDIA/nvidia-docker)
- [Opendatacam Source Code](https://github.com/opendatacam/opendatacam)

### 2. Build the image

The following steps assume a native build.
If you are using [Docker Buildx](https://docs.docker.com/buildx/working-with-buildx/) to do Multi- or Cross-Platform builds please read the Buildx documentation for the correct commands.

In the exmaple below the following placeholder have been used

- `OPENDATACAM_PLATFORM` either nano, xavier or desktop
- `IMAGE_ID` the ID of the generated docker image
- `DOCKERHUB_USERNAME` your Docker Hub username to tag the image

```bash
# Get the Opendatacam source code if you don't have it already
git clone git@github.com:opendatacam/opendatacam.git

# Go to the Opendatacam repository root
cd opendatacam

# Download the weights for your platform
# Nano
wget https://github.com/AlexeyAB/darknet/releases/download/darknet_yolo_v4_pre/yolov4-tiny.weights
# Desktop and Xavier
wget https://github.com/AlexeyAB/darknet/releases/download/darknet_yolo_v3_optimal/yolov4.weights

# Build the docker image
docker build --file docker/<OPENDATACAM_PLATFORM> -t opendatacam .

# Optional: Tag the local image
sudo docker tag <IMAGE_ID> <DOCKERHUB_USERNAME>/opendatacam:local-<OPENDATACAM_PLATFORM>
```

#### 2.1. Test The Image (Optional)

Edit your `docker-compose.yml` file to use the `<DOCKERHUB_USERNAME>/opendatacam:latest-<OPENDATACAM_PLATFORM>` image.
E.g.

```yaml
services:
  opendatacam:
    image: <DOCKERHUB_USERNAME>/opendatacam:latest-<OPENDATACAM_PLATFORM>
```

#### 2.2. Publish the Docker image (Optional)

```bash
# Log into the Docker Hub
docker login --username=<DOCKERHUB_USERNAME>

# Check the image ID
#
# You should see something like:
#
# REPOSITORY              TAG       IMAGE ID         CREATED           SIZE
# opendatacam             latest    023ab91c6291     3 minutes ago     1.975 GB
docker images

# Tag your image if you have not yet done so
docker tag <IMAGE_ID> <DOCKERHUB_USERNAME>/opendatacam:latest-<OPENDATACAM_PLATFORM>

# Untag image (if you made a typo)
docker rmi <DOCKERHUB_USERNAME>/opendatacam:latest-<OPENDATACAM_PLATFORM>

# Push image
docker push <DOCKERHUB_USERNAME>/opendatacam:latest-<OPENDATACAM_PLATFORM>
```

### Appendix

#### Xavier and Nano: Note about Darknet Makefile differences for docker build

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
