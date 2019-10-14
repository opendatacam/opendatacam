## Jetson Nano

- [Jetson Nano](#jetson-nano)
  - [Limitations](#limitations)
  - [Shopping list](#shopping-list)
  - [Setup Opendatacam](#setup-opendatacam)
    - [1. Flash Jetson Nano:](#1-flash-jetson-nano)
    - [2. Set correct Powermode according to your Power supply](#2-set-correct-powermode-according-to-your-power-supply)
      - [Using microUSB](#using-microusb)
      - [Using barrel jack (5V - 4A)](#using-barrel-jack-5v---4a)
    - [3. Setup a swap partition:](#3-setup-a-swap-partition-)
    - [4. Verify your if your USB Camera is connected](#4-verify-your-if-your-usb-camera-is-connected)
    - [5. Install Opendatacam](#5-install-opendatacam)
    - [6. Test Opendatacam](#6-test-opendatacam)
    - [7. Access Opendatacam via Wifi hotspot](#7-access-opendatacam-via-wifi-hotspot)
    - [8. Tips](#8-tips)
    - [9. Housing](./HOUSING.md)
  - [Advanced usage](#advanced-usage)
    - [Use Raspberry Pi Cam with a non-docker installation of Opendatacam](#use-raspberry-pi-cam-with-a-non-docker-installation-of-opendatacam)
    - [(EXPERIMENTAL) Use Raspberry Pi Cam with Opendatacam default installation](#-experimental--use-raspberry-pi-cam-with-opendatacam-default-installation)
      - [Setup](#setup)
      - [Why](#why)

### Limitations

Jetson Nano has two power mode, 5W and 10W.

Once Opendatacam is installed and **running without a monitor**, it runs perfectly fine on 5W powermode _(which is nice because you can power it with a powerbank)_. If you use it with a monitor connected, the display will be a bit laggy but it should work.

We recommend you to do the setup with a monitor connected and then make your Jetson nano available as a Wifi hotspot to operate it from another device.

The 10W Power mode of the Jetson won't bring much performance improvement for Opendatacam.

### Shopping list

The minimum setup for 5W power mode is:

- 1 Jetson nano
- 1 Camera [USB compatible camera](https://elinux.org/Jetson_Nano#Cameras) or [Raspberrycam module v2](https://www.raspberrypi.org/products/camera-module-v2/)
- 1 Wifi dongle, [this one is compatible](https://www.edimax.com/edimax/merchandise/merchandise_detail/data/edimax/in/wireless_adapters_n150/ew-7811un/) out of the box, or [see compatibility list](https://elinux.org/Jetson_Nano#Wireless).
- 1 MicroSD card (at least 32 GB and 100 MB/s)
- 1 Power supply: either a [5V⎓2A Micro-USB adapter](https://www.adafruit.com/product/1995) or a Powerbank with min 2A output.

For 10W power mode _(this is good for desktop use when you plug the screen, the mouse, the keyboard, it draws powers from the peripherics)_

- Power supply: [5V⎓4A DC barrel jack adapter, 5.5mm OD x 2.1mm ID x 9.5mm length, center-positive](https://www.adafruit.com/product/1466)
- 1x [2.54mm Standard Computer Jumper](https://www.amazon.com/2-54mm-Standard-Computer-Jumper-100pack/dp/B00N552DWK/) This is used on the J48 Pin when supplying power from the jack entry instead of the microUSB. It tells the Jetson to by-pass the microUSD power entry.

For setup:

- 1 usb mouse
- 1 usb keyboard
- 1 screen (HDMI or Displayport)
- And for faster connexion, a ethernet cable to your router

Learn more about Jetson Nano ecosystem: [https://elinux.org/Jetson_Nano#Ecosystem_Products_and_Sensors](https://elinux.org/Jetson_Nano#Ecosystem_Products_and_Sensors)

### Setup Opendatacam

#### 1. Flash Jetson Nano:

Follow [Flashing guide](FLASH_JETSON.md#Jetson-Nano) (don't forget to verify if CUDA is in your PATH)

#### 2. Set correct Powermode according to your Power supply

##### Using microUSB

Using microUSD with a powerbank or a 5V⎓2A power supply, you just need to plug-in and the Jetson Nano will start when connected to it.

When started, we advise you to set the powermode of the Jetson Nano to 5W so it won't crash, to do so, open a terminal and run:

```
sudo nvpmodel -m 1
```

To switch back to 10W power mode (default)

```
sudo nvpmodel -m 0
```

##### Using barrel jack (5V - 4A)

When working with the Jetson Nano with the monitor connected, we advise to use the barrel jack power. In order to do so you need first to put a jumper on the J48 pin (more details on Jetson Nano power supply)

![jumper](https://user-images.githubusercontent.com/533590/60701138-edca9500-9efa-11e9-8c51-6e2b421ed44b.png)

By default, the Jetson Nano will already run on the 10W power mode, but you can make sure it is by running:

```
sudo nvpmodel -m 0
```

#### 3. Setup a swap partition:

In order to reduce memory pressure (and crashes), it is a good idea to setup a 6GB swap partition. _(Nano has only 4GB of RAM)_

```bash
git clone https://github.com/JetsonHacksNano/installSwapfile
cd installSwapfile
chmod 777 installSwapfile.sh
./installSwapfile.sh
```

Reboot the Jetson nano

#### 4. Verify your if your USB Camera is connected

```bash
ls /dev/video*
# Output should be: /dev/video0
```

If this isn't the case, run the install script anyway, and after you will need to [modify the config.json](documentation/CONFIG.md) file to select your desired VIDEO_INPUT

_If you have a Raspberry Pi Cam, [see advanced usage](#advanced-usage)._

#### 5. Install Opendatacam

```bash
# Download install script
wget -N https://raw.githubusercontent.com/opendatacam/opendatacam/v2.1.0/docker/install-opendatacam.sh

# Give exec permission
chmod 777 install-opendatacam.sh

# NB: You will be asked for sudo password when installing the docker container

# Install command for Jetson Nano
./install-opendatacam.sh --platform nano
```

#### 6. Test Opendatacam

Open `http://localhost:8080`.

This will be super slow if you are using this directly on the monitor connected to the Jetson nano, see next step to access Opendatacam from an external device.

#### 7. Access Opendatacam via Wifi hotspot

N.B: you need a wifi dongle for this.

- [Make jetson available as a WiFi hotspot](../WIFI_HOTSPOT_SETUP.md)
- Reboot
- Click on the network icon on the top right > Connection Information

![connectioninformatio](https://user-images.githubusercontent.com/533590/60710337-bf58b400-9f12-11e9-8056-987f0b5ea583.png)

Take note somewhere of the Jetson IP Address, in this case 10.42.0.1

- Unplug monitor / ethernet / keyboard / mouse and reboot

- Connect with another device to this Wifi network, and open <IP_OF_JETSON>:8080 in your browser

_After rebooting the Jetson Nano may takes 1-5 min to start the docker container, so if your browser say "Page not found", just retry after a few minutes_

You should be able to operate Opendatacam without lag issues.

#### 8. Tips

- You'll notice there are no button to power on / off button your Jetson Nano. When you plug the power supply it will power on immediately. If you want to restart you can just un-plug / re-plug if you are not connected via a Monitor or SSH. There is a way to add power buttons via the J40 pins, [see nvidia forum](https://devtalk.nvidia.com/default/topic/1050888/jetson-nano/power-and-suspend-buttons-for-jetson-nano/post/5333577/#5333577).

- You can connect your Jetson to ethernet and SSH into it to do all the setup without having to connect a monitor (after having setup a fixed IP)

#### 9. Build a case

[Here are the steps to set up the Jetson NANO in the Wildlife Cam Casing from Naturebytes.](HOUSING.md)

### Advanced usage

_[Follow this article](https://www.jetsonhacks.com/2019/04/02/jetson-nano-raspberry-pi-camera/) to test your raspberry pi cam_

**IMPORTANT:** Unplug any usb webcam before plugging the raspberry pi cam or reboot after unpluging / plugin things.

#### Use Raspberry Pi Cam with a non-docker installation of Opendatacam

_NB: [We hope this won't be necessary](https://github.com/opendatacam/opendatacam/issues/89) after Jetpack 4.2.1 release with native docker support._

- Follow [Install without docker guide](../USE_WITHOUT_DOCKER.md)

- In `config.json > VIDEO_INPUT` , set `raspberrycam_no_docker`

Restart Opendatacam, [learn more about changing config.json here](../CONFIG.md).

#### (EXPERIMENTAL) Use Raspberry Pi Cam with Opendatacam default installation

_This is experimental, it might work for a time and then stop working... If it is the case you will be forced to re-flash your Jetson Nano as we have don't know a way to uninstall this._

_NB: [We hope this won't be necessary anymore](https://github.com/opendatacam/opendatacam/issues/89) after Jetpack 4.2.1 release with native docker support._

##### Setup

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

##### Why

From the docker container, we can't access directly the raspberrypi camera ( [more background](https://devtalk.nvidia.com/default/topic/1051653/jetson-nano/access-to-raspberry-cam-nvargus-daemon-from-docker-container/post/5338140/#5338140) )

In order to do so we need to:

- Start a process that proxys the Raspberry cam feed into an usb cam
- Pick this "fake" usb cam from the docker container
