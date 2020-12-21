## Development notes

### Run in simulation mode

Simulation mode is useful to work on the UI and node.js feature deployment without having to run the neural network / the webcam.

**Dependency:** Mongodb installed _(optional, only to record data)_ : [see tutorial](https://docs.mongodb.com/manual/installation/#mongodb-community-edition)

```bash
# Clone repo
git clone https://github.com/opendatacam/opendatacam.git

or

git@github.com:opendatacam/opendatacam.git
# Install dependencies
npm i
# Run in dev mode
npm run dev
# Open browser on http://localhost:8080/
```

If you have an error while doing `npm install` it is probably a problem with node-gyp, you need to install additional dependencies depending on your platform: https://github.com/nodejs/node-gyp#on-unix

#### Simulation Mode

The new simulation mode allows to feed YOLO JSON detections into OpenDataCam. As for the video either pre-extracted frames or a video file where the frames will be extracted using [`ffmpeg`](https://ffmpeg.org/).

The simulation can be customized in the OpenDataCam config by adding it as a new video source.

```json
"VIDEO_INPUTS_PARAMS": {
  "simulation": "--yolo_json public/static/placeholder/alexeydetections30FPS.json --video_file_or_folder public/static/placeholder/frames --isLive true --jsonFps 20 --mjpgFps 0.2"
}
```

Whereas

- `yolo_json`: A relative or absolute path to the JSON file to use.
  For relative paths, the repository root will be used as the base.
- `video_file_or_folder`: A file or folder to find JPGs.
  If it's a file the images will be extracted using `ffmpeg`.
  If it's a file it will expect `001.jpg`, `002.jpg`, ..., `101.jpg`, ... to be present there.
- `isLive`: Should the simulation behave like a live source (e.g. WebCam), or like a file.
  If `true`, the simulation will silently loop from the beginning without killing the stream.
  If `false`, the simulation will kill the streams at the end of JSON file just like Darknet.
- `jsonFps`: Approximate frames per second for the JSON stream.
- `mjpgFps`: **Only when using `ffmpeg`**. Approximate frames per second for the MJPG stream.
  Having this set lower than `jsonFps`, will make the video skip a few frames.
- `darknetStdout`: If the simulation should mimic the output of Darknet on stdout.
- `json_port`: The TCP port for JSON streaming
- `mjpg_port`: The TCP port for MJGP streeaming

The simulation JSON and MJPG streams can also be started without Opendatacam by invoking `node scripts/YoloSimulation.js` from the repository root folder.

### Release checklist

- For next release only: Set $VERSION instead of master for the Kubernete install script, see: https://github.com/opendatacam/opendatacam/pull/247
- Make sure that config.json has the TO_REPLACE_VIDEO_INPUT, TO_REPLACE_VIDEO_INPUT values that will be replaced by sed on installation
- Search and replace OLD_VERSION with NEW_VERSION in all documentation
- Make sure correct version in config.json > OPENDATACAM_VERSION
- Make sure correct version in package.json
- Make sure correct version in README "Install and start OpenDataCam" wget install script
- Make sure correct version in JETSON_NANO.md "Install OpenDataCam" wget install script
- Make sure correct VERSION in /docker/install-opendatacam.sh
- Generate up to date api documentation `npm run generateapidoc`
- Push and Tag version on github
- Compile docker image on 4 platforms ( nano, tx2, xavier, nvidia-docker ) , upload them to dockerhub and tag them properly
- Add Release on github

### Tags commands

```
# Tag latest commit
git tag v3.0.1

# Push tag
git push origin v3.0.1

# List tags
git tag --list

# Remove tag on remote
git push origin :v3.0.1

# Delete local tag
git tag --delete v3.0.1

# Push all tag
git push --tags
```

### Markdown table of content generator

https://ecotrust-canada.github.io/markdown-toc/

### List all cams

```bash
v4l2-ctl --list-devices
```

### Technical architecture

![Technical architecture](https://user-images.githubusercontent.com/533590/60489282-3f2d1700-9ca4-11e9-932c-19bf84e04f9a.png)

### Code Style

Opendatacam uses the https://github.com/airbnb/javascript style.
You can run `npm run lint` to check the whole code base.
Or `npx eslint yourfile.js` to check only a single file.
