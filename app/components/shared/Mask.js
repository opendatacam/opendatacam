import { Component } from 'react';
import { connect } from 'react-redux';

import Clippath from './Clippath';

import { scaleDetection } from '../../utils/resolution';

import { getAverageImgPath } from '../../statemanagement/app/AppStateManagement';

const canvasResolution = {
  w: 1280,
  h: 720
}

const originalResolution = {
  w: 1920,
  h: 1080
}

class Mask extends Component {

  constructor(props) {
    super(props);

    this.state = {
      masks: []
    }

    this.clicksRecorded = [];

    this.isUpdatingMasks = false;
    this.lastFrameDrawn = -1;
    this.loopUpdateMasks = this.loopUpdateMasks.bind(this);
    this.recordClick = this.recordClick.bind(this);
    this.initClickRecorder = this.initClickRecorder.bind(this);
    this.cleanClickRecorder = this.cleanClickRecorder.bind(this);
  }

  componentDidMount() {
    this.initClickRecorder();
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.isPlaying === true &&
       nextProps.isObjectTrackerDataFetched === true) {
      if(!this.isUpdatingMasks) {
        console.log('Start loop update masks');
        this.isUpdatingMasks = true;
        this.loopUpdateMasks();
      }
    }
  }

  loopUpdateMasks() {
    if(window.currentFrame &&
      this.lastFrameDrawn !== window.currentFrame) {

        // Enlarge bbox of 30px
        const ENLARGE_SIZE = 30;

        let objectTrackerDataForThisFrame = this.props.objectTrackerData[window.currentFrame];
        if(objectTrackerDataForThisFrame) {
          let objectsMaskedToUpdate = this.state.masks;
          let objectsMaskedUpdated = [];

          // Clean up objects to mask that have disapeared
          objectsMaskedToUpdate = objectsMaskedToUpdate.filter((objectMasked) => {
            return objectTrackerDataForThisFrame.find((objectTracked) => objectTracked.id === objectMasked.id)
          });
          
          objectTrackerDataForThisFrame.map((objectTracked) => {

            let objectTrackedScaled = scaleDetection(objectTracked, canvasResolution, originalResolution);
            let potentialObjectToMask = {
              idDisplay: objectTrackedScaled.idDisplay,
              id: objectTrackedScaled.id,
              x: objectTrackedScaled.x - objectTrackedScaled.w/2 - ENLARGE_SIZE,
              y: objectTrackedScaled.y - objectTrackedScaled.h/2 - ENLARGE_SIZE,
              w: objectTrackedScaled.w + ENLARGE_SIZE * 2,
              h: objectTrackedScaled.h + ENLARGE_SIZE * 2,
            }

            // If this is one of the objects we are already masking and that need update of its position
            const objectToUpdate = objectsMaskedToUpdate.find((objectMasked) => objectMasked.id === potentialObjectToMask.id)
            if(objectToUpdate) {
              // Add it to the new list
              objectsMaskedUpdated.push(potentialObjectToMask);
            } else {
              // Look if clicks to disappear things exists for this object
              if(this.clicksRecorded.length > 0) {
                this.clicksRecorded.forEach((click) => {
                  if(click.x >= potentialObjectToMask.x &&
                    click.x <= potentialObjectToMask.x + potentialObjectToMask.w &&
                    click.y >= potentialObjectToMask.y &&
                    click.y <= potentialObjectToMask.y + potentialObjectToMask.h) {
                      console.log(`${potentialObjectToMask.idDisplay} clicked !`)
                      objectsMaskedUpdated.push(potentialObjectToMask);
                    }
                });
              }
            }            
          });
          this.clicksRecorded = [];
          this.setState({ masks: objectsMaskedUpdated });
        }
    }
    requestAnimationFrame(this.loopUpdateMasks.bind(this));
  }

  recordClick(event) {
    this.clicksRecorded.push({
      x: event.pageX,
      y: event.pageY
    });
  }

  initClickRecorder() {
    window.document.addEventListener("click", this.recordClick);
  }

  cleanClickRecorder() {
    window.document.removeEventListener("click", this.recordClick);
  }

  componentWillUnmount() {
    this.cleanClickRecorder();
  }

  render() {

    return (
      <svg 
        width="1280" 
        height="720"
        id="average-img"
        className="average-img"
      >
        <image
          xlinkHref={this.props.averageImgSrc}
          x="0" 
          y="0" 
          width="1280" 
          height="720" 
          clipPath="url(#svgPath)"
        />
        <defs>
          <Clippath masks={this.state.masks} />
        </defs>
        <style jsx>{`
          .average-img {
            position: absolute;
            top: 0;
            left: 0;
            z-index: 1;
          }
        `}</style>
      </svg>
    );
  }
}
 
export default connect((state) => {

  const selectedVideo = state.app.get('availableVideos').find((video) => {
    return video.get('name') === state.app.get('selectedVideo')
  });

  return {
    objectTrackerData: state.objectTracker.get('data'),
    isObjectTrackerDataFetched: state.objectTracker.get('fetched'),
    isPlaying: state.video.get('isPlaying'),
    averageImgSrc: getAverageImgPath(selectedVideo.get('name'), selectedVideo.get('vimeoId'))
  }
})(Mask);
