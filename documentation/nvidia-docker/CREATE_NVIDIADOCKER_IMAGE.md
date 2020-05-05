## How to create / update a docker image for a nvidia-docker machine

### 1. Pre-requisite 

- [Nvidia Container toolkit installed](INSTALL_NVIDIADOCKER.md)

### 2. Build the image

```bash
# Go to an empty folder
mkdir docker
cd docker
# get the docker file
wget https://raw.githubusercontent.com/opendatacam/opendatacam/development/docker/run-nvidia-docker/Dockerfile
# Build
# Takes a really long time the first time as it compiles opencv
sudo docker build -t opendatacam .

# If you are building a second time, use this to pull the latest opendatacam code
# TODO change this by adding the tag of the version in the Dockerfile
# Technique to rebuild the docker file from here : https://stackoverflow.com/a/49831094/1228937
# Build using date > marker && docker build .
date > marker && sudo docker build -t opendatacam .

# Test the image in interactive mode
sudo docker run --gpus=all -p 8080:8080 -p 8090:8090 -p 8070:8070 -v /data/db:/data/db --rm -it opendatacam
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
sudo docker tag 7ef920844953 opendatacam/opendatacam:v3.0.0-beta.2-nvidiadocker

# Untag image (if you made a tipo)
sudo docker rmi opendatacam/opendatacam:v3.0.0-beta.2-nvidiadocker

# Push image
sudo docker push opendatacam/opendatacam:v3.0.0-beta.2-nvidiadocker
```


### NOTE: Known Improvements to make

For now the docker image is very large (12GB), need to try use the lightweight runtime of nvidia/cuda to have a build part and a run part

Links:

- [https://github.com/TakuroFukamizu/nvidia-docker-darknet/blob/master/Dockerfile](https://github.com/TakuroFukamizu/nvidia-docker-darknet/blob/master/Dockerfile)
- [https://medium.com/techlogs/compiling-opencv-for-cuda-for-yolo-and-other-cnn-libraries-9ce427c00ff8](https://medium.com/techlogs/compiling-opencv-for-cuda-for-yolo-and-other-cnn-libraries-9ce427c00ff8)