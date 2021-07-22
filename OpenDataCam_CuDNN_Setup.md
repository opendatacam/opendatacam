## :fire: How to use OpenDataCam on Jetson TX2 without docker & with CuDNN enabled

### 1. Install dependencies

**For Jetsons:** Flash jetson to jetpack 4.3+

https://developer.nvidia.com/embedded/jetpack


### 2. Install Darknet (Neural network framework running YOLO)

#### Get the source files

```bash
git clone https://github.com/IrishTrafficSurveysDev/darknet.git
```

#### Modify the Makefile before compiling

Open the `Makefile` in the darknet folder and make these changes:

*For Jetson TX2*

```Makefile
# Set these variable to 1:
GPU=1
CUDNN=1
OPENCV=1

# Uncomment the following line
# For Jetson Tx2 or Drive-PX2 uncomment
ARCH= -gencode arch=compute_62,code=[sm_62,compute_62]
```

Make sure you have CUDA installed:

```
# Type this command
nvcc --version

# If it returns Command 'nvcc' not found , you need to install cuda properly: https://docs.nvidia.com/cuda/cuda-installation-guide-linux/index.html#package-manager-installation and also add cuda to your PATH with the post install instructions: https://docs.nvidia.com/cuda/cuda-installation-guide-linux/index.html#post-installation-actions
```


#### Compile darknet

```bash
# Go to darknet folder
cd darknet 
# Optional: put jetson in performance mode to speed up things
sudo nvpmodel -m 0
sudo jetson_clocks
# Compile
make
```

If you have an error "nvcc not found" on Jetson update path to NVCC in Makefile

```
NVCC=/usr/local/cuda/bin/nvcc
```

#### Download weight file

The .weights files that need to be in the root of the `/darknet` folder

```bash
cd darknet # if you are not already in the darknet folder

# YOLOv4-csp
 wget https://github.com/AlexeyAB/darknet/releases/download/darknet_yolo_v4_pre/yolov4-csp.weights --no-check-certificate
 --no-check-certificate
 
 # YOLOv4-csp-swish
 wget https://github.com/AlexeyAB/darknet/releases/download/darknet_yolo_v4_pre/yolov4-csp-swish.weights --no-check-certificate
 --no-check-certificate
 
 # YOLOv4-csp-x-swish
 wget https://github.com/AlexeyAB/darknet/releases/download/darknet_yolo_v4_pre/yolov4-csp-x-swish.weights --no-check-certificate
 --no-check-certificate

# YOLOv4-tiny
wget https://github.com/AlexeyAB/darknet/releases/download/darknet_yolo_v4_pre/yolov4-tiny.weights --no-check-certificate

# YOLOv4
wget wget https://github.com/AlexeyAB/darknet/releases/download/darknet_yolo_v4_pre/yolov4.weights --no-check-certificate
 --no-check-certificate
 
 # YOLOv4-P5
wget wget https://github.com/AlexeyAB/darknet/releases/download/darknet_yolo_v4_pre/yolov4-p5.weights --no-check-certificate
 --no-check-certificate
 
 # YOLOv4-P6
wget wget https://github.com/AlexeyAB/darknet/releases/download/darknet_yolo_v4_pre/yolov4-p6.weights --no-check-certificate
 --no-check-certificate
```

#### (Optional) Test darknet

```bash
# Go to darknet folder
cd darknet 
# Run darknet (yolo) on webcam
./darknet detector demo cfg/coco.data cfg/yolov4-tiny.cfg yolov4-tiny.weights "v4l2src ! video/x-raw, framerate=30/1, width=640, height=360 ! videoconvert ! appsink" -ext_output -dont_show

# Run darknet on file
./darknet detector demo cfg/coco.data cfg/yolov4-tiny.cfg yolov4-tiny.weights opendatacam_videos/demo.mp4 -ext_output -dont_show

# Run darknet on raspberrycam
./darknet detector demo cfg/coco.data cfg/yolov4-tiny.cfg yolov4-tiny.weights "nvarguscamerasrc ! video/x-raw(memory:NVMM),width=1280, height=720, framerate=30/1, format=NV12 ! nvvidconv ! video/x-raw, format=BGRx, width=640, height=360 ! videoconvert ! video/x-raw, format=BGR ! appsink" -ext_output -dont_show
```

