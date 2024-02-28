import React, { useState } from "react";
import {
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  TouchableHighlight,
} from "react-native";
import { Block, theme, Text } from "galio-framework";
import { Button, Icon, Input } from "../../components";
import SnackBar from "react-native-snackbar-component";
import * as Progress from "react-native-progress";
import { argonTheme, Images } from "../../constants";
import axios from "axios";
import {
  BASE_PROFILE_PICS_KEY,
  deleteS3Object,
  MAILERSEND_URL,
  uploadImgToS3,
  USERS_URL,
} from "../../utils/utils.";
import * as ImagePicker from "expo-image-picker";
import { v4 as uuidv4 } from "uuid";
const { width } = Dimensions.get("screen");
import * as ImageManipulator from 'expo-image-manipulator';
import DropdownComponent from "../../components/Dropdown";

export default function EditProfile(props) {
  const { navigation, route } = props;
  const currentUser = route.params?.item;
  const [data, setData] = useState(currentUser);
  const [buttonLoading, setButtonLoading] = useState(false)
  const [changes, setChanges] = useState({});
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [progressBar, setProgressBar] = useState(false);
  const [snackbarColor, setSnackbarColor] = useState("#93C46F");
  const [snackbarMessage, setSnackbarMessage] = useState(
    "this is a test message"
  );
  const [prevUserImage, setPrevUserImage] = useState(
    currentUser ? currentUser.image : null
  );
  const [userImage, setUserImage] = useState(
    currentUser ? currentUser.image : null
  );

  const position = [
    { label: "Portero", value: "Portero" },
    { label: "Defensa", value: "Defensa" },
    { label: "Volante", value: "Volante" },
    { label: "Delantero", value: "Delantero" },
  ];

  const handleConfirmationButton = async () => {
    setProgressBar(true)
    setButtonLoading(true)
    await axios.post(`${MAILERSEND_URL}/confirmation`, {userId: currentUser.key}).then(() => {
      setProgressBar(false);
      setButtonLoading(false);
      setShowSnackbar(true);
      setSnackbarMessage(
        "Te hemos enviado un correo para que confirmes tu correo electronico"
      );
      setTimeout(() => {
        setShowSnackbar(false);
      }, 1500);
    }).catch(() => {
      setProgressBar(false);
      setButtonLoading(false)
      setShowSnackbar(true);
      setSnackbarColor("#BB6556");
      setSnackbarMessage("No se pudo enviar el correo de confirmacion");
      setTimeout(() => {
        setShowSnackbar(false);
      }, 1500);
    })
  }

  const getPositionValue = (value) => {
    setChanges({ ...changes, preferedPosition: value });
  };

  const handleUpdateButton = async () => {
    setProgressBar(true);
    setButtonLoading(true)
    let url = `${USERS_URL}/${data.key}`;

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
        changes.image = location;

        let splittedLocation = String(prevUserImage).split("/");
        let keyLocation = `${BASE_PROFILE_PICS_KEY}/${
          splittedLocation[splittedLocation.length - 2]
        }/${splittedLocation[splittedLocation.length - 1]}`;

        let params = {
          Bucket: "nnproject",
          Key: keyLocation,
        };

        await deleteS3Object(params)
          .then(() => {
            setProgressBar(false);
            setButtonLoading(false)
          })
          .catch((error) => {
            console.log(error);
            setProgressBar(false);
          });

        setProgressBar(false);
        setButtonLoading(false)
      })
      .catch((error) => {
        setProgressBar(false);
        setButtonLoading(false)
        console.log(error);
      });

    if (!Object.keys(changes).includes("displayName"))
      changes.displayName = data.displayName;
    if (!Object.keys(changes).includes("preferedPosition"))
      changes.preferedPosition = data.preferedPosition;
    if (!Object.keys(changes).includes("description"))
      changes.description = data.description;

    await axios
      .put(url, changes)
      .then((response) => {
        setProgressBar(false);
        setShowSnackbar(true);
        setSnackbarMessage("Datos actualizados");
        setTimeout(() => {
          setShowSnackbar(false);
        }, 1500);
        navigation.navigate("Profile", { reload: true });
      })
      .catch((error) => {
        setProgressBar(false);
        setShowSnackbar(true);
        setSnackbarColor("#BB6556");

        setSnackbarMessage("Los datos no se pudieron actualizar");

        setTimeout(() => {
          setShowSnackbar(false);
        }, 1500);

        navigation.navigate("Profile", { reload: true });
      });
  };

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

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.products}
    >
      {progressBar ? (
        <Progress.Bar
          style={{ marginTop: 80 }}
          width={width}
          indeterminate={true}
        />
      ) : (
        <></>
      )}

      {/* components */}
      <Block style={styles.container}>
        <SnackBar
          visible={showSnackbar}
          position={"top"}
          backgroundColor={snackbarColor}
          textMessage={snackbarMessage}
        />

        {/* user image */}
        <Block middle style={styles.avatarContainer}>
          <TouchableHighlight onPress={pickImage}>
            <Image
              source={userImage ? { uri: userImage } : Images.ProfilePicture}
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

        {/* Username */}
        <Block>
          <Text
            style={{
              fontFamily: "open-sans-bold",
            }}
            size={16}
            color={argonTheme.COLORS.WHITE}
          >
            Nombre de usuario
          </Text>

          <Text
            style={{
              fontFamily: "open-sans-regular",
            }}
            size={16}
            color={argonTheme.COLORS.PLACEHOLDER}
          >
            @{currentUser.username}
          </Text>
        </Block>

        {/* Email Confirmed */}
        <Block flex row style={{ marginTop: 30 }}>
          <Block>
            <Text
              style={{
                fontFamily: "open-sans-bold",
              }}
              size={16}
              color={argonTheme.COLORS.WHITE}
            >
              Correo electronico
            </Text>

            <Text
              style={{
                fontFamily: "open-sans-regular",
              }}
              size={16}
              color={argonTheme.COLORS.PLACEHOLDER}
            >
              @{currentUser.email}
            </Text>
            {!currentUser.emailConfirmed ? <Text
              style={{
                fontFamily: "open-sans-regular",
              }}
              size={12}
              color={'red'}
            >
              No has confirmado tu correo electronico
            </Text>: <></>}
          </Block>
          {currentUser.emailConfirmed ? (
            <Icon
              name="check"
              family="Font-Awesome"
              size={16}
              color={"green"}
              style={{ right: 24 }}
            />
          ) : (
            <>
              <Button
                small
                loading={buttonLoading}
                onPress={() => handleConfirmationButton()}
                style={{ backgroundColor: "#FF565E" }}
              >
                <Text
                  style={{ fontFamily: "open-sans-bold" }}
                  size={14}
                  color={argonTheme.COLORS.WHITE}
                >
                  Confirmar
                </Text>
              </Button>
            </>
          )}
        </Block>

        {/* display name */}
        <Block style={{ marginTop: 30 }}>
          <Text
            style={{
              fontFamily: "open-sans-bold",
            }}
            size={16}
            color={argonTheme.COLORS.WHITE}
          >
            Nombre para mostrar
          </Text>

          <Input
            borderless
            style={{ backgroundColor: "#30444E" }}
            color={"white"}
            placeholder={`${currentUser.displayName}`}
            onChangeText={(value) =>
              setChanges({
                ...changes,
                displayName: String(value).toLowerCase(),
              })
            }
          />
        </Block>

        {/* position */}
        <Block style={{ marginTop: 30 }}>
          <Text
            style={{
              fontFamily: "open-sans-bold",
            }}
            size={16}
            color={argonTheme.COLORS.WHITE}
          >
            Posición
          </Text>

          <DropdownComponent
            handleValue={getPositionValue}
            data={position}
            placeholder={`Posiciòn actual: ${data.preferedPosition}`}
          />
        </Block>

        {/* descritpion */}
        <Block style={{ marginTop: 30 }}>
          <Text
            style={{
              fontFamily: "open-sans-bold",
            }}
            size={16}
            color={argonTheme.COLORS.WHITE}
          >
            Descripción
          </Text>

          <Input
            borderless
            style={{ backgroundColor: "#30444E" }}
            color={"white"}
            placeholder={`${currentUser.description}`}
            onChangeText={(value) =>
              setChanges({ ...changes, description: value })
            }
          />
        </Block>
      </Block>
          
      {/* update button  */}
      <Block center>
        <Button
          loading = {buttonLoading}
          color="primary"
          onPress={() => handleUpdateButton()}
          style={{ backgroundColor: "#40DF9F" }}
        >
          <Text
            style={{ fontFamily: "open-sans-bold" }}
            size={14}
            color={argonTheme.COLORS.WHITE}
          >
            ACTUALIZAR
          </Text>
        </Button>
      </Block>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  deals: {
    
  },
  products: {
    paddingVertical: theme.SIZES.BASE,
  },
  container: {
    marginTop: 150,
    marginLeft: 16,
  },
  spinner: {
    marginBottom: 50,
  },
  avatarContainer: {
    position: "relative",
    marginTop: 0,
    marginBottom: 0,
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
});
