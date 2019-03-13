import React, { Component } from 'react'
import { connect } from 'react-redux';
import { fetchHistory } from '../../statemanagement/app/HistoryStateManagement';
import dayjs from 'dayjs';
import Recording from '../dataview/Recording';

class DataView extends Component {

  constructor(props) {
    super(props);
  }


  componentDidMount() {
    this.props.dispatch(fetchHistory());
  }

  componentWillUnmount() {

  }

  render () {
    return (
        <div className="data-view bg-black">
          {this.props.recordingStatus.get('isRecording') &&
            <Recording 
              id={this.props.recordingStatus.get('recordingId')} 
              dateStart={this.props.recordingStatus.get('dateStarted')}
              counterData={this.props.counterSummary}
              countingAreas={this.props.countingAreas}
              nbPaths={this.props.totalItemsTracked}
              active
            />
          }
          {this.props.recordingHistory.map((recording) =>
            <Recording 
              key={recording.get('_id')} 
              id={recording.get('_id')} 
              dateStart={recording.get('dateStart')}
              dateEnd={recording.get('dateEnd')}
              counterData={recording.get('counterSummary')}
              countingAreas={recording.get('areas')}
              nbPaths={recording.getIn(['trackerSummary', 'totalItemsTracked'])}
            />
          )}
          <style jsx>{`
            .data-view {
              width: 100%;
              height: 100%;
              position: fixed;
              will-change: transform;
              overflow: scroll;
              padding-top: 100px;
              top: 0;
              left: 0;
              bottom: 0;
              right: 0;
            }
          `}</style>
        </div>
    )
  }
}

export default connect((state) => {
  
  return {
    recordingHistory: state.app.getIn(['recordingStatus', 'isRecording']) ? state.history.get('recordingHistory').skip(1) : state.history.get('recordingHistory'),
    recordingStatus: state.app.get('recordingStatus'),
    counterSummary: state.counter.get('counterSummary'),
    countingAreas: state.counter.get('countingAreas'),
    totalItemsTracked: state.counter.getIn(['trackerSummary', 'totalItemsTracked'])
  }
})(DataView)
