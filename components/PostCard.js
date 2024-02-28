import React, { useEffect, useState } from "react";
import { withNavigation } from "@react-navigation/compat";
import PropTypes from "prop-types";
import {
  StyleSheet,
  Image,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from "react-native";
import { Block, Text, theme } from "galio-framework";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import { argonTheme } from "../constants";
import PlayerAvatar from "./PlayerAvatar";
import ProfileMiniature from "./ProfileMiniature";

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { POSTS_URL } from "../utils/utils.";
import MatchCard from "./MatchCard";
import {
  Video,
  Audio,
  InterruptionModeAndroid,
  InterruptionModeIOS,
} from "expo-av";
import { Icon } from ".";

const triggerAudio = async (ref) => {
  await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
  ref.current.playAsync();
};

function PostCard(props) {
  const {
    navigation,
    item,
    horizontal,
    full,
    style,
    ctaColor,
    imageStyle,
    ctaRight,
    route,
  } = props;

  const [userId, setUserId] = useState("");
  let video = React.useRef({});
  const [status, setStatus] = React.useState({});
  const [canPlay, setCanPlay] = useState(props.canPlay);

  useEffect(() => {
    getUserId();
  });

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      playThroughEarpieceAndroid: false,
    });
  }, []);

  useEffect(() => {
    if (status.isPlaying) triggerAudio(video);
  }, [video, status.isPlaying]);

  const getUserId = async () => {
    let localUserId = await AsyncStorage.getItem("@user_id");
    let role = await AsyncStorage.getItem("@user_role");
    if (role && role !== "field") setUserId(localUserId);
  };

  const handleLikeButton = async (item) => {
    let userId = await AsyncStorage.getItem("@user_id");
    if (userId) {
      let likes = item.likes;
      // check if user already liked the post
      if (likes.filter((value) => value === userId).length > 0) {
        var index = likes.indexOf(userId);
        if (index !== -1) {
          likes.splice(index, 1);
        }
        props.myProps("reload");
      } else {
        likes.push(userId);
      }

      await axios
        .put(`${POSTS_URL}/like/${item.key}`, { userId: userId })
        .catch((error) => {
          console.error(error);
          var index = likes.indexOf(userId);
          if (index !== -1) {
            likes.splice(index, 1);
          }
        });
      props.myProps("reload");
    } else {
      navigation.navigate("AuthenticationHandler");
    }
  };

  const handleCommnetButton = (item) => {
    navigation.navigate("PostDescription", { item: item });
  };

  const toggleBottomNavigationView = (item) => {
    props.options(item.key);
  };

  const render = () => {
    const imageStyles = [
      full ? styles.fullImage : styles.horizontalImage,
      imageStyle,
    ];
    const cardContainer = [styles.card];
    const imgContainer = [
      styles.imageContainer,
      horizontal ? styles.horizontalStyles : styles.verticalStyles
    ];

    return (
      <Block row={horizontal} card flex style={cardContainer}>
        {/* header */}
        <TouchableWithoutFeedback>
          <Block space="between" style={styles.cardHeader}>
            {/* avatar view */}
            <Block flex row>
              <ProfileMiniature item={item} />
              <Block>
                {/* dots or three points  */}
                {item.owner === userId ? <>
                  <TouchableOpacity
                  style={styles.dots}
                  onPress={() => toggleBottomNavigationView(item)}
                >
                  <Icon
                    name="ellipsis-h"
                    family="Font-Awesome"
                    color={"#96A7AF"}
                    size={20}
                    style={{ paddingRight: 4, paddingLeft: 4, marginTop: 3.5 }}
                  />
                  <Block middle style={styles.notify} />
                </TouchableOpacity>
                </>: <></>}
              </Block>
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

            {/* if is a match post card */}
            {item.type !== "regular" ? (
              <MatchCard item={item.match} horizontal />
            ) : (
              <></>
            )}
          </Block>
        </TouchableWithoutFeedback>

        {/* image */}
        {item.image ? (
          <TouchableWithoutFeedback
            onPress={() =>
              navigation.navigate("Picture", { images: [item.image], index: 0 })
            }
          >
            <Block flex style={imgContainer}>
              <Image source={{ uri: item.image }} style={imageStyles} />
            </Block>
          </TouchableWithoutFeedback>
        ) : (
          <></>
        )}

        {/* video */}
        {item.video ? (
          <Video
            ref={video}
            style={styles.video}
            source={{ uri: item.video }}
            volume={1.0}
            isMuted={true}
            shouldPlay={true}
            useNativeControls
            resizeMode="contain"
            isLooping
            onPlaybackStatusUpdate={(status) => setStatus(() => status)}
          />
        ) : (
          <></>
        )}

        {/* buttons */}
        <Block space="between" style={styles.cardDescription}>
          {/* buttons */}
          <Block flex row>
            {/* like button */}
            <Block style={styles.cardButtons}>
              <FontAwesome.Button
                name="heart"
                color={
                  item.likes.filter((value) => value === userId).length > 0
                    ? "#FF565E"
                    : "#96A7AF"
                }
                textColor="#96A7AF"
                size={20}
                borderRadius="5"
                backgroundColor="#30444E"
                onPress={() => handleLikeButton(item)}
              >{`${
                item.likes.length === 0 ? "" : item.likes.length
              }`}</FontAwesome.Button>
            </Block>
            {/* comment button  */}
            <Block style={styles.cardButtons}>
              <FontAwesome.Button
                name="comment"
                color="#96A7AF"
                size={20}
                borderRadius="5"
                backgroundColor="#30444E"
                onPress={() => handleCommnetButton(item)}
              >{`${
                item.comments.length === 0 ? "" : item.comments.length
              }`}</FontAwesome.Button>
            </Block>
          </Block>
        </Block>
      </Block>
    );
  };

  return <>{render()}</>;
}

PostCard.propTypes = {
  item: PropTypes.object,
  horizontal: PropTypes.bool,
  full: PropTypes.bool,
  ctaColor: PropTypes.string,
  imageStyle: PropTypes.any,
  ctaRight: PropTypes.bool,
};

const styles = StyleSheet.create({
  video: {
    alignSelf: "center",
    width: 355,
    height: 200,
  },
  card: {
    backgroundColor: "#30444E",
    marginVertical: -3,
    borderWidth: 0,
    minHeight: 114,
    marginBottom: 8,
    borderRadius: 0,
  },
  cardButtons: {
    backgroundColor: "#30444E",
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
  dots: {
    marginTop: 4,
    marginRight: 4,
  },
});

export default withNavigation(PostCard);
