const UUID = require('uuid');
const { Recording } = require('../../../server/model/Recording');

describe('DBManager', () => {
  describe('constructor', () => {
    const startDate = new Date(2020, 12, 24, 12, 13, 14);
    const endDate = new Date(2020, 12, 24, 13, 13, 14);
    const areas = {
      'cc8354b6-d8ec-41d3-ab12-38ced6811f7c': {
        color: 'yellow',
        type: 'polygon',
        computed: {
          lineBearings: [82.77568288711024, 262.77568288711024],
        },
        location: {
          points: [
            { x: 176.8421173095703, y: 514.7368774414062 },
            { x: 475.78948974609375, y: 476.8421325683594 },
            { x: 586.3157958984375, y: 582.1052856445312 },
            { x: 174.73684692382812, y: 609.4736938476562 },
            { x: 176.8421173095703, y: 514.7368774414062 },
          ],
          refResolution: { w: 862, h: 746 },
        },
        name: 'test',
      },
    };
    const videoResolution = { w: 1280, h: 720 };
    const filename = 'test.mp4';
    const validUuidStr = '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed';
    const invalidUuidStr = 'not a uuid';

    it('creates UUID if empty', () => {
      const recording = new Recording(startDate, endDate, areas, videoResolution, filename);

      expect(recording.id).toBeDefined();
      expect(recording.id).not.toBeNull();
      expect(typeof recording.id).toEqual('string');
      expect(UUID.validate(recording.id)).toBeTrue();
    });

    it('uses the passed uuid', () => {
      const recording = new Recording(startDate,
        endDate,
        areas,
        videoResolution,
        filename,
        validUuidStr);

      expect(recording.id).toBe(validUuidStr);
    });

    it('throws errors on invalid uuids', () => {
      expect(() => {
        // eslint-disable-next-line no-unused-vars
        const recording = new Recording(startDate,
          endDate,
          areas,
          videoResolution,
          filename,
          invalidUuidStr);
      }).toThrow();
    });
  });
});
