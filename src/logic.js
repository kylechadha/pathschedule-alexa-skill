const data = require('./data/gtfs.js');
const moment = require('moment');
require('moment-timezone');

module.exports = {
    nextTwo: nextTwo,
    correctStops: correctStops,
};

function nextTwo(firstStop, lastStop) {
    console.log("From: " + firstStop);
    console.log("To: " + lastStop);

    // Determine which service the train is currently on:
    //  - Mon-Fri: 5394A6507
    //  - Sat: 5395A6507
    //  - Sun: 5396A6507
    //  - Holidays: 5459A6540
    let service;
    let isHoliday;
    let now = moment().tz("America/New_York");
    console.log("Time: " + now.format("MM/DD/YY h:mm:ss a"));

    // Check if today is a holiday.
    for (let i = 0; i < data.holidays.length; i++) {
        let holiday = data.holidays[i];
        if (now.format("YYYYMMDD") === holiday["date"]) {
            console.log("Service: Holiday " + holiday["service_id"]);

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
            console.log("Service: Saturday " + service);
            break;
        case "Sun":
            service = "5396A6507";
            console.log("Service: Sunday " + service);
            break;
        default:
            service = "5394A6507";
            console.log("Service: Mon-Fri " + service);
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

        let stop = trip["STOP_NAME"].toLowerCase();
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
                routeMap[tripMap[key]["first_stop"]["ROUTE_ID"]+tripMap[key]["first_stop"]["DIRECTION_ID"]] = {route: tripMap[key]["first_stop"]["ROUTE_ID"], direction: tripMap[key]["first_stop"]["DIRECTION_ID"]}
            }
        } else {
            delete tripMap[key];
        }
    }
    stopTimes.sort(function (a, b) {  return new Date('1970/01/01 ' + a) - new Date('1970/01/01 ' + b);  });

    let routesFound = 0;
    console.log("Possible routes:");
    for (let key in routeMap) {
        routesFound++;
        console.log("Route " + routeMap[key]["route"] + ", Direction " + routeMap[key]["direction"]);
    }
    if (routesFound == 0) {
        return {error: "No routes found"};
    }

    // Determine the next two stop times.
    let next, nextAfter;
    for (let i = 0; i < stopTimes.length; i++) {
        // Correct for PATH gtfs time formatting (no leading zero).
        let stopTimeRaw = stopTimes[i];
        if (stopTimeRaw.length === 7) {
            stopTimeRaw = "0"+stopTimeRaw;
        }

        let stopTime = moment.tz(now.format("YYYY-MM-DDT")+stopTimeRaw, 'America/New_York');
        if (now.isBefore(stopTime)) {
            next = stopTime;

            // If the second time is past the last train for the day.
            // ** This is only a stopgap measure, it does not handle change in schedules b/w days.
            if (i === (stopTimes.length-1)) {
                console.log("Rolling over nextAfter to next day");
                i = -1;
            }
            let nextStopTimeRaw = stopTimes[i+1];
            if (nextStopTimeRaw.length === 7) {
                nextStopTimeRaw = "0"+nextStopTimeRaw;
            }
            nextAfter = moment.tz(now.format("YYYY-MM-DDT")+nextStopTimeRaw, 'America/New_York');
            break;
        }

        // If both times are past the last train for the day.
        if (i === (stopTimes.length-1)) {
            console.log("Rolling over both next and nextAfter to next day");
            next = moment.tz(now.format("YYYY-MM-DDT")+"0"+stopTimes[0], 'America/New_York');
            nextAfter = moment.tz(now.format("YYYY-MM-DDT")+"0"+stopTimes[1], 'America/New_York');
            break;
        }
    }
    console.log("Next two times: " + next.format("h:mm a") + ", " + nextAfter.format("h:mm a"));

    return {next: next, nextAfter: nextAfter}
}

function correctStops(stop) {
    // ** can also strip out front and five from start of string
    // + change stream for street
    switch (stop) {
    case "turn on square":
    case "turn off square":
    case "journals clare":
    case "turn on stay":
    case "journal squared":
    case "journals square":
    case "journals player":
    case "journal swear":
        console.log("Corrected from " + stop + " to Journal Square");
        return "journal square";
    case "paris":
    case "paris hilton":
        console.log("Corrected from " + stop + " to Harrison");
        return "harrison";
    case "thirty three":
    case "thirty thursday":
    case "thirty thirty three":
    case "dirty third stream":
        console.log("Corrected from " + stop + " to 33rd Street");
        return "33rd street";
    case "twenty tree":
    case "two thirty":
        console.log("Corrected from " + stop + " to 23rd Street");
        return "23rd street";
    case "new york":
        console.log("Corrected from " + stop + " to Newark");
        return "newark";
    case "change place":
    case "james place":
        console.log("Corrected from " + stop + " to Exchange Place");
        return "exchange place";
    default:
        return stop;
    }
}

// Debugging:
// nextTwo("newark", "world trade center");
// console.log(correctStops("thirty thursday"));
