## Run OpenDataCam nvidia-docker image without install script

__Our image is built for CUDA_ARCH_BIN=6.1 , if you GPU doesn't support this architecture, performance might be bad / it might not work, you will need to [build your own image](CREATE_NVIDIADOCKER_IMAGE.md) with another CUDA_ARCH_BIN version.__

__[Find out what is your CUDA Compute Capability depending on your GPU](https://developer.nvidia.com/cuda-gpus)__

### Run opendatacam nvidia-docker image

```bash
# After installing docker-nvidia
sudo docker run --runtime=nvidia -p 8080:8080 -p 8090:8090 -p 8070:8070 -v /data/db:/data/db -d --restart unless-stopped opendatacam/opendatacam:v2.1.0-nvidiadocker_cuda_archbin_6_1
# Open browser at http://localhost:8080

# Run with custom config
sudo docker run --runtime=nvidia -v $(pwd)/config.json:/var/local/opendatacam/config.json -p 8080:8080 -p 8090:8090 -p 8070:8070 -v /data/db:/data/db --rm -it opendatacam/opendatacam:v2.1.0-nvidiadocker_cuda_archbin_6_1
```