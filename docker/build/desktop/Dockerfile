FROM opendatacam/base-desktop-nvidia-cuda-opencv-gstreamer:1.0

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update && apt-get install -y jq wget

# Start Darknet Install
RUN git clone --depth 1 -b odc https://github.com/opendatacam/darknet /var/local/darknet

WORKDIR /var/local/darknet

RUN sed -i -e s/GPU=0/GPU=1/ Makefile;
RUN sed -i -e s/CUDNN=0/CUDNN=1/ Makefile;
RUN sed -i -e s/OPENCV=0/OPENCV=1/ Makefile;

RUN make

# COPY weights, get them localy in the Dockerfile folder previously as they are slow to download each time
# Links: https://github.com/AlexeyAB/darknet#pre-trained-models
COPY yolov4.weights yolov4.weights

# Include demo.mp4 file
RUN mkdir opendatacam_videos && cd opendatacam_videos && wget https://github.com/opendatacam/opendatacam/raw/development/public/static/demo/demo.mp4

# Install node.js
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash - && \
    apt-get install -y nodejs

RUN git clone --depth 1 -b v3.0.1 https://github.com/opendatacam/opendatacam /var/local/opendatacam

WORKDIR /var/local/opendatacam

RUN npm install
RUN npm run build

# Set default settings for Desktop run
RUN sed -i -e 's+TO_REPLACE_PATH_TO_DARKNET+/var/local/darknet+g' config.json;
RUN sed -i -e 's+TO_REPLACE_VIDEO_INPUT+file+g' config.json;
RUN sed -i -e 's+TO_REPLACE_NEURAL_NETWORK+yolov4+g' config.json;

EXPOSE 8080 8070 8090

COPY launch.sh launch.sh
RUN chmod 777 launch.sh
CMD ["./launch.sh"]
