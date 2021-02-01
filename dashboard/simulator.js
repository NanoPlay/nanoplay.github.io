/*
    NanoPlay Website

    Copyright (C) Subnodal Technologies. All Rights Reserved.

    https://nanoplay.subnodal.com
    Licenced by the Subnodal Open-Source Licence, which can be found at LICENCE.md.
*/

namespace("com.subnodal.nanoplay.website.simulator", function(exports) {
    var editor = require("com.subnodal.nanoplay.website.editor");
    var api = require("com.subnodal.nanoplay.website.simulator.api");

    exports.buttons = {
        TL: 0,
        TR: 1,
        BL: 2,
        BR: 3
    };

    exports.Simulator = class {
        constructor(canvas) {
            this.canvas = canvas;

            this.canvasContext = this.canvas.getContext("2d");
            this.commands = {};
            this.buttonStates = {};
            this.pinStates = new Array(6).fill(0);
            this.nfcUrl = "https://subnodal.com/np";

            this.buttonStates[exports.buttons.TL] = false;
            this.buttonStates[exports.buttons.TR] = false;
            this.buttonStates[exports.buttons.BL] = false;
            this.buttonStates[exports.buttons.BR] = false;

            this.registerCommands();
        }

        registerCommands() {
            this.commands = api.commandFactory(this, {
                tl: {pressed: this.handleButtonPressFactory(exports.buttons.TL)},
                tr: {pressed: this.handleButtonPressFactory(exports.buttons.TR)},
                bl: {pressed: this.handleButtonPressFactory(exports.buttons.BL)},
                br: {pressed: this.handleButtonPressFactory(exports.buttons.BR)},
                readPin: this.handleReadPin,
                writePin: this.handleWritePin,
                nfcSet: this.handleNfcSet,
                getBatteryPercentage: this.handleGetBatteryPercentage,
                getTemperatureCelsius: this.handleGetTemperatureCelsius,
                getLocaleCode: this.handleGetLocaleCode
            });
        }

        handleButtonPressFactory(button) {
            var thisScope = this;

            return function() {
                return thisScope.buttonStates[button];
            };
        }

        handleReadPin(pin) {
            return this.pinStates[pin];
        }

        handleWritePin(pin, value) {
            this.pinStates[pin] = value;
        }

        handleNfcSet(url) {
            this.nfcUrl = url;
        }

        handleGetBatteryPercentage() {
            return 100;
        }

        handleGetTemperatureCelsius() {
            return 20;
        }

        handleGetLocaleCode() {
            return editor.getSupportedLanguage();
        }
    };
});