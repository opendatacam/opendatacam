import { Component } from 'react';
import Head from 'next/head'

class Layout extends Component {

  render() { 
    return (
      <div>
        <Head>
          <title>Traffic Cam</title>
          <meta charSet='utf-8' />
          <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,minimum-scale=1,user-scalable=0,initial-scale=1" />
          <link href="https://fonts.googleapis.com/css?family=Geo|Quantico:700" rel="stylesheet" />
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
            font-family: 'Quantico', sans-serif;
            background-color: #262626;          
          }

          :global(html) {
            font-size: 62.5%; 
          }

          @media (max-width: 450px) {
            :global(html) { font-size: 50%; }
          }

          @media (max-height: 400px) {
            :global(html) { font-size: 50%; }
          }

          :global(body) {
            font-size: 1.6rem;
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
