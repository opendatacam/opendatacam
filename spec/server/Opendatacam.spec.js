const { Tracker } = require('node-moving-things-tracker');
const cloneDeep = require('lodash.clonedeep');
const Opendatacam = require('../../server/Opendatacam');
const demoDetections = require('../../public/static/placeholder/alexeydetections30FPS.json');
const config = require('../../config.json');

describe('Opendatacam', () => {
  let dbSpy = null;

  beforeEach(() => {
    Opendatacam.setVideoResolution({ w: 1280, h: 720 });

    const testConfig = cloneDeep(config);
    testConfig.TRACKER_SETTINGS = {
      objectMaxAreaInPercentageOfFrame: 50,
      confidence_threshold: 0.5,
      iouLimit: 0.05,
      unMatchedFrameTolerance: 5,
      fastDelete: true,
      matchingAlgorithm: "kdTree",
    };
    testConfig.COUNTER_SETTINGS = {
      countingAreaMinFramesInsideToBeCounted: 1,
      countingAreaVerifyIfObjectEntersCrossingOneEdge: false,
      minAngleWithCountingLineThreshold: 5,
      computeTrajectoryBasedOnNbOfPastFrame: 5,
    };
    Opendatacam.setConfig(testConfig);

    dbSpy = jasmine.createSpyObj('DbManager', [
      'connect',
      'disconnect',
      'isConnected',
      'persistAppSettings',
      'getAppSettings',
      'insertRecording',
      'getRecording',
      'deleteRecording',
      'updateRecordingWithNewframe',
      'getRecordings',
      'getRecordingsCount',
      'getTrackerHistoryOfRecording',
      'getCounterHistoryOfRecording',
    ]);
    dbSpy.insertRecording.and.resolveTo({ id: Math.random().toString() });
    dbSpy.getAppSettings.and.resolveTo(null);
    dbSpy.persistAppSettings.and.resolveTo();
    dbSpy.updateRecordingWithNewframe.and.resolveTo();
    Opendatacam.setDatabase(dbSpy);

    Tracker.reset();
    Tracker.setParams({
      iouLimit: 0.2,
      unMatchedFrameTolerance: 5,
      fastDelete: true,
    });
    Opendatacam.setTracker(Tracker);

    Opendatacam.isListeningToYOLO = true;
    Opendatacam.registerCountingAreas({
      'cc8354b6-d8ec-41d3-ab12-38ced6811f7c': {
        color: 'yellow',
        type: 'bidirectional',
        location: {
          points: [
            { x: 0, y: 360 },
            { x: 1280, y: 360 },
          ],
          refResolution: { w: 1280, h: 720 },
        },
        name: 'test',
      },
    });
  });

  describe('recording', () => {
    beforeEach(() => {
      Opendatacam.startRecording(false);
    });

    afterEach(() => {
      Opendatacam.stopRecording();
    });

    it('is Recording', () => {
      expect(Opendatacam.isRecording()).toBeTrue();
    });

    describe('counts demo cars', () => {
      const expectSummary = {
        'cc8354b6-d8ec-41d3-ab12-38ced6811f7c': {
          _total: 41, car: 41,
        },
      };

      beforeEach(() => {
        demoDetections.forEach((frame) => {
          Opendatacam.updateWithNewFrame(frame.objects, frame.frame_id);
        });
      });

      it('returns correct summary while counting', () => {
        expect(dbSpy.updateRecordingWithNewframe).toHaveBeenCalledTimes(demoDetections.length);
        expect(dbSpy.updateRecordingWithNewframe.calls.mostRecent().args[2]).toEqual(expectSummary);
        expect(Opendatacam.getCounterSummary()).toEqual(expectSummary);
      });

      it('does not change summary after recording stopped', () => {
        expect(dbSpy.updateRecordingWithNewframe).toHaveBeenCalledTimes(demoDetections.length);
        expect(dbSpy.updateRecordingWithNewframe.calls.mostRecent().args[2]).toEqual(expectSummary);

        Opendatacam.stopRecording();

        expect(dbSpy.updateRecordingWithNewframe).toHaveBeenCalledTimes(demoDetections.length);
        expect(dbSpy.updateRecordingWithNewframe.calls.mostRecent().args[2]).toEqual(expectSummary);
      });
    });
  });
});
