import React, { useEffect, useState } from "react";
import { withNavigation } from "@react-navigation/compat";
import PropTypes from "prop-types";
import {
  StyleSheet,
  Image,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Block, Text, theme } from "galio-framework";
import StarRating from "react-native-star-rating";
import Star from "react-native-star-view";
import { argonTheme } from "../constants";
import { Icon } from ".";
import axios from "axios";
import { USERS_URL } from "../utils/utils.";

export default function TeamTableCard (props) {
  const {
    navigation,
    item,
    horizontal,
    full,
    style,
    ctaColor,
    imageStyle,
    ctaRight,
  } = props;

  const [membersImages, setMembersImages] = useState([])

  const imageStyles = [
    full ? styles.fullImage : styles.horizontalImage,
    imageStyle,
  ];
  const cardContainer = [styles.card, style];
  const starStyle = {
    width: 100,
    height: 20,
    marginBottom: 20,
  };

  const loadMembersImages = async () => {
    let getProfileRequests = []
    for (let i = 0; i < item.members.length; i++) {
      const element = item.members[i];
      getProfileRequests.push((await axios.get(`${USERS_URL}/${element}`)).data.data)
    }

    let membersImgs = (await Promise.allSettled(getProfileRequests)).flatMap((result) => (result.value ? result.value.image : null))
    setMembersImages(membersImgs)
  }

  const redirectToTeamDescription = () => {
    props.navigation.navigate("TeamDescription", { team: item })
  }

  useEffect(() => {
    loadMembersImages()
  }, [])

  return (
    <Block row={horizontal} card flex style={cardContainer}>
      {/* IMAGE */}
      <TouchableWithoutFeedback
        onPress={redirectToTeamDescription}
      >
        <Block flex style={styles.cardDescription}>
          <Image source={{ uri: item.image }} style={imageStyles} />
        </Block>
      </TouchableWithoutFeedback>

      {/* text info */}
      <TouchableWithoutFeedback
        onPress={redirectToTeamDescription}
      >
        <Block flex space="between" style={styles.cardName}>
          <Block flex>
            {/* team name */}
            <Text
              size={14}
              style={styles.cardTitle}
              color={argonTheme.COLORS.WHITE}
            >
              {item.name}
            </Text>

            {/* team location */}
            <Block flex row>
              <Icon
                style={{ marginLeft: 4 }}
                name="map-marker"
                family="Font-Awesome"
                size={16}
                color={"#3DD598"}
              />
              <Text
                size={14}
                style={styles.cardTitle}
                color={argonTheme.COLORS.WHITE}
              >
                {item.location}
              </Text>
            </Block>

            {/* members count */}
            <Block flex row>
              <Icon
                style={{ marginLeft: 4 }}
                name="male"
                family="Font-Awesome"
                size={14}
                color={"#96A7AF"}
              />
              <Text size={14} style={styles.cardTitle} color={"#96A7AF"}>
                {`${item.members.length}`}
              </Text>
            </Block>
          </Block>
        </Block>
      </TouchableWithoutFeedback>

      {/* team rating */}
      <TouchableWithoutFeedback
        onPress={() => navigation.navigate("TeamDescription", { team: item })}
      >
        <Block flex space="between" style={styles.cardRating}>
          <Block flex>
            <View style={styles.container}>
              <Star score={item.rating} style={starStyle} />
              <>
                {membersImages.length ? (
                  <Block flex row>
                    {membersImages.map(
                      (member, index) =>
                        index < 5 && (
                          <Image
                            source={{ uri: member }}
                            style={styles.membersMiniatureImage}
                          />
                        )
                    )}
                  </Block>
                ) : (
                  <></>
                )}
              </>
            </View>
          </Block>
        </Block>
      </TouchableWithoutFeedback>
    </Block>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#30444E",
    marginVertical: theme.SIZES.BASE,
    borderWidth: 0,
    minHeight: 0,
    marginBottom: 0,
    padding: 8,
  },
  cardTitle: {
    paddingBottom: 6,
    marginTop: 0,
    marginLeft: 4,
    fontFamily: "open-sans-bold",
  },
  cardDescription: {
    padding: 5,
  },
  cardName: {
    marginTop: 16,
  },
  cardRating: {
    marginTop: 16,
  },
  imageContainer: {
    padding: 10,
  },
  membersMiniatureImage: {
    width: 20,
    height: 20,
    marginLeft: -4,
    borderRadius: 20 / 2,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 80 / 2,
  },
  horizontalImage: {
    width: 72,
    height: 72,
    top: 8,
    left: 8,
    borderRadius: 13,
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
  }
});
