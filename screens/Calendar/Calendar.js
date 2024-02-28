import React, { Component, useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View, TouchableOpacity, Dimensions } from "react-native";
import {
  Agenda,
  DateData,
  AgendaEntry,
  AgendaSchedule,
} from "react-native-calendars";
import testIDs from "./testIds";

import { LocaleConfig } from "react-native-calendars";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BOOKINGS_URL, formatTime, MATCHES_URL, TRAININGS_URL, USERS_URL } from "../../utils/utils.";
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

export default function AgendaScreen(props) {
  const [items, setItems] = useState({});
  const [trainingItems, setTrainingItems] = useState({})
  const [todayDateFormatted, setTodayDateFormatted] = useState("");

  const loadFieldMatches = async (day) => {
    let fieldId = await AsyncStorage.getItem("@field_id");

    // field matches
    await axios.get(`${MATCHES_URL}/field/${fieldId}`).then( async (response) => {
      let myItems = {};

      let fieldMatches = response.data.data;

      for (let i = 0; i < fieldMatches.length; i++) {
        const match = fieldMatches[i];
        let timestamp = match.timestamp;

        let matchDate = new Date(timestamp * 1000);
        let matchFullyear = matchDate.getUTCFullYear();
        let matchMonth = (matchDate.getMonth() + 1).toString().length > 1 ? matchDate.getMonth() + 1 : `0${matchDate.getMonth() + 1}`;
        let matchDay = matchDate.getDate().toString().length > 1 ? matchDate.getDate() + 1 : `0${matchDate.getDate() + 1}`;

        let date = `${matchFullyear}-${matchMonth}-${matchDay}`;

        let organizer = (await axios.get(`${USERS_URL}/${match.organizer}`)).data.data
        let matchBooking = (await axios.get(`${BOOKINGS_URL}/match/${match.key}`)).data.data[0]

        let dateInfo = {
          day: date,
          height: 100,
          organizer: `Partido de ${organizer.displayName}`,
          hour: formatTime(match.hour),
          date: match.date,
          confirmed: matchBooking && matchBooking.confirmedAction ? 'Confirmada' : 'Sin Confirmar'
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
        myItems = {...myItems, [todayDateFormatted]: [] };
      }

      const dayHasItems = Object.keys(items).filter((key) => key === day.dateString).length > 0;
      if (!dayHasItems) {
        setItems({...myItems, [day.dateString]: [], });
      }
    });

    // field trainings
    await axios.get(`${TRAININGS_URL}/field/${fieldId}`).then( async (response) => { 
      let myItems = {};
      let fieldTrainings = response.data.data;
      for (let i = 0; i < fieldTrainings.length; i++) {
        const training = fieldTrainings[i];
        let timestamp = training.timestamp;

        let trainingDate = new Date(timestamp * 1000);
        let trainingFullyear = trainingDate.getUTCFullYear();
        let trainingMonth = (trainingDate.getMonth() + 1).toString().length > 1 ? trainingDate.getMonth() + 1 : `0${trainingDate.getMonth() + 1}`;
        let trainingDay = trainingDate.getDate().toString().length > 1 ? trainingDate.getDate() + 1 : `0${trainingDate.getDate() + 1}`;

        let date = `${trainingFullyear}-${trainingMonth}-${trainingDay}`;

        let organizer = (await axios.get(`${USERS_URL}/${training.coach}`)).data.data
        let trainingBooking = (await axios.get(`${BOOKINGS_URL}/field/${fieldId}`)).data.data.filter(trainingBooking => training.key === trainingBooking.training)[0] // TODO: change this to the - get by training id api

        let dateInfo = {
          day: date,
          height: 100,
          organizer: `Entreno de ${organizer.displayName}`,
          hour: formatTime(training.hour),
          date: training.date,
          confirmed: trainingBooking && trainingBooking.confirmedAction ? 'Confirmada' : 'Sin Confirmar',
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
        myItems = {...myItems, [todayDateFormatted]: [] };
      }
      const dayHasItems = Object.keys(trainingItems).filter((key) => key === day.dateString).length > 0;
      if (!dayHasItems) {
        setTrainingItems({...items,...trainingItems, ...myItems, [day.dateString]: [], });
      }
    })
  };

  const handleOnDayPressed = (day) => {
    // TODO: fix bug that the last item in the calendar dissapear
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

  // keep this as an example
  const loadItems = (day) => {
    const items = items || {};

    setTimeout(() => {
      for (let i = -15; i < 85; i++) {
        const time = day.timestamp + i * 24 * 60 * 60 * 1000;
        const strTime = timeToString(time);

        if (!items[strTime]) {
          items[strTime] = [];

          const numItems = Math.floor(Math.random() * 3 + 1);
          for (let j = 0; j < numItems; j++) {
            items[strTime].push({
              name: "Item for " + strTime + " #" + j,
              height: Math.max(50, Math.floor(Math.random() * 150)),
              day: strTime,
            });
          }
        }
      }

      const newItems = {};
      Object.keys(items).forEach((key) => {
        newItems[key] = items[key];
      });

      //console.log("agenda items --> ", newItems);

      setItems(newItems);
    }, 1000);
  };

  const renderItem = (reservation, isFirst) => {
    return (
      <TouchableOpacity
        testID={testIDs.agenda.ITEM}
        style={[styles.item]}
        onPress={() => Alert.alert(reservation.organizer)}
      >
        <Block flex row>
          <Block>
            <Text
              style={{
                fontFamily: "open-sans-bold",
                marginLeft: 8,
                marginTop: 8,
                color: argonTheme.COLORS.WHITE
              }}
              size={20}
            >
              {`${reservation.organizer}`}
            </Text>
            <Text
              style={{
                fontFamily: "open-sans-bold",
                marginLeft: 8,
                marginTop: 8,
                color: argonTheme.COLORS.WHITE
              }}
              size={16}
              color={argonTheme.COLORS.WHITE}
            >
              {`${reservation.date}`}
            </Text>
            <Text
              style={{
                fontFamily: "open-sans-bold",
                marginLeft: 8,
                marginTop: 8,
                color: argonTheme.COLORS.WHITE
              }}
              size={16}
              color={argonTheme.COLORS.WHITE}
            >
              {`Hora: ${reservation.hour}`}
            </Text>
          </Block>

          <Block>
            <Button
              style={{ width: 80, height: 20, marginLeft: 80, marginTop: 30}}
              textStyle={{ fontFamily: "open-sans-bold", fontSize: 10 }}
              small
              color={reservation.confirmed === 'Confirmada' ? "success" : "warning"}
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

  const timeToString = (time) => {
    const date = new Date(time);
    return date.toISOString().split("T")[0];
  };

  return (
    <Agenda
      testID={testIDs.agenda.CONTAINER}
      items={{...items, ...trainingItems}}
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
  overriteAgendaMainStyles:{
    reservations: {
      flex: 1,
      marginTop: 104,
      backgroundColor: "#22343C",
    },
  },
  overriteListStyles: { 
    container: {
      flexDirection: 'row',
      backgroundColor: "#22343C",
    }
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
    marginTop: 17
  },
});
