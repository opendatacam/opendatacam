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

> NOTE @tdurand : lots of those steps needs to be automated by integrating them in a docker image or something similar, for now need to follow the full procedure

### 1. Pre-requise dependencies to install on the jetson

The jetson comes out of the box with Ubuntu 16.04 installed, but we need some external dependencies:

- ffmpeg
- node

### 2. Configure Ubuntu to turn the jetson into a wifi access point

> NOTE @tdurand : This needs to be automated, the doc below explains how to do it with the graphical user interface of Ubuntu, need to find the equivalent in commandline and put it in a script that we run when installing the ready-to-use-image

1. enable SSID broadcast, the driver’s op_mode parameter has to be set to 2, to do add the following line to /etc/modprobe.d/bcmdhd.conf:

```conf
options bcmdhd op_mode=2
```

[details about that](https://devtalk.nvidia.com/default/topic/910608/jetson-tx1/setting-up-wifi-access-point-on-tx1/post/4786912/#4786912)

2.  Configure hotspot via UI, follow this guide: https://askubuntu.com/a/762885

3. Then define the adress range of the hotspot network, to be able to connect to it and know that 192.168.2.1 will be the jetson and the node app for the client

```bash
cd /etc/NetworkManager/system-connections
sudo vim YOUR-HOTSPOT-NAME
```

Add this line : `address1=192.168.2.1/24,192.168.2.1`

```conf
[ipv4]
dns-search=
method=shared
address1=192.168.2.1/24,192.168.2.1
```

Restart the network service

`sudo service network-manager restart`

Now when you connect to YOUR-HOTSPOT, and you open http://192.168.2.1  in some browser, if you run a webserver there, it will display it 🎉

[More info about that](https://askubuntu.com/a/910326)

### 3. Put jetson in overclocking mode:

> NOTE @tdurand : This needs to be done automaticaly at Ubuntu start-up

```bash
cd ~ #go to home directory
sudo ./jetson_clocks.sh
```

### 4. Download and install the YOLO darknet-net "mesos" fork:

> NOTE @tdurand : This also will need to come pre-installed

Follow the steps of https://github.com/meso-unconstructed/darknet-net

You can install the darknet net in any folder of the jetson, but keep in mind you will need to set-up the PATH_TO_DARKNET in the config.json file of the open-traffic-cam app. (next step)

Don't forget to download the yolo-voc weigh file and put it on the root of the darknet net folder.

The file structure of the darknet-net folder should be something like:

```bash
darknet-net
  |-cfg
  |-data
  |-examples
  |-include
  |-python
  |-scripts
  |-src
  |# ... other files
  |yolo-voc.weights # Weight file should be in the root directory
```

You can test if it is well installed by running this command, it should start the YOLO detections on the webcam and ouput then in the console:

`./darknet detector demo cfg/voc.data cfg/yolo-voc.cfg yolo-voc.weights -c 1 -address "ws://echo.websocket.org" -coord lrtb`

### 5. Download the open-traffic-cam node app:

_NOTE @tdurand : the tracker will be an external npm package at the end_

- Download zip
- npm install

-> config.json add path to darknet-net

## 🏁 Run and use the project:

### 1. Start the "open-traffic-cam" node app

> NOTE @tdurand , this should be started at the startup of the jetson

- cd PATH_TO_OPEN_TRAFFIC_CAM
- sudo npm run start  (need sudo to run the project on port 80)

### 2. Connect you device to the jetson

When the jetson is started you should have a wifi "YOUR-HOTSPOT-NAME" available.

- Connect you device to the jetson wifi
- Open you browser and open http://localhost 

### 3. You are done 👌

You should be able to monitor the jetson from the UI we've build and count 🚗 🏍 🚚 !  


## 🛠 Development notes

### General architecture

TODO 

### Mount jetson filesystem as local filesystem on mac for dev

`sshfs -o allow_other,defer_permissions nvidia@192.168.1.222:/home/nvidia/Desktop/lab-traffic-cam /Users/tdurand/Documents/ProjetFreelance/Moovel/remote-lab-traffic-cam/`

### SSH jetson

`ssh nvidia@192.168.1.222`

### Install it and run:

```bash
yarn install
yarn run dev
```
