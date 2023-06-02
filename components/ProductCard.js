import { View, Text, StyleSheet, Image, ImageBackground, Pressable } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import CommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Palette, { baseColors } from "../palette";
import { useAppState } from "../AppState";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useState } from "react";
import Globals from "../Globals";

const NumbersFmt = new Intl.NumberFormat("nb-NO");
export const FavIcon = (props) => {
  return <Pressable disabled={props.disabled} onPress={props.onPress} style={styles.favIcon}>
    <Icon name={props.on ? "favorite" : "favorite-outline"} size={32} color={props.on ? baseColors.red : baseColors.white} />
  </Pressable>;
};

const PriceOverlay = (props) => {
  return <View style={styles.priceOverlay}>
    <Text style={styles.priceOverlayText}>{NumbersFmt.format(props.price)} kr</Text>
  </View>;
};

export const PriceTag = (props) => {
  return <View style={[styles.priceTag, props.style]}>
    {props.icon ? <CommunityIcon name="tag-outline" size={24} color={baseColors.white} style={{ marginRight: 4 }} /> : <></>}
    <Text style={styles.priceOverlayText}>{NumbersFmt.format(props.price)} kr</Text>
  </View>
}

export default function ProductCard(props) {
  let [appState, _] = useAppState();
  let [isFavourite, setIsFavourite] = useState(props.favourite);
  let [disableFavourite, setDisableFavourite] = useState(false);
  let [dynamicPalette, setDynamicPalette] = useState(StyleSheet.create({
    card: {
      backgroundColor: Palette.cardBackground
    },
    text: {
      color: Palette.text
    },
    contrastText: {
      color: Palette.contrastText
    },
  }));

  useFocusEffect(
    useCallback(() => {
      Palette.setPalette(appState.colorMode);
      setDynamicPalette({
        card: {
          backgroundColor: Palette.cardBackground
        },
        text: {
          color: Palette.text
        },
        contrastText: {
          color: Palette.contrastText
        },
      });
    }, [appState])
  );

  useEffect(() => {
    setIsFavourite(props.favourite);
  }, [props.favourite]);

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
    await fetch(`http://${Globals.serverAddress}:${Globals.serverPort}/favs/${props.id}`, {
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

  switch(props.type) {
    case "twin":
      return (<Pressable onPress={props.onPress} style={[styles.card, styles.twinCard, dynamicPalette.card]}>
      <View>
        <ImageBackground source={props.image} style={styles.smallCardImage} imageStyle={{ opacity: 0.5, borderRadius: 8 }}>
          <View style={[styles.cardImageContainer, {maxHeight: 150}]}>
            <FavIcon onPress={favItem} disabled={disableFavourite} on={isFavourite} />
            <PriceOverlay price={props.price} />
          </View>
          <View style={styles.cardDataContainer}>
            <View style={styles.textLine}>
              <Text style={[styles.cardTitle, styles.twinCardTitle, dynamicPalette.contrastText]}>{props.title}</Text>
            </View>
          </View>
        </ImageBackground>
      </View>
      </Pressable>);
      break;

    case "small":
      return (<Pressable onPress={props.onPress} style={[styles.card]}>
        <View>
          <ImageBackground source={props.image} style={styles.smallCardImage} imageStyle={{ opacity: 0.5, borderRadius: 8 }}>
            <FavIcon onPress={favItem} disabled={disableFavourite} on={isFavourite} />
            <PriceTag price={props.price} />
            <View style={styles.cardDataContainer}>
              <View style={styles.textLine}>
                <Text style={[styles.cardTitle, styles.smallCardTitle, dynamicPalette.contrastText]}>{props.title}</Text>
              </View>
              <View style={styles.textLine}>
                <Text style={[styles.smallCardDescription, dynamicPalette.contrastText]}>{props.description}</Text>
              </View>
            </View>
          </ImageBackground>
        </View>
      </Pressable>);
      break;

    case "big":
    default:
      return (<Pressable onPress={props.onPress} style={[styles.card, dynamicPalette.card]}>
        <View >
          <View style={styles.cardImageContainer}>
            <Image source={props.image} style={styles.cardImage} resizeMode="cover" />
            <FavIcon onPress={favItem} disabled={disableFavourite} on={isFavourite} />
            <PriceOverlay price={props.price} />
          </View>
          <View style={styles.cardDataContainer}>
            <View style={styles.textLine}>
              <Text style={[styles.cardTitle, dynamicPalette.text]}>{props.title}</Text>
            </View>
            <View style={styles.textLine}>
              <Text style={[styles.cardDescription, dynamicPalette.text]}>{props.description}</Text>
            </View>
          </View>
        </View>
      </Pressable>);
      break;
  };
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowColor: baseColors.shadow,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: baseColors.shadow + "25"
  },
  twinCard: {
    width: "48%",
    marginRight: "4%",
    marginVertical: 8
  },
  cardImageContainer: {
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 100,
    maxHeight: 320,
    height: "auto",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  smallCardImage: {
    backgroundColor: baseColors.black,
    borderRadius: 8,
  },
  cardDataContainer: {
    flexGrow: 1,
    flexShrink: 0,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8,
  },
  twinCardTitle: {
    marginBottom: 0,
    fontSize: 12,
    shadowColor: baseColors.shadow,
    shadowOpacity: 1,
    shadowRadius: 6
  },
  smallCardTitle: {
    color: baseColors.white,
    shadowColor: baseColors.shadow,
    shadowOpacity: 0.6,
    shadowRadius: 10
  },
  cardDescription: {
    textAlign: "justify"
  },
  smallCardDescription: {
    color: "white",
    shadowColor: baseColors.shadow,
    shadowOpacity: 0.6,
    shadowRadius: 10
  },
  favIcon: {
    position: "absolute",
    top: 12,
    right: 12,
    shadowColor: baseColors.shadow,
    shadowRadius: 5,
    shadowOpacity: 0.6
  },
  priceOverlay: {
    padding: 8,
    backgroundColor: baseColors.red,
    top: 12,
    left: 12,
    position: "absolute"
  },
  priceOverlayText: {
    color: baseColors.white,
    fontWeight: "bold"
  },
  priceTag: {
    padding: 8,
    marginLeft: 12,
    marginTop: 12,
    backgroundColor: baseColors.red,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center"
  }
});