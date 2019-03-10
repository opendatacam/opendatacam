import React, { PureComponent } from 'react'
import { connect } from 'react-redux';
import dayjs from 'dayjs';
import { DISPLAY_CLASSES } from '../../config.json';
import { COLORS } from '../../utils/colors';

class Recording extends PureComponent {

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
      <div className="recording pl-8 w-full mb-10">
        <div className="text-white flex">
          <div>{dayjs(this.props.dateStart).format('MMM DD, YYYY')}</div>
          <div className="ml-10">
            {dayjs(this.props.dateStart).format('hh:mm a')} - {this.renderDateEnd(this.props.dateEnd, this.props.active)}
          </div>
        </div>
        <div className="flex flex-no-wrap overflow-x-auto mt-5">
          <div className="flex flex-col rounded bg-white text-black p-4">
            <div className="flex items-end justify-between">
              <h3 className="mr-3">Counter</h3>
              <a className="btn-text" href={`/recording/${this.props.id}/trackerhistory`} target="_blank">Download data</a>
            </div>
            <div className="mt-4 flex flex-no-wrap">
              {this.props.countingAreas && this.props.countingAreas.entrySeq().map(([countingAreaId, countingAreaData], index) =>
                <div 
                  key={countingAreaId} 
                  className={`bg-grey-lighter mt-2 rounded p-4 ${index === 0 ? '' : 'ml-4' }`}
                >
                  <div className="flex items-center">
                    <h4>{countingAreaData.get('name')}</h4>
                    <div className="w-4 h-4 ml-2 rounded-full" style={{'backgroundColor': COLORS[countingAreaData.get('color')]}}></div>
                  </div>
                  <div className="flex flex-wrap mt-5 w-64">
                    {/* TODO LIMIT to 6 ?, put on its own component to reuse in popover */}
                    {DISPLAY_CLASSES.map((counterClass) =>
                      <div 
                        className="flex w-16 m-2 items-center justify-center" 
                        key={counterClass}
                      >
                        <h4 className="mr-2">{this.props.counterData && this.props.counterData.getIn([countingAreaId, counterClass]) || 0}</h4>
                        <img src={`/static/icons/counter/transparent/${counterClass}.svg`} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col rounded bg-white text-black p-4 ml-4">
            <div className="flex items-end justify-between">
              <h3 className="mr-3">Pathfinder</h3>
              <a className="btn-text" href={`/recording/${this.props.id}/trackerhistory`} target="_blank">Download data</a>
            </div>
            <div className="mt-4 relative">
              <div className="text-white absolute" style={{ bottom: 10, left : 10}}>
                <h2 className="inline">2001</h2> paths
              </div>
              <img src="/static/placeholder/pathview.jpg" />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Recording
