import React, { Component } from 'react';
import Link from 'next/link';

class LinkItem extends Component {

  render() {
    return (
      <Link href={this.props.link}>
        <a className="link">
          {this.props.label}
          <style jsx>{`
            .link {
              position: absolute;
              z-index: 4;
              top: 5px;
              left: 5px;
              color: white;
              background-color: black;
              border-radius: 5px;
              padding: 5px;
            }
          `}</style>
        </a>
      </Link>
    );
  }
}

export default LinkItem;
