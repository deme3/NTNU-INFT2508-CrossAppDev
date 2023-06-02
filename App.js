/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from './views/Home';
import MapPageView from './views/MapView';
import MyFavourites from './views/MyFavourites';
import Settings from './views/Settings';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Palette from './palette';
import { useAppState } from './AppState';
import i18n from './localisation/localisation';

const Tabs = createBottomTabNavigator();

export const App = () => {
  let [appState, _] = useAppState();
  
  let [dynamicPalette, setDynamicPalette] = useState(StyleSheet.create({
    mainBgColor: {
      backgroundColor: Palette.mainBackground
    },
    tabBar: {
    }
  }));
  
  useEffect(
    () => {
      console.log("Changing App.js color mode to " + appState.colorMode);
      Palette.setPalette(appState.colorMode);
      setDynamicPalette(StyleSheet.create({
        mainBgColor: {
          backgroundColor: Palette.mainBackground
        },
        tabBar: appState.colorMode === "dark" ? {
          borderTopColor: Palette.mainBackground
        } : {}
      }));
      if(appState.locale !== "system")
        i18n.locale = appState.locale;
    }
  , [appState]);

  return (
    <SafeAreaView style={[{ flex: 1 }, dynamicPalette.mainBgColor]}>
      <StatusBar
        barStyle={appState.colorMode === "light" ? "dark-content" : "light-content"}
      />
      <NavigationContainer>
        <Tabs.Navigator initialRouteName='Home' screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Palette.tabSelected,
          tabBarStyle: [dynamicPalette.mainBgColor, dynamicPalette.tabBar]
        }} sceneContainerStyle={dynamicPalette.mainBgColor}>
          <Tabs.Screen name='Home' component={Home} options={{
            title: i18n.t("home.title"),
            tabBarIcon: ({ focused, color, size }) => 
              <Icon name="grid-view" size={size} color={color} />
          }} />
          <Tabs.Screen name='MapView' component={MapPageView} options={{
            title: i18n.t("map.title"),
            tabBarIcon: ({ focused, color, size }) => 
              <Icon name="map" size={size} color={color} />
          }} />
          <Tabs.Screen name='MyFavourites' component={MyFavourites} options={{
            title: i18n.t("favourites.title"),
            tabBarIcon: ({ focused, color, size }) => 
              <Icon name="favorite" size={size} color={color} />
          }} />
          <Tabs.Screen name='Settings' component={Settings} options={{
            title: i18n.t("settings.title"),
            tabBarIcon: ({ focused, color, size }) => 
              <Icon name="settings" size={size} color={color} />
          }} />
        </Tabs.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backgroundStyle: {
    backgroundColor: "red"
  }
});

export default App;
