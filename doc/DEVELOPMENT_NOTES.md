## Stuff to do with releasing a new version

- Set correct VERSION in /docker/run-jetson/install-opendatacam.sh
- Tag version on github
- Compile docker image on 3 platform ( nano, tx2, xavier ) , upload them to dockerhub and tag them properly



### Tags commands

```
# List tags
git tag --list

# Remove tag on remote
git push origin :tagname

# Delete local tag
git tag --delete tagname

# Tag latest commit
git tag tagname

# Push tag
git push --tags
```
