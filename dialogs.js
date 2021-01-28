/*
    NanoPlay Website

    Copyright (C) Subnodal Technologies. All Rights Reserved.

    https://nanoplay.subnodal.com
    Licenced by the Subnodal Open-Source Licence, which can be found at LICENCE.md.
*/

namespace("com.subnodal.nanoplay.website.dialogs", function(exports) {
    var subElements = require("com.subnodal.subelements");

    exports.open = function(dialogId) {
        document.getElementById(dialogId).setAttribute("open", "");

        document.querySelector("dialog[open] a, dialog[open] input, dialog[open] button").focus();
    };

    exports.close = function(dialogId) {
        document.getElementById(dialogId).removeAttribute("open");
    };

    exports.closeAll = function() {
        for (var i = 0; i < document.getElementsByTagName("dialog").length; i++) {
            exports.close(document.getElementsByTagName("dialog")[i].id);
        }
    };

    subElements.ready(function() {
        var dialogBackground = document.createElement("div");

        dialogBackground.classList.add("dialogBackground");

        document.body.appendChild(dialogBackground);

        document.body.addEventListener("click", function(event) {
            if (event.target.isEqualNode(dialogBackground)) {
                exports.closeAll();
            }
        });
    });
});