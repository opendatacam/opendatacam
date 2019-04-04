## ⚙️ Config options Opendatacam

### Config file:

Blablala todo

### 🗃 Run open data cam on a video file instead of the webcam feed:

*TODO update, this is from v1*

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


### Track only specific classes

*TODO update, this is from v1*

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