# Open data cam 2.0.0-beta.1

This project is offline lightweight DIY solution to monitor urban landscape. After installing this software on the specified hardware (Nvidia Jetson board + Logitech webcam), you will be able to count cars, pedestrians, motorbikes from your webcam live stream.

Behind the scenes, it feeds the webcam stream to a neural network (YOLO darknet) and make sense of the generated detections.

It is very alpha and we do not provide any guarantee that this will work for your use case, but we conceived it as a starting point from where you can build-on & improve.

[See Demo Video (60s)](https://www.youtube.com/watch?v=NwXrXHHGSgk)

[![Demo open data cam](https://img.youtube.com/vi/A-TvSjAU1pk/0.jpg)](https://www.youtube.com/watch?v=A-TvSjAU1pk)

### Table of Contents

- [Open data cam 2.0.0-beta.1](#open-data-cam-200-beta1)
    + [Table of Contents](#table-of-contents)
  * [Hardware pre-requisite](#---hardware-pre-requisite)
  * [Get Started, quick setup](#---get-started--quick-setup)
    + [1. Flash Jetson board to jetpack 4.2+ ⚡️ ️(optional)️:](#1-flash-jetson-board-to-jetpack-42-------optional---)
    + [2. Install and start Opendatacam (3 min 🚀):](#2-install-and-start-opendatacam--3-min-----)
    + [3. Run Opendatacam 🖖](#3-run-opendatacam---)
    + [(optional) Upgrade / Stop Opendatacam:](#-optional--upgrade---stop-opendatacam-)
  * [Opendatacam settings](#-----opendatacam-settings)
  * [Exports documentation and API](#---exports-documentation-and-api)
  * [Advanced uses](#---advanced-uses)
    + [How to run opendatacam without docker](#how-to-run-opendatacam-without-docker)
    + [How to create / update the docker image](#how-to-create---update-the-docker-image)
  * [Troubleshoothing](#troubleshoothing)
  * [Development notes](#---development-notes)
    + [Run simulation mode](#run-simulation-mode)
    + [Technical architecture](#technical-architecture)
    + [Docker useful commands](#docker-useful-commands)
    + [Miscellaneous dev tips](#miscellaneous-dev-tips)
      - [Mount jetson filesystem as local filesystem on mac for dev](#mount-jetson-filesystem-as-local-filesystem-on-mac-for-dev)
      - [SSH jetson](#ssh-jetson)

## 💻 Hardware pre-requisite

- Nvidia Jetson TX2 / Xavier
- Webcam Logitech C222 (or any usb webcam compatible with Ubuntu 18.04)
- A smartphone / tablet / laptop that you will use to operate the system

## 🎬 Get Started, quick setup

### 1. Flash Jetson board to jetpack 4.2+ ⚡️ ️(if not installed)️:

If your jetson does not have jetpack 4.2 *(CUDA 10, TensorRT 5, cuDNN 7.3, Ubuntu 18.04)*

[Follow this guide to flash your jetson](https://github.com/moovel/lab-opendatacam/blob/v2/doc/FLASH_JETSON.md)


### 2. Install and start Opendatacam (3 min 🚀):

Open a terminal or ssh to you jetson and run this command (make sure your webcam is connected):

**For Jetson Nano:**

```bash
sudo wget -O - https://raw.githubusercontent.com/moovel/lab-opendatacam/v2/docker/run-jetson/run-opendatacam-nano.sh | bash
```

**For Jetson TX2:**

```bash
sudo wget -O - https://raw.githubusercontent.com/moovel/lab-opendatacam/v2/docker/run-jetson/run-opendatacam-tx2.sh | bash
```

**For Jetson Xavier:**

TODO

[See Install Tutorial (30s)](https://www.youtube.com/watch?v=NwXrXHHGSgk)

[![Install open data cam](https://img.youtube.com/vi/NwXrXHHGSgk/0.jpg)](https://www.youtube.com/watch?v=NwXrXHHGSgk)

### 3. Run Opendatacam 🖖

Open your browser at http://<IPOFJETSON>:8080

*If you are running with the jetson connected to a screen: http://localhost:8080*

**How to show logs Opendatacam**

```bash
# List containers
sudo docker container list

sudo docker logs <containerID>
```

**How to upgrade / stop / restart Opendatacam**

```bash
## Stop opendatacam docker container

# List containers
sudo docker container list

# Stop container (get id from previous command)
sudo docker stop <containerID>

# Then you can run the install command to install & run the latest version
sudo wget -O - https://raw.githubusercontent.com/moovel/lab-opendatacam/v2/docker/run-jetson/run-opendatacam.sh | bash
```


## ️️⚙️ Opendatacam settings

TODO document config.json file and mount config file at runtime in docker container: https://www.thepolyglotdeveloper.com/2018/06/mapping-volumes-passing-environment-variables-containerized-docker-applications/

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

### Run simulation mode

Simulation mode is useful to work on the UI and node.js feature deployment without having to run the neural network / the webcam.

**Dependency:** Mongodb installed _(optional, only to record data)_ : [see tutorial](https://docs.mongodb.com/manual/installation/#mongodb-community-edition)

```bash
# Clone repo
git@github.com:moovel/lab-opendatacam.git
# Switch to v2 branch
git checkout v2
# Install dependencies
npm i
# Run in dev mode
npm run dev
# Open browser on http://localhost:8080/
```

If you have an error while doing `npm install` it is probably a problem with node-gyp, you need to install additional dependencies depending on your platform: https://github.com/nodejs/node-gyp#on-unix


### Technical architecture

TODO update

![technical architecture open traffic cam](https://user-images.githubusercontent.com/533590/33723806-ed836ace-db6d-11e7-9d7b-12b79e3bcbed.jpg)

[Edit schema](https://docs.google.com/drawings/d/1GCYcnQeGTiifmr3Hc77x6RjCs5RZhMvgIQZZP_Yzbs0/edit?usp=sharing)

### Docker useful commands

```
# List containers running
sudo docker container list

# See logs
sudo docker logs <containerID>

# See stats ( CPU , memory usage ...)
sudo docker stats <containerID>

# Stop container
sudo docker stop <containerID>

# Clear all docker container, images ...
sudo docker system prune -a
```

### Miscellaneous dev tips

#### Mount jetson filesystem as local filesystem on mac for dev

`sshfs -o allow_other,defer_permissions nvidia@192.168.1.222:/home/nvidia/Desktop/lab-traffic-cam /Users/tdurand/Documents/ProjetFreelance/Moovel/remote-lab-traffic-cam/`

#### SSH jetson

`ssh nvidia@192.168.1.222`

