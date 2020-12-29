class Logger {
  constructor() {
    this.debug = false;
  }

  log(message) {
    if (this.debug) {
      console.log(message);
    }
  }
}

const LoggerInstance = new Logger();

module.exports = LoggerInstance;
