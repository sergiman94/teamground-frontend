import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  TouchableWithoutFeedback,
  TouchableHighlight,
} from "react-native";
import { Block, theme, Text } from "galio-framework";
import { Button } from "../../components";
import { argonTheme, Images } from "../../constants";
import axios from "axios";
import { BASE_FIELD_PICS, FIELDS_URL, uploadImgToS3, USERS_URL } from "../../utils/utils.";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Progress from "react-native-progress";
import SnackBar from "react-native-snackbar-component";
const { width } = Dimensions.get("screen");
const thumbMeasure = (width - 48 - 32) / 3;

export default function FieldProfile(props) {
  const { navigation, route } = props;
  const [userImage, setUserImage] = useState(null)
  const [prevUserImage, setPrevUserImage] = useState(null)
  const [profileData, setProfileData] = useState(null)
  const [fieldData, setFieldData] = useState(null)
  const [fieldImages, setFieldImages] = useState([])
  const [prevFieldData, setPrevFieldData] = useState(null)
  const [prevProfileData, setPrevProfileData] = useState(null)
  const [prevFieldImages, setPrevFieldImages] = useState(null)
  const [fieldName, setFieldName] = useState(null)
  const [fieldAddress, setFieldAddress] = useState(null)
  const [fieldDescription, setFieldDescription] = useState(null)
  const [fieldFullDescription, setFieldFullDescription] = useState(null)
  const [newImages, setNewImages] = useState(null)
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [progressBar, setProgressBar] = useState(false);
  const [snackbarColor, setSnackbarColor] = useState("#93C46F");
  const [snackbarMessage, setSnackbarMessage] = useState(
    "this is a test message"
  );
  const [selectedImages, setSelectedImages] = useState([])
  const [reload, setReload] = useState(route.params ? route.params.reload : false)

  useEffect(() => {
    if (route.params) {
      if (route.params.reload) {
        getData()
      }
    }
  })

  useEffect(() => {
    getData()
  }, [])

  useEffect(() => {
    getData()
  }, [reload])

  const getData = async () => {
    if (route.params) delete route.params.reload
    let userId = await AsyncStorage.getItem('@user_id')
    let fieldId = await AsyncStorage.getItem('@field_id')
    let profile = (await axios.get(`${USERS_URL}/${userId}`)).data
    let field = (await axios.get(`${FIELDS_URL}/${fieldId}`)).data

    // set data
    setProfileData(profile.data)
    setFieldData(field.data)
    setFieldImages(field.data.fieldImages)

    setFieldName(field.data.field)
    setFieldAddress(field.data.address)
    setFieldDescription(field.data.description)
    setFieldFullDescription(field.data.fullDescription)

    // for reset purposes 
    setPrevProfileData(profile.data)
    setPrevFieldData(field.data)
    setPrevFieldImages(field.data.fieldImages)
    
    
    if (profile) {
      setUserImage(profile.data.image)
      setPrevUserImage(profile.data.image)
    }
  }

  const handleUpdateButton = async () => {
    navigation.navigate("EditFieldProfile")
  }

  const renderArticles = () => {
    return (
      <>
        {progressBar ? (
          <Progress.Bar
            //style={{ marginTop: 80 }}
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
          contentContainerStyle={styles.articles}
        >
          <Block
            style={{
              paddingHorizontal: theme.SIZES.BASE,
              paddingTop: theme.SIZES.BASE * 2,
            }}
          >
            {/* LOGO */}
            <>
              <Block row>
                <Text
                  style={{ marginBottom: 24, fontFamily: "open-sans-bold" }}
                  size={20}
                  color={argonTheme.COLORS.WHITE}
                >
                  Logo
                </Text>

                <Button
                  color="primary"
                  small
                  style={styles.resetButton}
                  onPress={handleUpdateButton}
                >
                  <Text
                    style={{ fontFamily: "open-sans-bold", padding: 4 }}
                    size={12}
                    color={argonTheme.COLORS.WHITE}
                  >
                    Editar Perfil
                  </Text>
                </Button>
              </Block>

              <Text
                style={{ marginBottom: 20, fontFamily: "open-sans-regular" }}
                size={14}
                color={argonTheme.COLORS.WHITE}
              >
                Este es tu logo actual, puedes cambiarlo oprimiendo el botón
                'Editar Perfil'
              </Text>

              <Block middle style={styles.avatarContainer}>
                <>
                  <TouchableHighlight>
                    <Image
                      source={
                        userImage ? { uri: userImage } : Images.ProfilePicture
                      }
                      style={styles.avatar}
                    />
                  </TouchableHighlight>
                </>
              </Block>
            </>

            {/* BASIC INFO */}
            <>
              <Text
                style={{ marginBottom: 18, fontFamily: "open-sans-bold" }}
                size={20}
                color={argonTheme.COLORS.WHITE}
              >
                Informacion Principal
              </Text>

              <Text
                style={{ marginBottom: 4, fontFamily: "open-sans-bold" }}
                size={16}
                color={argonTheme.COLORS.WHITE}
              >
                Usuario
              </Text>

              <Text
                style={{ marginBottom: 4, fontFamily: "open-sans-regular" }}
                size={14}
                color={"#96A7AF"}
              >
                {profileData
                  ? `@${profileData.username}`
                  : "can't get username"}
              </Text>

              {/* Display Name */}
              <>
                <Text
                  style={{ marginTop: 8, fontFamily: "open-sans-bold" }}
                  size={16}
                  color={argonTheme.COLORS.WHITE}
                >
                  Nombre para mostrar
                </Text>

                <Block
                  width={width * 0.8}
                  style={{ fontFamily: "open-sans-regular" }}
                >
                  <Text
                    style={{ marginTop: 8, fontFamily: "open-sans-regular" }}
                    size={16}
                    color={argonTheme.COLORS.WHITE}
                  >
                    {fieldName ? fieldName : ""}
                  </Text>
                </Block>
              </>

              {/* Field Address */}
              <>
                <Text
                  style={{ marginTop: 8, fontFamily: "open-sans-bold" }}
                  size={16}
                  color={argonTheme.COLORS.WHITE}
                >
                  Dirección
                </Text>

                <Block width={width * 0.8} style={{ marginBottom: 8 }}>
                  <Text
                    style={{ marginTop: 8, fontFamily: "open-sans-regular" }}
                    size={16}
                    color={argonTheme.COLORS.WHITE}
                  >
                    {fieldAddress ? fieldAddress : ""}
                  </Text>
                </Block>
              </>

              {/* Field Short Description */}
              <>
                <Text
                  style={{ marginTop: 8, fontFamily: "open-sans-bold" }}
                  size={16}
                  color={argonTheme.COLORS.WHITE}
                >
                  Descripción Corta
                </Text>

                <Block width={width * 0.8} style={{ marginBottom: 8 }}>
                  <Text
                    style={{ marginTop: 8, fontFamily: "open-sans-regular" }}
                    size={16}
                    color={argonTheme.COLORS.WHITE}
                  >
                    {fieldDescription ? fieldDescription : ""}
                  </Text>
                </Block>
              </>

              {/* Field Long Description */}
              <>
                <Text
                  style={{ marginTop: 8, fontFamily: "open-sans-bold" }}
                  size={16}
                  color={argonTheme.COLORS.WHITE}
                >
                  Descripción Completa
                </Text>

                <Text
                  style={{
                    marginBottom: 24,
                    marginTop: 8,
                    fontFamily: "open-sans-regular",
                  }}
                  size={16}
                  color={argonTheme.COLORS.WHITE}
                >
                  {fieldFullDescription ? fieldFullDescription : ""}
                </Text>
              </>
            </>

            {/* MULTIMEDIA */}
            <>
              <Text
                style={{ marginBottom: 24, fontFamily: "open-sans-bold" }}
                size={20}
                color={argonTheme.COLORS.WHITE}
              >
                Multimedia
              </Text>

              <Text
                style={{ marginBottom: 20, fontFamily: "open-sans-regular" }}
                size={14}
                color={argonTheme.COLORS.WHITE}
              >
                Aqui gestionas tu contenido multimedia que se muestra a los
                usuario, puedes subir nuevas imagenes o eliminar existentes
              </Text>

              <Block
                flex
                style={[styles.group, { paddingBottom: theme.SIZES.BASE * 2 }]}
              >
                <Block style={{ marginHorizontal: theme.SIZES.BASE * 1 }}>
                  <Block
                    row
                    space="between"
                    style={{ marginTop: theme.SIZES.BASE, flexWrap: "wrap" }}
                  >
                    {fieldImages &&
                      fieldImages.map((img, index) => (
                        <TouchableWithoutFeedback
                          style={{ zIndex: 3 }}
                          //key={`product-${item.title}`}
                          onPress={() =>
                            navigation.navigate("Picture", {
                              images: [img],
                              index: 0,
                            })
                          }
                        >
                          <Block key={`viewed-${img}`} style={styles.shadow}>
                            <Image
                              resizeMode="cover"
                              source={{ uri: img }}
                              style={styles.albumThumb}
                            />
                          </Block>
                        </TouchableWithoutFeedback>
                      ))}
                  </Block>
                </Block>
              </Block>
            </>
          </Block>
        </ScrollView>
      </>
    );
  };

  return (
    <Block flex center style={styles.home}>
      {renderArticles()}
    </Block>
  );
}

const styles = StyleSheet.create({
  resetButton: {
    width: 90,
    height: 30,
    marginLeft: 190,
    bottom: 30,
    padding: 3,
    backgroundColor: "#40DF9F",
  },
  home: {
    backgroundColor: "#22343C",
    width: width,
  },
  textTitle: {
    marginBottom: 24,
    fontFamily: "open-sans-regular",
  },
  textSubTitle: {
    marginBottom: 24,
    fontFamily: "open-sans-regular",
  },
  articles: {
    width: width - theme.SIZES.BASE * 2,
    paddingVertical: theme.SIZES.BASE,
    paddingHorizontal: 2,
  },
  textAreaContainer: {
    borderColor: theme.COLORS.GREY,
    borderWidth: 1,
    padding: 5,
    marginTop: 12,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: theme.COLORS.WHITE,
  },
  textArea: {
    height: 150,
    justifyContent: "flex-start",
  },
  floatinBtn: {
    position: "absolute",
    bottom: 10,
    right: 10,
  },
  verticalStyles: {
    marginTop: 8,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
  },
  horizontalImage: {
    borderRadius: 5,
    height: 200,
    width: "auto",
  },
  productItem: {
    width: thumbMeasure,
    marginHorizontal: theme.SIZES.BASE,
  },
  productImage: {
    width: thumbMeasure,
    height: thumbMeasure,
    borderRadius: 3,
  },
  group: {

  },
  albumThumb: {
    borderRadius: 4,
    marginVertical: 16,
    alignSelf: "center",
    width: thumbMeasure + 20,
    height: thumbMeasure + 20,
  },
  deleteLogoButton: {
    display: "absolute",
    width: 28,
    height: 28,
    borderRadius: 28 / 2,
    left: 32,
    bottom: 24,
  },
  deleteLogoButtonText: {
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
    left: 100,
    bottom: 40,
  },
  deleteButtonText: {
    fontFamily: "open-sans-bold",
    fontSize: 16,
    color: theme.COLORS.WHITE,
    fontWeight: "normal",
    fontStyle: "normal",
    letterSpacing: -0.29,
  },
  avatarContainer: {
    marginTop: 12,
    marginBottom: 35,
  },
  avatar: {
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 0,
  },
});
