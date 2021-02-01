/*
    NanoPlay Website

    Copyright (C) Subnodal Technologies. All Rights Reserved.

    https://nanoplay.subnodal.com
    Licenced by the Subnodal Open-Source Licence, which can be found at LICENCE.md.
*/

namespace("com.subnodal.nanoplay.website.simulator.graphics", function(exports) {
    /*
        Some source code derived from
        https://github.com/espruino/Espruino/blob/master/libs/graphics/graphics.c
        to achieve full emulation of the NanoPlay API's graphics commands
    */

    exports.PIXEL_ON_COLOUR = "#000000";
    exports.PIXEL_OFF_COLOUR = "#7fc5f7";

    exports.FONT_3X6_CHARS = " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}´█€";
    exports.FONT_3X6_DATA = "AAAAADoAMAAwPhQ+Gj8WJgkyNj4KADAAHCIAACIcGDAYBA4EAQIABAQEAAIABggwHCIcEj4CJioSIioUHCQ+OiokHCokICY4FCoUECocAAoAAQoABAoACgoKAAoEICoQHCoaHiQePioUHCIUPiIcPioiPiggHCIuPgg+Ij4iBAI8PhgmPgICPh4+Phw+HCIcPiQYHCYePiQaEiokID4gPgI+PAY8Pgw+Ngg2OA44JioyPiIiMAgGIiI+ECAQAgICIBAAFhYOPhIMDBISDBI+DBoKCB4oCRUePhAOCi4CCS4APggWIj4CHh4OHhAODBIMHxIMDBIfHggQChoUEDwSHAIeHAYcHg4eFggWGQUeFhoSCD4iAD4AIj4IEDAgPz8/Hi0h";

    exports.FONT_6X8_CHARS = " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_£abcdefghijklmnopqrstuvwxyz{|}~©";
    exports.FONT_6X8_DATA = "AAAAAPoAwADAAFhw2HDQAGSS/5JMAGCW+LzSDAxSolIMEsAAPEKBAIFCPABIMOAwSAAQEHwQEAABBgAQEBAQAAIAAwwwwAB8ipKifABA/gBChoqSYgCEkrLSjAAYKEj+CADkoqKinAA8UpKSDACAgI6wwABskpKSbABgkpKUeAAiAAEmABAoRAAoKCgoKABEKBAAQIqQYAA8WqW9RDgOOMg4DgD+kpKSbAB8goKCRAD+goJEOAD+kpKCAP6QkIAAfIKCklwA/hAQEP4A/gAMAgIC/AD+EChEggD+AgICAP5AIED+AP7AMAz+AHyCgoJ8AP6QkJBgAHyChoN8AP6QmJRiAGSSkpJMAICA/oCAAPwCAgL8AOAYBhjgAPAOMA7wAMYoECjGAMAgHiDAAI6SosIA/4EAwDAMAwCB/wBAgEAAAQEBAQEBEn6SggQABCoqHgD+IiIcABwiIhQAHCIi/gAcKioYACB+oIAAGCUlPgD+ICAeAL4AAQG+AP4IFCIA/AIAPiAeIB4APiAgHgAcIiIcAD8kJBgAGCQkPwA+ECAgABIqKiQAIPwiADwCAjwAIBgGGCAAOAYIBjgAIhQIFCIAIRkGGCAAJioyIgAQboEA5wCBbhAAQIDAQIAAPFqlpUI8";
    exports.FONT_6X8_WIDTHS = "BAIEBgYGBgIEBAYGAwUCBQYDBgYGBgYGBgYCAwQGBAUGBgYGBgUFBgYCBgYFBgYGBgYGBgYGBgYGBgUDBQMEBgYFBQUFBQUFBQIEBQMGBQUFBQUFBAUGBgYGBQQCBAYG";

    function rgbToHex(r, g, b) {
        return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
    }

    exports.getPixel = function(sim, x, y) {
        var imageData = sim.canvasContext.getImageData(x, y, 1, 1).data;

        return rgbToHex(imageData[0], imageData[1], imageData[2]) == exports.PIXEL_ON_COLOUR;
    };

    exports.setPixel = function(sim, x, y, on) {
        sim.canvasContext.fillStyle = on ? exports.PIXEL_ON_COLOUR : exports.PIXEL_OFF_COLOUR;

        sim.canvasContext.fillRect(Math.round(x), Math.round(y), 1, 1);
    };

    exports.clear = function(sim, on) {
        sim.canvasContext.fillStyle = on ? exports.PIXEL_ON_COLOUR : exports.PIXEL_OFF_COLOUR;

        sim.canvasContext.fillRect(0, 0, 127, 63);
    };

    exports.line = function(sim, x1, y1, x2, y2, on) {
        var xDelta = x2 - x1;
        var yDelta = y2 - y1;

        if (xDelta < 0) {
            xDelta = -xDelta;
        } else if (xDelta == 0) {
            xDelta = 1;
        }

        if (yDelta < 0) {
            yDelta = -yDelta;
        } else if (yDelta == 0) {
            yDelta = 1;
        }

        if (xDelta > yDelta) {
            if (x1 > x2) {
                var swap;

                swap = x1;
                x1 = x2;
                x2 = swap;

                swap = y1;
                y1 = y2;
                y2 = swap;
            }

            var position = (y1 << 8) + 128;
            var step = ((y2 - y1) << 8) / xDelta;
            
            for (var x = x1; x <= x2; x++) {
                exports.setPixel(sim, x, position >> 8, on);

                position += step;
            }
        } else {
            if (y1 > y2) {
                var swap;

                swap = x1;
                x1 = x2;
                x2 = swap;

                swap = y1;
                y1 = y2;
                y2 = swap;
            }

            var position = (x1 << 8) + 128;
            var step = ((x2 - x1) << 8) / yDelta;

            for (var y = y1; y <= y2; y++) {
                exports.setPixel(sim, position >> 8, y, on);

                position += step;
            }
        }
    };

    exports.rect = function(sim, x, y, w, h, fill, on) {
        sim.canvasContext.fillStyle = on ? exports.PIXEL_ON_COLOUR : exports.PIXEL_OFF_COLOUR;

        exports.line(sim, x, y, x + w, y, on);
        exports.line(sim, x, y, x, y + h, on);
        exports.line(sim, x + w, y, x + w, y + h, on);
        exports.line(sim, x, y + h, x + w, y + h, on);

        if (fill) {
            sim.canvasContext.fillRect(x, y, w, h);
        }
    };

    function twoPointRect(sim, x1, y1, x2, y2, fill, on) {
        var x = Math.min(x1, x2);
        var y = Math.min(y1, y2);
        var w = Math.abs(x2 - x1);
        var h = Math.abs(y2 - y1);

        console.log(x, y, w, h, y1, y2);

        exports.rect(sim, x, y, w, h, fill, on);
    }

    exports.ellipse = function(sim, x, y, w, h, fill, on) {
        var x1 = x;
        var y1 = y;
        var x2 = x1 + w;
        var y2 = y1 + h;

        x = (x1 + x2) / 2;
        y = (y1 + y2) / 2;
        
        var mx = (x2 - x1) / 2;
        var my = (y2 - y1) / 2;
        var dx = 0;
        var dy = my;
        var mx2 = mx * mx;
        var my2 = my * my;
        var err1 = my2 - (2 * my - 1) * mx2;
        var err2;
        var changed = false;

        if (fill) {
            do {
                changed = false;

                err2 = err1 * 2;

                if (err2 < (2 * dx + 1) * my2) {
                    dx++;
                    err1 += (2 * dx + 1) * my2;
                    changed = true;
                }

                if (err2 > -(2 * dy - 1) * mx2) {
                    twoPointRect(sim, x + dx, y + dy, x - dx, y + dy + 1, true, on);
                    twoPointRect(sim, x + dx, y - dy, x - dx, y - dy + 1, true, on);

                    dy--;
                    err1 -= (2 * dy - 1) * mx2;
                    changed = true;
                }
            } while (changed && dy >= 0);

            while (dx++ < mx) {
                exports.rect(sim, x + dx, y, x - dx, y + 1, true, on);
            }
        } else {
            do {
                changed = false;

                exports.setPixel(sim, x + dx, y + dy, on);
                exports.setPixel(sim, x - dx, y + dy, on);
                exports.setPixel(sim, x + dx, y - dy, on);
                exports.setPixel(sim, x - dx, y - dy, on);

                err2 = err1 * 2;

                if (err2 < (2 * dx + 1) * my2) {
                    dx++;
                    err1 += (2 * dx + 1) * my2;
                    changed = true;
                }

                if (err2 > -(2 * dy - 1) * mx2) {
                    dy--;
                    err1 -= (2 * dy - 1) * mx2;
                    changed = true;
                }
            } while (changed && dy >= 0);

            while (dx++ < mx) {
                exports.setPixel(sim, x + dx, y, on);
                exports.setPixel(sim, x - dx, y, on);
            }
        }
    };

    exports.text = function(sim, x, y, text, mini, on) {
        if (mini) {
            for (var i = 0; i < text.length; i++) {
                for (var cx = 0; cx < 3; cx++) {
                    var charData = atob(exports.FONT_3X6_DATA).charCodeAt((exports.FONT_3X6_CHARS.indexOf(text[i]) * 3) + cx);

                    for (var cy = 0; cy < 6; cy++) {
                        if (charData.toString(2).padStart(6, "0")[cy] == "1") {
                            exports.setPixel(sim, x, y + cy, on);
                        }
                    }

                    x++;
                }

                x++;
            }
        } else {
            var widths = [];
            var widthData = atob(exports.FONT_6X8_WIDTHS);

            for (var i = 0; i < widthData.length; i++) {
                widths.push(widthData.charCodeAt(i));
            }

            for (var i = 0; i < text.length; i++) {
                var charWidth = widths[exports.FONT_6X8_CHARS.indexOf(text[i])];

                for (var cx = 0; cx < charWidth; cx++) {
                    var charData = atob(exports.FONT_6X8_DATA).charCodeAt(widths.slice(0, exports.FONT_6X8_CHARS.indexOf(text[i])).reduce((a, b) => a + b, 0) + cx);

                    for (var cy = 0; cy < 8; cy++) {
                        if (charData.toString(2).padStart(8, "0")[cy] == "1") {
                            exports.setPixel(sim, x, y + cy, on);
                        }
                    }

                    x++;
                }

                x++;
            }
        }
    };

    exports.getTextWidth = function(text, mini) {
        var width = 0;

        if (mini) {
            width = (text.length * 4) - 1;
        } else {
            var widths = [];
            var widthData = atob(exports.FONT_6X8_WIDTHS);

            for (var i = 0; i < widthData.length; i++) {
                widths.push(widthData.charCodeAt(i));
            }

            for (var i = 0; i < text.length; i++) {
                var charWidth = widths[exports.FONT_6X8_CHARS.indexOf(text[i])];

                for (var cx = 0; cx < charWidth; cx++) {
                    width++;
                }

                width++;
            }

            width--;
        }

        return width;
    };
});