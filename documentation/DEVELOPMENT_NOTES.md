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

### Release checklist

- For next release only: Set $VERSION instead of master for the Kubernete install script, see: https://github.com/opendatacam/opendatacam/pull/247
- Make sure that config.json has the TO_REPLACE_VIDEO_INPUT, TO_REPLACE_VIDEO_INPUT values that will be replaced by sed on installation
- Search and replace OLD_VERSION with NEW_VERSION in all documentation
- Make sure correct version in config.json > OPENDATACAM_VERSION
- Make sure correct version in package.json
- Make sure correct version in README "Install and start OpenDataCam" wget install script
- Make sure correct version in JETSON_NANO.md "Install OpenDataCam" wget install script
- Make sure correct VERSION in /docker/install-opendatacam.sh
- Generate up to date api documentation `npm run generateapidoc` (not needed anymore since https://github.com/opendatacam/opendatacam/pull/336)
- Add Release on github

After you've added the release to GitHub, a GitHub Action Workflow will create the Docker images and automatically upload them to Docker Hub.
It is no longer necessary to create a git tag or Docker Images manually.

### Markdown table of content generator

https://ecotrust-canada.github.io/markdown-toc/

### List all cams

```bash
v4l2-ctl --list-devices
```

### Technical architecture

![Technical architecture](https://user-images.githubusercontent.com/533590/60489282-3f2d1700-9ca4-11e9-932c-19bf84e04f9a.png)

