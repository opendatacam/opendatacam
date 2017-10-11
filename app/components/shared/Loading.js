import React, { Component } from 'react';

class Loading extends Component {

  render() {

    return (
      <div className="loader">
        <div className="spinner"/>
        <style jsx>{`
            .loader {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            margin-bottom: 2rem;
            }
            .message {
            margin-top: 1rem;
            font-style: italic;
            }
            .spinner {
                width: 6rem;
                height: 6rem;
                border-style: solid;
                border-color: rgba(0,0,0,0);
                border-top-color: #0BBCD6;
                border-width: 0.3rem 0rem 0rem 0rem;
                transform: will-change;
                
                -webkit-border-radius: 50%;
                    -moz-border-radius: 50%;
                        border-radius: 50%;
                
                -webkit-animation: spin 0.5s infinite linear;
                    -moz-animation: spin 0.5s infinite linear;
                    -o-animation: spin 0.5s infinite linear;
                        animation: spin 0.5s infinite linear;
                }

            @-webkit-keyframes spin {
                from {-webkit-transform: rotate(0deg);}
                to   {-webkit-transform: rotate(359deg);}
            }

            @-moz-keyframes spin {
            from {-moz-transform: rotate(0deg);}
            to   {-moz-transform: rotate(359deg);}
            }

            @-o-keyframes spin {
            from {-o-transform: rotate(0deg);}
            to   {-o-transform: rotate(359deg);}
            }

            @keyframes spin{
            from {transform: rotate(0deg);}
            to   {transform: rotate(359deg);}
            }

        `}</style>
      </div>
    );
  }
}

export default Loading;
