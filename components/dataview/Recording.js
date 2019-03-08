import React, { Component } from 'react'
import { connect } from 'react-redux';
import dayjs from 'dayjs';

class Recording extends Component {

  constructor(props) {
    super(props);
  }


  componentDidMount() {

  }

  componentWillUnmount() {

  }

  renderDateEnd(dateEnd, active = false) {
    if(!active) {
      return dayjs(dateEnd).format('hh:mm a')
    } else {
      return (
        <span className="text-red font-bold">Ongoing</span>
      )
    }
  }

  render() {

    const recording = this.props.recording;

    return (
      <div className="recording pl-2">
        <div className="text-white flex">
          <h4>{dayjs(recording.dateStart).format('MMM DD, YYYY')}</h4>
          <div className="ml-8">
            {dayjs(recording.dateStart).format('hh:mm a')} - {this.renderDateEnd(recording.dateEnd, this.props.active)}
          </div>
        </div>
        <a href={`/recording/${recording._id}/trackerhistory`} target="_blank">Download tracker data</a>
        <style jsx>{`
            .recording {
              width: 100%;
            }
          `}</style>
      </div>
    )
  }
}

export default Recording
