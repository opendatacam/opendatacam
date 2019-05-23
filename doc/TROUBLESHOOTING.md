### v2 FAQ

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


### OLD v1 FAQ to update

To debug the app log onto the jetson board and inspect the logs from pm2 or stop the pm2 service (`sudo pm2 stop <pid>`) and start the app by using `sudo npm start` to see the console output directly.

- **Warning**: "nvbuf_utils: Could not get EGL display connection" doesn't mean there is an error, it's just it does not start X, if stuck here means something prevent Opencv to read the webcam... but doesn't mean it doen't have access to the webcam... 

- **Error**: `Could *not* find a valid build in the '.next' directory! Try building your app with '*next* build' before starting the server`

  Run `npm build` before starting the app

- Could not find darknet. Be sure to `make` darknet without `sudo` otherwise it will abort mid installation.

- **Error**: `OpenCV Error: Unspecified error (GStreamer: unable to start pipeline
) in cvCaptureFromCAM_GStreamer`

  The webcam isn't detected. Try to plug out / in

- **Error**: `Error: Cannot stop process that is not running.`

  It is possible that a process with the port `8090` is causing the error. Try to kill the process and restart the board:

  ```bash
  sudo netstat -nlp | grep :8090
  sudo kill <pid>
  ```
