/*
    NanoPlay Website

    Copyright (C) Subnodal Technologies. All Rights Reserved.

    https://nanoplay.subnodal.com
    Licenced by the Subnodal Open-Source Licence, which can be found at LICENCE.md.
*/

var csengine = require("com.subnodal.codeslate.engine");

namespace("com.subnodal.nanoplay.website.editor", function(exports) {
    var subElements = require("com.subnodal.subelements");
    var requests = require("com.subnodal.subelements.requests");
    var l10n = require("com.subnodal.subelements.l10n");
    var csengine = require("com.subnodal.codeslate.engine");

    var dialogs = require("com.subnodal.nanoplay.website.dialogs");

    const SUPPORTED_LANGUAGES = ["en_GB", "fr_FR"];

    var cseInstance = null;
    var manifest = {
        name: {}
    };

    var lightTheme = null;
    var darkTheme = null;
    var wasOnDarkTheme = false;

    exports.getManifest = function() {
        return manifest;
    };

    exports.getSupportedLanguage = function() {
        return SUPPORTED_LANGUAGES.includes(l10n.getLocaleCode()) ? l10n.getLocaleCode() : "en_GB";
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