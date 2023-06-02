import { View, Image, TextInput, StyleSheet, ImageBackground } from "react-native";
import { useAppState } from "../AppState";
import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import Palette, { baseColors } from "../palette";
import Icon from 'react-native-vector-icons/MaterialIcons';
import i18n from "../localisation/localisation";

export default function FilterBar(props) {
  let [appState, _] = useAppState();
  let [dynamicPalette, setDynamicPalette] = useState(StyleSheet.create({
    searchInput: {
      backgroundColor: Palette.searchInputBackground
    },
    searchInputText: {
      color: Palette.searchInputForeground
    },
    placeholder: {
      color: Palette.placeholder
    }
  }));
  
  useFocusEffect(
    useCallback(() => {
      Palette.setPalette(appState.colorMode);
      setDynamicPalette(StyleSheet.create({
        searchInput: {
          backgroundColor: Palette.searchInputBackground
        },
        searchInputText: {
          color: Palette.searchInputForeground
        },
        placeholder: {
          color: Palette.placeholder
        }
      }));
    }, [appState])
  );

  return (
    <View style={styles.filterBarContainer}>
      <View style={[styles.searchInputContainer, dynamicPalette.searchInput]}>
        <Icon name="search" size={24} color={baseColors.gray} />
        <TextInput
          style={[styles.searchInput, dynamicPalette.searchInputText]}
          placeholder={i18n.t("home.search.placeholder")}
          placeholderTextColor={dynamicPalette.placeholder.color}
          value={props.state[0]}
          onChangeText={props.state[1]}
          selectTextOnFocus={true}
        />
      </View>
      <Icon.Button name="menu" size={24}
        backgroundColor="transparent"
        underlayColor="transparent"
        activeOpacity={0.3}
        color={Palette.text}
        style={{ padding: 8 }}
        iconStyle={{ marginRight: 0 }} onPress={() => { props.navigation.navigate("CategorySelection") }} />
    </View>
  )
}

const styles = StyleSheet.create({
  filterBarContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center" 
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingLeft: 12,
    marginRight: 8,
  },
  searchInput: {
    padding: 12,
    flex: 1
  }
});