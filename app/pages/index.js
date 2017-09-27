import React from 'react'
import Link from 'next/link'
import { initStore } from '../statemanagement/store'
import withRedux from 'next-redux-wrapper'

import Layout from '../components/shared/Layout';
import Video from '../components/shared/Video'; 
import Canvas from '../components/shared/Canvas'; 

import { fetchRawDetections } from '../statemanagement/app/RawDetectionsStateManagement';
import { fetchObjectTracker } from '../statemanagement/app/ObjectTrackerStateManagement';

class Index extends React.Component {
  static getInitialProps ({ store, pathname, query, asPath }) {
    // console.log('getInitialProps');
  }

  componentDidMount() {
    this.props.dispatch(fetchObjectTracker());
    this.props.dispatch(fetchRawDetections());
  }

  render () {
    return (
      <Layout>
        <Video />
        <Canvas />
      </Layout>
    )
  }
}

export default withRedux(initStore)(Index)
