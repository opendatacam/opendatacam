# Open data cam v2 (with YOLO)

This project is offline lightweight DIY solution to monitor urban landscape. After installing this software on the specified hardware (Nvidia Jetson board + Logitech webcam), you will be able to count cars, pedestrians, motorbikes from your webcam live stream.

Behind the scenes, it feeds the webcam stream to a neural network (YOLO darknet) and make sense of the generated detections.

It is very alpha and we do not provide any guarantee that this will work for your use case, but we conceived it as a starting point from where you can build-on & improve.

<TODO insert demo video>

### Table of Contents

  * [Hardware pre-requisite](#---hardware-pre-requisite)
  * [Get Started, quick setup](#---get-started--quick-setup)
    + [1. Flash Jetson board ️(optional)️:](#1-flash-jetson-board------optional---)
    + [2. Install and run Opendatacam:](#2-install-and-run-opendatacam-)
  * [Customize Opendatacam](#customize-opendatacam)
  * [Exports documentation and API](#---exports-documentation-and-api)
  * [Advanced uses](#---advanced-uses)
    + [How to run opendatacam without docker](#how-to-run-opendatacam-without-docker)
    + [How to create / update the docker image](#how-to-create---update-the-docker-image)
  * [Troubleshoothing](#troubleshoothing)
  * [Development notes](#---development-notes)
    + [Technical architecture](#technical-architecture)
    + [Miscellaneous dev tips](#miscellaneous-dev-tips)
      - [Mount jetson filesystem as local filesystem on mac for dev](#mount-jetson-filesystem-as-local-filesystem-on-mac-for-dev)
      - [SSH jetson](#ssh-jetson)

## 💻 Hardware pre-requisite

- Nvidia Jetson TX2 / Xavier
- Webcam Logitech C222 (or any usb webcam compatible with Ubuntu 18.04)
- A smartphone / tablet / laptop that you will use to operate the system

## 🎬 Get Started, quick setup

TODO add video

### 1. Flash Jetson board to jetpack 4.2+ ⚡️ ️(optional)️:

If your jetson does not have jetpack 4.2 *(CUDA 10, TensorRT 5, cuDNN 7.3, Ubuntu 18.04)*, [follow this guide](https://github.com/moovel/lab-opendatacam/blob/v2/doc/FLASH_JETSON.md)


### 2. Install and run Opendatacam:

```bash
# Get the darknet-docker script (TODO @tdurand remove v2 when releasing)
wget https://raw.githubusercontent.com/moovel/lab-opendatacam/v2/docker/run-jetson/darknet-docker.sh

# Chmod to give exec permissions
chmod 777 darknet-docker.sh

# Pull and run interactively the docker image
sudo ./darknet-docker.sh run --rm -it tdurand/opendatacam:v0.0.1
```

## ️️⚙️ Opendatacam settings

TODO document config.json file

[Config doc](https://github.com/moovel/lab-opendatacam/blob/v2/doc/CONFIG.md)


## 💾 Exports documentation and API

TODO See how we organize this 


see v1 docs:
[https://github.com/moovel/lab-opendatacam#-exports-documentation](https://github.com/moovel/lab-opendatacam#-exports-documentation)


## 🎛 Advanced uses

### How to run opendatacam without docker

[RUN_WITHOUT_DOCKER.md](https://github.com/moovel/lab-opendatacam/blob/v2/doc/RUN_WITHOUT_DOCKER.md)

### How to create / update the docker image

[CREATE_DOCKER_IMAGE.md](https://github.com/moovel/lab-opendatacam/blob/v2/doc/CREATE_DOCKER_IMAGE.md)

## Troubleshoothing

*TODO UPDATE this for v2*

To debug the app log onto the jetson board and inspect the logs from pm2 or stop the pm2 service (`sudo pm2 stop <pid>`) and start the app by using `sudo npm start` to see the console output directly.

- **Warning**: "nvbuf_utils: Could not get EGL display connection" doesn't mean there is an error, it's just it does not start X, if stuck here means something prevent Opencv to read the webcam... but doesn't mean it doen't have access to the webcam... 

- **Error**: `Could *not* find a valid build in the '.next' directory! Try building your app with '*next* build' before starting the server`

  Run `npm build` before starting the app

- Could not find darknet. Be sure to `make` darknet without `sudo` otherwise it will abort mid installation.

- **Error**: `OpenCV Error: Unspecified error (GStreamer: unable to start pipeline
) in cvCaptureFromCAM_GStreamer`

  The webcam isn't detected. Try to plug out / in

- **Error**: `Error: Cannot stop process that is not running.`

  It is possible that a process with the port `8090` is causing the error. Try to kill the process and restart the board:

  ```bash
  sudo netstat -nlp | grep :8090
  sudo kill <pid>
  ```

## 🛠 Development notes

### Technical architecture

TODO update

![technical architecture open traffic cam](https://user-images.githubusercontent.com/533590/33723806-ed836ace-db6d-11e7-9d7b-12b79e3bcbed.jpg)

[Edit schema](https://docs.google.com/drawings/d/1GCYcnQeGTiifmr3Hc77x6RjCs5RZhMvgIQZZP_Yzbs0/edit?usp=sharing)

### Miscellaneous dev tips

#### Mount jetson filesystem as local filesystem on mac for dev

`sshfs -o allow_other,defer_permissions nvidia@192.168.1.222:/home/nvidia/Desktop/lab-traffic-cam /Users/tdurand/Documents/ProjetFreelance/Moovel/remote-lab-traffic-cam/`

#### SSH jetson

`ssh nvidia@192.168.1.222`

