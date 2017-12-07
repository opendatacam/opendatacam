# Open traffic cam (with YOLO)

This project is offline lightweight DIY solution to monitor urban landscape. After installing this software on the specified hardware (Nvidia Jetson board + Logitech webcam), you will be able to count cars, pedestrians, motorbikes from your webcam live stream.

Behind the scenes, it feeds the webcam stream to a neural network (YOLO darknet) and make sense of the generated detections.

It is very alpha and we do not provide any guarantee that this will work for your use case, but we conceived it as a starting point from where you can build-on & improve.

## 💻 Hardware pre-requise

- Nvidia Jetson TX2 
- Webcam Logitech C222 (or any usb webcam compatible with Ubuntu 16.04)
- A smartphone / tablet / laptop that you will use to operate the system

## ⚙ System overview

![open traffic cam architecture](https://user-images.githubusercontent.com/533590/33710070-b1d2462c-db3f-11e7-96f8-7c3f914f38d8.jpg)

## 🛠 Step by Step install guide

_NOTE @tdurand : lots of those steps needs to be automated by integrating them in a docker image or something similar, for now need to follow the full procedure_

### 1. Pre-requise dependencies to install on the jetson

The jetson comes out of the box with Ubuntu 16.04 installed, but we need some external dependencies:

- ffmpeg
- node

### 2. Configure Ubuntu to turn the jetson into a wifi access point

TODO copy paste doc about that here

### 3. Put jetson in overclocking mode:

_NOTE @tdurand : This needs to be done automaticly on Ubuntu startup_

from home directoty

`sudo ./jetson_clocks.sh`

### 4. Download and install the YOLO darknet-net "mesos" fork:

- darknet-net fork of mesos with VOC weight file

TODO needs to respect that file structure.

### 5. Download the open-traffic-cam node app:

_NOTE @tdurand : the tracker will be an external npm package at the end_

- Download zip
- npm install

## 🛠 Run and use the project:

### 1. Start the "open-traffic-cam" node app

_NOTE @tdurand , this should be started at the startup of the jetson_

- cd PATH_TO_OPEN_TRAFFIC_CAM
- sudo npm run start  (need sudo to run the project on port 80)

### 2. Connect you device to the jetson

When the jetson is started you should have a wifi "jetson" available.

- Connect you device to the jetson wifi
- Open you browser and open http://localhost 

### 3. You are done 👌

You should be able to monitor the jetson from the UI we've build and count 🚗 🏍 🚚 !  


## Dev tips

### Mount jetson filesystem as local filesystem on mac for dev

`sshfs -o allow_other,defer_permissions nvidia@192.168.1.222:/home/nvidia/Desktop/lab-traffic-cam /Users/tdurand/Documents/ProjetFreelance/Moovel/remote-lab-traffic-cam/`

### SSH jetson

`ssh nvidia@192.168.1.222`

### Install it and run:

```bash
yarn install
yarn run dev
```
