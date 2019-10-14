# OpenDataCam 2.1.0

This project is offline lightweight DIY solution to monitor urban landscape. After installing this software on the specified hardware (Nvidia Jetson board + Logitech webcam), you will be able to count cars, pedestrians, motorbikes from your webcam live stream.

Behind the scenes, it feeds the webcam stream to a neural network (YOLO darknet) and make sense of the generated detections.

It is very alpha and we do not provide any guarantee that this will work for your use case, but we conceived it as a starting point from where you can build-on & improve.

👉 [See Demo Video (4 min)](https://vimeo.com/346340651/38966dac9d)

[![Demo OpenDataCam](https://i.vimeocdn.com/video/805477718.webp?mw=1200&mh=675&q=85)](https://vimeo.com/346340651/38966dac9d)

## Table of content

- [OpenDataCam 2.1.0](#open-data-cam-200-rc1)
  * [Table of content](#table-of-content)
  * [💻 Hardware pre-requisite](#-hardware-pre-requisite)
  * [🎬 Get Started, quick setup](#--get-started--quick-setup)
    + [1. Software pre-requisite 📦](#1-software-pre-requisite-)
      - [For jetson: Flash Jetson board to jetpack 4.2 or 4.2.1 ⚡️](#for-jetson--flash-jetson-board-to-jetpack-42-)
      - [For non-jetson: Install nvidia-docker v2.0 🔧](#for-non-jetson--install-nvidia-docker-v20-)
    + [2. Install and start OpenDataCam 🚀](#2-install-and-start-opendatacam-)
    + [2. bis (optional) Upgrade OpenDataCam (from v2.x to another v2.x version)](#2-bis--optional--upgrade-opendatacam--from-v2x-to-another-v2x-version-)
    + [3. Use OpenDataCam 🖖](#3-use-opendatacam-)
    + [4. Configure your Wifi hotspot 📲](#4-configure-your-wifi-hotspot-)
    + [5. Customize OpenDataCam ️️⚙️](#5-customize-opendatacam-)
    + [6. Docker playbook ️📚](#6-docker-playbook-)
  * [🔌 API Documentation](#-api-documentation)
  * [🗃 Data export documentation](#-data-export-documentation)
  * [⁉️ Troubleshooting](#-troubleshooting)
  * [🎛 Advanced uses](#-advanced-uses)
    + [How to use opendatacam without docker](#how-to-use-opendatacam-without-docker)
    + [How to create / update the docker image](#how-to-create--update-the-docker-image)
  * [🎯 How accurate is OpenDataCam ?](#-how-accurate-is-opendatacam-)
  * [🚤 How fast is OpenDataCam ?](#-how-fast-is-opendatacam-)
  * [🛠 Development notes](#-development-notes)
  * [💌 Acknowledgments](#-acknowledgments)

## 💻 Hardware pre-requisite

- Nvidia Jetson Nano / TX2 / Xavier or any GNU/Linux x86_64 machine with a CUDA compatible GPU with [nvidia-docker v2.0](https://github.com/NVIDIA/nvidia-docker/wiki/Installation-(version-2.0)#prerequisites) (in the cloud or locally)
- Webcam Logitech C222, C270, C310, C920 / Rasberry Pi cam for Jetson nano / a Video file / IP camera
- A smartphone / tablet / laptop that you will use to operate the system

_If you have a Jetson Nano, [please read this specific documentation](documentation/jetson/JETSON_NANO.md)_

_Also see [In depth guide about compatible Cameras with Jetson](https://elinux.org/Jetson/Cameras)_

## 🎬 Get Started, quick setup

### 1. Software pre-requisite 📦

#### For jetson: Flash Jetson board to jetpack 4.2 or 4.2.1 ⚡️

*Ignore this if you are not running on a jetson*

[See How to find out your jetpack version](documentation/jetson/FLASH_JETSON.md#How-to-find-out-my-Jetpack-version)

If your jetson does not have jetpack 4.2 or 4.2.1 *(CUDA 10, TensorRT 5, cuDNN 7.3, Ubuntu 18.04)*

[Follow this guide to flash your jetson](documentation/jetson/FLASH_JETSON.md)

#### For non-jetson: Install nvidia-docker v2.0 🔧

*Ignore this if you are running on a jetson, nvidia-docker isn't necessary with jetpack 4.2*

Nvidia-docker v2.0 is only compatible with GNU/Linux x86_64 machine with a [CUDA compatible GPU](https://developer.nvidia.com/cuda-gpus)

[Follow this guide to install nvidia-docker v2.0 on your machine](documentation/nvidia-docker/INSTALL_NVIDIADOCKER.md)

### 2. Install and start OpenDataCam 🚀

Open a terminal or ssh to you machine and run the following commands depending on your platform

- _For a Jetson:_ make sure an usb webcam is connected on `video0`

```bash
ls /dev/video*
# Output should be: /dev/video0
```

_If this isn't the case, run the install script anyway, and after you will need to [modify the config.json](documentation/CONFIG.md) file to select your desired VIDEO_INPUT (file, usbcam, raspberrycam, remote IP cam), [we will improve setup / install process for v2.1](https://github.com/opendatacam/opendatacam/issues/89) 💪_

- _For a nvidia-docker compatible machine:_ it will run on a demo file

__Install commands:__

```bash
# Download install script
wget -N https://raw.githubusercontent.com/opendatacam/opendatacam/v2.1.0/docker/install-opendatacam.sh

# Give exec permission
chmod 777 install-opendatacam.sh

# NB: You will be asked for sudo password when installing the docker container

# Install command for Jetson Nano
./install-opendatacam.sh --platform nano

# Install command for Jetson TX2
./install-opendatacam.sh --platform tx2

# Install command for Jetson Xavier
./install-opendatacam.sh --platform xavier

# Install command for a Nvidia-docker machine (ARCH_BIN=6.1)
# NB: Will run from demo file, you can change this after install, see "5. Customize OpenDataCam"
./install-opendatacam.sh --platform nvidiadocker_cuda_archbin_6_1
```

This command will download and start a docker container on the machine. After it finishes the docker container starts a webserver on port 8080.

The docker container is started in auto-restart mode, so if you reboot your machine it will automaticaly start opendatacam on startup. ([Learn more about the specificities of docker on jetson](#6-docker-playbook-))

You can also [use opendatacam without docker](#how-to-run-opendatacam-without-docker)

### 2. bis (optional) Upgrade OpenDataCam (from v2.x to another v2.x version)

- If you have modified the `config.json`, save it somewhere
- Remove `config.json`, `install-opendatacam.sh`, `run-docker.sh`, `run-opendatacam.sh` _(To improve, make install script remove them)_
- Run the install steps again (previous section), this will download a new default `config.json` file compatible with the opendatacam version you are installing and setup a new docker container
- Open the newly downloaded config.json script and modify with the things you had changed previously

_NB: we do not handle auto update of the config.json file_

### 3. Use OpenDataCam 🖖

Open your browser at http://IPOFJETSON:8080 .

*If you are running with the jetson connected to a screen: http://localhost:8080*

_NB: OpenDataCam only supports one client at a time, if you open the UI on two different devices, the stream will stop in one of them._

See [Docker playbook ️📚](#6-docker-playbook-️) how to restart / stop OpenDataCam.

### 4. Configure your Wifi hotspot 📲

In order to operate opendatacam from your phone / tablet / computer.

See [Make jetson device / machine accessible via WIFI](documentation/WIFI_HOTSPOT_SETUP.md)

### 5. Customize OpenDataCam ️️⚙️

We offer several customization options:

- **Video input:** run from a file, change webcam resolution, change camera type (raspberry cam, usb cam...)

- **Neural network:** change YOLO weights files depending on your hardware capacity, desired FPS (tinyYOLO, full yolov3, yolov3-openimages ...)

- **Change display classes:** We default to mobility classes (car, bus, person...), but you can change this

[Learn how to customize OpenDataCam](documentation/CONFIG.md)

### 6. Docker playbook ️📚

**Docker specificities on jetson**

Docker doesn't support GPU usage on Jetson _(see [issue #214 on docker-nvidia official repo](https://github.com/NVIDIA/nvidia-docker/issues/214) , support should be landing around Q3-Q4 2019)_

Meanwhile we need to give to the docker container access to the host platform GPU. We do so by mounting several volumes with [this script](https://github.com/opendatacam/opendatacam/blob/master/docker/run-jetson/run-docker.sh).

That is why you need to use our install script to install a container. We have [an open issue](https://github.com/opendatacam/opendatacam/issues/89) to simplify setup once nvidia-docker support lands for jetson devices.

**How to show OpenDataCam logs**

```bash
# List containers
sudo docker container list

sudo docker logs <containerID>
```

**How to  stop / restart OpenDataCam**

```bash
# List containers
sudo docker container list

# Stop container (get id from previous command)
sudo docker stop <containerID>

# Start container (will mount the opendatacam_videos/ and the config.json + mount CUDA necessary stuff)
sudo ./run-opendatacam.sh

# Restart container (after modifying the config.json file for example)
sudo docker restart <containerID>

# Install a newer version of opendatacam
# Follow the 1. Install and start OpenDataCam

# See stats ( CPU , memory usage ...)
sudo docker stats <containerID>

# Clear all docker container, images ...
sudo docker system prune -a
```

## 🔌 API Documentation

In order to solve use cases that aren't taken care by our opendatacam base app, you might be able to build on top of our API instead of forking the project.

[https://opendatacam.github.io/opendatacam/apidoc/](https://opendatacam.github.io/opendatacam/apidoc/)

## 🗃 Data export documentation

- [Counter data](https://opendatacam.github.io/opendatacam/apidoc/#api-Recording-Counter_data)
- [Tracker data](https://opendatacam.github.io/opendatacam/apidoc/#api-Recording-Tracker_data)

## ⁉️ Troubleshooting

[Common errors with answers](documentation/TROUBLESHOOTING.md)

## 🎛 Advanced uses

### How to use opendatacam without docker

Read [How to use opendatacam without docker](documentation/USE_WITHOUT_DOCKER.md)

### How to create / update the docker image

We host our docker images on [Dockerhub](https://cloud.docker.com/repository/docker/opendatacam/opendatacam)

*For jetson devices:*

See [How to create / update a docker image for a jetson device](documentation/jetson/CREATE_DOCKER_IMAGE.md)

*For nvidia-docker machine:*

See [How to create / update a docker image for a nvidia-docker machine](documentation/nvidia-docker/CREATE_NVIDIADOCKER_IMAGE.md)


## 🎯 How accurate is OpenDataCam ?

We are working on [adding a benchmark](https://github.com/opendatacam/opendatacam/issues/87) to rank OpenDataCam on the [MOT Challenge (Multiple Object Tracking Benchmark)](https://motchallenge.net/) for v2.1.

Accuracy depends on which YOLO weights your hardware is capable of running.

## 🚤 How fast is OpenDataCam ?

FPS depends on:

- which hardware your are running OpenDataCam on
- which YOLO weights you are using

We made the default settings to run at least at 10 FPS on any Jetson.

Learn more in the [Customize OpenDataCam documentation](documentation/CONFIG.md#Change-neural-network-weights)


## 🛠 Development notes

See [Development notes](documentation/DEVELOPMENT_NOTES.md)

Technical architecture overview:

![Technical architecture](https://user-images.githubusercontent.com/533590/60489282-3f2d1700-9ca4-11e9-932c-19bf84e04f9a.png)

## 💌 Acknowledgments

- Original darknet + YOLOv3 @pjreddie  : [https://pjreddie.com/darknet/](https://pjreddie.com/darknet/)
- Darknet fork by @alexeyab : [https://github.com/alexeyab/darknet](https://github.com/alexeyab/darknet)
- IOU / V-IOU Tracker by @bochinski : [https://github.com/bochinski/iou-tracker/](https://github.com/bochinski/iou-tracker/)
- Next.js by @zeit : [https://github.com/zeit/next.js](https://github.com/zeit/next.js)
