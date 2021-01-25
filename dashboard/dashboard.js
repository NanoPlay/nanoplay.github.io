/*
    NanoPlay Website

    Copyright (C) Subnodal Technologies. All Rights Reserved.

    https://nanoplay.subnodal.com
    Licenced by the Subnodal Open-Source Licence, which can be found at LICENCE.md.
*/
namespace("com.subnodal.nanoplay.website.dashboard", function(exports) {
    var subElements = require("com.subnodal.subelements");

    var resources = require("com.subnodal.nanoplay.website.resources");

    exports.toggleTheme = function() {
        var wasDarkTheme = document.body.classList.contains("dark");

        if (wasDarkTheme) {
            document.body.classList.remove("dark");
            localStorage.setItem("darkTheme", "false");

            document.querySelector("#darkThemeButton icon").innerText = "dark_mode";
        } else {
            document.body.classList.add("dark");
            localStorage.setItem("darkTheme", "true");

            document.querySelector("#darkThemeButton icon").innerText = "light_mode";
        }
    };

    resources.registerUserChangeListener(function(isSignedIn, isNewUser) {
        if (!isSignedIn) {
            window.location.replace("/signin.html");
        } else if (isNewUser) {
            window.location.replace("/firstauth.html");
        }
    });

    subElements.ready(function() {
        if (localStorage.getItem("darkTheme") == "true") {
            exports.toggleTheme();
        }
    });
});