import React from "react";
import { StyleSheet, TouchableOpacity, Linking } from "react-native";
import { Block, Text, theme } from "galio-framework";

import Icon from "./Icon";
import argonTheme from "../constants/Theme";

class DrawerItem extends React.Component {
  renderIcon = () => {
    const { title, focused } = this.props;

    switch (title) {
      case "Home":
        return (
          <Icon
            name="home"
            family="Font-Awesome"
            size={20}
            color={focused ? "#96A7AF" : "#96A7AF"}
          />
        );
      case "Canchas":
        return (
          <Icon
            name="shop"
            family="ArgonExtra"
            size={14}
            color={focused ? "#96A7AF" : "#96A7AF"}
          />
        );
      case "Partidos":
        return (
          <Icon
            name="futbol-o"
            family="Font-Awesome"
            size={14}
            color={focused ? "#96A7AF" : "#96A7AF"}
          />
        );
      case "Reservas":
        return (
          <Icon
            name="bookmark"
            family="Font-Awesome"
            size={14}
            color={focused ? "#96A7AF" : "#96A7AF"}
          />
        );
      case "Perfil":
        return (
          <Icon
            name="user"
            family="Font-Awesome"
            size={14}
            color={focused ? "#96A7AF" : "#96A7AF"}
          />
        );
      case "Calendario":
        return (
          <Icon
            name="calendar"
            family="Font-Awesome"
            size={14}
            color={focused ? "#96A7AF" : "#96A7AF"}
          />
        );
      case "Cerrar Sesion":
        return (
          <Icon
            name="sign-out"
            family="Font-Awesome"
            size={14}
            color={focused ? "white" : "#FF565E"}
          />
        );

        case "Mi Equipo":
          return (
            <Icon
              name="rocket"
              family="Font-Awesome"
              size={20}
              color={focused ? "#96A7AF" : "#96A7AF"}
            />
          );
      case "Log out":
        return <Icon />;
      default:
        return null;
    }
  };

  render() {
    const { focused, title, navigation } = this.props;

    const containerStyles = [
      styles.defaultStyle,
      focused ? [styles.activeStyle] : null
    ];

    return (
      <TouchableOpacity
        style={{ height: 60 }}
        onPress={() => title == 'Getting Started' ? Linking.openURL('https://demos.creative-tim.com/argon-pro-react-native/docs/').catch((err) => console.error('An error occurred', err)) : navigation.navigate(title)}
      >
        <Block flex row style={containerStyles}>
          <Block middle flex={0.1} style={{ marginRight: 5 }}>
            {this.renderIcon()}
          </Block>
          <Block row center flex={0.9}>
            <Text
              style={{ fontFamily: "open-sans-regular" }}
              size={15}
              bold={focused ? true : false}
              color={focused ? "#96A7AF" : "#96A7AF"}
            >
              {title}
            </Text>
          </Block>
        </Block>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  defaultStyle: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 2,
  },
  activeStyle: {
    borderRadius: 4
  }
});

export default DrawerItem;
