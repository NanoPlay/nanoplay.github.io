/*
    NanoPlay Website

    Copyright (C) Subnodal Technologies. All Rights Reserved.

    https://nanoplay.subnodal.com
    Licenced by the Subnodal Open-Source Licence, which can be found at LICENCE.md.
*/

namespace("com.subnodal.nanoplay.website.manager", function(exports) {
    var subElements = require("com.subnodal.subelements");
    var nanoplay = require("com.subnodal.nanoplay.webapi");

    window.manager = exports;

    exports.MAXIMUM_FREE_STORAGE = 8_712; // Bytes

    exports.pages = {
        GENERAL: 0,
        APPS: 1
    };

    var currentPage = exports.pages.GENERAL;
    var currentNanoplay = new nanoplay.NanoPlay();
    var loadedAppsList = {};
    var loadedFreeStorage = 0;

    exports.getCurrentPage = function() {
        return currentPage;
    }

    exports.setCurrentPage = function(page) {
        currentPage = page;

        subElements.render();
    };

    exports.getCurrentNanoplay = function() {
        return currentNanoplay;
    };

    exports.showLoading = function(loadingMessage = _("manager_applyingSetting")) {
        document.querySelector("#loadingMessage").textContent = loadingMessage;

        document.querySelector("#loading").removeAttribute("hidden");
    };

    exports.hideLoading = function() {
        document.querySelector("#loading").setAttribute("hidden", "");
    };

    exports.getAppsList = function() {
        exports.showLoading(_("manager_gettingApps"));

        return currentNanoplay.getApps().then(function(apps) {
            loadedAppsList = apps;

            manager.setCurrentPage(manager.pages.APPS);            

            exports.hideLoading();

            return Promise.resolve();
        });
    };

    exports.getLoadedAppsList = function() {
        return loadedAppsList;
    };

    exports.getFreeStorage = function() {
        return currentNanoplay.getFreeStorage().then(function(data) {
            loadedFreeStorage = data;

            subElements.render();
            
            return Promise.resolve();
        });
    };

    exports.getLoadedFreeStorage = function() {
        return loadedFreeStorage;
    };

    exports.deleteApp = function(appId) {
        exports.showLoading(_("manager_gettingApps"));

        return currentNanoplay.removeApp(appId).then(function() {
            delete loadedAppsList[appId];

            return exports.getFreeStorage().then(function() {
                exports.hideLoading();

                return Promise.resolve();
            });
        });
    };

    exports.connect = function() {
        document.querySelector("#connectButton").textContent = _("connecting");
        document.querySelector("#connectButton").disabled = true;

        return currentNanoplay.connect().then(function() {
            document.querySelector("#connectButton").textContent = _("connect");
            document.querySelector("#connectButton").disabled = false;

            document.querySelector("#connectError").textContent = "";

            return exports.getFreeStorage();
        }).catch(function(error) {
            document.querySelector("#connectButton").textContent = _("connect");
            document.querySelector("#connectButton").disabled = false;

            document.querySelector("#connectError").textContent = _("manager_connectionError");

            console.error(error);

            return Promise.resolve();
        });
    };

    subElements.ready(function() {
        document.querySelectorAll("#managerOptions, #managerOptions div button, #managerOptions div label").forEach(function(element) {
            element.addEventListener("mouseover", function(event) {
                var previewScreen = element.getAttribute("data-preview") || "home";

                document.querySelector("#managerPreview .device .screen").style.backgroundImage = `url("/media/manager/${previewScreen}.png")`;

                event.stopPropagation();
            });
        });
    });
});