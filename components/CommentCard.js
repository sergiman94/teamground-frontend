import React from "react";
import { withNavigation } from '@react-navigation/compat';
import PropTypes from "prop-types";
import {
  StyleSheet,
  Image,
  TouchableWithoutFeedback
} from "react-native";
import { Block, Text, theme } from "galio-framework";
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { argonTheme } from "../constants";
import PlayerAvatar from "./PlayerAvatar";
import ProfileMiniature from "./ProfileMiniature";
import axios from "axios";
import { POSTS_URL } from "../utils/utils.";
import AsyncStorage from "@react-native-async-storage/async-storage";

class PostCard extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      userId: ""
    }
  }

  async componentDidMount() {
    let userId = await AsyncStorage.getItem("@user_id")
    this.setState({userId: userId})
  }

  handleLikeButton = async (item) => {
    let userId = await AsyncStorage.getItem("@user_id")

    await axios.put(`${POSTS_URL}/like/${item.key}`, {userId: userId}).then(response => {
      console.log('like added')
    }).catch(error => {
      console.log('error adding like')
    })

  } 

  handleCommnetButton = (item) => {
    const {navigation} = this.props
    navigation.navigate("PostDescription", { product: item })
  }

  render() {
    const {
      navigation,
      item,
      horizontal,
      full,
      style,
      ctaColor,
      imageStyle,
      ctaRight
    } = this.props;

    const imageStyles = [
      full ? styles.fullImage : styles.horizontalImage,
      imageStyle
    ];
    const cardContainer = [styles.card, style];
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
            <Block>
              <ProfileMiniature item={item} />
            </Block>

            {/* description */}
            <Block>
              <Text
                // style={{ fontFamily: "open-sans-regular" }}
                size={14}
                style={styles.cardTitle}
                color={argonTheme.COLORS.WHITE}
              >
                {item.description}
              </Text>
            </Block>
          </Block>
        </TouchableWithoutFeedback>

        {/* image */}
        {item.image ? (
          <TouchableWithoutFeedback
            onPress={() => navigation.navigate("Product", { product: item })}
          >
            <Block flex style={imgContainer}>
              <Image source={{ uri: item.image }} style={imageStyles} />
            </Block>
          </TouchableWithoutFeedback>
        ) : (
          <></>
        )}

        {/* buttons */}
        <TouchableWithoutFeedback
          onPress={() => navigation.navigate("Product", { product: item })}
        >
          <Block space="between" style={styles.cardDescription}>
            {/* buttons */}
            <Block flex row>
              <Block style={styles.cardButtons}>
                <FontAwesome.Button
                  name="heart"
                  color={item.likes.filter(value => value === this.state.userId).length > 0 ? "#FF565E" : "#96A7AF"}
                  textColor="black"
                  size={20}
                  borderRadius="5"
                  backgroundColor="#30444E"
                  onPress={() => this.handleLikeButton(item)}
                >{`${item.likes.length === 0 ? "" : item.likes.length}`}</FontAwesome.Button>
              </Block>
              <Block style={styles.cardButtons}>
                <FontAwesome.Button
                  name="comment"
                  size={20}
                  color="#96A7AF"
                  borderRadius="5"
                  backgroundColor="#30444E"
                >{`${item.comments.length === 0 ? "" : item.comments.length}`}</FontAwesome.Button>
              </Block>
            </Block>
          </Block>
        </TouchableWithoutFeedback>

        {/* comments */}
        {item.comments.map((comment) => (
          <>
            {/* header */}
            <Block space="between" style={styles.cardComment}>
              {/* avatar view */}
              <Block>
                <ProfileMiniature item={comment} />
              </Block>

              {/* description */}
              <Block>
                <Text
                  // style={{ fontFamily: "open-sans-regular" }}
                  size={14}
                  style={styles.cardTitle}
                  color={argonTheme.COLORS.WHITE}
                >
                  {comment.content}
                </Text>
              </Block>
            </Block>
          </>
        ))}
      </Block>
    );
  }
}

PostCard.propTypes = {
  item: PropTypes.object,
  horizontal: PropTypes.bool,
  full: PropTypes.bool,
  ctaColor: PropTypes.string,
  imageStyle: PropTypes.any,
  ctaRight: PropTypes.bool
};

const styles = StyleSheet.create({
  card: {
    //backgroundColor: theme.COLORS.WHITE,
    backgroundColor: '#30444E',
    marginVertical: theme.SIZES.BASE,
    borderWidth: 0,
    minHeight: 114,
    marginBottom: 4,
  },
  cardButtons : {
    // marginLeft: 10,
    // marginBottom: 15
  }, 
  cardTitle: {
    // flex: 1,
    // flexWrap: "wrap",
    marginTop: 10, 
    paddingBottom: 6
  },
  cardDescription: {
    // marginTop: 13,
    padding: theme.SIZES.BASE / 2
  },

  cardHeader: {
    padding: theme.SIZES.BASE / 2
  },

  cardComment: {
    borderTopColor: "#A2D1CC",
    borderTopWidth: 0.2,
    padding: theme.SIZES.BASE / 2
  },
  imageContainer: {
    borderRadius: 3,
    elevation: 1,
    overflow: "hidden"
  },
  image: {
    // borderRadius: 3,
  },
  horizontalImage: {
    height: 122,
    width: "auto"
  },
  horizontalStyles: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0
  },
  verticalStyles: {
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0
  },
  fullImage: {
    height: 215
  }
});

export default withNavigation(PostCard);
