
## Install nvidia-docker v2.0

_You can also [refer to this guide](https://github.com/NVIDIA/nvidia-docker/wiki/Installation-(version-2.0)) on the wiki of nvidia-docker repository._

### Hardware pre-requisite 

- An Ubuntu computer/server with a Nvidia CUDA GPU : https://developer.nvidia.com/cuda-gpus

### Software pre-requisite 

- Docker with API version >= 1.12
- Nvidia drivers with version >= 361

__Verify Docker version:__

Docker API version should be >= 1.12

```
docker version

# For example, output: API version: 1.39
```

__Verify Nvidia drivers version:__

Driver Version should be > 361

```
nvidia-smi

+-----------------------------------------------------------------------------+
| NVIDIA-SMI 418.67       Driver Version: 418.67       CUDA Version: 10.1     |
|-------------------------------+----------------------+----------------------+
| GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
| Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
|===============================+======================+======================|
|   0  GeForce GTX 1050    Off  | 00000000:02:00.0 Off |                  N/A |
| N/A   40C    P0     8W /  N/A |      0MiB /  2002MiB |      1%      Default |
+-------------------------------+----------------------+----------------------+
```

#### Install / Update Docker

Follow the official documentation: [https://docs.docker.com/install/linux/docker-ce/ubuntu/](https://docs.docker.com/install/linux/docker-ce/ubuntu/)

#### Install / Update Nvidia driver

The following will also install CUDA along with latest nvidia driver, you don't need it but it is the only "easy install" way we found.

- Go to: https://developer.nvidia.com/cuda-downloads
- Select Linux > x86_64 > Ubuntu
- Select your ubuntu version
- Select Installer type ( we tested with deb local or deb network )
- Follow instructions
- After install, reboot your machine
- Test if nvidia driver are installed with: `nvidia-smi`

### Install nvidia-docker v2.0

- Add to package manager

```bash
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | \
  sudo apt-key add -
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | \
  sudo tee /etc/apt/sources.list.d/nvidia-docker.list
sudo apt-get update
```

- Install and reload Docker

```bash
sudo apt-get install nvidia-docker2
sudo pkill -SIGHUP dockerd
```

- Verify installation by running a dummy docker image

```bash
sudo docker run --runtime=nvidia --rm nvidia/cuda nvidia-smi

# Should output something like
+----------------------------------------------------------+
| NVIDIA-SMI 418.67   Driver Version: 418.67 CUDA Version: 10.1
|-------------------------------+----------------------
```

🎉🎉🎉 You are ready to [install Opendatacam](../../README.md#2-install-and-start-opendatacam-3-min-) 🎉🎉🎉

