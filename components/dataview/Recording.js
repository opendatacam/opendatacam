import React, { PureComponent } from 'react'
import { connect } from 'react-redux';
import dayjs from 'dayjs';
import OpenMoji from '../shared/OpenMoji.js';
import SVG from 'react-inlinesvg';
import { deleteRecording } from '../../statemanagement/app/HistoryStateManagement.js';
import { getCounterColor, getDisplayClasses } from '../../utils/colors.js';
import { COUNTING_AREA_TYPE } from '../../utils/constants.js';
import RecordingDeleteConfirmationModal from '../shared/RecordingDeleteConfirmationModal.js';

class Recording extends PureComponent {

  constructor(props) {
    super(props);

    this.DISPLAY_CLASSES = getDisplayClasses();

    this.state = {
      showDeleteConfirmationModal: false
    }
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
        <span className="font-bold" style={{color: "#FF0000"}}>Ongoing</span>
      )
    }
  }

  render() {

    return (
      <div className="flex flex-initial flex-col recording pl-2 mb-10">
        <div className="text-inverse flex flex-initial items-center pl-6">
          <div>{dayjs(this.props.dateStart).format('MMM DD, YYYY')}</div>
          <div className="ml-10">
            {dayjs(this.props.dateStart).format('hh:mm a')} - {this.renderDateEnd(this.props.dateEnd, this.props.active)}
          </div>
          {this.props.filename &&
            <div className="ml-10">
              {this.props.filename}
            </div>
          }
          {!this.props.active &&
            <button
              className="btn btn-default p-0 ml-2 shadow rounded"
              onClick={() => this.setState({ showDeleteConfirmationModal: true})}
            >
              <SVG 
                className="w-6 h-6 svg-icon flex items-center" 
                cacheRequests={true}
                src={`/static/icons/ui/delete.svg`} 
                aria-label="icon close"
              />
            </button>
          }
        </div>
        {this.state.showDeleteConfirmationModal &&
          <RecordingDeleteConfirmationModal 
            onCancel={() => this.setState({ showDeleteConfirmationModal: false})} 
            onConfirm={() => this.props.dispatch(deleteRecording(this.props.id))} 
          />
        }
        <div className="flex flex-initial flex-wrap pb-2 pl-1 m-2">
          {this.props.countingAreas.size > 0 &&
            <div className="flex flex-initial flex-col rounded bg-white text-black shadow m-2 p-4">
              <div className="flex items-end justify-between">
                <h3 className="mr-3 text-xl font-bold">Counter</h3>
                <div>
                  <div className="font-medium mr-2 inline-block">Download:</div>
                  <a className="btn-text mr-2" href={`/recording/${this.props.id}/counter`} target="_blank" download>JSON</a>
                  <a className="btn-text" href={`/recording/${this.props.id}/counter/csv`} target="_blank" download>CSV</a>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap">
                {this.props.countingAreas && this.props.countingAreas.entrySeq().map(([countingAreaId, countingAreaData], index) =>
                  <div 
                    key={countingAreaId} 
                    className={`flex flex-col counter-area bg-gray-200 m-2 rounded p-4`}
                  >
                    <div className="flex items-center">
                      <h4 className="font-medium">{countingAreaData.get('name')}</h4>
                      <div className="w-4 h-4 ml-2 rounded-full" style={{'backgroundColor': getCounterColor(countingAreaData.get('color'))}}></div>
                      {countingAreaData.get('type') === COUNTING_AREA_TYPE.BIDIRECTIONAL &&
                        <img className="icon-direction" style={{'transform': `rotate(${countingAreaData.getIn(['computed', 'lineBearings']).first() + 90}deg)`}} src="/static/icons/ui/arrow-double.svg" />
                      }
                      {countingAreaData.get('type') === COUNTING_AREA_TYPE.LEFTRIGHT_TOPBOTTOM &&
                        <img className="icon-direction" style={{'transform': `rotate(${countingAreaData.getIn(['computed', 'lineBearings']).first() + 90}deg)`}} src="/static/icons/ui/arrow-up.svg" />
                      }
                      {countingAreaData.get('type') === COUNTING_AREA_TYPE.RIGHTLEFT_BOTTOMTOP &&
                        <img className="icon-direction" style={{'transform': `rotate(${countingAreaData.getIn(['computed', 'lineBearings']).first() + 90}deg)`}} src="/static/icons/ui/arrow-down.svg" />
                      }
                    </div>
                    <div className="flex flex-initial flex-wrap mt-5 w-64">
                      {this.DISPLAY_CLASSES.slice(0, Math.min(this.DISPLAY_CLASSES.length, 6)).map((counterClass) =>
                        <div 
                          className="flex w-16 m-1 items-center justify-center" 
                          key={counterClass.class}
                        >
                          <h4 className="mr-2">{this.props.counterData && this.props.counterData.getIn([countingAreaId, counterClass.class]) || 0}</h4>
                          <OpenMoji
                            hexcode={counterClass.hexcode}
                            class={counterClass.class}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          }
          <div className="flex flex-initial flex-col rounded bg-white text-black shadow m-2 p-4">
            <div className="flex items-end justify-between">
              <h3 className="mr-3 text-xl font-bold">Tracker</h3>
              <div>
                <div className="font-medium mr-2 inline-block">Download:</div>
                <a className="btn-text mr-2" href={`/recording/${this.props.id}/tracker`} target="_blank" download>JSON</a>
              </div>
            </div>
            <div className="mt-6 rounded relative">
              <div className="text-white absolute" style={{ bottom: 10, left : 10}}>
                <h2 className="inline text-4xl font-bold">{this.props.nbPaths}</h2> objects tracked
              </div>
              <img src="/static/placeholder/pathview.jpg" />
            </div>
          </div>
        </div>
        <style jsx>{`
          {/* Didn't succeed to make this better: https://stackoverflow.com/questions/54384305/dynamic-width-parent-with-flexbox-column-wrapping 
            Seems cannot have container parent width shrink when some element are wrapping
          */}
          .counter-area {
            max-width: 350px;
            flex: 1;
          }

          .icon-direction {
            margin-left: 5px;
            width: 20px;
            height: 20px;
          }
        `}</style>
      </div>
    )
  }
}

export default connect()(Recording)
