## How to create / update the docker image

In order to build the docker image, you need to have:

- The same Opencv version on host device than the one you will include in docker (for darknet compilation)
- Compiled darknet on host device
- Build docker image on the same architecture as the target device that will use the docker image. (ie: build docker image for Jetson TX2 on a Jetson TX2)


*A docker image for TX2 would work on Xavier but wouldn't have the best performance possible, that is why we need several docker image for each architecture ([More on this](http://arnon.dk/matching-sm-architectures-arch-and-gencode-for-various-nvidia-cards/))*

### 1. Install Opencv 3.4.3:

TODO link RUN_WITHOUT_DOCKER.md

- Follow the "1. Install OpenCV 3.4.3 with Gstreamer"

### 2. Compile Darknet with Opencv 3.4.3:

TODO link RUN_WITHOUT_DOCKER.md

- Follow the "2. Install Darknet (Neural network framework running YOLO)" 

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

# For Jetson TX2:
wget https://filedn.com/lkrqWbAQYllSVUK4ip6g3m0/opencv-tx2-3.4.3/opencv-3.4.3.tar.gz

# For Jetson Xavier:
# TODO

# Download the Dockerfile
wget https://raw.githubusercontent.com/moovel/lab-opendatacam/v2/docker/run-jetson/Dockerfile

# Download a script to include in the docker container
wget https://raw.githubusercontent.com/moovel/lab-opendatacam/v2/docker/run-jetson/docker-start-mongo-and-opendatacam.sh

# Build image
sudo docker build -t opendatacam .
```

### 4. Try the docker image

```bash
# Get the darknet-docker script (TODO @tdurand remove v2 when releasing)
wget https://raw.githubusercontent.com/moovel/lab-opendatacam/v2/docker/run-jetson/darknet-docker.sh

# Chmod to give exec permissions
chmod 777 darknet-docker.sh

# Run image interactively while giving access to CUDA stuff
sudo ./darknet-docker.sh run --rm -it opendatacam

# Open browser at http://<IP of Jetson>:8080
```

### 5. Publish the docker image

```bash
# Log into the Docker Hub
sudo docker login --username=yourhubusername
# Check the image ID using
sudo docker images
# You will see something like:
# REPOSITORY              TAG       IMAGE ID         CREATED           SIZE
# opendatacam             latest    023ab91c6291     3 minutes ago     1.975 GB

# Tag your image
sudo docker tag 023ab91c6291 yourhubusername/opendatacam:v2.0.1

# Push image
sudo docker push yourhubusername/opendatacam
```

### (Optional) Compile Opencv on jetson (this takes 1h+)

*Compile*

Need this because darknet needs to be compiled with the same version as the one running inside the docker file

```bash
# Optional: put jetson in high performance mode to speed up things
sudo nvpmodel -m 0
sudo jetson_clocks

# Clone https://github.com/jetsonhacks/buildOpenCVXavier 
# Same repo for xavier or tx2 since jetpack 4.2
git clone https://github.com/jetsonhacks/buildOpenCVXavier
cd buildOpenCVXavier

# Edit the ARCH_BIN variable
vi buildAndPackageOpenCV.sh
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
# TODO @tdurand FINISH THIS PART

# Create the opencv compiled tar package

# Go to opencv/build
cd ~/opencv/build

# Untar
TODO

# Move to directory untar
cp OpenCV

# Tar the content in opencv-3.4.3.tar.gz
tar -czvf opencv-3.4.3.tar.gz .
```