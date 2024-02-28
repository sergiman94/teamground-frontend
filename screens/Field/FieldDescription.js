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
  Share,
} from "react-native";

import { Block, Text, Button, theme } from "galio-framework";
import argonTheme from "../../constants/Theme";
import { iPhoneX, HeaderHeight } from "../../constants/utils";
import Star from "react-native-star-view";
import FieldShortcutComponent from "../../components/FieldShortcutComponent";
import FieldCommentCard from "../../components/FieldCommentCard";
import axios from "axios";
import { FIELDS_URL } from "../../utils/utils.";
import RatingModal from "../../components/RatingModal";
const { height, width } = Dimensions.get("window");
import SnackBar from 'react-native-snackbar-component'
import {showLocation} from 'react-native-map-link'

// ---- SHORTCUT IMAGES  ----
const bookingImage = require('../../assets/booking.png')
const mapImage = require('../../assets/map.png')
const shareImage = require('../../assets/share.png')
const commentImage = require('../../assets/comment.png')
const rateImage = require('../../assets/rate.png')
const fieldMatchesImage = require('../../assets/matches.png')

export default function FieldDescription(props) {
  const { navigation, route } = props;
  const [fieldPoints, setFieldPoints] = useState(1);
  const [field, setField] = useState(route.params?.field);
  const [reload, setReload] = useState(
    route.params ? route.params.reload : null
  );
  const [showModal, setShowModal] = useState(false)
  const [showSnackbar, setShowSnackbar] = useState(false)
  const [snackbarColor, setSnackbarColor] = useState("#93C46F")
  const [snackbarMessage, setSnackbarMessage] = useState("this is a test message")
  const share_base_url = "https://teamground.web.app/field?"
  const scrollX = new Animated.Value(0);
  const starStyle = {
    width: 100,
    height: 20,
    marginBottom: 2,
    marginTop: 4,
  };
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    let loads = [loadField()];
    Promise.allSettled(loads).then(() => setRefreshing(false));
  }, []);


  // ---------- handles ---------------
  const handleMapButton = () => {
    let lat = Number(field.lat)
    let lng = Number(field.lng)
    let locationOpts = {
      latitude: lat, 
      longitude: lng,
      directionsMode: 'car',
      title: field.field,
      dialogTitle: `Ubicación de ${field.field}`,
      dialogMessage: 'Selecciona donde quieres ver la ubicación',
      cancelText: 'Cancelar',
    }
    return (
      showLocation(locationOpts)
    )
  };

  const handleRateConfirmation = async (rate) => {
    await axios
      .put(`${FIELDS_URL}/points/${field.key}`, { point: Number(rate) })
      .then(() => {
        setShowSnackbar(true);
        setSnackbarMessage("Cancha valorada ! ");
        setSnackbarColor("#93C46F")
        setTimeout(() => {
          setShowSnackbar(false);
        }, 1500);
      })
      .catch((error) => {
        console.log(error)
        setShowSnackbar(true);
        setSnackbarColor("#BB6556");
        setSnackbarMessage("No se pudo valorar la cancha");
        setTimeout(() => {
          setShowSnackbar(false);
        }, 1500);
      });
  };

  const handleShareButton = async () => {
    let shareURL = `${share_base_url}${field.key}`
    try {
      const result = await Share.share({
        message: shareURL
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleBookingButton = async () => { 
    navigation.navigate("CreateMatch")
  }

  const handleFieldMatchesButton = async () => {
    navigation.navigate("FieldsMatches", {field: field})
  }

  // ---------- renders ---------------
  const renderGallery = () => {
    let productImages = field && field.fieldImages ? field.fieldImages : [field.image]
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
              // NOTE: we should pass an array of images (url's) to the navigate param config with key 'images' 
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

  const renderBookingButton = (item) => {
    return (
      <TouchableWithoutFeedback onPress={handleBookingButton}>
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
                Reservar
              </Text>
            </Block>
          </Block>
        </Block>
      </TouchableWithoutFeedback>
    );
  }
  
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

  const renderShareButton = (item) => {
    return (
      <TouchableWithoutFeedback onPress={handleShareButton}>
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
                Compartir
              </Text>
            </Block>
          </Block>
        </Block>
      </TouchableWithoutFeedback>
    );
  };

  const renderRateButton = (item) => {
    return (
      <TouchableWithoutFeedback onPress={() => setShowModal(true)}>
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
            <Image source={item} style={styles.rateImageStyle} />

            <Block right={false} style={{ marginTop: 10 }}>
              <Text
                style={{ fontFamily: "open-sans-bold" }}
                size={12}
                color={argonTheme.COLORS.WHITE}
                bold
              >
                Valorar
              </Text>
            </Block>
          </Block>
        </Block>
      </TouchableWithoutFeedback>
    );
  };

  const renderFieldMatchesButton = (item) => {
    return (
      <TouchableWithoutFeedback onPress={handleFieldMatchesButton}>
        <Block
          card
          flex
          style={{
            marginVertical: theme.SIZES.BASE,
            borderWidth: 0,
            minHeight: 0,
            marginBottom: 0,
          }}
        >
          <Block flex style={styles.imgContainer}>
            <Image source={item} style={styles.rateImageStyle} />

            <Block right={false} style={{ marginTop: 10 }}>
              <Text
                style={{ fontFamily: "open-sans-bold" }}
                size={12}
                color={argonTheme.COLORS.WHITE}
                bold
              >
                Partidos
              </Text>
            </Block>
          </Block>
        </Block>
      </TouchableWithoutFeedback>
    );
  };

  const renderProgress = () => {
    let fieldImages = field && field.fieldImages ? field.fieldImages : [field.image]
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

  const setAveragePoints = (points) => {
    let sum = points.reduce((a, b) => a + b, 0);
    let avg = sum / points.length;
    setFieldPoints(avg);
  };

  const loadField = async () => {
    let fieldData = (await axios.get(`${FIELDS_URL}/${field.key}`)).data;
    setField(fieldData.data);
  };

  useEffect(() => {
    setReload(route.params ? route.params.reload : null);
  });

  useEffect(() => {
    setAveragePoints(field.points);
  }, []);

  useEffect(() => {
    loadField()
  }, [reload]);

  const render = () => {
    return (
      <Block flex style={styles.product}>
        {/* rating modal */}
        <RatingModal
          onClose={() => setShowModal(false)}
          visible={showModal}
          ratingConfirm={(selectedRating) =>
            handleRateConfirmation(selectedRating)
          }
        />

        {/* render gallery  */}
        <Block flex style={{ position: "relative" }}>
          {renderGallery()}
          <Block center style={styles.dotsContainer}>
            {renderProgress()}
          </Block>
        </Block>
        
        {/* field description and buttons */}
        <Block flex style={styles.options}>
          <SnackBar
            visible={showSnackbar}
            position={"top"}
            backgroundColor={snackbarColor}
            textMessage={snackbarMessage}
          />
          <ScrollView
            style={{ marginTop: 8 }}
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
              <Block row space="between">
                <Text
                  size={20}
                  style={{ paddingBottom: 10, fontFamily: "open-sans-regular" }}
                  color={argonTheme.COLORS.WHITE}
                >
                  {field.field}
                </Text>

                <Star score={fieldPoints} style={starStyle} />
              </Block>

              {/* field address */}
              <Block row space="between">
                <Block row>
                  <Text
                    size={14}
                    style={{
                      paddingBottom: 24,
                      fontFamily: "open-sans-regular",
                    }}
                    color={argonTheme.COLORS.WHITE}
                  >
                    {field.address}
                  </Text>
                </Block>
              </Block>

              {/* field full description */}
              <Text
                size={14}
                style={{ paddingBottom: 24, fontFamily: "open-sans-regular" }}
                color={argonTheme.COLORS.WHITE}
              >
                {field.fullDescription}
              </Text>

              {/* shortcuts */}
              <Block row style={{ marginTop: 20, marginLeft: 20 }}>
                {renderBookingButton(bookingImage)}
                {renderMapButton(mapImage)}
                {renderShareButton(shareImage)}
              </Block>

              {/* comment and rate buttons */}
              <Block
                row
                style={{ marginTop: 20, marginBottom: 20, marginLeft: 20 }}
              >
                {renderFieldMatchesButton(fieldMatchesImage)}
                {renderRateButton(rateImage)} 
                <FieldShortcutComponent
                  component={"CreateFieldComment"}
                  data={field}
                  item={commentImage}
                />
              </Block>

              {/* field comments */}
              <Block style={{ marginTop: 32, marginBottom: 24 }}>
                {field.comments.length > 0 && field.comments ? (
                  field.comments.map((comment) => (
                    <>
                      <FieldCommentCard item={comment} full />
                    </>
                  ))
                ) : (
                  <></>
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
    backgroundColor: "#22343C",
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
    elevation: 2,
  },
  rateImageStyle: {
    width: 40,
    height: 40,
    borderRadius: 40 / 2,
    marginLeft: 4,
    marginHorizontal: 2,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
    elevation: 2,
  },
  fieldMatchesStyle: {
    width: 50,
    height: 50,
    borderRadius: 40 / 2,
    marginLeft: 4,
    marginHorizontal: 2,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
    elevation: 2,
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
});
