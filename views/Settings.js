import { ScrollView, View, Text, StyleSheet, TouchableHighlight, Switch, Alert } from "react-native";
import Palette, { baseColors } from "../palette";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useCallback, useEffect, useRef, useState } from "react";
import Title from "../components/Title";
import SettingsDetailed from "./SettingsDetailed";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAppState } from "../AppState";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import i18n from "../localisation/localisation";
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics'

const rnBiometrics = new ReactNativeBiometrics()
const SettingsStack = createNativeStackNavigator();

function ListItemSwitch(props) {
  let customStyles = (props.colorMode ?? 'light') === "light" ? {
    listItem: styles.listItemLight,
    listItemTitle: styles.listItemTitleLight,
    listItemExplanation: styles.listItemExplanationLight
  } : {
    listItem: styles.listItemDark,
    listItemTitle: styles.listItemTitleDark,
    listItemExplanation: styles.listItemExplanationDark
  };

  return (<View style={styles.touchableArea}>
      <View style={[styles.listItem, customStyles.listItem]}>
        {props.icon ? <Icon name={props.icon} size={16} color={baseColors.white} style={[styles.listItemIcon, { backgroundColor: props.iconColor }]} iconStyle={styles.listItemIconImage} /> : <></>}
        <View style={styles.listItemInfo}>
          <Text style={[styles.listItemTitle, customStyles.listItemTitle]}>{props.title}</Text>
          {props.explanation ? <Text style={[styles.listItemExplanation, customStyles.listItemExplanation]}>{props.explanation}</Text> : <></>}
        </View>
        <View style={styles.listItemSwitch}>
          <Switch trackColor={{ true: props.iconColor }} value={props.value} onValueChange={props.onValueChange} />
        </View>
    </View>
  </View>);
}

function ListItemNested(props) {
  let customStyles = (props.colorMode ?? 'light') === "light" ? {
    underlayColor: baseColors.black + "10",
    listItem: styles.listItemLight,
    listItemTitle: styles.listItemTitleLight,
    listItemExplanation: styles.listItemExplanationLight
  } : {
    underlayColor: "#00000045",
    listItem: styles.listItemDark,
    listItemTitle: styles.listItemTitleDark,
    listItemExplanation: styles.listItemExplanationDark
  };

  return (<TouchableHighlight 
    style={styles.touchableArea}
    underlayColor={customStyles.underlayColor}
    onPress={props.onPress}
    disabled={props.disabled}>
      <View style={[styles.listItem, customStyles.listItem]}>
        {props.icon ? <Icon name={props.icon} size={16} color={baseColors.white} style={[styles.listItemIcon, { backgroundColor: props.iconColor }]} iconStyle={styles.listItemIconImage} /> : <></>}
        <View style={styles.listItemInfo}>
          <Text style={[styles.listItemTitle, customStyles.listItemTitle]}>{props.title}</Text>
          {props.explanation ? <Text style={[styles.listItemExplanation, customStyles.listItemExplanation]}>{props.explanation}</Text> : <></>}
        </View>
        <View style={styles.listItemArrow}>
          <Icon name="navigate-next" size={32} color={baseColors.black + "40"} iconStyle={styles.listItemIconImage}/>
        </View>
    </View>
  </TouchableHighlight>);
}

function SettingsMain(props) {
  let { navigation, route } = props;
  let lock = useRef(false);
  let [appState, setAppState] = useAppState();
  let [darkMode, setDarkMode] = useState(false);
  let [dynamicPalette, setDynamicPalette] = props.paletteState;

  useFocusEffect(
    useCallback(() => {
      (async function() {
        lock.current = true;
        let localeValue = await AsyncStorage.getItem("settings.locale");
        let colorModeValue = await AsyncStorage.getItem("settings.colorMode");
        let buyAuthValue = await AsyncStorage.getItem("settings.buyAuth");

        setAppState({ locale: localeValue ?? "system", colorMode: colorModeValue ?? "light", buyAuth: buyAuthValue ?? "none" });
        setDarkMode(colorModeValue === "dark");
        lock.current = false;
      })();
    }, [])
  );

  useEffect(() => {
    if(lock.current) return;
    let colorMode = darkMode ? "dark" : "light";
    let newLanguage = route.params?.newLanguage ?? appState.locale;
    let newBuyAuth = route.params?.newBuyAuth ?? appState.buyAuth;

    AsyncStorage.multiSet([
      ["settings.colorMode", colorMode],
      ["settings.buyAuth", newBuyAuth],
      ["settings.locale", newLanguage]
    ]).then(() => {
      setAppState({ ...appState, colorMode, locale: newLanguage, buyAuth: newBuyAuth });
      Palette.setPalette(colorMode);
      setDynamicPalette({
        content: {
          backgroundColor: Palette.mainBackground
        }
      });
    });
  }, [route.params?.newLanguage, route.params?.newBuyAuth, darkMode]);

  return (
    <View style={{ flex: 1 }}>
      <Title style={{ color: Palette.text }}>{i18n.t("settings.title")}</Title>
      <ScrollView style={styles.list}>
        <ListItemSwitch colorMode={appState.colorMode} value={darkMode} onValueChange={setDarkMode} title={i18n.t("settings.darkmode.title")} explanation={i18n.t("settings.darkmode.explanation." + (darkMode ? "off" : "on"))} icon="lightbulb" iconColor="rgb(94, 92, 222)" />
        <ListItemNested colorMode={appState.colorMode} title={i18n.t("settings.locale.title")} explanation={i18n.t(`settings.locale.${appState.locale}`)} icon="translate" iconColor={baseColors.blue} onPress={() => props.navigation.push('LanguageSelection')} />
        <ListItemNested colorMode={appState.colorMode} title={i18n.t("settings.buyauth.title")} explanation={i18n.t(`settings.buyauth.${appState.buyAuth}`)} icon="fingerprint" iconColor={baseColors.red} onPress={() => props.navigation.push('BuyAuthSelection')} />
      </ScrollView>
    </View>
  );
}

