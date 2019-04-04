## How to run opendatacam without docker

### 1. Install OpenCV 3.4.3 with Gstreamer:

You can either:

- Use pre-built binaries for your host device (see links below)
- Compile your own (see below section on how to compile) 


Then follow this to install it:

```bash
# Remove all old opencv stuffs installed by JetPack
sudo apt-get purge libopencv*

# Download .deb files

# For Jetson TX2
wget https://filedn.com/lkrqWbAQYllSVUK4ip6g3m0/opencv-tx2-3.4.3/OpenCV-3.4.3-aarch64-libs.deb
wget https://filedn.com/lkrqWbAQYllSVUK4ip6g3m0/opencv-tx2-3.4.3/OpenCV-3.4.3-aarch64-dev.deb
wget https://filedn.com/lkrqWbAQYllSVUK4ip6g3m0/opencv-tx2-3.4.3/OpenCV-3.4.3-aarch64-python.deb

# For Jetson Xavier
# TODO compile binaries specific for xavier architecture

# Install .deb files
sudo dpkg -i OpenCV-3.4.3-aarch64-libs.deb
sudo apt-get install -f
sudo dpkg -i OpenCV-3.4.3-aarch64-dev.deb
sudo dpkg -i OpenCV-3.4.3-aarch64-python.deb

# Verify opencv version
pkg-config --modversion opencv
```

### 2. Install Darknet (Neural network framework running YOLO)

#### Get the source files

```bash
#TODO Change to final fork url, the only change from https://github.com/alexeyab/darknet is : https://github.com/tdurand/darknet/pull/1/files

git clone --depth 1 https://github.com/tdurand/darknet
```

#### Modify the Makefile before compiling

Open the `Makefile` in the darknet folder and make these changes:

*For Jetson TX2*

```Makefile
# Set these variable to 1:
GPU=1
CUDNN=1
OPENCV=1

# With sed
#sed -i s/GPU=0/GPU=1/g Makefile
#sed -i s/CUDA=0/CUDA=1/g Makefile
#sed -i s/OPENCV=0/OPENCV=1/g Makefile

# Uncomment the following line
# For Jetson Tx2 or Drive-PX2 uncomment
ARCH= -gencode arch=compute_62,code=[sm_62,compute_62]
```

*For Jetson Xavier*

```Makefile
# Set these variable to 1:
GPU=1
CUDNN=1
CUDNN_HALF=1
OPENCV=1

# Uncomment the following line
# Jetson XAVIER
ARCH= -gencode arch=compute_72,code=[sm_72,compute_72]
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

#### Download weight file

The .weights file needs to be in the root of the `/darknet` folder

```bash
cd darknet #if you are not already in the darknet folder
wget https://pjreddie.com/media/files/yolo-voc.weights --no-check-certificate
```

*Direct link to weight file: [yolo-voc.weights](https://pjreddie.com/media/files/yolo-voc.weights)*

### 3. Install node.js, mongodb

```bash
# Install node.js
sudo apt-get install curl
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get install -y nodejs

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

### 4. Install opendatacam

- Download source

```bash
# TODO Remove branch v2 once released
git clone --depth 1 -b v2 https://github.com/moovel/lab-opendatacam.git
cd lab-opendatacam
```

- Specify **ABSOLUTE** `PATH_TO_YOLO_DARKNET` path in `lab-open-data-cam/config.json` (open data cam repo)

```json
{
  "PATH_TO_YOLO_DARKNET" : "/home/nvidia/darknet"
}
```

```bash
# To get the absolute path, go the darknet folder and type
pwd .
```

- Install **open data cam**

```bash
cd <path/to/open-data-cam>
npm install
npm run build
```

- Config **open data cam** to run on boot

```bash
# install pm2
npm install pm2 -g |

# go to opendatacam folder
cd <path/to/open-data-cam>
# launch pm2 at startup
# this command gives you instructions to configure pm2 to
# start at ubuntu startup, follow them
sudo pm2 startup

# Once pm2 is configured to start at startup
# Configure pm2 to start the Open Traffic Cam app
sudo pm2 start npm --name "open-data-cam" -- start
sudo pm2 save
```