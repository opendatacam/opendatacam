#!/bin/bash
DOCKER_VOLUMES+="-v $(pwd)/config.json:/var/local/opendatacam/config.json "
# Mount a video directory for people to run on files
DOCKER_VOLUMES+="-v $(pwd)/opendatacam_videos:/var/local/darknet/opendatacam_videos:ro "
shift
# If usbcam add --device=/dev/video0:/dev/video0 ... Will improve to detect and add it auto from config.json
docker run --gpus=all -p 8080:8080 -p 8090:8090 -p 8070:8070 $DOCKER_VOLUMES -v /data/db:/data/db $@
