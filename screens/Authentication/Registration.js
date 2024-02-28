import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Dimensions,
  Image,
  TouchableHighlight,
} from "react-native";
import { Block, Checkbox, Text, theme } from "galio-framework";
import { Button, Header, Icon, Input } from "../../components";
import { Images, argonTheme } from "../../constants";
import SnackBar from "react-native-snackbar-component";
import * as Progress from "react-native-progress";
import axios from "axios";
import {
  BASE_PROFILE_PICS_KEY,
  USERS_URL,
  uploadImgToS3,
  MAILERSEND_URL,
} from "../../utils/utils.";
import { ScrollView } from "react-native-gesture-handler";
import * as ImagePicker from "expo-image-picker";
import { v4 as uuidv4 } from "uuid";
const { width, height } = Dimensions.get("screen");
import * as ImageManipulator from 'expo-image-manipulator';

export default function Registration(props) {
  const { navigation, scene } = props;

  const positions = [
    { label: "Portero", value: "Portero" },
    { label: "Defensa", value: "Defensa" },
    { label: "Volante", value: "Volante" },
    { label: "Delantero", value: "Delantero" },
  ];

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userImage, setUserImage] = useState(null);
  const [email, setEmail] = useState("");
  const [TC, setTC] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarColor, setSnackbarColor] = useState("#93C46F");
  const [titleMarginTop, setTitleMarginTop] = useState(0);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [position, setPosition] = useState(positions);
  const [positionSelected, setPositionSelected] = useState("Volante");
  const [description, setDescription] = useState("-");
  const [buttonLoading, setButtonLoading] = useState(false)

  const handlePosition = (value) => {
    setPositionSelected(value);
  };

  const pickImage = async () => {
    setShowProgressBar(true);

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
      setShowProgressBar(false);
      setUserImage(manipResult.uri);
    } else {
      setShowProgressBar(false);
    }
  };

  const fetchImageFromUri = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob;
  };

  const handleRegisterButton = async () => {
    setShowProgressBar(true);
    setButtonLoading(true)

    // Check for terms and conditions
    if (!TC) {
      setShowProgressBar(false);
      setSnackbarColor("#BB6556");
      setSnackbarMessage("Aceptar terminos y condiciones ");
      setShowSnackbar(true);

      setTimeout(() => {
        setShowSnackbar(false);
      }, 2500);

      return;
    }

    // Check for all fields filled
    if (username === "" || password === "" || email === "") {
      setShowProgressBar(false);
      setSnackbarColor("#BB6556");
      setSnackbarMessage("Porfavor completar los campos");
      setShowSnackbar(true);

      setTimeout(() => {
        setShowSnackbar(false);
      }, 2500);

      return;
    }

    let body = {
      username: username.toLowerCase(),
      password: password,
      email: email,
      image: userImage,
      preferedPosition: positionSelected,
      description: description,
    };

    let userExists = (await axios.get(`${USERS_URL}/check/${username}`)).data
      .data;

    if (userExists) {
      setShowProgressBar(false);
      setSnackbarColor("#BB6556");
      setSnackbarMessage("Nombre de usuario ya existe, elige otro");
      setShowSnackbar(true);

      setTimeout(() => {
        setShowSnackbar(false);
      }, 2500);

      return;
    }

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
        .then((location) => {
          body.image = location;
          setShowProgressBar(false);
        })
        .catch((error) => {
          setShowProgressBar(false);
          console.log(error);
        });
    }

    await axios
      .post(USERS_URL, body)
      .then(async (response) => {
        setShowProgressBar(false);
        setSnackbarMessage("Usuario creado exitosamente");
        setShowSnackbar(true);
        setSnackbarColor("#93C46F");

        await axios.post(`${MAILERSEND_URL}/signup`, {userId: response.data.data.key})

        setButtonLoading(false)

        setTimeout(() => {
          setShowSnackbar(false);
          navigation.navigate("Home");
        }, 2500);
      })
      .catch((error) => {
        setButtonLoading(false)
        console.log("Error performing authentication --> ", error);

        setShowProgressBar(false);
        setSnackbarColor("#BB6556");
        setSnackbarMessage("Error creando usuario");
        setShowSnackbar(true);

        setTimeout(() => {
          setShowSnackbar(false);
        }, 2500);
      });
  };

  const handleDeleteImageButton = async () => {
    setUserImage(null);
  };

  const render = () => {
    let showProgres = showProgressBar;
    return (
      <>
        <Block flex style={{ marginTop: 80 }}>
          <ScrollView vertical={true} showsVerticalScrollIndicator={false}>
            {showProgres ? (
              <Progress.Bar width={width} indeterminate={true} />
            ) : (
              <></>
            )}
            <SnackBar
              visible={showSnackbar}
              position={"top"}
              backgroundColor={snackbarColor}
              textMessage={snackbarMessage}
            />
            <Block flex space="between">
              {/* title */}
              <Block middle>
                <Text
                  style={{
                    fontFamily: "open-sans-bold",
                    textAlign: "left",
                    marginTop: 8,
                    // left: 18
                  }}
                  color="#FFFFFF"
                  size={24}
                >
                  Registrarse
                </Text>
              </Block>
              <Block middle space="between">
                {/* form inputs */}
                <Block center>
                  <Block flex space="between">
                    {/* profile image */}
                    <Block middle style={styles.avatarContainer}>
                      <>
                        <TouchableHighlight onPress={pickImage}>
                          <Image
                            source={
                              userImage
                                ? { uri: userImage }
                                : Images.ProfilePicture
                            }
                            style={styles.avatar}
                          />
                        </TouchableHighlight>
                        {userImage ? (
                          <Button
                            small
                            textStyle={styles.deleteButtonText}
                            style={styles.deleteButton}
                            onPress={() => handleDeleteImageButton()}
                          >
                            x
                          </Button>
                        ) : (
                          <></>
                        )}
                      </>
                    </Block>

                    {/* inputs */}
                    <Block style={{ marginTop: 0 }}>
                      {/* name */}
                      <Block width={width * 0.8}>
                        <Input
                          borderless
                          style={{ backgroundColor: "#30444E" }}
                          color={"#FFFFFF"}
                          placeholder="Nombre de usuario"
                          onChangeText={(value) => setUsername(value)}
                          iconContent={
                            <Icon
                              size={16}
                              color="#ADB5BD"
                              name="user"
                              family="Font-Awesome"
                              style={styles.inputIcons}
                            />
                          }
                        />
                      </Block>

                      {/* email */}
                      <Block width={width * 0.8}>
                        <Input
                          borderless
                          style={{ backgroundColor: "#30444E" }}
                          color={"#FFFFFF"}
                          placeholder="Email"
                          onChangeText={(value) => setEmail(value)}
                          iconContent={
                            <Icon
                              size={16}
                              color="#ADB5BD"
                              name="ic_mail_24px"
                              family="ArgonExtra"
                              style={styles.inputIcons}
                            />
                          }
                        />
                      </Block>

                      {/* password */}
                      <Block width={width * 0.8}>
                        <Input
                          password
                          style={{ backgroundColor: "#30444E" }}
                          borderless
                          placeholder="Contraseña"
                          color={"#FFFFFF"}
                          onChangeText={(value) => setPassword(value)}
                          iconContent={
                            <Icon
                              size={16}
                              color="#ADB5BD"
                              name="padlock-unlocked"
                              family="ArgonExtra"
                              style={styles.inputIcons}
                            />
                          }
                        />
                      </Block>

                      {/* position */}
                      {/* <DropdownComponent
                        handleValue={(value) => handlePosition(value)}
                        data={position}
                        placeholder={`Seleccione su posicion`}
                      /> */}

                      {/* description */}
                      {/* <Block width={width * 0.8}>
                        <Input
                          borderless
                          style={{ backgroundColor: "#30444E" }}
                          placeholder="Descripción (opcional)"
                          color={"#FFFFFF"}
                          onChangeText={(value) => setDescription(value)}
                          iconContent={
                            <Icon
                              size={16}
                              color="#ADB5BD"
                              name="book"
                              family="Font-Awesome"
                              style={styles.inputIcons}
                            />
                          }
                        />
                      </Block> */}

                      {/* checkbox  */}
                      <Block row width={width * 0.75}>
                        <Checkbox
                          onChange={() => {
                            setTC(!TC);
                          }}
                          checkboxStyle={{
                            borderWidth: 1,
                            left: 4,
                          }}
                          color={argonTheme.COLORS.WHITE}
                          labelStyle={{
                            color: argonTheme.COLORS.WHITE,
                            fontFamily: "open-sans-regular",
                          }}
                          label="Acepto los"
                        />
                        <Button
                          style={{ width: 180 }}
                          color="transparent"
                          textStyle={{
                            color: "white",
                            fontSize: 14,
                            fontFamily: "open-sans-regular",
                            right: 28,
                          }}
                        >
                          Terminos y Condiciones
                        </Button>
                      </Block>
                    </Block>

                    {/* create account button */}
                    <Block center>
                      <Button color="primary" loading={buttonLoading} style={styles.createButton} onPress={(event) => handleRegisterButton(event)}>
                        <Text
                          style={{ fontFamily: "open-sans-bold" }}
                          size={14}
                          color={argonTheme.COLORS.WHITE}
                        >
                          CREAR CUENTA
                        </Text>
                      </Button>
                    </Block>
                  </Block>
                </Block>
              </Block>
            </Block>
          </ScrollView>
          {/* </Block> */}
        </Block>
      </>
    );
  };

  return <>{render()}</>;
}

const styles = StyleSheet.create({
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
  },
  registerContainer: {
    width: width * 0.9,
    height: height < 812 ? height * 0.9 : height * 0.8,
    borderRadius: 4,
    shadowColor: argonTheme.COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 8,
    shadowOpacity: 0.1,
    elevation: 1,
    overflow: "hidden",
  },
  socialConnect: {
    backgroundColor: argonTheme.COLORS.WHITE,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(136, 152, 170, 0.3)",
  },
  socialButtons: {
    width: 120,
    height: 40,
    backgroundColor: "#fff",
    shadowColor: argonTheme.COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 8,
    shadowOpacity: 0.1,
    elevation: 1,
  },
  socialTextButtons: {
    color: argonTheme.COLORS.PRIMARY,
    fontWeight: "800",
    fontSize: 14,
  },
  inputIcons: {
    marginRight: 12,
  },
  passwordCheck: {
    paddingLeft: 2,
    paddingTop: 6,
    paddingBottom: 15,
  },
  createButton: {
    width: width * 0.5,
    marginTop: -4,
    backgroundColor: "#40DF9F",
  },
  avatarContainer: {
    marginTop: 16,

  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 62,
    borderWidth: 0,
  },
});
