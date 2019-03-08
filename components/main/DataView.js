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
        <div className="data-view">
          {this.props.recordingHistory.map((recording, index) =>
            <Recording 
              key={recording._id} 
              recording={recording}
              active={this.props.isRecording && index === 0}
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
              background-color: black;
            }
          `}</style>
        </div>
    )
  }
}

export default connect((state) => {
  return {
    recordingHistory: state.history.get('recordingHistory').toJS(),
    isRecording: state.app.getIn(['recordingStatus', 'isRecording'])
  }
})(DataView)
