import React from "react";
import {
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import { Block, Text } from "galio-framework";
import { Button, Header, Icon, Input } from "../../components";
import { argonTheme } from "../../constants";
import axios from "axios";
import { USERS_URL } from "../../utils/utils.";
import SnackBar from "react-native-snackbar-component";
import * as Progress from "react-native-progress";
import AsyncStorage from "@react-native-async-storage/async-storage";
const { width, height } = Dimensions.get("screen");
const Logo = require("../../assets/appIcon.png");

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      showSnackbar: false,
      snackbarMessage: "Hello",
      snackbarColor: "#93C46F",
      titleMarginTop: 0,
      showProgressBar: false,
      buttonlLoading: false,
    };
  }

  handleLogin = async () => {
    this.setState({ showProgressBar: true });
    this.setState({ buttonlLoading: true });

    let body = {
      username: this.state.username.toLowerCase(),
      password: this.state.password.toLowerCase(),
    };

    await axios
      .post(`${USERS_URL}/login`, body)
      .then(async (res) => {
        this.setState({ showProgressBar: false });
        this.setState({ buttonlLoading: false });

        if (res.data === "No User Exists") {
          this.setState({ showProgressBar: false });
          this.setState({ snackbarColor: "#BB6556" });
          this.setState({ snackbarMessage: "Usuario o contraseña invalidas" });
          this.setState({ showSnackbar: true });

          setTimeout(() => {
            this.setState({ showSnackbar: false });
            this.setState({ buttonlLoading: false });
          }, 2500);
        } else {
          const { navigation } = this.props;
          navigation.navigate("App");
          await AsyncStorage.multiSet([["@field_id", res.data.field], ["@user_id", res.data.key], ["@updated_match", "false"], ["@user_role", res.data.role]], () => {
            console.log('local storage user values initialized')
          })
          // await AsyncStorage.setItem("@field_id", res.data.field); 
          // await AsyncStorage.setItem("@user_id", res.data.key);
          // await AsyncStorage.setItem("@updated_match", "false");
          // await AsyncStorage.setItem("@user_role", res.data.role);
          let appPushToken = await AsyncStorage.getItem("@pushToken")
          if (appPushToken) {
            await axios.post(`${USERS_URL}/pushtoken/${res.data.key}/${appPushToken}`).catch(error => console.log(error))
          } else {
            console.log('no token found in local storage')
          }
        }
      })
      .catch((error) => {
        console.log("Error on login --> ", error);
      });
  };

  render() {
    const { navigation, scene } = this.props;
    let showProgres = this.state.showProgressBar;

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
              visible={this.state.showSnackbar}
              position={"top"}
              backgroundColor={this.state.snackbarColor}
              textMessage={this.state.snackbarMessage}
            />
            <Block style={styles.registerContainer}>
              <Block flex space="between">
                <Block flex={1} middle space="between">
                  <Block flex={0.3} middle>
                    <Image
                      source={Logo}
                      style={styles.horizontalImage}
                    />
                  </Block>

                  <Block center flex={0.7}>
                    <Block flex space="between">
                      {/* inputs */}
                      <Block>
                        {/* name */}
                        <Block width={width * 0.8} style={{ marginBottom: 5 }}>
                          <Input
                            borderless
                            style={{ backgroundColor: "#30444E" }}
                            placeholder="Nombre de usuario"
                            color={"#FFFFFF"}
                            onChangeText={(value) =>
                              this.setState({ username: value })
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

                        {/* password */}
                        <Block width={width * 0.8}>
                          <Input
                            password
                            borderless
                            color={"#FFFFFF"}
                            style={{ backgroundColor: "#30444E" }}
                            placeholder="Contraseña"
                            onChangeText={(value) =>
                              this.setState({ password: value })
                            }
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
                      </Block>

                      {/* login button */}
                      <Block center>
                        <Button
                          color="primary"
                          onPress={(event) => this.handleLogin(event)}
                          style={styles.createButton}
                          loading={this.state.buttonlLoading}
                        >
                          <Text
                            style={{ fontFamily: "open-sans-bold" }}
                            size={14}
                            color={argonTheme.COLORS.WHITE}
                          >
                            INGRESAR
                          </Text>
                        </Button>

                        <Text
                          style={styles.forgotPasswordButton}
                          size={14}
                          onPress={() => {
                            navigation.navigate("ResetPassword");
                          }}
                        >
                          ¿ Olvidaste tu contraseña ?
                        </Text>
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
    color: "#40DF9F"
  },
  horizontalImage: {
    top: 16,
    width: 108,
    height: 108,
    borderRadius: 16
  }
});

export default Login;
