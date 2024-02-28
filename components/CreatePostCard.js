import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  StyleSheet,
  Image,
  TouchableWithoutFeedback,
  TextInput,
  View,
  Dimensions,
} from "react-native";
import { Block, theme, Button } from "galio-framework";
import * as Progress from "react-native-progress";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImageManipulator from 'expo-image-manipulator';
import axios from "axios";
import {
  BASE_POST_PICS,
  POSTS_URL,
  USERS_URL,
  uploadImgToS3,
} from "../utils/utils.";
const { width } = Dimensions.get("screen");
import * as ImagePicker from "expo-image-picker";
import { v4 as uuidv4 } from "uuid";
import {
  Video,
  Audio,
} from "expo-av";
const triggerAudio = async (ref) => {
  await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
  ref.current.playAsync();
};
export default function CreatePostCard(props) {
  const {
    navigation,
    horizontal,
    style,
  } = props;

  const cardContainer = [styles.card, style];
  const [textAreaValue, setTextAreaValue] = useState("");
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [userImage, setUserImage] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [imageLocation, setImageLocation] = useState(null);
  const [mediaType, setMediaType] = useState("image");
  let video = React.useRef({});
  const [status, setStatus] = React.useState({});
  const [buttonLoading, setButtonLoading] = React.useState(false)

  const loadCurrentUser = async () => {
    let currentUserID = await AsyncStorage.getItem("@user_id");
    let currentUserData = (await axios.get(`${USERS_URL}/${currentUserID}`)).data;
    setCurrentUser(currentUserData);
  };

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (status.isPlaying) triggerAudio(video);
  }, [video, status.isPlaying]);

  const pickImage = async () => {
    setShowProgressBar(true);

    // OPEN LIBRARY IN DEVICE - No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.2,
    });

    if (!result.cancelled) {
      const manipResult = await ImageManipulator.manipulateAsync(
        result.uri,
        [{ resize: { width: 400, height: 400 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      setMediaType(manipResult.type);
      setUserImage(manipResult.uri);
      setShowProgressBar(false);
    } else {
      setShowProgressBar(false);
    }
  };

  const fetchImageFromUri = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob;
  };

  const handleCreatePostButton = async () => {
    setShowProgressBar(true);
    setButtonLoading(true)

    if (textAreaValue.length === 0 && !userImage) {
      setShowProgressBar(false)
      setButtonLoading(false)
      return
    }

    let currentUserID = await AsyncStorage.getItem("@user_id");
    let currentUser = (await axios.get(`${USERS_URL}/${currentUserID}`)).data;

    let body = {
      description: textAreaValue,
      image: imageLocation,
      userImage: currentUser.data.image,
      name: currentUser.data.displayName,
      username: currentUser.data.username,
      owner: currentUser.data.key,
    };

    if (userImage) {
      let img = await fetchImageFromUri(userImage);
      let params = {
        Body: img,
        Bucket: "nnproject",
        Key: mediaType === 'video' ? `${BASE_POST_PICS}/${currentUser.data.key}/${uuidv4()}.mov` :`${BASE_POST_PICS}/${currentUser.data.key}/${uuidv4()}.png`,
        ContentType: img.type,
      };

      // UPLOAD S3
      await uploadImgToS3(params)
        .then((location) => {
          if (mediaType === 'video') {
            body.video = location
          } else {
            body.image = location
          }
          setShowProgressBar(false);
          setButtonLoading(false);
        })
        .catch((error) => {
          setShowProgressBar(false);
          setButtonLoading(false);
          console.log(error);
        });
    }

    // TODO: come up with a plan of how to use sockets for publish post
    // var socket = io(BASE_SOCKET_LOCAL_URL, {
    //   reconnection: false,
    //   timeout: 5000,
    // });
    // socket.on("connect", () => {
    //   socket.emit("createPost", body);
    //   socket.on("createPostResponse", (data) => {
    //     setShowProgressBar(false);
    //     setButtonLoading(false);
    //     props.myProps("posted");
    //   });
    // });

    await axios.post(`${POSTS_URL}`, body).then(() => {
      setShowProgressBar(false);
      setButtonLoading(false);
      props.myProps("posted");
    });

  };

  const handleDeleteImageButton = async () => {
    setUserImage(null);
  };

  return (
    <>
      <Block row={horizontal} card flex style={cardContainer}>
        {showProgressBar ? (
          <Progress.Bar width={width - 30} indeterminate={true} />
        ) : (
          <></>
        )}

        {/* header (description) */}
        <Block space="between" style={styles.cardHeader}>
          <View style={styles.textAreaContainer}>
            <TextInput
              style={styles.textArea}
              underlineColorAndroid="transparent"
              placeholder="¿ En que estás pensando ?"
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
            <Block style={styles.pictureButton}>
              <FontAwesome.Button
                disabled={userImage ? true : false}
                name="image"
                color={userImage ? "#96A7AF" : "#40DF9F"}
                textColor="black"
                size={24}
                borderRadius="5"
                backgroundColor="#30444E"
                onPress={() => pickImage()}
              />
            </Block>

            <Block style={styles.cardButtons}>
              <Button
                loading={buttonLoading}
                small
                textStyle={styles.optionsButtonText}
                style={styles.optionsButton}
                onPress={() => handleCreatePostButton(textAreaValue)}
              >
                Publicar
              </Button>
            </Block>
          </Block>
        </Block>
      </Block>

      {/* preview media */}
      {userImage ? (
        <Block flex style={styles.verticalStyles}>
          {mediaType === "video" ? (
            <Block style={{ padding: 0 }}>
              <Video
                ref={video}
                style={styles.video}
                source={{ uri: userImage }}
                volume={1.0}
                isMuted={true}
                shouldPlay={true}
                useNativeControls
                resizeMode="contain"
                isLooping
                onPlaybackStatusUpdate={(status) => setStatus(() => status)}
              />

              <Button
                small
                textStyle={styles.deleteVideoButtonText}
                style={styles.deleteVideoButton}
                onPress={() => handleDeleteImageButton()}
              >
                x
              </Button>
            </Block>
          ) : (
            <TouchableWithoutFeedback
              onPress={() =>
                navigation.navigate("Picture", {
                  images: [userImage],
                  index: 0,
                })
              }
            >
              <Block style={{ padding: 10 }}>
                <Image
                  source={{
                    uri: userImage,
                  }}
                  style={styles.horizontalImage}
                />

                <Button
                  small
                  textStyle={styles.deleteButtonText}
                  style={styles.deleteButton}
                  onPress={() => handleDeleteImageButton()}
                >
                  x
                </Button>
              </Block>
            </TouchableWithoutFeedback>
          )}
        </Block>
      ) : (
        <></>
      )}
    </>
  );
}

CreatePostCard.propTypes = {
  item: PropTypes.object,
  horizontal: PropTypes.bool,
  full: PropTypes.bool,
  ctaColor: PropTypes.string,
  imageStyle: PropTypes.any,
  ctaRight: PropTypes.bool,
};

const styles = StyleSheet.create({
  card: {
    //backgroundColor: theme.COLORS.WHITE,
    backgroundColor: "#30444E",
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
  cardButtons: {},
  cardTitle: {
    marginTop: 10,
    paddingBottom: 6,
  },
  cardDescription: {
    padding: theme.SIZES.BASE / 2,
  },
  pictureButton: {
    marginTop: 4,
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
    borderRadius: 8,
    height: 200,
    width: "auto",
  },
  video: {
    alignSelf: 'center',
    width: 325,
    height: 200,
  },
  horizontalStyles: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  verticalStyles: {
    marginTop: 12,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
  },
  fullImage: {
    height: 215,
  },
  textArea: {
    height: 150,
    justifyContent: "flex-start",
    color: "#ffffff",
    fontSize: 18
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
    backgroundColor: "#286053",
    paddingHorizontal: theme.SIZES.BASE,
    paddingVertical: 10,
    borderRadius: 3,
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 1,
    marginLeft: 200,
  },
  deleteButtonText: {
    fontFamily: "open-sans-bold",
    fontSize: 16,
    color: theme.COLORS.WHITE,
    fontWeight: "normal",
    fontStyle: "normal",
    letterSpacing: -0.29,
  },
  deleteButton: {
    display: "absolute",
    width: 28,
    height: 28,
    borderRadius: 28 / 2,
    left: 305,
    bottom: 220,
    backgroundColor: "#30444E"
  },
  deleteVideoButtonText: {
    fontFamily: "open-sans-bold",
    fontSize: 16,
    color: theme.COLORS.WHITE,
    fontWeight: "normal",
    fontStyle: "normal",
    letterSpacing: -0.29,
  },
  deleteVideoButton: {
    display: "absolute",
    width: 28,
    height: 28,
    borderRadius: 28 / 2,
    left: 315,
    bottom: 220,
    backgroundColor: "#30444E"
  },
});
