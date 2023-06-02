import { useFocusEffect } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useCallback, useState, useEffect, useMemo, Fragment } from "react";
import { StyleSheet, ScrollView, Text, TextInput, View, RefreshControl } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppState } from "../AppState";
import FilterBar from "../components/FilterBar";
import ProductCard from "../components/ProductCard";
import i18n from "../localisation/localisation";
import Palette from "../palette";
import ProductDetails from "./ProductDetails";
import SettingsDetailed from "./SettingsDetailed";
import Globals from "../Globals";

const Stack = createNativeStackNavigator();

const HomePage = (props) => {
  let [appState, _] = useAppState();
  let [refreshIndicatorColor, setRefreshIndicatorColor] = useState(Palette.text);
  let [search, setSearch] = useState("");
  let [isLoading, setIsLoading] = useState(false);
  let [deals, setDeals] = useState([]);
  let [myFavs, setMyFavs] = useState([]);
  let filteredDeals = useMemo(() => {
    if(search === "" && props.categoriesFiltered.length === 0) return deals;
    let doesMatch = (what) => what.toLowerCase().includes(search.toLowerCase());

    return deals
      .filter(x => props.categoriesFiltered.length === 0 || props.categoriesFiltered.includes(x.category))
      .filter(x => doesMatch(x.title) || doesMatch(x.shortdesc ?? ""));
  }, [deals, props.categoriesFiltered, search]);

  async function loadDeals() {
    let deals = await fetch(`http://${Globals.serverAddress}:${Globals.serverPort}/deals`, { method: "GET" });
    setDeals(await deals.json());
  }

  async function loadFavourites() {
    let favs = await fetch(`http://${Globals.serverAddress}:${Globals.serverPort}/favs`, { method: "GET" });
    favs = await favs.json();

    setMyFavs(
      favs.map(x => x.id)
    );
  }

  useFocusEffect(useCallback(() => {
    setRefreshIndicatorColor(Palette.text);
    onRefresh();
  }, [appState]));

  const onRefresh = useCallback(() => {
    setIsLoading(true);
    loadFavourites().then(loadDeals).then(() => setIsLoading(false));
  }, []);

  return (<View style={{ flex: 1 }}>
    <FilterBar state={[search, setSearch]} navigation={props.navigation} />
    <ScrollView
      style={{ flex: 1, paddingHorizontal: 16 }}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={refreshIndicatorColor} colors={[refreshIndicatorColor]} />
    }>
    {
      (() => {
        let counter = 0;
        let pressFactory = (deal) => () => props.navigation.navigate("ProductDetails", { ...deal });
        return filteredDeals.map((deal, index) => {
          // Counter will rotate our card types
          // At 7 it will rotate back to big container
          if(counter >= 7) counter = 0;
          
          // If we're filtering by search terms,
          // return only "small" card types
          if(search !== "") counter = 5;
          
          let propsFactory = (deal) => {
            let isFavourite = myFavs.includes(deal.id);
            return {
              key: `deal-${deal.id}`,
              id: deal.id,
              onPress: pressFactory({ favourite: isFavourite, ...deal }),
              title: deal.title,
              description: deal.shortdesc,
              price: deal.price,
              category: deal.category,
              favourite: isFavourite,
              website: deal.website,
              phone: deal.phone,
              image: { uri: `http://${Globals.serverAddress}:${Globals.serverPort}/img/${deal.id}_1.jpg` },
              type: (
                counter == 0 ? "big"
                : (counter >= 1 && counter <= 4) ? "twin"
                : "small"
              )
            }
          };

          let retval = <ProductCard {...propsFactory(deal)} />
          if(counter === 1 || counter === 3) {
            retval = <View key={`twins-${index}-${index + 1}`} style={{ flexDirection: "row" }}>
              <ProductCard {...propsFactory(deal)} />
              {deals.length > index + 1 ? <ProductCard {...propsFactory(deals[index + 1])} /> : null}
            </View>;
          } else if(counter === 2 || counter === 4) retval = null;

          counter++;
          return retval;
        })
      })()
    }
    </ScrollView>
  </View>);
};


export default function Home() {
  let [appState, _] = useAppState();
  let [dynamicPalette, setDynamicPalette] = useState(StyleSheet.create({
    content: {
      backgroundColor: Palette.mainBackground
    }
  }));
  let [categoriesFiltered, setCategoriesFiltered] = useState([]);
  let actualCategoriesFiltered = useMemo(() => {
    return categoriesFiltered.map((value) => {
      let valuePath = value.split('.');
      let categoryIdentifierPosition = valuePath.indexOf('categories');
      let categoryPosition = categoryIdentifierPosition + 1;
      let category = valuePath[categoryPosition];
      return category;
    })
  }, [categoriesFiltered]);

  useFocusEffect(
    useCallback(() => {
      setDynamicPalette({
        content: {
          backgroundColor: Palette.mainBackground
        }
      });
    }, [appState])
  );

  return (<Stack.Navigator initialRouteName='HomePage' screenOptions={{
    headerShown: false,
    contentStyle: dynamicPalette.content,
    headerStyle: {
      backgroundColor: Palette.mainBackground
    },
    headerTitleStyle: {
      color: Palette.text
    },
    fullScreenGestureEnabled: true
  }}>
    <Stack.Screen name="HomePage">
      {(props) => <HomePage {...props} categoriesFiltered={actualCategoriesFiltered} />}
    </Stack.Screen>
    <Stack.Screen name="ProductDetails" component={ProductDetails} options={({ route }) => ({ headerShown: true, title: route.params.title })} />
    <Stack.Screen name="CategorySelection" options={{
      title: i18n.t("home.categories.title"),
      headerShown: true
    }}>
      {
        (props) => <SettingsDetailed {...props}
          entries={[
            "home.categories.food",
            "home.categories.wellbeing",
          ]} isEntryChecked={
            (entryId) => categoriesFiltered.includes(entryId)
          } onEntryClick={
            (viewProps, value) => {
              if(categoriesFiltered.includes(value))
                setCategoriesFiltered(categoriesFiltered.filter(x => x !== value));
              else
                setCategoriesFiltered(categoriesFiltered.concat([value]));
            }
          } />
        }
    </Stack.Screen>
  </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  
});