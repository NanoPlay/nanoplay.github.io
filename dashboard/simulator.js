/*
    NanoPlay Website

    Copyright (C) Subnodal Technologies. All Rights Reserved.

    https://nanoplay.subnodal.com
    Licenced by the Subnodal Open-Source Licence, which can be found at LICENCE.md.
*/

namespace("com.subnodal.nanoplay.website.simulator", function(exports) {
    exports.Simulator = class {
        constructor(canvas) {
            this.canvas = canvas;
            this.canvasContext = this.canvas.getContext("2d");
        }
    };
});