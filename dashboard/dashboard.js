/*
    NanoPlay Website

    Copyright (C) Subnodal Technologies. All Rights Reserved.

    https://nanoplay.subnodal.com
    Licenced by the Subnodal Open-Source Licence, which can be found at LICENCE.md.
*/
namespace("com.subnodal.nanoplay.website.dashboard", function(exports) {
    var subElements = require("com.subnodal.subelements");

    var resources = require("com.subnodal.nanoplay.website.resources");

    resources.registerUserChangeListener(function(isSignedIn, isNewUser) {
        if (!isSignedIn) {
            window.location.replace("/signin.html");
        } else if (isNewUser) {
            window.location.replace("/firstauth.html");
        }
    });
});