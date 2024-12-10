module.exports = {
  getURLData(req) {
    let protocol = 'http';
    if (req.headers['x-forwarded-proto'] === 'https') {
      protocol = 'https';
    }

    let ret;
    const parsedUrl = req.get('Host').split(':');
    if (parsedUrl.length > 1) {
      ret = {
        address: parsedUrl[0],
        port: parsedUrl[1],
        protocol,
      };
    } else {
      ret = {
        address: req.get('Host'),
        port: 80,
        protocol: req.protocol,
      };
    }
    return ret;
  },
};
