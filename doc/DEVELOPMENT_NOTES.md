## Stuff to do with releasing a new version

- Set correct VERSION in /docker/run-jetson/install-opendatacam.sh
- Tag version on github
- Compile docker image on 3 platform ( nano, tx2, xavier ) , upload them to dockerhub and tag them properly



### Tags commands

```
# List tags
git tag --list

# Remove tag on remote
git push origin :v2.0.0-beta.2

# Delete local tag
git tag --delete v2.0.0-beta.2

# Tag latest commit
git tag v2.0.0-beta.2

# Push tag
git push --tags
```
