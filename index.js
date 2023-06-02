/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import { AppState } from './AppState';

AppRegistry.registerComponent(appName, () => () => <AppState>
  <App />
</AppState>);
