#!/bin/bash

# This script is meant to serve as a placeholder until nvidia-docker is
# available on the Jetson platform. Its recommended usage is the equivalent to a
# vanilla `docker run` command with no spaces between `docker` and `run`:
#
# It does mount all the necessary dependencies for GPU usage from the docker image, like CUDA, CUDNN
#
# ./run-docker run --rm -it somedockerimage to run interactively
#

# Reference: strace -v -f /darknet/darknet detector test cfg/voc.data cfg/tiny-yolo-voc.cfg tiny-yolo-voc.weights data/dog.jpg 2>&1 | grep etc

if [ "$1" != "run" ]; then
    docker $@
else
    #DOCKER_VOLUMES=`find /usr/lib -name *cuda* 2> /dev/null | perl -pe 's/(.*)/-v $1:$1:ro /'`
    #DOCKER_VOLUMES+=`find /usr/lib -name *cudnn* 2> /dev/null | perl -pe 's/(.*)/-v $1:$1:ro /'`
    DOCKER_VOLUMES+=`find /usr/lib/aarch64-linux-gnu -name libgstnv* 2> /dev/null | perl -pe 's/(.*)/-v $1:$1:ro /'`
    DOCKER_VOLUMES+=`find /usr/lib/aarch64-linux-gnu -name libgstbad* 2> /dev/null | perl -pe 's/(.*)/-v $1:$1:ro /'`
    DOCKER_VOLUMES+=`find /usr/lib/aarch64-linux-gnu -name libGL* 2> /dev/null | perl -pe 's/(.*)/-v $1:$1:ro /'`
    # DOCKER_VOLUMES+=`find /usr/lib/aarch64-linux-gnu -name libv4l* 2> /dev/null | perl -pe 's/(.*)/-v $1:$1:ro /'`
    DOCKER_VOLUMES+=`find /etc -name *cuda* 2> /dev/null | perl -pe 's/(.*)/-v $1:$1:ro /'`
    DOCKER_VOLUMES+=`find /etc -name *cudnn* 2> /dev/null | perl -pe 's/(.*)/-v $1:$1:ro /'`
    DOCKER_VOLUMES+=`find /etc -name nv* 2> /dev/null | perl -pe 's/(.*)/-v $1:$1:ro /'`
    DOCKER_VOLUMES+='-v /usr/local/cuda-10.0:/usr/local/cuda-10.0:ro '
    DOCKER_VOLUMES+='-v /usr/local/cuda:/usr/local/cuda:ro '
    DOCKER_VOLUMES+='-v /var/cuda-repo-10-0-local:/var/cuda-repo-10-0-local:ro '
    # DOCKER_VOLUMES+='-v /var/nv-tensorrt-repo-ga-cuda10.0-trt3.0.4-20180208:/var/nv-tensorrt-repo-ga-cuda9.0-trt3.0.4-20180208:ro '
    DOCKER_VOLUMES+='-v /var/nvidia:/var/nvidia:ro '
    DOCKER_VOLUMES+='-v /etc/nvidia:/etc/nvidia:ro '
    DOCKER_VOLUMES+='-v /etc/alternatives:/etc/alternatives:ro '
    DOCKER_VOLUMES+='-v /etc/ld.so.cache:/etc/ld.so.cache:ro '
    DOCKER_VOLUMES+='-v /usr/lib/aarch64-linux-gnu/tegra:/usr/lib/aarch64-linux-gnu/tegra:ro '
    DOCKER_VOLUMES+='-v /usr/lib/aarch64-linux-gnu/tegra-egl:/usr/lib/aarch64-linux-gnu/tegra-egl:ro '
    # Overwrite the config.json file of the docker image with the one of the local machine
    # TODO maybe move this on a ./run-opendatacam script that just set this + the mongodb folder
    DOCKER_VOLUMES+="-v $(pwd)/config.json:/opendatacam/config.json "
    # Mount a video directory for people to run on files
    DOCKER_VOLUMES+="-v $(pwd)/opendatacam_videos:/darknet/opendatacam_videos:ro "
    shift
    docker run -p 8080:8080 -p 8090:8090 -p 8070:8070 --privileged $DOCKER_VOLUMES -v /data/db:/data/db $@
fi