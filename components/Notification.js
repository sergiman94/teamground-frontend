import React from "react";
import { StyleSheet, TouchableWithoutFeedback } from "react-native";
import PropTypes from "prop-types";
import { Block, Text } from "galio-framework";
import Icon from "./Icon";
import { argonTheme } from "../constants";

export default class Notification extends React.Component {
  render() {
    const {
      body,
      color, // this could be implemented for next releases
      iconColor,
      iconFamily,
      iconName,
      iconSize,
      style,
      system,
      time,
      title,
    } = this.props;

    const iconContainer = [
      styles.iconContainer,
      { backgroundColor: iconName === 'rocket' ? argonTheme.COLORS.SUCCESS : argonTheme.COLORS.ERROR },
      system && { width: 34, height: 34 }
    ];

    const container = [
      styles.card,
      style
    ];
    return (
      <Block style={container} middle>
          <Block row style={{ width: "95%" }}>
            {/* icon */}
            <Block top flex={0.2} middle>
              <Block middle style={iconContainer}>
                <Icon
                  name={iconName}
                  family={iconFamily}
                  size={iconSize ? 16 : 22}
                  color={
                    iconColor
                      ? argonTheme.COLORS.WHITE
                      : argonTheme.COLORS.WHITE
                  }
                />
              </Block>
            </Block>
            
            {/* text and time */}
            <Block style={styles.textAndTimeContainer}>
              {/* text */}
              <Block  style={{ paddingRight: 3, paddingLeft: 12 }}>
                {system && (
                  <Block row space="between" style={{ height: 18 }}>
                    <Text
                      color={argonTheme.COLORS.MUTED}
                      style={{ fontFamily: "open-sans-bold" }}
                      size={13}
                    >
                      {title}
                    </Text>
                    <Block row style={{ marginTop: 3 }}>
                      <Icon
                        family="material-community"
                        name="clock"
                        size={12}
                        color={argonTheme.COLORS.MUTED}
                      />
                      <Text
                        color={argonTheme.COLORS.MUTED}
                        style={{
                          fontFamily: "open-sans-regular",
                          marginLeft: 3,
                          marginTop: -3,
                        }}
                        size={12}
                      >
                        {time}
                      </Text>
                    </Block>
                  </Block>
                )}
                <Text
                  color={argonTheme.COLORS.WHITE}
                  size={system ? 13 : 14}
                  style={styles.title}
                >
                  {body}
                </Text>
              </Block>

              {/* time */}
              <Block row style={{ paddingRight: 3, paddingLeft: 20, marginTop: 8 }}>
                <Icon
                  family="material-community"
                  name="clock"
                  size={12}
                  color={argonTheme.COLORS.MUTED}
                />
                <Text
                  color={argonTheme.COLORS.MUTED}
                  style={{
                    fontFamily: "open-sans-regular",
                    marginLeft: 3,
                    marginTop: -2,
                  }}
                  size={12}
                >
                  {time}
                </Text>
              </Block>
            </Block>

          </Block>
      </Block>
    );
  }
}

Notification.propTypes = {
  body: PropTypes.string,
  color: PropTypes.string,
  iconColor: PropTypes.string,
  iconFamily: PropTypes.string,
  iconName: PropTypes.string,
  iconSize: PropTypes.number,
  onPress: PropTypes.func,
  style: PropTypes.object,
  system: PropTypes.bool,
  time: PropTypes.string,
  title: PropTypes.string,
  transparent: PropTypes.bool,
};

const styles = StyleSheet.create({
  card: {
    zIndex: 2,
    height: 127,
    borderRadius: 6,
    backgroundColor: "#30444E",
    paddingVertical: 8,
    paddingHorizontal: 8
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginTop: 2,
  },
  textAndTimeContainer: {
    marginLeft: 24
  },
  title: {
    fontFamily: "open-sans-bold",
    paddingHorizontal: 8
  },
  iconShadow: {
    shadowColor: "black",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
    shadowOpacity: 0.1,
    elevation: 2
  },
  cardShadow: {
    shadowColor: argonTheme.COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 0.1,
    elevation: 2
  }
});
