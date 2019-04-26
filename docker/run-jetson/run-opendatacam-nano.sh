# Get the darknet-docker script (TODO @tdurand remove v2 when releasing)
wget https://raw.githubusercontent.com/moovel/lab-opendatacam/v2/docker/run-jetson/darknet-docker.sh

# Chmod to give exec permissions
chmod 777 darknet-docker.sh

# Pull, install and run opendatacam container when docker starts (on boot with --restart unless-stopped, -d is for detached mode)
sudo ./darknet-docker.sh run -d --restart unless-stopped tdurand/opendatacam:v2.0.0-beta.1-nano

# Message that docker container has been started and opendatacam will be available shorty on <IP>
echo "Opendatacam docker container started successfully, it might take up to 1 min to start the node app"
echo "Open browser at http://<IP_OF_JETSON>:8080 or http://localhost:8080"

