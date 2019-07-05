### TROUBLESHOOTING

-   ```bash
    (darknet:65): GStreamer-CRITICAL **: 15:28:37.223: gst_element_get_state: assertion 'GST_IS_ELEMENT (element)' failed
    VIDEOIO ERROR: V4L: device v4l2src ! video/x-raw, framerate=30/1, width=640, height=360 ! videoconvert ! appsink: Unable to query number of channels
    ```
    Means USB Cam wasn't found, make sure it is connected and restart your jetson
    Another reason could be that the usbcamera is not in the standard path. Try to add e.g. `device=/dev/video1` after `v4l2src`.

-   ```bash
    Installing opendatacam docker image
    Stop any running docker container...
    "docker stop" requires at least 1 argument.
    ```
    Happens if the opendatacam is installed after a clean flash. Run `$ sudo docker run hello-world` so that there is a container to stop. 
    
-   If it happens, that the docker service is not active on startup (which means the container is not starting automatically). Run `$ sudo systemctl enable docker` set the docker service active on startup


-   ```bash
    docker: Error response from daemon: OCI runtime create failed: container_linux.go:345
    ```

    Try restarting the docker service: `sudo service docker restart` , also try to restart your machine.
    
    
-   ```bash
    Error generated. /dvs/git/dirty/git-master_linux/multimedia/nvgstreamer/gst-nvarguscamera/gstnvarguscamerasrc.cpp, execute:521 No cameras available
    ```

    Rasberry Pi Cam isn't working, try rebooting your device / plug it again.
    
