# ☘️ Irish Traffic Cam - Official Setup Guide

### 🎬 Introduction
- IrishTrafficCam is a customized implementation of [OpenDataCam](https://github.com/opendatacam/opendatacam). This guide will serve as a concrete step-by-step documentation on how to setup Irish Traffic Cam onto a Jetson TX2 using a Virtual Machine that is running in Ubuntu.

### 📚 Documentation Layout
- There are 2 essential parts to this guide:
  - Part 1 of this guide will outline the necessary steps needed to flash [Jetpack SDK](https://developer.nvidia.com/embedded/jetpack) onto Jetson TX2, which is required in order to run OpenDataCam([Source](https://github.com/opendatacam/opendatacam#2-install-and-start-opendatacam-))
  - Part 2 of this guide will outline the necessary steps needed to initialize OpenDataCam on a Jetson TX2 that is running Jetpack


## ⚡️ Part 1 - Flashing Jetpack onto Jetson TX2

- Before you can run OpenDataCam on a Jetson TX2, you will need to flash Jetpack onto Jetson TX2, as OpenDataCam requires the use of certian libraries that come with Jetpack. This means that in order to flash Jetpack, you will need a **host machine**, as well as a **target machine**(Jetson TX2).

### 💻 Part 1 A): Hardware Requirements
  - **A Host computer** from which you can run the necessary software to flash Jetpack. You **must** ensure that the host machine is running **Ubuntu** with a version of Ubuntu **greater than 16.04 and less than 20.04**. At the time of writing(July 2021), Ubuntu 16.04 has reached end of life, and Jetpack is currently not supported for Ubuntu 20.04. The best Ubuntu version to run is 18.04. If you do not have a Ubuntu machine, please follow the guide on [running Ubuntu on a virutal machine](https://github.com/IrishTrafficSurveysDev/Irish-Traffic-Cam-Guide/blob/main/Ubuntu-VM-Setup-Guide.md)
  - **Jetson TX2 Developer Kit**([Source](https://developer.nvidia.com/embedded/jetson-tx2-developer-kit#resources))

#### 🔧 Hardware Requirements - Precautions
- Ensure that you purchase the **TX2 Developer Kit** and not Just the TX2 itself, as it includes neccesary hardware additions needed to successfully setup the TX2, such as Antennas and a USB Micro-B to USB A Cable.
- Ensure that both you host and target machines(aka your Ubuntu Machine and your TX2) have internet access either through wifi or ethernet. The software setup requires internet access on both host and target machine for the setup to be successful
- There is no problem if you TX2 is running an older version of Ubuntu(such as 16.04, which was the version my TX2 was running). The whole OS will be wiped out by Jetpack, where you will get the Ubuntu version of your host machine.

### 📦 Part 1 B): Software Requirements
- **Nvidia Jetpack SDK manager**: This is a setup wizard that simplifies the process of flashing Jetpack onto TX2 immensely. To download this software, follow these steps:
  1.  Register for an NVIDIA Developer Account. It's free, and you can sign up [here](https://developer.nvidia.com/login)
  2.  Follow [this](https://developer.nvidia.com/embedded/jetpack) link and make sure to select the **SDK Manager Method** dropdown(See this [image](https://github.com/IrishTrafficSurveysDev/Irish-Traffic-Cam-Guide/blob/main/SDK-Manager-Option.png))
  3. After you have completed registration, download the file onto your host machine

#### 🔧 Software Requirements - Precautions
- Ensure that your SDK manager is the latest version. This is the ensured by default, but **do not install the SDK manager from the SDK archives**. The SDK manager will block installation as it knows that there is a later version available. As of writing, the latest version of Jetpack is 4.5.1, which was flashed successfully onto the TX2. According to the official OpenDataCam [documentation](https://github.com/opendatacam/opendatacam/blob/master/documentation/jetson/FLASH_JETSON.md), any version above Jetpack 4.3 is supported.

### 🚀 Part 1 C): Flashing Jetpack onto Jetson TX2
- [This Video](https://www.youtube.com/watch?v=D7lkth34rgM&t=1s) is hands-down the best tutorial for flashing Jetpack onto Jetson TX2. Please follow this video **exactly**, including the fact that the instructor followed the instructions for **manual installation instead of automatic installation**, as automatic installation created some problems with the setup procedure. In summary, follow the video exactly!

## 🎯 Part 2 - Installing and running OpenDataCam

- For installing and running OpenDataCam, there are 2 setup options available:
  - An option to setup OpenDataCam **with Docker**
  - An option to setup OpenDataCam **without Docker**

### 🌀 Part 2 - Option A: Setup Open Data Cam *without* Docker (Recommended)
- You can follow our [guide](https://github.com/IrishTrafficSurveysDev/Irish-Traffic-Cam-Guide/blob/main/OpenDataCam_CuDNN_Setup.md) on setting up OpenDataCam without Docker, which is more accurate and customized than the [official guide](https://github.com/opendatacam/opendatacam/blob/master/documentation/USE_WITHOUT_DOCKER.md) 


### 🐋 Part 2 - Option B: Setup OpenDataCam *with* Docker
- While the documentation states that there is no Docker Build support for Jetson TX2, there actually is for TX2 versions with Jetpack 4.5 installed!
- To setup OpenDataCam without Docker, follow the official [quick setup guide](https://github.com/opendatacam/opendatacam#-get-started-quick-setup) and follow the instructions and docker build for a Jetson Nano. According to [this](https://github.com/opendatacam/opendatacam/issues/416) issue, the Jetson Nano Docker image should work on TX2 as well

#### 🔧 Setup OpenDataCam without Docker - Precautions
- **If you get an error that is similar to [this](https://github.com/opendatacam/opendatacam/issues/268)**: This is a problem with OpenDataCam's outdated fork of Darknet, as well as s compatibility issue with CUDA and cuDNN, according to the moderator of Darknet, which happens to be a dependency of OpenDataCam([Source](https://github.com/AlexeyAB/darknet/issues/7205#issuecomment-755837883))
  - To combat this, you can try 2 approached:
    1. 🔘 **Option 1:** Disable cuDNN in your `Makefile`.
        1. Locate your `Makefile` (`/path/to/darket/Makefile`) and open it in a text editor
        2. Set the `CUDNN` option to 0
    2. 🔘 (Recommended) **Option 2:** Follow [this](https://github.com/IrishTrafficSurveysDev/Irish-Traffic-Cam-Guide/blob/main/OpenDataCam_CuDNN_Patch.md) tutorial for running OpenDataCam on Jetson TX2 with cuDNN enabled. Note that this tutorial will guide you through the setup **without** using Docker
  
- **YOLOv4 vs YOLOv4-tiny**: During the configuration, you must download the weights of either **YOLOv4** or either **YOLOv4-tiny** and set it appropriately in your `config.json` file.
  - 🏁 **Which one should I choose to use?**
    - 🔘 **YOLOv4-tiny** runs at a faster FPS, but is quite inaccurate and misses cars and other objects if the video is rapid itself
    - 🔘 **YOLOv4** (Recommended) runs at a much lower FPS, but is much more accurate and is able to correctly detect almost all moving objects

#### 💢 (Optional,  only for Part 2 - Option A) Setting the Jetson TX2 to its highest performance setting for running OpenDataCam
- It's possible to tweak Jetson TX2 so that it uses all GPU and CPU power to its highest capability. To do so, run the following commands before starting OpenDataCam(i.e before running `npm run start`):
 ``` shell
sudo nvpmodel -m 0
sudo jetson_clocks 
```
- Note than these command must be run with admin privilages, hence the `sudo`. In case you are wondering what these commands do:
  - the first command(`nvpmodel`) is used to change the power management “profiles”, you can find more info about it [here](https://www.jetsonhacks.com/2017/03/25/nvpmodel-nvidia-jetson-tx2-development-kit/):
  - The second command (`jetson_clocks`) that it is used to set max frequencies to CPU, GPU and EMC clocks.

#### 🔥 (Optional, only for Part 2 - Option A) Create a Desktop file to launch OpenDataCam in a double click
- Although not necessary, it is possible to create a Desktop script and configure OpenDataCam to run after a double click, as well as set Jetson TX2 to its highest performance setting for running OpenDataCam. To do so, this is the process you should follow:
  1. Open a terminal, and change directory into your `opendatacam` folder.
  2. From here, run the command `npm i open` to install the [open](https://www.npmjs.com/package/open) library
  3. Open the `server.js` file, and add the line `const open = require('open');` to the top of the file with all the imports
  4. Find the following block of code in the `server.js` file:
  </br>
   
  ``` javascript
  server.listen(port, (err) => {
  if (err) throw err
  if (port === 80) {
    console.log(`> Ready on http://localhost`)
    console.log(`> Ready on http://${ip.address()}`)
  } else {
    console.log(`> Ready on http://localhost:${port}`)
    console.log(`> Ready on http://${ip.address()}:${port}`)
  }
  })
  })
  ```
  5. Edit the code block so that is looks like the following:
  </br>
  
  
  ``` javascript
  server.listen(port, (err) => {
  if (err) throw err
  if (port === 80) {
    console.log(`> Ready on http://localhost`)
    console.log(`> Ready on http://${ip.address()}`)
    open(`http://${ip.address()}`)
  } else {
    console.log(`> Ready on http://localhost:${port}`)
    console.log(`> Ready on http://${ip.address()}:${port}`)
    open(`http://localhost:${port}`)
  }
  })
  })
  ```
  6. Download and open the file called [`Start_ITC.desktop`](https://github.com/IrishTrafficSurveysDev/Irish-Traffic-Cam-Guide/blob/main/Start-ITC.desktop). Open the file in a text editor, and change the `/path/to/your/opendatacam/` to the path of your `opendatacam` folder. This file also contains the 2 command described abhove for setting the Jetson TX2 to run OpenDataCam at its highest performance settings.
  7. Right click on the file, select Properties, give it read and write permissions, and check the `Allow executing file as a program` option.
  8. Double Click the file, click `Trust and Launch` and enter your computer password to give admin rights if prompted to do so, and voila!



## 💥 Customizing OpenDataCam
- You can read [this](https://github.com/opendatacam/opendatacam/blob/master/documentation/CONFIG.md) section of the OpenDataCam documentation to learn more about customizing OpenDataCam to suit your needs. We have provided some of our own customizations that you can browse:
  - 🔘 [Use Custom Neural Network weights for Object Detection](https://github.com/IrishTrafficSurveysDev/Irish-Traffic-Cam-Guide/blob/main/Using-Custom-NN-Weights.md)

### 📋 Customization Task List
- [x] Set Jetson TX2 to perform at its highest performance settings when running OpenDataCam
- [x] Fork darknet and customize it to support CuDNN for Jetson TX2 
- [x] Change Default model from `yolov4` to `yolov4-csp` for better speed & accuracy 

- 🔘 You can view the whole customization Kanban Board [here](https://github.com/IrishTrafficSurveysDev/Irish-Traffic-Cam-Guide/projects/2)


##  🎥 Resources
- Watch [this](https://vimeo.com/346340651) Vimeo to get a better understanding of the various settings of OpenDataCam.
