# Jetson App

### Mount jetson filesystem as local filesystem on mac for dev

`sshfs -o allow_other,defer_permissions nvidia@192.168.1.222:/home/nvidia/Desktop/lab-traffic-cam /Users/tdurand/Documents/ProjetFreelance/Moovel/remote-lab-traffic-cam/`

### SSH jetson

`ssh nvidia@192.168.1.222`


### Install it and run:

```bash
yarn install
yarn run dev
```
