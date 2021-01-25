/*
    NanoPlay Website

    Copyright (C) Subnodal Technologies. All Rights Reserved.

    https://nanoplay.subnodal.com
    Licenced by the Subnodal Open-Source Licence, which can be found at LICENCE.md.
*/
namespace("com.subnodal.nanoplay.website.dashboard", function(exports) {
    var subElements = require("com.subnodal.subelements");

    var resources = require("com.subnodal.nanoplay.website.resources");
    
    var darkThemeEnabled = false;

    exports.toggleTheme = function() {
        darkThemeEnabled = !darkThemeEnabled;
        
        localStorage.setItem("darkTheme", String(darkThemeEnabled));
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
            darkThemeEnabled = true;
        }

        setInterval(function() {
            if (darkThemeEnabled) {
                document.body.classList.remove("dark");
    
                document.querySelector("#darkThemeButton icon").innerText = "dark_mode";
            } else {
                document.body.classList.add("dark");
    
                document.querySelector("#darkThemeButton icon").innerText = "light_mode";
            }
        });
    });
});