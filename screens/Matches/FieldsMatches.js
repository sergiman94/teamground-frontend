import React from "react";
import {
  StyleSheet,
  Dimensions,
  ScrollView
} from "react-native";
import { Block, theme, Text } from "galio-framework";
import { argonTheme } from "../../constants";
const { width } = Dimensions.get("screen");
import MatchCard from "../../components/MatchCard";

export default function FieldsMatches(props) {
  const renderProducts = () => {
    const { navigation, route } = props;
    const field = route.params?.field;
    
    return (
      <>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.products}
        >
          <Block flex style={{ marginTop: 100, padding: 10 }}>
            <Text
              style={{ marginBottom: 24, fontFamily: "open-sans-bold" }}
              size={20}
              color={argonTheme.COLORS.WHITE}
            >
              {`Partidos de ${field.field}`}
            </Text>

            <Block flex>
              {field.matches.length < 0 ? (
                <></>
              ) : (
                field.matches.map((match) => (
                  <MatchCard item={match} fieldProp={field} horizontal {...props} />
                ))
              )}
            </Block>
          </Block>
        </ScrollView>
      </>
    );
  };

  return (
    <Block flex center style={styles.deals}>
      {renderProducts()}
    </Block>
  );
}

const styles = StyleSheet.create({
  deals: {
    backgroundColor: "#22343C",
    width,
  },
  products: {
    width: width - theme.SIZES.BASE ,
    paddingVertical: theme.SIZES.BASE,
  },
});
