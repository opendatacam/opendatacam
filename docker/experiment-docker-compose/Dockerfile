FROM arm64v8/ubuntu:18.04

RUN apt-get update && apt-get install -y apt-utils bzip2 curl wget git sudo unp cmake && apt-get clean && rm -rf /var/cache/apt
RUN apt-get -y autoremove && apt-get -y autoclean
RUN rm -rf /var/cache/apt

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

# Install node.js
# RUN curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
# RUN apt-get install -y nodejs
# RUN apt-get install make gcc python
# RUN apt-get install make gcc g++ python

# TODO HERE , buffertool for node needs some dependencies and fails on npm install, missing stuff

# Technique to rebuild the docker file from here : https://stackoverflow.com/a/49831094/1228937
# Build using date > marker && docker build .
# date > marker && sudo docker build -t opendatacam .
# COPY marker /dev/null

# RUN git clone --depth 1 https://github.com/opendatacam/opendatacam /opendatacam

# WORKDIR /opendatacam

# RUN npm install
# RUN npm run build

# EXPOSE 8080 8070 8090

# CMD ["npm", "start"]