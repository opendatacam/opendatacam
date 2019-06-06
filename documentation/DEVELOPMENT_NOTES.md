## Run simulation mode

Simulation mode is useful to work on the UI and node.js feature deployment without having to run the neural network / the webcam.

**Dependency:** Mongodb installed _(optional, only to record data)_ : [see tutorial](https://docs.mongodb.com/manual/installation/#mongodb-community-edition)

```bash
# Clone repo
git@github.com:moovel/opendatacam.git
# Install dependencies
npm i
# Run in dev mode
npm run dev
# Open browser on http://localhost:8080/
```

If you have an error while doing `npm install` it is probably a problem with node-gyp, you need to install additional dependencies depending on your platform: https://github.com/nodejs/node-gyp#on-unix

# List all cams

```bash
v4l2-ctl --list-devices
```

## Stuff to do with releasing a new version

- Make sure that config.json has the TO_REPLACE_VIDEO_INPUT, TO_REPLACE_VIDEO_INPUT values
- Set correct version in package.json
- Set correct version in README "Install and start Opendatacam" wget install script
- Set correct VERSION in /docker/run-jetson/install-opendatacam.sh
- Tag version on github
- Compile docker image on 3 platform ( nano, tx2, xavier ) , upload them to dockerhub and tag them properly


### Tags commands

```
# List tags
git tag --list

# Remove tag on remote
git push origin :v2.0.0-beta.3

# Delete local tag
git tag --delete v2.0.0-beta.3

# Tag latest commit
git tag v2.0.0-beta.3

# Push tag
git push --tags
```
