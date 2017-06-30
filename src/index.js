'use strict';
var Alexa = require('alexa-sdk');
var moment = require('moment');

var APP_ID = "amzn1.ask.skill.63a0aa76-b819-4f1e-ae45-bc96abb7cc4b";
var SKILL_NAME = "PATH Schedule";
var GET_NEXT_TRAIN_MESSAGE = "The next train is: ";
var HELP_MESSAGE = "You can ask me when the next PATH train is, or even just what's next?";
var HELP_REPROMPT = "What can I help you with?";
var STOP_MESSAGE = "Created by Kyle Chadha";

// Journal Square to 33rd Street, Normal Service Weekdays
//var data = ["5:59:00","6:09:00","6:19:00","6:29:00","6:39:00","6:49:00","6:59:00","7:09:00","7:14:00","7:19:00","7:24:00","7:29:00","7:34:00","7:38:00","7:42:00","7:46:00","7:50:00","7:54:00","7:58:00","8:02:00","8:06:00","8:10:00","8:14:00","8:18:00","8:22:00","8:26:00","8:30:00","8:34:00","8:38:00","8:42:00","8:46:00","8:50:00","8:54:00","8:58:00","9:02:00","9:06:00","9:10:00","9:14:00","9:19:00","9:24:00","9:29:00","9:34:00","9:39:00","9:49:00","9:59:00","10:09:00","10:19:00","10:29:00","10:39:00","10:49:00","10:59:00","11:09:00","11:19:00","11:29:00","11:39:00","11:49:00","11:59:00","12:09:00","12:19:00","12:29:00","12:39:00","12:49:00","12:59:00","13:09:00","13:19:00","13:29:00","13:39:00","13:49:00","13:59:00","14:09:00","14:19:00","14:29:00","14:39:00","14:49:00","14:59:00","15:09:00","15:19:00","15:29:00","15:39:00","15:49:00","15:59:00","16:09:00","16:19:00","16:29:00","16:39:00","16:44:00","16:49:00","16:54:00","16:59:00","17:04:00","17:09:00","17:13:00","17:17:00","17:21:00","17:25:00","17:29:00","17:34:00","17:39:00","17:44:00","17:49:00","17:54:00","17:59:00","18:04:00","18:09:00","18:14:00","18:19:00","18:24:00","18:29:00","18:34:00","18:39:00","18:44:00","18:49:00","18:54:00","18:59:00","19:04:00","19:09:00","19:19:00","19:29:00","19:39:00","19:49:00","19:59:00","20:09:00","20:19:00","20:29:00","20:39:00","20:49:00","20:59:00","21:09:00","21:19:00","21:29:00","21:39:00","21:49:00","22:00:00","22:15:00","22:30:00","22:45:00"];

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
        this.emit('GetNextTrainIntent');
    },
    'GetNextTrainIntent': function () {
        var now = moment();
//        var next;
//
//        for i = 0; i < len(data); i++ {
//            if now.isBefore(moment(data[i])) {
//                next = data[i]
//                break
//            }
//        }

//        var speechOutput = GET_NEXT_TRAIN_MESSAGE + next.Format("h:mm:ss a");
//        this.emit(':tellWithCard', speechOutput, SKILL_NAME, next.Format("h:mm:ss a"))

        var speechOutput = GET_NEXT_TRAIN_MESSAGE + now.format("h:mm:ss a");
        this.emit(':tellWithCard', speechOutput, SKILL_NAME, now.format("h:mm:ss a"))
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
    }
};