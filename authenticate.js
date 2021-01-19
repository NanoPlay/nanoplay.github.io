/*
    NanoPlay Website

    Copyright (C) Subnodal Technologies. All Rights Reserved.

    https://nanoplay.subnodal.com
    Licenced by the Subnodal Open-Source Licence, which can be found at LICENCE.md.
*/

namespace("com.subnodal.nanoplay.website.authenticate", function(exports) {
    var subElements = require("com.subnodal.subelements");
    var core = require("com.subnodal.subelements.core");

    var resources = require("com.subnodal.nanoplay.website.resources");
    var dialogs = require("com.subnodal.nanoplay.website.dialogs");

    subElements.ready(function() {
        if (core.parameter("public") != null && core.parameter("private") != null) {
            resources.authenticateWithSubnodal(core.parameter("public"), core.parameter("private")).then(function(isNewUser) {
                if (isNewUser) {
                    window.location.replace("firstauth.html");
                } else {
                    window.location.replace("/dashboard");
                }
            }).catch(function(error) {
                console.error(error);

                dialogs.open("authError");
            });
        } else {
            window.location.replace("/");
        }
    });
});