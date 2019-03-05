import React, { Component } from 'react'
import Head from 'next/head'

class Layout extends Component {
  render () {
    return (
      <div>
        <Head>
          <title>Open Data Cam</title>
          <meta charSet='utf-8' />
          <meta
            name='viewport'
            content='width=device-width,initial-scale=1.0,maximum-scale=1.0,minimum-scale=1,user-scalable=0,initial-scale=1'
          />
          <script type="text/javascript" src="/static/js/fabric.min.js" />
        </Head>
        {this.props.children}
        <style jsx>{`

          {/* @font-face{ 
            font-family: 'Roboto';
            src: url('/static/font/Roboto-Regular.woff') format('woff');
          } */}


          {/* :global(html, body) {
            height: 100%;
            width: 100%;
            margin: 0;
            padding: 0;
            left: 0;
            top: 0;
            background-color: #262626;
            background-color: black;
            color: white;
            cursor: default;
            font-family: 'Roboto', sans-serif;
            font-size: 16px;
          } */}

          {/* @media (max-width: 700px) {
            :global(body,
            html) {
              font-size: 13px;
            }
          }

          :global(html) {
            box-sizing: border-box;
          }

          :global(*, *:before, *:after) {
            box-sizing: inherit;
          }
          

          :global(h1) {
            font-size: 1.8rem;
            font-weight: bold;
          }
          
          :global(h2) {
            font-size: 1.1rem;
            font-weight: bold;
          }
          
          :global(h3) {
            font-size: 2.5rem;
            font-weight: bolder;
          }
          
          :global(a) {
            color: white;
            text-decoration: none;
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
          } */}
        `}</style>
      </div>
    )
  }
}

export default Layout