export default function Settings() {
  let [appState, _] = useAppState();
  let [dynamicPalette, setDynamicPalette] = useState(StyleSheet.create({
    content: {
      backgroundColor: Palette.mainBackground
    }
  }));

  useFocusEffect(
    useCallback(() => {
      setDynamicPalette({
        content: {
          backgroundColor: Palette.mainBackground
        }
      });
    }, [])
  );

  return (<SettingsStack.Navigator screenOptions={{
    contentStyle: dynamicPalette.content,
    headerStyle: {
      backgroundColor: Palette.mainBackground
    },
    headerTitleStyle: {
      color: Palette.text
    },
    fullScreenGestureEnabled: true
  }}>
    <SettingsStack.Screen name="SettingsScreen" options={{ headerShown: false }}>
      {(props) => <SettingsMain {...props} paletteState={[dynamicPalette, setDynamicPalette]} />}
    </SettingsStack.Screen>
    <SettingsStack.Screen name="LanguageSelection" options={{
      title: i18n.t("settings.locale.title")
    }}>
      {
        (props) => <SettingsDetailed {...props}
          entries={[
            "settings.locale.system",
            "settings.locale.it",
            "settings.locale.en",
            "settings.locale.nb"
          ]} isEntryChecked={
            (entryId) => entryId === `settings.locale.${appState.locale}`
          } onEntryClick={
            (viewProps, value) => {
              let valuePath = value.split('.');
              let localeIdentifierPosition = valuePath.indexOf('locale');
              let localePosition = localeIdentifierPosition + 1;
              let locale = valuePath[localePosition];
              viewProps.navigation.navigate("SettingsScreen", { newLanguage: locale })
            }
          } />
        }
    </SettingsStack.Screen>
    <SettingsStack.Screen name="BuyAuthSelection" options={{
      title: i18n.t("settings.buyauth.title")
    }}>
      {
        (props) => <SettingsDetailed {...props}
          entries={[
            "settings.buyauth.none",
            "settings.buyauth.touchid",
            "settings.buyauth.faceid"
          ]} isEntryChecked={
            (entryId) => entryId === `settings.buyauth.${appState.buyAuth}`
          } onEntryClick={
            (viewProps, value) => {
              let valuePath = value.split('.');
              let buyAuthIdentifierPosition = valuePath.indexOf('buyauth');
              let buyAuthPosition = buyAuthIdentifierPosition + 1;
              let buyAuth = valuePath[buyAuthPosition];
              rnBiometrics.isSensorAvailable().then(
                ({ biometryType }) => {
                  let allowed = (buyAuth === "touchid" && biometryType === BiometryTypes.TouchID)
                              || (buyAuth === "faceid" && biometryType === BiometryTypes.FaceID)
                              || (buyAuth === "none");
                  
                  if(allowed)
                    viewProps.navigation.navigate("SettingsScreen", { newBuyAuth: buyAuth })
                  else {
                    Alert.alert("Invalid choice", "Your device does not support this technology.", [
                      { text: "Ok", onPress: () => {
                        viewProps.navigation.goBack();
                      } }
                    ]);
                  }
                }
              );
            }
          } />
        }
    </SettingsStack.Screen>
  </SettingsStack.Navigator>)
}

const styles = StyleSheet.create({
  list: {
    flex: 1
  },
  touchableArea: {
    paddingLeft: 16
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: baseColors.black + "40",
    paddingRight: 8,
    paddingVertical: 16
  },
  listItemLight: {
    borderBottomColor: baseColors.black + "40"
  },
  listItemDark: {
    borderBottomColor: "#00000045"
  },
  listItemInfo: {
    flex: 1
  },
  listItemIcon: {
    borderRadius: 4,
    padding: 8,
    marginRight: 12,
    overflow: "hidden"
  },
  listItemIconImage: {
    padding: 0,
    margin: 0
  },
  listItemTitle: {
    fontWeight: "bold"
  },
  listItemExplanation: {
    marginTop: 0,
    fontSize: 12,
    color: baseColors.black + "40"
  },
  listItemTitleLight: { color: baseColors.black },
  listItemExplanationLight: { color: baseColors.black },
  listItemTitleDark: { color: baseColors.white },
  listItemExplanationDark: { color: baseColors.white },
  listItemArrow: {},
  listItemSwitch: {
    paddingRight: 8
  }
});