## How to use OpenDataCam v3 without docker

### 1. Install dependencies

**For Jetsons:** Flash jetson to jetpack 4.3+

https://developer.nvidia.com/embedded/jetpack

**For GNU/Linux x86_64 machine with a CUDA compatible GPU:** Install nvidia drivers and CUDA

https://docs.nvidia.com/cuda/cuda-installation-guide-linux/index.html

### 2. Install Darknet (Neural network framework running YOLO)

#### Get the source files

_NB: Make sure you reinstall darknet entirely if you were on ODC v2.x, for v3 the version has changed._

```bash
git clone --depth 1 -b odc https://github.com/opendatacam/darknet

#NB: the changes from https://github.com/alexeyab/darknet are documented here : https://github.com/opendatacam/darknet/pull/6
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

# Replace NVCC path
NVCC=/usr/local/cuda/bin/nvcc
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
CUDNN=1
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

# YOLOv4-tiny
wget https://github.com/AlexeyAB/darknet/releases/download/darknet_yolo_v4_pre/yolov4-tiny.weights --no-check-certificate
# YOLOv4
wget https://github.com/AlexeyAB/darknet/releases/download/darknet_yolo_v3_optimal/yolov4.weights --no-check-certificate
```

Or if you want to copy them over SSH from your main machine with scp

```
scp yolov4-tiny.weights nvidia@192.168.1.210:/home/nvidia/Documents/darknet
```

#### (Optional) Test darknet

```bash
# Go to darknet folder
cd darknet 
# Run darknet (yolo) on webcam
./darknet detector demo cfg/coco.data cfg/yolov4-tiny.cfg yolov4-tiny.weights "v4l2src ! video/x-raw, framerate=30/1, width=640, height=360 ! videoconvert ! appsink" -ext_output -dont_show

# Run darknet on file
./darknet detector demo cfg/coco.data cfg/yolov4-tiny.cfg yolov4-tiny.weights opendatacam_videos/demo.mp4 -ext_output -dont_show

# Run darknet on raspberrycam
./darknet detector demo cfg/coco.data cfg/yolov4-tiny.cfg yolov4-tiny.weights "nvarguscamerasrc ! video/x-raw(memory:NVMM),width=1280, height=720, framerate=30/1, format=NV12 ! nvvidconv ! video/x-raw, format=BGRx, width=640, height=360 ! videoconvert ! video/x-raw, format=BGR ! appsink" -ext_output -dont_show
```

### 3. Install node.js, mongodb

```bash
# Install node.js
sudo apt-get install curl
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
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

- Change `"MONGODB_URL"` in `opendatacam/config.json` (default is the docker service mongo URL)

```json
{
  "MONGODB_URL": "mongodb://127.0.0.1:27017"
}
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
  "NEURAL_NETWORK": "yolov4-tiny"
}
```

*For Jetson Xavier (recommanded)*

```json
{
  "VIDEO_INPUT": "usbcam",
  "NEURAL_NETWORK": "yolov4"
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

git clone --depth 1 -b 4.1.1 https://github.com/opencv/opencv.git

cd opencv
mkdir build
cd build
# Note here you need to set both FFMPEG and GSTREAMER to ON
# Running this command should output a summary of which dependencies are gonna be build with opencv
# Double check that both gstreamer and ffmpeg are ON
cmake -D CMAKE_INSTALL_PREFIX=/usr/local CMAKE_BUILD_TYPE=Release -D WITH_GSTREAMER=ON -D WITH_GSTREAMER_0_10=OFF -D WITH_CUDA=OFF -D WITH_TBB=ON -D WITH_LIBV4L=ON WITH_FFMPEG=ON -DOPENCV_GENERATE_PKGCONFIG=ON ..

sudo make install

#reload if opencv already installed
sudo /bin/bash -c 'echo "/usr/local/lib" >> /etc/ld.so.conf.d/opencv.conf'
sudo ldconfig
```
