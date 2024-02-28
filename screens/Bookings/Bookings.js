import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Dimensions,
  Image,
  FlatList,
  TouchableWithoutFeedback,
  RefreshControl,
} from "react-native";
import { Block, Text, theme } from "galio-framework";
import { Button, Icon } from "../../components/";
import { argonTheme } from "../../constants/";
import axios from "axios";
import {
  BOOKINGS_URL,
  formatTime,
  GET_ACTIVE_BOOKINGS_BY_FIELD_ID,
  GET_ACTIVE_BOOKINGS_BY_USER_ID,
  MATCHES_URL,
  USERS_URL,
} from "../../utils/utils.";
import SnackBar from "react-native-snackbar-component";
import * as Progress from "react-native-progress";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import ProfileBookingMiniature from "../../components/ProfileBookingMiniature";
import EmptyItemsCard from "../../components/EmptyItemsCard";
const { width } = Dimensions.get("screen");

export default function Bookings(props) {
  const { navigation } = props;
  const [userBookings, setUserBookings] = useState([]);
  const [role, setRole] = useState("");
  const [progressBar, setProgressbar] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarColor, setSnackbarColor] = useState("#93C46F");
  const [snackbarMessage, setSnackbarMessage] = useState(
    "this is a test message"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [adminCurrentPage, setAdminCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [emptyItems, setEmptyItems] = useState(false)

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    let loads = [loadData()];
    Promise.allSettled(loads).then(() => setRefreshing(false));
  }, []);

  const checkUser = async () => {
    let userID = await AsyncStorage.getItem("@user_id");
    if (!userID) {
      navigation.navigate("AuthenticationHandler");
    }
  };

  const loadData = async () => {
    let userID = await AsyncStorage.getItem("@user_id");
    let fieldID = await AsyncStorage.getItem("@field_id");
    let role = await AsyncStorage.getItem("@user_role");
    let bookings = []
    
    if (role === "player" || role === "admin") { 
      bookings = (await axios.get(`${GET_ACTIVE_BOOKINGS_BY_USER_ID}/${userID}?page=${currentPage}`)).data.data
    } else {
      bookings = (await axios.get(`${GET_ACTIVE_BOOKINGS_BY_FIELD_ID}/${fieldID}?page=${adminCurrentPage}`)).data.data
    }

    if (bookings.length > 0) {
      for (let i = 0; i < bookings.length; i++) {
        const booking = bookings[i];
        booking.owner = (await axios.get(`${USERS_URL}/${booking.owner}`)).data.data
        if (booking.matchKey) { 
          booking.matchKey = (await axios.get(`${MATCHES_URL}/${booking.matchKey}`)).data.data
        }
      }
      setProgressbar(false);
      setUserBookings([...userBookings, ...bookings]);
    } else {
      setProgressbar(false);
      if (currentPage === 1) setEmptyItems(true)
    }
    setRole(role);
  };

  useFocusEffect(() => {
    checkUser();
  });

  useEffect(() => {
    props.getComponentTitle("Reservas")
  })

  useEffect(() => {
    setProgressbar(true);
    loadData();
  }, []);

  useEffect(() => {
    loadData();
  }, [currentPage, adminCurrentPage]);

  const handleBookingDescription = (item) => {
    const { navigation } = props;
    navigation.navigate("BookingDescription", { booking: item });
  };

  const handleBookingConfirmation = async (value, bookingid) => {
    setProgressbar(true);
    switch (value) {
      case "true":
        await axios
          .put(`${BOOKINGS_URL}/confirmation/${bookingid}`, {
            confirmation: true,
          })
          .then((response) => {
            setProgressbar(false);
            setShowSnackbar(true);
            setSnackbarColor("#93C46F");
            setSnackbarMessage("Reserva Confirmada");
            loadData();
            setTimeout(() => {
              setShowSnackbar(false);
            }, 1500);
          })
          .catch((error) => {
            console.log(error);
            setProgressbar(false);
            setShowSnackbar(true);
            setSnackbarColor("#BB6556");
            setSnackbarMessage("No se pudo confirmar la reserva");
            loadData();
            setTimeout(() => {
              setShowSnackbar(false);
            }, 1500);
          });
        break;
      case "false":
        await axios
          .put(`${BOOKINGS_URL}/confirmation/${bookingid}`, {
            confirmation: false,
          })
          .then((response) => {
            setProgressbar(false);
            setShowSnackbar(true);
            setSnackbarMessage("Reserva Rechazada");
            setTimeout(() => {
              setShowSnackbar(false);
            }, 1500);
          })
          .catch((error) => {
            setProgressbar(false);
            setShowSnackbar(true);
            setSnackbarColor("#BB6556");
            setSnackbarMessage("No se pudo rechazar la reserva");
            setTimeout(() => {
              setShowSnackbar(false);
            }, 1500);
          });
        break;
      default:
        break;
    }
  };

  const renderBookings = ({ item }) => {
    const { navigation } = props;
    return (
      <Block>
        <Block card shadow style={styles.product}>
          {/* image and title badge */}
          <Block flex row>
            {/* image */}
            <TouchableWithoutFeedback
              onPress={() => navigation.navigate("Product", { product: item })}
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

            {/* title and badge */}
            <Block flex style={styles.productDescription}>
              {/* booking title */}
              <Text
                size={20}
                style={styles.productTitle}
                color={argonTheme.COLORS.WHITE}
              >
                {item.title}
              </Text>
              {/* confirmed action badge */}
              <Block flex row space="between">
                <Block bottom>
                  {item.status === "canceled" ? (
                    <Button
                      style={styles.buttonBadge}
                      textStyle={{ fontFamily: "open-sans-bold", fontSize: 10 }}
                      small
                      color={"warning"}
                      shadowless
                    >
                      CANCELADO
                    </Button>
                  ) : item.status === "outdated" ? (
                    <Button
                      style={styles.buttonBadge}
                      textStyle={{ fontFamily: "open-sans-bold", fontSize: 10 }}
                      small
                      color={"warning"}
                      shadowless
                    >
                      TERMINADO
                    </Button>
                  ) : item.confirmedAction ? (
                    <Button
                      style={styles.buttonBadge}
                      textStyle={{ fontFamily: "open-sans-bold", fontSize: 10 }}
                      small
                      color={item.confirmed ? "success" : "error"}
                      shadowless
                    >
                      {item.confirmed ? "Confirmada" : "Rechazada"}
                    </Button>
                  ) : !item.confirmedAction ? (
                    <Button
                      style={styles.pendingButton}
                      textStyle={{ fontFamily: "open-sans-bold", fontSize: 10 }}
                      small
                      shadowless
                    >
                      Cancha pendiente por confirmar
                    </Button>
                  ) : (
                    <></>
                  )}
                </Block>
              </Block>
            </Block>
          </Block>

          {/* booking data */}
          <Block flex row space="between" style={styles.options}>
            {/* left */}
            <Block left>
              {/* modality */}
              <Block flex row style={styles.infoContainer}>
                <Icon
                  name="male"
                  family="Font-Awesome"
                  size={16}
                  color={"#96A7AF"}
                />
                <Text
                  style={styles.bookingInfo}
                  size={14}
                  color={argonTheme.COLORS.WHITE}
                >
                  {item.matchKey && item.matchKey.modality
                    ? item.matchKey.modality
                    : "Entrenamiento"}
                </Text>
              </Block>

              {/* date */}
              <Block flex row style={styles.infoContainer}>
                <Icon
                  name="calendar"
                  family="Font-Awesome"
                  size={16}
                  color={"#96A7AF"}
                />
                <Text
                  style={styles.bookingInfo}
                  size={14}
                  color={argonTheme.COLORS.WHITE}
                >
                  {item.date}
                </Text>
              </Block>

              {/* time */}
              <Block flex row style={styles.infoContainer}>
                <Icon
                  name="clock-o"
                  family="Font-Awesome"
                  size={16}
                  color={"#96A7AF"}
                />
                <Text
                  style={styles.bookingInfo}
                  size={14}
                  color={argonTheme.COLORS.WHITE}
                >
                  {formatTime(item.time)}
                </Text>
              </Block>
            </Block>
            
            {/* show profile miniature for field role */}
            {role === "field" ? (
              <>
                {/* right */}
                <Block right style={{ bottom: 12 }}>
                  <ProfileBookingMiniature item={item.owner} />
                </Block>
              </>
            ) : (
              <></>
            )}
          </Block>
          
          {/* if is not field role */}
          {role !== "field" ? (
            <Block>
              <Button
                small
                shadowless
                textStyle={styles.optionsButtonText}
                style={styles.optionsButton}
                onPress={() => handleBookingDescription(item)}
              >
                <Block flex row>
                  <Text
                    style={{ fontFamily: "open-sans-bold" }}
                    size={12}
                    muted={false}
                    color={"#FFFFFF"}
                    bold
                  >
                    {"Ver Reserva"}
                  </Text>
                  <Icon
                    name="external-link-square"
                    style={{
                      marginTop: 2,
                      fontFamily: "open-sans-bold",
                      color: "#FFFFFF",
                      left: 8,
                    }}
                    family="Font-Awesome"
                    size={12}
                    color={"#FFFFFF"}
                  />
                </Block>
              </Button>
            </Block>
          ) : (
            <></>
          )}

          {/* allow confirmation buttons for field role */}
          {role !== "player" && !item.confirmedAction && item.status === 'active' ? (
            <>
              <Button
                small
                shadowless
                color="success"
                loading={progressBar}
                textStyle={styles.optionsButtonText}
                style={styles.optionsButton}
                onPress={() => handleBookingConfirmation("true", item.key)}
              >
                Confirmar Reserva
              </Button>

              <Button
                small
                shadowless
                loading={progressBar}
                textStyle={styles.optionsButtonText}
                style={styles.optionsRejectButton}
                onPress={() => handleBookingConfirmation("false", item.key)}
              >
                Rechazar Reserva
              </Button>
            </>
          ) : (
            <></>
          )}
        </Block>
      </Block>
    );
  };

  const renderHeader = () => {
    return (
      <Block flex style={styles.header}>
        <Block style={{ marginBottom: theme.SIZES.BASE * 2 }}>
          <Text
            style={{ marginRight: 12, fontFamily: "open-sans-bold" }}
            size={20}
            color={argonTheme.COLORS.WHITE}
          >
            Tus Reservas
          </Text>
        </Block>
      </Block>
    );
  };

  const renderEmpty = () => {
    if (emptyItems) {
      return (
        <Block style={{ paddingBottom: 0, paddingTop: 0 }}>
          <EmptyItemsCard prefix={"reservas"} full />
        </Block>
      );
    } else {
      return (
        <Text
          style={{ fontFamily: "open-sans-regular" }}
          color={argonTheme.COLORS.ERROR}
        >
          Estamos buscando tus reservas ... 
        </Text>
      );
    }
  };

  const handleOnEndReached = () => {
    role && role === "player"
      ? setCurrentPage(currentPage + 1)
      : role && role === "admin"
      ? setAdminCurrentPage(adminCurrentPage + 1)
      : () => {
          console.log("end reached, do nothing if conditions arent satisfied");
        };
  };

  return (
    <>
      {progressBar ? (
        <Progress.Bar
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
          data={userBookings}
          renderItem={renderBookings}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item, index) => `${index}-${item.title}`}
          ListEmptyComponent={renderEmpty()}
          ListHeaderComponent={renderHeader()}
          onEndReachedThreshold={0.2}
          onEndReached={handleOnEndReached}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </Block>
    </>
  );
}

