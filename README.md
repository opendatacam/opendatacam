# Open traffic cam (with YOLO)

This project is offline lightweight DIY solution to monitor urban landscape. After installing this software on the specified hardware (Nvidia Jetson board + Logitech webcam), you will be able to count cars, pedestrians, motorbikes from your webcam live stream.

Behind the scenes, it feeds the webcam stream to a neural network (YOLO darknet) and make sense of the generated detections.

It is very alpha and we do not provide any guarantee that this will work for your use case, but we conceived it as a starting point from where you can build-on & improve.

## 💻 Hardware pre-requise

- Nvidia Jetson TX2 
- Webcam Logitech C222 (or any usb webcam compatible with Ubuntu 16.04)
- A smartphone / tablet / laptop that you will use to operate the system

## ⚙ System overview

See [technical architecture](#technical-architecture) for a more detailed overview

![open traffic cam architecture](https://user-images.githubusercontent.com/533590/33759265-044eb90e-dc02-11e7-9533-9588f7f5c4a2.png)

[Edit schema](https://docs.google.com/drawings/d/1Pw3rsHGyj_owZUScRwBnZKb1IltA3f0R8yCmcdEbnr8/edit?usp=sharing)

## 🛠 Step by Step install guide

> NOTE: lots of those steps needs to be automated by integrating them in a docker image or something similar, for now need to follow the full procedure

### 1. Pre-requise dependencies to install on the jetson

The jetson comes out of the box with Ubuntu 16.04 installed, but we need some external dependencies:

- `ffmpeg 2.8.11` or more recent
- `node 8.x` or more recent 

### 2. Configure Ubuntu to turn the jetson into a wifi access point

> NOTE: This could use to be automated, the doc below explains how to do it with the graphical user interface of Ubuntu, need to find the equivalent in commandline and put it in a script that we run when installing the ready-to-use-image

1. enable SSID broadcast, the driver’s op_mode parameter has to be set to 2, to do add the following line to /etc/modprobe.d/bcmdhd.conf:

```conf
options bcmdhd op_mode=2
```

[details about that](https://devtalk.nvidia.com/default/topic/910608/jetson-tx1/setting-up-wifi-access-point-on-tx1/post/4786912/#4786912)

2.  Configure hotspot via UI, follow this guide: https://askubuntu.com/a/762885

3. Then define the adress range of the hotspot network, to be able to connect to it and know that 192.168.2.1 will be the jetson IP

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

### 3. Configure jetson to start in overclocking mode:

The jetson has a overclocking mode that we can enable to boost performance of YOLO (from 1 FPS to 8 FPS)

```bash
# Create the rc.local file
sudo vim /etc/rc.local
```

Copy paste this content

```
#!/bin/bash 
#Maximize performances 
( sleep 60 && /home/ubuntu/jetson_clocks.sh )&
exit 0
```

Then save the file and run

```
chmod 755 /etc/init.d/rc.local
sudo systemctl enable rc-local.service
```

Restart the jetson

### 4. Download and install the YOLO darknet-net "mesos" fork:

> NOTE: This also could use to come pre-installed

Follow the steps of https://github.com/meso-unimpressed/darknet-net

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

### 5. Download and install the open-traffic-cam node app on the jetson:

- Clone or download this repository on the jetson
- Open the config.json file and specify the PATH_TO_YOLO_DARKNET, it should be the absolute path
- Run `npm install` 

## 🏁 Run and use the project:

### 1. Configure the "open-traffic-cam" node app to run at the startup of ubuntu

Install pm2:

```npm install -g pm2```

Then

```bash
# launch pm2 at startup
# this command gives you instructions to configure pm2 to 
# start at ubuntu startup, follow them
pm2 startup  
 
# Once pm2 is configured to start at startup
# Configure pm2 to start the Open Traffic Cam app
cd PATH_TO_OPEN_TRAFFIC_CAM repository
pm2 start npm --name "open-traffic" -- start
pm2 save
```

### 2. Connect you device to the jetson

> 💡 We should maybe set up a "captive portal" to avoid people needing to enter the ip of the jetson, didn't try yet 💡 

When the jetson is started you should have a wifi "YOUR-HOTSPOT-NAME" available.

- Connect you device to the jetson wifi
- Open you browser and open http://IPOFTHEJETSON:8080
- In our case, IPOFJETSON is: http://192.168.2.1:8080 

### 3. You are done 👌

> 🚨 This alpha version of december is really alpha and you might need to restart ubuntu a lot as it doesn't clean up process well when you switch between the counting and the webcam view 🚨

You should be able to monitor the jetson from the UI we've build and count 🚗 🏍 🚚 !  


## 🛠 Development notes

### Technical architecture

![technical architecture open traffic cam](https://user-images.githubusercontent.com/533590/33723806-ed836ace-db6d-11e7-9d7b-12b79e3bcbed.jpg)

[Edit schema](https://docs.google.com/drawings/d/1GCYcnQeGTiifmr3Hc77x6RjCs5RZhMvgIQZZP_Yzbs0/edit?usp=sharing)

### Miscellaneous dev tips

#### Mount jetson filesystem as local filesystem on mac for dev

`sshfs -o allow_other,defer_permissions nvidia@192.168.1.222:/home/nvidia/Desktop/lab-traffic-cam /Users/tdurand/Documents/ProjetFreelance/Moovel/remote-lab-traffic-cam/`

#### SSH jetson

`ssh nvidia@192.168.1.222`

#### Install it and run:

```bash
yarn install
yarn run dev
```
