/*
    NanoPlay Website

    Copyright (C) Subnodal Technologies. All Rights Reserved.

    https://nanoplay.subnodal.com
    Licenced by the Subnodal Open-Source Licence, which can be found at LICENCE.md.
*/

namespace("com.subnodal.nanoplay.website.simulator.api", function(exports) {
    /*
        Refer to https://github.com/NanoPlay/os/blob/main/api.js for full API
        reference.
    */

    var graphics = require("com.subnodal.nanoplay.website.simulator.graphics");

    function typeAll(params, type) {
        for (var i = 0; i < params.length; i++) {
            if (typeof(params[i]) != type) {
                throw new TypeError("Expected a parameter to be " + type + ", but got " + typeof(params[i]) + " instead");
            }
        }
    }

    function typePin(pin) {
        if (typeof(pin) != "number" || pin != Math.floor(pin)) {
            throw new TypeError("Pin specified is not an integer");
        }
    
        if (pin < 0 || pin > 5) {
            throw new TypeError("NanoPlay doesn't have pin " + String(pin) + "; only has pins 0 to 5");
        }
    }

    exports.commandFactory = function(sim, handlers) {
        var fillShapes = false;
        var invertColours = false;
        var files = {};

        function close() {
            handlers.close();
        };

        function statusBar(enable) {
            handlers.statusBar(!!enable);
        };

        function clear() {
            graphics.clear(sim, invert);
        }

        function fill(enable) {
            fillShapes = !!enable; 
        }

        function invert(enable) {
            invertColours = !!enable;
        }

        function line(x1, y1, x2, y2) {
            typeAll(arguments, "number");

            graphics.line(sim, x1, y1, x2, y2, !invertColours);
        }

        function rect(x, y, w, h) {
            typeAll(arguments, "number");

            graphics.rect(sim, x, y, w, h, fillShapes, !invertColours);
        }

        function circle(x, y, radius) {
            typeAll(arguments, "number");

            graphics.ellipse(sim, x - radius, y - radius, radius, radius, fillShapes, !invertColours);
        }

        function ellipse(x, y, w, h) {
            typeAll(arguments, "number");

            graphics.ellipse(sim, x, y, w, h, fillShapes, !invertColours);
        }

        function text(x, y, text, mini = false) {
            typeAll([x, y], "number");

            graphics.text(sim, x, y, String(text), mini, !invertColours);
        }

        function getTextWidth(text, mini = false) {
            return graphics.getTextWidth(text, mini);
        }

        function getPixel(x, y) {
            return graphics.getPixel(sim, x, y);
        }

        function setPixel(x, y, on = true) {
            return graphics.setPixel(sim, x, y, on);
        }

        var tl = {
            pressed: function() {
                return handlers.tl.pressed();
            }
        };

        var tr = {
            pressed: function() {
                return handlers.tr.pressed();
            }
        };

        var bl = {
            pressed: function() {
                return handlers.bl.pressed();
            }
        };

        var br = {
            pressed: function() {
                return handlers.br.pressed();
            }
        };

        function readPin(pin) {
            typePin(pin);

            return handlers.readPin(pin);
        }

        function writePin(pin, value) {
            typePin(pin);

            if (typeof(value) == "boolean") {
                value = value & 1;
            } else if (typeof(value) != "number" || value < 0 || value > 1) {
                throw new TypeError("Value must be a positive real number within the bounds 0 to 1 inclusive");
            }

            handlers.writePin(pin, value);
        }

        function readFile(filename) {
            typeAll([filename], "string");

            if (!(/^[a-zA-Z0-9]*$/.test(filename))) {
                throw new TypeError("Filename must only contain characters a-z, A-Z and 0-9");
            }

            if (filename.length < 1 || filename.length > 20) {
                throw new TypeError("Filename must be non-empty and be at most 20 characters long");
            }

            return files[filename];
        }

        function writeFile(filename, data) {
            typeAll([filename], "string");

            if (!(/^[a-zA-Z0-9]*$/.test(filename))) {
                throw new TypeError("Filename must only contain characters a-z, A-Z and 0-9");
            }

            if (filename.length < 1 || filename.length > 20) {
                throw new TypeError("Filename must be non-empty and be at most 20 characters long");
            }

            files[filename] = String(data);

            return true;
        }

        function getFileList() {
            return Object.keys(files);
        }

        function nfcSet(url) {
            typeAll([url], "string");

            handlers.nfcSet(url);
        }

        function getBatteryPercentage() {
            return handlers.getBatteryPercentage();
        }

        function getTemperatureCelsius() {
            return handlers.getTemperatureCelsius();
        }

        function getTemperatureFahrenheit() {
            return (getTemperatureCelsius() * 1.8) + 32;
        }

        function getTemperatureKelvin() {
            return getTemperatureCelsius() + 273.15;
        }

        function getLocaleCode() {
            return handlers.getLocaleCode();
        }

        return {
            clear, fill, invert, line, rect, circle, ellipse, text, getTextWidth, getPixel, setPixel,
            tl, tr, bl, br, readPin, writePin,
            readFile, writeFile, getFileList,
            nfcSet, getBatteryPercentage, getTemperatureCelsius, getTemperatureFahrenheit, getTemperatureKelvin, getLocaleCode
        };
    };
});