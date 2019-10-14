## How to create / update a docker image for a jetson device

In order to build the docker image, you need to have:

- The same Opencv version on host device than the one you will include in docker (for darknet compilation)
- Compiled darknet on host device
- Build docker image on the same architecture as the target device that will use the docker image. (ie: build docker image for Jetson TX2 on a Jetson TX2)

*A docker image for TX2 would work on Xavier but wouldn't have the best performance possible, that is why we need several docker image for each architecture ([More on this](http://arnon.dk/matching-sm-architectures-arch-and-gencode-for-various-nvidia-cards/))*

### 1. Install Opencv 3.4.3:

- Follow the ["1. Install OpenCV 3.4.3 with Gstreamer"](../USE_WITHOUT_DOCKER.md)

### 2. Compile Darknet with Opencv 3.4.3:

- Follow the ["2. Install Darknet (Neural network framework running YOLO)"](../USE_WITHOUT_DOCKER.md) 

### 3. Create the docker image

```bash
# Create a docker folder to gather all dependencies
mkdir docker
cd docker

# Copy previously compiled darknet in docker folder
cp -R <pathtodarknet> .

# Download opencv-3.4.3.tar.gz
# This is the pre-installed version of opencv to include in the docker container
# If you compiled Opencv yourself, you'll find how to create the tar file in the section explaning how to compile opencv

# For Jetson Nano:
wget https://github.com/opendatacam/opencv-builds/raw/master/opencv-nano-3.4.3/opencv-3.4.3.tar.gz

# For Jetson TX2:
wget https://github.com/opendatacam/opencv-builds/raw/master/opencv-tx2-3.4.3/opencv-3.4.3.tar.gz

# For Jetson Xavier:
wget https://github.com/opendatacam/opencv-builds/raw/master/opencv-xavier-3.4.3/opencv-3.4.3.tar.gz

# Download the Dockerfile
wget https://raw.githubusercontent.com/opendatacam/opendatacam/master/docker/run-jetson/Dockerfile

# Download a script to include in the docker container
wget https://raw.githubusercontent.com/opendatacam/opendatacam/master/docker/run-jetson/docker-start-mongo-and-opendatacam.sh

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
# Get the darknet-docker script
wget -N https://raw.githubusercontent.com/opendatacam/opendatacam/master/docker/run-jetson/run-docker.sh

# Chmod to give exec permissions
chmod 777 run-docker.sh

# Run image interactively while giving access to CUDA stuff
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
sudo docker tag <IMAGEID> opendatacam/opendatacam:v2.1.0-nano

# Or for tx2 : opendatacam/opendatacam:v2.1.0-tx2
# Or for xavier : opendatacam/opendatacam:v2.1.0-xavier

# Push image
sudo docker push opendatacam/opendatacam:v2.1.0-nano


# (optional) Useful Untag image (if you made a tipo)
sudo docker rmi opendatacam/opendatacam:v2.1.0-nano
```

### (Optional) Compile Opencv on jetson (this takes 1-2h)

*Compile*

Need this because darknet needs to be compiled with the same version as the one running inside the docker file

```bash
# Optional: put jetson in high performance mode to speed up things
sudo nvpmodel -m 0
sudo jetson_clocks

# For jetson nano, adding a swap partition of 6GB is essential
# Follow this article https://www.jetsonhacks.com/2019/04/14/jetson-nano-use-more-memory/

# Clone https://github.com/jetsonhacks/buildOpenCVXavier 
# Same repo for xavier or tx2 or nano since jetpack 4.2
# For jetson nano there is missing dependency, here is the fixed repo: https://github.com/tdurand/buildOpenCVXavier/pull/1/files
git clone https://github.com/jetsonhacks/buildOpenCVXavier
cd buildOpenCVXavier

# Edit the ARCH_BIN variable
vi buildAndPackageOpenCV.sh
# Set ARCH_BIN=5.3 in buildAndPackageOpenCV.sh for Jetson Nano
# Set ARCH_BIN=6.2 in buildAndPackageOpenCV.sh for Jetson TX2
# Set ARCH_BIN=7.2 in buildAndPackageOpenCV.sh for Jetson Xavier


# Specify the right ARCH_BIN makes runtime faster: http://arnon.dk/matching-sm-architectures-arch-and-gencode-for-various-nvidia-cards/

# Then run the build command, on TX2 it takes more than 1 hour
./buildAndPackageOpenCV.sh

# The binary files will be in ~/opencv/build
cd ~/opencv/build
```

There is one extra step to do to prepare the opencv-3.4.3.tar.gz file to include in the docker container. The one built before nests a folder inside and we want to remove it

```bash
# Create the opencv compiled tar package

# Go to opencv/build
cd ~/opencv/build

# Untar the default OpenCV-3.4.3-aarch64.tar.gz
tar -xvzf OpenCV-3.4.3-aarch64.tar.gz

# Move to directory untar
cd OpenCV-3.4.3-aarch64

# Tar the content in opencv-3.4.3.tar.gz
tar -czvf opencv-3.4.3.tar.gz .

# The result opencv-3.4.3.tar.gz is the archive you need to include in the docker image to install opencv
```


