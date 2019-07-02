## Jetson Nano

Do a specific readme to explain how to setup opendatacam on the jeton nano with raspberry cam

### setup nano (TODO)

https://jkjung-avt.github.io/setting-up-nano/


- Swap partition : https://github.com/JetsonHacksNano/installSwapfile

- Explain Jumper on J48 depending on microSD power or jack

On powerbank, run with  `sudo nvpmodel -m 1`

### Run opendatacam container with raspberrypi cam

### Setup

```bash
# Get scripts TODO @tdurand replace v2
wget -N https://raw.githubusercontent.com/opendatacam/opendatacam/v2/docker/run-jetson/setup-raspberrycam-proxy.sh
wget -N https://raw.githubusercontent.com/opendatacam/opendatacam/v2/docker/run-jetson/run-raspberrycam-proxy.sh
# Give run permission
sudo chmod 777 run-raspberrycam-proxy.sh setup-raspberrycam-proxy.sh

# Setup proxy dependencies
sudo ./setup-raspberrycam-proxy.sh

# Install cronjob to start run-raspberrycam-proxy on boot
cat <(crontab -l) <(echo "@reboot /bin/sh $(pwd)/run-raspberrycam-proxy.sh") | crontab -

# Reboot your nano
sudo reboot
```

Then you need to choose the usbcam-alt options in the config.json (more details on the config documentation TODO @tdurand add link)

- Open `config.json`
- Replace `VIDEO_INPUT` param with `"usbcam-alt"` _(NOTE: Under the hood, the important thing is that OpenCV get this gstreamer pipeline in entry: `v4l2src device=/dev/video2 ! video/x-raw, framerate=30/1, width=640, height=360 ! videoconvert ! appsink`)_


### Why

From the docker container, we can't access directly the raspberrypi camera ( [more background](https://devtalk.nvidia.com/default/topic/1051653/jetson-nano/access-to-raspberry-cam-nvargus-daemon-from-docker-container/post/5338140/#5338140) )

In order to do so we need to:

- Start a process that proxys the Raspberry cam into an usb cam
- Pick this "fake" usb cam from the docker container


