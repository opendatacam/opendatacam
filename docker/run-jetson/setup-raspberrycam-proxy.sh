# Configure proxy raspberry cam to dev/video2 dependencies : https://github.com/opendatacam/opendatacam/blob/master/documentation/jetson/JETSON_NANO.md#why

cd /usr/src/linux-headers-4.9.140-tegra-ubuntu18.04_aarch64/kernel-4.9;
make modules_prepare;
mkdir v4l2loopback;
git clone https://github.com/umlaeute/v4l2loopback.git v4l2loopback;
cd v4l2loopback;
make;
make install;
apt-get install -y v4l2loopback-dkms v4l2loopback-utils;
modprobe v4l2loopback devices=1 video_nr=2 exclusive_caps=1;
echo options v4l2loopback devices=1 video_nr=2 exclusive_caps=1 > /etc/modprobe.d/v4l2loopback.conf;
echo v4l2loopback > /etc/modules;
update-initramfs -u;