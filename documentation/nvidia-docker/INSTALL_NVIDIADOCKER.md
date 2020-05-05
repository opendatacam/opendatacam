
## Install nvidia-container-toolkit

_You can also refer directly to the guides on [nvidia-container-toolkit](https://github.com/NVIDIA/nvidia-docker#ubuntu-16041804-debian-jessiestretchbuster)_


### 1. Hardware pre-requisite 

- An Ubuntu computer/server with a Nvidia CUDA GPU : https://developer.nvidia.com/cuda-gpus


### 2. Software pre-requisite 

- Docker with API version >= 1.4
- Nvidia drivers with version >= 361


#### 2.1 Install / Update Docker

Follow the official documentation: [https://docs.docker.com/install/linux/docker-ce/ubuntu/](https://docs.docker.com/install/linux/docker-ce/ubuntu/)

Verify Docker version:

```
docker version

# For example, output: API version: 1.4
```


#### 2.2 Install / Update Nvidia driver

The following will also install CUDA along with latest nvidia driver, you don't need it but it is the only "easy install" way we found.

- Go to: https://developer.nvidia.com/cuda-downloads
- Select Linux > x86_64 > Ubuntu
- Select your ubuntu version
- Select Installer type (we tested with deb local or deb network )
- Follow instructions
- After install, reboot your machine
- Test if nvidia driver are installed with: `nvidia-smi`


Verify Nvidia drivers version:

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

### 3. Install nvidia-container-toolkit

- Follow the official [quickstart documentation](https://github.com/NVIDIA/nvidia-docker#quickstart) e.g. for Ubuntu 16.04/18.04:

```bash
# Add the package repositories
$ distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
$ curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
$ curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list

# Install and reload Docker
$ sudo apt-get update && sudo apt-get install -y nvidia-container-toolkit
$ sudo systemctl restart docker
```

- Verify installation by running a dummy docker image

```bash
$ sudo docker run --gpus all nvidia/cuda:9.0-base nvidia-smi

# Should output something like
+----------------------------------------------------------+
| NVIDIA-SMI 418.87   Driver Version: 418.87 CUDA Version: 10.1
|-------------------------------+----------------------
```

🎉🎉🎉 You are ready to [install OpenDataCam](../../README.md#2-install-and-start-opendatacam-3-min-) 🎉🎉🎉

