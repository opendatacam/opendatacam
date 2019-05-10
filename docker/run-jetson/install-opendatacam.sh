#!/bin/bash

# exit when any command fails
set -e

# Each opendatacam release should set the correct version here and tag appropriatly on github
VERSION=v2.0.0-beta.2
# PLATFORM in ["nano","xavier","tx2","dockernvidia"]
PLATFORM=undefined
VIDEO_INPUT=undefined

# DEFAULT config for opendatacam depending on platform
DEFAUT_VIDEO_INPUT_nano=raspberrycam
DEFAUT_VIDEO_INPUT_tx2=usbcam
DEFAUT_VIDEO_INPUT_xavier=usbcam

DEFAUT_NEURAL_NETWORK_nano=yolov3-tiny
DEFAUT_NEURAL_NETWORK_tx2=yolov2-voc
DEFAUT_NEURAL_NETWORK_xavier=yolov3


# animals_moo=cow; sound=moo; i="animals_$sound"; echo "${!i}"

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
      # TODO Check if existing docker image is running and stop it if it is the case

      # Platform is specified 
      PLATFORM=$2
      # TODO verify if PLATFORM is oneOf(nano, xavier, tx2)
      echo "Installing opendatacam $VERSION for platform: $2"
      # Get the run-docker script
      wget -N https://raw.githubusercontent.com/moovel/lab-opendatacam/$VERSION/docker/run-jetson/run-docker.sh

      # Chmod to give exec permissions
      chmod 777 run-docker.sh

      # Get the config file
      wget -N https://raw.githubusercontent.com/moovel/lab-opendatacam/$VERSION/config.json

      # Replace VIDEO_INPUT and NEURAL_NETWORK with default config for this platform

      # Bash hacks
      VIDEO_INPUT="DEFAUT_VIDEO_INPUT_$PLATFORM"
      VIDEO_INPUT=${!VIDEO_INPUT}

      NEURAL_NETWORK="DEFAUT_NEURAL_NETWORK_$PLATFORM"
      NEURAL_NETWORK=${!NEURAL_NETWORK}

      # Replace in config.json with default params for the current platform
      sed -i'.bak' -e "s/TO_REPLACE_VIDEO_INPUT/$VIDEO_INPUT/g" config.json
      sed -i'.bak' -e "s/TO_REPLACE_NEURAL_NETWORK/$NEURAL_NETWORK/g" config.json

      # Pull, install and run opendatacam container when docker starts (on boot with --restart unless-stopped, -d is for detached mode)
      sudo ./run-docker.sh run -d --restart unless-stopped tdurand/opendatacam:$VERSION

      # Message that docker container has been started and opendatacam will be available shorty on <IP>
      echo "Opendatacam docker container started successfully, it might take up to 1 min to start the node app"
      echo "Open browser at http://<IP_OF_JETSON>:8080 or http://localhost:8080"
      echo "Opendatacam will start automaticaly on boot when you restart you jetson"
      echo "If you want to stop it or update it blabalbalabl"

      ;;
    *)
      raise_error "Unknown argument: ${argument}"
      display_usage
      ;;
  esac
fi

echo "Finished script $0"


# "SETTINGS_BY_PLATFORM": {
#     "nano": {
#       "VIDEO_INPUT": "raspberrycam",
#       "NEURAL_NETWORK": "yolov3-tiny"
#     },
#     "tx2": {
#       "VIDEO_INPUT": "usbcam",
#       "NEURAL_NETWORK": "yolov2-voc"
#     },
#     "xavier": {
#       "VIDEO_INPUT": "usbcam",
#       "NEURAL_NETWORK": "yolov3"
#     }
#   },



