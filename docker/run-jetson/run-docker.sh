#!/bin/bash
# Mount config.json
DOCKER_VOLUMES+="-v $(pwd)/config.json:/var/local/opendatacam/config.json "
# Mount a video directory for people to run on files
DOCKER_VOLUMES+="-v $(pwd)/opendatacam_videos:/var/local/darknet/opendatacam_videos:ro "
# Mount mongodb data directory
DOCKER_VOLUMES+="-v /data/db:/data/db "
# Mount argus socket for CSI cam access
DOCKER_VOLUMES+="-v /tmp/argus_socket:/tmp/argus_socket "
shift
# We use --priviliged here because usb cam access cam be /dev/video0 or /dev/video1 or something else
# If you don't want to use --priviliged, you will need to manually mount the right --device in order for
# the docker container to be able to access it.. For example:
# --device=/dev/video0:/dev/video0
# We don't do that by default because if the device isn't mounted on this location, docker run will fail
# and we didn't find a way yet to be smart about this and guess which device to mount
sudo docker run --runtime nvidia -p 8080:8080 -p 8090:8090 -p 8070:8070 --privileged $DOCKER_VOLUMES $@