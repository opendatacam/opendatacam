FROM nvidia/cuda:10.2-cudnn7-devel-ubuntu18.04

# Install  Gstreamer and OpenCV Pre-requisite libs
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
      make -j8 install

CMD [ "sleep", "infinity" ]