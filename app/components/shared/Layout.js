import { Component } from 'react';
import Head from 'next/head'

class Layout extends Component {

  render() { 
    return (
      <div>
        <Head>
          <title>Traffic Cam</title>
          <meta charSet='utf-8' />
          <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=0" />
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

          :global(body > div:first-of-type) {
            height: 100%;
          }

          :global(#__next) {
            height: 100%;
          }

          :global(#__next > div) {
            height: 100%;
          }

          :global(#__next > div > div) {
            height: 100%;
          }

          :global(.landing-page) {
            height: 100%;
          }
        `}</style>
      </div>
    );
  }
}
 
export default Layout;
