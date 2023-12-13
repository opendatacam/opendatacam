import React from 'react';
import { Provider } from 'react-redux'

import { store } from '../statemanagement/store';
import '../styles/index.css';

export default function MyApp({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
}
