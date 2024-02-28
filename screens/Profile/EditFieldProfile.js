import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  TouchableWithoutFeedback,
  TouchableHighlight,
  View,
  TextInput
  
} from "react-native";
import { Block, theme, Text } from "galio-framework";

import * as ImagePicker from "expo-image-picker";
import { Card, Input, Button, Icon} from "../../components";

import { v4 as uuidv4 } from "uuid";
import { argonTheme, Images } from "../../constants";
import axios from "axios";
import { BASE_FIELD_PICS, FIELDS_URL, uploadImgToS3, USERS_URL } from "../../utils/utils.";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Progress from "react-native-progress";
import SnackBar from "react-native-snackbar-component";
import * as ImageManipulator from 'expo-image-manipulator';
const { width } = Dimensions.get("screen");
const thumbMeasure = (width - 48 - 32) / 3;
const cardWidth = width - theme.SIZES.BASE * 2;

export default function EditFieldProfile(props) {
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

  const categories = [
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?fit=crop&w=840&q=80",
    "https://images.unsplash.com/photo-1543747579-795b9c2c3ada?fit=crop&w=840&q=80",
    "https://images.unsplash.com/photo-1501601983405-7c7cabaa1581?fit=crop&w=240&q=80",
    "https://images.unsplash.com/photo-1551798507-629020c81463?fit=crop&w=240&q=80",
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?fit=crop&w=840&q=80",
  ];

  const [selectedImages, setSelectedImages] = useState([])
  const [reload, setReload] = useState(false)

  useEffect(() => {
    if (route.params) {
      setFieldImages(route.params.selectedImages)
      setNewImages(route.params.newImages)
    }
  })

  useEffect(() => {
    getData()
  }, [])

  useEffect(() => {
    getData()
  }, [reload])

  const getData = async () => {
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

  const pickImage = async () => {
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
      setUserImage(manipResult.uri)
      setProgressBar(false);
    } else {
      setProgressBar(false);
    }
  };

  const fetchImageFromUri = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob;
  };

  const handleDeleteFieldImageButton = async (image, index) => {
    if (newImages && newImages.length > 0) {
      let existInNewImages =
        newImages.filter((img) => img === fieldImages[index]).length > 0;

      if (existInNewImages) {
        let newImageIndex = newImages.indexOf(image);
        if (newImageIndex > -1) {
          let newImagesArr = newImages.splice(newImageIndex, 1);
          setNewImages(newImagesArr);
        }
      }
    }
    let newArr = fieldImages.splice(index, 1);
    setSelectedImages(newArr);
  };

  const handleUpdateButton = async () => {
    setProgressBar(true)

    if (prevUserImage !== userImage) {
      profileData.image = userImage;
      await axios
        .put(`${USERS_URL}/${profileData.key}`)
        .then((response) => {
          setProgressBar(false);
          setShowSnackbar(true);
          setSnackbarMessage("Logo Actualizado");
          setTimeout(() => {
            setShowSnackbar(false);
          }, 1200);
        })
        .then((error) => {
          console.log(error);
          setProgressBar(false);
          setShowSnackbar(true);
          setSnackbarColor("#BB6556");
          setSnackbarMessage("No se pudo actualizar el logo");
          setTimeout(() => {
            setShowSnackbar(false);
          }, 1200);
        });
    } 

    fieldData.field = fieldName
    fieldData.address = fieldAddress
    fieldData.description = fieldDescription
    fieldData.fullDescription = fieldFullDescription

    let newUploadedImgs = [];
    
    if (newImages && newImages.length > 0) {
      let fieldImagesUploads = [];
      for (let i = 0; i < newImages.length; i++) {
        const element = newImages[i];
        let img = await fetchImageFromUri(element);
        let params = {
          Body: img,
          Bucket: "nnproject",
          Key: `${BASE_FIELD_PICS}/${fieldData.key}/${uuidv4()}.jpeg`,
          ContentType: img.type,
        };

        fieldImagesUploads.push(uploadImgToS3(params));
      }

      await Promise.allSettled(fieldImagesUploads)
        .then((response) => {
          setProgressBar(false);
          response.map((item) => newUploadedImgs.push(item.value));
        })
        .catch((error) => {
          setProgressBar(false);
          console.log(error);
        });

      fieldData.fieldImages = [...prevFieldImages, ...newUploadedImgs]
    } else {
      fieldData.fieldImages = fieldImages
    }
    
    await axios.put(`${FIELDS_URL}/${fieldData.key}`, fieldData).then(response => {
      setProgressBar(false);
      setShowSnackbar(true);
      setSnackbarMessage("Perfil Actualizado");
      setReload(true)
      setTimeout(() => {
        setShowSnackbar(false);
        navigation.navigate("FieldMedia", {reload:true})
      }, 1500);

    }).catch(error => {
      console.log(error)
      setProgressBar(false);
      setShowSnackbar(true);
      setSnackbarColor("#BB6556");
      setSnackbarMessage("No se pudo actualizar el perfil");
      setTimeout(() => {
        setShowSnackbar(false);
      }, 1500);
    })
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
                  small
                  loading={progressBar}
                  style={styles.resetButton}
                  onPress={handleUpdateButton}
                >
                  <Text
                    style={{ fontFamily: "open-sans-bold", padding: 4}}
                    size={12}
                    color={argonTheme.COLORS.WHITE}
                  >
                    Actualizar
                  </Text>
                </Button>
              </Block>

              <Text
                style={{ marginBottom: 20, fontFamily: "open-sans-bold" }}
                size={14}
                color={argonTheme.COLORS.WHITE}
              >
                Oprime el lapiz para cambiar tu logo
              </Text>

              <Block middle style={styles.avatarContainer}>
                <>
                  <TouchableHighlight onPress={pickImage}>
                    <Image
                      source={
                        userImage ? { uri: userImage } : Images.ProfilePicture
                      }
                      style={styles.avatar}
                    />
                  </TouchableHighlight>
                  <Button
                    small
                    textStyle={styles.deleteLogoButtonText}
                    style={styles.deleteLogoButton}
                    onPress={() => handleDeleteImageButton()}
                  >
                    x
                  </Button>
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
                color={argonTheme.COLORS.WHITE}
              >
                {profileData
                  ? `@${profileData.username}`
                  : "can't get username"}
              </Text>

              {/* Display Name */}
              <>
                <Text
                  style={{
                    marginTop: 16,
                    marginBottom: 4,
                    fontFamily: "open-sans-bold",
                  }}
                  size={16}
                  color={argonTheme.COLORS.WHITE}
                >
                  Nombre para mostrar
                </Text>

                <Block width={width * 0.8} style={{ marginBottom: 8 }}>
                  <Input
                    borderless
                    style={{backgroundColor: "#30444E"}}
                    color={"#FFFFFF"}
                    value={fieldName ? fieldName : ""}
                    //placeholder="Nombre de usuario"
                    onChangeText={(value) => setFieldName(value)}
                  />
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
                  <Input
                    borderless
                    style={{backgroundColor: "#30444E"}}
                    color={"#FFFFFF"}
                    value={fieldAddress ? fieldAddress : ""}
                    //placeholder="Nombre de usuario"
                    onChangeText={(value) => setFieldAddress(value)}
                  />
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
                  <Input
                    borderless
                    style={{backgroundColor: "#30444E"}}
                    color={"#FFFFFF"}
                    value={fieldDescription ? fieldDescription: ""}
                    //placeholder="Nombre de usuario"
                    onChangeText={(value) => setFieldDescription(value)}

                  />
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

                <View style={styles.textAreaContainer}>
                  <TextInput
                    style={styles.textArea}
                    underlineColorAndroid="transparent"
                    placeholder="Descripcion completa"
                    placeholderTextColor="#96A7AF"
                    numberOfLines={10}
                    multiline={true}
                    value={fieldFullDescription ? fieldFullDescription : ""}
                    onChangeText={(value) => setFieldFullDescription(value)}
                  />
                </View>
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
                style={{ marginBottom: 20, fontFamily: "open-sans-bold" }}
                size={14}
                color={argonTheme.COLORS.WHITE}
              >
                Aqui gestionas tu contenido multimedia que se muestra a los
                usuario, puedes subir nuevas imagenes o eliminar existentes
              </Text>

              <Button
                style={{justifyContent: 'center',  backgroundColor: "#40DF9F" }}
                onPress={() => {
                  navigation.navigate("MediaSelection", {
                    images: fieldImages,
                    component: "EditFieldProfile",
                  });
                }}
              >
               <Block flex row style={{marginTop: 12}}>
                  <Icon
                    style={{marginRight: 8}}
                    name="upload"
                    family="Font-Awesome"
                    size={20}
                    color={"white"}
                  />
                  <Text
                    style={{ fontFamily: "open-sans-bold" }}
                    size={14}
                    color={argonTheme.COLORS.WHITE}
                  >
                    Subir imagenes
                  </Text>
                </Block>
              </Button>

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
                    {fieldImages.map((img, index) => (
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
                          <Button
                            small
                            textStyle={styles.deleteButtonText}
                            style={styles.deleteButton}
                            onPress={() => handleDeleteFieldImageButton(img, index)}
                          >
                            x
                          </Button>
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
    // width: 32,
    // height: 32,
    // borderRadius: 32 / 2,
    backgroundColor: "#40DF9F", 
    marginLeft: 220,
    bottom: 30
  },
  home: {
    width: width,
  },
  textTitle: {
    marginBottom: 24, 
    fontFamily: "open-sans-bold" 
  }, 
  textSubTitle: {
    marginBottom: 24, 
    fontFamily: "open-sans-bold" 
  }, 
  articles: {
    width: width - theme.SIZES.BASE * 2,
    paddingVertical: theme.SIZES.BASE,
    paddingHorizontal: 2,
  },
  textAreaContainer: {
    borderColor: "#30444E",
    borderWidth: 1,
    padding: 5,
    marginTop: 12,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: "#30444E"
  },
  textArea: {
    color:"#ffffff", 
    height: 150,
    justifyContent: "flex-start"
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
    // width: cardWidth - theme.SIZES.BASE * 2,
    width: thumbMeasure,
    marginHorizontal: theme.SIZES.BASE,
  },
  productImage: {
    // width: cardWidth - theme.SIZES.BASE,
    // height: cardWidth - theme.SIZES.BASE,
    width: thumbMeasure,
    height: thumbMeasure,
    borderRadius: 3,
  },
  group: {
    //paddingTop: theme.SIZES.BASE
  },
  albumThumb: {
    borderRadius: 4,
    marginVertical: 16,
    alignSelf: "center",
    width: thumbMeasure + 20,
    height: thumbMeasure + 20
  },
  deleteLogoButton: {
    backgroundColor: "#40DF9F", 
    display: "absolute",
    width: 28,
    height: 28,
    borderRadius: 28 / 2,
    left: 32,
    bottom: 24,
  },
  deleteLogoButtonText: {
    backgroundColor: "#40DF9F", 
    fontFamily: "open-sans-bold",
    fontSize: 16,
    color: theme.COLORS.WHITE,
    fontWeight: "normal",
    fontStyle: "normal",
    letterSpacing: -0.29,
  },
  deleteButton: {
    backgroundColor: "#FF565E", 
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
    //position: "relative",
    marginTop: 12,
    marginBottom: 35
  },
  avatar: {
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 0,
  },
});
