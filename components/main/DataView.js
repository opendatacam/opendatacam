import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import dayjs from 'dayjs';
import { fetchHistory } from '../../statemanagement/app/HistoryStateManagement';
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

  render() {
    const pagination = this.props.recordingsCursor;
    const needPagination = pagination.total > pagination.limit;
    const nbPages = Math.ceil(pagination.total / pagination.limit);
    const pagesArray = new Array(nbPages).fill(0);
    const currentPage = Math.floor(pagination.offset / pagination.limit);

    console.debug(this.props.recordingHistory);

    return (
      <div className="data-view bg-default-soft">
        {this.props.recordingStatus.isRecording
            && (
            <Recording
              id={this.props.recordingStatus.recordingId}
              dateStart={this.props.recordingStatus.dateStarted}
              counterData={this.props.counterSummary}
              countingAreas={this.props.countingAreas}
              nbPaths={this.props.totalItemsTracked}
              filename={this.props.recordingStatus.filename}
              active
            />
            )}
        {this.props.recordingHistory.map((recording) => (
          <Recording
            key={recording.id}
            id={recording.id}
            dateStart={recording.dateStart}
            dateEnd={recording.dateEnd}
            counterData={recording.counterSummary}
            countingAreas={recording.areas}
            filename={recording.filename}
            nbPaths={recording.trackerSummary.totalItemsTracked}
          />
        ))}
        {needPagination
            && (
            <div className="flex justify-center mb-8">
              {pagesArray.map((value, index) => (
                <button
                  key={index}
                  className={`btn btn-default ${index === currentPage ? 'btn-default--active' : ''}`}
                  onClick={() => {
                    this.props.dispatch(fetchHistory(index * pagination.limit, pagination.limit));
                  }}
                >
                  {index}
                </button>
              ))}
            </div>
            )}
        <style jsx>
          {`
            .data-view {
              width: 100%;
              height: 100%;
              overflow: scroll;
              padding-top: 100px;
            }
          `}
        </style>
      </div>
    );
  }
}

export default connect((state) => ({
  recordingHistory: state.app.recordingStatus.isRecording ? state.history.recordingHistory.slice(1) : state.history.recordingHistory,
  recordingStatus: state.app.recordingStatus,
  recordingsCursor: state.history.recordingsCursor,
  counterSummary: state.counter.counterSummary,
  countingAreas: state.counter.countingAreas,
  totalItemsTracked: state.counter.trackerSummary.totalItemsTracked,
}))(DataView);
