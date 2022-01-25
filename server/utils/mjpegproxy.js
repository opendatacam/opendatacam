// Copyright (C) 2013, Georges-Etienne Legendre <legege@legege.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

const url = require('url');
const http = require('http');

function extractBoundary(contentType) {
  contentType = contentType.replace(/\s+/g, '');

  const startIndex = contentType.indexOf('boundary=');
  let endIndex = contentType.indexOf(';', startIndex);
  if (endIndex == -1) { // boundary is the last option
    // some servers, like mjpeg-streamer puts a '\r' character at the end of each line.
    if ((endIndex = contentType.indexOf('\r', startIndex)) == -1) {
      endIndex = contentType.length;
    }
  }
  return contentType.substring(startIndex + 9, endIndex).replace(/"/gi, '').replace(/^\-\-/gi, '');
}

const MjpegProxy = exports.MjpegProxy = function (mjpegUrl) {
  const self = this;

  if (!mjpegUrl) throw new Error('Please provide a source MJPEG URL');

  self.mjpegOptions = url.parse(mjpegUrl);

  self.audienceResponses = [];
  self.newAudienceResponses = [];

  self.boundary = null;
  self.globalMjpegResponse = null;
  self.mjpegRequest = null;

  self.proxyRequest = function (req, res) {
    if (res.socket == null) {
      return;
    }

    // There is already another client consuming the MJPEG response
    if (self.mjpegRequest !== null) {
      self._newClient(req, res);
    } else {
      // Send source MJPEG request
      self.mjpegRequest = http.get(self.mjpegOptions, (mjpegResponse) => {
        // console.log('request');
        self.globalMjpegResponse = mjpegResponse;
        self.boundary = extractBoundary(mjpegResponse.headers['content-type']);

        self._newClient(req, res);

        let lastByte1 = null;
        let lastByte2 = null;

        mjpegResponse.on('data', (chunk) => {
          // Fix CRLF issue on iOS 6+: boundary should be preceded by CRLF.
          if (lastByte1 != null && lastByte2 != null) {
            const oldheader = `--${self.boundary}`;

            var p = chunk.indexOf(oldheader);

            if (p == 0 && !(lastByte2 == 0x0d && lastByte1 == 0x0a) || p > 1 && !(chunk[p - 2] == 0x0d && chunk[p - 1] == 0x0a)) {
              const b1 = chunk.slice(0, p);
              const b2 = Buffer.from(`\r\n--${self.boundary}`);
              const b3 = chunk.slice(p + oldheader.length);
              chunk = Buffer.concat([b1, b2, b3]);
            }
          }

          lastByte1 = chunk[chunk.length - 1];
          lastByte2 = chunk[chunk.length - 2];

          for (let i = self.audienceResponses.length; i--;) {
            const res = self.audienceResponses[i];

            // First time we push data... lets start at a boundary
            if (self.newAudienceResponses.indexOf(res) >= 0) {
              var p = chunk.indexOf(`--${self.boundary}`);
              if (p >= 0) {
                res.write(chunk.slice(p));
                self.newAudienceResponses.splice(self.newAudienceResponses.indexOf(res), 1); // remove from new
              }
            } else {
              res.write(chunk);
            }
          }
        });
        mjpegResponse.on('end', () => {
          // console.log("...end");
          for (let i = self.audienceResponses.length; i--;) {
            const res = self.audienceResponses[i];
            res.end();
          }
        });
        mjpegResponse.on('close', () => {
          console.info("MJPEG-Proxy: Close");
          self.audienceResponses.forEach(response => response.end());
          self.audienceResponses = [];
          if (self.audienceResponses.length == 0) {
            self.mjpegRequest = null;
            self.globalMjpegResponse.destroy();
          }
        });
      });

      self.mjpegRequest.on('error', (e) => {
        console.error('MJPEG-Proxy: Problem with request: ', e);
        console.error(e);
        self.audienceResponses.forEach(response => response.end());
        self.audienceResponses = [];
        if (self.audienceResponses.length == 0) {
          self.mjpegRequest = null;
          self.globalMjpegResponse.destroy();
        }
      });
    }
  };

  self._newClient = function (req, res) {
    res.writeHead(200, {
      Expires: 'Mon, 01 Jul 1980 00:00:00 GMT',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      'Content-Type': `multipart/x-mixed-replace;boundary=${self.boundary}`,
    });

    self.audienceResponses.push(res);
    self.newAudienceResponses.push(res);

    res.socket.on('close', () => {
      // console.log('exiting client!');

      self.audienceResponses.splice(self.audienceResponses.indexOf(res), 1);
      if (self.newAudienceResponses.indexOf(res) >= 0) {
        self.newAudienceResponses.splice(self.newAudienceResponses.indexOf(res), 1); // remove from new
      }

      if (self.audienceResponses.length == 0) {
        self.mjpegRequest = null;
        self.globalMjpegResponse.destroy();
      }
    });
  };
};
