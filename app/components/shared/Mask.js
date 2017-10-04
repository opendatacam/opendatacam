import { Component } from 'react';
import { connect } from 'react-redux';

import MaskItem from './MaskItem';

class Mask extends Component {

  constructor(props) {
    super(props);

    this.state = {
      masks: [] 
    }

    this.isUpdatingMasks = false;
    this.lastFrameDrawn = -1;
    this.loopUpdateMasks = this.loopUpdateMasks.bind(this);
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

  updateMasks(objectTrackerDataForThisFrame) {

  }

  loopUpdateMasks() {
    if(window.currentFrame &&
      this.lastFrameDrawn !== window.currentFrame) {

        let objectTrackerDataForThisFrame = this.props.objectTrackerData[window.currentFrame];
        if(objectTrackerDataForThisFrame) {
          // console.log('setState');
          this.setState({ masks: objectTrackerDataForThisFrame});
        }
    }
    requestAnimationFrame(this.loopUpdateMasks.bind(this));
  }

    // TODO IF VIDEO PAUSES, STOP UPDATING CANVAS
  

  // createSvgMask(id, x, y, w, h) {
  //   var rect = document.createElementNS(xmlns, "rect");
  //   rect.setAttributeNS (null, 'id', `mask-${id}`);
  //   rect.setAttributeNS (null, 'x', x);
  //   rect.setAttributeNS (null, 'y', y);
  //   rect.setAttributeNS (null, 'stroke', "#000000");
  //   rect.setAttributeNS (null, 'stroke-miterlimit', 10);
  //   rect.setAttributeNS (null, 'width', w);
  //   rect.setAttributeNS (null, 'height', h);
  //   clipPath.appendChild(rect);
  //   maskedIds[id] = rect;
  // }
  
  // updateSvgMask(id, x, y, w, h) {
  //   maskedIds[id].setAttributeNS(null, 'x', x);
  //   maskedIds[id].setAttributeNS(null, 'y', y);
  //   maskedIds[id].setAttributeNS(null, 'width', w);
  //   maskedIds[id].setAttributeNS(null, 'height', h);
  // }
  
  // removeSvgMask(id) {
  //   maskedIds[id].parentNode.removeChild(maskedIds[id]);
  //   delete maskedIds[id];
  //   var i = idsToMask.indexOf(id);
  //   if(i != -1) {
  //     idsToMask.splice(i, 1);
  //   }
  // }
  
  // cleanUpSvgMasks(trackerDetection) {
  //   for (var id in maskedIds) {
  //     if(!trackerDetection.find((detection) => detection.idDisplay === id)) {
  //       removeSvgMask(id);
  //     }
  //   }
  // }
  
  // cleanUpAllSvgMasks() {
  //   for (var id in maskedIds) {
  //     removeSvgMask(id);
  //   }
  // }

  // renderMask(mask) {
  //   return (
  //     <rect 
  //       key={mask.id}
  //       x={mask.x}
  //       y={mask.y}
  //       stroke="#000000"
  //       strokeMiterlimit="10"
  //       width={mask.w}
  //       height={mask.h}
  //     ></rect>
  //   )
  // }

  render() {
    return (
      <svg 
        width="1280" 
        height="720" id="average-img" className="average-img">
        <image 
          xlinkHref="/static/detections/2_prototype_video/236716453-average-1280.jpg" 
          x="0" 
          y="0" 
          width="1280" 
          height="720" 
          clipPath="url(#svgPath)"
        />
        <defs>
          <clipPath id="svgPath">
            {this.state.masks.map((mask) => {
              <MaskItem key={mask.id} {...mask} />
            })}
          </clipPath>
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
  return {
    objectTrackerData: state.objectTracker.get('data'),
    isObjectTrackerDataFetched: state.objectTracker.get('fetched'),
    isPlaying: state.video.get('isPlaying')
  }
})(Mask);
