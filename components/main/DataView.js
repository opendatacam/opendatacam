import React, { PureComponent } from 'react'
import { connect } from 'react-redux';
import { fetchHistory } from '../../statemanagement/app/HistoryStateManagement';
import dayjs from 'dayjs';
import Recording from '../dataview/Recording';

/**
 * TODO SPLIT THIS INTO TWO COMPONENT TO HAVE ONE THAT RENDERS ALL THE TIME (current recording)
 * AND THE HISTORY THAT JUST RENDERS ONCE
 */

class DataView extends PureComponent {

  constructor(props) {
    super(props);
  }


  componentDidMount() {
    this.props.dispatch(fetchHistory());
  }

  componentWillUnmount() {

  }

  render () {

    const pagination = this.props.recordingsCursor.toJS();
    const needPagination = pagination.total > pagination.limit;
    const nbPages = Math.ceil(pagination.total / pagination.limit);
    const pagesArray = new Array(nbPages).fill(0);
    const currentPage = Math.floor(pagination.offset / pagination.limit);

    return (
        <div className="data-view bg-default-soft">
          {this.props.recordingStatus.get('isRecording') &&
            <Recording 
              id={this.props.recordingStatus.get('recordingId')} 
              dateStart={this.props.recordingStatus.get('dateStarted')}
              counterData={this.props.counterSummary}
              countingAreas={this.props.countingAreas}
              nbPaths={this.props.totalItemsTracked}
              filename={this.props.recordingStatus.get('filename')}
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
              filename={recording.get('filename')}
              nbPaths={recording.getIn(['trackerSummary', 'totalItemsTracked'])}
            />
          )}
          {needPagination &&
            <div className="flex justify-center mb-8">
              {pagesArray.map((value, index) =>
                <button 
                  key={index}
                  className={`btn btn-default ${index === currentPage ? 'btn-default--active' : ''}`}
                  onClick={() => {
                    this.props.dispatch(fetchHistory(index * pagination.limit, pagination.limit));
                  }}
                >
                  {index}
                </button>
              )}
            </div>
          }
          <style jsx>{`
            .data-view {
              width: 100%;
              height: 100%;
              overflow: scroll;
              padding-top: 100px;
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
    recordingsCursor: state.history.get('recordingsCursor'),
    counterSummary: state.counter.get('counterSummary'),
    countingAreas: state.counter.get('countingAreas'),
    totalItemsTracked: state.counter.getIn(['trackerSummary', 'totalItemsTracked'])
  }
})(DataView)
