## How to create / update a docker image for a nvidia-docker machine

### Note about CUDA_ARCH_BIN

Our Dockerfile is set for CUDA_ARCH_BIN=6.1 , if you GPU doesn't support this architecture, you need to build with another CUDA_ARCH_BIN version.

[Find out what is your CUDA Compute Capability depending on your GPU](https://developer.nvidia.com/cuda-gpus)

You 

### 1. Pre-requisite 

- [Nvidia-docker v2.0 installed](INSTALL_NVIDIADOCKER.md)

### 2. Build the image

```bash
# Go to an empty folder
mkdir docker
cd docker
# get the docker file : https://github.com/opendatacam/opendatacam/blob/master/docker/run-cloud/Dockerfile
wget https://raw.githubusercontent.com/opendatacam/opendatacam/v2/docker/run-cloud/Dockerfile
# Build
# Takes a really long time the first time as it compiles opencv
sudo docker build -t opendatacam .

# Test the image in interactive mode
sudo docker run --runtime=nvidia -p 8080:8080 -p 8090:8090 -p 8070:8070 -v /data/db:/data/db --rm -it opendatacam
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
sudo docker tag 7ef920844953 opendatacam/opendatacam:v2.0.0-beta.4-nvidiadocker-cuda-6.1

# Untag image (if you made a tipo)
sudo docker rmi opendatacam/opendatacam:v2.0.0-beta.4-nvidiadocker-cuda-6.1

# Push image
sudo docker push opendatacam/opendatacam:v2.0.0-beta.4-nvidiadocker-cuda-6.1
```

### NOTE: Known Improvements to make

For now the docker image is very large (12GB), need to try use the lightweight runtime of nvidia/cuda to have a build part and a run part

Would need to copy the opencv compiled file (maybe the deb as with the jetson), and the darknet compiled folder directly

Links:

- [https://github.com/TakuroFukamizu/nvidia-docker-darknet/blob/master/Dockerfile](https://github.com/TakuroFukamizu/nvidia-docker-darknet/blob/master/Dockerfile)
- [https://medium.com/techlogs/compiling-opencv-for-cuda-for-yolo-and-other-cnn-libraries-9ce427c00ff8](https://medium.com/techlogs/compiling-opencv-for-cuda-for-yolo-and-other-cnn-libraries-9ce427c00ff8)