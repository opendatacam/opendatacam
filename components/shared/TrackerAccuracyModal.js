import React, { Component } from 'react';

class TrackerAccuracyModal extends Component {

  render() {

    return (
      <div className="overlay" onClick={() => this.props.close()}>
        <div className="modal rounded p-10 shadow text-inverse bg-default border-inverse">
          <h3 className="text-center text-xl font-bold">
            Tracker accuracy
          </h3>
          <div className="mt-4">
            <p>The heatmap highlights the areas where the tracker accuracy <strong>isn't good</strong> to help you:</p>
            <ul className="list-disc mt-2 ml-6">
                <li>Set counter lines where things are well tracked</li>
                <li>Decide if you should eventually change the camera viewpoint</li>
            </ul>
          </div>
          <button 
            className="btn btn-primary btn-rounded min-w-100 mt-5 pl-10 pr-10"
            onClick={() => this.props.close()}>
            OK
          </button>
        </div>
        <style jsx>{`
          .overlay {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.8);
            z-index: 8;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .modal {
            border: 1px solid black;
            max-width: 90%;
            height: auto;
            padding: 1rem;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
          }
        `}</style>
      </div>
    )
  }
}

export default TrackerAccuracyModal;
