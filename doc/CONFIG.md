## ⚙️ Customize Opendatacam

We offer several customization options:

- **Video input:** run from a file, change webcam resolution, change camera type (raspberry cam, usb cam...)

- **Neural network:** change YOLO weights files depending on your hardware capacity, desired FPS (tinyYOLO, full yolov3, yolov3-openimages ...)

- **Change display classes:** We default to mobility classes (car, bus, person...), but you can change this

### General

All settings are in a `config.json` file that you will find in the same directory you run the install script.

When you modify a setting, you wil need to restart the docker container, you can do so by:

```
# List containers
sudo docker container list

# Restart container (find id from previous command)
sudo docker restart <containerID>
```

*TODO document what to do if you run without docker*

### Run open data cam on a video file instead of the webcam feed:

TODO

### Change neural network weights

TODO

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

In order to track all the classes (default value), you need to set it to:

```json
{
  "VALID_CLASSES": ["*"]
}
```

*Extra note: the tracking algorithm might work better by allowing all the classes, in our test we saw that for some classes like Bike/Motorbike, YOLO had a hard time distinguishing them well, and was switching between classes across frames for the same object. By keeping all the detections and ignoring the class switch while tracking we saw that we can avoid losing some objects, this is [discussed here](https://github.com/moovel/lab-opendatacam/issues/51#issuecomment-418019606)*

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


