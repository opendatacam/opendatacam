const { YoloDarknet } = require('../../../server/processes/YoloDarknet');

describe('YoloDarknet', () => {
  let yolo = null;

  beforeEach(() => {
    const yoloConfig = {
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
});
