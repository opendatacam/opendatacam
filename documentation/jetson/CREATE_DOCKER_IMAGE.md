## How to create / update a docker image for a jetson device

In order to build the docker image, you need to have:

- The same Opencv version on host device than the one you will include in docker (for darknet compilation)
- Compiled darknet on host device
- Build docker image on the same architecture as the target device that will use the docker image. (ie: build docker image for Jetson TX2 on a Jetson TX2)

*A docker image for TX2 would work on Xavier but wouldn't have the best performance possible, that is why we need several docker image for each architecture ([More on this](http://arnon.dk/matching-sm-architectures-arch-and-gencode-for-various-nvidia-cards/))*

### 1. Install Opencv 4.1.1:

This comes pre-installed with Jetpack 4.3+

### 2. Compile Darknet:

Follow the ["2. Install Darknet (Neural network framework running YOLO)"](../USE_WITHOUT_DOCKER.md) 

### 3. Create the docker image

```bash
# Create a docker folder to gather all dependencies
mkdir docker
cd docker

# Copy previously compiled darknet in docker folder
cp -R <pathtodarknet> .

# Download the Dockerfile
wget https://raw.githubusercontent.com/opendatacam/opendatacam/development/docker/run-jetson/Dockerfile

# Download a script to include in the docker container
wget https://raw.githubusercontent.com/opendatacam/opendatacam/development/docker/run-jetson/docker-start-mongo-and-opendatacam.sh

# Build image
sudo docker build -t opendatacam .

# If you are building a second time, use this to pull the latest opendatacam code
# TODO change this by adding the tag of the version in the Dockerfile
# Technique to rebuild the docker file from here : https://stackoverflow.com/a/49831094/1228937
# Build using date > marker && docker build .
date > marker && sudo docker build -t opendatacam .
```

### 4. Try the docker image

```bash
# Optional download demo video
mkdir opendatacam_videos
cd opendatacam_videos
wget https://github.com/opendatacam/opendatacam/raw/master/public/static/demo/demo.mp4
cd ..

# Download config.json file
wget -N https://raw.githubusercontent.com/opendatacam/opendatacam/development/config.json

# Edit with the parameters you want to use, for example using a raspberrycam with jetson nano
"PATH_TO_YOLO_DARKNET" : "/var/local/darknet",
"VIDEO_INPUT": "raspberrycam",
"NEURAL_NETWORK": "yolov3-tiny",

# Get the darknet-docker script
wget -N https://raw.githubusercontent.com/opendatacam/opendatacam/development/docker/run-jetson/run-docker.sh

# Chmod to give exec permissions
chmod 777 run-docker.sh

# Run image interactively mounting config.json and video directory
sudo ./run-docker.sh run --rm -it opendatacam

# Open browser at http://<IP of Jetson>:8080
```

### 5. Publish the docker image

```bash
# Log into the Docker Hub
sudo docker login --username=opendatacam
# Check the image ID using
sudo docker images
# You will see something like:
# REPOSITORY              TAG       IMAGE ID         CREATED           SIZE
# opendatacam             latest    023ab91c6291     3 minutes ago     1.975 GB

# Tag your image
sudo docker tag <IMAGEID> opendatacam/opendatacam:v3.0.0-beta.2-nano

# Or for tx2 : opendatacam/opendatacam:v3.0.0-beta.2-tx2
# Or for xavier : opendatacam/opendatacam:v3.0.0-beta.2-xavier

# Push image
sudo docker push opendatacam/opendatacam:v3.0.0-beta.2-nano


# (optional) Useful Untag image (if you made a tipo)
sudo docker rmi opendatacam/opendatacam:v3.0.0-beta.2-nano
```