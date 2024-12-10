const path = require('path');

const { YoloSimulation } = require('../../scripts/YoloSimulation');

describe('YoloSimulation', () => {
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
      videoParams: {
        detections: 'public/static/placeholder/alexeydetections30FPS.json',
        video_file_or_folder: 'public/static/placeholder/frames',
        isLive: false,
        jsonFps: 20,
        mjpgFps: 0.2,
      },
      jsonStreamPort: 8070,
      mjpegStreamPort: 8090,
      darknetPath: './spec/scripts/',
      simulationStartupDelayMs: 0,
    };
    yolo = new YoloSimulation(yoloConfig);
  });

  afterEach(() => {
    yolo.stop();
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

  describe('cmd line args', () => {
    const expectedConfig = {
      videoParams: {
        detections: 'public/static/placeholder/alexeydetections30FPS.json',
        video_file_or_folder: 'public/static/placeholder/frames',
        isLive: false,
        jsonFps: 40,
        mjpgFps: 4,
      },
      darknetStdout: false,
      jsonStreamPort: 5070,
      mjpegStreamPort: 5090,
    };

    const argsDarknetPrefix = ['detector', 'demo', 'data', 'config', 'weights'];
    const argsDarknetSuffix = [
      '-ext_output',
      '-dont_show',
      '-dontdraw_bbox',
      '-json_port', expectedConfig.jsonStreamPort,
      '-mjpeg_port', expectedConfig.mjpegStreamPort,
    ];
    const argsMissingRequiredNoDarknet = [
      '--video_file_or_folder', expectedConfig.videoParams.video_file_or_folder,
      '--isLive', expectedConfig.videoParams.isLive,
      '--jsonFps', expectedConfig.videoParams.jsonFps,
      '--mjpgFps', expectedConfig.videoParams.mjpgFps,
      '--darknetStdout', expectedConfig.darknetStdout,
    ];
    const argsValidNoDarknet = [
      '--yolo_json', expectedConfig.videoParams.detections,
    ].concat(argsMissingRequiredNoDarknet);
    const argsValidDetections = argsDarknetPrefix.concat(
      ['--detections', expectedConfig.videoParams.detections],
    ).concat(argsMissingRequiredNoDarknet).concat(argsDarknetSuffix);
    const argsValidDarknet = argsDarknetPrefix.concat(argsValidNoDarknet).concat(argsDarknetSuffix);
    // YoloDarknet invokes it in a weird way that we have to handle separately
    const yoloDarknetInvokation = [
      '/usr/local/Cellar/node/14.4.0/bin/node',
      '/Users/vsaw/Documents/Development/opendatacam/scripts/YoloSimulation.js',
      'detector',
      'demo',
      'cfg/coco.data',
      'cfg/yolov4-416x416.cfg',
      'yolov4.weights',
      `--yolo_json ${expectedConfig.videoParams.detections} --video_file_or_folder ${expectedConfig.videoParams.video_file_or_folder} --isLive ${expectedConfig.videoParams.isLive} --jsonFps ${expectedConfig.videoParams.jsonFps} --mjpgFps ${expectedConfig.videoParams.mjpgFps} --darknetStdout ${expectedConfig.darknetStdout}`,
      '-ext_output',
      '-dont_show',
      '-dontdraw_bbox',
      '-json_port',
      '5070',
      '-mjpeg_port',
      '5090'];

    /** The parsed config object */
    let cfg = null;
    /**
     * Creates a function object that will call parse with the given arguments when called
     *
     * The configuration results will be stored in the cfg variable.
     *
     * @param {*} args The arguments to call YoloSimulation.parseCmdLine with
     *
     * @return A function that takes no arguments that will call YoloSimulation.parseCmdLine
     */
    const invokeParser = (args) => () => {
      cfg = YoloSimulation.parseCmdLine(args);
    };

    it('fails on empty command line args', () => {
      expect(() => { YoloSimulation.parseCmdLine(); }).toThrow();
    });

    it('throws on missing yolo_json option', () => {
      expect(invokeParser(argsMissingRequiredNoDarknet)).toThrow();
    });

    it('ignores missing darknet args', () => {
      expect(invokeParser(argsValidNoDarknet)).not.toThrow();
      expect(cfg).toEqual(
        {
          videoParams: expectedConfig.videoParams,
          darknetStdout: expectedConfig.darknetStdout,

          // expect default port numbers as arguments are missing
          jsonStreamPort: 8070,
          mjpegStreamPort: 8090,
        },
      );
    });

    it('accepts detections as alias for yolo_json', () => {
      expect(invokeParser(argsValidDetections)).not.toThrow();
      expect(cfg).toEqual(expectedConfig);
    });

    it('ignores darknet args', () => {
      expect(invokeParser(argsValidDarknet)).not.toThrow();
      expect(cfg).toEqual(expectedConfig);
    });

    it('handles YoloDarknet invokation', () => {
      expect(invokeParser(yoloDarknetInvokation)).not.toThrow();
      expect(cfg).toEqual(expectedConfig);
    });
  });

  describe('runs from file not live', () => {
    beforeEach(() => {
      jasmine.clock().install();
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('is not live', () => {
      expect(yolo.isLive()).toBeFalse();
    });

    it('starts', async () => {
      expect(yolo.isStarting).toBeFalse();
      expect(yolo.isStarted).toBeFalse();

      yolo.start();

      expect(yolo.isStarting).toBeTrue();
      expect(yolo.isStarted).toBeFalse();

      jasmine.clock().tick(10 * 1000);

      expect(yolo.isStarted).toBeTrue();
    });
  });

  describe('run MOT', () => {
    beforeEach(() => {
      yoloConfig.videoParams = {
        detections: path.join(__dirname, '../res/YoloSimulation/MOT_Sample/'),
        isLive: false,
        jsonFps: 20,
        mjpgFps: 0.2,
      };
      yolo = new YoloSimulation(yoloConfig);
    });

    it('initializes video_file_or_folder', () => {
      const expectedImgFolder = path.join(yoloConfig.videoParams.detections, 'img1');
      expect(yolo.config.videoParams.video_file_or_folder).toEqual(expectedImgFolder);
    });

    it('parses emits videoresolutionevent', async () => {
      let emittedResolution = null;
      yolo.on('videoresolution', (resolution) => { emittedResolution = resolution; });
      yolo.start();

      // Give yolo 100ms to start the subprocess
      await new Promise((resolve) => setTimeout(resolve, 100));

      const expectedResolution = { w: 1920, h: 1080 };
      expect(yolo.getVideoResolution()).toEqual(expectedResolution);
      expect(emittedResolution).toEqual(expectedResolution);
    });

    describe('detections', () => {
      it('converts single lines', () => {
        const actual = YoloSimulation.convertMotDetection({ w: 1920, h: 1080 },
          '1,-1,1569,361,88.1,243.1,1');
        const expected = {
          class_id: 1,
          name: 'person',
          relative_coordinates: {
            center_x: 0.84013,
            center_y: 0.446805,
            width: 0.045885,
            height: 0.225092,
          },
          confidence: 1,
        };

        expect(actual.class_id).toEqual(expected.class_id);
        expect(actual.name).toEqual(expected.name);
        expect(actual.confidence).toEqual(expected.confidence);
        expect(actual.relative_coordinates.center_x).toBeCloseTo(expected.relative_coordinates.center_x); /* eslint-disable-line max-len */
        expect(actual.relative_coordinates.center_y).toBeCloseTo(expected.relative_coordinates.center_y); /* eslint-disable-line max-len */
        expect(actual.relative_coordinates.width).toBeCloseTo(expected.relative_coordinates.width);
        expect(actual.relative_coordinates.height).toBeCloseTo(expected.relative_coordinates.height); /* eslint-disable-line max-len */
      });
    });

    it('takes detections', () => {
      expect(yolo.detections.length).toEqual(3);
      expect(yolo.detections[0].frame_id).toEqual(1);
      expect(yolo.detections[0].objects.length).toEqual(11);
      expect(yolo.detections[1].frame_id).toEqual(2);
      expect(yolo.detections[1].objects.length).toEqual(12);
      expect(yolo.detections[2].frame_id).toEqual(3);
      expect(yolo.detections[2].objects.length).toEqual(12);
    });
  });
});
