### ⚡️Flash Jetson Board:

*We support only jetpack version 4.2 (more recent versions might also work)*

#### Jetson Nano

Directly flash the microSD card with jetpack 4.2 , follow this nice guide

[https://nvidia.com/JetsonNano-Start](https://nvidia.com/JetsonNano-Start)

Make sure CUDA is in your PATH:

```bash
export PATH=${PATH}:/usr/local/cuda/bin
export LD_LIBRARY_PATH=${LD_LIBRARY_PATH}:/usr/local/cuda/lib64

# Verify, this command should work
nvcc --version
```


#### Jetson TX2 / Jetson Xavier

- Since march 2019, Nvidia has released a SDK manager tool to flash jetson, complete doc is available here: https://docs.nvidia.com/sdk-manager/index.html 
- You need a machine running Ubuntu to install it *(that is not the jetson)*, download link is here: https://developer.nvidia.com/embedded/downloads
- Then follow the steps of the documentation: https://docs.nvidia.com/sdk-manager/install-with-sdkm-jetson/index.html 

**Common issues:**

- When you reach the flashing part, the automatic mode didn't work for us when writing this doc, we did flash using manual mode. *(You need to put in [recovery mode manualy](https://www.youtube.com/watch?v=HaDy9tryzWc) and verify it with this [command](https://devtalk.nvidia.com/default/topic/1006401/jetson-tx2/not-able-to-get-into-recovery-mode/post/5205375/#5205375))*

- If you get `LOST CONNEXION to jetson` , try replug-in the usb cable