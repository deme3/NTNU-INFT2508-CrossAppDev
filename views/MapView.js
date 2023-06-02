import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { View, Text, StyleSheet, ImageBackground, Image } from "react-native";
import FilterBar from "../components/FilterBar";
import SettingsDetailed from "./SettingsDetailed";
import i18n from "../localisation/localisation";
import Palette, { baseColors } from "../palette";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { useAppState } from "../AppState";
import MapView, { Marker, Callout } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ProductDetails from "./ProductDetails";
import Globals from "../Globals";

const MapNavigator = createNativeStackNavigator();
const MapPage = (props) => {
  const navigation = useNavigation();
  const route = useRoute();
  let [search, setSearch] = useState("");
  let [hasGoTo, setHasGoTo] = useState(typeof route.params?.goTo !== "undefined");
  let [deals, setDeals] = useState([]);
  let showMarkerRef = useCallback((marker) => {
    if(marker && marker.showCallout && mapRef && mapRef.current && mapRef.current.animateToRegion && hasGoTo) {
      
      mapRef.current.animateCamera({
        center: {
          latitude: route.params.goTo.latitude,
          longitude: route.params.goTo.longitude
        },
        zoom: 15,
        altitude: 1000
      }, 500);
      
      setTimeout(() => {
        setTimeout(() => marker.showCallout(), 300);
      }, 600);

      setHasGoTo(false);
    }
  });
  let mapRef = useRef(null);

  // Initial location is Trondheim, otherwise user location
  let [mapLocation, setMapLocation] = useState({
    latitude: 63.42,
    longitude: 10.39,
    latitudeDelta: 0.12,
    longitudeDelta: 0.12
  });
  let filteredDeals = useMemo(() => {
    if(search === "" && props.categoriesFiltered.length === 0) return deals;
    let doesMatch = (what) => what.toLowerCase().includes(search.toLowerCase());
    
    return deals
      .filter(x => props.categoriesFiltered.length === 0 || props.categoriesFiltered.includes(x.category))
      .filter(x => doesMatch(x.title) || doesMatch(x.shortdesc ?? ""))
  }, [deals, props.categoriesFiltered, search, route.params]);

  async function loadDeals() {
    let deals = await fetch(`http://${Globals.serverAddress}:${Globals.serverPort}/deals`, { method: "GET" });
    setDeals(await deals.json());
  }

  useFocusEffect(
    useCallback(() => {
      loadDeals();

      if(!route.params?.goTo)
        Geolocation.getCurrentPosition((info) => {
          setMapLocation({
            latitude: info.coords.latitude,
            longitude: info.coords.longitude,
            ...mapLocation
          });
        });
      else {
        
      }
    }, [route.params])
  );

  useEffect(() => {
    let unsubscribe = navigation.addListener("blur", () => {
      navigation.setParams({ goTo: undefined });
      setHasGoTo(true);
    });
    return unsubscribe;
  }, []);

  return (<View style={{ flex: 1 }}>
    <FilterBar state={[search, setSearch]} navigation={props.navigation} />
    <View style={{ flex: 1 }}>
      <MapView ref={mapRef} style={{ flex: 1 }} region={mapLocation} onRegionChangeComplete={setMapLocation} showsUserLocation={true}>
        {filteredDeals.map(x => 
          <Marker
            key={`marker-${x.id}`}
            coordinate={x.location ?? { latitude: 0, longitude: 0 }}
            title={x.title}
            description={x.description ?? x.shortdesc}
            ref={x.id === route.params?.goTo?.id ? showMarkerRef : undefined}
          >
            <Callout style={{ flexDirection: "row", alignItems: "center" }} onPress={() => {props.navigation.push("ProductDetails", {...x})}}>
              <View>
                <Text style={{ fontWeight: "bold" }}>{x.title}</Text>
                <Text style={{ color: baseColors.gray }}>{new Intl.NumberFormat("nb-NO").format(x.price) + " kr"}</Text>
              </View>
              <Icon name="navigate-next" size={32} color={baseColors.black + "40"} style={styles.calloutIconC} iconStyle={styles.calloutIcon} />
            </Callout>
          </Marker>
        )}
      </MapView>
    </View>
  </View>);
};

export default function MapPageView(props) {
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

  return (
    <MapNavigator.Navigator initialRouteName='HomePage' screenOptions={{
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
      <MapNavigator.Screen name="MapPage">
        {(nProps) => <MapPage {...nProps} categoriesFiltered={actualCategoriesFiltered} />}
      </MapNavigator.Screen>
      <MapNavigator.Screen name="ProductDetails" component={ProductDetails} options={({ route }) => ({ headerShown: true, title: route.params.title })} />
      <MapNavigator.Screen name="CategorySelection" options={{
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
      </MapNavigator.Screen>
    </MapNavigator.Navigator>
  );
}

const styles = StyleSheet.create({
  calloutIcon: {
    margin: 0,
    padding: 0
  },
  calloutIconC: {
    marginLeft: 12,
    marginRight: -8
  }
});