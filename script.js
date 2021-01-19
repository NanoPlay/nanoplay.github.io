/*
    NanoPlay Website

    Copyright (C) Subnodal Technologies. All Rights Reserved.

    https://nanoplay.subnodal.com
    Licenced by the Subnodal Open-Source Licence, which can be found at LICENCE.md.
*/

var subElements = require("com.subnodal.subelements");
var requests = require("com.subnodal.subelements.requests");
var l10n = require("com.subnodal.subelements.l10n");
var _ = l10n.translate;

var resources = require("com.subnodal.nanoplay.website.resources");

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