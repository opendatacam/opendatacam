### Run opendatacam nvidia-docker image

```bash
# After installing docker-nvidia
sudo docker run --runtime=nvidia -p 8080:8080 -p 8090:8090 -p 8070:8070 -v /data/db:/data/db -d --restart unless-stopped opendatacam/opendatacam:v3.0.0-beta.2-nvidiadocker
# Open browser at http://localhost:8080

# Run with custom config
sudo docker run --runtime=nvidia -v $(pwd)/config.json:/var/local/opendatacam/config.json -p 8080:8080 -p 8090:8090 -p 8070:8070 -v /data/db:/data/db --rm -it opendatacam/opendatacam:v3.0.0-beta.2-nvidiadocker
```