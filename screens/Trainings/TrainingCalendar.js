import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from "react-native";
import { Agenda } from "react-native-calendars";
import testIDs from "./testIds";
import { LocaleConfig } from "react-native-calendars";
import axios from "axios";
import {  formatTime, TEAMS_URL, TRAININGS_URL, USERS_URL } from "../../utils/utils.";
import { Block, Button } from "galio-framework";
import { argonTheme } from "../../constants";

LocaleConfig.locales["fr"] = {
  monthNames: [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ],
  monthNamesShort: [
    "Ene.",
    "Feb.",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul.",
    "Ago",
    "Sept.",
    "Oct.",
    "Nov.",
    "Dic.",
  ],
  dayNames: [
    "Domingo",
    "Lunes",
    "Martes",
    "Miercoles",
    "Jueves",
    "Viernes",
    "Sabado",
  ],
  dayNamesShort: ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"],
  today: "Hoy",
};
LocaleConfig.defaultLocale = "fr";

export default function TrainingCalendar(props) {
  const { navigation } = props;
  const [items, setItems] = useState({});
  const [todayDateFormatted, setTodayDateFormatted] = useState("");

  const loadFieldMatches = async (day) => {
    await axios.get(`${TRAININGS_URL}?data=${props.route.params.team.key}`).then( async (response) => {
      let myItems = {};

      let trainings = response.data.data;

      for (let i = 0; i < trainings.length; i++) {
        const match = trainings[i];
        let timestamp = match.timestamp;
        let matchDate = new Date(timestamp * 1000);
        let matchFullyear = matchDate.getUTCFullYear();
        let matchMonth = (matchDate.getMonth() + 1).toString().length > 1 ? matchDate.getMonth() + 1 : `0${matchDate.getMonth() + 1}`;
        let matchDay = matchDate.getDate().toString().length > 1 ? matchDate.getDate() + 1 : `0${matchDate.getDate() + 1}`;
        let date = `${matchFullyear}-${matchMonth}-${matchDay}`;
        let team = (await axios.get(`${TEAMS_URL}/${match.team}`)).data.data
        let coach = (await axios.get(`${USERS_URL}/${match.coach}`)).data.data
        let dateInfo = {
          day: date,
          height: 100,
          match: match,
          coach: coach,  
          team: `Entreno ${team.name}`,
          hour: formatTime(match.hour),
          date: match.date,
          confirmed: match.confirmedAction ? 'Confirmada' : 'Pendiente'
        };
        let isDateAlready = Object.keys(myItems).filter((key) => key === date).length;
        if (isDateAlready > 0) {
          myItems[date] = [...myItems[date], dateInfo];
        } else {
          myItems = { ...myItems, [date]: [dateInfo] };
        }
      }
      const todayHasItems = Object.keys(myItems).filter((key) => key === todayDateFormatted).length > 0;
      if (!todayHasItems) {
        myItems = { ...myItems, [todayDateFormatted]: [] };
      }
      const dayHasItems = Object.keys(items).filter((key) => key === day.dateString).length > 0;
      if (!dayHasItems) {
        setItems({...myItems, [day.dateString]: [], });
      }
    });
  };

  const handleOnDayPressed = (day) => {
    const dayHasItems = Object.keys(items).filter((key) => key === day.dateString).length > 0;
    if (!dayHasItems) {
      setItems({...items,[day.dateString]: [],});
    }
  };

  useEffect(() => {
    let todayDate = new Date();
    let fullyear = todayDate.getUTCFullYear();
    let month =
      (todayDate.getMonth() + 1).toString().length > 1
        ? todayDate.getMonth() + 1
        : `0${todayDate.getMonth() + 1}`;
    let day =
      todayDate.getDate().toString().length > 1
        ? todayDate.getDate()
        : `0${todayDate.getDate()}`;

    setTodayDateFormatted(`${fullyear}-${month}-${day}`);
    loadFieldMatches();
  }, []);

  const renderItem = (reservation) => {
    return (
      <TouchableOpacity
        testID={testIDs.agenda.ITEM}
        style={[styles.item]}
        onPress={() => navigation.navigate("Training", { training: reservation.match, coach: reservation.coach })}
      >
        <Block flex row >
          {/* left side */}
          <Block left style={styles.leftContainer}>
            <Text
              style={{
                fontFamily: "open-sans-bold",
                marginLeft: 8,
                color: argonTheme.COLORS.WHITE,
              }}
              size={14}
            >
              {`${reservation.team}`}
            </Text>
            <Text
              style={{
                fontFamily: "open-sans-bold",
                marginLeft: 8,
                marginTop: 8,
                color: argonTheme.COLORS.WHITE,
              }}
              size={14}
              color={argonTheme.COLORS.WHITE}
            >
              {`${reservation.date}`}
            </Text>
            <Text
              style={{
                fontFamily: "open-sans-bold",
                marginLeft: 8,
                marginTop: 8,
                color: argonTheme.COLORS.WHITE,
              }}
              size={14}
              color={argonTheme.COLORS.WHITE}
            >
              {`Hora: ${reservation.hour}`}
            </Text>
          </Block>
          
          {/* right side */}
          <Block right style={styles.rightContainer}>
            <Button
              style={{width: 100}}
              textStyle={{ fontFamily: "open-sans-bold", fontSize: 10 }}
              small
              color={
                reservation.confirmed === "Confirmada" ? "success" : "warning"
              }
              shadowless
            >
              {reservation.confirmed}
            </Button>
          </Block>
        </Block>
      </TouchableOpacity>
    );
  };

  const renderEmptyDate = () => {
    return (
      <View style={styles.emptyDate}>
        <Text
          style={{
            fontFamily: "open-sans-bold",
            marginLeft: 8,
            marginTop: 8,
            color: argonTheme.COLORS.WHITE,
          }}
          size={16}
          color={argonTheme.COLORS.WHITE}
        >
          {`No hay eventos para este dia`}
        </Text>
      </View>
    );
  };

  const rowHasChanged = (r1, r2) => {
    return r1.name !== r2.name;
  };

  return (
    <Agenda
      testID={testIDs.agenda.CONTAINER}
      items={items}
      loadItemsForMonth={loadFieldMatches}
      onDayPress={handleOnDayPressed}
      selected={todayDateFormatted}
      renderItem={renderItem}
      renderEmptyDate={renderEmptyDate}
      rowHasChanged={rowHasChanged}
      showClosingKnob={true}
      hideKnob={false}
      refreshing={true}
      theme={{
        backgroundColor: '#22343C',
        calendarBackground: '#22343C',
        textSectionTitleColor: '#b6c1cd',
        textSectionTitleDisabledColor: '#979797',
        selectedDayBackgroundColor: '#3DD598',
        selectedDayTextColor: '#ffffff',
        todayTextColor: '#ffffff',
        dayTextColor: '#ffffff',
        textDisabledColor: '#979797',
        dotColor: '#FF565E',
        selectedDotColor: '#ffffff',
        arrowColor: 'white',
        disabledArrowColor: '#979797',
        monthTextColor: 'white',
        indicatorColor: 'white',
        textDayFontFamily: 'open-sans-regular',
        textMonthFontFamily: 'open-sans-regular',
        textDayHeaderFontFamily: 'open-sans-regular',
        textDayFontWeight: '300',
        textMonthFontWeight: 'bold',
        textDayHeaderFontWeight: '300',
        textDayFontSize: 14,
        textMonthFontSize: 14,
        textDayHeaderFontSize: 14,
        agendaDayTextColor: '#FF565E',
        agendaDayNumColor: '#FF565E',
        agendaTodayColor: '#FF565E',
        agendaKnobColor: '#3DD598',
        'stylesheet.agenda.list': styles.overriteListStyles,
        'stylesheet.agenda.main': styles.overriteAgendaMainStyles
      }}
    />
  );
}

const styles = StyleSheet.create({
  overriteAgendaMainStyles: {
    container: {
      flex: 1,
      overflow: "hidden",
      marginTop: 80,
    },
    reservations: {
      flex: 1,
      marginTop: 104,
      backgroundColor: "#22343C",
    },
  },
  overriteListStyles: {
    container: {
      flexDirection: "row",
      backgroundColor: "#22343C",
    },
  },
  item: {
    backgroundColor: "#30444E",
    flex: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17,
  },
  emptyDate: {
    flex: 1,
    backgroundColor: "#30444E",
    borderRadius: 5,
    marginRight: 10,
    marginTop: 17,
  },

  leftContainer: {
    marginTop: 12,
    flex: 0.5,
  },
  rightContainer: {
    marginLeft: 30,
    flex: 0.5,
    top: 20,
  },
});