const styles = StyleSheet.create({
  cart: {
    backgroundColor: "#22343C",
    width: width,
  },
  header: {
    marginTop: theme.SIZES.BASE,
    marginHorizontal: theme.SIZES.BASE,
  },
  footer: {
    marginBottom: theme.SIZES.BASE * 2,
  },
  buttonBadge: {
    width: 70,
    height: 20,
    right: 6,
    bottom: 8,
  },
  pendingButton: {
    backgroundColor: "#FFBC25",
    width: 180,
    height: 20,
    right: 6,
    bottom: 8,
  },
  bookingInfo: {
    left: 8, 
    fontFamily: "open-sans-bold",
  },
  infoContainer: { 
    marginBottom: 8,
    left: 8
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
    backgroundColor: "#30444E",
  },
  productTitle: {
    fontFamily: "open-sans-bold",
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
    padding: 8,
    marginTop: 4
  },
  qty: {
    display: "flex",
    justifyContent: "center",
    alignContent: "center",
    width: theme.SIZES.BASE * 6.25,
    backgroundColor: argonTheme.COLORS.INPUT,
    paddingHorizontal: theme.SIZES.BASE,
    paddingVertical: 10,
    borderRadius: 3
  },
  optionsButtonText: {
    size: 16,
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
    backgroundColor: "#286053",
  },
  optionsRejectButton: {
    width: "auto",
    height: 34,
    paddingHorizontal: theme.SIZES.BASE,
    paddingVertical: 10,
    borderRadius: 3,
    backgroundColor: "#623A42",
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
