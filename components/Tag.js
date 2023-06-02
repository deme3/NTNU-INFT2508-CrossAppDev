import React, { cloneElement } from "react";
import { View, StyleSheet, Text, Pressable, TextComponent, TextBase } from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { baseColors } from "../palette";

export default function Tag(props) {
  let mainComponent = (
    <View style={[styles.tag, props.style]}>
      {props.icon ? <Icon name={props.icon} size={24} color={baseColors.white} style={{ marginRight: 4 }} /> : <></>}
      <Text style={[styles.tagText, props.textStyle]}>{props.children}</Text>
    </View>
  );

  if(props.onPress)
    return <Pressable onPress={props.onPress}>
      {mainComponent}
    </Pressable>;
  else
    return mainComponent;
}

const styles = StyleSheet.create({
  tag: {
    padding: 8,
    marginRight: 12,
    marginTop: 12,
    backgroundColor: baseColors.blue,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center"
  },
  tagText: {
    fontWeight: "bold",
    color: baseColors.white
  }
});