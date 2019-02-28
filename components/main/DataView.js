import React, { Component } from 'react'
import { connect } from 'react-redux';
import { fetchHistory } from '../../statemanagement/app/HistoryStateManagement';
import dayjs from 'dayjs';

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
          {this.props.recordingHistory.map((recording) =>
            <div key={recording._id}>
              <p>{dayjs(recording.dateStart).format('MMM DD, YYYY')} : {dayjs(recording.dateStart).format('hh:mm a')} - {dayjs(recording.dateEnd).format('hh:mm a')}</p>
            </div>
          )}
          <style jsx>{`
            .data-view {
              width: 100%;
              height: 100%;
              position: absolute;
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
    recordingHistory: state.history.get('recordingHistory').toJS()
  }
})(DataView)
