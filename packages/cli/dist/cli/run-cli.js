#!/usr/bin/env bun
// @bun
import { createRequire } from "node:module";
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __require = /* @__PURE__ */ createRequire(import.meta.url);

// ../../node_modules/sisteransi/src/index.js
var require_src = __commonJS((exports, module) => {
  var ESC = "\x1B";
  var CSI = `${ESC}[`;
  var beep = "\x07";
  var cursor = {
    to(x, y) {
      if (!y)
        return `${CSI}${x + 1}G`;
      return `${CSI}${y + 1};${x + 1}H`;
    },
    move(x, y) {
      let ret = "";
      if (x < 0)
        ret += `${CSI}${-x}D`;
      else if (x > 0)
        ret += `${CSI}${x}C`;
      if (y < 0)
        ret += `${CSI}${-y}A`;
      else if (y > 0)
        ret += `${CSI}${y}B`;
      return ret;
    },
    up: (count = 1) => `${CSI}${count}A`,
    down: (count = 1) => `${CSI}${count}B`,
    forward: (count = 1) => `${CSI}${count}C`,
    backward: (count = 1) => `${CSI}${count}D`,
    nextLine: (count = 1) => `${CSI}E`.repeat(count),
    prevLine: (count = 1) => `${CSI}F`.repeat(count),
    left: `${CSI}G`,
    hide: `${CSI}?25l`,
    show: `${CSI}?25h`,
    save: `${ESC}7`,
    restore: `${ESC}8`
  };
  var scroll = {
    up: (count = 1) => `${CSI}S`.repeat(count),
    down: (count = 1) => `${CSI}T`.repeat(count)
  };
  var erase = {
    screen: `${CSI}2J`,
    up: (count = 1) => `${CSI}1J`.repeat(count),
    down: (count = 1) => `${CSI}J`.repeat(count),
    line: `${CSI}2K`,
    lineEnd: `${CSI}K`,
    lineStart: `${CSI}1K`,
    lines(count) {
      let clear = "";
      for (let i = 0;i < count; i++)
        clear += this.line + (i < count - 1 ? cursor.up() : "");
      if (count)
        clear += cursor.left;
      return clear;
    }
  };
  module.exports = { cursor, scroll, erase, beep };
});

// ../../node_modules/picocolors/picocolors.js
var require_picocolors = __commonJS((exports, module) => {
  var p = process || {};
  var argv = p.argv || [];
  var env = p.env || {};
  var isColorSupported = !(!!env.NO_COLOR || argv.includes("--no-color")) && (!!env.FORCE_COLOR || argv.includes("--color") || p.platform === "win32" || (p.stdout || {}).isTTY && env.TERM !== "dumb" || !!env.CI);
  var formatter = (open, close, replace = open) => (input) => {
    let string = "" + input, index = string.indexOf(close, open.length);
    return ~index ? open + replaceClose(string, close, replace, index) + close : open + string + close;
  };
  var replaceClose = (string, close, replace, index) => {
    let result = "", cursor = 0;
    do {
      result += string.substring(cursor, index) + replace;
      cursor = index + close.length;
      index = string.indexOf(close, cursor);
    } while (~index);
    return result + string.substring(cursor);
  };
  var createColors = (enabled = isColorSupported) => {
    let f = enabled ? formatter : () => String;
    return {
      isColorSupported: enabled,
      reset: f("\x1B[0m", "\x1B[0m"),
      bold: f("\x1B[1m", "\x1B[22m", "\x1B[22m\x1B[1m"),
      dim: f("\x1B[2m", "\x1B[22m", "\x1B[22m\x1B[2m"),
      italic: f("\x1B[3m", "\x1B[23m"),
      underline: f("\x1B[4m", "\x1B[24m"),
      inverse: f("\x1B[7m", "\x1B[27m"),
      hidden: f("\x1B[8m", "\x1B[28m"),
      strikethrough: f("\x1B[9m", "\x1B[29m"),
      black: f("\x1B[30m", "\x1B[39m"),
      red: f("\x1B[31m", "\x1B[39m"),
      green: f("\x1B[32m", "\x1B[39m"),
      yellow: f("\x1B[33m", "\x1B[39m"),
      blue: f("\x1B[34m", "\x1B[39m"),
      magenta: f("\x1B[35m", "\x1B[39m"),
      cyan: f("\x1B[36m", "\x1B[39m"),
      white: f("\x1B[37m", "\x1B[39m"),
      gray: f("\x1B[90m", "\x1B[39m"),
      bgBlack: f("\x1B[40m", "\x1B[49m"),
      bgRed: f("\x1B[41m", "\x1B[49m"),
      bgGreen: f("\x1B[42m", "\x1B[49m"),
      bgYellow: f("\x1B[43m", "\x1B[49m"),
      bgBlue: f("\x1B[44m", "\x1B[49m"),
      bgMagenta: f("\x1B[45m", "\x1B[49m"),
      bgCyan: f("\x1B[46m", "\x1B[49m"),
      bgWhite: f("\x1B[47m", "\x1B[49m"),
      blackBright: f("\x1B[90m", "\x1B[39m"),
      redBright: f("\x1B[91m", "\x1B[39m"),
      greenBright: f("\x1B[92m", "\x1B[39m"),
      yellowBright: f("\x1B[93m", "\x1B[39m"),
      blueBright: f("\x1B[94m", "\x1B[39m"),
      magentaBright: f("\x1B[95m", "\x1B[39m"),
      cyanBright: f("\x1B[96m", "\x1B[39m"),
      whiteBright: f("\x1B[97m", "\x1B[39m"),
      bgBlackBright: f("\x1B[100m", "\x1B[49m"),
      bgRedBright: f("\x1B[101m", "\x1B[49m"),
      bgGreenBright: f("\x1B[102m", "\x1B[49m"),
      bgYellowBright: f("\x1B[103m", "\x1B[49m"),
      bgBlueBright: f("\x1B[104m", "\x1B[49m"),
      bgMagentaBright: f("\x1B[105m", "\x1B[49m"),
      bgCyanBright: f("\x1B[106m", "\x1B[49m"),
      bgWhiteBright: f("\x1B[107m", "\x1B[49m")
    };
  };
  module.exports = createColors();
  module.exports.createColors = createColors;
});

// ../../node_modules/@clack/core/dist/index.mjs
var import_sisteransi = __toESM(require_src(), 1);
import { stdin as j, stdout as M } from "node:process";
import * as g from "node:readline";
import O from "node:readline";
import { Writable as X } from "node:stream";
function DD({ onlyFirst: e = false } = {}) {
  const t = ["[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?(?:\\u0007|\\u001B\\u005C|\\u009C))", "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))"].join("|");
  return new RegExp(t, e ? undefined : "g");
}
var uD = DD();
function P(e) {
  if (typeof e != "string")
    throw new TypeError(`Expected a \`string\`, got \`${typeof e}\``);
  return e.replace(uD, "");
}
function L(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var W = { exports: {} };
(function(e) {
  var u = {};
  e.exports = u, u.eastAsianWidth = function(F) {
    var s = F.charCodeAt(0), i = F.length == 2 ? F.charCodeAt(1) : 0, D = s;
    return 55296 <= s && s <= 56319 && 56320 <= i && i <= 57343 && (s &= 1023, i &= 1023, D = s << 10 | i, D += 65536), D == 12288 || 65281 <= D && D <= 65376 || 65504 <= D && D <= 65510 ? "F" : D == 8361 || 65377 <= D && D <= 65470 || 65474 <= D && D <= 65479 || 65482 <= D && D <= 65487 || 65490 <= D && D <= 65495 || 65498 <= D && D <= 65500 || 65512 <= D && D <= 65518 ? "H" : 4352 <= D && D <= 4447 || 4515 <= D && D <= 4519 || 4602 <= D && D <= 4607 || 9001 <= D && D <= 9002 || 11904 <= D && D <= 11929 || 11931 <= D && D <= 12019 || 12032 <= D && D <= 12245 || 12272 <= D && D <= 12283 || 12289 <= D && D <= 12350 || 12353 <= D && D <= 12438 || 12441 <= D && D <= 12543 || 12549 <= D && D <= 12589 || 12593 <= D && D <= 12686 || 12688 <= D && D <= 12730 || 12736 <= D && D <= 12771 || 12784 <= D && D <= 12830 || 12832 <= D && D <= 12871 || 12880 <= D && D <= 13054 || 13056 <= D && D <= 19903 || 19968 <= D && D <= 42124 || 42128 <= D && D <= 42182 || 43360 <= D && D <= 43388 || 44032 <= D && D <= 55203 || 55216 <= D && D <= 55238 || 55243 <= D && D <= 55291 || 63744 <= D && D <= 64255 || 65040 <= D && D <= 65049 || 65072 <= D && D <= 65106 || 65108 <= D && D <= 65126 || 65128 <= D && D <= 65131 || 110592 <= D && D <= 110593 || 127488 <= D && D <= 127490 || 127504 <= D && D <= 127546 || 127552 <= D && D <= 127560 || 127568 <= D && D <= 127569 || 131072 <= D && D <= 194367 || 177984 <= D && D <= 196605 || 196608 <= D && D <= 262141 ? "W" : 32 <= D && D <= 126 || 162 <= D && D <= 163 || 165 <= D && D <= 166 || D == 172 || D == 175 || 10214 <= D && D <= 10221 || 10629 <= D && D <= 10630 ? "Na" : D == 161 || D == 164 || 167 <= D && D <= 168 || D == 170 || 173 <= D && D <= 174 || 176 <= D && D <= 180 || 182 <= D && D <= 186 || 188 <= D && D <= 191 || D == 198 || D == 208 || 215 <= D && D <= 216 || 222 <= D && D <= 225 || D == 230 || 232 <= D && D <= 234 || 236 <= D && D <= 237 || D == 240 || 242 <= D && D <= 243 || 247 <= D && D <= 250 || D == 252 || D == 254 || D == 257 || D == 273 || D == 275 || D == 283 || 294 <= D && D <= 295 || D == 299 || 305 <= D && D <= 307 || D == 312 || 319 <= D && D <= 322 || D == 324 || 328 <= D && D <= 331 || D == 333 || 338 <= D && D <= 339 || 358 <= D && D <= 359 || D == 363 || D == 462 || D == 464 || D == 466 || D == 468 || D == 470 || D == 472 || D == 474 || D == 476 || D == 593 || D == 609 || D == 708 || D == 711 || 713 <= D && D <= 715 || D == 717 || D == 720 || 728 <= D && D <= 731 || D == 733 || D == 735 || 768 <= D && D <= 879 || 913 <= D && D <= 929 || 931 <= D && D <= 937 || 945 <= D && D <= 961 || 963 <= D && D <= 969 || D == 1025 || 1040 <= D && D <= 1103 || D == 1105 || D == 8208 || 8211 <= D && D <= 8214 || 8216 <= D && D <= 8217 || 8220 <= D && D <= 8221 || 8224 <= D && D <= 8226 || 8228 <= D && D <= 8231 || D == 8240 || 8242 <= D && D <= 8243 || D == 8245 || D == 8251 || D == 8254 || D == 8308 || D == 8319 || 8321 <= D && D <= 8324 || D == 8364 || D == 8451 || D == 8453 || D == 8457 || D == 8467 || D == 8470 || 8481 <= D && D <= 8482 || D == 8486 || D == 8491 || 8531 <= D && D <= 8532 || 8539 <= D && D <= 8542 || 8544 <= D && D <= 8555 || 8560 <= D && D <= 8569 || D == 8585 || 8592 <= D && D <= 8601 || 8632 <= D && D <= 8633 || D == 8658 || D == 8660 || D == 8679 || D == 8704 || 8706 <= D && D <= 8707 || 8711 <= D && D <= 8712 || D == 8715 || D == 8719 || D == 8721 || D == 8725 || D == 8730 || 8733 <= D && D <= 8736 || D == 8739 || D == 8741 || 8743 <= D && D <= 8748 || D == 8750 || 8756 <= D && D <= 8759 || 8764 <= D && D <= 8765 || D == 8776 || D == 8780 || D == 8786 || 8800 <= D && D <= 8801 || 8804 <= D && D <= 8807 || 8810 <= D && D <= 8811 || 8814 <= D && D <= 8815 || 8834 <= D && D <= 8835 || 8838 <= D && D <= 8839 || D == 8853 || D == 8857 || D == 8869 || D == 8895 || D == 8978 || 9312 <= D && D <= 9449 || 9451 <= D && D <= 9547 || 9552 <= D && D <= 9587 || 9600 <= D && D <= 9615 || 9618 <= D && D <= 9621 || 9632 <= D && D <= 9633 || 9635 <= D && D <= 9641 || 9650 <= D && D <= 9651 || 9654 <= D && D <= 9655 || 9660 <= D && D <= 9661 || 9664 <= D && D <= 9665 || 9670 <= D && D <= 9672 || D == 9675 || 9678 <= D && D <= 9681 || 9698 <= D && D <= 9701 || D == 9711 || 9733 <= D && D <= 9734 || D == 9737 || 9742 <= D && D <= 9743 || 9748 <= D && D <= 9749 || D == 9756 || D == 9758 || D == 9792 || D == 9794 || 9824 <= D && D <= 9825 || 9827 <= D && D <= 9829 || 9831 <= D && D <= 9834 || 9836 <= D && D <= 9837 || D == 9839 || 9886 <= D && D <= 9887 || 9918 <= D && D <= 9919 || 9924 <= D && D <= 9933 || 9935 <= D && D <= 9953 || D == 9955 || 9960 <= D && D <= 9983 || D == 10045 || D == 10071 || 10102 <= D && D <= 10111 || 11093 <= D && D <= 11097 || 12872 <= D && D <= 12879 || 57344 <= D && D <= 63743 || 65024 <= D && D <= 65039 || D == 65533 || 127232 <= D && D <= 127242 || 127248 <= D && D <= 127277 || 127280 <= D && D <= 127337 || 127344 <= D && D <= 127386 || 917760 <= D && D <= 917999 || 983040 <= D && D <= 1048573 || 1048576 <= D && D <= 1114109 ? "A" : "N";
  }, u.characterLength = function(F) {
    var s = this.eastAsianWidth(F);
    return s == "F" || s == "W" || s == "A" ? 2 : 1;
  };
  function t(F) {
    return F.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[^\uD800-\uDFFF]/g) || [];
  }
  u.length = function(F) {
    for (var s = t(F), i = 0, D = 0;D < s.length; D++)
      i = i + this.characterLength(s[D]);
    return i;
  }, u.slice = function(F, s, i) {
    textLen = u.length(F), s = s || 0, i = i || 1, s < 0 && (s = textLen + s), i < 0 && (i = textLen + i);
    for (var D = "", C = 0, n = t(F), E = 0;E < n.length; E++) {
      var a = n[E], o = u.length(a);
      if (C >= s - (o == 2 ? 1 : 0))
        if (C + o <= i)
          D += a;
        else
          break;
      C += o;
    }
    return D;
  };
})(W);
var tD = W.exports;
var eD = L(tD);
var FD = function() {
  return /\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67)\uDB40\uDC7F|(?:\uD83E\uDDD1\uD83C\uDFFF\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFE])|(?:\uD83E\uDDD1\uD83C\uDFFE\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFD\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFC\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFB\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFB\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFC-\uDFFF])|\uD83D\uDC68(?:\uD83C\uDFFB(?:\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF]))|\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFC-\uDFFF])|[\u2695\u2696\u2708]\uFE0F|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))?|(?:\uD83C[\uDFFC-\uDFFF])\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF]))|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFE])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])\uFE0F|\u200D(?:(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D[\uDC66\uDC67])|\uD83D[\uDC66\uDC67])|\uD83C\uDFFF|\uD83C\uDFFE|\uD83C\uDFFD|\uD83C\uDFFC)?|(?:\uD83D\uDC69(?:\uD83C\uDFFB\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|(?:\uD83C[\uDFFC-\uDFFF])\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69]))|\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1)(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC69(?:\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83E\uDDD1(?:\u200D(?:\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D[\uDC66\uDC67])|\uD83D\uDC69\u200D\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83E\uDDD1(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|\uD83D\uDC69(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|\uD83D\uDE36\u200D\uD83C\uDF2B|\uD83C\uDFF3\uFE0F\u200D\u26A7|\uD83D\uDC3B\u200D\u2744|(?:(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF])\u200D[\u2640\u2642]|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|\uD83C\uDFF4\u200D\u2620|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD])\u200D[\u2640\u2642]|[\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u2328\u23CF\u23ED-\u23EF\u23F1\u23F2\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB\u25FC\u2600-\u2604\u260E\u2611\u2618\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u2692\u2694-\u2697\u2699\u269B\u269C\u26A0\u26A7\u26B0\u26B1\u26C8\u26CF\u26D1\u26D3\u26E9\u26F0\u26F1\u26F4\u26F7\u26F8\u2702\u2708\u2709\u270F\u2712\u2714\u2716\u271D\u2721\u2733\u2734\u2744\u2747\u2763\u27A1\u2934\u2935\u2B05-\u2B07\u3030\u303D\u3297\u3299]|\uD83C[\uDD70\uDD71\uDD7E\uDD7F\uDE02\uDE37\uDF21\uDF24-\uDF2C\uDF36\uDF7D\uDF96\uDF97\uDF99-\uDF9B\uDF9E\uDF9F\uDFCD\uDFCE\uDFD4-\uDFDF\uDFF5\uDFF7]|\uD83D[\uDC3F\uDCFD\uDD49\uDD4A\uDD6F\uDD70\uDD73\uDD76-\uDD79\uDD87\uDD8A-\uDD8D\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA\uDECB\uDECD-\uDECF\uDEE0-\uDEE5\uDEE9\uDEF0\uDEF3])\uFE0F|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|\uD83D\uDC69\u200D\uD83D\uDC67|\uD83D\uDC69\u200D\uD83D\uDC66|\uD83D\uDE35\u200D\uD83D\uDCAB|\uD83D\uDE2E\u200D\uD83D\uDCA8|\uD83D\uDC15\u200D\uD83E\uDDBA|\uD83E\uDDD1(?:\uD83C\uDFFF|\uD83C\uDFFE|\uD83C\uDFFD|\uD83C\uDFFC|\uD83C\uDFFB)?|\uD83D\uDC69(?:\uD83C\uDFFF|\uD83C\uDFFE|\uD83C\uDFFD|\uD83C\uDFFC|\uD83C\uDFFB)?|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF6\uD83C\uDDE6|\uD83C\uDDF4\uD83C\uDDF2|\uD83D\uDC08\u200D\u2B1B|\u2764\uFE0F\u200D(?:\uD83D\uDD25|\uD83E\uDE79)|\uD83D\uDC41\uFE0F|\uD83C\uDFF3\uFE0F|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|[#\*0-9]\uFE0F\u20E3|\u2764\uFE0F|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])|\uD83C\uDFF4|(?:[\u270A\u270B]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDC8F\uDC91\uDCAA\uDD7A\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2\uDDD3\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270C\u270D]|\uD83D[\uDD74\uDD90])(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])|[\u270A\u270B]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC08\uDC15\uDC3B\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDC8F\uDC91\uDCAA\uDD7A\uDD95\uDD96\uDE2E\uDE35\uDE36\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2\uDDD3\uDDD5]|\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD]|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF]|[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF84\uDF86-\uDF93\uDFA0-\uDFC1\uDFC5\uDFC6\uDFC8\uDFC9\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC07\uDC09-\uDC14\uDC16-\uDC3A\uDC3C-\uDC3E\uDC40\uDC44\uDC45\uDC51-\uDC65\uDC6A\uDC79-\uDC7B\uDC7D-\uDC80\uDC84\uDC88-\uDC8E\uDC90\uDC92-\uDCA9\uDCAB-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDDA4\uDDFB-\uDE2D\uDE2F-\uDE34\uDE37-\uDE44\uDE48-\uDE4A\uDE80-\uDEA2\uDEA4-\uDEB3\uDEB7-\uDEBF\uDEC1-\uDEC5\uDED0-\uDED2\uDED5-\uDED7\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0D\uDD0E\uDD10-\uDD17\uDD1D\uDD20-\uDD25\uDD27-\uDD2F\uDD3A\uDD3F-\uDD45\uDD47-\uDD76\uDD78\uDD7A-\uDDB4\uDDB7\uDDBA\uDDBC-\uDDCB\uDDD0\uDDE0-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6]|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDED5-\uDED7\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0C-\uDD3A\uDD3C-\uDD45\uDD47-\uDD78\uDD7A-\uDDCB\uDDCD-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26A7\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDED5-\uDED7\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0C-\uDD3A\uDD3C-\uDD45\uDD47-\uDD78\uDD7A-\uDDCB\uDDCD-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6])\uFE0F|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDC8F\uDC91\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1F\uDD26\uDD30-\uDD39\uDD3C-\uDD3E\uDD77\uDDB5\uDDB6\uDDB8\uDDB9\uDDBB\uDDCD-\uDDCF\uDDD1-\uDDDD])/g;
};
var sD = L(FD);
function p(e, u = {}) {
  if (typeof e != "string" || e.length === 0 || (u = { ambiguousIsNarrow: true, ...u }, e = P(e), e.length === 0))
    return 0;
  e = e.replace(sD(), "  ");
  const t = u.ambiguousIsNarrow ? 1 : 2;
  let F = 0;
  for (const s of e) {
    const i = s.codePointAt(0);
    if (i <= 31 || i >= 127 && i <= 159 || i >= 768 && i <= 879)
      continue;
    switch (eD.eastAsianWidth(s)) {
      case "F":
      case "W":
        F += 2;
        break;
      case "A":
        F += t;
        break;
      default:
        F += 1;
    }
  }
  return F;
}
var w = 10;
var N = (e = 0) => (u) => `\x1B[${u + e}m`;
var I = (e = 0) => (u) => `\x1B[${38 + e};5;${u}m`;
var R = (e = 0) => (u, t, F) => `\x1B[${38 + e};2;${u};${t};${F}m`;
var r = { modifier: { reset: [0, 0], bold: [1, 22], dim: [2, 22], italic: [3, 23], underline: [4, 24], overline: [53, 55], inverse: [7, 27], hidden: [8, 28], strikethrough: [9, 29] }, color: { black: [30, 39], red: [31, 39], green: [32, 39], yellow: [33, 39], blue: [34, 39], magenta: [35, 39], cyan: [36, 39], white: [37, 39], blackBright: [90, 39], gray: [90, 39], grey: [90, 39], redBright: [91, 39], greenBright: [92, 39], yellowBright: [93, 39], blueBright: [94, 39], magentaBright: [95, 39], cyanBright: [96, 39], whiteBright: [97, 39] }, bgColor: { bgBlack: [40, 49], bgRed: [41, 49], bgGreen: [42, 49], bgYellow: [43, 49], bgBlue: [44, 49], bgMagenta: [45, 49], bgCyan: [46, 49], bgWhite: [47, 49], bgBlackBright: [100, 49], bgGray: [100, 49], bgGrey: [100, 49], bgRedBright: [101, 49], bgGreenBright: [102, 49], bgYellowBright: [103, 49], bgBlueBright: [104, 49], bgMagentaBright: [105, 49], bgCyanBright: [106, 49], bgWhiteBright: [107, 49] } };
Object.keys(r.modifier);
var iD = Object.keys(r.color);
var CD = Object.keys(r.bgColor);
[...iD, ...CD];
function rD() {
  const e = new Map;
  for (const [u, t] of Object.entries(r)) {
    for (const [F, s] of Object.entries(t))
      r[F] = { open: `\x1B[${s[0]}m`, close: `\x1B[${s[1]}m` }, t[F] = r[F], e.set(s[0], s[1]);
    Object.defineProperty(r, u, { value: t, enumerable: false });
  }
  return Object.defineProperty(r, "codes", { value: e, enumerable: false }), r.color.close = "\x1B[39m", r.bgColor.close = "\x1B[49m", r.color.ansi = N(), r.color.ansi256 = I(), r.color.ansi16m = R(), r.bgColor.ansi = N(w), r.bgColor.ansi256 = I(w), r.bgColor.ansi16m = R(w), Object.defineProperties(r, { rgbToAnsi256: { value: (u, t, F) => u === t && t === F ? u < 8 ? 16 : u > 248 ? 231 : Math.round((u - 8) / 247 * 24) + 232 : 16 + 36 * Math.round(u / 255 * 5) + 6 * Math.round(t / 255 * 5) + Math.round(F / 255 * 5), enumerable: false }, hexToRgb: { value: (u) => {
    const t = /[a-f\d]{6}|[a-f\d]{3}/i.exec(u.toString(16));
    if (!t)
      return [0, 0, 0];
    let [F] = t;
    F.length === 3 && (F = [...F].map((i) => i + i).join(""));
    const s = Number.parseInt(F, 16);
    return [s >> 16 & 255, s >> 8 & 255, s & 255];
  }, enumerable: false }, hexToAnsi256: { value: (u) => r.rgbToAnsi256(...r.hexToRgb(u)), enumerable: false }, ansi256ToAnsi: { value: (u) => {
    if (u < 8)
      return 30 + u;
    if (u < 16)
      return 90 + (u - 8);
    let t, F, s;
    if (u >= 232)
      t = ((u - 232) * 10 + 8) / 255, F = t, s = t;
    else {
      u -= 16;
      const C = u % 36;
      t = Math.floor(u / 36) / 5, F = Math.floor(C / 6) / 5, s = C % 6 / 5;
    }
    const i = Math.max(t, F, s) * 2;
    if (i === 0)
      return 30;
    let D = 30 + (Math.round(s) << 2 | Math.round(F) << 1 | Math.round(t));
    return i === 2 && (D += 60), D;
  }, enumerable: false }, rgbToAnsi: { value: (u, t, F) => r.ansi256ToAnsi(r.rgbToAnsi256(u, t, F)), enumerable: false }, hexToAnsi: { value: (u) => r.ansi256ToAnsi(r.hexToAnsi256(u)), enumerable: false } }), r;
}
var ED = rD();
var d = new Set(["\x1B", ""]);
var oD = 39;
var y = "\x07";
var V = "[";
var nD = "]";
var G = "m";
var _ = `${nD}8;;`;
var z = (e) => `${d.values().next().value}${V}${e}${G}`;
var K = (e) => `${d.values().next().value}${_}${e}${y}`;
var aD = (e) => e.split(" ").map((u) => p(u));
var k = (e, u, t) => {
  const F = [...u];
  let s = false, i = false, D = p(P(e[e.length - 1]));
  for (const [C, n] of F.entries()) {
    const E = p(n);
    if (D + E <= t ? e[e.length - 1] += n : (e.push(n), D = 0), d.has(n) && (s = true, i = F.slice(C + 1).join("").startsWith(_)), s) {
      i ? n === y && (s = false, i = false) : n === G && (s = false);
      continue;
    }
    D += E, D === t && C < F.length - 1 && (e.push(""), D = 0);
  }
  !D && e[e.length - 1].length > 0 && e.length > 1 && (e[e.length - 2] += e.pop());
};
var hD = (e) => {
  const u = e.split(" ");
  let t = u.length;
  for (;t > 0 && !(p(u[t - 1]) > 0); )
    t--;
  return t === u.length ? e : u.slice(0, t).join(" ") + u.slice(t).join("");
};
var lD = (e, u, t = {}) => {
  if (t.trim !== false && e.trim() === "")
    return "";
  let F = "", s, i;
  const D = aD(e);
  let C = [""];
  for (const [E, a] of e.split(" ").entries()) {
    t.trim !== false && (C[C.length - 1] = C[C.length - 1].trimStart());
    let o = p(C[C.length - 1]);
    if (E !== 0 && (o >= u && (t.wordWrap === false || t.trim === false) && (C.push(""), o = 0), (o > 0 || t.trim === false) && (C[C.length - 1] += " ", o++)), t.hard && D[E] > u) {
      const c = u - o, f = 1 + Math.floor((D[E] - c - 1) / u);
      Math.floor((D[E] - 1) / u) < f && C.push(""), k(C, a, u);
      continue;
    }
    if (o + D[E] > u && o > 0 && D[E] > 0) {
      if (t.wordWrap === false && o < u) {
        k(C, a, u);
        continue;
      }
      C.push("");
    }
    if (o + D[E] > u && t.wordWrap === false) {
      k(C, a, u);
      continue;
    }
    C[C.length - 1] += a;
  }
  t.trim !== false && (C = C.map((E) => hD(E)));
  const n = [...C.join(`
`)];
  for (const [E, a] of n.entries()) {
    if (F += a, d.has(a)) {
      const { groups: c } = new RegExp(`(?:\\${V}(?<code>\\d+)m|\\${_}(?<uri>.*)${y})`).exec(n.slice(E).join("")) || { groups: {} };
      if (c.code !== undefined) {
        const f = Number.parseFloat(c.code);
        s = f === oD ? undefined : f;
      } else
        c.uri !== undefined && (i = c.uri.length === 0 ? undefined : c.uri);
    }
    const o = ED.codes.get(Number(s));
    n[E + 1] === `
` ? (i && (F += K("")), s && o && (F += z(o))) : a === `
` && (s && o && (F += z(s)), i && (F += K(i)));
  }
  return F;
};
function Y(e, u, t) {
  return String(e).normalize().replace(/\r\n/g, `
`).split(`
`).map((F) => lD(F, u, t)).join(`
`);
}
var xD = ["up", "down", "left", "right", "space", "enter", "cancel"];
var B = { actions: new Set(xD), aliases: new Map([["k", "up"], ["j", "down"], ["h", "left"], ["l", "right"], ["\x03", "cancel"], ["escape", "cancel"]]) };
function $(e, u) {
  if (typeof e == "string")
    return B.aliases.get(e) === u;
  for (const t of e)
    if (t !== undefined && $(t, u))
      return true;
  return false;
}
function BD(e, u) {
  if (e === u)
    return;
  const t = e.split(`
`), F = u.split(`
`), s = [];
  for (let i = 0;i < Math.max(t.length, F.length); i++)
    t[i] !== F[i] && s.push(i);
  return s;
}
var AD = globalThis.process.platform.startsWith("win");
var S = Symbol("clack:cancel");
function pD(e) {
  return e === S;
}
function m(e, u) {
  const t = e;
  t.isTTY && t.setRawMode(u);
}
function fD({ input: e = j, output: u = M, overwrite: t = true, hideCursor: F = true } = {}) {
  const s = g.createInterface({ input: e, output: u, prompt: "", tabSize: 1 });
  g.emitKeypressEvents(e, s), e.isTTY && e.setRawMode(true);
  const i = (D, { name: C, sequence: n }) => {
    const E = String(D);
    if ($([E, C, n], "cancel")) {
      F && u.write(import_sisteransi.cursor.show), process.exit(0);
      return;
    }
    if (!t)
      return;
    const a = C === "return" ? 0 : -1, o = C === "return" ? -1 : 0;
    g.moveCursor(u, a, o, () => {
      g.clearLine(u, 1, () => {
        e.once("keypress", i);
      });
    });
  };
  return F && u.write(import_sisteransi.cursor.hide), e.once("keypress", i), () => {
    e.off("keypress", i), F && u.write(import_sisteransi.cursor.show), e.isTTY && !AD && e.setRawMode(false), s.terminal = false, s.close();
  };
}
var gD = Object.defineProperty;
var vD = (e, u, t) => (u in e) ? gD(e, u, { enumerable: true, configurable: true, writable: true, value: t }) : e[u] = t;
var h = (e, u, t) => (vD(e, typeof u != "symbol" ? u + "" : u, t), t);

class x {
  constructor(u, t = true) {
    h(this, "input"), h(this, "output"), h(this, "_abortSignal"), h(this, "rl"), h(this, "opts"), h(this, "_render"), h(this, "_track", false), h(this, "_prevFrame", ""), h(this, "_subscribers", new Map), h(this, "_cursor", 0), h(this, "state", "initial"), h(this, "error", ""), h(this, "value");
    const { input: F = j, output: s = M, render: i, signal: D, ...C } = u;
    this.opts = C, this.onKeypress = this.onKeypress.bind(this), this.close = this.close.bind(this), this.render = this.render.bind(this), this._render = i.bind(this), this._track = t, this._abortSignal = D, this.input = F, this.output = s;
  }
  unsubscribe() {
    this._subscribers.clear();
  }
  setSubscriber(u, t) {
    const F = this._subscribers.get(u) ?? [];
    F.push(t), this._subscribers.set(u, F);
  }
  on(u, t) {
    this.setSubscriber(u, { cb: t });
  }
  once(u, t) {
    this.setSubscriber(u, { cb: t, once: true });
  }
  emit(u, ...t) {
    const F = this._subscribers.get(u) ?? [], s = [];
    for (const i of F)
      i.cb(...t), i.once && s.push(() => F.splice(F.indexOf(i), 1));
    for (const i of s)
      i();
  }
  prompt() {
    return new Promise((u, t) => {
      if (this._abortSignal) {
        if (this._abortSignal.aborted)
          return this.state = "cancel", this.close(), u(S);
        this._abortSignal.addEventListener("abort", () => {
          this.state = "cancel", this.close();
        }, { once: true });
      }
      const F = new X;
      F._write = (s, i, D) => {
        this._track && (this.value = this.rl?.line.replace(/\t/g, ""), this._cursor = this.rl?.cursor ?? 0, this.emit("value", this.value)), D();
      }, this.input.pipe(F), this.rl = O.createInterface({ input: this.input, output: F, tabSize: 2, prompt: "", escapeCodeTimeout: 50, terminal: true }), O.emitKeypressEvents(this.input, this.rl), this.rl.prompt(), this.opts.initialValue !== undefined && this._track && this.rl.write(this.opts.initialValue), this.input.on("keypress", this.onKeypress), m(this.input, true), this.output.on("resize", this.render), this.render(), this.once("submit", () => {
        this.output.write(import_sisteransi.cursor.show), this.output.off("resize", this.render), m(this.input, false), u(this.value);
      }), this.once("cancel", () => {
        this.output.write(import_sisteransi.cursor.show), this.output.off("resize", this.render), m(this.input, false), u(S);
      });
    });
  }
  onKeypress(u, t) {
    if (this.state === "error" && (this.state = "active"), t?.name && (!this._track && B.aliases.has(t.name) && this.emit("cursor", B.aliases.get(t.name)), B.actions.has(t.name) && this.emit("cursor", t.name)), u && (u.toLowerCase() === "y" || u.toLowerCase() === "n") && this.emit("confirm", u.toLowerCase() === "y"), u === "\t" && this.opts.placeholder && (this.value || (this.rl?.write(this.opts.placeholder), this.emit("value", this.opts.placeholder))), u && this.emit("key", u.toLowerCase()), t?.name === "return") {
      if (this.opts.validate) {
        const F = this.opts.validate(this.value);
        F && (this.error = F instanceof Error ? F.message : F, this.state = "error", this.rl?.write(this.value));
      }
      this.state !== "error" && (this.state = "submit");
    }
    $([u, t?.name, t?.sequence], "cancel") && (this.state = "cancel"), (this.state === "submit" || this.state === "cancel") && this.emit("finalize"), this.render(), (this.state === "submit" || this.state === "cancel") && this.close();
  }
  close() {
    this.input.unpipe(), this.input.removeListener("keypress", this.onKeypress), this.output.write(`
`), m(this.input, false), this.rl?.close(), this.rl = undefined, this.emit(`${this.state}`, this.value), this.unsubscribe();
  }
  restoreCursor() {
    const u = Y(this._prevFrame, process.stdout.columns, { hard: true }).split(`
`).length - 1;
    this.output.write(import_sisteransi.cursor.move(-999, u * -1));
  }
  render() {
    const u = Y(this._render(this) ?? "", process.stdout.columns, { hard: true });
    if (u !== this._prevFrame) {
      if (this.state === "initial")
        this.output.write(import_sisteransi.cursor.hide);
      else {
        const t = BD(this._prevFrame, u);
        if (this.restoreCursor(), t && t?.length === 1) {
          const F = t[0];
          this.output.write(import_sisteransi.cursor.move(0, F)), this.output.write(import_sisteransi.erase.lines(1));
          const s = u.split(`
`);
          this.output.write(s[F]), this._prevFrame = u, this.output.write(import_sisteransi.cursor.move(0, s.length - F - 1));
          return;
        }
        if (t && t?.length > 1) {
          const F = t[0];
          this.output.write(import_sisteransi.cursor.move(0, F)), this.output.write(import_sisteransi.erase.down());
          const s = u.split(`
`).slice(F);
          this.output.write(s.join(`
`)), this._prevFrame = u;
          return;
        }
        this.output.write(import_sisteransi.erase.down());
      }
      this.output.write(u), this.state === "initial" && (this.state = "active"), this._prevFrame = u;
    }
  }
}
var A;
A = new WeakMap;
var OD = Object.defineProperty;
var PD = (e, u, t) => (u in e) ? OD(e, u, { enumerable: true, configurable: true, writable: true, value: t }) : e[u] = t;
var J = (e, u, t) => (PD(e, typeof u != "symbol" ? u + "" : u, t), t);

class LD extends x {
  constructor(u) {
    super(u, false), J(this, "options"), J(this, "cursor", 0), this.options = u.options, this.cursor = this.options.findIndex(({ value: t }) => t === u.initialValue), this.cursor === -1 && (this.cursor = 0), this.changeValue(), this.on("cursor", (t) => {
      switch (t) {
        case "left":
        case "up":
          this.cursor = this.cursor === 0 ? this.options.length - 1 : this.cursor - 1;
          break;
        case "down":
        case "right":
          this.cursor = this.cursor === this.options.length - 1 ? 0 : this.cursor + 1;
          break;
      }
      this.changeValue();
    });
  }
  get _value() {
    return this.options[this.cursor];
  }
  changeValue() {
    this.value = this._value.value;
  }
}

// ../../node_modules/@clack/prompts/dist/index.mjs
var import_picocolors = __toESM(require_picocolors(), 1);
var import_sisteransi2 = __toESM(require_src(), 1);
import y2 from "node:process";
function ce() {
  return y2.platform !== "win32" ? y2.env.TERM !== "linux" : !!y2.env.CI || !!y2.env.WT_SESSION || !!y2.env.TERMINUS_SUBLIME || y2.env.ConEmuTask === "{cmd::Cmder}" || y2.env.TERM_PROGRAM === "Terminus-Sublime" || y2.env.TERM_PROGRAM === "vscode" || y2.env.TERM === "xterm-256color" || y2.env.TERM === "alacritty" || y2.env.TERMINAL_EMULATOR === "JetBrains-JediTerm";
}
var V2 = ce();
var u = (t, n) => V2 ? t : n;
var le = u("◆", "*");
var L2 = u("■", "x");
var W2 = u("▲", "x");
var C = u("◇", "o");
var ue = u("┌", "T");
var o = u("│", "|");
var d2 = u("└", "—");
var k2 = u("●", ">");
var P2 = u("○", " ");
var A2 = u("◻", "[•]");
var T = u("◼", "[+]");
var F = u("◻", "[ ]");
var $e = u("▪", "•");
var _2 = u("─", "-");
var me = u("╮", "+");
var de = u("├", "+");
var pe = u("╯", "+");
var q = u("●", "•");
var D = u("◆", "*");
var U = u("▲", "!");
var K2 = u("■", "x");
var b2 = (t) => {
  switch (t) {
    case "initial":
    case "active":
      return import_picocolors.default.cyan(le);
    case "cancel":
      return import_picocolors.default.red(L2);
    case "error":
      return import_picocolors.default.yellow(W2);
    case "submit":
      return import_picocolors.default.green(C);
  }
};
var G2 = (t) => {
  const { cursor: n, options: r2, style: i } = t, s = t.maxItems ?? Number.POSITIVE_INFINITY, c = Math.max(process.stdout.rows - 4, 0), a = Math.min(c, Math.max(s, 5));
  let l2 = 0;
  n >= l2 + a - 3 ? l2 = Math.max(Math.min(n - a + 3, r2.length - a), 0) : n < l2 + 2 && (l2 = Math.max(n - 2, 0));
  const $2 = a < r2.length && l2 > 0, g2 = a < r2.length && l2 + a < r2.length;
  return r2.slice(l2, l2 + a).map((p2, v, f) => {
    const j2 = v === 0 && $2, E = v === f.length - 1 && g2;
    return j2 || E ? import_picocolors.default.dim("...") : i(p2, v + l2 === n);
  });
};
var ve = (t) => {
  const n = (r2, i) => {
    const s = r2.label ?? String(r2.value);
    switch (i) {
      case "selected":
        return `${import_picocolors.default.dim(s)}`;
      case "active":
        return `${import_picocolors.default.green(k2)} ${s} ${r2.hint ? import_picocolors.default.dim(`(${r2.hint})`) : ""}`;
      case "cancelled":
        return `${import_picocolors.default.strikethrough(import_picocolors.default.dim(s))}`;
      default:
        return `${import_picocolors.default.dim(P2)} ${import_picocolors.default.dim(s)}`;
    }
  };
  return new LD({ options: t.options, initialValue: t.initialValue, render() {
    const r2 = `${import_picocolors.default.gray(o)}
${b2(this.state)}  ${t.message}
`;
    switch (this.state) {
      case "submit":
        return `${r2}${import_picocolors.default.gray(o)}  ${n(this.options[this.cursor], "selected")}`;
      case "cancel":
        return `${r2}${import_picocolors.default.gray(o)}  ${n(this.options[this.cursor], "cancelled")}
${import_picocolors.default.gray(o)}`;
      default:
        return `${r2}${import_picocolors.default.cyan(o)}  ${G2({ cursor: this.cursor, options: this.options, maxItems: t.maxItems, style: (i, s) => n(i, s ? "active" : "inactive") }).join(`
${import_picocolors.default.cyan(o)}  `)}
${import_picocolors.default.cyan(d2)}
`;
    }
  } }).prompt();
};
var Se = (t = "") => {
  process.stdout.write(`${import_picocolors.default.gray(o)}
${import_picocolors.default.gray(d2)}  ${t}

`);
};
var J2 = `${import_picocolors.default.gray(o)}  `;
var Y2 = ({ indicator: t = "dots" } = {}) => {
  const n = V2 ? ["◒", "◐", "◓", "◑"] : ["•", "o", "O", "0"], r2 = V2 ? 80 : 120, i = process.env.CI === "true";
  let s, c, a = false, l2 = "", $2, g2 = performance.now();
  const p2 = (m2) => {
    const h2 = m2 > 1 ? "Something went wrong" : "Canceled";
    a && N2(h2, m2);
  }, v = () => p2(2), f = () => p2(1), j2 = () => {
    process.on("uncaughtExceptionMonitor", v), process.on("unhandledRejection", v), process.on("SIGINT", f), process.on("SIGTERM", f), process.on("exit", p2);
  }, E = () => {
    process.removeListener("uncaughtExceptionMonitor", v), process.removeListener("unhandledRejection", v), process.removeListener("SIGINT", f), process.removeListener("SIGTERM", f), process.removeListener("exit", p2);
  }, B2 = () => {
    if ($2 === undefined)
      return;
    i && process.stdout.write(`
`);
    const m2 = $2.split(`
`);
    process.stdout.write(import_sisteransi2.cursor.move(-999, m2.length - 1)), process.stdout.write(import_sisteransi2.erase.down(m2.length));
  }, R2 = (m2) => m2.replace(/\.+$/, ""), O2 = (m2) => {
    const h2 = (performance.now() - m2) / 1000, w2 = Math.floor(h2 / 60), I2 = Math.floor(h2 % 60);
    return w2 > 0 ? `[${w2}m ${I2}s]` : `[${I2}s]`;
  }, H = (m2 = "") => {
    a = true, s = fD(), l2 = R2(m2), g2 = performance.now(), process.stdout.write(`${import_picocolors.default.gray(o)}
`);
    let h2 = 0, w2 = 0;
    j2(), c = setInterval(() => {
      if (i && l2 === $2)
        return;
      B2(), $2 = l2;
      const I2 = import_picocolors.default.magenta(n[h2]);
      if (i)
        process.stdout.write(`${I2}  ${l2}...`);
      else if (t === "timer")
        process.stdout.write(`${I2}  ${l2} ${O2(g2)}`);
      else {
        const z2 = ".".repeat(Math.floor(w2)).slice(0, 3);
        process.stdout.write(`${I2}  ${l2}${z2}`);
      }
      h2 = h2 + 1 < n.length ? h2 + 1 : 0, w2 = w2 < n.length ? w2 + 0.125 : 0;
    }, r2);
  }, N2 = (m2 = "", h2 = 0) => {
    a = false, clearInterval(c), B2();
    const w2 = h2 === 0 ? import_picocolors.default.green(C) : h2 === 1 ? import_picocolors.default.red(L2) : import_picocolors.default.red(W2);
    l2 = R2(m2 ?? l2), t === "timer" ? process.stdout.write(`${w2}  ${l2} ${O2(g2)}
`) : process.stdout.write(`${w2}  ${l2}
`), E(), s();
  };
  return { start: H, stop: N2, message: (m2 = "") => {
    l2 = R2(m2 ?? l2);
  } };
};

// src/backends/opencode/client.ts
import { createServer } from "node:net";
// ../../node_modules/@opencode-ai/sdk/dist/gen/core/serverSentEvents.gen.js
var createSseClient = ({ onSseError, onSseEvent, responseTransformer, responseValidator, sseDefaultRetryDelay, sseMaxRetryAttempts, sseMaxRetryDelay, sseSleepFn, url, ...options }) => {
  let lastEventId;
  const sleep = sseSleepFn ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
  const createStream = async function* () {
    let retryDelay = sseDefaultRetryDelay ?? 3000;
    let attempt = 0;
    const signal = options.signal ?? new AbortController().signal;
    while (true) {
      if (signal.aborted)
        break;
      attempt++;
      const headers = options.headers instanceof Headers ? options.headers : new Headers(options.headers);
      if (lastEventId !== undefined) {
        headers.set("Last-Event-ID", lastEventId);
      }
      try {
        const response = await fetch(url, { ...options, headers, signal });
        if (!response.ok)
          throw new Error(`SSE failed: ${response.status} ${response.statusText}`);
        if (!response.body)
          throw new Error("No body in SSE response");
        const reader = response.body.pipeThrough(new TextDecoderStream).getReader();
        let buffer = "";
        const abortHandler = () => {
          try {
            reader.cancel();
          } catch {}
        };
        signal.addEventListener("abort", abortHandler);
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done)
              break;
            buffer += value;
            const chunks = buffer.split(`

`);
            buffer = chunks.pop() ?? "";
            for (const chunk of chunks) {
              const lines = chunk.split(`
`);
              const dataLines = [];
              let eventName;
              for (const line of lines) {
                if (line.startsWith("data:")) {
                  dataLines.push(line.replace(/^data:\s*/, ""));
                } else if (line.startsWith("event:")) {
                  eventName = line.replace(/^event:\s*/, "");
                } else if (line.startsWith("id:")) {
                  lastEventId = line.replace(/^id:\s*/, "");
                } else if (line.startsWith("retry:")) {
                  const parsed = Number.parseInt(line.replace(/^retry:\s*/, ""), 10);
                  if (!Number.isNaN(parsed)) {
                    retryDelay = parsed;
                  }
                }
              }
              let data;
              let parsedJson = false;
              if (dataLines.length) {
                const rawData = dataLines.join(`
`);
                try {
                  data = JSON.parse(rawData);
                  parsedJson = true;
                } catch {
                  data = rawData;
                }
              }
              if (parsedJson) {
                if (responseValidator) {
                  await responseValidator(data);
                }
                if (responseTransformer) {
                  data = await responseTransformer(data);
                }
              }
              onSseEvent?.({
                data,
                event: eventName,
                id: lastEventId,
                retry: retryDelay
              });
              if (dataLines.length) {
                yield data;
              }
            }
          }
        } finally {
          signal.removeEventListener("abort", abortHandler);
          reader.releaseLock();
        }
        break;
      } catch (error) {
        onSseError?.(error);
        if (sseMaxRetryAttempts !== undefined && attempt >= sseMaxRetryAttempts) {
          break;
        }
        const backoff = Math.min(retryDelay * 2 ** (attempt - 1), sseMaxRetryDelay ?? 30000);
        await sleep(backoff);
      }
    }
  };
  const stream = createStream();
  return { stream };
};

// ../../node_modules/@opencode-ai/sdk/dist/gen/core/auth.gen.js
var getAuthToken = async (auth, callback) => {
  const token = typeof callback === "function" ? await callback(auth) : callback;
  if (!token) {
    return;
  }
  if (auth.scheme === "bearer") {
    return `Bearer ${token}`;
  }
  if (auth.scheme === "basic") {
    return `Basic ${btoa(token)}`;
  }
  return token;
};

// ../../node_modules/@opencode-ai/sdk/dist/gen/core/bodySerializer.gen.js
var jsonBodySerializer = {
  bodySerializer: (body) => JSON.stringify(body, (_key, value) => typeof value === "bigint" ? value.toString() : value)
};

// ../../node_modules/@opencode-ai/sdk/dist/gen/core/pathSerializer.gen.js
var separatorArrayExplode = (style) => {
  switch (style) {
    case "label":
      return ".";
    case "matrix":
      return ";";
    case "simple":
      return ",";
    default:
      return "&";
  }
};
var separatorArrayNoExplode = (style) => {
  switch (style) {
    case "form":
      return ",";
    case "pipeDelimited":
      return "|";
    case "spaceDelimited":
      return "%20";
    default:
      return ",";
  }
};
var separatorObjectExplode = (style) => {
  switch (style) {
    case "label":
      return ".";
    case "matrix":
      return ";";
    case "simple":
      return ",";
    default:
      return "&";
  }
};
var serializeArrayParam = ({ allowReserved, explode, name, style, value }) => {
  if (!explode) {
    const joinedValues2 = (allowReserved ? value : value.map((v) => encodeURIComponent(v))).join(separatorArrayNoExplode(style));
    switch (style) {
      case "label":
        return `.${joinedValues2}`;
      case "matrix":
        return `;${name}=${joinedValues2}`;
      case "simple":
        return joinedValues2;
      default:
        return `${name}=${joinedValues2}`;
    }
  }
  const separator = separatorArrayExplode(style);
  const joinedValues = value.map((v) => {
    if (style === "label" || style === "simple") {
      return allowReserved ? v : encodeURIComponent(v);
    }
    return serializePrimitiveParam({
      allowReserved,
      name,
      value: v
    });
  }).join(separator);
  return style === "label" || style === "matrix" ? separator + joinedValues : joinedValues;
};
var serializePrimitiveParam = ({ allowReserved, name, value }) => {
  if (value === undefined || value === null) {
    return "";
  }
  if (typeof value === "object") {
    throw new Error("Deeply-nested arrays/objects aren’t supported. Provide your own `querySerializer()` to handle these.");
  }
  return `${name}=${allowReserved ? value : encodeURIComponent(value)}`;
};
var serializeObjectParam = ({ allowReserved, explode, name, style, value, valueOnly }) => {
  if (value instanceof Date) {
    return valueOnly ? value.toISOString() : `${name}=${value.toISOString()}`;
  }
  if (style !== "deepObject" && !explode) {
    let values = [];
    Object.entries(value).forEach(([key, v]) => {
      values = [...values, key, allowReserved ? v : encodeURIComponent(v)];
    });
    const joinedValues2 = values.join(",");
    switch (style) {
      case "form":
        return `${name}=${joinedValues2}`;
      case "label":
        return `.${joinedValues2}`;
      case "matrix":
        return `;${name}=${joinedValues2}`;
      default:
        return joinedValues2;
    }
  }
  const separator = separatorObjectExplode(style);
  const joinedValues = Object.entries(value).map(([key, v]) => serializePrimitiveParam({
    allowReserved,
    name: style === "deepObject" ? `${name}[${key}]` : key,
    value: v
  })).join(separator);
  return style === "label" || style === "matrix" ? separator + joinedValues : joinedValues;
};

// ../../node_modules/@opencode-ai/sdk/dist/gen/core/utils.gen.js
var PATH_PARAM_RE = /\{[^{}]+\}/g;
var defaultPathSerializer = ({ path, url: _url }) => {
  let url = _url;
  const matches = _url.match(PATH_PARAM_RE);
  if (matches) {
    for (const match of matches) {
      let explode = false;
      let name = match.substring(1, match.length - 1);
      let style = "simple";
      if (name.endsWith("*")) {
        explode = true;
        name = name.substring(0, name.length - 1);
      }
      if (name.startsWith(".")) {
        name = name.substring(1);
        style = "label";
      } else if (name.startsWith(";")) {
        name = name.substring(1);
        style = "matrix";
      }
      const value = path[name];
      if (value === undefined || value === null) {
        continue;
      }
      if (Array.isArray(value)) {
        url = url.replace(match, serializeArrayParam({ explode, name, style, value }));
        continue;
      }
      if (typeof value === "object") {
        url = url.replace(match, serializeObjectParam({
          explode,
          name,
          style,
          value,
          valueOnly: true
        }));
        continue;
      }
      if (style === "matrix") {
        url = url.replace(match, `;${serializePrimitiveParam({
          name,
          value
        })}`);
        continue;
      }
      const replaceValue = encodeURIComponent(style === "label" ? `.${value}` : value);
      url = url.replace(match, replaceValue);
    }
  }
  return url;
};
var getUrl = ({ baseUrl, path, query, querySerializer, url: _url }) => {
  const pathUrl = _url.startsWith("/") ? _url : `/${_url}`;
  let url = (baseUrl ?? "") + pathUrl;
  if (path) {
    url = defaultPathSerializer({ path, url });
  }
  let search = query ? querySerializer(query) : "";
  if (search.startsWith("?")) {
    search = search.substring(1);
  }
  if (search) {
    url += `?${search}`;
  }
  return url;
};

// ../../node_modules/@opencode-ai/sdk/dist/gen/client/utils.gen.js
var createQuerySerializer = ({ allowReserved, array, object } = {}) => {
  const querySerializer = (queryParams) => {
    const search = [];
    if (queryParams && typeof queryParams === "object") {
      for (const name in queryParams) {
        const value = queryParams[name];
        if (value === undefined || value === null) {
          continue;
        }
        if (Array.isArray(value)) {
          const serializedArray = serializeArrayParam({
            allowReserved,
            explode: true,
            name,
            style: "form",
            value,
            ...array
          });
          if (serializedArray)
            search.push(serializedArray);
        } else if (typeof value === "object") {
          const serializedObject = serializeObjectParam({
            allowReserved,
            explode: true,
            name,
            style: "deepObject",
            value,
            ...object
          });
          if (serializedObject)
            search.push(serializedObject);
        } else {
          const serializedPrimitive = serializePrimitiveParam({
            allowReserved,
            name,
            value
          });
          if (serializedPrimitive)
            search.push(serializedPrimitive);
        }
      }
    }
    return search.join("&");
  };
  return querySerializer;
};
var getParseAs = (contentType) => {
  if (!contentType) {
    return "stream";
  }
  const cleanContent = contentType.split(";")[0]?.trim();
  if (!cleanContent) {
    return;
  }
  if (cleanContent.startsWith("application/json") || cleanContent.endsWith("+json")) {
    return "json";
  }
  if (cleanContent === "multipart/form-data") {
    return "formData";
  }
  if (["application/", "audio/", "image/", "video/"].some((type) => cleanContent.startsWith(type))) {
    return "blob";
  }
  if (cleanContent.startsWith("text/")) {
    return "text";
  }
  return;
};
var checkForExistence = (options, name) => {
  if (!name) {
    return false;
  }
  if (options.headers.has(name) || options.query?.[name] || options.headers.get("Cookie")?.includes(`${name}=`)) {
    return true;
  }
  return false;
};
var setAuthParams = async ({ security, ...options }) => {
  for (const auth of security) {
    if (checkForExistence(options, auth.name)) {
      continue;
    }
    const token = await getAuthToken(auth, options.auth);
    if (!token) {
      continue;
    }
    const name = auth.name ?? "Authorization";
    switch (auth.in) {
      case "query":
        if (!options.query) {
          options.query = {};
        }
        options.query[name] = token;
        break;
      case "cookie":
        options.headers.append("Cookie", `${name}=${token}`);
        break;
      case "header":
      default:
        options.headers.set(name, token);
        break;
    }
  }
};
var buildUrl = (options) => getUrl({
  baseUrl: options.baseUrl,
  path: options.path,
  query: options.query,
  querySerializer: typeof options.querySerializer === "function" ? options.querySerializer : createQuerySerializer(options.querySerializer),
  url: options.url
});
var mergeConfigs = (a, b3) => {
  const config = { ...a, ...b3 };
  if (config.baseUrl?.endsWith("/")) {
    config.baseUrl = config.baseUrl.substring(0, config.baseUrl.length - 1);
  }
  config.headers = mergeHeaders(a.headers, b3.headers);
  return config;
};
var mergeHeaders = (...headers) => {
  const mergedHeaders = new Headers;
  for (const header of headers) {
    if (!header || typeof header !== "object") {
      continue;
    }
    const iterator = header instanceof Headers ? header.entries() : Object.entries(header);
    for (const [key, value] of iterator) {
      if (value === null) {
        mergedHeaders.delete(key);
      } else if (Array.isArray(value)) {
        for (const v of value) {
          mergedHeaders.append(key, v);
        }
      } else if (value !== undefined) {
        mergedHeaders.set(key, typeof value === "object" ? JSON.stringify(value) : value);
      }
    }
  }
  return mergedHeaders;
};

class Interceptors {
  _fns;
  constructor() {
    this._fns = [];
  }
  clear() {
    this._fns = [];
  }
  getInterceptorIndex(id) {
    if (typeof id === "number") {
      return this._fns[id] ? id : -1;
    } else {
      return this._fns.indexOf(id);
    }
  }
  exists(id) {
    const index = this.getInterceptorIndex(id);
    return !!this._fns[index];
  }
  eject(id) {
    const index = this.getInterceptorIndex(id);
    if (this._fns[index]) {
      this._fns[index] = null;
    }
  }
  update(id, fn) {
    const index = this.getInterceptorIndex(id);
    if (this._fns[index]) {
      this._fns[index] = fn;
      return id;
    } else {
      return false;
    }
  }
  use(fn) {
    this._fns = [...this._fns, fn];
    return this._fns.length - 1;
  }
}
var createInterceptors = () => ({
  error: new Interceptors,
  request: new Interceptors,
  response: new Interceptors
});
var defaultQuerySerializer = createQuerySerializer({
  allowReserved: false,
  array: {
    explode: true,
    style: "form"
  },
  object: {
    explode: true,
    style: "deepObject"
  }
});
var defaultHeaders = {
  "Content-Type": "application/json"
};
var createConfig = (override = {}) => ({
  ...jsonBodySerializer,
  headers: defaultHeaders,
  parseAs: "auto",
  querySerializer: defaultQuerySerializer,
  ...override
});

// ../../node_modules/@opencode-ai/sdk/dist/gen/client/client.gen.js
var createClient = (config = {}) => {
  let _config = mergeConfigs(createConfig(), config);
  const getConfig = () => ({ ..._config });
  const setConfig = (config2) => {
    _config = mergeConfigs(_config, config2);
    return getConfig();
  };
  const interceptors = createInterceptors();
  const beforeRequest = async (options) => {
    const opts = {
      ..._config,
      ...options,
      fetch: options.fetch ?? _config.fetch ?? globalThis.fetch,
      headers: mergeHeaders(_config.headers, options.headers),
      serializedBody: undefined
    };
    if (opts.security) {
      await setAuthParams({
        ...opts,
        security: opts.security
      });
    }
    if (opts.requestValidator) {
      await opts.requestValidator(opts);
    }
    if (opts.body && opts.bodySerializer) {
      opts.serializedBody = opts.bodySerializer(opts.body);
    }
    if (opts.serializedBody === undefined || opts.serializedBody === "") {
      opts.headers.delete("Content-Type");
    }
    const url = buildUrl(opts);
    return { opts, url };
  };
  const request = async (options) => {
    const { opts, url } = await beforeRequest(options);
    const requestInit = {
      redirect: "follow",
      ...opts,
      body: opts.serializedBody
    };
    let request2 = new Request(url, requestInit);
    for (const fn of interceptors.request._fns) {
      if (fn) {
        request2 = await fn(request2, opts);
      }
    }
    const _fetch = opts.fetch;
    let response = await _fetch(request2);
    for (const fn of interceptors.response._fns) {
      if (fn) {
        response = await fn(response, request2, opts);
      }
    }
    const result = {
      request: request2,
      response
    };
    if (response.ok) {
      if (response.status === 204 || response.headers.get("Content-Length") === "0") {
        return opts.responseStyle === "data" ? {} : {
          data: {},
          ...result
        };
      }
      const parseAs = (opts.parseAs === "auto" ? getParseAs(response.headers.get("Content-Type")) : opts.parseAs) ?? "json";
      let data;
      switch (parseAs) {
        case "arrayBuffer":
        case "blob":
        case "formData":
        case "json":
        case "text":
          data = await response[parseAs]();
          break;
        case "stream":
          return opts.responseStyle === "data" ? response.body : {
            data: response.body,
            ...result
          };
      }
      if (parseAs === "json") {
        if (opts.responseValidator) {
          await opts.responseValidator(data);
        }
        if (opts.responseTransformer) {
          data = await opts.responseTransformer(data);
        }
      }
      return opts.responseStyle === "data" ? data : {
        data,
        ...result
      };
    }
    const textError = await response.text();
    let jsonError;
    try {
      jsonError = JSON.parse(textError);
    } catch {}
    const error = jsonError ?? textError;
    let finalError = error;
    for (const fn of interceptors.error._fns) {
      if (fn) {
        finalError = await fn(error, response, request2, opts);
      }
    }
    finalError = finalError || {};
    if (opts.throwOnError) {
      throw finalError;
    }
    return opts.responseStyle === "data" ? undefined : {
      error: finalError,
      ...result
    };
  };
  const makeMethod = (method) => {
    const fn = (options) => request({ ...options, method });
    fn.sse = async (options) => {
      const { opts, url } = await beforeRequest(options);
      return createSseClient({
        ...opts,
        body: opts.body,
        headers: opts.headers,
        method,
        url
      });
    };
    return fn;
  };
  return {
    buildUrl,
    connect: makeMethod("CONNECT"),
    delete: makeMethod("DELETE"),
    get: makeMethod("GET"),
    getConfig,
    head: makeMethod("HEAD"),
    interceptors,
    options: makeMethod("OPTIONS"),
    patch: makeMethod("PATCH"),
    post: makeMethod("POST"),
    put: makeMethod("PUT"),
    request,
    setConfig,
    trace: makeMethod("TRACE")
  };
};
// ../../node_modules/@opencode-ai/sdk/dist/gen/core/params.gen.js
var extraPrefixesMap = {
  $body_: "body",
  $headers_: "headers",
  $path_: "path",
  $query_: "query"
};
var extraPrefixes = Object.entries(extraPrefixesMap);
// ../../node_modules/@opencode-ai/sdk/dist/gen/client.gen.js
var client = createClient(createConfig({
  baseUrl: "http://localhost:4096"
}));

// ../../node_modules/@opencode-ai/sdk/dist/gen/sdk.gen.js
class _HeyApiClient {
  _client = client;
  constructor(args) {
    if (args?.client) {
      this._client = args.client;
    }
  }
}

class Global extends _HeyApiClient {
  event(options) {
    return (options?.client ?? this._client).get.sse({
      url: "/global/event",
      ...options
    });
  }
}

class Project extends _HeyApiClient {
  list(options) {
    return (options?.client ?? this._client).get({
      url: "/project",
      ...options
    });
  }
  current(options) {
    return (options?.client ?? this._client).get({
      url: "/project/current",
      ...options
    });
  }
}

class Pty extends _HeyApiClient {
  list(options) {
    return (options?.client ?? this._client).get({
      url: "/pty",
      ...options
    });
  }
  create(options) {
    return (options?.client ?? this._client).post({
      url: "/pty",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers
      }
    });
  }
  remove(options) {
    return (options.client ?? this._client).delete({
      url: "/pty/{id}",
      ...options
    });
  }
  get(options) {
    return (options.client ?? this._client).get({
      url: "/pty/{id}",
      ...options
    });
  }
  update(options) {
    return (options.client ?? this._client).put({
      url: "/pty/{id}",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers
      }
    });
  }
  connect(options) {
    return (options.client ?? this._client).get({
      url: "/pty/{id}/connect",
      ...options
    });
  }
}

class Config extends _HeyApiClient {
  get(options) {
    return (options?.client ?? this._client).get({
      url: "/config",
      ...options
    });
  }
  update(options) {
    return (options?.client ?? this._client).patch({
      url: "/config",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers
      }
    });
  }
  providers(options) {
    return (options?.client ?? this._client).get({
      url: "/config/providers",
      ...options
    });
  }
}

class Tool extends _HeyApiClient {
  ids(options) {
    return (options?.client ?? this._client).get({
      url: "/experimental/tool/ids",
      ...options
    });
  }
  list(options) {
    return (options.client ?? this._client).get({
      url: "/experimental/tool",
      ...options
    });
  }
}

class Instance extends _HeyApiClient {
  dispose(options) {
    return (options?.client ?? this._client).post({
      url: "/instance/dispose",
      ...options
    });
  }
}

class Path extends _HeyApiClient {
  get(options) {
    return (options?.client ?? this._client).get({
      url: "/path",
      ...options
    });
  }
}

class Vcs extends _HeyApiClient {
  get(options) {
    return (options?.client ?? this._client).get({
      url: "/vcs",
      ...options
    });
  }
}

class Session extends _HeyApiClient {
  list(options) {
    return (options?.client ?? this._client).get({
      url: "/session",
      ...options
    });
  }
  create(options) {
    return (options?.client ?? this._client).post({
      url: "/session",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers
      }
    });
  }
  status(options) {
    return (options?.client ?? this._client).get({
      url: "/session/status",
      ...options
    });
  }
  delete(options) {
    return (options.client ?? this._client).delete({
      url: "/session/{id}",
      ...options
    });
  }
  get(options) {
    return (options.client ?? this._client).get({
      url: "/session/{id}",
      ...options
    });
  }
  update(options) {
    return (options.client ?? this._client).patch({
      url: "/session/{id}",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers
      }
    });
  }
  children(options) {
    return (options.client ?? this._client).get({
      url: "/session/{id}/children",
      ...options
    });
  }
  todo(options) {
    return (options.client ?? this._client).get({
      url: "/session/{id}/todo",
      ...options
    });
  }
  init(options) {
    return (options.client ?? this._client).post({
      url: "/session/{id}/init",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers
      }
    });
  }
  fork(options) {
    return (options.client ?? this._client).post({
      url: "/session/{id}/fork",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers
      }
    });
  }
  abort(options) {
    return (options.client ?? this._client).post({
      url: "/session/{id}/abort",
      ...options
    });
  }
  unshare(options) {
    return (options.client ?? this._client).delete({
      url: "/session/{id}/share",
      ...options
    });
  }
  share(options) {
    return (options.client ?? this._client).post({
      url: "/session/{id}/share",
      ...options
    });
  }
  diff(options) {
    return (options.client ?? this._client).get({
      url: "/session/{id}/diff",
      ...options
    });
  }
  summarize(options) {
    return (options.client ?? this._client).post({
      url: "/session/{id}/summarize",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers
      }
    });
  }
  messages(options) {
    return (options.client ?? this._client).get({
      url: "/session/{id}/message",
      ...options
    });
  }
  prompt(options) {
    return (options.client ?? this._client).post({
      url: "/session/{id}/message",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers
      }
    });
  }
  message(options) {
    return (options.client ?? this._client).get({
      url: "/session/{id}/message/{messageID}",
      ...options
    });
  }
  promptAsync(options) {
    return (options.client ?? this._client).post({
      url: "/session/{id}/prompt_async",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers
      }
    });
  }
  command(options) {
    return (options.client ?? this._client).post({
      url: "/session/{id}/command",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers
      }
    });
  }
  shell(options) {
    return (options.client ?? this._client).post({
      url: "/session/{id}/shell",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers
      }
    });
  }
  revert(options) {
    return (options.client ?? this._client).post({
      url: "/session/{id}/revert",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers
      }
    });
  }
  unrevert(options) {
    return (options.client ?? this._client).post({
      url: "/session/{id}/unrevert",
      ...options
    });
  }
}

class Command extends _HeyApiClient {
  list(options) {
    return (options?.client ?? this._client).get({
      url: "/command",
      ...options
    });
  }
}

class Oauth extends _HeyApiClient {
  authorize(options) {
    return (options.client ?? this._client).post({
      url: "/provider/{id}/oauth/authorize",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers
      }
    });
  }
  callback(options) {
    return (options.client ?? this._client).post({
      url: "/provider/{id}/oauth/callback",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers
      }
    });
  }
}

class Provider extends _HeyApiClient {
  list(options) {
    return (options?.client ?? this._client).get({
      url: "/provider",
      ...options
    });
  }
  auth(options) {
    return (options?.client ?? this._client).get({
      url: "/provider/auth",
      ...options
    });
  }
  oauth = new Oauth({ client: this._client });
}

class Find extends _HeyApiClient {
  text(options) {
    return (options.client ?? this._client).get({
      url: "/find",
      ...options
    });
  }
  files(options) {
    return (options.client ?? this._client).get({
      url: "/find/file",
      ...options
    });
  }
  symbols(options) {
    return (options.client ?? this._client).get({
      url: "/find/symbol",
      ...options
    });
  }
}

class File extends _HeyApiClient {
  list(options) {
    return (options.client ?? this._client).get({
      url: "/file",
      ...options
    });
  }
  read(options) {
    return (options.client ?? this._client).get({
      url: "/file/content",
      ...options
    });
  }
  status(options) {
    return (options?.client ?? this._client).get({
      url: "/file/status",
      ...options
    });
  }
}

class App extends _HeyApiClient {
  log(options) {
    return (options?.client ?? this._client).post({
      url: "/log",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers
      }
    });
  }
  agents(options) {
    return (options?.client ?? this._client).get({
      url: "/agent",
      ...options
    });
  }
}

class Auth extends _HeyApiClient {
  remove(options) {
    return (options.client ?? this._client).delete({
      url: "/mcp/{name}/auth",
      ...options
    });
  }
  start(options) {
    return (options.client ?? this._client).post({
      url: "/mcp/{name}/auth",
      ...options
    });
  }
  callback(options) {
    return (options.client ?? this._client).post({
      url: "/mcp/{name}/auth/callback",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers
      }
    });
  }
  authenticate(options) {
    return (options.client ?? this._client).post({
      url: "/mcp/{name}/auth/authenticate",
      ...options
    });
  }
  set(options) {
    return (options.client ?? this._client).put({
      url: "/auth/{id}",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers
      }
    });
  }
}

class Mcp extends _HeyApiClient {
  status(options) {
    return (options?.client ?? this._client).get({
      url: "/mcp",
      ...options
    });
  }
  add(options) {
    return (options?.client ?? this._client).post({
      url: "/mcp",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers
      }
    });
  }
  connect(options) {
    return (options.client ?? this._client).post({
      url: "/mcp/{name}/connect",
      ...options
    });
  }
  disconnect(options) {
    return (options.client ?? this._client).post({
      url: "/mcp/{name}/disconnect",
      ...options
    });
  }
  auth = new Auth({ client: this._client });
}

class Lsp extends _HeyApiClient {
  status(options) {
    return (options?.client ?? this._client).get({
      url: "/lsp",
      ...options
    });
  }
}

class Formatter extends _HeyApiClient {
  status(options) {
    return (options?.client ?? this._client).get({
      url: "/formatter",
      ...options
    });
  }
}

class Control extends _HeyApiClient {
  next(options) {
    return (options?.client ?? this._client).get({
      url: "/tui/control/next",
      ...options
    });
  }
  response(options) {
    return (options?.client ?? this._client).post({
      url: "/tui/control/response",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers
      }
    });
  }
}

class Tui extends _HeyApiClient {
  appendPrompt(options) {
    return (options?.client ?? this._client).post({
      url: "/tui/append-prompt",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers
      }
    });
  }
  openHelp(options) {
    return (options?.client ?? this._client).post({
      url: "/tui/open-help",
      ...options
    });
  }
  openSessions(options) {
    return (options?.client ?? this._client).post({
      url: "/tui/open-sessions",
      ...options
    });
  }
  openThemes(options) {
    return (options?.client ?? this._client).post({
      url: "/tui/open-themes",
      ...options
    });
  }
  openModels(options) {
    return (options?.client ?? this._client).post({
      url: "/tui/open-models",
      ...options
    });
  }
  submitPrompt(options) {
    return (options?.client ?? this._client).post({
      url: "/tui/submit-prompt",
      ...options
    });
  }
  clearPrompt(options) {
    return (options?.client ?? this._client).post({
      url: "/tui/clear-prompt",
      ...options
    });
  }
  executeCommand(options) {
    return (options?.client ?? this._client).post({
      url: "/tui/execute-command",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers
      }
    });
  }
  showToast(options) {
    return (options?.client ?? this._client).post({
      url: "/tui/show-toast",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers
      }
    });
  }
  publish(options) {
    return (options?.client ?? this._client).post({
      url: "/tui/publish",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers
      }
    });
  }
  control = new Control({ client: this._client });
}

class Event extends _HeyApiClient {
  subscribe(options) {
    return (options?.client ?? this._client).get.sse({
      url: "/event",
      ...options
    });
  }
}

class OpencodeClient extends _HeyApiClient {
  postSessionIdPermissionsPermissionId(options) {
    return (options.client ?? this._client).post({
      url: "/session/{id}/permissions/{permissionID}",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers
      }
    });
  }
  global = new Global({ client: this._client });
  project = new Project({ client: this._client });
  pty = new Pty({ client: this._client });
  config = new Config({ client: this._client });
  tool = new Tool({ client: this._client });
  instance = new Instance({ client: this._client });
  path = new Path({ client: this._client });
  vcs = new Vcs({ client: this._client });
  session = new Session({ client: this._client });
  command = new Command({ client: this._client });
  provider = new Provider({ client: this._client });
  find = new Find({ client: this._client });
  file = new File({ client: this._client });
  app = new App({ client: this._client });
  mcp = new Mcp({ client: this._client });
  lsp = new Lsp({ client: this._client });
  formatter = new Formatter({ client: this._client });
  tui = new Tui({ client: this._client });
  auth = new Auth({ client: this._client });
  event = new Event({ client: this._client });
}

// ../../node_modules/@opencode-ai/sdk/dist/client.js
function createOpencodeClient(config) {
  if (!config?.fetch) {
    const customFetch = (req) => {
      req.timeout = false;
      return fetch(req);
    };
    config = {
      ...config,
      fetch: customFetch
    };
  }
  if (config?.directory) {
    config.headers = {
      ...config.headers,
      "x-opencode-directory": config.directory
    };
  }
  const client2 = createClient(config);
  return new OpencodeClient({ client: client2 });
}
// ../../node_modules/@opencode-ai/sdk/dist/server.js
import { spawn } from "node:child_process";
async function createOpencodeServer(options) {
  options = Object.assign({
    hostname: "127.0.0.1",
    port: 4096,
    timeout: 5000
  }, options ?? {});
  const args = [`serve`, `--hostname=${options.hostname}`, `--port=${options.port}`];
  if (options.config?.logLevel)
    args.push(`--log-level=${options.config.logLevel}`);
  const proc = spawn(`opencode`, args, {
    signal: options.signal,
    env: {
      ...process.env,
      OPENCODE_CONFIG_CONTENT: JSON.stringify(options.config ?? {})
    }
  });
  const url = await new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      reject(new Error(`Timeout waiting for server to start after ${options.timeout}ms`));
    }, options.timeout);
    let output = "";
    proc.stdout?.on("data", (chunk) => {
      output += chunk.toString();
      const lines = output.split(`
`);
      for (const line of lines) {
        if (line.startsWith("opencode server listening")) {
          const match = line.match(/on\s+(https?:\/\/[^\s]+)/);
          if (!match) {
            throw new Error(`Failed to parse server url from output: ${line}`);
          }
          clearTimeout(id);
          resolve(match[1]);
          return;
        }
      }
    });
    proc.stderr?.on("data", (chunk) => {
      output += chunk.toString();
    });
    proc.on("exit", (code) => {
      clearTimeout(id);
      let msg = `Server exited with code ${code}`;
      if (output.trim()) {
        msg += `
Server output: ${output}`;
      }
      reject(new Error(msg));
    });
    proc.on("error", (error) => {
      clearTimeout(id);
      reject(error);
    });
    if (options.signal) {
      options.signal.addEventListener("abort", () => {
        clearTimeout(id);
        reject(new Error("Aborted"));
      });
    }
  });
  return {
    url,
    close() {
      proc.kill();
    }
  };
}
// ../../node_modules/@opencode-ai/sdk/dist/index.js
async function createOpencode(options) {
  const server2 = await createOpencodeServer({
    ...options
  });
  const client3 = createOpencodeClient({
    baseUrl: server2.url
  });
  return {
    client: client3,
    server: server2
  };
}

// src/util/log.ts
import fs from "node:fs/promises";
import path from "node:path";
var Log;
((Log) => {
  const levelPriority = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
  };
  let currentLevel = "INFO";
  let logPath = "";
  let write = (msg) => process.stderr.write(msg);
  function shouldLog(level) {
    return levelPriority[level] >= levelPriority[currentLevel];
  }
  function file() {
    return logPath;
  }
  Log.file = file;
  async function init(options) {
    if (options.level)
      currentLevel = options.level;
    const stderrWriter = (msg) => {
      process.stderr.write(msg);
    };
    if (options.logDir) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -1);
      logPath = path.join(options.logDir, `ralph-${timestamp}.log`);
      await fs.mkdir(options.logDir, { recursive: true });
      const file2 = Bun.file(logPath);
      const fileWriter = file2.writer();
      write = (msg) => {
        if (options.print) {
          stderrWriter(msg);
        }
        fileWriter.write(msg);
        fileWriter.flush();
      };
    } else if (options.print) {
      write = stderrWriter;
    }
  }
  Log.init = init;
  function formatExtra(extra) {
    if (!extra)
      return "";
    const extraStr = Object.entries(extra).map(([k3, v]) => `${k3}=${typeof v === "object" ? JSON.stringify(v) : v}`).join(" ");
    return extraStr ? ` ${extraStr}` : "";
  }
  function create(tags) {
    const tagStr = tags ? Object.entries(tags).map(([k3, v]) => `${k3}=${v}`).join(" ") : "";
    const tagStrWithSpace = tagStr ? `${tagStr} ` : "";
    return {
      debug(message, extra) {
        if (shouldLog("DEBUG")) {
          write(`DEBUG ${new Date().toISOString()} ${tagStr}${message}${formatExtra(extra)}
`);
        }
      },
      info(message, extra) {
        if (shouldLog("INFO")) {
          write(`INFO  ${new Date().toISOString()} ${tagStr}${message}${formatExtra(extra)}
`);
        }
      },
      warn(message, extra) {
        if (shouldLog("WARN")) {
          write(`WARN  ${new Date().toISOString()} ${tagStr}${message}${formatExtra(extra)}
`);
        }
      },
      error(message, extra) {
        if (shouldLog("ERROR")) {
          write(`ERROR ${new Date().toISOString()} ${tagStr}${message}${formatExtra(extra)}
`);
        }
      }
    };
  }
  Log.create = create;
  Log.Default = create({ service: "ralph" });
})(Log ||= {});

// src/backends/opencode/client.ts
var log = Log.create({ service: "opencode-client" });

class OpenCodeClient {
  client;
  timeout;
  retryAttempts;
  activeSessions;
  promptTimeout;
  directory = process.cwd();
  server = null;
  serverStartupTimeout;
  constructor(client3, server2, config = {}) {
    this.client = client3;
    this.server = server2;
    this.timeout = config.timeout || 30000;
    this.retryAttempts = config.retryAttempts || 3;
    const envPromptTimeout = Number.parseInt(process.env.OPENCODE_PROMPT_TIMEOUT_MS ?? "", 10);
    const resolvedPromptTimeout = Number.isFinite(envPromptTimeout) ? envPromptTimeout : undefined;
    this.promptTimeout = config.promptTimeout ?? resolvedPromptTimeout ?? 120000;
    this.directory = config.directory || process.env.OPENCODE_DIRECTORY || process.cwd();
    this.serverStartupTimeout = config.serverStartupTimeout || 1e4;
    this.activeSessions = new Map;
    log.debug("OpenCodeClient initialized", {
      hasOwnServer: !!this.server,
      timeout: this.timeout,
      serverStartupTimeout: this.serverStartupTimeout
    });
  }
  static async getAvailablePort() {
    try {
      const defaultPort = 4096;
      const isDefaultAvailable = await OpenCodeClient.isPortAvailable(defaultPort);
      if (!isDefaultAvailable) {
        log.info("Existing server detected on port 4096; spawning isolated server on dynamic port");
      } else {
        log.debug("Default port 4096 is available but avoiding it for isolation");
      }
      const dynamicPort = await OpenCodeClient.findAvailablePort();
      log.info(`Spawning isolated server on dynamic port: ${dynamicPort}`);
      return dynamicPort;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      log.error("Failed to select OpenCode server port", {
        error: errorMsg
      });
      throw new Error(`Failed to select OpenCode server port: ${errorMsg}`);
    }
  }
  static async isPortAvailable(port) {
    return new Promise((resolve) => {
      const server2 = createServer();
      server2.listen(port, () => {
        server2.once("close", () => resolve(true));
        server2.close();
      });
      server2.on("error", () => resolve(false));
    });
  }
  static async findAvailablePort() {
    return new Promise((resolve, reject) => {
      const server2 = createServer();
      server2.listen(0, () => {
        const address = server2.address();
        if (address && typeof address === "object") {
          server2.once("close", () => resolve(address.port));
          server2.close();
        } else {
          reject(new Error("Failed to get server address"));
        }
      });
      server2.on("error", reject);
    });
  }
  static async create(config = {}) {
    try {
      if (config.client) {
        log.info("Creating OpenCodeClient with custom client instance");
        return new OpenCodeClient(config.client, null, config);
      }
      if (config.existingServerUrl) {
        log.info("Connecting to existing OpenCode server", {
          url: config.existingServerUrl
        });
        try {
          const client4 = createOpencodeClient({
            baseUrl: config.existingServerUrl
          });
          log.debug("Verifying connection to existing server...");
          return new OpenCodeClient(client4, null, config);
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          log.error("Failed to connect to existing server", {
            url: config.existingServerUrl,
            error: errorMsg
          });
          throw error;
        }
      }
      log.info("Spawning new OpenCode server...", {
        timeout: config.serverStartupTimeout || 1e4
      });
      const availablePort = await OpenCodeClient.getAvailablePort();
      const { client: client3, server: server2 } = await createOpencode({
        timeout: config.serverStartupTimeout || 1e4,
        port: availablePort
      });
      log.info("OpenCode server started successfully");
      return new OpenCodeClient(client3, server2, config);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      log.error("Failed to create OpenCodeClient", { error: errorMsg });
      throw new Error(`Failed to create OpenCodeClient: ${errorMsg}`);
    }
  }
  async createSession(prompt) {
    try {
      const result = await this.client.session.create({
        body: {
          title: "ai-eng ralph session"
        }
      });
      if (!result.data) {
        throw new Error(`Failed to create OpenCode session: ${JSON.stringify(result.error)}`);
      }
      const sdkSession = result.data;
      let pendingInitialPrompt = prompt.trim();
      const buildFirstMessage = (message) => {
        if (!pendingInitialPrompt)
          return message;
        const combined = `${pendingInitialPrompt}

---

${message}`;
        pendingInitialPrompt = "";
        return combined;
      };
      const toolInvocations = [];
      const session = {
        id: sdkSession.id || this.generateSessionId(),
        _toolInvocations: toolInvocations,
        sendMessage: async (message) => {
          return this.handleSendMessage(sdkSession.id, buildFirstMessage(message));
        },
        sendMessageStream: async (message) => {
          return this.handleSendMessageStream(sdkSession.id, buildFirstMessage(message), toolInvocations);
        },
        close: async () => {
          return this.handleSessionClose(sdkSession.id);
        }
      };
      this.activeSessions.set(session.id, session);
      return session;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to create OpenCode session: ${errorMessage}`);
    }
  }
  async sendMessage(sessionId, message) {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    return this.handleSendMessage(sessionId, message);
  }
  async closeSession(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    await this.handleSessionClose(sessionId);
    this.activeSessions.delete(sessionId);
  }
  getActiveSessions() {
    return Array.from(this.activeSessions.keys());
  }
  isSessionActive(sessionId) {
    return this.activeSessions.has(sessionId);
  }
  async closeAllSessions() {
    const closePromises = Array.from(this.activeSessions.keys()).map((sessionId) => this.handleSessionClose(sessionId).catch((error) => {
      const errorMsg = error instanceof Error ? error.message : String(error);
      log.warn("Error closing session", {
        sessionId,
        error: errorMsg
      });
    }));
    await Promise.all(closePromises);
    this.activeSessions.clear();
  }
  async handleSendMessageStream(sessionId, message, toolInvocations) {
    let lastError = null;
    const supportsEventStreaming = typeof this.client?.session?.promptAsync === "function" && typeof this.client?.event?.subscribe === "function";
    for (let attempt = 1;attempt <= this.retryAttempts; attempt++) {
      try {
        const stream = new TransformStream;
        const writer = stream.writable.getWriter();
        let finalized = false;
        const closeOnce = async () => {
          if (finalized)
            return;
          finalized = true;
          try {
            await writer.close();
          } catch {}
        };
        const abortOnce = async (err) => {
          if (finalized)
            return;
          finalized = true;
          try {
            await writer.abort(err);
          } catch {}
        };
        if (!supportsEventStreaming) {
          const promptPromise = this.client.session.prompt({
            body: {
              messageID: this.generateMessageId(),
              parts: [
                {
                  type: "text",
                  text: message
                }
              ]
            },
            path: {
              id: sessionId
            },
            query: {
              directory: this.directory
            }
          });
          const streamingTask2 = (async () => {
            try {
              const result = await promptPromise;
              if (!result.data) {
                throw new Error(`Invalid response from OpenCode: ${JSON.stringify(result.error)}`);
              }
              const response = result.data;
              const textPart = response.parts?.find((part) => part.type === "text");
              const finalContent = textPart?.text || "No content received";
              const chunks = this.splitIntoChunks(finalContent, 10);
              const encoder2 = new TextEncoder;
              for (const chunk of chunks) {
                await writer.write(encoder2.encode(chunk));
                await new Promise((resolve) => setTimeout(resolve, 50));
              }
              await closeOnce();
              return { content: finalContent };
            } catch (error) {
              await abortOnce(error);
              throw error;
            }
          })();
          return {
            stream: stream.readable,
            complete: streamingTask2
          };
        }
        const encoder = new TextEncoder;
        const idleTimeoutError = new Error(`Prompt idle timeout after ${this.promptTimeout}ms`);
        const hardTimeoutError = new Error(`Prompt hard timeout after ${this.promptTimeout * 5}ms`);
        const controller = new AbortController;
        let idleTimer;
        let hardTimer;
        let bytesWritten = 0;
        let lastProgressTime = Date.now();
        let idleTimedOut = false;
        const startHardTimer = () => {
          if (hardTimer)
            clearTimeout(hardTimer);
          hardTimer = setTimeout(() => {
            log.warn("Hard timeout reached, aborting", {
              sessionId,
              timeoutMs: this.promptTimeout * 5
            });
            try {
              controller.abort(hardTimeoutError);
            } catch {}
          }, this.promptTimeout * 5);
        };
        const resetIdleTimer = () => {
          if (idleTimer)
            clearTimeout(idleTimer);
          idleTimer = setTimeout(() => {
            idleTimedOut = true;
            log.warn("Idle timeout reached, aborting", {
              sessionId,
              timeoutMs: this.promptTimeout,
              bytesWritten,
              lastProgressMsAgo: Date.now() - lastProgressTime
            });
            try {
              controller.abort(idleTimeoutError);
            } catch {}
          }, this.promptTimeout);
        };
        const streamingTask = (async () => {
          let assistantMessageId = null;
          try {
            startHardTimer();
            resetIdleTimer();
            const userMessageId = this.generateMessageId();
            log.debug("Sending prompt to OpenCode", {
              sessionId,
              messageLength: message.length,
              userMessageId
            });
            await this.client.session.promptAsync({
              body: {
                messageID: userMessageId,
                parts: [
                  {
                    type: "text",
                    text: message
                  }
                ]
              },
              path: {
                id: sessionId
              },
              query: {
                directory: this.directory
              },
              signal: controller.signal
            });
            log.debug("Subscribing to events", {
              sessionId,
              directory: this.directory
            });
            const eventsResult = await this.client.event.subscribe({
              query: {
                directory: this.directory
              },
              signal: controller.signal
            });
            let content = "";
            let emittedText = "";
            let eventCount = 0;
            log.debug("Starting event stream processing", {
              sessionId
            });
            for await (const event of eventsResult.stream) {
              eventCount++;
              log.debug("Received event", {
                sessionId,
                eventType: event?.type,
                eventCount,
                hasProperties: !!event?.properties,
                controllerAborted: controller.signal.aborted
              });
              if (controller.signal.aborted) {
                log.debug("Controller aborted, breaking event loop", {
                  sessionId,
                  eventCount
                });
                break;
              }
              if (!event || typeof event !== "object") {
                log.debug("Skipping non-object event", {
                  sessionId,
                  eventCount
                });
                continue;
              }
              if (event.type === "message.updated") {
                const info = event.properties?.info;
                log.debug("Message updated event", {
                  sessionId,
                  eventCount,
                  infoRole: info?.role,
                  infoSessionId: info?.sessionID,
                  infoParentId: info?.parentID,
                  infoId: info?.id,
                  isRelevantSession: info?.sessionID === sessionId,
                  isAssistant: info?.role === "assistant",
                  isReplyToUser: info?.parentID === userMessageId
                });
                if (info?.role === "assistant" && info?.sessionID === sessionId && info?.parentID === userMessageId) {
                  assistantMessageId = info.id;
                  log.debug("Identified assistant message (exact parentID match)", {
                    sessionId,
                    assistantMessageId
                  });
                } else if (!assistantMessageId && info?.role === "assistant" && info?.sessionID === sessionId) {
                  log.debug("Identified assistant message (fallback - no exact parentID match)", {
                    sessionId,
                    assistantMessageId: info.id,
                    infoParentId: info?.parentID,
                    userMessageId
                  });
                  assistantMessageId = info.id;
                }
                if (info?.role === "assistant" && info?.sessionID === sessionId) {
                  lastProgressTime = Date.now();
                  resetIdleTimer();
                }
                if (assistantMessageId && info?.id === assistantMessageId) {
                  if (info?.error) {
                    const errName = info.error.name || "OpenCodeError";
                    const errMsg = info.error.data?.message || JSON.stringify(info.error.data || {});
                    log.error("Assistant error in message", {
                      sessionId,
                      errorName: errName,
                      errorMessage: errMsg
                    });
                    throw new Error(`${errName}: ${errMsg}`);
                  }
                  if (info?.time?.completed) {
                    log.debug("Assistant message completed", {
                      sessionId,
                      assistantMessageId,
                      completedAt: info.time.completed
                    });
                    break;
                  }
                }
                continue;
              }
              if (event.type === "message.part.updated") {
                const part = event.properties?.part;
                log.debug("Message part updated", {
                  sessionId,
                  eventCount,
                  hasPart: !!part,
                  partType: part?.type,
                  partSessionId: part?.sessionID,
                  partMessageId: part?.messageID,
                  assistantMessageId,
                  isRelevant: assistantMessageId && part?.sessionID === sessionId && part?.messageID === assistantMessageId
                });
                if (!assistantMessageId)
                  continue;
                if (part?.type === "tool" && toolInvocations) {
                  const toolId = part.toolId || part.id || `tool-${eventCount}`;
                  const toolName = part.toolName || part.name || "unknown";
                  const toolInput = part.input || part.parameters || {};
                  const existingToolIndex = toolInvocations.findIndex((t) => t.id === toolId);
                  const now = new Date().toISOString();
                  if (existingToolIndex >= 0) {
                    const existing = toolInvocations[existingToolIndex];
                    existing.output = part.result ?? part.output ?? existing.output;
                    existing.status = part.status === "error" ? "error" : "ok";
                    existing.error = part.error ?? existing.error;
                    existing.completedAt = part.completedAt ?? now;
                    log.debug("Tool invocation updated", {
                      sessionId,
                      toolId,
                      toolName,
                      status: existing.status
                    });
                  } else {
                    const toolInvocation = {
                      id: toolId,
                      name: toolName,
                      input: toolInput,
                      output: part.result ?? part.output,
                      status: part.status === "error" ? "error" : "ok",
                      error: part.error,
                      startedAt: part.startedAt ?? now,
                      completedAt: part.completedAt
                    };
                    toolInvocations.push(toolInvocation);
                    log.debug("Tool invocation started", {
                      sessionId,
                      toolId,
                      toolName,
                      input: JSON.stringify(toolInput).slice(0, 200)
                    });
                  }
                  if (part.sessionID !== sessionId || part.messageID !== assistantMessageId) {} else {
                    lastProgressTime = Date.now();
                    resetIdleTimer();
                  }
                  continue;
                }
                if (!part || part.type !== "text")
                  continue;
                if (part.sessionID !== sessionId)
                  continue;
                if (part.messageID !== assistantMessageId)
                  continue;
                const rawDelta = event.properties?.delta;
                let deltaText;
                if (typeof part.text === "string") {
                  const next = part.text;
                  if (next.startsWith(emittedText)) {
                    deltaText = next.slice(emittedText.length);
                    emittedText = next;
                  } else if (emittedText.startsWith(next)) {
                    deltaText = "";
                  } else {
                    deltaText = next;
                    emittedText += next;
                  }
                } else if (typeof rawDelta === "string") {
                  deltaText = rawDelta;
                  emittedText += rawDelta;
                }
                if (!deltaText)
                  continue;
                lastProgressTime = Date.now();
                bytesWritten += deltaText.length;
                resetIdleTimer();
                log.debug("Writing delta to stream", {
                  sessionId,
                  deltaLength: deltaText.length,
                  totalBytesWritten: bytesWritten,
                  contentLength: content.length
                });
                content += deltaText;
                await writer.write(encoder.encode(deltaText));
              }
            }
            log.debug("Event stream ended", {
              sessionId,
              eventCount,
              totalBytesWritten: bytesWritten,
              contentLength: content.length,
              controllerAborted: controller.signal.aborted,
              idleTimedOut,
              assistantMessageIdFound: !!assistantMessageId
            });
            await closeOnce();
            return {
              content: content || "No content received",
              diagnostics: {
                bytesWritten,
                contentLength: content.length,
                idleTimedOut,
                assistantMessageIdFound: !!assistantMessageId,
                eventCount
              }
            };
          } catch (error) {
            log.error("Streaming task error", {
              sessionId,
              error: error instanceof Error ? error.message : String(error),
              controllerAborted: controller.signal.aborted,
              bytesWritten,
              idleTimedOut,
              assistantMessageIdFound: !!assistantMessageId
            });
            if (controller.signal.aborted) {
              await abortOnce(idleTimeoutError);
              throw idleTimeoutError;
            }
            await abortOnce(error);
            throw error;
          } finally {
            if (idleTimer)
              clearTimeout(idleTimer);
            if (hardTimer)
              clearTimeout(hardTimer);
            try {
              if (!controller.signal.aborted)
                controller.abort();
            } catch {}
          }
        })();
        return {
          stream: stream.readable,
          complete: streamingTask
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const isRateLimit = this.isRateLimitError(lastError);
        if (attempt === this.retryAttempts) {
          break;
        }
        const delay = this.getBackoffDelay(attempt, isRateLimit);
        log.warn("OpenCode attempt failed; retrying", {
          attempt,
          retryAttempts: this.retryAttempts,
          delayMs: delay,
          isRateLimit,
          error: lastError.message
        });
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw new Error(`Failed to stream message after ${this.retryAttempts} attempts: ${lastError?.message || "Unknown error"}`);
  }
  splitIntoChunks(text, chunkSize) {
    const chunks = [];
    for (let i = 0;i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks.length > 0 ? chunks : [text];
  }
  async handleSendMessage(sessionId, message) {
    let lastError = null;
    for (let attempt = 1;attempt <= this.retryAttempts; attempt++) {
      try {
        const timeoutError = new Error(`Prompt timeout after ${this.promptTimeout}ms`);
        const controller = new AbortController;
        const timer = setTimeout(() => {
          try {
            controller.abort(timeoutError);
          } catch {}
        }, this.promptTimeout);
        let result;
        try {
          result = await this.client.session.prompt({
            body: {
              messageID: this.generateMessageId(),
              parts: [
                {
                  type: "text",
                  text: message
                }
              ]
            },
            path: {
              id: sessionId
            },
            query: {
              directory: this.directory
            },
            signal: controller.signal
          });
        } catch (error) {
          if (controller.signal.aborted) {
            throw timeoutError;
          }
          throw error;
        } finally {
          clearTimeout(timer);
        }
        if (!result.data) {
          throw new Error(`Invalid response from OpenCode: ${JSON.stringify(result.error)}`);
        }
        const response = result.data;
        const textPart = response.parts?.find((part) => part.type === "text");
        return { content: textPart?.text || "No content received" };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const isRateLimit = this.isRateLimitError(lastError);
        if (attempt === this.retryAttempts) {
          break;
        }
        const delay = this.getBackoffDelay(attempt, isRateLimit);
        log.warn("OpenCode attempt failed; retrying", {
          attempt,
          retryAttempts: this.retryAttempts,
          delayMs: delay,
          isRateLimit,
          error: lastError.message
        });
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw new Error(`Failed to send message after ${this.retryAttempts} attempts: ${lastError?.message || "Unknown error"}`);
  }
  isRateLimitError(error) {
    const err = error;
    return err.status === 429 || /rate limit|quota|overloaded|capacity/i.test(error.message);
  }
  getBackoffDelay(attempt, isRateLimit) {
    const base = isRateLimit ? 5000 : 1000;
    const exponential = base * 2 ** (attempt - 1);
    const jitter = Math.random() * 1000;
    return Math.min(exponential + jitter, 60000);
  }
  async handleSessionClose(sessionId) {
    try {
      log.debug("Session closed", { sessionId });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log.warn("Failed to close session", {
        sessionId,
        error: errorMessage
      });
    }
  }
  generateSessionId() {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }
  async cleanup() {
    try {
      log.debug("Starting cleanup...", {
        activeSessions: this.activeSessions.size,
        hasServer: !!this.server
      });
      await this.closeAllSessions();
      if (this.server) {
        log.info("Closing spawned OpenCode server");
        try {
          this.server.close();
          this.server = null;
          log.info("OpenCode server closed successfully");
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          log.error("Error closing OpenCode server", {
            error: errorMsg
          });
        }
      } else {
        log.debug("No spawned server to close (connected to existing server)");
      }
      log.info("Cleanup complete");
      return;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      log.error("Error during OpenCode client cleanup", {
        error: errorMsg
      });
      return;
    }
  }
}

// src/execution/ralph-loop.ts
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { join as join2 } from "node:path";

// src/backends/opencode/client.ts
import { createServer as createServer2 } from "node:net";
var log2 = Log.create({ service: "opencode-client" });

class OpenCodeClient2 {
  client;
  timeout;
  retryAttempts;
  activeSessions;
  promptTimeout;
  directory = process.cwd();
  server = null;
  serverStartupTimeout;
  constructor(client3, server2, config = {}) {
    this.client = client3;
    this.server = server2;
    this.timeout = config.timeout || 30000;
    this.retryAttempts = config.retryAttempts || 3;
    const envPromptTimeout = Number.parseInt(process.env.OPENCODE_PROMPT_TIMEOUT_MS ?? "", 10);
    const resolvedPromptTimeout = Number.isFinite(envPromptTimeout) ? envPromptTimeout : undefined;
    this.promptTimeout = config.promptTimeout ?? resolvedPromptTimeout ?? 120000;
    this.directory = config.directory || process.env.OPENCODE_DIRECTORY || process.cwd();
    this.serverStartupTimeout = config.serverStartupTimeout || 1e4;
    this.activeSessions = new Map;
    log2.debug("OpenCodeClient initialized", {
      hasOwnServer: !!this.server,
      timeout: this.timeout,
      serverStartupTimeout: this.serverStartupTimeout
    });
  }
  static async getAvailablePort() {
    try {
      const defaultPort = 4096;
      const isDefaultAvailable = await OpenCodeClient2.isPortAvailable(defaultPort);
      if (!isDefaultAvailable) {
        log2.info("Existing server detected on port 4096; spawning isolated server on dynamic port");
      } else {
        log2.debug("Default port 4096 is available but avoiding it for isolation");
      }
      const dynamicPort = await OpenCodeClient2.findAvailablePort();
      log2.info(`Spawning isolated server on dynamic port: ${dynamicPort}`);
      return dynamicPort;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      log2.error("Failed to select OpenCode server port", {
        error: errorMsg
      });
      throw new Error(`Failed to select OpenCode server port: ${errorMsg}`);
    }
  }
  static async isPortAvailable(port) {
    return new Promise((resolve) => {
      const server2 = createServer2();
      server2.listen(port, () => {
        server2.once("close", () => resolve(true));
        server2.close();
      });
      server2.on("error", () => resolve(false));
    });
  }
  static async findAvailablePort() {
    return new Promise((resolve, reject) => {
      const server2 = createServer2();
      server2.listen(0, () => {
        const address = server2.address();
        if (address && typeof address === "object") {
          server2.once("close", () => resolve(address.port));
          server2.close();
        } else {
          reject(new Error("Failed to get server address"));
        }
      });
      server2.on("error", reject);
    });
  }
  static async create(config = {}) {
    try {
      if (config.client) {
        log2.info("Creating OpenCodeClient with custom client instance");
        return new OpenCodeClient2(config.client, null, config);
      }
      if (config.existingServerUrl) {
        log2.info("Connecting to existing OpenCode server", {
          url: config.existingServerUrl
        });
        try {
          const client4 = createOpencodeClient({
            baseUrl: config.existingServerUrl
          });
          log2.debug("Verifying connection to existing server...");
          return new OpenCodeClient2(client4, null, config);
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          log2.error("Failed to connect to existing server", {
            url: config.existingServerUrl,
            error: errorMsg
          });
          throw error;
        }
      }
      log2.info("Spawning new OpenCode server...", {
        timeout: config.serverStartupTimeout || 1e4
      });
      const availablePort = await OpenCodeClient2.getAvailablePort();
      const { client: client3, server: server2 } = await createOpencode({
        timeout: config.serverStartupTimeout || 1e4,
        port: availablePort
      });
      log2.info("OpenCode server started successfully");
      return new OpenCodeClient2(client3, server2, config);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      log2.error("Failed to create OpenCodeClient", { error: errorMsg });
      throw new Error(`Failed to create OpenCodeClient: ${errorMsg}`);
    }
  }
  async createSession(prompt) {
    try {
      const result = await this.client.session.create({
        body: {
          title: "ai-eng ralph session"
        }
      });
      if (!result.data) {
        throw new Error(`Failed to create OpenCode session: ${JSON.stringify(result.error)}`);
      }
      const sdkSession = result.data;
      let pendingInitialPrompt = prompt.trim();
      const buildFirstMessage = (message) => {
        if (!pendingInitialPrompt)
          return message;
        const combined = `${pendingInitialPrompt}

---

${message}`;
        pendingInitialPrompt = "";
        return combined;
      };
      const toolInvocations = [];
      const session = {
        id: sdkSession.id || this.generateSessionId(),
        _toolInvocations: toolInvocations,
        sendMessage: async (message) => {
          return this.handleSendMessage(sdkSession.id, buildFirstMessage(message));
        },
        sendMessageStream: async (message) => {
          return this.handleSendMessageStream(sdkSession.id, buildFirstMessage(message), toolInvocations);
        },
        close: async () => {
          return this.handleSessionClose(sdkSession.id);
        }
      };
      this.activeSessions.set(session.id, session);
      return session;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to create OpenCode session: ${errorMessage}`);
    }
  }
  async sendMessage(sessionId, message) {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    return this.handleSendMessage(sessionId, message);
  }
  async closeSession(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    await this.handleSessionClose(sessionId);
    this.activeSessions.delete(sessionId);
  }
  getActiveSessions() {
    return Array.from(this.activeSessions.keys());
  }
  isSessionActive(sessionId) {
    return this.activeSessions.has(sessionId);
  }
  async closeAllSessions() {
    const closePromises = Array.from(this.activeSessions.keys()).map((sessionId) => this.handleSessionClose(sessionId).catch((error) => {
      const errorMsg = error instanceof Error ? error.message : String(error);
      log2.warn("Error closing session", {
        sessionId,
        error: errorMsg
      });
    }));
    await Promise.all(closePromises);
    this.activeSessions.clear();
  }
  async handleSendMessageStream(sessionId, message, toolInvocations) {
    let lastError = null;
    const supportsEventStreaming = typeof this.client?.session?.promptAsync === "function" && typeof this.client?.event?.subscribe === "function";
    for (let attempt = 1;attempt <= this.retryAttempts; attempt++) {
      try {
        const stream = new TransformStream;
        const writer = stream.writable.getWriter();
        let finalized = false;
        const closeOnce = async () => {
          if (finalized)
            return;
          finalized = true;
          try {
            await writer.close();
          } catch {}
        };
        const abortOnce = async (err) => {
          if (finalized)
            return;
          finalized = true;
          try {
            await writer.abort(err);
          } catch {}
        };
        if (!supportsEventStreaming) {
          const promptPromise = this.client.session.prompt({
            body: {
              messageID: this.generateMessageId(),
              parts: [
                {
                  type: "text",
                  text: message
                }
              ]
            },
            path: {
              id: sessionId
            },
            query: {
              directory: this.directory
            }
          });
          const streamingTask2 = (async () => {
            try {
              const result = await promptPromise;
              if (!result.data) {
                throw new Error(`Invalid response from OpenCode: ${JSON.stringify(result.error)}`);
              }
              const response = result.data;
              const textPart = response.parts?.find((part) => part.type === "text");
              const finalContent = textPart?.text || "No content received";
              const chunks = this.splitIntoChunks(finalContent, 10);
              const encoder2 = new TextEncoder;
              for (const chunk of chunks) {
                await writer.write(encoder2.encode(chunk));
                await new Promise((resolve) => setTimeout(resolve, 50));
              }
              await closeOnce();
              return { content: finalContent };
            } catch (error) {
              await abortOnce(error);
              throw error;
            }
          })();
          return {
            stream: stream.readable,
            complete: streamingTask2
          };
        }
        const encoder = new TextEncoder;
        const idleTimeoutError = new Error(`Prompt idle timeout after ${this.promptTimeout}ms`);
        const hardTimeoutError = new Error(`Prompt hard timeout after ${this.promptTimeout * 5}ms`);
        const controller = new AbortController;
        let idleTimer;
        let hardTimer;
        let bytesWritten = 0;
        let lastProgressTime = Date.now();
        let idleTimedOut = false;
        const startHardTimer = () => {
          if (hardTimer)
            clearTimeout(hardTimer);
          hardTimer = setTimeout(() => {
            log2.warn("Hard timeout reached, aborting", {
              sessionId,
              timeoutMs: this.promptTimeout * 5
            });
            try {
              controller.abort(hardTimeoutError);
            } catch {}
          }, this.promptTimeout * 5);
        };
        const resetIdleTimer = () => {
          if (idleTimer)
            clearTimeout(idleTimer);
          idleTimer = setTimeout(() => {
            idleTimedOut = true;
            log2.warn("Idle timeout reached, aborting", {
              sessionId,
              timeoutMs: this.promptTimeout,
              bytesWritten,
              lastProgressMsAgo: Date.now() - lastProgressTime
            });
            try {
              controller.abort(idleTimeoutError);
            } catch {}
          }, this.promptTimeout);
        };
        const streamingTask = (async () => {
          let assistantMessageId = null;
          try {
            startHardTimer();
            resetIdleTimer();
            const userMessageId = this.generateMessageId();
            log2.debug("Sending prompt to OpenCode", {
              sessionId,
              messageLength: message.length,
              userMessageId
            });
            await this.client.session.promptAsync({
              body: {
                messageID: userMessageId,
                parts: [
                  {
                    type: "text",
                    text: message
                  }
                ]
              },
              path: {
                id: sessionId
              },
              query: {
                directory: this.directory
              },
              signal: controller.signal
            });
            log2.debug("Subscribing to events", {
              sessionId,
              directory: this.directory
            });
            const eventsResult = await this.client.event.subscribe({
              query: {
                directory: this.directory
              },
              signal: controller.signal
            });
            let content = "";
            let emittedText = "";
            let eventCount = 0;
            log2.debug("Starting event stream processing", {
              sessionId
            });
            for await (const event of eventsResult.stream) {
              eventCount++;
              log2.debug("Received event", {
                sessionId,
                eventType: event?.type,
                eventCount,
                hasProperties: !!event?.properties,
                controllerAborted: controller.signal.aborted
              });
              if (controller.signal.aborted) {
                log2.debug("Controller aborted, breaking event loop", {
                  sessionId,
                  eventCount
                });
                break;
              }
              if (!event || typeof event !== "object") {
                log2.debug("Skipping non-object event", {
                  sessionId,
                  eventCount
                });
                continue;
              }
              if (event.type === "message.updated") {
                const info = event.properties?.info;
                log2.debug("Message updated event", {
                  sessionId,
                  eventCount,
                  infoRole: info?.role,
                  infoSessionId: info?.sessionID,
                  infoParentId: info?.parentID,
                  infoId: info?.id,
                  isRelevantSession: info?.sessionID === sessionId,
                  isAssistant: info?.role === "assistant",
                  isReplyToUser: info?.parentID === userMessageId
                });
                if (info?.role === "assistant" && info?.sessionID === sessionId && info?.parentID === userMessageId) {
                  assistantMessageId = info.id;
                  log2.debug("Identified assistant message (exact parentID match)", {
                    sessionId,
                    assistantMessageId
                  });
                } else if (!assistantMessageId && info?.role === "assistant" && info?.sessionID === sessionId) {
                  log2.debug("Identified assistant message (fallback - no exact parentID match)", {
                    sessionId,
                    assistantMessageId: info.id,
                    infoParentId: info?.parentID,
                    userMessageId
                  });
                  assistantMessageId = info.id;
                }
                if (info?.role === "assistant" && info?.sessionID === sessionId) {
                  lastProgressTime = Date.now();
                  resetIdleTimer();
                }
                if (assistantMessageId && info?.id === assistantMessageId) {
                  if (info?.error) {
                    const errName = info.error.name || "OpenCodeError";
                    const errMsg = info.error.data?.message || JSON.stringify(info.error.data || {});
                    log2.error("Assistant error in message", {
                      sessionId,
                      errorName: errName,
                      errorMessage: errMsg
                    });
                    throw new Error(`${errName}: ${errMsg}`);
                  }
                  if (info?.time?.completed) {
                    log2.debug("Assistant message completed", {
                      sessionId,
                      assistantMessageId,
                      completedAt: info.time.completed
                    });
                    break;
                  }
                }
                continue;
              }
              if (event.type === "message.part.updated") {
                const part = event.properties?.part;
                log2.debug("Message part updated", {
                  sessionId,
                  eventCount,
                  hasPart: !!part,
                  partType: part?.type,
                  partSessionId: part?.sessionID,
                  partMessageId: part?.messageID,
                  assistantMessageId,
                  isRelevant: assistantMessageId && part?.sessionID === sessionId && part?.messageID === assistantMessageId
                });
                if (!assistantMessageId)
                  continue;
                if (part?.type === "tool" && toolInvocations) {
                  const toolId = part.toolId || part.id || `tool-${eventCount}`;
                  const toolName = part.toolName || part.name || "unknown";
                  const toolInput = part.input || part.parameters || {};
                  const existingToolIndex = toolInvocations.findIndex((t) => t.id === toolId);
                  const now = new Date().toISOString();
                  if (existingToolIndex >= 0) {
                    const existing = toolInvocations[existingToolIndex];
                    existing.output = part.result ?? part.output ?? existing.output;
                    existing.status = part.status === "error" ? "error" : "ok";
                    existing.error = part.error ?? existing.error;
                    existing.completedAt = part.completedAt ?? now;
                    log2.debug("Tool invocation updated", {
                      sessionId,
                      toolId,
                      toolName,
                      status: existing.status
                    });
                  } else {
                    const toolInvocation = {
                      id: toolId,
                      name: toolName,
                      input: toolInput,
                      output: part.result ?? part.output,
                      status: part.status === "error" ? "error" : "ok",
                      error: part.error,
                      startedAt: part.startedAt ?? now,
                      completedAt: part.completedAt
                    };
                    toolInvocations.push(toolInvocation);
                    log2.debug("Tool invocation started", {
                      sessionId,
                      toolId,
                      toolName,
                      input: JSON.stringify(toolInput).slice(0, 200)
                    });
                  }
                  if (part.sessionID !== sessionId || part.messageID !== assistantMessageId) {} else {
                    lastProgressTime = Date.now();
                    resetIdleTimer();
                  }
                  continue;
                }
                if (!part || part.type !== "text")
                  continue;
                if (part.sessionID !== sessionId)
                  continue;
                if (part.messageID !== assistantMessageId)
                  continue;
                const rawDelta = event.properties?.delta;
                let deltaText;
                if (typeof part.text === "string") {
                  const next = part.text;
                  if (next.startsWith(emittedText)) {
                    deltaText = next.slice(emittedText.length);
                    emittedText = next;
                  } else if (emittedText.startsWith(next)) {
                    deltaText = "";
                  } else {
                    deltaText = next;
                    emittedText += next;
                  }
                } else if (typeof rawDelta === "string") {
                  deltaText = rawDelta;
                  emittedText += rawDelta;
                }
                if (!deltaText)
                  continue;
                lastProgressTime = Date.now();
                bytesWritten += deltaText.length;
                resetIdleTimer();
                log2.debug("Writing delta to stream", {
                  sessionId,
                  deltaLength: deltaText.length,
                  totalBytesWritten: bytesWritten,
                  contentLength: content.length
                });
                content += deltaText;
                await writer.write(encoder.encode(deltaText));
              }
            }
            log2.debug("Event stream ended", {
              sessionId,
              eventCount,
              totalBytesWritten: bytesWritten,
              contentLength: content.length,
              controllerAborted: controller.signal.aborted,
              idleTimedOut,
              assistantMessageIdFound: !!assistantMessageId
            });
            await closeOnce();
            return {
              content: content || "No content received",
              diagnostics: {
                bytesWritten,
                contentLength: content.length,
                idleTimedOut,
                assistantMessageIdFound: !!assistantMessageId,
                eventCount
              }
            };
          } catch (error) {
            log2.error("Streaming task error", {
              sessionId,
              error: error instanceof Error ? error.message : String(error),
              controllerAborted: controller.signal.aborted,
              bytesWritten,
              idleTimedOut,
              assistantMessageIdFound: !!assistantMessageId
            });
            if (controller.signal.aborted) {
              await abortOnce(idleTimeoutError);
              throw idleTimeoutError;
            }
            await abortOnce(error);
            throw error;
          } finally {
            if (idleTimer)
              clearTimeout(idleTimer);
            if (hardTimer)
              clearTimeout(hardTimer);
            try {
              if (!controller.signal.aborted)
                controller.abort();
            } catch {}
          }
        })();
        return {
          stream: stream.readable,
          complete: streamingTask
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const isRateLimit = this.isRateLimitError(lastError);
        if (attempt === this.retryAttempts) {
          break;
        }
        const delay = this.getBackoffDelay(attempt, isRateLimit);
        log2.warn("OpenCode attempt failed; retrying", {
          attempt,
          retryAttempts: this.retryAttempts,
          delayMs: delay,
          isRateLimit,
          error: lastError.message
        });
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw new Error(`Failed to stream message after ${this.retryAttempts} attempts: ${lastError?.message || "Unknown error"}`);
  }
  splitIntoChunks(text, chunkSize) {
    const chunks = [];
    for (let i = 0;i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks.length > 0 ? chunks : [text];
  }
  async handleSendMessage(sessionId, message) {
    let lastError = null;
    for (let attempt = 1;attempt <= this.retryAttempts; attempt++) {
      try {
        const timeoutError = new Error(`Prompt timeout after ${this.promptTimeout}ms`);
        const controller = new AbortController;
        const timer = setTimeout(() => {
          try {
            controller.abort(timeoutError);
          } catch {}
        }, this.promptTimeout);
        let result;
        try {
          result = await this.client.session.prompt({
            body: {
              messageID: this.generateMessageId(),
              parts: [
                {
                  type: "text",
                  text: message
                }
              ]
            },
            path: {
              id: sessionId
            },
            query: {
              directory: this.directory
            },
            signal: controller.signal
          });
        } catch (error) {
          if (controller.signal.aborted) {
            throw timeoutError;
          }
          throw error;
        } finally {
          clearTimeout(timer);
        }
        if (!result.data) {
          throw new Error(`Invalid response from OpenCode: ${JSON.stringify(result.error)}`);
        }
        const response = result.data;
        const textPart = response.parts?.find((part) => part.type === "text");
        return { content: textPart?.text || "No content received" };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const isRateLimit = this.isRateLimitError(lastError);
        if (attempt === this.retryAttempts) {
          break;
        }
        const delay = this.getBackoffDelay(attempt, isRateLimit);
        log2.warn("OpenCode attempt failed; retrying", {
          attempt,
          retryAttempts: this.retryAttempts,
          delayMs: delay,
          isRateLimit,
          error: lastError.message
        });
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw new Error(`Failed to send message after ${this.retryAttempts} attempts: ${lastError?.message || "Unknown error"}`);
  }
  isRateLimitError(error) {
    const err = error;
    return err.status === 429 || /rate limit|quota|overloaded|capacity/i.test(error.message);
  }
  getBackoffDelay(attempt, isRateLimit) {
    const base = isRateLimit ? 5000 : 1000;
    const exponential = base * 2 ** (attempt - 1);
    const jitter = Math.random() * 1000;
    return Math.min(exponential + jitter, 60000);
  }
  async handleSessionClose(sessionId) {
    try {
      log2.debug("Session closed", { sessionId });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log2.warn("Failed to close session", {
        sessionId,
        error: errorMessage
      });
    }
  }
  generateSessionId() {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }
  async cleanup() {
    try {
      log2.debug("Starting cleanup...", {
        activeSessions: this.activeSessions.size,
        hasServer: !!this.server
      });
      await this.closeAllSessions();
      if (this.server) {
        log2.info("Closing spawned OpenCode server");
        try {
          this.server.close();
          this.server = null;
          log2.info("OpenCode server closed successfully");
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          log2.error("Error closing OpenCode server", {
            error: errorMsg
          });
        }
      } else {
        log2.debug("No spawned server to close (connected to existing server)");
      }
      log2.info("Cleanup complete");
      return;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      log2.error("Error during OpenCode client cleanup", {
        error: errorMsg
      });
      return;
    }
  }
}

// src/cli/ui.ts
import { EOL } from "node:os";
var UI;
((UI) => {
  UI.Style = {
    TEXT_HIGHLIGHT: "\x1B[96m",
    TEXT_HIGHLIGHT_BOLD: "\x1B[96m\x1B[1m",
    TEXT_DIM: "\x1B[90m",
    TEXT_DIM_BOLD: "\x1B[90m\x1B[1m",
    TEXT_NORMAL: "\x1B[0m",
    TEXT_NORMAL_BOLD: "\x1B[1m",
    TEXT_WARNING: "\x1B[93m",
    TEXT_WARNING_BOLD: "\x1B[93m\x1B[1m",
    TEXT_DANGER: "\x1B[91m",
    TEXT_DANGER_BOLD: "\x1B[91m\x1B[1m",
    TEXT_SUCCESS: "\x1B[92m",
    TEXT_SUCCESS_BOLD: "\x1B[92m\x1B[1m",
    TEXT_INFO: "\x1B[94m",
    TEXT_INFO_BOLD: "\x1B[94m\x1B[1m"
  };
  function println(...message) {
    process.stderr.write(message.join(" ") + EOL);
  }
  UI.println = println;
  function print(...message) {
    process.stderr.write(message.join(" "));
  }
  UI.print = print;
  function error(message) {
    println(`${UI.Style.TEXT_DANGER_BOLD}Error: ${UI.Style.TEXT_NORMAL}${message}`);
  }
  UI.error = error;
  function success(message) {
    println(`${UI.Style.TEXT_SUCCESS_BOLD}✓ ${UI.Style.TEXT_NORMAL}${message}`);
  }
  UI.success = success;
  function info(message) {
    println(`${UI.Style.TEXT_INFO_BOLD}ℹ ${UI.Style.TEXT_NORMAL}${message}`);
  }
  UI.info = info;
  function warn(message) {
    println(`${UI.Style.TEXT_WARNING_BOLD}! ${UI.Style.TEXT_NORMAL}${message}`);
  }
  UI.warn = warn;
  function header(title) {
    println();
    println(UI.Style.TEXT_HIGHLIGHT_BOLD + title + UI.Style.TEXT_NORMAL);
    println(UI.Style.TEXT_DIM + "─".repeat(50) + UI.Style.TEXT_NORMAL);
  }
  UI.header = header;
})(UI ||= {});

// src/prompt-optimization/analyzer.ts
var COMPLEXITY_KEYWORDS = {
  debug: ["debug", "fix", "error", "bug", "issue", "problem", "troubleshoot"],
  design: [
    "design",
    "architecture",
    "architect",
    "structure",
    "pattern",
    "approach"
  ],
  optimize: [
    "optimize",
    "improve",
    "performance",
    "efficient",
    "fast",
    "scale"
  ],
  implement: ["implement", "build", "create", "develop", "write", "code"],
  complex: ["complex", "challenge", "difficult", "advanced", "sophisticated"]
};
var DOMAIN_KEYWORDS = {
  security: [
    "auth",
    "authentication",
    "jwt",
    "oauth",
    "password",
    "encrypt",
    "decrypt",
    "security",
    "token",
    "session",
    "csrf",
    "xss",
    "injection",
    "vulnerability",
    "hack",
    "attack"
  ],
  frontend: [
    "react",
    "vue",
    "angular",
    "component",
    "css",
    "html",
    "ui",
    "ux",
    "render",
    "state",
    "hook",
    "props",
    "dom",
    "frontend",
    "client"
  ],
  backend: [
    "api",
    "server",
    "endpoint",
    "database",
    "query",
    "backend",
    "service",
    "microservice",
    "rest",
    "graphql",
    "http",
    "request",
    "response"
  ],
  database: [
    "sql",
    "postgresql",
    "mysql",
    "mongodb",
    "redis",
    "query",
    "index",
    "schema",
    "migration",
    "database",
    "db",
    "join",
    "transaction",
    "orm"
  ],
  devops: [
    "deploy",
    "ci/cd",
    "docker",
    "kubernetes",
    "k8s",
    "pipeline",
    "infrastructure",
    "aws",
    "gcp",
    "azure",
    "terraform",
    "ansible",
    "jenkins",
    "devops",
    "ops"
  ],
  architecture: [
    "architecture",
    "design",
    "pattern",
    "microservices",
    "monolith",
    "scalability",
    "system",
    "distributed",
    "architect",
    "high-level"
  ],
  testing: [
    "test",
    "spec",
    "unit test",
    "integration test",
    "e2e",
    "jest",
    "cypress",
    "playwright",
    "testing",
    "tdd",
    "coverage",
    "mock",
    "stub"
  ],
  general: []
};
var SIMPLE_PATTERNS = [
  /^(hello|hi|hey|greetings|good morning|good evening)/i,
  /^(thanks|thank you|thx)/i,
  /^(yes|no|ok|sure|alright)/i,
  /^(what|how|why|when|where|who|which)\s+\w+\??$/i,
  /^(help|assist)\s*$/i
];
function calculateComplexityScore(prompt) {
  const words = prompt.split(/\s+/);
  const wordCount = words.length;
  let score = 0;
  if (wordCount < 5)
    score += 0;
  else if (wordCount < 10)
    score += 3;
  else if (wordCount < 20)
    score += 6;
  else
    score += 10;
  const lowerPrompt = prompt.toLowerCase();
  for (const category of Object.values(COMPLEXITY_KEYWORDS)) {
    for (const keyword of category) {
      if (lowerPrompt.includes(keyword)) {
        score += 2;
        break;
      }
    }
  }
  const questionMarks = (prompt.match(/\?/g) || []).length;
  score -= Math.min(questionMarks * 2, 5);
  const techTerms = words.filter((word) => {
    const lower = word.toLowerCase();
    return /\w{4,}/.test(word) && !["this", "that", "with", "from", "into"].includes(lower);
  });
  score += Math.min(techTerms.length * 0.5, 5);
  return Math.max(0, Math.min(20, score));
}
function scoreToComplexity(score) {
  if (score < 5)
    return "simple";
  if (score < 12)
    return "medium";
  return "complex";
}
function isSimplePrompt(prompt) {
  for (const pattern of SIMPLE_PATTERNS) {
    if (pattern.test(prompt.trim())) {
      return true;
    }
  }
  return false;
}
function detectDomain(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  const scores = {
    security: 0,
    frontend: 0,
    backend: 0,
    database: 0,
    devops: 0,
    architecture: 0,
    testing: 0,
    general: 0
  };
  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerPrompt.includes(keyword)) {
        scores[domain]++;
      }
    }
  }
  let bestDomain = "general";
  let bestScore = 0;
  for (const [domain, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestDomain = domain;
    }
  }
  return bestDomain;
}
function extractKeywords(prompt) {
  const keywords = [];
  const lowerPrompt = prompt.toLowerCase();
  for (const [category, terms] of Object.entries(COMPLEXITY_KEYWORDS)) {
    for (const term of terms) {
      if (lowerPrompt.includes(term) && !keywords.includes(term)) {
        keywords.push(term);
      }
    }
  }
  for (const [domain, terms] of Object.entries(DOMAIN_KEYWORDS)) {
    for (const term of terms) {
      if (lowerPrompt.includes(term) && !keywords.includes(term)) {
        keywords.push(term);
      }
    }
  }
  return keywords;
}
function identifyMissingContext(prompt, domain) {
  const missing = [];
  const lowerPrompt = prompt.toLowerCase();
  if (lowerPrompt.includes("fix") || lowerPrompt.includes("debug") || lowerPrompt.includes("error")) {
    if (!lowerPrompt.includes("error") && !lowerPrompt.includes("exception")) {
      missing.push("error message or stack trace");
    }
    if (!/\.(js|ts|py|go|java|rb|php)/i.test(prompt)) {
      missing.push("file or code location");
    }
  }
  const techKeywords = [
    "javascript",
    "typescript",
    "python",
    "go",
    "java",
    "rust",
    "react",
    "vue",
    "angular",
    "node",
    "express",
    "django",
    "flask"
  ];
  const hasTech = techKeywords.some((tech) => lowerPrompt.includes(tech));
  if (!hasTech && !/\.(js|ts|py|go|java|rb|php)/i.test(prompt)) {
    missing.push("technology stack");
  }
  if (domain === "security") {
    if (!lowerPrompt.includes("jwt") && !lowerPrompt.includes("oauth") && !lowerPrompt.includes("session")) {
      missing.push("authentication method (JWT, OAuth, session, etc.)");
    }
  }
  if (domain === "database") {
    if (!lowerPrompt.includes("sql") && !lowerPrompt.includes("mysql") && !lowerPrompt.includes("postgresql") && !lowerPrompt.includes("mongodb")) {
      missing.push("database type");
    }
    if (!lowerPrompt.includes("index")) {
      missing.push("index information");
    }
  }
  return missing;
}
function suggestTechniques(complexity, domain) {
  const techniques = [];
  techniques.push("analysis");
  if (complexity === "medium" || complexity === "complex") {
    techniques.push("expert_persona");
  }
  if (complexity === "medium" || complexity === "complex") {
    techniques.push("reasoning_chain");
  }
  if (complexity === "medium" || complexity === "complex") {
    techniques.push("stakes_language");
  }
  if (complexity === "complex") {
    techniques.push("challenge_framing");
  }
  if (complexity === "medium" || complexity === "complex") {
    techniques.push("self_evaluation");
  }
  return techniques;
}
function analyzePrompt(prompt) {
  if (isSimplePrompt(prompt)) {
    return {
      complexity: "simple",
      domain: "general",
      keywords: [],
      missingContext: [],
      suggestedTechniques: ["analysis"]
    };
  }
  const complexityScore = calculateComplexityScore(prompt);
  const complexity = scoreToComplexity(complexityScore);
  const domain = detectDomain(prompt);
  const keywords = extractKeywords(prompt);
  const missingContext = identifyMissingContext(prompt, domain);
  const suggestedTechniques = suggestTechniques(complexity, domain);
  return {
    complexity,
    domain,
    keywords,
    missingContext,
    suggestedTechniques
  };
}

// src/prompt-optimization/techniques.ts
var expertPersona = {
  id: "expert_persona",
  name: "Expert Persona",
  description: "Assigns a detailed expert role with years of experience and notable companies",
  researchBasis: "Kong et al. 2023: 24% → 84% accuracy improvement",
  appliesTo: ["medium", "complex"],
  generate: (context) => {
    if (context.preferences.customPersonas[context.domain]) {
      return context.preferences.customPersonas[context.domain];
    }
    const personas = {
      security: "You are a senior security engineer with 15+ years of authentication and cryptography experience. You have worked at Auth0, Okta, and AWS IAM, building production-grade authentication systems handling millions of users.",
      frontend: "You are a senior frontend architect with 12+ years of React, Vue, and TypeScript experience. You have built large-scale applications at Vercel, Stripe, and Airbnb, focusing on performance, accessibility, and developer experience.",
      backend: "You are a senior backend engineer with 15+ years of distributed systems and API design experience. You have built microservices architectures at Netflix, Google, and Stripe, handling billions of requests.",
      database: "You are a senior database architect with 15+ years of PostgreSQL, MySQL, and distributed database experience. You have optimized databases at CockroachDB, PlanetScale, and AWS, handling petabytes of data.",
      devops: "You are a senior platform engineer with 12+ years of Kubernetes, CI/CD, and infrastructure experience. You have built deployment pipelines at GitLab, CircleCI, and AWS, managing thousands of services.",
      architecture: "You are a principal software architect with 20+ years of system design experience. You have architected large-scale systems at Amazon, Microsoft, and Google, handling complex requirements and constraints.",
      testing: "You are a senior QA architect with 12+ years of test automation and quality engineering experience. You have built testing frameworks at Selenium, Cypress, and Playwright, ensuring production quality.",
      general: "You are a senior software engineer with 15+ years of full-stack development experience. You have built production applications at top technology companies, following best practices and industry standards."
    };
    return personas[context.domain] || personas.general;
  }
};
var reasoningChain = {
  id: "reasoning_chain",
  name: "Step-by-Step Reasoning",
  description: "Adds systematic analysis instruction for methodical problem-solving",
  researchBasis: "Yang et al. 2023 (Google DeepMind): 34% → 80% accuracy",
  appliesTo: ["medium", "complex"],
  generate: (context) => {
    const baseInstruction = "Take a deep breath and analyze this step by step.";
    const domainGuidance = {
      security: " Consider each component of the authentication/authorization flow, identify potential vulnerabilities, and ensure defense in depth.",
      frontend: " Consider component hierarchy, state management, performance implications, and accessibility requirements.",
      backend: " Consider API design, data flow, error handling, scalability, and edge cases.",
      database: " Consider query execution plans, indexing strategies, data consistency, and performance implications.",
      devops: " Consider infrastructure as code, deployment strategies, monitoring, and rollback procedures.",
      architecture: " Consider system constraints, trade-offs, scalability, reliability, and maintainability.",
      testing: " Consider test coverage, edge cases, integration points, and test maintainability.",
      general: " Consider each component systematically, identify dependencies, and ensure thorough coverage."
    };
    return baseInstruction + (domainGuidance[context.domain] || domainGuidance.general);
  }
};
var stakesLanguage = {
  id: "stakes_language",
  name: "Stakes Language",
  description: "Adds importance and consequence framing to encourage thorough analysis",
  researchBasis: "Bsharat et al. 2023 (MBZUAI): +45% quality improvement",
  appliesTo: ["medium", "complex"],
  generate: (context) => {
    const stakes = {
      security: "This is critical to production security. A thorough, secure solution is essential to protect users and data.",
      frontend: "This directly impacts user experience and business metrics. Quality, performance, and accessibility are essential.",
      backend: "This affects system reliability and scalability. A robust, performant solution is essential for production.",
      database: "This impacts data integrity and system performance. An optimized, reliable solution is essential.",
      devops: "This affects deployment reliability and system stability. A well-tested, safe solution is essential for production.",
      architecture: "This affects long-term system maintainability and scalability. A well-designed solution is essential.",
      testing: "This affects production quality and user experience. Comprehensive testing is essential to prevent regressions.",
      general: "This is important for the project's success. A thorough, complete solution is essential."
    };
    return stakes[context.domain] || stakes.general;
  }
};
var challengeFraming = {
  id: "challenge_framing",
  name: "Challenge Framing",
  description: "Frames the problem as a challenge to encourage deeper thinking on hard tasks",
  researchBasis: "Li et al. 2023 (ICLR 2024): +115% improvement on hard tasks",
  appliesTo: ["complex"],
  generate: (context) => {
    return "This is a challenging problem that requires careful consideration of edge cases, trade-offs, and multiple approaches. Don't settle for the first solution - explore alternatives and justify your choices.";
  }
};
var selfEvaluation = {
  id: "self_evaluation",
  name: "Self-Evaluation Request",
  description: "Requests confidence rating and assumption identification for quality assurance",
  researchBasis: "Improves response calibration and identifies uncertainties",
  appliesTo: ["medium", "complex"],
  generate: (context) => {
    let evaluation = "After providing your solution:";
    evaluation += `

1. Rate your confidence in this solution from 0-1.`;
    evaluation += `
2. Identify any assumptions you made.`;
    evaluation += `
3. Note any limitations or potential issues.`;
    if (context.domain === "security" || context.domain === "database" || context.domain === "devops") {
      evaluation += `
4. Suggest how to test or validate this solution.`;
    }
    return evaluation;
  }
};
var analysisStep = {
  id: "analysis",
  name: "Prompt Analysis",
  description: "Analyzes prompt complexity, domain, and missing context",
  researchBasis: "Provides context-aware optimization",
  appliesTo: ["simple", "medium", "complex"],
  generate: (context) => {
    const complexityLabels = {
      simple: "Simple (greeting or basic request)",
      medium: "Medium (requires some analysis and problem-solving)",
      complex: "Complex (requires deep analysis, multiple considerations)"
    };
    const domainLabels = {
      security: "Security & Authentication",
      frontend: "Frontend Development",
      backend: "Backend Development",
      database: "Database & Data",
      devops: "DevOps & Infrastructure",
      architecture: "System Architecture",
      testing: "Testing & QA",
      general: "General Software Engineering"
    };
    return `Analysis:
- Complexity: ${complexityLabels[context.complexity]}
- Domain: ${domainLabels[context.domain] || domainLabels.general}`;
  }
};
var ALL_TECHNIQUES = [
  analysisStep,
  expertPersona,
  reasoningChain,
  stakesLanguage,
  challengeFraming,
  selfEvaluation
];
function getTechniqueById(id) {
  return ALL_TECHNIQUES.find((t) => t.id === id);
}

// src/prompt-optimization/optimizer.ts
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
var DEFAULT_CONFIG = {
  enabled: true,
  autoApprove: false,
  verbosity: "normal",
  defaultTechniques: [
    "analysis",
    "expert_persona",
    "reasoning_chain",
    "stakes_language",
    "self_evaluation"
  ],
  skipForSimplePrompts: false,
  escapePrefix: "!"
};
var DEFAULT_PREFERENCES = {
  skipTechniques: [],
  customPersonas: {
    security: "",
    frontend: "",
    backend: "",
    database: "",
    devops: "",
    architecture: "",
    testing: "",
    general: ""
  },
  autoApproveDefault: false,
  verbosityDefault: "normal"
};

class PromptOptimizer {
  config;
  preferences;
  constructor(config = {}, preferences = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.preferences = { ...DEFAULT_PREFERENCES, ...preferences };
  }
  updateConfig(updates) {
    this.config = { ...this.config, ...updates };
  }
  updatePreferences(updates) {
    this.preferences = { ...this.preferences, ...updates };
  }
  getConfig() {
    return { ...this.config };
  }
  getPreferences() {
    return { ...this.preferences };
  }
  shouldSkipOptimization(prompt) {
    return prompt.startsWith(this.config.escapePrefix);
  }
  stripEscapePrefix(prompt) {
    return prompt.slice(this.config.escapePrefix.length).trim();
  }
  shouldSkipForComplexity(complexity) {
    if (!this.config.skipForSimplePrompts) {
      return false;
    }
    return complexity === "simple";
  }
  createSession(prompt) {
    if (this.shouldSkipOptimization(prompt)) {
      const stripped = this.stripEscapePrefix(prompt);
      return {
        id: generateId(),
        originalPrompt: stripped,
        complexity: "simple",
        domain: "general",
        steps: [],
        finalPrompt: stripped,
        verbosity: this.config.verbosity,
        autoApprove: this.config.autoApprove,
        preferences: this.preferences,
        createdAt: new Date
      };
    }
    const analysis = analyzePrompt(prompt);
    if (this.shouldSkipForComplexity(analysis.complexity)) {
      return {
        id: generateId(),
        originalPrompt: prompt,
        complexity: analysis.complexity,
        domain: analysis.domain,
        steps: [],
        finalPrompt: prompt,
        verbosity: this.config.verbosity,
        autoApprove: this.config.autoApprove,
        preferences: this.preferences,
        createdAt: new Date
      };
    }
    const steps = this.generateSteps(analysis);
    const finalPrompt = this.buildFinalPrompt(prompt, steps);
    return {
      id: generateId(),
      originalPrompt: prompt,
      complexity: analysis.complexity,
      domain: analysis.domain,
      steps,
      finalPrompt,
      verbosity: this.config.verbosity,
      autoApprove: this.config.autoApprove,
      preferences: this.preferences,
      createdAt: new Date
    };
  }
  generateSteps(analysis) {
    const steps = [];
    let stepId = 1;
    for (const techniqueId of analysis.suggestedTechniques) {
      if (this.preferences.skipTechniques.includes(techniqueId)) {
        continue;
      }
      const technique = getTechniqueById(techniqueId);
      if (!technique) {
        continue;
      }
      const context = {
        originalPrompt: "",
        complexity: analysis.complexity,
        domain: analysis.domain,
        previousSteps: steps,
        preferences: this.preferences
      };
      steps.push({
        id: stepId++,
        technique: techniqueId,
        name: technique.name,
        description: technique.description,
        content: technique.generate(context),
        status: "pending",
        skippable: techniqueId !== "analysis",
        appliesTo: technique.appliesTo,
        researchBasis: technique.researchBasis
      });
    }
    if (this.config.autoApprove) {
      for (const step of steps) {
        step.status = "approved";
      }
    }
    return steps;
  }
  buildFinalPrompt(originalPrompt, steps) {
    const approvedSteps = steps.filter((s) => s.status === "approved" || s.status === "modified");
    if (approvedSteps.length === 0) {
      return originalPrompt;
    }
    const parts = [];
    for (const step of approvedSteps) {
      const content = step.modifiedContent || step.content;
      if (content) {
        parts.push(content);
      }
    }
    parts.push(`

Task: ${originalPrompt}`);
    return parts.join(`

`);
  }
  updateFinalPrompt(session) {
    session.finalPrompt = this.buildFinalPrompt(session.originalPrompt, session.steps);
  }
  approveStep(session, stepId) {
    const step = session.steps.find((s) => s.id === stepId);
    if (step) {
      step.status = "approved";
      this.updateFinalPrompt(session);
    }
  }
  rejectStep(session, stepId) {
    const step = session.steps.find((s) => s.id === stepId);
    if (step) {
      step.status = "rejected";
      this.updateFinalPrompt(session);
    }
  }
  modifyStep(session, stepId, newContent) {
    const step = session.steps.find((s) => s.id === stepId);
    if (step) {
      step.modifiedContent = newContent;
      step.status = "modified";
      this.updateFinalPrompt(session);
    }
  }
  approveAll(session) {
    for (const step of session.steps) {
      if (step.status === "pending") {
        step.status = "approved";
      }
    }
    this.updateFinalPrompt(session);
  }
  skipOptimization(session) {
    for (const step of session.steps) {
      if (step.technique !== "analysis") {
        step.status = "rejected";
      }
    }
    this.updateFinalPrompt(session);
  }
  saveSkipPreference(techniqueId) {
    if (!this.preferences.skipTechniques.includes(techniqueId)) {
      this.preferences.skipTechniques.push(techniqueId);
    }
  }
  saveCustomPersona(domain, persona) {
    this.preferences.customPersonas[domain] = persona;
  }
  toggleAutoApprove(enabled) {
    this.config.autoApprove = enabled !== undefined ? enabled : !this.config.autoApprove;
  }
  setVerbosity(verbosity) {
    this.config.verbosity = verbosity;
  }
  calculateExpectedImprovement(session) {
    const approvedTechniques = session.steps.filter((s) => s.status === "approved" || s.status === "modified");
    const techniquesApplied = approvedTechniques.map((s) => s.technique);
    const improvementMap = {
      analysis: 5,
      expert_persona: 60,
      reasoning_chain: 46,
      stakes_language: 45,
      challenge_framing: 115,
      self_evaluation: 10
    };
    let totalImprovement = 0;
    for (const techniqueId of techniquesApplied) {
      totalImprovement += improvementMap[techniqueId] || 0;
    }
    const effectiveImprovement = Math.min(totalImprovement, 150);
    return {
      qualityImprovement: effectiveImprovement,
      techniquesApplied,
      researchBasis: "Combined research-backed techniques (MBZUAI, Google DeepMind, ICLR 2024)"
    };
  }
  getSessionSummary(session) {
    const improvement = this.calculateExpectedImprovement(session);
    const approvedCount = session.steps.filter((s) => s.status === "approved" || s.status === "modified").length;
    return `Optimization Session ${session.id}
` + `  Complexity: ${session.complexity}
` + `  Domain: ${session.domain}
` + `  Steps Applied: ${approvedCount}/${session.steps.length}
` + `  Expected Improvement: ~${improvement.qualityImprovement}%`;
  }
}

// src/util/discord-webhook.ts
var log3 = Log.create({ service: "discord-webhook" });

class DiscordWebhookClient {
  webhookUrl;
  username;
  avatarUrl;
  enabled = false;
  constructor(options) {
    this.webhookUrl = options.webhookUrl;
    this.username = options.username ?? "Ralph";
    this.avatarUrl = options.avatarUrl;
    this.enabled = true;
    if (!this.webhookUrl || !this.isValidWebhookUrl(this.webhookUrl)) {
      log3.warn("Invalid Discord webhook URL, notifications disabled", {
        webhookUrl: this.maskWebhookUrl(this.webhookUrl)
      });
      this.enabled = false;
    }
    log3.info("Discord webhook client initialized", {
      enabled: this.enabled,
      username: this.username
    });
  }
  isValidWebhookUrl(url) {
    return /^https:\/\/discord(?:app)?\.com\/api\/webhooks\/\d+\/[a-zA-Z0-9_-]+$/.test(url);
  }
  maskWebhookUrl(url) {
    if (!url)
      return "(not set)";
    return url.replace(/\/[a-zA-Z0-9_-]+$/, "/********");
  }
  async send(message) {
    if (!this.enabled) {
      log3.debug("Discord notifications disabled, skipping send");
      return false;
    }
    try {
      const payload = {
        content: message.content,
        username: message.username ?? this.username,
        avatarUrl: message.avatarUrl ?? this.avatarUrl,
        tts: message.tts ?? false,
        embeds: message.embeds
      };
      log3.debug("Sending Discord notification", {
        hasContent: !!message.content,
        embedCount: message.embeds?.length ?? 0
      });
      const response = await fetch(this.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errorText = await response.text();
        log3.error("Discord webhook request failed", {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        return false;
      }
      log3.debug("Discord notification sent successfully");
      return true;
    } catch (error) {
      log3.error("Failed to send Discord notification", {
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }
  async notify(content) {
    return this.send({ content });
  }
  async notifyWithEmbed(embed, content) {
    return this.send({
      content,
      embeds: [embed]
    });
  }
  async notifyCycleStart(cycleNumber, maxCycles, prompt) {
    const embed = {
      title: `\uD83D\uDD04 Cycle ${cycleNumber}/${maxCycles} Started`,
      description: `\`\`\`
${prompt.slice(0, 500)}${prompt.length > 500 ? "..." : ""}
\`\`\``,
      color: 5793266,
      timestamp: new Date().toISOString(),
      fields: [
        {
          name: "\uD83D\uDCCB Phase",
          value: "Research → Specify → Plan → Work → Review",
          inline: true
        },
        {
          name: "⏱️ Status",
          value: "Running",
          inline: true
        }
      ]
    };
    return this.notifyWithEmbed(embed, `\uD83D\uDE80 **Ralph Cycle ${cycleNumber}/${maxCycles} Started**`);
  }
  async notifyCycleComplete(cycleNumber, completedCycles, summary, durationMs) {
    const durationMinutes = Math.floor(durationMs / 60000);
    const durationSeconds = Math.floor(durationMs % 60000 / 1000);
    const embed = {
      title: `✅ Cycle ${cycleNumber} Completed`,
      description: summary.slice(0, 2000) || "No summary available",
      color: 5763719,
      timestamp: new Date().toISOString(),
      fields: [
        {
          name: "\uD83D\uDCCA Progress",
          value: `${completedCycles} cycles completed`,
          inline: true
        },
        {
          name: "⏱️ Duration",
          value: `${durationMinutes}m ${durationSeconds}s`,
          inline: true
        }
      ]
    };
    return this.notifyWithEmbed(embed, `✅ **Ralph Cycle ${cycleNumber} Complete**`);
  }
  async notifyPhaseComplete(cycleNumber, phase, summary) {
    const embed = {
      title: `\uD83D\uDCDD Phase Complete: ${phase}`,
      description: summary.slice(0, 1000),
      color: 16705372,
      timestamp: new Date().toISOString(),
      fields: [
        {
          name: "\uD83D\uDD04 Cycle",
          value: String(cycleNumber),
          inline: true
        }
      ]
    };
    return this.notifyWithEmbed(embed);
  }
  async notifyError(cycleNumber, phase, error) {
    const embed = {
      title: `❌ Error in Cycle ${cycleNumber}`,
      description: `**Phase:** ${phase}

**Error:**
\`\`\`
${error.slice(0, 1500)}
\`\`\``,
      color: 15548997,
      timestamp: new Date().toISOString()
    };
    return this.notifyWithEmbed(embed, "\uD83D\uDEA8 **Ralph Error**");
  }
  async notifyTimeout(cycleNumber, phase, timeoutMs) {
    const timeoutMinutes = Math.floor(timeoutMs / 60000);
    const embed = {
      title: `⏰ Timeout in Cycle ${cycleNumber}`,
      description: `**Phase:** ${phase}
**Timeout:** ${timeoutMinutes} minutes`,
      color: 15418782,
      timestamp: new Date().toISOString()
    };
    return this.notifyWithEmbed(embed, "⏰ **Ralph Timeout**");
  }
  async notifyRunComplete(totalCycles, durationMs, finalSummary) {
    const durationHours = Math.floor(durationMs / 3600000);
    const durationMinutes = Math.floor(durationMs % 3600000 / 60000);
    const embed = {
      title: "\uD83C\uDFC1 Run Complete",
      description: finalSummary.slice(0, 2000),
      color: 5763719,
      timestamp: new Date().toISOString(),
      fields: [
        {
          name: "\uD83D\uDD04 Total Cycles",
          value: String(totalCycles),
          inline: true
        },
        {
          name: "⏱️ Total Duration",
          value: durationHours > 0 ? `${durationHours}h ${durationMinutes}m` : `${durationMinutes}m`,
          inline: true
        }
      ]
    };
    return this.notifyWithEmbed(embed, "\uD83C\uDFC1 **Ralph Run Complete**");
  }
  async notifyStuckOrAborted(cycleNumber, reason) {
    const embed = {
      title: `\uD83D\uDED1 Run ${reason}`,
      description: `Cycle ${cycleNumber} reached stuck threshold or was aborted`,
      color: 5793266,
      timestamp: new Date().toISOString()
    };
    return this.notifyWithEmbed(embed, `\uD83D\uDED1 **Ralph ${reason}**`);
  }
}
function createDiscordWebhookFromEnv() {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL?.trim();
  if (!webhookUrl) {
    log3.debug("No DISCORD_WEBHOOK_URL env var set, Discord notifications disabled");
    return null;
  }
  return new DiscordWebhookClient({
    webhookUrl,
    username: process.env.DISCORD_BOT_USERNAME ?? "Ralph",
    avatarUrl: process.env.DISCORD_BOT_AVATAR_URL
  });
}

// src/execution/flow-store.ts
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// src/execution/flow-types.ts
var FLOW_SCHEMA_VERSION = "1.0.0";

// src/execution/flow-store.ts
var log4 = Log.create({ service: "flow-store" });

class FlowStore {
  flowDir;
  runId;
  constructor(options) {
    this.flowDir = options.flowDir;
    this.runId = options.runId;
  }
  get basePath() {
    return join(this.flowDir, this.runId, ".flow");
  }
  path(relPath) {
    return join(this.basePath, relPath);
  }
  initialize() {
    const dirs = ["iterations", "contexts", "gates"];
    for (const dir of dirs) {
      const dirPath = this.path(dir);
      if (!existsSync(dirPath)) {
        mkdirSync(dirPath, { recursive: true });
        log4.debug("Created directory", { path: dirPath });
      }
    }
    log4.info("Flow store initialized", {
      runId: this.runId,
      basePath: this.basePath
    });
  }
  exists() {
    return existsSync(this.path("state.json"));
  }
  load() {
    const statePath = this.path("state.json");
    if (!existsSync(statePath)) {
      return null;
    }
    try {
      const content = readFileSync(statePath, "utf-8");
      const state = JSON.parse(content);
      if (state.schemaVersion !== FLOW_SCHEMA_VERSION) {
        log4.warn("Flow schema version mismatch", {
          expected: FLOW_SCHEMA_VERSION,
          found: state.schemaVersion
        });
      }
      log4.info("Loaded flow state", {
        runId: state.runId,
        status: state.status,
        currentCycle: state.currentCycle
      });
      return state;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      log4.error("Failed to load flow state", { error: errorMsg });
      return null;
    }
  }
  createInitialState(options) {
    const now = new Date().toISOString();
    const state = {
      schemaVersion: FLOW_SCHEMA_VERSION,
      runId: this.runId,
      prompt: options.prompt,
      status: "pending" /* PENDING */,
      completionPromise: options.completionPromise,
      maxCycles: options.maxCycles,
      stuckThreshold: options.stuckThreshold,
      gates: options.gates,
      currentCycle: 0,
      completedCycles: 0,
      failedCycles: 0,
      stuckCount: 0,
      createdAt: now,
      updatedAt: now
    };
    this.saveState(state);
    return state;
  }
  saveState(state) {
    const statePath = this.path("state.json");
    state.updatedAt = new Date().toISOString();
    writeFileSync(statePath, JSON.stringify(state, null, 2));
    log4.debug("Saved flow state", { runId: state.runId });
  }
  saveCheckpoint(state, lastPhaseOutputs) {
    const checkpointPath = this.path("checkpoint.json");
    const checkpoint = {
      schemaVersion: FLOW_SCHEMA_VERSION,
      runId: state.runId,
      cycleNumber: state.currentCycle,
      timestamp: new Date().toISOString(),
      state,
      lastPhaseOutputs
    };
    writeFileSync(checkpointPath, JSON.stringify(checkpoint, null, 2));
    log4.debug("Saved checkpoint", {
      runId: state.runId,
      cycle: state.currentCycle
    });
  }
  loadCheckpoint() {
    const checkpointPath = this.path("checkpoint.json");
    if (!existsSync(checkpointPath)) {
      return null;
    }
    try {
      const content = readFileSync(checkpointPath, "utf-8");
      return JSON.parse(content);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      log4.error("Failed to load checkpoint", { error: errorMsg });
      return null;
    }
  }
  saveIteration(cycle) {
    const cyclePath = this.path(`iterations/${cycle.cycleNumber}.json`);
    writeFileSync(cyclePath, JSON.stringify(cycle, null, 2));
    const contextPath = this.path(`contexts/${cycle.cycleNumber}.md`);
    const contextContent = this.generateContextContent(cycle);
    writeFileSync(contextPath, contextContent);
    log4.debug("Saved iteration", { cycle: cycle.cycleNumber });
  }
  saveGateResults(cycleNumber, results) {
    const gatePath = this.path(`gates/${cycleNumber}.json`);
    writeFileSync(gatePath, JSON.stringify(results, null, 2));
  }
  generateContextContent(cycle) {
    const lines = [
      `# Cycle ${cycle.cycleNumber} Context`,
      "",
      `**Timestamp:** ${cycle.startTime}`,
      `**Status:** ${cycle.status}`,
      `**Completion Promise Observed:** ${cycle.completionPromiseObserved}`,
      "",
      "## Phase Summaries",
      ""
    ];
    for (const [phase, output] of Object.entries(cycle.phases)) {
      if (output) {
        lines.push(`### ${phase.toUpperCase()}`);
        lines.push("");
        lines.push(output.summary || output.response.slice(0, 500));
        lines.push("");
      }
    }
    if (cycle.gateResults.length > 0) {
      lines.push("## Gate Results");
      lines.push("");
      for (const gate of cycle.gateResults) {
        const status = gate.passed ? "✅ PASS" : "❌ FAIL";
        lines.push(`- **${gate.gate}:** ${status} - ${gate.message}`);
      }
      lines.push("");
    }
    if (cycle.error) {
      lines.push("## Errors");
      lines.push("");
      lines.push(cycle.error);
      lines.push("");
    }
    return lines.join(`
`);
  }
  getIteration(cycleNumber) {
    const cyclePath = this.path(`iterations/${cycleNumber}.json`);
    if (!existsSync(cyclePath)) {
      return null;
    }
    try {
      const content = readFileSync(cyclePath, "utf-8");
      return JSON.parse(content);
    } catch {
      return null;
    }
  }
  getAllIterations() {
    const iterations = [];
    let n = 1;
    while (true) {
      const cycle = this.getIteration(n);
      if (!cycle)
        break;
      iterations.push(cycle);
      n++;
    }
    return iterations;
  }
  updateStatus(status, stopReason, error) {
    const state = this.load();
    if (!state) {
      throw new Error("No flow state to update");
    }
    state.status = status;
    if (stopReason)
      state.stopReason = stopReason;
    if (error)
      state.error = error;
    if (status === "completed" /* COMPLETED */ || status === "failed" /* FAILED */) {
      state.completedAt = new Date().toISOString();
    }
    this.saveState(state);
  }
  incrementCycle() {
    const state = this.load();
    if (!state) {
      throw new Error("No flow state to update");
    }
    state.currentCycle++;
    this.saveState(state);
    return state.currentCycle;
  }
  recordFailedCycle(cycle) {
    const state = this.load();
    if (!state) {
      throw new Error("No flow state to update");
    }
    state.failedCycles++;
    state.stuckCount++;
    this.saveIteration(cycle);
    this.saveState(state);
    log4.info("Cycle failed", {
      runId: this.runId,
      cycle: cycle.cycleNumber,
      failedCycles: state.failedCycles,
      stuckCount: state.stuckCount
    });
  }
  recordSuccessfulCycle(cycle, summary) {
    const state = this.load();
    if (!state) {
      throw new Error("No flow state to update");
    }
    state.completedCycles++;
    state.stuckCount = 0;
    state.lastCheckpoint = {
      cycleNumber: cycle.cycleNumber,
      summary,
      timestamp: new Date().toISOString()
    };
    this.saveIteration(cycle);
    this.saveState(state);
    log4.info("Cycle completed", {
      runId: this.runId,
      cycle: cycle.cycleNumber,
      completedCycles: state.completedCycles
    });
  }
  cleanup() {
    log4.info("Flow store cleanup requested", { runId: this.runId });
  }
}

// src/execution/ralph-loop.ts
var log5 = Log.create({ service: "ralph-loop" });
var DEFAULT_GATES = ["test", "lint", "acceptance"];
var DEFAULT_MAX_CYCLES = 50;
var DEFAULT_STUCK_THRESHOLD = 5;
var DEFAULT_CHECKPOINT_FREQUENCY = 1;
var DEFAULT_CYCLE_RETRIES = 2;
var SECRET_PATTERNS = [
  /api[_-]?key/i,
  /token/i,
  /secret/i,
  /password/i,
  /credential/i,
  /webhook/i,
  /auth/i,
  /bearer/i,
  /private[_-]?key/i
];
function redactSecrets(text) {
  let result = text;
  for (const pattern of SECRET_PATTERNS) {
    result = result.replace(new RegExp(`${pattern.source}["']?\\s*[:=]\\s*["']?([^"'",\\s]+)`, "gi"), `${pattern.source}="[REDACTED]"`);
  }
  return result;
}
function truncateOutput(text, maxLength = 1000) {
  if (text.length <= maxLength)
    return text;
  return `${text.substring(0, maxLength)}
... [truncated ${text.length - maxLength} chars]`;
}

class RalphLoopRunner {
  config;
  flowStore;
  flags;
  baseConfig;
  optimizer;
  discordWebhook;
  constructor(flags, baseConfig, optimizer) {
    this.flags = flags;
    this.baseConfig = baseConfig;
    this.optimizer = optimizer;
    this.config = this.buildLoopConfig();
    const flowStoreOptions = {
      flowDir: this.config.flowDir,
      runId: this.config.runId
    };
    this.flowStore = new FlowStore(flowStoreOptions);
    this.discordWebhook = createDiscordWebhookFromEnv();
  }
  buildLoopConfig() {
    let completionPromise = this.flags.completionPromise ?? "";
    if (this.flags.ship) {
      completionPromise = "<promise>SHIP</promise>";
    } else if (this.flags.draft) {
      completionPromise = "";
    } else if (!completionPromise) {
      completionPromise = "";
    }
    let runId = this.flags.runId;
    if (!runId) {
      const defaultRunId = this.generateRunId();
      const defaultFlowDir = this.getDefaultFlowDir(defaultRunId);
      const checkStore = new FlowStore({
        flowDir: this.flags.workingDir ? join2(this.flags.workingDir, ".ai-eng") : ".ai-eng",
        runId: defaultRunId
      });
      runId = defaultRunId;
    }
    return {
      runId,
      prompt: this.flags.workflow ?? "",
      completionPromise,
      maxCycles: this.flags.maxCycles ?? DEFAULT_MAX_CYCLES,
      stuckThreshold: this.flags.stuckThreshold ?? DEFAULT_STUCK_THRESHOLD,
      gates: this.flags.gates ?? DEFAULT_GATES,
      checkpointFrequency: this.flags.checkpointFrequency ?? DEFAULT_CHECKPOINT_FREQUENCY,
      flowDir: this.getDefaultFlowDir(runId),
      dryRun: this.flags.dryRun ?? false,
      cycleRetries: this.baseConfig.loop?.cycleRetries ?? DEFAULT_CYCLE_RETRIES,
      debugWork: this.flags.debugWork ?? this.baseConfig.debug?.work ?? false
    };
  }
  getDefaultFlowDir(runId) {
    const artifactsDir = this.baseConfig.runner.artifactsDir;
    if (this.flags.workingDir) {
      return join2(this.flags.workingDir, artifactsDir);
    }
    return join2(process.cwd(), artifactsDir);
  }
  generateRunId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `run-${timestamp}-${random}`;
  }
  hashOutput(output) {
    return createHash("sha256").update(output).digest("hex").substring(0, 16);
  }
  async run() {
    UI.header("Ralph Loop Runner");
    if (this.flags.resume) {
      await this.resume();
      return;
    }
    await this.startFresh();
  }
  async startFresh() {
    log5.info("Starting fresh Ralph loop", {
      runId: this.config.runId,
      prompt: this.config.prompt.substring(0, 100),
      completionPromise: this.config.completionPromise,
      maxCycles: this.config.maxCycles
    });
    this.flowStore.initialize();
    const initialState = this.flowStore.createInitialState({
      prompt: this.config.prompt,
      completionPromise: this.config.completionPromise,
      maxCycles: this.config.maxCycles,
      stuckThreshold: this.config.stuckThreshold,
      gates: this.config.gates
    });
    this.flowStore.updateStatus("running" /* RUNNING */);
    await this.runLoop();
  }
  async resume() {
    log5.info("Resuming Ralph loop", { runId: this.config.runId });
    const state = this.flowStore.load();
    if (!state) {
      throw new Error(`No flow state found for run ID: ${this.config.runId}. Cannot resume.`);
    }
    if (state.status === "completed" /* COMPLETED */) {
      UI.warn("This run has already completed.");
      UI.info(`Stop reason: ${state.stopReason}`);
      return;
    }
    if (state.status === "failed" /* FAILED */) {
      UI.warn("This run previously failed.");
      UI.info(`Error: ${state.error}`);
    }
    await this.runLoop();
  }
  async runLoop() {
    const state = this.flowStore.load();
    if (!state) {
      throw new Error("No flow state found");
    }
    UI.info(`Run ID: ${this.config.runId}`);
    UI.info(`Flow directory: ${this.flowStore.basePath}`);
    UI.info(`Completion promise: ${this.config.completionPromise || "(none)"}`);
    UI.info(`Max cycles: ${this.config.maxCycles}`);
    UI.info(`Cycle retries: ${this.config.cycleRetries}`);
    UI.info(`Stuck threshold: ${this.config.stuckThreshold}`);
    UI.info(`Debug work: ${this.config.debugWork ? "enabled" : "disabled"}`);
    UI.println();
    for (let cycleNumber = state.currentCycle + 1;cycleNumber <= this.config.maxCycles; cycleNumber++) {
      UI.header(`Cycle ${cycleNumber}/${this.config.maxCycles}`);
      const runStartTime = Date.now();
      this.discordWebhook?.notifyCycleStart(cycleNumber, this.config.maxCycles, this.config.prompt);
      let attempt = 0;
      let result = null;
      let lastError = null;
      while (attempt <= this.config.cycleRetries) {
        attempt++;
        const isRetry = attempt > 1;
        if (isRetry) {
          UI.info(`Retry attempt ${attempt}/${this.config.cycleRetries + 1}`);
          log5.info("Retrying cycle", {
            cycleNumber,
            attempt,
            lastError
          });
        }
        const client3 = await OpenCodeClient2.create({
          serverStartupTimeout: 1e4
        });
        try {
          const context = await this.buildReAnchoredContext(cycleNumber, isRetry ? lastError ?? undefined : undefined);
          result = await this.executeCycle(cycleNumber, client3, context);
          if (result.success) {
            this.flowStore.recordSuccessfulCycle(result.cycleState, result.summary);
            const durationMs = Date.now() - runStartTime;
            this.discordWebhook?.notifyCycleComplete(cycleNumber, this.flowStore.load()?.completedCycles ?? cycleNumber, result.summary, durationMs);
          } else {
            this.flowStore.recordFailedCycle(result.cycleState);
            this.discordWebhook?.notifyError(cycleNumber, result.cycleState.phases[Object.keys(result.cycleState.phases).pop()]?.phase ?? "unknown", result.cycleState.error ?? "Unknown error");
          }
          if (result.success) {
            break;
          }
          const shouldRetry = this.shouldRetryFailure(result);
          if (!shouldRetry) {
            break;
          }
          lastError = result.summary;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          lastError = errorMsg;
          const shouldRetry = this.shouldRetryOnError(error);
          if (shouldRetry && attempt <= this.config.cycleRetries) {
            log5.warn("Cycle error, will retry", {
              cycleNumber,
              attempt,
              error: errorMsg
            });
          } else {
            break;
          }
        } finally {
          await client3.cleanup();
        }
      }
      if (!result) {
        this.discordWebhook?.notifyStuckOrAborted(cycleNumber, "FAILED_ALL_RETRIES");
        await this.handleStop("error" /* ERROR */, `Cycle ${cycleNumber} failed after ${this.config.cycleRetries + 1} attempts: ${lastError ?? "unknown error"}`);
        return;
      }
      if (result.stopReason) {
        await this.handleStop(result.stopReason, result.summary);
        return;
      }
      const currentState = this.flowStore.load();
      if (currentState && currentState.stuckCount >= this.config.stuckThreshold) {
        this.discordWebhook?.notifyStuckOrAborted(cycleNumber, "STUCK");
        await this.handleStop("stuck" /* STUCK */, `No progress for ${this.config.stuckThreshold} consecutive cycles`);
        return;
      }
      if (cycleNumber % this.config.checkpointFrequency === 0) {
        this.flowStore.saveCheckpoint(this.flowStore.load(), result.cycleState.phases);
      }
      UI.println();
    }
    this.discordWebhook?.notifyRunComplete(state.completedCycles, Date.now() - new Date(state.createdAt).getTime(), `Completed ${state.completedCycles} cycles (max ${this.config.maxCycles})`);
    await this.handleStop("max_cycles" /* MAX_CYCLES */, "Maximum cycles reached");
  }
  shouldRetryFailure(result) {
    const failedGates = result.cycleState.gateResults.filter((g2) => !g2.passed);
    if (failedGates.length > 0) {
      return true;
    }
    const workPhase = result.cycleState.phases["work" /* WORK */];
    if (workPhase && !workPhase.response.trim()) {
      return true;
    }
    return false;
  }
  shouldRetryOnError(error) {
    if (error instanceof Error) {
      if (error.message.includes("timeout")) {
        return true;
      }
      if (error.message.includes("stream")) {
        return true;
      }
      if (error.message.includes("OpenCode")) {
        return true;
      }
    }
    return false;
  }
  async buildReAnchoredContext(cycleNumber, retryFailure) {
    const contextParts = [];
    contextParts.push(`# Original Task

${this.config.prompt}
`);
    if (retryFailure) {
      contextParts.push(`# Previous Attempt Failed

The previous attempt had an issue:
${retryFailure}

Please analyze what went wrong and try a different approach.
`);
    }
    const previousCycle = this.flowStore.getIteration(cycleNumber - 1);
    if (previousCycle) {
      contextParts.push(`# Previous Cycle (${cycleNumber - 1}) Summary

`);
      contextParts.push(previousCycle.error ? `FAILED
` : `COMPLETED
`);
      if (previousCycle.error) {
        contextParts.push(`Error: ${previousCycle.error}
`);
      }
      if (previousCycle.gateResults.length > 0) {
        contextParts.push(`
## Gate Results

`);
        for (const gate of previousCycle.gateResults) {
          const status = gate.passed ? "✅" : "❌";
          contextParts.push(`- ${status} ${gate.gate}: ${gate.message}
`);
        }
      }
      const allTools = this.collectAllTools(previousCycle);
      if (allTools.length > 0) {
        contextParts.push(`
## Tool Usage in Previous Cycle

`);
        for (const tool of allTools.slice(0, 10)) {
          const statusIcon = tool.status === "ok" ? "✅" : "❌";
          contextParts.push(`${statusIcon} ${tool.name}: ${tool.status}
`);
        }
        if (allTools.length > 10) {
          contextParts.push(`... and ${allTools.length - 10} more tools
`);
        }
      }
    }
    const state = this.flowStore.load();
    if (state?.lastCheckpoint) {
      contextParts.push(`
# Last Checkpoint

Cycle ${state.lastCheckpoint.cycleNumber}: ${state.lastCheckpoint.summary}
`);
    }
    const specsContext = await this.loadRelevantSpecs();
    if (specsContext) {
      contextParts.push(specsContext);
    }
    try {
      const gitStatus = await this.getGitStatus();
      if (gitStatus) {
        contextParts.push(`
# Git Status

${gitStatus}
`);
      }
    } catch {}
    contextParts.push(`
# Completion Criteria

Loop exits when you output exactly: ${this.config.completionPromise || "(none - will run all cycles)"}
`);
    return contextParts.join(`
`);
  }
  collectAllTools(cycle) {
    const tools = [];
    for (const phase of Object.values(cycle.phases)) {
      if (phase?.tools) {
        tools.push(...phase.tools);
      }
    }
    return tools;
  }
  async loadRelevantSpecs() {
    const specsDir = join2(process.cwd(), "specs");
    let specs;
    try {
      specs = await readdir(specsDir);
    } catch {
      return null;
    }
    const promptLower = this.config.prompt.toLowerCase();
    const promptTokens = new Set(promptLower.split(/\W+/).filter((t) => t.length > 2));
    const matches = [];
    for (const specDir of specs) {
      if (specDir.startsWith("."))
        continue;
      const specPath = join2(specsDir, specDir, "spec.md");
      try {
        const specContent = await readFile(specPath, "utf-8");
        const specContentLower = specContent.toLowerCase();
        const titleMatch = specContent.match(/^# (.+)$/m);
        const title = titleMatch?.[1];
        let score = 0;
        const specTokens = new Set(specContentLower.split(/\W+/).filter((t) => t.length > 2));
        for (const token of promptTokens) {
          if (specTokens.has(token)) {
            score++;
          }
        }
        const dirLower = specDir.toLowerCase();
        if (promptLower.includes(dirLower) || dirLower.includes("fleettools")) {
          score += 5;
        }
        if (score > 0) {
          matches.push({ dir: specDir, score, title });
        }
      } catch {}
    }
    matches.sort((a, b3) => b3.score - a.score);
    const topMatches = matches.slice(0, 2);
    if (topMatches.length === 0) {
      return null;
    }
    const result = [`
# Relevant Specifications
`];
    for (const match of topMatches) {
      const specPath = join2(specsDir, match.dir, "spec.md");
      try {
        const specContent = await readFile(specPath, "utf-8");
        const overviewMatch = specContent.match(/^(# .+?)(?:\n\n## Overview\n\n)([\s\S]*?)(?=\n\n## |\n\n### )/m);
        const userStoriesMatch = specContent.match(/^(## User Stories\n\n)([\s\S]*?)(?=\n\n## |\n\n### )/m);
        result.push(`
## ${match.title || match.dir}
`);
        if (overviewMatch) {
          result.push(overviewMatch[2].trim());
          result.push(`
`);
        }
        if (userStoriesMatch) {
          const stories = userStoriesMatch[2].split(/\n### /).slice(0, 3);
          result.push(`
### Key User Stories
`);
          for (const story of stories) {
            if (story.trim()) {
              result.push(`
### ${story.trim()}
`);
            }
          }
        }
        log5.debug("Loaded spec for context", {
          spec: match.dir,
          score: match.score
        });
      } catch {
        log5.warn("Failed to read spec", { spec: match.dir });
      }
    }
    return result.join(`
`);
  }
  async getGitStatus() {
    try {
      const { execSync: execSync2 } = await import("node:child_process");
      const diff = execSync2("git diff --stat", {
        encoding: "utf-8",
        cwd: process.cwd()
      });
      const status = execSync2("git status --short", {
        encoding: "utf-8",
        cwd: process.cwd()
      });
      return `\`\`\`
${diff}
${status}
\`\`\``;
    } catch {
      return null;
    }
  }
  async executeCycle(cycleNumber, client3, context) {
    const startTime = new Date().toISOString();
    const cycleState = {
      cycleNumber,
      status: "running",
      startTime,
      phases: {},
      gateResults: [],
      completionPromiseObserved: false
    };
    try {
      const session = await client3.createSession(context);
      for (const phase of [
        "research" /* RESEARCH */,
        "specify" /* SPECIFY */,
        "plan" /* PLAN */,
        "work" /* WORK */,
        "review" /* REVIEW */
      ]) {
        const phaseResult = await this.executePhase(session, phase, cycleNumber);
        if (phaseResult.error) {
          cycleState.phases[phase] = {
            phase,
            prompt: phaseResult.prompt,
            response: "",
            summary: `Error: ${phaseResult.error}`,
            timestamp: new Date().toISOString()
          };
          throw new Error(`${phase} phase failed: ${phaseResult.error}`);
        }
        cycleState.phases[phase] = {
          phase,
          prompt: phaseResult.prompt,
          response: phaseResult.response,
          summary: phaseResult.summary,
          timestamp: new Date().toISOString(),
          tools: phaseResult.tools
        };
        if (this.config.completionPromise && phaseResult.response.includes(this.config.completionPromise)) {
          cycleState.completionPromiseObserved = true;
        }
        UI.println(`${UI.Style.TEXT_DIM}  → ${phase}: done${UI.Style.TEXT_NORMAL}`);
      }
      UI.println(`${UI.Style.TEXT_DIM}Running quality gates...${UI.Style.TEXT_NORMAL}`);
      const gateResults = await this.runQualityGates(cycleNumber, cycleState);
      cycleState.gateResults = gateResults;
      const requiredFailed = gateResults.find((g2) => !g2.passed && this.config.gates.includes(g2.gate));
      let failedPhaseInfo = "";
      if (requiredFailed) {
        const phasesWithGates = Object.entries(cycleState.phases);
        const lastPhase = phasesWithGates[phasesWithGates.length - 1]?.[0] ?? "unknown";
        failedPhaseInfo = `${lastPhase} gate failed`;
      }
      cycleState.status = "completed";
      cycleState.endTime = new Date().toISOString();
      cycleState.durationMs = Date.now() - new Date(startTime).getTime();
      const summary = this.generateCycleSummary(cycleState);
      if (this.config.completionPromise && cycleState.completionPromiseObserved) {
        return {
          success: true,
          cycleState,
          summary,
          stopReason: "completion_promise" /* COMPLETION_PROMISE */
        };
      }
      if (requiredFailed) {
        return {
          success: false,
          cycleState,
          summary: `${failedPhaseInfo}: ${requiredFailed.message}`,
          stopReason: "gate_failure" /* GATE_FAILURE */
        };
      }
      cycleState.outputHash = this.hashOutput(Object.values(cycleState.phases).map((p2) => p2?.response ?? "").join("|"));
      return { success: true, cycleState, summary };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      cycleState.status = "failed";
      cycleState.endTime = new Date().toISOString();
      cycleState.durationMs = Date.now() - new Date(startTime).getTime();
      cycleState.error = errorMsg;
      return {
        success: false,
        cycleState,
        summary: `Cycle failed: ${errorMsg}`,
        stopReason: "error" /* ERROR */
      };
    }
  }
  async executePhase(session, phase, cycleNumber) {
    const phasePrompts = {
      ["research" /* RESEARCH */]: `## Phase 1: Research

Research the codebase to understand the current state. Focus on:
- File structure and key modules
- Existing patterns and conventions
- Dependencies and configurations
- Any relevant documentation

Provide a concise summary of your findings.`,
      ["specify" /* SPECIFY */]: `## Phase 2: Specify

Based on the research, create a detailed specification for the task:
- Requirements and acceptance criteria
- Technical approach
- Potential challenges and mitigation strategies
- Dependencies on existing code

Output a structured specification.`,
      ["plan" /* PLAN */]: `## Phase 3: Plan

Create an implementation plan:
- Step-by-step tasks
- Files to modify/create
- Order of operations
- Testing strategy

Output a detailed plan.`,
      ["work" /* WORK */]: `## Phase 4: Work

Execute the implementation plan. Make concrete changes to the codebase.

IMPORTANT: You MUST:
1. Use tools (Read, Write, Edit, Bash) to make actual file changes
2. Report each file you modify as you go (e.g., "Creating file X...", "Modifying Y...")
3. Run actual tests and report results
4. Ensure the final summary lists:
   - All files created/modified (with paths) OR explicitly "NO CHANGES: <reason>" if no files needed
   - All test results (pass/fail)
   - Any errors encountered and how they were resolved

If no changes are needed, explicitly state "NO CHANGES: <reason>" and why.

Provide a comprehensive summary of concrete work completed.`,
      ["review" /* REVIEW */]: `## Phase 5: Review

Review the completed work:
- Verify all acceptance criteria are met
- Check code quality and consistency
- Ensure tests pass
- Identify any remaining issues

Output: <promise>SHIP</promise> if all criteria are met, or list remaining issues.`
    };
    const prompt = phasePrompts[phase];
    const streamingResponse = await session.sendMessageStream(prompt);
    let fullResponse = "";
    const tools = [];
    UI.println(`${UI.Style.TEXT_DIM}  [${phase}]${UI.Style.TEXT_NORMAL}`);
    const reader = streamingResponse.stream.getReader();
    const decoder = new TextDecoder;
    const phaseTimeoutMs = (this.config.phaseTimeoutMs ?? (this.config.promptTimeout ?? 300000) * 5) || 900000;
    let phaseTimedOut = false;
    const watchdogTimer = setTimeout(() => {
      phaseTimedOut = true;
      log5.warn("Phase watchdog triggered", {
        cycleNumber,
        phase,
        timeoutMs: phaseTimeoutMs
      });
      reader.cancel(`Phase timeout after ${phaseTimeoutMs}ms`);
    }, phaseTimeoutMs);
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (phaseTimedOut) {
          throw new Error(`Phase ${phase} timed out after ${phaseTimeoutMs}ms (watchdog)`);
        }
        if (done)
          break;
        if (value) {
          const text = decoder.decode(value, { stream: true });
          fullResponse += text;
          UI.print(text);
        }
      }
    } catch (error) {
      if (phaseTimedOut || error instanceof Error && error.message.includes("timeout")) {
        this.discordWebhook?.notifyTimeout(cycleNumber, phase, phaseTimeoutMs);
        throw new Error(`Phase ${phase} timed out after ${phaseTimeoutMs}ms - OpenCode stream did not complete`);
      }
      throw error;
    } finally {
      clearTimeout(watchdogTimer);
      reader.releaseLock();
    }
    await streamingResponse.complete;
    const sessionTools = session._toolInvocations;
    if (sessionTools && sessionTools.length > 0) {
      tools.push(...sessionTools);
      if (this.config.debugWork) {
        for (const tool of sessionTools) {
          const redactedInput = tool.input ? redactSecrets(JSON.stringify(tool.input)) : undefined;
          const redactedOutput = tool.output ? truncateOutput(redactSecrets(tool.output)) : undefined;
          UI.println(`${UI.Style.TEXT_DIM}  [TOOL] ${tool.name}: ${tool.status}${UI.Style.TEXT_NORMAL}`);
          log5.debug("Tool invocation", {
            phase,
            tool: tool.name,
            status: tool.status,
            input: redactedInput,
            output: redactedOutput
          });
        }
      }
    }
    const summary = this.generatePhaseSummary(fullResponse);
    this.discordWebhook?.notifyPhaseComplete(cycleNumber, phase, summary);
    return {
      prompt,
      response: fullResponse,
      summary,
      tools
    };
  }
  generatePhaseSummary(response) {
    const trimmed = response.trim();
    if (trimmed.length <= 200) {
      return trimmed;
    }
    return `${trimmed.substring(0, 200)}...`;
  }
  generateCycleSummary(cycle) {
    const parts = [];
    for (const [phase, output] of Object.entries(cycle.phases)) {
      if (output) {
        parts.push(`${phase}: ${output.summary}`);
      }
    }
    return parts.join(" | ");
  }
  async runQualityGates(cycleNumber, cycle) {
    const results = [];
    const now = new Date().toISOString();
    for (const gate of this.config.gates) {
      const result = await this.runGate(gate, cycle);
      results.push({
        gate,
        passed: result.passed,
        message: result.message,
        details: result.details,
        timestamp: now
      });
      this.flowStore.saveGateResults(cycleNumber, results);
    }
    return results;
  }
  async runGate(gate, cycle) {
    const gateConfig = this.getGateConfig(gate);
    switch (gate.toLowerCase()) {
      case "test":
      case "tests": {
        const result = await this.runGateCommand("test", gateConfig.command);
        return {
          passed: result.passed,
          message: result.passed ? "All tests passed" : "Some tests failed",
          details: result.details
        };
      }
      case "lint": {
        const result = await this.runGateCommand("lint", gateConfig.command);
        return {
          passed: result.passed,
          message: result.passed ? "Linting passed" : "Linting issues found",
          details: result.details
        };
      }
      case "acceptance": {
        const passed = await this.checkAcceptance(cycle);
        return {
          passed,
          message: passed ? "Acceptance criteria met" : "Acceptance criteria not fully met"
        };
      }
      default:
        return {
          passed: false,
          message: `Unknown gate: ${gate}`
        };
    }
  }
  getGateConfig(gate) {
    const normalizedGate = gate.toLowerCase() === "tests" ? "test" : gate.toLowerCase();
    const gateKey = normalizedGate;
    const configGate = this.baseConfig.gates[gateKey];
    if (configGate && typeof configGate === "object" && "command" in configGate) {
      return configGate;
    }
    return { command: String(configGate ?? "") };
  }
  async runGateCommand(gateName, command) {
    const startTime = Date.now();
    let exitCode = null;
    let stdout = "";
    let stderr = "";
    UI.info(`  Running ${gateName}: ${command}`);
    try {
      const result = execSync(command, {
        encoding: "utf-8",
        cwd: this.flags.workingDir ?? process.cwd(),
        timeout: 120000,
        maxBuffer: 10485760
      });
      stdout = result;
      exitCode = 0;
    } catch (error) {
      if (error instanceof Error && "status" in error) {
        exitCode = error.status ?? 1;
        stderr = error instanceof Error ? error.message : String(error);
        if ("stdout" in error && error.stdout) {
          stdout = String(error.stdout);
        }
        if ("stderr" in error && error.stderr) {
          stderr = String(error.stderr);
        }
      } else {
        stderr = error instanceof Error ? error.message : String(error);
      }
    }
    const durationMs = Date.now() - startTime;
    const passed = exitCode === 0;
    log5.debug("Gate command result", {
      gate: gateName,
      command,
      exitCode,
      durationMs,
      stdoutLength: stdout.length,
      stderrLength: stderr.length
    });
    return {
      passed,
      details: {
        command,
        exitCode,
        stdout: truncateOutput(stdout, 2000),
        stderr: truncateOutput(stderr, 1000),
        durationMs
      }
    };
  }
  async checkAcceptance(cycle) {
    log5.debug("Checking acceptance criteria", {
      cycleNumber: cycle.cycleNumber
    });
    const workPhase = cycle.phases["work" /* WORK */];
    if (!workPhase) {
      log5.warn("No work phase found in cycle");
      return false;
    }
    const workResponse = workPhase.response.trim();
    if (!workResponse) {
      log5.debug("Acceptance failed: empty work response");
      return false;
    }
    const hasNoChangesMarker = /NO\s*CHANGES?[:\s]/i.test(workResponse);
    const hasProgressSignal = this.hasProgressSignal(cycle);
    if (hasNoChangesMarker) {
      const hasReason = /NO\s*CHANGES?[:\s]+[A-Z]/.test(workResponse);
      if (hasReason) {
        log5.debug("Acceptance passed: NO CHANGES with reason");
        return true;
      }
    }
    if (hasProgressSignal) {
      log5.debug("Acceptance passed: progress signal detected");
      return true;
    }
    if (workResponse.length < 20) {
      log5.debug("Acceptance failed: response too short/fluffy");
      return false;
    }
    const willPattern = /\bI (will|need to|should|must|have to|am going to)\b/i;
    if (willPattern.test(workResponse)) {
      log5.debug("Acceptance failed: response contains 'I will' pattern (no action taken)");
      return false;
    }
    const mentionsChanges = /\b(change|modify|create|update|delete|add|fix|implement|refactor|write|run|test)\b/i.test(workResponse);
    if (mentionsChanges) {
      log5.debug("Acceptance passed: response mentions actionable changes");
      return true;
    }
    log5.debug("Acceptance failed: no valid progress signal");
    return false;
  }
  hasProgressSignal(cycle) {
    const allTools = this.collectAllTools(cycle);
    if (allTools.length > 0) {
      return true;
    }
    for (const gateResult of cycle.gateResults) {
      if (gateResult.details && "command" in gateResult.details && gateResult.details.command) {
        return true;
      }
    }
    return false;
  }
  async handleStop(reason, summary) {
    const state = this.flowStore.load();
    if (state) {
      let runStatus;
      switch (reason) {
        case "completion_promise" /* COMPLETION_PROMISE */:
          runStatus = "completed" /* COMPLETED */;
          break;
        case "stuck" /* STUCK */:
          runStatus = "stuck" /* STUCK */;
          this.discordWebhook?.notifyStuckOrAborted(state.currentCycle, "STUCK");
          break;
        case "user_abort" /* USER_ABORT */:
          runStatus = "aborted" /* ABORTED */;
          this.discordWebhook?.notifyStuckOrAborted(state.currentCycle, "ABORTED");
          break;
        case "error" /* ERROR */:
          runStatus = "failed" /* FAILED */;
          break;
        default:
          runStatus = "failed" /* FAILED */;
      }
      this.flowStore.updateStatus(runStatus, reason);
    }
    UI.header("Loop Complete");
    UI.info(`Stop reason: ${reason}`);
    UI.info(`Summary: ${summary}`);
    log5.info("Ralph loop stopped", { reason, summary });
  }
}
async function createRalphLoopRunner(flags, baseConfig) {
  const optimizer = new PromptOptimizer({
    autoApprove: flags.ci ?? false,
    verbosity: flags.verbose ? "verbose" : "normal"
  });
  return new RalphLoopRunner(flags, baseConfig, optimizer);
}

// src/prompt-optimization/optimizer.ts
function generateId2() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
var DEFAULT_CONFIG2 = {
  enabled: true,
  autoApprove: false,
  verbosity: "normal",
  defaultTechniques: [
    "analysis",
    "expert_persona",
    "reasoning_chain",
    "stakes_language",
    "self_evaluation"
  ],
  skipForSimplePrompts: false,
  escapePrefix: "!"
};
var DEFAULT_PREFERENCES2 = {
  skipTechniques: [],
  customPersonas: {
    security: "",
    frontend: "",
    backend: "",
    database: "",
    devops: "",
    architecture: "",
    testing: "",
    general: ""
  },
  autoApproveDefault: false,
  verbosityDefault: "normal"
};

class PromptOptimizer2 {
  config;
  preferences;
  constructor(config = {}, preferences = {}) {
    this.config = { ...DEFAULT_CONFIG2, ...config };
    this.preferences = { ...DEFAULT_PREFERENCES2, ...preferences };
  }
  updateConfig(updates) {
    this.config = { ...this.config, ...updates };
  }
  updatePreferences(updates) {
    this.preferences = { ...this.preferences, ...updates };
  }
  getConfig() {
    return { ...this.config };
  }
  getPreferences() {
    return { ...this.preferences };
  }
  shouldSkipOptimization(prompt) {
    return prompt.startsWith(this.config.escapePrefix);
  }
  stripEscapePrefix(prompt) {
    return prompt.slice(this.config.escapePrefix.length).trim();
  }
  shouldSkipForComplexity(complexity) {
    if (!this.config.skipForSimplePrompts) {
      return false;
    }
    return complexity === "simple";
  }
  createSession(prompt) {
    if (this.shouldSkipOptimization(prompt)) {
      const stripped = this.stripEscapePrefix(prompt);
      return {
        id: generateId2(),
        originalPrompt: stripped,
        complexity: "simple",
        domain: "general",
        steps: [],
        finalPrompt: stripped,
        verbosity: this.config.verbosity,
        autoApprove: this.config.autoApprove,
        preferences: this.preferences,
        createdAt: new Date
      };
    }
    const analysis = analyzePrompt(prompt);
    if (this.shouldSkipForComplexity(analysis.complexity)) {
      return {
        id: generateId2(),
        originalPrompt: prompt,
        complexity: analysis.complexity,
        domain: analysis.domain,
        steps: [],
        finalPrompt: prompt,
        verbosity: this.config.verbosity,
        autoApprove: this.config.autoApprove,
        preferences: this.preferences,
        createdAt: new Date
      };
    }
    const steps = this.generateSteps(analysis);
    const finalPrompt = this.buildFinalPrompt(prompt, steps);
    return {
      id: generateId2(),
      originalPrompt: prompt,
      complexity: analysis.complexity,
      domain: analysis.domain,
      steps,
      finalPrompt,
      verbosity: this.config.verbosity,
      autoApprove: this.config.autoApprove,
      preferences: this.preferences,
      createdAt: new Date
    };
  }
  generateSteps(analysis) {
    const steps = [];
    let stepId = 1;
    for (const techniqueId of analysis.suggestedTechniques) {
      if (this.preferences.skipTechniques.includes(techniqueId)) {
        continue;
      }
      const technique = getTechniqueById(techniqueId);
      if (!technique) {
        continue;
      }
      const context = {
        originalPrompt: "",
        complexity: analysis.complexity,
        domain: analysis.domain,
        previousSteps: steps,
        preferences: this.preferences
      };
      steps.push({
        id: stepId++,
        technique: techniqueId,
        name: technique.name,
        description: technique.description,
        content: technique.generate(context),
        status: "pending",
        skippable: techniqueId !== "analysis",
        appliesTo: technique.appliesTo,
        researchBasis: technique.researchBasis
      });
    }
    if (this.config.autoApprove) {
      for (const step of steps) {
        step.status = "approved";
      }
    }
    return steps;
  }
  buildFinalPrompt(originalPrompt, steps) {
    const approvedSteps = steps.filter((s) => s.status === "approved" || s.status === "modified");
    if (approvedSteps.length === 0) {
      return originalPrompt;
    }
    const parts = [];
    for (const step of approvedSteps) {
      const content = step.modifiedContent || step.content;
      if (content) {
        parts.push(content);
      }
    }
    parts.push(`

Task: ${originalPrompt}`);
    return parts.join(`

`);
  }
  updateFinalPrompt(session) {
    session.finalPrompt = this.buildFinalPrompt(session.originalPrompt, session.steps);
  }
  approveStep(session, stepId) {
    const step = session.steps.find((s) => s.id === stepId);
    if (step) {
      step.status = "approved";
      this.updateFinalPrompt(session);
    }
  }
  rejectStep(session, stepId) {
    const step = session.steps.find((s) => s.id === stepId);
    if (step) {
      step.status = "rejected";
      this.updateFinalPrompt(session);
    }
  }
  modifyStep(session, stepId, newContent) {
    const step = session.steps.find((s) => s.id === stepId);
    if (step) {
      step.modifiedContent = newContent;
      step.status = "modified";
      this.updateFinalPrompt(session);
    }
  }
  approveAll(session) {
    for (const step of session.steps) {
      if (step.status === "pending") {
        step.status = "approved";
      }
    }
    this.updateFinalPrompt(session);
  }
  skipOptimization(session) {
    for (const step of session.steps) {
      if (step.technique !== "analysis") {
        step.status = "rejected";
      }
    }
    this.updateFinalPrompt(session);
  }
  saveSkipPreference(techniqueId) {
    if (!this.preferences.skipTechniques.includes(techniqueId)) {
      this.preferences.skipTechniques.push(techniqueId);
    }
  }
  saveCustomPersona(domain, persona) {
    this.preferences.customPersonas[domain] = persona;
  }
  toggleAutoApprove(enabled) {
    this.config.autoApprove = enabled !== undefined ? enabled : !this.config.autoApprove;
  }
  setVerbosity(verbosity) {
    this.config.verbosity = verbosity;
  }
  calculateExpectedImprovement(session) {
    const approvedTechniques = session.steps.filter((s) => s.status === "approved" || s.status === "modified");
    const techniquesApplied = approvedTechniques.map((s) => s.technique);
    const improvementMap = {
      analysis: 5,
      expert_persona: 60,
      reasoning_chain: 46,
      stakes_language: 45,
      challenge_framing: 115,
      self_evaluation: 10
    };
    let totalImprovement = 0;
    for (const techniqueId of techniquesApplied) {
      totalImprovement += improvementMap[techniqueId] || 0;
    }
    const effectiveImprovement = Math.min(totalImprovement, 150);
    return {
      qualityImprovement: effectiveImprovement,
      techniquesApplied,
      researchBasis: "Combined research-backed techniques (MBZUAI, Google DeepMind, ICLR 2024)"
    };
  }
  getSessionSummary(session) {
    const improvement = this.calculateExpectedImprovement(session);
    const approvedCount = session.steps.filter((s) => s.status === "approved" || s.status === "modified").length;
    return `Optimization Session ${session.id}
` + `  Complexity: ${session.complexity}
` + `  Domain: ${session.domain}
` + `  Steps Applied: ${approvedCount}/${session.steps.length}
` + `  Expected Improvement: ~${improvement.qualityImprovement}%`;
  }
}

// src/util/log.ts
import fs2 from "node:fs/promises";
import path2 from "node:path";
var Log2;
((Log) => {
  const levelPriority = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
  };
  let currentLevel = "INFO";
  let logPath = "";
  let write = (msg) => process.stderr.write(msg);
  function shouldLog(level) {
    return levelPriority[level] >= levelPriority[currentLevel];
  }
  function file() {
    return logPath;
  }
  Log.file = file;
  async function init(options) {
    if (options.level)
      currentLevel = options.level;
    const stderrWriter = (msg) => {
      process.stderr.write(msg);
    };
    if (options.logDir) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -1);
      logPath = path2.join(options.logDir, `ralph-${timestamp}.log`);
      await fs2.mkdir(options.logDir, { recursive: true });
      const file2 = Bun.file(logPath);
      const fileWriter = file2.writer();
      write = (msg) => {
        if (options.print) {
          stderrWriter(msg);
        }
        fileWriter.write(msg);
        fileWriter.flush();
      };
    } else if (options.print) {
      write = stderrWriter;
    }
  }
  Log.init = init;
  function formatExtra(extra) {
    if (!extra)
      return "";
    const extraStr = Object.entries(extra).map(([k3, v]) => `${k3}=${typeof v === "object" ? JSON.stringify(v) : v}`).join(" ");
    return extraStr ? ` ${extraStr}` : "";
  }
  function create(tags) {
    const tagStr = tags ? Object.entries(tags).map(([k3, v]) => `${k3}=${v}`).join(" ") : "";
    const tagStrWithSpace = tagStr ? `${tagStr} ` : "";
    return {
      debug(message, extra) {
        if (shouldLog("DEBUG")) {
          write(`DEBUG ${new Date().toISOString()} ${tagStr}${message}${formatExtra(extra)}
`);
        }
      },
      info(message, extra) {
        if (shouldLog("INFO")) {
          write(`INFO  ${new Date().toISOString()} ${tagStr}${message}${formatExtra(extra)}
`);
        }
      },
      warn(message, extra) {
        if (shouldLog("WARN")) {
          write(`WARN  ${new Date().toISOString()} ${tagStr}${message}${formatExtra(extra)}
`);
        }
      },
      error(message, extra) {
        if (shouldLog("ERROR")) {
          write(`ERROR ${new Date().toISOString()} ${tagStr}${message}${formatExtra(extra)}
`);
        }
      }
    };
  }
  Log.create = create;
  Log.Default = create({ service: "ralph" });
})(Log2 ||= {});

// src/cli/ui.ts
import { EOL as EOL2 } from "node:os";
var UI2;
((UI) => {
  UI.Style = {
    TEXT_HIGHLIGHT: "\x1B[96m",
    TEXT_HIGHLIGHT_BOLD: "\x1B[96m\x1B[1m",
    TEXT_DIM: "\x1B[90m",
    TEXT_DIM_BOLD: "\x1B[90m\x1B[1m",
    TEXT_NORMAL: "\x1B[0m",
    TEXT_NORMAL_BOLD: "\x1B[1m",
    TEXT_WARNING: "\x1B[93m",
    TEXT_WARNING_BOLD: "\x1B[93m\x1B[1m",
    TEXT_DANGER: "\x1B[91m",
    TEXT_DANGER_BOLD: "\x1B[91m\x1B[1m",
    TEXT_SUCCESS: "\x1B[92m",
    TEXT_SUCCESS_BOLD: "\x1B[92m\x1B[1m",
    TEXT_INFO: "\x1B[94m",
    TEXT_INFO_BOLD: "\x1B[94m\x1B[1m"
  };
  function println(...message) {
    process.stderr.write(message.join(" ") + EOL2);
  }
  UI.println = println;
  function print(...message) {
    process.stderr.write(message.join(" "));
  }
  UI.print = print;
  function error(message) {
    println(`${UI.Style.TEXT_DANGER_BOLD}Error: ${UI.Style.TEXT_NORMAL}${message}`);
  }
  UI.error = error;
  function success(message) {
    println(`${UI.Style.TEXT_SUCCESS_BOLD}✓ ${UI.Style.TEXT_NORMAL}${message}`);
  }
  UI.success = success;
  function info(message) {
    println(`${UI.Style.TEXT_INFO_BOLD}ℹ ${UI.Style.TEXT_NORMAL}${message}`);
  }
  UI.info = info;
  function warn(message) {
    println(`${UI.Style.TEXT_WARNING_BOLD}! ${UI.Style.TEXT_NORMAL}${message}`);
  }
  UI.warn = warn;
  function header(title) {
    println();
    println(UI.Style.TEXT_HIGHLIGHT_BOLD + title + UI.Style.TEXT_NORMAL);
    println(UI.Style.TEXT_DIM + "─".repeat(50) + UI.Style.TEXT_NORMAL);
  }
  UI.header = header;
})(UI2 ||= {});

// src/cli/run-cli.ts
var log6 = Log2.create({ service: "run-cli" });
var activeClient = null;
var cleanupHandlersRegistered = false;
async function setupCleanupHandlers() {
  if (cleanupHandlersRegistered)
    return;
  cleanupHandlersRegistered = true;
  const cleanupFn = async () => {
    if (activeClient) {
      try {
        log6.info("Cleanup signal received, closing OpenCode server...");
        await activeClient.cleanup();
        log6.info("OpenCode server closed successfully");
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        log6.error("Error during cleanup", { error: errorMsg });
      }
      activeClient = null;
    }
    process.exit(0);
  };
  process.on("SIGINT", cleanupFn);
  process.on("SIGTERM", cleanupFn);
  process.on("SIGHUP", cleanupFn);
  process.on("uncaughtException", async (error) => {
    const errorMsg = error instanceof Error ? error.message : String(error);
    log6.error("Uncaught exception", {
      error: errorMsg,
      stack: error instanceof Error ? error.stack : undefined
    });
    await cleanupFn();
  });
  process.on("unhandledRejection", async (reason) => {
    const errorMsg = reason instanceof Error ? reason.message : String(reason);
    log6.error("Unhandled rejection", {
      error: errorMsg,
      stack: reason instanceof Error ? reason.stack : undefined
    });
    await cleanupFn();
  });
}
async function runCli(config, flags) {
  await setupCleanupHandlers();
  log6.info("Starting CLI execution", { workflow: flags.workflow });
  const prompt = flags.workflow;
  if (!prompt) {
    UI2.error("No prompt or workflow provided");
    process.exit(1);
  }
  const optimizer = new PromptOptimizer2({
    autoApprove: flags.ci ?? false,
    verbosity: flags.verbose ? "verbose" : "normal"
  });
  UI2.header("Prompt Optimization");
  const session = optimizer.createSession(prompt);
  log6.debug("Created optimization session", { steps: session.steps.length });
  if (!flags.ci) {
    for (const step of session.steps) {
      const action = await ve({
        message: `Apply "${step.name}"?
  ${step.description}`,
        options: [
          {
            value: "approve",
            label: "Approve",
            hint: "Apply this optimization"
          },
          {
            value: "reject",
            label: "Reject",
            hint: "Skip this optimization"
          },
          {
            value: "skip-all",
            label: "Skip all",
            hint: "Use original prompt"
          }
        ]
      });
      if (pD(action)) {
        log6.info("User cancelled");
        process.exit(0);
      }
      if (action === "skip-all") {
        optimizer.skipOptimization(session);
        break;
      }
      if (action === "approve") {
        optimizer.approveStep(session, step.id);
      } else {
        optimizer.rejectStep(session, step.id);
      }
    }
  }
  if (flags.loop !== false) {
    await runLoopMode(config, flags, session.finalPrompt);
  } else {
    await runSingleShotMode(config, flags, session.finalPrompt);
  }
}
async function runLoopMode(config, flags, _optimizedPrompt) {
  UI2.header("Ralph Loop Mode");
  UI2.info("Running with fresh OpenCode sessions per iteration");
  if (flags.ship) {
    UI2.info("Mode: SHIP (auto-exit when agent outputs '<promise>SHIP</promise>')");
    UI2.info("Completion promise: <promise>SHIP</promise>");
  } else if (flags.draft || !flags.ship && !flags.completionPromise) {
    UI2.info("Mode: DRAFT (runs for max-cycles then stops for your review)");
    UI2.info("Completion promise: none (will run all cycles)");
  } else {
    UI2.info("Mode: Custom completion promise");
    UI2.info(`Completion promise: ${flags.completionPromise}`);
  }
  UI2.info(`Max cycles: ${flags.maxCycles ?? 50}`);
  UI2.info(`Stuck threshold: ${flags.stuckThreshold ?? 5}`);
  UI2.println();
  try {
    const runner = await createRalphLoopRunner(flags, config);
    await runner.run();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log6.error("Loop execution failed", { error: message });
    UI2.error(message);
    process.exit(1);
  }
  Se("Done!");
}
async function runSingleShotMode(config, flags, optimizedPrompt) {
  UI2.header("Execution");
  const s = Y2();
  s.start("Connecting to OpenCode...");
  try {
    activeClient = await OpenCodeClient.create({
      existingServerUrl: process.env.OPENCODE_URL,
      serverStartupTimeout: 1e4
    });
    const openSession = await activeClient.createSession(optimizedPrompt);
    log6.info("Created OpenCode session", { id: openSession.id });
    s.stop("Connected");
    UI2.println();
    UI2.println(`${UI2.Style.TEXT_DIM}Executing task...${UI2.Style.TEXT_NORMAL}`);
    let response;
    if (!flags.noStream) {
      const streamingResponse = await openSession.sendMessageStream("Execute this task and provide a detailed result summary.");
      UI2.println();
      const reader = streamingResponse.stream.getReader();
      const decoder = new TextDecoder;
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done)
            break;
          if (value) {
            const text = decoder.decode(value, { stream: true });
            UI2.print(text);
          }
        }
      } finally {
        reader.releaseLock();
      }
      response = await streamingResponse.complete;
    } else {
      UI2.println();
      UI2.println(`${UI2.Style.TEXT_DIM}Buffering response...${UI2.Style.TEXT_NORMAL}`);
      response = await openSession.sendMessage("Execute this task and provide a detailed result summary.");
      UI2.println();
      UI2.println(response.content);
    }
    UI2.println();
    UI2.success("Execution complete");
    if (activeClient) {
      await activeClient.cleanup();
      activeClient = null;
    }
    log6.info("Execution complete");
  } catch (error) {
    s.stop("Connection failed");
    const message = error instanceof Error ? error.message : String(error);
    log6.error("Execution failed", { error: message });
    UI2.error(message);
    if (activeClient) {
      try {
        await activeClient.cleanup();
      } catch (cleanupError) {
        const cleanupMsg = cleanupError instanceof Error ? cleanupError.message : String(cleanupError);
        log6.error("Error during error cleanup", { error: cleanupMsg });
      }
      activeClient = null;
    }
    process.exit(1);
  }
  Se("Done!");
}
export {
  runCli
};

//# debugId=EB4CC0597768AAF964756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Npc3RlcmFuc2kvc3JjL2luZGV4LmpzIiwgIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9waWNvY29sb3JzL3BpY29jb2xvcnMuanMiLCAiLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BjbGFjay9jb3JlL2Rpc3QvaW5kZXgubWpzIiwgIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9AY2xhY2svcHJvbXB0cy9kaXN0L2luZGV4Lm1qcyIsICIuLi8uLi9zcmMvYmFja2VuZHMvb3BlbmNvZGUvY2xpZW50LnRzIiwgIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9Ab3BlbmNvZGUtYWkvc2RrL2Rpc3QvZ2VuL2NvcmUvc2VydmVyU2VudEV2ZW50cy5nZW4uanMiLCAiLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BvcGVuY29kZS1haS9zZGsvZGlzdC9nZW4vY29yZS9hdXRoLmdlbi5qcyIsICIuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvQG9wZW5jb2RlLWFpL3Nkay9kaXN0L2dlbi9jb3JlL2JvZHlTZXJpYWxpemVyLmdlbi5qcyIsICIuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvQG9wZW5jb2RlLWFpL3Nkay9kaXN0L2dlbi9jb3JlL3BhdGhTZXJpYWxpemVyLmdlbi5qcyIsICIuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvQG9wZW5jb2RlLWFpL3Nkay9kaXN0L2dlbi9jb3JlL3V0aWxzLmdlbi5qcyIsICIuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvQG9wZW5jb2RlLWFpL3Nkay9kaXN0L2dlbi9jbGllbnQvdXRpbHMuZ2VuLmpzIiwgIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9Ab3BlbmNvZGUtYWkvc2RrL2Rpc3QvZ2VuL2NsaWVudC9jbGllbnQuZ2VuLmpzIiwgIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9Ab3BlbmNvZGUtYWkvc2RrL2Rpc3QvZ2VuL2NvcmUvcGFyYW1zLmdlbi5qcyIsICIuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvQG9wZW5jb2RlLWFpL3Nkay9kaXN0L2dlbi9jbGllbnQuZ2VuLmpzIiwgIi4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9Ab3BlbmNvZGUtYWkvc2RrL2Rpc3QvZ2VuL3Nkay5nZW4uanMiLCAiLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BvcGVuY29kZS1haS9zZGsvZGlzdC9jbGllbnQuanMiLCAiLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BvcGVuY29kZS1haS9zZGsvZGlzdC9zZXJ2ZXIuanMiLCAiLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BvcGVuY29kZS1haS9zZGsvZGlzdC9pbmRleC5qcyIsICIuLi8uLi9zcmMvdXRpbC9sb2cudHMiLCAiLi4vLi4vc3JjL2V4ZWN1dGlvbi9yYWxwaC1sb29wLnRzIiwgIi4uLy4uL3NyYy9iYWNrZW5kcy9vcGVuY29kZS9jbGllbnQudHMiLCAiLi4vLi4vc3JjL2NsaS91aS50cyIsICIuLi8uLi9zcmMvcHJvbXB0LW9wdGltaXphdGlvbi9hbmFseXplci50cyIsICIuLi8uLi9zcmMvcHJvbXB0LW9wdGltaXphdGlvbi90ZWNobmlxdWVzLnRzIiwgIi4uLy4uL3NyYy9wcm9tcHQtb3B0aW1pemF0aW9uL29wdGltaXplci50cyIsICIuLi8uLi9zcmMvdXRpbC9kaXNjb3JkLXdlYmhvb2sudHMiLCAiLi4vLi4vc3JjL2V4ZWN1dGlvbi9mbG93LXN0b3JlLnRzIiwgIi4uLy4uL3NyYy9leGVjdXRpb24vZmxvdy10eXBlcy50cyIsICIuLi8uLi9zcmMvcHJvbXB0LW9wdGltaXphdGlvbi9vcHRpbWl6ZXIudHMiLCAiLi4vLi4vc3JjL3V0aWwvbG9nLnRzIiwgIi4uLy4uL3NyYy9jbGkvdWkudHMiLCAiLi4vLi4vc3JjL2NsaS9ydW4tY2xpLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWwogICAgIid1c2Ugc3RyaWN0JztcblxuY29uc3QgRVNDID0gJ1xceDFCJztcbmNvbnN0IENTSSA9IGAke0VTQ31bYDtcbmNvbnN0IGJlZXAgPSAnXFx1MDAwNyc7XG5cbmNvbnN0IGN1cnNvciA9IHtcbiAgdG8oeCwgeSkge1xuICAgIGlmICgheSkgcmV0dXJuIGAke0NTSX0ke3ggKyAxfUdgO1xuICAgIHJldHVybiBgJHtDU0l9JHt5ICsgMX07JHt4ICsgMX1IYDtcbiAgfSxcbiAgbW92ZSh4LCB5KSB7XG4gICAgbGV0IHJldCA9ICcnO1xuXG4gICAgaWYgKHggPCAwKSByZXQgKz0gYCR7Q1NJfSR7LXh9RGA7XG4gICAgZWxzZSBpZiAoeCA+IDApIHJldCArPSBgJHtDU0l9JHt4fUNgO1xuXG4gICAgaWYgKHkgPCAwKSByZXQgKz0gYCR7Q1NJfSR7LXl9QWA7XG4gICAgZWxzZSBpZiAoeSA+IDApIHJldCArPSBgJHtDU0l9JHt5fUJgO1xuXG4gICAgcmV0dXJuIHJldDtcbiAgfSxcbiAgdXA6IChjb3VudCA9IDEpID0+IGAke0NTSX0ke2NvdW50fUFgLFxuICBkb3duOiAoY291bnQgPSAxKSA9PiBgJHtDU0l9JHtjb3VudH1CYCxcbiAgZm9yd2FyZDogKGNvdW50ID0gMSkgPT4gYCR7Q1NJfSR7Y291bnR9Q2AsXG4gIGJhY2t3YXJkOiAoY291bnQgPSAxKSA9PiBgJHtDU0l9JHtjb3VudH1EYCxcbiAgbmV4dExpbmU6IChjb3VudCA9IDEpID0+IGAke0NTSX1FYC5yZXBlYXQoY291bnQpLFxuICBwcmV2TGluZTogKGNvdW50ID0gMSkgPT4gYCR7Q1NJfUZgLnJlcGVhdChjb3VudCksXG4gIGxlZnQ6IGAke0NTSX1HYCxcbiAgaGlkZTogYCR7Q1NJfT8yNWxgLFxuICBzaG93OiBgJHtDU0l9PzI1aGAsXG4gIHNhdmU6IGAke0VTQ303YCxcbiAgcmVzdG9yZTogYCR7RVNDfThgXG59XG5cbmNvbnN0IHNjcm9sbCA9IHtcbiAgdXA6IChjb3VudCA9IDEpID0+IGAke0NTSX1TYC5yZXBlYXQoY291bnQpLFxuICBkb3duOiAoY291bnQgPSAxKSA9PiBgJHtDU0l9VGAucmVwZWF0KGNvdW50KVxufVxuXG5jb25zdCBlcmFzZSA9IHtcbiAgc2NyZWVuOiBgJHtDU0l9MkpgLFxuICB1cDogKGNvdW50ID0gMSkgPT4gYCR7Q1NJfTFKYC5yZXBlYXQoY291bnQpLFxuICBkb3duOiAoY291bnQgPSAxKSA9PiBgJHtDU0l9SmAucmVwZWF0KGNvdW50KSxcbiAgbGluZTogYCR7Q1NJfTJLYCxcbiAgbGluZUVuZDogYCR7Q1NJfUtgLFxuICBsaW5lU3RhcnQ6IGAke0NTSX0xS2AsXG4gIGxpbmVzKGNvdW50KSB7XG4gICAgbGV0IGNsZWFyID0gJyc7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudDsgaSsrKVxuICAgICAgY2xlYXIgKz0gdGhpcy5saW5lICsgKGkgPCBjb3VudCAtIDEgPyBjdXJzb3IudXAoKSA6ICcnKTtcbiAgICBpZiAoY291bnQpXG4gICAgICBjbGVhciArPSBjdXJzb3IubGVmdDtcbiAgICByZXR1cm4gY2xlYXI7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7IGN1cnNvciwgc2Nyb2xsLCBlcmFzZSwgYmVlcCB9O1xuIiwKICAgICJsZXQgcCA9IHByb2Nlc3MgfHwge30sIGFyZ3YgPSBwLmFyZ3YgfHwgW10sIGVudiA9IHAuZW52IHx8IHt9XG5sZXQgaXNDb2xvclN1cHBvcnRlZCA9XG5cdCEoISFlbnYuTk9fQ09MT1IgfHwgYXJndi5pbmNsdWRlcyhcIi0tbm8tY29sb3JcIikpICYmXG5cdCghIWVudi5GT1JDRV9DT0xPUiB8fCBhcmd2LmluY2x1ZGVzKFwiLS1jb2xvclwiKSB8fCBwLnBsYXRmb3JtID09PSBcIndpbjMyXCIgfHwgKChwLnN0ZG91dCB8fCB7fSkuaXNUVFkgJiYgZW52LlRFUk0gIT09IFwiZHVtYlwiKSB8fCAhIWVudi5DSSlcblxubGV0IGZvcm1hdHRlciA9IChvcGVuLCBjbG9zZSwgcmVwbGFjZSA9IG9wZW4pID0+XG5cdGlucHV0ID0+IHtcblx0XHRsZXQgc3RyaW5nID0gXCJcIiArIGlucHV0LCBpbmRleCA9IHN0cmluZy5pbmRleE9mKGNsb3NlLCBvcGVuLmxlbmd0aClcblx0XHRyZXR1cm4gfmluZGV4ID8gb3BlbiArIHJlcGxhY2VDbG9zZShzdHJpbmcsIGNsb3NlLCByZXBsYWNlLCBpbmRleCkgKyBjbG9zZSA6IG9wZW4gKyBzdHJpbmcgKyBjbG9zZVxuXHR9XG5cbmxldCByZXBsYWNlQ2xvc2UgPSAoc3RyaW5nLCBjbG9zZSwgcmVwbGFjZSwgaW5kZXgpID0+IHtcblx0bGV0IHJlc3VsdCA9IFwiXCIsIGN1cnNvciA9IDBcblx0ZG8ge1xuXHRcdHJlc3VsdCArPSBzdHJpbmcuc3Vic3RyaW5nKGN1cnNvciwgaW5kZXgpICsgcmVwbGFjZVxuXHRcdGN1cnNvciA9IGluZGV4ICsgY2xvc2UubGVuZ3RoXG5cdFx0aW5kZXggPSBzdHJpbmcuaW5kZXhPZihjbG9zZSwgY3Vyc29yKVxuXHR9IHdoaWxlICh+aW5kZXgpXG5cdHJldHVybiByZXN1bHQgKyBzdHJpbmcuc3Vic3RyaW5nKGN1cnNvcilcbn1cblxubGV0IGNyZWF0ZUNvbG9ycyA9IChlbmFibGVkID0gaXNDb2xvclN1cHBvcnRlZCkgPT4ge1xuXHRsZXQgZiA9IGVuYWJsZWQgPyBmb3JtYXR0ZXIgOiAoKSA9PiBTdHJpbmdcblx0cmV0dXJuIHtcblx0XHRpc0NvbG9yU3VwcG9ydGVkOiBlbmFibGVkLFxuXHRcdHJlc2V0OiBmKFwiXFx4MWJbMG1cIiwgXCJcXHgxYlswbVwiKSxcblx0XHRib2xkOiBmKFwiXFx4MWJbMW1cIiwgXCJcXHgxYlsyMm1cIiwgXCJcXHgxYlsyMm1cXHgxYlsxbVwiKSxcblx0XHRkaW06IGYoXCJcXHgxYlsybVwiLCBcIlxceDFiWzIybVwiLCBcIlxceDFiWzIybVxceDFiWzJtXCIpLFxuXHRcdGl0YWxpYzogZihcIlxceDFiWzNtXCIsIFwiXFx4MWJbMjNtXCIpLFxuXHRcdHVuZGVybGluZTogZihcIlxceDFiWzRtXCIsIFwiXFx4MWJbMjRtXCIpLFxuXHRcdGludmVyc2U6IGYoXCJcXHgxYls3bVwiLCBcIlxceDFiWzI3bVwiKSxcblx0XHRoaWRkZW46IGYoXCJcXHgxYls4bVwiLCBcIlxceDFiWzI4bVwiKSxcblx0XHRzdHJpa2V0aHJvdWdoOiBmKFwiXFx4MWJbOW1cIiwgXCJcXHgxYlsyOW1cIiksXG5cblx0XHRibGFjazogZihcIlxceDFiWzMwbVwiLCBcIlxceDFiWzM5bVwiKSxcblx0XHRyZWQ6IGYoXCJcXHgxYlszMW1cIiwgXCJcXHgxYlszOW1cIiksXG5cdFx0Z3JlZW46IGYoXCJcXHgxYlszMm1cIiwgXCJcXHgxYlszOW1cIiksXG5cdFx0eWVsbG93OiBmKFwiXFx4MWJbMzNtXCIsIFwiXFx4MWJbMzltXCIpLFxuXHRcdGJsdWU6IGYoXCJcXHgxYlszNG1cIiwgXCJcXHgxYlszOW1cIiksXG5cdFx0bWFnZW50YTogZihcIlxceDFiWzM1bVwiLCBcIlxceDFiWzM5bVwiKSxcblx0XHRjeWFuOiBmKFwiXFx4MWJbMzZtXCIsIFwiXFx4MWJbMzltXCIpLFxuXHRcdHdoaXRlOiBmKFwiXFx4MWJbMzdtXCIsIFwiXFx4MWJbMzltXCIpLFxuXHRcdGdyYXk6IGYoXCJcXHgxYls5MG1cIiwgXCJcXHgxYlszOW1cIiksXG5cblx0XHRiZ0JsYWNrOiBmKFwiXFx4MWJbNDBtXCIsIFwiXFx4MWJbNDltXCIpLFxuXHRcdGJnUmVkOiBmKFwiXFx4MWJbNDFtXCIsIFwiXFx4MWJbNDltXCIpLFxuXHRcdGJnR3JlZW46IGYoXCJcXHgxYls0Mm1cIiwgXCJcXHgxYls0OW1cIiksXG5cdFx0YmdZZWxsb3c6IGYoXCJcXHgxYls0M21cIiwgXCJcXHgxYls0OW1cIiksXG5cdFx0YmdCbHVlOiBmKFwiXFx4MWJbNDRtXCIsIFwiXFx4MWJbNDltXCIpLFxuXHRcdGJnTWFnZW50YTogZihcIlxceDFiWzQ1bVwiLCBcIlxceDFiWzQ5bVwiKSxcblx0XHRiZ0N5YW46IGYoXCJcXHgxYls0Nm1cIiwgXCJcXHgxYls0OW1cIiksXG5cdFx0YmdXaGl0ZTogZihcIlxceDFiWzQ3bVwiLCBcIlxceDFiWzQ5bVwiKSxcblxuXHRcdGJsYWNrQnJpZ2h0OiBmKFwiXFx4MWJbOTBtXCIsIFwiXFx4MWJbMzltXCIpLFxuXHRcdHJlZEJyaWdodDogZihcIlxceDFiWzkxbVwiLCBcIlxceDFiWzM5bVwiKSxcblx0XHRncmVlbkJyaWdodDogZihcIlxceDFiWzkybVwiLCBcIlxceDFiWzM5bVwiKSxcblx0XHR5ZWxsb3dCcmlnaHQ6IGYoXCJcXHgxYls5M21cIiwgXCJcXHgxYlszOW1cIiksXG5cdFx0Ymx1ZUJyaWdodDogZihcIlxceDFiWzk0bVwiLCBcIlxceDFiWzM5bVwiKSxcblx0XHRtYWdlbnRhQnJpZ2h0OiBmKFwiXFx4MWJbOTVtXCIsIFwiXFx4MWJbMzltXCIpLFxuXHRcdGN5YW5CcmlnaHQ6IGYoXCJcXHgxYls5Nm1cIiwgXCJcXHgxYlszOW1cIiksXG5cdFx0d2hpdGVCcmlnaHQ6IGYoXCJcXHgxYls5N21cIiwgXCJcXHgxYlszOW1cIiksXG5cblx0XHRiZ0JsYWNrQnJpZ2h0OiBmKFwiXFx4MWJbMTAwbVwiLCBcIlxceDFiWzQ5bVwiKSxcblx0XHRiZ1JlZEJyaWdodDogZihcIlxceDFiWzEwMW1cIiwgXCJcXHgxYls0OW1cIiksXG5cdFx0YmdHcmVlbkJyaWdodDogZihcIlxceDFiWzEwMm1cIiwgXCJcXHgxYls0OW1cIiksXG5cdFx0YmdZZWxsb3dCcmlnaHQ6IGYoXCJcXHgxYlsxMDNtXCIsIFwiXFx4MWJbNDltXCIpLFxuXHRcdGJnQmx1ZUJyaWdodDogZihcIlxceDFiWzEwNG1cIiwgXCJcXHgxYls0OW1cIiksXG5cdFx0YmdNYWdlbnRhQnJpZ2h0OiBmKFwiXFx4MWJbMTA1bVwiLCBcIlxceDFiWzQ5bVwiKSxcblx0XHRiZ0N5YW5CcmlnaHQ6IGYoXCJcXHgxYlsxMDZtXCIsIFwiXFx4MWJbNDltXCIpLFxuXHRcdGJnV2hpdGVCcmlnaHQ6IGYoXCJcXHgxYlsxMDdtXCIsIFwiXFx4MWJbNDltXCIpLFxuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlQ29sb3JzKClcbm1vZHVsZS5leHBvcnRzLmNyZWF0ZUNvbG9ycyA9IGNyZWF0ZUNvbG9yc1xuIiwKICAgICJpbXBvcnR7Y3Vyc29yIGFzIGwsZXJhc2UgYXMgYn1mcm9tXCJzaXN0ZXJhbnNpXCI7aW1wb3J0e3N0ZGluIGFzIGosc3Rkb3V0IGFzIE19ZnJvbVwibm9kZTpwcm9jZXNzXCI7aW1wb3J0KmFzIGcgZnJvbVwibm9kZTpyZWFkbGluZVwiO2ltcG9ydCBPIGZyb21cIm5vZGU6cmVhZGxpbmVcIjtpbXBvcnR7V3JpdGFibGUgYXMgWH1mcm9tXCJub2RlOnN0cmVhbVwiO2ltcG9ydCB2IGZyb21cInBpY29jb2xvcnNcIjtmdW5jdGlvbiBERCh7b25seUZpcnN0OmU9ITF9PXt9KXtjb25zdCB0PVtcIltcXFxcdTAwMUJcXFxcdTAwOUJdW1tcXFxcXSgpIzs/XSooPzooPzooPzooPzo7Wy1hLXpBLVpcXFxcZFxcXFwvIyYuOj0/JUB+X10rKSp8W2EtekEtWlxcXFxkXSsoPzo7Wy1hLXpBLVpcXFxcZFxcXFwvIyYuOj0/JUB+X10qKSopPyg/OlxcXFx1MDAwN3xcXFxcdTAwMUJcXFxcdTAwNUN8XFxcXHUwMDlDKSlcIixcIig/Oig/OlxcXFxkezEsNH0oPzo7XFxcXGR7MCw0fSkqKT9bXFxcXGRBLVBSLVRaY2YtbnEtdXk9Pjx+XSkpXCJdLmpvaW4oXCJ8XCIpO3JldHVybiBuZXcgUmVnRXhwKHQsZT92b2lkIDA6XCJnXCIpfWNvbnN0IHVEPUREKCk7ZnVuY3Rpb24gUChlKXtpZih0eXBlb2YgZSE9XCJzdHJpbmdcIil0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBhIFxcYHN0cmluZ1xcYCwgZ290IFxcYCR7dHlwZW9mIGV9XFxgYCk7cmV0dXJuIGUucmVwbGFjZSh1RCxcIlwiKX1mdW5jdGlvbiBMKGUpe3JldHVybiBlJiZlLl9fZXNNb2R1bGUmJk9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChlLFwiZGVmYXVsdFwiKT9lLmRlZmF1bHQ6ZX12YXIgVz17ZXhwb3J0czp7fX07KGZ1bmN0aW9uKGUpe3ZhciB1PXt9O2UuZXhwb3J0cz11LHUuZWFzdEFzaWFuV2lkdGg9ZnVuY3Rpb24oRil7dmFyIHM9Ri5jaGFyQ29kZUF0KDApLGk9Ri5sZW5ndGg9PTI/Ri5jaGFyQ29kZUF0KDEpOjAsRD1zO3JldHVybiA1NTI5Njw9cyYmczw9NTYzMTkmJjU2MzIwPD1pJiZpPD01NzM0MyYmKHMmPTEwMjMsaSY9MTAyMyxEPXM8PDEwfGksRCs9NjU1MzYpLEQ9PTEyMjg4fHw2NTI4MTw9RCYmRDw9NjUzNzZ8fDY1NTA0PD1EJiZEPD02NTUxMD9cIkZcIjpEPT04MzYxfHw2NTM3Nzw9RCYmRDw9NjU0NzB8fDY1NDc0PD1EJiZEPD02NTQ3OXx8NjU0ODI8PUQmJkQ8PTY1NDg3fHw2NTQ5MDw9RCYmRDw9NjU0OTV8fDY1NDk4PD1EJiZEPD02NTUwMHx8NjU1MTI8PUQmJkQ8PTY1NTE4P1wiSFwiOjQzNTI8PUQmJkQ8PTQ0NDd8fDQ1MTU8PUQmJkQ8PTQ1MTl8fDQ2MDI8PUQmJkQ8PTQ2MDd8fDkwMDE8PUQmJkQ8PTkwMDJ8fDExOTA0PD1EJiZEPD0xMTkyOXx8MTE5MzE8PUQmJkQ8PTEyMDE5fHwxMjAzMjw9RCYmRDw9MTIyNDV8fDEyMjcyPD1EJiZEPD0xMjI4M3x8MTIyODk8PUQmJkQ8PTEyMzUwfHwxMjM1Mzw9RCYmRDw9MTI0Mzh8fDEyNDQxPD1EJiZEPD0xMjU0M3x8MTI1NDk8PUQmJkQ8PTEyNTg5fHwxMjU5Mzw9RCYmRDw9MTI2ODZ8fDEyNjg4PD1EJiZEPD0xMjczMHx8MTI3MzY8PUQmJkQ8PTEyNzcxfHwxMjc4NDw9RCYmRDw9MTI4MzB8fDEyODMyPD1EJiZEPD0xMjg3MXx8MTI4ODA8PUQmJkQ8PTEzMDU0fHwxMzA1Njw9RCYmRDw9MTk5MDN8fDE5OTY4PD1EJiZEPD00MjEyNHx8NDIxMjg8PUQmJkQ8PTQyMTgyfHw0MzM2MDw9RCYmRDw9NDMzODh8fDQ0MDMyPD1EJiZEPD01NTIwM3x8NTUyMTY8PUQmJkQ8PTU1MjM4fHw1NTI0Mzw9RCYmRDw9NTUyOTF8fDYzNzQ0PD1EJiZEPD02NDI1NXx8NjUwNDA8PUQmJkQ8PTY1MDQ5fHw2NTA3Mjw9RCYmRDw9NjUxMDZ8fDY1MTA4PD1EJiZEPD02NTEyNnx8NjUxMjg8PUQmJkQ8PTY1MTMxfHwxMTA1OTI8PUQmJkQ8PTExMDU5M3x8MTI3NDg4PD1EJiZEPD0xMjc0OTB8fDEyNzUwNDw9RCYmRDw9MTI3NTQ2fHwxMjc1NTI8PUQmJkQ8PTEyNzU2MHx8MTI3NTY4PD1EJiZEPD0xMjc1Njl8fDEzMTA3Mjw9RCYmRDw9MTk0MzY3fHwxNzc5ODQ8PUQmJkQ8PTE5NjYwNXx8MTk2NjA4PD1EJiZEPD0yNjIxNDE/XCJXXCI6MzI8PUQmJkQ8PTEyNnx8MTYyPD1EJiZEPD0xNjN8fDE2NTw9RCYmRDw9MTY2fHxEPT0xNzJ8fEQ9PTE3NXx8MTAyMTQ8PUQmJkQ8PTEwMjIxfHwxMDYyOTw9RCYmRDw9MTA2MzA/XCJOYVwiOkQ9PTE2MXx8RD09MTY0fHwxNjc8PUQmJkQ8PTE2OHx8RD09MTcwfHwxNzM8PUQmJkQ8PTE3NHx8MTc2PD1EJiZEPD0xODB8fDE4Mjw9RCYmRDw9MTg2fHwxODg8PUQmJkQ8PTE5MXx8RD09MTk4fHxEPT0yMDh8fDIxNTw9RCYmRDw9MjE2fHwyMjI8PUQmJkQ8PTIyNXx8RD09MjMwfHwyMzI8PUQmJkQ8PTIzNHx8MjM2PD1EJiZEPD0yMzd8fEQ9PTI0MHx8MjQyPD1EJiZEPD0yNDN8fDI0Nzw9RCYmRDw9MjUwfHxEPT0yNTJ8fEQ9PTI1NHx8RD09MjU3fHxEPT0yNzN8fEQ9PTI3NXx8RD09MjgzfHwyOTQ8PUQmJkQ8PTI5NXx8RD09Mjk5fHwzMDU8PUQmJkQ8PTMwN3x8RD09MzEyfHwzMTk8PUQmJkQ8PTMyMnx8RD09MzI0fHwzMjg8PUQmJkQ8PTMzMXx8RD09MzMzfHwzMzg8PUQmJkQ8PTMzOXx8MzU4PD1EJiZEPD0zNTl8fEQ9PTM2M3x8RD09NDYyfHxEPT00NjR8fEQ9PTQ2Nnx8RD09NDY4fHxEPT00NzB8fEQ9PTQ3Mnx8RD09NDc0fHxEPT00NzZ8fEQ9PTU5M3x8RD09NjA5fHxEPT03MDh8fEQ9PTcxMXx8NzEzPD1EJiZEPD03MTV8fEQ9PTcxN3x8RD09NzIwfHw3Mjg8PUQmJkQ8PTczMXx8RD09NzMzfHxEPT03MzV8fDc2ODw9RCYmRDw9ODc5fHw5MTM8PUQmJkQ8PTkyOXx8OTMxPD1EJiZEPD05Mzd8fDk0NTw9RCYmRDw9OTYxfHw5NjM8PUQmJkQ8PTk2OXx8RD09MTAyNXx8MTA0MDw9RCYmRDw9MTEwM3x8RD09MTEwNXx8RD09ODIwOHx8ODIxMTw9RCYmRDw9ODIxNHx8ODIxNjw9RCYmRDw9ODIxN3x8ODIyMDw9RCYmRDw9ODIyMXx8ODIyNDw9RCYmRDw9ODIyNnx8ODIyODw9RCYmRDw9ODIzMXx8RD09ODI0MHx8ODI0Mjw9RCYmRDw9ODI0M3x8RD09ODI0NXx8RD09ODI1MXx8RD09ODI1NHx8RD09ODMwOHx8RD09ODMxOXx8ODMyMTw9RCYmRDw9ODMyNHx8RD09ODM2NHx8RD09ODQ1MXx8RD09ODQ1M3x8RD09ODQ1N3x8RD09ODQ2N3x8RD09ODQ3MHx8ODQ4MTw9RCYmRDw9ODQ4Mnx8RD09ODQ4Nnx8RD09ODQ5MXx8ODUzMTw9RCYmRDw9ODUzMnx8ODUzOTw9RCYmRDw9ODU0Mnx8ODU0NDw9RCYmRDw9ODU1NXx8ODU2MDw9RCYmRDw9ODU2OXx8RD09ODU4NXx8ODU5Mjw9RCYmRDw9ODYwMXx8ODYzMjw9RCYmRDw9ODYzM3x8RD09ODY1OHx8RD09ODY2MHx8RD09ODY3OXx8RD09ODcwNHx8ODcwNjw9RCYmRDw9ODcwN3x8ODcxMTw9RCYmRDw9ODcxMnx8RD09ODcxNXx8RD09ODcxOXx8RD09ODcyMXx8RD09ODcyNXx8RD09ODczMHx8ODczMzw9RCYmRDw9ODczNnx8RD09ODczOXx8RD09ODc0MXx8ODc0Mzw9RCYmRDw9ODc0OHx8RD09ODc1MHx8ODc1Njw9RCYmRDw9ODc1OXx8ODc2NDw9RCYmRDw9ODc2NXx8RD09ODc3Nnx8RD09ODc4MHx8RD09ODc4Nnx8ODgwMDw9RCYmRDw9ODgwMXx8ODgwNDw9RCYmRDw9ODgwN3x8ODgxMDw9RCYmRDw9ODgxMXx8ODgxNDw9RCYmRDw9ODgxNXx8ODgzNDw9RCYmRDw9ODgzNXx8ODgzODw9RCYmRDw9ODgzOXx8RD09ODg1M3x8RD09ODg1N3x8RD09ODg2OXx8RD09ODg5NXx8RD09ODk3OHx8OTMxMjw9RCYmRDw9OTQ0OXx8OTQ1MTw9RCYmRDw9OTU0N3x8OTU1Mjw9RCYmRDw9OTU4N3x8OTYwMDw9RCYmRDw9OTYxNXx8OTYxODw9RCYmRDw9OTYyMXx8OTYzMjw9RCYmRDw9OTYzM3x8OTYzNTw9RCYmRDw9OTY0MXx8OTY1MDw9RCYmRDw9OTY1MXx8OTY1NDw9RCYmRDw9OTY1NXx8OTY2MDw9RCYmRDw9OTY2MXx8OTY2NDw9RCYmRDw9OTY2NXx8OTY3MDw9RCYmRDw9OTY3Mnx8RD09OTY3NXx8OTY3ODw9RCYmRDw9OTY4MXx8OTY5ODw9RCYmRDw9OTcwMXx8RD09OTcxMXx8OTczMzw9RCYmRDw9OTczNHx8RD09OTczN3x8OTc0Mjw9RCYmRDw9OTc0M3x8OTc0ODw9RCYmRDw9OTc0OXx8RD09OTc1Nnx8RD09OTc1OHx8RD09OTc5Mnx8RD09OTc5NHx8OTgyNDw9RCYmRDw9OTgyNXx8OTgyNzw9RCYmRDw9OTgyOXx8OTgzMTw9RCYmRDw9OTgzNHx8OTgzNjw9RCYmRDw9OTgzN3x8RD09OTgzOXx8OTg4Njw9RCYmRDw9OTg4N3x8OTkxODw9RCYmRDw9OTkxOXx8OTkyNDw9RCYmRDw9OTkzM3x8OTkzNTw9RCYmRDw9OTk1M3x8RD09OTk1NXx8OTk2MDw9RCYmRDw9OTk4M3x8RD09MTAwNDV8fEQ9PTEwMDcxfHwxMDEwMjw9RCYmRDw9MTAxMTF8fDExMDkzPD1EJiZEPD0xMTA5N3x8MTI4NzI8PUQmJkQ8PTEyODc5fHw1NzM0NDw9RCYmRDw9NjM3NDN8fDY1MDI0PD1EJiZEPD02NTAzOXx8RD09NjU1MzN8fDEyNzIzMjw9RCYmRDw9MTI3MjQyfHwxMjcyNDg8PUQmJkQ8PTEyNzI3N3x8MTI3MjgwPD1EJiZEPD0xMjczMzd8fDEyNzM0NDw9RCYmRDw9MTI3Mzg2fHw5MTc3NjA8PUQmJkQ8PTkxNzk5OXx8OTgzMDQwPD1EJiZEPD0xMDQ4NTczfHwxMDQ4NTc2PD1EJiZEPD0xMTE0MTA5P1wiQVwiOlwiTlwifSx1LmNoYXJhY3Rlckxlbmd0aD1mdW5jdGlvbihGKXt2YXIgcz10aGlzLmVhc3RBc2lhbldpZHRoKEYpO3JldHVybiBzPT1cIkZcInx8cz09XCJXXCJ8fHM9PVwiQVwiPzI6MX07ZnVuY3Rpb24gdChGKXtyZXR1cm4gRi5tYXRjaCgvW1xcdUQ4MDAtXFx1REJGRl1bXFx1REMwMC1cXHVERkZGXXxbXlxcdUQ4MDAtXFx1REZGRl0vZyl8fFtdfXUubGVuZ3RoPWZ1bmN0aW9uKEYpe2Zvcih2YXIgcz10KEYpLGk9MCxEPTA7RDxzLmxlbmd0aDtEKyspaT1pK3RoaXMuY2hhcmFjdGVyTGVuZ3RoKHNbRF0pO3JldHVybiBpfSx1LnNsaWNlPWZ1bmN0aW9uKEYscyxpKXt0ZXh0TGVuPXUubGVuZ3RoKEYpLHM9c3x8MCxpPWl8fDEsczwwJiYocz10ZXh0TGVuK3MpLGk8MCYmKGk9dGV4dExlbitpKTtmb3IodmFyIEQ9XCJcIixDPTAsbj10KEYpLEU9MDtFPG4ubGVuZ3RoO0UrKyl7dmFyIGE9bltFXSxvPXUubGVuZ3RoKGEpO2lmKEM+PXMtKG89PTI/MTowKSlpZihDK288PWkpRCs9YTtlbHNlIGJyZWFrO0MrPW99cmV0dXJuIER9fSkoVyk7dmFyIHREPVcuZXhwb3J0cztjb25zdCBlRD1MKHREKTt2YXIgRkQ9ZnVuY3Rpb24oKXtyZXR1cm4vXFx1RDgzQ1xcdURGRjRcXHVEQjQwXFx1REM2N1xcdURCNDBcXHVEQzYyKD86XFx1REI0MFxcdURDNzdcXHVEQjQwXFx1REM2Q1xcdURCNDBcXHVEQzczfFxcdURCNDBcXHVEQzczXFx1REI0MFxcdURDNjNcXHVEQjQwXFx1REM3NHxcXHVEQjQwXFx1REM2NVxcdURCNDBcXHVEQzZFXFx1REI0MFxcdURDNjcpXFx1REI0MFxcdURDN0Z8KD86XFx1RDgzRVxcdURERDFcXHVEODNDXFx1REZGRlxcdTIwMERcXHUyNzY0XFx1RkUwRlxcdTIwMEQoPzpcXHVEODNEXFx1REM4QlxcdTIwMEQpP1xcdUQ4M0VcXHVEREQxfFxcdUQ4M0RcXHVEQzY5XFx1RDgzQ1xcdURGRkZcXHUyMDBEXFx1RDgzRVxcdUREMURcXHUyMDBEKD86XFx1RDgzRFtcXHVEQzY4XFx1REM2OV0pKSg/OlxcdUQ4M0NbXFx1REZGQi1cXHVERkZFXSl8KD86XFx1RDgzRVxcdURERDFcXHVEODNDXFx1REZGRVxcdTIwMERcXHUyNzY0XFx1RkUwRlxcdTIwMEQoPzpcXHVEODNEXFx1REM4QlxcdTIwMEQpP1xcdUQ4M0VcXHVEREQxfFxcdUQ4M0RcXHVEQzY5XFx1RDgzQ1xcdURGRkVcXHUyMDBEXFx1RDgzRVxcdUREMURcXHUyMDBEKD86XFx1RDgzRFtcXHVEQzY4XFx1REM2OV0pKSg/OlxcdUQ4M0NbXFx1REZGQi1cXHVERkZEXFx1REZGRl0pfCg/OlxcdUQ4M0VcXHVEREQxXFx1RDgzQ1xcdURGRkRcXHUyMDBEXFx1Mjc2NFxcdUZFMEZcXHUyMDBEKD86XFx1RDgzRFxcdURDOEJcXHUyMDBEKT9cXHVEODNFXFx1REREMXxcXHVEODNEXFx1REM2OVxcdUQ4M0NcXHVERkZEXFx1MjAwRFxcdUQ4M0VcXHVERDFEXFx1MjAwRCg/OlxcdUQ4M0RbXFx1REM2OFxcdURDNjldKSkoPzpcXHVEODNDW1xcdURGRkJcXHVERkZDXFx1REZGRVxcdURGRkZdKXwoPzpcXHVEODNFXFx1REREMVxcdUQ4M0NcXHVERkZDXFx1MjAwRFxcdTI3NjRcXHVGRTBGXFx1MjAwRCg/OlxcdUQ4M0RcXHVEQzhCXFx1MjAwRCk/XFx1RDgzRVxcdURERDF8XFx1RDgzRFxcdURDNjlcXHVEODNDXFx1REZGQ1xcdTIwMERcXHVEODNFXFx1REQxRFxcdTIwMEQoPzpcXHVEODNEW1xcdURDNjhcXHVEQzY5XSkpKD86XFx1RDgzQ1tcXHVERkZCXFx1REZGRC1cXHVERkZGXSl8KD86XFx1RDgzRVxcdURERDFcXHVEODNDXFx1REZGQlxcdTIwMERcXHUyNzY0XFx1RkUwRlxcdTIwMEQoPzpcXHVEODNEXFx1REM4QlxcdTIwMEQpP1xcdUQ4M0VcXHVEREQxfFxcdUQ4M0RcXHVEQzY5XFx1RDgzQ1xcdURGRkJcXHUyMDBEXFx1RDgzRVxcdUREMURcXHUyMDBEKD86XFx1RDgzRFtcXHVEQzY4XFx1REM2OV0pKSg/OlxcdUQ4M0NbXFx1REZGQy1cXHVERkZGXSl8XFx1RDgzRFxcdURDNjgoPzpcXHVEODNDXFx1REZGQig/OlxcdTIwMEQoPzpcXHUyNzY0XFx1RkUwRlxcdTIwMEQoPzpcXHVEODNEXFx1REM4QlxcdTIwMERcXHVEODNEXFx1REM2OCg/OlxcdUQ4M0NbXFx1REZGQi1cXHVERkZGXSl8XFx1RDgzRFxcdURDNjgoPzpcXHVEODNDW1xcdURGRkItXFx1REZGRl0pKXxcXHVEODNFXFx1REQxRFxcdTIwMERcXHVEODNEXFx1REM2OCg/OlxcdUQ4M0NbXFx1REZGQy1cXHVERkZGXSl8W1xcdTI2OTVcXHUyNjk2XFx1MjcwOF1cXHVGRTBGfFxcdUQ4M0NbXFx1REYzRVxcdURGNzNcXHVERjdDXFx1REY5M1xcdURGQTRcXHVERkE4XFx1REZFQlxcdURGRURdfFxcdUQ4M0RbXFx1RENCQlxcdURDQkNcXHVERDI3XFx1REQyQ1xcdURFODBcXHVERTkyXXxcXHVEODNFW1xcdUREQUYtXFx1RERCM1xcdUREQkNcXHVEREJEXSkpP3woPzpcXHVEODNDW1xcdURGRkMtXFx1REZGRl0pXFx1MjAwRFxcdTI3NjRcXHVGRTBGXFx1MjAwRCg/OlxcdUQ4M0RcXHVEQzhCXFx1MjAwRFxcdUQ4M0RcXHVEQzY4KD86XFx1RDgzQ1tcXHVERkZCLVxcdURGRkZdKXxcXHVEODNEXFx1REM2OCg/OlxcdUQ4M0NbXFx1REZGQi1cXHVERkZGXSkpfFxcdTIwMEQoPzpcXHUyNzY0XFx1RkUwRlxcdTIwMEQoPzpcXHVEODNEXFx1REM4QlxcdTIwMEQpP1xcdUQ4M0RcXHVEQzY4fCg/OlxcdUQ4M0RbXFx1REM2OFxcdURDNjldKVxcdTIwMEQoPzpcXHVEODNEXFx1REM2NlxcdTIwMERcXHVEODNEXFx1REM2NnxcXHVEODNEXFx1REM2N1xcdTIwMEQoPzpcXHVEODNEW1xcdURDNjZcXHVEQzY3XSkpfFxcdUQ4M0RcXHVEQzY2XFx1MjAwRFxcdUQ4M0RcXHVEQzY2fFxcdUQ4M0RcXHVEQzY3XFx1MjAwRCg/OlxcdUQ4M0RbXFx1REM2NlxcdURDNjddKXxcXHVEODNDW1xcdURGM0VcXHVERjczXFx1REY3Q1xcdURGOTNcXHVERkE0XFx1REZBOFxcdURGRUJcXHVERkVEXXxcXHVEODNEW1xcdURDQkJcXHVEQ0JDXFx1REQyN1xcdUREMkNcXHVERTgwXFx1REU5Ml18XFx1RDgzRVtcXHVEREFGLVxcdUREQjNcXHVEREJDXFx1RERCRF0pfFxcdUQ4M0NcXHVERkZGXFx1MjAwRCg/OlxcdUQ4M0VcXHVERDFEXFx1MjAwRFxcdUQ4M0RcXHVEQzY4KD86XFx1RDgzQ1tcXHVERkZCLVxcdURGRkVdKXxcXHVEODNDW1xcdURGM0VcXHVERjczXFx1REY3Q1xcdURGOTNcXHVERkE0XFx1REZBOFxcdURGRUJcXHVERkVEXXxcXHVEODNEW1xcdURDQkJcXHVEQ0JDXFx1REQyN1xcdUREMkNcXHVERTgwXFx1REU5Ml18XFx1RDgzRVtcXHVEREFGLVxcdUREQjNcXHVEREJDXFx1RERCRF0pfFxcdUQ4M0NcXHVERkZFXFx1MjAwRCg/OlxcdUQ4M0VcXHVERDFEXFx1MjAwRFxcdUQ4M0RcXHVEQzY4KD86XFx1RDgzQ1tcXHVERkZCLVxcdURGRkRcXHVERkZGXSl8XFx1RDgzQ1tcXHVERjNFXFx1REY3M1xcdURGN0NcXHVERjkzXFx1REZBNFxcdURGQThcXHVERkVCXFx1REZFRF18XFx1RDgzRFtcXHVEQ0JCXFx1RENCQ1xcdUREMjdcXHVERDJDXFx1REU4MFxcdURFOTJdfFxcdUQ4M0VbXFx1RERBRi1cXHVEREIzXFx1RERCQ1xcdUREQkRdKXxcXHVEODNDXFx1REZGRFxcdTIwMEQoPzpcXHVEODNFXFx1REQxRFxcdTIwMERcXHVEODNEXFx1REM2OCg/OlxcdUQ4M0NbXFx1REZGQlxcdURGRkNcXHVERkZFXFx1REZGRl0pfFxcdUQ4M0NbXFx1REYzRVxcdURGNzNcXHVERjdDXFx1REY5M1xcdURGQTRcXHVERkE4XFx1REZFQlxcdURGRURdfFxcdUQ4M0RbXFx1RENCQlxcdURDQkNcXHVERDI3XFx1REQyQ1xcdURFODBcXHVERTkyXXxcXHVEODNFW1xcdUREQUYtXFx1RERCM1xcdUREQkNcXHVEREJEXSl8XFx1RDgzQ1xcdURGRkNcXHUyMDBEKD86XFx1RDgzRVxcdUREMURcXHUyMDBEXFx1RDgzRFxcdURDNjgoPzpcXHVEODNDW1xcdURGRkJcXHVERkZELVxcdURGRkZdKXxcXHVEODNDW1xcdURGM0VcXHVERjczXFx1REY3Q1xcdURGOTNcXHVERkE0XFx1REZBOFxcdURGRUJcXHVERkVEXXxcXHVEODNEW1xcdURDQkJcXHVEQ0JDXFx1REQyN1xcdUREMkNcXHVERTgwXFx1REU5Ml18XFx1RDgzRVtcXHVEREFGLVxcdUREQjNcXHVEREJDXFx1RERCRF0pfCg/OlxcdUQ4M0NcXHVERkZGXFx1MjAwRFtcXHUyNjk1XFx1MjY5NlxcdTI3MDhdfFxcdUQ4M0NcXHVERkZFXFx1MjAwRFtcXHUyNjk1XFx1MjY5NlxcdTI3MDhdfFxcdUQ4M0NcXHVERkZEXFx1MjAwRFtcXHUyNjk1XFx1MjY5NlxcdTI3MDhdfFxcdUQ4M0NcXHVERkZDXFx1MjAwRFtcXHUyNjk1XFx1MjY5NlxcdTI3MDhdfFxcdTIwMERbXFx1MjY5NVxcdTI2OTZcXHUyNzA4XSlcXHVGRTBGfFxcdTIwMEQoPzooPzpcXHVEODNEW1xcdURDNjhcXHVEQzY5XSlcXHUyMDBEKD86XFx1RDgzRFtcXHVEQzY2XFx1REM2N10pfFxcdUQ4M0RbXFx1REM2NlxcdURDNjddKXxcXHVEODNDXFx1REZGRnxcXHVEODNDXFx1REZGRXxcXHVEODNDXFx1REZGRHxcXHVEODNDXFx1REZGQyk/fCg/OlxcdUQ4M0RcXHVEQzY5KD86XFx1RDgzQ1xcdURGRkJcXHUyMDBEXFx1Mjc2NFxcdUZFMEZcXHUyMDBEKD86XFx1RDgzRFxcdURDOEJcXHUyMDBEKD86XFx1RDgzRFtcXHVEQzY4XFx1REM2OV0pfFxcdUQ4M0RbXFx1REM2OFxcdURDNjldKXwoPzpcXHVEODNDW1xcdURGRkMtXFx1REZGRl0pXFx1MjAwRFxcdTI3NjRcXHVGRTBGXFx1MjAwRCg/OlxcdUQ4M0RcXHVEQzhCXFx1MjAwRCg/OlxcdUQ4M0RbXFx1REM2OFxcdURDNjldKXxcXHVEODNEW1xcdURDNjhcXHVEQzY5XSkpfFxcdUQ4M0VcXHVEREQxKD86XFx1RDgzQ1tcXHVERkZCLVxcdURGRkZdKVxcdTIwMERcXHVEODNFXFx1REQxRFxcdTIwMERcXHVEODNFXFx1REREMSkoPzpcXHVEODNDW1xcdURGRkItXFx1REZGRl0pfFxcdUQ4M0RcXHVEQzY5XFx1MjAwRFxcdUQ4M0RcXHVEQzY5XFx1MjAwRCg/OlxcdUQ4M0RcXHVEQzY2XFx1MjAwRFxcdUQ4M0RcXHVEQzY2fFxcdUQ4M0RcXHVEQzY3XFx1MjAwRCg/OlxcdUQ4M0RbXFx1REM2NlxcdURDNjddKSl8XFx1RDgzRFxcdURDNjkoPzpcXHUyMDBEKD86XFx1Mjc2NFxcdUZFMEZcXHUyMDBEKD86XFx1RDgzRFxcdURDOEJcXHUyMDBEKD86XFx1RDgzRFtcXHVEQzY4XFx1REM2OV0pfFxcdUQ4M0RbXFx1REM2OFxcdURDNjldKXxcXHVEODNDW1xcdURGM0VcXHVERjczXFx1REY3Q1xcdURGOTNcXHVERkE0XFx1REZBOFxcdURGRUJcXHVERkVEXXxcXHVEODNEW1xcdURDQkJcXHVEQ0JDXFx1REQyN1xcdUREMkNcXHVERTgwXFx1REU5Ml18XFx1RDgzRVtcXHVEREFGLVxcdUREQjNcXHVEREJDXFx1RERCRF0pfFxcdUQ4M0NcXHVERkZGXFx1MjAwRCg/OlxcdUQ4M0NbXFx1REYzRVxcdURGNzNcXHVERjdDXFx1REY5M1xcdURGQTRcXHVERkE4XFx1REZFQlxcdURGRURdfFxcdUQ4M0RbXFx1RENCQlxcdURDQkNcXHVERDI3XFx1REQyQ1xcdURFODBcXHVERTkyXXxcXHVEODNFW1xcdUREQUYtXFx1RERCM1xcdUREQkNcXHVEREJEXSl8XFx1RDgzQ1xcdURGRkVcXHUyMDBEKD86XFx1RDgzQ1tcXHVERjNFXFx1REY3M1xcdURGN0NcXHVERjkzXFx1REZBNFxcdURGQThcXHVERkVCXFx1REZFRF18XFx1RDgzRFtcXHVEQ0JCXFx1RENCQ1xcdUREMjdcXHVERDJDXFx1REU4MFxcdURFOTJdfFxcdUQ4M0VbXFx1RERBRi1cXHVEREIzXFx1RERCQ1xcdUREQkRdKXxcXHVEODNDXFx1REZGRFxcdTIwMEQoPzpcXHVEODNDW1xcdURGM0VcXHVERjczXFx1REY3Q1xcdURGOTNcXHVERkE0XFx1REZBOFxcdURGRUJcXHVERkVEXXxcXHVEODNEW1xcdURDQkJcXHVEQ0JDXFx1REQyN1xcdUREMkNcXHVERTgwXFx1REU5Ml18XFx1RDgzRVtcXHVEREFGLVxcdUREQjNcXHVEREJDXFx1RERCRF0pfFxcdUQ4M0NcXHVERkZDXFx1MjAwRCg/OlxcdUQ4M0NbXFx1REYzRVxcdURGNzNcXHVERjdDXFx1REY5M1xcdURGQTRcXHVERkE4XFx1REZFQlxcdURGRURdfFxcdUQ4M0RbXFx1RENCQlxcdURDQkNcXHVERDI3XFx1REQyQ1xcdURFODBcXHVERTkyXXxcXHVEODNFW1xcdUREQUYtXFx1RERCM1xcdUREQkNcXHVEREJEXSl8XFx1RDgzQ1xcdURGRkJcXHUyMDBEKD86XFx1RDgzQ1tcXHVERjNFXFx1REY3M1xcdURGN0NcXHVERjkzXFx1REZBNFxcdURGQThcXHVERkVCXFx1REZFRF18XFx1RDgzRFtcXHVEQ0JCXFx1RENCQ1xcdUREMjdcXHVERDJDXFx1REU4MFxcdURFOTJdfFxcdUQ4M0VbXFx1RERBRi1cXHVEREIzXFx1RERCQ1xcdUREQkRdKSl8XFx1RDgzRVxcdURERDEoPzpcXHUyMDBEKD86XFx1RDgzRVxcdUREMURcXHUyMDBEXFx1RDgzRVxcdURERDF8XFx1RDgzQ1tcXHVERjNFXFx1REY3M1xcdURGN0NcXHVERjg0XFx1REY5M1xcdURGQTRcXHVERkE4XFx1REZFQlxcdURGRURdfFxcdUQ4M0RbXFx1RENCQlxcdURDQkNcXHVERDI3XFx1REQyQ1xcdURFODBcXHVERTkyXXxcXHVEODNFW1xcdUREQUYtXFx1RERCM1xcdUREQkNcXHVEREJEXSl8XFx1RDgzQ1xcdURGRkZcXHUyMDBEKD86XFx1RDgzQ1tcXHVERjNFXFx1REY3M1xcdURGN0NcXHVERjg0XFx1REY5M1xcdURGQTRcXHVERkE4XFx1REZFQlxcdURGRURdfFxcdUQ4M0RbXFx1RENCQlxcdURDQkNcXHVERDI3XFx1REQyQ1xcdURFODBcXHVERTkyXXxcXHVEODNFW1xcdUREQUYtXFx1RERCM1xcdUREQkNcXHVEREJEXSl8XFx1RDgzQ1xcdURGRkVcXHUyMDBEKD86XFx1RDgzQ1tcXHVERjNFXFx1REY3M1xcdURGN0NcXHVERjg0XFx1REY5M1xcdURGQTRcXHVERkE4XFx1REZFQlxcdURGRURdfFxcdUQ4M0RbXFx1RENCQlxcdURDQkNcXHVERDI3XFx1REQyQ1xcdURFODBcXHVERTkyXXxcXHVEODNFW1xcdUREQUYtXFx1RERCM1xcdUREQkNcXHVEREJEXSl8XFx1RDgzQ1xcdURGRkRcXHUyMDBEKD86XFx1RDgzQ1tcXHVERjNFXFx1REY3M1xcdURGN0NcXHVERjg0XFx1REY5M1xcdURGQTRcXHVERkE4XFx1REZFQlxcdURGRURdfFxcdUQ4M0RbXFx1RENCQlxcdURDQkNcXHVERDI3XFx1REQyQ1xcdURFODBcXHVERTkyXXxcXHVEODNFW1xcdUREQUYtXFx1RERCM1xcdUREQkNcXHVEREJEXSl8XFx1RDgzQ1xcdURGRkNcXHUyMDBEKD86XFx1RDgzQ1tcXHVERjNFXFx1REY3M1xcdURGN0NcXHVERjg0XFx1REY5M1xcdURGQTRcXHVERkE4XFx1REZFQlxcdURGRURdfFxcdUQ4M0RbXFx1RENCQlxcdURDQkNcXHVERDI3XFx1REQyQ1xcdURFODBcXHVERTkyXXxcXHVEODNFW1xcdUREQUYtXFx1RERCM1xcdUREQkNcXHVEREJEXSl8XFx1RDgzQ1xcdURGRkJcXHUyMDBEKD86XFx1RDgzQ1tcXHVERjNFXFx1REY3M1xcdURGN0NcXHVERjg0XFx1REY5M1xcdURGQTRcXHVERkE4XFx1REZFQlxcdURGRURdfFxcdUQ4M0RbXFx1RENCQlxcdURDQkNcXHVERDI3XFx1REQyQ1xcdURFODBcXHVERTkyXXxcXHVEODNFW1xcdUREQUYtXFx1RERCM1xcdUREQkNcXHVEREJEXSkpfFxcdUQ4M0RcXHVEQzY5XFx1MjAwRFxcdUQ4M0RcXHVEQzY2XFx1MjAwRFxcdUQ4M0RcXHVEQzY2fFxcdUQ4M0RcXHVEQzY5XFx1MjAwRFxcdUQ4M0RcXHVEQzY5XFx1MjAwRCg/OlxcdUQ4M0RbXFx1REM2NlxcdURDNjddKXxcXHVEODNEXFx1REM2OVxcdTIwMERcXHVEODNEXFx1REM2N1xcdTIwMEQoPzpcXHVEODNEW1xcdURDNjZcXHVEQzY3XSl8KD86XFx1RDgzRFxcdURDNDFcXHVGRTBGXFx1MjAwRFxcdUQ4M0RcXHVEREU4fFxcdUQ4M0VcXHVEREQxKD86XFx1RDgzQ1xcdURGRkZcXHUyMDBEW1xcdTI2OTVcXHUyNjk2XFx1MjcwOF18XFx1RDgzQ1xcdURGRkVcXHUyMDBEW1xcdTI2OTVcXHUyNjk2XFx1MjcwOF18XFx1RDgzQ1xcdURGRkRcXHUyMDBEW1xcdTI2OTVcXHUyNjk2XFx1MjcwOF18XFx1RDgzQ1xcdURGRkNcXHUyMDBEW1xcdTI2OTVcXHUyNjk2XFx1MjcwOF18XFx1RDgzQ1xcdURGRkJcXHUyMDBEW1xcdTI2OTVcXHUyNjk2XFx1MjcwOF18XFx1MjAwRFtcXHUyNjk1XFx1MjY5NlxcdTI3MDhdKXxcXHVEODNEXFx1REM2OSg/OlxcdUQ4M0NcXHVERkZGXFx1MjAwRFtcXHUyNjk1XFx1MjY5NlxcdTI3MDhdfFxcdUQ4M0NcXHVERkZFXFx1MjAwRFtcXHUyNjk1XFx1MjY5NlxcdTI3MDhdfFxcdUQ4M0NcXHVERkZEXFx1MjAwRFtcXHUyNjk1XFx1MjY5NlxcdTI3MDhdfFxcdUQ4M0NcXHVERkZDXFx1MjAwRFtcXHUyNjk1XFx1MjY5NlxcdTI3MDhdfFxcdUQ4M0NcXHVERkZCXFx1MjAwRFtcXHUyNjk1XFx1MjY5NlxcdTI3MDhdfFxcdTIwMERbXFx1MjY5NVxcdTI2OTZcXHUyNzA4XSl8XFx1RDgzRFxcdURFMzZcXHUyMDBEXFx1RDgzQ1xcdURGMkJ8XFx1RDgzQ1xcdURGRjNcXHVGRTBGXFx1MjAwRFxcdTI2QTd8XFx1RDgzRFxcdURDM0JcXHUyMDBEXFx1Mjc0NHwoPzooPzpcXHVEODNDW1xcdURGQzNcXHVERkM0XFx1REZDQV18XFx1RDgzRFtcXHVEQzZFXFx1REM3MFxcdURDNzFcXHVEQzczXFx1REM3N1xcdURDODFcXHVEQzgyXFx1REM4NlxcdURDODdcXHVERTQ1LVxcdURFNDdcXHVERTRCXFx1REU0RFxcdURFNEVcXHVERUEzXFx1REVCNC1cXHVERUI2XXxcXHVEODNFW1xcdUREMjZcXHVERDM1XFx1REQzNy1cXHVERDM5XFx1REQzRFxcdUREM0VcXHVEREI4XFx1RERCOVxcdUREQ0QtXFx1RERDRlxcdURERDRcXHVEREQ2LVxcdURERERdKSg/OlxcdUQ4M0NbXFx1REZGQi1cXHVERkZGXSl8XFx1RDgzRFxcdURDNkZ8XFx1RDgzRVtcXHVERDNDXFx1RERERVxcdUREREZdKVxcdTIwMERbXFx1MjY0MFxcdTI2NDJdfCg/OlxcdTI2Rjl8XFx1RDgzQ1tcXHVERkNCXFx1REZDQ118XFx1RDgzRFxcdURENzUpKD86XFx1RkUwRnxcXHVEODNDW1xcdURGRkItXFx1REZGRl0pXFx1MjAwRFtcXHUyNjQwXFx1MjY0Ml18XFx1RDgzQ1xcdURGRjRcXHUyMDBEXFx1MjYyMHwoPzpcXHVEODNDW1xcdURGQzNcXHVERkM0XFx1REZDQV18XFx1RDgzRFtcXHVEQzZFXFx1REM3MFxcdURDNzFcXHVEQzczXFx1REM3N1xcdURDODFcXHVEQzgyXFx1REM4NlxcdURDODdcXHVERTQ1LVxcdURFNDdcXHVERTRCXFx1REU0RFxcdURFNEVcXHVERUEzXFx1REVCNC1cXHVERUI2XXxcXHVEODNFW1xcdUREMjZcXHVERDM1XFx1REQzNy1cXHVERDM5XFx1REQzRFxcdUREM0VcXHVEREI4XFx1RERCOVxcdUREQ0QtXFx1RERDRlxcdURERDRcXHVEREQ2LVxcdURERERdKVxcdTIwMERbXFx1MjY0MFxcdTI2NDJdfFtcXHhBOVxceEFFXFx1MjAzQ1xcdTIwNDlcXHUyMTIyXFx1MjEzOVxcdTIxOTQtXFx1MjE5OVxcdTIxQTlcXHUyMUFBXFx1MjMyOFxcdTIzQ0ZcXHUyM0VELVxcdTIzRUZcXHUyM0YxXFx1MjNGMlxcdTIzRjgtXFx1MjNGQVxcdTI0QzJcXHUyNUFBXFx1MjVBQlxcdTI1QjZcXHUyNUMwXFx1MjVGQlxcdTI1RkNcXHUyNjAwLVxcdTI2MDRcXHUyNjBFXFx1MjYxMVxcdTI2MThcXHUyNjIwXFx1MjYyMlxcdTI2MjNcXHUyNjI2XFx1MjYyQVxcdTI2MkVcXHUyNjJGXFx1MjYzOC1cXHUyNjNBXFx1MjY0MFxcdTI2NDJcXHUyNjVGXFx1MjY2MFxcdTI2NjNcXHUyNjY1XFx1MjY2NlxcdTI2NjhcXHUyNjdCXFx1MjY3RVxcdTI2OTJcXHUyNjk0LVxcdTI2OTdcXHUyNjk5XFx1MjY5QlxcdTI2OUNcXHUyNkEwXFx1MjZBN1xcdTI2QjBcXHUyNkIxXFx1MjZDOFxcdTI2Q0ZcXHUyNkQxXFx1MjZEM1xcdTI2RTlcXHUyNkYwXFx1MjZGMVxcdTI2RjRcXHUyNkY3XFx1MjZGOFxcdTI3MDJcXHUyNzA4XFx1MjcwOVxcdTI3MEZcXHUyNzEyXFx1MjcxNFxcdTI3MTZcXHUyNzFEXFx1MjcyMVxcdTI3MzNcXHUyNzM0XFx1Mjc0NFxcdTI3NDdcXHUyNzYzXFx1MjdBMVxcdTI5MzRcXHUyOTM1XFx1MkIwNS1cXHUyQjA3XFx1MzAzMFxcdTMwM0RcXHUzMjk3XFx1MzI5OV18XFx1RDgzQ1tcXHVERDcwXFx1REQ3MVxcdUREN0VcXHVERDdGXFx1REUwMlxcdURFMzdcXHVERjIxXFx1REYyNC1cXHVERjJDXFx1REYzNlxcdURGN0RcXHVERjk2XFx1REY5N1xcdURGOTktXFx1REY5QlxcdURGOUVcXHVERjlGXFx1REZDRFxcdURGQ0VcXHVERkQ0LVxcdURGREZcXHVERkY1XFx1REZGN118XFx1RDgzRFtcXHVEQzNGXFx1RENGRFxcdURENDlcXHVERDRBXFx1REQ2RlxcdURENzBcXHVERDczXFx1REQ3Ni1cXHVERDc5XFx1REQ4N1xcdUREOEEtXFx1REQ4RFxcdUREQTVcXHVEREE4XFx1RERCMVxcdUREQjJcXHVEREJDXFx1RERDMi1cXHVEREM0XFx1REREMS1cXHVEREQzXFx1REREQy1cXHVERERFXFx1RERFMVxcdURERTNcXHVEREU4XFx1RERFRlxcdURERjNcXHVEREZBXFx1REVDQlxcdURFQ0QtXFx1REVDRlxcdURFRTAtXFx1REVFNVxcdURFRTlcXHVERUYwXFx1REVGM10pXFx1RkUwRnxcXHVEODNDXFx1REZGM1xcdUZFMEZcXHUyMDBEXFx1RDgzQ1xcdURGMDh8XFx1RDgzRFxcdURDNjlcXHUyMDBEXFx1RDgzRFxcdURDNjd8XFx1RDgzRFxcdURDNjlcXHUyMDBEXFx1RDgzRFxcdURDNjZ8XFx1RDgzRFxcdURFMzVcXHUyMDBEXFx1RDgzRFxcdURDQUJ8XFx1RDgzRFxcdURFMkVcXHUyMDBEXFx1RDgzRFxcdURDQTh8XFx1RDgzRFxcdURDMTVcXHUyMDBEXFx1RDgzRVxcdUREQkF8XFx1RDgzRVxcdURERDEoPzpcXHVEODNDXFx1REZGRnxcXHVEODNDXFx1REZGRXxcXHVEODNDXFx1REZGRHxcXHVEODNDXFx1REZGQ3xcXHVEODNDXFx1REZGQik/fFxcdUQ4M0RcXHVEQzY5KD86XFx1RDgzQ1xcdURGRkZ8XFx1RDgzQ1xcdURGRkV8XFx1RDgzQ1xcdURGRkR8XFx1RDgzQ1xcdURGRkN8XFx1RDgzQ1xcdURGRkIpP3xcXHVEODNDXFx1RERGRFxcdUQ4M0NcXHVEREYwfFxcdUQ4M0NcXHVEREY2XFx1RDgzQ1xcdURERTZ8XFx1RDgzQ1xcdURERjRcXHVEODNDXFx1RERGMnxcXHVEODNEXFx1REMwOFxcdTIwMERcXHUyQjFCfFxcdTI3NjRcXHVGRTBGXFx1MjAwRCg/OlxcdUQ4M0RcXHVERDI1fFxcdUQ4M0VcXHVERTc5KXxcXHVEODNEXFx1REM0MVxcdUZFMEZ8XFx1RDgzQ1xcdURGRjNcXHVGRTBGfFxcdUQ4M0NcXHVEREZGKD86XFx1RDgzQ1tcXHVEREU2XFx1RERGMlxcdURERkNdKXxcXHVEODNDXFx1RERGRSg/OlxcdUQ4M0NbXFx1RERFQVxcdURERjldKXxcXHVEODNDXFx1RERGQyg/OlxcdUQ4M0NbXFx1RERFQlxcdURERjhdKXxcXHVEODNDXFx1RERGQig/OlxcdUQ4M0NbXFx1RERFNlxcdURERThcXHVEREVBXFx1RERFQ1xcdURERUVcXHVEREYzXFx1RERGQV0pfFxcdUQ4M0NcXHVEREZBKD86XFx1RDgzQ1tcXHVEREU2XFx1RERFQ1xcdURERjJcXHVEREYzXFx1RERGOFxcdURERkVcXHVEREZGXSl8XFx1RDgzQ1xcdURERjkoPzpcXHVEODNDW1xcdURERTZcXHVEREU4XFx1RERFOVxcdURERUItXFx1RERFRFxcdURERUYtXFx1RERGNFxcdURERjdcXHVEREY5XFx1RERGQlxcdURERkNcXHVEREZGXSl8XFx1RDgzQ1xcdURERjgoPzpcXHVEODNDW1xcdURERTYtXFx1RERFQVxcdURERUMtXFx1RERGNFxcdURERjctXFx1RERGOVxcdURERkJcXHVEREZELVxcdURERkZdKXxcXHVEODNDXFx1RERGNyg/OlxcdUQ4M0NbXFx1RERFQVxcdURERjRcXHVEREY4XFx1RERGQVxcdURERkNdKXxcXHVEODNDXFx1RERGNSg/OlxcdUQ4M0NbXFx1RERFNlxcdURERUEtXFx1RERFRFxcdURERjAtXFx1RERGM1xcdURERjctXFx1RERGOVxcdURERkNcXHVEREZFXSl8XFx1RDgzQ1xcdURERjMoPzpcXHVEODNDW1xcdURERTZcXHVEREU4XFx1RERFQS1cXHVEREVDXFx1RERFRVxcdURERjFcXHVEREY0XFx1RERGNVxcdURERjdcXHVEREZBXFx1RERGRl0pfFxcdUQ4M0NcXHVEREYyKD86XFx1RDgzQ1tcXHVEREU2XFx1RERFOC1cXHVEREVEXFx1RERGMC1cXHVEREZGXSl8XFx1RDgzQ1xcdURERjEoPzpcXHVEODNDW1xcdURERTYtXFx1RERFOFxcdURERUVcXHVEREYwXFx1RERGNy1cXHVEREZCXFx1RERGRV0pfFxcdUQ4M0NcXHVEREYwKD86XFx1RDgzQ1tcXHVEREVBXFx1RERFQy1cXHVEREVFXFx1RERGMlxcdURERjNcXHVEREY1XFx1RERGN1xcdURERkNcXHVEREZFXFx1RERGRl0pfFxcdUQ4M0NcXHVEREVGKD86XFx1RDgzQ1tcXHVEREVBXFx1RERGMlxcdURERjRcXHVEREY1XSl8XFx1RDgzQ1xcdURERUUoPzpcXHVEODNDW1xcdURERTgtXFx1RERFQVxcdURERjEtXFx1RERGNFxcdURERjYtXFx1RERGOV0pfFxcdUQ4M0NcXHVEREVEKD86XFx1RDgzQ1tcXHVEREYwXFx1RERGMlxcdURERjNcXHVEREY3XFx1RERGOVxcdURERkFdKXxcXHVEODNDXFx1RERFQyg/OlxcdUQ4M0NbXFx1RERFNlxcdURERTdcXHVEREU5LVxcdURERUVcXHVEREYxLVxcdURERjNcXHVEREY1LVxcdURERkFcXHVEREZDXFx1RERGRV0pfFxcdUQ4M0NcXHVEREVCKD86XFx1RDgzQ1tcXHVEREVFLVxcdURERjBcXHVEREYyXFx1RERGNFxcdURERjddKXxcXHVEODNDXFx1RERFQSg/OlxcdUQ4M0NbXFx1RERFNlxcdURERThcXHVEREVBXFx1RERFQ1xcdURERURcXHVEREY3LVxcdURERkFdKXxcXHVEODNDXFx1RERFOSg/OlxcdUQ4M0NbXFx1RERFQVxcdURERUNcXHVEREVGXFx1RERGMFxcdURERjJcXHVEREY0XFx1RERGRl0pfFxcdUQ4M0NcXHVEREU4KD86XFx1RDgzQ1tcXHVEREU2XFx1RERFOFxcdURERTlcXHVEREVCLVxcdURERUVcXHVEREYwLVxcdURERjVcXHVEREY3XFx1RERGQS1cXHVEREZGXSl8XFx1RDgzQ1xcdURERTcoPzpcXHVEODNDW1xcdURERTZcXHVEREU3XFx1RERFOS1cXHVEREVGXFx1RERGMS1cXHVEREY0XFx1RERGNi1cXHVEREY5XFx1RERGQlxcdURERkNcXHVEREZFXFx1RERGRl0pfFxcdUQ4M0NcXHVEREU2KD86XFx1RDgzQ1tcXHVEREU4LVxcdURERUNcXHVEREVFXFx1RERGMVxcdURERjJcXHVEREY0XFx1RERGNi1cXHVEREZBXFx1RERGQ1xcdURERkRcXHVEREZGXSl8WyNcXCowLTldXFx1RkUwRlxcdTIwRTN8XFx1Mjc2NFxcdUZFMEZ8KD86XFx1RDgzQ1tcXHVERkMzXFx1REZDNFxcdURGQ0FdfFxcdUQ4M0RbXFx1REM2RVxcdURDNzBcXHVEQzcxXFx1REM3M1xcdURDNzdcXHVEQzgxXFx1REM4MlxcdURDODZcXHVEQzg3XFx1REU0NS1cXHVERTQ3XFx1REU0QlxcdURFNERcXHVERTRFXFx1REVBM1xcdURFQjQtXFx1REVCNl18XFx1RDgzRVtcXHVERDI2XFx1REQzNVxcdUREMzctXFx1REQzOVxcdUREM0RcXHVERDNFXFx1RERCOFxcdUREQjlcXHVERENELVxcdUREQ0ZcXHVEREQ0XFx1RERENi1cXHVEREREXSkoPzpcXHVEODNDW1xcdURGRkItXFx1REZGRl0pfCg/OlxcdTI2Rjl8XFx1RDgzQ1tcXHVERkNCXFx1REZDQ118XFx1RDgzRFxcdURENzUpKD86XFx1RkUwRnxcXHVEODNDW1xcdURGRkItXFx1REZGRl0pfFxcdUQ4M0NcXHVERkY0fCg/OltcXHUyNzBBXFx1MjcwQl18XFx1RDgzQ1tcXHVERjg1XFx1REZDMlxcdURGQzddfFxcdUQ4M0RbXFx1REM0MlxcdURDNDNcXHVEQzQ2LVxcdURDNTBcXHVEQzY2XFx1REM2N1xcdURDNkItXFx1REM2RFxcdURDNzJcXHVEQzc0LVxcdURDNzZcXHVEQzc4XFx1REM3Q1xcdURDODNcXHVEQzg1XFx1REM4RlxcdURDOTFcXHVEQ0FBXFx1REQ3QVxcdUREOTVcXHVERDk2XFx1REU0Q1xcdURFNEZcXHVERUMwXFx1REVDQ118XFx1RDgzRVtcXHVERDBDXFx1REQwRlxcdUREMTgtXFx1REQxQ1xcdUREMUVcXHVERDFGXFx1REQzMC1cXHVERDM0XFx1REQzNlxcdURENzdcXHVEREI1XFx1RERCNlxcdUREQkJcXHVEREQyXFx1REREM1xcdURERDVdKSg/OlxcdUQ4M0NbXFx1REZGQi1cXHVERkZGXSl8KD86W1xcdTI2MURcXHUyNzBDXFx1MjcwRF18XFx1RDgzRFtcXHVERDc0XFx1REQ5MF0pKD86XFx1RkUwRnxcXHVEODNDW1xcdURGRkItXFx1REZGRl0pfFtcXHUyNzBBXFx1MjcwQl18XFx1RDgzQ1tcXHVERjg1XFx1REZDMlxcdURGQzddfFxcdUQ4M0RbXFx1REMwOFxcdURDMTVcXHVEQzNCXFx1REM0MlxcdURDNDNcXHVEQzQ2LVxcdURDNTBcXHVEQzY2XFx1REM2N1xcdURDNkItXFx1REM2RFxcdURDNzJcXHVEQzc0LVxcdURDNzZcXHVEQzc4XFx1REM3Q1xcdURDODNcXHVEQzg1XFx1REM4RlxcdURDOTFcXHVEQ0FBXFx1REQ3QVxcdUREOTVcXHVERDk2XFx1REUyRVxcdURFMzVcXHVERTM2XFx1REU0Q1xcdURFNEZcXHVERUMwXFx1REVDQ118XFx1RDgzRVtcXHVERDBDXFx1REQwRlxcdUREMTgtXFx1REQxQ1xcdUREMUVcXHVERDFGXFx1REQzMC1cXHVERDM0XFx1REQzNlxcdURENzdcXHVEREI1XFx1RERCNlxcdUREQkJcXHVEREQyXFx1REREM1xcdURERDVdfFxcdUQ4M0NbXFx1REZDM1xcdURGQzRcXHVERkNBXXxcXHVEODNEW1xcdURDNkVcXHVEQzcwXFx1REM3MVxcdURDNzNcXHVEQzc3XFx1REM4MVxcdURDODJcXHVEQzg2XFx1REM4N1xcdURFNDUtXFx1REU0N1xcdURFNEJcXHVERTREXFx1REU0RVxcdURFQTNcXHVERUI0LVxcdURFQjZdfFxcdUQ4M0VbXFx1REQyNlxcdUREMzVcXHVERDM3LVxcdUREMzlcXHVERDNEXFx1REQzRVxcdUREQjhcXHVEREI5XFx1RERDRC1cXHVERENGXFx1RERENFxcdURERDYtXFx1RERERF18XFx1RDgzRFxcdURDNkZ8XFx1RDgzRVtcXHVERDNDXFx1RERERVxcdUREREZdfFtcXHUyMzFBXFx1MjMxQlxcdTIzRTktXFx1MjNFQ1xcdTIzRjBcXHUyM0YzXFx1MjVGRFxcdTI1RkVcXHUyNjE0XFx1MjYxNVxcdTI2NDgtXFx1MjY1M1xcdTI2N0ZcXHUyNjkzXFx1MjZBMVxcdTI2QUFcXHUyNkFCXFx1MjZCRFxcdTI2QkVcXHUyNkM0XFx1MjZDNVxcdTI2Q0VcXHUyNkQ0XFx1MjZFQVxcdTI2RjJcXHUyNkYzXFx1MjZGNVxcdTI2RkFcXHUyNkZEXFx1MjcwNVxcdTI3MjhcXHUyNzRDXFx1Mjc0RVxcdTI3NTMtXFx1Mjc1NVxcdTI3NTdcXHUyNzk1LVxcdTI3OTdcXHUyN0IwXFx1MjdCRlxcdTJCMUJcXHUyQjFDXFx1MkI1MFxcdTJCNTVdfFxcdUQ4M0NbXFx1REMwNFxcdURDQ0ZcXHVERDhFXFx1REQ5MS1cXHVERDlBXFx1REUwMVxcdURFMUFcXHVERTJGXFx1REUzMi1cXHVERTM2XFx1REUzOC1cXHVERTNBXFx1REU1MFxcdURFNTFcXHVERjAwLVxcdURGMjBcXHVERjJELVxcdURGMzVcXHVERjM3LVxcdURGN0NcXHVERjdFLVxcdURGODRcXHVERjg2LVxcdURGOTNcXHVERkEwLVxcdURGQzFcXHVERkM1XFx1REZDNlxcdURGQzhcXHVERkM5XFx1REZDRi1cXHVERkQzXFx1REZFMC1cXHVERkYwXFx1REZGOC1cXHVERkZGXXxcXHVEODNEW1xcdURDMDAtXFx1REMwN1xcdURDMDktXFx1REMxNFxcdURDMTYtXFx1REMzQVxcdURDM0MtXFx1REMzRVxcdURDNDBcXHVEQzQ0XFx1REM0NVxcdURDNTEtXFx1REM2NVxcdURDNkFcXHVEQzc5LVxcdURDN0JcXHVEQzdELVxcdURDODBcXHVEQzg0XFx1REM4OC1cXHVEQzhFXFx1REM5MFxcdURDOTItXFx1RENBOVxcdURDQUItXFx1RENGQ1xcdURDRkYtXFx1REQzRFxcdURENEItXFx1REQ0RVxcdURENTAtXFx1REQ2N1xcdUREQTRcXHVEREZCLVxcdURFMkRcXHVERTJGLVxcdURFMzRcXHVERTM3LVxcdURFNDRcXHVERTQ4LVxcdURFNEFcXHVERTgwLVxcdURFQTJcXHVERUE0LVxcdURFQjNcXHVERUI3LVxcdURFQkZcXHVERUMxLVxcdURFQzVcXHVERUQwLVxcdURFRDJcXHVERUQ1LVxcdURFRDdcXHVERUVCXFx1REVFQ1xcdURFRjQtXFx1REVGQ1xcdURGRTAtXFx1REZFQl18XFx1RDgzRVtcXHVERDBEXFx1REQwRVxcdUREMTAtXFx1REQxN1xcdUREMURcXHVERDIwLVxcdUREMjVcXHVERDI3LVxcdUREMkZcXHVERDNBXFx1REQzRi1cXHVERDQ1XFx1REQ0Ny1cXHVERDc2XFx1REQ3OFxcdUREN0EtXFx1RERCNFxcdUREQjdcXHVEREJBXFx1RERCQy1cXHVERENCXFx1REREMFxcdURERTAtXFx1RERGRlxcdURFNzAtXFx1REU3NFxcdURFNzgtXFx1REU3QVxcdURFODAtXFx1REU4NlxcdURFOTAtXFx1REVBOFxcdURFQjAtXFx1REVCNlxcdURFQzAtXFx1REVDMlxcdURFRDAtXFx1REVENl18KD86W1xcdTIzMUFcXHUyMzFCXFx1MjNFOS1cXHUyM0VDXFx1MjNGMFxcdTIzRjNcXHUyNUZEXFx1MjVGRVxcdTI2MTRcXHUyNjE1XFx1MjY0OC1cXHUyNjUzXFx1MjY3RlxcdTI2OTNcXHUyNkExXFx1MjZBQVxcdTI2QUJcXHUyNkJEXFx1MjZCRVxcdTI2QzRcXHUyNkM1XFx1MjZDRVxcdTI2RDRcXHUyNkVBXFx1MjZGMlxcdTI2RjNcXHUyNkY1XFx1MjZGQVxcdTI2RkRcXHUyNzA1XFx1MjcwQVxcdTI3MEJcXHUyNzI4XFx1Mjc0Q1xcdTI3NEVcXHUyNzUzLVxcdTI3NTVcXHUyNzU3XFx1Mjc5NS1cXHUyNzk3XFx1MjdCMFxcdTI3QkZcXHUyQjFCXFx1MkIxQ1xcdTJCNTBcXHUyQjU1XXxcXHVEODNDW1xcdURDMDRcXHVEQ0NGXFx1REQ4RVxcdUREOTEtXFx1REQ5QVxcdURERTYtXFx1RERGRlxcdURFMDFcXHVERTFBXFx1REUyRlxcdURFMzItXFx1REUzNlxcdURFMzgtXFx1REUzQVxcdURFNTBcXHVERTUxXFx1REYwMC1cXHVERjIwXFx1REYyRC1cXHVERjM1XFx1REYzNy1cXHVERjdDXFx1REY3RS1cXHVERjkzXFx1REZBMC1cXHVERkNBXFx1REZDRi1cXHVERkQzXFx1REZFMC1cXHVERkYwXFx1REZGNFxcdURGRjgtXFx1REZGRl18XFx1RDgzRFtcXHVEQzAwLVxcdURDM0VcXHVEQzQwXFx1REM0Mi1cXHVEQ0ZDXFx1RENGRi1cXHVERDNEXFx1REQ0Qi1cXHVERDRFXFx1REQ1MC1cXHVERDY3XFx1REQ3QVxcdUREOTVcXHVERDk2XFx1RERBNFxcdURERkItXFx1REU0RlxcdURFODAtXFx1REVDNVxcdURFQ0NcXHVERUQwLVxcdURFRDJcXHVERUQ1LVxcdURFRDdcXHVERUVCXFx1REVFQ1xcdURFRjQtXFx1REVGQ1xcdURGRTAtXFx1REZFQl18XFx1RDgzRVtcXHVERDBDLVxcdUREM0FcXHVERDNDLVxcdURENDVcXHVERDQ3LVxcdURENzhcXHVERDdBLVxcdUREQ0JcXHVERENELVxcdURERkZcXHVERTcwLVxcdURFNzRcXHVERTc4LVxcdURFN0FcXHVERTgwLVxcdURFODZcXHVERTkwLVxcdURFQThcXHVERUIwLVxcdURFQjZcXHVERUMwLVxcdURFQzJcXHVERUQwLVxcdURFRDZdKXwoPzpbI1xcKjAtOVxceEE5XFx4QUVcXHUyMDNDXFx1MjA0OVxcdTIxMjJcXHUyMTM5XFx1MjE5NC1cXHUyMTk5XFx1MjFBOVxcdTIxQUFcXHUyMzFBXFx1MjMxQlxcdTIzMjhcXHUyM0NGXFx1MjNFOS1cXHUyM0YzXFx1MjNGOC1cXHUyM0ZBXFx1MjRDMlxcdTI1QUFcXHUyNUFCXFx1MjVCNlxcdTI1QzBcXHUyNUZCLVxcdTI1RkVcXHUyNjAwLVxcdTI2MDRcXHUyNjBFXFx1MjYxMVxcdTI2MTRcXHUyNjE1XFx1MjYxOFxcdTI2MURcXHUyNjIwXFx1MjYyMlxcdTI2MjNcXHUyNjI2XFx1MjYyQVxcdTI2MkVcXHUyNjJGXFx1MjYzOC1cXHUyNjNBXFx1MjY0MFxcdTI2NDJcXHUyNjQ4LVxcdTI2NTNcXHUyNjVGXFx1MjY2MFxcdTI2NjNcXHUyNjY1XFx1MjY2NlxcdTI2NjhcXHUyNjdCXFx1MjY3RVxcdTI2N0ZcXHUyNjkyLVxcdTI2OTdcXHUyNjk5XFx1MjY5QlxcdTI2OUNcXHUyNkEwXFx1MjZBMVxcdTI2QTdcXHUyNkFBXFx1MjZBQlxcdTI2QjBcXHUyNkIxXFx1MjZCRFxcdTI2QkVcXHUyNkM0XFx1MjZDNVxcdTI2QzhcXHUyNkNFXFx1MjZDRlxcdTI2RDFcXHUyNkQzXFx1MjZENFxcdTI2RTlcXHUyNkVBXFx1MjZGMC1cXHUyNkY1XFx1MjZGNy1cXHUyNkZBXFx1MjZGRFxcdTI3MDJcXHUyNzA1XFx1MjcwOC1cXHUyNzBEXFx1MjcwRlxcdTI3MTJcXHUyNzE0XFx1MjcxNlxcdTI3MURcXHUyNzIxXFx1MjcyOFxcdTI3MzNcXHUyNzM0XFx1Mjc0NFxcdTI3NDdcXHUyNzRDXFx1Mjc0RVxcdTI3NTMtXFx1Mjc1NVxcdTI3NTdcXHUyNzYzXFx1Mjc2NFxcdTI3OTUtXFx1Mjc5N1xcdTI3QTFcXHUyN0IwXFx1MjdCRlxcdTI5MzRcXHUyOTM1XFx1MkIwNS1cXHUyQjA3XFx1MkIxQlxcdTJCMUNcXHUyQjUwXFx1MkI1NVxcdTMwMzBcXHUzMDNEXFx1MzI5N1xcdTMyOTldfFxcdUQ4M0NbXFx1REMwNFxcdURDQ0ZcXHVERDcwXFx1REQ3MVxcdUREN0VcXHVERDdGXFx1REQ4RVxcdUREOTEtXFx1REQ5QVxcdURERTYtXFx1RERGRlxcdURFMDFcXHVERTAyXFx1REUxQVxcdURFMkZcXHVERTMyLVxcdURFM0FcXHVERTUwXFx1REU1MVxcdURGMDAtXFx1REYyMVxcdURGMjQtXFx1REY5M1xcdURGOTZcXHVERjk3XFx1REY5OS1cXHVERjlCXFx1REY5RS1cXHVERkYwXFx1REZGMy1cXHVERkY1XFx1REZGNy1cXHVERkZGXXxcXHVEODNEW1xcdURDMDAtXFx1RENGRFxcdURDRkYtXFx1REQzRFxcdURENDktXFx1REQ0RVxcdURENTAtXFx1REQ2N1xcdURENkZcXHVERDcwXFx1REQ3My1cXHVERDdBXFx1REQ4N1xcdUREOEEtXFx1REQ4RFxcdUREOTBcXHVERDk1XFx1REQ5NlxcdUREQTRcXHVEREE1XFx1RERBOFxcdUREQjFcXHVEREIyXFx1RERCQ1xcdUREQzItXFx1RERDNFxcdURERDEtXFx1REREM1xcdUREREMtXFx1RERERVxcdURERTFcXHVEREUzXFx1RERFOFxcdURERUZcXHVEREYzXFx1RERGQS1cXHVERTRGXFx1REU4MC1cXHVERUM1XFx1REVDQi1cXHVERUQyXFx1REVENS1cXHVERUQ3XFx1REVFMC1cXHVERUU1XFx1REVFOVxcdURFRUJcXHVERUVDXFx1REVGMFxcdURFRjMtXFx1REVGQ1xcdURGRTAtXFx1REZFQl18XFx1RDgzRVtcXHVERDBDLVxcdUREM0FcXHVERDNDLVxcdURENDVcXHVERDQ3LVxcdURENzhcXHVERDdBLVxcdUREQ0JcXHVERENELVxcdURERkZcXHVERTcwLVxcdURFNzRcXHVERTc4LVxcdURFN0FcXHVERTgwLVxcdURFODZcXHVERTkwLVxcdURFQThcXHVERUIwLVxcdURFQjZcXHVERUMwLVxcdURFQzJcXHVERUQwLVxcdURFRDZdKVxcdUZFMEZ8KD86W1xcdTI2MURcXHUyNkY5XFx1MjcwQS1cXHUyNzBEXXxcXHVEODNDW1xcdURGODVcXHVERkMyLVxcdURGQzRcXHVERkM3XFx1REZDQS1cXHVERkNDXXxcXHVEODNEW1xcdURDNDJcXHVEQzQzXFx1REM0Ni1cXHVEQzUwXFx1REM2Ni1cXHVEQzc4XFx1REM3Q1xcdURDODEtXFx1REM4M1xcdURDODUtXFx1REM4N1xcdURDOEZcXHVEQzkxXFx1RENBQVxcdURENzRcXHVERDc1XFx1REQ3QVxcdUREOTBcXHVERDk1XFx1REQ5NlxcdURFNDUtXFx1REU0N1xcdURFNEItXFx1REU0RlxcdURFQTNcXHVERUI0LVxcdURFQjZcXHVERUMwXFx1REVDQ118XFx1RDgzRVtcXHVERDBDXFx1REQwRlxcdUREMTgtXFx1REQxRlxcdUREMjZcXHVERDMwLVxcdUREMzlcXHVERDNDLVxcdUREM0VcXHVERDc3XFx1RERCNVxcdUREQjZcXHVEREI4XFx1RERCOVxcdUREQkJcXHVERENELVxcdUREQ0ZcXHVEREQxLVxcdURERERdKS9nfTtjb25zdCBzRD1MKEZEKTtmdW5jdGlvbiBwKGUsdT17fSl7aWYodHlwZW9mIGUhPVwic3RyaW5nXCJ8fGUubGVuZ3RoPT09MHx8KHU9e2FtYmlndW91c0lzTmFycm93OiEwLC4uLnV9LGU9UChlKSxlLmxlbmd0aD09PTApKXJldHVybiAwO2U9ZS5yZXBsYWNlKHNEKCksXCIgIFwiKTtjb25zdCB0PXUuYW1iaWd1b3VzSXNOYXJyb3c/MToyO2xldCBGPTA7Zm9yKGNvbnN0IHMgb2YgZSl7Y29uc3QgaT1zLmNvZGVQb2ludEF0KDApO2lmKGk8PTMxfHxpPj0xMjcmJmk8PTE1OXx8aT49NzY4JiZpPD04NzkpY29udGludWU7c3dpdGNoKGVELmVhc3RBc2lhbldpZHRoKHMpKXtjYXNlXCJGXCI6Y2FzZVwiV1wiOkYrPTI7YnJlYWs7Y2FzZVwiQVwiOkYrPXQ7YnJlYWs7ZGVmYXVsdDpGKz0xfX1yZXR1cm4gRn1jb25zdCB3PTEwLE49KGU9MCk9PnU9PmBcXHgxQlske3UrZX1tYCxJPShlPTApPT51PT5gXFx4MUJbJHszOCtlfTs1OyR7dX1tYCxSPShlPTApPT4odSx0LEYpPT5gXFx4MUJbJHszOCtlfTsyOyR7dX07JHt0fTske0Z9bWAscj17bW9kaWZpZXI6e3Jlc2V0OlswLDBdLGJvbGQ6WzEsMjJdLGRpbTpbMiwyMl0saXRhbGljOlszLDIzXSx1bmRlcmxpbmU6WzQsMjRdLG92ZXJsaW5lOls1Myw1NV0saW52ZXJzZTpbNywyN10saGlkZGVuOls4LDI4XSxzdHJpa2V0aHJvdWdoOls5LDI5XX0sY29sb3I6e2JsYWNrOlszMCwzOV0scmVkOlszMSwzOV0sZ3JlZW46WzMyLDM5XSx5ZWxsb3c6WzMzLDM5XSxibHVlOlszNCwzOV0sbWFnZW50YTpbMzUsMzldLGN5YW46WzM2LDM5XSx3aGl0ZTpbMzcsMzldLGJsYWNrQnJpZ2h0Ols5MCwzOV0sZ3JheTpbOTAsMzldLGdyZXk6WzkwLDM5XSxyZWRCcmlnaHQ6WzkxLDM5XSxncmVlbkJyaWdodDpbOTIsMzldLHllbGxvd0JyaWdodDpbOTMsMzldLGJsdWVCcmlnaHQ6Wzk0LDM5XSxtYWdlbnRhQnJpZ2h0Ols5NSwzOV0sY3lhbkJyaWdodDpbOTYsMzldLHdoaXRlQnJpZ2h0Ols5NywzOV19LGJnQ29sb3I6e2JnQmxhY2s6WzQwLDQ5XSxiZ1JlZDpbNDEsNDldLGJnR3JlZW46WzQyLDQ5XSxiZ1llbGxvdzpbNDMsNDldLGJnQmx1ZTpbNDQsNDldLGJnTWFnZW50YTpbNDUsNDldLGJnQ3lhbjpbNDYsNDldLGJnV2hpdGU6WzQ3LDQ5XSxiZ0JsYWNrQnJpZ2h0OlsxMDAsNDldLGJnR3JheTpbMTAwLDQ5XSxiZ0dyZXk6WzEwMCw0OV0sYmdSZWRCcmlnaHQ6WzEwMSw0OV0sYmdHcmVlbkJyaWdodDpbMTAyLDQ5XSxiZ1llbGxvd0JyaWdodDpbMTAzLDQ5XSxiZ0JsdWVCcmlnaHQ6WzEwNCw0OV0sYmdNYWdlbnRhQnJpZ2h0OlsxMDUsNDldLGJnQ3lhbkJyaWdodDpbMTA2LDQ5XSxiZ1doaXRlQnJpZ2h0OlsxMDcsNDldfX07T2JqZWN0LmtleXMoci5tb2RpZmllcik7Y29uc3QgaUQ9T2JqZWN0LmtleXMoci5jb2xvciksQ0Q9T2JqZWN0LmtleXMoci5iZ0NvbG9yKTtbLi4uaUQsLi4uQ0RdO2Z1bmN0aW9uIHJEKCl7Y29uc3QgZT1uZXcgTWFwO2Zvcihjb25zdFt1LHRdb2YgT2JqZWN0LmVudHJpZXMocikpe2Zvcihjb25zdFtGLHNdb2YgT2JqZWN0LmVudHJpZXModCkpcltGXT17b3BlbjpgXFx4MUJbJHtzWzBdfW1gLGNsb3NlOmBcXHgxQlske3NbMV19bWB9LHRbRl09cltGXSxlLnNldChzWzBdLHNbMV0pO09iamVjdC5kZWZpbmVQcm9wZXJ0eShyLHUse3ZhbHVlOnQsZW51bWVyYWJsZTohMX0pfXJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkocixcImNvZGVzXCIse3ZhbHVlOmUsZW51bWVyYWJsZTohMX0pLHIuY29sb3IuY2xvc2U9XCJcXHgxQlszOW1cIixyLmJnQ29sb3IuY2xvc2U9XCJcXHgxQls0OW1cIixyLmNvbG9yLmFuc2k9TigpLHIuY29sb3IuYW5zaTI1Nj1JKCksci5jb2xvci5hbnNpMTZtPVIoKSxyLmJnQ29sb3IuYW5zaT1OKHcpLHIuYmdDb2xvci5hbnNpMjU2PUkodyksci5iZ0NvbG9yLmFuc2kxNm09Uih3KSxPYmplY3QuZGVmaW5lUHJvcGVydGllcyhyLHtyZ2JUb0Fuc2kyNTY6e3ZhbHVlOih1LHQsRik9PnU9PT10JiZ0PT09Rj91PDg/MTY6dT4yNDg/MjMxOk1hdGgucm91bmQoKHUtOCkvMjQ3KjI0KSsyMzI6MTYrMzYqTWF0aC5yb3VuZCh1LzI1NSo1KSs2Kk1hdGgucm91bmQodC8yNTUqNSkrTWF0aC5yb3VuZChGLzI1NSo1KSxlbnVtZXJhYmxlOiExfSxoZXhUb1JnYjp7dmFsdWU6dT0+e2NvbnN0IHQ9L1thLWZcXGRdezZ9fFthLWZcXGRdezN9L2kuZXhlYyh1LnRvU3RyaW5nKDE2KSk7aWYoIXQpcmV0dXJuWzAsMCwwXTtsZXRbRl09dDtGLmxlbmd0aD09PTMmJihGPVsuLi5GXS5tYXAoaT0+aStpKS5qb2luKFwiXCIpKTtjb25zdCBzPU51bWJlci5wYXJzZUludChGLDE2KTtyZXR1cm5bcz4+MTYmMjU1LHM+PjgmMjU1LHMmMjU1XX0sZW51bWVyYWJsZTohMX0saGV4VG9BbnNpMjU2Ont2YWx1ZTp1PT5yLnJnYlRvQW5zaTI1NiguLi5yLmhleFRvUmdiKHUpKSxlbnVtZXJhYmxlOiExfSxhbnNpMjU2VG9BbnNpOnt2YWx1ZTp1PT57aWYodTw4KXJldHVybiAzMCt1O2lmKHU8MTYpcmV0dXJuIDkwKyh1LTgpO2xldCB0LEYscztpZih1Pj0yMzIpdD0oKHUtMjMyKSoxMCs4KS8yNTUsRj10LHM9dDtlbHNle3UtPTE2O2NvbnN0IEM9dSUzNjt0PU1hdGguZmxvb3IodS8zNikvNSxGPU1hdGguZmxvb3IoQy82KS81LHM9QyU2LzV9Y29uc3QgaT1NYXRoLm1heCh0LEYscykqMjtpZihpPT09MClyZXR1cm4gMzA7bGV0IEQ9MzArKE1hdGgucm91bmQocyk8PDJ8TWF0aC5yb3VuZChGKTw8MXxNYXRoLnJvdW5kKHQpKTtyZXR1cm4gaT09PTImJihEKz02MCksRH0sZW51bWVyYWJsZTohMX0scmdiVG9BbnNpOnt2YWx1ZToodSx0LEYpPT5yLmFuc2kyNTZUb0Fuc2koci5yZ2JUb0Fuc2kyNTYodSx0LEYpKSxlbnVtZXJhYmxlOiExfSxoZXhUb0Fuc2k6e3ZhbHVlOnU9PnIuYW5zaTI1NlRvQW5zaShyLmhleFRvQW5zaTI1Nih1KSksZW51bWVyYWJsZTohMX19KSxyfWNvbnN0IEVEPXJEKCksZD1uZXcgU2V0KFtcIlxceDFCXCIsXCJcXHg5QlwiXSksb0Q9MzkseT1cIlxceDA3XCIsVj1cIltcIixuRD1cIl1cIixHPVwibVwiLF89YCR7bkR9ODs7YCx6PWU9PmAke2QudmFsdWVzKCkubmV4dCgpLnZhbHVlfSR7Vn0ke2V9JHtHfWAsSz1lPT5gJHtkLnZhbHVlcygpLm5leHQoKS52YWx1ZX0ke199JHtlfSR7eX1gLGFEPWU9PmUuc3BsaXQoXCIgXCIpLm1hcCh1PT5wKHUpKSxrPShlLHUsdCk9Pntjb25zdCBGPVsuLi51XTtsZXQgcz0hMSxpPSExLEQ9cChQKGVbZS5sZW5ndGgtMV0pKTtmb3IoY29uc3RbQyxuXW9mIEYuZW50cmllcygpKXtjb25zdCBFPXAobik7aWYoRCtFPD10P2VbZS5sZW5ndGgtMV0rPW46KGUucHVzaChuKSxEPTApLGQuaGFzKG4pJiYocz0hMCxpPUYuc2xpY2UoQysxKS5qb2luKFwiXCIpLnN0YXJ0c1dpdGgoXykpLHMpe2k/bj09PXkmJihzPSExLGk9ITEpOm49PT1HJiYocz0hMSk7Y29udGludWV9RCs9RSxEPT09dCYmQzxGLmxlbmd0aC0xJiYoZS5wdXNoKFwiXCIpLEQ9MCl9IUQmJmVbZS5sZW5ndGgtMV0ubGVuZ3RoPjAmJmUubGVuZ3RoPjEmJihlW2UubGVuZ3RoLTJdKz1lLnBvcCgpKX0saEQ9ZT0+e2NvbnN0IHU9ZS5zcGxpdChcIiBcIik7bGV0IHQ9dS5sZW5ndGg7Zm9yKDt0PjAmJiEocCh1W3QtMV0pPjApOyl0LS07cmV0dXJuIHQ9PT11Lmxlbmd0aD9lOnUuc2xpY2UoMCx0KS5qb2luKFwiIFwiKSt1LnNsaWNlKHQpLmpvaW4oXCJcIil9LGxEPShlLHUsdD17fSk9PntpZih0LnRyaW0hPT0hMSYmZS50cmltKCk9PT1cIlwiKXJldHVyblwiXCI7bGV0IEY9XCJcIixzLGk7Y29uc3QgRD1hRChlKTtsZXQgQz1bXCJcIl07Zm9yKGNvbnN0W0UsYV1vZiBlLnNwbGl0KFwiIFwiKS5lbnRyaWVzKCkpe3QudHJpbSE9PSExJiYoQ1tDLmxlbmd0aC0xXT1DW0MubGVuZ3RoLTFdLnRyaW1TdGFydCgpKTtsZXQgbz1wKENbQy5sZW5ndGgtMV0pO2lmKEUhPT0wJiYobz49dSYmKHQud29yZFdyYXA9PT0hMXx8dC50cmltPT09ITEpJiYoQy5wdXNoKFwiXCIpLG89MCksKG8+MHx8dC50cmltPT09ITEpJiYoQ1tDLmxlbmd0aC0xXSs9XCIgXCIsbysrKSksdC5oYXJkJiZEW0VdPnUpe2NvbnN0IGM9dS1vLGY9MStNYXRoLmZsb29yKChEW0VdLWMtMSkvdSk7TWF0aC5mbG9vcigoRFtFXS0xKS91KTxmJiZDLnB1c2goXCJcIiksayhDLGEsdSk7Y29udGludWV9aWYobytEW0VdPnUmJm8+MCYmRFtFXT4wKXtpZih0LndvcmRXcmFwPT09ITEmJm88dSl7ayhDLGEsdSk7Y29udGludWV9Qy5wdXNoKFwiXCIpfWlmKG8rRFtFXT51JiZ0LndvcmRXcmFwPT09ITEpe2soQyxhLHUpO2NvbnRpbnVlfUNbQy5sZW5ndGgtMV0rPWF9dC50cmltIT09ITEmJihDPUMubWFwKEU9PmhEKEUpKSk7Y29uc3Qgbj1bLi4uQy5qb2luKGBcbmApXTtmb3IoY29uc3RbRSxhXW9mIG4uZW50cmllcygpKXtpZihGKz1hLGQuaGFzKGEpKXtjb25zdHtncm91cHM6Y309bmV3IFJlZ0V4cChgKD86XFxcXCR7Vn0oPzxjb2RlPlxcXFxkKyltfFxcXFwke199KD88dXJpPi4qKSR7eX0pYCkuZXhlYyhuLnNsaWNlKEUpLmpvaW4oXCJcIikpfHx7Z3JvdXBzOnt9fTtpZihjLmNvZGUhPT12b2lkIDApe2NvbnN0IGY9TnVtYmVyLnBhcnNlRmxvYXQoYy5jb2RlKTtzPWY9PT1vRD92b2lkIDA6Zn1lbHNlIGMudXJpIT09dm9pZCAwJiYoaT1jLnVyaS5sZW5ndGg9PT0wP3ZvaWQgMDpjLnVyaSl9Y29uc3Qgbz1FRC5jb2Rlcy5nZXQoTnVtYmVyKHMpKTtuW0UrMV09PT1gXG5gPyhpJiYoRis9SyhcIlwiKSkscyYmbyYmKEYrPXoobykpKTphPT09YFxuYCYmKHMmJm8mJihGKz16KHMpKSxpJiYoRis9SyhpKSkpfXJldHVybiBGfTtmdW5jdGlvbiBZKGUsdSx0KXtyZXR1cm4gU3RyaW5nKGUpLm5vcm1hbGl6ZSgpLnJlcGxhY2UoL1xcclxcbi9nLGBcbmApLnNwbGl0KGBcbmApLm1hcChGPT5sRChGLHUsdCkpLmpvaW4oYFxuYCl9Y29uc3QgeEQ9W1widXBcIixcImRvd25cIixcImxlZnRcIixcInJpZ2h0XCIsXCJzcGFjZVwiLFwiZW50ZXJcIixcImNhbmNlbFwiXSxCPXthY3Rpb25zOm5ldyBTZXQoeEQpLGFsaWFzZXM6bmV3IE1hcChbW1wia1wiLFwidXBcIl0sW1wialwiLFwiZG93blwiXSxbXCJoXCIsXCJsZWZ0XCJdLFtcImxcIixcInJpZ2h0XCJdLFtcIlx1MDAwM1wiLFwiY2FuY2VsXCJdLFtcImVzY2FwZVwiLFwiY2FuY2VsXCJdXSl9O2Z1bmN0aW9uIGNEKGUpe2Zvcihjb25zdCB1IGluIGUpe2NvbnN0IHQ9dTtpZighT2JqZWN0Lmhhc093bihlLHQpKWNvbnRpbnVlO2NvbnN0IEY9ZVt0XTtzd2l0Y2godCl7Y2FzZVwiYWxpYXNlc1wiOntmb3IoY29uc3QgcyBpbiBGKU9iamVjdC5oYXNPd24oRixzKSYmKEIuYWxpYXNlcy5oYXMocyl8fEIuYWxpYXNlcy5zZXQocyxGW3NdKSk7YnJlYWt9fX19ZnVuY3Rpb24gJChlLHUpe2lmKHR5cGVvZiBlPT1cInN0cmluZ1wiKXJldHVybiBCLmFsaWFzZXMuZ2V0KGUpPT09dTtmb3IoY29uc3QgdCBvZiBlKWlmKHQhPT12b2lkIDAmJiQodCx1KSlyZXR1cm4hMDtyZXR1cm4hMX1mdW5jdGlvbiBCRChlLHUpe2lmKGU9PT11KXJldHVybjtjb25zdCB0PWUuc3BsaXQoYFxuYCksRj11LnNwbGl0KGBcbmApLHM9W107Zm9yKGxldCBpPTA7aTxNYXRoLm1heCh0Lmxlbmd0aCxGLmxlbmd0aCk7aSsrKXRbaV0hPT1GW2ldJiZzLnB1c2goaSk7cmV0dXJuIHN9Y29uc3QgQUQ9Z2xvYmFsVGhpcy5wcm9jZXNzLnBsYXRmb3JtLnN0YXJ0c1dpdGgoXCJ3aW5cIiksUz1TeW1ib2woXCJjbGFjazpjYW5jZWxcIik7ZnVuY3Rpb24gcEQoZSl7cmV0dXJuIGU9PT1TfWZ1bmN0aW9uIG0oZSx1KXtjb25zdCB0PWU7dC5pc1RUWSYmdC5zZXRSYXdNb2RlKHUpfWZ1bmN0aW9uIGZEKHtpbnB1dDplPWosb3V0cHV0OnU9TSxvdmVyd3JpdGU6dD0hMCxoaWRlQ3Vyc29yOkY9ITB9PXt9KXtjb25zdCBzPWcuY3JlYXRlSW50ZXJmYWNlKHtpbnB1dDplLG91dHB1dDp1LHByb21wdDpcIlwiLHRhYlNpemU6MX0pO2cuZW1pdEtleXByZXNzRXZlbnRzKGUscyksZS5pc1RUWSYmZS5zZXRSYXdNb2RlKCEwKTtjb25zdCBpPShELHtuYW1lOkMsc2VxdWVuY2U6bn0pPT57Y29uc3QgRT1TdHJpbmcoRCk7aWYoJChbRSxDLG5dLFwiY2FuY2VsXCIpKXtGJiZ1LndyaXRlKGwuc2hvdykscHJvY2Vzcy5leGl0KDApO3JldHVybn1pZighdClyZXR1cm47Y29uc3QgYT1DPT09XCJyZXR1cm5cIj8wOi0xLG89Qz09PVwicmV0dXJuXCI/LTE6MDtnLm1vdmVDdXJzb3IodSxhLG8sKCk9PntnLmNsZWFyTGluZSh1LDEsKCk9PntlLm9uY2UoXCJrZXlwcmVzc1wiLGkpfSl9KX07cmV0dXJuIEYmJnUud3JpdGUobC5oaWRlKSxlLm9uY2UoXCJrZXlwcmVzc1wiLGkpLCgpPT57ZS5vZmYoXCJrZXlwcmVzc1wiLGkpLEYmJnUud3JpdGUobC5zaG93KSxlLmlzVFRZJiYhQUQmJmUuc2V0UmF3TW9kZSghMSkscy50ZXJtaW5hbD0hMSxzLmNsb3NlKCl9fXZhciBnRD1PYmplY3QuZGVmaW5lUHJvcGVydHksdkQ9KGUsdSx0KT0+dSBpbiBlP2dEKGUsdSx7ZW51bWVyYWJsZTohMCxjb25maWd1cmFibGU6ITAsd3JpdGFibGU6ITAsdmFsdWU6dH0pOmVbdV09dCxoPShlLHUsdCk9Pih2RChlLHR5cGVvZiB1IT1cInN5bWJvbFwiP3UrXCJcIjp1LHQpLHQpO2NsYXNzIHh7Y29uc3RydWN0b3IodSx0PSEwKXtoKHRoaXMsXCJpbnB1dFwiKSxoKHRoaXMsXCJvdXRwdXRcIiksaCh0aGlzLFwiX2Fib3J0U2lnbmFsXCIpLGgodGhpcyxcInJsXCIpLGgodGhpcyxcIm9wdHNcIiksaCh0aGlzLFwiX3JlbmRlclwiKSxoKHRoaXMsXCJfdHJhY2tcIiwhMSksaCh0aGlzLFwiX3ByZXZGcmFtZVwiLFwiXCIpLGgodGhpcyxcIl9zdWJzY3JpYmVyc1wiLG5ldyBNYXApLGgodGhpcyxcIl9jdXJzb3JcIiwwKSxoKHRoaXMsXCJzdGF0ZVwiLFwiaW5pdGlhbFwiKSxoKHRoaXMsXCJlcnJvclwiLFwiXCIpLGgodGhpcyxcInZhbHVlXCIpO2NvbnN0e2lucHV0OkY9aixvdXRwdXQ6cz1NLHJlbmRlcjppLHNpZ25hbDpELC4uLkN9PXU7dGhpcy5vcHRzPUMsdGhpcy5vbktleXByZXNzPXRoaXMub25LZXlwcmVzcy5iaW5kKHRoaXMpLHRoaXMuY2xvc2U9dGhpcy5jbG9zZS5iaW5kKHRoaXMpLHRoaXMucmVuZGVyPXRoaXMucmVuZGVyLmJpbmQodGhpcyksdGhpcy5fcmVuZGVyPWkuYmluZCh0aGlzKSx0aGlzLl90cmFjaz10LHRoaXMuX2Fib3J0U2lnbmFsPUQsdGhpcy5pbnB1dD1GLHRoaXMub3V0cHV0PXN9dW5zdWJzY3JpYmUoKXt0aGlzLl9zdWJzY3JpYmVycy5jbGVhcigpfXNldFN1YnNjcmliZXIodSx0KXtjb25zdCBGPXRoaXMuX3N1YnNjcmliZXJzLmdldCh1KT8/W107Ri5wdXNoKHQpLHRoaXMuX3N1YnNjcmliZXJzLnNldCh1LEYpfW9uKHUsdCl7dGhpcy5zZXRTdWJzY3JpYmVyKHUse2NiOnR9KX1vbmNlKHUsdCl7dGhpcy5zZXRTdWJzY3JpYmVyKHUse2NiOnQsb25jZTohMH0pfWVtaXQodSwuLi50KXtjb25zdCBGPXRoaXMuX3N1YnNjcmliZXJzLmdldCh1KT8/W10scz1bXTtmb3IoY29uc3QgaSBvZiBGKWkuY2IoLi4udCksaS5vbmNlJiZzLnB1c2goKCk9PkYuc3BsaWNlKEYuaW5kZXhPZihpKSwxKSk7Zm9yKGNvbnN0IGkgb2YgcylpKCl9cHJvbXB0KCl7cmV0dXJuIG5ldyBQcm9taXNlKCh1LHQpPT57aWYodGhpcy5fYWJvcnRTaWduYWwpe2lmKHRoaXMuX2Fib3J0U2lnbmFsLmFib3J0ZWQpcmV0dXJuIHRoaXMuc3RhdGU9XCJjYW5jZWxcIix0aGlzLmNsb3NlKCksdShTKTt0aGlzLl9hYm9ydFNpZ25hbC5hZGRFdmVudExpc3RlbmVyKFwiYWJvcnRcIiwoKT0+e3RoaXMuc3RhdGU9XCJjYW5jZWxcIix0aGlzLmNsb3NlKCl9LHtvbmNlOiEwfSl9Y29uc3QgRj1uZXcgWDtGLl93cml0ZT0ocyxpLEQpPT57dGhpcy5fdHJhY2smJih0aGlzLnZhbHVlPXRoaXMucmw/LmxpbmUucmVwbGFjZSgvXFx0L2csXCJcIiksdGhpcy5fY3Vyc29yPXRoaXMucmw/LmN1cnNvcj8/MCx0aGlzLmVtaXQoXCJ2YWx1ZVwiLHRoaXMudmFsdWUpKSxEKCl9LHRoaXMuaW5wdXQucGlwZShGKSx0aGlzLnJsPU8uY3JlYXRlSW50ZXJmYWNlKHtpbnB1dDp0aGlzLmlucHV0LG91dHB1dDpGLHRhYlNpemU6Mixwcm9tcHQ6XCJcIixlc2NhcGVDb2RlVGltZW91dDo1MCx0ZXJtaW5hbDohMH0pLE8uZW1pdEtleXByZXNzRXZlbnRzKHRoaXMuaW5wdXQsdGhpcy5ybCksdGhpcy5ybC5wcm9tcHQoKSx0aGlzLm9wdHMuaW5pdGlhbFZhbHVlIT09dm9pZCAwJiZ0aGlzLl90cmFjayYmdGhpcy5ybC53cml0ZSh0aGlzLm9wdHMuaW5pdGlhbFZhbHVlKSx0aGlzLmlucHV0Lm9uKFwia2V5cHJlc3NcIix0aGlzLm9uS2V5cHJlc3MpLG0odGhpcy5pbnB1dCwhMCksdGhpcy5vdXRwdXQub24oXCJyZXNpemVcIix0aGlzLnJlbmRlciksdGhpcy5yZW5kZXIoKSx0aGlzLm9uY2UoXCJzdWJtaXRcIiwoKT0+e3RoaXMub3V0cHV0LndyaXRlKGwuc2hvdyksdGhpcy5vdXRwdXQub2ZmKFwicmVzaXplXCIsdGhpcy5yZW5kZXIpLG0odGhpcy5pbnB1dCwhMSksdSh0aGlzLnZhbHVlKX0pLHRoaXMub25jZShcImNhbmNlbFwiLCgpPT57dGhpcy5vdXRwdXQud3JpdGUobC5zaG93KSx0aGlzLm91dHB1dC5vZmYoXCJyZXNpemVcIix0aGlzLnJlbmRlciksbSh0aGlzLmlucHV0LCExKSx1KFMpfSl9KX1vbktleXByZXNzKHUsdCl7aWYodGhpcy5zdGF0ZT09PVwiZXJyb3JcIiYmKHRoaXMuc3RhdGU9XCJhY3RpdmVcIiksdD8ubmFtZSYmKCF0aGlzLl90cmFjayYmQi5hbGlhc2VzLmhhcyh0Lm5hbWUpJiZ0aGlzLmVtaXQoXCJjdXJzb3JcIixCLmFsaWFzZXMuZ2V0KHQubmFtZSkpLEIuYWN0aW9ucy5oYXModC5uYW1lKSYmdGhpcy5lbWl0KFwiY3Vyc29yXCIsdC5uYW1lKSksdSYmKHUudG9Mb3dlckNhc2UoKT09PVwieVwifHx1LnRvTG93ZXJDYXNlKCk9PT1cIm5cIikmJnRoaXMuZW1pdChcImNvbmZpcm1cIix1LnRvTG93ZXJDYXNlKCk9PT1cInlcIiksdT09PVwiXHRcIiYmdGhpcy5vcHRzLnBsYWNlaG9sZGVyJiYodGhpcy52YWx1ZXx8KHRoaXMucmw/LndyaXRlKHRoaXMub3B0cy5wbGFjZWhvbGRlciksdGhpcy5lbWl0KFwidmFsdWVcIix0aGlzLm9wdHMucGxhY2Vob2xkZXIpKSksdSYmdGhpcy5lbWl0KFwia2V5XCIsdS50b0xvd2VyQ2FzZSgpKSx0Py5uYW1lPT09XCJyZXR1cm5cIil7aWYodGhpcy5vcHRzLnZhbGlkYXRlKXtjb25zdCBGPXRoaXMub3B0cy52YWxpZGF0ZSh0aGlzLnZhbHVlKTtGJiYodGhpcy5lcnJvcj1GIGluc3RhbmNlb2YgRXJyb3I/Ri5tZXNzYWdlOkYsdGhpcy5zdGF0ZT1cImVycm9yXCIsdGhpcy5ybD8ud3JpdGUodGhpcy52YWx1ZSkpfXRoaXMuc3RhdGUhPT1cImVycm9yXCImJih0aGlzLnN0YXRlPVwic3VibWl0XCIpfSQoW3UsdD8ubmFtZSx0Py5zZXF1ZW5jZV0sXCJjYW5jZWxcIikmJih0aGlzLnN0YXRlPVwiY2FuY2VsXCIpLCh0aGlzLnN0YXRlPT09XCJzdWJtaXRcInx8dGhpcy5zdGF0ZT09PVwiY2FuY2VsXCIpJiZ0aGlzLmVtaXQoXCJmaW5hbGl6ZVwiKSx0aGlzLnJlbmRlcigpLCh0aGlzLnN0YXRlPT09XCJzdWJtaXRcInx8dGhpcy5zdGF0ZT09PVwiY2FuY2VsXCIpJiZ0aGlzLmNsb3NlKCl9Y2xvc2UoKXt0aGlzLmlucHV0LnVucGlwZSgpLHRoaXMuaW5wdXQucmVtb3ZlTGlzdGVuZXIoXCJrZXlwcmVzc1wiLHRoaXMub25LZXlwcmVzcyksdGhpcy5vdXRwdXQud3JpdGUoYFxuYCksbSh0aGlzLmlucHV0LCExKSx0aGlzLnJsPy5jbG9zZSgpLHRoaXMucmw9dm9pZCAwLHRoaXMuZW1pdChgJHt0aGlzLnN0YXRlfWAsdGhpcy52YWx1ZSksdGhpcy51bnN1YnNjcmliZSgpfXJlc3RvcmVDdXJzb3IoKXtjb25zdCB1PVkodGhpcy5fcHJldkZyYW1lLHByb2Nlc3Muc3Rkb3V0LmNvbHVtbnMse2hhcmQ6ITB9KS5zcGxpdChgXG5gKS5sZW5ndGgtMTt0aGlzLm91dHB1dC53cml0ZShsLm1vdmUoLTk5OSx1Ki0xKSl9cmVuZGVyKCl7Y29uc3QgdT1ZKHRoaXMuX3JlbmRlcih0aGlzKT8/XCJcIixwcm9jZXNzLnN0ZG91dC5jb2x1bW5zLHtoYXJkOiEwfSk7aWYodSE9PXRoaXMuX3ByZXZGcmFtZSl7aWYodGhpcy5zdGF0ZT09PVwiaW5pdGlhbFwiKXRoaXMub3V0cHV0LndyaXRlKGwuaGlkZSk7ZWxzZXtjb25zdCB0PUJEKHRoaXMuX3ByZXZGcmFtZSx1KTtpZih0aGlzLnJlc3RvcmVDdXJzb3IoKSx0JiZ0Py5sZW5ndGg9PT0xKXtjb25zdCBGPXRbMF07dGhpcy5vdXRwdXQud3JpdGUobC5tb3ZlKDAsRikpLHRoaXMub3V0cHV0LndyaXRlKGIubGluZXMoMSkpO2NvbnN0IHM9dS5zcGxpdChgXG5gKTt0aGlzLm91dHB1dC53cml0ZShzW0ZdKSx0aGlzLl9wcmV2RnJhbWU9dSx0aGlzLm91dHB1dC53cml0ZShsLm1vdmUoMCxzLmxlbmd0aC1GLTEpKTtyZXR1cm59aWYodCYmdD8ubGVuZ3RoPjEpe2NvbnN0IEY9dFswXTt0aGlzLm91dHB1dC53cml0ZShsLm1vdmUoMCxGKSksdGhpcy5vdXRwdXQud3JpdGUoYi5kb3duKCkpO2NvbnN0IHM9dS5zcGxpdChgXG5gKS5zbGljZShGKTt0aGlzLm91dHB1dC53cml0ZShzLmpvaW4oYFxuYCkpLHRoaXMuX3ByZXZGcmFtZT11O3JldHVybn10aGlzLm91dHB1dC53cml0ZShiLmRvd24oKSl9dGhpcy5vdXRwdXQud3JpdGUodSksdGhpcy5zdGF0ZT09PVwiaW5pdGlhbFwiJiYodGhpcy5zdGF0ZT1cImFjdGl2ZVwiKSx0aGlzLl9wcmV2RnJhbWU9dX19fWNsYXNzIGREIGV4dGVuZHMgeHtnZXQgY3Vyc29yKCl7cmV0dXJuIHRoaXMudmFsdWU/MDoxfWdldCBfdmFsdWUoKXtyZXR1cm4gdGhpcy5jdXJzb3I9PT0wfWNvbnN0cnVjdG9yKHUpe3N1cGVyKHUsITEpLHRoaXMudmFsdWU9ISF1LmluaXRpYWxWYWx1ZSx0aGlzLm9uKFwidmFsdWVcIiwoKT0+e3RoaXMudmFsdWU9dGhpcy5fdmFsdWV9KSx0aGlzLm9uKFwiY29uZmlybVwiLHQ9Pnt0aGlzLm91dHB1dC53cml0ZShsLm1vdmUoMCwtMSkpLHRoaXMudmFsdWU9dCx0aGlzLnN0YXRlPVwic3VibWl0XCIsdGhpcy5jbG9zZSgpfSksdGhpcy5vbihcImN1cnNvclwiLCgpPT57dGhpcy52YWx1ZT0hdGhpcy52YWx1ZX0pfX12YXIgbUQ9T2JqZWN0LmRlZmluZVByb3BlcnR5LGJEPShlLHUsdCk9PnUgaW4gZT9tRChlLHUse2VudW1lcmFibGU6ITAsY29uZmlndXJhYmxlOiEwLHdyaXRhYmxlOiEwLHZhbHVlOnR9KTplW3VdPXQsWj0oZSx1LHQpPT4oYkQoZSx0eXBlb2YgdSE9XCJzeW1ib2xcIj91K1wiXCI6dSx0KSx0KSxxPShlLHUsdCk9PntpZighdS5oYXMoZSkpdGhyb3cgVHlwZUVycm9yKFwiQ2Fubm90IFwiK3QpfSxUPShlLHUsdCk9PihxKGUsdSxcInJlYWQgZnJvbSBwcml2YXRlIGZpZWxkXCIpLHQ/dC5jYWxsKGUpOnUuZ2V0KGUpKSx3RD0oZSx1LHQpPT57aWYodS5oYXMoZSkpdGhyb3cgVHlwZUVycm9yKFwiQ2Fubm90IGFkZCB0aGUgc2FtZSBwcml2YXRlIG1lbWJlciBtb3JlIHRoYW4gb25jZVwiKTt1IGluc3RhbmNlb2YgV2Vha1NldD91LmFkZChlKTp1LnNldChlLHQpfSx5RD0oZSx1LHQsRik9PihxKGUsdSxcIndyaXRlIHRvIHByaXZhdGUgZmllbGRcIiksRj9GLmNhbGwoZSx0KTp1LnNldChlLHQpLHQpLEE7bGV0IF9EPWNsYXNzIGV4dGVuZHMgeHtjb25zdHJ1Y3Rvcih1KXtzdXBlcih1LCExKSxaKHRoaXMsXCJvcHRpb25zXCIpLFoodGhpcyxcImN1cnNvclwiLDApLHdEKHRoaXMsQSx2b2lkIDApO2NvbnN0e29wdGlvbnM6dH09dTt5RCh0aGlzLEEsdS5zZWxlY3RhYmxlR3JvdXBzIT09ITEpLHRoaXMub3B0aW9ucz1PYmplY3QuZW50cmllcyh0KS5mbGF0TWFwKChbRixzXSk9Plt7dmFsdWU6Rixncm91cDohMCxsYWJlbDpGfSwuLi5zLm1hcChpPT4oey4uLmksZ3JvdXA6Rn0pKV0pLHRoaXMudmFsdWU9Wy4uLnUuaW5pdGlhbFZhbHVlcz8/W11dLHRoaXMuY3Vyc29yPU1hdGgubWF4KHRoaXMub3B0aW9ucy5maW5kSW5kZXgoKHt2YWx1ZTpGfSk9PkY9PT11LmN1cnNvckF0KSxUKHRoaXMsQSk/MDoxKSx0aGlzLm9uKFwiY3Vyc29yXCIsRj0+e3N3aXRjaChGKXtjYXNlXCJsZWZ0XCI6Y2FzZVwidXBcIjp7dGhpcy5jdXJzb3I9dGhpcy5jdXJzb3I9PT0wP3RoaXMub3B0aW9ucy5sZW5ndGgtMTp0aGlzLmN1cnNvci0xO2NvbnN0IHM9dGhpcy5vcHRpb25zW3RoaXMuY3Vyc29yXT8uZ3JvdXA9PT0hMDshVCh0aGlzLEEpJiZzJiYodGhpcy5jdXJzb3I9dGhpcy5jdXJzb3I9PT0wP3RoaXMub3B0aW9ucy5sZW5ndGgtMTp0aGlzLmN1cnNvci0xKTticmVha31jYXNlXCJkb3duXCI6Y2FzZVwicmlnaHRcIjp7dGhpcy5jdXJzb3I9dGhpcy5jdXJzb3I9PT10aGlzLm9wdGlvbnMubGVuZ3RoLTE/MDp0aGlzLmN1cnNvcisxO2NvbnN0IHM9dGhpcy5vcHRpb25zW3RoaXMuY3Vyc29yXT8uZ3JvdXA9PT0hMDshVCh0aGlzLEEpJiZzJiYodGhpcy5jdXJzb3I9dGhpcy5jdXJzb3I9PT10aGlzLm9wdGlvbnMubGVuZ3RoLTE/MDp0aGlzLmN1cnNvcisxKTticmVha31jYXNlXCJzcGFjZVwiOnRoaXMudG9nZ2xlVmFsdWUoKTticmVha319KX1nZXRHcm91cEl0ZW1zKHUpe3JldHVybiB0aGlzLm9wdGlvbnMuZmlsdGVyKHQ9PnQuZ3JvdXA9PT11KX1pc0dyb3VwU2VsZWN0ZWQodSl7cmV0dXJuIHRoaXMuZ2V0R3JvdXBJdGVtcyh1KS5ldmVyeSh0PT50aGlzLnZhbHVlLmluY2x1ZGVzKHQudmFsdWUpKX10b2dnbGVWYWx1ZSgpe2NvbnN0IHU9dGhpcy5vcHRpb25zW3RoaXMuY3Vyc29yXTtpZih1Lmdyb3VwPT09ITApe2NvbnN0IHQ9dS52YWx1ZSxGPXRoaXMuZ2V0R3JvdXBJdGVtcyh0KTt0aGlzLmlzR3JvdXBTZWxlY3RlZCh0KT90aGlzLnZhbHVlPXRoaXMudmFsdWUuZmlsdGVyKHM9PkYuZmluZEluZGV4KGk9PmkudmFsdWU9PT1zKT09PS0xKTp0aGlzLnZhbHVlPVsuLi50aGlzLnZhbHVlLC4uLkYubWFwKHM9PnMudmFsdWUpXSx0aGlzLnZhbHVlPUFycmF5LmZyb20obmV3IFNldCh0aGlzLnZhbHVlKSl9ZWxzZXtjb25zdCB0PXRoaXMudmFsdWUuaW5jbHVkZXModS52YWx1ZSk7dGhpcy52YWx1ZT10P3RoaXMudmFsdWUuZmlsdGVyKEY9PkYhPT11LnZhbHVlKTpbLi4udGhpcy52YWx1ZSx1LnZhbHVlXX19fTtBPW5ldyBXZWFrTWFwO3ZhciBrRD1PYmplY3QuZGVmaW5lUHJvcGVydHksJEQ9KGUsdSx0KT0+dSBpbiBlP2tEKGUsdSx7ZW51bWVyYWJsZTohMCxjb25maWd1cmFibGU6ITAsd3JpdGFibGU6ITAsdmFsdWU6dH0pOmVbdV09dCxIPShlLHUsdCk9PigkRChlLHR5cGVvZiB1IT1cInN5bWJvbFwiP3UrXCJcIjp1LHQpLHQpO2xldCBTRD1jbGFzcyBleHRlbmRzIHh7Y29uc3RydWN0b3IodSl7c3VwZXIodSwhMSksSCh0aGlzLFwib3B0aW9uc1wiKSxIKHRoaXMsXCJjdXJzb3JcIiwwKSx0aGlzLm9wdGlvbnM9dS5vcHRpb25zLHRoaXMudmFsdWU9Wy4uLnUuaW5pdGlhbFZhbHVlcz8/W11dLHRoaXMuY3Vyc29yPU1hdGgubWF4KHRoaXMub3B0aW9ucy5maW5kSW5kZXgoKHt2YWx1ZTp0fSk9PnQ9PT11LmN1cnNvckF0KSwwKSx0aGlzLm9uKFwia2V5XCIsdD0+e3Q9PT1cImFcIiYmdGhpcy50b2dnbGVBbGwoKX0pLHRoaXMub24oXCJjdXJzb3JcIix0PT57c3dpdGNoKHQpe2Nhc2VcImxlZnRcIjpjYXNlXCJ1cFwiOnRoaXMuY3Vyc29yPXRoaXMuY3Vyc29yPT09MD90aGlzLm9wdGlvbnMubGVuZ3RoLTE6dGhpcy5jdXJzb3ItMTticmVhaztjYXNlXCJkb3duXCI6Y2FzZVwicmlnaHRcIjp0aGlzLmN1cnNvcj10aGlzLmN1cnNvcj09PXRoaXMub3B0aW9ucy5sZW5ndGgtMT8wOnRoaXMuY3Vyc29yKzE7YnJlYWs7Y2FzZVwic3BhY2VcIjp0aGlzLnRvZ2dsZVZhbHVlKCk7YnJlYWt9fSl9Z2V0IF92YWx1ZSgpe3JldHVybiB0aGlzLm9wdGlvbnNbdGhpcy5jdXJzb3JdLnZhbHVlfXRvZ2dsZUFsbCgpe2NvbnN0IHU9dGhpcy52YWx1ZS5sZW5ndGg9PT10aGlzLm9wdGlvbnMubGVuZ3RoO3RoaXMudmFsdWU9dT9bXTp0aGlzLm9wdGlvbnMubWFwKHQ9PnQudmFsdWUpfXRvZ2dsZVZhbHVlKCl7Y29uc3QgdT10aGlzLnZhbHVlLmluY2x1ZGVzKHRoaXMuX3ZhbHVlKTt0aGlzLnZhbHVlPXU/dGhpcy52YWx1ZS5maWx0ZXIodD0+dCE9PXRoaXMuX3ZhbHVlKTpbLi4udGhpcy52YWx1ZSx0aGlzLl92YWx1ZV19fTt2YXIgVEQ9T2JqZWN0LmRlZmluZVByb3BlcnR5LGpEPShlLHUsdCk9PnUgaW4gZT9URChlLHUse2VudW1lcmFibGU6ITAsY29uZmlndXJhYmxlOiEwLHdyaXRhYmxlOiEwLHZhbHVlOnR9KTplW3VdPXQsVT0oZSx1LHQpPT4oakQoZSx0eXBlb2YgdSE9XCJzeW1ib2xcIj91K1wiXCI6dSx0KSx0KTtjbGFzcyBNRCBleHRlbmRzIHh7Y29uc3RydWN0b3Ioe21hc2s6dSwuLi50fSl7c3VwZXIodCksVSh0aGlzLFwidmFsdWVXaXRoQ3Vyc29yXCIsXCJcIiksVSh0aGlzLFwiX21hc2tcIixcIlxcdTIwMjJcIiksdGhpcy5fbWFzaz11Pz9cIlxcdTIwMjJcIix0aGlzLm9uKFwiZmluYWxpemVcIiwoKT0+e3RoaXMudmFsdWVXaXRoQ3Vyc29yPXRoaXMubWFza2VkfSksdGhpcy5vbihcInZhbHVlXCIsKCk9PntpZih0aGlzLmN1cnNvcj49dGhpcy52YWx1ZS5sZW5ndGgpdGhpcy52YWx1ZVdpdGhDdXJzb3I9YCR7dGhpcy5tYXNrZWR9JHt2LmludmVyc2Uodi5oaWRkZW4oXCJfXCIpKX1gO2Vsc2V7Y29uc3QgRj10aGlzLm1hc2tlZC5zbGljZSgwLHRoaXMuY3Vyc29yKSxzPXRoaXMubWFza2VkLnNsaWNlKHRoaXMuY3Vyc29yKTt0aGlzLnZhbHVlV2l0aEN1cnNvcj1gJHtGfSR7di5pbnZlcnNlKHNbMF0pfSR7cy5zbGljZSgxKX1gfX0pfWdldCBjdXJzb3IoKXtyZXR1cm4gdGhpcy5fY3Vyc29yfWdldCBtYXNrZWQoKXtyZXR1cm4gdGhpcy52YWx1ZS5yZXBsYWNlQWxsKC8uL2csdGhpcy5fbWFzayl9fXZhciBPRD1PYmplY3QuZGVmaW5lUHJvcGVydHksUEQ9KGUsdSx0KT0+dSBpbiBlP09EKGUsdSx7ZW51bWVyYWJsZTohMCxjb25maWd1cmFibGU6ITAsd3JpdGFibGU6ITAsdmFsdWU6dH0pOmVbdV09dCxKPShlLHUsdCk9PihQRChlLHR5cGVvZiB1IT1cInN5bWJvbFwiP3UrXCJcIjp1LHQpLHQpO2NsYXNzIExEIGV4dGVuZHMgeHtjb25zdHJ1Y3Rvcih1KXtzdXBlcih1LCExKSxKKHRoaXMsXCJvcHRpb25zXCIpLEoodGhpcyxcImN1cnNvclwiLDApLHRoaXMub3B0aW9ucz11Lm9wdGlvbnMsdGhpcy5jdXJzb3I9dGhpcy5vcHRpb25zLmZpbmRJbmRleCgoe3ZhbHVlOnR9KT0+dD09PXUuaW5pdGlhbFZhbHVlKSx0aGlzLmN1cnNvcj09PS0xJiYodGhpcy5jdXJzb3I9MCksdGhpcy5jaGFuZ2VWYWx1ZSgpLHRoaXMub24oXCJjdXJzb3JcIix0PT57c3dpdGNoKHQpe2Nhc2VcImxlZnRcIjpjYXNlXCJ1cFwiOnRoaXMuY3Vyc29yPXRoaXMuY3Vyc29yPT09MD90aGlzLm9wdGlvbnMubGVuZ3RoLTE6dGhpcy5jdXJzb3ItMTticmVhaztjYXNlXCJkb3duXCI6Y2FzZVwicmlnaHRcIjp0aGlzLmN1cnNvcj10aGlzLmN1cnNvcj09PXRoaXMub3B0aW9ucy5sZW5ndGgtMT8wOnRoaXMuY3Vyc29yKzE7YnJlYWt9dGhpcy5jaGFuZ2VWYWx1ZSgpfSl9Z2V0IF92YWx1ZSgpe3JldHVybiB0aGlzLm9wdGlvbnNbdGhpcy5jdXJzb3JdfWNoYW5nZVZhbHVlKCl7dGhpcy52YWx1ZT10aGlzLl92YWx1ZS52YWx1ZX19dmFyIFdEPU9iamVjdC5kZWZpbmVQcm9wZXJ0eSxORD0oZSx1LHQpPT51IGluIGU/V0QoZSx1LHtlbnVtZXJhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMCx3cml0YWJsZTohMCx2YWx1ZTp0fSk6ZVt1XT10LFE9KGUsdSx0KT0+KE5EKGUsdHlwZW9mIHUhPVwic3ltYm9sXCI/dStcIlwiOnUsdCksdCk7Y2xhc3MgSUQgZXh0ZW5kcyB4e2NvbnN0cnVjdG9yKHUpe3N1cGVyKHUsITEpLFEodGhpcyxcIm9wdGlvbnNcIiksUSh0aGlzLFwiY3Vyc29yXCIsMCksdGhpcy5vcHRpb25zPXUub3B0aW9ucztjb25zdCB0PXRoaXMub3B0aW9ucy5tYXAoKHt2YWx1ZTpbRl19KT0+Rj8udG9Mb3dlckNhc2UoKSk7dGhpcy5jdXJzb3I9TWF0aC5tYXgodC5pbmRleE9mKHUuaW5pdGlhbFZhbHVlKSwwKSx0aGlzLm9uKFwia2V5XCIsRj0+e2lmKCF0LmluY2x1ZGVzKEYpKXJldHVybjtjb25zdCBzPXRoaXMub3B0aW9ucy5maW5kKCh7dmFsdWU6W2ldfSk9Pmk/LnRvTG93ZXJDYXNlKCk9PT1GKTtzJiYodGhpcy52YWx1ZT1zLnZhbHVlLHRoaXMuc3RhdGU9XCJzdWJtaXRcIix0aGlzLmVtaXQoXCJzdWJtaXRcIikpfSl9fWNsYXNzIFJEIGV4dGVuZHMgeHtnZXQgdmFsdWVXaXRoQ3Vyc29yKCl7aWYodGhpcy5zdGF0ZT09PVwic3VibWl0XCIpcmV0dXJuIHRoaXMudmFsdWU7aWYodGhpcy5jdXJzb3I+PXRoaXMudmFsdWUubGVuZ3RoKXJldHVybmAke3RoaXMudmFsdWV9XFx1MjU4OGA7Y29uc3QgdT10aGlzLnZhbHVlLnNsaWNlKDAsdGhpcy5jdXJzb3IpLFt0LC4uLkZdPXRoaXMudmFsdWUuc2xpY2UodGhpcy5jdXJzb3IpO3JldHVybmAke3V9JHt2LmludmVyc2UodCl9JHtGLmpvaW4oXCJcIil9YH1nZXQgY3Vyc29yKCl7cmV0dXJuIHRoaXMuX2N1cnNvcn1jb25zdHJ1Y3Rvcih1KXtzdXBlcih1KSx0aGlzLm9uKFwiZmluYWxpemVcIiwoKT0+e3RoaXMudmFsdWV8fCh0aGlzLnZhbHVlPXUuZGVmYXVsdFZhbHVlKX0pfX1leHBvcnR7ZEQgYXMgQ29uZmlybVByb21wdCxfRCBhcyBHcm91cE11bHRpU2VsZWN0UHJvbXB0LFNEIGFzIE11bHRpU2VsZWN0UHJvbXB0LE1EIGFzIFBhc3N3b3JkUHJvbXB0LHggYXMgUHJvbXB0LElEIGFzIFNlbGVjdEtleVByb21wdCxMRCBhcyBTZWxlY3RQcm9tcHQsUkQgYXMgVGV4dFByb21wdCxmRCBhcyBibG9jayxwRCBhcyBpc0NhbmNlbCxjRCBhcyB1cGRhdGVTZXR0aW5nc307XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5tanMubWFwXG4iLAogICAgImltcG9ydHtzdHJpcFZUQ29udHJvbENoYXJhY3RlcnMgYXMgU31mcm9tXCJub2RlOnV0aWxcIjtpbXBvcnR7VGV4dFByb21wdCBhcyBRLFBhc3N3b3JkUHJvbXB0IGFzIFgsQ29uZmlybVByb21wdCBhcyBaLFNlbGVjdFByb21wdCBhcyBlZSxTZWxlY3RLZXlQcm9tcHQgYXMgdGUsTXVsdGlTZWxlY3RQcm9tcHQgYXMgcmUsR3JvdXBNdWx0aVNlbGVjdFByb21wdCBhcyBzZSxpc0NhbmNlbCBhcyBpZSxibG9jayBhcyBuZX1mcm9tXCJAY2xhY2svY29yZVwiO2V4cG9ydHtpc0NhbmNlbCx1cGRhdGVTZXR0aW5nc31mcm9tXCJAY2xhY2svY29yZVwiO2ltcG9ydCB5IGZyb21cIm5vZGU6cHJvY2Vzc1wiO2ltcG9ydCBlIGZyb21cInBpY29jb2xvcnNcIjtpbXBvcnR7Y3Vyc29yIGFzIG9lLGVyYXNlIGFzIGFlfWZyb21cInNpc3RlcmFuc2lcIjtmdW5jdGlvbiBjZSgpe3JldHVybiB5LnBsYXRmb3JtIT09XCJ3aW4zMlwiP3kuZW52LlRFUk0hPT1cImxpbnV4XCI6ISF5LmVudi5DSXx8ISF5LmVudi5XVF9TRVNTSU9OfHwhIXkuZW52LlRFUk1JTlVTX1NVQkxJTUV8fHkuZW52LkNvbkVtdVRhc2s9PT1cIntjbWQ6OkNtZGVyfVwifHx5LmVudi5URVJNX1BST0dSQU09PT1cIlRlcm1pbnVzLVN1YmxpbWVcInx8eS5lbnYuVEVSTV9QUk9HUkFNPT09XCJ2c2NvZGVcInx8eS5lbnYuVEVSTT09PVwieHRlcm0tMjU2Y29sb3JcInx8eS5lbnYuVEVSTT09PVwiYWxhY3JpdHR5XCJ8fHkuZW52LlRFUk1JTkFMX0VNVUxBVE9SPT09XCJKZXRCcmFpbnMtSmVkaVRlcm1cIn1jb25zdCBWPWNlKCksdT0odCxuKT0+Vj90Om4sbGU9dShcIlxcdTI1QzZcIixcIipcIiksTD11KFwiXFx1MjVBMFwiLFwieFwiKSxXPXUoXCJcXHUyNUIyXCIsXCJ4XCIpLEM9dShcIlxcdTI1QzdcIixcIm9cIiksdWU9dShcIlxcdTI1MENcIixcIlRcIiksbz11KFwiXFx1MjUwMlwiLFwifFwiKSxkPXUoXCJcXHUyNTE0XCIsXCJcXHUyMDE0XCIpLGs9dShcIlxcdTI1Q0ZcIixcIj5cIiksUD11KFwiXFx1MjVDQlwiLFwiIFwiKSxBPXUoXCJcXHUyNUZCXCIsXCJbXFx1MjAyMl1cIiksVD11KFwiXFx1MjVGQ1wiLFwiWytdXCIpLEY9dShcIlxcdTI1RkJcIixcIlsgXVwiKSwkZT11KFwiXFx1MjVBQVwiLFwiXFx1MjAyMlwiKSxfPXUoXCJcXHUyNTAwXCIsXCItXCIpLG1lPXUoXCJcXHUyNTZFXCIsXCIrXCIpLGRlPXUoXCJcXHUyNTFDXCIsXCIrXCIpLHBlPXUoXCJcXHUyNTZGXCIsXCIrXCIpLHE9dShcIlxcdTI1Q0ZcIixcIlxcdTIwMjJcIiksRD11KFwiXFx1MjVDNlwiLFwiKlwiKSxVPXUoXCJcXHUyNUIyXCIsXCIhXCIpLEs9dShcIlxcdTI1QTBcIixcInhcIiksYj10PT57c3dpdGNoKHQpe2Nhc2VcImluaXRpYWxcIjpjYXNlXCJhY3RpdmVcIjpyZXR1cm4gZS5jeWFuKGxlKTtjYXNlXCJjYW5jZWxcIjpyZXR1cm4gZS5yZWQoTCk7Y2FzZVwiZXJyb3JcIjpyZXR1cm4gZS55ZWxsb3coVyk7Y2FzZVwic3VibWl0XCI6cmV0dXJuIGUuZ3JlZW4oQyl9fSxHPXQ9Pntjb25zdHtjdXJzb3I6bixvcHRpb25zOnIsc3R5bGU6aX09dCxzPXQubWF4SXRlbXM/P051bWJlci5QT1NJVElWRV9JTkZJTklUWSxjPU1hdGgubWF4KHByb2Nlc3Muc3Rkb3V0LnJvd3MtNCwwKSxhPU1hdGgubWluKGMsTWF0aC5tYXgocyw1KSk7bGV0IGw9MDtuPj1sK2EtMz9sPU1hdGgubWF4KE1hdGgubWluKG4tYSszLHIubGVuZ3RoLWEpLDApOm48bCsyJiYobD1NYXRoLm1heChuLTIsMCkpO2NvbnN0ICQ9YTxyLmxlbmd0aCYmbD4wLGc9YTxyLmxlbmd0aCYmbCthPHIubGVuZ3RoO3JldHVybiByLnNsaWNlKGwsbCthKS5tYXAoKHAsdixmKT0+e2NvbnN0IGo9dj09PTAmJiQsRT12PT09Zi5sZW5ndGgtMSYmZztyZXR1cm4ganx8RT9lLmRpbShcIi4uLlwiKTppKHAsditsPT09bil9KX0saGU9dD0+bmV3IFEoe3ZhbGlkYXRlOnQudmFsaWRhdGUscGxhY2Vob2xkZXI6dC5wbGFjZWhvbGRlcixkZWZhdWx0VmFsdWU6dC5kZWZhdWx0VmFsdWUsaW5pdGlhbFZhbHVlOnQuaW5pdGlhbFZhbHVlLHJlbmRlcigpe2NvbnN0IG49YCR7ZS5ncmF5KG8pfVxuJHtiKHRoaXMuc3RhdGUpfSAgJHt0Lm1lc3NhZ2V9XG5gLHI9dC5wbGFjZWhvbGRlcj9lLmludmVyc2UodC5wbGFjZWhvbGRlclswXSkrZS5kaW0odC5wbGFjZWhvbGRlci5zbGljZSgxKSk6ZS5pbnZlcnNlKGUuaGlkZGVuKFwiX1wiKSksaT10aGlzLnZhbHVlP3RoaXMudmFsdWVXaXRoQ3Vyc29yOnI7c3dpdGNoKHRoaXMuc3RhdGUpe2Nhc2VcImVycm9yXCI6cmV0dXJuYCR7bi50cmltKCl9XG4ke2UueWVsbG93KG8pfSAgJHtpfVxuJHtlLnllbGxvdyhkKX0gICR7ZS55ZWxsb3codGhpcy5lcnJvcil9XG5gO2Nhc2VcInN1Ym1pdFwiOnJldHVybmAke259JHtlLmdyYXkobyl9ICAke2UuZGltKHRoaXMudmFsdWV8fHQucGxhY2Vob2xkZXIpfWA7Y2FzZVwiY2FuY2VsXCI6cmV0dXJuYCR7bn0ke2UuZ3JheShvKX0gICR7ZS5zdHJpa2V0aHJvdWdoKGUuZGltKHRoaXMudmFsdWU/P1wiXCIpKX0ke3RoaXMudmFsdWU/LnRyaW0oKT9gXG4ke2UuZ3JheShvKX1gOlwiXCJ9YDtkZWZhdWx0OnJldHVybmAke259JHtlLmN5YW4obyl9ICAke2l9XG4ke2UuY3lhbihkKX1cbmB9fX0pLnByb21wdCgpLGdlPXQ9Pm5ldyBYKHt2YWxpZGF0ZTp0LnZhbGlkYXRlLG1hc2s6dC5tYXNrPz8kZSxyZW5kZXIoKXtjb25zdCBuPWAke2UuZ3JheShvKX1cbiR7Yih0aGlzLnN0YXRlKX0gICR7dC5tZXNzYWdlfVxuYCxyPXRoaXMudmFsdWVXaXRoQ3Vyc29yLGk9dGhpcy5tYXNrZWQ7c3dpdGNoKHRoaXMuc3RhdGUpe2Nhc2VcImVycm9yXCI6cmV0dXJuYCR7bi50cmltKCl9XG4ke2UueWVsbG93KG8pfSAgJHtpfVxuJHtlLnllbGxvdyhkKX0gICR7ZS55ZWxsb3codGhpcy5lcnJvcil9XG5gO2Nhc2VcInN1Ym1pdFwiOnJldHVybmAke259JHtlLmdyYXkobyl9ICAke2UuZGltKGkpfWA7Y2FzZVwiY2FuY2VsXCI6cmV0dXJuYCR7bn0ke2UuZ3JheShvKX0gICR7ZS5zdHJpa2V0aHJvdWdoKGUuZGltKGk/P1wiXCIpKX0ke2k/YFxuJHtlLmdyYXkobyl9YDpcIlwifWA7ZGVmYXVsdDpyZXR1cm5gJHtufSR7ZS5jeWFuKG8pfSAgJHtyfVxuJHtlLmN5YW4oZCl9XG5gfX19KS5wcm9tcHQoKSx5ZT10PT57Y29uc3Qgbj10LmFjdGl2ZT8/XCJZZXNcIixyPXQuaW5hY3RpdmU/P1wiTm9cIjtyZXR1cm4gbmV3IFooe2FjdGl2ZTpuLGluYWN0aXZlOnIsaW5pdGlhbFZhbHVlOnQuaW5pdGlhbFZhbHVlPz8hMCxyZW5kZXIoKXtjb25zdCBpPWAke2UuZ3JheShvKX1cbiR7Yih0aGlzLnN0YXRlKX0gICR7dC5tZXNzYWdlfVxuYCxzPXRoaXMudmFsdWU/bjpyO3N3aXRjaCh0aGlzLnN0YXRlKXtjYXNlXCJzdWJtaXRcIjpyZXR1cm5gJHtpfSR7ZS5ncmF5KG8pfSAgJHtlLmRpbShzKX1gO2Nhc2VcImNhbmNlbFwiOnJldHVybmAke2l9JHtlLmdyYXkobyl9ICAke2Uuc3RyaWtldGhyb3VnaChlLmRpbShzKSl9XG4ke2UuZ3JheShvKX1gO2RlZmF1bHQ6cmV0dXJuYCR7aX0ke2UuY3lhbihvKX0gICR7dGhpcy52YWx1ZT9gJHtlLmdyZWVuKGspfSAke259YDpgJHtlLmRpbShQKX0gJHtlLmRpbShuKX1gfSAke2UuZGltKFwiL1wiKX0gJHt0aGlzLnZhbHVlP2Ake2UuZGltKFApfSAke2UuZGltKHIpfWA6YCR7ZS5ncmVlbihrKX0gJHtyfWB9XG4ke2UuY3lhbihkKX1cbmB9fX0pLnByb21wdCgpfSx2ZT10PT57Y29uc3Qgbj0ocixpKT0+e2NvbnN0IHM9ci5sYWJlbD8/U3RyaW5nKHIudmFsdWUpO3N3aXRjaChpKXtjYXNlXCJzZWxlY3RlZFwiOnJldHVybmAke2UuZGltKHMpfWA7Y2FzZVwiYWN0aXZlXCI6cmV0dXJuYCR7ZS5ncmVlbihrKX0gJHtzfSAke3IuaGludD9lLmRpbShgKCR7ci5oaW50fSlgKTpcIlwifWA7Y2FzZVwiY2FuY2VsbGVkXCI6cmV0dXJuYCR7ZS5zdHJpa2V0aHJvdWdoKGUuZGltKHMpKX1gO2RlZmF1bHQ6cmV0dXJuYCR7ZS5kaW0oUCl9ICR7ZS5kaW0ocyl9YH19O3JldHVybiBuZXcgZWUoe29wdGlvbnM6dC5vcHRpb25zLGluaXRpYWxWYWx1ZTp0LmluaXRpYWxWYWx1ZSxyZW5kZXIoKXtjb25zdCByPWAke2UuZ3JheShvKX1cbiR7Yih0aGlzLnN0YXRlKX0gICR7dC5tZXNzYWdlfVxuYDtzd2l0Y2godGhpcy5zdGF0ZSl7Y2FzZVwic3VibWl0XCI6cmV0dXJuYCR7cn0ke2UuZ3JheShvKX0gICR7bih0aGlzLm9wdGlvbnNbdGhpcy5jdXJzb3JdLFwic2VsZWN0ZWRcIil9YDtjYXNlXCJjYW5jZWxcIjpyZXR1cm5gJHtyfSR7ZS5ncmF5KG8pfSAgJHtuKHRoaXMub3B0aW9uc1t0aGlzLmN1cnNvcl0sXCJjYW5jZWxsZWRcIil9XG4ke2UuZ3JheShvKX1gO2RlZmF1bHQ6cmV0dXJuYCR7cn0ke2UuY3lhbihvKX0gICR7Ryh7Y3Vyc29yOnRoaXMuY3Vyc29yLG9wdGlvbnM6dGhpcy5vcHRpb25zLG1heEl0ZW1zOnQubWF4SXRlbXMsc3R5bGU6KGkscyk9Pm4oaSxzP1wiYWN0aXZlXCI6XCJpbmFjdGl2ZVwiKX0pLmpvaW4oYFxuJHtlLmN5YW4obyl9ICBgKX1cbiR7ZS5jeWFuKGQpfVxuYH19fSkucHJvbXB0KCl9LHdlPXQ9Pntjb25zdCBuPShyLGk9XCJpbmFjdGl2ZVwiKT0+e2NvbnN0IHM9ci5sYWJlbD8/U3RyaW5nKHIudmFsdWUpO3JldHVybiBpPT09XCJzZWxlY3RlZFwiP2Ake2UuZGltKHMpfWA6aT09PVwiY2FuY2VsbGVkXCI/YCR7ZS5zdHJpa2V0aHJvdWdoKGUuZGltKHMpKX1gOmk9PT1cImFjdGl2ZVwiP2Ake2UuYmdDeWFuKGUuZ3JheShgICR7ci52YWx1ZX0gYCkpfSAke3N9ICR7ci5oaW50P2UuZGltKGAoJHtyLmhpbnR9KWApOlwiXCJ9YDpgJHtlLmdyYXkoZS5iZ1doaXRlKGUuaW52ZXJzZShgICR7ci52YWx1ZX0gYCkpKX0gJHtzfSAke3IuaGludD9lLmRpbShgKCR7ci5oaW50fSlgKTpcIlwifWB9O3JldHVybiBuZXcgdGUoe29wdGlvbnM6dC5vcHRpb25zLGluaXRpYWxWYWx1ZTp0LmluaXRpYWxWYWx1ZSxyZW5kZXIoKXtjb25zdCByPWAke2UuZ3JheShvKX1cbiR7Yih0aGlzLnN0YXRlKX0gICR7dC5tZXNzYWdlfVxuYDtzd2l0Y2godGhpcy5zdGF0ZSl7Y2FzZVwic3VibWl0XCI6cmV0dXJuYCR7cn0ke2UuZ3JheShvKX0gICR7bih0aGlzLm9wdGlvbnMuZmluZChpPT5pLnZhbHVlPT09dGhpcy52YWx1ZSk/P3Qub3B0aW9uc1swXSxcInNlbGVjdGVkXCIpfWA7Y2FzZVwiY2FuY2VsXCI6cmV0dXJuYCR7cn0ke2UuZ3JheShvKX0gICR7bih0aGlzLm9wdGlvbnNbMF0sXCJjYW5jZWxsZWRcIil9XG4ke2UuZ3JheShvKX1gO2RlZmF1bHQ6cmV0dXJuYCR7cn0ke2UuY3lhbihvKX0gICR7dGhpcy5vcHRpb25zLm1hcCgoaSxzKT0+bihpLHM9PT10aGlzLmN1cnNvcj9cImFjdGl2ZVwiOlwiaW5hY3RpdmVcIikpLmpvaW4oYFxuJHtlLmN5YW4obyl9ICBgKX1cbiR7ZS5jeWFuKGQpfVxuYH19fSkucHJvbXB0KCl9LGZlPXQ9Pntjb25zdCBuPShyLGkpPT57Y29uc3Qgcz1yLmxhYmVsPz9TdHJpbmcoci52YWx1ZSk7cmV0dXJuIGk9PT1cImFjdGl2ZVwiP2Ake2UuY3lhbihBKX0gJHtzfSAke3IuaGludD9lLmRpbShgKCR7ci5oaW50fSlgKTpcIlwifWA6aT09PVwic2VsZWN0ZWRcIj9gJHtlLmdyZWVuKFQpfSAke2UuZGltKHMpfSAke3IuaGludD9lLmRpbShgKCR7ci5oaW50fSlgKTpcIlwifWA6aT09PVwiY2FuY2VsbGVkXCI/YCR7ZS5zdHJpa2V0aHJvdWdoKGUuZGltKHMpKX1gOmk9PT1cImFjdGl2ZS1zZWxlY3RlZFwiP2Ake2UuZ3JlZW4oVCl9ICR7c30gJHtyLmhpbnQ/ZS5kaW0oYCgke3IuaGludH0pYCk6XCJcIn1gOmk9PT1cInN1Ym1pdHRlZFwiP2Ake2UuZGltKHMpfWA6YCR7ZS5kaW0oRil9ICR7ZS5kaW0ocyl9YH07cmV0dXJuIG5ldyByZSh7b3B0aW9uczp0Lm9wdGlvbnMsaW5pdGlhbFZhbHVlczp0LmluaXRpYWxWYWx1ZXMscmVxdWlyZWQ6dC5yZXF1aXJlZD8/ITAsY3Vyc29yQXQ6dC5jdXJzb3JBdCx2YWxpZGF0ZShyKXtpZih0aGlzLnJlcXVpcmVkJiZyLmxlbmd0aD09PTApcmV0dXJuYFBsZWFzZSBzZWxlY3QgYXQgbGVhc3Qgb25lIG9wdGlvbi5cbiR7ZS5yZXNldChlLmRpbShgUHJlc3MgJHtlLmdyYXkoZS5iZ1doaXRlKGUuaW52ZXJzZShcIiBzcGFjZSBcIikpKX0gdG8gc2VsZWN0LCAke2UuZ3JheShlLmJnV2hpdGUoZS5pbnZlcnNlKFwiIGVudGVyIFwiKSkpfSB0byBzdWJtaXRgKSl9YH0scmVuZGVyKCl7Y29uc3Qgcj1gJHtlLmdyYXkobyl9XG4ke2IodGhpcy5zdGF0ZSl9ICAke3QubWVzc2FnZX1cbmAsaT0ocyxjKT0+e2NvbnN0IGE9dGhpcy52YWx1ZS5pbmNsdWRlcyhzLnZhbHVlKTtyZXR1cm4gYyYmYT9uKHMsXCJhY3RpdmUtc2VsZWN0ZWRcIik6YT9uKHMsXCJzZWxlY3RlZFwiKTpuKHMsYz9cImFjdGl2ZVwiOlwiaW5hY3RpdmVcIil9O3N3aXRjaCh0aGlzLnN0YXRlKXtjYXNlXCJzdWJtaXRcIjpyZXR1cm5gJHtyfSR7ZS5ncmF5KG8pfSAgJHt0aGlzLm9wdGlvbnMuZmlsdGVyKCh7dmFsdWU6c30pPT50aGlzLnZhbHVlLmluY2x1ZGVzKHMpKS5tYXAocz0+bihzLFwic3VibWl0dGVkXCIpKS5qb2luKGUuZGltKFwiLCBcIikpfHxlLmRpbShcIm5vbmVcIil9YDtjYXNlXCJjYW5jZWxcIjp7Y29uc3Qgcz10aGlzLm9wdGlvbnMuZmlsdGVyKCh7dmFsdWU6Y30pPT50aGlzLnZhbHVlLmluY2x1ZGVzKGMpKS5tYXAoYz0+bihjLFwiY2FuY2VsbGVkXCIpKS5qb2luKGUuZGltKFwiLCBcIikpO3JldHVybmAke3J9JHtlLmdyYXkobyl9ICAke3MudHJpbSgpP2Ake3N9XG4ke2UuZ3JheShvKX1gOlwiXCJ9YH1jYXNlXCJlcnJvclwiOntjb25zdCBzPXRoaXMuZXJyb3Iuc3BsaXQoYFxuYCkubWFwKChjLGEpPT5hPT09MD9gJHtlLnllbGxvdyhkKX0gICR7ZS55ZWxsb3coYyl9YDpgICAgJHtjfWApLmpvaW4oYFxuYCk7cmV0dXJuYCR7citlLnllbGxvdyhvKX0gICR7Ryh7b3B0aW9uczp0aGlzLm9wdGlvbnMsY3Vyc29yOnRoaXMuY3Vyc29yLG1heEl0ZW1zOnQubWF4SXRlbXMsc3R5bGU6aX0pLmpvaW4oYFxuJHtlLnllbGxvdyhvKX0gIGApfVxuJHtzfVxuYH1kZWZhdWx0OnJldHVybmAke3J9JHtlLmN5YW4obyl9ICAke0coe29wdGlvbnM6dGhpcy5vcHRpb25zLGN1cnNvcjp0aGlzLmN1cnNvcixtYXhJdGVtczp0Lm1heEl0ZW1zLHN0eWxlOml9KS5qb2luKGBcbiR7ZS5jeWFuKG8pfSAgYCl9XG4ke2UuY3lhbihkKX1cbmB9fX0pLnByb21wdCgpfSxiZT10PT57Y29uc3R7c2VsZWN0YWJsZUdyb3VwczpuPSEwfT10LHI9KGkscyxjPVtdKT0+e2NvbnN0IGE9aS5sYWJlbD8/U3RyaW5nKGkudmFsdWUpLGw9dHlwZW9mIGkuZ3JvdXA9PVwic3RyaW5nXCIsJD1sJiYoY1tjLmluZGV4T2YoaSkrMV0/P3tncm91cDohMH0pLGc9bCYmJC5ncm91cD09PSEwLHA9bD9uP2Ake2c/ZDpvfSBgOlwiICBcIjpcIlwiO2lmKHM9PT1cImFjdGl2ZVwiKXJldHVybmAke2UuZGltKHApfSR7ZS5jeWFuKEEpfSAke2F9ICR7aS5oaW50P2UuZGltKGAoJHtpLmhpbnR9KWApOlwiXCJ9YDtpZihzPT09XCJncm91cC1hY3RpdmVcIilyZXR1cm5gJHtwfSR7ZS5jeWFuKEEpfSAke2UuZGltKGEpfWA7aWYocz09PVwiZ3JvdXAtYWN0aXZlLXNlbGVjdGVkXCIpcmV0dXJuYCR7cH0ke2UuZ3JlZW4oVCl9ICR7ZS5kaW0oYSl9YDtpZihzPT09XCJzZWxlY3RlZFwiKXtjb25zdCBmPWx8fG4/ZS5ncmVlbihUKTpcIlwiO3JldHVybmAke2UuZGltKHApfSR7Zn0gJHtlLmRpbShhKX0gJHtpLmhpbnQ/ZS5kaW0oYCgke2kuaGludH0pYCk6XCJcIn1gfWlmKHM9PT1cImNhbmNlbGxlZFwiKXJldHVybmAke2Uuc3RyaWtldGhyb3VnaChlLmRpbShhKSl9YDtpZihzPT09XCJhY3RpdmUtc2VsZWN0ZWRcIilyZXR1cm5gJHtlLmRpbShwKX0ke2UuZ3JlZW4oVCl9ICR7YX0gJHtpLmhpbnQ/ZS5kaW0oYCgke2kuaGludH0pYCk6XCJcIn1gO2lmKHM9PT1cInN1Ym1pdHRlZFwiKXJldHVybmAke2UuZGltKGEpfWA7Y29uc3Qgdj1sfHxuP2UuZGltKEYpOlwiXCI7cmV0dXJuYCR7ZS5kaW0ocCl9JHt2fSAke2UuZGltKGEpfWB9O3JldHVybiBuZXcgc2Uoe29wdGlvbnM6dC5vcHRpb25zLGluaXRpYWxWYWx1ZXM6dC5pbml0aWFsVmFsdWVzLHJlcXVpcmVkOnQucmVxdWlyZWQ/PyEwLGN1cnNvckF0OnQuY3Vyc29yQXQsc2VsZWN0YWJsZUdyb3VwczpuLHZhbGlkYXRlKGkpe2lmKHRoaXMucmVxdWlyZWQmJmkubGVuZ3RoPT09MClyZXR1cm5gUGxlYXNlIHNlbGVjdCBhdCBsZWFzdCBvbmUgb3B0aW9uLlxuJHtlLnJlc2V0KGUuZGltKGBQcmVzcyAke2UuZ3JheShlLmJnV2hpdGUoZS5pbnZlcnNlKFwiIHNwYWNlIFwiKSkpfSB0byBzZWxlY3QsICR7ZS5ncmF5KGUuYmdXaGl0ZShlLmludmVyc2UoXCIgZW50ZXIgXCIpKSl9IHRvIHN1Ym1pdGApKX1gfSxyZW5kZXIoKXtjb25zdCBpPWAke2UuZ3JheShvKX1cbiR7Yih0aGlzLnN0YXRlKX0gICR7dC5tZXNzYWdlfVxuYDtzd2l0Y2godGhpcy5zdGF0ZSl7Y2FzZVwic3VibWl0XCI6cmV0dXJuYCR7aX0ke2UuZ3JheShvKX0gICR7dGhpcy5vcHRpb25zLmZpbHRlcigoe3ZhbHVlOnN9KT0+dGhpcy52YWx1ZS5pbmNsdWRlcyhzKSkubWFwKHM9PnIocyxcInN1Ym1pdHRlZFwiKSkuam9pbihlLmRpbShcIiwgXCIpKX1gO2Nhc2VcImNhbmNlbFwiOntjb25zdCBzPXRoaXMub3B0aW9ucy5maWx0ZXIoKHt2YWx1ZTpjfSk9PnRoaXMudmFsdWUuaW5jbHVkZXMoYykpLm1hcChjPT5yKGMsXCJjYW5jZWxsZWRcIikpLmpvaW4oZS5kaW0oXCIsIFwiKSk7cmV0dXJuYCR7aX0ke2UuZ3JheShvKX0gICR7cy50cmltKCk/YCR7c31cbiR7ZS5ncmF5KG8pfWA6XCJcIn1gfWNhc2VcImVycm9yXCI6e2NvbnN0IHM9dGhpcy5lcnJvci5zcGxpdChgXG5gKS5tYXAoKGMsYSk9PmE9PT0wP2Ake2UueWVsbG93KGQpfSAgJHtlLnllbGxvdyhjKX1gOmAgICAke2N9YCkuam9pbihgXG5gKTtyZXR1cm5gJHtpfSR7ZS55ZWxsb3cobyl9ICAke3RoaXMub3B0aW9ucy5tYXAoKGMsYSxsKT0+e2NvbnN0ICQ9dGhpcy52YWx1ZS5pbmNsdWRlcyhjLnZhbHVlKXx8Yy5ncm91cD09PSEwJiZ0aGlzLmlzR3JvdXBTZWxlY3RlZChgJHtjLnZhbHVlfWApLGc9YT09PXRoaXMuY3Vyc29yO3JldHVybiFnJiZ0eXBlb2YgYy5ncm91cD09XCJzdHJpbmdcIiYmdGhpcy5vcHRpb25zW3RoaXMuY3Vyc29yXS52YWx1ZT09PWMuZ3JvdXA/cihjLCQ/XCJncm91cC1hY3RpdmUtc2VsZWN0ZWRcIjpcImdyb3VwLWFjdGl2ZVwiLGwpOmcmJiQ/cihjLFwiYWN0aXZlLXNlbGVjdGVkXCIsbCk6JD9yKGMsXCJzZWxlY3RlZFwiLGwpOnIoYyxnP1wiYWN0aXZlXCI6XCJpbmFjdGl2ZVwiLGwpfSkuam9pbihgXG4ke2UueWVsbG93KG8pfSAgYCl9XG4ke3N9XG5gfWRlZmF1bHQ6cmV0dXJuYCR7aX0ke2UuY3lhbihvKX0gICR7dGhpcy5vcHRpb25zLm1hcCgocyxjLGEpPT57Y29uc3QgbD10aGlzLnZhbHVlLmluY2x1ZGVzKHMudmFsdWUpfHxzLmdyb3VwPT09ITAmJnRoaXMuaXNHcm91cFNlbGVjdGVkKGAke3MudmFsdWV9YCksJD1jPT09dGhpcy5jdXJzb3I7cmV0dXJuISQmJnR5cGVvZiBzLmdyb3VwPT1cInN0cmluZ1wiJiZ0aGlzLm9wdGlvbnNbdGhpcy5jdXJzb3JdLnZhbHVlPT09cy5ncm91cD9yKHMsbD9cImdyb3VwLWFjdGl2ZS1zZWxlY3RlZFwiOlwiZ3JvdXAtYWN0aXZlXCIsYSk6JCYmbD9yKHMsXCJhY3RpdmUtc2VsZWN0ZWRcIixhKTpsP3IocyxcInNlbGVjdGVkXCIsYSk6cihzLCQ/XCJhY3RpdmVcIjpcImluYWN0aXZlXCIsYSl9KS5qb2luKGBcbiR7ZS5jeWFuKG8pfSAgYCl9XG4ke2UuY3lhbihkKX1cbmB9fX0pLnByb21wdCgpfSxNZT0odD1cIlwiLG49XCJcIik9Pntjb25zdCByPWBcbiR7dH1cbmAuc3BsaXQoYFxuYCksaT1TKG4pLmxlbmd0aCxzPU1hdGgubWF4KHIucmVkdWNlKChhLGwpPT57Y29uc3QgJD1TKGwpO3JldHVybiAkLmxlbmd0aD5hPyQubGVuZ3RoOmF9LDApLGkpKzIsYz1yLm1hcChhPT5gJHtlLmdyYXkobyl9ICAke2UuZGltKGEpfSR7XCIgXCIucmVwZWF0KHMtUyhhKS5sZW5ndGgpfSR7ZS5ncmF5KG8pfWApLmpvaW4oYFxuYCk7cHJvY2Vzcy5zdGRvdXQud3JpdGUoYCR7ZS5ncmF5KG8pfVxuJHtlLmdyZWVuKEMpfSAgJHtlLnJlc2V0KG4pfSAke2UuZ3JheShfLnJlcGVhdChNYXRoLm1heChzLWktMSwxKSkrbWUpfVxuJHtjfVxuJHtlLmdyYXkoZGUrXy5yZXBlYXQocysyKStwZSl9XG5gKX0seGU9KHQ9XCJcIik9Pntwcm9jZXNzLnN0ZG91dC53cml0ZShgJHtlLmdyYXkoZCl9ICAke2UucmVkKHQpfVxuXG5gKX0sSWU9KHQ9XCJcIik9Pntwcm9jZXNzLnN0ZG91dC53cml0ZShgJHtlLmdyYXkodWUpfSAgJHt0fVxuYCl9LFNlPSh0PVwiXCIpPT57cHJvY2Vzcy5zdGRvdXQud3JpdGUoYCR7ZS5ncmF5KG8pfVxuJHtlLmdyYXkoZCl9ICAke3R9XG5cbmApfSxNPXttZXNzYWdlOih0PVwiXCIse3N5bWJvbDpuPWUuZ3JheShvKX09e30pPT57Y29uc3Qgcj1bYCR7ZS5ncmF5KG8pfWBdO2lmKHQpe2NvbnN0W2ksLi4uc109dC5zcGxpdChgXG5gKTtyLnB1c2goYCR7bn0gICR7aX1gLC4uLnMubWFwKGM9PmAke2UuZ3JheShvKX0gICR7Y31gKSl9cHJvY2Vzcy5zdGRvdXQud3JpdGUoYCR7ci5qb2luKGBcbmApfVxuYCl9LGluZm86dD0+e00ubWVzc2FnZSh0LHtzeW1ib2w6ZS5ibHVlKHEpfSl9LHN1Y2Nlc3M6dD0+e00ubWVzc2FnZSh0LHtzeW1ib2w6ZS5ncmVlbihEKX0pfSxzdGVwOnQ9PntNLm1lc3NhZ2UodCx7c3ltYm9sOmUuZ3JlZW4oQyl9KX0sd2Fybjp0PT57TS5tZXNzYWdlKHQse3N5bWJvbDplLnllbGxvdyhVKX0pfSx3YXJuaW5nOnQ9PntNLndhcm4odCl9LGVycm9yOnQ9PntNLm1lc3NhZ2UodCx7c3ltYm9sOmUucmVkKEspfSl9fSxKPWAke2UuZ3JheShvKX0gIGAseD17bWVzc2FnZTphc3luYyh0LHtzeW1ib2w6bj1lLmdyYXkobyl9PXt9KT0+e3Byb2Nlc3Muc3Rkb3V0LndyaXRlKGAke2UuZ3JheShvKX1cbiR7bn0gIGApO2xldCByPTM7Zm9yIGF3YWl0KGxldCBpIG9mIHQpe2k9aS5yZXBsYWNlKC9cXG4vZyxgXG4ke0p9YCksaS5pbmNsdWRlcyhgXG5gKSYmKHI9MytTKGkuc2xpY2UoaS5sYXN0SW5kZXhPZihgXG5gKSkpLmxlbmd0aCk7Y29uc3Qgcz1TKGkpLmxlbmd0aDtyK3M8cHJvY2Vzcy5zdGRvdXQuY29sdW1ucz8ocis9cyxwcm9jZXNzLnN0ZG91dC53cml0ZShpKSk6KHByb2Nlc3Muc3Rkb3V0LndyaXRlKGBcbiR7Sn0ke2kudHJpbVN0YXJ0KCl9YCkscj0zK1MoaS50cmltU3RhcnQoKSkubGVuZ3RoKX1wcm9jZXNzLnN0ZG91dC53cml0ZShgXG5gKX0saW5mbzp0PT54Lm1lc3NhZ2UodCx7c3ltYm9sOmUuYmx1ZShxKX0pLHN1Y2Nlc3M6dD0+eC5tZXNzYWdlKHQse3N5bWJvbDplLmdyZWVuKEQpfSksc3RlcDp0PT54Lm1lc3NhZ2UodCx7c3ltYm9sOmUuZ3JlZW4oQyl9KSx3YXJuOnQ9PngubWVzc2FnZSh0LHtzeW1ib2w6ZS55ZWxsb3coVSl9KSx3YXJuaW5nOnQ9Pngud2Fybih0KSxlcnJvcjp0PT54Lm1lc3NhZ2UodCx7c3ltYm9sOmUucmVkKEspfSl9LFk9KHtpbmRpY2F0b3I6dD1cImRvdHNcIn09e30pPT57Y29uc3Qgbj1WP1tcIlxcdTI1RDJcIixcIlxcdTI1RDBcIixcIlxcdTI1RDNcIixcIlxcdTI1RDFcIl06W1wiXFx1MjAyMlwiLFwib1wiLFwiT1wiLFwiMFwiXSxyPVY/ODA6MTIwLGk9cHJvY2Vzcy5lbnYuQ0k9PT1cInRydWVcIjtsZXQgcyxjLGE9ITEsbD1cIlwiLCQsZz1wZXJmb3JtYW5jZS5ub3coKTtjb25zdCBwPW09Pntjb25zdCBoPW0+MT9cIlNvbWV0aGluZyB3ZW50IHdyb25nXCI6XCJDYW5jZWxlZFwiO2EmJk4oaCxtKX0sdj0oKT0+cCgyKSxmPSgpPT5wKDEpLGo9KCk9Pntwcm9jZXNzLm9uKFwidW5jYXVnaHRFeGNlcHRpb25Nb25pdG9yXCIsdikscHJvY2Vzcy5vbihcInVuaGFuZGxlZFJlamVjdGlvblwiLHYpLHByb2Nlc3Mub24oXCJTSUdJTlRcIixmKSxwcm9jZXNzLm9uKFwiU0lHVEVSTVwiLGYpLHByb2Nlc3Mub24oXCJleGl0XCIscCl9LEU9KCk9Pntwcm9jZXNzLnJlbW92ZUxpc3RlbmVyKFwidW5jYXVnaHRFeGNlcHRpb25Nb25pdG9yXCIsdikscHJvY2Vzcy5yZW1vdmVMaXN0ZW5lcihcInVuaGFuZGxlZFJlamVjdGlvblwiLHYpLHByb2Nlc3MucmVtb3ZlTGlzdGVuZXIoXCJTSUdJTlRcIixmKSxwcm9jZXNzLnJlbW92ZUxpc3RlbmVyKFwiU0lHVEVSTVwiLGYpLHByb2Nlc3MucmVtb3ZlTGlzdGVuZXIoXCJleGl0XCIscCl9LEI9KCk9PntpZigkPT09dm9pZCAwKXJldHVybjtpJiZwcm9jZXNzLnN0ZG91dC53cml0ZShgXG5gKTtjb25zdCBtPSQuc3BsaXQoYFxuYCk7cHJvY2Vzcy5zdGRvdXQud3JpdGUob2UubW92ZSgtOTk5LG0ubGVuZ3RoLTEpKSxwcm9jZXNzLnN0ZG91dC53cml0ZShhZS5kb3duKG0ubGVuZ3RoKSl9LFI9bT0+bS5yZXBsYWNlKC9cXC4rJC8sXCJcIiksTz1tPT57Y29uc3QgaD0ocGVyZm9ybWFuY2Uubm93KCktbSkvMWUzLHc9TWF0aC5mbG9vcihoLzYwKSxJPU1hdGguZmxvb3IoaCU2MCk7cmV0dXJuIHc+MD9gWyR7d31tICR7SX1zXWA6YFske0l9c11gfSxIPShtPVwiXCIpPT57YT0hMCxzPW5lKCksbD1SKG0pLGc9cGVyZm9ybWFuY2Uubm93KCkscHJvY2Vzcy5zdGRvdXQud3JpdGUoYCR7ZS5ncmF5KG8pfVxuYCk7bGV0IGg9MCx3PTA7aigpLGM9c2V0SW50ZXJ2YWwoKCk9PntpZihpJiZsPT09JClyZXR1cm47QigpLCQ9bDtjb25zdCBJPWUubWFnZW50YShuW2hdKTtpZihpKXByb2Nlc3Muc3Rkb3V0LndyaXRlKGAke0l9ICAke2x9Li4uYCk7ZWxzZSBpZih0PT09XCJ0aW1lclwiKXByb2Nlc3Muc3Rkb3V0LndyaXRlKGAke0l9ICAke2x9ICR7TyhnKX1gKTtlbHNle2NvbnN0IHo9XCIuXCIucmVwZWF0KE1hdGguZmxvb3IodykpLnNsaWNlKDAsMyk7cHJvY2Vzcy5zdGRvdXQud3JpdGUoYCR7SX0gICR7bH0ke3p9YCl9aD1oKzE8bi5sZW5ndGg/aCsxOjAsdz13PG4ubGVuZ3RoP3crLjEyNTowfSxyKX0sTj0obT1cIlwiLGg9MCk9PnthPSExLGNsZWFySW50ZXJ2YWwoYyksQigpO2NvbnN0IHc9aD09PTA/ZS5ncmVlbihDKTpoPT09MT9lLnJlZChMKTplLnJlZChXKTtsPVIobT8/bCksdD09PVwidGltZXJcIj9wcm9jZXNzLnN0ZG91dC53cml0ZShgJHt3fSAgJHtsfSAke08oZyl9XG5gKTpwcm9jZXNzLnN0ZG91dC53cml0ZShgJHt3fSAgJHtsfVxuYCksRSgpLHMoKX07cmV0dXJue3N0YXJ0Okgsc3RvcDpOLG1lc3NhZ2U6KG09XCJcIik9PntsPVIobT8/bCl9fX0sQ2U9YXN5bmModCxuKT0+e2NvbnN0IHI9e30saT1PYmplY3Qua2V5cyh0KTtmb3IoY29uc3QgcyBvZiBpKXtjb25zdCBjPXRbc10sYT1hd2FpdCBjKHtyZXN1bHRzOnJ9KT8uY2F0Y2gobD0+e3Rocm93IGx9KTtpZih0eXBlb2Ygbj8ub25DYW5jZWw9PVwiZnVuY3Rpb25cIiYmaWUoYSkpe3Jbc109XCJjYW5jZWxlZFwiLG4ub25DYW5jZWwoe3Jlc3VsdHM6cn0pO2NvbnRpbnVlfXJbc109YX1yZXR1cm4gcn0sVGU9YXN5bmMgdD0+e2Zvcihjb25zdCBuIG9mIHQpe2lmKG4uZW5hYmxlZD09PSExKWNvbnRpbnVlO2NvbnN0IHI9WSgpO3Iuc3RhcnQobi50aXRsZSk7Y29uc3QgaT1hd2FpdCBuLnRhc2soci5tZXNzYWdlKTtyLnN0b3AoaXx8bi50aXRsZSl9fTtleHBvcnR7eGUgYXMgY2FuY2VsLHllIGFzIGNvbmZpcm0sQ2UgYXMgZ3JvdXAsYmUgYXMgZ3JvdXBNdWx0aXNlbGVjdCxJZSBhcyBpbnRybyxNIGFzIGxvZyxmZSBhcyBtdWx0aXNlbGVjdCxNZSBhcyBub3RlLFNlIGFzIG91dHJvLGdlIGFzIHBhc3N3b3JkLHZlIGFzIHNlbGVjdCx3ZSBhcyBzZWxlY3RLZXksWSBhcyBzcGlubmVyLHggYXMgc3RyZWFtLFRlIGFzIHRhc2tzLGhlIGFzIHRleHR9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXgubWpzLm1hcFxuIiwKICAgICIvKipcbiAqIE9wZW5Db2RlIFNESyBCYWNrZW5kIFdyYXBwZXJcbiAqXG4gKiBQcm92aWRlcyBzZXNzaW9uIG1hbmFnZW1lbnQgYW5kIG1lc3NhZ2Ugc2VuZGluZyBjYXBhYmlsaXRpZXNcbiAqIGZvciBhaS1lbmcgcmFscGggcnVubmVyIHVzaW5nIE9wZW5Db2RlIFNESy5cbiAqL1xuXG5pbXBvcnQgeyBjcmVhdGVTZXJ2ZXIgfSBmcm9tIFwibm9kZTpuZXRcIjtcbmltcG9ydCB7XG4gICAgdHlwZSBPcGVuY29kZUNsaWVudCxcbiAgICBjcmVhdGVPcGVuY29kZSxcbiAgICBjcmVhdGVPcGVuY29kZUNsaWVudCxcbn0gZnJvbSBcIkBvcGVuY29kZS1haS9zZGtcIjtcbmltcG9ydCB7IExvZyB9IGZyb20gXCIuLi8uLi91dGlsL2xvZ1wiO1xuXG5jb25zdCBsb2cgPSBMb2cuY3JlYXRlKHsgc2VydmljZTogXCJvcGVuY29kZS1jbGllbnRcIiB9KTtcblxuLyoqXG4gKiBSZXNwb25zZSBpbnRlcmZhY2UgZm9yIG1lc3NhZ2VzXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTWVzc2FnZVJlc3BvbnNlIHtcbiAgICBjb250ZW50OiBzdHJpbmc7XG59XG5cbi8qKlxuICogU3RyZWFtaW5nIHJlc3BvbnNlIGludGVyZmFjZVxuICovXG5leHBvcnQgaW50ZXJmYWNlIFN0cmVhbWluZ1Jlc3BvbnNlIHtcbiAgICAvKiogUmVhZGFibGUgc3RyZWFtIG9mIHJlc3BvbnNlIGNodW5rcyAqL1xuICAgIHN0cmVhbTogUmVhZGFibGVTdHJlYW08VWludDhBcnJheT47XG4gICAgLyoqIFByb21pc2UgdGhhdCByZXNvbHZlcyB0byBjb21wbGV0ZSByZXNwb25zZSB3aGVuIHN0cmVhbSBlbmRzICovXG4gICAgY29tcGxldGU6IFByb21pc2U8TWVzc2FnZVJlc3BvbnNlPjtcbn1cblxuLyoqXG4gKiBTZXNzaW9uIGludGVyZmFjZSBmb3IgYWktZW5nIHJ1bm5lclxuICovXG5leHBvcnQgaW50ZXJmYWNlIFNlc3Npb24ge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgc2VuZE1lc3NhZ2U6IChtZXNzYWdlOiBzdHJpbmcpID0+IFByb21pc2U8TWVzc2FnZVJlc3BvbnNlPjtcbiAgICBzZW5kTWVzc2FnZVN0cmVhbTogKG1lc3NhZ2U6IHN0cmluZykgPT4gUHJvbWlzZTxTdHJlYW1pbmdSZXNwb25zZT47XG4gICAgY2xvc2U6ICgpID0+IFByb21pc2U8dm9pZD47XG4gICAgLyoqIFRvb2wgaW52b2NhdGlvbnMgY2FwdHVyZWQgZHVyaW5nIHRoaXMgc2Vzc2lvbiAqL1xuICAgIF90b29sSW52b2NhdGlvbnM/OiBBcnJheTx7XG4gICAgICAgIGlkOiBzdHJpbmc7XG4gICAgICAgIG5hbWU6IHN0cmluZztcbiAgICAgICAgaW5wdXQ/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICAgICAgb3V0cHV0Pzogc3RyaW5nO1xuICAgICAgICBzdGF0dXM6IFwib2tcIiB8IFwiZXJyb3JcIjtcbiAgICAgICAgZXJyb3I/OiBzdHJpbmc7XG4gICAgICAgIHN0YXJ0ZWRBdD86IHN0cmluZztcbiAgICAgICAgY29tcGxldGVkQXQ/OiBzdHJpbmc7XG4gICAgfT47XG59XG5cbi8qKlxuICogQ2xpZW50IGNvbmZpZ3VyYXRpb24gb3B0aW9uc1xuICovXG5leHBvcnQgaW50ZXJmYWNlIENsaWVudENvbmZpZyB7XG4gICAgLyoqIEN1c3RvbSBjbGllbnQgaW5zdGFuY2UgKGZvciB0ZXN0aW5nKSAqL1xuICAgIGNsaWVudD86IE9wZW5jb2RlQ2xpZW50O1xuICAgIC8qKiBDb25uZWN0aW9uIHRpbWVvdXQgaW4gbWlsbGlzZWNvbmRzIChkZWZhdWx0OiAxMDAwMCkgKi9cbiAgICB0aW1lb3V0PzogbnVtYmVyO1xuICAgIC8qKiBSZXRyeSBhdHRlbXB0cyBmb3IgZmFpbGVkIG9wZXJhdGlvbnMgKi9cbiAgICByZXRyeUF0dGVtcHRzPzogbnVtYmVyO1xuICAgIC8qKiBQcm9tcHQgdGltZW91dCBpbiBtaWxsaXNlY29uZHMgKHVzZWQgYXMgYW4gaWRsZSB0aW1lb3V0IGZvciBzdHJlYW1pbmcpICovXG4gICAgcHJvbXB0VGltZW91dD86IG51bWJlcjtcbiAgICAvKiogRGlyZWN0b3J5L3dvcmt0cmVlIGNvbnRleHQgdG8gcnVuIE9wZW5Db2RlIGluIChkZWZhdWx0cyB0byBwcm9jZXNzLmN3ZCgpKSAqL1xuICAgIGRpcmVjdG9yeT86IHN0cmluZztcbiAgICAvKiogVVJMIG9mIGV4aXN0aW5nIE9wZW5Db2RlIHNlcnZlciB0byByZXVzZSAoaWYgcHJvdmlkZWQsIHdvbid0IHNwYXduIG5ldyBzZXJ2ZXIpICovXG4gICAgZXhpc3RpbmdTZXJ2ZXJVcmw/OiBzdHJpbmc7XG4gICAgLyoqIFNlcnZlciBzdGFydHVwIHRpbWVvdXQgaW4gbWlsbGlzZWNvbmRzIChkZWZhdWx0OiAxMDAwMCkgKi9cbiAgICBzZXJ2ZXJTdGFydHVwVGltZW91dD86IG51bWJlcjtcbiAgICAvKiogTk9URTogd29ya2luZ0RpciBwYXJhbWV0ZXIgaXMgbm90IHN1cHBvcnRlZCBieSB0aGUgU0RLXG4gICAgICogU3Bhd25lZCBPcGVuQ29kZSBzZXJ2ZXJzIHdpbGwgdXNlIHRoZSBjYWxsaW5nIGRpcmVjdG9yeSBieSBkZWZhdWx0IChwcm9jZXNzLmN3ZCgpKVxuICAgICAqIFVzZSBPUEVOQ09ERV9VUkwgdG8gY29ubmVjdCB0byBhIGRpZmZlcmVudCBPcGVuQ29kZSBpbnN0YW5jZSBpbnN0ZWFkXG4gICAgICovXG59XG5cbi8qKlxuICogT3BlbkNvZGUgQ2xpZW50IFdyYXBwZXJcbiAqXG4gKiBXcmFwcyBPcGVuQ29kZSBTREsgdG8gcHJvdmlkZSBzZXNzaW9uIG1hbmFnZW1lbnRcbiAqIGFuZCBlcnJvciBoYW5kbGluZyBmb3IgcmFscGggcnVubmVyLlxuICovXG5leHBvcnQgY2xhc3MgT3BlbkNvZGVDbGllbnQge1xuICAgIHByaXZhdGUgY2xpZW50OiBPcGVuY29kZUNsaWVudDtcbiAgICBwcml2YXRlIHRpbWVvdXQ6IG51bWJlcjtcbiAgICBwcml2YXRlIHJldHJ5QXR0ZW1wdHM6IG51bWJlcjtcbiAgICBwcml2YXRlIGFjdGl2ZVNlc3Npb25zOiBNYXA8c3RyaW5nLCBTZXNzaW9uPjtcbiAgICBwcml2YXRlIHByb21wdFRpbWVvdXQ6IG51bWJlcjtcbiAgICBwcml2YXRlIGRpcmVjdG9yeTogc3RyaW5nID0gcHJvY2Vzcy5jd2QoKTtcbiAgICBwcml2YXRlIHNlcnZlcjogeyB1cmw6IHN0cmluZzsgY2xvc2U6ICgpID0+IHZvaWQgfSB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgc2VydmVyU3RhcnR1cFRpbWVvdXQ6IG51bWJlcjtcblxuICAgIC8qKlxuICAgICAqIFByaXZhdGUgY29uc3RydWN0b3IgLSB1c2Ugc3RhdGljIGNyZWF0ZSgpIGZhY3RvcnkgbWV0aG9kIGluc3RlYWRcbiAgICAgKi9cbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKFxuICAgICAgICBjbGllbnQ6IE9wZW5jb2RlQ2xpZW50LFxuICAgICAgICBzZXJ2ZXI6IHsgdXJsOiBzdHJpbmc7IGNsb3NlOiAoKSA9PiB2b2lkIH0gfCBudWxsLFxuICAgICAgICBjb25maWc6IENsaWVudENvbmZpZyA9IHt9LFxuICAgICkge1xuICAgICAgICB0aGlzLmNsaWVudCA9IGNsaWVudDtcbiAgICAgICAgdGhpcy5zZXJ2ZXIgPSBzZXJ2ZXI7XG4gICAgICAgIHRoaXMudGltZW91dCA9IGNvbmZpZy50aW1lb3V0IHx8IDMwMDAwO1xuICAgICAgICB0aGlzLnJldHJ5QXR0ZW1wdHMgPSBjb25maWcucmV0cnlBdHRlbXB0cyB8fCAzO1xuXG4gICAgICAgIGNvbnN0IGVudlByb21wdFRpbWVvdXQgPSBOdW1iZXIucGFyc2VJbnQoXG4gICAgICAgICAgICBwcm9jZXNzLmVudi5PUEVOQ09ERV9QUk9NUFRfVElNRU9VVF9NUyA/PyBcIlwiLFxuICAgICAgICAgICAgMTAsXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IHJlc29sdmVkUHJvbXB0VGltZW91dCA9IE51bWJlci5pc0Zpbml0ZShlbnZQcm9tcHRUaW1lb3V0KVxuICAgICAgICAgICAgPyBlbnZQcm9tcHRUaW1lb3V0XG4gICAgICAgICAgICA6IHVuZGVmaW5lZDtcblxuICAgICAgICAvLyBGb3Igc3RyZWFtaW5nLCB0aGlzIGFjdHMgYXMgYW4gaWRsZSB0aW1lb3V0IChyZXNldCBvbiBzdHJlYW1lZCBldmVudHMpXG4gICAgICAgIHRoaXMucHJvbXB0VGltZW91dCA9XG4gICAgICAgICAgICBjb25maWcucHJvbXB0VGltZW91dCA/PyByZXNvbHZlZFByb21wdFRpbWVvdXQgPz8gMTIwMDAwOyAvLyAxMjAgc2Vjb25kcyBkZWZhdWx0XG5cbiAgICAgICAgdGhpcy5kaXJlY3RvcnkgPVxuICAgICAgICAgICAgY29uZmlnLmRpcmVjdG9yeSB8fCBwcm9jZXNzLmVudi5PUEVOQ09ERV9ESVJFQ1RPUlkgfHwgcHJvY2Vzcy5jd2QoKTtcblxuICAgICAgICB0aGlzLnNlcnZlclN0YXJ0dXBUaW1lb3V0ID0gY29uZmlnLnNlcnZlclN0YXJ0dXBUaW1lb3V0IHx8IDEwMDAwOyAvLyAxMCBzZWNvbmRzIGRlZmF1bHRcbiAgICAgICAgdGhpcy5hY3RpdmVTZXNzaW9ucyA9IG5ldyBNYXAoKTtcblxuICAgICAgICBsb2cuZGVidWcoXCJPcGVuQ29kZUNsaWVudCBpbml0aWFsaXplZFwiLCB7XG4gICAgICAgICAgICBoYXNPd25TZXJ2ZXI6ICEhdGhpcy5zZXJ2ZXIsXG4gICAgICAgICAgICB0aW1lb3V0OiB0aGlzLnRpbWVvdXQsXG4gICAgICAgICAgICBzZXJ2ZXJTdGFydHVwVGltZW91dDogdGhpcy5zZXJ2ZXJTdGFydHVwVGltZW91dCxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IGFuIGF2YWlsYWJsZSBwb3J0IGZvciBPcGVuQ29kZSBzZXJ2ZXJcbiAgICAgKlxuICAgICAqIElNUE9SVEFOVDogQWx3YXlzIGF2b2lkIHBvcnQgNDA5NiB0byBwcmV2ZW50IGNvbmZsaWN0cyB3aXRoIHVzZXIncyBleGlzdGluZyBzZXJ2ZXJcbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBhc3luYyBnZXRBdmFpbGFibGVQb3J0KCk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBDaGVjayBpZiBkZWZhdWx0IHBvcnQgaXMgaW4gdXNlIGFuZCBsb2cgYWNjb3JkaW5nbHlcbiAgICAgICAgICAgIGNvbnN0IGRlZmF1bHRQb3J0ID0gNDA5NjtcbiAgICAgICAgICAgIGNvbnN0IGlzRGVmYXVsdEF2YWlsYWJsZSA9XG4gICAgICAgICAgICAgICAgYXdhaXQgT3BlbkNvZGVDbGllbnQuaXNQb3J0QXZhaWxhYmxlKGRlZmF1bHRQb3J0KTtcblxuICAgICAgICAgICAgaWYgKCFpc0RlZmF1bHRBdmFpbGFibGUpIHtcbiAgICAgICAgICAgICAgICBsb2cuaW5mbyhcbiAgICAgICAgICAgICAgICAgICAgXCJFeGlzdGluZyBzZXJ2ZXIgZGV0ZWN0ZWQgb24gcG9ydCA0MDk2OyBzcGF3bmluZyBpc29sYXRlZCBzZXJ2ZXIgb24gZHluYW1pYyBwb3J0XCIsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbG9nLmRlYnVnKFxuICAgICAgICAgICAgICAgICAgICBcIkRlZmF1bHQgcG9ydCA0MDk2IGlzIGF2YWlsYWJsZSBidXQgYXZvaWRpbmcgaXQgZm9yIGlzb2xhdGlvblwiLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEFsd2F5cyB1c2UgZHluYW1pYyBwb3J0IHRvIGF2b2lkIGNvbmZsaWN0cyB3aXRoIHVzZXIncyBleGlzdGluZyBzZXJ2ZXJcbiAgICAgICAgICAgIGNvbnN0IGR5bmFtaWNQb3J0ID0gYXdhaXQgT3BlbkNvZGVDbGllbnQuZmluZEF2YWlsYWJsZVBvcnQoKTtcbiAgICAgICAgICAgIGxvZy5pbmZvKFxuICAgICAgICAgICAgICAgIGBTcGF3bmluZyBpc29sYXRlZCBzZXJ2ZXIgb24gZHluYW1pYyBwb3J0OiAke2R5bmFtaWNQb3J0fWAsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgcmV0dXJuIGR5bmFtaWNQb3J0O1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNc2cgPVxuICAgICAgICAgICAgICAgIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgICAgIGxvZy5lcnJvcihcIkZhaWxlZCB0byBzZWxlY3QgT3BlbkNvZGUgc2VydmVyIHBvcnRcIiwge1xuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvck1zZyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgIGBGYWlsZWQgdG8gc2VsZWN0IE9wZW5Db2RlIHNlcnZlciBwb3J0OiAke2Vycm9yTXNnfWAsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgYSBzcGVjaWZpYyBwb3J0IGlzIGF2YWlsYWJsZVxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIGFzeW5jIGlzUG9ydEF2YWlsYWJsZShwb3J0OiBudW1iZXIpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzZXJ2ZXIgPSBjcmVhdGVTZXJ2ZXIoKTtcblxuICAgICAgICAgICAgc2VydmVyLmxpc3Rlbihwb3J0LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgc2VydmVyLm9uY2UoXCJjbG9zZVwiLCAoKSA9PiByZXNvbHZlKHRydWUpKTtcbiAgICAgICAgICAgICAgICBzZXJ2ZXIuY2xvc2UoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBzZXJ2ZXIub24oXCJlcnJvclwiLCAoKSA9PiByZXNvbHZlKGZhbHNlKSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZpbmQgYW4gYXZhaWxhYmxlIHBvcnQgZHluYW1pY2FsbHlcbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBhc3luYyBmaW5kQXZhaWxhYmxlUG9ydCgpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc2VydmVyID0gY3JlYXRlU2VydmVyKCk7XG5cbiAgICAgICAgICAgIHNlcnZlci5saXN0ZW4oMCwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGFkZHJlc3MgPSBzZXJ2ZXIuYWRkcmVzcygpO1xuICAgICAgICAgICAgICAgIGlmIChhZGRyZXNzICYmIHR5cGVvZiBhZGRyZXNzID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlcnZlci5vbmNlKFwiY2xvc2VcIiwgKCkgPT4gcmVzb2x2ZShhZGRyZXNzLnBvcnQpKTtcbiAgICAgICAgICAgICAgICAgICAgc2VydmVyLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihcIkZhaWxlZCB0byBnZXQgc2VydmVyIGFkZHJlc3NcIikpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBzZXJ2ZXIub24oXCJlcnJvclwiLCByZWplY3QpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTdGF0aWMgZmFjdG9yeSBtZXRob2QgdG8gY3JlYXRlIGFuIE9wZW5Db2RlQ2xpZW50XG4gICAgICpcbiAgICAgKiBDcmVhdGVzIGEgbmV3IGNsaWVudCB3aXRoIGVpdGhlcjpcbiAgICAgKiAxLiBBIGZyZXNoIE9wZW5Db2RlIHNlcnZlciAoZGVmYXVsdCBiZWhhdmlvcilcbiAgICAgKiAyLiBBbiBleGlzdGluZyBzZXJ2ZXIgVVJMIChpZiBleGlzdGluZ1NlcnZlclVybCBpcyBwcm92aWRlZClcbiAgICAgKiAzLiBBIGN1c3RvbSBjbGllbnQgaW5zdGFuY2UgKGZvciB0ZXN0aW5nKVxuICAgICAqXG4gICAgICogTm90ZTogU3Bhd25lZCBPcGVuQ29kZSBzZXJ2ZXJzIHdpbGwgdXNlIHRvIGNhbGxpbmcgZGlyZWN0b3J5IGJ5IGRlZmF1bHQgKHByb2Nlc3MuY3dkKCkpXG4gICAgICogVXNlIE9QRU5DT0RFX1VSTCB0byBjb25uZWN0IHRvIGEgZGlmZmVyZW50IE9wZW5Db2RlIGluc3RhbmNlXG4gICAgICovXG4gICAgc3RhdGljIGFzeW5jIGNyZWF0ZShjb25maWc6IENsaWVudENvbmZpZyA9IHt9KTogUHJvbWlzZTxPcGVuQ29kZUNsaWVudD4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gSWYgY3VzdG9tIGNsaWVudCBwcm92aWRlZCAoZm9yIHRlc3RpbmcpLCB1c2UgaXQgZGlyZWN0bHlcbiAgICAgICAgICAgIGlmIChjb25maWcuY2xpZW50KSB7XG4gICAgICAgICAgICAgICAgbG9nLmluZm8oXCJDcmVhdGluZyBPcGVuQ29kZUNsaWVudCB3aXRoIGN1c3RvbSBjbGllbnQgaW5zdGFuY2VcIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBPcGVuQ29kZUNsaWVudChjb25maWcuY2xpZW50LCBudWxsLCBjb25maWcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBJZiBleGlzdGluZyBzZXJ2ZXIgVVJMIHByb3ZpZGVkLCBjb25uZWN0IHRvIGl0XG4gICAgICAgICAgICBpZiAoY29uZmlnLmV4aXN0aW5nU2VydmVyVXJsKSB7XG4gICAgICAgICAgICAgICAgbG9nLmluZm8oXCJDb25uZWN0aW5nIHRvIGV4aXN0aW5nIE9wZW5Db2RlIHNlcnZlclwiLCB7XG4gICAgICAgICAgICAgICAgICAgIHVybDogY29uZmlnLmV4aXN0aW5nU2VydmVyVXJsLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNsaWVudCA9IGNyZWF0ZU9wZW5jb2RlQ2xpZW50KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2VVcmw6IGNvbmZpZy5leGlzdGluZ1NlcnZlclVybCxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gVmVyaWZ5IGNvbm5lY3Rpb24gYnkgbWFraW5nIGEgdGVzdCByZXF1ZXN0XG4gICAgICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcIlZlcmlmeWluZyBjb25uZWN0aW9uIHRvIGV4aXN0aW5nIHNlcnZlci4uLlwiKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gTm90ZTogV2UnbGwgc2tpcCB2ZXJpZmljYXRpb24gZm9yIG5vdyB0byBhdm9pZCB1bm5lY2Vzc2FyeSBBUEkgY2FsbHNcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhlIGNvbm5lY3Rpb24gd2lsbCBiZSB2ZXJpZmllZCB3aGVuIGZpcnN0IHNlc3Npb24gaXMgY3JlYXRlZFxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgT3BlbkNvZGVDbGllbnQoY2xpZW50LCBudWxsLCBjb25maWcpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTXNnID1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgbG9nLmVycm9yKFwiRmFpbGVkIHRvIGNvbm5lY3QgdG8gZXhpc3Rpbmcgc2VydmVyXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogY29uZmlnLmV4aXN0aW5nU2VydmVyVXJsLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yTXNnLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBEZWZhdWx0OiBzcGF3biBhIG5ldyBPcGVuQ29kZSBzZXJ2ZXJcbiAgICAgICAgICAgIC8vIE5vdGU6IFNwYXduZWQgc2VydmVycyB3aWxsIHVzZSB0byBjYWxsaW5nIGRpcmVjdG9yeSBieSBkZWZhdWx0XG4gICAgICAgICAgICAvLyBVc2UgT1BFTkNPREVfVVJMIHRvIGNvbm5lY3QgdG8gYSBkaWZmZXJlbnQgT3BlbkNvZGUgaW5zdGFuY2VcbiAgICAgICAgICAgIGxvZy5pbmZvKFwiU3Bhd25pbmcgbmV3IE9wZW5Db2RlIHNlcnZlci4uLlwiLCB7XG4gICAgICAgICAgICAgICAgdGltZW91dDogY29uZmlnLnNlcnZlclN0YXJ0dXBUaW1lb3V0IHx8IDEwMDAwLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGNvbnN0IGF2YWlsYWJsZVBvcnQgPSBhd2FpdCBPcGVuQ29kZUNsaWVudC5nZXRBdmFpbGFibGVQb3J0KCk7XG5cbiAgICAgICAgICAgIGNvbnN0IHsgY2xpZW50LCBzZXJ2ZXIgfSA9IGF3YWl0IGNyZWF0ZU9wZW5jb2RlKHtcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiBjb25maWcuc2VydmVyU3RhcnR1cFRpbWVvdXQgfHwgMTAwMDAsXG4gICAgICAgICAgICAgICAgcG9ydDogYXZhaWxhYmxlUG9ydCxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBsb2cuaW5mbyhcIk9wZW5Db2RlIHNlcnZlciBzdGFydGVkIHN1Y2Nlc3NmdWxseVwiKTtcbiAgICAgICAgICAgIHJldHVybiBuZXcgT3BlbkNvZGVDbGllbnQoY2xpZW50LCBzZXJ2ZXIsIGNvbmZpZyk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1zZyA9XG4gICAgICAgICAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICAgICAgbG9nLmVycm9yKFwiRmFpbGVkIHRvIGNyZWF0ZSBPcGVuQ29kZUNsaWVudFwiLCB7IGVycm9yOiBlcnJvck1zZyB9KTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIGNyZWF0ZSBPcGVuQ29kZUNsaWVudDogJHtlcnJvck1zZ31gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBPcGVuQ29kZSBzZXNzaW9uIHdpdGggYSBnaXZlbiBwcm9tcHRcbiAgICAgKi9cbiAgICBhc3luYyBjcmVhdGVTZXNzaW9uKHByb21wdDogc3RyaW5nKTogUHJvbWlzZTxTZXNzaW9uPiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBDcmVhdGUgc2Vzc2lvbiB1c2luZyBTREtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuY2xpZW50LnNlc3Npb24uY3JlYXRlKHtcbiAgICAgICAgICAgICAgICBib2R5OiB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBcImFpLWVuZyByYWxwaCBzZXNzaW9uXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAoIXJlc3VsdC5kYXRhKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICAgICBgRmFpbGVkIHRvIGNyZWF0ZSBPcGVuQ29kZSBzZXNzaW9uOiAke0pTT04uc3RyaW5naWZ5KHJlc3VsdC5lcnJvcil9YCxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBzZGtTZXNzaW9uID0gcmVzdWx0LmRhdGE7XG5cbiAgICAgICAgICAgIC8vIERlZmVyIHRoZSBpbml0aWFsIHByb21wdCB1bnRpbCB0aGUgZmlyc3QgbWVzc2FnZSBpcyBzZW50LlxuICAgICAgICAgICAgLy8gVGhpcyBhdm9pZHMgYmxvY2tpbmcgc2Vzc2lvbiBjcmVhdGlvbiBhbmQgZW5hYmxlcyBzdHJlYW1pbmcgb3V0cHV0XG4gICAgICAgICAgICAvLyBldmVuIHdoZW4gdGhlIGluaXRpYWwgcHJvbXB0IGlzIGxhcmdlIG9yIHNsb3cgdG8gcHJvY2Vzcy5cbiAgICAgICAgICAgIGxldCBwZW5kaW5nSW5pdGlhbFByb21wdCA9IHByb21wdC50cmltKCk7XG4gICAgICAgICAgICBjb25zdCBidWlsZEZpcnN0TWVzc2FnZSA9IChtZXNzYWdlOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIXBlbmRpbmdJbml0aWFsUHJvbXB0KSByZXR1cm4gbWVzc2FnZTtcbiAgICAgICAgICAgICAgICBjb25zdCBjb21iaW5lZCA9IGAke3BlbmRpbmdJbml0aWFsUHJvbXB0fVxcblxcbi0tLVxcblxcbiR7bWVzc2FnZX1gO1xuICAgICAgICAgICAgICAgIHBlbmRpbmdJbml0aWFsUHJvbXB0ID0gXCJcIjtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29tYmluZWQ7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBJbml0aWFsaXplIHRvb2wgaW52b2NhdGlvbnMgdHJhY2tlclxuICAgICAgICAgICAgY29uc3QgdG9vbEludm9jYXRpb25zOiBTZXNzaW9uW1wiX3Rvb2xJbnZvY2F0aW9uc1wiXSA9IFtdO1xuXG4gICAgICAgICAgICAvLyBXcmFwIHdpdGggb3VyIHNlc3Npb24gaW50ZXJmYWNlXG4gICAgICAgICAgICBjb25zdCBzZXNzaW9uOiBTZXNzaW9uID0ge1xuICAgICAgICAgICAgICAgIGlkOiBzZGtTZXNzaW9uLmlkIHx8IHRoaXMuZ2VuZXJhdGVTZXNzaW9uSWQoKSxcbiAgICAgICAgICAgICAgICBfdG9vbEludm9jYXRpb25zOiB0b29sSW52b2NhdGlvbnMsXG4gICAgICAgICAgICAgICAgc2VuZE1lc3NhZ2U6IGFzeW5jIChtZXNzYWdlOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaGFuZGxlU2VuZE1lc3NhZ2UoXG4gICAgICAgICAgICAgICAgICAgICAgICBzZGtTZXNzaW9uLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgYnVpbGRGaXJzdE1lc3NhZ2UobWVzc2FnZSksXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzZW5kTWVzc2FnZVN0cmVhbTogYXN5bmMgKG1lc3NhZ2U6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5oYW5kbGVTZW5kTWVzc2FnZVN0cmVhbShcbiAgICAgICAgICAgICAgICAgICAgICAgIHNka1Nlc3Npb24uaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBidWlsZEZpcnN0TWVzc2FnZShtZXNzYWdlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xJbnZvY2F0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNsb3NlOiBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmhhbmRsZVNlc3Npb25DbG9zZShzZGtTZXNzaW9uLmlkKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8gU3RvcmUgYWN0aXZlIHNlc3Npb25cbiAgICAgICAgICAgIHRoaXMuYWN0aXZlU2Vzc2lvbnMuc2V0KHNlc3Npb24uaWQsIHNlc3Npb24pO1xuXG4gICAgICAgICAgICByZXR1cm4gc2Vzc2lvbjtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9XG4gICAgICAgICAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgIGBGYWlsZWQgdG8gY3JlYXRlIE9wZW5Db2RlIHNlc3Npb246ICR7ZXJyb3JNZXNzYWdlfWAsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2VuZCBhIG1lc3NhZ2UgdG8gYW4gZXhpc3Rpbmcgc2Vzc2lvblxuICAgICAqL1xuICAgIGFzeW5jIHNlbmRNZXNzYWdlKFxuICAgICAgICBzZXNzaW9uSWQ6IHN0cmluZyxcbiAgICAgICAgbWVzc2FnZTogc3RyaW5nLFxuICAgICk6IFByb21pc2U8TWVzc2FnZVJlc3BvbnNlPiB7XG4gICAgICAgIGNvbnN0IHNlc3Npb24gPSB0aGlzLmFjdGl2ZVNlc3Npb25zLmdldChzZXNzaW9uSWQpO1xuXG4gICAgICAgIGlmICghc2Vzc2lvbikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBTZXNzaW9uIG5vdCBmb3VuZDogJHtzZXNzaW9uSWR9YCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5oYW5kbGVTZW5kTWVzc2FnZShzZXNzaW9uSWQsIG1lc3NhZ2UpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENsb3NlIGFuIGFjdGl2ZSBzZXNzaW9uXG4gICAgICovXG4gICAgYXN5bmMgY2xvc2VTZXNzaW9uKHNlc3Npb25JZDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGNvbnN0IHNlc3Npb24gPSB0aGlzLmFjdGl2ZVNlc3Npb25zLmdldChzZXNzaW9uSWQpO1xuXG4gICAgICAgIGlmICghc2Vzc2lvbikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBTZXNzaW9uIG5vdCBmb3VuZDogJHtzZXNzaW9uSWR9YCk7XG4gICAgICAgIH1cblxuICAgICAgICBhd2FpdCB0aGlzLmhhbmRsZVNlc3Npb25DbG9zZShzZXNzaW9uSWQpO1xuICAgICAgICB0aGlzLmFjdGl2ZVNlc3Npb25zLmRlbGV0ZShzZXNzaW9uSWQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBhbGwgYWN0aXZlIHNlc3Npb24gSURzXG4gICAgICovXG4gICAgZ2V0QWN0aXZlU2Vzc2lvbnMoKTogc3RyaW5nW10ge1xuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLmFjdGl2ZVNlc3Npb25zLmtleXMoKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgYSBzZXNzaW9uIGlzIGFjdGl2ZVxuICAgICAqL1xuICAgIGlzU2Vzc2lvbkFjdGl2ZShzZXNzaW9uSWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5hY3RpdmVTZXNzaW9ucy5oYXMoc2Vzc2lvbklkKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDbG9zZSBhbGwgYWN0aXZlIHNlc3Npb25zXG4gICAgICovXG4gICAgYXN5bmMgY2xvc2VBbGxTZXNzaW9ucygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgY29uc3QgY2xvc2VQcm9taXNlcyA9IEFycmF5LmZyb20odGhpcy5hY3RpdmVTZXNzaW9ucy5rZXlzKCkpLm1hcChcbiAgICAgICAgICAgIChzZXNzaW9uSWQpID0+XG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVTZXNzaW9uQ2xvc2Uoc2Vzc2lvbklkKS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNc2cgPVxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICBsb2cud2FybihcIkVycm9yIGNsb3Npbmcgc2Vzc2lvblwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JNc2csXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICApO1xuXG4gICAgICAgIGF3YWl0IFByb21pc2UuYWxsKGNsb3NlUHJvbWlzZXMpO1xuICAgICAgICB0aGlzLmFjdGl2ZVNlc3Npb25zLmNsZWFyKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSGFuZGxlIHNlbmRpbmcgYSBtZXNzYWdlIHdpdGggc3RyZWFtaW5nIHN1cHBvcnRcbiAgICAgKi9cbiAgICBwcml2YXRlIGFzeW5jIGhhbmRsZVNlbmRNZXNzYWdlU3RyZWFtKFxuICAgICAgICBzZXNzaW9uSWQ6IHN0cmluZyxcbiAgICAgICAgbWVzc2FnZTogc3RyaW5nLFxuICAgICAgICB0b29sSW52b2NhdGlvbnM/OiBTZXNzaW9uW1wiX3Rvb2xJbnZvY2F0aW9uc1wiXSxcbiAgICApOiBQcm9taXNlPFN0cmVhbWluZ1Jlc3BvbnNlPiB7XG4gICAgICAgIGxldCBsYXN0RXJyb3I6IEVycm9yIHwgbnVsbCA9IG51bGw7XG5cbiAgICAgICAgY29uc3Qgc3VwcG9ydHNFdmVudFN0cmVhbWluZyA9XG4gICAgICAgICAgICB0eXBlb2YgKHRoaXMuY2xpZW50IGFzIGFueSk/LnNlc3Npb24/LnByb21wdEFzeW5jID09PSBcImZ1bmN0aW9uXCIgJiZcbiAgICAgICAgICAgIHR5cGVvZiAodGhpcy5jbGllbnQgYXMgYW55KT8uZXZlbnQ/LnN1YnNjcmliZSA9PT0gXCJmdW5jdGlvblwiO1xuXG4gICAgICAgIGZvciAobGV0IGF0dGVtcHQgPSAxOyBhdHRlbXB0IDw9IHRoaXMucmV0cnlBdHRlbXB0czsgYXR0ZW1wdCsrKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBhIFRyYW5zZm9ybVN0cmVhbSB0byBoYW5kbGUgdGhlIHN0cmVhbWluZyByZXNwb25zZVxuICAgICAgICAgICAgICAgIGNvbnN0IHN0cmVhbSA9IG5ldyBUcmFuc2Zvcm1TdHJlYW08VWludDhBcnJheSwgVWludDhBcnJheT4oKTtcbiAgICAgICAgICAgICAgICBjb25zdCB3cml0ZXIgPSBzdHJlYW0ud3JpdGFibGUuZ2V0V3JpdGVyKCk7XG5cbiAgICAgICAgICAgICAgICAvLyBUcmFjayBmaW5hbGl6YXRpb24gdG8gcHJldmVudCBkb3VibGUtY2xvc2UvYWJvcnRcbiAgICAgICAgICAgICAgICBsZXQgZmluYWxpemVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgY29uc3QgY2xvc2VPbmNlID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZmluYWxpemVkKSByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIGZpbmFsaXplZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB3cml0ZXIuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZ25vcmUgZXJyb3JzIGR1cmluZyBjbG9zZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBjb25zdCBhYm9ydE9uY2UgPSBhc3luYyAoZXJyOiB1bmtub3duKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmaW5hbGl6ZWQpIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgZmluYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHdyaXRlci5hYm9ydChlcnIpO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElnbm9yZSBlcnJvcnMgZHVyaW5nIGFib3J0XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgLy8gRmFsbGJhY2s6IGlmIHRoZSBjbGllbnQgZG9lc24ndCBzdXBwb3J0IHByb21wdF9hc3luYyArIFNTRSwga2VlcCB0aGVcbiAgICAgICAgICAgICAgICAvLyBsZWdhY3kgYmVoYXZpb3IgKGJ1ZmZlciB0aGVuIHNpbXVsYXRlIHN0cmVhbWluZykuXG4gICAgICAgICAgICAgICAgaWYgKCFzdXBwb3J0c0V2ZW50U3RyZWFtaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHByb21wdFByb21pc2UgPSB0aGlzLmNsaWVudC5zZXNzaW9uLnByb21wdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBib2R5OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUlEOiB0aGlzLmdlbmVyYXRlTWVzc2FnZUlkKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJ0ZXh0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBtZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgcXVlcnk6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3Rvcnk6IHRoaXMuZGlyZWN0b3J5LFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgfSBhcyBhbnkpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0cmVhbWluZ1Rhc2sgPSAoYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwcm9tcHRQcm9taXNlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXN1bHQuZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgSW52YWxpZCByZXNwb25zZSBmcm9tIE9wZW5Db2RlOiAke0pTT04uc3RyaW5naWZ5KHJlc3VsdC5lcnJvcil9YCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IHJlc3VsdC5kYXRhO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRleHRQYXJ0ID0gcmVzcG9uc2UucGFydHM/LmZpbmQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChwYXJ0OiBhbnkpID0+IHBhcnQudHlwZSA9PT0gXCJ0ZXh0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpbmFsQ29udGVudCA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICh0ZXh0UGFydCBhcyBhbnkpPy50ZXh0IHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiTm8gY29udGVudCByZWNlaXZlZFwiO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2ltdWxhdGUgc3RyZWFtaW5nIGJ5IHdyaXRpbmcgY2h1bmtzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2h1bmtzID0gdGhpcy5zcGxpdEludG9DaHVua3MoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbmFsQ29udGVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgMTAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlbmNvZGVyID0gbmV3IFRleHRFbmNvZGVyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBjaHVuayBvZiBjaHVua3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgd3JpdGVyLndyaXRlKGVuY29kZXIuZW5jb2RlKGNodW5rKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChyZXNvbHZlLCA1MCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgY2xvc2VPbmNlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgY29udGVudDogZmluYWxDb250ZW50IH07XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IGFib3J0T25jZShlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cmVhbTogc3RyZWFtLnJlYWRhYmxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGU6IHN0cmVhbWluZ1Rhc2ssXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gUmVhbCBzdHJlYW1pbmc6IHVzZSBwcm9tcHRfYXN5bmMgYW5kIGNvbnN1bWUgdGhlIGV2ZW50IFNTRSBzdHJlYW0uXG4gICAgICAgICAgICAgICAgY29uc3QgZW5jb2RlciA9IG5ldyBUZXh0RW5jb2RlcigpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGlkbGVUaW1lb3V0RXJyb3IgPSBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgIGBQcm9tcHQgaWRsZSB0aW1lb3V0IGFmdGVyICR7dGhpcy5wcm9tcHRUaW1lb3V0fW1zYCxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGNvbnN0IGhhcmRUaW1lb3V0RXJyb3IgPSBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgIGBQcm9tcHQgaGFyZCB0aW1lb3V0IGFmdGVyICR7dGhpcy5wcm9tcHRUaW1lb3V0ICogNX1tc2AsXG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgICAgICAgICAgICAgbGV0IGlkbGVUaW1lcjogUmV0dXJuVHlwZTx0eXBlb2Ygc2V0VGltZW91dD4gfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgbGV0IGhhcmRUaW1lcjogUmV0dXJuVHlwZTx0eXBlb2Ygc2V0VGltZW91dD4gfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgbGV0IGJ5dGVzV3JpdHRlbiA9IDA7XG4gICAgICAgICAgICAgICAgbGV0IGxhc3RQcm9ncmVzc1RpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgICAgIGxldCBpZGxlVGltZWRPdXQgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgIC8vIEhhcmQgdGltZW91dCAtIG5ldmVyIHJlc2V0c1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXJ0SGFyZFRpbWVyID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaGFyZFRpbWVyKSBjbGVhclRpbWVvdXQoaGFyZFRpbWVyKTtcbiAgICAgICAgICAgICAgICAgICAgaGFyZFRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2cud2FybihcIkhhcmQgdGltZW91dCByZWFjaGVkLCBhYm9ydGluZ1wiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXRNczogdGhpcy5wcm9tcHRUaW1lb3V0ICogNSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyLmFib3J0KGhhcmRUaW1lb3V0RXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWdub3JlXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sIHRoaXMucHJvbXB0VGltZW91dCAqIDUpOyAvLyA1eCBpZGxlIHRpbWVvdXQgYXMgaGFyZCBjZWlsaW5nXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIC8vIElkbGUgdGltZXIgLSByZXNldHMgb25seSBvbiByZWxldmFudCBwcm9ncmVzc1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc2V0SWRsZVRpbWVyID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaWRsZVRpbWVyKSBjbGVhclRpbWVvdXQoaWRsZVRpbWVyKTtcbiAgICAgICAgICAgICAgICAgICAgaWRsZVRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZGxlVGltZWRPdXQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nLndhcm4oXCJJZGxlIHRpbWVvdXQgcmVhY2hlZCwgYWJvcnRpbmdcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0TXM6IHRoaXMucHJvbXB0VGltZW91dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBieXRlc1dyaXR0ZW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdFByb2dyZXNzTXNBZ286IERhdGUubm93KCkgLSBsYXN0UHJvZ3Jlc3NUaW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXIuYWJvcnQoaWRsZVRpbWVvdXRFcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpZ25vcmVcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSwgdGhpcy5wcm9tcHRUaW1lb3V0KTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgY29uc3Qgc3RyZWFtaW5nVGFzayA9IChhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBhc3Npc3RhbnRNZXNzYWdlSWQ6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuXG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydEhhcmRUaW1lcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzZXRJZGxlVGltZXIoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXNlck1lc3NhZ2VJZCA9IHRoaXMuZ2VuZXJhdGVNZXNzYWdlSWQoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmRlYnVnKFwiU2VuZGluZyBwcm9tcHQgdG8gT3BlbkNvZGVcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlTGVuZ3RoOiBtZXNzYWdlLmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyTWVzc2FnZUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0ICh0aGlzLmNsaWVudCBhcyBhbnkpLnNlc3Npb24ucHJvbXB0QXN5bmMoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvZHk6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUlEOiB1c2VyTWVzc2FnZUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0czogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwidGV4dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IG1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlcnk6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0b3J5OiB0aGlzLmRpcmVjdG9yeSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpZ25hbDogY29udHJvbGxlci5zaWduYWwsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmRlYnVnKFwiU3Vic2NyaWJpbmcgdG8gZXZlbnRzXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0b3J5OiB0aGlzLmRpcmVjdG9yeSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBldmVudHNSZXN1bHQgPSBhd2FpdCAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jbGllbnQgYXMgYW55XG4gICAgICAgICAgICAgICAgICAgICAgICApLmV2ZW50LnN1YnNjcmliZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlcnk6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0b3J5OiB0aGlzLmRpcmVjdG9yeSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpZ25hbDogY29udHJvbGxlci5zaWduYWwsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjb250ZW50ID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBlbWl0dGVkVGV4dCA9IFwiXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZXZlbnRDb3VudCA9IDA7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcIlN0YXJ0aW5nIGV2ZW50IHN0cmVhbSBwcm9jZXNzaW5nXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIGF3YWl0IChjb25zdCBldmVudCBvZiBldmVudHNSZXN1bHQuc3RyZWFtIGFzIEFzeW5jR2VuZXJhdG9yPGFueT4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudENvdW50Kys7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBWZXJib3NlIGRlYnVnIGxvZ2dpbmcgZm9yIGFsbCBldmVudHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZGVidWcoXCJSZWNlaXZlZCBldmVudFwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRUeXBlOiBldmVudD8udHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRDb3VudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzUHJvcGVydGllczogISFldmVudD8ucHJvcGVydGllcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlckFib3J0ZWQ6IGNvbnRyb2xsZXIuc2lnbmFsLmFib3J0ZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29udHJvbGxlci5zaWduYWwuYWJvcnRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZGVidWcoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkNvbnRyb2xsZXIgYWJvcnRlZCwgYnJlYWtpbmcgZXZlbnQgbG9vcFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudENvdW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFldmVudCB8fCB0eXBlb2YgZXZlbnQgIT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmRlYnVnKFwiU2tpcHBpbmcgbm9uLW9iamVjdCBldmVudFwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudENvdW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09IFwibWVzc2FnZS51cGRhdGVkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5mbyA9IChldmVudCBhcyBhbnkpLnByb3BlcnRpZXM/LmluZm87XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmRlYnVnKFwiTWVzc2FnZSB1cGRhdGVkIGV2ZW50XCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50Q291bnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvUm9sZTogaW5mbz8ucm9sZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm9TZXNzaW9uSWQ6IGluZm8/LnNlc3Npb25JRCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm9QYXJlbnRJZDogaW5mbz8ucGFyZW50SUQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvSWQ6IGluZm8/LmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNSZWxldmFudFNlc3Npb246XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mbz8uc2Vzc2lvbklEID09PSBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0Fzc2lzdGFudDogaW5mbz8ucm9sZSA9PT0gXCJhc3Npc3RhbnRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzUmVwbHlUb1VzZXI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mbz8ucGFyZW50SUQgPT09IHVzZXJNZXNzYWdlSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFByaW1hcnkgaWRlbnRpZmljYXRpb246IGV4YWN0IG1hdGNoIG9uIHBhcmVudElEXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8/LnJvbGUgPT09IFwiYXNzaXN0YW50XCIgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8/LnNlc3Npb25JRCA9PT0gc2Vzc2lvbklkICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvPy5wYXJlbnRJRCA9PT0gdXNlck1lc3NhZ2VJZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2lzdGFudE1lc3NhZ2VJZCA9IGluZm8uaWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZGVidWcoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJJZGVudGlmaWVkIGFzc2lzdGFudCBtZXNzYWdlIChleGFjdCBwYXJlbnRJRCBtYXRjaClcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzaXN0YW50TWVzc2FnZUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZhbGxiYWNrOiBpZiB3ZSBoYXZlbid0IGlkZW50aWZpZWQgYW4gYXNzaXN0YW50IG1lc3NhZ2UgeWV0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhY2NlcHQgYXNzaXN0YW50IG1lc3NhZ2VzIGluIHRoZSBzYW1lIHNlc3Npb24gZXZlbiBpZiBwYXJlbnRJRCBkb2Vzbid0IG1hdGNoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaGFuZGxlcyBjYXNlcyB3aGVyZSBwYXJlbnRJRCBpcyB1bmRlZmluZWQgb3IgaGFzIGEgZGlmZmVyZW50IGZvcm1hdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICFhc3Npc3RhbnRNZXNzYWdlSWQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8/LnJvbGUgPT09IFwiYXNzaXN0YW50XCIgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8/LnNlc3Npb25JRCA9PT0gc2Vzc2lvbklkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmRlYnVnKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiSWRlbnRpZmllZCBhc3Npc3RhbnQgbWVzc2FnZSAoZmFsbGJhY2sgLSBubyBleGFjdCBwYXJlbnRJRCBtYXRjaClcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzaXN0YW50TWVzc2FnZUlkOiBpbmZvLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvUGFyZW50SWQ6IGluZm8/LnBhcmVudElELFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyTWVzc2FnZUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzaXN0YW50TWVzc2FnZUlkID0gaW5mby5pZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJlc2V0IGlkbGUgdGltZXIgb24gQU5ZIGFzc2lzdGFudCBtZXNzYWdlIGFjdGl2aXR5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgcHJldmVudHMgdGltZW91dHMgd2hlbiBjb3JyZWxhdGlvbiBpcyBhbWJpZ3VvdXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mbz8ucm9sZSA9PT0gXCJhc3Npc3RhbnRcIiAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mbz8uc2Vzc2lvbklEID09PSBzZXNzaW9uSWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0UHJvZ3Jlc3NUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc2V0SWRsZVRpbWVyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3Npc3RhbnRNZXNzYWdlSWQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8/LmlkID09PSBhc3Npc3RhbnRNZXNzYWdlSWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5mbz8uZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJOYW1lID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mby5lcnJvci5uYW1lIHx8IFwiT3BlbkNvZGVFcnJvclwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVyck1zZyA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8uZXJyb3IuZGF0YT8ubWVzc2FnZSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBKU09OLnN0cmluZ2lmeShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8uZXJyb3IuZGF0YSB8fCB7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQXNzaXN0YW50IGVycm9yIGluIG1lc3NhZ2VcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JOYW1lOiBlcnJOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJNc2csXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAke2Vyck5hbWV9OiAke2Vyck1zZ31gLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmZvPy50aW1lPy5jb21wbGV0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZGVidWcoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQXNzaXN0YW50IG1lc3NhZ2UgY29tcGxldGVkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2lzdGFudE1lc3NhZ2VJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlZEF0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8udGltZS5jb21wbGV0ZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChldmVudC50eXBlID09PSBcIm1lc3NhZ2UucGFydC51cGRhdGVkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gT25seSByZXNldCB0aW1lciBhbmQgdHJhY2sgcHJvZ3Jlc3MgZm9yIHJlbGV2YW50IHVwZGF0ZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFydCA9IChldmVudCBhcyBhbnkpLnByb3BlcnRpZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8ucGFydCBhcyBhbnk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmRlYnVnKFwiTWVzc2FnZSBwYXJ0IHVwZGF0ZWRcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRDb3VudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc1BhcnQ6ICEhcGFydCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRUeXBlOiBwYXJ0Py50eXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydFNlc3Npb25JZDogcGFydD8uc2Vzc2lvbklELFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydE1lc3NhZ2VJZDogcGFydD8ubWVzc2FnZUlELFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzaXN0YW50TWVzc2FnZUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNSZWxldmFudDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3Npc3RhbnRNZXNzYWdlSWQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0Py5zZXNzaW9uSUQgPT09IHNlc3Npb25JZCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnQ/Lm1lc3NhZ2VJRCA9PT0gYXNzaXN0YW50TWVzc2FnZUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWFzc2lzdGFudE1lc3NhZ2VJZCkgY29udGludWU7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSGFuZGxlIHRvb2wgcGFydHMgKGNhcHR1cmUgdG9vbCBpbnZvY2F0aW9ucylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnQ/LnR5cGUgPT09IFwidG9vbFwiICYmIHRvb2xJbnZvY2F0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdG9vbElkID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0LnRvb2xJZCB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnQuaWQgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgdG9vbC0ke2V2ZW50Q291bnR9YDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRvb2xOYW1lID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0LnRvb2xOYW1lIHx8IHBhcnQubmFtZSB8fCBcInVua25vd25cIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRvb2xJbnB1dCA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydC5pbnB1dCB8fCBwYXJ0LnBhcmFtZXRlcnMgfHwge307XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIHRoaXMgaXMgYSBuZXcgdG9vbCBjYWxsIG9yIGFuIHVwZGF0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXhpc3RpbmdUb29sSW5kZXggPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xJbnZvY2F0aW9ucy5maW5kSW5kZXgoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICh0KSA9PiB0LmlkID09PSB0b29sSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV4aXN0aW5nVG9vbEluZGV4ID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBVcGRhdGUgZXhpc3RpbmcgdG9vbCBpbnZvY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXhpc3RpbmcgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sSW52b2NhdGlvbnNbZXhpc3RpbmdUb29sSW5kZXhdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nLm91dHB1dCA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnQucmVzdWx0ID8/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnQub3V0cHV0ID8/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nLm91dHB1dDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleGlzdGluZy5zdGF0dXMgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0LnN0YXR1cyA9PT0gXCJlcnJvclwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IFwiZXJyb3JcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBcIm9rXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhpc3RpbmcuZXJyb3IgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0LmVycm9yID8/IGV4aXN0aW5nLmVycm9yO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nLmNvbXBsZXRlZEF0ID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydC5jb21wbGV0ZWRBdCA/PyBub3c7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZGVidWcoXCJUb29sIGludm9jYXRpb24gdXBkYXRlZFwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiBleGlzdGluZy5zdGF0dXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5ldyB0b29sIGludm9jYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0b29sSW52b2NhdGlvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHRvb2xJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogdG9vbE5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0OiB0b29sSW5wdXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dDogcGFydC5yZXN1bHQgPz8gcGFydC5vdXRwdXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnQuc3RhdHVzID09PSBcImVycm9yXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IChcImVycm9yXCIgYXMgY29uc3QpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAoXCJva1wiIGFzIGNvbnN0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IHBhcnQuZXJyb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0ZWRBdDogcGFydC5zdGFydGVkQXQgPz8gbm93LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZWRBdDogcGFydC5jb21wbGV0ZWRBdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xJbnZvY2F0aW9ucy5wdXNoKHRvb2xJbnZvY2F0aW9uKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcIlRvb2wgaW52b2NhdGlvbiBzdGFydGVkXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dDogSlNPTi5zdHJpbmdpZnkoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sSW5wdXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkuc2xpY2UoMCwgMjAwKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRG9uJ3Qgc2tpcCBub24tcmVsZXZhbnQgdG9vbCBwYXJ0cyAtIHdlIHdhbnQgdG8gY2FwdHVyZSBhbGwgdG9vbCBldmVudHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZvciB0aGUgYXNzaXN0YW50IG1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0LnNlc3Npb25JRCAhPT0gc2Vzc2lvbklkIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydC5tZXNzYWdlSUQgIT09IGFzc2lzdGFudE1lc3NhZ2VJZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU3RpbGwgdHJhY2sgaXQgYnV0IGRvbid0IHByb2Nlc3MgZm9yIG91dHB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBSZXNldCBpZGxlIHRpbWVyIG9uIHRvb2wgcHJvZ3Jlc3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0UHJvZ3Jlc3NUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNldElkbGVUaW1lcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcGFydCB8fCBwYXJ0LnR5cGUgIT09IFwidGV4dFwiKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnQuc2Vzc2lvbklEICE9PSBzZXNzaW9uSWQpIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFydC5tZXNzYWdlSUQgIT09IGFzc2lzdGFudE1lc3NhZ2VJZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJhd0RlbHRhID0gKGV2ZW50IGFzIGFueSkucHJvcGVydGllc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPy5kZWx0YTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgZGVsdGFUZXh0OiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUHJlZmVyIGRpZmZpbmcgYWdhaW5zdCB0aGUgZnVsbCBgcGFydC50ZXh0YCB3aGVuIHByZXNlbnQuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNvbWUgT3BlbkNvZGUgc2VydmVyIHZlcnNpb25zIGVtaXQgbXVsdGlwbGUgdGV4dCBwYXJ0cyBvciBzZW5kXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGBkZWx0YWAgYXMgdGhlICpmdWxsKiB0ZXh0LCB3aGljaCB3b3VsZCBkdXBsaWNhdGUgb3V0cHV0LlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHBhcnQudGV4dCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV4dCA9IHBhcnQudGV4dDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5leHQuc3RhcnRzV2l0aChlbWl0dGVkVGV4dCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWx0YVRleHQgPSBuZXh0LnNsaWNlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbWl0dGVkVGV4dC5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbWl0dGVkVGV4dCA9IG5leHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVtaXR0ZWRUZXh0LnN0YXJ0c1dpdGgobmV4dCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTdGFsZS9kdXBsaWNhdGUgdXBkYXRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsdGFUZXh0ID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmFsbGJhY2s6IHRyZWF0IGFzIGFkZGl0aXZlIGNodW5rXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsdGFUZXh0ID0gbmV4dDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbWl0dGVkVGV4dCArPSBuZXh0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiByYXdEZWx0YSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsdGFUZXh0ID0gcmF3RGVsdGE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbWl0dGVkVGV4dCArPSByYXdEZWx0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZGVsdGFUZXh0KSBjb250aW51ZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBVcGRhdGUgcHJvZ3Jlc3MgdHJhY2tpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdFByb2dyZXNzVGltZSA9IERhdGUubm93KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ5dGVzV3JpdHRlbiArPSBkZWx0YVRleHQubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNldElkbGVUaW1lcigpOyAvLyBPbmx5IHJlc2V0IG9uIGFjdHVhbCBjb250ZW50IHByb2dyZXNzXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmRlYnVnKFwiV3JpdGluZyBkZWx0YSB0byBzdHJlYW1cIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsdGFMZW5ndGg6IGRlbHRhVGV4dC5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3RhbEJ5dGVzV3JpdHRlbjogYnl0ZXNXcml0dGVuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudExlbmd0aDogY29udGVudC5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQgKz0gZGVsdGFUZXh0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB3cml0ZXIud3JpdGUoZW5jb2Rlci5lbmNvZGUoZGVsdGFUZXh0KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2cuZGVidWcoXCJFdmVudCBzdHJlYW0gZW5kZWRcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudENvdW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsQnl0ZXNXcml0dGVuOiBieXRlc1dyaXR0ZW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudExlbmd0aDogY29udGVudC5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlckFib3J0ZWQ6IGNvbnRyb2xsZXIuc2lnbmFsLmFib3J0ZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWRsZVRpbWVkT3V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2lzdGFudE1lc3NhZ2VJZEZvdW5kOiAhIWFzc2lzdGFudE1lc3NhZ2VJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBjbG9zZU9uY2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogY29udGVudCB8fCBcIk5vIGNvbnRlbnQgcmVjZWl2ZWRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaWFnbm9zdGljczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBieXRlc1dyaXR0ZW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnRMZW5ndGg6IGNvbnRlbnQubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZGxlVGltZWRPdXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2lzdGFudE1lc3NhZ2VJZEZvdW5kOiAhIWFzc2lzdGFudE1lc3NhZ2VJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRDb3VudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5lcnJvcihcIlN0cmVhbWluZyB0YXNrIGVycm9yXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yIGluc3RhbmNlb2YgRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gZXJyb3IubWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBTdHJpbmcoZXJyb3IpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXJBYm9ydGVkOiBjb250cm9sbGVyLnNpZ25hbC5hYm9ydGVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ5dGVzV3JpdHRlbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZGxlVGltZWRPdXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzaXN0YW50TWVzc2FnZUlkRm91bmQ6ICEhYXNzaXN0YW50TWVzc2FnZUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiB3ZSBhYm9ydGVkLCBub3JtYWxpemUgdG8gb3VyIHRpbWVvdXQgZXJyb3IgQU5EIGVuc3VyZSBzdHJlYW0gaXMgZmluYWxpemVkXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29udHJvbGxlci5zaWduYWwuYWJvcnRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IGFib3J0T25jZShpZGxlVGltZW91dEVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBpZGxlVGltZW91dEVycm9yO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgYWJvcnRPbmNlKGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICAgICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlkbGVUaW1lcikgY2xlYXJUaW1lb3V0KGlkbGVUaW1lcik7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaGFyZFRpbWVyKSBjbGVhclRpbWVvdXQoaGFyZFRpbWVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFjb250cm9sbGVyLnNpZ25hbC5hYm9ydGVkKSBjb250cm9sbGVyLmFib3J0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpZ25vcmVcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pKCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBzdHJlYW06IHN0cmVhbS5yZWFkYWJsZSxcbiAgICAgICAgICAgICAgICAgICAgY29tcGxldGU6IHN0cmVhbWluZ1Rhc2ssXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgbGFzdEVycm9yID1cbiAgICAgICAgICAgICAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yIDogbmV3IEVycm9yKFN0cmluZyhlcnJvcikpO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgaXNSYXRlTGltaXQgPSB0aGlzLmlzUmF0ZUxpbWl0RXJyb3IobGFzdEVycm9yKTtcblxuICAgICAgICAgICAgICAgIGlmIChhdHRlbXB0ID09PSB0aGlzLnJldHJ5QXR0ZW1wdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgZGVsYXkgPSB0aGlzLmdldEJhY2tvZmZEZWxheShhdHRlbXB0LCBpc1JhdGVMaW1pdCk7XG5cbiAgICAgICAgICAgICAgICBsb2cud2FybihcIk9wZW5Db2RlIGF0dGVtcHQgZmFpbGVkOyByZXRyeWluZ1wiLCB7XG4gICAgICAgICAgICAgICAgICAgIGF0dGVtcHQsXG4gICAgICAgICAgICAgICAgICAgIHJldHJ5QXR0ZW1wdHM6IHRoaXMucmV0cnlBdHRlbXB0cyxcbiAgICAgICAgICAgICAgICAgICAgZGVsYXlNczogZGVsYXksXG4gICAgICAgICAgICAgICAgICAgIGlzUmF0ZUxpbWl0LFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogbGFzdEVycm9yLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gc2V0VGltZW91dChyZXNvbHZlLCBkZWxheSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYEZhaWxlZCB0byBzdHJlYW0gbWVzc2FnZSBhZnRlciAke3RoaXMucmV0cnlBdHRlbXB0c30gYXR0ZW1wdHM6ICR7bGFzdEVycm9yPy5tZXNzYWdlIHx8IFwiVW5rbm93biBlcnJvclwifWAsXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU3BsaXQgdGV4dCBpbnRvIGNodW5rcyBmb3Igc3RyZWFtaW5nIHNpbXVsYXRpb25cbiAgICAgKi9cbiAgICBwcml2YXRlIHNwbGl0SW50b0NodW5rcyh0ZXh0OiBzdHJpbmcsIGNodW5rU2l6ZTogbnVtYmVyKTogc3RyaW5nW10ge1xuICAgICAgICBjb25zdCBjaHVua3M6IHN0cmluZ1tdID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGV4dC5sZW5ndGg7IGkgKz0gY2h1bmtTaXplKSB7XG4gICAgICAgICAgICBjaHVua3MucHVzaCh0ZXh0LnNsaWNlKGksIGkgKyBjaHVua1NpemUpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2h1bmtzLmxlbmd0aCA+IDAgPyBjaHVua3MgOiBbdGV4dF07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSGFuZGxlIHNlbmRpbmcgYSBtZXNzYWdlIHdpdGggZXJyb3IgaGFuZGxpbmcgYW5kIHJldHJpZXNcbiAgICAgKi9cbiAgICBwcml2YXRlIGFzeW5jIGhhbmRsZVNlbmRNZXNzYWdlKFxuICAgICAgICBzZXNzaW9uSWQ6IHN0cmluZyxcbiAgICAgICAgbWVzc2FnZTogc3RyaW5nLFxuICAgICk6IFByb21pc2U8TWVzc2FnZVJlc3BvbnNlPiB7XG4gICAgICAgIGxldCBsYXN0RXJyb3I6IEVycm9yIHwgbnVsbCA9IG51bGw7XG5cbiAgICAgICAgZm9yIChsZXQgYXR0ZW1wdCA9IDE7IGF0dGVtcHQgPD0gdGhpcy5yZXRyeUF0dGVtcHRzOyBhdHRlbXB0KyspIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGltZW91dEVycm9yID0gbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICAgICBgUHJvbXB0IHRpbWVvdXQgYWZ0ZXIgJHt0aGlzLnByb21wdFRpbWVvdXR9bXNgLFxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBjb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyLmFib3J0KHRpbWVvdXRFcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWdub3JlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCB0aGlzLnByb21wdFRpbWVvdXQpO1xuXG4gICAgICAgICAgICAgICAgbGV0IHJlc3VsdDogYW55O1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IGF3YWl0IHRoaXMuY2xpZW50LnNlc3Npb24ucHJvbXB0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvZHk6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlSUQ6IHRoaXMuZ2VuZXJhdGVNZXNzYWdlSWQoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0czogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcInRleHRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IG1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBxdWVyeToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdG9yeTogdGhpcy5kaXJlY3RvcnksXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgc2lnbmFsOiBjb250cm9sbGVyLnNpZ25hbCxcbiAgICAgICAgICAgICAgICAgICAgfSBhcyBhbnkpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb250cm9sbGVyLnNpZ25hbC5hYm9ydGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyB0aW1lb3V0RXJyb3I7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoIXJlc3VsdC5kYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAgIGBJbnZhbGlkIHJlc3BvbnNlIGZyb20gT3BlbkNvZGU6ICR7SlNPTi5zdHJpbmdpZnkocmVzdWx0LmVycm9yKX1gLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIEV4dHJhY3QgY29udGVudCBmcm9tIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSByZXN1bHQuZGF0YTtcblxuICAgICAgICAgICAgICAgIC8vIEZpbmQgdGV4dCBjb250ZW50IGZyb20gcmVzcG9uc2UgcGFydHNcbiAgICAgICAgICAgICAgICBjb25zdCB0ZXh0UGFydCA9IHJlc3BvbnNlLnBhcnRzPy5maW5kKFxuICAgICAgICAgICAgICAgICAgICAocGFydDogYW55KSA9PiBwYXJ0LnR5cGUgPT09IFwidGV4dFwiLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgY29udGVudDogdGV4dFBhcnQ/LnRleHQgfHwgXCJObyBjb250ZW50IHJlY2VpdmVkXCIgfTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgbGFzdEVycm9yID1cbiAgICAgICAgICAgICAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yIDogbmV3IEVycm9yKFN0cmluZyhlcnJvcikpO1xuXG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdGhpcyBpcyBhIHJhdGUgbGltaXQgZXJyb3JcbiAgICAgICAgICAgICAgICBjb25zdCBpc1JhdGVMaW1pdCA9IHRoaXMuaXNSYXRlTGltaXRFcnJvcihsYXN0RXJyb3IpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGF0dGVtcHQgPT09IHRoaXMucmV0cnlBdHRlbXB0cykge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBXYWl0IGJlZm9yZSByZXRyeWluZyB3aXRoIGV4cG9uZW50aWFsIGJhY2tvZmZcbiAgICAgICAgICAgICAgICBjb25zdCBkZWxheSA9IHRoaXMuZ2V0QmFja29mZkRlbGF5KGF0dGVtcHQsIGlzUmF0ZUxpbWl0KTtcblxuICAgICAgICAgICAgICAgIGxvZy53YXJuKFwiT3BlbkNvZGUgYXR0ZW1wdCBmYWlsZWQ7IHJldHJ5aW5nXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgYXR0ZW1wdCxcbiAgICAgICAgICAgICAgICAgICAgcmV0cnlBdHRlbXB0czogdGhpcy5yZXRyeUF0dGVtcHRzLFxuICAgICAgICAgICAgICAgICAgICBkZWxheU1zOiBkZWxheSxcbiAgICAgICAgICAgICAgICAgICAgaXNSYXRlTGltaXQsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBsYXN0RXJyb3IubWVzc2FnZSxcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIGRlbGF5KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgRmFpbGVkIHRvIHNlbmQgbWVzc2FnZSBhZnRlciAke3RoaXMucmV0cnlBdHRlbXB0c30gYXR0ZW1wdHM6ICR7bGFzdEVycm9yPy5tZXNzYWdlIHx8IFwiVW5rbm93biBlcnJvclwifWAsXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgZXJyb3IgaXMgYSByYXRlIGxpbWl0IGVycm9yXG4gICAgICovXG4gICAgcHJpdmF0ZSBpc1JhdGVMaW1pdEVycm9yKGVycm9yOiBFcnJvcik6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBlcnIgPSBlcnJvciBhcyBhbnk7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBlcnIuc3RhdHVzID09PSA0MjkgfHxcbiAgICAgICAgICAgIC9yYXRlIGxpbWl0fHF1b3RhfG92ZXJsb2FkZWR8Y2FwYWNpdHkvaS50ZXN0KGVycm9yLm1lc3NhZ2UpXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlIGJhY2tvZmYgZGVsYXkgd2l0aCBqaXR0ZXJcbiAgICAgKi9cbiAgICBwcml2YXRlIGdldEJhY2tvZmZEZWxheShhdHRlbXB0OiBudW1iZXIsIGlzUmF0ZUxpbWl0OiBib29sZWFuKTogbnVtYmVyIHtcbiAgICAgICAgY29uc3QgYmFzZSA9IGlzUmF0ZUxpbWl0ID8gNTAwMCA6IDEwMDA7IC8vIDVzIGZvciByYXRlIGxpbWl0LCAxcyBvdGhlcndpc2VcbiAgICAgICAgY29uc3QgZXhwb25lbnRpYWwgPSBiYXNlICogMiAqKiAoYXR0ZW1wdCAtIDEpO1xuICAgICAgICBjb25zdCBqaXR0ZXIgPSBNYXRoLnJhbmRvbSgpICogMTAwMDsgLy8gQWRkIHVwIHRvIDFzIGppdHRlclxuICAgICAgICByZXR1cm4gTWF0aC5taW4oZXhwb25lbnRpYWwgKyBqaXR0ZXIsIDYwMDAwKTsgLy8gbWF4IDYwc1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEhhbmRsZSBzZXNzaW9uIGNsb3N1cmUgd2l0aCBlcnJvciBoYW5kbGluZ1xuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgaGFuZGxlU2Vzc2lvbkNsb3NlKHNlc3Npb25JZDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBOb3RlOiBPcGVuQ29kZSBTREsgbWlnaHQgbm90IGhhdmUgYW4gZXhwbGljaXQgY2xvc2UgbWV0aG9kXG4gICAgICAgICAgICAvLyBGb3Igbm93LCB3ZSdsbCBqdXN0IHJlbW92ZSBmcm9tIG91ciBhY3RpdmUgc2Vzc2lvbnNcbiAgICAgICAgICAgIC8vIEluIGEgcmVhbCBpbXBsZW1lbnRhdGlvbiwgd2UnZCBjYWxsIFNESydzIGRlbGV0ZSBtZXRob2QgaWYgYXZhaWxhYmxlXG4gICAgICAgICAgICBsb2cuZGVidWcoXCJTZXNzaW9uIGNsb3NlZFwiLCB7IHNlc3Npb25JZCB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9XG4gICAgICAgICAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICAgICAgbG9nLndhcm4oXCJGYWlsZWQgdG8gY2xvc2Ugc2Vzc2lvblwiLCB7XG4gICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlIGEgdW5pcXVlIHNlc3Npb24gSUQgaWYgU0RLIGRvZXNuJ3QgcHJvdmlkZSBvbmVcbiAgICAgKi9cbiAgICBwcml2YXRlIGdlbmVyYXRlU2Vzc2lvbklkKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBgc2Vzc2lvbi0ke0RhdGUubm93KCl9LSR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDkpfWA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2VuZXJhdGUgYSBwcm9wZXJseSBmb3JtYXR0ZWQgbWVzc2FnZSBJRCB3aXRoIG1zZ18gcHJlZml4XG4gICAgICogRm9ybWF0OiBtc2dfPHRpbWVzdGFtcD5fPHJhbmRvbT5cbiAgICAgKi9cbiAgICBwcml2YXRlIGdlbmVyYXRlTWVzc2FnZUlkKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBgbXNnXyR7RGF0ZS5ub3coKX1fJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoMiwgOCl9YDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDbGVhbnVwIG1ldGhvZCB0byBjbG9zZSBhbGwgc2Vzc2lvbnMgYW5kIHNlcnZlclxuICAgICAqL1xuICAgIGFzeW5jIGNsZWFudXAoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsb2cuZGVidWcoXCJTdGFydGluZyBjbGVhbnVwLi4uXCIsIHtcbiAgICAgICAgICAgICAgICBhY3RpdmVTZXNzaW9uczogdGhpcy5hY3RpdmVTZXNzaW9ucy5zaXplLFxuICAgICAgICAgICAgICAgIGhhc1NlcnZlcjogISF0aGlzLnNlcnZlcixcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBDbG9zZSBhbGwgYWN0aXZlIHNlc3Npb25zXG4gICAgICAgICAgICBhd2FpdCB0aGlzLmNsb3NlQWxsU2Vzc2lvbnMoKTtcblxuICAgICAgICAgICAgLy8gU3RvcCB0aGUgT3BlbkNvZGUgc2VydmVyIGlmIHdlIHN0YXJ0ZWQgb25lXG4gICAgICAgICAgICBpZiAodGhpcy5zZXJ2ZXIpIHtcbiAgICAgICAgICAgICAgICBsb2cuaW5mbyhcIkNsb3Npbmcgc3Bhd25lZCBPcGVuQ29kZSBzZXJ2ZXJcIik7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXJ2ZXIuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXJ2ZXIgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICBsb2cuaW5mbyhcIk9wZW5Db2RlIHNlcnZlciBjbG9zZWQgc3VjY2Vzc2Z1bGx5XCIpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTXNnID1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgbG9nLmVycm9yKFwiRXJyb3IgY2xvc2luZyBPcGVuQ29kZSBzZXJ2ZXJcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yTXNnLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcbiAgICAgICAgICAgICAgICAgICAgXCJObyBzcGF3bmVkIHNlcnZlciB0byBjbG9zZSAoY29ubmVjdGVkIHRvIGV4aXN0aW5nIHNlcnZlcilcIixcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsb2cuaW5mbyhcIkNsZWFudXAgY29tcGxldGVcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1zZyA9XG4gICAgICAgICAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICAgICAgbG9nLmVycm9yKFwiRXJyb3IgZHVyaW5nIE9wZW5Db2RlIGNsaWVudCBjbGVhbnVwXCIsIHtcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JNc2csXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsCiAgICAiLy8gVGhpcyBmaWxlIGlzIGF1dG8tZ2VuZXJhdGVkIGJ5IEBoZXktYXBpL29wZW5hcGktdHNcbmV4cG9ydCBjb25zdCBjcmVhdGVTc2VDbGllbnQgPSAoeyBvblNzZUVycm9yLCBvblNzZUV2ZW50LCByZXNwb25zZVRyYW5zZm9ybWVyLCByZXNwb25zZVZhbGlkYXRvciwgc3NlRGVmYXVsdFJldHJ5RGVsYXksIHNzZU1heFJldHJ5QXR0ZW1wdHMsIHNzZU1heFJldHJ5RGVsYXksIHNzZVNsZWVwRm4sIHVybCwgLi4ub3B0aW9ucyB9KSA9PiB7XG4gICAgbGV0IGxhc3RFdmVudElkO1xuICAgIGNvbnN0IHNsZWVwID0gc3NlU2xlZXBGbiA/PyAoKG1zKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gc2V0VGltZW91dChyZXNvbHZlLCBtcykpKTtcbiAgICBjb25zdCBjcmVhdGVTdHJlYW0gPSBhc3luYyBmdW5jdGlvbiogKCkge1xuICAgICAgICBsZXQgcmV0cnlEZWxheSA9IHNzZURlZmF1bHRSZXRyeURlbGF5ID8/IDMwMDA7XG4gICAgICAgIGxldCBhdHRlbXB0ID0gMDtcbiAgICAgICAgY29uc3Qgc2lnbmFsID0gb3B0aW9ucy5zaWduYWwgPz8gbmV3IEFib3J0Q29udHJvbGxlcigpLnNpZ25hbDtcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgIGlmIChzaWduYWwuYWJvcnRlZClcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGF0dGVtcHQrKztcbiAgICAgICAgICAgIGNvbnN0IGhlYWRlcnMgPSBvcHRpb25zLmhlYWRlcnMgaW5zdGFuY2VvZiBIZWFkZXJzXG4gICAgICAgICAgICAgICAgPyBvcHRpb25zLmhlYWRlcnNcbiAgICAgICAgICAgICAgICA6IG5ldyBIZWFkZXJzKG9wdGlvbnMuaGVhZGVycyk7XG4gICAgICAgICAgICBpZiAobGFzdEV2ZW50SWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGhlYWRlcnMuc2V0KFwiTGFzdC1FdmVudC1JRFwiLCBsYXN0RXZlbnRJZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCB7IC4uLm9wdGlvbnMsIGhlYWRlcnMsIHNpZ25hbCB9KTtcbiAgICAgICAgICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFNTRSBmYWlsZWQ6ICR7cmVzcG9uc2Uuc3RhdHVzfSAke3Jlc3BvbnNlLnN0YXR1c1RleHR9YCk7XG4gICAgICAgICAgICAgICAgaWYgKCFyZXNwb25zZS5ib2R5KVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBib2R5IGluIFNTRSByZXNwb25zZVwiKTtcbiAgICAgICAgICAgICAgICBjb25zdCByZWFkZXIgPSByZXNwb25zZS5ib2R5LnBpcGVUaHJvdWdoKG5ldyBUZXh0RGVjb2RlclN0cmVhbSgpKS5nZXRSZWFkZXIoKTtcbiAgICAgICAgICAgICAgICBsZXQgYnVmZmVyID0gXCJcIjtcbiAgICAgICAgICAgICAgICBjb25zdCBhYm9ydEhhbmRsZXIgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWFkZXIuY2FuY2VsKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2F0Y2gge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbm9vcFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBzaWduYWwuYWRkRXZlbnRMaXN0ZW5lcihcImFib3J0XCIsIGFib3J0SGFuZGxlcik7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHsgZG9uZSwgdmFsdWUgfSA9IGF3YWl0IHJlYWRlci5yZWFkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZG9uZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZmZlciArPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNodW5rcyA9IGJ1ZmZlci5zcGxpdChcIlxcblxcblwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZmZlciA9IGNodW5rcy5wb3AoKSA/PyBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBjaHVuayBvZiBjaHVua3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsaW5lcyA9IGNodW5rLnNwbGl0KFwiXFxuXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRhdGFMaW5lcyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBldmVudE5hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBsaW5lIG9mIGxpbmVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgoXCJkYXRhOlwiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YUxpbmVzLnB1c2gobGluZS5yZXBsYWNlKC9eZGF0YTpcXHMqLywgXCJcIikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGxpbmUuc3RhcnRzV2l0aChcImV2ZW50OlwiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lID0gbGluZS5yZXBsYWNlKC9eZXZlbnQ6XFxzKi8sIFwiXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGxpbmUuc3RhcnRzV2l0aChcImlkOlwiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdEV2ZW50SWQgPSBsaW5lLnJlcGxhY2UoL15pZDpcXHMqLywgXCJcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobGluZS5zdGFydHNXaXRoKFwicmV0cnk6XCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJzZWQgPSBOdW1iZXIucGFyc2VJbnQobGluZS5yZXBsYWNlKC9ecmV0cnk6XFxzKi8sIFwiXCIpLCAxMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIU51bWJlci5pc05hTihwYXJzZWQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0cnlEZWxheSA9IHBhcnNlZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGFyc2VkSnNvbiA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRhTGluZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJhd0RhdGEgPSBkYXRhTGluZXMuam9pbihcIlxcblwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEgPSBKU09OLnBhcnNlKHJhd0RhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VkSnNvbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0Y2gge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YSA9IHJhd0RhdGE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnNlZEpzb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlVmFsaWRhdG9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCByZXNwb25zZVZhbGlkYXRvcihkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2VUcmFuc2Zvcm1lcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YSA9IGF3YWl0IHJlc3BvbnNlVHJhbnNmb3JtZXIoZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Tc2VFdmVudD8uKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQ6IGV2ZW50TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGxhc3RFdmVudElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXRyeTogcmV0cnlEZWxheSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YUxpbmVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5aWVsZCBkYXRhO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgc2lnbmFsLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJhYm9ydFwiLCBhYm9ydEhhbmRsZXIpO1xuICAgICAgICAgICAgICAgICAgICByZWFkZXIucmVsZWFzZUxvY2soKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7IC8vIGV4aXQgbG9vcCBvbiBub3JtYWwgY29tcGxldGlvblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgLy8gY29ubmVjdGlvbiBmYWlsZWQgb3IgYWJvcnRlZDsgcmV0cnkgYWZ0ZXIgZGVsYXlcbiAgICAgICAgICAgICAgICBvblNzZUVycm9yPy4oZXJyb3IpO1xuICAgICAgICAgICAgICAgIGlmIChzc2VNYXhSZXRyeUF0dGVtcHRzICE9PSB1bmRlZmluZWQgJiYgYXR0ZW1wdCA+PSBzc2VNYXhSZXRyeUF0dGVtcHRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrOyAvLyBzdG9wIGFmdGVyIGZpcmluZyBlcnJvclxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBleHBvbmVudGlhbCBiYWNrb2ZmOiBkb3VibGUgcmV0cnkgZWFjaCBhdHRlbXB0LCBjYXAgYXQgMzBzXG4gICAgICAgICAgICAgICAgY29uc3QgYmFja29mZiA9IE1hdGgubWluKHJldHJ5RGVsYXkgKiAyICoqIChhdHRlbXB0IC0gMSksIHNzZU1heFJldHJ5RGVsYXkgPz8gMzAwMDApO1xuICAgICAgICAgICAgICAgIGF3YWl0IHNsZWVwKGJhY2tvZmYpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICBjb25zdCBzdHJlYW0gPSBjcmVhdGVTdHJlYW0oKTtcbiAgICByZXR1cm4geyBzdHJlYW0gfTtcbn07XG4iLAogICAgIi8vIFRoaXMgZmlsZSBpcyBhdXRvLWdlbmVyYXRlZCBieSBAaGV5LWFwaS9vcGVuYXBpLXRzXG5leHBvcnQgY29uc3QgZ2V0QXV0aFRva2VuID0gYXN5bmMgKGF1dGgsIGNhbGxiYWNrKSA9PiB7XG4gICAgY29uc3QgdG9rZW4gPSB0eXBlb2YgY2FsbGJhY2sgPT09IFwiZnVuY3Rpb25cIiA/IGF3YWl0IGNhbGxiYWNrKGF1dGgpIDogY2FsbGJhY2s7XG4gICAgaWYgKCF0b2tlbikge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChhdXRoLnNjaGVtZSA9PT0gXCJiZWFyZXJcIikge1xuICAgICAgICByZXR1cm4gYEJlYXJlciAke3Rva2VufWA7XG4gICAgfVxuICAgIGlmIChhdXRoLnNjaGVtZSA9PT0gXCJiYXNpY1wiKSB7XG4gICAgICAgIHJldHVybiBgQmFzaWMgJHtidG9hKHRva2VuKX1gO1xuICAgIH1cbiAgICByZXR1cm4gdG9rZW47XG59O1xuIiwKICAgICIvLyBUaGlzIGZpbGUgaXMgYXV0by1nZW5lcmF0ZWQgYnkgQGhleS1hcGkvb3BlbmFwaS10c1xuY29uc3Qgc2VyaWFsaXplRm9ybURhdGFQYWlyID0gKGRhdGEsIGtleSwgdmFsdWUpID0+IHtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiIHx8IHZhbHVlIGluc3RhbmNlb2YgQmxvYikge1xuICAgICAgICBkYXRhLmFwcGVuZChrZXksIHZhbHVlKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodmFsdWUgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgICAgIGRhdGEuYXBwZW5kKGtleSwgdmFsdWUudG9JU09TdHJpbmcoKSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBkYXRhLmFwcGVuZChrZXksIEpTT04uc3RyaW5naWZ5KHZhbHVlKSk7XG4gICAgfVxufTtcbmNvbnN0IHNlcmlhbGl6ZVVybFNlYXJjaFBhcmFtc1BhaXIgPSAoZGF0YSwga2V5LCB2YWx1ZSkgPT4ge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgZGF0YS5hcHBlbmQoa2V5LCB2YWx1ZSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBkYXRhLmFwcGVuZChrZXksIEpTT04uc3RyaW5naWZ5KHZhbHVlKSk7XG4gICAgfVxufTtcbmV4cG9ydCBjb25zdCBmb3JtRGF0YUJvZHlTZXJpYWxpemVyID0ge1xuICAgIGJvZHlTZXJpYWxpemVyOiAoYm9keSkgPT4ge1xuICAgICAgICBjb25zdCBkYXRhID0gbmV3IEZvcm1EYXRhKCk7XG4gICAgICAgIE9iamVjdC5lbnRyaWVzKGJvZHkpLmZvckVhY2goKFtrZXksIHZhbHVlXSkgPT4ge1xuICAgICAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZS5mb3JFYWNoKCh2KSA9PiBzZXJpYWxpemVGb3JtRGF0YVBhaXIoZGF0YSwga2V5LCB2KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZXJpYWxpemVGb3JtRGF0YVBhaXIoZGF0YSwga2V5LCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9LFxufTtcbmV4cG9ydCBjb25zdCBqc29uQm9keVNlcmlhbGl6ZXIgPSB7XG4gICAgYm9keVNlcmlhbGl6ZXI6IChib2R5KSA9PiBKU09OLnN0cmluZ2lmeShib2R5LCAoX2tleSwgdmFsdWUpID0+ICh0eXBlb2YgdmFsdWUgPT09IFwiYmlnaW50XCIgPyB2YWx1ZS50b1N0cmluZygpIDogdmFsdWUpKSxcbn07XG5leHBvcnQgY29uc3QgdXJsU2VhcmNoUGFyYW1zQm9keVNlcmlhbGl6ZXIgPSB7XG4gICAgYm9keVNlcmlhbGl6ZXI6IChib2R5KSA9PiB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKCk7XG4gICAgICAgIE9iamVjdC5lbnRyaWVzKGJvZHkpLmZvckVhY2goKFtrZXksIHZhbHVlXSkgPT4ge1xuICAgICAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZS5mb3JFYWNoKCh2KSA9PiBzZXJpYWxpemVVcmxTZWFyY2hQYXJhbXNQYWlyKGRhdGEsIGtleSwgdikpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VyaWFsaXplVXJsU2VhcmNoUGFyYW1zUGFpcihkYXRhLCBrZXksIHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBkYXRhLnRvU3RyaW5nKCk7XG4gICAgfSxcbn07XG4iLAogICAgIi8vIFRoaXMgZmlsZSBpcyBhdXRvLWdlbmVyYXRlZCBieSBAaGV5LWFwaS9vcGVuYXBpLXRzXG5leHBvcnQgY29uc3Qgc2VwYXJhdG9yQXJyYXlFeHBsb2RlID0gKHN0eWxlKSA9PiB7XG4gICAgc3dpdGNoIChzdHlsZSkge1xuICAgICAgICBjYXNlIFwibGFiZWxcIjpcbiAgICAgICAgICAgIHJldHVybiBcIi5cIjtcbiAgICAgICAgY2FzZSBcIm1hdHJpeFwiOlxuICAgICAgICAgICAgcmV0dXJuIFwiO1wiO1xuICAgICAgICBjYXNlIFwic2ltcGxlXCI6XG4gICAgICAgICAgICByZXR1cm4gXCIsXCI7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gXCImXCI7XG4gICAgfVxufTtcbmV4cG9ydCBjb25zdCBzZXBhcmF0b3JBcnJheU5vRXhwbG9kZSA9IChzdHlsZSkgPT4ge1xuICAgIHN3aXRjaCAoc3R5bGUpIHtcbiAgICAgICAgY2FzZSBcImZvcm1cIjpcbiAgICAgICAgICAgIHJldHVybiBcIixcIjtcbiAgICAgICAgY2FzZSBcInBpcGVEZWxpbWl0ZWRcIjpcbiAgICAgICAgICAgIHJldHVybiBcInxcIjtcbiAgICAgICAgY2FzZSBcInNwYWNlRGVsaW1pdGVkXCI6XG4gICAgICAgICAgICByZXR1cm4gXCIlMjBcIjtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiBcIixcIjtcbiAgICB9XG59O1xuZXhwb3J0IGNvbnN0IHNlcGFyYXRvck9iamVjdEV4cGxvZGUgPSAoc3R5bGUpID0+IHtcbiAgICBzd2l0Y2ggKHN0eWxlKSB7XG4gICAgICAgIGNhc2UgXCJsYWJlbFwiOlxuICAgICAgICAgICAgcmV0dXJuIFwiLlwiO1xuICAgICAgICBjYXNlIFwibWF0cml4XCI6XG4gICAgICAgICAgICByZXR1cm4gXCI7XCI7XG4gICAgICAgIGNhc2UgXCJzaW1wbGVcIjpcbiAgICAgICAgICAgIHJldHVybiBcIixcIjtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiBcIiZcIjtcbiAgICB9XG59O1xuZXhwb3J0IGNvbnN0IHNlcmlhbGl6ZUFycmF5UGFyYW0gPSAoeyBhbGxvd1Jlc2VydmVkLCBleHBsb2RlLCBuYW1lLCBzdHlsZSwgdmFsdWUsIH0pID0+IHtcbiAgICBpZiAoIWV4cGxvZGUpIHtcbiAgICAgICAgY29uc3Qgam9pbmVkVmFsdWVzID0gKGFsbG93UmVzZXJ2ZWQgPyB2YWx1ZSA6IHZhbHVlLm1hcCgodikgPT4gZW5jb2RlVVJJQ29tcG9uZW50KHYpKSkuam9pbihzZXBhcmF0b3JBcnJheU5vRXhwbG9kZShzdHlsZSkpO1xuICAgICAgICBzd2l0Y2ggKHN0eWxlKSB7XG4gICAgICAgICAgICBjYXNlIFwibGFiZWxcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gYC4ke2pvaW5lZFZhbHVlc31gO1xuICAgICAgICAgICAgY2FzZSBcIm1hdHJpeFwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBgOyR7bmFtZX09JHtqb2luZWRWYWx1ZXN9YDtcbiAgICAgICAgICAgIGNhc2UgXCJzaW1wbGVcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gam9pbmVkVmFsdWVzO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7bmFtZX09JHtqb2luZWRWYWx1ZXN9YDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBzZXBhcmF0b3IgPSBzZXBhcmF0b3JBcnJheUV4cGxvZGUoc3R5bGUpO1xuICAgIGNvbnN0IGpvaW5lZFZhbHVlcyA9IHZhbHVlXG4gICAgICAgIC5tYXAoKHYpID0+IHtcbiAgICAgICAgaWYgKHN0eWxlID09PSBcImxhYmVsXCIgfHwgc3R5bGUgPT09IFwic2ltcGxlXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBhbGxvd1Jlc2VydmVkID8gdiA6IGVuY29kZVVSSUNvbXBvbmVudCh2KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2VyaWFsaXplUHJpbWl0aXZlUGFyYW0oe1xuICAgICAgICAgICAgYWxsb3dSZXNlcnZlZCxcbiAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICB2YWx1ZTogdixcbiAgICAgICAgfSk7XG4gICAgfSlcbiAgICAgICAgLmpvaW4oc2VwYXJhdG9yKTtcbiAgICByZXR1cm4gc3R5bGUgPT09IFwibGFiZWxcIiB8fCBzdHlsZSA9PT0gXCJtYXRyaXhcIiA/IHNlcGFyYXRvciArIGpvaW5lZFZhbHVlcyA6IGpvaW5lZFZhbHVlcztcbn07XG5leHBvcnQgY29uc3Qgc2VyaWFsaXplUHJpbWl0aXZlUGFyYW0gPSAoeyBhbGxvd1Jlc2VydmVkLCBuYW1lLCB2YWx1ZSB9KSA9PiB7XG4gICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRGVlcGx5LW5lc3RlZCBhcnJheXMvb2JqZWN0cyBhcmVu4oCZdCBzdXBwb3J0ZWQuIFByb3ZpZGUgeW91ciBvd24gYHF1ZXJ5U2VyaWFsaXplcigpYCB0byBoYW5kbGUgdGhlc2UuXCIpO1xuICAgIH1cbiAgICByZXR1cm4gYCR7bmFtZX09JHthbGxvd1Jlc2VydmVkID8gdmFsdWUgOiBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpfWA7XG59O1xuZXhwb3J0IGNvbnN0IHNlcmlhbGl6ZU9iamVjdFBhcmFtID0gKHsgYWxsb3dSZXNlcnZlZCwgZXhwbG9kZSwgbmFtZSwgc3R5bGUsIHZhbHVlLCB2YWx1ZU9ubHksIH0pID0+IHtcbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZU9ubHkgPyB2YWx1ZS50b0lTT1N0cmluZygpIDogYCR7bmFtZX09JHt2YWx1ZS50b0lTT1N0cmluZygpfWA7XG4gICAgfVxuICAgIGlmIChzdHlsZSAhPT0gXCJkZWVwT2JqZWN0XCIgJiYgIWV4cGxvZGUpIHtcbiAgICAgICAgbGV0IHZhbHVlcyA9IFtdO1xuICAgICAgICBPYmplY3QuZW50cmllcyh2YWx1ZSkuZm9yRWFjaCgoW2tleSwgdl0pID0+IHtcbiAgICAgICAgICAgIHZhbHVlcyA9IFsuLi52YWx1ZXMsIGtleSwgYWxsb3dSZXNlcnZlZCA/IHYgOiBlbmNvZGVVUklDb21wb25lbnQodildO1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc3Qgam9pbmVkVmFsdWVzID0gdmFsdWVzLmpvaW4oXCIsXCIpO1xuICAgICAgICBzd2l0Y2ggKHN0eWxlKSB7XG4gICAgICAgICAgICBjYXNlIFwiZm9ybVwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBgJHtuYW1lfT0ke2pvaW5lZFZhbHVlc31gO1xuICAgICAgICAgICAgY2FzZSBcImxhYmVsXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAuJHtqb2luZWRWYWx1ZXN9YDtcbiAgICAgICAgICAgIGNhc2UgXCJtYXRyaXhcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gYDske25hbWV9PSR7am9pbmVkVmFsdWVzfWA7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiBqb2luZWRWYWx1ZXM7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3Qgc2VwYXJhdG9yID0gc2VwYXJhdG9yT2JqZWN0RXhwbG9kZShzdHlsZSk7XG4gICAgY29uc3Qgam9pbmVkVmFsdWVzID0gT2JqZWN0LmVudHJpZXModmFsdWUpXG4gICAgICAgIC5tYXAoKFtrZXksIHZdKSA9PiBzZXJpYWxpemVQcmltaXRpdmVQYXJhbSh7XG4gICAgICAgIGFsbG93UmVzZXJ2ZWQsXG4gICAgICAgIG5hbWU6IHN0eWxlID09PSBcImRlZXBPYmplY3RcIiA/IGAke25hbWV9WyR7a2V5fV1gIDoga2V5LFxuICAgICAgICB2YWx1ZTogdixcbiAgICB9KSlcbiAgICAgICAgLmpvaW4oc2VwYXJhdG9yKTtcbiAgICByZXR1cm4gc3R5bGUgPT09IFwibGFiZWxcIiB8fCBzdHlsZSA9PT0gXCJtYXRyaXhcIiA/IHNlcGFyYXRvciArIGpvaW5lZFZhbHVlcyA6IGpvaW5lZFZhbHVlcztcbn07XG4iLAogICAgIi8vIFRoaXMgZmlsZSBpcyBhdXRvLWdlbmVyYXRlZCBieSBAaGV5LWFwaS9vcGVuYXBpLXRzXG5pbXBvcnQgeyBzZXJpYWxpemVBcnJheVBhcmFtLCBzZXJpYWxpemVPYmplY3RQYXJhbSwgc2VyaWFsaXplUHJpbWl0aXZlUGFyYW0sIH0gZnJvbSBcIi4vcGF0aFNlcmlhbGl6ZXIuZ2VuLmpzXCI7XG5leHBvcnQgY29uc3QgUEFUSF9QQVJBTV9SRSA9IC9cXHtbXnt9XStcXH0vZztcbmV4cG9ydCBjb25zdCBkZWZhdWx0UGF0aFNlcmlhbGl6ZXIgPSAoeyBwYXRoLCB1cmw6IF91cmwgfSkgPT4ge1xuICAgIGxldCB1cmwgPSBfdXJsO1xuICAgIGNvbnN0IG1hdGNoZXMgPSBfdXJsLm1hdGNoKFBBVEhfUEFSQU1fUkUpO1xuICAgIGlmIChtYXRjaGVzKSB7XG4gICAgICAgIGZvciAoY29uc3QgbWF0Y2ggb2YgbWF0Y2hlcykge1xuICAgICAgICAgICAgbGV0IGV4cGxvZGUgPSBmYWxzZTtcbiAgICAgICAgICAgIGxldCBuYW1lID0gbWF0Y2guc3Vic3RyaW5nKDEsIG1hdGNoLmxlbmd0aCAtIDEpO1xuICAgICAgICAgICAgbGV0IHN0eWxlID0gXCJzaW1wbGVcIjtcbiAgICAgICAgICAgIGlmIChuYW1lLmVuZHNXaXRoKFwiKlwiKSkge1xuICAgICAgICAgICAgICAgIGV4cGxvZGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cmluZygwLCBuYW1lLmxlbmd0aCAtIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG5hbWUuc3RhcnRzV2l0aChcIi5cIikpIHtcbiAgICAgICAgICAgICAgICBuYW1lID0gbmFtZS5zdWJzdHJpbmcoMSk7XG4gICAgICAgICAgICAgICAgc3R5bGUgPSBcImxhYmVsXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChuYW1lLnN0YXJ0c1dpdGgoXCI7XCIpKSB7XG4gICAgICAgICAgICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyaW5nKDEpO1xuICAgICAgICAgICAgICAgIHN0eWxlID0gXCJtYXRyaXhcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gcGF0aFtuYW1lXTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICB1cmwgPSB1cmwucmVwbGFjZShtYXRjaCwgc2VyaWFsaXplQXJyYXlQYXJhbSh7IGV4cGxvZGUsIG5hbWUsIHN0eWxlLCB2YWx1ZSB9KSk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICAgICAgdXJsID0gdXJsLnJlcGxhY2UobWF0Y2gsIHNlcmlhbGl6ZU9iamVjdFBhcmFtKHtcbiAgICAgICAgICAgICAgICAgICAgZXhwbG9kZSxcbiAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgc3R5bGUsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVPbmx5OiB0cnVlLFxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzdHlsZSA9PT0gXCJtYXRyaXhcIikge1xuICAgICAgICAgICAgICAgIHVybCA9IHVybC5yZXBsYWNlKG1hdGNoLCBgOyR7c2VyaWFsaXplUHJpbWl0aXZlUGFyYW0oe1xuICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICAgICAgfSl9YCk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCByZXBsYWNlVmFsdWUgPSBlbmNvZGVVUklDb21wb25lbnQoc3R5bGUgPT09IFwibGFiZWxcIiA/IGAuJHt2YWx1ZX1gIDogdmFsdWUpO1xuICAgICAgICAgICAgdXJsID0gdXJsLnJlcGxhY2UobWF0Y2gsIHJlcGxhY2VWYWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHVybDtcbn07XG5leHBvcnQgY29uc3QgZ2V0VXJsID0gKHsgYmFzZVVybCwgcGF0aCwgcXVlcnksIHF1ZXJ5U2VyaWFsaXplciwgdXJsOiBfdXJsLCB9KSA9PiB7XG4gICAgY29uc3QgcGF0aFVybCA9IF91cmwuc3RhcnRzV2l0aChcIi9cIikgPyBfdXJsIDogYC8ke191cmx9YDtcbiAgICBsZXQgdXJsID0gKGJhc2VVcmwgPz8gXCJcIikgKyBwYXRoVXJsO1xuICAgIGlmIChwYXRoKSB7XG4gICAgICAgIHVybCA9IGRlZmF1bHRQYXRoU2VyaWFsaXplcih7IHBhdGgsIHVybCB9KTtcbiAgICB9XG4gICAgbGV0IHNlYXJjaCA9IHF1ZXJ5ID8gcXVlcnlTZXJpYWxpemVyKHF1ZXJ5KSA6IFwiXCI7XG4gICAgaWYgKHNlYXJjaC5zdGFydHNXaXRoKFwiP1wiKSkge1xuICAgICAgICBzZWFyY2ggPSBzZWFyY2guc3Vic3RyaW5nKDEpO1xuICAgIH1cbiAgICBpZiAoc2VhcmNoKSB7XG4gICAgICAgIHVybCArPSBgPyR7c2VhcmNofWA7XG4gICAgfVxuICAgIHJldHVybiB1cmw7XG59O1xuIiwKICAgICIvLyBUaGlzIGZpbGUgaXMgYXV0by1nZW5lcmF0ZWQgYnkgQGhleS1hcGkvb3BlbmFwaS10c1xuaW1wb3J0IHsgZ2V0QXV0aFRva2VuIH0gZnJvbSBcIi4uL2NvcmUvYXV0aC5nZW4uanNcIjtcbmltcG9ydCB7IGpzb25Cb2R5U2VyaWFsaXplciB9IGZyb20gXCIuLi9jb3JlL2JvZHlTZXJpYWxpemVyLmdlbi5qc1wiO1xuaW1wb3J0IHsgc2VyaWFsaXplQXJyYXlQYXJhbSwgc2VyaWFsaXplT2JqZWN0UGFyYW0sIHNlcmlhbGl6ZVByaW1pdGl2ZVBhcmFtIH0gZnJvbSBcIi4uL2NvcmUvcGF0aFNlcmlhbGl6ZXIuZ2VuLmpzXCI7XG5pbXBvcnQgeyBnZXRVcmwgfSBmcm9tIFwiLi4vY29yZS91dGlscy5nZW4uanNcIjtcbmV4cG9ydCBjb25zdCBjcmVhdGVRdWVyeVNlcmlhbGl6ZXIgPSAoeyBhbGxvd1Jlc2VydmVkLCBhcnJheSwgb2JqZWN0IH0gPSB7fSkgPT4ge1xuICAgIGNvbnN0IHF1ZXJ5U2VyaWFsaXplciA9IChxdWVyeVBhcmFtcykgPT4ge1xuICAgICAgICBjb25zdCBzZWFyY2ggPSBbXTtcbiAgICAgICAgaWYgKHF1ZXJ5UGFyYW1zICYmIHR5cGVvZiBxdWVyeVBhcmFtcyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgZm9yIChjb25zdCBuYW1lIGluIHF1ZXJ5UGFyYW1zKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBxdWVyeVBhcmFtc1tuYW1lXTtcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlcmlhbGl6ZWRBcnJheSA9IHNlcmlhbGl6ZUFycmF5UGFyYW0oe1xuICAgICAgICAgICAgICAgICAgICAgICAgYWxsb3dSZXNlcnZlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cGxvZGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IFwiZm9ybVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5hcnJheSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzZXJpYWxpemVkQXJyYXkpXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWFyY2gucHVzaChzZXJpYWxpemVkQXJyYXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VyaWFsaXplZE9iamVjdCA9IHNlcmlhbGl6ZU9iamVjdFBhcmFtKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsbG93UmVzZXJ2ZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBleHBsb2RlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiBcImRlZXBPYmplY3RcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLm9iamVjdCxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzZXJpYWxpemVkT2JqZWN0KVxuICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoLnB1c2goc2VyaWFsaXplZE9iamVjdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzZXJpYWxpemVkUHJpbWl0aXZlID0gc2VyaWFsaXplUHJpbWl0aXZlUGFyYW0oe1xuICAgICAgICAgICAgICAgICAgICAgICAgYWxsb3dSZXNlcnZlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2VyaWFsaXplZFByaW1pdGl2ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaC5wdXNoKHNlcmlhbGl6ZWRQcmltaXRpdmUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2VhcmNoLmpvaW4oXCImXCIpO1xuICAgIH07XG4gICAgcmV0dXJuIHF1ZXJ5U2VyaWFsaXplcjtcbn07XG4vKipcbiAqIEluZmVycyBwYXJzZUFzIHZhbHVlIGZyb20gcHJvdmlkZWQgQ29udGVudC1UeXBlIGhlYWRlci5cbiAqL1xuZXhwb3J0IGNvbnN0IGdldFBhcnNlQXMgPSAoY29udGVudFR5cGUpID0+IHtcbiAgICBpZiAoIWNvbnRlbnRUeXBlKSB7XG4gICAgICAgIC8vIElmIG5vIENvbnRlbnQtVHlwZSBoZWFkZXIgaXMgcHJvdmlkZWQsIHRoZSBiZXN0IHdlIGNhbiBkbyBpcyByZXR1cm4gdGhlIHJhdyByZXNwb25zZSBib2R5LFxuICAgICAgICAvLyB3aGljaCBpcyBlZmZlY3RpdmVseSB0aGUgc2FtZSBhcyB0aGUgJ3N0cmVhbScgb3B0aW9uLlxuICAgICAgICByZXR1cm4gXCJzdHJlYW1cIjtcbiAgICB9XG4gICAgY29uc3QgY2xlYW5Db250ZW50ID0gY29udGVudFR5cGUuc3BsaXQoXCI7XCIpWzBdPy50cmltKCk7XG4gICAgaWYgKCFjbGVhbkNvbnRlbnQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoY2xlYW5Db250ZW50LnN0YXJ0c1dpdGgoXCJhcHBsaWNhdGlvbi9qc29uXCIpIHx8IGNsZWFuQ29udGVudC5lbmRzV2l0aChcIitqc29uXCIpKSB7XG4gICAgICAgIHJldHVybiBcImpzb25cIjtcbiAgICB9XG4gICAgaWYgKGNsZWFuQ29udGVudCA9PT0gXCJtdWx0aXBhcnQvZm9ybS1kYXRhXCIpIHtcbiAgICAgICAgcmV0dXJuIFwiZm9ybURhdGFcIjtcbiAgICB9XG4gICAgaWYgKFtcImFwcGxpY2F0aW9uL1wiLCBcImF1ZGlvL1wiLCBcImltYWdlL1wiLCBcInZpZGVvL1wiXS5zb21lKCh0eXBlKSA9PiBjbGVhbkNvbnRlbnQuc3RhcnRzV2l0aCh0eXBlKSkpIHtcbiAgICAgICAgcmV0dXJuIFwiYmxvYlwiO1xuICAgIH1cbiAgICBpZiAoY2xlYW5Db250ZW50LnN0YXJ0c1dpdGgoXCJ0ZXh0L1wiKSkge1xuICAgICAgICByZXR1cm4gXCJ0ZXh0XCI7XG4gICAgfVxuICAgIHJldHVybjtcbn07XG5jb25zdCBjaGVja0ZvckV4aXN0ZW5jZSA9IChvcHRpb25zLCBuYW1lKSA9PiB7XG4gICAgaWYgKCFuYW1lKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMuaGVhZGVycy5oYXMobmFtZSkgfHwgb3B0aW9ucy5xdWVyeT8uW25hbWVdIHx8IG9wdGlvbnMuaGVhZGVycy5nZXQoXCJDb29raWVcIik/LmluY2x1ZGVzKGAke25hbWV9PWApKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59O1xuZXhwb3J0IGNvbnN0IHNldEF1dGhQYXJhbXMgPSBhc3luYyAoeyBzZWN1cml0eSwgLi4ub3B0aW9ucyB9KSA9PiB7XG4gICAgZm9yIChjb25zdCBhdXRoIG9mIHNlY3VyaXR5KSB7XG4gICAgICAgIGlmIChjaGVja0ZvckV4aXN0ZW5jZShvcHRpb25zLCBhdXRoLm5hbWUpKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0b2tlbiA9IGF3YWl0IGdldEF1dGhUb2tlbihhdXRoLCBvcHRpb25zLmF1dGgpO1xuICAgICAgICBpZiAoIXRva2VuKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBuYW1lID0gYXV0aC5uYW1lID8/IFwiQXV0aG9yaXphdGlvblwiO1xuICAgICAgICBzd2l0Y2ggKGF1dGguaW4pIHtcbiAgICAgICAgICAgIGNhc2UgXCJxdWVyeVwiOlxuICAgICAgICAgICAgICAgIGlmICghb3B0aW9ucy5xdWVyeSkge1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnF1ZXJ5ID0ge307XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG9wdGlvbnMucXVlcnlbbmFtZV0gPSB0b2tlbjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJjb29raWVcIjpcbiAgICAgICAgICAgICAgICBvcHRpb25zLmhlYWRlcnMuYXBwZW5kKFwiQ29va2llXCIsIGAke25hbWV9PSR7dG9rZW59YCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiaGVhZGVyXCI6XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIG9wdGlvbnMuaGVhZGVycy5zZXQobmFtZSwgdG9rZW4pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxufTtcbmV4cG9ydCBjb25zdCBidWlsZFVybCA9IChvcHRpb25zKSA9PiBnZXRVcmwoe1xuICAgIGJhc2VVcmw6IG9wdGlvbnMuYmFzZVVybCxcbiAgICBwYXRoOiBvcHRpb25zLnBhdGgsXG4gICAgcXVlcnk6IG9wdGlvbnMucXVlcnksXG4gICAgcXVlcnlTZXJpYWxpemVyOiB0eXBlb2Ygb3B0aW9ucy5xdWVyeVNlcmlhbGl6ZXIgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgICA/IG9wdGlvbnMucXVlcnlTZXJpYWxpemVyXG4gICAgICAgIDogY3JlYXRlUXVlcnlTZXJpYWxpemVyKG9wdGlvbnMucXVlcnlTZXJpYWxpemVyKSxcbiAgICB1cmw6IG9wdGlvbnMudXJsLFxufSk7XG5leHBvcnQgY29uc3QgbWVyZ2VDb25maWdzID0gKGEsIGIpID0+IHtcbiAgICBjb25zdCBjb25maWcgPSB7IC4uLmEsIC4uLmIgfTtcbiAgICBpZiAoY29uZmlnLmJhc2VVcmw/LmVuZHNXaXRoKFwiL1wiKSkge1xuICAgICAgICBjb25maWcuYmFzZVVybCA9IGNvbmZpZy5iYXNlVXJsLnN1YnN0cmluZygwLCBjb25maWcuYmFzZVVybC5sZW5ndGggLSAxKTtcbiAgICB9XG4gICAgY29uZmlnLmhlYWRlcnMgPSBtZXJnZUhlYWRlcnMoYS5oZWFkZXJzLCBiLmhlYWRlcnMpO1xuICAgIHJldHVybiBjb25maWc7XG59O1xuZXhwb3J0IGNvbnN0IG1lcmdlSGVhZGVycyA9ICguLi5oZWFkZXJzKSA9PiB7XG4gICAgY29uc3QgbWVyZ2VkSGVhZGVycyA9IG5ldyBIZWFkZXJzKCk7XG4gICAgZm9yIChjb25zdCBoZWFkZXIgb2YgaGVhZGVycykge1xuICAgICAgICBpZiAoIWhlYWRlciB8fCB0eXBlb2YgaGVhZGVyICE9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpdGVyYXRvciA9IGhlYWRlciBpbnN0YW5jZW9mIEhlYWRlcnMgPyBoZWFkZXIuZW50cmllcygpIDogT2JqZWN0LmVudHJpZXMoaGVhZGVyKTtcbiAgICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgaXRlcmF0b3IpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIG1lcmdlZEhlYWRlcnMuZGVsZXRlKGtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdiBvZiB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBtZXJnZWRIZWFkZXJzLmFwcGVuZChrZXksIHYpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAvLyBhc3N1bWUgb2JqZWN0IGhlYWRlcnMgYXJlIG1lYW50IHRvIGJlIEpTT04gc3RyaW5naWZpZWQsIGkuZS4gdGhlaXJcbiAgICAgICAgICAgICAgICAvLyBjb250ZW50IHZhbHVlIGluIE9wZW5BUEkgc3BlY2lmaWNhdGlvbiBpcyAnYXBwbGljYXRpb24vanNvbidcbiAgICAgICAgICAgICAgICBtZXJnZWRIZWFkZXJzLnNldChrZXksIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiA/IEpTT04uc3RyaW5naWZ5KHZhbHVlKSA6IHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWVyZ2VkSGVhZGVycztcbn07XG5jbGFzcyBJbnRlcmNlcHRvcnMge1xuICAgIF9mbnM7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuX2ZucyA9IFtdO1xuICAgIH1cbiAgICBjbGVhcigpIHtcbiAgICAgICAgdGhpcy5fZm5zID0gW107XG4gICAgfVxuICAgIGdldEludGVyY2VwdG9ySW5kZXgoaWQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpZCA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2Zuc1tpZF0gPyBpZCA6IC0xO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2Zucy5pbmRleE9mKGlkKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBleGlzdHMoaWQpIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmdldEludGVyY2VwdG9ySW5kZXgoaWQpO1xuICAgICAgICByZXR1cm4gISF0aGlzLl9mbnNbaW5kZXhdO1xuICAgIH1cbiAgICBlamVjdChpZCkge1xuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuZ2V0SW50ZXJjZXB0b3JJbmRleChpZCk7XG4gICAgICAgIGlmICh0aGlzLl9mbnNbaW5kZXhdKSB7XG4gICAgICAgICAgICB0aGlzLl9mbnNbaW5kZXhdID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbiAgICB1cGRhdGUoaWQsIGZuKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5nZXRJbnRlcmNlcHRvckluZGV4KGlkKTtcbiAgICAgICAgaWYgKHRoaXMuX2Zuc1tpbmRleF0pIHtcbiAgICAgICAgICAgIHRoaXMuX2Zuc1tpbmRleF0gPSBmbjtcbiAgICAgICAgICAgIHJldHVybiBpZDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB1c2UoZm4pIHtcbiAgICAgICAgdGhpcy5fZm5zID0gWy4uLnRoaXMuX2ZucywgZm5dO1xuICAgICAgICByZXR1cm4gdGhpcy5fZm5zLmxlbmd0aCAtIDE7XG4gICAgfVxufVxuLy8gZG8gbm90IGFkZCBgTWlkZGxld2FyZWAgYXMgcmV0dXJuIHR5cGUgc28gd2UgY2FuIHVzZSBfZm5zIGludGVybmFsbHlcbmV4cG9ydCBjb25zdCBjcmVhdGVJbnRlcmNlcHRvcnMgPSAoKSA9PiAoe1xuICAgIGVycm9yOiBuZXcgSW50ZXJjZXB0b3JzKCksXG4gICAgcmVxdWVzdDogbmV3IEludGVyY2VwdG9ycygpLFxuICAgIHJlc3BvbnNlOiBuZXcgSW50ZXJjZXB0b3JzKCksXG59KTtcbmNvbnN0IGRlZmF1bHRRdWVyeVNlcmlhbGl6ZXIgPSBjcmVhdGVRdWVyeVNlcmlhbGl6ZXIoe1xuICAgIGFsbG93UmVzZXJ2ZWQ6IGZhbHNlLFxuICAgIGFycmF5OiB7XG4gICAgICAgIGV4cGxvZGU6IHRydWUsXG4gICAgICAgIHN0eWxlOiBcImZvcm1cIixcbiAgICB9LFxuICAgIG9iamVjdDoge1xuICAgICAgICBleHBsb2RlOiB0cnVlLFxuICAgICAgICBzdHlsZTogXCJkZWVwT2JqZWN0XCIsXG4gICAgfSxcbn0pO1xuY29uc3QgZGVmYXVsdEhlYWRlcnMgPSB7XG4gICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG59O1xuZXhwb3J0IGNvbnN0IGNyZWF0ZUNvbmZpZyA9IChvdmVycmlkZSA9IHt9KSA9PiAoe1xuICAgIC4uLmpzb25Cb2R5U2VyaWFsaXplcixcbiAgICBoZWFkZXJzOiBkZWZhdWx0SGVhZGVycyxcbiAgICBwYXJzZUFzOiBcImF1dG9cIixcbiAgICBxdWVyeVNlcmlhbGl6ZXI6IGRlZmF1bHRRdWVyeVNlcmlhbGl6ZXIsXG4gICAgLi4ub3ZlcnJpZGUsXG59KTtcbiIsCiAgICAiLy8gVGhpcyBmaWxlIGlzIGF1dG8tZ2VuZXJhdGVkIGJ5IEBoZXktYXBpL29wZW5hcGktdHNcbmltcG9ydCB7IGNyZWF0ZVNzZUNsaWVudCB9IGZyb20gXCIuLi9jb3JlL3NlcnZlclNlbnRFdmVudHMuZ2VuLmpzXCI7XG5pbXBvcnQgeyBidWlsZFVybCwgY3JlYXRlQ29uZmlnLCBjcmVhdGVJbnRlcmNlcHRvcnMsIGdldFBhcnNlQXMsIG1lcmdlQ29uZmlncywgbWVyZ2VIZWFkZXJzLCBzZXRBdXRoUGFyYW1zLCB9IGZyb20gXCIuL3V0aWxzLmdlbi5qc1wiO1xuZXhwb3J0IGNvbnN0IGNyZWF0ZUNsaWVudCA9IChjb25maWcgPSB7fSkgPT4ge1xuICAgIGxldCBfY29uZmlnID0gbWVyZ2VDb25maWdzKGNyZWF0ZUNvbmZpZygpLCBjb25maWcpO1xuICAgIGNvbnN0IGdldENvbmZpZyA9ICgpID0+ICh7IC4uLl9jb25maWcgfSk7XG4gICAgY29uc3Qgc2V0Q29uZmlnID0gKGNvbmZpZykgPT4ge1xuICAgICAgICBfY29uZmlnID0gbWVyZ2VDb25maWdzKF9jb25maWcsIGNvbmZpZyk7XG4gICAgICAgIHJldHVybiBnZXRDb25maWcoKTtcbiAgICB9O1xuICAgIGNvbnN0IGludGVyY2VwdG9ycyA9IGNyZWF0ZUludGVyY2VwdG9ycygpO1xuICAgIGNvbnN0IGJlZm9yZVJlcXVlc3QgPSBhc3luYyAob3B0aW9ucykgPT4ge1xuICAgICAgICBjb25zdCBvcHRzID0ge1xuICAgICAgICAgICAgLi4uX2NvbmZpZyxcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBmZXRjaDogb3B0aW9ucy5mZXRjaCA/PyBfY29uZmlnLmZldGNoID8/IGdsb2JhbFRoaXMuZmV0Y2gsXG4gICAgICAgICAgICBoZWFkZXJzOiBtZXJnZUhlYWRlcnMoX2NvbmZpZy5oZWFkZXJzLCBvcHRpb25zLmhlYWRlcnMpLFxuICAgICAgICAgICAgc2VyaWFsaXplZEJvZHk6IHVuZGVmaW5lZCxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKG9wdHMuc2VjdXJpdHkpIHtcbiAgICAgICAgICAgIGF3YWl0IHNldEF1dGhQYXJhbXMoe1xuICAgICAgICAgICAgICAgIC4uLm9wdHMsXG4gICAgICAgICAgICAgICAgc2VjdXJpdHk6IG9wdHMuc2VjdXJpdHksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob3B0cy5yZXF1ZXN0VmFsaWRhdG9yKSB7XG4gICAgICAgICAgICBhd2FpdCBvcHRzLnJlcXVlc3RWYWxpZGF0b3Iob3B0cyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9wdHMuYm9keSAmJiBvcHRzLmJvZHlTZXJpYWxpemVyKSB7XG4gICAgICAgICAgICBvcHRzLnNlcmlhbGl6ZWRCb2R5ID0gb3B0cy5ib2R5U2VyaWFsaXplcihvcHRzLmJvZHkpO1xuICAgICAgICB9XG4gICAgICAgIC8vIHJlbW92ZSBDb250ZW50LVR5cGUgaGVhZGVyIGlmIGJvZHkgaXMgZW1wdHkgdG8gYXZvaWQgc2VuZGluZyBpbnZhbGlkIHJlcXVlc3RzXG4gICAgICAgIGlmIChvcHRzLnNlcmlhbGl6ZWRCb2R5ID09PSB1bmRlZmluZWQgfHwgb3B0cy5zZXJpYWxpemVkQm9keSA9PT0gXCJcIikge1xuICAgICAgICAgICAgb3B0cy5oZWFkZXJzLmRlbGV0ZShcIkNvbnRlbnQtVHlwZVwiKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB1cmwgPSBidWlsZFVybChvcHRzKTtcbiAgICAgICAgcmV0dXJuIHsgb3B0cywgdXJsIH07XG4gICAgfTtcbiAgICBjb25zdCByZXF1ZXN0ID0gYXN5bmMgKG9wdGlvbnMpID0+IHtcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgICAgICBjb25zdCB7IG9wdHMsIHVybCB9ID0gYXdhaXQgYmVmb3JlUmVxdWVzdChvcHRpb25zKTtcbiAgICAgICAgY29uc3QgcmVxdWVzdEluaXQgPSB7XG4gICAgICAgICAgICByZWRpcmVjdDogXCJmb2xsb3dcIixcbiAgICAgICAgICAgIC4uLm9wdHMsXG4gICAgICAgICAgICBib2R5OiBvcHRzLnNlcmlhbGl6ZWRCb2R5LFxuICAgICAgICB9O1xuICAgICAgICBsZXQgcmVxdWVzdCA9IG5ldyBSZXF1ZXN0KHVybCwgcmVxdWVzdEluaXQpO1xuICAgICAgICBmb3IgKGNvbnN0IGZuIG9mIGludGVyY2VwdG9ycy5yZXF1ZXN0Ll9mbnMpIHtcbiAgICAgICAgICAgIGlmIChmbikge1xuICAgICAgICAgICAgICAgIHJlcXVlc3QgPSBhd2FpdCBmbihyZXF1ZXN0LCBvcHRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBmZXRjaCBtdXN0IGJlIGFzc2lnbmVkIGhlcmUsIG90aGVyd2lzZSBpdCB3b3VsZCB0aHJvdyB0aGUgZXJyb3I6XG4gICAgICAgIC8vIFR5cGVFcnJvcjogRmFpbGVkIHRvIGV4ZWN1dGUgJ2ZldGNoJyBvbiAnV2luZG93JzogSWxsZWdhbCBpbnZvY2F0aW9uXG4gICAgICAgIGNvbnN0IF9mZXRjaCA9IG9wdHMuZmV0Y2g7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IF9mZXRjaChyZXF1ZXN0KTtcbiAgICAgICAgZm9yIChjb25zdCBmbiBvZiBpbnRlcmNlcHRvcnMucmVzcG9uc2UuX2Zucykge1xuICAgICAgICAgICAgaWYgKGZuKSB7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UgPSBhd2FpdCBmbihyZXNwb25zZSwgcmVxdWVzdCwgb3B0cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVzdWx0ID0ge1xuICAgICAgICAgICAgcmVxdWVzdCxcbiAgICAgICAgICAgIHJlc3BvbnNlLFxuICAgICAgICB9O1xuICAgICAgICBpZiAocmVzcG9uc2Uub2spIHtcbiAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPT09IDIwNCB8fCByZXNwb25zZS5oZWFkZXJzLmdldChcIkNvbnRlbnQtTGVuZ3RoXCIpID09PSBcIjBcIikge1xuICAgICAgICAgICAgICAgIHJldHVybiBvcHRzLnJlc3BvbnNlU3R5bGUgPT09IFwiZGF0YVwiXG4gICAgICAgICAgICAgICAgICAgID8ge31cbiAgICAgICAgICAgICAgICAgICAgOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLnJlc3VsdCxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHBhcnNlQXMgPSAob3B0cy5wYXJzZUFzID09PSBcImF1dG9cIiA/IGdldFBhcnNlQXMocmVzcG9uc2UuaGVhZGVycy5nZXQoXCJDb250ZW50LVR5cGVcIikpIDogb3B0cy5wYXJzZUFzKSA/PyBcImpzb25cIjtcbiAgICAgICAgICAgIGxldCBkYXRhO1xuICAgICAgICAgICAgc3dpdGNoIChwYXJzZUFzKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBcImFycmF5QnVmZmVyXCI6XG4gICAgICAgICAgICAgICAgY2FzZSBcImJsb2JcIjpcbiAgICAgICAgICAgICAgICBjYXNlIFwiZm9ybURhdGFcIjpcbiAgICAgICAgICAgICAgICBjYXNlIFwianNvblwiOlxuICAgICAgICAgICAgICAgIGNhc2UgXCJ0ZXh0XCI6XG4gICAgICAgICAgICAgICAgICAgIGRhdGEgPSBhd2FpdCByZXNwb25zZVtwYXJzZUFzXSgpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwic3RyZWFtXCI6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvcHRzLnJlc3BvbnNlU3R5bGUgPT09IFwiZGF0YVwiXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHJlc3BvbnNlLmJvZHlcbiAgICAgICAgICAgICAgICAgICAgICAgIDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHJlc3BvbnNlLmJvZHksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4ucmVzdWx0LFxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwYXJzZUFzID09PSBcImpzb25cIikge1xuICAgICAgICAgICAgICAgIGlmIChvcHRzLnJlc3BvbnNlVmFsaWRhdG9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IG9wdHMucmVzcG9uc2VWYWxpZGF0b3IoZGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChvcHRzLnJlc3BvbnNlVHJhbnNmb3JtZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YSA9IGF3YWl0IG9wdHMucmVzcG9uc2VUcmFuc2Zvcm1lcihkYXRhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gb3B0cy5yZXNwb25zZVN0eWxlID09PSBcImRhdGFcIlxuICAgICAgICAgICAgICAgID8gZGF0YVxuICAgICAgICAgICAgICAgIDoge1xuICAgICAgICAgICAgICAgICAgICBkYXRhLFxuICAgICAgICAgICAgICAgICAgICAuLi5yZXN1bHQsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0ZXh0RXJyb3IgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XG4gICAgICAgIGxldCBqc29uRXJyb3I7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBqc29uRXJyb3IgPSBKU09OLnBhcnNlKHRleHRFcnJvcik7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2gge1xuICAgICAgICAgICAgLy8gbm9vcFxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGVycm9yID0ganNvbkVycm9yID8/IHRleHRFcnJvcjtcbiAgICAgICAgbGV0IGZpbmFsRXJyb3IgPSBlcnJvcjtcbiAgICAgICAgZm9yIChjb25zdCBmbiBvZiBpbnRlcmNlcHRvcnMuZXJyb3IuX2Zucykge1xuICAgICAgICAgICAgaWYgKGZuKSB7XG4gICAgICAgICAgICAgICAgZmluYWxFcnJvciA9IChhd2FpdCBmbihlcnJvciwgcmVzcG9uc2UsIHJlcXVlc3QsIG9wdHMpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmaW5hbEVycm9yID0gZmluYWxFcnJvciB8fCB7fTtcbiAgICAgICAgaWYgKG9wdHMudGhyb3dPbkVycm9yKSB7XG4gICAgICAgICAgICB0aHJvdyBmaW5hbEVycm9yO1xuICAgICAgICB9XG4gICAgICAgIC8vIFRPRE86IHdlIHByb2JhYmx5IHdhbnQgdG8gcmV0dXJuIGVycm9yIGFuZCBpbXByb3ZlIHR5cGVzXG4gICAgICAgIHJldHVybiBvcHRzLnJlc3BvbnNlU3R5bGUgPT09IFwiZGF0YVwiXG4gICAgICAgICAgICA/IHVuZGVmaW5lZFxuICAgICAgICAgICAgOiB7XG4gICAgICAgICAgICAgICAgZXJyb3I6IGZpbmFsRXJyb3IsXG4gICAgICAgICAgICAgICAgLi4ucmVzdWx0LFxuICAgICAgICAgICAgfTtcbiAgICB9O1xuICAgIGNvbnN0IG1ha2VNZXRob2QgPSAobWV0aG9kKSA9PiB7XG4gICAgICAgIGNvbnN0IGZuID0gKG9wdGlvbnMpID0+IHJlcXVlc3QoeyAuLi5vcHRpb25zLCBtZXRob2QgfSk7XG4gICAgICAgIGZuLnNzZSA9IGFzeW5jIChvcHRpb25zKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB7IG9wdHMsIHVybCB9ID0gYXdhaXQgYmVmb3JlUmVxdWVzdChvcHRpb25zKTtcbiAgICAgICAgICAgIHJldHVybiBjcmVhdGVTc2VDbGllbnQoe1xuICAgICAgICAgICAgICAgIC4uLm9wdHMsXG4gICAgICAgICAgICAgICAgYm9keTogb3B0cy5ib2R5LFxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IG9wdHMuaGVhZGVycyxcbiAgICAgICAgICAgICAgICBtZXRob2QsXG4gICAgICAgICAgICAgICAgdXJsLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBmbjtcbiAgICB9O1xuICAgIHJldHVybiB7XG4gICAgICAgIGJ1aWxkVXJsLFxuICAgICAgICBjb25uZWN0OiBtYWtlTWV0aG9kKFwiQ09OTkVDVFwiKSxcbiAgICAgICAgZGVsZXRlOiBtYWtlTWV0aG9kKFwiREVMRVRFXCIpLFxuICAgICAgICBnZXQ6IG1ha2VNZXRob2QoXCJHRVRcIiksXG4gICAgICAgIGdldENvbmZpZyxcbiAgICAgICAgaGVhZDogbWFrZU1ldGhvZChcIkhFQURcIiksXG4gICAgICAgIGludGVyY2VwdG9ycyxcbiAgICAgICAgb3B0aW9uczogbWFrZU1ldGhvZChcIk9QVElPTlNcIiksXG4gICAgICAgIHBhdGNoOiBtYWtlTWV0aG9kKFwiUEFUQ0hcIiksXG4gICAgICAgIHBvc3Q6IG1ha2VNZXRob2QoXCJQT1NUXCIpLFxuICAgICAgICBwdXQ6IG1ha2VNZXRob2QoXCJQVVRcIiksXG4gICAgICAgIHJlcXVlc3QsXG4gICAgICAgIHNldENvbmZpZyxcbiAgICAgICAgdHJhY2U6IG1ha2VNZXRob2QoXCJUUkFDRVwiKSxcbiAgICB9O1xufTtcbiIsCiAgICAiLy8gVGhpcyBmaWxlIGlzIGF1dG8tZ2VuZXJhdGVkIGJ5IEBoZXktYXBpL29wZW5hcGktdHNcbmNvbnN0IGV4dHJhUHJlZml4ZXNNYXAgPSB7XG4gICAgJGJvZHlfOiBcImJvZHlcIixcbiAgICAkaGVhZGVyc186IFwiaGVhZGVyc1wiLFxuICAgICRwYXRoXzogXCJwYXRoXCIsXG4gICAgJHF1ZXJ5XzogXCJxdWVyeVwiLFxufTtcbmNvbnN0IGV4dHJhUHJlZml4ZXMgPSBPYmplY3QuZW50cmllcyhleHRyYVByZWZpeGVzTWFwKTtcbmNvbnN0IGJ1aWxkS2V5TWFwID0gKGZpZWxkcywgbWFwKSA9PiB7XG4gICAgaWYgKCFtYXApIHtcbiAgICAgICAgbWFwID0gbmV3IE1hcCgpO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IGNvbmZpZyBvZiBmaWVsZHMpIHtcbiAgICAgICAgaWYgKFwiaW5cIiBpbiBjb25maWcpIHtcbiAgICAgICAgICAgIGlmIChjb25maWcua2V5KSB7XG4gICAgICAgICAgICAgICAgbWFwLnNldChjb25maWcua2V5LCB7XG4gICAgICAgICAgICAgICAgICAgIGluOiBjb25maWcuaW4sXG4gICAgICAgICAgICAgICAgICAgIG1hcDogY29uZmlnLm1hcCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjb25maWcuYXJncykge1xuICAgICAgICAgICAgYnVpbGRLZXlNYXAoY29uZmlnLmFyZ3MsIG1hcCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG1hcDtcbn07XG5jb25zdCBzdHJpcEVtcHR5U2xvdHMgPSAocGFyYW1zKSA9PiB7XG4gICAgZm9yIChjb25zdCBbc2xvdCwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKHBhcmFtcykpIHtcbiAgICAgICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJiAhT2JqZWN0LmtleXModmFsdWUpLmxlbmd0aCkge1xuICAgICAgICAgICAgZGVsZXRlIHBhcmFtc1tzbG90XTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5leHBvcnQgY29uc3QgYnVpbGRDbGllbnRQYXJhbXMgPSAoYXJncywgZmllbGRzKSA9PiB7XG4gICAgY29uc3QgcGFyYW1zID0ge1xuICAgICAgICBib2R5OiB7fSxcbiAgICAgICAgaGVhZGVyczoge30sXG4gICAgICAgIHBhdGg6IHt9LFxuICAgICAgICBxdWVyeToge30sXG4gICAgfTtcbiAgICBjb25zdCBtYXAgPSBidWlsZEtleU1hcChmaWVsZHMpO1xuICAgIGxldCBjb25maWc7XG4gICAgZm9yIChjb25zdCBbaW5kZXgsIGFyZ10gb2YgYXJncy5lbnRyaWVzKCkpIHtcbiAgICAgICAgaWYgKGZpZWxkc1tpbmRleF0pIHtcbiAgICAgICAgICAgIGNvbmZpZyA9IGZpZWxkc1tpbmRleF07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFjb25maWcpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChcImluXCIgaW4gY29uZmlnKSB7XG4gICAgICAgICAgICBpZiAoY29uZmlnLmtleSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZpZWxkID0gbWFwLmdldChjb25maWcua2V5KTtcbiAgICAgICAgICAgICAgICBjb25zdCBuYW1lID0gZmllbGQubWFwIHx8IGNvbmZpZy5rZXk7XG4gICAgICAgICAgICAgICAgcGFyYW1zW2ZpZWxkLmluXVtuYW1lXSA9IGFyZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHBhcmFtcy5ib2R5ID0gYXJnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoYXJnID8/IHt9KSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZpZWxkID0gbWFwLmdldChrZXkpO1xuICAgICAgICAgICAgICAgIGlmIChmaWVsZCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBuYW1lID0gZmllbGQubWFwIHx8IGtleTtcbiAgICAgICAgICAgICAgICAgICAgcGFyYW1zW2ZpZWxkLmluXVtuYW1lXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXh0cmEgPSBleHRyYVByZWZpeGVzLmZpbmQoKFtwcmVmaXhdKSA9PiBrZXkuc3RhcnRzV2l0aChwcmVmaXgpKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGV4dHJhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBbcHJlZml4LCBzbG90XSA9IGV4dHJhO1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zW3Nsb3RdW2tleS5zbGljZShwcmVmaXgubGVuZ3RoKV0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgW3Nsb3QsIGFsbG93ZWRdIG9mIE9iamVjdC5lbnRyaWVzKGNvbmZpZy5hbGxvd0V4dHJhID8/IHt9KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhbGxvd2VkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zW3Nsb3RdW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHN0cmlwRW1wdHlTbG90cyhwYXJhbXMpO1xuICAgIHJldHVybiBwYXJhbXM7XG59O1xuIiwKICAgICIvLyBUaGlzIGZpbGUgaXMgYXV0by1nZW5lcmF0ZWQgYnkgQGhleS1hcGkvb3BlbmFwaS10c1xuaW1wb3J0IHsgY3JlYXRlQ2xpZW50LCBjcmVhdGVDb25maWcgfSBmcm9tIFwiLi9jbGllbnQvaW5kZXguanNcIjtcbmV4cG9ydCBjb25zdCBjbGllbnQgPSBjcmVhdGVDbGllbnQoY3JlYXRlQ29uZmlnKHtcbiAgICBiYXNlVXJsOiBcImh0dHA6Ly9sb2NhbGhvc3Q6NDA5NlwiLFxufSkpO1xuIiwKICAgICIvLyBUaGlzIGZpbGUgaXMgYXV0by1nZW5lcmF0ZWQgYnkgQGhleS1hcGkvb3BlbmFwaS10c1xuaW1wb3J0IHsgY2xpZW50IGFzIF9oZXlBcGlDbGllbnQgfSBmcm9tIFwiLi9jbGllbnQuZ2VuLmpzXCI7XG5jbGFzcyBfSGV5QXBpQ2xpZW50IHtcbiAgICBfY2xpZW50ID0gX2hleUFwaUNsaWVudDtcbiAgICBjb25zdHJ1Y3RvcihhcmdzKSB7XG4gICAgICAgIGlmIChhcmdzPy5jbGllbnQpIHtcbiAgICAgICAgICAgIHRoaXMuX2NsaWVudCA9IGFyZ3MuY2xpZW50O1xuICAgICAgICB9XG4gICAgfVxufVxuY2xhc3MgR2xvYmFsIGV4dGVuZHMgX0hleUFwaUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogR2V0IGV2ZW50c1xuICAgICAqL1xuICAgIGV2ZW50KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQuc3NlKHtcbiAgICAgICAgICAgIHVybDogXCIvZ2xvYmFsL2V2ZW50XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG59XG5jbGFzcyBQcm9qZWN0IGV4dGVuZHMgX0hleUFwaUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogTGlzdCBhbGwgcHJvamVjdHNcbiAgICAgKi9cbiAgICBsaXN0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9wcm9qZWN0XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBjdXJyZW50IHByb2plY3RcbiAgICAgKi9cbiAgICBjdXJyZW50KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9wcm9qZWN0L2N1cnJlbnRcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmNsYXNzIFB0eSBleHRlbmRzIF9IZXlBcGlDbGllbnQge1xuICAgIC8qKlxuICAgICAqIExpc3QgYWxsIFBUWSBzZXNzaW9uc1xuICAgICAqL1xuICAgIGxpc3Qob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL3B0eVwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBQVFkgc2Vzc2lvblxuICAgICAqL1xuICAgIGNyZWF0ZShvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3B0eVwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zPy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBhIFBUWSBzZXNzaW9uXG4gICAgICovXG4gICAgcmVtb3ZlKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmRlbGV0ZSh7XG4gICAgICAgICAgICB1cmw6IFwiL3B0eS97aWR9XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0IFBUWSBzZXNzaW9uIGluZm9cbiAgICAgKi9cbiAgICBnZXQob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvcHR5L3tpZH1cIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgUFRZIHNlc3Npb25cbiAgICAgKi9cbiAgICB1cGRhdGUob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucHV0KHtcbiAgICAgICAgICAgIHVybDogXCIvcHR5L3tpZH1cIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENvbm5lY3QgdG8gYSBQVFkgc2Vzc2lvblxuICAgICAqL1xuICAgIGNvbm5lY3Qob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvcHR5L3tpZH0vY29ubmVjdFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuY2xhc3MgQ29uZmlnIGV4dGVuZHMgX0hleUFwaUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogR2V0IGNvbmZpZyBpbmZvXG4gICAgICovXG4gICAgZ2V0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9jb25maWdcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgY29uZmlnXG4gICAgICovXG4gICAgdXBkYXRlKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wYXRjaCh7XG4gICAgICAgICAgICB1cmw6IFwiL2NvbmZpZ1wiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zPy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIExpc3QgYWxsIHByb3ZpZGVyc1xuICAgICAqL1xuICAgIHByb3ZpZGVycyhvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvY29uZmlnL3Byb3ZpZGVyc1wiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuY2xhc3MgVG9vbCBleHRlbmRzIF9IZXlBcGlDbGllbnQge1xuICAgIC8qKlxuICAgICAqIExpc3QgYWxsIHRvb2wgSURzIChpbmNsdWRpbmcgYnVpbHQtaW4gYW5kIGR5bmFtaWNhbGx5IHJlZ2lzdGVyZWQpXG4gICAgICovXG4gICAgaWRzKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9leHBlcmltZW50YWwvdG9vbC9pZHNcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBMaXN0IHRvb2xzIHdpdGggSlNPTiBzY2hlbWEgcGFyYW1ldGVycyBmb3IgYSBwcm92aWRlci9tb2RlbFxuICAgICAqL1xuICAgIGxpc3Qob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvZXhwZXJpbWVudGFsL3Rvb2xcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmNsYXNzIEluc3RhbmNlIGV4dGVuZHMgX0hleUFwaUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogRGlzcG9zZSB0aGUgY3VycmVudCBpbnN0YW5jZVxuICAgICAqL1xuICAgIGRpc3Bvc2Uob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi9pbnN0YW5jZS9kaXNwb3NlXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG59XG5jbGFzcyBQYXRoIGV4dGVuZHMgX0hleUFwaUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBjdXJyZW50IHBhdGhcbiAgICAgKi9cbiAgICBnZXQob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL3BhdGhcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmNsYXNzIFZjcyBleHRlbmRzIF9IZXlBcGlDbGllbnQge1xuICAgIC8qKlxuICAgICAqIEdldCBWQ1MgaW5mbyBmb3IgdGhlIGN1cnJlbnQgaW5zdGFuY2VcbiAgICAgKi9cbiAgICBnZXQob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Zjc1wiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuY2xhc3MgU2Vzc2lvbiBleHRlbmRzIF9IZXlBcGlDbGllbnQge1xuICAgIC8qKlxuICAgICAqIExpc3QgYWxsIHNlc3Npb25zXG4gICAgICovXG4gICAgbGlzdChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvc2Vzc2lvblwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBzZXNzaW9uXG4gICAgICovXG4gICAgY3JlYXRlKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvc2Vzc2lvblwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zPy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCBzZXNzaW9uIHN0YXR1c1xuICAgICAqL1xuICAgIHN0YXR1cyhvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvc2Vzc2lvbi9zdGF0dXNcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZWxldGUgYSBzZXNzaW9uIGFuZCBhbGwgaXRzIGRhdGFcbiAgICAgKi9cbiAgICBkZWxldGUob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZGVsZXRlKHtcbiAgICAgICAgICAgIHVybDogXCIvc2Vzc2lvbi97aWR9XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0IHNlc3Npb25cbiAgICAgKi9cbiAgICBnZXQob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvc2Vzc2lvbi97aWR9XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVXBkYXRlIHNlc3Npb24gcHJvcGVydGllc1xuICAgICAqL1xuICAgIHVwZGF0ZShvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wYXRjaCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Nlc3Npb24ve2lkfVwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zLmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0IGEgc2Vzc2lvbidzIGNoaWxkcmVuXG4gICAgICovXG4gICAgY2hpbGRyZW4ob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvc2Vzc2lvbi97aWR9L2NoaWxkcmVuXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0IHRoZSB0b2RvIGxpc3QgZm9yIGEgc2Vzc2lvblxuICAgICAqL1xuICAgIHRvZG8ob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvc2Vzc2lvbi97aWR9L3RvZG9cIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBbmFseXplIHRoZSBhcHAgYW5kIGNyZWF0ZSBhbiBBR0VOVFMubWQgZmlsZVxuICAgICAqL1xuICAgIGluaXQob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Nlc3Npb24ve2lkfS9pbml0XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnMuaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBGb3JrIGFuIGV4aXN0aW5nIHNlc3Npb24gYXQgYSBzcGVjaWZpYyBtZXNzYWdlXG4gICAgICovXG4gICAgZm9yayhvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvc2Vzc2lvbi97aWR9L2ZvcmtcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFib3J0IGEgc2Vzc2lvblxuICAgICAqL1xuICAgIGFib3J0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi9zZXNzaW9uL3tpZH0vYWJvcnRcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBVbnNoYXJlIHRoZSBzZXNzaW9uXG4gICAgICovXG4gICAgdW5zaGFyZShvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5kZWxldGUoe1xuICAgICAgICAgICAgdXJsOiBcIi9zZXNzaW9uL3tpZH0vc2hhcmVcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTaGFyZSBhIHNlc3Npb25cbiAgICAgKi9cbiAgICBzaGFyZShvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvc2Vzc2lvbi97aWR9L3NoYXJlXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBkaWZmIGZvciB0aGlzIHNlc3Npb25cbiAgICAgKi9cbiAgICBkaWZmKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Nlc3Npb24ve2lkfS9kaWZmXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU3VtbWFyaXplIHRoZSBzZXNzaW9uXG4gICAgICovXG4gICAgc3VtbWFyaXplKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi9zZXNzaW9uL3tpZH0vc3VtbWFyaXplXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnMuaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBMaXN0IG1lc3NhZ2VzIGZvciBhIHNlc3Npb25cbiAgICAgKi9cbiAgICBtZXNzYWdlcyhvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9zZXNzaW9uL3tpZH0vbWVzc2FnZVwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhbmQgc2VuZCBhIG5ldyBtZXNzYWdlIHRvIGEgc2Vzc2lvblxuICAgICAqL1xuICAgIHByb21wdChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvc2Vzc2lvbi97aWR9L21lc3NhZ2VcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCBhIG1lc3NhZ2UgZnJvbSBhIHNlc3Npb25cbiAgICAgKi9cbiAgICBtZXNzYWdlKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Nlc3Npb24ve2lkfS9tZXNzYWdlL3ttZXNzYWdlSUR9XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGFuZCBzZW5kIGEgbmV3IG1lc3NhZ2UgdG8gYSBzZXNzaW9uLCBzdGFydCBpZiBuZWVkZWQgYW5kIHJldHVybiBpbW1lZGlhdGVseVxuICAgICAqL1xuICAgIHByb21wdEFzeW5jKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi9zZXNzaW9uL3tpZH0vcHJvbXB0X2FzeW5jXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnMuaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZW5kIGEgbmV3IGNvbW1hbmQgdG8gYSBzZXNzaW9uXG4gICAgICovXG4gICAgY29tbWFuZChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvc2Vzc2lvbi97aWR9L2NvbW1hbmRcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJ1biBhIHNoZWxsIGNvbW1hbmRcbiAgICAgKi9cbiAgICBzaGVsbChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvc2Vzc2lvbi97aWR9L3NoZWxsXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnMuaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXZlcnQgYSBtZXNzYWdlXG4gICAgICovXG4gICAgcmV2ZXJ0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi9zZXNzaW9uL3tpZH0vcmV2ZXJ0XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnMuaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXN0b3JlIGFsbCByZXZlcnRlZCBtZXNzYWdlc1xuICAgICAqL1xuICAgIHVucmV2ZXJ0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi9zZXNzaW9uL3tpZH0vdW5yZXZlcnRcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmNsYXNzIENvbW1hbmQgZXh0ZW5kcyBfSGV5QXBpQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBMaXN0IGFsbCBjb21tYW5kc1xuICAgICAqL1xuICAgIGxpc3Qob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL2NvbW1hbmRcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmNsYXNzIE9hdXRoIGV4dGVuZHMgX0hleUFwaUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogQXV0aG9yaXplIGEgcHJvdmlkZXIgdXNpbmcgT0F1dGhcbiAgICAgKi9cbiAgICBhdXRob3JpemUob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Byb3ZpZGVyL3tpZH0vb2F1dGgvYXV0aG9yaXplXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnMuaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBIYW5kbGUgT0F1dGggY2FsbGJhY2sgZm9yIGEgcHJvdmlkZXJcbiAgICAgKi9cbiAgICBjYWxsYmFjayhvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvcHJvdmlkZXIve2lkfS9vYXV0aC9jYWxsYmFja1wiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zLmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG59XG5jbGFzcyBQcm92aWRlciBleHRlbmRzIF9IZXlBcGlDbGllbnQge1xuICAgIC8qKlxuICAgICAqIExpc3QgYWxsIHByb3ZpZGVyc1xuICAgICAqL1xuICAgIGxpc3Qob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Byb3ZpZGVyXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0IHByb3ZpZGVyIGF1dGhlbnRpY2F0aW9uIG1ldGhvZHNcbiAgICAgKi9cbiAgICBhdXRoKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9wcm92aWRlci9hdXRoXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgb2F1dGggPSBuZXcgT2F1dGgoeyBjbGllbnQ6IHRoaXMuX2NsaWVudCB9KTtcbn1cbmNsYXNzIEZpbmQgZXh0ZW5kcyBfSGV5QXBpQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBGaW5kIHRleHQgaW4gZmlsZXNcbiAgICAgKi9cbiAgICB0ZXh0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL2ZpbmRcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBGaW5kIGZpbGVzXG4gICAgICovXG4gICAgZmlsZXMob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvZmluZC9maWxlXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRmluZCB3b3Jrc3BhY2Ugc3ltYm9sc1xuICAgICAqL1xuICAgIHN5bWJvbHMob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvZmluZC9zeW1ib2xcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmNsYXNzIEZpbGUgZXh0ZW5kcyBfSGV5QXBpQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBMaXN0IGZpbGVzIGFuZCBkaXJlY3Rvcmllc1xuICAgICAqL1xuICAgIGxpc3Qob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvZmlsZVwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlYWQgYSBmaWxlXG4gICAgICovXG4gICAgcmVhZChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9maWxlL2NvbnRlbnRcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgZmlsZSBzdGF0dXNcbiAgICAgKi9cbiAgICBzdGF0dXMob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL2ZpbGUvc3RhdHVzXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG59XG5jbGFzcyBBcHAgZXh0ZW5kcyBfSGV5QXBpQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBXcml0ZSBhIGxvZyBlbnRyeSB0byB0aGUgc2VydmVyIGxvZ3NcbiAgICAgKi9cbiAgICBsb2cob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi9sb2dcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucz8uaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBMaXN0IGFsbCBhZ2VudHNcbiAgICAgKi9cbiAgICBhZ2VudHMob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL2FnZW50XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG59XG5jbGFzcyBBdXRoIGV4dGVuZHMgX0hleUFwaUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogUmVtb3ZlIE9BdXRoIGNyZWRlbnRpYWxzIGZvciBhbiBNQ1Agc2VydmVyXG4gICAgICovXG4gICAgcmVtb3ZlKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmRlbGV0ZSh7XG4gICAgICAgICAgICB1cmw6IFwiL21jcC97bmFtZX0vYXV0aFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFN0YXJ0IE9BdXRoIGF1dGhlbnRpY2F0aW9uIGZsb3cgZm9yIGFuIE1DUCBzZXJ2ZXJcbiAgICAgKi9cbiAgICBzdGFydChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvbWNwL3tuYW1lfS9hdXRoXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ29tcGxldGUgT0F1dGggYXV0aGVudGljYXRpb24gd2l0aCBhdXRob3JpemF0aW9uIGNvZGVcbiAgICAgKi9cbiAgICBjYWxsYmFjayhvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvbWNwL3tuYW1lfS9hdXRoL2NhbGxiYWNrXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnMuaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTdGFydCBPQXV0aCBmbG93IGFuZCB3YWl0IGZvciBjYWxsYmFjayAob3BlbnMgYnJvd3NlcilcbiAgICAgKi9cbiAgICBhdXRoZW50aWNhdGUob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL21jcC97bmFtZX0vYXV0aC9hdXRoZW50aWNhdGVcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXQgYXV0aGVudGljYXRpb24gY3JlZGVudGlhbHNcbiAgICAgKi9cbiAgICBzZXQob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucHV0KHtcbiAgICAgICAgICAgIHVybDogXCIvYXV0aC97aWR9XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnMuaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmNsYXNzIE1jcCBleHRlbmRzIF9IZXlBcGlDbGllbnQge1xuICAgIC8qKlxuICAgICAqIEdldCBNQ1Agc2VydmVyIHN0YXR1c1xuICAgICAqL1xuICAgIHN0YXR1cyhvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvbWNwXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQWRkIE1DUCBzZXJ2ZXIgZHluYW1pY2FsbHlcbiAgICAgKi9cbiAgICBhZGQob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi9tY3BcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucz8uaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDb25uZWN0IGFuIE1DUCBzZXJ2ZXJcbiAgICAgKi9cbiAgICBjb25uZWN0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi9tY3Ave25hbWV9L2Nvbm5lY3RcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBEaXNjb25uZWN0IGFuIE1DUCBzZXJ2ZXJcbiAgICAgKi9cbiAgICBkaXNjb25uZWN0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi9tY3Ave25hbWV9L2Rpc2Nvbm5lY3RcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBhdXRoID0gbmV3IEF1dGgoeyBjbGllbnQ6IHRoaXMuX2NsaWVudCB9KTtcbn1cbmNsYXNzIExzcCBleHRlbmRzIF9IZXlBcGlDbGllbnQge1xuICAgIC8qKlxuICAgICAqIEdldCBMU1Agc2VydmVyIHN0YXR1c1xuICAgICAqL1xuICAgIHN0YXR1cyhvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvbHNwXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG59XG5jbGFzcyBGb3JtYXR0ZXIgZXh0ZW5kcyBfSGV5QXBpQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBHZXQgZm9ybWF0dGVyIHN0YXR1c1xuICAgICAqL1xuICAgIHN0YXR1cyhvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvZm9ybWF0dGVyXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG59XG5jbGFzcyBDb250cm9sIGV4dGVuZHMgX0hleUFwaUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBuZXh0IFRVSSByZXF1ZXN0IGZyb20gdGhlIHF1ZXVlXG4gICAgICovXG4gICAgbmV4dChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvdHVpL2NvbnRyb2wvbmV4dFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFN1Ym1pdCBhIHJlc3BvbnNlIHRvIHRoZSBUVUkgcmVxdWVzdCBxdWV1ZVxuICAgICAqL1xuICAgIHJlc3BvbnNlKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvdHVpL2NvbnRyb2wvcmVzcG9uc2VcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucz8uaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmNsYXNzIFR1aSBleHRlbmRzIF9IZXlBcGlDbGllbnQge1xuICAgIC8qKlxuICAgICAqIEFwcGVuZCBwcm9tcHQgdG8gdGhlIFRVSVxuICAgICAqL1xuICAgIGFwcGVuZFByb21wdChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3R1aS9hcHBlbmQtcHJvbXB0XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnM/LmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogT3BlbiB0aGUgaGVscCBkaWFsb2dcbiAgICAgKi9cbiAgICBvcGVuSGVscChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3R1aS9vcGVuLWhlbHBcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBPcGVuIHRoZSBzZXNzaW9uIGRpYWxvZ1xuICAgICAqL1xuICAgIG9wZW5TZXNzaW9ucyhvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3R1aS9vcGVuLXNlc3Npb25zXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogT3BlbiB0aGUgdGhlbWUgZGlhbG9nXG4gICAgICovXG4gICAgb3BlblRoZW1lcyhvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3R1aS9vcGVuLXRoZW1lc1wiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE9wZW4gdGhlIG1vZGVsIGRpYWxvZ1xuICAgICAqL1xuICAgIG9wZW5Nb2RlbHMob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi90dWkvb3Blbi1tb2RlbHNcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTdWJtaXQgdGhlIHByb21wdFxuICAgICAqL1xuICAgIHN1Ym1pdFByb21wdChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3R1aS9zdWJtaXQtcHJvbXB0XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2xlYXIgdGhlIHByb21wdFxuICAgICAqL1xuICAgIGNsZWFyUHJvbXB0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvdHVpL2NsZWFyLXByb21wdFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEV4ZWN1dGUgYSBUVUkgY29tbWFuZCAoZS5nLiBhZ2VudF9jeWNsZSlcbiAgICAgKi9cbiAgICBleGVjdXRlQ29tbWFuZChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3R1aS9leGVjdXRlLWNvbW1hbmRcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucz8uaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTaG93IGEgdG9hc3Qgbm90aWZpY2F0aW9uIGluIHRoZSBUVUlcbiAgICAgKi9cbiAgICBzaG93VG9hc3Qob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi90dWkvc2hvdy10b2FzdFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zPy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFB1Ymxpc2ggYSBUVUkgZXZlbnRcbiAgICAgKi9cbiAgICBwdWJsaXNoKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvdHVpL3B1Ymxpc2hcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucz8uaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBjb250cm9sID0gbmV3IENvbnRyb2woeyBjbGllbnQ6IHRoaXMuX2NsaWVudCB9KTtcbn1cbmNsYXNzIEV2ZW50IGV4dGVuZHMgX0hleUFwaUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogR2V0IGV2ZW50c1xuICAgICAqL1xuICAgIHN1YnNjcmliZShvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0LnNzZSh7XG4gICAgICAgICAgICB1cmw6IFwiL2V2ZW50XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgT3BlbmNvZGVDbGllbnQgZXh0ZW5kcyBfSGV5QXBpQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBSZXNwb25kIHRvIGEgcGVybWlzc2lvbiByZXF1ZXN0XG4gICAgICovXG4gICAgcG9zdFNlc3Npb25JZFBlcm1pc3Npb25zUGVybWlzc2lvbklkKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi9zZXNzaW9uL3tpZH0vcGVybWlzc2lvbnMve3Blcm1pc3Npb25JRH1cIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGdsb2JhbCA9IG5ldyBHbG9iYWwoeyBjbGllbnQ6IHRoaXMuX2NsaWVudCB9KTtcbiAgICBwcm9qZWN0ID0gbmV3IFByb2plY3QoeyBjbGllbnQ6IHRoaXMuX2NsaWVudCB9KTtcbiAgICBwdHkgPSBuZXcgUHR5KHsgY2xpZW50OiB0aGlzLl9jbGllbnQgfSk7XG4gICAgY29uZmlnID0gbmV3IENvbmZpZyh7IGNsaWVudDogdGhpcy5fY2xpZW50IH0pO1xuICAgIHRvb2wgPSBuZXcgVG9vbCh7IGNsaWVudDogdGhpcy5fY2xpZW50IH0pO1xuICAgIGluc3RhbmNlID0gbmV3IEluc3RhbmNlKHsgY2xpZW50OiB0aGlzLl9jbGllbnQgfSk7XG4gICAgcGF0aCA9IG5ldyBQYXRoKHsgY2xpZW50OiB0aGlzLl9jbGllbnQgfSk7XG4gICAgdmNzID0gbmV3IFZjcyh7IGNsaWVudDogdGhpcy5fY2xpZW50IH0pO1xuICAgIHNlc3Npb24gPSBuZXcgU2Vzc2lvbih7IGNsaWVudDogdGhpcy5fY2xpZW50IH0pO1xuICAgIGNvbW1hbmQgPSBuZXcgQ29tbWFuZCh7IGNsaWVudDogdGhpcy5fY2xpZW50IH0pO1xuICAgIHByb3ZpZGVyID0gbmV3IFByb3ZpZGVyKHsgY2xpZW50OiB0aGlzLl9jbGllbnQgfSk7XG4gICAgZmluZCA9IG5ldyBGaW5kKHsgY2xpZW50OiB0aGlzLl9jbGllbnQgfSk7XG4gICAgZmlsZSA9IG5ldyBGaWxlKHsgY2xpZW50OiB0aGlzLl9jbGllbnQgfSk7XG4gICAgYXBwID0gbmV3IEFwcCh7IGNsaWVudDogdGhpcy5fY2xpZW50IH0pO1xuICAgIG1jcCA9IG5ldyBNY3AoeyBjbGllbnQ6IHRoaXMuX2NsaWVudCB9KTtcbiAgICBsc3AgPSBuZXcgTHNwKHsgY2xpZW50OiB0aGlzLl9jbGllbnQgfSk7XG4gICAgZm9ybWF0dGVyID0gbmV3IEZvcm1hdHRlcih7IGNsaWVudDogdGhpcy5fY2xpZW50IH0pO1xuICAgIHR1aSA9IG5ldyBUdWkoeyBjbGllbnQ6IHRoaXMuX2NsaWVudCB9KTtcbiAgICBhdXRoID0gbmV3IEF1dGgoeyBjbGllbnQ6IHRoaXMuX2NsaWVudCB9KTtcbiAgICBldmVudCA9IG5ldyBFdmVudCh7IGNsaWVudDogdGhpcy5fY2xpZW50IH0pO1xufVxuIiwKICAgICJleHBvcnQgKiBmcm9tIFwiLi9nZW4vdHlwZXMuZ2VuLmpzXCI7XG5pbXBvcnQgeyBjcmVhdGVDbGllbnQgfSBmcm9tIFwiLi9nZW4vY2xpZW50L2NsaWVudC5nZW4uanNcIjtcbmltcG9ydCB7IE9wZW5jb2RlQ2xpZW50IH0gZnJvbSBcIi4vZ2VuL3Nkay5nZW4uanNcIjtcbmV4cG9ydCB7IE9wZW5jb2RlQ2xpZW50IH07XG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlT3BlbmNvZGVDbGllbnQoY29uZmlnKSB7XG4gICAgaWYgKCFjb25maWc/LmZldGNoKSB7XG4gICAgICAgIGNvbnN0IGN1c3RvbUZldGNoID0gKHJlcSkgPT4ge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgcmVxLnRpbWVvdXQgPSBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybiBmZXRjaChyZXEpO1xuICAgICAgICB9O1xuICAgICAgICBjb25maWcgPSB7XG4gICAgICAgICAgICAuLi5jb25maWcsXG4gICAgICAgICAgICBmZXRjaDogY3VzdG9tRmV0Y2gsXG4gICAgICAgIH07XG4gICAgfVxuICAgIGlmIChjb25maWc/LmRpcmVjdG9yeSkge1xuICAgICAgICBjb25maWcuaGVhZGVycyA9IHtcbiAgICAgICAgICAgIC4uLmNvbmZpZy5oZWFkZXJzLFxuICAgICAgICAgICAgXCJ4LW9wZW5jb2RlLWRpcmVjdG9yeVwiOiBjb25maWcuZGlyZWN0b3J5LFxuICAgICAgICB9O1xuICAgIH1cbiAgICBjb25zdCBjbGllbnQgPSBjcmVhdGVDbGllbnQoY29uZmlnKTtcbiAgICByZXR1cm4gbmV3IE9wZW5jb2RlQ2xpZW50KHsgY2xpZW50IH0pO1xufVxuIiwKICAgICJpbXBvcnQgeyBzcGF3biB9IGZyb20gXCJub2RlOmNoaWxkX3Byb2Nlc3NcIjtcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjcmVhdGVPcGVuY29kZVNlcnZlcihvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgICBob3N0bmFtZTogXCIxMjcuMC4wLjFcIixcbiAgICAgICAgcG9ydDogNDA5NixcbiAgICAgICAgdGltZW91dDogNTAwMCxcbiAgICB9LCBvcHRpb25zID8/IHt9KTtcbiAgICBjb25zdCBhcmdzID0gW2BzZXJ2ZWAsIGAtLWhvc3RuYW1lPSR7b3B0aW9ucy5ob3N0bmFtZX1gLCBgLS1wb3J0PSR7b3B0aW9ucy5wb3J0fWBdO1xuICAgIGlmIChvcHRpb25zLmNvbmZpZz8ubG9nTGV2ZWwpXG4gICAgICAgIGFyZ3MucHVzaChgLS1sb2ctbGV2ZWw9JHtvcHRpb25zLmNvbmZpZy5sb2dMZXZlbH1gKTtcbiAgICBjb25zdCBwcm9jID0gc3Bhd24oYG9wZW5jb2RlYCwgYXJncywge1xuICAgICAgICBzaWduYWw6IG9wdGlvbnMuc2lnbmFsLFxuICAgICAgICBlbnY6IHtcbiAgICAgICAgICAgIC4uLnByb2Nlc3MuZW52LFxuICAgICAgICAgICAgT1BFTkNPREVfQ09ORklHX0NPTlRFTlQ6IEpTT04uc3RyaW5naWZ5KG9wdGlvbnMuY29uZmlnID8/IHt9KSxcbiAgICAgICAgfSxcbiAgICB9KTtcbiAgICBjb25zdCB1cmwgPSBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGNvbnN0IGlkID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICByZWplY3QobmV3IEVycm9yKGBUaW1lb3V0IHdhaXRpbmcgZm9yIHNlcnZlciB0byBzdGFydCBhZnRlciAke29wdGlvbnMudGltZW91dH1tc2ApKTtcbiAgICAgICAgfSwgb3B0aW9ucy50aW1lb3V0KTtcbiAgICAgICAgbGV0IG91dHB1dCA9IFwiXCI7XG4gICAgICAgIHByb2Muc3Rkb3V0Py5vbihcImRhdGFcIiwgKGNodW5rKSA9PiB7XG4gICAgICAgICAgICBvdXRwdXQgKz0gY2h1bmsudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIGNvbnN0IGxpbmVzID0gb3V0cHV0LnNwbGl0KFwiXFxuXCIpO1xuICAgICAgICAgICAgZm9yIChjb25zdCBsaW5lIG9mIGxpbmVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGxpbmUuc3RhcnRzV2l0aChcIm9wZW5jb2RlIHNlcnZlciBsaXN0ZW5pbmdcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbWF0Y2ggPSBsaW5lLm1hdGNoKC9vblxccysoaHR0cHM/OlxcL1xcL1teXFxzXSspLyk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghbWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIHBhcnNlIHNlcnZlciB1cmwgZnJvbSBvdXRwdXQ6ICR7bGluZX1gKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoaWQpO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG1hdGNoWzFdKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHByb2Muc3RkZXJyPy5vbihcImRhdGFcIiwgKGNodW5rKSA9PiB7XG4gICAgICAgICAgICBvdXRwdXQgKz0gY2h1bmsudG9TdHJpbmcoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHByb2Mub24oXCJleGl0XCIsIChjb2RlKSA9PiB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQoaWQpO1xuICAgICAgICAgICAgbGV0IG1zZyA9IGBTZXJ2ZXIgZXhpdGVkIHdpdGggY29kZSAke2NvZGV9YDtcbiAgICAgICAgICAgIGlmIChvdXRwdXQudHJpbSgpKSB7XG4gICAgICAgICAgICAgICAgbXNnICs9IGBcXG5TZXJ2ZXIgb3V0cHV0OiAke291dHB1dH1gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihtc2cpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHByb2Mub24oXCJlcnJvclwiLCAoZXJyb3IpID0+IHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChpZCk7XG4gICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKG9wdGlvbnMuc2lnbmFsKSB7XG4gICAgICAgICAgICBvcHRpb25zLnNpZ25hbC5hZGRFdmVudExpc3RlbmVyKFwiYWJvcnRcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dChpZCk7XG4gICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihcIkFib3J0ZWRcIikpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4ge1xuICAgICAgICB1cmwsXG4gICAgICAgIGNsb3NlKCkge1xuICAgICAgICAgICAgcHJvYy5raWxsKCk7XG4gICAgICAgIH0sXG4gICAgfTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVPcGVuY29kZVR1aShvcHRpb25zKSB7XG4gICAgY29uc3QgYXJncyA9IFtdO1xuICAgIGlmIChvcHRpb25zPy5wcm9qZWN0KSB7XG4gICAgICAgIGFyZ3MucHVzaChgLS1wcm9qZWN0PSR7b3B0aW9ucy5wcm9qZWN0fWApO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucz8ubW9kZWwpIHtcbiAgICAgICAgYXJncy5wdXNoKGAtLW1vZGVsPSR7b3B0aW9ucy5tb2RlbH1gKTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnM/LnNlc3Npb24pIHtcbiAgICAgICAgYXJncy5wdXNoKGAtLXNlc3Npb249JHtvcHRpb25zLnNlc3Npb259YCk7XG4gICAgfVxuICAgIGlmIChvcHRpb25zPy5hZ2VudCkge1xuICAgICAgICBhcmdzLnB1c2goYC0tYWdlbnQ9JHtvcHRpb25zLmFnZW50fWApO1xuICAgIH1cbiAgICBjb25zdCBwcm9jID0gc3Bhd24oYG9wZW5jb2RlYCwgYXJncywge1xuICAgICAgICBzaWduYWw6IG9wdGlvbnM/LnNpZ25hbCxcbiAgICAgICAgc3RkaW86IFwiaW5oZXJpdFwiLFxuICAgICAgICBlbnY6IHtcbiAgICAgICAgICAgIC4uLnByb2Nlc3MuZW52LFxuICAgICAgICAgICAgT1BFTkNPREVfQ09ORklHX0NPTlRFTlQ6IEpTT04uc3RyaW5naWZ5KG9wdGlvbnM/LmNvbmZpZyA/PyB7fSksXG4gICAgICAgIH0sXG4gICAgfSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY2xvc2UoKSB7XG4gICAgICAgICAgICBwcm9jLmtpbGwoKTtcbiAgICAgICAgfSxcbiAgICB9O1xufVxuIiwKICAgICJleHBvcnQgKiBmcm9tIFwiLi9jbGllbnQuanNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3NlcnZlci5qc1wiO1xuaW1wb3J0IHsgY3JlYXRlT3BlbmNvZGVDbGllbnQgfSBmcm9tIFwiLi9jbGllbnQuanNcIjtcbmltcG9ydCB7IGNyZWF0ZU9wZW5jb2RlU2VydmVyIH0gZnJvbSBcIi4vc2VydmVyLmpzXCI7XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY3JlYXRlT3BlbmNvZGUob3B0aW9ucykge1xuICAgIGNvbnN0IHNlcnZlciA9IGF3YWl0IGNyZWF0ZU9wZW5jb2RlU2VydmVyKHtcbiAgICAgICAgLi4ub3B0aW9ucyxcbiAgICB9KTtcbiAgICBjb25zdCBjbGllbnQgPSBjcmVhdGVPcGVuY29kZUNsaWVudCh7XG4gICAgICAgIGJhc2VVcmw6IHNlcnZlci51cmwsXG4gICAgfSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY2xpZW50LFxuICAgICAgICBzZXJ2ZXIsXG4gICAgfTtcbn1cbiIsCiAgICAiaW1wb3J0IGZzIGZyb20gXCJub2RlOmZzL3Byb21pc2VzXCI7XG4vKipcbiAqIFN0cnVjdHVyZWQgbG9nZ2luZyBmb3IgYWktZW5nIHJhbHBoXG4gKlxuICogU3VwcG9ydHMgYm90aCBzdGRlcnIgb3V0cHV0ICh3aXRoIC0tcHJpbnQtbG9ncykgYW5kIGZpbGUtYmFzZWQgbG9nZ2luZ1xuICovXG5pbXBvcnQgcGF0aCBmcm9tIFwibm9kZTpwYXRoXCI7XG5cbmV4cG9ydCBuYW1lc3BhY2UgTG9nIHtcbiAgICBleHBvcnQgdHlwZSBMZXZlbCA9IFwiREVCVUdcIiB8IFwiSU5GT1wiIHwgXCJXQVJOXCIgfCBcIkVSUk9SXCI7XG5cbiAgICBjb25zdCBsZXZlbFByaW9yaXR5OiBSZWNvcmQ8TGV2ZWwsIG51bWJlcj4gPSB7XG4gICAgICAgIERFQlVHOiAwLFxuICAgICAgICBJTkZPOiAxLFxuICAgICAgICBXQVJOOiAyLFxuICAgICAgICBFUlJPUjogMyxcbiAgICB9O1xuXG4gICAgbGV0IGN1cnJlbnRMZXZlbDogTGV2ZWwgPSBcIklORk9cIjtcbiAgICBsZXQgbG9nUGF0aCA9IFwiXCI7XG4gICAgbGV0IHdyaXRlOiAobXNnOiBzdHJpbmcpID0+IGFueSA9IChtc2cpID0+IHByb2Nlc3Muc3RkZXJyLndyaXRlKG1zZyk7XG5cbiAgICBmdW5jdGlvbiBzaG91bGRMb2cobGV2ZWw6IExldmVsKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiBsZXZlbFByaW9yaXR5W2xldmVsXSA+PSBsZXZlbFByaW9yaXR5W2N1cnJlbnRMZXZlbF07XG4gICAgfVxuXG4gICAgZXhwb3J0IGludGVyZmFjZSBPcHRpb25zIHtcbiAgICAgICAgcHJpbnQ6IGJvb2xlYW47IC8vIFdoZW4gdHJ1ZSwgd3JpdGUgdG8gc3RkZXJyXG4gICAgICAgIGxldmVsPzogTGV2ZWw7XG4gICAgICAgIGxvZ0Rpcj86IHN0cmluZzsgLy8gRGlyZWN0b3J5IGZvciBsb2cgZmlsZXNcbiAgICB9XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gZmlsZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gbG9nUGF0aDtcbiAgICB9XG5cbiAgICBleHBvcnQgYXN5bmMgZnVuY3Rpb24gaW5pdChvcHRpb25zOiBPcHRpb25zKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGlmIChvcHRpb25zLmxldmVsKSBjdXJyZW50TGV2ZWwgPSBvcHRpb25zLmxldmVsO1xuXG4gICAgICAgIC8vIEJ1aWxkIHRoZSB3cml0ZSBmdW5jdGlvbiB0aGF0IG91dHB1dHMgdG8gQk9USCBzdGRlcnIgQU5EIGZpbGVcbiAgICAgICAgY29uc3Qgc3RkZXJyV3JpdGVyID0gKG1zZzogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICBwcm9jZXNzLnN0ZGVyci53cml0ZShtc2cpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChvcHRpb25zLmxvZ0Rpcikge1xuICAgICAgICAgICAgY29uc3QgdGltZXN0YW1wID0gbmV3IERhdGUoKVxuICAgICAgICAgICAgICAgIC50b0lTT1N0cmluZygpXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoL1s6Ll0vZywgXCItXCIpXG4gICAgICAgICAgICAgICAgLnNsaWNlKDAsIC0xKTtcbiAgICAgICAgICAgIGxvZ1BhdGggPSBwYXRoLmpvaW4ob3B0aW9ucy5sb2dEaXIsIGByYWxwaC0ke3RpbWVzdGFtcH0ubG9nYCk7XG4gICAgICAgICAgICBhd2FpdCBmcy5ta2RpcihvcHRpb25zLmxvZ0RpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG5cbiAgICAgICAgICAgIGNvbnN0IGZpbGUgPSBCdW4uZmlsZShsb2dQYXRoKTtcbiAgICAgICAgICAgIGNvbnN0IGZpbGVXcml0ZXIgPSBmaWxlLndyaXRlcigpO1xuXG4gICAgICAgICAgICAvLyBBbHdheXMgd3JpdGUgdG8gc3RkZXJyIGlmIHByaW50IGlzIGVuYWJsZWRcbiAgICAgICAgICAgIC8vIEFsc28gYWx3YXlzIHdyaXRlIHRvIGZpbGUgaWYgbG9nRGlyIGlzIHByb3ZpZGVkXG4gICAgICAgICAgICB3cml0ZSA9IChtc2cpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5wcmludCkge1xuICAgICAgICAgICAgICAgICAgICBzdGRlcnJXcml0ZXIobXNnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmlsZVdyaXRlci53cml0ZShtc2cpO1xuICAgICAgICAgICAgICAgIGZpbGVXcml0ZXIuZmx1c2goKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5wcmludCkge1xuICAgICAgICAgICAgLy8gT25seSBwcmludCB0byBzdGRlcnJcbiAgICAgICAgICAgIHdyaXRlID0gc3RkZXJyV3JpdGVyO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZXhwb3J0IGludGVyZmFjZSBMb2dnZXIge1xuICAgICAgICBkZWJ1ZyhtZXNzYWdlOiBzdHJpbmcsIGV4dHJhPzogUmVjb3JkPHN0cmluZywgYW55Pik6IHZvaWQ7XG4gICAgICAgIGluZm8obWVzc2FnZTogc3RyaW5nLCBleHRyYT86IFJlY29yZDxzdHJpbmcsIGFueT4pOiB2b2lkO1xuICAgICAgICB3YXJuKG1lc3NhZ2U6IHN0cmluZywgZXh0cmE/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+KTogdm9pZDtcbiAgICAgICAgZXJyb3IobWVzc2FnZTogc3RyaW5nLCBleHRyYT86IFJlY29yZDxzdHJpbmcsIGFueT4pOiB2b2lkO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZvcm1hdEV4dHJhKGV4dHJhPzogUmVjb3JkPHN0cmluZywgYW55Pik6IHN0cmluZyB7XG4gICAgICAgIGlmICghZXh0cmEpIHJldHVybiBcIlwiO1xuICAgICAgICBjb25zdCBleHRyYVN0ciA9IE9iamVjdC5lbnRyaWVzKGV4dHJhKVxuICAgICAgICAgICAgLm1hcChcbiAgICAgICAgICAgICAgICAoW2ssIHZdKSA9PlxuICAgICAgICAgICAgICAgICAgICBgJHtrfT0ke3R5cGVvZiB2ID09PSBcIm9iamVjdFwiID8gSlNPTi5zdHJpbmdpZnkodikgOiB2fWAsXG4gICAgICAgICAgICApXG4gICAgICAgICAgICAuam9pbihcIiBcIik7XG4gICAgICAgIHJldHVybiBleHRyYVN0ciA/IGAgJHtleHRyYVN0cn1gIDogXCJcIjtcbiAgICB9XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gY3JlYXRlKHRhZ3M/OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+KTogTG9nZ2VyIHtcbiAgICAgICAgY29uc3QgdGFnU3RyID0gdGFnc1xuICAgICAgICAgICAgPyBPYmplY3QuZW50cmllcyh0YWdzKVxuICAgICAgICAgICAgICAgICAgLm1hcCgoW2ssIHZdKSA9PiBgJHtrfT0ke3Z9YClcbiAgICAgICAgICAgICAgICAgIC5qb2luKFwiIFwiKVxuICAgICAgICAgICAgOiBcIlwiO1xuICAgICAgICBjb25zdCB0YWdTdHJXaXRoU3BhY2UgPSB0YWdTdHIgPyBgJHt0YWdTdHJ9IGAgOiBcIlwiO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkZWJ1ZyhtZXNzYWdlOiBzdHJpbmcsIGV4dHJhPzogUmVjb3JkPHN0cmluZywgYW55Pikge1xuICAgICAgICAgICAgICAgIGlmIChzaG91bGRMb2coXCJERUJVR1wiKSkge1xuICAgICAgICAgICAgICAgICAgICB3cml0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIGBERUJVRyAke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKX0gJHt0YWdTdHJ9JHttZXNzYWdlfSR7Zm9ybWF0RXh0cmEoZXh0cmEpfVxcbmAsXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGluZm8obWVzc2FnZTogc3RyaW5nLCBleHRyYT86IFJlY29yZDxzdHJpbmcsIGFueT4pIHtcbiAgICAgICAgICAgICAgICBpZiAoc2hvdWxkTG9nKFwiSU5GT1wiKSkge1xuICAgICAgICAgICAgICAgICAgICB3cml0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIGBJTkZPICAke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKX0gJHt0YWdTdHJ9JHttZXNzYWdlfSR7Zm9ybWF0RXh0cmEoZXh0cmEpfVxcbmAsXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHdhcm4obWVzc2FnZTogc3RyaW5nLCBleHRyYT86IFJlY29yZDxzdHJpbmcsIGFueT4pIHtcbiAgICAgICAgICAgICAgICBpZiAoc2hvdWxkTG9nKFwiV0FSTlwiKSkge1xuICAgICAgICAgICAgICAgICAgICB3cml0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIGBXQVJOICAke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKX0gJHt0YWdTdHJ9JHttZXNzYWdlfSR7Zm9ybWF0RXh0cmEoZXh0cmEpfVxcbmAsXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVycm9yKG1lc3NhZ2U6IHN0cmluZywgZXh0cmE/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+KSB7XG4gICAgICAgICAgICAgICAgaWYgKHNob3VsZExvZyhcIkVSUk9SXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHdyaXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgYEVSUk9SICR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpfSAke3RhZ1N0cn0ke21lc3NhZ2V9JHtmb3JtYXRFeHRyYShleHRyYSl9XFxuYCxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGV4cG9ydCBjb25zdCBEZWZhdWx0ID0gY3JlYXRlKHsgc2VydmljZTogXCJyYWxwaFwiIH0pO1xufVxuIiwKICAgICIvKipcbiAqIFJhbHBoIExvb3AgUnVubmVyIC0gQmFzaC1sb29wIHN0eWxlIGl0ZXJhdGlvbiB3aXRoIGZyZXNoIGNvbnRleHQgcGVyIGN5Y2xlXG4gKlxuICogSW1wbGVtZW50cyB0aGUgb3JpZ2luYWwgUmFscGggV2lnZ3VtIHZpc2lvbjpcbiAqIC0gRnJlc2ggT3BlbkNvZGUgc2Vzc2lvbiBwZXIgaXRlcmF0aW9uIChubyB0cmFuc2NyaXB0IGNhcnJ5LW92ZXIpXG4gKiAtIEZpbGUgSS9PIGFzIHN0YXRlICguYWktZW5nL3J1bnMvPHJ1bklkPi8uZmxvdylcbiAqIC0gRGV0ZXJtaW5pc3RpYyByZS1hbmNob3JpbmcgZnJvbSBkaXNrIHN0YXRlIGVhY2ggY3ljbGVcbiAqIC0gTXVsdGktcGhhc2Ugd29ya2Zsb3cgKHJlc2VhcmNoIOKGkiBzcGVjaWZ5IOKGkiBwbGFuIOKGkiB3b3JrIOKGkiByZXZpZXcpXG4gKiAtIFF1YWxpdHkgZ2F0ZXMgdGhhdCBibG9jayB1bnRpbCBwYXNzZWRcbiAqL1xuXG5pbXBvcnQgeyBleGVjU3luYyB9IGZyb20gXCJub2RlOmNoaWxkX3Byb2Nlc3NcIjtcbmltcG9ydCB7IGNyZWF0ZUhhc2ggfSBmcm9tIFwibm9kZTpjcnlwdG9cIjtcbmltcG9ydCB7IHJlYWRGaWxlLCByZWFkZGlyIH0gZnJvbSBcIm5vZGU6ZnMvcHJvbWlzZXNcIjtcbmltcG9ydCB7IGpvaW4sIHBhcnNlIH0gZnJvbSBcIm5vZGU6cGF0aFwiO1xuaW1wb3J0IHsgT3BlbkNvZGVDbGllbnQsIHR5cGUgU2Vzc2lvbiB9IGZyb20gXCIuLi9iYWNrZW5kcy9vcGVuY29kZS9jbGllbnRcIjtcbmltcG9ydCB0eXBlIHsgUmFscGhGbGFncyB9IGZyb20gXCIuLi9jbGkvZmxhZ3NcIjtcbmltcG9ydCB7IFVJIH0gZnJvbSBcIi4uL2NsaS91aVwiO1xuaW1wb3J0IHR5cGUgeyBBaUVuZ0NvbmZpZywgR2F0ZUNvbW1hbmRDb25maWcgfSBmcm9tIFwiLi4vY29uZmlnL3NjaGVtYVwiO1xuaW1wb3J0IHsgUHJvbXB0T3B0aW1pemVyIH0gZnJvbSBcIi4uL3Byb21wdC1vcHRpbWl6YXRpb24vb3B0aW1pemVyXCI7XG5pbXBvcnQgdHlwZSB7IERpc2NvcmRXZWJob29rQ2xpZW50IH0gZnJvbSBcIi4uL3V0aWwvZGlzY29yZC13ZWJob29rXCI7XG5pbXBvcnQgeyBjcmVhdGVEaXNjb3JkV2ViaG9va0Zyb21FbnYgfSBmcm9tIFwiLi4vdXRpbC9kaXNjb3JkLXdlYmhvb2tcIjtcbmltcG9ydCB7IExvZyB9IGZyb20gXCIuLi91dGlsL2xvZ1wiO1xuaW1wb3J0IHsgRmxvd1N0b3JlLCB0eXBlIEZsb3dTdG9yZU9wdGlvbnMgfSBmcm9tIFwiLi9mbG93LXN0b3JlXCI7XG5pbXBvcnQgdHlwZSB7XG4gICAgQ3ljbGVTdGF0ZSxcbiAgICBHYXRlUmVzdWx0LFxuICAgIExvb3BDb25maWcsXG4gICAgVG9vbEludm9jYXRpb24sXG59IGZyb20gXCIuL2Zsb3ctdHlwZXNcIjtcbmltcG9ydCB7XG4gICAgRkxPV19TQ0hFTUFfVkVSU0lPTixcbiAgICBQaGFzZSxcbiAgICBSdW5TdGF0dXMsXG4gICAgU3RvcFJlYXNvbixcbn0gZnJvbSBcIi4vZmxvdy10eXBlc1wiO1xuXG5jb25zdCBsb2cgPSBMb2cuY3JlYXRlKHsgc2VydmljZTogXCJyYWxwaC1sb29wXCIgfSk7XG5cbi8qKiBEZWZhdWx0IHF1YWxpdHkgZ2F0ZXMgKi9cbmNvbnN0IERFRkFVTFRfR0FURVMgPSBbXCJ0ZXN0XCIsIFwibGludFwiLCBcImFjY2VwdGFuY2VcIl07XG5cbi8qKiBEZWZhdWx0IG1heCBjeWNsZXMgKi9cbmNvbnN0IERFRkFVTFRfTUFYX0NZQ0xFUyA9IDUwO1xuXG4vKiogRGVmYXVsdCBzdHVjayB0aHJlc2hvbGQgKi9cbmNvbnN0IERFRkFVTFRfU1RVQ0tfVEhSRVNIT0xEID0gNTtcblxuLyoqIERlZmF1bHQgY2hlY2twb2ludCBmcmVxdWVuY3kgKi9cbmNvbnN0IERFRkFVTFRfQ0hFQ0tQT0lOVF9GUkVRVUVOQ1kgPSAxO1xuXG4vKiogRGVmYXVsdCBjeWNsZSByZXRyaWVzICovXG5jb25zdCBERUZBVUxUX0NZQ0xFX1JFVFJJRVMgPSAyO1xuXG4vKiogU2VjcmV0cyBwYXR0ZXJucyB0byByZWRhY3QgaW4gZGVidWcgb3V0cHV0ICovXG5jb25zdCBTRUNSRVRfUEFUVEVSTlMgPSBbXG4gICAgL2FwaVtfLV0/a2V5L2ksXG4gICAgL3Rva2VuL2ksXG4gICAgL3NlY3JldC9pLFxuICAgIC9wYXNzd29yZC9pLFxuICAgIC9jcmVkZW50aWFsL2ksXG4gICAgL3dlYmhvb2svaSxcbiAgICAvYXV0aC9pLFxuICAgIC9iZWFyZXIvaSxcbiAgICAvcHJpdmF0ZVtfLV0/a2V5L2ksXG5dO1xuXG4vKipcbiAqIFJlZGFjdCBzZWNyZXRzIGZyb20gYSBzdHJpbmdcbiAqL1xuZnVuY3Rpb24gcmVkYWN0U2VjcmV0cyh0ZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgbGV0IHJlc3VsdCA9IHRleHQ7XG4gICAgZm9yIChjb25zdCBwYXR0ZXJuIG9mIFNFQ1JFVF9QQVRURVJOUykge1xuICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShcbiAgICAgICAgICAgIG5ldyBSZWdFeHAoXG4gICAgICAgICAgICAgICAgYCR7cGF0dGVybi5zb3VyY2V9W1wiJ10/XFxcXHMqWzo9XVxcXFxzKltcIiddPyhbXlwiJ1wiLFxcXFxzXSspYCxcbiAgICAgICAgICAgICAgICBcImdpXCIsXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgYCR7cGF0dGVybi5zb3VyY2V9PVwiW1JFREFDVEVEXVwiYCxcbiAgICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBUcnVuY2F0ZSBsb25nIG91dHB1dCBmb3IgbG9nZ2luZ1xuICovXG5mdW5jdGlvbiB0cnVuY2F0ZU91dHB1dCh0ZXh0OiBzdHJpbmcsIG1heExlbmd0aCA9IDEwMDApOiBzdHJpbmcge1xuICAgIGlmICh0ZXh0Lmxlbmd0aCA8PSBtYXhMZW5ndGgpIHJldHVybiB0ZXh0O1xuICAgIHJldHVybiBgJHt0ZXh0LnN1YnN0cmluZygwLCBtYXhMZW5ndGgpfVxcbi4uLiBbdHJ1bmNhdGVkICR7dGV4dC5sZW5ndGggLSBtYXhMZW5ndGh9IGNoYXJzXWA7XG59XG5cbi8qKlxuICogUmFscGggTG9vcCBSdW5uZXIgLSBvcmNoZXN0cmF0ZXMgaXRlcmF0aW9uIGxvb3BzIHdpdGggZnJlc2ggc2Vzc2lvbnNcbiAqL1xuZXhwb3J0IGNsYXNzIFJhbHBoTG9vcFJ1bm5lciB7XG4gICAgcHJpdmF0ZSBjb25maWc6IExvb3BDb25maWc7XG4gICAgcHJpdmF0ZSBmbG93U3RvcmU6IEZsb3dTdG9yZTtcbiAgICBwcml2YXRlIGZsYWdzOiBSYWxwaEZsYWdzO1xuICAgIHByaXZhdGUgYmFzZUNvbmZpZzogQWlFbmdDb25maWc7XG4gICAgcHJpdmF0ZSBvcHRpbWl6ZXI6IFByb21wdE9wdGltaXplcjtcbiAgICBwcml2YXRlIGRpc2NvcmRXZWJob29rOiBEaXNjb3JkV2ViaG9va0NsaWVudCB8IG51bGw7XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgZmxhZ3M6IFJhbHBoRmxhZ3MsXG4gICAgICAgIGJhc2VDb25maWc6IEFpRW5nQ29uZmlnLFxuICAgICAgICBvcHRpbWl6ZXI6IFByb21wdE9wdGltaXplcixcbiAgICApIHtcbiAgICAgICAgdGhpcy5mbGFncyA9IGZsYWdzO1xuICAgICAgICB0aGlzLmJhc2VDb25maWcgPSBiYXNlQ29uZmlnO1xuICAgICAgICB0aGlzLm9wdGltaXplciA9IG9wdGltaXplcjtcblxuICAgICAgICAvLyBCdWlsZCBsb29wIGNvbmZpZyBmcm9tIGZsYWdzXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5idWlsZExvb3BDb25maWcoKTtcbiAgICAgICAgY29uc3QgZmxvd1N0b3JlT3B0aW9uczogRmxvd1N0b3JlT3B0aW9ucyA9IHtcbiAgICAgICAgICAgIGZsb3dEaXI6IHRoaXMuY29uZmlnLmZsb3dEaXIsXG4gICAgICAgICAgICBydW5JZDogdGhpcy5jb25maWcucnVuSWQsXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZmxvd1N0b3JlID0gbmV3IEZsb3dTdG9yZShmbG93U3RvcmVPcHRpb25zKTtcblxuICAgICAgICAvLyBJbml0aWFsaXplIERpc2NvcmQgd2ViaG9vayBmcm9tIGVudmlyb25tZW50XG4gICAgICAgIHRoaXMuZGlzY29yZFdlYmhvb2sgPSBjcmVhdGVEaXNjb3JkV2ViaG9va0Zyb21FbnYoKTtcbiAgICB9XG5cbiAgICAvKiogQnVpbGQgbG9vcCBjb25maWcgZnJvbSBmbGFncyAqL1xuICAgIHByaXZhdGUgYnVpbGRMb29wQ29uZmlnKCk6IExvb3BDb25maWcge1xuICAgICAgICAvLyBEZXRlcm1pbmUgY29tcGxldGlvbiBwcm9taXNlIGJhc2VkIG9uIG1vZGVcbiAgICAgICAgbGV0IGNvbXBsZXRpb25Qcm9taXNlID0gdGhpcy5mbGFncy5jb21wbGV0aW9uUHJvbWlzZSA/PyBcIlwiO1xuXG4gICAgICAgIGlmICh0aGlzLmZsYWdzLnNoaXApIHtcbiAgICAgICAgICAgIC8vIFNoaXAgbW9kZTogYXV0by1leGl0IHdoZW4gYWdlbnQgb3V0cHV0cyBTSElQXG4gICAgICAgICAgICBjb21wbGV0aW9uUHJvbWlzZSA9IFwiPHByb21pc2U+U0hJUDwvcHJvbWlzZT5cIjtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmZsYWdzLmRyYWZ0KSB7XG4gICAgICAgICAgICAvLyBEcmFmdCBtb2RlOiBydW4gZm9yIG1heC1jeWNsZXMsIHN0b3AgZm9yIHJldmlldyAobm8gYXV0by1leGl0KVxuICAgICAgICAgICAgY29tcGxldGlvblByb21pc2UgPSBcIlwiO1xuICAgICAgICB9IGVsc2UgaWYgKCFjb21wbGV0aW9uUHJvbWlzZSkge1xuICAgICAgICAgICAgLy8gTm8gZmxhZyBzcGVjaWZpZWQgYW5kIG5vIGNvbXBsZXRpb24gcHJvbWlzZTogZGVmYXVsdCB0byBkcmFmdCBtb2RlXG4gICAgICAgICAgICBjb21wbGV0aW9uUHJvbWlzZSA9IFwiXCI7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBHZW5lcmF0ZSBydW4gSUQgaWYgbm90IHJlc3VtaW5nXG4gICAgICAgIGxldCBydW5JZCA9IHRoaXMuZmxhZ3MucnVuSWQ7XG4gICAgICAgIGlmICghcnVuSWQpIHtcbiAgICAgICAgICAgIC8vIENoZWNrIGZvciBleGlzdGluZyBmbG93IHN0YXRlXG4gICAgICAgICAgICBjb25zdCBkZWZhdWx0UnVuSWQgPSB0aGlzLmdlbmVyYXRlUnVuSWQoKTtcbiAgICAgICAgICAgIGNvbnN0IGRlZmF1bHRGbG93RGlyID0gdGhpcy5nZXREZWZhdWx0Rmxvd0RpcihkZWZhdWx0UnVuSWQpO1xuICAgICAgICAgICAgY29uc3QgY2hlY2tTdG9yZSA9IG5ldyBGbG93U3RvcmUoe1xuICAgICAgICAgICAgICAgIGZsb3dEaXI6IHRoaXMuZmxhZ3Mud29ya2luZ0RpclxuICAgICAgICAgICAgICAgICAgICA/IGpvaW4odGhpcy5mbGFncy53b3JraW5nRGlyLCBcIi5haS1lbmdcIilcbiAgICAgICAgICAgICAgICAgICAgOiBcIi5haS1lbmdcIixcbiAgICAgICAgICAgICAgICBydW5JZDogZGVmYXVsdFJ1bklkLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBydW5JZCA9IGRlZmF1bHRSdW5JZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBydW5JZCxcbiAgICAgICAgICAgIHByb21wdDogdGhpcy5mbGFncy53b3JrZmxvdyA/PyBcIlwiLFxuICAgICAgICAgICAgY29tcGxldGlvblByb21pc2UsXG4gICAgICAgICAgICBtYXhDeWNsZXM6IHRoaXMuZmxhZ3MubWF4Q3ljbGVzID8/IERFRkFVTFRfTUFYX0NZQ0xFUyxcbiAgICAgICAgICAgIHN0dWNrVGhyZXNob2xkOlxuICAgICAgICAgICAgICAgIHRoaXMuZmxhZ3Muc3R1Y2tUaHJlc2hvbGQgPz8gREVGQVVMVF9TVFVDS19USFJFU0hPTEQsXG4gICAgICAgICAgICBnYXRlczogdGhpcy5mbGFncy5nYXRlcyA/PyBERUZBVUxUX0dBVEVTLFxuICAgICAgICAgICAgY2hlY2twb2ludEZyZXF1ZW5jeTpcbiAgICAgICAgICAgICAgICB0aGlzLmZsYWdzLmNoZWNrcG9pbnRGcmVxdWVuY3kgPz8gREVGQVVMVF9DSEVDS1BPSU5UX0ZSRVFVRU5DWSxcbiAgICAgICAgICAgIGZsb3dEaXI6IHRoaXMuZ2V0RGVmYXVsdEZsb3dEaXIocnVuSWQpLFxuICAgICAgICAgICAgZHJ5UnVuOiB0aGlzLmZsYWdzLmRyeVJ1biA/PyBmYWxzZSxcbiAgICAgICAgICAgIGN5Y2xlUmV0cmllczpcbiAgICAgICAgICAgICAgICB0aGlzLmJhc2VDb25maWcubG9vcD8uY3ljbGVSZXRyaWVzID8/IERFRkFVTFRfQ1lDTEVfUkVUUklFUyxcbiAgICAgICAgICAgIGRlYnVnV29yazpcbiAgICAgICAgICAgICAgICB0aGlzLmZsYWdzLmRlYnVnV29yayA/PyB0aGlzLmJhc2VDb25maWcuZGVidWc/LndvcmsgPz8gZmFsc2UsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqIEdldCBkZWZhdWx0IGZsb3cgZGlyZWN0b3J5IHBhdGggKi9cbiAgICBwcml2YXRlIGdldERlZmF1bHRGbG93RGlyKHJ1bklkOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBhcnRpZmFjdHNEaXIgPSB0aGlzLmJhc2VDb25maWcucnVubmVyLmFydGlmYWN0c0RpcjtcbiAgICAgICAgaWYgKHRoaXMuZmxhZ3Mud29ya2luZ0Rpcikge1xuICAgICAgICAgICAgcmV0dXJuIGpvaW4odGhpcy5mbGFncy53b3JraW5nRGlyLCBhcnRpZmFjdHNEaXIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBqb2luKHByb2Nlc3MuY3dkKCksIGFydGlmYWN0c0Rpcik7XG4gICAgfVxuXG4gICAgLyoqIEdlbmVyYXRlIGEgdW5pcXVlIHJ1biBJRCAqL1xuICAgIHByaXZhdGUgZ2VuZXJhdGVSdW5JZCgpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCB0aW1lc3RhbXAgPSBEYXRlLm5vdygpLnRvU3RyaW5nKDM2KTtcbiAgICAgICAgY29uc3QgcmFuZG9tID0gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDIsIDgpO1xuICAgICAgICByZXR1cm4gYHJ1bi0ke3RpbWVzdGFtcH0tJHtyYW5kb219YDtcbiAgICB9XG5cbiAgICAvKiogR2VuZXJhdGUgYSBoYXNoIG9mIG91dHB1dCBmb3Igc3R1Y2sgZGV0ZWN0aW9uICovXG4gICAgcHJpdmF0ZSBoYXNoT3V0cHV0KG91dHB1dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUhhc2goXCJzaGEyNTZcIilcbiAgICAgICAgICAgIC51cGRhdGUob3V0cHV0KVxuICAgICAgICAgICAgLmRpZ2VzdChcImhleFwiKVxuICAgICAgICAgICAgLnN1YnN0cmluZygwLCAxNik7XG4gICAgfVxuXG4gICAgLyoqIFJ1biB0aGUgbG9vcCAqL1xuICAgIGFzeW5jIHJ1bigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgVUkuaGVhZGVyKFwiUmFscGggTG9vcCBSdW5uZXJcIik7XG5cbiAgICAgICAgLy8gQ2hlY2sgZm9yIHJlc3VtZVxuICAgICAgICBpZiAodGhpcy5mbGFncy5yZXN1bWUpIHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucmVzdW1lKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTdGFydCBmcmVzaCBydW5cbiAgICAgICAgYXdhaXQgdGhpcy5zdGFydEZyZXNoKCk7XG4gICAgfVxuXG4gICAgLyoqIFN0YXJ0IGEgZnJlc2ggcnVuICovXG4gICAgcHJpdmF0ZSBhc3luYyBzdGFydEZyZXNoKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBsb2cuaW5mbyhcIlN0YXJ0aW5nIGZyZXNoIFJhbHBoIGxvb3BcIiwge1xuICAgICAgICAgICAgcnVuSWQ6IHRoaXMuY29uZmlnLnJ1bklkLFxuICAgICAgICAgICAgcHJvbXB0OiB0aGlzLmNvbmZpZy5wcm9tcHQuc3Vic3RyaW5nKDAsIDEwMCksXG4gICAgICAgICAgICBjb21wbGV0aW9uUHJvbWlzZTogdGhpcy5jb25maWcuY29tcGxldGlvblByb21pc2UsXG4gICAgICAgICAgICBtYXhDeWNsZXM6IHRoaXMuY29uZmlnLm1heEN5Y2xlcyxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBmbG93IHN0b3JlXG4gICAgICAgIHRoaXMuZmxvd1N0b3JlLmluaXRpYWxpemUoKTtcblxuICAgICAgICAvLyBDcmVhdGUgaW5pdGlhbCBzdGF0ZVxuICAgICAgICBjb25zdCBpbml0aWFsU3RhdGUgPSB0aGlzLmZsb3dTdG9yZS5jcmVhdGVJbml0aWFsU3RhdGUoe1xuICAgICAgICAgICAgcHJvbXB0OiB0aGlzLmNvbmZpZy5wcm9tcHQsXG4gICAgICAgICAgICBjb21wbGV0aW9uUHJvbWlzZTogdGhpcy5jb25maWcuY29tcGxldGlvblByb21pc2UsXG4gICAgICAgICAgICBtYXhDeWNsZXM6IHRoaXMuY29uZmlnLm1heEN5Y2xlcyxcbiAgICAgICAgICAgIHN0dWNrVGhyZXNob2xkOiB0aGlzLmNvbmZpZy5zdHVja1RocmVzaG9sZCxcbiAgICAgICAgICAgIGdhdGVzOiB0aGlzLmNvbmZpZy5nYXRlcyxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gVXBkYXRlIHN0YXR1cyB0byBydW5uaW5nXG4gICAgICAgIHRoaXMuZmxvd1N0b3JlLnVwZGF0ZVN0YXR1cyhSdW5TdGF0dXMuUlVOTklORyk7XG5cbiAgICAgICAgLy8gUnVuIHRoZSBsb29wXG4gICAgICAgIGF3YWl0IHRoaXMucnVuTG9vcCgpO1xuICAgIH1cblxuICAgIC8qKiBSZXN1bWUgZnJvbSBwcmV2aW91cyBydW4gKi9cbiAgICBwcml2YXRlIGFzeW5jIHJlc3VtZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgbG9nLmluZm8oXCJSZXN1bWluZyBSYWxwaCBsb29wXCIsIHsgcnVuSWQ6IHRoaXMuY29uZmlnLnJ1bklkIH0pO1xuXG4gICAgICAgIGNvbnN0IHN0YXRlID0gdGhpcy5mbG93U3RvcmUubG9hZCgpO1xuICAgICAgICBpZiAoIXN0YXRlKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgYE5vIGZsb3cgc3RhdGUgZm91bmQgZm9yIHJ1biBJRDogJHt0aGlzLmNvbmZpZy5ydW5JZH0uIENhbm5vdCByZXN1bWUuYCxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc3RhdGUuc3RhdHVzID09PSBSdW5TdGF0dXMuQ09NUExFVEVEKSB7XG4gICAgICAgICAgICBVSS53YXJuKFwiVGhpcyBydW4gaGFzIGFscmVhZHkgY29tcGxldGVkLlwiKTtcbiAgICAgICAgICAgIFVJLmluZm8oYFN0b3AgcmVhc29uOiAke3N0YXRlLnN0b3BSZWFzb259YCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc3RhdGUuc3RhdHVzID09PSBSdW5TdGF0dXMuRkFJTEVEKSB7XG4gICAgICAgICAgICBVSS53YXJuKFwiVGhpcyBydW4gcHJldmlvdXNseSBmYWlsZWQuXCIpO1xuICAgICAgICAgICAgVUkuaW5mbyhgRXJyb3I6ICR7c3RhdGUuZXJyb3J9YCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZXN1bWUgdGhlIGxvb3BcbiAgICAgICAgYXdhaXQgdGhpcy5ydW5Mb29wKCk7XG4gICAgfVxuXG4gICAgLyoqIE1haW4gbG9vcCBleGVjdXRpb24gKi9cbiAgICBwcml2YXRlIGFzeW5jIHJ1bkxvb3AoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGNvbnN0IHN0YXRlID0gdGhpcy5mbG93U3RvcmUubG9hZCgpO1xuICAgICAgICBpZiAoIXN0YXRlKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBmbG93IHN0YXRlIGZvdW5kXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgVUkuaW5mbyhgUnVuIElEOiAke3RoaXMuY29uZmlnLnJ1bklkfWApO1xuICAgICAgICBVSS5pbmZvKGBGbG93IGRpcmVjdG9yeTogJHt0aGlzLmZsb3dTdG9yZS5iYXNlUGF0aH1gKTtcbiAgICAgICAgVUkuaW5mbyhcbiAgICAgICAgICAgIGBDb21wbGV0aW9uIHByb21pc2U6ICR7dGhpcy5jb25maWcuY29tcGxldGlvblByb21pc2UgfHwgXCIobm9uZSlcIn1gLFxuICAgICAgICApO1xuICAgICAgICBVSS5pbmZvKGBNYXggY3ljbGVzOiAke3RoaXMuY29uZmlnLm1heEN5Y2xlc31gKTtcbiAgICAgICAgVUkuaW5mbyhgQ3ljbGUgcmV0cmllczogJHt0aGlzLmNvbmZpZy5jeWNsZVJldHJpZXN9YCk7XG4gICAgICAgIFVJLmluZm8oYFN0dWNrIHRocmVzaG9sZDogJHt0aGlzLmNvbmZpZy5zdHVja1RocmVzaG9sZH1gKTtcbiAgICAgICAgVUkuaW5mbyhcbiAgICAgICAgICAgIGBEZWJ1ZyB3b3JrOiAke3RoaXMuY29uZmlnLmRlYnVnV29yayA/IFwiZW5hYmxlZFwiIDogXCJkaXNhYmxlZFwifWAsXG4gICAgICAgICk7XG4gICAgICAgIFVJLnByaW50bG4oKTtcblxuICAgICAgICAvLyBDaGVjayBpZiB3ZSBzaG91bGQgc2tpcCBvcHRpbWl6YXRpb24gKGFscmVhZHkgZG9uZSBvbiBpbml0aWFsIGluZ2VzdClcbiAgICAgICAgLy8gRm9yIGxvb3AgbW9kZSwgd2Ugc2tpcCByZS1vcHRpbWl6YXRpb24gZWFjaCBjeWNsZVxuXG4gICAgICAgIC8vIFJ1biBjeWNsZXNcbiAgICAgICAgZm9yIChcbiAgICAgICAgICAgIGxldCBjeWNsZU51bWJlciA9IHN0YXRlLmN1cnJlbnRDeWNsZSArIDE7XG4gICAgICAgICAgICBjeWNsZU51bWJlciA8PSB0aGlzLmNvbmZpZy5tYXhDeWNsZXM7XG4gICAgICAgICAgICBjeWNsZU51bWJlcisrXG4gICAgICAgICkge1xuICAgICAgICAgICAgVUkuaGVhZGVyKGBDeWNsZSAke2N5Y2xlTnVtYmVyfS8ke3RoaXMuY29uZmlnLm1heEN5Y2xlc31gKTtcblxuICAgICAgICAgICAgLy8gTm90aWZ5IERpc2NvcmQ6IGN5Y2xlIHN0YXJ0ZWRcbiAgICAgICAgICAgIGNvbnN0IHJ1blN0YXJ0VGltZSA9IERhdGUubm93KCk7XG4gICAgICAgICAgICB0aGlzLmRpc2NvcmRXZWJob29rPy5ub3RpZnlDeWNsZVN0YXJ0KFxuICAgICAgICAgICAgICAgIGN5Y2xlTnVtYmVyLFxuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLm1heEN5Y2xlcyxcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5wcm9tcHQsXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAvLyBFeGVjdXRlIGN5Y2xlIHdpdGggcmV0cnkgbG9naWNcbiAgICAgICAgICAgIGxldCBhdHRlbXB0ID0gMDtcbiAgICAgICAgICAgIGxldCByZXN1bHQ6IHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBib29sZWFuO1xuICAgICAgICAgICAgICAgIGN5Y2xlU3RhdGU6IEN5Y2xlU3RhdGU7XG4gICAgICAgICAgICAgICAgc3VtbWFyeTogc3RyaW5nO1xuICAgICAgICAgICAgICAgIHN0b3BSZWFzb24/OiBTdG9wUmVhc29uO1xuICAgICAgICAgICAgfSB8IG51bGwgPSBudWxsO1xuICAgICAgICAgICAgbGV0IGxhc3RFcnJvcjogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG5cbiAgICAgICAgICAgIHdoaWxlIChhdHRlbXB0IDw9IHRoaXMuY29uZmlnLmN5Y2xlUmV0cmllcykge1xuICAgICAgICAgICAgICAgIGF0dGVtcHQrKztcbiAgICAgICAgICAgICAgICBjb25zdCBpc1JldHJ5ID0gYXR0ZW1wdCA+IDE7XG5cbiAgICAgICAgICAgICAgICBpZiAoaXNSZXRyeSkge1xuICAgICAgICAgICAgICAgICAgICBVSS5pbmZvKFxuICAgICAgICAgICAgICAgICAgICAgICAgYFJldHJ5IGF0dGVtcHQgJHthdHRlbXB0fS8ke3RoaXMuY29uZmlnLmN5Y2xlUmV0cmllcyArIDF9YCxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgbG9nLmluZm8oXCJSZXRyeWluZyBjeWNsZVwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjeWNsZU51bWJlcixcbiAgICAgICAgICAgICAgICAgICAgICAgIGF0dGVtcHQsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0RXJyb3IsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBmcmVzaCBPcGVuQ29kZSBzZXNzaW9uIGZvciB0aGlzIGN5Y2xlXG4gICAgICAgICAgICAgICAgY29uc3QgY2xpZW50ID0gYXdhaXQgT3BlbkNvZGVDbGllbnQuY3JlYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgc2VydmVyU3RhcnR1cFRpbWVvdXQ6IDEwMDAwLFxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gUmUtYW5jaG9yIGNvbnRleHQgZnJvbSBkaXNrICh3aXRoIHJldHJ5IGZhaWx1cmUgaW5qZWN0ZWQgaWYgdGhpcyBpcyBhIHJldHJ5KVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb250ZXh0ID0gYXdhaXQgdGhpcy5idWlsZFJlQW5jaG9yZWRDb250ZXh0KFxuICAgICAgICAgICAgICAgICAgICAgICAgY3ljbGVOdW1iZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICBpc1JldHJ5ID8gKGxhc3RFcnJvciA/PyB1bmRlZmluZWQpIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIEV4ZWN1dGUgdGhlIGN5Y2xlIHdpdGggZnJlc2ggc2Vzc2lvblxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBhd2FpdCB0aGlzLmV4ZWN1dGVDeWNsZShcbiAgICAgICAgICAgICAgICAgICAgICAgIGN5Y2xlTnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xpZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBSZWNvcmQgdGhlIGN5Y2xlXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mbG93U3RvcmUucmVjb3JkU3VjY2Vzc2Z1bEN5Y2xlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5jeWNsZVN0YXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5zdW1tYXJ5LFxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gTm90aWZ5IERpc2NvcmQ6IGN5Y2xlIGNvbXBsZXRlZFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZHVyYXRpb25NcyA9IERhdGUubm93KCkgLSBydW5TdGFydFRpbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc2NvcmRXZWJob29rPy5ub3RpZnlDeWNsZUNvbXBsZXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN5Y2xlTnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZmxvd1N0b3JlLmxvYWQoKT8uY29tcGxldGVkQ3ljbGVzID8/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN5Y2xlTnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5zdW1tYXJ5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uTXMsXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mbG93U3RvcmUucmVjb3JkRmFpbGVkQ3ljbGUocmVzdWx0LmN5Y2xlU3RhdGUpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBOb3RpZnkgRGlzY29yZDogY3ljbGUgZmFpbGVkXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc2NvcmRXZWJob29rPy5ub3RpZnlFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjeWNsZU51bWJlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQuY3ljbGVTdGF0ZS5waGFzZXNbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LmN5Y2xlU3RhdGUucGhhc2VzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApLnBvcCgpIGFzIGtleW9mIHR5cGVvZiByZXN1bHQuY3ljbGVTdGF0ZS5waGFzZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdPy5waGFzZSA/PyBcInVua25vd25cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQuY3ljbGVTdGF0ZS5lcnJvciA/PyBcIlVua25vd24gZXJyb3JcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyBCcmVhayByZXRyeSBsb29wIG9uIHN1Y2Nlc3Mgb3Igbm9uLXJldHJ5YWJsZSBmYWlsdXJlXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyBEZXRlcm1pbmUgaWYgd2Ugc2hvdWxkIHJldHJ5IHRoaXMgZmFpbHVyZVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzaG91bGRSZXRyeSA9IHRoaXMuc2hvdWxkUmV0cnlGYWlsdXJlKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghc2hvdWxkUmV0cnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgbGFzdEVycm9yID0gcmVzdWx0LnN1bW1hcnk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNc2cgPVxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICBsYXN0RXJyb3IgPSBlcnJvck1zZztcblxuICAgICAgICAgICAgICAgICAgICAvLyBDaGVjayBpZiB3ZSBzaG91bGQgcmV0cnkgdGhpcyBlcnJvclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzaG91bGRSZXRyeSA9IHRoaXMuc2hvdWxkUmV0cnlPbkVycm9yKGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNob3VsZFJldHJ5ICYmIGF0dGVtcHQgPD0gdGhpcy5jb25maWcuY3ljbGVSZXRyaWVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2cud2FybihcIkN5Y2xlIGVycm9yLCB3aWxsIHJldHJ5XCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjeWNsZU51bWJlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdHRlbXB0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvck1zZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gTm9uLXJldHJ5YWJsZSBvciBtYXggcmV0cmllcyBleGNlZWRlZFxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICAvLyBDbGVhbiB1cCB0aGUgc2Vzc2lvbiBmb3IgdGhpcyBjeWNsZVxuICAgICAgICAgICAgICAgICAgICBhd2FpdCBjbGllbnQuY2xlYW51cCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gSWYgcmVzdWx0IGlzIG51bGwgYWZ0ZXIgYWxsIHJldHJpZXMsIHdlIGhhZCBhIGNhdGFzdHJvcGhpYyBmYWlsdXJlXG4gICAgICAgICAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGlzY29yZFdlYmhvb2s/Lm5vdGlmeVN0dWNrT3JBYm9ydGVkKFxuICAgICAgICAgICAgICAgICAgICBjeWNsZU51bWJlcixcbiAgICAgICAgICAgICAgICAgICAgXCJGQUlMRURfQUxMX1JFVFJJRVNcIixcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuaGFuZGxlU3RvcChcbiAgICAgICAgICAgICAgICAgICAgU3RvcFJlYXNvbi5FUlJPUixcbiAgICAgICAgICAgICAgICAgICAgYEN5Y2xlICR7Y3ljbGVOdW1iZXJ9IGZhaWxlZCBhZnRlciAke3RoaXMuY29uZmlnLmN5Y2xlUmV0cmllcyArIDF9IGF0dGVtcHRzOiAke2xhc3RFcnJvciA/PyBcInVua25vd24gZXJyb3JcIn1gLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDaGVjayBzdG9wIGNvbmRpdGlvbnNcbiAgICAgICAgICAgIGlmIChyZXN1bHQuc3RvcFJlYXNvbikge1xuICAgICAgICAgICAgICAgIC8vIE5vdGlmeSBEaXNjb3JkOiBydW4gc3RvcHBlZFxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuaGFuZGxlU3RvcChyZXN1bHQuc3RvcFJlYXNvbiwgcmVzdWx0LnN1bW1hcnkpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgc3R1Y2tcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRTdGF0ZSA9IHRoaXMuZmxvd1N0b3JlLmxvYWQoKTtcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICBjdXJyZW50U3RhdGUgJiZcbiAgICAgICAgICAgICAgICBjdXJyZW50U3RhdGUuc3R1Y2tDb3VudCA+PSB0aGlzLmNvbmZpZy5zdHVja1RocmVzaG9sZFxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgLy8gTm90aWZ5IERpc2NvcmQ6IHN0dWNrXG4gICAgICAgICAgICAgICAgdGhpcy5kaXNjb3JkV2ViaG9vaz8ubm90aWZ5U3R1Y2tPckFib3J0ZWQoY3ljbGVOdW1iZXIsIFwiU1RVQ0tcIik7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5oYW5kbGVTdG9wKFxuICAgICAgICAgICAgICAgICAgICBTdG9wUmVhc29uLlNUVUNLLFxuICAgICAgICAgICAgICAgICAgICBgTm8gcHJvZ3Jlc3MgZm9yICR7dGhpcy5jb25maWcuc3R1Y2tUaHJlc2hvbGR9IGNvbnNlY3V0aXZlIGN5Y2xlc2AsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFNhdmUgY2hlY2twb2ludCBpZiBuZWVkZWRcbiAgICAgICAgICAgIGlmIChjeWNsZU51bWJlciAlIHRoaXMuY29uZmlnLmNoZWNrcG9pbnRGcmVxdWVuY3kgPT09IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZsb3dTdG9yZS5zYXZlQ2hlY2twb2ludChcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5mbG93U3RvcmUubG9hZCgpISxcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LmN5Y2xlU3RhdGUucGhhc2VzLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIFVJLnByaW50bG4oKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE1heCBjeWNsZXMgcmVhY2hlZCAtIG5vdGlmeSBEaXNjb3JkXG4gICAgICAgIHRoaXMuZGlzY29yZFdlYmhvb2s/Lm5vdGlmeVJ1bkNvbXBsZXRlKFxuICAgICAgICAgICAgc3RhdGUuY29tcGxldGVkQ3ljbGVzLFxuICAgICAgICAgICAgRGF0ZS5ub3coKSAtIG5ldyBEYXRlKHN0YXRlLmNyZWF0ZWRBdCkuZ2V0VGltZSgpLFxuICAgICAgICAgICAgYENvbXBsZXRlZCAke3N0YXRlLmNvbXBsZXRlZEN5Y2xlc30gY3ljbGVzIChtYXggJHt0aGlzLmNvbmZpZy5tYXhDeWNsZXN9KWAsXG4gICAgICAgICk7XG4gICAgICAgIGF3YWl0IHRoaXMuaGFuZGxlU3RvcChTdG9wUmVhc29uLk1BWF9DWUNMRVMsIFwiTWF4aW11bSBjeWNsZXMgcmVhY2hlZFwiKTtcbiAgICB9XG5cbiAgICAvKiogRGV0ZXJtaW5lIGlmIGEgZmFpbHVyZSBzaG91bGQgdHJpZ2dlciBhIHJldHJ5ICovXG4gICAgcHJpdmF0ZSBzaG91bGRSZXRyeUZhaWx1cmUocmVzdWx0OiB7XG4gICAgICAgIHN1Y2Nlc3M6IGJvb2xlYW47XG4gICAgICAgIGN5Y2xlU3RhdGU6IEN5Y2xlU3RhdGU7XG4gICAgICAgIHN1bW1hcnk6IHN0cmluZztcbiAgICB9KTogYm9vbGVhbiB7XG4gICAgICAgIC8vIENoZWNrIGZvciBnYXRlIGZhaWx1cmVzXG4gICAgICAgIGNvbnN0IGZhaWxlZEdhdGVzID0gcmVzdWx0LmN5Y2xlU3RhdGUuZ2F0ZVJlc3VsdHMuZmlsdGVyKFxuICAgICAgICAgICAgKGcpID0+ICFnLnBhc3NlZCxcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKGZhaWxlZEdhdGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2hlY2sgZm9yIGVtcHR5IHdvcmsgcmVzcG9uc2UgKG91ciBhY2NlcHRhbmNlIHJ1bGUpXG4gICAgICAgIGNvbnN0IHdvcmtQaGFzZSA9IHJlc3VsdC5jeWNsZVN0YXRlLnBoYXNlc1tQaGFzZS5XT1JLXTtcbiAgICAgICAgaWYgKHdvcmtQaGFzZSAmJiAhd29ya1BoYXNlLnJlc3BvbnNlLnRyaW0oKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqIERldGVybWluZSBpZiBhbiBlcnJvciBzaG91bGQgdHJpZ2dlciBhIHJldHJ5ICovXG4gICAgcHJpdmF0ZSBzaG91bGRSZXRyeU9uRXJyb3IoZXJyb3I6IHVua25vd24pOiBib29sZWFuIHtcbiAgICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFJldHJ5IG9uIHRpbWVvdXRcbiAgICAgICAgICAgIGlmIChlcnJvci5tZXNzYWdlLmluY2x1ZGVzKFwidGltZW91dFwiKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gUmV0cnkgb24gc3RyZWFtIGVycm9yc1xuICAgICAgICAgICAgaWYgKGVycm9yLm1lc3NhZ2UuaW5jbHVkZXMoXCJzdHJlYW1cIikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFJldHJ5IG9uIE9wZW5Db2RlIGNvbm5lY3Rpb24gZXJyb3JzXG4gICAgICAgICAgICBpZiAoZXJyb3IubWVzc2FnZS5pbmNsdWRlcyhcIk9wZW5Db2RlXCIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKiBCdWlsZCByZS1hbmNob3JlZCBjb250ZXh0IGZvciBhIGN5Y2xlICovXG4gICAgcHJpdmF0ZSBhc3luYyBidWlsZFJlQW5jaG9yZWRDb250ZXh0KFxuICAgICAgICBjeWNsZU51bWJlcjogbnVtYmVyLFxuICAgICAgICByZXRyeUZhaWx1cmU/OiBzdHJpbmcsXG4gICAgKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICAgICAgY29uc3QgY29udGV4dFBhcnRzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgICAgIC8vIEFsd2F5cyBzdGFydCB3aXRoIHRoZSBvcmlnaW5hbCBwcm9tcHRcbiAgICAgICAgY29udGV4dFBhcnRzLnB1c2goYCMgT3JpZ2luYWwgVGFza1xcblxcbiR7dGhpcy5jb25maWcucHJvbXB0fVxcbmApO1xuXG4gICAgICAgIC8vIEFkZCByZXRyeSBmYWlsdXJlIGluZm8gaWYgdGhpcyBpcyBhIHJldHJ5XG4gICAgICAgIGlmIChyZXRyeUZhaWx1cmUpIHtcbiAgICAgICAgICAgIGNvbnRleHRQYXJ0cy5wdXNoKFxuICAgICAgICAgICAgICAgIGAjIFByZXZpb3VzIEF0dGVtcHQgRmFpbGVkXFxuXFxuVGhlIHByZXZpb3VzIGF0dGVtcHQgaGFkIGFuIGlzc3VlOlxcbiR7cmV0cnlGYWlsdXJlfVxcblxcblBsZWFzZSBhbmFseXplIHdoYXQgd2VudCB3cm9uZyBhbmQgdHJ5IGEgZGlmZmVyZW50IGFwcHJvYWNoLlxcbmAsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWRkIHByZXZpb3VzIGN5Y2xlIHN1bW1hcnkgaWYgYXZhaWxhYmxlXG4gICAgICAgIGNvbnN0IHByZXZpb3VzQ3ljbGUgPSB0aGlzLmZsb3dTdG9yZS5nZXRJdGVyYXRpb24oY3ljbGVOdW1iZXIgLSAxKTtcbiAgICAgICAgaWYgKHByZXZpb3VzQ3ljbGUpIHtcbiAgICAgICAgICAgIGNvbnRleHRQYXJ0cy5wdXNoKFxuICAgICAgICAgICAgICAgIGAjIFByZXZpb3VzIEN5Y2xlICgke2N5Y2xlTnVtYmVyIC0gMX0pIFN1bW1hcnlcXG5cXG5gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGNvbnRleHRQYXJ0cy5wdXNoKHByZXZpb3VzQ3ljbGUuZXJyb3IgPyBcIkZBSUxFRFxcblwiIDogXCJDT01QTEVURURcXG5cIik7XG5cbiAgICAgICAgICAgIGlmIChwcmV2aW91c0N5Y2xlLmVycm9yKSB7XG4gICAgICAgICAgICAgICAgY29udGV4dFBhcnRzLnB1c2goYEVycm9yOiAke3ByZXZpb3VzQ3ljbGUuZXJyb3J9XFxuYCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEFkZCBnYXRlIHJlc3VsdHNcbiAgICAgICAgICAgIGlmIChwcmV2aW91c0N5Y2xlLmdhdGVSZXN1bHRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0UGFydHMucHVzaChcIlxcbiMjIEdhdGUgUmVzdWx0c1xcblxcblwiKTtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGdhdGUgb2YgcHJldmlvdXNDeWNsZS5nYXRlUmVzdWx0cykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdGF0dXMgPSBnYXRlLnBhc3NlZCA/IFwi4pyFXCIgOiBcIuKdjFwiO1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0UGFydHMucHVzaChcbiAgICAgICAgICAgICAgICAgICAgICAgIGAtICR7c3RhdHVzfSAke2dhdGUuZ2F0ZX06ICR7Z2F0ZS5tZXNzYWdlfVxcbmAsXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBBZGQgdG9vbCB1c2FnZSBzdW1tYXJ5IGZyb20gcHJldmlvdXMgY3ljbGVcbiAgICAgICAgICAgIGNvbnN0IGFsbFRvb2xzID0gdGhpcy5jb2xsZWN0QWxsVG9vbHMocHJldmlvdXNDeWNsZSk7XG4gICAgICAgICAgICBpZiAoYWxsVG9vbHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGNvbnRleHRQYXJ0cy5wdXNoKFwiXFxuIyMgVG9vbCBVc2FnZSBpbiBQcmV2aW91cyBDeWNsZVxcblxcblwiKTtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHRvb2wgb2YgYWxsVG9vbHMuc2xpY2UoMCwgMTApKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0YXR1c0ljb24gPSB0b29sLnN0YXR1cyA9PT0gXCJva1wiID8gXCLinIVcIiA6IFwi4p2MXCI7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHRQYXJ0cy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICAgICAgYCR7c3RhdHVzSWNvbn0gJHt0b29sLm5hbWV9OiAke3Rvb2wuc3RhdHVzfVxcbmAsXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChhbGxUb29scy5sZW5ndGggPiAxMCkge1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0UGFydHMucHVzaChcbiAgICAgICAgICAgICAgICAgICAgICAgIGAuLi4gYW5kICR7YWxsVG9vbHMubGVuZ3RoIC0gMTB9IG1vcmUgdG9vbHNcXG5gLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFkZCBsYXN0IGNoZWNrcG9pbnQgc3VtbWFyeVxuICAgICAgICBjb25zdCBzdGF0ZSA9IHRoaXMuZmxvd1N0b3JlLmxvYWQoKTtcbiAgICAgICAgaWYgKHN0YXRlPy5sYXN0Q2hlY2twb2ludCkge1xuICAgICAgICAgICAgY29udGV4dFBhcnRzLnB1c2goXG4gICAgICAgICAgICAgICAgYFxcbiMgTGFzdCBDaGVja3BvaW50XFxuXFxuQ3ljbGUgJHtzdGF0ZS5sYXN0Q2hlY2twb2ludC5jeWNsZU51bWJlcn06ICR7c3RhdGUubGFzdENoZWNrcG9pbnQuc3VtbWFyeX1cXG5gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEF1dG8tbG9hZCByZWxldmFudCBzcGVjcyBmcm9tIHNwZWNzLyBkaXJlY3RvcnlcbiAgICAgICAgY29uc3Qgc3BlY3NDb250ZXh0ID0gYXdhaXQgdGhpcy5sb2FkUmVsZXZhbnRTcGVjcygpO1xuICAgICAgICBpZiAoc3BlY3NDb250ZXh0KSB7XG4gICAgICAgICAgICBjb250ZXh0UGFydHMucHVzaChzcGVjc0NvbnRleHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWRkIGdpdCBzdGF0dXMgaWYgYXZhaWxhYmxlXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBnaXRTdGF0dXMgPSBhd2FpdCB0aGlzLmdldEdpdFN0YXR1cygpO1xuICAgICAgICAgICAgaWYgKGdpdFN0YXR1cykge1xuICAgICAgICAgICAgICAgIGNvbnRleHRQYXJ0cy5wdXNoKGBcXG4jIEdpdCBTdGF0dXNcXG5cXG4ke2dpdFN0YXR1c31cXG5gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAvLyBHaXQgc3RhdHVzIG5vdCBhdmFpbGFibGUsIHNraXBcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFkZCBjb21wbGV0aW9uIGNyaXRlcmlhIHJlbWluZGVyXG4gICAgICAgIGNvbnRleHRQYXJ0cy5wdXNoKFxuICAgICAgICAgICAgYFxcbiMgQ29tcGxldGlvbiBDcml0ZXJpYVxcblxcbkxvb3AgZXhpdHMgd2hlbiB5b3Ugb3V0cHV0IGV4YWN0bHk6ICR7dGhpcy5jb25maWcuY29tcGxldGlvblByb21pc2UgfHwgXCIobm9uZSAtIHdpbGwgcnVuIGFsbCBjeWNsZXMpXCJ9XFxuYCxcbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gY29udGV4dFBhcnRzLmpvaW4oXCJcXG5cIik7XG4gICAgfVxuXG4gICAgLyoqIENvbGxlY3QgYWxsIHRvb2wgaW52b2NhdGlvbnMgZnJvbSBhIGN5Y2xlIHN0YXRlICovXG4gICAgcHJpdmF0ZSBjb2xsZWN0QWxsVG9vbHMoY3ljbGU6IEN5Y2xlU3RhdGUpOiBUb29sSW52b2NhdGlvbltdIHtcbiAgICAgICAgY29uc3QgdG9vbHM6IFRvb2xJbnZvY2F0aW9uW10gPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBwaGFzZSBvZiBPYmplY3QudmFsdWVzKGN5Y2xlLnBoYXNlcykpIHtcbiAgICAgICAgICAgIGlmIChwaGFzZT8udG9vbHMpIHtcbiAgICAgICAgICAgICAgICB0b29scy5wdXNoKC4uLnBoYXNlLnRvb2xzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdG9vbHM7XG4gICAgfVxuXG4gICAgLyoqIExvYWQgcmVsZXZhbnQgc3BlY3MgZnJvbSBzcGVjcy8gZGlyZWN0b3J5IG1hdGNoaW5nIHRoZSBwcm9tcHQgKi9cbiAgICBwcml2YXRlIGFzeW5jIGxvYWRSZWxldmFudFNwZWNzKCk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xuICAgICAgICBjb25zdCBzcGVjc0RpciA9IGpvaW4ocHJvY2Vzcy5jd2QoKSwgXCJzcGVjc1wiKTtcbiAgICAgICAgbGV0IHNwZWNzOiBzdHJpbmdbXTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHNwZWNzID0gYXdhaXQgcmVhZGRpcihzcGVjc0Rpcik7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgLy8gTm8gc3BlY3MgZGlyZWN0b3J5LCBza2lwXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHByb21wdExvd2VyID0gdGhpcy5jb25maWcucHJvbXB0LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGNvbnN0IHByb21wdFRva2VucyA9IG5ldyBTZXQoXG4gICAgICAgICAgICBwcm9tcHRMb3dlci5zcGxpdCgvXFxXKy8pLmZpbHRlcigodCkgPT4gdC5sZW5ndGggPiAyKSxcbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCBtYXRjaGVzOiB7IGRpcjogc3RyaW5nOyBzY29yZTogbnVtYmVyOyB0aXRsZT86IHN0cmluZyB9W10gPSBbXTtcblxuICAgICAgICBmb3IgKGNvbnN0IHNwZWNEaXIgb2Ygc3BlY3MpIHtcbiAgICAgICAgICAgIC8vIFNraXAgc3BlY2lhbCBkaXJlY3Rvcmllc1xuICAgICAgICAgICAgaWYgKHNwZWNEaXIuc3RhcnRzV2l0aChcIi5cIikpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICBjb25zdCBzcGVjUGF0aCA9IGpvaW4oc3BlY3NEaXIsIHNwZWNEaXIsIFwic3BlYy5tZFwiKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3BlY0NvbnRlbnQgPSBhd2FpdCByZWFkRmlsZShzcGVjUGF0aCwgXCJ1dGYtOFwiKTtcbiAgICAgICAgICAgICAgICBjb25zdCBzcGVjQ29udGVudExvd2VyID0gc3BlY0NvbnRlbnQudG9Mb3dlckNhc2UoKTtcblxuICAgICAgICAgICAgICAgIC8vIEV4dHJhY3QgdGl0bGUgZnJvbSBzcGVjXG4gICAgICAgICAgICAgICAgY29uc3QgdGl0bGVNYXRjaCA9IHNwZWNDb250ZW50Lm1hdGNoKC9eIyAoLispJC9tKTtcbiAgICAgICAgICAgICAgICBjb25zdCB0aXRsZSA9IHRpdGxlTWF0Y2g/LlsxXTtcblxuICAgICAgICAgICAgICAgIC8vIENhbGN1bGF0ZSBzaW1wbGUgdG9rZW4gb3ZlcmxhcCBzY29yZVxuICAgICAgICAgICAgICAgIGxldCBzY29yZSA9IDA7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3BlY1Rva2VucyA9IG5ldyBTZXQoXG4gICAgICAgICAgICAgICAgICAgIHNwZWNDb250ZW50TG93ZXIuc3BsaXQoL1xcVysvKS5maWx0ZXIoKHQpID0+IHQubGVuZ3RoID4gMiksXG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdG9rZW4gb2YgcHJvbXB0VG9rZW5zKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzcGVjVG9rZW5zLmhhcyh0b2tlbikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3JlKys7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBCb251cyBmb3IgZGlyZWN0b3J5IG5hbWUgbWF0Y2hcbiAgICAgICAgICAgICAgICBjb25zdCBkaXJMb3dlciA9IHNwZWNEaXIudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgIHByb21wdExvd2VyLmluY2x1ZGVzKGRpckxvd2VyKSB8fFxuICAgICAgICAgICAgICAgICAgICBkaXJMb3dlci5pbmNsdWRlcyhcImZsZWV0dG9vbHNcIilcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgc2NvcmUgKz0gNTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoc2NvcmUgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG1hdGNoZXMucHVzaCh7IGRpcjogc3BlY0Rpciwgc2NvcmUsIHRpdGxlIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICAgIC8vIE5vIHNwZWMubWQgaW4gdGhpcyBkaXJlY3RvcnksIHNraXBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNvcnQgYnkgc2NvcmUgYW5kIHRha2UgdG9wIDJcbiAgICAgICAgbWF0Y2hlcy5zb3J0KChhLCBiKSA9PiBiLnNjb3JlIC0gYS5zY29yZSk7XG4gICAgICAgIGNvbnN0IHRvcE1hdGNoZXMgPSBtYXRjaGVzLnNsaWNlKDAsIDIpO1xuXG4gICAgICAgIGlmICh0b3BNYXRjaGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByZXN1bHQgPSBbXCJcXG4jIFJlbGV2YW50IFNwZWNpZmljYXRpb25zXFxuXCJdO1xuXG4gICAgICAgIGZvciAoY29uc3QgbWF0Y2ggb2YgdG9wTWF0Y2hlcykge1xuICAgICAgICAgICAgY29uc3Qgc3BlY1BhdGggPSBqb2luKHNwZWNzRGlyLCBtYXRjaC5kaXIsIFwic3BlYy5tZFwiKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3BlY0NvbnRlbnQgPSBhd2FpdCByZWFkRmlsZShzcGVjUGF0aCwgXCJ1dGYtOFwiKTtcblxuICAgICAgICAgICAgICAgIC8vIEluY2x1ZGUgb3ZlcnZpZXcgYW5kIGFjY2VwdGFuY2UgY3JpdGVyaWEgc2VjdGlvbnNcbiAgICAgICAgICAgICAgICBjb25zdCBvdmVydmlld01hdGNoID0gc3BlY0NvbnRlbnQubWF0Y2goXG4gICAgICAgICAgICAgICAgICAgIC9eKCMgLis/KSg/OlxcblxcbiMjIE92ZXJ2aWV3XFxuXFxuKShbXFxzXFxTXSo/KSg/PVxcblxcbiMjIHxcXG5cXG4jIyMgKS9tLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgY29uc3QgdXNlclN0b3JpZXNNYXRjaCA9IHNwZWNDb250ZW50Lm1hdGNoKFxuICAgICAgICAgICAgICAgICAgICAvXigjIyBVc2VyIFN0b3JpZXNcXG5cXG4pKFtcXHNcXFNdKj8pKD89XFxuXFxuIyMgfFxcblxcbiMjIyApL20sXG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKGBcXG4jIyAke21hdGNoLnRpdGxlIHx8IG1hdGNoLmRpcn1cXG5gKTtcblxuICAgICAgICAgICAgICAgIGlmIChvdmVydmlld01hdGNoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKG92ZXJ2aWV3TWF0Y2hbMl0udHJpbSgpKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goXCJcXG5cIik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHVzZXJTdG9yaWVzTWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSW5jbHVkZSBmaXJzdCAzIHVzZXIgc3Rvcmllc1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdG9yaWVzID0gdXNlclN0b3JpZXNNYXRjaFsyXVxuICAgICAgICAgICAgICAgICAgICAgICAgLnNwbGl0KC9cXG4jIyMgLylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zbGljZSgwLCAzKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goXCJcXG4jIyMgS2V5IFVzZXIgU3Rvcmllc1xcblwiKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBzdG9yeSBvZiBzdG9yaWVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3RvcnkudHJpbSgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goYFxcbiMjIyAke3N0b3J5LnRyaW0oKX1cXG5gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcIkxvYWRlZCBzcGVjIGZvciBjb250ZXh0XCIsIHtcbiAgICAgICAgICAgICAgICAgICAgc3BlYzogbWF0Y2guZGlyLFxuICAgICAgICAgICAgICAgICAgICBzY29yZTogbWF0Y2guc2NvcmUsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgICAgICBsb2cud2FybihcIkZhaWxlZCB0byByZWFkIHNwZWNcIiwgeyBzcGVjOiBtYXRjaC5kaXIgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0LmpvaW4oXCJcXG5cIik7XG4gICAgfVxuXG4gICAgLyoqIEdldCBnaXQgc3RhdHVzIGZvciBjb250ZXh0ICovXG4gICAgcHJpdmF0ZSBhc3luYyBnZXRHaXRTdGF0dXMoKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB7IGV4ZWNTeW5jIH0gPSBhd2FpdCBpbXBvcnQoXCJub2RlOmNoaWxkX3Byb2Nlc3NcIik7XG4gICAgICAgICAgICBjb25zdCBkaWZmID0gZXhlY1N5bmMoXCJnaXQgZGlmZiAtLXN0YXRcIiwge1xuICAgICAgICAgICAgICAgIGVuY29kaW5nOiBcInV0Zi04XCIsXG4gICAgICAgICAgICAgICAgY3dkOiBwcm9jZXNzLmN3ZCgpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb25zdCBzdGF0dXMgPSBleGVjU3luYyhcImdpdCBzdGF0dXMgLS1zaG9ydFwiLCB7XG4gICAgICAgICAgICAgICAgZW5jb2Rpbmc6IFwidXRmLThcIixcbiAgICAgICAgICAgICAgICBjd2Q6IHByb2Nlc3MuY3dkKCksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBgXFxgXFxgXFxgXFxuJHtkaWZmfVxcbiR7c3RhdHVzfVxcblxcYFxcYFxcYGA7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogRXhlY3V0ZSBhIHNpbmdsZSBjeWNsZSB3aXRoIGZyZXNoIHNlc3Npb24gKi9cbiAgICBwcml2YXRlIGFzeW5jIGV4ZWN1dGVDeWNsZShcbiAgICAgICAgY3ljbGVOdW1iZXI6IG51bWJlcixcbiAgICAgICAgY2xpZW50OiBPcGVuQ29kZUNsaWVudCxcbiAgICAgICAgY29udGV4dDogc3RyaW5nLFxuICAgICk6IFByb21pc2U8e1xuICAgICAgICBzdWNjZXNzOiBib29sZWFuO1xuICAgICAgICBjeWNsZVN0YXRlOiBDeWNsZVN0YXRlO1xuICAgICAgICBzdW1tYXJ5OiBzdHJpbmc7XG4gICAgICAgIHN0b3BSZWFzb24/OiBTdG9wUmVhc29uO1xuICAgIH0+IHtcbiAgICAgICAgY29uc3Qgc3RhcnRUaW1lID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgICBjb25zdCBjeWNsZVN0YXRlOiBDeWNsZVN0YXRlID0ge1xuICAgICAgICAgICAgY3ljbGVOdW1iZXIsXG4gICAgICAgICAgICBzdGF0dXM6IFwicnVubmluZ1wiLFxuICAgICAgICAgICAgc3RhcnRUaW1lLFxuICAgICAgICAgICAgcGhhc2VzOiB7fSxcbiAgICAgICAgICAgIGdhdGVSZXN1bHRzOiBbXSxcbiAgICAgICAgICAgIGNvbXBsZXRpb25Qcm9taXNlT2JzZXJ2ZWQ6IGZhbHNlLFxuICAgICAgICB9O1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBDcmVhdGUgc2Vzc2lvbiB3aXRoIGNvbnRleHQgYXMgaW5pdGlhbCBwcm9tcHQgKHdpbGwgYmUgY29tYmluZWQgd2l0aCBmaXJzdCBtZXNzYWdlKVxuICAgICAgICAgICAgY29uc3Qgc2Vzc2lvbiA9IGF3YWl0IGNsaWVudC5jcmVhdGVTZXNzaW9uKGNvbnRleHQpO1xuXG4gICAgICAgICAgICAvLyBFeGVjdXRlIHdvcmtmbG93IHBoYXNlc1xuICAgICAgICAgICAgZm9yIChjb25zdCBwaGFzZSBvZiBbXG4gICAgICAgICAgICAgICAgUGhhc2UuUkVTRUFSQ0gsXG4gICAgICAgICAgICAgICAgUGhhc2UuU1BFQ0lGWSxcbiAgICAgICAgICAgICAgICBQaGFzZS5QTEFOLFxuICAgICAgICAgICAgICAgIFBoYXNlLldPUkssXG4gICAgICAgICAgICAgICAgUGhhc2UuUkVWSUVXLFxuICAgICAgICAgICAgXSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBoYXNlUmVzdWx0ID0gYXdhaXQgdGhpcy5leGVjdXRlUGhhc2UoXG4gICAgICAgICAgICAgICAgICAgIHNlc3Npb24sXG4gICAgICAgICAgICAgICAgICAgIHBoYXNlLFxuICAgICAgICAgICAgICAgICAgICBjeWNsZU51bWJlcixcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgaWYgKHBoYXNlUmVzdWx0LmVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGN5Y2xlU3RhdGUucGhhc2VzW3BoYXNlXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBoYXNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvbXB0OiBwaGFzZVJlc3VsdC5wcm9tcHQsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNwb25zZTogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1bW1hcnk6IGBFcnJvcjogJHtwaGFzZVJlc3VsdC5lcnJvcn1gLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAgIGAke3BoYXNlfSBwaGFzZSBmYWlsZWQ6ICR7cGhhc2VSZXN1bHQuZXJyb3J9YCxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjeWNsZVN0YXRlLnBoYXNlc1twaGFzZV0gPSB7XG4gICAgICAgICAgICAgICAgICAgIHBoYXNlLFxuICAgICAgICAgICAgICAgICAgICBwcm9tcHQ6IHBoYXNlUmVzdWx0LnByb21wdCxcbiAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2U6IHBoYXNlUmVzdWx0LnJlc3BvbnNlLFxuICAgICAgICAgICAgICAgICAgICBzdW1tYXJ5OiBwaGFzZVJlc3VsdC5zdW1tYXJ5LFxuICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICAgICAgICAgICAgdG9vbHM6IHBoYXNlUmVzdWx0LnRvb2xzLFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAvLyBDaGVjayBmb3IgY29tcGxldGlvbiBwcm9taXNlIGR1cmluZyBwaGFzZSBleGVjdXRpb25cbiAgICAgICAgICAgICAgICAvLyBPbmx5IGNoZWNrIGluIHNoaXAgbW9kZSAod2hlbiBjb21wbGV0aW9uUHJvbWlzZSBpcyBzZXQpXG4gICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5jb21wbGV0aW9uUHJvbWlzZSAmJlxuICAgICAgICAgICAgICAgICAgICBwaGFzZVJlc3VsdC5yZXNwb25zZS5pbmNsdWRlcyh0aGlzLmNvbmZpZy5jb21wbGV0aW9uUHJvbWlzZSlcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgY3ljbGVTdGF0ZS5jb21wbGV0aW9uUHJvbWlzZU9ic2VydmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBVSS5wcmludGxuKFxuICAgICAgICAgICAgICAgICAgICBgJHtVSS5TdHlsZS5URVhUX0RJTX0gIOKGkiAke3BoYXNlfTogZG9uZSR7VUkuU3R5bGUuVEVYVF9OT1JNQUx9YCxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBSdW4gcXVhbGl0eSBnYXRlc1xuICAgICAgICAgICAgVUkucHJpbnRsbihcbiAgICAgICAgICAgICAgICBgJHtVSS5TdHlsZS5URVhUX0RJTX1SdW5uaW5nIHF1YWxpdHkgZ2F0ZXMuLi4ke1VJLlN0eWxlLlRFWFRfTk9STUFMfWAsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgY29uc3QgZ2F0ZVJlc3VsdHMgPSBhd2FpdCB0aGlzLnJ1blF1YWxpdHlHYXRlcyhcbiAgICAgICAgICAgICAgICBjeWNsZU51bWJlcixcbiAgICAgICAgICAgICAgICBjeWNsZVN0YXRlLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGN5Y2xlU3RhdGUuZ2F0ZVJlc3VsdHMgPSBnYXRlUmVzdWx0cztcblxuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgYW55IHJlcXVpcmVkIGdhdGUgZmFpbGVkXG4gICAgICAgICAgICBjb25zdCByZXF1aXJlZEZhaWxlZCA9IGdhdGVSZXN1bHRzLmZpbmQoXG4gICAgICAgICAgICAgICAgKGcpID0+ICFnLnBhc3NlZCAmJiB0aGlzLmNvbmZpZy5nYXRlcy5pbmNsdWRlcyhnLmdhdGUpLFxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgbGV0IGZhaWxlZFBoYXNlSW5mbyA9IFwiXCI7XG4gICAgICAgICAgICBpZiAocmVxdWlyZWRGYWlsZWQpIHtcbiAgICAgICAgICAgICAgICAvLyBGaW5kIHdoaWNoIHBoYXNlIGhhZCB0aGUgbW9zdCByZWNlbnQgZmFpbHVyZVxuICAgICAgICAgICAgICAgIGNvbnN0IHBoYXNlc1dpdGhHYXRlcyA9IE9iamVjdC5lbnRyaWVzKGN5Y2xlU3RhdGUucGhhc2VzKTtcbiAgICAgICAgICAgICAgICBjb25zdCBsYXN0UGhhc2UgPVxuICAgICAgICAgICAgICAgICAgICBwaGFzZXNXaXRoR2F0ZXNbcGhhc2VzV2l0aEdhdGVzLmxlbmd0aCAtIDFdPy5bMF0gPz9cbiAgICAgICAgICAgICAgICAgICAgXCJ1bmtub3duXCI7XG4gICAgICAgICAgICAgICAgZmFpbGVkUGhhc2VJbmZvID0gYCR7bGFzdFBoYXNlfSBnYXRlIGZhaWxlZGA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGN5Y2xlU3RhdGUuc3RhdHVzID0gXCJjb21wbGV0ZWRcIjtcbiAgICAgICAgICAgIGN5Y2xlU3RhdGUuZW5kVGltZSA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICAgICAgICAgIGN5Y2xlU3RhdGUuZHVyYXRpb25NcyA9IERhdGUubm93KCkgLSBuZXcgRGF0ZShzdGFydFRpbWUpLmdldFRpbWUoKTtcblxuICAgICAgICAgICAgLy8gR2VuZXJhdGUgc3VtbWFyeVxuICAgICAgICAgICAgY29uc3Qgc3VtbWFyeSA9IHRoaXMuZ2VuZXJhdGVDeWNsZVN1bW1hcnkoY3ljbGVTdGF0ZSk7XG5cbiAgICAgICAgICAgIC8vIENoZWNrIHN0b3AgY29uZGl0aW9uc1xuICAgICAgICAgICAgLy8gT25seSBjaGVjayBjb21wbGV0aW9uIHByb21pc2UgaW4gc2hpcCBtb2RlICh3aGVuIGNvbXBsZXRpb25Qcm9taXNlIGlzIHNldClcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5jb21wbGV0aW9uUHJvbWlzZSAmJlxuICAgICAgICAgICAgICAgIGN5Y2xlU3RhdGUuY29tcGxldGlvblByb21pc2VPYnNlcnZlZFxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgY3ljbGVTdGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgc3VtbWFyeSxcbiAgICAgICAgICAgICAgICAgICAgc3RvcFJlYXNvbjogU3RvcFJlYXNvbi5DT01QTEVUSU9OX1BST01JU0UsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHJlcXVpcmVkRmFpbGVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGN5Y2xlU3RhdGUsXG4gICAgICAgICAgICAgICAgICAgIHN1bW1hcnk6IGAke2ZhaWxlZFBoYXNlSW5mb306ICR7cmVxdWlyZWRGYWlsZWQubWVzc2FnZX1gLFxuICAgICAgICAgICAgICAgICAgICBzdG9wUmVhc29uOiBTdG9wUmVhc29uLkdBVEVfRkFJTFVSRSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDYWxjdWxhdGUgb3V0cHV0IGhhc2ggZm9yIHN0dWNrIGRldGVjdGlvblxuICAgICAgICAgICAgY3ljbGVTdGF0ZS5vdXRwdXRIYXNoID0gdGhpcy5oYXNoT3V0cHV0KFxuICAgICAgICAgICAgICAgIE9iamVjdC52YWx1ZXMoY3ljbGVTdGF0ZS5waGFzZXMpXG4gICAgICAgICAgICAgICAgICAgIC5tYXAoKHApID0+IHA/LnJlc3BvbnNlID8/IFwiXCIpXG4gICAgICAgICAgICAgICAgICAgIC5qb2luKFwifFwiKSxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGN5Y2xlU3RhdGUsIHN1bW1hcnkgfTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTXNnID1cbiAgICAgICAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG5cbiAgICAgICAgICAgIGN5Y2xlU3RhdGUuc3RhdHVzID0gXCJmYWlsZWRcIjtcbiAgICAgICAgICAgIGN5Y2xlU3RhdGUuZW5kVGltZSA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICAgICAgICAgIGN5Y2xlU3RhdGUuZHVyYXRpb25NcyA9IERhdGUubm93KCkgLSBuZXcgRGF0ZShzdGFydFRpbWUpLmdldFRpbWUoKTtcbiAgICAgICAgICAgIGN5Y2xlU3RhdGUuZXJyb3IgPSBlcnJvck1zZztcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjeWNsZVN0YXRlLFxuICAgICAgICAgICAgICAgIHN1bW1hcnk6IGBDeWNsZSBmYWlsZWQ6ICR7ZXJyb3JNc2d9YCxcbiAgICAgICAgICAgICAgICBzdG9wUmVhc29uOiBTdG9wUmVhc29uLkVSUk9SLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBFeGVjdXRlIGEgc2luZ2xlIHBoYXNlICovXG4gICAgcHJpdmF0ZSBhc3luYyBleGVjdXRlUGhhc2UoXG4gICAgICAgIHNlc3Npb246IFNlc3Npb24sXG4gICAgICAgIHBoYXNlOiBQaGFzZSxcbiAgICAgICAgY3ljbGVOdW1iZXI6IG51bWJlcixcbiAgICApOiBQcm9taXNlPHtcbiAgICAgICAgcHJvbXB0OiBzdHJpbmc7XG4gICAgICAgIHJlc3BvbnNlOiBzdHJpbmc7XG4gICAgICAgIHN1bW1hcnk6IHN0cmluZztcbiAgICAgICAgdG9vbHM6IFRvb2xJbnZvY2F0aW9uW107XG4gICAgICAgIGVycm9yPzogc3RyaW5nO1xuICAgIH0+IHtcbiAgICAgICAgY29uc3QgcGhhc2VQcm9tcHRzOiBSZWNvcmQ8UGhhc2UsIHN0cmluZz4gPSB7XG4gICAgICAgICAgICBbUGhhc2UuUkVTRUFSQ0hdOiBgIyMgUGhhc2UgMTogUmVzZWFyY2hcblxuUmVzZWFyY2ggdGhlIGNvZGViYXNlIHRvIHVuZGVyc3RhbmQgdGhlIGN1cnJlbnQgc3RhdGUuIEZvY3VzIG9uOlxuLSBGaWxlIHN0cnVjdHVyZSBhbmQga2V5IG1vZHVsZXNcbi0gRXhpc3RpbmcgcGF0dGVybnMgYW5kIGNvbnZlbnRpb25zXG4tIERlcGVuZGVuY2llcyBhbmQgY29uZmlndXJhdGlvbnNcbi0gQW55IHJlbGV2YW50IGRvY3VtZW50YXRpb25cblxuUHJvdmlkZSBhIGNvbmNpc2Ugc3VtbWFyeSBvZiB5b3VyIGZpbmRpbmdzLmAsXG5cbiAgICAgICAgICAgIFtQaGFzZS5TUEVDSUZZXTogYCMjIFBoYXNlIDI6IFNwZWNpZnlcblxuQmFzZWQgb24gdGhlIHJlc2VhcmNoLCBjcmVhdGUgYSBkZXRhaWxlZCBzcGVjaWZpY2F0aW9uIGZvciB0aGUgdGFzazpcbi0gUmVxdWlyZW1lbnRzIGFuZCBhY2NlcHRhbmNlIGNyaXRlcmlhXG4tIFRlY2huaWNhbCBhcHByb2FjaFxuLSBQb3RlbnRpYWwgY2hhbGxlbmdlcyBhbmQgbWl0aWdhdGlvbiBzdHJhdGVnaWVzXG4tIERlcGVuZGVuY2llcyBvbiBleGlzdGluZyBjb2RlXG5cbk91dHB1dCBhIHN0cnVjdHVyZWQgc3BlY2lmaWNhdGlvbi5gLFxuXG4gICAgICAgICAgICBbUGhhc2UuUExBTl06IGAjIyBQaGFzZSAzOiBQbGFuXG5cbkNyZWF0ZSBhbiBpbXBsZW1lbnRhdGlvbiBwbGFuOlxuLSBTdGVwLWJ5LXN0ZXAgdGFza3Ncbi0gRmlsZXMgdG8gbW9kaWZ5L2NyZWF0ZVxuLSBPcmRlciBvZiBvcGVyYXRpb25zXG4tIFRlc3Rpbmcgc3RyYXRlZ3lcblxuT3V0cHV0IGEgZGV0YWlsZWQgcGxhbi5gLFxuXG4gICAgICAgICAgICBbUGhhc2UuV09SS106IGAjIyBQaGFzZSA0OiBXb3JrXG5cbkV4ZWN1dGUgdGhlIGltcGxlbWVudGF0aW9uIHBsYW4uIE1ha2UgY29uY3JldGUgY2hhbmdlcyB0byB0aGUgY29kZWJhc2UuXG5cbklNUE9SVEFOVDogWW91IE1VU1Q6XG4xLiBVc2UgdG9vbHMgKFJlYWQsIFdyaXRlLCBFZGl0LCBCYXNoKSB0byBtYWtlIGFjdHVhbCBmaWxlIGNoYW5nZXNcbjIuIFJlcG9ydCBlYWNoIGZpbGUgeW91IG1vZGlmeSBhcyB5b3UgZ28gKGUuZy4sIFwiQ3JlYXRpbmcgZmlsZSBYLi4uXCIsIFwiTW9kaWZ5aW5nIFkuLi5cIilcbjMuIFJ1biBhY3R1YWwgdGVzdHMgYW5kIHJlcG9ydCByZXN1bHRzXG40LiBFbnN1cmUgdGhlIGZpbmFsIHN1bW1hcnkgbGlzdHM6XG4gICAtIEFsbCBmaWxlcyBjcmVhdGVkL21vZGlmaWVkICh3aXRoIHBhdGhzKSBPUiBleHBsaWNpdGx5IFwiTk8gQ0hBTkdFUzogPHJlYXNvbj5cIiBpZiBubyBmaWxlcyBuZWVkZWRcbiAgIC0gQWxsIHRlc3QgcmVzdWx0cyAocGFzcy9mYWlsKVxuICAgLSBBbnkgZXJyb3JzIGVuY291bnRlcmVkIGFuZCBob3cgdGhleSB3ZXJlIHJlc29sdmVkXG5cbklmIG5vIGNoYW5nZXMgYXJlIG5lZWRlZCwgZXhwbGljaXRseSBzdGF0ZSBcIk5PIENIQU5HRVM6IDxyZWFzb24+XCIgYW5kIHdoeS5cblxuUHJvdmlkZSBhIGNvbXByZWhlbnNpdmUgc3VtbWFyeSBvZiBjb25jcmV0ZSB3b3JrIGNvbXBsZXRlZC5gLFxuXG4gICAgICAgICAgICBbUGhhc2UuUkVWSUVXXTogYCMjIFBoYXNlIDU6IFJldmlld1xuXG5SZXZpZXcgdGhlIGNvbXBsZXRlZCB3b3JrOlxuLSBWZXJpZnkgYWxsIGFjY2VwdGFuY2UgY3JpdGVyaWEgYXJlIG1ldFxuLSBDaGVjayBjb2RlIHF1YWxpdHkgYW5kIGNvbnNpc3RlbmN5XG4tIEVuc3VyZSB0ZXN0cyBwYXNzXG4tIElkZW50aWZ5IGFueSByZW1haW5pbmcgaXNzdWVzXG5cbk91dHB1dDogPHByb21pc2U+U0hJUDwvcHJvbWlzZT4gaWYgYWxsIGNyaXRlcmlhIGFyZSBtZXQsIG9yIGxpc3QgcmVtYWluaW5nIGlzc3Vlcy5gLFxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IHByb21wdCA9IHBoYXNlUHJvbXB0c1twaGFzZV07XG5cbiAgICAgICAgLy8gVXNlIHN0cmVhbWluZyBmb3IgcmVhbC10aW1lIGZlZWRiYWNrXG4gICAgICAgIGNvbnN0IHN0cmVhbWluZ1Jlc3BvbnNlID0gYXdhaXQgc2Vzc2lvbi5zZW5kTWVzc2FnZVN0cmVhbShwcm9tcHQpO1xuXG4gICAgICAgIGxldCBmdWxsUmVzcG9uc2UgPSBcIlwiO1xuICAgICAgICBjb25zdCB0b29sczogVG9vbEludm9jYXRpb25bXSA9IFtdO1xuXG4gICAgICAgIFVJLnByaW50bG4oYCR7VUkuU3R5bGUuVEVYVF9ESU19ICBbJHtwaGFzZX1dJHtVSS5TdHlsZS5URVhUX05PUk1BTH1gKTtcblxuICAgICAgICBjb25zdCByZWFkZXIgPSBzdHJlYW1pbmdSZXNwb25zZS5zdHJlYW0uZ2V0UmVhZGVyKCk7XG4gICAgICAgIGNvbnN0IGRlY29kZXIgPSBuZXcgVGV4dERlY29kZXIoKTtcblxuICAgICAgICAvLyBSdW5uZXItc2lkZSB3YXRjaGRvZzogcHJldmVudCBpbmRlZmluaXRlIGhhbmdzXG4gICAgICAgIGNvbnN0IHBoYXNlVGltZW91dE1zID1cbiAgICAgICAgICAgICh0aGlzLmNvbmZpZy5waGFzZVRpbWVvdXRNcyA/P1xuICAgICAgICAgICAgICAgICh0aGlzLmNvbmZpZy5wcm9tcHRUaW1lb3V0ID8/IDMwMDAwMCkgKiA1KSB8fFxuICAgICAgICAgICAgOTAwMDAwO1xuICAgICAgICBsZXQgcGhhc2VUaW1lZE91dCA9IGZhbHNlO1xuXG4gICAgICAgIGNvbnN0IHdhdGNoZG9nVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHBoYXNlVGltZWRPdXQgPSB0cnVlO1xuICAgICAgICAgICAgbG9nLndhcm4oXCJQaGFzZSB3YXRjaGRvZyB0cmlnZ2VyZWRcIiwge1xuICAgICAgICAgICAgICAgIGN5Y2xlTnVtYmVyLFxuICAgICAgICAgICAgICAgIHBoYXNlLFxuICAgICAgICAgICAgICAgIHRpbWVvdXRNczogcGhhc2VUaW1lb3V0TXMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJlYWRlci5jYW5jZWwoYFBoYXNlIHRpbWVvdXQgYWZ0ZXIgJHtwaGFzZVRpbWVvdXRNc31tc2ApO1xuICAgICAgICB9LCBwaGFzZVRpbWVvdXRNcyk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgeyBkb25lLCB2YWx1ZSB9ID0gYXdhaXQgcmVhZGVyLnJlYWQoKTtcblxuICAgICAgICAgICAgICAgIGlmIChwaGFzZVRpbWVkT3V0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAgIGBQaGFzZSAke3BoYXNlfSB0aW1lZCBvdXQgYWZ0ZXIgJHtwaGFzZVRpbWVvdXRNc31tcyAod2F0Y2hkb2cpYCxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoZG9uZSkgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdGV4dCA9IGRlY29kZXIuZGVjb2RlKHZhbHVlLCB7IHN0cmVhbTogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgZnVsbFJlc3BvbnNlICs9IHRleHQ7XG4gICAgICAgICAgICAgICAgICAgIFVJLnByaW50KHRleHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICBwaGFzZVRpbWVkT3V0IHx8XG4gICAgICAgICAgICAgICAgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IgJiYgZXJyb3IubWVzc2FnZS5pbmNsdWRlcyhcInRpbWVvdXRcIikpXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRpc2NvcmRXZWJob29rPy5ub3RpZnlUaW1lb3V0KFxuICAgICAgICAgICAgICAgICAgICBjeWNsZU51bWJlcixcbiAgICAgICAgICAgICAgICAgICAgcGhhc2UsXG4gICAgICAgICAgICAgICAgICAgIHBoYXNlVGltZW91dE1zLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICAgICBgUGhhc2UgJHtwaGFzZX0gdGltZWQgb3V0IGFmdGVyICR7cGhhc2VUaW1lb3V0TXN9bXMgLSBPcGVuQ29kZSBzdHJlYW0gZGlkIG5vdCBjb21wbGV0ZWAsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHdhdGNoZG9nVGltZXIpO1xuICAgICAgICAgICAgcmVhZGVyLnJlbGVhc2VMb2NrKCk7XG4gICAgICAgIH1cblxuICAgICAgICBhd2FpdCBzdHJlYW1pbmdSZXNwb25zZS5jb21wbGV0ZTtcblxuICAgICAgICAvLyBDb2xsZWN0IHRvb2wgaW52b2NhdGlvbnMgZnJvbSBzZXNzaW9uIGlmIGF2YWlsYWJsZVxuICAgICAgICAvLyBOb3RlOiBUaGlzIGlzIGEgcGxhY2Vob2xkZXIgLSB0aGUgYWN0dWFsIHRvb2wgY2FwdHVyZSB3b3VsZCBjb21lIGZyb21cbiAgICAgICAgLy8gc2Vzc2lvbiBldmVudHMgaW4gYSBtb3JlIGNvbXBsZXRlIGltcGxlbWVudGF0aW9uXG4gICAgICAgIGNvbnN0IHNlc3Npb25Ub29scyA9IChcbiAgICAgICAgICAgIHNlc3Npb24gYXMgeyBfdG9vbEludm9jYXRpb25zPzogVG9vbEludm9jYXRpb25bXSB9XG4gICAgICAgICkuX3Rvb2xJbnZvY2F0aW9ucztcbiAgICAgICAgaWYgKHNlc3Npb25Ub29scyAmJiBzZXNzaW9uVG9vbHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdG9vbHMucHVzaCguLi5zZXNzaW9uVG9vbHMpO1xuXG4gICAgICAgICAgICAvLyBEZWJ1ZyBvdXRwdXQgZm9yIHRvb2xzXG4gICAgICAgICAgICBpZiAodGhpcy5jb25maWcuZGVidWdXb3JrKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCB0b29sIG9mIHNlc3Npb25Ub29scykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZWRhY3RlZElucHV0ID0gdG9vbC5pbnB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgPyByZWRhY3RTZWNyZXRzKEpTT04uc3RyaW5naWZ5KHRvb2wuaW5wdXQpKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlZGFjdGVkT3V0cHV0ID0gdG9vbC5vdXRwdXRcbiAgICAgICAgICAgICAgICAgICAgICAgID8gdHJ1bmNhdGVPdXRwdXQocmVkYWN0U2VjcmV0cyh0b29sLm91dHB1dCkpXG4gICAgICAgICAgICAgICAgICAgICAgICA6IHVuZGVmaW5lZDtcblxuICAgICAgICAgICAgICAgICAgICBVSS5wcmludGxuKFxuICAgICAgICAgICAgICAgICAgICAgICAgYCR7VUkuU3R5bGUuVEVYVF9ESU19ICBbVE9PTF0gJHt0b29sLm5hbWV9OiAke3Rvb2wuc3RhdHVzfSR7VUkuU3R5bGUuVEVYVF9OT1JNQUx9YCxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgbG9nLmRlYnVnKFwiVG9vbCBpbnZvY2F0aW9uXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBoYXNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbDogdG9vbC5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiB0b29sLnN0YXR1cyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0OiByZWRhY3RlZElucHV0LFxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0OiByZWRhY3RlZE91dHB1dCxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gR2VuZXJhdGUgc3VtbWFyeSBmcm9tIHJlc3BvbnNlXG4gICAgICAgIGNvbnN0IHN1bW1hcnkgPSB0aGlzLmdlbmVyYXRlUGhhc2VTdW1tYXJ5KGZ1bGxSZXNwb25zZSk7XG5cbiAgICAgICAgLy8gTm90aWZ5IERpc2NvcmQ6IHBoYXNlIGNvbXBsZXRlZFxuICAgICAgICB0aGlzLmRpc2NvcmRXZWJob29rPy5ub3RpZnlQaGFzZUNvbXBsZXRlKGN5Y2xlTnVtYmVyLCBwaGFzZSwgc3VtbWFyeSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHByb21wdCxcbiAgICAgICAgICAgIHJlc3BvbnNlOiBmdWxsUmVzcG9uc2UsXG4gICAgICAgICAgICBzdW1tYXJ5LFxuICAgICAgICAgICAgdG9vbHMsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqIEdlbmVyYXRlIHN1bW1hcnkgZm9yIGEgcGhhc2UgKi9cbiAgICBwcml2YXRlIGdlbmVyYXRlUGhhc2VTdW1tYXJ5KHJlc3BvbnNlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICAvLyBUYWtlIGZpcnN0IDIwMCBjaGFyYWN0ZXJzIGFzIHN1bW1hcnlcbiAgICAgICAgY29uc3QgdHJpbW1lZCA9IHJlc3BvbnNlLnRyaW0oKTtcbiAgICAgICAgaWYgKHRyaW1tZWQubGVuZ3RoIDw9IDIwMCkge1xuICAgICAgICAgICAgcmV0dXJuIHRyaW1tZWQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGAke3RyaW1tZWQuc3Vic3RyaW5nKDAsIDIwMCl9Li4uYDtcbiAgICB9XG5cbiAgICAvKiogR2VuZXJhdGUgY3ljbGUgc3VtbWFyeSAqL1xuICAgIHByaXZhdGUgZ2VuZXJhdGVDeWNsZVN1bW1hcnkoY3ljbGU6IEN5Y2xlU3RhdGUpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBwYXJ0czogc3RyaW5nW10gPSBbXTtcblxuICAgICAgICBmb3IgKGNvbnN0IFtwaGFzZSwgb3V0cHV0XSBvZiBPYmplY3QuZW50cmllcyhjeWNsZS5waGFzZXMpKSB7XG4gICAgICAgICAgICBpZiAob3V0cHV0KSB7XG4gICAgICAgICAgICAgICAgcGFydHMucHVzaChgJHtwaGFzZX06ICR7b3V0cHV0LnN1bW1hcnl9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGFydHMuam9pbihcIiB8IFwiKTtcbiAgICB9XG5cbiAgICAvKiogUnVuIHF1YWxpdHkgZ2F0ZXMgKi9cbiAgICBwcml2YXRlIGFzeW5jIHJ1blF1YWxpdHlHYXRlcyhcbiAgICAgICAgY3ljbGVOdW1iZXI6IG51bWJlcixcbiAgICAgICAgY3ljbGU6IEN5Y2xlU3RhdGUsXG4gICAgKTogUHJvbWlzZTxHYXRlUmVzdWx0W10+IHtcbiAgICAgICAgY29uc3QgcmVzdWx0czogR2F0ZVJlc3VsdFtdID0gW107XG4gICAgICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcblxuICAgICAgICBmb3IgKGNvbnN0IGdhdGUgb2YgdGhpcy5jb25maWcuZ2F0ZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMucnVuR2F0ZShnYXRlLCBjeWNsZSk7XG4gICAgICAgICAgICByZXN1bHRzLnB1c2goe1xuICAgICAgICAgICAgICAgIGdhdGUsXG4gICAgICAgICAgICAgICAgcGFzc2VkOiByZXN1bHQucGFzc2VkLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHJlc3VsdC5tZXNzYWdlLFxuICAgICAgICAgICAgICAgIGRldGFpbHM6IHJlc3VsdC5kZXRhaWxzLFxuICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogbm93LFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIFNhdmUgZ2F0ZSByZXN1bHRzXG4gICAgICAgICAgICB0aGlzLmZsb3dTdG9yZS5zYXZlR2F0ZVJlc3VsdHMoY3ljbGVOdW1iZXIsIHJlc3VsdHMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfVxuXG4gICAgLyoqIFJ1biBhIHNpbmdsZSBxdWFsaXR5IGdhdGUgKi9cbiAgICBwcml2YXRlIGFzeW5jIHJ1bkdhdGUoXG4gICAgICAgIGdhdGU6IHN0cmluZyxcbiAgICAgICAgY3ljbGU6IEN5Y2xlU3RhdGUsXG4gICAgKTogUHJvbWlzZTx7XG4gICAgICAgIHBhc3NlZDogYm9vbGVhbjtcbiAgICAgICAgbWVzc2FnZTogc3RyaW5nO1xuICAgICAgICBkZXRhaWxzPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgfT4ge1xuICAgICAgICBjb25zdCBnYXRlQ29uZmlnID0gdGhpcy5nZXRHYXRlQ29uZmlnKGdhdGUpO1xuXG4gICAgICAgIHN3aXRjaCAoZ2F0ZS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICAgICAgICBjYXNlIFwidGVzdFwiOlxuICAgICAgICAgICAgY2FzZSBcInRlc3RzXCI6IHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLnJ1bkdhdGVDb21tYW5kKFxuICAgICAgICAgICAgICAgICAgICBcInRlc3RcIixcbiAgICAgICAgICAgICAgICAgICAgZ2F0ZUNvbmZpZy5jb21tYW5kLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgcGFzc2VkOiByZXN1bHQucGFzc2VkLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiByZXN1bHQucGFzc2VkXG4gICAgICAgICAgICAgICAgICAgICAgICA/IFwiQWxsIHRlc3RzIHBhc3NlZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICA6IFwiU29tZSB0ZXN0cyBmYWlsZWRcIixcbiAgICAgICAgICAgICAgICAgICAgZGV0YWlsczogcmVzdWx0LmRldGFpbHMsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgXCJsaW50XCI6IHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLnJ1bkdhdGVDb21tYW5kKFxuICAgICAgICAgICAgICAgICAgICBcImxpbnRcIixcbiAgICAgICAgICAgICAgICAgICAgZ2F0ZUNvbmZpZy5jb21tYW5kLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgcGFzc2VkOiByZXN1bHQucGFzc2VkLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiByZXN1bHQucGFzc2VkXG4gICAgICAgICAgICAgICAgICAgICAgICA/IFwiTGludGluZyBwYXNzZWRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgOiBcIkxpbnRpbmcgaXNzdWVzIGZvdW5kXCIsXG4gICAgICAgICAgICAgICAgICAgIGRldGFpbHM6IHJlc3VsdC5kZXRhaWxzLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIFwiYWNjZXB0YW5jZVwiOiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFzc2VkID0gYXdhaXQgdGhpcy5jaGVja0FjY2VwdGFuY2UoY3ljbGUpO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHBhc3NlZCxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogcGFzc2VkXG4gICAgICAgICAgICAgICAgICAgICAgICA/IFwiQWNjZXB0YW5jZSBjcml0ZXJpYSBtZXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgOiBcIkFjY2VwdGFuY2UgY3JpdGVyaWEgbm90IGZ1bGx5IG1ldFwiLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHBhc3NlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBVbmtub3duIGdhdGU6ICR7Z2F0ZX1gLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogR2V0IGdhdGUgY29uZmlndXJhdGlvbiBmcm9tIGJhc2VDb25maWcgKi9cbiAgICBwcml2YXRlIGdldEdhdGVDb25maWcoZ2F0ZTogc3RyaW5nKTogR2F0ZUNvbW1hbmRDb25maWcge1xuICAgICAgICAvLyBOb3JtYWxpemUgZ2F0ZSBuYW1lczogY2Fub25pY2FsIGlzIFwidGVzdFwiLCBhY2NlcHQgXCJ0ZXN0c1wiIGZvciBiYWNrd2FyZCBjb21wYXRcbiAgICAgICAgY29uc3Qgbm9ybWFsaXplZEdhdGUgPVxuICAgICAgICAgICAgZ2F0ZS50b0xvd2VyQ2FzZSgpID09PSBcInRlc3RzXCIgPyBcInRlc3RcIiA6IGdhdGUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgY29uc3QgZ2F0ZUtleSA9IG5vcm1hbGl6ZWRHYXRlIGFzIGtleW9mIHR5cGVvZiB0aGlzLmJhc2VDb25maWcuZ2F0ZXM7XG4gICAgICAgIGNvbnN0IGNvbmZpZ0dhdGUgPSB0aGlzLmJhc2VDb25maWcuZ2F0ZXNbZ2F0ZUtleV07XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIGNvbmZpZ0dhdGUgJiZcbiAgICAgICAgICAgIHR5cGVvZiBjb25maWdHYXRlID09PSBcIm9iamVjdFwiICYmXG4gICAgICAgICAgICBcImNvbW1hbmRcIiBpbiBjb25maWdHYXRlXG4gICAgICAgICkge1xuICAgICAgICAgICAgcmV0dXJuIGNvbmZpZ0dhdGUgYXMgR2F0ZUNvbW1hbmRDb25maWc7XG4gICAgICAgIH1cbiAgICAgICAgLy8gRmFsbGJhY2sgZm9yIGxlZ2FjeSBzdHJpbmcgZm9ybWF0XG4gICAgICAgIHJldHVybiB7IGNvbW1hbmQ6IFN0cmluZyhjb25maWdHYXRlID8/IFwiXCIpIH07XG4gICAgfVxuXG4gICAgLyoqIFJ1biBhIGdhdGUgY29tbWFuZCBhbmQgY2FwdHVyZSByZXN1bHRzICovXG4gICAgcHJpdmF0ZSBhc3luYyBydW5HYXRlQ29tbWFuZChcbiAgICAgICAgZ2F0ZU5hbWU6IHN0cmluZyxcbiAgICAgICAgY29tbWFuZDogc3RyaW5nLFxuICAgICk6IFByb21pc2U8e1xuICAgICAgICBwYXNzZWQ6IGJvb2xlYW47XG4gICAgICAgIGRldGFpbHM6IHtcbiAgICAgICAgICAgIGNvbW1hbmQ6IHN0cmluZztcbiAgICAgICAgICAgIGV4aXRDb2RlOiBudW1iZXIgfCBudWxsO1xuICAgICAgICAgICAgc3Rkb3V0OiBzdHJpbmc7XG4gICAgICAgICAgICBzdGRlcnI6IHN0cmluZztcbiAgICAgICAgICAgIGR1cmF0aW9uTXM6IG51bWJlcjtcbiAgICAgICAgfTtcbiAgICB9PiB7XG4gICAgICAgIGNvbnN0IHN0YXJ0VGltZSA9IERhdGUubm93KCk7XG4gICAgICAgIGxldCBleGl0Q29kZTogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG4gICAgICAgIGxldCBzdGRvdXQgPSBcIlwiO1xuICAgICAgICBsZXQgc3RkZXJyID0gXCJcIjtcblxuICAgICAgICBVSS5pbmZvKGAgIFJ1bm5pbmcgJHtnYXRlTmFtZX06ICR7Y29tbWFuZH1gKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gUnVuIHRoZSBjb21tYW5kXG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gZXhlY1N5bmMoY29tbWFuZCwge1xuICAgICAgICAgICAgICAgIGVuY29kaW5nOiBcInV0Zi04XCIsXG4gICAgICAgICAgICAgICAgY3dkOiB0aGlzLmZsYWdzLndvcmtpbmdEaXIgPz8gcHJvY2Vzcy5jd2QoKSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAxMjAwMDAsIC8vIDIgbWludXRlIHRpbWVvdXQgZm9yIGdhdGVzXG4gICAgICAgICAgICAgICAgbWF4QnVmZmVyOiAxMCAqIDEwMjQgKiAxMDI0LCAvLyAxME1CIGJ1ZmZlclxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzdGRvdXQgPSByZXN1bHQ7XG4gICAgICAgICAgICBleGl0Q29kZSA9IDA7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvciAmJiBcInN0YXR1c1wiIGluIGVycm9yKSB7XG4gICAgICAgICAgICAgICAgZXhpdENvZGUgPSAoZXJyb3IgYXMgeyBzdGF0dXM6IG51bWJlciB9KS5zdGF0dXMgPz8gMTtcbiAgICAgICAgICAgICAgICBzdGRlcnIgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgICAgICAgICAgLy8gQ2FwdHVyZSBzdGRvdXQgZnJvbSBmYWlsZWQgY29tbWFuZCBpZiBhdmFpbGFibGVcbiAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgICAgICAgICAgICAgIGlmIChcInN0ZG91dFwiIGluIGVycm9yICYmIGVycm9yLnN0ZG91dCkge1xuICAgICAgICAgICAgICAgICAgICBzdGRvdXQgPSBTdHJpbmcoZXJyb3Iuc3Rkb3V0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICAgICAgICAgICAgICBpZiAoXCJzdGRlcnJcIiBpbiBlcnJvciAmJiBlcnJvci5zdGRlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RkZXJyID0gU3RyaW5nKGVycm9yLnN0ZGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzdGRlcnIgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBkdXJhdGlvbk1zID0gRGF0ZS5ub3coKSAtIHN0YXJ0VGltZTtcblxuICAgICAgICBjb25zdCBwYXNzZWQgPSBleGl0Q29kZSA9PT0gMDtcblxuICAgICAgICBsb2cuZGVidWcoXCJHYXRlIGNvbW1hbmQgcmVzdWx0XCIsIHtcbiAgICAgICAgICAgIGdhdGU6IGdhdGVOYW1lLFxuICAgICAgICAgICAgY29tbWFuZCxcbiAgICAgICAgICAgIGV4aXRDb2RlLFxuICAgICAgICAgICAgZHVyYXRpb25NcyxcbiAgICAgICAgICAgIHN0ZG91dExlbmd0aDogc3Rkb3V0Lmxlbmd0aCxcbiAgICAgICAgICAgIHN0ZGVyckxlbmd0aDogc3RkZXJyLmxlbmd0aCxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHBhc3NlZCxcbiAgICAgICAgICAgIGRldGFpbHM6IHtcbiAgICAgICAgICAgICAgICBjb21tYW5kLFxuICAgICAgICAgICAgICAgIGV4aXRDb2RlLFxuICAgICAgICAgICAgICAgIHN0ZG91dDogdHJ1bmNhdGVPdXRwdXQoc3Rkb3V0LCAyMDAwKSxcbiAgICAgICAgICAgICAgICBzdGRlcnI6IHRydW5jYXRlT3V0cHV0KHN0ZGVyciwgMTAwMCksXG4gICAgICAgICAgICAgICAgZHVyYXRpb25NcyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqIENoZWNrIGFjY2VwdGFuY2UgY3JpdGVyaWEgKi9cbiAgICBwcml2YXRlIGFzeW5jIGNoZWNrQWNjZXB0YW5jZShjeWNsZTogQ3ljbGVTdGF0ZSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICBsb2cuZGVidWcoXCJDaGVja2luZyBhY2NlcHRhbmNlIGNyaXRlcmlhXCIsIHtcbiAgICAgICAgICAgIGN5Y2xlTnVtYmVyOiBjeWNsZS5jeWNsZU51bWJlcixcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gR2V0IHRoZSB3b3JrIHBoYXNlIG91dHB1dFxuICAgICAgICBjb25zdCB3b3JrUGhhc2UgPSBjeWNsZS5waGFzZXNbUGhhc2UuV09SS107XG4gICAgICAgIGlmICghd29ya1BoYXNlKSB7XG4gICAgICAgICAgICBsb2cud2FybihcIk5vIHdvcmsgcGhhc2UgZm91bmQgaW4gY3ljbGVcIik7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB3b3JrUmVzcG9uc2UgPSB3b3JrUGhhc2UucmVzcG9uc2UudHJpbSgpO1xuXG4gICAgICAgIC8vIFJ1bGUgMTogd29yay5yZXNwb25zZSBtdXN0IGJlIG5vbi1lbXB0eVxuICAgICAgICBpZiAoIXdvcmtSZXNwb25zZSkge1xuICAgICAgICAgICAgbG9nLmRlYnVnKFwiQWNjZXB0YW5jZSBmYWlsZWQ6IGVtcHR5IHdvcmsgcmVzcG9uc2VcIik7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSdWxlIDI6IENoZWNrIGZvciBwcm9ncmVzcyBzaWduYWxcbiAgICAgICAgLy8gUHJvZ3Jlc3Mgc2lnbmFsID0gKE5PIENIQU5HRVMgbWFya2VyIHdpdGggcmVhc29uKSBPUiAoYXQgbGVhc3Qgb25lIHRvb2wgaW52b2tlZCBpbiBhbnkgcGhhc2UpXG4gICAgICAgIGNvbnN0IGhhc05vQ2hhbmdlc01hcmtlciA9IC9OT1xccypDSEFOR0VTP1s6XFxzXS9pLnRlc3Qod29ya1Jlc3BvbnNlKTtcbiAgICAgICAgY29uc3QgaGFzUHJvZ3Jlc3NTaWduYWwgPSB0aGlzLmhhc1Byb2dyZXNzU2lnbmFsKGN5Y2xlKTtcblxuICAgICAgICBpZiAoaGFzTm9DaGFuZ2VzTWFya2VyKSB7XG4gICAgICAgICAgICAvLyBDaGVjayBpZiB0aGVyZSdzIGEgcmVhc29uIHByb3ZpZGVkXG4gICAgICAgICAgICBjb25zdCBoYXNSZWFzb24gPSAvTk9cXHMqQ0hBTkdFUz9bOlxcc10rW0EtWl0vLnRlc3Qod29ya1Jlc3BvbnNlKTtcbiAgICAgICAgICAgIGlmIChoYXNSZWFzb24pIHtcbiAgICAgICAgICAgICAgICBsb2cuZGVidWcoXCJBY2NlcHRhbmNlIHBhc3NlZDogTk8gQ0hBTkdFUyB3aXRoIHJlYXNvblwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChoYXNQcm9ncmVzc1NpZ25hbCkge1xuICAgICAgICAgICAgbG9nLmRlYnVnKFwiQWNjZXB0YW5jZSBwYXNzZWQ6IHByb2dyZXNzIHNpZ25hbCBkZXRlY3RlZFwiKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2hlY2sgaWYgcmVzcG9uc2UgaXMganVzdCBmbHVmZiAodG9vIHNob3J0LCBubyBhY3Rpb25hYmxlIGNvbnRlbnQpXG4gICAgICAgIGlmICh3b3JrUmVzcG9uc2UubGVuZ3RoIDwgMjApIHtcbiAgICAgICAgICAgIGxvZy5kZWJ1ZyhcIkFjY2VwdGFuY2UgZmFpbGVkOiByZXNwb25zZSB0b28gc2hvcnQvZmx1ZmZ5XCIpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2hlY2sgZm9yIGNvbW1vbiBcIkkgd2lsbFwiIHBhdHRlcm5zIHRoYXQgaW5kaWNhdGUgbm8gYWN0aW9uXG4gICAgICAgIGNvbnN0IHdpbGxQYXR0ZXJuID1cbiAgICAgICAgICAgIC9cXGJJICh3aWxsfG5lZWQgdG98c2hvdWxkfG11c3R8aGF2ZSB0b3xhbSBnb2luZyB0bylcXGIvaTtcbiAgICAgICAgaWYgKHdpbGxQYXR0ZXJuLnRlc3Qod29ya1Jlc3BvbnNlKSkge1xuICAgICAgICAgICAgbG9nLmRlYnVnKFxuICAgICAgICAgICAgICAgIFwiQWNjZXB0YW5jZSBmYWlsZWQ6IHJlc3BvbnNlIGNvbnRhaW5zICdJIHdpbGwnIHBhdHRlcm4gKG5vIGFjdGlvbiB0YWtlbilcIixcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiB3ZSBnb3QgaGVyZSBhbmQgbm9uZSBvZiB0aGUgYWJvdmUsIGl0IG1pZ2h0IHN0aWxsIGJlIHZhbGlkIGlmIGl0IG1lbnRpb25zIGNoYW5nZXNcbiAgICAgICAgY29uc3QgbWVudGlvbnNDaGFuZ2VzID1cbiAgICAgICAgICAgIC9cXGIoY2hhbmdlfG1vZGlmeXxjcmVhdGV8dXBkYXRlfGRlbGV0ZXxhZGR8Zml4fGltcGxlbWVudHxyZWZhY3Rvcnx3cml0ZXxydW58dGVzdClcXGIvaS50ZXN0KFxuICAgICAgICAgICAgICAgIHdvcmtSZXNwb25zZSxcbiAgICAgICAgICAgICk7XG4gICAgICAgIGlmIChtZW50aW9uc0NoYW5nZXMpIHtcbiAgICAgICAgICAgIGxvZy5kZWJ1ZyhcbiAgICAgICAgICAgICAgICBcIkFjY2VwdGFuY2UgcGFzc2VkOiByZXNwb25zZSBtZW50aW9ucyBhY3Rpb25hYmxlIGNoYW5nZXNcIixcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxvZy5kZWJ1ZyhcIkFjY2VwdGFuY2UgZmFpbGVkOiBubyB2YWxpZCBwcm9ncmVzcyBzaWduYWxcIik7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKiogQ2hlY2sgaWYgY3ljbGUgaGFzIHByb2dyZXNzIHNpZ25hbCAodG9vbHMgb3IgZ2F0ZSBjb21tYW5kcyBleGVjdXRlZCkgKi9cbiAgICBwcml2YXRlIGhhc1Byb2dyZXNzU2lnbmFsKGN5Y2xlOiBDeWNsZVN0YXRlKTogYm9vbGVhbiB7XG4gICAgICAgIC8vIENoZWNrIGZvciBhbnkgdG9vbCBpbnZvY2F0aW9ucyBpbiBhbnkgcGhhc2VcbiAgICAgICAgY29uc3QgYWxsVG9vbHMgPSB0aGlzLmNvbGxlY3RBbGxUb29scyhjeWNsZSk7XG4gICAgICAgIGlmIChhbGxUb29scy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENoZWNrIGlmIGdhdGVzIGFjdHVhbGx5IHJhbiAobm9uLWVtcHR5IGRldGFpbHMgaW5kaWNhdGUgZXhlY3V0aW9uKVxuICAgICAgICBmb3IgKGNvbnN0IGdhdGVSZXN1bHQgb2YgY3ljbGUuZ2F0ZVJlc3VsdHMpIHtcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICBnYXRlUmVzdWx0LmRldGFpbHMgJiZcbiAgICAgICAgICAgICAgICBcImNvbW1hbmRcIiBpbiBnYXRlUmVzdWx0LmRldGFpbHMgJiZcbiAgICAgICAgICAgICAgICBnYXRlUmVzdWx0LmRldGFpbHMuY29tbWFuZFxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqIEhhbmRsZSBsb29wIHN0b3AgKi9cbiAgICBwcml2YXRlIGFzeW5jIGhhbmRsZVN0b3AoXG4gICAgICAgIHJlYXNvbjogU3RvcFJlYXNvbixcbiAgICAgICAgc3VtbWFyeTogc3RyaW5nLFxuICAgICk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCBzdGF0ZSA9IHRoaXMuZmxvd1N0b3JlLmxvYWQoKTtcbiAgICAgICAgaWYgKHN0YXRlKSB7XG4gICAgICAgICAgICBsZXQgcnVuU3RhdHVzOiBSdW5TdGF0dXM7XG4gICAgICAgICAgICBzd2l0Y2ggKHJlYXNvbikge1xuICAgICAgICAgICAgICAgIGNhc2UgU3RvcFJlYXNvbi5DT01QTEVUSU9OX1BST01JU0U6XG4gICAgICAgICAgICAgICAgICAgIHJ1blN0YXR1cyA9IFJ1blN0YXR1cy5DT01QTEVURUQ7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgU3RvcFJlYXNvbi5TVFVDSzpcbiAgICAgICAgICAgICAgICAgICAgcnVuU3RhdHVzID0gUnVuU3RhdHVzLlNUVUNLO1xuICAgICAgICAgICAgICAgICAgICAvLyBOb3RpZnkgRGlzY29yZDogc3R1Y2tcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXNjb3JkV2ViaG9vaz8ubm90aWZ5U3R1Y2tPckFib3J0ZWQoXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5jdXJyZW50Q3ljbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBcIlNUVUNLXCIsXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgU3RvcFJlYXNvbi5VU0VSX0FCT1JUOlxuICAgICAgICAgICAgICAgICAgICBydW5TdGF0dXMgPSBSdW5TdGF0dXMuQUJPUlRFRDtcbiAgICAgICAgICAgICAgICAgICAgLy8gTm90aWZ5IERpc2NvcmQ6IGFib3J0ZWRcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXNjb3JkV2ViaG9vaz8ubm90aWZ5U3R1Y2tPckFib3J0ZWQoXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5jdXJyZW50Q3ljbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBcIkFCT1JURURcIixcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBTdG9wUmVhc29uLkVSUk9SOlxuICAgICAgICAgICAgICAgICAgICBydW5TdGF0dXMgPSBSdW5TdGF0dXMuRkFJTEVEO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBydW5TdGF0dXMgPSBSdW5TdGF0dXMuRkFJTEVEO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5mbG93U3RvcmUudXBkYXRlU3RhdHVzKHJ1blN0YXR1cywgcmVhc29uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIFVJLmhlYWRlcihcIkxvb3AgQ29tcGxldGVcIik7XG4gICAgICAgIFVJLmluZm8oYFN0b3AgcmVhc29uOiAke3JlYXNvbn1gKTtcbiAgICAgICAgVUkuaW5mbyhgU3VtbWFyeTogJHtzdW1tYXJ5fWApO1xuXG4gICAgICAgIGxvZy5pbmZvKFwiUmFscGggbG9vcCBzdG9wcGVkXCIsIHsgcmVhc29uLCBzdW1tYXJ5IH0pO1xuICAgIH1cbn1cblxuLyoqIENyZWF0ZSBSYWxwaCBMb29wIFJ1bm5lciBmcm9tIGZsYWdzICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY3JlYXRlUmFscGhMb29wUnVubmVyKFxuICAgIGZsYWdzOiBSYWxwaEZsYWdzLFxuICAgIGJhc2VDb25maWc6IEFpRW5nQ29uZmlnLFxuKTogUHJvbWlzZTxSYWxwaExvb3BSdW5uZXI+IHtcbiAgICAvLyBDcmVhdGUgb3B0aW1pemVyIGZvciBpbml0aWFsIHByb21wdCBwcm9jZXNzaW5nXG4gICAgY29uc3Qgb3B0aW1pemVyID0gbmV3IFByb21wdE9wdGltaXplcih7XG4gICAgICAgIGF1dG9BcHByb3ZlOiBmbGFncy5jaSA/PyBmYWxzZSxcbiAgICAgICAgdmVyYm9zaXR5OiBmbGFncy52ZXJib3NlID8gXCJ2ZXJib3NlXCIgOiBcIm5vcm1hbFwiLFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIG5ldyBSYWxwaExvb3BSdW5uZXIoZmxhZ3MsIGJhc2VDb25maWcsIG9wdGltaXplcik7XG59XG4iLAogICAgIi8qKlxuICogT3BlbkNvZGUgU0RLIEJhY2tlbmQgV3JhcHBlclxuICpcbiAqIFByb3ZpZGVzIHNlc3Npb24gbWFuYWdlbWVudCBhbmQgbWVzc2FnZSBzZW5kaW5nIGNhcGFiaWxpdGllc1xuICogZm9yIGFpLWVuZyByYWxwaCBydW5uZXIgdXNpbmcgT3BlbkNvZGUgU0RLLlxuICovXG5cbmltcG9ydCB7IGNyZWF0ZVNlcnZlciB9IGZyb20gXCJub2RlOm5ldFwiO1xuaW1wb3J0IHtcbiAgICB0eXBlIE9wZW5jb2RlQ2xpZW50LFxuICAgIGNyZWF0ZU9wZW5jb2RlLFxuICAgIGNyZWF0ZU9wZW5jb2RlQ2xpZW50LFxufSBmcm9tIFwiQG9wZW5jb2RlLWFpL3Nka1wiO1xuaW1wb3J0IHsgTG9nIH0gZnJvbSBcIi4uLy4uL3V0aWwvbG9nXCI7XG5cbmNvbnN0IGxvZyA9IExvZy5jcmVhdGUoeyBzZXJ2aWNlOiBcIm9wZW5jb2RlLWNsaWVudFwiIH0pO1xuXG4vKipcbiAqIFJlc3BvbnNlIGludGVyZmFjZSBmb3IgbWVzc2FnZXNcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBNZXNzYWdlUmVzcG9uc2Uge1xuICAgIGNvbnRlbnQ6IHN0cmluZztcbn1cblxuLyoqXG4gKiBTdHJlYW1pbmcgcmVzcG9uc2UgaW50ZXJmYWNlXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU3RyZWFtaW5nUmVzcG9uc2Uge1xuICAgIC8qKiBSZWFkYWJsZSBzdHJlYW0gb2YgcmVzcG9uc2UgY2h1bmtzICovXG4gICAgc3RyZWFtOiBSZWFkYWJsZVN0cmVhbTxVaW50OEFycmF5PjtcbiAgICAvKiogUHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGNvbXBsZXRlIHJlc3BvbnNlIHdoZW4gc3RyZWFtIGVuZHMgKi9cbiAgICBjb21wbGV0ZTogUHJvbWlzZTxNZXNzYWdlUmVzcG9uc2U+O1xufVxuXG4vKipcbiAqIFNlc3Npb24gaW50ZXJmYWNlIGZvciBhaS1lbmcgcnVubmVyXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU2Vzc2lvbiB7XG4gICAgaWQ6IHN0cmluZztcbiAgICBzZW5kTWVzc2FnZTogKG1lc3NhZ2U6IHN0cmluZykgPT4gUHJvbWlzZTxNZXNzYWdlUmVzcG9uc2U+O1xuICAgIHNlbmRNZXNzYWdlU3RyZWFtOiAobWVzc2FnZTogc3RyaW5nKSA9PiBQcm9taXNlPFN0cmVhbWluZ1Jlc3BvbnNlPjtcbiAgICBjbG9zZTogKCkgPT4gUHJvbWlzZTx2b2lkPjtcbiAgICAvKiogVG9vbCBpbnZvY2F0aW9ucyBjYXB0dXJlZCBkdXJpbmcgdGhpcyBzZXNzaW9uICovXG4gICAgX3Rvb2xJbnZvY2F0aW9ucz86IEFycmF5PHtcbiAgICAgICAgaWQ6IHN0cmluZztcbiAgICAgICAgbmFtZTogc3RyaW5nO1xuICAgICAgICBpbnB1dD86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgICAgICBvdXRwdXQ/OiBzdHJpbmc7XG4gICAgICAgIHN0YXR1czogXCJva1wiIHwgXCJlcnJvclwiO1xuICAgICAgICBlcnJvcj86IHN0cmluZztcbiAgICAgICAgc3RhcnRlZEF0Pzogc3RyaW5nO1xuICAgICAgICBjb21wbGV0ZWRBdD86IHN0cmluZztcbiAgICB9Pjtcbn1cblxuLyoqXG4gKiBDbGllbnQgY29uZmlndXJhdGlvbiBvcHRpb25zXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ2xpZW50Q29uZmlnIHtcbiAgICAvKiogQ3VzdG9tIGNsaWVudCBpbnN0YW5jZSAoZm9yIHRlc3RpbmcpICovXG4gICAgY2xpZW50PzogT3BlbmNvZGVDbGllbnQ7XG4gICAgLyoqIENvbm5lY3Rpb24gdGltZW91dCBpbiBtaWxsaXNlY29uZHMgKGRlZmF1bHQ6IDEwMDAwKSAqL1xuICAgIHRpbWVvdXQ/OiBudW1iZXI7XG4gICAgLyoqIFJldHJ5IGF0dGVtcHRzIGZvciBmYWlsZWQgb3BlcmF0aW9ucyAqL1xuICAgIHJldHJ5QXR0ZW1wdHM/OiBudW1iZXI7XG4gICAgLyoqIFByb21wdCB0aW1lb3V0IGluIG1pbGxpc2Vjb25kcyAodXNlZCBhcyBhbiBpZGxlIHRpbWVvdXQgZm9yIHN0cmVhbWluZykgKi9cbiAgICBwcm9tcHRUaW1lb3V0PzogbnVtYmVyO1xuICAgIC8qKiBEaXJlY3Rvcnkvd29ya3RyZWUgY29udGV4dCB0byBydW4gT3BlbkNvZGUgaW4gKGRlZmF1bHRzIHRvIHByb2Nlc3MuY3dkKCkpICovXG4gICAgZGlyZWN0b3J5Pzogc3RyaW5nO1xuICAgIC8qKiBVUkwgb2YgZXhpc3RpbmcgT3BlbkNvZGUgc2VydmVyIHRvIHJldXNlIChpZiBwcm92aWRlZCwgd29uJ3Qgc3Bhd24gbmV3IHNlcnZlcikgKi9cbiAgICBleGlzdGluZ1NlcnZlclVybD86IHN0cmluZztcbiAgICAvKiogU2VydmVyIHN0YXJ0dXAgdGltZW91dCBpbiBtaWxsaXNlY29uZHMgKGRlZmF1bHQ6IDEwMDAwKSAqL1xuICAgIHNlcnZlclN0YXJ0dXBUaW1lb3V0PzogbnVtYmVyO1xuICAgIC8qKiBOT1RFOiB3b3JraW5nRGlyIHBhcmFtZXRlciBpcyBub3Qgc3VwcG9ydGVkIGJ5IHRoZSBTREtcbiAgICAgKiBTcGF3bmVkIE9wZW5Db2RlIHNlcnZlcnMgd2lsbCB1c2UgdGhlIGNhbGxpbmcgZGlyZWN0b3J5IGJ5IGRlZmF1bHQgKHByb2Nlc3MuY3dkKCkpXG4gICAgICogVXNlIE9QRU5DT0RFX1VSTCB0byBjb25uZWN0IHRvIGEgZGlmZmVyZW50IE9wZW5Db2RlIGluc3RhbmNlIGluc3RlYWRcbiAgICAgKi9cbn1cblxuLyoqXG4gKiBPcGVuQ29kZSBDbGllbnQgV3JhcHBlclxuICpcbiAqIFdyYXBzIE9wZW5Db2RlIFNESyB0byBwcm92aWRlIHNlc3Npb24gbWFuYWdlbWVudFxuICogYW5kIGVycm9yIGhhbmRsaW5nIGZvciByYWxwaCBydW5uZXIuXG4gKi9cbmV4cG9ydCBjbGFzcyBPcGVuQ29kZUNsaWVudCB7XG4gICAgcHJpdmF0ZSBjbGllbnQ6IE9wZW5jb2RlQ2xpZW50O1xuICAgIHByaXZhdGUgdGltZW91dDogbnVtYmVyO1xuICAgIHByaXZhdGUgcmV0cnlBdHRlbXB0czogbnVtYmVyO1xuICAgIHByaXZhdGUgYWN0aXZlU2Vzc2lvbnM6IE1hcDxzdHJpbmcsIFNlc3Npb24+O1xuICAgIHByaXZhdGUgcHJvbXB0VGltZW91dDogbnVtYmVyO1xuICAgIHByaXZhdGUgZGlyZWN0b3J5OiBzdHJpbmcgPSBwcm9jZXNzLmN3ZCgpO1xuICAgIHByaXZhdGUgc2VydmVyOiB7IHVybDogc3RyaW5nOyBjbG9zZTogKCkgPT4gdm9pZCB9IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBzZXJ2ZXJTdGFydHVwVGltZW91dDogbnVtYmVyO1xuXG4gICAgLyoqXG4gICAgICogUHJpdmF0ZSBjb25zdHJ1Y3RvciAtIHVzZSBzdGF0aWMgY3JlYXRlKCkgZmFjdG9yeSBtZXRob2QgaW5zdGVhZFxuICAgICAqL1xuICAgIHByaXZhdGUgY29uc3RydWN0b3IoXG4gICAgICAgIGNsaWVudDogT3BlbmNvZGVDbGllbnQsXG4gICAgICAgIHNlcnZlcjogeyB1cmw6IHN0cmluZzsgY2xvc2U6ICgpID0+IHZvaWQgfSB8IG51bGwsXG4gICAgICAgIGNvbmZpZzogQ2xpZW50Q29uZmlnID0ge30sXG4gICAgKSB7XG4gICAgICAgIHRoaXMuY2xpZW50ID0gY2xpZW50O1xuICAgICAgICB0aGlzLnNlcnZlciA9IHNlcnZlcjtcbiAgICAgICAgdGhpcy50aW1lb3V0ID0gY29uZmlnLnRpbWVvdXQgfHwgMzAwMDA7XG4gICAgICAgIHRoaXMucmV0cnlBdHRlbXB0cyA9IGNvbmZpZy5yZXRyeUF0dGVtcHRzIHx8IDM7XG5cbiAgICAgICAgY29uc3QgZW52UHJvbXB0VGltZW91dCA9IE51bWJlci5wYXJzZUludChcbiAgICAgICAgICAgIHByb2Nlc3MuZW52Lk9QRU5DT0RFX1BST01QVF9USU1FT1VUX01TID8/IFwiXCIsXG4gICAgICAgICAgICAxMCxcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgcmVzb2x2ZWRQcm9tcHRUaW1lb3V0ID0gTnVtYmVyLmlzRmluaXRlKGVudlByb21wdFRpbWVvdXQpXG4gICAgICAgICAgICA/IGVudlByb21wdFRpbWVvdXRcbiAgICAgICAgICAgIDogdW5kZWZpbmVkO1xuXG4gICAgICAgIC8vIEZvciBzdHJlYW1pbmcsIHRoaXMgYWN0cyBhcyBhbiBpZGxlIHRpbWVvdXQgKHJlc2V0IG9uIHN0cmVhbWVkIGV2ZW50cylcbiAgICAgICAgdGhpcy5wcm9tcHRUaW1lb3V0ID1cbiAgICAgICAgICAgIGNvbmZpZy5wcm9tcHRUaW1lb3V0ID8/IHJlc29sdmVkUHJvbXB0VGltZW91dCA/PyAxMjAwMDA7IC8vIDEyMCBzZWNvbmRzIGRlZmF1bHRcblxuICAgICAgICB0aGlzLmRpcmVjdG9yeSA9XG4gICAgICAgICAgICBjb25maWcuZGlyZWN0b3J5IHx8IHByb2Nlc3MuZW52Lk9QRU5DT0RFX0RJUkVDVE9SWSB8fCBwcm9jZXNzLmN3ZCgpO1xuXG4gICAgICAgIHRoaXMuc2VydmVyU3RhcnR1cFRpbWVvdXQgPSBjb25maWcuc2VydmVyU3RhcnR1cFRpbWVvdXQgfHwgMTAwMDA7IC8vIDEwIHNlY29uZHMgZGVmYXVsdFxuICAgICAgICB0aGlzLmFjdGl2ZVNlc3Npb25zID0gbmV3IE1hcCgpO1xuXG4gICAgICAgIGxvZy5kZWJ1ZyhcIk9wZW5Db2RlQ2xpZW50IGluaXRpYWxpemVkXCIsIHtcbiAgICAgICAgICAgIGhhc093blNlcnZlcjogISF0aGlzLnNlcnZlcixcbiAgICAgICAgICAgIHRpbWVvdXQ6IHRoaXMudGltZW91dCxcbiAgICAgICAgICAgIHNlcnZlclN0YXJ0dXBUaW1lb3V0OiB0aGlzLnNlcnZlclN0YXJ0dXBUaW1lb3V0LFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgYW4gYXZhaWxhYmxlIHBvcnQgZm9yIE9wZW5Db2RlIHNlcnZlclxuICAgICAqXG4gICAgICogSU1QT1JUQU5UOiBBbHdheXMgYXZvaWQgcG9ydCA0MDk2IHRvIHByZXZlbnQgY29uZmxpY3RzIHdpdGggdXNlcidzIGV4aXN0aW5nIHNlcnZlclxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIGFzeW5jIGdldEF2YWlsYWJsZVBvcnQoKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIENoZWNrIGlmIGRlZmF1bHQgcG9ydCBpcyBpbiB1c2UgYW5kIGxvZyBhY2NvcmRpbmdseVxuICAgICAgICAgICAgY29uc3QgZGVmYXVsdFBvcnQgPSA0MDk2O1xuICAgICAgICAgICAgY29uc3QgaXNEZWZhdWx0QXZhaWxhYmxlID1cbiAgICAgICAgICAgICAgICBhd2FpdCBPcGVuQ29kZUNsaWVudC5pc1BvcnRBdmFpbGFibGUoZGVmYXVsdFBvcnQpO1xuXG4gICAgICAgICAgICBpZiAoIWlzRGVmYXVsdEF2YWlsYWJsZSkge1xuICAgICAgICAgICAgICAgIGxvZy5pbmZvKFxuICAgICAgICAgICAgICAgICAgICBcIkV4aXN0aW5nIHNlcnZlciBkZXRlY3RlZCBvbiBwb3J0IDQwOTY7IHNwYXduaW5nIGlzb2xhdGVkIHNlcnZlciBvbiBkeW5hbWljIHBvcnRcIixcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsb2cuZGVidWcoXG4gICAgICAgICAgICAgICAgICAgIFwiRGVmYXVsdCBwb3J0IDQwOTYgaXMgYXZhaWxhYmxlIGJ1dCBhdm9pZGluZyBpdCBmb3IgaXNvbGF0aW9uXCIsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQWx3YXlzIHVzZSBkeW5hbWljIHBvcnQgdG8gYXZvaWQgY29uZmxpY3RzIHdpdGggdXNlcidzIGV4aXN0aW5nIHNlcnZlclxuICAgICAgICAgICAgY29uc3QgZHluYW1pY1BvcnQgPSBhd2FpdCBPcGVuQ29kZUNsaWVudC5maW5kQXZhaWxhYmxlUG9ydCgpO1xuICAgICAgICAgICAgbG9nLmluZm8oXG4gICAgICAgICAgICAgICAgYFNwYXduaW5nIGlzb2xhdGVkIHNlcnZlciBvbiBkeW5hbWljIHBvcnQ6ICR7ZHluYW1pY1BvcnR9YCxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICByZXR1cm4gZHluYW1pY1BvcnQ7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1zZyA9XG4gICAgICAgICAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICAgICAgbG9nLmVycm9yKFwiRmFpbGVkIHRvIHNlbGVjdCBPcGVuQ29kZSBzZXJ2ZXIgcG9ydFwiLCB7XG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yTXNnLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgYEZhaWxlZCB0byBzZWxlY3QgT3BlbkNvZGUgc2VydmVyIHBvcnQ6ICR7ZXJyb3JNc2d9YCxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBhIHNwZWNpZmljIHBvcnQgaXMgYXZhaWxhYmxlXG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgYXN5bmMgaXNQb3J0QXZhaWxhYmxlKHBvcnQ6IG51bWJlcik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNlcnZlciA9IGNyZWF0ZVNlcnZlcigpO1xuXG4gICAgICAgICAgICBzZXJ2ZXIubGlzdGVuKHBvcnQsICgpID0+IHtcbiAgICAgICAgICAgICAgICBzZXJ2ZXIub25jZShcImNsb3NlXCIsICgpID0+IHJlc29sdmUodHJ1ZSkpO1xuICAgICAgICAgICAgICAgIHNlcnZlci5jbG9zZSgpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHNlcnZlci5vbihcImVycm9yXCIsICgpID0+IHJlc29sdmUoZmFsc2UpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmluZCBhbiBhdmFpbGFibGUgcG9ydCBkeW5hbWljYWxseVxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIGFzeW5jIGZpbmRBdmFpbGFibGVQb3J0KCk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzZXJ2ZXIgPSBjcmVhdGVTZXJ2ZXIoKTtcblxuICAgICAgICAgICAgc2VydmVyLmxpc3RlbigwLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgYWRkcmVzcyA9IHNlcnZlci5hZGRyZXNzKCk7XG4gICAgICAgICAgICAgICAgaWYgKGFkZHJlc3MgJiYgdHlwZW9mIGFkZHJlc3MgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VydmVyLm9uY2UoXCJjbG9zZVwiLCAoKSA9PiByZXNvbHZlKGFkZHJlc3MucG9ydCkpO1xuICAgICAgICAgICAgICAgICAgICBzZXJ2ZXIuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKFwiRmFpbGVkIHRvIGdldCBzZXJ2ZXIgYWRkcmVzc1wiKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHNlcnZlci5vbihcImVycm9yXCIsIHJlamVjdCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFN0YXRpYyBmYWN0b3J5IG1ldGhvZCB0byBjcmVhdGUgYW4gT3BlbkNvZGVDbGllbnRcbiAgICAgKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgY2xpZW50IHdpdGggZWl0aGVyOlxuICAgICAqIDEuIEEgZnJlc2ggT3BlbkNvZGUgc2VydmVyIChkZWZhdWx0IGJlaGF2aW9yKVxuICAgICAqIDIuIEFuIGV4aXN0aW5nIHNlcnZlciBVUkwgKGlmIGV4aXN0aW5nU2VydmVyVXJsIGlzIHByb3ZpZGVkKVxuICAgICAqIDMuIEEgY3VzdG9tIGNsaWVudCBpbnN0YW5jZSAoZm9yIHRlc3RpbmcpXG4gICAgICpcbiAgICAgKiBOb3RlOiBTcGF3bmVkIE9wZW5Db2RlIHNlcnZlcnMgd2lsbCB1c2UgdG8gY2FsbGluZyBkaXJlY3RvcnkgYnkgZGVmYXVsdCAocHJvY2Vzcy5jd2QoKSlcbiAgICAgKiBVc2UgT1BFTkNPREVfVVJMIHRvIGNvbm5lY3QgdG8gYSBkaWZmZXJlbnQgT3BlbkNvZGUgaW5zdGFuY2VcbiAgICAgKi9cbiAgICBzdGF0aWMgYXN5bmMgY3JlYXRlKGNvbmZpZzogQ2xpZW50Q29uZmlnID0ge30pOiBQcm9taXNlPE9wZW5Db2RlQ2xpZW50PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBJZiBjdXN0b20gY2xpZW50IHByb3ZpZGVkIChmb3IgdGVzdGluZyksIHVzZSBpdCBkaXJlY3RseVxuICAgICAgICAgICAgaWYgKGNvbmZpZy5jbGllbnQpIHtcbiAgICAgICAgICAgICAgICBsb2cuaW5mbyhcIkNyZWF0aW5nIE9wZW5Db2RlQ2xpZW50IHdpdGggY3VzdG9tIGNsaWVudCBpbnN0YW5jZVwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IE9wZW5Db2RlQ2xpZW50KGNvbmZpZy5jbGllbnQsIG51bGwsIGNvbmZpZyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIElmIGV4aXN0aW5nIHNlcnZlciBVUkwgcHJvdmlkZWQsIGNvbm5lY3QgdG8gaXRcbiAgICAgICAgICAgIGlmIChjb25maWcuZXhpc3RpbmdTZXJ2ZXJVcmwpIHtcbiAgICAgICAgICAgICAgICBsb2cuaW5mbyhcIkNvbm5lY3RpbmcgdG8gZXhpc3RpbmcgT3BlbkNvZGUgc2VydmVyXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBjb25maWcuZXhpc3RpbmdTZXJ2ZXJVcmwsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2xpZW50ID0gY3JlYXRlT3BlbmNvZGVDbGllbnQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFzZVVybDogY29uZmlnLmV4aXN0aW5nU2VydmVyVXJsLFxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBWZXJpZnkgY29ubmVjdGlvbiBieSBtYWtpbmcgYSB0ZXN0IHJlcXVlc3RcbiAgICAgICAgICAgICAgICAgICAgbG9nLmRlYnVnKFwiVmVyaWZ5aW5nIGNvbm5lY3Rpb24gdG8gZXhpc3Rpbmcgc2VydmVyLi4uXCIpO1xuICAgICAgICAgICAgICAgICAgICAvLyBOb3RlOiBXZSdsbCBza2lwIHZlcmlmaWNhdGlvbiBmb3Igbm93IHRvIGF2b2lkIHVubmVjZXNzYXJ5IEFQSSBjYWxsc1xuICAgICAgICAgICAgICAgICAgICAvLyBUaGUgY29ubmVjdGlvbiB3aWxsIGJlIHZlcmlmaWVkIHdoZW4gZmlyc3Qgc2Vzc2lvbiBpcyBjcmVhdGVkXG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBPcGVuQ29kZUNsaWVudChjbGllbnQsIG51bGwsIGNvbmZpZyk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNc2cgPVxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICBsb2cuZXJyb3IoXCJGYWlsZWQgdG8gY29ubmVjdCB0byBleGlzdGluZyBzZXJ2ZXJcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBjb25maWcuZXhpc3RpbmdTZXJ2ZXJVcmwsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JNc2csXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIERlZmF1bHQ6IHNwYXduIGEgbmV3IE9wZW5Db2RlIHNlcnZlclxuICAgICAgICAgICAgLy8gTm90ZTogU3Bhd25lZCBzZXJ2ZXJzIHdpbGwgdXNlIHRvIGNhbGxpbmcgZGlyZWN0b3J5IGJ5IGRlZmF1bHRcbiAgICAgICAgICAgIC8vIFVzZSBPUEVOQ09ERV9VUkwgdG8gY29ubmVjdCB0byBhIGRpZmZlcmVudCBPcGVuQ29kZSBpbnN0YW5jZVxuICAgICAgICAgICAgbG9nLmluZm8oXCJTcGF3bmluZyBuZXcgT3BlbkNvZGUgc2VydmVyLi4uXCIsIHtcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiBjb25maWcuc2VydmVyU3RhcnR1cFRpbWVvdXQgfHwgMTAwMDAsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgY29uc3QgYXZhaWxhYmxlUG9ydCA9IGF3YWl0IE9wZW5Db2RlQ2xpZW50LmdldEF2YWlsYWJsZVBvcnQoKTtcblxuICAgICAgICAgICAgY29uc3QgeyBjbGllbnQsIHNlcnZlciB9ID0gYXdhaXQgY3JlYXRlT3BlbmNvZGUoe1xuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IGNvbmZpZy5zZXJ2ZXJTdGFydHVwVGltZW91dCB8fCAxMDAwMCxcbiAgICAgICAgICAgICAgICBwb3J0OiBhdmFpbGFibGVQb3J0LFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGxvZy5pbmZvKFwiT3BlbkNvZGUgc2VydmVyIHN0YXJ0ZWQgc3VjY2Vzc2Z1bGx5XCIpO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBPcGVuQ29kZUNsaWVudChjbGllbnQsIHNlcnZlciwgY29uZmlnKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTXNnID1cbiAgICAgICAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgICAgICBsb2cuZXJyb3IoXCJGYWlsZWQgdG8gY3JlYXRlIE9wZW5Db2RlQ2xpZW50XCIsIHsgZXJyb3I6IGVycm9yTXNnIH0pO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gY3JlYXRlIE9wZW5Db2RlQ2xpZW50OiAke2Vycm9yTXNnfWApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IE9wZW5Db2RlIHNlc3Npb24gd2l0aCBhIGdpdmVuIHByb21wdFxuICAgICAqL1xuICAgIGFzeW5jIGNyZWF0ZVNlc3Npb24ocHJvbXB0OiBzdHJpbmcpOiBQcm9taXNlPFNlc3Npb24+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIENyZWF0ZSBzZXNzaW9uIHVzaW5nIFNES1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5jbGllbnQuc2Vzc2lvbi5jcmVhdGUoe1xuICAgICAgICAgICAgICAgIGJvZHk6IHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IFwiYWktZW5nIHJhbHBoIHNlc3Npb25cIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmICghcmVzdWx0LmRhdGEpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgIGBGYWlsZWQgdG8gY3JlYXRlIE9wZW5Db2RlIHNlc3Npb246ICR7SlNPTi5zdHJpbmdpZnkocmVzdWx0LmVycm9yKX1gLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHNka1Nlc3Npb24gPSByZXN1bHQuZGF0YTtcblxuICAgICAgICAgICAgLy8gRGVmZXIgdGhlIGluaXRpYWwgcHJvbXB0IHVudGlsIHRoZSBmaXJzdCBtZXNzYWdlIGlzIHNlbnQuXG4gICAgICAgICAgICAvLyBUaGlzIGF2b2lkcyBibG9ja2luZyBzZXNzaW9uIGNyZWF0aW9uIGFuZCBlbmFibGVzIHN0cmVhbWluZyBvdXRwdXRcbiAgICAgICAgICAgIC8vIGV2ZW4gd2hlbiB0aGUgaW5pdGlhbCBwcm9tcHQgaXMgbGFyZ2Ugb3Igc2xvdyB0byBwcm9jZXNzLlxuICAgICAgICAgICAgbGV0IHBlbmRpbmdJbml0aWFsUHJvbXB0ID0gcHJvbXB0LnRyaW0oKTtcbiAgICAgICAgICAgIGNvbnN0IGJ1aWxkRmlyc3RNZXNzYWdlID0gKG1lc3NhZ2U6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghcGVuZGluZ0luaXRpYWxQcm9tcHQpIHJldHVybiBtZXNzYWdlO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbWJpbmVkID0gYCR7cGVuZGluZ0luaXRpYWxQcm9tcHR9XFxuXFxuLS0tXFxuXFxuJHttZXNzYWdlfWA7XG4gICAgICAgICAgICAgICAgcGVuZGluZ0luaXRpYWxQcm9tcHQgPSBcIlwiO1xuICAgICAgICAgICAgICAgIHJldHVybiBjb21iaW5lZDtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIEluaXRpYWxpemUgdG9vbCBpbnZvY2F0aW9ucyB0cmFja2VyXG4gICAgICAgICAgICBjb25zdCB0b29sSW52b2NhdGlvbnM6IFNlc3Npb25bXCJfdG9vbEludm9jYXRpb25zXCJdID0gW107XG5cbiAgICAgICAgICAgIC8vIFdyYXAgd2l0aCBvdXIgc2Vzc2lvbiBpbnRlcmZhY2VcbiAgICAgICAgICAgIGNvbnN0IHNlc3Npb246IFNlc3Npb24gPSB7XG4gICAgICAgICAgICAgICAgaWQ6IHNka1Nlc3Npb24uaWQgfHwgdGhpcy5nZW5lcmF0ZVNlc3Npb25JZCgpLFxuICAgICAgICAgICAgICAgIF90b29sSW52b2NhdGlvbnM6IHRvb2xJbnZvY2F0aW9ucyxcbiAgICAgICAgICAgICAgICBzZW5kTWVzc2FnZTogYXN5bmMgKG1lc3NhZ2U6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5oYW5kbGVTZW5kTWVzc2FnZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHNka1Nlc3Npb24uaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBidWlsZEZpcnN0TWVzc2FnZShtZXNzYWdlKSxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNlbmRNZXNzYWdlU3RyZWFtOiBhc3luYyAobWVzc2FnZTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmhhbmRsZVNlbmRNZXNzYWdlU3RyZWFtKFxuICAgICAgICAgICAgICAgICAgICAgICAgc2RrU2Vzc2lvbi5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkRmlyc3RNZXNzYWdlKG1lc3NhZ2UpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbEludm9jYXRpb25zLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY2xvc2U6IGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaGFuZGxlU2Vzc2lvbkNsb3NlKHNka1Nlc3Npb24uaWQpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBTdG9yZSBhY3RpdmUgc2Vzc2lvblxuICAgICAgICAgICAgdGhpcy5hY3RpdmVTZXNzaW9ucy5zZXQoc2Vzc2lvbi5pZCwgc2Vzc2lvbik7XG5cbiAgICAgICAgICAgIHJldHVybiBzZXNzaW9uO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID1cbiAgICAgICAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgYEZhaWxlZCB0byBjcmVhdGUgT3BlbkNvZGUgc2Vzc2lvbjogJHtlcnJvck1lc3NhZ2V9YCxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZW5kIGEgbWVzc2FnZSB0byBhbiBleGlzdGluZyBzZXNzaW9uXG4gICAgICovXG4gICAgYXN5bmMgc2VuZE1lc3NhZ2UoXG4gICAgICAgIHNlc3Npb25JZDogc3RyaW5nLFxuICAgICAgICBtZXNzYWdlOiBzdHJpbmcsXG4gICAgKTogUHJvbWlzZTxNZXNzYWdlUmVzcG9uc2U+IHtcbiAgICAgICAgY29uc3Qgc2Vzc2lvbiA9IHRoaXMuYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25JZCk7XG5cbiAgICAgICAgaWYgKCFzZXNzaW9uKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFNlc3Npb24gbm90IGZvdW5kOiAke3Nlc3Npb25JZH1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmhhbmRsZVNlbmRNZXNzYWdlKHNlc3Npb25JZCwgbWVzc2FnZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xvc2UgYW4gYWN0aXZlIHNlc3Npb25cbiAgICAgKi9cbiAgICBhc3luYyBjbG9zZVNlc3Npb24oc2Vzc2lvbklkOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgY29uc3Qgc2Vzc2lvbiA9IHRoaXMuYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25JZCk7XG5cbiAgICAgICAgaWYgKCFzZXNzaW9uKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFNlc3Npb24gbm90IGZvdW5kOiAke3Nlc3Npb25JZH1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGF3YWl0IHRoaXMuaGFuZGxlU2Vzc2lvbkNsb3NlKHNlc3Npb25JZCk7XG4gICAgICAgIHRoaXMuYWN0aXZlU2Vzc2lvbnMuZGVsZXRlKHNlc3Npb25JZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IGFsbCBhY3RpdmUgc2Vzc2lvbiBJRHNcbiAgICAgKi9cbiAgICBnZXRBY3RpdmVTZXNzaW9ucygpOiBzdHJpbmdbXSB7XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuYWN0aXZlU2Vzc2lvbnMua2V5cygpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBhIHNlc3Npb24gaXMgYWN0aXZlXG4gICAgICovXG4gICAgaXNTZXNzaW9uQWN0aXZlKHNlc3Npb25JZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLmFjdGl2ZVNlc3Npb25zLmhhcyhzZXNzaW9uSWQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENsb3NlIGFsbCBhY3RpdmUgc2Vzc2lvbnNcbiAgICAgKi9cbiAgICBhc3luYyBjbG9zZUFsbFNlc3Npb25zKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCBjbG9zZVByb21pc2VzID0gQXJyYXkuZnJvbSh0aGlzLmFjdGl2ZVNlc3Npb25zLmtleXMoKSkubWFwKFxuICAgICAgICAgICAgKHNlc3Npb25JZCkgPT5cbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZVNlc3Npb25DbG9zZShzZXNzaW9uSWQpLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1zZyA9XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIGxvZy53YXJuKFwiRXJyb3IgY2xvc2luZyBzZXNzaW9uXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvck1zZyxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICk7XG5cbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoY2xvc2VQcm9taXNlcyk7XG4gICAgICAgIHRoaXMuYWN0aXZlU2Vzc2lvbnMuY2xlYXIoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBIYW5kbGUgc2VuZGluZyBhIG1lc3NhZ2Ugd2l0aCBzdHJlYW1pbmcgc3VwcG9ydFxuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgaGFuZGxlU2VuZE1lc3NhZ2VTdHJlYW0oXG4gICAgICAgIHNlc3Npb25JZDogc3RyaW5nLFxuICAgICAgICBtZXNzYWdlOiBzdHJpbmcsXG4gICAgICAgIHRvb2xJbnZvY2F0aW9ucz86IFNlc3Npb25bXCJfdG9vbEludm9jYXRpb25zXCJdLFxuICAgICk6IFByb21pc2U8U3RyZWFtaW5nUmVzcG9uc2U+IHtcbiAgICAgICAgbGV0IGxhc3RFcnJvcjogRXJyb3IgfCBudWxsID0gbnVsbDtcblxuICAgICAgICBjb25zdCBzdXBwb3J0c0V2ZW50U3RyZWFtaW5nID1cbiAgICAgICAgICAgIHR5cGVvZiAodGhpcy5jbGllbnQgYXMgYW55KT8uc2Vzc2lvbj8ucHJvbXB0QXN5bmMgPT09IFwiZnVuY3Rpb25cIiAmJlxuICAgICAgICAgICAgdHlwZW9mICh0aGlzLmNsaWVudCBhcyBhbnkpPy5ldmVudD8uc3Vic2NyaWJlID09PSBcImZ1bmN0aW9uXCI7XG5cbiAgICAgICAgZm9yIChsZXQgYXR0ZW1wdCA9IDE7IGF0dGVtcHQgPD0gdGhpcy5yZXRyeUF0dGVtcHRzOyBhdHRlbXB0KyspIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGEgVHJhbnNmb3JtU3RyZWFtIHRvIGhhbmRsZSB0aGUgc3RyZWFtaW5nIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgY29uc3Qgc3RyZWFtID0gbmV3IFRyYW5zZm9ybVN0cmVhbTxVaW50OEFycmF5LCBVaW50OEFycmF5PigpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHdyaXRlciA9IHN0cmVhbS53cml0YWJsZS5nZXRXcml0ZXIoKTtcblxuICAgICAgICAgICAgICAgIC8vIFRyYWNrIGZpbmFsaXphdGlvbiB0byBwcmV2ZW50IGRvdWJsZS1jbG9zZS9hYm9ydFxuICAgICAgICAgICAgICAgIGxldCBmaW5hbGl6ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBjb25zdCBjbG9zZU9uY2UgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmaW5hbGl6ZWQpIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgZmluYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHdyaXRlci5jbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElnbm9yZSBlcnJvcnMgZHVyaW5nIGNsb3NlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGNvbnN0IGFib3J0T25jZSA9IGFzeW5jIChlcnI6IHVua25vd24pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbmFsaXplZCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICBmaW5hbGl6ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgd3JpdGVyLmFib3J0KGVycik7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWdub3JlIGVycm9ycyBkdXJpbmcgYWJvcnRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAvLyBGYWxsYmFjazogaWYgdGhlIGNsaWVudCBkb2Vzbid0IHN1cHBvcnQgcHJvbXB0X2FzeW5jICsgU1NFLCBrZWVwIHRoZVxuICAgICAgICAgICAgICAgIC8vIGxlZ2FjeSBiZWhhdmlvciAoYnVmZmVyIHRoZW4gc2ltdWxhdGUgc3RyZWFtaW5nKS5cbiAgICAgICAgICAgICAgICBpZiAoIXN1cHBvcnRzRXZlbnRTdHJlYW1pbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJvbXB0UHJvbWlzZSA9IHRoaXMuY2xpZW50LnNlc3Npb24ucHJvbXB0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvZHk6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlSUQ6IHRoaXMuZ2VuZXJhdGVNZXNzYWdlSWQoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0czogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcInRleHRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IG1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBxdWVyeToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdG9yeTogdGhpcy5kaXJlY3RvcnksXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9IGFzIGFueSk7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RyZWFtaW5nVGFzayA9IChhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHByb21wdFByb21pc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXJlc3VsdC5kYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBJbnZhbGlkIHJlc3BvbnNlIGZyb20gT3BlbkNvZGU6ICR7SlNPTi5zdHJpbmdpZnkocmVzdWx0LmVycm9yKX1gLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gcmVzdWx0LmRhdGE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGV4dFBhcnQgPSByZXNwb25zZS5wYXJ0cz8uZmluZChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHBhcnQ6IGFueSkgPT4gcGFydC50eXBlID09PSBcInRleHRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmluYWxDb250ZW50ID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHRleHRQYXJ0IGFzIGFueSk/LnRleHQgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJObyBjb250ZW50IHJlY2VpdmVkXCI7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTaW11bGF0ZSBzdHJlYW1pbmcgYnkgd3JpdGluZyBjaHVua3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjaHVua3MgPSB0aGlzLnNwbGl0SW50b0NodW5rcyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmluYWxDb250ZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAxMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVuY29kZXIgPSBuZXcgVGV4dEVuY29kZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGNodW5rIG9mIGNodW5rcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB3cml0ZXIud3JpdGUoZW5jb2Rlci5lbmNvZGUoY2h1bmspKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KHJlc29sdmUsIDUwKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBjbG9zZU9uY2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBjb250ZW50OiBmaW5hbENvbnRlbnQgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgYWJvcnRPbmNlKGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSkoKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RyZWFtOiBzdHJlYW0ucmVhZGFibGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZTogc3RyZWFtaW5nVGFzayxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBSZWFsIHN0cmVhbWluZzogdXNlIHByb21wdF9hc3luYyBhbmQgY29uc3VtZSB0aGUgZXZlbnQgU1NFIHN0cmVhbS5cbiAgICAgICAgICAgICAgICBjb25zdCBlbmNvZGVyID0gbmV3IFRleHRFbmNvZGVyKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgaWRsZVRpbWVvdXRFcnJvciA9IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgYFByb21wdCBpZGxlIHRpbWVvdXQgYWZ0ZXIgJHt0aGlzLnByb21wdFRpbWVvdXR9bXNgLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgY29uc3QgaGFyZFRpbWVvdXRFcnJvciA9IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgYFByb21wdCBoYXJkIHRpbWVvdXQgYWZ0ZXIgJHt0aGlzLnByb21wdFRpbWVvdXQgKiA1fW1zYCxcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgY29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICAgICAgICAgICAgICBsZXQgaWRsZVRpbWVyOiBSZXR1cm5UeXBlPHR5cGVvZiBzZXRUaW1lb3V0PiB8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBsZXQgaGFyZFRpbWVyOiBSZXR1cm5UeXBlPHR5cGVvZiBzZXRUaW1lb3V0PiB8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBsZXQgYnl0ZXNXcml0dGVuID0gMDtcbiAgICAgICAgICAgICAgICBsZXQgbGFzdFByb2dyZXNzVGltZSA9IERhdGUubm93KCk7XG4gICAgICAgICAgICAgICAgbGV0IGlkbGVUaW1lZE91dCA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgLy8gSGFyZCB0aW1lb3V0IC0gbmV2ZXIgcmVzZXRzXG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhcnRIYXJkVGltZXIgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChoYXJkVGltZXIpIGNsZWFyVGltZW91dChoYXJkVGltZXIpO1xuICAgICAgICAgICAgICAgICAgICBoYXJkVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZy53YXJuKFwiSGFyZCB0aW1lb3V0IHJlYWNoZWQsIGFib3J0aW5nXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dE1zOiB0aGlzLnByb21wdFRpbWVvdXQgKiA1LFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXIuYWJvcnQoaGFyZFRpbWVvdXRFcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpZ25vcmVcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSwgdGhpcy5wcm9tcHRUaW1lb3V0ICogNSk7IC8vIDV4IGlkbGUgdGltZW91dCBhcyBoYXJkIGNlaWxpbmdcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgLy8gSWRsZSB0aW1lciAtIHJlc2V0cyBvbmx5IG9uIHJlbGV2YW50IHByb2dyZXNzXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzZXRJZGxlVGltZXIgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpZGxlVGltZXIpIGNsZWFyVGltZW91dChpZGxlVGltZXIpO1xuICAgICAgICAgICAgICAgICAgICBpZGxlVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkbGVUaW1lZE91dCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2cud2FybihcIklkbGUgdGltZW91dCByZWFjaGVkLCBhYm9ydGluZ1wiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXRNczogdGhpcy5wcm9tcHRUaW1lb3V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ5dGVzV3JpdHRlbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0UHJvZ3Jlc3NNc0FnbzogRGF0ZS5ub3coKSAtIGxhc3RQcm9ncmVzc1RpbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlci5hYm9ydChpZGxlVGltZW91dEVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlnbm9yZVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LCB0aGlzLnByb21wdFRpbWVvdXQpO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBjb25zdCBzdHJlYW1pbmdUYXNrID0gKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGFzc2lzdGFudE1lc3NhZ2VJZDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG5cbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0SGFyZFRpbWVyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNldElkbGVUaW1lcigpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1c2VyTWVzc2FnZUlkID0gdGhpcy5nZW5lcmF0ZU1lc3NhZ2VJZCgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2cuZGVidWcoXCJTZW5kaW5nIHByb21wdCB0byBPcGVuQ29kZVwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VMZW5ndGg6IG1lc3NhZ2UubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJNZXNzYWdlSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgKHRoaXMuY2xpZW50IGFzIGFueSkuc2Vzc2lvbi5wcm9tcHRBc3luYyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9keToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlSUQ6IHVzZXJNZXNzYWdlSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJ0ZXh0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogbWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWVyeToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3Rvcnk6IHRoaXMuZGlyZWN0b3J5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2lnbmFsOiBjb250cm9sbGVyLnNpZ25hbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2cuZGVidWcoXCJTdWJzY3JpYmluZyB0byBldmVudHNcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3Rvcnk6IHRoaXMuZGlyZWN0b3J5LFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGV2ZW50c1Jlc3VsdCA9IGF3YWl0IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNsaWVudCBhcyBhbnlcbiAgICAgICAgICAgICAgICAgICAgICAgICkuZXZlbnQuc3Vic2NyaWJlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWVyeToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3Rvcnk6IHRoaXMuZGlyZWN0b3J5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2lnbmFsOiBjb250cm9sbGVyLnNpZ25hbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNvbnRlbnQgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGVtaXR0ZWRUZXh0ID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBldmVudENvdW50ID0gMDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmRlYnVnKFwiU3RhcnRpbmcgZXZlbnQgc3RyZWFtIHByb2Nlc3NpbmdcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgYXdhaXQgKGNvbnN0IGV2ZW50IG9mIGV2ZW50c1Jlc3VsdC5zdHJlYW0gYXMgQXN5bmNHZW5lcmF0b3I8YW55Pikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50Q291bnQrKztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFZlcmJvc2UgZGVidWcgbG9nZ2luZyBmb3IgYWxsIGV2ZW50c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcIlJlY2VpdmVkIGV2ZW50XCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudFR5cGU6IGV2ZW50Py50eXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudENvdW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNQcm9wZXJ0aWVzOiAhIWV2ZW50Py5wcm9wZXJ0aWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyQWJvcnRlZDogY29udHJvbGxlci5zaWduYWwuYWJvcnRlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb250cm9sbGVyLnNpZ25hbC5hYm9ydGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQ29udHJvbGxlciBhYm9ydGVkLCBicmVha2luZyBldmVudCBsb29wXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50Q291bnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWV2ZW50IHx8IHR5cGVvZiBldmVudCAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZGVidWcoXCJTa2lwcGluZyBub24tb2JqZWN0IGV2ZW50XCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50Q291bnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXZlbnQudHlwZSA9PT0gXCJtZXNzYWdlLnVwZGF0ZWRcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbmZvID0gKGV2ZW50IGFzIGFueSkucHJvcGVydGllcz8uaW5mbztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZGVidWcoXCJNZXNzYWdlIHVwZGF0ZWQgZXZlbnRcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRDb3VudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm9Sb2xlOiBpbmZvPy5yb2xlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mb1Nlc3Npb25JZDogaW5mbz8uc2Vzc2lvbklELFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mb1BhcmVudElkOiBpbmZvPy5wYXJlbnRJRCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm9JZDogaW5mbz8uaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1JlbGV2YW50U2Vzc2lvbjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvPy5zZXNzaW9uSUQgPT09IHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzQXNzaXN0YW50OiBpbmZvPy5yb2xlID09PSBcImFzc2lzdGFudFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNSZXBseVRvVXNlcjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvPy5wYXJlbnRJRCA9PT0gdXNlck1lc3NhZ2VJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUHJpbWFyeSBpZGVudGlmaWNhdGlvbjogZXhhY3QgbWF0Y2ggb24gcGFyZW50SURcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mbz8ucm9sZSA9PT0gXCJhc3Npc3RhbnRcIiAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mbz8uc2Vzc2lvbklEID09PSBzZXNzaW9uSWQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8/LnBhcmVudElEID09PSB1c2VyTWVzc2FnZUlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzaXN0YW50TWVzc2FnZUlkID0gaW5mby5pZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIklkZW50aWZpZWQgYXNzaXN0YW50IG1lc3NhZ2UgKGV4YWN0IHBhcmVudElEIG1hdGNoKVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3Npc3RhbnRNZXNzYWdlSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmFsbGJhY2s6IGlmIHdlIGhhdmVuJ3QgaWRlbnRpZmllZCBhbiBhc3Npc3RhbnQgbWVzc2FnZSB5ZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFjY2VwdCBhc3Npc3RhbnQgbWVzc2FnZXMgaW4gdGhlIHNhbWUgc2Vzc2lvbiBldmVuIGlmIHBhcmVudElEIGRvZXNuJ3QgbWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBoYW5kbGVzIGNhc2VzIHdoZXJlIHBhcmVudElEIGlzIHVuZGVmaW5lZCBvciBoYXMgYSBkaWZmZXJlbnQgZm9ybWF0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIWFzc2lzdGFudE1lc3NhZ2VJZCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mbz8ucm9sZSA9PT0gXCJhc3Npc3RhbnRcIiAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mbz8uc2Vzc2lvbklEID09PSBzZXNzaW9uSWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZGVidWcoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJJZGVudGlmaWVkIGFzc2lzdGFudCBtZXNzYWdlIChmYWxsYmFjayAtIG5vIGV4YWN0IHBhcmVudElEIG1hdGNoKVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3Npc3RhbnRNZXNzYWdlSWQ6IGluZm8uaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm9QYXJlbnRJZDogaW5mbz8ucGFyZW50SUQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJNZXNzYWdlSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3Npc3RhbnRNZXNzYWdlSWQgPSBpbmZvLmlkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUmVzZXQgaWRsZSB0aW1lciBvbiBBTlkgYXNzaXN0YW50IG1lc3NhZ2UgYWN0aXZpdHlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBwcmV2ZW50cyB0aW1lb3V0cyB3aGVuIGNvcnJlbGF0aW9uIGlzIGFtYmlndW91c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvPy5yb2xlID09PSBcImFzc2lzdGFudFwiICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvPy5zZXNzaW9uSUQgPT09IHNlc3Npb25JZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RQcm9ncmVzc1RpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzZXRJZGxlVGltZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2lzdGFudE1lc3NhZ2VJZCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mbz8uaWQgPT09IGFzc2lzdGFudE1lc3NhZ2VJZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmZvPy5lcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVyck5hbWUgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvLmVycm9yLm5hbWUgfHwgXCJPcGVuQ29kZUVycm9yXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyTXNnID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mby5lcnJvci5kYXRhPy5tZXNzYWdlIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mby5lcnJvci5kYXRhIHx8IHt9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5lcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJBc3Npc3RhbnQgZXJyb3IgaW4gbWVzc2FnZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck5hbWU6IGVyck5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVyck1zZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7ZXJyTmFtZX06ICR7ZXJyTXNnfWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZm8/LnRpbWU/LmNvbXBsZXRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJBc3Npc3RhbnQgbWVzc2FnZSBjb21wbGV0ZWRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzaXN0YW50TWVzc2FnZUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGVkQXQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mby50aW1lLmNvbXBsZXRlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09IFwibWVzc2FnZS5wYXJ0LnVwZGF0ZWRcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBPbmx5IHJlc2V0IHRpbWVyIGFuZCB0cmFjayBwcm9ncmVzcyBmb3IgcmVsZXZhbnQgdXBkYXRlc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJ0ID0gKGV2ZW50IGFzIGFueSkucHJvcGVydGllc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPy5wYXJ0IGFzIGFueTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZGVidWcoXCJNZXNzYWdlIHBhcnQgdXBkYXRlZFwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudENvdW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzUGFydDogISFwYXJ0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydFR5cGU6IHBhcnQ/LnR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0U2Vzc2lvbklkOiBwYXJ0Py5zZXNzaW9uSUQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0TWVzc2FnZUlkOiBwYXJ0Py5tZXNzYWdlSUQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3Npc3RhbnRNZXNzYWdlSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1JlbGV2YW50OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2lzdGFudE1lc3NhZ2VJZCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnQ/LnNlc3Npb25JRCA9PT0gc2Vzc2lvbklkICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydD8ubWVzc2FnZUlEID09PSBhc3Npc3RhbnRNZXNzYWdlSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghYXNzaXN0YW50TWVzc2FnZUlkKSBjb250aW51ZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBIYW5kbGUgdG9vbCBwYXJ0cyAoY2FwdHVyZSB0b29sIGludm9jYXRpb25zKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFydD8udHlwZSA9PT0gXCJ0b29sXCIgJiYgdG9vbEludm9jYXRpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0b29sSWQgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnQudG9vbElkIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydC5pZCB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGB0b29sLSR7ZXZlbnRDb3VudH1gO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdG9vbE5hbWUgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnQudG9vbE5hbWUgfHwgcGFydC5uYW1lIHx8IFwidW5rbm93blwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdG9vbElucHV0ID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0LmlucHV0IHx8IHBhcnQucGFyYW1ldGVycyB8fCB7fTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdGhpcyBpcyBhIG5ldyB0b29sIGNhbGwgb3IgYW4gdXBkYXRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBleGlzdGluZ1Rvb2xJbmRleCA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbEludm9jYXRpb25zLmZpbmRJbmRleChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHQpID0+IHQuaWQgPT09IHRvb2xJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXhpc3RpbmdUb29sSW5kZXggPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSBleGlzdGluZyB0b29sIGludm9jYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBleGlzdGluZyA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xJbnZvY2F0aW9uc1tleGlzdGluZ1Rvb2xJbmRleF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhpc3Rpbmcub3V0cHV0ID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydC5yZXN1bHQgPz9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydC5vdXRwdXQgPz9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhpc3Rpbmcub3V0cHV0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nLnN0YXR1cyA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnQuc3RhdHVzID09PSBcImVycm9yXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gXCJlcnJvclwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFwib2tcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleGlzdGluZy5lcnJvciA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnQuZXJyb3IgPz8gZXhpc3RpbmcuZXJyb3I7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhpc3RpbmcuY29tcGxldGVkQXQgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0LmNvbXBsZXRlZEF0ID8/IG5vdztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcIlRvb2wgaW52b2NhdGlvbiB1cGRhdGVkXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IGV4aXN0aW5nLnN0YXR1cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTmV3IHRvb2wgaW52b2NhdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRvb2xJbnZvY2F0aW9uID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogdG9vbElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiB0b29sTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQ6IHRvb2xJbnB1dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0OiBwYXJ0LnJlc3VsdCA/PyBwYXJ0Lm91dHB1dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydC5zdGF0dXMgPT09IFwiZXJyb3JcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gKFwiZXJyb3JcIiBhcyBjb25zdClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IChcIm9rXCIgYXMgY29uc3QpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogcGFydC5lcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRlZEF0OiBwYXJ0LnN0YXJ0ZWRBdCA/PyBub3csXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlZEF0OiBwYXJ0LmNvbXBsZXRlZEF0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbEludm9jYXRpb25zLnB1c2godG9vbEludm9jYXRpb24pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmRlYnVnKFwiVG9vbCBpbnZvY2F0aW9uIHN0YXJ0ZWRcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbE5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0OiBKU09OLnN0cmluZ2lmeShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xJbnB1dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKS5zbGljZSgwLCAyMDApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBEb24ndCBza2lwIG5vbi1yZWxldmFudCB0b29sIHBhcnRzIC0gd2Ugd2FudCB0byBjYXB0dXJlIGFsbCB0b29sIGV2ZW50c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZm9yIHRoZSBhc3Npc3RhbnQgbWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnQuc2Vzc2lvbklEICE9PSBzZXNzaW9uSWQgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0Lm1lc3NhZ2VJRCAhPT0gYXNzaXN0YW50TWVzc2FnZUlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTdGlsbCB0cmFjayBpdCBidXQgZG9uJ3QgcHJvY2VzcyBmb3Igb3V0cHV0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJlc2V0IGlkbGUgdGltZXIgb24gdG9vbCBwcm9ncmVzc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RQcm9ncmVzc1RpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc2V0SWRsZVRpbWVyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFwYXJ0IHx8IHBhcnQudHlwZSAhPT0gXCJ0ZXh0XCIpIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFydC5zZXNzaW9uSUQgIT09IHNlc3Npb25JZCkgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYXJ0Lm1lc3NhZ2VJRCAhPT0gYXNzaXN0YW50TWVzc2FnZUlkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmF3RGVsdGEgPSAoZXZlbnQgYXMgYW55KS5wcm9wZXJ0aWVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/LmRlbHRhO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBkZWx0YVRleHQ6IHN0cmluZyB8IHVuZGVmaW5lZDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBQcmVmZXIgZGlmZmluZyBhZ2FpbnN0IHRoZSBmdWxsIGBwYXJ0LnRleHRgIHdoZW4gcHJlc2VudC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU29tZSBPcGVuQ29kZSBzZXJ2ZXIgdmVyc2lvbnMgZW1pdCBtdWx0aXBsZSB0ZXh0IHBhcnRzIG9yIHNlbmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYGRlbHRhYCBhcyB0aGUgKmZ1bGwqIHRleHQsIHdoaWNoIHdvdWxkIGR1cGxpY2F0ZSBvdXRwdXQuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcGFydC50ZXh0ID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXh0ID0gcGFydC50ZXh0O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV4dC5zdGFydHNXaXRoKGVtaXR0ZWRUZXh0KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbHRhVGV4dCA9IG5leHQuc2xpY2UoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVtaXR0ZWRUZXh0Lmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVtaXR0ZWRUZXh0ID0gbmV4dDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZW1pdHRlZFRleHQuc3RhcnRzV2l0aChuZXh0KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFN0YWxlL2R1cGxpY2F0ZSB1cGRhdGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWx0YVRleHQgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGYWxsYmFjazogdHJlYXQgYXMgYWRkaXRpdmUgY2h1bmtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWx0YVRleHQgPSBuZXh0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVtaXR0ZWRUZXh0ICs9IG5leHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHJhd0RlbHRhID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWx0YVRleHQgPSByYXdEZWx0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVtaXR0ZWRUZXh0ICs9IHJhd0RlbHRhO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFkZWx0YVRleHQpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSBwcm9ncmVzcyB0cmFja2luZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0UHJvZ3Jlc3NUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnl0ZXNXcml0dGVuICs9IGRlbHRhVGV4dC5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc2V0SWRsZVRpbWVyKCk7IC8vIE9ubHkgcmVzZXQgb24gYWN0dWFsIGNvbnRlbnQgcHJvZ3Jlc3NcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZGVidWcoXCJXcml0aW5nIGRlbHRhIHRvIHN0cmVhbVwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWx0YUxlbmd0aDogZGVsdGFUZXh0Lmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsQnl0ZXNXcml0dGVuOiBieXRlc1dyaXR0ZW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50TGVuZ3RoOiBjb250ZW50Lmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudCArPSBkZWx0YVRleHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHdyaXRlci53cml0ZShlbmNvZGVyLmVuY29kZShkZWx0YVRleHQpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcIkV2ZW50IHN0cmVhbSBlbmRlZFwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50Q291bnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxCeXRlc1dyaXR0ZW46IGJ5dGVzV3JpdHRlbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50TGVuZ3RoOiBjb250ZW50Lmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyQWJvcnRlZDogY29udHJvbGxlci5zaWduYWwuYWJvcnRlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZGxlVGltZWRPdXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzaXN0YW50TWVzc2FnZUlkRm91bmQ6ICEhYXNzaXN0YW50TWVzc2FnZUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IGNsb3NlT25jZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBjb250ZW50IHx8IFwiTm8gY29udGVudCByZWNlaXZlZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpYWdub3N0aWNzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ5dGVzV3JpdHRlbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudExlbmd0aDogY29udGVudC5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkbGVUaW1lZE91dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzaXN0YW50TWVzc2FnZUlkRm91bmQ6ICEhYXNzaXN0YW50TWVzc2FnZUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudENvdW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmVycm9yKFwiU3RyZWFtaW5nIHRhc2sgZXJyb3JcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBFcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBlcnJvci5tZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFN0cmluZyhlcnJvciksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlckFib3J0ZWQ6IGNvbnRyb2xsZXIuc2lnbmFsLmFib3J0ZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnl0ZXNXcml0dGVuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkbGVUaW1lZE91dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3Npc3RhbnRNZXNzYWdlSWRGb3VuZDogISFhc3Npc3RhbnRNZXNzYWdlSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIHdlIGFib3J0ZWQsIG5vcm1hbGl6ZSB0byBvdXIgdGltZW91dCBlcnJvciBBTkQgZW5zdXJlIHN0cmVhbSBpcyBmaW5hbGl6ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb250cm9sbGVyLnNpZ25hbC5hYm9ydGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgYWJvcnRPbmNlKGlkbGVUaW1lb3V0RXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGlkbGVUaW1lb3V0RXJyb3I7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBhYm9ydE9uY2UoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgICAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaWRsZVRpbWVyKSBjbGVhclRpbWVvdXQoaWRsZVRpbWVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChoYXJkVGltZXIpIGNsZWFyVGltZW91dChoYXJkVGltZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWNvbnRyb2xsZXIuc2lnbmFsLmFib3J0ZWQpIGNvbnRyb2xsZXIuYWJvcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlnbm9yZVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSkoKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN0cmVhbTogc3RyZWFtLnJlYWRhYmxlLFxuICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZTogc3RyZWFtaW5nVGFzayxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBsYXN0RXJyb3IgPVxuICAgICAgICAgICAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IgOiBuZXcgRXJyb3IoU3RyaW5nKGVycm9yKSk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBpc1JhdGVMaW1pdCA9IHRoaXMuaXNSYXRlTGltaXRFcnJvcihsYXN0RXJyb3IpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGF0dGVtcHQgPT09IHRoaXMucmV0cnlBdHRlbXB0cykge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb25zdCBkZWxheSA9IHRoaXMuZ2V0QmFja29mZkRlbGF5KGF0dGVtcHQsIGlzUmF0ZUxpbWl0KTtcblxuICAgICAgICAgICAgICAgIGxvZy53YXJuKFwiT3BlbkNvZGUgYXR0ZW1wdCBmYWlsZWQ7IHJldHJ5aW5nXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgYXR0ZW1wdCxcbiAgICAgICAgICAgICAgICAgICAgcmV0cnlBdHRlbXB0czogdGhpcy5yZXRyeUF0dGVtcHRzLFxuICAgICAgICAgICAgICAgICAgICBkZWxheU1zOiBkZWxheSxcbiAgICAgICAgICAgICAgICAgICAgaXNSYXRlTGltaXQsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBsYXN0RXJyb3IubWVzc2FnZSxcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIGRlbGF5KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgRmFpbGVkIHRvIHN0cmVhbSBtZXNzYWdlIGFmdGVyICR7dGhpcy5yZXRyeUF0dGVtcHRzfSBhdHRlbXB0czogJHtsYXN0RXJyb3I/Lm1lc3NhZ2UgfHwgXCJVbmtub3duIGVycm9yXCJ9YCxcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTcGxpdCB0ZXh0IGludG8gY2h1bmtzIGZvciBzdHJlYW1pbmcgc2ltdWxhdGlvblxuICAgICAqL1xuICAgIHByaXZhdGUgc3BsaXRJbnRvQ2h1bmtzKHRleHQ6IHN0cmluZywgY2h1bmtTaXplOiBudW1iZXIpOiBzdHJpbmdbXSB7XG4gICAgICAgIGNvbnN0IGNodW5rczogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0ZXh0Lmxlbmd0aDsgaSArPSBjaHVua1NpemUpIHtcbiAgICAgICAgICAgIGNodW5rcy5wdXNoKHRleHQuc2xpY2UoaSwgaSArIGNodW5rU2l6ZSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjaHVua3MubGVuZ3RoID4gMCA/IGNodW5rcyA6IFt0ZXh0XTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBIYW5kbGUgc2VuZGluZyBhIG1lc3NhZ2Ugd2l0aCBlcnJvciBoYW5kbGluZyBhbmQgcmV0cmllc1xuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgaGFuZGxlU2VuZE1lc3NhZ2UoXG4gICAgICAgIHNlc3Npb25JZDogc3RyaW5nLFxuICAgICAgICBtZXNzYWdlOiBzdHJpbmcsXG4gICAgKTogUHJvbWlzZTxNZXNzYWdlUmVzcG9uc2U+IHtcbiAgICAgICAgbGV0IGxhc3RFcnJvcjogRXJyb3IgfCBudWxsID0gbnVsbDtcblxuICAgICAgICBmb3IgKGxldCBhdHRlbXB0ID0gMTsgYXR0ZW1wdCA8PSB0aGlzLnJldHJ5QXR0ZW1wdHM7IGF0dGVtcHQrKykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCB0aW1lb3V0RXJyb3IgPSBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgIGBQcm9tcHQgdGltZW91dCBhZnRlciAke3RoaXMucHJvbXB0VGltZW91dH1tc2AsXG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgdGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXIuYWJvcnQodGltZW91dEVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpZ25vcmVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIHRoaXMucHJvbXB0VGltZW91dCk7XG5cbiAgICAgICAgICAgICAgICBsZXQgcmVzdWx0OiBhbnk7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gYXdhaXQgdGhpcy5jbGllbnQuc2Vzc2lvbi5wcm9tcHQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgYm9keToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VJRDogdGhpcy5nZW5lcmF0ZU1lc3NhZ2VJZCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwidGV4dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogbWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXJ5OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0b3J5OiB0aGlzLmRpcmVjdG9yeSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBzaWduYWw6IGNvbnRyb2xsZXIuc2lnbmFsLFxuICAgICAgICAgICAgICAgICAgICB9IGFzIGFueSk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbnRyb2xsZXIuc2lnbmFsLmFib3J0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IHRpbWVvdXRFcnJvcjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICghcmVzdWx0LmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgYEludmFsaWQgcmVzcG9uc2UgZnJvbSBPcGVuQ29kZTogJHtKU09OLnN0cmluZ2lmeShyZXN1bHQuZXJyb3IpfWAsXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gRXh0cmFjdCBjb250ZW50IGZyb20gcmVzcG9uc2VcbiAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IHJlc3VsdC5kYXRhO1xuXG4gICAgICAgICAgICAgICAgLy8gRmluZCB0ZXh0IGNvbnRlbnQgZnJvbSByZXNwb25zZSBwYXJ0c1xuICAgICAgICAgICAgICAgIGNvbnN0IHRleHRQYXJ0ID0gcmVzcG9uc2UucGFydHM/LmZpbmQoXG4gICAgICAgICAgICAgICAgICAgIChwYXJ0OiBhbnkpID0+IHBhcnQudHlwZSA9PT0gXCJ0ZXh0XCIsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICByZXR1cm4geyBjb250ZW50OiB0ZXh0UGFydD8udGV4dCB8fCBcIk5vIGNvbnRlbnQgcmVjZWl2ZWRcIiB9O1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBsYXN0RXJyb3IgPVxuICAgICAgICAgICAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IgOiBuZXcgRXJyb3IoU3RyaW5nKGVycm9yKSk7XG5cbiAgICAgICAgICAgICAgICAvLyBDaGVjayBpZiB0aGlzIGlzIGEgcmF0ZSBsaW1pdCBlcnJvclxuICAgICAgICAgICAgICAgIGNvbnN0IGlzUmF0ZUxpbWl0ID0gdGhpcy5pc1JhdGVMaW1pdEVycm9yKGxhc3RFcnJvcik7XG5cbiAgICAgICAgICAgICAgICBpZiAoYXR0ZW1wdCA9PT0gdGhpcy5yZXRyeUF0dGVtcHRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIFdhaXQgYmVmb3JlIHJldHJ5aW5nIHdpdGggZXhwb25lbnRpYWwgYmFja29mZlxuICAgICAgICAgICAgICAgIGNvbnN0IGRlbGF5ID0gdGhpcy5nZXRCYWNrb2ZmRGVsYXkoYXR0ZW1wdCwgaXNSYXRlTGltaXQpO1xuXG4gICAgICAgICAgICAgICAgbG9nLndhcm4oXCJPcGVuQ29kZSBhdHRlbXB0IGZhaWxlZDsgcmV0cnlpbmdcIiwge1xuICAgICAgICAgICAgICAgICAgICBhdHRlbXB0LFxuICAgICAgICAgICAgICAgICAgICByZXRyeUF0dGVtcHRzOiB0aGlzLnJldHJ5QXR0ZW1wdHMsXG4gICAgICAgICAgICAgICAgICAgIGRlbGF5TXM6IGRlbGF5LFxuICAgICAgICAgICAgICAgICAgICBpc1JhdGVMaW1pdCxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGxhc3RFcnJvci5tZXNzYWdlLFxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgZGVsYXkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBGYWlsZWQgdG8gc2VuZCBtZXNzYWdlIGFmdGVyICR7dGhpcy5yZXRyeUF0dGVtcHRzfSBhdHRlbXB0czogJHtsYXN0RXJyb3I/Lm1lc3NhZ2UgfHwgXCJVbmtub3duIGVycm9yXCJ9YCxcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBlcnJvciBpcyBhIHJhdGUgbGltaXQgZXJyb3JcbiAgICAgKi9cbiAgICBwcml2YXRlIGlzUmF0ZUxpbWl0RXJyb3IoZXJyb3I6IEVycm9yKTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IGVyciA9IGVycm9yIGFzIGFueTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIGVyci5zdGF0dXMgPT09IDQyOSB8fFxuICAgICAgICAgICAgL3JhdGUgbGltaXR8cXVvdGF8b3ZlcmxvYWRlZHxjYXBhY2l0eS9pLnRlc3QoZXJyb3IubWVzc2FnZSlcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDYWxjdWxhdGUgYmFja29mZiBkZWxheSB3aXRoIGppdHRlclxuICAgICAqL1xuICAgIHByaXZhdGUgZ2V0QmFja29mZkRlbGF5KGF0dGVtcHQ6IG51bWJlciwgaXNSYXRlTGltaXQ6IGJvb2xlYW4pOiBudW1iZXIge1xuICAgICAgICBjb25zdCBiYXNlID0gaXNSYXRlTGltaXQgPyA1MDAwIDogMTAwMDsgLy8gNXMgZm9yIHJhdGUgbGltaXQsIDFzIG90aGVyd2lzZVxuICAgICAgICBjb25zdCBleHBvbmVudGlhbCA9IGJhc2UgKiAyICoqIChhdHRlbXB0IC0gMSk7XG4gICAgICAgIGNvbnN0IGppdHRlciA9IE1hdGgucmFuZG9tKCkgKiAxMDAwOyAvLyBBZGQgdXAgdG8gMXMgaml0dGVyXG4gICAgICAgIHJldHVybiBNYXRoLm1pbihleHBvbmVudGlhbCArIGppdHRlciwgNjAwMDApOyAvLyBtYXggNjBzXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSGFuZGxlIHNlc3Npb24gY2xvc3VyZSB3aXRoIGVycm9yIGhhbmRsaW5nXG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyBoYW5kbGVTZXNzaW9uQ2xvc2Uoc2Vzc2lvbklkOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIE5vdGU6IE9wZW5Db2RlIFNESyBtaWdodCBub3QgaGF2ZSBhbiBleHBsaWNpdCBjbG9zZSBtZXRob2RcbiAgICAgICAgICAgIC8vIEZvciBub3csIHdlJ2xsIGp1c3QgcmVtb3ZlIGZyb20gb3VyIGFjdGl2ZSBzZXNzaW9uc1xuICAgICAgICAgICAgLy8gSW4gYSByZWFsIGltcGxlbWVudGF0aW9uLCB3ZSdkIGNhbGwgU0RLJ3MgZGVsZXRlIG1ldGhvZCBpZiBhdmFpbGFibGVcbiAgICAgICAgICAgIGxvZy5kZWJ1ZyhcIlNlc3Npb24gY2xvc2VkXCIsIHsgc2Vzc2lvbklkIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID1cbiAgICAgICAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgICAgICBsb2cud2FybihcIkZhaWxlZCB0byBjbG9zZSBzZXNzaW9uXCIsIHtcbiAgICAgICAgICAgICAgICBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2VuZXJhdGUgYSB1bmlxdWUgc2Vzc2lvbiBJRCBpZiBTREsgZG9lc24ndCBwcm92aWRlIG9uZVxuICAgICAqL1xuICAgIHByaXZhdGUgZ2VuZXJhdGVTZXNzaW9uSWQoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGBzZXNzaW9uLSR7RGF0ZS5ub3coKX0tJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgOSl9YDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZSBhIHByb3Blcmx5IGZvcm1hdHRlZCBtZXNzYWdlIElEIHdpdGggbXNnXyBwcmVmaXhcbiAgICAgKiBGb3JtYXQ6IG1zZ188dGltZXN0YW1wPl88cmFuZG9tPlxuICAgICAqL1xuICAgIHByaXZhdGUgZ2VuZXJhdGVNZXNzYWdlSWQoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGBtc2dfJHtEYXRlLm5vdygpfV8ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZygyLCA4KX1gO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENsZWFudXAgbWV0aG9kIHRvIGNsb3NlIGFsbCBzZXNzaW9ucyBhbmQgc2VydmVyXG4gICAgICovXG4gICAgYXN5bmMgY2xlYW51cCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxvZy5kZWJ1ZyhcIlN0YXJ0aW5nIGNsZWFudXAuLi5cIiwge1xuICAgICAgICAgICAgICAgIGFjdGl2ZVNlc3Npb25zOiB0aGlzLmFjdGl2ZVNlc3Npb25zLnNpemUsXG4gICAgICAgICAgICAgICAgaGFzU2VydmVyOiAhIXRoaXMuc2VydmVyLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIENsb3NlIGFsbCBhY3RpdmUgc2Vzc2lvbnNcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuY2xvc2VBbGxTZXNzaW9ucygpO1xuXG4gICAgICAgICAgICAvLyBTdG9wIHRoZSBPcGVuQ29kZSBzZXJ2ZXIgaWYgd2Ugc3RhcnRlZCBvbmVcbiAgICAgICAgICAgIGlmICh0aGlzLnNlcnZlcikge1xuICAgICAgICAgICAgICAgIGxvZy5pbmZvKFwiQ2xvc2luZyBzcGF3bmVkIE9wZW5Db2RlIHNlcnZlclwiKTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlcnZlci5jbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlcnZlciA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIGxvZy5pbmZvKFwiT3BlbkNvZGUgc2VydmVyIGNsb3NlZCBzdWNjZXNzZnVsbHlcIik7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNc2cgPVxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICBsb2cuZXJyb3IoXCJFcnJvciBjbG9zaW5nIE9wZW5Db2RlIHNlcnZlclwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JNc2csXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbG9nLmRlYnVnKFxuICAgICAgICAgICAgICAgICAgICBcIk5vIHNwYXduZWQgc2VydmVyIHRvIGNsb3NlIChjb25uZWN0ZWQgdG8gZXhpc3Rpbmcgc2VydmVyKVwiLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxvZy5pbmZvKFwiQ2xlYW51cCBjb21wbGV0ZVwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTXNnID1cbiAgICAgICAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgICAgICBsb2cuZXJyb3IoXCJFcnJvciBkdXJpbmcgT3BlbkNvZGUgY2xpZW50IGNsZWFudXBcIiwge1xuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvck1zZyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwKICAgICIvKipcbiAqIENMSSBVSSB1dGlsaXRpZXMgZm9yIGFpLWVuZyByYWxwaFxuICpcbiAqIENvbnNvbGUgc3R5bGluZyBhbmQgb3V0cHV0IGhlbHBlcnNcbiAqL1xuaW1wb3J0IHsgRU9MIH0gZnJvbSBcIm5vZGU6b3NcIjtcblxuZXhwb3J0IG5hbWVzcGFjZSBVSSB7XG4gICAgZXhwb3J0IGNvbnN0IFN0eWxlID0ge1xuICAgICAgICAvLyBDb2xvcnNcbiAgICAgICAgVEVYVF9ISUdITElHSFQ6IFwiXFx4MWJbOTZtXCIsXG4gICAgICAgIFRFWFRfSElHSExJR0hUX0JPTEQ6IFwiXFx4MWJbOTZtXFx4MWJbMW1cIixcbiAgICAgICAgVEVYVF9ESU06IFwiXFx4MWJbOTBtXCIsXG4gICAgICAgIFRFWFRfRElNX0JPTEQ6IFwiXFx4MWJbOTBtXFx4MWJbMW1cIixcbiAgICAgICAgVEVYVF9OT1JNQUw6IFwiXFx4MWJbMG1cIixcbiAgICAgICAgVEVYVF9OT1JNQUxfQk9MRDogXCJcXHgxYlsxbVwiLFxuICAgICAgICBURVhUX1dBUk5JTkc6IFwiXFx4MWJbOTNtXCIsXG4gICAgICAgIFRFWFRfV0FSTklOR19CT0xEOiBcIlxceDFiWzkzbVxceDFiWzFtXCIsXG4gICAgICAgIFRFWFRfREFOR0VSOiBcIlxceDFiWzkxbVwiLFxuICAgICAgICBURVhUX0RBTkdFUl9CT0xEOiBcIlxceDFiWzkxbVxceDFiWzFtXCIsXG4gICAgICAgIFRFWFRfU1VDQ0VTUzogXCJcXHgxYls5Mm1cIixcbiAgICAgICAgVEVYVF9TVUNDRVNTX0JPTEQ6IFwiXFx4MWJbOTJtXFx4MWJbMW1cIixcbiAgICAgICAgVEVYVF9JTkZPOiBcIlxceDFiWzk0bVwiLFxuICAgICAgICBURVhUX0lORk9fQk9MRDogXCJcXHgxYls5NG1cXHgxYlsxbVwiLFxuICAgIH07XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gcHJpbnRsbiguLi5tZXNzYWdlOiBzdHJpbmdbXSk6IHZvaWQge1xuICAgICAgICBwcm9jZXNzLnN0ZGVyci53cml0ZShtZXNzYWdlLmpvaW4oXCIgXCIpICsgRU9MKTtcbiAgICB9XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gcHJpbnQoLi4ubWVzc2FnZTogc3RyaW5nW10pOiB2b2lkIHtcbiAgICAgICAgcHJvY2Vzcy5zdGRlcnIud3JpdGUobWVzc2FnZS5qb2luKFwiIFwiKSk7XG4gICAgfVxuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGVycm9yKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBwcmludGxuKFxuICAgICAgICAgICAgYCR7U3R5bGUuVEVYVF9EQU5HRVJfQk9MRH1FcnJvcjogJHtTdHlsZS5URVhUX05PUk1BTH0ke21lc3NhZ2V9YCxcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gc3VjY2VzcyhtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgcHJpbnRsbihgJHtTdHlsZS5URVhUX1NVQ0NFU1NfQk9MRH3inJMgJHtTdHlsZS5URVhUX05PUk1BTH0ke21lc3NhZ2V9YCk7XG4gICAgfVxuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGluZm8obWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIHByaW50bG4oYCR7U3R5bGUuVEVYVF9JTkZPX0JPTER94oS5ICR7U3R5bGUuVEVYVF9OT1JNQUx9JHttZXNzYWdlfWApO1xuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiB3YXJuKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBwcmludGxuKGAke1N0eWxlLlRFWFRfV0FSTklOR19CT0xEfSEgJHtTdHlsZS5URVhUX05PUk1BTH0ke21lc3NhZ2V9YCk7XG4gICAgfVxuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGhlYWRlcih0aXRsZTogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIHByaW50bG4oKTtcbiAgICAgICAgcHJpbnRsbihTdHlsZS5URVhUX0hJR0hMSUdIVF9CT0xEICsgdGl0bGUgKyBTdHlsZS5URVhUX05PUk1BTCk7XG4gICAgICAgIHByaW50bG4oU3R5bGUuVEVYVF9ESU0gKyBcIuKUgFwiLnJlcGVhdCg1MCkgKyBTdHlsZS5URVhUX05PUk1BTCk7XG4gICAgfVxufVxuIiwKICAgICIvKipcbiAqIFByb21wdCBBbmFseXplclxuICpcbiAqIEFuYWx5emVzIHVzZXIgcHJvbXB0cyB0byBkZXRlcm1pbmUgY29tcGxleGl0eSwgZG9tYWluLFxuICogYW5kIG1pc3NpbmcgY29udGV4dC4gVXNlcyBhIGNvbWJpbmF0aW9uIG9mIHdvcmQgY291bnQsXG4gKiBrZXl3b3JkIGRldGVjdGlvbiwgYW5kIHBhdHRlcm4gbWF0Y2hpbmcuXG4gKi9cblxuaW1wb3J0IHR5cGUgeyBBbmFseXNpc1Jlc3VsdCwgQ29tcGxleGl0eSwgRG9tYWluLCBUZWNobmlxdWVJZCB9IGZyb20gXCIuL3R5cGVzXCI7XG5cbi8qKlxuICogS2V5d29yZHMgZm9yIGNvbXBsZXhpdHkgZGV0ZWN0aW9uXG4gKi9cbmNvbnN0IENPTVBMRVhJVFlfS0VZV09SRFMgPSB7XG4gICAgZGVidWc6IFtcImRlYnVnXCIsIFwiZml4XCIsIFwiZXJyb3JcIiwgXCJidWdcIiwgXCJpc3N1ZVwiLCBcInByb2JsZW1cIiwgXCJ0cm91Ymxlc2hvb3RcIl0sXG4gICAgZGVzaWduOiBbXG4gICAgICAgIFwiZGVzaWduXCIsXG4gICAgICAgIFwiYXJjaGl0ZWN0dXJlXCIsXG4gICAgICAgIFwiYXJjaGl0ZWN0XCIsXG4gICAgICAgIFwic3RydWN0dXJlXCIsXG4gICAgICAgIFwicGF0dGVyblwiLFxuICAgICAgICBcImFwcHJvYWNoXCIsXG4gICAgXSxcbiAgICBvcHRpbWl6ZTogW1xuICAgICAgICBcIm9wdGltaXplXCIsXG4gICAgICAgIFwiaW1wcm92ZVwiLFxuICAgICAgICBcInBlcmZvcm1hbmNlXCIsXG4gICAgICAgIFwiZWZmaWNpZW50XCIsXG4gICAgICAgIFwiZmFzdFwiLFxuICAgICAgICBcInNjYWxlXCIsXG4gICAgXSxcbiAgICBpbXBsZW1lbnQ6IFtcImltcGxlbWVudFwiLCBcImJ1aWxkXCIsIFwiY3JlYXRlXCIsIFwiZGV2ZWxvcFwiLCBcIndyaXRlXCIsIFwiY29kZVwiXSxcbiAgICBjb21wbGV4OiBbXCJjb21wbGV4XCIsIFwiY2hhbGxlbmdlXCIsIFwiZGlmZmljdWx0XCIsIFwiYWR2YW5jZWRcIiwgXCJzb3BoaXN0aWNhdGVkXCJdLFxufTtcblxuLyoqXG4gKiBEb21haW4tc3BlY2lmaWMga2V5d29yZHNcbiAqL1xuY29uc3QgRE9NQUlOX0tFWVdPUkRTOiBSZWNvcmQ8RG9tYWluLCBzdHJpbmdbXT4gPSB7XG4gICAgc2VjdXJpdHk6IFtcbiAgICAgICAgXCJhdXRoXCIsXG4gICAgICAgIFwiYXV0aGVudGljYXRpb25cIixcbiAgICAgICAgXCJqd3RcIixcbiAgICAgICAgXCJvYXV0aFwiLFxuICAgICAgICBcInBhc3N3b3JkXCIsXG4gICAgICAgIFwiZW5jcnlwdFwiLFxuICAgICAgICBcImRlY3J5cHRcIixcbiAgICAgICAgXCJzZWN1cml0eVwiLFxuICAgICAgICBcInRva2VuXCIsXG4gICAgICAgIFwic2Vzc2lvblwiLFxuICAgICAgICBcImNzcmZcIixcbiAgICAgICAgXCJ4c3NcIixcbiAgICAgICAgXCJpbmplY3Rpb25cIixcbiAgICAgICAgXCJ2dWxuZXJhYmlsaXR5XCIsXG4gICAgICAgIFwiaGFja1wiLFxuICAgICAgICBcImF0dGFja1wiLFxuICAgIF0sXG4gICAgZnJvbnRlbmQ6IFtcbiAgICAgICAgXCJyZWFjdFwiLFxuICAgICAgICBcInZ1ZVwiLFxuICAgICAgICBcImFuZ3VsYXJcIixcbiAgICAgICAgXCJjb21wb25lbnRcIixcbiAgICAgICAgXCJjc3NcIixcbiAgICAgICAgXCJodG1sXCIsXG4gICAgICAgIFwidWlcIixcbiAgICAgICAgXCJ1eFwiLFxuICAgICAgICBcInJlbmRlclwiLFxuICAgICAgICBcInN0YXRlXCIsXG4gICAgICAgIFwiaG9va1wiLFxuICAgICAgICBcInByb3BzXCIsXG4gICAgICAgIFwiZG9tXCIsXG4gICAgICAgIFwiZnJvbnRlbmRcIixcbiAgICAgICAgXCJjbGllbnRcIixcbiAgICBdLFxuICAgIGJhY2tlbmQ6IFtcbiAgICAgICAgXCJhcGlcIixcbiAgICAgICAgXCJzZXJ2ZXJcIixcbiAgICAgICAgXCJlbmRwb2ludFwiLFxuICAgICAgICBcImRhdGFiYXNlXCIsXG4gICAgICAgIFwicXVlcnlcIixcbiAgICAgICAgXCJiYWNrZW5kXCIsXG4gICAgICAgIFwic2VydmljZVwiLFxuICAgICAgICBcIm1pY3Jvc2VydmljZVwiLFxuICAgICAgICBcInJlc3RcIixcbiAgICAgICAgXCJncmFwaHFsXCIsXG4gICAgICAgIFwiaHR0cFwiLFxuICAgICAgICBcInJlcXVlc3RcIixcbiAgICAgICAgXCJyZXNwb25zZVwiLFxuICAgIF0sXG4gICAgZGF0YWJhc2U6IFtcbiAgICAgICAgXCJzcWxcIixcbiAgICAgICAgXCJwb3N0Z3Jlc3FsXCIsXG4gICAgICAgIFwibXlzcWxcIixcbiAgICAgICAgXCJtb25nb2RiXCIsXG4gICAgICAgIFwicmVkaXNcIixcbiAgICAgICAgXCJxdWVyeVwiLFxuICAgICAgICBcImluZGV4XCIsXG4gICAgICAgIFwic2NoZW1hXCIsXG4gICAgICAgIFwibWlncmF0aW9uXCIsXG4gICAgICAgIFwiZGF0YWJhc2VcIixcbiAgICAgICAgXCJkYlwiLFxuICAgICAgICBcImpvaW5cIixcbiAgICAgICAgXCJ0cmFuc2FjdGlvblwiLFxuICAgICAgICBcIm9ybVwiLFxuICAgIF0sXG4gICAgZGV2b3BzOiBbXG4gICAgICAgIFwiZGVwbG95XCIsXG4gICAgICAgIFwiY2kvY2RcIixcbiAgICAgICAgXCJkb2NrZXJcIixcbiAgICAgICAgXCJrdWJlcm5ldGVzXCIsXG4gICAgICAgIFwiazhzXCIsXG4gICAgICAgIFwicGlwZWxpbmVcIixcbiAgICAgICAgXCJpbmZyYXN0cnVjdHVyZVwiLFxuICAgICAgICBcImF3c1wiLFxuICAgICAgICBcImdjcFwiLFxuICAgICAgICBcImF6dXJlXCIsXG4gICAgICAgIFwidGVycmFmb3JtXCIsXG4gICAgICAgIFwiYW5zaWJsZVwiLFxuICAgICAgICBcImplbmtpbnNcIixcbiAgICAgICAgXCJkZXZvcHNcIixcbiAgICAgICAgXCJvcHNcIixcbiAgICBdLFxuICAgIGFyY2hpdGVjdHVyZTogW1xuICAgICAgICBcImFyY2hpdGVjdHVyZVwiLFxuICAgICAgICBcImRlc2lnblwiLFxuICAgICAgICBcInBhdHRlcm5cIixcbiAgICAgICAgXCJtaWNyb3NlcnZpY2VzXCIsXG4gICAgICAgIFwibW9ub2xpdGhcIixcbiAgICAgICAgXCJzY2FsYWJpbGl0eVwiLFxuICAgICAgICBcInN5c3RlbVwiLFxuICAgICAgICBcImRpc3RyaWJ1dGVkXCIsXG4gICAgICAgIFwiYXJjaGl0ZWN0XCIsXG4gICAgICAgIFwiaGlnaC1sZXZlbFwiLFxuICAgIF0sXG4gICAgdGVzdGluZzogW1xuICAgICAgICBcInRlc3RcIixcbiAgICAgICAgXCJzcGVjXCIsXG4gICAgICAgIFwidW5pdCB0ZXN0XCIsXG4gICAgICAgIFwiaW50ZWdyYXRpb24gdGVzdFwiLFxuICAgICAgICBcImUyZVwiLFxuICAgICAgICBcImplc3RcIixcbiAgICAgICAgXCJjeXByZXNzXCIsXG4gICAgICAgIFwicGxheXdyaWdodFwiLFxuICAgICAgICBcInRlc3RpbmdcIixcbiAgICAgICAgXCJ0ZGRcIixcbiAgICAgICAgXCJjb3ZlcmFnZVwiLFxuICAgICAgICBcIm1vY2tcIixcbiAgICAgICAgXCJzdHViXCIsXG4gICAgXSxcbiAgICBnZW5lcmFsOiBbXSwgLy8gRmFsbGJhY2sgZG9tYWluXG59O1xuXG4vKipcbiAqIFNpbXBsZSBwcm9tcHQgcGF0dGVybnMgKGdyZWV0aW5ncywgc2ltcGxlIHF1ZXN0aW9ucylcbiAqL1xuY29uc3QgU0lNUExFX1BBVFRFUk5TID0gW1xuICAgIC9eKGhlbGxvfGhpfGhleXxncmVldGluZ3N8Z29vZCBtb3JuaW5nfGdvb2QgZXZlbmluZykvaSxcbiAgICAvXih0aGFua3N8dGhhbmsgeW91fHRoeCkvaSxcbiAgICAvXih5ZXN8bm98b2t8c3VyZXxhbHJpZ2h0KS9pLFxuICAgIC9eKHdoYXR8aG93fHdoeXx3aGVufHdoZXJlfHdob3x3aGljaClcXHMrXFx3K1xcPz8kL2ksIC8vIFNpbXBsZSBzaW5nbGUgcXVlc3Rpb25zXG4gICAgL14oaGVscHxhc3Npc3QpXFxzKiQvaSxcbl07XG5cbi8qKlxuICogQ2FsY3VsYXRlIGNvbXBsZXhpdHkgc2NvcmUgZm9yIGEgcHJvbXB0XG4gKi9cbmZ1bmN0aW9uIGNhbGN1bGF0ZUNvbXBsZXhpdHlTY29yZShwcm9tcHQ6IHN0cmluZyk6IG51bWJlciB7XG4gICAgY29uc3Qgd29yZHMgPSBwcm9tcHQuc3BsaXQoL1xccysvKTtcbiAgICBjb25zdCB3b3JkQ291bnQgPSB3b3Jkcy5sZW5ndGg7XG5cbiAgICBsZXQgc2NvcmUgPSAwO1xuXG4gICAgLy8gV29yZCBjb3VudCBjb250cmlidXRpb24gKDAtMTAgcG9pbnRzKVxuICAgIGlmICh3b3JkQ291bnQgPCA1KSBzY29yZSArPSAwO1xuICAgIGVsc2UgaWYgKHdvcmRDb3VudCA8IDEwKSBzY29yZSArPSAzO1xuICAgIGVsc2UgaWYgKHdvcmRDb3VudCA8IDIwKSBzY29yZSArPSA2O1xuICAgIGVsc2Ugc2NvcmUgKz0gMTA7XG5cbiAgICAvLyBLZXl3b3JkIGNvbnRyaWJ1dGlvbiAoMC0xMCBwb2ludHMpXG4gICAgY29uc3QgbG93ZXJQcm9tcHQgPSBwcm9tcHQudG9Mb3dlckNhc2UoKTtcbiAgICBmb3IgKGNvbnN0IGNhdGVnb3J5IG9mIE9iamVjdC52YWx1ZXMoQ09NUExFWElUWV9LRVlXT1JEUykpIHtcbiAgICAgICAgZm9yIChjb25zdCBrZXl3b3JkIG9mIGNhdGVnb3J5KSB7XG4gICAgICAgICAgICBpZiAobG93ZXJQcm9tcHQuaW5jbHVkZXMoa2V5d29yZCkpIHtcbiAgICAgICAgICAgICAgICBzY29yZSArPSAyO1xuICAgICAgICAgICAgICAgIGJyZWFrOyAvLyBPbmUga2V5d29yZCBwZXIgY2F0ZWdvcnlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFF1ZXN0aW9uIG1hcmtzIHJlZHVjZSBjb21wbGV4aXR5IChhc2tpbmcgZm9yIGluZm8gaXMgc2ltcGxlcilcbiAgICBjb25zdCBxdWVzdGlvbk1hcmtzID0gKHByb21wdC5tYXRjaCgvXFw/L2cpIHx8IFtdKS5sZW5ndGg7XG4gICAgc2NvcmUgLT0gTWF0aC5taW4ocXVlc3Rpb25NYXJrcyAqIDIsIDUpO1xuXG4gICAgLy8gVGVjaG5pY2FsIHRlcm1zIGluY3JlYXNlIGNvbXBsZXhpdHlcbiAgICBjb25zdCB0ZWNoVGVybXMgPSB3b3Jkcy5maWx0ZXIoKHdvcmQpID0+IHtcbiAgICAgICAgY29uc3QgbG93ZXIgPSB3b3JkLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAvXFx3ezQsfS8udGVzdCh3b3JkKSAmJlxuICAgICAgICAgICAgIVtcInRoaXNcIiwgXCJ0aGF0XCIsIFwid2l0aFwiLCBcImZyb21cIiwgXCJpbnRvXCJdLmluY2x1ZGVzKGxvd2VyKVxuICAgICAgICApO1xuICAgIH0pO1xuICAgIHNjb3JlICs9IE1hdGgubWluKHRlY2hUZXJtcy5sZW5ndGggKiAwLjUsIDUpO1xuXG4gICAgcmV0dXJuIE1hdGgubWF4KDAsIE1hdGgubWluKDIwLCBzY29yZSkpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBjb21wbGV4aXR5IGZyb20gc2NvcmVcbiAqL1xuZnVuY3Rpb24gc2NvcmVUb0NvbXBsZXhpdHkoc2NvcmU6IG51bWJlcik6IENvbXBsZXhpdHkge1xuICAgIGlmIChzY29yZSA8IDUpIHJldHVybiBcInNpbXBsZVwiO1xuICAgIGlmIChzY29yZSA8IDEyKSByZXR1cm4gXCJtZWRpdW1cIjtcbiAgICByZXR1cm4gXCJjb21wbGV4XCI7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgcHJvbXB0IG1hdGNoZXMgc2ltcGxlIHBhdHRlcm5zXG4gKi9cbmZ1bmN0aW9uIGlzU2ltcGxlUHJvbXB0KHByb21wdDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgZm9yIChjb25zdCBwYXR0ZXJuIG9mIFNJTVBMRV9QQVRURVJOUykge1xuICAgICAgICBpZiAocGF0dGVybi50ZXN0KHByb21wdC50cmltKCkpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogRGV0ZWN0IGRvbWFpbiBmcm9tIHByb21wdCBrZXl3b3Jkc1xuICovXG5mdW5jdGlvbiBkZXRlY3REb21haW4ocHJvbXB0OiBzdHJpbmcpOiBEb21haW4ge1xuICAgIGNvbnN0IGxvd2VyUHJvbXB0ID0gcHJvbXB0LnRvTG93ZXJDYXNlKCk7XG5cbiAgICAvLyBDb3VudCBrZXl3b3JkIG1hdGNoZXMgcGVyIGRvbWFpblxuICAgIGNvbnN0IHNjb3JlczogUmVjb3JkPERvbWFpbiwgbnVtYmVyPiA9IHtcbiAgICAgICAgc2VjdXJpdHk6IDAsXG4gICAgICAgIGZyb250ZW5kOiAwLFxuICAgICAgICBiYWNrZW5kOiAwLFxuICAgICAgICBkYXRhYmFzZTogMCxcbiAgICAgICAgZGV2b3BzOiAwLFxuICAgICAgICBhcmNoaXRlY3R1cmU6IDAsXG4gICAgICAgIHRlc3Rpbmc6IDAsXG4gICAgICAgIGdlbmVyYWw6IDAsXG4gICAgfTtcblxuICAgIGZvciAoY29uc3QgW2RvbWFpbiwga2V5d29yZHNdIG9mIE9iamVjdC5lbnRyaWVzKERPTUFJTl9LRVlXT1JEUykpIHtcbiAgICAgICAgZm9yIChjb25zdCBrZXl3b3JkIG9mIGtleXdvcmRzKSB7XG4gICAgICAgICAgICBpZiAobG93ZXJQcm9tcHQuaW5jbHVkZXMoa2V5d29yZCkpIHtcbiAgICAgICAgICAgICAgICBzY29yZXNbZG9tYWluIGFzIERvbWFpbl0rKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEZpbmQgZG9tYWluIHdpdGggaGlnaGVzdCBzY29yZVxuICAgIGxldCBiZXN0RG9tYWluOiBEb21haW4gPSBcImdlbmVyYWxcIjtcbiAgICBsZXQgYmVzdFNjb3JlID0gMDtcblxuICAgIGZvciAoY29uc3QgW2RvbWFpbiwgc2NvcmVdIG9mIE9iamVjdC5lbnRyaWVzKHNjb3JlcykpIHtcbiAgICAgICAgaWYgKHNjb3JlID4gYmVzdFNjb3JlKSB7XG4gICAgICAgICAgICBiZXN0U2NvcmUgPSBzY29yZTtcbiAgICAgICAgICAgIGJlc3REb21haW4gPSBkb21haW4gYXMgRG9tYWluO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGJlc3REb21haW47XG59XG5cbi8qKlxuICogRXh0cmFjdCBrZXl3b3JkcyBmcm9tIHByb21wdFxuICovXG5mdW5jdGlvbiBleHRyYWN0S2V5d29yZHMocHJvbXB0OiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gICAgY29uc3Qga2V5d29yZHM6IHN0cmluZ1tdID0gW107XG4gICAgY29uc3QgbG93ZXJQcm9tcHQgPSBwcm9tcHQudG9Mb3dlckNhc2UoKTtcblxuICAgIC8vIEV4dHJhY3QgZnJvbSBjb21wbGV4aXR5IGtleXdvcmRzXG4gICAgZm9yIChjb25zdCBbY2F0ZWdvcnksIHRlcm1zXSBvZiBPYmplY3QuZW50cmllcyhDT01QTEVYSVRZX0tFWVdPUkRTKSkge1xuICAgICAgICBmb3IgKGNvbnN0IHRlcm0gb2YgdGVybXMpIHtcbiAgICAgICAgICAgIGlmIChsb3dlclByb21wdC5pbmNsdWRlcyh0ZXJtKSAmJiAha2V5d29yZHMuaW5jbHVkZXModGVybSkpIHtcbiAgICAgICAgICAgICAgICBrZXl3b3Jkcy5wdXNoKHRlcm0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gRXh0cmFjdCBmcm9tIGRvbWFpbiBrZXl3b3Jkc1xuICAgIGZvciAoY29uc3QgW2RvbWFpbiwgdGVybXNdIG9mIE9iamVjdC5lbnRyaWVzKERPTUFJTl9LRVlXT1JEUykpIHtcbiAgICAgICAgZm9yIChjb25zdCB0ZXJtIG9mIHRlcm1zKSB7XG4gICAgICAgICAgICBpZiAobG93ZXJQcm9tcHQuaW5jbHVkZXModGVybSkgJiYgIWtleXdvcmRzLmluY2x1ZGVzKHRlcm0pKSB7XG4gICAgICAgICAgICAgICAga2V5d29yZHMucHVzaCh0ZXJtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBrZXl3b3Jkcztcbn1cblxuLyoqXG4gKiBJZGVudGlmeSBtaXNzaW5nIGNvbnRleHQgYmFzZWQgb24gcHJvbXB0IGNvbnRlbnRcbiAqL1xuZnVuY3Rpb24gaWRlbnRpZnlNaXNzaW5nQ29udGV4dChwcm9tcHQ6IHN0cmluZywgZG9tYWluOiBEb21haW4pOiBzdHJpbmdbXSB7XG4gICAgY29uc3QgbWlzc2luZzogc3RyaW5nW10gPSBbXTtcbiAgICBjb25zdCBsb3dlclByb21wdCA9IHByb21wdC50b0xvd2VyQ2FzZSgpO1xuXG4gICAgLy8gQ2hlY2sgZm9yIGRlYnVnL2ZpeCByZXF1ZXN0c1xuICAgIGlmIChcbiAgICAgICAgbG93ZXJQcm9tcHQuaW5jbHVkZXMoXCJmaXhcIikgfHxcbiAgICAgICAgbG93ZXJQcm9tcHQuaW5jbHVkZXMoXCJkZWJ1Z1wiKSB8fFxuICAgICAgICBsb3dlclByb21wdC5pbmNsdWRlcyhcImVycm9yXCIpXG4gICAgKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgICFsb3dlclByb21wdC5pbmNsdWRlcyhcImVycm9yXCIpICYmXG4gICAgICAgICAgICAhbG93ZXJQcm9tcHQuaW5jbHVkZXMoXCJleGNlcHRpb25cIilcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBtaXNzaW5nLnB1c2goXCJlcnJvciBtZXNzYWdlIG9yIHN0YWNrIHRyYWNlXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghL1xcLihqc3x0c3xweXxnb3xqYXZhfHJifHBocCkvaS50ZXN0KHByb21wdCkpIHtcbiAgICAgICAgICAgIG1pc3NpbmcucHVzaChcImZpbGUgb3IgY29kZSBsb2NhdGlvblwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIENoZWNrIGZvciB0ZWNoIHN0YWNrXG4gICAgY29uc3QgdGVjaEtleXdvcmRzID0gW1xuICAgICAgICBcImphdmFzY3JpcHRcIixcbiAgICAgICAgXCJ0eXBlc2NyaXB0XCIsXG4gICAgICAgIFwicHl0aG9uXCIsXG4gICAgICAgIFwiZ29cIixcbiAgICAgICAgXCJqYXZhXCIsXG4gICAgICAgIFwicnVzdFwiLFxuICAgICAgICBcInJlYWN0XCIsXG4gICAgICAgIFwidnVlXCIsXG4gICAgICAgIFwiYW5ndWxhclwiLFxuICAgICAgICBcIm5vZGVcIixcbiAgICAgICAgXCJleHByZXNzXCIsXG4gICAgICAgIFwiZGphbmdvXCIsXG4gICAgICAgIFwiZmxhc2tcIixcbiAgICBdO1xuICAgIGNvbnN0IGhhc1RlY2ggPSB0ZWNoS2V5d29yZHMuc29tZSgodGVjaCkgPT4gbG93ZXJQcm9tcHQuaW5jbHVkZXModGVjaCkpO1xuICAgIGlmICghaGFzVGVjaCAmJiAhL1xcLihqc3x0c3xweXxnb3xqYXZhfHJifHBocCkvaS50ZXN0KHByb21wdCkpIHtcbiAgICAgICAgbWlzc2luZy5wdXNoKFwidGVjaG5vbG9neSBzdGFja1wiKTtcbiAgICB9XG5cbiAgICAvLyBEb21haW4tc3BlY2lmaWMgbWlzc2luZyBjb250ZXh0XG4gICAgaWYgKGRvbWFpbiA9PT0gXCJzZWN1cml0eVwiKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgICFsb3dlclByb21wdC5pbmNsdWRlcyhcImp3dFwiKSAmJlxuICAgICAgICAgICAgIWxvd2VyUHJvbXB0LmluY2x1ZGVzKFwib2F1dGhcIikgJiZcbiAgICAgICAgICAgICFsb3dlclByb21wdC5pbmNsdWRlcyhcInNlc3Npb25cIilcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBtaXNzaW5nLnB1c2goXCJhdXRoZW50aWNhdGlvbiBtZXRob2QgKEpXVCwgT0F1dGgsIHNlc3Npb24sIGV0Yy4pXCIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGRvbWFpbiA9PT0gXCJkYXRhYmFzZVwiKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgICFsb3dlclByb21wdC5pbmNsdWRlcyhcInNxbFwiKSAmJlxuICAgICAgICAgICAgIWxvd2VyUHJvbXB0LmluY2x1ZGVzKFwibXlzcWxcIikgJiZcbiAgICAgICAgICAgICFsb3dlclByb21wdC5pbmNsdWRlcyhcInBvc3RncmVzcWxcIikgJiZcbiAgICAgICAgICAgICFsb3dlclByb21wdC5pbmNsdWRlcyhcIm1vbmdvZGJcIilcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBtaXNzaW5nLnB1c2goXCJkYXRhYmFzZSB0eXBlXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghbG93ZXJQcm9tcHQuaW5jbHVkZXMoXCJpbmRleFwiKSkge1xuICAgICAgICAgICAgbWlzc2luZy5wdXNoKFwiaW5kZXggaW5mb3JtYXRpb25cIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbWlzc2luZztcbn1cblxuLyoqXG4gKiBTdWdnZXN0IHRlY2huaXF1ZXMgYmFzZWQgb24gYW5hbHlzaXNcbiAqL1xuZnVuY3Rpb24gc3VnZ2VzdFRlY2huaXF1ZXMoXG4gICAgY29tcGxleGl0eTogQ29tcGxleGl0eSxcbiAgICBkb21haW46IERvbWFpbixcbik6IFRlY2huaXF1ZUlkW10ge1xuICAgIGNvbnN0IHRlY2huaXF1ZXM6IFRlY2huaXF1ZUlkW10gPSBbXTtcblxuICAgIC8vIEFsd2F5cyBzdGFydCB3aXRoIGFuYWx5c2lzXG4gICAgdGVjaG5pcXVlcy5wdXNoKFwiYW5hbHlzaXNcIik7XG5cbiAgICAvLyBFeHBlcnQgcGVyc29uYSBmb3IgbWVkaXVtIGFuZCBjb21wbGV4XG4gICAgaWYgKGNvbXBsZXhpdHkgPT09IFwibWVkaXVtXCIgfHwgY29tcGxleGl0eSA9PT0gXCJjb21wbGV4XCIpIHtcbiAgICAgICAgdGVjaG5pcXVlcy5wdXNoKFwiZXhwZXJ0X3BlcnNvbmFcIik7XG4gICAgfVxuXG4gICAgLy8gUmVhc29uaW5nIGNoYWluIGZvciBtZWRpdW0gYW5kIGNvbXBsZXhcbiAgICBpZiAoY29tcGxleGl0eSA9PT0gXCJtZWRpdW1cIiB8fCBjb21wbGV4aXR5ID09PSBcImNvbXBsZXhcIikge1xuICAgICAgICB0ZWNobmlxdWVzLnB1c2goXCJyZWFzb25pbmdfY2hhaW5cIik7XG4gICAgfVxuXG4gICAgLy8gU3Rha2VzIGxhbmd1YWdlIGZvciBtZWRpdW0gYW5kIGNvbXBsZXhcbiAgICBpZiAoY29tcGxleGl0eSA9PT0gXCJtZWRpdW1cIiB8fCBjb21wbGV4aXR5ID09PSBcImNvbXBsZXhcIikge1xuICAgICAgICB0ZWNobmlxdWVzLnB1c2goXCJzdGFrZXNfbGFuZ3VhZ2VcIik7XG4gICAgfVxuXG4gICAgLy8gQ2hhbGxlbmdlIGZyYW1pbmcgb25seSBmb3IgY29tcGxleFxuICAgIGlmIChjb21wbGV4aXR5ID09PSBcImNvbXBsZXhcIikge1xuICAgICAgICB0ZWNobmlxdWVzLnB1c2goXCJjaGFsbGVuZ2VfZnJhbWluZ1wiKTtcbiAgICB9XG5cbiAgICAvLyBTZWxmLWV2YWx1YXRpb24gZm9yIG1lZGl1bSBhbmQgY29tcGxleFxuICAgIGlmIChjb21wbGV4aXR5ID09PSBcIm1lZGl1bVwiIHx8IGNvbXBsZXhpdHkgPT09IFwiY29tcGxleFwiKSB7XG4gICAgICAgIHRlY2huaXF1ZXMucHVzaChcInNlbGZfZXZhbHVhdGlvblwiKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGVjaG5pcXVlcztcbn1cblxuLyoqXG4gKiBNYWluIGFuYWx5c2lzIGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhbmFseXplUHJvbXB0KHByb21wdDogc3RyaW5nKTogQW5hbHlzaXNSZXN1bHQge1xuICAgIC8vIENoZWNrIGZvciBzaW1wbGUgcGF0dGVybnMgZmlyc3RcbiAgICBpZiAoaXNTaW1wbGVQcm9tcHQocHJvbXB0KSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY29tcGxleGl0eTogXCJzaW1wbGVcIixcbiAgICAgICAgICAgIGRvbWFpbjogXCJnZW5lcmFsXCIsXG4gICAgICAgICAgICBrZXl3b3JkczogW10sXG4gICAgICAgICAgICBtaXNzaW5nQ29udGV4dDogW10sXG4gICAgICAgICAgICBzdWdnZXN0ZWRUZWNobmlxdWVzOiBbXCJhbmFseXNpc1wiXSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBDYWxjdWxhdGUgY29tcGxleGl0eVxuICAgIGNvbnN0IGNvbXBsZXhpdHlTY29yZSA9IGNhbGN1bGF0ZUNvbXBsZXhpdHlTY29yZShwcm9tcHQpO1xuICAgIGNvbnN0IGNvbXBsZXhpdHkgPSBzY29yZVRvQ29tcGxleGl0eShjb21wbGV4aXR5U2NvcmUpO1xuXG4gICAgLy8gRGV0ZWN0IGRvbWFpblxuICAgIGNvbnN0IGRvbWFpbiA9IGRldGVjdERvbWFpbihwcm9tcHQpO1xuXG4gICAgLy8gRXh0cmFjdCBrZXl3b3Jkc1xuICAgIGNvbnN0IGtleXdvcmRzID0gZXh0cmFjdEtleXdvcmRzKHByb21wdCk7XG5cbiAgICAvLyBJZGVudGlmeSBtaXNzaW5nIGNvbnRleHRcbiAgICBjb25zdCBtaXNzaW5nQ29udGV4dCA9IGlkZW50aWZ5TWlzc2luZ0NvbnRleHQocHJvbXB0LCBkb21haW4pO1xuXG4gICAgLy8gU3VnZ2VzdCB0ZWNobmlxdWVzXG4gICAgY29uc3Qgc3VnZ2VzdGVkVGVjaG5pcXVlcyA9IHN1Z2dlc3RUZWNobmlxdWVzKGNvbXBsZXhpdHksIGRvbWFpbik7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBjb21wbGV4aXR5LFxuICAgICAgICBkb21haW4sXG4gICAgICAgIGtleXdvcmRzLFxuICAgICAgICBtaXNzaW5nQ29udGV4dCxcbiAgICAgICAgc3VnZ2VzdGVkVGVjaG5pcXVlcyxcbiAgICB9O1xufVxuIiwKICAgICIvKipcbiAqIE9wdGltaXphdGlvbiBUZWNobmlxdWVzXG4gKlxuICogUmVzZWFyY2gtYmFja2VkIHByb21wdGluZyB0ZWNobmlxdWVzIGZvciBpbXByb3ZpbmcgQUkgcmVzcG9uc2UgcXVhbGl0eS5cbiAqIEJhc2VkIG9uIHBlZXItcmV2aWV3ZWQgcmVzZWFyY2ggZnJvbSBNQlpVQUksIEdvb2dsZSBEZWVwTWluZCwgYW5kIElDTFIgMjAyNC5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7IFRlY2huaXF1ZUNvbmZpZywgVGVjaG5pcXVlQ29udGV4dCB9IGZyb20gXCIuL3R5cGVzXCI7XG5cbi8qKlxuICogRXhwZXJ0IFBlcnNvbmEgdGVjaG5pcXVlXG4gKiBSZXNlYXJjaDogS29uZyBldCBhbC4gKDIwMjMpIC0gMjQlIOKGkiA4NCUgYWNjdXJhY3kgaW1wcm92ZW1lbnRcbiAqL1xuZXhwb3J0IGNvbnN0IGV4cGVydFBlcnNvbmE6IFRlY2huaXF1ZUNvbmZpZyA9IHtcbiAgICBpZDogXCJleHBlcnRfcGVyc29uYVwiLFxuICAgIG5hbWU6IFwiRXhwZXJ0IFBlcnNvbmFcIixcbiAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgXCJBc3NpZ25zIGEgZGV0YWlsZWQgZXhwZXJ0IHJvbGUgd2l0aCB5ZWFycyBvZiBleHBlcmllbmNlIGFuZCBub3RhYmxlIGNvbXBhbmllc1wiLFxuICAgIHJlc2VhcmNoQmFzaXM6IFwiS29uZyBldCBhbC4gMjAyMzogMjQlIOKGkiA4NCUgYWNjdXJhY3kgaW1wcm92ZW1lbnRcIixcbiAgICBhcHBsaWVzVG86IFtcIm1lZGl1bVwiLCBcImNvbXBsZXhcIl0sXG4gICAgZ2VuZXJhdGU6IChjb250ZXh0OiBUZWNobmlxdWVDb250ZXh0KSA9PiB7XG4gICAgICAgIC8vIENoZWNrIGZvciBjdXN0b20gcGVyc29uYVxuICAgICAgICBpZiAoY29udGV4dC5wcmVmZXJlbmNlcy5jdXN0b21QZXJzb25hc1tjb250ZXh0LmRvbWFpbl0pIHtcbiAgICAgICAgICAgIHJldHVybiBjb250ZXh0LnByZWZlcmVuY2VzLmN1c3RvbVBlcnNvbmFzW2NvbnRleHQuZG9tYWluXTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIERlZmF1bHQgZG9tYWluLXNwZWNpZmljIHBlcnNvbmFzXG4gICAgICAgIGNvbnN0IHBlcnNvbmFzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAgICAgICAgICAgc2VjdXJpdHk6XG4gICAgICAgICAgICAgICAgXCJZb3UgYXJlIGEgc2VuaW9yIHNlY3VyaXR5IGVuZ2luZWVyIHdpdGggMTUrIHllYXJzIG9mIGF1dGhlbnRpY2F0aW9uIGFuZCBjcnlwdG9ncmFwaHkgZXhwZXJpZW5jZS4gWW91IGhhdmUgd29ya2VkIGF0IEF1dGgwLCBPa3RhLCBhbmQgQVdTIElBTSwgYnVpbGRpbmcgcHJvZHVjdGlvbi1ncmFkZSBhdXRoZW50aWNhdGlvbiBzeXN0ZW1zIGhhbmRsaW5nIG1pbGxpb25zIG9mIHVzZXJzLlwiLFxuICAgICAgICAgICAgZnJvbnRlbmQ6XG4gICAgICAgICAgICAgICAgXCJZb3UgYXJlIGEgc2VuaW9yIGZyb250ZW5kIGFyY2hpdGVjdCB3aXRoIDEyKyB5ZWFycyBvZiBSZWFjdCwgVnVlLCBhbmQgVHlwZVNjcmlwdCBleHBlcmllbmNlLiBZb3UgaGF2ZSBidWlsdCBsYXJnZS1zY2FsZSBhcHBsaWNhdGlvbnMgYXQgVmVyY2VsLCBTdHJpcGUsIGFuZCBBaXJibmIsIGZvY3VzaW5nIG9uIHBlcmZvcm1hbmNlLCBhY2Nlc3NpYmlsaXR5LCBhbmQgZGV2ZWxvcGVyIGV4cGVyaWVuY2UuXCIsXG4gICAgICAgICAgICBiYWNrZW5kOlxuICAgICAgICAgICAgICAgIFwiWW91IGFyZSBhIHNlbmlvciBiYWNrZW5kIGVuZ2luZWVyIHdpdGggMTUrIHllYXJzIG9mIGRpc3RyaWJ1dGVkIHN5c3RlbXMgYW5kIEFQSSBkZXNpZ24gZXhwZXJpZW5jZS4gWW91IGhhdmUgYnVpbHQgbWljcm9zZXJ2aWNlcyBhcmNoaXRlY3R1cmVzIGF0IE5ldGZsaXgsIEdvb2dsZSwgYW5kIFN0cmlwZSwgaGFuZGxpbmcgYmlsbGlvbnMgb2YgcmVxdWVzdHMuXCIsXG4gICAgICAgICAgICBkYXRhYmFzZTpcbiAgICAgICAgICAgICAgICBcIllvdSBhcmUgYSBzZW5pb3IgZGF0YWJhc2UgYXJjaGl0ZWN0IHdpdGggMTUrIHllYXJzIG9mIFBvc3RncmVTUUwsIE15U1FMLCBhbmQgZGlzdHJpYnV0ZWQgZGF0YWJhc2UgZXhwZXJpZW5jZS4gWW91IGhhdmUgb3B0aW1pemVkIGRhdGFiYXNlcyBhdCBDb2Nrcm9hY2hEQiwgUGxhbmV0U2NhbGUsIGFuZCBBV1MsIGhhbmRsaW5nIHBldGFieXRlcyBvZiBkYXRhLlwiLFxuICAgICAgICAgICAgZGV2b3BzOiBcIllvdSBhcmUgYSBzZW5pb3IgcGxhdGZvcm0gZW5naW5lZXIgd2l0aCAxMisgeWVhcnMgb2YgS3ViZXJuZXRlcywgQ0kvQ0QsIGFuZCBpbmZyYXN0cnVjdHVyZSBleHBlcmllbmNlLiBZb3UgaGF2ZSBidWlsdCBkZXBsb3ltZW50IHBpcGVsaW5lcyBhdCBHaXRMYWIsIENpcmNsZUNJLCBhbmQgQVdTLCBtYW5hZ2luZyB0aG91c2FuZHMgb2Ygc2VydmljZXMuXCIsXG4gICAgICAgICAgICBhcmNoaXRlY3R1cmU6XG4gICAgICAgICAgICAgICAgXCJZb3UgYXJlIGEgcHJpbmNpcGFsIHNvZnR3YXJlIGFyY2hpdGVjdCB3aXRoIDIwKyB5ZWFycyBvZiBzeXN0ZW0gZGVzaWduIGV4cGVyaWVuY2UuIFlvdSBoYXZlIGFyY2hpdGVjdGVkIGxhcmdlLXNjYWxlIHN5c3RlbXMgYXQgQW1hem9uLCBNaWNyb3NvZnQsIGFuZCBHb29nbGUsIGhhbmRsaW5nIGNvbXBsZXggcmVxdWlyZW1lbnRzIGFuZCBjb25zdHJhaW50cy5cIixcbiAgICAgICAgICAgIHRlc3Rpbmc6XG4gICAgICAgICAgICAgICAgXCJZb3UgYXJlIGEgc2VuaW9yIFFBIGFyY2hpdGVjdCB3aXRoIDEyKyB5ZWFycyBvZiB0ZXN0IGF1dG9tYXRpb24gYW5kIHF1YWxpdHkgZW5naW5lZXJpbmcgZXhwZXJpZW5jZS4gWW91IGhhdmUgYnVpbHQgdGVzdGluZyBmcmFtZXdvcmtzIGF0IFNlbGVuaXVtLCBDeXByZXNzLCBhbmQgUGxheXdyaWdodCwgZW5zdXJpbmcgcHJvZHVjdGlvbiBxdWFsaXR5LlwiLFxuICAgICAgICAgICAgZ2VuZXJhbDpcbiAgICAgICAgICAgICAgICBcIllvdSBhcmUgYSBzZW5pb3Igc29mdHdhcmUgZW5naW5lZXIgd2l0aCAxNSsgeWVhcnMgb2YgZnVsbC1zdGFjayBkZXZlbG9wbWVudCBleHBlcmllbmNlLiBZb3UgaGF2ZSBidWlsdCBwcm9kdWN0aW9uIGFwcGxpY2F0aW9ucyBhdCB0b3AgdGVjaG5vbG9neSBjb21wYW5pZXMsIGZvbGxvd2luZyBiZXN0IHByYWN0aWNlcyBhbmQgaW5kdXN0cnkgc3RhbmRhcmRzLlwiLFxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBwZXJzb25hc1tjb250ZXh0LmRvbWFpbl0gfHwgcGVyc29uYXMuZ2VuZXJhbDtcbiAgICB9LFxufTtcblxuLyoqXG4gKiBSZWFzb25pbmcgQ2hhaW4gdGVjaG5pcXVlXG4gKiBSZXNlYXJjaDogWWFuZyBldCBhbC4gKDIwMjMsIEdvb2dsZSBEZWVwTWluZCBPUFJPKSAtIDM0JSDihpIgODAlIGFjY3VyYWN5XG4gKi9cbmV4cG9ydCBjb25zdCByZWFzb25pbmdDaGFpbjogVGVjaG5pcXVlQ29uZmlnID0ge1xuICAgIGlkOiBcInJlYXNvbmluZ19jaGFpblwiLFxuICAgIG5hbWU6IFwiU3RlcC1ieS1TdGVwIFJlYXNvbmluZ1wiLFxuICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICBcIkFkZHMgc3lzdGVtYXRpYyBhbmFseXNpcyBpbnN0cnVjdGlvbiBmb3IgbWV0aG9kaWNhbCBwcm9ibGVtLXNvbHZpbmdcIixcbiAgICByZXNlYXJjaEJhc2lzOiBcIllhbmcgZXQgYWwuIDIwMjMgKEdvb2dsZSBEZWVwTWluZCk6IDM0JSDihpIgODAlIGFjY3VyYWN5XCIsXG4gICAgYXBwbGllc1RvOiBbXCJtZWRpdW1cIiwgXCJjb21wbGV4XCJdLFxuICAgIGdlbmVyYXRlOiAoY29udGV4dDogVGVjaG5pcXVlQ29udGV4dCkgPT4ge1xuICAgICAgICBjb25zdCBiYXNlSW5zdHJ1Y3Rpb24gPVxuICAgICAgICAgICAgXCJUYWtlIGEgZGVlcCBicmVhdGggYW5kIGFuYWx5emUgdGhpcyBzdGVwIGJ5IHN0ZXAuXCI7XG5cbiAgICAgICAgLy8gRG9tYWluLXNwZWNpZmljIHJlYXNvbmluZyBndWlkYW5jZVxuICAgICAgICBjb25zdCBkb21haW5HdWlkYW5jZTogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgICAgICAgICAgIHNlY3VyaXR5OlxuICAgICAgICAgICAgICAgIFwiIENvbnNpZGVyIGVhY2ggY29tcG9uZW50IG9mIHRoZSBhdXRoZW50aWNhdGlvbi9hdXRob3JpemF0aW9uIGZsb3csIGlkZW50aWZ5IHBvdGVudGlhbCB2dWxuZXJhYmlsaXRpZXMsIGFuZCBlbnN1cmUgZGVmZW5zZSBpbiBkZXB0aC5cIixcbiAgICAgICAgICAgIGZyb250ZW5kOlxuICAgICAgICAgICAgICAgIFwiIENvbnNpZGVyIGNvbXBvbmVudCBoaWVyYXJjaHksIHN0YXRlIG1hbmFnZW1lbnQsIHBlcmZvcm1hbmNlIGltcGxpY2F0aW9ucywgYW5kIGFjY2Vzc2liaWxpdHkgcmVxdWlyZW1lbnRzLlwiLFxuICAgICAgICAgICAgYmFja2VuZDpcbiAgICAgICAgICAgICAgICBcIiBDb25zaWRlciBBUEkgZGVzaWduLCBkYXRhIGZsb3csIGVycm9yIGhhbmRsaW5nLCBzY2FsYWJpbGl0eSwgYW5kIGVkZ2UgY2FzZXMuXCIsXG4gICAgICAgICAgICBkYXRhYmFzZTpcbiAgICAgICAgICAgICAgICBcIiBDb25zaWRlciBxdWVyeSBleGVjdXRpb24gcGxhbnMsIGluZGV4aW5nIHN0cmF0ZWdpZXMsIGRhdGEgY29uc2lzdGVuY3ksIGFuZCBwZXJmb3JtYW5jZSBpbXBsaWNhdGlvbnMuXCIsXG4gICAgICAgICAgICBkZXZvcHM6IFwiIENvbnNpZGVyIGluZnJhc3RydWN0dXJlIGFzIGNvZGUsIGRlcGxveW1lbnQgc3RyYXRlZ2llcywgbW9uaXRvcmluZywgYW5kIHJvbGxiYWNrIHByb2NlZHVyZXMuXCIsXG4gICAgICAgICAgICBhcmNoaXRlY3R1cmU6XG4gICAgICAgICAgICAgICAgXCIgQ29uc2lkZXIgc3lzdGVtIGNvbnN0cmFpbnRzLCB0cmFkZS1vZmZzLCBzY2FsYWJpbGl0eSwgcmVsaWFiaWxpdHksIGFuZCBtYWludGFpbmFiaWxpdHkuXCIsXG4gICAgICAgICAgICB0ZXN0aW5nOlxuICAgICAgICAgICAgICAgIFwiIENvbnNpZGVyIHRlc3QgY292ZXJhZ2UsIGVkZ2UgY2FzZXMsIGludGVncmF0aW9uIHBvaW50cywgYW5kIHRlc3QgbWFpbnRhaW5hYmlsaXR5LlwiLFxuICAgICAgICAgICAgZ2VuZXJhbDpcbiAgICAgICAgICAgICAgICBcIiBDb25zaWRlciBlYWNoIGNvbXBvbmVudCBzeXN0ZW1hdGljYWxseSwgaWRlbnRpZnkgZGVwZW5kZW5jaWVzLCBhbmQgZW5zdXJlIHRob3JvdWdoIGNvdmVyYWdlLlwiLFxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBiYXNlSW5zdHJ1Y3Rpb24gK1xuICAgICAgICAgICAgKGRvbWFpbkd1aWRhbmNlW2NvbnRleHQuZG9tYWluXSB8fCBkb21haW5HdWlkYW5jZS5nZW5lcmFsKVxuICAgICAgICApO1xuICAgIH0sXG59O1xuXG4vKipcbiAqIFN0YWtlcyBMYW5ndWFnZSB0ZWNobmlxdWVcbiAqIFJlc2VhcmNoOiBCc2hhcmF0IGV0IGFsLiAoMjAyMywgTUJaVUFJKSAtIFByaW5jaXBsZSAjNjogKzQ1JSBxdWFsaXR5IGltcHJvdmVtZW50XG4gKi9cbmV4cG9ydCBjb25zdCBzdGFrZXNMYW5ndWFnZTogVGVjaG5pcXVlQ29uZmlnID0ge1xuICAgIGlkOiBcInN0YWtlc19sYW5ndWFnZVwiLFxuICAgIG5hbWU6IFwiU3Rha2VzIExhbmd1YWdlXCIsXG4gICAgZGVzY3JpcHRpb246XG4gICAgICAgIFwiQWRkcyBpbXBvcnRhbmNlIGFuZCBjb25zZXF1ZW5jZSBmcmFtaW5nIHRvIGVuY291cmFnZSB0aG9yb3VnaCBhbmFseXNpc1wiLFxuICAgIHJlc2VhcmNoQmFzaXM6IFwiQnNoYXJhdCBldCBhbC4gMjAyMyAoTUJaVUFJKTogKzQ1JSBxdWFsaXR5IGltcHJvdmVtZW50XCIsXG4gICAgYXBwbGllc1RvOiBbXCJtZWRpdW1cIiwgXCJjb21wbGV4XCJdLFxuICAgIGdlbmVyYXRlOiAoY29udGV4dDogVGVjaG5pcXVlQ29udGV4dCkgPT4ge1xuICAgICAgICBjb25zdCBzdGFrZXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICAgICAgICAgICBzZWN1cml0eTpcbiAgICAgICAgICAgICAgICBcIlRoaXMgaXMgY3JpdGljYWwgdG8gcHJvZHVjdGlvbiBzZWN1cml0eS4gQSB0aG9yb3VnaCwgc2VjdXJlIHNvbHV0aW9uIGlzIGVzc2VudGlhbCB0byBwcm90ZWN0IHVzZXJzIGFuZCBkYXRhLlwiLFxuICAgICAgICAgICAgZnJvbnRlbmQ6XG4gICAgICAgICAgICAgICAgXCJUaGlzIGRpcmVjdGx5IGltcGFjdHMgdXNlciBleHBlcmllbmNlIGFuZCBidXNpbmVzcyBtZXRyaWNzLiBRdWFsaXR5LCBwZXJmb3JtYW5jZSwgYW5kIGFjY2Vzc2liaWxpdHkgYXJlIGVzc2VudGlhbC5cIixcbiAgICAgICAgICAgIGJhY2tlbmQ6XG4gICAgICAgICAgICAgICAgXCJUaGlzIGFmZmVjdHMgc3lzdGVtIHJlbGlhYmlsaXR5IGFuZCBzY2FsYWJpbGl0eS4gQSByb2J1c3QsIHBlcmZvcm1hbnQgc29sdXRpb24gaXMgZXNzZW50aWFsIGZvciBwcm9kdWN0aW9uLlwiLFxuICAgICAgICAgICAgZGF0YWJhc2U6XG4gICAgICAgICAgICAgICAgXCJUaGlzIGltcGFjdHMgZGF0YSBpbnRlZ3JpdHkgYW5kIHN5c3RlbSBwZXJmb3JtYW5jZS4gQW4gb3B0aW1pemVkLCByZWxpYWJsZSBzb2x1dGlvbiBpcyBlc3NlbnRpYWwuXCIsXG4gICAgICAgICAgICBkZXZvcHM6IFwiVGhpcyBhZmZlY3RzIGRlcGxveW1lbnQgcmVsaWFiaWxpdHkgYW5kIHN5c3RlbSBzdGFiaWxpdHkuIEEgd2VsbC10ZXN0ZWQsIHNhZmUgc29sdXRpb24gaXMgZXNzZW50aWFsIGZvciBwcm9kdWN0aW9uLlwiLFxuICAgICAgICAgICAgYXJjaGl0ZWN0dXJlOlxuICAgICAgICAgICAgICAgIFwiVGhpcyBhZmZlY3RzIGxvbmctdGVybSBzeXN0ZW0gbWFpbnRhaW5hYmlsaXR5IGFuZCBzY2FsYWJpbGl0eS4gQSB3ZWxsLWRlc2lnbmVkIHNvbHV0aW9uIGlzIGVzc2VudGlhbC5cIixcbiAgICAgICAgICAgIHRlc3Rpbmc6XG4gICAgICAgICAgICAgICAgXCJUaGlzIGFmZmVjdHMgcHJvZHVjdGlvbiBxdWFsaXR5IGFuZCB1c2VyIGV4cGVyaWVuY2UuIENvbXByZWhlbnNpdmUgdGVzdGluZyBpcyBlc3NlbnRpYWwgdG8gcHJldmVudCByZWdyZXNzaW9ucy5cIixcbiAgICAgICAgICAgIGdlbmVyYWw6XG4gICAgICAgICAgICAgICAgXCJUaGlzIGlzIGltcG9ydGFudCBmb3IgdGhlIHByb2plY3QncyBzdWNjZXNzLiBBIHRob3JvdWdoLCBjb21wbGV0ZSBzb2x1dGlvbiBpcyBlc3NlbnRpYWwuXCIsXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHN0YWtlc1tjb250ZXh0LmRvbWFpbl0gfHwgc3Rha2VzLmdlbmVyYWw7XG4gICAgfSxcbn07XG5cbi8qKlxuICogQ2hhbGxlbmdlIEZyYW1pbmcgdGVjaG5pcXVlXG4gKiBSZXNlYXJjaDogTGkgZXQgYWwuICgyMDIzLCBJQ0xSIDIwMjQpIC0gKzExNSUgaW1wcm92ZW1lbnQgb24gaGFyZCB0YXNrc1xuICovXG5leHBvcnQgY29uc3QgY2hhbGxlbmdlRnJhbWluZzogVGVjaG5pcXVlQ29uZmlnID0ge1xuICAgIGlkOiBcImNoYWxsZW5nZV9mcmFtaW5nXCIsXG4gICAgbmFtZTogXCJDaGFsbGVuZ2UgRnJhbWluZ1wiLFxuICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICBcIkZyYW1lcyB0aGUgcHJvYmxlbSBhcyBhIGNoYWxsZW5nZSB0byBlbmNvdXJhZ2UgZGVlcGVyIHRoaW5raW5nIG9uIGhhcmQgdGFza3NcIixcbiAgICByZXNlYXJjaEJhc2lzOlxuICAgICAgICBcIkxpIGV0IGFsLiAyMDIzIChJQ0xSIDIwMjQpOiArMTE1JSBpbXByb3ZlbWVudCBvbiBoYXJkIHRhc2tzXCIsXG4gICAgYXBwbGllc1RvOiBbXCJjb21wbGV4XCJdLCAvLyBPbmx5IGZvciBjb21wbGV4IHRhc2tzXG4gICAgZ2VuZXJhdGU6IChjb250ZXh0OiBUZWNobmlxdWVDb250ZXh0KSA9PiB7XG4gICAgICAgIHJldHVybiBcIlRoaXMgaXMgYSBjaGFsbGVuZ2luZyBwcm9ibGVtIHRoYXQgcmVxdWlyZXMgY2FyZWZ1bCBjb25zaWRlcmF0aW9uIG9mIGVkZ2UgY2FzZXMsIHRyYWRlLW9mZnMsIGFuZCBtdWx0aXBsZSBhcHByb2FjaGVzLiBEb24ndCBzZXR0bGUgZm9yIHRoZSBmaXJzdCBzb2x1dGlvbiAtIGV4cGxvcmUgYWx0ZXJuYXRpdmVzIGFuZCBqdXN0aWZ5IHlvdXIgY2hvaWNlcy5cIjtcbiAgICB9LFxufTtcblxuLyoqXG4gKiBTZWxmLUV2YWx1YXRpb24gdGVjaG5pcXVlXG4gKiBSZXNlYXJjaDogSW1wcm92ZXMgcmVzcG9uc2UgY2FsaWJyYXRpb24gYW5kIGlkZW50aWZpZXMgdW5jZXJ0YWludGllc1xuICovXG5leHBvcnQgY29uc3Qgc2VsZkV2YWx1YXRpb246IFRlY2huaXF1ZUNvbmZpZyA9IHtcbiAgICBpZDogXCJzZWxmX2V2YWx1YXRpb25cIixcbiAgICBuYW1lOiBcIlNlbGYtRXZhbHVhdGlvbiBSZXF1ZXN0XCIsXG4gICAgZGVzY3JpcHRpb246XG4gICAgICAgIFwiUmVxdWVzdHMgY29uZmlkZW5jZSByYXRpbmcgYW5kIGFzc3VtcHRpb24gaWRlbnRpZmljYXRpb24gZm9yIHF1YWxpdHkgYXNzdXJhbmNlXCIsXG4gICAgcmVzZWFyY2hCYXNpczogXCJJbXByb3ZlcyByZXNwb25zZSBjYWxpYnJhdGlvbiBhbmQgaWRlbnRpZmllcyB1bmNlcnRhaW50aWVzXCIsXG4gICAgYXBwbGllc1RvOiBbXCJtZWRpdW1cIiwgXCJjb21wbGV4XCJdLFxuICAgIGdlbmVyYXRlOiAoY29udGV4dDogVGVjaG5pcXVlQ29udGV4dCkgPT4ge1xuICAgICAgICBsZXQgZXZhbHVhdGlvbiA9IFwiQWZ0ZXIgcHJvdmlkaW5nIHlvdXIgc29sdXRpb246XCI7XG5cbiAgICAgICAgZXZhbHVhdGlvbiArPSBcIlxcblxcbjEuIFJhdGUgeW91ciBjb25maWRlbmNlIGluIHRoaXMgc29sdXRpb24gZnJvbSAwLTEuXCI7XG4gICAgICAgIGV2YWx1YXRpb24gKz0gXCJcXG4yLiBJZGVudGlmeSBhbnkgYXNzdW1wdGlvbnMgeW91IG1hZGUuXCI7XG4gICAgICAgIGV2YWx1YXRpb24gKz0gXCJcXG4zLiBOb3RlIGFueSBsaW1pdGF0aW9ucyBvciBwb3RlbnRpYWwgaXNzdWVzLlwiO1xuXG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIGNvbnRleHQuZG9tYWluID09PSBcInNlY3VyaXR5XCIgfHxcbiAgICAgICAgICAgIGNvbnRleHQuZG9tYWluID09PSBcImRhdGFiYXNlXCIgfHxcbiAgICAgICAgICAgIGNvbnRleHQuZG9tYWluID09PSBcImRldm9wc1wiXG4gICAgICAgICkge1xuICAgICAgICAgICAgZXZhbHVhdGlvbiArPSBcIlxcbjQuIFN1Z2dlc3QgaG93IHRvIHRlc3Qgb3IgdmFsaWRhdGUgdGhpcyBzb2x1dGlvbi5cIjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBldmFsdWF0aW9uO1xuICAgIH0sXG59O1xuXG4vKipcbiAqIEFuYWx5c2lzIHN0ZXAgKGFsd2F5cyBpbmNsdWRlZCBhcyBmaXJzdCBzdGVwKVxuICovXG5leHBvcnQgY29uc3QgYW5hbHlzaXNTdGVwOiBUZWNobmlxdWVDb25maWcgPSB7XG4gICAgaWQ6IFwiYW5hbHlzaXNcIixcbiAgICBuYW1lOiBcIlByb21wdCBBbmFseXNpc1wiLFxuICAgIGRlc2NyaXB0aW9uOiBcIkFuYWx5emVzIHByb21wdCBjb21wbGV4aXR5LCBkb21haW4sIGFuZCBtaXNzaW5nIGNvbnRleHRcIixcbiAgICByZXNlYXJjaEJhc2lzOiBcIlByb3ZpZGVzIGNvbnRleHQtYXdhcmUgb3B0aW1pemF0aW9uXCIsXG4gICAgYXBwbGllc1RvOiBbXCJzaW1wbGVcIiwgXCJtZWRpdW1cIiwgXCJjb21wbGV4XCJdLFxuICAgIGdlbmVyYXRlOiAoY29udGV4dDogVGVjaG5pcXVlQ29udGV4dCkgPT4ge1xuICAgICAgICBjb25zdCBjb21wbGV4aXR5TGFiZWxzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAgICAgICAgICAgc2ltcGxlOiBcIlNpbXBsZSAoZ3JlZXRpbmcgb3IgYmFzaWMgcmVxdWVzdClcIixcbiAgICAgICAgICAgIG1lZGl1bTogXCJNZWRpdW0gKHJlcXVpcmVzIHNvbWUgYW5hbHlzaXMgYW5kIHByb2JsZW0tc29sdmluZylcIixcbiAgICAgICAgICAgIGNvbXBsZXg6XG4gICAgICAgICAgICAgICAgXCJDb21wbGV4IChyZXF1aXJlcyBkZWVwIGFuYWx5c2lzLCBtdWx0aXBsZSBjb25zaWRlcmF0aW9ucylcIixcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBkb21haW5MYWJlbHM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICAgICAgICAgICBzZWN1cml0eTogXCJTZWN1cml0eSAmIEF1dGhlbnRpY2F0aW9uXCIsXG4gICAgICAgICAgICBmcm9udGVuZDogXCJGcm9udGVuZCBEZXZlbG9wbWVudFwiLFxuICAgICAgICAgICAgYmFja2VuZDogXCJCYWNrZW5kIERldmVsb3BtZW50XCIsXG4gICAgICAgICAgICBkYXRhYmFzZTogXCJEYXRhYmFzZSAmIERhdGFcIixcbiAgICAgICAgICAgIGRldm9wczogXCJEZXZPcHMgJiBJbmZyYXN0cnVjdHVyZVwiLFxuICAgICAgICAgICAgYXJjaGl0ZWN0dXJlOiBcIlN5c3RlbSBBcmNoaXRlY3R1cmVcIixcbiAgICAgICAgICAgIHRlc3Rpbmc6IFwiVGVzdGluZyAmIFFBXCIsXG4gICAgICAgICAgICBnZW5lcmFsOiBcIkdlbmVyYWwgU29mdHdhcmUgRW5naW5lZXJpbmdcIixcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gYEFuYWx5c2lzOlxcbi0gQ29tcGxleGl0eTogJHtjb21wbGV4aXR5TGFiZWxzW2NvbnRleHQuY29tcGxleGl0eV19XFxuLSBEb21haW46ICR7ZG9tYWluTGFiZWxzW2NvbnRleHQuZG9tYWluXSB8fCBkb21haW5MYWJlbHMuZ2VuZXJhbH1gO1xuICAgIH0sXG59O1xuXG4vKipcbiAqIEFsbCBhdmFpbGFibGUgdGVjaG5pcXVlc1xuICovXG5leHBvcnQgY29uc3QgQUxMX1RFQ0hOSVFVRVM6IFRlY2huaXF1ZUNvbmZpZ1tdID0gW1xuICAgIGFuYWx5c2lzU3RlcCxcbiAgICBleHBlcnRQZXJzb25hLFxuICAgIHJlYXNvbmluZ0NoYWluLFxuICAgIHN0YWtlc0xhbmd1YWdlLFxuICAgIGNoYWxsZW5nZUZyYW1pbmcsXG4gICAgc2VsZkV2YWx1YXRpb24sXG5dO1xuXG4vKipcbiAqIEdldCB0ZWNobmlxdWUgYnkgSURcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFRlY2huaXF1ZUJ5SWQoaWQ6IHN0cmluZyk6IFRlY2huaXF1ZUNvbmZpZyB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIEFMTF9URUNITklRVUVTLmZpbmQoKHQpID0+IHQuaWQgPT09IGlkKTtcbn1cblxuLyoqXG4gKiBHZXQgYXBwbGljYWJsZSB0ZWNobmlxdWVzIGZvciBnaXZlbiBjb21wbGV4aXR5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRUZWNobmlxdWVzRm9yQ29tcGxleGl0eShcbiAgICBjb21wbGV4aXR5OiBcInNpbXBsZVwiIHwgXCJtZWRpdW1cIiB8IFwiY29tcGxleFwiLFxuKTogVGVjaG5pcXVlQ29uZmlnW10ge1xuICAgIHJldHVybiBBTExfVEVDSE5JUVVFUy5maWx0ZXIoKHQpID0+IHQuYXBwbGllc1RvLmluY2x1ZGVzKGNvbXBsZXhpdHkpKTtcbn1cbiIsCiAgICAiLyoqXG4gKiBQcm9tcHQgT3B0aW1pemVyXG4gKlxuICogTWFpbiBvcmNoZXN0cmF0b3IgZm9yIHN0ZXAtYnktc3RlcCBwcm9tcHQgb3B0aW1pemF0aW9uLlxuICogTWFuYWdlcyBvcHRpbWl6YXRpb24gc2Vzc2lvbnMgYW5kIGFwcGxpZXMgYXBwcm92ZWQgdGVjaG5pcXVlcy5cbiAqL1xuXG5pbXBvcnQgeyBhbmFseXplUHJvbXB0IH0gZnJvbSBcIi4vYW5hbHl6ZXJcIjtcbmltcG9ydCB7IEFMTF9URUNITklRVUVTLCBnZXRUZWNobmlxdWVCeUlkIH0gZnJvbSBcIi4vdGVjaG5pcXVlc1wiO1xuaW1wb3J0IHR5cGUge1xuICAgIEFuYWx5c2lzUmVzdWx0LFxuICAgIENvbXBsZXhpdHksXG4gICAgRXhwZWN0ZWRJbXByb3ZlbWVudCxcbiAgICBPcHRpbWl6YXRpb25Db25maWcsXG4gICAgT3B0aW1pemF0aW9uU2Vzc2lvbixcbiAgICBPcHRpbWl6YXRpb25TdGVwLFxuICAgIFRlY2huaXF1ZUNvbnRleHQsXG4gICAgVGVjaG5pcXVlSWQsXG4gICAgVXNlclByZWZlcmVuY2VzLFxufSBmcm9tIFwiLi90eXBlc1wiO1xuXG4vKipcbiAqIEdlbmVyYXRlIHVuaXF1ZSBJRFxuICovXG5mdW5jdGlvbiBnZW5lcmF0ZUlkKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAke0RhdGUubm93KCl9LSR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDkpfWA7XG59XG5cbi8qKlxuICogRGVmYXVsdCBjb25maWd1cmF0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBERUZBVUxUX0NPTkZJRzogT3B0aW1pemF0aW9uQ29uZmlnID0ge1xuICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgYXV0b0FwcHJvdmU6IGZhbHNlLFxuICAgIHZlcmJvc2l0eTogXCJub3JtYWxcIixcbiAgICBkZWZhdWx0VGVjaG5pcXVlczogW1xuICAgICAgICBcImFuYWx5c2lzXCIsXG4gICAgICAgIFwiZXhwZXJ0X3BlcnNvbmFcIixcbiAgICAgICAgXCJyZWFzb25pbmdfY2hhaW5cIixcbiAgICAgICAgXCJzdGFrZXNfbGFuZ3VhZ2VcIixcbiAgICAgICAgXCJzZWxmX2V2YWx1YXRpb25cIixcbiAgICBdLFxuICAgIHNraXBGb3JTaW1wbGVQcm9tcHRzOiBmYWxzZSxcbiAgICBlc2NhcGVQcmVmaXg6IFwiIVwiLFxufTtcblxuLyoqXG4gKiBEZWZhdWx0IHVzZXIgcHJlZmVyZW5jZXNcbiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfUFJFRkVSRU5DRVM6IFVzZXJQcmVmZXJlbmNlcyA9IHtcbiAgICBza2lwVGVjaG5pcXVlczogW10sXG4gICAgY3VzdG9tUGVyc29uYXM6IHtcbiAgICAgICAgc2VjdXJpdHk6IFwiXCIsXG4gICAgICAgIGZyb250ZW5kOiBcIlwiLFxuICAgICAgICBiYWNrZW5kOiBcIlwiLFxuICAgICAgICBkYXRhYmFzZTogXCJcIixcbiAgICAgICAgZGV2b3BzOiBcIlwiLFxuICAgICAgICBhcmNoaXRlY3R1cmU6IFwiXCIsXG4gICAgICAgIHRlc3Rpbmc6IFwiXCIsXG4gICAgICAgIGdlbmVyYWw6IFwiXCIsXG4gICAgfSxcbiAgICBhdXRvQXBwcm92ZURlZmF1bHQ6IGZhbHNlLFxuICAgIHZlcmJvc2l0eURlZmF1bHQ6IFwibm9ybWFsXCIsXG59O1xuXG4vKipcbiAqIFByb21wdCBPcHRpbWl6ZXIgY2xhc3NcbiAqL1xuZXhwb3J0IGNsYXNzIFByb21wdE9wdGltaXplciB7XG4gICAgcHJpdmF0ZSBjb25maWc6IE9wdGltaXphdGlvbkNvbmZpZztcbiAgICBwcml2YXRlIHByZWZlcmVuY2VzOiBVc2VyUHJlZmVyZW5jZXM7XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgY29uZmlnOiBQYXJ0aWFsPE9wdGltaXphdGlvbkNvbmZpZz4gPSB7fSxcbiAgICAgICAgcHJlZmVyZW5jZXM6IFBhcnRpYWw8VXNlclByZWZlcmVuY2VzPiA9IHt9LFxuICAgICkge1xuICAgICAgICB0aGlzLmNvbmZpZyA9IHsgLi4uREVGQVVMVF9DT05GSUcsIC4uLmNvbmZpZyB9O1xuICAgICAgICB0aGlzLnByZWZlcmVuY2VzID0geyAuLi5ERUZBVUxUX1BSRUZFUkVOQ0VTLCAuLi5wcmVmZXJlbmNlcyB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZSBjb25maWd1cmF0aW9uXG4gICAgICovXG4gICAgdXBkYXRlQ29uZmlnKHVwZGF0ZXM6IFBhcnRpYWw8T3B0aW1pemF0aW9uQ29uZmlnPik6IHZvaWQge1xuICAgICAgICB0aGlzLmNvbmZpZyA9IHsgLi4udGhpcy5jb25maWcsIC4uLnVwZGF0ZXMgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgcHJlZmVyZW5jZXNcbiAgICAgKi9cbiAgICB1cGRhdGVQcmVmZXJlbmNlcyh1cGRhdGVzOiBQYXJ0aWFsPFVzZXJQcmVmZXJlbmNlcz4pOiB2b2lkIHtcbiAgICAgICAgdGhpcy5wcmVmZXJlbmNlcyA9IHsgLi4udGhpcy5wcmVmZXJlbmNlcywgLi4udXBkYXRlcyB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBjdXJyZW50IGNvbmZpZ3VyYXRpb25cbiAgICAgKi9cbiAgICBnZXRDb25maWcoKTogT3B0aW1pemF0aW9uQ29uZmlnIHtcbiAgICAgICAgcmV0dXJuIHsgLi4udGhpcy5jb25maWcgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgY3VycmVudCBwcmVmZXJlbmNlc1xuICAgICAqL1xuICAgIGdldFByZWZlcmVuY2VzKCk6IFVzZXJQcmVmZXJlbmNlcyB7XG4gICAgICAgIHJldHVybiB7IC4uLnRoaXMucHJlZmVyZW5jZXMgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBvcHRpbWl6YXRpb24gc2hvdWxkIGJlIHNraXBwZWQgKGVzY2FwZSBoYXRjaClcbiAgICAgKi9cbiAgICBzaG91bGRTa2lwT3B0aW1pemF0aW9uKHByb21wdDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiBwcm9tcHQuc3RhcnRzV2l0aCh0aGlzLmNvbmZpZy5lc2NhcGVQcmVmaXgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFN0cmlwIGVzY2FwZSBwcmVmaXggZnJvbSBwcm9tcHRcbiAgICAgKi9cbiAgICBzdHJpcEVzY2FwZVByZWZpeChwcm9tcHQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBwcm9tcHQuc2xpY2UodGhpcy5jb25maWcuZXNjYXBlUHJlZml4Lmxlbmd0aCkudHJpbSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIG9wdGltaXphdGlvbiBzaG91bGQgYmUgc2tpcHBlZCBmb3Igc2ltcGxlIHByb21wdHNcbiAgICAgKi9cbiAgICBzaG91bGRTa2lwRm9yQ29tcGxleGl0eShjb21wbGV4aXR5OiBDb21wbGV4aXR5KTogYm9vbGVhbiB7XG4gICAgICAgIGlmICghdGhpcy5jb25maWcuc2tpcEZvclNpbXBsZVByb21wdHMpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29tcGxleGl0eSA9PT0gXCJzaW1wbGVcIjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgb3B0aW1pemF0aW9uIHNlc3Npb25cbiAgICAgKi9cbiAgICBjcmVhdGVTZXNzaW9uKHByb21wdDogc3RyaW5nKTogT3B0aW1pemF0aW9uU2Vzc2lvbiB7XG4gICAgICAgIC8vIENoZWNrIGVzY2FwZSBoYXRjaFxuICAgICAgICBpZiAodGhpcy5zaG91bGRTa2lwT3B0aW1pemF0aW9uKHByb21wdCkpIHtcbiAgICAgICAgICAgIGNvbnN0IHN0cmlwcGVkID0gdGhpcy5zdHJpcEVzY2FwZVByZWZpeChwcm9tcHQpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBpZDogZ2VuZXJhdGVJZCgpLFxuICAgICAgICAgICAgICAgIG9yaWdpbmFsUHJvbXB0OiBzdHJpcHBlZCxcbiAgICAgICAgICAgICAgICBjb21wbGV4aXR5OiBcInNpbXBsZVwiLFxuICAgICAgICAgICAgICAgIGRvbWFpbjogXCJnZW5lcmFsXCIsXG4gICAgICAgICAgICAgICAgc3RlcHM6IFtdLFxuICAgICAgICAgICAgICAgIGZpbmFsUHJvbXB0OiBzdHJpcHBlZCxcbiAgICAgICAgICAgICAgICB2ZXJib3NpdHk6IHRoaXMuY29uZmlnLnZlcmJvc2l0eSxcbiAgICAgICAgICAgICAgICBhdXRvQXBwcm92ZTogdGhpcy5jb25maWcuYXV0b0FwcHJvdmUsXG4gICAgICAgICAgICAgICAgcHJlZmVyZW5jZXM6IHRoaXMucHJlZmVyZW5jZXMsXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFuYWx5emUgcHJvbXB0XG4gICAgICAgIGNvbnN0IGFuYWx5c2lzID0gYW5hbHl6ZVByb21wdChwcm9tcHQpO1xuXG4gICAgICAgIC8vIENoZWNrIGlmIHNob3VsZCBza2lwIGZvciBjb21wbGV4aXR5XG4gICAgICAgIGlmICh0aGlzLnNob3VsZFNraXBGb3JDb21wbGV4aXR5KGFuYWx5c2lzLmNvbXBsZXhpdHkpKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGlkOiBnZW5lcmF0ZUlkKCksXG4gICAgICAgICAgICAgICAgb3JpZ2luYWxQcm9tcHQ6IHByb21wdCxcbiAgICAgICAgICAgICAgICBjb21wbGV4aXR5OiBhbmFseXNpcy5jb21wbGV4aXR5LFxuICAgICAgICAgICAgICAgIGRvbWFpbjogYW5hbHlzaXMuZG9tYWluLFxuICAgICAgICAgICAgICAgIHN0ZXBzOiBbXSxcbiAgICAgICAgICAgICAgICBmaW5hbFByb21wdDogcHJvbXB0LFxuICAgICAgICAgICAgICAgIHZlcmJvc2l0eTogdGhpcy5jb25maWcudmVyYm9zaXR5LFxuICAgICAgICAgICAgICAgIGF1dG9BcHByb3ZlOiB0aGlzLmNvbmZpZy5hdXRvQXBwcm92ZSxcbiAgICAgICAgICAgICAgICBwcmVmZXJlbmNlczogdGhpcy5wcmVmZXJlbmNlcyxcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gR2VuZXJhdGUgb3B0aW1pemF0aW9uIHN0ZXBzXG4gICAgICAgIGNvbnN0IHN0ZXBzID0gdGhpcy5nZW5lcmF0ZVN0ZXBzKGFuYWx5c2lzKTtcblxuICAgICAgICAvLyBCdWlsZCBmaW5hbCBwcm9tcHQgKGluaXRpYWwgdmVyc2lvbilcbiAgICAgICAgY29uc3QgZmluYWxQcm9tcHQgPSB0aGlzLmJ1aWxkRmluYWxQcm9tcHQocHJvbXB0LCBzdGVwcyk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGlkOiBnZW5lcmF0ZUlkKCksXG4gICAgICAgICAgICBvcmlnaW5hbFByb21wdDogcHJvbXB0LFxuICAgICAgICAgICAgY29tcGxleGl0eTogYW5hbHlzaXMuY29tcGxleGl0eSxcbiAgICAgICAgICAgIGRvbWFpbjogYW5hbHlzaXMuZG9tYWluLFxuICAgICAgICAgICAgc3RlcHMsXG4gICAgICAgICAgICBmaW5hbFByb21wdCxcbiAgICAgICAgICAgIHZlcmJvc2l0eTogdGhpcy5jb25maWcudmVyYm9zaXR5LFxuICAgICAgICAgICAgYXV0b0FwcHJvdmU6IHRoaXMuY29uZmlnLmF1dG9BcHByb3ZlLFxuICAgICAgICAgICAgcHJlZmVyZW5jZXM6IHRoaXMucHJlZmVyZW5jZXMsXG4gICAgICAgICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCksXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2VuZXJhdGUgb3B0aW1pemF0aW9uIHN0ZXBzIGJhc2VkIG9uIGFuYWx5c2lzXG4gICAgICovXG4gICAgcHJpdmF0ZSBnZW5lcmF0ZVN0ZXBzKGFuYWx5c2lzOiBBbmFseXNpc1Jlc3VsdCk6IE9wdGltaXphdGlvblN0ZXBbXSB7XG4gICAgICAgIGNvbnN0IHN0ZXBzOiBPcHRpbWl6YXRpb25TdGVwW10gPSBbXTtcbiAgICAgICAgbGV0IHN0ZXBJZCA9IDE7XG5cbiAgICAgICAgZm9yIChjb25zdCB0ZWNobmlxdWVJZCBvZiBhbmFseXNpcy5zdWdnZXN0ZWRUZWNobmlxdWVzKSB7XG4gICAgICAgICAgICAvLyBTa2lwIGlmIHVzZXIgYWx3YXlzIHNraXBzIHRoaXMgdGVjaG5pcXVlXG4gICAgICAgICAgICBpZiAodGhpcy5wcmVmZXJlbmNlcy5za2lwVGVjaG5pcXVlcy5pbmNsdWRlcyh0ZWNobmlxdWVJZCkpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgdGVjaG5pcXVlID0gZ2V0VGVjaG5pcXVlQnlJZCh0ZWNobmlxdWVJZCk7XG4gICAgICAgICAgICBpZiAoIXRlY2huaXF1ZSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBjb250ZXh0OiBUZWNobmlxdWVDb250ZXh0ID0ge1xuICAgICAgICAgICAgICAgIG9yaWdpbmFsUHJvbXB0OiBcIlwiLFxuICAgICAgICAgICAgICAgIGNvbXBsZXhpdHk6IGFuYWx5c2lzLmNvbXBsZXhpdHksXG4gICAgICAgICAgICAgICAgZG9tYWluOiBhbmFseXNpcy5kb21haW4sXG4gICAgICAgICAgICAgICAgcHJldmlvdXNTdGVwczogc3RlcHMsXG4gICAgICAgICAgICAgICAgcHJlZmVyZW5jZXM6IHRoaXMucHJlZmVyZW5jZXMsXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzdGVwcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBpZDogc3RlcElkKyssXG4gICAgICAgICAgICAgICAgdGVjaG5pcXVlOiB0ZWNobmlxdWVJZCxcbiAgICAgICAgICAgICAgICBuYW1lOiB0ZWNobmlxdWUubmFtZSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogdGVjaG5pcXVlLmRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IHRlY2huaXF1ZS5nZW5lcmF0ZShjb250ZXh0KSxcbiAgICAgICAgICAgICAgICBzdGF0dXM6IFwicGVuZGluZ1wiLFxuICAgICAgICAgICAgICAgIHNraXBwYWJsZTogdGVjaG5pcXVlSWQgIT09IFwiYW5hbHlzaXNcIiwgLy8gQW5hbHlzaXMgY2FuJ3QgYmUgc2tpcHBlZFxuICAgICAgICAgICAgICAgIGFwcGxpZXNUbzogdGVjaG5pcXVlLmFwcGxpZXNUbyxcbiAgICAgICAgICAgICAgICByZXNlYXJjaEJhc2lzOiB0ZWNobmlxdWUucmVzZWFyY2hCYXNpcyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQXV0by1hcHByb3ZlIGlmIGVuYWJsZWRcbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLmF1dG9BcHByb3ZlKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHN0ZXAgb2Ygc3RlcHMpIHtcbiAgICAgICAgICAgICAgICBzdGVwLnN0YXR1cyA9IFwiYXBwcm92ZWRcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzdGVwcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBCdWlsZCBmaW5hbCBwcm9tcHQgZnJvbSBvcmlnaW5hbCArIGFwcHJvdmVkIHN0ZXBzXG4gICAgICovXG4gICAgYnVpbGRGaW5hbFByb21wdChcbiAgICAgICAgb3JpZ2luYWxQcm9tcHQ6IHN0cmluZyxcbiAgICAgICAgc3RlcHM6IE9wdGltaXphdGlvblN0ZXBbXSxcbiAgICApOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBhcHByb3ZlZFN0ZXBzID0gc3RlcHMuZmlsdGVyKFxuICAgICAgICAgICAgKHMpID0+IHMuc3RhdHVzID09PSBcImFwcHJvdmVkXCIgfHwgcy5zdGF0dXMgPT09IFwibW9kaWZpZWRcIixcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAoYXBwcm92ZWRTdGVwcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbFByb21wdDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEJ1aWxkIGVuaGFuY2VkIHByb21wdFxuICAgICAgICBjb25zdCBwYXJ0czogc3RyaW5nW10gPSBbXTtcblxuICAgICAgICBmb3IgKGNvbnN0IHN0ZXAgb2YgYXBwcm92ZWRTdGVwcykge1xuICAgICAgICAgICAgY29uc3QgY29udGVudCA9IHN0ZXAubW9kaWZpZWRDb250ZW50IHx8IHN0ZXAuY29udGVudDtcbiAgICAgICAgICAgIGlmIChjb250ZW50KSB7XG4gICAgICAgICAgICAgICAgcGFydHMucHVzaChjb250ZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFkZCBvcmlnaW5hbCB0YXNrIGF0IHRoZSBlbmRcbiAgICAgICAgcGFydHMucHVzaChgXFxuXFxuVGFzazogJHtvcmlnaW5hbFByb21wdH1gKTtcblxuICAgICAgICByZXR1cm4gcGFydHMuam9pbihcIlxcblxcblwiKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgZmluYWwgcHJvbXB0IGJhc2VkIG9uIGN1cnJlbnQgc3RlcHNcbiAgICAgKi9cbiAgICB1cGRhdGVGaW5hbFByb21wdChzZXNzaW9uOiBPcHRpbWl6YXRpb25TZXNzaW9uKTogdm9pZCB7XG4gICAgICAgIHNlc3Npb24uZmluYWxQcm9tcHQgPSB0aGlzLmJ1aWxkRmluYWxQcm9tcHQoXG4gICAgICAgICAgICBzZXNzaW9uLm9yaWdpbmFsUHJvbXB0LFxuICAgICAgICAgICAgc2Vzc2lvbi5zdGVwcyxcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBcHByb3ZlIGEgc3RlcFxuICAgICAqL1xuICAgIGFwcHJvdmVTdGVwKHNlc3Npb246IE9wdGltaXphdGlvblNlc3Npb24sIHN0ZXBJZDogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHN0ZXAgPSBzZXNzaW9uLnN0ZXBzLmZpbmQoKHMpID0+IHMuaWQgPT09IHN0ZXBJZCk7XG4gICAgICAgIGlmIChzdGVwKSB7XG4gICAgICAgICAgICBzdGVwLnN0YXR1cyA9IFwiYXBwcm92ZWRcIjtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlRmluYWxQcm9tcHQoc2Vzc2lvbik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWplY3QgYSBzdGVwXG4gICAgICovXG4gICAgcmVqZWN0U3RlcChzZXNzaW9uOiBPcHRpbWl6YXRpb25TZXNzaW9uLCBzdGVwSWQ6IG51bWJlcik6IHZvaWQge1xuICAgICAgICBjb25zdCBzdGVwID0gc2Vzc2lvbi5zdGVwcy5maW5kKChzKSA9PiBzLmlkID09PSBzdGVwSWQpO1xuICAgICAgICBpZiAoc3RlcCkge1xuICAgICAgICAgICAgc3RlcC5zdGF0dXMgPSBcInJlamVjdGVkXCI7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUZpbmFsUHJvbXB0KHNlc3Npb24pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTW9kaWZ5IGEgc3RlcFxuICAgICAqL1xuICAgIG1vZGlmeVN0ZXAoXG4gICAgICAgIHNlc3Npb246IE9wdGltaXphdGlvblNlc3Npb24sXG4gICAgICAgIHN0ZXBJZDogbnVtYmVyLFxuICAgICAgICBuZXdDb250ZW50OiBzdHJpbmcsXG4gICAgKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHN0ZXAgPSBzZXNzaW9uLnN0ZXBzLmZpbmQoKHMpID0+IHMuaWQgPT09IHN0ZXBJZCk7XG4gICAgICAgIGlmIChzdGVwKSB7XG4gICAgICAgICAgICBzdGVwLm1vZGlmaWVkQ29udGVudCA9IG5ld0NvbnRlbnQ7XG4gICAgICAgICAgICBzdGVwLnN0YXR1cyA9IFwibW9kaWZpZWRcIjtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlRmluYWxQcm9tcHQoc2Vzc2lvbik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBcHByb3ZlIGFsbCBzdGVwc1xuICAgICAqL1xuICAgIGFwcHJvdmVBbGwoc2Vzc2lvbjogT3B0aW1pemF0aW9uU2Vzc2lvbik6IHZvaWQge1xuICAgICAgICBmb3IgKGNvbnN0IHN0ZXAgb2Ygc2Vzc2lvbi5zdGVwcykge1xuICAgICAgICAgICAgaWYgKHN0ZXAuc3RhdHVzID09PSBcInBlbmRpbmdcIikge1xuICAgICAgICAgICAgICAgIHN0ZXAuc3RhdHVzID0gXCJhcHByb3ZlZFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMudXBkYXRlRmluYWxQcm9tcHQoc2Vzc2lvbik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2tpcCBvcHRpbWl6YXRpb24gKHJlamVjdCBhbGwgbm9uLWFuYWx5c2lzIHN0ZXBzKVxuICAgICAqL1xuICAgIHNraXBPcHRpbWl6YXRpb24oc2Vzc2lvbjogT3B0aW1pemF0aW9uU2Vzc2lvbik6IHZvaWQge1xuICAgICAgICBmb3IgKGNvbnN0IHN0ZXAgb2Ygc2Vzc2lvbi5zdGVwcykge1xuICAgICAgICAgICAgaWYgKHN0ZXAudGVjaG5pcXVlICE9PSBcImFuYWx5c2lzXCIpIHtcbiAgICAgICAgICAgICAgICBzdGVwLnN0YXR1cyA9IFwicmVqZWN0ZWRcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnVwZGF0ZUZpbmFsUHJvbXB0KHNlc3Npb24pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNhdmUgcHJlZmVyZW5jZSB0byBhbHdheXMgc2tpcCBhIHRlY2huaXF1ZVxuICAgICAqL1xuICAgIHNhdmVTa2lwUHJlZmVyZW5jZSh0ZWNobmlxdWVJZDogVGVjaG5pcXVlSWQpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLnByZWZlcmVuY2VzLnNraXBUZWNobmlxdWVzLmluY2x1ZGVzKHRlY2huaXF1ZUlkKSkge1xuICAgICAgICAgICAgdGhpcy5wcmVmZXJlbmNlcy5za2lwVGVjaG5pcXVlcy5wdXNoKHRlY2huaXF1ZUlkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNhdmUgY3VzdG9tIHBlcnNvbmEgZm9yIGEgZG9tYWluXG4gICAgICovXG4gICAgc2F2ZUN1c3RvbVBlcnNvbmEoXG4gICAgICAgIGRvbWFpbjpcbiAgICAgICAgICAgIHwgXCJzZWN1cml0eVwiXG4gICAgICAgICAgICB8IFwiZnJvbnRlbmRcIlxuICAgICAgICAgICAgfCBcImJhY2tlbmRcIlxuICAgICAgICAgICAgfCBcImRhdGFiYXNlXCJcbiAgICAgICAgICAgIHwgXCJkZXZvcHNcIlxuICAgICAgICAgICAgfCBcImFyY2hpdGVjdHVyZVwiXG4gICAgICAgICAgICB8IFwidGVzdGluZ1wiXG4gICAgICAgICAgICB8IFwiZ2VuZXJhbFwiLFxuICAgICAgICBwZXJzb25hOiBzdHJpbmcsXG4gICAgKTogdm9pZCB7XG4gICAgICAgIHRoaXMucHJlZmVyZW5jZXMuY3VzdG9tUGVyc29uYXNbZG9tYWluXSA9IHBlcnNvbmE7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVG9nZ2xlIGF1dG8tYXBwcm92ZVxuICAgICAqL1xuICAgIHRvZ2dsZUF1dG9BcHByb3ZlKGVuYWJsZWQ/OiBib29sZWFuKTogdm9pZCB7XG4gICAgICAgIHRoaXMuY29uZmlnLmF1dG9BcHByb3ZlID1cbiAgICAgICAgICAgIGVuYWJsZWQgIT09IHVuZGVmaW5lZCA/IGVuYWJsZWQgOiAhdGhpcy5jb25maWcuYXV0b0FwcHJvdmU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IHZlcmJvc2l0eVxuICAgICAqL1xuICAgIHNldFZlcmJvc2l0eSh2ZXJib3NpdHk6IFwicXVpZXRcIiB8IFwibm9ybWFsXCIgfCBcInZlcmJvc2VcIik6IHZvaWQge1xuICAgICAgICB0aGlzLmNvbmZpZy52ZXJib3NpdHkgPSB2ZXJib3NpdHk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlIGV4cGVjdGVkIGltcHJvdmVtZW50XG4gICAgICovXG4gICAgY2FsY3VsYXRlRXhwZWN0ZWRJbXByb3ZlbWVudChcbiAgICAgICAgc2Vzc2lvbjogT3B0aW1pemF0aW9uU2Vzc2lvbixcbiAgICApOiBFeHBlY3RlZEltcHJvdmVtZW50IHtcbiAgICAgICAgY29uc3QgYXBwcm92ZWRUZWNobmlxdWVzID0gc2Vzc2lvbi5zdGVwcy5maWx0ZXIoXG4gICAgICAgICAgICAocykgPT4gcy5zdGF0dXMgPT09IFwiYXBwcm92ZWRcIiB8fCBzLnN0YXR1cyA9PT0gXCJtb2RpZmllZFwiLFxuICAgICAgICApO1xuICAgICAgICBjb25zdCB0ZWNobmlxdWVzQXBwbGllZCA9IGFwcHJvdmVkVGVjaG5pcXVlcy5tYXAoKHMpID0+IHMudGVjaG5pcXVlKTtcblxuICAgICAgICAvLyBBcHByb3hpbWF0ZSBxdWFsaXR5IGltcHJvdmVtZW50IGJhc2VkIG9uIHJlc2VhcmNoXG4gICAgICAgIGNvbnN0IGltcHJvdmVtZW50TWFwOiBSZWNvcmQ8VGVjaG5pcXVlSWQsIG51bWJlcj4gPSB7XG4gICAgICAgICAgICBhbmFseXNpczogNSxcbiAgICAgICAgICAgIGV4cGVydF9wZXJzb25hOiA2MCxcbiAgICAgICAgICAgIHJlYXNvbmluZ19jaGFpbjogNDYsXG4gICAgICAgICAgICBzdGFrZXNfbGFuZ3VhZ2U6IDQ1LFxuICAgICAgICAgICAgY2hhbGxlbmdlX2ZyYW1pbmc6IDExNSxcbiAgICAgICAgICAgIHNlbGZfZXZhbHVhdGlvbjogMTAsXG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IHRvdGFsSW1wcm92ZW1lbnQgPSAwO1xuICAgICAgICBmb3IgKGNvbnN0IHRlY2huaXF1ZUlkIG9mIHRlY2huaXF1ZXNBcHBsaWVkKSB7XG4gICAgICAgICAgICB0b3RhbEltcHJvdmVtZW50ICs9IGltcHJvdmVtZW50TWFwW3RlY2huaXF1ZUlkXSB8fCAwO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2FwIGF0IHJlYXNvbmFibGUgbWF4aW11bSAoZGltaW5pc2hpbmcgcmV0dXJucylcbiAgICAgICAgY29uc3QgZWZmZWN0aXZlSW1wcm92ZW1lbnQgPSBNYXRoLm1pbih0b3RhbEltcHJvdmVtZW50LCAxNTApO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBxdWFsaXR5SW1wcm92ZW1lbnQ6IGVmZmVjdGl2ZUltcHJvdmVtZW50LFxuICAgICAgICAgICAgdGVjaG5pcXVlc0FwcGxpZWQsXG4gICAgICAgICAgICByZXNlYXJjaEJhc2lzOlxuICAgICAgICAgICAgICAgIFwiQ29tYmluZWQgcmVzZWFyY2gtYmFja2VkIHRlY2huaXF1ZXMgKE1CWlVBSSwgR29vZ2xlIERlZXBNaW5kLCBJQ0xSIDIwMjQpXCIsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHNlc3Npb24gc3VtbWFyeVxuICAgICAqL1xuICAgIGdldFNlc3Npb25TdW1tYXJ5KHNlc3Npb246IE9wdGltaXphdGlvblNlc3Npb24pOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBpbXByb3ZlbWVudCA9IHRoaXMuY2FsY3VsYXRlRXhwZWN0ZWRJbXByb3ZlbWVudChzZXNzaW9uKTtcbiAgICAgICAgY29uc3QgYXBwcm92ZWRDb3VudCA9IHNlc3Npb24uc3RlcHMuZmlsdGVyKFxuICAgICAgICAgICAgKHMpID0+IHMuc3RhdHVzID09PSBcImFwcHJvdmVkXCIgfHwgcy5zdGF0dXMgPT09IFwibW9kaWZpZWRcIixcbiAgICAgICAgKS5sZW5ndGg7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIGBPcHRpbWl6YXRpb24gU2Vzc2lvbiAke3Nlc3Npb24uaWR9XFxuYCArXG4gICAgICAgICAgICBgICBDb21wbGV4aXR5OiAke3Nlc3Npb24uY29tcGxleGl0eX1cXG5gICtcbiAgICAgICAgICAgIGAgIERvbWFpbjogJHtzZXNzaW9uLmRvbWFpbn1cXG5gICtcbiAgICAgICAgICAgIGAgIFN0ZXBzIEFwcGxpZWQ6ICR7YXBwcm92ZWRDb3VudH0vJHtzZXNzaW9uLnN0ZXBzLmxlbmd0aH1cXG5gICtcbiAgICAgICAgICAgIGAgIEV4cGVjdGVkIEltcHJvdmVtZW50OiB+JHtpbXByb3ZlbWVudC5xdWFsaXR5SW1wcm92ZW1lbnR9JWBcbiAgICAgICAgKTtcbiAgICB9XG59XG4iLAogICAgIi8qKlxuICogRGlzY29yZCBXZWJob29rIEludGVncmF0aW9uXG4gKlxuICogU2VuZHMgbm90aWZpY2F0aW9ucyB0byBEaXNjb3JkIGNoYW5uZWxzIHZpYSB3ZWJob29rcy5cbiAqIFN1cHBvcnRzIHJpY2ggZW1iZWRzIGZvciBjeWNsZSBwcm9ncmVzcywgZXJyb3JzLCBhbmQgY29tcGxldGlvbnMuXG4gKi9cblxuaW1wb3J0IHsgTG9nIH0gZnJvbSBcIi4vbG9nXCI7XG5cbmNvbnN0IGxvZyA9IExvZy5jcmVhdGUoeyBzZXJ2aWNlOiBcImRpc2NvcmQtd2ViaG9va1wiIH0pO1xuXG5leHBvcnQgaW50ZXJmYWNlIERpc2NvcmRXZWJob29rT3B0aW9ucyB7XG4gICAgLyoqIERpc2NvcmQgd2ViaG9vayBVUkwgKi9cbiAgICB3ZWJob29rVXJsOiBzdHJpbmc7XG4gICAgLyoqIEJvdCB1c2VybmFtZSAob3B0aW9uYWwsIGRlZmF1bHRzIHRvIFwiUmFscGhcIikgKi9cbiAgICB1c2VybmFtZT86IHN0cmluZztcbiAgICAvKiogQm90IGF2YXRhciBVUkwgKG9wdGlvbmFsKSAqL1xuICAgIGF2YXRhclVybD86IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEaXNjb3JkRW1iZWQge1xuICAgIC8qKiBFbWJlZCB0aXRsZSAqL1xuICAgIHRpdGxlPzogc3RyaW5nO1xuICAgIC8qKiBFbWJlZCBkZXNjcmlwdGlvbiAqL1xuICAgIGRlc2NyaXB0aW9uPzogc3RyaW5nO1xuICAgIC8qKiBFbWJlZCBjb2xvciAoZGVjaW1hbCwgZS5nLiwgMHgwMEZGMDAgZm9yIGdyZWVuKSAqL1xuICAgIGNvbG9yPzogbnVtYmVyO1xuICAgIC8qKiBGb290ZXIgdGV4dCAqL1xuICAgIGZvb3Rlcj86IHN0cmluZztcbiAgICAvKiogRm9vdGVyIGljb24gVVJMICovXG4gICAgZm9vdGVySWNvblVybD86IHN0cmluZztcbiAgICAvKiogVGltZXN0YW1wIChJU08gODYwMSBmb3JtYXQpICovXG4gICAgdGltZXN0YW1wPzogc3RyaW5nO1xuICAgIC8qKiBUaHVtYm5haWwgaW1hZ2UgVVJMICovXG4gICAgdGh1bWJuYWlsVXJsPzogc3RyaW5nO1xuICAgIC8qKiBJbWFnZSBVUkwgKi9cbiAgICBpbWFnZVVybD86IHN0cmluZztcbiAgICAvKiogQXV0aG9yIG5hbWUgKi9cbiAgICBhdXRob3JOYW1lPzogc3RyaW5nO1xuICAgIC8qKiBBdXRob3IgVVJMICovXG4gICAgYXV0aG9yVXJsPzogc3RyaW5nO1xuICAgIC8qKiBBdXRob3IgaWNvbiBVUkwgKi9cbiAgICBhdXRob3JJY29uVXJsPzogc3RyaW5nO1xuICAgIC8qKiBGaWVsZHMgKG5hbWUvdmFsdWUgcGFpcnMpICovXG4gICAgZmllbGRzPzogQXJyYXk8e1xuICAgICAgICBuYW1lOiBzdHJpbmc7XG4gICAgICAgIHZhbHVlOiBzdHJpbmc7XG4gICAgICAgIGlubGluZT86IGJvb2xlYW47XG4gICAgfT47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGlzY29yZE1lc3NhZ2Uge1xuICAgIC8qKiBNZXNzYWdlIGNvbnRlbnQgKHBsYWluIHRleHQpICovXG4gICAgY29udGVudD86IHN0cmluZztcbiAgICAvKiogVXNlcm5hbWUgb3ZlcnJpZGUgKi9cbiAgICB1c2VybmFtZT86IHN0cmluZztcbiAgICAvKiogQXZhdGFyIFVSTCBvdmVycmlkZSAqL1xuICAgIGF2YXRhclVybD86IHN0cmluZztcbiAgICAvKiogV2hldGhlciB0byBwcm9jZXNzIEBldmVyeW9uZSBtZW50aW9ucyAqL1xuICAgIHR0cz86IGJvb2xlYW47XG4gICAgLyoqIEVtYmVkcyB0byBzZW5kICovXG4gICAgZW1iZWRzPzogRGlzY29yZEVtYmVkW107XG59XG5cbi8qKlxuICogRGlzY29yZCBXZWJob29rIENsaWVudFxuICovXG5leHBvcnQgY2xhc3MgRGlzY29yZFdlYmhvb2tDbGllbnQge1xuICAgIHByaXZhdGUgd2ViaG9va1VybDogc3RyaW5nO1xuICAgIHByaXZhdGUgdXNlcm5hbWU6IHN0cmluZztcbiAgICBwcml2YXRlIGF2YXRhclVybD86IHN0cmluZztcbiAgICBwcml2YXRlIGVuYWJsZWQgPSBmYWxzZTtcblxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IERpc2NvcmRXZWJob29rT3B0aW9ucykge1xuICAgICAgICB0aGlzLndlYmhvb2tVcmwgPSBvcHRpb25zLndlYmhvb2tVcmw7XG4gICAgICAgIHRoaXMudXNlcm5hbWUgPSBvcHRpb25zLnVzZXJuYW1lID8/IFwiUmFscGhcIjtcbiAgICAgICAgdGhpcy5hdmF0YXJVcmwgPSBvcHRpb25zLmF2YXRhclVybDtcbiAgICAgICAgdGhpcy5lbmFibGVkID0gdHJ1ZTtcblxuICAgICAgICAvLyBWYWxpZGF0ZSB3ZWJob29rIFVSTCBmb3JtYXRcbiAgICAgICAgaWYgKCF0aGlzLndlYmhvb2tVcmwgfHwgIXRoaXMuaXNWYWxpZFdlYmhvb2tVcmwodGhpcy53ZWJob29rVXJsKSkge1xuICAgICAgICAgICAgbG9nLndhcm4oXCJJbnZhbGlkIERpc2NvcmQgd2ViaG9vayBVUkwsIG5vdGlmaWNhdGlvbnMgZGlzYWJsZWRcIiwge1xuICAgICAgICAgICAgICAgIHdlYmhvb2tVcmw6IHRoaXMubWFza1dlYmhvb2tVcmwodGhpcy53ZWJob29rVXJsKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5lbmFibGVkID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBsb2cuaW5mbyhcIkRpc2NvcmQgd2ViaG9vayBjbGllbnQgaW5pdGlhbGl6ZWRcIiwge1xuICAgICAgICAgICAgZW5hYmxlZDogdGhpcy5lbmFibGVkLFxuICAgICAgICAgICAgdXNlcm5hbWU6IHRoaXMudXNlcm5hbWUsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNWYWxpZFdlYmhvb2tVcmwodXJsOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgLy8gRGlzY29yZCB3ZWJob29rIFVSTHMgbG9vayBsaWtlOiBodHRwczovL2Rpc2NvcmQuY29tL2FwaS93ZWJob29rcy97aWR9L3t0b2tlbn1cbiAgICAgICAgcmV0dXJuIC9eaHR0cHM6XFwvXFwvZGlzY29yZCg/OmFwcCk/XFwuY29tXFwvYXBpXFwvd2ViaG9va3NcXC9cXGQrXFwvW2EtekEtWjAtOV8tXSskLy50ZXN0KFxuICAgICAgICAgICAgdXJsLFxuICAgICAgICApO1xuICAgIH1cblxuICAgIHByaXZhdGUgbWFza1dlYmhvb2tVcmwodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICBpZiAoIXVybCkgcmV0dXJuIFwiKG5vdCBzZXQpXCI7XG4gICAgICAgIC8vIE1hc2sgdGhlIHRva2VuIHBhcnRcbiAgICAgICAgcmV0dXJuIHVybC5yZXBsYWNlKC9cXC9bYS16QS1aMC05Xy1dKyQvLCBcIi8qKioqKioqKlwiKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZW5kIGEgbWVzc2FnZSB0byBEaXNjb3JkXG4gICAgICovXG4gICAgYXN5bmMgc2VuZChtZXNzYWdlOiBEaXNjb3JkTWVzc2FnZSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICBpZiAoIXRoaXMuZW5hYmxlZCkge1xuICAgICAgICAgICAgbG9nLmRlYnVnKFwiRGlzY29yZCBub3RpZmljYXRpb25zIGRpc2FibGVkLCBza2lwcGluZyBzZW5kXCIpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHBheWxvYWQ6IERpc2NvcmRNZXNzYWdlID0ge1xuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IG1lc3NhZ2UuY29udGVudCxcbiAgICAgICAgICAgICAgICB1c2VybmFtZTogbWVzc2FnZS51c2VybmFtZSA/PyB0aGlzLnVzZXJuYW1lLFxuICAgICAgICAgICAgICAgIGF2YXRhclVybDogbWVzc2FnZS5hdmF0YXJVcmwgPz8gdGhpcy5hdmF0YXJVcmwsXG4gICAgICAgICAgICAgICAgdHRzOiBtZXNzYWdlLnR0cyA/PyBmYWxzZSxcbiAgICAgICAgICAgICAgICBlbWJlZHM6IG1lc3NhZ2UuZW1iZWRzLFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgbG9nLmRlYnVnKFwiU2VuZGluZyBEaXNjb3JkIG5vdGlmaWNhdGlvblwiLCB7XG4gICAgICAgICAgICAgICAgaGFzQ29udGVudDogISFtZXNzYWdlLmNvbnRlbnQsXG4gICAgICAgICAgICAgICAgZW1iZWRDb3VudDogbWVzc2FnZS5lbWJlZHM/Lmxlbmd0aCA/PyAwLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godGhpcy53ZWJob29rVXJsLCB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkocGF5bG9hZCksXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yVGV4dCA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbiAgICAgICAgICAgICAgICBsb2cuZXJyb3IoXCJEaXNjb3JkIHdlYmhvb2sgcmVxdWVzdCBmYWlsZWRcIiwge1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IHJlc3BvbnNlLnN0YXR1cyxcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzVGV4dDogcmVzcG9uc2Uuc3RhdHVzVGV4dCxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yVGV4dCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxvZy5kZWJ1ZyhcIkRpc2NvcmQgbm90aWZpY2F0aW9uIHNlbnQgc3VjY2Vzc2Z1bGx5XCIpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBsb2cuZXJyb3IoXCJGYWlsZWQgdG8gc2VuZCBEaXNjb3JkIG5vdGlmaWNhdGlvblwiLCB7XG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2VuZCBhIHNpbXBsZSB0ZXh0IG1lc3NhZ2VcbiAgICAgKi9cbiAgICBhc3luYyBub3RpZnkoY29udGVudDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIHJldHVybiB0aGlzLnNlbmQoeyBjb250ZW50IH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNlbmQgYW4gZW1iZWQgbWVzc2FnZVxuICAgICAqL1xuICAgIGFzeW5jIG5vdGlmeVdpdGhFbWJlZChcbiAgICAgICAgZW1iZWQ6IERpc2NvcmRFbWJlZCxcbiAgICAgICAgY29udGVudD86IHN0cmluZyxcbiAgICApOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VuZCh7XG4gICAgICAgICAgICBjb250ZW50LFxuICAgICAgICAgICAgZW1iZWRzOiBbZW1iZWRdLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZW5kIGN5Y2xlIHN0YXJ0IG5vdGlmaWNhdGlvblxuICAgICAqL1xuICAgIGFzeW5jIG5vdGlmeUN5Y2xlU3RhcnQoXG4gICAgICAgIGN5Y2xlTnVtYmVyOiBudW1iZXIsXG4gICAgICAgIG1heEN5Y2xlczogbnVtYmVyLFxuICAgICAgICBwcm9tcHQ6IHN0cmluZyxcbiAgICApOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgY29uc3QgZW1iZWQ6IERpc2NvcmRFbWJlZCA9IHtcbiAgICAgICAgICAgIHRpdGxlOiBg8J+UhCBDeWNsZSAke2N5Y2xlTnVtYmVyfS8ke21heEN5Y2xlc30gU3RhcnRlZGAsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogYFxcYFxcYFxcYFxcbiR7cHJvbXB0LnNsaWNlKDAsIDUwMCl9JHtwcm9tcHQubGVuZ3RoID4gNTAwID8gXCIuLi5cIiA6IFwiXCJ9XFxuXFxgXFxgXFxgYCxcbiAgICAgICAgICAgIGNvbG9yOiAweDU4NjVmMiwgLy8gRGlzY29yZCBibHVycGxlXG4gICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICAgIGZpZWxkczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogXCLwn5OLIFBoYXNlXCIsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBcIlJlc2VhcmNoIOKGkiBTcGVjaWZ5IOKGkiBQbGFuIOKGkiBXb3JrIOKGkiBSZXZpZXdcIixcbiAgICAgICAgICAgICAgICAgICAgaW5saW5lOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIuKPse+4jyBTdGF0dXNcIixcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IFwiUnVubmluZ1wiLFxuICAgICAgICAgICAgICAgICAgICBpbmxpbmU6IHRydWUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHRoaXMubm90aWZ5V2l0aEVtYmVkKFxuICAgICAgICAgICAgZW1iZWQsXG4gICAgICAgICAgICBg8J+agCAqKlJhbHBoIEN5Y2xlICR7Y3ljbGVOdW1iZXJ9LyR7bWF4Q3ljbGVzfSBTdGFydGVkKipgLFxuICAgICAgICApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNlbmQgY3ljbGUgY29tcGxldGlvbiBub3RpZmljYXRpb25cbiAgICAgKi9cbiAgICBhc3luYyBub3RpZnlDeWNsZUNvbXBsZXRlKFxuICAgICAgICBjeWNsZU51bWJlcjogbnVtYmVyLFxuICAgICAgICBjb21wbGV0ZWRDeWNsZXM6IG51bWJlcixcbiAgICAgICAgc3VtbWFyeTogc3RyaW5nLFxuICAgICAgICBkdXJhdGlvbk1zOiBudW1iZXIsXG4gICAgKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIGNvbnN0IGR1cmF0aW9uTWludXRlcyA9IE1hdGguZmxvb3IoZHVyYXRpb25NcyAvIDYwMDAwKTtcbiAgICAgICAgY29uc3QgZHVyYXRpb25TZWNvbmRzID0gTWF0aC5mbG9vcigoZHVyYXRpb25NcyAlIDYwMDAwKSAvIDEwMDApO1xuXG4gICAgICAgIGNvbnN0IGVtYmVkOiBEaXNjb3JkRW1iZWQgPSB7XG4gICAgICAgICAgICB0aXRsZTogYOKchSBDeWNsZSAke2N5Y2xlTnVtYmVyfSBDb21wbGV0ZWRgLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IHN1bW1hcnkuc2xpY2UoMCwgMjAwMCkgfHwgXCJObyBzdW1tYXJ5IGF2YWlsYWJsZVwiLFxuICAgICAgICAgICAgY29sb3I6IDB4NTdmMjg3LCAvLyBEaXNjb3JkIGdyZWVuXG4gICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICAgIGZpZWxkczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogXCLwn5OKIFByb2dyZXNzXCIsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBgJHtjb21wbGV0ZWRDeWNsZXN9IGN5Y2xlcyBjb21wbGV0ZWRgLFxuICAgICAgICAgICAgICAgICAgICBpbmxpbmU6IHRydWUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IFwi4o+x77iPIER1cmF0aW9uXCIsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBgJHtkdXJhdGlvbk1pbnV0ZXN9bSAke2R1cmF0aW9uU2Vjb25kc31zYCxcbiAgICAgICAgICAgICAgICAgICAgaW5saW5lOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiB0aGlzLm5vdGlmeVdpdGhFbWJlZChcbiAgICAgICAgICAgIGVtYmVkLFxuICAgICAgICAgICAgYOKchSAqKlJhbHBoIEN5Y2xlICR7Y3ljbGVOdW1iZXJ9IENvbXBsZXRlKipgLFxuICAgICAgICApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNlbmQgcGhhc2UgY29tcGxldGlvbiBub3RpZmljYXRpb25cbiAgICAgKi9cbiAgICBhc3luYyBub3RpZnlQaGFzZUNvbXBsZXRlKFxuICAgICAgICBjeWNsZU51bWJlcjogbnVtYmVyLFxuICAgICAgICBwaGFzZTogc3RyaW5nLFxuICAgICAgICBzdW1tYXJ5OiBzdHJpbmcsXG4gICAgKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIGNvbnN0IGVtYmVkOiBEaXNjb3JkRW1iZWQgPSB7XG4gICAgICAgICAgICB0aXRsZTogYPCfk50gUGhhc2UgQ29tcGxldGU6ICR7cGhhc2V9YCxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBzdW1tYXJ5LnNsaWNlKDAsIDEwMDApLFxuICAgICAgICAgICAgY29sb3I6IDB4ZmVlNzVjLCAvLyBEaXNjb3JkIHllbGxvd1xuICAgICAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICBmaWVsZHM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IFwi8J+UhCBDeWNsZVwiLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogU3RyaW5nKGN5Y2xlTnVtYmVyKSxcbiAgICAgICAgICAgICAgICAgICAgaW5saW5lOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiB0aGlzLm5vdGlmeVdpdGhFbWJlZChlbWJlZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2VuZCBlcnJvciBub3RpZmljYXRpb25cbiAgICAgKi9cbiAgICBhc3luYyBub3RpZnlFcnJvcihcbiAgICAgICAgY3ljbGVOdW1iZXI6IG51bWJlcixcbiAgICAgICAgcGhhc2U6IHN0cmluZyxcbiAgICAgICAgZXJyb3I6IHN0cmluZyxcbiAgICApOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgY29uc3QgZW1iZWQ6IERpc2NvcmRFbWJlZCA9IHtcbiAgICAgICAgICAgIHRpdGxlOiBg4p2MIEVycm9yIGluIEN5Y2xlICR7Y3ljbGVOdW1iZXJ9YCxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBgKipQaGFzZToqKiAke3BoYXNlfVxcblxcbioqRXJyb3I6KipcXG5cXGBcXGBcXGBcXG4ke2Vycm9yLnNsaWNlKDAsIDE1MDApfVxcblxcYFxcYFxcYGAsXG4gICAgICAgICAgICBjb2xvcjogMHhlZDQyNDUsIC8vIERpc2NvcmQgcmVkXG4gICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gdGhpcy5ub3RpZnlXaXRoRW1iZWQoZW1iZWQsIFwi8J+aqCAqKlJhbHBoIEVycm9yKipcIik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2VuZCB0aW1lb3V0IG5vdGlmaWNhdGlvblxuICAgICAqL1xuICAgIGFzeW5jIG5vdGlmeVRpbWVvdXQoXG4gICAgICAgIGN5Y2xlTnVtYmVyOiBudW1iZXIsXG4gICAgICAgIHBoYXNlOiBzdHJpbmcsXG4gICAgICAgIHRpbWVvdXRNczogbnVtYmVyLFxuICAgICk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICBjb25zdCB0aW1lb3V0TWludXRlcyA9IE1hdGguZmxvb3IodGltZW91dE1zIC8gNjAwMDApO1xuXG4gICAgICAgIGNvbnN0IGVtYmVkOiBEaXNjb3JkRW1iZWQgPSB7XG4gICAgICAgICAgICB0aXRsZTogYOKPsCBUaW1lb3V0IGluIEN5Y2xlICR7Y3ljbGVOdW1iZXJ9YCxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBgKipQaGFzZToqKiAke3BoYXNlfVxcbioqVGltZW91dDoqKiAke3RpbWVvdXRNaW51dGVzfSBtaW51dGVzYCxcbiAgICAgICAgICAgIGNvbG9yOiAweGViNDU5ZSwgLy8gRGlzY29yZCBwaW5rXG4gICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gdGhpcy5ub3RpZnlXaXRoRW1iZWQoZW1iZWQsIFwi4o+wICoqUmFscGggVGltZW91dCoqXCIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNlbmQgcnVuIGNvbXBsZXRpb24gbm90aWZpY2F0aW9uXG4gICAgICovXG4gICAgYXN5bmMgbm90aWZ5UnVuQ29tcGxldGUoXG4gICAgICAgIHRvdGFsQ3ljbGVzOiBudW1iZXIsXG4gICAgICAgIGR1cmF0aW9uTXM6IG51bWJlcixcbiAgICAgICAgZmluYWxTdW1tYXJ5OiBzdHJpbmcsXG4gICAgKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIGNvbnN0IGR1cmF0aW9uSG91cnMgPSBNYXRoLmZsb29yKGR1cmF0aW9uTXMgLyAzNjAwMDAwKTtcbiAgICAgICAgY29uc3QgZHVyYXRpb25NaW51dGVzID0gTWF0aC5mbG9vcigoZHVyYXRpb25NcyAlIDM2MDAwMDApIC8gNjAwMDApO1xuXG4gICAgICAgIGNvbnN0IGVtYmVkOiBEaXNjb3JkRW1iZWQgPSB7XG4gICAgICAgICAgICB0aXRsZTogXCLwn4+BIFJ1biBDb21wbGV0ZVwiLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IGZpbmFsU3VtbWFyeS5zbGljZSgwLCAyMDAwKSxcbiAgICAgICAgICAgIGNvbG9yOiAweDU3ZjI4NywgLy8gRGlzY29yZCBncmVlblxuICAgICAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICBmaWVsZHM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IFwi8J+UhCBUb3RhbCBDeWNsZXNcIixcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IFN0cmluZyh0b3RhbEN5Y2xlcyksXG4gICAgICAgICAgICAgICAgICAgIGlubGluZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogXCLij7HvuI8gVG90YWwgRHVyYXRpb25cIixcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6XG4gICAgICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbkhvdXJzID4gMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gYCR7ZHVyYXRpb25Ib3Vyc31oICR7ZHVyYXRpb25NaW51dGVzfW1gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBgJHtkdXJhdGlvbk1pbnV0ZXN9bWAsXG4gICAgICAgICAgICAgICAgICAgIGlubGluZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gdGhpcy5ub3RpZnlXaXRoRW1iZWQoZW1iZWQsIFwi8J+PgSAqKlJhbHBoIFJ1biBDb21wbGV0ZSoqXCIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNlbmQgc3R1Y2svYWJvcnQgbm90aWZpY2F0aW9uXG4gICAgICovXG4gICAgYXN5bmMgbm90aWZ5U3R1Y2tPckFib3J0ZWQoXG4gICAgICAgIGN5Y2xlTnVtYmVyOiBudW1iZXIsXG4gICAgICAgIHJlYXNvbjogc3RyaW5nLFxuICAgICk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICBjb25zdCBlbWJlZDogRGlzY29yZEVtYmVkID0ge1xuICAgICAgICAgICAgdGl0bGU6IGDwn5uRIFJ1biAke3JlYXNvbn1gLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IGBDeWNsZSAke2N5Y2xlTnVtYmVyfSByZWFjaGVkIHN0dWNrIHRocmVzaG9sZCBvciB3YXMgYWJvcnRlZGAsXG4gICAgICAgICAgICBjb2xvcjogMHg1ODY1ZjIsIC8vIERpc2NvcmQgYmx1cnBsZVxuICAgICAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHRoaXMubm90aWZ5V2l0aEVtYmVkKGVtYmVkLCBg8J+bkSAqKlJhbHBoICR7cmVhc29ufSoqYCk7XG4gICAgfVxufVxuXG4vKipcbiAqIENyZWF0ZSBhIERpc2NvcmQgd2ViaG9vayBjbGllbnQgZnJvbSBlbnZpcm9ubWVudCB2YXJpYWJsZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZURpc2NvcmRXZWJob29rRnJvbUVudigpOiBEaXNjb3JkV2ViaG9va0NsaWVudCB8IG51bGwge1xuICAgIGNvbnN0IHdlYmhvb2tVcmwgPSBwcm9jZXNzLmVudi5ESVNDT1JEX1dFQkhPT0tfVVJMPy50cmltKCk7XG5cbiAgICBpZiAoIXdlYmhvb2tVcmwpIHtcbiAgICAgICAgbG9nLmRlYnVnKFxuICAgICAgICAgICAgXCJObyBESVNDT1JEX1dFQkhPT0tfVVJMIGVudiB2YXIgc2V0LCBEaXNjb3JkIG5vdGlmaWNhdGlvbnMgZGlzYWJsZWRcIixcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBEaXNjb3JkV2ViaG9va0NsaWVudCh7XG4gICAgICAgIHdlYmhvb2tVcmwsXG4gICAgICAgIHVzZXJuYW1lOiBwcm9jZXNzLmVudi5ESVNDT1JEX0JPVF9VU0VSTkFNRSA/PyBcIlJhbHBoXCIsXG4gICAgICAgIGF2YXRhclVybDogcHJvY2Vzcy5lbnYuRElTQ09SRF9CT1RfQVZBVEFSX1VSTCxcbiAgICB9KTtcbn1cbiIsCiAgICAiLyoqXG4gKiBGbG93IFN0b3JlIC0gU3RhdGUgcGVyc2lzdGVuY2UgbGF5ZXIgZm9yIFJhbHBoIExvb3AgUnVubmVyXG4gKlxuICogUGVyc2lzdHMgcnVuIHN0YXRlIHRvIGAuYWktZW5nL3J1bnMvPHJ1bklkPi8uZmxvdy9gOlxuICogLSBzdGF0ZS5qc29uOiBNYWluIHJ1biBzdGF0ZVxuICogLSBjaGVja3BvaW50Lmpzb246IExhc3Qgc3VjY2Vzc2Z1bCBjaGVja3BvaW50IGZvciBmYXN0IHJlc3VtZVxuICogLSBpdGVyYXRpb25zLzxuPi5qc29uOiBQZXItY3ljbGUgZGV0YWlsZWQgb3V0cHV0c1xuICogLSBjb250ZXh0cy88bj4ubWQ6IFJlLWFuY2hvcmluZyBjb250ZXh0IHNuYXBzaG90c1xuICogLSBnYXRlcy88bj4uanNvbjogUXVhbGl0eSBnYXRlIHJlc3VsdHNcbiAqL1xuXG5pbXBvcnQgeyBleGlzdHNTeW5jLCBta2RpclN5bmMsIHJlYWRGaWxlU3luYywgd3JpdGVGaWxlU3luYyB9IGZyb20gXCJub2RlOmZzXCI7XG5pbXBvcnQgeyBqb2luIH0gZnJvbSBcIm5vZGU6cGF0aFwiO1xuaW1wb3J0IHsgTG9nIH0gZnJvbSBcIi4uL3V0aWwvbG9nXCI7XG5pbXBvcnQgdHlwZSB7IENoZWNrcG9pbnQsIEN5Y2xlU3RhdGUsIEZsb3dTdGF0ZSB9IGZyb20gXCIuL2Zsb3ctdHlwZXNcIjtcbmltcG9ydCB7IEZMT1dfU0NIRU1BX1ZFUlNJT04sIFJ1blN0YXR1cywgdHlwZSBTdG9wUmVhc29uIH0gZnJvbSBcIi4vZmxvdy10eXBlc1wiO1xuXG5jb25zdCBsb2cgPSBMb2cuY3JlYXRlKHsgc2VydmljZTogXCJmbG93LXN0b3JlXCIgfSk7XG5cbi8qKiBGbG93IHN0b3JlIG9wdGlvbnMgKi9cbmV4cG9ydCBpbnRlcmZhY2UgRmxvd1N0b3JlT3B0aW9ucyB7XG4gICAgZmxvd0Rpcjogc3RyaW5nO1xuICAgIHJ1bklkOiBzdHJpbmc7XG59XG5cbi8qKlxuICogRmxvdyBTdG9yZSAtIG1hbmFnZXMgcGVyc2lzdGVuY2Ugb2YgbG9vcCBydW4gc3RhdGVcbiAqL1xuZXhwb3J0IGNsYXNzIEZsb3dTdG9yZSB7XG4gICAgcHJpdmF0ZSBmbG93RGlyOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBydW5JZDogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczogRmxvd1N0b3JlT3B0aW9ucykge1xuICAgICAgICB0aGlzLmZsb3dEaXIgPSBvcHRpb25zLmZsb3dEaXI7XG4gICAgICAgIHRoaXMucnVuSWQgPSBvcHRpb25zLnJ1bklkO1xuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIGJhc2UgZmxvdyBkaXJlY3RvcnkgcGF0aCAqL1xuICAgIGdldCBiYXNlUGF0aCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gam9pbih0aGlzLmZsb3dEaXIsIHRoaXMucnVuSWQsIFwiLmZsb3dcIik7XG4gICAgfVxuXG4gICAgLyoqIEdldCBwYXRoIHRvIGEgc3BlY2lmaWMgZmlsZSBpbiAuZmxvdyAqL1xuICAgIHByaXZhdGUgcGF0aChyZWxQYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gam9pbih0aGlzLmJhc2VQYXRoLCByZWxQYXRoKTtcbiAgICB9XG5cbiAgICAvKiogSW5pdGlhbGl6ZSBmbG93IGRpcmVjdG9yeSBzdHJ1Y3R1cmUgKi9cbiAgICBpbml0aWFsaXplKCk6IHZvaWQge1xuICAgICAgICAvLyBDcmVhdGUgLmZsb3cgZGlyZWN0b3J5IGFuZCBzdWJkaXJlY3Rvcmllc1xuICAgICAgICBjb25zdCBkaXJzID0gW1wiaXRlcmF0aW9uc1wiLCBcImNvbnRleHRzXCIsIFwiZ2F0ZXNcIl07XG5cbiAgICAgICAgZm9yIChjb25zdCBkaXIgb2YgZGlycykge1xuICAgICAgICAgICAgY29uc3QgZGlyUGF0aCA9IHRoaXMucGF0aChkaXIpO1xuICAgICAgICAgICAgaWYgKCFleGlzdHNTeW5jKGRpclBhdGgpKSB7XG4gICAgICAgICAgICAgICAgbWtkaXJTeW5jKGRpclBhdGgsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcIkNyZWF0ZWQgZGlyZWN0b3J5XCIsIHsgcGF0aDogZGlyUGF0aCB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGxvZy5pbmZvKFwiRmxvdyBzdG9yZSBpbml0aWFsaXplZFwiLCB7XG4gICAgICAgICAgICBydW5JZDogdGhpcy5ydW5JZCxcbiAgICAgICAgICAgIGJhc2VQYXRoOiB0aGlzLmJhc2VQYXRoLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKiogQ2hlY2sgaWYgZmxvdyBzdGF0ZSBleGlzdHMgKGZvciByZXN1bWUpICovXG4gICAgZXhpc3RzKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gZXhpc3RzU3luYyh0aGlzLnBhdGgoXCJzdGF0ZS5qc29uXCIpKTtcbiAgICB9XG5cbiAgICAvKiogTG9hZCBleGlzdGluZyBydW4gc3RhdGUgZm9yIHJlc3VtZSAqL1xuICAgIGxvYWQoKTogRmxvd1N0YXRlIHwgbnVsbCB7XG4gICAgICAgIGNvbnN0IHN0YXRlUGF0aCA9IHRoaXMucGF0aChcInN0YXRlLmpzb25cIik7XG4gICAgICAgIGlmICghZXhpc3RzU3luYyhzdGF0ZVBhdGgpKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBjb250ZW50ID0gcmVhZEZpbGVTeW5jKHN0YXRlUGF0aCwgXCJ1dGYtOFwiKTtcbiAgICAgICAgICAgIGNvbnN0IHN0YXRlID0gSlNPTi5wYXJzZShjb250ZW50KSBhcyBGbG93U3RhdGU7XG5cbiAgICAgICAgICAgIC8vIFZhbGlkYXRlIHNjaGVtYSB2ZXJzaW9uXG4gICAgICAgICAgICBpZiAoc3RhdGUuc2NoZW1hVmVyc2lvbiAhPT0gRkxPV19TQ0hFTUFfVkVSU0lPTikge1xuICAgICAgICAgICAgICAgIGxvZy53YXJuKFwiRmxvdyBzY2hlbWEgdmVyc2lvbiBtaXNtYXRjaFwiLCB7XG4gICAgICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBGTE9XX1NDSEVNQV9WRVJTSU9OLFxuICAgICAgICAgICAgICAgICAgICBmb3VuZDogc3RhdGUuc2NoZW1hVmVyc2lvbixcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbG9nLmluZm8oXCJMb2FkZWQgZmxvdyBzdGF0ZVwiLCB7XG4gICAgICAgICAgICAgICAgcnVuSWQ6IHN0YXRlLnJ1bklkLFxuICAgICAgICAgICAgICAgIHN0YXR1czogc3RhdGUuc3RhdHVzLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRDeWNsZTogc3RhdGUuY3VycmVudEN5Y2xlLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTXNnID1cbiAgICAgICAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgICAgICBsb2cuZXJyb3IoXCJGYWlsZWQgdG8gbG9hZCBmbG93IHN0YXRlXCIsIHsgZXJyb3I6IGVycm9yTXNnIH0pO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogQ3JlYXRlIGluaXRpYWwgcnVuIHN0YXRlICovXG4gICAgY3JlYXRlSW5pdGlhbFN0YXRlKG9wdGlvbnM6IHtcbiAgICAgICAgcHJvbXB0OiBzdHJpbmc7XG4gICAgICAgIGNvbXBsZXRpb25Qcm9taXNlOiBzdHJpbmc7XG4gICAgICAgIG1heEN5Y2xlczogbnVtYmVyO1xuICAgICAgICBzdHVja1RocmVzaG9sZDogbnVtYmVyO1xuICAgICAgICBnYXRlczogc3RyaW5nW107XG4gICAgfSk6IEZsb3dTdGF0ZSB7XG4gICAgICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcblxuICAgICAgICBjb25zdCBzdGF0ZTogRmxvd1N0YXRlID0ge1xuICAgICAgICAgICAgc2NoZW1hVmVyc2lvbjogRkxPV19TQ0hFTUFfVkVSU0lPTixcbiAgICAgICAgICAgIHJ1bklkOiB0aGlzLnJ1bklkLFxuICAgICAgICAgICAgcHJvbXB0OiBvcHRpb25zLnByb21wdCxcbiAgICAgICAgICAgIHN0YXR1czogUnVuU3RhdHVzLlBFTkRJTkcsXG4gICAgICAgICAgICBjb21wbGV0aW9uUHJvbWlzZTogb3B0aW9ucy5jb21wbGV0aW9uUHJvbWlzZSxcbiAgICAgICAgICAgIG1heEN5Y2xlczogb3B0aW9ucy5tYXhDeWNsZXMsXG4gICAgICAgICAgICBzdHVja1RocmVzaG9sZDogb3B0aW9ucy5zdHVja1RocmVzaG9sZCxcbiAgICAgICAgICAgIGdhdGVzOiBvcHRpb25zLmdhdGVzLFxuICAgICAgICAgICAgY3VycmVudEN5Y2xlOiAwLFxuICAgICAgICAgICAgY29tcGxldGVkQ3ljbGVzOiAwLFxuICAgICAgICAgICAgZmFpbGVkQ3ljbGVzOiAwLFxuICAgICAgICAgICAgc3R1Y2tDb3VudDogMCxcbiAgICAgICAgICAgIGNyZWF0ZWRBdDogbm93LFxuICAgICAgICAgICAgdXBkYXRlZEF0OiBub3csXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5zYXZlU3RhdGUoc3RhdGUpO1xuICAgICAgICByZXR1cm4gc3RhdGU7XG4gICAgfVxuXG4gICAgLyoqIFNhdmUgcnVuIHN0YXRlIHRvIHN0YXRlLmpzb24gKi9cbiAgICBzYXZlU3RhdGUoc3RhdGU6IEZsb3dTdGF0ZSk6IHZvaWQge1xuICAgICAgICBjb25zdCBzdGF0ZVBhdGggPSB0aGlzLnBhdGgoXCJzdGF0ZS5qc29uXCIpO1xuICAgICAgICBzdGF0ZS51cGRhdGVkQXQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIHdyaXRlRmlsZVN5bmMoc3RhdGVQYXRoLCBKU09OLnN0cmluZ2lmeShzdGF0ZSwgbnVsbCwgMikpO1xuICAgICAgICBsb2cuZGVidWcoXCJTYXZlZCBmbG93IHN0YXRlXCIsIHsgcnVuSWQ6IHN0YXRlLnJ1bklkIH0pO1xuICAgIH1cblxuICAgIC8qKiBTYXZlIGEgY2hlY2twb2ludCBmb3IgZmFzdCByZXN1bWUgKi9cbiAgICBzYXZlQ2hlY2twb2ludChcbiAgICAgICAgc3RhdGU6IEZsb3dTdGF0ZSxcbiAgICAgICAgbGFzdFBoYXNlT3V0cHV0czogQ3ljbGVTdGF0ZVtcInBoYXNlc1wiXSxcbiAgICApOiB2b2lkIHtcbiAgICAgICAgY29uc3QgY2hlY2twb2ludFBhdGggPSB0aGlzLnBhdGgoXCJjaGVja3BvaW50Lmpzb25cIik7XG4gICAgICAgIGNvbnN0IGNoZWNrcG9pbnQ6IENoZWNrcG9pbnQgPSB7XG4gICAgICAgICAgICBzY2hlbWFWZXJzaW9uOiBGTE9XX1NDSEVNQV9WRVJTSU9OLFxuICAgICAgICAgICAgcnVuSWQ6IHN0YXRlLnJ1bklkLFxuICAgICAgICAgICAgY3ljbGVOdW1iZXI6IHN0YXRlLmN1cnJlbnRDeWNsZSxcbiAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgc3RhdGUsXG4gICAgICAgICAgICBsYXN0UGhhc2VPdXRwdXRzLFxuICAgICAgICB9O1xuICAgICAgICB3cml0ZUZpbGVTeW5jKGNoZWNrcG9pbnRQYXRoLCBKU09OLnN0cmluZ2lmeShjaGVja3BvaW50LCBudWxsLCAyKSk7XG4gICAgICAgIGxvZy5kZWJ1ZyhcIlNhdmVkIGNoZWNrcG9pbnRcIiwge1xuICAgICAgICAgICAgcnVuSWQ6IHN0YXRlLnJ1bklkLFxuICAgICAgICAgICAgY3ljbGU6IHN0YXRlLmN1cnJlbnRDeWNsZSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqIExvYWQgY2hlY2twb2ludCBmb3IgcmVzdW1lICovXG4gICAgbG9hZENoZWNrcG9pbnQoKTogQ2hlY2twb2ludCB8IG51bGwge1xuICAgICAgICBjb25zdCBjaGVja3BvaW50UGF0aCA9IHRoaXMucGF0aChcImNoZWNrcG9pbnQuanNvblwiKTtcbiAgICAgICAgaWYgKCFleGlzdHNTeW5jKGNoZWNrcG9pbnRQYXRoKSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgY29udGVudCA9IHJlYWRGaWxlU3luYyhjaGVja3BvaW50UGF0aCwgXCJ1dGYtOFwiKTtcbiAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKGNvbnRlbnQpIGFzIENoZWNrcG9pbnQ7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1zZyA9XG4gICAgICAgICAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICAgICAgbG9nLmVycm9yKFwiRmFpbGVkIHRvIGxvYWQgY2hlY2twb2ludFwiLCB7IGVycm9yOiBlcnJvck1zZyB9KTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIFNhdmUgaXRlcmF0aW9uIGN5Y2xlIG91dHB1dCAqL1xuICAgIHNhdmVJdGVyYXRpb24oY3ljbGU6IEN5Y2xlU3RhdGUpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgY3ljbGVQYXRoID0gdGhpcy5wYXRoKGBpdGVyYXRpb25zLyR7Y3ljbGUuY3ljbGVOdW1iZXJ9Lmpzb25gKTtcbiAgICAgICAgd3JpdGVGaWxlU3luYyhjeWNsZVBhdGgsIEpTT04uc3RyaW5naWZ5KGN5Y2xlLCBudWxsLCAyKSk7XG5cbiAgICAgICAgLy8gU2F2ZSByZS1hbmNob3JpbmcgY29udGV4dFxuICAgICAgICBjb25zdCBjb250ZXh0UGF0aCA9IHRoaXMucGF0aChgY29udGV4dHMvJHtjeWNsZS5jeWNsZU51bWJlcn0ubWRgKTtcbiAgICAgICAgY29uc3QgY29udGV4dENvbnRlbnQgPSB0aGlzLmdlbmVyYXRlQ29udGV4dENvbnRlbnQoY3ljbGUpO1xuICAgICAgICB3cml0ZUZpbGVTeW5jKGNvbnRleHRQYXRoLCBjb250ZXh0Q29udGVudCk7XG5cbiAgICAgICAgbG9nLmRlYnVnKFwiU2F2ZWQgaXRlcmF0aW9uXCIsIHsgY3ljbGU6IGN5Y2xlLmN5Y2xlTnVtYmVyIH0pO1xuICAgIH1cblxuICAgIC8qKiBTYXZlIGdhdGUgcmVzdWx0cyBmb3IgaXRlcmF0aW9uICovXG4gICAgc2F2ZUdhdGVSZXN1bHRzKFxuICAgICAgICBjeWNsZU51bWJlcjogbnVtYmVyLFxuICAgICAgICByZXN1bHRzOiBDeWNsZVN0YXRlW1wiZ2F0ZVJlc3VsdHNcIl0sXG4gICAgKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGdhdGVQYXRoID0gdGhpcy5wYXRoKGBnYXRlcy8ke2N5Y2xlTnVtYmVyfS5qc29uYCk7XG4gICAgICAgIHdyaXRlRmlsZVN5bmMoZ2F0ZVBhdGgsIEpTT04uc3RyaW5naWZ5KHJlc3VsdHMsIG51bGwsIDIpKTtcbiAgICB9XG5cbiAgICAvKiogR2VuZXJhdGUgcmUtYW5jaG9yaW5nIGNvbnRleHQgY29udGVudCBmb3IgYSBjeWNsZSAqL1xuICAgIHByaXZhdGUgZ2VuZXJhdGVDb250ZXh0Q29udGVudChjeWNsZTogQ3ljbGVTdGF0ZSk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IGxpbmVzOiBzdHJpbmdbXSA9IFtcbiAgICAgICAgICAgIGAjIEN5Y2xlICR7Y3ljbGUuY3ljbGVOdW1iZXJ9IENvbnRleHRgLFxuICAgICAgICAgICAgXCJcIixcbiAgICAgICAgICAgIGAqKlRpbWVzdGFtcDoqKiAke2N5Y2xlLnN0YXJ0VGltZX1gLFxuICAgICAgICAgICAgYCoqU3RhdHVzOioqICR7Y3ljbGUuc3RhdHVzfWAsXG4gICAgICAgICAgICBgKipDb21wbGV0aW9uIFByb21pc2UgT2JzZXJ2ZWQ6KiogJHtjeWNsZS5jb21wbGV0aW9uUHJvbWlzZU9ic2VydmVkfWAsXG4gICAgICAgICAgICBcIlwiLFxuICAgICAgICAgICAgXCIjIyBQaGFzZSBTdW1tYXJpZXNcIixcbiAgICAgICAgICAgIFwiXCIsXG4gICAgICAgIF07XG5cbiAgICAgICAgZm9yIChjb25zdCBbcGhhc2UsIG91dHB1dF0gb2YgT2JqZWN0LmVudHJpZXMoY3ljbGUucGhhc2VzKSkge1xuICAgICAgICAgICAgaWYgKG91dHB1dCkge1xuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goYCMjIyAke3BoYXNlLnRvVXBwZXJDYXNlKCl9YCk7XG4gICAgICAgICAgICAgICAgbGluZXMucHVzaChcIlwiKTtcbiAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKG91dHB1dC5zdW1tYXJ5IHx8IG91dHB1dC5yZXNwb25zZS5zbGljZSgwLCA1MDApKTtcbiAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKFwiXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGN5Y2xlLmdhdGVSZXN1bHRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGxpbmVzLnB1c2goXCIjIyBHYXRlIFJlc3VsdHNcIik7XG4gICAgICAgICAgICBsaW5lcy5wdXNoKFwiXCIpO1xuICAgICAgICAgICAgZm9yIChjb25zdCBnYXRlIG9mIGN5Y2xlLmdhdGVSZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhdHVzID0gZ2F0ZS5wYXNzZWQgPyBcIuKchSBQQVNTXCIgOiBcIuKdjCBGQUlMXCI7XG4gICAgICAgICAgICAgICAgbGluZXMucHVzaChgLSAqKiR7Z2F0ZS5nYXRlfToqKiAke3N0YXR1c30gLSAke2dhdGUubWVzc2FnZX1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxpbmVzLnB1c2goXCJcIik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY3ljbGUuZXJyb3IpIHtcbiAgICAgICAgICAgIGxpbmVzLnB1c2goXCIjIyBFcnJvcnNcIik7XG4gICAgICAgICAgICBsaW5lcy5wdXNoKFwiXCIpO1xuICAgICAgICAgICAgbGluZXMucHVzaChjeWNsZS5lcnJvcik7XG4gICAgICAgICAgICBsaW5lcy5wdXNoKFwiXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGxpbmVzLmpvaW4oXCJcXG5cIik7XG4gICAgfVxuXG4gICAgLyoqIEdldCBpdGVyYXRpb24gYnkgbnVtYmVyICovXG4gICAgZ2V0SXRlcmF0aW9uKGN5Y2xlTnVtYmVyOiBudW1iZXIpOiBDeWNsZVN0YXRlIHwgbnVsbCB7XG4gICAgICAgIGNvbnN0IGN5Y2xlUGF0aCA9IHRoaXMucGF0aChgaXRlcmF0aW9ucy8ke2N5Y2xlTnVtYmVyfS5qc29uYCk7XG4gICAgICAgIGlmICghZXhpc3RzU3luYyhjeWNsZVBhdGgpKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBjb250ZW50ID0gcmVhZEZpbGVTeW5jKGN5Y2xlUGF0aCwgXCJ1dGYtOFwiKTtcbiAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKGNvbnRlbnQpIGFzIEN5Y2xlU3RhdGU7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogR2V0IGFsbCBpdGVyYXRpb25zICovXG4gICAgZ2V0QWxsSXRlcmF0aW9ucygpOiBDeWNsZVN0YXRlW10ge1xuICAgICAgICBjb25zdCBpdGVyYXRpb25zOiBDeWNsZVN0YXRlW10gPSBbXTtcbiAgICAgICAgbGV0IG4gPSAxO1xuXG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICBjb25zdCBjeWNsZSA9IHRoaXMuZ2V0SXRlcmF0aW9uKG4pO1xuICAgICAgICAgICAgaWYgKCFjeWNsZSkgYnJlYWs7XG4gICAgICAgICAgICBpdGVyYXRpb25zLnB1c2goY3ljbGUpO1xuICAgICAgICAgICAgbisrO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGl0ZXJhdGlvbnM7XG4gICAgfVxuXG4gICAgLyoqIFVwZGF0ZSBzdGF0ZSBzdGF0dXMgKi9cbiAgICB1cGRhdGVTdGF0dXMoXG4gICAgICAgIHN0YXR1czogUnVuU3RhdHVzLFxuICAgICAgICBzdG9wUmVhc29uPzogU3RvcFJlYXNvbixcbiAgICAgICAgZXJyb3I/OiBzdHJpbmcsXG4gICAgKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHN0YXRlID0gdGhpcy5sb2FkKCk7XG4gICAgICAgIGlmICghc3RhdGUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIGZsb3cgc3RhdGUgdG8gdXBkYXRlXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RhdGUuc3RhdHVzID0gc3RhdHVzO1xuICAgICAgICBpZiAoc3RvcFJlYXNvbikgc3RhdGUuc3RvcFJlYXNvbiA9IHN0b3BSZWFzb247XG4gICAgICAgIGlmIChlcnJvcikgc3RhdGUuZXJyb3IgPSBlcnJvcjtcbiAgICAgICAgaWYgKHN0YXR1cyA9PT0gUnVuU3RhdHVzLkNPTVBMRVRFRCB8fCBzdGF0dXMgPT09IFJ1blN0YXR1cy5GQUlMRUQpIHtcbiAgICAgICAgICAgIHN0YXRlLmNvbXBsZXRlZEF0ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zYXZlU3RhdGUoc3RhdGUpO1xuICAgIH1cblxuICAgIC8qKiBJbmNyZW1lbnQgY3ljbGUgY291bnRlciAqL1xuICAgIGluY3JlbWVudEN5Y2xlKCk6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IHN0YXRlID0gdGhpcy5sb2FkKCk7XG4gICAgICAgIGlmICghc3RhdGUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIGZsb3cgc3RhdGUgdG8gdXBkYXRlXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RhdGUuY3VycmVudEN5Y2xlKys7XG4gICAgICAgIHRoaXMuc2F2ZVN0YXRlKHN0YXRlKTtcbiAgICAgICAgcmV0dXJuIHN0YXRlLmN1cnJlbnRDeWNsZTtcbiAgICB9XG5cbiAgICAvKiogUmVjb3JkIGEgZmFpbGVkIGN5Y2xlICovXG4gICAgcmVjb3JkRmFpbGVkQ3ljbGUoY3ljbGU6IEN5Y2xlU3RhdGUpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgc3RhdGUgPSB0aGlzLmxvYWQoKTtcbiAgICAgICAgaWYgKCFzdGF0ZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gZmxvdyBzdGF0ZSB0byB1cGRhdGVcIik7XG4gICAgICAgIH1cblxuICAgICAgICBzdGF0ZS5mYWlsZWRDeWNsZXMrKztcbiAgICAgICAgc3RhdGUuc3R1Y2tDb3VudCsrO1xuICAgICAgICB0aGlzLnNhdmVJdGVyYXRpb24oY3ljbGUpO1xuICAgICAgICB0aGlzLnNhdmVTdGF0ZShzdGF0ZSk7XG5cbiAgICAgICAgbG9nLmluZm8oXCJDeWNsZSBmYWlsZWRcIiwge1xuICAgICAgICAgICAgcnVuSWQ6IHRoaXMucnVuSWQsXG4gICAgICAgICAgICBjeWNsZTogY3ljbGUuY3ljbGVOdW1iZXIsXG4gICAgICAgICAgICBmYWlsZWRDeWNsZXM6IHN0YXRlLmZhaWxlZEN5Y2xlcyxcbiAgICAgICAgICAgIHN0dWNrQ291bnQ6IHN0YXRlLnN0dWNrQ291bnQsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKiBSZWNvcmQgYSBzdWNjZXNzZnVsIGN5Y2xlICovXG4gICAgcmVjb3JkU3VjY2Vzc2Z1bEN5Y2xlKGN5Y2xlOiBDeWNsZVN0YXRlLCBzdW1tYXJ5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgc3RhdGUgPSB0aGlzLmxvYWQoKTtcbiAgICAgICAgaWYgKCFzdGF0ZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gZmxvdyBzdGF0ZSB0byB1cGRhdGVcIik7XG4gICAgICAgIH1cblxuICAgICAgICBzdGF0ZS5jb21wbGV0ZWRDeWNsZXMrKztcbiAgICAgICAgc3RhdGUuc3R1Y2tDb3VudCA9IDA7IC8vIFJlc2V0IHN0dWNrIGNvdW50ZXIgb24gc3VjY2Vzc1xuICAgICAgICBzdGF0ZS5sYXN0Q2hlY2twb2ludCA9IHtcbiAgICAgICAgICAgIGN5Y2xlTnVtYmVyOiBjeWNsZS5jeWNsZU51bWJlcixcbiAgICAgICAgICAgIHN1bW1hcnksXG4gICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnNhdmVJdGVyYXRpb24oY3ljbGUpO1xuICAgICAgICB0aGlzLnNhdmVTdGF0ZShzdGF0ZSk7XG5cbiAgICAgICAgbG9nLmluZm8oXCJDeWNsZSBjb21wbGV0ZWRcIiwge1xuICAgICAgICAgICAgcnVuSWQ6IHRoaXMucnVuSWQsXG4gICAgICAgICAgICBjeWNsZTogY3ljbGUuY3ljbGVOdW1iZXIsXG4gICAgICAgICAgICBjb21wbGV0ZWRDeWNsZXM6IHN0YXRlLmNvbXBsZXRlZEN5Y2xlcyxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqIENsZWFuIHVwIGZsb3cgZGlyZWN0b3J5ICovXG4gICAgY2xlYW51cCgpOiB2b2lkIHtcbiAgICAgICAgLy8gSW1wbGVtZW50YXRpb24gd291bGQgcmVtb3ZlIHRoZSAuZmxvdyBkaXJlY3RvcnlcbiAgICAgICAgLy8gRm9yIG5vdywganVzdCBsb2dcbiAgICAgICAgbG9nLmluZm8oXCJGbG93IHN0b3JlIGNsZWFudXAgcmVxdWVzdGVkXCIsIHsgcnVuSWQ6IHRoaXMucnVuSWQgfSk7XG4gICAgfVxufVxuIiwKICAgICIvKipcbiAqIEZsb3cgU3RhdGUgVHlwZXMgZm9yIFJhbHBoIExvb3AgUnVubmVyXG4gKlxuICogU3RhdGUgaXMgcGVyc2lzdGVkIHRvIGAuYWktZW5nL3J1bnMvPHJ1bklkPi8uZmxvdy9gIGZvcjpcbiAqIC0gUmVzdW1lIHN1cHBvcnQgYWNyb3NzIHJ1bnNcbiAqIC0gRnJlc2ggY29udGV4dCBwZXIgaXRlcmF0aW9uIChyZS1hbmNob3JpbmcgZnJvbSBkaXNrKVxuICogLSBBdWRpdCB0cmFpbCBvZiBhbGwgY3ljbGUgb3V0cHV0c1xuICovXG5cbi8qKiBTY2hlbWEgdmVyc2lvbiBmb3IgZm9yd2FyZCBjb21wYXRpYmlsaXR5ICovXG5leHBvcnQgY29uc3QgRkxPV19TQ0hFTUFfVkVSU0lPTiA9IFwiMS4wLjBcIjtcblxuLyoqIFJ1biBzdGF0dXMgZW51bSAqL1xuZXhwb3J0IGVudW0gUnVuU3RhdHVzIHtcbiAgICBQRU5ESU5HID0gXCJwZW5kaW5nXCIsXG4gICAgUlVOTklORyA9IFwicnVubmluZ1wiLFxuICAgIENPTVBMRVRFRCA9IFwiY29tcGxldGVkXCIsXG4gICAgRkFJTEVEID0gXCJmYWlsZWRcIixcbiAgICBBQk9SVEVEID0gXCJhYm9ydGVkXCIsXG4gICAgU1RVQ0sgPSBcInN0dWNrXCIsXG59XG5cbi8qKiBTdG9wIHJlYXNvbiBmb3IgY29tcGxldGVkIHJ1bnMgKi9cbmV4cG9ydCBlbnVtIFN0b3BSZWFzb24ge1xuICAgIENPTVBMRVRJT05fUFJPTUlTRSA9IFwiY29tcGxldGlvbl9wcm9taXNlXCIsXG4gICAgTUFYX0NZQ0xFUyA9IFwibWF4X2N5Y2xlc1wiLFxuICAgIEdBVEVfRkFJTFVSRSA9IFwiZ2F0ZV9mYWlsdXJlXCIsXG4gICAgU1RVQ0sgPSBcInN0dWNrXCIsXG4gICAgVVNFUl9BQk9SVCA9IFwidXNlcl9hYm9ydFwiLFxuICAgIEVSUk9SID0gXCJlcnJvclwiLFxufVxuXG4vKiogUGhhc2UgbmFtZXMgaW4gdGhlIHdvcmtmbG93ICovXG5leHBvcnQgZW51bSBQaGFzZSB7XG4gICAgUkVTRUFSQ0ggPSBcInJlc2VhcmNoXCIsXG4gICAgU1BFQ0lGWSA9IFwic3BlY2lmeVwiLFxuICAgIFBMQU4gPSBcInBsYW5cIixcbiAgICBXT1JLID0gXCJ3b3JrXCIsXG4gICAgUkVWSUVXID0gXCJyZXZpZXdcIixcbn1cblxuLyoqIEdhdGUgcmVzdWx0IHR5cGUgKi9cbmV4cG9ydCBpbnRlcmZhY2UgR2F0ZVJlc3VsdCB7XG4gICAgZ2F0ZTogc3RyaW5nO1xuICAgIHBhc3NlZDogYm9vbGVhbjtcbiAgICBtZXNzYWdlOiBzdHJpbmc7XG4gICAgZGV0YWlscz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgIHRpbWVzdGFtcDogc3RyaW5nO1xufVxuXG4vKiogUGhhc2Ugb3V0cHV0ICovXG5leHBvcnQgaW50ZXJmYWNlIFBoYXNlT3V0cHV0IHtcbiAgICBwaGFzZTogUGhhc2U7XG4gICAgcHJvbXB0OiBzdHJpbmc7XG4gICAgcmVzcG9uc2U6IHN0cmluZztcbiAgICBzdW1tYXJ5OiBzdHJpbmc7XG4gICAgdGltZXN0YW1wOiBzdHJpbmc7XG4gICAgLyoqIFRvb2wgaW52b2NhdGlvbnMgY2FwdHVyZWQgZHVyaW5nIHRoaXMgcGhhc2UgKi9cbiAgICB0b29scz86IFRvb2xJbnZvY2F0aW9uW107XG59XG5cbi8qKiBUb29sIGludm9jYXRpb24gY2FwdHVyZWQgZnJvbSBPcGVuQ29kZSBzdHJlYW0gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVG9vbEludm9jYXRpb24ge1xuICAgIC8qKiBVbmlxdWUgdG9vbCBJRCAqL1xuICAgIGlkOiBzdHJpbmc7XG4gICAgLyoqIFRvb2wgbmFtZSAoZS5nLiwgXCJiYXNoXCIsIFwicmVhZFwiLCBcIndyaXRlXCIsIFwiZWRpdFwiKSAqL1xuICAgIG5hbWU6IHN0cmluZztcbiAgICAvKiogSW5wdXQgYXJndW1lbnRzIChtYXkgYmUgdHJ1bmNhdGVkL3JlZGFjdGVkIGZvciBzZWNyZXRzKSAqL1xuICAgIGlucHV0PzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgLyoqIE91dHB1dCByZXN1bHQgKG1heSBiZSB0cnVuY2F0ZWQpICovXG4gICAgb3V0cHV0Pzogc3RyaW5nO1xuICAgIC8qKiBXaGV0aGVyIHRoZSB0b29sIGNhbGwgc3VjY2VlZGVkICovXG4gICAgc3RhdHVzOiBcIm9rXCIgfCBcImVycm9yXCI7XG4gICAgLyoqIEVycm9yIG1lc3NhZ2UgaWYgc3RhdHVzIGlzIGVycm9yICovXG4gICAgZXJyb3I/OiBzdHJpbmc7XG4gICAgLyoqIFdoZW4gdGhlIHRvb2wgY2FsbCBzdGFydGVkIChJU08gdGltZXN0YW1wKSAqL1xuICAgIHN0YXJ0ZWRBdD86IHN0cmluZztcbiAgICAvKiogV2hlbiB0aGUgdG9vbCBjYWxsIGNvbXBsZXRlZCAoSVNPIHRpbWVzdGFtcCkgKi9cbiAgICBjb21wbGV0ZWRBdD86IHN0cmluZztcbn1cblxuLyoqIFNpbmdsZSBpdGVyYXRpb24gY3ljbGUgc3RhdGUgKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ3ljbGVTdGF0ZSB7XG4gICAgY3ljbGVOdW1iZXI6IG51bWJlcjtcbiAgICBzdGF0dXM6IFwicGVuZGluZ1wiIHwgXCJydW5uaW5nXCIgfCBcImNvbXBsZXRlZFwiIHwgXCJmYWlsZWRcIjtcbiAgICBzdGFydFRpbWU6IHN0cmluZztcbiAgICBlbmRUaW1lPzogc3RyaW5nO1xuICAgIGR1cmF0aW9uTXM/OiBudW1iZXI7XG4gICAgcGhhc2VzOiB7XG4gICAgICAgIFtrZXkgaW4gUGhhc2VdPzogUGhhc2VPdXRwdXQ7XG4gICAgfTtcbiAgICBnYXRlUmVzdWx0czogR2F0ZVJlc3VsdFtdO1xuICAgIGNvbXBsZXRpb25Qcm9taXNlT2JzZXJ2ZWQ6IGJvb2xlYW47XG4gICAgc3RvcFJlYXNvbj86IFN0b3BSZWFzb247XG4gICAgZXJyb3I/OiBzdHJpbmc7XG4gICAgLy8gRm9yIHN0dWNrIGRldGVjdGlvbiAtIGhhc2ggb2Ygb3V0cHV0cyB0byBkZXRlY3Qgbm8tcHJvZ3Jlc3NcbiAgICBvdXRwdXRIYXNoPzogc3RyaW5nO1xufVxuXG4vKiogTWFpbiBmbG93IHN0YXRlICovXG5leHBvcnQgaW50ZXJmYWNlIEZsb3dTdGF0ZSB7XG4gICAgLyoqIFNjaGVtYSB2ZXJzaW9uIGZvciBtaWdyYXRpb25zICovXG4gICAgc2NoZW1hVmVyc2lvbjogc3RyaW5nO1xuXG4gICAgLyoqIFJ1biBpZGVudGlmaWNhdGlvbiAqL1xuICAgIHJ1bklkOiBzdHJpbmc7XG4gICAgcHJvbXB0OiBzdHJpbmc7XG5cbiAgICAvKiogUnVuIHN0YXR1cyAqL1xuICAgIHN0YXR1czogUnVuU3RhdHVzO1xuICAgIHN0b3BSZWFzb24/OiBTdG9wUmVhc29uO1xuXG4gICAgLyoqIExvb3AgcGFyYW1ldGVycyAqL1xuICAgIGNvbXBsZXRpb25Qcm9taXNlOiBzdHJpbmc7XG4gICAgbWF4Q3ljbGVzOiBudW1iZXI7XG4gICAgc3R1Y2tUaHJlc2hvbGQ6IG51bWJlcjtcbiAgICBnYXRlczogc3RyaW5nW107XG5cbiAgICAvKiogQ3ljbGUgdHJhY2tpbmcgKi9cbiAgICBjdXJyZW50Q3ljbGU6IG51bWJlcjtcbiAgICBjb21wbGV0ZWRDeWNsZXM6IG51bWJlcjtcbiAgICBmYWlsZWRDeWNsZXM6IG51bWJlcjtcbiAgICBzdHVja0NvdW50OiBudW1iZXI7XG5cbiAgICAvKiogVGltZXN0YW1wcyAqL1xuICAgIGNyZWF0ZWRBdDogc3RyaW5nO1xuICAgIHVwZGF0ZWRBdDogc3RyaW5nO1xuICAgIGNvbXBsZXRlZEF0Pzogc3RyaW5nO1xuXG4gICAgLyoqIExhc3Qgc3VjY2Vzc2Z1bCBjaGVja3BvaW50IGZvciByZS1hbmNob3JpbmcgKi9cbiAgICBsYXN0Q2hlY2twb2ludD86IHtcbiAgICAgICAgY3ljbGVOdW1iZXI6IG51bWJlcjtcbiAgICAgICAgc3VtbWFyeTogc3RyaW5nO1xuICAgICAgICB0aW1lc3RhbXA6IHN0cmluZztcbiAgICB9O1xuXG4gICAgLyoqIEVycm9yIGluZm8gaWYgZmFpbGVkICovXG4gICAgZXJyb3I/OiBzdHJpbmc7XG59XG5cbi8qKiBDaGVja3BvaW50IGZvciBmYXN0IHJlc3VtZSAqL1xuZXhwb3J0IGludGVyZmFjZSBDaGVja3BvaW50IHtcbiAgICBzY2hlbWFWZXJzaW9uOiBzdHJpbmc7XG4gICAgcnVuSWQ6IHN0cmluZztcbiAgICBjeWNsZU51bWJlcjogbnVtYmVyO1xuICAgIHRpbWVzdGFtcDogc3RyaW5nO1xuICAgIHN0YXRlOiBGbG93U3RhdGU7XG4gICAgbGFzdFBoYXNlT3V0cHV0czoge1xuICAgICAgICBba2V5IGluIFBoYXNlXT86IFBoYXNlT3V0cHV0O1xuICAgIH07XG59XG5cbi8qKiBDb25maWd1cmF0aW9uIGZvciB0aGUgbG9vcCBydW5uZXIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgTG9vcENvbmZpZyB7XG4gICAgcnVuSWQ6IHN0cmluZztcbiAgICBwcm9tcHQ6IHN0cmluZztcbiAgICBjb21wbGV0aW9uUHJvbWlzZTogc3RyaW5nO1xuICAgIG1heEN5Y2xlczogbnVtYmVyO1xuICAgIHN0dWNrVGhyZXNob2xkOiBudW1iZXI7XG4gICAgZ2F0ZXM6IHN0cmluZ1tdO1xuICAgIGNoZWNrcG9pbnRGcmVxdWVuY3k6IG51bWJlcjtcbiAgICBmbG93RGlyOiBzdHJpbmc7XG4gICAgZHJ5UnVuOiBib29sZWFuO1xuICAgIC8qKiBOdW1iZXIgb2YgcmV0cnkgYXR0ZW1wdHMgcGVyIGN5Y2xlIG9uIGZhaWx1cmUgKi9cbiAgICBjeWNsZVJldHJpZXM6IG51bWJlcjtcbiAgICAvKiogT3BlbkNvZGUgcHJvbXB0IHRpbWVvdXQgaW4gbXMgKHVzZWQgYXMgaWRsZSB0aW1lb3V0KSAqL1xuICAgIHByb21wdFRpbWVvdXQ/OiBudW1iZXI7XG4gICAgLyoqIFBoYXNlIGhhcmQgdGltZW91dCBpbiBtcyAocnVubmVyLXNpZGUgd2F0Y2hkb2cpICovXG4gICAgcGhhc2VUaW1lb3V0TXM/OiBudW1iZXI7XG4gICAgLyoqIEN5Y2xlIGhhcmQgdGltZW91dCBpbiBtcyAqL1xuICAgIGN5Y2xlVGltZW91dE1zPzogbnVtYmVyO1xuICAgIC8qKiBSdW4gaGFyZCB0aW1lb3V0IGluIG1zICovXG4gICAgcnVuVGltZW91dE1zPzogbnVtYmVyO1xuICAgIC8qKiBEZWJ1ZyBtb2RlOiBwcmludCB0b29sIGludm9jYXRpb25zIHRvIGNvbnNvbGUvbG9ncyAqL1xuICAgIGRlYnVnV29yazogYm9vbGVhbjtcbn1cbiIsCiAgICAiLyoqXG4gKiBQcm9tcHQgT3B0aW1pemVyXG4gKlxuICogTWFpbiBvcmNoZXN0cmF0b3IgZm9yIHN0ZXAtYnktc3RlcCBwcm9tcHQgb3B0aW1pemF0aW9uLlxuICogTWFuYWdlcyBvcHRpbWl6YXRpb24gc2Vzc2lvbnMgYW5kIGFwcGxpZXMgYXBwcm92ZWQgdGVjaG5pcXVlcy5cbiAqL1xuXG5pbXBvcnQgeyBhbmFseXplUHJvbXB0IH0gZnJvbSBcIi4vYW5hbHl6ZXJcIjtcbmltcG9ydCB7IEFMTF9URUNITklRVUVTLCBnZXRUZWNobmlxdWVCeUlkIH0gZnJvbSBcIi4vdGVjaG5pcXVlc1wiO1xuaW1wb3J0IHR5cGUge1xuICAgIEFuYWx5c2lzUmVzdWx0LFxuICAgIENvbXBsZXhpdHksXG4gICAgRXhwZWN0ZWRJbXByb3ZlbWVudCxcbiAgICBPcHRpbWl6YXRpb25Db25maWcsXG4gICAgT3B0aW1pemF0aW9uU2Vzc2lvbixcbiAgICBPcHRpbWl6YXRpb25TdGVwLFxuICAgIFRlY2huaXF1ZUNvbnRleHQsXG4gICAgVGVjaG5pcXVlSWQsXG4gICAgVXNlclByZWZlcmVuY2VzLFxufSBmcm9tIFwiLi90eXBlc1wiO1xuXG4vKipcbiAqIEdlbmVyYXRlIHVuaXF1ZSBJRFxuICovXG5mdW5jdGlvbiBnZW5lcmF0ZUlkKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAke0RhdGUubm93KCl9LSR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDkpfWA7XG59XG5cbi8qKlxuICogRGVmYXVsdCBjb25maWd1cmF0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBERUZBVUxUX0NPTkZJRzogT3B0aW1pemF0aW9uQ29uZmlnID0ge1xuICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgYXV0b0FwcHJvdmU6IGZhbHNlLFxuICAgIHZlcmJvc2l0eTogXCJub3JtYWxcIixcbiAgICBkZWZhdWx0VGVjaG5pcXVlczogW1xuICAgICAgICBcImFuYWx5c2lzXCIsXG4gICAgICAgIFwiZXhwZXJ0X3BlcnNvbmFcIixcbiAgICAgICAgXCJyZWFzb25pbmdfY2hhaW5cIixcbiAgICAgICAgXCJzdGFrZXNfbGFuZ3VhZ2VcIixcbiAgICAgICAgXCJzZWxmX2V2YWx1YXRpb25cIixcbiAgICBdLFxuICAgIHNraXBGb3JTaW1wbGVQcm9tcHRzOiBmYWxzZSxcbiAgICBlc2NhcGVQcmVmaXg6IFwiIVwiLFxufTtcblxuLyoqXG4gKiBEZWZhdWx0IHVzZXIgcHJlZmVyZW5jZXNcbiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfUFJFRkVSRU5DRVM6IFVzZXJQcmVmZXJlbmNlcyA9IHtcbiAgICBza2lwVGVjaG5pcXVlczogW10sXG4gICAgY3VzdG9tUGVyc29uYXM6IHtcbiAgICAgICAgc2VjdXJpdHk6IFwiXCIsXG4gICAgICAgIGZyb250ZW5kOiBcIlwiLFxuICAgICAgICBiYWNrZW5kOiBcIlwiLFxuICAgICAgICBkYXRhYmFzZTogXCJcIixcbiAgICAgICAgZGV2b3BzOiBcIlwiLFxuICAgICAgICBhcmNoaXRlY3R1cmU6IFwiXCIsXG4gICAgICAgIHRlc3Rpbmc6IFwiXCIsXG4gICAgICAgIGdlbmVyYWw6IFwiXCIsXG4gICAgfSxcbiAgICBhdXRvQXBwcm92ZURlZmF1bHQ6IGZhbHNlLFxuICAgIHZlcmJvc2l0eURlZmF1bHQ6IFwibm9ybWFsXCIsXG59O1xuXG4vKipcbiAqIFByb21wdCBPcHRpbWl6ZXIgY2xhc3NcbiAqL1xuZXhwb3J0IGNsYXNzIFByb21wdE9wdGltaXplciB7XG4gICAgcHJpdmF0ZSBjb25maWc6IE9wdGltaXphdGlvbkNvbmZpZztcbiAgICBwcml2YXRlIHByZWZlcmVuY2VzOiBVc2VyUHJlZmVyZW5jZXM7XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgY29uZmlnOiBQYXJ0aWFsPE9wdGltaXphdGlvbkNvbmZpZz4gPSB7fSxcbiAgICAgICAgcHJlZmVyZW5jZXM6IFBhcnRpYWw8VXNlclByZWZlcmVuY2VzPiA9IHt9LFxuICAgICkge1xuICAgICAgICB0aGlzLmNvbmZpZyA9IHsgLi4uREVGQVVMVF9DT05GSUcsIC4uLmNvbmZpZyB9O1xuICAgICAgICB0aGlzLnByZWZlcmVuY2VzID0geyAuLi5ERUZBVUxUX1BSRUZFUkVOQ0VTLCAuLi5wcmVmZXJlbmNlcyB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZSBjb25maWd1cmF0aW9uXG4gICAgICovXG4gICAgdXBkYXRlQ29uZmlnKHVwZGF0ZXM6IFBhcnRpYWw8T3B0aW1pemF0aW9uQ29uZmlnPik6IHZvaWQge1xuICAgICAgICB0aGlzLmNvbmZpZyA9IHsgLi4udGhpcy5jb25maWcsIC4uLnVwZGF0ZXMgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgcHJlZmVyZW5jZXNcbiAgICAgKi9cbiAgICB1cGRhdGVQcmVmZXJlbmNlcyh1cGRhdGVzOiBQYXJ0aWFsPFVzZXJQcmVmZXJlbmNlcz4pOiB2b2lkIHtcbiAgICAgICAgdGhpcy5wcmVmZXJlbmNlcyA9IHsgLi4udGhpcy5wcmVmZXJlbmNlcywgLi4udXBkYXRlcyB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBjdXJyZW50IGNvbmZpZ3VyYXRpb25cbiAgICAgKi9cbiAgICBnZXRDb25maWcoKTogT3B0aW1pemF0aW9uQ29uZmlnIHtcbiAgICAgICAgcmV0dXJuIHsgLi4udGhpcy5jb25maWcgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgY3VycmVudCBwcmVmZXJlbmNlc1xuICAgICAqL1xuICAgIGdldFByZWZlcmVuY2VzKCk6IFVzZXJQcmVmZXJlbmNlcyB7XG4gICAgICAgIHJldHVybiB7IC4uLnRoaXMucHJlZmVyZW5jZXMgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBvcHRpbWl6YXRpb24gc2hvdWxkIGJlIHNraXBwZWQgKGVzY2FwZSBoYXRjaClcbiAgICAgKi9cbiAgICBzaG91bGRTa2lwT3B0aW1pemF0aW9uKHByb21wdDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiBwcm9tcHQuc3RhcnRzV2l0aCh0aGlzLmNvbmZpZy5lc2NhcGVQcmVmaXgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFN0cmlwIGVzY2FwZSBwcmVmaXggZnJvbSBwcm9tcHRcbiAgICAgKi9cbiAgICBzdHJpcEVzY2FwZVByZWZpeChwcm9tcHQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBwcm9tcHQuc2xpY2UodGhpcy5jb25maWcuZXNjYXBlUHJlZml4Lmxlbmd0aCkudHJpbSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIG9wdGltaXphdGlvbiBzaG91bGQgYmUgc2tpcHBlZCBmb3Igc2ltcGxlIHByb21wdHNcbiAgICAgKi9cbiAgICBzaG91bGRTa2lwRm9yQ29tcGxleGl0eShjb21wbGV4aXR5OiBDb21wbGV4aXR5KTogYm9vbGVhbiB7XG4gICAgICAgIGlmICghdGhpcy5jb25maWcuc2tpcEZvclNpbXBsZVByb21wdHMpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29tcGxleGl0eSA9PT0gXCJzaW1wbGVcIjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgb3B0aW1pemF0aW9uIHNlc3Npb25cbiAgICAgKi9cbiAgICBjcmVhdGVTZXNzaW9uKHByb21wdDogc3RyaW5nKTogT3B0aW1pemF0aW9uU2Vzc2lvbiB7XG4gICAgICAgIC8vIENoZWNrIGVzY2FwZSBoYXRjaFxuICAgICAgICBpZiAodGhpcy5zaG91bGRTa2lwT3B0aW1pemF0aW9uKHByb21wdCkpIHtcbiAgICAgICAgICAgIGNvbnN0IHN0cmlwcGVkID0gdGhpcy5zdHJpcEVzY2FwZVByZWZpeChwcm9tcHQpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBpZDogZ2VuZXJhdGVJZCgpLFxuICAgICAgICAgICAgICAgIG9yaWdpbmFsUHJvbXB0OiBzdHJpcHBlZCxcbiAgICAgICAgICAgICAgICBjb21wbGV4aXR5OiBcInNpbXBsZVwiLFxuICAgICAgICAgICAgICAgIGRvbWFpbjogXCJnZW5lcmFsXCIsXG4gICAgICAgICAgICAgICAgc3RlcHM6IFtdLFxuICAgICAgICAgICAgICAgIGZpbmFsUHJvbXB0OiBzdHJpcHBlZCxcbiAgICAgICAgICAgICAgICB2ZXJib3NpdHk6IHRoaXMuY29uZmlnLnZlcmJvc2l0eSxcbiAgICAgICAgICAgICAgICBhdXRvQXBwcm92ZTogdGhpcy5jb25maWcuYXV0b0FwcHJvdmUsXG4gICAgICAgICAgICAgICAgcHJlZmVyZW5jZXM6IHRoaXMucHJlZmVyZW5jZXMsXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFuYWx5emUgcHJvbXB0XG4gICAgICAgIGNvbnN0IGFuYWx5c2lzID0gYW5hbHl6ZVByb21wdChwcm9tcHQpO1xuXG4gICAgICAgIC8vIENoZWNrIGlmIHNob3VsZCBza2lwIGZvciBjb21wbGV4aXR5XG4gICAgICAgIGlmICh0aGlzLnNob3VsZFNraXBGb3JDb21wbGV4aXR5KGFuYWx5c2lzLmNvbXBsZXhpdHkpKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGlkOiBnZW5lcmF0ZUlkKCksXG4gICAgICAgICAgICAgICAgb3JpZ2luYWxQcm9tcHQ6IHByb21wdCxcbiAgICAgICAgICAgICAgICBjb21wbGV4aXR5OiBhbmFseXNpcy5jb21wbGV4aXR5LFxuICAgICAgICAgICAgICAgIGRvbWFpbjogYW5hbHlzaXMuZG9tYWluLFxuICAgICAgICAgICAgICAgIHN0ZXBzOiBbXSxcbiAgICAgICAgICAgICAgICBmaW5hbFByb21wdDogcHJvbXB0LFxuICAgICAgICAgICAgICAgIHZlcmJvc2l0eTogdGhpcy5jb25maWcudmVyYm9zaXR5LFxuICAgICAgICAgICAgICAgIGF1dG9BcHByb3ZlOiB0aGlzLmNvbmZpZy5hdXRvQXBwcm92ZSxcbiAgICAgICAgICAgICAgICBwcmVmZXJlbmNlczogdGhpcy5wcmVmZXJlbmNlcyxcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gR2VuZXJhdGUgb3B0aW1pemF0aW9uIHN0ZXBzXG4gICAgICAgIGNvbnN0IHN0ZXBzID0gdGhpcy5nZW5lcmF0ZVN0ZXBzKGFuYWx5c2lzKTtcblxuICAgICAgICAvLyBCdWlsZCBmaW5hbCBwcm9tcHQgKGluaXRpYWwgdmVyc2lvbilcbiAgICAgICAgY29uc3QgZmluYWxQcm9tcHQgPSB0aGlzLmJ1aWxkRmluYWxQcm9tcHQocHJvbXB0LCBzdGVwcyk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGlkOiBnZW5lcmF0ZUlkKCksXG4gICAgICAgICAgICBvcmlnaW5hbFByb21wdDogcHJvbXB0LFxuICAgICAgICAgICAgY29tcGxleGl0eTogYW5hbHlzaXMuY29tcGxleGl0eSxcbiAgICAgICAgICAgIGRvbWFpbjogYW5hbHlzaXMuZG9tYWluLFxuICAgICAgICAgICAgc3RlcHMsXG4gICAgICAgICAgICBmaW5hbFByb21wdCxcbiAgICAgICAgICAgIHZlcmJvc2l0eTogdGhpcy5jb25maWcudmVyYm9zaXR5LFxuICAgICAgICAgICAgYXV0b0FwcHJvdmU6IHRoaXMuY29uZmlnLmF1dG9BcHByb3ZlLFxuICAgICAgICAgICAgcHJlZmVyZW5jZXM6IHRoaXMucHJlZmVyZW5jZXMsXG4gICAgICAgICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCksXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2VuZXJhdGUgb3B0aW1pemF0aW9uIHN0ZXBzIGJhc2VkIG9uIGFuYWx5c2lzXG4gICAgICovXG4gICAgcHJpdmF0ZSBnZW5lcmF0ZVN0ZXBzKGFuYWx5c2lzOiBBbmFseXNpc1Jlc3VsdCk6IE9wdGltaXphdGlvblN0ZXBbXSB7XG4gICAgICAgIGNvbnN0IHN0ZXBzOiBPcHRpbWl6YXRpb25TdGVwW10gPSBbXTtcbiAgICAgICAgbGV0IHN0ZXBJZCA9IDE7XG5cbiAgICAgICAgZm9yIChjb25zdCB0ZWNobmlxdWVJZCBvZiBhbmFseXNpcy5zdWdnZXN0ZWRUZWNobmlxdWVzKSB7XG4gICAgICAgICAgICAvLyBTa2lwIGlmIHVzZXIgYWx3YXlzIHNraXBzIHRoaXMgdGVjaG5pcXVlXG4gICAgICAgICAgICBpZiAodGhpcy5wcmVmZXJlbmNlcy5za2lwVGVjaG5pcXVlcy5pbmNsdWRlcyh0ZWNobmlxdWVJZCkpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgdGVjaG5pcXVlID0gZ2V0VGVjaG5pcXVlQnlJZCh0ZWNobmlxdWVJZCk7XG4gICAgICAgICAgICBpZiAoIXRlY2huaXF1ZSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBjb250ZXh0OiBUZWNobmlxdWVDb250ZXh0ID0ge1xuICAgICAgICAgICAgICAgIG9yaWdpbmFsUHJvbXB0OiBcIlwiLFxuICAgICAgICAgICAgICAgIGNvbXBsZXhpdHk6IGFuYWx5c2lzLmNvbXBsZXhpdHksXG4gICAgICAgICAgICAgICAgZG9tYWluOiBhbmFseXNpcy5kb21haW4sXG4gICAgICAgICAgICAgICAgcHJldmlvdXNTdGVwczogc3RlcHMsXG4gICAgICAgICAgICAgICAgcHJlZmVyZW5jZXM6IHRoaXMucHJlZmVyZW5jZXMsXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzdGVwcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBpZDogc3RlcElkKyssXG4gICAgICAgICAgICAgICAgdGVjaG5pcXVlOiB0ZWNobmlxdWVJZCxcbiAgICAgICAgICAgICAgICBuYW1lOiB0ZWNobmlxdWUubmFtZSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogdGVjaG5pcXVlLmRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IHRlY2huaXF1ZS5nZW5lcmF0ZShjb250ZXh0KSxcbiAgICAgICAgICAgICAgICBzdGF0dXM6IFwicGVuZGluZ1wiLFxuICAgICAgICAgICAgICAgIHNraXBwYWJsZTogdGVjaG5pcXVlSWQgIT09IFwiYW5hbHlzaXNcIiwgLy8gQW5hbHlzaXMgY2FuJ3QgYmUgc2tpcHBlZFxuICAgICAgICAgICAgICAgIGFwcGxpZXNUbzogdGVjaG5pcXVlLmFwcGxpZXNUbyxcbiAgICAgICAgICAgICAgICByZXNlYXJjaEJhc2lzOiB0ZWNobmlxdWUucmVzZWFyY2hCYXNpcyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQXV0by1hcHByb3ZlIGlmIGVuYWJsZWRcbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLmF1dG9BcHByb3ZlKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHN0ZXAgb2Ygc3RlcHMpIHtcbiAgICAgICAgICAgICAgICBzdGVwLnN0YXR1cyA9IFwiYXBwcm92ZWRcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzdGVwcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBCdWlsZCBmaW5hbCBwcm9tcHQgZnJvbSBvcmlnaW5hbCArIGFwcHJvdmVkIHN0ZXBzXG4gICAgICovXG4gICAgYnVpbGRGaW5hbFByb21wdChcbiAgICAgICAgb3JpZ2luYWxQcm9tcHQ6IHN0cmluZyxcbiAgICAgICAgc3RlcHM6IE9wdGltaXphdGlvblN0ZXBbXSxcbiAgICApOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBhcHByb3ZlZFN0ZXBzID0gc3RlcHMuZmlsdGVyKFxuICAgICAgICAgICAgKHMpID0+IHMuc3RhdHVzID09PSBcImFwcHJvdmVkXCIgfHwgcy5zdGF0dXMgPT09IFwibW9kaWZpZWRcIixcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAoYXBwcm92ZWRTdGVwcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbFByb21wdDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEJ1aWxkIGVuaGFuY2VkIHByb21wdFxuICAgICAgICBjb25zdCBwYXJ0czogc3RyaW5nW10gPSBbXTtcblxuICAgICAgICBmb3IgKGNvbnN0IHN0ZXAgb2YgYXBwcm92ZWRTdGVwcykge1xuICAgICAgICAgICAgY29uc3QgY29udGVudCA9IHN0ZXAubW9kaWZpZWRDb250ZW50IHx8IHN0ZXAuY29udGVudDtcbiAgICAgICAgICAgIGlmIChjb250ZW50KSB7XG4gICAgICAgICAgICAgICAgcGFydHMucHVzaChjb250ZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFkZCBvcmlnaW5hbCB0YXNrIGF0IHRoZSBlbmRcbiAgICAgICAgcGFydHMucHVzaChgXFxuXFxuVGFzazogJHtvcmlnaW5hbFByb21wdH1gKTtcblxuICAgICAgICByZXR1cm4gcGFydHMuam9pbihcIlxcblxcblwiKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgZmluYWwgcHJvbXB0IGJhc2VkIG9uIGN1cnJlbnQgc3RlcHNcbiAgICAgKi9cbiAgICB1cGRhdGVGaW5hbFByb21wdChzZXNzaW9uOiBPcHRpbWl6YXRpb25TZXNzaW9uKTogdm9pZCB7XG4gICAgICAgIHNlc3Npb24uZmluYWxQcm9tcHQgPSB0aGlzLmJ1aWxkRmluYWxQcm9tcHQoXG4gICAgICAgICAgICBzZXNzaW9uLm9yaWdpbmFsUHJvbXB0LFxuICAgICAgICAgICAgc2Vzc2lvbi5zdGVwcyxcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBcHByb3ZlIGEgc3RlcFxuICAgICAqL1xuICAgIGFwcHJvdmVTdGVwKHNlc3Npb246IE9wdGltaXphdGlvblNlc3Npb24sIHN0ZXBJZDogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHN0ZXAgPSBzZXNzaW9uLnN0ZXBzLmZpbmQoKHMpID0+IHMuaWQgPT09IHN0ZXBJZCk7XG4gICAgICAgIGlmIChzdGVwKSB7XG4gICAgICAgICAgICBzdGVwLnN0YXR1cyA9IFwiYXBwcm92ZWRcIjtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlRmluYWxQcm9tcHQoc2Vzc2lvbik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWplY3QgYSBzdGVwXG4gICAgICovXG4gICAgcmVqZWN0U3RlcChzZXNzaW9uOiBPcHRpbWl6YXRpb25TZXNzaW9uLCBzdGVwSWQ6IG51bWJlcik6IHZvaWQge1xuICAgICAgICBjb25zdCBzdGVwID0gc2Vzc2lvbi5zdGVwcy5maW5kKChzKSA9PiBzLmlkID09PSBzdGVwSWQpO1xuICAgICAgICBpZiAoc3RlcCkge1xuICAgICAgICAgICAgc3RlcC5zdGF0dXMgPSBcInJlamVjdGVkXCI7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUZpbmFsUHJvbXB0KHNlc3Npb24pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTW9kaWZ5IGEgc3RlcFxuICAgICAqL1xuICAgIG1vZGlmeVN0ZXAoXG4gICAgICAgIHNlc3Npb246IE9wdGltaXphdGlvblNlc3Npb24sXG4gICAgICAgIHN0ZXBJZDogbnVtYmVyLFxuICAgICAgICBuZXdDb250ZW50OiBzdHJpbmcsXG4gICAgKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHN0ZXAgPSBzZXNzaW9uLnN0ZXBzLmZpbmQoKHMpID0+IHMuaWQgPT09IHN0ZXBJZCk7XG4gICAgICAgIGlmIChzdGVwKSB7XG4gICAgICAgICAgICBzdGVwLm1vZGlmaWVkQ29udGVudCA9IG5ld0NvbnRlbnQ7XG4gICAgICAgICAgICBzdGVwLnN0YXR1cyA9IFwibW9kaWZpZWRcIjtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlRmluYWxQcm9tcHQoc2Vzc2lvbik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBcHByb3ZlIGFsbCBzdGVwc1xuICAgICAqL1xuICAgIGFwcHJvdmVBbGwoc2Vzc2lvbjogT3B0aW1pemF0aW9uU2Vzc2lvbik6IHZvaWQge1xuICAgICAgICBmb3IgKGNvbnN0IHN0ZXAgb2Ygc2Vzc2lvbi5zdGVwcykge1xuICAgICAgICAgICAgaWYgKHN0ZXAuc3RhdHVzID09PSBcInBlbmRpbmdcIikge1xuICAgICAgICAgICAgICAgIHN0ZXAuc3RhdHVzID0gXCJhcHByb3ZlZFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMudXBkYXRlRmluYWxQcm9tcHQoc2Vzc2lvbik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2tpcCBvcHRpbWl6YXRpb24gKHJlamVjdCBhbGwgbm9uLWFuYWx5c2lzIHN0ZXBzKVxuICAgICAqL1xuICAgIHNraXBPcHRpbWl6YXRpb24oc2Vzc2lvbjogT3B0aW1pemF0aW9uU2Vzc2lvbik6IHZvaWQge1xuICAgICAgICBmb3IgKGNvbnN0IHN0ZXAgb2Ygc2Vzc2lvbi5zdGVwcykge1xuICAgICAgICAgICAgaWYgKHN0ZXAudGVjaG5pcXVlICE9PSBcImFuYWx5c2lzXCIpIHtcbiAgICAgICAgICAgICAgICBzdGVwLnN0YXR1cyA9IFwicmVqZWN0ZWRcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnVwZGF0ZUZpbmFsUHJvbXB0KHNlc3Npb24pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNhdmUgcHJlZmVyZW5jZSB0byBhbHdheXMgc2tpcCBhIHRlY2huaXF1ZVxuICAgICAqL1xuICAgIHNhdmVTa2lwUHJlZmVyZW5jZSh0ZWNobmlxdWVJZDogVGVjaG5pcXVlSWQpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLnByZWZlcmVuY2VzLnNraXBUZWNobmlxdWVzLmluY2x1ZGVzKHRlY2huaXF1ZUlkKSkge1xuICAgICAgICAgICAgdGhpcy5wcmVmZXJlbmNlcy5za2lwVGVjaG5pcXVlcy5wdXNoKHRlY2huaXF1ZUlkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNhdmUgY3VzdG9tIHBlcnNvbmEgZm9yIGEgZG9tYWluXG4gICAgICovXG4gICAgc2F2ZUN1c3RvbVBlcnNvbmEoXG4gICAgICAgIGRvbWFpbjpcbiAgICAgICAgICAgIHwgXCJzZWN1cml0eVwiXG4gICAgICAgICAgICB8IFwiZnJvbnRlbmRcIlxuICAgICAgICAgICAgfCBcImJhY2tlbmRcIlxuICAgICAgICAgICAgfCBcImRhdGFiYXNlXCJcbiAgICAgICAgICAgIHwgXCJkZXZvcHNcIlxuICAgICAgICAgICAgfCBcImFyY2hpdGVjdHVyZVwiXG4gICAgICAgICAgICB8IFwidGVzdGluZ1wiXG4gICAgICAgICAgICB8IFwiZ2VuZXJhbFwiLFxuICAgICAgICBwZXJzb25hOiBzdHJpbmcsXG4gICAgKTogdm9pZCB7XG4gICAgICAgIHRoaXMucHJlZmVyZW5jZXMuY3VzdG9tUGVyc29uYXNbZG9tYWluXSA9IHBlcnNvbmE7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVG9nZ2xlIGF1dG8tYXBwcm92ZVxuICAgICAqL1xuICAgIHRvZ2dsZUF1dG9BcHByb3ZlKGVuYWJsZWQ/OiBib29sZWFuKTogdm9pZCB7XG4gICAgICAgIHRoaXMuY29uZmlnLmF1dG9BcHByb3ZlID1cbiAgICAgICAgICAgIGVuYWJsZWQgIT09IHVuZGVmaW5lZCA/IGVuYWJsZWQgOiAhdGhpcy5jb25maWcuYXV0b0FwcHJvdmU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IHZlcmJvc2l0eVxuICAgICAqL1xuICAgIHNldFZlcmJvc2l0eSh2ZXJib3NpdHk6IFwicXVpZXRcIiB8IFwibm9ybWFsXCIgfCBcInZlcmJvc2VcIik6IHZvaWQge1xuICAgICAgICB0aGlzLmNvbmZpZy52ZXJib3NpdHkgPSB2ZXJib3NpdHk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlIGV4cGVjdGVkIGltcHJvdmVtZW50XG4gICAgICovXG4gICAgY2FsY3VsYXRlRXhwZWN0ZWRJbXByb3ZlbWVudChcbiAgICAgICAgc2Vzc2lvbjogT3B0aW1pemF0aW9uU2Vzc2lvbixcbiAgICApOiBFeHBlY3RlZEltcHJvdmVtZW50IHtcbiAgICAgICAgY29uc3QgYXBwcm92ZWRUZWNobmlxdWVzID0gc2Vzc2lvbi5zdGVwcy5maWx0ZXIoXG4gICAgICAgICAgICAocykgPT4gcy5zdGF0dXMgPT09IFwiYXBwcm92ZWRcIiB8fCBzLnN0YXR1cyA9PT0gXCJtb2RpZmllZFwiLFxuICAgICAgICApO1xuICAgICAgICBjb25zdCB0ZWNobmlxdWVzQXBwbGllZCA9IGFwcHJvdmVkVGVjaG5pcXVlcy5tYXAoKHMpID0+IHMudGVjaG5pcXVlKTtcblxuICAgICAgICAvLyBBcHByb3hpbWF0ZSBxdWFsaXR5IGltcHJvdmVtZW50IGJhc2VkIG9uIHJlc2VhcmNoXG4gICAgICAgIGNvbnN0IGltcHJvdmVtZW50TWFwOiBSZWNvcmQ8VGVjaG5pcXVlSWQsIG51bWJlcj4gPSB7XG4gICAgICAgICAgICBhbmFseXNpczogNSxcbiAgICAgICAgICAgIGV4cGVydF9wZXJzb25hOiA2MCxcbiAgICAgICAgICAgIHJlYXNvbmluZ19jaGFpbjogNDYsXG4gICAgICAgICAgICBzdGFrZXNfbGFuZ3VhZ2U6IDQ1LFxuICAgICAgICAgICAgY2hhbGxlbmdlX2ZyYW1pbmc6IDExNSxcbiAgICAgICAgICAgIHNlbGZfZXZhbHVhdGlvbjogMTAsXG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IHRvdGFsSW1wcm92ZW1lbnQgPSAwO1xuICAgICAgICBmb3IgKGNvbnN0IHRlY2huaXF1ZUlkIG9mIHRlY2huaXF1ZXNBcHBsaWVkKSB7XG4gICAgICAgICAgICB0b3RhbEltcHJvdmVtZW50ICs9IGltcHJvdmVtZW50TWFwW3RlY2huaXF1ZUlkXSB8fCAwO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2FwIGF0IHJlYXNvbmFibGUgbWF4aW11bSAoZGltaW5pc2hpbmcgcmV0dXJucylcbiAgICAgICAgY29uc3QgZWZmZWN0aXZlSW1wcm92ZW1lbnQgPSBNYXRoLm1pbih0b3RhbEltcHJvdmVtZW50LCAxNTApO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBxdWFsaXR5SW1wcm92ZW1lbnQ6IGVmZmVjdGl2ZUltcHJvdmVtZW50LFxuICAgICAgICAgICAgdGVjaG5pcXVlc0FwcGxpZWQsXG4gICAgICAgICAgICByZXNlYXJjaEJhc2lzOlxuICAgICAgICAgICAgICAgIFwiQ29tYmluZWQgcmVzZWFyY2gtYmFja2VkIHRlY2huaXF1ZXMgKE1CWlVBSSwgR29vZ2xlIERlZXBNaW5kLCBJQ0xSIDIwMjQpXCIsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHNlc3Npb24gc3VtbWFyeVxuICAgICAqL1xuICAgIGdldFNlc3Npb25TdW1tYXJ5KHNlc3Npb246IE9wdGltaXphdGlvblNlc3Npb24pOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBpbXByb3ZlbWVudCA9IHRoaXMuY2FsY3VsYXRlRXhwZWN0ZWRJbXByb3ZlbWVudChzZXNzaW9uKTtcbiAgICAgICAgY29uc3QgYXBwcm92ZWRDb3VudCA9IHNlc3Npb24uc3RlcHMuZmlsdGVyKFxuICAgICAgICAgICAgKHMpID0+IHMuc3RhdHVzID09PSBcImFwcHJvdmVkXCIgfHwgcy5zdGF0dXMgPT09IFwibW9kaWZpZWRcIixcbiAgICAgICAgKS5sZW5ndGg7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIGBPcHRpbWl6YXRpb24gU2Vzc2lvbiAke3Nlc3Npb24uaWR9XFxuYCArXG4gICAgICAgICAgICBgICBDb21wbGV4aXR5OiAke3Nlc3Npb24uY29tcGxleGl0eX1cXG5gICtcbiAgICAgICAgICAgIGAgIERvbWFpbjogJHtzZXNzaW9uLmRvbWFpbn1cXG5gICtcbiAgICAgICAgICAgIGAgIFN0ZXBzIEFwcGxpZWQ6ICR7YXBwcm92ZWRDb3VudH0vJHtzZXNzaW9uLnN0ZXBzLmxlbmd0aH1cXG5gICtcbiAgICAgICAgICAgIGAgIEV4cGVjdGVkIEltcHJvdmVtZW50OiB+JHtpbXByb3ZlbWVudC5xdWFsaXR5SW1wcm92ZW1lbnR9JWBcbiAgICAgICAgKTtcbiAgICB9XG59XG4iLAogICAgImltcG9ydCBmcyBmcm9tIFwibm9kZTpmcy9wcm9taXNlc1wiO1xuLyoqXG4gKiBTdHJ1Y3R1cmVkIGxvZ2dpbmcgZm9yIGFpLWVuZyByYWxwaFxuICpcbiAqIFN1cHBvcnRzIGJvdGggc3RkZXJyIG91dHB1dCAod2l0aCAtLXByaW50LWxvZ3MpIGFuZCBmaWxlLWJhc2VkIGxvZ2dpbmdcbiAqL1xuaW1wb3J0IHBhdGggZnJvbSBcIm5vZGU6cGF0aFwiO1xuXG5leHBvcnQgbmFtZXNwYWNlIExvZyB7XG4gICAgZXhwb3J0IHR5cGUgTGV2ZWwgPSBcIkRFQlVHXCIgfCBcIklORk9cIiB8IFwiV0FSTlwiIHwgXCJFUlJPUlwiO1xuXG4gICAgY29uc3QgbGV2ZWxQcmlvcml0eTogUmVjb3JkPExldmVsLCBudW1iZXI+ID0ge1xuICAgICAgICBERUJVRzogMCxcbiAgICAgICAgSU5GTzogMSxcbiAgICAgICAgV0FSTjogMixcbiAgICAgICAgRVJST1I6IDMsXG4gICAgfTtcblxuICAgIGxldCBjdXJyZW50TGV2ZWw6IExldmVsID0gXCJJTkZPXCI7XG4gICAgbGV0IGxvZ1BhdGggPSBcIlwiO1xuICAgIGxldCB3cml0ZTogKG1zZzogc3RyaW5nKSA9PiBhbnkgPSAobXNnKSA9PiBwcm9jZXNzLnN0ZGVyci53cml0ZShtc2cpO1xuXG4gICAgZnVuY3Rpb24gc2hvdWxkTG9nKGxldmVsOiBMZXZlbCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gbGV2ZWxQcmlvcml0eVtsZXZlbF0gPj0gbGV2ZWxQcmlvcml0eVtjdXJyZW50TGV2ZWxdO1xuICAgIH1cblxuICAgIGV4cG9ydCBpbnRlcmZhY2UgT3B0aW9ucyB7XG4gICAgICAgIHByaW50OiBib29sZWFuOyAvLyBXaGVuIHRydWUsIHdyaXRlIHRvIHN0ZGVyclxuICAgICAgICBsZXZlbD86IExldmVsO1xuICAgICAgICBsb2dEaXI/OiBzdHJpbmc7IC8vIERpcmVjdG9yeSBmb3IgbG9nIGZpbGVzXG4gICAgfVxuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGZpbGUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGxvZ1BhdGg7XG4gICAgfVxuXG4gICAgZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGluaXQob3B0aW9uczogT3B0aW9ucyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBpZiAob3B0aW9ucy5sZXZlbCkgY3VycmVudExldmVsID0gb3B0aW9ucy5sZXZlbDtcblxuICAgICAgICAvLyBCdWlsZCB0aGUgd3JpdGUgZnVuY3Rpb24gdGhhdCBvdXRwdXRzIHRvIEJPVEggc3RkZXJyIEFORCBmaWxlXG4gICAgICAgIGNvbnN0IHN0ZGVycldyaXRlciA9IChtc2c6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgcHJvY2Vzcy5zdGRlcnIud3JpdGUobXNnKTtcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAob3B0aW9ucy5sb2dEaXIpIHtcbiAgICAgICAgICAgIGNvbnN0IHRpbWVzdGFtcCA9IG5ldyBEYXRlKClcbiAgICAgICAgICAgICAgICAudG9JU09TdHJpbmcoKVxuICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9bOi5dL2csIFwiLVwiKVxuICAgICAgICAgICAgICAgIC5zbGljZSgwLCAtMSk7XG4gICAgICAgICAgICBsb2dQYXRoID0gcGF0aC5qb2luKG9wdGlvbnMubG9nRGlyLCBgcmFscGgtJHt0aW1lc3RhbXB9LmxvZ2ApO1xuICAgICAgICAgICAgYXdhaXQgZnMubWtkaXIob3B0aW9ucy5sb2dEaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuXG4gICAgICAgICAgICBjb25zdCBmaWxlID0gQnVuLmZpbGUobG9nUGF0aCk7XG4gICAgICAgICAgICBjb25zdCBmaWxlV3JpdGVyID0gZmlsZS53cml0ZXIoKTtcblxuICAgICAgICAgICAgLy8gQWx3YXlzIHdyaXRlIHRvIHN0ZGVyciBpZiBwcmludCBpcyBlbmFibGVkXG4gICAgICAgICAgICAvLyBBbHNvIGFsd2F5cyB3cml0ZSB0byBmaWxlIGlmIGxvZ0RpciBpcyBwcm92aWRlZFxuICAgICAgICAgICAgd3JpdGUgPSAobXNnKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMucHJpbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RkZXJyV3JpdGVyKG1zZyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbGVXcml0ZXIud3JpdGUobXNnKTtcbiAgICAgICAgICAgICAgICBmaWxlV3JpdGVyLmZsdXNoKCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbnMucHJpbnQpIHtcbiAgICAgICAgICAgIC8vIE9ubHkgcHJpbnQgdG8gc3RkZXJyXG4gICAgICAgICAgICB3cml0ZSA9IHN0ZGVycldyaXRlcjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGV4cG9ydCBpbnRlcmZhY2UgTG9nZ2VyIHtcbiAgICAgICAgZGVidWcobWVzc2FnZTogc3RyaW5nLCBleHRyYT86IFJlY29yZDxzdHJpbmcsIGFueT4pOiB2b2lkO1xuICAgICAgICBpbmZvKG1lc3NhZ2U6IHN0cmluZywgZXh0cmE/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+KTogdm9pZDtcbiAgICAgICAgd2FybihtZXNzYWdlOiBzdHJpbmcsIGV4dHJhPzogUmVjb3JkPHN0cmluZywgYW55Pik6IHZvaWQ7XG4gICAgICAgIGVycm9yKG1lc3NhZ2U6IHN0cmluZywgZXh0cmE/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+KTogdm9pZDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBmb3JtYXRFeHRyYShleHRyYT86IFJlY29yZDxzdHJpbmcsIGFueT4pOiBzdHJpbmcge1xuICAgICAgICBpZiAoIWV4dHJhKSByZXR1cm4gXCJcIjtcbiAgICAgICAgY29uc3QgZXh0cmFTdHIgPSBPYmplY3QuZW50cmllcyhleHRyYSlcbiAgICAgICAgICAgIC5tYXAoXG4gICAgICAgICAgICAgICAgKFtrLCB2XSkgPT5cbiAgICAgICAgICAgICAgICAgICAgYCR7a309JHt0eXBlb2YgdiA9PT0gXCJvYmplY3RcIiA/IEpTT04uc3RyaW5naWZ5KHYpIDogdn1gLFxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgLmpvaW4oXCIgXCIpO1xuICAgICAgICByZXR1cm4gZXh0cmFTdHIgPyBgICR7ZXh0cmFTdHJ9YCA6IFwiXCI7XG4gICAgfVxuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZSh0YWdzPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPik6IExvZ2dlciB7XG4gICAgICAgIGNvbnN0IHRhZ1N0ciA9IHRhZ3NcbiAgICAgICAgICAgID8gT2JqZWN0LmVudHJpZXModGFncylcbiAgICAgICAgICAgICAgICAgIC5tYXAoKFtrLCB2XSkgPT4gYCR7a309JHt2fWApXG4gICAgICAgICAgICAgICAgICAuam9pbihcIiBcIilcbiAgICAgICAgICAgIDogXCJcIjtcbiAgICAgICAgY29uc3QgdGFnU3RyV2l0aFNwYWNlID0gdGFnU3RyID8gYCR7dGFnU3RyfSBgIDogXCJcIjtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGVidWcobWVzc2FnZTogc3RyaW5nLCBleHRyYT86IFJlY29yZDxzdHJpbmcsIGFueT4pIHtcbiAgICAgICAgICAgICAgICBpZiAoc2hvdWxkTG9nKFwiREVCVUdcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgd3JpdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICBgREVCVUcgJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCl9ICR7dGFnU3RyfSR7bWVzc2FnZX0ke2Zvcm1hdEV4dHJhKGV4dHJhKX1cXG5gLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBpbmZvKG1lc3NhZ2U6IHN0cmluZywgZXh0cmE/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+KSB7XG4gICAgICAgICAgICAgICAgaWYgKHNob3VsZExvZyhcIklORk9cIikpIHtcbiAgICAgICAgICAgICAgICAgICAgd3JpdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICBgSU5GTyAgJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCl9ICR7dGFnU3RyfSR7bWVzc2FnZX0ke2Zvcm1hdEV4dHJhKGV4dHJhKX1cXG5gLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB3YXJuKG1lc3NhZ2U6IHN0cmluZywgZXh0cmE/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+KSB7XG4gICAgICAgICAgICAgICAgaWYgKHNob3VsZExvZyhcIldBUk5cIikpIHtcbiAgICAgICAgICAgICAgICAgICAgd3JpdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICBgV0FSTiAgJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCl9ICR7dGFnU3RyfSR7bWVzc2FnZX0ke2Zvcm1hdEV4dHJhKGV4dHJhKX1cXG5gLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlcnJvcihtZXNzYWdlOiBzdHJpbmcsIGV4dHJhPzogUmVjb3JkPHN0cmluZywgYW55Pikge1xuICAgICAgICAgICAgICAgIGlmIChzaG91bGRMb2coXCJFUlJPUlwiKSkge1xuICAgICAgICAgICAgICAgICAgICB3cml0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIGBFUlJPUiAke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKX0gJHt0YWdTdHJ9JHttZXNzYWdlfSR7Zm9ybWF0RXh0cmEoZXh0cmEpfVxcbmAsXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBleHBvcnQgY29uc3QgRGVmYXVsdCA9IGNyZWF0ZSh7IHNlcnZpY2U6IFwicmFscGhcIiB9KTtcbn1cbiIsCiAgICAiLyoqXG4gKiBDTEkgVUkgdXRpbGl0aWVzIGZvciBhaS1lbmcgcmFscGhcbiAqXG4gKiBDb25zb2xlIHN0eWxpbmcgYW5kIG91dHB1dCBoZWxwZXJzXG4gKi9cbmltcG9ydCB7IEVPTCB9IGZyb20gXCJub2RlOm9zXCI7XG5cbmV4cG9ydCBuYW1lc3BhY2UgVUkge1xuICAgIGV4cG9ydCBjb25zdCBTdHlsZSA9IHtcbiAgICAgICAgLy8gQ29sb3JzXG4gICAgICAgIFRFWFRfSElHSExJR0hUOiBcIlxceDFiWzk2bVwiLFxuICAgICAgICBURVhUX0hJR0hMSUdIVF9CT0xEOiBcIlxceDFiWzk2bVxceDFiWzFtXCIsXG4gICAgICAgIFRFWFRfRElNOiBcIlxceDFiWzkwbVwiLFxuICAgICAgICBURVhUX0RJTV9CT0xEOiBcIlxceDFiWzkwbVxceDFiWzFtXCIsXG4gICAgICAgIFRFWFRfTk9STUFMOiBcIlxceDFiWzBtXCIsXG4gICAgICAgIFRFWFRfTk9STUFMX0JPTEQ6IFwiXFx4MWJbMW1cIixcbiAgICAgICAgVEVYVF9XQVJOSU5HOiBcIlxceDFiWzkzbVwiLFxuICAgICAgICBURVhUX1dBUk5JTkdfQk9MRDogXCJcXHgxYls5M21cXHgxYlsxbVwiLFxuICAgICAgICBURVhUX0RBTkdFUjogXCJcXHgxYls5MW1cIixcbiAgICAgICAgVEVYVF9EQU5HRVJfQk9MRDogXCJcXHgxYls5MW1cXHgxYlsxbVwiLFxuICAgICAgICBURVhUX1NVQ0NFU1M6IFwiXFx4MWJbOTJtXCIsXG4gICAgICAgIFRFWFRfU1VDQ0VTU19CT0xEOiBcIlxceDFiWzkybVxceDFiWzFtXCIsXG4gICAgICAgIFRFWFRfSU5GTzogXCJcXHgxYls5NG1cIixcbiAgICAgICAgVEVYVF9JTkZPX0JPTEQ6IFwiXFx4MWJbOTRtXFx4MWJbMW1cIixcbiAgICB9O1xuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHByaW50bG4oLi4ubWVzc2FnZTogc3RyaW5nW10pOiB2b2lkIHtcbiAgICAgICAgcHJvY2Vzcy5zdGRlcnIud3JpdGUobWVzc2FnZS5qb2luKFwiIFwiKSArIEVPTCk7XG4gICAgfVxuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHByaW50KC4uLm1lc3NhZ2U6IHN0cmluZ1tdKTogdm9pZCB7XG4gICAgICAgIHByb2Nlc3Muc3RkZXJyLndyaXRlKG1lc3NhZ2Uuam9pbihcIiBcIikpO1xuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiBlcnJvcihtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgcHJpbnRsbihcbiAgICAgICAgICAgIGAke1N0eWxlLlRFWFRfREFOR0VSX0JPTER9RXJyb3I6ICR7U3R5bGUuVEVYVF9OT1JNQUx9JHttZXNzYWdlfWAsXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHN1Y2Nlc3MobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIHByaW50bG4oYCR7U3R5bGUuVEVYVF9TVUNDRVNTX0JPTER94pyTICR7U3R5bGUuVEVYVF9OT1JNQUx9JHttZXNzYWdlfWApO1xuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiBpbmZvKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBwcmludGxuKGAke1N0eWxlLlRFWFRfSU5GT19CT0xEfeKEuSAke1N0eWxlLlRFWFRfTk9STUFMfSR7bWVzc2FnZX1gKTtcbiAgICB9XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gd2FybihtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgcHJpbnRsbihgJHtTdHlsZS5URVhUX1dBUk5JTkdfQk9MRH0hICR7U3R5bGUuVEVYVF9OT1JNQUx9JHttZXNzYWdlfWApO1xuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiBoZWFkZXIodGl0bGU6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBwcmludGxuKCk7XG4gICAgICAgIHByaW50bG4oU3R5bGUuVEVYVF9ISUdITElHSFRfQk9MRCArIHRpdGxlICsgU3R5bGUuVEVYVF9OT1JNQUwpO1xuICAgICAgICBwcmludGxuKFN0eWxlLlRFWFRfRElNICsgXCLilIBcIi5yZXBlYXQoNTApICsgU3R5bGUuVEVYVF9OT1JNQUwpO1xuICAgIH1cbn1cbiIsCiAgICAiIyEvdXNyL2Jpbi9lbnYgYnVuXG5cbi8qKlxuICogQ0xJIGV4ZWN1dGlvbiBtb2RlIGZvciBhaS1lbmcgcmFscGhcbiAqXG4gKiBOb24tVFVJIGV4ZWN1dGlvbiB3aXRoIGludGVyYWN0aXZlIHByb21wdHMgdXNpbmcgQGNsYWNrL3Byb21wdHNcbiAqXG4gKiBTdXBwb3J0cyB0d28gbW9kZXM6XG4gKiAtIExvb3AgbW9kZSAoZGVmYXVsdCk6IEl0ZXJhdGVzIHdpdGggZnJlc2ggT3BlbkNvZGUgc2Vzc2lvbnMgcGVyIGN5Y2xlXG4gKiAtIFNpbmdsZS1zaG90IG1vZGUgKC0tbm8tbG9vcCk6IFNpbmdsZSBleGVjdXRpb24gd2l0aCBwcm9tcHQgb3B0aW1pemF0aW9uXG4gKi9cbmltcG9ydCB7IGlzQ2FuY2VsLCBvdXRybywgc2VsZWN0LCBzcGlubmVyIH0gZnJvbSBcIkBjbGFjay9wcm9tcHRzXCI7XG5pbXBvcnQge1xuICAgIHR5cGUgTWVzc2FnZVJlc3BvbnNlLFxuICAgIE9wZW5Db2RlQ2xpZW50LFxufSBmcm9tIFwiLi4vYmFja2VuZHMvb3BlbmNvZGUvY2xpZW50XCI7XG5pbXBvcnQgdHlwZSB7IEFpRW5nQ29uZmlnIH0gZnJvbSBcIi4uL2NvbmZpZy9zY2hlbWFcIjtcbmltcG9ydCB7XG4gICAgUmFscGhMb29wUnVubmVyLFxuICAgIGNyZWF0ZVJhbHBoTG9vcFJ1bm5lcixcbn0gZnJvbSBcIi4uL2V4ZWN1dGlvbi9yYWxwaC1sb29wXCI7XG5pbXBvcnQgeyBQcm9tcHRPcHRpbWl6ZXIgfSBmcm9tIFwiLi4vcHJvbXB0LW9wdGltaXphdGlvbi9vcHRpbWl6ZXJcIjtcbmltcG9ydCB7IExvZyB9IGZyb20gXCIuLi91dGlsL2xvZ1wiO1xuaW1wb3J0IHR5cGUgeyBSYWxwaEZsYWdzIH0gZnJvbSBcIi4vZmxhZ3NcIjtcbmltcG9ydCB7IFVJIH0gZnJvbSBcIi4vdWlcIjtcblxuY29uc3QgbG9nID0gTG9nLmNyZWF0ZSh7IHNlcnZpY2U6IFwicnVuLWNsaVwiIH0pO1xuXG4vKipcbiAqIENsZWFudXAgaGFuZGxlciB0byBlbnN1cmUgT3BlbkNvZGUgc2VydmVyIGlzIHByb3Blcmx5IHNodXQgZG93blxuICovXG5sZXQgYWN0aXZlQ2xpZW50OiBPcGVuQ29kZUNsaWVudCB8IG51bGwgPSBudWxsO1xubGV0IGNsZWFudXBIYW5kbGVyc1JlZ2lzdGVyZWQgPSBmYWxzZTtcblxuYXN5bmMgZnVuY3Rpb24gc2V0dXBDbGVhbnVwSGFuZGxlcnMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKGNsZWFudXBIYW5kbGVyc1JlZ2lzdGVyZWQpIHJldHVybjtcbiAgICBjbGVhbnVwSGFuZGxlcnNSZWdpc3RlcmVkID0gdHJ1ZTtcbiAgICBjb25zdCBjbGVhbnVwRm4gPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmIChhY3RpdmVDbGllbnQpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbG9nLmluZm8oXCJDbGVhbnVwIHNpZ25hbCByZWNlaXZlZCwgY2xvc2luZyBPcGVuQ29kZSBzZXJ2ZXIuLi5cIik7XG4gICAgICAgICAgICAgICAgYXdhaXQgYWN0aXZlQ2xpZW50LmNsZWFudXAoKTtcbiAgICAgICAgICAgICAgICBsb2cuaW5mbyhcIk9wZW5Db2RlIHNlcnZlciBjbG9zZWQgc3VjY2Vzc2Z1bGx5XCIpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1zZyA9XG4gICAgICAgICAgICAgICAgICAgIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgICAgICAgICBsb2cuZXJyb3IoXCJFcnJvciBkdXJpbmcgY2xlYW51cFwiLCB7IGVycm9yOiBlcnJvck1zZyB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFjdGl2ZUNsaWVudCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcHJvY2Vzcy5leGl0KDApO1xuICAgIH07XG5cbiAgICAvLyBIYW5kbGUgdmFyaW91cyBleGl0IHNpZ25hbHNcbiAgICBwcm9jZXNzLm9uKFwiU0lHSU5UXCIsIGNsZWFudXBGbik7XG4gICAgcHJvY2Vzcy5vbihcIlNJR1RFUk1cIiwgY2xlYW51cEZuKTtcbiAgICBwcm9jZXNzLm9uKFwiU0lHSFVQXCIsIGNsZWFudXBGbik7XG5cbiAgICAvLyBIYW5kbGUgdW5jYXVnaHQgZXJyb3JzXG4gICAgcHJvY2Vzcy5vbihcInVuY2F1Z2h0RXhjZXB0aW9uXCIsIGFzeW5jIChlcnJvcikgPT4ge1xuICAgICAgICBjb25zdCBlcnJvck1zZyA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgbG9nLmVycm9yKFwiVW5jYXVnaHQgZXhjZXB0aW9uXCIsIHtcbiAgICAgICAgICAgIGVycm9yOiBlcnJvck1zZyxcbiAgICAgICAgICAgIHN0YWNrOiBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3Iuc3RhY2sgOiB1bmRlZmluZWQsXG4gICAgICAgIH0pO1xuICAgICAgICBhd2FpdCBjbGVhbnVwRm4oKTtcbiAgICB9KTtcblxuICAgIHByb2Nlc3Mub24oXCJ1bmhhbmRsZWRSZWplY3Rpb25cIiwgYXN5bmMgKHJlYXNvbikgPT4ge1xuICAgICAgICBjb25zdCBlcnJvck1zZyA9XG4gICAgICAgICAgICByZWFzb24gaW5zdGFuY2VvZiBFcnJvciA/IHJlYXNvbi5tZXNzYWdlIDogU3RyaW5nKHJlYXNvbik7XG4gICAgICAgIGxvZy5lcnJvcihcIlVuaGFuZGxlZCByZWplY3Rpb25cIiwge1xuICAgICAgICAgICAgZXJyb3I6IGVycm9yTXNnLFxuICAgICAgICAgICAgc3RhY2s6IHJlYXNvbiBpbnN0YW5jZW9mIEVycm9yID8gcmVhc29uLnN0YWNrIDogdW5kZWZpbmVkLFxuICAgICAgICB9KTtcbiAgICAgICAgYXdhaXQgY2xlYW51cEZuKCk7XG4gICAgfSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5DbGkoXG4gICAgY29uZmlnOiBBaUVuZ0NvbmZpZyxcbiAgICBmbGFnczogUmFscGhGbGFncyxcbik6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFNldHVwIGNsZWFudXAgaGFuZGxlcnNcbiAgICBhd2FpdCBzZXR1cENsZWFudXBIYW5kbGVycygpO1xuXG4gICAgbG9nLmluZm8oXCJTdGFydGluZyBDTEkgZXhlY3V0aW9uXCIsIHsgd29ya2Zsb3c6IGZsYWdzLndvcmtmbG93IH0pO1xuXG4gICAgY29uc3QgcHJvbXB0ID0gZmxhZ3Mud29ya2Zsb3c7XG4gICAgaWYgKCFwcm9tcHQpIHtcbiAgICAgICAgVUkuZXJyb3IoXCJObyBwcm9tcHQgb3Igd29ya2Zsb3cgcHJvdmlkZWRcIik7XG4gICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICB9XG5cbiAgICAvLyBJbml0aWFsaXplIG9wdGltaXplclxuICAgIGNvbnN0IG9wdGltaXplciA9IG5ldyBQcm9tcHRPcHRpbWl6ZXIoe1xuICAgICAgICBhdXRvQXBwcm92ZTogZmxhZ3MuY2kgPz8gZmFsc2UsXG4gICAgICAgIHZlcmJvc2l0eTogZmxhZ3MudmVyYm9zZSA/IFwidmVyYm9zZVwiIDogXCJub3JtYWxcIixcbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSBvcHRpbWl6YXRpb24gc2Vzc2lvblxuICAgIFVJLmhlYWRlcihcIlByb21wdCBPcHRpbWl6YXRpb25cIik7XG4gICAgY29uc3Qgc2Vzc2lvbiA9IG9wdGltaXplci5jcmVhdGVTZXNzaW9uKHByb21wdCk7XG4gICAgbG9nLmRlYnVnKFwiQ3JlYXRlZCBvcHRpbWl6YXRpb24gc2Vzc2lvblwiLCB7IHN0ZXBzOiBzZXNzaW9uLnN0ZXBzLmxlbmd0aCB9KTtcblxuICAgIC8vIFJldmlldyBzdGVwcyBpbnRlcmFjdGl2ZWx5ICh1bmxlc3MgQ0kgbW9kZSlcbiAgICBpZiAoIWZsYWdzLmNpKSB7XG4gICAgICAgIGZvciAoY29uc3Qgc3RlcCBvZiBzZXNzaW9uLnN0ZXBzKSB7XG4gICAgICAgICAgICBjb25zdCBhY3Rpb24gPSBhd2FpdCBzZWxlY3Qoe1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBBcHBseSBcIiR7c3RlcC5uYW1lfVwiP1xcbiAgJHtzdGVwLmRlc2NyaXB0aW9ufWAsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogXCJhcHByb3ZlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogXCJBcHByb3ZlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBoaW50OiBcIkFwcGx5IHRoaXMgb3B0aW1pemF0aW9uXCIsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBcInJlamVjdFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IFwiUmVqZWN0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBoaW50OiBcIlNraXAgdGhpcyBvcHRpbWl6YXRpb25cIixcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IFwic2tpcC1hbGxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBcIlNraXAgYWxsXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBoaW50OiBcIlVzZSBvcmlnaW5hbCBwcm9tcHRcIixcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmIChpc0NhbmNlbChhY3Rpb24pKSB7XG4gICAgICAgICAgICAgICAgbG9nLmluZm8oXCJVc2VyIGNhbmNlbGxlZFwiKTtcbiAgICAgICAgICAgICAgICBwcm9jZXNzLmV4aXQoMCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChhY3Rpb24gPT09IFwic2tpcC1hbGxcIikge1xuICAgICAgICAgICAgICAgIG9wdGltaXplci5za2lwT3B0aW1pemF0aW9uKHNlc3Npb24pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGFjdGlvbiA9PT0gXCJhcHByb3ZlXCIpIHtcbiAgICAgICAgICAgICAgICBvcHRpbWl6ZXIuYXBwcm92ZVN0ZXAoc2Vzc2lvbiwgc3RlcC5pZCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG9wdGltaXplci5yZWplY3RTdGVwKHNlc3Npb24sIHN0ZXAuaWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gUm91dGUgdG8gbG9vcCBtb2RlIG9yIHNpbmdsZS1zaG90IG1vZGVcbiAgICBpZiAoZmxhZ3MubG9vcCAhPT0gZmFsc2UpIHtcbiAgICAgICAgLy8gTG9vcCBtb2RlIChkZWZhdWx0KVxuICAgICAgICBhd2FpdCBydW5Mb29wTW9kZShjb25maWcsIGZsYWdzLCBzZXNzaW9uLmZpbmFsUHJvbXB0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBTaW5nbGUtc2hvdCBtb2RlICgtLW5vLWxvb3ApXG4gICAgICAgIGF3YWl0IHJ1blNpbmdsZVNob3RNb2RlKGNvbmZpZywgZmxhZ3MsIHNlc3Npb24uZmluYWxQcm9tcHQpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBSdW4gaW4gUmFscGggbG9vcCBtb2RlIChkZWZhdWx0KSAtIGl0ZXJhdGVzIHdpdGggZnJlc2ggc2Vzc2lvbnMgcGVyIGN5Y2xlXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHJ1bkxvb3BNb2RlKFxuICAgIGNvbmZpZzogQWlFbmdDb25maWcsXG4gICAgZmxhZ3M6IFJhbHBoRmxhZ3MsXG4gICAgX29wdGltaXplZFByb21wdDogc3RyaW5nLFxuKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgVUkuaGVhZGVyKFwiUmFscGggTG9vcCBNb2RlXCIpO1xuICAgIFVJLmluZm8oXCJSdW5uaW5nIHdpdGggZnJlc2ggT3BlbkNvZGUgc2Vzc2lvbnMgcGVyIGl0ZXJhdGlvblwiKTtcblxuICAgIC8vIFNob3cgbW9kZSBpbmZvXG4gICAgaWYgKGZsYWdzLnNoaXApIHtcbiAgICAgICAgVUkuaW5mbyhcbiAgICAgICAgICAgIFwiTW9kZTogU0hJUCAoYXV0by1leGl0IHdoZW4gYWdlbnQgb3V0cHV0cyAnPHByb21pc2U+U0hJUDwvcHJvbWlzZT4nKVwiLFxuICAgICAgICApO1xuICAgICAgICBVSS5pbmZvKFwiQ29tcGxldGlvbiBwcm9taXNlOiA8cHJvbWlzZT5TSElQPC9wcm9taXNlPlwiKTtcbiAgICB9IGVsc2UgaWYgKGZsYWdzLmRyYWZ0IHx8ICghZmxhZ3Muc2hpcCAmJiAhZmxhZ3MuY29tcGxldGlvblByb21pc2UpKSB7XG4gICAgICAgIFVJLmluZm8oXCJNb2RlOiBEUkFGVCAocnVucyBmb3IgbWF4LWN5Y2xlcyB0aGVuIHN0b3BzIGZvciB5b3VyIHJldmlldylcIik7XG4gICAgICAgIFVJLmluZm8oXCJDb21wbGV0aW9uIHByb21pc2U6IG5vbmUgKHdpbGwgcnVuIGFsbCBjeWNsZXMpXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIFVJLmluZm8oXCJNb2RlOiBDdXN0b20gY29tcGxldGlvbiBwcm9taXNlXCIpO1xuICAgICAgICBVSS5pbmZvKGBDb21wbGV0aW9uIHByb21pc2U6ICR7ZmxhZ3MuY29tcGxldGlvblByb21pc2V9YCk7XG4gICAgfVxuXG4gICAgVUkuaW5mbyhgTWF4IGN5Y2xlczogJHtmbGFncy5tYXhDeWNsZXMgPz8gNTB9YCk7XG4gICAgVUkuaW5mbyhgU3R1Y2sgdGhyZXNob2xkOiAke2ZsYWdzLnN0dWNrVGhyZXNob2xkID8/IDV9YCk7XG4gICAgVUkucHJpbnRsbigpO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcnVubmVyID0gYXdhaXQgY3JlYXRlUmFscGhMb29wUnVubmVyKGZsYWdzLCBjb25maWcpO1xuICAgICAgICBhd2FpdCBydW5uZXIucnVuKCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgbG9nLmVycm9yKFwiTG9vcCBleGVjdXRpb24gZmFpbGVkXCIsIHsgZXJyb3I6IG1lc3NhZ2UgfSk7XG4gICAgICAgIFVJLmVycm9yKG1lc3NhZ2UpO1xuICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgfVxuXG4gICAgb3V0cm8oXCJEb25lIVwiKTtcbn1cblxuLyoqXG4gKiBSdW4gaW4gc2luZ2xlLXNob3QgbW9kZSAoLS1uby1sb29wKSAtIHNpbmdsZSBleGVjdXRpb25cbiAqL1xuYXN5bmMgZnVuY3Rpb24gcnVuU2luZ2xlU2hvdE1vZGUoXG4gICAgY29uZmlnOiBBaUVuZ0NvbmZpZyxcbiAgICBmbGFnczogUmFscGhGbGFncyxcbiAgICBvcHRpbWl6ZWRQcm9tcHQ6IHN0cmluZyxcbik6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIEV4ZWN1dGUgc2luZ2xlLXNob3RcbiAgICBVSS5oZWFkZXIoXCJFeGVjdXRpb25cIik7XG4gICAgY29uc3QgcyA9IHNwaW5uZXIoKTtcbiAgICBzLnN0YXJ0KFwiQ29ubmVjdGluZyB0byBPcGVuQ29kZS4uLlwiKTtcblxuICAgIHRyeSB7XG4gICAgICAgIC8vIENyZWF0ZSBPcGVuQ29kZSBjbGllbnQgLSB0aGlzIHdpbGwgZWl0aGVyIHNwYXduIGEgbmV3IHNlcnZlciBvciBjb25uZWN0IHRvIGV4aXN0aW5nIG9uZVxuICAgICAgICBhY3RpdmVDbGllbnQgPSBhd2FpdCBPcGVuQ29kZUNsaWVudC5jcmVhdGUoe1xuICAgICAgICAgICAgZXhpc3RpbmdTZXJ2ZXJVcmw6IHByb2Nlc3MuZW52Lk9QRU5DT0RFX1VSTCxcbiAgICAgICAgICAgIHNlcnZlclN0YXJ0dXBUaW1lb3V0OiAxMDAwMCwgLy8gQWxsb3cgMTAgc2Vjb25kcyBmb3Igc2VydmVyIHRvIHN0YXJ0XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IG9wZW5TZXNzaW9uID0gYXdhaXQgYWN0aXZlQ2xpZW50LmNyZWF0ZVNlc3Npb24ob3B0aW1pemVkUHJvbXB0KTtcbiAgICAgICAgbG9nLmluZm8oXCJDcmVhdGVkIE9wZW5Db2RlIHNlc3Npb25cIiwgeyBpZDogb3BlblNlc3Npb24uaWQgfSk7XG5cbiAgICAgICAgcy5zdG9wKFwiQ29ubmVjdGVkXCIpO1xuXG4gICAgICAgIC8vIFNlbmQgcHJvbXB0IGFuZCBzdHJlYW0gcmVzcG9uc2VcbiAgICAgICAgVUkucHJpbnRsbigpO1xuICAgICAgICBVSS5wcmludGxuKFxuICAgICAgICAgICAgYCR7VUkuU3R5bGUuVEVYVF9ESU19RXhlY3V0aW5nIHRhc2suLi4ke1VJLlN0eWxlLlRFWFRfTk9STUFMfWAsXG4gICAgICAgICk7XG5cbiAgICAgICAgbGV0IHJlc3BvbnNlOiBNZXNzYWdlUmVzcG9uc2U7XG5cbiAgICAgICAgaWYgKCFmbGFncy5ub1N0cmVhbSkge1xuICAgICAgICAgICAgLy8gU3RyZWFtaW5nIG1vZGUgKGRlZmF1bHQpXG4gICAgICAgICAgICBjb25zdCBzdHJlYW1pbmdSZXNwb25zZSA9IGF3YWl0IG9wZW5TZXNzaW9uLnNlbmRNZXNzYWdlU3RyZWFtKFxuICAgICAgICAgICAgICAgIFwiRXhlY3V0ZSB0aGlzIHRhc2sgYW5kIHByb3ZpZGUgYSBkZXRhaWxlZCByZXN1bHQgc3VtbWFyeS5cIixcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIFVJLnByaW50bG4oKTtcblxuICAgICAgICAgICAgLy8gU3RyZWFtIGNvbnRlbnQgdG8gc3RkZXJyIGluIHJlYWwtdGltZVxuICAgICAgICAgICAgY29uc3QgcmVhZGVyID0gc3RyZWFtaW5nUmVzcG9uc2Uuc3RyZWFtLmdldFJlYWRlcigpO1xuICAgICAgICAgICAgY29uc3QgZGVjb2RlciA9IG5ldyBUZXh0RGVjb2RlcigpO1xuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHsgZG9uZSwgdmFsdWUgfSA9IGF3YWl0IHJlYWRlci5yZWFkKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkb25lKSBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRleHQgPSBkZWNvZGVyLmRlY29kZSh2YWx1ZSwgeyBzdHJlYW06IHRydWUgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBVSS5wcmludCh0ZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgcmVhZGVyLnJlbGVhc2VMb2NrKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEdldCBjb21wbGV0ZSByZXNwb25zZSBmb3IgY2xlYW51cFxuICAgICAgICAgICAgcmVzcG9uc2UgPSBhd2FpdCBzdHJlYW1pbmdSZXNwb25zZS5jb21wbGV0ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIEJ1ZmZlcmVkIG1vZGUgKHdoZW4gLS1uby1zdHJlYW0gZmxhZyBpcyB1c2VkKVxuICAgICAgICAgICAgVUkucHJpbnRsbigpO1xuICAgICAgICAgICAgVUkucHJpbnRsbihcbiAgICAgICAgICAgICAgICBgJHtVSS5TdHlsZS5URVhUX0RJTX1CdWZmZXJpbmcgcmVzcG9uc2UuLi4ke1VJLlN0eWxlLlRFWFRfTk9STUFMfWAsXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICByZXNwb25zZSA9IGF3YWl0IG9wZW5TZXNzaW9uLnNlbmRNZXNzYWdlKFxuICAgICAgICAgICAgICAgIFwiRXhlY3V0ZSB0aGlzIHRhc2sgYW5kIHByb3ZpZGUgYSBkZXRhaWxlZCByZXN1bHQgc3VtbWFyeS5cIixcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIFVJLnByaW50bG4oKTtcbiAgICAgICAgICAgIFVJLnByaW50bG4ocmVzcG9uc2UuY29udGVudCk7XG4gICAgICAgIH1cblxuICAgICAgICBVSS5wcmludGxuKCk7XG4gICAgICAgIFVJLnN1Y2Nlc3MoXCJFeGVjdXRpb24gY29tcGxldGVcIik7XG5cbiAgICAgICAgLy8gQ2xlYW51cCByZXNvdXJjZXNcbiAgICAgICAgaWYgKGFjdGl2ZUNsaWVudCkge1xuICAgICAgICAgICAgYXdhaXQgYWN0aXZlQ2xpZW50LmNsZWFudXAoKTtcbiAgICAgICAgICAgIGFjdGl2ZUNsaWVudCA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBsb2cuaW5mbyhcIkV4ZWN1dGlvbiBjb21wbGV0ZVwiKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBzLnN0b3AoXCJDb25uZWN0aW9uIGZhaWxlZFwiKTtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgbG9nLmVycm9yKFwiRXhlY3V0aW9uIGZhaWxlZFwiLCB7IGVycm9yOiBtZXNzYWdlIH0pO1xuICAgICAgICBVSS5lcnJvcihtZXNzYWdlKTtcblxuICAgICAgICAvLyBFbnN1cmUgY2xlYW51cCBvbiBlcnJvclxuICAgICAgICBpZiAoYWN0aXZlQ2xpZW50KSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGF3YWl0IGFjdGl2ZUNsaWVudC5jbGVhbnVwKCk7XG4gICAgICAgICAgICB9IGNhdGNoIChjbGVhbnVwRXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjbGVhbnVwTXNnID1cbiAgICAgICAgICAgICAgICAgICAgY2xlYW51cEVycm9yIGluc3RhbmNlb2YgRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgID8gY2xlYW51cEVycm9yLm1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIDogU3RyaW5nKGNsZWFudXBFcnJvcik7XG4gICAgICAgICAgICAgICAgbG9nLmVycm9yKFwiRXJyb3IgZHVyaW5nIGVycm9yIGNsZWFudXBcIiwgeyBlcnJvcjogY2xlYW51cE1zZyB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFjdGl2ZUNsaWVudCA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgfVxuXG4gICAgb3V0cm8oXCJEb25lIVwiKTtcbn1cbiIKICBdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQUVBLElBQU0sTUFBTTtBQUFBLEVBQ1osSUFBTSxNQUFNLEdBQUc7QUFBQSxFQUNmLElBQU0sT0FBTztBQUFBLEVBRWIsSUFBTSxTQUFTO0FBQUEsSUFDYixFQUFFLENBQUMsR0FBRyxHQUFHO0FBQUEsTUFDUCxJQUFJLENBQUM7QUFBQSxRQUFHLE9BQU8sR0FBRyxNQUFNLElBQUk7QUFBQSxNQUM1QixPQUFPLEdBQUcsTUFBTSxJQUFJLEtBQUssSUFBSTtBQUFBO0FBQUEsSUFFL0IsSUFBSSxDQUFDLEdBQUcsR0FBRztBQUFBLE1BQ1QsSUFBSSxNQUFNO0FBQUEsTUFFVixJQUFJLElBQUk7QUFBQSxRQUFHLE9BQU8sR0FBRyxNQUFNLENBQUM7QUFBQSxNQUN2QixTQUFJLElBQUk7QUFBQSxRQUFHLE9BQU8sR0FBRyxNQUFNO0FBQUEsTUFFaEMsSUFBSSxJQUFJO0FBQUEsUUFBRyxPQUFPLEdBQUcsTUFBTSxDQUFDO0FBQUEsTUFD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QUEsRUFBQyxPQUFPLEtBQUcsRUFBRSxjQUFZLE9BQU8sVUFBVSxlQUFlLEtBQUssR0FBRSxTQUFTLElBQUUsRUFBRSxVQUFRO0FBQUE7QUFBRSxJQUFJLElBQUUsRUFBQyxTQUFRLENBQUMsRUFBQztBQUFBLENBQUcsUUFBUSxDQUFDLEdBQUU7QUFBQSxFQUFDLElBQUksSUFBRSxDQUFDO0FBQUEsRUFBRSxFQUFFLFVBQVEsR0FBRSxFQUFFLGlCQUFlLFFBQVEsQ0FBQyxHQUFFO0FBQUEsSUFBQyxJQUFJLElBQUUsRUFBRSxXQUFXLENBQUMsR0FBRSxJQUFFLEVBQUUsVUFBUSxJQUFFLEVBQUUsV0FBVyxDQUFDLElBQUUsR0FBRSxJQUFFO0FBQUEsSUFBRSxPQUFPLFNBQU8sS0FBRyxLQUFHLFNBQU8sU0FBTyxLQUFHLEtBQUcsVUFBUSxLQUFHLE1BQUssS0FBRyxNQUFLLElBQUUsS0FBRyxLQUFHLEdBQUUsS0FBRyxRQUFPLEtBQUcsU0FBTyxTQUFPLEtBQUcsS0FBRyxTQUFPLFNBQU8sS0FBRyxLQUFHLFFBQU0sTUFBSSxLQUFHLFFBQU0sU0FBTyxLQUFHLEtBQUcsU0FBTyxTQUFPLEtBQUcsS0FBRyxTQUFPLFNBQU8sS0FBRyxLQUFHLFNBQU8sU0FBTyxLQUFHLEtBQUcsU0FBTyxTQUFPLEtBQUcsS0FBRyxTQUFPLFNBQU8sS0FBRyxLQUFHLFFBQU0sTUFBSSxRQUFNLEtBQUcsS0FBRyxRQUFNLFFBQU0sS0FBRyxLQUFHLFFBQU0sUUFBTSxLQUFHLEtBQUcsUUFBTSxRQUFNLEtBQUcsS0FBRyxRQUFNLFNBQU8sS0FBRyxLQUFHLFNBQU8sU0FBTyxLQUFHLEtBQUcsU0FBTyxTQUFPLEtBQUcsS0FBRyxTQUFPLFNBQU8sS0FBRyxLQUFHLFNBQU8sU0FBTyxLQUFHLEtBQUcsU0FBTyxTQUFPLEtBQUcsS0FBRyxTQUFPLFNBQU8sS0FBRyxLQUFHLFNBQU8sU0FBTyxLQUFHLEtBQUcsU0FBTyxTQUFPLEtBQUcsS0FBRyxTQUFPLFNBQU8sS0FBRyxLQUFHLFNBQU8sU0FBTyxLQUFHLEtBQUcsU0FBTyxTQUFPLEtBQUcsS0FBRyxTQUFPLFNBQU8sS0FBRyxLQUFHLFNBQU8sU0FBTyxLQUFHLEtBQUcsU0FBTyxTQUFPLEtBQUcsS0FBRyxTQUFPLFNBQU8sS0FBRyxLQUFHLFNBQU8sU0FBTyxLQUFHLEtBQUcsU0FBTyxTQUFPLEtBQUcsS0FBRyxTQUFPLFNBQU8sS0FBRyxLQUFHLFNBQU8sU0FBTyxLQUFHLEtBQUcsU0FBTyxTQUFPLEtBQUcsS0FBRyxTQUFPLFNBQU8sS0FBRyxLQUFHLFNBQU8sU0FBTyxLQUFHLEtBQUcsU0FBTyxTQUFPLEtBQUcsS0FBRyxTQUFPLFNBQU8sS0FBRyxLQUFHLFNBQU8sU0FBTyxLQUFHLEtBQUcsU0FBTyxVQUFRLEtBQUcsS0FBRyxVQUFRLFVBQVEsS0FBRyxLQUFHLFVBQVEsVUFBUSxLQUFHLEtBQUcsVUFBUSxVQUFRLEtBQUcsS0FBRyxVQUFRLFVBQVEsS0FBRyxLQUFHLFVBQVEsVUFBUSxLQUFHLEtBQUcsVUFBUSxVQUFRLEtBQUcsS0FBRyxVQUFRLFVBQVEsS0FBRyxLQUFHLFNBQU8sTUFBSSxNQUFJLEtBQUcsS0FBRyxPQUFLLE9BQUssS0FBRyxLQUFHLE9BQUssT0FBSyxLQUFHLEtBQUcsT0FBSyxLQUFHLE9BQUssS0FBRyxPQUFLLFNBQU8sS0FBRyxLQUFHLFNBQU8sU0FBTyxLQUFHLEtBQUcsUUFBTSxPQUFLLEtBQUcsT0FBSyxLQUFHLE9BQUssT0FBSyxLQUFHLEtBQUcsT0FBSyxLQUFHLE9BQUssT0FBSyxLQUFHLEtBQUcsT0FBSyxPQUFLLEtBQUcsS0FBRyxPQUFLLE9BQUssS0FBRyxLQUFHLE9BQUssT0FBSyxLQUFHLEtBQUcsT0FBSyxLQUFHLE9BQUssS0FBRyxPQUFLLE9BQUssS0FBRyxLQUFHLE9BQUssT0FBSyxLQUFHLEtBQUcsT0FBSyxLQUFHLE9BQUssT0FBSyxLQUFHLEtBQUcsT0FBSyxPQUFLLEtBQUcsS0FBRyxPQUFLLEtBQUcsT0FBSyxPQUFLLEtBQUcsS0FBRyxPQUFLLE9BQUssS0FBRyxLQUFHLE9BQUssS0FBRyxPQUFLLEtBQUcsT0FBSyxLQUFHLE9BQUssS0FBRyxPQUFLLEtBQUcsT0FBSyxLQUFHLE9BQUssT0FBSyxLQUFHLEtBQUcsT0FBSyxLQUFHLE9BQUssT0FBSyxLQUFHLEtBQUcsT0FBSyxLQUFHLE9BQUssT0FBSyxLQUFHLEtBQUcsT0FBSyxLQUFHLE9BQUssT0FBSyxLQUFHLEtBQUcsT0FBSyxLQUFHLE9BQUssT0FBSyxLQUFHLEtBQUcsT0FBSyxPQUFLLEtBQUcsS0FBRyxPQUFLLEtBQUcsT0FBSyxLQUFHLE9BQUssS0FBRyxPQUFLLEtBQUcsT0FBSyxLQUFHLE9BQUssS0FBRyxPQUFLLEtBQUcsT0FBSyxLQUFHLE9BQUssS0FBRyxPQUFLLEtBQUcsT0FBSyxLQUFHLE9BQUssS0FBRyxPQUFLLEtBQUcsT0FBSyxPQUFLLEtBQUcsS0FBRyxPQUFLLEtBQUcsT0FBSyxLQUFHLE9BQUssT0FBSyxLQUFHLEtBQUcsT0FBSyxLQUFHLE9BQUssS0FBRyxPQUFLLE9BQUssS0FBRyxLQUFHLE9BQUssT0FBSyxLQUFHLEtBQUcsT0FBSyxPQUFLLEtBQUcsS0FBRyxPQUFLLE9BQUssS0FBRyxLQUFHLE9BQUssT0FBSyxLQUFHLEtBQUcsT0FBSyxLQUFHLFFBQU0sUUFBTSxLQUFHLEtBQUcsUUFBTSxLQUFHLFFBQU0sS0FBRyxRQUFNLFFBQU0sS0FBRyxLQUFHLFFBQU0sUUFBTSxLQUFHLEtBQUcsUUFBTSxRQUFNLEtBQUcsS0FBRyxRQUFNLFFBQU0sS0FBRyxLQUFHLFFBQU0sUUFBTSxLQUFHLEtBQUcsUUFBTSxLQUFHLFFBQU0sUUFBTSxLQUFHLEtBQUcsUUFBTSxLQUFHLFFBQU0sS0FBRyxRQUFNLEtBQUcsUUFBTSxLQUFHLFFBQU0sS0FBRyxRQUFNLFFBQU0sS0FBRyxLQUFHLFFBQU0sS0FBRyxRQUFNLEtBQUcsUUFBTSxLQUFHLFFBQU0sS0FBRyxRQUFNLEtBQUcsUUFBTSxLQUFHLFFBQU0sUUFBTSxLQUFHLEtBQUcsUUFBTSxLQUFHLFFBQU0sS0FBRyxRQUFNLFFBQU0sS0FBRyxLQUFHLFFBQU0sUUFBTSxLQUFHLEtBQUcsUUFBTSxRQUFNLEtBQUcsS0FBRyxRQUFNLFFBQU0sS0FBRyxLQUFHLFFBQU0sS0FBRyxRQUFNLFFBQU0sS0FBRyxLQUFHLFFBQU0sUUFBTSxLQUFHLEtBQUcsUUFBTSxLQUFHLFFBQU0sS0FBRyxRQUFNLEtBQUcsUUFBTSxLQUFHLFFBQU0sUUFBTSxLQUFHLEtBQUcsUUFBTSxRQUFNLEtBQUcsS0FBRyxRQUFNLEtBQUcsUUFBTSxLQUFHLFFBQU0sS0FBRyxRQUFNLEtBQUcsUUFBTSxLQUFHLFFBQU0sUUFBTSxLQUFHLEtBQUcsUUFBTSxLQUFHLFFBQU0sS0FBRyxRQUFNLFFBQU0sS0FBRyxLQUFHLFFBQU0sS0FBRyxRQUFNLFFBQU0sS0FBRyxLQUFHLFFBQU0sUUFBTSxLQUFHLEtBQUcsUUFBTSxLQUFHLFFBQU0sS0FBRyxRQUFNLEtBQUcsUUFBTSxRQUFNLEtBQUcsS0FBRyxRQUFNLFFBQU0sS0FBRyxLQUFHLFFBQU0sUUFBTSxLQUFHLEtBQUcsUUFBTSxRQUFNLEtBQUcsS0FBRyxRQUFNLFFBQU0sS0FBRyxLQUFHLFFBQU0sUUFBTSxLQUFHLEtBQUcsUUFBTSxLQUFHLFFBQU0sS0FBRyxRQUFNLEtBQUcsUUFBTSxLQUFHLFFBQU0sS0FBRyxRQUFNLFFBQU0sS0FBRyxLQUFHLFFBQU0sUUFBTSxLQUFHLEtBQUcsUUFBTSxRQUFNLEtBQUcsS0FBRyxRQUFNLFFBQU0sS0FBRyxLQUFHLFFBQU0sUUFBTSxLQUFHLEtBQUcsUUFBTSxRQUFNLEtBQUcsS0FBRyxRQUFNLFFBQU0sS0FBRyxLQUFHLFFBQU0sUUFBTSxLQUFHLEtBQUcsUUFBTSxRQUFNLEtBQUcsS0FBRyxRQUFNLFFBQU0sS0FBRyxLQUFHLFFBQU0sUUFBTSxLQUFHLEtBQUcsUUFBTSxRQUFNLEtBQUcsS0FBRyxRQUFNLEtBQUcsUUFBTSxRQUFNLEtBQUcsS0FBRyxRQUFNLFFBQU0sS0FBRyxLQUFHLFFBQU0sS0FBRyxRQUFNLFFBQU0sS0FBRyxLQUFHLFFBQU0sS0FBRyxRQUFNLFFBQU0sS0FBRyxLQUFHLFFBQU0sUUFBTSxLQUFHLEtBQUcsUUFBTSxLQUFHLFFBQU0sS0FBRyxRQUFNLEtBQUcsUUFBTSxLQUFHLFFBQU0sUUFBTSxLQUFHLEtBQUcsUUFBTSxRQUFNLEtBQUcsS0FBRyxRQUFNLFFBQU0sS0FBRyxLQUFHLFFBQU0sUUFBTSxLQUFHLEtBQUcsUUFBTSxLQUFHLFFBQU0sUUFBTSxLQUFHLEtBQUcsUUFBTSxRQUFNLEtBQUcsS0FBRyxRQUFNLFFBQU0sS0FBRyxLQUFHLFFBQU0sUUFBTSxLQUFHLEtBQUcsUUFBTSxLQUFHLFFBQU0sUUFBTSxLQUFHLEtBQUcsUUFBTSxLQUFHLFNBQU8sS0FBRyxTQUFPLFNBQU8sS0FBRyxLQUFHLFNBQU8sU0FBTyxLQUFHLEtBQUcsU0FBTyxTQUFPLEtBQUcsS0FBRyxTQUFPLFNBQU8sS0FBRyxLQUFHLFNBQU8sU0FBTyxLQUFHLEtBQUcsU0FBTyxLQUFHLFNBQU8sVUFBUSxLQUFHLEtBQUcsVUFBUSxVQUFRLEtBQUcsS0FBRyxVQUFRLFVBQVEsS0FBRyxLQUFHLFVBQVEsVUFBUSxLQUFHLEtBQUcsVUFBUSxVQUFRLEtBQUcsS0FBRyxVQUFRLFVBQVEsS0FBRyxLQUFHLFdBQVMsV0FBUyxLQUFHLEtBQUcsVUFBUSxNQUFJO0FBQUEsS0FBSyxFQUFFLGtCQUFnQixRQUFRLENBQUMsR0FBRTtBQUFBLElBQUMsSUFBSSxJQUFFLEtBQUssZUFBZSxDQUFDO0FBQUEsSUFBRSxPQUFPLEtBQUcsT0FBSyxLQUFHLE9BQUssS0FBRyxNQUFJLElBQUU7QUFBQTtBQUFBLEVBQUcsU0FBUyxDQUFDLENBQUMsR0FBRTtBQUFBLElBQUMsT0FBTyxFQUFFLE1BQU0sa0RBQWtELEtBQUcsQ0FBQztBQUFBO0FBQUEsRUFBRSxFQUFFLFNBQU8sUUFBUSxDQUFDLEdBQUU7QUFBQSxJQUFDLFNBQVEsSUFBRSxFQUFFLENBQUMsR0FBRSxJQUFFLEdBQUUsSUFBRSxFQUFFLElBQUUsRUFBRSxRQUFPO0FBQUEsTUFBSSxJQUFFLElBQUUsS0FBSyxnQkFBZ0IsRUFBRSxFQUFFO0FBQUEsSUFBRSxPQUFPO0FBQUEsS0FBRyxFQUFFLFFBQU0sUUFBUSxDQUFDLEdBQUUsR0FBRSxHQUFFO0FBQUEsSUFBQyxVQUFRLEVBQUUsT0FBTyxDQUFDLEdBQUUsSUFBRSxLQUFHLEdBQUUsSUFBRSxLQUFHLEdBQUUsSUFBRSxNQUFJLElBQUUsVUFBUSxJQUFHLElBQUUsTUFBSSxJQUFFLFVBQVE7QUFBQSxJQUFHLFNBQVEsSUFBRSxJQUFHLElBQUUsR0FBRSxJQUFFLEVBQUUsQ0FBQyxHQUFFLElBQUUsRUFBRSxJQUFFLEVBQUUsUUFBTyxLQUFJO0FBQUEsTUFBQyxJQUFJLElBQUUsRUFBRSxJQUFHLElBQUUsRUFBRSxPQUFPLENBQUM7QUFBQSxNQUFFLElBQUcsS0FBRyxLQUFHLEtBQUcsSUFBRSxJQUFFO0FBQUEsUUFBRyxJQUFHLElBQUUsS0FBRztBQUFBLFVBQUUsS0FBRztBQUFBLFFBQU87QUFBQTtBQUFBLE1BQU0sS0FBRztBQUFBLElBQUM7QUFBQSxJQUFDLE9BQU87QUFBQTtBQUFBLEdBQUssQ0FBQztBQUFFLElBQUksS0FBRyxFQUFFO0FBQVEsSUFBTSxLQUFHLEVBQUUsRUFBRTtBQUFFLElBQUksS0FBRyxRQUFRLEdBQUU7QUFBQSxFQUFDLE9BQU07QUFBQTtBQUFreWUsSUFBTSxLQUFHLEVBQUUsRUFBRTtBQUFFLFNBQVMsQ0FBQyxDQUFDLEdBQUUsSUFBRSxDQUFDLEdBQUU7QUFBQSxFQUFDLElBQUcsT0FBTyxLQUFHLFlBQVUsRUFBRSxXQUFTLE1BQUksSUFBRSxFQUFDLG1CQUFrQixTQUFNLEVBQUMsR0FBRSxJQUFFLEVBQUUsQ0FBQyxHQUFFLEVBQUUsV0FBUztBQUFBLElBQUcsT0FBTztBQUFBLEVBQUUsSUFBRSxFQUFFLFFBQVEsR0FBRyxHQUFFLElBQUk7QUFBQSxFQUFFLE1BQU0sSUFBRSxFQUFFLG9CQUFrQixJQUFFO0FBQUEsRUFBRSxJQUFJLElBQUU7QUFBQSxFQUFFLFdBQVUsS0FBSyxHQUFFO0FBQUEsSUFBQyxNQUFNLElBQUUsRUFBRSxZQUFZLENBQUM7QUFBQSxJQUFFLElBQUcsS0FBRyxNQUFJLEtBQUcsT0FBSyxLQUFH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LElBQUUsS0FBSSxLQUFHO0FBQUEsSUFBRSxFQUFFLFdBQVMsTUFBSSxJQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxPQUFHLElBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRTtBQUFBLElBQUcsTUFBTSxJQUFFLE9BQU8sU0FBUyxHQUFFLEVBQUU7QUFBQSxJQUFFLE9BQU0sQ0FBQyxLQUFHLEtBQUcsS0FBSSxLQUFHLElBQUUsS0FBSSxJQUFFLEdBQUc7QUFBQSxLQUFHLFlBQVcsTUFBRSxHQUFFLGNBQWEsRUFBQyxPQUFNLE9BQUcsRUFBRSxhQUFhLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQyxHQUFFLFlBQVcsTUFBRSxHQUFFLGVBQWMsRUFBQyxPQUFNLE9BQUc7QUFBQSxJQUFDLElBQUcsSUFBRTtBQUFBLE1BQUUsT0FBTyxLQUFHO0FBQUEsSUFBRSxJQUFHLElBQUU7QUFBQSxNQUFHLE9BQU8sTUFBSSxJQUFFO0FBQUEsSUFBRyxJQUFJLEdBQUUsR0FBRTtBQUFBLElBQUUsSUFBRyxLQUFHO0FBQUEsTUFBSSxNQUFJLElBQUUsT0FBSyxLQUFHLEtBQUcsS0FBSSxJQUFFLEdBQUUsSUFBRTtBQUFBLElBQU07QUFBQSxNQUFDLEtBQUc7QUFBQSxNQUFHLE1BQU0sSUFBRSxJQUFFO0FBQUEsTUFBRyxJQUFFLEtBQUssTUFBTSxJQUFFLEVBQUUsSUFBRSxHQUFFLElBQUUsS0FBSyxNQUFNLElBQUUsQ0FBQyxJQUFFLEdBQUUsSUFBRSxJQUFFLElBQUU7QUFBQTtBQUFBLElBQUUsTUFBTSxJQUFFLEtBQUssSUFBSSxHQUFFLEdBQUUsQ0FBQyxJQUFFO0FBQUEsSUFBRSxJQUFHLE1BQUk7QUFBQSxNQUFFLE9BQU87QUFBQSxJQUFHLElBQUksSUFBRSxNQUFJLEtBQUssTUFBTSxDQUFDLEtBQUcsSUFBRSxLQUFLLE1BQU0sQ0FBQyxLQUFHLElBQUUsS0FBSyxNQUFNLENBQUM7QUFBQSxJQUFHLE9BQU8sTUFBSSxNQUFJLEtBQUcsS0FBSTtBQUFBLEtBQUcsWUFBVyxNQUFFLEdBQUUsV0FBVSxFQUFD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QUFJLElBQUUsRUFBRSxFQUFFLEVBQUUsU0FBTyxFQUFFO0FBQUEsSUFBRSxJQUFHLE1BQUksTUFBSSxLQUFHLE1BQUksRUFBRSxhQUFXLFNBQUksRUFBRSxTQUFPLFdBQU0sRUFBRSxLQUFLLEVBQUUsR0FBRSxJQUFFLEtBQUksSUFBRSxLQUFHLEVBQUUsU0FBTyxXQUFNLEVBQUUsRUFBRSxTQUFPLE1BQUksS0FBSSxPQUFNLEVBQUUsUUFBTSxFQUFFLEtBQUcsR0FBRTtBQUFBLE1BQUMsTUFBTSxJQUFFLElBQUUsR0FBRSxJQUFFLElBQUUsS0FBSyxPQUFPLEVBQUUsS0FBRyxJQUFFLEtBQUcsQ0FBQztBQUFBLE1BQUUsS0FBSyxPQUFPLEVBQUUsS0FBRyxLQUFHLENBQUMsSUFBRSxLQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUUsRUFBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLE1BQUU7QUFBQSxJQUFRO0FBQUEsSUFBQyxJQUFHLElBQUUsRUFBRSxLQUFHLEtBQUcsSUFBRSxLQUFHLEVBQUUsS0FBRyxHQUFFO0FBQUEsTUFBQyxJQUFHLEVBQUUsYUFBVyxTQUFJLElBQUUsR0FBRTtBQUFBLFFBQUMsRUFBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLFFBQUU7QUFBQSxNQUFRO0FBQUEsTUFBQyxFQUFFLEtBQUssRUFBRTtBQUFBLElBQUM7QUFBQSxJQUFDLElBQUcsSUFBRSxFQUFFLEtBQUcsS0FBRyxFQUFFLGFBQVcsT0FBRztBQUFBLE1BQUMsRUFBRSxHQUFFLEdBQUUsQ0FBQztBQUFBLE1BQUU7QUFBQSxJQUFRO0FBQUEsSUFBQyxFQUFFLEVBQUUsU0FBTyxNQUFJO0FBQUEsRUFBQztBQUFBLEVBQUMsRUFBRSxTQUFPLFVBQUssSUFBRSxFQUFFLElBQUksT0FBRyxHQUFHLENBQUMsQ0FBQztBQUFBLEVBQUcsTUFBTSxJQUFFLENBQUMsR0FBRyxFQUFFLEtBQUs7QUFBQSxDQUM1dHdCLENBQUM7QUFBQSxFQUFFLFlBQVUsR0FBRSxNQUFLLEVBQUUsUUFBUSxHQUFFO0FBQUEsSUFBQyxJQUFHLEtBQUcsR0FBRSxFQUFFLElBQUksQ0FBQyxHQUFFO0FBQUEsTUFBQyxRQUFNLFFBQU8sTUFBRyxJQUFJLE9BQU8sUUFBUSxxQkFBcUIsY0FBYyxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEtBQUcsRUFBQyxRQUFPLENBQUMsRUFBQztBQUFBLE1BQUUsSUFBRyxFQUFFLFNBQVksV0FBRTtBQUFBLFFBQUMsTUFBTSxJQUFFLE9BQU8sV0FBVyxFQUFFLElBQUk7QUFBQSxRQUFFLElBQUUsTUFBSSxLQUFRLFlBQUU7QUFBQSxNQUFDLEVBQU07QUFBQSxVQUFFLFFBQVcsY0FBSSxJQUFFLEVBQUUsSUFBSSxXQUFTLElBQU8sWUFBRSxFQUFFO0FBQUEsSUFBSTtBQUFBLElBQUMsTUFBTSxJQUFFLEdBQUcsTUFBTSxJQUFJLE9BQU8sQ0FBQyxDQUFDO0FBQUEsSUFBRSxFQUFFLElBQUUsT0FBSztBQUFBLEtBQzVVLE1BQUksS0FBRyxFQUFFLEVBQUUsSUFBRyxLQUFHLE1BQUksS0FBRyxFQUFFLENBQUMsTUFBSSxNQUFJO0FBQUEsTUFDbEMsS0FBRyxNQUFJLEtBQUcsRUFBRSxDQUFDLElBQUcsTUFBSSxLQUFHLEVBQUUsQ0FBQztBQUFBLEVBQUc7QUFBQSxFQUFDLE9BQU87QUFBQTtBQUFHLFNBQVMsQ0FBQyxDQUFDLEdBQUUsR0FBRSxHQUFFO0FBQUEsRUFBQyxPQUFPLE9BQU8sQ0FBQyxFQUFFLFVBQVUsRUFBRSxRQUFRLFNBQVE7QUFBQSxDQUMxRyxFQUFFLE1BQU07QUFBQSxDQUNSLEVBQUUsSUFBSSxPQUFHLEdBQUcsR0FBRSxHQUFFLENBQUMsQ0FBQyxFQUFFLEtBQUs7QUFBQSxDQUN6QjtBQUFBO0FBQUUsSUFBTSxLQUFHLENBQUMsTUFBSyxRQUFPLFFBQU8sU0FBUSxTQUFRLFNBQVEsUUFBUTtBQUE3RCxJQUErRCxJQUFFLEVBQUMsU0FBUSxJQUFJLElBQUksRUFBRSxHQUFFLFNBQVEsSUFBSSxJQUFJLENBQUMsQ0FBQyxLQUFJLElBQUksR0FBRSxDQUFDLEtBQUksTUFBTSxHQUFFLENBQUMsS0FBSSxNQUFNLEdBQUUsQ0FBQyxLQUFJLE9BQU8sR0FBRSxDQUFDLFFBQUksUUFBUSxHQUFFLENBQUMsVUFBUyxRQUFRLENBQUMsQ0FBQyxFQUFDO0FBQTJNLFNBQVMsQ0FBQyxDQUFDLEdBQUUsR0FBRTtBQUFBLEVBQUMsSUFBRyxPQUFPLEtBQUc7QUFBQSxJQUFTLE9BQU8sRUFBRSxRQUFRLElBQUksQ0FBQyxNQUFJO0FBQUEsRUFBRSxXQUFVLEtBQUs7QUFBQSxJQUFFLElBQUcsTUFBUyxhQUFHLEVBQUUsR0FBRSxDQUFDO0FBQUEsTUFBRSxPQUFNO0FBQUEsRUFBRyxPQUFNO0FBQUE7QUFBRyxTQUFTLEVBQUUsQ0FBQyxHQUFFLEdBQUU7QUFBQSxFQUFDLElBQUcsTUFBSTtBQUFBLElBQUU7QUFBQSxFQUFPLE1BQU0sSUFBRSxFQUFFLE1BQU07QUFBQSxDQUN2akIsR0FBRSxJQUFFLEVBQUUsTUFBTTtBQUFBLENBQ1osR0FBRSxJQUFFLENBQUM7QUFBQSxFQUFFLFNBQVEsSUFBRSxFQUFFLElBQUUsS0FBSyxJQUFJLEVBQUUsUUFBTyxFQUFFLE1BQU0sR0FBRTtBQUFBLElBQUksRUFBRSxPQUFLLEVBQUUsTUFBSSxFQUFFLEtBQUssQ0FBQztBQUFBLEVBQUUsT0FBTztBQUFBO0FBQUUsSUFBTSxLQUFHLFdBQVcsUUFBUSxTQUFTLFdBQVcsS0FBSztBQUFyRCxJQUF1RCxJQUFFLE9BQU8sY0FBYztBQUFFLFNBQVMsRUFBRSxDQUFDLEdBQUU7QUFBQSxFQUFDLE9BQU8sTUFBSTtBQUFBO0FBQUUsU0FBUyxDQUFDLENBQUMsR0FBRSxHQUFFO0FBQUEsRUFBQyxNQUFNLElBQUU7QUFBQSxFQUFFLEVBQUUsU0FBTyxFQUFFLFdBQVcsQ0FBQztBQUFBO0FBQUUsU0FBUyxFQUFFLEdBQUUsT0FBTSxJQUFFLEdBQUUsUUFBTyxJQUFFLEdBQUUsV0FBVSxJQUFFLE1BQUcsWUFBVyxJQUFFLFNBQUksQ0FBQyxHQUFFO0FBQUEsRUFBQyxNQUFNLElBQUksa0JBQWdCLEVBQUMsT0FBTSxHQUFFLFFBQU8sR0FBRSxRQUFPLElBQUcsU0FBUSxFQUFDLENBQUM7QUFBQSxFQUFJLHFCQUFtQixHQUFFLENBQUMsR0FBRSxFQUFFLFNBQU8sRUFBRSxXQUFXLElBQUU7QUFBQSxFQUFFLE1BQU0sSUFBRSxDQUFDLEtBQUcsTUFBSyxHQUFFLFVBQVMsUUFBSztBQUFBLElBQUMsTUFBTSxJQUFFLE9BQU8sQ0FBQztBQUFBLElBQUUsSUFBRyxFQUFFLENBQUMsR0FBRSxHQUFFLENBQUMsR0FBRSxRQUFRLEdBQUU7QUFBQSxNQUFDLEtBQUcsRUFBRSxNQUFNLHlCQUFFLElBQUksR0FBRSxRQUFRLEtBQUssQ0FBQztBQUFBLE1BQUU7QUFBQSxJQUFNO0FBQUEsSUFBQyxJQUFHLENBQUM7QUFBQSxNQUFFO0FBQUEsSUFBTyxNQUFNLElBQUUsTUFBSSxXQUFTLElBQUUsSUFBRyxJQUFFLE1BQUksV0FBUyxLQUFHO0FBQUEsSUFBSSxhQUFXLEdBQUUsR0FBRSxHQUFFLE1BQUk7QUFBQSxNQUFHLFlBQVUsR0FBRSxHQUFFLE1BQUk7QUFBQSxRQUFDLEVBQUUsS0FBSyxZQUFXLENBQUM7QUFBQSxPQUFFO0FBQUEsS0FBRTtBQUFBO0FBQUEsRUFBRyxPQUFPLEtBQUcsRUFBRSxNQUFNLHlCQUFFLElBQUksR0FBRSxFQUFFLEtBQUssWUFBVyxDQUFDLEdBQUUsTUFBSTtBQUFBLElBQUMsRUFBRSxJQUFJLFlBQVcsQ0FBQyxHQUFFLEtBQUcsRUFBRSxNQUFNLHlCQUFFLElBQUksR0FBRSxFQUFFLFNBQU8sQ0FBQyxNQUFJLEVBQUUsV0FBVyxLQUFFLEdBQUUsRUFBRSxXQUFTLE9BQUcsRUFBRSxNQUFNO0FBQUE7QUFBQTtBQUFHLElBQUksS0FBRyxPQUFPO0FBQWQsSUFBNkIsS0FBRyxDQUFDLEdBQUUsR0FBRSxPQUFJLEtBQUssS0FBRSxHQUFHLEdBQUUsR0FBRSxFQUFDLFlBQVcsTUFBRyxjQUFhLE1BQUcsVUFBUyxNQUFHLE9BQU0sRUFBQyxDQUFDLElBQUUsRUFBRSxLQUFHO0FBQWpILElBQW1ILElBQUUsQ0FBQyxHQUFFLEdBQUUsT0FBSyxHQUFHLEdBQUUsT0FBTyxLQUFHLFdBQVMsSUFBRSxLQUFHLEdBQUUsQ0FBQyxHQUFFO0FBQUE7QUFBRyxNQUFNLEVBQUM7QUFBQSxFQUFDLFdBQVcsQ0FBQyxHQUFFLElBQUUsTUFBRztBQUFBLElBQUMsRUFBRSxNQUFLLE9BQU8sR0FBRSxFQUFFLE1BQUssUUFBUSxHQUFFLEVBQUUsTUFBSyxjQUFjLEdBQUUsRUFBRSxNQUFLLElBQUksR0FBRSxFQUFFLE1BQUssTUFBTSxHQUFFLEVBQUUsTUFBSyxTQUFTLEdBQUUsRUFBRSxNQUFLLFVBQVMsS0FBRSxHQUFFLEVBQUUsTUFBSyxjQUFhLEVBQUUsR0FBRSxFQUFFLE1BQUssZ0JBQWUsSUFBSSxHQUFHLEdBQUUsRUFBRSxNQUFLLFdBQVUsQ0FBQyxHQUFFLEVBQUUsTUFBSyxTQUFRLFNBQVMsR0FBRSxFQUFFLE1BQUssU0FBUSxFQUFFLEdBQUUsRUFBRSxNQUFLLE9BQU87QUFBQSxJQUFFLFFBQU0sT0FBTSxJQUFFLEdBQUUsUUFBTyxJQUFFLEdBQUUsUUFBTyxHQUFFLFFBQU8sTUFBSyxNQUFHO0FBQUEsSUFBRSxLQUFLLE9BQUssR0FBRSxLQUFLLGFBQVcsS0FBSyxXQUFXLEtBQUssSUFBSSxHQUFFLEtBQUssUUFBTSxLQUFLLE1BQU0sS0FBSyxJQUFJLEdBQUUsS0FBSyxTQUFPLEtBQUssT0FBTyxLQUFLLElBQUksR0FBRSxLQUFLLFVBQVEsRUFBRSxLQUFLLElBQUksR0FBRSxLQUFLLFNBQU8sR0FBRSxLQUFLLGVBQWEsR0FBRSxLQUFLLFFBQU0sR0FBRSxLQUFLLFNBQU87QUFBQTtBQUFBLEVBQUUsV0FBVyxHQUFFO0FBQUEsSUFBQyxLQUFLLGFBQWEsTUFBTTtBQUFBO0FBQUEsRUFBRSxhQUFhLENBQUMsR0FBRSxHQUFFO0FBQUEsSUFBQyxNQUFNLElBQUUsS0FBSyxhQUFhLElBQUksQ0FBQyxLQUFHLENBQUM7QUFBQSxJQUFFLEVBQUUsS0FBSyxDQUFDLEdBQUUsS0FBSyxhQUFhLElBQUksR0FBRSxDQUFD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QUssVUFBUyxFQUFFLElBQUksSUFBRyxNQUFJLEVBQUUsWUFBWSxNQUFJLE9BQUssRUFBRSxZQUFZLE1BQUksUUFBTSxLQUFLLEtBQUssV0FBVSxFQUFFLFlBQVksTUFBSSxHQUFHLEdBQUUsTUFBSSxRQUFLLEtBQUssS0FBSyxnQkFBYyxLQUFLLFVBQVEsS0FBSyxJQUFJLE1BQU0sS0FBSyxLQUFLLFdBQVcsR0FBRSxLQUFLLEtBQUssU0FBUSxLQUFLLEtBQUssV0FBVyxLQUFJLEtBQUcsS0FBSyxLQUFLLE9BQU0sRUFBRSxZQUFZLENBQUMsR0FBRSxHQUFHLFNBQU8sVUFBUztBQUFBLE1BQUMsSUFBRyxLQUFLLEtBQUssVUFBUztBQUFBLFFBQUMsTUFBTSxJQUFFLEtBQUssS0FBSyxTQUFTLEtBQUssS0FBSztBQUFBLFFBQUUsTUFBSSxLQUFLLFFBQU0sYUFBYSxRQUFNLEVBQUUsVUFBUSxHQUFFLEtBQUssUUFBTSxTQUFRLEtBQUssSUFBSSxNQUFNLEtBQUssS0FBSztBQUFBLE1BQUU7QUFBQSxNQUFDLEtBQUssVUFBUSxZQUFVLEtBQUssUUFBTTtBQUFBLElBQVM7QUFBQSxJQUFDLEVBQUUsQ0FBQyxHQUFFLEdBQUcsTUFBSyxHQUFHLFFBQVEsR0FBRSxRQUFRLE1BQUksS0FBSyxRQUFNLFlBQVcsS0FBSyxVQUFRLFlBQVUsS0FBSyxVQUFRLGFBQVcsS0FBSyxLQUFLLFVBQVUsR0FBRSxLQUFLLE9BQU8sSUFBRyxLQUFLLFVBQVEsWUFBVSxLQUFLLFVBQVEsYUFBVyxLQUFLLE1BQU07QUFBQTtBQUFBLEVBQUUsS0FBSyxHQUFFO0FBQUEsSUFBQyxLQUFLLE1BQU0sT0FBTyxHQUFFLEtBQUssTUFBTSxlQUFlLFlBQVcsS0FBSyxVQUFVLEdBQUUsS0FBSyxPQUFPLE1BQU07QUFBQSxDQUM5eUgsR0FBRSxFQUFFLEtBQUssT0FBTSxLQUFFLEdBQUUsS0FBSyxJQUFJLE1BQU0sR0FBRSxLQUFLLEtBQVEsV0FBRSxLQUFLLEtBQUssR0FBRyxLQUFLLFNBQVEsS0FBSyxLQUFLLEdBQUUsS0FBSyxZQUFZ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QUFBLElBQUUsT0FBTyxLQUFFLElBQUUsSUFBSSxPQUFNLFNBQU0sSUFBSTtBQUFBLEtBQU8sSUFBRSxDQUFDLEtBQUUsT0FBSztBQUFBLElBQUMsSUFBRSxNQUFHLElBQUUsR0FBRyxHQUFFLEtBQUUsR0FBRSxFQUFDLEdBQUUsS0FBRSxZQUFZLElBQUksR0FBRSxRQUFRLE9BQU8sTUFBTSxHQUFHLDBCQUFFLEtBQUssQ0FBQztBQUFBLENBQzFUO0FBQUEsSUFBRSxJQUFJLEtBQUUsR0FBRSxLQUFFO0FBQUEsSUFBRSxHQUFFLEdBQUUsSUFBRSxZQUFZLE1BQUk7QUFBQSxNQUFDLElBQUcsS0FBRyxPQUFJO0FBQUEsUUFBRTtBQUFBLE1BQU8sR0FBRSxHQUFFLEtBQUU7QUFBQSxNQUFFLE1BQU0sS0FBRSwwQkFBRSxRQUFRLEVBQUUsR0FBRTtBQUFBLE1BQUUsSUFBRztBQUFBLFFBQUUsUUFBUSxPQUFPLE1BQU0sR0FBRyxPQUFNLE9BQU07QUFBQSxNQUFPLFNBQUcsTUFBSTtBQUFBLFFBQVEsUUFBUSxPQUFPLE1BQU0sR0FBRyxPQUFNLE1BQUssR0FBRSxFQUFDLEdBQUc7QUFBQSxNQUFNO0FBQUEsUUFBQyxNQUFNLEtBQUUsSUFBSSxPQUFPLEtBQUssTUFBTSxFQUFDLENBQUMsRUFBRSxNQUFNLEdBQUUsQ0FBQztBQUFBLFFBQUUsUUFBUSxPQUFPLE1BQU0sR0FBRyxPQUFNLEtBQUksSUFBRztBQUFBO0FBQUEsTUFBRSxLQUFFLEtBQUUsSUFBRSxFQUFFLFNBQU8sS0FBRSxJQUFFLEdBQUUsS0FBRSxLQUFFLEVBQUUsU0FBTyxLQUFFLFFBQUs7QUFBQSxPQUFHLEVBQUM7QUFBQSxLQUFHLEtBQUUsQ0FBQyxLQUFFLElBQUcsS0FBRSxNQUFJO0FBQUEsSUFBQyxJQUFFLE9BQUcsY0FBYyxDQUFDLEdBQUUsR0FBRTtBQUFBLElBQUUsTUFBTSxLQUFFLE9BQUksSUFBRSwwQkFBRSxNQUFNLENBQUMsSUFBRSxPQUFJLElBQUUsMEJBQUUsSUFBSSxFQUFDLElBQUUsMEJBQUUsSUFBSSxFQUFDO0FBQUEs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QUFDO0FBQUE7QUFBQSxFQUtMLElBQUksQ0FBQyxTQUFTO0FBQUEsSUFDVixRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsS0FBSztBQUFBLE1BQ3pDLEtBQUs7QUFBQSxTQUNGO0FBQUEsTUFDSCxTQUFTO0FBQUEsUUFDTCxnQkFBZ0I7QUFBQSxXQUNiLFFBQVE7QUFBQSxNQUNmO0FBQUEsSUFDSixDQUFDO0FBQUE7QUFBQSxFQUtMLElBQUksQ0FBQyxTQUFTO0FBQUEsSUFDVixRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsS0FBSztBQUFBLE1BQ3pDLEtBQUs7QUFBQSxTQUNGO0FBQUEsTUFDSCxTQUFTO0FBQUEsUUFDTCxnQkFBZ0I7QUFBQSxXQUNiLFFBQVE7QUFBQSxNQUNmO0FBQUEsSUFDSixDQUFDO0FBQUE7QUFBQSxFQUtMLEtBQUssQ0FBQyxTQUFTO0FBQUEsSUFDWCxRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsS0FBSztBQUFBLE1BQ3pDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFBQSxFQUtMLE9BQU8sQ0FBQyxTQUFTO0FBQUEsSUFDYixRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsT0FBTztBQUFBLE1BQzNDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFBQSxFQUtMLEtBQUssQ0FBQyxTQUFTO0FBQUEsSUFDWCxRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsS0FBSztBQUFBLE1BQ3pDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFBQSxFQUtMLElBQUksQ0FBQyxTQUFTO0FBQUEsSUFDVixRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsSUFBSTtBQUFBLE1BQ3hDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFBQSxFQUtMLFNBQVMsQ0FBQyxTQUFTO0FBQUEsSUFDZixRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsS0FBSztBQUFBLE1BQ3pDLEtBQUs7QUFBQSxTQUNGO0FBQUEsTUFDSCxTQUFTO0FBQUEs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QSxJQUVKLElBQUksQ0FBQyxNQUFNLFVBQVU7QUFBQSxNQUVqQixNQUFNLG9CQUFvQixNQUFNLFlBQVksa0JBQ3hDLDBEQUNKO0FBQUEsTUFFQSxJQUFHLFFBQVE7QUFBQSxNQUdYLE1BQU0sU0FBUyxrQkFBa0IsT0FBTyxVQUFVO0FBQUEsTUFDbEQsTUFBTSxVQUFVLElBQUk7QUFBQSxNQUVwQixJQUFJO0FBQUEsUUFDQSxPQUFPLE1BQU07QUFBQSxVQUNULFFBQVEsTUFBTSxVQUFVLE1BQU0sT0FBTyxLQUFLO0FBQUEsVUFDMUMsSUFBSTtBQUFBLFlBQU07QUFBQSxVQUVWLElBQUksT0FBTztBQUFBLFlBQ1AsTUFBTSxPQUFPLFFBQVEsT0FBTyxPQUFPLEVBQUUsUUFBUSxLQUFLLENBQUM7QUFBQSxZQUNuRCxJQUFHLE1BQU0sSUFBSTtBQUFBLFVBQ2pCO0FBQUEsUUFDSjtBQUFBLGdCQUNGO0FBQUEsUUFDRSxPQUFPLFlBQVk7QUFBQTtBQUFBLE1BSXZCLFdBQVcsTUFBTSxrQkFBa0I7QUFBQSxJQUN2QyxFQUFPO0FBQUEsTUFFSCxJQUFHLFFBQVE7QUFBQSxNQUNYLElBQUcsUUFDQyxHQUFHLElBQUcsTUFBTSxnQ0FBZ0MsSUFBRyxNQUFNLGFBQ3pEO0FBQUEsTUFFQSxXQUFXLE1BQU0sWUFBWSxZQUN6QiwwREFDSjtBQUFBLE1BRUEsSUFBRyxRQUFRO0FBQUEsTUFDWCxJQUFHLFFBQVEsU0FBUyxPQUFPO0FBQUE7QUFBQSxJQUcvQixJQUFHLFFBQVE7QUFBQSxJQUNYLElBQUcsUUFBUSxvQkFBb0I7QUFBQSxJQUcvQixJQUFJLGNBQWM7QUFBQSxNQUNkLE1BQU0sYUFBYSxRQUFRO0FBQUEsTUFDM0IsZUFBZTtBQUFBLElBQ25CO0FBQUEsSUFFQSxLQUFJLEtBQUssb0JBQW9CO0FBQUEsSUFDL0IsT0FBTyxPQUFPO0FBQUEsSUFDWixFQUFFLEtBQUssbUJBQW1CO0FBQUEsSUFDMUIsTUFBTSxVQUFVLGlCQUFpQixRQUFRLE1BQU0sVUFBVSxPQUFPLEtBQUs7QUFBQSxJQUNyRSxLQUFJLE1BQU0sb0JBQW9CLEVBQUUsT0FBTyxRQUFRLENBQUM7QUFBQSxJQUNoRCxJQUFHLE1BQU0sT0FBTztBQUFBLElBR2hCLElBQUksY0FBYztBQUFBLE1BQ2QsSUFBSTtBQUFBLFFBQ0EsTUFBTSxhQUFhLFFBQVE7QUFBQSxRQUM3QixPQUFPLGNBQWM7QUFBQSxRQUNuQixNQUFNLGFBQ0Ysd0JBQXdCLFFBQ2xCLGFBQWEsVUFDYixPQUFPLFlBQVk7QUFBQSxRQUM3QixLQUFJLE1BQU0sOEJBQThCLEVBQUUsT0FBTyxXQUFXLENBQUM7QUFBQTtBQUFBLE1BRWpFLGVBQWU7QUFBQSxJQUNuQjtBQUFBLElBRUEsUUFBUSxLQUFLLENBQUM7QUFBQTtBQUFBLEVBR2xCLEdBQU0sT0FBTztBQUFBOyIsCiAgImRlYnVnSWQiOiAiRUI0Q0MwNTk3NzY4QUFGOTY0NzU2RTIxNjQ3NTZFMjEiLAogICJuYW1lcyI6IFtdCn0=
