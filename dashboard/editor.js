/*
    NanoPlay Website

    Copyright (C) Subnodal Technologies. All Rights Reserved.

    https://nanoplay.subnodal.com
    Licenced by the Subnodal Open-Source Licence, which can be found at LICENCE.md.
*/

namespace("com.subnodal.nanoplay.website.editor", function(exports) {
    var subElements = require("com.subnodal.subelements");
    var core = require("com.subnodal.subelements.core");
    var requests = require("com.subnodal.subelements.requests");
    var l10n = require("com.subnodal.subelements.l10n");
    var csengine = require("com.subnodal.codeslate.engine");
    var icon = require("com.subnodal.nanoplay.webapi.icon");
    var _ = l10n.translate;

    var resources = require("com.subnodal.nanoplay.website.resources");
    var dialogs = require("com.subnodal.nanoplay.website.dialogs");
    var communications = require("com.subnodal.nanoplay.website.communications");
    var simulator = require("com.subnodal.nanoplay.website.simulator");

    const SUPPORTED_LANGUAGES = ["en_GB", "fr_FR"];
    const DEFAULT_APP_ICON = "AAAAAAAAA////AAAf///YAAH///+AABAAAAgAAX/vgIAAEAAACAABe79wgAAQAAAIAAF+94CAABAAAAgAAW+/4IAAEAAACAABfvv4gAAQAAAIAAD///8AAAAAAAAAA==";

    exports.statuses = {
        DISCONNECTED: 0,
        CONNECTING: 1,
        CONNECTED: 2,
        UPLOADING: 3,
        UPLOADED: 4
    };

    var cseInstance = null;
    var simulatorInstance = null;
    var manifest = {
        id: null,
        name: {}
    };
    var status = exports.statuses.DISCONNECTED;
    var unsuccessfulConnections = 0;

    var lightTheme = null;
    var darkTheme = null;
    var wasOnDarkTheme = false;

    var lastUploadDate = null;
    var lastSyncedCode = null;
    var lastTypedCode = null;
    var syncInProgress = false;
    var canAcceptCodeLoad = true;

    var loadedAppsList = null;

    var iconEditorCanvasElement = null;
    var iconEditorMouseIsDown = false;
    var iconEditorLastPixelState = null;

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
            case exports.statuses.UPLOADING:
                return _("editor_status_uploading");
            case exports.statuses.UPLOADED:
                return _("editor_status_uploaded", {lastUploadDate: l10n.formatValue(lastUploadDate, {timeStyle: "short"})});
            default:
                return _("editor_status_disconnected");
        }
    };

    exports.setStatusGeneric = function() {
        if (communications.getConnectedNanoplayCount() > 0) {
            status = exports.statuses.CONNECTED;
        } else {
            status = exports.statuses.DISCONNECTED;
        }
    };

    exports.getUnsuccessfulConnections = function() {
        return unsuccessfulConnections;
    };

    exports.allowedToCommunicate = function() {
        return [exports.statuses.DISCONNECTED, exports.statuses.CONNECTED, exports.statuses.UPLOADED].includes(exports.getStatus());
    };

    exports.getAppName = function() {
        return manifest.name[exports.getSupportedLanguage()] || _("editor_defaultAppName");
    };

    exports.loadAppSettingsDialog = function() {
        document.getElementById("appNameInput").value = manifest.name[exports.getSupportedLanguage()] || "";
        exports.setEditorIconBase64(manifest.icon || DEFAULT_APP_ICON);

        dialogs.open("appSettings");
    };

    exports.saveAppSettingsDialog = function() {
        manifest.name[exports.getSupportedLanguage()] = document.getElementById("appNameInput").value;
        manifest.icon = exports.getEditorIconBase64() != DEFAULT_APP_ICON ? exports.getEditorIconBase64() : null;

        dialogs.close("appSettings");

        exports.syncToCloud();

        subElements.render();
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

        subElements.render();
    };

    exports.loadOpenAppDialog = function() {
        loadedAppsList = null;

        dialogs.open("openApp");
        subElements.render();

        resources.getAppsListFromCloud().then(function(appsList) {
            loadedAppsList = appsList;

            subElements.render();
        });
    };

    exports.getAppsList = function() {
        return loadedAppsList;
    };

    exports.connectToNewNanoplay = function() {
        status = exports.statuses.CONNECTING;

        if (!navigator.bluetooth) {
            dialogs.open("noBluetooth");

            return;
        }

        subElements.render();

        return communications.connectToNewNanoplay().then(function() {
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
    };

    exports.addToLog = function(text, source = "", type = "info") {
        var entryElement = document.createElement("div");
        var entryHeader = document.createElement("strong");
        var entryContents = document.createTextNode((source == "" ? "" : " ") + String(text));

        entryHeader.innerText = source;

        entryHeader.classList.add(type);

        entryElement.appendChild(entryHeader);
        entryElement.appendChild(entryContents);
        document.getElementById("editorLog").appendChild(entryElement);

        document.getElementById("editorLog").scrollTop = document.getElementById("editorLog").scrollHeight;
    };

    exports.clearLog = function() {
        document.getElementById("editorLog").innerHTML = "";
    };

    exports.syncToCloud = function() {
        cseInstance.code = cseInstance.code; // Ensure that old code isn't synced by calling setter method

        if (lastSyncedCode == cseInstance.code) {
            return Promise.resolve();
        }

        if (syncInProgress) {
            return new Promise(function(resolve, reject) {
                setTimeout(function() {
                    if (!syncInProgress) {
                        subElements.render();

                        resolve();
                    }
                }, 100);
            });
        }

        var codeBeforeSyncing = cseInstance.code;
        var isNew = manifest.id == null;

        syncInProgress = true;

        subElements.render();

        if (manifest.id == null) {
            manifest.id = core.generateKey();

            window.history.replaceState(null, _("nanoplayPage", {page: exports.getAppName()}), window.location.href + "?id=" + encodeURIComponent(manifest.id));
        }

        return resources.syncAppToCloud(cseInstance.code, manifest, isNew).then(function() {
            syncInProgress = false;
            lastSyncedCode = codeBeforeSyncing;

            document.getElementById("syncStatusIcon").innerText = "cloud_done";

            subElements.render();

            return Promise.resolve();
        });
    };

    exports.isSyncing = function() {
        return syncInProgress;
    };

    exports.isSynced = function() {
        return cseInstance != null && lastSyncedCode == cseInstance.code;
    };

    exports.ensureConnection = function() {
        communications.checkConnections();

        if (communications.getConnectedNanoplayCount() > 0) {
            return Promise.resolve();
        } else {
            return exports.connectToNewNanoplay();
        }
    };

    exports.uploadApp = function() {
        exports.clearLog();

        exports.ensureConnection().then(function() {
            status = exports.statuses.UPLOADING;

            cseInstance.code = cseInstance.code; // Ensure that old code isn't uploaded by calling setter method

            subElements.render();

            return exports.syncToCloud();
        }).then(function() {
            return communications.uploadApp(cseInstance.code, manifest);
        }).then(function() {
            status = exports.statuses.UPLOADED;
            lastUploadDate = new Date();

            subElements.render();

            communications.setSystemDate();
        }).catch(function(error) {
            console.error(error);

            if (error.name == "SyntaxError") {
                exports.addToLog(error.toString(), _("editor_logSource_codeChecker"), "error");
            } else {
                dialogs.open("communicationsError");
            }

            exports.setStatusGeneric();
            subElements.render();
        });
    };

    exports.getEditorIconPixel = function(x, y) {
        var imageData = iconEditorCanvasElement.getContext("2d").getImageData(x, y, 1, 1).data;

        return imageData[3] == 255;
    };

    exports.setEditorIconPixel = function(x, y, on = true) {
        iconEditorCanvasElement.getContext("2d").fillStyle = "#000000";

        if (on) {
            iconEditorCanvasElement.getContext("2d").fillRect(Math.round(x), Math.round(y), 1, 1);
        } else {
            iconEditorCanvasElement.getContext("2d").clearRect(Math.round(x), Math.round(y), 1, 1);
        }
    };

    exports.setEditorIconBase64 = function(base64, w, h) {
        for (var y = 0; y < 17; y++) {
            for (var x = 0; x < 44; x++) {
                exports.setEditorIconPixel(x, y, icon.getPixelAt(base64, x, y));
            }
        }
    };

    exports.getEditorIconBase64 = function() {
        var map = "";

        for (var y = 0; y < 17; y++) {
            for (var x = 0; x < 44; x++) {
                map += exports.getEditorIconPixel(x, y) ? "#" : " ";
            }

            if (y < 16) {
                map += "\n";
            }
        }

        return icon.create(map);
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

                resources.registerUserChangeListener(function(isSignedIn) {
                    if (!isSignedIn) {
                        return;
                    }

                    if (!canAcceptCodeLoad) {
                        return;
                    }

                    if (core.parameter("id") != null) {
                        resources.getAppFromCloud(core.parameter("id")).then(function(data) {
                            cseInstance.code = data.code;
                            manifest = data.manifest;

                            subElements.render();

                            document.getElementById("loadingCover").style.display = "none";

                            simulatorInstance.loadProgram(cseInstance.code);
                            simulatorInstance.start();
                        });
                    }

                    document.getElementById("loadingCover").style.display = "none";
                    canAcceptCodeLoad = false;
                });
            });

            simulatorInstance = new simulator.Simulator(document.getElementById("simulatorCanvas"));

            ["mousedown", "touchstart"].forEach(function(i) {
                document.getElementById("simulatorButtonTl").addEventListener(i, () => simulatorInstance.buttonStates[simulator.buttons.TL] = true);
                document.getElementById("simulatorButtonTr").addEventListener(i, () => simulatorInstance.buttonStates[simulator.buttons.TR] = true);
                document.getElementById("simulatorButtonBl").addEventListener(i, () => simulatorInstance.buttonStates[simulator.buttons.BL] = true);
                document.getElementById("simulatorButtonBr").addEventListener(i, () => simulatorInstance.buttonStates[simulator.buttons.BR] = true);
            });

            ["mouseup", "touchend"].forEach(function(i) {
                window.addEventListener(i, function() {
                    simulatorInstance.buttonStates[simulator.buttons.TL] = false;
                    simulatorInstance.buttonStates[simulator.buttons.TR] = false;
                    simulatorInstance.buttonStates[simulator.buttons.BL] = false;
                    simulatorInstance.buttonStates[simulator.buttons.BR] = false;
                });
            });

            simulatorInstance.catchError = function(error) {
                exports.addToLog(error.toString(), _("editor_logSource_simulator"), "error");
            };

            iconEditorCanvasElement = document.querySelector("#editorIconArea canvas");

            ["mousedown", "mousemove", "touchstart", "touchmove"].forEach(function(i) {
                iconEditorCanvasElement.addEventListener(i, function(event) {
                    var x = Math.floor(((i == "touchstart" || i == "touchmove" ? event.targetTouches[0] : event).pageX - iconEditorCanvasElement.getBoundingClientRect().left) * (44 / iconEditorCanvasElement.clientWidth));
                    var y = Math.floor(((i == "touchstart" || i == "touchmove" ? event.targetTouches[0] : event).pageY - iconEditorCanvasElement.getBoundingClientRect().top) * (17 / iconEditorCanvasElement.clientHeight));

                    if (i == "mousedown" || i == "touchstart") {
                        if (!iconEditorMouseIsDown && iconEditorLastPixelState == null) {
                            iconEditorLastPixelState = !exports.getEditorIconPixel(x, y);
                        }

                        iconEditorMouseIsDown = true;
                    }

                    if (iconEditorMouseIsDown) {
                        exports.setEditorIconPixel(x, y, iconEditorLastPixelState);
                    }

                    event.preventDefault();
                });
            });

            ["mouseup", "touchend"].forEach(function(i) {
                iconEditorCanvasElement.addEventListener(i, function() {
                    iconEditorMouseIsDown = false;
                    iconEditorLastPixelState = null;
                });
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

            setInterval(function() {
                if (exports.allowedToCommunicate()) {
                    var logMessages = communications.getLogMessages();

                    for (var name in logMessages) {
                        var matches = logMessages[name].match(/<error type="app">(.*?)<\/error>/g);

                        if (matches == null) {
                            continue;
                        }

                        for (var j = 0; j < matches.length; j++) {
                            exports.addToLog(/<error type="app">(.*?)<\/error>/g.exec(matches[j])[1], name, "error");
                        }
                    }
                }
            }, 1000);

            setInterval(function() {
                if (lastTypedCode != cseInstance.code) {
                    lastTypedCode = cseInstance.code;
                    
                    document.getElementById("syncStatusIcon").innerText = "save";

                    exports.clearLog();

                    simulatorInstance.loadProgram(cseInstance.code);
                    simulatorInstance.start();
                }
            }, 3000);

            window.onbeforeunload = function() {
                if (!exports.isSynced()) {
                    return _("editor_unsavedChangesWarning");
                }
            };

            manifest.name[exports.getSupportedLanguage()] = _("editor_defaultAppName");

            subElements.render();
        });
    });
});