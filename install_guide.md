## Install guide

### Flash Jetson Board:

- Download [JetPack](https://developer.nvidia.com/embedded/downloads#?search=jetpack%203.1) to Flash your Jetson board with the linux base image and needed dependencies
- Follow the [install guide](http://docs.nvidia.com/jetpack-l4t/3.1/index.html#developertools/mobile/jetpack/l4t/3.1/jetpack_l4t_install.htm) provided by NVIDIA
### Prepare Jetson Board

- Update packages

  ```
  sudo apt-get update
  ```

- Install __cURL__

  ```
  sudo apt-get install curl
  ```

- install __git-core__

  ```
  sudo apt-get install git-core
  ```

- Install __nodejs__ (v8):

  ```
  curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
  sudo apt-get install -y nodejs
  sudo apt-get install -y build-essential
  ```

- Install __ffmpeg__ (v3)

  ```
  sudo add-apt-repository ppa:jonathonf/ffmpeg-3
  # sudo add-apt-repository ppa:jonathonf/tesseract (ubuntu 14.04 only!!)
  sudo apt update && sudo apt upgrade
  sudo apt-get install ffmpeg
  ```

- Install __nano__ because vim is the worst

  ```
  sudo apt-get install nano
  ```

### Configure Ubuntu to turn the jetson into a wifi access point

__very buggy way to handle it. needs an update.__

- enable SSID broadcast 

  add the following line to `/etc/modprobe.d/bcmdhd.conf`

  ```
  options bcmdhd op_mode=2
  ```

  further infos: [here](https://devtalk.nvidia.com/default/topic/910608/jetson-tx1/setting-up-wifi-access-point-on-tx1/post/4786912/#4786912)

- Configure hotspot via UI 

  __follow this guide: <https://askubuntu.com/a/762885>__

- Define Address range for the hotspot network

  - Go to the file named after your Hotspot SSID in `/etc/NetworkManager/system-connections`

    ```
    cd /etc/NetworkManager/system-connections
    sudo nano <YOUR-HOTSPOT-SSID-NAME>
    ```

  - Add the following line to this file:

    ```
    [ipv4]
    dns-search=
    method=shared
    address1=192.168.2.1/24,192.168.2.1 <--- this line
    ```

  - Restart the network-manager

    ```
    sudo service network-manager restart
    ```


### Configure jetson to start in overclocking mode:

  - Add the following line to `/etc/rc.local` before `exit 0`:

     ```
     #Maximize performances 
     ( sleep 60 && /home/ubuntu/jetson_clocks.sh )&
     ```

  - Enable `rc.local.service`

     ```
     chmod 755 /etc/init.d/rc.local
     sudo systemctl enable rc-local.service
     ```


### Install Darknet-net:

__IMPORTANT__ Make sure that __openCV__ (v2) and __CUDA__ will be installed via JetPack (post installation step)
if not:  (fallback :openCV 2: [install script](https://gist.github.com/jayant-yadav/809723151f2f72a93b2ee1040c337427#file-opencv_install-sh), CUDA: no easy way yet)

- Install __libwsclient__:

  ```
  git clone https://github.com/PTS93/libwsclient
  cd libwsclient
  ./autogen.sh
  ./configure && make && sudo make install
  ```

- Install __liblo__:

  ```
  wget https://github.com/radarsat1/liblo/releases/download/0.29/liblo-0.29.tar.gz
  tar xvfz liblo-0.29.tar.gz
  cd liblo-0.29
  ./configure && make && sudo make install
  ```

- Install __json-c__:

  ```
  git clone https://github.com/json-c/json-c.git
  cd json-c
  sh autogen.sh
  ./configure && make && make check && sudo make install
  ```

-   Install __darknet-net__:

    ```
    git clone https://github.com/meso-unimpressed/darknet-net.git
    ```

- Download __weight files__:

  link: [yolo.weight-files](https://pjreddie.com/media/files/yolo-voc.weights)

  Copy `yolo-voc.weights` to `darknet-net` repository path (root level)

  e.g.:

  ```
  darknet-net
    |-cfg
    |-data
    |-examples
    |-include
    |-python
    |-scripts
    |-src
    |# ... other files
    |yolo-voc.weights <--- Weight file should be in the root directory
  ```

- Make __darknet-net__

  ```
  cd darknet-net
  make
  ```

### Install the open-traffic-cam node app

- Install __pm2__ and __next__ globally

  ```
  sudo npm i -g pm2
  sudo npm i -g next
  ```

- Clone __open_data_cam__ repo:

  ```
  git clone https://github.com/moovel/lab-open-data-cam.git
  ```

- Specify `PATH_TO_YOLO_DARKNET` path in `lab-open-data-cam/config.json` (open data cam repo)

  e.g.:

  ```
  {
  	"PATH_TO_YOLO_DARKNET" : "/home/nvidia/darknet-net"
  }
  ```

- Install __open data cam__

  ```
  cd <path/to/open-data-cam>
  npm install
  npm run build
  ```

- Run __open data cam__ on boot

  ```
  cd <path/to/open-data-cam>
  sudo pm2 startup  
  sudo pm2 start npm --name "open-data-cam" -- start
  sudo pm2 save
  ```

### Restart the jetson board and open `http://IP-OF-THE-JETSON-BOARD:8080/`

## Troubleshoothing

- __Error__: `please specify the path to the raw detections file`

  Make sure that `ffmpeg` is installed and is above version `2.8.11` 

- __Error__: `Could *not* find a valid build in the '.next' directory! Try building your app with '*next* build' before starting the server`

  Run `npm build` before starting the app

