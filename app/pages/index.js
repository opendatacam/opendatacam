import React from 'react'
import Link from 'next/link'
import { initStore } from '../statemanagement/store'
import withRedux from 'next-redux-wrapper'
import NoSSR from 'react-no-ssr';

import Layout from '../components/shared/Layout';
import Landing from '../components/main/Landing'; 
import SplashScreen from '../components/shared/SplashScreen'; 

import { fetchRawDetections } from '../statemanagement/app/RawDetectionsStateManagement';
import { fetchObjectTracker } from '../statemanagement/app/ObjectTrackerStateManagement';

class Index extends React.Component {
  static getInitialProps ({ store, pathname, query, asPath }) {
    // console.log('getInitialProps');
  }

  render () {
    return (
      <Layout>
        <NoSSR onSSR={<SplashScreen />}>
          <Landing />
        </NoSSR>
      </Layout>
    )
  }
}

export default withRedux(initStore)(Index)
