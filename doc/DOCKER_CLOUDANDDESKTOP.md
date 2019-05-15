## How to create / update / run the docker image for non jetson devices

In order to build or run the docker image, you need to have:

- An ubuntu computer/server with a Nvidia CUDA GPU : https://developer.nvidia.com/cuda-gpus

Depending on your target GPU, you will need to change the CUDA_ARCH_BIN variable in the Dockerfile

TODO @tdurand improve this

### WIP , make docker image smaller 

For now the docker image is very large (12GB)

Need to try use the lightweight runtime of nvidia/cuda to have a build part and a run part

Would need to copy the opencv compiled file (maybe the deb as with the jetson), and the darknet compiled folder directly

Links:

https://github.com/TakuroFukamizu/nvidia-docker-darknet/blob/master/Dockerfile
https://medium.com/techlogs/compiling-opencv-for-cuda-for-yolo-and-other-cnn-libraries-9ce427c00ff8


### 1. Run the docker image

```bash
# Todo install docker-nvidia ?
sudo docker run --runtime=nvidia -p 8080:8080 -p 8090:8090 -p 8070:8070 -v /data/db:/data/db -d --restart unless-stopped opendatacam/opendatacam:v2.0.0-beta.2-dockernvidia
# Open browser at http://localhost:8080
```

### 2. Build the image

```bash
# Go to an empty folder
mkdir docker
cd docker
# get the docker file : https://github.com/moovel/lab-opendatacam/blob/v2/docker/run-cloud/Dockerfile
wget https://raw.githubusercontent.com/moovel/lab-opendatacam/v2/docker/run-cloud/Dockerfile
# Build
# Takes a really long time the first time as it compile opencv
sudo docker build -t opendatacam .
```

### 3. Publish the docker image

```bash
# Log into the Docker Hub
sudo docker login --username=opendatacam
# Check the image ID using
sudo docker images
# You will see something like:
# REPOSITORY              TAG       IMAGE ID         CREATED           SIZE
# opendatacam             latest    023ab91c6291     3 minutes ago     1.975 GB

# Tag your image
sudo docker tag 7ef920844953 opendatacam/opendatacam:v2.0.0-beta.2-dockernvidia

# Or for nano : v2.0.0-beta.2-nano
# Or for xavier : v2.0.0-beta.2-xavier

# Push image
sudo docker push opendatacam/opendatacam
```