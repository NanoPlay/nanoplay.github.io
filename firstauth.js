/*
    NanoPlay Website

    Copyright (C) Subnodal Technologies. All Rights Reserved.

    https://nanoplay.subnodal.com
    Licenced by the Subnodal Open-Source Licence, which can be found at LICENCE.md.
*/

namespace("com.subnodal.nanoplay.website.firstauth", function(exports) {
    var subElements = require("com.subnodal.subelements");

    var resources = require("com.subnodal.nanoplay.website.resources");

    window.firstAuth = exports;

    exports.finishSetup = function() {
        var chosenUsername = document.getElementById("username").value;

        if (chosenUsername.trim() == "") {
            return;
        }

        if (chosenUsername.length > 30) {
            return;
        }

        resources.applyUserSetting(resources.userSettings.USERNAME, chosenUsername);
    };

    resources.registerUserChangeListener(function(isSignedIn, isNewUser) {
        subElements.ready(function() {
            if (!isSignedIn) {
                window.location.replace("/signin.html");
            } else if (!isNewUser) {
                window.location.replace("/dashboard");
            }
        });
    });
});