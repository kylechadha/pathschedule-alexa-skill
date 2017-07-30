'use strict';
var Alexa = require('alexa-sdk');
var moment = require('moment');
require('moment-timezone');

var APP_ID = "amzn1.ask.skill.63a0aa76-b819-4f1e-ae45-bc96abb7cc4b";
var SKILL_NAME = "PATH Schedule";
var GET_NEXT_TRAINS_MESSAGE = "The next two trains are: ";
var HELP_MESSAGE = "Ask me something like: When's the next train from Journal Square to 33rd Street?";
var HELP_REPROMPT = "Ask me something in the format of: When is the next train from 'first stop' to 'last stop'. Make sure you speak the stops slowly.";
var STOP_MESSAGE = "Thanks for using PATH Schedule. Please leave us feedback in the Alexa skill store.";

var STOPS = ["14th street", "23rd street", "33rd street", "9th street", "christopher street", "exchange place", "grove street", "harrison", "hoboken", "journal square", "newark", "newport", "world trade center"];

// Journal Square to 33rd Street, Normal Service Weekdays
var data = ["05:59:00","06:09:00","06:19:00","06:29:00","06:39:00","06:49:00","06:59:00","07:09:00","07:14:00","07:19:00","07:24:00","07:29:00","07:34:00","07:38:00","07:42:00","07:46:00","07:50:00","07:54:00","07:58:00","08:02:00","08:06:00","08:10:00","08:14:00","08:18:00","08:22:00","08:26:00","08:30:00","08:34:00","08:38:00","08:42:00","08:46:00","08:50:00","08:54:00","08:58:00","09:02:00","09:06:00","09:10:00","09:14:00","09:19:00","09:24:00","09:29:00","09:34:00","09:39:00","09:49:00","09:59:00","10:09:00","10:19:00","10:29:00","10:39:00","10:49:00","10:59:00","11:09:00","11:19:00","11:29:00","11:39:00","11:49:00","11:59:00","12:09:00","12:19:00","12:29:00","12:39:00","12:49:00","12:59:00","13:09:00","13:19:00","13:29:00","13:39:00","13:49:00","13:59:00","14:09:00","14:19:00","14:29:00","14:39:00","14:49:00","14:59:00","15:09:00","15:19:00","15:29:00","15:39:00","15:49:00","15:59:00","16:09:00","16:19:00","16:29:00","16:39:00","16:44:00","16:49:00","16:54:00","16:59:00","17:04:00","17:09:00","17:13:00","17:17:00","17:21:00","17:25:00","17:29:00","17:34:00","17:39:00","17:44:00","17:49:00","17:54:00","17:59:00","18:04:00","18:09:00","18:14:00","18:19:00","18:24:00","18:29:00","18:34:00","18:39:00","18:44:00","18:49:00","18:54:00","18:59:00","19:04:00","19:09:00","19:19:00","19:29:00","19:39:00","19:49:00","19:59:00","20:09:00","20:19:00","20:29:00","20:39:00","20:49:00","20:59:00","21:09:00","21:19:00","21:29:00","21:39:00","21:49:00","22:00:00","22:15:00","22:30:00","22:45:00"];

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    // ** alexa.dynamoDBTableName = ’YourTableName';
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
        this.emit('AMAZON.HelpIntent');
    },
    'GetNextTrainIntent': function () {
        var firstStop = this.event.request.intent.slots.first_stop.value;
        var lastStop = this.event.request.intent.slots.last_stop.value;

        if (!firstStop && !lastStop) {
            this.emit(':tellWithCard', "Neither defined", "Next two train times:", "none");
            return;
        }
        if (!firstStop) {
//            *reprompt for first stop*
               this.emit(':tellWithCard', "Last: "+ lastStop+", first undefined.", "Next two train times:", lastStop);
               return;
        } else if (!lastStop) {
//            *reprompt for last stop*
               this.emit(':tellWithCard', "First: "+ firstStop + ", last undefined.", "Next two train times:", firstStop);
               return;
        }

        firstStop = firstStop.toLowerCase()
        lastStop = lastStop.toLowerCase()

        var firstFound = false;
        var lastFound = false;
        STOPS.forEach(function(element) {
            if (element === firstStop) {
                firstFound = true;
            }
            if (element === lastStop) {
                lastFound = true;
            }
        });

        if (!firstFound && !lastFound) {
            this.emit(':tellWithCard', "Neither found", "Next two train times:", "none");
            return;
        }
        if (!firstFound) {
//            *reprompt for first stop*
               this.emit(':tellWithCard', "Last: "+ lastStop+", First not found.", "Next two train times:", lastStop);
               return;
        } else if (!lastFound) {
//            *reprompt for last stop*
               this.emit(':tellWithCard', "First: "+ firstStop + ", last not found.", "Next two train times:", firstStop);
               return;
        }

//        var now = moment();
//        var next, nextTwo;
//
//        for (var i = 0; i < data.length; i++) {
//            var nextDeparture = moment.tz(now.format("YYYY-MM-DDT")+data[i], 'America/New_York');
//            if (now.isBefore(nextDeparture)) {
//                next = nextDeparture;
//                nextTwo = moment.tz(now.format("YYYY-MM-DDT")+data[i+1], 'America/New_York');
//                break;
//            }
//        }
//
//        var times = next.format("h:mm a") + " and " + nextTwo.format("h:mm a");
//        var speechOutput = GET_NEXT_TRAINS_MESSAGE + times + ". The first stop is " + first + ". The last stop is " + last + ".";
//
//        this.emit(':tellWithCard', speechOutput, "Next two train times:", times);

        var speechOutput = "The first stop is " + firstStop + ". The last stop is " + lastStop + ".";
        this.emit(':tellWithCard', speechOutput, "Next two train times:", speechOutput);
    },
    'AMAZON.HelpIntent': function () {
        var speechOutput = HELP_MESSAGE;
        var reprompt = HELP_REPROMPT;
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', STOP_MESSAGE);
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', STOP_MESSAGE);
    },
    'Unhandled': function () {
        this.emit('AMAZON.HelpIntent');
    }
};

// https://developer.amazon.com/blogs/post/Tx213D2XQIYH864/announcing-the-alexa-skills-kit-for-node-js
// "Say, 'Set a default'"
// "Your default route has been set from Journal Square to 33rd Street. In the future, just ask 'What's next' to
// get train times."
// this.attributes[”yourAttribute"] = ’value’;
