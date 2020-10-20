const { YoloSimulation } = require('../../../server/processes/YoloSimulation');

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
    };
    yolo = new YoloSimulation(yoloConfig);
  });

  describe('videoResolution', function () {
    it('has fixed resolution on creation', function () {
      const expectedResolution = { w: 1280, h: 720 };
      expect(yolo.getVideoResolution()).toEqual(expectedResolution);
    });
  });
});
