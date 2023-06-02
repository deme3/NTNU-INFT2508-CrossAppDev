import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { View, ScrollView, StyleSheet, RefreshControl } from "react-native";
import Globals from "../Globals";
import ProductCard from "../components/ProductCard";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProductDetails from "./ProductDetails";
import { useAppState } from "../AppState";
import Palette from "../palette";
import i18n from "../localisation/localisation";
import Title from "../components/Title";

const MyFavsStack = createNativeStackNavigator();

function MyFavouritesPage(props) {
  const [appState, _] = useAppState();
  let [myFavs, setMyFavs] = useState([]);
  let [refreshIndicatorColor, setRefreshIndicatorColor] = useState(Palette.text);
  let [isLoading, setIsLoading] = useState(false);

  const onRefresh = useCallback(() => {
    setIsLoading(true);
    loadFavourites().then(() => setIsLoading(false));
  }, []);

  async function expandFavorites(favs) {
    if(favs.length === 0) return [];
    let searchParams = favs.map(x => `id=${x.id}`).join("&");

    let expandedFavorites = await fetch(
      `http://${Globals.serverAddress}:${Globals.serverPort}/deals?${searchParams}`,
      { method: "GET" }
    );
    return await expandedFavorites.json();
  }

  async function loadFavourites() {
    let favs = await fetch(`http://${Globals.serverAddress}:${Globals.serverPort}/favs`, { method: "GET" });
    favs = await favs.json();

    setMyFavs(await expandFavorites(favs));
  }

  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [])
  );

  useFocusEffect(useCallback(() => {
    setRefreshIndicatorColor(Palette.text);
  }, [appState]));

  return (
  <View style={{ flex: 1 }}>
    <Title style={{ color: Palette.text }}>{i18n.t("favourites.title")}</Title>
    <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={refreshIndicatorColor} colors={[refreshIndicatorColor]} />
    }>
      {myFavs.map(fav => {
        let pressFactory = (deal) =>
          () =>
            props.navigation.navigate("ProductDetails", { ...deal });

        let productProps = {
          key: `deal-${fav.id}`,
          id: fav.id,
          onPress: pressFactory({ favourite: true, ...fav }),
          title: fav.title,
          description: fav.shortdesc,
          price: fav.price,
          category: fav.category,
          favourite: true,
          website: fav.website,
          phone: fav.phone,
          image: { uri: `http://${Globals.serverAddress}:${Globals.serverPort}/img/${fav.id}_1.jpg` },
          type: "small"
        };

        return <ProductCard {...productProps} />
      })}
    </ScrollView>
  </View>);
}

export default function MyFavourites(props) {
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
    }, [appState])
  );

  return (<MyFavsStack.Navigator initialRouteName='MapPage' screenOptions={{
    contentStyle: dynamicPalette.content,
    headerStyle: {
      backgroundColor: Palette.mainBackground
    },
    headerTitleStyle: {
      color: Palette.text
    },
    fullScreenGestureEnabled: true
  }}>
    <MyFavsStack.Screen name="MapPage" options={{ headerShown: false, title: i18n.t("favourites.title") }}>
        {(nProps) => <MyFavouritesPage {...nProps} />}
    </MyFavsStack.Screen>
    <MyFavsStack.Screen name="ProductDetails" component={ProductDetails} options={({ route }) => ({ headerShown: true, title: route.params.title })} />
  </MyFavsStack.Navigator>);
}