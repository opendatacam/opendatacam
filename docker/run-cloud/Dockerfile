FROM arm64v8/ubuntu:16.04

# ENV LD_LIBRARY_PATH=/usr/lib/aarch64-linux-gnu/tegra

# Install dependencies via package manager

# RUN apt-get update && apt-get install -y \
#       build-essential \
#       pkg-config \
#       curl \
#       git-core

# If this one does not work, maybe try: https://github.com/janza/docker-python3-opencv/blob/master/Dockerfile

# Dependencies
RUN apt-get update && \ 
    apt-get upgrade -y && \ 
    apt-get install -y curl wget unzip build-essential cmake git libgtk2.0-dev pkg-config libavcodec-dev libavformat-dev libswscale-dev libtbb2 libtbb-dev libjpeg-dev libpng-dev libtiff-dev libdc1394-22-dev

# Download OPENCV
RUN mkdir -p /tmp/opencv && \ 
    cd /tmp/opencv && \ 
    wget --show-progress --quiet -O opencv.zip https://github.com/opencv/opencv/archive/3.4.2.zip && \ 
    unzip -o -q opencv.zip && \ 
    wget --show-progress --quiet -O opencv_contrib.zip https://github.com/opencv/opencv_contrib/archive/3.4.2.zip && \ 
    unzip -o -q opencv_contrib.zip && \ 
    rm opencv.zip opencv_contrib.zip 

# Build OPENCV
RUN cd /tmp/opencv/opencv-3.4.2 && \ 
    mkdir build && \ 
    cd build && \ 
    cmake -D CMAKE_BUILD_TYPE=RELEASE \
          -D CMAKE_INSTALL_PREFIX=/usr/local \ 
          -D OPENCV_EXTRA_MODULES_PATH=/tmp/opencv/opencv_contrib-3.4.2/modules \ 
          -D BUILD_DOCS=OFF \ 
          -D BUILD_EXAMPLES=OFF \ 
          -D BUILD_TESTS=OFF \ 
          -D BUILD_PERF_TESTS=OFF \ 
          -D BUILD_opencv_java=OFF \ 
          -D BUILD_opencv_python=OFF \ 
          -D BUILD_opencv_python2=OFF \ 
          -D BUILD_opencv_python3=OFF .. && \ 
    make -j1 && \ 
    make install && \ 
    rm -rf /tmp/opencv

# Install nodejs

#RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -
#RUN apt-get install -y nodejs

# Install YOLO implem (darknet)
# Installing from own fork because we need to have the correct settings for TX2 in the makefile 
# TODO fork properly from moovellab account
RUN git clone https://github.com/tdurand/darknet.git && make -C darknet

# Get weight files (VOC)
RUN wget http://pjreddie.com/media/files/yolo-voc.weights -P darknet/


WORKDIR /darknet

# Run darknet
CMD ["./darknet detector demo cfg/voc.data cfg/yolo-voc.cfg yolo-voc.weights -c 0 -ext_output -dont_show -json_port 8070 -mjpeg_port 8090"]

