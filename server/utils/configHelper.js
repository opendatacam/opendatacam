const config = require('../../config.json');

module.exports = {
    getMjpegStreamPort: () => config.PORTS && config.PORTS.darknet_mjpeg_stream || 8090,
    getJsonStreamPort: () => config.PORTS && config.PORTS.darknet_json_stream || 8070,
    getAppPort: () => config.PORTS && config.PORTS.app || 8080
};