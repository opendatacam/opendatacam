

// Recording has methods to persist data to DB as it grows
// The idea is never having all the data in memory as 
// trackerHistory can be quite huge

class Recording {
  constructor (
      dateStart,
      dateEnd,
      areas,
      videoResolution,
      filename) {
    this.dateStart = dateStart
    this.dateEnd = dateEnd
    this.areas = areas
    this.videoResolution = videoResolution
    this.filename = filename
  }
}

module.exports = Recording
