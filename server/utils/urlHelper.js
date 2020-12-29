const self = module.exports = {
  getURLData(req) {
    let protocol = 'http';
    if (req.headers['x-forwarded-proto'] === 'https') {
      protocol = 'https';
    }

    const parsedUrl = req.get('Host').split(':');
    if (parsedUrl.length > 1) {
      return {
        address: parsedUrl[0],
        port: parsedUrl[1],
        protocol,
      };
    }
    return {
      address: parsedUrl[0],
      port: 80,
      protocol,
    };
  },
};
