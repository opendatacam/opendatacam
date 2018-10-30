# Open traffic cam (with YOLO)

This project is offline lightweight DIY solution to monitor urban landscape. After installing this software on the specified hardware (Nvidia Jetson board + Logitech webcam), you will be able to count cars, pedestrians, motorbikes from your webcam live stream.

Behind the scenes, it feeds the webcam stream to a neural network (YOLO darknet) and make sense of the generated detections.

It is very alpha and we do not provide any guarantee that this will work for your use case, but we conceived it as a starting point from where you can build-on & improve.

### Table of Contents

- [Hardware pre-requisite](#-hardware-pre-requisite)
- [Exports documentation](#-exports-documentation)
- [System overview](#-system-overview)
- [Step by Step install guide](#-step-by-step-install-guide)
  - [Flash Jetson Board:](#️flash-jetson-board)
  - [Prepare Jetson Board](#prepare-jetson-board)
  - [Configure Ubuntu to turn the jetson into a wifi access point](#configure-ubuntu-to-turn-the-jetson-into-a-wifi-access-point)
  - [Configure jetson to start in overclocking mode:](#configure-jetson-to-start-in-overclocking-mode)
  - [Install Darknet-net:](#install-darknet-net)
  - [Install the open-data-cam node app](#install-the-open-data-cam-node-app)
  - [Restart the jetson board and open http://IP-OF-THE-JETSON-BOARD:8080/](#-restart-the-jetson-board-and-open-httpip-of-the-jetson-board8080)
  - [Connect you device to the jetson](#connect-you-device-to-the-jetson)
  - [You are done](#you-are-done-)
  - [Automatic installation (experimental)](#️automatic-installation-experimental)
- [Troubleshoothing](#troubleshoothing)
- [Run open data cam on a video file instead of the webcam feed:](#-run-open-data-cam-on-a-video-file-instead-of-the-webcam-feed)
- [Development notes](#-development-notes)
  - [Technical architecture](#technical-architecture)
  - [Miscellaneous dev tips](#miscellaneous-dev-tips)

## 💻 Hardware pre-requisite

- Nvidia Jetson TX2
- Webcam Logitech C222 (or any usb webcam compatible with Ubuntu 16.04)
- A smartphone / tablet / laptop that you will use to operate the system

## 💾 Exports documentation

### Counter data export

This export gives you the counters results along with the unique id of each object counted.

```csv
"Timestamp","Counter","ObjectClass","UniqueID"
"2018-08-23T09:25:18.946Z","turquoise","car",9
"2018-08-23T09:25:19.073Z","green","car",14
"2018-08-23T09:25:19.584Z","yellow","car",1
"2018-08-23T09:25:20.350Z","green","car",13
"2018-08-23T09:25:20.600Z","turquoise","car",6
"2018-08-23T09:25:20.734Z","yellow","car",32
"2018-08-23T09:25:21.737Z","green","car",11
"2018-08-23T09:25:22.890Z","turquoise","car",40
"2018-08-23T09:25:23.145Z","green","car",7
"2018-08-23T09:25:24.423Z","turquoise","car",4
"2018-08-23T09:25:24.548Z","yellow","car",0
"2018-08-23T09:25:24.548Z","turquoise","car",4
```

### Tracker data export

This export gives you the raw data of all objects tracked with frame timestamps and positionning.

```javascript
[
  // 1 Frame
  {
    "timestamp": "2018-08-23T08:46:59.677Z" // Time of the frame
    // Objects in this frame
    "objects": [{
      "id": 13417, // unique id of this object
      "x": 257, // position and size on a 1280x720 canvas
      "y": 242,
      "w": 55,
      "h": 44,
      "bearing": 230,
      "name": "car"
    },{
      "id": 13418,
      "x": 312,
      "y": 354,
      "w": 99,
      "h": 101,
      "bearing": 230,
      "name": "car"
    }]
  },
  //...
  // Other frames ...
}
```

## ⚙ System overview

See [technical architecture](#technical-architecture) for a more detailed overview

![open traffic cam architecture](https://user-images.githubusercontent.com/533590/33759265-044eb90e-dc02-11e7-9533-9588f7f5c4a2.png)

[Edit schema](https://docs.google.com/drawings/d/1Pw3rsHGyj_owZUScRwBnZKb1IltA3f0R8yCmcdEbnr8/edit?usp=sharing)

## 🛠 Step by Step install guide

> NOTE: lots of those steps needs to be automated by integrating them in a docker image or something similar, for now need to follow the full procedure

### ⚡️Flash Jetson Board:

- Download [JetPack](https://developer.nvidia.com/embedded/downloads#?search=jetpack%203.1) to Flash your Jetson board with the linux base image and needed dependencies
- Follow the [install guide](http://docs.nvidia.com/jetpack-l4t/3.1/index.html#developertools/mobile/jetpack/l4t/3.1/jetpack_l4t_install.htm) provided by NVIDIA

> NOTE: You also can find a detailed video tutorial for flashing the Jetson board [here](https://www.youtube.com/watch?v=D7lkth34rgM).

### 🛩Prepare Jetson Board

- Update packages

  ```bash
  sudo apt-get update
  ```

- Install **cURL**

  ```bash
  sudo apt-get install curl
  ```

- install **git-core**

  ```bash
  sudo apt-get install git-core
  ```

- Install **nodejs** (v8):

  ```bash
  curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
  sudo apt-get install -y nodejs
  sudo apt-get install -y build-essential
  ```

- Install **ffmpeg** (v3)

  ```bash
  sudo add-apt-repository ppa:jonathonf/ffmpeg-3
  # sudo add-apt-repository ppa:jonathonf/tesseract (ubuntu 14.04 only!!)
  sudo apt update && sudo apt upgrade
  sudo apt-get install ffmpeg
  ```

- Optional: Install **nano**

  ```bash
  sudo apt-get install nano
  ```

### 📡Configure Ubuntu to turn the jetson into a wifi access point

- enable SSID broadcast

  add the following line to `/etc/modprobe.d/bcmdhd.conf`

  ```bash
  options bcmdhd op_mode=2
  ```

  further infos: [here](https://devtalk.nvidia.com/default/topic/910608/jetson-tx1/setting-up-wifi-access-point-on-tx1/post/4786912/#4786912)

- Configure hotspot via UI

  **follow this guide: <https://askubuntu.com/a/762885>**

- Define Address range for the hotspot network

  - Go to the file named after your Hotspot SSID in `/etc/NetworkManager/system-connections`

    ```bash
    cd /etc/NetworkManager/system-connections
    sudo nano <YOUR-HOTSPOT-SSID-NAME>
    ```

  - Add the following line to this file:

    ```
    [ipv4]
    dns-search=
    method=shared
    address1=192.168.2.1/24,192.168.2.1 <--- this line
    ```

  - Restart the network-manager

    ```bash
    sudo service network-manager restart
    ```

### 🚀Configure jetson to start in overclocking mode:

- Add the following line to `/etc/rc.local` before `exit 0`:

  ```bash
  #Maximize performances
  ( sleep 60 && /home/ubuntu/jetson_clocks.sh )&
  ```

- Enable `rc.local.service`

  ```bash
  chmod 755 /etc/init.d/rc.local
  sudo systemctl enable rc-local.service
  ```

### 👁Install Darknet-net:

**IMPORTANT** Make sure that **openCV** (v2) and **CUDA** will be installed via JetPack (post installation step)
if not: (fallback :openCV 2: [install script](https://gist.github.com/jayant-yadav/809723151f2f72a93b2ee1040c337427#file-opencv_install-sh), CUDA: no easy way yet)

- Install **libwsclient**:

  ```bash
  git clone https://github.com/PTS93/libwsclient
  cd libwsclient
  ./autogen.sh
  ./configure && make && sudo make install
  ```

- Install **liblo**:

  ```bash
  wget https://github.com/radarsat1/liblo/releases/download/0.29/liblo-0.29.tar.gz --no-check-certificate
  tar xvfz liblo-0.29.tar.gz
  cd liblo-0.29
  ./configure && make && sudo make install
  ```

- Install **json-c**:

  ```bash
  git clone https://github.com/json-c/json-c.git
  cd json-c
  sh autogen.sh
  ./configure && make && make check && sudo make install
  ```

- Install **darknet-net**:

  ```bash
  git clone https://github.com/meso-unimpressed/darknet-net.git
  ```

- Download **weight files**:

  link: [yolo.weight-files](https://pjreddie.com/media/files/yolo-voc.weights)

  Copy `yolo-voc.weights` to `darknet-net` repository path (root level)

  e.g.:

  ```
  darknet-net
    |-cfg
    |-data
    |-examples
    |-include
    |-python
    |-scripts
    |-src
    |# ... other files
    |yolo-voc.weights <--- Weight file should be in the root directory
  ```

  ```bash
  wget https://pjreddie.com/media/files/yolo-voc.weights --no-check-certificate
  ```

- Make **darknet-net**

  ```bash
  cd darknet-net
  make
  ```

### 🎥Install the open-data-cam node app

- Install **pm2** and **next** globally

  ```bash
  sudo npm i -g pm2
  sudo npm i -g next
  ```

- Clone **open_data_cam** repo:

  ```bash
  git clone https://github.com/moovel/lab-open-data-cam.git
  ```

- Specify **ABSOLUTE** `PATH_TO_YOLO_DARKNET` path in `lab-open-data-cam/config.json` (open data cam repo)

  e.g.:

  ```Json
  {
  	"PATH_TO_YOLO_DARKNET" : "/home/nvidia/darknet-net"
  }
  ```

- Install **open data cam**

  ```bash
  cd <path/to/open-data-cam>
  npm install
  npm run build
  ```

- Run **open data cam** on boot

  ```bash
  cd <path/to/open-data-cam>
  # launch pm2 at startup
  # this command gives you instructions to configure pm2 to
  # start at ubuntu startup, follow them
  sudo pm2 startup

  # Once pm2 is configured to start at startup
  # Configure pm2 to start the Open Traffic Cam app
  sudo pm2 start npm --name "open-data-cam" -- start
  sudo pm2 save
  ```

### 🏁 Restart the jetson board and open `http://IP-OF-THE-JETSON-BOARD:8080/`

### Connect you device to the jetson

> 💡 We should maybe set up a "captive portal" to avoid people needing to enter the ip of the jetson, didn't try yet 💡

When the jetson is started you should have a wifi "YOUR-HOTSPOT-NAME" available.

- Connect you device to the jetson wifi
- Open you browser and open http://IPOFTHEJETSON:8080
- In our case, IPOFJETSON is: http://192.168.2.1:8080

### You are done 👌

> 🚨 This alpha version of december is really alpha and you might need to restart ubuntu a lot as it doesn't clean up process well when you switch between the counting and the webcam view 🚨

You should be able to monitor the jetson from the UI we've build and count 🚗 🏍 🚚 !

### ‼️Automatic installation (experimental)

The install script for autmatic installation

> Setting up the access point is not automated yet! **follow this guide: https://askubuntu.com/a/762885 ** to set up the hotspot.

- run the `install.sh` script directly from GitHub

  ```bash
  wget -O - https://raw.githubusercontent.com/moovel/lab-opendatacam/master/install/install.sh | bash
  ```

## Troubleshoothing

To debug the app log onto the jetson board and inspect the logs from pm2 or stop the pm2 service (`sudo pm2 stop <pid>`) and start the app by using `sudo npm start` to see the console output directly.

- **Error**: `please specify the path to the raw detections file`

  Make sure that `ffmpeg` is installed and is above version `2.8.11`

- **Error**: `Could *not* find a valid build in the '.next' directory! Try building your app with '*next* build' before starting the server`

  Run `npm build` before starting the app

- Could not find darknet. Be sure to `make` darknet without `sudo` otherwise it will abort mid installation.

- **Error**: `cannot open shared object file: No such file or directory`

  Try reinstalling the liblo package.

- **Error**: `Error: Cannot stop process that is not running.`

  It is possible that a process with the port `8090` is causing the error. Try to kill the process and restart the board:

  ```bash
  sudo netstat -nlp | grep :8090
  sudo kill <pid>
  ```

## 🗃 Run open data cam on a video file instead of the webcam feed:

It is possible to run Open Data Cam on a video file instead of the webcam feed.

Before doing this you should be aware that the neural network (YOLO) will run on all the frames of the video file at ~7-8 FPS (best jetson speed) and do not play the file in real-time. If you want to simulate a real video feed you should drop the framerate of your video down to 7 FPS (or whatever frame rate your jetson board can run YOLO).

To switch the Open Data Cam to "video file reading" mode, you should go to the open-data-cam folder on the jetson.

1. `cd <path/to/open-data-cam>`

2. Then open [YOLO.js](https://github.com/moovel/lab-opendatacam/blob/master/server/processes/YOLO.js#L30), and uncomment those lines:

```javascript
YOLO.process = new forever.Monitor(
  [
    "./darknet",
    "detector",
    "demo",
    "cfg/voc.data",
    "cfg/yolo-voc.cfg",
    "yolo-voc.weights",
    "-filename",
    "YOUR_FILE_PATH_RELATIVE_TO_DARK_NET_FOLDER.mp4",
    "-address",
    "ws://localhost",
    "-port",
    "8080"
  ],
  {
    max: 1,
    cwd: config.PATH_TO_YOLO_DARKNET,
    killTree: true
  }
);
```

3. Copy the video file you want to run open data cam on in the `darknet-net` folder on the Jetson _(if you did auto-install, it is this path: ~/darknet-net)_

```
// For example, your file is `video-street-moovelab.mp4`, you will end up with the following in the darknet-net folder:

darknet-net
  |-cfg
  |-data
  |-examples
  |-include
  |-python
  |-scripts
  |-src
  |# ... other files
  |video-street-moovellab.mp4 <--- Video file
```

4. Then replace `YOUR_FILE_PATH_RELATIVE_TO_DARK_NET_FOLDER.mp4` placeholder in [YOLO.js](https://github.com/moovel/lab-opendatacam/blob/master/server/processes/YOLO.js#L37) with your file name, in this case `video-street-moovellab.mp4`

```javascript
// In our example you should end up with the following:

YOLO.process = new forever.Monitor(
  [
    "./darknet",
    "detector",
    "demo",
    "cfg/voc.data",
    "cfg/yolo-voc.cfg",
    "yolo-voc.weights",
    "-filename",
    "video-street-moovellab.mp4",
    "-address",
    "ws://localhost",
    "-port",
    "8080"
  ],
  {
    max: 1,
    cwd: config.PATH_TO_YOLO_DARKNET,
    killTree: true
  }
);
```

5. After doing this you should re-build the Open Data Cam node app.

```
npm run build
```

_You should be able to use any video file that are readable by OpenCV, which is what YOLO implementation use behind the hoods to decode the video stream_

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
