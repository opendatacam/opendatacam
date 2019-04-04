FROM arm64v8/ubuntu:18.04

## Install some dependencies
RUN apt-get update
RUN apt-get install -y libtbb-dev
RUN apt-get install -y qt5-default
RUN apt-get install -y libgstreamer1.0-0 gstreamer1.0-plugins-base gstreamer1.0-plugins-good gstreamer1.0-plugins-bad gstreamer1.0-plugins-ugly gstreamer1.0-libav gstreamer1.0-doc gstreamer1.0-tools gstreamer1.0-x gstreamer1.0-alsa gstreamer1.0-gl gstreamer1.0-gtk3 gstreamer1.0-qt5 gstreamer1.0-pulseaudio
RUN apt-get install -y libv4l-dev

# Install pre-compiled darknet on docker
COPY darknet/ darknet/

# Installed opencv precompiled version on jetson
ADD opencv-3.4.3.tar.gz /

# Install node.js
RUN apt-get install -y libcurl4 curl
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -
RUN apt-get install -y nodejs

RUN apt-get install -y git

# Technique to rebuild the docker file from here : https://stackoverflow.com/a/49831094/1228937
# Build using date > marker && docker build .
# date > marker && sudo docker build -t opendatacam .
COPY marker /dev/null

RUN git clone --depth 1 -b v2 https://github.com/moovel/lab-opendatacam /lab-opendatacam

WORKDIR /lab-opendatacam

RUN npm install
RUN npm run build

# Install Mongodb
# NB: for some reason this needs to be at the end otherwise mongod command isn't installed
# https://github.com/dockerfile/mongodb#run-mongod-w-persistentshared-directory
ENV DEBIAN_FRONTEND noninteractive
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 9DA31620334BD75D9DCB49F368818C72E52529D4 && \
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/4.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-4.0.list
RUN apt-get update && apt-get install -y openssl libcurl3 mongodb-org
VOLUME ["/data/db"]

EXPOSE 8080 8070 8090 27017

# # Because we want to run mongodb and the node.js app
# # See https://docs.docker.com/config/containers/multi-service_container/
COPY startopendatacam.sh startopendatacam.sh
CMD ./startopendatacam.sh