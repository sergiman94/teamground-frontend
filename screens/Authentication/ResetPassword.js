import React, { useState } from "react";
import {
  StyleSheet,
  ImageBackground,
  Dimensions,
  StatusBar,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Block, Checkbox, Text } from "galio-framework";
import { Button, Header, Icon, Input } from "../../components";
import { Images, argonTheme } from "../../constants";
import axios from "axios";
import { MAILERSEND_URL, USERS_URL } from "../../utils/utils.";
import SnackBar from "react-native-snackbar-component";
import * as Progress from "react-native-progress";
import AsyncStorage from "@react-native-async-storage/async-storage";
const { width, height } = Dimensions.get("screen");

const DismissKeyboard = ({ children }) => (
  <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
    {children}
  </TouchableWithoutFeedback>
);

export default function ResetPassword (props) {
  const { navigation, scene } = props;
  const [showProgres, setShowProgres] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState("")
  const [snackbarColor, setSnackbarColor] = useState("#93C46F")
  const [titleMarginTop, setTitleMarginTop] = useState(0)
  const [buttonLoading, setButtonLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("")

  const handleResetPassword = async () => {
    setShowProgres(true)
    setButtonLoading(true)
    await axios.get(`${USERS_URL}/email/${email}`).then(async (response) => { 
        let userId = response.data.data.key
        await axios.post(`${MAILERSEND_URL}/reset`, {userId: userId}).then(() => {
            setButtonLoading(false)
            setShowProgres(false)
            setShowSnackbar(true);
            setSnackbarColor("#93C46F");
            setSnackbarMessage("Se ha enviado un correo para que restablezcas tu contraseña");
            setTimeout(() => {
                setShowSnackbar(false);
                setButtonLoading(false)
            }, 1500);
        })
    }).catch(() => {
        setButtonLoading(false)
        setShowProgres(false)
        setShowSnackbar(true);
        setSnackbarColor("#BB6556");
        setSnackbarMessage("Confirmaste tu correo ? no hemos encontrado un usuario con este correo.");
        setTimeout(() => {
            setShowSnackbar(false);
            setButtonLoading(false)
        }, 1500);
    })
  }

  return (
    <>
      <Block flex>
        <Header
          title=""
          back
          transparent
          bgColor={"#22343C"}
          titleColor={"#FFFFFF"}
          navigation={navigation}
          scene={scene}
        />

        <Block style={{ backgroundColor: "#22343C" }} flex middle>
          {showProgres ? (
            <Progress.Bar width={width - 30} indeterminate={true} />
          ) : (
            <></>
          )}
          <SnackBar
            visible={showSnackbar}
            position={"top"}
            backgroundColor={snackbarColor}
            textMessage={snackbarMessage}
          />
          <Block style={styles.registerContainer}>
            <Block flex space="between">
              <Block flex={1} middle space="between">

                {/* title and description */}
                <Block flex={0.3} middle>
                  <Text
                    style={{
                      fontFamily: "open-sans-bold",
                      textAlign: "center",
                      marginTop: 80,
                    }}
                    color="#FFFFFF"
                    size={30}
                  >
                    {" "}
                    Restablecer Contraseña
                  </Text>

                  <Text
                    style={{
                      fontFamily: "open-sans-regular",
                      textAlign: "center",
                      marginTop: 4,
                    }}
                    color="#FFFFFF"
                    size={14}
                  >
                    {" "}
                    Ingresa tu correo electronico, te enviaremos un correo electronico para restablecer tu contraseña
                  </Text>
                </Block>

                <Block center flex={0.7}>
                  <Block flex space="between">
                    {/* inputs */}
                    <Block>
                      {/* email */}
                      <Block width={width * 0.8} style={{ marginBottom: 5 }}>
                        <Input
                          borderless
                          style={{ backgroundColor: "#30444E" }}
                          placeholder="Correo Electronico"
                          color={"#FFFFFF"}
                          onChangeText={(value) =>
                             setEmail(value)
                          }
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
                    </Block>

                    {/* send reset button */}
                    <Block center>
                      <Button
                        color="primary"
                        onPress={(event) => handleResetPassword(event)}
                        style={styles.createButton}
                        loading={buttonLoading}
                      >
                        <Text
                          style={{ fontFamily: "open-sans-bold" }}
                          size={14}
                          color={argonTheme.COLORS.WHITE}
                        >
                          Restablecer
                        </Text>
                      </Button>
                    </Block>
                  </Block>
                </Block>
              </Block>
            </Block>
          </Block>
        </Block>
      </Block>
    </>
  );
}

const styles = StyleSheet.create({
  registerContainer: {
    width: width * 0.9,
    height: height < 812 ? height * 0.9 : height * 0.8,
    backgroundColor: "#22343C",
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
    marginBottom: 100,
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
    marginTop: 25,
    backgroundColor: "#40DF9F",
  },
  forgotPasswordButton: {
    marginTop: 8,
    fontFamily: "open-sans-regular",
    marginBottom: 280,
    color: "#40DF9F",
  },
});
