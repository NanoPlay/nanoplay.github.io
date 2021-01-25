/*
    NanoPlay Website

    Copyright (C) Subnodal Technologies. All Rights Reserved.

    https://nanoplay.subnodal.com
    Licenced by the Subnodal Open-Source Licence, which can be found at LICENCE.md.
*/

namespace("com.subnodal.nanoplay.website.editor", function(exports) {
    var subElements = require("com.subnodal.subelements");
    var requests = require("com.subnodal.subelements.requests");
    var l10n = require("com.subnodal.subelements.l10n");
    var csengine = require("com.subnodal.codeslate.engine");
    var _ = l10n.translate;

    var dialogs = require("com.subnodal.nanoplay.website.dialogs");
    var communications = require("com.subnodal.nanoplay.website.communications");

    const SUPPORTED_LANGUAGES = ["en_GB", "fr_FR"];

    exports.statuses = {
        DISCONNCTED: 0,
        CONNECTING: 1,
        CONNECTED: 2
    };

    var cseInstance = null;
    var manifest = {
        name: {}
    };
    var status = 0;
    var unsuccessfulConnections = 0;

    var lightTheme = null;
    var darkTheme = null;
    var wasOnDarkTheme = false;

    exports.getManifest = function() {
        return manifest;
    };

    exports.getSupportedLanguage = function() {
        return SUPPORTED_LANGUAGES.includes(l10n.getLocaleCode()) ? l10n.getLocaleCode() : "en_GB";
    };

    exports.getStatus = function() {
        return status;
    };

    exports.getStatusMessage = function() {
        switch (status) {
            case exports.statuses.CONNECTING:
                return _("editor_status_connecting");
            case exports.statuses.CONNECTED:
                if (communications.getConnectedNanoplayCount() > 1) {
                    return _("editor_status_connected_plural", {count: communications.getConnectedNanoplayCount()});
                } else {
                    return _("editor_status_connected_singular", {name: communications.getConnectedNanoplayNames()[0]});
                }
            default:
                return _("editor_status_disconnected");
        }
    };

    exports.setStatusGeneric = function() {
        if (communications.getConnectedNanoplayCount() > 0) {
            status = exports.statuses.CONNECTED;
        } else {
            status = exports.statuses.DISCONNCTED;
        }
    };

    exports.getUnsuccessfulConnections = function() {
        return unsuccessfulConnections;
    };

    exports.loadAppSettingsDialog = function() {
        document.getElementById("appNameInput").value = manifest.name[exports.getSupportedLanguage()] || "";

        dialogs.open("appSettings");
    };

    exports.saveAppSettingsDialog = function() {
        manifest.name[exports.getSupportedLanguage()] = document.getElementById("appNameInput").value;

        dialogs.close("appSettings");
    };

    exports.loadAppNamesDialog = function() {
        var appNameInputs = document.getElementsByClassName("translateAppNameInput");

        exports.saveAppSettingsDialog();

        for (var i = 0; i < appNameInputs.length; i++) {
            appNameInputs[i].value = manifest.name[appNameInputs[i].getAttribute("data-lang")] || "";
        }

        dialogs.open("appNameTranslate");
    };

    exports.saveAppNamesDialog = function() {
        var appNameInputs = document.getElementsByClassName("translateAppNameInput");

        for (var i = 0; i < appNameInputs.length; i++) {
            manifest.name[appNameInputs[i].getAttribute("data-lang")] = appNameInputs[i].value;
        }

        dialogs.close("appNameTranslate");

        exports.loadAppSettingsDialog();
    };

    exports.connectToNewNanoplay = function() {
        status = exports.statuses.CONNECTING;

        communications.connectToNewNanoplay().then(function() {
            status = exports.statuses.CONNECTED;
            unsuccessfulConnections = 0;

            subElements.render();
        }).catch(function(error) {
            console.error(error);

            status = exports.setStatusGeneric();
            unsuccessfulConnections++;

            dialogs.open("connectionError");
            subElements.render();
        });

        subElements.render();
    };

    exports.ensureConnection = function() {
        if (communications.getConnectedNanoplayCount() > 0) {
            return Promise.resolve();
        } else {
            return exports.connectToNewNanoplay();
        }
    };

    subElements.ready(function() {
        Promise.all([
            requests.getJson("https://subnodal.com/csEngine/languages/js.json"),
            requests.getJson("/csethemes/light.json"),
            requests.getJson("/csethemes/dark.json")
        ]).then(function(editorResources) {
            lightTheme = editorResources[1];
            darkTheme = editorResources[2];

            cseInstance = new csengine.CodeslateEngine(document.getElementById("codeEditor"), {
                languageData: editorResources[0],
                theme: lightTheme
            });

            cseInstance.onReady(function() {
                cseInstance.code = `function start() {\n    \n}\n\nfunction loop() {\n    \n}`;
            });

            setInterval(function() {
                if (wasOnDarkTheme != document.body.classList.contains("dark")) {
                    wasOnDarkTheme = document.body.classList.contains("dark");

                    if (wasOnDarkTheme) {
                        cseInstance.options.theme = darkTheme;
                    } else {
                        cseInstance.options.theme = lightTheme;
                    }

                    cseInstance.render();
                }
            });
        });
    });
});