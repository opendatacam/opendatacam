### ⚡️Flash Jetson Board:

*We support only jetpack version [4.3](https://developer.nvidia.com/embedded/jetpack) (more recent versions might also work)*

#### How to find out my Jetpack version

You can check your Jetpack version with this tool: [https://github.com/rbonghi/jetson_stats](https://github.com/rbonghi/jetson_stats)

```bash
# Update package manager
sudo apt update
# Install Pip package manager
sudo apt install python-pip
# Install jetson-stats
sudo -H pip install jetson-stats
# Print info about jetson
jetson_release

# Output should be something like:
# - NVIDIA Jetson TX2
#  * Jetpack 4.2 [L4T 32.1.0]
#  * CUDA GPU architecture 6.2
#  * NV Power Mode: MAXN - Type: 0
```

#### Jetson Nano

Directly flash the microSD card with jetpack, follow this guide:

[https://nvidia.com/JetsonNano-Start](https://nvidia.com/JetsonNano-Start)

Make sure CUDA is in your PATH! Copy and paste the lines below to `.bashrc` in your home folder, edit it with `sudo gedit .bashrc`.

```bash
export PATH=${PATH}:/usr/local/cuda/bin
export LD_LIBRARY_PATH=${LD_LIBRARY_PATH}:/usr/local/cuda/lib64
```

Reload PATH and LD_LIBRARY_PATH (or close the Terminal and open it again)
```bash
source .bashrc
```

```bash
# Verify, this command should work now
nvcc --version
```

#### Jetson TX2 / Jetson Xavier

- Since march 2019, Nvidia has released a SDK manager tool to flash jetson, complete doc is available here: https://docs.nvidia.com/sdk-manager/index.html 
- You need a machine running Ubuntu to install it *(that is not the jetson)*, download link is here: https://developer.nvidia.com/embedded/downloads
- Then follow the steps of the documentation: https://docs.nvidia.com/sdk-manager/install-with-sdkm-jetson/index.html 

**Common issues:**

- When you reach the flashing part, the automatic mode didn't work for us when writing this doc, we did flash using manual mode. *(You need to put in [recovery mode manualy](https://www.youtube.com/watch?v=HaDy9tryzWc) and verify it with this [command](https://devtalk.nvidia.com/default/topic/1006401/jetson-tx2/not-able-to-get-into-recovery-mode/post/5205375/#5205375))*

- If you get `LOST CONNECTION to jetson` , try replug-in the usb cable - also make sure that **python** ist installed on the host computer (`$ sudo apt-get install python`), since this can cause that error as well.

- NANO: After the initial setup of the nano the **software updater** can be stuck. If this happens you can follow this guide to solve this issue: [Ubuntu update error “waiting for unattended-upgr to exit”
](https://unix.stackexchange.com/questions/374748/ubuntu-update-error-waiting-for-unattended-upgr-to-exit)