### 3. Install node.js, mongodb

```bash
# Install node.js
sudo apt-get install curl
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Mongodb for Jetson devices (ARM64):

```bash
# Install mongodb

# Detailed doc: https://computingforgeeks.com/how-to-install-latest-mongodb-on-ubuntu-18-04-ubuntu-16-04/
# NB: at time of writing this guide, we install the mongodb package for ubuntu 16.04 as the arm64 version of it isn't available for 18.04
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 9DA31620334BD75D9DCB49F368818C72E52529D4
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/4.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.0.list
sudo apt-get update
sudo apt-get install -y openssl libcurl3 mongodb-org

# Start service
sudo systemctl start mongod

# Enable service on boot
sudo systemctl enable mongod
```

#### Mongodb for Generic Ubuntu machine with CUDA GPU:

```bash
# Install mongodb

# Detailed doc: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 9DA31620334BD75D9DCB49F368818C72E52529D4 && \
    echo "deb [ arch=amd64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/4.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-4.0.list
sudo apt-get update && apt-get install -y --no-install-recommends openssl libcurl3 mongodb-org

# Start service
sudo systemctl start mongod

# Enable service on boot
sudo systemctl enable mongod
```

### 4. Install opendatacam/irishtrafficcam


- Download source. Here you can either:

    A) 🔵 clone opendatacam

    ```bash
    git clone --depth 1 https://github.com/opendatacam/opendatacam.git
    cd opendatacam
    ```

    B) 🔵 clone irishtrafficcam


    ```bash
    git clone --depth 1 https://github.com/IrishTrafficSurveysDev/irishtrafficcam.git
    cd irishtrafficcam
    ```
    - We recommend option **B)** as IrishTrafficCam comes with optimzied customizations that OpenDataCam does not have

- Change `"MONGODB_URL"` in `opendatacam/config.json`/ `irishtrafficcam/config.json` (default is the docker service mongo URL)

```json
{
  "MONGODB_URL": "mongodb://127.0.0.1:27017"
}
```

- Specify **ABSOLUTE** `PATH_TO_YOLO_DARKNET` path in `opendatacam/config.json` / `irishtrafficcam/config.json`

```json
{
  "PATH_TO_YOLO_DARKNET" : "/home/nvidia/darknet"
}
```

```bash
# To get the absolute path, go the darknet folder and type
pwd .
```

- Specify `VIDEO_INPUT` and `NEURAL_NETWORK` in `opendatacam/config.json` / `irishtrafficcam/config.json`

*For Jetson TX2 (recommended)*

```json
{
  "VIDEO_INPUT": "usbcam",
  "NEURAL_NETWORK": "yolov4-csp"
}
```

Learn more in the [config documentation](CONFIG.md) page.

- Install **OpenDataCam** / **IrishTrafficCam**

```bash
cd <path/to/open-data-cam>
npm install
npm run build
```

- Run **OpenDataCam** / **IrishTrafficCam**

```bash
cd <path/to/open-data-cam> / <path/to/irish-traffic-cam>
npm run start
```

- (optional) Config **OpenDataCam** to run on boot

```bash
# install pm2
npm install pm2 -g |

# go to opendatacam/irishtrafficcam folder
cd <path/to/open-data-cam> / <path/to/irish-traffic-cam>
# launch pm2 at startup
# this command gives you instructions to configure pm2 to
# start at ubuntu startup, follow them
sudo pm2 startup

# Once pm2 is configured to start at startup
# Configure pm2 to start the Open Traffic Cam app
sudo pm2 start npm --name "opendatacam" -- start
sudo pm2 save
```

- (optional) Open ports 8080 8090 and 8070 to outside world on cloud deployment machine

```
sudo ufw allow 8080
sudo ufw allow 8090
sudo ufw allow 8070
```


