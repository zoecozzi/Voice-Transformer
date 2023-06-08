import React from 'react';
import MainTabNavigator from './MainTabNavigator';
import { Provider } from 'react-redux';
import { store } from './store';
import { LogBox } from 'react-native';

LogBox.ignoreAllLogs();

// Affichage de la navigation principale

const App = () => {
  return (
    <Provider store={store}>
      <MainTabNavigator />
    </Provider>
  );
};

export default App;
