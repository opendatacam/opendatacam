# 🎱 Use Custom Neural Network weights

## 🐋 Using Custom Neural Network weights for OpenDataCam *with* Docker

In order to switch add custom Neural Network weights you need to:
  1. Mount the necessary files into the darknet folder of the docker container so OpenDataCam has access to those new weights.
  2. Change the `config.json` accordingly

### 📖 Using Custom Neural Network weights for OpenDataCam *with* Docker - Example

For example, if you want to use `yolov3-tiny-prn` , you need to:

  1. download `yolov3-tiny-prn.weights` into the same directory as the `docker-compose.yml` file

  2. (optional) download the `.cfg`, `.data` and `.names` files if they are custom (not default darknet)

  3. mount the weights file using `volumes` in the `docker-compose.yml` file

```yaml
volumes:
  - './config.json:/var/local/opendatacam/config.json'
  - './yolov3-tiny-prn.weights:/var/local/darknet/yolov3-tiny-prn.weights'
```

  - (optional) if you have custom `.cfg`,`.data` and `.names` files you should mount them too


```yaml
volumes:
  - './config.json:/var/local/opendatacam/config.json'
  - './yolov3-tiny-prn.weights:/var/local/darknet/yolov3-tiny-prn.weights'
  - './coco.data:/var/local/darknet/cfg/coco.data'
  - './yolov3-tiny-prn.cfg:/var/local/darknet/cfg/yolov3-tiny-prn.cfg'
  - './coco.names:/var/local/darknet/cfg/coco.names'
```

  4. change the `config.json`

  - add an entry to the `NEURAL_NETWORK_PARAMS` setting in `config.json`.

```json
"yolov3-tiny-prn": {
  "data": "cfg/coco.data",
  "cfg": "cfg/yolov3-tiny-prn.cfg",
  "weights": "yolov3-tiny-prn.weights"
}
```

  5. change the `NEURAL_NETWORK` param to the key you defined in `NEURAL_NETWORK_PARAMS`

```json
"NEURAL_NETWORK": "yolov3-tiny-prn"
```

  6. If you've added new volumes to your `docker-compose.yml`, you need to update the container using : 

```
sudo docker-compose up -d
```

  - Otherwise, if you just updated files from existing volumes, you need to restart the container using  : 

```
sudo docker-compose restart
```

## 🌀 Using Custom Neural Network weights for OpenDataCam *without* Docker


It is the same as above, but instead of mounting the files in the docker container you just need to directly copy them in the `/darknet` folder. 
However, if you are using our [Darknet fork](https://github.com/IrishTrafficSurveysDev/darknet), then the `.cfg` and `.data` files are already in the `/darknet` folder. All you need to do is the following: 

1. Download the `.weights` files of the Neural Network you wish to use. You can do this by:
  1. Moving into your `darknet` folder (`cd path/to/darknet/folder`).
  2. Running the following command:
  
   ``` bash
    wget https://github.com/AlexeyAB/darknet/releases/download/darknet_yolo_v4_pre/[nn_name].weights --no-check-certificate
   ```
   - With `nn_name` being the name of the Neural Network you wish to use(e.g `yolov4x-mish`, `yolov4-csp` ). You can view the full list of available Neural Network models [here](https://github.com/AlexeyAB/darknet/tree/master/cfg)

2. Change the `config.json`

  - add an entry to the `NEURAL_NETWORK_PARAMS` setting in `config.json`.

```json
"[nn_name]": {
  "data": "cfg/coco.data",
  "cfg": "cfg/[nn_name].cfg",
  "weights": "[nn_name].weights"
}
```

3. change the `NEURAL_NETWORK` param to the key you defined in `NEURAL_NETWORK_PARAMS`

```json
"NEURAL_NETWORK": "[nn_name]"
```

4. Restart the node.js app (not need to recompile)


### 📖 Using Custom Neural Network weights for OpenDataCam *without* Docker - Example No.1

- In this first example, we will be downloading and setting up the `yolov4-csp` model. To do so, let's follow our procedure:

1. Download the `.weights` files of the Neural Network you wish to use. You can do this by:
   1. Moving into our `darknet` folder (`cd /home/vagif/Documents/darknet `).
   2. Run the following command:
   ``` bash
    wget https://github.com/AlexeyAB/darknet/releases/download/darknet_yolo_v4_pre/yolov4-csp.weights --no-check-certificate
   ```
2. Change the `config.json`

```json
"yolov4-csp": {
  "data": "cfg/coco.data",
  "cfg": "cfg/yolov4-csp.cfg",
  "weights": "yolov4-csp.weights"
}
```

3. change the `NEURAL_NETWORK` param to the key you defined in `NEURAL_NETWORK_PARAMS`

```json
"NEURAL_NETWORK": "yolov4-csp"
```

4. Restart the node.js app (not need to recompile)



### 📖 Using Custom Neural Network weights for OpenDataCam *without* Docker - Example No.2

- In this second example, we will be downloading and setting up the `yolov4x-mish` model. To do so, let's follow our procedure:

1. Download the `.weights` files of the Neural Network you wish to use. You can do this by:
   1. Moving into our `darknet` folder (`cd /home/vagif/Documents/darknet `).
   2. Run the following command:
   ``` bash
    wget https://github.com/AlexeyAB/darknet/releases/download/darknet_yolo_v4_pre/yolov4x-mish.weights --no-check-certificate
   ```
2. Change the `config.json`

```json
"yolov4x-mish": {
  "data": "cfg/coco.data",
  "cfg": "cfg/yolov4x-mish.cfg",
  "weights": "yolov4x-mish.weights"
}
```

3. change the `NEURAL_NETWORK` param to the key you defined in `NEURAL_NETWORK_PARAMS`

```json
"NEURAL_NETWORK": "yolov4x-mish"
```

4. Restart the node.js app (not need to recompile)
