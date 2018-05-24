import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import configureStore from './configureStore';

import './index.css';
import App from './containers/App/App';
import registerServiceWorker from './registerServiceWorker';

const store = configureStore();

ReactDOM.render(
  <Provider store={store}>
    <MuiThemeProvider>
      <App store={store} />
    </MuiThemeProvider>
  </Provider>,
  document.getElementById('root'),
);
registerServiceWorker();
