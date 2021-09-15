FROM opendatacam/opendatacam-darknet-base:v1.0.0-odc-Yolo-v3-desktop

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update && apt-get install -y jq wget

WORKDIR /var/local/darknet

# COPY weights, get them localy in the Dockerfile folder previously as they are slow to download each time
# Links: https://github.com/AlexeyAB/darknet#pre-trained-models
COPY yolov4.weights yolov4.weights

# Include demo.mp4 file
RUN mkdir opendatacam_videos && cd opendatacam_videos && wget https://github.com/opendatacam/opendatacam/raw/development/public/static/demo/demo.mp4

# Install node.js
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash - && \
    apt-get install -y nodejs

# Copy source into Docker image
COPY ./package*.json /var/local/opendatacam/
WORKDIR /var/local/opendatacam
RUN npm install

COPY ./ /var/local/opendatacam
RUN npm run build

# Set default settings for Desktop run
RUN sed -i -e 's+TO_REPLACE_PATH_TO_DARKNET+/var/local/darknet+g' config.json && \
  sed -i -e 's+TO_REPLACE_VIDEO_INPUT+file+g' config.json && \
  sed -i -e 's+TO_REPLACE_NEURAL_NETWORK+yolov4+g' config.json

EXPOSE 8080 8070 8090

COPY docker/build/desktop/launch.sh launch.sh
RUN chmod 777 launch.sh
CMD ["./launch.sh"]
