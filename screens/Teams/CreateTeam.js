import React, {useEffect, useState} from "react";
import { StyleSheet, Dimensions, ScrollView, Image, Text, TouchableWithoutFeedback, View, FlatList, TextInput, TouchableHighlight } from "react-native";
import { Block, theme, Button, Input } from "galio-framework";
import {Images } from '../../constants'
import { Icon } from "../../components";
import ProfileTeamCoachMiniature from "../../components/ProfileTeamCoachMiniature";
const { width } = Dimensions.get("screen");
import * as Progress from "react-native-progress";
import SnackBar from "react-native-snackbar-component";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_BUCKET, BASE_TEAM_PICS, TEAMS_URL, uploadImgToS3 } from "../../utils/utils.";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import * as ImageManipulator from 'expo-image-manipulator';
const cardWidth = width - theme.SIZES.BASE * 2;

export default function CreateMyTeam(props) {
  const { navigation, route } = props;
  const [team, setTeam] = useState(route.params?.team)
  const [user, setUser] = useState(route.params?.user)
  const [media, setMedia] = useState([])
  const [teamName, setTeamName] = useState(null)
  const [teamAddress, setTeamAddress] = useState(null)
  const [teamCity, setTeamCity] = useState(null)
  const [teamDescription, setTeamDescription] = useState(null)
  const [teamImage, setTeamImage] = useState(null)
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [progressBar, setProgressBar] = useState(false);
  const [snackbarColor, setSnackbarColor] = useState("#93C46F");
  const [snackbarMessage, setSnackbarMessage] = useState(
    "this is a test message"
  );
  const [buttonLoading, setButtonLoading] = useState(false)
  const [showCreateButton, setShowCreateButton] = useState(false)
 
  const renderCards = () => {
    return (
      <Block flex style={styles.group}>
        <Block flex>
          <Block flex style={{ marginTop: theme.SIZES.BASE / 2 }}>
            <ScrollView
              horizontal={true}
              pagingEnabled={true}
              decelerationRate={0}
              scrollEventThrottle={16}
              snapToAlignment="center"
              showsHorizontalScrollIndicator={false}
              snapToInterval={cardWidth + theme.SIZES.BASE * 0.375}
              contentContainerStyle={{
                paddingHorizontal: 0,
              }}
            >
              {media &&
                media.length > 0 &&
                media.map((item, index) => (
                  <TouchableWithoutFeedback
                    style={{ zIndex: 3 }}
                    key={`product-${Math.random(100)}`}
                    // onPress={() =>
                    //   navigation.navigate("MediaSelection", {images: selectedImages, component:"CreateMyTeam"})
                    // }
                  >
                    <Block center style={styles.productItem}>
                      <Image
                        resizeMode="cover"
                        style={styles.productImage}
                        source={item ? { uri: item } : Images.MatchPlaceholder}
                      />
                      <Button
                        small
                        shadowless
                        onlyIcon
                        loading={buttonLoading}
                        icon="trash"
                        iconFamily="Font-Awesome"
                        iconColor={theme.COLORS.WHITE}
                        iconSize={theme.SIZES.BASE * 1.0}
                        color={'#FF565E'}
                        onPress={() => handleDeleteFieldImageButton(item, index)}
                      />
                    </Block>
                  </TouchableWithoutFeedback>
                ))}
            </ScrollView>
          </Block>
        </Block>
      </Block>
    );
  }

  const pickTeamImage = async () => { 
    setProgressBar(true);
    // OPEN LIBRARY IN DEVICE - No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      const manipResult = await ImageManipulator.manipulateAsync(
        result.uri,
        [{ resize: { width: 400, height: 400 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      setTeamImage(manipResult.uri)
      setProgressBar(false);
    } else {
      setProgressBar(false);
    }
  }

  const handleDeleteFieldImageButton = async (image, index) => {
    let newImageIndex = media.indexOf(image);
    if (newImageIndex > -1) {
      let newImagesArr = media.splice(newImageIndex, 1);
      setMedia(newImagesArr);
    }
  };

  const handleCreateButton = async () => { 
    setProgressBar(true)
    setButtonLoading(true)

    if (!teamName || !teamAddress || !teamCity || !teamDescription || !teamImage || !media.length) { 
      setProgressBar(false);
      setShowSnackbar(true);
      setButtonLoading(false)
      setSnackbarColor("#BB6556");
      setSnackbarMessage("Faltan datos requeridos");
      setTimeout(() => {
        setShowSnackbar(false);
      }, );
    }

    // upload team image to s3
    let convertedTeamImage = await fetchImageFromUri(teamImage)
    let teamImageParams = { 
      Body: convertedTeamImage,
      Bucket: BASE_BUCKET,
      Key: `${BASE_TEAM_PICS}/${uuidv4()}.png`,
      ContentType: convertedTeamImage.type
    }
    let teamImageLocation = await uploadImgToS3(teamImageParams).then((teamImageLocation) => teamImageLocation).catch(()=> null)

    // upload team images(media) to s3
    let mediaUploads = []
    for (let i = 0; i < media.length; i++) {
      let mediaElement = media[i];
      let mediaElementCvtd = await fetchImageFromUri(mediaElement)
      let mediaElementParams = { 
        Body: mediaElementCvtd,
        Bucket: BASE_BUCKET,
        Key: `${BASE_TEAM_PICS}/${uuidv4()}.png`,
        ContentType: mediaElementCvtd.type
      }

      mediaUploads.push(uploadImgToS3(mediaElementParams))
    }
    let mediaLocations = (await Promise.allSettled(mediaUploads)).flatMap(result => result.value ? result.value : null)

    let body = { 
      name: teamName,
      image: teamImageLocation,
      description: teamDescription,
      location: teamCity,
      address: teamAddress,
      coach: await AsyncStorage.getItem("@user_id"),
      rating: 3,
      trainings: [],
      media: mediaLocations
    }


    await axios
      .post(`${TEAMS_URL}`, body)
      .then(() => {
        setProgressBar(false);
        setShowSnackbar(true);
        setButtonLoading(false);
        setSnackbarColor("#93C46F");
        setSnackbarMessage("Equipo Creado Exitosamente");
        setTimeout(() => {
          setShowSnackbar(false);
          navigation.navigate("MyTeam", {reload: true})
        }, 1500);
      })
      .catch(() => {
        setProgressBar(false);
        setShowSnackbar(true);
        setButtonLoading(false);
        setSnackbarColor("#BB6556");
        setSnackbarMessage("No se pudo crear el equipo");
        setTimeout(() => {
          setShowSnackbar(false);
        });
      });
  }

  const fetchImageFromUri = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob;
  };

  useEffect(() => {
    if (route.params.selectedImages) {
      setMedia(route.params.selectedImages)
    }

    if (teamName && teamAddress && teamCity && teamDescription && teamImage && media.length) {
      setShowCreateButton(true)
    } else {
      setShowCreateButton(false)
    }
  })

  const render = () => {
    return (
      <>
        {progressBar ? (
          <Progress.Bar
            width={width - theme.SIZES.BASE * 3}
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.products}
        >
          <>
            {/* header and basic info */}
            <Block flex row style={styles.container}>
              {/* team image */}
              <Block flex style={styles.cardDescription}>
                <TouchableHighlight onPress={pickTeamImage}>
                  <Image
                    source={
                      teamImage ? { uri: teamImage } : Images.MatchPlaceholder
                    }
                    style={styles.horizontalImage}
                  />
                </TouchableHighlight>
              </Block>
              {/* name and location */}
              <Block style={{ flex: 2 }}>
                {/* name */}
                <Input
                  borderless
                  style={styles.cardTitle}
                  color={"#FFFFFF"}
                  value={teamName ? teamName : ""}
                  family={"open-sans-bold"}
                  placeholder="Nombre de tu equipo"
                  placeholderTextColor="#96A7AF"
                  onChangeText={(value) => setTeamName(value)}
                />
                {/* location and address */}
                <Block flex row style={{ marginTop: 8 }}>
                  <Input
                    borderless
                    style={styles.cardSubTitle1}
                    color={"#FFFFFF"}
                    value={teamAddress ? teamAddress : ""}
                    family={"open-sans-bold"}
                    placeholder="Direccion"
                    placeholderTextColor="#96A7AF"
                    onChangeText={(value) => setTeamAddress(value)}
                  />
                  <Input
                    borderless
                    style={styles.cardSubTitle2}
                    color={"#FFFFFF"}
                    value={teamCity ? teamCity : ""}
                    family={"open-sans-bold"}
                    placeholder="Ciudad"
                    placeholderTextColor="#96A7AF"
                    onChangeText={(value) => setTeamCity(value)}
                  />
                </Block>
              </Block>
            </Block>

            {/* team description */}
            <View style={styles.textAreaContainer}>
              <TextInput
                style={styles.textArea}
                underlineColorAndroid="transparent"
                placeholder="Escribe la descripcion de tu equipo"
                placeholderTextColor="#96A7AF"
                numberOfLines={5}
                multiline={true}
                value={teamDescription ? teamDescription : ""}
                onChangeText={(value) => setTeamDescription(value)}
              />
            </View>

            {/* go to team trainings */}
            <TouchableWithoutFeedback
              style={styles.goToTrainings}
              onPress={() => navigation.navigate("Trainings", { team: team })}
            >
              <Block flex row style={styles.goToTrainingsContainer}>
                <Text
                  style={{
                    fontFamily: "open-sans-bold",
                    fontSize: 10,
                    color: "#FFFFFF",
                  }}
                  small
                  color={"#30444E"}
                  shadowless
                >
                  {"Entrenamientos"}
                </Text>
                <Icon
                  name="external-link-square"
                  style={{
                    fontFamily: "open-sans-bold",
                    color: "#FFFFFF",
                    left: 8,
                  }}
                  family="Font-Awesome"
                  size={12}
                  color={"#FFFFFF"}
                />
              </Block>
            </TouchableWithoutFeedback>

            {/* coach info */}
            <Block style={{ marginTop: 8 }}>
              <ProfileTeamCoachMiniature item={user} />
            </Block>

            {/* upload media button */}
            <Block style={{ alignItems: "left", marginTop: 2, right: 8 }}>
              <Button
                loading={buttonLoading}
                icon="upload"
                iconFamily="Font-Awesome"
                iconColor={theme.COLORS.WHITE}
                iconSize={theme.SIZES.BASE * 1.0}
                style={{ width: width - 300, height: 40 }}
                textStyle={{ fontFamily: "open-sans-bold", fontSize: 10 }}
                color={"success"}
                onPress={() =>
                  navigation.navigate("MediaMultipleSelection", {
                    images: media,
                    component: "CreateMyTeam",
                  })
                }
                shadowless
              >
                {"Subir Imagenes"}
              </Button>
            </Block>

            {/* team media */}
            {renderCards()}

            {/* create button */}
            {showCreateButton ? (
              <>
                <Block style={{ alignItems: "center", marginTop: 32 }}>
                  <Button
                    style={{ width: width - 100, height: 40 }}
                    textStyle={{ fontFamily: "open-sans-bold", fontSize: 10 }}
                    color={"success"}
                    shadowless
                    onPress={handleCreateButton}
                    loading={buttonLoading}
                  >
                    {"Crear Equipo"}
                  </Button>
                </Block>
              </>
            ) : (
              <></>
            )}
          </>
        </ScrollView>
      </>
    );
  };

  return (
    <Block flex center style={styles.deals}>
      {render()}
    </Block>
  );
}

const styles = StyleSheet.create({
  container: {
    
  },
  deals: {
    width,
    backgroundColor: "#22343C",
  },
  products: {
    width: width - theme.SIZES.BASE * 2,
    paddingVertical: theme.SIZES.BASE,
  },
  cardDescription: {
    flex: 0.5,
    padding: 5,
  },
  horizontalImage: {
    width: 100,
    height: 100,
    top: 8,
    left: 8,
    borderRadius: 13,
  },
  cardTitle: {
    color: "#ffffff",
    fontFamily: "open-sans-bold",
    fontSize: 24,
    top: 12,
    backgroundColor: "#30444E",
  },
  cardDescription: {
    color: "#ffffff",
    fontFamily: "open-sans-regular",
    fontSize: 14,
    marginVertical: 12,
  },
  cardAddress: {
    color: "#96A7AF",
    fontFamily: "open-sans-regular",
    fontSize: 12,
    left: 4,
    top: 24,
  },
  cardLocation: {
    color: "#96A7AF",
    fontFamily: "open-sans-regular",
    fontSize: 12,
    left: 4,
    top: 24,
  },
  cardSubTitle1: {
    width: '100%', 
    color: "#ffffff",
    fontFamily: "open-sans-bold",
    fontSize: 12,
    backgroundColor: "#30444E",
  },
  cardSubTitle2: {
    width: '87%', 
    color: "#ffffff",
    fontFamily: "open-sans-bold",
    fontSize: 12,
    backgroundColor: "#30444E",
  },
  textAreaContainer: {
    padding: 8,
    // marginTop: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: "#30444E"
  },
  textArea: {
    color:"#ffffff", 
    height: 80,
    justifyContent: "flex-start"
  },
  group: {
    paddingTop: theme.SIZES.BASE,
  },
  productImage: {
    width: cardWidth - 200,
    height: 250,
    borderRadius: 20,
  },
  goToTrainings: {
    flex: 1,
    width: 100,
    height: 40,
    padding: 8,
    right: 4,
  },
  goToTrainingsContainer: { 
    alignItems: 'center',
    backgroundColor: '#30444E',
    height: 32,
    top: 4, 
    padding: 8, 
    borderRadius: 4, 
    width: 112
  }, 
  membersTextTitle: {
    marginBottom: 15,
    fontFamily: "open-sans-bold",
    marginHorizontal: 12,
    marginTop: 8,
    color: "#ffffff",
    fontSize: 20,
  },
  membersListTitle: {
    marginBottom: 15,
    marginLeft: 16,
    fontFamily: "open-sans-bold",
    color: "#ffffff",
    fontSize: 12,
  },
  productItem: {
    width: cardWidth - theme.SIZES.BASE * 5,
    marginRight: -100,
    right: 64,
  },
  deleteButton: {
    backgroundColor: "red"
    // backgroundColor: "#FF565E", 
    // display: "absolute",
    // width: 28,
    // height: 28,
    // borderRadius: 28 / 2,
    // left: 100,
    // bottom: 40,
  },
  deleteButtonText: {
    fontFamily: "open-sans-bold",
    fontSize: 16,
    color: theme.COLORS.WHITE,
    fontWeight: "normal",
    fontStyle: "normal",
    letterSpacing: -0.29,
  },
  membersContainer: {
    width: "100%",
    borderWidth: 0,
    marginVertical: theme.SIZES.BASE * 1.5,
    backgroundColor: "#30444E",
    padding: 12,
    borderRadius: 12,
  },
  memberImage: {
    width: 50,
    height: 50,
    borderRadius: 50 / 2,
    top: 8,
    left: 16,
    padding: 12,
    marginBottom: 20,
  },
  gridContainer: {
    padding: 4,
    flex: 1,
  },
});
