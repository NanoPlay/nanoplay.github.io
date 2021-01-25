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

    subElements.ready(function() {
        requests.getJson("https://subnodal.com/csEngine/languages/js.json").then(function(languageData) {
            cseInstance = new csengine.CodeslateEngine(document.getElementById("codeEditor"), {
                languageData: languageData,
                theme: {
                    codeFont: `"Overpass Mono", "Roboto Mono", monospace`,
                    uiFont: `"Lexend Deca", sans-serif`,
                    background: "#eeeeee",
                    gutter: "#cccccc",
                    lineNumber: "#222222",
                    lineNumberIndent: "black",
                    caret: "#e0607e",
                    scrollbar: "rgba(0, 0, 0, 0.5)",
                    scrollbarHover: "rgba(0, 0, 0, 0.6)",
                    scrollbarPressed: "rgba(0, 0, 0, 0.8)",
                    selection: "#a2d5fa",
                    text: "black",
                    definition: "#42aaf5; font-weight: bold;",
                    keyword: "#42aaf5",
                    string: "#7fb069",
                    number: "#e0607e",
                    operator: "#f5b342",
                    atom: "#f5b342",
                    comment: "#cccccc; font-style: italic;",
                    regex: "#e0607e"
                }
            });

            cseInstance.onReady(function() {
                cseInstance.code = `function start() {\n    \n}\n\nfunction loop() {\n    \n}`;
            });
        });
    });

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
});