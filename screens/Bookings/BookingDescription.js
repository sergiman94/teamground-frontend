import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableWithoutFeedback,
  Image,
  Animated,
  Platform,
  RefreshControl,
} from "react-native";
import { Block, Text, Button, theme } from "galio-framework";
import argonTheme from "../../constants/Theme";
import { iPhoneX, HeaderHeight } from "../../constants/utils";
import BookingCommentCard from "../../components/BookingCommentCard";
import axios from "axios";
import { BOOKINGS_URL, formatTime } from "../../utils/utils.";
import BookingShortcutComponent from "../../components/BookingShortcutComponent";
import { Icon } from "../../components";
import {showLocation} from 'react-native-map-link'
const { height, width } = Dimensions.get("window");
const mapImage = require('../../assets/map.png')
const commentImage = require('../../assets/comment.png')

export default function BookingDescription(props) {
  const { navigation, route } = props;
  const [scrollX, setScrollX] = useState(new Animated.Value(0));
  const [booking, setBooking] = useState(route.params?.booking);
  const [reload, setReload] = useState(
    route.params ? route.params.reload : null
  );
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    let loads = [loadBooking()];
    Promise.allSettled(loads).then(() => setRefreshing(false));
  }, []);

  const loadBooking = async () => {
    let bookingData = (await axios.get(`${BOOKINGS_URL}/${booking.key}`)).data;
    setBooking(bookingData.data);
  };

  const renderGallery = () => {
    const product = booking;
    let productImages =
      booking.field && booking.field.fieldImages
        ? booking.field.fieldImages
        : [booking.image];
    return (
      <ScrollView
        horizontal={true}
        pagingEnabled={true}
        decelerationRate={0}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
      >
        {productImages.map((image, index) => (
          <TouchableWithoutFeedback
            key={`product-image-${index}`}
            onPress={() =>
              navigation.navigate("Gallery", { images: productImages, index })
            }
          >
            <Image
              resizeMode="cover"
              source={{ uri: image }}
              style={{ width, height: iPhoneX ? width + 32 : width }}
            />
          </TouchableWithoutFeedback>
        ))}
      </ScrollView>
    );
  };

  const renderProgress = () => {
    let fieldImages =
      booking.field && booking.field.fieldImages
        ? booking.field.fieldImages
        : [booking.image];
    const position = Animated.divide(scrollX, width);
    return (
      <Block row>
        {fieldImages.map((_, i) => {
          const opacity = position.interpolate({
            inputRange: [i - 1, i, i + 1],
            outputRange: [0.5, 1, 0.5],
            extrapolate: "clamp",
          });

          const width = position.interpolate({
            inputRange: [i - 1, i, i + 1],
            outputRange: [8, 18, 8],
            extrapolate: "clamp",
          });

          return (
            <Animated.View key={i} style={[styles.dots, { opacity, width }]} />
          );
        })}
      </Block>
    );
  };

  const handleMapButton = () => {
    let lat = Number(booking.field.lat)
    let lng = Number(booking.field.lng)
    let locationOpts = {
      latitude: lat, 
      longitude: lng,
      directionsMode: 'car',
      title: booking.field.field,
      dialogTitle: `Ubicación de ${booking.field.field}`,
      dialogMessage: 'Selecciona donde quieres ver la ubicación',
      cancelText: 'Cancelar',
    }
    return (
      showLocation(locationOpts)
    )
  };

  const renderMapButton = (item) => {
    return (
      <TouchableWithoutFeedback onPress={handleMapButton}>
        <Block
          card
          flex
          style={{
            marginVertical: theme.SIZES.BASE,
            borderWidth: 0,
            minHeight: 0,
            marginBottom: 0,
            marginRight: 0,
          }}
        >
          <Block flex style={styles.imgContainer}>
            <Image source={item} style={styles.imageStyles} />
            <Block right={false} style={{ marginTop: 10 }}>
              <Text
                style={{ fontFamily: "open-sans-bold" }}
                size={12}
                color={argonTheme.COLORS.WHITE}
                bold
              >
                Ver en mapa
              </Text>
            </Block>
          </Block>
        </Block>
      </TouchableWithoutFeedback>
    );
  }

  useEffect(() => {
    setReload(route.params ? route.params.reload : null);
  });

  useEffect(() => {
    loadBooking();
  }, []);

  useEffect(() => {
    loadBooking();
  }, [reload]);

  const render = () => {
    return (
      <Block flex style={styles.product}>
        {/* RENDER GALLERY */}
        <Block flex style={{ position: "relative" }}>
          {renderGallery()}
          <Block center style={styles.dotsContainer}>
            {renderProgress()}
          </Block>
        </Block>

        {/* DESCRIPTION */}
        <Block flex style={styles.options}>
          <ScrollView
            vertical={true}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <Block
              style={{
                paddingHorizontal: theme.SIZES.BASE,
                paddingTop: theme.SIZES.BASE * 2,
              }}
            >
              {/* field name */}
              <Text
                size={24}
                style={{ paddingBottom: 12, fontFamily: "open-sans-bold" }}
                color={argonTheme.COLORS.WHITE}
              >
                {booking.title}
              </Text>

              {/* confirmed action badge */}
              <Block flex row space="between">
                <Block bottom>
                  {booking.status === "canceled" ? (
                    <Button
                      style={styles.buttonBadge}
                      textStyle={{ fontFamily: "open-sans-bold", fontSize: 12 }}
                      small
                      color={"warning"}
                      shadowless
                    >
                      CANCELADO
                    </Button>
                  ) : booking.status === "outdated" ? (
                    <Button
                      style={styles.buttonBadge}
                      textStyle={{ fontFamily: "open-sans-bold", fontSize: 12 }}
                      small
                      color={"warning"}
                      shadowless
                    >
                      TERMINADO
                    </Button>
                  ) : booking.confirmedAction ? (
                    <Button
                      style={styles.buttonBadge}
                      textStyle={{ fontFamily: "open-sans-bold", fontSize: 12 }}
                      small
                      color={booking.confirmed ? "success" : "error"}
                      shadowless
                    >
                      {booking.confirmed ? "Confirmada" : "Rechazada"}
                    </Button>
                  ) : !booking.confirmedAction ? (
                    <Button
                      style={styles.pendingButton}
                      textStyle={{ fontFamily: "open-sans-bold", fontSize: 12 }}
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

              {/* booking data */}
              <Block flex row space="between" >
                {/* left */}
                <Block left>
                  {/* modality */}
                  <Block flex row style={styles.infoContainer}>
                    <Icon
                      name="male"
                      family="Font-Awesome"
                      size={20}
                      color={"#96A7AF"}
                    />
                    <Text
                      style={styles.bookingInfo}
                      size={16}
                      color={argonTheme.COLORS.WHITE}
                    >
                      {booking.matchKey && booking.matchKey.modality
                        ? booking.matchKey.modality
                        : "Entrenamiento"}
                    </Text>
                  </Block>

                  {/* date */}
                  <Block flex row style={styles.infoContainer}>
                    <Icon
                      name="calendar"
                      family="Font-Awesome"
                      size={20}
                      color={"#96A7AF"}
                    />
                    <Text
                      style={styles.bookingInfo}
                      size={16}
                      color={argonTheme.COLORS.WHITE}
                    >
                      {booking.date}
                    </Text>
                  </Block>

                  {/* time */}
                  <Block flex row style={styles.infoContainer}>
                    <Icon
                      name="clock-o"
                      family="Font-Awesome"
                      size={20}
                      color={"#96A7AF"}
                    />
                    <Text
                      style={styles.bookingInfo}
                      size={16}
                      color={argonTheme.COLORS.WHITE}
                    >
                      {formatTime(booking.time)}
                    </Text>
                  </Block>
                </Block>
              </Block>

              {/* buttons */}
              <Block row style={{ marginTop: 20, marginLeft: 70 }}>
                {/* <BookingShortcutComponent item={fieldShortcuts[1]} /> */}
                {renderMapButton(mapImage)}
                <BookingShortcutComponent
                  component={"CreateBookingComment"}
                  data={booking}
                  item={commentImage}
                />
              </Block>

              {/* booking comments */}
              <Block style={{ marginTop: 32, marginBottom: 24 }}>
                {booking.comments.length > 0 && booking.comments ? (
                  booking.comments.map((item) => (
                    <>
                      <BookingCommentCard item={item} full />
                    </>
                  ))
                ) : (
                  <>
                    <Text
                      style={styles.noComments}
                      size={16}
                      color={"#96A7AF"}
                    >
                      Todavia no hay comentarios
                    </Text>
                  </>
                )}
              </Block>
            </Block>
          </ScrollView>
        </Block>
      </Block>
    );
  };

  return <>{render()}</>;
}

const styles = StyleSheet.create({
  product: {
    marginTop: Platform.OS === "android" ? -HeaderHeight : 0,
  },
  options: {
    position: "relative",
    marginHorizontal: theme.SIZES.BASE,
    marginTop: -theme.SIZES.BASE * 2,
    marginBottom: 0,
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
    backgroundColor: "#30444E",
  },
  buttonConfirmation: {
    width: "auto",
    paddingVertical: 10,
    borderRadius: 3,
  },
  buttonBadge: {
    width: 70,
    height: 20,
    right: 6,
    bottom: 8,
  },
  pendingButton: {
    backgroundColor: "#FFBC25",
    width: 210,
    height: 30,
    right: 6,
    bottom: 8,
  },
  bookingInfo: {
    marginBottom: 8, 
    left: 8, 
    fontFamily: "open-sans-bold",
  },
  noComments: {
    top: 12, 
    textAlign: 'center', 
    marginBottom: 8, 
    left: 8, 
    fontFamily: "open-sans-bold",
  },
  infoContainer: { 
    marginBottom: 8,
    left: 8
  },
  galleryImage: {
    width: width,
    height: "auto",
  },
  dots: {
    height: theme.SIZES.BASE / 2,
    margin: theme.SIZES.BASE / 2,
    borderRadius: 4,
    backgroundColor: "white",
  },
  dotsContainer: {
    position: "absolute",
    bottom: theme.SIZES.BASE,
    left: 0,
    right: 0,
    bottom: height / 10,
  },
  addToCart: {
    width: width - theme.SIZES.BASE * 4,
    marginTop: theme.SIZES.BASE * 2,
  },
  avatar: {
    height: 40,
    width: 40,
    borderRadius: 20,
    marginBottom: theme.SIZES.BASE,
    marginRight: 8,
  },
  chat: {
    width: 56,
    height: 56,
    padding: 20,
    borderRadius: 28,
  },
  chatContainer: {
    top: -32,
    right: theme.SIZES.BASE,
    zIndex: 2,
    position: "absolute",
  },
  size: {
    height: theme.SIZES.BASE * 3,
    width: (width - theme.SIZES.BASE * 2) / 3,
    borderBottomWidth: 0.5,
    borderBottomColor: argonTheme.COLORS.BORDER_COLOR,
    overflow: "hidden",
  },
  sizeButton: {
    height: theme.SIZES.BASE * 3,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  active: {
    backgroundColor: argonTheme.COLORS.PRICE_COLOR,
  },
  roundTopLeft: {
    borderTopLeftRadius: 4,
    borderRightColor: argonTheme.COLORS.BORDER_COLOR,
    borderRightWidth: 0.5,
  },
  roundBottomLeft: {
    borderBottomLeftRadius: 4,
    borderRightColor: argonTheme.COLORS.BORDER_COLOR,
    borderRightWidth: 0.5,
    borderBottomWidth: 0,
  },
  roundTopRight: {
    borderTopRightRadius: 4,
    borderLeftColor: argonTheme.COLORS.BORDER_COLOR,
    borderLeftWidth: 0.5,
  },
  roundBottomRight: {
    borderBottomRightRadius: 4,
    borderLeftColor: argonTheme.COLORS.BORDER_COLOR,
    borderLeftWidth: 0.5,
    borderBottomWidth: 0,
  },
  imgContainer: {
    marginHorizontal: 2
  },
  imageStyles: {
    width: 60,
    height: 60,
    borderRadius: 40 / 2,
    marginLeft: 4,
    marginHorizontal: 2,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
    shadowColor: "#8898AA",
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 6,
    shadowOpacity: 0.1,
    elevation: 2,
  },
});
