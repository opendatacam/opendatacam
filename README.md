# OpenDataCam – An open source tool to quantify the world

OpenDataCam is an open source tool that helps to quantify the world.
With computer vision OpenDataCam understands and quantifies moving objects.
The simple setup allows everybody to count moving objects from cameras and videos.

People use OpenDataCam for many different [use cases](https://opendata.cam/use-cases).
It is especially popular for traffic studies (modal-split, turn-count, etc.) but OpenDataCam detects 50+ common objects out of the box and can be used for many more things.
And in case it does not detect what you are looking for, you can always train your own model.

OpenDataCam uses machine learning to detect objects in videos and camera feeds.
It then follows the objects as they move accross the scene.
Define counters via the easy to use UI or API, and every time an object crosses the counter, OpenDataCam takes count.

## Demo Videos

| 👉 [UI Walkthrough (2 min, OpenDataCam 3.0)](https://vimeo.com/432747455) | 👉 [UI Walkthrough (4 min, OpenDataCam 2.0)](https://vimeo.com/346340651) | 👉 [IoT Happy Hour #13:  OpenDataCam 3.0](https://youtu.be/YfRvUeSLi0M?t=1000 ) |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| [![OpenDataCam 3.0](https://i.vimeocdn.com/video/914771794_640.jpg)](https://vimeo.com/432747455) | [![Demo OpenDataCam](https://i.vimeocdn.com/video/805477718_640.jpg)](https://vimeo.com/346340651) | [![IoT](https://img.youtube.com/vi/YfRvUeSLi0M/hqdefault.jpg)](https://youtu.be/YfRvUeSLi0M?t=1000) |

## Features

OpenDataCam comes [feature packed](https://opendata.cam/features), the highlight are

- Multiple object classes
- Fine grained counter logic
- Trajectory analysis
- Real-time or pre-recorded video sources
- Run on small devices in the field or data centers in the cloud
- You own the data
- Easy to use [API](https://opendata.cam/docs/api/)

## 🎬 Get Started, quick setup

The quickest way to get started with OpenDataCam is to use the existing Docker Images.

### Pre-Requesits

- You will need Docker and Docker-Compose installed. 
- If you want to run OpenDataCam on a NVIDIA GPU you will additonally need
  - [Nvidia CUDA 11 and cuDNN 8](https://developer.nvidia.com/cuda-downloads)
  - [Nvidia Container toolkit installed](https://github.com/NVIDIA/nvidia-docker)
  - You also need to install `nvidia-container-runtime`
- To run OpenDataCam on a NVIDIA Jetson device you will need [Jetpack 5.x](https://developer.nvidia.com/embedded/jetpack-sdk-512).

### Installation

```bash
# Download install script
wget -N https://raw.githubusercontent.com/opendatacam/opendatacam/v3.0.2/docker/install-opendatacam.sh

# Give exec permission
chmod 777 install-opendatacam.sh

# Note: You will be asked for sudo password when installing OpenDataCam

# Install command for Jetson Nano
./install-opendatacam.sh --platform nano

# Install command for Jetson Xavier / Xavier NX
./install-opendatacam.sh --platform xavier

# Install command for a Laptop, Desktop or Server with NVIDIA GPU
./install-opendatacam.sh --platform desktop
```

This command will download and start a docker container on the machine.
After it finishes the docker container starts a webserver on port 8080 and run a demo video.

_Note:_ The docker container is started in auto-restart mode, so if you reboot your machine it will automaticaly start opendatacam on startup.
To stop it run `docker-compose down` in the same folder as the install script.

### Use OpenDataCam

Open your browser at `http://[IP_OF_JETSON]:8080``.
(If you are running with the Jetson connected to a screen try: [http://localhost:8080](http://localhost:8080))

You should see a video of a busy intersection where you can immediately start counting.

### Next Steps

Now you can…

- Drag'n'Drop a video file into the browser window to have OpenDataCam analzye this file
- Change the [video input](https://opendata.cam/docs/configuration/#video-input) to run from a USB-Cam or other cameras
- Use custom [neural network weights](https://opendata.cam/docs/configuration/#use-custom-neural-network-weights)

and much more. See [Configuration](https://opendata.cam/docs/configuration/) for a full list of configuration options.

## 🔌 API Documentation

In order to solve use cases that aren't taken care by our opendatacam base app, you might be able to build on top of our API instead of forking the project.

[https://opendatacam.github.io/opendatacam/apidoc/](https://opendatacam.github.io/opendatacam/apidoc/)

### 🗃 Data export documentation

- [Counter data](https://opendatacam.github.io/opendatacam/apidoc/#api-Recording-Counter_data)
- [Tracker data](https://opendatacam.github.io/opendatacam/apidoc/#api-Recording-Tracker_data)

## 🛠 Development notes

See [Development notes](https://opendata.cam/docs/development/)

## 💰️ Funded by the community

- `@rantgithub` funded work to add Polygon counters and to improve the counting lines

## 📫️ Contact

Please ask any Questions you have around OpenDataCam in the [GitHub Discussions](https://github.com/opendatacam/opendatacam/discussions).
Bugs, Features and anythings else regarding the development of OpenDataCam is tracked in [GitHub Issues](https://github.com/opendatacam/opendatacam/issues).

For business inquiries or professional support requests please contact [Valentin Sawadski](https://opendata.cam/#people_involved) or visit [OpenDataCam for Professionals](https://opendata.cam/professionals/).

## 💌 Acknowledgments

- Original darknet @pjreddie  : [https://pjreddie.com/darknet/](https://pjreddie.com/darknet/)
- Darknet fork + YOLOv4 by @alexeyab : [https://github.com/alexeyab/darknet](https://github.com/alexeyab/darknet)
- IOU / V-IOU Tracker by @bochinski : [https://github.com/bochinski/iou-tracker/](https://github.com/bochinski/iou-tracker/)
- Next.js by @zeit : [https://github.com/zeit/next.js](https://github.com/zeit/next.js)
