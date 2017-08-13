'use strict';
const Alexa = require('alexa-sdk');
const app = require('./logic.js');

const APP_ID = "amzn1.ask.skill.63a0aa76-b819-4f1e-ae45-bc96abb7cc4b";
const SKILL_NAME = "PATH Schedule";
const GET_NEXT_TRAINS_MESSAGE = "The next two trains are: ";
const HELP_MESSAGE = "Ask me something like: When's the next train from Journal Square to 33rd Street?";
const HELP_REPROMPT = "Ask me something in the format of: When is the next train from 'first stop' to 'last stop'. Make sure you speak the stops slowly.";
const STOP_MESSAGE = "Thanks for using PATH Schedule. Please leave us feedback in the Alexa skill store.";

let STOPS = ["14th street", "23rd street", "33rd street", "9th street", "christopher street", "exchange place", "grove street", "harrison", "hoboken", "journal square", "newark", "newport", "world trade center"];

exports.handler = function(event, context, callback) {
    let alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    // ** alexa.dynamoDBTableName = ’YourTableName';
    alexa.registerHandlers(handlers);
    alexa.execute();
};

let handlers = {
    'LaunchRequest': function () {
        this.emit('AMAZON.HelpIntent');
    },
    'GetNextTrainIntent': function () {
        // Parse & validate the stops from the request.
        let firstStop = this.event.request.intent.slots.first_stop.value;
        let lastStop = this.event.request.intent.slots.last_stop.value;

        if (!firstStop && !lastStop) {
            // this.emit(':tellWithCard', "Neither defined", "Next two train times:", "none");
            console.log("Both slots undefined");
            this.emit(':tellWithCard', "Hm, I couldn't understand that", "Error:", "Both stops undefined");
            return;
        }
        if (!firstStop) {
           // *reprompt for first stop*
           //     this.emit(':tellWithCard', "Last: "+ lastStop+", first undefined.", "Next two train times:", lastStop);
            console.log("First slot undefined. Last: " + lastStop);
            this.emit(':tellWithCard', "Hm, I couldn't understand that", "Error:", "First stop undefined, last: " + lastStop);
               return;
        } else if (!lastStop) {
           // *reprompt for last stop*
           //     this.emit(':tellWithCard', "First: "+ firstStop + ", last undefined.", "Next two train times:", firstStop);
            console.log("Last slot undefined. First: " + firstStop);
            this.emit(':tellWithCard', "Hm, I couldn't understand that", "Error:", "Last stop undefined, first: " + firstStop);
               return;
        }

        firstStop = firstStop.toLowerCase();
        lastStop = lastStop.toLowerCase();

        firstStop = app.correctStops(firstStop);
        lastStop = app.correctStops(lastStop);

        let firstFound = false;
        let lastFound = false;
        STOPS.forEach(function(element) {
            if (element === firstStop) {
                firstFound = true;
            }
            if (element === lastStop) {
                lastFound = true;
            }
        });

        if (!firstFound && !lastFound) {
            // this.emit(':tellWithCard', "Neither found", "Next two train times:", "none");
            console.log("Both slots not found. First: " + firstStop + ". Last: " + lastStop);
            this.emit(':tellWithCard', "Hm, I couldn't find that stop in the database", "Error:", "Both stops not found");
            return;
        }
        if (!firstFound) {
           // *reprompt for first stop*
           //     this.emit(':tellWithCard', "Last: "+ lastStop+", First not found.", "Next two train times:", lastStop);
            console.log("First slot not found. First: " + firstStop + ". Last: " + lastStop);
            this.emit(':tellWithCard', "Hm, I couldn't find that stop in the database", "Error:", "First stop not found. Last: " + lastStop);
               return;
        } else if (!lastFound) {
           // *reprompt for last stop*
           //     this.emit(':tellWithCard', "First: "+ firstStop + ", last not found.", "Next two train times:", firstStop);
            console.log("Last slot undefined. First: " + firstStop + ". Last: " + lastStop);
            this.emit(':tellWithCard', "Hm, I couldn't find that stop in the database", "Error:", "Last stop not found. First: " + firstStop);
               return;
        }

        let trains = app.nextTwo(firstStop, lastStop);
        if (trains.error) {
            this.emit(':tell', trains.error);
            return;
        }

        let times = trains.next.format("h:mm a") + " and " + trains.nextAfter.format("h:mm a");
        let speechOutput = GET_NEXT_TRAINS_MESSAGE + times;
        this.emit(':tellWithCard', speechOutput, "Next two train times:", times);
    },
    'AMAZON.HelpIntent': function () {
        let speechOutput = HELP_MESSAGE;
        let reprompt = HELP_REPROMPT;
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

// I could not find a route with that start and end stop. [if it's a holiday] However, I noticed that today is a holiday. It's possible your requested train is running on an alternate route as a result.
