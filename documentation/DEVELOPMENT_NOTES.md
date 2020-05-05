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

- Generate up to date api documentation `npm run generateapidoc`
- Make sure that config.json has the TO_REPLACE_VIDEO_INPUT, TO_REPLACE_VIDEO_INPUT values that will be replaced by sed on installation
- Search and replace OLD_VERSION with NEW_VERSION in all documentation
- Make sure correct version in config.json > OPENDATACAM_VERSION
- Make sure correct version in package.json
- Make sure correct version in README "Install and start OpenDataCam" wget install script
- Make sure correct version in JETSON_NANO.md "Install OpenDataCam" wget install script
- Make sure correct VERSION in /docker/install-opendatacam.sh
- Push and Tag version on github
- Compile docker image on 4 platforms ( nano, tx2, xavier, nvidia-docker ) , upload them to dockerhub and tag them properly
- Add Release on github

### Tags commands

```
# Tag latest commit
git tag v3.0.0-beta.2

# Push tag
git push origin v3.0.0-beta.2

# List tags
git tag --list

# Remove tag on remote
git push origin :v3.0.0-beta.2

# Delete local tag
git tag --delete v3.0.0-beta.2

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

