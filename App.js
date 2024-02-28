import React, { useEffect, useState, useRef } from "react";
import { Image } from "react-native";
import AppLoading from "expo-app-loading";
import * as Font from "expo-font";
import { Asset } from "expo-asset";
import { Block, GalioProvider } from "galio-framework";
import { NavigationContainer } from "@react-navigation/native";
import * as Notifications from "expo-notifications"
import * as Device from 'expo-device'
import Screens from "./navigation/Screens";
import { Images, articles, argonTheme } from "./constants";
import axios from "axios";
import { MATCHES_URL } from "./utils/utils.";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Before rendering any navigation stack
import { enableScreens } from "react-native-screens";
enableScreens();

// cache app images
const assetImages = [
  Images.Onboarding,
  Images.LogoOnboarding,
  Images.Logo,
  Images.Pro,
  Images.ArgonLogo,
  Images.iOSLogo,
  Images.androidLogo,
];

// cache product images
articles.map((article) => assetImages.push(article.image));

function cacheImages(images) {
  return images.map((image) => {
    if (typeof image === "string") {
      return Image.prefetch(image);
    } else {
      return Asset.fromModule(image).downloadAsync();
    }
  });
}

// notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// register and get token for notifications
async function registerForPushNotificationsAsync () {
  let token
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    if (token) {
      await AsyncStorage.setItem("@pushToken", token)
    } else {
      console.log('couldnt get token from expo')
    }
  } else {
    console.error('Debe de ser en un dispositivo fisico')
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

export default function App() {
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);
  const [fontLoaded, setFontLoaded] = useState(false);
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  state = {
    isLoadingComplete: false,
    fontLoaded: false,
  };

  const loadFonts = () => {
    Font.loadAsync({
      "open-sans-regular": require("./assets/font/OpenSans-Regular.ttf"),
      "open-sans-light": require("./assets/font/OpenSans-Light.ttf"),
      "open-sans-bold": require("./assets/font/OpenSans-Bold.ttf"),
    });

    setFontLoaded(true);
  };

  const logLocalStorage = async () => { 
    let localKeys = await AsyncStorage.getAllKeys()
    console.log(localKeys)
  }

  const checkForOudtatedMatches = async () => {
    await axios
      .put(`${MATCHES_URL}/check/data`)
      .then(() => console.log("all matches updated"))
      .catch((e) => console.log(`error loading matches ${e}`));
  };

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => console.log('token -->', token));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  useEffect(() => {
    checkForOudtatedMatches();
    loadFonts();
    logLocalStorage()
  }, []);

  const _loadResourcesAsync = async () => {
    return Promise.all([...cacheImages(assetImages)]);
  };

  const _handleLoadingError = (error) => {
    // In this case, you might want to report the error to your error
    // reporting service, for example Sentry
    console.warn(error);
  };

  const _handleFinishLoading = () => {
    if (fontLoaded) {
      setIsLoadingComplete(true);
    }
  };

  if (!isLoadingComplete) {
    return (
      <AppLoading
        startAsync={_loadResourcesAsync}
        onError={_handleLoadingError}
        onFinish={_handleFinishLoading}
      />
    );
  } else {
    return (
      <NavigationContainer>
        <GalioProvider theme={argonTheme}>
          <Block flex>
            <Screens />
          </Block>
        </GalioProvider>
      </NavigationContainer>
    );
  }
}
