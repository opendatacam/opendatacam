#!/bin/bash

# exit when any command fails
set -e

# Each opendatacam release should set the correct version here and tag appropriatly on github
VERSION=v2.0.0-beta.2
# PLATFORM in ["nano","xavier","tx2","dockernvidia"]
PLATFORM=undefined
VIDEO_INPUT=undefined

# DEFAULT config for opendatacam depending on platform
DEFAUT_VIDEO_INPUT_nano=usbcam
DEFAUT_VIDEO_INPUT_tx2=usbcam
DEFAUT_VIDEO_INPUT_xavier=usbcam

DEFAUT_NEURAL_NETWORK_nano=yolov3-tiny
DEFAUT_NEURAL_NETWORK_tx2=yolov2-voc
DEFAUT_NEURAL_NETWORK_xavier=yolov3

echo "Installing opendatacam docker image"

display_usage() {
  echo
  echo "Usage: $0"

  echo " -p, --platform  Specify platform : nano, xavier, tx2"
  echo " -h, --help   Display usage instructions"
  echo
}

raise_error() {
  local error_message="$@"
  echo "${error_message}" 1>&2;
}

argument="$1"

if [[ -z $argument ]] ; then
  raise_error "Expected argument to be present"
  display_usage
else
  case $argument in
    -h|--help)
      display_usage
      ;;
    -p|--platform)
      # Stop any current docker container from running
      echo "Stop any running docker container..."
      sudo docker stop $(sudo docker ps -a -q)

      # Platform is specified 
      PLATFORM=$2
      # TODO verify if PLATFORM is oneOf(nano, xavier, tx2)
      echo "Installing opendatacam $VERSION for platform: $2 ..."
      echo "Download run script for docker ..."
      # Get the run-docker script
      wget -N https://raw.githubusercontent.com/moovel/lab-opendatacam/$VERSION/docker/run-jetson/run-docker.sh

      # Chmod to give exec permissions
      chmod 777 run-docker.sh

      # Get the config file
      echo "Download config file ..."
      wget -N https://raw.githubusercontent.com/moovel/lab-opendatacam/$VERSION/config.json

      # Create the directory to run on files
      echo "Create the directory to run on files ..."
      mkdir opendatacam_videos
      echo "Download demo video ..."
      wget https://github.com/moovel/lab-opendatacam/raw/$VERSION/static/demo/demo.mp4 -O opendatacam_videos/demo.mp4

      # Replace VIDEO_INPUT and NEURAL_NETWORK with default config for this platform
      # Bash hacks
      VIDEO_INPUT="DEFAUT_VIDEO_INPUT_$PLATFORM"
      VIDEO_INPUT=${!VIDEO_INPUT}

      NEURAL_NETWORK="DEFAUT_NEURAL_NETWORK_$PLATFORM"
      NEURAL_NETWORK=${!NEURAL_NETWORK}

      echo "Replace config file with platform default params ... (you can change those later)"
      echo "NEURAL_NETWORK : $NEURAL_NETWORK"
      echo "VIDEO_INPUT : $VIDEO_INPUT"

      # Replace in config.json with default params for the current platform
      sed -i'.bak' -e "s/TO_REPLACE_VIDEO_INPUT/$VIDEO_INPUT/g" config.json
      sed -i'.bak' -e "s/TO_REPLACE_NEURAL_NETWORK/$NEURAL_NETWORK/g" config.json

      echo "Download, install and run opendatacam docker container"
      # Pull, install and run opendatacam container when docker starts (on boot with --restart unless-stopped, -d is for detached mode)
      sudo ./run-docker.sh run -d --restart unless-stopped opendatacam/opendatacam:$VERSION-$PLATFORM

      # Message that docker container has been started and opendatacam will be available shorty on <IP>
      echo "Opendatacam docker container installed successfully, it might take up to 1-2 min to start the node app and the webserver"
      
      wifiIP=$(ifconfig wlan0 | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1')
      ethernetIP=$(ifconfig eth0 | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.2')
      
      if [ -n "$wifiIP" ]; then
        echo "WIFI device IP"
        echo "Opendatacam is available at: http://$wifiIP:8080"
      fi

      if [ -n "$ethernetIP" ]; then
        echo "Ethernet device IP"
        echo "Opendatacam is available at: http://$ethernetIP:8080"
      fi

      echo "Opendatacam will start automaticaly on boot when you restart you jetson"
      echo "If you want to stop it, please refer to the doc: https://github.com/moovel/lab-opendatacam"

      ;;
    *)
      raise_error "Unknown argument: ${argument}"
      display_usage
      ;;
  esac
fi

