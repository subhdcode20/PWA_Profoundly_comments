import React from 'react';
import { render as ReactDomRender } from 'react-dom';
import { Route, HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import ReduxStore from './reducers/store';
// import App from './components/App';
import Comments from './components/Comments';
import Chat from './components/Chat';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import registerServiceWorker from './registerServiceWorker';
import initialize from "./initializeFirebase";

// const MyApp = props => (
//   <MuiThemeProvider>
//     <App route={props}/>
//   </MuiThemeProvider>
// );

const MyApp = props => (
  <MuiThemeProvider>
    <Comments route={props}/>
  </MuiThemeProvider>
);

// const MyChat = props => (
//     <MuiThemeProvider>
//       <Chat route={props}/>
//     </MuiThemeProvider>
//   );
initialize();
//<Route exact path="/chat" component={MyChat} />
ReactDomRender(
    <Provider store={ReduxStore}>
        <HashRouter>
            <div>
                <Route exact path="/" component={MyApp} />
            </div>
        </HashRouter>
    </Provider>,
    document.getElementById('app')
);
registerServiceWorker();
