import React, { useMemo, useState } from "react";
import { Text, View, StyleSheet, SafeAreaView, Alert } from "react-native";
import { AssetsSelector } from "expo-images-picker";
import { Ionicons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MediaType } from "expo-media-library";

import { manipulateAsync, FlipType, SaveFormat } from 'expo-image-manipulator'
import { CommonActions } from "@react-navigation/native";

const ForceInset = {
  top: "never",
  bottom: "never",
};

// IOS users , make sure u can use the images uri to upload , if your getting invalid file path or u cant work with asset-library://
// Use = > getImageMetaData: true which will be little slower but give u also the absolute path of the Asset. just console loge the result to see the localUri

// See => https://docs.expo.dev/versions/latest/sdk/media-library/#assetinfo

export default function MediaMultipleSelection(props) {

  const {navigation, route} = props 

  const onSuccess = async (data) => {
    
    let localUris = [];
    for (let i = 0; i < data.length; i++) {
      const image = data[i];
      let manipResult = (
        await manipulateAsync(image.localUri, [], {
          compress: 0,
          format: SaveFormat.JPEG,
        })
      ).uri;
      localUris.push(manipResult);
    }

    if (route.params) {
      if (route.params.images) {
        navigation.navigate(route.params.component, {
          selectedImages: [...route.params.images, ...localUris],
          newImages: localUris,
        });
      }
    } else {
      console.log(route);
      navigation.navigate(route.params.component, {
        selectedImages: localUris,
        newImages: localUris,
      });
    }
  };

  const widgetErrors = useMemo(
    () => ({
      errorTextColor: "black",
      errorMessages: {
        hasErrorWithPermissions: "Permitir acceder a fotos.",
        hasErrorWithLoading: "Error cargando las imagenes.",
        hasErrorWithResizing: "Error cargando las imagenes.",
        hasNoAssets: "No se encontraron imagenes",
      },
    }),
    []
  );

  const widgetSettings = useMemo(
    () => ({
      getImageMetaData: true, // true might perform slower results but gives meta data and absolute path for ios users
      initialLoad: 100,
      assetsType: [MediaType.photo, MediaType.video],
      minSelection: 1,
      maxSelection: 5,
      portraitCols: 4,
      landscapeCols: 4,
      saveTo: "png"
    }),
    []
  );

  const widgetResize = useMemo(
    () => ({
      width: 50,
      compress: 0.7,
      base64: false,
      saveTo: "jpeg",
    }),
    []
  );

  const _textStyle = {
    color: "white",
    fontFamily: "open-sans-bold"
  };

  const _buttonStyle = {
    backgroundColor: "#40DF9F",
    borderRadius: 5,
  };

  const widgetNavigator = useMemo(
    () => ({
      Texts: {
        finish: "Terminar",
        back: "Volver",
        selected: "Seleccionadas",
      },
      midTextColor: "white",
      minSelection: 1,
      buttonTextStyle: _textStyle,
      buttonStyle: _buttonStyle,
      onBack: () => {
        const {navigation } = props;
        return (navigation.dispatch(CommonActions.goBack()));
      },
      onSuccess: (e) => onSuccess(e),
    }),
    []
  );

  const widgetStyles = useMemo(
    () => ({
      margin: 2,
      bgColor: "#22343C",
      spinnerColor: "blue",
      widgetWidth: 99,
      videoIcon: {
        Component: Ionicons,
        iconName: "ios-videocam",
        color: "tomato",
        size: 20,
      },
      selectedIcon: {
        Component: Ionicons,
        iconName: "ios-checkmark-circle-outline",
        color: "white",
        bg: "#0eb14970",
        size: 26,
      },
    }),
    []
  );

  return (
    <SafeAreaProvider style={{ marginTop: 100 }}>
      <SafeAreaView forceInset={ForceInset} style={styles.container}>
        <View style={styles.container}>
          <AssetsSelector
            Settings={widgetSettings}
            Errors={widgetErrors}
            Styles={widgetStyles}
            Navigator={widgetNavigator}
            CustomNavigator={{
              // optional
              props: {
                backFunction: false,
              },
            }}
            //Resize={widgetResize}
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
