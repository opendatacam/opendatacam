#!/bin/bash

# Modify config.json based on config vars (requires install of jq JSON processor utility)

if [[ -z $VIDEO_INPUT ]]; then
  a=$(cat config.json | jq '.VIDEO_INPUT')
  echo 'Using video input value from config.json: '$a
else
  echo 'Using video input value from dashboard device variable: '$VIDEO_INPUT
  jq '.VIDEO_INPUT = env.VIDEO_INPUT' config.json > "tmp" && mv "tmp" config.json
fi

if [[ -z $INPUT_FILE ]]; then
  a=$(cat config.json | jq '.VIDEO_INPUTS_PARAMS.file')
  echo 'Using video input file value from config.json: '$a
else
  echo 'Using video input file value from dashboard device variable: '$INPUT_FILE
  jq '.VIDEO_INPUTS_PARAMS.file = env.INPUT_FILE' config.json > "tmp" && mv "tmp" config.json
fi

if [[ -z $INPUT_USBCAM ]]; then
  a=$(cat config.json | jq '.VIDEO_INPUTS_PARAMS.usbcam')
  echo 'Using video input usbcam value from config.json: '$a
else
  echo 'Using video input usbcam value from dashboard device variable: '$INPUT_USBCAM
  jq '.VIDEO_INPUTS_PARAMS.usbcam = env.INPUT_USBCAM' config.json > "tmp" && mv "tmp" config.json
fi

if [[ -z $INPUT_REMOTE_CAM ]]; then
  a=$(cat config.json | jq '.VIDEO_INPUTS_PARAMS.remote_cam')
  echo 'Using video input remote_cam value from config.json: '$a
else
  echo 'Using video input remote_cam value from dashboard device variable: '$INPUT_REMOTE_CAM
  jq '.VIDEO_INPUTS_PARAMS.remote_cam = env.INPUT_REMOTE_CAM' config.json > "tmp" && mv "tmp" config.json
fi

# Change local URLs to container name
sed -i "s;parsedUrl\[0\];'opendatacam';" server/utils/urlHelper.js

# Sleep 5s to let mongod some time to initialize
sleep 5

# Start the OpenDataCam process
npm run start
status=$?
if [ $status -ne 0 ]; then
  echo "Failed to start npm run start: $status"
  exit $status
fi
