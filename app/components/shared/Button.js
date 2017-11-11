import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Button extends Component {

  static propTypes = {
    title: PropTypes.string,
    large: PropTypes.bool,
    transparent: PropTypes.bool,
    onClick: PropTypes.func
  }

  render() {
    return (
      <a
        className={`btn 
          ${this.props.large ? 'btn-large' : ''}
          ${this.props.transparent ? 'btn-transparent' : ''}
        `}
        onClick={this.props.onClick}
      >
        {this.props.title}
        <style jsx>{`
          .btn {
            background-color: white;
            border: 1px solid white;
            color: #262626;
            cursor: pointer;
            padding: 1rem;
            text-decoration: none;
            margin-bottom: 1rem;
            display: inline-block;

            font-family: "Geo", sans-serif;
            font-size: 2.5rem;
          }

          .btn:hover,.btn:focus {
            background-color: #e6e6e6;
          }

          .btn-transparent {
            background-color: transparent;
            border: 1px solid white;
            color: white;
          }

          .btn-transparent:hover,.btn-transparent:focus {
            background-color: white;
            color: #262626;
          }

          .btn-large {
            font-size: 5rem;
          }

        `}
        </style>
      </a>
    );
  }
}

export default Button;
