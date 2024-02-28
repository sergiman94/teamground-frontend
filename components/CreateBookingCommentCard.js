import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  StyleSheet,
  TextInput,
  View,
  Dimensions,
} from "react-native";
import { Block, theme, Button } from "galio-framework";
import * as Progress from "react-native-progress";
import SnackBar from "react-native-snackbar-component";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import {
  BOOKINGS_URL,
  USERS_URL,
} from "../utils/utils.";
const { width } = Dimensions.get("screen");
export default function CreateBookingCommentCard(props) {
  const {
    horizontal,
    full,
    style,
    imageStyle,
  } = props;

  const cardContainer = [styles.card, style];
  const [textAreaValue, setTextAreaValue] = useState("");
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [snackbarColor, setSnackbarColor] = useState("#93C46F");
  const [snackbarMessage, setSnackbarMessage] = useState(
    "this is a test message"
  );
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false)

  const handleCreateBookingCommentButton = async () => {
    if (!textAreaValue.length <= 0) {
      setShowProgressBar(true)
      setButtonLoading(true)

      let currentUserID = await AsyncStorage.getItem("@user_id");
      let currentUser = (await axios.get(`${USERS_URL}/${currentUserID}`)).data;

      let body = {
        comment: {
          description: textAreaValue,
          timestamp: Date.now(),
          owner: currentUser.data.key,
        },
      };

      await axios
        .put(`${BOOKINGS_URL}/add/comment/${props.item.key}`, body)
        .then((r) => {
          setShowProgressBar(false);
          setButtonLoading(false)
          props.myProps("posted");
        })
        .catch((error) => {
          console.log(error);
          setShowProgressBar(false);

          setShowSnackbar(true);
          setSnackbarColor("#BB6556");
          setSnackbarMessage("Error al comentar en la reserva");
          setTimeout(() => {
            setShowSnackbar(false);
            setButtonLoading(false)
          }, 1500);
        });
    }
  };

  return (
    <Block row={horizontal} card flex style={cardContainer}>
      {showProgressBar ? (
        <Progress.Bar width={width - 30} indeterminate={true} />
      ) : (
        <></>
      )}

      <SnackBar
        visible={showSnackbar}
        position={"top"}
        backgroundColor={snackbarColor}
        textMessage={snackbarMessage}
      />

      {/* header (description) */}
      <Block space="between" style={styles.cardHeader}>
        <View style={styles.textAreaContainer}>
          <TextInput
            style={styles.textArea}
            underlineColorAndroid="transparent"
            placeholder="¿ Que está pasando ?"
            placeholderTextColor="#96A7AF"
            numberOfLines={10}
            multiline={true}
            value={textAreaValue}
            onChangeText={(text) => setTextAreaValue(text)}
          />
        </View>
      </Block>

      {/* buttons */}
      <Block space="between" style={styles.cardDescription}>
        <Block flex row>
          <Block style={styles.cardButtons}>
            <Button
              small
              loading={buttonLoading}
              shadowless
              textStyle={styles.optionsButtonText}
              style={styles.optionsButton}
              onPress={() => handleCreateBookingCommentButton(textAreaValue)}
            >
              Commentar
            </Button>
          </Block>
        </Block>
      </Block>
    </Block>
  );
}

CreateBookingCommentCard.propTypes = {
  item: PropTypes.object,
  horizontal: PropTypes.bool,
  full: PropTypes.bool,
  ctaColor: PropTypes.string,
  imageStyle: PropTypes.any,
  ctaRight: PropTypes.bool,
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#30444E',
    marginVertical: theme.SIZES.BASE,
    borderWidth: 0,
    minHeight: 114,
    marginBottom: 4,
  },
  textAreaContainer: {
    borderColor: "#30444E",
    borderWidth: 1,
    padding: 5,
    marginTop: 12,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: "#30444E",
  },
  textArea: {
    height: 150,
    justifyContent: "flex-start",
    color: "#ffffff",
    fontSize: 18
  },
  cardButtons: {},
  cardTitle: {
    marginTop: 10,
    paddingBottom: 6,
  },
  cardDescription: {
    padding: theme.SIZES.BASE / 2,
  },

  cardHeader: {
    padding: theme.SIZES.BASE / 2,
  },
  imageContainer: {
    borderRadius: 3,
    elevation: 1,
    overflow: "hidden",
  },
  image: {},
  horizontalImage: {
    height: 122,
    width: "auto",
  },
  horizontalStyles: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  verticalStyles: {
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
  },
  fullImage: {
    height: 215,
  },
  // textArea: {
  //   padding: theme.SIZES.BASE / 2,
  //   flex: 1,
  // },
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
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 1,
    backgroundColor: "#286053"
  },
});
