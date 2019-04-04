### ⚡️Flash Jetson Board:

#### Jetson TX2

*We support jetpack version 4.2+*

- Since march 2019, Nvidia has released a SDK manager tool to flash jetson, complete doc is available here: https://docs.nvidia.com/sdk-manager/index.html 
- You need a machine running Ubuntu to install it *(that is not the jetson)*, download link is here: https://developer.nvidia.com/embedded/downloads
- Then follow the steps of the documentation: https://docs.nvidia.com/sdk-manager/install-with-sdkm-jetson/index.html 

**Common issues:**

- When you reach the flashing part, the automatic mode didn't work for us when writing this doc, we did flash using manual mode. *(You need to put in [recovery mode manualy](https://www.youtube.com/watch?v=HaDy9tryzWc) and verify it with this [command](https://devtalk.nvidia.com/default/topic/1006401/jetson-tx2/not-able-to-get-into-recovery-mode/post/5205375/#5205375))*

- If you get `LOST CONNEXION to jetson` , try replug-in the usb cable

#### Jetson Xavier

TODO