const { YoloSimulation } = require('../../scripts/YoloSimulation');

describe('YoloSimulation', function () {
  let yolo = null;

  beforeEach(function () {
    const yoloConfig = {
      yoloParams: {
        data: "cfg/coco.data",
        cfg: "cfg/yolov4-tiny.cfg",
        weights: "yolov4-tiny.weights"
      },
      videoType: 'file',
      videoParams: {
        yolo_json: "public/static/placeholder/alexeydetections30FPS.json",
        video_file_or_folder: "public/static/placeholder/frames",
        isLive: false,
        jsonFps: 20,
        mjpgFps: 0.2
      },
      jsonStreamPort: 8070,
      mjpegStreamPort: 8090,
      darknetPath: './spec/scripts/',
      simulationStartupDelayMs: 0
    };
    yolo = new YoloSimulation(yoloConfig);
  });

  describe('videoResolution', function () {
    it('has 0x0 on creation', function () {
      expect(yolo.getVideoResolution()).toEqual({ w: 0, h: 0 });
    });

    it('parses emits videoresolutionevent', async function () {
      let emittedResolution = null;
      yolo.on('videoresolution', (resolution) => { emittedResolution = resolution });
      yolo.start();

      // Give yolo 100ms to start the subprocess
      await new Promise(resolve => setTimeout(resolve, 100));

      const expectedResolution = { w: 1280, h: 720 };
      expect(yolo.getVideoResolution()).toEqual(expectedResolution);
      expect(emittedResolution).toEqual(expectedResolution);
    });
  });
});
