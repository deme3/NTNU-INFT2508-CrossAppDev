import { createContext, useState, useContext, useEffect, useLayoutEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage";

const initialState = {
    locale: "system",
    colorMode: "light",
    buyAuth: "none"
};

const AppContext = createContext(null);
export function AppState(props) {
  const [appState, setAppState] = useState(initialState);
  useLayoutEffect(() => {
    (async function() {
      let settingsLocaleValue = await AsyncStorage.getItem("settings.locale");
      let settingsColorModeValue = await AsyncStorage.getItem("settings.colorMode");
      let settingsBuyAuthValue = await AsyncStorage.getItem("settings.buyAuth");

      setAppState({
        ...appState,
        locale: settingsLocaleValue ?? initialState.locale,
        colorMode: settingsColorModeValue ?? initialState.colorMode,
        buyAuth: settingsBuyAuthValue ?? initialState.buyAuth
      });
    })();
  }, []);
  
  return (
    <AppContext.Provider value={[appState, setAppState]}>
      {props.children}
    </AppContext.Provider>
  );
}

export const useAppState = () => useContext(AppContext);