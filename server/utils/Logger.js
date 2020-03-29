

class Logger {
    constructor () {
        this.debug = false
    }

    log(message) {
        if(this.debug) {
            console.log(message);
        }
    }
}



var LoggerInstance = new Logger()

module.exports = LoggerInstance
