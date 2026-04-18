import { createRequire } from "node:module";
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
function __accessProp(key) {
  return this[key];
}
var __toESMCache_node;
var __toESMCache_esm;
var __toESM = (mod, isNodeMode, target) => {
  var canCache = mod != null && typeof mod === "object";
  if (canCache) {
    var cache = isNodeMode ? __toESMCache_node ??= new WeakMap : __toESMCache_esm ??= new WeakMap;
    var cached = cache.get(mod);
    if (cached)
      return cached;
  }
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: __accessProp.bind(mod, key),
        enumerable: true
      });
  if (canCache)
    cache.set(mod, to);
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __require = /* @__PURE__ */ createRequire(import.meta.url);

// node_modules/sisteransi/src/index.js
var require_src = __commonJS((exports, module) => {
  var ESC2 = "\x1B";
  var CSI2 = `${ESC2}[`;
  var beep = "\x07";
  var cursor = {
    to(x, y) {
      if (!y)
        return `${CSI2}${x + 1}G`;
      return `${CSI2}${y + 1};${x + 1}H`;
    },
    move(x, y) {
      let ret = "";
      if (x < 0)
        ret += `${CSI2}${-x}D`;
      else if (x > 0)
        ret += `${CSI2}${x}C`;
      if (y < 0)
        ret += `${CSI2}${-y}A`;
      else if (y > 0)
        ret += `${CSI2}${y}B`;
      return ret;
    },
    up: (count = 1) => `${CSI2}${count}A`,
    down: (count = 1) => `${CSI2}${count}B`,
    forward: (count = 1) => `${CSI2}${count}C`,
    backward: (count = 1) => `${CSI2}${count}D`,
    nextLine: (count = 1) => `${CSI2}E`.repeat(count),
    prevLine: (count = 1) => `${CSI2}F`.repeat(count),
    left: `${CSI2}G`,
    hide: `${CSI2}?25l`,
    show: `${CSI2}?25h`,
    save: `${ESC2}7`,
    restore: `${ESC2}8`
  };
  var scroll = {
    up: (count = 1) => `${CSI2}S`.repeat(count),
    down: (count = 1) => `${CSI2}T`.repeat(count)
  };
  var erase = {
    screen: `${CSI2}2J`,
    up: (count = 1) => `${CSI2}1J`.repeat(count),
    down: (count = 1) => `${CSI2}J`.repeat(count),
    line: `${CSI2}2K`,
    lineEnd: `${CSI2}K`,
    lineStart: `${CSI2}1K`,
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

// node_modules/isexe/windows.js
var require_windows = __commonJS((exports, module) => {
  module.exports = isexe;
  isexe.sync = sync;
  var fs = __require("fs");
  function checkPathExt(path, options) {
    var pathext = options.pathExt !== undefined ? options.pathExt : process.env.PATHEXT;
    if (!pathext) {
      return true;
    }
    pathext = pathext.split(";");
    if (pathext.indexOf("") !== -1) {
      return true;
    }
    for (var i = 0;i < pathext.length; i++) {
      var p2 = pathext[i].toLowerCase();
      if (p2 && path.substr(-p2.length).toLowerCase() === p2) {
        return true;
      }
    }
    return false;
  }
  function checkStat(stat, path, options) {
    if (!stat.isSymbolicLink() && !stat.isFile()) {
      return false;
    }
    return checkPathExt(path, options);
  }
  function isexe(path, options, cb) {
    fs.stat(path, function(er, stat) {
      cb(er, er ? false : checkStat(stat, path, options));
    });
  }
  function sync(path, options) {
    return checkStat(fs.statSync(path), path, options);
  }
});

// node_modules/isexe/mode.js
var require_mode = __commonJS((exports, module) => {
  module.exports = isexe;
  isexe.sync = sync;
  var fs = __require("fs");
  function isexe(path, options, cb) {
    fs.stat(path, function(er, stat) {
      cb(er, er ? false : checkStat(stat, options));
    });
  }
  function sync(path, options) {
    return checkStat(fs.statSync(path), options);
  }
  function checkStat(stat, options) {
    return stat.isFile() && checkMode(stat, options);
  }
  function checkMode(stat, options) {
    var mod = stat.mode;
    var uid = stat.uid;
    var gid = stat.gid;
    var myUid = options.uid !== undefined ? options.uid : process.getuid && process.getuid();
    var myGid = options.gid !== undefined ? options.gid : process.getgid && process.getgid();
    var u2 = parseInt("100", 8);
    var g = parseInt("010", 8);
    var o = parseInt("001", 8);
    var ug = u2 | g;
    var ret = mod & o || mod & g && gid === myGid || mod & u2 && uid === myUid || mod & ug && myUid === 0;
    return ret;
  }
});

// node_modules/isexe/index.js
var require_isexe = __commonJS((exports, module) => {
  var fs = __require("fs");
  var core;
  if (process.platform === "win32" || global.TESTING_WINDOWS) {
    core = require_windows();
  } else {
    core = require_mode();
  }
  module.exports = isexe;
  isexe.sync = sync;
  function isexe(path, options, cb) {
    if (typeof options === "function") {
      cb = options;
      options = {};
    }
    if (!cb) {
      if (typeof Promise !== "function") {
        throw new TypeError("callback not provided");
      }
      return new Promise(function(resolve, reject) {
        isexe(path, options || {}, function(er, is) {
          if (er) {
            reject(er);
          } else {
            resolve(is);
          }
        });
      });
    }
    core(path, options || {}, function(er, is) {
      if (er) {
        if (er.code === "EACCES" || options && options.ignoreErrors) {
          er = null;
          is = false;
        }
      }
      cb(er, is);
    });
  }
  function sync(path, options) {
    try {
      return core.sync(path, options || {});
    } catch (er) {
      if (options && options.ignoreErrors || er.code === "EACCES") {
        return false;
      } else {
        throw er;
      }
    }
  }
});

// node_modules/which/which.js
var require_which = __commonJS((exports, module) => {
  var isWindows = process.platform === "win32" || process.env.OSTYPE === "cygwin" || process.env.OSTYPE === "msys";
  var path = __require("path");
  var COLON = isWindows ? ";" : ":";
  var isexe = require_isexe();
  var getNotFoundError = (cmd) => Object.assign(new Error(`not found: ${cmd}`), { code: "ENOENT" });
  var getPathInfo = (cmd, opt) => {
    const colon = opt.colon || COLON;
    const pathEnv = cmd.match(/\//) || isWindows && cmd.match(/\\/) ? [""] : [
      ...isWindows ? [process.cwd()] : [],
      ...(opt.path || process.env.PATH || "").split(colon)
    ];
    const pathExtExe = isWindows ? opt.pathExt || process.env.PATHEXT || ".EXE;.CMD;.BAT;.COM" : "";
    const pathExt = isWindows ? pathExtExe.split(colon) : [""];
    if (isWindows) {
      if (cmd.indexOf(".") !== -1 && pathExt[0] !== "")
        pathExt.unshift("");
    }
    return {
      pathEnv,
      pathExt,
      pathExtExe
    };
  };
  var which = (cmd, opt, cb) => {
    if (typeof opt === "function") {
      cb = opt;
      opt = {};
    }
    if (!opt)
      opt = {};
    const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, opt);
    const found = [];
    const step = (i) => new Promise((resolve, reject) => {
      if (i === pathEnv.length)
        return opt.all && found.length ? resolve(found) : reject(getNotFoundError(cmd));
      const ppRaw = pathEnv[i];
      const pathPart = /^".*"$/.test(ppRaw) ? ppRaw.slice(1, -1) : ppRaw;
      const pCmd = path.join(pathPart, cmd);
      const p2 = !pathPart && /^\.[\\\/]/.test(cmd) ? cmd.slice(0, 2) + pCmd : pCmd;
      resolve(subStep(p2, i, 0));
    });
    const subStep = (p2, i, ii) => new Promise((resolve, reject) => {
      if (ii === pathExt.length)
        return resolve(step(i + 1));
      const ext = pathExt[ii];
      isexe(p2 + ext, { pathExt: pathExtExe }, (er, is) => {
        if (!er && is) {
          if (opt.all)
            found.push(p2 + ext);
          else
            return resolve(p2 + ext);
        }
        return resolve(subStep(p2, i, ii + 1));
      });
    });
    return cb ? step(0).then((res) => cb(null, res), cb) : step(0);
  };
  var whichSync = (cmd, opt) => {
    opt = opt || {};
    const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, opt);
    const found = [];
    for (let i = 0;i < pathEnv.length; i++) {
      const ppRaw = pathEnv[i];
      const pathPart = /^".*"$/.test(ppRaw) ? ppRaw.slice(1, -1) : ppRaw;
      const pCmd = path.join(pathPart, cmd);
      const p2 = !pathPart && /^\.[\\\/]/.test(cmd) ? cmd.slice(0, 2) + pCmd : pCmd;
      for (let j2 = 0;j2 < pathExt.length; j2++) {
        const cur = p2 + pathExt[j2];
        try {
          const is = isexe.sync(cur, { pathExt: pathExtExe });
          if (is) {
            if (opt.all)
              found.push(cur);
            else
              return cur;
          }
        } catch (ex) {}
      }
    }
    if (opt.all && found.length)
      return found;
    if (opt.nothrow)
      return null;
    throw getNotFoundError(cmd);
  };
  module.exports = which;
  which.sync = whichSync;
});

// node_modules/path-key/index.js
var require_path_key = __commonJS((exports, module) => {
  var pathKey = (options = {}) => {
    const environment = options.env || process.env;
    const platform = options.platform || process.platform;
    if (platform !== "win32") {
      return "PATH";
    }
    return Object.keys(environment).reverse().find((key) => key.toUpperCase() === "PATH") || "Path";
  };
  module.exports = pathKey;
  module.exports.default = pathKey;
});

// node_modules/cross-spawn/lib/util/resolveCommand.js
var require_resolveCommand = __commonJS((exports, module) => {
  var path = __require("path");
  var which = require_which();
  var getPathKey = require_path_key();
  function resolveCommandAttempt(parsed, withoutPathExt) {
    const env = parsed.options.env || process.env;
    const cwd = process.cwd();
    const hasCustomCwd = parsed.options.cwd != null;
    const shouldSwitchCwd = hasCustomCwd && process.chdir !== undefined && !process.chdir.disabled;
    if (shouldSwitchCwd) {
      try {
        process.chdir(parsed.options.cwd);
      } catch (err) {}
    }
    let resolved;
    try {
      resolved = which.sync(parsed.command, {
        path: env[getPathKey({ env })],
        pathExt: withoutPathExt ? path.delimiter : undefined
      });
    } catch (e) {} finally {
      if (shouldSwitchCwd) {
        process.chdir(cwd);
      }
    }
    if (resolved) {
      resolved = path.resolve(hasCustomCwd ? parsed.options.cwd : "", resolved);
    }
    return resolved;
  }
  function resolveCommand(parsed) {
    return resolveCommandAttempt(parsed) || resolveCommandAttempt(parsed, true);
  }
  module.exports = resolveCommand;
});

// node_modules/cross-spawn/lib/util/escape.js
var require_escape = __commonJS((exports, module) => {
  var metaCharsRegExp = /([()\][%!^"`<>&|;, *?])/g;
  function escapeCommand(arg) {
    arg = arg.replace(metaCharsRegExp, "^$1");
    return arg;
  }
  function escapeArgument(arg, doubleEscapeMetaChars) {
    arg = `${arg}`;
    arg = arg.replace(/(?=(\\+?)?)\1"/g, "$1$1\\\"");
    arg = arg.replace(/(?=(\\+?)?)\1$/, "$1$1");
    arg = `"${arg}"`;
    arg = arg.replace(metaCharsRegExp, "^$1");
    if (doubleEscapeMetaChars) {
      arg = arg.replace(metaCharsRegExp, "^$1");
    }
    return arg;
  }
  exports.command = escapeCommand;
  exports.argument = escapeArgument;
});

// node_modules/shebang-regex/index.js
var require_shebang_regex = __commonJS((exports, module) => {
  module.exports = /^#!(.*)/;
});

// node_modules/shebang-command/index.js
var require_shebang_command = __commonJS((exports, module) => {
  var shebangRegex = require_shebang_regex();
  module.exports = (string = "") => {
    const match = string.match(shebangRegex);
    if (!match) {
      return null;
    }
    const [path, argument] = match[0].replace(/#! ?/, "").split(" ");
    const binary = path.split("/").pop();
    if (binary === "env") {
      return argument;
    }
    return argument ? `${binary} ${argument}` : binary;
  };
});

// node_modules/cross-spawn/lib/util/readShebang.js
var require_readShebang = __commonJS((exports, module) => {
  var fs = __require("fs");
  var shebangCommand = require_shebang_command();
  function readShebang(command) {
    const size = 150;
    const buffer = Buffer.alloc(size);
    let fd;
    try {
      fd = fs.openSync(command, "r");
      fs.readSync(fd, buffer, 0, size, 0);
      fs.closeSync(fd);
    } catch (e) {}
    return shebangCommand(buffer.toString());
  }
  module.exports = readShebang;
});

// node_modules/cross-spawn/lib/parse.js
var require_parse = __commonJS((exports, module) => {
  var path = __require("path");
  var resolveCommand = require_resolveCommand();
  var escape = require_escape();
  var readShebang = require_readShebang();
  var isWin = process.platform === "win32";
  var isExecutableRegExp = /\.(?:com|exe)$/i;
  var isCmdShimRegExp = /node_modules[\\/].bin[\\/][^\\/]+\.cmd$/i;
  function detectShebang(parsed) {
    parsed.file = resolveCommand(parsed);
    const shebang = parsed.file && readShebang(parsed.file);
    if (shebang) {
      parsed.args.unshift(parsed.file);
      parsed.command = shebang;
      return resolveCommand(parsed);
    }
    return parsed.file;
  }
  function parseNonShell(parsed) {
    if (!isWin) {
      return parsed;
    }
    const commandFile = detectShebang(parsed);
    const needsShell = !isExecutableRegExp.test(commandFile);
    if (parsed.options.forceShell || needsShell) {
      const needsDoubleEscapeMetaChars = isCmdShimRegExp.test(commandFile);
      parsed.command = path.normalize(parsed.command);
      parsed.command = escape.command(parsed.command);
      parsed.args = parsed.args.map((arg) => escape.argument(arg, needsDoubleEscapeMetaChars));
      const shellCommand = [parsed.command].concat(parsed.args).join(" ");
      parsed.args = ["/d", "/s", "/c", `"${shellCommand}"`];
      parsed.command = process.env.comspec || "cmd.exe";
      parsed.options.windowsVerbatimArguments = true;
    }
    return parsed;
  }
  function parse(command, args, options) {
    if (args && !Array.isArray(args)) {
      options = args;
      args = null;
    }
    args = args ? args.slice(0) : [];
    options = Object.assign({}, options);
    const parsed = {
      command,
      args,
      options,
      file: undefined,
      original: {
        command,
        args
      }
    };
    return options.shell ? parsed : parseNonShell(parsed);
  }
  module.exports = parse;
});

// node_modules/cross-spawn/lib/enoent.js
var require_enoent = __commonJS((exports, module) => {
  var isWin = process.platform === "win32";
  function notFoundError(original, syscall) {
    return Object.assign(new Error(`${syscall} ${original.command} ENOENT`), {
      code: "ENOENT",
      errno: "ENOENT",
      syscall: `${syscall} ${original.command}`,
      path: original.command,
      spawnargs: original.args
    });
  }
  function hookChildProcess(cp, parsed) {
    if (!isWin) {
      return;
    }
    const originalEmit = cp.emit;
    cp.emit = function(name, arg1) {
      if (name === "exit") {
        const err = verifyENOENT(arg1, parsed);
        if (err) {
          return originalEmit.call(cp, "error", err);
        }
      }
      return originalEmit.apply(cp, arguments);
    };
  }
  function verifyENOENT(status, parsed) {
    if (isWin && status === 1 && !parsed.file) {
      return notFoundError(parsed.original, "spawn");
    }
    return null;
  }
  function verifyENOENTSync(status, parsed) {
    if (isWin && status === 1 && !parsed.file) {
      return notFoundError(parsed.original, "spawnSync");
    }
    return null;
  }
  module.exports = {
    hookChildProcess,
    verifyENOENT,
    verifyENOENTSync,
    notFoundError
  };
});

// node_modules/cross-spawn/index.js
var require_cross_spawn = __commonJS((exports, module) => {
  var cp = __require("child_process");
  var parse = require_parse();
  var enoent = require_enoent();
  function spawn(command, args, options) {
    const parsed = parse(command, args, options);
    const spawned = cp.spawn(parsed.command, parsed.args, parsed.options);
    enoent.hookChildProcess(spawned, parsed);
    return spawned;
  }
  function spawnSync(command, args, options) {
    const parsed = parse(command, args, options);
    const result = cp.spawnSync(parsed.command, parsed.args, parsed.options);
    result.error = result.error || enoent.verifyENOENTSync(result.status, parsed);
    return result;
  }
  module.exports = spawn;
  module.exports.spawn = spawn;
  module.exports.sync = spawnSync;
  module.exports._parse = parse;
  module.exports._enoent = enoent;
});

// node_modules/@clack/core/dist/index.mjs
import { styleText as y } from "node:util";
import { stdout as S, stdin as $ } from "node:process";
import * as _ from "node:readline";
import P from "node:readline";

// node_modules/fast-string-truncated-width/dist/utils.js
var isAmbiguous = (x) => {
  return x === 161 || x === 164 || x === 167 || x === 168 || x === 170 || x === 173 || x === 174 || x >= 176 && x <= 180 || x >= 182 && x <= 186 || x >= 188 && x <= 191 || x === 198 || x === 208 || x === 215 || x === 216 || x >= 222 && x <= 225 || x === 230 || x >= 232 && x <= 234 || x === 236 || x === 237 || x === 240 || x === 242 || x === 243 || x >= 247 && x <= 250 || x === 252 || x === 254 || x === 257 || x === 273 || x === 275 || x === 283 || x === 294 || x === 295 || x === 299 || x >= 305 && x <= 307 || x === 312 || x >= 319 && x <= 322 || x === 324 || x >= 328 && x <= 331 || x === 333 || x === 338 || x === 339 || x === 358 || x === 359 || x === 363 || x === 462 || x === 464 || x === 466 || x === 468 || x === 470 || x === 472 || x === 474 || x === 476 || x === 593 || x === 609 || x === 708 || x === 711 || x >= 713 && x <= 715 || x === 717 || x === 720 || x >= 728 && x <= 731 || x === 733 || x === 735 || x >= 768 && x <= 879 || x >= 913 && x <= 929 || x >= 931 && x <= 937 || x >= 945 && x <= 961 || x >= 963 && x <= 969 || x === 1025 || x >= 1040 && x <= 1103 || x === 1105 || x === 8208 || x >= 8211 && x <= 8214 || x === 8216 || x === 8217 || x === 8220 || x === 8221 || x >= 8224 && x <= 8226 || x >= 8228 && x <= 8231 || x === 8240 || x === 8242 || x === 8243 || x === 8245 || x === 8251 || x === 8254 || x === 8308 || x === 8319 || x >= 8321 && x <= 8324 || x === 8364 || x === 8451 || x === 8453 || x === 8457 || x === 8467 || x === 8470 || x === 8481 || x === 8482 || x === 8486 || x === 8491 || x === 8531 || x === 8532 || x >= 8539 && x <= 8542 || x >= 8544 && x <= 8555 || x >= 8560 && x <= 8569 || x === 8585 || x >= 8592 && x <= 8601 || x === 8632 || x === 8633 || x === 8658 || x === 8660 || x === 8679 || x === 8704 || x === 8706 || x === 8707 || x === 8711 || x === 8712 || x === 8715 || x === 8719 || x === 8721 || x === 8725 || x === 8730 || x >= 8733 && x <= 8736 || x === 8739 || x === 8741 || x >= 8743 && x <= 8748 || x === 8750 || x >= 8756 && x <= 8759 || x === 8764 || x === 8765 || x === 8776 || x === 8780 || x === 8786 || x === 8800 || x === 8801 || x >= 8804 && x <= 8807 || x === 8810 || x === 8811 || x === 8814 || x === 8815 || x === 8834 || x === 8835 || x === 8838 || x === 8839 || x === 8853 || x === 8857 || x === 8869 || x === 8895 || x === 8978 || x >= 9312 && x <= 9449 || x >= 9451 && x <= 9547 || x >= 9552 && x <= 9587 || x >= 9600 && x <= 9615 || x >= 9618 && x <= 9621 || x === 9632 || x === 9633 || x >= 9635 && x <= 9641 || x === 9650 || x === 9651 || x === 9654 || x === 9655 || x === 9660 || x === 9661 || x === 9664 || x === 9665 || x >= 9670 && x <= 9672 || x === 9675 || x >= 9678 && x <= 9681 || x >= 9698 && x <= 9701 || x === 9711 || x === 9733 || x === 9734 || x === 9737 || x === 9742 || x === 9743 || x === 9756 || x === 9758 || x === 9792 || x === 9794 || x === 9824 || x === 9825 || x >= 9827 && x <= 9829 || x >= 9831 && x <= 9834 || x === 9836 || x === 9837 || x === 9839 || x === 9886 || x === 9887 || x === 9919 || x >= 9926 && x <= 9933 || x >= 9935 && x <= 9939 || x >= 9941 && x <= 9953 || x === 9955 || x === 9960 || x === 9961 || x >= 9963 && x <= 9969 || x === 9972 || x >= 9974 && x <= 9977 || x === 9979 || x === 9980 || x === 9982 || x === 9983 || x === 10045 || x >= 10102 && x <= 10111 || x >= 11094 && x <= 11097 || x >= 12872 && x <= 12879 || x >= 57344 && x <= 63743 || x >= 65024 && x <= 65039 || x === 65533 || x >= 127232 && x <= 127242 || x >= 127248 && x <= 127277 || x >= 127280 && x <= 127337 || x >= 127344 && x <= 127373 || x === 127375 || x === 127376 || x >= 127387 && x <= 127404 || x >= 917760 && x <= 917999 || x >= 983040 && x <= 1048573 || x >= 1048576 && x <= 1114109;
};
var isFullWidth = (x) => {
  return x === 12288 || x >= 65281 && x <= 65376 || x >= 65504 && x <= 65510;
};
var isWide = (x) => {
  return x >= 4352 && x <= 4447 || x === 8986 || x === 8987 || x === 9001 || x === 9002 || x >= 9193 && x <= 9196 || x === 9200 || x === 9203 || x === 9725 || x === 9726 || x === 9748 || x === 9749 || x >= 9800 && x <= 9811 || x === 9855 || x === 9875 || x === 9889 || x === 9898 || x === 9899 || x === 9917 || x === 9918 || x === 9924 || x === 9925 || x === 9934 || x === 9940 || x === 9962 || x === 9970 || x === 9971 || x === 9973 || x === 9978 || x === 9981 || x === 9989 || x === 9994 || x === 9995 || x === 10024 || x === 10060 || x === 10062 || x >= 10067 && x <= 10069 || x === 10071 || x >= 10133 && x <= 10135 || x === 10160 || x === 10175 || x === 11035 || x === 11036 || x === 11088 || x === 11093 || x >= 11904 && x <= 11929 || x >= 11931 && x <= 12019 || x >= 12032 && x <= 12245 || x >= 12272 && x <= 12287 || x >= 12289 && x <= 12350 || x >= 12353 && x <= 12438 || x >= 12441 && x <= 12543 || x >= 12549 && x <= 12591 || x >= 12593 && x <= 12686 || x >= 12688 && x <= 12771 || x >= 12783 && x <= 12830 || x >= 12832 && x <= 12871 || x >= 12880 && x <= 19903 || x >= 19968 && x <= 42124 || x >= 42128 && x <= 42182 || x >= 43360 && x <= 43388 || x >= 44032 && x <= 55203 || x >= 63744 && x <= 64255 || x >= 65040 && x <= 65049 || x >= 65072 && x <= 65106 || x >= 65108 && x <= 65126 || x >= 65128 && x <= 65131 || x >= 94176 && x <= 94180 || x === 94192 || x === 94193 || x >= 94208 && x <= 100343 || x >= 100352 && x <= 101589 || x >= 101632 && x <= 101640 || x >= 110576 && x <= 110579 || x >= 110581 && x <= 110587 || x === 110589 || x === 110590 || x >= 110592 && x <= 110882 || x === 110898 || x >= 110928 && x <= 110930 || x === 110933 || x >= 110948 && x <= 110951 || x >= 110960 && x <= 111355 || x === 126980 || x === 127183 || x === 127374 || x >= 127377 && x <= 127386 || x >= 127488 && x <= 127490 || x >= 127504 && x <= 127547 || x >= 127552 && x <= 127560 || x === 127568 || x === 127569 || x >= 127584 && x <= 127589 || x >= 127744 && x <= 127776 || x >= 127789 && x <= 127797 || x >= 127799 && x <= 127868 || x >= 127870 && x <= 127891 || x >= 127904 && x <= 127946 || x >= 127951 && x <= 127955 || x >= 127968 && x <= 127984 || x === 127988 || x >= 127992 && x <= 128062 || x === 128064 || x >= 128066 && x <= 128252 || x >= 128255 && x <= 128317 || x >= 128331 && x <= 128334 || x >= 128336 && x <= 128359 || x === 128378 || x === 128405 || x === 128406 || x === 128420 || x >= 128507 && x <= 128591 || x >= 128640 && x <= 128709 || x === 128716 || x >= 128720 && x <= 128722 || x >= 128725 && x <= 128727 || x >= 128732 && x <= 128735 || x === 128747 || x === 128748 || x >= 128756 && x <= 128764 || x >= 128992 && x <= 129003 || x === 129008 || x >= 129292 && x <= 129338 || x >= 129340 && x <= 129349 || x >= 129351 && x <= 129535 || x >= 129648 && x <= 129660 || x >= 129664 && x <= 129672 || x >= 129680 && x <= 129725 || x >= 129727 && x <= 129733 || x >= 129742 && x <= 129755 || x >= 129760 && x <= 129768 || x >= 129776 && x <= 129784 || x >= 131072 && x <= 196605 || x >= 196608 && x <= 262141;
};

// node_modules/fast-string-truncated-width/dist/index.js
var ANSI_RE = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/y;
var CONTROL_RE = /[\x00-\x08\x0A-\x1F\x7F-\x9F]{1,1000}/y;
var TAB_RE = /\t{1,1000}/y;
var EMOJI_RE = /[\u{1F1E6}-\u{1F1FF}]{2}|\u{1F3F4}[\u{E0061}-\u{E007A}]{2}[\u{E0030}-\u{E0039}\u{E0061}-\u{E007A}]{1,3}\u{E007F}|(?:\p{Emoji}\uFE0F\u20E3?|\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Emoji_Presentation})(?:\u200D(?:\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Emoji_Presentation}|\p{Emoji}\uFE0F\u20E3?))*/yu;
var LATIN_RE = /(?:[\x20-\x7E\xA0-\xFF](?!\uFE0F)){1,1000}/y;
var MODIFIER_RE = /\p{M}+/gu;
var NO_TRUNCATION = { limit: Infinity, ellipsis: "" };
var getStringTruncatedWidth = (input, truncationOptions = {}, widthOptions = {}) => {
  const LIMIT = truncationOptions.limit ?? Infinity;
  const ELLIPSIS = truncationOptions.ellipsis ?? "";
  const ELLIPSIS_WIDTH = truncationOptions?.ellipsisWidth ?? (ELLIPSIS ? getStringTruncatedWidth(ELLIPSIS, NO_TRUNCATION, widthOptions).width : 0);
  const ANSI_WIDTH = widthOptions.ansiWidth ?? 0;
  const CONTROL_WIDTH = widthOptions.controlWidth ?? 0;
  const TAB_WIDTH = widthOptions.tabWidth ?? 8;
  const AMBIGUOUS_WIDTH = widthOptions.ambiguousWidth ?? 1;
  const EMOJI_WIDTH = widthOptions.emojiWidth ?? 2;
  const FULL_WIDTH_WIDTH = widthOptions.fullWidthWidth ?? 2;
  const REGULAR_WIDTH = widthOptions.regularWidth ?? 1;
  const WIDE_WIDTH = widthOptions.wideWidth ?? 2;
  let indexPrev = 0;
  let index = 0;
  let length = input.length;
  let lengthExtra = 0;
  let truncationEnabled = false;
  let truncationIndex = length;
  let truncationLimit = Math.max(0, LIMIT - ELLIPSIS_WIDTH);
  let unmatchedStart = 0;
  let unmatchedEnd = 0;
  let width = 0;
  let widthExtra = 0;
  outer:
    while (true) {
      if (unmatchedEnd > unmatchedStart || index >= length && index > indexPrev) {
        const unmatched = input.slice(unmatchedStart, unmatchedEnd) || input.slice(indexPrev, index);
        lengthExtra = 0;
        for (const char of unmatched.replaceAll(MODIFIER_RE, "")) {
          const codePoint = char.codePointAt(0) || 0;
          if (isFullWidth(codePoint)) {
            widthExtra = FULL_WIDTH_WIDTH;
          } else if (isWide(codePoint)) {
            widthExtra = WIDE_WIDTH;
          } else if (AMBIGUOUS_WIDTH !== REGULAR_WIDTH && isAmbiguous(codePoint)) {
            widthExtra = AMBIGUOUS_WIDTH;
          } else {
            widthExtra = REGULAR_WIDTH;
          }
          if (width + widthExtra > truncationLimit) {
            truncationIndex = Math.min(truncationIndex, Math.max(unmatchedStart, indexPrev) + lengthExtra);
          }
          if (width + widthExtra > LIMIT) {
            truncationEnabled = true;
            break outer;
          }
          lengthExtra += char.length;
          width += widthExtra;
        }
        unmatchedStart = unmatchedEnd = 0;
      }
      if (index >= length)
        break;
      LATIN_RE.lastIndex = index;
      if (LATIN_RE.test(input)) {
        lengthExtra = LATIN_RE.lastIndex - index;
        widthExtra = lengthExtra * REGULAR_WIDTH;
        if (width + widthExtra > truncationLimit) {
          truncationIndex = Math.min(truncationIndex, index + Math.floor((truncationLimit - width) / REGULAR_WIDTH));
        }
        if (width + widthExtra > LIMIT) {
          truncationEnabled = true;
          break;
        }
        width += widthExtra;
        unmatchedStart = indexPrev;
        unmatchedEnd = index;
        index = indexPrev = LATIN_RE.lastIndex;
        continue;
      }
      ANSI_RE.lastIndex = index;
      if (ANSI_RE.test(input)) {
        if (width + ANSI_WIDTH > truncationLimit) {
          truncationIndex = Math.min(truncationIndex, index);
        }
        if (width + ANSI_WIDTH > LIMIT) {
          truncationEnabled = true;
          break;
        }
        width += ANSI_WIDTH;
        unmatchedStart = indexPrev;
        unmatchedEnd = index;
        index = indexPrev = ANSI_RE.lastIndex;
        continue;
      }
      CONTROL_RE.lastIndex = index;
      if (CONTROL_RE.test(input)) {
        lengthExtra = CONTROL_RE.lastIndex - index;
        widthExtra = lengthExtra * CONTROL_WIDTH;
        if (width + widthExtra > truncationLimit) {
          truncationIndex = Math.min(truncationIndex, index + Math.floor((truncationLimit - width) / CONTROL_WIDTH));
        }
        if (width + widthExtra > LIMIT) {
          truncationEnabled = true;
          break;
        }
        width += widthExtra;
        unmatchedStart = indexPrev;
        unmatchedEnd = index;
        index = indexPrev = CONTROL_RE.lastIndex;
        continue;
      }
      TAB_RE.lastIndex = index;
      if (TAB_RE.test(input)) {
        lengthExtra = TAB_RE.lastIndex - index;
        widthExtra = lengthExtra * TAB_WIDTH;
        if (width + widthExtra > truncationLimit) {
          truncationIndex = Math.min(truncationIndex, index + Math.floor((truncationLimit - width) / TAB_WIDTH));
        }
        if (width + widthExtra > LIMIT) {
          truncationEnabled = true;
          break;
        }
        width += widthExtra;
        unmatchedStart = indexPrev;
        unmatchedEnd = index;
        index = indexPrev = TAB_RE.lastIndex;
        continue;
      }
      EMOJI_RE.lastIndex = index;
      if (EMOJI_RE.test(input)) {
        if (width + EMOJI_WIDTH > truncationLimit) {
          truncationIndex = Math.min(truncationIndex, index);
        }
        if (width + EMOJI_WIDTH > LIMIT) {
          truncationEnabled = true;
          break;
        }
        width += EMOJI_WIDTH;
        unmatchedStart = indexPrev;
        unmatchedEnd = index;
        index = indexPrev = EMOJI_RE.lastIndex;
        continue;
      }
      index += 1;
    }
  return {
    width: truncationEnabled ? truncationLimit : width,
    index: truncationEnabled ? truncationIndex : length,
    truncated: truncationEnabled,
    ellipsed: truncationEnabled && LIMIT >= ELLIPSIS_WIDTH
  };
};
var dist_default = getStringTruncatedWidth;

// node_modules/fast-string-width/dist/index.js
var NO_TRUNCATION2 = {
  limit: Infinity,
  ellipsis: "",
  ellipsisWidth: 0
};
var fastStringWidth = (input, options = {}) => {
  return dist_default(input, NO_TRUNCATION2, options).width;
};
var dist_default2 = fastStringWidth;

// node_modules/fast-wrap-ansi/lib/main.js
var ESC = "\x1B";
var CSI = "";
var END_CODE = 39;
var ANSI_ESCAPE_BELL = "\x07";
var ANSI_CSI = "[";
var ANSI_OSC = "]";
var ANSI_SGR_TERMINATOR = "m";
var ANSI_ESCAPE_LINK = `${ANSI_OSC}8;;`;
var GROUP_REGEX = new RegExp(`(?:\\${ANSI_CSI}(?<code>\\d+)m|\\${ANSI_ESCAPE_LINK}(?<uri>.*)${ANSI_ESCAPE_BELL})`, "y");
var getClosingCode = (openingCode) => {
  if (openingCode >= 30 && openingCode <= 37)
    return 39;
  if (openingCode >= 90 && openingCode <= 97)
    return 39;
  if (openingCode >= 40 && openingCode <= 47)
    return 49;
  if (openingCode >= 100 && openingCode <= 107)
    return 49;
  if (openingCode === 1 || openingCode === 2)
    return 22;
  if (openingCode === 3)
    return 23;
  if (openingCode === 4)
    return 24;
  if (openingCode === 7)
    return 27;
  if (openingCode === 8)
    return 28;
  if (openingCode === 9)
    return 29;
  if (openingCode === 0)
    return 0;
  return;
};
var wrapAnsiCode = (code) => `${ESC}${ANSI_CSI}${code}${ANSI_SGR_TERMINATOR}`;
var wrapAnsiHyperlink = (url) => `${ESC}${ANSI_ESCAPE_LINK}${url}${ANSI_ESCAPE_BELL}`;
var wrapWord = (rows, word, columns) => {
  const characters = word[Symbol.iterator]();
  let isInsideEscape = false;
  let isInsideLinkEscape = false;
  let lastRow = rows.at(-1);
  let visible = lastRow === undefined ? 0 : dist_default2(lastRow);
  let currentCharacter = characters.next();
  let nextCharacter = characters.next();
  let rawCharacterIndex = 0;
  while (!currentCharacter.done) {
    const character = currentCharacter.value;
    const characterLength = dist_default2(character);
    if (visible + characterLength <= columns) {
      rows[rows.length - 1] += character;
    } else {
      rows.push(character);
      visible = 0;
    }
    if (character === ESC || character === CSI) {
      isInsideEscape = true;
      isInsideLinkEscape = word.startsWith(ANSI_ESCAPE_LINK, rawCharacterIndex + 1);
    }
    if (isInsideEscape) {
      if (isInsideLinkEscape) {
        if (character === ANSI_ESCAPE_BELL) {
          isInsideEscape = false;
          isInsideLinkEscape = false;
        }
      } else if (character === ANSI_SGR_TERMINATOR) {
        isInsideEscape = false;
      }
    } else {
      visible += characterLength;
      if (visible === columns && !nextCharacter.done) {
        rows.push("");
        visible = 0;
      }
    }
    currentCharacter = nextCharacter;
    nextCharacter = characters.next();
    rawCharacterIndex += character.length;
  }
  lastRow = rows.at(-1);
  if (!visible && lastRow !== undefined && lastRow.length && rows.length > 1) {
    rows[rows.length - 2] += rows.pop();
  }
};
var stringVisibleTrimSpacesRight = (string) => {
  const words = string.split(" ");
  let last = words.length;
  while (last) {
    if (dist_default2(words[last - 1])) {
      break;
    }
    last--;
  }
  if (last === words.length) {
    return string;
  }
  return words.slice(0, last).join(" ") + words.slice(last).join("");
};
var exec = (string, columns, options = {}) => {
  if (options.trim !== false && string.trim() === "") {
    return "";
  }
  let returnValue = "";
  let escapeCode;
  let escapeUrl;
  const words = string.split(" ");
  let rows = [""];
  let rowLength = 0;
  for (let index = 0;index < words.length; index++) {
    const word = words[index];
    if (options.trim !== false) {
      const row = rows.at(-1) ?? "";
      const trimmed = row.trimStart();
      if (row.length !== trimmed.length) {
        rows[rows.length - 1] = trimmed;
        rowLength = dist_default2(trimmed);
      }
    }
    if (index !== 0) {
      if (rowLength >= columns && (options.wordWrap === false || options.trim === false)) {
        rows.push("");
        rowLength = 0;
      }
      if (rowLength || options.trim === false) {
        rows[rows.length - 1] += " ";
        rowLength++;
      }
    }
    const wordLength = dist_default2(word);
    if (options.hard && wordLength > columns) {
      const remainingColumns = columns - rowLength;
      const breaksStartingThisLine = 1 + Math.floor((wordLength - remainingColumns - 1) / columns);
      const breaksStartingNextLine = Math.floor((wordLength - 1) / columns);
      if (breaksStartingNextLine < breaksStartingThisLine) {
        rows.push("");
      }
      wrapWord(rows, word, columns);
      rowLength = dist_default2(rows.at(-1) ?? "");
      continue;
    }
    if (rowLength + wordLength > columns && rowLength && wordLength) {
      if (options.wordWrap === false && rowLength < columns) {
        wrapWord(rows, word, columns);
        rowLength = dist_default2(rows.at(-1) ?? "");
        continue;
      }
      rows.push("");
      rowLength = 0;
    }
    if (rowLength + wordLength > columns && options.wordWrap === false) {
      wrapWord(rows, word, columns);
      rowLength = dist_default2(rows.at(-1) ?? "");
      continue;
    }
    rows[rows.length - 1] += word;
    rowLength += wordLength;
  }
  if (options.trim !== false) {
    rows = rows.map((row) => stringVisibleTrimSpacesRight(row));
  }
  const preString = rows.join(`
`);
  let inSurrogate = false;
  for (let i = 0;i < preString.length; i++) {
    const character = preString[i];
    returnValue += character;
    if (!inSurrogate) {
      inSurrogate = character >= "\uD800" && character <= "\uDBFF";
    } else {
      continue;
    }
    if (character === ESC || character === CSI) {
      GROUP_REGEX.lastIndex = i + 1;
      const groupsResult = GROUP_REGEX.exec(preString);
      const groups = groupsResult?.groups;
      if (groups?.code !== undefined) {
        const code = Number.parseFloat(groups.code);
        escapeCode = code === END_CODE ? undefined : code;
      } else if (groups?.uri !== undefined) {
        escapeUrl = groups.uri.length === 0 ? undefined : groups.uri;
      }
    }
    if (preString[i + 1] === `
`) {
      if (escapeUrl) {
        returnValue += wrapAnsiHyperlink("");
      }
      const closingCode = escapeCode ? getClosingCode(escapeCode) : undefined;
      if (escapeCode && closingCode) {
        returnValue += wrapAnsiCode(closingCode);
      }
    } else if (character === `
`) {
      if (escapeCode && getClosingCode(escapeCode)) {
        returnValue += wrapAnsiCode(escapeCode);
      }
      if (escapeUrl) {
        returnValue += wrapAnsiHyperlink(escapeUrl);
      }
    }
  }
  return returnValue;
};
var CRLF_OR_LF = /\r?\n/;
function wrapAnsi(string, columns, options) {
  return String(string).normalize().split(CRLF_OR_LF).map((line) => exec(line, columns, options)).join(`
`);
}

// node_modules/@clack/core/dist/index.mjs
var import_sisteransi = __toESM(require_src(), 1);
import { ReadStream as D } from "node:tty";
function d(r, t, e) {
  if (!e.some((o) => !o.disabled))
    return r;
  const s = r + t, i = Math.max(e.length - 1, 0), n = s < 0 ? i : s > i ? 0 : s;
  return e[n].disabled ? d(n, t < 0 ? -1 : 1, e) : n;
}
var E = ["up", "down", "left", "right", "space", "enter", "cancel"];
var G = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var u = { actions: new Set(E), aliases: new Map([["k", "up"], ["j", "down"], ["h", "left"], ["l", "right"], ["\x03", "cancel"], ["escape", "cancel"]]), messages: { cancel: "Canceled", error: "Something went wrong" }, withGuide: true, date: { monthNames: [...G], messages: { required: "Please enter a valid date", invalidMonth: "There are only 12 months in a year", invalidDay: (r, t) => `There are only ${r} days in ${t}`, afterMin: (r) => `Date must be on or after ${r.toISOString().slice(0, 10)}`, beforeMax: (r) => `Date must be on or before ${r.toISOString().slice(0, 10)}` } } };
function V(r, t) {
  if (typeof r == "string")
    return u.aliases.get(r) === t;
  for (const e of r)
    if (e !== undefined && V(e, t))
      return true;
  return false;
}
function j(r, t) {
  if (r === t)
    return;
  const e = r.split(`
`), s = t.split(`
`), i = Math.max(e.length, s.length), n = [];
  for (let o = 0;o < i; o++)
    e[o] !== s[o] && n.push(o);
  return { lines: n, numLinesBefore: e.length, numLinesAfter: s.length, numLines: i };
}
var Y = globalThis.process.platform.startsWith("win");
var C = Symbol("clack:cancel");
function q(r) {
  return r === C;
}
function w(r, t) {
  const e = r;
  e.isTTY && e.setRawMode(t);
}
function z({ input: r = $, output: t = S, overwrite: e = true, hideCursor: s = true } = {}) {
  const i = _.createInterface({ input: r, output: t, prompt: "", tabSize: 1 });
  _.emitKeypressEvents(r, i), r instanceof D && r.isTTY && r.setRawMode(true);
  const n = (o, { name: a, sequence: h }) => {
    const l = String(o);
    if (V([l, a, h], "cancel")) {
      s && t.write(import_sisteransi.cursor.show), process.exit(0);
      return;
    }
    if (!e)
      return;
    const f = a === "return" ? 0 : -1, v = a === "return" ? -1 : 0;
    _.moveCursor(t, f, v, () => {
      _.clearLine(t, 1, () => {
        r.once("keypress", n);
      });
    });
  };
  return s && t.write(import_sisteransi.cursor.hide), r.once("keypress", n), () => {
    r.off("keypress", n), s && t.write(import_sisteransi.cursor.show), r instanceof D && r.isTTY && !Y && r.setRawMode(false), i.terminal = false, i.close();
  };
}
var O = (r) => ("columns" in r) && typeof r.columns == "number" ? r.columns : 80;
var A = (r) => ("rows" in r) && typeof r.rows == "number" ? r.rows : 20;
function R(r, t, e, s = e) {
  const i = O(r ?? S);
  return wrapAnsi(t, i - e.length, { hard: true, trim: false }).split(`
`).map((n, o) => `${o === 0 ? s : e}${n}`).join(`
`);
}
var p = class {
  input;
  output;
  _abortSignal;
  rl;
  opts;
  _render;
  _track = false;
  _prevFrame = "";
  _subscribers = new Map;
  _cursor = 0;
  state = "initial";
  error = "";
  value;
  userInput = "";
  constructor(t, e = true) {
    const { input: s = $, output: i = S, render: n, signal: o, ...a } = t;
    this.opts = a, this.onKeypress = this.onKeypress.bind(this), this.close = this.close.bind(this), this.render = this.render.bind(this), this._render = n.bind(this), this._track = e, this._abortSignal = o, this.input = s, this.output = i;
  }
  unsubscribe() {
    this._subscribers.clear();
  }
  setSubscriber(t, e) {
    const s = this._subscribers.get(t) ?? [];
    s.push(e), this._subscribers.set(t, s);
  }
  on(t, e) {
    this.setSubscriber(t, { cb: e });
  }
  once(t, e) {
    this.setSubscriber(t, { cb: e, once: true });
  }
  emit(t, ...e) {
    const s = this._subscribers.get(t) ?? [], i = [];
    for (const n of s)
      n.cb(...e), n.once && i.push(() => s.splice(s.indexOf(n), 1));
    for (const n of i)
      n();
  }
  prompt() {
    return new Promise((t) => {
      if (this._abortSignal) {
        if (this._abortSignal.aborted)
          return this.state = "cancel", this.close(), t(C);
        this._abortSignal.addEventListener("abort", () => {
          this.state = "cancel", this.close();
        }, { once: true });
      }
      this.rl = P.createInterface({ input: this.input, tabSize: 2, prompt: "", escapeCodeTimeout: 50, terminal: true }), this.rl.prompt(), this.opts.initialUserInput !== undefined && this._setUserInput(this.opts.initialUserInput, true), this.input.on("keypress", this.onKeypress), w(this.input, true), this.output.on("resize", this.render), this.render(), this.once("submit", () => {
        this.output.write(import_sisteransi.cursor.show), this.output.off("resize", this.render), w(this.input, false), t(this.value);
      }), this.once("cancel", () => {
        this.output.write(import_sisteransi.cursor.show), this.output.off("resize", this.render), w(this.input, false), t(C);
      });
    });
  }
  _isActionKey(t, e) {
    return t === "\t";
  }
  _setValue(t) {
    this.value = t, this.emit("value", this.value);
  }
  _setUserInput(t, e) {
    this.userInput = t ?? "", this.emit("userInput", this.userInput), e && this._track && this.rl && (this.rl.write(this.userInput), this._cursor = this.rl.cursor);
  }
  _clearUserInput() {
    this.rl?.write(null, { ctrl: true, name: "u" }), this._setUserInput("");
  }
  onKeypress(t, e) {
    if (this._track && e.name !== "return" && (e.name && this._isActionKey(t, e) && this.rl?.write(null, { ctrl: true, name: "h" }), this._cursor = this.rl?.cursor ?? 0, this._setUserInput(this.rl?.line)), this.state === "error" && (this.state = "active"), e?.name && (!this._track && u.aliases.has(e.name) && this.emit("cursor", u.aliases.get(e.name)), u.actions.has(e.name) && this.emit("cursor", e.name)), t && (t.toLowerCase() === "y" || t.toLowerCase() === "n") && this.emit("confirm", t.toLowerCase() === "y"), this.emit("key", t?.toLowerCase(), e), e?.name === "return") {
      if (this.opts.validate) {
        const s = this.opts.validate(this.value);
        s && (this.error = s instanceof Error ? s.message : s, this.state = "error", this.rl?.write(this.userInput));
      }
      this.state !== "error" && (this.state = "submit");
    }
    V([t, e?.name, e?.sequence], "cancel") && (this.state = "cancel"), (this.state === "submit" || this.state === "cancel") && this.emit("finalize"), this.render(), (this.state === "submit" || this.state === "cancel") && this.close();
  }
  close() {
    this.input.unpipe(), this.input.removeListener("keypress", this.onKeypress), this.output.write(`
`), w(this.input, false), this.rl?.close(), this.rl = undefined, this.emit(`${this.state}`, this.value), this.unsubscribe();
  }
  restoreCursor() {
    const t = wrapAnsi(this._prevFrame, process.stdout.columns, { hard: true, trim: false }).split(`
`).length - 1;
    this.output.write(import_sisteransi.cursor.move(-999, t * -1));
  }
  render() {
    const t = wrapAnsi(this._render(this) ?? "", process.stdout.columns, { hard: true, trim: false });
    if (t !== this._prevFrame) {
      if (this.state === "initial")
        this.output.write(import_sisteransi.cursor.hide);
      else {
        const e = j(this._prevFrame, t), s = A(this.output);
        if (this.restoreCursor(), e) {
          const i = Math.max(0, e.numLinesAfter - s), n = Math.max(0, e.numLinesBefore - s);
          let o = e.lines.find((a) => a >= i);
          if (o === undefined) {
            this._prevFrame = t;
            return;
          }
          if (e.lines.length === 1) {
            this.output.write(import_sisteransi.cursor.move(0, o - n)), this.output.write(import_sisteransi.erase.lines(1));
            const a = t.split(`
`);
            this.output.write(a[o]), this._prevFrame = t, this.output.write(import_sisteransi.cursor.move(0, a.length - o - 1));
            return;
          } else if (e.lines.length > 1) {
            if (i < n)
              o = i;
            else {
              const h = o - n;
              h > 0 && this.output.write(import_sisteransi.cursor.move(0, h));
            }
            this.output.write(import_sisteransi.erase.down());
            const a = t.split(`
`).slice(o);
            this.output.write(a.join(`
`)), this._prevFrame = t;
            return;
          }
        }
        this.output.write(import_sisteransi.erase.down());
      }
      this.output.write(t), this.state === "initial" && (this.state = "active"), this._prevFrame = t;
    }
  }
};
function W(r, t) {
  if (r === undefined || t.length === 0)
    return 0;
  const e = t.findIndex((s) => s.value === r);
  return e !== -1 ? e : 0;
}
function B(r, t) {
  return (t.label ?? String(t.value)).toLowerCase().includes(r.toLowerCase());
}
function J(r, t) {
  if (t)
    return r ? t : t[0];
}
var H = class extends p {
  filteredOptions;
  multiple;
  isNavigating = false;
  selectedValues = [];
  focusedValue;
  #e = 0;
  #o = "";
  #t;
  #n;
  #a;
  get cursor() {
    return this.#e;
  }
  get userInputWithCursor() {
    if (!this.userInput)
      return y(["inverse", "hidden"], "_");
    if (this._cursor >= this.userInput.length)
      return `${this.userInput}█`;
    const t = this.userInput.slice(0, this._cursor), [e, ...s] = this.userInput.slice(this._cursor);
    return `${t}${y("inverse", e)}${s.join("")}`;
  }
  get options() {
    return typeof this.#n == "function" ? this.#n() : this.#n;
  }
  constructor(t) {
    super(t), this.#n = t.options, this.#a = t.placeholder;
    const e = this.options;
    this.filteredOptions = [...e], this.multiple = t.multiple === true, this.#t = typeof t.options == "function" ? t.filter : t.filter ?? B;
    let s;
    if (t.initialValue && Array.isArray(t.initialValue) ? this.multiple ? s = t.initialValue : s = t.initialValue.slice(0, 1) : !this.multiple && this.options.length > 0 && (s = [this.options[0].value]), s)
      for (const i of s) {
        const n = e.findIndex((o) => o.value === i);
        n !== -1 && (this.toggleSelected(i), this.#e = n);
      }
    this.focusedValue = this.options[this.#e]?.value, this.on("key", (i, n) => this.#s(i, n)), this.on("userInput", (i) => this.#i(i));
  }
  _isActionKey(t, e) {
    return t === "\t" || this.multiple && this.isNavigating && e.name === "space" && t !== undefined && t !== "";
  }
  #s(t, e) {
    const s = e.name === "up", i = e.name === "down", n = e.name === "return", o = this.userInput === "" || this.userInput === "\t", a = this.#a, h = this.options, l = a !== undefined && a !== "" && h.some((f) => !f.disabled && (this.#t ? this.#t(a, f) : true));
    if (e.name === "tab" && o && l) {
      this.userInput === "\t" && this._clearUserInput(), this._setUserInput(a, true), this.isNavigating = false;
      return;
    }
    s || i ? (this.#e = d(this.#e, s ? -1 : 1, this.filteredOptions), this.focusedValue = this.filteredOptions[this.#e]?.value, this.multiple || (this.selectedValues = [this.focusedValue]), this.isNavigating = true) : n ? this.value = J(this.multiple, this.selectedValues) : this.multiple ? this.focusedValue !== undefined && (e.name === "tab" || this.isNavigating && e.name === "space") ? this.toggleSelected(this.focusedValue) : this.isNavigating = false : (this.focusedValue && (this.selectedValues = [this.focusedValue]), this.isNavigating = false);
  }
  deselectAll() {
    this.selectedValues = [];
  }
  toggleSelected(t) {
    this.filteredOptions.length !== 0 && (this.multiple ? this.selectedValues.includes(t) ? this.selectedValues = this.selectedValues.filter((e) => e !== t) : this.selectedValues = [...this.selectedValues, t] : this.selectedValues = [t]);
  }
  #i(t) {
    if (t !== this.#o) {
      this.#o = t;
      const e = this.options;
      t && this.#t ? this.filteredOptions = e.filter((n) => this.#t?.(t, n)) : this.filteredOptions = [...e];
      const s = W(this.focusedValue, this.filteredOptions);
      this.#e = d(s, 0, this.filteredOptions);
      const i = this.filteredOptions[this.#e];
      i && !i.disabled ? this.focusedValue = i.value : this.focusedValue = undefined, this.multiple || (this.focusedValue !== undefined ? this.toggleSelected(this.focusedValue) : this.deselectAll());
    }
  }
};
var X = { Y: { type: "year", len: 4 }, M: { type: "month", len: 2 }, D: { type: "day", len: 2 } };
function L(r) {
  return [...r].map((t) => X[t]);
}
function Z(r) {
  const t = new Intl.DateTimeFormat(r, { year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(2000, 0, 15)), e = [];
  let s = "/";
  for (const i of t)
    i.type === "literal" ? s = i.value.trim() || i.value : (i.type === "year" || i.type === "month" || i.type === "day") && e.push({ type: i.type, len: i.type === "year" ? 4 : 2 });
  return { segments: e, separator: s };
}
function k(r) {
  return Number.parseInt((r || "0").replace(/_/g, "0"), 10) || 0;
}
function I(r) {
  return { year: k(r.year), month: k(r.month), day: k(r.day) };
}
function T(r, t) {
  return new Date(r || 2001, t || 1, 0).getDate();
}
function F(r) {
  const { year: t, month: e, day: s } = I(r);
  if (!t || t < 0 || t > 9999 || !e || e < 1 || e > 12 || !s || s < 1)
    return;
  const i = new Date(Date.UTC(t, e - 1, s));
  if (!(i.getUTCFullYear() !== t || i.getUTCMonth() !== e - 1 || i.getUTCDate() !== s))
    return { year: t, month: e, day: s };
}
function N(r) {
  const t = F(r);
  return t ? new Date(Date.UTC(t.year, t.month - 1, t.day)) : undefined;
}
function tt(r, t, e, s) {
  const i = e ? { year: e.getUTCFullYear(), month: e.getUTCMonth() + 1, day: e.getUTCDate() } : null, n = s ? { year: s.getUTCFullYear(), month: s.getUTCMonth() + 1, day: s.getUTCDate() } : null;
  return r === "year" ? { min: i?.year ?? 1, max: n?.year ?? 9999 } : r === "month" ? { min: i && t.year === i.year ? i.month : 1, max: n && t.year === n.year ? n.month : 12 } : { min: i && t.year === i.year && t.month === i.month ? i.day : 1, max: n && t.year === n.year && t.month === n.month ? n.day : T(t.year, t.month) };
}

class et extends p {
  #e;
  #o;
  #t;
  #n;
  #a;
  #s = { segmentIndex: 0, positionInSegment: 0 };
  #i = true;
  #r = null;
  inlineError = "";
  get segmentCursor() {
    return { ...this.#s };
  }
  get segmentValues() {
    return { ...this.#t };
  }
  get segments() {
    return this.#e;
  }
  get separator() {
    return this.#o;
  }
  get formattedValue() {
    return this.#c(this.#t);
  }
  #c(t) {
    return this.#e.map((e) => t[e.type]).join(this.#o);
  }
  #h() {
    this._setUserInput(this.#c(this.#t)), this._setValue(N(this.#t) ?? undefined);
  }
  constructor(t) {
    const e = t.format ? { segments: L(t.format), separator: t.separator ?? "/" } : Z(t.locale), s = t.separator ?? e.separator, i = t.format ? L(t.format) : e.segments, n = t.initialValue ?? t.defaultValue, o = n ? { year: String(n.getUTCFullYear()).padStart(4, "0"), month: String(n.getUTCMonth() + 1).padStart(2, "0"), day: String(n.getUTCDate()).padStart(2, "0") } : { year: "____", month: "__", day: "__" }, a = i.map((h) => o[h.type]).join(s);
    super({ ...t, initialUserInput: a }, false), this.#e = i, this.#o = s, this.#t = o, this.#n = t.minDate, this.#a = t.maxDate, this.#h(), this.on("cursor", (h) => this.#d(h)), this.on("key", (h, l) => this.#f(h, l)), this.on("finalize", () => this.#g(t));
  }
  #u() {
    const t = Math.max(0, Math.min(this.#s.segmentIndex, this.#e.length - 1)), e = this.#e[t];
    if (e)
      return this.#s.positionInSegment = Math.max(0, Math.min(this.#s.positionInSegment, e.len - 1)), { segment: e, index: t };
  }
  #l(t) {
    this.inlineError = "", this.#r = null;
    const e = this.#u();
    e && (this.#s.segmentIndex = Math.max(0, Math.min(this.#e.length - 1, e.index + t)), this.#s.positionInSegment = 0, this.#i = true);
  }
  #p(t) {
    const e = this.#u();
    if (!e)
      return;
    const { segment: s } = e, i = this.#t[s.type], n = !i || i.replace(/_/g, "") === "", o = Number.parseInt((i || "0").replace(/_/g, "0"), 10) || 0, a = tt(s.type, I(this.#t), this.#n, this.#a);
    let h;
    n ? h = t === 1 ? a.min : a.max : h = Math.max(Math.min(a.max, o + t), a.min), this.#t = { ...this.#t, [s.type]: h.toString().padStart(s.len, "0") }, this.#i = true, this.#r = null, this.#h();
  }
  #d(t) {
    if (t)
      switch (t) {
        case "right":
          return this.#l(1);
        case "left":
          return this.#l(-1);
        case "up":
          return this.#p(1);
        case "down":
          return this.#p(-1);
      }
  }
  #f(t, e) {
    if (e?.name === "backspace" || e?.sequence === "" || e?.sequence === "\b" || t === "" || t === "\b") {
      this.inlineError = "";
      const s = this.#u();
      if (!s)
        return;
      if (!this.#t[s.segment.type].replace(/_/g, "")) {
        this.#l(-1);
        return;
      }
      this.#t[s.segment.type] = "_".repeat(s.segment.len), this.#i = true, this.#s.positionInSegment = 0, this.#h();
      return;
    }
    if (e?.name === "tab") {
      this.inlineError = "";
      const s = this.#u();
      if (!s)
        return;
      const i = e.shift ? -1 : 1, n = s.index + i;
      n >= 0 && n < this.#e.length && (this.#s.segmentIndex = n, this.#s.positionInSegment = 0, this.#i = true);
      return;
    }
    if (t && /^[0-9]$/.test(t)) {
      const s = this.#u();
      if (!s)
        return;
      const { segment: i } = s, n = !this.#t[i.type].replace(/_/g, "");
      if (this.#i && this.#r !== null && !n) {
        const m = this.#r + t, g = { ...this.#t, [i.type]: m }, b = this.#m(g, i);
        if (b) {
          this.inlineError = b, this.#r = null, this.#i = false;
          return;
        }
        this.inlineError = "", this.#t[i.type] = m, this.#r = null, this.#i = false, this.#h(), s.index < this.#e.length - 1 && (this.#s.segmentIndex = s.index + 1, this.#s.positionInSegment = 0, this.#i = true);
        return;
      }
      this.#i && !n && (this.#t[i.type] = "_".repeat(i.len), this.#s.positionInSegment = 0), this.#i = false, this.#r = null;
      const o = this.#t[i.type], a = o.indexOf("_"), h = a >= 0 ? a : Math.min(this.#s.positionInSegment, i.len - 1);
      if (h < 0 || h >= i.len)
        return;
      let l = o.slice(0, h) + t + o.slice(h + 1), f = false;
      if (h === 0 && o === "__" && (i.type === "month" || i.type === "day")) {
        const m = Number.parseInt(t, 10);
        l = `0${t}`, f = m <= (i.type === "month" ? 1 : 2);
      }
      if (i.type === "year" && (l = (o.replace(/_/g, "") + t).padStart(i.len, "_")), !l.includes("_")) {
        const m = { ...this.#t, [i.type]: l }, g = this.#m(m, i);
        if (g) {
          this.inlineError = g;
          return;
        }
      }
      this.inlineError = "", this.#t[i.type] = l;
      const v = l.includes("_") ? undefined : F(this.#t);
      if (v) {
        const { year: m, month: g } = v, b = T(m, g);
        this.#t = { year: String(Math.max(0, Math.min(9999, m))).padStart(4, "0"), month: String(Math.max(1, Math.min(12, g))).padStart(2, "0"), day: String(Math.max(1, Math.min(b, v.day))).padStart(2, "0") };
      }
      this.#h();
      const U = l.indexOf("_");
      f ? (this.#i = true, this.#r = t) : U >= 0 ? this.#s.positionInSegment = U : a >= 0 && s.index < this.#e.length - 1 ? (this.#s.segmentIndex = s.index + 1, this.#s.positionInSegment = 0, this.#i = true) : this.#s.positionInSegment = Math.min(h + 1, i.len - 1);
    }
  }
  #m(t, e) {
    const { month: s, day: i } = I(t);
    if (e.type === "month" && (s < 0 || s > 12))
      return u.date.messages.invalidMonth;
    if (e.type === "day" && (i < 0 || i > 31))
      return u.date.messages.invalidDay(31, "any month");
  }
  #g(t) {
    const { year: e, month: s, day: i } = I(this.#t);
    if (e && s && i) {
      const n = T(e, s);
      this.#t = { ...this.#t, day: String(Math.min(i, n)).padStart(2, "0") };
    }
    this.value = N(this.#t) ?? t.defaultValue ?? undefined;
  }
}

class st extends p {
  options;
  cursor = 0;
  #e;
  getGroupItems(t) {
    return this.options.filter((e) => e.group === t);
  }
  isGroupSelected(t) {
    const e = this.getGroupItems(t), s = this.value;
    return s === undefined ? false : e.every((i) => s.includes(i.value));
  }
  toggleValue() {
    const t = this.options[this.cursor];
    if (this.value === undefined && (this.value = []), t.group === true) {
      const e = t.value, s = this.getGroupItems(e);
      this.isGroupSelected(e) ? this.value = this.value.filter((i) => s.findIndex((n) => n.value === i) === -1) : this.value = [...this.value, ...s.map((i) => i.value)], this.value = Array.from(new Set(this.value));
    } else {
      const e = this.value.includes(t.value);
      this.value = e ? this.value.filter((s) => s !== t.value) : [...this.value, t.value];
    }
  }
  constructor(t) {
    super(t, false);
    const { options: e } = t;
    this.#e = t.selectableGroups !== false, this.options = Object.entries(e).flatMap(([s, i]) => [{ value: s, group: true, label: s }, ...i.map((n) => ({ ...n, group: s }))]), this.value = [...t.initialValues ?? []], this.cursor = Math.max(this.options.findIndex(({ value: s }) => s === t.cursorAt), this.#e ? 0 : 1), this.on("cursor", (s) => {
      switch (s) {
        case "left":
        case "up": {
          this.cursor = this.cursor === 0 ? this.options.length - 1 : this.cursor - 1;
          const i = this.options[this.cursor]?.group === true;
          !this.#e && i && (this.cursor = this.cursor === 0 ? this.options.length - 1 : this.cursor - 1);
          break;
        }
        case "down":
        case "right": {
          this.cursor = this.cursor === this.options.length - 1 ? 0 : this.cursor + 1;
          const i = this.options[this.cursor]?.group === true;
          !this.#e && i && (this.cursor = this.cursor === this.options.length - 1 ? 0 : this.cursor + 1);
          break;
        }
        case "space":
          this.toggleValue();
          break;
      }
    });
  }
}
class nt extends p {
  options;
  cursor = 0;
  get _selectedValue() {
    return this.options[this.cursor];
  }
  changeValue() {
    this.value = this._selectedValue.value;
  }
  constructor(t) {
    super(t, false), this.options = t.options;
    const e = this.options.findIndex(({ value: i }) => i === t.initialValue), s = e === -1 ? 0 : e;
    this.cursor = this.options[s].disabled ? d(s, 1, this.options) : s, this.changeValue(), this.on("cursor", (i) => {
      switch (i) {
        case "left":
        case "up":
          this.cursor = d(this.cursor, -1, this.options);
          break;
        case "down":
        case "right":
          this.cursor = d(this.cursor, 1, this.options);
          break;
      }
      this.changeValue();
    });
  }
}

// node_modules/@clack/prompts/dist/index.mjs
import { styleText as t, stripVTControlCharacters as ne } from "node:util";
import P2 from "node:process";
var import_sisteransi2 = __toESM(require_src(), 1);
function Ze() {
  return P2.platform !== "win32" ? P2.env.TERM !== "linux" : !!P2.env.CI || !!P2.env.WT_SESSION || !!P2.env.TERMINUS_SUBLIME || P2.env.ConEmuTask === "{cmd::Cmder}" || P2.env.TERM_PROGRAM === "Terminus-Sublime" || P2.env.TERM_PROGRAM === "vscode" || P2.env.TERM === "xterm-256color" || P2.env.TERM === "alacritty" || P2.env.TERMINAL_EMULATOR === "JetBrains-JediTerm";
}
var ee = Ze();
var ae = () => process.env.CI === "true";
var w2 = (e, i) => ee ? e : i;
var _e = w2("◆", "*");
var oe = w2("■", "x");
var ue = w2("▲", "x");
var F2 = w2("◇", "o");
var le = w2("┌", "T");
var d2 = w2("│", "|");
var E2 = w2("└", "—");
var Ie = w2("┐", "T");
var Ee = w2("┘", "—");
var z2 = w2("●", ">");
var H2 = w2("○", " ");
var te = w2("◻", "[•]");
var U = w2("◼", "[+]");
var J2 = w2("◻", "[ ]");
var xe = w2("▪", "•");
var se = w2("─", "-");
var ce = w2("╮", "+");
var Ge = w2("├", "+");
var $e = w2("╯", "+");
var de = w2("╰", "+");
var Oe = w2("╭", "+");
var he = w2("●", "•");
var pe = w2("◆", "*");
var me = w2("▲", "!");
var ge = w2("■", "x");
var V2 = (e) => {
  switch (e) {
    case "initial":
    case "active":
      return t("cyan", _e);
    case "cancel":
      return t("red", oe);
    case "error":
      return t("yellow", ue);
    case "submit":
      return t("green", F2);
  }
};
var ye = (e) => {
  switch (e) {
    case "initial":
    case "active":
      return t("cyan", d2);
    case "cancel":
      return t("red", d2);
    case "error":
      return t("yellow", d2);
    case "submit":
      return t("green", d2);
  }
};
var et2 = (e, i, s, r, u2) => {
  let n = i, o = 0;
  for (let c2 = s;c2 < r; c2++) {
    const a = e[c2];
    if (n = n - a.length, o++, n <= u2)
      break;
  }
  return { lineCount: n, removals: o };
};
var Y2 = ({ cursor: e, options: i, style: s, output: r = process.stdout, maxItems: u2 = Number.POSITIVE_INFINITY, columnPadding: n = 0, rowPadding: o = 4 }) => {
  const c2 = O(r) - n, a = A(r), l = t("dim", "..."), $2 = Math.max(a - o, 0), y2 = Math.max(Math.min(u2, $2), 5);
  let p2 = 0;
  e >= y2 - 3 && (p2 = Math.max(Math.min(e - y2 + 3, i.length - y2), 0));
  let m = y2 < i.length && p2 > 0, g = y2 < i.length && p2 + y2 < i.length;
  const S2 = Math.min(p2 + y2, i.length), h = [];
  let f = 0;
  m && f++, g && f++;
  const v = p2 + (m ? 1 : 0), T2 = S2 - (g ? 1 : 0);
  for (let b = v;b < T2; b++) {
    const x = wrapAnsi(s(i[b], b === e), c2, { hard: true, trim: false }).split(`
`);
    h.push(x), f += x.length;
  }
  if (f > $2) {
    let b = 0, x = 0, G2 = f;
    const M2 = e - v, R2 = (j2, D2) => et2(h, G2, j2, D2, $2);
    m ? ({ lineCount: G2, removals: b } = R2(0, M2), G2 > $2 && ({ lineCount: G2, removals: x } = R2(M2 + 1, h.length))) : ({ lineCount: G2, removals: x } = R2(M2 + 1, h.length), G2 > $2 && ({ lineCount: G2, removals: b } = R2(0, M2))), b > 0 && (m = true, h.splice(0, b)), x > 0 && (g = true, h.splice(h.length - x, x));
  }
  const C2 = [];
  m && C2.push(l);
  for (const b of h)
    for (const x of b)
      C2.push(x);
  return g && C2.push(l), C2;
};
var gt = (e = "", i) => {
  const s = i?.output ?? process.stdout, r = i?.withGuide ?? u.withGuide ? `${t("gray", d2)}
${t("gray", E2)}  ` : "";
  s.write(`${r}${e}

`);
};
var Ct = (e) => t("magenta", e);
var fe = ({ indicator: e = "dots", onCancel: i, output: s = process.stdout, cancelMessage: r, errorMessage: u2, frames: n = ee ? ["◒", "◐", "◓", "◑"] : ["•", "o", "O", "0"], delay: o = ee ? 80 : 120, signal: c2, ...a } = {}) => {
  const l = ae();
  let $2, y2, p2 = false, m = false, g = "", S2, h = performance.now();
  const f = O(s), v = a?.styleFrame ?? Ct, T2 = (_2) => {
    const A2 = _2 > 1 ? u2 ?? u.messages.error : r ?? u.messages.cancel;
    m = _2 === 1, p2 && (W2(A2, _2), m && typeof i == "function" && i());
  }, C2 = () => T2(2), b = () => T2(1), x = () => {
    process.on("uncaughtExceptionMonitor", C2), process.on("unhandledRejection", C2), process.on("SIGINT", b), process.on("SIGTERM", b), process.on("exit", T2), c2 && c2.addEventListener("abort", b);
  }, G2 = () => {
    process.removeListener("uncaughtExceptionMonitor", C2), process.removeListener("unhandledRejection", C2), process.removeListener("SIGINT", b), process.removeListener("SIGTERM", b), process.removeListener("exit", T2), c2 && c2.removeEventListener("abort", b);
  }, M2 = () => {
    if (S2 === undefined)
      return;
    l && s.write(`
`);
    const _2 = wrapAnsi(S2, f, { hard: true, trim: false }).split(`
`);
    _2.length > 1 && s.write(import_sisteransi2.cursor.up(_2.length - 1)), s.write(import_sisteransi2.cursor.to(0)), s.write(import_sisteransi2.erase.down());
  }, R2 = (_2) => _2.replace(/\.+$/, ""), j2 = (_2) => {
    const A2 = (performance.now() - _2) / 1000, k2 = Math.floor(A2 / 60), L2 = Math.floor(A2 % 60);
    return k2 > 0 ? `[${k2}m ${L2}s]` : `[${L2}s]`;
  }, D2 = a.withGuide ?? u.withGuide, ie = (_2 = "") => {
    p2 = true, $2 = z({ output: s }), g = R2(_2), h = performance.now(), D2 && s.write(`${t("gray", d2)}
`);
    let A2 = 0, k2 = 0;
    x(), y2 = setInterval(() => {
      if (l && g === S2)
        return;
      M2(), S2 = g;
      const L2 = v(n[A2]);
      let Z2;
      if (l)
        Z2 = `${L2}  ${g}...`;
      else if (e === "timer")
        Z2 = `${L2}  ${g} ${j2(h)}`;
      else {
        const Be = ".".repeat(Math.floor(k2)).slice(0, 3);
        Z2 = `${L2}  ${g}${Be}`;
      }
      const Ne = wrapAnsi(Z2, f, { hard: true, trim: false });
      s.write(Ne), A2 = A2 + 1 < n.length ? A2 + 1 : 0, k2 = k2 < 4 ? k2 + 0.125 : 0;
    }, o);
  }, W2 = (_2 = "", A2 = 0, k2 = false) => {
    if (!p2)
      return;
    p2 = false, clearInterval(y2), M2();
    const L2 = A2 === 0 ? t("green", F2) : A2 === 1 ? t("red", oe) : t("red", ue);
    g = _2 ?? g, k2 || (e === "timer" ? s.write(`${L2}  ${g} ${j2(h)}
`) : s.write(`${L2}  ${g}
`)), G2(), $2();
  };
  return { start: ie, stop: (_2 = "") => W2(_2, 0), message: (_2 = "") => {
    g = R2(_2 ?? g);
  }, cancel: (_2 = "") => W2(_2, 1), error: (_2 = "") => W2(_2, 2), clear: () => W2("", 0, true), get isCancelled() {
    return m;
  } };
};
var Ve = { light: w2("─", "-"), heavy: w2("━", "="), block: w2("█", "#") };
var re = (e, i) => e.includes(`
`) ? e.split(`
`).map((s) => i(s)).join(`
`) : i(e);
var _t = (e) => {
  const i = (s, r) => {
    const u2 = s.label ?? String(s.value);
    switch (r) {
      case "disabled":
        return `${t("gray", H2)} ${re(u2, (n) => t("gray", n))}${s.hint ? ` ${t("dim", `(${s.hint ?? "disabled"})`)}` : ""}`;
      case "selected":
        return `${re(u2, (n) => t("dim", n))}`;
      case "active":
        return `${t("green", z2)} ${u2}${s.hint ? ` ${t("dim", `(${s.hint})`)}` : ""}`;
      case "cancelled":
        return `${re(u2, (n) => t(["strikethrough", "dim"], n))}`;
      default:
        return `${t("dim", H2)} ${re(u2, (n) => t("dim", n))}`;
    }
  };
  return new nt({ options: e.options, signal: e.signal, input: e.input, output: e.output, initialValue: e.initialValue, render() {
    const s = e.withGuide ?? u.withGuide, r = `${V2(this.state)}  `, u2 = `${ye(this.state)}  `, n = R(e.output, e.message, u2, r), o = `${s ? `${t("gray", d2)}
` : ""}${n}
`;
    switch (this.state) {
      case "submit": {
        const c2 = s ? `${t("gray", d2)}  ` : "", a = R(e.output, i(this.options[this.cursor], "selected"), c2);
        return `${o}${a}`;
      }
      case "cancel": {
        const c2 = s ? `${t("gray", d2)}  ` : "", a = R(e.output, i(this.options[this.cursor], "cancelled"), c2);
        return `${o}${a}${s ? `
${t("gray", d2)}` : ""}`;
      }
      default: {
        const c2 = s ? `${t("cyan", d2)}  ` : "", a = s ? t("cyan", E2) : "", l = o.split(`
`).length, $2 = s ? 2 : 1;
        return `${o}${c2}${Y2({ output: e.output, cursor: this.cursor, options: this.options, maxItems: e.maxItems, columnPadding: c2.length, rowPadding: l + $2, style: (y2, p2) => i(y2, y2.disabled ? "disabled" : p2 ? "active" : "inactive") }).join(`
${c2}`)}
${a}
`;
      }
    }
  } }).prompt();
};
var je = `${t("gray", d2)}  `;

// src/backends/opencode/client.ts
import { createServer } from "node:net";
// node_modules/@opencode-ai/sdk/dist/gen/core/serverSentEvents.gen.js
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

// node_modules/@opencode-ai/sdk/dist/gen/core/auth.gen.js
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

// node_modules/@opencode-ai/sdk/dist/gen/core/bodySerializer.gen.js
var jsonBodySerializer = {
  bodySerializer: (body) => JSON.stringify(body, (_key, value) => typeof value === "bigint" ? value.toString() : value)
};

// node_modules/@opencode-ai/sdk/dist/gen/core/pathSerializer.gen.js
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

// node_modules/@opencode-ai/sdk/dist/gen/core/utils.gen.js
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

// node_modules/@opencode-ai/sdk/dist/gen/client/utils.gen.js
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
var mergeConfigs = (a, b) => {
  const config = { ...a, ...b };
  if (config.baseUrl?.endsWith("/")) {
    config.baseUrl = config.baseUrl.substring(0, config.baseUrl.length - 1);
  }
  config.headers = mergeHeaders(a.headers, b.headers);
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

// node_modules/@opencode-ai/sdk/dist/gen/client/client.gen.js
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
// node_modules/@opencode-ai/sdk/dist/gen/core/params.gen.js
var extraPrefixesMap = {
  $body_: "body",
  $headers_: "headers",
  $path_: "path",
  $query_: "query"
};
var extraPrefixes = Object.entries(extraPrefixesMap);
// node_modules/@opencode-ai/sdk/dist/gen/client.gen.js
var client = createClient(createConfig({
  baseUrl: "http://localhost:4096"
}));

// node_modules/@opencode-ai/sdk/dist/gen/sdk.gen.js
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

// node_modules/@opencode-ai/sdk/dist/client.js
function pick(value, fallback) {
  if (!value)
    return;
  if (!fallback)
    return value;
  if (value === fallback)
    return fallback;
  if (value === encodeURIComponent(fallback))
    return fallback;
  return value;
}
function rewrite(request, directory) {
  if (request.method !== "GET" && request.method !== "HEAD")
    return request;
  const value = pick(request.headers.get("x-opencode-directory"), directory);
  if (!value)
    return request;
  const url = new URL(request.url);
  if (!url.searchParams.has("directory")) {
    url.searchParams.set("directory", value);
  }
  const next = new Request(url, request);
  next.headers.delete("x-opencode-directory");
  return next;
}
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
      "x-opencode-directory": encodeURIComponent(config.directory)
    };
  }
  const client2 = createClient(config);
  client2.interceptors.request.use((request) => rewrite(request, config?.directory));
  return new OpencodeClient({ client: client2 });
}
// node_modules/@opencode-ai/sdk/dist/server.js
var import_cross_spawn = __toESM(require_cross_spawn(), 1);

// node_modules/@opencode-ai/sdk/dist/process.js
import { spawnSync } from "node:child_process";
function stop(proc) {
  if (proc.exitCode !== null || proc.signalCode !== null)
    return;
  if (process.platform === "win32" && proc.pid) {
    const out = spawnSync("taskkill", ["/pid", String(proc.pid), "/T", "/F"], { windowsHide: true });
    if (!out.error && out.status === 0)
      return;
  }
  proc.kill();
}
function bindAbort(proc, signal, onAbort) {
  if (!signal)
    return () => {};
  const abort = () => {
    clear();
    stop(proc);
    onAbort?.();
  };
  const clear = () => {
    signal.removeEventListener("abort", abort);
    proc.off("exit", clear);
    proc.off("error", clear);
  };
  signal.addEventListener("abort", abort, { once: true });
  proc.on("exit", clear);
  proc.on("error", clear);
  if (signal.aborted)
    abort();
  return clear;
}

// node_modules/@opencode-ai/sdk/dist/server.js
async function createOpencodeServer(options) {
  options = Object.assign({
    hostname: "127.0.0.1",
    port: 4096,
    timeout: 5000
  }, options ?? {});
  const args = [`serve`, `--hostname=${options.hostname}`, `--port=${options.port}`];
  if (options.config?.logLevel)
    args.push(`--log-level=${options.config.logLevel}`);
  const proc = import_cross_spawn.default(`opencode`, args, {
    env: {
      ...process.env,
      OPENCODE_CONFIG_CONTENT: JSON.stringify(options.config ?? {})
    }
  });
  let clear = () => {};
  const url = await new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clear();
      stop(proc);
      reject(new Error(`Timeout waiting for server to start after ${options.timeout}ms`));
    }, options.timeout);
    let output = "";
    let resolved = false;
    proc.stdout?.on("data", (chunk) => {
      if (resolved)
        return;
      output += chunk.toString();
      const lines = output.split(`
`);
      for (const line of lines) {
        if (line.startsWith("opencode server listening")) {
          const match = line.match(/on\s+(https?:\/\/[^\s]+)/);
          if (!match) {
            clear();
            stop(proc);
            clearTimeout(id);
            reject(new Error(`Failed to parse server url from output: ${line}`));
            return;
          }
          clearTimeout(id);
          resolved = true;
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
    clear = bindAbort(proc, options.signal, () => {
      clearTimeout(id);
      reject(options.signal?.reason);
    });
  });
  return {
    url,
    close() {
      clear();
      stop(proc);
    }
  };
}
// node_modules/@opencode-ai/sdk/dist/index.js
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
    const extraStr = Object.entries(extra).map(([k2, v]) => `${k2}=${typeof v === "object" ? JSON.stringify(v) : v}`).join(" ");
    return extraStr ? ` ${extraStr}` : "";
  }
  function create(tags) {
    const tagStr = tags ? Object.entries(tags).map(([k2, v]) => `${k2}=${v}`).join(" ") : "";
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
        let assistantMessageId = null;
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
                  const existingToolIndex = toolInvocations.findIndex((t2) => t2.id === toolId);
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
              const abortError = controller.signal.reason instanceof Error ? controller.signal.reason : idleTimedOut ? idleTimeoutError : hardTimeoutError;
              await abortOnce(abortError);
              throw abortError;
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
  return ALL_TECHNIQUES.find((t2) => t2.id === id);
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
var log2 = Log.create({ service: "discord-webhook" });

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
      log2.warn("Invalid Discord webhook URL, notifications disabled", {
        webhookUrl: this.maskWebhookUrl(this.webhookUrl)
      });
      this.enabled = false;
    }
    log2.info("Discord webhook client initialized", {
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
      log2.debug("Discord notifications disabled, skipping send");
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
      log2.debug("Sending Discord notification", {
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
        log2.error("Discord webhook request failed", {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        return false;
      }
      log2.debug("Discord notification sent successfully");
      return true;
    } catch (error) {
      log2.error("Failed to send Discord notification", {
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
    log2.debug("No DISCORD_WEBHOOK_URL env var set, Discord notifications disabled");
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
var log3 = Log.create({ service: "flow-store" });

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
        log3.debug("Created directory", { path: dirPath });
      }
    }
    log3.info("Flow store initialized", {
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
        log3.warn("Flow schema version mismatch", {
          expected: FLOW_SCHEMA_VERSION,
          found: state.schemaVersion
        });
      }
      log3.info("Loaded flow state", {
        runId: state.runId,
        status: state.status,
        currentCycle: state.currentCycle
      });
      return state;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      log3.error("Failed to load flow state", { error: errorMsg });
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
    log3.debug("Saved flow state", { runId: state.runId });
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
    log3.debug("Saved checkpoint", {
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
      log3.error("Failed to load checkpoint", { error: errorMsg });
      return null;
    }
  }
  saveIteration(cycle) {
    const cyclePath = this.path(`iterations/${cycle.cycleNumber}.json`);
    writeFileSync(cyclePath, JSON.stringify(cycle, null, 2));
    const contextPath = this.path(`contexts/${cycle.cycleNumber}.md`);
    const contextContent = this.generateContextContent(cycle);
    writeFileSync(contextPath, contextContent);
    log3.debug("Saved iteration", { cycle: cycle.cycleNumber });
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
    log3.info("Cycle failed", {
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
    log3.info("Cycle completed", {
      runId: this.runId,
      cycle: cycle.cycleNumber,
      completedCycles: state.completedCycles
    });
  }
  cleanup() {
    log3.info("Flow store cleanup requested", { runId: this.runId });
  }
}

// src/execution/ralph-loop.ts
var log4 = Log.create({ service: "ralph-loop" });
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
    log4.info("Starting fresh Ralph loop", {
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
    log4.info("Resuming Ralph loop", { runId: this.config.runId });
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
          log4.info("Retrying cycle", {
            cycleNumber,
            attempt,
            lastError
          });
        }
        const client3 = await OpenCodeClient.create({
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
            log4.warn("Cycle error, will retry", {
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
    const failedGates = result.cycleState.gateResults.filter((g) => !g.passed);
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
    const promptTokens = new Set(promptLower.split(/\W+/).filter((t2) => t2.length > 2));
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
        const specTokens = new Set(specContentLower.split(/\W+/).filter((t2) => t2.length > 2));
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
    matches.sort((a, b) => b.score - a.score);
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
        log4.debug("Loaded spec for context", {
          spec: match.dir,
          score: match.score
        });
      } catch {
        log4.warn("Failed to read spec", { spec: match.dir });
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
      const requiredFailed = gateResults.find((g) => !g.passed && this.config.gates.includes(g.gate));
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
      log4.warn("Phase watchdog triggered", {
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
          log4.debug("Tool invocation", {
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
    log4.debug("Gate command result", {
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
    log4.debug("Checking acceptance criteria", {
      cycleNumber: cycle.cycleNumber
    });
    const workPhase = cycle.phases["work" /* WORK */];
    if (!workPhase) {
      log4.warn("No work phase found in cycle");
      return false;
    }
    const workResponse = workPhase.response.trim();
    if (!workResponse) {
      log4.debug("Acceptance failed: empty work response");
      return false;
    }
    const hasNoChangesMarker = /NO\s*CHANGES?[:\s]/i.test(workResponse);
    const hasProgressSignal = this.hasProgressSignal(cycle);
    if (hasNoChangesMarker) {
      const hasReason = /NO\s*CHANGES?[:\s]+[A-Z]/.test(workResponse);
      if (hasReason) {
        log4.debug("Acceptance passed: NO CHANGES with reason");
        return true;
      }
    }
    if (hasProgressSignal) {
      log4.debug("Acceptance passed: progress signal detected");
      return true;
    }
    if (workResponse.length < 20) {
      log4.debug("Acceptance failed: response too short/fluffy");
      return false;
    }
    const willPattern = /\bI (will|need to|should|must|have to|am going to)\b/i;
    if (willPattern.test(workResponse)) {
      log4.debug("Acceptance failed: response contains 'I will' pattern (no action taken)");
      return false;
    }
    const mentionsChanges = /\b(change|modify|create|update|delete|add|fix|implement|refactor|write|run|test)\b/i.test(workResponse);
    if (mentionsChanges) {
      log4.debug("Acceptance passed: response mentions actionable changes");
      return true;
    }
    log4.debug("Acceptance failed: no valid progress signal");
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
    log4.info("Ralph loop stopped", { reason, summary });
  }
}
async function createRalphLoopRunner(flags, baseConfig) {
  const optimizer = new PromptOptimizer({
    autoApprove: flags.ci ?? false,
    verbosity: flags.verbose ? "verbose" : "normal"
  });
  return new RalphLoopRunner(flags, baseConfig, optimizer);
}

// src/cli/run-cli.ts
var log5 = Log.create({ service: "run-cli" });
var activeClient = null;
var cleanupHandlersRegistered = false;
async function setupCleanupHandlers() {
  if (cleanupHandlersRegistered)
    return;
  cleanupHandlersRegistered = true;
  const cleanupFn = async () => {
    if (activeClient) {
      try {
        log5.info("Cleanup signal received, closing OpenCode server...");
        await activeClient.cleanup();
        log5.info("OpenCode server closed successfully");
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        log5.error("Error during cleanup", { error: errorMsg });
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
    log5.error("Uncaught exception", {
      error: errorMsg,
      stack: error instanceof Error ? error.stack : undefined
    });
    await cleanupFn();
  });
  process.on("unhandledRejection", async (reason) => {
    const errorMsg = reason instanceof Error ? reason.message : String(reason);
    log5.error("Unhandled rejection", {
      error: errorMsg,
      stack: reason instanceof Error ? reason.stack : undefined
    });
    await cleanupFn();
  });
}
async function runCli(config, flags) {
  await setupCleanupHandlers();
  log5.info("Starting CLI execution", { workflow: flags.workflow });
  const prompt = flags.workflow;
  if (!prompt) {
    UI.error("No prompt or workflow provided");
    process.exit(1);
  }
  const optimizer = new PromptOptimizer({
    autoApprove: flags.ci ?? false,
    verbosity: flags.verbose ? "verbose" : "normal"
  });
  UI.header("Prompt Optimization");
  const session = optimizer.createSession(prompt);
  log5.debug("Created optimization session", { steps: session.steps.length });
  if (!flags.ci) {
    for (const step of session.steps) {
      const action = await _t({
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
      if (q(action)) {
        log5.info("User cancelled");
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
  UI.header("Ralph Loop Mode");
  UI.info("Running with fresh OpenCode sessions per iteration");
  if (flags.ship) {
    UI.info("Mode: SHIP (auto-exit when agent outputs '<promise>SHIP</promise>')");
    UI.info("Completion promise: <promise>SHIP</promise>");
  } else if (flags.draft || !flags.ship && !flags.completionPromise) {
    UI.info("Mode: DRAFT (runs for max-cycles then stops for your review)");
    UI.info("Completion promise: none (will run all cycles)");
  } else {
    UI.info("Mode: Custom completion promise");
    UI.info(`Completion promise: ${flags.completionPromise}`);
  }
  UI.info(`Max cycles: ${flags.maxCycles ?? 50}`);
  UI.info(`Stuck threshold: ${flags.stuckThreshold ?? 5}`);
  UI.println();
  try {
    const runner = await createRalphLoopRunner(flags, config);
    await runner.run();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log5.error("Loop execution failed", { error: message });
    UI.error(message);
    process.exit(1);
  }
  gt("Done!");
}
async function runSingleShotMode(config, flags, optimizedPrompt) {
  UI.header("Execution");
  const s = fe();
  s.start("Connecting to OpenCode...");
  try {
    activeClient = await OpenCodeClient.create({
      existingServerUrl: process.env.OPENCODE_URL,
      serverStartupTimeout: 1e4
    });
    const openSession = await activeClient.createSession(optimizedPrompt);
    log5.info("Created OpenCode session", { id: openSession.id });
    s.stop("Connected");
    UI.println();
    UI.println(`${UI.Style.TEXT_DIM}Executing task...${UI.Style.TEXT_NORMAL}`);
    let response;
    if (!flags.noStream) {
      const streamingResponse = await openSession.sendMessageStream("Execute this task and provide a detailed result summary.");
      UI.println();
      const reader = streamingResponse.stream.getReader();
      const decoder = new TextDecoder;
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done)
            break;
          if (value) {
            const text = decoder.decode(value, { stream: true });
            UI.print(text);
          }
        }
      } finally {
        reader.releaseLock();
      }
      response = await streamingResponse.complete;
    } else {
      UI.println();
      UI.println(`${UI.Style.TEXT_DIM}Buffering response...${UI.Style.TEXT_NORMAL}`);
      response = await openSession.sendMessage("Execute this task and provide a detailed result summary.");
      UI.println();
      UI.println(response.content);
    }
    UI.println();
    UI.success("Execution complete");
    if (activeClient) {
      await activeClient.cleanup();
      activeClient = null;
    }
    log5.info("Execution complete");
  } catch (error) {
    s.stop("Connection failed");
    const message = error instanceof Error ? error.message : String(error);
    log5.error("Execution failed", { error: message });
    UI.error(message);
    if (activeClient) {
      try {
        await activeClient.cleanup();
      } catch (cleanupError) {
        const cleanupMsg = cleanupError instanceof Error ? cleanupError.message : String(cleanupError);
        log5.error("Error during error cleanup", { error: cleanupMsg });
      }
      activeClient = null;
    }
    process.exit(1);
  }
  gt("Done!");
}
export {
  runCli
};

//# debugId=B13C6D432477555864756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vbm9kZV9tb2R1bGVzL3Npc3RlcmFuc2kvc3JjL2luZGV4LmpzIiwgIi4uL25vZGVfbW9kdWxlcy9pc2V4ZS93aW5kb3dzLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9pc2V4ZS9tb2RlLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9pc2V4ZS9pbmRleC5qcyIsICIuLi9ub2RlX21vZHVsZXMvd2hpY2gvd2hpY2guanMiLCAiLi4vbm9kZV9tb2R1bGVzL3BhdGgta2V5L2luZGV4LmpzIiwgIi4uL25vZGVfbW9kdWxlcy9jcm9zcy1zcGF3bi9saWIvdXRpbC9yZXNvbHZlQ29tbWFuZC5qcyIsICIuLi9ub2RlX21vZHVsZXMvY3Jvc3Mtc3Bhd24vbGliL3V0aWwvZXNjYXBlLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9zaGViYW5nLXJlZ2V4L2luZGV4LmpzIiwgIi4uL25vZGVfbW9kdWxlcy9zaGViYW5nLWNvbW1hbmQvaW5kZXguanMiLCAiLi4vbm9kZV9tb2R1bGVzL2Nyb3NzLXNwYXduL2xpYi91dGlsL3JlYWRTaGViYW5nLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9jcm9zcy1zcGF3bi9saWIvcGFyc2UuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2Nyb3NzLXNwYXduL2xpYi9lbm9lbnQuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2Nyb3NzLXNwYXduL2luZGV4LmpzIiwgIi4uL25vZGVfbW9kdWxlcy9AY2xhY2svY29yZS9kaXN0L2luZGV4Lm1qcyIsICIuLi9ub2RlX21vZHVsZXMvZmFzdC1zdHJpbmctdHJ1bmNhdGVkLXdpZHRoL2Rpc3QvdXRpbHMuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2Zhc3Qtc3RyaW5nLXRydW5jYXRlZC13aWR0aC9kaXN0L2luZGV4LmpzIiwgIi4uL25vZGVfbW9kdWxlcy9mYXN0LXN0cmluZy13aWR0aC9kaXN0L2luZGV4LmpzIiwgIi4uL25vZGVfbW9kdWxlcy9mYXN0LXdyYXAtYW5zaS9saWIvbWFpbi5qcyIsICIuLi9ub2RlX21vZHVsZXMvQGNsYWNrL3Byb21wdHMvZGlzdC9pbmRleC5tanMiLCAiLi4vc3JjL2JhY2tlbmRzL29wZW5jb2RlL2NsaWVudC50cyIsICIuLi9ub2RlX21vZHVsZXMvQG9wZW5jb2RlLWFpL3Nkay9kaXN0L2dlbi9jb3JlL3NlcnZlclNlbnRFdmVudHMuZ2VuLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9Ab3BlbmNvZGUtYWkvc2RrL2Rpc3QvZ2VuL2NvcmUvYXV0aC5nZW4uanMiLCAiLi4vbm9kZV9tb2R1bGVzL0BvcGVuY29kZS1haS9zZGsvZGlzdC9nZW4vY29yZS9ib2R5U2VyaWFsaXplci5nZW4uanMiLCAiLi4vbm9kZV9tb2R1bGVzL0BvcGVuY29kZS1haS9zZGsvZGlzdC9nZW4vY29yZS9wYXRoU2VyaWFsaXplci5nZW4uanMiLCAiLi4vbm9kZV9tb2R1bGVzL0BvcGVuY29kZS1haS9zZGsvZGlzdC9nZW4vY29yZS91dGlscy5nZW4uanMiLCAiLi4vbm9kZV9tb2R1bGVzL0BvcGVuY29kZS1haS9zZGsvZGlzdC9nZW4vY2xpZW50L3V0aWxzLmdlbi5qcyIsICIuLi9ub2RlX21vZHVsZXMvQG9wZW5jb2RlLWFpL3Nkay9kaXN0L2dlbi9jbGllbnQvY2xpZW50Lmdlbi5qcyIsICIuLi9ub2RlX21vZHVsZXMvQG9wZW5jb2RlLWFpL3Nkay9kaXN0L2dlbi9jb3JlL3BhcmFtcy5nZW4uanMiLCAiLi4vbm9kZV9tb2R1bGVzL0BvcGVuY29kZS1haS9zZGsvZGlzdC9nZW4vY2xpZW50Lmdlbi5qcyIsICIuLi9ub2RlX21vZHVsZXMvQG9wZW5jb2RlLWFpL3Nkay9kaXN0L2dlbi9zZGsuZ2VuLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9Ab3BlbmNvZGUtYWkvc2RrL2Rpc3QvY2xpZW50LmpzIiwgIi4uL25vZGVfbW9kdWxlcy9Ab3BlbmNvZGUtYWkvc2RrL2Rpc3Qvc2VydmVyLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9Ab3BlbmNvZGUtYWkvc2RrL2Rpc3QvcHJvY2Vzcy5qcyIsICIuLi9ub2RlX21vZHVsZXMvQG9wZW5jb2RlLWFpL3Nkay9kaXN0L2luZGV4LmpzIiwgIi4uL3NyYy91dGlsL2xvZy50cyIsICIuLi9zcmMvZXhlY3V0aW9uL3JhbHBoLWxvb3AudHMiLCAiLi4vc3JjL2NsaS91aS50cyIsICIuLi9zcmMvcHJvbXB0LW9wdGltaXphdGlvbi9hbmFseXplci50cyIsICIuLi9zcmMvcHJvbXB0LW9wdGltaXphdGlvbi90ZWNobmlxdWVzLnRzIiwgIi4uL3NyYy9wcm9tcHQtb3B0aW1pemF0aW9uL29wdGltaXplci50cyIsICIuLi9zcmMvdXRpbC9kaXNjb3JkLXdlYmhvb2sudHMiLCAiLi4vc3JjL2V4ZWN1dGlvbi9mbG93LXN0b3JlLnRzIiwgIi4uL3NyYy9leGVjdXRpb24vZmxvdy10eXBlcy50cyIsICIuLi9zcmMvY2xpL3J1bi1jbGkudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBFU0MgPSAnXFx4MUInO1xuY29uc3QgQ1NJID0gYCR7RVNDfVtgO1xuY29uc3QgYmVlcCA9ICdcXHUwMDA3JztcblxuY29uc3QgY3Vyc29yID0ge1xuICB0byh4LCB5KSB7XG4gICAgaWYgKCF5KSByZXR1cm4gYCR7Q1NJfSR7eCArIDF9R2A7XG4gICAgcmV0dXJuIGAke0NTSX0ke3kgKyAxfTske3ggKyAxfUhgO1xuICB9LFxuICBtb3ZlKHgsIHkpIHtcbiAgICBsZXQgcmV0ID0gJyc7XG5cbiAgICBpZiAoeCA8IDApIHJldCArPSBgJHtDU0l9JHsteH1EYDtcbiAgICBlbHNlIGlmICh4ID4gMCkgcmV0ICs9IGAke0NTSX0ke3h9Q2A7XG5cbiAgICBpZiAoeSA8IDApIHJldCArPSBgJHtDU0l9JHsteX1BYDtcbiAgICBlbHNlIGlmICh5ID4gMCkgcmV0ICs9IGAke0NTSX0ke3l9QmA7XG5cbiAgICByZXR1cm4gcmV0O1xuICB9LFxuICB1cDogKGNvdW50ID0gMSkgPT4gYCR7Q1NJfSR7Y291bnR9QWAsXG4gIGRvd246IChjb3VudCA9IDEpID0+IGAke0NTSX0ke2NvdW50fUJgLFxuICBmb3J3YXJkOiAoY291bnQgPSAxKSA9PiBgJHtDU0l9JHtjb3VudH1DYCxcbiAgYmFja3dhcmQ6IChjb3VudCA9IDEpID0+IGAke0NTSX0ke2NvdW50fURgLFxuICBuZXh0TGluZTogKGNvdW50ID0gMSkgPT4gYCR7Q1NJfUVgLnJlcGVhdChjb3VudCksXG4gIHByZXZMaW5lOiAoY291bnQgPSAxKSA9PiBgJHtDU0l9RmAucmVwZWF0KGNvdW50KSxcbiAgbGVmdDogYCR7Q1NJfUdgLFxuICBoaWRlOiBgJHtDU0l9PzI1bGAsXG4gIHNob3c6IGAke0NTSX0/MjVoYCxcbiAgc2F2ZTogYCR7RVNDfTdgLFxuICByZXN0b3JlOiBgJHtFU0N9OGBcbn1cblxuY29uc3Qgc2Nyb2xsID0ge1xuICB1cDogKGNvdW50ID0gMSkgPT4gYCR7Q1NJfVNgLnJlcGVhdChjb3VudCksXG4gIGRvd246IChjb3VudCA9IDEpID0+IGAke0NTSX1UYC5yZXBlYXQoY291bnQpXG59XG5cbmNvbnN0IGVyYXNlID0ge1xuICBzY3JlZW46IGAke0NTSX0ySmAsXG4gIHVwOiAoY291bnQgPSAxKSA9PiBgJHtDU0l9MUpgLnJlcGVhdChjb3VudCksXG4gIGRvd246IChjb3VudCA9IDEpID0+IGAke0NTSX1KYC5yZXBlYXQoY291bnQpLFxuICBsaW5lOiBgJHtDU0l9MktgLFxuICBsaW5lRW5kOiBgJHtDU0l9S2AsXG4gIGxpbmVTdGFydDogYCR7Q1NJfTFLYCxcbiAgbGluZXMoY291bnQpIHtcbiAgICBsZXQgY2xlYXIgPSAnJztcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvdW50OyBpKyspXG4gICAgICBjbGVhciArPSB0aGlzLmxpbmUgKyAoaSA8IGNvdW50IC0gMSA/IGN1cnNvci51cCgpIDogJycpO1xuICAgIGlmIChjb3VudClcbiAgICAgIGNsZWFyICs9IGN1cnNvci5sZWZ0O1xuICAgIHJldHVybiBjbGVhcjtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHsgY3Vyc29yLCBzY3JvbGwsIGVyYXNlLCBiZWVwIH07XG4iLAogICAgIm1vZHVsZS5leHBvcnRzID0gaXNleGVcbmlzZXhlLnN5bmMgPSBzeW5jXG5cbnZhciBmcyA9IHJlcXVpcmUoJ2ZzJylcblxuZnVuY3Rpb24gY2hlY2tQYXRoRXh0IChwYXRoLCBvcHRpb25zKSB7XG4gIHZhciBwYXRoZXh0ID0gb3B0aW9ucy5wYXRoRXh0ICE9PSB1bmRlZmluZWQgP1xuICAgIG9wdGlvbnMucGF0aEV4dCA6IHByb2Nlc3MuZW52LlBBVEhFWFRcblxuICBpZiAoIXBhdGhleHQpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgcGF0aGV4dCA9IHBhdGhleHQuc3BsaXQoJzsnKVxuICBpZiAocGF0aGV4dC5pbmRleE9mKCcnKSAhPT0gLTEpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcGF0aGV4dC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBwID0gcGF0aGV4dFtpXS50b0xvd2VyQ2FzZSgpXG4gICAgaWYgKHAgJiYgcGF0aC5zdWJzdHIoLXAubGVuZ3RoKS50b0xvd2VyQ2FzZSgpID09PSBwKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2Vcbn1cblxuZnVuY3Rpb24gY2hlY2tTdGF0IChzdGF0LCBwYXRoLCBvcHRpb25zKSB7XG4gIGlmICghc3RhdC5pc1N5bWJvbGljTGluaygpICYmICFzdGF0LmlzRmlsZSgpKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbiAgcmV0dXJuIGNoZWNrUGF0aEV4dChwYXRoLCBvcHRpb25zKVxufVxuXG5mdW5jdGlvbiBpc2V4ZSAocGF0aCwgb3B0aW9ucywgY2IpIHtcbiAgZnMuc3RhdChwYXRoLCBmdW5jdGlvbiAoZXIsIHN0YXQpIHtcbiAgICBjYihlciwgZXIgPyBmYWxzZSA6IGNoZWNrU3RhdChzdGF0LCBwYXRoLCBvcHRpb25zKSlcbiAgfSlcbn1cblxuZnVuY3Rpb24gc3luYyAocGF0aCwgb3B0aW9ucykge1xuICByZXR1cm4gY2hlY2tTdGF0KGZzLnN0YXRTeW5jKHBhdGgpLCBwYXRoLCBvcHRpb25zKVxufVxuIiwKICAgICJtb2R1bGUuZXhwb3J0cyA9IGlzZXhlXG5pc2V4ZS5zeW5jID0gc3luY1xuXG52YXIgZnMgPSByZXF1aXJlKCdmcycpXG5cbmZ1bmN0aW9uIGlzZXhlIChwYXRoLCBvcHRpb25zLCBjYikge1xuICBmcy5zdGF0KHBhdGgsIGZ1bmN0aW9uIChlciwgc3RhdCkge1xuICAgIGNiKGVyLCBlciA/IGZhbHNlIDogY2hlY2tTdGF0KHN0YXQsIG9wdGlvbnMpKVxuICB9KVxufVxuXG5mdW5jdGlvbiBzeW5jIChwYXRoLCBvcHRpb25zKSB7XG4gIHJldHVybiBjaGVja1N0YXQoZnMuc3RhdFN5bmMocGF0aCksIG9wdGlvbnMpXG59XG5cbmZ1bmN0aW9uIGNoZWNrU3RhdCAoc3RhdCwgb3B0aW9ucykge1xuICByZXR1cm4gc3RhdC5pc0ZpbGUoKSAmJiBjaGVja01vZGUoc3RhdCwgb3B0aW9ucylcbn1cblxuZnVuY3Rpb24gY2hlY2tNb2RlIChzdGF0LCBvcHRpb25zKSB7XG4gIHZhciBtb2QgPSBzdGF0Lm1vZGVcbiAgdmFyIHVpZCA9IHN0YXQudWlkXG4gIHZhciBnaWQgPSBzdGF0LmdpZFxuXG4gIHZhciBteVVpZCA9IG9wdGlvbnMudWlkICE9PSB1bmRlZmluZWQgP1xuICAgIG9wdGlvbnMudWlkIDogcHJvY2Vzcy5nZXR1aWQgJiYgcHJvY2Vzcy5nZXR1aWQoKVxuICB2YXIgbXlHaWQgPSBvcHRpb25zLmdpZCAhPT0gdW5kZWZpbmVkID9cbiAgICBvcHRpb25zLmdpZCA6IHByb2Nlc3MuZ2V0Z2lkICYmIHByb2Nlc3MuZ2V0Z2lkKClcblxuICB2YXIgdSA9IHBhcnNlSW50KCcxMDAnLCA4KVxuICB2YXIgZyA9IHBhcnNlSW50KCcwMTAnLCA4KVxuICB2YXIgbyA9IHBhcnNlSW50KCcwMDEnLCA4KVxuICB2YXIgdWcgPSB1IHwgZ1xuXG4gIHZhciByZXQgPSAobW9kICYgbykgfHxcbiAgICAobW9kICYgZykgJiYgZ2lkID09PSBteUdpZCB8fFxuICAgIChtb2QgJiB1KSAmJiB1aWQgPT09IG15VWlkIHx8XG4gICAgKG1vZCAmIHVnKSAmJiBteVVpZCA9PT0gMFxuXG4gIHJldHVybiByZXRcbn1cbiIsCiAgICAidmFyIGZzID0gcmVxdWlyZSgnZnMnKVxudmFyIGNvcmVcbmlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInIHx8IGdsb2JhbC5URVNUSU5HX1dJTkRPV1MpIHtcbiAgY29yZSA9IHJlcXVpcmUoJy4vd2luZG93cy5qcycpXG59IGVsc2Uge1xuICBjb3JlID0gcmVxdWlyZSgnLi9tb2RlLmpzJylcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc2V4ZVxuaXNleGUuc3luYyA9IHN5bmNcblxuZnVuY3Rpb24gaXNleGUgKHBhdGgsIG9wdGlvbnMsIGNiKSB7XG4gIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGNiID0gb3B0aW9uc1xuICAgIG9wdGlvbnMgPSB7fVxuICB9XG5cbiAgaWYgKCFjYikge1xuICAgIGlmICh0eXBlb2YgUHJvbWlzZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignY2FsbGJhY2sgbm90IHByb3ZpZGVkJylcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgaXNleGUocGF0aCwgb3B0aW9ucyB8fCB7fSwgZnVuY3Rpb24gKGVyLCBpcykge1xuICAgICAgICBpZiAoZXIpIHtcbiAgICAgICAgICByZWplY3QoZXIpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzb2x2ZShpcylcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgY29yZShwYXRoLCBvcHRpb25zIHx8IHt9LCBmdW5jdGlvbiAoZXIsIGlzKSB7XG4gICAgLy8gaWdub3JlIEVBQ0NFUyBiZWNhdXNlIHRoYXQganVzdCBtZWFucyB3ZSBhcmVuJ3QgYWxsb3dlZCB0byBydW4gaXRcbiAgICBpZiAoZXIpIHtcbiAgICAgIGlmIChlci5jb2RlID09PSAnRUFDQ0VTJyB8fCBvcHRpb25zICYmIG9wdGlvbnMuaWdub3JlRXJyb3JzKSB7XG4gICAgICAgIGVyID0gbnVsbFxuICAgICAgICBpcyA9IGZhbHNlXG4gICAgICB9XG4gICAgfVxuICAgIGNiKGVyLCBpcylcbiAgfSlcbn1cblxuZnVuY3Rpb24gc3luYyAocGF0aCwgb3B0aW9ucykge1xuICAvLyBteSBraW5nZG9tIGZvciBhIGZpbHRlcmVkIGNhdGNoXG4gIHRyeSB7XG4gICAgcmV0dXJuIGNvcmUuc3luYyhwYXRoLCBvcHRpb25zIHx8IHt9KVxuICB9IGNhdGNoIChlcikge1xuICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMuaWdub3JlRXJyb3JzIHx8IGVyLmNvZGUgPT09ICdFQUNDRVMnKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgZXJcbiAgICB9XG4gIH1cbn1cbiIsCiAgICAiY29uc3QgaXNXaW5kb3dzID0gcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJyB8fFxuICAgIHByb2Nlc3MuZW52Lk9TVFlQRSA9PT0gJ2N5Z3dpbicgfHxcbiAgICBwcm9jZXNzLmVudi5PU1RZUEUgPT09ICdtc3lzJ1xuXG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpXG5jb25zdCBDT0xPTiA9IGlzV2luZG93cyA/ICc7JyA6ICc6J1xuY29uc3QgaXNleGUgPSByZXF1aXJlKCdpc2V4ZScpXG5cbmNvbnN0IGdldE5vdEZvdW5kRXJyb3IgPSAoY21kKSA9PlxuICBPYmplY3QuYXNzaWduKG5ldyBFcnJvcihgbm90IGZvdW5kOiAke2NtZH1gKSwgeyBjb2RlOiAnRU5PRU5UJyB9KVxuXG5jb25zdCBnZXRQYXRoSW5mbyA9IChjbWQsIG9wdCkgPT4ge1xuICBjb25zdCBjb2xvbiA9IG9wdC5jb2xvbiB8fCBDT0xPTlxuXG4gIC8vIElmIGl0IGhhcyBhIHNsYXNoLCB0aGVuIHdlIGRvbid0IGJvdGhlciBzZWFyY2hpbmcgdGhlIHBhdGhlbnYuXG4gIC8vIGp1c3QgY2hlY2sgdGhlIGZpbGUgaXRzZWxmLCBhbmQgdGhhdCdzIGl0LlxuICBjb25zdCBwYXRoRW52ID0gY21kLm1hdGNoKC9cXC8vKSB8fCBpc1dpbmRvd3MgJiYgY21kLm1hdGNoKC9cXFxcLykgPyBbJyddXG4gICAgOiAoXG4gICAgICBbXG4gICAgICAgIC8vIHdpbmRvd3MgYWx3YXlzIGNoZWNrcyB0aGUgY3dkIGZpcnN0XG4gICAgICAgIC4uLihpc1dpbmRvd3MgPyBbcHJvY2Vzcy5jd2QoKV0gOiBbXSksXG4gICAgICAgIC4uLihvcHQucGF0aCB8fCBwcm9jZXNzLmVudi5QQVRIIHx8XG4gICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQ6IHZlcnkgdW51c3VhbCAqLyAnJykuc3BsaXQoY29sb24pLFxuICAgICAgXVxuICAgIClcbiAgY29uc3QgcGF0aEV4dEV4ZSA9IGlzV2luZG93c1xuICAgID8gb3B0LnBhdGhFeHQgfHwgcHJvY2Vzcy5lbnYuUEFUSEVYVCB8fCAnLkVYRTsuQ01EOy5CQVQ7LkNPTSdcbiAgICA6ICcnXG4gIGNvbnN0IHBhdGhFeHQgPSBpc1dpbmRvd3MgPyBwYXRoRXh0RXhlLnNwbGl0KGNvbG9uKSA6IFsnJ11cblxuICBpZiAoaXNXaW5kb3dzKSB7XG4gICAgaWYgKGNtZC5pbmRleE9mKCcuJykgIT09IC0xICYmIHBhdGhFeHRbMF0gIT09ICcnKVxuICAgICAgcGF0aEV4dC51bnNoaWZ0KCcnKVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBwYXRoRW52LFxuICAgIHBhdGhFeHQsXG4gICAgcGF0aEV4dEV4ZSxcbiAgfVxufVxuXG5jb25zdCB3aGljaCA9IChjbWQsIG9wdCwgY2IpID0+IHtcbiAgaWYgKHR5cGVvZiBvcHQgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjYiA9IG9wdFxuICAgIG9wdCA9IHt9XG4gIH1cbiAgaWYgKCFvcHQpXG4gICAgb3B0ID0ge31cblxuICBjb25zdCB7IHBhdGhFbnYsIHBhdGhFeHQsIHBhdGhFeHRFeGUgfSA9IGdldFBhdGhJbmZvKGNtZCwgb3B0KVxuICBjb25zdCBmb3VuZCA9IFtdXG5cbiAgY29uc3Qgc3RlcCA9IGkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGlmIChpID09PSBwYXRoRW52Lmxlbmd0aClcbiAgICAgIHJldHVybiBvcHQuYWxsICYmIGZvdW5kLmxlbmd0aCA/IHJlc29sdmUoZm91bmQpXG4gICAgICAgIDogcmVqZWN0KGdldE5vdEZvdW5kRXJyb3IoY21kKSlcblxuICAgIGNvbnN0IHBwUmF3ID0gcGF0aEVudltpXVxuICAgIGNvbnN0IHBhdGhQYXJ0ID0gL15cIi4qXCIkLy50ZXN0KHBwUmF3KSA/IHBwUmF3LnNsaWNlKDEsIC0xKSA6IHBwUmF3XG5cbiAgICBjb25zdCBwQ21kID0gcGF0aC5qb2luKHBhdGhQYXJ0LCBjbWQpXG4gICAgY29uc3QgcCA9ICFwYXRoUGFydCAmJiAvXlxcLltcXFxcXFwvXS8udGVzdChjbWQpID8gY21kLnNsaWNlKDAsIDIpICsgcENtZFxuICAgICAgOiBwQ21kXG5cbiAgICByZXNvbHZlKHN1YlN0ZXAocCwgaSwgMCkpXG4gIH0pXG5cbiAgY29uc3Qgc3ViU3RlcCA9IChwLCBpLCBpaSkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGlmIChpaSA9PT0gcGF0aEV4dC5sZW5ndGgpXG4gICAgICByZXR1cm4gcmVzb2x2ZShzdGVwKGkgKyAxKSlcbiAgICBjb25zdCBleHQgPSBwYXRoRXh0W2lpXVxuICAgIGlzZXhlKHAgKyBleHQsIHsgcGF0aEV4dDogcGF0aEV4dEV4ZSB9LCAoZXIsIGlzKSA9PiB7XG4gICAgICBpZiAoIWVyICYmIGlzKSB7XG4gICAgICAgIGlmIChvcHQuYWxsKVxuICAgICAgICAgIGZvdW5kLnB1c2gocCArIGV4dClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJldHVybiByZXNvbHZlKHAgKyBleHQpXG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzb2x2ZShzdWJTdGVwKHAsIGksIGlpICsgMSkpXG4gICAgfSlcbiAgfSlcblxuICByZXR1cm4gY2IgPyBzdGVwKDApLnRoZW4ocmVzID0+IGNiKG51bGwsIHJlcyksIGNiKSA6IHN0ZXAoMClcbn1cblxuY29uc3Qgd2hpY2hTeW5jID0gKGNtZCwgb3B0KSA9PiB7XG4gIG9wdCA9IG9wdCB8fCB7fVxuXG4gIGNvbnN0IHsgcGF0aEVudiwgcGF0aEV4dCwgcGF0aEV4dEV4ZSB9ID0gZ2V0UGF0aEluZm8oY21kLCBvcHQpXG4gIGNvbnN0IGZvdW5kID0gW11cblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHBhdGhFbnYubGVuZ3RoOyBpICsrKSB7XG4gICAgY29uc3QgcHBSYXcgPSBwYXRoRW52W2ldXG4gICAgY29uc3QgcGF0aFBhcnQgPSAvXlwiLipcIiQvLnRlc3QocHBSYXcpID8gcHBSYXcuc2xpY2UoMSwgLTEpIDogcHBSYXdcblxuICAgIGNvbnN0IHBDbWQgPSBwYXRoLmpvaW4ocGF0aFBhcnQsIGNtZClcbiAgICBjb25zdCBwID0gIXBhdGhQYXJ0ICYmIC9eXFwuW1xcXFxcXC9dLy50ZXN0KGNtZCkgPyBjbWQuc2xpY2UoMCwgMikgKyBwQ21kXG4gICAgICA6IHBDbWRcblxuICAgIGZvciAobGV0IGogPSAwOyBqIDwgcGF0aEV4dC5sZW5ndGg7IGogKyspIHtcbiAgICAgIGNvbnN0IGN1ciA9IHAgKyBwYXRoRXh0W2pdXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBpcyA9IGlzZXhlLnN5bmMoY3VyLCB7IHBhdGhFeHQ6IHBhdGhFeHRFeGUgfSlcbiAgICAgICAgaWYgKGlzKSB7XG4gICAgICAgICAgaWYgKG9wdC5hbGwpXG4gICAgICAgICAgICBmb3VuZC5wdXNoKGN1cilcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gY3VyXG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGV4KSB7fVxuICAgIH1cbiAgfVxuXG4gIGlmIChvcHQuYWxsICYmIGZvdW5kLmxlbmd0aClcbiAgICByZXR1cm4gZm91bmRcblxuICBpZiAob3B0Lm5vdGhyb3cpXG4gICAgcmV0dXJuIG51bGxcblxuICB0aHJvdyBnZXROb3RGb3VuZEVycm9yKGNtZClcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB3aGljaFxud2hpY2guc3luYyA9IHdoaWNoU3luY1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbmNvbnN0IHBhdGhLZXkgPSAob3B0aW9ucyA9IHt9KSA9PiB7XG5cdGNvbnN0IGVudmlyb25tZW50ID0gb3B0aW9ucy5lbnYgfHwgcHJvY2Vzcy5lbnY7XG5cdGNvbnN0IHBsYXRmb3JtID0gb3B0aW9ucy5wbGF0Zm9ybSB8fCBwcm9jZXNzLnBsYXRmb3JtO1xuXG5cdGlmIChwbGF0Zm9ybSAhPT0gJ3dpbjMyJykge1xuXHRcdHJldHVybiAnUEFUSCc7XG5cdH1cblxuXHRyZXR1cm4gT2JqZWN0LmtleXMoZW52aXJvbm1lbnQpLnJldmVyc2UoKS5maW5kKGtleSA9PiBrZXkudG9VcHBlckNhc2UoKSA9PT0gJ1BBVEgnKSB8fCAnUGF0aCc7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHBhdGhLZXk7XG4vLyBUT0RPOiBSZW1vdmUgdGhpcyBmb3IgdGhlIG5leHQgbWFqb3IgcmVsZWFzZVxubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IHBhdGhLZXk7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IHdoaWNoID0gcmVxdWlyZSgnd2hpY2gnKTtcbmNvbnN0IGdldFBhdGhLZXkgPSByZXF1aXJlKCdwYXRoLWtleScpO1xuXG5mdW5jdGlvbiByZXNvbHZlQ29tbWFuZEF0dGVtcHQocGFyc2VkLCB3aXRob3V0UGF0aEV4dCkge1xuICAgIGNvbnN0IGVudiA9IHBhcnNlZC5vcHRpb25zLmVudiB8fCBwcm9jZXNzLmVudjtcbiAgICBjb25zdCBjd2QgPSBwcm9jZXNzLmN3ZCgpO1xuICAgIGNvbnN0IGhhc0N1c3RvbUN3ZCA9IHBhcnNlZC5vcHRpb25zLmN3ZCAhPSBudWxsO1xuICAgIC8vIFdvcmtlciB0aHJlYWRzIGRvIG5vdCBoYXZlIHByb2Nlc3MuY2hkaXIoKVxuICAgIGNvbnN0IHNob3VsZFN3aXRjaEN3ZCA9IGhhc0N1c3RvbUN3ZCAmJiBwcm9jZXNzLmNoZGlyICE9PSB1bmRlZmluZWQgJiYgIXByb2Nlc3MuY2hkaXIuZGlzYWJsZWQ7XG5cbiAgICAvLyBJZiBhIGN1c3RvbSBgY3dkYCB3YXMgc3BlY2lmaWVkLCB3ZSBuZWVkIHRvIGNoYW5nZSB0aGUgcHJvY2VzcyBjd2RcbiAgICAvLyBiZWNhdXNlIGB3aGljaGAgd2lsbCBkbyBzdGF0IGNhbGxzIGJ1dCBkb2VzIG5vdCBzdXBwb3J0IGEgY3VzdG9tIGN3ZFxuICAgIGlmIChzaG91bGRTd2l0Y2hDd2QpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHByb2Nlc3MuY2hkaXIocGFyc2VkLm9wdGlvbnMuY3dkKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAvKiBFbXB0eSAqL1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbGV0IHJlc29sdmVkO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgcmVzb2x2ZWQgPSB3aGljaC5zeW5jKHBhcnNlZC5jb21tYW5kLCB7XG4gICAgICAgICAgICBwYXRoOiBlbnZbZ2V0UGF0aEtleSh7IGVudiB9KV0sXG4gICAgICAgICAgICBwYXRoRXh0OiB3aXRob3V0UGF0aEV4dCA/IHBhdGguZGVsaW1pdGVyIDogdW5kZWZpbmVkLFxuICAgICAgICB9KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8qIEVtcHR5ICovXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKHNob3VsZFN3aXRjaEN3ZCkge1xuICAgICAgICAgICAgcHJvY2Vzcy5jaGRpcihjd2QpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gSWYgd2Ugc3VjY2Vzc2Z1bGx5IHJlc29sdmVkLCBlbnN1cmUgdGhhdCBhbiBhYnNvbHV0ZSBwYXRoIGlzIHJldHVybmVkXG4gICAgLy8gTm90ZSB0aGF0IHdoZW4gYSBjdXN0b20gYGN3ZGAgd2FzIHVzZWQsIHdlIG5lZWQgdG8gcmVzb2x2ZSB0byBhbiBhYnNvbHV0ZSBwYXRoIGJhc2VkIG9uIGl0XG4gICAgaWYgKHJlc29sdmVkKSB7XG4gICAgICAgIHJlc29sdmVkID0gcGF0aC5yZXNvbHZlKGhhc0N1c3RvbUN3ZCA/IHBhcnNlZC5vcHRpb25zLmN3ZCA6ICcnLCByZXNvbHZlZCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc29sdmVkO1xufVxuXG5mdW5jdGlvbiByZXNvbHZlQ29tbWFuZChwYXJzZWQpIHtcbiAgICByZXR1cm4gcmVzb2x2ZUNvbW1hbmRBdHRlbXB0KHBhcnNlZCkgfHwgcmVzb2x2ZUNvbW1hbmRBdHRlbXB0KHBhcnNlZCwgdHJ1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcmVzb2x2ZUNvbW1hbmQ7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxuLy8gU2VlIGh0dHA6Ly93d3cucm9idmFuZGVyd291ZGUuY29tL2VzY2FwZWNoYXJzLnBocFxuY29uc3QgbWV0YUNoYXJzUmVnRXhwID0gLyhbKClcXF1bJSFeXCJgPD4mfDssICo/XSkvZztcblxuZnVuY3Rpb24gZXNjYXBlQ29tbWFuZChhcmcpIHtcbiAgICAvLyBFc2NhcGUgbWV0YSBjaGFyc1xuICAgIGFyZyA9IGFyZy5yZXBsYWNlKG1ldGFDaGFyc1JlZ0V4cCwgJ14kMScpO1xuXG4gICAgcmV0dXJuIGFyZztcbn1cblxuZnVuY3Rpb24gZXNjYXBlQXJndW1lbnQoYXJnLCBkb3VibGVFc2NhcGVNZXRhQ2hhcnMpIHtcbiAgICAvLyBDb252ZXJ0IHRvIHN0cmluZ1xuICAgIGFyZyA9IGAke2FyZ31gO1xuXG4gICAgLy8gQWxnb3JpdGhtIGJlbG93IGlzIGJhc2VkIG9uIGh0dHBzOi8vcW50bS5vcmcvY21kXG4gICAgLy8gSXQncyBzbGlnaHRseSBhbHRlcmVkIHRvIGRpc2FibGUgSlMgYmFja3RyYWNraW5nIHRvIGF2b2lkIGhhbmdpbmcgb24gc3BlY2lhbGx5IGNyYWZ0ZWQgaW5wdXRcbiAgICAvLyBQbGVhc2Ugc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tb3h5c3R1ZGlvL25vZGUtY3Jvc3Mtc3Bhd24vcHVsbC8xNjAgZm9yIG1vcmUgaW5mb3JtYXRpb25cblxuICAgIC8vIFNlcXVlbmNlIG9mIGJhY2tzbGFzaGVzIGZvbGxvd2VkIGJ5IGEgZG91YmxlIHF1b3RlOlxuICAgIC8vIGRvdWJsZSB1cCBhbGwgdGhlIGJhY2tzbGFzaGVzIGFuZCBlc2NhcGUgdGhlIGRvdWJsZSBxdW90ZVxuICAgIGFyZyA9IGFyZy5yZXBsYWNlKC8oPz0oXFxcXCs/KT8pXFwxXCIvZywgJyQxJDFcXFxcXCInKTtcblxuICAgIC8vIFNlcXVlbmNlIG9mIGJhY2tzbGFzaGVzIGZvbGxvd2VkIGJ5IHRoZSBlbmQgb2YgdGhlIHN0cmluZ1xuICAgIC8vICh3aGljaCB3aWxsIGJlY29tZSBhIGRvdWJsZSBxdW90ZSBsYXRlcik6XG4gICAgLy8gZG91YmxlIHVwIGFsbCB0aGUgYmFja3NsYXNoZXNcbiAgICBhcmcgPSBhcmcucmVwbGFjZSgvKD89KFxcXFwrPyk/KVxcMSQvLCAnJDEkMScpO1xuXG4gICAgLy8gQWxsIG90aGVyIGJhY2tzbGFzaGVzIG9jY3VyIGxpdGVyYWxseVxuXG4gICAgLy8gUXVvdGUgdGhlIHdob2xlIHRoaW5nOlxuICAgIGFyZyA9IGBcIiR7YXJnfVwiYDtcblxuICAgIC8vIEVzY2FwZSBtZXRhIGNoYXJzXG4gICAgYXJnID0gYXJnLnJlcGxhY2UobWV0YUNoYXJzUmVnRXhwLCAnXiQxJyk7XG5cbiAgICAvLyBEb3VibGUgZXNjYXBlIG1ldGEgY2hhcnMgaWYgbmVjZXNzYXJ5XG4gICAgaWYgKGRvdWJsZUVzY2FwZU1ldGFDaGFycykge1xuICAgICAgICBhcmcgPSBhcmcucmVwbGFjZShtZXRhQ2hhcnNSZWdFeHAsICdeJDEnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYXJnO1xufVxuXG5tb2R1bGUuZXhwb3J0cy5jb21tYW5kID0gZXNjYXBlQ29tbWFuZDtcbm1vZHVsZS5leHBvcnRzLmFyZ3VtZW50ID0gZXNjYXBlQXJndW1lbnQ7XG4iLAogICAgIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gL14jISguKikvO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5jb25zdCBzaGViYW5nUmVnZXggPSByZXF1aXJlKCdzaGViYW5nLXJlZ2V4Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKHN0cmluZyA9ICcnKSA9PiB7XG5cdGNvbnN0IG1hdGNoID0gc3RyaW5nLm1hdGNoKHNoZWJhbmdSZWdleCk7XG5cblx0aWYgKCFtYXRjaCkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0Y29uc3QgW3BhdGgsIGFyZ3VtZW50XSA9IG1hdGNoWzBdLnJlcGxhY2UoLyMhID8vLCAnJykuc3BsaXQoJyAnKTtcblx0Y29uc3QgYmluYXJ5ID0gcGF0aC5zcGxpdCgnLycpLnBvcCgpO1xuXG5cdGlmIChiaW5hcnkgPT09ICdlbnYnKSB7XG5cdFx0cmV0dXJuIGFyZ3VtZW50O1xuXHR9XG5cblx0cmV0dXJuIGFyZ3VtZW50ID8gYCR7YmluYXJ5fSAke2FyZ3VtZW50fWAgOiBiaW5hcnk7XG59O1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbmNvbnN0IHNoZWJhbmdDb21tYW5kID0gcmVxdWlyZSgnc2hlYmFuZy1jb21tYW5kJyk7XG5cbmZ1bmN0aW9uIHJlYWRTaGViYW5nKGNvbW1hbmQpIHtcbiAgICAvLyBSZWFkIHRoZSBmaXJzdCAxNTAgYnl0ZXMgZnJvbSB0aGUgZmlsZVxuICAgIGNvbnN0IHNpemUgPSAxNTA7XG4gICAgY29uc3QgYnVmZmVyID0gQnVmZmVyLmFsbG9jKHNpemUpO1xuXG4gICAgbGV0IGZkO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgZmQgPSBmcy5vcGVuU3luYyhjb21tYW5kLCAncicpO1xuICAgICAgICBmcy5yZWFkU3luYyhmZCwgYnVmZmVyLCAwLCBzaXplLCAwKTtcbiAgICAgICAgZnMuY2xvc2VTeW5jKGZkKTtcbiAgICB9IGNhdGNoIChlKSB7IC8qIEVtcHR5ICovIH1cblxuICAgIC8vIEF0dGVtcHQgdG8gZXh0cmFjdCBzaGViYW5nIChudWxsIGlzIHJldHVybmVkIGlmIG5vdCBhIHNoZWJhbmcpXG4gICAgcmV0dXJuIHNoZWJhbmdDb21tYW5kKGJ1ZmZlci50b1N0cmluZygpKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSByZWFkU2hlYmFuZztcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3QgcmVzb2x2ZUNvbW1hbmQgPSByZXF1aXJlKCcuL3V0aWwvcmVzb2x2ZUNvbW1hbmQnKTtcbmNvbnN0IGVzY2FwZSA9IHJlcXVpcmUoJy4vdXRpbC9lc2NhcGUnKTtcbmNvbnN0IHJlYWRTaGViYW5nID0gcmVxdWlyZSgnLi91dGlsL3JlYWRTaGViYW5nJyk7XG5cbmNvbnN0IGlzV2luID0gcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJztcbmNvbnN0IGlzRXhlY3V0YWJsZVJlZ0V4cCA9IC9cXC4oPzpjb218ZXhlKSQvaTtcbmNvbnN0IGlzQ21kU2hpbVJlZ0V4cCA9IC9ub2RlX21vZHVsZXNbXFxcXC9dLmJpbltcXFxcL11bXlxcXFwvXStcXC5jbWQkL2k7XG5cbmZ1bmN0aW9uIGRldGVjdFNoZWJhbmcocGFyc2VkKSB7XG4gICAgcGFyc2VkLmZpbGUgPSByZXNvbHZlQ29tbWFuZChwYXJzZWQpO1xuXG4gICAgY29uc3Qgc2hlYmFuZyA9IHBhcnNlZC5maWxlICYmIHJlYWRTaGViYW5nKHBhcnNlZC5maWxlKTtcblxuICAgIGlmIChzaGViYW5nKSB7XG4gICAgICAgIHBhcnNlZC5hcmdzLnVuc2hpZnQocGFyc2VkLmZpbGUpO1xuICAgICAgICBwYXJzZWQuY29tbWFuZCA9IHNoZWJhbmc7XG5cbiAgICAgICAgcmV0dXJuIHJlc29sdmVDb21tYW5kKHBhcnNlZCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBhcnNlZC5maWxlO1xufVxuXG5mdW5jdGlvbiBwYXJzZU5vblNoZWxsKHBhcnNlZCkge1xuICAgIGlmICghaXNXaW4pIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlZDtcbiAgICB9XG5cbiAgICAvLyBEZXRlY3QgJiBhZGQgc3VwcG9ydCBmb3Igc2hlYmFuZ3NcbiAgICBjb25zdCBjb21tYW5kRmlsZSA9IGRldGVjdFNoZWJhbmcocGFyc2VkKTtcblxuICAgIC8vIFdlIGRvbid0IG5lZWQgYSBzaGVsbCBpZiB0aGUgY29tbWFuZCBmaWxlbmFtZSBpcyBhbiBleGVjdXRhYmxlXG4gICAgY29uc3QgbmVlZHNTaGVsbCA9ICFpc0V4ZWN1dGFibGVSZWdFeHAudGVzdChjb21tYW5kRmlsZSk7XG5cbiAgICAvLyBJZiBhIHNoZWxsIGlzIHJlcXVpcmVkLCB1c2UgY21kLmV4ZSBhbmQgdGFrZSBjYXJlIG9mIGVzY2FwaW5nIGV2ZXJ5dGhpbmcgY29ycmVjdGx5XG4gICAgLy8gTm90ZSB0aGF0IGBmb3JjZVNoZWxsYCBpcyBhbiBoaWRkZW4gb3B0aW9uIHVzZWQgb25seSBpbiB0ZXN0c1xuICAgIGlmIChwYXJzZWQub3B0aW9ucy5mb3JjZVNoZWxsIHx8IG5lZWRzU2hlbGwpIHtcbiAgICAgICAgLy8gTmVlZCB0byBkb3VibGUgZXNjYXBlIG1ldGEgY2hhcnMgaWYgdGhlIGNvbW1hbmQgaXMgYSBjbWQtc2hpbSBsb2NhdGVkIGluIGBub2RlX21vZHVsZXMvLmJpbi9gXG4gICAgICAgIC8vIFRoZSBjbWQtc2hpbSBzaW1wbHkgY2FsbHMgZXhlY3V0ZSB0aGUgcGFja2FnZSBiaW4gZmlsZSB3aXRoIE5vZGVKUywgcHJveHlpbmcgYW55IGFyZ3VtZW50XG4gICAgICAgIC8vIEJlY2F1c2UgdGhlIGVzY2FwZSBvZiBtZXRhY2hhcnMgd2l0aCBeIGdldHMgaW50ZXJwcmV0ZWQgd2hlbiB0aGUgY21kLmV4ZSBpcyBmaXJzdCBjYWxsZWQsXG4gICAgICAgIC8vIHdlIG5lZWQgdG8gZG91YmxlIGVzY2FwZSB0aGVtXG4gICAgICAgIGNvbnN0IG5lZWRzRG91YmxlRXNjYXBlTWV0YUNoYXJzID0gaXNDbWRTaGltUmVnRXhwLnRlc3QoY29tbWFuZEZpbGUpO1xuXG4gICAgICAgIC8vIE5vcm1hbGl6ZSBwb3NpeCBwYXRocyBpbnRvIE9TIGNvbXBhdGlibGUgcGF0aHMgKGUuZy46IGZvby9iYXIgLT4gZm9vXFxiYXIpXG4gICAgICAgIC8vIFRoaXMgaXMgbmVjZXNzYXJ5IG90aGVyd2lzZSBpdCB3aWxsIGFsd2F5cyBmYWlsIHdpdGggRU5PRU5UIGluIHRob3NlIGNhc2VzXG4gICAgICAgIHBhcnNlZC5jb21tYW5kID0gcGF0aC5ub3JtYWxpemUocGFyc2VkLmNvbW1hbmQpO1xuXG4gICAgICAgIC8vIEVzY2FwZSBjb21tYW5kICYgYXJndW1lbnRzXG4gICAgICAgIHBhcnNlZC5jb21tYW5kID0gZXNjYXBlLmNvbW1hbmQocGFyc2VkLmNvbW1hbmQpO1xuICAgICAgICBwYXJzZWQuYXJncyA9IHBhcnNlZC5hcmdzLm1hcCgoYXJnKSA9PiBlc2NhcGUuYXJndW1lbnQoYXJnLCBuZWVkc0RvdWJsZUVzY2FwZU1ldGFDaGFycykpO1xuXG4gICAgICAgIGNvbnN0IHNoZWxsQ29tbWFuZCA9IFtwYXJzZWQuY29tbWFuZF0uY29uY2F0KHBhcnNlZC5hcmdzKS5qb2luKCcgJyk7XG5cbiAgICAgICAgcGFyc2VkLmFyZ3MgPSBbJy9kJywgJy9zJywgJy9jJywgYFwiJHtzaGVsbENvbW1hbmR9XCJgXTtcbiAgICAgICAgcGFyc2VkLmNvbW1hbmQgPSBwcm9jZXNzLmVudi5jb21zcGVjIHx8ICdjbWQuZXhlJztcbiAgICAgICAgcGFyc2VkLm9wdGlvbnMud2luZG93c1ZlcmJhdGltQXJndW1lbnRzID0gdHJ1ZTsgLy8gVGVsbCBub2RlJ3Mgc3Bhd24gdGhhdCB0aGUgYXJndW1lbnRzIGFyZSBhbHJlYWR5IGVzY2FwZWRcbiAgICB9XG5cbiAgICByZXR1cm4gcGFyc2VkO1xufVxuXG5mdW5jdGlvbiBwYXJzZShjb21tYW5kLCBhcmdzLCBvcHRpb25zKSB7XG4gICAgLy8gTm9ybWFsaXplIGFyZ3VtZW50cywgc2ltaWxhciB0byBub2RlanNcbiAgICBpZiAoYXJncyAmJiAhQXJyYXkuaXNBcnJheShhcmdzKSkge1xuICAgICAgICBvcHRpb25zID0gYXJncztcbiAgICAgICAgYXJncyA9IG51bGw7XG4gICAgfVxuXG4gICAgYXJncyA9IGFyZ3MgPyBhcmdzLnNsaWNlKDApIDogW107IC8vIENsb25lIGFycmF5IHRvIGF2b2lkIGNoYW5naW5nIHRoZSBvcmlnaW5hbFxuICAgIG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBvcHRpb25zKTsgLy8gQ2xvbmUgb2JqZWN0IHRvIGF2b2lkIGNoYW5naW5nIHRoZSBvcmlnaW5hbFxuXG4gICAgLy8gQnVpbGQgb3VyIHBhcnNlZCBvYmplY3RcbiAgICBjb25zdCBwYXJzZWQgPSB7XG4gICAgICAgIGNvbW1hbmQsXG4gICAgICAgIGFyZ3MsXG4gICAgICAgIG9wdGlvbnMsXG4gICAgICAgIGZpbGU6IHVuZGVmaW5lZCxcbiAgICAgICAgb3JpZ2luYWw6IHtcbiAgICAgICAgICAgIGNvbW1hbmQsXG4gICAgICAgICAgICBhcmdzLFxuICAgICAgICB9LFxuICAgIH07XG5cbiAgICAvLyBEZWxlZ2F0ZSBmdXJ0aGVyIHBhcnNpbmcgdG8gc2hlbGwgb3Igbm9uLXNoZWxsXG4gICAgcmV0dXJuIG9wdGlvbnMuc2hlbGwgPyBwYXJzZWQgOiBwYXJzZU5vblNoZWxsKHBhcnNlZCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcGFyc2U7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxuY29uc3QgaXNXaW4gPSBwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInO1xuXG5mdW5jdGlvbiBub3RGb3VuZEVycm9yKG9yaWdpbmFsLCBzeXNjYWxsKSB7XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24obmV3IEVycm9yKGAke3N5c2NhbGx9ICR7b3JpZ2luYWwuY29tbWFuZH0gRU5PRU5UYCksIHtcbiAgICAgICAgY29kZTogJ0VOT0VOVCcsXG4gICAgICAgIGVycm5vOiAnRU5PRU5UJyxcbiAgICAgICAgc3lzY2FsbDogYCR7c3lzY2FsbH0gJHtvcmlnaW5hbC5jb21tYW5kfWAsXG4gICAgICAgIHBhdGg6IG9yaWdpbmFsLmNvbW1hbmQsXG4gICAgICAgIHNwYXduYXJnczogb3JpZ2luYWwuYXJncyxcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gaG9va0NoaWxkUHJvY2VzcyhjcCwgcGFyc2VkKSB7XG4gICAgaWYgKCFpc1dpbikge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgb3JpZ2luYWxFbWl0ID0gY3AuZW1pdDtcblxuICAgIGNwLmVtaXQgPSBmdW5jdGlvbiAobmFtZSwgYXJnMSkge1xuICAgICAgICAvLyBJZiBlbWl0dGluZyBcImV4aXRcIiBldmVudCBhbmQgZXhpdCBjb2RlIGlzIDEsIHdlIG5lZWQgdG8gY2hlY2sgaWZcbiAgICAgICAgLy8gdGhlIGNvbW1hbmQgZXhpc3RzIGFuZCBlbWl0IGFuIFwiZXJyb3JcIiBpbnN0ZWFkXG4gICAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vSW5kaWdvVW5pdGVkL25vZGUtY3Jvc3Mtc3Bhd24vaXNzdWVzLzE2XG4gICAgICAgIGlmIChuYW1lID09PSAnZXhpdCcpIHtcbiAgICAgICAgICAgIGNvbnN0IGVyciA9IHZlcmlmeUVOT0VOVChhcmcxLCBwYXJzZWQpO1xuXG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9yaWdpbmFsRW1pdC5jYWxsKGNwLCAnZXJyb3InLCBlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG9yaWdpbmFsRW1pdC5hcHBseShjcCwgYXJndW1lbnRzKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBwcmVmZXItcmVzdC1wYXJhbXNcbiAgICB9O1xufVxuXG5mdW5jdGlvbiB2ZXJpZnlFTk9FTlQoc3RhdHVzLCBwYXJzZWQpIHtcbiAgICBpZiAoaXNXaW4gJiYgc3RhdHVzID09PSAxICYmICFwYXJzZWQuZmlsZSkge1xuICAgICAgICByZXR1cm4gbm90Rm91bmRFcnJvcihwYXJzZWQub3JpZ2luYWwsICdzcGF3bicpO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xufVxuXG5mdW5jdGlvbiB2ZXJpZnlFTk9FTlRTeW5jKHN0YXR1cywgcGFyc2VkKSB7XG4gICAgaWYgKGlzV2luICYmIHN0YXR1cyA9PT0gMSAmJiAhcGFyc2VkLmZpbGUpIHtcbiAgICAgICAgcmV0dXJuIG5vdEZvdW5kRXJyb3IocGFyc2VkLm9yaWdpbmFsLCAnc3Bhd25TeW5jJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGhvb2tDaGlsZFByb2Nlc3MsXG4gICAgdmVyaWZ5RU5PRU5ULFxuICAgIHZlcmlmeUVOT0VOVFN5bmMsXG4gICAgbm90Rm91bmRFcnJvcixcbn07XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxuY29uc3QgY3AgPSByZXF1aXJlKCdjaGlsZF9wcm9jZXNzJyk7XG5jb25zdCBwYXJzZSA9IHJlcXVpcmUoJy4vbGliL3BhcnNlJyk7XG5jb25zdCBlbm9lbnQgPSByZXF1aXJlKCcuL2xpYi9lbm9lbnQnKTtcblxuZnVuY3Rpb24gc3Bhd24oY29tbWFuZCwgYXJncywgb3B0aW9ucykge1xuICAgIC8vIFBhcnNlIHRoZSBhcmd1bWVudHNcbiAgICBjb25zdCBwYXJzZWQgPSBwYXJzZShjb21tYW5kLCBhcmdzLCBvcHRpb25zKTtcblxuICAgIC8vIFNwYXduIHRoZSBjaGlsZCBwcm9jZXNzXG4gICAgY29uc3Qgc3Bhd25lZCA9IGNwLnNwYXduKHBhcnNlZC5jb21tYW5kLCBwYXJzZWQuYXJncywgcGFyc2VkLm9wdGlvbnMpO1xuXG4gICAgLy8gSG9vayBpbnRvIGNoaWxkIHByb2Nlc3MgXCJleGl0XCIgZXZlbnQgdG8gZW1pdCBhbiBlcnJvciBpZiB0aGUgY29tbWFuZFxuICAgIC8vIGRvZXMgbm90IGV4aXN0cywgc2VlOiBodHRwczovL2dpdGh1Yi5jb20vSW5kaWdvVW5pdGVkL25vZGUtY3Jvc3Mtc3Bhd24vaXNzdWVzLzE2XG4gICAgZW5vZW50Lmhvb2tDaGlsZFByb2Nlc3Moc3Bhd25lZCwgcGFyc2VkKTtcblxuICAgIHJldHVybiBzcGF3bmVkO1xufVxuXG5mdW5jdGlvbiBzcGF3blN5bmMoY29tbWFuZCwgYXJncywgb3B0aW9ucykge1xuICAgIC8vIFBhcnNlIHRoZSBhcmd1bWVudHNcbiAgICBjb25zdCBwYXJzZWQgPSBwYXJzZShjb21tYW5kLCBhcmdzLCBvcHRpb25zKTtcblxuICAgIC8vIFNwYXduIHRoZSBjaGlsZCBwcm9jZXNzXG4gICAgY29uc3QgcmVzdWx0ID0gY3Auc3Bhd25TeW5jKHBhcnNlZC5jb21tYW5kLCBwYXJzZWQuYXJncywgcGFyc2VkLm9wdGlvbnMpO1xuXG4gICAgLy8gQW5hbHl6ZSBpZiB0aGUgY29tbWFuZCBkb2VzIG5vdCBleGlzdCwgc2VlOiBodHRwczovL2dpdGh1Yi5jb20vSW5kaWdvVW5pdGVkL25vZGUtY3Jvc3Mtc3Bhd24vaXNzdWVzLzE2XG4gICAgcmVzdWx0LmVycm9yID0gcmVzdWx0LmVycm9yIHx8IGVub2VudC52ZXJpZnlFTk9FTlRTeW5jKHJlc3VsdC5zdGF0dXMsIHBhcnNlZCk7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNwYXduO1xubW9kdWxlLmV4cG9ydHMuc3Bhd24gPSBzcGF3bjtcbm1vZHVsZS5leHBvcnRzLnN5bmMgPSBzcGF3blN5bmM7XG5cbm1vZHVsZS5leHBvcnRzLl9wYXJzZSA9IHBhcnNlO1xubW9kdWxlLmV4cG9ydHMuX2Vub2VudCA9IGVub2VudDtcbiIsCiAgICAiaW1wb3J0e3N0eWxlVGV4dCBhcyB5fWZyb21cIm5vZGU6dXRpbFwiO2ltcG9ydHtzdGRvdXQgYXMgUyxzdGRpbiBhcyAkfWZyb21cIm5vZGU6cHJvY2Vzc1wiO2ltcG9ydCphcyBfIGZyb21cIm5vZGU6cmVhZGxpbmVcIjtpbXBvcnQgUCBmcm9tXCJub2RlOnJlYWRsaW5lXCI7aW1wb3J0e3dyYXBBbnNpIGFzIHh9ZnJvbVwiZmFzdC13cmFwLWFuc2lcIjtpbXBvcnR7Y3Vyc29yIGFzIGMsZXJhc2UgYXMgTX1mcm9tXCJzaXN0ZXJhbnNpXCI7aW1wb3J0e1JlYWRTdHJlYW0gYXMgRH1mcm9tXCJub2RlOnR0eVwiO2Z1bmN0aW9uIGQocix0LGUpe2lmKCFlLnNvbWUobz0+IW8uZGlzYWJsZWQpKXJldHVybiByO2NvbnN0IHM9cit0LGk9TWF0aC5tYXgoZS5sZW5ndGgtMSwwKSxuPXM8MD9pOnM+aT8wOnM7cmV0dXJuIGVbbl0uZGlzYWJsZWQ/ZChuLHQ8MD8tMToxLGUpOm59Y29uc3QgRT1bXCJ1cFwiLFwiZG93blwiLFwibGVmdFwiLFwicmlnaHRcIixcInNwYWNlXCIsXCJlbnRlclwiLFwiY2FuY2VsXCJdLEc9W1wiSmFudWFyeVwiLFwiRmVicnVhcnlcIixcIk1hcmNoXCIsXCJBcHJpbFwiLFwiTWF5XCIsXCJKdW5lXCIsXCJKdWx5XCIsXCJBdWd1c3RcIixcIlNlcHRlbWJlclwiLFwiT2N0b2JlclwiLFwiTm92ZW1iZXJcIixcIkRlY2VtYmVyXCJdLHU9e2FjdGlvbnM6bmV3IFNldChFKSxhbGlhc2VzOm5ldyBNYXAoW1tcImtcIixcInVwXCJdLFtcImpcIixcImRvd25cIl0sW1wiaFwiLFwibGVmdFwiXSxbXCJsXCIsXCJyaWdodFwiXSxbXCJcdTAwMDNcIixcImNhbmNlbFwiXSxbXCJlc2NhcGVcIixcImNhbmNlbFwiXV0pLG1lc3NhZ2VzOntjYW5jZWw6XCJDYW5jZWxlZFwiLGVycm9yOlwiU29tZXRoaW5nIHdlbnQgd3JvbmdcIn0sd2l0aEd1aWRlOiEwLGRhdGU6e21vbnRoTmFtZXM6Wy4uLkddLG1lc3NhZ2VzOntyZXF1aXJlZDpcIlBsZWFzZSBlbnRlciBhIHZhbGlkIGRhdGVcIixpbnZhbGlkTW9udGg6XCJUaGVyZSBhcmUgb25seSAxMiBtb250aHMgaW4gYSB5ZWFyXCIsaW52YWxpZERheToocix0KT0+YFRoZXJlIGFyZSBvbmx5ICR7cn0gZGF5cyBpbiAke3R9YCxhZnRlck1pbjpyPT5gRGF0ZSBtdXN0IGJlIG9uIG9yIGFmdGVyICR7ci50b0lTT1N0cmluZygpLnNsaWNlKDAsMTApfWAsYmVmb3JlTWF4OnI9PmBEYXRlIG11c3QgYmUgb24gb3IgYmVmb3JlICR7ci50b0lTT1N0cmluZygpLnNsaWNlKDAsMTApfWB9fX07ZnVuY3Rpb24gSyhyKXtpZihyLmFsaWFzZXMhPT12b2lkIDApe2NvbnN0IHQ9ci5hbGlhc2VzO2Zvcihjb25zdCBlIGluIHQpe2lmKCFPYmplY3QuaGFzT3duKHQsZSkpY29udGludWU7Y29uc3Qgcz10W2VdO3UuYWN0aW9ucy5oYXMocykmJih1LmFsaWFzZXMuaGFzKGUpfHx1LmFsaWFzZXMuc2V0KGUscykpfX1pZihyLm1lc3NhZ2VzIT09dm9pZCAwKXtjb25zdCB0PXIubWVzc2FnZXM7dC5jYW5jZWwhPT12b2lkIDAmJih1Lm1lc3NhZ2VzLmNhbmNlbD10LmNhbmNlbCksdC5lcnJvciE9PXZvaWQgMCYmKHUubWVzc2FnZXMuZXJyb3I9dC5lcnJvcil9aWYoci53aXRoR3VpZGUhPT12b2lkIDAmJih1LndpdGhHdWlkZT1yLndpdGhHdWlkZSE9PSExKSxyLmRhdGUhPT12b2lkIDApe2NvbnN0IHQ9ci5kYXRlO3QubW9udGhOYW1lcyE9PXZvaWQgMCYmKHUuZGF0ZS5tb250aE5hbWVzPVsuLi50Lm1vbnRoTmFtZXNdKSx0Lm1lc3NhZ2VzIT09dm9pZCAwJiYodC5tZXNzYWdlcy5yZXF1aXJlZCE9PXZvaWQgMCYmKHUuZGF0ZS5tZXNzYWdlcy5yZXF1aXJlZD10Lm1lc3NhZ2VzLnJlcXVpcmVkKSx0Lm1lc3NhZ2VzLmludmFsaWRNb250aCE9PXZvaWQgMCYmKHUuZGF0ZS5tZXNzYWdlcy5pbnZhbGlkTW9udGg9dC5tZXNzYWdlcy5pbnZhbGlkTW9udGgpLHQubWVzc2FnZXMuaW52YWxpZERheSE9PXZvaWQgMCYmKHUuZGF0ZS5tZXNzYWdlcy5pbnZhbGlkRGF5PXQubWVzc2FnZXMuaW52YWxpZERheSksdC5tZXNzYWdlcy5hZnRlck1pbiE9PXZvaWQgMCYmKHUuZGF0ZS5tZXNzYWdlcy5hZnRlck1pbj10Lm1lc3NhZ2VzLmFmdGVyTWluKSx0Lm1lc3NhZ2VzLmJlZm9yZU1heCE9PXZvaWQgMCYmKHUuZGF0ZS5tZXNzYWdlcy5iZWZvcmVNYXg9dC5tZXNzYWdlcy5iZWZvcmVNYXgpKX19ZnVuY3Rpb24gVihyLHQpe2lmKHR5cGVvZiByPT1cInN0cmluZ1wiKXJldHVybiB1LmFsaWFzZXMuZ2V0KHIpPT09dDtmb3IoY29uc3QgZSBvZiByKWlmKGUhPT12b2lkIDAmJlYoZSx0KSlyZXR1cm4hMDtyZXR1cm4hMX1mdW5jdGlvbiBqKHIsdCl7aWYocj09PXQpcmV0dXJuO2NvbnN0IGU9ci5zcGxpdChgXG5gKSxzPXQuc3BsaXQoYFxuYCksaT1NYXRoLm1heChlLmxlbmd0aCxzLmxlbmd0aCksbj1bXTtmb3IobGV0IG89MDtvPGk7bysrKWVbb10hPT1zW29dJiZuLnB1c2gobyk7cmV0dXJue2xpbmVzOm4sbnVtTGluZXNCZWZvcmU6ZS5sZW5ndGgsbnVtTGluZXNBZnRlcjpzLmxlbmd0aCxudW1MaW5lczppfX1jb25zdCBZPWdsb2JhbFRoaXMucHJvY2Vzcy5wbGF0Zm9ybS5zdGFydHNXaXRoKFwid2luXCIpLEM9U3ltYm9sKFwiY2xhY2s6Y2FuY2VsXCIpO2Z1bmN0aW9uIHEocil7cmV0dXJuIHI9PT1DfWZ1bmN0aW9uIHcocix0KXtjb25zdCBlPXI7ZS5pc1RUWSYmZS5zZXRSYXdNb2RlKHQpfWZ1bmN0aW9uIHooe2lucHV0OnI9JCxvdXRwdXQ6dD1TLG92ZXJ3cml0ZTplPSEwLGhpZGVDdXJzb3I6cz0hMH09e30pe2NvbnN0IGk9Xy5jcmVhdGVJbnRlcmZhY2Uoe2lucHV0OnIsb3V0cHV0OnQscHJvbXB0OlwiXCIsdGFiU2l6ZToxfSk7Xy5lbWl0S2V5cHJlc3NFdmVudHMocixpKSxyIGluc3RhbmNlb2YgRCYmci5pc1RUWSYmci5zZXRSYXdNb2RlKCEwKTtjb25zdCBuPShvLHtuYW1lOmEsc2VxdWVuY2U6aH0pPT57Y29uc3QgbD1TdHJpbmcobyk7aWYoVihbbCxhLGhdLFwiY2FuY2VsXCIpKXtzJiZ0LndyaXRlKGMuc2hvdykscHJvY2Vzcy5leGl0KDApO3JldHVybn1pZighZSlyZXR1cm47Y29uc3QgZj1hPT09XCJyZXR1cm5cIj8wOi0xLHY9YT09PVwicmV0dXJuXCI/LTE6MDtfLm1vdmVDdXJzb3IodCxmLHYsKCk9PntfLmNsZWFyTGluZSh0LDEsKCk9PntyLm9uY2UoXCJrZXlwcmVzc1wiLG4pfSl9KX07cmV0dXJuIHMmJnQud3JpdGUoYy5oaWRlKSxyLm9uY2UoXCJrZXlwcmVzc1wiLG4pLCgpPT57ci5vZmYoXCJrZXlwcmVzc1wiLG4pLHMmJnQud3JpdGUoYy5zaG93KSxyIGluc3RhbmNlb2YgRCYmci5pc1RUWSYmIVkmJnIuc2V0UmF3TW9kZSghMSksaS50ZXJtaW5hbD0hMSxpLmNsb3NlKCl9fWNvbnN0IE89cj0+XCJjb2x1bW5zXCJpbiByJiZ0eXBlb2Ygci5jb2x1bW5zPT1cIm51bWJlclwiP3IuY29sdW1uczo4MCxBPXI9Plwicm93c1wiaW4gciYmdHlwZW9mIHIucm93cz09XCJudW1iZXJcIj9yLnJvd3M6MjA7ZnVuY3Rpb24gUihyLHQsZSxzPWUpe2NvbnN0IGk9TyhyPz9TKTtyZXR1cm4geCh0LGktZS5sZW5ndGgse2hhcmQ6ITAsdHJpbTohMX0pLnNwbGl0KGBcbmApLm1hcCgobixvKT0+YCR7bz09PTA/czplfSR7bn1gKS5qb2luKGBcbmApfWxldCBwPWNsYXNze2lucHV0O291dHB1dDtfYWJvcnRTaWduYWw7cmw7b3B0cztfcmVuZGVyO190cmFjaz0hMTtfcHJldkZyYW1lPVwiXCI7X3N1YnNjcmliZXJzPW5ldyBNYXA7X2N1cnNvcj0wO3N0YXRlPVwiaW5pdGlhbFwiO2Vycm9yPVwiXCI7dmFsdWU7dXNlcklucHV0PVwiXCI7Y29uc3RydWN0b3IodCxlPSEwKXtjb25zdHtpbnB1dDpzPSQsb3V0cHV0Omk9UyxyZW5kZXI6bixzaWduYWw6bywuLi5hfT10O3RoaXMub3B0cz1hLHRoaXMub25LZXlwcmVzcz10aGlzLm9uS2V5cHJlc3MuYmluZCh0aGlzKSx0aGlzLmNsb3NlPXRoaXMuY2xvc2UuYmluZCh0aGlzKSx0aGlzLnJlbmRlcj10aGlzLnJlbmRlci5iaW5kKHRoaXMpLHRoaXMuX3JlbmRlcj1uLmJpbmQodGhpcyksdGhpcy5fdHJhY2s9ZSx0aGlzLl9hYm9ydFNpZ25hbD1vLHRoaXMuaW5wdXQ9cyx0aGlzLm91dHB1dD1pfXVuc3Vic2NyaWJlKCl7dGhpcy5fc3Vic2NyaWJlcnMuY2xlYXIoKX1zZXRTdWJzY3JpYmVyKHQsZSl7Y29uc3Qgcz10aGlzLl9zdWJzY3JpYmVycy5nZXQodCk/P1tdO3MucHVzaChlKSx0aGlzLl9zdWJzY3JpYmVycy5zZXQodCxzKX1vbih0LGUpe3RoaXMuc2V0U3Vic2NyaWJlcih0LHtjYjplfSl9b25jZSh0LGUpe3RoaXMuc2V0U3Vic2NyaWJlcih0LHtjYjplLG9uY2U6ITB9KX1lbWl0KHQsLi4uZSl7Y29uc3Qgcz10aGlzLl9zdWJzY3JpYmVycy5nZXQodCk/P1tdLGk9W107Zm9yKGNvbnN0IG4gb2YgcyluLmNiKC4uLmUpLG4ub25jZSYmaS5wdXNoKCgpPT5zLnNwbGljZShzLmluZGV4T2YobiksMSkpO2Zvcihjb25zdCBuIG9mIGkpbigpfXByb21wdCgpe3JldHVybiBuZXcgUHJvbWlzZSh0PT57aWYodGhpcy5fYWJvcnRTaWduYWwpe2lmKHRoaXMuX2Fib3J0U2lnbmFsLmFib3J0ZWQpcmV0dXJuIHRoaXMuc3RhdGU9XCJjYW5jZWxcIix0aGlzLmNsb3NlKCksdChDKTt0aGlzLl9hYm9ydFNpZ25hbC5hZGRFdmVudExpc3RlbmVyKFwiYWJvcnRcIiwoKT0+e3RoaXMuc3RhdGU9XCJjYW5jZWxcIix0aGlzLmNsb3NlKCl9LHtvbmNlOiEwfSl9dGhpcy5ybD1QLmNyZWF0ZUludGVyZmFjZSh7aW5wdXQ6dGhpcy5pbnB1dCx0YWJTaXplOjIscHJvbXB0OlwiXCIsZXNjYXBlQ29kZVRpbWVvdXQ6NTAsdGVybWluYWw6ITB9KSx0aGlzLnJsLnByb21wdCgpLHRoaXMub3B0cy5pbml0aWFsVXNlcklucHV0IT09dm9pZCAwJiZ0aGlzLl9zZXRVc2VySW5wdXQodGhpcy5vcHRzLmluaXRpYWxVc2VySW5wdXQsITApLHRoaXMuaW5wdXQub24oXCJrZXlwcmVzc1wiLHRoaXMub25LZXlwcmVzcyksdyh0aGlzLmlucHV0LCEwKSx0aGlzLm91dHB1dC5vbihcInJlc2l6ZVwiLHRoaXMucmVuZGVyKSx0aGlzLnJlbmRlcigpLHRoaXMub25jZShcInN1Ym1pdFwiLCgpPT57dGhpcy5vdXRwdXQud3JpdGUoYy5zaG93KSx0aGlzLm91dHB1dC5vZmYoXCJyZXNpemVcIix0aGlzLnJlbmRlciksdyh0aGlzLmlucHV0LCExKSx0KHRoaXMudmFsdWUpfSksdGhpcy5vbmNlKFwiY2FuY2VsXCIsKCk9Pnt0aGlzLm91dHB1dC53cml0ZShjLnNob3cpLHRoaXMub3V0cHV0Lm9mZihcInJlc2l6ZVwiLHRoaXMucmVuZGVyKSx3KHRoaXMuaW5wdXQsITEpLHQoQyl9KX0pfV9pc0FjdGlvbktleSh0LGUpe3JldHVybiB0PT09XCJcdFwifV9zZXRWYWx1ZSh0KXt0aGlzLnZhbHVlPXQsdGhpcy5lbWl0KFwidmFsdWVcIix0aGlzLnZhbHVlKX1fc2V0VXNlcklucHV0KHQsZSl7dGhpcy51c2VySW5wdXQ9dD8/XCJcIix0aGlzLmVtaXQoXCJ1c2VySW5wdXRcIix0aGlzLnVzZXJJbnB1dCksZSYmdGhpcy5fdHJhY2smJnRoaXMucmwmJih0aGlzLnJsLndyaXRlKHRoaXMudXNlcklucHV0KSx0aGlzLl9jdXJzb3I9dGhpcy5ybC5jdXJzb3IpfV9jbGVhclVzZXJJbnB1dCgpe3RoaXMucmw/LndyaXRlKG51bGwse2N0cmw6ITAsbmFtZTpcInVcIn0pLHRoaXMuX3NldFVzZXJJbnB1dChcIlwiKX1vbktleXByZXNzKHQsZSl7aWYodGhpcy5fdHJhY2smJmUubmFtZSE9PVwicmV0dXJuXCImJihlLm5hbWUmJnRoaXMuX2lzQWN0aW9uS2V5KHQsZSkmJnRoaXMucmw/LndyaXRlKG51bGwse2N0cmw6ITAsbmFtZTpcImhcIn0pLHRoaXMuX2N1cnNvcj10aGlzLnJsPy5jdXJzb3I/PzAsdGhpcy5fc2V0VXNlcklucHV0KHRoaXMucmw/LmxpbmUpKSx0aGlzLnN0YXRlPT09XCJlcnJvclwiJiYodGhpcy5zdGF0ZT1cImFjdGl2ZVwiKSxlPy5uYW1lJiYoIXRoaXMuX3RyYWNrJiZ1LmFsaWFzZXMuaGFzKGUubmFtZSkmJnRoaXMuZW1pdChcImN1cnNvclwiLHUuYWxpYXNlcy5nZXQoZS5uYW1lKSksdS5hY3Rpb25zLmhhcyhlLm5hbWUpJiZ0aGlzLmVtaXQoXCJjdXJzb3JcIixlLm5hbWUpKSx0JiYodC50b0xvd2VyQ2FzZSgpPT09XCJ5XCJ8fHQudG9Mb3dlckNhc2UoKT09PVwiblwiKSYmdGhpcy5lbWl0KFwiY29uZmlybVwiLHQudG9Mb3dlckNhc2UoKT09PVwieVwiKSx0aGlzLmVtaXQoXCJrZXlcIix0Py50b0xvd2VyQ2FzZSgpLGUpLGU/Lm5hbWU9PT1cInJldHVyblwiKXtpZih0aGlzLm9wdHMudmFsaWRhdGUpe2NvbnN0IHM9dGhpcy5vcHRzLnZhbGlkYXRlKHRoaXMudmFsdWUpO3MmJih0aGlzLmVycm9yPXMgaW5zdGFuY2VvZiBFcnJvcj9zLm1lc3NhZ2U6cyx0aGlzLnN0YXRlPVwiZXJyb3JcIix0aGlzLnJsPy53cml0ZSh0aGlzLnVzZXJJbnB1dCkpfXRoaXMuc3RhdGUhPT1cImVycm9yXCImJih0aGlzLnN0YXRlPVwic3VibWl0XCIpfVYoW3QsZT8ubmFtZSxlPy5zZXF1ZW5jZV0sXCJjYW5jZWxcIikmJih0aGlzLnN0YXRlPVwiY2FuY2VsXCIpLCh0aGlzLnN0YXRlPT09XCJzdWJtaXRcInx8dGhpcy5zdGF0ZT09PVwiY2FuY2VsXCIpJiZ0aGlzLmVtaXQoXCJmaW5hbGl6ZVwiKSx0aGlzLnJlbmRlcigpLCh0aGlzLnN0YXRlPT09XCJzdWJtaXRcInx8dGhpcy5zdGF0ZT09PVwiY2FuY2VsXCIpJiZ0aGlzLmNsb3NlKCl9Y2xvc2UoKXt0aGlzLmlucHV0LnVucGlwZSgpLHRoaXMuaW5wdXQucmVtb3ZlTGlzdGVuZXIoXCJrZXlwcmVzc1wiLHRoaXMub25LZXlwcmVzcyksdGhpcy5vdXRwdXQud3JpdGUoYFxuYCksdyh0aGlzLmlucHV0LCExKSx0aGlzLnJsPy5jbG9zZSgpLHRoaXMucmw9dm9pZCAwLHRoaXMuZW1pdChgJHt0aGlzLnN0YXRlfWAsdGhpcy52YWx1ZSksdGhpcy51bnN1YnNjcmliZSgpfXJlc3RvcmVDdXJzb3IoKXtjb25zdCB0PXgodGhpcy5fcHJldkZyYW1lLHByb2Nlc3Muc3Rkb3V0LmNvbHVtbnMse2hhcmQ6ITAsdHJpbTohMX0pLnNwbGl0KGBcbmApLmxlbmd0aC0xO3RoaXMub3V0cHV0LndyaXRlKGMubW92ZSgtOTk5LHQqLTEpKX1yZW5kZXIoKXtjb25zdCB0PXgodGhpcy5fcmVuZGVyKHRoaXMpPz9cIlwiLHByb2Nlc3Muc3Rkb3V0LmNvbHVtbnMse2hhcmQ6ITAsdHJpbTohMX0pO2lmKHQhPT10aGlzLl9wcmV2RnJhbWUpe2lmKHRoaXMuc3RhdGU9PT1cImluaXRpYWxcIil0aGlzLm91dHB1dC53cml0ZShjLmhpZGUpO2Vsc2V7Y29uc3QgZT1qKHRoaXMuX3ByZXZGcmFtZSx0KSxzPUEodGhpcy5vdXRwdXQpO2lmKHRoaXMucmVzdG9yZUN1cnNvcigpLGUpe2NvbnN0IGk9TWF0aC5tYXgoMCxlLm51bUxpbmVzQWZ0ZXItcyksbj1NYXRoLm1heCgwLGUubnVtTGluZXNCZWZvcmUtcyk7bGV0IG89ZS5saW5lcy5maW5kKGE9PmE+PWkpO2lmKG89PT12b2lkIDApe3RoaXMuX3ByZXZGcmFtZT10O3JldHVybn1pZihlLmxpbmVzLmxlbmd0aD09PTEpe3RoaXMub3V0cHV0LndyaXRlKGMubW92ZSgwLG8tbikpLHRoaXMub3V0cHV0LndyaXRlKE0ubGluZXMoMSkpO2NvbnN0IGE9dC5zcGxpdChgXG5gKTt0aGlzLm91dHB1dC53cml0ZShhW29dKSx0aGlzLl9wcmV2RnJhbWU9dCx0aGlzLm91dHB1dC53cml0ZShjLm1vdmUoMCxhLmxlbmd0aC1vLTEpKTtyZXR1cm59ZWxzZSBpZihlLmxpbmVzLmxlbmd0aD4xKXtpZihpPG4pbz1pO2Vsc2V7Y29uc3QgaD1vLW47aD4wJiZ0aGlzLm91dHB1dC53cml0ZShjLm1vdmUoMCxoKSl9dGhpcy5vdXRwdXQud3JpdGUoTS5kb3duKCkpO2NvbnN0IGE9dC5zcGxpdChgXG5gKS5zbGljZShvKTt0aGlzLm91dHB1dC53cml0ZShhLmpvaW4oYFxuYCkpLHRoaXMuX3ByZXZGcmFtZT10O3JldHVybn19dGhpcy5vdXRwdXQud3JpdGUoTS5kb3duKCkpfXRoaXMub3V0cHV0LndyaXRlKHQpLHRoaXMuc3RhdGU9PT1cImluaXRpYWxcIiYmKHRoaXMuc3RhdGU9XCJhY3RpdmVcIiksdGhpcy5fcHJldkZyYW1lPXR9fX07ZnVuY3Rpb24gVyhyLHQpe2lmKHI9PT12b2lkIDB8fHQubGVuZ3RoPT09MClyZXR1cm4gMDtjb25zdCBlPXQuZmluZEluZGV4KHM9PnMudmFsdWU9PT1yKTtyZXR1cm4gZSE9PS0xP2U6MH1mdW5jdGlvbiBCKHIsdCl7cmV0dXJuKHQubGFiZWw/P1N0cmluZyh0LnZhbHVlKSkudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhyLnRvTG93ZXJDYXNlKCkpfWZ1bmN0aW9uIEoocix0KXtpZih0KXJldHVybiByP3Q6dFswXX1sZXQgSD1jbGFzcyBleHRlbmRzIHB7ZmlsdGVyZWRPcHRpb25zO211bHRpcGxlO2lzTmF2aWdhdGluZz0hMTtzZWxlY3RlZFZhbHVlcz1bXTtmb2N1c2VkVmFsdWU7I2U9MDsjbz1cIlwiOyN0OyNuOyNhO2dldCBjdXJzb3IoKXtyZXR1cm4gdGhpcy4jZX1nZXQgdXNlcklucHV0V2l0aEN1cnNvcigpe2lmKCF0aGlzLnVzZXJJbnB1dClyZXR1cm4geShbXCJpbnZlcnNlXCIsXCJoaWRkZW5cIl0sXCJfXCIpO2lmKHRoaXMuX2N1cnNvcj49dGhpcy51c2VySW5wdXQubGVuZ3RoKXJldHVybmAke3RoaXMudXNlcklucHV0fVxcdTI1ODhgO2NvbnN0IHQ9dGhpcy51c2VySW5wdXQuc2xpY2UoMCx0aGlzLl9jdXJzb3IpLFtlLC4uLnNdPXRoaXMudXNlcklucHV0LnNsaWNlKHRoaXMuX2N1cnNvcik7cmV0dXJuYCR7dH0ke3koXCJpbnZlcnNlXCIsZSl9JHtzLmpvaW4oXCJcIil9YH1nZXQgb3B0aW9ucygpe3JldHVybiB0eXBlb2YgdGhpcy4jbj09XCJmdW5jdGlvblwiP3RoaXMuI24oKTp0aGlzLiNufWNvbnN0cnVjdG9yKHQpe3N1cGVyKHQpLHRoaXMuI249dC5vcHRpb25zLHRoaXMuI2E9dC5wbGFjZWhvbGRlcjtjb25zdCBlPXRoaXMub3B0aW9uczt0aGlzLmZpbHRlcmVkT3B0aW9ucz1bLi4uZV0sdGhpcy5tdWx0aXBsZT10Lm11bHRpcGxlPT09ITAsdGhpcy4jdD10eXBlb2YgdC5vcHRpb25zPT1cImZ1bmN0aW9uXCI/dC5maWx0ZXI6dC5maWx0ZXI/P0I7bGV0IHM7aWYodC5pbml0aWFsVmFsdWUmJkFycmF5LmlzQXJyYXkodC5pbml0aWFsVmFsdWUpP3RoaXMubXVsdGlwbGU/cz10LmluaXRpYWxWYWx1ZTpzPXQuaW5pdGlhbFZhbHVlLnNsaWNlKDAsMSk6IXRoaXMubXVsdGlwbGUmJnRoaXMub3B0aW9ucy5sZW5ndGg+MCYmKHM9W3RoaXMub3B0aW9uc1swXS52YWx1ZV0pLHMpZm9yKGNvbnN0IGkgb2Ygcyl7Y29uc3Qgbj1lLmZpbmRJbmRleChvPT5vLnZhbHVlPT09aSk7biE9PS0xJiYodGhpcy50b2dnbGVTZWxlY3RlZChpKSx0aGlzLiNlPW4pfXRoaXMuZm9jdXNlZFZhbHVlPXRoaXMub3B0aW9uc1t0aGlzLiNlXT8udmFsdWUsdGhpcy5vbihcImtleVwiLChpLG4pPT50aGlzLiNzKGksbikpLHRoaXMub24oXCJ1c2VySW5wdXRcIixpPT50aGlzLiNpKGkpKX1faXNBY3Rpb25LZXkodCxlKXtyZXR1cm4gdD09PVwiXHRcInx8dGhpcy5tdWx0aXBsZSYmdGhpcy5pc05hdmlnYXRpbmcmJmUubmFtZT09PVwic3BhY2VcIiYmdCE9PXZvaWQgMCYmdCE9PVwiXCJ9I3ModCxlKXtjb25zdCBzPWUubmFtZT09PVwidXBcIixpPWUubmFtZT09PVwiZG93blwiLG49ZS5uYW1lPT09XCJyZXR1cm5cIixvPXRoaXMudXNlcklucHV0PT09XCJcInx8dGhpcy51c2VySW5wdXQ9PT1cIlx0XCIsYT10aGlzLiNhLGg9dGhpcy5vcHRpb25zLGw9YSE9PXZvaWQgMCYmYSE9PVwiXCImJmguc29tZShmPT4hZi5kaXNhYmxlZCYmKHRoaXMuI3Q/dGhpcy4jdChhLGYpOiEwKSk7aWYoZS5uYW1lPT09XCJ0YWJcIiYmbyYmbCl7dGhpcy51c2VySW5wdXQ9PT1cIlx0XCImJnRoaXMuX2NsZWFyVXNlcklucHV0KCksdGhpcy5fc2V0VXNlcklucHV0KGEsITApLHRoaXMuaXNOYXZpZ2F0aW5nPSExO3JldHVybn1zfHxpPyh0aGlzLiNlPWQodGhpcy4jZSxzPy0xOjEsdGhpcy5maWx0ZXJlZE9wdGlvbnMpLHRoaXMuZm9jdXNlZFZhbHVlPXRoaXMuZmlsdGVyZWRPcHRpb25zW3RoaXMuI2VdPy52YWx1ZSx0aGlzLm11bHRpcGxlfHwodGhpcy5zZWxlY3RlZFZhbHVlcz1bdGhpcy5mb2N1c2VkVmFsdWVdKSx0aGlzLmlzTmF2aWdhdGluZz0hMCk6bj90aGlzLnZhbHVlPUoodGhpcy5tdWx0aXBsZSx0aGlzLnNlbGVjdGVkVmFsdWVzKTp0aGlzLm11bHRpcGxlP3RoaXMuZm9jdXNlZFZhbHVlIT09dm9pZCAwJiYoZS5uYW1lPT09XCJ0YWJcInx8dGhpcy5pc05hdmlnYXRpbmcmJmUubmFtZT09PVwic3BhY2VcIik/dGhpcy50b2dnbGVTZWxlY3RlZCh0aGlzLmZvY3VzZWRWYWx1ZSk6dGhpcy5pc05hdmlnYXRpbmc9ITE6KHRoaXMuZm9jdXNlZFZhbHVlJiYodGhpcy5zZWxlY3RlZFZhbHVlcz1bdGhpcy5mb2N1c2VkVmFsdWVdKSx0aGlzLmlzTmF2aWdhdGluZz0hMSl9ZGVzZWxlY3RBbGwoKXt0aGlzLnNlbGVjdGVkVmFsdWVzPVtdfXRvZ2dsZVNlbGVjdGVkKHQpe3RoaXMuZmlsdGVyZWRPcHRpb25zLmxlbmd0aCE9PTAmJih0aGlzLm11bHRpcGxlP3RoaXMuc2VsZWN0ZWRWYWx1ZXMuaW5jbHVkZXModCk/dGhpcy5zZWxlY3RlZFZhbHVlcz10aGlzLnNlbGVjdGVkVmFsdWVzLmZpbHRlcihlPT5lIT09dCk6dGhpcy5zZWxlY3RlZFZhbHVlcz1bLi4udGhpcy5zZWxlY3RlZFZhbHVlcyx0XTp0aGlzLnNlbGVjdGVkVmFsdWVzPVt0XSl9I2kodCl7aWYodCE9PXRoaXMuI28pe3RoaXMuI289dDtjb25zdCBlPXRoaXMub3B0aW9uczt0JiZ0aGlzLiN0P3RoaXMuZmlsdGVyZWRPcHRpb25zPWUuZmlsdGVyKG49PnRoaXMuI3Q/Lih0LG4pKTp0aGlzLmZpbHRlcmVkT3B0aW9ucz1bLi4uZV07Y29uc3Qgcz1XKHRoaXMuZm9jdXNlZFZhbHVlLHRoaXMuZmlsdGVyZWRPcHRpb25zKTt0aGlzLiNlPWQocywwLHRoaXMuZmlsdGVyZWRPcHRpb25zKTtjb25zdCBpPXRoaXMuZmlsdGVyZWRPcHRpb25zW3RoaXMuI2VdO2kmJiFpLmRpc2FibGVkP3RoaXMuZm9jdXNlZFZhbHVlPWkudmFsdWU6dGhpcy5mb2N1c2VkVmFsdWU9dm9pZCAwLHRoaXMubXVsdGlwbGV8fCh0aGlzLmZvY3VzZWRWYWx1ZSE9PXZvaWQgMD90aGlzLnRvZ2dsZVNlbGVjdGVkKHRoaXMuZm9jdXNlZFZhbHVlKTp0aGlzLmRlc2VsZWN0QWxsKCkpfX19O2NsYXNzIFEgZXh0ZW5kcyBwe2dldCBjdXJzb3IoKXtyZXR1cm4gdGhpcy52YWx1ZT8wOjF9Z2V0IF92YWx1ZSgpe3JldHVybiB0aGlzLmN1cnNvcj09PTB9Y29uc3RydWN0b3IodCl7c3VwZXIodCwhMSksdGhpcy52YWx1ZT0hIXQuaW5pdGlhbFZhbHVlLHRoaXMub24oXCJ1c2VySW5wdXRcIiwoKT0+e3RoaXMudmFsdWU9dGhpcy5fdmFsdWV9KSx0aGlzLm9uKFwiY29uZmlybVwiLGU9Pnt0aGlzLm91dHB1dC53cml0ZShjLm1vdmUoMCwtMSkpLHRoaXMudmFsdWU9ZSx0aGlzLnN0YXRlPVwic3VibWl0XCIsdGhpcy5jbG9zZSgpfSksdGhpcy5vbihcImN1cnNvclwiLCgpPT57dGhpcy52YWx1ZT0hdGhpcy52YWx1ZX0pfX1jb25zdCBYPXtZOnt0eXBlOlwieWVhclwiLGxlbjo0fSxNOnt0eXBlOlwibW9udGhcIixsZW46Mn0sRDp7dHlwZTpcImRheVwiLGxlbjoyfX07ZnVuY3Rpb24gTChyKXtyZXR1cm5bLi4ucl0ubWFwKHQ9PlhbdF0pfWZ1bmN0aW9uIFoocil7Y29uc3QgdD1uZXcgSW50bC5EYXRlVGltZUZvcm1hdChyLHt5ZWFyOlwibnVtZXJpY1wiLG1vbnRoOlwiMi1kaWdpdFwiLGRheTpcIjItZGlnaXRcIn0pLmZvcm1hdFRvUGFydHMobmV3IERhdGUoMmUzLDAsMTUpKSxlPVtdO2xldCBzPVwiL1wiO2Zvcihjb25zdCBpIG9mIHQpaS50eXBlPT09XCJsaXRlcmFsXCI/cz1pLnZhbHVlLnRyaW0oKXx8aS52YWx1ZTooaS50eXBlPT09XCJ5ZWFyXCJ8fGkudHlwZT09PVwibW9udGhcInx8aS50eXBlPT09XCJkYXlcIikmJmUucHVzaCh7dHlwZTppLnR5cGUsbGVuOmkudHlwZT09PVwieWVhclwiPzQ6Mn0pO3JldHVybntzZWdtZW50czplLHNlcGFyYXRvcjpzfX1mdW5jdGlvbiBrKHIpe3JldHVybiBOdW1iZXIucGFyc2VJbnQoKHJ8fFwiMFwiKS5yZXBsYWNlKC9fL2csXCIwXCIpLDEwKXx8MH1mdW5jdGlvbiBJKHIpe3JldHVybnt5ZWFyOmsoci55ZWFyKSxtb250aDprKHIubW9udGgpLGRheTprKHIuZGF5KX19ZnVuY3Rpb24gVChyLHQpe3JldHVybiBuZXcgRGF0ZShyfHwyMDAxLHR8fDEsMCkuZ2V0RGF0ZSgpfWZ1bmN0aW9uIEYocil7Y29uc3R7eWVhcjp0LG1vbnRoOmUsZGF5OnN9PUkocik7aWYoIXR8fHQ8MHx8dD45OTk5fHwhZXx8ZTwxfHxlPjEyfHwhc3x8czwxKXJldHVybjtjb25zdCBpPW5ldyBEYXRlKERhdGUuVVRDKHQsZS0xLHMpKTtpZighKGkuZ2V0VVRDRnVsbFllYXIoKSE9PXR8fGkuZ2V0VVRDTW9udGgoKSE9PWUtMXx8aS5nZXRVVENEYXRlKCkhPT1zKSlyZXR1cm57eWVhcjp0LG1vbnRoOmUsZGF5OnN9fWZ1bmN0aW9uIE4ocil7Y29uc3QgdD1GKHIpO3JldHVybiB0P25ldyBEYXRlKERhdGUuVVRDKHQueWVhcix0Lm1vbnRoLTEsdC5kYXkpKTp2b2lkIDB9ZnVuY3Rpb24gdHQocix0LGUscyl7Y29uc3QgaT1lP3t5ZWFyOmUuZ2V0VVRDRnVsbFllYXIoKSxtb250aDplLmdldFVUQ01vbnRoKCkrMSxkYXk6ZS5nZXRVVENEYXRlKCl9Om51bGwsbj1zP3t5ZWFyOnMuZ2V0VVRDRnVsbFllYXIoKSxtb250aDpzLmdldFVUQ01vbnRoKCkrMSxkYXk6cy5nZXRVVENEYXRlKCl9Om51bGw7cmV0dXJuIHI9PT1cInllYXJcIj97bWluOmk/LnllYXI/PzEsbWF4Om4/LnllYXI/Pzk5OTl9OnI9PT1cIm1vbnRoXCI/e21pbjppJiZ0LnllYXI9PT1pLnllYXI/aS5tb250aDoxLG1heDpuJiZ0LnllYXI9PT1uLnllYXI/bi5tb250aDoxMn06e21pbjppJiZ0LnllYXI9PT1pLnllYXImJnQubW9udGg9PT1pLm1vbnRoP2kuZGF5OjEsbWF4Om4mJnQueWVhcj09PW4ueWVhciYmdC5tb250aD09PW4ubW9udGg/bi5kYXk6VCh0LnllYXIsdC5tb250aCl9fWNsYXNzIGV0IGV4dGVuZHMgcHsjZTsjbzsjdDsjbjsjYTsjcz17c2VnbWVudEluZGV4OjAscG9zaXRpb25JblNlZ21lbnQ6MH07I2k9ITA7I3I9bnVsbDtpbmxpbmVFcnJvcj1cIlwiO2dldCBzZWdtZW50Q3Vyc29yKCl7cmV0dXJuey4uLnRoaXMuI3N9fWdldCBzZWdtZW50VmFsdWVzKCl7cmV0dXJuey4uLnRoaXMuI3R9fWdldCBzZWdtZW50cygpe3JldHVybiB0aGlzLiNlfWdldCBzZXBhcmF0b3IoKXtyZXR1cm4gdGhpcy4jb31nZXQgZm9ybWF0dGVkVmFsdWUoKXtyZXR1cm4gdGhpcy4jYyh0aGlzLiN0KX0jYyh0KXtyZXR1cm4gdGhpcy4jZS5tYXAoZT0+dFtlLnR5cGVdKS5qb2luKHRoaXMuI28pfSNoKCl7dGhpcy5fc2V0VXNlcklucHV0KHRoaXMuI2ModGhpcy4jdCkpLHRoaXMuX3NldFZhbHVlKE4odGhpcy4jdCk/P3ZvaWQgMCl9Y29uc3RydWN0b3IodCl7Y29uc3QgZT10LmZvcm1hdD97c2VnbWVudHM6TCh0LmZvcm1hdCksc2VwYXJhdG9yOnQuc2VwYXJhdG9yPz9cIi9cIn06Wih0LmxvY2FsZSkscz10LnNlcGFyYXRvcj8/ZS5zZXBhcmF0b3IsaT10LmZvcm1hdD9MKHQuZm9ybWF0KTplLnNlZ21lbnRzLG49dC5pbml0aWFsVmFsdWU/P3QuZGVmYXVsdFZhbHVlLG89bj97eWVhcjpTdHJpbmcobi5nZXRVVENGdWxsWWVhcigpKS5wYWRTdGFydCg0LFwiMFwiKSxtb250aDpTdHJpbmcobi5nZXRVVENNb250aCgpKzEpLnBhZFN0YXJ0KDIsXCIwXCIpLGRheTpTdHJpbmcobi5nZXRVVENEYXRlKCkpLnBhZFN0YXJ0KDIsXCIwXCIpfTp7eWVhcjpcIl9fX19cIixtb250aDpcIl9fXCIsZGF5OlwiX19cIn0sYT1pLm1hcChoPT5vW2gudHlwZV0pLmpvaW4ocyk7c3VwZXIoey4uLnQsaW5pdGlhbFVzZXJJbnB1dDphfSwhMSksdGhpcy4jZT1pLHRoaXMuI289cyx0aGlzLiN0PW8sdGhpcy4jbj10Lm1pbkRhdGUsdGhpcy4jYT10Lm1heERhdGUsdGhpcy4jaCgpLHRoaXMub24oXCJjdXJzb3JcIixoPT50aGlzLiNkKGgpKSx0aGlzLm9uKFwia2V5XCIsKGgsbCk9PnRoaXMuI2YoaCxsKSksdGhpcy5vbihcImZpbmFsaXplXCIsKCk9PnRoaXMuI2codCkpfSN1KCl7Y29uc3QgdD1NYXRoLm1heCgwLE1hdGgubWluKHRoaXMuI3Muc2VnbWVudEluZGV4LHRoaXMuI2UubGVuZ3RoLTEpKSxlPXRoaXMuI2VbdF07aWYoZSlyZXR1cm4gdGhpcy4jcy5wb3NpdGlvbkluU2VnbWVudD1NYXRoLm1heCgwLE1hdGgubWluKHRoaXMuI3MucG9zaXRpb25JblNlZ21lbnQsZS5sZW4tMSkpLHtzZWdtZW50OmUsaW5kZXg6dH19I2wodCl7dGhpcy5pbmxpbmVFcnJvcj1cIlwiLHRoaXMuI3I9bnVsbDtjb25zdCBlPXRoaXMuI3UoKTtlJiYodGhpcy4jcy5zZWdtZW50SW5kZXg9TWF0aC5tYXgoMCxNYXRoLm1pbih0aGlzLiNlLmxlbmd0aC0xLGUuaW5kZXgrdCkpLHRoaXMuI3MucG9zaXRpb25JblNlZ21lbnQ9MCx0aGlzLiNpPSEwKX0jcCh0KXtjb25zdCBlPXRoaXMuI3UoKTtpZighZSlyZXR1cm47Y29uc3R7c2VnbWVudDpzfT1lLGk9dGhpcy4jdFtzLnR5cGVdLG49IWl8fGkucmVwbGFjZSgvXy9nLFwiXCIpPT09XCJcIixvPU51bWJlci5wYXJzZUludCgoaXx8XCIwXCIpLnJlcGxhY2UoL18vZyxcIjBcIiksMTApfHwwLGE9dHQocy50eXBlLEkodGhpcy4jdCksdGhpcy4jbix0aGlzLiNhKTtsZXQgaDtuP2g9dD09PTE/YS5taW46YS5tYXg6aD1NYXRoLm1heChNYXRoLm1pbihhLm1heCxvK3QpLGEubWluKSx0aGlzLiN0PXsuLi50aGlzLiN0LFtzLnR5cGVdOmgudG9TdHJpbmcoKS5wYWRTdGFydChzLmxlbixcIjBcIil9LHRoaXMuI2k9ITAsdGhpcy4jcj1udWxsLHRoaXMuI2goKX0jZCh0KXtpZih0KXN3aXRjaCh0KXtjYXNlXCJyaWdodFwiOnJldHVybiB0aGlzLiNsKDEpO2Nhc2VcImxlZnRcIjpyZXR1cm4gdGhpcy4jbCgtMSk7Y2FzZVwidXBcIjpyZXR1cm4gdGhpcy4jcCgxKTtjYXNlXCJkb3duXCI6cmV0dXJuIHRoaXMuI3AoLTEpfX0jZih0LGUpe2lmKGU/Lm5hbWU9PT1cImJhY2tzcGFjZVwifHxlPy5zZXF1ZW5jZT09PVwiXFx4N0ZcInx8ZT8uc2VxdWVuY2U9PT1cIlxcYlwifHx0PT09XCJcXHg3RlwifHx0PT09XCJcXGJcIil7dGhpcy5pbmxpbmVFcnJvcj1cIlwiO2NvbnN0IHM9dGhpcy4jdSgpO2lmKCFzKXJldHVybjtpZighdGhpcy4jdFtzLnNlZ21lbnQudHlwZV0ucmVwbGFjZSgvXy9nLFwiXCIpKXt0aGlzLiNsKC0xKTtyZXR1cm59dGhpcy4jdFtzLnNlZ21lbnQudHlwZV09XCJfXCIucmVwZWF0KHMuc2VnbWVudC5sZW4pLHRoaXMuI2k9ITAsdGhpcy4jcy5wb3NpdGlvbkluU2VnbWVudD0wLHRoaXMuI2goKTtyZXR1cm59aWYoZT8ubmFtZT09PVwidGFiXCIpe3RoaXMuaW5saW5lRXJyb3I9XCJcIjtjb25zdCBzPXRoaXMuI3UoKTtpZighcylyZXR1cm47Y29uc3QgaT1lLnNoaWZ0Py0xOjEsbj1zLmluZGV4K2k7bj49MCYmbjx0aGlzLiNlLmxlbmd0aCYmKHRoaXMuI3Muc2VnbWVudEluZGV4PW4sdGhpcy4jcy5wb3NpdGlvbkluU2VnbWVudD0wLHRoaXMuI2k9ITApO3JldHVybn1pZih0JiYvXlswLTldJC8udGVzdCh0KSl7Y29uc3Qgcz10aGlzLiN1KCk7aWYoIXMpcmV0dXJuO2NvbnN0e3NlZ21lbnQ6aX09cyxuPSF0aGlzLiN0W2kudHlwZV0ucmVwbGFjZSgvXy9nLFwiXCIpO2lmKHRoaXMuI2kmJnRoaXMuI3IhPT1udWxsJiYhbil7Y29uc3QgbT10aGlzLiNyK3QsZz17Li4udGhpcy4jdCxbaS50eXBlXTptfSxiPXRoaXMuI20oZyxpKTtpZihiKXt0aGlzLmlubGluZUVycm9yPWIsdGhpcy4jcj1udWxsLHRoaXMuI2k9ITE7cmV0dXJufXRoaXMuaW5saW5lRXJyb3I9XCJcIix0aGlzLiN0W2kudHlwZV09bSx0aGlzLiNyPW51bGwsdGhpcy4jaT0hMSx0aGlzLiNoKCkscy5pbmRleDx0aGlzLiNlLmxlbmd0aC0xJiYodGhpcy4jcy5zZWdtZW50SW5kZXg9cy5pbmRleCsxLHRoaXMuI3MucG9zaXRpb25JblNlZ21lbnQ9MCx0aGlzLiNpPSEwKTtyZXR1cm59dGhpcy4jaSYmIW4mJih0aGlzLiN0W2kudHlwZV09XCJfXCIucmVwZWF0KGkubGVuKSx0aGlzLiNzLnBvc2l0aW9uSW5TZWdtZW50PTApLHRoaXMuI2k9ITEsdGhpcy4jcj1udWxsO2NvbnN0IG89dGhpcy4jdFtpLnR5cGVdLGE9by5pbmRleE9mKFwiX1wiKSxoPWE+PTA/YTpNYXRoLm1pbih0aGlzLiNzLnBvc2l0aW9uSW5TZWdtZW50LGkubGVuLTEpO2lmKGg8MHx8aD49aS5sZW4pcmV0dXJuO2xldCBsPW8uc2xpY2UoMCxoKSt0K28uc2xpY2UoaCsxKSxmPSExO2lmKGg9PT0wJiZvPT09XCJfX1wiJiYoaS50eXBlPT09XCJtb250aFwifHxpLnR5cGU9PT1cImRheVwiKSl7Y29uc3QgbT1OdW1iZXIucGFyc2VJbnQodCwxMCk7bD1gMCR7dH1gLGY9bTw9KGkudHlwZT09PVwibW9udGhcIj8xOjIpfWlmKGkudHlwZT09PVwieWVhclwiJiYobD0oby5yZXBsYWNlKC9fL2csXCJcIikrdCkucGFkU3RhcnQoaS5sZW4sXCJfXCIpKSwhbC5pbmNsdWRlcyhcIl9cIikpe2NvbnN0IG09ey4uLnRoaXMuI3QsW2kudHlwZV06bH0sZz10aGlzLiNtKG0saSk7aWYoZyl7dGhpcy5pbmxpbmVFcnJvcj1nO3JldHVybn19dGhpcy5pbmxpbmVFcnJvcj1cIlwiLHRoaXMuI3RbaS50eXBlXT1sO2NvbnN0IHY9bC5pbmNsdWRlcyhcIl9cIik/dm9pZCAwOkYodGhpcy4jdCk7aWYodil7Y29uc3R7eWVhcjptLG1vbnRoOmd9PXYsYj1UKG0sZyk7dGhpcy4jdD17eWVhcjpTdHJpbmcoTWF0aC5tYXgoMCxNYXRoLm1pbig5OTk5LG0pKSkucGFkU3RhcnQoNCxcIjBcIiksbW9udGg6U3RyaW5nKE1hdGgubWF4KDEsTWF0aC5taW4oMTIsZykpKS5wYWRTdGFydCgyLFwiMFwiKSxkYXk6U3RyaW5nKE1hdGgubWF4KDEsTWF0aC5taW4oYix2LmRheSkpKS5wYWRTdGFydCgyLFwiMFwiKX19dGhpcy4jaCgpO2NvbnN0IFU9bC5pbmRleE9mKFwiX1wiKTtmPyh0aGlzLiNpPSEwLHRoaXMuI3I9dCk6VT49MD90aGlzLiNzLnBvc2l0aW9uSW5TZWdtZW50PVU6YT49MCYmcy5pbmRleDx0aGlzLiNlLmxlbmd0aC0xPyh0aGlzLiNzLnNlZ21lbnRJbmRleD1zLmluZGV4KzEsdGhpcy4jcy5wb3NpdGlvbkluU2VnbWVudD0wLHRoaXMuI2k9ITApOnRoaXMuI3MucG9zaXRpb25JblNlZ21lbnQ9TWF0aC5taW4oaCsxLGkubGVuLTEpfX0jbSh0LGUpe2NvbnN0e21vbnRoOnMsZGF5Oml9PUkodCk7aWYoZS50eXBlPT09XCJtb250aFwiJiYoczwwfHxzPjEyKSlyZXR1cm4gdS5kYXRlLm1lc3NhZ2VzLmludmFsaWRNb250aDtpZihlLnR5cGU9PT1cImRheVwiJiYoaTwwfHxpPjMxKSlyZXR1cm4gdS5kYXRlLm1lc3NhZ2VzLmludmFsaWREYXkoMzEsXCJhbnkgbW9udGhcIil9I2codCl7Y29uc3R7eWVhcjplLG1vbnRoOnMsZGF5Oml9PUkodGhpcy4jdCk7aWYoZSYmcyYmaSl7Y29uc3Qgbj1UKGUscyk7dGhpcy4jdD17Li4udGhpcy4jdCxkYXk6U3RyaW5nKE1hdGgubWluKGksbikpLnBhZFN0YXJ0KDIsXCIwXCIpfX10aGlzLnZhbHVlPU4odGhpcy4jdCk/P3QuZGVmYXVsdFZhbHVlPz92b2lkIDB9fWNsYXNzIHN0IGV4dGVuZHMgcHtvcHRpb25zO2N1cnNvcj0wOyNlO2dldEdyb3VwSXRlbXModCl7cmV0dXJuIHRoaXMub3B0aW9ucy5maWx0ZXIoZT0+ZS5ncm91cD09PXQpfWlzR3JvdXBTZWxlY3RlZCh0KXtjb25zdCBlPXRoaXMuZ2V0R3JvdXBJdGVtcyh0KSxzPXRoaXMudmFsdWU7cmV0dXJuIHM9PT12b2lkIDA/ITE6ZS5ldmVyeShpPT5zLmluY2x1ZGVzKGkudmFsdWUpKX10b2dnbGVWYWx1ZSgpe2NvbnN0IHQ9dGhpcy5vcHRpb25zW3RoaXMuY3Vyc29yXTtpZih0aGlzLnZhbHVlPT09dm9pZCAwJiYodGhpcy52YWx1ZT1bXSksdC5ncm91cD09PSEwKXtjb25zdCBlPXQudmFsdWUscz10aGlzLmdldEdyb3VwSXRlbXMoZSk7dGhpcy5pc0dyb3VwU2VsZWN0ZWQoZSk/dGhpcy52YWx1ZT10aGlzLnZhbHVlLmZpbHRlcihpPT5zLmZpbmRJbmRleChuPT5uLnZhbHVlPT09aSk9PT0tMSk6dGhpcy52YWx1ZT1bLi4udGhpcy52YWx1ZSwuLi5zLm1hcChpPT5pLnZhbHVlKV0sdGhpcy52YWx1ZT1BcnJheS5mcm9tKG5ldyBTZXQodGhpcy52YWx1ZSkpfWVsc2V7Y29uc3QgZT10aGlzLnZhbHVlLmluY2x1ZGVzKHQudmFsdWUpO3RoaXMudmFsdWU9ZT90aGlzLnZhbHVlLmZpbHRlcihzPT5zIT09dC52YWx1ZSk6Wy4uLnRoaXMudmFsdWUsdC52YWx1ZV19fWNvbnN0cnVjdG9yKHQpe3N1cGVyKHQsITEpO2NvbnN0e29wdGlvbnM6ZX09dDt0aGlzLiNlPXQuc2VsZWN0YWJsZUdyb3VwcyE9PSExLHRoaXMub3B0aW9ucz1PYmplY3QuZW50cmllcyhlKS5mbGF0TWFwKChbcyxpXSk9Plt7dmFsdWU6cyxncm91cDohMCxsYWJlbDpzfSwuLi5pLm1hcChuPT4oey4uLm4sZ3JvdXA6c30pKV0pLHRoaXMudmFsdWU9Wy4uLnQuaW5pdGlhbFZhbHVlcz8/W11dLHRoaXMuY3Vyc29yPU1hdGgubWF4KHRoaXMub3B0aW9ucy5maW5kSW5kZXgoKHt2YWx1ZTpzfSk9PnM9PT10LmN1cnNvckF0KSx0aGlzLiNlPzA6MSksdGhpcy5vbihcImN1cnNvclwiLHM9Pntzd2l0Y2gocyl7Y2FzZVwibGVmdFwiOmNhc2VcInVwXCI6e3RoaXMuY3Vyc29yPXRoaXMuY3Vyc29yPT09MD90aGlzLm9wdGlvbnMubGVuZ3RoLTE6dGhpcy5jdXJzb3ItMTtjb25zdCBpPXRoaXMub3B0aW9uc1t0aGlzLmN1cnNvcl0/Lmdyb3VwPT09ITA7IXRoaXMuI2UmJmkmJih0aGlzLmN1cnNvcj10aGlzLmN1cnNvcj09PTA/dGhpcy5vcHRpb25zLmxlbmd0aC0xOnRoaXMuY3Vyc29yLTEpO2JyZWFrfWNhc2VcImRvd25cIjpjYXNlXCJyaWdodFwiOnt0aGlzLmN1cnNvcj10aGlzLmN1cnNvcj09PXRoaXMub3B0aW9ucy5sZW5ndGgtMT8wOnRoaXMuY3Vyc29yKzE7Y29uc3QgaT10aGlzLm9wdGlvbnNbdGhpcy5jdXJzb3JdPy5ncm91cD09PSEwOyF0aGlzLiNlJiZpJiYodGhpcy5jdXJzb3I9dGhpcy5jdXJzb3I9PT10aGlzLm9wdGlvbnMubGVuZ3RoLTE/MDp0aGlzLmN1cnNvcisxKTticmVha31jYXNlXCJzcGFjZVwiOnRoaXMudG9nZ2xlVmFsdWUoKTticmVha319KX19bGV0IGl0PWNsYXNzIGV4dGVuZHMgcHtvcHRpb25zO2N1cnNvcj0wO2dldCBfdmFsdWUoKXtyZXR1cm4gdGhpcy5vcHRpb25zW3RoaXMuY3Vyc29yXS52YWx1ZX1nZXQgX2VuYWJsZWRPcHRpb25zKCl7cmV0dXJuIHRoaXMub3B0aW9ucy5maWx0ZXIodD0+dC5kaXNhYmxlZCE9PSEwKX10b2dnbGVBbGwoKXtjb25zdCB0PXRoaXMuX2VuYWJsZWRPcHRpb25zLGU9dGhpcy52YWx1ZSE9PXZvaWQgMCYmdGhpcy52YWx1ZS5sZW5ndGg9PT10Lmxlbmd0aDt0aGlzLnZhbHVlPWU/W106dC5tYXAocz0+cy52YWx1ZSl9dG9nZ2xlSW52ZXJ0KCl7Y29uc3QgdD10aGlzLnZhbHVlO2lmKCF0KXJldHVybjtjb25zdCBlPXRoaXMuX2VuYWJsZWRPcHRpb25zLmZpbHRlcihzPT4hdC5pbmNsdWRlcyhzLnZhbHVlKSk7dGhpcy52YWx1ZT1lLm1hcChzPT5zLnZhbHVlKX10b2dnbGVWYWx1ZSgpe3RoaXMudmFsdWU9PT12b2lkIDAmJih0aGlzLnZhbHVlPVtdKTtjb25zdCB0PXRoaXMudmFsdWUuaW5jbHVkZXModGhpcy5fdmFsdWUpO3RoaXMudmFsdWU9dD90aGlzLnZhbHVlLmZpbHRlcihlPT5lIT09dGhpcy5fdmFsdWUpOlsuLi50aGlzLnZhbHVlLHRoaXMuX3ZhbHVlXX1jb25zdHJ1Y3Rvcih0KXtzdXBlcih0LCExKSx0aGlzLm9wdGlvbnM9dC5vcHRpb25zLHRoaXMudmFsdWU9Wy4uLnQuaW5pdGlhbFZhbHVlcz8/W11dO2NvbnN0IGU9TWF0aC5tYXgodGhpcy5vcHRpb25zLmZpbmRJbmRleCgoe3ZhbHVlOnN9KT0+cz09PXQuY3Vyc29yQXQpLDApO3RoaXMuY3Vyc29yPXRoaXMub3B0aW9uc1tlXS5kaXNhYmxlZD9kKGUsMSx0aGlzLm9wdGlvbnMpOmUsdGhpcy5vbihcImtleVwiLHM9PntzPT09XCJhXCImJnRoaXMudG9nZ2xlQWxsKCkscz09PVwiaVwiJiZ0aGlzLnRvZ2dsZUludmVydCgpfSksdGhpcy5vbihcImN1cnNvclwiLHM9Pntzd2l0Y2gocyl7Y2FzZVwibGVmdFwiOmNhc2VcInVwXCI6dGhpcy5jdXJzb3I9ZCh0aGlzLmN1cnNvciwtMSx0aGlzLm9wdGlvbnMpO2JyZWFrO2Nhc2VcImRvd25cIjpjYXNlXCJyaWdodFwiOnRoaXMuY3Vyc29yPWQodGhpcy5jdXJzb3IsMSx0aGlzLm9wdGlvbnMpO2JyZWFrO2Nhc2VcInNwYWNlXCI6dGhpcy50b2dnbGVWYWx1ZSgpO2JyZWFrfX0pfX07Y2xhc3MgcnQgZXh0ZW5kcyBwe19tYXNrPVwiXFx1MjAyMlwiO2dldCBjdXJzb3IoKXtyZXR1cm4gdGhpcy5fY3Vyc29yfWdldCBtYXNrZWQoKXtyZXR1cm4gdGhpcy51c2VySW5wdXQucmVwbGFjZUFsbCgvLi9nLHRoaXMuX21hc2spfWdldCB1c2VySW5wdXRXaXRoQ3Vyc29yKCl7aWYodGhpcy5zdGF0ZT09PVwic3VibWl0XCJ8fHRoaXMuc3RhdGU9PT1cImNhbmNlbFwiKXJldHVybiB0aGlzLm1hc2tlZDtjb25zdCB0PXRoaXMudXNlcklucHV0O2lmKHRoaXMuY3Vyc29yPj10Lmxlbmd0aClyZXR1cm5gJHt0aGlzLm1hc2tlZH0ke3koW1wiaW52ZXJzZVwiLFwiaGlkZGVuXCJdLFwiX1wiKX1gO2NvbnN0IGU9dGhpcy5tYXNrZWQscz1lLnNsaWNlKDAsdGhpcy5jdXJzb3IpLGk9ZS5zbGljZSh0aGlzLmN1cnNvcik7cmV0dXJuYCR7c30ke3koXCJpbnZlcnNlXCIsaVswXSl9JHtpLnNsaWNlKDEpfWB9Y2xlYXIoKXt0aGlzLl9jbGVhclVzZXJJbnB1dCgpfWNvbnN0cnVjdG9yKHttYXNrOnQsLi4uZX0pe3N1cGVyKGUpLHRoaXMuX21hc2s9dD8/XCJcXHUyMDIyXCIsdGhpcy5vbihcInVzZXJJbnB1dFwiLHM9Pnt0aGlzLl9zZXRWYWx1ZShzKX0pfX1jbGFzcyBudCBleHRlbmRzIHB7b3B0aW9ucztjdXJzb3I9MDtnZXQgX3NlbGVjdGVkVmFsdWUoKXtyZXR1cm4gdGhpcy5vcHRpb25zW3RoaXMuY3Vyc29yXX1jaGFuZ2VWYWx1ZSgpe3RoaXMudmFsdWU9dGhpcy5fc2VsZWN0ZWRWYWx1ZS52YWx1ZX1jb25zdHJ1Y3Rvcih0KXtzdXBlcih0LCExKSx0aGlzLm9wdGlvbnM9dC5vcHRpb25zO2NvbnN0IGU9dGhpcy5vcHRpb25zLmZpbmRJbmRleCgoe3ZhbHVlOml9KT0+aT09PXQuaW5pdGlhbFZhbHVlKSxzPWU9PT0tMT8wOmU7dGhpcy5jdXJzb3I9dGhpcy5vcHRpb25zW3NdLmRpc2FibGVkP2QocywxLHRoaXMub3B0aW9ucyk6cyx0aGlzLmNoYW5nZVZhbHVlKCksdGhpcy5vbihcImN1cnNvclwiLGk9Pntzd2l0Y2goaSl7Y2FzZVwibGVmdFwiOmNhc2VcInVwXCI6dGhpcy5jdXJzb3I9ZCh0aGlzLmN1cnNvciwtMSx0aGlzLm9wdGlvbnMpO2JyZWFrO2Nhc2VcImRvd25cIjpjYXNlXCJyaWdodFwiOnRoaXMuY3Vyc29yPWQodGhpcy5jdXJzb3IsMSx0aGlzLm9wdGlvbnMpO2JyZWFrfXRoaXMuY2hhbmdlVmFsdWUoKX0pfX1jbGFzcyBvdCBleHRlbmRzIHB7b3B0aW9ucztjdXJzb3I9MDtjb25zdHJ1Y3Rvcih0KXtzdXBlcih0LCExKSx0aGlzLm9wdGlvbnM9dC5vcHRpb25zO2NvbnN0IGU9dC5jYXNlU2Vuc2l0aXZlPT09ITAscz10aGlzLm9wdGlvbnMubWFwKCh7dmFsdWU6W2ldfSk9PmU/aTppPy50b0xvd2VyQ2FzZSgpKTt0aGlzLmN1cnNvcj1NYXRoLm1heChzLmluZGV4T2YodC5pbml0aWFsVmFsdWUpLDApLHRoaXMub24oXCJrZXlcIiwoaSxuKT0+e2lmKCFpKXJldHVybjtjb25zdCBvPWUmJm4uc2hpZnQ/aS50b1VwcGVyQ2FzZSgpOmk7aWYoIXMuaW5jbHVkZXMobykpcmV0dXJuO2NvbnN0IGE9dGhpcy5vcHRpb25zLmZpbmQoKHt2YWx1ZTpbaF19KT0+ZT9oPT09bzpoPy50b0xvd2VyQ2FzZSgpPT09aSk7YSYmKHRoaXMudmFsdWU9YS52YWx1ZSx0aGlzLnN0YXRlPVwic3VibWl0XCIsdGhpcy5lbWl0KFwic3VibWl0XCIpKX0pfX1jbGFzcyBhdCBleHRlbmRzIHB7Z2V0IHVzZXJJbnB1dFdpdGhDdXJzb3IoKXtpZih0aGlzLnN0YXRlPT09XCJzdWJtaXRcIilyZXR1cm4gdGhpcy51c2VySW5wdXQ7Y29uc3QgdD10aGlzLnVzZXJJbnB1dDtpZih0aGlzLmN1cnNvcj49dC5sZW5ndGgpcmV0dXJuYCR7dGhpcy51c2VySW5wdXR9XFx1MjU4OGA7Y29uc3QgZT10LnNsaWNlKDAsdGhpcy5jdXJzb3IpLFtzLC4uLmldPXQuc2xpY2UodGhpcy5jdXJzb3IpO3JldHVybmAke2V9JHt5KFwiaW52ZXJzZVwiLHMpfSR7aS5qb2luKFwiXCIpfWB9Z2V0IGN1cnNvcigpe3JldHVybiB0aGlzLl9jdXJzb3J9Y29uc3RydWN0b3IodCl7c3VwZXIoey4uLnQsaW5pdGlhbFVzZXJJbnB1dDp0LmluaXRpYWxVc2VySW5wdXQ/P3QuaW5pdGlhbFZhbHVlfSksdGhpcy5vbihcInVzZXJJbnB1dFwiLGU9Pnt0aGlzLl9zZXRWYWx1ZShlKX0pLHRoaXMub24oXCJmaW5hbGl6ZVwiLCgpPT57dGhpcy52YWx1ZXx8KHRoaXMudmFsdWU9dC5kZWZhdWx0VmFsdWUpLHRoaXMudmFsdWU9PT12b2lkIDAmJih0aGlzLnZhbHVlPVwiXCIpfSl9fWV4cG9ydHtIIGFzIEF1dG9jb21wbGV0ZVByb21wdCxRIGFzIENvbmZpcm1Qcm9tcHQsZXQgYXMgRGF0ZVByb21wdCxzdCBhcyBHcm91cE11bHRpU2VsZWN0UHJvbXB0LGl0IGFzIE11bHRpU2VsZWN0UHJvbXB0LHJ0IGFzIFBhc3N3b3JkUHJvbXB0LHAgYXMgUHJvbXB0LG90IGFzIFNlbGVjdEtleVByb21wdCxudCBhcyBTZWxlY3RQcm9tcHQsYXQgYXMgVGV4dFByb21wdCx6IGFzIGJsb2NrLE8gYXMgZ2V0Q29sdW1ucyxBIGFzIGdldFJvd3MscSBhcyBpc0NhbmNlbCx1IGFzIHNldHRpbmdzLEsgYXMgdXBkYXRlU2V0dGluZ3MsUiBhcyB3cmFwVGV4dFdpdGhQcmVmaXh9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXgubWpzLm1hcFxuIiwKICAgICIvKiBNQUlOICovXG4vL1VSTDogaHR0cHM6Ly9naXRodWIuY29tL3NpbmRyZXNvcmh1cy9nZXQtZWFzdC1hc2lhbi13aWR0aC9ibG9iL21haW4vbG9va3VwLmpzXG4vL0xJQ0VOU0U6IGh0dHBzOi8vZ2l0aHViLmNvbS9zaW5kcmVzb3JodXMvZ2V0LWVhc3QtYXNpYW4td2lkdGgvYmxvYi9tYWluL2xpY2Vuc2Vcbi8vVE9ETzogUmVwbGFjZSB0aGVzZSB3aXRoIHNvbWUgdW5pY29kZSBwcm9wZXJ0eSBjbGFzc2VzLCBpZiB0aGUgb25lcyB3ZSBuZWVkIGV4aXN0XG5jb25zdCBpc0FtYmlndW91cyA9ICh4KSA9PiB7XG4gICAgcmV0dXJuIHggPT09IDB4QTEgfHwgeCA9PT0gMHhBNCB8fCB4ID09PSAweEE3IHx8IHggPT09IDB4QTggfHwgeCA9PT0gMHhBQSB8fCB4ID09PSAweEFEIHx8IHggPT09IDB4QUUgfHwgeCA+PSAweEIwICYmIHggPD0gMHhCNCB8fCB4ID49IDB4QjYgJiYgeCA8PSAweEJBIHx8IHggPj0gMHhCQyAmJiB4IDw9IDB4QkYgfHwgeCA9PT0gMHhDNiB8fCB4ID09PSAweEQwIHx8IHggPT09IDB4RDcgfHwgeCA9PT0gMHhEOCB8fCB4ID49IDB4REUgJiYgeCA8PSAweEUxIHx8IHggPT09IDB4RTYgfHwgeCA+PSAweEU4ICYmIHggPD0gMHhFQSB8fCB4ID09PSAweEVDIHx8IHggPT09IDB4RUQgfHwgeCA9PT0gMHhGMCB8fCB4ID09PSAweEYyIHx8IHggPT09IDB4RjMgfHwgeCA+PSAweEY3ICYmIHggPD0gMHhGQSB8fCB4ID09PSAweEZDIHx8IHggPT09IDB4RkUgfHwgeCA9PT0gMHgxMDEgfHwgeCA9PT0gMHgxMTEgfHwgeCA9PT0gMHgxMTMgfHwgeCA9PT0gMHgxMUIgfHwgeCA9PT0gMHgxMjYgfHwgeCA9PT0gMHgxMjcgfHwgeCA9PT0gMHgxMkIgfHwgeCA+PSAweDEzMSAmJiB4IDw9IDB4MTMzIHx8IHggPT09IDB4MTM4IHx8IHggPj0gMHgxM0YgJiYgeCA8PSAweDE0MiB8fCB4ID09PSAweDE0NCB8fCB4ID49IDB4MTQ4ICYmIHggPD0gMHgxNEIgfHwgeCA9PT0gMHgxNEQgfHwgeCA9PT0gMHgxNTIgfHwgeCA9PT0gMHgxNTMgfHwgeCA9PT0gMHgxNjYgfHwgeCA9PT0gMHgxNjcgfHwgeCA9PT0gMHgxNkIgfHwgeCA9PT0gMHgxQ0UgfHwgeCA9PT0gMHgxRDAgfHwgeCA9PT0gMHgxRDIgfHwgeCA9PT0gMHgxRDQgfHwgeCA9PT0gMHgxRDYgfHwgeCA9PT0gMHgxRDggfHwgeCA9PT0gMHgxREEgfHwgeCA9PT0gMHgxREMgfHwgeCA9PT0gMHgyNTEgfHwgeCA9PT0gMHgyNjEgfHwgeCA9PT0gMHgyQzQgfHwgeCA9PT0gMHgyQzcgfHwgeCA+PSAweDJDOSAmJiB4IDw9IDB4MkNCIHx8IHggPT09IDB4MkNEIHx8IHggPT09IDB4MkQwIHx8IHggPj0gMHgyRDggJiYgeCA8PSAweDJEQiB8fCB4ID09PSAweDJERCB8fCB4ID09PSAweDJERiB8fCB4ID49IDB4MzAwICYmIHggPD0gMHgzNkYgfHwgeCA+PSAweDM5MSAmJiB4IDw9IDB4M0ExIHx8IHggPj0gMHgzQTMgJiYgeCA8PSAweDNBOSB8fCB4ID49IDB4M0IxICYmIHggPD0gMHgzQzEgfHwgeCA+PSAweDNDMyAmJiB4IDw9IDB4M0M5IHx8IHggPT09IDB4NDAxIHx8IHggPj0gMHg0MTAgJiYgeCA8PSAweDQ0RiB8fCB4ID09PSAweDQ1MSB8fCB4ID09PSAweDIwMTAgfHwgeCA+PSAweDIwMTMgJiYgeCA8PSAweDIwMTYgfHwgeCA9PT0gMHgyMDE4IHx8IHggPT09IDB4MjAxOSB8fCB4ID09PSAweDIwMUMgfHwgeCA9PT0gMHgyMDFEIHx8IHggPj0gMHgyMDIwICYmIHggPD0gMHgyMDIyIHx8IHggPj0gMHgyMDI0ICYmIHggPD0gMHgyMDI3IHx8IHggPT09IDB4MjAzMCB8fCB4ID09PSAweDIwMzIgfHwgeCA9PT0gMHgyMDMzIHx8IHggPT09IDB4MjAzNSB8fCB4ID09PSAweDIwM0IgfHwgeCA9PT0gMHgyMDNFIHx8IHggPT09IDB4MjA3NCB8fCB4ID09PSAweDIwN0YgfHwgeCA+PSAweDIwODEgJiYgeCA8PSAweDIwODQgfHwgeCA9PT0gMHgyMEFDIHx8IHggPT09IDB4MjEwMyB8fCB4ID09PSAweDIxMDUgfHwgeCA9PT0gMHgyMTA5IHx8IHggPT09IDB4MjExMyB8fCB4ID09PSAweDIxMTYgfHwgeCA9PT0gMHgyMTIxIHx8IHggPT09IDB4MjEyMiB8fCB4ID09PSAweDIxMjYgfHwgeCA9PT0gMHgyMTJCIHx8IHggPT09IDB4MjE1MyB8fCB4ID09PSAweDIxNTQgfHwgeCA+PSAweDIxNUIgJiYgeCA8PSAweDIxNUUgfHwgeCA+PSAweDIxNjAgJiYgeCA8PSAweDIxNkIgfHwgeCA+PSAweDIxNzAgJiYgeCA8PSAweDIxNzkgfHwgeCA9PT0gMHgyMTg5IHx8IHggPj0gMHgyMTkwICYmIHggPD0gMHgyMTk5IHx8IHggPT09IDB4MjFCOCB8fCB4ID09PSAweDIxQjkgfHwgeCA9PT0gMHgyMUQyIHx8IHggPT09IDB4MjFENCB8fCB4ID09PSAweDIxRTcgfHwgeCA9PT0gMHgyMjAwIHx8IHggPT09IDB4MjIwMiB8fCB4ID09PSAweDIyMDMgfHwgeCA9PT0gMHgyMjA3IHx8IHggPT09IDB4MjIwOCB8fCB4ID09PSAweDIyMEIgfHwgeCA9PT0gMHgyMjBGIHx8IHggPT09IDB4MjIxMSB8fCB4ID09PSAweDIyMTUgfHwgeCA9PT0gMHgyMjFBIHx8IHggPj0gMHgyMjFEICYmIHggPD0gMHgyMjIwIHx8IHggPT09IDB4MjIyMyB8fCB4ID09PSAweDIyMjUgfHwgeCA+PSAweDIyMjcgJiYgeCA8PSAweDIyMkMgfHwgeCA9PT0gMHgyMjJFIHx8IHggPj0gMHgyMjM0ICYmIHggPD0gMHgyMjM3IHx8IHggPT09IDB4MjIzQyB8fCB4ID09PSAweDIyM0QgfHwgeCA9PT0gMHgyMjQ4IHx8IHggPT09IDB4MjI0QyB8fCB4ID09PSAweDIyNTIgfHwgeCA9PT0gMHgyMjYwIHx8IHggPT09IDB4MjI2MSB8fCB4ID49IDB4MjI2NCAmJiB4IDw9IDB4MjI2NyB8fCB4ID09PSAweDIyNkEgfHwgeCA9PT0gMHgyMjZCIHx8IHggPT09IDB4MjI2RSB8fCB4ID09PSAweDIyNkYgfHwgeCA9PT0gMHgyMjgyIHx8IHggPT09IDB4MjI4MyB8fCB4ID09PSAweDIyODYgfHwgeCA9PT0gMHgyMjg3IHx8IHggPT09IDB4MjI5NSB8fCB4ID09PSAweDIyOTkgfHwgeCA9PT0gMHgyMkE1IHx8IHggPT09IDB4MjJCRiB8fCB4ID09PSAweDIzMTIgfHwgeCA+PSAweDI0NjAgJiYgeCA8PSAweDI0RTkgfHwgeCA+PSAweDI0RUIgJiYgeCA8PSAweDI1NEIgfHwgeCA+PSAweDI1NTAgJiYgeCA8PSAweDI1NzMgfHwgeCA+PSAweDI1ODAgJiYgeCA8PSAweDI1OEYgfHwgeCA+PSAweDI1OTIgJiYgeCA8PSAweDI1OTUgfHwgeCA9PT0gMHgyNUEwIHx8IHggPT09IDB4MjVBMSB8fCB4ID49IDB4MjVBMyAmJiB4IDw9IDB4MjVBOSB8fCB4ID09PSAweDI1QjIgfHwgeCA9PT0gMHgyNUIzIHx8IHggPT09IDB4MjVCNiB8fCB4ID09PSAweDI1QjcgfHwgeCA9PT0gMHgyNUJDIHx8IHggPT09IDB4MjVCRCB8fCB4ID09PSAweDI1QzAgfHwgeCA9PT0gMHgyNUMxIHx8IHggPj0gMHgyNUM2ICYmIHggPD0gMHgyNUM4IHx8IHggPT09IDB4MjVDQiB8fCB4ID49IDB4MjVDRSAmJiB4IDw9IDB4MjVEMSB8fCB4ID49IDB4MjVFMiAmJiB4IDw9IDB4MjVFNSB8fCB4ID09PSAweDI1RUYgfHwgeCA9PT0gMHgyNjA1IHx8IHggPT09IDB4MjYwNiB8fCB4ID09PSAweDI2MDkgfHwgeCA9PT0gMHgyNjBFIHx8IHggPT09IDB4MjYwRiB8fCB4ID09PSAweDI2MUMgfHwgeCA9PT0gMHgyNjFFIHx8IHggPT09IDB4MjY0MCB8fCB4ID09PSAweDI2NDIgfHwgeCA9PT0gMHgyNjYwIHx8IHggPT09IDB4MjY2MSB8fCB4ID49IDB4MjY2MyAmJiB4IDw9IDB4MjY2NSB8fCB4ID49IDB4MjY2NyAmJiB4IDw9IDB4MjY2QSB8fCB4ID09PSAweDI2NkMgfHwgeCA9PT0gMHgyNjZEIHx8IHggPT09IDB4MjY2RiB8fCB4ID09PSAweDI2OUUgfHwgeCA9PT0gMHgyNjlGIHx8IHggPT09IDB4MjZCRiB8fCB4ID49IDB4MjZDNiAmJiB4IDw9IDB4MjZDRCB8fCB4ID49IDB4MjZDRiAmJiB4IDw9IDB4MjZEMyB8fCB4ID49IDB4MjZENSAmJiB4IDw9IDB4MjZFMSB8fCB4ID09PSAweDI2RTMgfHwgeCA9PT0gMHgyNkU4IHx8IHggPT09IDB4MjZFOSB8fCB4ID49IDB4MjZFQiAmJiB4IDw9IDB4MjZGMSB8fCB4ID09PSAweDI2RjQgfHwgeCA+PSAweDI2RjYgJiYgeCA8PSAweDI2RjkgfHwgeCA9PT0gMHgyNkZCIHx8IHggPT09IDB4MjZGQyB8fCB4ID09PSAweDI2RkUgfHwgeCA9PT0gMHgyNkZGIHx8IHggPT09IDB4MjczRCB8fCB4ID49IDB4Mjc3NiAmJiB4IDw9IDB4Mjc3RiB8fCB4ID49IDB4MkI1NiAmJiB4IDw9IDB4MkI1OSB8fCB4ID49IDB4MzI0OCAmJiB4IDw9IDB4MzI0RiB8fCB4ID49IDB4RTAwMCAmJiB4IDw9IDB4RjhGRiB8fCB4ID49IDB4RkUwMCAmJiB4IDw9IDB4RkUwRiB8fCB4ID09PSAweEZGRkQgfHwgeCA+PSAweDFGMTAwICYmIHggPD0gMHgxRjEwQSB8fCB4ID49IDB4MUYxMTAgJiYgeCA8PSAweDFGMTJEIHx8IHggPj0gMHgxRjEzMCAmJiB4IDw9IDB4MUYxNjkgfHwgeCA+PSAweDFGMTcwICYmIHggPD0gMHgxRjE4RCB8fCB4ID09PSAweDFGMThGIHx8IHggPT09IDB4MUYxOTAgfHwgeCA+PSAweDFGMTlCICYmIHggPD0gMHgxRjFBQyB8fCB4ID49IDB4RTAxMDAgJiYgeCA8PSAweEUwMUVGIHx8IHggPj0gMHhGMDAwMCAmJiB4IDw9IDB4RkZGRkQgfHwgeCA+PSAweDEwMDAwMCAmJiB4IDw9IDB4MTBGRkZEO1xufTtcbmNvbnN0IGlzRnVsbFdpZHRoID0gKHgpID0+IHtcbiAgICByZXR1cm4geCA9PT0gMHgzMDAwIHx8IHggPj0gMHhGRjAxICYmIHggPD0gMHhGRjYwIHx8IHggPj0gMHhGRkUwICYmIHggPD0gMHhGRkU2O1xufTtcbmNvbnN0IGlzV2lkZSA9ICh4KSA9PiB7XG4gICAgcmV0dXJuIHggPj0gMHgxMTAwICYmIHggPD0gMHgxMTVGIHx8IHggPT09IDB4MjMxQSB8fCB4ID09PSAweDIzMUIgfHwgeCA9PT0gMHgyMzI5IHx8IHggPT09IDB4MjMyQSB8fCB4ID49IDB4MjNFOSAmJiB4IDw9IDB4MjNFQyB8fCB4ID09PSAweDIzRjAgfHwgeCA9PT0gMHgyM0YzIHx8IHggPT09IDB4MjVGRCB8fCB4ID09PSAweDI1RkUgfHwgeCA9PT0gMHgyNjE0IHx8IHggPT09IDB4MjYxNSB8fCB4ID49IDB4MjY0OCAmJiB4IDw9IDB4MjY1MyB8fCB4ID09PSAweDI2N0YgfHwgeCA9PT0gMHgyNjkzIHx8IHggPT09IDB4MjZBMSB8fCB4ID09PSAweDI2QUEgfHwgeCA9PT0gMHgyNkFCIHx8IHggPT09IDB4MjZCRCB8fCB4ID09PSAweDI2QkUgfHwgeCA9PT0gMHgyNkM0IHx8IHggPT09IDB4MjZDNSB8fCB4ID09PSAweDI2Q0UgfHwgeCA9PT0gMHgyNkQ0IHx8IHggPT09IDB4MjZFQSB8fCB4ID09PSAweDI2RjIgfHwgeCA9PT0gMHgyNkYzIHx8IHggPT09IDB4MjZGNSB8fCB4ID09PSAweDI2RkEgfHwgeCA9PT0gMHgyNkZEIHx8IHggPT09IDB4MjcwNSB8fCB4ID09PSAweDI3MEEgfHwgeCA9PT0gMHgyNzBCIHx8IHggPT09IDB4MjcyOCB8fCB4ID09PSAweDI3NEMgfHwgeCA9PT0gMHgyNzRFIHx8IHggPj0gMHgyNzUzICYmIHggPD0gMHgyNzU1IHx8IHggPT09IDB4Mjc1NyB8fCB4ID49IDB4Mjc5NSAmJiB4IDw9IDB4Mjc5NyB8fCB4ID09PSAweDI3QjAgfHwgeCA9PT0gMHgyN0JGIHx8IHggPT09IDB4MkIxQiB8fCB4ID09PSAweDJCMUMgfHwgeCA9PT0gMHgyQjUwIHx8IHggPT09IDB4MkI1NSB8fCB4ID49IDB4MkU4MCAmJiB4IDw9IDB4MkU5OSB8fCB4ID49IDB4MkU5QiAmJiB4IDw9IDB4MkVGMyB8fCB4ID49IDB4MkYwMCAmJiB4IDw9IDB4MkZENSB8fCB4ID49IDB4MkZGMCAmJiB4IDw9IDB4MkZGRiB8fCB4ID49IDB4MzAwMSAmJiB4IDw9IDB4MzAzRSB8fCB4ID49IDB4MzA0MSAmJiB4IDw9IDB4MzA5NiB8fCB4ID49IDB4MzA5OSAmJiB4IDw9IDB4MzBGRiB8fCB4ID49IDB4MzEwNSAmJiB4IDw9IDB4MzEyRiB8fCB4ID49IDB4MzEzMSAmJiB4IDw9IDB4MzE4RSB8fCB4ID49IDB4MzE5MCAmJiB4IDw9IDB4MzFFMyB8fCB4ID49IDB4MzFFRiAmJiB4IDw9IDB4MzIxRSB8fCB4ID49IDB4MzIyMCAmJiB4IDw9IDB4MzI0NyB8fCB4ID49IDB4MzI1MCAmJiB4IDw9IDB4NERCRiB8fCB4ID49IDB4NEUwMCAmJiB4IDw9IDB4QTQ4QyB8fCB4ID49IDB4QTQ5MCAmJiB4IDw9IDB4QTRDNiB8fCB4ID49IDB4QTk2MCAmJiB4IDw9IDB4QTk3QyB8fCB4ID49IDB4QUMwMCAmJiB4IDw9IDB4RDdBMyB8fCB4ID49IDB4RjkwMCAmJiB4IDw9IDB4RkFGRiB8fCB4ID49IDB4RkUxMCAmJiB4IDw9IDB4RkUxOSB8fCB4ID49IDB4RkUzMCAmJiB4IDw9IDB4RkU1MiB8fCB4ID49IDB4RkU1NCAmJiB4IDw9IDB4RkU2NiB8fCB4ID49IDB4RkU2OCAmJiB4IDw9IDB4RkU2QiB8fCB4ID49IDB4MTZGRTAgJiYgeCA8PSAweDE2RkU0IHx8IHggPT09IDB4MTZGRjAgfHwgeCA9PT0gMHgxNkZGMSB8fCB4ID49IDB4MTcwMDAgJiYgeCA8PSAweDE4N0Y3IHx8IHggPj0gMHgxODgwMCAmJiB4IDw9IDB4MThDRDUgfHwgeCA+PSAweDE4RDAwICYmIHggPD0gMHgxOEQwOCB8fCB4ID49IDB4MUFGRjAgJiYgeCA8PSAweDFBRkYzIHx8IHggPj0gMHgxQUZGNSAmJiB4IDw9IDB4MUFGRkIgfHwgeCA9PT0gMHgxQUZGRCB8fCB4ID09PSAweDFBRkZFIHx8IHggPj0gMHgxQjAwMCAmJiB4IDw9IDB4MUIxMjIgfHwgeCA9PT0gMHgxQjEzMiB8fCB4ID49IDB4MUIxNTAgJiYgeCA8PSAweDFCMTUyIHx8IHggPT09IDB4MUIxNTUgfHwgeCA+PSAweDFCMTY0ICYmIHggPD0gMHgxQjE2NyB8fCB4ID49IDB4MUIxNzAgJiYgeCA8PSAweDFCMkZCIHx8IHggPT09IDB4MUYwMDQgfHwgeCA9PT0gMHgxRjBDRiB8fCB4ID09PSAweDFGMThFIHx8IHggPj0gMHgxRjE5MSAmJiB4IDw9IDB4MUYxOUEgfHwgeCA+PSAweDFGMjAwICYmIHggPD0gMHgxRjIwMiB8fCB4ID49IDB4MUYyMTAgJiYgeCA8PSAweDFGMjNCIHx8IHggPj0gMHgxRjI0MCAmJiB4IDw9IDB4MUYyNDggfHwgeCA9PT0gMHgxRjI1MCB8fCB4ID09PSAweDFGMjUxIHx8IHggPj0gMHgxRjI2MCAmJiB4IDw9IDB4MUYyNjUgfHwgeCA+PSAweDFGMzAwICYmIHggPD0gMHgxRjMyMCB8fCB4ID49IDB4MUYzMkQgJiYgeCA8PSAweDFGMzM1IHx8IHggPj0gMHgxRjMzNyAmJiB4IDw9IDB4MUYzN0MgfHwgeCA+PSAweDFGMzdFICYmIHggPD0gMHgxRjM5MyB8fCB4ID49IDB4MUYzQTAgJiYgeCA8PSAweDFGM0NBIHx8IHggPj0gMHgxRjNDRiAmJiB4IDw9IDB4MUYzRDMgfHwgeCA+PSAweDFGM0UwICYmIHggPD0gMHgxRjNGMCB8fCB4ID09PSAweDFGM0Y0IHx8IHggPj0gMHgxRjNGOCAmJiB4IDw9IDB4MUY0M0UgfHwgeCA9PT0gMHgxRjQ0MCB8fCB4ID49IDB4MUY0NDIgJiYgeCA8PSAweDFGNEZDIHx8IHggPj0gMHgxRjRGRiAmJiB4IDw9IDB4MUY1M0QgfHwgeCA+PSAweDFGNTRCICYmIHggPD0gMHgxRjU0RSB8fCB4ID49IDB4MUY1NTAgJiYgeCA8PSAweDFGNTY3IHx8IHggPT09IDB4MUY1N0EgfHwgeCA9PT0gMHgxRjU5NSB8fCB4ID09PSAweDFGNTk2IHx8IHggPT09IDB4MUY1QTQgfHwgeCA+PSAweDFGNUZCICYmIHggPD0gMHgxRjY0RiB8fCB4ID49IDB4MUY2ODAgJiYgeCA8PSAweDFGNkM1IHx8IHggPT09IDB4MUY2Q0MgfHwgeCA+PSAweDFGNkQwICYmIHggPD0gMHgxRjZEMiB8fCB4ID49IDB4MUY2RDUgJiYgeCA8PSAweDFGNkQ3IHx8IHggPj0gMHgxRjZEQyAmJiB4IDw9IDB4MUY2REYgfHwgeCA9PT0gMHgxRjZFQiB8fCB4ID09PSAweDFGNkVDIHx8IHggPj0gMHgxRjZGNCAmJiB4IDw9IDB4MUY2RkMgfHwgeCA+PSAweDFGN0UwICYmIHggPD0gMHgxRjdFQiB8fCB4ID09PSAweDFGN0YwIHx8IHggPj0gMHgxRjkwQyAmJiB4IDw9IDB4MUY5M0EgfHwgeCA+PSAweDFGOTNDICYmIHggPD0gMHgxRjk0NSB8fCB4ID49IDB4MUY5NDcgJiYgeCA8PSAweDFGOUZGIHx8IHggPj0gMHgxRkE3MCAmJiB4IDw9IDB4MUZBN0MgfHwgeCA+PSAweDFGQTgwICYmIHggPD0gMHgxRkE4OCB8fCB4ID49IDB4MUZBOTAgJiYgeCA8PSAweDFGQUJEIHx8IHggPj0gMHgxRkFCRiAmJiB4IDw9IDB4MUZBQzUgfHwgeCA+PSAweDFGQUNFICYmIHggPD0gMHgxRkFEQiB8fCB4ID49IDB4MUZBRTAgJiYgeCA8PSAweDFGQUU4IHx8IHggPj0gMHgxRkFGMCAmJiB4IDw9IDB4MUZBRjggfHwgeCA+PSAweDIwMDAwICYmIHggPD0gMHgyRkZGRCB8fCB4ID49IDB4MzAwMDAgJiYgeCA8PSAweDNGRkZEO1xufTtcbi8qIEVYUE9SVCAqL1xuZXhwb3J0IHsgaXNBbWJpZ3VvdXMsIGlzRnVsbFdpZHRoLCBpc1dpZGUgfTtcbiIsCiAgICAiLyogSU1QT1JUICovXG5pbXBvcnQgeyBpc0FtYmlndW91cywgaXNGdWxsV2lkdGgsIGlzV2lkZSB9IGZyb20gJy4vdXRpbHMuanMnO1xuLyogSEVMUEVSUyAqL1xuY29uc3QgQU5TSV9SRSA9IC9bXFx1MDAxYlxcdTAwOWJdW1soKSM7P10qKD86WzAtOV17MSw0fSg/OjtbMC05XXswLDR9KSopP1swLTlBLU9SWmNmLW5xcnk9PjxdL3k7XG5jb25zdCBDT05UUk9MX1JFID0gL1tcXHgwMC1cXHgwOFxceDBBLVxceDFGXFx4N0YtXFx4OUZdezEsMTAwMH0veTtcbmNvbnN0IFRBQl9SRSA9IC9cXHR7MSwxMDAwfS95O1xuY29uc3QgRU1PSklfUkUgPSAvW1xcdXsxRjFFNn0tXFx1ezFGMUZGfV17Mn18XFx1ezFGM0Y0fVtcXHV7RTAwNjF9LVxcdXtFMDA3QX1dezJ9W1xcdXtFMDAzMH0tXFx1e0UwMDM5fVxcdXtFMDA2MX0tXFx1e0UwMDdBfV17MSwzfVxcdXtFMDA3Rn18KD86XFxwe0Vtb2ppfVxcdUZFMEZcXHUyMEUzP3xcXHB7RW1vamlfTW9kaWZpZXJfQmFzZX1cXHB7RW1vamlfTW9kaWZpZXJ9P3xcXHB7RW1vamlfUHJlc2VudGF0aW9ufSkoPzpcXHUyMDBEKD86XFxwe0Vtb2ppX01vZGlmaWVyX0Jhc2V9XFxwe0Vtb2ppX01vZGlmaWVyfT98XFxwe0Vtb2ppX1ByZXNlbnRhdGlvbn18XFxwe0Vtb2ppfVxcdUZFMEZcXHUyMEUzPykpKi95dTtcbmNvbnN0IExBVElOX1JFID0gLyg/OltcXHgyMC1cXHg3RVxceEEwLVxceEZGXSg/IVxcdUZFMEYpKXsxLDEwMDB9L3k7XG5jb25zdCBNT0RJRklFUl9SRSA9IC9cXHB7TX0rL2d1O1xuY29uc3QgTk9fVFJVTkNBVElPTiA9IHsgbGltaXQ6IEluZmluaXR5LCBlbGxpcHNpczogJycgfTtcbi8qIE1BSU4gKi9cbi8vVE9ETzogT3B0aW1pemUgbWF0Y2hpbmcgbm9uLWxhdGluIGxldHRlcnNcbmNvbnN0IGdldFN0cmluZ1RydW5jYXRlZFdpZHRoID0gKGlucHV0LCB0cnVuY2F0aW9uT3B0aW9ucyA9IHt9LCB3aWR0aE9wdGlvbnMgPSB7fSkgPT4ge1xuICAgIC8qIENPTlNUQU5UUyAqL1xuICAgIGNvbnN0IExJTUlUID0gdHJ1bmNhdGlvbk9wdGlvbnMubGltaXQgPz8gSW5maW5pdHk7XG4gICAgY29uc3QgRUxMSVBTSVMgPSB0cnVuY2F0aW9uT3B0aW9ucy5lbGxpcHNpcyA/PyAnJztcbiAgICBjb25zdCBFTExJUFNJU19XSURUSCA9IHRydW5jYXRpb25PcHRpb25zPy5lbGxpcHNpc1dpZHRoID8/IChFTExJUFNJUyA/IGdldFN0cmluZ1RydW5jYXRlZFdpZHRoKEVMTElQU0lTLCBOT19UUlVOQ0FUSU9OLCB3aWR0aE9wdGlvbnMpLndpZHRoIDogMCk7XG4gICAgY29uc3QgQU5TSV9XSURUSCA9IHdpZHRoT3B0aW9ucy5hbnNpV2lkdGggPz8gMDtcbiAgICBjb25zdCBDT05UUk9MX1dJRFRIID0gd2lkdGhPcHRpb25zLmNvbnRyb2xXaWR0aCA/PyAwO1xuICAgIGNvbnN0IFRBQl9XSURUSCA9IHdpZHRoT3B0aW9ucy50YWJXaWR0aCA/PyA4O1xuICAgIGNvbnN0IEFNQklHVU9VU19XSURUSCA9IHdpZHRoT3B0aW9ucy5hbWJpZ3VvdXNXaWR0aCA/PyAxO1xuICAgIGNvbnN0IEVNT0pJX1dJRFRIID0gd2lkdGhPcHRpb25zLmVtb2ppV2lkdGggPz8gMjtcbiAgICBjb25zdCBGVUxMX1dJRFRIX1dJRFRIID0gd2lkdGhPcHRpb25zLmZ1bGxXaWR0aFdpZHRoID8/IDI7XG4gICAgY29uc3QgUkVHVUxBUl9XSURUSCA9IHdpZHRoT3B0aW9ucy5yZWd1bGFyV2lkdGggPz8gMTtcbiAgICBjb25zdCBXSURFX1dJRFRIID0gd2lkdGhPcHRpb25zLndpZGVXaWR0aCA/PyAyO1xuICAgIC8qIFNUQVRFICovXG4gICAgbGV0IGluZGV4UHJldiA9IDA7XG4gICAgbGV0IGluZGV4ID0gMDtcbiAgICBsZXQgbGVuZ3RoID0gaW5wdXQubGVuZ3RoO1xuICAgIGxldCBsZW5ndGhFeHRyYSA9IDA7XG4gICAgbGV0IHRydW5jYXRpb25FbmFibGVkID0gZmFsc2U7XG4gICAgbGV0IHRydW5jYXRpb25JbmRleCA9IGxlbmd0aDtcbiAgICBsZXQgdHJ1bmNhdGlvbkxpbWl0ID0gTWF0aC5tYXgoMCwgTElNSVQgLSBFTExJUFNJU19XSURUSCk7XG4gICAgbGV0IHVubWF0Y2hlZFN0YXJ0ID0gMDtcbiAgICBsZXQgdW5tYXRjaGVkRW5kID0gMDtcbiAgICBsZXQgd2lkdGggPSAwO1xuICAgIGxldCB3aWR0aEV4dHJhID0gMDtcbiAgICAvKiBQQVJTRSBMT09QICovXG4gICAgb3V0ZXI6IHdoaWxlICh0cnVlKSB7XG4gICAgICAgIC8qIFVOTUFUQ0hFRCAqL1xuICAgICAgICBpZiAoKHVubWF0Y2hlZEVuZCA+IHVubWF0Y2hlZFN0YXJ0KSB8fCAoaW5kZXggPj0gbGVuZ3RoICYmIGluZGV4ID4gaW5kZXhQcmV2KSkge1xuICAgICAgICAgICAgY29uc3QgdW5tYXRjaGVkID0gaW5wdXQuc2xpY2UodW5tYXRjaGVkU3RhcnQsIHVubWF0Y2hlZEVuZCkgfHwgaW5wdXQuc2xpY2UoaW5kZXhQcmV2LCBpbmRleCk7XG4gICAgICAgICAgICBsZW5ndGhFeHRyYSA9IDA7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGNoYXIgb2YgdW5tYXRjaGVkLnJlcGxhY2VBbGwoTU9ESUZJRVJfUkUsICcnKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvZGVQb2ludCA9IGNoYXIuY29kZVBvaW50QXQoMCkgfHwgMDtcbiAgICAgICAgICAgICAgICBpZiAoaXNGdWxsV2lkdGgoY29kZVBvaW50KSkge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aEV4dHJhID0gRlVMTF9XSURUSF9XSURUSDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaXNXaWRlKGNvZGVQb2ludCkpIHtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGhFeHRyYSA9IFdJREVfV0lEVEg7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKEFNQklHVU9VU19XSURUSCAhPT0gUkVHVUxBUl9XSURUSCAmJiBpc0FtYmlndW91cyhjb2RlUG9pbnQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoRXh0cmEgPSBBTUJJR1VPVVNfV0lEVEg7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aEV4dHJhID0gUkVHVUxBUl9XSURUSDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCh3aWR0aCArIHdpZHRoRXh0cmEpID4gdHJ1bmNhdGlvbkxpbWl0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRydW5jYXRpb25JbmRleCA9IE1hdGgubWluKHRydW5jYXRpb25JbmRleCwgTWF0aC5tYXgodW5tYXRjaGVkU3RhcnQsIGluZGV4UHJldikgKyBsZW5ndGhFeHRyYSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICgod2lkdGggKyB3aWR0aEV4dHJhKSA+IExJTUlUKSB7XG4gICAgICAgICAgICAgICAgICAgIHRydW5jYXRpb25FbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWsgb3V0ZXI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxlbmd0aEV4dHJhICs9IGNoYXIubGVuZ3RoO1xuICAgICAgICAgICAgICAgIHdpZHRoICs9IHdpZHRoRXh0cmE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB1bm1hdGNoZWRTdGFydCA9IHVubWF0Y2hlZEVuZCA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgLyogRVhJVElORyAqL1xuICAgICAgICBpZiAoaW5kZXggPj0gbGVuZ3RoKVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIC8qIExBVElOICovXG4gICAgICAgIExBVElOX1JFLmxhc3RJbmRleCA9IGluZGV4O1xuICAgICAgICBpZiAoTEFUSU5fUkUudGVzdChpbnB1dCkpIHtcbiAgICAgICAgICAgIGxlbmd0aEV4dHJhID0gTEFUSU5fUkUubGFzdEluZGV4IC0gaW5kZXg7XG4gICAgICAgICAgICB3aWR0aEV4dHJhID0gbGVuZ3RoRXh0cmEgKiBSRUdVTEFSX1dJRFRIO1xuICAgICAgICAgICAgaWYgKCh3aWR0aCArIHdpZHRoRXh0cmEpID4gdHJ1bmNhdGlvbkxpbWl0KSB7XG4gICAgICAgICAgICAgICAgdHJ1bmNhdGlvbkluZGV4ID0gTWF0aC5taW4odHJ1bmNhdGlvbkluZGV4LCBpbmRleCArIE1hdGguZmxvb3IoKHRydW5jYXRpb25MaW1pdCAtIHdpZHRoKSAvIFJFR1VMQVJfV0lEVEgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgod2lkdGggKyB3aWR0aEV4dHJhKSA+IExJTUlUKSB7XG4gICAgICAgICAgICAgICAgdHJ1bmNhdGlvbkVuYWJsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgd2lkdGggKz0gd2lkdGhFeHRyYTtcbiAgICAgICAgICAgIHVubWF0Y2hlZFN0YXJ0ID0gaW5kZXhQcmV2O1xuICAgICAgICAgICAgdW5tYXRjaGVkRW5kID0gaW5kZXg7XG4gICAgICAgICAgICBpbmRleCA9IGluZGV4UHJldiA9IExBVElOX1JFLmxhc3RJbmRleDtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIC8qIEFOU0kgKi9cbiAgICAgICAgQU5TSV9SRS5sYXN0SW5kZXggPSBpbmRleDtcbiAgICAgICAgaWYgKEFOU0lfUkUudGVzdChpbnB1dCkpIHtcbiAgICAgICAgICAgIGlmICgod2lkdGggKyBBTlNJX1dJRFRIKSA+IHRydW5jYXRpb25MaW1pdCkge1xuICAgICAgICAgICAgICAgIHRydW5jYXRpb25JbmRleCA9IE1hdGgubWluKHRydW5jYXRpb25JbmRleCwgaW5kZXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCh3aWR0aCArIEFOU0lfV0lEVEgpID4gTElNSVQpIHtcbiAgICAgICAgICAgICAgICB0cnVuY2F0aW9uRW5hYmxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB3aWR0aCArPSBBTlNJX1dJRFRIO1xuICAgICAgICAgICAgdW5tYXRjaGVkU3RhcnQgPSBpbmRleFByZXY7XG4gICAgICAgICAgICB1bm1hdGNoZWRFbmQgPSBpbmRleDtcbiAgICAgICAgICAgIGluZGV4ID0gaW5kZXhQcmV2ID0gQU5TSV9SRS5sYXN0SW5kZXg7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICAvKiBDT05UUk9MICovXG4gICAgICAgIENPTlRST0xfUkUubGFzdEluZGV4ID0gaW5kZXg7XG4gICAgICAgIGlmIChDT05UUk9MX1JFLnRlc3QoaW5wdXQpKSB7XG4gICAgICAgICAgICBsZW5ndGhFeHRyYSA9IENPTlRST0xfUkUubGFzdEluZGV4IC0gaW5kZXg7XG4gICAgICAgICAgICB3aWR0aEV4dHJhID0gbGVuZ3RoRXh0cmEgKiBDT05UUk9MX1dJRFRIO1xuICAgICAgICAgICAgaWYgKCh3aWR0aCArIHdpZHRoRXh0cmEpID4gdHJ1bmNhdGlvbkxpbWl0KSB7XG4gICAgICAgICAgICAgICAgdHJ1bmNhdGlvbkluZGV4ID0gTWF0aC5taW4odHJ1bmNhdGlvbkluZGV4LCBpbmRleCArIE1hdGguZmxvb3IoKHRydW5jYXRpb25MaW1pdCAtIHdpZHRoKSAvIENPTlRST0xfV0lEVEgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgod2lkdGggKyB3aWR0aEV4dHJhKSA+IExJTUlUKSB7XG4gICAgICAgICAgICAgICAgdHJ1bmNhdGlvbkVuYWJsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgd2lkdGggKz0gd2lkdGhFeHRyYTtcbiAgICAgICAgICAgIHVubWF0Y2hlZFN0YXJ0ID0gaW5kZXhQcmV2O1xuICAgICAgICAgICAgdW5tYXRjaGVkRW5kID0gaW5kZXg7XG4gICAgICAgICAgICBpbmRleCA9IGluZGV4UHJldiA9IENPTlRST0xfUkUubGFzdEluZGV4O1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgLyogVEFCICovXG4gICAgICAgIFRBQl9SRS5sYXN0SW5kZXggPSBpbmRleDtcbiAgICAgICAgaWYgKFRBQl9SRS50ZXN0KGlucHV0KSkge1xuICAgICAgICAgICAgbGVuZ3RoRXh0cmEgPSBUQUJfUkUubGFzdEluZGV4IC0gaW5kZXg7XG4gICAgICAgICAgICB3aWR0aEV4dHJhID0gbGVuZ3RoRXh0cmEgKiBUQUJfV0lEVEg7XG4gICAgICAgICAgICBpZiAoKHdpZHRoICsgd2lkdGhFeHRyYSkgPiB0cnVuY2F0aW9uTGltaXQpIHtcbiAgICAgICAgICAgICAgICB0cnVuY2F0aW9uSW5kZXggPSBNYXRoLm1pbih0cnVuY2F0aW9uSW5kZXgsIGluZGV4ICsgTWF0aC5mbG9vcigodHJ1bmNhdGlvbkxpbWl0IC0gd2lkdGgpIC8gVEFCX1dJRFRIKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoKHdpZHRoICsgd2lkdGhFeHRyYSkgPiBMSU1JVCkge1xuICAgICAgICAgICAgICAgIHRydW5jYXRpb25FbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHdpZHRoICs9IHdpZHRoRXh0cmE7XG4gICAgICAgICAgICB1bm1hdGNoZWRTdGFydCA9IGluZGV4UHJldjtcbiAgICAgICAgICAgIHVubWF0Y2hlZEVuZCA9IGluZGV4O1xuICAgICAgICAgICAgaW5kZXggPSBpbmRleFByZXYgPSBUQUJfUkUubGFzdEluZGV4O1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgLyogRU1PSkkgKi9cbiAgICAgICAgRU1PSklfUkUubGFzdEluZGV4ID0gaW5kZXg7XG4gICAgICAgIGlmIChFTU9KSV9SRS50ZXN0KGlucHV0KSkge1xuICAgICAgICAgICAgaWYgKCh3aWR0aCArIEVNT0pJX1dJRFRIKSA+IHRydW5jYXRpb25MaW1pdCkge1xuICAgICAgICAgICAgICAgIHRydW5jYXRpb25JbmRleCA9IE1hdGgubWluKHRydW5jYXRpb25JbmRleCwgaW5kZXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCh3aWR0aCArIEVNT0pJX1dJRFRIKSA+IExJTUlUKSB7XG4gICAgICAgICAgICAgICAgdHJ1bmNhdGlvbkVuYWJsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgd2lkdGggKz0gRU1PSklfV0lEVEg7XG4gICAgICAgICAgICB1bm1hdGNoZWRTdGFydCA9IGluZGV4UHJldjtcbiAgICAgICAgICAgIHVubWF0Y2hlZEVuZCA9IGluZGV4O1xuICAgICAgICAgICAgaW5kZXggPSBpbmRleFByZXYgPSBFTU9KSV9SRS5sYXN0SW5kZXg7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICAvKiBVTk1BVENIRUQgSU5ERVggKi9cbiAgICAgICAgaW5kZXggKz0gMTtcbiAgICB9XG4gICAgLyogUkVUVVJOICovXG4gICAgcmV0dXJuIHtcbiAgICAgICAgd2lkdGg6IHRydW5jYXRpb25FbmFibGVkID8gdHJ1bmNhdGlvbkxpbWl0IDogd2lkdGgsXG4gICAgICAgIGluZGV4OiB0cnVuY2F0aW9uRW5hYmxlZCA/IHRydW5jYXRpb25JbmRleCA6IGxlbmd0aCxcbiAgICAgICAgdHJ1bmNhdGVkOiB0cnVuY2F0aW9uRW5hYmxlZCxcbiAgICAgICAgZWxsaXBzZWQ6IHRydW5jYXRpb25FbmFibGVkICYmIExJTUlUID49IEVMTElQU0lTX1dJRFRIXG4gICAgfTtcbn07XG4vKiBFWFBPUlQgKi9cbmV4cG9ydCBkZWZhdWx0IGdldFN0cmluZ1RydW5jYXRlZFdpZHRoO1xuIiwKICAgICIvKiBJTVBPUlQgKi9cbmltcG9ydCBmYXN0U3RyaW5nVHJ1bmNhdGVkV2lkdGggZnJvbSAnZmFzdC1zdHJpbmctdHJ1bmNhdGVkLXdpZHRoJztcbi8qIEhFTFBFUlMgKi9cbmNvbnN0IE5PX1RSVU5DQVRJT04gPSB7XG4gICAgbGltaXQ6IEluZmluaXR5LFxuICAgIGVsbGlwc2lzOiAnJyxcbiAgICBlbGxpcHNpc1dpZHRoOiAwLFxufTtcbi8qIE1BSU4gKi9cbmNvbnN0IGZhc3RTdHJpbmdXaWR0aCA9IChpbnB1dCwgb3B0aW9ucyA9IHt9KSA9PiB7XG4gICAgcmV0dXJuIGZhc3RTdHJpbmdUcnVuY2F0ZWRXaWR0aChpbnB1dCwgTk9fVFJVTkNBVElPTiwgb3B0aW9ucykud2lkdGg7XG59O1xuLyogRVhQT1JUICovXG5leHBvcnQgZGVmYXVsdCBmYXN0U3RyaW5nV2lkdGg7XG4iLAogICAgImltcG9ydCBzdHJpbmdXaWR0aCBmcm9tICdmYXN0LXN0cmluZy13aWR0aCc7XG5jb25zdCBFU0MgPSAnXFx4MUInO1xuY29uc3QgQ1NJID0gJ1xceDlCJztcbmNvbnN0IEVORF9DT0RFID0gMzk7XG5jb25zdCBBTlNJX0VTQ0FQRV9CRUxMID0gJ1xcdTAwMDcnO1xuY29uc3QgQU5TSV9DU0kgPSAnWyc7XG5jb25zdCBBTlNJX09TQyA9ICddJztcbmNvbnN0IEFOU0lfU0dSX1RFUk1JTkFUT1IgPSAnbSc7XG5jb25zdCBBTlNJX0VTQ0FQRV9MSU5LID0gYCR7QU5TSV9PU0N9ODs7YDtcbmNvbnN0IEdST1VQX1JFR0VYID0gbmV3IFJlZ0V4cChgKD86XFxcXCR7QU5TSV9DU0l9KD88Y29kZT5cXFxcZCspbXxcXFxcJHtBTlNJX0VTQ0FQRV9MSU5LfSg/PHVyaT4uKikke0FOU0lfRVNDQVBFX0JFTEx9KWAsICd5Jyk7XG5jb25zdCBnZXRDbG9zaW5nQ29kZSA9IChvcGVuaW5nQ29kZSkgPT4ge1xuICAgIGlmIChvcGVuaW5nQ29kZSA+PSAzMCAmJiBvcGVuaW5nQ29kZSA8PSAzNylcbiAgICAgICAgcmV0dXJuIDM5O1xuICAgIGlmIChvcGVuaW5nQ29kZSA+PSA5MCAmJiBvcGVuaW5nQ29kZSA8PSA5NylcbiAgICAgICAgcmV0dXJuIDM5O1xuICAgIGlmIChvcGVuaW5nQ29kZSA+PSA0MCAmJiBvcGVuaW5nQ29kZSA8PSA0NylcbiAgICAgICAgcmV0dXJuIDQ5O1xuICAgIGlmIChvcGVuaW5nQ29kZSA+PSAxMDAgJiYgb3BlbmluZ0NvZGUgPD0gMTA3KVxuICAgICAgICByZXR1cm4gNDk7XG4gICAgaWYgKG9wZW5pbmdDb2RlID09PSAxIHx8IG9wZW5pbmdDb2RlID09PSAyKVxuICAgICAgICByZXR1cm4gMjI7XG4gICAgaWYgKG9wZW5pbmdDb2RlID09PSAzKVxuICAgICAgICByZXR1cm4gMjM7XG4gICAgaWYgKG9wZW5pbmdDb2RlID09PSA0KVxuICAgICAgICByZXR1cm4gMjQ7XG4gICAgaWYgKG9wZW5pbmdDb2RlID09PSA3KVxuICAgICAgICByZXR1cm4gMjc7XG4gICAgaWYgKG9wZW5pbmdDb2RlID09PSA4KVxuICAgICAgICByZXR1cm4gMjg7XG4gICAgaWYgKG9wZW5pbmdDb2RlID09PSA5KVxuICAgICAgICByZXR1cm4gMjk7XG4gICAgaWYgKG9wZW5pbmdDb2RlID09PSAwKVxuICAgICAgICByZXR1cm4gMDtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufTtcbmNvbnN0IHdyYXBBbnNpQ29kZSA9IChjb2RlKSA9PiBgJHtFU0N9JHtBTlNJX0NTSX0ke2NvZGV9JHtBTlNJX1NHUl9URVJNSU5BVE9SfWA7XG5jb25zdCB3cmFwQW5zaUh5cGVybGluayA9ICh1cmwpID0+IGAke0VTQ30ke0FOU0lfRVNDQVBFX0xJTkt9JHt1cmx9JHtBTlNJX0VTQ0FQRV9CRUxMfWA7XG5jb25zdCB3cmFwV29yZCA9IChyb3dzLCB3b3JkLCBjb2x1bW5zKSA9PiB7XG4gICAgY29uc3QgY2hhcmFjdGVycyA9IHdvcmRbU3ltYm9sLml0ZXJhdG9yXSgpO1xuICAgIGxldCBpc0luc2lkZUVzY2FwZSA9IGZhbHNlO1xuICAgIGxldCBpc0luc2lkZUxpbmtFc2NhcGUgPSBmYWxzZTtcbiAgICBsZXQgbGFzdFJvdyA9IHJvd3MuYXQoLTEpO1xuICAgIGxldCB2aXNpYmxlID0gbGFzdFJvdyA9PT0gdW5kZWZpbmVkID8gMCA6IHN0cmluZ1dpZHRoKGxhc3RSb3cpO1xuICAgIGxldCBjdXJyZW50Q2hhcmFjdGVyID0gY2hhcmFjdGVycy5uZXh0KCk7XG4gICAgbGV0IG5leHRDaGFyYWN0ZXIgPSBjaGFyYWN0ZXJzLm5leHQoKTtcbiAgICBsZXQgcmF3Q2hhcmFjdGVySW5kZXggPSAwO1xuICAgIHdoaWxlICghY3VycmVudENoYXJhY3Rlci5kb25lKSB7XG4gICAgICAgIGNvbnN0IGNoYXJhY3RlciA9IGN1cnJlbnRDaGFyYWN0ZXIudmFsdWU7XG4gICAgICAgIGNvbnN0IGNoYXJhY3Rlckxlbmd0aCA9IHN0cmluZ1dpZHRoKGNoYXJhY3Rlcik7XG4gICAgICAgIGlmICh2aXNpYmxlICsgY2hhcmFjdGVyTGVuZ3RoIDw9IGNvbHVtbnMpIHtcbiAgICAgICAgICAgIHJvd3Nbcm93cy5sZW5ndGggLSAxXSArPSBjaGFyYWN0ZXI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByb3dzLnB1c2goY2hhcmFjdGVyKTtcbiAgICAgICAgICAgIHZpc2libGUgPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaGFyYWN0ZXIgPT09IEVTQyB8fCBjaGFyYWN0ZXIgPT09IENTSSkge1xuICAgICAgICAgICAgaXNJbnNpZGVFc2NhcGUgPSB0cnVlO1xuICAgICAgICAgICAgaXNJbnNpZGVMaW5rRXNjYXBlID0gd29yZC5zdGFydHNXaXRoKEFOU0lfRVNDQVBFX0xJTkssIHJhd0NoYXJhY3RlckluZGV4ICsgMSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzSW5zaWRlRXNjYXBlKSB7XG4gICAgICAgICAgICBpZiAoaXNJbnNpZGVMaW5rRXNjYXBlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNoYXJhY3RlciA9PT0gQU5TSV9FU0NBUEVfQkVMTCkge1xuICAgICAgICAgICAgICAgICAgICBpc0luc2lkZUVzY2FwZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBpc0luc2lkZUxpbmtFc2NhcGUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGFyYWN0ZXIgPT09IEFOU0lfU0dSX1RFUk1JTkFUT1IpIHtcbiAgICAgICAgICAgICAgICBpc0luc2lkZUVzY2FwZSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmlzaWJsZSArPSBjaGFyYWN0ZXJMZW5ndGg7XG4gICAgICAgICAgICBpZiAodmlzaWJsZSA9PT0gY29sdW1ucyAmJiAhbmV4dENoYXJhY3Rlci5kb25lKSB7XG4gICAgICAgICAgICAgICAgcm93cy5wdXNoKCcnKTtcbiAgICAgICAgICAgICAgICB2aXNpYmxlID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjdXJyZW50Q2hhcmFjdGVyID0gbmV4dENoYXJhY3RlcjtcbiAgICAgICAgbmV4dENoYXJhY3RlciA9IGNoYXJhY3RlcnMubmV4dCgpO1xuICAgICAgICByYXdDaGFyYWN0ZXJJbmRleCArPSBjaGFyYWN0ZXIubGVuZ3RoO1xuICAgIH1cbiAgICBsYXN0Um93ID0gcm93cy5hdCgtMSk7XG4gICAgaWYgKCF2aXNpYmxlICYmIGxhc3RSb3cgIT09IHVuZGVmaW5lZCAmJiBsYXN0Um93Lmxlbmd0aCAmJiByb3dzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgcm93c1tyb3dzLmxlbmd0aCAtIDJdICs9IHJvd3MucG9wKCk7XG4gICAgfVxufTtcbmNvbnN0IHN0cmluZ1Zpc2libGVUcmltU3BhY2VzUmlnaHQgPSAoc3RyaW5nKSA9PiB7XG4gICAgY29uc3Qgd29yZHMgPSBzdHJpbmcuc3BsaXQoJyAnKTtcbiAgICBsZXQgbGFzdCA9IHdvcmRzLmxlbmd0aDtcbiAgICB3aGlsZSAobGFzdCkge1xuICAgICAgICBpZiAoc3RyaW5nV2lkdGgod29yZHNbbGFzdCAtIDFdKSkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgbGFzdC0tO1xuICAgIH1cbiAgICBpZiAobGFzdCA9PT0gd29yZHMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBzdHJpbmc7XG4gICAgfVxuICAgIHJldHVybiB3b3Jkcy5zbGljZSgwLCBsYXN0KS5qb2luKCcgJykgKyB3b3Jkcy5zbGljZShsYXN0KS5qb2luKCcnKTtcbn07XG5jb25zdCBleGVjID0gKHN0cmluZywgY29sdW1ucywgb3B0aW9ucyA9IHt9KSA9PiB7XG4gICAgaWYgKG9wdGlvbnMudHJpbSAhPT0gZmFsc2UgJiYgc3RyaW5nLnRyaW0oKSA9PT0gJycpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICBsZXQgcmV0dXJuVmFsdWUgPSAnJztcbiAgICBsZXQgZXNjYXBlQ29kZTtcbiAgICBsZXQgZXNjYXBlVXJsO1xuICAgIGNvbnN0IHdvcmRzID0gc3RyaW5nLnNwbGl0KCcgJyk7XG4gICAgbGV0IHJvd3MgPSBbJyddO1xuICAgIGxldCByb3dMZW5ndGggPSAwO1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB3b3Jkcy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3Qgd29yZCA9IHdvcmRzW2luZGV4XTtcbiAgICAgICAgaWYgKG9wdGlvbnMudHJpbSAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGNvbnN0IHJvdyA9IHJvd3MuYXQoLTEpID8/ICcnO1xuICAgICAgICAgICAgY29uc3QgdHJpbW1lZCA9IHJvdy50cmltU3RhcnQoKTtcbiAgICAgICAgICAgIGlmIChyb3cubGVuZ3RoICE9PSB0cmltbWVkLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJvd3Nbcm93cy5sZW5ndGggLSAxXSA9IHRyaW1tZWQ7XG4gICAgICAgICAgICAgICAgcm93TGVuZ3RoID0gc3RyaW5nV2lkdGgodHJpbW1lZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGluZGV4ICE9PSAwKSB7XG4gICAgICAgICAgICBpZiAocm93TGVuZ3RoID49IGNvbHVtbnMgJiZcbiAgICAgICAgICAgICAgICAob3B0aW9ucy53b3JkV3JhcCA9PT0gZmFsc2UgfHwgb3B0aW9ucy50cmltID09PSBmYWxzZSkpIHtcbiAgICAgICAgICAgICAgICByb3dzLnB1c2goJycpO1xuICAgICAgICAgICAgICAgIHJvd0xlbmd0aCA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocm93TGVuZ3RoIHx8IG9wdGlvbnMudHJpbSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICByb3dzW3Jvd3MubGVuZ3RoIC0gMV0gKz0gJyAnO1xuICAgICAgICAgICAgICAgIHJvd0xlbmd0aCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHdvcmRMZW5ndGggPSBzdHJpbmdXaWR0aCh3b3JkKTtcbiAgICAgICAgaWYgKG9wdGlvbnMuaGFyZCAmJiB3b3JkTGVuZ3RoID4gY29sdW1ucykge1xuICAgICAgICAgICAgY29uc3QgcmVtYWluaW5nQ29sdW1ucyA9IGNvbHVtbnMgLSByb3dMZW5ndGg7XG4gICAgICAgICAgICBjb25zdCBicmVha3NTdGFydGluZ1RoaXNMaW5lID0gMSArIE1hdGguZmxvb3IoKHdvcmRMZW5ndGggLSByZW1haW5pbmdDb2x1bW5zIC0gMSkgLyBjb2x1bW5zKTtcbiAgICAgICAgICAgIGNvbnN0IGJyZWFrc1N0YXJ0aW5nTmV4dExpbmUgPSBNYXRoLmZsb29yKCh3b3JkTGVuZ3RoIC0gMSkgLyBjb2x1bW5zKTtcbiAgICAgICAgICAgIGlmIChicmVha3NTdGFydGluZ05leHRMaW5lIDwgYnJlYWtzU3RhcnRpbmdUaGlzTGluZSkge1xuICAgICAgICAgICAgICAgIHJvd3MucHVzaCgnJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB3cmFwV29yZChyb3dzLCB3b3JkLCBjb2x1bW5zKTtcbiAgICAgICAgICAgIHJvd0xlbmd0aCA9IHN0cmluZ1dpZHRoKHJvd3MuYXQoLTEpID8/ICcnKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyb3dMZW5ndGggKyB3b3JkTGVuZ3RoID4gY29sdW1ucyAmJiByb3dMZW5ndGggJiYgd29yZExlbmd0aCkge1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMud29yZFdyYXAgPT09IGZhbHNlICYmIHJvd0xlbmd0aCA8IGNvbHVtbnMpIHtcbiAgICAgICAgICAgICAgICB3cmFwV29yZChyb3dzLCB3b3JkLCBjb2x1bW5zKTtcbiAgICAgICAgICAgICAgICByb3dMZW5ndGggPSBzdHJpbmdXaWR0aChyb3dzLmF0KC0xKSA/PyAnJyk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByb3dzLnB1c2goJycpO1xuICAgICAgICAgICAgcm93TGVuZ3RoID0gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAocm93TGVuZ3RoICsgd29yZExlbmd0aCA+IGNvbHVtbnMgJiYgb3B0aW9ucy53b3JkV3JhcCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHdyYXBXb3JkKHJvd3MsIHdvcmQsIGNvbHVtbnMpO1xuICAgICAgICAgICAgcm93TGVuZ3RoID0gc3RyaW5nV2lkdGgocm93cy5hdCgtMSkgPz8gJycpO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgcm93c1tyb3dzLmxlbmd0aCAtIDFdICs9IHdvcmQ7XG4gICAgICAgIHJvd0xlbmd0aCArPSB3b3JkTGVuZ3RoO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy50cmltICE9PSBmYWxzZSkge1xuICAgICAgICByb3dzID0gcm93cy5tYXAoKHJvdykgPT4gc3RyaW5nVmlzaWJsZVRyaW1TcGFjZXNSaWdodChyb3cpKTtcbiAgICB9XG4gICAgY29uc3QgcHJlU3RyaW5nID0gcm93cy5qb2luKCdcXG4nKTtcbiAgICBsZXQgaW5TdXJyb2dhdGUgPSBmYWxzZTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByZVN0cmluZy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBjaGFyYWN0ZXIgPSBwcmVTdHJpbmdbaV07XG4gICAgICAgIHJldHVyblZhbHVlICs9IGNoYXJhY3RlcjtcbiAgICAgICAgaWYgKCFpblN1cnJvZ2F0ZSkge1xuICAgICAgICAgICAgaW5TdXJyb2dhdGUgPSBjaGFyYWN0ZXIgPj0gJ1xcdWQ4MDAnICYmIGNoYXJhY3RlciA8PSAnXFx1ZGJmZic7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2hhcmFjdGVyID09PSBFU0MgfHwgY2hhcmFjdGVyID09PSBDU0kpIHtcbiAgICAgICAgICAgIEdST1VQX1JFR0VYLmxhc3RJbmRleCA9IGkgKyAxO1xuICAgICAgICAgICAgY29uc3QgZ3JvdXBzUmVzdWx0ID0gR1JPVVBfUkVHRVguZXhlYyhwcmVTdHJpbmcpO1xuICAgICAgICAgICAgY29uc3QgZ3JvdXBzID0gZ3JvdXBzUmVzdWx0Py5ncm91cHM7XG4gICAgICAgICAgICBpZiAoZ3JvdXBzPy5jb2RlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb2RlID0gTnVtYmVyLnBhcnNlRmxvYXQoZ3JvdXBzLmNvZGUpO1xuICAgICAgICAgICAgICAgIGVzY2FwZUNvZGUgPSBjb2RlID09PSBFTkRfQ09ERSA/IHVuZGVmaW5lZCA6IGNvZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChncm91cHM/LnVyaSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgZXNjYXBlVXJsID0gZ3JvdXBzLnVyaS5sZW5ndGggPT09IDAgPyB1bmRlZmluZWQgOiBncm91cHMudXJpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChwcmVTdHJpbmdbaSArIDFdID09PSAnXFxuJykge1xuICAgICAgICAgICAgaWYgKGVzY2FwZVVybCkge1xuICAgICAgICAgICAgICAgIHJldHVyblZhbHVlICs9IHdyYXBBbnNpSHlwZXJsaW5rKCcnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGNsb3NpbmdDb2RlID0gZXNjYXBlQ29kZSA/IGdldENsb3NpbmdDb2RlKGVzY2FwZUNvZGUpIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgaWYgKGVzY2FwZUNvZGUgJiYgY2xvc2luZ0NvZGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm5WYWx1ZSArPSB3cmFwQW5zaUNvZGUoY2xvc2luZ0NvZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGNoYXJhY3RlciA9PT0gJ1xcbicpIHtcbiAgICAgICAgICAgIGlmIChlc2NhcGVDb2RlICYmIGdldENsb3NpbmdDb2RlKGVzY2FwZUNvZGUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuVmFsdWUgKz0gd3JhcEFuc2lDb2RlKGVzY2FwZUNvZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGVzY2FwZVVybCkge1xuICAgICAgICAgICAgICAgIHJldHVyblZhbHVlICs9IHdyYXBBbnNpSHlwZXJsaW5rKGVzY2FwZVVybCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJldHVyblZhbHVlO1xufTtcbmNvbnN0IENSTEZfT1JfTEYgPSAvXFxyP1xcbi87XG5leHBvcnQgZnVuY3Rpb24gd3JhcEFuc2koc3RyaW5nLCBjb2x1bW5zLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIFN0cmluZyhzdHJpbmcpXG4gICAgICAgIC5ub3JtYWxpemUoKVxuICAgICAgICAuc3BsaXQoQ1JMRl9PUl9MRilcbiAgICAgICAgLm1hcCgobGluZSkgPT4gZXhlYyhsaW5lLCBjb2x1bW5zLCBvcHRpb25zKSlcbiAgICAgICAgLmpvaW4oJ1xcbicpO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFpbi5qcy5tYXAiLAogICAgImltcG9ydHtnZXRDb2x1bW5zIGFzIFgsZ2V0Um93cyBhcyBrZSxBdXRvY29tcGxldGVQcm9tcHQgYXMgdmUsc2V0dGluZ3MgYXMgSSxDb25maXJtUHJvbXB0IGFzIExlLHdyYXBUZXh0V2l0aFByZWZpeCBhcyBOLERhdGVQcm9tcHQgYXMgRGUsaXNDYW5jZWwgYXMgV2UsR3JvdXBNdWx0aVNlbGVjdFByb21wdCBhcyBGZSxNdWx0aVNlbGVjdFByb21wdCBhcyBIZSxQYXNzd29yZFByb21wdCBhcyBVZSxibG9jayBhcyBLZSxTZWxlY3RQcm9tcHQgYXMgcWUsU2VsZWN0S2V5UHJvbXB0IGFzIEplLFRleHRQcm9tcHQgYXMgWWV9ZnJvbVwiQGNsYWNrL2NvcmVcIjtleHBvcnR7aXNDYW5jZWwsc2V0dGluZ3MsdXBkYXRlU2V0dGluZ3N9ZnJvbVwiQGNsYWNrL2NvcmVcIjtpbXBvcnR7c3R5bGVUZXh0IGFzIHQsc3RyaXBWVENvbnRyb2xDaGFyYWN0ZXJzIGFzIG5lfWZyb21cIm5vZGU6dXRpbFwiO2ltcG9ydCBQIGZyb21cIm5vZGU6cHJvY2Vzc1wiO2ltcG9ydHt3cmFwQW5zaSBhcyBxfWZyb21cImZhc3Qtd3JhcC1hbnNpXCI7aW1wb3J0IEIgZnJvbVwiZmFzdC1zdHJpbmctd2lkdGhcIjtpbXBvcnR7ZXhpc3RzU3luYyBhcyBYZSxsc3RhdFN5bmMgYXMgd2UscmVhZGRpclN5bmMgYXMgemV9ZnJvbVwibm9kZTpmc1wiO2ltcG9ydHtkaXJuYW1lIGFzIGJlLGpvaW4gYXMgUWV9ZnJvbVwibm9kZTpwYXRoXCI7aW1wb3J0e2N1cnNvciBhcyBTZSxlcmFzZSBhcyBDZX1mcm9tXCJzaXN0ZXJhbnNpXCI7ZnVuY3Rpb24gWmUoKXtyZXR1cm4gUC5wbGF0Zm9ybSE9PVwid2luMzJcIj9QLmVudi5URVJNIT09XCJsaW51eFwiOiEhUC5lbnYuQ0l8fCEhUC5lbnYuV1RfU0VTU0lPTnx8ISFQLmVudi5URVJNSU5VU19TVUJMSU1FfHxQLmVudi5Db25FbXVUYXNrPT09XCJ7Y21kOjpDbWRlcn1cInx8UC5lbnYuVEVSTV9QUk9HUkFNPT09XCJUZXJtaW51cy1TdWJsaW1lXCJ8fFAuZW52LlRFUk1fUFJPR1JBTT09PVwidnNjb2RlXCJ8fFAuZW52LlRFUk09PT1cInh0ZXJtLTI1NmNvbG9yXCJ8fFAuZW52LlRFUk09PT1cImFsYWNyaXR0eVwifHxQLmVudi5URVJNSU5BTF9FTVVMQVRPUj09PVwiSmV0QnJhaW5zLUplZGlUZXJtXCJ9Y29uc3QgZWU9WmUoKSxhZT0oKT0+cHJvY2Vzcy5lbnYuQ0k9PT1cInRydWVcIixUZT1lPT5lLmlzVFRZPT09ITAsdz0oZSxpKT0+ZWU/ZTppLF9lPXcoXCJcXHUyNUM2XCIsXCIqXCIpLG9lPXcoXCJcXHUyNUEwXCIsXCJ4XCIpLHVlPXcoXCJcXHUyNUIyXCIsXCJ4XCIpLEY9dyhcIlxcdTI1QzdcIixcIm9cIiksbGU9dyhcIlxcdTI1MENcIixcIlRcIiksZD13KFwiXFx1MjUwMlwiLFwifFwiKSxFPXcoXCJcXHUyNTE0XCIsXCJcXHUyMDE0XCIpLEllPXcoXCJcXHUyNTEwXCIsXCJUXCIpLEVlPXcoXCJcXHUyNTE4XCIsXCJcXHUyMDE0XCIpLHo9dyhcIlxcdTI1Q0ZcIixcIj5cIiksSD13KFwiXFx1MjVDQlwiLFwiIFwiKSx0ZT13KFwiXFx1MjVGQlwiLFwiW1xcdTIwMjJdXCIpLFU9dyhcIlxcdTI1RkNcIixcIlsrXVwiKSxKPXcoXCJcXHUyNUZCXCIsXCJbIF1cIikseGU9dyhcIlxcdTI1QUFcIixcIlxcdTIwMjJcIiksc2U9dyhcIlxcdTI1MDBcIixcIi1cIiksY2U9dyhcIlxcdTI1NkVcIixcIitcIiksR2U9dyhcIlxcdTI1MUNcIixcIitcIiksJGU9dyhcIlxcdTI1NkZcIixcIitcIiksZGU9dyhcIlxcdTI1NzBcIixcIitcIiksT2U9dyhcIlxcdTI1NkRcIixcIitcIiksaGU9dyhcIlxcdTI1Q0ZcIixcIlxcdTIwMjJcIikscGU9dyhcIlxcdTI1QzZcIixcIipcIiksbWU9dyhcIlxcdTI1QjJcIixcIiFcIiksZ2U9dyhcIlxcdTI1QTBcIixcInhcIiksVj1lPT57c3dpdGNoKGUpe2Nhc2VcImluaXRpYWxcIjpjYXNlXCJhY3RpdmVcIjpyZXR1cm4gdChcImN5YW5cIixfZSk7Y2FzZVwiY2FuY2VsXCI6cmV0dXJuIHQoXCJyZWRcIixvZSk7Y2FzZVwiZXJyb3JcIjpyZXR1cm4gdChcInllbGxvd1wiLHVlKTtjYXNlXCJzdWJtaXRcIjpyZXR1cm4gdChcImdyZWVuXCIsRil9fSx5ZT1lPT57c3dpdGNoKGUpe2Nhc2VcImluaXRpYWxcIjpjYXNlXCJhY3RpdmVcIjpyZXR1cm4gdChcImN5YW5cIixkKTtjYXNlXCJjYW5jZWxcIjpyZXR1cm4gdChcInJlZFwiLGQpO2Nhc2VcImVycm9yXCI6cmV0dXJuIHQoXCJ5ZWxsb3dcIixkKTtjYXNlXCJzdWJtaXRcIjpyZXR1cm4gdChcImdyZWVuXCIsZCl9fSxldD0oZSxpLHMscix1KT0+e2xldCBuPWksbz0wO2ZvcihsZXQgYz1zO2M8cjtjKyspe2NvbnN0IGE9ZVtjXTtpZihuPW4tYS5sZW5ndGgsbysrLG48PXUpYnJlYWt9cmV0dXJue2xpbmVDb3VudDpuLHJlbW92YWxzOm99fSxZPSh7Y3Vyc29yOmUsb3B0aW9uczppLHN0eWxlOnMsb3V0cHV0OnI9cHJvY2Vzcy5zdGRvdXQsbWF4SXRlbXM6dT1OdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFksY29sdW1uUGFkZGluZzpuPTAscm93UGFkZGluZzpvPTR9KT0+e2NvbnN0IGM9WChyKS1uLGE9a2UociksbD10KFwiZGltXCIsXCIuLi5cIiksJD1NYXRoLm1heChhLW8sMCkseT1NYXRoLm1heChNYXRoLm1pbih1LCQpLDUpO2xldCBwPTA7ZT49eS0zJiYocD1NYXRoLm1heChNYXRoLm1pbihlLXkrMyxpLmxlbmd0aC15KSwwKSk7bGV0IG09eTxpLmxlbmd0aCYmcD4wLGc9eTxpLmxlbmd0aCYmcCt5PGkubGVuZ3RoO2NvbnN0IFM9TWF0aC5taW4ocCt5LGkubGVuZ3RoKSxoPVtdO2xldCBmPTA7bSYmZisrLGcmJmYrKztjb25zdCB2PXArKG0/MTowKSxUPVMtKGc/MTowKTtmb3IobGV0IGI9djtiPFQ7YisrKXtjb25zdCB4PXEocyhpW2JdLGI9PT1lKSxjLHtoYXJkOiEwLHRyaW06ITF9KS5zcGxpdChgXG5gKTtoLnB1c2goeCksZis9eC5sZW5ndGh9aWYoZj4kKXtsZXQgYj0wLHg9MCxHPWY7Y29uc3QgTT1lLXYsUj0oaixEKT0+ZXQoaCxHLGosRCwkKTttPyh7bGluZUNvdW50OkcscmVtb3ZhbHM6Yn09UigwLE0pLEc+JCYmKHtsaW5lQ291bnQ6RyxyZW1vdmFsczp4fT1SKE0rMSxoLmxlbmd0aCkpKTooe2xpbmVDb3VudDpHLHJlbW92YWxzOnh9PVIoTSsxLGgubGVuZ3RoKSxHPiQmJih7bGluZUNvdW50OkcscmVtb3ZhbHM6Yn09UigwLE0pKSksYj4wJiYobT0hMCxoLnNwbGljZSgwLGIpKSx4PjAmJihnPSEwLGguc3BsaWNlKGgubGVuZ3RoLXgseCkpfWNvbnN0IEM9W107bSYmQy5wdXNoKGwpO2Zvcihjb25zdCBiIG9mIGgpZm9yKGNvbnN0IHggb2YgYilDLnB1c2goeCk7cmV0dXJuIGcmJkMucHVzaChsKSxDfTtmdW5jdGlvbiBNZShlKXtyZXR1cm4gZS5sYWJlbD8/U3RyaW5nKGUudmFsdWU/P1wiXCIpfWZ1bmN0aW9uIFJlKGUsaSl7aWYoIWUpcmV0dXJuITA7Y29uc3Qgcz0oaS5sYWJlbD8/U3RyaW5nKGkudmFsdWU/P1wiXCIpKS50b0xvd2VyQ2FzZSgpLHI9KGkuaGludD8/XCJcIikudG9Mb3dlckNhc2UoKSx1PVN0cmluZyhpLnZhbHVlKS50b0xvd2VyQ2FzZSgpLG49ZS50b0xvd2VyQ2FzZSgpO3JldHVybiBzLmluY2x1ZGVzKG4pfHxyLmluY2x1ZGVzKG4pfHx1LmluY2x1ZGVzKG4pfWZ1bmN0aW9uIHR0KGUsaSl7Y29uc3Qgcz1bXTtmb3IoY29uc3QgciBvZiBpKWUuaW5jbHVkZXMoci52YWx1ZSkmJnMucHVzaChyKTtyZXR1cm4gc31jb25zdCBBZT1lPT5uZXcgdmUoe29wdGlvbnM6ZS5vcHRpb25zLGluaXRpYWxWYWx1ZTplLmluaXRpYWxWYWx1ZT9bZS5pbml0aWFsVmFsdWVdOnZvaWQgMCxpbml0aWFsVXNlcklucHV0OmUuaW5pdGlhbFVzZXJJbnB1dCxwbGFjZWhvbGRlcjplLnBsYWNlaG9sZGVyLGZpbHRlcjplLmZpbHRlcj8/KChpLHMpPT5SZShpLHMpKSxzaWduYWw6ZS5zaWduYWwsaW5wdXQ6ZS5pbnB1dCxvdXRwdXQ6ZS5vdXRwdXQsdmFsaWRhdGU6ZS52YWxpZGF0ZSxyZW5kZXIoKXtjb25zdCBpPWUud2l0aEd1aWRlPz9JLndpdGhHdWlkZSxzPWk/W2Ake3QoXCJncmF5XCIsZCl9YCxgJHtWKHRoaXMuc3RhdGUpfSAgJHtlLm1lc3NhZ2V9YF06W2Ake1YodGhpcy5zdGF0ZSl9ICAke2UubWVzc2FnZX1gXSxyPXRoaXMudXNlcklucHV0LHU9dGhpcy5vcHRpb25zLG49ZS5wbGFjZWhvbGRlcixvPXI9PT1cIlwiJiZuIT09dm9pZCAwLGM9KGEsbCk9Pntjb25zdCAkPU1lKGEpLHk9YS5oaW50JiZhLnZhbHVlPT09dGhpcy5mb2N1c2VkVmFsdWU/dChcImRpbVwiLGAgKCR7YS5oaW50fSlgKTpcIlwiO3N3aXRjaChsKXtjYXNlXCJhY3RpdmVcIjpyZXR1cm5gJHt0KFwiZ3JlZW5cIix6KX0gJHskfSR7eX1gO2Nhc2VcImluYWN0aXZlXCI6cmV0dXJuYCR7dChcImRpbVwiLEgpfSAke3QoXCJkaW1cIiwkKX1gO2Nhc2VcImRpc2FibGVkXCI6cmV0dXJuYCR7dChcImdyYXlcIixIKX0gJHt0KFtcInN0cmlrZXRocm91Z2hcIixcImdyYXlcIl0sJCl9YH19O3N3aXRjaCh0aGlzLnN0YXRlKXtjYXNlXCJzdWJtaXRcIjp7Y29uc3QgYT10dCh0aGlzLnNlbGVjdGVkVmFsdWVzLHUpLGw9YS5sZW5ndGg+MD9gICAke3QoXCJkaW1cIixhLm1hcChNZSkuam9pbihcIiwgXCIpKX1gOlwiXCIsJD1pP3QoXCJncmF5XCIsZCk6XCJcIjtyZXR1cm5gJHtzLmpvaW4oYFxuYCl9XG4keyR9JHtsfWB9Y2FzZVwiY2FuY2VsXCI6e2NvbnN0IGE9cj9gICAke3QoW1wic3RyaWtldGhyb3VnaFwiLFwiZGltXCJdLHIpfWA6XCJcIixsPWk/dChcImdyYXlcIixkKTpcIlwiO3JldHVybmAke3Muam9pbihgXG5gKX1cbiR7bH0ke2F9YH1kZWZhdWx0Ontjb25zdCBhPXRoaXMuc3RhdGU9PT1cImVycm9yXCI/XCJ5ZWxsb3dcIjpcImN5YW5cIixsPWk/YCR7dChhLGQpfSAgYDpcIlwiLCQ9aT90KGEsRSk6XCJcIjtsZXQgeT1cIlwiO2lmKHRoaXMuaXNOYXZpZ2F0aW5nfHxvKXtjb25zdCB2PW8/bjpyO3k9diE9PVwiXCI/YCAke3QoXCJkaW1cIix2KX1gOlwiXCJ9ZWxzZSB5PWAgJHt0aGlzLnVzZXJJbnB1dFdpdGhDdXJzb3J9YDtjb25zdCBwPXRoaXMuZmlsdGVyZWRPcHRpb25zLmxlbmd0aCE9PXUubGVuZ3RoP3QoXCJkaW1cIixgICgke3RoaXMuZmlsdGVyZWRPcHRpb25zLmxlbmd0aH0gbWF0Y2gke3RoaXMuZmlsdGVyZWRPcHRpb25zLmxlbmd0aD09PTE/XCJcIjpcImVzXCJ9KWApOlwiXCIsbT10aGlzLmZpbHRlcmVkT3B0aW9ucy5sZW5ndGg9PT0wJiZyP1tgJHtsfSR7dChcInllbGxvd1wiLFwiTm8gbWF0Y2hlcyBmb3VuZFwiKX1gXTpbXSxnPXRoaXMuc3RhdGU9PT1cImVycm9yXCI/W2Ake2x9JHt0KFwieWVsbG93XCIsdGhpcy5lcnJvcil9YF06W107aSYmcy5wdXNoKGAke2wudHJpbUVuZCgpfWApLHMucHVzaChgJHtsfSR7dChcImRpbVwiLFwiU2VhcmNoOlwiKX0ke3l9JHtwfWAsLi4ubSwuLi5nKTtjb25zdCBTPVtgJHt0KFwiZGltXCIsXCJcXHUyMTkxL1xcdTIxOTNcIil9IHRvIHNlbGVjdGAsYCR7dChcImRpbVwiLFwiRW50ZXI6XCIpfSBjb25maXJtYCxgJHt0KFwiZGltXCIsXCJUeXBlOlwiKX0gdG8gc2VhcmNoYF0saD1bYCR7bH0ke1Muam9pbihcIiBcXHUyMDIyIFwiKX1gLCRdLGY9dGhpcy5maWx0ZXJlZE9wdGlvbnMubGVuZ3RoPT09MD9bXTpZKHtjdXJzb3I6dGhpcy5jdXJzb3Isb3B0aW9uczp0aGlzLmZpbHRlcmVkT3B0aW9ucyxjb2x1bW5QYWRkaW5nOmk/MzowLHJvd1BhZGRpbmc6cy5sZW5ndGgraC5sZW5ndGgsc3R5bGU6KHYsVCk9PmModix2LmRpc2FibGVkP1wiZGlzYWJsZWRcIjpUP1wiYWN0aXZlXCI6XCJpbmFjdGl2ZVwiKSxtYXhJdGVtczplLm1heEl0ZW1zLG91dHB1dDplLm91dHB1dH0pO3JldHVyblsuLi5zLC4uLmYubWFwKHY9PmAke2x9JHt2fWApLC4uLmhdLmpvaW4oYFxuYCl9fX19KS5wcm9tcHQoKSxzdD1lPT57Y29uc3QgaT0ocix1LG4sbyk9Pntjb25zdCBjPW4uaW5jbHVkZXMoci52YWx1ZSksYT1yLmxhYmVsPz9TdHJpbmcoci52YWx1ZT8/XCJcIiksbD1yLmhpbnQmJm8hPT12b2lkIDAmJnIudmFsdWU9PT1vP3QoXCJkaW1cIixgICgke3IuaGludH0pYCk6XCJcIiwkPWM/dChcImdyZWVuXCIsVSk6dChcImRpbVwiLEopO3JldHVybiByLmRpc2FibGVkP2Ake3QoXCJncmF5XCIsSil9ICR7dChbXCJzdHJpa2V0aHJvdWdoXCIsXCJncmF5XCJdLGEpfWA6dT9gJHskfSAke2F9JHtsfWA6YCR7JH0gJHt0KFwiZGltXCIsYSl9YH0scz1uZXcgdmUoe29wdGlvbnM6ZS5vcHRpb25zLG11bHRpcGxlOiEwLHBsYWNlaG9sZGVyOmUucGxhY2Vob2xkZXIsZmlsdGVyOmUuZmlsdGVyPz8oKHIsdSk9PlJlKHIsdSkpLHZhbGlkYXRlOigpPT57aWYoZS5yZXF1aXJlZCYmcy5zZWxlY3RlZFZhbHVlcy5sZW5ndGg9PT0wKXJldHVyblwiUGxlYXNlIHNlbGVjdCBhdCBsZWFzdCBvbmUgaXRlbVwifSxpbml0aWFsVmFsdWU6ZS5pbml0aWFsVmFsdWVzLHNpZ25hbDplLnNpZ25hbCxpbnB1dDplLmlucHV0LG91dHB1dDplLm91dHB1dCxyZW5kZXIoKXtjb25zdCByPWUud2l0aEd1aWRlPz9JLndpdGhHdWlkZSx1PWAke3I/YCR7dChcImdyYXlcIixkKX1cbmA6XCJcIn0ke1YodGhpcy5zdGF0ZSl9ICAke2UubWVzc2FnZX1cbmAsbj10aGlzLnVzZXJJbnB1dCxvPWUucGxhY2Vob2xkZXIsYz1uPT09XCJcIiYmbyE9PXZvaWQgMCxhPXRoaXMuaXNOYXZpZ2F0aW5nfHxjP3QoXCJkaW1cIixjP286bik6dGhpcy51c2VySW5wdXRXaXRoQ3Vyc29yLGw9dGhpcy5vcHRpb25zLCQ9dGhpcy5maWx0ZXJlZE9wdGlvbnMubGVuZ3RoIT09bC5sZW5ndGg/dChcImRpbVwiLGAgKCR7dGhpcy5maWx0ZXJlZE9wdGlvbnMubGVuZ3RofSBtYXRjaCR7dGhpcy5maWx0ZXJlZE9wdGlvbnMubGVuZ3RoPT09MT9cIlwiOlwiZXNcIn0pYCk6XCJcIjtzd2l0Y2godGhpcy5zdGF0ZSl7Y2FzZVwic3VibWl0XCI6cmV0dXJuYCR7dX0ke3I/YCR7dChcImdyYXlcIixkKX0gIGA6XCJcIn0ke3QoXCJkaW1cIixgJHt0aGlzLnNlbGVjdGVkVmFsdWVzLmxlbmd0aH0gaXRlbXMgc2VsZWN0ZWRgKX1gO2Nhc2VcImNhbmNlbFwiOnJldHVybmAke3V9JHtyP2Ake3QoXCJncmF5XCIsZCl9ICBgOlwiXCJ9JHt0KFtcInN0cmlrZXRocm91Z2hcIixcImRpbVwiXSxuKX1gO2RlZmF1bHQ6e2NvbnN0IHk9dGhpcy5zdGF0ZT09PVwiZXJyb3JcIj9cInllbGxvd1wiOlwiY3lhblwiLHA9cj9gJHt0KHksZCl9ICBgOlwiXCIsbT1yP3QoeSxFKTpcIlwiLGc9W2Ake3QoXCJkaW1cIixcIlxcdTIxOTEvXFx1MjE5M1wiKX0gdG8gbmF2aWdhdGVgLGAke3QoXCJkaW1cIix0aGlzLmlzTmF2aWdhdGluZz9cIlNwYWNlL1RhYjpcIjpcIlRhYjpcIil9IHNlbGVjdGAsYCR7dChcImRpbVwiLFwiRW50ZXI6XCIpfSBjb25maXJtYCxgJHt0KFwiZGltXCIsXCJUeXBlOlwiKX0gdG8gc2VhcmNoYF0sUz10aGlzLmZpbHRlcmVkT3B0aW9ucy5sZW5ndGg9PT0wJiZuP1tgJHtwfSR7dChcInllbGxvd1wiLFwiTm8gbWF0Y2hlcyBmb3VuZFwiKX1gXTpbXSxoPXRoaXMuc3RhdGU9PT1cImVycm9yXCI/W2Ake3B9JHt0KFwieWVsbG93XCIsdGhpcy5lcnJvcil9YF06W10sZj1bLi4uYCR7dX0ke3I/dCh5LGQpOlwiXCJ9YC5zcGxpdChgXG5gKSxgJHtwfSR7dChcImRpbVwiLFwiU2VhcmNoOlwiKX0gJHthfSR7JH1gLC4uLlMsLi4uaF0sdj1bYCR7cH0ke2cuam9pbihcIiBcXHUyMDIyIFwiKX1gLG1dLFQ9WSh7Y3Vyc29yOnRoaXMuY3Vyc29yLG9wdGlvbnM6dGhpcy5maWx0ZXJlZE9wdGlvbnMsc3R5bGU6KEMsYik9PmkoQyxiLHRoaXMuc2VsZWN0ZWRWYWx1ZXMsdGhpcy5mb2N1c2VkVmFsdWUpLG1heEl0ZW1zOmUubWF4SXRlbXMsb3V0cHV0OmUub3V0cHV0LHJvd1BhZGRpbmc6Zi5sZW5ndGgrdi5sZW5ndGh9KTtyZXR1cm5bLi4uZiwuLi5ULm1hcChDPT5gJHtwfSR7Q31gKSwuLi52XS5qb2luKGBcbmApfX19fSk7cmV0dXJuIHMucHJvbXB0KCl9LHJ0PVtPZSxjZSxkZSwkZV0saXQ9W2xlLEllLEUsRWVdO2Z1bmN0aW9uIFBlKGUsaSxzLHIpe2xldCB1PXMsbj1zO3JldHVybiByPT09XCJjZW50ZXJcIj91PU1hdGguZmxvb3IoKGktZSkvMik6cj09PVwicmlnaHRcIiYmKHU9aS1lLXMpLG49aS11LWUsW3Usbl19Y29uc3QgbnQ9ZT0+ZSxhdD0oZT1cIlwiLGk9XCJcIixzKT0+e2NvbnN0IHI9cz8ub3V0cHV0Pz9wcm9jZXNzLnN0ZG91dCx1PVgociksbj0yLG89cz8udGl0bGVQYWRkaW5nPz8xLGM9cz8uY29udGVudFBhZGRpbmc/PzIsYT1zPy53aWR0aD09PXZvaWQgMHx8cy53aWR0aD09PVwiYXV0b1wiPzE6TWF0aC5taW4oMSxzLndpZHRoKSxsPXM/LndpdGhHdWlkZT8/SS53aXRoR3VpZGU/YCR7ZH0gYDpcIlwiLCQ9cz8uZm9ybWF0Qm9yZGVyPz9udCx5PShzPy5yb3VuZGVkP3J0Oml0KS5tYXAoJCkscD0kKHNlKSxtPSQoZCksZz1CKGwpLFM9QihpKSxoPXUtZztsZXQgZj1NYXRoLmZsb29yKHUqYSktZztpZihzPy53aWR0aD09PVwiYXV0b1wiKXtjb25zdCBSPWUuc3BsaXQoYFxuYCk7bGV0IGo9UytvKjI7Zm9yKGNvbnN0IGllIG9mIFIpe2NvbnN0IFc9QihpZSkrYyoyO1c+aiYmKGo9Vyl9Y29uc3QgRD1qK247RDxmJiYoZj1EKX1mJTIhPT0wJiYoZjxoP2YrKzpmLS0pO2NvbnN0IHY9Zi1uLFQ9di1vKjIsQz1TPlQ/YCR7aS5zbGljZSgwLFQtMyl9Li4uYDppLFtiLHhdPVBlKEIoQyksdixvLHM/LnRpdGxlQWxpZ24pLEc9cShlLHYtYyoyLHtoYXJkOiEwLHRyaW06ITF9KTtyLndyaXRlKGAke2x9JHt5WzBdfSR7cC5yZXBlYXQoYil9JHtDfSR7cC5yZXBlYXQoeCl9JHt5WzFdfVxuYCk7Y29uc3QgTT1HLnNwbGl0KGBcbmApO2Zvcihjb25zdCBSIG9mIE0pe2NvbnN0W2osRF09UGUoQihSKSx2LGMscz8uY29udGVudEFsaWduKTtyLndyaXRlKGAke2x9JHttfSR7XCIgXCIucmVwZWF0KGopfSR7Un0ke1wiIFwiLnJlcGVhdChEKX0ke219XG5gKX1yLndyaXRlKGAke2x9JHt5WzJdfSR7cC5yZXBlYXQodil9JHt5WzNdfVxuYCl9LG90PWU9Pntjb25zdCBpPWUuYWN0aXZlPz9cIlllc1wiLHM9ZS5pbmFjdGl2ZT8/XCJOb1wiO3JldHVybiBuZXcgTGUoe2FjdGl2ZTppLGluYWN0aXZlOnMsc2lnbmFsOmUuc2lnbmFsLGlucHV0OmUuaW5wdXQsb3V0cHV0OmUub3V0cHV0LGluaXRpYWxWYWx1ZTplLmluaXRpYWxWYWx1ZT8/ITAscmVuZGVyKCl7Y29uc3Qgcj1lLndpdGhHdWlkZT8/SS53aXRoR3VpZGUsdT1gJHtWKHRoaXMuc3RhdGUpfSAgYCxuPXI/YCR7dChcImdyYXlcIixkKX0gIGA6XCJcIixvPU4oZS5vdXRwdXQsZS5tZXNzYWdlLG4sdSksYz1gJHtyP2Ake3QoXCJncmF5XCIsZCl9XG5gOlwiXCJ9JHtvfVxuYCxhPXRoaXMudmFsdWU/aTpzO3N3aXRjaCh0aGlzLnN0YXRlKXtjYXNlXCJzdWJtaXRcIjp7Y29uc3QgbD1yP2Ake3QoXCJncmF5XCIsZCl9ICBgOlwiXCI7cmV0dXJuYCR7Y30ke2x9JHt0KFwiZGltXCIsYSl9YH1jYXNlXCJjYW5jZWxcIjp7Y29uc3QgbD1yP2Ake3QoXCJncmF5XCIsZCl9ICBgOlwiXCI7cmV0dXJuYCR7Y30ke2x9JHt0KFtcInN0cmlrZXRocm91Z2hcIixcImRpbVwiXSxhKX0ke3I/YFxuJHt0KFwiZ3JheVwiLGQpfWA6XCJcIn1gfWRlZmF1bHQ6e2NvbnN0IGw9cj9gJHt0KFwiY3lhblwiLGQpfSAgYDpcIlwiLCQ9cj90KFwiY3lhblwiLEUpOlwiXCI7cmV0dXJuYCR7Y30ke2x9JHt0aGlzLnZhbHVlP2Ake3QoXCJncmVlblwiLHopfSAke2l9YDpgJHt0KFwiZGltXCIsSCl9ICR7dChcImRpbVwiLGkpfWB9JHtlLnZlcnRpY2FsP3I/YFxuJHt0KFwiY3lhblwiLGQpfSAgYDpgXG5gOmAgJHt0KFwiZGltXCIsXCIvXCIpfSBgfSR7dGhpcy52YWx1ZT9gJHt0KFwiZGltXCIsSCl9ICR7dChcImRpbVwiLHMpfWA6YCR7dChcImdyZWVuXCIseil9ICR7c31gfVxuJHskfVxuYH19fX0pLnByb21wdCgpfSx1dD1lPT57Y29uc3QgaT1lLnZhbGlkYXRlO3JldHVybiBuZXcgRGUoey4uLmUsdmFsaWRhdGUocyl7aWYocz09PXZvaWQgMClyZXR1cm4gZS5kZWZhdWx0VmFsdWUhPT12b2lkIDA/dm9pZCAwOmk/aShzKTpJLmRhdGUubWVzc2FnZXMucmVxdWlyZWQ7Y29uc3Qgcj11PT51LnRvSVNPU3RyaW5nKCkuc2xpY2UoMCwxMCk7aWYoZS5taW5EYXRlJiZyKHMpPHIoZS5taW5EYXRlKSlyZXR1cm4gSS5kYXRlLm1lc3NhZ2VzLmFmdGVyTWluKGUubWluRGF0ZSk7aWYoZS5tYXhEYXRlJiZyKHMpPnIoZS5tYXhEYXRlKSlyZXR1cm4gSS5kYXRlLm1lc3NhZ2VzLmJlZm9yZU1heChlLm1heERhdGUpO2lmKGkpcmV0dXJuIGkocyl9LHJlbmRlcigpe2NvbnN0IHM9KGU/LndpdGhHdWlkZT8/SS53aXRoR3VpZGUpIT09ITEscj1gJHtgJHtzP2Ake3QoXCJncmF5XCIsZCl9XG5gOlwiXCJ9JHtWKHRoaXMuc3RhdGUpfSAgYH0ke2UubWVzc2FnZX1cbmAsdT10aGlzLnN0YXRlIT09XCJpbml0aWFsXCI/dGhpcy5zdGF0ZTpcImFjdGl2ZVwiLG49bHQodGhpcyx1KSxvPXRoaXMudmFsdWUgaW5zdGFuY2VvZiBEYXRlP3RoaXMuZm9ybWF0dGVkVmFsdWU6XCJcIjtzd2l0Y2godGhpcy5zdGF0ZSl7Y2FzZVwiZXJyb3JcIjp7Y29uc3QgYz10aGlzLmVycm9yP2AgICR7dChcInllbGxvd1wiLHRoaXMuZXJyb3IpfWA6XCJcIixhPXM/YCR7dChcInllbGxvd1wiLGQpfSAgYDpcIlwiLGw9cz90KFwieWVsbG93XCIsRSk6XCJcIjtyZXR1cm5gJHtyLnRyaW0oKX1cbiR7YX0ke259XG4ke2x9JHtjfVxuYH1jYXNlXCJzdWJtaXRcIjp7Y29uc3QgYz1vP2AgICR7dChcImRpbVwiLG8pfWA6XCJcIixhPXM/dChcImdyYXlcIixkKTpcIlwiO3JldHVybmAke3J9JHthfSR7Y31gfWNhc2VcImNhbmNlbFwiOntjb25zdCBjPW8/YCAgJHt0KFtcInN0cmlrZXRocm91Z2hcIixcImRpbVwiXSxvKX1gOlwiXCIsYT1zP3QoXCJncmF5XCIsZCk6XCJcIjtyZXR1cm5gJHtyfSR7YX0ke2N9JHtvLnRyaW0oKT9gXG4ke2F9YDpcIlwifWB9ZGVmYXVsdDp7Y29uc3QgYz1zP2Ake3QoXCJjeWFuXCIsZCl9ICBgOlwiXCIsYT1zP3QoXCJjeWFuXCIsRSk6XCJcIixsPXM/YCR7dChcImN5YW5cIixkKX0gIGA6XCJcIiwkPXRoaXMuaW5saW5lRXJyb3I/YFxuJHtsfSR7dChcInllbGxvd1wiLHRoaXMuaW5saW5lRXJyb3IpfWA6XCJcIjtyZXR1cm5gJHtyfSR7Y30ke259JHskfVxuJHthfVxuYH19fX0pLnByb21wdCgpfTtmdW5jdGlvbiBsdChlLGkpe2NvbnN0IHM9ZS5zZWdtZW50VmFsdWVzLHI9ZS5zZWdtZW50Q3Vyc29yO2lmKGk9PT1cInN1Ym1pdFwifHxpPT09XCJjYW5jZWxcIilyZXR1cm4gZS5mb3JtYXR0ZWRWYWx1ZTtjb25zdCB1PXQoXCJncmF5XCIsZS5zZXBhcmF0b3IpO3JldHVybiBlLnNlZ21lbnRzLm1hcCgobixvKT0+e2NvbnN0IGM9bz09PXIuc2VnbWVudEluZGV4JiYhW1wic3VibWl0XCIsXCJjYW5jZWxcIl0uaW5jbHVkZXMoaSksYT0kdFtuLnR5cGVdO3JldHVybiBjdChzW24udHlwZV0se2lzQWN0aXZlOmMsbGFiZWw6YX0pfSkuam9pbih1KX1mdW5jdGlvbiBjdChlLGkpe2NvbnN0IHM9IWV8fGUucmVwbGFjZSgvXy9nLFwiXCIpPT09XCJcIjtyZXR1cm4gaS5pc0FjdGl2ZT90KFwiaW52ZXJzZVwiLHM/aS5sYWJlbDplLnJlcGxhY2UoL18vZyxcIiBcIikpOnM/dChcImRpbVwiLGkubGFiZWwpOmUucmVwbGFjZSgvXy9nLHQoXCJkaW1cIixcIiBcIikpfWNvbnN0ICR0PXt5ZWFyOlwieXl5eVwiLG1vbnRoOlwibW1cIixkYXk6XCJkZFwifSxkdD1hc3luYyhlLGkpPT57Y29uc3Qgcz17fSxyPU9iamVjdC5rZXlzKGUpO2Zvcihjb25zdCB1IG9mIHIpe2NvbnN0IG49ZVt1XSxvPWF3YWl0IG4oe3Jlc3VsdHM6c30pPy5jYXRjaChjPT57dGhyb3cgY30pO2lmKHR5cGVvZiBpPy5vbkNhbmNlbD09XCJmdW5jdGlvblwiJiZXZShvKSl7c1t1XT1cImNhbmNlbGVkXCIsaS5vbkNhbmNlbCh7cmVzdWx0czpzfSk7Y29udGludWV9c1t1XT1vfXJldHVybiBzfSxodD1lPT57Y29uc3R7c2VsZWN0YWJsZUdyb3VwczppPSEwLGdyb3VwU3BhY2luZzpzPTB9PWUscj0obixvLGM9W10pPT57Y29uc3QgYT1uLmxhYmVsPz9TdHJpbmcobi52YWx1ZSksbD10eXBlb2Ygbi5ncm91cD09XCJzdHJpbmdcIiwkPWwmJihjW2MuaW5kZXhPZihuKSsxXT8/e2dyb3VwOiEwfSkseT1sJiYkJiYkLmdyb3VwPT09ITAscD1sP2k/YCR7eT9FOmR9IGA6XCIgIFwiOlwiXCI7bGV0IG09XCJcIjtpZihzPjAmJiFsKXtjb25zdCBTPWBcbiR7dChcImN5YW5cIixkKX1gO209YCR7Uy5yZXBlYXQocy0xKX0ke1N9ICBgfWlmKG89PT1cImFjdGl2ZVwiKXJldHVybmAke219JHt0KFwiZGltXCIscCl9JHt0KFwiY3lhblwiLHRlKX0gJHthfSR7bi5oaW50P2AgJHt0KFwiZGltXCIsYCgke24uaGludH0pYCl9YDpcIlwifWA7aWYobz09PVwiZ3JvdXAtYWN0aXZlXCIpcmV0dXJuYCR7bX0ke3B9JHt0KFwiY3lhblwiLHRlKX0gJHt0KFwiZGltXCIsYSl9YDtpZihvPT09XCJncm91cC1hY3RpdmUtc2VsZWN0ZWRcIilyZXR1cm5gJHttfSR7cH0ke3QoXCJncmVlblwiLFUpfSAke3QoXCJkaW1cIixhKX1gO2lmKG89PT1cInNlbGVjdGVkXCIpe2NvbnN0IFM9bHx8aT90KFwiZ3JlZW5cIixVKTpcIlwiO3JldHVybmAke219JHt0KFwiZGltXCIscCl9JHtTfSAke3QoXCJkaW1cIixhKX0ke24uaGludD9gICR7dChcImRpbVwiLGAoJHtuLmhpbnR9KWApfWA6XCJcIn1gfWlmKG89PT1cImNhbmNlbGxlZFwiKXJldHVybmAke3QoW1wic3RyaWtldGhyb3VnaFwiLFwiZGltXCJdLGEpfWA7aWYobz09PVwiYWN0aXZlLXNlbGVjdGVkXCIpcmV0dXJuYCR7bX0ke3QoXCJkaW1cIixwKX0ke3QoXCJncmVlblwiLFUpfSAke2F9JHtuLmhpbnQ/YCAke3QoXCJkaW1cIixgKCR7bi5oaW50fSlgKX1gOlwiXCJ9YDtpZihvPT09XCJzdWJtaXR0ZWRcIilyZXR1cm5gJHt0KFwiZGltXCIsYSl9YDtjb25zdCBnPWx8fGk/dChcImRpbVwiLEopOlwiXCI7cmV0dXJuYCR7bX0ke3QoXCJkaW1cIixwKX0ke2d9ICR7dChcImRpbVwiLGEpfWB9LHU9ZS5yZXF1aXJlZD8/ITA7cmV0dXJuIG5ldyBGZSh7b3B0aW9uczplLm9wdGlvbnMsc2lnbmFsOmUuc2lnbmFsLGlucHV0OmUuaW5wdXQsb3V0cHV0OmUub3V0cHV0LGluaXRpYWxWYWx1ZXM6ZS5pbml0aWFsVmFsdWVzLHJlcXVpcmVkOnUsY3Vyc29yQXQ6ZS5jdXJzb3JBdCxzZWxlY3RhYmxlR3JvdXBzOmksdmFsaWRhdGUobil7aWYodSYmKG49PT12b2lkIDB8fG4ubGVuZ3RoPT09MCkpcmV0dXJuYFBsZWFzZSBzZWxlY3QgYXQgbGVhc3Qgb25lIG9wdGlvbi5cbiR7dChcInJlc2V0XCIsdChcImRpbVwiLGBQcmVzcyAke3QoW1wiZ3JheVwiLFwiYmdXaGl0ZVwiLFwiaW52ZXJzZVwiXSxcIiBzcGFjZSBcIil9IHRvIHNlbGVjdCwgJHt0KFwiZ3JheVwiLHQoW1wiYmdXaGl0ZVwiLFwiaW52ZXJzZVwiXSxcIiBlbnRlciBcIikpfSB0byBzdWJtaXRgKSl9YH0scmVuZGVyKCl7Y29uc3Qgbj1lLndpdGhHdWlkZT8/SS53aXRoR3VpZGUsbz1gJHtuP2Ake3QoXCJncmF5XCIsZCl9XG5gOlwiXCJ9JHtWKHRoaXMuc3RhdGUpfSAgJHtlLm1lc3NhZ2V9XG5gLGM9dGhpcy52YWx1ZT8/W107c3dpdGNoKHRoaXMuc3RhdGUpe2Nhc2VcInN1Ym1pdFwiOntjb25zdCBhPXRoaXMub3B0aW9ucy5maWx0ZXIoKHt2YWx1ZTokfSk9PmMuaW5jbHVkZXMoJCkpLm1hcCgkPT5yKCQsXCJzdWJtaXR0ZWRcIikpLGw9YS5sZW5ndGg9PT0wP1wiXCI6YCAgJHthLmpvaW4odChcImRpbVwiLFwiLCBcIikpfWA7cmV0dXJuYCR7b30ke24/dChcImdyYXlcIixkKTpcIlwifSR7bH1gfWNhc2VcImNhbmNlbFwiOntjb25zdCBhPXRoaXMub3B0aW9ucy5maWx0ZXIoKHt2YWx1ZTpsfSk9PmMuaW5jbHVkZXMobCkpLm1hcChsPT5yKGwsXCJjYW5jZWxsZWRcIikpLmpvaW4odChcImRpbVwiLFwiLCBcIikpO3JldHVybmAke299JHtuP2Ake3QoXCJncmF5XCIsZCl9ICBgOlwiXCJ9JHthLnRyaW0oKT9gJHthfSR7bj9gXG4ke3QoXCJncmF5XCIsZCl9YDpcIlwifWA6XCJcIn1gfWNhc2VcImVycm9yXCI6e2NvbnN0IGE9dGhpcy5lcnJvci5zcGxpdChgXG5gKS5tYXAoKGwsJCk9PiQ9PT0wP2Ake24/YCR7dChcInllbGxvd1wiLEUpfSAgYDpcIlwifSR7dChcInllbGxvd1wiLGwpfWA6YCAgICR7bH1gKS5qb2luKGBcbmApO3JldHVybmAke299JHtuP2Ake3QoXCJ5ZWxsb3dcIixkKX0gIGA6XCJcIn0ke3RoaXMub3B0aW9ucy5tYXAoKGwsJCx5KT0+e2NvbnN0IHA9Yy5pbmNsdWRlcyhsLnZhbHVlKXx8bC5ncm91cD09PSEwJiZ0aGlzLmlzR3JvdXBTZWxlY3RlZChgJHtsLnZhbHVlfWApLG09JD09PXRoaXMuY3Vyc29yO3JldHVybiFtJiZ0eXBlb2YgbC5ncm91cD09XCJzdHJpbmdcIiYmdGhpcy5vcHRpb25zW3RoaXMuY3Vyc29yXS52YWx1ZT09PWwuZ3JvdXA/cihsLHA/XCJncm91cC1hY3RpdmUtc2VsZWN0ZWRcIjpcImdyb3VwLWFjdGl2ZVwiLHkpOm0mJnA/cihsLFwiYWN0aXZlLXNlbGVjdGVkXCIseSk6cD9yKGwsXCJzZWxlY3RlZFwiLHkpOnIobCxtP1wiYWN0aXZlXCI6XCJpbmFjdGl2ZVwiLHkpfSkuam9pbihgXG4ke24/YCR7dChcInllbGxvd1wiLGQpfSAgYDpcIlwifWApfVxuJHthfVxuYH1kZWZhdWx0Ontjb25zdCBhPXRoaXMub3B0aW9ucy5tYXAoKCQseSxwKT0+e2NvbnN0IG09Yy5pbmNsdWRlcygkLnZhbHVlKXx8JC5ncm91cD09PSEwJiZ0aGlzLmlzR3JvdXBTZWxlY3RlZChgJHskLnZhbHVlfWApLGc9eT09PXRoaXMuY3Vyc29yLFM9IWcmJnR5cGVvZiAkLmdyb3VwPT1cInN0cmluZ1wiJiZ0aGlzLm9wdGlvbnNbdGhpcy5jdXJzb3JdLnZhbHVlPT09JC5ncm91cDtsZXQgaD1cIlwiO3JldHVybiBTP2g9cigkLG0/XCJncm91cC1hY3RpdmUtc2VsZWN0ZWRcIjpcImdyb3VwLWFjdGl2ZVwiLHApOmcmJm0/aD1yKCQsXCJhY3RpdmUtc2VsZWN0ZWRcIixwKTptP2g9cigkLFwic2VsZWN0ZWRcIixwKTpoPXIoJCxnP1wiYWN0aXZlXCI6XCJpbmFjdGl2ZVwiLHApLGAke3khPT0wJiYhaC5zdGFydHNXaXRoKGBcbmApP1wiICBcIjpcIlwifSR7aH1gfSkuam9pbihgXG4ke24/dChcImN5YW5cIixkKTpcIlwifWApLGw9YS5zdGFydHNXaXRoKGBcbmApP1wiXCI6XCIgIFwiO3JldHVybmAke299JHtuP3QoXCJjeWFuXCIsZCk6XCJcIn0ke2x9JHthfVxuJHtuP3QoXCJjeWFuXCIsRSk6XCJcIn1cbmB9fX19KS5wcm9tcHQoKX0sTz17bWVzc2FnZTooZT1bXSx7c3ltYm9sOmk9dChcImdyYXlcIixkKSxzZWNvbmRhcnlTeW1ib2w6cz10KFwiZ3JheVwiLGQpLG91dHB1dDpyPXByb2Nlc3Muc3Rkb3V0LHNwYWNpbmc6dT0xLHdpdGhHdWlkZTpufT17fSk9Pntjb25zdCBvPVtdLGM9bj8/SS53aXRoR3VpZGUsYT1jP3M6XCJcIixsPWM/YCR7aX0gIGA6XCJcIiwkPWM/YCR7c30gIGA6XCJcIjtmb3IobGV0IHA9MDtwPHU7cCsrKW8ucHVzaChhKTtjb25zdCB5PUFycmF5LmlzQXJyYXkoZSk/ZTplLnNwbGl0KGBcbmApO2lmKHkubGVuZ3RoPjApe2NvbnN0W3AsLi4ubV09eTtwLmxlbmd0aD4wP28ucHVzaChgJHtsfSR7cH1gKTpvLnB1c2goYz9pOlwiXCIpO2Zvcihjb25zdCBnIG9mIG0pZy5sZW5ndGg+MD9vLnB1c2goYCR7JH0ke2d9YCk6by5wdXNoKGM/czpcIlwiKX1yLndyaXRlKGAke28uam9pbihgXG5gKX1cbmApfSxpbmZvOihlLGkpPT57Ty5tZXNzYWdlKGUsey4uLmksc3ltYm9sOnQoXCJibHVlXCIsaGUpfSl9LHN1Y2Nlc3M6KGUsaSk9PntPLm1lc3NhZ2UoZSx7Li4uaSxzeW1ib2w6dChcImdyZWVuXCIscGUpfSl9LHN0ZXA6KGUsaSk9PntPLm1lc3NhZ2UoZSx7Li4uaSxzeW1ib2w6dChcImdyZWVuXCIsRil9KX0sd2FybjooZSxpKT0+e08ubWVzc2FnZShlLHsuLi5pLHN5bWJvbDp0KFwieWVsbG93XCIsbWUpfSl9LHdhcm5pbmc6KGUsaSk9PntPLndhcm4oZSxpKX0sZXJyb3I6KGUsaSk9PntPLm1lc3NhZ2UoZSx7Li4uaSxzeW1ib2w6dChcInJlZFwiLGdlKX0pfX0scHQ9KGU9XCJcIixpKT0+e2NvbnN0IHM9aT8ub3V0cHV0Pz9wcm9jZXNzLnN0ZG91dCxyPWk/LndpdGhHdWlkZT8/SS53aXRoR3VpZGU/YCR7dChcImdyYXlcIixFKX0gIGA6XCJcIjtzLndyaXRlKGAke3J9JHt0KFwicmVkXCIsZSl9XG5cbmApfSxtdD0oZT1cIlwiLGkpPT57Y29uc3Qgcz1pPy5vdXRwdXQ/P3Byb2Nlc3Muc3Rkb3V0LHI9aT8ud2l0aEd1aWRlPz9JLndpdGhHdWlkZT9gJHt0KFwiZ3JheVwiLGxlKX0gIGA6XCJcIjtzLndyaXRlKGAke3J9JHtlfVxuYCl9LGd0PShlPVwiXCIsaSk9Pntjb25zdCBzPWk/Lm91dHB1dD8/cHJvY2Vzcy5zdGRvdXQscj1pPy53aXRoR3VpZGU/P0kud2l0aEd1aWRlP2Ake3QoXCJncmF5XCIsZCl9XG4ke3QoXCJncmF5XCIsRSl9ICBgOlwiXCI7cy53cml0ZShgJHtyfSR7ZX1cblxuYCl9LFE9KGUsaSk9PmUuc3BsaXQoYFxuYCkubWFwKHM9PmkocykpLmpvaW4oYFxuYCkseXQ9ZT0+e2NvbnN0IGk9KHIsdSk9Pntjb25zdCBuPXIubGFiZWw/P1N0cmluZyhyLnZhbHVlKTtyZXR1cm4gdT09PVwiZGlzYWJsZWRcIj9gJHt0KFwiZ3JheVwiLEopfSAke1EobixvPT50KFtcInN0cmlrZXRocm91Z2hcIixcImdyYXlcIl0sbykpfSR7ci5oaW50P2AgJHt0KFwiZGltXCIsYCgke3IuaGludD8/XCJkaXNhYmxlZFwifSlgKX1gOlwiXCJ9YDp1PT09XCJhY3RpdmVcIj9gJHt0KFwiY3lhblwiLHRlKX0gJHtufSR7ci5oaW50P2AgJHt0KFwiZGltXCIsYCgke3IuaGludH0pYCl9YDpcIlwifWA6dT09PVwic2VsZWN0ZWRcIj9gJHt0KFwiZ3JlZW5cIixVKX0gJHtRKG4sbz0+dChcImRpbVwiLG8pKX0ke3IuaGludD9gICR7dChcImRpbVwiLGAoJHtyLmhpbnR9KWApfWA6XCJcIn1gOnU9PT1cImNhbmNlbGxlZFwiP2Ake1EobixvPT50KFtcInN0cmlrZXRocm91Z2hcIixcImRpbVwiXSxvKSl9YDp1PT09XCJhY3RpdmUtc2VsZWN0ZWRcIj9gJHt0KFwiZ3JlZW5cIixVKX0gJHtufSR7ci5oaW50P2AgJHt0KFwiZGltXCIsYCgke3IuaGludH0pYCl9YDpcIlwifWA6dT09PVwic3VibWl0dGVkXCI/YCR7UShuLG89PnQoXCJkaW1cIixvKSl9YDpgJHt0KFwiZGltXCIsSil9ICR7UShuLG89PnQoXCJkaW1cIixvKSl9YH0scz1lLnJlcXVpcmVkPz8hMDtyZXR1cm4gbmV3IEhlKHtvcHRpb25zOmUub3B0aW9ucyxzaWduYWw6ZS5zaWduYWwsaW5wdXQ6ZS5pbnB1dCxvdXRwdXQ6ZS5vdXRwdXQsaW5pdGlhbFZhbHVlczplLmluaXRpYWxWYWx1ZXMscmVxdWlyZWQ6cyxjdXJzb3JBdDplLmN1cnNvckF0LHZhbGlkYXRlKHIpe2lmKHMmJihyPT09dm9pZCAwfHxyLmxlbmd0aD09PTApKXJldHVybmBQbGVhc2Ugc2VsZWN0IGF0IGxlYXN0IG9uZSBvcHRpb24uXG4ke3QoXCJyZXNldFwiLHQoXCJkaW1cIixgUHJlc3MgJHt0KFtcImdyYXlcIixcImJnV2hpdGVcIixcImludmVyc2VcIl0sXCIgc3BhY2UgXCIpfSB0byBzZWxlY3QsICR7dChcImdyYXlcIix0KFwiYmdXaGl0ZVwiLHQoXCJpbnZlcnNlXCIsXCIgZW50ZXIgXCIpKSl9IHRvIHN1Ym1pdGApKX1gfSxyZW5kZXIoKXtjb25zdCByPWUud2l0aEd1aWRlPz9JLndpdGhHdWlkZSx1PU4oZS5vdXRwdXQsZS5tZXNzYWdlLHI/YCR7eWUodGhpcy5zdGF0ZSl9ICBgOlwiXCIsYCR7Vih0aGlzLnN0YXRlKX0gIGApLG49YCR7cj9gJHt0KFwiZ3JheVwiLGQpfVxuYDpcIlwifSR7dX1cbmAsbz10aGlzLnZhbHVlPz9bXSxjPShhLGwpPT57aWYoYS5kaXNhYmxlZClyZXR1cm4gaShhLFwiZGlzYWJsZWRcIik7Y29uc3QgJD1vLmluY2x1ZGVzKGEudmFsdWUpO3JldHVybiBsJiYkP2koYSxcImFjdGl2ZS1zZWxlY3RlZFwiKTokP2koYSxcInNlbGVjdGVkXCIpOmkoYSxsP1wiYWN0aXZlXCI6XCJpbmFjdGl2ZVwiKX07c3dpdGNoKHRoaXMuc3RhdGUpe2Nhc2VcInN1Ym1pdFwiOntjb25zdCBhPXRoaXMub3B0aW9ucy5maWx0ZXIoKHt2YWx1ZTokfSk9Pm8uaW5jbHVkZXMoJCkpLm1hcCgkPT5pKCQsXCJzdWJtaXR0ZWRcIikpLmpvaW4odChcImRpbVwiLFwiLCBcIikpfHx0KFwiZGltXCIsXCJub25lXCIpLGw9TihlLm91dHB1dCxhLHI/YCR7dChcImdyYXlcIixkKX0gIGA6XCJcIik7cmV0dXJuYCR7bn0ke2x9YH1jYXNlXCJjYW5jZWxcIjp7Y29uc3QgYT10aGlzLm9wdGlvbnMuZmlsdGVyKCh7dmFsdWU6JH0pPT5vLmluY2x1ZGVzKCQpKS5tYXAoJD0+aSgkLFwiY2FuY2VsbGVkXCIpKS5qb2luKHQoXCJkaW1cIixcIiwgXCIpKTtpZihhLnRyaW0oKT09PVwiXCIpcmV0dXJuYCR7bn0ke3QoXCJncmF5XCIsZCl9YDtjb25zdCBsPU4oZS5vdXRwdXQsYSxyP2Ake3QoXCJncmF5XCIsZCl9ICBgOlwiXCIpO3JldHVybmAke259JHtsfSR7cj9gXG4ke3QoXCJncmF5XCIsZCl9YDpcIlwifWB9Y2FzZVwiZXJyb3JcIjp7Y29uc3QgYT1yP2Ake3QoXCJ5ZWxsb3dcIixkKX0gIGA6XCJcIixsPXRoaXMuZXJyb3Iuc3BsaXQoYFxuYCkubWFwKChwLG0pPT5tPT09MD9gJHtyP2Ake3QoXCJ5ZWxsb3dcIixFKX0gIGA6XCJcIn0ke3QoXCJ5ZWxsb3dcIixwKX1gOmAgICAke3B9YCkuam9pbihgXG5gKSwkPW4uc3BsaXQoYFxuYCkubGVuZ3RoLHk9bC5zcGxpdChgXG5gKS5sZW5ndGgrMTtyZXR1cm5gJHtufSR7YX0ke1koe291dHB1dDplLm91dHB1dCxvcHRpb25zOnRoaXMub3B0aW9ucyxjdXJzb3I6dGhpcy5jdXJzb3IsbWF4SXRlbXM6ZS5tYXhJdGVtcyxjb2x1bW5QYWRkaW5nOmEubGVuZ3RoLHJvd1BhZGRpbmc6JCt5LHN0eWxlOmN9KS5qb2luKGBcbiR7YX1gKX1cbiR7bH1cbmB9ZGVmYXVsdDp7Y29uc3QgYT1yP2Ake3QoXCJjeWFuXCIsZCl9ICBgOlwiXCIsbD1uLnNwbGl0KGBcbmApLmxlbmd0aCwkPXI/MjoxO3JldHVybmAke259JHthfSR7WSh7b3V0cHV0OmUub3V0cHV0LG9wdGlvbnM6dGhpcy5vcHRpb25zLGN1cnNvcjp0aGlzLmN1cnNvcixtYXhJdGVtczplLm1heEl0ZW1zLGNvbHVtblBhZGRpbmc6YS5sZW5ndGgscm93UGFkZGluZzpsKyQsc3R5bGU6Y30pLmpvaW4oYFxuJHthfWApfVxuJHtyP3QoXCJjeWFuXCIsRSk6XCJcIn1cbmB9fX19KS5wcm9tcHQoKX0sZnQ9ZT0+dChcImRpbVwiLGUpLHZ0PShlLGkscyk9Pntjb25zdCByPXtoYXJkOiEwLHRyaW06ITF9LHU9cShlLGkscikuc3BsaXQoYFxuYCksbj11LnJlZHVjZSgoYSxsKT0+TWF0aC5tYXgoQihsKSxhKSwwKSxvPXUubWFwKHMpLnJlZHVjZSgoYSxsKT0+TWF0aC5tYXgoQihsKSxhKSwwKSxjPWktKG8tbik7cmV0dXJuIHEoZSxjLHIpfSx3dD0oZT1cIlwiLGk9XCJcIixzKT0+e2NvbnN0IHI9cz8ub3V0cHV0Pz9QLnN0ZG91dCx1PXM/LndpdGhHdWlkZT8/SS53aXRoR3VpZGUsbj1zPy5mb3JtYXQ/P2Z0LG89W1wiXCIsLi4udnQoZSxYKHIpLTYsbikuc3BsaXQoYFxuYCkubWFwKG4pLFwiXCJdLGM9QihpKSxhPU1hdGgubWF4KG8ucmVkdWNlKChwLG0pPT57Y29uc3QgZz1CKG0pO3JldHVybiBnPnA/ZzpwfSwwKSxjKSsyLGw9by5tYXAocD0+YCR7dChcImdyYXlcIixkKX0gICR7cH0ke1wiIFwiLnJlcGVhdChhLUIocCkpfSR7dChcImdyYXlcIixkKX1gKS5qb2luKGBcbmApLCQ9dT9gJHt0KFwiZ3JheVwiLGQpfVxuYDpcIlwiLHk9dT9HZTpkZTtyLndyaXRlKGAkeyR9JHt0KFwiZ3JlZW5cIixGKX0gICR7dChcInJlc2V0XCIsaSl9ICR7dChcImdyYXlcIixzZS5yZXBlYXQoTWF0aC5tYXgoYS1jLTEsMSkpK2NlKX1cbiR7bH1cbiR7dChcImdyYXlcIix5K3NlLnJlcGVhdChhKzIpKyRlKX1cbmApfSxidD1lPT5uZXcgVWUoe3ZhbGlkYXRlOmUudmFsaWRhdGUsbWFzazplLm1hc2s/P3hlLHNpZ25hbDplLnNpZ25hbCxpbnB1dDplLmlucHV0LG91dHB1dDplLm91dHB1dCxyZW5kZXIoKXtjb25zdCBpPWUud2l0aEd1aWRlPz9JLndpdGhHdWlkZSxzPWAke2k/YCR7dChcImdyYXlcIixkKX1cbmA6XCJcIn0ke1YodGhpcy5zdGF0ZSl9ICAke2UubWVzc2FnZX1cbmAscj10aGlzLnVzZXJJbnB1dFdpdGhDdXJzb3IsdT10aGlzLm1hc2tlZDtzd2l0Y2godGhpcy5zdGF0ZSl7Y2FzZVwiZXJyb3JcIjp7Y29uc3Qgbj1pP2Ake3QoXCJ5ZWxsb3dcIixkKX0gIGA6XCJcIixvPWk/YCR7dChcInllbGxvd1wiLEUpfSAgYDpcIlwiLGM9dT8/XCJcIjtyZXR1cm4gZS5jbGVhck9uRXJyb3ImJnRoaXMuY2xlYXIoKSxgJHtzLnRyaW0oKX1cbiR7bn0ke2N9XG4ke299JHt0KFwieWVsbG93XCIsdGhpcy5lcnJvcil9XG5gfWNhc2VcInN1Ym1pdFwiOntjb25zdCBuPWk/YCR7dChcImdyYXlcIixkKX0gIGA6XCJcIixvPXU/dChcImRpbVwiLHUpOlwiXCI7cmV0dXJuYCR7c30ke259JHtvfWB9Y2FzZVwiY2FuY2VsXCI6e2NvbnN0IG49aT9gJHt0KFwiZ3JheVwiLGQpfSAgYDpcIlwiLG89dT90KFtcInN0cmlrZXRocm91Z2hcIixcImRpbVwiXSx1KTpcIlwiO3JldHVybmAke3N9JHtufSR7b30ke3UmJmk/YFxuJHt0KFwiZ3JheVwiLGQpfWA6XCJcIn1gfWRlZmF1bHQ6e2NvbnN0IG49aT9gJHt0KFwiY3lhblwiLGQpfSAgYDpcIlwiLG89aT90KFwiY3lhblwiLEUpOlwiXCI7cmV0dXJuYCR7c30ke259JHtyfVxuJHtvfVxuYH19fX0pLnByb21wdCgpLFN0PWU9Pntjb25zdCBpPWUudmFsaWRhdGU7cmV0dXJuIEFlKHsuLi5lLGluaXRpYWxVc2VySW5wdXQ6ZS5pbml0aWFsVmFsdWU/P2Uucm9vdD8/cHJvY2Vzcy5jd2QoKSxtYXhJdGVtczo1LHZhbGlkYXRlKHMpe2lmKCFBcnJheS5pc0FycmF5KHMpKXtpZighcylyZXR1cm5cIlBsZWFzZSBzZWxlY3QgYSBwYXRoXCI7aWYoaSlyZXR1cm4gaShzKX19LG9wdGlvbnMoKXtjb25zdCBzPXRoaXMudXNlcklucHV0O2lmKHM9PT1cIlwiKXJldHVybltdO3RyeXtsZXQgcjtYZShzKT93ZShzKS5pc0RpcmVjdG9yeSgpJiYoIWUuZGlyZWN0b3J5fHxzLmVuZHNXaXRoKFwiL1wiKSk/cj1zOnI9YmUocyk6cj1iZShzKTtjb25zdCB1PXMubGVuZ3RoPjEmJnMuZW5kc1dpdGgoXCIvXCIpP3Muc2xpY2UoMCwtMSk6cztyZXR1cm4gemUocikubWFwKG49Pntjb25zdCBvPVFlKHIsbiksYz13ZShvKTtyZXR1cm57bmFtZTpuLHBhdGg6byxpc0RpcmVjdG9yeTpjLmlzRGlyZWN0b3J5KCl9fSkuZmlsdGVyKCh7cGF0aDpuLGlzRGlyZWN0b3J5Om99KT0+bi5zdGFydHNXaXRoKHUpJiYob3x8IWUuZGlyZWN0b3J5KSkubWFwKG49Pih7dmFsdWU6bi5wYXRofSkpfWNhdGNoe3JldHVybltdfX19KX0sQ3Q9ZT0+dChcIm1hZ2VudGFcIixlKSxmZT0oe2luZGljYXRvcjplPVwiZG90c1wiLG9uQ2FuY2VsOmksb3V0cHV0OnM9cHJvY2Vzcy5zdGRvdXQsY2FuY2VsTWVzc2FnZTpyLGVycm9yTWVzc2FnZTp1LGZyYW1lczpuPWVlP1tcIlxcdTI1RDJcIixcIlxcdTI1RDBcIixcIlxcdTI1RDNcIixcIlxcdTI1RDFcIl06W1wiXFx1MjAyMlwiLFwib1wiLFwiT1wiLFwiMFwiXSxkZWxheTpvPWVlPzgwOjEyMCxzaWduYWw6YywuLi5hfT17fSk9Pntjb25zdCBsPWFlKCk7bGV0ICQseSxwPSExLG09ITEsZz1cIlwiLFMsaD1wZXJmb3JtYW5jZS5ub3coKTtjb25zdCBmPVgocyksdj1hPy5zdHlsZUZyYW1lPz9DdCxUPV89Pntjb25zdCBBPV8+MT91Pz9JLm1lc3NhZ2VzLmVycm9yOnI/P0kubWVzc2FnZXMuY2FuY2VsO209Xz09PTEscCYmKFcoQSxfKSxtJiZ0eXBlb2YgaT09XCJmdW5jdGlvblwiJiZpKCkpfSxDPSgpPT5UKDIpLGI9KCk9PlQoMSkseD0oKT0+e3Byb2Nlc3Mub24oXCJ1bmNhdWdodEV4Y2VwdGlvbk1vbml0b3JcIixDKSxwcm9jZXNzLm9uKFwidW5oYW5kbGVkUmVqZWN0aW9uXCIsQykscHJvY2Vzcy5vbihcIlNJR0lOVFwiLGIpLHByb2Nlc3Mub24oXCJTSUdURVJNXCIsYikscHJvY2Vzcy5vbihcImV4aXRcIixUKSxjJiZjLmFkZEV2ZW50TGlzdGVuZXIoXCJhYm9ydFwiLGIpfSxHPSgpPT57cHJvY2Vzcy5yZW1vdmVMaXN0ZW5lcihcInVuY2F1Z2h0RXhjZXB0aW9uTW9uaXRvclwiLEMpLHByb2Nlc3MucmVtb3ZlTGlzdGVuZXIoXCJ1bmhhbmRsZWRSZWplY3Rpb25cIixDKSxwcm9jZXNzLnJlbW92ZUxpc3RlbmVyKFwiU0lHSU5UXCIsYikscHJvY2Vzcy5yZW1vdmVMaXN0ZW5lcihcIlNJR1RFUk1cIixiKSxwcm9jZXNzLnJlbW92ZUxpc3RlbmVyKFwiZXhpdFwiLFQpLGMmJmMucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImFib3J0XCIsYil9LE09KCk9PntpZihTPT09dm9pZCAwKXJldHVybjtsJiZzLndyaXRlKGBcbmApO2NvbnN0IF89cShTLGYse2hhcmQ6ITAsdHJpbTohMX0pLnNwbGl0KGBcbmApO18ubGVuZ3RoPjEmJnMud3JpdGUoU2UudXAoXy5sZW5ndGgtMSkpLHMud3JpdGUoU2UudG8oMCkpLHMud3JpdGUoQ2UuZG93bigpKX0sUj1fPT5fLnJlcGxhY2UoL1xcLiskLyxcIlwiKSxqPV89Pntjb25zdCBBPShwZXJmb3JtYW5jZS5ub3coKS1fKS8xZTMsaz1NYXRoLmZsb29yKEEvNjApLEw9TWF0aC5mbG9vcihBJTYwKTtyZXR1cm4gaz4wP2BbJHtrfW0gJHtMfXNdYDpgWyR7TH1zXWB9LEQ9YS53aXRoR3VpZGU/P0kud2l0aEd1aWRlLGllPShfPVwiXCIpPT57cD0hMCwkPUtlKHtvdXRwdXQ6c30pLGc9UihfKSxoPXBlcmZvcm1hbmNlLm5vdygpLEQmJnMud3JpdGUoYCR7dChcImdyYXlcIixkKX1cbmApO2xldCBBPTAsaz0wO3goKSx5PXNldEludGVydmFsKCgpPT57aWYobCYmZz09PVMpcmV0dXJuO00oKSxTPWc7Y29uc3QgTD12KG5bQV0pO2xldCBaO2lmKGwpWj1gJHtMfSAgJHtnfS4uLmA7ZWxzZSBpZihlPT09XCJ0aW1lclwiKVo9YCR7TH0gICR7Z30gJHtqKGgpfWA7ZWxzZXtjb25zdCBCZT1cIi5cIi5yZXBlYXQoTWF0aC5mbG9vcihrKSkuc2xpY2UoMCwzKTtaPWAke0x9ICAke2d9JHtCZX1gfWNvbnN0IE5lPXEoWixmLHtoYXJkOiEwLHRyaW06ITF9KTtzLndyaXRlKE5lKSxBPUErMTxuLmxlbmd0aD9BKzE6MCxrPWs8ND9rKy4xMjU6MH0sbyl9LFc9KF89XCJcIixBPTAsaz0hMSk9PntpZighcClyZXR1cm47cD0hMSxjbGVhckludGVydmFsKHkpLE0oKTtjb25zdCBMPUE9PT0wP3QoXCJncmVlblwiLEYpOkE9PT0xP3QoXCJyZWRcIixvZSk6dChcInJlZFwiLHVlKTtnPV8/P2csa3x8KGU9PT1cInRpbWVyXCI/cy53cml0ZShgJHtMfSAgJHtnfSAke2ooaCl9XG5gKTpzLndyaXRlKGAke0x9ICAke2d9XG5gKSksRygpLCQoKX07cmV0dXJue3N0YXJ0OmllLHN0b3A6KF89XCJcIik9PlcoXywwKSxtZXNzYWdlOihfPVwiXCIpPT57Zz1SKF8/P2cpfSxjYW5jZWw6KF89XCJcIik9PlcoXywxKSxlcnJvcjooXz1cIlwiKT0+VyhfLDIpLGNsZWFyOigpPT5XKFwiXCIsMCwhMCksZ2V0IGlzQ2FuY2VsbGVkKCl7cmV0dXJuIG19fX0sVmU9e2xpZ2h0OncoXCJcXHUyNTAwXCIsXCItXCIpLGhlYXZ5OncoXCJcXHUyNTAxXCIsXCI9XCIpLGJsb2NrOncoXCJcXHUyNTg4XCIsXCIjXCIpfTtmdW5jdGlvbiBUdCh7c3R5bGU6ZT1cImhlYXZ5XCIsbWF4Omk9MTAwLHNpemU6cz00MCwuLi5yfT17fSl7Y29uc3QgdT1mZShyKTtsZXQgbj0wLG89XCJcIjtjb25zdCBjPU1hdGgubWF4KDEsaSksYT1NYXRoLm1heCgxLHMpLGw9bT0+e3N3aXRjaChtKXtjYXNlXCJpbml0aWFsXCI6Y2FzZVwiYWN0aXZlXCI6cmV0dXJuIGc9PnQoXCJtYWdlbnRhXCIsZyk7Y2FzZVwiZXJyb3JcIjpjYXNlXCJjYW5jZWxcIjpyZXR1cm4gZz0+dChcInJlZFwiLGcpO2Nhc2VcInN1Ym1pdFwiOnJldHVybiBnPT50KFwiZ3JlZW5cIixnKTtkZWZhdWx0OnJldHVybiBnPT50KFwibWFnZW50YVwiLGcpfX0sJD0obSxnKT0+e2NvbnN0IFM9TWF0aC5mbG9vcihuL2MqYSk7cmV0dXJuYCR7bChtKShWZVtlXS5yZXBlYXQoUykpfSR7dChcImRpbVwiLFZlW2VdLnJlcGVhdChhLVMpKX0gJHtnfWB9LHk9KG09XCJcIik9PntvPW0sdS5zdGFydCgkKFwiaW5pdGlhbFwiLG0pKX0scD0obT0xLGcpPT57bj1NYXRoLm1pbihjLG0rbiksdS5tZXNzYWdlKCQoXCJhY3RpdmVcIixnPz9vKSksbz1nPz9vfTtyZXR1cm57c3RhcnQ6eSxzdG9wOnUuc3RvcCxjYW5jZWw6dS5jYW5jZWwsZXJyb3I6dS5lcnJvcixjbGVhcjp1LmNsZWFyLGFkdmFuY2U6cCxpc0NhbmNlbGxlZDp1LmlzQ2FuY2VsbGVkLG1lc3NhZ2U6bT0+cCgwLG0pfX1jb25zdCByZT0oZSxpKT0+ZS5pbmNsdWRlcyhgXG5gKT9lLnNwbGl0KGBcbmApLm1hcChzPT5pKHMpKS5qb2luKGBcbmApOmkoZSksX3Q9ZT0+e2NvbnN0IGk9KHMscik9Pntjb25zdCB1PXMubGFiZWw/P1N0cmluZyhzLnZhbHVlKTtzd2l0Y2gocil7Y2FzZVwiZGlzYWJsZWRcIjpyZXR1cm5gJHt0KFwiZ3JheVwiLEgpfSAke3JlKHUsbj0+dChcImdyYXlcIixuKSl9JHtzLmhpbnQ/YCAke3QoXCJkaW1cIixgKCR7cy5oaW50Pz9cImRpc2FibGVkXCJ9KWApfWA6XCJcIn1gO2Nhc2VcInNlbGVjdGVkXCI6cmV0dXJuYCR7cmUodSxuPT50KFwiZGltXCIsbikpfWA7Y2FzZVwiYWN0aXZlXCI6cmV0dXJuYCR7dChcImdyZWVuXCIseil9ICR7dX0ke3MuaGludD9gICR7dChcImRpbVwiLGAoJHtzLmhpbnR9KWApfWA6XCJcIn1gO2Nhc2VcImNhbmNlbGxlZFwiOnJldHVybmAke3JlKHUsbj0+dChbXCJzdHJpa2V0aHJvdWdoXCIsXCJkaW1cIl0sbikpfWA7ZGVmYXVsdDpyZXR1cm5gJHt0KFwiZGltXCIsSCl9ICR7cmUodSxuPT50KFwiZGltXCIsbikpfWB9fTtyZXR1cm4gbmV3IHFlKHtvcHRpb25zOmUub3B0aW9ucyxzaWduYWw6ZS5zaWduYWwsaW5wdXQ6ZS5pbnB1dCxvdXRwdXQ6ZS5vdXRwdXQsaW5pdGlhbFZhbHVlOmUuaW5pdGlhbFZhbHVlLHJlbmRlcigpe2NvbnN0IHM9ZS53aXRoR3VpZGU/P0kud2l0aEd1aWRlLHI9YCR7Vih0aGlzLnN0YXRlKX0gIGAsdT1gJHt5ZSh0aGlzLnN0YXRlKX0gIGAsbj1OKGUub3V0cHV0LGUubWVzc2FnZSx1LHIpLG89YCR7cz9gJHt0KFwiZ3JheVwiLGQpfVxuYDpcIlwifSR7bn1cbmA7c3dpdGNoKHRoaXMuc3RhdGUpe2Nhc2VcInN1Ym1pdFwiOntjb25zdCBjPXM/YCR7dChcImdyYXlcIixkKX0gIGA6XCJcIixhPU4oZS5vdXRwdXQsaSh0aGlzLm9wdGlvbnNbdGhpcy5jdXJzb3JdLFwic2VsZWN0ZWRcIiksYyk7cmV0dXJuYCR7b30ke2F9YH1jYXNlXCJjYW5jZWxcIjp7Y29uc3QgYz1zP2Ake3QoXCJncmF5XCIsZCl9ICBgOlwiXCIsYT1OKGUub3V0cHV0LGkodGhpcy5vcHRpb25zW3RoaXMuY3Vyc29yXSxcImNhbmNlbGxlZFwiKSxjKTtyZXR1cm5gJHtvfSR7YX0ke3M/YFxuJHt0KFwiZ3JheVwiLGQpfWA6XCJcIn1gfWRlZmF1bHQ6e2NvbnN0IGM9cz9gJHt0KFwiY3lhblwiLGQpfSAgYDpcIlwiLGE9cz90KFwiY3lhblwiLEUpOlwiXCIsbD1vLnNwbGl0KGBcbmApLmxlbmd0aCwkPXM/MjoxO3JldHVybmAke299JHtjfSR7WSh7b3V0cHV0OmUub3V0cHV0LGN1cnNvcjp0aGlzLmN1cnNvcixvcHRpb25zOnRoaXMub3B0aW9ucyxtYXhJdGVtczplLm1heEl0ZW1zLGNvbHVtblBhZGRpbmc6Yy5sZW5ndGgscm93UGFkZGluZzpsKyQsc3R5bGU6KHkscCk9PmkoeSx5LmRpc2FibGVkP1wiZGlzYWJsZWRcIjpwP1wiYWN0aXZlXCI6XCJpbmFjdGl2ZVwiKX0pLmpvaW4oYFxuJHtjfWApfVxuJHthfVxuYH19fX0pLnByb21wdCgpfSxJdD1lPT57Y29uc3QgaT0ocyxyPVwiaW5hY3RpdmVcIik9Pntjb25zdCB1PXMubGFiZWw/P1N0cmluZyhzLnZhbHVlKTtyZXR1cm4gcj09PVwic2VsZWN0ZWRcIj9gJHt0KFwiZGltXCIsdSl9YDpyPT09XCJjYW5jZWxsZWRcIj9gJHt0KFtcInN0cmlrZXRocm91Z2hcIixcImRpbVwiXSx1KX1gOnI9PT1cImFjdGl2ZVwiP2Ake3QoW1wiYmdDeWFuXCIsXCJncmF5XCJdLGAgJHtzLnZhbHVlfSBgKX0gJHt1fSR7cy5oaW50P2AgJHt0KFwiZGltXCIsYCgke3MuaGludH0pYCl9YDpcIlwifWA6YCR7dChbXCJncmF5XCIsXCJiZ1doaXRlXCIsXCJpbnZlcnNlXCJdLGAgJHtzLnZhbHVlfSBgKX0gJHt1fSR7cy5oaW50P2AgJHt0KFwiZGltXCIsYCgke3MuaGludH0pYCl9YDpcIlwifWB9O3JldHVybiBuZXcgSmUoe29wdGlvbnM6ZS5vcHRpb25zLHNpZ25hbDplLnNpZ25hbCxpbnB1dDplLmlucHV0LG91dHB1dDplLm91dHB1dCxpbml0aWFsVmFsdWU6ZS5pbml0aWFsVmFsdWUsY2FzZVNlbnNpdGl2ZTplLmNhc2VTZW5zaXRpdmUscmVuZGVyKCl7Y29uc3Qgcz1lLndpdGhHdWlkZT8/SS53aXRoR3VpZGUscj1gJHtzP2Ake3QoXCJncmF5XCIsZCl9XG5gOlwiXCJ9JHtWKHRoaXMuc3RhdGUpfSAgJHtlLm1lc3NhZ2V9XG5gO3N3aXRjaCh0aGlzLnN0YXRlKXtjYXNlXCJzdWJtaXRcIjp7Y29uc3QgdT1zP2Ake3QoXCJncmF5XCIsZCl9ICBgOlwiXCIsbj10aGlzLm9wdGlvbnMuZmluZChjPT5jLnZhbHVlPT09dGhpcy52YWx1ZSk/P2Uub3B0aW9uc1swXSxvPU4oZS5vdXRwdXQsaShuLFwic2VsZWN0ZWRcIiksdSk7cmV0dXJuYCR7cn0ke299YH1jYXNlXCJjYW5jZWxcIjp7Y29uc3QgdT1zP2Ake3QoXCJncmF5XCIsZCl9ICBgOlwiXCIsbj1OKGUub3V0cHV0LGkodGhpcy5vcHRpb25zWzBdLFwiY2FuY2VsbGVkXCIpLHUpO3JldHVybmAke3J9JHtufSR7cz9gXG4ke3QoXCJncmF5XCIsZCl9YDpcIlwifWB9ZGVmYXVsdDp7Y29uc3QgdT1zP2Ake3QoXCJjeWFuXCIsZCl9ICBgOlwiXCIsbj1zP3QoXCJjeWFuXCIsRSk6XCJcIixvPXRoaXMub3B0aW9ucy5tYXAoKGMsYSk9Pk4oZS5vdXRwdXQsaShjLGE9PT10aGlzLmN1cnNvcj9cImFjdGl2ZVwiOlwiaW5hY3RpdmVcIiksdSkpLmpvaW4oYFxuYCk7cmV0dXJuYCR7cn0ke299XG4ke259XG5gfX19fSkucHJvbXB0KCl9LGplPWAke3QoXCJncmF5XCIsZCl9ICBgLEs9e21lc3NhZ2U6YXN5bmMoZSx7c3ltYm9sOmk9dChcImdyYXlcIixkKX09e30pPT57cHJvY2Vzcy5zdGRvdXQud3JpdGUoYCR7dChcImdyYXlcIixkKX1cbiR7aX0gIGApO2xldCBzPTM7Zm9yIGF3YWl0KGxldCByIG9mIGUpe3I9ci5yZXBsYWNlKC9cXG4vZyxgXG4ke2plfWApLHIuaW5jbHVkZXMoYFxuYCkmJihzPTMrbmUoci5zbGljZShyLmxhc3RJbmRleE9mKGBcbmApKSkubGVuZ3RoKTtjb25zdCB1PW5lKHIpLmxlbmd0aDtzK3U8cHJvY2Vzcy5zdGRvdXQuY29sdW1ucz8ocys9dSxwcm9jZXNzLnN0ZG91dC53cml0ZShyKSk6KHByb2Nlc3Muc3Rkb3V0LndyaXRlKGBcbiR7amV9JHtyLnRyaW1TdGFydCgpfWApLHM9MytuZShyLnRyaW1TdGFydCgpKS5sZW5ndGgpfXByb2Nlc3Muc3Rkb3V0LndyaXRlKGBcbmApfSxpbmZvOmU9PksubWVzc2FnZShlLHtzeW1ib2w6dChcImJsdWVcIixoZSl9KSxzdWNjZXNzOmU9PksubWVzc2FnZShlLHtzeW1ib2w6dChcImdyZWVuXCIscGUpfSksc3RlcDplPT5LLm1lc3NhZ2UoZSx7c3ltYm9sOnQoXCJncmVlblwiLEYpfSksd2FybjplPT5LLm1lc3NhZ2UoZSx7c3ltYm9sOnQoXCJ5ZWxsb3dcIixtZSl9KSx3YXJuaW5nOmU9Pksud2FybihlKSxlcnJvcjplPT5LLm1lc3NhZ2UoZSx7c3ltYm9sOnQoXCJyZWRcIixnZSl9KX0sRXQ9YXN5bmMoZSxpKT0+e2Zvcihjb25zdCBzIG9mIGUpe2lmKHMuZW5hYmxlZD09PSExKWNvbnRpbnVlO2NvbnN0IHI9ZmUoaSk7ci5zdGFydChzLnRpdGxlKTtjb25zdCB1PWF3YWl0IHMudGFzayhyLm1lc3NhZ2UpO3Iuc3RvcCh1fHxzLnRpdGxlKX19LHh0PWU9PmUucmVwbGFjZSgvXFx4MWJcXFsoPzpcXGQrOykqXFxkKltBQkNERUZHSGZKS1NUc3VdfFxceDFiXFxbKHN8dSkvZyxcIlwiKSxHdD1lPT57Y29uc3QgaT1lLm91dHB1dD8/cHJvY2Vzcy5zdGRvdXQscz1YKGkpLHI9dChcImdyYXlcIixkKSx1PWUuc3BhY2luZz8/MSxuPTMsbz1lLnJldGFpbkxvZz09PSEwLGM9IWFlKCkmJlRlKGkpO2kud3JpdGUoYCR7cn1cbmApLGkud3JpdGUoYCR7dChcImdyZWVuXCIsRil9ICAke2UudGl0bGV9XG5gKTtmb3IobGV0IGg9MDtoPHU7aCsrKWkud3JpdGUoYCR7cn1cbmApO2NvbnN0IGE9W3t2YWx1ZTpcIlwiLGZ1bGw6XCJcIn1dO2xldCBsPSExO2NvbnN0ICQ9aD0+e2lmKGEubGVuZ3RoPT09MClyZXR1cm47bGV0IGY9MDtoJiYoZis9dSsyKTtmb3IoY29uc3QgdiBvZiBhKXtjb25zdHt2YWx1ZTpULHJlc3VsdDpDfT12O2xldCBiPUM/Lm1lc3NhZ2U/P1Q7aWYoYi5sZW5ndGg9PT0wKWNvbnRpbnVlO0M9PT12b2lkIDAmJnYuaGVhZGVyIT09dm9pZCAwJiZ2LmhlYWRlciE9PVwiXCImJihiKz1gXG4ke3YuaGVhZGVyfWApO2NvbnN0IHg9Yi5zcGxpdChgXG5gKS5yZWR1Y2UoKEcsTSk9Pk09PT1cIlwiP0crMTpHK01hdGguY2VpbCgoTS5sZW5ndGgrbikvcyksMCk7Zis9eH1mPjAmJihmKz0xLGkud3JpdGUoQ2UubGluZXMoZikpKX0seT0oaCxmLHYpPT57Y29uc3QgVD12P2Ake2guZnVsbH1cbiR7aC52YWx1ZX1gOmgudmFsdWU7aC5oZWFkZXIhPT12b2lkIDAmJmguaGVhZGVyIT09XCJcIiYmTy5tZXNzYWdlKGguaGVhZGVyLnNwbGl0KGBcbmApLm1hcChDPT50KFwiYm9sZFwiLEMpKSx7b3V0cHV0Omksc2Vjb25kYXJ5U3ltYm9sOnIsc3ltYm9sOnIsc3BhY2luZzowfSksTy5tZXNzYWdlKFQuc3BsaXQoYFxuYCkubWFwKEM9PnQoXCJkaW1cIixDKSkse291dHB1dDppLHNlY29uZGFyeVN5bWJvbDpyLHN5bWJvbDpyLHNwYWNpbmc6Zj8/dX0pfSxwPSgpPT57Zm9yKGNvbnN0IGggb2YgYSl7Y29uc3R7aGVhZGVyOmYsdmFsdWU6dixmdWxsOlR9PWg7KGY9PT12b2lkIDB8fGYubGVuZ3RoPT09MCkmJnYubGVuZ3RoPT09MHx8eShoLHZvaWQgMCxvPT09ITAmJlQubGVuZ3RoPjApfX0sbT0oaCxmLHYpPT57aWYoJCghMSksKHY/LnJhdyE9PSEwfHwhbCkmJmgudmFsdWUhPT1cIlwiJiYoaC52YWx1ZSs9YFxuYCksaC52YWx1ZSs9eHQoZiksbD12Py5yYXc9PT0hMCxlLmxpbWl0IT09dm9pZCAwKXtjb25zdCBUPWgudmFsdWUuc3BsaXQoYFxuYCksQz1ULmxlbmd0aC1lLmxpbWl0O2lmKEM+MCl7Y29uc3QgYj1ULnNwbGljZSgwLEMpO28mJihoLmZ1bGwrPShoLmZ1bGw9PT1cIlwiP1wiXCI6YFxuYCkrYi5qb2luKGBcbmApKX1oLnZhbHVlPVQuam9pbihgXG5gKX1jJiZnKCl9LGc9KCk9Pntmb3IoY29uc3QgaCBvZiBhKWgucmVzdWx0P2gucmVzdWx0LnN0YXR1cz09PVwiZXJyb3JcIj9PLmVycm9yKGgucmVzdWx0Lm1lc3NhZ2Use291dHB1dDppLHNlY29uZGFyeVN5bWJvbDpyLHNwYWNpbmc6MH0pOk8uc3VjY2VzcyhoLnJlc3VsdC5tZXNzYWdlLHtvdXRwdXQ6aSxzZWNvbmRhcnlTeW1ib2w6cixzcGFjaW5nOjB9KTpoLnZhbHVlIT09XCJcIiYmeShoLDApfSxTPShoLGYpPT57JCghMSksaC5yZXN1bHQ9ZixjJiZnKCl9O3JldHVybnttZXNzYWdlKGgsZil7bShhWzBdLGgsZil9LGdyb3VwKGgpe2NvbnN0IGY9e2hlYWRlcjpoLHZhbHVlOlwiXCIsZnVsbDpcIlwifTtyZXR1cm4gYS5wdXNoKGYpLHttZXNzYWdlKHYsVCl7bShmLHYsVCl9LGVycm9yKHYpe1MoZix7c3RhdHVzOlwiZXJyb3JcIixtZXNzYWdlOnZ9KX0sc3VjY2Vzcyh2KXtTKGYse3N0YXR1czpcInN1Y2Nlc3NcIixtZXNzYWdlOnZ9KX19fSxlcnJvcihoLGYpeyQoITApLE8uZXJyb3IoaCx7b3V0cHV0Omksc2Vjb25kYXJ5U3ltYm9sOnIsc3BhY2luZzoxfSksZj8uc2hvd0xvZyE9PSExJiZwKCksYS5zcGxpY2UoMSxhLmxlbmd0aC0xKSxhWzBdLnZhbHVlPVwiXCIsYVswXS5mdWxsPVwiXCJ9LHN1Y2Nlc3MoaCxmKXskKCEwKSxPLnN1Y2Nlc3MoaCx7b3V0cHV0Omksc2Vjb25kYXJ5U3ltYm9sOnIsc3BhY2luZzoxfSksZj8uc2hvd0xvZz09PSEwJiZwKCksYS5zcGxpY2UoMSxhLmxlbmd0aC0xKSxhWzBdLnZhbHVlPVwiXCIsYVswXS5mdWxsPVwiXCJ9fX0sT3Q9ZT0+bmV3IFllKHt2YWxpZGF0ZTplLnZhbGlkYXRlLHBsYWNlaG9sZGVyOmUucGxhY2Vob2xkZXIsZGVmYXVsdFZhbHVlOmUuZGVmYXVsdFZhbHVlLGluaXRpYWxWYWx1ZTplLmluaXRpYWxWYWx1ZSxvdXRwdXQ6ZS5vdXRwdXQsc2lnbmFsOmUuc2lnbmFsLGlucHV0OmUuaW5wdXQscmVuZGVyKCl7Y29uc3QgaT1lPy53aXRoR3VpZGU/P0kud2l0aEd1aWRlLHM9YCR7YCR7aT9gJHt0KFwiZ3JheVwiLGQpfVxuYDpcIlwifSR7Vih0aGlzLnN0YXRlKX0gIGB9JHtlLm1lc3NhZ2V9XG5gLHI9ZS5wbGFjZWhvbGRlcj90KFwiaW52ZXJzZVwiLGUucGxhY2Vob2xkZXJbMF0pK3QoXCJkaW1cIixlLnBsYWNlaG9sZGVyLnNsaWNlKDEpKTp0KFtcImludmVyc2VcIixcImhpZGRlblwiXSxcIl9cIiksdT10aGlzLnVzZXJJbnB1dD90aGlzLnVzZXJJbnB1dFdpdGhDdXJzb3I6cixuPXRoaXMudmFsdWU/P1wiXCI7c3dpdGNoKHRoaXMuc3RhdGUpe2Nhc2VcImVycm9yXCI6e2NvbnN0IG89dGhpcy5lcnJvcj9gICAke3QoXCJ5ZWxsb3dcIix0aGlzLmVycm9yKX1gOlwiXCIsYz1pP2Ake3QoXCJ5ZWxsb3dcIixkKX0gIGA6XCJcIixhPWk/dChcInllbGxvd1wiLEUpOlwiXCI7cmV0dXJuYCR7cy50cmltKCl9XG4ke2N9JHt1fVxuJHthfSR7b31cbmB9Y2FzZVwic3VibWl0XCI6e2NvbnN0IG89bj9gICAke3QoXCJkaW1cIixuKX1gOlwiXCIsYz1pP3QoXCJncmF5XCIsZCk6XCJcIjtyZXR1cm5gJHtzfSR7Y30ke299YH1jYXNlXCJjYW5jZWxcIjp7Y29uc3Qgbz1uP2AgICR7dChbXCJzdHJpa2V0aHJvdWdoXCIsXCJkaW1cIl0sbil9YDpcIlwiLGM9aT90KFwiZ3JheVwiLGQpOlwiXCI7cmV0dXJuYCR7c30ke2N9JHtvfSR7bi50cmltKCk/YFxuJHtjfWA6XCJcIn1gfWRlZmF1bHQ6e2NvbnN0IG89aT9gJHt0KFwiY3lhblwiLGQpfSAgYDpcIlwiLGM9aT90KFwiY3lhblwiLEUpOlwiXCI7cmV0dXJuYCR7c30ke299JHt1fVxuJHtjfVxuYH19fX0pLnByb21wdCgpO2V4cG9ydHtkIGFzIFNfQkFSLEUgYXMgU19CQVJfRU5ELEVlIGFzIFNfQkFSX0VORF9SSUdIVCxzZSBhcyBTX0JBUl9ILGxlIGFzIFNfQkFSX1NUQVJULEllIGFzIFNfQkFSX1NUQVJUX1JJR0hULHRlIGFzIFNfQ0hFQ0tCT1hfQUNUSVZFLEogYXMgU19DSEVDS0JPWF9JTkFDVElWRSxVIGFzIFNfQ0hFQ0tCT1hfU0VMRUNURUQsR2UgYXMgU19DT05ORUNUX0xFRlQsZGUgYXMgU19DT1JORVJfQk9UVE9NX0xFRlQsJGUgYXMgU19DT1JORVJfQk9UVE9NX1JJR0hULE9lIGFzIFNfQ09STkVSX1RPUF9MRUZULGNlIGFzIFNfQ09STkVSX1RPUF9SSUdIVCxnZSBhcyBTX0VSUk9SLGhlIGFzIFNfSU5GTyx4ZSBhcyBTX1BBU1NXT1JEX01BU0sseiBhcyBTX1JBRElPX0FDVElWRSxIIGFzIFNfUkFESU9fSU5BQ1RJVkUsX2UgYXMgU19TVEVQX0FDVElWRSxvZSBhcyBTX1NURVBfQ0FOQ0VMLHVlIGFzIFNfU1RFUF9FUlJPUixGIGFzIFNfU1RFUF9TVUJNSVQscGUgYXMgU19TVUNDRVNTLG1lIGFzIFNfV0FSTixBZSBhcyBhdXRvY29tcGxldGUsc3QgYXMgYXV0b2NvbXBsZXRlTXVsdGlzZWxlY3QsYXQgYXMgYm94LHB0IGFzIGNhbmNlbCxvdCBhcyBjb25maXJtLHV0IGFzIGRhdGUsZHQgYXMgZ3JvdXAsaHQgYXMgZ3JvdXBNdWx0aXNlbGVjdCxtdCBhcyBpbnRybyxhZSBhcyBpc0NJLFRlIGFzIGlzVFRZLFkgYXMgbGltaXRPcHRpb25zLE8gYXMgbG9nLHl0IGFzIG11bHRpc2VsZWN0LHd0IGFzIG5vdGUsZ3QgYXMgb3V0cm8sYnQgYXMgcGFzc3dvcmQsU3QgYXMgcGF0aCxUdCBhcyBwcm9ncmVzcyxfdCBhcyBzZWxlY3QsSXQgYXMgc2VsZWN0S2V5LGZlIGFzIHNwaW5uZXIsSyBhcyBzdHJlYW0sViBhcyBzeW1ib2wseWUgYXMgc3ltYm9sQmFyLEd0IGFzIHRhc2tMb2csRXQgYXMgdGFza3MsT3QgYXMgdGV4dCxlZSBhcyB1bmljb2RlLHcgYXMgdW5pY29kZU9yfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4Lm1qcy5tYXBcbiIsCiAgICAiLyoqXG4gKiBPcGVuQ29kZSBTREsgQmFja2VuZCBXcmFwcGVyXG4gKlxuICogUHJvdmlkZXMgc2Vzc2lvbiBtYW5hZ2VtZW50IGFuZCBtZXNzYWdlIHNlbmRpbmcgY2FwYWJpbGl0aWVzXG4gKiBmb3IgYWktZW5nIHJhbHBoIHJ1bm5lciB1c2luZyBPcGVuQ29kZSBTREsuXG4gKi9cblxuaW1wb3J0IHsgY3JlYXRlU2VydmVyIH0gZnJvbSBcIm5vZGU6bmV0XCI7XG5pbXBvcnQge1xuICAgIHR5cGUgT3BlbmNvZGVDbGllbnQsXG4gICAgY3JlYXRlT3BlbmNvZGUsXG4gICAgY3JlYXRlT3BlbmNvZGVDbGllbnQsXG59IGZyb20gXCJAb3BlbmNvZGUtYWkvc2RrXCI7XG5pbXBvcnQgeyBMb2cgfSBmcm9tIFwiLi4vLi4vdXRpbC9sb2dcIjtcblxuY29uc3QgbG9nID0gTG9nLmNyZWF0ZSh7IHNlcnZpY2U6IFwib3BlbmNvZGUtY2xpZW50XCIgfSk7XG5cbi8qKlxuICogUmVzcG9uc2UgaW50ZXJmYWNlIGZvciBtZXNzYWdlc1xuICovXG5leHBvcnQgaW50ZXJmYWNlIE1lc3NhZ2VSZXNwb25zZSB7XG4gICAgY29udGVudDogc3RyaW5nO1xufVxuXG4vKipcbiAqIFN0cmVhbWluZyByZXNwb25zZSBpbnRlcmZhY2VcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTdHJlYW1pbmdSZXNwb25zZSB7XG4gICAgLyoqIFJlYWRhYmxlIHN0cmVhbSBvZiByZXNwb25zZSBjaHVua3MgKi9cbiAgICBzdHJlYW06IFJlYWRhYmxlU3RyZWFtPFVpbnQ4QXJyYXk+O1xuICAgIC8qKiBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gY29tcGxldGUgcmVzcG9uc2Ugd2hlbiBzdHJlYW0gZW5kcyAqL1xuICAgIGNvbXBsZXRlOiBQcm9taXNlPE1lc3NhZ2VSZXNwb25zZT47XG59XG5cbi8qKlxuICogU2Vzc2lvbiBpbnRlcmZhY2UgZm9yIGFpLWVuZyBydW5uZXJcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTZXNzaW9uIHtcbiAgICBpZDogc3RyaW5nO1xuICAgIHNlbmRNZXNzYWdlOiAobWVzc2FnZTogc3RyaW5nKSA9PiBQcm9taXNlPE1lc3NhZ2VSZXNwb25zZT47XG4gICAgc2VuZE1lc3NhZ2VTdHJlYW06IChtZXNzYWdlOiBzdHJpbmcpID0+IFByb21pc2U8U3RyZWFtaW5nUmVzcG9uc2U+O1xuICAgIGNsb3NlOiAoKSA9PiBQcm9taXNlPHZvaWQ+O1xuICAgIC8qKiBUb29sIGludm9jYXRpb25zIGNhcHR1cmVkIGR1cmluZyB0aGlzIHNlc3Npb24gKi9cbiAgICBfdG9vbEludm9jYXRpb25zPzogQXJyYXk8e1xuICAgICAgICBpZDogc3RyaW5nO1xuICAgICAgICBuYW1lOiBzdHJpbmc7XG4gICAgICAgIGlucHV0PzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgICAgIG91dHB1dD86IHN0cmluZztcbiAgICAgICAgc3RhdHVzOiBcIm9rXCIgfCBcImVycm9yXCI7XG4gICAgICAgIGVycm9yPzogc3RyaW5nO1xuICAgICAgICBzdGFydGVkQXQ/OiBzdHJpbmc7XG4gICAgICAgIGNvbXBsZXRlZEF0Pzogc3RyaW5nO1xuICAgIH0+O1xufVxuXG4vKipcbiAqIENsaWVudCBjb25maWd1cmF0aW9uIG9wdGlvbnNcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDbGllbnRDb25maWcge1xuICAgIC8qKiBDdXN0b20gY2xpZW50IGluc3RhbmNlIChmb3IgdGVzdGluZykgKi9cbiAgICBjbGllbnQ/OiBPcGVuY29kZUNsaWVudDtcbiAgICAvKiogQ29ubmVjdGlvbiB0aW1lb3V0IGluIG1pbGxpc2Vjb25kcyAoZGVmYXVsdDogMTAwMDApICovXG4gICAgdGltZW91dD86IG51bWJlcjtcbiAgICAvKiogUmV0cnkgYXR0ZW1wdHMgZm9yIGZhaWxlZCBvcGVyYXRpb25zICovXG4gICAgcmV0cnlBdHRlbXB0cz86IG51bWJlcjtcbiAgICAvKiogUHJvbXB0IHRpbWVvdXQgaW4gbWlsbGlzZWNvbmRzICh1c2VkIGFzIGFuIGlkbGUgdGltZW91dCBmb3Igc3RyZWFtaW5nKSAqL1xuICAgIHByb21wdFRpbWVvdXQ/OiBudW1iZXI7XG4gICAgLyoqIERpcmVjdG9yeS93b3JrdHJlZSBjb250ZXh0IHRvIHJ1biBPcGVuQ29kZSBpbiAoZGVmYXVsdHMgdG8gcHJvY2Vzcy5jd2QoKSkgKi9cbiAgICBkaXJlY3Rvcnk/OiBzdHJpbmc7XG4gICAgLyoqIFVSTCBvZiBleGlzdGluZyBPcGVuQ29kZSBzZXJ2ZXIgdG8gcmV1c2UgKGlmIHByb3ZpZGVkLCB3b24ndCBzcGF3biBuZXcgc2VydmVyKSAqL1xuICAgIGV4aXN0aW5nU2VydmVyVXJsPzogc3RyaW5nO1xuICAgIC8qKiBTZXJ2ZXIgc3RhcnR1cCB0aW1lb3V0IGluIG1pbGxpc2Vjb25kcyAoZGVmYXVsdDogMTAwMDApICovXG4gICAgc2VydmVyU3RhcnR1cFRpbWVvdXQ/OiBudW1iZXI7XG4gICAgLyoqIE5PVEU6IHdvcmtpbmdEaXIgcGFyYW1ldGVyIGlzIG5vdCBzdXBwb3J0ZWQgYnkgdGhlIFNES1xuICAgICAqIFNwYXduZWQgT3BlbkNvZGUgc2VydmVycyB3aWxsIHVzZSB0aGUgY2FsbGluZyBkaXJlY3RvcnkgYnkgZGVmYXVsdCAocHJvY2Vzcy5jd2QoKSlcbiAgICAgKiBVc2UgT1BFTkNPREVfVVJMIHRvIGNvbm5lY3QgdG8gYSBkaWZmZXJlbnQgT3BlbkNvZGUgaW5zdGFuY2UgaW5zdGVhZFxuICAgICAqL1xufVxuXG4vKipcbiAqIE9wZW5Db2RlIENsaWVudCBXcmFwcGVyXG4gKlxuICogV3JhcHMgT3BlbkNvZGUgU0RLIHRvIHByb3ZpZGUgc2Vzc2lvbiBtYW5hZ2VtZW50XG4gKiBhbmQgZXJyb3IgaGFuZGxpbmcgZm9yIHJhbHBoIHJ1bm5lci5cbiAqL1xuZXhwb3J0IGNsYXNzIE9wZW5Db2RlQ2xpZW50IHtcbiAgICBwcml2YXRlIGNsaWVudDogT3BlbmNvZGVDbGllbnQ7XG4gICAgcHJpdmF0ZSB0aW1lb3V0OiBudW1iZXI7XG4gICAgcHJpdmF0ZSByZXRyeUF0dGVtcHRzOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBhY3RpdmVTZXNzaW9uczogTWFwPHN0cmluZywgU2Vzc2lvbj47XG4gICAgcHJpdmF0ZSBwcm9tcHRUaW1lb3V0OiBudW1iZXI7XG4gICAgcHJpdmF0ZSBkaXJlY3Rvcnk6IHN0cmluZyA9IHByb2Nlc3MuY3dkKCk7XG4gICAgcHJpdmF0ZSBzZXJ2ZXI6IHsgdXJsOiBzdHJpbmc7IGNsb3NlOiAoKSA9PiB2b2lkIH0gfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIHNlcnZlclN0YXJ0dXBUaW1lb3V0OiBudW1iZXI7XG5cbiAgICAvKipcbiAgICAgKiBQcml2YXRlIGNvbnN0cnVjdG9yIC0gdXNlIHN0YXRpYyBjcmVhdGUoKSBmYWN0b3J5IG1ldGhvZCBpbnN0ZWFkXG4gICAgICovXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihcbiAgICAgICAgY2xpZW50OiBPcGVuY29kZUNsaWVudCxcbiAgICAgICAgc2VydmVyOiB7IHVybDogc3RyaW5nOyBjbG9zZTogKCkgPT4gdm9pZCB9IHwgbnVsbCxcbiAgICAgICAgY29uZmlnOiBDbGllbnRDb25maWcgPSB7fSxcbiAgICApIHtcbiAgICAgICAgdGhpcy5jbGllbnQgPSBjbGllbnQ7XG4gICAgICAgIHRoaXMuc2VydmVyID0gc2VydmVyO1xuICAgICAgICB0aGlzLnRpbWVvdXQgPSBjb25maWcudGltZW91dCB8fCAzMDAwMDtcbiAgICAgICAgdGhpcy5yZXRyeUF0dGVtcHRzID0gY29uZmlnLnJldHJ5QXR0ZW1wdHMgfHwgMztcblxuICAgICAgICBjb25zdCBlbnZQcm9tcHRUaW1lb3V0ID0gTnVtYmVyLnBhcnNlSW50KFxuICAgICAgICAgICAgcHJvY2Vzcy5lbnYuT1BFTkNPREVfUFJPTVBUX1RJTUVPVVRfTVMgPz8gXCJcIixcbiAgICAgICAgICAgIDEwLFxuICAgICAgICApO1xuICAgICAgICBjb25zdCByZXNvbHZlZFByb21wdFRpbWVvdXQgPSBOdW1iZXIuaXNGaW5pdGUoZW52UHJvbXB0VGltZW91dClcbiAgICAgICAgICAgID8gZW52UHJvbXB0VGltZW91dFxuICAgICAgICAgICAgOiB1bmRlZmluZWQ7XG5cbiAgICAgICAgLy8gRm9yIHN0cmVhbWluZywgdGhpcyBhY3RzIGFzIGFuIGlkbGUgdGltZW91dCAocmVzZXQgb24gc3RyZWFtZWQgZXZlbnRzKVxuICAgICAgICB0aGlzLnByb21wdFRpbWVvdXQgPVxuICAgICAgICAgICAgY29uZmlnLnByb21wdFRpbWVvdXQgPz8gcmVzb2x2ZWRQcm9tcHRUaW1lb3V0ID8/IDEyMDAwMDsgLy8gMTIwIHNlY29uZHMgZGVmYXVsdFxuXG4gICAgICAgIHRoaXMuZGlyZWN0b3J5ID1cbiAgICAgICAgICAgIGNvbmZpZy5kaXJlY3RvcnkgfHwgcHJvY2Vzcy5lbnYuT1BFTkNPREVfRElSRUNUT1JZIHx8IHByb2Nlc3MuY3dkKCk7XG5cbiAgICAgICAgdGhpcy5zZXJ2ZXJTdGFydHVwVGltZW91dCA9IGNvbmZpZy5zZXJ2ZXJTdGFydHVwVGltZW91dCB8fCAxMDAwMDsgLy8gMTAgc2Vjb25kcyBkZWZhdWx0XG4gICAgICAgIHRoaXMuYWN0aXZlU2Vzc2lvbnMgPSBuZXcgTWFwKCk7XG5cbiAgICAgICAgbG9nLmRlYnVnKFwiT3BlbkNvZGVDbGllbnQgaW5pdGlhbGl6ZWRcIiwge1xuICAgICAgICAgICAgaGFzT3duU2VydmVyOiAhIXRoaXMuc2VydmVyLFxuICAgICAgICAgICAgdGltZW91dDogdGhpcy50aW1lb3V0LFxuICAgICAgICAgICAgc2VydmVyU3RhcnR1cFRpbWVvdXQ6IHRoaXMuc2VydmVyU3RhcnR1cFRpbWVvdXQsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBhbiBhdmFpbGFibGUgcG9ydCBmb3IgT3BlbkNvZGUgc2VydmVyXG4gICAgICpcbiAgICAgKiBJTVBPUlRBTlQ6IEFsd2F5cyBhdm9pZCBwb3J0IDQwOTYgdG8gcHJldmVudCBjb25mbGljdHMgd2l0aCB1c2VyJ3MgZXhpc3Rpbmcgc2VydmVyXG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgYXN5bmMgZ2V0QXZhaWxhYmxlUG9ydCgpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgZGVmYXVsdCBwb3J0IGlzIGluIHVzZSBhbmQgbG9nIGFjY29yZGluZ2x5XG4gICAgICAgICAgICBjb25zdCBkZWZhdWx0UG9ydCA9IDQwOTY7XG4gICAgICAgICAgICBjb25zdCBpc0RlZmF1bHRBdmFpbGFibGUgPVxuICAgICAgICAgICAgICAgIGF3YWl0IE9wZW5Db2RlQ2xpZW50LmlzUG9ydEF2YWlsYWJsZShkZWZhdWx0UG9ydCk7XG5cbiAgICAgICAgICAgIGlmICghaXNEZWZhdWx0QXZhaWxhYmxlKSB7XG4gICAgICAgICAgICAgICAgbG9nLmluZm8oXG4gICAgICAgICAgICAgICAgICAgIFwiRXhpc3Rpbmcgc2VydmVyIGRldGVjdGVkIG9uIHBvcnQgNDA5Njsgc3Bhd25pbmcgaXNvbGF0ZWQgc2VydmVyIG9uIGR5bmFtaWMgcG9ydFwiLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcbiAgICAgICAgICAgICAgICAgICAgXCJEZWZhdWx0IHBvcnQgNDA5NiBpcyBhdmFpbGFibGUgYnV0IGF2b2lkaW5nIGl0IGZvciBpc29sYXRpb25cIixcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBBbHdheXMgdXNlIGR5bmFtaWMgcG9ydCB0byBhdm9pZCBjb25mbGljdHMgd2l0aCB1c2VyJ3MgZXhpc3Rpbmcgc2VydmVyXG4gICAgICAgICAgICBjb25zdCBkeW5hbWljUG9ydCA9IGF3YWl0IE9wZW5Db2RlQ2xpZW50LmZpbmRBdmFpbGFibGVQb3J0KCk7XG4gICAgICAgICAgICBsb2cuaW5mbyhcbiAgICAgICAgICAgICAgICBgU3Bhd25pbmcgaXNvbGF0ZWQgc2VydmVyIG9uIGR5bmFtaWMgcG9ydDogJHtkeW5hbWljUG9ydH1gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHJldHVybiBkeW5hbWljUG9ydDtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTXNnID1cbiAgICAgICAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgICAgICBsb2cuZXJyb3IoXCJGYWlsZWQgdG8gc2VsZWN0IE9wZW5Db2RlIHNlcnZlciBwb3J0XCIsIHtcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JNc2csXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICBgRmFpbGVkIHRvIHNlbGVjdCBPcGVuQ29kZSBzZXJ2ZXIgcG9ydDogJHtlcnJvck1zZ31gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGEgc3BlY2lmaWMgcG9ydCBpcyBhdmFpbGFibGVcbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBhc3luYyBpc1BvcnRBdmFpbGFibGUocG9ydDogbnVtYmVyKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc2VydmVyID0gY3JlYXRlU2VydmVyKCk7XG5cbiAgICAgICAgICAgIHNlcnZlci5saXN0ZW4ocG9ydCwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHNlcnZlci5vbmNlKFwiY2xvc2VcIiwgKCkgPT4gcmVzb2x2ZSh0cnVlKSk7XG4gICAgICAgICAgICAgICAgc2VydmVyLmNsb3NlKCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc2VydmVyLm9uKFwiZXJyb3JcIiwgKCkgPT4gcmVzb2x2ZShmYWxzZSkpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGaW5kIGFuIGF2YWlsYWJsZSBwb3J0IGR5bmFtaWNhbGx5XG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgYXN5bmMgZmluZEF2YWlsYWJsZVBvcnQoKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNlcnZlciA9IGNyZWF0ZVNlcnZlcigpO1xuXG4gICAgICAgICAgICBzZXJ2ZXIubGlzdGVuKDAsICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBhZGRyZXNzID0gc2VydmVyLmFkZHJlc3MoKTtcbiAgICAgICAgICAgICAgICBpZiAoYWRkcmVzcyAmJiB0eXBlb2YgYWRkcmVzcyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgICAgICAgICBzZXJ2ZXIub25jZShcImNsb3NlXCIsICgpID0+IHJlc29sdmUoYWRkcmVzcy5wb3J0KSk7XG4gICAgICAgICAgICAgICAgICAgIHNlcnZlci5jbG9zZSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoXCJGYWlsZWQgdG8gZ2V0IHNlcnZlciBhZGRyZXNzXCIpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc2VydmVyLm9uKFwiZXJyb3JcIiwgcmVqZWN0KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU3RhdGljIGZhY3RvcnkgbWV0aG9kIHRvIGNyZWF0ZSBhbiBPcGVuQ29kZUNsaWVudFxuICAgICAqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBjbGllbnQgd2l0aCBlaXRoZXI6XG4gICAgICogMS4gQSBmcmVzaCBPcGVuQ29kZSBzZXJ2ZXIgKGRlZmF1bHQgYmVoYXZpb3IpXG4gICAgICogMi4gQW4gZXhpc3Rpbmcgc2VydmVyIFVSTCAoaWYgZXhpc3RpbmdTZXJ2ZXJVcmwgaXMgcHJvdmlkZWQpXG4gICAgICogMy4gQSBjdXN0b20gY2xpZW50IGluc3RhbmNlIChmb3IgdGVzdGluZylcbiAgICAgKlxuICAgICAqIE5vdGU6IFNwYXduZWQgT3BlbkNvZGUgc2VydmVycyB3aWxsIHVzZSB0byBjYWxsaW5nIGRpcmVjdG9yeSBieSBkZWZhdWx0IChwcm9jZXNzLmN3ZCgpKVxuICAgICAqIFVzZSBPUEVOQ09ERV9VUkwgdG8gY29ubmVjdCB0byBhIGRpZmZlcmVudCBPcGVuQ29kZSBpbnN0YW5jZVxuICAgICAqL1xuICAgIHN0YXRpYyBhc3luYyBjcmVhdGUoY29uZmlnOiBDbGllbnRDb25maWcgPSB7fSk6IFByb21pc2U8T3BlbkNvZGVDbGllbnQ+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIElmIGN1c3RvbSBjbGllbnQgcHJvdmlkZWQgKGZvciB0ZXN0aW5nKSwgdXNlIGl0IGRpcmVjdGx5XG4gICAgICAgICAgICBpZiAoY29uZmlnLmNsaWVudCkge1xuICAgICAgICAgICAgICAgIGxvZy5pbmZvKFwiQ3JlYXRpbmcgT3BlbkNvZGVDbGllbnQgd2l0aCBjdXN0b20gY2xpZW50IGluc3RhbmNlXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgT3BlbkNvZGVDbGllbnQoY29uZmlnLmNsaWVudCwgbnVsbCwgY29uZmlnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gSWYgZXhpc3Rpbmcgc2VydmVyIFVSTCBwcm92aWRlZCwgY29ubmVjdCB0byBpdFxuICAgICAgICAgICAgaWYgKGNvbmZpZy5leGlzdGluZ1NlcnZlclVybCkge1xuICAgICAgICAgICAgICAgIGxvZy5pbmZvKFwiQ29ubmVjdGluZyB0byBleGlzdGluZyBPcGVuQ29kZSBzZXJ2ZXJcIiwge1xuICAgICAgICAgICAgICAgICAgICB1cmw6IGNvbmZpZy5leGlzdGluZ1NlcnZlclVybCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjbGllbnQgPSBjcmVhdGVPcGVuY29kZUNsaWVudCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXNlVXJsOiBjb25maWcuZXhpc3RpbmdTZXJ2ZXJVcmwsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFZlcmlmeSBjb25uZWN0aW9uIGJ5IG1ha2luZyBhIHRlc3QgcmVxdWVzdFxuICAgICAgICAgICAgICAgICAgICBsb2cuZGVidWcoXCJWZXJpZnlpbmcgY29ubmVjdGlvbiB0byBleGlzdGluZyBzZXJ2ZXIuLi5cIik7XG4gICAgICAgICAgICAgICAgICAgIC8vIE5vdGU6IFdlJ2xsIHNraXAgdmVyaWZpY2F0aW9uIGZvciBub3cgdG8gYXZvaWQgdW5uZWNlc3NhcnkgQVBJIGNhbGxzXG4gICAgICAgICAgICAgICAgICAgIC8vIFRoZSBjb25uZWN0aW9uIHdpbGwgYmUgdmVyaWZpZWQgd2hlbiBmaXJzdCBzZXNzaW9uIGlzIGNyZWF0ZWRcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IE9wZW5Db2RlQ2xpZW50KGNsaWVudCwgbnVsbCwgY29uZmlnKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1zZyA9XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIGxvZy5lcnJvcihcIkZhaWxlZCB0byBjb25uZWN0IHRvIGV4aXN0aW5nIHNlcnZlclwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IGNvbmZpZy5leGlzdGluZ1NlcnZlclVybCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvck1zZyxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRGVmYXVsdDogc3Bhd24gYSBuZXcgT3BlbkNvZGUgc2VydmVyXG4gICAgICAgICAgICAvLyBOb3RlOiBTcGF3bmVkIHNlcnZlcnMgd2lsbCB1c2UgdG8gY2FsbGluZyBkaXJlY3RvcnkgYnkgZGVmYXVsdFxuICAgICAgICAgICAgLy8gVXNlIE9QRU5DT0RFX1VSTCB0byBjb25uZWN0IHRvIGEgZGlmZmVyZW50IE9wZW5Db2RlIGluc3RhbmNlXG4gICAgICAgICAgICBsb2cuaW5mbyhcIlNwYXduaW5nIG5ldyBPcGVuQ29kZSBzZXJ2ZXIuLi5cIiwge1xuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IGNvbmZpZy5zZXJ2ZXJTdGFydHVwVGltZW91dCB8fCAxMDAwMCxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjb25zdCBhdmFpbGFibGVQb3J0ID0gYXdhaXQgT3BlbkNvZGVDbGllbnQuZ2V0QXZhaWxhYmxlUG9ydCgpO1xuXG4gICAgICAgICAgICBjb25zdCB7IGNsaWVudCwgc2VydmVyIH0gPSBhd2FpdCBjcmVhdGVPcGVuY29kZSh7XG4gICAgICAgICAgICAgICAgdGltZW91dDogY29uZmlnLnNlcnZlclN0YXJ0dXBUaW1lb3V0IHx8IDEwMDAwLFxuICAgICAgICAgICAgICAgIHBvcnQ6IGF2YWlsYWJsZVBvcnQsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgbG9nLmluZm8oXCJPcGVuQ29kZSBzZXJ2ZXIgc3RhcnRlZCBzdWNjZXNzZnVsbHlcIik7XG4gICAgICAgICAgICByZXR1cm4gbmV3IE9wZW5Db2RlQ2xpZW50KGNsaWVudCwgc2VydmVyLCBjb25maWcpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNc2cgPVxuICAgICAgICAgICAgICAgIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgICAgIGxvZy5lcnJvcihcIkZhaWxlZCB0byBjcmVhdGUgT3BlbkNvZGVDbGllbnRcIiwgeyBlcnJvcjogZXJyb3JNc2cgfSk7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBjcmVhdGUgT3BlbkNvZGVDbGllbnQ6ICR7ZXJyb3JNc2d9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgT3BlbkNvZGUgc2Vzc2lvbiB3aXRoIGEgZ2l2ZW4gcHJvbXB0XG4gICAgICovXG4gICAgYXN5bmMgY3JlYXRlU2Vzc2lvbihwcm9tcHQ6IHN0cmluZyk6IFByb21pc2U8U2Vzc2lvbj4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gQ3JlYXRlIHNlc3Npb24gdXNpbmcgU0RLXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmNsaWVudC5zZXNzaW9uLmNyZWF0ZSh7XG4gICAgICAgICAgICAgICAgYm9keToge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZTogXCJhaS1lbmcgcmFscGggc2Vzc2lvblwiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYgKCFyZXN1bHQuZGF0YSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgYEZhaWxlZCB0byBjcmVhdGUgT3BlbkNvZGUgc2Vzc2lvbjogJHtKU09OLnN0cmluZ2lmeShyZXN1bHQuZXJyb3IpfWAsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3Qgc2RrU2Vzc2lvbiA9IHJlc3VsdC5kYXRhO1xuXG4gICAgICAgICAgICAvLyBEZWZlciB0aGUgaW5pdGlhbCBwcm9tcHQgdW50aWwgdGhlIGZpcnN0IG1lc3NhZ2UgaXMgc2VudC5cbiAgICAgICAgICAgIC8vIFRoaXMgYXZvaWRzIGJsb2NraW5nIHNlc3Npb24gY3JlYXRpb24gYW5kIGVuYWJsZXMgc3RyZWFtaW5nIG91dHB1dFxuICAgICAgICAgICAgLy8gZXZlbiB3aGVuIHRoZSBpbml0aWFsIHByb21wdCBpcyBsYXJnZSBvciBzbG93IHRvIHByb2Nlc3MuXG4gICAgICAgICAgICBsZXQgcGVuZGluZ0luaXRpYWxQcm9tcHQgPSBwcm9tcHQudHJpbSgpO1xuICAgICAgICAgICAgY29uc3QgYnVpbGRGaXJzdE1lc3NhZ2UgPSAobWVzc2FnZTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFwZW5kaW5nSW5pdGlhbFByb21wdCkgcmV0dXJuIG1lc3NhZ2U7XG4gICAgICAgICAgICAgICAgY29uc3QgY29tYmluZWQgPSBgJHtwZW5kaW5nSW5pdGlhbFByb21wdH1cXG5cXG4tLS1cXG5cXG4ke21lc3NhZ2V9YDtcbiAgICAgICAgICAgICAgICBwZW5kaW5nSW5pdGlhbFByb21wdCA9IFwiXCI7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbWJpbmVkO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8gSW5pdGlhbGl6ZSB0b29sIGludm9jYXRpb25zIHRyYWNrZXJcbiAgICAgICAgICAgIGNvbnN0IHRvb2xJbnZvY2F0aW9uczogU2Vzc2lvbltcIl90b29sSW52b2NhdGlvbnNcIl0gPSBbXTtcblxuICAgICAgICAgICAgLy8gV3JhcCB3aXRoIG91ciBzZXNzaW9uIGludGVyZmFjZVxuICAgICAgICAgICAgY29uc3Qgc2Vzc2lvbjogU2Vzc2lvbiA9IHtcbiAgICAgICAgICAgICAgICBpZDogc2RrU2Vzc2lvbi5pZCB8fCB0aGlzLmdlbmVyYXRlU2Vzc2lvbklkKCksXG4gICAgICAgICAgICAgICAgX3Rvb2xJbnZvY2F0aW9uczogdG9vbEludm9jYXRpb25zLFxuICAgICAgICAgICAgICAgIHNlbmRNZXNzYWdlOiBhc3luYyAobWVzc2FnZTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmhhbmRsZVNlbmRNZXNzYWdlKFxuICAgICAgICAgICAgICAgICAgICAgICAgc2RrU2Vzc2lvbi5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkRmlyc3RNZXNzYWdlKG1lc3NhZ2UpLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc2VuZE1lc3NhZ2VTdHJlYW06IGFzeW5jIChtZXNzYWdlOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaGFuZGxlU2VuZE1lc3NhZ2VTdHJlYW0oXG4gICAgICAgICAgICAgICAgICAgICAgICBzZGtTZXNzaW9uLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgYnVpbGRGaXJzdE1lc3NhZ2UobWVzc2FnZSksXG4gICAgICAgICAgICAgICAgICAgICAgICB0b29sSW52b2NhdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjbG9zZTogYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5oYW5kbGVTZXNzaW9uQ2xvc2Uoc2RrU2Vzc2lvbi5pZCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIFN0b3JlIGFjdGl2ZSBzZXNzaW9uXG4gICAgICAgICAgICB0aGlzLmFjdGl2ZVNlc3Npb25zLnNldChzZXNzaW9uLmlkLCBzZXNzaW9uKTtcblxuICAgICAgICAgICAgcmV0dXJuIHNlc3Npb247XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPVxuICAgICAgICAgICAgICAgIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICBgRmFpbGVkIHRvIGNyZWF0ZSBPcGVuQ29kZSBzZXNzaW9uOiAke2Vycm9yTWVzc2FnZX1gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNlbmQgYSBtZXNzYWdlIHRvIGFuIGV4aXN0aW5nIHNlc3Npb25cbiAgICAgKi9cbiAgICBhc3luYyBzZW5kTWVzc2FnZShcbiAgICAgICAgc2Vzc2lvbklkOiBzdHJpbmcsXG4gICAgICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgICApOiBQcm9taXNlPE1lc3NhZ2VSZXNwb25zZT4ge1xuICAgICAgICBjb25zdCBzZXNzaW9uID0gdGhpcy5hY3RpdmVTZXNzaW9ucy5nZXQoc2Vzc2lvbklkKTtcblxuICAgICAgICBpZiAoIXNlc3Npb24pIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgU2Vzc2lvbiBub3QgZm91bmQ6ICR7c2Vzc2lvbklkfWApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuaGFuZGxlU2VuZE1lc3NhZ2Uoc2Vzc2lvbklkLCBtZXNzYWdlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDbG9zZSBhbiBhY3RpdmUgc2Vzc2lvblxuICAgICAqL1xuICAgIGFzeW5jIGNsb3NlU2Vzc2lvbihzZXNzaW9uSWQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCBzZXNzaW9uID0gdGhpcy5hY3RpdmVTZXNzaW9ucy5nZXQoc2Vzc2lvbklkKTtcblxuICAgICAgICBpZiAoIXNlc3Npb24pIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgU2Vzc2lvbiBub3QgZm91bmQ6ICR7c2Vzc2lvbklkfWApO1xuICAgICAgICB9XG5cbiAgICAgICAgYXdhaXQgdGhpcy5oYW5kbGVTZXNzaW9uQ2xvc2Uoc2Vzc2lvbklkKTtcbiAgICAgICAgdGhpcy5hY3RpdmVTZXNzaW9ucy5kZWxldGUoc2Vzc2lvbklkKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgYWxsIGFjdGl2ZSBzZXNzaW9uIElEc1xuICAgICAqL1xuICAgIGdldEFjdGl2ZVNlc3Npb25zKCk6IHN0cmluZ1tdIHtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5hY3RpdmVTZXNzaW9ucy5rZXlzKCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGEgc2Vzc2lvbiBpcyBhY3RpdmVcbiAgICAgKi9cbiAgICBpc1Nlc3Npb25BY3RpdmUoc2Vzc2lvbklkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWN0aXZlU2Vzc2lvbnMuaGFzKHNlc3Npb25JZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xvc2UgYWxsIGFjdGl2ZSBzZXNzaW9uc1xuICAgICAqL1xuICAgIGFzeW5jIGNsb3NlQWxsU2Vzc2lvbnMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGNvbnN0IGNsb3NlUHJvbWlzZXMgPSBBcnJheS5mcm9tKHRoaXMuYWN0aXZlU2Vzc2lvbnMua2V5cygpKS5tYXAoXG4gICAgICAgICAgICAoc2Vzc2lvbklkKSA9PlxuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlU2Vzc2lvbkNsb3NlKHNlc3Npb25JZCkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTXNnID1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgbG9nLndhcm4oXCJFcnJvciBjbG9zaW5nIHNlc3Npb25cIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yTXNnLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgKTtcblxuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChjbG9zZVByb21pc2VzKTtcbiAgICAgICAgdGhpcy5hY3RpdmVTZXNzaW9ucy5jbGVhcigpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEhhbmRsZSBzZW5kaW5nIGEgbWVzc2FnZSB3aXRoIHN0cmVhbWluZyBzdXBwb3J0XG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyBoYW5kbGVTZW5kTWVzc2FnZVN0cmVhbShcbiAgICAgICAgc2Vzc2lvbklkOiBzdHJpbmcsXG4gICAgICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgICAgICAgdG9vbEludm9jYXRpb25zPzogU2Vzc2lvbltcIl90b29sSW52b2NhdGlvbnNcIl0sXG4gICAgKTogUHJvbWlzZTxTdHJlYW1pbmdSZXNwb25zZT4ge1xuICAgICAgICBsZXQgbGFzdEVycm9yOiBFcnJvciB8IG51bGwgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0IHN1cHBvcnRzRXZlbnRTdHJlYW1pbmcgPVxuICAgICAgICAgICAgdHlwZW9mICh0aGlzLmNsaWVudCBhcyBhbnkpPy5zZXNzaW9uPy5wcm9tcHRBc3luYyA9PT0gXCJmdW5jdGlvblwiICYmXG4gICAgICAgICAgICB0eXBlb2YgKHRoaXMuY2xpZW50IGFzIGFueSk/LmV2ZW50Py5zdWJzY3JpYmUgPT09IFwiZnVuY3Rpb25cIjtcblxuICAgICAgICBmb3IgKGxldCBhdHRlbXB0ID0gMTsgYXR0ZW1wdCA8PSB0aGlzLnJldHJ5QXR0ZW1wdHM7IGF0dGVtcHQrKykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgYSBUcmFuc2Zvcm1TdHJlYW0gdG8gaGFuZGxlIHRoZSBzdHJlYW1pbmcgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICBjb25zdCBzdHJlYW0gPSBuZXcgVHJhbnNmb3JtU3RyZWFtPFVpbnQ4QXJyYXksIFVpbnQ4QXJyYXk+KCk7XG4gICAgICAgICAgICAgICAgY29uc3Qgd3JpdGVyID0gc3RyZWFtLndyaXRhYmxlLmdldFdyaXRlcigpO1xuICAgICAgICAgICAgICAgIGxldCBhc3Npc3RhbnRNZXNzYWdlSWQ6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuXG4gICAgICAgICAgICAgICAgLy8gVHJhY2sgZmluYWxpemF0aW9uIHRvIHByZXZlbnQgZG91YmxlLWNsb3NlL2Fib3J0XG4gICAgICAgICAgICAgICAgbGV0IGZpbmFsaXplZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNsb3NlT25jZSA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbmFsaXplZCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICBmaW5hbGl6ZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB3cml0ZXIuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZ25vcmUgZXJyb3JzIGR1cmluZyBjbG9zZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBjb25zdCBhYm9ydE9uY2UgPSBhc3luYyAoZXJyOiB1bmtub3duKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmaW5hbGl6ZWQpIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgZmluYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHdyaXRlci5hYm9ydChlcnIpO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElnbm9yZSBlcnJvcnMgZHVyaW5nIGFib3J0XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgLy8gRmFsbGJhY2s6IGlmIHRoZSBjbGllbnQgZG9lc24ndCBzdXBwb3J0IHByb21wdF9hc3luYyArIFNTRSwga2VlcCB0aGVcbiAgICAgICAgICAgICAgICAvLyBsZWdhY3kgYmVoYXZpb3IgKGJ1ZmZlciB0aGVuIHNpbXVsYXRlIHN0cmVhbWluZykuXG4gICAgICAgICAgICAgICAgaWYgKCFzdXBwb3J0c0V2ZW50U3RyZWFtaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHByb21wdFByb21pc2UgPSB0aGlzLmNsaWVudC5zZXNzaW9uLnByb21wdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBib2R5OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUlEOiB0aGlzLmdlbmVyYXRlTWVzc2FnZUlkKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJ0ZXh0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBtZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgcXVlcnk6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3Rvcnk6IHRoaXMuZGlyZWN0b3J5LFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgfSBhcyBhbnkpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0cmVhbWluZ1Rhc2sgPSAoYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwcm9tcHRQcm9taXNlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXN1bHQuZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgSW52YWxpZCByZXNwb25zZSBmcm9tIE9wZW5Db2RlOiAke0pTT04uc3RyaW5naWZ5KHJlc3VsdC5lcnJvcil9YCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IHJlc3VsdC5kYXRhO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRleHRQYXJ0ID0gcmVzcG9uc2UucGFydHM/LmZpbmQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChwYXJ0OiBhbnkpID0+IHBhcnQudHlwZSA9PT0gXCJ0ZXh0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpbmFsQ29udGVudCA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICh0ZXh0UGFydCBhcyBhbnkpPy50ZXh0IHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiTm8gY29udGVudCByZWNlaXZlZFwiO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2ltdWxhdGUgc3RyZWFtaW5nIGJ5IHdyaXRpbmcgY2h1bmtzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2h1bmtzID0gdGhpcy5zcGxpdEludG9DaHVua3MoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbmFsQ29udGVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgMTAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlbmNvZGVyID0gbmV3IFRleHRFbmNvZGVyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBjaHVuayBvZiBjaHVua3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgd3JpdGVyLndyaXRlKGVuY29kZXIuZW5jb2RlKGNodW5rKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChyZXNvbHZlLCA1MCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgY2xvc2VPbmNlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgY29udGVudDogZmluYWxDb250ZW50IH07XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IGFib3J0T25jZShlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cmVhbTogc3RyZWFtLnJlYWRhYmxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGU6IHN0cmVhbWluZ1Rhc2ssXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gUmVhbCBzdHJlYW1pbmc6IHVzZSBwcm9tcHRfYXN5bmMgYW5kIGNvbnN1bWUgdGhlIGV2ZW50IFNTRSBzdHJlYW0uXG4gICAgICAgICAgICAgICAgY29uc3QgZW5jb2RlciA9IG5ldyBUZXh0RW5jb2RlcigpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGlkbGVUaW1lb3V0RXJyb3IgPSBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgIGBQcm9tcHQgaWRsZSB0aW1lb3V0IGFmdGVyICR7dGhpcy5wcm9tcHRUaW1lb3V0fW1zYCxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGNvbnN0IGhhcmRUaW1lb3V0RXJyb3IgPSBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgIGBQcm9tcHQgaGFyZCB0aW1lb3V0IGFmdGVyICR7dGhpcy5wcm9tcHRUaW1lb3V0ICogNX1tc2AsXG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgICAgICAgICAgICAgbGV0IGlkbGVUaW1lcjogUmV0dXJuVHlwZTx0eXBlb2Ygc2V0VGltZW91dD4gfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgbGV0IGhhcmRUaW1lcjogUmV0dXJuVHlwZTx0eXBlb2Ygc2V0VGltZW91dD4gfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgbGV0IGJ5dGVzV3JpdHRlbiA9IDA7XG4gICAgICAgICAgICAgICAgbGV0IGxhc3RQcm9ncmVzc1RpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgICAgIGxldCBpZGxlVGltZWRPdXQgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgIC8vIEhhcmQgdGltZW91dCAtIG5ldmVyIHJlc2V0c1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXJ0SGFyZFRpbWVyID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaGFyZFRpbWVyKSBjbGVhclRpbWVvdXQoaGFyZFRpbWVyKTtcbiAgICAgICAgICAgICAgICAgICAgaGFyZFRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2cud2FybihcIkhhcmQgdGltZW91dCByZWFjaGVkLCBhYm9ydGluZ1wiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXRNczogdGhpcy5wcm9tcHRUaW1lb3V0ICogNSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyLmFib3J0KGhhcmRUaW1lb3V0RXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWdub3JlXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sIHRoaXMucHJvbXB0VGltZW91dCAqIDUpOyAvLyA1eCBpZGxlIHRpbWVvdXQgYXMgaGFyZCBjZWlsaW5nXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIC8vIElkbGUgdGltZXIgLSByZXNldHMgb25seSBvbiByZWxldmFudCBwcm9ncmVzc1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc2V0SWRsZVRpbWVyID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaWRsZVRpbWVyKSBjbGVhclRpbWVvdXQoaWRsZVRpbWVyKTtcbiAgICAgICAgICAgICAgICAgICAgaWRsZVRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZGxlVGltZWRPdXQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nLndhcm4oXCJJZGxlIHRpbWVvdXQgcmVhY2hlZCwgYWJvcnRpbmdcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0TXM6IHRoaXMucHJvbXB0VGltZW91dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBieXRlc1dyaXR0ZW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdFByb2dyZXNzTXNBZ286IERhdGUubm93KCkgLSBsYXN0UHJvZ3Jlc3NUaW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXIuYWJvcnQoaWRsZVRpbWVvdXRFcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpZ25vcmVcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSwgdGhpcy5wcm9tcHRUaW1lb3V0KTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgY29uc3Qgc3RyZWFtaW5nVGFzayA9IChhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydEhhcmRUaW1lcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzZXRJZGxlVGltZXIoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXNlck1lc3NhZ2VJZCA9IHRoaXMuZ2VuZXJhdGVNZXNzYWdlSWQoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmRlYnVnKFwiU2VuZGluZyBwcm9tcHQgdG8gT3BlbkNvZGVcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlTGVuZ3RoOiBtZXNzYWdlLmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyTWVzc2FnZUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0ICh0aGlzLmNsaWVudCBhcyBhbnkpLnNlc3Npb24ucHJvbXB0QXN5bmMoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvZHk6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUlEOiB1c2VyTWVzc2FnZUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0czogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwidGV4dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IG1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlcnk6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0b3J5OiB0aGlzLmRpcmVjdG9yeSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpZ25hbDogY29udHJvbGxlci5zaWduYWwsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmRlYnVnKFwiU3Vic2NyaWJpbmcgdG8gZXZlbnRzXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0b3J5OiB0aGlzLmRpcmVjdG9yeSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBldmVudHNSZXN1bHQgPSBhd2FpdCAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jbGllbnQgYXMgYW55XG4gICAgICAgICAgICAgICAgICAgICAgICApLmV2ZW50LnN1YnNjcmliZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlcnk6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0b3J5OiB0aGlzLmRpcmVjdG9yeSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpZ25hbDogY29udHJvbGxlci5zaWduYWwsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNvbnRlbnQgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGVtaXR0ZWRUZXh0ID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBldmVudENvdW50ID0gMDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmRlYnVnKFwiU3RhcnRpbmcgZXZlbnQgc3RyZWFtIHByb2Nlc3NpbmdcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgYXdhaXQgKGNvbnN0IGV2ZW50IG9mIGV2ZW50c1Jlc3VsdC5zdHJlYW0gYXMgQXN5bmNHZW5lcmF0b3I8YW55Pikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50Q291bnQrKztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFZlcmJvc2UgZGVidWcgbG9nZ2luZyBmb3IgYWxsIGV2ZW50c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcIlJlY2VpdmVkIGV2ZW50XCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudFR5cGU6IGV2ZW50Py50eXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudENvdW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNQcm9wZXJ0aWVzOiAhIWV2ZW50Py5wcm9wZXJ0aWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyQWJvcnRlZDogY29udHJvbGxlci5zaWduYWwuYWJvcnRlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb250cm9sbGVyLnNpZ25hbC5hYm9ydGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQ29udHJvbGxlciBhYm9ydGVkLCBicmVha2luZyBldmVudCBsb29wXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50Q291bnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWV2ZW50IHx8IHR5cGVvZiBldmVudCAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZGVidWcoXCJTa2lwcGluZyBub24tb2JqZWN0IGV2ZW50XCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50Q291bnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXZlbnQudHlwZSA9PT0gXCJtZXNzYWdlLnVwZGF0ZWRcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbmZvID0gKGV2ZW50IGFzIGFueSkucHJvcGVydGllcz8uaW5mbztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZGVidWcoXCJNZXNzYWdlIHVwZGF0ZWQgZXZlbnRcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRDb3VudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm9Sb2xlOiBpbmZvPy5yb2xlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mb1Nlc3Npb25JZDogaW5mbz8uc2Vzc2lvbklELFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mb1BhcmVudElkOiBpbmZvPy5wYXJlbnRJRCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm9JZDogaW5mbz8uaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1JlbGV2YW50U2Vzc2lvbjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvPy5zZXNzaW9uSUQgPT09IHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzQXNzaXN0YW50OiBpbmZvPy5yb2xlID09PSBcImFzc2lzdGFudFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNSZXBseVRvVXNlcjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvPy5wYXJlbnRJRCA9PT0gdXNlck1lc3NhZ2VJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUHJpbWFyeSBpZGVudGlmaWNhdGlvbjogZXhhY3QgbWF0Y2ggb24gcGFyZW50SURcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mbz8ucm9sZSA9PT0gXCJhc3Npc3RhbnRcIiAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mbz8uc2Vzc2lvbklEID09PSBzZXNzaW9uSWQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8/LnBhcmVudElEID09PSB1c2VyTWVzc2FnZUlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzaXN0YW50TWVzc2FnZUlkID0gaW5mby5pZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIklkZW50aWZpZWQgYXNzaXN0YW50IG1lc3NhZ2UgKGV4YWN0IHBhcmVudElEIG1hdGNoKVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3Npc3RhbnRNZXNzYWdlSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmFsbGJhY2s6IGlmIHdlIGhhdmVuJ3QgaWRlbnRpZmllZCBhbiBhc3Npc3RhbnQgbWVzc2FnZSB5ZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFjY2VwdCBhc3Npc3RhbnQgbWVzc2FnZXMgaW4gdGhlIHNhbWUgc2Vzc2lvbiBldmVuIGlmIHBhcmVudElEIGRvZXNuJ3QgbWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBoYW5kbGVzIGNhc2VzIHdoZXJlIHBhcmVudElEIGlzIHVuZGVmaW5lZCBvciBoYXMgYSBkaWZmZXJlbnQgZm9ybWF0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIWFzc2lzdGFudE1lc3NhZ2VJZCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mbz8ucm9sZSA9PT0gXCJhc3Npc3RhbnRcIiAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mbz8uc2Vzc2lvbklEID09PSBzZXNzaW9uSWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZGVidWcoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJJZGVudGlmaWVkIGFzc2lzdGFudCBtZXNzYWdlIChmYWxsYmFjayAtIG5vIGV4YWN0IHBhcmVudElEIG1hdGNoKVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3Npc3RhbnRNZXNzYWdlSWQ6IGluZm8uaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm9QYXJlbnRJZDogaW5mbz8ucGFyZW50SUQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJNZXNzYWdlSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3Npc3RhbnRNZXNzYWdlSWQgPSBpbmZvLmlkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUmVzZXQgaWRsZSB0aW1lciBvbiBBTlkgYXNzaXN0YW50IG1lc3NhZ2UgYWN0aXZpdHlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBwcmV2ZW50cyB0aW1lb3V0cyB3aGVuIGNvcnJlbGF0aW9uIGlzIGFtYmlndW91c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvPy5yb2xlID09PSBcImFzc2lzdGFudFwiICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvPy5zZXNzaW9uSUQgPT09IHNlc3Npb25JZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RQcm9ncmVzc1RpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzZXRJZGxlVGltZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2lzdGFudE1lc3NhZ2VJZCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mbz8uaWQgPT09IGFzc2lzdGFudE1lc3NhZ2VJZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmZvPy5lcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVyck5hbWUgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvLmVycm9yLm5hbWUgfHwgXCJPcGVuQ29kZUVycm9yXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyTXNnID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mby5lcnJvci5kYXRhPy5tZXNzYWdlIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mby5lcnJvci5kYXRhIHx8IHt9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5lcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJBc3Npc3RhbnQgZXJyb3IgaW4gbWVzc2FnZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck5hbWU6IGVyck5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVyck1zZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7ZXJyTmFtZX06ICR7ZXJyTXNnfWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZm8/LnRpbWU/LmNvbXBsZXRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJBc3Npc3RhbnQgbWVzc2FnZSBjb21wbGV0ZWRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzaXN0YW50TWVzc2FnZUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGVkQXQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mby50aW1lLmNvbXBsZXRlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09IFwibWVzc2FnZS5wYXJ0LnVwZGF0ZWRcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBPbmx5IHJlc2V0IHRpbWVyIGFuZCB0cmFjayBwcm9ncmVzcyBmb3IgcmVsZXZhbnQgdXBkYXRlc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJ0ID0gKGV2ZW50IGFzIGFueSkucHJvcGVydGllc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPy5wYXJ0IGFzIGFueTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZGVidWcoXCJNZXNzYWdlIHBhcnQgdXBkYXRlZFwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudENvdW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzUGFydDogISFwYXJ0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydFR5cGU6IHBhcnQ/LnR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0U2Vzc2lvbklkOiBwYXJ0Py5zZXNzaW9uSUQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0TWVzc2FnZUlkOiBwYXJ0Py5tZXNzYWdlSUQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3Npc3RhbnRNZXNzYWdlSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1JlbGV2YW50OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2lzdGFudE1lc3NhZ2VJZCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnQ/LnNlc3Npb25JRCA9PT0gc2Vzc2lvbklkICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydD8ubWVzc2FnZUlEID09PSBhc3Npc3RhbnRNZXNzYWdlSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghYXNzaXN0YW50TWVzc2FnZUlkKSBjb250aW51ZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBIYW5kbGUgdG9vbCBwYXJ0cyAoY2FwdHVyZSB0b29sIGludm9jYXRpb25zKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFydD8udHlwZSA9PT0gXCJ0b29sXCIgJiYgdG9vbEludm9jYXRpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0b29sSWQgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnQudG9vbElkIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydC5pZCB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGB0b29sLSR7ZXZlbnRDb3VudH1gO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdG9vbE5hbWUgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnQudG9vbE5hbWUgfHwgcGFydC5uYW1lIHx8IFwidW5rbm93blwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdG9vbElucHV0ID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0LmlucHV0IHx8IHBhcnQucGFyYW1ldGVycyB8fCB7fTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdGhpcyBpcyBhIG5ldyB0b29sIGNhbGwgb3IgYW4gdXBkYXRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBleGlzdGluZ1Rvb2xJbmRleCA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbEludm9jYXRpb25zLmZpbmRJbmRleChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHQpID0+IHQuaWQgPT09IHRvb2xJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXhpc3RpbmdUb29sSW5kZXggPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSBleGlzdGluZyB0b29sIGludm9jYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBleGlzdGluZyA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xJbnZvY2F0aW9uc1tleGlzdGluZ1Rvb2xJbmRleF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhpc3Rpbmcub3V0cHV0ID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydC5yZXN1bHQgPz9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydC5vdXRwdXQgPz9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhpc3Rpbmcub3V0cHV0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nLnN0YXR1cyA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnQuc3RhdHVzID09PSBcImVycm9yXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gXCJlcnJvclwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFwib2tcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleGlzdGluZy5lcnJvciA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnQuZXJyb3IgPz8gZXhpc3RpbmcuZXJyb3I7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhpc3RpbmcuY29tcGxldGVkQXQgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0LmNvbXBsZXRlZEF0ID8/IG5vdztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcIlRvb2wgaW52b2NhdGlvbiB1cGRhdGVkXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IGV4aXN0aW5nLnN0YXR1cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTmV3IHRvb2wgaW52b2NhdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRvb2xJbnZvY2F0aW9uID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogdG9vbElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiB0b29sTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQ6IHRvb2xJbnB1dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0OiBwYXJ0LnJlc3VsdCA/PyBwYXJ0Lm91dHB1dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydC5zdGF0dXMgPT09IFwiZXJyb3JcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gKFwiZXJyb3JcIiBhcyBjb25zdClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IChcIm9rXCIgYXMgY29uc3QpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogcGFydC5lcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRlZEF0OiBwYXJ0LnN0YXJ0ZWRBdCA/PyBub3csXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlZEF0OiBwYXJ0LmNvbXBsZXRlZEF0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbEludm9jYXRpb25zLnB1c2godG9vbEludm9jYXRpb24pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmRlYnVnKFwiVG9vbCBpbnZvY2F0aW9uIHN0YXJ0ZWRcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbE5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0OiBKU09OLnN0cmluZ2lmeShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xJbnB1dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKS5zbGljZSgwLCAyMDApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBEb24ndCBza2lwIG5vbi1yZWxldmFudCB0b29sIHBhcnRzIC0gd2Ugd2FudCB0byBjYXB0dXJlIGFsbCB0b29sIGV2ZW50c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZm9yIHRoZSBhc3Npc3RhbnQgbWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnQuc2Vzc2lvbklEICE9PSBzZXNzaW9uSWQgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0Lm1lc3NhZ2VJRCAhPT0gYXNzaXN0YW50TWVzc2FnZUlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTdGlsbCB0cmFjayBpdCBidXQgZG9uJ3QgcHJvY2VzcyBmb3Igb3V0cHV0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJlc2V0IGlkbGUgdGltZXIgb24gdG9vbCBwcm9ncmVzc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RQcm9ncmVzc1RpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc2V0SWRsZVRpbWVyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFwYXJ0IHx8IHBhcnQudHlwZSAhPT0gXCJ0ZXh0XCIpIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFydC5zZXNzaW9uSUQgIT09IHNlc3Npb25JZCkgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYXJ0Lm1lc3NhZ2VJRCAhPT0gYXNzaXN0YW50TWVzc2FnZUlkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmF3RGVsdGEgPSAoZXZlbnQgYXMgYW55KS5wcm9wZXJ0aWVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/LmRlbHRhO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBkZWx0YVRleHQ6IHN0cmluZyB8IHVuZGVmaW5lZDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBQcmVmZXIgZGlmZmluZyBhZ2FpbnN0IHRoZSBmdWxsIGBwYXJ0LnRleHRgIHdoZW4gcHJlc2VudC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU29tZSBPcGVuQ29kZSBzZXJ2ZXIgdmVyc2lvbnMgZW1pdCBtdWx0aXBsZSB0ZXh0IHBhcnRzIG9yIHNlbmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYGRlbHRhYCBhcyB0aGUgKmZ1bGwqIHRleHQsIHdoaWNoIHdvdWxkIGR1cGxpY2F0ZSBvdXRwdXQuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcGFydC50ZXh0ID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXh0ID0gcGFydC50ZXh0O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV4dC5zdGFydHNXaXRoKGVtaXR0ZWRUZXh0KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbHRhVGV4dCA9IG5leHQuc2xpY2UoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVtaXR0ZWRUZXh0Lmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVtaXR0ZWRUZXh0ID0gbmV4dDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZW1pdHRlZFRleHQuc3RhcnRzV2l0aChuZXh0KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFN0YWxlL2R1cGxpY2F0ZSB1cGRhdGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWx0YVRleHQgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGYWxsYmFjazogdHJlYXQgYXMgYWRkaXRpdmUgY2h1bmtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWx0YVRleHQgPSBuZXh0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVtaXR0ZWRUZXh0ICs9IG5leHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHJhd0RlbHRhID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWx0YVRleHQgPSByYXdEZWx0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVtaXR0ZWRUZXh0ICs9IHJhd0RlbHRhO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFkZWx0YVRleHQpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSBwcm9ncmVzcyB0cmFja2luZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0UHJvZ3Jlc3NUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnl0ZXNXcml0dGVuICs9IGRlbHRhVGV4dC5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc2V0SWRsZVRpbWVyKCk7IC8vIE9ubHkgcmVzZXQgb24gYWN0dWFsIGNvbnRlbnQgcHJvZ3Jlc3NcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZGVidWcoXCJXcml0aW5nIGRlbHRhIHRvIHN0cmVhbVwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWx0YUxlbmd0aDogZGVsdGFUZXh0Lmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsQnl0ZXNXcml0dGVuOiBieXRlc1dyaXR0ZW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50TGVuZ3RoOiBjb250ZW50Lmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudCArPSBkZWx0YVRleHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHdyaXRlci53cml0ZShlbmNvZGVyLmVuY29kZShkZWx0YVRleHQpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcIkV2ZW50IHN0cmVhbSBlbmRlZFwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50Q291bnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxCeXRlc1dyaXR0ZW46IGJ5dGVzV3JpdHRlbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50TGVuZ3RoOiBjb250ZW50Lmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyQWJvcnRlZDogY29udHJvbGxlci5zaWduYWwuYWJvcnRlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZGxlVGltZWRPdXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzaXN0YW50TWVzc2FnZUlkRm91bmQ6ICEhYXNzaXN0YW50TWVzc2FnZUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IGNsb3NlT25jZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBjb250ZW50IHx8IFwiTm8gY29udGVudCByZWNlaXZlZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpYWdub3N0aWNzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ5dGVzV3JpdHRlbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudExlbmd0aDogY29udGVudC5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkbGVUaW1lZE91dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzaXN0YW50TWVzc2FnZUlkRm91bmQ6ICEhYXNzaXN0YW50TWVzc2FnZUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudENvdW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmVycm9yKFwiU3RyZWFtaW5nIHRhc2sgZXJyb3JcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBFcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBlcnJvci5tZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFN0cmluZyhlcnJvciksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlckFib3J0ZWQ6IGNvbnRyb2xsZXIuc2lnbmFsLmFib3J0ZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnl0ZXNXcml0dGVuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkbGVUaW1lZE91dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3Npc3RhbnRNZXNzYWdlSWRGb3VuZDogISFhc3Npc3RhbnRNZXNzYWdlSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFByZXNlcnZlIHRoZSBhY3R1YWwgdGltZW91dCByZWFzb24gc28gZGlhZ25vc3RpY3Mgc3RheSBhY2N1cmF0ZS5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb250cm9sbGVyLnNpZ25hbC5hYm9ydGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYWJvcnRFcnJvciA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXIuc2lnbmFsLnJlYXNvbiBpbnN0YW5jZW9mIEVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IGNvbnRyb2xsZXIuc2lnbmFsLnJlYXNvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBpZGxlVGltZWRPdXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBpZGxlVGltZW91dEVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogaGFyZFRpbWVvdXRFcnJvcjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBhYm9ydE9uY2UoYWJvcnRFcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgYWJvcnRFcnJvcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IGFib3J0T25jZShlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpZGxlVGltZXIpIGNsZWFyVGltZW91dChpZGxlVGltZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGhhcmRUaW1lcikgY2xlYXJUaW1lb3V0KGhhcmRUaW1lcik7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY29udHJvbGxlci5zaWduYWwuYWJvcnRlZCkgY29udHJvbGxlci5hYm9ydCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWdub3JlXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KSgpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgc3RyZWFtOiBzdHJlYW0ucmVhZGFibGUsXG4gICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlOiBzdHJlYW1pbmdUYXNrLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGxhc3RFcnJvciA9XG4gICAgICAgICAgICAgICAgICAgIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvciA6IG5ldyBFcnJvcihTdHJpbmcoZXJyb3IpKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGlzUmF0ZUxpbWl0ID0gdGhpcy5pc1JhdGVMaW1pdEVycm9yKGxhc3RFcnJvcik7XG5cbiAgICAgICAgICAgICAgICBpZiAoYXR0ZW1wdCA9PT0gdGhpcy5yZXRyeUF0dGVtcHRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IGRlbGF5ID0gdGhpcy5nZXRCYWNrb2ZmRGVsYXkoYXR0ZW1wdCwgaXNSYXRlTGltaXQpO1xuXG4gICAgICAgICAgICAgICAgbG9nLndhcm4oXCJPcGVuQ29kZSBhdHRlbXB0IGZhaWxlZDsgcmV0cnlpbmdcIiwge1xuICAgICAgICAgICAgICAgICAgICBhdHRlbXB0LFxuICAgICAgICAgICAgICAgICAgICByZXRyeUF0dGVtcHRzOiB0aGlzLnJldHJ5QXR0ZW1wdHMsXG4gICAgICAgICAgICAgICAgICAgIGRlbGF5TXM6IGRlbGF5LFxuICAgICAgICAgICAgICAgICAgICBpc1JhdGVMaW1pdCxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGxhc3RFcnJvci5tZXNzYWdlLFxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgZGVsYXkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBGYWlsZWQgdG8gc3RyZWFtIG1lc3NhZ2UgYWZ0ZXIgJHt0aGlzLnJldHJ5QXR0ZW1wdHN9IGF0dGVtcHRzOiAke2xhc3RFcnJvcj8ubWVzc2FnZSB8fCBcIlVua25vd24gZXJyb3JcIn1gLFxuICAgICAgICApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNwbGl0IHRleHQgaW50byBjaHVua3MgZm9yIHN0cmVhbWluZyBzaW11bGF0aW9uXG4gICAgICovXG4gICAgcHJpdmF0ZSBzcGxpdEludG9DaHVua3ModGV4dDogc3RyaW5nLCBjaHVua1NpemU6IG51bWJlcik6IHN0cmluZ1tdIHtcbiAgICAgICAgY29uc3QgY2h1bmtzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRleHQubGVuZ3RoOyBpICs9IGNodW5rU2l6ZSkge1xuICAgICAgICAgICAgY2h1bmtzLnB1c2godGV4dC5zbGljZShpLCBpICsgY2h1bmtTaXplKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNodW5rcy5sZW5ndGggPiAwID8gY2h1bmtzIDogW3RleHRdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEhhbmRsZSBzZW5kaW5nIGEgbWVzc2FnZSB3aXRoIGVycm9yIGhhbmRsaW5nIGFuZCByZXRyaWVzXG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyBoYW5kbGVTZW5kTWVzc2FnZShcbiAgICAgICAgc2Vzc2lvbklkOiBzdHJpbmcsXG4gICAgICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgICApOiBQcm9taXNlPE1lc3NhZ2VSZXNwb25zZT4ge1xuICAgICAgICBsZXQgbGFzdEVycm9yOiBFcnJvciB8IG51bGwgPSBudWxsO1xuXG4gICAgICAgIGZvciAobGV0IGF0dGVtcHQgPSAxOyBhdHRlbXB0IDw9IHRoaXMucmV0cnlBdHRlbXB0czsgYXR0ZW1wdCsrKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRpbWVvdXRFcnJvciA9IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgYFByb21wdCB0aW1lb3V0IGFmdGVyICR7dGhpcy5wcm9tcHRUaW1lb3V0fW1zYCxcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgY29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICAgICAgICAgICAgICBjb25zdCB0aW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlci5hYm9ydCh0aW1lb3V0RXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlnbm9yZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgdGhpcy5wcm9tcHRUaW1lb3V0KTtcblxuICAgICAgICAgICAgICAgIGxldCByZXN1bHQ6IGFueTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBhd2FpdCB0aGlzLmNsaWVudC5zZXNzaW9uLnByb21wdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBib2R5OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUlEOiB0aGlzLmdlbmVyYXRlTWVzc2FnZUlkKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJ0ZXh0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBtZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgcXVlcnk6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3Rvcnk6IHRoaXMuZGlyZWN0b3J5LFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpZ25hbDogY29udHJvbGxlci5zaWduYWwsXG4gICAgICAgICAgICAgICAgICAgIH0gYXMgYW55KTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29udHJvbGxlci5zaWduYWwuYWJvcnRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgdGltZW91dEVycm9yO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKCFyZXN1bHQuZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgICBgSW52YWxpZCByZXNwb25zZSBmcm9tIE9wZW5Db2RlOiAke0pTT04uc3RyaW5naWZ5KHJlc3VsdC5lcnJvcil9YCxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBFeHRyYWN0IGNvbnRlbnQgZnJvbSByZXNwb25zZVxuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gcmVzdWx0LmRhdGE7XG5cbiAgICAgICAgICAgICAgICAvLyBGaW5kIHRleHQgY29udGVudCBmcm9tIHJlc3BvbnNlIHBhcnRzXG4gICAgICAgICAgICAgICAgY29uc3QgdGV4dFBhcnQgPSByZXNwb25zZS5wYXJ0cz8uZmluZChcbiAgICAgICAgICAgICAgICAgICAgKHBhcnQ6IGFueSkgPT4gcGFydC50eXBlID09PSBcInRleHRcIixcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIHJldHVybiB7IGNvbnRlbnQ6IHRleHRQYXJ0Py50ZXh0IHx8IFwiTm8gY29udGVudCByZWNlaXZlZFwiIH07XG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGxhc3RFcnJvciA9XG4gICAgICAgICAgICAgICAgICAgIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvciA6IG5ldyBFcnJvcihTdHJpbmcoZXJyb3IpKTtcblxuICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIHRoaXMgaXMgYSByYXRlIGxpbWl0IGVycm9yXG4gICAgICAgICAgICAgICAgY29uc3QgaXNSYXRlTGltaXQgPSB0aGlzLmlzUmF0ZUxpbWl0RXJyb3IobGFzdEVycm9yKTtcblxuICAgICAgICAgICAgICAgIGlmIChhdHRlbXB0ID09PSB0aGlzLnJldHJ5QXR0ZW1wdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gV2FpdCBiZWZvcmUgcmV0cnlpbmcgd2l0aCBleHBvbmVudGlhbCBiYWNrb2ZmXG4gICAgICAgICAgICAgICAgY29uc3QgZGVsYXkgPSB0aGlzLmdldEJhY2tvZmZEZWxheShhdHRlbXB0LCBpc1JhdGVMaW1pdCk7XG5cbiAgICAgICAgICAgICAgICBsb2cud2FybihcIk9wZW5Db2RlIGF0dGVtcHQgZmFpbGVkOyByZXRyeWluZ1wiLCB7XG4gICAgICAgICAgICAgICAgICAgIGF0dGVtcHQsXG4gICAgICAgICAgICAgICAgICAgIHJldHJ5QXR0ZW1wdHM6IHRoaXMucmV0cnlBdHRlbXB0cyxcbiAgICAgICAgICAgICAgICAgICAgZGVsYXlNczogZGVsYXksXG4gICAgICAgICAgICAgICAgICAgIGlzUmF0ZUxpbWl0LFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogbGFzdEVycm9yLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gc2V0VGltZW91dChyZXNvbHZlLCBkZWxheSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYEZhaWxlZCB0byBzZW5kIG1lc3NhZ2UgYWZ0ZXIgJHt0aGlzLnJldHJ5QXR0ZW1wdHN9IGF0dGVtcHRzOiAke2xhc3RFcnJvcj8ubWVzc2FnZSB8fCBcIlVua25vd24gZXJyb3JcIn1gLFxuICAgICAgICApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGVycm9yIGlzIGEgcmF0ZSBsaW1pdCBlcnJvclxuICAgICAqL1xuICAgIHByaXZhdGUgaXNSYXRlTGltaXRFcnJvcihlcnJvcjogRXJyb3IpOiBib29sZWFuIHtcbiAgICAgICAgY29uc3QgZXJyID0gZXJyb3IgYXMgYW55O1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgZXJyLnN0YXR1cyA9PT0gNDI5IHx8XG4gICAgICAgICAgICAvcmF0ZSBsaW1pdHxxdW90YXxvdmVybG9hZGVkfGNhcGFjaXR5L2kudGVzdChlcnJvci5tZXNzYWdlKVxuICAgICAgICApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENhbGN1bGF0ZSBiYWNrb2ZmIGRlbGF5IHdpdGggaml0dGVyXG4gICAgICovXG4gICAgcHJpdmF0ZSBnZXRCYWNrb2ZmRGVsYXkoYXR0ZW1wdDogbnVtYmVyLCBpc1JhdGVMaW1pdDogYm9vbGVhbik6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IGJhc2UgPSBpc1JhdGVMaW1pdCA/IDUwMDAgOiAxMDAwOyAvLyA1cyBmb3IgcmF0ZSBsaW1pdCwgMXMgb3RoZXJ3aXNlXG4gICAgICAgIGNvbnN0IGV4cG9uZW50aWFsID0gYmFzZSAqIDIgKiogKGF0dGVtcHQgLSAxKTtcbiAgICAgICAgY29uc3Qgaml0dGVyID0gTWF0aC5yYW5kb20oKSAqIDEwMDA7IC8vIEFkZCB1cCB0byAxcyBqaXR0ZXJcbiAgICAgICAgcmV0dXJuIE1hdGgubWluKGV4cG9uZW50aWFsICsgaml0dGVyLCA2MDAwMCk7IC8vIG1heCA2MHNcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBIYW5kbGUgc2Vzc2lvbiBjbG9zdXJlIHdpdGggZXJyb3IgaGFuZGxpbmdcbiAgICAgKi9cbiAgICBwcml2YXRlIGFzeW5jIGhhbmRsZVNlc3Npb25DbG9zZShzZXNzaW9uSWQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gTm90ZTogT3BlbkNvZGUgU0RLIG1pZ2h0IG5vdCBoYXZlIGFuIGV4cGxpY2l0IGNsb3NlIG1ldGhvZFxuICAgICAgICAgICAgLy8gRm9yIG5vdywgd2UnbGwganVzdCByZW1vdmUgZnJvbSBvdXIgYWN0aXZlIHNlc3Npb25zXG4gICAgICAgICAgICAvLyBJbiBhIHJlYWwgaW1wbGVtZW50YXRpb24sIHdlJ2QgY2FsbCBTREsncyBkZWxldGUgbWV0aG9kIGlmIGF2YWlsYWJsZVxuICAgICAgICAgICAgbG9nLmRlYnVnKFwiU2Vzc2lvbiBjbG9zZWRcIiwgeyBzZXNzaW9uSWQgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPVxuICAgICAgICAgICAgICAgIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgICAgIGxvZy53YXJuKFwiRmFpbGVkIHRvIGNsb3NlIHNlc3Npb25cIiwge1xuICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZSBhIHVuaXF1ZSBzZXNzaW9uIElEIGlmIFNESyBkb2Vzbid0IHByb3ZpZGUgb25lXG4gICAgICovXG4gICAgcHJpdmF0ZSBnZW5lcmF0ZVNlc3Npb25JZCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gYHNlc3Npb24tJHtEYXRlLm5vdygpfS0ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA5KX1gO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlIGEgcHJvcGVybHkgZm9ybWF0dGVkIG1lc3NhZ2UgSUQgd2l0aCBtc2dfIHByZWZpeFxuICAgICAqIEZvcm1hdDogbXNnXzx0aW1lc3RhbXA+XzxyYW5kb20+XG4gICAgICovXG4gICAgcHJpdmF0ZSBnZW5lcmF0ZU1lc3NhZ2VJZCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gYG1zZ18ke0RhdGUubm93KCl9XyR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDIsIDgpfWA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xlYW51cCBtZXRob2QgdG8gY2xvc2UgYWxsIHNlc3Npb25zIGFuZCBzZXJ2ZXJcbiAgICAgKi9cbiAgICBhc3luYyBjbGVhbnVwKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbG9nLmRlYnVnKFwiU3RhcnRpbmcgY2xlYW51cC4uLlwiLCB7XG4gICAgICAgICAgICAgICAgYWN0aXZlU2Vzc2lvbnM6IHRoaXMuYWN0aXZlU2Vzc2lvbnMuc2l6ZSxcbiAgICAgICAgICAgICAgICBoYXNTZXJ2ZXI6ICEhdGhpcy5zZXJ2ZXIsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gQ2xvc2UgYWxsIGFjdGl2ZSBzZXNzaW9uc1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5jbG9zZUFsbFNlc3Npb25zKCk7XG5cbiAgICAgICAgICAgIC8vIFN0b3AgdGhlIE9wZW5Db2RlIHNlcnZlciBpZiB3ZSBzdGFydGVkIG9uZVxuICAgICAgICAgICAgaWYgKHRoaXMuc2VydmVyKSB7XG4gICAgICAgICAgICAgICAgbG9nLmluZm8oXCJDbG9zaW5nIHNwYXduZWQgT3BlbkNvZGUgc2VydmVyXCIpO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VydmVyLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VydmVyID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgbG9nLmluZm8oXCJPcGVuQ29kZSBzZXJ2ZXIgY2xvc2VkIHN1Y2Nlc3NmdWxseVwiKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1zZyA9XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIGxvZy5lcnJvcihcIkVycm9yIGNsb3NpbmcgT3BlbkNvZGUgc2VydmVyXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvck1zZyxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsb2cuZGVidWcoXG4gICAgICAgICAgICAgICAgICAgIFwiTm8gc3Bhd25lZCBzZXJ2ZXIgdG8gY2xvc2UgKGNvbm5lY3RlZCB0byBleGlzdGluZyBzZXJ2ZXIpXCIsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbG9nLmluZm8oXCJDbGVhbnVwIGNvbXBsZXRlXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNc2cgPVxuICAgICAgICAgICAgICAgIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgICAgIGxvZy5lcnJvcihcIkVycm9yIGR1cmluZyBPcGVuQ29kZSBjbGllbnQgY2xlYW51cFwiLCB7XG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yTXNnLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG59XG4iLAogICAgIi8vIFRoaXMgZmlsZSBpcyBhdXRvLWdlbmVyYXRlZCBieSBAaGV5LWFwaS9vcGVuYXBpLXRzXG5leHBvcnQgY29uc3QgY3JlYXRlU3NlQ2xpZW50ID0gKHsgb25Tc2VFcnJvciwgb25Tc2VFdmVudCwgcmVzcG9uc2VUcmFuc2Zvcm1lciwgcmVzcG9uc2VWYWxpZGF0b3IsIHNzZURlZmF1bHRSZXRyeURlbGF5LCBzc2VNYXhSZXRyeUF0dGVtcHRzLCBzc2VNYXhSZXRyeURlbGF5LCBzc2VTbGVlcEZuLCB1cmwsIC4uLm9wdGlvbnMgfSkgPT4ge1xuICAgIGxldCBsYXN0RXZlbnRJZDtcbiAgICBjb25zdCBzbGVlcCA9IHNzZVNsZWVwRm4gPz8gKChtcykgPT4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgbXMpKSk7XG4gICAgY29uc3QgY3JlYXRlU3RyZWFtID0gYXN5bmMgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgbGV0IHJldHJ5RGVsYXkgPSBzc2VEZWZhdWx0UmV0cnlEZWxheSA/PyAzMDAwO1xuICAgICAgICBsZXQgYXR0ZW1wdCA9IDA7XG4gICAgICAgIGNvbnN0IHNpZ25hbCA9IG9wdGlvbnMuc2lnbmFsID8/IG5ldyBBYm9ydENvbnRyb2xsZXIoKS5zaWduYWw7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICBpZiAoc2lnbmFsLmFib3J0ZWQpXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBhdHRlbXB0Kys7XG4gICAgICAgICAgICBjb25zdCBoZWFkZXJzID0gb3B0aW9ucy5oZWFkZXJzIGluc3RhbmNlb2YgSGVhZGVyc1xuICAgICAgICAgICAgICAgID8gb3B0aW9ucy5oZWFkZXJzXG4gICAgICAgICAgICAgICAgOiBuZXcgSGVhZGVycyhvcHRpb25zLmhlYWRlcnMpO1xuICAgICAgICAgICAgaWYgKGxhc3RFdmVudElkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBoZWFkZXJzLnNldChcIkxhc3QtRXZlbnQtSURcIiwgbGFzdEV2ZW50SWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwgeyAuLi5vcHRpb25zLCBoZWFkZXJzLCBzaWduYWwgfSk7XG4gICAgICAgICAgICAgICAgaWYgKCFyZXNwb25zZS5vaylcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBTU0UgZmFpbGVkOiAke3Jlc3BvbnNlLnN0YXR1c30gJHtyZXNwb25zZS5zdGF0dXNUZXh0fWApO1xuICAgICAgICAgICAgICAgIGlmICghcmVzcG9uc2UuYm9keSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gYm9keSBpbiBTU0UgcmVzcG9uc2VcIik7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVhZGVyID0gcmVzcG9uc2UuYm9keS5waXBlVGhyb3VnaChuZXcgVGV4dERlY29kZXJTdHJlYW0oKSkuZ2V0UmVhZGVyKCk7XG4gICAgICAgICAgICAgICAgbGV0IGJ1ZmZlciA9IFwiXCI7XG4gICAgICAgICAgICAgICAgY29uc3QgYWJvcnRIYW5kbGVyID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVhZGVyLmNhbmNlbCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhdGNoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vb3BcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgc2lnbmFsLmFkZEV2ZW50TGlzdGVuZXIoXCJhYm9ydFwiLCBhYm9ydEhhbmRsZXIpO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB7IGRvbmUsIHZhbHVlIH0gPSBhd2FpdCByZWFkZXIucmVhZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRvbmUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWZmZXIgKz0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjaHVua3MgPSBidWZmZXIuc3BsaXQoXCJcXG5cXG5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWZmZXIgPSBjaHVua3MucG9wKCkgPz8gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgY2h1bmsgb2YgY2h1bmtzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbGluZXMgPSBjaHVuay5zcGxpdChcIlxcblwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkYXRhTGluZXMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgZXZlbnROYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgbGluZSBvZiBsaW5lcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobGluZS5zdGFydHNXaXRoKFwiZGF0YTpcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFMaW5lcy5wdXNoKGxpbmUucmVwbGFjZSgvXmRhdGE6XFxzKi8sIFwiXCIpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChsaW5lLnN0YXJ0c1dpdGgoXCJldmVudDpcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZSA9IGxpbmUucmVwbGFjZSgvXmV2ZW50OlxccyovLCBcIlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChsaW5lLnN0YXJ0c1dpdGgoXCJpZDpcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RFdmVudElkID0gbGluZS5yZXBsYWNlKC9eaWQ6XFxzKi8sIFwiXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGxpbmUuc3RhcnRzV2l0aChcInJldHJ5OlwiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFyc2VkID0gTnVtYmVyLnBhcnNlSW50KGxpbmUucmVwbGFjZSgvXnJldHJ5OlxccyovLCBcIlwiKSwgMTApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFOdW1iZXIuaXNOYU4ocGFyc2VkKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHJ5RGVsYXkgPSBwYXJzZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGRhdGE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhcnNlZEpzb24gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YUxpbmVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByYXdEYXRhID0gZGF0YUxpbmVzLmpvaW4oXCJcXG5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhID0gSlNPTi5wYXJzZShyYXdEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlZEpzb24gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGNoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEgPSByYXdEYXRhO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYXJzZWRKc29uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZVZhbGlkYXRvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgcmVzcG9uc2VWYWxpZGF0b3IoZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlVHJhbnNmb3JtZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEgPSBhd2FpdCByZXNwb25zZVRyYW5zZm9ybWVyKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uU3NlRXZlbnQ/Lih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50OiBldmVudE5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBsYXN0RXZlbnRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0cnk6IHJldHJ5RGVsYXksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGFMaW5lcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeWllbGQgZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIHNpZ25hbC5yZW1vdmVFdmVudExpc3RlbmVyKFwiYWJvcnRcIiwgYWJvcnRIYW5kbGVyKTtcbiAgICAgICAgICAgICAgICAgICAgcmVhZGVyLnJlbGVhc2VMb2NrKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrOyAvLyBleGl0IGxvb3Agb24gbm9ybWFsIGNvbXBsZXRpb25cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIC8vIGNvbm5lY3Rpb24gZmFpbGVkIG9yIGFib3J0ZWQ7IHJldHJ5IGFmdGVyIGRlbGF5XG4gICAgICAgICAgICAgICAgb25Tc2VFcnJvcj8uKGVycm9yKTtcbiAgICAgICAgICAgICAgICBpZiAoc3NlTWF4UmV0cnlBdHRlbXB0cyAhPT0gdW5kZWZpbmVkICYmIGF0dGVtcHQgPj0gc3NlTWF4UmV0cnlBdHRlbXB0cykge1xuICAgICAgICAgICAgICAgICAgICBicmVhazsgLy8gc3RvcCBhZnRlciBmaXJpbmcgZXJyb3JcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gZXhwb25lbnRpYWwgYmFja29mZjogZG91YmxlIHJldHJ5IGVhY2ggYXR0ZW1wdCwgY2FwIGF0IDMwc1xuICAgICAgICAgICAgICAgIGNvbnN0IGJhY2tvZmYgPSBNYXRoLm1pbihyZXRyeURlbGF5ICogMiAqKiAoYXR0ZW1wdCAtIDEpLCBzc2VNYXhSZXRyeURlbGF5ID8/IDMwMDAwKTtcbiAgICAgICAgICAgICAgICBhd2FpdCBzbGVlcChiYWNrb2ZmKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgY29uc3Qgc3RyZWFtID0gY3JlYXRlU3RyZWFtKCk7XG4gICAgcmV0dXJuIHsgc3RyZWFtIH07XG59O1xuIiwKICAgICIvLyBUaGlzIGZpbGUgaXMgYXV0by1nZW5lcmF0ZWQgYnkgQGhleS1hcGkvb3BlbmFwaS10c1xuZXhwb3J0IGNvbnN0IGdldEF1dGhUb2tlbiA9IGFzeW5jIChhdXRoLCBjYWxsYmFjaykgPT4ge1xuICAgIGNvbnN0IHRva2VuID0gdHlwZW9mIGNhbGxiYWNrID09PSBcImZ1bmN0aW9uXCIgPyBhd2FpdCBjYWxsYmFjayhhdXRoKSA6IGNhbGxiYWNrO1xuICAgIGlmICghdG9rZW4pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoYXV0aC5zY2hlbWUgPT09IFwiYmVhcmVyXCIpIHtcbiAgICAgICAgcmV0dXJuIGBCZWFyZXIgJHt0b2tlbn1gO1xuICAgIH1cbiAgICBpZiAoYXV0aC5zY2hlbWUgPT09IFwiYmFzaWNcIikge1xuICAgICAgICByZXR1cm4gYEJhc2ljICR7YnRvYSh0b2tlbil9YDtcbiAgICB9XG4gICAgcmV0dXJuIHRva2VuO1xufTtcbiIsCiAgICAiLy8gVGhpcyBmaWxlIGlzIGF1dG8tZ2VuZXJhdGVkIGJ5IEBoZXktYXBpL29wZW5hcGktdHNcbmNvbnN0IHNlcmlhbGl6ZUZvcm1EYXRhUGFpciA9IChkYXRhLCBrZXksIHZhbHVlKSA9PiB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIiB8fCB2YWx1ZSBpbnN0YW5jZW9mIEJsb2IpIHtcbiAgICAgICAgZGF0YS5hcHBlbmQoa2V5LCB2YWx1ZSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgICAgICBkYXRhLmFwcGVuZChrZXksIHZhbHVlLnRvSVNPU3RyaW5nKCkpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZGF0YS5hcHBlbmQoa2V5LCBKU09OLnN0cmluZ2lmeSh2YWx1ZSkpO1xuICAgIH1cbn07XG5jb25zdCBzZXJpYWxpemVVcmxTZWFyY2hQYXJhbXNQYWlyID0gKGRhdGEsIGtleSwgdmFsdWUpID0+IHtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIGRhdGEuYXBwZW5kKGtleSwgdmFsdWUpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZGF0YS5hcHBlbmQoa2V5LCBKU09OLnN0cmluZ2lmeSh2YWx1ZSkpO1xuICAgIH1cbn07XG5leHBvcnQgY29uc3QgZm9ybURhdGFCb2R5U2VyaWFsaXplciA9IHtcbiAgICBib2R5U2VyaWFsaXplcjogKGJvZHkpID0+IHtcbiAgICAgICAgY29uc3QgZGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuICAgICAgICBPYmplY3QuZW50cmllcyhib2R5KS5mb3JFYWNoKChba2V5LCB2YWx1ZV0pID0+IHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUuZm9yRWFjaCgodikgPT4gc2VyaWFsaXplRm9ybURhdGFQYWlyKGRhdGEsIGtleSwgdikpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VyaWFsaXplRm9ybURhdGFQYWlyKGRhdGEsIGtleSwgdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfSxcbn07XG5leHBvcnQgY29uc3QganNvbkJvZHlTZXJpYWxpemVyID0ge1xuICAgIGJvZHlTZXJpYWxpemVyOiAoYm9keSkgPT4gSlNPTi5zdHJpbmdpZnkoYm9keSwgKF9rZXksIHZhbHVlKSA9PiAodHlwZW9mIHZhbHVlID09PSBcImJpZ2ludFwiID8gdmFsdWUudG9TdHJpbmcoKSA6IHZhbHVlKSksXG59O1xuZXhwb3J0IGNvbnN0IHVybFNlYXJjaFBhcmFtc0JvZHlTZXJpYWxpemVyID0ge1xuICAgIGJvZHlTZXJpYWxpemVyOiAoYm9keSkgPT4ge1xuICAgICAgICBjb25zdCBkYXRhID0gbmV3IFVSTFNlYXJjaFBhcmFtcygpO1xuICAgICAgICBPYmplY3QuZW50cmllcyhib2R5KS5mb3JFYWNoKChba2V5LCB2YWx1ZV0pID0+IHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUuZm9yRWFjaCgodikgPT4gc2VyaWFsaXplVXJsU2VhcmNoUGFyYW1zUGFpcihkYXRhLCBrZXksIHYpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlcmlhbGl6ZVVybFNlYXJjaFBhcmFtc1BhaXIoZGF0YSwga2V5LCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZGF0YS50b1N0cmluZygpO1xuICAgIH0sXG59O1xuIiwKICAgICIvLyBUaGlzIGZpbGUgaXMgYXV0by1nZW5lcmF0ZWQgYnkgQGhleS1hcGkvb3BlbmFwaS10c1xuZXhwb3J0IGNvbnN0IHNlcGFyYXRvckFycmF5RXhwbG9kZSA9IChzdHlsZSkgPT4ge1xuICAgIHN3aXRjaCAoc3R5bGUpIHtcbiAgICAgICAgY2FzZSBcImxhYmVsXCI6XG4gICAgICAgICAgICByZXR1cm4gXCIuXCI7XG4gICAgICAgIGNhc2UgXCJtYXRyaXhcIjpcbiAgICAgICAgICAgIHJldHVybiBcIjtcIjtcbiAgICAgICAgY2FzZSBcInNpbXBsZVwiOlxuICAgICAgICAgICAgcmV0dXJuIFwiLFwiO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIFwiJlwiO1xuICAgIH1cbn07XG5leHBvcnQgY29uc3Qgc2VwYXJhdG9yQXJyYXlOb0V4cGxvZGUgPSAoc3R5bGUpID0+IHtcbiAgICBzd2l0Y2ggKHN0eWxlKSB7XG4gICAgICAgIGNhc2UgXCJmb3JtXCI6XG4gICAgICAgICAgICByZXR1cm4gXCIsXCI7XG4gICAgICAgIGNhc2UgXCJwaXBlRGVsaW1pdGVkXCI6XG4gICAgICAgICAgICByZXR1cm4gXCJ8XCI7XG4gICAgICAgIGNhc2UgXCJzcGFjZURlbGltaXRlZFwiOlxuICAgICAgICAgICAgcmV0dXJuIFwiJTIwXCI7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gXCIsXCI7XG4gICAgfVxufTtcbmV4cG9ydCBjb25zdCBzZXBhcmF0b3JPYmplY3RFeHBsb2RlID0gKHN0eWxlKSA9PiB7XG4gICAgc3dpdGNoIChzdHlsZSkge1xuICAgICAgICBjYXNlIFwibGFiZWxcIjpcbiAgICAgICAgICAgIHJldHVybiBcIi5cIjtcbiAgICAgICAgY2FzZSBcIm1hdHJpeFwiOlxuICAgICAgICAgICAgcmV0dXJuIFwiO1wiO1xuICAgICAgICBjYXNlIFwic2ltcGxlXCI6XG4gICAgICAgICAgICByZXR1cm4gXCIsXCI7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gXCImXCI7XG4gICAgfVxufTtcbmV4cG9ydCBjb25zdCBzZXJpYWxpemVBcnJheVBhcmFtID0gKHsgYWxsb3dSZXNlcnZlZCwgZXhwbG9kZSwgbmFtZSwgc3R5bGUsIHZhbHVlLCB9KSA9PiB7XG4gICAgaWYgKCFleHBsb2RlKSB7XG4gICAgICAgIGNvbnN0IGpvaW5lZFZhbHVlcyA9IChhbGxvd1Jlc2VydmVkID8gdmFsdWUgOiB2YWx1ZS5tYXAoKHYpID0+IGVuY29kZVVSSUNvbXBvbmVudCh2KSkpLmpvaW4oc2VwYXJhdG9yQXJyYXlOb0V4cGxvZGUoc3R5bGUpKTtcbiAgICAgICAgc3dpdGNoIChzdHlsZSkge1xuICAgICAgICAgICAgY2FzZSBcImxhYmVsXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAuJHtqb2luZWRWYWx1ZXN9YDtcbiAgICAgICAgICAgIGNhc2UgXCJtYXRyaXhcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gYDske25hbWV9PSR7am9pbmVkVmFsdWVzfWA7XG4gICAgICAgICAgICBjYXNlIFwic2ltcGxlXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGpvaW5lZFZhbHVlcztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke25hbWV9PSR7am9pbmVkVmFsdWVzfWA7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3Qgc2VwYXJhdG9yID0gc2VwYXJhdG9yQXJyYXlFeHBsb2RlKHN0eWxlKTtcbiAgICBjb25zdCBqb2luZWRWYWx1ZXMgPSB2YWx1ZVxuICAgICAgICAubWFwKCh2KSA9PiB7XG4gICAgICAgIGlmIChzdHlsZSA9PT0gXCJsYWJlbFwiIHx8IHN0eWxlID09PSBcInNpbXBsZVwiKSB7XG4gICAgICAgICAgICByZXR1cm4gYWxsb3dSZXNlcnZlZCA/IHYgOiBlbmNvZGVVUklDb21wb25lbnQodik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNlcmlhbGl6ZVByaW1pdGl2ZVBhcmFtKHtcbiAgICAgICAgICAgIGFsbG93UmVzZXJ2ZWQsXG4gICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgdmFsdWU6IHYsXG4gICAgICAgIH0pO1xuICAgIH0pXG4gICAgICAgIC5qb2luKHNlcGFyYXRvcik7XG4gICAgcmV0dXJuIHN0eWxlID09PSBcImxhYmVsXCIgfHwgc3R5bGUgPT09IFwibWF0cml4XCIgPyBzZXBhcmF0b3IgKyBqb2luZWRWYWx1ZXMgOiBqb2luZWRWYWx1ZXM7XG59O1xuZXhwb3J0IGNvbnN0IHNlcmlhbGl6ZVByaW1pdGl2ZVBhcmFtID0gKHsgYWxsb3dSZXNlcnZlZCwgbmFtZSwgdmFsdWUgfSkgPT4ge1xuICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBcIlwiO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkRlZXBseS1uZXN0ZWQgYXJyYXlzL29iamVjdHMgYXJlbuKAmXQgc3VwcG9ydGVkLiBQcm92aWRlIHlvdXIgb3duIGBxdWVyeVNlcmlhbGl6ZXIoKWAgdG8gaGFuZGxlIHRoZXNlLlwiKTtcbiAgICB9XG4gICAgcmV0dXJuIGAke25hbWV9PSR7YWxsb3dSZXNlcnZlZCA/IHZhbHVlIDogZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKX1gO1xufTtcbmV4cG9ydCBjb25zdCBzZXJpYWxpemVPYmplY3RQYXJhbSA9ICh7IGFsbG93UmVzZXJ2ZWQsIGV4cGxvZGUsIG5hbWUsIHN0eWxlLCB2YWx1ZSwgdmFsdWVPbmx5LCB9KSA9PiB7XG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgICAgICByZXR1cm4gdmFsdWVPbmx5ID8gdmFsdWUudG9JU09TdHJpbmcoKSA6IGAke25hbWV9PSR7dmFsdWUudG9JU09TdHJpbmcoKX1gO1xuICAgIH1cbiAgICBpZiAoc3R5bGUgIT09IFwiZGVlcE9iamVjdFwiICYmICFleHBsb2RlKSB7XG4gICAgICAgIGxldCB2YWx1ZXMgPSBbXTtcbiAgICAgICAgT2JqZWN0LmVudHJpZXModmFsdWUpLmZvckVhY2goKFtrZXksIHZdKSA9PiB7XG4gICAgICAgICAgICB2YWx1ZXMgPSBbLi4udmFsdWVzLCBrZXksIGFsbG93UmVzZXJ2ZWQgPyB2IDogZW5jb2RlVVJJQ29tcG9uZW50KHYpXTtcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGpvaW5lZFZhbHVlcyA9IHZhbHVlcy5qb2luKFwiLFwiKTtcbiAgICAgICAgc3dpdGNoIChzdHlsZSkge1xuICAgICAgICAgICAgY2FzZSBcImZvcm1cIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7bmFtZX09JHtqb2luZWRWYWx1ZXN9YDtcbiAgICAgICAgICAgIGNhc2UgXCJsYWJlbFwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBgLiR7am9pbmVkVmFsdWVzfWA7XG4gICAgICAgICAgICBjYXNlIFwibWF0cml4XCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGA7JHtuYW1lfT0ke2pvaW5lZFZhbHVlc31gO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gam9pbmVkVmFsdWVzO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHNlcGFyYXRvciA9IHNlcGFyYXRvck9iamVjdEV4cGxvZGUoc3R5bGUpO1xuICAgIGNvbnN0IGpvaW5lZFZhbHVlcyA9IE9iamVjdC5lbnRyaWVzKHZhbHVlKVxuICAgICAgICAubWFwKChba2V5LCB2XSkgPT4gc2VyaWFsaXplUHJpbWl0aXZlUGFyYW0oe1xuICAgICAgICBhbGxvd1Jlc2VydmVkLFxuICAgICAgICBuYW1lOiBzdHlsZSA9PT0gXCJkZWVwT2JqZWN0XCIgPyBgJHtuYW1lfVske2tleX1dYCA6IGtleSxcbiAgICAgICAgdmFsdWU6IHYsXG4gICAgfSkpXG4gICAgICAgIC5qb2luKHNlcGFyYXRvcik7XG4gICAgcmV0dXJuIHN0eWxlID09PSBcImxhYmVsXCIgfHwgc3R5bGUgPT09IFwibWF0cml4XCIgPyBzZXBhcmF0b3IgKyBqb2luZWRWYWx1ZXMgOiBqb2luZWRWYWx1ZXM7XG59O1xuIiwKICAgICIvLyBUaGlzIGZpbGUgaXMgYXV0by1nZW5lcmF0ZWQgYnkgQGhleS1hcGkvb3BlbmFwaS10c1xuaW1wb3J0IHsgc2VyaWFsaXplQXJyYXlQYXJhbSwgc2VyaWFsaXplT2JqZWN0UGFyYW0sIHNlcmlhbGl6ZVByaW1pdGl2ZVBhcmFtLCB9IGZyb20gXCIuL3BhdGhTZXJpYWxpemVyLmdlbi5qc1wiO1xuZXhwb3J0IGNvbnN0IFBBVEhfUEFSQU1fUkUgPSAvXFx7W157fV0rXFx9L2c7XG5leHBvcnQgY29uc3QgZGVmYXVsdFBhdGhTZXJpYWxpemVyID0gKHsgcGF0aCwgdXJsOiBfdXJsIH0pID0+IHtcbiAgICBsZXQgdXJsID0gX3VybDtcbiAgICBjb25zdCBtYXRjaGVzID0gX3VybC5tYXRjaChQQVRIX1BBUkFNX1JFKTtcbiAgICBpZiAobWF0Y2hlcykge1xuICAgICAgICBmb3IgKGNvbnN0IG1hdGNoIG9mIG1hdGNoZXMpIHtcbiAgICAgICAgICAgIGxldCBleHBsb2RlID0gZmFsc2U7XG4gICAgICAgICAgICBsZXQgbmFtZSA9IG1hdGNoLnN1YnN0cmluZygxLCBtYXRjaC5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgIGxldCBzdHlsZSA9IFwic2ltcGxlXCI7XG4gICAgICAgICAgICBpZiAobmFtZS5lbmRzV2l0aChcIipcIikpIHtcbiAgICAgICAgICAgICAgICBleHBsb2RlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBuYW1lID0gbmFtZS5zdWJzdHJpbmcoMCwgbmFtZS5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChuYW1lLnN0YXJ0c1dpdGgoXCIuXCIpKSB7XG4gICAgICAgICAgICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyaW5nKDEpO1xuICAgICAgICAgICAgICAgIHN0eWxlID0gXCJsYWJlbFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobmFtZS5zdGFydHNXaXRoKFwiO1wiKSkge1xuICAgICAgICAgICAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cmluZygxKTtcbiAgICAgICAgICAgICAgICBzdHlsZSA9IFwibWF0cml4XCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHBhdGhbbmFtZV07XG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgdXJsID0gdXJsLnJlcGxhY2UobWF0Y2gsIHNlcmlhbGl6ZUFycmF5UGFyYW0oeyBleHBsb2RlLCBuYW1lLCBzdHlsZSwgdmFsdWUgfSkpO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgICAgIHVybCA9IHVybC5yZXBsYWNlKG1hdGNoLCBzZXJpYWxpemVPYmplY3RQYXJhbSh7XG4gICAgICAgICAgICAgICAgICAgIGV4cGxvZGUsXG4gICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlT25seTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc3R5bGUgPT09IFwibWF0cml4XCIpIHtcbiAgICAgICAgICAgICAgICB1cmwgPSB1cmwucmVwbGFjZShtYXRjaCwgYDske3NlcmlhbGl6ZVByaW1pdGl2ZVBhcmFtKHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgICAgIH0pfWApO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcmVwbGFjZVZhbHVlID0gZW5jb2RlVVJJQ29tcG9uZW50KHN0eWxlID09PSBcImxhYmVsXCIgPyBgLiR7dmFsdWV9YCA6IHZhbHVlKTtcbiAgICAgICAgICAgIHVybCA9IHVybC5yZXBsYWNlKG1hdGNoLCByZXBsYWNlVmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB1cmw7XG59O1xuZXhwb3J0IGNvbnN0IGdldFVybCA9ICh7IGJhc2VVcmwsIHBhdGgsIHF1ZXJ5LCBxdWVyeVNlcmlhbGl6ZXIsIHVybDogX3VybCwgfSkgPT4ge1xuICAgIGNvbnN0IHBhdGhVcmwgPSBfdXJsLnN0YXJ0c1dpdGgoXCIvXCIpID8gX3VybCA6IGAvJHtfdXJsfWA7XG4gICAgbGV0IHVybCA9IChiYXNlVXJsID8/IFwiXCIpICsgcGF0aFVybDtcbiAgICBpZiAocGF0aCkge1xuICAgICAgICB1cmwgPSBkZWZhdWx0UGF0aFNlcmlhbGl6ZXIoeyBwYXRoLCB1cmwgfSk7XG4gICAgfVxuICAgIGxldCBzZWFyY2ggPSBxdWVyeSA/IHF1ZXJ5U2VyaWFsaXplcihxdWVyeSkgOiBcIlwiO1xuICAgIGlmIChzZWFyY2guc3RhcnRzV2l0aChcIj9cIikpIHtcbiAgICAgICAgc2VhcmNoID0gc2VhcmNoLnN1YnN0cmluZygxKTtcbiAgICB9XG4gICAgaWYgKHNlYXJjaCkge1xuICAgICAgICB1cmwgKz0gYD8ke3NlYXJjaH1gO1xuICAgIH1cbiAgICByZXR1cm4gdXJsO1xufTtcbiIsCiAgICAiLy8gVGhpcyBmaWxlIGlzIGF1dG8tZ2VuZXJhdGVkIGJ5IEBoZXktYXBpL29wZW5hcGktdHNcbmltcG9ydCB7IGdldEF1dGhUb2tlbiB9IGZyb20gXCIuLi9jb3JlL2F1dGguZ2VuLmpzXCI7XG5pbXBvcnQgeyBqc29uQm9keVNlcmlhbGl6ZXIgfSBmcm9tIFwiLi4vY29yZS9ib2R5U2VyaWFsaXplci5nZW4uanNcIjtcbmltcG9ydCB7IHNlcmlhbGl6ZUFycmF5UGFyYW0sIHNlcmlhbGl6ZU9iamVjdFBhcmFtLCBzZXJpYWxpemVQcmltaXRpdmVQYXJhbSB9IGZyb20gXCIuLi9jb3JlL3BhdGhTZXJpYWxpemVyLmdlbi5qc1wiO1xuaW1wb3J0IHsgZ2V0VXJsIH0gZnJvbSBcIi4uL2NvcmUvdXRpbHMuZ2VuLmpzXCI7XG5leHBvcnQgY29uc3QgY3JlYXRlUXVlcnlTZXJpYWxpemVyID0gKHsgYWxsb3dSZXNlcnZlZCwgYXJyYXksIG9iamVjdCB9ID0ge30pID0+IHtcbiAgICBjb25zdCBxdWVyeVNlcmlhbGl6ZXIgPSAocXVlcnlQYXJhbXMpID0+IHtcbiAgICAgICAgY29uc3Qgc2VhcmNoID0gW107XG4gICAgICAgIGlmIChxdWVyeVBhcmFtcyAmJiB0eXBlb2YgcXVlcnlQYXJhbXMgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgbmFtZSBpbiBxdWVyeVBhcmFtcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gcXVlcnlQYXJhbXNbbmFtZV07XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzZXJpYWxpemVkQXJyYXkgPSBzZXJpYWxpemVBcnJheVBhcmFtKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsbG93UmVzZXJ2ZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBleHBsb2RlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiBcImZvcm1cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uYXJyYXksXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2VyaWFsaXplZEFycmF5KVxuICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoLnB1c2goc2VyaWFsaXplZEFycmF5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlcmlhbGl6ZWRPYmplY3QgPSBzZXJpYWxpemVPYmplY3RQYXJhbSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbGxvd1Jlc2VydmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXhwbG9kZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogXCJkZWVwT2JqZWN0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5vYmplY3QsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2VyaWFsaXplZE9iamVjdClcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaC5wdXNoKHNlcmlhbGl6ZWRPYmplY3QpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VyaWFsaXplZFByaW1pdGl2ZSA9IHNlcmlhbGl6ZVByaW1pdGl2ZVBhcmFtKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsbG93UmVzZXJ2ZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlcmlhbGl6ZWRQcmltaXRpdmUpXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWFyY2gucHVzaChzZXJpYWxpemVkUHJpbWl0aXZlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNlYXJjaC5qb2luKFwiJlwiKTtcbiAgICB9O1xuICAgIHJldHVybiBxdWVyeVNlcmlhbGl6ZXI7XG59O1xuLyoqXG4gKiBJbmZlcnMgcGFyc2VBcyB2YWx1ZSBmcm9tIHByb3ZpZGVkIENvbnRlbnQtVHlwZSBoZWFkZXIuXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRQYXJzZUFzID0gKGNvbnRlbnRUeXBlKSA9PiB7XG4gICAgaWYgKCFjb250ZW50VHlwZSkge1xuICAgICAgICAvLyBJZiBubyBDb250ZW50LVR5cGUgaGVhZGVyIGlzIHByb3ZpZGVkLCB0aGUgYmVzdCB3ZSBjYW4gZG8gaXMgcmV0dXJuIHRoZSByYXcgcmVzcG9uc2UgYm9keSxcbiAgICAgICAgLy8gd2hpY2ggaXMgZWZmZWN0aXZlbHkgdGhlIHNhbWUgYXMgdGhlICdzdHJlYW0nIG9wdGlvbi5cbiAgICAgICAgcmV0dXJuIFwic3RyZWFtXCI7XG4gICAgfVxuICAgIGNvbnN0IGNsZWFuQ29udGVudCA9IGNvbnRlbnRUeXBlLnNwbGl0KFwiO1wiKVswXT8udHJpbSgpO1xuICAgIGlmICghY2xlYW5Db250ZW50KSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGNsZWFuQ29udGVudC5zdGFydHNXaXRoKFwiYXBwbGljYXRpb24vanNvblwiKSB8fCBjbGVhbkNvbnRlbnQuZW5kc1dpdGgoXCIranNvblwiKSkge1xuICAgICAgICByZXR1cm4gXCJqc29uXCI7XG4gICAgfVxuICAgIGlmIChjbGVhbkNvbnRlbnQgPT09IFwibXVsdGlwYXJ0L2Zvcm0tZGF0YVwiKSB7XG4gICAgICAgIHJldHVybiBcImZvcm1EYXRhXCI7XG4gICAgfVxuICAgIGlmIChbXCJhcHBsaWNhdGlvbi9cIiwgXCJhdWRpby9cIiwgXCJpbWFnZS9cIiwgXCJ2aWRlby9cIl0uc29tZSgodHlwZSkgPT4gY2xlYW5Db250ZW50LnN0YXJ0c1dpdGgodHlwZSkpKSB7XG4gICAgICAgIHJldHVybiBcImJsb2JcIjtcbiAgICB9XG4gICAgaWYgKGNsZWFuQ29udGVudC5zdGFydHNXaXRoKFwidGV4dC9cIikpIHtcbiAgICAgICAgcmV0dXJuIFwidGV4dFwiO1xuICAgIH1cbiAgICByZXR1cm47XG59O1xuY29uc3QgY2hlY2tGb3JFeGlzdGVuY2UgPSAob3B0aW9ucywgbmFtZSkgPT4ge1xuICAgIGlmICghbmFtZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmIChvcHRpb25zLmhlYWRlcnMuaGFzKG5hbWUpIHx8IG9wdGlvbnMucXVlcnk/LltuYW1lXSB8fCBvcHRpb25zLmhlYWRlcnMuZ2V0KFwiQ29va2llXCIpPy5pbmNsdWRlcyhgJHtuYW1lfT1gKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufTtcbmV4cG9ydCBjb25zdCBzZXRBdXRoUGFyYW1zID0gYXN5bmMgKHsgc2VjdXJpdHksIC4uLm9wdGlvbnMgfSkgPT4ge1xuICAgIGZvciAoY29uc3QgYXV0aCBvZiBzZWN1cml0eSkge1xuICAgICAgICBpZiAoY2hlY2tGb3JFeGlzdGVuY2Uob3B0aW9ucywgYXV0aC5uYW1lKSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdG9rZW4gPSBhd2FpdCBnZXRBdXRoVG9rZW4oYXV0aCwgb3B0aW9ucy5hdXRoKTtcbiAgICAgICAgaWYgKCF0b2tlbikge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbmFtZSA9IGF1dGgubmFtZSA/PyBcIkF1dGhvcml6YXRpb25cIjtcbiAgICAgICAgc3dpdGNoIChhdXRoLmluKSB7XG4gICAgICAgICAgICBjYXNlIFwicXVlcnlcIjpcbiAgICAgICAgICAgICAgICBpZiAoIW9wdGlvbnMucXVlcnkpIHtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5xdWVyeSA9IHt9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBvcHRpb25zLnF1ZXJ5W25hbWVdID0gdG9rZW47XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiY29va2llXCI6XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5oZWFkZXJzLmFwcGVuZChcIkNvb2tpZVwiLCBgJHtuYW1lfT0ke3Rva2VufWApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImhlYWRlclwiOlxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBvcHRpb25zLmhlYWRlcnMuc2V0KG5hbWUsIHRva2VuKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbn07XG5leHBvcnQgY29uc3QgYnVpbGRVcmwgPSAob3B0aW9ucykgPT4gZ2V0VXJsKHtcbiAgICBiYXNlVXJsOiBvcHRpb25zLmJhc2VVcmwsXG4gICAgcGF0aDogb3B0aW9ucy5wYXRoLFxuICAgIHF1ZXJ5OiBvcHRpb25zLnF1ZXJ5LFxuICAgIHF1ZXJ5U2VyaWFsaXplcjogdHlwZW9mIG9wdGlvbnMucXVlcnlTZXJpYWxpemVyID09PSBcImZ1bmN0aW9uXCJcbiAgICAgICAgPyBvcHRpb25zLnF1ZXJ5U2VyaWFsaXplclxuICAgICAgICA6IGNyZWF0ZVF1ZXJ5U2VyaWFsaXplcihvcHRpb25zLnF1ZXJ5U2VyaWFsaXplciksXG4gICAgdXJsOiBvcHRpb25zLnVybCxcbn0pO1xuZXhwb3J0IGNvbnN0IG1lcmdlQ29uZmlncyA9IChhLCBiKSA9PiB7XG4gICAgY29uc3QgY29uZmlnID0geyAuLi5hLCAuLi5iIH07XG4gICAgaWYgKGNvbmZpZy5iYXNlVXJsPy5lbmRzV2l0aChcIi9cIikpIHtcbiAgICAgICAgY29uZmlnLmJhc2VVcmwgPSBjb25maWcuYmFzZVVybC5zdWJzdHJpbmcoMCwgY29uZmlnLmJhc2VVcmwubGVuZ3RoIC0gMSk7XG4gICAgfVxuICAgIGNvbmZpZy5oZWFkZXJzID0gbWVyZ2VIZWFkZXJzKGEuaGVhZGVycywgYi5oZWFkZXJzKTtcbiAgICByZXR1cm4gY29uZmlnO1xufTtcbmV4cG9ydCBjb25zdCBtZXJnZUhlYWRlcnMgPSAoLi4uaGVhZGVycykgPT4ge1xuICAgIGNvbnN0IG1lcmdlZEhlYWRlcnMgPSBuZXcgSGVhZGVycygpO1xuICAgIGZvciAoY29uc3QgaGVhZGVyIG9mIGhlYWRlcnMpIHtcbiAgICAgICAgaWYgKCFoZWFkZXIgfHwgdHlwZW9mIGhlYWRlciAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaXRlcmF0b3IgPSBoZWFkZXIgaW5zdGFuY2VvZiBIZWFkZXJzID8gaGVhZGVyLmVudHJpZXMoKSA6IE9iamVjdC5lbnRyaWVzKGhlYWRlcik7XG4gICAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIGl0ZXJhdG9yKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBtZXJnZWRIZWFkZXJzLmRlbGV0ZShrZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHYgb2YgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVyZ2VkSGVhZGVycy5hcHBlbmQoa2V5LCB2KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgLy8gYXNzdW1lIG9iamVjdCBoZWFkZXJzIGFyZSBtZWFudCB0byBiZSBKU09OIHN0cmluZ2lmaWVkLCBpLmUuIHRoZWlyXG4gICAgICAgICAgICAgICAgLy8gY29udGVudCB2YWx1ZSBpbiBPcGVuQVBJIHNwZWNpZmljYXRpb24gaXMgJ2FwcGxpY2F0aW9uL2pzb24nXG4gICAgICAgICAgICAgICAgbWVyZ2VkSGVhZGVycy5zZXQoa2V5LCB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgPyBKU09OLnN0cmluZ2lmeSh2YWx1ZSkgOiB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG1lcmdlZEhlYWRlcnM7XG59O1xuY2xhc3MgSW50ZXJjZXB0b3JzIHtcbiAgICBfZm5zO1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLl9mbnMgPSBbXTtcbiAgICB9XG4gICAgY2xlYXIoKSB7XG4gICAgICAgIHRoaXMuX2ZucyA9IFtdO1xuICAgIH1cbiAgICBnZXRJbnRlcmNlcHRvckluZGV4KGlkKSB7XG4gICAgICAgIGlmICh0eXBlb2YgaWQgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9mbnNbaWRdID8gaWQgOiAtMTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9mbnMuaW5kZXhPZihpZCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZXhpc3RzKGlkKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5nZXRJbnRlcmNlcHRvckluZGV4KGlkKTtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZm5zW2luZGV4XTtcbiAgICB9XG4gICAgZWplY3QoaWQpIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmdldEludGVyY2VwdG9ySW5kZXgoaWQpO1xuICAgICAgICBpZiAodGhpcy5fZm5zW2luZGV4XSkge1xuICAgICAgICAgICAgdGhpcy5fZm5zW2luZGV4XSA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdXBkYXRlKGlkLCBmbikge1xuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuZ2V0SW50ZXJjZXB0b3JJbmRleChpZCk7XG4gICAgICAgIGlmICh0aGlzLl9mbnNbaW5kZXhdKSB7XG4gICAgICAgICAgICB0aGlzLl9mbnNbaW5kZXhdID0gZm47XG4gICAgICAgICAgICByZXR1cm4gaWQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdXNlKGZuKSB7XG4gICAgICAgIHRoaXMuX2ZucyA9IFsuLi50aGlzLl9mbnMsIGZuXTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Zucy5sZW5ndGggLSAxO1xuICAgIH1cbn1cbi8vIGRvIG5vdCBhZGQgYE1pZGRsZXdhcmVgIGFzIHJldHVybiB0eXBlIHNvIHdlIGNhbiB1c2UgX2ZucyBpbnRlcm5hbGx5XG5leHBvcnQgY29uc3QgY3JlYXRlSW50ZXJjZXB0b3JzID0gKCkgPT4gKHtcbiAgICBlcnJvcjogbmV3IEludGVyY2VwdG9ycygpLFxuICAgIHJlcXVlc3Q6IG5ldyBJbnRlcmNlcHRvcnMoKSxcbiAgICByZXNwb25zZTogbmV3IEludGVyY2VwdG9ycygpLFxufSk7XG5jb25zdCBkZWZhdWx0UXVlcnlTZXJpYWxpemVyID0gY3JlYXRlUXVlcnlTZXJpYWxpemVyKHtcbiAgICBhbGxvd1Jlc2VydmVkOiBmYWxzZSxcbiAgICBhcnJheToge1xuICAgICAgICBleHBsb2RlOiB0cnVlLFxuICAgICAgICBzdHlsZTogXCJmb3JtXCIsXG4gICAgfSxcbiAgICBvYmplY3Q6IHtcbiAgICAgICAgZXhwbG9kZTogdHJ1ZSxcbiAgICAgICAgc3R5bGU6IFwiZGVlcE9iamVjdFwiLFxuICAgIH0sXG59KTtcbmNvbnN0IGRlZmF1bHRIZWFkZXJzID0ge1xuICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxufTtcbmV4cG9ydCBjb25zdCBjcmVhdGVDb25maWcgPSAob3ZlcnJpZGUgPSB7fSkgPT4gKHtcbiAgICAuLi5qc29uQm9keVNlcmlhbGl6ZXIsXG4gICAgaGVhZGVyczogZGVmYXVsdEhlYWRlcnMsXG4gICAgcGFyc2VBczogXCJhdXRvXCIsXG4gICAgcXVlcnlTZXJpYWxpemVyOiBkZWZhdWx0UXVlcnlTZXJpYWxpemVyLFxuICAgIC4uLm92ZXJyaWRlLFxufSk7XG4iLAogICAgIi8vIFRoaXMgZmlsZSBpcyBhdXRvLWdlbmVyYXRlZCBieSBAaGV5LWFwaS9vcGVuYXBpLXRzXG5pbXBvcnQgeyBjcmVhdGVTc2VDbGllbnQgfSBmcm9tIFwiLi4vY29yZS9zZXJ2ZXJTZW50RXZlbnRzLmdlbi5qc1wiO1xuaW1wb3J0IHsgYnVpbGRVcmwsIGNyZWF0ZUNvbmZpZywgY3JlYXRlSW50ZXJjZXB0b3JzLCBnZXRQYXJzZUFzLCBtZXJnZUNvbmZpZ3MsIG1lcmdlSGVhZGVycywgc2V0QXV0aFBhcmFtcywgfSBmcm9tIFwiLi91dGlscy5nZW4uanNcIjtcbmV4cG9ydCBjb25zdCBjcmVhdGVDbGllbnQgPSAoY29uZmlnID0ge30pID0+IHtcbiAgICBsZXQgX2NvbmZpZyA9IG1lcmdlQ29uZmlncyhjcmVhdGVDb25maWcoKSwgY29uZmlnKTtcbiAgICBjb25zdCBnZXRDb25maWcgPSAoKSA9PiAoeyAuLi5fY29uZmlnIH0pO1xuICAgIGNvbnN0IHNldENvbmZpZyA9IChjb25maWcpID0+IHtcbiAgICAgICAgX2NvbmZpZyA9IG1lcmdlQ29uZmlncyhfY29uZmlnLCBjb25maWcpO1xuICAgICAgICByZXR1cm4gZ2V0Q29uZmlnKCk7XG4gICAgfTtcbiAgICBjb25zdCBpbnRlcmNlcHRvcnMgPSBjcmVhdGVJbnRlcmNlcHRvcnMoKTtcbiAgICBjb25zdCBiZWZvcmVSZXF1ZXN0ID0gYXN5bmMgKG9wdGlvbnMpID0+IHtcbiAgICAgICAgY29uc3Qgb3B0cyA9IHtcbiAgICAgICAgICAgIC4uLl9jb25maWcsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgZmV0Y2g6IG9wdGlvbnMuZmV0Y2ggPz8gX2NvbmZpZy5mZXRjaCA/PyBnbG9iYWxUaGlzLmZldGNoLFxuICAgICAgICAgICAgaGVhZGVyczogbWVyZ2VIZWFkZXJzKF9jb25maWcuaGVhZGVycywgb3B0aW9ucy5oZWFkZXJzKSxcbiAgICAgICAgICAgIHNlcmlhbGl6ZWRCb2R5OiB1bmRlZmluZWQsXG4gICAgICAgIH07XG4gICAgICAgIGlmIChvcHRzLnNlY3VyaXR5KSB7XG4gICAgICAgICAgICBhd2FpdCBzZXRBdXRoUGFyYW1zKHtcbiAgICAgICAgICAgICAgICAuLi5vcHRzLFxuICAgICAgICAgICAgICAgIHNlY3VyaXR5OiBvcHRzLnNlY3VyaXR5LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9wdHMucmVxdWVzdFZhbGlkYXRvcikge1xuICAgICAgICAgICAgYXdhaXQgb3B0cy5yZXF1ZXN0VmFsaWRhdG9yKG9wdHMpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvcHRzLmJvZHkgJiYgb3B0cy5ib2R5U2VyaWFsaXplcikge1xuICAgICAgICAgICAgb3B0cy5zZXJpYWxpemVkQm9keSA9IG9wdHMuYm9keVNlcmlhbGl6ZXIob3B0cy5ib2R5KTtcbiAgICAgICAgfVxuICAgICAgICAvLyByZW1vdmUgQ29udGVudC1UeXBlIGhlYWRlciBpZiBib2R5IGlzIGVtcHR5IHRvIGF2b2lkIHNlbmRpbmcgaW52YWxpZCByZXF1ZXN0c1xuICAgICAgICBpZiAob3B0cy5zZXJpYWxpemVkQm9keSA9PT0gdW5kZWZpbmVkIHx8IG9wdHMuc2VyaWFsaXplZEJvZHkgPT09IFwiXCIpIHtcbiAgICAgICAgICAgIG9wdHMuaGVhZGVycy5kZWxldGUoXCJDb250ZW50LVR5cGVcIik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdXJsID0gYnVpbGRVcmwob3B0cyk7XG4gICAgICAgIHJldHVybiB7IG9wdHMsIHVybCB9O1xuICAgIH07XG4gICAgY29uc3QgcmVxdWVzdCA9IGFzeW5jIChvcHRpb25zKSA9PiB7XG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICAgICAgY29uc3QgeyBvcHRzLCB1cmwgfSA9IGF3YWl0IGJlZm9yZVJlcXVlc3Qob3B0aW9ucyk7XG4gICAgICAgIGNvbnN0IHJlcXVlc3RJbml0ID0ge1xuICAgICAgICAgICAgcmVkaXJlY3Q6IFwiZm9sbG93XCIsXG4gICAgICAgICAgICAuLi5vcHRzLFxuICAgICAgICAgICAgYm9keTogb3B0cy5zZXJpYWxpemVkQm9keSxcbiAgICAgICAgfTtcbiAgICAgICAgbGV0IHJlcXVlc3QgPSBuZXcgUmVxdWVzdCh1cmwsIHJlcXVlc3RJbml0KTtcbiAgICAgICAgZm9yIChjb25zdCBmbiBvZiBpbnRlcmNlcHRvcnMucmVxdWVzdC5fZm5zKSB7XG4gICAgICAgICAgICBpZiAoZm4pIHtcbiAgICAgICAgICAgICAgICByZXF1ZXN0ID0gYXdhaXQgZm4ocmVxdWVzdCwgb3B0cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gZmV0Y2ggbXVzdCBiZSBhc3NpZ25lZCBoZXJlLCBvdGhlcndpc2UgaXQgd291bGQgdGhyb3cgdGhlIGVycm9yOlxuICAgICAgICAvLyBUeXBlRXJyb3I6IEZhaWxlZCB0byBleGVjdXRlICdmZXRjaCcgb24gJ1dpbmRvdyc6IElsbGVnYWwgaW52b2NhdGlvblxuICAgICAgICBjb25zdCBfZmV0Y2ggPSBvcHRzLmZldGNoO1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCBfZmV0Y2gocmVxdWVzdCk7XG4gICAgICAgIGZvciAoY29uc3QgZm4gb2YgaW50ZXJjZXB0b3JzLnJlc3BvbnNlLl9mbnMpIHtcbiAgICAgICAgICAgIGlmIChmbikge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gYXdhaXQgZm4ocmVzcG9uc2UsIHJlcXVlc3QsIG9wdHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgIHJlcXVlc3QsXG4gICAgICAgICAgICByZXNwb25zZSxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHJlc3BvbnNlLm9rKSB7XG4gICAgICAgICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID09PSAyMDQgfHwgcmVzcG9uc2UuaGVhZGVycy5nZXQoXCJDb250ZW50LUxlbmd0aFwiKSA9PT0gXCIwXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0cy5yZXNwb25zZVN0eWxlID09PSBcImRhdGFcIlxuICAgICAgICAgICAgICAgICAgICA/IHt9XG4gICAgICAgICAgICAgICAgICAgIDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge30sXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5yZXN1bHQsXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBwYXJzZUFzID0gKG9wdHMucGFyc2VBcyA9PT0gXCJhdXRvXCIgPyBnZXRQYXJzZUFzKHJlc3BvbnNlLmhlYWRlcnMuZ2V0KFwiQ29udGVudC1UeXBlXCIpKSA6IG9wdHMucGFyc2VBcykgPz8gXCJqc29uXCI7XG4gICAgICAgICAgICBsZXQgZGF0YTtcbiAgICAgICAgICAgIHN3aXRjaCAocGFyc2VBcykge1xuICAgICAgICAgICAgICAgIGNhc2UgXCJhcnJheUJ1ZmZlclwiOlxuICAgICAgICAgICAgICAgIGNhc2UgXCJibG9iXCI6XG4gICAgICAgICAgICAgICAgY2FzZSBcImZvcm1EYXRhXCI6XG4gICAgICAgICAgICAgICAgY2FzZSBcImpzb25cIjpcbiAgICAgICAgICAgICAgICBjYXNlIFwidGV4dFwiOlxuICAgICAgICAgICAgICAgICAgICBkYXRhID0gYXdhaXQgcmVzcG9uc2VbcGFyc2VBc10oKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcInN0cmVhbVwiOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3B0cy5yZXNwb25zZVN0eWxlID09PSBcImRhdGFcIlxuICAgICAgICAgICAgICAgICAgICAgICAgPyByZXNwb25zZS5ib2R5XG4gICAgICAgICAgICAgICAgICAgICAgICA6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiByZXNwb25zZS5ib2R5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLnJlc3VsdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocGFyc2VBcyA9PT0gXCJqc29uXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAob3B0cy5yZXNwb25zZVZhbGlkYXRvcikge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBvcHRzLnJlc3BvbnNlVmFsaWRhdG9yKGRhdGEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAob3B0cy5yZXNwb25zZVRyYW5zZm9ybWVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGEgPSBhd2FpdCBvcHRzLnJlc3BvbnNlVHJhbnNmb3JtZXIoZGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG9wdHMucmVzcG9uc2VTdHlsZSA9PT0gXCJkYXRhXCJcbiAgICAgICAgICAgICAgICA/IGRhdGFcbiAgICAgICAgICAgICAgICA6IHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgLi4ucmVzdWx0LFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdGV4dEVycm9yID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICAgICAgICBsZXQganNvbkVycm9yO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAganNvbkVycm9yID0gSlNPTi5wYXJzZSh0ZXh0RXJyb3IpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIHtcbiAgICAgICAgICAgIC8vIG5vb3BcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBlcnJvciA9IGpzb25FcnJvciA/PyB0ZXh0RXJyb3I7XG4gICAgICAgIGxldCBmaW5hbEVycm9yID0gZXJyb3I7XG4gICAgICAgIGZvciAoY29uc3QgZm4gb2YgaW50ZXJjZXB0b3JzLmVycm9yLl9mbnMpIHtcbiAgICAgICAgICAgIGlmIChmbikge1xuICAgICAgICAgICAgICAgIGZpbmFsRXJyb3IgPSAoYXdhaXQgZm4oZXJyb3IsIHJlc3BvbnNlLCByZXF1ZXN0LCBvcHRzKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxFcnJvciA9IGZpbmFsRXJyb3IgfHwge307XG4gICAgICAgIGlmIChvcHRzLnRocm93T25FcnJvcikge1xuICAgICAgICAgICAgdGhyb3cgZmluYWxFcnJvcjtcbiAgICAgICAgfVxuICAgICAgICAvLyBUT0RPOiB3ZSBwcm9iYWJseSB3YW50IHRvIHJldHVybiBlcnJvciBhbmQgaW1wcm92ZSB0eXBlc1xuICAgICAgICByZXR1cm4gb3B0cy5yZXNwb25zZVN0eWxlID09PSBcImRhdGFcIlxuICAgICAgICAgICAgPyB1bmRlZmluZWRcbiAgICAgICAgICAgIDoge1xuICAgICAgICAgICAgICAgIGVycm9yOiBmaW5hbEVycm9yLFxuICAgICAgICAgICAgICAgIC4uLnJlc3VsdCxcbiAgICAgICAgICAgIH07XG4gICAgfTtcbiAgICBjb25zdCBtYWtlTWV0aG9kID0gKG1ldGhvZCkgPT4ge1xuICAgICAgICBjb25zdCBmbiA9IChvcHRpb25zKSA9PiByZXF1ZXN0KHsgLi4ub3B0aW9ucywgbWV0aG9kIH0pO1xuICAgICAgICBmbi5zc2UgPSBhc3luYyAob3B0aW9ucykgPT4ge1xuICAgICAgICAgICAgY29uc3QgeyBvcHRzLCB1cmwgfSA9IGF3YWl0IGJlZm9yZVJlcXVlc3Qob3B0aW9ucyk7XG4gICAgICAgICAgICByZXR1cm4gY3JlYXRlU3NlQ2xpZW50KHtcbiAgICAgICAgICAgICAgICAuLi5vcHRzLFxuICAgICAgICAgICAgICAgIGJvZHk6IG9wdHMuYm9keSxcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiBvcHRzLmhlYWRlcnMsXG4gICAgICAgICAgICAgICAgbWV0aG9kLFxuICAgICAgICAgICAgICAgIHVybCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gZm47XG4gICAgfTtcbiAgICByZXR1cm4ge1xuICAgICAgICBidWlsZFVybCxcbiAgICAgICAgY29ubmVjdDogbWFrZU1ldGhvZChcIkNPTk5FQ1RcIiksXG4gICAgICAgIGRlbGV0ZTogbWFrZU1ldGhvZChcIkRFTEVURVwiKSxcbiAgICAgICAgZ2V0OiBtYWtlTWV0aG9kKFwiR0VUXCIpLFxuICAgICAgICBnZXRDb25maWcsXG4gICAgICAgIGhlYWQ6IG1ha2VNZXRob2QoXCJIRUFEXCIpLFxuICAgICAgICBpbnRlcmNlcHRvcnMsXG4gICAgICAgIG9wdGlvbnM6IG1ha2VNZXRob2QoXCJPUFRJT05TXCIpLFxuICAgICAgICBwYXRjaDogbWFrZU1ldGhvZChcIlBBVENIXCIpLFxuICAgICAgICBwb3N0OiBtYWtlTWV0aG9kKFwiUE9TVFwiKSxcbiAgICAgICAgcHV0OiBtYWtlTWV0aG9kKFwiUFVUXCIpLFxuICAgICAgICByZXF1ZXN0LFxuICAgICAgICBzZXRDb25maWcsXG4gICAgICAgIHRyYWNlOiBtYWtlTWV0aG9kKFwiVFJBQ0VcIiksXG4gICAgfTtcbn07XG4iLAogICAgIi8vIFRoaXMgZmlsZSBpcyBhdXRvLWdlbmVyYXRlZCBieSBAaGV5LWFwaS9vcGVuYXBpLXRzXG5jb25zdCBleHRyYVByZWZpeGVzTWFwID0ge1xuICAgICRib2R5XzogXCJib2R5XCIsXG4gICAgJGhlYWRlcnNfOiBcImhlYWRlcnNcIixcbiAgICAkcGF0aF86IFwicGF0aFwiLFxuICAgICRxdWVyeV86IFwicXVlcnlcIixcbn07XG5jb25zdCBleHRyYVByZWZpeGVzID0gT2JqZWN0LmVudHJpZXMoZXh0cmFQcmVmaXhlc01hcCk7XG5jb25zdCBidWlsZEtleU1hcCA9IChmaWVsZHMsIG1hcCkgPT4ge1xuICAgIGlmICghbWFwKSB7XG4gICAgICAgIG1hcCA9IG5ldyBNYXAoKTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBjb25maWcgb2YgZmllbGRzKSB7XG4gICAgICAgIGlmIChcImluXCIgaW4gY29uZmlnKSB7XG4gICAgICAgICAgICBpZiAoY29uZmlnLmtleSkge1xuICAgICAgICAgICAgICAgIG1hcC5zZXQoY29uZmlnLmtleSwge1xuICAgICAgICAgICAgICAgICAgICBpbjogY29uZmlnLmluLFxuICAgICAgICAgICAgICAgICAgICBtYXA6IGNvbmZpZy5tYXAsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoY29uZmlnLmFyZ3MpIHtcbiAgICAgICAgICAgIGJ1aWxkS2V5TWFwKGNvbmZpZy5hcmdzLCBtYXApO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBtYXA7XG59O1xuY29uc3Qgc3RyaXBFbXB0eVNsb3RzID0gKHBhcmFtcykgPT4ge1xuICAgIGZvciAoY29uc3QgW3Nsb3QsIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhwYXJhbXMpKSB7XG4gICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgJiYgIU9iamVjdC5rZXlzKHZhbHVlKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBwYXJhbXNbc2xvdF07XG4gICAgICAgIH1cbiAgICB9XG59O1xuZXhwb3J0IGNvbnN0IGJ1aWxkQ2xpZW50UGFyYW1zID0gKGFyZ3MsIGZpZWxkcykgPT4ge1xuICAgIGNvbnN0IHBhcmFtcyA9IHtcbiAgICAgICAgYm9keToge30sXG4gICAgICAgIGhlYWRlcnM6IHt9LFxuICAgICAgICBwYXRoOiB7fSxcbiAgICAgICAgcXVlcnk6IHt9LFxuICAgIH07XG4gICAgY29uc3QgbWFwID0gYnVpbGRLZXlNYXAoZmllbGRzKTtcbiAgICBsZXQgY29uZmlnO1xuICAgIGZvciAoY29uc3QgW2luZGV4LCBhcmddIG9mIGFyZ3MuZW50cmllcygpKSB7XG4gICAgICAgIGlmIChmaWVsZHNbaW5kZXhdKSB7XG4gICAgICAgICAgICBjb25maWcgPSBmaWVsZHNbaW5kZXhdO1xuICAgICAgICB9XG4gICAgICAgIGlmICghY29uZmlnKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoXCJpblwiIGluIGNvbmZpZykge1xuICAgICAgICAgICAgaWYgKGNvbmZpZy5rZXkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBmaWVsZCA9IG1hcC5nZXQoY29uZmlnLmtleSk7XG4gICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IGZpZWxkLm1hcCB8fCBjb25maWcua2V5O1xuICAgICAgICAgICAgICAgIHBhcmFtc1tmaWVsZC5pbl1bbmFtZV0gPSBhcmc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBwYXJhbXMuYm9keSA9IGFyZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKGFyZyA/PyB7fSkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBmaWVsZCA9IG1hcC5nZXQoa2V5KTtcbiAgICAgICAgICAgICAgICBpZiAoZmllbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IGZpZWxkLm1hcCB8fCBrZXk7XG4gICAgICAgICAgICAgICAgICAgIHBhcmFtc1tmaWVsZC5pbl1bbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGV4dHJhID0gZXh0cmFQcmVmaXhlcy5maW5kKChbcHJlZml4XSkgPT4ga2V5LnN0YXJ0c1dpdGgocHJlZml4KSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChleHRyYSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgW3ByZWZpeCwgc2xvdF0gPSBleHRyYTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtc1tzbG90XVtrZXkuc2xpY2UocHJlZml4Lmxlbmd0aCldID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IFtzbG90LCBhbGxvd2VkXSBvZiBPYmplY3QuZW50cmllcyhjb25maWcuYWxsb3dFeHRyYSA/PyB7fSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYWxsb3dlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtc1tzbG90XVtrZXldID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBzdHJpcEVtcHR5U2xvdHMocGFyYW1zKTtcbiAgICByZXR1cm4gcGFyYW1zO1xufTtcbiIsCiAgICAiLy8gVGhpcyBmaWxlIGlzIGF1dG8tZ2VuZXJhdGVkIGJ5IEBoZXktYXBpL29wZW5hcGktdHNcbmltcG9ydCB7IGNyZWF0ZUNsaWVudCwgY3JlYXRlQ29uZmlnIH0gZnJvbSBcIi4vY2xpZW50L2luZGV4LmpzXCI7XG5leHBvcnQgY29uc3QgY2xpZW50ID0gY3JlYXRlQ2xpZW50KGNyZWF0ZUNvbmZpZyh7XG4gICAgYmFzZVVybDogXCJodHRwOi8vbG9jYWxob3N0OjQwOTZcIixcbn0pKTtcbiIsCiAgICAiLy8gVGhpcyBmaWxlIGlzIGF1dG8tZ2VuZXJhdGVkIGJ5IEBoZXktYXBpL29wZW5hcGktdHNcbmltcG9ydCB7IGNsaWVudCBhcyBfaGV5QXBpQ2xpZW50IH0gZnJvbSBcIi4vY2xpZW50Lmdlbi5qc1wiO1xuY2xhc3MgX0hleUFwaUNsaWVudCB7XG4gICAgX2NsaWVudCA9IF9oZXlBcGlDbGllbnQ7XG4gICAgY29uc3RydWN0b3IoYXJncykge1xuICAgICAgICBpZiAoYXJncz8uY2xpZW50KSB7XG4gICAgICAgICAgICB0aGlzLl9jbGllbnQgPSBhcmdzLmNsaWVudDtcbiAgICAgICAgfVxuICAgIH1cbn1cbmNsYXNzIEdsb2JhbCBleHRlbmRzIF9IZXlBcGlDbGllbnQge1xuICAgIC8qKlxuICAgICAqIEdldCBldmVudHNcbiAgICAgKi9cbiAgICBldmVudChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0LnNzZSh7XG4gICAgICAgICAgICB1cmw6IFwiL2dsb2JhbC9ldmVudFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuY2xhc3MgUHJvamVjdCBleHRlbmRzIF9IZXlBcGlDbGllbnQge1xuICAgIC8qKlxuICAgICAqIExpc3QgYWxsIHByb2plY3RzXG4gICAgICovXG4gICAgbGlzdChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvcHJvamVjdFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgY3VycmVudCBwcm9qZWN0XG4gICAgICovXG4gICAgY3VycmVudChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvcHJvamVjdC9jdXJyZW50XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG59XG5jbGFzcyBQdHkgZXh0ZW5kcyBfSGV5QXBpQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBMaXN0IGFsbCBQVFkgc2Vzc2lvbnNcbiAgICAgKi9cbiAgICBsaXN0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9wdHlcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgUFRZIHNlc3Npb25cbiAgICAgKi9cbiAgICBjcmVhdGUob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi9wdHlcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucz8uaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgYSBQVFkgc2Vzc2lvblxuICAgICAqL1xuICAgIHJlbW92ZShvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5kZWxldGUoe1xuICAgICAgICAgICAgdXJsOiBcIi9wdHkve2lkfVwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCBQVFkgc2Vzc2lvbiBpbmZvXG4gICAgICovXG4gICAgZ2V0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL3B0eS97aWR9XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVXBkYXRlIFBUWSBzZXNzaW9uXG4gICAgICovXG4gICAgdXBkYXRlKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnB1dCh7XG4gICAgICAgICAgICB1cmw6IFwiL3B0eS97aWR9XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnMuaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDb25uZWN0IHRvIGEgUFRZIHNlc3Npb25cbiAgICAgKi9cbiAgICBjb25uZWN0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL3B0eS97aWR9L2Nvbm5lY3RcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmNsYXNzIENvbmZpZyBleHRlbmRzIF9IZXlBcGlDbGllbnQge1xuICAgIC8qKlxuICAgICAqIEdldCBjb25maWcgaW5mb1xuICAgICAqL1xuICAgIGdldChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvY29uZmlnXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVXBkYXRlIGNvbmZpZ1xuICAgICAqL1xuICAgIHVwZGF0ZShvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucGF0Y2goe1xuICAgICAgICAgICAgdXJsOiBcIi9jb25maWdcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucz8uaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBMaXN0IGFsbCBwcm92aWRlcnNcbiAgICAgKi9cbiAgICBwcm92aWRlcnMob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL2NvbmZpZy9wcm92aWRlcnNcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmNsYXNzIFRvb2wgZXh0ZW5kcyBfSGV5QXBpQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBMaXN0IGFsbCB0b29sIElEcyAoaW5jbHVkaW5nIGJ1aWx0LWluIGFuZCBkeW5hbWljYWxseSByZWdpc3RlcmVkKVxuICAgICAqL1xuICAgIGlkcyhvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvZXhwZXJpbWVudGFsL3Rvb2wvaWRzXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogTGlzdCB0b29scyB3aXRoIEpTT04gc2NoZW1hIHBhcmFtZXRlcnMgZm9yIGEgcHJvdmlkZXIvbW9kZWxcbiAgICAgKi9cbiAgICBsaXN0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL2V4cGVyaW1lbnRhbC90b29sXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG59XG5jbGFzcyBJbnN0YW5jZSBleHRlbmRzIF9IZXlBcGlDbGllbnQge1xuICAgIC8qKlxuICAgICAqIERpc3Bvc2UgdGhlIGN1cnJlbnQgaW5zdGFuY2VcbiAgICAgKi9cbiAgICBkaXNwb3NlKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvaW5zdGFuY2UvZGlzcG9zZVwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuY2xhc3MgUGF0aCBleHRlbmRzIF9IZXlBcGlDbGllbnQge1xuICAgIC8qKlxuICAgICAqIEdldCB0aGUgY3VycmVudCBwYXRoXG4gICAgICovXG4gICAgZ2V0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9wYXRoXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG59XG5jbGFzcyBWY3MgZXh0ZW5kcyBfSGV5QXBpQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBHZXQgVkNTIGluZm8gZm9yIHRoZSBjdXJyZW50IGluc3RhbmNlXG4gICAgICovXG4gICAgZ2V0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi92Y3NcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmNsYXNzIFNlc3Npb24gZXh0ZW5kcyBfSGV5QXBpQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBMaXN0IGFsbCBzZXNzaW9uc1xuICAgICAqL1xuICAgIGxpc3Qob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Nlc3Npb25cIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgc2Vzc2lvblxuICAgICAqL1xuICAgIGNyZWF0ZShvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Nlc3Npb25cIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucz8uaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgc2Vzc2lvbiBzdGF0dXNcbiAgICAgKi9cbiAgICBzdGF0dXMob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Nlc3Npb24vc3RhdHVzXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGVsZXRlIGEgc2Vzc2lvbiBhbmQgYWxsIGl0cyBkYXRhXG4gICAgICovXG4gICAgZGVsZXRlKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmRlbGV0ZSh7XG4gICAgICAgICAgICB1cmw6IFwiL3Nlc3Npb24ve2lkfVwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCBzZXNzaW9uXG4gICAgICovXG4gICAgZ2V0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Nlc3Npb24ve2lkfVwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFVwZGF0ZSBzZXNzaW9uIHByb3BlcnRpZXNcbiAgICAgKi9cbiAgICB1cGRhdGUob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucGF0Y2goe1xuICAgICAgICAgICAgdXJsOiBcIi9zZXNzaW9uL3tpZH1cIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCBhIHNlc3Npb24ncyBjaGlsZHJlblxuICAgICAqL1xuICAgIGNoaWxkcmVuKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Nlc3Npb24ve2lkfS9jaGlsZHJlblwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgdG9kbyBsaXN0IGZvciBhIHNlc3Npb25cbiAgICAgKi9cbiAgICB0b2RvKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Nlc3Npb24ve2lkfS90b2RvXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQW5hbHl6ZSB0aGUgYXBwIGFuZCBjcmVhdGUgYW4gQUdFTlRTLm1kIGZpbGVcbiAgICAgKi9cbiAgICBpbml0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi9zZXNzaW9uL3tpZH0vaW5pdFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zLmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRm9yayBhbiBleGlzdGluZyBzZXNzaW9uIGF0IGEgc3BlY2lmaWMgbWVzc2FnZVxuICAgICAqL1xuICAgIGZvcmsob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Nlc3Npb24ve2lkfS9mb3JrXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnMuaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBYm9ydCBhIHNlc3Npb25cbiAgICAgKi9cbiAgICBhYm9ydChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvc2Vzc2lvbi97aWR9L2Fib3J0XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVW5zaGFyZSB0aGUgc2Vzc2lvblxuICAgICAqL1xuICAgIHVuc2hhcmUob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZGVsZXRlKHtcbiAgICAgICAgICAgIHVybDogXCIvc2Vzc2lvbi97aWR9L3NoYXJlXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2hhcmUgYSBzZXNzaW9uXG4gICAgICovXG4gICAgc2hhcmUob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Nlc3Npb24ve2lkfS9zaGFyZVwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgZGlmZiBmb3IgdGhpcyBzZXNzaW9uXG4gICAgICovXG4gICAgZGlmZihvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9zZXNzaW9uL3tpZH0vZGlmZlwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFN1bW1hcml6ZSB0aGUgc2Vzc2lvblxuICAgICAqL1xuICAgIHN1bW1hcml6ZShvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvc2Vzc2lvbi97aWR9L3N1bW1hcml6ZVwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zLmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogTGlzdCBtZXNzYWdlcyBmb3IgYSBzZXNzaW9uXG4gICAgICovXG4gICAgbWVzc2FnZXMob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvc2Vzc2lvbi97aWR9L21lc3NhZ2VcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYW5kIHNlbmQgYSBuZXcgbWVzc2FnZSB0byBhIHNlc3Npb25cbiAgICAgKi9cbiAgICBwcm9tcHQob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Nlc3Npb24ve2lkfS9tZXNzYWdlXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnMuaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgYSBtZXNzYWdlIGZyb20gYSBzZXNzaW9uXG4gICAgICovXG4gICAgbWVzc2FnZShvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9zZXNzaW9uL3tpZH0vbWVzc2FnZS97bWVzc2FnZUlEfVwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhbmQgc2VuZCBhIG5ldyBtZXNzYWdlIHRvIGEgc2Vzc2lvbiwgc3RhcnQgaWYgbmVlZGVkIGFuZCByZXR1cm4gaW1tZWRpYXRlbHlcbiAgICAgKi9cbiAgICBwcm9tcHRBc3luYyhvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvc2Vzc2lvbi97aWR9L3Byb21wdF9hc3luY1wiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zLmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2VuZCBhIG5ldyBjb21tYW5kIHRvIGEgc2Vzc2lvblxuICAgICAqL1xuICAgIGNvbW1hbmQob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Nlc3Npb24ve2lkfS9jb21tYW5kXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnMuaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSdW4gYSBzaGVsbCBjb21tYW5kXG4gICAgICovXG4gICAgc2hlbGwob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Nlc3Npb24ve2lkfS9zaGVsbFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zLmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmV2ZXJ0IGEgbWVzc2FnZVxuICAgICAqL1xuICAgIHJldmVydChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvc2Vzc2lvbi97aWR9L3JldmVydFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zLmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVzdG9yZSBhbGwgcmV2ZXJ0ZWQgbWVzc2FnZXNcbiAgICAgKi9cbiAgICB1bnJldmVydChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvc2Vzc2lvbi97aWR9L3VucmV2ZXJ0XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG59XG5jbGFzcyBDb21tYW5kIGV4dGVuZHMgX0hleUFwaUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogTGlzdCBhbGwgY29tbWFuZHNcbiAgICAgKi9cbiAgICBsaXN0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9jb21tYW5kXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG59XG5jbGFzcyBPYXV0aCBleHRlbmRzIF9IZXlBcGlDbGllbnQge1xuICAgIC8qKlxuICAgICAqIEF1dGhvcml6ZSBhIHByb3ZpZGVyIHVzaW5nIE9BdXRoXG4gICAgICovXG4gICAgYXV0aG9yaXplKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi9wcm92aWRlci97aWR9L29hdXRoL2F1dGhvcml6ZVwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zLmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogSGFuZGxlIE9BdXRoIGNhbGxiYWNrIGZvciBhIHByb3ZpZGVyXG4gICAgICovXG4gICAgY2FsbGJhY2sob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Byb3ZpZGVyL3tpZH0vb2F1dGgvY2FsbGJhY2tcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuY2xhc3MgUHJvdmlkZXIgZXh0ZW5kcyBfSGV5QXBpQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBMaXN0IGFsbCBwcm92aWRlcnNcbiAgICAgKi9cbiAgICBsaXN0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9wcm92aWRlclwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCBwcm92aWRlciBhdXRoZW50aWNhdGlvbiBtZXRob2RzXG4gICAgICovXG4gICAgYXV0aChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvcHJvdmlkZXIvYXV0aFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG9hdXRoID0gbmV3IE9hdXRoKHsgY2xpZW50OiB0aGlzLl9jbGllbnQgfSk7XG59XG5jbGFzcyBGaW5kIGV4dGVuZHMgX0hleUFwaUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogRmluZCB0ZXh0IGluIGZpbGVzXG4gICAgICovXG4gICAgdGV4dChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9maW5kXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRmluZCBmaWxlc1xuICAgICAqL1xuICAgIGZpbGVzKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL2ZpbmQvZmlsZVwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEZpbmQgd29ya3NwYWNlIHN5bWJvbHNcbiAgICAgKi9cbiAgICBzeW1ib2xzKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL2ZpbmQvc3ltYm9sXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG59XG5jbGFzcyBGaWxlIGV4dGVuZHMgX0hleUFwaUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogTGlzdCBmaWxlcyBhbmQgZGlyZWN0b3JpZXNcbiAgICAgKi9cbiAgICBsaXN0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL2ZpbGVcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZWFkIGEgZmlsZVxuICAgICAqL1xuICAgIHJlYWQob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvZmlsZS9jb250ZW50XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0IGZpbGUgc3RhdHVzXG4gICAgICovXG4gICAgc3RhdHVzKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9maWxlL3N0YXR1c1wiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuY2xhc3MgQXBwIGV4dGVuZHMgX0hleUFwaUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogV3JpdGUgYSBsb2cgZW50cnkgdG8gdGhlIHNlcnZlciBsb2dzXG4gICAgICovXG4gICAgbG9nKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvbG9nXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnM/LmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogTGlzdCBhbGwgYWdlbnRzXG4gICAgICovXG4gICAgYWdlbnRzKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9hZ2VudFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuY2xhc3MgQXV0aCBleHRlbmRzIF9IZXlBcGlDbGllbnQge1xuICAgIC8qKlxuICAgICAqIFJlbW92ZSBPQXV0aCBjcmVkZW50aWFscyBmb3IgYW4gTUNQIHNlcnZlclxuICAgICAqL1xuICAgIHJlbW92ZShvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5kZWxldGUoe1xuICAgICAgICAgICAgdXJsOiBcIi9tY3Ave25hbWV9L2F1dGhcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTdGFydCBPQXV0aCBhdXRoZW50aWNhdGlvbiBmbG93IGZvciBhbiBNQ1Agc2VydmVyXG4gICAgICovXG4gICAgc3RhcnQob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL21jcC97bmFtZX0vYXV0aFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENvbXBsZXRlIE9BdXRoIGF1dGhlbnRpY2F0aW9uIHdpdGggYXV0aG9yaXphdGlvbiBjb2RlXG4gICAgICovXG4gICAgY2FsbGJhY2sob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL21jcC97bmFtZX0vYXV0aC9jYWxsYmFja1wiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zLmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU3RhcnQgT0F1dGggZmxvdyBhbmQgd2FpdCBmb3IgY2FsbGJhY2sgKG9wZW5zIGJyb3dzZXIpXG4gICAgICovXG4gICAgYXV0aGVudGljYXRlKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi9tY3Ave25hbWV9L2F1dGgvYXV0aGVudGljYXRlXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0IGF1dGhlbnRpY2F0aW9uIGNyZWRlbnRpYWxzXG4gICAgICovXG4gICAgc2V0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnB1dCh7XG4gICAgICAgICAgICB1cmw6IFwiL2F1dGgve2lkfVwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zLmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG59XG5jbGFzcyBNY3AgZXh0ZW5kcyBfSGV5QXBpQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBHZXQgTUNQIHNlcnZlciBzdGF0dXNcbiAgICAgKi9cbiAgICBzdGF0dXMob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL21jcFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFkZCBNQ1Agc2VydmVyIGR5bmFtaWNhbGx5XG4gICAgICovXG4gICAgYWRkKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvbWNwXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnM/LmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ29ubmVjdCBhbiBNQ1Agc2VydmVyXG4gICAgICovXG4gICAgY29ubmVjdChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvbWNwL3tuYW1lfS9jb25uZWN0XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGlzY29ubmVjdCBhbiBNQ1Agc2VydmVyXG4gICAgICovXG4gICAgZGlzY29ubmVjdChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvbWNwL3tuYW1lfS9kaXNjb25uZWN0XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgYXV0aCA9IG5ldyBBdXRoKHsgY2xpZW50OiB0aGlzLl9jbGllbnQgfSk7XG59XG5jbGFzcyBMc3AgZXh0ZW5kcyBfSGV5QXBpQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBHZXQgTFNQIHNlcnZlciBzdGF0dXNcbiAgICAgKi9cbiAgICBzdGF0dXMob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL2xzcFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuY2xhc3MgRm9ybWF0dGVyIGV4dGVuZHMgX0hleUFwaUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogR2V0IGZvcm1hdHRlciBzdGF0dXNcbiAgICAgKi9cbiAgICBzdGF0dXMob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL2Zvcm1hdHRlclwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuY2xhc3MgQ29udHJvbCBleHRlbmRzIF9IZXlBcGlDbGllbnQge1xuICAgIC8qKlxuICAgICAqIEdldCB0aGUgbmV4dCBUVUkgcmVxdWVzdCBmcm9tIHRoZSBxdWV1ZVxuICAgICAqL1xuICAgIG5leHQob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL3R1aS9jb250cm9sL25leHRcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTdWJtaXQgYSByZXNwb25zZSB0byB0aGUgVFVJIHJlcXVlc3QgcXVldWVcbiAgICAgKi9cbiAgICByZXNwb25zZShvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3R1aS9jb250cm9sL3Jlc3BvbnNlXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnM/LmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG59XG5jbGFzcyBUdWkgZXh0ZW5kcyBfSGV5QXBpQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBBcHBlbmQgcHJvbXB0IHRvIHRoZSBUVUlcbiAgICAgKi9cbiAgICBhcHBlbmRQcm9tcHQob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi90dWkvYXBwZW5kLXByb21wdFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zPy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE9wZW4gdGhlIGhlbHAgZGlhbG9nXG4gICAgICovXG4gICAgb3BlbkhlbHAob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi90dWkvb3Blbi1oZWxwXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogT3BlbiB0aGUgc2Vzc2lvbiBkaWFsb2dcbiAgICAgKi9cbiAgICBvcGVuU2Vzc2lvbnMob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi90dWkvb3Blbi1zZXNzaW9uc1wiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE9wZW4gdGhlIHRoZW1lIGRpYWxvZ1xuICAgICAqL1xuICAgIG9wZW5UaGVtZXMob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi90dWkvb3Blbi10aGVtZXNcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBPcGVuIHRoZSBtb2RlbCBkaWFsb2dcbiAgICAgKi9cbiAgICBvcGVuTW9kZWxzKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvdHVpL29wZW4tbW9kZWxzXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU3VibWl0IHRoZSBwcm9tcHRcbiAgICAgKi9cbiAgICBzdWJtaXRQcm9tcHQob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi90dWkvc3VibWl0LXByb21wdFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENsZWFyIHRoZSBwcm9tcHRcbiAgICAgKi9cbiAgICBjbGVhclByb21wdChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3R1aS9jbGVhci1wcm9tcHRcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBFeGVjdXRlIGEgVFVJIGNvbW1hbmQgKGUuZy4gYWdlbnRfY3ljbGUpXG4gICAgICovXG4gICAgZXhlY3V0ZUNvbW1hbmQob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi90dWkvZXhlY3V0ZS1jb21tYW5kXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnM/LmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2hvdyBhIHRvYXN0IG5vdGlmaWNhdGlvbiBpbiB0aGUgVFVJXG4gICAgICovXG4gICAgc2hvd1RvYXN0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvdHVpL3Nob3ctdG9hc3RcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucz8uaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQdWJsaXNoIGEgVFVJIGV2ZW50XG4gICAgICovXG4gICAgcHVibGlzaChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3R1aS9wdWJsaXNoXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnM/LmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgY29udHJvbCA9IG5ldyBDb250cm9sKHsgY2xpZW50OiB0aGlzLl9jbGllbnQgfSk7XG59XG5jbGFzcyBFdmVudCBleHRlbmRzIF9IZXlBcGlDbGllbnQge1xuICAgIC8qKlxuICAgICAqIEdldCBldmVudHNcbiAgICAgKi9cbiAgICBzdWJzY3JpYmUob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldC5zc2Uoe1xuICAgICAgICAgICAgdXJsOiBcIi9ldmVudFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIE9wZW5jb2RlQ2xpZW50IGV4dGVuZHMgX0hleUFwaUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogUmVzcG9uZCB0byBhIHBlcm1pc3Npb24gcmVxdWVzdFxuICAgICAqL1xuICAgIHBvc3RTZXNzaW9uSWRQZXJtaXNzaW9uc1Blcm1pc3Npb25JZChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvc2Vzc2lvbi97aWR9L3Blcm1pc3Npb25zL3twZXJtaXNzaW9uSUR9XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnMuaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBnbG9iYWwgPSBuZXcgR2xvYmFsKHsgY2xpZW50OiB0aGlzLl9jbGllbnQgfSk7XG4gICAgcHJvamVjdCA9IG5ldyBQcm9qZWN0KHsgY2xpZW50OiB0aGlzLl9jbGllbnQgfSk7XG4gICAgcHR5ID0gbmV3IFB0eSh7IGNsaWVudDogdGhpcy5fY2xpZW50IH0pO1xuICAgIGNvbmZpZyA9IG5ldyBDb25maWcoeyBjbGllbnQ6IHRoaXMuX2NsaWVudCB9KTtcbiAgICB0b29sID0gbmV3IFRvb2woeyBjbGllbnQ6IHRoaXMuX2NsaWVudCB9KTtcbiAgICBpbnN0YW5jZSA9IG5ldyBJbnN0YW5jZSh7IGNsaWVudDogdGhpcy5fY2xpZW50IH0pO1xuICAgIHBhdGggPSBuZXcgUGF0aCh7IGNsaWVudDogdGhpcy5fY2xpZW50IH0pO1xuICAgIHZjcyA9IG5ldyBWY3MoeyBjbGllbnQ6IHRoaXMuX2NsaWVudCB9KTtcbiAgICBzZXNzaW9uID0gbmV3IFNlc3Npb24oeyBjbGllbnQ6IHRoaXMuX2NsaWVudCB9KTtcbiAgICBjb21tYW5kID0gbmV3IENvbW1hbmQoeyBjbGllbnQ6IHRoaXMuX2NsaWVudCB9KTtcbiAgICBwcm92aWRlciA9IG5ldyBQcm92aWRlcih7IGNsaWVudDogdGhpcy5fY2xpZW50IH0pO1xuICAgIGZpbmQgPSBuZXcgRmluZCh7IGNsaWVudDogdGhpcy5fY2xpZW50IH0pO1xuICAgIGZpbGUgPSBuZXcgRmlsZSh7IGNsaWVudDogdGhpcy5fY2xpZW50IH0pO1xuICAgIGFwcCA9IG5ldyBBcHAoeyBjbGllbnQ6IHRoaXMuX2NsaWVudCB9KTtcbiAgICBtY3AgPSBuZXcgTWNwKHsgY2xpZW50OiB0aGlzLl9jbGllbnQgfSk7XG4gICAgbHNwID0gbmV3IExzcCh7IGNsaWVudDogdGhpcy5fY2xpZW50IH0pO1xuICAgIGZvcm1hdHRlciA9IG5ldyBGb3JtYXR0ZXIoeyBjbGllbnQ6IHRoaXMuX2NsaWVudCB9KTtcbiAgICB0dWkgPSBuZXcgVHVpKHsgY2xpZW50OiB0aGlzLl9jbGllbnQgfSk7XG4gICAgYXV0aCA9IG5ldyBBdXRoKHsgY2xpZW50OiB0aGlzLl9jbGllbnQgfSk7XG4gICAgZXZlbnQgPSBuZXcgRXZlbnQoeyBjbGllbnQ6IHRoaXMuX2NsaWVudCB9KTtcbn1cbiIsCiAgICAiZXhwb3J0ICogZnJvbSBcIi4vZ2VuL3R5cGVzLmdlbi5qc1wiO1xuaW1wb3J0IHsgY3JlYXRlQ2xpZW50IH0gZnJvbSBcIi4vZ2VuL2NsaWVudC9jbGllbnQuZ2VuLmpzXCI7XG5pbXBvcnQgeyBPcGVuY29kZUNsaWVudCB9IGZyb20gXCIuL2dlbi9zZGsuZ2VuLmpzXCI7XG5leHBvcnQgeyBPcGVuY29kZUNsaWVudCB9O1xuZnVuY3Rpb24gcGljayh2YWx1ZSwgZmFsbGJhY2spIHtcbiAgICBpZiAoIXZhbHVlKVxuICAgICAgICByZXR1cm47XG4gICAgaWYgKCFmYWxsYmFjaylcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIGlmICh2YWx1ZSA9PT0gZmFsbGJhY2spXG4gICAgICAgIHJldHVybiBmYWxsYmFjaztcbiAgICBpZiAodmFsdWUgPT09IGVuY29kZVVSSUNvbXBvbmVudChmYWxsYmFjaykpXG4gICAgICAgIHJldHVybiBmYWxsYmFjaztcbiAgICByZXR1cm4gdmFsdWU7XG59XG5mdW5jdGlvbiByZXdyaXRlKHJlcXVlc3QsIGRpcmVjdG9yeSkge1xuICAgIGlmIChyZXF1ZXN0Lm1ldGhvZCAhPT0gXCJHRVRcIiAmJiByZXF1ZXN0Lm1ldGhvZCAhPT0gXCJIRUFEXCIpXG4gICAgICAgIHJldHVybiByZXF1ZXN0O1xuICAgIGNvbnN0IHZhbHVlID0gcGljayhyZXF1ZXN0LmhlYWRlcnMuZ2V0KFwieC1vcGVuY29kZS1kaXJlY3RvcnlcIiksIGRpcmVjdG9yeSk7XG4gICAgaWYgKCF2YWx1ZSlcbiAgICAgICAgcmV0dXJuIHJlcXVlc3Q7XG4gICAgY29uc3QgdXJsID0gbmV3IFVSTChyZXF1ZXN0LnVybCk7XG4gICAgaWYgKCF1cmwuc2VhcmNoUGFyYW1zLmhhcyhcImRpcmVjdG9yeVwiKSkge1xuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLnNldChcImRpcmVjdG9yeVwiLCB2YWx1ZSk7XG4gICAgfVxuICAgIGNvbnN0IG5leHQgPSBuZXcgUmVxdWVzdCh1cmwsIHJlcXVlc3QpO1xuICAgIG5leHQuaGVhZGVycy5kZWxldGUoXCJ4LW9wZW5jb2RlLWRpcmVjdG9yeVwiKTtcbiAgICByZXR1cm4gbmV4dDtcbn1cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVPcGVuY29kZUNsaWVudChjb25maWcpIHtcbiAgICBpZiAoIWNvbmZpZz8uZmV0Y2gpIHtcbiAgICAgICAgY29uc3QgY3VzdG9tRmV0Y2ggPSAocmVxKSA9PiB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICByZXEudGltZW91dCA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuIGZldGNoKHJlcSk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbmZpZyA9IHtcbiAgICAgICAgICAgIC4uLmNvbmZpZyxcbiAgICAgICAgICAgIGZldGNoOiBjdXN0b21GZXRjaCxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgaWYgKGNvbmZpZz8uZGlyZWN0b3J5KSB7XG4gICAgICAgIGNvbmZpZy5oZWFkZXJzID0ge1xuICAgICAgICAgICAgLi4uY29uZmlnLmhlYWRlcnMsXG4gICAgICAgICAgICBcIngtb3BlbmNvZGUtZGlyZWN0b3J5XCI6IGVuY29kZVVSSUNvbXBvbmVudChjb25maWcuZGlyZWN0b3J5KSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgY29uc3QgY2xpZW50ID0gY3JlYXRlQ2xpZW50KGNvbmZpZyk7XG4gICAgY2xpZW50LmludGVyY2VwdG9ycy5yZXF1ZXN0LnVzZSgocmVxdWVzdCkgPT4gcmV3cml0ZShyZXF1ZXN0LCBjb25maWc/LmRpcmVjdG9yeSkpO1xuICAgIHJldHVybiBuZXcgT3BlbmNvZGVDbGllbnQoeyBjbGllbnQgfSk7XG59XG4iLAogICAgImltcG9ydCBsYXVuY2ggZnJvbSBcImNyb3NzLXNwYXduXCI7XG5pbXBvcnQgeyBzdG9wLCBiaW5kQWJvcnQgfSBmcm9tIFwiLi9wcm9jZXNzLmpzXCI7XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY3JlYXRlT3BlbmNvZGVTZXJ2ZXIob3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgaG9zdG5hbWU6IFwiMTI3LjAuMC4xXCIsXG4gICAgICAgIHBvcnQ6IDQwOTYsXG4gICAgICAgIHRpbWVvdXQ6IDUwMDAsXG4gICAgfSwgb3B0aW9ucyA/PyB7fSk7XG4gICAgY29uc3QgYXJncyA9IFtgc2VydmVgLCBgLS1ob3N0bmFtZT0ke29wdGlvbnMuaG9zdG5hbWV9YCwgYC0tcG9ydD0ke29wdGlvbnMucG9ydH1gXTtcbiAgICBpZiAob3B0aW9ucy5jb25maWc/LmxvZ0xldmVsKVxuICAgICAgICBhcmdzLnB1c2goYC0tbG9nLWxldmVsPSR7b3B0aW9ucy5jb25maWcubG9nTGV2ZWx9YCk7XG4gICAgY29uc3QgcHJvYyA9IGxhdW5jaChgb3BlbmNvZGVgLCBhcmdzLCB7XG4gICAgICAgIGVudjoge1xuICAgICAgICAgICAgLi4ucHJvY2Vzcy5lbnYsXG4gICAgICAgICAgICBPUEVOQ09ERV9DT05GSUdfQ09OVEVOVDogSlNPTi5zdHJpbmdpZnkob3B0aW9ucy5jb25maWcgPz8ge30pLFxuICAgICAgICB9LFxuICAgIH0pO1xuICAgIGxldCBjbGVhciA9ICgpID0+IHsgfTtcbiAgICBjb25zdCB1cmwgPSBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGNvbnN0IGlkID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBjbGVhcigpO1xuICAgICAgICAgICAgc3RvcChwcm9jKTtcbiAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoYFRpbWVvdXQgd2FpdGluZyBmb3Igc2VydmVyIHRvIHN0YXJ0IGFmdGVyICR7b3B0aW9ucy50aW1lb3V0fW1zYCkpO1xuICAgICAgICB9LCBvcHRpb25zLnRpbWVvdXQpO1xuICAgICAgICBsZXQgb3V0cHV0ID0gXCJcIjtcbiAgICAgICAgbGV0IHJlc29sdmVkID0gZmFsc2U7XG4gICAgICAgIHByb2Muc3Rkb3V0Py5vbihcImRhdGFcIiwgKGNodW5rKSA9PiB7XG4gICAgICAgICAgICBpZiAocmVzb2x2ZWQpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgb3V0cHV0ICs9IGNodW5rLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICBjb25zdCBsaW5lcyA9IG91dHB1dC5zcGxpdChcIlxcblwiKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgbGluZSBvZiBsaW5lcykge1xuICAgICAgICAgICAgICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgoXCJvcGVuY29kZSBzZXJ2ZXIgbGlzdGVuaW5nXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoID0gbGluZS5tYXRjaCgvb25cXHMrKGh0dHBzPzpcXC9cXC9bXlxcc10rKS8pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGVhcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RvcChwcm9jKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dChpZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKGBGYWlsZWQgdG8gcGFyc2Ugc2VydmVyIHVybCBmcm9tIG91dHB1dDogJHtsaW5lfWApKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoaWQpO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUobWF0Y2hbMV0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcHJvYy5zdGRlcnI/Lm9uKFwiZGF0YVwiLCAoY2h1bmspID0+IHtcbiAgICAgICAgICAgIG91dHB1dCArPSBjaHVuay50b1N0cmluZygpO1xuICAgICAgICB9KTtcbiAgICAgICAgcHJvYy5vbihcImV4aXRcIiwgKGNvZGUpID0+IHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChpZCk7XG4gICAgICAgICAgICBsZXQgbXNnID0gYFNlcnZlciBleGl0ZWQgd2l0aCBjb2RlICR7Y29kZX1gO1xuICAgICAgICAgICAgaWYgKG91dHB1dC50cmltKCkpIHtcbiAgICAgICAgICAgICAgICBtc2cgKz0gYFxcblNlcnZlciBvdXRwdXQ6ICR7b3V0cHV0fWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZWplY3QobmV3IEVycm9yKG1zZykpO1xuICAgICAgICB9KTtcbiAgICAgICAgcHJvYy5vbihcImVycm9yXCIsIChlcnJvcikgPT4ge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGlkKTtcbiAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgIH0pO1xuICAgICAgICBjbGVhciA9IGJpbmRBYm9ydChwcm9jLCBvcHRpb25zLnNpZ25hbCwgKCkgPT4ge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGlkKTtcbiAgICAgICAgICAgIHJlamVjdChvcHRpb25zLnNpZ25hbD8ucmVhc29uKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdXJsLFxuICAgICAgICBjbG9zZSgpIHtcbiAgICAgICAgICAgIGNsZWFyKCk7XG4gICAgICAgICAgICBzdG9wKHByb2MpO1xuICAgICAgICB9LFxuICAgIH07XG59XG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlT3BlbmNvZGVUdWkob3B0aW9ucykge1xuICAgIGNvbnN0IGFyZ3MgPSBbXTtcbiAgICBpZiAob3B0aW9ucz8ucHJvamVjdCkge1xuICAgICAgICBhcmdzLnB1c2goYC0tcHJvamVjdD0ke29wdGlvbnMucHJvamVjdH1gKTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnM/Lm1vZGVsKSB7XG4gICAgICAgIGFyZ3MucHVzaChgLS1tb2RlbD0ke29wdGlvbnMubW9kZWx9YCk7XG4gICAgfVxuICAgIGlmIChvcHRpb25zPy5zZXNzaW9uKSB7XG4gICAgICAgIGFyZ3MucHVzaChgLS1zZXNzaW9uPSR7b3B0aW9ucy5zZXNzaW9ufWApO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucz8uYWdlbnQpIHtcbiAgICAgICAgYXJncy5wdXNoKGAtLWFnZW50PSR7b3B0aW9ucy5hZ2VudH1gKTtcbiAgICB9XG4gICAgY29uc3QgcHJvYyA9IGxhdW5jaChgb3BlbmNvZGVgLCBhcmdzLCB7XG4gICAgICAgIHN0ZGlvOiBcImluaGVyaXRcIixcbiAgICAgICAgZW52OiB7XG4gICAgICAgICAgICAuLi5wcm9jZXNzLmVudixcbiAgICAgICAgICAgIE9QRU5DT0RFX0NPTkZJR19DT05URU5UOiBKU09OLnN0cmluZ2lmeShvcHRpb25zPy5jb25maWcgPz8ge30pLFxuICAgICAgICB9LFxuICAgIH0pO1xuICAgIGNvbnN0IGNsZWFyID0gYmluZEFib3J0KHByb2MsIG9wdGlvbnM/LnNpZ25hbCk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY2xvc2UoKSB7XG4gICAgICAgICAgICBjbGVhcigpO1xuICAgICAgICAgICAgc3RvcChwcm9jKTtcbiAgICAgICAgfSxcbiAgICB9O1xufVxuIiwKICAgICJpbXBvcnQgeyBzcGF3blN5bmMgfSBmcm9tIFwibm9kZTpjaGlsZF9wcm9jZXNzXCI7XG4vLyBEdXBsaWNhdGVkIGZyb20gYHBhY2thZ2VzL29wZW5jb2RlL3NyYy91dGlsL3Byb2Nlc3MudHNgIGJlY2F1c2UgdGhlIFNESyBjYW5ub3Rcbi8vIGltcG9ydCBgb3BlbmNvZGVgIHdpdGhvdXQgY3JlYXRpbmcgYSBjeWNsZSAoYG9wZW5jb2RlYCBkZXBlbmRzIG9uIGBAb3BlbmNvZGUtYWkvc2RrYCkuXG5leHBvcnQgZnVuY3Rpb24gc3RvcChwcm9jKSB7XG4gICAgaWYgKHByb2MuZXhpdENvZGUgIT09IG51bGwgfHwgcHJvYy5zaWduYWxDb2RlICE9PSBudWxsKVxuICAgICAgICByZXR1cm47XG4gICAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09IFwid2luMzJcIiAmJiBwcm9jLnBpZCkge1xuICAgICAgICBjb25zdCBvdXQgPSBzcGF3blN5bmMoXCJ0YXNra2lsbFwiLCBbXCIvcGlkXCIsIFN0cmluZyhwcm9jLnBpZCksIFwiL1RcIiwgXCIvRlwiXSwgeyB3aW5kb3dzSGlkZTogdHJ1ZSB9KTtcbiAgICAgICAgaWYgKCFvdXQuZXJyb3IgJiYgb3V0LnN0YXR1cyA9PT0gMClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcHJvYy5raWxsKCk7XG59XG5leHBvcnQgZnVuY3Rpb24gYmluZEFib3J0KHByb2MsIHNpZ25hbCwgb25BYm9ydCkge1xuICAgIGlmICghc2lnbmFsKVxuICAgICAgICByZXR1cm4gKCkgPT4geyB9O1xuICAgIGNvbnN0IGFib3J0ID0gKCkgPT4ge1xuICAgICAgICBjbGVhcigpO1xuICAgICAgICBzdG9wKHByb2MpO1xuICAgICAgICBvbkFib3J0Py4oKTtcbiAgICB9O1xuICAgIGNvbnN0IGNsZWFyID0gKCkgPT4ge1xuICAgICAgICBzaWduYWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImFib3J0XCIsIGFib3J0KTtcbiAgICAgICAgcHJvYy5vZmYoXCJleGl0XCIsIGNsZWFyKTtcbiAgICAgICAgcHJvYy5vZmYoXCJlcnJvclwiLCBjbGVhcik7XG4gICAgfTtcbiAgICBzaWduYWwuYWRkRXZlbnRMaXN0ZW5lcihcImFib3J0XCIsIGFib3J0LCB7IG9uY2U6IHRydWUgfSk7XG4gICAgcHJvYy5vbihcImV4aXRcIiwgY2xlYXIpO1xuICAgIHByb2Mub24oXCJlcnJvclwiLCBjbGVhcik7XG4gICAgaWYgKHNpZ25hbC5hYm9ydGVkKVxuICAgICAgICBhYm9ydCgpO1xuICAgIHJldHVybiBjbGVhcjtcbn1cbiIsCiAgICAiZXhwb3J0ICogZnJvbSBcIi4vY2xpZW50LmpzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9zZXJ2ZXIuanNcIjtcbmltcG9ydCB7IGNyZWF0ZU9wZW5jb2RlQ2xpZW50IH0gZnJvbSBcIi4vY2xpZW50LmpzXCI7XG5pbXBvcnQgeyBjcmVhdGVPcGVuY29kZVNlcnZlciB9IGZyb20gXCIuL3NlcnZlci5qc1wiO1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZU9wZW5jb2RlKG9wdGlvbnMpIHtcbiAgICBjb25zdCBzZXJ2ZXIgPSBhd2FpdCBjcmVhdGVPcGVuY29kZVNlcnZlcih7XG4gICAgICAgIC4uLm9wdGlvbnMsXG4gICAgfSk7XG4gICAgY29uc3QgY2xpZW50ID0gY3JlYXRlT3BlbmNvZGVDbGllbnQoe1xuICAgICAgICBiYXNlVXJsOiBzZXJ2ZXIudXJsLFxuICAgIH0pO1xuICAgIHJldHVybiB7XG4gICAgICAgIGNsaWVudCxcbiAgICAgICAgc2VydmVyLFxuICAgIH07XG59XG4iLAogICAgImltcG9ydCBmcyBmcm9tIFwibm9kZTpmcy9wcm9taXNlc1wiO1xuLyoqXG4gKiBTdHJ1Y3R1cmVkIGxvZ2dpbmcgZm9yIGFpLWVuZyByYWxwaFxuICpcbiAqIFN1cHBvcnRzIGJvdGggc3RkZXJyIG91dHB1dCAod2l0aCAtLXByaW50LWxvZ3MpIGFuZCBmaWxlLWJhc2VkIGxvZ2dpbmdcbiAqL1xuaW1wb3J0IHBhdGggZnJvbSBcIm5vZGU6cGF0aFwiO1xuXG5leHBvcnQgbmFtZXNwYWNlIExvZyB7XG4gICAgZXhwb3J0IHR5cGUgTGV2ZWwgPSBcIkRFQlVHXCIgfCBcIklORk9cIiB8IFwiV0FSTlwiIHwgXCJFUlJPUlwiO1xuXG4gICAgY29uc3QgbGV2ZWxQcmlvcml0eTogUmVjb3JkPExldmVsLCBudW1iZXI+ID0ge1xuICAgICAgICBERUJVRzogMCxcbiAgICAgICAgSU5GTzogMSxcbiAgICAgICAgV0FSTjogMixcbiAgICAgICAgRVJST1I6IDMsXG4gICAgfTtcblxuICAgIGxldCBjdXJyZW50TGV2ZWw6IExldmVsID0gXCJJTkZPXCI7XG4gICAgbGV0IGxvZ1BhdGggPSBcIlwiO1xuICAgIGxldCB3cml0ZTogKG1zZzogc3RyaW5nKSA9PiBhbnkgPSAobXNnKSA9PiBwcm9jZXNzLnN0ZGVyci53cml0ZShtc2cpO1xuXG4gICAgZnVuY3Rpb24gc2hvdWxkTG9nKGxldmVsOiBMZXZlbCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gbGV2ZWxQcmlvcml0eVtsZXZlbF0gPj0gbGV2ZWxQcmlvcml0eVtjdXJyZW50TGV2ZWxdO1xuICAgIH1cblxuICAgIGV4cG9ydCBpbnRlcmZhY2UgT3B0aW9ucyB7XG4gICAgICAgIHByaW50OiBib29sZWFuOyAvLyBXaGVuIHRydWUsIHdyaXRlIHRvIHN0ZGVyclxuICAgICAgICBsZXZlbD86IExldmVsO1xuICAgICAgICBsb2dEaXI/OiBzdHJpbmc7IC8vIERpcmVjdG9yeSBmb3IgbG9nIGZpbGVzXG4gICAgfVxuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGZpbGUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGxvZ1BhdGg7XG4gICAgfVxuXG4gICAgZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGluaXQob3B0aW9uczogT3B0aW9ucyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBpZiAob3B0aW9ucy5sZXZlbCkgY3VycmVudExldmVsID0gb3B0aW9ucy5sZXZlbDtcblxuICAgICAgICAvLyBCdWlsZCB0aGUgd3JpdGUgZnVuY3Rpb24gdGhhdCBvdXRwdXRzIHRvIEJPVEggc3RkZXJyIEFORCBmaWxlXG4gICAgICAgIGNvbnN0IHN0ZGVycldyaXRlciA9IChtc2c6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgcHJvY2Vzcy5zdGRlcnIud3JpdGUobXNnKTtcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAob3B0aW9ucy5sb2dEaXIpIHtcbiAgICAgICAgICAgIGNvbnN0IHRpbWVzdGFtcCA9IG5ldyBEYXRlKClcbiAgICAgICAgICAgICAgICAudG9JU09TdHJpbmcoKVxuICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9bOi5dL2csIFwiLVwiKVxuICAgICAgICAgICAgICAgIC5zbGljZSgwLCAtMSk7XG4gICAgICAgICAgICBsb2dQYXRoID0gcGF0aC5qb2luKG9wdGlvbnMubG9nRGlyLCBgcmFscGgtJHt0aW1lc3RhbXB9LmxvZ2ApO1xuICAgICAgICAgICAgYXdhaXQgZnMubWtkaXIob3B0aW9ucy5sb2dEaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuXG4gICAgICAgICAgICBjb25zdCBmaWxlID0gQnVuLmZpbGUobG9nUGF0aCk7XG4gICAgICAgICAgICBjb25zdCBmaWxlV3JpdGVyID0gZmlsZS53cml0ZXIoKTtcblxuICAgICAgICAgICAgLy8gQWx3YXlzIHdyaXRlIHRvIHN0ZGVyciBpZiBwcmludCBpcyBlbmFibGVkXG4gICAgICAgICAgICAvLyBBbHNvIGFsd2F5cyB3cml0ZSB0byBmaWxlIGlmIGxvZ0RpciBpcyBwcm92aWRlZFxuICAgICAgICAgICAgd3JpdGUgPSAobXNnKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMucHJpbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RkZXJyV3JpdGVyKG1zZyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbGVXcml0ZXIud3JpdGUobXNnKTtcbiAgICAgICAgICAgICAgICBmaWxlV3JpdGVyLmZsdXNoKCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbnMucHJpbnQpIHtcbiAgICAgICAgICAgIC8vIE9ubHkgcHJpbnQgdG8gc3RkZXJyXG4gICAgICAgICAgICB3cml0ZSA9IHN0ZGVycldyaXRlcjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGV4cG9ydCBpbnRlcmZhY2UgTG9nZ2VyIHtcbiAgICAgICAgZGVidWcobWVzc2FnZTogc3RyaW5nLCBleHRyYT86IFJlY29yZDxzdHJpbmcsIGFueT4pOiB2b2lkO1xuICAgICAgICBpbmZvKG1lc3NhZ2U6IHN0cmluZywgZXh0cmE/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+KTogdm9pZDtcbiAgICAgICAgd2FybihtZXNzYWdlOiBzdHJpbmcsIGV4dHJhPzogUmVjb3JkPHN0cmluZywgYW55Pik6IHZvaWQ7XG4gICAgICAgIGVycm9yKG1lc3NhZ2U6IHN0cmluZywgZXh0cmE/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+KTogdm9pZDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBmb3JtYXRFeHRyYShleHRyYT86IFJlY29yZDxzdHJpbmcsIGFueT4pOiBzdHJpbmcge1xuICAgICAgICBpZiAoIWV4dHJhKSByZXR1cm4gXCJcIjtcbiAgICAgICAgY29uc3QgZXh0cmFTdHIgPSBPYmplY3QuZW50cmllcyhleHRyYSlcbiAgICAgICAgICAgIC5tYXAoXG4gICAgICAgICAgICAgICAgKFtrLCB2XSkgPT5cbiAgICAgICAgICAgICAgICAgICAgYCR7a309JHt0eXBlb2YgdiA9PT0gXCJvYmplY3RcIiA/IEpTT04uc3RyaW5naWZ5KHYpIDogdn1gLFxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgLmpvaW4oXCIgXCIpO1xuICAgICAgICByZXR1cm4gZXh0cmFTdHIgPyBgICR7ZXh0cmFTdHJ9YCA6IFwiXCI7XG4gICAgfVxuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZSh0YWdzPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPik6IExvZ2dlciB7XG4gICAgICAgIGNvbnN0IHRhZ1N0ciA9IHRhZ3NcbiAgICAgICAgICAgID8gT2JqZWN0LmVudHJpZXModGFncylcbiAgICAgICAgICAgICAgICAgIC5tYXAoKFtrLCB2XSkgPT4gYCR7a309JHt2fWApXG4gICAgICAgICAgICAgICAgICAuam9pbihcIiBcIilcbiAgICAgICAgICAgIDogXCJcIjtcbiAgICAgICAgY29uc3QgdGFnU3RyV2l0aFNwYWNlID0gdGFnU3RyID8gYCR7dGFnU3RyfSBgIDogXCJcIjtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGVidWcobWVzc2FnZTogc3RyaW5nLCBleHRyYT86IFJlY29yZDxzdHJpbmcsIGFueT4pIHtcbiAgICAgICAgICAgICAgICBpZiAoc2hvdWxkTG9nKFwiREVCVUdcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgd3JpdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICBgREVCVUcgJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCl9ICR7dGFnU3RyfSR7bWVzc2FnZX0ke2Zvcm1hdEV4dHJhKGV4dHJhKX1cXG5gLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBpbmZvKG1lc3NhZ2U6IHN0cmluZywgZXh0cmE/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+KSB7XG4gICAgICAgICAgICAgICAgaWYgKHNob3VsZExvZyhcIklORk9cIikpIHtcbiAgICAgICAgICAgICAgICAgICAgd3JpdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICBgSU5GTyAgJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCl9ICR7dGFnU3RyfSR7bWVzc2FnZX0ke2Zvcm1hdEV4dHJhKGV4dHJhKX1cXG5gLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB3YXJuKG1lc3NhZ2U6IHN0cmluZywgZXh0cmE/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+KSB7XG4gICAgICAgICAgICAgICAgaWYgKHNob3VsZExvZyhcIldBUk5cIikpIHtcbiAgICAgICAgICAgICAgICAgICAgd3JpdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICBgV0FSTiAgJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCl9ICR7dGFnU3RyfSR7bWVzc2FnZX0ke2Zvcm1hdEV4dHJhKGV4dHJhKX1cXG5gLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlcnJvcihtZXNzYWdlOiBzdHJpbmcsIGV4dHJhPzogUmVjb3JkPHN0cmluZywgYW55Pikge1xuICAgICAgICAgICAgICAgIGlmIChzaG91bGRMb2coXCJFUlJPUlwiKSkge1xuICAgICAgICAgICAgICAgICAgICB3cml0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIGBFUlJPUiAke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKX0gJHt0YWdTdHJ9JHttZXNzYWdlfSR7Zm9ybWF0RXh0cmEoZXh0cmEpfVxcbmAsXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBleHBvcnQgY29uc3QgRGVmYXVsdCA9IGNyZWF0ZSh7IHNlcnZpY2U6IFwicmFscGhcIiB9KTtcbn1cbiIsCiAgICAiLyoqXG4gKiBSYWxwaCBMb29wIFJ1bm5lciAtIEJhc2gtbG9vcCBzdHlsZSBpdGVyYXRpb24gd2l0aCBmcmVzaCBjb250ZXh0IHBlciBjeWNsZVxuICpcbiAqIEltcGxlbWVudHMgdGhlIG9yaWdpbmFsIFJhbHBoIFdpZ2d1bSB2aXNpb246XG4gKiAtIEZyZXNoIE9wZW5Db2RlIHNlc3Npb24gcGVyIGl0ZXJhdGlvbiAobm8gdHJhbnNjcmlwdCBjYXJyeS1vdmVyKVxuICogLSBGaWxlIEkvTyBhcyBzdGF0ZSAoLmFpLWVuZy9ydW5zLzxydW5JZD4vLmZsb3cpXG4gKiAtIERldGVybWluaXN0aWMgcmUtYW5jaG9yaW5nIGZyb20gZGlzayBzdGF0ZSBlYWNoIGN5Y2xlXG4gKiAtIE11bHRpLXBoYXNlIHdvcmtmbG93IChyZXNlYXJjaCDihpIgc3BlY2lmeSDihpIgcGxhbiDihpIgd29yayDihpIgcmV2aWV3KVxuICogLSBRdWFsaXR5IGdhdGVzIHRoYXQgYmxvY2sgdW50aWwgcGFzc2VkXG4gKi9cblxuaW1wb3J0IHsgZXhlY1N5bmMgfSBmcm9tIFwibm9kZTpjaGlsZF9wcm9jZXNzXCI7XG5pbXBvcnQgeyBjcmVhdGVIYXNoIH0gZnJvbSBcIm5vZGU6Y3J5cHRvXCI7XG5pbXBvcnQgeyByZWFkRmlsZSwgcmVhZGRpciB9IGZyb20gXCJub2RlOmZzL3Byb21pc2VzXCI7XG5pbXBvcnQgeyBqb2luLCBwYXJzZSB9IGZyb20gXCJub2RlOnBhdGhcIjtcbmltcG9ydCB7IE9wZW5Db2RlQ2xpZW50LCB0eXBlIFNlc3Npb24gfSBmcm9tIFwiLi4vYmFja2VuZHMvb3BlbmNvZGUvY2xpZW50XCI7XG5pbXBvcnQgdHlwZSB7IFJhbHBoRmxhZ3MgfSBmcm9tIFwiLi4vY2xpL2ZsYWdzXCI7XG5pbXBvcnQgeyBVSSB9IGZyb20gXCIuLi9jbGkvdWlcIjtcbmltcG9ydCB0eXBlIHsgQWlFbmdDb25maWcsIEdhdGVDb21tYW5kQ29uZmlnIH0gZnJvbSBcIi4uL2NvbmZpZy9zY2hlbWFcIjtcbmltcG9ydCB7IFByb21wdE9wdGltaXplciB9IGZyb20gXCIuLi9wcm9tcHQtb3B0aW1pemF0aW9uL29wdGltaXplclwiO1xuaW1wb3J0IHR5cGUgeyBEaXNjb3JkV2ViaG9va0NsaWVudCB9IGZyb20gXCIuLi91dGlsL2Rpc2NvcmQtd2ViaG9va1wiO1xuaW1wb3J0IHsgY3JlYXRlRGlzY29yZFdlYmhvb2tGcm9tRW52IH0gZnJvbSBcIi4uL3V0aWwvZGlzY29yZC13ZWJob29rXCI7XG5pbXBvcnQgeyBMb2cgfSBmcm9tIFwiLi4vdXRpbC9sb2dcIjtcbmltcG9ydCB7IEZsb3dTdG9yZSwgdHlwZSBGbG93U3RvcmVPcHRpb25zIH0gZnJvbSBcIi4vZmxvdy1zdG9yZVwiO1xuaW1wb3J0IHR5cGUge1xuICAgIEN5Y2xlU3RhdGUsXG4gICAgR2F0ZVJlc3VsdCxcbiAgICBMb29wQ29uZmlnLFxuICAgIFRvb2xJbnZvY2F0aW9uLFxufSBmcm9tIFwiLi9mbG93LXR5cGVzXCI7XG5pbXBvcnQge1xuICAgIEZMT1dfU0NIRU1BX1ZFUlNJT04sXG4gICAgUGhhc2UsXG4gICAgUnVuU3RhdHVzLFxuICAgIFN0b3BSZWFzb24sXG59IGZyb20gXCIuL2Zsb3ctdHlwZXNcIjtcblxuY29uc3QgbG9nID0gTG9nLmNyZWF0ZSh7IHNlcnZpY2U6IFwicmFscGgtbG9vcFwiIH0pO1xuXG4vKiogRGVmYXVsdCBxdWFsaXR5IGdhdGVzICovXG5jb25zdCBERUZBVUxUX0dBVEVTID0gW1widGVzdFwiLCBcImxpbnRcIiwgXCJhY2NlcHRhbmNlXCJdO1xuXG4vKiogRGVmYXVsdCBtYXggY3ljbGVzICovXG5jb25zdCBERUZBVUxUX01BWF9DWUNMRVMgPSA1MDtcblxuLyoqIERlZmF1bHQgc3R1Y2sgdGhyZXNob2xkICovXG5jb25zdCBERUZBVUxUX1NUVUNLX1RIUkVTSE9MRCA9IDU7XG5cbi8qKiBEZWZhdWx0IGNoZWNrcG9pbnQgZnJlcXVlbmN5ICovXG5jb25zdCBERUZBVUxUX0NIRUNLUE9JTlRfRlJFUVVFTkNZID0gMTtcblxuLyoqIERlZmF1bHQgY3ljbGUgcmV0cmllcyAqL1xuY29uc3QgREVGQVVMVF9DWUNMRV9SRVRSSUVTID0gMjtcblxuLyoqIFNlY3JldHMgcGF0dGVybnMgdG8gcmVkYWN0IGluIGRlYnVnIG91dHB1dCAqL1xuY29uc3QgU0VDUkVUX1BBVFRFUk5TID0gW1xuICAgIC9hcGlbXy1dP2tleS9pLFxuICAgIC90b2tlbi9pLFxuICAgIC9zZWNyZXQvaSxcbiAgICAvcGFzc3dvcmQvaSxcbiAgICAvY3JlZGVudGlhbC9pLFxuICAgIC93ZWJob29rL2ksXG4gICAgL2F1dGgvaSxcbiAgICAvYmVhcmVyL2ksXG4gICAgL3ByaXZhdGVbXy1dP2tleS9pLFxuXTtcblxuLyoqXG4gKiBSZWRhY3Qgc2VjcmV0cyBmcm9tIGEgc3RyaW5nXG4gKi9cbmZ1bmN0aW9uIHJlZGFjdFNlY3JldHModGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgIGxldCByZXN1bHQgPSB0ZXh0O1xuICAgIGZvciAoY29uc3QgcGF0dGVybiBvZiBTRUNSRVRfUEFUVEVSTlMpIHtcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoXG4gICAgICAgICAgICBuZXcgUmVnRXhwKFxuICAgICAgICAgICAgICAgIGAke3BhdHRlcm4uc291cmNlfVtcIiddP1xcXFxzKls6PV1cXFxccypbXCInXT8oW15cIidcIixcXFxcc10rKWAsXG4gICAgICAgICAgICAgICAgXCJnaVwiLFxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIGAke3BhdHRlcm4uc291cmNlfT1cIltSRURBQ1RFRF1cImAsXG4gICAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogVHJ1bmNhdGUgbG9uZyBvdXRwdXQgZm9yIGxvZ2dpbmdcbiAqL1xuZnVuY3Rpb24gdHJ1bmNhdGVPdXRwdXQodGV4dDogc3RyaW5nLCBtYXhMZW5ndGggPSAxMDAwKTogc3RyaW5nIHtcbiAgICBpZiAodGV4dC5sZW5ndGggPD0gbWF4TGVuZ3RoKSByZXR1cm4gdGV4dDtcbiAgICByZXR1cm4gYCR7dGV4dC5zdWJzdHJpbmcoMCwgbWF4TGVuZ3RoKX1cXG4uLi4gW3RydW5jYXRlZCAke3RleHQubGVuZ3RoIC0gbWF4TGVuZ3RofSBjaGFyc11gO1xufVxuXG4vKipcbiAqIFJhbHBoIExvb3AgUnVubmVyIC0gb3JjaGVzdHJhdGVzIGl0ZXJhdGlvbiBsb29wcyB3aXRoIGZyZXNoIHNlc3Npb25zXG4gKi9cbmV4cG9ydCBjbGFzcyBSYWxwaExvb3BSdW5uZXIge1xuICAgIHByaXZhdGUgY29uZmlnOiBMb29wQ29uZmlnO1xuICAgIHByaXZhdGUgZmxvd1N0b3JlOiBGbG93U3RvcmU7XG4gICAgcHJpdmF0ZSBmbGFnczogUmFscGhGbGFncztcbiAgICBwcml2YXRlIGJhc2VDb25maWc6IEFpRW5nQ29uZmlnO1xuICAgIHByaXZhdGUgb3B0aW1pemVyOiBQcm9tcHRPcHRpbWl6ZXI7XG4gICAgcHJpdmF0ZSBkaXNjb3JkV2ViaG9vazogRGlzY29yZFdlYmhvb2tDbGllbnQgfCBudWxsO1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIGZsYWdzOiBSYWxwaEZsYWdzLFxuICAgICAgICBiYXNlQ29uZmlnOiBBaUVuZ0NvbmZpZyxcbiAgICAgICAgb3B0aW1pemVyOiBQcm9tcHRPcHRpbWl6ZXIsXG4gICAgKSB7XG4gICAgICAgIHRoaXMuZmxhZ3MgPSBmbGFncztcbiAgICAgICAgdGhpcy5iYXNlQ29uZmlnID0gYmFzZUNvbmZpZztcbiAgICAgICAgdGhpcy5vcHRpbWl6ZXIgPSBvcHRpbWl6ZXI7XG5cbiAgICAgICAgLy8gQnVpbGQgbG9vcCBjb25maWcgZnJvbSBmbGFnc1xuICAgICAgICB0aGlzLmNvbmZpZyA9IHRoaXMuYnVpbGRMb29wQ29uZmlnKCk7XG4gICAgICAgIGNvbnN0IGZsb3dTdG9yZU9wdGlvbnM6IEZsb3dTdG9yZU9wdGlvbnMgPSB7XG4gICAgICAgICAgICBmbG93RGlyOiB0aGlzLmNvbmZpZy5mbG93RGlyLFxuICAgICAgICAgICAgcnVuSWQ6IHRoaXMuY29uZmlnLnJ1bklkLFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmZsb3dTdG9yZSA9IG5ldyBGbG93U3RvcmUoZmxvd1N0b3JlT3B0aW9ucyk7XG5cbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBEaXNjb3JkIHdlYmhvb2sgZnJvbSBlbnZpcm9ubWVudFxuICAgICAgICB0aGlzLmRpc2NvcmRXZWJob29rID0gY3JlYXRlRGlzY29yZFdlYmhvb2tGcm9tRW52KCk7XG4gICAgfVxuXG4gICAgLyoqIEJ1aWxkIGxvb3AgY29uZmlnIGZyb20gZmxhZ3MgKi9cbiAgICBwcml2YXRlIGJ1aWxkTG9vcENvbmZpZygpOiBMb29wQ29uZmlnIHtcbiAgICAgICAgLy8gRGV0ZXJtaW5lIGNvbXBsZXRpb24gcHJvbWlzZSBiYXNlZCBvbiBtb2RlXG4gICAgICAgIGxldCBjb21wbGV0aW9uUHJvbWlzZSA9IHRoaXMuZmxhZ3MuY29tcGxldGlvblByb21pc2UgPz8gXCJcIjtcblxuICAgICAgICBpZiAodGhpcy5mbGFncy5zaGlwKSB7XG4gICAgICAgICAgICAvLyBTaGlwIG1vZGU6IGF1dG8tZXhpdCB3aGVuIGFnZW50IG91dHB1dHMgU0hJUFxuICAgICAgICAgICAgY29tcGxldGlvblByb21pc2UgPSBcIjxwcm9taXNlPlNISVA8L3Byb21pc2U+XCI7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5mbGFncy5kcmFmdCkge1xuICAgICAgICAgICAgLy8gRHJhZnQgbW9kZTogcnVuIGZvciBtYXgtY3ljbGVzLCBzdG9wIGZvciByZXZpZXcgKG5vIGF1dG8tZXhpdClcbiAgICAgICAgICAgIGNvbXBsZXRpb25Qcm9taXNlID0gXCJcIjtcbiAgICAgICAgfSBlbHNlIGlmICghY29tcGxldGlvblByb21pc2UpIHtcbiAgICAgICAgICAgIC8vIE5vIGZsYWcgc3BlY2lmaWVkIGFuZCBubyBjb21wbGV0aW9uIHByb21pc2U6IGRlZmF1bHQgdG8gZHJhZnQgbW9kZVxuICAgICAgICAgICAgY29tcGxldGlvblByb21pc2UgPSBcIlwiO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gR2VuZXJhdGUgcnVuIElEIGlmIG5vdCByZXN1bWluZ1xuICAgICAgICBsZXQgcnVuSWQgPSB0aGlzLmZsYWdzLnJ1bklkO1xuICAgICAgICBpZiAoIXJ1bklkKSB7XG4gICAgICAgICAgICAvLyBDaGVjayBmb3IgZXhpc3RpbmcgZmxvdyBzdGF0ZVxuICAgICAgICAgICAgY29uc3QgZGVmYXVsdFJ1bklkID0gdGhpcy5nZW5lcmF0ZVJ1bklkKCk7XG4gICAgICAgICAgICBjb25zdCBkZWZhdWx0Rmxvd0RpciA9IHRoaXMuZ2V0RGVmYXVsdEZsb3dEaXIoZGVmYXVsdFJ1bklkKTtcbiAgICAgICAgICAgIGNvbnN0IGNoZWNrU3RvcmUgPSBuZXcgRmxvd1N0b3JlKHtcbiAgICAgICAgICAgICAgICBmbG93RGlyOiB0aGlzLmZsYWdzLndvcmtpbmdEaXJcbiAgICAgICAgICAgICAgICAgICAgPyBqb2luKHRoaXMuZmxhZ3Mud29ya2luZ0RpciwgXCIuYWktZW5nXCIpXG4gICAgICAgICAgICAgICAgICAgIDogXCIuYWktZW5nXCIsXG4gICAgICAgICAgICAgICAgcnVuSWQ6IGRlZmF1bHRSdW5JZCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcnVuSWQgPSBkZWZhdWx0UnVuSWQ7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcnVuSWQsXG4gICAgICAgICAgICBwcm9tcHQ6IHRoaXMuZmxhZ3Mud29ya2Zsb3cgPz8gXCJcIixcbiAgICAgICAgICAgIGNvbXBsZXRpb25Qcm9taXNlLFxuICAgICAgICAgICAgbWF4Q3ljbGVzOiB0aGlzLmZsYWdzLm1heEN5Y2xlcyA/PyBERUZBVUxUX01BWF9DWUNMRVMsXG4gICAgICAgICAgICBzdHVja1RocmVzaG9sZDpcbiAgICAgICAgICAgICAgICB0aGlzLmZsYWdzLnN0dWNrVGhyZXNob2xkID8/IERFRkFVTFRfU1RVQ0tfVEhSRVNIT0xELFxuICAgICAgICAgICAgZ2F0ZXM6IHRoaXMuZmxhZ3MuZ2F0ZXMgPz8gREVGQVVMVF9HQVRFUyxcbiAgICAgICAgICAgIGNoZWNrcG9pbnRGcmVxdWVuY3k6XG4gICAgICAgICAgICAgICAgdGhpcy5mbGFncy5jaGVja3BvaW50RnJlcXVlbmN5ID8/IERFRkFVTFRfQ0hFQ0tQT0lOVF9GUkVRVUVOQ1ksXG4gICAgICAgICAgICBmbG93RGlyOiB0aGlzLmdldERlZmF1bHRGbG93RGlyKHJ1bklkKSxcbiAgICAgICAgICAgIGRyeVJ1bjogdGhpcy5mbGFncy5kcnlSdW4gPz8gZmFsc2UsXG4gICAgICAgICAgICBjeWNsZVJldHJpZXM6XG4gICAgICAgICAgICAgICAgdGhpcy5iYXNlQ29uZmlnLmxvb3A/LmN5Y2xlUmV0cmllcyA/PyBERUZBVUxUX0NZQ0xFX1JFVFJJRVMsXG4gICAgICAgICAgICBkZWJ1Z1dvcms6XG4gICAgICAgICAgICAgICAgdGhpcy5mbGFncy5kZWJ1Z1dvcmsgPz8gdGhpcy5iYXNlQ29uZmlnLmRlYnVnPy53b3JrID8/IGZhbHNlLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qKiBHZXQgZGVmYXVsdCBmbG93IGRpcmVjdG9yeSBwYXRoICovXG4gICAgcHJpdmF0ZSBnZXREZWZhdWx0Rmxvd0RpcihydW5JZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgYXJ0aWZhY3RzRGlyID0gdGhpcy5iYXNlQ29uZmlnLnJ1bm5lci5hcnRpZmFjdHNEaXI7XG4gICAgICAgIGlmICh0aGlzLmZsYWdzLndvcmtpbmdEaXIpIHtcbiAgICAgICAgICAgIHJldHVybiBqb2luKHRoaXMuZmxhZ3Mud29ya2luZ0RpciwgYXJ0aWZhY3RzRGlyKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gam9pbihwcm9jZXNzLmN3ZCgpLCBhcnRpZmFjdHNEaXIpO1xuICAgIH1cblxuICAgIC8qKiBHZW5lcmF0ZSBhIHVuaXF1ZSBydW4gSUQgKi9cbiAgICBwcml2YXRlIGdlbmVyYXRlUnVuSWQoKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgdGltZXN0YW1wID0gRGF0ZS5ub3coKS50b1N0cmluZygzNik7XG4gICAgICAgIGNvbnN0IHJhbmRvbSA9IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZygyLCA4KTtcbiAgICAgICAgcmV0dXJuIGBydW4tJHt0aW1lc3RhbXB9LSR7cmFuZG9tfWA7XG4gICAgfVxuXG4gICAgLyoqIEdlbmVyYXRlIGEgaGFzaCBvZiBvdXRwdXQgZm9yIHN0dWNrIGRldGVjdGlvbiAqL1xuICAgIHByaXZhdGUgaGFzaE91dHB1dChvdXRwdXQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBjcmVhdGVIYXNoKFwic2hhMjU2XCIpXG4gICAgICAgICAgICAudXBkYXRlKG91dHB1dClcbiAgICAgICAgICAgIC5kaWdlc3QoXCJoZXhcIilcbiAgICAgICAgICAgIC5zdWJzdHJpbmcoMCwgMTYpO1xuICAgIH1cblxuICAgIC8qKiBSdW4gdGhlIGxvb3AgKi9cbiAgICBhc3luYyBydW4oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIFVJLmhlYWRlcihcIlJhbHBoIExvb3AgUnVubmVyXCIpO1xuXG4gICAgICAgIC8vIENoZWNrIGZvciByZXN1bWVcbiAgICAgICAgaWYgKHRoaXMuZmxhZ3MucmVzdW1lKSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnJlc3VtZSgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU3RhcnQgZnJlc2ggcnVuXG4gICAgICAgIGF3YWl0IHRoaXMuc3RhcnRGcmVzaCgpO1xuICAgIH1cblxuICAgIC8qKiBTdGFydCBhIGZyZXNoIHJ1biAqL1xuICAgIHByaXZhdGUgYXN5bmMgc3RhcnRGcmVzaCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgbG9nLmluZm8oXCJTdGFydGluZyBmcmVzaCBSYWxwaCBsb29wXCIsIHtcbiAgICAgICAgICAgIHJ1bklkOiB0aGlzLmNvbmZpZy5ydW5JZCxcbiAgICAgICAgICAgIHByb21wdDogdGhpcy5jb25maWcucHJvbXB0LnN1YnN0cmluZygwLCAxMDApLFxuICAgICAgICAgICAgY29tcGxldGlvblByb21pc2U6IHRoaXMuY29uZmlnLmNvbXBsZXRpb25Qcm9taXNlLFxuICAgICAgICAgICAgbWF4Q3ljbGVzOiB0aGlzLmNvbmZpZy5tYXhDeWNsZXMsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEluaXRpYWxpemUgZmxvdyBzdG9yZVxuICAgICAgICB0aGlzLmZsb3dTdG9yZS5pbml0aWFsaXplKCk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGluaXRpYWwgc3RhdGVcbiAgICAgICAgY29uc3QgaW5pdGlhbFN0YXRlID0gdGhpcy5mbG93U3RvcmUuY3JlYXRlSW5pdGlhbFN0YXRlKHtcbiAgICAgICAgICAgIHByb21wdDogdGhpcy5jb25maWcucHJvbXB0LFxuICAgICAgICAgICAgY29tcGxldGlvblByb21pc2U6IHRoaXMuY29uZmlnLmNvbXBsZXRpb25Qcm9taXNlLFxuICAgICAgICAgICAgbWF4Q3ljbGVzOiB0aGlzLmNvbmZpZy5tYXhDeWNsZXMsXG4gICAgICAgICAgICBzdHVja1RocmVzaG9sZDogdGhpcy5jb25maWcuc3R1Y2tUaHJlc2hvbGQsXG4gICAgICAgICAgICBnYXRlczogdGhpcy5jb25maWcuZ2F0ZXMsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFVwZGF0ZSBzdGF0dXMgdG8gcnVubmluZ1xuICAgICAgICB0aGlzLmZsb3dTdG9yZS51cGRhdGVTdGF0dXMoUnVuU3RhdHVzLlJVTk5JTkcpO1xuXG4gICAgICAgIC8vIFJ1biB0aGUgbG9vcFxuICAgICAgICBhd2FpdCB0aGlzLnJ1bkxvb3AoKTtcbiAgICB9XG5cbiAgICAvKiogUmVzdW1lIGZyb20gcHJldmlvdXMgcnVuICovXG4gICAgcHJpdmF0ZSBhc3luYyByZXN1bWUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGxvZy5pbmZvKFwiUmVzdW1pbmcgUmFscGggbG9vcFwiLCB7IHJ1bklkOiB0aGlzLmNvbmZpZy5ydW5JZCB9KTtcblxuICAgICAgICBjb25zdCBzdGF0ZSA9IHRoaXMuZmxvd1N0b3JlLmxvYWQoKTtcbiAgICAgICAgaWYgKCFzdGF0ZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgIGBObyBmbG93IHN0YXRlIGZvdW5kIGZvciBydW4gSUQ6ICR7dGhpcy5jb25maWcucnVuSWR9LiBDYW5ub3QgcmVzdW1lLmAsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN0YXRlLnN0YXR1cyA9PT0gUnVuU3RhdHVzLkNPTVBMRVRFRCkge1xuICAgICAgICAgICAgVUkud2FybihcIlRoaXMgcnVuIGhhcyBhbHJlYWR5IGNvbXBsZXRlZC5cIik7XG4gICAgICAgICAgICBVSS5pbmZvKGBTdG9wIHJlYXNvbjogJHtzdGF0ZS5zdG9wUmVhc29ufWApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN0YXRlLnN0YXR1cyA9PT0gUnVuU3RhdHVzLkZBSUxFRCkge1xuICAgICAgICAgICAgVUkud2FybihcIlRoaXMgcnVuIHByZXZpb3VzbHkgZmFpbGVkLlwiKTtcbiAgICAgICAgICAgIFVJLmluZm8oYEVycm9yOiAke3N0YXRlLmVycm9yfWApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVzdW1lIHRoZSBsb29wXG4gICAgICAgIGF3YWl0IHRoaXMucnVuTG9vcCgpO1xuICAgIH1cblxuICAgIC8qKiBNYWluIGxvb3AgZXhlY3V0aW9uICovXG4gICAgcHJpdmF0ZSBhc3luYyBydW5Mb29wKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCBzdGF0ZSA9IHRoaXMuZmxvd1N0b3JlLmxvYWQoKTtcbiAgICAgICAgaWYgKCFzdGF0ZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gZmxvdyBzdGF0ZSBmb3VuZFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIFVJLmluZm8oYFJ1biBJRDogJHt0aGlzLmNvbmZpZy5ydW5JZH1gKTtcbiAgICAgICAgVUkuaW5mbyhgRmxvdyBkaXJlY3Rvcnk6ICR7dGhpcy5mbG93U3RvcmUuYmFzZVBhdGh9YCk7XG4gICAgICAgIFVJLmluZm8oXG4gICAgICAgICAgICBgQ29tcGxldGlvbiBwcm9taXNlOiAke3RoaXMuY29uZmlnLmNvbXBsZXRpb25Qcm9taXNlIHx8IFwiKG5vbmUpXCJ9YCxcbiAgICAgICAgKTtcbiAgICAgICAgVUkuaW5mbyhgTWF4IGN5Y2xlczogJHt0aGlzLmNvbmZpZy5tYXhDeWNsZXN9YCk7XG4gICAgICAgIFVJLmluZm8oYEN5Y2xlIHJldHJpZXM6ICR7dGhpcy5jb25maWcuY3ljbGVSZXRyaWVzfWApO1xuICAgICAgICBVSS5pbmZvKGBTdHVjayB0aHJlc2hvbGQ6ICR7dGhpcy5jb25maWcuc3R1Y2tUaHJlc2hvbGR9YCk7XG4gICAgICAgIFVJLmluZm8oXG4gICAgICAgICAgICBgRGVidWcgd29yazogJHt0aGlzLmNvbmZpZy5kZWJ1Z1dvcmsgPyBcImVuYWJsZWRcIiA6IFwiZGlzYWJsZWRcIn1gLFxuICAgICAgICApO1xuICAgICAgICBVSS5wcmludGxuKCk7XG5cbiAgICAgICAgLy8gQ2hlY2sgaWYgd2Ugc2hvdWxkIHNraXAgb3B0aW1pemF0aW9uIChhbHJlYWR5IGRvbmUgb24gaW5pdGlhbCBpbmdlc3QpXG4gICAgICAgIC8vIEZvciBsb29wIG1vZGUsIHdlIHNraXAgcmUtb3B0aW1pemF0aW9uIGVhY2ggY3ljbGVcblxuICAgICAgICAvLyBSdW4gY3ljbGVzXG4gICAgICAgIGZvciAoXG4gICAgICAgICAgICBsZXQgY3ljbGVOdW1iZXIgPSBzdGF0ZS5jdXJyZW50Q3ljbGUgKyAxO1xuICAgICAgICAgICAgY3ljbGVOdW1iZXIgPD0gdGhpcy5jb25maWcubWF4Q3ljbGVzO1xuICAgICAgICAgICAgY3ljbGVOdW1iZXIrK1xuICAgICAgICApIHtcbiAgICAgICAgICAgIFVJLmhlYWRlcihgQ3ljbGUgJHtjeWNsZU51bWJlcn0vJHt0aGlzLmNvbmZpZy5tYXhDeWNsZXN9YCk7XG5cbiAgICAgICAgICAgIC8vIE5vdGlmeSBEaXNjb3JkOiBjeWNsZSBzdGFydGVkXG4gICAgICAgICAgICBjb25zdCBydW5TdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgdGhpcy5kaXNjb3JkV2ViaG9vaz8ubm90aWZ5Q3ljbGVTdGFydChcbiAgICAgICAgICAgICAgICBjeWNsZU51bWJlcixcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5tYXhDeWNsZXMsXG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcucHJvbXB0LFxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgLy8gRXhlY3V0ZSBjeWNsZSB3aXRoIHJldHJ5IGxvZ2ljXG4gICAgICAgICAgICBsZXQgYXR0ZW1wdCA9IDA7XG4gICAgICAgICAgICBsZXQgcmVzdWx0OiB7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogYm9vbGVhbjtcbiAgICAgICAgICAgICAgICBjeWNsZVN0YXRlOiBDeWNsZVN0YXRlO1xuICAgICAgICAgICAgICAgIHN1bW1hcnk6IHN0cmluZztcbiAgICAgICAgICAgICAgICBzdG9wUmVhc29uPzogU3RvcFJlYXNvbjtcbiAgICAgICAgICAgIH0gfCBudWxsID0gbnVsbDtcbiAgICAgICAgICAgIGxldCBsYXN0RXJyb3I6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuXG4gICAgICAgICAgICB3aGlsZSAoYXR0ZW1wdCA8PSB0aGlzLmNvbmZpZy5jeWNsZVJldHJpZXMpIHtcbiAgICAgICAgICAgICAgICBhdHRlbXB0Kys7XG4gICAgICAgICAgICAgICAgY29uc3QgaXNSZXRyeSA9IGF0dGVtcHQgPiAxO1xuXG4gICAgICAgICAgICAgICAgaWYgKGlzUmV0cnkpIHtcbiAgICAgICAgICAgICAgICAgICAgVUkuaW5mbyhcbiAgICAgICAgICAgICAgICAgICAgICAgIGBSZXRyeSBhdHRlbXB0ICR7YXR0ZW1wdH0vJHt0aGlzLmNvbmZpZy5jeWNsZVJldHJpZXMgKyAxfWAsXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIGxvZy5pbmZvKFwiUmV0cnlpbmcgY3ljbGVcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3ljbGVOdW1iZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICBhdHRlbXB0LFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdEVycm9yLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgZnJlc2ggT3BlbkNvZGUgc2Vzc2lvbiBmb3IgdGhpcyBjeWNsZVxuICAgICAgICAgICAgICAgIGNvbnN0IGNsaWVudCA9IGF3YWl0IE9wZW5Db2RlQ2xpZW50LmNyZWF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIHNlcnZlclN0YXJ0dXBUaW1lb3V0OiAxMDAwMCxcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFJlLWFuY2hvciBjb250ZXh0IGZyb20gZGlzayAod2l0aCByZXRyeSBmYWlsdXJlIGluamVjdGVkIGlmIHRoaXMgaXMgYSByZXRyeSlcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29udGV4dCA9IGF3YWl0IHRoaXMuYnVpbGRSZUFuY2hvcmVkQ29udGV4dChcbiAgICAgICAgICAgICAgICAgICAgICAgIGN5Y2xlTnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgaXNSZXRyeSA/IChsYXN0RXJyb3IgPz8gdW5kZWZpbmVkKSA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBFeGVjdXRlIHRoZSBjeWNsZSB3aXRoIGZyZXNoIHNlc3Npb25cbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gYXdhaXQgdGhpcy5leGVjdXRlQ3ljbGUoXG4gICAgICAgICAgICAgICAgICAgICAgICBjeWNsZU51bWJlcixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsaWVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQsXG4gICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gUmVjb3JkIHRoZSBjeWNsZVxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZmxvd1N0b3JlLnJlY29yZFN1Y2Nlc3NmdWxDeWNsZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQuY3ljbGVTdGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQuc3VtbWFyeSxcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5vdGlmeSBEaXNjb3JkOiBjeWNsZSBjb21wbGV0ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGR1cmF0aW9uTXMgPSBEYXRlLm5vdygpIC0gcnVuU3RhcnRUaW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXNjb3JkV2ViaG9vaz8ubm90aWZ5Q3ljbGVDb21wbGV0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjeWNsZU51bWJlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZsb3dTdG9yZS5sb2FkKCk/LmNvbXBsZXRlZEN5Y2xlcyA/P1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjeWNsZU51bWJlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQuc3VtbWFyeSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbk1zLFxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZmxvd1N0b3JlLnJlY29yZEZhaWxlZEN5Y2xlKHJlc3VsdC5jeWNsZVN0YXRlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gTm90aWZ5IERpc2NvcmQ6IGN5Y2xlIGZhaWxlZFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXNjb3JkV2ViaG9vaz8ubm90aWZ5RXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3ljbGVOdW1iZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LmN5Y2xlU3RhdGUucGhhc2VzW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5jeWNsZVN0YXRlLnBoYXNlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKS5wb3AoKSBhcyBrZXlvZiB0eXBlb2YgcmVzdWx0LmN5Y2xlU3RhdGUucGhhc2VzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXT8ucGhhc2UgPz8gXCJ1bmtub3duXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LmN5Y2xlU3RhdGUuZXJyb3IgPz8gXCJVbmtub3duIGVycm9yXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gQnJlYWsgcmV0cnkgbG9vcCBvbiBzdWNjZXNzIG9yIG5vbi1yZXRyeWFibGUgZmFpbHVyZVxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gRGV0ZXJtaW5lIGlmIHdlIHNob3VsZCByZXRyeSB0aGlzIGZhaWx1cmVcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2hvdWxkUmV0cnkgPSB0aGlzLnNob3VsZFJldHJ5RmFpbHVyZShyZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXNob3VsZFJldHJ5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGxhc3RFcnJvciA9IHJlc3VsdC5zdW1tYXJ5O1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTXNnID1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgbGFzdEVycm9yID0gZXJyb3JNc2c7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gQ2hlY2sgaWYgd2Ugc2hvdWxkIHJldHJ5IHRoaXMgZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2hvdWxkUmV0cnkgPSB0aGlzLnNob3VsZFJldHJ5T25FcnJvcihlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzaG91bGRSZXRyeSAmJiBhdHRlbXB0IDw9IHRoaXMuY29uZmlnLmN5Y2xlUmV0cmllcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nLndhcm4oXCJDeWNsZSBlcnJvciwgd2lsbCByZXRyeVwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3ljbGVOdW1iZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXR0ZW1wdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JNc2csXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5vbi1yZXRyeWFibGUgb3IgbWF4IHJldHJpZXMgZXhjZWVkZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQ2xlYW4gdXAgdGhlIHNlc3Npb24gZm9yIHRoaXMgY3ljbGVcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgY2xpZW50LmNsZWFudXAoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIElmIHJlc3VsdCBpcyBudWxsIGFmdGVyIGFsbCByZXRyaWVzLCB3ZSBoYWQgYSBjYXRhc3Ryb3BoaWMgZmFpbHVyZVxuICAgICAgICAgICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRpc2NvcmRXZWJob29rPy5ub3RpZnlTdHVja09yQWJvcnRlZChcbiAgICAgICAgICAgICAgICAgICAgY3ljbGVOdW1iZXIsXG4gICAgICAgICAgICAgICAgICAgIFwiRkFJTEVEX0FMTF9SRVRSSUVTXCIsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmhhbmRsZVN0b3AoXG4gICAgICAgICAgICAgICAgICAgIFN0b3BSZWFzb24uRVJST1IsXG4gICAgICAgICAgICAgICAgICAgIGBDeWNsZSAke2N5Y2xlTnVtYmVyfSBmYWlsZWQgYWZ0ZXIgJHt0aGlzLmNvbmZpZy5jeWNsZVJldHJpZXMgKyAxfSBhdHRlbXB0czogJHtsYXN0RXJyb3IgPz8gXCJ1bmtub3duIGVycm9yXCJ9YCxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQ2hlY2sgc3RvcCBjb25kaXRpb25zXG4gICAgICAgICAgICBpZiAocmVzdWx0LnN0b3BSZWFzb24pIHtcbiAgICAgICAgICAgICAgICAvLyBOb3RpZnkgRGlzY29yZDogcnVuIHN0b3BwZWRcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmhhbmRsZVN0b3AocmVzdWx0LnN0b3BSZWFzb24sIHJlc3VsdC5zdW1tYXJ5KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIENoZWNrIGlmIHN0dWNrXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50U3RhdGUgPSB0aGlzLmZsb3dTdG9yZS5sb2FkKCk7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgY3VycmVudFN0YXRlICYmXG4gICAgICAgICAgICAgICAgY3VycmVudFN0YXRlLnN0dWNrQ291bnQgPj0gdGhpcy5jb25maWcuc3R1Y2tUaHJlc2hvbGRcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIC8vIE5vdGlmeSBEaXNjb3JkOiBzdHVja1xuICAgICAgICAgICAgICAgIHRoaXMuZGlzY29yZFdlYmhvb2s/Lm5vdGlmeVN0dWNrT3JBYm9ydGVkKGN5Y2xlTnVtYmVyLCBcIlNUVUNLXCIpO1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuaGFuZGxlU3RvcChcbiAgICAgICAgICAgICAgICAgICAgU3RvcFJlYXNvbi5TVFVDSyxcbiAgICAgICAgICAgICAgICAgICAgYE5vIHByb2dyZXNzIGZvciAke3RoaXMuY29uZmlnLnN0dWNrVGhyZXNob2xkfSBjb25zZWN1dGl2ZSBjeWNsZXNgLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBTYXZlIGNoZWNrcG9pbnQgaWYgbmVlZGVkXG4gICAgICAgICAgICBpZiAoY3ljbGVOdW1iZXIgJSB0aGlzLmNvbmZpZy5jaGVja3BvaW50RnJlcXVlbmN5ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5mbG93U3RvcmUuc2F2ZUNoZWNrcG9pbnQoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmxvd1N0b3JlLmxvYWQoKSEsXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5jeWNsZVN0YXRlLnBoYXNlcyxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBVSS5wcmludGxuKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBNYXggY3ljbGVzIHJlYWNoZWQgLSBub3RpZnkgRGlzY29yZFxuICAgICAgICB0aGlzLmRpc2NvcmRXZWJob29rPy5ub3RpZnlSdW5Db21wbGV0ZShcbiAgICAgICAgICAgIHN0YXRlLmNvbXBsZXRlZEN5Y2xlcyxcbiAgICAgICAgICAgIERhdGUubm93KCkgLSBuZXcgRGF0ZShzdGF0ZS5jcmVhdGVkQXQpLmdldFRpbWUoKSxcbiAgICAgICAgICAgIGBDb21wbGV0ZWQgJHtzdGF0ZS5jb21wbGV0ZWRDeWNsZXN9IGN5Y2xlcyAobWF4ICR7dGhpcy5jb25maWcubWF4Q3ljbGVzfSlgLFxuICAgICAgICApO1xuICAgICAgICBhd2FpdCB0aGlzLmhhbmRsZVN0b3AoU3RvcFJlYXNvbi5NQVhfQ1lDTEVTLCBcIk1heGltdW0gY3ljbGVzIHJlYWNoZWRcIik7XG4gICAgfVxuXG4gICAgLyoqIERldGVybWluZSBpZiBhIGZhaWx1cmUgc2hvdWxkIHRyaWdnZXIgYSByZXRyeSAqL1xuICAgIHByaXZhdGUgc2hvdWxkUmV0cnlGYWlsdXJlKHJlc3VsdDoge1xuICAgICAgICBzdWNjZXNzOiBib29sZWFuO1xuICAgICAgICBjeWNsZVN0YXRlOiBDeWNsZVN0YXRlO1xuICAgICAgICBzdW1tYXJ5OiBzdHJpbmc7XG4gICAgfSk6IGJvb2xlYW4ge1xuICAgICAgICAvLyBDaGVjayBmb3IgZ2F0ZSBmYWlsdXJlc1xuICAgICAgICBjb25zdCBmYWlsZWRHYXRlcyA9IHJlc3VsdC5jeWNsZVN0YXRlLmdhdGVSZXN1bHRzLmZpbHRlcihcbiAgICAgICAgICAgIChnKSA9PiAhZy5wYXNzZWQsXG4gICAgICAgICk7XG4gICAgICAgIGlmIChmYWlsZWRHYXRlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENoZWNrIGZvciBlbXB0eSB3b3JrIHJlc3BvbnNlIChvdXIgYWNjZXB0YW5jZSBydWxlKVxuICAgICAgICBjb25zdCB3b3JrUGhhc2UgPSByZXN1bHQuY3ljbGVTdGF0ZS5waGFzZXNbUGhhc2UuV09SS107XG4gICAgICAgIGlmICh3b3JrUGhhc2UgJiYgIXdvcmtQaGFzZS5yZXNwb25zZS50cmltKCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKiBEZXRlcm1pbmUgaWYgYW4gZXJyb3Igc2hvdWxkIHRyaWdnZXIgYSByZXRyeSAqL1xuICAgIHByaXZhdGUgc2hvdWxkUmV0cnlPbkVycm9yKGVycm9yOiB1bmtub3duKTogYm9vbGVhbiB7XG4gICAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgICAgICAvLyBSZXRyeSBvbiB0aW1lb3V0XG4gICAgICAgICAgICBpZiAoZXJyb3IubWVzc2FnZS5pbmNsdWRlcyhcInRpbWVvdXRcIikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFJldHJ5IG9uIHN0cmVhbSBlcnJvcnNcbiAgICAgICAgICAgIGlmIChlcnJvci5tZXNzYWdlLmluY2x1ZGVzKFwic3RyZWFtXCIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBSZXRyeSBvbiBPcGVuQ29kZSBjb25uZWN0aW9uIGVycm9yc1xuICAgICAgICAgICAgaWYgKGVycm9yLm1lc3NhZ2UuaW5jbHVkZXMoXCJPcGVuQ29kZVwiKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKiogQnVpbGQgcmUtYW5jaG9yZWQgY29udGV4dCBmb3IgYSBjeWNsZSAqL1xuICAgIHByaXZhdGUgYXN5bmMgYnVpbGRSZUFuY2hvcmVkQ29udGV4dChcbiAgICAgICAgY3ljbGVOdW1iZXI6IG51bWJlcixcbiAgICAgICAgcmV0cnlGYWlsdXJlPzogc3RyaW5nLFxuICAgICk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgICAgIGNvbnN0IGNvbnRleHRQYXJ0czogc3RyaW5nW10gPSBbXTtcblxuICAgICAgICAvLyBBbHdheXMgc3RhcnQgd2l0aCB0aGUgb3JpZ2luYWwgcHJvbXB0XG4gICAgICAgIGNvbnRleHRQYXJ0cy5wdXNoKGAjIE9yaWdpbmFsIFRhc2tcXG5cXG4ke3RoaXMuY29uZmlnLnByb21wdH1cXG5gKTtcblxuICAgICAgICAvLyBBZGQgcmV0cnkgZmFpbHVyZSBpbmZvIGlmIHRoaXMgaXMgYSByZXRyeVxuICAgICAgICBpZiAocmV0cnlGYWlsdXJlKSB7XG4gICAgICAgICAgICBjb250ZXh0UGFydHMucHVzaChcbiAgICAgICAgICAgICAgICBgIyBQcmV2aW91cyBBdHRlbXB0IEZhaWxlZFxcblxcblRoZSBwcmV2aW91cyBhdHRlbXB0IGhhZCBhbiBpc3N1ZTpcXG4ke3JldHJ5RmFpbHVyZX1cXG5cXG5QbGVhc2UgYW5hbHl6ZSB3aGF0IHdlbnQgd3JvbmcgYW5kIHRyeSBhIGRpZmZlcmVudCBhcHByb2FjaC5cXG5gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFkZCBwcmV2aW91cyBjeWNsZSBzdW1tYXJ5IGlmIGF2YWlsYWJsZVxuICAgICAgICBjb25zdCBwcmV2aW91c0N5Y2xlID0gdGhpcy5mbG93U3RvcmUuZ2V0SXRlcmF0aW9uKGN5Y2xlTnVtYmVyIC0gMSk7XG4gICAgICAgIGlmIChwcmV2aW91c0N5Y2xlKSB7XG4gICAgICAgICAgICBjb250ZXh0UGFydHMucHVzaChcbiAgICAgICAgICAgICAgICBgIyBQcmV2aW91cyBDeWNsZSAoJHtjeWNsZU51bWJlciAtIDF9KSBTdW1tYXJ5XFxuXFxuYCxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBjb250ZXh0UGFydHMucHVzaChwcmV2aW91c0N5Y2xlLmVycm9yID8gXCJGQUlMRURcXG5cIiA6IFwiQ09NUExFVEVEXFxuXCIpO1xuXG4gICAgICAgICAgICBpZiAocHJldmlvdXNDeWNsZS5lcnJvcikge1xuICAgICAgICAgICAgICAgIGNvbnRleHRQYXJ0cy5wdXNoKGBFcnJvcjogJHtwcmV2aW91c0N5Y2xlLmVycm9yfVxcbmApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBBZGQgZ2F0ZSByZXN1bHRzXG4gICAgICAgICAgICBpZiAocHJldmlvdXNDeWNsZS5nYXRlUmVzdWx0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgY29udGV4dFBhcnRzLnB1c2goXCJcXG4jIyBHYXRlIFJlc3VsdHNcXG5cXG5cIik7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBnYXRlIG9mIHByZXZpb3VzQ3ljbGUuZ2F0ZVJlc3VsdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RhdHVzID0gZ2F0ZS5wYXNzZWQgPyBcIuKchVwiIDogXCLinYxcIjtcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dFBhcnRzLnB1c2goXG4gICAgICAgICAgICAgICAgICAgICAgICBgLSAke3N0YXR1c30gJHtnYXRlLmdhdGV9OiAke2dhdGUubWVzc2FnZX1cXG5gLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQWRkIHRvb2wgdXNhZ2Ugc3VtbWFyeSBmcm9tIHByZXZpb3VzIGN5Y2xlXG4gICAgICAgICAgICBjb25zdCBhbGxUb29scyA9IHRoaXMuY29sbGVjdEFsbFRvb2xzKHByZXZpb3VzQ3ljbGUpO1xuICAgICAgICAgICAgaWYgKGFsbFRvb2xzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0UGFydHMucHVzaChcIlxcbiMjIFRvb2wgVXNhZ2UgaW4gUHJldmlvdXMgQ3ljbGVcXG5cXG5cIik7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCB0b29sIG9mIGFsbFRvb2xzLnNsaWNlKDAsIDEwKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdGF0dXNJY29uID0gdG9vbC5zdGF0dXMgPT09IFwib2tcIiA/IFwi4pyFXCIgOiBcIuKdjFwiO1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0UGFydHMucHVzaChcbiAgICAgICAgICAgICAgICAgICAgICAgIGAke3N0YXR1c0ljb259ICR7dG9vbC5uYW1lfTogJHt0b29sLnN0YXR1c31cXG5gLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoYWxsVG9vbHMubGVuZ3RoID4gMTApIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dFBhcnRzLnB1c2goXG4gICAgICAgICAgICAgICAgICAgICAgICBgLi4uIGFuZCAke2FsbFRvb2xzLmxlbmd0aCAtIDEwfSBtb3JlIHRvb2xzXFxuYCxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBZGQgbGFzdCBjaGVja3BvaW50IHN1bW1hcnlcbiAgICAgICAgY29uc3Qgc3RhdGUgPSB0aGlzLmZsb3dTdG9yZS5sb2FkKCk7XG4gICAgICAgIGlmIChzdGF0ZT8ubGFzdENoZWNrcG9pbnQpIHtcbiAgICAgICAgICAgIGNvbnRleHRQYXJ0cy5wdXNoKFxuICAgICAgICAgICAgICAgIGBcXG4jIExhc3QgQ2hlY2twb2ludFxcblxcbkN5Y2xlICR7c3RhdGUubGFzdENoZWNrcG9pbnQuY3ljbGVOdW1iZXJ9OiAke3N0YXRlLmxhc3RDaGVja3BvaW50LnN1bW1hcnl9XFxuYCxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBdXRvLWxvYWQgcmVsZXZhbnQgc3BlY3MgZnJvbSBzcGVjcy8gZGlyZWN0b3J5XG4gICAgICAgIGNvbnN0IHNwZWNzQ29udGV4dCA9IGF3YWl0IHRoaXMubG9hZFJlbGV2YW50U3BlY3MoKTtcbiAgICAgICAgaWYgKHNwZWNzQ29udGV4dCkge1xuICAgICAgICAgICAgY29udGV4dFBhcnRzLnB1c2goc3BlY3NDb250ZXh0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFkZCBnaXQgc3RhdHVzIGlmIGF2YWlsYWJsZVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgZ2l0U3RhdHVzID0gYXdhaXQgdGhpcy5nZXRHaXRTdGF0dXMoKTtcbiAgICAgICAgICAgIGlmIChnaXRTdGF0dXMpIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0UGFydHMucHVzaChgXFxuIyBHaXQgU3RhdHVzXFxuXFxuJHtnaXRTdGF0dXN9XFxuYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgLy8gR2l0IHN0YXR1cyBub3QgYXZhaWxhYmxlLCBza2lwXG4gICAgICAgIH1cblxuICAgICAgICAvLyBBZGQgY29tcGxldGlvbiBjcml0ZXJpYSByZW1pbmRlclxuICAgICAgICBjb250ZXh0UGFydHMucHVzaChcbiAgICAgICAgICAgIGBcXG4jIENvbXBsZXRpb24gQ3JpdGVyaWFcXG5cXG5Mb29wIGV4aXRzIHdoZW4geW91IG91dHB1dCBleGFjdGx5OiAke3RoaXMuY29uZmlnLmNvbXBsZXRpb25Qcm9taXNlIHx8IFwiKG5vbmUgLSB3aWxsIHJ1biBhbGwgY3ljbGVzKVwifVxcbmAsXG4gICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuIGNvbnRleHRQYXJ0cy5qb2luKFwiXFxuXCIpO1xuICAgIH1cblxuICAgIC8qKiBDb2xsZWN0IGFsbCB0b29sIGludm9jYXRpb25zIGZyb20gYSBjeWNsZSBzdGF0ZSAqL1xuICAgIHByaXZhdGUgY29sbGVjdEFsbFRvb2xzKGN5Y2xlOiBDeWNsZVN0YXRlKTogVG9vbEludm9jYXRpb25bXSB7XG4gICAgICAgIGNvbnN0IHRvb2xzOiBUb29sSW52b2NhdGlvbltdID0gW107XG4gICAgICAgIGZvciAoY29uc3QgcGhhc2Ugb2YgT2JqZWN0LnZhbHVlcyhjeWNsZS5waGFzZXMpKSB7XG4gICAgICAgICAgICBpZiAocGhhc2U/LnRvb2xzKSB7XG4gICAgICAgICAgICAgICAgdG9vbHMucHVzaCguLi5waGFzZS50b29scyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRvb2xzO1xuICAgIH1cblxuICAgIC8qKiBMb2FkIHJlbGV2YW50IHNwZWNzIGZyb20gc3BlY3MvIGRpcmVjdG9yeSBtYXRjaGluZyB0aGUgcHJvbXB0ICovXG4gICAgcHJpdmF0ZSBhc3luYyBsb2FkUmVsZXZhbnRTcGVjcygpOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcbiAgICAgICAgY29uc3Qgc3BlY3NEaXIgPSBqb2luKHByb2Nlc3MuY3dkKCksIFwic3BlY3NcIik7XG4gICAgICAgIGxldCBzcGVjczogc3RyaW5nW107XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBzcGVjcyA9IGF3YWl0IHJlYWRkaXIoc3BlY3NEaXIpO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIC8vIE5vIHNwZWNzIGRpcmVjdG9yeSwgc2tpcFxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwcm9tcHRMb3dlciA9IHRoaXMuY29uZmlnLnByb21wdC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBjb25zdCBwcm9tcHRUb2tlbnMgPSBuZXcgU2V0KFxuICAgICAgICAgICAgcHJvbXB0TG93ZXIuc3BsaXQoL1xcVysvKS5maWx0ZXIoKHQpID0+IHQubGVuZ3RoID4gMiksXG4gICAgICAgICk7XG5cbiAgICAgICAgY29uc3QgbWF0Y2hlczogeyBkaXI6IHN0cmluZzsgc2NvcmU6IG51bWJlcjsgdGl0bGU/OiBzdHJpbmcgfVtdID0gW107XG5cbiAgICAgICAgZm9yIChjb25zdCBzcGVjRGlyIG9mIHNwZWNzKSB7XG4gICAgICAgICAgICAvLyBTa2lwIHNwZWNpYWwgZGlyZWN0b3JpZXNcbiAgICAgICAgICAgIGlmIChzcGVjRGlyLnN0YXJ0c1dpdGgoXCIuXCIpKSBjb250aW51ZTtcblxuICAgICAgICAgICAgY29uc3Qgc3BlY1BhdGggPSBqb2luKHNwZWNzRGlyLCBzcGVjRGlyLCBcInNwZWMubWRcIik7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNwZWNDb250ZW50ID0gYXdhaXQgcmVhZEZpbGUoc3BlY1BhdGgsIFwidXRmLThcIik7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3BlY0NvbnRlbnRMb3dlciA9IHNwZWNDb250ZW50LnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgICAgICAgICAgICAvLyBFeHRyYWN0IHRpdGxlIGZyb20gc3BlY1xuICAgICAgICAgICAgICAgIGNvbnN0IHRpdGxlTWF0Y2ggPSBzcGVjQ29udGVudC5tYXRjaCgvXiMgKC4rKSQvbSk7XG4gICAgICAgICAgICAgICAgY29uc3QgdGl0bGUgPSB0aXRsZU1hdGNoPy5bMV07XG5cbiAgICAgICAgICAgICAgICAvLyBDYWxjdWxhdGUgc2ltcGxlIHRva2VuIG92ZXJsYXAgc2NvcmVcbiAgICAgICAgICAgICAgICBsZXQgc2NvcmUgPSAwO1xuICAgICAgICAgICAgICAgIGNvbnN0IHNwZWNUb2tlbnMgPSBuZXcgU2V0KFxuICAgICAgICAgICAgICAgICAgICBzcGVjQ29udGVudExvd2VyLnNwbGl0KC9cXFcrLykuZmlsdGVyKCh0KSA9PiB0Lmxlbmd0aCA+IDIpLFxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHRva2VuIG9mIHByb21wdFRva2Vucykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3BlY1Rva2Vucy5oYXModG9rZW4pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzY29yZSsrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gQm9udXMgZm9yIGRpcmVjdG9yeSBuYW1lIG1hdGNoXG4gICAgICAgICAgICAgICAgY29uc3QgZGlyTG93ZXIgPSBzcGVjRGlyLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICBwcm9tcHRMb3dlci5pbmNsdWRlcyhkaXJMb3dlcikgfHxcbiAgICAgICAgICAgICAgICAgICAgZGlyTG93ZXIuaW5jbHVkZXMoXCJmbGVldHRvb2xzXCIpXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIHNjb3JlICs9IDU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHNjb3JlID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBtYXRjaGVzLnB1c2goeyBkaXI6IHNwZWNEaXIsIHNjb3JlLCB0aXRsZSB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgICAgICAvLyBObyBzcGVjLm1kIGluIHRoaXMgZGlyZWN0b3J5LCBza2lwXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTb3J0IGJ5IHNjb3JlIGFuZCB0YWtlIHRvcCAyXG4gICAgICAgIG1hdGNoZXMuc29ydCgoYSwgYikgPT4gYi5zY29yZSAtIGEuc2NvcmUpO1xuICAgICAgICBjb25zdCB0b3BNYXRjaGVzID0gbWF0Y2hlcy5zbGljZSgwLCAyKTtcblxuICAgICAgICBpZiAodG9wTWF0Y2hlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcmVzdWx0ID0gW1wiXFxuIyBSZWxldmFudCBTcGVjaWZpY2F0aW9uc1xcblwiXTtcblxuICAgICAgICBmb3IgKGNvbnN0IG1hdGNoIG9mIHRvcE1hdGNoZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IHNwZWNQYXRoID0gam9pbihzcGVjc0RpciwgbWF0Y2guZGlyLCBcInNwZWMubWRcIik7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNwZWNDb250ZW50ID0gYXdhaXQgcmVhZEZpbGUoc3BlY1BhdGgsIFwidXRmLThcIik7XG5cbiAgICAgICAgICAgICAgICAvLyBJbmNsdWRlIG92ZXJ2aWV3IGFuZCBhY2NlcHRhbmNlIGNyaXRlcmlhIHNlY3Rpb25zXG4gICAgICAgICAgICAgICAgY29uc3Qgb3ZlcnZpZXdNYXRjaCA9IHNwZWNDb250ZW50Lm1hdGNoKFxuICAgICAgICAgICAgICAgICAgICAvXigjIC4rPykoPzpcXG5cXG4jIyBPdmVydmlld1xcblxcbikoW1xcc1xcU10qPykoPz1cXG5cXG4jIyB8XFxuXFxuIyMjICkvbSxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJTdG9yaWVzTWF0Y2ggPSBzcGVjQ29udGVudC5tYXRjaChcbiAgICAgICAgICAgICAgICAgICAgL14oIyMgVXNlciBTdG9yaWVzXFxuXFxuKShbXFxzXFxTXSo/KSg/PVxcblxcbiMjIHxcXG5cXG4jIyMgKS9tLFxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChgXFxuIyMgJHttYXRjaC50aXRsZSB8fCBtYXRjaC5kaXJ9XFxuYCk7XG5cbiAgICAgICAgICAgICAgICBpZiAob3ZlcnZpZXdNYXRjaCkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaChvdmVydmlld01hdGNoWzJdLnRyaW0oKSk7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKFwiXFxuXCIpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh1c2VyU3Rvcmllc01hdGNoKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEluY2x1ZGUgZmlyc3QgMyB1c2VyIHN0b3JpZXNcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RvcmllcyA9IHVzZXJTdG9yaWVzTWF0Y2hbMl1cbiAgICAgICAgICAgICAgICAgICAgICAgIC5zcGxpdCgvXFxuIyMjIC8pXG4gICAgICAgICAgICAgICAgICAgICAgICAuc2xpY2UoMCwgMyk7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKFwiXFxuIyMjIEtleSBVc2VyIFN0b3JpZXNcXG5cIik7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgc3Rvcnkgb2Ygc3Rvcmllcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0b3J5LnRyaW0oKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKGBcXG4jIyMgJHtzdG9yeS50cmltKCl9XFxuYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsb2cuZGVidWcoXCJMb2FkZWQgc3BlYyBmb3IgY29udGV4dFwiLCB7XG4gICAgICAgICAgICAgICAgICAgIHNwZWM6IG1hdGNoLmRpcixcbiAgICAgICAgICAgICAgICAgICAgc2NvcmU6IG1hdGNoLnNjb3JlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgICAgbG9nLndhcm4oXCJGYWlsZWQgdG8gcmVhZCBzcGVjXCIsIHsgc3BlYzogbWF0Y2guZGlyIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdC5qb2luKFwiXFxuXCIpO1xuICAgIH1cblxuICAgIC8qKiBHZXQgZ2l0IHN0YXR1cyBmb3IgY29udGV4dCAqL1xuICAgIHByaXZhdGUgYXN5bmMgZ2V0R2l0U3RhdHVzKCk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgeyBleGVjU3luYyB9ID0gYXdhaXQgaW1wb3J0KFwibm9kZTpjaGlsZF9wcm9jZXNzXCIpO1xuICAgICAgICAgICAgY29uc3QgZGlmZiA9IGV4ZWNTeW5jKFwiZ2l0IGRpZmYgLS1zdGF0XCIsIHtcbiAgICAgICAgICAgICAgICBlbmNvZGluZzogXCJ1dGYtOFwiLFxuICAgICAgICAgICAgICAgIGN3ZDogcHJvY2Vzcy5jd2QoKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc3Qgc3RhdHVzID0gZXhlY1N5bmMoXCJnaXQgc3RhdHVzIC0tc2hvcnRcIiwge1xuICAgICAgICAgICAgICAgIGVuY29kaW5nOiBcInV0Zi04XCIsXG4gICAgICAgICAgICAgICAgY3dkOiBwcm9jZXNzLmN3ZCgpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gYFxcYFxcYFxcYFxcbiR7ZGlmZn1cXG4ke3N0YXR1c31cXG5cXGBcXGBcXGBgO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIEV4ZWN1dGUgYSBzaW5nbGUgY3ljbGUgd2l0aCBmcmVzaCBzZXNzaW9uICovXG4gICAgcHJpdmF0ZSBhc3luYyBleGVjdXRlQ3ljbGUoXG4gICAgICAgIGN5Y2xlTnVtYmVyOiBudW1iZXIsXG4gICAgICAgIGNsaWVudDogT3BlbkNvZGVDbGllbnQsXG4gICAgICAgIGNvbnRleHQ6IHN0cmluZyxcbiAgICApOiBQcm9taXNlPHtcbiAgICAgICAgc3VjY2VzczogYm9vbGVhbjtcbiAgICAgICAgY3ljbGVTdGF0ZTogQ3ljbGVTdGF0ZTtcbiAgICAgICAgc3VtbWFyeTogc3RyaW5nO1xuICAgICAgICBzdG9wUmVhc29uPzogU3RvcFJlYXNvbjtcbiAgICB9PiB7XG4gICAgICAgIGNvbnN0IHN0YXJ0VGltZSA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICAgICAgY29uc3QgY3ljbGVTdGF0ZTogQ3ljbGVTdGF0ZSA9IHtcbiAgICAgICAgICAgIGN5Y2xlTnVtYmVyLFxuICAgICAgICAgICAgc3RhdHVzOiBcInJ1bm5pbmdcIixcbiAgICAgICAgICAgIHN0YXJ0VGltZSxcbiAgICAgICAgICAgIHBoYXNlczoge30sXG4gICAgICAgICAgICBnYXRlUmVzdWx0czogW10sXG4gICAgICAgICAgICBjb21wbGV0aW9uUHJvbWlzZU9ic2VydmVkOiBmYWxzZSxcbiAgICAgICAgfTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gQ3JlYXRlIHNlc3Npb24gd2l0aCBjb250ZXh0IGFzIGluaXRpYWwgcHJvbXB0ICh3aWxsIGJlIGNvbWJpbmVkIHdpdGggZmlyc3QgbWVzc2FnZSlcbiAgICAgICAgICAgIGNvbnN0IHNlc3Npb24gPSBhd2FpdCBjbGllbnQuY3JlYXRlU2Vzc2lvbihjb250ZXh0KTtcblxuICAgICAgICAgICAgLy8gRXhlY3V0ZSB3b3JrZmxvdyBwaGFzZXNcbiAgICAgICAgICAgIGZvciAoY29uc3QgcGhhc2Ugb2YgW1xuICAgICAgICAgICAgICAgIFBoYXNlLlJFU0VBUkNILFxuICAgICAgICAgICAgICAgIFBoYXNlLlNQRUNJRlksXG4gICAgICAgICAgICAgICAgUGhhc2UuUExBTixcbiAgICAgICAgICAgICAgICBQaGFzZS5XT1JLLFxuICAgICAgICAgICAgICAgIFBoYXNlLlJFVklFVyxcbiAgICAgICAgICAgIF0pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwaGFzZVJlc3VsdCA9IGF3YWl0IHRoaXMuZXhlY3V0ZVBoYXNlKFxuICAgICAgICAgICAgICAgICAgICBzZXNzaW9uLFxuICAgICAgICAgICAgICAgICAgICBwaGFzZSxcbiAgICAgICAgICAgICAgICAgICAgY3ljbGVOdW1iZXIsXG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgIGlmIChwaGFzZVJlc3VsdC5lcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBjeWNsZVN0YXRlLnBoYXNlc1twaGFzZV0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwaGFzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb21wdDogcGhhc2VSZXN1bHQucHJvbXB0LFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2U6IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdW1tYXJ5OiBgRXJyb3I6ICR7cGhhc2VSZXN1bHQuZXJyb3J9YCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgICBgJHtwaGFzZX0gcGhhc2UgZmFpbGVkOiAke3BoYXNlUmVzdWx0LmVycm9yfWAsXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY3ljbGVTdGF0ZS5waGFzZXNbcGhhc2VdID0ge1xuICAgICAgICAgICAgICAgICAgICBwaGFzZSxcbiAgICAgICAgICAgICAgICAgICAgcHJvbXB0OiBwaGFzZVJlc3VsdC5wcm9tcHQsXG4gICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlOiBwaGFzZVJlc3VsdC5yZXNwb25zZSxcbiAgICAgICAgICAgICAgICAgICAgc3VtbWFyeTogcGhhc2VSZXN1bHQuc3VtbWFyeSxcbiAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICAgICAgICAgIHRvb2xzOiBwaGFzZVJlc3VsdC50b29scyxcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIGNvbXBsZXRpb24gcHJvbWlzZSBkdXJpbmcgcGhhc2UgZXhlY3V0aW9uXG4gICAgICAgICAgICAgICAgLy8gT25seSBjaGVjayBpbiBzaGlwIG1vZGUgKHdoZW4gY29tcGxldGlvblByb21pc2UgaXMgc2V0KVxuICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWcuY29tcGxldGlvblByb21pc2UgJiZcbiAgICAgICAgICAgICAgICAgICAgcGhhc2VSZXN1bHQucmVzcG9uc2UuaW5jbHVkZXModGhpcy5jb25maWcuY29tcGxldGlvblByb21pc2UpXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIGN5Y2xlU3RhdGUuY29tcGxldGlvblByb21pc2VPYnNlcnZlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgVUkucHJpbnRsbihcbiAgICAgICAgICAgICAgICAgICAgYCR7VUkuU3R5bGUuVEVYVF9ESU19ICDihpIgJHtwaGFzZX06IGRvbmUke1VJLlN0eWxlLlRFWFRfTk9STUFMfWAsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gUnVuIHF1YWxpdHkgZ2F0ZXNcbiAgICAgICAgICAgIFVJLnByaW50bG4oXG4gICAgICAgICAgICAgICAgYCR7VUkuU3R5bGUuVEVYVF9ESU19UnVubmluZyBxdWFsaXR5IGdhdGVzLi4uJHtVSS5TdHlsZS5URVhUX05PUk1BTH1gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGNvbnN0IGdhdGVSZXN1bHRzID0gYXdhaXQgdGhpcy5ydW5RdWFsaXR5R2F0ZXMoXG4gICAgICAgICAgICAgICAgY3ljbGVOdW1iZXIsXG4gICAgICAgICAgICAgICAgY3ljbGVTdGF0ZSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBjeWNsZVN0YXRlLmdhdGVSZXN1bHRzID0gZ2F0ZVJlc3VsdHM7XG5cbiAgICAgICAgICAgIC8vIENoZWNrIGlmIGFueSByZXF1aXJlZCBnYXRlIGZhaWxlZFxuICAgICAgICAgICAgY29uc3QgcmVxdWlyZWRGYWlsZWQgPSBnYXRlUmVzdWx0cy5maW5kKFxuICAgICAgICAgICAgICAgIChnKSA9PiAhZy5wYXNzZWQgJiYgdGhpcy5jb25maWcuZ2F0ZXMuaW5jbHVkZXMoZy5nYXRlKSxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGxldCBmYWlsZWRQaGFzZUluZm8gPSBcIlwiO1xuICAgICAgICAgICAgaWYgKHJlcXVpcmVkRmFpbGVkKSB7XG4gICAgICAgICAgICAgICAgLy8gRmluZCB3aGljaCBwaGFzZSBoYWQgdGhlIG1vc3QgcmVjZW50IGZhaWx1cmVcbiAgICAgICAgICAgICAgICBjb25zdCBwaGFzZXNXaXRoR2F0ZXMgPSBPYmplY3QuZW50cmllcyhjeWNsZVN0YXRlLnBoYXNlcyk7XG4gICAgICAgICAgICAgICAgY29uc3QgbGFzdFBoYXNlID1cbiAgICAgICAgICAgICAgICAgICAgcGhhc2VzV2l0aEdhdGVzW3BoYXNlc1dpdGhHYXRlcy5sZW5ndGggLSAxXT8uWzBdID8/XG4gICAgICAgICAgICAgICAgICAgIFwidW5rbm93blwiO1xuICAgICAgICAgICAgICAgIGZhaWxlZFBoYXNlSW5mbyA9IGAke2xhc3RQaGFzZX0gZ2F0ZSBmYWlsZWRgO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjeWNsZVN0YXRlLnN0YXR1cyA9IFwiY29tcGxldGVkXCI7XG4gICAgICAgICAgICBjeWNsZVN0YXRlLmVuZFRpbWUgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgICAgICBjeWNsZVN0YXRlLmR1cmF0aW9uTXMgPSBEYXRlLm5vdygpIC0gbmV3IERhdGUoc3RhcnRUaW1lKS5nZXRUaW1lKCk7XG5cbiAgICAgICAgICAgIC8vIEdlbmVyYXRlIHN1bW1hcnlcbiAgICAgICAgICAgIGNvbnN0IHN1bW1hcnkgPSB0aGlzLmdlbmVyYXRlQ3ljbGVTdW1tYXJ5KGN5Y2xlU3RhdGUpO1xuXG4gICAgICAgICAgICAvLyBDaGVjayBzdG9wIGNvbmRpdGlvbnNcbiAgICAgICAgICAgIC8vIE9ubHkgY2hlY2sgY29tcGxldGlvbiBwcm9taXNlIGluIHNoaXAgbW9kZSAod2hlbiBjb21wbGV0aW9uUHJvbWlzZSBpcyBzZXQpXG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcuY29tcGxldGlvblByb21pc2UgJiZcbiAgICAgICAgICAgICAgICBjeWNsZVN0YXRlLmNvbXBsZXRpb25Qcm9taXNlT2JzZXJ2ZWRcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGN5Y2xlU3RhdGUsXG4gICAgICAgICAgICAgICAgICAgIHN1bW1hcnksXG4gICAgICAgICAgICAgICAgICAgIHN0b3BSZWFzb246IFN0b3BSZWFzb24uQ09NUExFVElPTl9QUk9NSVNFLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChyZXF1aXJlZEZhaWxlZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBjeWNsZVN0YXRlLFxuICAgICAgICAgICAgICAgICAgICBzdW1tYXJ5OiBgJHtmYWlsZWRQaGFzZUluZm99OiAke3JlcXVpcmVkRmFpbGVkLm1lc3NhZ2V9YCxcbiAgICAgICAgICAgICAgICAgICAgc3RvcFJlYXNvbjogU3RvcFJlYXNvbi5HQVRFX0ZBSUxVUkUsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQ2FsY3VsYXRlIG91dHB1dCBoYXNoIGZvciBzdHVjayBkZXRlY3Rpb25cbiAgICAgICAgICAgIGN5Y2xlU3RhdGUub3V0cHV0SGFzaCA9IHRoaXMuaGFzaE91dHB1dChcbiAgICAgICAgICAgICAgICBPYmplY3QudmFsdWVzKGN5Y2xlU3RhdGUucGhhc2VzKVxuICAgICAgICAgICAgICAgICAgICAubWFwKChwKSA9PiBwPy5yZXNwb25zZSA/PyBcIlwiKVxuICAgICAgICAgICAgICAgICAgICAuam9pbihcInxcIiksXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBjeWNsZVN0YXRlLCBzdW1tYXJ5IH07XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1zZyA9XG4gICAgICAgICAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuXG4gICAgICAgICAgICBjeWNsZVN0YXRlLnN0YXR1cyA9IFwiZmFpbGVkXCI7XG4gICAgICAgICAgICBjeWNsZVN0YXRlLmVuZFRpbWUgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgICAgICBjeWNsZVN0YXRlLmR1cmF0aW9uTXMgPSBEYXRlLm5vdygpIC0gbmV3IERhdGUoc3RhcnRUaW1lKS5nZXRUaW1lKCk7XG4gICAgICAgICAgICBjeWNsZVN0YXRlLmVycm9yID0gZXJyb3JNc2c7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgY3ljbGVTdGF0ZSxcbiAgICAgICAgICAgICAgICBzdW1tYXJ5OiBgQ3ljbGUgZmFpbGVkOiAke2Vycm9yTXNnfWAsXG4gICAgICAgICAgICAgICAgc3RvcFJlYXNvbjogU3RvcFJlYXNvbi5FUlJPUixcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogRXhlY3V0ZSBhIHNpbmdsZSBwaGFzZSAqL1xuICAgIHByaXZhdGUgYXN5bmMgZXhlY3V0ZVBoYXNlKFxuICAgICAgICBzZXNzaW9uOiBTZXNzaW9uLFxuICAgICAgICBwaGFzZTogUGhhc2UsXG4gICAgICAgIGN5Y2xlTnVtYmVyOiBudW1iZXIsXG4gICAgKTogUHJvbWlzZTx7XG4gICAgICAgIHByb21wdDogc3RyaW5nO1xuICAgICAgICByZXNwb25zZTogc3RyaW5nO1xuICAgICAgICBzdW1tYXJ5OiBzdHJpbmc7XG4gICAgICAgIHRvb2xzOiBUb29sSW52b2NhdGlvbltdO1xuICAgICAgICBlcnJvcj86IHN0cmluZztcbiAgICB9PiB7XG4gICAgICAgIGNvbnN0IHBoYXNlUHJvbXB0czogUmVjb3JkPFBoYXNlLCBzdHJpbmc+ID0ge1xuICAgICAgICAgICAgW1BoYXNlLlJFU0VBUkNIXTogYCMjIFBoYXNlIDE6IFJlc2VhcmNoXG5cblJlc2VhcmNoIHRoZSBjb2RlYmFzZSB0byB1bmRlcnN0YW5kIHRoZSBjdXJyZW50IHN0YXRlLiBGb2N1cyBvbjpcbi0gRmlsZSBzdHJ1Y3R1cmUgYW5kIGtleSBtb2R1bGVzXG4tIEV4aXN0aW5nIHBhdHRlcm5zIGFuZCBjb252ZW50aW9uc1xuLSBEZXBlbmRlbmNpZXMgYW5kIGNvbmZpZ3VyYXRpb25zXG4tIEFueSByZWxldmFudCBkb2N1bWVudGF0aW9uXG5cblByb3ZpZGUgYSBjb25jaXNlIHN1bW1hcnkgb2YgeW91ciBmaW5kaW5ncy5gLFxuXG4gICAgICAgICAgICBbUGhhc2UuU1BFQ0lGWV06IGAjIyBQaGFzZSAyOiBTcGVjaWZ5XG5cbkJhc2VkIG9uIHRoZSByZXNlYXJjaCwgY3JlYXRlIGEgZGV0YWlsZWQgc3BlY2lmaWNhdGlvbiBmb3IgdGhlIHRhc2s6XG4tIFJlcXVpcmVtZW50cyBhbmQgYWNjZXB0YW5jZSBjcml0ZXJpYVxuLSBUZWNobmljYWwgYXBwcm9hY2hcbi0gUG90ZW50aWFsIGNoYWxsZW5nZXMgYW5kIG1pdGlnYXRpb24gc3RyYXRlZ2llc1xuLSBEZXBlbmRlbmNpZXMgb24gZXhpc3RpbmcgY29kZVxuXG5PdXRwdXQgYSBzdHJ1Y3R1cmVkIHNwZWNpZmljYXRpb24uYCxcblxuICAgICAgICAgICAgW1BoYXNlLlBMQU5dOiBgIyMgUGhhc2UgMzogUGxhblxuXG5DcmVhdGUgYW4gaW1wbGVtZW50YXRpb24gcGxhbjpcbi0gU3RlcC1ieS1zdGVwIHRhc2tzXG4tIEZpbGVzIHRvIG1vZGlmeS9jcmVhdGVcbi0gT3JkZXIgb2Ygb3BlcmF0aW9uc1xuLSBUZXN0aW5nIHN0cmF0ZWd5XG5cbk91dHB1dCBhIGRldGFpbGVkIHBsYW4uYCxcblxuICAgICAgICAgICAgW1BoYXNlLldPUktdOiBgIyMgUGhhc2UgNDogV29ya1xuXG5FeGVjdXRlIHRoZSBpbXBsZW1lbnRhdGlvbiBwbGFuLiBNYWtlIGNvbmNyZXRlIGNoYW5nZXMgdG8gdGhlIGNvZGViYXNlLlxuXG5JTVBPUlRBTlQ6IFlvdSBNVVNUOlxuMS4gVXNlIHRvb2xzIChSZWFkLCBXcml0ZSwgRWRpdCwgQmFzaCkgdG8gbWFrZSBhY3R1YWwgZmlsZSBjaGFuZ2VzXG4yLiBSZXBvcnQgZWFjaCBmaWxlIHlvdSBtb2RpZnkgYXMgeW91IGdvIChlLmcuLCBcIkNyZWF0aW5nIGZpbGUgWC4uLlwiLCBcIk1vZGlmeWluZyBZLi4uXCIpXG4zLiBSdW4gYWN0dWFsIHRlc3RzIGFuZCByZXBvcnQgcmVzdWx0c1xuNC4gRW5zdXJlIHRoZSBmaW5hbCBzdW1tYXJ5IGxpc3RzOlxuICAgLSBBbGwgZmlsZXMgY3JlYXRlZC9tb2RpZmllZCAod2l0aCBwYXRocykgT1IgZXhwbGljaXRseSBcIk5PIENIQU5HRVM6IDxyZWFzb24+XCIgaWYgbm8gZmlsZXMgbmVlZGVkXG4gICAtIEFsbCB0ZXN0IHJlc3VsdHMgKHBhc3MvZmFpbClcbiAgIC0gQW55IGVycm9ycyBlbmNvdW50ZXJlZCBhbmQgaG93IHRoZXkgd2VyZSByZXNvbHZlZFxuXG5JZiBubyBjaGFuZ2VzIGFyZSBuZWVkZWQsIGV4cGxpY2l0bHkgc3RhdGUgXCJOTyBDSEFOR0VTOiA8cmVhc29uPlwiIGFuZCB3aHkuXG5cblByb3ZpZGUgYSBjb21wcmVoZW5zaXZlIHN1bW1hcnkgb2YgY29uY3JldGUgd29yayBjb21wbGV0ZWQuYCxcblxuICAgICAgICAgICAgW1BoYXNlLlJFVklFV106IGAjIyBQaGFzZSA1OiBSZXZpZXdcblxuUmV2aWV3IHRoZSBjb21wbGV0ZWQgd29yazpcbi0gVmVyaWZ5IGFsbCBhY2NlcHRhbmNlIGNyaXRlcmlhIGFyZSBtZXRcbi0gQ2hlY2sgY29kZSBxdWFsaXR5IGFuZCBjb25zaXN0ZW5jeVxuLSBFbnN1cmUgdGVzdHMgcGFzc1xuLSBJZGVudGlmeSBhbnkgcmVtYWluaW5nIGlzc3Vlc1xuXG5PdXRwdXQ6IDxwcm9taXNlPlNISVA8L3Byb21pc2U+IGlmIGFsbCBjcml0ZXJpYSBhcmUgbWV0LCBvciBsaXN0IHJlbWFpbmluZyBpc3N1ZXMuYCxcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBwcm9tcHQgPSBwaGFzZVByb21wdHNbcGhhc2VdO1xuXG4gICAgICAgIC8vIFVzZSBzdHJlYW1pbmcgZm9yIHJlYWwtdGltZSBmZWVkYmFja1xuICAgICAgICBjb25zdCBzdHJlYW1pbmdSZXNwb25zZSA9IGF3YWl0IHNlc3Npb24uc2VuZE1lc3NhZ2VTdHJlYW0ocHJvbXB0KTtcblxuICAgICAgICBsZXQgZnVsbFJlc3BvbnNlID0gXCJcIjtcbiAgICAgICAgY29uc3QgdG9vbHM6IFRvb2xJbnZvY2F0aW9uW10gPSBbXTtcblxuICAgICAgICBVSS5wcmludGxuKGAke1VJLlN0eWxlLlRFWFRfRElNfSAgWyR7cGhhc2V9XSR7VUkuU3R5bGUuVEVYVF9OT1JNQUx9YCk7XG5cbiAgICAgICAgY29uc3QgcmVhZGVyID0gc3RyZWFtaW5nUmVzcG9uc2Uuc3RyZWFtLmdldFJlYWRlcigpO1xuICAgICAgICBjb25zdCBkZWNvZGVyID0gbmV3IFRleHREZWNvZGVyKCk7XG5cbiAgICAgICAgLy8gUnVubmVyLXNpZGUgd2F0Y2hkb2c6IHByZXZlbnQgaW5kZWZpbml0ZSBoYW5nc1xuICAgICAgICBjb25zdCBwaGFzZVRpbWVvdXRNcyA9XG4gICAgICAgICAgICAodGhpcy5jb25maWcucGhhc2VUaW1lb3V0TXMgPz9cbiAgICAgICAgICAgICAgICAodGhpcy5jb25maWcucHJvbXB0VGltZW91dCA/PyAzMDAwMDApICogNSkgfHxcbiAgICAgICAgICAgIDkwMDAwMDtcbiAgICAgICAgbGV0IHBoYXNlVGltZWRPdXQgPSBmYWxzZTtcblxuICAgICAgICBjb25zdCB3YXRjaGRvZ1RpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBwaGFzZVRpbWVkT3V0ID0gdHJ1ZTtcbiAgICAgICAgICAgIGxvZy53YXJuKFwiUGhhc2Ugd2F0Y2hkb2cgdHJpZ2dlcmVkXCIsIHtcbiAgICAgICAgICAgICAgICBjeWNsZU51bWJlcixcbiAgICAgICAgICAgICAgICBwaGFzZSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0TXM6IHBoYXNlVGltZW91dE1zLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZWFkZXIuY2FuY2VsKGBQaGFzZSB0aW1lb3V0IGFmdGVyICR7cGhhc2VUaW1lb3V0TXN9bXNgKTtcbiAgICAgICAgfSwgcGhhc2VUaW1lb3V0TXMpO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgZG9uZSwgdmFsdWUgfSA9IGF3YWl0IHJlYWRlci5yZWFkKCk7XG5cbiAgICAgICAgICAgICAgICBpZiAocGhhc2VUaW1lZE91dCkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgICBgUGhhc2UgJHtwaGFzZX0gdGltZWQgb3V0IGFmdGVyICR7cGhhc2VUaW1lb3V0TXN9bXMgKHdhdGNoZG9nKWAsXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGRvbmUpIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRleHQgPSBkZWNvZGVyLmRlY29kZSh2YWx1ZSwgeyBzdHJlYW06IHRydWUgfSk7XG4gICAgICAgICAgICAgICAgICAgIGZ1bGxSZXNwb25zZSArPSB0ZXh0O1xuICAgICAgICAgICAgICAgICAgICBVSS5wcmludCh0ZXh0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgcGhhc2VUaW1lZE91dCB8fFxuICAgICAgICAgICAgICAgIChlcnJvciBpbnN0YW5jZW9mIEVycm9yICYmIGVycm9yLm1lc3NhZ2UuaW5jbHVkZXMoXCJ0aW1lb3V0XCIpKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kaXNjb3JkV2ViaG9vaz8ubm90aWZ5VGltZW91dChcbiAgICAgICAgICAgICAgICAgICAgY3ljbGVOdW1iZXIsXG4gICAgICAgICAgICAgICAgICAgIHBoYXNlLFxuICAgICAgICAgICAgICAgICAgICBwaGFzZVRpbWVvdXRNcyxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgYFBoYXNlICR7cGhhc2V9IHRpbWVkIG91dCBhZnRlciAke3BoYXNlVGltZW91dE1zfW1zIC0gT3BlbkNvZGUgc3RyZWFtIGRpZCBub3QgY29tcGxldGVgLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh3YXRjaGRvZ1RpbWVyKTtcbiAgICAgICAgICAgIHJlYWRlci5yZWxlYXNlTG9jaygpO1xuICAgICAgICB9XG5cbiAgICAgICAgYXdhaXQgc3RyZWFtaW5nUmVzcG9uc2UuY29tcGxldGU7XG5cbiAgICAgICAgLy8gQ29sbGVjdCB0b29sIGludm9jYXRpb25zIGZyb20gc2Vzc2lvbiBpZiBhdmFpbGFibGVcbiAgICAgICAgLy8gTm90ZTogVGhpcyBpcyBhIHBsYWNlaG9sZGVyIC0gdGhlIGFjdHVhbCB0b29sIGNhcHR1cmUgd291bGQgY29tZSBmcm9tXG4gICAgICAgIC8vIHNlc3Npb24gZXZlbnRzIGluIGEgbW9yZSBjb21wbGV0ZSBpbXBsZW1lbnRhdGlvblxuICAgICAgICBjb25zdCBzZXNzaW9uVG9vbHMgPSAoXG4gICAgICAgICAgICBzZXNzaW9uIGFzIHsgX3Rvb2xJbnZvY2F0aW9ucz86IFRvb2xJbnZvY2F0aW9uW10gfVxuICAgICAgICApLl90b29sSW52b2NhdGlvbnM7XG4gICAgICAgIGlmIChzZXNzaW9uVG9vbHMgJiYgc2Vzc2lvblRvb2xzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHRvb2xzLnB1c2goLi4uc2Vzc2lvblRvb2xzKTtcblxuICAgICAgICAgICAgLy8gRGVidWcgb3V0cHV0IGZvciB0b29sc1xuICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlnLmRlYnVnV29yaykge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdG9vbCBvZiBzZXNzaW9uVG9vbHMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVkYWN0ZWRJbnB1dCA9IHRvb2wuaW5wdXRcbiAgICAgICAgICAgICAgICAgICAgICAgID8gcmVkYWN0U2VjcmV0cyhKU09OLnN0cmluZ2lmeSh0b29sLmlucHV0KSlcbiAgICAgICAgICAgICAgICAgICAgICAgIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZWRhY3RlZE91dHB1dCA9IHRvb2wub3V0cHV0XG4gICAgICAgICAgICAgICAgICAgICAgICA/IHRydW5jYXRlT3V0cHV0KHJlZGFjdFNlY3JldHModG9vbC5vdXRwdXQpKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiB1bmRlZmluZWQ7XG5cbiAgICAgICAgICAgICAgICAgICAgVUkucHJpbnRsbihcbiAgICAgICAgICAgICAgICAgICAgICAgIGAke1VJLlN0eWxlLlRFWFRfRElNfSAgW1RPT0xdICR7dG9vbC5uYW1lfTogJHt0b29sLnN0YXR1c30ke1VJLlN0eWxlLlRFWFRfTk9STUFMfWAsXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcIlRvb2wgaW52b2NhdGlvblwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwaGFzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvb2w6IHRvb2wubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czogdG9vbC5zdGF0dXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnB1dDogcmVkYWN0ZWRJbnB1dCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dDogcmVkYWN0ZWRPdXRwdXQsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEdlbmVyYXRlIHN1bW1hcnkgZnJvbSByZXNwb25zZVxuICAgICAgICBjb25zdCBzdW1tYXJ5ID0gdGhpcy5nZW5lcmF0ZVBoYXNlU3VtbWFyeShmdWxsUmVzcG9uc2UpO1xuXG4gICAgICAgIC8vIE5vdGlmeSBEaXNjb3JkOiBwaGFzZSBjb21wbGV0ZWRcbiAgICAgICAgdGhpcy5kaXNjb3JkV2ViaG9vaz8ubm90aWZ5UGhhc2VDb21wbGV0ZShjeWNsZU51bWJlciwgcGhhc2UsIHN1bW1hcnkpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBwcm9tcHQsXG4gICAgICAgICAgICByZXNwb25zZTogZnVsbFJlc3BvbnNlLFxuICAgICAgICAgICAgc3VtbWFyeSxcbiAgICAgICAgICAgIHRvb2xzLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qKiBHZW5lcmF0ZSBzdW1tYXJ5IGZvciBhIHBoYXNlICovXG4gICAgcHJpdmF0ZSBnZW5lcmF0ZVBoYXNlU3VtbWFyeShyZXNwb25zZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgLy8gVGFrZSBmaXJzdCAyMDAgY2hhcmFjdGVycyBhcyBzdW1tYXJ5XG4gICAgICAgIGNvbnN0IHRyaW1tZWQgPSByZXNwb25zZS50cmltKCk7XG4gICAgICAgIGlmICh0cmltbWVkLmxlbmd0aCA8PSAyMDApIHtcbiAgICAgICAgICAgIHJldHVybiB0cmltbWVkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBgJHt0cmltbWVkLnN1YnN0cmluZygwLCAyMDApfS4uLmA7XG4gICAgfVxuXG4gICAgLyoqIEdlbmVyYXRlIGN5Y2xlIHN1bW1hcnkgKi9cbiAgICBwcml2YXRlIGdlbmVyYXRlQ3ljbGVTdW1tYXJ5KGN5Y2xlOiBDeWNsZVN0YXRlKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgcGFydHM6IHN0cmluZ1tdID0gW107XG5cbiAgICAgICAgZm9yIChjb25zdCBbcGhhc2UsIG91dHB1dF0gb2YgT2JqZWN0LmVudHJpZXMoY3ljbGUucGhhc2VzKSkge1xuICAgICAgICAgICAgaWYgKG91dHB1dCkge1xuICAgICAgICAgICAgICAgIHBhcnRzLnB1c2goYCR7cGhhc2V9OiAke291dHB1dC5zdW1tYXJ5fWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBhcnRzLmpvaW4oXCIgfCBcIik7XG4gICAgfVxuXG4gICAgLyoqIFJ1biBxdWFsaXR5IGdhdGVzICovXG4gICAgcHJpdmF0ZSBhc3luYyBydW5RdWFsaXR5R2F0ZXMoXG4gICAgICAgIGN5Y2xlTnVtYmVyOiBudW1iZXIsXG4gICAgICAgIGN5Y2xlOiBDeWNsZVN0YXRlLFxuICAgICk6IFByb21pc2U8R2F0ZVJlc3VsdFtdPiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdHM6IEdhdGVSZXN1bHRbXSA9IFtdO1xuICAgICAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG5cbiAgICAgICAgZm9yIChjb25zdCBnYXRlIG9mIHRoaXMuY29uZmlnLmdhdGVzKSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLnJ1bkdhdGUoZ2F0ZSwgY3ljbGUpO1xuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHtcbiAgICAgICAgICAgICAgICBnYXRlLFxuICAgICAgICAgICAgICAgIHBhc3NlZDogcmVzdWx0LnBhc3NlZCxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiByZXN1bHQubWVzc2FnZSxcbiAgICAgICAgICAgICAgICBkZXRhaWxzOiByZXN1bHQuZGV0YWlscyxcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IG5vdyxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBTYXZlIGdhdGUgcmVzdWx0c1xuICAgICAgICAgICAgdGhpcy5mbG93U3RvcmUuc2F2ZUdhdGVSZXN1bHRzKGN5Y2xlTnVtYmVyLCByZXN1bHRzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cblxuICAgIC8qKiBSdW4gYSBzaW5nbGUgcXVhbGl0eSBnYXRlICovXG4gICAgcHJpdmF0ZSBhc3luYyBydW5HYXRlKFxuICAgICAgICBnYXRlOiBzdHJpbmcsXG4gICAgICAgIGN5Y2xlOiBDeWNsZVN0YXRlLFxuICAgICk6IFByb21pc2U8e1xuICAgICAgICBwYXNzZWQ6IGJvb2xlYW47XG4gICAgICAgIG1lc3NhZ2U6IHN0cmluZztcbiAgICAgICAgZGV0YWlscz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgIH0+IHtcbiAgICAgICAgY29uc3QgZ2F0ZUNvbmZpZyA9IHRoaXMuZ2V0R2F0ZUNvbmZpZyhnYXRlKTtcblxuICAgICAgICBzd2l0Y2ggKGdhdGUudG9Mb3dlckNhc2UoKSkge1xuICAgICAgICAgICAgY2FzZSBcInRlc3RcIjpcbiAgICAgICAgICAgIGNhc2UgXCJ0ZXN0c1wiOiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5ydW5HYXRlQ29tbWFuZChcbiAgICAgICAgICAgICAgICAgICAgXCJ0ZXN0XCIsXG4gICAgICAgICAgICAgICAgICAgIGdhdGVDb25maWcuY29tbWFuZCxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHBhc3NlZDogcmVzdWx0LnBhc3NlZCxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogcmVzdWx0LnBhc3NlZFxuICAgICAgICAgICAgICAgICAgICAgICAgPyBcIkFsbCB0ZXN0cyBwYXNzZWRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgOiBcIlNvbWUgdGVzdHMgZmFpbGVkXCIsXG4gICAgICAgICAgICAgICAgICAgIGRldGFpbHM6IHJlc3VsdC5kZXRhaWxzLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIFwibGludFwiOiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5ydW5HYXRlQ29tbWFuZChcbiAgICAgICAgICAgICAgICAgICAgXCJsaW50XCIsXG4gICAgICAgICAgICAgICAgICAgIGdhdGVDb25maWcuY29tbWFuZCxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHBhc3NlZDogcmVzdWx0LnBhc3NlZCxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogcmVzdWx0LnBhc3NlZFxuICAgICAgICAgICAgICAgICAgICAgICAgPyBcIkxpbnRpbmcgcGFzc2VkXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIDogXCJMaW50aW5nIGlzc3VlcyBmb3VuZFwiLFxuICAgICAgICAgICAgICAgICAgICBkZXRhaWxzOiByZXN1bHQuZGV0YWlscyxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBcImFjY2VwdGFuY2VcIjoge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhc3NlZCA9IGF3YWl0IHRoaXMuY2hlY2tBY2NlcHRhbmNlKGN5Y2xlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBwYXNzZWQsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHBhc3NlZFxuICAgICAgICAgICAgICAgICAgICAgICAgPyBcIkFjY2VwdGFuY2UgY3JpdGVyaWEgbWV0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIDogXCJBY2NlcHRhbmNlIGNyaXRlcmlhIG5vdCBmdWxseSBtZXRcIixcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBwYXNzZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBgVW5rbm93biBnYXRlOiAke2dhdGV9YCxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIEdldCBnYXRlIGNvbmZpZ3VyYXRpb24gZnJvbSBiYXNlQ29uZmlnICovXG4gICAgcHJpdmF0ZSBnZXRHYXRlQ29uZmlnKGdhdGU6IHN0cmluZyk6IEdhdGVDb21tYW5kQ29uZmlnIHtcbiAgICAgICAgLy8gTm9ybWFsaXplIGdhdGUgbmFtZXM6IGNhbm9uaWNhbCBpcyBcInRlc3RcIiwgYWNjZXB0IFwidGVzdHNcIiBmb3IgYmFja3dhcmQgY29tcGF0XG4gICAgICAgIGNvbnN0IG5vcm1hbGl6ZWRHYXRlID1cbiAgICAgICAgICAgIGdhdGUudG9Mb3dlckNhc2UoKSA9PT0gXCJ0ZXN0c1wiID8gXCJ0ZXN0XCIgOiBnYXRlLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGNvbnN0IGdhdGVLZXkgPSBub3JtYWxpemVkR2F0ZSBhcyBrZXlvZiB0eXBlb2YgdGhpcy5iYXNlQ29uZmlnLmdhdGVzO1xuICAgICAgICBjb25zdCBjb25maWdHYXRlID0gdGhpcy5iYXNlQ29uZmlnLmdhdGVzW2dhdGVLZXldO1xuICAgICAgICBpZiAoXG4gICAgICAgICAgICBjb25maWdHYXRlICYmXG4gICAgICAgICAgICB0eXBlb2YgY29uZmlnR2F0ZSA9PT0gXCJvYmplY3RcIiAmJlxuICAgICAgICAgICAgXCJjb21tYW5kXCIgaW4gY29uZmlnR2F0ZVxuICAgICAgICApIHtcbiAgICAgICAgICAgIHJldHVybiBjb25maWdHYXRlIGFzIEdhdGVDb21tYW5kQ29uZmlnO1xuICAgICAgICB9XG4gICAgICAgIC8vIEZhbGxiYWNrIGZvciBsZWdhY3kgc3RyaW5nIGZvcm1hdFxuICAgICAgICByZXR1cm4geyBjb21tYW5kOiBTdHJpbmcoY29uZmlnR2F0ZSA/PyBcIlwiKSB9O1xuICAgIH1cblxuICAgIC8qKiBSdW4gYSBnYXRlIGNvbW1hbmQgYW5kIGNhcHR1cmUgcmVzdWx0cyAqL1xuICAgIHByaXZhdGUgYXN5bmMgcnVuR2F0ZUNvbW1hbmQoXG4gICAgICAgIGdhdGVOYW1lOiBzdHJpbmcsXG4gICAgICAgIGNvbW1hbmQ6IHN0cmluZyxcbiAgICApOiBQcm9taXNlPHtcbiAgICAgICAgcGFzc2VkOiBib29sZWFuO1xuICAgICAgICBkZXRhaWxzOiB7XG4gICAgICAgICAgICBjb21tYW5kOiBzdHJpbmc7XG4gICAgICAgICAgICBleGl0Q29kZTogbnVtYmVyIHwgbnVsbDtcbiAgICAgICAgICAgIHN0ZG91dDogc3RyaW5nO1xuICAgICAgICAgICAgc3RkZXJyOiBzdHJpbmc7XG4gICAgICAgICAgICBkdXJhdGlvbk1zOiBudW1iZXI7XG4gICAgICAgIH07XG4gICAgfT4ge1xuICAgICAgICBjb25zdCBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgICBsZXQgZXhpdENvZGU6IG51bWJlciB8IG51bGwgPSBudWxsO1xuICAgICAgICBsZXQgc3Rkb3V0ID0gXCJcIjtcbiAgICAgICAgbGV0IHN0ZGVyciA9IFwiXCI7XG5cbiAgICAgICAgVUkuaW5mbyhgICBSdW5uaW5nICR7Z2F0ZU5hbWV9OiAke2NvbW1hbmR9YCk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFJ1biB0aGUgY29tbWFuZFxuICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGV4ZWNTeW5jKGNvbW1hbmQsIHtcbiAgICAgICAgICAgICAgICBlbmNvZGluZzogXCJ1dGYtOFwiLFxuICAgICAgICAgICAgICAgIGN3ZDogdGhpcy5mbGFncy53b3JraW5nRGlyID8/IHByb2Nlc3MuY3dkKCksXG4gICAgICAgICAgICAgICAgdGltZW91dDogMTIwMDAwLCAvLyAyIG1pbnV0ZSB0aW1lb3V0IGZvciBnYXRlc1xuICAgICAgICAgICAgICAgIG1heEJ1ZmZlcjogMTAgKiAxMDI0ICogMTAyNCwgLy8gMTBNQiBidWZmZXJcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc3Rkb3V0ID0gcmVzdWx0O1xuICAgICAgICAgICAgZXhpdENvZGUgPSAwO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IgJiYgXCJzdGF0dXNcIiBpbiBlcnJvcikge1xuICAgICAgICAgICAgICAgIGV4aXRDb2RlID0gKGVycm9yIGFzIHsgc3RhdHVzOiBudW1iZXIgfSkuc3RhdHVzID8/IDE7XG4gICAgICAgICAgICAgICAgc3RkZXJyID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICAgICAgICAgIC8vIENhcHR1cmUgc3Rkb3V0IGZyb20gZmFpbGVkIGNvbW1hbmQgaWYgYXZhaWxhYmxlXG4gICAgICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICAgICAgICAgICAgICBpZiAoXCJzdGRvdXRcIiBpbiBlcnJvciAmJiBlcnJvci5zdGRvdXQpIHtcbiAgICAgICAgICAgICAgICAgICAgc3Rkb3V0ID0gU3RyaW5nKGVycm9yLnN0ZG91dCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgICAgICAgICAgICAgaWYgKFwic3RkZXJyXCIgaW4gZXJyb3IgJiYgZXJyb3Iuc3RkZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0ZGVyciA9IFN0cmluZyhlcnJvci5zdGRlcnIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc3RkZXJyID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZHVyYXRpb25NcyA9IERhdGUubm93KCkgLSBzdGFydFRpbWU7XG5cbiAgICAgICAgY29uc3QgcGFzc2VkID0gZXhpdENvZGUgPT09IDA7XG5cbiAgICAgICAgbG9nLmRlYnVnKFwiR2F0ZSBjb21tYW5kIHJlc3VsdFwiLCB7XG4gICAgICAgICAgICBnYXRlOiBnYXRlTmFtZSxcbiAgICAgICAgICAgIGNvbW1hbmQsXG4gICAgICAgICAgICBleGl0Q29kZSxcbiAgICAgICAgICAgIGR1cmF0aW9uTXMsXG4gICAgICAgICAgICBzdGRvdXRMZW5ndGg6IHN0ZG91dC5sZW5ndGgsXG4gICAgICAgICAgICBzdGRlcnJMZW5ndGg6IHN0ZGVyci5sZW5ndGgsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBwYXNzZWQsXG4gICAgICAgICAgICBkZXRhaWxzOiB7XG4gICAgICAgICAgICAgICAgY29tbWFuZCxcbiAgICAgICAgICAgICAgICBleGl0Q29kZSxcbiAgICAgICAgICAgICAgICBzdGRvdXQ6IHRydW5jYXRlT3V0cHV0KHN0ZG91dCwgMjAwMCksXG4gICAgICAgICAgICAgICAgc3RkZXJyOiB0cnVuY2F0ZU91dHB1dChzdGRlcnIsIDEwMDApLFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uTXMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qKiBDaGVjayBhY2NlcHRhbmNlIGNyaXRlcmlhICovXG4gICAgcHJpdmF0ZSBhc3luYyBjaGVja0FjY2VwdGFuY2UoY3ljbGU6IEN5Y2xlU3RhdGUpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgbG9nLmRlYnVnKFwiQ2hlY2tpbmcgYWNjZXB0YW5jZSBjcml0ZXJpYVwiLCB7XG4gICAgICAgICAgICBjeWNsZU51bWJlcjogY3ljbGUuY3ljbGVOdW1iZXIsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEdldCB0aGUgd29yayBwaGFzZSBvdXRwdXRcbiAgICAgICAgY29uc3Qgd29ya1BoYXNlID0gY3ljbGUucGhhc2VzW1BoYXNlLldPUktdO1xuICAgICAgICBpZiAoIXdvcmtQaGFzZSkge1xuICAgICAgICAgICAgbG9nLndhcm4oXCJObyB3b3JrIHBoYXNlIGZvdW5kIGluIGN5Y2xlXCIpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgd29ya1Jlc3BvbnNlID0gd29ya1BoYXNlLnJlc3BvbnNlLnRyaW0oKTtcblxuICAgICAgICAvLyBSdWxlIDE6IHdvcmsucmVzcG9uc2UgbXVzdCBiZSBub24tZW1wdHlcbiAgICAgICAgaWYgKCF3b3JrUmVzcG9uc2UpIHtcbiAgICAgICAgICAgIGxvZy5kZWJ1ZyhcIkFjY2VwdGFuY2UgZmFpbGVkOiBlbXB0eSB3b3JrIHJlc3BvbnNlXCIpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUnVsZSAyOiBDaGVjayBmb3IgcHJvZ3Jlc3Mgc2lnbmFsXG4gICAgICAgIC8vIFByb2dyZXNzIHNpZ25hbCA9IChOTyBDSEFOR0VTIG1hcmtlciB3aXRoIHJlYXNvbikgT1IgKGF0IGxlYXN0IG9uZSB0b29sIGludm9rZWQgaW4gYW55IHBoYXNlKVxuICAgICAgICBjb25zdCBoYXNOb0NoYW5nZXNNYXJrZXIgPSAvTk9cXHMqQ0hBTkdFUz9bOlxcc10vaS50ZXN0KHdvcmtSZXNwb25zZSk7XG4gICAgICAgIGNvbnN0IGhhc1Byb2dyZXNzU2lnbmFsID0gdGhpcy5oYXNQcm9ncmVzc1NpZ25hbChjeWNsZSk7XG5cbiAgICAgICAgaWYgKGhhc05vQ2hhbmdlc01hcmtlcikge1xuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdGhlcmUncyBhIHJlYXNvbiBwcm92aWRlZFxuICAgICAgICAgICAgY29uc3QgaGFzUmVhc29uID0gL05PXFxzKkNIQU5HRVM/WzpcXHNdK1tBLVpdLy50ZXN0KHdvcmtSZXNwb25zZSk7XG4gICAgICAgICAgICBpZiAoaGFzUmVhc29uKSB7XG4gICAgICAgICAgICAgICAgbG9nLmRlYnVnKFwiQWNjZXB0YW5jZSBwYXNzZWQ6IE5PIENIQU5HRVMgd2l0aCByZWFzb25cIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaGFzUHJvZ3Jlc3NTaWduYWwpIHtcbiAgICAgICAgICAgIGxvZy5kZWJ1ZyhcIkFjY2VwdGFuY2UgcGFzc2VkOiBwcm9ncmVzcyBzaWduYWwgZGV0ZWN0ZWRcIik7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENoZWNrIGlmIHJlc3BvbnNlIGlzIGp1c3QgZmx1ZmYgKHRvbyBzaG9ydCwgbm8gYWN0aW9uYWJsZSBjb250ZW50KVxuICAgICAgICBpZiAod29ya1Jlc3BvbnNlLmxlbmd0aCA8IDIwKSB7XG4gICAgICAgICAgICBsb2cuZGVidWcoXCJBY2NlcHRhbmNlIGZhaWxlZDogcmVzcG9uc2UgdG9vIHNob3J0L2ZsdWZmeVwiKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENoZWNrIGZvciBjb21tb24gXCJJIHdpbGxcIiBwYXR0ZXJucyB0aGF0IGluZGljYXRlIG5vIGFjdGlvblxuICAgICAgICBjb25zdCB3aWxsUGF0dGVybiA9XG4gICAgICAgICAgICAvXFxiSSAod2lsbHxuZWVkIHRvfHNob3VsZHxtdXN0fGhhdmUgdG98YW0gZ29pbmcgdG8pXFxiL2k7XG4gICAgICAgIGlmICh3aWxsUGF0dGVybi50ZXN0KHdvcmtSZXNwb25zZSkpIHtcbiAgICAgICAgICAgIGxvZy5kZWJ1ZyhcbiAgICAgICAgICAgICAgICBcIkFjY2VwdGFuY2UgZmFpbGVkOiByZXNwb25zZSBjb250YWlucyAnSSB3aWxsJyBwYXR0ZXJuIChubyBhY3Rpb24gdGFrZW4pXCIsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgd2UgZ290IGhlcmUgYW5kIG5vbmUgb2YgdGhlIGFib3ZlLCBpdCBtaWdodCBzdGlsbCBiZSB2YWxpZCBpZiBpdCBtZW50aW9ucyBjaGFuZ2VzXG4gICAgICAgIGNvbnN0IG1lbnRpb25zQ2hhbmdlcyA9XG4gICAgICAgICAgICAvXFxiKGNoYW5nZXxtb2RpZnl8Y3JlYXRlfHVwZGF0ZXxkZWxldGV8YWRkfGZpeHxpbXBsZW1lbnR8cmVmYWN0b3J8d3JpdGV8cnVufHRlc3QpXFxiL2kudGVzdChcbiAgICAgICAgICAgICAgICB3b3JrUmVzcG9uc2UsXG4gICAgICAgICAgICApO1xuICAgICAgICBpZiAobWVudGlvbnNDaGFuZ2VzKSB7XG4gICAgICAgICAgICBsb2cuZGVidWcoXG4gICAgICAgICAgICAgICAgXCJBY2NlcHRhbmNlIHBhc3NlZDogcmVzcG9uc2UgbWVudGlvbnMgYWN0aW9uYWJsZSBjaGFuZ2VzXCIsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBsb2cuZGVidWcoXCJBY2NlcHRhbmNlIGZhaWxlZDogbm8gdmFsaWQgcHJvZ3Jlc3Mgc2lnbmFsXCIpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqIENoZWNrIGlmIGN5Y2xlIGhhcyBwcm9ncmVzcyBzaWduYWwgKHRvb2xzIG9yIGdhdGUgY29tbWFuZHMgZXhlY3V0ZWQpICovXG4gICAgcHJpdmF0ZSBoYXNQcm9ncmVzc1NpZ25hbChjeWNsZTogQ3ljbGVTdGF0ZSk6IGJvb2xlYW4ge1xuICAgICAgICAvLyBDaGVjayBmb3IgYW55IHRvb2wgaW52b2NhdGlvbnMgaW4gYW55IHBoYXNlXG4gICAgICAgIGNvbnN0IGFsbFRvb2xzID0gdGhpcy5jb2xsZWN0QWxsVG9vbHMoY3ljbGUpO1xuICAgICAgICBpZiAoYWxsVG9vbHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDaGVjayBpZiBnYXRlcyBhY3R1YWxseSByYW4gKG5vbi1lbXB0eSBkZXRhaWxzIGluZGljYXRlIGV4ZWN1dGlvbilcbiAgICAgICAgZm9yIChjb25zdCBnYXRlUmVzdWx0IG9mIGN5Y2xlLmdhdGVSZXN1bHRzKSB7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgZ2F0ZVJlc3VsdC5kZXRhaWxzICYmXG4gICAgICAgICAgICAgICAgXCJjb21tYW5kXCIgaW4gZ2F0ZVJlc3VsdC5kZXRhaWxzICYmXG4gICAgICAgICAgICAgICAgZ2F0ZVJlc3VsdC5kZXRhaWxzLmNvbW1hbmRcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKiBIYW5kbGUgbG9vcCBzdG9wICovXG4gICAgcHJpdmF0ZSBhc3luYyBoYW5kbGVTdG9wKFxuICAgICAgICByZWFzb246IFN0b3BSZWFzb24sXG4gICAgICAgIHN1bW1hcnk6IHN0cmluZyxcbiAgICApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgY29uc3Qgc3RhdGUgPSB0aGlzLmZsb3dTdG9yZS5sb2FkKCk7XG4gICAgICAgIGlmIChzdGF0ZSkge1xuICAgICAgICAgICAgbGV0IHJ1blN0YXR1czogUnVuU3RhdHVzO1xuICAgICAgICAgICAgc3dpdGNoIChyZWFzb24pIHtcbiAgICAgICAgICAgICAgICBjYXNlIFN0b3BSZWFzb24uQ09NUExFVElPTl9QUk9NSVNFOlxuICAgICAgICAgICAgICAgICAgICBydW5TdGF0dXMgPSBSdW5TdGF0dXMuQ09NUExFVEVEO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFN0b3BSZWFzb24uU1RVQ0s6XG4gICAgICAgICAgICAgICAgICAgIHJ1blN0YXR1cyA9IFJ1blN0YXR1cy5TVFVDSztcbiAgICAgICAgICAgICAgICAgICAgLy8gTm90aWZ5IERpc2NvcmQ6IHN0dWNrXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGlzY29yZFdlYmhvb2s/Lm5vdGlmeVN0dWNrT3JBYm9ydGVkKFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUuY3VycmVudEN5Y2xlLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJTVFVDS1wiLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFN0b3BSZWFzb24uVVNFUl9BQk9SVDpcbiAgICAgICAgICAgICAgICAgICAgcnVuU3RhdHVzID0gUnVuU3RhdHVzLkFCT1JURUQ7XG4gICAgICAgICAgICAgICAgICAgIC8vIE5vdGlmeSBEaXNjb3JkOiBhYm9ydGVkXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGlzY29yZFdlYmhvb2s/Lm5vdGlmeVN0dWNrT3JBYm9ydGVkKFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUuY3VycmVudEN5Y2xlLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJBQk9SVEVEXCIsXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgU3RvcFJlYXNvbi5FUlJPUjpcbiAgICAgICAgICAgICAgICAgICAgcnVuU3RhdHVzID0gUnVuU3RhdHVzLkZBSUxFRDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgcnVuU3RhdHVzID0gUnVuU3RhdHVzLkZBSUxFRDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZmxvd1N0b3JlLnVwZGF0ZVN0YXR1cyhydW5TdGF0dXMsIHJlYXNvbik7XG4gICAgICAgIH1cblxuICAgICAgICBVSS5oZWFkZXIoXCJMb29wIENvbXBsZXRlXCIpO1xuICAgICAgICBVSS5pbmZvKGBTdG9wIHJlYXNvbjogJHtyZWFzb259YCk7XG4gICAgICAgIFVJLmluZm8oYFN1bW1hcnk6ICR7c3VtbWFyeX1gKTtcblxuICAgICAgICBsb2cuaW5mbyhcIlJhbHBoIGxvb3Agc3RvcHBlZFwiLCB7IHJlYXNvbiwgc3VtbWFyeSB9KTtcbiAgICB9XG59XG5cbi8qKiBDcmVhdGUgUmFscGggTG9vcCBSdW5uZXIgZnJvbSBmbGFncyAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZVJhbHBoTG9vcFJ1bm5lcihcbiAgICBmbGFnczogUmFscGhGbGFncyxcbiAgICBiYXNlQ29uZmlnOiBBaUVuZ0NvbmZpZyxcbik6IFByb21pc2U8UmFscGhMb29wUnVubmVyPiB7XG4gICAgLy8gQ3JlYXRlIG9wdGltaXplciBmb3IgaW5pdGlhbCBwcm9tcHQgcHJvY2Vzc2luZ1xuICAgIGNvbnN0IG9wdGltaXplciA9IG5ldyBQcm9tcHRPcHRpbWl6ZXIoe1xuICAgICAgICBhdXRvQXBwcm92ZTogZmxhZ3MuY2kgPz8gZmFsc2UsXG4gICAgICAgIHZlcmJvc2l0eTogZmxhZ3MudmVyYm9zZSA/IFwidmVyYm9zZVwiIDogXCJub3JtYWxcIixcbiAgICB9KTtcblxuICAgIHJldHVybiBuZXcgUmFscGhMb29wUnVubmVyKGZsYWdzLCBiYXNlQ29uZmlnLCBvcHRpbWl6ZXIpO1xufVxuIiwKICAgICIvKipcbiAqIENMSSBVSSB1dGlsaXRpZXMgZm9yIGFpLWVuZyByYWxwaFxuICpcbiAqIENvbnNvbGUgc3R5bGluZyBhbmQgb3V0cHV0IGhlbHBlcnNcbiAqL1xuaW1wb3J0IHsgRU9MIH0gZnJvbSBcIm5vZGU6b3NcIjtcblxuZXhwb3J0IG5hbWVzcGFjZSBVSSB7XG4gICAgZXhwb3J0IGNvbnN0IFN0eWxlID0ge1xuICAgICAgICAvLyBDb2xvcnNcbiAgICAgICAgVEVYVF9ISUdITElHSFQ6IFwiXFx4MWJbOTZtXCIsXG4gICAgICAgIFRFWFRfSElHSExJR0hUX0JPTEQ6IFwiXFx4MWJbOTZtXFx4MWJbMW1cIixcbiAgICAgICAgVEVYVF9ESU06IFwiXFx4MWJbOTBtXCIsXG4gICAgICAgIFRFWFRfRElNX0JPTEQ6IFwiXFx4MWJbOTBtXFx4MWJbMW1cIixcbiAgICAgICAgVEVYVF9OT1JNQUw6IFwiXFx4MWJbMG1cIixcbiAgICAgICAgVEVYVF9OT1JNQUxfQk9MRDogXCJcXHgxYlsxbVwiLFxuICAgICAgICBURVhUX1dBUk5JTkc6IFwiXFx4MWJbOTNtXCIsXG4gICAgICAgIFRFWFRfV0FSTklOR19CT0xEOiBcIlxceDFiWzkzbVxceDFiWzFtXCIsXG4gICAgICAgIFRFWFRfREFOR0VSOiBcIlxceDFiWzkxbVwiLFxuICAgICAgICBURVhUX0RBTkdFUl9CT0xEOiBcIlxceDFiWzkxbVxceDFiWzFtXCIsXG4gICAgICAgIFRFWFRfU1VDQ0VTUzogXCJcXHgxYls5Mm1cIixcbiAgICAgICAgVEVYVF9TVUNDRVNTX0JPTEQ6IFwiXFx4MWJbOTJtXFx4MWJbMW1cIixcbiAgICAgICAgVEVYVF9JTkZPOiBcIlxceDFiWzk0bVwiLFxuICAgICAgICBURVhUX0lORk9fQk9MRDogXCJcXHgxYls5NG1cXHgxYlsxbVwiLFxuICAgIH07XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gcHJpbnRsbiguLi5tZXNzYWdlOiBzdHJpbmdbXSk6IHZvaWQge1xuICAgICAgICBwcm9jZXNzLnN0ZGVyci53cml0ZShtZXNzYWdlLmpvaW4oXCIgXCIpICsgRU9MKTtcbiAgICB9XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gcHJpbnQoLi4ubWVzc2FnZTogc3RyaW5nW10pOiB2b2lkIHtcbiAgICAgICAgcHJvY2Vzcy5zdGRlcnIud3JpdGUobWVzc2FnZS5qb2luKFwiIFwiKSk7XG4gICAgfVxuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGVycm9yKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBwcmludGxuKFxuICAgICAgICAgICAgYCR7U3R5bGUuVEVYVF9EQU5HRVJfQk9MRH1FcnJvcjogJHtTdHlsZS5URVhUX05PUk1BTH0ke21lc3NhZ2V9YCxcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gc3VjY2VzcyhtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgcHJpbnRsbihgJHtTdHlsZS5URVhUX1NVQ0NFU1NfQk9MRH3inJMgJHtTdHlsZS5URVhUX05PUk1BTH0ke21lc3NhZ2V9YCk7XG4gICAgfVxuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGluZm8obWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIHByaW50bG4oYCR7U3R5bGUuVEVYVF9JTkZPX0JPTER94oS5ICR7U3R5bGUuVEVYVF9OT1JNQUx9JHttZXNzYWdlfWApO1xuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiB3YXJuKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBwcmludGxuKGAke1N0eWxlLlRFWFRfV0FSTklOR19CT0xEfSEgJHtTdHlsZS5URVhUX05PUk1BTH0ke21lc3NhZ2V9YCk7XG4gICAgfVxuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGhlYWRlcih0aXRsZTogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIHByaW50bG4oKTtcbiAgICAgICAgcHJpbnRsbihTdHlsZS5URVhUX0hJR0hMSUdIVF9CT0xEICsgdGl0bGUgKyBTdHlsZS5URVhUX05PUk1BTCk7XG4gICAgICAgIHByaW50bG4oU3R5bGUuVEVYVF9ESU0gKyBcIuKUgFwiLnJlcGVhdCg1MCkgKyBTdHlsZS5URVhUX05PUk1BTCk7XG4gICAgfVxufVxuIiwKICAgICIvKipcbiAqIFByb21wdCBBbmFseXplclxuICpcbiAqIEFuYWx5emVzIHVzZXIgcHJvbXB0cyB0byBkZXRlcm1pbmUgY29tcGxleGl0eSwgZG9tYWluLFxuICogYW5kIG1pc3NpbmcgY29udGV4dC4gVXNlcyBhIGNvbWJpbmF0aW9uIG9mIHdvcmQgY291bnQsXG4gKiBrZXl3b3JkIGRldGVjdGlvbiwgYW5kIHBhdHRlcm4gbWF0Y2hpbmcuXG4gKi9cblxuaW1wb3J0IHR5cGUgeyBBbmFseXNpc1Jlc3VsdCwgQ29tcGxleGl0eSwgRG9tYWluLCBUZWNobmlxdWVJZCB9IGZyb20gXCIuL3R5cGVzXCI7XG5cbi8qKlxuICogS2V5d29yZHMgZm9yIGNvbXBsZXhpdHkgZGV0ZWN0aW9uXG4gKi9cbmNvbnN0IENPTVBMRVhJVFlfS0VZV09SRFMgPSB7XG4gICAgZGVidWc6IFtcImRlYnVnXCIsIFwiZml4XCIsIFwiZXJyb3JcIiwgXCJidWdcIiwgXCJpc3N1ZVwiLCBcInByb2JsZW1cIiwgXCJ0cm91Ymxlc2hvb3RcIl0sXG4gICAgZGVzaWduOiBbXG4gICAgICAgIFwiZGVzaWduXCIsXG4gICAgICAgIFwiYXJjaGl0ZWN0dXJlXCIsXG4gICAgICAgIFwiYXJjaGl0ZWN0XCIsXG4gICAgICAgIFwic3RydWN0dXJlXCIsXG4gICAgICAgIFwicGF0dGVyblwiLFxuICAgICAgICBcImFwcHJvYWNoXCIsXG4gICAgXSxcbiAgICBvcHRpbWl6ZTogW1xuICAgICAgICBcIm9wdGltaXplXCIsXG4gICAgICAgIFwiaW1wcm92ZVwiLFxuICAgICAgICBcInBlcmZvcm1hbmNlXCIsXG4gICAgICAgIFwiZWZmaWNpZW50XCIsXG4gICAgICAgIFwiZmFzdFwiLFxuICAgICAgICBcInNjYWxlXCIsXG4gICAgXSxcbiAgICBpbXBsZW1lbnQ6IFtcImltcGxlbWVudFwiLCBcImJ1aWxkXCIsIFwiY3JlYXRlXCIsIFwiZGV2ZWxvcFwiLCBcIndyaXRlXCIsIFwiY29kZVwiXSxcbiAgICBjb21wbGV4OiBbXCJjb21wbGV4XCIsIFwiY2hhbGxlbmdlXCIsIFwiZGlmZmljdWx0XCIsIFwiYWR2YW5jZWRcIiwgXCJzb3BoaXN0aWNhdGVkXCJdLFxufTtcblxuLyoqXG4gKiBEb21haW4tc3BlY2lmaWMga2V5d29yZHNcbiAqL1xuY29uc3QgRE9NQUlOX0tFWVdPUkRTOiBSZWNvcmQ8RG9tYWluLCBzdHJpbmdbXT4gPSB7XG4gICAgc2VjdXJpdHk6IFtcbiAgICAgICAgXCJhdXRoXCIsXG4gICAgICAgIFwiYXV0aGVudGljYXRpb25cIixcbiAgICAgICAgXCJqd3RcIixcbiAgICAgICAgXCJvYXV0aFwiLFxuICAgICAgICBcInBhc3N3b3JkXCIsXG4gICAgICAgIFwiZW5jcnlwdFwiLFxuICAgICAgICBcImRlY3J5cHRcIixcbiAgICAgICAgXCJzZWN1cml0eVwiLFxuICAgICAgICBcInRva2VuXCIsXG4gICAgICAgIFwic2Vzc2lvblwiLFxuICAgICAgICBcImNzcmZcIixcbiAgICAgICAgXCJ4c3NcIixcbiAgICAgICAgXCJpbmplY3Rpb25cIixcbiAgICAgICAgXCJ2dWxuZXJhYmlsaXR5XCIsXG4gICAgICAgIFwiaGFja1wiLFxuICAgICAgICBcImF0dGFja1wiLFxuICAgIF0sXG4gICAgZnJvbnRlbmQ6IFtcbiAgICAgICAgXCJyZWFjdFwiLFxuICAgICAgICBcInZ1ZVwiLFxuICAgICAgICBcImFuZ3VsYXJcIixcbiAgICAgICAgXCJjb21wb25lbnRcIixcbiAgICAgICAgXCJjc3NcIixcbiAgICAgICAgXCJodG1sXCIsXG4gICAgICAgIFwidWlcIixcbiAgICAgICAgXCJ1eFwiLFxuICAgICAgICBcInJlbmRlclwiLFxuICAgICAgICBcInN0YXRlXCIsXG4gICAgICAgIFwiaG9va1wiLFxuICAgICAgICBcInByb3BzXCIsXG4gICAgICAgIFwiZG9tXCIsXG4gICAgICAgIFwiZnJvbnRlbmRcIixcbiAgICAgICAgXCJjbGllbnRcIixcbiAgICBdLFxuICAgIGJhY2tlbmQ6IFtcbiAgICAgICAgXCJhcGlcIixcbiAgICAgICAgXCJzZXJ2ZXJcIixcbiAgICAgICAgXCJlbmRwb2ludFwiLFxuICAgICAgICBcImRhdGFiYXNlXCIsXG4gICAgICAgIFwicXVlcnlcIixcbiAgICAgICAgXCJiYWNrZW5kXCIsXG4gICAgICAgIFwic2VydmljZVwiLFxuICAgICAgICBcIm1pY3Jvc2VydmljZVwiLFxuICAgICAgICBcInJlc3RcIixcbiAgICAgICAgXCJncmFwaHFsXCIsXG4gICAgICAgIFwiaHR0cFwiLFxuICAgICAgICBcInJlcXVlc3RcIixcbiAgICAgICAgXCJyZXNwb25zZVwiLFxuICAgIF0sXG4gICAgZGF0YWJhc2U6IFtcbiAgICAgICAgXCJzcWxcIixcbiAgICAgICAgXCJwb3N0Z3Jlc3FsXCIsXG4gICAgICAgIFwibXlzcWxcIixcbiAgICAgICAgXCJtb25nb2RiXCIsXG4gICAgICAgIFwicmVkaXNcIixcbiAgICAgICAgXCJxdWVyeVwiLFxuICAgICAgICBcImluZGV4XCIsXG4gICAgICAgIFwic2NoZW1hXCIsXG4gICAgICAgIFwibWlncmF0aW9uXCIsXG4gICAgICAgIFwiZGF0YWJhc2VcIixcbiAgICAgICAgXCJkYlwiLFxuICAgICAgICBcImpvaW5cIixcbiAgICAgICAgXCJ0cmFuc2FjdGlvblwiLFxuICAgICAgICBcIm9ybVwiLFxuICAgIF0sXG4gICAgZGV2b3BzOiBbXG4gICAgICAgIFwiZGVwbG95XCIsXG4gICAgICAgIFwiY2kvY2RcIixcbiAgICAgICAgXCJkb2NrZXJcIixcbiAgICAgICAgXCJrdWJlcm5ldGVzXCIsXG4gICAgICAgIFwiazhzXCIsXG4gICAgICAgIFwicGlwZWxpbmVcIixcbiAgICAgICAgXCJpbmZyYXN0cnVjdHVyZVwiLFxuICAgICAgICBcImF3c1wiLFxuICAgICAgICBcImdjcFwiLFxuICAgICAgICBcImF6dXJlXCIsXG4gICAgICAgIFwidGVycmFmb3JtXCIsXG4gICAgICAgIFwiYW5zaWJsZVwiLFxuICAgICAgICBcImplbmtpbnNcIixcbiAgICAgICAgXCJkZXZvcHNcIixcbiAgICAgICAgXCJvcHNcIixcbiAgICBdLFxuICAgIGFyY2hpdGVjdHVyZTogW1xuICAgICAgICBcImFyY2hpdGVjdHVyZVwiLFxuICAgICAgICBcImRlc2lnblwiLFxuICAgICAgICBcInBhdHRlcm5cIixcbiAgICAgICAgXCJtaWNyb3NlcnZpY2VzXCIsXG4gICAgICAgIFwibW9ub2xpdGhcIixcbiAgICAgICAgXCJzY2FsYWJpbGl0eVwiLFxuICAgICAgICBcInN5c3RlbVwiLFxuICAgICAgICBcImRpc3RyaWJ1dGVkXCIsXG4gICAgICAgIFwiYXJjaGl0ZWN0XCIsXG4gICAgICAgIFwiaGlnaC1sZXZlbFwiLFxuICAgIF0sXG4gICAgdGVzdGluZzogW1xuICAgICAgICBcInRlc3RcIixcbiAgICAgICAgXCJzcGVjXCIsXG4gICAgICAgIFwidW5pdCB0ZXN0XCIsXG4gICAgICAgIFwiaW50ZWdyYXRpb24gdGVzdFwiLFxuICAgICAgICBcImUyZVwiLFxuICAgICAgICBcImplc3RcIixcbiAgICAgICAgXCJjeXByZXNzXCIsXG4gICAgICAgIFwicGxheXdyaWdodFwiLFxuICAgICAgICBcInRlc3RpbmdcIixcbiAgICAgICAgXCJ0ZGRcIixcbiAgICAgICAgXCJjb3ZlcmFnZVwiLFxuICAgICAgICBcIm1vY2tcIixcbiAgICAgICAgXCJzdHViXCIsXG4gICAgXSxcbiAgICBnZW5lcmFsOiBbXSwgLy8gRmFsbGJhY2sgZG9tYWluXG59O1xuXG4vKipcbiAqIFNpbXBsZSBwcm9tcHQgcGF0dGVybnMgKGdyZWV0aW5ncywgc2ltcGxlIHF1ZXN0aW9ucylcbiAqL1xuY29uc3QgU0lNUExFX1BBVFRFUk5TID0gW1xuICAgIC9eKGhlbGxvfGhpfGhleXxncmVldGluZ3N8Z29vZCBtb3JuaW5nfGdvb2QgZXZlbmluZykvaSxcbiAgICAvXih0aGFua3N8dGhhbmsgeW91fHRoeCkvaSxcbiAgICAvXih5ZXN8bm98b2t8c3VyZXxhbHJpZ2h0KS9pLFxuICAgIC9eKHdoYXR8aG93fHdoeXx3aGVufHdoZXJlfHdob3x3aGljaClcXHMrXFx3K1xcPz8kL2ksIC8vIFNpbXBsZSBzaW5nbGUgcXVlc3Rpb25zXG4gICAgL14oaGVscHxhc3Npc3QpXFxzKiQvaSxcbl07XG5cbi8qKlxuICogQ2FsY3VsYXRlIGNvbXBsZXhpdHkgc2NvcmUgZm9yIGEgcHJvbXB0XG4gKi9cbmZ1bmN0aW9uIGNhbGN1bGF0ZUNvbXBsZXhpdHlTY29yZShwcm9tcHQ6IHN0cmluZyk6IG51bWJlciB7XG4gICAgY29uc3Qgd29yZHMgPSBwcm9tcHQuc3BsaXQoL1xccysvKTtcbiAgICBjb25zdCB3b3JkQ291bnQgPSB3b3Jkcy5sZW5ndGg7XG5cbiAgICBsZXQgc2NvcmUgPSAwO1xuXG4gICAgLy8gV29yZCBjb3VudCBjb250cmlidXRpb24gKDAtMTAgcG9pbnRzKVxuICAgIGlmICh3b3JkQ291bnQgPCA1KSBzY29yZSArPSAwO1xuICAgIGVsc2UgaWYgKHdvcmRDb3VudCA8IDEwKSBzY29yZSArPSAzO1xuICAgIGVsc2UgaWYgKHdvcmRDb3VudCA8IDIwKSBzY29yZSArPSA2O1xuICAgIGVsc2Ugc2NvcmUgKz0gMTA7XG5cbiAgICAvLyBLZXl3b3JkIGNvbnRyaWJ1dGlvbiAoMC0xMCBwb2ludHMpXG4gICAgY29uc3QgbG93ZXJQcm9tcHQgPSBwcm9tcHQudG9Mb3dlckNhc2UoKTtcbiAgICBmb3IgKGNvbnN0IGNhdGVnb3J5IG9mIE9iamVjdC52YWx1ZXMoQ09NUExFWElUWV9LRVlXT1JEUykpIHtcbiAgICAgICAgZm9yIChjb25zdCBrZXl3b3JkIG9mIGNhdGVnb3J5KSB7XG4gICAgICAgICAgICBpZiAobG93ZXJQcm9tcHQuaW5jbHVkZXMoa2V5d29yZCkpIHtcbiAgICAgICAgICAgICAgICBzY29yZSArPSAyO1xuICAgICAgICAgICAgICAgIGJyZWFrOyAvLyBPbmUga2V5d29yZCBwZXIgY2F0ZWdvcnlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFF1ZXN0aW9uIG1hcmtzIHJlZHVjZSBjb21wbGV4aXR5IChhc2tpbmcgZm9yIGluZm8gaXMgc2ltcGxlcilcbiAgICBjb25zdCBxdWVzdGlvbk1hcmtzID0gKHByb21wdC5tYXRjaCgvXFw/L2cpIHx8IFtdKS5sZW5ndGg7XG4gICAgc2NvcmUgLT0gTWF0aC5taW4ocXVlc3Rpb25NYXJrcyAqIDIsIDUpO1xuXG4gICAgLy8gVGVjaG5pY2FsIHRlcm1zIGluY3JlYXNlIGNvbXBsZXhpdHlcbiAgICBjb25zdCB0ZWNoVGVybXMgPSB3b3Jkcy5maWx0ZXIoKHdvcmQpID0+IHtcbiAgICAgICAgY29uc3QgbG93ZXIgPSB3b3JkLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAvXFx3ezQsfS8udGVzdCh3b3JkKSAmJlxuICAgICAgICAgICAgIVtcInRoaXNcIiwgXCJ0aGF0XCIsIFwid2l0aFwiLCBcImZyb21cIiwgXCJpbnRvXCJdLmluY2x1ZGVzKGxvd2VyKVxuICAgICAgICApO1xuICAgIH0pO1xuICAgIHNjb3JlICs9IE1hdGgubWluKHRlY2hUZXJtcy5sZW5ndGggKiAwLjUsIDUpO1xuXG4gICAgcmV0dXJuIE1hdGgubWF4KDAsIE1hdGgubWluKDIwLCBzY29yZSkpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBjb21wbGV4aXR5IGZyb20gc2NvcmVcbiAqL1xuZnVuY3Rpb24gc2NvcmVUb0NvbXBsZXhpdHkoc2NvcmU6IG51bWJlcik6IENvbXBsZXhpdHkge1xuICAgIGlmIChzY29yZSA8IDUpIHJldHVybiBcInNpbXBsZVwiO1xuICAgIGlmIChzY29yZSA8IDEyKSByZXR1cm4gXCJtZWRpdW1cIjtcbiAgICByZXR1cm4gXCJjb21wbGV4XCI7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgcHJvbXB0IG1hdGNoZXMgc2ltcGxlIHBhdHRlcm5zXG4gKi9cbmZ1bmN0aW9uIGlzU2ltcGxlUHJvbXB0KHByb21wdDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgZm9yIChjb25zdCBwYXR0ZXJuIG9mIFNJTVBMRV9QQVRURVJOUykge1xuICAgICAgICBpZiAocGF0dGVybi50ZXN0KHByb21wdC50cmltKCkpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogRGV0ZWN0IGRvbWFpbiBmcm9tIHByb21wdCBrZXl3b3Jkc1xuICovXG5mdW5jdGlvbiBkZXRlY3REb21haW4ocHJvbXB0OiBzdHJpbmcpOiBEb21haW4ge1xuICAgIGNvbnN0IGxvd2VyUHJvbXB0ID0gcHJvbXB0LnRvTG93ZXJDYXNlKCk7XG5cbiAgICAvLyBDb3VudCBrZXl3b3JkIG1hdGNoZXMgcGVyIGRvbWFpblxuICAgIGNvbnN0IHNjb3JlczogUmVjb3JkPERvbWFpbiwgbnVtYmVyPiA9IHtcbiAgICAgICAgc2VjdXJpdHk6IDAsXG4gICAgICAgIGZyb250ZW5kOiAwLFxuICAgICAgICBiYWNrZW5kOiAwLFxuICAgICAgICBkYXRhYmFzZTogMCxcbiAgICAgICAgZGV2b3BzOiAwLFxuICAgICAgICBhcmNoaXRlY3R1cmU6IDAsXG4gICAgICAgIHRlc3Rpbmc6IDAsXG4gICAgICAgIGdlbmVyYWw6IDAsXG4gICAgfTtcblxuICAgIGZvciAoY29uc3QgW2RvbWFpbiwga2V5d29yZHNdIG9mIE9iamVjdC5lbnRyaWVzKERPTUFJTl9LRVlXT1JEUykpIHtcbiAgICAgICAgZm9yIChjb25zdCBrZXl3b3JkIG9mIGtleXdvcmRzKSB7XG4gICAgICAgICAgICBpZiAobG93ZXJQcm9tcHQuaW5jbHVkZXMoa2V5d29yZCkpIHtcbiAgICAgICAgICAgICAgICBzY29yZXNbZG9tYWluIGFzIERvbWFpbl0rKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEZpbmQgZG9tYWluIHdpdGggaGlnaGVzdCBzY29yZVxuICAgIGxldCBiZXN0RG9tYWluOiBEb21haW4gPSBcImdlbmVyYWxcIjtcbiAgICBsZXQgYmVzdFNjb3JlID0gMDtcblxuICAgIGZvciAoY29uc3QgW2RvbWFpbiwgc2NvcmVdIG9mIE9iamVjdC5lbnRyaWVzKHNjb3JlcykpIHtcbiAgICAgICAgaWYgKHNjb3JlID4gYmVzdFNjb3JlKSB7XG4gICAgICAgICAgICBiZXN0U2NvcmUgPSBzY29yZTtcbiAgICAgICAgICAgIGJlc3REb21haW4gPSBkb21haW4gYXMgRG9tYWluO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGJlc3REb21haW47XG59XG5cbi8qKlxuICogRXh0cmFjdCBrZXl3b3JkcyBmcm9tIHByb21wdFxuICovXG5mdW5jdGlvbiBleHRyYWN0S2V5d29yZHMocHJvbXB0OiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gICAgY29uc3Qga2V5d29yZHM6IHN0cmluZ1tdID0gW107XG4gICAgY29uc3QgbG93ZXJQcm9tcHQgPSBwcm9tcHQudG9Mb3dlckNhc2UoKTtcblxuICAgIC8vIEV4dHJhY3QgZnJvbSBjb21wbGV4aXR5IGtleXdvcmRzXG4gICAgZm9yIChjb25zdCBbY2F0ZWdvcnksIHRlcm1zXSBvZiBPYmplY3QuZW50cmllcyhDT01QTEVYSVRZX0tFWVdPUkRTKSkge1xuICAgICAgICBmb3IgKGNvbnN0IHRlcm0gb2YgdGVybXMpIHtcbiAgICAgICAgICAgIGlmIChsb3dlclByb21wdC5pbmNsdWRlcyh0ZXJtKSAmJiAha2V5d29yZHMuaW5jbHVkZXModGVybSkpIHtcbiAgICAgICAgICAgICAgICBrZXl3b3Jkcy5wdXNoKHRlcm0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gRXh0cmFjdCBmcm9tIGRvbWFpbiBrZXl3b3Jkc1xuICAgIGZvciAoY29uc3QgW2RvbWFpbiwgdGVybXNdIG9mIE9iamVjdC5lbnRyaWVzKERPTUFJTl9LRVlXT1JEUykpIHtcbiAgICAgICAgZm9yIChjb25zdCB0ZXJtIG9mIHRlcm1zKSB7XG4gICAgICAgICAgICBpZiAobG93ZXJQcm9tcHQuaW5jbHVkZXModGVybSkgJiYgIWtleXdvcmRzLmluY2x1ZGVzKHRlcm0pKSB7XG4gICAgICAgICAgICAgICAga2V5d29yZHMucHVzaCh0ZXJtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBrZXl3b3Jkcztcbn1cblxuLyoqXG4gKiBJZGVudGlmeSBtaXNzaW5nIGNvbnRleHQgYmFzZWQgb24gcHJvbXB0IGNvbnRlbnRcbiAqL1xuZnVuY3Rpb24gaWRlbnRpZnlNaXNzaW5nQ29udGV4dChwcm9tcHQ6IHN0cmluZywgZG9tYWluOiBEb21haW4pOiBzdHJpbmdbXSB7XG4gICAgY29uc3QgbWlzc2luZzogc3RyaW5nW10gPSBbXTtcbiAgICBjb25zdCBsb3dlclByb21wdCA9IHByb21wdC50b0xvd2VyQ2FzZSgpO1xuXG4gICAgLy8gQ2hlY2sgZm9yIGRlYnVnL2ZpeCByZXF1ZXN0c1xuICAgIGlmIChcbiAgICAgICAgbG93ZXJQcm9tcHQuaW5jbHVkZXMoXCJmaXhcIikgfHxcbiAgICAgICAgbG93ZXJQcm9tcHQuaW5jbHVkZXMoXCJkZWJ1Z1wiKSB8fFxuICAgICAgICBsb3dlclByb21wdC5pbmNsdWRlcyhcImVycm9yXCIpXG4gICAgKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgICFsb3dlclByb21wdC5pbmNsdWRlcyhcImVycm9yXCIpICYmXG4gICAgICAgICAgICAhbG93ZXJQcm9tcHQuaW5jbHVkZXMoXCJleGNlcHRpb25cIilcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBtaXNzaW5nLnB1c2goXCJlcnJvciBtZXNzYWdlIG9yIHN0YWNrIHRyYWNlXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghL1xcLihqc3x0c3xweXxnb3xqYXZhfHJifHBocCkvaS50ZXN0KHByb21wdCkpIHtcbiAgICAgICAgICAgIG1pc3NpbmcucHVzaChcImZpbGUgb3IgY29kZSBsb2NhdGlvblwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIENoZWNrIGZvciB0ZWNoIHN0YWNrXG4gICAgY29uc3QgdGVjaEtleXdvcmRzID0gW1xuICAgICAgICBcImphdmFzY3JpcHRcIixcbiAgICAgICAgXCJ0eXBlc2NyaXB0XCIsXG4gICAgICAgIFwicHl0aG9uXCIsXG4gICAgICAgIFwiZ29cIixcbiAgICAgICAgXCJqYXZhXCIsXG4gICAgICAgIFwicnVzdFwiLFxuICAgICAgICBcInJlYWN0XCIsXG4gICAgICAgIFwidnVlXCIsXG4gICAgICAgIFwiYW5ndWxhclwiLFxuICAgICAgICBcIm5vZGVcIixcbiAgICAgICAgXCJleHByZXNzXCIsXG4gICAgICAgIFwiZGphbmdvXCIsXG4gICAgICAgIFwiZmxhc2tcIixcbiAgICBdO1xuICAgIGNvbnN0IGhhc1RlY2ggPSB0ZWNoS2V5d29yZHMuc29tZSgodGVjaCkgPT4gbG93ZXJQcm9tcHQuaW5jbHVkZXModGVjaCkpO1xuICAgIGlmICghaGFzVGVjaCAmJiAhL1xcLihqc3x0c3xweXxnb3xqYXZhfHJifHBocCkvaS50ZXN0KHByb21wdCkpIHtcbiAgICAgICAgbWlzc2luZy5wdXNoKFwidGVjaG5vbG9neSBzdGFja1wiKTtcbiAgICB9XG5cbiAgICAvLyBEb21haW4tc3BlY2lmaWMgbWlzc2luZyBjb250ZXh0XG4gICAgaWYgKGRvbWFpbiA9PT0gXCJzZWN1cml0eVwiKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgICFsb3dlclByb21wdC5pbmNsdWRlcyhcImp3dFwiKSAmJlxuICAgICAgICAgICAgIWxvd2VyUHJvbXB0LmluY2x1ZGVzKFwib2F1dGhcIikgJiZcbiAgICAgICAgICAgICFsb3dlclByb21wdC5pbmNsdWRlcyhcInNlc3Npb25cIilcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBtaXNzaW5nLnB1c2goXCJhdXRoZW50aWNhdGlvbiBtZXRob2QgKEpXVCwgT0F1dGgsIHNlc3Npb24sIGV0Yy4pXCIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGRvbWFpbiA9PT0gXCJkYXRhYmFzZVwiKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgICFsb3dlclByb21wdC5pbmNsdWRlcyhcInNxbFwiKSAmJlxuICAgICAgICAgICAgIWxvd2VyUHJvbXB0LmluY2x1ZGVzKFwibXlzcWxcIikgJiZcbiAgICAgICAgICAgICFsb3dlclByb21wdC5pbmNsdWRlcyhcInBvc3RncmVzcWxcIikgJiZcbiAgICAgICAgICAgICFsb3dlclByb21wdC5pbmNsdWRlcyhcIm1vbmdvZGJcIilcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBtaXNzaW5nLnB1c2goXCJkYXRhYmFzZSB0eXBlXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghbG93ZXJQcm9tcHQuaW5jbHVkZXMoXCJpbmRleFwiKSkge1xuICAgICAgICAgICAgbWlzc2luZy5wdXNoKFwiaW5kZXggaW5mb3JtYXRpb25cIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbWlzc2luZztcbn1cblxuLyoqXG4gKiBTdWdnZXN0IHRlY2huaXF1ZXMgYmFzZWQgb24gYW5hbHlzaXNcbiAqL1xuZnVuY3Rpb24gc3VnZ2VzdFRlY2huaXF1ZXMoXG4gICAgY29tcGxleGl0eTogQ29tcGxleGl0eSxcbiAgICBkb21haW46IERvbWFpbixcbik6IFRlY2huaXF1ZUlkW10ge1xuICAgIGNvbnN0IHRlY2huaXF1ZXM6IFRlY2huaXF1ZUlkW10gPSBbXTtcblxuICAgIC8vIEFsd2F5cyBzdGFydCB3aXRoIGFuYWx5c2lzXG4gICAgdGVjaG5pcXVlcy5wdXNoKFwiYW5hbHlzaXNcIik7XG5cbiAgICAvLyBFeHBlcnQgcGVyc29uYSBmb3IgbWVkaXVtIGFuZCBjb21wbGV4XG4gICAgaWYgKGNvbXBsZXhpdHkgPT09IFwibWVkaXVtXCIgfHwgY29tcGxleGl0eSA9PT0gXCJjb21wbGV4XCIpIHtcbiAgICAgICAgdGVjaG5pcXVlcy5wdXNoKFwiZXhwZXJ0X3BlcnNvbmFcIik7XG4gICAgfVxuXG4gICAgLy8gUmVhc29uaW5nIGNoYWluIGZvciBtZWRpdW0gYW5kIGNvbXBsZXhcbiAgICBpZiAoY29tcGxleGl0eSA9PT0gXCJtZWRpdW1cIiB8fCBjb21wbGV4aXR5ID09PSBcImNvbXBsZXhcIikge1xuICAgICAgICB0ZWNobmlxdWVzLnB1c2goXCJyZWFzb25pbmdfY2hhaW5cIik7XG4gICAgfVxuXG4gICAgLy8gU3Rha2VzIGxhbmd1YWdlIGZvciBtZWRpdW0gYW5kIGNvbXBsZXhcbiAgICBpZiAoY29tcGxleGl0eSA9PT0gXCJtZWRpdW1cIiB8fCBjb21wbGV4aXR5ID09PSBcImNvbXBsZXhcIikge1xuICAgICAgICB0ZWNobmlxdWVzLnB1c2goXCJzdGFrZXNfbGFuZ3VhZ2VcIik7XG4gICAgfVxuXG4gICAgLy8gQ2hhbGxlbmdlIGZyYW1pbmcgb25seSBmb3IgY29tcGxleFxuICAgIGlmIChjb21wbGV4aXR5ID09PSBcImNvbXBsZXhcIikge1xuICAgICAgICB0ZWNobmlxdWVzLnB1c2goXCJjaGFsbGVuZ2VfZnJhbWluZ1wiKTtcbiAgICB9XG5cbiAgICAvLyBTZWxmLWV2YWx1YXRpb24gZm9yIG1lZGl1bSBhbmQgY29tcGxleFxuICAgIGlmIChjb21wbGV4aXR5ID09PSBcIm1lZGl1bVwiIHx8IGNvbXBsZXhpdHkgPT09IFwiY29tcGxleFwiKSB7XG4gICAgICAgIHRlY2huaXF1ZXMucHVzaChcInNlbGZfZXZhbHVhdGlvblwiKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGVjaG5pcXVlcztcbn1cblxuLyoqXG4gKiBNYWluIGFuYWx5c2lzIGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhbmFseXplUHJvbXB0KHByb21wdDogc3RyaW5nKTogQW5hbHlzaXNSZXN1bHQge1xuICAgIC8vIENoZWNrIGZvciBzaW1wbGUgcGF0dGVybnMgZmlyc3RcbiAgICBpZiAoaXNTaW1wbGVQcm9tcHQocHJvbXB0KSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY29tcGxleGl0eTogXCJzaW1wbGVcIixcbiAgICAgICAgICAgIGRvbWFpbjogXCJnZW5lcmFsXCIsXG4gICAgICAgICAgICBrZXl3b3JkczogW10sXG4gICAgICAgICAgICBtaXNzaW5nQ29udGV4dDogW10sXG4gICAgICAgICAgICBzdWdnZXN0ZWRUZWNobmlxdWVzOiBbXCJhbmFseXNpc1wiXSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBDYWxjdWxhdGUgY29tcGxleGl0eVxuICAgIGNvbnN0IGNvbXBsZXhpdHlTY29yZSA9IGNhbGN1bGF0ZUNvbXBsZXhpdHlTY29yZShwcm9tcHQpO1xuICAgIGNvbnN0IGNvbXBsZXhpdHkgPSBzY29yZVRvQ29tcGxleGl0eShjb21wbGV4aXR5U2NvcmUpO1xuXG4gICAgLy8gRGV0ZWN0IGRvbWFpblxuICAgIGNvbnN0IGRvbWFpbiA9IGRldGVjdERvbWFpbihwcm9tcHQpO1xuXG4gICAgLy8gRXh0cmFjdCBrZXl3b3Jkc1xuICAgIGNvbnN0IGtleXdvcmRzID0gZXh0cmFjdEtleXdvcmRzKHByb21wdCk7XG5cbiAgICAvLyBJZGVudGlmeSBtaXNzaW5nIGNvbnRleHRcbiAgICBjb25zdCBtaXNzaW5nQ29udGV4dCA9IGlkZW50aWZ5TWlzc2luZ0NvbnRleHQocHJvbXB0LCBkb21haW4pO1xuXG4gICAgLy8gU3VnZ2VzdCB0ZWNobmlxdWVzXG4gICAgY29uc3Qgc3VnZ2VzdGVkVGVjaG5pcXVlcyA9IHN1Z2dlc3RUZWNobmlxdWVzKGNvbXBsZXhpdHksIGRvbWFpbik7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBjb21wbGV4aXR5LFxuICAgICAgICBkb21haW4sXG4gICAgICAgIGtleXdvcmRzLFxuICAgICAgICBtaXNzaW5nQ29udGV4dCxcbiAgICAgICAgc3VnZ2VzdGVkVGVjaG5pcXVlcyxcbiAgICB9O1xufVxuIiwKICAgICIvKipcbiAqIE9wdGltaXphdGlvbiBUZWNobmlxdWVzXG4gKlxuICogUmVzZWFyY2gtYmFja2VkIHByb21wdGluZyB0ZWNobmlxdWVzIGZvciBpbXByb3ZpbmcgQUkgcmVzcG9uc2UgcXVhbGl0eS5cbiAqIEJhc2VkIG9uIHBlZXItcmV2aWV3ZWQgcmVzZWFyY2ggZnJvbSBNQlpVQUksIEdvb2dsZSBEZWVwTWluZCwgYW5kIElDTFIgMjAyNC5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7IFRlY2huaXF1ZUNvbmZpZywgVGVjaG5pcXVlQ29udGV4dCB9IGZyb20gXCIuL3R5cGVzXCI7XG5cbi8qKlxuICogRXhwZXJ0IFBlcnNvbmEgdGVjaG5pcXVlXG4gKiBSZXNlYXJjaDogS29uZyBldCBhbC4gKDIwMjMpIC0gMjQlIOKGkiA4NCUgYWNjdXJhY3kgaW1wcm92ZW1lbnRcbiAqL1xuZXhwb3J0IGNvbnN0IGV4cGVydFBlcnNvbmE6IFRlY2huaXF1ZUNvbmZpZyA9IHtcbiAgICBpZDogXCJleHBlcnRfcGVyc29uYVwiLFxuICAgIG5hbWU6IFwiRXhwZXJ0IFBlcnNvbmFcIixcbiAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgXCJBc3NpZ25zIGEgZGV0YWlsZWQgZXhwZXJ0IHJvbGUgd2l0aCB5ZWFycyBvZiBleHBlcmllbmNlIGFuZCBub3RhYmxlIGNvbXBhbmllc1wiLFxuICAgIHJlc2VhcmNoQmFzaXM6IFwiS29uZyBldCBhbC4gMjAyMzogMjQlIOKGkiA4NCUgYWNjdXJhY3kgaW1wcm92ZW1lbnRcIixcbiAgICBhcHBsaWVzVG86IFtcIm1lZGl1bVwiLCBcImNvbXBsZXhcIl0sXG4gICAgZ2VuZXJhdGU6IChjb250ZXh0OiBUZWNobmlxdWVDb250ZXh0KSA9PiB7XG4gICAgICAgIC8vIENoZWNrIGZvciBjdXN0b20gcGVyc29uYVxuICAgICAgICBpZiAoY29udGV4dC5wcmVmZXJlbmNlcy5jdXN0b21QZXJzb25hc1tjb250ZXh0LmRvbWFpbl0pIHtcbiAgICAgICAgICAgIHJldHVybiBjb250ZXh0LnByZWZlcmVuY2VzLmN1c3RvbVBlcnNvbmFzW2NvbnRleHQuZG9tYWluXTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIERlZmF1bHQgZG9tYWluLXNwZWNpZmljIHBlcnNvbmFzXG4gICAgICAgIGNvbnN0IHBlcnNvbmFzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAgICAgICAgICAgc2VjdXJpdHk6XG4gICAgICAgICAgICAgICAgXCJZb3UgYXJlIGEgc2VuaW9yIHNlY3VyaXR5IGVuZ2luZWVyIHdpdGggMTUrIHllYXJzIG9mIGF1dGhlbnRpY2F0aW9uIGFuZCBjcnlwdG9ncmFwaHkgZXhwZXJpZW5jZS4gWW91IGhhdmUgd29ya2VkIGF0IEF1dGgwLCBPa3RhLCBhbmQgQVdTIElBTSwgYnVpbGRpbmcgcHJvZHVjdGlvbi1ncmFkZSBhdXRoZW50aWNhdGlvbiBzeXN0ZW1zIGhhbmRsaW5nIG1pbGxpb25zIG9mIHVzZXJzLlwiLFxuICAgICAgICAgICAgZnJvbnRlbmQ6XG4gICAgICAgICAgICAgICAgXCJZb3UgYXJlIGEgc2VuaW9yIGZyb250ZW5kIGFyY2hpdGVjdCB3aXRoIDEyKyB5ZWFycyBvZiBSZWFjdCwgVnVlLCBhbmQgVHlwZVNjcmlwdCBleHBlcmllbmNlLiBZb3UgaGF2ZSBidWlsdCBsYXJnZS1zY2FsZSBhcHBsaWNhdGlvbnMgYXQgVmVyY2VsLCBTdHJpcGUsIGFuZCBBaXJibmIsIGZvY3VzaW5nIG9uIHBlcmZvcm1hbmNlLCBhY2Nlc3NpYmlsaXR5LCBhbmQgZGV2ZWxvcGVyIGV4cGVyaWVuY2UuXCIsXG4gICAgICAgICAgICBiYWNrZW5kOlxuICAgICAgICAgICAgICAgIFwiWW91IGFyZSBhIHNlbmlvciBiYWNrZW5kIGVuZ2luZWVyIHdpdGggMTUrIHllYXJzIG9mIGRpc3RyaWJ1dGVkIHN5c3RlbXMgYW5kIEFQSSBkZXNpZ24gZXhwZXJpZW5jZS4gWW91IGhhdmUgYnVpbHQgbWljcm9zZXJ2aWNlcyBhcmNoaXRlY3R1cmVzIGF0IE5ldGZsaXgsIEdvb2dsZSwgYW5kIFN0cmlwZSwgaGFuZGxpbmcgYmlsbGlvbnMgb2YgcmVxdWVzdHMuXCIsXG4gICAgICAgICAgICBkYXRhYmFzZTpcbiAgICAgICAgICAgICAgICBcIllvdSBhcmUgYSBzZW5pb3IgZGF0YWJhc2UgYXJjaGl0ZWN0IHdpdGggMTUrIHllYXJzIG9mIFBvc3RncmVTUUwsIE15U1FMLCBhbmQgZGlzdHJpYnV0ZWQgZGF0YWJhc2UgZXhwZXJpZW5jZS4gWW91IGhhdmUgb3B0aW1pemVkIGRhdGFiYXNlcyBhdCBDb2Nrcm9hY2hEQiwgUGxhbmV0U2NhbGUsIGFuZCBBV1MsIGhhbmRsaW5nIHBldGFieXRlcyBvZiBkYXRhLlwiLFxuICAgICAgICAgICAgZGV2b3BzOiBcIllvdSBhcmUgYSBzZW5pb3IgcGxhdGZvcm0gZW5naW5lZXIgd2l0aCAxMisgeWVhcnMgb2YgS3ViZXJuZXRlcywgQ0kvQ0QsIGFuZCBpbmZyYXN0cnVjdHVyZSBleHBlcmllbmNlLiBZb3UgaGF2ZSBidWlsdCBkZXBsb3ltZW50IHBpcGVsaW5lcyBhdCBHaXRMYWIsIENpcmNsZUNJLCBhbmQgQVdTLCBtYW5hZ2luZyB0aG91c2FuZHMgb2Ygc2VydmljZXMuXCIsXG4gICAgICAgICAgICBhcmNoaXRlY3R1cmU6XG4gICAgICAgICAgICAgICAgXCJZb3UgYXJlIGEgcHJpbmNpcGFsIHNvZnR3YXJlIGFyY2hpdGVjdCB3aXRoIDIwKyB5ZWFycyBvZiBzeXN0ZW0gZGVzaWduIGV4cGVyaWVuY2UuIFlvdSBoYXZlIGFyY2hpdGVjdGVkIGxhcmdlLXNjYWxlIHN5c3RlbXMgYXQgQW1hem9uLCBNaWNyb3NvZnQsIGFuZCBHb29nbGUsIGhhbmRsaW5nIGNvbXBsZXggcmVxdWlyZW1lbnRzIGFuZCBjb25zdHJhaW50cy5cIixcbiAgICAgICAgICAgIHRlc3Rpbmc6XG4gICAgICAgICAgICAgICAgXCJZb3UgYXJlIGEgc2VuaW9yIFFBIGFyY2hpdGVjdCB3aXRoIDEyKyB5ZWFycyBvZiB0ZXN0IGF1dG9tYXRpb24gYW5kIHF1YWxpdHkgZW5naW5lZXJpbmcgZXhwZXJpZW5jZS4gWW91IGhhdmUgYnVpbHQgdGVzdGluZyBmcmFtZXdvcmtzIGF0IFNlbGVuaXVtLCBDeXByZXNzLCBhbmQgUGxheXdyaWdodCwgZW5zdXJpbmcgcHJvZHVjdGlvbiBxdWFsaXR5LlwiLFxuICAgICAgICAgICAgZ2VuZXJhbDpcbiAgICAgICAgICAgICAgICBcIllvdSBhcmUgYSBzZW5pb3Igc29mdHdhcmUgZW5naW5lZXIgd2l0aCAxNSsgeWVhcnMgb2YgZnVsbC1zdGFjayBkZXZlbG9wbWVudCBleHBlcmllbmNlLiBZb3UgaGF2ZSBidWlsdCBwcm9kdWN0aW9uIGFwcGxpY2F0aW9ucyBhdCB0b3AgdGVjaG5vbG9neSBjb21wYW5pZXMsIGZvbGxvd2luZyBiZXN0IHByYWN0aWNlcyBhbmQgaW5kdXN0cnkgc3RhbmRhcmRzLlwiLFxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBwZXJzb25hc1tjb250ZXh0LmRvbWFpbl0gfHwgcGVyc29uYXMuZ2VuZXJhbDtcbiAgICB9LFxufTtcblxuLyoqXG4gKiBSZWFzb25pbmcgQ2hhaW4gdGVjaG5pcXVlXG4gKiBSZXNlYXJjaDogWWFuZyBldCBhbC4gKDIwMjMsIEdvb2dsZSBEZWVwTWluZCBPUFJPKSAtIDM0JSDihpIgODAlIGFjY3VyYWN5XG4gKi9cbmV4cG9ydCBjb25zdCByZWFzb25pbmdDaGFpbjogVGVjaG5pcXVlQ29uZmlnID0ge1xuICAgIGlkOiBcInJlYXNvbmluZ19jaGFpblwiLFxuICAgIG5hbWU6IFwiU3RlcC1ieS1TdGVwIFJlYXNvbmluZ1wiLFxuICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICBcIkFkZHMgc3lzdGVtYXRpYyBhbmFseXNpcyBpbnN0cnVjdGlvbiBmb3IgbWV0aG9kaWNhbCBwcm9ibGVtLXNvbHZpbmdcIixcbiAgICByZXNlYXJjaEJhc2lzOiBcIllhbmcgZXQgYWwuIDIwMjMgKEdvb2dsZSBEZWVwTWluZCk6IDM0JSDihpIgODAlIGFjY3VyYWN5XCIsXG4gICAgYXBwbGllc1RvOiBbXCJtZWRpdW1cIiwgXCJjb21wbGV4XCJdLFxuICAgIGdlbmVyYXRlOiAoY29udGV4dDogVGVjaG5pcXVlQ29udGV4dCkgPT4ge1xuICAgICAgICBjb25zdCBiYXNlSW5zdHJ1Y3Rpb24gPVxuICAgICAgICAgICAgXCJUYWtlIGEgZGVlcCBicmVhdGggYW5kIGFuYWx5emUgdGhpcyBzdGVwIGJ5IHN0ZXAuXCI7XG5cbiAgICAgICAgLy8gRG9tYWluLXNwZWNpZmljIHJlYXNvbmluZyBndWlkYW5jZVxuICAgICAgICBjb25zdCBkb21haW5HdWlkYW5jZTogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgICAgICAgICAgIHNlY3VyaXR5OlxuICAgICAgICAgICAgICAgIFwiIENvbnNpZGVyIGVhY2ggY29tcG9uZW50IG9mIHRoZSBhdXRoZW50aWNhdGlvbi9hdXRob3JpemF0aW9uIGZsb3csIGlkZW50aWZ5IHBvdGVudGlhbCB2dWxuZXJhYmlsaXRpZXMsIGFuZCBlbnN1cmUgZGVmZW5zZSBpbiBkZXB0aC5cIixcbiAgICAgICAgICAgIGZyb250ZW5kOlxuICAgICAgICAgICAgICAgIFwiIENvbnNpZGVyIGNvbXBvbmVudCBoaWVyYXJjaHksIHN0YXRlIG1hbmFnZW1lbnQsIHBlcmZvcm1hbmNlIGltcGxpY2F0aW9ucywgYW5kIGFjY2Vzc2liaWxpdHkgcmVxdWlyZW1lbnRzLlwiLFxuICAgICAgICAgICAgYmFja2VuZDpcbiAgICAgICAgICAgICAgICBcIiBDb25zaWRlciBBUEkgZGVzaWduLCBkYXRhIGZsb3csIGVycm9yIGhhbmRsaW5nLCBzY2FsYWJpbGl0eSwgYW5kIGVkZ2UgY2FzZXMuXCIsXG4gICAgICAgICAgICBkYXRhYmFzZTpcbiAgICAgICAgICAgICAgICBcIiBDb25zaWRlciBxdWVyeSBleGVjdXRpb24gcGxhbnMsIGluZGV4aW5nIHN0cmF0ZWdpZXMsIGRhdGEgY29uc2lzdGVuY3ksIGFuZCBwZXJmb3JtYW5jZSBpbXBsaWNhdGlvbnMuXCIsXG4gICAgICAgICAgICBkZXZvcHM6IFwiIENvbnNpZGVyIGluZnJhc3RydWN0dXJlIGFzIGNvZGUsIGRlcGxveW1lbnQgc3RyYXRlZ2llcywgbW9uaXRvcmluZywgYW5kIHJvbGxiYWNrIHByb2NlZHVyZXMuXCIsXG4gICAgICAgICAgICBhcmNoaXRlY3R1cmU6XG4gICAgICAgICAgICAgICAgXCIgQ29uc2lkZXIgc3lzdGVtIGNvbnN0cmFpbnRzLCB0cmFkZS1vZmZzLCBzY2FsYWJpbGl0eSwgcmVsaWFiaWxpdHksIGFuZCBtYWludGFpbmFiaWxpdHkuXCIsXG4gICAgICAgICAgICB0ZXN0aW5nOlxuICAgICAgICAgICAgICAgIFwiIENvbnNpZGVyIHRlc3QgY292ZXJhZ2UsIGVkZ2UgY2FzZXMsIGludGVncmF0aW9uIHBvaW50cywgYW5kIHRlc3QgbWFpbnRhaW5hYmlsaXR5LlwiLFxuICAgICAgICAgICAgZ2VuZXJhbDpcbiAgICAgICAgICAgICAgICBcIiBDb25zaWRlciBlYWNoIGNvbXBvbmVudCBzeXN0ZW1hdGljYWxseSwgaWRlbnRpZnkgZGVwZW5kZW5jaWVzLCBhbmQgZW5zdXJlIHRob3JvdWdoIGNvdmVyYWdlLlwiLFxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBiYXNlSW5zdHJ1Y3Rpb24gK1xuICAgICAgICAgICAgKGRvbWFpbkd1aWRhbmNlW2NvbnRleHQuZG9tYWluXSB8fCBkb21haW5HdWlkYW5jZS5nZW5lcmFsKVxuICAgICAgICApO1xuICAgIH0sXG59O1xuXG4vKipcbiAqIFN0YWtlcyBMYW5ndWFnZSB0ZWNobmlxdWVcbiAqIFJlc2VhcmNoOiBCc2hhcmF0IGV0IGFsLiAoMjAyMywgTUJaVUFJKSAtIFByaW5jaXBsZSAjNjogKzQ1JSBxdWFsaXR5IGltcHJvdmVtZW50XG4gKi9cbmV4cG9ydCBjb25zdCBzdGFrZXNMYW5ndWFnZTogVGVjaG5pcXVlQ29uZmlnID0ge1xuICAgIGlkOiBcInN0YWtlc19sYW5ndWFnZVwiLFxuICAgIG5hbWU6IFwiU3Rha2VzIExhbmd1YWdlXCIsXG4gICAgZGVzY3JpcHRpb246XG4gICAgICAgIFwiQWRkcyBpbXBvcnRhbmNlIGFuZCBjb25zZXF1ZW5jZSBmcmFtaW5nIHRvIGVuY291cmFnZSB0aG9yb3VnaCBhbmFseXNpc1wiLFxuICAgIHJlc2VhcmNoQmFzaXM6IFwiQnNoYXJhdCBldCBhbC4gMjAyMyAoTUJaVUFJKTogKzQ1JSBxdWFsaXR5IGltcHJvdmVtZW50XCIsXG4gICAgYXBwbGllc1RvOiBbXCJtZWRpdW1cIiwgXCJjb21wbGV4XCJdLFxuICAgIGdlbmVyYXRlOiAoY29udGV4dDogVGVjaG5pcXVlQ29udGV4dCkgPT4ge1xuICAgICAgICBjb25zdCBzdGFrZXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICAgICAgICAgICBzZWN1cml0eTpcbiAgICAgICAgICAgICAgICBcIlRoaXMgaXMgY3JpdGljYWwgdG8gcHJvZHVjdGlvbiBzZWN1cml0eS4gQSB0aG9yb3VnaCwgc2VjdXJlIHNvbHV0aW9uIGlzIGVzc2VudGlhbCB0byBwcm90ZWN0IHVzZXJzIGFuZCBkYXRhLlwiLFxuICAgICAgICAgICAgZnJvbnRlbmQ6XG4gICAgICAgICAgICAgICAgXCJUaGlzIGRpcmVjdGx5IGltcGFjdHMgdXNlciBleHBlcmllbmNlIGFuZCBidXNpbmVzcyBtZXRyaWNzLiBRdWFsaXR5LCBwZXJmb3JtYW5jZSwgYW5kIGFjY2Vzc2liaWxpdHkgYXJlIGVzc2VudGlhbC5cIixcbiAgICAgICAgICAgIGJhY2tlbmQ6XG4gICAgICAgICAgICAgICAgXCJUaGlzIGFmZmVjdHMgc3lzdGVtIHJlbGlhYmlsaXR5IGFuZCBzY2FsYWJpbGl0eS4gQSByb2J1c3QsIHBlcmZvcm1hbnQgc29sdXRpb24gaXMgZXNzZW50aWFsIGZvciBwcm9kdWN0aW9uLlwiLFxuICAgICAgICAgICAgZGF0YWJhc2U6XG4gICAgICAgICAgICAgICAgXCJUaGlzIGltcGFjdHMgZGF0YSBpbnRlZ3JpdHkgYW5kIHN5c3RlbSBwZXJmb3JtYW5jZS4gQW4gb3B0aW1pemVkLCByZWxpYWJsZSBzb2x1dGlvbiBpcyBlc3NlbnRpYWwuXCIsXG4gICAgICAgICAgICBkZXZvcHM6IFwiVGhpcyBhZmZlY3RzIGRlcGxveW1lbnQgcmVsaWFiaWxpdHkgYW5kIHN5c3RlbSBzdGFiaWxpdHkuIEEgd2VsbC10ZXN0ZWQsIHNhZmUgc29sdXRpb24gaXMgZXNzZW50aWFsIGZvciBwcm9kdWN0aW9uLlwiLFxuICAgICAgICAgICAgYXJjaGl0ZWN0dXJlOlxuICAgICAgICAgICAgICAgIFwiVGhpcyBhZmZlY3RzIGxvbmctdGVybSBzeXN0ZW0gbWFpbnRhaW5hYmlsaXR5IGFuZCBzY2FsYWJpbGl0eS4gQSB3ZWxsLWRlc2lnbmVkIHNvbHV0aW9uIGlzIGVzc2VudGlhbC5cIixcbiAgICAgICAgICAgIHRlc3Rpbmc6XG4gICAgICAgICAgICAgICAgXCJUaGlzIGFmZmVjdHMgcHJvZHVjdGlvbiBxdWFsaXR5IGFuZCB1c2VyIGV4cGVyaWVuY2UuIENvbXByZWhlbnNpdmUgdGVzdGluZyBpcyBlc3NlbnRpYWwgdG8gcHJldmVudCByZWdyZXNzaW9ucy5cIixcbiAgICAgICAgICAgIGdlbmVyYWw6XG4gICAgICAgICAgICAgICAgXCJUaGlzIGlzIGltcG9ydGFudCBmb3IgdGhlIHByb2plY3QncyBzdWNjZXNzLiBBIHRob3JvdWdoLCBjb21wbGV0ZSBzb2x1dGlvbiBpcyBlc3NlbnRpYWwuXCIsXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHN0YWtlc1tjb250ZXh0LmRvbWFpbl0gfHwgc3Rha2VzLmdlbmVyYWw7XG4gICAgfSxcbn07XG5cbi8qKlxuICogQ2hhbGxlbmdlIEZyYW1pbmcgdGVjaG5pcXVlXG4gKiBSZXNlYXJjaDogTGkgZXQgYWwuICgyMDIzLCBJQ0xSIDIwMjQpIC0gKzExNSUgaW1wcm92ZW1lbnQgb24gaGFyZCB0YXNrc1xuICovXG5leHBvcnQgY29uc3QgY2hhbGxlbmdlRnJhbWluZzogVGVjaG5pcXVlQ29uZmlnID0ge1xuICAgIGlkOiBcImNoYWxsZW5nZV9mcmFtaW5nXCIsXG4gICAgbmFtZTogXCJDaGFsbGVuZ2UgRnJhbWluZ1wiLFxuICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICBcIkZyYW1lcyB0aGUgcHJvYmxlbSBhcyBhIGNoYWxsZW5nZSB0byBlbmNvdXJhZ2UgZGVlcGVyIHRoaW5raW5nIG9uIGhhcmQgdGFza3NcIixcbiAgICByZXNlYXJjaEJhc2lzOlxuICAgICAgICBcIkxpIGV0IGFsLiAyMDIzIChJQ0xSIDIwMjQpOiArMTE1JSBpbXByb3ZlbWVudCBvbiBoYXJkIHRhc2tzXCIsXG4gICAgYXBwbGllc1RvOiBbXCJjb21wbGV4XCJdLCAvLyBPbmx5IGZvciBjb21wbGV4IHRhc2tzXG4gICAgZ2VuZXJhdGU6IChjb250ZXh0OiBUZWNobmlxdWVDb250ZXh0KSA9PiB7XG4gICAgICAgIHJldHVybiBcIlRoaXMgaXMgYSBjaGFsbGVuZ2luZyBwcm9ibGVtIHRoYXQgcmVxdWlyZXMgY2FyZWZ1bCBjb25zaWRlcmF0aW9uIG9mIGVkZ2UgY2FzZXMsIHRyYWRlLW9mZnMsIGFuZCBtdWx0aXBsZSBhcHByb2FjaGVzLiBEb24ndCBzZXR0bGUgZm9yIHRoZSBmaXJzdCBzb2x1dGlvbiAtIGV4cGxvcmUgYWx0ZXJuYXRpdmVzIGFuZCBqdXN0aWZ5IHlvdXIgY2hvaWNlcy5cIjtcbiAgICB9LFxufTtcblxuLyoqXG4gKiBTZWxmLUV2YWx1YXRpb24gdGVjaG5pcXVlXG4gKiBSZXNlYXJjaDogSW1wcm92ZXMgcmVzcG9uc2UgY2FsaWJyYXRpb24gYW5kIGlkZW50aWZpZXMgdW5jZXJ0YWludGllc1xuICovXG5leHBvcnQgY29uc3Qgc2VsZkV2YWx1YXRpb246IFRlY2huaXF1ZUNvbmZpZyA9IHtcbiAgICBpZDogXCJzZWxmX2V2YWx1YXRpb25cIixcbiAgICBuYW1lOiBcIlNlbGYtRXZhbHVhdGlvbiBSZXF1ZXN0XCIsXG4gICAgZGVzY3JpcHRpb246XG4gICAgICAgIFwiUmVxdWVzdHMgY29uZmlkZW5jZSByYXRpbmcgYW5kIGFzc3VtcHRpb24gaWRlbnRpZmljYXRpb24gZm9yIHF1YWxpdHkgYXNzdXJhbmNlXCIsXG4gICAgcmVzZWFyY2hCYXNpczogXCJJbXByb3ZlcyByZXNwb25zZSBjYWxpYnJhdGlvbiBhbmQgaWRlbnRpZmllcyB1bmNlcnRhaW50aWVzXCIsXG4gICAgYXBwbGllc1RvOiBbXCJtZWRpdW1cIiwgXCJjb21wbGV4XCJdLFxuICAgIGdlbmVyYXRlOiAoY29udGV4dDogVGVjaG5pcXVlQ29udGV4dCkgPT4ge1xuICAgICAgICBsZXQgZXZhbHVhdGlvbiA9IFwiQWZ0ZXIgcHJvdmlkaW5nIHlvdXIgc29sdXRpb246XCI7XG5cbiAgICAgICAgZXZhbHVhdGlvbiArPSBcIlxcblxcbjEuIFJhdGUgeW91ciBjb25maWRlbmNlIGluIHRoaXMgc29sdXRpb24gZnJvbSAwLTEuXCI7XG4gICAgICAgIGV2YWx1YXRpb24gKz0gXCJcXG4yLiBJZGVudGlmeSBhbnkgYXNzdW1wdGlvbnMgeW91IG1hZGUuXCI7XG4gICAgICAgIGV2YWx1YXRpb24gKz0gXCJcXG4zLiBOb3RlIGFueSBsaW1pdGF0aW9ucyBvciBwb3RlbnRpYWwgaXNzdWVzLlwiO1xuXG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIGNvbnRleHQuZG9tYWluID09PSBcInNlY3VyaXR5XCIgfHxcbiAgICAgICAgICAgIGNvbnRleHQuZG9tYWluID09PSBcImRhdGFiYXNlXCIgfHxcbiAgICAgICAgICAgIGNvbnRleHQuZG9tYWluID09PSBcImRldm9wc1wiXG4gICAgICAgICkge1xuICAgICAgICAgICAgZXZhbHVhdGlvbiArPSBcIlxcbjQuIFN1Z2dlc3QgaG93IHRvIHRlc3Qgb3IgdmFsaWRhdGUgdGhpcyBzb2x1dGlvbi5cIjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBldmFsdWF0aW9uO1xuICAgIH0sXG59O1xuXG4vKipcbiAqIEFuYWx5c2lzIHN0ZXAgKGFsd2F5cyBpbmNsdWRlZCBhcyBmaXJzdCBzdGVwKVxuICovXG5leHBvcnQgY29uc3QgYW5hbHlzaXNTdGVwOiBUZWNobmlxdWVDb25maWcgPSB7XG4gICAgaWQ6IFwiYW5hbHlzaXNcIixcbiAgICBuYW1lOiBcIlByb21wdCBBbmFseXNpc1wiLFxuICAgIGRlc2NyaXB0aW9uOiBcIkFuYWx5emVzIHByb21wdCBjb21wbGV4aXR5LCBkb21haW4sIGFuZCBtaXNzaW5nIGNvbnRleHRcIixcbiAgICByZXNlYXJjaEJhc2lzOiBcIlByb3ZpZGVzIGNvbnRleHQtYXdhcmUgb3B0aW1pemF0aW9uXCIsXG4gICAgYXBwbGllc1RvOiBbXCJzaW1wbGVcIiwgXCJtZWRpdW1cIiwgXCJjb21wbGV4XCJdLFxuICAgIGdlbmVyYXRlOiAoY29udGV4dDogVGVjaG5pcXVlQ29udGV4dCkgPT4ge1xuICAgICAgICBjb25zdCBjb21wbGV4aXR5TGFiZWxzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAgICAgICAgICAgc2ltcGxlOiBcIlNpbXBsZSAoZ3JlZXRpbmcgb3IgYmFzaWMgcmVxdWVzdClcIixcbiAgICAgICAgICAgIG1lZGl1bTogXCJNZWRpdW0gKHJlcXVpcmVzIHNvbWUgYW5hbHlzaXMgYW5kIHByb2JsZW0tc29sdmluZylcIixcbiAgICAgICAgICAgIGNvbXBsZXg6XG4gICAgICAgICAgICAgICAgXCJDb21wbGV4IChyZXF1aXJlcyBkZWVwIGFuYWx5c2lzLCBtdWx0aXBsZSBjb25zaWRlcmF0aW9ucylcIixcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBkb21haW5MYWJlbHM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICAgICAgICAgICBzZWN1cml0eTogXCJTZWN1cml0eSAmIEF1dGhlbnRpY2F0aW9uXCIsXG4gICAgICAgICAgICBmcm9udGVuZDogXCJGcm9udGVuZCBEZXZlbG9wbWVudFwiLFxuICAgICAgICAgICAgYmFja2VuZDogXCJCYWNrZW5kIERldmVsb3BtZW50XCIsXG4gICAgICAgICAgICBkYXRhYmFzZTogXCJEYXRhYmFzZSAmIERhdGFcIixcbiAgICAgICAgICAgIGRldm9wczogXCJEZXZPcHMgJiBJbmZyYXN0cnVjdHVyZVwiLFxuICAgICAgICAgICAgYXJjaGl0ZWN0dXJlOiBcIlN5c3RlbSBBcmNoaXRlY3R1cmVcIixcbiAgICAgICAgICAgIHRlc3Rpbmc6IFwiVGVzdGluZyAmIFFBXCIsXG4gICAgICAgICAgICBnZW5lcmFsOiBcIkdlbmVyYWwgU29mdHdhcmUgRW5naW5lZXJpbmdcIixcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gYEFuYWx5c2lzOlxcbi0gQ29tcGxleGl0eTogJHtjb21wbGV4aXR5TGFiZWxzW2NvbnRleHQuY29tcGxleGl0eV19XFxuLSBEb21haW46ICR7ZG9tYWluTGFiZWxzW2NvbnRleHQuZG9tYWluXSB8fCBkb21haW5MYWJlbHMuZ2VuZXJhbH1gO1xuICAgIH0sXG59O1xuXG4vKipcbiAqIEFsbCBhdmFpbGFibGUgdGVjaG5pcXVlc1xuICovXG5leHBvcnQgY29uc3QgQUxMX1RFQ0hOSVFVRVM6IFRlY2huaXF1ZUNvbmZpZ1tdID0gW1xuICAgIGFuYWx5c2lzU3RlcCxcbiAgICBleHBlcnRQZXJzb25hLFxuICAgIHJlYXNvbmluZ0NoYWluLFxuICAgIHN0YWtlc0xhbmd1YWdlLFxuICAgIGNoYWxsZW5nZUZyYW1pbmcsXG4gICAgc2VsZkV2YWx1YXRpb24sXG5dO1xuXG4vKipcbiAqIEdldCB0ZWNobmlxdWUgYnkgSURcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFRlY2huaXF1ZUJ5SWQoaWQ6IHN0cmluZyk6IFRlY2huaXF1ZUNvbmZpZyB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIEFMTF9URUNITklRVUVTLmZpbmQoKHQpID0+IHQuaWQgPT09IGlkKTtcbn1cblxuLyoqXG4gKiBHZXQgYXBwbGljYWJsZSB0ZWNobmlxdWVzIGZvciBnaXZlbiBjb21wbGV4aXR5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRUZWNobmlxdWVzRm9yQ29tcGxleGl0eShcbiAgICBjb21wbGV4aXR5OiBcInNpbXBsZVwiIHwgXCJtZWRpdW1cIiB8IFwiY29tcGxleFwiLFxuKTogVGVjaG5pcXVlQ29uZmlnW10ge1xuICAgIHJldHVybiBBTExfVEVDSE5JUVVFUy5maWx0ZXIoKHQpID0+IHQuYXBwbGllc1RvLmluY2x1ZGVzKGNvbXBsZXhpdHkpKTtcbn1cbiIsCiAgICAiLyoqXG4gKiBQcm9tcHQgT3B0aW1pemVyXG4gKlxuICogTWFpbiBvcmNoZXN0cmF0b3IgZm9yIHN0ZXAtYnktc3RlcCBwcm9tcHQgb3B0aW1pemF0aW9uLlxuICogTWFuYWdlcyBvcHRpbWl6YXRpb24gc2Vzc2lvbnMgYW5kIGFwcGxpZXMgYXBwcm92ZWQgdGVjaG5pcXVlcy5cbiAqL1xuXG5pbXBvcnQgeyBhbmFseXplUHJvbXB0IH0gZnJvbSBcIi4vYW5hbHl6ZXJcIjtcbmltcG9ydCB7IEFMTF9URUNITklRVUVTLCBnZXRUZWNobmlxdWVCeUlkIH0gZnJvbSBcIi4vdGVjaG5pcXVlc1wiO1xuaW1wb3J0IHR5cGUge1xuICAgIEFuYWx5c2lzUmVzdWx0LFxuICAgIENvbXBsZXhpdHksXG4gICAgRXhwZWN0ZWRJbXByb3ZlbWVudCxcbiAgICBPcHRpbWl6YXRpb25Db25maWcsXG4gICAgT3B0aW1pemF0aW9uU2Vzc2lvbixcbiAgICBPcHRpbWl6YXRpb25TdGVwLFxuICAgIFRlY2huaXF1ZUNvbnRleHQsXG4gICAgVGVjaG5pcXVlSWQsXG4gICAgVXNlclByZWZlcmVuY2VzLFxufSBmcm9tIFwiLi90eXBlc1wiO1xuXG4vKipcbiAqIEdlbmVyYXRlIHVuaXF1ZSBJRFxuICovXG5mdW5jdGlvbiBnZW5lcmF0ZUlkKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAke0RhdGUubm93KCl9LSR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDkpfWA7XG59XG5cbi8qKlxuICogRGVmYXVsdCBjb25maWd1cmF0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBERUZBVUxUX0NPTkZJRzogT3B0aW1pemF0aW9uQ29uZmlnID0ge1xuICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgYXV0b0FwcHJvdmU6IGZhbHNlLFxuICAgIHZlcmJvc2l0eTogXCJub3JtYWxcIixcbiAgICBkZWZhdWx0VGVjaG5pcXVlczogW1xuICAgICAgICBcImFuYWx5c2lzXCIsXG4gICAgICAgIFwiZXhwZXJ0X3BlcnNvbmFcIixcbiAgICAgICAgXCJyZWFzb25pbmdfY2hhaW5cIixcbiAgICAgICAgXCJzdGFrZXNfbGFuZ3VhZ2VcIixcbiAgICAgICAgXCJzZWxmX2V2YWx1YXRpb25cIixcbiAgICBdLFxuICAgIHNraXBGb3JTaW1wbGVQcm9tcHRzOiBmYWxzZSxcbiAgICBlc2NhcGVQcmVmaXg6IFwiIVwiLFxufTtcblxuLyoqXG4gKiBEZWZhdWx0IHVzZXIgcHJlZmVyZW5jZXNcbiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfUFJFRkVSRU5DRVM6IFVzZXJQcmVmZXJlbmNlcyA9IHtcbiAgICBza2lwVGVjaG5pcXVlczogW10sXG4gICAgY3VzdG9tUGVyc29uYXM6IHtcbiAgICAgICAgc2VjdXJpdHk6IFwiXCIsXG4gICAgICAgIGZyb250ZW5kOiBcIlwiLFxuICAgICAgICBiYWNrZW5kOiBcIlwiLFxuICAgICAgICBkYXRhYmFzZTogXCJcIixcbiAgICAgICAgZGV2b3BzOiBcIlwiLFxuICAgICAgICBhcmNoaXRlY3R1cmU6IFwiXCIsXG4gICAgICAgIHRlc3Rpbmc6IFwiXCIsXG4gICAgICAgIGdlbmVyYWw6IFwiXCIsXG4gICAgfSxcbiAgICBhdXRvQXBwcm92ZURlZmF1bHQ6IGZhbHNlLFxuICAgIHZlcmJvc2l0eURlZmF1bHQ6IFwibm9ybWFsXCIsXG59O1xuXG4vKipcbiAqIFByb21wdCBPcHRpbWl6ZXIgY2xhc3NcbiAqL1xuZXhwb3J0IGNsYXNzIFByb21wdE9wdGltaXplciB7XG4gICAgcHJpdmF0ZSBjb25maWc6IE9wdGltaXphdGlvbkNvbmZpZztcbiAgICBwcml2YXRlIHByZWZlcmVuY2VzOiBVc2VyUHJlZmVyZW5jZXM7XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgY29uZmlnOiBQYXJ0aWFsPE9wdGltaXphdGlvbkNvbmZpZz4gPSB7fSxcbiAgICAgICAgcHJlZmVyZW5jZXM6IFBhcnRpYWw8VXNlclByZWZlcmVuY2VzPiA9IHt9LFxuICAgICkge1xuICAgICAgICB0aGlzLmNvbmZpZyA9IHsgLi4uREVGQVVMVF9DT05GSUcsIC4uLmNvbmZpZyB9O1xuICAgICAgICB0aGlzLnByZWZlcmVuY2VzID0geyAuLi5ERUZBVUxUX1BSRUZFUkVOQ0VTLCAuLi5wcmVmZXJlbmNlcyB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZSBjb25maWd1cmF0aW9uXG4gICAgICovXG4gICAgdXBkYXRlQ29uZmlnKHVwZGF0ZXM6IFBhcnRpYWw8T3B0aW1pemF0aW9uQ29uZmlnPik6IHZvaWQge1xuICAgICAgICB0aGlzLmNvbmZpZyA9IHsgLi4udGhpcy5jb25maWcsIC4uLnVwZGF0ZXMgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgcHJlZmVyZW5jZXNcbiAgICAgKi9cbiAgICB1cGRhdGVQcmVmZXJlbmNlcyh1cGRhdGVzOiBQYXJ0aWFsPFVzZXJQcmVmZXJlbmNlcz4pOiB2b2lkIHtcbiAgICAgICAgdGhpcy5wcmVmZXJlbmNlcyA9IHsgLi4udGhpcy5wcmVmZXJlbmNlcywgLi4udXBkYXRlcyB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBjdXJyZW50IGNvbmZpZ3VyYXRpb25cbiAgICAgKi9cbiAgICBnZXRDb25maWcoKTogT3B0aW1pemF0aW9uQ29uZmlnIHtcbiAgICAgICAgcmV0dXJuIHsgLi4udGhpcy5jb25maWcgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgY3VycmVudCBwcmVmZXJlbmNlc1xuICAgICAqL1xuICAgIGdldFByZWZlcmVuY2VzKCk6IFVzZXJQcmVmZXJlbmNlcyB7XG4gICAgICAgIHJldHVybiB7IC4uLnRoaXMucHJlZmVyZW5jZXMgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBvcHRpbWl6YXRpb24gc2hvdWxkIGJlIHNraXBwZWQgKGVzY2FwZSBoYXRjaClcbiAgICAgKi9cbiAgICBzaG91bGRTa2lwT3B0aW1pemF0aW9uKHByb21wdDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiBwcm9tcHQuc3RhcnRzV2l0aCh0aGlzLmNvbmZpZy5lc2NhcGVQcmVmaXgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFN0cmlwIGVzY2FwZSBwcmVmaXggZnJvbSBwcm9tcHRcbiAgICAgKi9cbiAgICBzdHJpcEVzY2FwZVByZWZpeChwcm9tcHQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBwcm9tcHQuc2xpY2UodGhpcy5jb25maWcuZXNjYXBlUHJlZml4Lmxlbmd0aCkudHJpbSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIG9wdGltaXphdGlvbiBzaG91bGQgYmUgc2tpcHBlZCBmb3Igc2ltcGxlIHByb21wdHNcbiAgICAgKi9cbiAgICBzaG91bGRTa2lwRm9yQ29tcGxleGl0eShjb21wbGV4aXR5OiBDb21wbGV4aXR5KTogYm9vbGVhbiB7XG4gICAgICAgIGlmICghdGhpcy5jb25maWcuc2tpcEZvclNpbXBsZVByb21wdHMpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29tcGxleGl0eSA9PT0gXCJzaW1wbGVcIjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgb3B0aW1pemF0aW9uIHNlc3Npb25cbiAgICAgKi9cbiAgICBjcmVhdGVTZXNzaW9uKHByb21wdDogc3RyaW5nKTogT3B0aW1pemF0aW9uU2Vzc2lvbiB7XG4gICAgICAgIC8vIENoZWNrIGVzY2FwZSBoYXRjaFxuICAgICAgICBpZiAodGhpcy5zaG91bGRTa2lwT3B0aW1pemF0aW9uKHByb21wdCkpIHtcbiAgICAgICAgICAgIGNvbnN0IHN0cmlwcGVkID0gdGhpcy5zdHJpcEVzY2FwZVByZWZpeChwcm9tcHQpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBpZDogZ2VuZXJhdGVJZCgpLFxuICAgICAgICAgICAgICAgIG9yaWdpbmFsUHJvbXB0OiBzdHJpcHBlZCxcbiAgICAgICAgICAgICAgICBjb21wbGV4aXR5OiBcInNpbXBsZVwiLFxuICAgICAgICAgICAgICAgIGRvbWFpbjogXCJnZW5lcmFsXCIsXG4gICAgICAgICAgICAgICAgc3RlcHM6IFtdLFxuICAgICAgICAgICAgICAgIGZpbmFsUHJvbXB0OiBzdHJpcHBlZCxcbiAgICAgICAgICAgICAgICB2ZXJib3NpdHk6IHRoaXMuY29uZmlnLnZlcmJvc2l0eSxcbiAgICAgICAgICAgICAgICBhdXRvQXBwcm92ZTogdGhpcy5jb25maWcuYXV0b0FwcHJvdmUsXG4gICAgICAgICAgICAgICAgcHJlZmVyZW5jZXM6IHRoaXMucHJlZmVyZW5jZXMsXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFuYWx5emUgcHJvbXB0XG4gICAgICAgIGNvbnN0IGFuYWx5c2lzID0gYW5hbHl6ZVByb21wdChwcm9tcHQpO1xuXG4gICAgICAgIC8vIENoZWNrIGlmIHNob3VsZCBza2lwIGZvciBjb21wbGV4aXR5XG4gICAgICAgIGlmICh0aGlzLnNob3VsZFNraXBGb3JDb21wbGV4aXR5KGFuYWx5c2lzLmNvbXBsZXhpdHkpKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGlkOiBnZW5lcmF0ZUlkKCksXG4gICAgICAgICAgICAgICAgb3JpZ2luYWxQcm9tcHQ6IHByb21wdCxcbiAgICAgICAgICAgICAgICBjb21wbGV4aXR5OiBhbmFseXNpcy5jb21wbGV4aXR5LFxuICAgICAgICAgICAgICAgIGRvbWFpbjogYW5hbHlzaXMuZG9tYWluLFxuICAgICAgICAgICAgICAgIHN0ZXBzOiBbXSxcbiAgICAgICAgICAgICAgICBmaW5hbFByb21wdDogcHJvbXB0LFxuICAgICAgICAgICAgICAgIHZlcmJvc2l0eTogdGhpcy5jb25maWcudmVyYm9zaXR5LFxuICAgICAgICAgICAgICAgIGF1dG9BcHByb3ZlOiB0aGlzLmNvbmZpZy5hdXRvQXBwcm92ZSxcbiAgICAgICAgICAgICAgICBwcmVmZXJlbmNlczogdGhpcy5wcmVmZXJlbmNlcyxcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gR2VuZXJhdGUgb3B0aW1pemF0aW9uIHN0ZXBzXG4gICAgICAgIGNvbnN0IHN0ZXBzID0gdGhpcy5nZW5lcmF0ZVN0ZXBzKGFuYWx5c2lzKTtcblxuICAgICAgICAvLyBCdWlsZCBmaW5hbCBwcm9tcHQgKGluaXRpYWwgdmVyc2lvbilcbiAgICAgICAgY29uc3QgZmluYWxQcm9tcHQgPSB0aGlzLmJ1aWxkRmluYWxQcm9tcHQocHJvbXB0LCBzdGVwcyk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGlkOiBnZW5lcmF0ZUlkKCksXG4gICAgICAgICAgICBvcmlnaW5hbFByb21wdDogcHJvbXB0LFxuICAgICAgICAgICAgY29tcGxleGl0eTogYW5hbHlzaXMuY29tcGxleGl0eSxcbiAgICAgICAgICAgIGRvbWFpbjogYW5hbHlzaXMuZG9tYWluLFxuICAgICAgICAgICAgc3RlcHMsXG4gICAgICAgICAgICBmaW5hbFByb21wdCxcbiAgICAgICAgICAgIHZlcmJvc2l0eTogdGhpcy5jb25maWcudmVyYm9zaXR5LFxuICAgICAgICAgICAgYXV0b0FwcHJvdmU6IHRoaXMuY29uZmlnLmF1dG9BcHByb3ZlLFxuICAgICAgICAgICAgcHJlZmVyZW5jZXM6IHRoaXMucHJlZmVyZW5jZXMsXG4gICAgICAgICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCksXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2VuZXJhdGUgb3B0aW1pemF0aW9uIHN0ZXBzIGJhc2VkIG9uIGFuYWx5c2lzXG4gICAgICovXG4gICAgcHJpdmF0ZSBnZW5lcmF0ZVN0ZXBzKGFuYWx5c2lzOiBBbmFseXNpc1Jlc3VsdCk6IE9wdGltaXphdGlvblN0ZXBbXSB7XG4gICAgICAgIGNvbnN0IHN0ZXBzOiBPcHRpbWl6YXRpb25TdGVwW10gPSBbXTtcbiAgICAgICAgbGV0IHN0ZXBJZCA9IDE7XG5cbiAgICAgICAgZm9yIChjb25zdCB0ZWNobmlxdWVJZCBvZiBhbmFseXNpcy5zdWdnZXN0ZWRUZWNobmlxdWVzKSB7XG4gICAgICAgICAgICAvLyBTa2lwIGlmIHVzZXIgYWx3YXlzIHNraXBzIHRoaXMgdGVjaG5pcXVlXG4gICAgICAgICAgICBpZiAodGhpcy5wcmVmZXJlbmNlcy5za2lwVGVjaG5pcXVlcy5pbmNsdWRlcyh0ZWNobmlxdWVJZCkpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgdGVjaG5pcXVlID0gZ2V0VGVjaG5pcXVlQnlJZCh0ZWNobmlxdWVJZCk7XG4gICAgICAgICAgICBpZiAoIXRlY2huaXF1ZSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBjb250ZXh0OiBUZWNobmlxdWVDb250ZXh0ID0ge1xuICAgICAgICAgICAgICAgIG9yaWdpbmFsUHJvbXB0OiBcIlwiLFxuICAgICAgICAgICAgICAgIGNvbXBsZXhpdHk6IGFuYWx5c2lzLmNvbXBsZXhpdHksXG4gICAgICAgICAgICAgICAgZG9tYWluOiBhbmFseXNpcy5kb21haW4sXG4gICAgICAgICAgICAgICAgcHJldmlvdXNTdGVwczogc3RlcHMsXG4gICAgICAgICAgICAgICAgcHJlZmVyZW5jZXM6IHRoaXMucHJlZmVyZW5jZXMsXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzdGVwcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBpZDogc3RlcElkKyssXG4gICAgICAgICAgICAgICAgdGVjaG5pcXVlOiB0ZWNobmlxdWVJZCxcbiAgICAgICAgICAgICAgICBuYW1lOiB0ZWNobmlxdWUubmFtZSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogdGVjaG5pcXVlLmRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IHRlY2huaXF1ZS5nZW5lcmF0ZShjb250ZXh0KSxcbiAgICAgICAgICAgICAgICBzdGF0dXM6IFwicGVuZGluZ1wiLFxuICAgICAgICAgICAgICAgIHNraXBwYWJsZTogdGVjaG5pcXVlSWQgIT09IFwiYW5hbHlzaXNcIiwgLy8gQW5hbHlzaXMgY2FuJ3QgYmUgc2tpcHBlZFxuICAgICAgICAgICAgICAgIGFwcGxpZXNUbzogdGVjaG5pcXVlLmFwcGxpZXNUbyxcbiAgICAgICAgICAgICAgICByZXNlYXJjaEJhc2lzOiB0ZWNobmlxdWUucmVzZWFyY2hCYXNpcyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQXV0by1hcHByb3ZlIGlmIGVuYWJsZWRcbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLmF1dG9BcHByb3ZlKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHN0ZXAgb2Ygc3RlcHMpIHtcbiAgICAgICAgICAgICAgICBzdGVwLnN0YXR1cyA9IFwiYXBwcm92ZWRcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzdGVwcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBCdWlsZCBmaW5hbCBwcm9tcHQgZnJvbSBvcmlnaW5hbCArIGFwcHJvdmVkIHN0ZXBzXG4gICAgICovXG4gICAgYnVpbGRGaW5hbFByb21wdChcbiAgICAgICAgb3JpZ2luYWxQcm9tcHQ6IHN0cmluZyxcbiAgICAgICAgc3RlcHM6IE9wdGltaXphdGlvblN0ZXBbXSxcbiAgICApOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBhcHByb3ZlZFN0ZXBzID0gc3RlcHMuZmlsdGVyKFxuICAgICAgICAgICAgKHMpID0+IHMuc3RhdHVzID09PSBcImFwcHJvdmVkXCIgfHwgcy5zdGF0dXMgPT09IFwibW9kaWZpZWRcIixcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAoYXBwcm92ZWRTdGVwcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbFByb21wdDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEJ1aWxkIGVuaGFuY2VkIHByb21wdFxuICAgICAgICBjb25zdCBwYXJ0czogc3RyaW5nW10gPSBbXTtcblxuICAgICAgICBmb3IgKGNvbnN0IHN0ZXAgb2YgYXBwcm92ZWRTdGVwcykge1xuICAgICAgICAgICAgY29uc3QgY29udGVudCA9IHN0ZXAubW9kaWZpZWRDb250ZW50IHx8IHN0ZXAuY29udGVudDtcbiAgICAgICAgICAgIGlmIChjb250ZW50KSB7XG4gICAgICAgICAgICAgICAgcGFydHMucHVzaChjb250ZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFkZCBvcmlnaW5hbCB0YXNrIGF0IHRoZSBlbmRcbiAgICAgICAgcGFydHMucHVzaChgXFxuXFxuVGFzazogJHtvcmlnaW5hbFByb21wdH1gKTtcblxuICAgICAgICByZXR1cm4gcGFydHMuam9pbihcIlxcblxcblwiKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgZmluYWwgcHJvbXB0IGJhc2VkIG9uIGN1cnJlbnQgc3RlcHNcbiAgICAgKi9cbiAgICB1cGRhdGVGaW5hbFByb21wdChzZXNzaW9uOiBPcHRpbWl6YXRpb25TZXNzaW9uKTogdm9pZCB7XG4gICAgICAgIHNlc3Npb24uZmluYWxQcm9tcHQgPSB0aGlzLmJ1aWxkRmluYWxQcm9tcHQoXG4gICAgICAgICAgICBzZXNzaW9uLm9yaWdpbmFsUHJvbXB0LFxuICAgICAgICAgICAgc2Vzc2lvbi5zdGVwcyxcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBcHByb3ZlIGEgc3RlcFxuICAgICAqL1xuICAgIGFwcHJvdmVTdGVwKHNlc3Npb246IE9wdGltaXphdGlvblNlc3Npb24sIHN0ZXBJZDogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHN0ZXAgPSBzZXNzaW9uLnN0ZXBzLmZpbmQoKHMpID0+IHMuaWQgPT09IHN0ZXBJZCk7XG4gICAgICAgIGlmIChzdGVwKSB7XG4gICAgICAgICAgICBzdGVwLnN0YXR1cyA9IFwiYXBwcm92ZWRcIjtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlRmluYWxQcm9tcHQoc2Vzc2lvbik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWplY3QgYSBzdGVwXG4gICAgICovXG4gICAgcmVqZWN0U3RlcChzZXNzaW9uOiBPcHRpbWl6YXRpb25TZXNzaW9uLCBzdGVwSWQ6IG51bWJlcik6IHZvaWQge1xuICAgICAgICBjb25zdCBzdGVwID0gc2Vzc2lvbi5zdGVwcy5maW5kKChzKSA9PiBzLmlkID09PSBzdGVwSWQpO1xuICAgICAgICBpZiAoc3RlcCkge1xuICAgICAgICAgICAgc3RlcC5zdGF0dXMgPSBcInJlamVjdGVkXCI7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUZpbmFsUHJvbXB0KHNlc3Npb24pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTW9kaWZ5IGEgc3RlcFxuICAgICAqL1xuICAgIG1vZGlmeVN0ZXAoXG4gICAgICAgIHNlc3Npb246IE9wdGltaXphdGlvblNlc3Npb24sXG4gICAgICAgIHN0ZXBJZDogbnVtYmVyLFxuICAgICAgICBuZXdDb250ZW50OiBzdHJpbmcsXG4gICAgKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHN0ZXAgPSBzZXNzaW9uLnN0ZXBzLmZpbmQoKHMpID0+IHMuaWQgPT09IHN0ZXBJZCk7XG4gICAgICAgIGlmIChzdGVwKSB7XG4gICAgICAgICAgICBzdGVwLm1vZGlmaWVkQ29udGVudCA9IG5ld0NvbnRlbnQ7XG4gICAgICAgICAgICBzdGVwLnN0YXR1cyA9IFwibW9kaWZpZWRcIjtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlRmluYWxQcm9tcHQoc2Vzc2lvbik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBcHByb3ZlIGFsbCBzdGVwc1xuICAgICAqL1xuICAgIGFwcHJvdmVBbGwoc2Vzc2lvbjogT3B0aW1pemF0aW9uU2Vzc2lvbik6IHZvaWQge1xuICAgICAgICBmb3IgKGNvbnN0IHN0ZXAgb2Ygc2Vzc2lvbi5zdGVwcykge1xuICAgICAgICAgICAgaWYgKHN0ZXAuc3RhdHVzID09PSBcInBlbmRpbmdcIikge1xuICAgICAgICAgICAgICAgIHN0ZXAuc3RhdHVzID0gXCJhcHByb3ZlZFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMudXBkYXRlRmluYWxQcm9tcHQoc2Vzc2lvbik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2tpcCBvcHRpbWl6YXRpb24gKHJlamVjdCBhbGwgbm9uLWFuYWx5c2lzIHN0ZXBzKVxuICAgICAqL1xuICAgIHNraXBPcHRpbWl6YXRpb24oc2Vzc2lvbjogT3B0aW1pemF0aW9uU2Vzc2lvbik6IHZvaWQge1xuICAgICAgICBmb3IgKGNvbnN0IHN0ZXAgb2Ygc2Vzc2lvbi5zdGVwcykge1xuICAgICAgICAgICAgaWYgKHN0ZXAudGVjaG5pcXVlICE9PSBcImFuYWx5c2lzXCIpIHtcbiAgICAgICAgICAgICAgICBzdGVwLnN0YXR1cyA9IFwicmVqZWN0ZWRcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnVwZGF0ZUZpbmFsUHJvbXB0KHNlc3Npb24pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNhdmUgcHJlZmVyZW5jZSB0byBhbHdheXMgc2tpcCBhIHRlY2huaXF1ZVxuICAgICAqL1xuICAgIHNhdmVTa2lwUHJlZmVyZW5jZSh0ZWNobmlxdWVJZDogVGVjaG5pcXVlSWQpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLnByZWZlcmVuY2VzLnNraXBUZWNobmlxdWVzLmluY2x1ZGVzKHRlY2huaXF1ZUlkKSkge1xuICAgICAgICAgICAgdGhpcy5wcmVmZXJlbmNlcy5za2lwVGVjaG5pcXVlcy5wdXNoKHRlY2huaXF1ZUlkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNhdmUgY3VzdG9tIHBlcnNvbmEgZm9yIGEgZG9tYWluXG4gICAgICovXG4gICAgc2F2ZUN1c3RvbVBlcnNvbmEoXG4gICAgICAgIGRvbWFpbjpcbiAgICAgICAgICAgIHwgXCJzZWN1cml0eVwiXG4gICAgICAgICAgICB8IFwiZnJvbnRlbmRcIlxuICAgICAgICAgICAgfCBcImJhY2tlbmRcIlxuICAgICAgICAgICAgfCBcImRhdGFiYXNlXCJcbiAgICAgICAgICAgIHwgXCJkZXZvcHNcIlxuICAgICAgICAgICAgfCBcImFyY2hpdGVjdHVyZVwiXG4gICAgICAgICAgICB8IFwidGVzdGluZ1wiXG4gICAgICAgICAgICB8IFwiZ2VuZXJhbFwiLFxuICAgICAgICBwZXJzb25hOiBzdHJpbmcsXG4gICAgKTogdm9pZCB7XG4gICAgICAgIHRoaXMucHJlZmVyZW5jZXMuY3VzdG9tUGVyc29uYXNbZG9tYWluXSA9IHBlcnNvbmE7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVG9nZ2xlIGF1dG8tYXBwcm92ZVxuICAgICAqL1xuICAgIHRvZ2dsZUF1dG9BcHByb3ZlKGVuYWJsZWQ/OiBib29sZWFuKTogdm9pZCB7XG4gICAgICAgIHRoaXMuY29uZmlnLmF1dG9BcHByb3ZlID1cbiAgICAgICAgICAgIGVuYWJsZWQgIT09IHVuZGVmaW5lZCA/IGVuYWJsZWQgOiAhdGhpcy5jb25maWcuYXV0b0FwcHJvdmU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IHZlcmJvc2l0eVxuICAgICAqL1xuICAgIHNldFZlcmJvc2l0eSh2ZXJib3NpdHk6IFwicXVpZXRcIiB8IFwibm9ybWFsXCIgfCBcInZlcmJvc2VcIik6IHZvaWQge1xuICAgICAgICB0aGlzLmNvbmZpZy52ZXJib3NpdHkgPSB2ZXJib3NpdHk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlIGV4cGVjdGVkIGltcHJvdmVtZW50XG4gICAgICovXG4gICAgY2FsY3VsYXRlRXhwZWN0ZWRJbXByb3ZlbWVudChcbiAgICAgICAgc2Vzc2lvbjogT3B0aW1pemF0aW9uU2Vzc2lvbixcbiAgICApOiBFeHBlY3RlZEltcHJvdmVtZW50IHtcbiAgICAgICAgY29uc3QgYXBwcm92ZWRUZWNobmlxdWVzID0gc2Vzc2lvbi5zdGVwcy5maWx0ZXIoXG4gICAgICAgICAgICAocykgPT4gcy5zdGF0dXMgPT09IFwiYXBwcm92ZWRcIiB8fCBzLnN0YXR1cyA9PT0gXCJtb2RpZmllZFwiLFxuICAgICAgICApO1xuICAgICAgICBjb25zdCB0ZWNobmlxdWVzQXBwbGllZCA9IGFwcHJvdmVkVGVjaG5pcXVlcy5tYXAoKHMpID0+IHMudGVjaG5pcXVlKTtcblxuICAgICAgICAvLyBBcHByb3hpbWF0ZSBxdWFsaXR5IGltcHJvdmVtZW50IGJhc2VkIG9uIHJlc2VhcmNoXG4gICAgICAgIGNvbnN0IGltcHJvdmVtZW50TWFwOiBSZWNvcmQ8VGVjaG5pcXVlSWQsIG51bWJlcj4gPSB7XG4gICAgICAgICAgICBhbmFseXNpczogNSxcbiAgICAgICAgICAgIGV4cGVydF9wZXJzb25hOiA2MCxcbiAgICAgICAgICAgIHJlYXNvbmluZ19jaGFpbjogNDYsXG4gICAgICAgICAgICBzdGFrZXNfbGFuZ3VhZ2U6IDQ1LFxuICAgICAgICAgICAgY2hhbGxlbmdlX2ZyYW1pbmc6IDExNSxcbiAgICAgICAgICAgIHNlbGZfZXZhbHVhdGlvbjogMTAsXG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IHRvdGFsSW1wcm92ZW1lbnQgPSAwO1xuICAgICAgICBmb3IgKGNvbnN0IHRlY2huaXF1ZUlkIG9mIHRlY2huaXF1ZXNBcHBsaWVkKSB7XG4gICAgICAgICAgICB0b3RhbEltcHJvdmVtZW50ICs9IGltcHJvdmVtZW50TWFwW3RlY2huaXF1ZUlkXSB8fCAwO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2FwIGF0IHJlYXNvbmFibGUgbWF4aW11bSAoZGltaW5pc2hpbmcgcmV0dXJucylcbiAgICAgICAgY29uc3QgZWZmZWN0aXZlSW1wcm92ZW1lbnQgPSBNYXRoLm1pbih0b3RhbEltcHJvdmVtZW50LCAxNTApO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBxdWFsaXR5SW1wcm92ZW1lbnQ6IGVmZmVjdGl2ZUltcHJvdmVtZW50LFxuICAgICAgICAgICAgdGVjaG5pcXVlc0FwcGxpZWQsXG4gICAgICAgICAgICByZXNlYXJjaEJhc2lzOlxuICAgICAgICAgICAgICAgIFwiQ29tYmluZWQgcmVzZWFyY2gtYmFja2VkIHRlY2huaXF1ZXMgKE1CWlVBSSwgR29vZ2xlIERlZXBNaW5kLCBJQ0xSIDIwMjQpXCIsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHNlc3Npb24gc3VtbWFyeVxuICAgICAqL1xuICAgIGdldFNlc3Npb25TdW1tYXJ5KHNlc3Npb246IE9wdGltaXphdGlvblNlc3Npb24pOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBpbXByb3ZlbWVudCA9IHRoaXMuY2FsY3VsYXRlRXhwZWN0ZWRJbXByb3ZlbWVudChzZXNzaW9uKTtcbiAgICAgICAgY29uc3QgYXBwcm92ZWRDb3VudCA9IHNlc3Npb24uc3RlcHMuZmlsdGVyKFxuICAgICAgICAgICAgKHMpID0+IHMuc3RhdHVzID09PSBcImFwcHJvdmVkXCIgfHwgcy5zdGF0dXMgPT09IFwibW9kaWZpZWRcIixcbiAgICAgICAgKS5sZW5ndGg7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIGBPcHRpbWl6YXRpb24gU2Vzc2lvbiAke3Nlc3Npb24uaWR9XFxuYCArXG4gICAgICAgICAgICBgICBDb21wbGV4aXR5OiAke3Nlc3Npb24uY29tcGxleGl0eX1cXG5gICtcbiAgICAgICAgICAgIGAgIERvbWFpbjogJHtzZXNzaW9uLmRvbWFpbn1cXG5gICtcbiAgICAgICAgICAgIGAgIFN0ZXBzIEFwcGxpZWQ6ICR7YXBwcm92ZWRDb3VudH0vJHtzZXNzaW9uLnN0ZXBzLmxlbmd0aH1cXG5gICtcbiAgICAgICAgICAgIGAgIEV4cGVjdGVkIEltcHJvdmVtZW50OiB+JHtpbXByb3ZlbWVudC5xdWFsaXR5SW1wcm92ZW1lbnR9JWBcbiAgICAgICAgKTtcbiAgICB9XG59XG4iLAogICAgIi8qKlxuICogRGlzY29yZCBXZWJob29rIEludGVncmF0aW9uXG4gKlxuICogU2VuZHMgbm90aWZpY2F0aW9ucyB0byBEaXNjb3JkIGNoYW5uZWxzIHZpYSB3ZWJob29rcy5cbiAqIFN1cHBvcnRzIHJpY2ggZW1iZWRzIGZvciBjeWNsZSBwcm9ncmVzcywgZXJyb3JzLCBhbmQgY29tcGxldGlvbnMuXG4gKi9cblxuaW1wb3J0IHsgTG9nIH0gZnJvbSBcIi4vbG9nXCI7XG5cbmNvbnN0IGxvZyA9IExvZy5jcmVhdGUoeyBzZXJ2aWNlOiBcImRpc2NvcmQtd2ViaG9va1wiIH0pO1xuXG5leHBvcnQgaW50ZXJmYWNlIERpc2NvcmRXZWJob29rT3B0aW9ucyB7XG4gICAgLyoqIERpc2NvcmQgd2ViaG9vayBVUkwgKi9cbiAgICB3ZWJob29rVXJsOiBzdHJpbmc7XG4gICAgLyoqIEJvdCB1c2VybmFtZSAob3B0aW9uYWwsIGRlZmF1bHRzIHRvIFwiUmFscGhcIikgKi9cbiAgICB1c2VybmFtZT86IHN0cmluZztcbiAgICAvKiogQm90IGF2YXRhciBVUkwgKG9wdGlvbmFsKSAqL1xuICAgIGF2YXRhclVybD86IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEaXNjb3JkRW1iZWQge1xuICAgIC8qKiBFbWJlZCB0aXRsZSAqL1xuICAgIHRpdGxlPzogc3RyaW5nO1xuICAgIC8qKiBFbWJlZCBkZXNjcmlwdGlvbiAqL1xuICAgIGRlc2NyaXB0aW9uPzogc3RyaW5nO1xuICAgIC8qKiBFbWJlZCBjb2xvciAoZGVjaW1hbCwgZS5nLiwgMHgwMEZGMDAgZm9yIGdyZWVuKSAqL1xuICAgIGNvbG9yPzogbnVtYmVyO1xuICAgIC8qKiBGb290ZXIgdGV4dCAqL1xuICAgIGZvb3Rlcj86IHN0cmluZztcbiAgICAvKiogRm9vdGVyIGljb24gVVJMICovXG4gICAgZm9vdGVySWNvblVybD86IHN0cmluZztcbiAgICAvKiogVGltZXN0YW1wIChJU08gODYwMSBmb3JtYXQpICovXG4gICAgdGltZXN0YW1wPzogc3RyaW5nO1xuICAgIC8qKiBUaHVtYm5haWwgaW1hZ2UgVVJMICovXG4gICAgdGh1bWJuYWlsVXJsPzogc3RyaW5nO1xuICAgIC8qKiBJbWFnZSBVUkwgKi9cbiAgICBpbWFnZVVybD86IHN0cmluZztcbiAgICAvKiogQXV0aG9yIG5hbWUgKi9cbiAgICBhdXRob3JOYW1lPzogc3RyaW5nO1xuICAgIC8qKiBBdXRob3IgVVJMICovXG4gICAgYXV0aG9yVXJsPzogc3RyaW5nO1xuICAgIC8qKiBBdXRob3IgaWNvbiBVUkwgKi9cbiAgICBhdXRob3JJY29uVXJsPzogc3RyaW5nO1xuICAgIC8qKiBGaWVsZHMgKG5hbWUvdmFsdWUgcGFpcnMpICovXG4gICAgZmllbGRzPzogQXJyYXk8e1xuICAgICAgICBuYW1lOiBzdHJpbmc7XG4gICAgICAgIHZhbHVlOiBzdHJpbmc7XG4gICAgICAgIGlubGluZT86IGJvb2xlYW47XG4gICAgfT47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGlzY29yZE1lc3NhZ2Uge1xuICAgIC8qKiBNZXNzYWdlIGNvbnRlbnQgKHBsYWluIHRleHQpICovXG4gICAgY29udGVudD86IHN0cmluZztcbiAgICAvKiogVXNlcm5hbWUgb3ZlcnJpZGUgKi9cbiAgICB1c2VybmFtZT86IHN0cmluZztcbiAgICAvKiogQXZhdGFyIFVSTCBvdmVycmlkZSAqL1xuICAgIGF2YXRhclVybD86IHN0cmluZztcbiAgICAvKiogV2hldGhlciB0byBwcm9jZXNzIEBldmVyeW9uZSBtZW50aW9ucyAqL1xuICAgIHR0cz86IGJvb2xlYW47XG4gICAgLyoqIEVtYmVkcyB0byBzZW5kICovXG4gICAgZW1iZWRzPzogRGlzY29yZEVtYmVkW107XG59XG5cbi8qKlxuICogRGlzY29yZCBXZWJob29rIENsaWVudFxuICovXG5leHBvcnQgY2xhc3MgRGlzY29yZFdlYmhvb2tDbGllbnQge1xuICAgIHByaXZhdGUgd2ViaG9va1VybDogc3RyaW5nO1xuICAgIHByaXZhdGUgdXNlcm5hbWU6IHN0cmluZztcbiAgICBwcml2YXRlIGF2YXRhclVybD86IHN0cmluZztcbiAgICBwcml2YXRlIGVuYWJsZWQgPSBmYWxzZTtcblxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IERpc2NvcmRXZWJob29rT3B0aW9ucykge1xuICAgICAgICB0aGlzLndlYmhvb2tVcmwgPSBvcHRpb25zLndlYmhvb2tVcmw7XG4gICAgICAgIHRoaXMudXNlcm5hbWUgPSBvcHRpb25zLnVzZXJuYW1lID8/IFwiUmFscGhcIjtcbiAgICAgICAgdGhpcy5hdmF0YXJVcmwgPSBvcHRpb25zLmF2YXRhclVybDtcbiAgICAgICAgdGhpcy5lbmFibGVkID0gdHJ1ZTtcblxuICAgICAgICAvLyBWYWxpZGF0ZSB3ZWJob29rIFVSTCBmb3JtYXRcbiAgICAgICAgaWYgKCF0aGlzLndlYmhvb2tVcmwgfHwgIXRoaXMuaXNWYWxpZFdlYmhvb2tVcmwodGhpcy53ZWJob29rVXJsKSkge1xuICAgICAgICAgICAgbG9nLndhcm4oXCJJbnZhbGlkIERpc2NvcmQgd2ViaG9vayBVUkwsIG5vdGlmaWNhdGlvbnMgZGlzYWJsZWRcIiwge1xuICAgICAgICAgICAgICAgIHdlYmhvb2tVcmw6IHRoaXMubWFza1dlYmhvb2tVcmwodGhpcy53ZWJob29rVXJsKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5lbmFibGVkID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBsb2cuaW5mbyhcIkRpc2NvcmQgd2ViaG9vayBjbGllbnQgaW5pdGlhbGl6ZWRcIiwge1xuICAgICAgICAgICAgZW5hYmxlZDogdGhpcy5lbmFibGVkLFxuICAgICAgICAgICAgdXNlcm5hbWU6IHRoaXMudXNlcm5hbWUsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNWYWxpZFdlYmhvb2tVcmwodXJsOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgLy8gRGlzY29yZCB3ZWJob29rIFVSTHMgbG9vayBsaWtlOiBodHRwczovL2Rpc2NvcmQuY29tL2FwaS93ZWJob29rcy97aWR9L3t0b2tlbn1cbiAgICAgICAgcmV0dXJuIC9eaHR0cHM6XFwvXFwvZGlzY29yZCg/OmFwcCk/XFwuY29tXFwvYXBpXFwvd2ViaG9va3NcXC9cXGQrXFwvW2EtekEtWjAtOV8tXSskLy50ZXN0KFxuICAgICAgICAgICAgdXJsLFxuICAgICAgICApO1xuICAgIH1cblxuICAgIHByaXZhdGUgbWFza1dlYmhvb2tVcmwodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICBpZiAoIXVybCkgcmV0dXJuIFwiKG5vdCBzZXQpXCI7XG4gICAgICAgIC8vIE1hc2sgdGhlIHRva2VuIHBhcnRcbiAgICAgICAgcmV0dXJuIHVybC5yZXBsYWNlKC9cXC9bYS16QS1aMC05Xy1dKyQvLCBcIi8qKioqKioqKlwiKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZW5kIGEgbWVzc2FnZSB0byBEaXNjb3JkXG4gICAgICovXG4gICAgYXN5bmMgc2VuZChtZXNzYWdlOiBEaXNjb3JkTWVzc2FnZSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICBpZiAoIXRoaXMuZW5hYmxlZCkge1xuICAgICAgICAgICAgbG9nLmRlYnVnKFwiRGlzY29yZCBub3RpZmljYXRpb25zIGRpc2FibGVkLCBza2lwcGluZyBzZW5kXCIpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHBheWxvYWQ6IERpc2NvcmRNZXNzYWdlID0ge1xuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IG1lc3NhZ2UuY29udGVudCxcbiAgICAgICAgICAgICAgICB1c2VybmFtZTogbWVzc2FnZS51c2VybmFtZSA/PyB0aGlzLnVzZXJuYW1lLFxuICAgICAgICAgICAgICAgIGF2YXRhclVybDogbWVzc2FnZS5hdmF0YXJVcmwgPz8gdGhpcy5hdmF0YXJVcmwsXG4gICAgICAgICAgICAgICAgdHRzOiBtZXNzYWdlLnR0cyA/PyBmYWxzZSxcbiAgICAgICAgICAgICAgICBlbWJlZHM6IG1lc3NhZ2UuZW1iZWRzLFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgbG9nLmRlYnVnKFwiU2VuZGluZyBEaXNjb3JkIG5vdGlmaWNhdGlvblwiLCB7XG4gICAgICAgICAgICAgICAgaGFzQ29udGVudDogISFtZXNzYWdlLmNvbnRlbnQsXG4gICAgICAgICAgICAgICAgZW1iZWRDb3VudDogbWVzc2FnZS5lbWJlZHM/Lmxlbmd0aCA/PyAwLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godGhpcy53ZWJob29rVXJsLCB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkocGF5bG9hZCksXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yVGV4dCA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbiAgICAgICAgICAgICAgICBsb2cuZXJyb3IoXCJEaXNjb3JkIHdlYmhvb2sgcmVxdWVzdCBmYWlsZWRcIiwge1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IHJlc3BvbnNlLnN0YXR1cyxcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzVGV4dDogcmVzcG9uc2Uuc3RhdHVzVGV4dCxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yVGV4dCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxvZy5kZWJ1ZyhcIkRpc2NvcmQgbm90aWZpY2F0aW9uIHNlbnQgc3VjY2Vzc2Z1bGx5XCIpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBsb2cuZXJyb3IoXCJGYWlsZWQgdG8gc2VuZCBEaXNjb3JkIG5vdGlmaWNhdGlvblwiLCB7XG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2VuZCBhIHNpbXBsZSB0ZXh0IG1lc3NhZ2VcbiAgICAgKi9cbiAgICBhc3luYyBub3RpZnkoY29udGVudDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIHJldHVybiB0aGlzLnNlbmQoeyBjb250ZW50IH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNlbmQgYW4gZW1iZWQgbWVzc2FnZVxuICAgICAqL1xuICAgIGFzeW5jIG5vdGlmeVdpdGhFbWJlZChcbiAgICAgICAgZW1iZWQ6IERpc2NvcmRFbWJlZCxcbiAgICAgICAgY29udGVudD86IHN0cmluZyxcbiAgICApOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VuZCh7XG4gICAgICAgICAgICBjb250ZW50LFxuICAgICAgICAgICAgZW1iZWRzOiBbZW1iZWRdLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZW5kIGN5Y2xlIHN0YXJ0IG5vdGlmaWNhdGlvblxuICAgICAqL1xuICAgIGFzeW5jIG5vdGlmeUN5Y2xlU3RhcnQoXG4gICAgICAgIGN5Y2xlTnVtYmVyOiBudW1iZXIsXG4gICAgICAgIG1heEN5Y2xlczogbnVtYmVyLFxuICAgICAgICBwcm9tcHQ6IHN0cmluZyxcbiAgICApOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgY29uc3QgZW1iZWQ6IERpc2NvcmRFbWJlZCA9IHtcbiAgICAgICAgICAgIHRpdGxlOiBg8J+UhCBDeWNsZSAke2N5Y2xlTnVtYmVyfS8ke21heEN5Y2xlc30gU3RhcnRlZGAsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogYFxcYFxcYFxcYFxcbiR7cHJvbXB0LnNsaWNlKDAsIDUwMCl9JHtwcm9tcHQubGVuZ3RoID4gNTAwID8gXCIuLi5cIiA6IFwiXCJ9XFxuXFxgXFxgXFxgYCxcbiAgICAgICAgICAgIGNvbG9yOiAweDU4NjVmMiwgLy8gRGlzY29yZCBibHVycGxlXG4gICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICAgIGZpZWxkczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogXCLwn5OLIFBoYXNlXCIsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBcIlJlc2VhcmNoIOKGkiBTcGVjaWZ5IOKGkiBQbGFuIOKGkiBXb3JrIOKGkiBSZXZpZXdcIixcbiAgICAgICAgICAgICAgICAgICAgaW5saW5lOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIuKPse+4jyBTdGF0dXNcIixcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IFwiUnVubmluZ1wiLFxuICAgICAgICAgICAgICAgICAgICBpbmxpbmU6IHRydWUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHRoaXMubm90aWZ5V2l0aEVtYmVkKFxuICAgICAgICAgICAgZW1iZWQsXG4gICAgICAgICAgICBg8J+agCAqKlJhbHBoIEN5Y2xlICR7Y3ljbGVOdW1iZXJ9LyR7bWF4Q3ljbGVzfSBTdGFydGVkKipgLFxuICAgICAgICApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNlbmQgY3ljbGUgY29tcGxldGlvbiBub3RpZmljYXRpb25cbiAgICAgKi9cbiAgICBhc3luYyBub3RpZnlDeWNsZUNvbXBsZXRlKFxuICAgICAgICBjeWNsZU51bWJlcjogbnVtYmVyLFxuICAgICAgICBjb21wbGV0ZWRDeWNsZXM6IG51bWJlcixcbiAgICAgICAgc3VtbWFyeTogc3RyaW5nLFxuICAgICAgICBkdXJhdGlvbk1zOiBudW1iZXIsXG4gICAgKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIGNvbnN0IGR1cmF0aW9uTWludXRlcyA9IE1hdGguZmxvb3IoZHVyYXRpb25NcyAvIDYwMDAwKTtcbiAgICAgICAgY29uc3QgZHVyYXRpb25TZWNvbmRzID0gTWF0aC5mbG9vcigoZHVyYXRpb25NcyAlIDYwMDAwKSAvIDEwMDApO1xuXG4gICAgICAgIGNvbnN0IGVtYmVkOiBEaXNjb3JkRW1iZWQgPSB7XG4gICAgICAgICAgICB0aXRsZTogYOKchSBDeWNsZSAke2N5Y2xlTnVtYmVyfSBDb21wbGV0ZWRgLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IHN1bW1hcnkuc2xpY2UoMCwgMjAwMCkgfHwgXCJObyBzdW1tYXJ5IGF2YWlsYWJsZVwiLFxuICAgICAgICAgICAgY29sb3I6IDB4NTdmMjg3LCAvLyBEaXNjb3JkIGdyZWVuXG4gICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICAgIGZpZWxkczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogXCLwn5OKIFByb2dyZXNzXCIsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBgJHtjb21wbGV0ZWRDeWNsZXN9IGN5Y2xlcyBjb21wbGV0ZWRgLFxuICAgICAgICAgICAgICAgICAgICBpbmxpbmU6IHRydWUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IFwi4o+x77iPIER1cmF0aW9uXCIsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBgJHtkdXJhdGlvbk1pbnV0ZXN9bSAke2R1cmF0aW9uU2Vjb25kc31zYCxcbiAgICAgICAgICAgICAgICAgICAgaW5saW5lOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiB0aGlzLm5vdGlmeVdpdGhFbWJlZChcbiAgICAgICAgICAgIGVtYmVkLFxuICAgICAgICAgICAgYOKchSAqKlJhbHBoIEN5Y2xlICR7Y3ljbGVOdW1iZXJ9IENvbXBsZXRlKipgLFxuICAgICAgICApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNlbmQgcGhhc2UgY29tcGxldGlvbiBub3RpZmljYXRpb25cbiAgICAgKi9cbiAgICBhc3luYyBub3RpZnlQaGFzZUNvbXBsZXRlKFxuICAgICAgICBjeWNsZU51bWJlcjogbnVtYmVyLFxuICAgICAgICBwaGFzZTogc3RyaW5nLFxuICAgICAgICBzdW1tYXJ5OiBzdHJpbmcsXG4gICAgKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIGNvbnN0IGVtYmVkOiBEaXNjb3JkRW1iZWQgPSB7XG4gICAgICAgICAgICB0aXRsZTogYPCfk50gUGhhc2UgQ29tcGxldGU6ICR7cGhhc2V9YCxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBzdW1tYXJ5LnNsaWNlKDAsIDEwMDApLFxuICAgICAgICAgICAgY29sb3I6IDB4ZmVlNzVjLCAvLyBEaXNjb3JkIHllbGxvd1xuICAgICAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICBmaWVsZHM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IFwi8J+UhCBDeWNsZVwiLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogU3RyaW5nKGN5Y2xlTnVtYmVyKSxcbiAgICAgICAgICAgICAgICAgICAgaW5saW5lOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiB0aGlzLm5vdGlmeVdpdGhFbWJlZChlbWJlZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2VuZCBlcnJvciBub3RpZmljYXRpb25cbiAgICAgKi9cbiAgICBhc3luYyBub3RpZnlFcnJvcihcbiAgICAgICAgY3ljbGVOdW1iZXI6IG51bWJlcixcbiAgICAgICAgcGhhc2U6IHN0cmluZyxcbiAgICAgICAgZXJyb3I6IHN0cmluZyxcbiAgICApOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgY29uc3QgZW1iZWQ6IERpc2NvcmRFbWJlZCA9IHtcbiAgICAgICAgICAgIHRpdGxlOiBg4p2MIEVycm9yIGluIEN5Y2xlICR7Y3ljbGVOdW1iZXJ9YCxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBgKipQaGFzZToqKiAke3BoYXNlfVxcblxcbioqRXJyb3I6KipcXG5cXGBcXGBcXGBcXG4ke2Vycm9yLnNsaWNlKDAsIDE1MDApfVxcblxcYFxcYFxcYGAsXG4gICAgICAgICAgICBjb2xvcjogMHhlZDQyNDUsIC8vIERpc2NvcmQgcmVkXG4gICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gdGhpcy5ub3RpZnlXaXRoRW1iZWQoZW1iZWQsIFwi8J+aqCAqKlJhbHBoIEVycm9yKipcIik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2VuZCB0aW1lb3V0IG5vdGlmaWNhdGlvblxuICAgICAqL1xuICAgIGFzeW5jIG5vdGlmeVRpbWVvdXQoXG4gICAgICAgIGN5Y2xlTnVtYmVyOiBudW1iZXIsXG4gICAgICAgIHBoYXNlOiBzdHJpbmcsXG4gICAgICAgIHRpbWVvdXRNczogbnVtYmVyLFxuICAgICk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICBjb25zdCB0aW1lb3V0TWludXRlcyA9IE1hdGguZmxvb3IodGltZW91dE1zIC8gNjAwMDApO1xuXG4gICAgICAgIGNvbnN0IGVtYmVkOiBEaXNjb3JkRW1iZWQgPSB7XG4gICAgICAgICAgICB0aXRsZTogYOKPsCBUaW1lb3V0IGluIEN5Y2xlICR7Y3ljbGVOdW1iZXJ9YCxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBgKipQaGFzZToqKiAke3BoYXNlfVxcbioqVGltZW91dDoqKiAke3RpbWVvdXRNaW51dGVzfSBtaW51dGVzYCxcbiAgICAgICAgICAgIGNvbG9yOiAweGViNDU5ZSwgLy8gRGlzY29yZCBwaW5rXG4gICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gdGhpcy5ub3RpZnlXaXRoRW1iZWQoZW1iZWQsIFwi4o+wICoqUmFscGggVGltZW91dCoqXCIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNlbmQgcnVuIGNvbXBsZXRpb24gbm90aWZpY2F0aW9uXG4gICAgICovXG4gICAgYXN5bmMgbm90aWZ5UnVuQ29tcGxldGUoXG4gICAgICAgIHRvdGFsQ3ljbGVzOiBudW1iZXIsXG4gICAgICAgIGR1cmF0aW9uTXM6IG51bWJlcixcbiAgICAgICAgZmluYWxTdW1tYXJ5OiBzdHJpbmcsXG4gICAgKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIGNvbnN0IGR1cmF0aW9uSG91cnMgPSBNYXRoLmZsb29yKGR1cmF0aW9uTXMgLyAzNjAwMDAwKTtcbiAgICAgICAgY29uc3QgZHVyYXRpb25NaW51dGVzID0gTWF0aC5mbG9vcigoZHVyYXRpb25NcyAlIDM2MDAwMDApIC8gNjAwMDApO1xuXG4gICAgICAgIGNvbnN0IGVtYmVkOiBEaXNjb3JkRW1iZWQgPSB7XG4gICAgICAgICAgICB0aXRsZTogXCLwn4+BIFJ1biBDb21wbGV0ZVwiLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IGZpbmFsU3VtbWFyeS5zbGljZSgwLCAyMDAwKSxcbiAgICAgICAgICAgIGNvbG9yOiAweDU3ZjI4NywgLy8gRGlzY29yZCBncmVlblxuICAgICAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICBmaWVsZHM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IFwi8J+UhCBUb3RhbCBDeWNsZXNcIixcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IFN0cmluZyh0b3RhbEN5Y2xlcyksXG4gICAgICAgICAgICAgICAgICAgIGlubGluZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogXCLij7HvuI8gVG90YWwgRHVyYXRpb25cIixcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6XG4gICAgICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbkhvdXJzID4gMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gYCR7ZHVyYXRpb25Ib3Vyc31oICR7ZHVyYXRpb25NaW51dGVzfW1gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBgJHtkdXJhdGlvbk1pbnV0ZXN9bWAsXG4gICAgICAgICAgICAgICAgICAgIGlubGluZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gdGhpcy5ub3RpZnlXaXRoRW1iZWQoZW1iZWQsIFwi8J+PgSAqKlJhbHBoIFJ1biBDb21wbGV0ZSoqXCIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNlbmQgc3R1Y2svYWJvcnQgbm90aWZpY2F0aW9uXG4gICAgICovXG4gICAgYXN5bmMgbm90aWZ5U3R1Y2tPckFib3J0ZWQoXG4gICAgICAgIGN5Y2xlTnVtYmVyOiBudW1iZXIsXG4gICAgICAgIHJlYXNvbjogc3RyaW5nLFxuICAgICk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICBjb25zdCBlbWJlZDogRGlzY29yZEVtYmVkID0ge1xuICAgICAgICAgICAgdGl0bGU6IGDwn5uRIFJ1biAke3JlYXNvbn1gLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IGBDeWNsZSAke2N5Y2xlTnVtYmVyfSByZWFjaGVkIHN0dWNrIHRocmVzaG9sZCBvciB3YXMgYWJvcnRlZGAsXG4gICAgICAgICAgICBjb2xvcjogMHg1ODY1ZjIsIC8vIERpc2NvcmQgYmx1cnBsZVxuICAgICAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHRoaXMubm90aWZ5V2l0aEVtYmVkKGVtYmVkLCBg8J+bkSAqKlJhbHBoICR7cmVhc29ufSoqYCk7XG4gICAgfVxufVxuXG4vKipcbiAqIENyZWF0ZSBhIERpc2NvcmQgd2ViaG9vayBjbGllbnQgZnJvbSBlbnZpcm9ubWVudCB2YXJpYWJsZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZURpc2NvcmRXZWJob29rRnJvbUVudigpOiBEaXNjb3JkV2ViaG9va0NsaWVudCB8IG51bGwge1xuICAgIGNvbnN0IHdlYmhvb2tVcmwgPSBwcm9jZXNzLmVudi5ESVNDT1JEX1dFQkhPT0tfVVJMPy50cmltKCk7XG5cbiAgICBpZiAoIXdlYmhvb2tVcmwpIHtcbiAgICAgICAgbG9nLmRlYnVnKFxuICAgICAgICAgICAgXCJObyBESVNDT1JEX1dFQkhPT0tfVVJMIGVudiB2YXIgc2V0LCBEaXNjb3JkIG5vdGlmaWNhdGlvbnMgZGlzYWJsZWRcIixcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBEaXNjb3JkV2ViaG9va0NsaWVudCh7XG4gICAgICAgIHdlYmhvb2tVcmwsXG4gICAgICAgIHVzZXJuYW1lOiBwcm9jZXNzLmVudi5ESVNDT1JEX0JPVF9VU0VSTkFNRSA/PyBcIlJhbHBoXCIsXG4gICAgICAgIGF2YXRhclVybDogcHJvY2Vzcy5lbnYuRElTQ09SRF9CT1RfQVZBVEFSX1VSTCxcbiAgICB9KTtcbn1cbiIsCiAgICAiLyoqXG4gKiBGbG93IFN0b3JlIC0gU3RhdGUgcGVyc2lzdGVuY2UgbGF5ZXIgZm9yIFJhbHBoIExvb3AgUnVubmVyXG4gKlxuICogUGVyc2lzdHMgcnVuIHN0YXRlIHRvIGAuYWktZW5nL3J1bnMvPHJ1bklkPi8uZmxvdy9gOlxuICogLSBzdGF0ZS5qc29uOiBNYWluIHJ1biBzdGF0ZVxuICogLSBjaGVja3BvaW50Lmpzb246IExhc3Qgc3VjY2Vzc2Z1bCBjaGVja3BvaW50IGZvciBmYXN0IHJlc3VtZVxuICogLSBpdGVyYXRpb25zLzxuPi5qc29uOiBQZXItY3ljbGUgZGV0YWlsZWQgb3V0cHV0c1xuICogLSBjb250ZXh0cy88bj4ubWQ6IFJlLWFuY2hvcmluZyBjb250ZXh0IHNuYXBzaG90c1xuICogLSBnYXRlcy88bj4uanNvbjogUXVhbGl0eSBnYXRlIHJlc3VsdHNcbiAqL1xuXG5pbXBvcnQgeyBleGlzdHNTeW5jLCBta2RpclN5bmMsIHJlYWRGaWxlU3luYywgd3JpdGVGaWxlU3luYyB9IGZyb20gXCJub2RlOmZzXCI7XG5pbXBvcnQgeyBqb2luIH0gZnJvbSBcIm5vZGU6cGF0aFwiO1xuaW1wb3J0IHsgTG9nIH0gZnJvbSBcIi4uL3V0aWwvbG9nXCI7XG5pbXBvcnQgdHlwZSB7IENoZWNrcG9pbnQsIEN5Y2xlU3RhdGUsIEZsb3dTdGF0ZSB9IGZyb20gXCIuL2Zsb3ctdHlwZXNcIjtcbmltcG9ydCB7IEZMT1dfU0NIRU1BX1ZFUlNJT04sIFJ1blN0YXR1cywgdHlwZSBTdG9wUmVhc29uIH0gZnJvbSBcIi4vZmxvdy10eXBlc1wiO1xuXG5jb25zdCBsb2cgPSBMb2cuY3JlYXRlKHsgc2VydmljZTogXCJmbG93LXN0b3JlXCIgfSk7XG5cbi8qKiBGbG93IHN0b3JlIG9wdGlvbnMgKi9cbmV4cG9ydCBpbnRlcmZhY2UgRmxvd1N0b3JlT3B0aW9ucyB7XG4gICAgZmxvd0Rpcjogc3RyaW5nO1xuICAgIHJ1bklkOiBzdHJpbmc7XG59XG5cbi8qKlxuICogRmxvdyBTdG9yZSAtIG1hbmFnZXMgcGVyc2lzdGVuY2Ugb2YgbG9vcCBydW4gc3RhdGVcbiAqL1xuZXhwb3J0IGNsYXNzIEZsb3dTdG9yZSB7XG4gICAgcHJpdmF0ZSBmbG93RGlyOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBydW5JZDogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczogRmxvd1N0b3JlT3B0aW9ucykge1xuICAgICAgICB0aGlzLmZsb3dEaXIgPSBvcHRpb25zLmZsb3dEaXI7XG4gICAgICAgIHRoaXMucnVuSWQgPSBvcHRpb25zLnJ1bklkO1xuICAgIH1cblxuICAgIC8qKiBHZXQgdGhlIGJhc2UgZmxvdyBkaXJlY3RvcnkgcGF0aCAqL1xuICAgIGdldCBiYXNlUGF0aCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gam9pbih0aGlzLmZsb3dEaXIsIHRoaXMucnVuSWQsIFwiLmZsb3dcIik7XG4gICAgfVxuXG4gICAgLyoqIEdldCBwYXRoIHRvIGEgc3BlY2lmaWMgZmlsZSBpbiAuZmxvdyAqL1xuICAgIHByaXZhdGUgcGF0aChyZWxQYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gam9pbih0aGlzLmJhc2VQYXRoLCByZWxQYXRoKTtcbiAgICB9XG5cbiAgICAvKiogSW5pdGlhbGl6ZSBmbG93IGRpcmVjdG9yeSBzdHJ1Y3R1cmUgKi9cbiAgICBpbml0aWFsaXplKCk6IHZvaWQge1xuICAgICAgICAvLyBDcmVhdGUgLmZsb3cgZGlyZWN0b3J5IGFuZCBzdWJkaXJlY3Rvcmllc1xuICAgICAgICBjb25zdCBkaXJzID0gW1wiaXRlcmF0aW9uc1wiLCBcImNvbnRleHRzXCIsIFwiZ2F0ZXNcIl07XG5cbiAgICAgICAgZm9yIChjb25zdCBkaXIgb2YgZGlycykge1xuICAgICAgICAgICAgY29uc3QgZGlyUGF0aCA9IHRoaXMucGF0aChkaXIpO1xuICAgICAgICAgICAgaWYgKCFleGlzdHNTeW5jKGRpclBhdGgpKSB7XG4gICAgICAgICAgICAgICAgbWtkaXJTeW5jKGRpclBhdGgsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcIkNyZWF0ZWQgZGlyZWN0b3J5XCIsIHsgcGF0aDogZGlyUGF0aCB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGxvZy5pbmZvKFwiRmxvdyBzdG9yZSBpbml0aWFsaXplZFwiLCB7XG4gICAgICAgICAgICBydW5JZDogdGhpcy5ydW5JZCxcbiAgICAgICAgICAgIGJhc2VQYXRoOiB0aGlzLmJhc2VQYXRoLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKiogQ2hlY2sgaWYgZmxvdyBzdGF0ZSBleGlzdHMgKGZvciByZXN1bWUpICovXG4gICAgZXhpc3RzKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gZXhpc3RzU3luYyh0aGlzLnBhdGgoXCJzdGF0ZS5qc29uXCIpKTtcbiAgICB9XG5cbiAgICAvKiogTG9hZCBleGlzdGluZyBydW4gc3RhdGUgZm9yIHJlc3VtZSAqL1xuICAgIGxvYWQoKTogRmxvd1N0YXRlIHwgbnVsbCB7XG4gICAgICAgIGNvbnN0IHN0YXRlUGF0aCA9IHRoaXMucGF0aChcInN0YXRlLmpzb25cIik7XG4gICAgICAgIGlmICghZXhpc3RzU3luYyhzdGF0ZVBhdGgpKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBjb250ZW50ID0gcmVhZEZpbGVTeW5jKHN0YXRlUGF0aCwgXCJ1dGYtOFwiKTtcbiAgICAgICAgICAgIGNvbnN0IHN0YXRlID0gSlNPTi5wYXJzZShjb250ZW50KSBhcyBGbG93U3RhdGU7XG5cbiAgICAgICAgICAgIC8vIFZhbGlkYXRlIHNjaGVtYSB2ZXJzaW9uXG4gICAgICAgICAgICBpZiAoc3RhdGUuc2NoZW1hVmVyc2lvbiAhPT0gRkxPV19TQ0hFTUFfVkVSU0lPTikge1xuICAgICAgICAgICAgICAgIGxvZy53YXJuKFwiRmxvdyBzY2hlbWEgdmVyc2lvbiBtaXNtYXRjaFwiLCB7XG4gICAgICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBGTE9XX1NDSEVNQV9WRVJTSU9OLFxuICAgICAgICAgICAgICAgICAgICBmb3VuZDogc3RhdGUuc2NoZW1hVmVyc2lvbixcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbG9nLmluZm8oXCJMb2FkZWQgZmxvdyBzdGF0ZVwiLCB7XG4gICAgICAgICAgICAgICAgcnVuSWQ6IHN0YXRlLnJ1bklkLFxuICAgICAgICAgICAgICAgIHN0YXR1czogc3RhdGUuc3RhdHVzLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRDeWNsZTogc3RhdGUuY3VycmVudEN5Y2xlLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTXNnID1cbiAgICAgICAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgICAgICBsb2cuZXJyb3IoXCJGYWlsZWQgdG8gbG9hZCBmbG93IHN0YXRlXCIsIHsgZXJyb3I6IGVycm9yTXNnIH0pO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogQ3JlYXRlIGluaXRpYWwgcnVuIHN0YXRlICovXG4gICAgY3JlYXRlSW5pdGlhbFN0YXRlKG9wdGlvbnM6IHtcbiAgICAgICAgcHJvbXB0OiBzdHJpbmc7XG4gICAgICAgIGNvbXBsZXRpb25Qcm9taXNlOiBzdHJpbmc7XG4gICAgICAgIG1heEN5Y2xlczogbnVtYmVyO1xuICAgICAgICBzdHVja1RocmVzaG9sZDogbnVtYmVyO1xuICAgICAgICBnYXRlczogc3RyaW5nW107XG4gICAgfSk6IEZsb3dTdGF0ZSB7XG4gICAgICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcblxuICAgICAgICBjb25zdCBzdGF0ZTogRmxvd1N0YXRlID0ge1xuICAgICAgICAgICAgc2NoZW1hVmVyc2lvbjogRkxPV19TQ0hFTUFfVkVSU0lPTixcbiAgICAgICAgICAgIHJ1bklkOiB0aGlzLnJ1bklkLFxuICAgICAgICAgICAgcHJvbXB0OiBvcHRpb25zLnByb21wdCxcbiAgICAgICAgICAgIHN0YXR1czogUnVuU3RhdHVzLlBFTkRJTkcsXG4gICAgICAgICAgICBjb21wbGV0aW9uUHJvbWlzZTogb3B0aW9ucy5jb21wbGV0aW9uUHJvbWlzZSxcbiAgICAgICAgICAgIG1heEN5Y2xlczogb3B0aW9ucy5tYXhDeWNsZXMsXG4gICAgICAgICAgICBzdHVja1RocmVzaG9sZDogb3B0aW9ucy5zdHVja1RocmVzaG9sZCxcbiAgICAgICAgICAgIGdhdGVzOiBvcHRpb25zLmdhdGVzLFxuICAgICAgICAgICAgY3VycmVudEN5Y2xlOiAwLFxuICAgICAgICAgICAgY29tcGxldGVkQ3ljbGVzOiAwLFxuICAgICAgICAgICAgZmFpbGVkQ3ljbGVzOiAwLFxuICAgICAgICAgICAgc3R1Y2tDb3VudDogMCxcbiAgICAgICAgICAgIGNyZWF0ZWRBdDogbm93LFxuICAgICAgICAgICAgdXBkYXRlZEF0OiBub3csXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5zYXZlU3RhdGUoc3RhdGUpO1xuICAgICAgICByZXR1cm4gc3RhdGU7XG4gICAgfVxuXG4gICAgLyoqIFNhdmUgcnVuIHN0YXRlIHRvIHN0YXRlLmpzb24gKi9cbiAgICBzYXZlU3RhdGUoc3RhdGU6IEZsb3dTdGF0ZSk6IHZvaWQge1xuICAgICAgICBjb25zdCBzdGF0ZVBhdGggPSB0aGlzLnBhdGgoXCJzdGF0ZS5qc29uXCIpO1xuICAgICAgICBzdGF0ZS51cGRhdGVkQXQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIHdyaXRlRmlsZVN5bmMoc3RhdGVQYXRoLCBKU09OLnN0cmluZ2lmeShzdGF0ZSwgbnVsbCwgMikpO1xuICAgICAgICBsb2cuZGVidWcoXCJTYXZlZCBmbG93IHN0YXRlXCIsIHsgcnVuSWQ6IHN0YXRlLnJ1bklkIH0pO1xuICAgIH1cblxuICAgIC8qKiBTYXZlIGEgY2hlY2twb2ludCBmb3IgZmFzdCByZXN1bWUgKi9cbiAgICBzYXZlQ2hlY2twb2ludChcbiAgICAgICAgc3RhdGU6IEZsb3dTdGF0ZSxcbiAgICAgICAgbGFzdFBoYXNlT3V0cHV0czogQ3ljbGVTdGF0ZVtcInBoYXNlc1wiXSxcbiAgICApOiB2b2lkIHtcbiAgICAgICAgY29uc3QgY2hlY2twb2ludFBhdGggPSB0aGlzLnBhdGgoXCJjaGVja3BvaW50Lmpzb25cIik7XG4gICAgICAgIGNvbnN0IGNoZWNrcG9pbnQ6IENoZWNrcG9pbnQgPSB7XG4gICAgICAgICAgICBzY2hlbWFWZXJzaW9uOiBGTE9XX1NDSEVNQV9WRVJTSU9OLFxuICAgICAgICAgICAgcnVuSWQ6IHN0YXRlLnJ1bklkLFxuICAgICAgICAgICAgY3ljbGVOdW1iZXI6IHN0YXRlLmN1cnJlbnRDeWNsZSxcbiAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgc3RhdGUsXG4gICAgICAgICAgICBsYXN0UGhhc2VPdXRwdXRzLFxuICAgICAgICB9O1xuICAgICAgICB3cml0ZUZpbGVTeW5jKGNoZWNrcG9pbnRQYXRoLCBKU09OLnN0cmluZ2lmeShjaGVja3BvaW50LCBudWxsLCAyKSk7XG4gICAgICAgIGxvZy5kZWJ1ZyhcIlNhdmVkIGNoZWNrcG9pbnRcIiwge1xuICAgICAgICAgICAgcnVuSWQ6IHN0YXRlLnJ1bklkLFxuICAgICAgICAgICAgY3ljbGU6IHN0YXRlLmN1cnJlbnRDeWNsZSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqIExvYWQgY2hlY2twb2ludCBmb3IgcmVzdW1lICovXG4gICAgbG9hZENoZWNrcG9pbnQoKTogQ2hlY2twb2ludCB8IG51bGwge1xuICAgICAgICBjb25zdCBjaGVja3BvaW50UGF0aCA9IHRoaXMucGF0aChcImNoZWNrcG9pbnQuanNvblwiKTtcbiAgICAgICAgaWYgKCFleGlzdHNTeW5jKGNoZWNrcG9pbnRQYXRoKSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgY29udGVudCA9IHJlYWRGaWxlU3luYyhjaGVja3BvaW50UGF0aCwgXCJ1dGYtOFwiKTtcbiAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKGNvbnRlbnQpIGFzIENoZWNrcG9pbnQ7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1zZyA9XG4gICAgICAgICAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICAgICAgbG9nLmVycm9yKFwiRmFpbGVkIHRvIGxvYWQgY2hlY2twb2ludFwiLCB7IGVycm9yOiBlcnJvck1zZyB9KTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIFNhdmUgaXRlcmF0aW9uIGN5Y2xlIG91dHB1dCAqL1xuICAgIHNhdmVJdGVyYXRpb24oY3ljbGU6IEN5Y2xlU3RhdGUpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgY3ljbGVQYXRoID0gdGhpcy5wYXRoKGBpdGVyYXRpb25zLyR7Y3ljbGUuY3ljbGVOdW1iZXJ9Lmpzb25gKTtcbiAgICAgICAgd3JpdGVGaWxlU3luYyhjeWNsZVBhdGgsIEpTT04uc3RyaW5naWZ5KGN5Y2xlLCBudWxsLCAyKSk7XG5cbiAgICAgICAgLy8gU2F2ZSByZS1hbmNob3JpbmcgY29udGV4dFxuICAgICAgICBjb25zdCBjb250ZXh0UGF0aCA9IHRoaXMucGF0aChgY29udGV4dHMvJHtjeWNsZS5jeWNsZU51bWJlcn0ubWRgKTtcbiAgICAgICAgY29uc3QgY29udGV4dENvbnRlbnQgPSB0aGlzLmdlbmVyYXRlQ29udGV4dENvbnRlbnQoY3ljbGUpO1xuICAgICAgICB3cml0ZUZpbGVTeW5jKGNvbnRleHRQYXRoLCBjb250ZXh0Q29udGVudCk7XG5cbiAgICAgICAgbG9nLmRlYnVnKFwiU2F2ZWQgaXRlcmF0aW9uXCIsIHsgY3ljbGU6IGN5Y2xlLmN5Y2xlTnVtYmVyIH0pO1xuICAgIH1cblxuICAgIC8qKiBTYXZlIGdhdGUgcmVzdWx0cyBmb3IgaXRlcmF0aW9uICovXG4gICAgc2F2ZUdhdGVSZXN1bHRzKFxuICAgICAgICBjeWNsZU51bWJlcjogbnVtYmVyLFxuICAgICAgICByZXN1bHRzOiBDeWNsZVN0YXRlW1wiZ2F0ZVJlc3VsdHNcIl0sXG4gICAgKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGdhdGVQYXRoID0gdGhpcy5wYXRoKGBnYXRlcy8ke2N5Y2xlTnVtYmVyfS5qc29uYCk7XG4gICAgICAgIHdyaXRlRmlsZVN5bmMoZ2F0ZVBhdGgsIEpTT04uc3RyaW5naWZ5KHJlc3VsdHMsIG51bGwsIDIpKTtcbiAgICB9XG5cbiAgICAvKiogR2VuZXJhdGUgcmUtYW5jaG9yaW5nIGNvbnRleHQgY29udGVudCBmb3IgYSBjeWNsZSAqL1xuICAgIHByaXZhdGUgZ2VuZXJhdGVDb250ZXh0Q29udGVudChjeWNsZTogQ3ljbGVTdGF0ZSk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IGxpbmVzOiBzdHJpbmdbXSA9IFtcbiAgICAgICAgICAgIGAjIEN5Y2xlICR7Y3ljbGUuY3ljbGVOdW1iZXJ9IENvbnRleHRgLFxuICAgICAgICAgICAgXCJcIixcbiAgICAgICAgICAgIGAqKlRpbWVzdGFtcDoqKiAke2N5Y2xlLnN0YXJ0VGltZX1gLFxuICAgICAgICAgICAgYCoqU3RhdHVzOioqICR7Y3ljbGUuc3RhdHVzfWAsXG4gICAgICAgICAgICBgKipDb21wbGV0aW9uIFByb21pc2UgT2JzZXJ2ZWQ6KiogJHtjeWNsZS5jb21wbGV0aW9uUHJvbWlzZU9ic2VydmVkfWAsXG4gICAgICAgICAgICBcIlwiLFxuICAgICAgICAgICAgXCIjIyBQaGFzZSBTdW1tYXJpZXNcIixcbiAgICAgICAgICAgIFwiXCIsXG4gICAgICAgIF07XG5cbiAgICAgICAgZm9yIChjb25zdCBbcGhhc2UsIG91dHB1dF0gb2YgT2JqZWN0LmVudHJpZXMoY3ljbGUucGhhc2VzKSkge1xuICAgICAgICAgICAgaWYgKG91dHB1dCkge1xuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goYCMjIyAke3BoYXNlLnRvVXBwZXJDYXNlKCl9YCk7XG4gICAgICAgICAgICAgICAgbGluZXMucHVzaChcIlwiKTtcbiAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKG91dHB1dC5zdW1tYXJ5IHx8IG91dHB1dC5yZXNwb25zZS5zbGljZSgwLCA1MDApKTtcbiAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKFwiXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGN5Y2xlLmdhdGVSZXN1bHRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGxpbmVzLnB1c2goXCIjIyBHYXRlIFJlc3VsdHNcIik7XG4gICAgICAgICAgICBsaW5lcy5wdXNoKFwiXCIpO1xuICAgICAgICAgICAgZm9yIChjb25zdCBnYXRlIG9mIGN5Y2xlLmdhdGVSZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhdHVzID0gZ2F0ZS5wYXNzZWQgPyBcIuKchSBQQVNTXCIgOiBcIuKdjCBGQUlMXCI7XG4gICAgICAgICAgICAgICAgbGluZXMucHVzaChgLSAqKiR7Z2F0ZS5nYXRlfToqKiAke3N0YXR1c30gLSAke2dhdGUubWVzc2FnZX1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxpbmVzLnB1c2goXCJcIik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY3ljbGUuZXJyb3IpIHtcbiAgICAgICAgICAgIGxpbmVzLnB1c2goXCIjIyBFcnJvcnNcIik7XG4gICAgICAgICAgICBsaW5lcy5wdXNoKFwiXCIpO1xuICAgICAgICAgICAgbGluZXMucHVzaChjeWNsZS5lcnJvcik7XG4gICAgICAgICAgICBsaW5lcy5wdXNoKFwiXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGxpbmVzLmpvaW4oXCJcXG5cIik7XG4gICAgfVxuXG4gICAgLyoqIEdldCBpdGVyYXRpb24gYnkgbnVtYmVyICovXG4gICAgZ2V0SXRlcmF0aW9uKGN5Y2xlTnVtYmVyOiBudW1iZXIpOiBDeWNsZVN0YXRlIHwgbnVsbCB7XG4gICAgICAgIGNvbnN0IGN5Y2xlUGF0aCA9IHRoaXMucGF0aChgaXRlcmF0aW9ucy8ke2N5Y2xlTnVtYmVyfS5qc29uYCk7XG4gICAgICAgIGlmICghZXhpc3RzU3luYyhjeWNsZVBhdGgpKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBjb250ZW50ID0gcmVhZEZpbGVTeW5jKGN5Y2xlUGF0aCwgXCJ1dGYtOFwiKTtcbiAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKGNvbnRlbnQpIGFzIEN5Y2xlU3RhdGU7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogR2V0IGFsbCBpdGVyYXRpb25zICovXG4gICAgZ2V0QWxsSXRlcmF0aW9ucygpOiBDeWNsZVN0YXRlW10ge1xuICAgICAgICBjb25zdCBpdGVyYXRpb25zOiBDeWNsZVN0YXRlW10gPSBbXTtcbiAgICAgICAgbGV0IG4gPSAxO1xuXG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICBjb25zdCBjeWNsZSA9IHRoaXMuZ2V0SXRlcmF0aW9uKG4pO1xuICAgICAgICAgICAgaWYgKCFjeWNsZSkgYnJlYWs7XG4gICAgICAgICAgICBpdGVyYXRpb25zLnB1c2goY3ljbGUpO1xuICAgICAgICAgICAgbisrO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGl0ZXJhdGlvbnM7XG4gICAgfVxuXG4gICAgLyoqIFVwZGF0ZSBzdGF0ZSBzdGF0dXMgKi9cbiAgICB1cGRhdGVTdGF0dXMoXG4gICAgICAgIHN0YXR1czogUnVuU3RhdHVzLFxuICAgICAgICBzdG9wUmVhc29uPzogU3RvcFJlYXNvbixcbiAgICAgICAgZXJyb3I/OiBzdHJpbmcsXG4gICAgKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHN0YXRlID0gdGhpcy5sb2FkKCk7XG4gICAgICAgIGlmICghc3RhdGUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIGZsb3cgc3RhdGUgdG8gdXBkYXRlXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RhdGUuc3RhdHVzID0gc3RhdHVzO1xuICAgICAgICBpZiAoc3RvcFJlYXNvbikgc3RhdGUuc3RvcFJlYXNvbiA9IHN0b3BSZWFzb247XG4gICAgICAgIGlmIChlcnJvcikgc3RhdGUuZXJyb3IgPSBlcnJvcjtcbiAgICAgICAgaWYgKHN0YXR1cyA9PT0gUnVuU3RhdHVzLkNPTVBMRVRFRCB8fCBzdGF0dXMgPT09IFJ1blN0YXR1cy5GQUlMRUQpIHtcbiAgICAgICAgICAgIHN0YXRlLmNvbXBsZXRlZEF0ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zYXZlU3RhdGUoc3RhdGUpO1xuICAgIH1cblxuICAgIC8qKiBJbmNyZW1lbnQgY3ljbGUgY291bnRlciAqL1xuICAgIGluY3JlbWVudEN5Y2xlKCk6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IHN0YXRlID0gdGhpcy5sb2FkKCk7XG4gICAgICAgIGlmICghc3RhdGUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIGZsb3cgc3RhdGUgdG8gdXBkYXRlXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RhdGUuY3VycmVudEN5Y2xlKys7XG4gICAgICAgIHRoaXMuc2F2ZVN0YXRlKHN0YXRlKTtcbiAgICAgICAgcmV0dXJuIHN0YXRlLmN1cnJlbnRDeWNsZTtcbiAgICB9XG5cbiAgICAvKiogUmVjb3JkIGEgZmFpbGVkIGN5Y2xlICovXG4gICAgcmVjb3JkRmFpbGVkQ3ljbGUoY3ljbGU6IEN5Y2xlU3RhdGUpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgc3RhdGUgPSB0aGlzLmxvYWQoKTtcbiAgICAgICAgaWYgKCFzdGF0ZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gZmxvdyBzdGF0ZSB0byB1cGRhdGVcIik7XG4gICAgICAgIH1cblxuICAgICAgICBzdGF0ZS5mYWlsZWRDeWNsZXMrKztcbiAgICAgICAgc3RhdGUuc3R1Y2tDb3VudCsrO1xuICAgICAgICB0aGlzLnNhdmVJdGVyYXRpb24oY3ljbGUpO1xuICAgICAgICB0aGlzLnNhdmVTdGF0ZShzdGF0ZSk7XG5cbiAgICAgICAgbG9nLmluZm8oXCJDeWNsZSBmYWlsZWRcIiwge1xuICAgICAgICAgICAgcnVuSWQ6IHRoaXMucnVuSWQsXG4gICAgICAgICAgICBjeWNsZTogY3ljbGUuY3ljbGVOdW1iZXIsXG4gICAgICAgICAgICBmYWlsZWRDeWNsZXM6IHN0YXRlLmZhaWxlZEN5Y2xlcyxcbiAgICAgICAgICAgIHN0dWNrQ291bnQ6IHN0YXRlLnN0dWNrQ291bnQsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKiBSZWNvcmQgYSBzdWNjZXNzZnVsIGN5Y2xlICovXG4gICAgcmVjb3JkU3VjY2Vzc2Z1bEN5Y2xlKGN5Y2xlOiBDeWNsZVN0YXRlLCBzdW1tYXJ5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgc3RhdGUgPSB0aGlzLmxvYWQoKTtcbiAgICAgICAgaWYgKCFzdGF0ZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gZmxvdyBzdGF0ZSB0byB1cGRhdGVcIik7XG4gICAgICAgIH1cblxuICAgICAgICBzdGF0ZS5jb21wbGV0ZWRDeWNsZXMrKztcbiAgICAgICAgc3RhdGUuc3R1Y2tDb3VudCA9IDA7IC8vIFJlc2V0IHN0dWNrIGNvdW50ZXIgb24gc3VjY2Vzc1xuICAgICAgICBzdGF0ZS5sYXN0Q2hlY2twb2ludCA9IHtcbiAgICAgICAgICAgIGN5Y2xlTnVtYmVyOiBjeWNsZS5jeWNsZU51bWJlcixcbiAgICAgICAgICAgIHN1bW1hcnksXG4gICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnNhdmVJdGVyYXRpb24oY3ljbGUpO1xuICAgICAgICB0aGlzLnNhdmVTdGF0ZShzdGF0ZSk7XG5cbiAgICAgICAgbG9nLmluZm8oXCJDeWNsZSBjb21wbGV0ZWRcIiwge1xuICAgICAgICAgICAgcnVuSWQ6IHRoaXMucnVuSWQsXG4gICAgICAgICAgICBjeWNsZTogY3ljbGUuY3ljbGVOdW1iZXIsXG4gICAgICAgICAgICBjb21wbGV0ZWRDeWNsZXM6IHN0YXRlLmNvbXBsZXRlZEN5Y2xlcyxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqIENsZWFuIHVwIGZsb3cgZGlyZWN0b3J5ICovXG4gICAgY2xlYW51cCgpOiB2b2lkIHtcbiAgICAgICAgLy8gSW1wbGVtZW50YXRpb24gd291bGQgcmVtb3ZlIHRoZSAuZmxvdyBkaXJlY3RvcnlcbiAgICAgICAgLy8gRm9yIG5vdywganVzdCBsb2dcbiAgICAgICAgbG9nLmluZm8oXCJGbG93IHN0b3JlIGNsZWFudXAgcmVxdWVzdGVkXCIsIHsgcnVuSWQ6IHRoaXMucnVuSWQgfSk7XG4gICAgfVxufVxuIiwKICAgICIvKipcbiAqIEZsb3cgU3RhdGUgVHlwZXMgZm9yIFJhbHBoIExvb3AgUnVubmVyXG4gKlxuICogU3RhdGUgaXMgcGVyc2lzdGVkIHRvIGAuYWktZW5nL3J1bnMvPHJ1bklkPi8uZmxvdy9gIGZvcjpcbiAqIC0gUmVzdW1lIHN1cHBvcnQgYWNyb3NzIHJ1bnNcbiAqIC0gRnJlc2ggY29udGV4dCBwZXIgaXRlcmF0aW9uIChyZS1hbmNob3JpbmcgZnJvbSBkaXNrKVxuICogLSBBdWRpdCB0cmFpbCBvZiBhbGwgY3ljbGUgb3V0cHV0c1xuICovXG5cbi8qKiBTY2hlbWEgdmVyc2lvbiBmb3IgZm9yd2FyZCBjb21wYXRpYmlsaXR5ICovXG5leHBvcnQgY29uc3QgRkxPV19TQ0hFTUFfVkVSU0lPTiA9IFwiMS4wLjBcIjtcblxuLyoqIFJ1biBzdGF0dXMgZW51bSAqL1xuZXhwb3J0IGVudW0gUnVuU3RhdHVzIHtcbiAgICBQRU5ESU5HID0gXCJwZW5kaW5nXCIsXG4gICAgUlVOTklORyA9IFwicnVubmluZ1wiLFxuICAgIENPTVBMRVRFRCA9IFwiY29tcGxldGVkXCIsXG4gICAgRkFJTEVEID0gXCJmYWlsZWRcIixcbiAgICBBQk9SVEVEID0gXCJhYm9ydGVkXCIsXG4gICAgU1RVQ0sgPSBcInN0dWNrXCIsXG59XG5cbi8qKiBTdG9wIHJlYXNvbiBmb3IgY29tcGxldGVkIHJ1bnMgKi9cbmV4cG9ydCBlbnVtIFN0b3BSZWFzb24ge1xuICAgIENPTVBMRVRJT05fUFJPTUlTRSA9IFwiY29tcGxldGlvbl9wcm9taXNlXCIsXG4gICAgTUFYX0NZQ0xFUyA9IFwibWF4X2N5Y2xlc1wiLFxuICAgIEdBVEVfRkFJTFVSRSA9IFwiZ2F0ZV9mYWlsdXJlXCIsXG4gICAgU1RVQ0sgPSBcInN0dWNrXCIsXG4gICAgVVNFUl9BQk9SVCA9IFwidXNlcl9hYm9ydFwiLFxuICAgIEVSUk9SID0gXCJlcnJvclwiLFxufVxuXG4vKiogUGhhc2UgbmFtZXMgaW4gdGhlIHdvcmtmbG93ICovXG5leHBvcnQgZW51bSBQaGFzZSB7XG4gICAgUkVTRUFSQ0ggPSBcInJlc2VhcmNoXCIsXG4gICAgU1BFQ0lGWSA9IFwic3BlY2lmeVwiLFxuICAgIFBMQU4gPSBcInBsYW5cIixcbiAgICBXT1JLID0gXCJ3b3JrXCIsXG4gICAgUkVWSUVXID0gXCJyZXZpZXdcIixcbn1cblxuLyoqIEdhdGUgcmVzdWx0IHR5cGUgKi9cbmV4cG9ydCBpbnRlcmZhY2UgR2F0ZVJlc3VsdCB7XG4gICAgZ2F0ZTogc3RyaW5nO1xuICAgIHBhc3NlZDogYm9vbGVhbjtcbiAgICBtZXNzYWdlOiBzdHJpbmc7XG4gICAgZGV0YWlscz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgIHRpbWVzdGFtcDogc3RyaW5nO1xufVxuXG4vKiogUGhhc2Ugb3V0cHV0ICovXG5leHBvcnQgaW50ZXJmYWNlIFBoYXNlT3V0cHV0IHtcbiAgICBwaGFzZTogUGhhc2U7XG4gICAgcHJvbXB0OiBzdHJpbmc7XG4gICAgcmVzcG9uc2U6IHN0cmluZztcbiAgICBzdW1tYXJ5OiBzdHJpbmc7XG4gICAgdGltZXN0YW1wOiBzdHJpbmc7XG4gICAgLyoqIFRvb2wgaW52b2NhdGlvbnMgY2FwdHVyZWQgZHVyaW5nIHRoaXMgcGhhc2UgKi9cbiAgICB0b29scz86IFRvb2xJbnZvY2F0aW9uW107XG59XG5cbi8qKiBUb29sIGludm9jYXRpb24gY2FwdHVyZWQgZnJvbSBPcGVuQ29kZSBzdHJlYW0gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVG9vbEludm9jYXRpb24ge1xuICAgIC8qKiBVbmlxdWUgdG9vbCBJRCAqL1xuICAgIGlkOiBzdHJpbmc7XG4gICAgLyoqIFRvb2wgbmFtZSAoZS5nLiwgXCJiYXNoXCIsIFwicmVhZFwiLCBcIndyaXRlXCIsIFwiZWRpdFwiKSAqL1xuICAgIG5hbWU6IHN0cmluZztcbiAgICAvKiogSW5wdXQgYXJndW1lbnRzIChtYXkgYmUgdHJ1bmNhdGVkL3JlZGFjdGVkIGZvciBzZWNyZXRzKSAqL1xuICAgIGlucHV0PzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgLyoqIE91dHB1dCByZXN1bHQgKG1heSBiZSB0cnVuY2F0ZWQpICovXG4gICAgb3V0cHV0Pzogc3RyaW5nO1xuICAgIC8qKiBXaGV0aGVyIHRoZSB0b29sIGNhbGwgc3VjY2VlZGVkICovXG4gICAgc3RhdHVzOiBcIm9rXCIgfCBcImVycm9yXCI7XG4gICAgLyoqIEVycm9yIG1lc3NhZ2UgaWYgc3RhdHVzIGlzIGVycm9yICovXG4gICAgZXJyb3I/OiBzdHJpbmc7XG4gICAgLyoqIFdoZW4gdGhlIHRvb2wgY2FsbCBzdGFydGVkIChJU08gdGltZXN0YW1wKSAqL1xuICAgIHN0YXJ0ZWRBdD86IHN0cmluZztcbiAgICAvKiogV2hlbiB0aGUgdG9vbCBjYWxsIGNvbXBsZXRlZCAoSVNPIHRpbWVzdGFtcCkgKi9cbiAgICBjb21wbGV0ZWRBdD86IHN0cmluZztcbn1cblxuLyoqIFNpbmdsZSBpdGVyYXRpb24gY3ljbGUgc3RhdGUgKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ3ljbGVTdGF0ZSB7XG4gICAgY3ljbGVOdW1iZXI6IG51bWJlcjtcbiAgICBzdGF0dXM6IFwicGVuZGluZ1wiIHwgXCJydW5uaW5nXCIgfCBcImNvbXBsZXRlZFwiIHwgXCJmYWlsZWRcIjtcbiAgICBzdGFydFRpbWU6IHN0cmluZztcbiAgICBlbmRUaW1lPzogc3RyaW5nO1xuICAgIGR1cmF0aW9uTXM/OiBudW1iZXI7XG4gICAgcGhhc2VzOiB7XG4gICAgICAgIFtrZXkgaW4gUGhhc2VdPzogUGhhc2VPdXRwdXQ7XG4gICAgfTtcbiAgICBnYXRlUmVzdWx0czogR2F0ZVJlc3VsdFtdO1xuICAgIGNvbXBsZXRpb25Qcm9taXNlT2JzZXJ2ZWQ6IGJvb2xlYW47XG4gICAgc3RvcFJlYXNvbj86IFN0b3BSZWFzb247XG4gICAgZXJyb3I/OiBzdHJpbmc7XG4gICAgLy8gRm9yIHN0dWNrIGRldGVjdGlvbiAtIGhhc2ggb2Ygb3V0cHV0cyB0byBkZXRlY3Qgbm8tcHJvZ3Jlc3NcbiAgICBvdXRwdXRIYXNoPzogc3RyaW5nO1xufVxuXG4vKiogTWFpbiBmbG93IHN0YXRlICovXG5leHBvcnQgaW50ZXJmYWNlIEZsb3dTdGF0ZSB7XG4gICAgLyoqIFNjaGVtYSB2ZXJzaW9uIGZvciBtaWdyYXRpb25zICovXG4gICAgc2NoZW1hVmVyc2lvbjogc3RyaW5nO1xuXG4gICAgLyoqIFJ1biBpZGVudGlmaWNhdGlvbiAqL1xuICAgIHJ1bklkOiBzdHJpbmc7XG4gICAgcHJvbXB0OiBzdHJpbmc7XG5cbiAgICAvKiogUnVuIHN0YXR1cyAqL1xuICAgIHN0YXR1czogUnVuU3RhdHVzO1xuICAgIHN0b3BSZWFzb24/OiBTdG9wUmVhc29uO1xuXG4gICAgLyoqIExvb3AgcGFyYW1ldGVycyAqL1xuICAgIGNvbXBsZXRpb25Qcm9taXNlOiBzdHJpbmc7XG4gICAgbWF4Q3ljbGVzOiBudW1iZXI7XG4gICAgc3R1Y2tUaHJlc2hvbGQ6IG51bWJlcjtcbiAgICBnYXRlczogc3RyaW5nW107XG5cbiAgICAvKiogQ3ljbGUgdHJhY2tpbmcgKi9cbiAgICBjdXJyZW50Q3ljbGU6IG51bWJlcjtcbiAgICBjb21wbGV0ZWRDeWNsZXM6IG51bWJlcjtcbiAgICBmYWlsZWRDeWNsZXM6IG51bWJlcjtcbiAgICBzdHVja0NvdW50OiBudW1iZXI7XG5cbiAgICAvKiogVGltZXN0YW1wcyAqL1xuICAgIGNyZWF0ZWRBdDogc3RyaW5nO1xuICAgIHVwZGF0ZWRBdDogc3RyaW5nO1xuICAgIGNvbXBsZXRlZEF0Pzogc3RyaW5nO1xuXG4gICAgLyoqIExhc3Qgc3VjY2Vzc2Z1bCBjaGVja3BvaW50IGZvciByZS1hbmNob3JpbmcgKi9cbiAgICBsYXN0Q2hlY2twb2ludD86IHtcbiAgICAgICAgY3ljbGVOdW1iZXI6IG51bWJlcjtcbiAgICAgICAgc3VtbWFyeTogc3RyaW5nO1xuICAgICAgICB0aW1lc3RhbXA6IHN0cmluZztcbiAgICB9O1xuXG4gICAgLyoqIEVycm9yIGluZm8gaWYgZmFpbGVkICovXG4gICAgZXJyb3I/OiBzdHJpbmc7XG59XG5cbi8qKiBDaGVja3BvaW50IGZvciBmYXN0IHJlc3VtZSAqL1xuZXhwb3J0IGludGVyZmFjZSBDaGVja3BvaW50IHtcbiAgICBzY2hlbWFWZXJzaW9uOiBzdHJpbmc7XG4gICAgcnVuSWQ6IHN0cmluZztcbiAgICBjeWNsZU51bWJlcjogbnVtYmVyO1xuICAgIHRpbWVzdGFtcDogc3RyaW5nO1xuICAgIHN0YXRlOiBGbG93U3RhdGU7XG4gICAgbGFzdFBoYXNlT3V0cHV0czoge1xuICAgICAgICBba2V5IGluIFBoYXNlXT86IFBoYXNlT3V0cHV0O1xuICAgIH07XG59XG5cbi8qKiBDb25maWd1cmF0aW9uIGZvciB0aGUgbG9vcCBydW5uZXIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgTG9vcENvbmZpZyB7XG4gICAgcnVuSWQ6IHN0cmluZztcbiAgICBwcm9tcHQ6IHN0cmluZztcbiAgICBjb21wbGV0aW9uUHJvbWlzZTogc3RyaW5nO1xuICAgIG1heEN5Y2xlczogbnVtYmVyO1xuICAgIHN0dWNrVGhyZXNob2xkOiBudW1iZXI7XG4gICAgZ2F0ZXM6IHN0cmluZ1tdO1xuICAgIGNoZWNrcG9pbnRGcmVxdWVuY3k6IG51bWJlcjtcbiAgICBmbG93RGlyOiBzdHJpbmc7XG4gICAgZHJ5UnVuOiBib29sZWFuO1xuICAgIC8qKiBOdW1iZXIgb2YgcmV0cnkgYXR0ZW1wdHMgcGVyIGN5Y2xlIG9uIGZhaWx1cmUgKi9cbiAgICBjeWNsZVJldHJpZXM6IG51bWJlcjtcbiAgICAvKiogT3BlbkNvZGUgcHJvbXB0IHRpbWVvdXQgaW4gbXMgKHVzZWQgYXMgaWRsZSB0aW1lb3V0KSAqL1xuICAgIHByb21wdFRpbWVvdXQ/OiBudW1iZXI7XG4gICAgLyoqIFBoYXNlIGhhcmQgdGltZW91dCBpbiBtcyAocnVubmVyLXNpZGUgd2F0Y2hkb2cpICovXG4gICAgcGhhc2VUaW1lb3V0TXM/OiBudW1iZXI7XG4gICAgLyoqIEN5Y2xlIGhhcmQgdGltZW91dCBpbiBtcyAqL1xuICAgIGN5Y2xlVGltZW91dE1zPzogbnVtYmVyO1xuICAgIC8qKiBSdW4gaGFyZCB0aW1lb3V0IGluIG1zICovXG4gICAgcnVuVGltZW91dE1zPzogbnVtYmVyO1xuICAgIC8qKiBEZWJ1ZyBtb2RlOiBwcmludCB0b29sIGludm9jYXRpb25zIHRvIGNvbnNvbGUvbG9ncyAqL1xuICAgIGRlYnVnV29yazogYm9vbGVhbjtcbn1cbiIsCiAgICAiLyoqXG4gKiBDTEkgZXhlY3V0aW9uIG1vZGUgZm9yIGFpLWVuZyByYWxwaFxuICpcbiAqIE5vbi1UVUkgZXhlY3V0aW9uIHdpdGggaW50ZXJhY3RpdmUgcHJvbXB0cyB1c2luZyBAY2xhY2svcHJvbXB0c1xuICpcbiAqIFN1cHBvcnRzIHR3byBtb2RlczpcbiAqIC0gTG9vcCBtb2RlIChkZWZhdWx0KTogSXRlcmF0ZXMgd2l0aCBmcmVzaCBPcGVuQ29kZSBzZXNzaW9ucyBwZXIgY3ljbGVcbiAqIC0gU2luZ2xlLXNob3QgbW9kZSAoLS1uby1sb29wKTogU2luZ2xlIGV4ZWN1dGlvbiB3aXRoIHByb21wdCBvcHRpbWl6YXRpb25cbiAqL1xuaW1wb3J0IHsgaXNDYW5jZWwsIG91dHJvLCBzZWxlY3QsIHNwaW5uZXIgfSBmcm9tIFwiQGNsYWNrL3Byb21wdHNcIjtcbmltcG9ydCB7XG4gICAgdHlwZSBNZXNzYWdlUmVzcG9uc2UsXG4gICAgT3BlbkNvZGVDbGllbnQsXG59IGZyb20gXCIuLi9iYWNrZW5kcy9vcGVuY29kZS9jbGllbnRcIjtcbmltcG9ydCB0eXBlIHsgQWlFbmdDb25maWcgfSBmcm9tIFwiLi4vY29uZmlnL3NjaGVtYVwiO1xuaW1wb3J0IHtcbiAgICBSYWxwaExvb3BSdW5uZXIsXG4gICAgY3JlYXRlUmFscGhMb29wUnVubmVyLFxufSBmcm9tIFwiLi4vZXhlY3V0aW9uL3JhbHBoLWxvb3BcIjtcbmltcG9ydCB7IFByb21wdE9wdGltaXplciB9IGZyb20gXCIuLi9wcm9tcHQtb3B0aW1pemF0aW9uL29wdGltaXplclwiO1xuaW1wb3J0IHsgTG9nIH0gZnJvbSBcIi4uL3V0aWwvbG9nXCI7XG5pbXBvcnQgdHlwZSB7IFJhbHBoRmxhZ3MgfSBmcm9tIFwiLi9mbGFnc1wiO1xuaW1wb3J0IHsgVUkgfSBmcm9tIFwiLi91aVwiO1xuXG5jb25zdCBsb2cgPSBMb2cuY3JlYXRlKHsgc2VydmljZTogXCJydW4tY2xpXCIgfSk7XG5cbi8qKlxuICogQ2xlYW51cCBoYW5kbGVyIHRvIGVuc3VyZSBPcGVuQ29kZSBzZXJ2ZXIgaXMgcHJvcGVybHkgc2h1dCBkb3duXG4gKi9cbmxldCBhY3RpdmVDbGllbnQ6IE9wZW5Db2RlQ2xpZW50IHwgbnVsbCA9IG51bGw7XG5sZXQgY2xlYW51cEhhbmRsZXJzUmVnaXN0ZXJlZCA9IGZhbHNlO1xuXG5hc3luYyBmdW5jdGlvbiBzZXR1cENsZWFudXBIYW5kbGVycygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoY2xlYW51cEhhbmRsZXJzUmVnaXN0ZXJlZCkgcmV0dXJuO1xuICAgIGNsZWFudXBIYW5kbGVyc1JlZ2lzdGVyZWQgPSB0cnVlO1xuICAgIGNvbnN0IGNsZWFudXBGbiA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKGFjdGl2ZUNsaWVudCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBsb2cuaW5mbyhcIkNsZWFudXAgc2lnbmFsIHJlY2VpdmVkLCBjbG9zaW5nIE9wZW5Db2RlIHNlcnZlci4uLlwiKTtcbiAgICAgICAgICAgICAgICBhd2FpdCBhY3RpdmVDbGllbnQuY2xlYW51cCgpO1xuICAgICAgICAgICAgICAgIGxvZy5pbmZvKFwiT3BlbkNvZGUgc2VydmVyIGNsb3NlZCBzdWNjZXNzZnVsbHlcIik7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTXNnID1cbiAgICAgICAgICAgICAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICAgICAgICAgIGxvZy5lcnJvcihcIkVycm9yIGR1cmluZyBjbGVhbnVwXCIsIHsgZXJyb3I6IGVycm9yTXNnIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYWN0aXZlQ2xpZW50ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBwcm9jZXNzLmV4aXQoMCk7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSB2YXJpb3VzIGV4aXQgc2lnbmFsc1xuICAgIHByb2Nlc3Mub24oXCJTSUdJTlRcIiwgY2xlYW51cEZuKTtcbiAgICBwcm9jZXNzLm9uKFwiU0lHVEVSTVwiLCBjbGVhbnVwRm4pO1xuICAgIHByb2Nlc3Mub24oXCJTSUdIVVBcIiwgY2xlYW51cEZuKTtcblxuICAgIC8vIEhhbmRsZSB1bmNhdWdodCBlcnJvcnNcbiAgICBwcm9jZXNzLm9uKFwidW5jYXVnaHRFeGNlcHRpb25cIiwgYXN5bmMgKGVycm9yKSA9PiB7XG4gICAgICAgIGNvbnN0IGVycm9yTXNnID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICBsb2cuZXJyb3IoXCJVbmNhdWdodCBleGNlcHRpb25cIiwge1xuICAgICAgICAgICAgZXJyb3I6IGVycm9yTXNnLFxuICAgICAgICAgICAgc3RhY2s6IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5zdGFjayA6IHVuZGVmaW5lZCxcbiAgICAgICAgfSk7XG4gICAgICAgIGF3YWl0IGNsZWFudXBGbigpO1xuICAgIH0pO1xuXG4gICAgcHJvY2Vzcy5vbihcInVuaGFuZGxlZFJlamVjdGlvblwiLCBhc3luYyAocmVhc29uKSA9PiB7XG4gICAgICAgIGNvbnN0IGVycm9yTXNnID1cbiAgICAgICAgICAgIHJlYXNvbiBpbnN0YW5jZW9mIEVycm9yID8gcmVhc29uLm1lc3NhZ2UgOiBTdHJpbmcocmVhc29uKTtcbiAgICAgICAgbG9nLmVycm9yKFwiVW5oYW5kbGVkIHJlamVjdGlvblwiLCB7XG4gICAgICAgICAgICBlcnJvcjogZXJyb3JNc2csXG4gICAgICAgICAgICBzdGFjazogcmVhc29uIGluc3RhbmNlb2YgRXJyb3IgPyByZWFzb24uc3RhY2sgOiB1bmRlZmluZWQsXG4gICAgICAgIH0pO1xuICAgICAgICBhd2FpdCBjbGVhbnVwRm4oKTtcbiAgICB9KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJ1bkNsaShcbiAgICBjb25maWc6IEFpRW5nQ29uZmlnLFxuICAgIGZsYWdzOiBSYWxwaEZsYWdzLFxuKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gU2V0dXAgY2xlYW51cCBoYW5kbGVyc1xuICAgIGF3YWl0IHNldHVwQ2xlYW51cEhhbmRsZXJzKCk7XG5cbiAgICBsb2cuaW5mbyhcIlN0YXJ0aW5nIENMSSBleGVjdXRpb25cIiwgeyB3b3JrZmxvdzogZmxhZ3Mud29ya2Zsb3cgfSk7XG5cbiAgICBjb25zdCBwcm9tcHQgPSBmbGFncy53b3JrZmxvdztcbiAgICBpZiAoIXByb21wdCkge1xuICAgICAgICBVSS5lcnJvcihcIk5vIHByb21wdCBvciB3b3JrZmxvdyBwcm92aWRlZFwiKTtcbiAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgIH1cblxuICAgIC8vIEluaXRpYWxpemUgb3B0aW1pemVyXG4gICAgY29uc3Qgb3B0aW1pemVyID0gbmV3IFByb21wdE9wdGltaXplcih7XG4gICAgICAgIGF1dG9BcHByb3ZlOiBmbGFncy5jaSA/PyBmYWxzZSxcbiAgICAgICAgdmVyYm9zaXR5OiBmbGFncy52ZXJib3NlID8gXCJ2ZXJib3NlXCIgOiBcIm5vcm1hbFwiLFxuICAgIH0pO1xuXG4gICAgLy8gQ3JlYXRlIG9wdGltaXphdGlvbiBzZXNzaW9uXG4gICAgVUkuaGVhZGVyKFwiUHJvbXB0IE9wdGltaXphdGlvblwiKTtcbiAgICBjb25zdCBzZXNzaW9uID0gb3B0aW1pemVyLmNyZWF0ZVNlc3Npb24ocHJvbXB0KTtcbiAgICBsb2cuZGVidWcoXCJDcmVhdGVkIG9wdGltaXphdGlvbiBzZXNzaW9uXCIsIHsgc3RlcHM6IHNlc3Npb24uc3RlcHMubGVuZ3RoIH0pO1xuXG4gICAgLy8gUmV2aWV3IHN0ZXBzIGludGVyYWN0aXZlbHkgKHVubGVzcyBDSSBtb2RlKVxuICAgIGlmICghZmxhZ3MuY2kpIHtcbiAgICAgICAgZm9yIChjb25zdCBzdGVwIG9mIHNlc3Npb24uc3RlcHMpIHtcbiAgICAgICAgICAgIGNvbnN0IGFjdGlvbiA9IGF3YWl0IHNlbGVjdCh7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogYEFwcGx5IFwiJHtzdGVwLm5hbWV9XCI/XFxuICAke3N0ZXAuZGVzY3JpcHRpb259YCxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBcImFwcHJvdmVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBcIkFwcHJvdmVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGhpbnQ6IFwiQXBwbHkgdGhpcyBvcHRpbWl6YXRpb25cIixcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IFwicmVqZWN0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogXCJSZWplY3RcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGhpbnQ6IFwiU2tpcCB0aGlzIG9wdGltaXphdGlvblwiLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogXCJza2lwLWFsbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IFwiU2tpcCBhbGxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGhpbnQ6IFwiVXNlIG9yaWdpbmFsIHByb21wdFwiLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYgKGlzQ2FuY2VsKGFjdGlvbikpIHtcbiAgICAgICAgICAgICAgICBsb2cuaW5mbyhcIlVzZXIgY2FuY2VsbGVkXCIpO1xuICAgICAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgwKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGFjdGlvbiA9PT0gXCJza2lwLWFsbFwiKSB7XG4gICAgICAgICAgICAgICAgb3B0aW1pemVyLnNraXBPcHRpbWl6YXRpb24oc2Vzc2lvbik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYWN0aW9uID09PSBcImFwcHJvdmVcIikge1xuICAgICAgICAgICAgICAgIG9wdGltaXplci5hcHByb3ZlU3RlcChzZXNzaW9uLCBzdGVwLmlkKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgb3B0aW1pemVyLnJlamVjdFN0ZXAoc2Vzc2lvbiwgc3RlcC5pZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSb3V0ZSB0byBsb29wIG1vZGUgb3Igc2luZ2xlLXNob3QgbW9kZVxuICAgIGlmIChmbGFncy5sb29wICE9PSBmYWxzZSkge1xuICAgICAgICAvLyBMb29wIG1vZGUgKGRlZmF1bHQpXG4gICAgICAgIGF3YWl0IHJ1bkxvb3BNb2RlKGNvbmZpZywgZmxhZ3MsIHNlc3Npb24uZmluYWxQcm9tcHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFNpbmdsZS1zaG90IG1vZGUgKC0tbm8tbG9vcClcbiAgICAgICAgYXdhaXQgcnVuU2luZ2xlU2hvdE1vZGUoY29uZmlnLCBmbGFncywgc2Vzc2lvbi5maW5hbFByb21wdCk7XG4gICAgfVxufVxuXG4vKipcbiAqIFJ1biBpbiBSYWxwaCBsb29wIG1vZGUgKGRlZmF1bHQpIC0gaXRlcmF0ZXMgd2l0aCBmcmVzaCBzZXNzaW9ucyBwZXIgY3ljbGVcbiAqL1xuYXN5bmMgZnVuY3Rpb24gcnVuTG9vcE1vZGUoXG4gICAgY29uZmlnOiBBaUVuZ0NvbmZpZyxcbiAgICBmbGFnczogUmFscGhGbGFncyxcbiAgICBfb3B0aW1pemVkUHJvbXB0OiBzdHJpbmcsXG4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBVSS5oZWFkZXIoXCJSYWxwaCBMb29wIE1vZGVcIik7XG4gICAgVUkuaW5mbyhcIlJ1bm5pbmcgd2l0aCBmcmVzaCBPcGVuQ29kZSBzZXNzaW9ucyBwZXIgaXRlcmF0aW9uXCIpO1xuXG4gICAgLy8gU2hvdyBtb2RlIGluZm9cbiAgICBpZiAoZmxhZ3Muc2hpcCkge1xuICAgICAgICBVSS5pbmZvKFxuICAgICAgICAgICAgXCJNb2RlOiBTSElQIChhdXRvLWV4aXQgd2hlbiBhZ2VudCBvdXRwdXRzICc8cHJvbWlzZT5TSElQPC9wcm9taXNlPicpXCIsXG4gICAgICAgICk7XG4gICAgICAgIFVJLmluZm8oXCJDb21wbGV0aW9uIHByb21pc2U6IDxwcm9taXNlPlNISVA8L3Byb21pc2U+XCIpO1xuICAgIH0gZWxzZSBpZiAoZmxhZ3MuZHJhZnQgfHwgKCFmbGFncy5zaGlwICYmICFmbGFncy5jb21wbGV0aW9uUHJvbWlzZSkpIHtcbiAgICAgICAgVUkuaW5mbyhcIk1vZGU6IERSQUZUIChydW5zIGZvciBtYXgtY3ljbGVzIHRoZW4gc3RvcHMgZm9yIHlvdXIgcmV2aWV3KVwiKTtcbiAgICAgICAgVUkuaW5mbyhcIkNvbXBsZXRpb24gcHJvbWlzZTogbm9uZSAod2lsbCBydW4gYWxsIGN5Y2xlcylcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgVUkuaW5mbyhcIk1vZGU6IEN1c3RvbSBjb21wbGV0aW9uIHByb21pc2VcIik7XG4gICAgICAgIFVJLmluZm8oYENvbXBsZXRpb24gcHJvbWlzZTogJHtmbGFncy5jb21wbGV0aW9uUHJvbWlzZX1gKTtcbiAgICB9XG5cbiAgICBVSS5pbmZvKGBNYXggY3ljbGVzOiAke2ZsYWdzLm1heEN5Y2xlcyA/PyA1MH1gKTtcbiAgICBVSS5pbmZvKGBTdHVjayB0aHJlc2hvbGQ6ICR7ZmxhZ3Muc3R1Y2tUaHJlc2hvbGQgPz8gNX1gKTtcbiAgICBVSS5wcmludGxuKCk7XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCBydW5uZXIgPSBhd2FpdCBjcmVhdGVSYWxwaExvb3BSdW5uZXIoZmxhZ3MsIGNvbmZpZyk7XG4gICAgICAgIGF3YWl0IHJ1bm5lci5ydW4oKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICBsb2cuZXJyb3IoXCJMb29wIGV4ZWN1dGlvbiBmYWlsZWRcIiwgeyBlcnJvcjogbWVzc2FnZSB9KTtcbiAgICAgICAgVUkuZXJyb3IobWVzc2FnZSk7XG4gICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICB9XG5cbiAgICBvdXRybyhcIkRvbmUhXCIpO1xufVxuXG4vKipcbiAqIFJ1biBpbiBzaW5nbGUtc2hvdCBtb2RlICgtLW5vLWxvb3ApIC0gc2luZ2xlIGV4ZWN1dGlvblxuICovXG5hc3luYyBmdW5jdGlvbiBydW5TaW5nbGVTaG90TW9kZShcbiAgICBjb25maWc6IEFpRW5nQ29uZmlnLFxuICAgIGZsYWdzOiBSYWxwaEZsYWdzLFxuICAgIG9wdGltaXplZFByb21wdDogc3RyaW5nLFxuKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gRXhlY3V0ZSBzaW5nbGUtc2hvdFxuICAgIFVJLmhlYWRlcihcIkV4ZWN1dGlvblwiKTtcbiAgICBjb25zdCBzID0gc3Bpbm5lcigpO1xuICAgIHMuc3RhcnQoXCJDb25uZWN0aW5nIHRvIE9wZW5Db2RlLi4uXCIpO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgLy8gQ3JlYXRlIE9wZW5Db2RlIGNsaWVudCAtIHRoaXMgd2lsbCBlaXRoZXIgc3Bhd24gYSBuZXcgc2VydmVyIG9yIGNvbm5lY3QgdG8gZXhpc3Rpbmcgb25lXG4gICAgICAgIGFjdGl2ZUNsaWVudCA9IGF3YWl0IE9wZW5Db2RlQ2xpZW50LmNyZWF0ZSh7XG4gICAgICAgICAgICBleGlzdGluZ1NlcnZlclVybDogcHJvY2Vzcy5lbnYuT1BFTkNPREVfVVJMLFxuICAgICAgICAgICAgc2VydmVyU3RhcnR1cFRpbWVvdXQ6IDEwMDAwLCAvLyBBbGxvdyAxMCBzZWNvbmRzIGZvciBzZXJ2ZXIgdG8gc3RhcnRcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3Qgb3BlblNlc3Npb24gPSBhd2FpdCBhY3RpdmVDbGllbnQuY3JlYXRlU2Vzc2lvbihvcHRpbWl6ZWRQcm9tcHQpO1xuICAgICAgICBsb2cuaW5mbyhcIkNyZWF0ZWQgT3BlbkNvZGUgc2Vzc2lvblwiLCB7IGlkOiBvcGVuU2Vzc2lvbi5pZCB9KTtcblxuICAgICAgICBzLnN0b3AoXCJDb25uZWN0ZWRcIik7XG5cbiAgICAgICAgLy8gU2VuZCBwcm9tcHQgYW5kIHN0cmVhbSByZXNwb25zZVxuICAgICAgICBVSS5wcmludGxuKCk7XG4gICAgICAgIFVJLnByaW50bG4oXG4gICAgICAgICAgICBgJHtVSS5TdHlsZS5URVhUX0RJTX1FeGVjdXRpbmcgdGFzay4uLiR7VUkuU3R5bGUuVEVYVF9OT1JNQUx9YCxcbiAgICAgICAgKTtcblxuICAgICAgICBsZXQgcmVzcG9uc2U6IE1lc3NhZ2VSZXNwb25zZTtcblxuICAgICAgICBpZiAoIWZsYWdzLm5vU3RyZWFtKSB7XG4gICAgICAgICAgICAvLyBTdHJlYW1pbmcgbW9kZSAoZGVmYXVsdClcbiAgICAgICAgICAgIGNvbnN0IHN0cmVhbWluZ1Jlc3BvbnNlID0gYXdhaXQgb3BlblNlc3Npb24uc2VuZE1lc3NhZ2VTdHJlYW0oXG4gICAgICAgICAgICAgICAgXCJFeGVjdXRlIHRoaXMgdGFzayBhbmQgcHJvdmlkZSBhIGRldGFpbGVkIHJlc3VsdCBzdW1tYXJ5LlwiLFxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgVUkucHJpbnRsbigpO1xuXG4gICAgICAgICAgICAvLyBTdHJlYW0gY29udGVudCB0byBzdGRlcnIgaW4gcmVhbC10aW1lXG4gICAgICAgICAgICBjb25zdCByZWFkZXIgPSBzdHJlYW1pbmdSZXNwb25zZS5zdHJlYW0uZ2V0UmVhZGVyKCk7XG4gICAgICAgICAgICBjb25zdCBkZWNvZGVyID0gbmV3IFRleHREZWNvZGVyKCk7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgeyBkb25lLCB2YWx1ZSB9ID0gYXdhaXQgcmVhZGVyLnJlYWQoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRvbmUpIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGV4dCA9IGRlY29kZXIuZGVjb2RlKHZhbHVlLCB7IHN0cmVhbTogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFVJLnByaW50KHRleHQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICByZWFkZXIucmVsZWFzZUxvY2soKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gR2V0IGNvbXBsZXRlIHJlc3BvbnNlIGZvciBjbGVhbnVwXG4gICAgICAgICAgICByZXNwb25zZSA9IGF3YWl0IHN0cmVhbWluZ1Jlc3BvbnNlLmNvbXBsZXRlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gQnVmZmVyZWQgbW9kZSAod2hlbiAtLW5vLXN0cmVhbSBmbGFnIGlzIHVzZWQpXG4gICAgICAgICAgICBVSS5wcmludGxuKCk7XG4gICAgICAgICAgICBVSS5wcmludGxuKFxuICAgICAgICAgICAgICAgIGAke1VJLlN0eWxlLlRFWFRfRElNfUJ1ZmZlcmluZyByZXNwb25zZS4uLiR7VUkuU3R5bGUuVEVYVF9OT1JNQUx9YCxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIHJlc3BvbnNlID0gYXdhaXQgb3BlblNlc3Npb24uc2VuZE1lc3NhZ2UoXG4gICAgICAgICAgICAgICAgXCJFeGVjdXRlIHRoaXMgdGFzayBhbmQgcHJvdmlkZSBhIGRldGFpbGVkIHJlc3VsdCBzdW1tYXJ5LlwiLFxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgVUkucHJpbnRsbigpO1xuICAgICAgICAgICAgVUkucHJpbnRsbihyZXNwb25zZS5jb250ZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIFVJLnByaW50bG4oKTtcbiAgICAgICAgVUkuc3VjY2VzcyhcIkV4ZWN1dGlvbiBjb21wbGV0ZVwiKTtcblxuICAgICAgICAvLyBDbGVhbnVwIHJlc291cmNlc1xuICAgICAgICBpZiAoYWN0aXZlQ2xpZW50KSB7XG4gICAgICAgICAgICBhd2FpdCBhY3RpdmVDbGllbnQuY2xlYW51cCgpO1xuICAgICAgICAgICAgYWN0aXZlQ2xpZW50ID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGxvZy5pbmZvKFwiRXhlY3V0aW9uIGNvbXBsZXRlXCIpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHMuc3RvcChcIkNvbm5lY3Rpb24gZmFpbGVkXCIpO1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICBsb2cuZXJyb3IoXCJFeGVjdXRpb24gZmFpbGVkXCIsIHsgZXJyb3I6IG1lc3NhZ2UgfSk7XG4gICAgICAgIFVJLmVycm9yKG1lc3NhZ2UpO1xuXG4gICAgICAgIC8vIEVuc3VyZSBjbGVhbnVwIG9uIGVycm9yXG4gICAgICAgIGlmIChhY3RpdmVDbGllbnQpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgYWN0aXZlQ2xpZW50LmNsZWFudXAoKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGNsZWFudXBFcnJvcikge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNsZWFudXBNc2cgPVxuICAgICAgICAgICAgICAgICAgICBjbGVhbnVwRXJyb3IgaW5zdGFuY2VvZiBFcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgPyBjbGVhbnVwRXJyb3IubWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBTdHJpbmcoY2xlYW51cEVycm9yKTtcbiAgICAgICAgICAgICAgICBsb2cuZXJyb3IoXCJFcnJvciBkdXJpbmcgZXJyb3IgY2xlYW51cFwiLCB7IGVycm9yOiBjbGVhbnVwTXNnIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYWN0aXZlQ2xpZW50ID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICB9XG5cbiAgICBvdXRybyhcIkRvbmUhXCIpO1xufVxuIgogIF0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBRUEsSUFBTSxPQUFNO0FBQUEsRUFDWixJQUFNLE9BQU0sR0FBRztBQUFBLEVBQ2YsSUFBTSxPQUFPO0FBQUEsRUFFYixJQUFNLFNBQVM7QUFBQSxJQUNiLEVBQUUsQ0FBQyxHQUFHLEdBQUc7QUFBQSxNQUNQLElBQUksQ0FBQztBQUFBLFFBQUcsT0FBTyxHQUFHLE9BQU0sSUFBSTtBQUFBLE1BQzVCLE9BQU8sR0FBRyxPQUFNLElBQUksS0FBSyxJQUFJO0FBQUE7QUFBQSxJQUUvQixJQUFJ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TUFBTSxPQUFTLE1BQU0sT0FBUyxNQUFNLE9BQVMsTUFBTSxPQUFTLE1BQU0sT0FBUyxNQUFNLE9BQVMsTUFBTSxPQUFTLE1BQU0sT0FBUyxNQUFNLE9BQVMsTUFBTSxPQUFTLE1BQU0sT0FBUyxLQUFLLE9BQVMsS0FBSyxPQUFTLE1BQU0sT0FBUyxNQUFNLE9BQVMsS0FBSyxPQUFTLEtBQUssT0FBUyxNQUFNLE9BQVMsTUFBTSxPQUFTLEtBQUssT0FBUyxLQUFLLE9BQVMsS0FBSyxPQUFTLEtBQUssT0FBUyxLQUFLLE9BQVMsS0FBSyxPQUFTLEtBQUssT0FBUyxLQUFLLE9BQVMsS0FBSyxPQUFTLEtBQUssT0FBUyxNQUFNLFFBQVMsS0FBSyxRQUFTLEtBQUssUUFBUyxNQUFNLFFBQVMsTUFBTSxRQUFVLEtBQUssUUFBVSxLQUFLLFFBQVUsTUFBTSxRQUFVLE1BQU0sUUFBVSxNQUFNLFFBQVUsTUFBTSxRQUFVLEtBQUssUUFBVSxLQUFLLFFBQVUsS0FBSyxRQUFVLEtBQUssUUFBVSxNQUFNLFFBQVUsTUFBTSxRQUFVLE1BQU0sUUFBVSxNQUFNLFFBQVUsTUFBTSxRQUFVLE1BQU0sUUFBVSxNQUFNLFFBQVUsTUFBTSxRQUFVLEtBQUssUUFBVSxLQUFLLFFBQVUsTUFBTSxRQUFVLE1BQU0sUUFBVSxNQUFNLFFBQVUsTUFBTSxRQUFVLE1BQU0sUUFBVSxNQUFNLFFBQVUsTUFBTSxRQUFVLE1BQU0sUUFBVSxNQUFNLFFBQVUsTUFBTSxRQUFVLE1BQU0sUUFBVSxNQUFNLFFBQVUsS0FBSyxRQUFVLEtBQUssUUFBVSxLQUFLLFFBQVUsS0FBSyxRQUFVLEtBQUssUUFBVSxLQUFLLFFBQVUsTUFBTSxRQUFVLEtBQUssUUFBVSxLQUFLLFFBQVUsTUFBTSxRQUFVLE1BQU0sUUFBVSxNQUFNLFFBQVUsTUFBTSxRQUFVLE1BQU0sUUFBVSxNQUFNLFFBQVUsTUFBTSxRQUFVLE1BQU0sUUFBVSxNQUFNLFFBQVUsTUFBTSxRQUFVLE1BQU0sUUFBVSxNQUFNLFFBQVUsTUFBTSxRQUFVLE1BQU0sUUFBVSxNQUFNLFFBQVUsS0FBSyxRQUFVLEtBQUssUUFBVSxNQUFNLFFBQVUsTUFBTSxRQUFVLEtBQUssUUFBVSxLQUFLLFFBQVUsTUFBTSxRQUFVLEtBQUssUUFBVSxLQUFLLFFBQVUsTUFBTSxRQUFVLE1BQU0sUUFBVSxNQUFNLFFBQVUsTUFBTSxRQUFVLE1BQU0sUUFBVSxNQUFNLFFBQVUsTUFBTSxRQUFVLEtBQUssUUFBVSxLQUFLLFFBQVUsTUFBTSxRQUFVLE1BQU0sUUFBVSxNQUFNLFFBQVUsTUFBTSxRQUFVLE1BQU0sUUFBVSxNQUFNLFFBQVUsTUFBTSxRQUFVLE1BQU0sUUFBVSxNQUFNLFFBQVUsTUFBTSxRQUFVLE1BQU0sUUFBVSxNQUFNLFFBQVUsTUFBTSxRQUFVLEtBQUssUUFBVSxLQUFLLFFBQVUsS0FBSyxRQUFVLEtBQUssUUFBVSxLQUFLLFFBQVUsS0FBSyxRQUFVLEtBQUssUUFBVSxLQUFLLFFBQVUsS0FBSyxRQUFVLEtBQUssUUFBVSxNQUFNLFFBQVUsTUFBTSxRQUFVLEtBQUssUUFBVSxLQUFLLFFBQVUsTUFBTSxRQUFVLE1BQU0sUUFBVSxNQUFNLFFBQVUsTUFBTSxRQUFVLE1BQU0sUUFBVSxNQUFNLFFBQVUsTUFBTSxRQUFVLE1BQU0sUUFBVSxLQUFLLFFBQVUsS0FBSyxRQUFVLE1BQU0sUUFBVSxLQUFLLFFBQVUsS0FBSyxRQUFVLEtBQUssUUFBVSxLQUFLLFFBQVUsTUFBTSxRQUFVLE1BQU0sUUFBVSxNQUFNLFFBQVUsTUFBTSxRQUFVLE1BQU0sUUFBVSxNQUFNLFFBQVUsTUFBTSxRQUFVLE1BQU0sUUFBVSxNQUFNLFFBQVUsTUFBTSxRQUFVLE1BQU0sUUFBVSxNQUFNLFFBQVUsS0FBSyxRQUFVLEtBQUssUUFBVSxLQUFLLFFBQVUsS0FBSyxRQUFVLE1BQU0sUUFBVSxNQUFNLFFBQVUsTUFBTSxRQUFVLE1BQU0sUUFBVSxNQUFNLFFBQVUsTUFBTSxRQUFVLEtBQUssUUFBVSxLQUFLLFFBQVUsS0FBSyxRQUFVLEtBQUssUUFBVSxLQUFLLFFBQVUsS0FBSyxRQUFVLE1BQU0sUUFBVSxNQUFNLFFBQVUsTUFBTSxRQUFVLEtBQUssUUFBVSxLQUFLLFFBQVUsTUFBTSxRQUFVLEtBQUssUUFBVSxLQUFLLFFBQVUsTUFBTSxRQUFVLE1BQU0sUUFBVSxNQUFNLFFBQVUsTUFBTSxRQUFVLE1BQU0sU0FBVSxLQUFLLFNBQVUsS0FBSyxTQUFVLEtBQUssU0FBVSxLQUFLLFNBQVUsS0FBSyxTQUFVLEtBQUssU0FBVSxLQUFLLFNBQVUsS0FBSyxTQUFVLEtBQUssU0FBVSxLQUFLLFNBQVUsTUFBTSxTQUFVLEtBQUssVUFBVyxLQUFLLFVBQVcsS0FBSyxVQUFXLEtBQUssVUFBVyxLQUFLLFVBQVcsS0FBSyxVQUFXLEtBQUssVUFBVyxLQUFLLFVBQVcsTUFBTSxVQUFXLE1BQU0sVUFBVyxLQUFLLFVBQVcsS0FBSyxVQUFXLEtBQUssVUFBVyxLQUFLLFVBQVcsS0FBSyxVQUFXLEtBQUssV0FBVyxLQUFLLFdBQVksS0FBSztBQUFBO0FBRTFqSSxJQUFNLGNBQWMsQ0FBQyxNQUFNO0FBQUEsRUFDdkIsT0FBTyxNQUFNLFNBQVUsS0FBSyxTQUFVLEtBQUssU0FBVSxLQUFLLFNBQVUsS0FBSztBQUFBO0FBRTdFLElBQU0sU0FBUyxDQUFDLE1BQU07QUFBQSxFQUNsQixPQUFPLEtBQUssUUFBVSxLQUFLLFFBQVUsTUFBTSxRQUFVLE1BQU0sUUFBVSxNQUFNLFFBQVUsTUFBTSxRQUFVLEtBQUssUUFBVSxLQUFLLFFBQVUsTUFBTSxRQUFVLE1BQU0sUUFBVSxNQUFNLFFBQVUsTUFBTSxRQUFVLE1BQU0sUUFBVSxNQUFNLFFBQVUsS0FBSyxRQUFVLEtBQUssUUFBVSxNQUFNLFFBQVUsTUFBTSxRQUFVLE1BQU0sUUFBVSxNQUFNLFFBQVUsTUFBTSxRQUFVLE1BQU0sUUFBVSxNQUFNLFFBQVUsTUFBTSxRQUFVLE1BQU0sUUFBVSxNQUFNLFFBQVUsTUFBTSxRQUFVLE1BQU0sUUFBVSxNQUFNLFFBQVUsTUFBTSxRQUFVLE1BQU0sUUFBVSxNQUFNLFFBQVUsTUFBTSxRQUFVLE1BQU0sUUFBVSxNQUFNLFFBQVUsTUFBTSxRQUFVLE1BQU0sU0FBVSxNQUFNLFNBQVUsTUFBTSxTQUFVLEtBQUssU0FBVSxLQUFLLFNBQVUsTUFBTSxTQUFVLEtBQUssU0FBVSxLQUFLLFNBQVUsTUFBTSxTQUFVLE1BQU0sU0FBVSxNQUFNLFNBQVUsTUFBTSxTQUFVLE1BQU0sU0FBVSxNQUFNLFNBQVUsS0FBSyxTQUFVLEtBQUssU0FBVSxLQUFLLFNBQVUsS0FBSyxTQUFVLEtBQUssU0FBVSxLQUFLLFNBQVUsS0FBSyxTQUFVLEtBQUssU0FBVSxLQUFLLFNBQVUsS0FBSyxTQUFVLEtBQUssU0FBVSxLQUFLLFNBQVUsS0FBSyxTQUFVLEtBQUssU0FBVSxLQUFLLFNBQVUsS0FBSyxTQUFVLEtBQUssU0FBVSxLQUFLLFNBQVUsS0FBSyxTQUFVLEtBQUssU0FBVSxLQUFLLFNBQVUsS0FBSyxTQUFVLEtBQUssU0FBVSxLQUFLLFNBQVUsS0FBSyxTQUFVLEtBQUssU0FBVSxLQUFLLFNBQVUsS0FBSyxTQUFVLEtBQUssU0FBVSxLQUFLLFNBQVUsS0FBSyxTQUFVLEtBQUssU0FBVSxLQUFLLFNBQVUsS0FBSyxTQUFVLEtBQUssU0FBVSxLQUFLLFNBQVUsS0FBSyxTQUFVLEtBQUssU0FBVSxLQUFLLFNBQVUsS0FBSyxTQUFVLEtBQUssU0FBVSxLQUFLLFNBQVUsS0FBSyxTQUFVLEtBQUssU0FBVSxLQUFLLFNBQVcsS0FBSyxTQUFXLE1BQU0sU0FBVyxNQUFNLFNBQVcsS0FBSyxTQUFXLEtBQUssVUFBVyxLQUFLLFVBQVcsS0FBSyxVQUFXLEtBQUssVUFBVyxLQUFLLFVBQVcsS0FBSyxVQUFXLEtBQUssVUFBVyxLQUFLLFVBQVcsS0FBSyxVQUFXLE1BQU0sVUFBVyxNQUFNLFVBQVcsS0FBSyxVQUFXLEtBQUssVUFBVyxNQUFNLFVBQVcsS0FBSyxVQUFXLEtBQUssVUFBVyxNQUFNLFVBQVcsS0FBSyxVQUFXLEtBQUssVUFBVyxLQUFLLFVBQVcsS0FBSyxVQUFXLE1BQU0sVUFBVyxNQUFNLFVBQVcsTUFBTSxVQUFXLEtBQUssVUFBVyxLQUFLLFVBQVcsS0FBSyxVQUFXLEtBQUssVUFBVyxLQUFLLFVBQVcsS0FBSyxVQUFXLEtBQUssVUFBVyxLQUFLLFVBQVcsTUFBTSxVQUFXLE1BQU0sVUFBVyxLQUFLLFVBQVcsS0FBSyxVQUFXLEtBQUssVUFBVyxLQUFLLFVBQVcsS0FBSyxVQUFXLEtBQUssVUFBVyxLQUFLLFVBQVcsS0FBSyxVQUFXLEtBQUssVUFBVyxLQUFLLFVBQVcsS0FBSyxVQUFXLEtBQUssVUFBVyxLQUFLLFVBQVcsS0FBSyxVQUFXLEtBQUssVUFBVyxLQUFLLFVBQVcsTUFBTSxVQUFXLEtBQUssVUFBVyxLQUFLLFVBQVcsTUFBTSxVQUFXLEtBQUssVUFBVyxLQUFLLFVBQVcsS0FBSyxVQUFXLEtBQUssVUFBVyxLQUFLLFVBQVcsS0FBSyxVQUFXLEtBQUssVUFBVyxLQUFLLFVBQVcsTUFBTSxVQUFXLE1BQU0sVUFBVyxNQUFNLFVBQVcsTUFBTSxVQUFXLEtBQUssVUFBVyxLQUFLLFVBQVcsS0FBSyxVQUFXLEtBQUssVUFBVyxNQUFNLFVBQVcsS0FBSyxVQUFXLEtBQUssVUFBVyxLQUFLLFVBQVcsS0FBSyxVQUFXLEtBQUssVUFBVyxLQUFLLFVBQVcsTUFBTSxVQUFXLE1BQU0sVUFBVyxLQUFLLFVBQVcsS0FBSyxVQUFXLEtBQUssVUFBVyxLQUFLLFVBQVcsTUFBTSxVQUFXLEtBQUssVUFBVyxLQUFLLFVBQVcsS0FBSyxVQUFXLEtBQUssVUFBVyxLQUFLLFVBQVcsS0FBSyxVQUFXLEtBQUssVUFBVyxLQUFLLFVBQVcsS0FBSyxVQUFXLEtBQUssVUFBVyxLQUFLLFVBQVcsS0FBSyxVQUFXLEtBQUssVUFBVyxLQUFLLFVBQVcsS0FBSyxVQUFXLEtBQUssVUFBVyxLQUFLLFVBQVcsS0FBSyxVQUFXLEtBQUssVUFBVyxLQUFLLFVBQVcsS0FBSyxVQUFXLEtBQUssVUFBVyxLQUFLLFVBQVcsS0FBSztBQUFBOzs7QUNSL3NHLElBQU0sVUFBVTtBQUNoQixJQUFNLGFBQWE7QUFDbkIsSUFBTSxTQUFTO0FBQ2YsSUFBTSxXQUFXO0FBQ2pCLElBQU0sV0FBVztBQUNqQixJQUFNLGNB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O0FBQUEsSUFBQyxJQUFHLENBQUM7QUFBQSxNQUFFO0FBQUEsSUFBTyxNQUFNLElBQUUsTUFBSSxXQUFTLElBQUUsSUFBRyxJQUFFLE1BQUksV0FBUyxLQUFHO0FBQUEsSUFBSSxhQUFXLEdBQUUsR0FBRSxHQUFFLE1BQUk7QUFBQSxNQUFHLFlBQVUsR0FBRSxHQUFFLE1BQUk7QUFBQSxRQUFDLEVBQUUsS0FBSyxZQUFXLENBQUM7QUFBQSxPQUFFO0FBQUEsS0FBRTtBQUFBO0FBQUEsRUFBRyxPQUFPLEtBQUcsRUFBRSxNQUFNLHlCQUFFLElBQUksR0FBRSxFQUFFLEtBQUssWUFBVyxDQUFDLEdBQUUsTUFBSTtBQUFBLElBQUMsRUFBRSxJQUFJLFlBQVcsQ0FBQyxHQUFFLEtBQUcsRUFBRSxNQUFNLHlCQUFFLElBQUksR0FBRSxhQUFhLEtBQUcsRUFBRSxTQUFPLENBQUMsS0FBRyxFQUFFLFdBQVcsS0FBRSxHQUFFLEVBQUUsV0FBUyxPQUFHLEVBQUUsTUFBTTtBQUFBO0FBQUE7QUFBRyxJQUFNLElBQUUsUUFBRyxhQUFZLE1BQUcsT0FBTyxFQUFFLFdBQVMsV0FBUyxFQUFFLFVBQVE7QUFBL0QsSUFBa0UsSUFBRSxRQUFHLFVBQVMsTUFBRyxPQUFPLEVBQUUsUUFBTSxXQUFTLEVBQUUsT0FBSztBQUFHLFNBQVMsQ0FBQyxDQUFDLEdBQUUsR0FBRSxHQUFFLElBQUUsR0FBRTtBQUFBLEVBQUMsTUFBTSxJQUFFLEVBQUUsS0FBRyxDQUFDO0FBQUEsRUFBRSxPQUFPLFNBQUUsR0FBRSxJQUFFLEVBQUUsUUFBTyxFQUFDLE1BQUssTUFBRyxNQUFLLE1BQUUsQ0FBQyxFQUFFLE1BQU07QUFBQSxDQUN0bUMsRUFBRSxJQUFJLENBQUMsR0FBRSxNQUFJLEdBQUcsTUFBSSxJQUFFLElBQUUsSUFBSSxHQUFHLEVBQUUsS0FBSztBQUFBLENBQ3RDO0FBQUE7QUFBRSxJQUFJLElBQUUsTUFBSztBQUFBLEVBQUM7QUFBQSxFQUFNO0FBQUEsRUFBTztBQUFBLEVBQWE7QUFBQSxFQUFHO0FBQUEsRUFBSztBQUFBLEVBQVEsU0FBTztBQUFBLEVBQUcsYUFBVztBQUFBLEVBQUcsZUFBYSxJQUFJO0FBQUEsRUFBSSxVQUFRO0FBQUEsRUFBRSxRQUFNO0FBQUEsRUFBVSxRQUFNO0FBQUEsRUFBRztBQUFBLEVBQU0sWUFBVTtBQUFBLEVBQUcsV0FBVyxDQUFDLEdBQUUsSUFBRSxNQUFHO0FBQUEsSUFBQyxRQUFNLE9BQU0sSUFBRSxHQUFFLFFBQU8sSUFBRSxHQUFFLFFBQU8sR0FBRSxRQUFPLE1BQUssTUFBRztBQUFBLElBQUUsS0FBSyxPQUFLLEdBQUUsS0FBSyxhQUFXLEtBQUssV0FBVyxLQUFLLElBQUksR0FBRSxLQUFLLFFBQU0sS0FBSyxNQUFNLEtBQUssSUFBSSxHQUFFLEtBQUssU0FBTyxLQUFLLE9BQU8sS0FBSyxJQUFJLEdBQUUsS0FBSyxVQUFRLEVBQUUsS0FBSyxJQUFJLEdBQUUsS0FBSyxTQUFPLEdBQUUsS0FBSyxlQUFhLEdBQUUsS0FBSyxRQUFNLEdBQUUsS0FBSyxTQUFPO0FBQUE7QUFBQSxFQUFFLFdBQVcsR0FBRTtBQUFBLElBQUMsS0FBSyxhQUFhLE1BQU07QUFBQTtBQUFBLEVBQUUsYUFBYSxDQUFDLEdBQUUsR0FBRTtBQUFBLElBQUMsTUFBTSxJQUFFLEtBQUssYUFBYSxJQUFJLENBQUMsS0FBRyxDQUFDO0FBQUEsSUFBRSxFQUFFLEtBQUssQ0FBQyxHQUFFLEtBQUssYUFBYSxJQUFJLEdBQUUsQ0FBQztBQUFBO0FBQUEsRUFBRSxFQUFFLENBQUMsR0FBRSxHQUFFO0FBQUEsSUFBQyxLQUFLLGNBQWMsR0FBRSxFQUFDLElBQUcsRUFBQyxDQUFDO0FBQUE7QUFBQSxFQUFFLElBQUksQ0FBQyxHQUFFLEdBQUU7QUFBQSxJQUFDLEtBQUssY0FBYyxHQUFFLEVBQUMsSUFBRyxHQUFFLE1BQUssS0FBRSxDQUFDO0FBQUE7QUFBQSxFQUFFLElBQUksQ0FBQyxNQUFLLEdBQUU7QUFBQSxJQUFDLE1BQU0sSUFBRSxLQUFLLGFBQWEsSUFBSSxDQUFDLEtBQUcsQ0FBQyxHQUFFLElBQUUsQ0FBQztBQUFBLElBQUUsV0FBVSxLQUFLO0FBQUEsTUFBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLEdBQUUsRUFBRSxRQUFNLEVBQUUsS0FBSyxNQUFJLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxHQUFFLENBQUMsQ0FBQztBQUFBLElBQUUsV0FBVSxLQUFLO0FBQUEsTUFBRSxFQUFFO0FBQUE7QUFBQSxFQUFFLE1BQU0sR0FBRTtBQUFBLElBQUMsT0FBTyxJQUFJLFFBQVEsT0FBRztBQUFBLE1BQUMsSUFBRyxLQUFLLGNBQWE7QUFBQSxRQUFDLElBQUcsS0FBSyxhQUFhO0FBQUEsVUFBUSxPQUFPLEtBQUssUUFBTSxVQUFTLEtBQUssTUFBTSxHQUFFLEVBQUUsQ0FBQztBQUFBLFFBQUUsS0FBSyxhQUFhLGlCQUFpQixTQUFRLE1BQUk7QUFBQSxVQUFDLEtBQUssUUFBTSxVQUFTLEtBQUssTUFBTTtBQUFBLFdBQUcsRUFBQyxNQUFLLEtBQUUsQ0FBQztBQUFBLE1BQUM7QUFBQSxNQUFDLEtBQUssS0FBRyxFQUFFLGdCQUFnQixFQUFDLE9BQU0sS0FBSyxPQUFNLFNBQVEsR0FBRSxRQUFPLElBQUcsbUJBQWtCLElBQUcsVUFBUyxLQUFFLENBQUMsR0FBRSxLQUFLLEdBQUcsT0FBTyxHQUFFLEtBQUssS0FBSyxxQkFBd0IsYUFBRyxLQUFLLGNBQWMsS0FBSyxLQUFLLGtCQUFpQixJQUFFLEdBQUUsS0FBSyxNQUFNLEdBQUcsWUFBVyxLQUFLLFVBQVUsR0FBRSxFQUFFLEtBQUssT0FBTSxJQUFFLEdBQUUsS0FBSyxPQUFPLEdBQUcsVUFBUyxLQUFLLE1BQU0sR0FBRSxLQUFLLE9BQU8sR0FBRSxLQUFLLEtBQUssVUFBUyxNQUFJO0FBQUEsUUFBQyxLQUFLLE9BQU8sTUFBTSx5QkFBRSxJQUFJLEdBQUUsS0FBSyxPQUFPLElBQUksVUFBUyxLQUFLLE1BQU0sR0FBRSxFQUFFLEtBQUssT0FBTSxLQUFFLEdBQUUsRUFBRSxLQUFLLEtBQUs7QUFBQSxPQUFFLEdBQUUsS0FBSyxLQUFLLFVBQVMsTUFBSTtBQUFBLFFBQUMsS0FBSyxPQUFPLE1BQU0seUJBQUUsSUFBSSxHQUFFLEtBQUssT0FBTyxJQUFJLFVBQVMsS0FBSyxNQUFNLEdBQUUsRUFBRSxLQUFLLE9BQU0sS0FBRSxHQUFFLEVBQUUsQ0FBQztBQUFBLE9BQUU7QUFBQSxLQUFFO0FBQUE7QUFBQSxFQUFFLFlBQVksQ0FBQyxHQUFFLEdBQUU7QUFBQSxJQUFDLE9BQU8sTUFBSTtBQUFBO0FBQUEsRUFBSSxTQUFTLENBQUMsR0FBRTtBQUFBLElBQUMsS0FBSyxRQUFNLEdBQUUsS0FBSyxLQUFLLFNBQVEsS0FBSyxLQUFLO0FBQUE7QUFBQSxFQUFFLGFBQWEsQ0FBQyxHQUFFLEdBQUU7QUFBQSxJQUFDLEtBQUssWUFBVSxLQUFHLElBQUcsS0FBSyxLQUFLLGFBQVksS0FBSyxTQUFTLEdBQUUsS0FBRyxLQUFLLFVBQVEsS0FBSyxPQUFLLEtBQUssR0FBRyxNQUFNLEtBQUssU0FBUyxHQUFFLEtBQUssVUFBUSxLQUFLLEdBQUc7QUFBQTtBQUFBLEVBQVEsZUFBZSxHQUFFO0FBQUEsSUFBQyxLQUFLLElBQUksTUFBTSxNQUFLLEVBQUMsTUFBSyxNQUFHLE1BQUssSUFBRyxDQUFDLEdBQUUsS0FBSyxjQUFjLEVBQUU7QUFBQTtBQUFBLEVBQUUsVUFBVSxDQUFDLEdBQUUsR0FBRTtBQUFBLElBQUMsSUFBRyxLQUFLLFVBQVEsRUFBRSxTQUFPLGFBQVcsRUFBRSxRQUFNLEtBQUssYUFBYSxHQUFFLENBQUMsS0FBRyxLQUFLLElBQUksTUFBTSxNQUFLLEVBQUMsTUFBSyxNQUFHLE1BQUssSUFBRyxDQUFDLEdBQUUsS0FBSyxVQUFRLEtBQUssSUFBSSxVQUFRLEdBQUUsS0FBSyxjQUFjLEtBQUssSUFBSSxJQUFJLElBQUcsS0FBSyxVQUFRLFlBQVUsS0FBSyxRQUFNLFdBQVUsR0FBRyxTQUFPLENBQUMsS0FBSyxVQUFRLEVBQUUsUUFBUSxJQUFJLEVBQUUsSUFBSSxLQUFHLEtBQUssS0FBSyxVQUFTLEVBQUUsUUFBUSxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUUsRUFBRSxRQUFRLElBQUksRUFBRSxJQUFJLEtBQUcsS0FBSyxLQUFLLFVBQVMsRUFBRSxJQUFJLElBQUcsTUFBSSxFQUFFLFlBQVksTUFBSSxPQUFLLEVBQUUsWUFBWSxNQUFJLFFBQU0sS0FBSyxLQUFLLFdBQVUsRUFBRSxZQUFZLE1BQUksR0FBRyxHQUFFLEtBQUssS0FBSyxPQUFNLEdBQUcsWUFBWSxHQUFFLENBQUMsR0FBRSxHQUFHLFNBQU8sVUFBUztBQUFBLE1BQUMsSUFBRyxLQUFLLEtBQUssVUFBUztBQUFBLFFBQUMsTUFBTSxJQUFFLEtBQUssS0FBSyxTQUFTLEtBQUssS0FBSztBQUFBLFFBQUUsTUFBSSxLQUFLLFFBQU0sYUFBYSxRQUFNLEVBQUUsVUFBUSxHQUFFLEtBQUssUUFBTSxTQUFRLEtBQUssSUFBSSxNQUFNLEtBQUssU0FBUztBQUFBLE1BQUU7QUFBQSxNQUFDLEtBQUssVUFBUSxZQUFVLEtBQUssUUFBTTtBQUFBLElBQVM7QUFBQSxJQUFDLEVBQUUsQ0FBQyxHQUFFLEdBQUcsTUFBSyxHQUFHLFFBQVEsR0FBRSxRQUFRLE1BQUksS0FBSyxRQUFNLFlBQVcsS0FBSyxVQUFRLFlBQVUsS0FBSyxVQUFRLGFBQVcsS0FBSyxLQUFLLFVBQVUsR0FBRSxLQUFLLE9BQU8sSUFBRyxLQUFLLFVBQVEsWUFBVSxLQUFLLFVBQVEsYUFBVyxLQUFLLE1BQU07QUFBQTtBQUFBLEVBQUUsS0FBSyxHQUFFO0FBQUEsSUFBQyxLQUFLLE1BQU0sT0FBTyxHQUFFLEtBQUssTUFBTSxlQUFlLFlBQVcsS0FBSyxVQUFVLEdBQUUsS0FBSyxPQUFPLE1BQU07QUFBQSxDQUMxM0YsR0FBRSxFQUFFLEtBQUssT0FBTSxLQUFFLEdBQUUsS0FBSyxJQUFJLE1BQU0sR0FBRSxLQUFLLEtBQVEsV0FBRSxLQUFLLEtBQUssR0FBRyxLQUFLLFNBQVEsS0FBSyxLQUFLLEdBQUUsS0FBSyxZQUFZO0FBQUE7QUFBQSxFQUFFLGFBQWEsR0FBRTtBQUFBLElBQUMsTUFBTSxJQUFFLFNBQUUsS0FBSyxZQUFXLFFBQVEsT0FBTyxTQUFRLEVBQUMsTUFBSyxNQUFHLE1BQUssTUFBRSxDQUFDLEVBQUUsTUFBTTtBQUFBLENBQ3RNLEVBQUUsU0FBTztBQUFBLElBQUUsS0FBSyxPQUFPLE1BQU0seUJBQUUsS0FBSyxNQUFLLElBQUUsRUFBRSxDQUFDO0FBQUE7QUFBQSxFQUFFLE1BQU0sR0FBRTtBQUFBLElBQUMsTUFBTSxJQUFFLFNBQUUsS0FBSyxRQUFRLElBQUksS0FBRyxJQUFHLFFBQVEsT0FBTyxTQUFRLEVBQUMsTUFBSyxNQUFHLE1BQUssTUFBRSxDQUFDO0FBQUEsSUFBRSxJQUFHLE1BQUksS0FBSyxZQUFXO0FBQUEsTUFBQyxJQUFHLEtBQUssVUFBUTtBQUFBLFFBQVUsS0FBSyxPQUFPLE1BQU0seUJBQUUsSUFBSTtBQUFBLE1BQU07QUFBQSxRQUFDLE1BQU0sSUFBRSxFQUFFLEtBQUssWUFBVyxDQUFDLEdBQUUsSUFBRSxFQUFFLEtBQUssTUFBTTtBQUFBLFFBQUUsSUFBRyxLQUFLLGNBQWMsR0FBRSxHQUFFO0FBQUEsVUFBQyxNQUFNLElBQUUsS0FBSyxJQUFJLEdBQUUsRUFBRSxnQkFBYyxDQUFDLEdBQUUsSUFBRSxLQUFLLElBQUksR0FBRSxFQUFFLGlCQUFlLENBQUM7QUFBQSxVQUFFLElBQUksSUFBRSxFQUFFLE1BQU0sS0FBSyxPQUFHLEtBQUcsQ0FBQztBQUFBLFVBQUUsSUFBRyxNQUFTLFdBQUU7QUFBQSxZQUFDLEtBQUssYUFBVztBQUFBLFlBQUU7QUFBQSxVQUFNO0FBQUEsVUFBQyxJQUFHLEVBQUUsTUFBTSxXQUFTLEdBQUU7QUFBQSxZQUFDLEtBQUssT0FBTyxNQUFNLHlCQUFFLEtBQUssR0FBRSxJQUFFLENBQUMsQ0FBQyxHQUFFLEtBQUssT0FBTyxNQUFNLHdCQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQUEsWUFBRSxNQUFNLElBQUUsRUFBRSxNQUFNO0FBQUEsQ0FDL2dCO0FBQUEsWUFBRSxLQUFLLE9BQU8sTUFBTSxFQUFFLEVBQUUsR0FBRSxLQUFLLGFBQVcsR0FBRSxLQUFLLE9BQU8sTUFBTSx5QkFBRSxLQUFLLEdBQUUsRUFBRSxTQUFPLElBQUUsQ0FBQyxDQUFDO0FBQUEsWUFBRTtBQUFBLFVBQU0sRUFBTSxTQUFHLEVBQUUsTUFBTSxTQUFPLEdBQUU7QUFBQSxZQUFDLElBQUcsSUFBRTtBQUFBLGNBQUUsSUFBRTtBQUFBLFlBQU07QUFBQSxjQUFDLE1BQU0sSUFBRSxJQUFFO0FBQUEsY0FBRSxJQUFFLEtBQUcsS0FBSyxPQUFPLE1BQU0seUJBQUUsS0FBSyxHQUFFLENBQUMsQ0FBQztBQUFBO0FBQUEsWUFBRSxLQUFLLE9BQU8sTUFBTSx3QkFBRSxLQUFLLENBQUM7QUFBQSxZQUFFLE1BQU0sSUFBRSxFQUFFLE1BQU07QUFBQSxDQUNuTyxFQUFFLE1BQU0sQ0FBQztBQUFBLFlBQUUsS0FBSyxPQUFPLE1BQU0sRUFBRSxLQUFLO0FBQUEsQ0FDcEMsQ0FBQyxHQUFFLEtBQUssYUFBVztBQUFBLFlBQUU7QUFBQSxVQUFNO0FBQUEsUUFBQztBQUFBLFFBQUMsS0FBSyxPQUFPLE1BQU0sd0JBQUUsS0FBSyxDQUFDO0FBQUE7QUFBQSxNQUFFLEtBQUssT0FBTyxNQUFNLENBQUMsR0FBRSxLQUFLLFVBQVEsY0FBWSxLQUFLLFFBQU0sV0FBVSxLQUFLLGFBQVc7QUFBQSxJQUFDO0FBQUE7QUFBRTtBQUFFLFNBQVMsQ0FBQyxDQUFDLEdBQUUsR0FBRTtBQUFBLEVBQUMsSUFBRyxNQUFTLGFBQUcsRUFBRSxXQUFTO0FBQUEsSUFBRSxPQUFPO0FBQUEsRUFBRSxNQUFNLElBQUUsRUFBRSxVQUFVLE9BQUcsRUFBRSxVQUFRLENBQUM7QUFBQSxFQUFFLE9BQU8sTUFBSSxLQUFHLElBQUU7QUFBQTtBQUFFLFNBQVMsQ0FBQyxDQUFDLEdBQUUsR0FBRTtBQUFBLEVBQUMsUUFBTyxFQUFFLFNBQU8sT0FBTyxFQUFFLEtBQUssR0FBRyxZQUFZLEVBQUUsU0FBUyxFQUFFLFlBQVksQ0FBQztBQUFBO0FBQUUsU0FBUyxDQUFDLENBQUMsR0FBRSxHQUFFO0FBQUEsRUFBQyxJQUFHO0FBQUEsSUFBRSxPQUFPLElBQUUsSUFBRSxFQUFFO0FBQUE7QUFBRyxJQUFJLElBQUUsY0FBYyxFQUFDO0FBQUEsRUFBQztBQUFBLEVBQWdCO0FBQUEsRUFBUyxlQUFhO0FBQUEsRUFBRyxpQkFBZSxDQUFDO0FBQUEsRUFBRTtBQUFBLEVBQWEsS0FBRztBQUFBLEVBQUUsS0FBRztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLE1BQU8sTUFBTSxHQUFFO0FBQUEsSUFBQyxPQUFPLEtBQUs7QUFBQTtBQUFBLE1BQU8sbUJBQW1CLEdBQUU7QUFBQSxJQUFDLElBQUcsQ0FBQyxLQUFLO0FBQUEsTUFBVSxPQUFPLEVBQUUsQ0FBQyxXQUFVLFFBQVEsR0FBRSxHQUFHO0FBQUEsSUFBRSxJQUFHLEtBQUssV0FBUyxLQUFLLFVBQVU7QUFBQSxNQUFPLE9BQU0sR0FBRyxLQUFLO0FBQUEsSUFBa0IsTUFBTSxJQUFFLEtBQUssVUFBVSxNQUFNLEdBQUUsS0FBSyxPQUFPLElBQUcsTUFBSyxLQUFHLEtBQUssVUFBVSxNQUFNLEtBQUssT0FBTztBQUFBLElBQUUsT0FBTSxHQUFHLElBQUksRUFBRSxXQUFVLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRTtBQUFBO0FBQUEsTUFBUSxPQUFPLEdBQUU7QUFBQSxJQUFDLE9BQU8sT0FBTyxLQUFLLE1BQUksYUFBVyxLQUFLLEdBQUcsSUFBRSxLQUFLO0FBQUE7QUFBQSxFQUFHLFdBQVcsQ0FBQyxHQUFFO0FBQUEsSUFBQyxNQUFNLENBQUMsR0FBRSxLQUFLLEtBQUcsRUFBRSxTQUFRLEtBQUssS0FBRyxFQUFFO0FBQUEsSUFBWSxNQUFNLElBQUUsS0FBSztBQUFBLElBQVEsS0FBSyxrQkFBZ0IsQ0FBQyxHQUFHLENBQUMsR0FBRSxLQUFLLFdBQVMsRUFBRSxhQUFXLE1BQUcsS0FBSyxLQUFHLE9BQU8sRUFBRSxXQUFTLGFBQVcsRUFBRSxTQUFPLEVBQUUsVUFBUTtBQUFBLElBQUUsSUFBSTtBQUFBLElBQUUsSUFBRyxFQUFFLGdCQUFjLE1BQU0sUUFBUSxFQUFFLFlBQVksSUFBRSxLQUFLLFdBQVMsSUFBRSxFQUFFLGVBQWEsSUFBRSxFQUFFLGFBQWEsTUFBTSxHQUFFLENBQUMsSUFBRSxDQUFDLEtBQUssWUFBVSxLQUFLLFFBQVEsU0FBTyxNQUFJLElBQUUsQ0FBQyxLQUFLLFFBQVEsR0FBRyxLQUFLLElBQUc7QUFBQSxNQUFFLFdBQVUsS0FBSyxHQUFFO0FBQUEsUUFBQyxNQUFNLElBQUUsRUFBRSxVQUFVLE9BQUcsRUFBRSxVQUFRLENBQUM7QUFBQSxRQUFFLE1BQUksT0FBSyxLQUFLLGVBQWUsQ0FBQyxHQUFFLEtBQUssS0FBRztBQUFBLE1BQUU7QUFBQSxJQUFDLEtBQUssZUFBYSxLQUFLLFFBQVEsS0FBSyxLQUFLLE9BQU0sS0FBSyxHQUFHLE9BQU0sQ0FBQyxHQUFFLE1BQUksS0FBSyxHQUFHLEdBQUUsQ0FBQyxDQUFDLEdBQUUsS0FBSyxHQUFHLGFBQVksT0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQUE7QUFBQSxFQUFFLFlBQVksQ0FBQyxHQUFFLEdBQUU7QUFBQSxJQUFDLE9BQU8sTUFBSSxRQUFLLEtBQUssWUFBVSxLQUFLLGdCQUFjLEVBQUUsU0FBTyxXQUFTLE1BQVMsYUFBRyxNQUFJO0FBQUE7QUFBQSxFQUFHLEVBQUUsQ0FBQyxHQUFFLEdBQUU7QUFBQSxJQUFDLE1BQU0sSUFBRSxFQUFFLFNBQU8sTUFBSyxJQUFFLEVBQUUsU0FBTyxRQUFPLElBQUUsRUFBRSxTQUFPLFVBQVMsSUFBRSxLQUFLLGNBQVksTUFBSSxLQUFLLGNBQVksTUFBSSxJQUFFLEtBQUssSUFBRyxJQUFFLEtBQUssU0FBUSxJQUFFLE1BQVMsYUFBRyxNQUFJLE1BQUksRUFBRSxLQUFLLE9BQUcsQ0FBQyxFQUFFLGFBQVcsS0FBSyxLQUFHLEtBQUssR0FBRyxHQUFFLENBQUMsSUFBRSxLQUFHO0FBQUEsSUFBRSxJQUFHLEVBQUUsU0FBTyxTQUFPLEtBQUcsR0FBRTtBQUFBLE1BQUMsS0FBSyxjQUFZLFFBQUssS0FBSyxnQkFBZ0IsR0FBRSxLQUFLLGNBQWMsR0FBRSxJQUFFLEdBQUUsS0FBSyxlQUFhO0FBQUEsTUFBRztBQUFBLElBQU07QUFBQSxJQUFDLEtBQUcsS0FBRyxLQUFLLEtBQUcsRUFBRSxLQUFLLElBQUcsSUFBRSxLQUFHLEdBQUUsS0FBSyxlQUFlLEdBQUUsS0FBSyxlQUFhLEtBQUssZ0JBQWdCLEtBQUssS0FBSyxPQUFNLEtBQUssYUFBVyxLQUFLLGlCQUFlLENBQUMsS0FBSyxZQUFZLElBQUcsS0FBSyxlQUFhLFFBQUksSUFBRSxLQUFLLFFBQU0sRUFBRSxLQUFLLFVBQVMsS0FBSyxjQUFjLElBQUUsS0FBSyxXQUFTLEtBQUssaUJBQW9CLGNBQUksRUFBRSxTQUFPLFNBQU8sS0FBSyxnQkFBYyxFQUFFLFNBQU8sV0FBUyxLQUFLLGVBQWUsS0FBSyxZQUFZLElBQUUsS0FBSyxlQUFhLFNBQUksS0FBSyxpQkFBZSxLQUFLLGlCQUFlLENBQUMsS0FBSyxZQUFZLElBQUcsS0FBSyxlQUFhO0FBQUE7QUFBQSxFQUFJLFdBQVcsR0FBRTtBQUFBLElBQUMsS0FBSyxpQkFBZSxDQUFDO0FBQUE7QUFBQSxFQUFFLGNBQWMsQ0FBQyxHQUFFO0FBQUEsSUFBQyxLQUFLLGdCQUFnQixXQUFTLE1BQUksS0FBSyxXQUFTLEtBQUssZUFBZSxTQUFTLENBQUMsSUFBRSxLQUFLLGlCQUFlLEtBQUssZUFBZSxPQUFPLE9BQUcsTUFBSSxDQUFDLElBQUUsS0FBSyxpQkFBZSxDQUFDLEdBQUcsS0FBSyxnQkFBZSxDQUFDLElBQUUsS0FBSyxpQkFBZSxDQUFDLENBQUM7QUFBQTtBQUFBLEVBQUcsRUFBRSxDQUFDLEdBQUU7QUFBQSxJQUFDLElBQUcsTUFBSSxLQUFLLElBQUc7QUFBQSxNQUFDLEtBQUssS0FBRztBQUFBLE1BQUUsTUFBTSxJQUFFLEtBQUs7QUFBQSxNQUFRLEtBQUcsS0FBSyxLQUFHLEtBQUssa0JBQWdCLEVBQUUsT0FBTyxPQUFHLEtBQUssS0FBSyxHQUFFLENBQUMsQ0FBQyxJQUFFLEtBQUssa0JBQWdCLENBQUMsR0FBRyxDQUFDO0FBQUEsTUFBRSxNQUFNLElBQUUsRUFBRSxLQUFLLGNBQWEsS0FBSyxlQUFlO0FBQUEsTUFBRSxLQUFLLEtBQUcsRUFBRSxHQUFFLEdBQUUsS0FBSyxlQUFlO0FBQUEsTUFBRSxNQUFNLElBQUUsS0FBSyxnQkFBZ0IsS0FBSztBQUFBLE1BQUksS0FBRyxDQUFDLEVBQUUsV0FBUyxLQUFLLGVBQWEsRUFBRSxRQUFNLEtBQUssZUFBa0IsV0FBRSxLQUFLLGFBQVcsS0FBSyxpQkFBb0IsWUFBRSxLQUFLLGVBQWUsS0FBSyxZQUFZLElBQUUsS0FBSyxZQUFZO0FBQUEsSUFBRTtBQUFBO0FBQUU7QUFBMFYsSUFBTSxJQUFFLEVBQUMsR0FBRSxFQUFDLE1BQUssUUFBTyxLQUFJLEVBQUMsR0FBRSxHQUFFLEVBQUMsTUFBSyxTQUFRLEtBQUksRUFBQyxHQUFFLEdBQUUsRUFBQyxNQUFLLE9BQU0sS0FBSSxFQUFDLEVBQUM7QUFBRSxTQUFTLENBQUMsQ0FBQyxHQUFFO0FBQUEsRUFBQyxPQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxPQUFHLEVBQUUsRUFBRTtBQUFBO0FBQUUsU0FBUyxDQUFDLENBQUMsR0FBRTtBQUFBLEVBQUMsTUFBTSxJQUFFLElBQUksS0FBSyxlQUFlLEdBQUUsRUFBQyxNQUFLLFdBQVUsT0FBTSxXQUFVLEtBQUksVUFBUyxDQUFDLEVBQUUsY0FBYyxJQUFJLEtBQUssTUFBSSxHQUFFLEVBQUUsQ0FBQyxHQUFFLElBQUUsQ0FBQztBQUFBLEVBQUUsSUFBSSxJQUFFO0FBQUEsRUFBSSxXQUFVLEtBQUs7QUFBQSxJQUFFLEVBQUUsU0FBTyxZQUFVLElBQUUsRUFBRSxNQUFNLEtBQUssS0FBRyxFQUFFLFNBQU8sRUFBRSxTQUFPLFVBQVEsRUFBRSxTQUFPLFdBQVMsRUFBRSxTQUFPLFVBQVEsRUFBRSxLQUFLLEVBQUMsTUFBSyxFQUFFLE1BQUssS0FBSSxFQUFFLFNBQU8sU0FBTyxJQUFFLEVBQUMsQ0FBQztBQUFBLEVBQUUsT0FBTSxFQUFDLFVBQVMsR0FBRSxXQUFVLEVBQUM7QUFBQTtBQUFFLFNBQVMsQ0FBQyxDQUFDLEdBQUU7QUFBQSxFQUFDLE9BQU8sT0FBTyxVQUFVLEtBQUcsS0FBSyxRQUFRLE1BQUssR0FBRyxHQUFFLEVBQUUsS0FBRztBQUFBO0FBQUUsU0FBUyxDQUFDLENBQUMsR0FBRTtBQUFBLEVBQUMsT0FBTSxFQUFDLE1BQUssRUFBRSxFQUFFLElBQUksR0FBRSxPQUFNLEVBQUUsRUFBRSxLQUFLLEdBQUUsS0FBSSxFQUFFLEVBQUUsR0FBRyxFQUFDO0FBQUE7QUFBRSxTQUFTLENBQUMsQ0FBQyxHQUFFLEdBQUU7QUFBQSxFQUFDLE9BQU8sSUFBSSxLQUFLLEtBQUcsTUFBSyxLQUFHLEdBQUUsQ0FBQyxFQUFFLFFBQVE7QUFBQTtBQUFFLFNBQVMsQ0FBQyxDQUFDLEdBQUU7QUFBQSxFQUFDLFFBQU0sTUFBSyxHQUFFLE9BQU0sR0FBRSxLQUFJLE1BQUcsRUFBRSxDQUFDO0FBQUEsRUFBRSxJQUFHLENBQUMsS0FBRyxJQUFFLEtBQUcsSUFBRSxRQUFNLENBQUMsS0FBRyxJQUFFLEtBQUcsSUFBRSxNQUFJLENBQUMsS0FBRyxJQUFFO0FBQUEsSUFBRTtBQUFBLEVBQU8sTUFBTSxJQUFFLElBQUksS0FBSyxLQUFLLElBQUksR0FBRSxJQUFFLEdBQUUsQ0FBQyxDQUFDO0FBQUEsRUFBRSxJQUFHLEVBQUUsRUFBRSxlQUFlLE1BQUksS0FBRyxFQUFFLFlBQVksTUFBSSxJQUFFLEtBQUcsRUFBRSxXQUFXLE1BQUk7QUFBQSxJQUFHLE9BQU0sRUFBQyxNQUFLLEdBQUUsT0FBTSxHQUFFLEtBQUksRUFBQztBQUFBO0FBQUUsU0FBUyxDQUFDLENBQUMsR0FBRTtBQUFBLEVBQUMsTUFBTSxJQUFFLEVBQUUsQ0FBQztBQUFBLEVBQUUsT0FBTyxJQUFFLElBQUksS0FBSyxLQUFLLElBQUksRUFBRSxNQUFLLEVBQUUsUUFBTSxHQUFFLEVBQUUsR0FBRyxDQUFDLElBQU87QUFBQTtBQUFFLFNBQVMsRUFBRSxDQUFDLEdBQUUsR0FBRSxHQUFFLEdBQUU7QUFBQSxFQUFDLE1BQU0sSUFBRSxJQUFFLEVBQUMsTUFBSyxFQUFFLGVBQWUsR0FBRSxPQUFNLEVBQUUsWUFBWSxJQUFFLEdBQUUsS0FBSSxFQUFFLFdBQVcsRUFBQyxJQUFFLE1BQUssSUFBRSxJQUFFLEVBQUMsTUFBSyxFQUFFLGVBQWUsR0FBRSxPQUFNLEVBQUUsWUFBWSxJQUFFLEdBQUUsS0FBSSxFQUFFLFdBQVcsRUFBQyxJQUFFO0FBQUEsRUFBSyxPQUFPLE1BQUksU0FBTyxFQUFDLEtBQUksR0FBRyxRQUFNLEdBQUUsS0FBSSxHQUFHLFFBQU0sS0FBSSxJQUFFLE1BQUksVUFBUSxFQUFDLEtBQUksS0FBRyxFQUFFLFNBQU8sRUFBRSxPQUFLLEVBQUUsUUFBTSxHQUFFLEtBQUksS0FBRyxFQUFFLFNBQU8sRUFBRSxPQUFLLEVBQUUsUUFBTSxHQUFFLElBQUUsRUFBQyxLQUFJLEtBQUcsRUFBRSxTQUFPLEVBQUUsUUFBTSxFQUFFLFVBQVEsRUFBRSxRQUFNLEVBQUUsTUFBSSxHQUFFLEtBQUksS0FBRyxFQUFFLFNBQU8sRUFBRSxRQUFNLEVBQUUsVUFBUSxFQUFFLFFBQU0sRUFBRSxNQUFJLEVBQUUsRUFBRSxNQUFLLEVBQUUsS0FBSyxFQUFDO0FBQUE7QUFBQTtBQUFFLE1BQU0sV0FBVyxFQUFDO0FBQUEsRUFBQztBQUFBLEVBQUc7QUFBQSxFQUFHO0FBQUEsRUFBRztBQUFBLEVBQUc7QUFBQSxFQUFHLEtBQUcsRUFBQyxjQUFhLEdBQUUsbUJBQWtCLEVBQUM7QUFBQSxFQUFFLEtBQUc7QUFBQSxFQUFHLEtBQUc7QUFBQSxFQUFLLGNBQVk7QUFBQSxNQUFPLGFBQWEsR0FBRTtBQUFBLElBQUMsT0FBTSxLQUFJLEtBQUssR0FBRTtBQUFBO0FBQUEsTUFBTSxhQUFhLEdBQUU7QUFBQSxJQUFDLE9BQU0sS0FBSSxLQUFLLEdBQUU7QUFBQTtBQUFBLE1BQU0sUUFBUSxHQUFFO0FBQUEsSUFBQyxPQUFPLEtBQUs7QUFBQTtBQUFBLE1BQU8sU0FBUyxHQUFFO0FBQUEsSUFBQyxPQUFPLEtBQUs7QUFBQTtBQUFBLE1BQU8sY0FBYyxHQUFFO0FBQUEsSUFBQyxPQUFPLEtBQUssR0FBRyxLQUFLLEVBQUU7QUFBQTtBQUFBLEVBQUUsRUFBRSxDQUFDLEdBQUU7QUFBQSxJQUFDLE9BQU8sS0FBSyxHQUFHLElBQUksT0FBRyxFQUFFLEVBQUUsS0FBSyxFQUFFLEtBQUssS0FBSyxFQUFFO0FBQUE7QUFBQSxFQUFFLEVBQUUsR0FBRTtBQUFBLElBQUMsS0FBSyxjQUFjLEtBQUssR0FBRyxLQUFLLEVBQUUsQ0FBQyxHQUFFLEtBQUssVUFBVSxFQUFFLEtBQUssRUFBRSxLQUFRLFNBQUM7QUFBQTtBQUFBLEVBQUUsV0FBVyxDQUFDLEdBQUU7QUFBQSxJQUFDLE1BQU0sSUFBRSxFQUFFLFNBQU8sRUFBQyxVQUFTLEVBQUUsRUFBRSxNQUFNLEdBQUUsV0FBVSxFQUFFLGFBQVcsSUFBRyxJQUFFLEVBQUUsRUFBRSxNQUFNLEdBQUUsSUFBRSxFQUFFLGFBQVcsRUFBRSxXQUFVLElBQUUsRUFBRSxTQUFPLEVBQUUsRUFBRSxNQUFNLElBQUUsRUFBRSxVQUFTLElBQUUsRUFBRSxnQkFBYyxFQUFFLGNBQWEsSUFBRSxJQUFFLEVBQUMsTUFBSyxPQUFPLEVBQUUsZUFBZSxDQUFDLEVBQUUsU0FBUyxHQUFFLEdBQUcsR0FBRSxPQUFNLE9BQU8sRUFBRSxZQUFZLElBQUUsQ0FBQyxFQUFFLFNBQVMsR0FBRSxHQUFHLEdBQUUsS0FBSSxPQUFPLEVBQUUsV0FBVyxDQUFDLEVBQUUsU0FBUyxHQUFFLEdBQUcsRUFBQyxJQUFFLEVBQUMsTUFBSyxRQUFPLE9BQU0sTUFBSyxLQUFJLEtBQUksR0FBRSxJQUFFLEVBQUUsSUFBSSxPQUFHLEVBQUUsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDO0FBQUEsSUFBRSxNQUFNLEtBQUksR0FBRSxrQkFBaUIsRUFBQyxHQUFFLEtBQUUsR0FBRSxLQUFLLEtBQUcsR0FBRSxLQUFLLEtBQUcsR0FBRSxLQUFLLEtBQUcsR0FBRSxLQUFLLEtBQUcsRUFBRSxTQUFRLEtBQUssS0FBRyxFQUFFLFNBQVEsS0FBSyxHQUFHLEdBQUUsS0FBSyxHQUFHLFVBQVMsT0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUUsS0FBSyxHQUFHLE9BQU0sQ0FBQyxHQUFFLE1BQUksS0FBSyxHQUFHLEdBQUUsQ0FBQyxDQUFDLEdBQUUsS0FBSyxHQUFHLFlBQVcsTUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQUE7QUFBQSxFQUFFLEVBQUUsR0FBRTtBQUFBLElBQUMsTUFBTSxJQUFFLEtBQUssSUFBSSxHQUFFLEtBQUssSUFBSSxLQUFLLEdBQUcsY0FBYSxLQUFLLEdBQUcsU0FBTyxDQUFDLENBQUMsR0FBRSxJQUFFLEtBQUssR0FBRztBQUFBLElBQUcsSUFBRztBQUFBLE1BQUUsT0FBTyxLQUFLLEdBQUcsb0JBQWtCLEtBQUssSUFBSSxHQUFFLEtBQUssSUFBSSxLQUFLLEdBQUcsbUJBQWtCLEVBQUUsTUFBSSxDQUFDLENBQUMsR0FBRSxFQUFDLFNBQVEsR0FBRSxPQUFNLEVBQUM7QUFBQTtBQUFBLEVBQUUsRUFBRSxDQUFDLEdBQUU7QUFBQSxJQUFDLEtBQUssY0FBWSxJQUFHLEtBQUssS0FBRztBQUFBLElBQUssTUFBTSxJQUFFLEtBQUssR0FBRztBQUFBLElBQUUsTUFBSSxLQUFLLEdBQUcsZUFBYSxLQUFLLElBQUksR0FBRSxLQUFLLElBQUksS0FBSyxHQUFHLFNBQU8sR0FBRSxFQUFFLFFBQU0sQ0FBQyxDQUFDLEdBQUUsS0FBSyxHQUFHLG9CQUFrQixHQUFFLEtBQUssS0FBRztBQUFBO0FBQUEsRUFBSSxFQUFFLENBQUMsR0FBRTtBQUFBLElBQUMsTUFBTSxJQUFFLEtBQUssR0FBRztBQUFBLElBQUUsSUFBRyxDQUFDO0FBQUEsTUFBRTtBQUFBLElBQU8sUUFBTSxTQUFRLE1BQUcsR0FBRSxJQUFFLEtBQUssR0FBRyxFQUFFLE9BQU0sSUFBRSxDQUFDLEtBQUcsRUFBRSxRQUFRLE1BQUssRUFBRSxNQUFJLElBQUcsSUFBRSxPQUFPLFVBQVUsS0FBRyxLQUFLLFFBQVEsTUFBSyxHQUFHLEdBQUUsRUFBRSxLQUFHLEdBQUUsSUFBRSxHQUFHLEVBQUUsTUFBSyxFQUFFLEtBQUssRUFBRSxHQUFFLEtBQUssSUFBRyxLQUFLLEVBQUU7QUFBQSxJ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TUFBTTtBQUFBLE1BQUMsS0FBSyxNQUFJLENBQUMsTUFBSSxLQUFLLEdBQUcsRUFBRSxRQUFNLElBQUksT0FBTyxFQUFFLEdBQUcsR0FBRSxLQUFLLEdBQUcsb0JBQWtCLElBQUcsS0FBSyxLQUFHLE9BQUcsS0FBSyxLQUFHO0FBQUEsTUFBSyxNQUFNLElBQUUsS0FBSyxHQUFHLEVBQUUsT0FBTSxJQUFFLEVBQUUsUUFBUSxHQUFHLEdBQUUsSUFBRSxLQUFHLElBQUUsSUFBRSxLQUFLLElBQUksS0FBSyxHQUFHLG1CQUFrQixFQUFFLE1BQUksQ0FBQztBQUFBLE1BQUUsSUFBRyxJQUFFLEtBQUcsS0FBRyxFQUFFO0FBQUEsUUFBSTtBQUFBLE1BQU8sSUFBSSxJQUFFLEVBQUUsTUFBTSxHQUFFLENBQUMsSUFBRSxJQUFFLEVBQUUsTUFBTSxJQUFFLENBQUMsR0FBRSxJQUFFO0FBQUEsTUFBRyxJQUFHLE1BQUksS0FBRyxNQUFJLFNBQU8sRUFBRSxTQUFPLFdBQVMsRUFBRSxTQUFPLFFBQU87QUFBQSxRQUFDLE1BQU0sSUFBRSxPQUFPLFNBQVMsR0FBRSxFQUFFO0FBQUEsUUFBRSxJQUFFLElBQUksS0FBSSxJQUFFLE1BQUksRUFBRSxTQUFPLFVBQVEsSUFBRTtBQUFBLE1BQUU7QUFBQSxNQUFDLElBQUcsRUFBRSxTQUFPLFdBQVMsS0FBRyxFQUFFLFFBQVEsTUFBSyxFQUFFLElBQUUsR0FBRyxTQUFTLEVBQUUsS0FBSSxHQUFHLElBQUcsQ0FBQyxFQUFFLFNBQVMsR0FBRyxHQUFFO0FBQUEsUUFBQyxNQUFNLElBQUUsS0FBSSxLQUFLLEtBQUksRUFBRSxPQUFNLEVBQUMsR0FBRSxJQUFFLEtBQUssR0FBRyxHQUFFLENBQUM7QUFBQSxRQUFFLElBQUcsR0FBRTtBQUFBLFVBQUMsS0FBSyxjQUFZO0FBQUEsVUFBRTtBQUFBLFFBQU07QUFBQSxNQUFDO0FBQUEsTUFBQyxLQUFLLGNBQVksSUFBRyxLQUFLLEdBQUcsRUFBRSxRQUFNO0FBQUEsTUFBRSxNQUFNLElBQUUsRUFBRSxTQUFTLEdBQUcsSUFBTyxZQUFFLEVBQUUsS0FBSyxFQUFFO0FBQUEsTUFBRSxJQUFHLEdBQUU7QUFBQSxRQUFDLFFBQU0sTUFBSyxHQUFFLE9BQU0sTUFBRyxHQUFFLElBQUUsRUFBRSxHQUFFLENBQUM7QUFBQSxRQUFFLEtBQUssS0FBRyxFQUFDLE1BQUssT0FBTyxLQUFLLElBQUksR0FBRSxLQUFLLElBQUksTUFBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLFNBQVMsR0FBRSxHQUFHLEdBQUUsT0FBTSxPQUFPLEtBQUssSUFBSSxHQUFFLEtBQUssSUFBSSxJQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsU0FBUyxHQUFFLEdBQUcsR0FBRSxLQUFJLE9BQU8sS0FBSyxJQUFJLEdBQUUsS0FBSyxJQUFJLEdBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLFNBQVMsR0FBRSxHQUFHLEVBQUM7QUFBQSxNQUFDO0FBQUEsTUFBQyxLQUFLLEdBQUc7QUFBQSxNQUFFLE1BQU0sSUFBRSxFQUFFLFFBQVEsR0FBRztBQUFBLE1BQUUsS0FBRyxLQUFLLEtBQUcsTUFBRyxLQUFLLEtBQUcsS0FBRyxLQUFHLElBQUUsS0FBSyxHQUFHLG9CQUFrQixJQUFFLEtBQUcsS0FBRyxFQUFFLFFBQU0sS0FBSyxHQUFHLFNBQU8sS0FBRyxLQUFLLEdBQUcsZUFBYSxFQUFFLFFBQU0sR0FBRSxLQUFLLEdBQUcsb0JBQWtCLEdBQUUsS0FBSyxLQUFHLFFBQUksS0FBSyxHQUFHLG9CQUFrQixLQUFLLElBQUksSUFBRSxHQUFFLEVBQUUsTUFBSSxDQUFDO0FBQUEsSUFBQztBQUFBO0FBQUEsRUFBRSxFQUFFLENBQUMsR0FBRSxHQUFFO0FBQUEsSUFBQyxRQUFNLE9BQU0sR0FBRSxLQUFJLE1BQUcsRUFBRSxDQUFDO0FBQUEsSUFBRSxJQUFHLEVBQUUsU0FBTyxZQUFVLElBQUUsS0FBRyxJQUFFO0FBQUEsTUFBSSxPQUFPLEVBQUUsS0FBSyxTQUFTO0FBQUEsSUFBYSxJQUFHLEVBQUUsU0FBTyxVQUFRLElBQUUsS0FBRyxJQUFFO0FBQUEsTUFBSSxPQUFPLEVBQUUsS0FBSyxTQUFTLFdBQVcsSUFBRyxXQUFXO0FBQUE7QUFBQSxFQUFFLEVBQUUsQ0FBQyxHQUFFO0FBQUEsSUFBQyxRQUFNLE1BQUssR0FBRSxPQUFNLEdBQUUsS0FBSSxNQUFHLEVBQUUsS0FBSyxFQUFFO0FBQUEsSUFBRSxJQUFHLEtBQUcsS0FBRyxHQUFFO0FBQUEsTUFBQyxNQUFNLElBQUUsRUFBRSxHQUFFLENBQUM7QUFBQSxNQUFFLEtBQUssS0FBRyxLQUFJLEtBQUssSUFBRyxLQUFJLE9BQU8sS0FBSyxJQUFJLEdBQUUsQ0FBQyxDQUFDLEVBQUUsU0FBUyxHQUFFLEdBQUcsRUFBQztBQUFBLElBQUM7QUFBQSxJQUFDLEtBQUssUUFBTSxFQUFFLEtBQUssRUFBRSxLQUFHLEVBQUUsZ0JBQW1CO0FBQUE7QUFBRTtBQUFBO0FBQUMsTUFBTSxXQUFXLEVBQUM7QUFBQSxFQUFDO0FBQUEsRUFBUSxTQUFPO0FBQUEsRUFBRTtBQUFBLEVBQUcsYUFBYSxDQUFDLEdBQUU7QUFBQSxJQUFDLE9BQU8sS0FBSyxRQUFRLE9BQU8sT0FBRyxFQUFFLFVBQVEsQ0FBQztBQUFBO0FBQUEsRUFBRSxlQUFlLENBQUMsR0FBRTtBQUFBLElBQUMsTUFBTSxJQUFFLEtBQUssY0FBYyxDQUFDLEdBQUUsSUFBRSxLQUFLO0FBQUEsSUFBTSxPQUFPLE1BQVMsWUFBRSxRQUFHLEVBQUUsTUFBTSxPQUFHLEVBQUUsU0FBUyxFQUFFLEtBQUssQ0FBQztBQUFBO0FBQUEsRUFBRSxXQUFXLEdBQUU7QUFBQSxJQUFDLE1BQU0sSUFBRSxLQUFLLFFBQVEsS0FBSztBQUFBLElBQVEsSUFBRyxLQUFLLFVBQWEsY0FBSSxLQUFLLFFBQU0sQ0FBQyxJQUFHLEVBQUUsVUFBUSxNQUFHO0FBQUEsTUFBQyxNQUFNLElBQUUsRUFBRSxPQUFNLElBQUUsS0FBSyxjQUFjLENBQUM7QUFBQSxNQUFFLEtBQUssZ0JBQWdCLENBQUMsSUFBRSxLQUFLLFFBQU0sS0FBSyxNQUFNLE9BQU8sT0FBRyxFQUFFLFVBQVUsT0FBRyxFQUFFLFVBQVEsQ0FBQyxNQUFJLEVBQUUsSUFBRSxLQUFLLFFBQU0sQ0FBQyxHQUFHLEtBQUssT0FBTSxHQUFHLEVBQUUsSUFBSSxPQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUUsS0FBSyxRQUFNLE1BQU0sS0FBSyxJQUFJLElBQUksS0FBSyxLQUFLLENBQUM7QUFBQSxJQUFDLEVBQUs7QUFBQSxNQUFDLE1BQU0sSUFBRSxLQUFLLE1BQU0sU0FBUyxFQUFFLEtBQUs7QUFBQSxNQUFFLEtBQUssUUFBTSxJQUFFLEtBQUssTUFBTSxPQUFPLE9BQUcsTUFBSSxFQUFFLEtBQUssSUFBRSxDQUFDLEdBQUcsS0FBSyxPQUFNLEVBQUUsS0FBSztBQUFBO0FBQUE7QUFBQSxFQUFHLFdBQVcsQ0FBQyxHQUFFO0FBQUEsSUFBQyxNQUFNLEdBQUUsS0FBRTtBQUFBLElBQUUsUUFBTSxTQUFRLE1BQUc7QUFBQSxJQUFFLEtBQUssS0FBRyxFQUFFLHFCQUFtQixPQUFHLEtBQUssVUFBUSxPQUFPLFFBQVEsQ0FBQyxFQUFFLFFBQVEsRUFBRSxHQUFFLE9BQUssQ0FBQyxFQUFDLE9BQU0sR0FBRSxPQUFNLE1BQUcsT0FBTSxFQUFDLEdBQUUsR0FBRyxFQUFFLElBQUksUUFBSSxLQUFJLEdBQUUsT0FBTSxFQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUUsS0FBSyxRQUFNLENBQUMsR0FBRyxFQUFFLGlCQUFlLENBQUMsQ0FBQyxHQUFFLEtBQUssU0FBTyxLQUFLLElBQUksS0FBSyxRQUFRLFVBQVUsR0FBRSxPQUFNLFFBQUssTUFBSSxFQUFFLFFBQVEsR0FBRSxLQUFLLEtBQUcsSUFBRSxDQUFDLEdBQUUsS0FBSyxHQUFHLFVBQVMsT0FBRztBQUFBLE1BQUMsUUFBTztBQUFBLGFBQU87QUFBQSxhQUFXLE1BQUs7QUFBQSxVQUFDLEtBQUssU0FBTyxLQUFLLFdBQVMsSUFBRSxLQUFLLFFBQVEsU0FBTyxJQUFFLEtBQUssU0FBTztBQUFBLFVBQUUsTUFBTSxJQUFFLEtBQUssUUFBUSxLQUFLLFNBQVMsVUFBUTtBQUFBLFVBQUcsQ0FBQyxLQUFLLE1BQUksTUFBSSxLQUFLLFNBQU8sS0FBSyxXQUFTLElBQUUsS0FBSyxRQUFRLFNBQU8sSUFBRSxLQUFLLFNBQU87QUFBQSxVQUFHO0FBQUEsUUFBSztBQUFBLGFBQUs7QUFBQSxhQUFXLFNBQVE7QUFBQSxVQUFDLEtBQUssU0FBTyxLQUFLLFdBQVMsS0FBSyxRQUFRLFNBQU8sSUFBRSxJQUFFLEtBQUssU0FBTztBQUFBLFVBQUUsTUFBTSxJQUFFLEtBQUssUUFBUSxLQUFLLFNBQVMsVUFBUTtBQUFBLFVBQUcsQ0FBQyxLQUFLLE1BQUksTUFBSSxLQUFLLFNBQU8sS0FBSyxXQUFTLEtBQUssUUFBUSxTQUFPLElBQUUsSUFBRSxLQUFLLFNBQU87QUFBQSxVQUFHO0FBQUEsUUFBSztBQUFBLGFBQUs7QUFBQSxVQUFRLEtBQUssWUFBWTtBQUFBLFVBQUU7QUFBQTtBQUFBLEtBQU87QUFBQTtBQUFFO0FBQTJvRCxNQUFNLFdBQVcsRUFBQztBQUFBLEVBQUM7QUFBQSxFQUFRLFNBQU87QUFBQSxNQUFNLGNBQWMsR0FBRTtBQUFBLElBQUMsT0FBTyxLQUFLLFFBQVEsS0FBSztBQUFBO0FBQUEsRUFBUSxXQUFXLEdBQUU7QUFBQSxJQUFDLEtBQUssUUFBTSxLQUFLLGVBQWU7QUFBQTtBQUFBLEVBQU0sV0FBVyxDQUFDLEdBQUU7QUFBQSxJQUFDLE1BQU0sR0FBRSxLQUFFLEdBQUUsS0FBSyxVQUFRLEVBQUU7QUFBQSxJQUFRLE1BQU0sSUFBRSxLQUFLLFFBQVEsVUFBVSxHQUFFLE9BQU0sUUFBSyxNQUFJLEVBQUUsWUFBWSxHQUFFLElBQUUsTUFBSSxLQUFHLElBQUU7QUFBQSxJQUFFLEtBQUssU0FBTyxLQUFLLFFBQVEsR0FBRyxXQUFTLEVBQUUsR0FBRSxHQUFFLEtBQUssT0FBTyxJQUFFLEdBQUUsS0FBSyxZQUFZLEdBQUUsS0FBSyxHQUFHLFVBQVMsT0FBRztBQUFBLE1BQUMsUUFBTztBQUFBLGFBQU87QUFBQSxhQUFXO0FBQUEsVUFBSyxLQUFLLFNBQU8sRUFBRSxLQUFLLFFBQU8sSUFBRyxLQUFLLE9BQU87QUFBQSxV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LENBQUMsR0FBRSxHQUFFLEdBQUUsR0FBRSxPQUFJO0FBQUEsRUFBQyxJQUFJLElBQUUsR0FBRSxJQUFFO0FBQUEsRUFBRSxTQUFRLEtBQUUsRUFBRSxLQUFFLEdBQUUsTUFBSTtBQUFBLElBQUMsTUFBTSxJQUFFLEVBQUU7QUFBQSxJQUFHLElBQUcsSUFBRSxJQUFFLEVBQUUsUUFBTyxLQUFJLEtBQUc7QUFBQSxNQUFFO0FBQUEsRUFBSztBQUFBLEVBQUMsT0FBTSxFQUFDLFdBQVUsR0FBRSxVQUFTLEVBQUM7QUFBQTtBQUFwZ0MsSUFBdWdDLEtBQUUsR0FBRSxRQUFPLEdBQUUsU0FBUSxHQUFFLE9BQU0sR0FBRSxRQUFPLElBQUUsUUFBUSxRQUFPLFVBQVMsS0FBRSxPQUFPLG1CQUFrQixlQUFjLElBQUUsR0FBRSxZQUFXLElBQUUsUUFBSztBQUFBLEVBQUMsTUFBTSxLQUFFLEVBQUUsQ0FBQyxJQUFFLEdBQUUsSUFBRSxFQUFHLENBQUMsR0FBRSxJQUFFLEVBQUUsT0FBTSxLQUFLLEdBQUUsS0FBRSxLQUFLLElBQUksSUFBRSxHQUFFLENBQUMsR0FBRSxLQUFFLEtBQUssSUFBSSxLQUFLLElBQUksSUFBRSxFQUFDLEdBQUUsQ0FBQztBQUFBLEVBQUUsSUFBSSxLQUFFO0FBQUEsRUFBRSxLQUFHLEtBQUUsTUFBSSxLQUFFLEtBQUssSUFBSSxLQUFLLElBQUksSUFBRSxLQUFFLEdBQUUsRUFBRSxTQUFPLEVBQUMsR0FBRSxDQUFDO0FBQUEsRUFBRyxJQUFJLElBQUUsS0FBRSxFQUFFLFVBQVEsS0FBRSxHQUFFLElBQUUsS0FBRSxFQUFFLFVBQVEsS0FBRSxLQUFFLEVBQUU7QUFBQSxFQUFPLE1BQU0sS0FBRSxLQUFLLElBQUksS0FBRSxJQUFFLEVBQUUsTUFBTSxHQUFFLElBQUUsQ0FBQztBQUFBLEVBQUUsSUFBSSxJQUFFO0FBQUEsRUFBRSxLQUFHLEtBQUksS0FBRztBQUFBLEVBQUksTUFBTSxJQUFFLE1BQUcsSUFBRSxJQUFFLElBQUcsS0FBRSxNQUFHLElBQUUsSUFBRTtBQUFBLEVBQUcsU0FBUSxJQUFFLEVBQUUsSUFBRSxJQUFFLEtBQUk7QUFBQSxJQUFDLE1BQU0sSUFBRSxTQUFFLEVBQUUsRUFBRSxJQUFHLE1BQUksQ0FBQyxHQUFFLElBQUUsRUFBQyxNQUFLLE1BQUcsTUFBSyxNQUFFLENBQUMsRUFBRSxNQUFNO0FBQUEsQ0FDNy9FO0FBQUEsSUFBRSxFQUFFLEtBQUssQ0FBQyxHQUFFLEtBQUcsRUFBRTtBQUFBLEVBQU07QUFBQSxFQUFDLElBQUcsSUFBRSxJQUFFO0FBQUEsSUFBQyxJQUFJLElBQUUsR0FBRSxJQUFFLEdBQUUsS0FBRTtBQUFBLElBQUUsTUFBTSxLQUFFLElBQUUsR0FBRSxLQUFFLENBQUMsSUFBRSxPQUFJLElBQUcsR0FBRSxJQUFFLElBQUUsSUFBRSxFQUFDO0FBQUEsSUFBRSxLQUFHLEVBQUMsV0FBVSxJQUFFLFVBQVMsRUFBQyxJQUFFLEdBQUUsR0FBRSxFQUFDLEdBQUUsS0FBRSxPQUFJLEVBQUMsV0FBVSxJQUFFLFVBQVMsRUFBQyxJQUFFLEdBQUUsS0FBRSxHQUFFLEVBQUUsTUFBTSxPQUFLLEVBQUMsV0FBVSxJQUFFLFVBQVMsRUFBQyxJQUFFLEdBQUUsS0FBRSxHQUFFLEVBQUUsTUFBTSxHQUFFLEtBQUUsT0FBSSxFQUFDLFdBQVUsSUFBRSxVQUFTLEVBQUMsSUFBRSxHQUFFLEdBQUUsRUFBQyxLQUFJLElBQUUsTUFBSSxJQUFFLE1BQUcsRUFBRSxPQUFPLEdBQUUsQ0FBQyxJQUFHLElBQUUsTUFBSSxJQUFFLE1BQUcsRUFBRSxPQUFPLEVBQUUsU0FBTyxHQUFFLENBQUM7QUFBQSxFQUFFO0FBQUEsRUFBQyxNQUFNLEtBQUUsQ0FBQztBQUFBLEVBQUUsS0FBRyxHQUFFLEtBQUssQ0FBQztBQUFBLEVBQUUsV0FBVSxLQUFLO0FBQUEsSUFBRSxXQUFVLEtBQUs7QUFBQSxNQUFFLEdBQUUsS0FBSyxDQUFDO0FBQUEsRUFBRSxPQUFPLEtBQUcsR0FBRSxLQUFLLENBQUMsR0FBRTtBQUFBO0FBOEIrRSxJQXFCMWQsS0FBRyxDQUFDLElBQUUsSUFBRyxNQUFJO0FB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LE1BQUcsRUFBRSxNQUFNLEdBQUcsRUFBRSxRQUFPLEVBQUM7QUFBQSxDQUM3VTtBQUFBLElBQUUsSUFBSSxLQUFFLEdBQUUsS0FBRTtBQUFBLElBQUUsRUFBRSxHQUFFLEtBQUUsWUFBWSxNQUFJO0FBQUEsTUFBQyxJQUFHLEtBQUcsTUFBSTtBQUFBLFFBQUU7QUFBQSxNQUFPLEdBQUUsR0FBRSxLQUFFO0FBQUEsTUFBRSxNQUFNLEtBQUUsRUFBRSxFQUFFLEdBQUU7QUFBQSxNQUFFLElBQUk7QUFBQSxNQUFFLElBQUc7QUFBQSxRQUFFLEtBQUUsR0FBRyxPQUFNO0FBQUEsTUFBWSxTQUFHLE1BQUk7QUFBQSxRQUFRLEtBQUUsR0FBRyxPQUFNLEtBQUssR0FBRSxDQUFDO0FBQUEsTUFBUTtBQUFBLFFBQUMsTUFBTSxLQUFHLElBQUksT0FBTyxLQUFLLE1BQU0sRUFBQyxDQUFDLEVBQUUsTUFBTSxHQUFFLENBQUM7QUFBQSxRQUFFLEtBQUUsR0FBRyxPQUFNLElBQUk7QUFBQTtBQUFBLE1BQUssTUFBTSxLQUFHLFNBQUUsSUFBRSxHQUFFLEVBQUMsTUFBSyxNQUFHLE1BQUssTUFBRSxDQUFDO0FBQUEsTUFBRSxFQUFFLE1BQU0sRUFBRSxHQUFFLEtBQUUsS0FBRSxJQUFFLEVBQUUsU0FBTyxLQUFFLElBQUUsR0FBRSxLQUFFLEtBQUUsSUFBRSxLQUFFLFFBQUs7QUFBQSxPQUFHLENBQUM7QUFBQSxLQUFHLEtBQUUsQ0FBQyxLQUFFLElBQUcsS0FBRSxHQUFFLEtBQUUsVUFBSztBQUFBLElBQUMsSUFBRyxDQUFDO0FBQUEsTUFBRTtBQUFBLElBQU8sS0FBRSxPQUFHLGNBQWMsRUFBQyxHQUFFLEdBQUU7QUFBQSxJQUFFLE1BQU0sS0FBRSxPQUFJLElBQUUsRUFBRSxTQUFRLEVBQUMsSUFBRSxPQUFJLElBQUUsRUFBRSxPQUFNLEVBQUUsSUFBRSxFQUFFLE9BQU0sRUFBRTtBQUFBLElBQUUsSUFBRSxNQUFHLEdBQUUsT0FBSSxNQUFJLFVBQVEsRUFBRSxNQUFNLEdBQUcsT0FBTSxLQUFLLEdBQUUsQ0FB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QUksRUFBRSxRQUFRLEtBQUssUUFBUSxDQUFDO0FBQUEsRUFDdEMsU0FBUyxJQUFJLE9BQU8sRUFBRSxRQUFRLEtBQUssUUFBUSxDQUFDO0FBQUEsRUFDNUMsT0FBTyxJQUFJLEtBQUssRUFBRSxRQUFRLEtBQUssUUFBUSxDQUFDO0FBQUEsRUFDeEMsV0FBVyxJQUFJLFNBQVMsRUFBRSxRQUFRLEtBQUssUUFBUSxDQUFDO0FBQUEsRUFDaEQsT0FBTyxJQUFJLEtBQUssRUFBRSxRQUFRLEtBQUssUUFBUSxDQUFDO0FBQUEsRUFDeEMsTUFBTSxJQUFJLElBQUksRUFBRSxRQUFRLEtBQUssUUFBUSxDQUFDO0FBQUEsRUFDdEMsVUFBVSxJQUFJLFFBQVEsRUFBRSxRQUFRLEtBQUssUUFBUSxDQUFDO0FBQUEsRUFDOUMsVUFBVSxJQUFJLFFBQVEsRUFBRSxRQUFRLEtBQUssUUFBUSxDQUFDO0FBQUEsRUFDOUMsV0FBVyxJQUFJLFNBQVMsRUFBRSxRQUFRLEtBQUssUUFBUSxDQUFDO0FBQUEsRUFDaEQsT0FBTyxJQUFJLEtBQUssRUFBRSxRQUFRLEtBQUssUUFBUSxDQUFDO0FBQUEsRUFDeEMsT0FBTyxJQUFJLEtBQUssRUFBRSxRQUFRLEtBQUssUUFBUSxDQUFDO0FBQUEsRUFDeEMsTUFBTSxJQUFJLElBQUksRUFBRSxRQUFRLEtBQUssUUFBUSxDQUFDO0FBQUEsRUFDdEMsTUFBTSxJQUFJLElBQUksRUFBRSxRQUFRLEtBQUssUUFBUSxDQUFDO0FBQUEsRUFDdEMsTUFBTSxJQUFJLElBQUksRUFBRSxRQUFRLEtBQUssUUFBUSxDQUFDO0FBQUEsRUFDdEMsWUFBWSxJQUFJLFVBQVUsRUFBRSxRQUFRLEtBQUssUUFBUSxDQUFDO0FBQUEsRUFDbEQsTUFBTSxJQUFJLElBQUksRUFBRSxRQUFRLEtBQUssUUFBUSxDQUFDO0FBQUEsRUFDdEMsT0FBTyxJQUFJLEtBQUssRUFBRSxRQUFRLEtBQUssUUFBUSxDQUFDO0FBQUEsRUFDeEMsUUFBUSxJQUFJLE1BQU0sRUFBRSxRQUFRLEtBQUssUUFBUSxDQUFDO0FBQzlD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TSxZQUFZLFlBQ3pCLDBEQUNKO0FBQUEsTUFFQSxHQUFHLFFBQVE7QUFBQSxNQUNYLEdBQUcsUUFBUSxTQUFTLE9BQU87QUFBQTtBQUFBLElBRy9CLEdBQUcsUUFBUTtBQUFBLElBQ1gsR0FBRyxRQUFRLG9CQUFvQjtBQUFBLElBRy9CLElBQUksY0FBYztBQUFBLE1BQ2QsTUFBTSxhQUFhLFFBQVE7QUFBQSxNQUMzQixlQUFlO0FBQUEsSUFDbkI7QUFBQSxJQUVBLEtBQUksS0FBSyxvQkFBb0I7QUFBQSxJQUMvQixPQUFPLE9BQU87QUFBQSxJQUNaLEVBQUUsS0FBSyxtQkFBbUI7QUFBQSxJQUMxQixNQUFNLFVBQVUsaUJBQWlCLFFBQVEsTUFBTSxVQUFVLE9BQU8sS0FBSztBQUFBLElBQ3JFLEtBQUksTUFBTSxvQkFBb0IsRUFBRSxPQUFPLFFBQVEsQ0FBQztBQUFBLElBQ2hELEdBQUcsTUFBTSxPQUFPO0FBQUEsSUFHaEIsSUFBSSxjQUFjO0FBQUEsTUFDZCxJQUFJO0FBQUEsUUFDQSxNQUFNLGFBQWEsUUFBUTtBQUFBLFFBQzdCLE9BQU8sY0FBYztBQUFBLFFBQ25CLE1BQU0sYUFDRix3QkFBd0IsUUFDbEIsYUFBYSxVQUNiLE9BQU8sWUFBWTtBQUFBLFFBQzdCLEtBQUksTUFBTSw4QkFBOEIsRUFBRSxPQUFPLFdBQVcsQ0FBQztBQUFBO0FBQUEsTUFFakUsZUFBZTtBQUFBLElBQ25CO0FBQUEsSUFFQSxRQUFRLEtBQUssQ0FBQztBQUFBO0FBQUEsRUFHbEIsR0FBTSxPQUFPO0FBQUE7IiwKICAiZGVidWdJZCI6ICJCMTNDNkQ0MzI0Nzc1NTU4NjQ3NTZFMjE2NDc1NkUyMSIsCiAgIm5hbWVzIjogW10KfQ==
