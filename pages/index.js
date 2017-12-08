import React from 'react'
import { initStore } from '../statemanagement/store'
import withRedux from 'next-redux-wrapper'
import Layout from '../components/shared/Layout'
import MainPage from '../components/main/MainPage'

import { setURLData } from '../statemanagement/app/AppStateManagement';

class Index extends React.Component {

  static async getInitialProps (params) {
    const { store, isServer, req } = params;
    if (isServer) {
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
