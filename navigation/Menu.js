import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet, Dimensions, Image, TouchableOpacity, Linking } from "react-native";
import { Block, Text, theme } from "galio-framework";
import { DrawerItem as DrawerCustomItem, Icon } from '../components/index'
import axios from "axios";
import { USERS_URL } from "../utils/utils.";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DrawerProfileMiniature from "../components/DrawerProfileMiniature";

const { width } = Dimensions.get("screen");

function CustomDrawerContent(props) {
  const {role, drawerPosition, navigation, profile, focused, state, ...rest } = props 
  const [user, setUser] = useState(null)
  const adminMenu = [
    "Home", 
    "Cuentas", 
  ]

  const fieldMenu = [
    "Perfil"
  ]

  const regularMenu = [
    "Perfil",
    "Mi Equipo"
  ];

  const getUser = async () => { 
    let userKey = await AsyncStorage.getItem("@user_id")
    if (userKey) {
      const userData = (await axios.get(`${USERS_URL}/${userKey}`)).data
      setUser(userData.data)
    }
  }

  useEffect(() => { 
    if (!user) getUser()
  })

  const handleLogoutAction = async () => { 
    let userKey = await AsyncStorage.getItem("@user_id")
    await axios.post(`${USERS_URL}/revoke/pushtoken/${userKey}`)
    await AsyncStorage.multiRemove(["@field_id", "@user_id", "@updated_match", "@user_role"]).then(() => setUser(null))
    props.reset()
  }

  const handleLoginAction = () => { 
    const { navigation } = props
    navigation.navigate("AuthenticationHandler")
  }

  const logoutAction = () => { 
    return (
      <TouchableOpacity
        style={{ height: 60 }}
        onPress={() => handleLogoutAction()}
      >
        <Block flex row style={styles.logoutStyle}>
          <Block middle flex={0.1} style={{ marginRight: 5 }}>
            <Icon
              name="sign-out"
              family="Font-Awesome"
              size={14}
              color={"red"}
            />
          </Block>
          <Block row center flex={0.9}>
            <Text
              style={{ fontFamily: "open-sans-regular" }}
              size={15}
              bold={true}
              color={"#96A7AF"}
            >
              Cerrar Sesión
            </Text>
          </Block>
        </Block>
      </TouchableOpacity>
    )
  }

  const loginAction = () => {
    return (
      <TouchableOpacity
        style={{ height: 60 }}
        onPress={() => handleLoginAction()}
      >
        <Block flex row style={styles.logoutStyle}>
          <Block middle flex={0.1} style={{ marginRight: 5 }}>
            <Icon
              name="sign-in"
              family="Font-Awesome"
              size={14}
              color={"#40DF9F"}
            />
          </Block>
          <Block row center flex={0.9}>
            <Text
              style={{ fontFamily: "open-sans-regular" }}
              size={15}
              bold={true}
              color={"#96A7AF"}
            >
              Iniciar Sesión
            </Text>
          </Block>
        </Block>
      </TouchableOpacity>
    )
  }

  const screens = role === 'player' ? regularMenu : role ==="admin" ? adminMenu : fieldMenu
  return (
    <Block
      style={styles.container}
      forceInset={{ top: "always", horizontal: "never" }}
    >
      <Block flex={0.1} style={styles.header}>
        {user ? <DrawerProfileMiniature item={user} /> : <></>}
      </Block>
      <Block flex style={{ paddingLeft: 8, paddingRight: 14 }}>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {screens.map((item, index) => {
            return (
              <DrawerCustomItem
                title={item}
                key={index}
                navigation={navigation}
                focused={state.index === index ? true : false}
              />
            );
          })}
          <Block
            flex
            style={{ marginTop: 24, marginVertical: 8, paddingHorizontal: 8 }}
          >
            <Block
              style={{
                borderColor: "rgba(0,0,0,0.2)",
                width: "100%",
                borderWidth: StyleSheet.hairlineWidth,
              }}
            />
          </Block>
          {user ? logoutAction() : loginAction()}
        </ScrollView>
      </Block>
    </Block>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#22343C"
  },
  header: {
    paddingHorizontal: 28,
    paddingBottom: theme.SIZES.BASE,
    paddingTop: theme.SIZES.BASE * 3,
    justifyContent: "center"
  },
  logoutStyle: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 2,
  },
});

export default CustomDrawerContent;
