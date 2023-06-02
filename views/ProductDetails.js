import { NavigationContainer, useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useState, useRef } from "react";
import { View, ScrollView, Text, Image, StyleSheet, Pressable, Linking, Alert } from "react-native";
import { useAppState } from "../AppState";
import { PriceTag } from "../components/ProductCard";
import Tag from "../components/Tag";
import Palette, { baseColors } from "../palette";
import i18n from "../localisation/localisation";
import Globals from "../Globals";
import { FavIcon } from "../components/ProductCard";
import Icon from "react-native-vector-icons/MaterialIcons";
import {PhoneNumberFormat, PhoneNumberUtil} from "google-libphonenumber";
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics'

const rnBiometrics = new ReactNativeBiometrics()
const PhoneFormatter = PhoneNumberUtil.getInstance();

const ImageGallery = (props) => {
  return <ScrollView horizontal={true} alwaysBounceHorizontal={false} style={styles.thumbnailsList}>
  {props.images.map((img) =>
      <Pressable key={img} onPress={() => props.onImagePress(img)}><Image source={{ uri: img }} style={styles.thumbnail} /></Pressable>
    )
  }
</ScrollView>;
};

export default function ProductDetails({ navigation, route, ...props }) {
  let [appState, _] = useAppState();
  let [imagePopupShown, setImagePopupShown] = useState(false);
  let imagePopup = useRef(null);
  let [imagePopupSource, setImagePopupSource] = useState("");

  let [isFavourite, setIsFavourite] = useState(props.favourite);
  let [disableFavourite, setDisableFavourite] = useState(false);
  let [dynamicPalette, setDynamicPalette] = useState(StyleSheet.create({
    text: {
      color: Palette.text
    }
  }));

  useEffect(() => {
    setIsFavourite(route.params.favourite);
  }, []);

  async function favItem() {
    if(isFavourite) {
      unfavItem();
      return;
    }

    setDisableFavourite(true);
    await fetch(`http://${Globals.serverAddress}:${Globals.serverPort}/favs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: props.id
      })
    });

    // if requests fail, it means it's already favourite
    // if succeeds, it'll now be favourite
    // both cases =>
    setIsFavourite(true);
    setDisableFavourite(false);

    if(typeof props.onAddFavourite === "function")
      props.onAddFavourite.bind(this)();
  }

  async function unfavItem() {
    if(!isFavourite) {
      favItem();
      return;
    }

    setDisableFavourite(true);
    await fetch(`http://${Globals.serverAddress}:${Globals.serverPort}/favs/${route.params.id}`, {
      method: "DELETE"
    });

    // if requests fail, it means it's not favourite
    // if succeeds, it'll now be not favourite
    // both cases =>
    setIsFavourite(false);
    setDisableFavourite(false);

    if(typeof props.onDelFavourite === "function")
      props.onDelFavourite.bind(this)();
  }

  function showImage(uri) {
    setImagePopupShown(true);
    setImagePopupSource({ uri });
  }

  useFocusEffect(
    useCallback(() => {
      setDynamicPalette(StyleSheet.create({
        text: {
          color: Palette.text
        }
      }))
    }
  , []));

  return (<View style={{ flex: 1 }}>
    <View ref={imagePopup} style={{ position: "absolute", display: (imagePopupShown ? "flex" : "none"), backgroundColor: "#000000aa", zIndex: 1, top: 0, bottom: 0, left: 0, right: 0 }}>
      <View style={{ position: "absolute", right: 0, zIndex: 2 }}>
        <Icon.Button name="close" size={48}
        backgroundColor="transparent"
        underlayColor="transparent"
        activeOpacity={0.3}
        color={baseColors.white}
        style={{ padding: 8 }}
        iconStyle={{ marginRight: 0 }}
        onPress={ () => setImagePopupShown(false) }
        />
      </View>
      <Image source={imagePopupSource} style={styles.imagePopupSource} resizeMode="contain" />
    </View>
    <ScrollView style={{ flex: 1, marginBottom: 48 }} alwaysBounceVertical={false}>
      <View style={styles.productImage}>
        <Pressable onPress={() => showImage(`http://${Globals.serverAddress}:${Globals.serverPort}/img/${route.params.id}_1.jpg`)}>
          <Image source={{ uri: `http://${Globals.serverAddress}:${Globals.serverPort}/img/${route.params.id}_1.jpg` }} resizeMode="contain" style={{ width: "100%", height: "100%" }} />
        </Pressable>
        <FavIcon onPress={favItem} on={isFavourite} disabled={disableFavourite} />
      </View>
      <ImageGallery onImagePress={showImage} images={Array(route.params.images ?? 1).fill(null).map((_, idx) => `http://${Globals.serverAddress}:${Globals.serverPort}/img/${route.params.id}_${idx+1}.jpg`)} />
      <View style={styles.infoArea}>
        <Text style={[dynamicPalette.text, styles.title]}>{route.params.title}</Text>
        <Text style={[dynamicPalette.text, styles.description]}>{route.params.description ?? route.params.shortdesc}</Text>
        
        <View style={{ flexDirection: "row", alignItems: "stretch", flexWrap: "wrap" }}>
          <PriceTag price={route.params.price} style={{ marginRight: 12, marginLeft: 0 }} icon />
          <Tag icon="map-marker-outline" onPress={() => {
            navigation.navigate("MapView", {
              screen: "MapPage",
              params: {
                goTo: {id: route.params.id, ...route.params.location}
              }
            });
          }}>{i18n.t("details.gotomap")}</Tag>
          {route.params.phone && <Tag icon="phone" onPress={() => {
            Linking.openURL(`tel:${route.params.phone}`);
          }}>{PhoneFormatter.format(PhoneFormatter.parse(route.params.phone), PhoneNumberFormat.INTERNATIONAL)}</Tag>}
          {route.params.website && <Tag icon="link" onPress={() => {
            Linking.openURL(route.params.website);
          }}>{i18n.t("details.website")}</Tag>}
        </View>
      </View>
    </ScrollView>
    <View style={styles.buyButtonContainer}>
      <Tag style={styles.buyButton} icon="cart" onPress={() => {
        if(appState.buyAuth !== "none") {
          rnBiometrics.simplePrompt({
            promptMessage: i18n.t(`details.buy.${appState.buyAuth}prompt`)
          }).then(({ success }) => {
            if(success) {
              Alert.alert(i18n.t("details.buy.success.title"), i18n.t("details.buy.success.message"), [
                { text: "Confirm", onPress: () => navigation.goBack() }
              ]);
            } else {
              Alert.alert(i18n.t("details.buy.fail.title"), i18n.t("details.buy.fail.message"), [
                { text: "Confirm" }
              ]);
            }
          }).catch(() => {
            Alert.alert(i18n.t("details.buy.fail.title"), i18n.t("details.buy.fail.message"), [
              { text: "Confirm" }
            ]);
          })
        } else {
          Alert.alert(i18n.t("details.buy.success.title"), i18n.t("details.buy.success.message"), [
            { text: "Confirm", onPress: () => navigation.goBack() }
          ]);
        }
      }}>{i18n.t("details.buy.text")}</Tag>
    </View>
  </View>);
}

const styles = StyleSheet.create({
  productImage: {
    padding: 16,
    backgroundColor: "#00000015",
    maxHeight: 300
  },
  infoArea: {
    padding: 16
  },
  title: {
    fontSize: 18,
    fontWeight: "bold"
  },
  description: {
    textAlign: "justify"
  },
  thumbnailsList: {
    backgroundColor: "#00000015",
    paddingHorizontal: 16,
    paddingBottom: 16,
    flex: 1,
  },
  thumbnail: {
    width: 64,
    height: 64,
    marginRight: 16
  },
  imagePopupSource: {
    flex: 1,
    width: "auto",
    height: "auto"
  },
  buyButtonContainer: {
    position: "absolute",
    bottom: 8,
    left: 16,
    right: 16
  },
  buyButton: {
    flex: 1,
    alignSelf: "stretch",
    justifyContent: "center",
    backgroundColor: baseColors.aqua,
    marginRight: 0
  }
});