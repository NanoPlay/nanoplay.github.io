/*
    NanoPlay Website

    Copyright (C) Subnodal Technologies. All Rights Reserved.

    https://nanoplay.subnodal.com
    Licenced by the Subnodal Open-Source Licence, which can be found at LICENCE.md.
*/

namespace("com.subnodal.nanoplay.website.communications", function(exports) {
    var nanoplay = require("com.subnodal.nanoplay.webapi");

    var connectedNanoplays = [];

    exports.getConnectedNanoplayCount = function() {
        return connectedNanoplays.length;
    };

    exports.getConnectedNanoplayNames = function() {
        return connectedNanoplays.map((i) => i.name);
    };

    exports.connectToNewNanoplay = function() {
        return new Promise(function(resolve, reject) {
            var newNanoplay = new nanoplay.NanoPlay();

            newNanoplay.connect().then(function() {
                connectedNanoplays.push(newNanoplay);

                resolve();
            }).catch(function(error) {
                reject(error);
            });
        });
    };

    exports.uploadApp = function(code, manifest) {
        return Promise.all(connectedNanoplays.map(function(i) {
            try {
                return i.uploadApp(code, manifest);
            } catch (e) {
                return Promise.reject(e);
            }
        }));
    };

    exports.setSystemDate = function() {
        return Promise.all(connectedNanoplays.map((i) => i.setSystemDate()));
    };

    exports.getLogMessages = function() {
        var logMessages = {};

        for (var i = 0; i < connectedNanoplays.length; i++) {
            logMessages[connectedNanoplays[i].name] = connectedNanoplays[i].connection.rxData;

            connectedNanoplays[i].connection.rxData = "";
        }

        return logMessages;
    };
});