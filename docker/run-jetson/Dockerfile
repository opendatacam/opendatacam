FROM nvcr.io/nvidia/l4t-base:r32.3.1

RUN  apt-get update -y && apt-get install -y \
            libgstreamer1.0-0 \
            gstreamer1.0-plugins-base \
            gstreamer1.0-plugins-good \
            gstreamer1.0-plugins-bad \
            gstreamer1.0-plugins-ugly \
            gstreamer1.0-libav \
            gstreamer1.0-doc \
            gstreamer1.0-tools \
            libgstreamer1.0-dev \
            libgstreamer-plugins-base1.0-dev
RUN  apt-get update -y && apt-get install -y  pkg-config \
 zlib1g-dev  libwebp-dev \
 libtbb2 libtbb-dev  \
 libgtk2.0-dev pkg-config libavcodec-dev libavformat-dev libswscale-dev libv4l-dev \
 cmake
RUN apt-get install -y \
  autoconf \
  autotools-dev \
  build-essential \
  gcc \
  git
RUN apt-get update -y && apt-get install -y ffmpeg
ENV OPENCV_RELEASE_TAG 4.1.1
RUN git clone --depth 1 -b ${OPENCV_RELEASE_TAG}  https://github.com/opencv/opencv.git /var/local/git/opencv
RUN cd /var/local/git/opencv
RUN mkdir -p /var/local/git/opencv/build && \
    cd /var/local/git/opencv/build $$ && \
    cmake -D CMAKE_INSTALL_PREFIX=/usr/local CMAKE_BUILD_TYPE=Release -D WITH_GSTREAMER=ON -D WITH_GSTREAMER_0_10=OFF -D WITH_CUDA=OFF -D WITH_TBB=ON -D WITH_LIBV4L=ON WITH_FFMPEG=ON -DOPENCV_GENERATE_PKGCONFIG=ON ..
RUN  cd /var/local/git/opencv/build && \
      make install

# Install pre-compiled darknet on docker
COPY darknet/ /var/local/darknet/

# Install node.js
RUN apt-get install -y libcurl4 curl
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -
RUN apt-get install -y nodejs

# Technique to rebuild the docker file from here : https://stackoverflow.com/a/49831094/1228937
# Build using date > marker && docker build .
# date > marker && sudo docker build -t opendatacam .
#COPY marker /dev/null

RUN git clone --depth 1 -b development https://github.com/opendatacam/opendatacam /var/local/opendatacam

WORKDIR /var/local/opendatacam

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
COPY docker-start-mongo-and-opendatacam.sh docker-start-mongo-and-opendatacam.sh
RUN chmod 777 docker-start-mongo-and-opendatacam.sh
CMD ./docker-start-mongo-and-opendatacam.sh