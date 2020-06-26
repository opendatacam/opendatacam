## How run OpenDataCam Tracker on a video file

- [How run OpenDataCam Tracker on a video file](#how-run-opendatacam-tracker-on-a-video-file)
  - [1. Install Darknet with run on file support (Neural network framework running YOLO)](#1-install-darknet-with-run-on-file-support-neural-network-framework-running-yolo)
    - [Dependency needed:](#dependency-needed)
    - [Get the source files](#get-the-source-files)
    - [Modify the Makefile before compiling](#modify-the-makefile-before-compiling)
    - [Compile darknet](#compile-darknet)
    - [Download weight file](#download-weight-file)
  - [2. Run darknet on your video file to generate the yolo-detections.json](#2-run-darknet-on-your-video-file-to-generate-the-yolo-detectionsjson)
  - [3. Run the tracker on the yolo-detections.json](#3-run-the-tracker-on-the-yolo-detectionsjson)


### 1. Install Darknet with run on file support (Neural network framework running YOLO)

#### Dependency needed:

You need OpenCV installed. The version should be > 2.4 and < 4.x, you don't need a version compiled with GStreamer.

- For jetson, the version coming with Jetpack should work
- For ubuntu machine, `sudo apt-get install libopencv-dev` should work

You can verify if opencv is installed with this command

```
pkg-config --modversion opencv
```

Make sure you have CUDA installed

```
nvcc --version
```
If it returns Command 'nvcc' not found, you need to install cuda properly, see [install nvidia driver](nvidia-docker/INSTALL_NVIDIADOCKER.md#22-install--update-nvidia-driver).

#### Get the source files

```bash
#NB: You need to checkout the branch evo-outputjsonfile as we added support to run on a video file: https://github.com/opendatacam/darknet/pull/2

git clone --depth 1 -b evo-outputjsonfile https://github.com/opendatacam/darknet
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

#### Download weight file

The .weights files that need to be in the root of the `/darknet` folder

```bash
cd darknet #if you are not already in the darknet folder

# YOLOv4-tiny
wget https://github.com/AlexeyAB/darknet/releases/download/darknet_yolo_v4_pre/yolov4-tiny.weights --no-check-certificate
# YOLOv4
wget https://github.com/AlexeyAB/darknet/releases/download/darknet_yolo_v3_optimal/yolov4.weights --no-check-certificate
```

### 2. Run darknet on your video file to generate the yolo-detections.json 

```bash
# Go to darknet folder
cd darknet 
# Copy your video file in the darknet folder
cp path-to-your-videofile/video.mp4 .
# Run darknet
# Depending on your machine capabilities
# With YOLOv4 weights
./darknet detector demo cfg/coco.data cfg/yolov4.cfg yolov4.weights video.mp4 -dont_show -json_file_output yolo-detections.json

# With YOLOv4-tiny
./darknet detector demo cfg/coco.data cfg/yolov4-tiny.cfg yolov4-tiny.weights video.mp4 -dont_show -json_file_output yolo-detections.json
```

### 3. Run the tracker on the yolo-detections.json

The tracker will enhance the detections of YOLO with unique ids for each objects detected, more details about the tracker here: https://github.com/opendatacam/node-moving-things-tracker

```bash
# Install the tracker (you need to have node.js installed)
# You need node-moving-things-tracker >= 0.7.1
npm install -g node-moving-things-tracker

# Run the tracker on the yolo-detections.json file
node-moving-things-tracker --mode opendatacam-darknet --input yolo-detections.json

# The tracker data will be wrote in the same directory in a tracker.json file
```
