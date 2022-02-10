const { YoloDarknet } = require('../../../server/processes/YoloDarknet');

describe('YoloDarknet', () => {
  let yolo = null;
  let yoloConfig = null;

  beforeEach(() => {
    yoloConfig = {
      yoloParams: {
        data: 'cfg/coco.data',
        cfg: 'cfg/yolov4-tiny.cfg',
        weights: 'yolov4-tiny.weights',
      },
      videoType: 'file',
      videoParams: 'opendatacam_videos/demo.mp4',
      jsonStreamPort: 8070,
      mjpegStreamPort: 8090,
      darknetPath: './spec/scripts/',
      darknetCmd: './darknet',
    };
    yolo = new YoloDarknet(yoloConfig);
  });

  afterEach(async () => {
    await yolo.stop();
  });

  describe('videoResolution', () => {
    it('has 0x0 on creation', () => {
      expect(yolo.getVideoResolution()).toEqual({ w: 0, h: 0 });
    });

    it('parses emits videoresolutionevent', async () => {
      let emittedResolution = null;
      yolo.on('videoresolution', (resolution) => { emittedResolution = resolution; });
      yolo.start();

      // Give yolo 100ms to start the subprocess
      await new Promise((resolve) => setTimeout(resolve, 100));

      const expectedResolution = { w: 1280, h: 720 };
      expect(yolo.getVideoResolution()).toEqual(expectedResolution);
      expect(emittedResolution).toEqual(expectedResolution);
    });
  });

  describe('isLive', () => {
    it('file is not live', () => {
      expect(yolo.isLive()).toBeFalse();
    });

    describe('simulation', () => {
      beforeEach(() => {
        yoloConfig.videoType = 'simulation';
        yoloConfig.videoParams = '--yolo_json public/static/placeholder/alexeydetections30FPS.json --video_file_or_folder public/static/placeholder/frames --jsonFps 20 --mjpgFps 0.2';
      });

      it('is live by default', () => {
        yolo = new YoloDarknet(yoloConfig);

        expect(yolo.isLive()).toBeTrue();
      });

      it('is live if set to live', () => {
        yoloConfig.videoParams += ' --isLive true';
        yolo = new YoloDarknet(yoloConfig);

        expect(yolo.isLive()).toBeTrue();
      });

      it('is live if set to live', () => {
        yoloConfig.videoParams += ' --isLive false';
        yolo = new YoloDarknet(yoloConfig);

        expect(yolo.isLive()).toBeFalse();
      });
    });

    it('is live otherwise', () => {
      yoloConfig.videoType = 'usbcam';
      yoloConfig.videoParams = 'v4l2src device=/dev/video0 ! video/x-raw, framerate=30/1, width=640, height=360 ! videoconvert ! appsink';
      yolo = new YoloDarknet(yoloConfig);

      expect(yolo.isLive()).toBeTrue();
    });
  });
});
