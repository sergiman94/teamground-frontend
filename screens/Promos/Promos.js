import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Dimensions,
  Image,
  FlatList,
  TouchableWithoutFeedback,
} from "react-native";
import { Block, Text, theme } from "galio-framework";
import FloatingButton from "../../components/FloatingButton";
import { FloatingAction } from "react-native-floating-action";
// butoane text mai gros ca la register screen
import { Card, Select, Button } from "../../components/";
import { argonTheme } from "../../constants/";
import { cart } from "../../constants";
import axios from "axios";
import { BOOKINGS_URL, GET_ACTIVE_BOOKINGS_BY_FIELD_ID, GET_ACTIVE_BOOKINGS_BY_USER_ID, PROMOS_URL } from "../../utils/utils.";

import SnackBar from 'react-native-snackbar-component'
import * as Progress from 'react-native-progress';

import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get("screen");

export default function Promos(props) {

  const actions = [
    {
      text: "Crear Promo",
      icon: require("../../assets/imgs/icons/poster_icon.png"),
      name: "create_promo",
      position: 1,
    },
  ]

  const [fieldPromos, setFieldPromos] = useState([])
  const [cart, setCart] = useState([])
  const [role, setRole] = useState("")
  const [progressBar, setProgressbar] = useState(false)
  const [showSnackbar, setShowSnackbar] = useState(false)
  const [snackbarColor, setSnackbarColor] = useState("#93C46F")
  const [snackbarMessage, setSnackbarMessage] = useState("this is a test message")

  const loadData = async () => {
    let fieldID = await AsyncStorage.getItem('@field_id')
    let data = await axios.get(`${PROMOS_URL}`).then(response => response.data.data)
    setFieldPromos(data)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleFloatingAction = async (name) => {
    if (name === "create_promo") {
      // navigate to create match UI
      const { navigation, route } = props;
      navigation.navigate("CreatePromo");
    } 
  };

  const handleBookingDescription = (item) => {
    const { navigation } = props;
    navigation.navigate("EditPromo", { promo: item });
  };

  const renderBookings = ({ item }) => {

    return (
      <Block>
        <Block card shadow style={styles.product}>
          <Block flex row>
            <TouchableWithoutFeedback
              // onPress={() => navigation.navigate("Product", { product: item })}
            >
              <Block style={styles.imageHorizontal}>
                <Image
                  source={{ uri: item.image }}
                  style={{
                    height: theme.SIZES.BASE * 5,
                    marginTop: -theme.SIZES.BASE,
                    borderRadius: 3,
                  }}
                />
              </Block>
            </TouchableWithoutFeedback>
            <Block flex style={styles.productDescription}>
              <Text
                size={14}
                style={styles.productTitle}
                color={argonTheme.COLORS.TEXT}
              >
                {item.name}
              </Text>

              <Block flex row space="between">
                <Block bottom>
                  <Text
                    style={{
                      marginBottom: 20,
                      fontFamily: "open-sans-regular",
                    }}
                    size={theme.SIZES.BASE * 0.75}
                    color={argonTheme.COLORS.DEFAULT}
                  >
                    {item.content }
                  </Text> 
                </Block>
                <Block bottom>
                  <Text
                    style={{ fontFamily: "open-sans-regular" }}
                    size={theme.SIZES.BASE * 0.75}
                    color={argonTheme.COLORS.ACTIVE}
                  ></Text>
                </Block>
              </Block>
            </Block>
          </Block>
          <Block flex row space="between" style={styles.options}>
            {/* <Block>
              <Button
                small
                shadowless
                color="default"
                textStyle={styles.optionsButtonText}
                style={styles.optionsButton}
                onPress={() => handleBookingDescription(item)}
              >
                Editar
              </Button>
              <Button
                small
                shadowless
                color="error"
                textStyle={styles.optionsButtonText}
                style={styles.optionsButton}
                //onPress={() => handleBookingDescription(item)}
              >
                Eliminar
              </Button>
            </Block> */}
            <Button
              small
              shadowless
              color={item.show ? "error" : "success"}
              textStyle={styles.optionsButtonText}
              style={styles.optionsButton}
              // onPress={() => handleBookingDescription(item)}
            >
              {item.show ? "Ocultar" : "Mostrar"}
            </Button>
          </Block>
        </Block>
      </Block>
    );
  };

  const renderHeader = () => {
    return (
      <Block flex style={styles.header}>
        <Block style={{ marginBottom: theme.SIZES.BASE * 2 }}>
          <Text
            style={{ marginRight: 12, fontFamily: "open-sans-regular" }}
            size={20}
            color={argonTheme.COLORS.TEXT}
          >
            Promociones
          </Text>

          <Text
            style={{ marginTop: 10, marginRight: 12, fontFamily: "open-sans-regular" }}
            size={12}
            color={argonTheme.COLORS.TEXT}
          >
            Aqui puedes crear las promociones que van a visualizar los jugadores
          </Text>
        </Block>
      </Block>
    );
  };

  const renderEmpty = () =>  {
    return (
      <Text
        style={{ fontFamily: "open-sans-regular" }}
        color={argonTheme.COLORS.ERROR}
      >
        No hay promociones en este momento
      </Text>
    );
  }

  
  return (
    <>
      {progressBar ? (
        <Progress.Bar
          //style={{ marginTop: 80 }}
          width={width}
          indeterminate={true}
        />
      ) : (
        <></>
      )}

      <SnackBar
        visible={showSnackbar}
        position={"top"}
        backgroundColor={snackbarColor}
        textMessage={snackbarMessage}
      />
      <Block flex center style={styles.cart}>
        <FlatList
          data={fieldPromos}
          renderItem={renderBookings}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item, index) => `${index}-${item.title}`}
          ListEmptyComponent={renderEmpty()}
          ListHeaderComponent={renderHeader()}
        />
      </Block>

      <FloatingAction
          actions={actions}
          style={styles.floatinBtn}
          onPressItem={(name) => handleFloatingAction(name)}
        />
    </>
  );
  
}

