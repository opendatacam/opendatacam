## ⚙️ Customize Opendatacam

We offer several customization options:

- **Video input:** run from a file, change webcam resolution, change camera type (raspberry cam, usb cam...)

- **Neural network:** change YOLO weights files depending on your hardware capacity, desired FPS (tinyYOLO, full yolov3, yolov3-openimages ...)

- **Change display classes:** We default to mobility classes (car, bus, person...), but you can change this.

### Table of content

TODO generate

### General

All settings are in the [`config.json`](https://github.com/opendatacam/opendatacam/blob/master/config.json) file that you will find in the same directory you run the install script.

When you modify a setting, you will need to restart the docker container, you can do so by:

```
# List containers
sudo docker container list

# Restart container (find id from previous command)
sudo docker restart <containerID>
```

#### For a non-docker install of opendatacam:

You need to modify the config.json file located the `opendatacam` folder.

```
<PATH_TO_LAB_OPENDATACAM>/config.json
```

Once modified,  you just need to restart the node.js app (`npm run start`), no need to re-build it, it loads the config file at runtime.

### Run opendatacam on a video file instead of the webcam:

By default, opendatacam will try to pickup the usb webcam connected to your jetson. The settings is `VIDEO_INPUT` in the `config.json` file.

```json
"VIDEO_INPUT": "usbcam"
```

You can change this to run it on a pre-recorded file.

If you installed opendatacam through the default setup process you should have a `opendatacam_videos` folder where you ran the install script. Inside this folder you should also find a demo video: `demo.mp4`

You will need to copy the videos you want inside this folder. _(this folder gets mounted when running the container and docker has access to it)_

Once you do have the video file inside the `opendatacam_videos` folder, you can modify the `config.json` the following way:

1. Change `VIDEO_INPUT` to `"file"`

```json
"VIDEO_INPUT": "file"
```

2. Change `VIDEO_INPUTS_PARAMS > file` with the path to your file

```json
"VIDEO_INPUTS_PARAMS": {
  "file": "opendatacam_videos/demo.mp4"
}
```

Once `config.json` is saved, you only need to restart the docker container or restart your jetson and next time you access opendatacam, it will run on this file.

#### For a non-docker install of opendatacam:

Follow the same instruction but note the path you will put in `VIDEO_INPUTS_PARAMS > file` if relative to your `darknet` directory. 

For example if you have a `myvideo.mp4` file in your `darknet` directory, the settings should be:

```json
"VIDEO_INPUTS_PARAMS": {
  "file": "myvideo.mp4"
}
```

### Change neural network weights

You can change YOLO weights files depending on what objects you want to track and which hardware your are running opendatacam on.

Lighters weights file results in speed improvements, but loss in accuracy, for example `yolov3` run at ~1-2 FPS on Jetson Nano, ~5-6 FPS on Jetson TX2, and ~22 FPS on Jetson Xavier, and `yolov2-voc` runs at ~4-5 FPS on Jetson Nano, ~11-12 FPS on Jetson TX2, and realtime on Jetson Xavier.

In order to have good enough tracking accuracy for cars and mobility objects, from our experiments we found out that the sweet spot was to be able to run YOLO at leat at 8-9 FPS.

For a standard install of opendatacam, these are the default weights we pick depending on your hardware:

- Jetson nano: `yolov3-tiny`
- Jetson tx2: `yolov2-voc` _([yolov3-voc isn't available openly](https://github.com/AlexeyAB/darknet/issues/2557#issuecomment-473022989), if you trained it and want to share it, please ping us)_
- Jetson xavier: `yolov3`

But we enable you to change those settings, here is how to do it.

#### For a docker (standard install) of opendatacam:

We ship inside the docker container those three YOLO weights: [yolov3-tiny](https://pjreddie.com/media/files/yolov3-tiny.weights), [yolov2-voc](https://pjreddie.com/media/files/yolo-voc.weights), [yolov3](https://pjreddie.com/media/files/yolov3.weights)

In order to switch to another one, you just need to change the setting `NEURAL_NETWORK` in `config.json`.

```json
{
  "NEURAL_NETWORK": "yolov2-voc"
}
```

The config available are: `"yolov3"` , `"yolov3-tiny"`, `"yolov2-voc"`.

_TODO @tdurand improve this to enable people to use other weights with a Docker installed opendatacam ( other pre-trainer weights like [yolov3-openimages](https://pjreddie.com/media/files/yolov3-openimages.weights), [yolov3-spp](https://pjreddie.com/media/files/yolov3-spp.weights).. or custom trained ones)_

_Or even "non-official" weights : https://github.com/opendatacam/opendatacam/issues/86_

#### For a non-docker install of opendatacam:

The settings are the same as with the docker install, but you can also run from other weights file. ([yolov3-openimages](https://pjreddie.com/media/files/yolov3-openimages.weights), [yolov3-spp](https://pjreddie.com/media/files/yolov3-spp.weights)... or custom trained ones)

- copy the weights file inside the `/darknet` folder
- customize the `NEURAL_NETWORK_PARAMS` settings if you want to add some other weights that isn't one of the 3 pre-defined ones.
- change the `NEURAL_NETWORK` param to the key you defined in `NEURAL_NETWORK_PARAMS`

### Track only specific classes

_TODO @tdurand improve, where to find the classes names depending on which flavour of YOLO you are running_

By default, the opendatacam will track all the classes that the neural network is trained to track. In our case, YOLO is trained with the VOC dataset, here is the [complete list of classes](https://github.com/pjreddie/darknet/blob/master/data/voc.names)

You can restrict the opendatacam to some specific classes with the VALID_CLASSES option in the [config.json file](https://github.com/opendatacam/opendatacam/blob/master/config.json) .

For example, here is a way to only track buses and person:

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

*Extra note: the tracking algorithm might work better by allowing all the classes, in our test we saw that for some classes like Bike/Motorbike, YOLO had a hard time distinguishing them well, and was switching between classes across frames for the same object. By keeping all the detections and ignoring the class switch while tracking we saw that we can avoid losing some objects, this is [discussed here](https://github.com/opendatacam/opendatacam/issues/51#issuecomment-418019606)*

### Display custom classes

By default we are displaying the mobility classes: 

![Display classes](https://user-images.githubusercontent.com/533590/56987855-f0101c00-6b64-11e9-8bf4-afd83a53f991.png)

If you want to customize it you should modify the `DISPLAY_CLASSES` config.  

```json
"DISPLAY_CLASSES": [
  { "class": "bicycle", "icon": "1F6B2.svg"},
  { "class": "person", "icon": "1F6B6.svg"},
  { "class": "truck", "icon": "1F69B.svg"},
  { "class": "motorbike", "icon": "1F6F5.svg"},
  { "class": "car", "icon": "1F697.svg"},
  { "class": "bus", "icon": "1F683.svg"}
]
```

You can associate any icon that are in the `/static/icons/openmojis` folder. (they are from https://openmoji.org/, you can search the unicode icon name directly there)

For example:

```json
"DISPLAY_CLASSES": [
    { "class": "dog", "icon": "1F415.svg"},
    { "class": "cat", "icon": "1F431.svg"}
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

And after restarting Opendatacam you should get a white line when defining a counter area:

![Screenshot 2019-05-24 at 21 03 44](https://user-images.githubusercontent.com/533590/58361790-71f31c80-7e67-11e9-8b35-ecabb4a1e78a.png)

_NOTE: If you draw more line than COUNTER_COLORS defined, the lines will be black_

### Advanced settings

#### VIDEO_INPUTS_PARAMS:

Todo document how to change the webcam resolution, how to change the gstreamer pipeline, how to run from an IP cam.


### MONGODB_URL:

If you want to persist the data on a remote mongodb instance, you can change this variable.

### TRACKER_ACCURACY_DISPLAY:

The tracker accuracy layer shows a heatmap like this one:

![Screenshot 2019-06-12 at 18 59 54](https://user-images.githubusercontent.com/533590/59389349-78790380-8d44-11e9-9966-f5c7d2c212d7.png)

This heatmap highlights the areas where the tracker accuracy **isn't really good** to help you:

- Set counter lines where things are well tracked
- Decide if you should change the camera viewpoint

_Behind the hoods, it displays a metric of the tracker called "zombies" which represent the predicted bounding box when the tracked isn't able to asign a bounding box from the YOLO detections._

You can tweak all the settings of this display with the `TRACKER_ACCURACY_DISPLAY` setting.

| nbFrameBuffer          | Number of previous frames displayed on the heatmap                                                                                                                                                                       |
|------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
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
      "0.4":"blue",
      "0.6":"cyan",
      "0.7":"lime",
      "0.8":"yellow",
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


### Limitation with docker setup

- In order to use the raspberrycam with the Jetson nano, follow this guide: https://github.com/opendatacam/opendatacam/blob/master/doc/JETSON_NANO.md#run-opendatacam-container-with-raspberrypi-cam


