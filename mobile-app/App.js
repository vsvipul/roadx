import React from 'react';
import { Text } from 'react-native';
import { createStackNavigator } from 'react-navigation-stack';
import CameraScreen from './screens/CameraScreen';
import MapScreen from './screens/MapScreen';
import { createAppContainer } from 'react-navigation';


const AppNavigator = createStackNavigator({
  Home: 
  {
    screen: MapScreen,
    navigationOptions: ({navigation}) => ({
      header: null
    })
  },
  CameraScreen: 
  {
    screen: CameraScreen
  }
});

const App = createAppContainer(AppNavigator);

export default App;
