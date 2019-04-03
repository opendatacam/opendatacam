FROM arm64v8/ubuntu:18.04

# RUN apt-get update && apt-get install -y apt-utils bzip2 curl wget git sudo unp cmake && apt-get clean && rm -rf /var/cache/apt
# RUN apt-get -y autoremove && apt-get -y autoclean
# RUN rm -rf /var/cache/apt

RUN apt-get update
# RUN apt-get install -y \
#     libglew-dev \
#     libtiff5-dev \
#     zlib1g-dev \
#     libjpeg-dev \
#     libjasper-dev \
#     libavcodec-dev \
#     libavformat-dev \
#     libavutil-dev \
#     libpostproc-dev \
#     libswscale-dev \
#     libeigen3-dev \
#     libtbb-dev \
#     libgtk-3-dev \
#     libgstreamer1.0-0 \
#     libwayland-client0 \
#     libwayland-egl1-mesa \
#     libwayland-cursor0 \
#     qt5-default \
#     cmake \
#     pkg-config

RUN apt-get install -y libtbb-dev
RUN apt-get install -y qt5-default


# RUN apt-get install -y python-dev python-numpy python-py python-pytest -y
# RUN apt-get install -y libgstreamer1.0-dev libgstreamer-plugins-base1.0-dev
# RUN apt-get install -y ffmpeg

RUN apt-get install -y libgstreamer1.0-0 gstreamer1.0-plugins-base gstreamer1.0-plugins-good gstreamer1.0-plugins-bad gstreamer1.0-plugins-ugly gstreamer1.0-libav gstreamer1.0-doc gstreamer1.0-tools gstreamer1.0-x gstreamer1.0-alsa gstreamer1.0-gl gstreamer1.0-gtk3 gstreamer1.0-qt5 gstreamer1.0-pulseaudio

RUN apt-get install -y libv4l-dev


COPY darknet/ darknet/
#COPY deviceQuery /darknet
# COPY OpenCV-3.4.3-aarch64-dev.deb /
# COPY OpenCV-3.4.3-aarch64-libs.deb /
# COPY OpenCV-3.4.3-aarch64-python.deb /

# RUN dpkg -i OpenCV-3.4.3-aarch64-dev.deb
# RUN apt-get install -f
# RUN dpkg -i OpenCV-3.4.3-aarch64-libs.deb
# RUN dpkg -i OpenCV-3.4.3-aarch64-python.deb
# TODO HERE , opencv doesn't seems to be installed, run docker with interactive mode and debug, maybe install from .deb files

ADD opencv-3.4.3.tar.gz /

#COPY video-stuttgart-10-fps-sd.mp4 darknet/

# One time this worked to make the webcam access, while running it in the interactive shell
# RUN sudo rm -rf ${HOME}/.cache/*

# Install Mongodb
# https://github.com/dockerfile/mongodb#run-mongod-w-persistentshared-directory
ENV DEBIAN_FRONTEND noninteractive
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 9DA31620334BD75D9DCB49F368818C72E52529D4 && \
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/4.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-4.0.list
RUN apt-get update && apt-get install -y openssl libcurl3 mongodb-org
VOLUME ["/data/db"]
EXPOSE 27017

# Install node.js
RUN apt-get install -y libcurl4 curl
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -
RUN apt-get install -y nodejs

# Technique to rebuild the docker file from here : https://stackoverflow.com/a/49831094/1228937
# Build using date > marker && docker build .
# date > marker && sudo docker build -t opendatacam .
# COPY marker /dev/null

RUN apt-get install -y git

RUN git clone --depth 1 -b v2 https://github.com/moovel/lab-opendatacam /lab-opendatacam

WORKDIR /lab-opendatacam

RUN npm install
RUN npm run build

EXPOSE 8080 8070 8090

# Because we want to run mongodb and the node.js app
# See https://docs.docker.com/config/containers/multi-service_container/
COPY startopendatacam.sh startopendatacam.sh
CMD ./startopendatacam.sh