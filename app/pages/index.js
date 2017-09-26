import React from 'react'
import Link from 'next/link'
import { initStore } from '../statemanagement/store'
import withRedux from 'next-redux-wrapper'

import Layout from '../components/shared/Layout';
import Video from '../components/shared/Video'; 

class Index extends React.Component {
  static getInitialProps ({ store, pathname, query, asPath }) {
    console.log('getInitialProps');
  }

  render () {
    return (
      <Layout>
        <Video />
      </Layout>
    )
  }
}

export default withRedux(initStore)(Index)
