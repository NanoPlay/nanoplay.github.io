/*
    NanoPlay Website

    Copyright (C) Subnodal Technologies. All Rights Reserved.

    https://nanoplay.subnodal.com
    Licenced by the Subnodal Open-Source Licence, which can be found at LICENCE.md.
*/

namespace("com.subnodal.nanoplay.website.nav", function(exports) {
    var subElements = require("com.subnodal.subelements");

    exports.toggleMenu = function() {
        if (document.querySelector("nav .menu").style.display == "block") {
            document.querySelector("nav .menu").style.display = "none";
        } else { 
            document.querySelector("nav .menu").style.display = "block";
        }
    };

    subElements.ready(function() {
        window.addEventListener("click", function() {
            document.querySelector("nav .menu").style.display = "none";
        });

        setTimeout(function() {
            document.querySelector("nav").addEventListener("click", function(event) {
                if (event.target.closest(".menu, .menuToggleButton") != null) {
                    event.stopPropagation();
                }
            }, false);
        }, 100);
    });
});