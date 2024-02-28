var AWS = require("aws-sdk");
AWS.config.update({
  maxRetries: 3,
  httpOptions: { timeout: 30000, connectTimeout: 5000 },
  region: "us-east-1",
  accessKeyId: "AKIAZZ7KKS75UZKFG6MV",
  secretAccessKey: "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",
});
let s3 = new AWS.S3();

//  ---------- home -----------
let BASE_URL = "https://teamground.herokuapp.com";
let BASE_SOCKET_LOCAL_URL = "https://teamground.herokuapp.com";

// let BASE_URL = "http://192.168.1.10:3000";
// let BASE_SOCKET_LOCAL_URL = "http://192.168.1.10:3000";

// -------- S3 ---------
let BASE_BUCKET = "nnproject";
let BASE_PROFILE_PICS_KEY = `profile_pics/users`;
let BASE_POST_PICS = 'post'
let BASE_FIELD_PICS = "field"
let BASE_TEAM_PICS = "team"

// ------ OUT ----------
// let BASE_URL = "http://172.20.10.4:3000"

// regular
let FIELDS_URL = `${BASE_URL}/v1/fields`;
let MATCHES_URL = `${BASE_URL}/v1/matches`;
let USERS_URL = `${BASE_URL}/v1/users`;
let BOOKINGS_URL = `${BASE_URL}/v1/bookings`;
let TEAMS_URL = `${BASE_URL}/v1/teams`;
let POSTS_URL = `${BASE_URL}/v1/posts`;
let PROMOS_URL = `${BASE_URL}/v1/promos`;
let TRAININGS_URL = `${BASE_URL}/v1/trainings`;
let MAILERSEND_URL = `${BASE_URL}/v1/mailersend`;
let NOTIFICATIONS_URL = `${BASE_URL}/v1/notifications` 

// highlighted
let HIGHLIGHTED_FIELDS_URL = `${FIELDS_URL}?highlighted=true`;
let HIGHLIGHTED_USERS_URL = `${USERS_URL}?highlighted=true`;
let HIGHLIGHTED_MATCHES_URL = `${MATCHES_URL}?highlighted=true`;

// JOIN USER
let JOIN_USER_TO_MATCH_URL = `${MATCHES_URL}/newplayer`;

// ACTIVE BOOKINGS BY USER ID
let GET_ACTIVE_BOOKINGS_BY_USER_ID = `${BOOKINGS_URL}/active`;

// ACTIVE BOOKINGS BY FIELD ID
let GET_ACTIVE_BOOKINGS_BY_FIELD_ID = `${BOOKINGS_URL}/field`;

const uploadImgToS3 = (params) => {
  return new Promise((resolve, reject) => {
    s3.upload(params, (s3Err, data) => {
      if (s3Err) {
        console.log(s3Err);
        reject(s3Err);
        return;
      }
      console.log(`File uploaded successfully at ${data.Location}`);
      resolve(data.Location);
    });
  });
};

const deleteS3Object = (params) => {
  return new Promise((resolve, reject) => {
    s3.deleteObject(params, (s3Err, data) => {
      if (s3Err) {
        console.log(s3Err);
        reject(s3Err);
        return;
      }
      console.log('object successfuly removed')
      resolve(data);
    })
  })
}

const timeAgo = (timestamp) => {
  const timeago = require("timeago.js");
  const format = timeago.format;
  const register = timeago.register;

  const localeFunc = (number, index, totalSec) => {
    // number: the timeago / timein number;
    // index: the index of array below;
    // totalSec: total seconds between date to be formatted and today's date;
    return [
      ["Justo ahora", "Justo Ahora"],
      ["Hace %s segundos", "En %s Segundos"],
      ["Hace 1 minuto", "En 1 Minuto"],
      ["Hace %s minutos", "En %s Minutos"],
      ["Hace 1 hora", "En 1 Hora"],
      ["Hace %s horas", "En %s Horas"],
      ["Hace 1 dia", "En 1 Dia"],
      ["Hace %s dias", "En %s Dias"],
      ["Hace 1 semana", "En 1 Semana"],
      ["Hace %s semanas", "En %s Semanas"],
      ["Hace 1 mes", "En 1 Mes"],
      ["Hace %s meses", "En %s Meses"],
      ["Hace 1 año", "En 1 Año"],
      ["Hace %s años", "En %s Años"],
    ][index];
  };
  // register your locale with timeago
  register("my-locale", localeFunc);

  let result = format(new Date(timestamp), 'my-locale');

  return result;
}

const formatTime = (time) => {
  let timeString = time + ":00"
  const [hourString, minute] = timeString.split(":");
  const hour = +hourString % 24;
  return (hour % 12 || 12) + ":" + minute + (hour < 12 ? " AM" : " PM");
}

module.exports = {
  FIELDS_URL,
  MATCHES_URL,
  USERS_URL,
  BOOKINGS_URL,
  PROMOS_URL,
  TRAININGS_URL,
  MAILERSEND_URL,
  HIGHLIGHTED_FIELDS_URL,
  HIGHLIGHTED_USERS_URL,
  HIGHLIGHTED_MATCHES_URL,
  JOIN_USER_TO_MATCH_URL,
  GET_ACTIVE_BOOKINGS_BY_USER_ID,
  GET_ACTIVE_BOOKINGS_BY_FIELD_ID,
  POSTS_URL,
  BASE_BUCKET,
  BASE_SOCKET_LOCAL_URL,
  BASE_PROFILE_PICS_KEY,
  BASE_POST_PICS,
  BASE_FIELD_PICS,
  BASE_TEAM_PICS,
  TEAMS_URL,
  NOTIFICATIONS_URL,
  uploadImgToS3,
  deleteS3Object,
  timeAgo,
  formatTime
};
