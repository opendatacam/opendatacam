## Jetson Nano

### Limitations

Jetson nano has two power mode, 5W and 10W.

Once Opendatacam is setup and __running without a monitor__, it runs perfectly fine on 5W powermode _(which is nice because you can power it with a powerbank)_.

### Shopping list

The minimum setup for 5W power mode is:

- 1 Jetson nano
- 1 [Raspberrycam module v2](https://www.raspberrypi.org/products/camera-module-v2/) or one of [the compatible camera](https://elinux.org/Jetson_Nano#Cameras)
- 1 Wifi dongle , [this one is compatible](https://www.edimax.com/edimax/merchandise/merchandise_detail/data/edimax/in/wireless_adapters_n150/ew-7811un/) out of the box, or [see compatibility list](https://elinux.org/Jetson_Nano#Wireless).
- 1 MicroSD card (at least 32 GB and 100 MB/s)
- 1 Power supply: either a [5V⎓2A Micro-USB adapter](https://www.adafruit.com/product/1995) or a Powerbank with min 2A output.

For 10W power mode _(this is good for desktop use when you plug the screen, the mouse, the keyboard, it draws powers from the peripherics)_

- Power supply: [5V⎓4A DC barrel jack adapter, 5.5mm OD x 2.1mm ID x 9.5mm length, center-positive](https://www.adafruit.com/product/1466)
- 1x [2.54mm Standard Computer Jumper](https://www.amazon.com/2-54mm-Standard-Computer-Jumper-100pack/dp/B00N552DWK/) This is used on the J48 Pin when supplying power from the jack entry instead of the microUSB. It tells the jetson to by-pass the microUSD power entry.

For setup:

- 1 usb mouse
- 1 usb keyboard
- 1 screen (HDMI or Displayport)
- And for faster connexion, a ethernet cable to your router

Learn more about Jetson nano ecosystem: [https://elinux.org/Jetson_Nano#Ecosystem_Products_and_Sensors](https://elinux.org/Jetson_Nano#Ecosystem_Products_and_Sensors)


### Setup Opendatacam

## Flash Jetson Nano:

Follow [Flashing guide](FLASH_JETSON.md#Jetson-Nano) (don't forget to verify if CUDA is in your PATH)

## Set correct Powermode according to your Power supply

### Using microUSB

Using microUSD with a powerbank or a 5V⎓2A power supply, you just need to plug-in and the Jetson Nano will start when connected to it.

When started, we advise you to set the powermode of the Jetson nano to 5W so it won't crash, to do so, open a terminal and run:

```
sudo nvpmodel -m 1
```

To switch back to 10W power mode (default)

```
sudo nvpmodel -m 0
```

### Using barrel jack (5V - 4A)

When working with the Jetson nano with the monitor connected, we advise to use the barrel jack power. In order to do so you need first to put a jumper on the J48 pin (more details on Jetson nano power supply)

![jumper](https://user-images.githubusercontent.com/533590/60701138-edca9500-9efa-11e9-8c51-6e2b421ed44b.png)

By default, the Jetson nano will already run on the 10W power mode, but you can make sure it is by running:

```
sudo nvpmodel -m 0
```

## Setup a swap partition:

In order to reduce memory pressure (and crashes), it is a good idea to setup a 6GB swap partition. _(Nano has only 4GB of RAM)_

```bash
git clone https://github.com/JetsonHacksNano/installSwapfile 
cd installSwapfile
./installSwapfile
```

### Run Opendatacam container with raspberrypi cam

#### Why

From the docker container, we can't access directly the raspberrypi camera ( [more background](https://devtalk.nvidia.com/default/topic/1051653/jetson-nano/access-to-raspberry-cam-nvargus-daemon-from-docker-container/post/5338140/#5338140) )

In order to do so we need to:

- Start a process that proxys the Raspberry cam feed into an usb cam
- Pick this "fake" usb cam from the docker container

#### Setup

```bash
# Get scripts
wget -N https://raw.githubusercontent.com/opendatacam/opendatacam/master/docker/run-jetson/setup-raspberrycam-proxy.sh
wget -N https://raw.githubusercontent.com/opendatacam/opendatacam/master/docker/run-jetson/run-raspberrycam-proxy.sh
# Give run permission
sudo chmod 777 run-raspberrycam-proxy.sh setup-raspberrycam-proxy.sh

# Setup proxy dependencies
sudo ./setup-raspberrycam-proxy.sh

# Install cronjob to start run-raspberrycam-proxy on boot
cat <(crontab -l) <(echo "@reboot /bin/sh $(pwd)/run-raspberrycam-proxy.sh") | crontab -

# Reboot your nano
sudo reboot
```

Then you need to choose the `experimental_raspberrycam_docker` options in the config.json. _(see [CONFIG.md](../CONFIG.md))_

- Open `config.json`
- Replace `VIDEO_INPUT` param with `"experimental_raspberrycam_docker"` _(NOTE: Under the hood, the important thing is that OpenCV get this gstreamer pipeline in entry: `v4l2src device=/dev/video2 ! video/x-raw, framerate=30/1, width=640, height=360 ! videoconvert ! appsink`)_