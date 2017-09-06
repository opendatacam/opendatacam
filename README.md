lab-traffic-cam
===============

Video Streaming Stuff
---------------------

Installation:

```bash
$ brew install ffmpeg --with-libvpx
# or in case already installed
$ brew reinstall ffmpeg --with-libvpx
```

Start streaming server:

```bash
$ ffserver -d -f ffserver.conf
# is ffserver running?
http://localhost:8090/stat.html
http://localhost:8090/test.webm
```

Surpress CORS error of Chrome
`$ open -a Google\ Chrome --args --disable-web-security --user-data-dir`
