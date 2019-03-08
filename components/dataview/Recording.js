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
    return (
      <div className="recording pl-5">
        <div className="text-white flex">
          <h4>{dayjs(this.props.dateStart).format('MMM DD, YYYY')}</h4>
          <div className="ml-8">
            {dayjs(this.props.dateStart).format('hh:mm a')} - {this.renderDateEnd(this.props.dateEnd, this.props.active)}
          </div>
        </div>
        <a href={`/recording/${this.props.id}/trackerhistory`} target="_blank">Download tracker data</a>
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
