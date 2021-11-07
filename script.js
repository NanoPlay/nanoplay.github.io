/*
    NanoPlay Website

    Copyright (C) Subnodal Technologies. All Rights Reserved.

    https://nanoplay.subnodal.com
    Licenced by the Subnodal Open-Source Licence, which can be found at LICENCE.md.
*/

namespace("com.subnodal.nanoplay.website", function() {
    var subElements = require("com.subnodal.subelements");
    var requests = require("com.subnodal.subelements.requests");
    var l10n = require("com.subnodal.subelements.l10n");

    var resources = require("com.subnodal.nanoplay.website.resources");

    window._ = l10n.translate;
    window.l10n = l10n;
    window.resources = resources;

    Promise.all([
        requests.getJson("/locale/en_GB.json")
    ]).then(function(languageResources) {
        subElements.init({
            languageResources: {
                "en_GB": languageResources[0]
            },
            localeCode: localStorage.getItem("lang") || undefined,
            fallbackLocaleCode: "en_GB"
        });

        subElements.ready(function() {
            resources.registerUserChangeListener(function() {
                subElements.render();
            });
        });
    });
});