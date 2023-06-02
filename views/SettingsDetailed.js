import { useEffect, useState } from "react";
import { ScrollView, Text, View, StyleSheet, TouchableHighlight } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppState } from "../AppState";
import i18n from "../localisation/localisation";
import Palette, { baseColors } from "../palette";

function Entry(props) {
  let [appState, _] = useAppState();
  let [dynamicPalette, setDynamicPalette] = useState(StyleSheet.create({
    entryText: {
      color: Palette.text
    }
  }));

  useEffect(() => {
    Palette.setPalette(appState.colorMode);
    setDynamicPalette({
      entry: { borderBottomColor: Palette.listDivider },
      entryText: { color: Palette.text }
    });
  }, [appState]);

  return (<TouchableHighlight style={styles.entryHitbox} underlayColor={Palette.listUnderlay} onPress={() => props.onPress(props.id)}>
    <View style={[styles.entry, dynamicPalette.entry]}>
      <Text style={[styles.entryText, dynamicPalette.entryText]}>{i18n.t(props.id)}</Text>
      {props.checked ? <View style={styles.entryIconBox}><Icon name="check" size={24} color={dynamicPalette.entryText.color} /></View> : <View style={styles.entryIconBox}></View> }
    </View>
  </TouchableHighlight>
  )
}

export default function SettingsDetailed(props) {
  let entries = props.entries ?? [];
  
  return (<ScrollView>
    {entries.map(x => <Entry key={x} id={x} checked={props.isEntryChecked(x)} onPress={(value) => props.onEntryClick(props, value)} />)}
  </ScrollView>)
}

const styles = StyleSheet.create({
  entryHitbox: {
    paddingLeft: 16,
  },
  entry: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: baseColors.black + "40",
    paddingRight: 8,
    paddingVertical: 12
  },
  entryText: {
    flex: 1
  },
  entryIconBox: {
    marginRight: 12,
    height: 24
  }
});