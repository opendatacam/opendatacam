Using base image from Balena : https://github.com/balena-io-playground/jetson-base-images

See [https://github.com/balena-io-playground/jetson-base-images/blob/master/jetson-nano-cuda-cudnn-opencv-v0.2slim/Dockerfile](https://github.com/balena-io-playground/jetson-base-images/blob/master/jetson-nano-cuda-cudnn-opencv-v0.2slim/Dockerfile)

Dockerfile (10/06/2020)

```Dockerfile
FROM balenalib/jetson-nano-ubuntu:bionic as buildstep

WORKDIR /usr/src/app

# Files from the SDK
COPY ./cuda-repo-l4t-10-0-local-10.0.326_1.0-1_arm64.deb .
COPY ./libcudnn7_7.6.3.28-1+cuda10.0_arm64.deb .
COPY ./libcudnn7-dev_7.6.3.28-1+cuda10.0_arm64.deb .
COPY ./libcudnn7-doc_7.6.3.28-1+cuda10.0_arm64.deb .

ENV DEBIAN_FRONTEND noninteractive

## Install runtime & build libraries
RUN \
    dpkg -i cuda-repo-l4t-10-0-local-10.0.326_1.0-1_arm64.deb && \
    apt-key add /var/cuda-repo-10-0-local-10.0.326/*.pub && \
    dpkg -i libcudnn7_7.6.3.28-1+cuda10.0_arm64.deb \
    libcudnn7-dev_7.6.3.28-1+cuda10.0_arm64.deb \
    libcudnn7-doc_7.6.3.28-1+cuda10.0_arm64.deb && \
    apt-get update && \
    apt-get install -y cuda-compiler-10-0 \
    cuda-samples-10-0 \
    lbzip2 \
    git wget unzip \
    cmake automake build-essential \
    autoconf libtool \
    libgtk2.0-dev pkg-config \
    libavcodec-dev \
    libgstreamer1.0-0 \
    gstreamer1.0-plugins-base \
    gstreamer1.0-plugins-good \
    gstreamer1.0-plugins-bad \
    gstreamer1.0-plugins-ugly \
    gstreamer1.0-libav \
    gstreamer1.0-doc \
    gstreamer1.0-tools \
    libgstreamer1.0-dev \
    libgstreamer-plugins-base1.0-dev \
    libjpeg-dev \
    libpng-dev \
    libtiff-dev \
    ffmpeg \
    zlib1g-dev \
    libwebp-dev \
    libtbb2 libtbb-dev \
    libavcodec-dev libavformat-dev \
    libswscale-dev libv4l-dev && \
    rm -rf ./*.deb && \
    dpkg --remove cuda-repo-l4t-10-0-local-10.0.326 && \
    dpkg -P cuda-repo-l4t-10-0-local-10.0.326 && \
    echo "/usr/lib/aarch64-linux-gnu/tegra" > /etc/ld.so.conf.d/nvidia-tegra.conf && \
    ldconfig
	
## OpenCV

ENV OPENCV_RELEASE_TAG 4.1.1

RUN \
    wget https://github.com/opencv/opencv/archive/${OPENCV_RELEASE_TAG}.zip && \
    unzip ${OPENCV_RELEASE_TAG}.zip && rm ${OPENCV_RELEASE_TAG}.zip

RUN \
    wget https://github.com/opencv/opencv_contrib/archive/${OPENCV_RELEASE_TAG}.zip -O opencv_modules.${OPENCV_RELEASE_TAG}.zip && \
    unzip opencv_modules.${OPENCV_RELEASE_TAG}.zip && rm opencv_modules.${OPENCV_RELEASE_TAG}.zip && \
	mkdir -p opencv-${OPENCV_RELEASE_TAG}/build && cd opencv-${OPENCV_RELEASE_TAG}/build && \
	cmake -D WITH_CUDA=ON \
          -D OPENCV_EXTRA_MODULES_PATH=../../opencv_contrib-${OPENCV_RELEASE_TAG}/modules \
          -D CUDA_ARCH_BIN="5.3" \
          -D CMAKE_LIBRARY_PATH=/usr/local/cuda-10.0/lib64/stubs \
          -D CUDA_TOOLKIT_ROOT_DIR=/usr/local/cuda-10.0 \
          -D CMAKE_INSTALL_PREFIX=/usr/local \
          -D CMAKE_BUILD_TYPE=Release \
          -D WITH_GSTREAMER=ON \
          -D WITH_GSTREAMER_0_10=OFF \
          -D WITH_TBB=ON \
          -D WITH_LIBV4L=ON \
          -D WITH_FFMPEG=ON -DOPENCV_GENERATE_PKGCONFIG=ON .. && make -j5 && make install && \
    cp /usr/src/app/opencv-${OPENCV_RELEASE_TAG}/build/bin/opencv_version /usr/src/app/ && \
    cd /usr/src/app/ && rm -rf /usr/src/app/opencv-${OPENCV_RELEASE_TAG} && \
    rm -rf /usr/src/app/opencv_contrib-${OPENCV_RELEASE_TAG}

# ------------------------------------------------------------------


FROM balenalib/jetson-nano-ubuntu:bionic as final

WORKDIR /usr/src/app

COPY --from=buildstep /usr/local/cuda-10.0 /usr/local/cuda-10.0

# Minimum CUDA runtime libraries
COPY --from=buildstep /usr/lib/aarch64-linux-gnu /usr/lib/aarch64-linux-gnu

# OpenCV
COPY --from=buildstep /usr/local/lib /usr/local/lib
COPY --from=buildstep /usr/local/include/opencv4 /usr/local/include/opencv4

# CUDNN
COPY --from=buildstep /usr/include/cudnn.h /usr/include/cudnn.h
COPY --from=buildstep /etc/alternatives/libcudnn* /etc/alternatives/
COPY --from=buildstep /usr/include/aarch64-linux-gnu/cudnn_v7.h /usr/include/aarch64-linux-gnu/cudnn_v7.h

# set paths
ENV CUDA_HOME=/usr/local/cuda-10.0
ENV LD_LIBRARY_PATH=${CUDA_HOME}/lib64
ENV PATH=${CUDA_HOME}/bin:${PATH}
ENV UDEV=1
ENV PKG_CONFIG_PATH=/usr/local/lib/pkgconfig
    
COPY ./nvidia_drivers.tbz2 .
COPY ./config.tbz2 .

ENV DEBIAN_FRONTEND noninteractive

# Prepare minimum of runtime libraries
RUN apt-get update && apt-get install -y lbzip2 pkg-config git wget && \
    tar xjf nvidia_drivers.tbz2 -C / && \
    tar xjf config.tbz2 -C / --exclude=etc/hosts --exclude=etc/hostname && \
    echo "/usr/lib/aarch64-linux-gnu/tegra" > /etc/ld.so.conf.d/nvidia-tegra.conf && \ 
    echo "/usr/local/cuda-10.0/targets/aarch64-linux/lib" > /etc/ld.so.conf.d/cuda-10-0.conf && \
    ldconfig && \
    rm -rf *.tbz2

CMD [ "sleep", "infinity" ]

```