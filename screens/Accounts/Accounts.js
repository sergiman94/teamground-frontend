import React, { useEffect, useState } from "react";
import { StyleSheet, Dimensions, ScrollView, TextInput, TouchableHighlight, Image, TouchableWithoutFeedback,} from "react-native";
import { Block, theme, Text } from "galio-framework";
import { Input, Button } from "../../components";
import SnackBar from "react-native-snackbar-component";
import * as Progress from "react-native-progress";
import * as ImagePicker from "expo-image-picker";
import { v4 as uuidv4 } from "uuid";
import DropdownComponent from "../../components/Dropdown";
import { argonTheme, Images } from "../../constants";
import axios from "axios";
import * as ImageManipulator from 'expo-image-manipulator';
import { BASE_FIELD_PICS, BASE_PROFILE_PICS_KEY, FIELDS_URL, uploadImgToS3, USERS_URL } from "../../utils/utils.";
const { width } = Dimensions.get("screen");
const thumbMeasure = (width - 48 - 32) / 3;
const cardWidth = width - theme.SIZES.BASE * 2;

export default function Accounts(props) {

  const { navigation, route } = props;
  const accountType = [
    { label: "Jugador", value: "player" },
    { label: "Cancha", value: "field" },
  ];

  const [roleSelected, setRoleSelected] = useState(null);
  const [createAccountBody, setCreateAccountBody] = useState({});
  const [createFieldBody, setCreateFieldBody] = useState({});

  const [showSnackbar, setShowSnackbar] = useState(false);
  const [progressBar, setProgressBar] = useState(false);
  const [snackbarColor, setSnackbarColor] = useState("#93C46F");
  const [snackbarMessage, setSnackbarMessage] = useState(
    "this is a test message"
  );

  const [userImage, setUserImage] = useState(null)
  const [selectedImages, setSelectedImages] = useState([])

  useEffect(() => {
    if (route.params) {
      setSelectedImages(route.params.selectedImages)
    }
  })

  const handleFieldValue = (value) => {
    setRoleSelected(value);
    setCreateAccountBody({ ...createAccountBody, role: value });
  };
  
  const handleCreateButton = async () => {
    setProgressBar(true);

    if (Object.keys(createAccountBody).length < 4) {
      setProgressBar(false);
      setShowSnackbar(true);
      setSnackbarColor("#BB6556");

      setSnackbarMessage("Faltan datos por ingresar");

      setTimeout(() => {
        setShowSnackbar(false);
      }, 1500);
      return;
    }

    let accountImage = []
    if (userImage) {
      let img = await fetchImageFromUri(userImage);
      let params = {
        Body: img,
        Bucket: "nnproject",
        Key: `${BASE_PROFILE_PICS_KEY}/${uuidv4()}.png`,
        ContentType: img.type,
      };

      // UPLOAD S3
      await uploadImgToS3(params)
        .then(async (location) => {
          accountImage.push(location)
          setProgressBar(false);
        })
        .catch((error) => {
          setProgressBar(false);
          console.log(error);
        });
    }

    if (roleSelected === "field") {
      if (Object.keys(createFieldBody).length < 5) {
        console.log("not enough data");
        setProgressBar(false);
        setShowSnackbar(true);
        setSnackbarColor("#BB6556");

        setSnackbarMessage("Faltan datos por ingresar");

        setTimeout(() => {
          setShowSnackbar(false);
        }, 1500);
        return;
      }

      if (!selectedImages.length > 0) {
        console.log("not enough data");
        setProgressBar(false);
        setShowSnackbar(true);
        setSnackbarColor("#BB6556");

        setSnackbarMessage("Faltan subir imagenes");

        setTimeout(() => {
          setShowSnackbar(false);
        }, 1500);
        return;
      }

      let fieldImagesUploads = []     
      for (let i = 0; i < selectedImages.length; i++) {
        const element = selectedImages[i];
        let img = await fetchImageFromUri(element);
        let params = {
          Body: img,
          Bucket: "nnproject",
          Key: `${BASE_FIELD_PICS}/${uuidv4()}.jpeg`,
          ContentType: img.type,
        };

        fieldImagesUploads.push(uploadImgToS3(params))
      }

      let imgs = []
      await Promise.allSettled(fieldImagesUploads)
        .then((response) => {
          setProgressBar(false);
          response.map((item) => imgs.push(item.value));
        })
        .catch((error) => {
          setProgressBar(false);
          console.log(error);
        });

      // first create field, then create user with field key
      await axios
        .post(`${FIELDS_URL}`, {...createFieldBody, fieldImages: imgs, image: accountImage[0]})
        .then(async (response) => {
          let fieldKey = response.data.data.key;
          let body = { ...createAccountBody, field: fieldKey, image: accountImage[0]};

          await axios.post(`${USERS_URL}`, body).then((response) => {
            setProgressBar(false);
            setShowSnackbar(true);
            setSnackbarColor("#93C46F")

            setSnackbarMessage("Usuario y Cancha creados exitosamente");

            setTimeout(() => {
              setShowSnackbar(false);
            }, 1500);
          });
        });
    } else {

      let userExists = (await axios.get(`${USERS_URL}/check/${createAccountBody.username}`)).data
      .data;

      if (userExists) {
        setProgressBar(false);
        setSnackbarColor("#BB6556");
        setSnackbarMessage("Nombre de usuario ya existe, elige otro");
        setShowSnackbar(true);

        setTimeout(() => {
          setShowSnackbar(false);
        }, 2500);

        return;
      }

      await axios.post(`${USERS_URL}`, createAccountBody).then((response) => {
        setProgressBar(false);
        setShowSnackbar(true);

        setSnackbarMessage("Usuario creado exitosamente");

        setTimeout(() => {
          setShowSnackbar(false);
        }, 1500);
      });
    }
  };

  const pickImage = async () => {
    setProgressBar(true);

    // OPEN LIBRARY IN DEVICE - No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      const manipResult = await ImageManipulator.manipulateAsync(
        result.uri,
        [{ resize: { width: 400, height: 400 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      setProgressBar(false);
      setUserImage(manipResult.uri);
    } else {
      setProgressBar(false);
    }
  };

  const fetchImageFromUri = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob;
  };

  const handleDeleteFieldImageButton = async (index) => {
    let newArr = selectedImages.splice(index,1)
    setSelectedImages(newArr)
  }

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
          contentContainerStyle={styles.articles}
        >
          <Block flex style={{ marginTop: 20, padding: 10 }}>
            <Text
              style={{ marginBottom: 24, fontFamily: "open-sans-regular" }}
              size={20}
              color={argonTheme.COLORS.TEXT}
            >
              Crear Nueva Cuenta
            </Text>

            <Text
              style={{ marginBottom: 20, fontFamily: "open-sans-regular" }}
              size={14}
              color={argonTheme.COLORS.TEXT}
            >
              Al crear la cuenta se aceptan automaticamente los terminos y
              condiciones
            </Text>

            <Text
              style={{ marginBottom: 24, fontFamily: "open-sans-regular" }}
              size={20}
              color={argonTheme.COLORS.TEXT}
            >
              Informacion propietario de la cuenta
            </Text>

            <Text
              style={{ marginBottom: 0, fontFamily: "open-sans-regular" }}
              size={14}
              color={argonTheme.COLORS.TEXT}
            >
              Seleccionar tipo de cuenta
            </Text>

            <DropdownComponent
              handleValue={handleFieldValue}
              data={accountType}
              placeholder={"-"}
            />

            {roleSelected ? (
              <>
                <Text
                  style={{ marginBottom: 0, fontFamily: "open-sans-regular" }}
                  size={14}
                  color={argonTheme.COLORS.TEXT}
                >
                  Foto/logo de la cuenta
                </Text>

                {/* user image */}
                <Block middle style={styles.avatarContainer}>
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
                    textStyle={styles.deleteButtonText}
                    style={styles.deleteButton}
                    onPress={() => handleDeleteImageButton()}
                  >
                    x
                  </Button>
                </Block>

                <Text
                  style={{ marginBottom: 0, fontFamily: "open-sans-regular" }}
                  size={14}
                  color={argonTheme.COLORS.TEXT}
                >
                  Nombre de usuario
                </Text>

                <Input
                  style={styles.SimpleInput}
                  onChangeText={(text) =>
                    setCreateAccountBody({
                      ...createAccountBody,
                      username: String(text).toLowerCase(),
                    })
                  }
                  placeholder="Username"
                />

                <Text
                  style={{ marginBottom: 0, fontFamily: "open-sans-regular" }}
                  size={14}
                  color={argonTheme.COLORS.TEXT}
                >
                  Email
                </Text>

                <Input
                  style={styles.SimpleInput}
                  onChangeText={(text) =>
                    setCreateAccountBody({ ...createAccountBody, email: text })
                  }
                  placeholder="Email"
                />

                <Text
                  style={{ marginBottom: 0, fontFamily: "open-sans-regular" }}
                  size={14}
                  color={argonTheme.COLORS.TEXT}
                >
                  Contraseña
                </Text>

                <Input
                  password
                  style={styles.SimpleInput}
                  onChangeText={(text) =>
                    setCreateAccountBody({
                      ...createAccountBody,
                      password: text,
                    })
                  }
                  placeholder="Password"
                />
              </>
            ) : (
              <></>
            )}

            {roleSelected && roleSelected === "field" ? (
              <>
                <Text
                  style={{
                    marginTop: 16,
                    marginBottom: 24,
                    fontFamily: "open-sans-regular",
                  }}
                  size={20}
                  color={argonTheme.COLORS.TEXT}
                >
                  Informacion de la cancha
                </Text>

                <Text
                  style={{ marginBottom: 0, fontFamily: "open-sans-regular" }}
                  size={14}
                  color={argonTheme.COLORS.TEXT}
                >
                  Nombre de la cancha
                </Text>

                <Input
                  style={styles.SimpleInput}
                  onChangeText={(text) =>
                    setCreateFieldBody({ ...createFieldBody, field: text })
                  }
                  placeholder="Nombre de la cancha"
                />

                <Text
                  style={{ marginBottom: 0, fontFamily: "open-sans-regular" }}
                  size={14}
                  color={argonTheme.COLORS.TEXT}
                >
                  Direccion de la cancha
                </Text>

                <Input
                  style={styles.SimpleInput}
                  onChangeText={(text) =>
                    setCreateFieldBody({ ...createFieldBody, address: text })
                  }
                  placeholder="Dirección de la cancha"
                />

                <Text
                  style={{ marginBottom: 0, fontFamily: "open-sans-regular" }}
                  size={14}
                  color={argonTheme.COLORS.TEXT}
                >
                  Descripcion corta de la cancha
                </Text>

                <Input
                  style={styles.SimpleInput}
                  onChangeText={(text) =>
                    setCreateFieldBody({
                      ...createFieldBody,
                      description: text,
                    })
                  }
                  placeholder="Descripcion corta de la cancha"
                />

                <Text
                  style={{ marginBottom: 0, fontFamily: "open-sans-regular" }}
                  size={14}
                  color={argonTheme.COLORS.TEXT}
                >
                  Descripcion completa de la cancha
                </Text>

                <Input
                  style={styles.SimpleInput}
                  onChangeText={(text) =>
                    setCreateFieldBody({
                      ...createFieldBody,
                      fullDescription: text,
                    })
                  }
                  placeholder="Descripcion completa de la cancha"
                />

                <Text
                  style={{ marginBottom: 0, fontFamily: "open-sans-regular" }}
                  size={14}
                  color={argonTheme.COLORS.TEXT}
                >
                  Cantidad de campos de juego
                </Text>

                <Input
                  style={styles.SimpleInput}
                  onChangeText={(text) =>
                    setCreateFieldBody({
                      ...createFieldBody,
                      numberOfFields: text,
                    })
                  }
                  placeholder="Cantidad de campos de juego"
                />

                <Button color="primary" style={styles.createButton} onPress={() => {
                  navigation.navigate("AccountsMediaSelection", {images: selectedImages, component:"Accounts"})
                }}>
                  <Text
                    style={{ fontFamily: "open-sans-bold" }}
                    size={14}
                    color={argonTheme.COLORS.WHITE}
                  >
                    Subir imagenes
                  </Text>
                </Button>



                {selectedImages && selectedImages.length > 0 ? 
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
                      paddingHorizontal: theme.SIZES.BASE / 2,
                    }}
                  >
                    {selectedImages.map((item, index) => (
                        <TouchableWithoutFeedback
                          style={{ zIndex: 3 }}
                          onPress={() =>
                            navigation.navigate("Picture", {
                              images: [item],
                              index: 0,
                            })
                          }
                        >
                          <Block center style={styles.productItem}>
                            <Image
                              style={styles.productImage}
                              source={{ uri: item }}
                            />
                            <Button
                              small
                              textStyle={styles.deleteButtonText}
                              style={styles.deleteButton}
                              onPress={() => handleDeleteFieldImageButton(index)}
                            >
                              x
                            </Button>

                          </Block>
                        </TouchableWithoutFeedback>
                      ))}
                  </ScrollView>
                </Block>
                : <></>}
              </>
            ) : (
              <></>
            )}

            {roleSelected ? (
              <Button color="primary" style={styles.createButton}>
                <Text
                  style={{ fontFamily: "open-sans-bold" }}
                  size={14}
                  color={argonTheme.COLORS.WHITE}
                  onPress={(event) => handleCreateButton(event)}
                >
                  Crear Cuenta
                </Text>
              </Button>
            ) : (
              <></>
            )}
          </Block>
        </ScrollView>
      </>
    );
  };

  return (
    <Block flex center style={styles.home}>
      {render()}
    </Block>
  );
}

