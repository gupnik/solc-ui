import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { SnackbarProvider } from 'notistack';
import WalletProvider from './components/common/WalletProvider';
import BootstrapProvider from './components/common/BootstrapProvider';
import { HashRouter, Route } from 'react-router-dom';
import IdoPage from './pages/IdoPage';
import Layout from './components/common/Layout';

function App() {
  return (
    <Provider store={store}>
      <SnackbarProvider maxSnack={5} autoHideDuration={8000}>
        <WalletProvider>
        <BootstrapProvider>
            <HashRouter basename={'/'}>
              <Layout>
                <Route exact path="/" component={IdoPage} />
              </Layout>
            </HashRouter>
          </BootstrapProvider>
        </WalletProvider>
      </SnackbarProvider>
    </Provider>
  );
}

export default App;
