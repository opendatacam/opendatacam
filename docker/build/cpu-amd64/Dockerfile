ARG DARKNET_VERSION=v2.0.0-beta3

FROM opendatacam/darknet:$DARKNET_VERSION-cpu-amd64

ENV DEBIAN_FRONTEND noninteractive

ARG NODE_MAJOR=20

RUN apt-get update \
    && apt-get install --no-install-recommends --no-install-suggests -y jq wget \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Install node.js
RUN apt-get update \
    && apt-get install --no-install-recommends --no-install-suggests -y curl gnupg ca-certificates \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get install --no-install-recommends --no-install-suggests -y nodejs \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

WORKDIR /var/local/darknet

# COPY weights, get them localy in the Dockerfile folder previously as they are slow to download each time
# Links: https://github.com/AlexeyAB/darknet#pre-trained-models
COPY yolov4-tiny.weights yolov4-tiny.weights

# Include demo.mp4 file
RUN mkdir opendatacam_videos && cd opendatacam_videos && wget https://github.com/opendatacam/opendatacam/raw/development/public/static/demo/demo.mp4

# Copy source into Docker image
COPY ./package*.json /var/local/opendatacam/
WORKDIR /var/local/opendatacam
RUN npm install

COPY ./ /var/local/opendatacam
RUN npm run build

# Set default settings for Desktop run
RUN sed -i -e 's+TO_REPLACE_PATH_TO_DARKNET+/var/local/darknet+g' config.json && \
  sed -i -e 's+TO_REPLACE_VIDEO_INPUT+file+g' config.json && \
  sed -i -e 's+TO_REPLACE_NEURAL_NETWORK+yolov4-tiny+g' config.json

EXPOSE 8080 8070 8090

COPY docker/build/nano/launch.sh launch.sh
RUN chmod 777 launch.sh
CMD ["./launch.sh"]