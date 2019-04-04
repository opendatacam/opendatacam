# Open data cam (with YOLO)

This project is offline lightweight DIY solution to monitor urban landscape. After installing this software on the specified hardware (Nvidia Jetson board + Logitech webcam), you will be able to count cars, pedestrians, motorbikes from your webcam live stream.

Behind the scenes, it feeds the webcam stream to a neural network (YOLO darknet) and make sense of the generated detections.

It is very alpha and we do not provide any guarantee that this will work for your use case, but we conceived it as a starting point from where you can build-on & improve.

### Table of Contents

TODO

## 💻 Hardware pre-requisite

- Nvidia Jetson TX2 / Xavier
- Webcam Logitech C222 (or any usb webcam compatible with Ubuntu 18.04)
- A smartphone / tablet / laptop that you will use to operate the system

## Install steps

### ⚡️Flash Jetson Board:

#### Jetson TX2

*We support jetpack version 4.2+*

- Since march 2019, Nvidia has released a SDK manager tool to flash jetson, complete doc is available here: https://docs.nvidia.com/sdk-manager/index.html 
- You need a machine running Ubuntu to install it *(that is not the jetson)*, download link is here: https://developer.nvidia.com/embedded/downloads
- Then follow the steps of the documentation: https://docs.nvidia.com/sdk-manager/install-with-sdkm-jetson/index.html 

**Common issues:**

- When you reach the flashing part, the automatic mode didn't work for us when writing this doc, we did flash using manual mode. *(You need to put in [recovery mode manualy](https://www.youtube.com/watch?v=HaDy9tryzWc) and verify it with this [command](https://devtalk.nvidia.com/default/topic/1006401/jetson-tx2/not-able-to-get-into-recovery-mode/post/5205375/#5205375))*

- If you get `LOST CONNEXION to jetson` , try replug-in the usb cable

#### Jetson Xavier

TODO

### Run Opendatacam docker image

```bash
# Get the darknet-docker script (TODO @tdurand remove v2 when releasing)
wget https://raw.githubusercontent.com/moovel/lab-opendatacam/v2/docker/run-jetson/darknet-docker.sh

# Chmod to give exec permissions
chmod 777 darknet-docker.sh

# Pull and run interactively the docker image
sudo ./darknet-docker.sh run --rm -it tdurand/opendatacam:v0.0.1
```

NOTE Troubleshooting docker

"nvbuf_utils: Could not get EGL display connection" doesn't mean there is an error, it's just it does not start X, if stuck here means something prevent Opencv to read the webcam... but doesn't mean it doen't have access to the webcam... 

## How to run opendatacam without docker

Link to RUN_WITHOUT_DOCKER.md

## How to create / update the docker image

Link to CREATE_DOCKER_IMAGE.md

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



## Troubleshoothing

TODO UPDATE this

To debug the app log onto the jetson board and inspect the logs from pm2 or stop the pm2 service (`sudo pm2 stop <pid>`) and start the app by using `sudo npm start` to see the console output directly.

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

## 🗃 Run open data cam on a video file instead of the webcam feed:

TODO update

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


## 🎛 Advanced settings

### Track only specific classes

By default, the opendatacam will track all the classes that the neural network is trained to track. In our case, YOLO is trained with the VOC dataset, here is the [complete list of classes](https://github.com/pjreddie/darknet/blob/master/data/voc.names)

You can restrict the opendatacam to some specific classes with the VALID_CLASSES option in the [config.json file](https://github.com/moovel/lab-opendatacam/blob/master/config.json) .

For example, here is a way to only track buses and person:

```json
{
  "VALID_CLASSES": ["bus","car"]
}
```

If you change this config option, you will need to re-build the project by running `npm run build`.

In order to track all the classes (default value), you need to set it to:

```json
{
  "VALID_CLASSES": ["*"]
}
```

*Extra note: the tracking algorithm might work better by allowing all the classes, in our test we saw that for some classes like Bike/Motorbike, YOLO had a hard time distinguishing them well, and was switching between classes across frames for the same object. By keeping all the detections and ignoring the class switch while tracking we saw that we can avoid losing some objects, this is [discussed here](https://github.com/moovel/lab-opendatacam/issues/51#issuecomment-418019606)*
 


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

