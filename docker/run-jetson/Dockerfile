FROM arm64v8/ubuntu:16.04

RUN apt-get update && apt-get install -y apt-utils bzip2 curl wget git sudo unp cmake && apt-get clean && rm -rf /var/cache/apt
RUN apt-get -y autoremove && apt-get -y autoclean
RUN rm -rf /var/cache/apt

RUN apt-get update
RUN apt-get install -y \
    libglew-dev \
    libtiff5-dev \
    zlib1g-dev \
    libjpeg-dev \
    libpng12-dev \
    libjasper-dev \
    libavcodec-dev \
    libavformat-dev \
    libavutil-dev \
    libpostproc-dev \
    libswscale-dev \
    libeigen3-dev \
    libtbb-dev \
    libgtk-3-dev \
    libgstreamer1.0-0 \
    libwayland-client0 \
    libwayland-egl1-mesa \
    libwayland-cursor0 \
    cmake \
    pkg-config

RUN apt-get install -y python-dev python-numpy python-py python-pytest -y
RUN apt-get install -y libgstreamer1.0-dev libgstreamer-plugins-base1.0-dev
# RUN apt-get install -y ffmpeg

COPY darknet/ darknet/
#COPY deviceQuery /darknet
#COPY OpenCV-3.4.0-aarch64-dev.deb /darknet
#COPY OpenCV-3.4.0-aarch64-libs.deb /darknet
#COPY OpenCV-3.4.0-aarch64-python.deb /darknet

ADD OpenCV-3.4.3-aarch64.tar.gz /

# Install node.js
RUN curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
RUN apt-get install -y nodejs
RUN apt-get install make gcc g++ python

# Technique to rebuild the docker file from here : https://stackoverflow.com/a/49831094/1228937
# Build using date > marker && docker build .
# date > marker && sudo docker build -t opendatacam .
# COPY marker /dev/null

RUN git clone --depth 1 -b v2 https://github.com/moovel/lab-opendatacam /lab-opendatacam

WORKDIR /lab-opendatacam

RUN npm install
RUN npm run build

EXPOSE 8080 8070 8090

CMD ["npm", "start"]