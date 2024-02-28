import React , { useEffect, useState } from "react";
import {
  StyleSheet,
  Dimensions,
  Platform,
  Linking
} from "react-native";
import { Block, Button, Text, theme } from "galio-framework";
const {  width } = Dimensions.get("screen");
import { argonTheme } from "../../constants/";
import { HeaderHeight } from "../../constants/utils";
import axios from "axios";
import { USERS_URL } from "../../utils/utils.";
// import SafariView from "react-native-safari-view"
import * as WebBrowser from "expo-web-browser";
import { v4 as uuidv4 } from "uuid";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginHandler(props) {
  const { navigation } = props;
  const [showProgress, setShowProgress] = useState(false);

  const handleSimpleRegistration = () => {
    navigation.navigate("SimpleRegistration");
  };

  const handleLoginHandlerRedirection = () => {
    navigation.navigate("LoginHandler");
  };

  // Set up Linking
  useEffect(() => {
    Linking.addEventListener("url", (url) => handleOpenURL(url.url));
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleOpenURL({ url });
      }
    });
    return () => {
      Linking.removeAllListeners("url");
    };
  }, []);

  const handleOpenURL = async (url) => {
    // Extract stringified user string out of the URL
    const user = decodeURI(url).match(
      /firstName=([^#]+)\/lastName=([^#]+)\/email=([^#]+)\/name=([^#]+)\/picture=([^#]+)\/username=([^#]+)/
    );
    
    const userData = {
      isAuthenticated: true,
      firstName: user && user[1] ? user[1] : "NA",
      lastName: user && user[2] ? user[2] : "NA",
      email: user && user[3] ? user[3] : "NA",
      name: user && user[4] ? user[4] : "NA",
      picture: user && user[5] ? user[5] : "NA",
      username: user && user[6] ? user[6] : "NA",
    }
    try {

      let body = {
        username: userData.username,
        password: `${uuidv4()}`,
        email: userData.email,
        image: userData.picture,
        preferedPosition: 'Volante',
        description: 'No hat descripcion',
      };
  
      let userExists = (await axios.get(`${USERS_URL}/check/${body.username}`)).data.data;

      if (body.image !== "NA") {
        if (userExists) {
          await axios.get(`${USERS_URL}/username/${body.username}`).then(async (response) => {
            let user = response.data.data
            console.log(user)
            await AsyncStorage.setItem("@field_id", user.field);
            await AsyncStorage.setItem("@user_id", user.key);
            await AsyncStorage.setItem("@updated_match", "false");
            await AsyncStorage.setItem("@user_role", user.role);
            WebBrowser.dismissBrowser()
            navigation.navigate("Home")
          }).catch(error => {
            console.log(error)
            WebBrowser.dismissBrowser()
          })
  
        } else {
          setShowProgress(true)
          // create user
          await axios.post(`${USERS_URL}`, body).then(async (response) => {
            setShowProgress(false)
            let user = response.data.data
            await AsyncStorage.setItem("@field_id", user.field);
            await AsyncStorage.setItem("@user_id", user.key);
            await AsyncStorage.setItem("@updated_match", "false");
            await AsyncStorage.setItem("@user_role", user.role);
            WebBrowser.dismissBrowser()
            navigation.navigate("Home")
          }).catch(error => {
            console.log(error)
            WebBrowser.dismissBrowser()
          })
        }
      }
      WebBrowser.dismissBrowser()
    } catch (error) {
      console.log(error)
    }
  };

  const handleGoogleRegister = async () => {
    let url = `${USERS_URL}/register/google`;
    await WebBrowser.openBrowserAsync(url);
  };

  const handleTwitterRegister = async () => {
    let url = `${USERS_URL}/register/twitter`;
    await WebBrowser.openBrowserAsync(url)
  }

  return (
    <Block flex style={styles.container}>
      {/* <StatusBar backgroundColor={theme.COLORS.BLACK} /> */}
      <Block flex space="between">
        {/* classic registration */}
        <Block flow middle style={{ marginTop: 210 }}>
          <Text
            style={{
              fontFamily: "open-sans-bold",
              textAlign: "center",
              color: theme.COLORS.WHITE
            }}
            size={24}
          >
            Ingresar
          </Text>

          <Text
            style={{
              fontFamily: "open-sans-regular",
              textAlign: "center",
              marginTop: 16,
            }}
            size={16}
            color={theme.COLORS.WHITE}
          >
            Puedes ingresar con tu usuario y contraseña, tambien puedes hacerlo con tu provedor de preferencia.
          </Text>

          <Button
            shadowless
            style={styles.loginButton}
            color={"#40DF9F"}
            onPress={() => navigation.navigate("Login")}
          >
            <Text
              style={{ fontFamily: "open-sans-bold", fontSize: 14 }}
              color={theme.COLORS.WHITE}
            >
             Ingresar con Usuario y Contraseña
            </Text>
          </Button>

          <Block
            style={{
              borderColor: "#D8D8D8",
              width: "90%",
              borderWidth: StyleSheet.hairlineWidth,
              marginTop: 12,
            }}
          />
          <Text
            style={{
              fontFamily: "open-sans-regular",
              textAlign: "center",
              marginTop: 12,
            }}
            size={16}
            color={theme.COLORS.WHITE}
          >
            Ingresa tambien con tu proovedor
          </Text>
        </Block>

        {/* social registration */}
        <Block flex row style={styles.socialContainer}>
          <Button
            round
            onlyIcon
            shadowless
            icon="twitter"
            iconFamily="Font-Awesome"
            iconColor={theme.COLORS.WHITE}
            iconSize={theme.SIZES.BASE * 1.0}
            color={argonTheme.COLORS.TWITTER}
            onPress={handleTwitterRegister}
          />
          <Button
            round
            onlyIcon
            shadowless
            icon="google"
            iconFamily="Font-Awesome"
            iconColor={theme.COLORS.WHITE}
            iconSize={theme.SIZES.BASE * 1.0}
            color={argonTheme.COLORS.DEFAULT}
            onPress={handleGoogleRegister}
          />
        </Block> 
      </Block>
    </Block>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Platform.OS === "android" ? -HeaderHeight : 0,
  },
  padded: {
    paddingHorizontal: theme.SIZES.BASE * 2,
    zIndex: 3,
    position: "absolute",
    bottom:
      Platform.OS === "android" ? theme.SIZES.BASE * 2 : theme.SIZES.BASE * 3,
  },
  button: {
    width: width - theme.SIZES.BASE * 4,
    height: theme.SIZES.BASE * 3,
    shadowRadius: 0,
    shadowOpacity: 0,
  },
  loginButton: {
    width: width - theme.SIZES.BASE * 4,
    height: theme.SIZES.BASE * 3,
    shadowRadius: 0,
    shadowOpacity: 0,
    marginTop: 20
  },
  socialContainer: {
    marginTop: 8, 
    paddingHorizontal: 135
  }, 
  alreadyHasAccount: {
    marginBottom: 40
  },
  pro: {
    backgroundColor: argonTheme.COLORS.INFO,
    paddingHorizontal: 8,
    marginLeft: 3,
    borderRadius: 4,
    height: 22,
    marginTop: 15,
  },
  gradient: {
    zIndex: 1,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 66,
  },
});
