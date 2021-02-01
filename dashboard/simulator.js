/*
    NanoPlay Website

    Copyright (C) Subnodal Technologies. All Rights Reserved.

    https://nanoplay.subnodal.com
    Licenced by the Subnodal Open-Source Licence, which can be found at LICENCE.md.
*/

namespace("com.subnodal.nanoplay.website.simulator", function(exports) {
    var l10n = require("com.subnodal.subelements.l10n");
    var safety = require("com.subnodal.nanoplay.webapi.safety");

    var editor = require("com.subnodal.nanoplay.website.editor");
    var graphics = require("com.subnodal.nanoplay.website.simulator.graphics");
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
            this.programGlobal = {};
            this.loopInterval = null;
            this.showStatusBar = false;
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
                close: this.handleCloseFactory(),
                statusBar: this.handleStatusBarFactory(),
                tl: {pressed: this.handleButtonPressFactory(exports.buttons.TL)},
                tr: {pressed: this.handleButtonPressFactory(exports.buttons.TR)},
                bl: {pressed: this.handleButtonPressFactory(exports.buttons.BL)},
                br: {pressed: this.handleButtonPressFactory(exports.buttons.BR)},
                readPin: this.handleReadPinFactory(),
                writePin: this.handleWritePinFactory(),
                nfcSet: this.handleNfcSetFactory(),
                getBatteryPercentage: this.handleGetBatteryPercentageFactory(),
                getTemperatureCelsius: this.handleGetTemperatureCelsiusFactory(),
                getLocaleCode: this.handleGetLocaleCodeFactory()
            });
        }

        loadProgram(program) {
            clearInterval(this.loopInterval);

            var exposedGlobals = {};

            for (var key in window) {
                exposedGlobals[key] = undefined;
            }

            exposedGlobals = {...exposedGlobals, console: {}, Math, String, Object, Date};

            Object.assign(exposedGlobals, this.commands);

            this.programGlobal = {};

            try {
                this.programGlobal = Function(
                    "var start,loop;with(this){" +
                    safety.makeSafe(program) +
                    "}return {start:start,loop:loop}"
                ).bind(exposedGlobals)();
            } catch (e) {
                this.catchError(e);

                clearInterval(this.loopInterval);
            }
        }

        start() {
            var thisScope = this;

            clearInterval(this.loopInterval);

            if (this.programGlobal["start"] != undefined) {
                try {
                    this.programGlobal.start();
                } catch (e) {
                    this.catchError(e);

                    clearInterval(this.loopInterval);
                }
            }

            if (this.programGlobal["loop"] != undefined) {
                this.loopInterval = setInterval(function() {
                    graphics.clear(thisScope, false);

                    try {
                        thisScope.programGlobal.loop();
                    } catch (e) {
                        thisScope.catchError(e);
        
                        clearInterval(thisScope.loopInterval);
                    }

                    if (thisScope.showStatusBar) {
                        graphics.rect(thisScope, 0, 0, 127, 6, true, false);
                        
                        graphics.text(thisScope, 1, 1, l10n.formatValue(new Date(), {timeStyle: "short"}), true, true);
                        
                        graphics.rect(thisScope, 115, 1, 10, 4, true, true);
                        graphics.rect(thisScope, 125, 2, 1, 2, true, true);

                        graphics.line(thisScope, 0, 7, 128, 7, true);
                    }
                }, 100);
            }
        }

        handleCloseFactory() {
            var thisScope = this;

            return function() {
                clearInterval(thisScope.loopInterval);

                graphics.clear(thisScope, false);
            };
        }

        handleStatusBarFactory() {
            var thisScope = this;

            return function(enable) {
                thisScope.showStatusBar = enable;
            };
        }

        handleButtonPressFactory(button) {
            var thisScope = this;

            return function() {
                return thisScope.buttonStates[button];
            };
        }

        handleReadPinFactory() {
            var thisScope = this;

            return function(pin) {
                return thisScope.pinStates[pin];
            };
        }

        handleWritePinFactory() {
            var thisScope = this;

            return function(pin, value) {
                thisScope.pinStates[pin] = value;
            };
        }

        handleNfcSetFactory() {
            var thisScope = this;

            return function(url) {
                thisScope.nfcUrl = url;
            };
        }

        handleGetBatteryPercentageFactory() {
            return function() {
                return 100;
            };
        }

        handleGetTemperatureCelsiusFactory() {
            return function() {
                return 20;
            };
        }

        handleGetLocaleCodeFactory() {
            return function() {
                return editor.getSupportedLanguage();
            };
        }

        catchError() {}
    };
});