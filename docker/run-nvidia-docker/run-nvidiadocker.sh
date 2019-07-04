#!/bin/bash
DOCKER_VOLUMES+="-v $(pwd)/config.json:/var/local/opendatacam/config.json "
# Mount a video directory for people to run on files
DOCKER_VOLUMES+="-v $(pwd)/opendatacam_videos:/var/local/darknet/opendatacam_videos:ro "
shift
docker run --runtime=nvidia -p 8080:8080 -p 8090:8090 -p 8070:8070 --privileged $DOCKER_VOLUMES -v /data/db:/data/db $@
