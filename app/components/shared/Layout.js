import { Component } from 'react';
import { connect } from 'react-redux';
import Head from 'next/head'

class Layout extends Component {

  render() { 
    return (
      <div>
        <Head>
          <title>Traffic Cam</title>
          <meta charSet='utf-8' />
          <meta name='viewport' content='initial-scale=1.0, width=device-width' />
        </Head>
        {this.props.children}
        <style jsx>{`
          :global(html,body) {
            height: 100%;
            width: 100%;
            margin: 0;
            padding: 0;
            left: 0;
            top: 0;
            font-size: 100%;
          }
        `}</style>
      </div>
    );
  }
}
 
export default connect()(Layout);
