import React from 'react'
import { initStore } from '../statemanagement/store'
import withRedux from 'next-redux-wrapper'
import Layout from '../components/shared/Layout'
import MainPage from '../components/main/MainPage'

class Index extends React.Component {

  render () {
    return (
      <Layout>
        <MainPage />
      </Layout>
    )
  }
}

export default withRedux(initStore)(Index)
