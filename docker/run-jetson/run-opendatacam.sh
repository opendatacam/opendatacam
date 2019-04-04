# Get the darknet-docker script (TODO @tdurand remove v2 when releasing)
wget https://raw.githubusercontent.com/moovel/lab-opendatacam/v2/docker/run-jetson/darknet-docker.sh

# Chmod to give exec permissions
chmod 777 darknet-docker.sh

# Pull, install and run opendatacam container when docker starts (on boot)
sudo ./darknet-docker.sh run -d --restart unless-stopped tdurand/opendatacam:v2.0.0-beta.1-tx2