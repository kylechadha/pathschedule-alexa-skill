const data = require('./data/gtfs.js');
const moment = require('moment');
require('moment-timezone');

let firstStop = "Newark";
let lastStop = "World Trade Center";
console.log("From: " + firstStop);
console.log("To: " + lastStop);

// Determine which service the train is currently on:
//  - Mon-Fri: 5394A6507
//  - Sat: 5395A6507
//  - Sun: 5396A6507
//  - Holidays: 5459A6540
let service;
let isHoliday;
let now = moment();
console.log("Time: " + now.format("MM/DD/YY h:mm:ss a"));

// Check if today is a holiday.
for (let i = 0; i < data.holidays.length; i++) {
    let holiday = data.holidays[i];
    if (now.format("YYYYMMDD") === holiday["date"]) {
        console.log("Holiday service: " + holiday["service_id"]);

        isHoliday = true;
        service = holiday["service_id"];
        break;
    }
}

// If not, check the day of the week to determine which regular service applies.
if (!isHoliday) {
    switch (now.format("ddd")) {
    case "Sat":
        service = "5395A6507";
        console.log("Saturday service: " + service);
        break;
    case "Sun":
        service = "5396A6507";
        console.log("Sunday service: " + service);
        break;
    default:
        service = "5394A6507";
        console.log("Mon-Fri service: " + service);
    }
}

// Create a hash of all trips that are on the correct service and have a
// stop at either first_stop or last_stop.
let tripMap = {};
for (let i = 0; i < data.trips.length; i++) {
    let trip = data.trips[i];
    if (trip["SERVICE_ID"] !== service) {
        continue;
    }

    let stop = trip["STOP_NAME"];
    if (stop == firstStop) {
        if (tripMap[trip["trip_id"]] && tripMap[trip["trip_id"]].constructor === Object) {
            tripMap[trip["trip_id"]]["first_stop"] = trip;
        } else {
            tripMap[trip["trip_id"]] = {};
            tripMap[trip["trip_id"]]["first_stop"] = trip;
        }
    } else if (stop == lastStop) {
        if (tripMap[trip["trip_id"]] && tripMap[trip["trip_id"]].constructor === Object) {
            tripMap[trip["trip_id"]]["last_stop"] = trip;
        } else {
            tripMap[trip["trip_id"]] = {};
            tripMap[trip["trip_id"]]["last_stop"] = trip;
        }
    }
}

// Remove any trips that do not include both the first_stop and the last_stop.
// Remove any trips where the first_stop is a higher stop_sequence than last_stop
// (the trip is in the incorrect direction).
// Create a slice of the remaining stop times.
let stopTimes = [];
let routeMap = {};
for (let key in tripMap) {
    if ("first_stop" in tripMap[key] && "last_stop" in tripMap[key]) {
        if (tripMap[key]["first_stop"]["stop_sequence"] > tripMap[key]["last_stop"]["stop_sequence"]) {
            delete tripMap[key];
        } else {
            stopTimes.push(tripMap[key]["first_stop"]["arrival_time"]);
            routeMap[tripMap[key]["first_stop"]["ROUTE_ID"]+tripMap[key]["first_stop"]["DIRECTION_ID"]] = {"route": tripMap[key]["first_stop"]["ROUTE_ID"], "direction": tripMap[key]["first_stop"]["DIRECTION_ID"]}
        }
    } else {
        delete tripMap[key];
    }
}
stopTimes.sort(function (a, b) {  return new Date('1970/01/01 ' + a) - new Date('1970/01/01 ' + b);  });

console.log("Possible routes:");
for (let key in routeMap) {
    console.log("Route " + routeMap[key]["route"] + ", Direction " + routeMap[key]["direction"]);
}

// Iterate through the stop times.
let next, nextAfter;
for (let i = 0; i < stopTimes.length; i++) {
    stopTime = moment.tz(now.format("YYYY-MM-DDT")+stopTimes[i], 'America/New_York');
    if (now.isBefore(stopTime)) {
        next = stopTime;
        nextAfter = moment.tz(now.format("YYYY-MM-DDT")+stopTimes[i+1], 'America/New_York');
        break;
    }
}
console.log("Next two times: " + next.format("h:mm a") + ", " + nextAfter.format("h:mm a"));
