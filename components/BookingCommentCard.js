import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableWithoutFeedback } from "react-native";
import { Block, Text, theme } from "galio-framework";
import { argonTheme } from "../constants";
import ProfileMiniature from "./ProfileMiniature";
import axios from "axios";
import { USERS_URL } from "../utils/utils.";

export default function BookingCommentCard(props) {
  const { item, horizontal, style } = props;
  const cardContainer = [styles.card, style];
  const [user, setUser] = useState([])

  const loadUser = async () => {
    const userData = (await axios.get(`${USERS_URL}/${item.owner}`)).data.data
    setUser(userData) 
  }

  useEffect(() => {
    loadUser()
  }, [])

  return (
    <Block row={horizontal} card flex style={cardContainer}>
      {/* header */}
      <TouchableWithoutFeedback>
        <Block space="between" style={styles.cardHeader}>
          {/* avatar view */}
          <Block>
            <ProfileMiniature item={user} />
          </Block>

          {/* description */}
          <Block>
            <Text
              size={14}
              style={styles.cardTitle}
              color={argonTheme.COLORS.WHITE}
            >
              {item.description}
            </Text>
          </Block>
        </Block>
      </TouchableWithoutFeedback>
    </Block>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#30444E",
    marginVertical: 2,
    borderWidth: 0,
    minHeight: 114,
    marginBottom: 0,
  },
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
});