const styles = StyleSheet.create({
  cart: {
    width: width,
  },
  header: {
    marginTop: theme.SIZES.BASE,
    marginHorizontal: theme.SIZES.BASE,
  },
  footer: {
    marginBottom: theme.SIZES.BASE * 2,
  },
  divider: {
    height: 1,
    backgroundColor: argonTheme.COLORS.INPUT,
    marginVertical: theme.SIZES.BASE,
  },
  checkoutWrapper: {
    paddingTop: theme.SIZES.BASE * 2,
    margin: theme.SIZES.BASE,
    borderStyle: "solid",
    borderTopWidth: 1,
    borderTopColor: argonTheme.COLORS.INPUT,
  },
  products: {
    minHeight: "100%",
  },
  product: {
    width: width * 0.9,
    borderWidth: 0,
    marginVertical: theme.SIZES.BASE,
    marginHorizontal: theme.SIZES.BASE,
    backgroundColor: theme.COLORS.WHITE,
  },
  productTitle: {
    fontFamily: "open-sans-regular",
    flex: 1,
    flexWrap: "wrap",
    paddingBottom: 6,
  },
  productDescription: {
    padding: theme.SIZES.BASE / 2,
  },
  imageHorizontal: {
    width: theme.SIZES.BASE * 6.25,
    margin: theme.SIZES.BASE / 2,
  },
  options: {
    padding: theme.SIZES.BASE / 2,
  },
  qty: {
    display: "flex",
    justifyContent: "center",
    alignContent: "center",
    width: theme.SIZES.BASE * 6.25,
    backgroundColor: argonTheme.COLORS.INPUT,
    paddingHorizontal: theme.SIZES.BASE,
    paddingVertical: 10,
    borderRadius: 3,
  },
  optionsButtonText: {
    fontFamily: "open-sans-bold",
    fontSize: theme.SIZES.BASE * 0.75,
    color: theme.COLORS.WHITE,
    fontWeight: "normal",
    fontStyle: "normal",
    letterSpacing: -0.29,
  },
  optionsButton: {
    width: "auto",
    height: 34,
    paddingHorizontal: theme.SIZES.BASE,
    paddingVertical: 10,
    borderRadius: 3,
  },
  checkout: {
    height: theme.SIZES.BASE * 3,
    width: width - theme.SIZES.BASE * 4,
  },
  similarTitle: {
    lineHeight: 26,
    marginBottom: theme.SIZES.BASE,
    paddingHorizontal: theme.SIZES.BASE,
  },
  productVertical: {
    height: theme.SIZES.BASE * 10.75,
    width: theme.SIZES.BASE * 8.125,
    overflow: "hidden",
    borderWidth: 0,
    borderRadius: 4,
    marginBottom: theme.SIZES.BASE,
    backgroundColor: theme.COLORS.WHITE,
  },
});