const styles = StyleSheet.create({
  home: {
    width: width,
  },
  articles: {
    width: width - theme.SIZES.BASE * 2,
    paddingVertical: theme.SIZES.BASE,
    paddingHorizontal: 2,
  },
  floatinBtn: {
    position: "absolute",
    bottom: 10,
    right: 10,
  },
  SimpleInput: {
  },
  createButton: {
    marginTop: 20,
  },
  avatarContainer: {
    position: "relative",
    marginTop: 0,
    marginBottom: 4
  },
  avatar: {
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 0,
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
    left: 30,
    bottom: 30,
  },
  productItem: {
    width: thumbMeasure,
    marginHorizontal: theme.SIZES.BASE,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 7 },
    shadowRadius: 10,
    shadowOpacity: 0.2
  },
  productImage: {
    width: thumbMeasure,
    height: thumbMeasure,
    borderRadius: 3
  },
  deleteButton: {
    display: "absolute",
    width: 28,
    height: 28,
    borderRadius: 28 / 2,
    left: 48,
    bottom: 24,
  },
  deleteButtonText: {
    fontFamily: "open-sans-bold",
    fontSize: 16,
    color: theme.COLORS.WHITE,
    fontWeight: "normal",
    fontStyle: "normal",
    letterSpacing: -0.29,
  },
});
