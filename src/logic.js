const data = require('./data/gtfs.js');
const moment = require('moment');
// require('moment-timezone');

let firstStop = "Newark";
let lastStop = "World Trade Center";

// Determine which service the train is currently on:
//  - Mon-Fri: 5394A6507
//  - Sat: 5395A6507
//  - Sun: 5396A6507
//  - Holidays: 5459A6540
let service;
let isHoliday;
let now = moment();
console.log("Current time: " + now.format("MM/DD/YY h:mm:ss a"));

// Check if today is a holiday.
for (let i = 0; i < data.holidays.length; i++) {
    let holiday = data.holidays[i];
    if (now.format("YYYYMMDD") === holiday["date"]) {
        console.log("It's " + holiday["holiday_name"] + "! Switching to holiday service");

        isHoliday = true;
        service = holiday["service_id"];
        break;
    }
}

// If not, check the day of the week to determine which regular service applies.
if (!isHoliday) {
    switch (now.format("ddd")) {
    case "Sat":
        console.log("Trains are running on Saturday service");
        service = "5395A6507";
        break;
    case "Sun":
        console.log("Trains are running on Sunday service");
        service = "5396A6507";
        break;
    default:
        console.log("Trains are running on Mon-Fri service");
        service = "5394A6507";
    }
}

// Create a hash of all trips that are on the correct service and have a
// stop at either first_stop or last_stop.
let tripMap = {};
console.log("Starting with " + data.trips.length + " trips");
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
for (let key in tripMap) {
    if ("first_stop" in tripMap[key] && "last_stop" in tripMap[key]) {
        if (tripMap[key]["first_stop"]["stop_sequence"] > tripMap[key]["last_stop"]["stop_sequence"]) {
            delete tripMap[key];
        }
    } else {
        delete tripMap[key];
    }
}
