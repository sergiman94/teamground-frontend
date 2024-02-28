import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  Text,
  TouchableWithoutFeedback,
  View,
  TextInput,
  TouchableHighlight,
  Modal,
  Pressable
} from "react-native";
import { Block, theme, Input, Button } from "galio-framework";
import * as Progress from "react-native-progress";
import SnackBar from "react-native-snackbar-component";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  BASE_BUCKET,
  BASE_TEAM_PICS,
  TEAMS_URL,
  uploadImgToS3,
  USERS_URL,
} from "../../utils/utils.";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import ProfileTeamCoachMiniature from "../../components/ProfileTeamCoachMiniature";
import { Icon } from "../../components";
import { Images } from "../../constants";
import * as ImageManipulator from 'expo-image-manipulator';
const { width } = Dimensions.get("screen");
const cardWidth = width - theme.SIZES.BASE * 2;

export default function EditMyTeam(props) {
  const { navigation, route } = props;
  const [team, setTeam] = useState(route.params ? route.params?.team : null);
  const [user, setUser] = useState(null);
  const [media, setMedia] = useState(route.params && route.params.team ? route.params?.team.media : []);
  const [teamName, setTeamName] = useState(route.params && route.params.team ? route.params?.team.name : null);
  const [teamAddress, setTeamAddress] = useState(route.params && route.params.team ? route.params?.team.address : null);
  const [teamCity, setTeamCity] = useState(route.params && route.params.team ? route.params?.team.location : null);
  const [teamDescription, setTeamDescription] = useState(route.params && route.params.team ? route.params?.team.description : null);
  const [teamImage, setTeamImage] = useState(route.params && route.params.team ? route.params?.team.image : null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [progressBar, setProgressBar] = useState(false);
  const [snackbarColor, setSnackbarColor] = useState("#93C46F");
  const [snackbarMessage, setSnackbarMessage] = useState(
    "this is a test message"
  );
  const [buttonLoading, setButtonLoading] = useState(false);
  const [showCreateButton, setShowCreateButton] = useState(false);
  const [modalVisible, setModalVisible] = useState(false)

  const loadUser = async () => {
    let userId = await AsyncStorage.getItem("@user_id");
    let userData = await axios
      .get(`${USERS_URL}/${userId}`)
      .then((response) => response.data.data);
    setUser(userData);
  }

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
                        onPress={() => handleDeleteTeamImageButton(item, index)}
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
    // OPEN LIBRARY IN DEVICE - No permissions request if necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0,
    });

    if (!result.cancelled) {
      const manipResult = await ImageManipulator.manipulateAsync(
        result.uri,
        [{ resize: { width: 400, height: 400 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      setTeamImage(manipResult.uri);
      setProgressBar(false);
    } else {
      setProgressBar(false);
    }
  };

  const handleDeleteTeamImageButton = async (image) => { 
    let filteredMedia = media.filter(item => item !== image)
    setMedia(filteredMedia)
  }

  // converts from uri to blob
  const fetchImageFromUri = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob;
  };
  
  const handleUpdateButton = async () => { 
    setModalVisible(false)
    setProgressBar(true)
    setButtonLoading(true)

    let body = {
      name: teamName,
      image: teamImage,
      description: teamDescription,
      location: teamCity,
      address: teamAddress,
      media: media
    }

    // verify if new team image has been changed, if so, upload and then get the new uri location
    const newTeamImage = !String(teamImage).includes("https://")
    if (newTeamImage) {
      let mediaElementCvtd = await fetchImageFromUri(teamImage);
      let mediaElementParams = {
        Body: mediaElementCvtd,
        Bucket: BASE_BUCKET,
        Key: `${BASE_TEAM_PICS}/${team.key}/${uuidv4()}.png`,
        ContentType: mediaElementCvtd.type,
      };
      let newLocation = await uploadImgToS3(mediaElementParams).then((response) => response)

      // set new image uri to the body (team image attribute)
      body.image = newLocation
    }
    
    // verify if new team images has been added, if so, upload them and then get the new uri location for each
    const newMediaImages = media.filter(image => !String(image).includes("https://"))
    if (newMediaImages.length) {
      let mediaUploads = [];
      for (let i = 0; i < newMediaImages.length; i++) {
        let mediaElement = newMediaImages[i];
        let mediaElementCvtd = await fetchImageFromUri(mediaElement);
        let mediaElementParams = {
          Body: mediaElementCvtd,
          Bucket: BASE_BUCKET,
          Key: `${BASE_TEAM_PICS}/${team.key}/${uuidv4()}.png`,
          ContentType: mediaElementCvtd.type,
        };

        mediaUploads.push(uploadImgToS3(mediaElementParams));
      }
      let mediaLocations = (await Promise.allSettled(mediaUploads)).flatMap(
        (result) => (result.value ? result.value : null)
      );

      // set new images uri's to the body (media attribute)
      let mediaFiltered = [...body.media].filter(image => String(image).includes("https://"))
      body.media = [...mediaFiltered, ...mediaLocations]
    }
    
    // update team with new changes in db
    await axios
      .put(`${TEAMS_URL}/${team.key}`, body)
      .then(() => {
        setProgressBar(false);
        setShowSnackbar(true);
        setSnackbarMessage("Tu equipo se ha actualizado");
        setTimeout(() => {
          setShowSnackbar(false);
          navigation.navigate("MyTeam", {reload: true})
        }, 1200);
      })
      .catch((e) => {
        setProgressBar(false);
        setShowSnackbar(true);
        setSnackbarColor("#BB6556");
        setSnackbarMessage("No se pudo actualizar tu equipo");
        setTimeout(() => {
          setShowSnackbar(false);
        }, 1200);
      });

    setProgressBar(false)
    setButtonLoading(false)
  }

  useEffect(() => {
    loadUser()
  }, [])

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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.products}
      >
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

          {/* action confirmation modal */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(!modalVisible);
            }}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text style={styles.modalText}>
                  Confirmar cambios realizados{" "}
                </Text>
                <Pressable
                  style={[styles.confirmButton]}
                  onPress={() => handleUpdateButton()}
                >
                  <Text style={styles.textStyle}>Confirmar</Text>
                </Pressable>
                <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => setModalVisible(!modalVisible)}
                >
                  <Text style={styles.textStyle}>Cancelar</Text>
                </Pressable>
              </View>
            </View>
          </Modal>

          {/* update button (to show modal) */}
          <Button
            style={{ width: 80, height: 30, marginLeft: "auto" }}
            textStyle={{ fontFamily: "open-sans-bold", fontSize: 10 }}
            small
            loading={buttonLoading}
            onPress={() => setModalVisible(true)}
            color={"success"}
            shadowless
          >
            {"Actualizar"}
          </Button>

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
                  component: "EditMyTeam",
                })
              }
              shadowless
            >
              {"Subir Imagenes"}
            </Button>
          </Block>

          {/* team media */}
          {renderCards()}
        </>
      </ScrollView>
    );
  };

  return (
    <Block flex center style={styles.deals}>
      {render()}
    </Block>
  );
}

const styles = StyleSheet.create({
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
    width: "100%",
    color: "#ffffff",
    fontFamily: "open-sans-bold",
    fontSize: 12,
    backgroundColor: "#30444E",
  },
  cardSubTitle2: {
    width: "87%",
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
    backgroundColor: "#30444E",
  },
  textArea: {
    color: "#ffffff",
    height: 80,
    justifyContent: "flex-start",
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
    alignItems: "center",
    backgroundColor: "#30444E",
    height: 32,
    top: 4,
    padding: 8,
    borderRadius: 4,
    width: 112,
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
    backgroundColor: "red",
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

  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: '#30444E',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  confirmButton: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    backgroundColor: "#3DD598"
  }, 
  buttonClose: {
    marginTop: 12,
    backgroundColor: '#FF565E',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    fontFamily: "open-sans-bold",
    fontSize: 16,
    color: theme.COLORS.WHITE,
    marginBottom: 15,
    textAlign: 'center',
  },
});
