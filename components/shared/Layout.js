import React, { Component } from 'react'
import Head from 'next/head'

class Layout extends Component {

  render () {
    return (
      <div>
        <Head>
          <title>OpenDataCam</title>
          <meta charSet='utf-8' />
          <meta
            name='viewport'
            content='width=device-width,initial-scale=1.0,maximum-scale=1.0,minimum-scale=1,user-scalable=0,initial-scale=1'
          />
          <script type="text/javascript" src="/static/js/fabric.min.js" />
        </Head>
        {this.props.children}
      </div>
    )
  }
}

export default Layout
