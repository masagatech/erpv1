/*!
 * Bootstrap-submenu v1.2.7 (http://vsn4ik.github.io/bootstrap-submenu)
 * Copyright 2014 Vasily A. (https://github.com/vsn4ik)
 * Licensed under MIT (https://github.com/vsn4ik/bootstrap-submenu/blob/master/LICENSE)
 */

"use strict";
! function(a) { "function" == typeof define && define.amd ? define(["jquery"], a) : "object" == typeof exports ? module.exports = a(require("jquery")) : a(jQuery) }(function(a) {
    function b(b) { this.$element = a(b), this.$main = this.$element.closest(".dropdown, .btn-group"), this.$menu = this.$element.parent(), this.$drop = this.$menu.parent().parent(), this.$menus = this.$menu.siblings(".dropdown-submenu"); var d = this.$menu.find("> .dropdown-menu > " + c);
        this.$submenus = d.filter(".dropdown-submenu"), this.$items = d.not(".dropdown-submenu"), this.init() } var c = ":not(.disabled, .divider, .dropdown-header)"; return b.prototype = { init: function() { this.$element.on("click.bs.dropdown", this.click.bind(this)), this.$element.keydown(this.keydown.bind(this)), this.$menu.on("hide.bs.submenu", this.hide.bind(this)), this.$items.keydown(this.item_keydown.bind(this)), this.$menu.nextAll(c + ":first:not(.dropdown-submenu)").children("a").keydown(this.next_keydown.bind(this)) }, click: function(a) { a.stopPropagation(), this.toggle() }, toggle: function() { this.$menu.hasClass("open") ? this.close() : (this.$menu.addClass("open"), this.$menus.trigger("hide.bs.submenu")) }, hide: function(a) { a.stopPropagation(), this.close() }, close: function() { this.$menu.removeClass("open"), this.$submenus.trigger("hide.bs.submenu") }, keydown: function(a) { if (/^(32|38|40)$/.test(a.keyCode) && a.preventDefault(), /^(13|32)$/.test(a.keyCode)) this.toggle();
            else if (/^(27|38|40)$/.test(a.keyCode))
                if (a.stopPropagation(), 27 == a.keyCode) this.$menu.hasClass("open") ? this.close() : (this.$menus.trigger("hide.bs.submenu"), this.$drop.removeClass("open").children("a").focus());
                else { var b = this.$main.find("li:not(.disabled):visible > a"),
                        c = b.index(a.target); if (38 == a.keyCode && 0 !== c) c--;
                    else { if (40 != a.keyCode || c === b.length - 1) return;
                        c++ }
                    b.eq(c).focus() } }, item_keydown: function(a) { 27 == a.keyCode && (a.stopPropagation(), this.close(), this.$element.focus()) }, next_keydown: function(a) { if (38 == a.keyCode) { a.preventDefault(), a.stopPropagation(); var b = this.$drop.find("li:not(.disabled):visible > a"),
                    c = b.index(a.target);
                b.eq(c - 1).focus() } } }, a.fn.submenupicker = function(c) { var d = this instanceof a ? this : a(c); return d.each(function() { var c = a.data(this, "bs.submenu");
            c || (c = new b(this), a.data(this, "bs.submenu", c)) }) }, a.fn.submenupicker });



