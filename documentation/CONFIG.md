## ⚙️ Customize OpenDataCam

We offer several customization options:

- **Video input:** run from a file, change webcam resolution, change camera type (raspberry cam, usb cam...)

- **Neural network:** change YOLO weights files depending on your hardware capacity, desired FPS (tinyYOLOv4, full yolov4 ...)

- **Change display classes:** We default to mobility classes (car, bus, person...), but you can change this.

### Table of content

- [⚙️ Customize OpenDataCam](#️-customize-opendatacam)
  - [Table of content](#table-of-content)
  - [General](#general)
    - [For a standard install of OpenDataCam](#for-a-standard-install-of-opendatacam)
    - [For a non-docker install of OpenDataCam](#for-a-non-docker-install-of-opendatacam)
  - [Run opendatacam on a video file](#run-opendatacam-on-a-video-file)
    - [Specificities of running on a file](#specificities-of-running-on-a-file)
  - [Neural network weights](#neural-network-weights)
  - [Track only specific classes](#track-only-specific-classes)
  - [Display custom classes](#display-custom-classes)
  - [Customize pathfinder colors](#customize-pathfinder-colors)
  - [Customize Counter colors](#customize-counter-colors)
  - [Advanced settings](#advanced-settings)
    - [Video input](#video-input)
      - [Run from an usbcam](#run-from-an-usbcam)
      - [Run from a file](#run-from-a-file)
      - [Run from IP cam](#run-from-ip-cam)
      - [Run from Raspberry Pi cam (Jetson nano)](#run-from-raspberry-pi-cam-jetson-nano)
      - [Change webcam resolution](#change-webcam-resolution)
    - [Use Custom Neural Network weights](#use-custom-neural-network-weights)
    - [Tracker settings](#tracker-settings)
    - [Counter settings](#counter-settings)
    - [MongoDB URL](#mongodb-url)
    - [Ports](#ports)
    - [Tracker accuracy display](#tracker-accuracy-display)
    - [Use Environment Variables](#use-environment-variables)
      - [Without Docker](#without-docker)
      - [With docker-compose](#with-docker-compose)

### General

#### For a standard install of OpenDataCam

All settings are in the [`config.json`](https://github.com/opendatacam/opendatacam/blob/master/config.json) file that you will find in the same directory you run the install script.

When you modify a setting, you will need to restart the docker container, you can do so by:

```
# Go to the directory you ran install script (where is your docker-compose.yml file)

# Stop container
sudo docker-compose down

# Restart container (after modifying the config.json file for example)
sudo docker-compose restart

# Start container
# detached mode
sudo docker-compose up -d
# interactive mode
sudo docker-compose up
```

#### For a non-docker install of OpenDataCam

You need to modify the config.json file located the `opendatacam` folder.

```
<PATH_TO_OPENDATACAM>/config.json
```

Once modified,  you just need to restart the node.js app (`npm run start`), no need to re-build it, it loads the config file at runtime.

### Run opendatacam on a video file

By default, OpenDataCam will run on a demo video file, if you want to change it, you should just drag & drop on the UI the new file.

[Learn more about the others video inputs available (IP camera, Rasberry Pi in the Advanced use section)](#video-input)

#### Specificities of running on a file

- Opendatacam will restart the video file when it reaches the end
- When you click on record, Opendatacam will reload the file to start the recording at the beggining
- **LIMITATION: it will only record from frame nº25**


### Neural network weights

You can change YOLO weights files depending on what objects you want to track and which hardware your are running opendatacam on.

Lighters weights file results in speed improvements, but loss in accuracy, for example `yolov4` run at ~1-2 FPS on Jetson Nano, ~5-6 FPS on Jetson TX2, and ~22 FPS on Jetson Xavier

In order to have good enough tracking accuracy for cars and mobility objects, from our experiments we found out that the sweet spot was to be able to run YOLO at least at 8-9 FPS.

For a standard install of opendatacam, these are the default weights we pick depending on your hardware:

- Jetson Nano: `yolov4-tiny`
- Jetson Xavier: `yolov4`
- Desktop install: `yolov4`

If you want to use other weights, please see [use custom weigths](#use-custom-neural-network-weights).

### Track only specific classes

By default, the opendatacam will track all the classes that the neural network is trained to track. In our case, YOLO is trained with the VOC dataset, here is the [complete list of classes](https://github.com/pjreddie/darknet/blob/master/data/voc.names)

You can restrict the opendatacam to some specific classes with the VALID_CLASSES option in the [config.json file](https://github.com/opendatacam/opendatacam/blob/master/config.json) .

_Find which classes YOLO is tracking depending on the weights you are running. For example [yolov4 trained on COCO dataset classes](https://github.com/AlexeyAB/darknet/blob/master/data/coco.names)_

Here is a way to only track buses and person:

```json
{
  "VALID_CLASSES": ["bus","car"]
}
```

In order to track all the classes (default value), you need to set it to:

```json
{
  "VALID_CLASSES": ["*"]
}
```

*Extra note: the tracking algorithm might work better by allowing all the classes, in our test we saw that for some classes like Bike/Motorbike, YOLO had a hard time distinguishing them well, and was switching between classes across frames for the same object. By keeping all the detections classes we saw that we can avoid losing some objects, this is [discussed here](https://github.com/opendatacam/opendatacam/issues/51#issuecomment-418019606)*

### Display custom classes

By default we are displaying the mobility classes:

![Display classes](https://user-images.githubusercontent.com/533590/56987855-f0101c00-6b64-11e9-8bf4-afd83a53f991.png)

If you want to customize it you should modify the `DISPLAY_CLASSES` config.  

```json
"DISPLAY_CLASSES": [
  { "class": "bicycle", "hexcode": "1F6B2"},
  { "class": "person", "hexcode": "1F6B6"},
  { "class": "truck", "hexcode": "1F69B"},
  { "class": "motorbike", "hexcode": "1F6F5"},
  { "class": "car", "hexcode": "1F697"},
  { "class": "bus", "hexcode": "1F683"}
]
```

You can associate any icon that are in the `public/static/icons/openmojis` folder. (they are from https://openmoji.org/, you can search the hexcode / unicode icon id directly there)

For example:

```json
"DISPLAY_CLASSES": [
    { "class": "dog", "icon": "1F415"},
    { "class": "cat", "icon": "1F431"}
  ]
```

![Display classes custom](https://user-images.githubusercontent.com/533590/56992341-3028cc00-6b70-11e9-8fd8-d7e405fe4d54.png)


*LIMITATION: You can display a maximum of 6 classes, if you add more, it will just display the first 6 classes*

### Customize pathfinder colors

You can change the `PATHFINDER_COLORS` variable in the `config.json`. The app picks randomly for each new tracked object a color inside it. The colors need to be in HEX format.

```json
"PATHFINDER_COLORS": [
  "#1f77b4",
  "#ff7f0e",
  "#2ca02c",
  "#d62728",
  "#9467bd",
  "#8c564b",
  "#e377c2",
  "#7f7f7f",
  "#bcbd22",
  "#17becf"
]
```

For example, with only 2 colors:


```json
"PATHFINDER_COLORS": [
  "#1f77b4",
  "#e377c2"
]
```

![Demo 2 colors](https://user-images.githubusercontent.com/533590/58332468-ab993880-7e11-11e9-831a-5f958442e015.jpg)


### Customize Counter colors

You can change the `COUNTER_COLORS` variable in the `config.json`. As you draw counter lines, the app will pick the colors in the order you specified them.

You need to add "key":"value" for counter lines, the key should be the label of the color (without space, numbers or special characters), and the value the color in HEX.

For example, you can modify the default from:

```json
"COUNTER_COLORS": {
  "yellow": "#FFE700",
  "turquoise": "#A3FFF4",
  "green": "#a0f17f",
  "purple": "#d070f0",
  "red": "#AB4435"
}
```

To 

```json
"COUNTER_COLORS": {
  "white": "#fff"
}
```

And after restarting OpenDataCam you should get a white line when defining a counter area:

![Screenshot 2019-05-24 at 21 03 44](https://user-images.githubusercontent.com/533590/58361790-71f31c80-7e67-11e9-8b35-ecabb4a1e78a.png)

_NOTE: If you draw more line than COUNTER_COLORS defined, the lines will be black_

### Advanced settings

#### Video input

OpenDataCam is capable to take in input several video streams: pre-recorded file, usbcam, raspberry cam, remote IP cam etc etc..

This is configurable via the `VIDEO_INPUT` ans `VIDEO_INPUTS_PARAMS` settings.

```json
"VIDEO_INPUTS_PARAMS": {
  "file": "opendatacam_videos/demo.mp4",
  "usbcam": "v4l2src device=/dev/video0 ! video/x-raw, framerate=30/1, width=640, height=360 ! videoconvert ! appsink",
  "raspberrycam": "nvarguscamerasrc ! video/x-raw(memory:NVMM),width=1280, height=720, framerate=30/1, format=NV12 ! nvvidconv ! video/x-raw, format=BGRx, width=640, height=360 ! videoconvert ! video/x-raw, format=BGR ! appsink",
  "remote_cam": "YOUR IP CAM STREAM (can be .m3u8, MJPEG ...), anything supported by opencv",
  "remote_hls_gstreamer": "souphttpsrc location=http://YOUR_HLSSTREAM_URL_HERE.m3u8 ! hlsdemux ! decodebin ! videoconvert ! videoscale ! appsink"
}
```

With the default installation, OpenDataCam will have `VIDEO_INPUT` set to `usbcam`. See below how to change this

_Technical note:_

Behind the hoods, this config input becomes [the input of the darknet](https://github.com/opendatacam/opendatacam/blob/master/server/processes/YOLO.js#L32) process which then get [fed into OpenCV VideoCapture()](https://github.com/AlexeyAB/darknet/blob/master/src/image_opencv.cpp#L577).

As we compile OpenCV with Gstreamer support when installing OpenDataCam, we can use any [Gstreamer pipeline](http://www.einarsundgren.se/gstreamer-basic-real-time-streaming-tutorial/) as input + other VideoCapture supported format like video files / IP cam streams. 

You can add your own gstreamer pipeline for your needs by adding an entry to `"VIDEO_INPUTS_PARAMS"`

##### Run from an usbcam

1. Verify if you have an usbcam detected

```bash
ls /dev/video*
# Output should be: /dev/video0
#
```

2. Change `VIDEO_INPUT` to `"usbcam"`

```json
"VIDEO_INPUT": "usbcam"
```

3. (Optional) If your device is on `video1` or `video2` instead of default `video0`, change `VIDEO_INPUTS_PARAMS > usbcam` to your video device, for example if /dev/video1

```json
"VIDEO_INPUTS_PARAMS": {
  "usbcam": "v4l2src device=/dev/video1 ! video/x-raw, framerate=30/1, width=640, height=360 ! videoconvert ! appsink"
}
```

##### Run from a file

You have two options to run from a file:

- EASY SOLUTION: Drag and drop the file on the UI , OpenDataCam will restart on it

- Read a file from the filesystem directly by setting the path in the `config.json`


For example, you have a `file.mp4` you want to run OpenDataCam on :

**For a docker (standard install) of OpenDataCam:**

You need to mount the file in the docker container, copy the file in the folder where you have the `docker-compose.yml` file

- create a folder called `opendatacam_videos` and put the file in it

- mount the `opendatacam_videos` folder using `volumes` in the `docker-compose.yml` file

```yaml
volumes:
  - './config.json:/var/local/opendatacam/config.json'
  - './opendatacam_videos:/var/local/darknet/opendatacam_videos'
```

Once you do have the video file inside the `opendatacam_videos` folder, you can modify the `config.json` the following way:

1. Change `VIDEO_INPUT` to `"file"`

```json
"VIDEO_INPUT": "file"
```
 
2. Change `VIDEO_INPUTS_PARAMS > file` with the path to your file
 
```json
"VIDEO_INPUTS_PARAMS": {
  "file": "opendatacam_videos/file.mp4"
}
```

Once `config.json` is saved, you only need to restart the docker container using

 ```
sudo docker-compose restart
```

**For a non docker install of OpenDataCam:**

Same steps as above but instead of mountin the `opendatacam_videos` you should just create in in the `/darknet` folder.

##### Run from IP cam

1. Change `VIDEO_INPUT` to `"remote_cam"`

```json
"VIDEO_INPUT": "remote_cam"
```

2. Change `VIDEO_INPUTS_PARAMS > remote_cam` to your IP cam stream, for example

```json
"VIDEO_INPUTS_PARAMS": {
  "remote_cam": "http://162.143.172.100:8081/-wvhttp-01-/GetOneShot?image_size=640x480&frame_count=1000000000"
}
```

NB: this IP cam won't work, it is just an example. Only use IP Cam you own yourself.

##### Run from Raspberry Pi cam (Jetson nano)

**For a docker (standard install) of OpenDataCam:**

Not supported yet, follow https://github.com/opendatacam/opendatacam/issues/178 for updates

**For a non docker install of OpenDataCam:**

1. Change `VIDEO_INPUT` to `"raspberrycam"`

```json
"VIDEO_INPUT": "raspberrycam"
```

2. Restart node.js app


##### Change webcam resolution

As explained on the Technical note above, you can modify the Gstreamer pipeline as you like, by default we use a 640x360 feed from the webcam.

If you want to change this, you need to:

- First know which resolution your webcam supports, run `v4l2-ctl --list-formats-ext`.

- Let's say we will use `1280x720`

- Change the Gstreamer pipeline accordingly: `"v4l2src device=/dev/video0 ! video/x-raw, framerate=30/1, width=1280, height=720 ! videoconvert ! appsink"`

- Restart OpenDataCam

_NOTE: Increasing webcam resolution won't increase OpenDataCam accuracy, the input of the neural network is 400x400 max, and it might cause the UI to have logs as the MJPEG stream becomes very slow for higher resolution_

#### Use Custom Neural Network weights

**For a docker (standard install) of OpenDataCam:**

We ship inside the docker container those YOLO weights:

- Jetson Nano: `yolov4-tiny`
- Jetson Xavier: `yolov4`
- Desktop install: `yolov4`

In order to switch to another one you need:

- to mount the necessary files into the darknet folder of the docker container so OpenDataCam has access to those new weights.

- change the `config.json` accordingly

For example, if you want to use `yolov3-tiny-prn` , you need to:

- download `yolov3-tiny-prn.weights` the same directory as the `docker-compose.yml` file

- (optional) download the `.cfg`, `.data` and `.names` files if they are custom (not default darknet)

- mount the weights file using `volumes` in the `docker-compose.yml` file

```yaml
volumes:
  - './config.json:/var/local/opendatacam/config.json'
  - './yolov3-tiny-prn.weights:/var/local/darknet/yolov3-tiny-prn.weights'
```

- (optional) if you have custom `.cfg`,`.data` and `.names` files you should mount them too


```yaml
volumes:
  - './config.json:/var/local/opendatacam/config.json'
  - './yolov3-tiny-prn.weights:/var/local/darknet/yolov3-tiny-prn.weights'
  - './coco.data:/var/local/darknet/cfg/coco.data'
  - './yolov3-tiny-prn.cfg:/var/local/darknet/cfg/yolov3-tiny-prn.cfg'
  - './coco.names:/var/local/darknet/cfg/coco.names'
```

- change the `config.json`

- add an entry to the `NEURAL_NETWORK_PARAMS` setting in `config.json`.

```json
"yolov3-tiny-prn": {
  "data": "cfg/coco.data",
  "cfg": "cfg/yolov3-tiny-prn.cfg",
  "weights": "yolov3-tiny-prn.weights"
}
```

- change the `NEURAL_NETWORK` param to the key you defined in `NEURAL_NETWORK_PARAMS`

```json
"NEURAL_NETWORK": "yolov3-tiny-prn"
```

- If you've added new volumes to your `docker-compose.yml`, you need to update the container using : 

```
sudo docker-compose up -d
```

- Otherwise, if you just updated files from existing volumes, you need to restart the container using  : 

```
sudo docker-compose restart
```

**For a non-docker install of opendatacam:**

It is the same as above, but instead of mounting the files in the docker container you just need to directly copy them in the `/darknet` folder

- copy `.weights` files , `.cfg` and `.data` file into the darknet folder

- Sames steps at above

- Restart the node.js app (not need to recompile)

#### Tracker settings

You can tweak some settings of the tracker to optimize OpenDataCam better for your needs

```json
"TRACKER_SETTINGS": {
  "objectMaxAreaInPercentageOfFrame": 80,
  "confidence_threshold": 0.2,
  "iouLimit": 0.05,
  "unMatchedFrameTolerance": 5
}
```

- `objectMaxAreaInPercentageOfFrame`: Filters out Objects which area (width * height) is higher than a certain percentage of the total frame area

- `confidence_threshold`: Filters out object that have less than this confidence value (value given by neural network)

- `iouLimit`: When tracking from frame to frame exclude object from beeing matched as same object as previous frame (same id) if their IOU (Intersection over union) is lower than this. More details on how tracker works here: https://github.com/opendatacam/node-moving-things-tracker/blob/master/README.md#how-does-it-work

- `unMatchedFrameTolerance`: This the number of frame we keep predicting the object trajectory if it is not matched by the next frame list of detections. Setting this higher will cause less ID switches, but more potential false positive with an ID going to another object.

#### Counter settings

```json
"COUNTER_SETTINGS": {
  "minAngleWithCountingLineThreshold": 5,
  "computeTrajectoryBasedOnNbOfPastFrame": 5
}
```

- `minAngleWithCountingLineThreshold`: Count items crossing the counting line only if the angle between their trajectory and the counting line is superior to this angle (in degree). 90 degree would count nothing (or only perfectly perpendicular object) whereas 0 will count everything.

![Counting line angle illustration](https://user-images.githubusercontent.com/533590/84757717-c3b39b00-afc4-11ea-8aef-e4900d7f6352.jpg)

- `computeTrajectoryBasedOnNbOfPastFrame`: This tells the counting algorithm to compute the trajectory to determine if an object crosses the line based on this number of past frame. As you can see below in reality the trajectory of the center of the bbox given by YOLO is moving a little bit from frame to frame, so this can smooth out and be more reliable to determine if object is crossing the line and the value of the angle of crossing

![CounterBuffer](https://user-images.githubusercontent.com/533590/84810794-1ebcb080-b00c-11ea-9cae-065fc066e10f.jpg)

NB: if the object has changed ID in the past frames, it will take the last past frame known with the same ID.

#### MongoDB URL

If you want to persist the data on a remote mongodb instance, you can change the setting `MONGODB_URL` .

By default the Mongodb will be persisted in the `/data/db` directory of your host machine

#### Ports

You can modify the default ports used by OpenDataCam. 

```json
"PORTS": {
  "app": 8080,
  "darknet_json_stream": 8070,
  "darknet_mjpeg_stream": 8090
}
```

#### Tracker accuracy display

The tracker accuracy layer shows a heatmap like this one:

![Screenshot 2019-06-12 at 18 59 54](https://user-images.githubusercontent.com/533590/60195072-c6106880-983a-11e9-8edd-178a38d3e2a2.JPG)

This heatmap highlights the areas where the tracker accuracy **isn't really good** to help you:

- Set counter lines where things are well tracked
- Decide if you should change the camera viewpoint

_Behind the hoods, it displays a metric of the tracker called "zombies" which represent the predicted bounding box when the tracked isn't able to asign a bounding box from the YOLO detections._

You can tweak all the settings of this display with the `TRACKER_ACCURACY_DISPLAY` setting.

| nbFrameBuffer          | Number of previous frames displayed on the heatmap                                                                                                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| radius                 | Radius of the points displayed on the heatmap (in % of the width of the canvas)                                                                                                                                          |
| blur                   | Blur of the points displayed on the heatmap (in % of the width of the canvas)                                                                                                                                            |
| step                   | For each point displayed, how much the point should contribute to the increase of the heapmap value (the range is between 0-1), increasing this will cause the heatmap to reach the higher values of the gradient faster |
| gradient               | Colors gradient, insert as many values as you like between 0-1 (hex value supported, ex: "#fff" or "white")                                                                                                              |
| canvasResolutionFactor | In order to improve performance, the tracker accuracy canvas resolution is downscaled by a factor of 10 by default (set a value between 0-1)                                                                             |

```json
"TRACKER_ACCURACY_DISPLAY": {
  "nbFrameBuffer": 300,
  "settings": {
    "radius": 3.1,
    "blur": 6.2,
    "step": 0.1,
    "gradient": {
      "0.4":"orange",
      "1":"red"
    },
    "canvasResolutionFactor": 0.1
  }
}
```

For example, if you change the gradient with:

```json
"gradient": {
  "0.4":"yellow",
  "0.6":"#fff",
  "0.7":"red",
  "0.8":"yellow",
  "1":"red"
}
```

![Other gradient](https://user-images.githubusercontent.com/533590/59389118-ec66dc00-8d43-11e9-8310-309da6ab42e1.png)

#### Use Environment Variables

Some of the entries in `config.json` can be overwritten using environment variables. Currently this is the `PORTS` object and the setting for the `MONGODB_URL`. See the file [.env.example](../.env.example) as an example how to set them. Make sure the use the exact same names or opendatacam will fall back to `config.json`, and if that is not present the general defaults.

##### Without Docker

If you are running opendatacam without docker you can set these by:

- adding a file called `.env` to the root of the project, 
  then these will be picked up by the [dotenv](https://www.npmjs.com/package/dotenv) package.
- adding these variables to your `.bashrc` or `.zshrc` depending on what shell you are using or any other configuration file that gets loaded into your shell sessions.
- adding them to the command you use to start the opendatacam,
  for example in bash `MONGODB_URL=mongodb://mongo:27017 PORT_APP=8080 PORT_DARKNET_MJPEG_STREAM=8090 PORT_DARKNET_JSON_STREAM=8070 node server.js`
   If you are on windows we suggest using the [`cross-env` package](https://www.npmjs.com/package/cross-env) to set these variables.

##### With docker-compose

If you are running opendatacam with `docker-compose.yml` you can set them as [environment section](https://docs.docker.com/compose/environment-variables/) to the service opendatacam like shown below.

```yml
service:
  opendatacam:
    environment:
      - PORT_APP=8080
```

You also can can declare these environment variables [in a `.env` file](https://docs.docker.com/compose/env-file/) in the folder where the `docker-compose` command is invoked. Then these will be available within the `docker-compose.yml` file and you can pass them through to the container like shown below.

The `.env` file.
```env
PORT_APP=8080
```

the `docker-compose.yml` file.

```yml
service:
  opendatacam:
    environment:
      - PORT_APP
```

There is also the possibility the have the `.env` in the directory where the `docker-compose` command is executed and add the `env_file` section to the docker-compose.yml configuration.

```yml
service:
  opendatacam:
    env_file:
      - ./.env
```

You also can add these variables to the call of  the `docker-compose` command. For example like this `docker-compose up -e PORT_APP=8080`. 



