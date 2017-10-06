import { Component } from 'react';
import { connect } from 'react-redux';

import Clippath from './Clippath';
import PuffAnimation from './PuffAnimation';

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
      masks: [],
      puffAnimations: []
    }

    this.clicksRecorded = [];

    this.isUpdatingMasks = false;
    this.lastFrameDrawn = -1;
    this.loopUpdateMasks = this.loopUpdateMasks.bind(this);
    this.recordClick = this.recordClick.bind(this);
    this.initClickRecorder = this.initClickRecorder.bind(this);
    this.cleanClickRecorder = this.cleanClickRecorder.bind(this);
    this.removePuffAnimation = this.removePuffAnimation.bind(this);
  }

  componentDidMount() {
    this.initClickRecorder();

    // prefetch puff image
    let img = new Image();
    img.src = '/static/puff-smoke.svg';

    // init global var
    window.itemsMasked = [];
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
                      this.setState({
                        puffAnimations: [...this.state.puffAnimations, {
                          x: click.xReal,
                          y: click.yReal,
                          id: potentialObjectToMask.id
                        }]
                      });
                    }
                });
              }
            }            
          });
          this.clicksRecorded = [];
          this.setState({ masks: objectsMaskedUpdated });
          window.itemsMasked = objectsMaskedUpdated;
        }
    }
    requestAnimationFrame(this.loopUpdateMasks.bind(this));
  }

  recordClick(event) {

    let coordinates = {
      x: event.pageX,
      y: event.pageY
    };

    // Ignore Chrome mobile touchstart event
    if(coordinates.x === undefined) {
      return;
    }

    let width, height; 

    // Map coordinates to canvas coordinates
    if(window.innerWidth / window.innerHeight < 16/9) {
      width = window.innerHeight * 1280 / 720;
      height = window.innerHeight;
    } else {
      width = window.innerWidth;
      height = window.innerWidth * 720 / 1280;
    }

    coordinates = {
      x: coordinates.x * 1280 / width,
      y: coordinates.y * 720 / height,
      xReal: coordinates.x,
      yReal: coordinates.y
    }

    this.clicksRecorded.push(coordinates);
  }

  initClickRecorder() {
    window.document.body.addEventListener("click", this.recordClick);
    window.document.body.addEventListener("touchstart", this.recordClick);
  }

  cleanClickRecorder() {
    window.document.body.removeEventListener("click", this.recordClick);
  }

  removePuffAnimation(id) {
    this.setState({
      puffAnimations: this.state.puffAnimations.filter((puffAnimation) => puffAnimation.id !== id)
    });
  }

  componentWillUnmount() {
    this.cleanClickRecorder();
  }

  render() {

    return (
      <div className="mask-container">
        <svg
          id="average-img"
          preserveAspectRatio="xMinYMax meet"
          viewBox="0 0 1280 720"
          className={`average-img ${!this.props.isVideoReadyToPlay ? 'hidden' : 'visible'}`}
        >
          <image
            xlinkHref={this.props.averageImgSrc}
            x="0" 
            y="0"
            width="1280px" 
            height="720px"
            clipPath="url(#svgPath)"
          />
          <defs>
            <Clippath masks={this.state.masks} />
          </defs>
        </svg>
        {this.state.puffAnimations.map((puffAnimation) => 
          <PuffAnimation
            key={puffAnimation.id}
            id={puffAnimation.id}
            x={puffAnimation.x}
            y={puffAnimation.y}
            removePuffAnimation={this.removePuffAnimation}
          />
        )}
        <style jsx>{`
          .mask-container {
            width: 100%;
            height: 100%;
            position: absolute;
            top:0;
            left:0;
          }
          .average-img {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            z-index: 1;
            overflow: hidden;
          }

          @media (min-aspect-ratio: 16/9) {
            .average-img {
              width: 100%;
              height: auto;
            }
          }

          @media (max-aspect-ratio: 16/9) {
            .average-img {
              width: auto;
              height: 100%;
            }
          }

          .hidden {
            display: none;
          }
        `}</style>
      </div>
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
    averageImgSrc: getAverageImgPath(selectedVideo.get('name'), selectedVideo.get('vimeoId')),
    isVideoReadyToPlay: state.video.get('isReadyToPlay')
  }
})(Mask);