/*
waitMe - 1.18 [23.09.16]
Author: vadimsva
Github: https://github.com/vadimsva/waitMe
*/
(function(b) {
    b.fn.waitMe = function(p) {
        return this.each(function() {
            var f = b(this),
                x, g, e, r = !1,
                t = "background-color",
                u = "",
                q = "",
                v, a, w, l = {
                    init: function() {
                        function y(a) { m.css({ top: "auto", transform: "translateY(" + a + "px) translateZ(0)" }) }
                        a = b.extend({ effect: "bounce", text: "", bg: "rgba(255,255,255,0.7)", color: "#000", maxSize: "", textPos: "vertical", fontSize: "", source: "", onClose: function() {} }, p);
                        w = (new Date).getMilliseconds();
                        v = b('<div class="waitMe" data-waitme_id="' + w + '"></div>');
                        switch (a.effect) {
                            case "none":
                                e = 0;
                                break;
                            case "bounce":
                                e = 3;
                                break;
                            case "rotateplane":
                                e = 1;
                                break;
                            case "stretch":
                                e = 5;
                                break;
                            case "orbit":
                                e = 2;
                                r = !0;
                                break;
                            case "roundBounce":
                                e = 12;
                                break;
                            case "win8":
                                e = 5;
                                r = !0;
                                break;
                            case "win8_linear":
                                e = 5;
                                r = !0;
                                break;
                            case "ios":
                                e = 12;
                                break;
                            case "facebook":
                                e = 3;
                                break;
                            case "rotation":
                                e = 1;
                                t = "border-color";
                                break;
                            case "timer":
                                e = 2;
                                var c = b.isArray(a.color) ? a.color[0] : a.color;
                                u = "border-color:" + c;
                                break;
                            case "pulse":
                                e = 1;
                                t = "border-color";
                                break;
                            case "progressBar":
                                e = 1;
                                break;
                            case "bouncePulse":
                                e = 3;
                                break;
                            case "img":
                                e = 1
                        }
                        "" !== u && (u += ";");
                        if (0 < e) { if ("img" === a.effect) q = '<img src="' + a.source + '">';
                            else
                                for (var d = 1; d <= e; ++d) b.isArray(a.color) ? (c = a.color[d], void 0 == c && (c = "#000")) : c = a.color, q = r ? q + ('<div class="waitMe_progress_elem' + d + '"><div style="' + t + ":" + c + '"></div></div>') : q + ('<div class="waitMe_progress_elem' + d + '" style="' + t + ":" + c + '"></div>');
                            g = b('<div class="waitMe_progress ' + a.effect + '" style="' + u + '">' + q + "</div>") }
                        a.text && (c = b.isArray(a.color) ? a.color[0] : a.color, x = b('<div class="waitMe_text" style="color:' + c + ";" + ("" != a.fontSize ? "font-size:" +
                            a.fontSize : "") + '">' + a.text + "</div>"));
                        var k = f.find("> .waitMe");
                        k && k.remove();
                        c = b('<div class="waitMe_content ' + a.textPos + '"></div>');
                        c.append(g, x);
                        v.append(c);
                        "HTML" == f[0].tagName && (f = b("body"));
                        f.addClass("waitMe_container").attr("data-waitme_id", w).append(v);
                        var k = f.find("> .waitMe"),
                            m = f.find(".waitMe_content");
                        k.css({ background: a.bg });
                        "" !== a.maxSize && "none" != a.effect && (c = g.outerHeight(), g.outerWidth(), "img" === a.effect ? (g.css({ height: a.maxSize + "px" }), g.find(">img").css({ maxHeight: "100%" }), m.css({
                            marginTop: -m.outerHeight() /
                                2 + "px"
                        })) : a.maxSize < c && ("stretch" == a.effect ? (g.css({ height: a.maxSize + "px", width: a.maxSize + "px" }), g.find("> div").css({ margin: "0 5%" })) : (c = a.maxSize / c - .2, d = "-50%", "roundBounce" == a.effect ? (d = "-75%", a.text && (d = "75%")) : "win8" == a.effect || "timer" == a.effect || "orbit" == a.effect ? (d = "-20%", a.text && (d = "20%")) : "ios" == a.effect && (d = "-15%", a.text && (d = "15%")), "rotation" == a.effect && a.text && (d = "75%"), g.css({ transform: "scale(" + c + ") translateX(" + d + ")", whiteSpace: "nowrap" }))));
                        m.css({ marginTop: -m.outerHeight() / 2 + "px" });
                        if (f.outerHeight() > b(window).height()) { var c = b(window).scrollTop(),
                                h = m.outerHeight(),
                                n = f.offset().top,
                                l = f.outerHeight(),
                                d = c - n + b(window).height() / 2;
                            0 > d && (d = Math.abs(d));
                            0 <= d - h && d + h <= l ? n - c > b(window).height() / 2 && (d = h) : d = c > n + l - h ? c - n - h : c - n + h;
                            y(d);
                            b(document).scroll(function() { var a = b(window).scrollTop() - n + b(window).height() / 2;
                                0 <= a - h && a + h <= l && y(a) }) }
                        k.on("destroyed", function() { if (a.onClose && b.isFunction(a.onClose)) a.onClose();
                            k.trigger("close") });
                        b.event.special.destroyed = {
                            remove: function(a) {
                                a.handler &&
                                    a.handler()
                            }
                        };
                        return k
                    },
                    hide: function() { var a = f.attr("data-waitme_id");
                        f.removeClass("waitMe_container").removeAttr("data-waitme_id");
                        f.find('.waitMe[data-waitme_id="' + a + '"]').remove() }
                };
            if (l[p]) return l[p].apply(this, Array.prototype.slice.call(arguments, 1));
            if ("object" === typeof p || !p) return l.init.apply(this, arguments)
        })
    };
    b(window).on("load", function() {
        b("body.waitMe_body").addClass("hideMe");
        setTimeout(function() { b("body.waitMe_body").find(".waitMe_container:not([data-waitme_id])").remove();
                b("body.waitMe_body").removeClass("waitMe_body hideMe") },
            200)
    })
})(jQuery);