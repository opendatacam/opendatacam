import React from 'react'
import { initStore } from '../statemanagement/store'
import withRedux from 'next-redux-wrapper'
import Layout from '../components/shared/Layout'
import MainPage from '../components/main/MainPage'

import { setURLData, showCountingView, drawInstructionsShown } from '../statemanagement/app/AppStateManagement';
import { restoreCountingAreas } from '../statemanagement/app/CounterStateManagement';

class Index extends React.Component {

  static async getInitialProps (params) {
    const { store, isServer, req, query } = params;
    if (isServer) {
      if(query.isCounting) {
        // Jetson app is currently counting, display counting view
        // Restore counting areas
        await store.dispatch(restoreCountingAreas(query.countingAreas))
        await store.dispatch(drawInstructionsShown());
        await store.dispatch(showCountingView());
      }
      await store.dispatch(setURLData(req));
    }
  }

  render () {
    return (
      <Layout>
        <MainPage />
      </Layout>
    )
  }
}

export default withRedux(initStore)(Index)
