## How to use opendatacam without docker

- [1. Install OpenCV 3.4.3 with Gstreamer:](#1-install-opencv-343-with-gstreamer-)
- [2. Install Darknet (Neural network framework running YOLO)](#2-install-darknet--neural-network-framework-running-yolo-)
  * [Get the source files](#get-the-source-files)
  * [Modify the Makefile before compiling](#modify-the-makefile-before-compiling)
  * [Compile darknet](#compile-darknet)
  * [Download weight file](#download-weight-file)
  * [(Optional) Test darknet](#-optional--test-darknet)
- [3. Install node.js, mongodb](#3-install-nodejs--mongodb)
- [4. Install opendatacam](#4-install-opendatacam)

### 1. Install OpenCV 3.4.3 with Gstreamer:

You can either:

- Use pre-built binaries for your host device (see links below)
- Compile your own (see [how to compile](jetson/CREATE_DOCKER_IMAGE.md#-(Optional)-Compile-Opencv-on-jetson-(this-takes-1-2h))) 

Then follow this to install it:

```bash
# Remove all old opencv stuffs installed by JetPack
sudo apt-get purge libopencv*

# Download .deb files

# For Jetson Nano:
wget https://github.com/opendatacam/opencv-builds/raw/master/opencv-nano-3.4.3/OpenCV-3.4.3-aarch64-libs.deb
wget https://github.com/opendatacam/opencv-builds/raw/master/opencv-nano-3.4.3/OpenCV-3.4.3-aarch64-dev.deb
wget https://github.com/opendatacam/opencv-builds/raw/master/opencv-nano-3.4.3/OpenCV-3.4.3-aarch64-python.deb

# For Jetson TX2
wget https://github.com/opendatacam/opencv-builds/raw/master/opencv-tx2-3.4.3/OpenCV-3.4.3-aarch64-libs.deb
wget https://github.com/opendatacam/opencv-builds/raw/master/opencv-tx2-3.4.3/OpenCV-3.4.3-aarch64-dev.deb
wget https://github.com/opendatacam/opencv-builds/raw/master/opencv-tx2-3.4.3/OpenCV-3.4.3-aarch64-python.deb

# For Jetson Xavier
# TODO compile binaries specific for xavier architecture

# For Generic cuda machine (docker-nvidia)
# TODO compile binaries, see section below

# Install .deb files
sudo dpkg -i OpenCV-3.4.3-aarch64-libs.deb
sudo apt-get install -f
sudo dpkg -i OpenCV-3.4.3-aarch64-dev.deb
sudo dpkg -i OpenCV-3.4.3-aarch64-python.deb

# Verify opencv version
pkg-config --modversion opencv
```

### 2. Install Darknet (Neural network framework running YOLO)

#### Get the source files

```bash
#NB: the only change from https://github.com/alexeyab/darknet is : https://github.com/opendatacam/darknet/pull/1/files

git clone --depth 1 -b opendatacam https://github.com/opendatacam/darknet
```

#### Modify the Makefile before compiling

Open the `Makefile` in the darknet folder and make these changes:

*For Jetson Nano*

```Makefile
# Set these variable to 1:
GPU=1
CUDNN=1
OPENCV=1

# Uncomment the following line
# For Jetson TX1, Tegra X1, DRIVE CX, DRIVE PX - uncomment:
ARCH= -gencode arch=compute_53,code=[sm_53,compute_53]
```

*For Jetson TX2*

```Makefile
# Set these variable to 1:
GPU=1
CUDNN=1
OPENCV=1

# Uncomment the following line
# For Jetson Tx2 or Drive-PX2 uncomment
ARCH= -gencode arch=compute_62,code=[sm_62,compute_62]
```

*For Jetson Xavier*

```Makefile
# Set these variable to 1:
GPU=1
CUDNN=1
CUDNN_HALF=1
OPENCV=1

# Uncomment the following line
# Jetson XAVIER
ARCH= -gencode arch=compute_72,code=[sm_72,compute_72]
```

*For Generic Ubuntu machine with CUDA GPU*

Make sure you have CUDA installed:

```
# Type this command
nvcc --version

# If it returns Command 'nvcc' not found , you need to install cuda properly: https://docs.nvidia.com/cuda/cuda-installation-guide-linux/index.html#package-manager-installation and also add cuda to your PATH with the post install instructions: https://docs.nvidia.com/cuda/cuda-installation-guide-linux/index.html#post-installation-actions
```


Make change to Makefile:

```Makefile
# Set these variable to 1:
GPU=1
OPENCV=1
```

#### Compile darknet

```bash
# Go to darknet folder
cd darknet 
# Optional: put jetson in performance mode to speed up things
sudo nvpmodel -m 0
sudo jetson_clocks
# Compile
make
```

If you have an error "nvcc not found" on Jetson update path to NVCC in Makefile

```
NVCC=/usr/local/cuda/bin/nvcc
```

#### Download weight file

The .weights files that need to be in the root of the `/darknet` folder

```bash
cd darknet #if you are not already in the darknet folder

# YOLOv2-VOC
wget https://pjreddie.com/media/files/yolo-voc.weights --no-check-certificate
# YOLOv3-tiny
wget https://pjreddie.com/media/files/yolov3-tiny.weights --no-check-certificate
# YOLOv3
wget https://pjreddie.com/media/files/yolov3.weights --no-check-certificate
```

#### (Optional) Test darknet

```bash
# Go to darknet folder
cd darknet 
# Run darknet (yolo) on webcam
./darknet detector demo cfg/voc.data cfg/yolo-voc.cfg yolo-voc.weights "v4l2src ! video/x-raw, framerate=30/1, width=640, height=360 ! videoconvert ! appsink" -ext_output -dont_show

# Run darknet on file
./darknet detector demo cfg/voc.data cfg/yolo-voc.cfg yolo-voc.weights opendatacam_videos/demo.mp4 -ext_output -dont_show
```

### 3. Install node.js, mongodb

```bash
# Install node.js
sudo apt-get install curl
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Mongodb for Jetson devices (ARM64):

```bash
# Install mongodb

# Detailed doc: https://computingforgeeks.com/how-to-install-latest-mongodb-on-ubuntu-18-04-ubuntu-16-04/
# NB: at time of writing this guide, we install the mongodb package for ubuntu 16.04 as the arm64 version of it isn't available for 18.04
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 9DA31620334BD75D9DCB49F368818C72E52529D4
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/4.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.0.list
sudo apt-get update
sudo apt-get install -y openssl libcurl3 mongodb-org

# Start service
sudo systemctl start mongod

# Enable service on boot
sudo systemctl enable mongod
```

#### Mongodb for Generic Ubuntu machine with CUDA GPU:

```bash
# Install mongodb

# Detailed doc: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 9DA31620334BD75D9DCB49F368818C72E52529D4 && \
    echo "deb [ arch=amd64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/4.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-4.0.list
sudo apt-get update && apt-get install -y --no-install-recommends openssl libcurl3 mongodb-org

# Start service
sudo systemctl start mongod

# Enable service on boot
sudo systemctl enable mongod
```

### 4. Install opendatacam

- Download source

```bash
git clone --depth 1 https://github.com/opendatacam/opendatacam.git
cd opendatacam
```

- Specify **ABSOLUTE** `PATH_TO_YOLO_DARKNET` path in `opendatacam/config.json`

```json
{
  "PATH_TO_YOLO_DARKNET" : "/home/nvidia/darknet"
}
```

```bash
# To get the absolute path, go the darknet folder and type
pwd .
```

- Specify `VIDEO_INPUT` and `NEURAL_NETWORK` in `opendatacam/config.json` 

*For Jetson Nano (recommanded)*

```json
{
  "VIDEO_INPUT": "usbcam",
  "NEURAL_NETWORK": "yolov3-tiny"
}
```

*For Jetson TX2 (recommanded)*

```json
{
  "VIDEO_INPUT": "usbcam",
  "NEURAL_NETWORK": "yolov2-voc"
}
```

*For Jetson Xavier (recommanded)*

```json
{
  "VIDEO_INPUT": "usbcam",
  "NEURAL_NETWORK": "yolov3"
}
```

Learn more in the [config documentation](CONFIG.md) page.

- Install **OpenDataCam**

```bash
cd <path/to/open-data-cam>
npm install
npm run build
```

- Run **OpenDataCam**

```bash
cd <path/to/open-data-cam>
npm run start
```

- (optional) Config **OpenDataCam** to run on boot

```bash
# install pm2
npm install pm2 -g |

# go to opendatacam folder
cd <path/to/open-data-cam>
# launch pm2 at startup
# this command gives you instructions to configure pm2 to
# start at ubuntu startup, follow them
sudo pm2 startup

# Once pm2 is configured to start at startup
# Configure pm2 to start the Open Traffic Cam app
sudo pm2 start npm --name "opendatacam" -- start
sudo pm2 save
```

- (optional) Open ports 8080 8090 and 8070 to outside world on cloud deployment machine

```
sudo ufw allow 8080
sudo ufw allow 8090
sudo ufw allow 8070
```

### (Optional) How to compile Opencv with Gstreamer support on desktop

```bash
sudo apt-get install -y libgstreamer1.0-0 gstreamer1.0-plugins-base gstreamer1.0-plugins-good gstreamer1.0-plugins-bad gstreamer1.0-plugins-ugly gstreamer1.0-libav gstreamer1.0-doc gstreamer1.0-tools libgstreamer1.0-dev libgstreamer-plugins-base1.0-dev

sudo apt-get install -y  pkg-config zlib1g-dev libwebp-dev libtbb2 libtbb-dev libgtk2.0-dev pkg-config libavcodec-dev libavformat-dev libswscale-dev cmake libv4l-dev

sudo apt-get install -y autoconf autotools-dev build-essential gcc git

sudo apt-get install -y ffmpeg

git clone --depth 1 -b 3.3.1 https://github.com/opencv/opencv.git

cd opencv
mkdir build
cd build
# Note here you need to set both FFMPEG and GSTREAMER to ON
# Running this command should output a summary of which dependencies are gonna be build with opencv
# Double check that both gstreamer and ffmpeg are ON
cmake -D CMAKE_INSTALL_PREFIX=/usr/local CMAKE_BUILD_TYPE=Release -D WITH_GSTREAMER=ON -D WITH_GSTREAMER_0_10=OFF -D WITH_CUDA=OFF -D WITH_TBB=ON -D WITH_LIBV4L=ON WITH_FFMPEG=ON .. 

sudo make install

#reload if opencv already installed
sudo /bin/bash -c 'echo "/usr/local/lib" >> /etc/ld.so.conf.d/opencv.conf'
sudo ldconfig
```