import React, { Component } from 'react'
import { connect } from 'react-redux'

import { exportCountingData } from '../../statemanagement/app/CounterStateManagement';
import { stopCounting, hideCountingData } from '../../statemanagement/app/AppStateManagement';
import BtnStopCounting from './BtnStopCounting';

class EndCountingCTA extends Component {

  render () {
    return (
      <React.Fragment>
        {!this.props.isCounting &&
          <div className="exportCountContainer">
            <div 
              className="button export"
              onClick={() => this.props.dispatch(exportCountingData())}
            >
              <h2>Export data</h2>
            </div>
            <div
              className="button count"
              onClick={() => this.props.dispatch(hideCountingData())}
            >
              <h2>Count again</h2>
            </div>
          </div>
        }
        {this.props.isCounting &&
          <BtnStopCounting 
            onClick={() => this.props.dispatch(stopCounting())}
          />
        }
        <style jsx>{`
          .exportCountContainer{
            position: fixed;
            bottom: 1.5rem;
            width: 18.5rem;
            height: 3.1rem;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
          }
          .exportCountContainer .button{
            height: 2.5rem;
            border: 5px solid transparent;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .exportCountContainer .export{
            background-color: white;
            color: black;
            width: 8rem;
            margin-right: 1rem;
          }
          .exportCountContainer .export:hover{
            border: 5px solid #D6D6D6;
          }
          .exportCountContainer .count{
            background-color: #5C5C5C;
            color: white;
            width: 8.5rem;
          }
          .exportCountContainer .count:hover{
            border: 5px solid #464646;
          }
        `}</style>
      </React.Fragment>
    )
  }
}

export default connect((state) => {
  return {
    isCounting: state.app.get('isCounting')
  }
})(EndCountingCTA)
