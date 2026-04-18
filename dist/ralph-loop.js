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
      var p = pathext[i].toLowerCase();
      if (p && path.substr(-p.length).toLowerCase() === p) {
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
    var u = parseInt("100", 8);
    var g = parseInt("010", 8);
    var o = parseInt("001", 8);
    var ug = u | g;
    var ret = mod & o || mod & g && gid === myGid || mod & u && uid === myUid || mod & ug && myUid === 0;
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
      const p = !pathPart && /^\.[\\\/]/.test(cmd) ? cmd.slice(0, 2) + pCmd : pCmd;
      resolve(subStep(p, i, 0));
    });
    const subStep = (p, i, ii) => new Promise((resolve, reject) => {
      if (ii === pathExt.length)
        return resolve(step(i + 1));
      const ext = pathExt[ii];
      isexe(p + ext, { pathExt: pathExtExe }, (er, is) => {
        if (!er && is) {
          if (opt.all)
            found.push(p + ext);
          else
            return resolve(p + ext);
        }
        return resolve(subStep(p, i, ii + 1));
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
      const p = !pathPart && /^\.[\\\/]/.test(cmd) ? cmd.slice(0, 2) + pCmd : pCmd;
      for (let j = 0;j < pathExt.length; j++) {
        const cur = p + pathExt[j];
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

// src/execution/ralph-loop.ts
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { join as join2 } from "node:path";

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
    const extraStr = Object.entries(extra).map(([k, v]) => `${k}=${typeof v === "object" ? JSON.stringify(v) : v}`).join(" ");
    return extraStr ? ` ${extraStr}` : "";
  }
  function create(tags) {
    const tagStr = tags ? Object.entries(tags).map(([k, v]) => `${k}=${v}`).join(" ") : "";
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
      cycleState.outputHash = this.hashOutput(Object.values(cycleState.phases).map((p) => p?.response ?? "").join("|"));
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
export {
  createRalphLoopRunner,
  RalphLoopRunner
};

//# debugId=EA032931E4ACA91A64756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vbm9kZV9tb2R1bGVzL2lzZXhlL3dpbmRvd3MuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2lzZXhlL21vZGUuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2lzZXhlL2luZGV4LmpzIiwgIi4uL25vZGVfbW9kdWxlcy93aGljaC93aGljaC5qcyIsICIuLi9ub2RlX21vZHVsZXMvcGF0aC1rZXkvaW5kZXguanMiLCAiLi4vbm9kZV9tb2R1bGVzL2Nyb3NzLXNwYXduL2xpYi91dGlsL3Jlc29sdmVDb21tYW5kLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9jcm9zcy1zcGF3bi9saWIvdXRpbC9lc2NhcGUuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3NoZWJhbmctcmVnZXgvaW5kZXguanMiLCAiLi4vbm9kZV9tb2R1bGVzL3NoZWJhbmctY29tbWFuZC9pbmRleC5qcyIsICIuLi9ub2RlX21vZHVsZXMvY3Jvc3Mtc3Bhd24vbGliL3V0aWwvcmVhZFNoZWJhbmcuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2Nyb3NzLXNwYXduL2xpYi9wYXJzZS5qcyIsICIuLi9ub2RlX21vZHVsZXMvY3Jvc3Mtc3Bhd24vbGliL2Vub2VudC5qcyIsICIuLi9ub2RlX21vZHVsZXMvY3Jvc3Mtc3Bhd24vaW5kZXguanMiLCAiLi4vc3JjL2V4ZWN1dGlvbi9yYWxwaC1sb29wLnRzIiwgIi4uL3NyYy9iYWNrZW5kcy9vcGVuY29kZS9jbGllbnQudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0BvcGVuY29kZS1haS9zZGsvZGlzdC9nZW4vY29yZS9zZXJ2ZXJTZW50RXZlbnRzLmdlbi5qcyIsICIuLi9ub2RlX21vZHVsZXMvQG9wZW5jb2RlLWFpL3Nkay9kaXN0L2dlbi9jb3JlL2F1dGguZ2VuLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9Ab3BlbmNvZGUtYWkvc2RrL2Rpc3QvZ2VuL2NvcmUvYm9keVNlcmlhbGl6ZXIuZ2VuLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9Ab3BlbmNvZGUtYWkvc2RrL2Rpc3QvZ2VuL2NvcmUvcGF0aFNlcmlhbGl6ZXIuZ2VuLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9Ab3BlbmNvZGUtYWkvc2RrL2Rpc3QvZ2VuL2NvcmUvdXRpbHMuZ2VuLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9Ab3BlbmNvZGUtYWkvc2RrL2Rpc3QvZ2VuL2NsaWVudC91dGlscy5nZW4uanMiLCAiLi4vbm9kZV9tb2R1bGVzL0BvcGVuY29kZS1haS9zZGsvZGlzdC9nZW4vY2xpZW50L2NsaWVudC5nZW4uanMiLCAiLi4vbm9kZV9tb2R1bGVzL0BvcGVuY29kZS1haS9zZGsvZGlzdC9nZW4vY29yZS9wYXJhbXMuZ2VuLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9Ab3BlbmNvZGUtYWkvc2RrL2Rpc3QvZ2VuL2NsaWVudC5nZW4uanMiLCAiLi4vbm9kZV9tb2R1bGVzL0BvcGVuY29kZS1haS9zZGsvZGlzdC9nZW4vc2RrLmdlbi5qcyIsICIuLi9ub2RlX21vZHVsZXMvQG9wZW5jb2RlLWFpL3Nkay9kaXN0L2NsaWVudC5qcyIsICIuLi9ub2RlX21vZHVsZXMvQG9wZW5jb2RlLWFpL3Nkay9kaXN0L3NlcnZlci5qcyIsICIuLi9ub2RlX21vZHVsZXMvQG9wZW5jb2RlLWFpL3Nkay9kaXN0L3Byb2Nlc3MuanMiLCAiLi4vbm9kZV9tb2R1bGVzL0BvcGVuY29kZS1haS9zZGsvZGlzdC9pbmRleC5qcyIsICIuLi9zcmMvdXRpbC9sb2cudHMiLCAiLi4vc3JjL2NsaS91aS50cyIsICIuLi9zcmMvcHJvbXB0LW9wdGltaXphdGlvbi9hbmFseXplci50cyIsICIuLi9zcmMvcHJvbXB0LW9wdGltaXphdGlvbi90ZWNobmlxdWVzLnRzIiwgIi4uL3NyYy9wcm9tcHQtb3B0aW1pemF0aW9uL29wdGltaXplci50cyIsICIuLi9zcmMvdXRpbC9kaXNjb3JkLXdlYmhvb2sudHMiLCAiLi4vc3JjL2V4ZWN1dGlvbi9mbG93LXN0b3JlLnRzIiwgIi4uL3NyYy9leGVjdXRpb24vZmxvdy10eXBlcy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsKICAgICJtb2R1bGUuZXhwb3J0cyA9IGlzZXhlXG5pc2V4ZS5zeW5jID0gc3luY1xuXG52YXIgZnMgPSByZXF1aXJlKCdmcycpXG5cbmZ1bmN0aW9uIGNoZWNrUGF0aEV4dCAocGF0aCwgb3B0aW9ucykge1xuICB2YXIgcGF0aGV4dCA9IG9wdGlvbnMucGF0aEV4dCAhPT0gdW5kZWZpbmVkID9cbiAgICBvcHRpb25zLnBhdGhFeHQgOiBwcm9jZXNzLmVudi5QQVRIRVhUXG5cbiAgaWYgKCFwYXRoZXh0KSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIHBhdGhleHQgPSBwYXRoZXh0LnNwbGl0KCc7JylcbiAgaWYgKHBhdGhleHQuaW5kZXhPZignJykgIT09IC0xKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHBhdGhleHQubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgcCA9IHBhdGhleHRbaV0udG9Mb3dlckNhc2UoKVxuICAgIGlmIChwICYmIHBhdGguc3Vic3RyKC1wLmxlbmd0aCkudG9Mb3dlckNhc2UoKSA9PT0gcCkge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cbmZ1bmN0aW9uIGNoZWNrU3RhdCAoc3RhdCwgcGF0aCwgb3B0aW9ucykge1xuICBpZiAoIXN0YXQuaXNTeW1ib2xpY0xpbmsoKSAmJiAhc3RhdC5pc0ZpbGUoKSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG4gIHJldHVybiBjaGVja1BhdGhFeHQocGF0aCwgb3B0aW9ucylcbn1cblxuZnVuY3Rpb24gaXNleGUgKHBhdGgsIG9wdGlvbnMsIGNiKSB7XG4gIGZzLnN0YXQocGF0aCwgZnVuY3Rpb24gKGVyLCBzdGF0KSB7XG4gICAgY2IoZXIsIGVyID8gZmFsc2UgOiBjaGVja1N0YXQoc3RhdCwgcGF0aCwgb3B0aW9ucykpXG4gIH0pXG59XG5cbmZ1bmN0aW9uIHN5bmMgKHBhdGgsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIGNoZWNrU3RhdChmcy5zdGF0U3luYyhwYXRoKSwgcGF0aCwgb3B0aW9ucylcbn1cbiIsCiAgICAibW9kdWxlLmV4cG9ydHMgPSBpc2V4ZVxuaXNleGUuc3luYyA9IHN5bmNcblxudmFyIGZzID0gcmVxdWlyZSgnZnMnKVxuXG5mdW5jdGlvbiBpc2V4ZSAocGF0aCwgb3B0aW9ucywgY2IpIHtcbiAgZnMuc3RhdChwYXRoLCBmdW5jdGlvbiAoZXIsIHN0YXQpIHtcbiAgICBjYihlciwgZXIgPyBmYWxzZSA6IGNoZWNrU3RhdChzdGF0LCBvcHRpb25zKSlcbiAgfSlcbn1cblxuZnVuY3Rpb24gc3luYyAocGF0aCwgb3B0aW9ucykge1xuICByZXR1cm4gY2hlY2tTdGF0KGZzLnN0YXRTeW5jKHBhdGgpLCBvcHRpb25zKVxufVxuXG5mdW5jdGlvbiBjaGVja1N0YXQgKHN0YXQsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIHN0YXQuaXNGaWxlKCkgJiYgY2hlY2tNb2RlKHN0YXQsIG9wdGlvbnMpXG59XG5cbmZ1bmN0aW9uIGNoZWNrTW9kZSAoc3RhdCwgb3B0aW9ucykge1xuICB2YXIgbW9kID0gc3RhdC5tb2RlXG4gIHZhciB1aWQgPSBzdGF0LnVpZFxuICB2YXIgZ2lkID0gc3RhdC5naWRcblxuICB2YXIgbXlVaWQgPSBvcHRpb25zLnVpZCAhPT0gdW5kZWZpbmVkID9cbiAgICBvcHRpb25zLnVpZCA6IHByb2Nlc3MuZ2V0dWlkICYmIHByb2Nlc3MuZ2V0dWlkKClcbiAgdmFyIG15R2lkID0gb3B0aW9ucy5naWQgIT09IHVuZGVmaW5lZCA/XG4gICAgb3B0aW9ucy5naWQgOiBwcm9jZXNzLmdldGdpZCAmJiBwcm9jZXNzLmdldGdpZCgpXG5cbiAgdmFyIHUgPSBwYXJzZUludCgnMTAwJywgOClcbiAgdmFyIGcgPSBwYXJzZUludCgnMDEwJywgOClcbiAgdmFyIG8gPSBwYXJzZUludCgnMDAxJywgOClcbiAgdmFyIHVnID0gdSB8IGdcblxuICB2YXIgcmV0ID0gKG1vZCAmIG8pIHx8XG4gICAgKG1vZCAmIGcpICYmIGdpZCA9PT0gbXlHaWQgfHxcbiAgICAobW9kICYgdSkgJiYgdWlkID09PSBteVVpZCB8fFxuICAgIChtb2QgJiB1ZykgJiYgbXlVaWQgPT09IDBcblxuICByZXR1cm4gcmV0XG59XG4iLAogICAgInZhciBmcyA9IHJlcXVpcmUoJ2ZzJylcbnZhciBjb3JlXG5pZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJyB8fCBnbG9iYWwuVEVTVElOR19XSU5ET1dTKSB7XG4gIGNvcmUgPSByZXF1aXJlKCcuL3dpbmRvd3MuanMnKVxufSBlbHNlIHtcbiAgY29yZSA9IHJlcXVpcmUoJy4vbW9kZS5qcycpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNleGVcbmlzZXhlLnN5bmMgPSBzeW5jXG5cbmZ1bmN0aW9uIGlzZXhlIChwYXRoLCBvcHRpb25zLCBjYikge1xuICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjYiA9IG9wdGlvbnNcbiAgICBvcHRpb25zID0ge31cbiAgfVxuXG4gIGlmICghY2IpIHtcbiAgICBpZiAodHlwZW9mIFByb21pc2UgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2NhbGxiYWNrIG5vdCBwcm92aWRlZCcpXG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIGlzZXhlKHBhdGgsIG9wdGlvbnMgfHwge30sIGZ1bmN0aW9uIChlciwgaXMpIHtcbiAgICAgICAgaWYgKGVyKSB7XG4gICAgICAgICAgcmVqZWN0KGVyKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc29sdmUoaXMpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIGNvcmUocGF0aCwgb3B0aW9ucyB8fCB7fSwgZnVuY3Rpb24gKGVyLCBpcykge1xuICAgIC8vIGlnbm9yZSBFQUNDRVMgYmVjYXVzZSB0aGF0IGp1c3QgbWVhbnMgd2UgYXJlbid0IGFsbG93ZWQgdG8gcnVuIGl0XG4gICAgaWYgKGVyKSB7XG4gICAgICBpZiAoZXIuY29kZSA9PT0gJ0VBQ0NFUycgfHwgb3B0aW9ucyAmJiBvcHRpb25zLmlnbm9yZUVycm9ycykge1xuICAgICAgICBlciA9IG51bGxcbiAgICAgICAgaXMgPSBmYWxzZVxuICAgICAgfVxuICAgIH1cbiAgICBjYihlciwgaXMpXG4gIH0pXG59XG5cbmZ1bmN0aW9uIHN5bmMgKHBhdGgsIG9wdGlvbnMpIHtcbiAgLy8gbXkga2luZ2RvbSBmb3IgYSBmaWx0ZXJlZCBjYXRjaFxuICB0cnkge1xuICAgIHJldHVybiBjb3JlLnN5bmMocGF0aCwgb3B0aW9ucyB8fCB7fSlcbiAgfSBjYXRjaCAoZXIpIHtcbiAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLmlnbm9yZUVycm9ycyB8fCBlci5jb2RlID09PSAnRUFDQ0VTJykge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IGVyXG4gICAgfVxuICB9XG59XG4iLAogICAgImNvbnN0IGlzV2luZG93cyA9IHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicgfHxcbiAgICBwcm9jZXNzLmVudi5PU1RZUEUgPT09ICdjeWd3aW4nIHx8XG4gICAgcHJvY2Vzcy5lbnYuT1NUWVBFID09PSAnbXN5cydcblxuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuY29uc3QgQ09MT04gPSBpc1dpbmRvd3MgPyAnOycgOiAnOidcbmNvbnN0IGlzZXhlID0gcmVxdWlyZSgnaXNleGUnKVxuXG5jb25zdCBnZXROb3RGb3VuZEVycm9yID0gKGNtZCkgPT5cbiAgT2JqZWN0LmFzc2lnbihuZXcgRXJyb3IoYG5vdCBmb3VuZDogJHtjbWR9YCksIHsgY29kZTogJ0VOT0VOVCcgfSlcblxuY29uc3QgZ2V0UGF0aEluZm8gPSAoY21kLCBvcHQpID0+IHtcbiAgY29uc3QgY29sb24gPSBvcHQuY29sb24gfHwgQ09MT05cblxuICAvLyBJZiBpdCBoYXMgYSBzbGFzaCwgdGhlbiB3ZSBkb24ndCBib3RoZXIgc2VhcmNoaW5nIHRoZSBwYXRoZW52LlxuICAvLyBqdXN0IGNoZWNrIHRoZSBmaWxlIGl0c2VsZiwgYW5kIHRoYXQncyBpdC5cbiAgY29uc3QgcGF0aEVudiA9IGNtZC5tYXRjaCgvXFwvLykgfHwgaXNXaW5kb3dzICYmIGNtZC5tYXRjaCgvXFxcXC8pID8gWycnXVxuICAgIDogKFxuICAgICAgW1xuICAgICAgICAvLyB3aW5kb3dzIGFsd2F5cyBjaGVja3MgdGhlIGN3ZCBmaXJzdFxuICAgICAgICAuLi4oaXNXaW5kb3dzID8gW3Byb2Nlc3MuY3dkKCldIDogW10pLFxuICAgICAgICAuLi4ob3B0LnBhdGggfHwgcHJvY2Vzcy5lbnYuUEFUSCB8fFxuICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0OiB2ZXJ5IHVudXN1YWwgKi8gJycpLnNwbGl0KGNvbG9uKSxcbiAgICAgIF1cbiAgICApXG4gIGNvbnN0IHBhdGhFeHRFeGUgPSBpc1dpbmRvd3NcbiAgICA/IG9wdC5wYXRoRXh0IHx8IHByb2Nlc3MuZW52LlBBVEhFWFQgfHwgJy5FWEU7LkNNRDsuQkFUOy5DT00nXG4gICAgOiAnJ1xuICBjb25zdCBwYXRoRXh0ID0gaXNXaW5kb3dzID8gcGF0aEV4dEV4ZS5zcGxpdChjb2xvbikgOiBbJyddXG5cbiAgaWYgKGlzV2luZG93cykge1xuICAgIGlmIChjbWQuaW5kZXhPZignLicpICE9PSAtMSAmJiBwYXRoRXh0WzBdICE9PSAnJylcbiAgICAgIHBhdGhFeHQudW5zaGlmdCgnJylcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgcGF0aEVudixcbiAgICBwYXRoRXh0LFxuICAgIHBhdGhFeHRFeGUsXG4gIH1cbn1cblxuY29uc3Qgd2hpY2ggPSAoY21kLCBvcHQsIGNiKSA9PiB7XG4gIGlmICh0eXBlb2Ygb3B0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY2IgPSBvcHRcbiAgICBvcHQgPSB7fVxuICB9XG4gIGlmICghb3B0KVxuICAgIG9wdCA9IHt9XG5cbiAgY29uc3QgeyBwYXRoRW52LCBwYXRoRXh0LCBwYXRoRXh0RXhlIH0gPSBnZXRQYXRoSW5mbyhjbWQsIG9wdClcbiAgY29uc3QgZm91bmQgPSBbXVxuXG4gIGNvbnN0IHN0ZXAgPSBpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBpZiAoaSA9PT0gcGF0aEVudi5sZW5ndGgpXG4gICAgICByZXR1cm4gb3B0LmFsbCAmJiBmb3VuZC5sZW5ndGggPyByZXNvbHZlKGZvdW5kKVxuICAgICAgICA6IHJlamVjdChnZXROb3RGb3VuZEVycm9yKGNtZCkpXG5cbiAgICBjb25zdCBwcFJhdyA9IHBhdGhFbnZbaV1cbiAgICBjb25zdCBwYXRoUGFydCA9IC9eXCIuKlwiJC8udGVzdChwcFJhdykgPyBwcFJhdy5zbGljZSgxLCAtMSkgOiBwcFJhd1xuXG4gICAgY29uc3QgcENtZCA9IHBhdGguam9pbihwYXRoUGFydCwgY21kKVxuICAgIGNvbnN0IHAgPSAhcGF0aFBhcnQgJiYgL15cXC5bXFxcXFxcL10vLnRlc3QoY21kKSA/IGNtZC5zbGljZSgwLCAyKSArIHBDbWRcbiAgICAgIDogcENtZFxuXG4gICAgcmVzb2x2ZShzdWJTdGVwKHAsIGksIDApKVxuICB9KVxuXG4gIGNvbnN0IHN1YlN0ZXAgPSAocCwgaSwgaWkpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBpZiAoaWkgPT09IHBhdGhFeHQubGVuZ3RoKVxuICAgICAgcmV0dXJuIHJlc29sdmUoc3RlcChpICsgMSkpXG4gICAgY29uc3QgZXh0ID0gcGF0aEV4dFtpaV1cbiAgICBpc2V4ZShwICsgZXh0LCB7IHBhdGhFeHQ6IHBhdGhFeHRFeGUgfSwgKGVyLCBpcykgPT4ge1xuICAgICAgaWYgKCFlciAmJiBpcykge1xuICAgICAgICBpZiAob3B0LmFsbClcbiAgICAgICAgICBmb3VuZC5wdXNoKHAgKyBleHQpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZShwICsgZXh0KVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc29sdmUoc3ViU3RlcChwLCBpLCBpaSArIDEpKVxuICAgIH0pXG4gIH0pXG5cbiAgcmV0dXJuIGNiID8gc3RlcCgwKS50aGVuKHJlcyA9PiBjYihudWxsLCByZXMpLCBjYikgOiBzdGVwKDApXG59XG5cbmNvbnN0IHdoaWNoU3luYyA9IChjbWQsIG9wdCkgPT4ge1xuICBvcHQgPSBvcHQgfHwge31cblxuICBjb25zdCB7IHBhdGhFbnYsIHBhdGhFeHQsIHBhdGhFeHRFeGUgfSA9IGdldFBhdGhJbmZvKGNtZCwgb3B0KVxuICBjb25zdCBmb3VuZCA9IFtdXG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXRoRW52Lmxlbmd0aDsgaSArKykge1xuICAgIGNvbnN0IHBwUmF3ID0gcGF0aEVudltpXVxuICAgIGNvbnN0IHBhdGhQYXJ0ID0gL15cIi4qXCIkLy50ZXN0KHBwUmF3KSA/IHBwUmF3LnNsaWNlKDEsIC0xKSA6IHBwUmF3XG5cbiAgICBjb25zdCBwQ21kID0gcGF0aC5qb2luKHBhdGhQYXJ0LCBjbWQpXG4gICAgY29uc3QgcCA9ICFwYXRoUGFydCAmJiAvXlxcLltcXFxcXFwvXS8udGVzdChjbWQpID8gY21kLnNsaWNlKDAsIDIpICsgcENtZFxuICAgICAgOiBwQ21kXG5cbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IHBhdGhFeHQubGVuZ3RoOyBqICsrKSB7XG4gICAgICBjb25zdCBjdXIgPSBwICsgcGF0aEV4dFtqXVxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgaXMgPSBpc2V4ZS5zeW5jKGN1ciwgeyBwYXRoRXh0OiBwYXRoRXh0RXhlIH0pXG4gICAgICAgIGlmIChpcykge1xuICAgICAgICAgIGlmIChvcHQuYWxsKVxuICAgICAgICAgICAgZm91bmQucHVzaChjdXIpXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIGN1clxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChleCkge31cbiAgICB9XG4gIH1cblxuICBpZiAob3B0LmFsbCAmJiBmb3VuZC5sZW5ndGgpXG4gICAgcmV0dXJuIGZvdW5kXG5cbiAgaWYgKG9wdC5ub3Rocm93KVxuICAgIHJldHVybiBudWxsXG5cbiAgdGhyb3cgZ2V0Tm90Rm91bmRFcnJvcihjbWQpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gd2hpY2hcbndoaWNoLnN5bmMgPSB3aGljaFN5bmNcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBwYXRoS2V5ID0gKG9wdGlvbnMgPSB7fSkgPT4ge1xuXHRjb25zdCBlbnZpcm9ubWVudCA9IG9wdGlvbnMuZW52IHx8IHByb2Nlc3MuZW52O1xuXHRjb25zdCBwbGF0Zm9ybSA9IG9wdGlvbnMucGxhdGZvcm0gfHwgcHJvY2Vzcy5wbGF0Zm9ybTtcblxuXHRpZiAocGxhdGZvcm0gIT09ICd3aW4zMicpIHtcblx0XHRyZXR1cm4gJ1BBVEgnO1xuXHR9XG5cblx0cmV0dXJuIE9iamVjdC5rZXlzKGVudmlyb25tZW50KS5yZXZlcnNlKCkuZmluZChrZXkgPT4ga2V5LnRvVXBwZXJDYXNlKCkgPT09ICdQQVRIJykgfHwgJ1BhdGgnO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBwYXRoS2V5O1xuLy8gVE9ETzogUmVtb3ZlIHRoaXMgZm9yIHRoZSBuZXh0IG1ham9yIHJlbGVhc2Vcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBwYXRoS2V5O1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCB3aGljaCA9IHJlcXVpcmUoJ3doaWNoJyk7XG5jb25zdCBnZXRQYXRoS2V5ID0gcmVxdWlyZSgncGF0aC1rZXknKTtcblxuZnVuY3Rpb24gcmVzb2x2ZUNvbW1hbmRBdHRlbXB0KHBhcnNlZCwgd2l0aG91dFBhdGhFeHQpIHtcbiAgICBjb25zdCBlbnYgPSBwYXJzZWQub3B0aW9ucy5lbnYgfHwgcHJvY2Vzcy5lbnY7XG4gICAgY29uc3QgY3dkID0gcHJvY2Vzcy5jd2QoKTtcbiAgICBjb25zdCBoYXNDdXN0b21Dd2QgPSBwYXJzZWQub3B0aW9ucy5jd2QgIT0gbnVsbDtcbiAgICAvLyBXb3JrZXIgdGhyZWFkcyBkbyBub3QgaGF2ZSBwcm9jZXNzLmNoZGlyKClcbiAgICBjb25zdCBzaG91bGRTd2l0Y2hDd2QgPSBoYXNDdXN0b21Dd2QgJiYgcHJvY2Vzcy5jaGRpciAhPT0gdW5kZWZpbmVkICYmICFwcm9jZXNzLmNoZGlyLmRpc2FibGVkO1xuXG4gICAgLy8gSWYgYSBjdXN0b20gYGN3ZGAgd2FzIHNwZWNpZmllZCwgd2UgbmVlZCB0byBjaGFuZ2UgdGhlIHByb2Nlc3MgY3dkXG4gICAgLy8gYmVjYXVzZSBgd2hpY2hgIHdpbGwgZG8gc3RhdCBjYWxscyBidXQgZG9lcyBub3Qgc3VwcG9ydCBhIGN1c3RvbSBjd2RcbiAgICBpZiAoc2hvdWxkU3dpdGNoQ3dkKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBwcm9jZXNzLmNoZGlyKHBhcnNlZC5vcHRpb25zLmN3ZCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgLyogRW1wdHkgKi9cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGxldCByZXNvbHZlZDtcblxuICAgIHRyeSB7XG4gICAgICAgIHJlc29sdmVkID0gd2hpY2guc3luYyhwYXJzZWQuY29tbWFuZCwge1xuICAgICAgICAgICAgcGF0aDogZW52W2dldFBhdGhLZXkoeyBlbnYgfSldLFxuICAgICAgICAgICAgcGF0aEV4dDogd2l0aG91dFBhdGhFeHQgPyBwYXRoLmRlbGltaXRlciA6IHVuZGVmaW5lZCxcbiAgICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvKiBFbXB0eSAqL1xuICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChzaG91bGRTd2l0Y2hDd2QpIHtcbiAgICAgICAgICAgIHByb2Nlc3MuY2hkaXIoY3dkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIElmIHdlIHN1Y2Nlc3NmdWxseSByZXNvbHZlZCwgZW5zdXJlIHRoYXQgYW4gYWJzb2x1dGUgcGF0aCBpcyByZXR1cm5lZFxuICAgIC8vIE5vdGUgdGhhdCB3aGVuIGEgY3VzdG9tIGBjd2RgIHdhcyB1c2VkLCB3ZSBuZWVkIHRvIHJlc29sdmUgdG8gYW4gYWJzb2x1dGUgcGF0aCBiYXNlZCBvbiBpdFxuICAgIGlmIChyZXNvbHZlZCkge1xuICAgICAgICByZXNvbHZlZCA9IHBhdGgucmVzb2x2ZShoYXNDdXN0b21Dd2QgPyBwYXJzZWQub3B0aW9ucy5jd2QgOiAnJywgcmVzb2x2ZWQpO1xuICAgIH1cblxuICAgIHJldHVybiByZXNvbHZlZDtcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZUNvbW1hbmQocGFyc2VkKSB7XG4gICAgcmV0dXJuIHJlc29sdmVDb21tYW5kQXR0ZW1wdChwYXJzZWQpIHx8IHJlc29sdmVDb21tYW5kQXR0ZW1wdChwYXJzZWQsIHRydWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHJlc29sdmVDb21tYW5kO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbi8vIFNlZSBodHRwOi8vd3d3LnJvYnZhbmRlcndvdWRlLmNvbS9lc2NhcGVjaGFycy5waHBcbmNvbnN0IG1ldGFDaGFyc1JlZ0V4cCA9IC8oWygpXFxdWyUhXlwiYDw+Jnw7LCAqP10pL2c7XG5cbmZ1bmN0aW9uIGVzY2FwZUNvbW1hbmQoYXJnKSB7XG4gICAgLy8gRXNjYXBlIG1ldGEgY2hhcnNcbiAgICBhcmcgPSBhcmcucmVwbGFjZShtZXRhQ2hhcnNSZWdFeHAsICdeJDEnKTtcblxuICAgIHJldHVybiBhcmc7XG59XG5cbmZ1bmN0aW9uIGVzY2FwZUFyZ3VtZW50KGFyZywgZG91YmxlRXNjYXBlTWV0YUNoYXJzKSB7XG4gICAgLy8gQ29udmVydCB0byBzdHJpbmdcbiAgICBhcmcgPSBgJHthcmd9YDtcblxuICAgIC8vIEFsZ29yaXRobSBiZWxvdyBpcyBiYXNlZCBvbiBodHRwczovL3FudG0ub3JnL2NtZFxuICAgIC8vIEl0J3Mgc2xpZ2h0bHkgYWx0ZXJlZCB0byBkaXNhYmxlIEpTIGJhY2t0cmFja2luZyB0byBhdm9pZCBoYW5naW5nIG9uIHNwZWNpYWxseSBjcmFmdGVkIGlucHV0XG4gICAgLy8gUGxlYXNlIHNlZSBodHRwczovL2dpdGh1Yi5jb20vbW94eXN0dWRpby9ub2RlLWNyb3NzLXNwYXduL3B1bGwvMTYwIGZvciBtb3JlIGluZm9ybWF0aW9uXG5cbiAgICAvLyBTZXF1ZW5jZSBvZiBiYWNrc2xhc2hlcyBmb2xsb3dlZCBieSBhIGRvdWJsZSBxdW90ZTpcbiAgICAvLyBkb3VibGUgdXAgYWxsIHRoZSBiYWNrc2xhc2hlcyBhbmQgZXNjYXBlIHRoZSBkb3VibGUgcXVvdGVcbiAgICBhcmcgPSBhcmcucmVwbGFjZSgvKD89KFxcXFwrPyk/KVxcMVwiL2csICckMSQxXFxcXFwiJyk7XG5cbiAgICAvLyBTZXF1ZW5jZSBvZiBiYWNrc2xhc2hlcyBmb2xsb3dlZCBieSB0aGUgZW5kIG9mIHRoZSBzdHJpbmdcbiAgICAvLyAod2hpY2ggd2lsbCBiZWNvbWUgYSBkb3VibGUgcXVvdGUgbGF0ZXIpOlxuICAgIC8vIGRvdWJsZSB1cCBhbGwgdGhlIGJhY2tzbGFzaGVzXG4gICAgYXJnID0gYXJnLnJlcGxhY2UoLyg/PShcXFxcKz8pPylcXDEkLywgJyQxJDEnKTtcblxuICAgIC8vIEFsbCBvdGhlciBiYWNrc2xhc2hlcyBvY2N1ciBsaXRlcmFsbHlcblxuICAgIC8vIFF1b3RlIHRoZSB3aG9sZSB0aGluZzpcbiAgICBhcmcgPSBgXCIke2FyZ31cImA7XG5cbiAgICAvLyBFc2NhcGUgbWV0YSBjaGFyc1xuICAgIGFyZyA9IGFyZy5yZXBsYWNlKG1ldGFDaGFyc1JlZ0V4cCwgJ14kMScpO1xuXG4gICAgLy8gRG91YmxlIGVzY2FwZSBtZXRhIGNoYXJzIGlmIG5lY2Vzc2FyeVxuICAgIGlmIChkb3VibGVFc2NhcGVNZXRhQ2hhcnMpIHtcbiAgICAgICAgYXJnID0gYXJnLnJlcGxhY2UobWV0YUNoYXJzUmVnRXhwLCAnXiQxJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFyZztcbn1cblxubW9kdWxlLmV4cG9ydHMuY29tbWFuZCA9IGVzY2FwZUNvbW1hbmQ7XG5tb2R1bGUuZXhwb3J0cy5hcmd1bWVudCA9IGVzY2FwZUFyZ3VtZW50O1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IC9eIyEoLiopLztcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuY29uc3Qgc2hlYmFuZ1JlZ2V4ID0gcmVxdWlyZSgnc2hlYmFuZy1yZWdleCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChzdHJpbmcgPSAnJykgPT4ge1xuXHRjb25zdCBtYXRjaCA9IHN0cmluZy5tYXRjaChzaGViYW5nUmVnZXgpO1xuXG5cdGlmICghbWF0Y2gpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdGNvbnN0IFtwYXRoLCBhcmd1bWVudF0gPSBtYXRjaFswXS5yZXBsYWNlKC8jISA/LywgJycpLnNwbGl0KCcgJyk7XG5cdGNvbnN0IGJpbmFyeSA9IHBhdGguc3BsaXQoJy8nKS5wb3AoKTtcblxuXHRpZiAoYmluYXJ5ID09PSAnZW52Jykge1xuXHRcdHJldHVybiBhcmd1bWVudDtcblx0fVxuXG5cdHJldHVybiBhcmd1bWVudCA/IGAke2JpbmFyeX0gJHthcmd1bWVudH1gIDogYmluYXJ5O1xufTtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5jb25zdCBzaGViYW5nQ29tbWFuZCA9IHJlcXVpcmUoJ3NoZWJhbmctY29tbWFuZCcpO1xuXG5mdW5jdGlvbiByZWFkU2hlYmFuZyhjb21tYW5kKSB7XG4gICAgLy8gUmVhZCB0aGUgZmlyc3QgMTUwIGJ5dGVzIGZyb20gdGhlIGZpbGVcbiAgICBjb25zdCBzaXplID0gMTUwO1xuICAgIGNvbnN0IGJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyhzaXplKTtcblxuICAgIGxldCBmZDtcblxuICAgIHRyeSB7XG4gICAgICAgIGZkID0gZnMub3BlblN5bmMoY29tbWFuZCwgJ3InKTtcbiAgICAgICAgZnMucmVhZFN5bmMoZmQsIGJ1ZmZlciwgMCwgc2l6ZSwgMCk7XG4gICAgICAgIGZzLmNsb3NlU3luYyhmZCk7XG4gICAgfSBjYXRjaCAoZSkgeyAvKiBFbXB0eSAqLyB9XG5cbiAgICAvLyBBdHRlbXB0IHRvIGV4dHJhY3Qgc2hlYmFuZyAobnVsbCBpcyByZXR1cm5lZCBpZiBub3QgYSBzaGViYW5nKVxuICAgIHJldHVybiBzaGViYW5nQ29tbWFuZChidWZmZXIudG9TdHJpbmcoKSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcmVhZFNoZWJhbmc7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IHJlc29sdmVDb21tYW5kID0gcmVxdWlyZSgnLi91dGlsL3Jlc29sdmVDb21tYW5kJyk7XG5jb25zdCBlc2NhcGUgPSByZXF1aXJlKCcuL3V0aWwvZXNjYXBlJyk7XG5jb25zdCByZWFkU2hlYmFuZyA9IHJlcXVpcmUoJy4vdXRpbC9yZWFkU2hlYmFuZycpO1xuXG5jb25zdCBpc1dpbiA9IHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMic7XG5jb25zdCBpc0V4ZWN1dGFibGVSZWdFeHAgPSAvXFwuKD86Y29tfGV4ZSkkL2k7XG5jb25zdCBpc0NtZFNoaW1SZWdFeHAgPSAvbm9kZV9tb2R1bGVzW1xcXFwvXS5iaW5bXFxcXC9dW15cXFxcL10rXFwuY21kJC9pO1xuXG5mdW5jdGlvbiBkZXRlY3RTaGViYW5nKHBhcnNlZCkge1xuICAgIHBhcnNlZC5maWxlID0gcmVzb2x2ZUNvbW1hbmQocGFyc2VkKTtcblxuICAgIGNvbnN0IHNoZWJhbmcgPSBwYXJzZWQuZmlsZSAmJiByZWFkU2hlYmFuZyhwYXJzZWQuZmlsZSk7XG5cbiAgICBpZiAoc2hlYmFuZykge1xuICAgICAgICBwYXJzZWQuYXJncy51bnNoaWZ0KHBhcnNlZC5maWxlKTtcbiAgICAgICAgcGFyc2VkLmNvbW1hbmQgPSBzaGViYW5nO1xuXG4gICAgICAgIHJldHVybiByZXNvbHZlQ29tbWFuZChwYXJzZWQpO1xuICAgIH1cblxuICAgIHJldHVybiBwYXJzZWQuZmlsZTtcbn1cblxuZnVuY3Rpb24gcGFyc2VOb25TaGVsbChwYXJzZWQpIHtcbiAgICBpZiAoIWlzV2luKSB7XG4gICAgICAgIHJldHVybiBwYXJzZWQ7XG4gICAgfVxuXG4gICAgLy8gRGV0ZWN0ICYgYWRkIHN1cHBvcnQgZm9yIHNoZWJhbmdzXG4gICAgY29uc3QgY29tbWFuZEZpbGUgPSBkZXRlY3RTaGViYW5nKHBhcnNlZCk7XG5cbiAgICAvLyBXZSBkb24ndCBuZWVkIGEgc2hlbGwgaWYgdGhlIGNvbW1hbmQgZmlsZW5hbWUgaXMgYW4gZXhlY3V0YWJsZVxuICAgIGNvbnN0IG5lZWRzU2hlbGwgPSAhaXNFeGVjdXRhYmxlUmVnRXhwLnRlc3QoY29tbWFuZEZpbGUpO1xuXG4gICAgLy8gSWYgYSBzaGVsbCBpcyByZXF1aXJlZCwgdXNlIGNtZC5leGUgYW5kIHRha2UgY2FyZSBvZiBlc2NhcGluZyBldmVyeXRoaW5nIGNvcnJlY3RseVxuICAgIC8vIE5vdGUgdGhhdCBgZm9yY2VTaGVsbGAgaXMgYW4gaGlkZGVuIG9wdGlvbiB1c2VkIG9ubHkgaW4gdGVzdHNcbiAgICBpZiAocGFyc2VkLm9wdGlvbnMuZm9yY2VTaGVsbCB8fCBuZWVkc1NoZWxsKSB7XG4gICAgICAgIC8vIE5lZWQgdG8gZG91YmxlIGVzY2FwZSBtZXRhIGNoYXJzIGlmIHRoZSBjb21tYW5kIGlzIGEgY21kLXNoaW0gbG9jYXRlZCBpbiBgbm9kZV9tb2R1bGVzLy5iaW4vYFxuICAgICAgICAvLyBUaGUgY21kLXNoaW0gc2ltcGx5IGNhbGxzIGV4ZWN1dGUgdGhlIHBhY2thZ2UgYmluIGZpbGUgd2l0aCBOb2RlSlMsIHByb3h5aW5nIGFueSBhcmd1bWVudFxuICAgICAgICAvLyBCZWNhdXNlIHRoZSBlc2NhcGUgb2YgbWV0YWNoYXJzIHdpdGggXiBnZXRzIGludGVycHJldGVkIHdoZW4gdGhlIGNtZC5leGUgaXMgZmlyc3QgY2FsbGVkLFxuICAgICAgICAvLyB3ZSBuZWVkIHRvIGRvdWJsZSBlc2NhcGUgdGhlbVxuICAgICAgICBjb25zdCBuZWVkc0RvdWJsZUVzY2FwZU1ldGFDaGFycyA9IGlzQ21kU2hpbVJlZ0V4cC50ZXN0KGNvbW1hbmRGaWxlKTtcblxuICAgICAgICAvLyBOb3JtYWxpemUgcG9zaXggcGF0aHMgaW50byBPUyBjb21wYXRpYmxlIHBhdGhzIChlLmcuOiBmb28vYmFyIC0+IGZvb1xcYmFyKVxuICAgICAgICAvLyBUaGlzIGlzIG5lY2Vzc2FyeSBvdGhlcndpc2UgaXQgd2lsbCBhbHdheXMgZmFpbCB3aXRoIEVOT0VOVCBpbiB0aG9zZSBjYXNlc1xuICAgICAgICBwYXJzZWQuY29tbWFuZCA9IHBhdGgubm9ybWFsaXplKHBhcnNlZC5jb21tYW5kKTtcblxuICAgICAgICAvLyBFc2NhcGUgY29tbWFuZCAmIGFyZ3VtZW50c1xuICAgICAgICBwYXJzZWQuY29tbWFuZCA9IGVzY2FwZS5jb21tYW5kKHBhcnNlZC5jb21tYW5kKTtcbiAgICAgICAgcGFyc2VkLmFyZ3MgPSBwYXJzZWQuYXJncy5tYXAoKGFyZykgPT4gZXNjYXBlLmFyZ3VtZW50KGFyZywgbmVlZHNEb3VibGVFc2NhcGVNZXRhQ2hhcnMpKTtcblxuICAgICAgICBjb25zdCBzaGVsbENvbW1hbmQgPSBbcGFyc2VkLmNvbW1hbmRdLmNvbmNhdChwYXJzZWQuYXJncykuam9pbignICcpO1xuXG4gICAgICAgIHBhcnNlZC5hcmdzID0gWycvZCcsICcvcycsICcvYycsIGBcIiR7c2hlbGxDb21tYW5kfVwiYF07XG4gICAgICAgIHBhcnNlZC5jb21tYW5kID0gcHJvY2Vzcy5lbnYuY29tc3BlYyB8fCAnY21kLmV4ZSc7XG4gICAgICAgIHBhcnNlZC5vcHRpb25zLndpbmRvd3NWZXJiYXRpbUFyZ3VtZW50cyA9IHRydWU7IC8vIFRlbGwgbm9kZSdzIHNwYXduIHRoYXQgdGhlIGFyZ3VtZW50cyBhcmUgYWxyZWFkeSBlc2NhcGVkXG4gICAgfVxuXG4gICAgcmV0dXJuIHBhcnNlZDtcbn1cblxuZnVuY3Rpb24gcGFyc2UoY29tbWFuZCwgYXJncywgb3B0aW9ucykge1xuICAgIC8vIE5vcm1hbGl6ZSBhcmd1bWVudHMsIHNpbWlsYXIgdG8gbm9kZWpzXG4gICAgaWYgKGFyZ3MgJiYgIUFycmF5LmlzQXJyYXkoYXJncykpIHtcbiAgICAgICAgb3B0aW9ucyA9IGFyZ3M7XG4gICAgICAgIGFyZ3MgPSBudWxsO1xuICAgIH1cblxuICAgIGFyZ3MgPSBhcmdzID8gYXJncy5zbGljZSgwKSA6IFtdOyAvLyBDbG9uZSBhcnJheSB0byBhdm9pZCBjaGFuZ2luZyB0aGUgb3JpZ2luYWxcbiAgICBvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgb3B0aW9ucyk7IC8vIENsb25lIG9iamVjdCB0byBhdm9pZCBjaGFuZ2luZyB0aGUgb3JpZ2luYWxcblxuICAgIC8vIEJ1aWxkIG91ciBwYXJzZWQgb2JqZWN0XG4gICAgY29uc3QgcGFyc2VkID0ge1xuICAgICAgICBjb21tYW5kLFxuICAgICAgICBhcmdzLFxuICAgICAgICBvcHRpb25zLFxuICAgICAgICBmaWxlOiB1bmRlZmluZWQsXG4gICAgICAgIG9yaWdpbmFsOiB7XG4gICAgICAgICAgICBjb21tYW5kLFxuICAgICAgICAgICAgYXJncyxcbiAgICAgICAgfSxcbiAgICB9O1xuXG4gICAgLy8gRGVsZWdhdGUgZnVydGhlciBwYXJzaW5nIHRvIHNoZWxsIG9yIG5vbi1zaGVsbFxuICAgIHJldHVybiBvcHRpb25zLnNoZWxsID8gcGFyc2VkIDogcGFyc2VOb25TaGVsbChwYXJzZWQpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHBhcnNlO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbmNvbnN0IGlzV2luID0gcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJztcblxuZnVuY3Rpb24gbm90Rm91bmRFcnJvcihvcmlnaW5hbCwgc3lzY2FsbCkge1xuICAgIHJldHVybiBPYmplY3QuYXNzaWduKG5ldyBFcnJvcihgJHtzeXNjYWxsfSAke29yaWdpbmFsLmNvbW1hbmR9IEVOT0VOVGApLCB7XG4gICAgICAgIGNvZGU6ICdFTk9FTlQnLFxuICAgICAgICBlcnJubzogJ0VOT0VOVCcsXG4gICAgICAgIHN5c2NhbGw6IGAke3N5c2NhbGx9ICR7b3JpZ2luYWwuY29tbWFuZH1gLFxuICAgICAgICBwYXRoOiBvcmlnaW5hbC5jb21tYW5kLFxuICAgICAgICBzcGF3bmFyZ3M6IG9yaWdpbmFsLmFyZ3MsXG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGhvb2tDaGlsZFByb2Nlc3MoY3AsIHBhcnNlZCkge1xuICAgIGlmICghaXNXaW4pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IG9yaWdpbmFsRW1pdCA9IGNwLmVtaXQ7XG5cbiAgICBjcC5lbWl0ID0gZnVuY3Rpb24gKG5hbWUsIGFyZzEpIHtcbiAgICAgICAgLy8gSWYgZW1pdHRpbmcgXCJleGl0XCIgZXZlbnQgYW5kIGV4aXQgY29kZSBpcyAxLCB3ZSBuZWVkIHRvIGNoZWNrIGlmXG4gICAgICAgIC8vIHRoZSBjb21tYW5kIGV4aXN0cyBhbmQgZW1pdCBhbiBcImVycm9yXCIgaW5zdGVhZFxuICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL0luZGlnb1VuaXRlZC9ub2RlLWNyb3NzLXNwYXduL2lzc3Vlcy8xNlxuICAgICAgICBpZiAobmFtZSA9PT0gJ2V4aXQnKSB7XG4gICAgICAgICAgICBjb25zdCBlcnIgPSB2ZXJpZnlFTk9FTlQoYXJnMSwgcGFyc2VkKTtcblxuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbEVtaXQuY2FsbChjcCwgJ2Vycm9yJywgZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBvcmlnaW5hbEVtaXQuYXBwbHkoY3AsIGFyZ3VtZW50cyk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcHJlZmVyLXJlc3QtcGFyYW1zXG4gICAgfTtcbn1cblxuZnVuY3Rpb24gdmVyaWZ5RU5PRU5UKHN0YXR1cywgcGFyc2VkKSB7XG4gICAgaWYgKGlzV2luICYmIHN0YXR1cyA9PT0gMSAmJiAhcGFyc2VkLmZpbGUpIHtcbiAgICAgICAgcmV0dXJuIG5vdEZvdW5kRXJyb3IocGFyc2VkLm9yaWdpbmFsLCAnc3Bhd24nKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gdmVyaWZ5RU5PRU5UU3luYyhzdGF0dXMsIHBhcnNlZCkge1xuICAgIGlmIChpc1dpbiAmJiBzdGF0dXMgPT09IDEgJiYgIXBhcnNlZC5maWxlKSB7XG4gICAgICAgIHJldHVybiBub3RGb3VuZEVycm9yKHBhcnNlZC5vcmlnaW5hbCwgJ3NwYXduU3luYycpO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBob29rQ2hpbGRQcm9jZXNzLFxuICAgIHZlcmlmeUVOT0VOVCxcbiAgICB2ZXJpZnlFTk9FTlRTeW5jLFxuICAgIG5vdEZvdW5kRXJyb3IsXG59O1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbmNvbnN0IGNwID0gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpO1xuY29uc3QgcGFyc2UgPSByZXF1aXJlKCcuL2xpYi9wYXJzZScpO1xuY29uc3QgZW5vZW50ID0gcmVxdWlyZSgnLi9saWIvZW5vZW50Jyk7XG5cbmZ1bmN0aW9uIHNwYXduKGNvbW1hbmQsIGFyZ3MsIG9wdGlvbnMpIHtcbiAgICAvLyBQYXJzZSB0aGUgYXJndW1lbnRzXG4gICAgY29uc3QgcGFyc2VkID0gcGFyc2UoY29tbWFuZCwgYXJncywgb3B0aW9ucyk7XG5cbiAgICAvLyBTcGF3biB0aGUgY2hpbGQgcHJvY2Vzc1xuICAgIGNvbnN0IHNwYXduZWQgPSBjcC5zcGF3bihwYXJzZWQuY29tbWFuZCwgcGFyc2VkLmFyZ3MsIHBhcnNlZC5vcHRpb25zKTtcblxuICAgIC8vIEhvb2sgaW50byBjaGlsZCBwcm9jZXNzIFwiZXhpdFwiIGV2ZW50IHRvIGVtaXQgYW4gZXJyb3IgaWYgdGhlIGNvbW1hbmRcbiAgICAvLyBkb2VzIG5vdCBleGlzdHMsIHNlZTogaHR0cHM6Ly9naXRodWIuY29tL0luZGlnb1VuaXRlZC9ub2RlLWNyb3NzLXNwYXduL2lzc3Vlcy8xNlxuICAgIGVub2VudC5ob29rQ2hpbGRQcm9jZXNzKHNwYXduZWQsIHBhcnNlZCk7XG5cbiAgICByZXR1cm4gc3Bhd25lZDtcbn1cblxuZnVuY3Rpb24gc3Bhd25TeW5jKGNvbW1hbmQsIGFyZ3MsIG9wdGlvbnMpIHtcbiAgICAvLyBQYXJzZSB0aGUgYXJndW1lbnRzXG4gICAgY29uc3QgcGFyc2VkID0gcGFyc2UoY29tbWFuZCwgYXJncywgb3B0aW9ucyk7XG5cbiAgICAvLyBTcGF3biB0aGUgY2hpbGQgcHJvY2Vzc1xuICAgIGNvbnN0IHJlc3VsdCA9IGNwLnNwYXduU3luYyhwYXJzZWQuY29tbWFuZCwgcGFyc2VkLmFyZ3MsIHBhcnNlZC5vcHRpb25zKTtcblxuICAgIC8vIEFuYWx5emUgaWYgdGhlIGNvbW1hbmQgZG9lcyBub3QgZXhpc3QsIHNlZTogaHR0cHM6Ly9naXRodWIuY29tL0luZGlnb1VuaXRlZC9ub2RlLWNyb3NzLXNwYXduL2lzc3Vlcy8xNlxuICAgIHJlc3VsdC5lcnJvciA9IHJlc3VsdC5lcnJvciB8fCBlbm9lbnQudmVyaWZ5RU5PRU5UU3luYyhyZXN1bHQuc3RhdHVzLCBwYXJzZWQpO1xuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzcGF3bjtcbm1vZHVsZS5leHBvcnRzLnNwYXduID0gc3Bhd247XG5tb2R1bGUuZXhwb3J0cy5zeW5jID0gc3Bhd25TeW5jO1xuXG5tb2R1bGUuZXhwb3J0cy5fcGFyc2UgPSBwYXJzZTtcbm1vZHVsZS5leHBvcnRzLl9lbm9lbnQgPSBlbm9lbnQ7XG4iLAogICAgIi8qKlxuICogUmFscGggTG9vcCBSdW5uZXIgLSBCYXNoLWxvb3Agc3R5bGUgaXRlcmF0aW9uIHdpdGggZnJlc2ggY29udGV4dCBwZXIgY3ljbGVcbiAqXG4gKiBJbXBsZW1lbnRzIHRoZSBvcmlnaW5hbCBSYWxwaCBXaWdndW0gdmlzaW9uOlxuICogLSBGcmVzaCBPcGVuQ29kZSBzZXNzaW9uIHBlciBpdGVyYXRpb24gKG5vIHRyYW5zY3JpcHQgY2Fycnktb3ZlcilcbiAqIC0gRmlsZSBJL08gYXMgc3RhdGUgKC5haS1lbmcvcnVucy88cnVuSWQ+Ly5mbG93KVxuICogLSBEZXRlcm1pbmlzdGljIHJlLWFuY2hvcmluZyBmcm9tIGRpc2sgc3RhdGUgZWFjaCBjeWNsZVxuICogLSBNdWx0aS1waGFzZSB3b3JrZmxvdyAocmVzZWFyY2gg4oaSIHNwZWNpZnkg4oaSIHBsYW4g4oaSIHdvcmsg4oaSIHJldmlldylcbiAqIC0gUXVhbGl0eSBnYXRlcyB0aGF0IGJsb2NrIHVudGlsIHBhc3NlZFxuICovXG5cbmltcG9ydCB7IGV4ZWNTeW5jIH0gZnJvbSBcIm5vZGU6Y2hpbGRfcHJvY2Vzc1wiO1xuaW1wb3J0IHsgY3JlYXRlSGFzaCB9IGZyb20gXCJub2RlOmNyeXB0b1wiO1xuaW1wb3J0IHsgcmVhZEZpbGUsIHJlYWRkaXIgfSBmcm9tIFwibm9kZTpmcy9wcm9taXNlc1wiO1xuaW1wb3J0IHsgam9pbiwgcGFyc2UgfSBmcm9tIFwibm9kZTpwYXRoXCI7XG5pbXBvcnQgeyBPcGVuQ29kZUNsaWVudCwgdHlwZSBTZXNzaW9uIH0gZnJvbSBcIi4uL2JhY2tlbmRzL29wZW5jb2RlL2NsaWVudFwiO1xuaW1wb3J0IHR5cGUgeyBSYWxwaEZsYWdzIH0gZnJvbSBcIi4uL2NsaS9mbGFnc1wiO1xuaW1wb3J0IHsgVUkgfSBmcm9tIFwiLi4vY2xpL3VpXCI7XG5pbXBvcnQgdHlwZSB7IEFpRW5nQ29uZmlnLCBHYXRlQ29tbWFuZENvbmZpZyB9IGZyb20gXCIuLi9jb25maWcvc2NoZW1hXCI7XG5pbXBvcnQgeyBQcm9tcHRPcHRpbWl6ZXIgfSBmcm9tIFwiLi4vcHJvbXB0LW9wdGltaXphdGlvbi9vcHRpbWl6ZXJcIjtcbmltcG9ydCB0eXBlIHsgRGlzY29yZFdlYmhvb2tDbGllbnQgfSBmcm9tIFwiLi4vdXRpbC9kaXNjb3JkLXdlYmhvb2tcIjtcbmltcG9ydCB7IGNyZWF0ZURpc2NvcmRXZWJob29rRnJvbUVudiB9IGZyb20gXCIuLi91dGlsL2Rpc2NvcmQtd2ViaG9va1wiO1xuaW1wb3J0IHsgTG9nIH0gZnJvbSBcIi4uL3V0aWwvbG9nXCI7XG5pbXBvcnQgeyBGbG93U3RvcmUsIHR5cGUgRmxvd1N0b3JlT3B0aW9ucyB9IGZyb20gXCIuL2Zsb3ctc3RvcmVcIjtcbmltcG9ydCB0eXBlIHtcbiAgICBDeWNsZVN0YXRlLFxuICAgIEdhdGVSZXN1bHQsXG4gICAgTG9vcENvbmZpZyxcbiAgICBUb29sSW52b2NhdGlvbixcbn0gZnJvbSBcIi4vZmxvdy10eXBlc1wiO1xuaW1wb3J0IHtcbiAgICBGTE9XX1NDSEVNQV9WRVJTSU9OLFxuICAgIFBoYXNlLFxuICAgIFJ1blN0YXR1cyxcbiAgICBTdG9wUmVhc29uLFxufSBmcm9tIFwiLi9mbG93LXR5cGVzXCI7XG5cbmNvbnN0IGxvZyA9IExvZy5jcmVhdGUoeyBzZXJ2aWNlOiBcInJhbHBoLWxvb3BcIiB9KTtcblxuLyoqIERlZmF1bHQgcXVhbGl0eSBnYXRlcyAqL1xuY29uc3QgREVGQVVMVF9HQVRFUyA9IFtcInRlc3RcIiwgXCJsaW50XCIsIFwiYWNjZXB0YW5jZVwiXTtcblxuLyoqIERlZmF1bHQgbWF4IGN5Y2xlcyAqL1xuY29uc3QgREVGQVVMVF9NQVhfQ1lDTEVTID0gNTA7XG5cbi8qKiBEZWZhdWx0IHN0dWNrIHRocmVzaG9sZCAqL1xuY29uc3QgREVGQVVMVF9TVFVDS19USFJFU0hPTEQgPSA1O1xuXG4vKiogRGVmYXVsdCBjaGVja3BvaW50IGZyZXF1ZW5jeSAqL1xuY29uc3QgREVGQVVMVF9DSEVDS1BPSU5UX0ZSRVFVRU5DWSA9IDE7XG5cbi8qKiBEZWZhdWx0IGN5Y2xlIHJldHJpZXMgKi9cbmNvbnN0IERFRkFVTFRfQ1lDTEVfUkVUUklFUyA9IDI7XG5cbi8qKiBTZWNyZXRzIHBhdHRlcm5zIHRvIHJlZGFjdCBpbiBkZWJ1ZyBvdXRwdXQgKi9cbmNvbnN0IFNFQ1JFVF9QQVRURVJOUyA9IFtcbiAgICAvYXBpW18tXT9rZXkvaSxcbiAgICAvdG9rZW4vaSxcbiAgICAvc2VjcmV0L2ksXG4gICAgL3Bhc3N3b3JkL2ksXG4gICAgL2NyZWRlbnRpYWwvaSxcbiAgICAvd2ViaG9vay9pLFxuICAgIC9hdXRoL2ksXG4gICAgL2JlYXJlci9pLFxuICAgIC9wcml2YXRlW18tXT9rZXkvaSxcbl07XG5cbi8qKlxuICogUmVkYWN0IHNlY3JldHMgZnJvbSBhIHN0cmluZ1xuICovXG5mdW5jdGlvbiByZWRhY3RTZWNyZXRzKHRleHQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICBsZXQgcmVzdWx0ID0gdGV4dDtcbiAgICBmb3IgKGNvbnN0IHBhdHRlcm4gb2YgU0VDUkVUX1BBVFRFUk5TKSB7XG4gICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKFxuICAgICAgICAgICAgbmV3IFJlZ0V4cChcbiAgICAgICAgICAgICAgICBgJHtwYXR0ZXJuLnNvdXJjZX1bXCInXT9cXFxccypbOj1dXFxcXHMqW1wiJ10/KFteXCInXCIsXFxcXHNdKylgLFxuICAgICAgICAgICAgICAgIFwiZ2lcIixcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBgJHtwYXR0ZXJuLnNvdXJjZX09XCJbUkVEQUNURURdXCJgLFxuICAgICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIFRydW5jYXRlIGxvbmcgb3V0cHV0IGZvciBsb2dnaW5nXG4gKi9cbmZ1bmN0aW9uIHRydW5jYXRlT3V0cHV0KHRleHQ6IHN0cmluZywgbWF4TGVuZ3RoID0gMTAwMCk6IHN0cmluZyB7XG4gICAgaWYgKHRleHQubGVuZ3RoIDw9IG1heExlbmd0aCkgcmV0dXJuIHRleHQ7XG4gICAgcmV0dXJuIGAke3RleHQuc3Vic3RyaW5nKDAsIG1heExlbmd0aCl9XFxuLi4uIFt0cnVuY2F0ZWQgJHt0ZXh0Lmxlbmd0aCAtIG1heExlbmd0aH0gY2hhcnNdYDtcbn1cblxuLyoqXG4gKiBSYWxwaCBMb29wIFJ1bm5lciAtIG9yY2hlc3RyYXRlcyBpdGVyYXRpb24gbG9vcHMgd2l0aCBmcmVzaCBzZXNzaW9uc1xuICovXG5leHBvcnQgY2xhc3MgUmFscGhMb29wUnVubmVyIHtcbiAgICBwcml2YXRlIGNvbmZpZzogTG9vcENvbmZpZztcbiAgICBwcml2YXRlIGZsb3dTdG9yZTogRmxvd1N0b3JlO1xuICAgIHByaXZhdGUgZmxhZ3M6IFJhbHBoRmxhZ3M7XG4gICAgcHJpdmF0ZSBiYXNlQ29uZmlnOiBBaUVuZ0NvbmZpZztcbiAgICBwcml2YXRlIG9wdGltaXplcjogUHJvbXB0T3B0aW1pemVyO1xuICAgIHByaXZhdGUgZGlzY29yZFdlYmhvb2s6IERpc2NvcmRXZWJob29rQ2xpZW50IHwgbnVsbDtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBmbGFnczogUmFscGhGbGFncyxcbiAgICAgICAgYmFzZUNvbmZpZzogQWlFbmdDb25maWcsXG4gICAgICAgIG9wdGltaXplcjogUHJvbXB0T3B0aW1pemVyLFxuICAgICkge1xuICAgICAgICB0aGlzLmZsYWdzID0gZmxhZ3M7XG4gICAgICAgIHRoaXMuYmFzZUNvbmZpZyA9IGJhc2VDb25maWc7XG4gICAgICAgIHRoaXMub3B0aW1pemVyID0gb3B0aW1pemVyO1xuXG4gICAgICAgIC8vIEJ1aWxkIGxvb3AgY29uZmlnIGZyb20gZmxhZ3NcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLmJ1aWxkTG9vcENvbmZpZygpO1xuICAgICAgICBjb25zdCBmbG93U3RvcmVPcHRpb25zOiBGbG93U3RvcmVPcHRpb25zID0ge1xuICAgICAgICAgICAgZmxvd0RpcjogdGhpcy5jb25maWcuZmxvd0RpcixcbiAgICAgICAgICAgIHJ1bklkOiB0aGlzLmNvbmZpZy5ydW5JZCxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5mbG93U3RvcmUgPSBuZXcgRmxvd1N0b3JlKGZsb3dTdG9yZU9wdGlvbnMpO1xuXG4gICAgICAgIC8vIEluaXRpYWxpemUgRGlzY29yZCB3ZWJob29rIGZyb20gZW52aXJvbm1lbnRcbiAgICAgICAgdGhpcy5kaXNjb3JkV2ViaG9vayA9IGNyZWF0ZURpc2NvcmRXZWJob29rRnJvbUVudigpO1xuICAgIH1cblxuICAgIC8qKiBCdWlsZCBsb29wIGNvbmZpZyBmcm9tIGZsYWdzICovXG4gICAgcHJpdmF0ZSBidWlsZExvb3BDb25maWcoKTogTG9vcENvbmZpZyB7XG4gICAgICAgIC8vIERldGVybWluZSBjb21wbGV0aW9uIHByb21pc2UgYmFzZWQgb24gbW9kZVxuICAgICAgICBsZXQgY29tcGxldGlvblByb21pc2UgPSB0aGlzLmZsYWdzLmNvbXBsZXRpb25Qcm9taXNlID8/IFwiXCI7XG5cbiAgICAgICAgaWYgKHRoaXMuZmxhZ3Muc2hpcCkge1xuICAgICAgICAgICAgLy8gU2hpcCBtb2RlOiBhdXRvLWV4aXQgd2hlbiBhZ2VudCBvdXRwdXRzIFNISVBcbiAgICAgICAgICAgIGNvbXBsZXRpb25Qcm9taXNlID0gXCI8cHJvbWlzZT5TSElQPC9wcm9taXNlPlwiO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZmxhZ3MuZHJhZnQpIHtcbiAgICAgICAgICAgIC8vIERyYWZ0IG1vZGU6IHJ1biBmb3IgbWF4LWN5Y2xlcywgc3RvcCBmb3IgcmV2aWV3IChubyBhdXRvLWV4aXQpXG4gICAgICAgICAgICBjb21wbGV0aW9uUHJvbWlzZSA9IFwiXCI7XG4gICAgICAgIH0gZWxzZSBpZiAoIWNvbXBsZXRpb25Qcm9taXNlKSB7XG4gICAgICAgICAgICAvLyBObyBmbGFnIHNwZWNpZmllZCBhbmQgbm8gY29tcGxldGlvbiBwcm9taXNlOiBkZWZhdWx0IHRvIGRyYWZ0IG1vZGVcbiAgICAgICAgICAgIGNvbXBsZXRpb25Qcm9taXNlID0gXCJcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEdlbmVyYXRlIHJ1biBJRCBpZiBub3QgcmVzdW1pbmdcbiAgICAgICAgbGV0IHJ1bklkID0gdGhpcy5mbGFncy5ydW5JZDtcbiAgICAgICAgaWYgKCFydW5JZCkge1xuICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIGV4aXN0aW5nIGZsb3cgc3RhdGVcbiAgICAgICAgICAgIGNvbnN0IGRlZmF1bHRSdW5JZCA9IHRoaXMuZ2VuZXJhdGVSdW5JZCgpO1xuICAgICAgICAgICAgY29uc3QgZGVmYXVsdEZsb3dEaXIgPSB0aGlzLmdldERlZmF1bHRGbG93RGlyKGRlZmF1bHRSdW5JZCk7XG4gICAgICAgICAgICBjb25zdCBjaGVja1N0b3JlID0gbmV3IEZsb3dTdG9yZSh7XG4gICAgICAgICAgICAgICAgZmxvd0RpcjogdGhpcy5mbGFncy53b3JraW5nRGlyXG4gICAgICAgICAgICAgICAgICAgID8gam9pbih0aGlzLmZsYWdzLndvcmtpbmdEaXIsIFwiLmFpLWVuZ1wiKVxuICAgICAgICAgICAgICAgICAgICA6IFwiLmFpLWVuZ1wiLFxuICAgICAgICAgICAgICAgIHJ1bklkOiBkZWZhdWx0UnVuSWQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJ1bklkID0gZGVmYXVsdFJ1bklkO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJ1bklkLFxuICAgICAgICAgICAgcHJvbXB0OiB0aGlzLmZsYWdzLndvcmtmbG93ID8/IFwiXCIsXG4gICAgICAgICAgICBjb21wbGV0aW9uUHJvbWlzZSxcbiAgICAgICAgICAgIG1heEN5Y2xlczogdGhpcy5mbGFncy5tYXhDeWNsZXMgPz8gREVGQVVMVF9NQVhfQ1lDTEVTLFxuICAgICAgICAgICAgc3R1Y2tUaHJlc2hvbGQ6XG4gICAgICAgICAgICAgICAgdGhpcy5mbGFncy5zdHVja1RocmVzaG9sZCA/PyBERUZBVUxUX1NUVUNLX1RIUkVTSE9MRCxcbiAgICAgICAgICAgIGdhdGVzOiB0aGlzLmZsYWdzLmdhdGVzID8/IERFRkFVTFRfR0FURVMsXG4gICAgICAgICAgICBjaGVja3BvaW50RnJlcXVlbmN5OlxuICAgICAgICAgICAgICAgIHRoaXMuZmxhZ3MuY2hlY2twb2ludEZyZXF1ZW5jeSA/PyBERUZBVUxUX0NIRUNLUE9JTlRfRlJFUVVFTkNZLFxuICAgICAgICAgICAgZmxvd0RpcjogdGhpcy5nZXREZWZhdWx0Rmxvd0RpcihydW5JZCksXG4gICAgICAgICAgICBkcnlSdW46IHRoaXMuZmxhZ3MuZHJ5UnVuID8/IGZhbHNlLFxuICAgICAgICAgICAgY3ljbGVSZXRyaWVzOlxuICAgICAgICAgICAgICAgIHRoaXMuYmFzZUNvbmZpZy5sb29wPy5jeWNsZVJldHJpZXMgPz8gREVGQVVMVF9DWUNMRV9SRVRSSUVTLFxuICAgICAgICAgICAgZGVidWdXb3JrOlxuICAgICAgICAgICAgICAgIHRoaXMuZmxhZ3MuZGVidWdXb3JrID8/IHRoaXMuYmFzZUNvbmZpZy5kZWJ1Zz8ud29yayA/PyBmYWxzZSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKiogR2V0IGRlZmF1bHQgZmxvdyBkaXJlY3RvcnkgcGF0aCAqL1xuICAgIHByaXZhdGUgZ2V0RGVmYXVsdEZsb3dEaXIocnVuSWQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IGFydGlmYWN0c0RpciA9IHRoaXMuYmFzZUNvbmZpZy5ydW5uZXIuYXJ0aWZhY3RzRGlyO1xuICAgICAgICBpZiAodGhpcy5mbGFncy53b3JraW5nRGlyKSB7XG4gICAgICAgICAgICByZXR1cm4gam9pbih0aGlzLmZsYWdzLndvcmtpbmdEaXIsIGFydGlmYWN0c0Rpcik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGpvaW4ocHJvY2Vzcy5jd2QoKSwgYXJ0aWZhY3RzRGlyKTtcbiAgICB9XG5cbiAgICAvKiogR2VuZXJhdGUgYSB1bmlxdWUgcnVuIElEICovXG4gICAgcHJpdmF0ZSBnZW5lcmF0ZVJ1bklkKCk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IHRpbWVzdGFtcCA9IERhdGUubm93KCkudG9TdHJpbmcoMzYpO1xuICAgICAgICBjb25zdCByYW5kb20gPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoMiwgOCk7XG4gICAgICAgIHJldHVybiBgcnVuLSR7dGltZXN0YW1wfS0ke3JhbmRvbX1gO1xuICAgIH1cblxuICAgIC8qKiBHZW5lcmF0ZSBhIGhhc2ggb2Ygb3V0cHV0IGZvciBzdHVjayBkZXRlY3Rpb24gKi9cbiAgICBwcml2YXRlIGhhc2hPdXRwdXQob3V0cHV0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gY3JlYXRlSGFzaChcInNoYTI1NlwiKVxuICAgICAgICAgICAgLnVwZGF0ZShvdXRwdXQpXG4gICAgICAgICAgICAuZGlnZXN0KFwiaGV4XCIpXG4gICAgICAgICAgICAuc3Vic3RyaW5nKDAsIDE2KTtcbiAgICB9XG5cbiAgICAvKiogUnVuIHRoZSBsb29wICovXG4gICAgYXN5bmMgcnVuKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBVSS5oZWFkZXIoXCJSYWxwaCBMb29wIFJ1bm5lclwiKTtcblxuICAgICAgICAvLyBDaGVjayBmb3IgcmVzdW1lXG4gICAgICAgIGlmICh0aGlzLmZsYWdzLnJlc3VtZSkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5yZXN1bWUoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFN0YXJ0IGZyZXNoIHJ1blxuICAgICAgICBhd2FpdCB0aGlzLnN0YXJ0RnJlc2goKTtcbiAgICB9XG5cbiAgICAvKiogU3RhcnQgYSBmcmVzaCBydW4gKi9cbiAgICBwcml2YXRlIGFzeW5jIHN0YXJ0RnJlc2goKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGxvZy5pbmZvKFwiU3RhcnRpbmcgZnJlc2ggUmFscGggbG9vcFwiLCB7XG4gICAgICAgICAgICBydW5JZDogdGhpcy5jb25maWcucnVuSWQsXG4gICAgICAgICAgICBwcm9tcHQ6IHRoaXMuY29uZmlnLnByb21wdC5zdWJzdHJpbmcoMCwgMTAwKSxcbiAgICAgICAgICAgIGNvbXBsZXRpb25Qcm9taXNlOiB0aGlzLmNvbmZpZy5jb21wbGV0aW9uUHJvbWlzZSxcbiAgICAgICAgICAgIG1heEN5Y2xlczogdGhpcy5jb25maWcubWF4Q3ljbGVzLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBJbml0aWFsaXplIGZsb3cgc3RvcmVcbiAgICAgICAgdGhpcy5mbG93U3RvcmUuaW5pdGlhbGl6ZSgpO1xuXG4gICAgICAgIC8vIENyZWF0ZSBpbml0aWFsIHN0YXRlXG4gICAgICAgIGNvbnN0IGluaXRpYWxTdGF0ZSA9IHRoaXMuZmxvd1N0b3JlLmNyZWF0ZUluaXRpYWxTdGF0ZSh7XG4gICAgICAgICAgICBwcm9tcHQ6IHRoaXMuY29uZmlnLnByb21wdCxcbiAgICAgICAgICAgIGNvbXBsZXRpb25Qcm9taXNlOiB0aGlzLmNvbmZpZy5jb21wbGV0aW9uUHJvbWlzZSxcbiAgICAgICAgICAgIG1heEN5Y2xlczogdGhpcy5jb25maWcubWF4Q3ljbGVzLFxuICAgICAgICAgICAgc3R1Y2tUaHJlc2hvbGQ6IHRoaXMuY29uZmlnLnN0dWNrVGhyZXNob2xkLFxuICAgICAgICAgICAgZ2F0ZXM6IHRoaXMuY29uZmlnLmdhdGVzLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBVcGRhdGUgc3RhdHVzIHRvIHJ1bm5pbmdcbiAgICAgICAgdGhpcy5mbG93U3RvcmUudXBkYXRlU3RhdHVzKFJ1blN0YXR1cy5SVU5OSU5HKTtcblxuICAgICAgICAvLyBSdW4gdGhlIGxvb3BcbiAgICAgICAgYXdhaXQgdGhpcy5ydW5Mb29wKCk7XG4gICAgfVxuXG4gICAgLyoqIFJlc3VtZSBmcm9tIHByZXZpb3VzIHJ1biAqL1xuICAgIHByaXZhdGUgYXN5bmMgcmVzdW1lKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBsb2cuaW5mbyhcIlJlc3VtaW5nIFJhbHBoIGxvb3BcIiwgeyBydW5JZDogdGhpcy5jb25maWcucnVuSWQgfSk7XG5cbiAgICAgICAgY29uc3Qgc3RhdGUgPSB0aGlzLmZsb3dTdG9yZS5sb2FkKCk7XG4gICAgICAgIGlmICghc3RhdGUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICBgTm8gZmxvdyBzdGF0ZSBmb3VuZCBmb3IgcnVuIElEOiAke3RoaXMuY29uZmlnLnJ1bklkfS4gQ2Fubm90IHJlc3VtZS5gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzdGF0ZS5zdGF0dXMgPT09IFJ1blN0YXR1cy5DT01QTEVURUQpIHtcbiAgICAgICAgICAgIFVJLndhcm4oXCJUaGlzIHJ1biBoYXMgYWxyZWFkeSBjb21wbGV0ZWQuXCIpO1xuICAgICAgICAgICAgVUkuaW5mbyhgU3RvcCByZWFzb246ICR7c3RhdGUuc3RvcFJlYXNvbn1gKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzdGF0ZS5zdGF0dXMgPT09IFJ1blN0YXR1cy5GQUlMRUQpIHtcbiAgICAgICAgICAgIFVJLndhcm4oXCJUaGlzIHJ1biBwcmV2aW91c2x5IGZhaWxlZC5cIik7XG4gICAgICAgICAgICBVSS5pbmZvKGBFcnJvcjogJHtzdGF0ZS5lcnJvcn1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlc3VtZSB0aGUgbG9vcFxuICAgICAgICBhd2FpdCB0aGlzLnJ1bkxvb3AoKTtcbiAgICB9XG5cbiAgICAvKiogTWFpbiBsb29wIGV4ZWN1dGlvbiAqL1xuICAgIHByaXZhdGUgYXN5bmMgcnVuTG9vcCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgY29uc3Qgc3RhdGUgPSB0aGlzLmZsb3dTdG9yZS5sb2FkKCk7XG4gICAgICAgIGlmICghc3RhdGUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIGZsb3cgc3RhdGUgZm91bmRcIik7XG4gICAgICAgIH1cblxuICAgICAgICBVSS5pbmZvKGBSdW4gSUQ6ICR7dGhpcy5jb25maWcucnVuSWR9YCk7XG4gICAgICAgIFVJLmluZm8oYEZsb3cgZGlyZWN0b3J5OiAke3RoaXMuZmxvd1N0b3JlLmJhc2VQYXRofWApO1xuICAgICAgICBVSS5pbmZvKFxuICAgICAgICAgICAgYENvbXBsZXRpb24gcHJvbWlzZTogJHt0aGlzLmNvbmZpZy5jb21wbGV0aW9uUHJvbWlzZSB8fCBcIihub25lKVwifWAsXG4gICAgICAgICk7XG4gICAgICAgIFVJLmluZm8oYE1heCBjeWNsZXM6ICR7dGhpcy5jb25maWcubWF4Q3ljbGVzfWApO1xuICAgICAgICBVSS5pbmZvKGBDeWNsZSByZXRyaWVzOiAke3RoaXMuY29uZmlnLmN5Y2xlUmV0cmllc31gKTtcbiAgICAgICAgVUkuaW5mbyhgU3R1Y2sgdGhyZXNob2xkOiAke3RoaXMuY29uZmlnLnN0dWNrVGhyZXNob2xkfWApO1xuICAgICAgICBVSS5pbmZvKFxuICAgICAgICAgICAgYERlYnVnIHdvcms6ICR7dGhpcy5jb25maWcuZGVidWdXb3JrID8gXCJlbmFibGVkXCIgOiBcImRpc2FibGVkXCJ9YCxcbiAgICAgICAgKTtcbiAgICAgICAgVUkucHJpbnRsbigpO1xuXG4gICAgICAgIC8vIENoZWNrIGlmIHdlIHNob3VsZCBza2lwIG9wdGltaXphdGlvbiAoYWxyZWFkeSBkb25lIG9uIGluaXRpYWwgaW5nZXN0KVxuICAgICAgICAvLyBGb3IgbG9vcCBtb2RlLCB3ZSBza2lwIHJlLW9wdGltaXphdGlvbiBlYWNoIGN5Y2xlXG5cbiAgICAgICAgLy8gUnVuIGN5Y2xlc1xuICAgICAgICBmb3IgKFxuICAgICAgICAgICAgbGV0IGN5Y2xlTnVtYmVyID0gc3RhdGUuY3VycmVudEN5Y2xlICsgMTtcbiAgICAgICAgICAgIGN5Y2xlTnVtYmVyIDw9IHRoaXMuY29uZmlnLm1heEN5Y2xlcztcbiAgICAgICAgICAgIGN5Y2xlTnVtYmVyKytcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBVSS5oZWFkZXIoYEN5Y2xlICR7Y3ljbGVOdW1iZXJ9LyR7dGhpcy5jb25maWcubWF4Q3ljbGVzfWApO1xuXG4gICAgICAgICAgICAvLyBOb3RpZnkgRGlzY29yZDogY3ljbGUgc3RhcnRlZFxuICAgICAgICAgICAgY29uc3QgcnVuU3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgIHRoaXMuZGlzY29yZFdlYmhvb2s/Lm5vdGlmeUN5Y2xlU3RhcnQoXG4gICAgICAgICAgICAgICAgY3ljbGVOdW1iZXIsXG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcubWF4Q3ljbGVzLFxuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLnByb21wdCxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIC8vIEV4ZWN1dGUgY3ljbGUgd2l0aCByZXRyeSBsb2dpY1xuICAgICAgICAgICAgbGV0IGF0dGVtcHQgPSAwO1xuICAgICAgICAgICAgbGV0IHJlc3VsdDoge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGJvb2xlYW47XG4gICAgICAgICAgICAgICAgY3ljbGVTdGF0ZTogQ3ljbGVTdGF0ZTtcbiAgICAgICAgICAgICAgICBzdW1tYXJ5OiBzdHJpbmc7XG4gICAgICAgICAgICAgICAgc3RvcFJlYXNvbj86IFN0b3BSZWFzb247XG4gICAgICAgICAgICB9IHwgbnVsbCA9IG51bGw7XG4gICAgICAgICAgICBsZXQgbGFzdEVycm9yOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcblxuICAgICAgICAgICAgd2hpbGUgKGF0dGVtcHQgPD0gdGhpcy5jb25maWcuY3ljbGVSZXRyaWVzKSB7XG4gICAgICAgICAgICAgICAgYXR0ZW1wdCsrO1xuICAgICAgICAgICAgICAgIGNvbnN0IGlzUmV0cnkgPSBhdHRlbXB0ID4gMTtcblxuICAgICAgICAgICAgICAgIGlmIChpc1JldHJ5KSB7XG4gICAgICAgICAgICAgICAgICAgIFVJLmluZm8oXG4gICAgICAgICAgICAgICAgICAgICAgICBgUmV0cnkgYXR0ZW1wdCAke2F0dGVtcHR9LyR7dGhpcy5jb25maWcuY3ljbGVSZXRyaWVzICsgMX1gLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICBsb2cuaW5mbyhcIlJldHJ5aW5nIGN5Y2xlXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN5Y2xlTnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXR0ZW1wdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RFcnJvcixcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGZyZXNoIE9wZW5Db2RlIHNlc3Npb24gZm9yIHRoaXMgY3ljbGVcbiAgICAgICAgICAgICAgICBjb25zdCBjbGllbnQgPSBhd2FpdCBPcGVuQ29kZUNsaWVudC5jcmVhdGUoe1xuICAgICAgICAgICAgICAgICAgICBzZXJ2ZXJTdGFydHVwVGltZW91dDogMTAwMDAsXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAvLyBSZS1hbmNob3IgY29udGV4dCBmcm9tIGRpc2sgKHdpdGggcmV0cnkgZmFpbHVyZSBpbmplY3RlZCBpZiB0aGlzIGlzIGEgcmV0cnkpXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRleHQgPSBhd2FpdCB0aGlzLmJ1aWxkUmVBbmNob3JlZENvbnRleHQoXG4gICAgICAgICAgICAgICAgICAgICAgICBjeWNsZU51bWJlcixcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzUmV0cnkgPyAobGFzdEVycm9yID8/IHVuZGVmaW5lZCkgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gRXhlY3V0ZSB0aGUgY3ljbGUgd2l0aCBmcmVzaCBzZXNzaW9uXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IGF3YWl0IHRoaXMuZXhlY3V0ZUN5Y2xlKFxuICAgICAgICAgICAgICAgICAgICAgICAgY3ljbGVOdW1iZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGllbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0LFxuICAgICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFJlY29yZCB0aGUgY3ljbGVcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZsb3dTdG9yZS5yZWNvcmRTdWNjZXNzZnVsQ3ljbGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LmN5Y2xlU3RhdGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnN1bW1hcnksXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBOb3RpZnkgRGlzY29yZDogY3ljbGUgY29tcGxldGVkXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkdXJhdGlvbk1zID0gRGF0ZS5ub3coKSAtIHJ1blN0YXJ0VGltZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGlzY29yZFdlYmhvb2s/Lm5vdGlmeUN5Y2xlQ29tcGxldGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3ljbGVOdW1iZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mbG93U3RvcmUubG9hZCgpPy5jb21wbGV0ZWRDeWNsZXMgPz9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3ljbGVOdW1iZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnN1bW1hcnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZHVyYXRpb25NcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZsb3dTdG9yZS5yZWNvcmRGYWlsZWRDeWNsZShyZXN1bHQuY3ljbGVTdGF0ZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5vdGlmeSBEaXNjb3JkOiBjeWNsZSBmYWlsZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGlzY29yZFdlYmhvb2s/Lm5vdGlmeUVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN5Y2xlTnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5jeWNsZVN0YXRlLnBoYXNlc1tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQuY3ljbGVTdGF0ZS5waGFzZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkucG9wKCkgYXMga2V5b2YgdHlwZW9mIHJlc3VsdC5jeWNsZVN0YXRlLnBoYXNlc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0/LnBoYXNlID8/IFwidW5rbm93blwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5jeWNsZVN0YXRlLmVycm9yID8/IFwiVW5rbm93biBlcnJvclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIEJyZWFrIHJldHJ5IGxvb3Agb24gc3VjY2VzcyBvciBub24tcmV0cnlhYmxlIGZhaWx1cmVcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIERldGVybWluZSBpZiB3ZSBzaG91bGQgcmV0cnkgdGhpcyBmYWlsdXJlXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNob3VsZFJldHJ5ID0gdGhpcy5zaG91bGRSZXRyeUZhaWx1cmUocmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFzaG91bGRSZXRyeSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBsYXN0RXJyb3IgPSByZXN1bHQuc3VtbWFyeTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1zZyA9XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RFcnJvciA9IGVycm9yTXNnO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIHdlIHNob3VsZCByZXRyeSB0aGlzIGVycm9yXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNob3VsZFJldHJ5ID0gdGhpcy5zaG91bGRSZXRyeU9uRXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2hvdWxkUmV0cnkgJiYgYXR0ZW1wdCA8PSB0aGlzLmNvbmZpZy5jeWNsZVJldHJpZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZy53YXJuKFwiQ3ljbGUgZXJyb3IsIHdpbGwgcmV0cnlcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN5Y2xlTnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF0dGVtcHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yTXNnLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBOb24tcmV0cnlhYmxlIG9yIG1heCByZXRyaWVzIGV4Y2VlZGVkXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIENsZWFuIHVwIHRoZSBzZXNzaW9uIGZvciB0aGlzIGN5Y2xlXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGNsaWVudC5jbGVhbnVwKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBJZiByZXN1bHQgaXMgbnVsbCBhZnRlciBhbGwgcmV0cmllcywgd2UgaGFkIGEgY2F0YXN0cm9waGljIGZhaWx1cmVcbiAgICAgICAgICAgIGlmICghcmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kaXNjb3JkV2ViaG9vaz8ubm90aWZ5U3R1Y2tPckFib3J0ZWQoXG4gICAgICAgICAgICAgICAgICAgIGN5Y2xlTnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICBcIkZBSUxFRF9BTExfUkVUUklFU1wiLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5oYW5kbGVTdG9wKFxuICAgICAgICAgICAgICAgICAgICBTdG9wUmVhc29uLkVSUk9SLFxuICAgICAgICAgICAgICAgICAgICBgQ3ljbGUgJHtjeWNsZU51bWJlcn0gZmFpbGVkIGFmdGVyICR7dGhpcy5jb25maWcuY3ljbGVSZXRyaWVzICsgMX0gYXR0ZW1wdHM6ICR7bGFzdEVycm9yID8/IFwidW5rbm93biBlcnJvclwifWAsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIENoZWNrIHN0b3AgY29uZGl0aW9uc1xuICAgICAgICAgICAgaWYgKHJlc3VsdC5zdG9wUmVhc29uKSB7XG4gICAgICAgICAgICAgICAgLy8gTm90aWZ5IERpc2NvcmQ6IHJ1biBzdG9wcGVkXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5oYW5kbGVTdG9wKHJlc3VsdC5zdG9wUmVhc29uLCByZXN1bHQuc3VtbWFyeSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDaGVjayBpZiBzdHVja1xuICAgICAgICAgICAgY29uc3QgY3VycmVudFN0YXRlID0gdGhpcy5mbG93U3RvcmUubG9hZCgpO1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIGN1cnJlbnRTdGF0ZSAmJlxuICAgICAgICAgICAgICAgIGN1cnJlbnRTdGF0ZS5zdHVja0NvdW50ID49IHRoaXMuY29uZmlnLnN0dWNrVGhyZXNob2xkXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAvLyBOb3RpZnkgRGlzY29yZDogc3R1Y2tcbiAgICAgICAgICAgICAgICB0aGlzLmRpc2NvcmRXZWJob29rPy5ub3RpZnlTdHVja09yQWJvcnRlZChjeWNsZU51bWJlciwgXCJTVFVDS1wiKTtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmhhbmRsZVN0b3AoXG4gICAgICAgICAgICAgICAgICAgIFN0b3BSZWFzb24uU1RVQ0ssXG4gICAgICAgICAgICAgICAgICAgIGBObyBwcm9ncmVzcyBmb3IgJHt0aGlzLmNvbmZpZy5zdHVja1RocmVzaG9sZH0gY29uc2VjdXRpdmUgY3ljbGVzYCxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gU2F2ZSBjaGVja3BvaW50IGlmIG5lZWRlZFxuICAgICAgICAgICAgaWYgKGN5Y2xlTnVtYmVyICUgdGhpcy5jb25maWcuY2hlY2twb2ludEZyZXF1ZW5jeSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZmxvd1N0b3JlLnNhdmVDaGVja3BvaW50KFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmZsb3dTdG9yZS5sb2FkKCkhLFxuICAgICAgICAgICAgICAgICAgICByZXN1bHQuY3ljbGVTdGF0ZS5waGFzZXMsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgVUkucHJpbnRsbigpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTWF4IGN5Y2xlcyByZWFjaGVkIC0gbm90aWZ5IERpc2NvcmRcbiAgICAgICAgdGhpcy5kaXNjb3JkV2ViaG9vaz8ubm90aWZ5UnVuQ29tcGxldGUoXG4gICAgICAgICAgICBzdGF0ZS5jb21wbGV0ZWRDeWNsZXMsXG4gICAgICAgICAgICBEYXRlLm5vdygpIC0gbmV3IERhdGUoc3RhdGUuY3JlYXRlZEF0KS5nZXRUaW1lKCksXG4gICAgICAgICAgICBgQ29tcGxldGVkICR7c3RhdGUuY29tcGxldGVkQ3ljbGVzfSBjeWNsZXMgKG1heCAke3RoaXMuY29uZmlnLm1heEN5Y2xlc30pYCxcbiAgICAgICAgKTtcbiAgICAgICAgYXdhaXQgdGhpcy5oYW5kbGVTdG9wKFN0b3BSZWFzb24uTUFYX0NZQ0xFUywgXCJNYXhpbXVtIGN5Y2xlcyByZWFjaGVkXCIpO1xuICAgIH1cblxuICAgIC8qKiBEZXRlcm1pbmUgaWYgYSBmYWlsdXJlIHNob3VsZCB0cmlnZ2VyIGEgcmV0cnkgKi9cbiAgICBwcml2YXRlIHNob3VsZFJldHJ5RmFpbHVyZShyZXN1bHQ6IHtcbiAgICAgICAgc3VjY2VzczogYm9vbGVhbjtcbiAgICAgICAgY3ljbGVTdGF0ZTogQ3ljbGVTdGF0ZTtcbiAgICAgICAgc3VtbWFyeTogc3RyaW5nO1xuICAgIH0pOiBib29sZWFuIHtcbiAgICAgICAgLy8gQ2hlY2sgZm9yIGdhdGUgZmFpbHVyZXNcbiAgICAgICAgY29uc3QgZmFpbGVkR2F0ZXMgPSByZXN1bHQuY3ljbGVTdGF0ZS5nYXRlUmVzdWx0cy5maWx0ZXIoXG4gICAgICAgICAgICAoZykgPT4gIWcucGFzc2VkLFxuICAgICAgICApO1xuICAgICAgICBpZiAoZmFpbGVkR2F0ZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDaGVjayBmb3IgZW1wdHkgd29yayByZXNwb25zZSAob3VyIGFjY2VwdGFuY2UgcnVsZSlcbiAgICAgICAgY29uc3Qgd29ya1BoYXNlID0gcmVzdWx0LmN5Y2xlU3RhdGUucGhhc2VzW1BoYXNlLldPUktdO1xuICAgICAgICBpZiAod29ya1BoYXNlICYmICF3b3JrUGhhc2UucmVzcG9uc2UudHJpbSgpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKiogRGV0ZXJtaW5lIGlmIGFuIGVycm9yIHNob3VsZCB0cmlnZ2VyIGEgcmV0cnkgKi9cbiAgICBwcml2YXRlIHNob3VsZFJldHJ5T25FcnJvcihlcnJvcjogdW5rbm93bik6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICAgICAgLy8gUmV0cnkgb24gdGltZW91dFxuICAgICAgICAgICAgaWYgKGVycm9yLm1lc3NhZ2UuaW5jbHVkZXMoXCJ0aW1lb3V0XCIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBSZXRyeSBvbiBzdHJlYW0gZXJyb3JzXG4gICAgICAgICAgICBpZiAoZXJyb3IubWVzc2FnZS5pbmNsdWRlcyhcInN0cmVhbVwiKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gUmV0cnkgb24gT3BlbkNvZGUgY29ubmVjdGlvbiBlcnJvcnNcbiAgICAgICAgICAgIGlmIChlcnJvci5tZXNzYWdlLmluY2x1ZGVzKFwiT3BlbkNvZGVcIikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqIEJ1aWxkIHJlLWFuY2hvcmVkIGNvbnRleHQgZm9yIGEgY3ljbGUgKi9cbiAgICBwcml2YXRlIGFzeW5jIGJ1aWxkUmVBbmNob3JlZENvbnRleHQoXG4gICAgICAgIGN5Y2xlTnVtYmVyOiBudW1iZXIsXG4gICAgICAgIHJldHJ5RmFpbHVyZT86IHN0cmluZyxcbiAgICApOiBQcm9taXNlPHN0cmluZz4ge1xuICAgICAgICBjb25zdCBjb250ZXh0UGFydHM6IHN0cmluZ1tdID0gW107XG5cbiAgICAgICAgLy8gQWx3YXlzIHN0YXJ0IHdpdGggdGhlIG9yaWdpbmFsIHByb21wdFxuICAgICAgICBjb250ZXh0UGFydHMucHVzaChgIyBPcmlnaW5hbCBUYXNrXFxuXFxuJHt0aGlzLmNvbmZpZy5wcm9tcHR9XFxuYCk7XG5cbiAgICAgICAgLy8gQWRkIHJldHJ5IGZhaWx1cmUgaW5mbyBpZiB0aGlzIGlzIGEgcmV0cnlcbiAgICAgICAgaWYgKHJldHJ5RmFpbHVyZSkge1xuICAgICAgICAgICAgY29udGV4dFBhcnRzLnB1c2goXG4gICAgICAgICAgICAgICAgYCMgUHJldmlvdXMgQXR0ZW1wdCBGYWlsZWRcXG5cXG5UaGUgcHJldmlvdXMgYXR0ZW1wdCBoYWQgYW4gaXNzdWU6XFxuJHtyZXRyeUZhaWx1cmV9XFxuXFxuUGxlYXNlIGFuYWx5emUgd2hhdCB3ZW50IHdyb25nIGFuZCB0cnkgYSBkaWZmZXJlbnQgYXBwcm9hY2guXFxuYCxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBZGQgcHJldmlvdXMgY3ljbGUgc3VtbWFyeSBpZiBhdmFpbGFibGVcbiAgICAgICAgY29uc3QgcHJldmlvdXNDeWNsZSA9IHRoaXMuZmxvd1N0b3JlLmdldEl0ZXJhdGlvbihjeWNsZU51bWJlciAtIDEpO1xuICAgICAgICBpZiAocHJldmlvdXNDeWNsZSkge1xuICAgICAgICAgICAgY29udGV4dFBhcnRzLnB1c2goXG4gICAgICAgICAgICAgICAgYCMgUHJldmlvdXMgQ3ljbGUgKCR7Y3ljbGVOdW1iZXIgLSAxfSkgU3VtbWFyeVxcblxcbmAsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgY29udGV4dFBhcnRzLnB1c2gocHJldmlvdXNDeWNsZS5lcnJvciA/IFwiRkFJTEVEXFxuXCIgOiBcIkNPTVBMRVRFRFxcblwiKTtcblxuICAgICAgICAgICAgaWYgKHByZXZpb3VzQ3ljbGUuZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0UGFydHMucHVzaChgRXJyb3I6ICR7cHJldmlvdXNDeWNsZS5lcnJvcn1cXG5gKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQWRkIGdhdGUgcmVzdWx0c1xuICAgICAgICAgICAgaWYgKHByZXZpb3VzQ3ljbGUuZ2F0ZVJlc3VsdHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGNvbnRleHRQYXJ0cy5wdXNoKFwiXFxuIyMgR2F0ZSBSZXN1bHRzXFxuXFxuXCIpO1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgZ2F0ZSBvZiBwcmV2aW91c0N5Y2xlLmdhdGVSZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0YXR1cyA9IGdhdGUucGFzc2VkID8gXCLinIVcIiA6IFwi4p2MXCI7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHRQYXJ0cy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICAgICAgYC0gJHtzdGF0dXN9ICR7Z2F0ZS5nYXRlfTogJHtnYXRlLm1lc3NhZ2V9XFxuYCxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEFkZCB0b29sIHVzYWdlIHN1bW1hcnkgZnJvbSBwcmV2aW91cyBjeWNsZVxuICAgICAgICAgICAgY29uc3QgYWxsVG9vbHMgPSB0aGlzLmNvbGxlY3RBbGxUb29scyhwcmV2aW91c0N5Y2xlKTtcbiAgICAgICAgICAgIGlmIChhbGxUb29scy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgY29udGV4dFBhcnRzLnB1c2goXCJcXG4jIyBUb29sIFVzYWdlIGluIFByZXZpb3VzIEN5Y2xlXFxuXFxuXCIpO1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdG9vbCBvZiBhbGxUb29scy5zbGljZSgwLCAxMCkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RhdHVzSWNvbiA9IHRvb2wuc3RhdHVzID09PSBcIm9rXCIgPyBcIuKchVwiIDogXCLinYxcIjtcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dFBhcnRzLnB1c2goXG4gICAgICAgICAgICAgICAgICAgICAgICBgJHtzdGF0dXNJY29ufSAke3Rvb2wubmFtZX06ICR7dG9vbC5zdGF0dXN9XFxuYCxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGFsbFRvb2xzLmxlbmd0aCA+IDEwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHRQYXJ0cy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICAgICAgYC4uLiBhbmQgJHthbGxUb29scy5sZW5ndGggLSAxMH0gbW9yZSB0b29sc1xcbmAsXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWRkIGxhc3QgY2hlY2twb2ludCBzdW1tYXJ5XG4gICAgICAgIGNvbnN0IHN0YXRlID0gdGhpcy5mbG93U3RvcmUubG9hZCgpO1xuICAgICAgICBpZiAoc3RhdGU/Lmxhc3RDaGVja3BvaW50KSB7XG4gICAgICAgICAgICBjb250ZXh0UGFydHMucHVzaChcbiAgICAgICAgICAgICAgICBgXFxuIyBMYXN0IENoZWNrcG9pbnRcXG5cXG5DeWNsZSAke3N0YXRlLmxhc3RDaGVja3BvaW50LmN5Y2xlTnVtYmVyfTogJHtzdGF0ZS5sYXN0Q2hlY2twb2ludC5zdW1tYXJ5fVxcbmAsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQXV0by1sb2FkIHJlbGV2YW50IHNwZWNzIGZyb20gc3BlY3MvIGRpcmVjdG9yeVxuICAgICAgICBjb25zdCBzcGVjc0NvbnRleHQgPSBhd2FpdCB0aGlzLmxvYWRSZWxldmFudFNwZWNzKCk7XG4gICAgICAgIGlmIChzcGVjc0NvbnRleHQpIHtcbiAgICAgICAgICAgIGNvbnRleHRQYXJ0cy5wdXNoKHNwZWNzQ29udGV4dCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBZGQgZ2l0IHN0YXR1cyBpZiBhdmFpbGFibGVcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGdpdFN0YXR1cyA9IGF3YWl0IHRoaXMuZ2V0R2l0U3RhdHVzKCk7XG4gICAgICAgICAgICBpZiAoZ2l0U3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgY29udGV4dFBhcnRzLnB1c2goYFxcbiMgR2l0IFN0YXR1c1xcblxcbiR7Z2l0U3RhdHVzfVxcbmApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIC8vIEdpdCBzdGF0dXMgbm90IGF2YWlsYWJsZSwgc2tpcFxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWRkIGNvbXBsZXRpb24gY3JpdGVyaWEgcmVtaW5kZXJcbiAgICAgICAgY29udGV4dFBhcnRzLnB1c2goXG4gICAgICAgICAgICBgXFxuIyBDb21wbGV0aW9uIENyaXRlcmlhXFxuXFxuTG9vcCBleGl0cyB3aGVuIHlvdSBvdXRwdXQgZXhhY3RseTogJHt0aGlzLmNvbmZpZy5jb21wbGV0aW9uUHJvbWlzZSB8fCBcIihub25lIC0gd2lsbCBydW4gYWxsIGN5Y2xlcylcIn1cXG5gLFxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiBjb250ZXh0UGFydHMuam9pbihcIlxcblwiKTtcbiAgICB9XG5cbiAgICAvKiogQ29sbGVjdCBhbGwgdG9vbCBpbnZvY2F0aW9ucyBmcm9tIGEgY3ljbGUgc3RhdGUgKi9cbiAgICBwcml2YXRlIGNvbGxlY3RBbGxUb29scyhjeWNsZTogQ3ljbGVTdGF0ZSk6IFRvb2xJbnZvY2F0aW9uW10ge1xuICAgICAgICBjb25zdCB0b29sczogVG9vbEludm9jYXRpb25bXSA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IHBoYXNlIG9mIE9iamVjdC52YWx1ZXMoY3ljbGUucGhhc2VzKSkge1xuICAgICAgICAgICAgaWYgKHBoYXNlPy50b29scykge1xuICAgICAgICAgICAgICAgIHRvb2xzLnB1c2goLi4ucGhhc2UudG9vbHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0b29scztcbiAgICB9XG5cbiAgICAvKiogTG9hZCByZWxldmFudCBzcGVjcyBmcm9tIHNwZWNzLyBkaXJlY3RvcnkgbWF0Y2hpbmcgdGhlIHByb21wdCAqL1xuICAgIHByaXZhdGUgYXN5bmMgbG9hZFJlbGV2YW50U3BlY3MoKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XG4gICAgICAgIGNvbnN0IHNwZWNzRGlyID0gam9pbihwcm9jZXNzLmN3ZCgpLCBcInNwZWNzXCIpO1xuICAgICAgICBsZXQgc3BlY3M6IHN0cmluZ1tdO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgc3BlY3MgPSBhd2FpdCByZWFkZGlyKHNwZWNzRGlyKTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAvLyBObyBzcGVjcyBkaXJlY3RvcnksIHNraXBcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcHJvbXB0TG93ZXIgPSB0aGlzLmNvbmZpZy5wcm9tcHQudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgY29uc3QgcHJvbXB0VG9rZW5zID0gbmV3IFNldChcbiAgICAgICAgICAgIHByb21wdExvd2VyLnNwbGl0KC9cXFcrLykuZmlsdGVyKCh0KSA9PiB0Lmxlbmd0aCA+IDIpLFxuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IG1hdGNoZXM6IHsgZGlyOiBzdHJpbmc7IHNjb3JlOiBudW1iZXI7IHRpdGxlPzogc3RyaW5nIH1bXSA9IFtdO1xuXG4gICAgICAgIGZvciAoY29uc3Qgc3BlY0RpciBvZiBzcGVjcykge1xuICAgICAgICAgICAgLy8gU2tpcCBzcGVjaWFsIGRpcmVjdG9yaWVzXG4gICAgICAgICAgICBpZiAoc3BlY0Rpci5zdGFydHNXaXRoKFwiLlwiKSkgY29udGludWU7XG5cbiAgICAgICAgICAgIGNvbnN0IHNwZWNQYXRoID0gam9pbihzcGVjc0Rpciwgc3BlY0RpciwgXCJzcGVjLm1kXCIpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCBzcGVjQ29udGVudCA9IGF3YWl0IHJlYWRGaWxlKHNwZWNQYXRoLCBcInV0Zi04XCIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHNwZWNDb250ZW50TG93ZXIgPSBzcGVjQ29udGVudC50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICAgICAgICAgICAgLy8gRXh0cmFjdCB0aXRsZSBmcm9tIHNwZWNcbiAgICAgICAgICAgICAgICBjb25zdCB0aXRsZU1hdGNoID0gc3BlY0NvbnRlbnQubWF0Y2goL14jICguKykkL20pO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRpdGxlID0gdGl0bGVNYXRjaD8uWzFdO1xuXG4gICAgICAgICAgICAgICAgLy8gQ2FsY3VsYXRlIHNpbXBsZSB0b2tlbiBvdmVybGFwIHNjb3JlXG4gICAgICAgICAgICAgICAgbGV0IHNjb3JlID0gMDtcbiAgICAgICAgICAgICAgICBjb25zdCBzcGVjVG9rZW5zID0gbmV3IFNldChcbiAgICAgICAgICAgICAgICAgICAgc3BlY0NvbnRlbnRMb3dlci5zcGxpdCgvXFxXKy8pLmZpbHRlcigodCkgPT4gdC5sZW5ndGggPiAyKSxcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCB0b2tlbiBvZiBwcm9tcHRUb2tlbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNwZWNUb2tlbnMuaGFzKHRva2VuKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcmUrKztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIEJvbnVzIGZvciBkaXJlY3RvcnkgbmFtZSBtYXRjaFxuICAgICAgICAgICAgICAgIGNvbnN0IGRpckxvd2VyID0gc3BlY0Rpci50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgcHJvbXB0TG93ZXIuaW5jbHVkZXMoZGlyTG93ZXIpIHx8XG4gICAgICAgICAgICAgICAgICAgIGRpckxvd2VyLmluY2x1ZGVzKFwiZmxlZXR0b29sc1wiKVxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICBzY29yZSArPSA1O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChzY29yZSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgbWF0Y2hlcy5wdXNoKHsgZGlyOiBzcGVjRGlyLCBzY29yZSwgdGl0bGUgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgICAgLy8gTm8gc3BlYy5tZCBpbiB0aGlzIGRpcmVjdG9yeSwgc2tpcFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gU29ydCBieSBzY29yZSBhbmQgdGFrZSB0b3AgMlxuICAgICAgICBtYXRjaGVzLnNvcnQoKGEsIGIpID0+IGIuc2NvcmUgLSBhLnNjb3JlKTtcbiAgICAgICAgY29uc3QgdG9wTWF0Y2hlcyA9IG1hdGNoZXMuc2xpY2UoMCwgMik7XG5cbiAgICAgICAgaWYgKHRvcE1hdGNoZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IFtcIlxcbiMgUmVsZXZhbnQgU3BlY2lmaWNhdGlvbnNcXG5cIl07XG5cbiAgICAgICAgZm9yIChjb25zdCBtYXRjaCBvZiB0b3BNYXRjaGVzKSB7XG4gICAgICAgICAgICBjb25zdCBzcGVjUGF0aCA9IGpvaW4oc3BlY3NEaXIsIG1hdGNoLmRpciwgXCJzcGVjLm1kXCIpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCBzcGVjQ29udGVudCA9IGF3YWl0IHJlYWRGaWxlKHNwZWNQYXRoLCBcInV0Zi04XCIpO1xuXG4gICAgICAgICAgICAgICAgLy8gSW5jbHVkZSBvdmVydmlldyBhbmQgYWNjZXB0YW5jZSBjcml0ZXJpYSBzZWN0aW9uc1xuICAgICAgICAgICAgICAgIGNvbnN0IG92ZXJ2aWV3TWF0Y2ggPSBzcGVjQ29udGVudC5tYXRjaChcbiAgICAgICAgICAgICAgICAgICAgL14oIyAuKz8pKD86XFxuXFxuIyMgT3ZlcnZpZXdcXG5cXG4pKFtcXHNcXFNdKj8pKD89XFxuXFxuIyMgfFxcblxcbiMjIyApL20sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBjb25zdCB1c2VyU3Rvcmllc01hdGNoID0gc3BlY0NvbnRlbnQubWF0Y2goXG4gICAgICAgICAgICAgICAgICAgIC9eKCMjIFVzZXIgU3Rvcmllc1xcblxcbikoW1xcc1xcU10qPykoPz1cXG5cXG4jIyB8XFxuXFxuIyMjICkvbSxcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goYFxcbiMjICR7bWF0Y2gudGl0bGUgfHwgbWF0Y2guZGlyfVxcbmApO1xuXG4gICAgICAgICAgICAgICAgaWYgKG92ZXJ2aWV3TWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2gob3ZlcnZpZXdNYXRjaFsyXS50cmltKCkpO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaChcIlxcblwiKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAodXNlclN0b3JpZXNNYXRjaCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBJbmNsdWRlIGZpcnN0IDMgdXNlciBzdG9yaWVzXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0b3JpZXMgPSB1c2VyU3Rvcmllc01hdGNoWzJdXG4gICAgICAgICAgICAgICAgICAgICAgICAuc3BsaXQoL1xcbiMjIyAvKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnNsaWNlKDAsIDMpO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaChcIlxcbiMjIyBLZXkgVXNlciBTdG9yaWVzXFxuXCIpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHN0b3J5IG9mIHN0b3JpZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdG9yeS50cmltKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaChgXFxuIyMjICR7c3RvcnkudHJpbSgpfVxcbmApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbG9nLmRlYnVnKFwiTG9hZGVkIHNwZWMgZm9yIGNvbnRleHRcIiwge1xuICAgICAgICAgICAgICAgICAgICBzcGVjOiBtYXRjaC5kaXIsXG4gICAgICAgICAgICAgICAgICAgIHNjb3JlOiBtYXRjaC5zY29yZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICAgIGxvZy53YXJuKFwiRmFpbGVkIHRvIHJlYWQgc3BlY1wiLCB7IHNwZWM6IG1hdGNoLmRpciB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQuam9pbihcIlxcblwiKTtcbiAgICB9XG5cbiAgICAvKiogR2V0IGdpdCBzdGF0dXMgZm9yIGNvbnRleHQgKi9cbiAgICBwcml2YXRlIGFzeW5jIGdldEdpdFN0YXR1cygpOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHsgZXhlY1N5bmMgfSA9IGF3YWl0IGltcG9ydChcIm5vZGU6Y2hpbGRfcHJvY2Vzc1wiKTtcbiAgICAgICAgICAgIGNvbnN0IGRpZmYgPSBleGVjU3luYyhcImdpdCBkaWZmIC0tc3RhdFwiLCB7XG4gICAgICAgICAgICAgICAgZW5jb2Rpbmc6IFwidXRmLThcIixcbiAgICAgICAgICAgICAgICBjd2Q6IHByb2Nlc3MuY3dkKCksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnN0IHN0YXR1cyA9IGV4ZWNTeW5jKFwiZ2l0IHN0YXR1cyAtLXNob3J0XCIsIHtcbiAgICAgICAgICAgICAgICBlbmNvZGluZzogXCJ1dGYtOFwiLFxuICAgICAgICAgICAgICAgIGN3ZDogcHJvY2Vzcy5jd2QoKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGBcXGBcXGBcXGBcXG4ke2RpZmZ9XFxuJHtzdGF0dXN9XFxuXFxgXFxgXFxgYDtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBFeGVjdXRlIGEgc2luZ2xlIGN5Y2xlIHdpdGggZnJlc2ggc2Vzc2lvbiAqL1xuICAgIHByaXZhdGUgYXN5bmMgZXhlY3V0ZUN5Y2xlKFxuICAgICAgICBjeWNsZU51bWJlcjogbnVtYmVyLFxuICAgICAgICBjbGllbnQ6IE9wZW5Db2RlQ2xpZW50LFxuICAgICAgICBjb250ZXh0OiBzdHJpbmcsXG4gICAgKTogUHJvbWlzZTx7XG4gICAgICAgIHN1Y2Nlc3M6IGJvb2xlYW47XG4gICAgICAgIGN5Y2xlU3RhdGU6IEN5Y2xlU3RhdGU7XG4gICAgICAgIHN1bW1hcnk6IHN0cmluZztcbiAgICAgICAgc3RvcFJlYXNvbj86IFN0b3BSZWFzb247XG4gICAgfT4ge1xuICAgICAgICBjb25zdCBzdGFydFRpbWUgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIGNvbnN0IGN5Y2xlU3RhdGU6IEN5Y2xlU3RhdGUgPSB7XG4gICAgICAgICAgICBjeWNsZU51bWJlcixcbiAgICAgICAgICAgIHN0YXR1czogXCJydW5uaW5nXCIsXG4gICAgICAgICAgICBzdGFydFRpbWUsXG4gICAgICAgICAgICBwaGFzZXM6IHt9LFxuICAgICAgICAgICAgZ2F0ZVJlc3VsdHM6IFtdLFxuICAgICAgICAgICAgY29tcGxldGlvblByb21pc2VPYnNlcnZlZDogZmFsc2UsXG4gICAgICAgIH07XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIENyZWF0ZSBzZXNzaW9uIHdpdGggY29udGV4dCBhcyBpbml0aWFsIHByb21wdCAod2lsbCBiZSBjb21iaW5lZCB3aXRoIGZpcnN0IG1lc3NhZ2UpXG4gICAgICAgICAgICBjb25zdCBzZXNzaW9uID0gYXdhaXQgY2xpZW50LmNyZWF0ZVNlc3Npb24oY29udGV4dCk7XG5cbiAgICAgICAgICAgIC8vIEV4ZWN1dGUgd29ya2Zsb3cgcGhhc2VzXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHBoYXNlIG9mIFtcbiAgICAgICAgICAgICAgICBQaGFzZS5SRVNFQVJDSCxcbiAgICAgICAgICAgICAgICBQaGFzZS5TUEVDSUZZLFxuICAgICAgICAgICAgICAgIFBoYXNlLlBMQU4sXG4gICAgICAgICAgICAgICAgUGhhc2UuV09SSyxcbiAgICAgICAgICAgICAgICBQaGFzZS5SRVZJRVcsXG4gICAgICAgICAgICBdKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGhhc2VSZXN1bHQgPSBhd2FpdCB0aGlzLmV4ZWN1dGVQaGFzZShcbiAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbixcbiAgICAgICAgICAgICAgICAgICAgcGhhc2UsXG4gICAgICAgICAgICAgICAgICAgIGN5Y2xlTnVtYmVyLFxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICBpZiAocGhhc2VSZXN1bHQuZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgY3ljbGVTdGF0ZS5waGFzZXNbcGhhc2VdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGhhc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9tcHQ6IHBoYXNlUmVzdWx0LnByb21wdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlOiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3VtbWFyeTogYEVycm9yOiAke3BoYXNlUmVzdWx0LmVycm9yfWAsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgYCR7cGhhc2V9IHBoYXNlIGZhaWxlZDogJHtwaGFzZVJlc3VsdC5lcnJvcn1gLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGN5Y2xlU3RhdGUucGhhc2VzW3BoYXNlXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgcGhhc2UsXG4gICAgICAgICAgICAgICAgICAgIHByb21wdDogcGhhc2VSZXN1bHQucHJvbXB0LFxuICAgICAgICAgICAgICAgICAgICByZXNwb25zZTogcGhhc2VSZXN1bHQucmVzcG9uc2UsXG4gICAgICAgICAgICAgICAgICAgIHN1bW1hcnk6IHBoYXNlUmVzdWx0LnN1bW1hcnksXG4gICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgICAgICAgICB0b29sczogcGhhc2VSZXN1bHQudG9vbHMsXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIC8vIENoZWNrIGZvciBjb21wbGV0aW9uIHByb21pc2UgZHVyaW5nIHBoYXNlIGV4ZWN1dGlvblxuICAgICAgICAgICAgICAgIC8vIE9ubHkgY2hlY2sgaW4gc2hpcCBtb2RlICh3aGVuIGNvbXBsZXRpb25Qcm9taXNlIGlzIHNldClcbiAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmNvbXBsZXRpb25Qcm9taXNlICYmXG4gICAgICAgICAgICAgICAgICAgIHBoYXNlUmVzdWx0LnJlc3BvbnNlLmluY2x1ZGVzKHRoaXMuY29uZmlnLmNvbXBsZXRpb25Qcm9taXNlKVxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICBjeWNsZVN0YXRlLmNvbXBsZXRpb25Qcm9taXNlT2JzZXJ2ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIFVJLnByaW50bG4oXG4gICAgICAgICAgICAgICAgICAgIGAke1VJLlN0eWxlLlRFWFRfRElNfSAg4oaSICR7cGhhc2V9OiBkb25lJHtVSS5TdHlsZS5URVhUX05PUk1BTH1gLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFJ1biBxdWFsaXR5IGdhdGVzXG4gICAgICAgICAgICBVSS5wcmludGxuKFxuICAgICAgICAgICAgICAgIGAke1VJLlN0eWxlLlRFWFRfRElNfVJ1bm5pbmcgcXVhbGl0eSBnYXRlcy4uLiR7VUkuU3R5bGUuVEVYVF9OT1JNQUx9YCxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBjb25zdCBnYXRlUmVzdWx0cyA9IGF3YWl0IHRoaXMucnVuUXVhbGl0eUdhdGVzKFxuICAgICAgICAgICAgICAgIGN5Y2xlTnVtYmVyLFxuICAgICAgICAgICAgICAgIGN5Y2xlU3RhdGUsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgY3ljbGVTdGF0ZS5nYXRlUmVzdWx0cyA9IGdhdGVSZXN1bHRzO1xuXG4gICAgICAgICAgICAvLyBDaGVjayBpZiBhbnkgcmVxdWlyZWQgZ2F0ZSBmYWlsZWRcbiAgICAgICAgICAgIGNvbnN0IHJlcXVpcmVkRmFpbGVkID0gZ2F0ZVJlc3VsdHMuZmluZChcbiAgICAgICAgICAgICAgICAoZykgPT4gIWcucGFzc2VkICYmIHRoaXMuY29uZmlnLmdhdGVzLmluY2x1ZGVzKGcuZ2F0ZSksXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBsZXQgZmFpbGVkUGhhc2VJbmZvID0gXCJcIjtcbiAgICAgICAgICAgIGlmIChyZXF1aXJlZEZhaWxlZCkge1xuICAgICAgICAgICAgICAgIC8vIEZpbmQgd2hpY2ggcGhhc2UgaGFkIHRoZSBtb3N0IHJlY2VudCBmYWlsdXJlXG4gICAgICAgICAgICAgICAgY29uc3QgcGhhc2VzV2l0aEdhdGVzID0gT2JqZWN0LmVudHJpZXMoY3ljbGVTdGF0ZS5waGFzZXMpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGxhc3RQaGFzZSA9XG4gICAgICAgICAgICAgICAgICAgIHBoYXNlc1dpdGhHYXRlc1twaGFzZXNXaXRoR2F0ZXMubGVuZ3RoIC0gMV0/LlswXSA/P1xuICAgICAgICAgICAgICAgICAgICBcInVua25vd25cIjtcbiAgICAgICAgICAgICAgICBmYWlsZWRQaGFzZUluZm8gPSBgJHtsYXN0UGhhc2V9IGdhdGUgZmFpbGVkYDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY3ljbGVTdGF0ZS5zdGF0dXMgPSBcImNvbXBsZXRlZFwiO1xuICAgICAgICAgICAgY3ljbGVTdGF0ZS5lbmRUaW1lID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgICAgICAgY3ljbGVTdGF0ZS5kdXJhdGlvbk1zID0gRGF0ZS5ub3coKSAtIG5ldyBEYXRlKHN0YXJ0VGltZSkuZ2V0VGltZSgpO1xuXG4gICAgICAgICAgICAvLyBHZW5lcmF0ZSBzdW1tYXJ5XG4gICAgICAgICAgICBjb25zdCBzdW1tYXJ5ID0gdGhpcy5nZW5lcmF0ZUN5Y2xlU3VtbWFyeShjeWNsZVN0YXRlKTtcblxuICAgICAgICAgICAgLy8gQ2hlY2sgc3RvcCBjb25kaXRpb25zXG4gICAgICAgICAgICAvLyBPbmx5IGNoZWNrIGNvbXBsZXRpb24gcHJvbWlzZSBpbiBzaGlwIG1vZGUgKHdoZW4gY29tcGxldGlvblByb21pc2UgaXMgc2V0KVxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmNvbXBsZXRpb25Qcm9taXNlICYmXG4gICAgICAgICAgICAgICAgY3ljbGVTdGF0ZS5jb21wbGV0aW9uUHJvbWlzZU9ic2VydmVkXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBjeWNsZVN0YXRlLFxuICAgICAgICAgICAgICAgICAgICBzdW1tYXJ5LFxuICAgICAgICAgICAgICAgICAgICBzdG9wUmVhc29uOiBTdG9wUmVhc29uLkNPTVBMRVRJT05fUFJPTUlTRSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocmVxdWlyZWRGYWlsZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgY3ljbGVTdGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgc3VtbWFyeTogYCR7ZmFpbGVkUGhhc2VJbmZvfTogJHtyZXF1aXJlZEZhaWxlZC5tZXNzYWdlfWAsXG4gICAgICAgICAgICAgICAgICAgIHN0b3BSZWFzb246IFN0b3BSZWFzb24uR0FURV9GQUlMVVJFLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIENhbGN1bGF0ZSBvdXRwdXQgaGFzaCBmb3Igc3R1Y2sgZGV0ZWN0aW9uXG4gICAgICAgICAgICBjeWNsZVN0YXRlLm91dHB1dEhhc2ggPSB0aGlzLmhhc2hPdXRwdXQoXG4gICAgICAgICAgICAgICAgT2JqZWN0LnZhbHVlcyhjeWNsZVN0YXRlLnBoYXNlcylcbiAgICAgICAgICAgICAgICAgICAgLm1hcCgocCkgPT4gcD8ucmVzcG9uc2UgPz8gXCJcIilcbiAgICAgICAgICAgICAgICAgICAgLmpvaW4oXCJ8XCIpLFxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgY3ljbGVTdGF0ZSwgc3VtbWFyeSB9O1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNc2cgPVxuICAgICAgICAgICAgICAgIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcblxuICAgICAgICAgICAgY3ljbGVTdGF0ZS5zdGF0dXMgPSBcImZhaWxlZFwiO1xuICAgICAgICAgICAgY3ljbGVTdGF0ZS5lbmRUaW1lID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgICAgICAgY3ljbGVTdGF0ZS5kdXJhdGlvbk1zID0gRGF0ZS5ub3coKSAtIG5ldyBEYXRlKHN0YXJ0VGltZSkuZ2V0VGltZSgpO1xuICAgICAgICAgICAgY3ljbGVTdGF0ZS5lcnJvciA9IGVycm9yTXNnO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGN5Y2xlU3RhdGUsXG4gICAgICAgICAgICAgICAgc3VtbWFyeTogYEN5Y2xlIGZhaWxlZDogJHtlcnJvck1zZ31gLFxuICAgICAgICAgICAgICAgIHN0b3BSZWFzb246IFN0b3BSZWFzb24uRVJST1IsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIEV4ZWN1dGUgYSBzaW5nbGUgcGhhc2UgKi9cbiAgICBwcml2YXRlIGFzeW5jIGV4ZWN1dGVQaGFzZShcbiAgICAgICAgc2Vzc2lvbjogU2Vzc2lvbixcbiAgICAgICAgcGhhc2U6IFBoYXNlLFxuICAgICAgICBjeWNsZU51bWJlcjogbnVtYmVyLFxuICAgICk6IFByb21pc2U8e1xuICAgICAgICBwcm9tcHQ6IHN0cmluZztcbiAgICAgICAgcmVzcG9uc2U6IHN0cmluZztcbiAgICAgICAgc3VtbWFyeTogc3RyaW5nO1xuICAgICAgICB0b29sczogVG9vbEludm9jYXRpb25bXTtcbiAgICAgICAgZXJyb3I/OiBzdHJpbmc7XG4gICAgfT4ge1xuICAgICAgICBjb25zdCBwaGFzZVByb21wdHM6IFJlY29yZDxQaGFzZSwgc3RyaW5nPiA9IHtcbiAgICAgICAgICAgIFtQaGFzZS5SRVNFQVJDSF06IGAjIyBQaGFzZSAxOiBSZXNlYXJjaFxuXG5SZXNlYXJjaCB0aGUgY29kZWJhc2UgdG8gdW5kZXJzdGFuZCB0aGUgY3VycmVudCBzdGF0ZS4gRm9jdXMgb246XG4tIEZpbGUgc3RydWN0dXJlIGFuZCBrZXkgbW9kdWxlc1xuLSBFeGlzdGluZyBwYXR0ZXJucyBhbmQgY29udmVudGlvbnNcbi0gRGVwZW5kZW5jaWVzIGFuZCBjb25maWd1cmF0aW9uc1xuLSBBbnkgcmVsZXZhbnQgZG9jdW1lbnRhdGlvblxuXG5Qcm92aWRlIGEgY29uY2lzZSBzdW1tYXJ5IG9mIHlvdXIgZmluZGluZ3MuYCxcblxuICAgICAgICAgICAgW1BoYXNlLlNQRUNJRlldOiBgIyMgUGhhc2UgMjogU3BlY2lmeVxuXG5CYXNlZCBvbiB0aGUgcmVzZWFyY2gsIGNyZWF0ZSBhIGRldGFpbGVkIHNwZWNpZmljYXRpb24gZm9yIHRoZSB0YXNrOlxuLSBSZXF1aXJlbWVudHMgYW5kIGFjY2VwdGFuY2UgY3JpdGVyaWFcbi0gVGVjaG5pY2FsIGFwcHJvYWNoXG4tIFBvdGVudGlhbCBjaGFsbGVuZ2VzIGFuZCBtaXRpZ2F0aW9uIHN0cmF0ZWdpZXNcbi0gRGVwZW5kZW5jaWVzIG9uIGV4aXN0aW5nIGNvZGVcblxuT3V0cHV0IGEgc3RydWN0dXJlZCBzcGVjaWZpY2F0aW9uLmAsXG5cbiAgICAgICAgICAgIFtQaGFzZS5QTEFOXTogYCMjIFBoYXNlIDM6IFBsYW5cblxuQ3JlYXRlIGFuIGltcGxlbWVudGF0aW9uIHBsYW46XG4tIFN0ZXAtYnktc3RlcCB0YXNrc1xuLSBGaWxlcyB0byBtb2RpZnkvY3JlYXRlXG4tIE9yZGVyIG9mIG9wZXJhdGlvbnNcbi0gVGVzdGluZyBzdHJhdGVneVxuXG5PdXRwdXQgYSBkZXRhaWxlZCBwbGFuLmAsXG5cbiAgICAgICAgICAgIFtQaGFzZS5XT1JLXTogYCMjIFBoYXNlIDQ6IFdvcmtcblxuRXhlY3V0ZSB0aGUgaW1wbGVtZW50YXRpb24gcGxhbi4gTWFrZSBjb25jcmV0ZSBjaGFuZ2VzIHRvIHRoZSBjb2RlYmFzZS5cblxuSU1QT1JUQU5UOiBZb3UgTVVTVDpcbjEuIFVzZSB0b29scyAoUmVhZCwgV3JpdGUsIEVkaXQsIEJhc2gpIHRvIG1ha2UgYWN0dWFsIGZpbGUgY2hhbmdlc1xuMi4gUmVwb3J0IGVhY2ggZmlsZSB5b3UgbW9kaWZ5IGFzIHlvdSBnbyAoZS5nLiwgXCJDcmVhdGluZyBmaWxlIFguLi5cIiwgXCJNb2RpZnlpbmcgWS4uLlwiKVxuMy4gUnVuIGFjdHVhbCB0ZXN0cyBhbmQgcmVwb3J0IHJlc3VsdHNcbjQuIEVuc3VyZSB0aGUgZmluYWwgc3VtbWFyeSBsaXN0czpcbiAgIC0gQWxsIGZpbGVzIGNyZWF0ZWQvbW9kaWZpZWQgKHdpdGggcGF0aHMpIE9SIGV4cGxpY2l0bHkgXCJOTyBDSEFOR0VTOiA8cmVhc29uPlwiIGlmIG5vIGZpbGVzIG5lZWRlZFxuICAgLSBBbGwgdGVzdCByZXN1bHRzIChwYXNzL2ZhaWwpXG4gICAtIEFueSBlcnJvcnMgZW5jb3VudGVyZWQgYW5kIGhvdyB0aGV5IHdlcmUgcmVzb2x2ZWRcblxuSWYgbm8gY2hhbmdlcyBhcmUgbmVlZGVkLCBleHBsaWNpdGx5IHN0YXRlIFwiTk8gQ0hBTkdFUzogPHJlYXNvbj5cIiBhbmQgd2h5LlxuXG5Qcm92aWRlIGEgY29tcHJlaGVuc2l2ZSBzdW1tYXJ5IG9mIGNvbmNyZXRlIHdvcmsgY29tcGxldGVkLmAsXG5cbiAgICAgICAgICAgIFtQaGFzZS5SRVZJRVddOiBgIyMgUGhhc2UgNTogUmV2aWV3XG5cblJldmlldyB0aGUgY29tcGxldGVkIHdvcms6XG4tIFZlcmlmeSBhbGwgYWNjZXB0YW5jZSBjcml0ZXJpYSBhcmUgbWV0XG4tIENoZWNrIGNvZGUgcXVhbGl0eSBhbmQgY29uc2lzdGVuY3lcbi0gRW5zdXJlIHRlc3RzIHBhc3Ncbi0gSWRlbnRpZnkgYW55IHJlbWFpbmluZyBpc3N1ZXNcblxuT3V0cHV0OiA8cHJvbWlzZT5TSElQPC9wcm9taXNlPiBpZiBhbGwgY3JpdGVyaWEgYXJlIG1ldCwgb3IgbGlzdCByZW1haW5pbmcgaXNzdWVzLmAsXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgcHJvbXB0ID0gcGhhc2VQcm9tcHRzW3BoYXNlXTtcblxuICAgICAgICAvLyBVc2Ugc3RyZWFtaW5nIGZvciByZWFsLXRpbWUgZmVlZGJhY2tcbiAgICAgICAgY29uc3Qgc3RyZWFtaW5nUmVzcG9uc2UgPSBhd2FpdCBzZXNzaW9uLnNlbmRNZXNzYWdlU3RyZWFtKHByb21wdCk7XG5cbiAgICAgICAgbGV0IGZ1bGxSZXNwb25zZSA9IFwiXCI7XG4gICAgICAgIGNvbnN0IHRvb2xzOiBUb29sSW52b2NhdGlvbltdID0gW107XG5cbiAgICAgICAgVUkucHJpbnRsbihgJHtVSS5TdHlsZS5URVhUX0RJTX0gIFske3BoYXNlfV0ke1VJLlN0eWxlLlRFWFRfTk9STUFMfWApO1xuXG4gICAgICAgIGNvbnN0IHJlYWRlciA9IHN0cmVhbWluZ1Jlc3BvbnNlLnN0cmVhbS5nZXRSZWFkZXIoKTtcbiAgICAgICAgY29uc3QgZGVjb2RlciA9IG5ldyBUZXh0RGVjb2RlcigpO1xuXG4gICAgICAgIC8vIFJ1bm5lci1zaWRlIHdhdGNoZG9nOiBwcmV2ZW50IGluZGVmaW5pdGUgaGFuZ3NcbiAgICAgICAgY29uc3QgcGhhc2VUaW1lb3V0TXMgPVxuICAgICAgICAgICAgKHRoaXMuY29uZmlnLnBoYXNlVGltZW91dE1zID8/XG4gICAgICAgICAgICAgICAgKHRoaXMuY29uZmlnLnByb21wdFRpbWVvdXQgPz8gMzAwMDAwKSAqIDUpIHx8XG4gICAgICAgICAgICA5MDAwMDA7XG4gICAgICAgIGxldCBwaGFzZVRpbWVkT3V0ID0gZmFsc2U7XG5cbiAgICAgICAgY29uc3Qgd2F0Y2hkb2dUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgcGhhc2VUaW1lZE91dCA9IHRydWU7XG4gICAgICAgICAgICBsb2cud2FybihcIlBoYXNlIHdhdGNoZG9nIHRyaWdnZXJlZFwiLCB7XG4gICAgICAgICAgICAgICAgY3ljbGVOdW1iZXIsXG4gICAgICAgICAgICAgICAgcGhhc2UsXG4gICAgICAgICAgICAgICAgdGltZW91dE1zOiBwaGFzZVRpbWVvdXRNcyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmVhZGVyLmNhbmNlbChgUGhhc2UgdGltZW91dCBhZnRlciAke3BoYXNlVGltZW91dE1zfW1zYCk7XG4gICAgICAgIH0sIHBoYXNlVGltZW91dE1zKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB7IGRvbmUsIHZhbHVlIH0gPSBhd2FpdCByZWFkZXIucmVhZCgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHBoYXNlVGltZWRPdXQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgYFBoYXNlICR7cGhhc2V9IHRpbWVkIG91dCBhZnRlciAke3BoYXNlVGltZW91dE1zfW1zICh3YXRjaGRvZylgLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChkb25lKSBicmVhaztcblxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB0ZXh0ID0gZGVjb2Rlci5kZWNvZGUodmFsdWUsIHsgc3RyZWFtOiB0cnVlIH0pO1xuICAgICAgICAgICAgICAgICAgICBmdWxsUmVzcG9uc2UgKz0gdGV4dDtcbiAgICAgICAgICAgICAgICAgICAgVUkucHJpbnQodGV4dCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIHBoYXNlVGltZWRPdXQgfHxcbiAgICAgICAgICAgICAgICAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvciAmJiBlcnJvci5tZXNzYWdlLmluY2x1ZGVzKFwidGltZW91dFwiKSlcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGlzY29yZFdlYmhvb2s/Lm5vdGlmeVRpbWVvdXQoXG4gICAgICAgICAgICAgICAgICAgIGN5Y2xlTnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICBwaGFzZSxcbiAgICAgICAgICAgICAgICAgICAgcGhhc2VUaW1lb3V0TXMsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgIGBQaGFzZSAke3BoYXNlfSB0aW1lZCBvdXQgYWZ0ZXIgJHtwaGFzZVRpbWVvdXRNc31tcyAtIE9wZW5Db2RlIHN0cmVhbSBkaWQgbm90IGNvbXBsZXRlYCxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQod2F0Y2hkb2dUaW1lcik7XG4gICAgICAgICAgICByZWFkZXIucmVsZWFzZUxvY2soKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGF3YWl0IHN0cmVhbWluZ1Jlc3BvbnNlLmNvbXBsZXRlO1xuXG4gICAgICAgIC8vIENvbGxlY3QgdG9vbCBpbnZvY2F0aW9ucyBmcm9tIHNlc3Npb24gaWYgYXZhaWxhYmxlXG4gICAgICAgIC8vIE5vdGU6IFRoaXMgaXMgYSBwbGFjZWhvbGRlciAtIHRoZSBhY3R1YWwgdG9vbCBjYXB0dXJlIHdvdWxkIGNvbWUgZnJvbVxuICAgICAgICAvLyBzZXNzaW9uIGV2ZW50cyBpbiBhIG1vcmUgY29tcGxldGUgaW1wbGVtZW50YXRpb25cbiAgICAgICAgY29uc3Qgc2Vzc2lvblRvb2xzID0gKFxuICAgICAgICAgICAgc2Vzc2lvbiBhcyB7IF90b29sSW52b2NhdGlvbnM/OiBUb29sSW52b2NhdGlvbltdIH1cbiAgICAgICAgKS5fdG9vbEludm9jYXRpb25zO1xuICAgICAgICBpZiAoc2Vzc2lvblRvb2xzICYmIHNlc3Npb25Ub29scy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0b29scy5wdXNoKC4uLnNlc3Npb25Ub29scyk7XG5cbiAgICAgICAgICAgIC8vIERlYnVnIG91dHB1dCBmb3IgdG9vbHNcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZy5kZWJ1Z1dvcmspIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHRvb2wgb2Ygc2Vzc2lvblRvb2xzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlZGFjdGVkSW5wdXQgPSB0b29sLmlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgICA/IHJlZGFjdFNlY3JldHMoSlNPTi5zdHJpbmdpZnkodG9vbC5pbnB1dCkpXG4gICAgICAgICAgICAgICAgICAgICAgICA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVkYWN0ZWRPdXRwdXQgPSB0b29sLm91dHB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgPyB0cnVuY2F0ZU91dHB1dChyZWRhY3RTZWNyZXRzKHRvb2wub3V0cHV0KSlcbiAgICAgICAgICAgICAgICAgICAgICAgIDogdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICAgICAgICAgIFVJLnByaW50bG4oXG4gICAgICAgICAgICAgICAgICAgICAgICBgJHtVSS5TdHlsZS5URVhUX0RJTX0gIFtUT09MXSAke3Rvb2wubmFtZX06ICR7dG9vbC5zdGF0dXN9JHtVSS5TdHlsZS5URVhUX05PUk1BTH1gLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICBsb2cuZGVidWcoXCJUb29sIGludm9jYXRpb25cIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGhhc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b29sOiB0b29sLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IHRvb2wuc3RhdHVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQ6IHJlZGFjdGVkSW5wdXQsXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQ6IHJlZGFjdGVkT3V0cHV0LFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBHZW5lcmF0ZSBzdW1tYXJ5IGZyb20gcmVzcG9uc2VcbiAgICAgICAgY29uc3Qgc3VtbWFyeSA9IHRoaXMuZ2VuZXJhdGVQaGFzZVN1bW1hcnkoZnVsbFJlc3BvbnNlKTtcblxuICAgICAgICAvLyBOb3RpZnkgRGlzY29yZDogcGhhc2UgY29tcGxldGVkXG4gICAgICAgIHRoaXMuZGlzY29yZFdlYmhvb2s/Lm5vdGlmeVBoYXNlQ29tcGxldGUoY3ljbGVOdW1iZXIsIHBoYXNlLCBzdW1tYXJ5KTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcHJvbXB0LFxuICAgICAgICAgICAgcmVzcG9uc2U6IGZ1bGxSZXNwb25zZSxcbiAgICAgICAgICAgIHN1bW1hcnksXG4gICAgICAgICAgICB0b29scyxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKiogR2VuZXJhdGUgc3VtbWFyeSBmb3IgYSBwaGFzZSAqL1xuICAgIHByaXZhdGUgZ2VuZXJhdGVQaGFzZVN1bW1hcnkocmVzcG9uc2U6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIC8vIFRha2UgZmlyc3QgMjAwIGNoYXJhY3RlcnMgYXMgc3VtbWFyeVxuICAgICAgICBjb25zdCB0cmltbWVkID0gcmVzcG9uc2UudHJpbSgpO1xuICAgICAgICBpZiAodHJpbW1lZC5sZW5ndGggPD0gMjAwKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJpbW1lZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYCR7dHJpbW1lZC5zdWJzdHJpbmcoMCwgMjAwKX0uLi5gO1xuICAgIH1cblxuICAgIC8qKiBHZW5lcmF0ZSBjeWNsZSBzdW1tYXJ5ICovXG4gICAgcHJpdmF0ZSBnZW5lcmF0ZUN5Y2xlU3VtbWFyeShjeWNsZTogQ3ljbGVTdGF0ZSk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IHBhcnRzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgICAgIGZvciAoY29uc3QgW3BoYXNlLCBvdXRwdXRdIG9mIE9iamVjdC5lbnRyaWVzKGN5Y2xlLnBoYXNlcykpIHtcbiAgICAgICAgICAgIGlmIChvdXRwdXQpIHtcbiAgICAgICAgICAgICAgICBwYXJ0cy5wdXNoKGAke3BoYXNlfTogJHtvdXRwdXQuc3VtbWFyeX1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXJ0cy5qb2luKFwiIHwgXCIpO1xuICAgIH1cblxuICAgIC8qKiBSdW4gcXVhbGl0eSBnYXRlcyAqL1xuICAgIHByaXZhdGUgYXN5bmMgcnVuUXVhbGl0eUdhdGVzKFxuICAgICAgICBjeWNsZU51bWJlcjogbnVtYmVyLFxuICAgICAgICBjeWNsZTogQ3ljbGVTdGF0ZSxcbiAgICApOiBQcm9taXNlPEdhdGVSZXN1bHRbXT4ge1xuICAgICAgICBjb25zdCByZXN1bHRzOiBHYXRlUmVzdWx0W10gPSBbXTtcbiAgICAgICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuXG4gICAgICAgIGZvciAoY29uc3QgZ2F0ZSBvZiB0aGlzLmNvbmZpZy5nYXRlcykge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5ydW5HYXRlKGdhdGUsIGN5Y2xlKTtcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaCh7XG4gICAgICAgICAgICAgICAgZ2F0ZSxcbiAgICAgICAgICAgICAgICBwYXNzZWQ6IHJlc3VsdC5wYXNzZWQsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogcmVzdWx0Lm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZGV0YWlsczogcmVzdWx0LmRldGFpbHMsXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wOiBub3csXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gU2F2ZSBnYXRlIHJlc3VsdHNcbiAgICAgICAgICAgIHRoaXMuZmxvd1N0b3JlLnNhdmVHYXRlUmVzdWx0cyhjeWNsZU51bWJlciwgcmVzdWx0cyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG5cbiAgICAvKiogUnVuIGEgc2luZ2xlIHF1YWxpdHkgZ2F0ZSAqL1xuICAgIHByaXZhdGUgYXN5bmMgcnVuR2F0ZShcbiAgICAgICAgZ2F0ZTogc3RyaW5nLFxuICAgICAgICBjeWNsZTogQ3ljbGVTdGF0ZSxcbiAgICApOiBQcm9taXNlPHtcbiAgICAgICAgcGFzc2VkOiBib29sZWFuO1xuICAgICAgICBtZXNzYWdlOiBzdHJpbmc7XG4gICAgICAgIGRldGFpbHM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICB9PiB7XG4gICAgICAgIGNvbnN0IGdhdGVDb25maWcgPSB0aGlzLmdldEdhdGVDb25maWcoZ2F0ZSk7XG5cbiAgICAgICAgc3dpdGNoIChnYXRlLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgICAgIGNhc2UgXCJ0ZXN0XCI6XG4gICAgICAgICAgICBjYXNlIFwidGVzdHNcIjoge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMucnVuR2F0ZUNvbW1hbmQoXG4gICAgICAgICAgICAgICAgICAgIFwidGVzdFwiLFxuICAgICAgICAgICAgICAgICAgICBnYXRlQ29uZmlnLmNvbW1hbmQsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBwYXNzZWQ6IHJlc3VsdC5wYXNzZWQsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHJlc3VsdC5wYXNzZWRcbiAgICAgICAgICAgICAgICAgICAgICAgID8gXCJBbGwgdGVzdHMgcGFzc2VkXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIDogXCJTb21lIHRlc3RzIGZhaWxlZFwiLFxuICAgICAgICAgICAgICAgICAgICBkZXRhaWxzOiByZXN1bHQuZGV0YWlscyxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBcImxpbnRcIjoge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMucnVuR2F0ZUNvbW1hbmQoXG4gICAgICAgICAgICAgICAgICAgIFwibGludFwiLFxuICAgICAgICAgICAgICAgICAgICBnYXRlQ29uZmlnLmNvbW1hbmQsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBwYXNzZWQ6IHJlc3VsdC5wYXNzZWQsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHJlc3VsdC5wYXNzZWRcbiAgICAgICAgICAgICAgICAgICAgICAgID8gXCJMaW50aW5nIHBhc3NlZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICA6IFwiTGludGluZyBpc3N1ZXMgZm91bmRcIixcbiAgICAgICAgICAgICAgICAgICAgZGV0YWlsczogcmVzdWx0LmRldGFpbHMsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgXCJhY2NlcHRhbmNlXCI6IHtcbiAgICAgICAgICAgICAgICBjb25zdCBwYXNzZWQgPSBhd2FpdCB0aGlzLmNoZWNrQWNjZXB0YW5jZShjeWNsZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgcGFzc2VkLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBwYXNzZWRcbiAgICAgICAgICAgICAgICAgICAgICAgID8gXCJBY2NlcHRhbmNlIGNyaXRlcmlhIG1ldFwiXG4gICAgICAgICAgICAgICAgICAgICAgICA6IFwiQWNjZXB0YW5jZSBjcml0ZXJpYSBub3QgZnVsbHkgbWV0XCIsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgcGFzc2VkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogYFVua25vd24gZ2F0ZTogJHtnYXRlfWAsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgZ2F0ZSBjb25maWd1cmF0aW9uIGZyb20gYmFzZUNvbmZpZyAqL1xuICAgIHByaXZhdGUgZ2V0R2F0ZUNvbmZpZyhnYXRlOiBzdHJpbmcpOiBHYXRlQ29tbWFuZENvbmZpZyB7XG4gICAgICAgIC8vIE5vcm1hbGl6ZSBnYXRlIG5hbWVzOiBjYW5vbmljYWwgaXMgXCJ0ZXN0XCIsIGFjY2VwdCBcInRlc3RzXCIgZm9yIGJhY2t3YXJkIGNvbXBhdFxuICAgICAgICBjb25zdCBub3JtYWxpemVkR2F0ZSA9XG4gICAgICAgICAgICBnYXRlLnRvTG93ZXJDYXNlKCkgPT09IFwidGVzdHNcIiA/IFwidGVzdFwiIDogZ2F0ZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBjb25zdCBnYXRlS2V5ID0gbm9ybWFsaXplZEdhdGUgYXMga2V5b2YgdHlwZW9mIHRoaXMuYmFzZUNvbmZpZy5nYXRlcztcbiAgICAgICAgY29uc3QgY29uZmlnR2F0ZSA9IHRoaXMuYmFzZUNvbmZpZy5nYXRlc1tnYXRlS2V5XTtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgY29uZmlnR2F0ZSAmJlxuICAgICAgICAgICAgdHlwZW9mIGNvbmZpZ0dhdGUgPT09IFwib2JqZWN0XCIgJiZcbiAgICAgICAgICAgIFwiY29tbWFuZFwiIGluIGNvbmZpZ0dhdGVcbiAgICAgICAgKSB7XG4gICAgICAgICAgICByZXR1cm4gY29uZmlnR2F0ZSBhcyBHYXRlQ29tbWFuZENvbmZpZztcbiAgICAgICAgfVxuICAgICAgICAvLyBGYWxsYmFjayBmb3IgbGVnYWN5IHN0cmluZyBmb3JtYXRcbiAgICAgICAgcmV0dXJuIHsgY29tbWFuZDogU3RyaW5nKGNvbmZpZ0dhdGUgPz8gXCJcIikgfTtcbiAgICB9XG5cbiAgICAvKiogUnVuIGEgZ2F0ZSBjb21tYW5kIGFuZCBjYXB0dXJlIHJlc3VsdHMgKi9cbiAgICBwcml2YXRlIGFzeW5jIHJ1bkdhdGVDb21tYW5kKFxuICAgICAgICBnYXRlTmFtZTogc3RyaW5nLFxuICAgICAgICBjb21tYW5kOiBzdHJpbmcsXG4gICAgKTogUHJvbWlzZTx7XG4gICAgICAgIHBhc3NlZDogYm9vbGVhbjtcbiAgICAgICAgZGV0YWlsczoge1xuICAgICAgICAgICAgY29tbWFuZDogc3RyaW5nO1xuICAgICAgICAgICAgZXhpdENvZGU6IG51bWJlciB8IG51bGw7XG4gICAgICAgICAgICBzdGRvdXQ6IHN0cmluZztcbiAgICAgICAgICAgIHN0ZGVycjogc3RyaW5nO1xuICAgICAgICAgICAgZHVyYXRpb25NczogbnVtYmVyO1xuICAgICAgICB9O1xuICAgIH0+IHtcbiAgICAgICAgY29uc3Qgc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgICAgbGV0IGV4aXRDb2RlOiBudW1iZXIgfCBudWxsID0gbnVsbDtcbiAgICAgICAgbGV0IHN0ZG91dCA9IFwiXCI7XG4gICAgICAgIGxldCBzdGRlcnIgPSBcIlwiO1xuXG4gICAgICAgIFVJLmluZm8oYCAgUnVubmluZyAke2dhdGVOYW1lfTogJHtjb21tYW5kfWApO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBSdW4gdGhlIGNvbW1hbmRcbiAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBleGVjU3luYyhjb21tYW5kLCB7XG4gICAgICAgICAgICAgICAgZW5jb2Rpbmc6IFwidXRmLThcIixcbiAgICAgICAgICAgICAgICBjd2Q6IHRoaXMuZmxhZ3Mud29ya2luZ0RpciA/PyBwcm9jZXNzLmN3ZCgpLFxuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDEyMDAwMCwgLy8gMiBtaW51dGUgdGltZW91dCBmb3IgZ2F0ZXNcbiAgICAgICAgICAgICAgICBtYXhCdWZmZXI6IDEwICogMTAyNCAqIDEwMjQsIC8vIDEwTUIgYnVmZmVyXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHN0ZG91dCA9IHJlc3VsdDtcbiAgICAgICAgICAgIGV4aXRDb2RlID0gMDtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yICYmIFwic3RhdHVzXCIgaW4gZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBleGl0Q29kZSA9IChlcnJvciBhcyB7IHN0YXR1czogbnVtYmVyIH0pLnN0YXR1cyA/PyAxO1xuICAgICAgICAgICAgICAgIHN0ZGVyciA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgICAgICAgICAvLyBDYXB0dXJlIHN0ZG91dCBmcm9tIGZhaWxlZCBjb21tYW5kIGlmIGF2YWlsYWJsZVxuICAgICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgICAgICAgICAgICAgaWYgKFwic3Rkb3V0XCIgaW4gZXJyb3IgJiYgZXJyb3Iuc3Rkb3V0KSB7XG4gICAgICAgICAgICAgICAgICAgIHN0ZG91dCA9IFN0cmluZyhlcnJvci5zdGRvdXQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgICAgICAgICAgICAgIGlmIChcInN0ZGVyclwiIGluIGVycm9yICYmIGVycm9yLnN0ZGVycikge1xuICAgICAgICAgICAgICAgICAgICBzdGRlcnIgPSBTdHJpbmcoZXJyb3Iuc3RkZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHN0ZGVyciA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGR1cmF0aW9uTXMgPSBEYXRlLm5vdygpIC0gc3RhcnRUaW1lO1xuXG4gICAgICAgIGNvbnN0IHBhc3NlZCA9IGV4aXRDb2RlID09PSAwO1xuXG4gICAgICAgIGxvZy5kZWJ1ZyhcIkdhdGUgY29tbWFuZCByZXN1bHRcIiwge1xuICAgICAgICAgICAgZ2F0ZTogZ2F0ZU5hbWUsXG4gICAgICAgICAgICBjb21tYW5kLFxuICAgICAgICAgICAgZXhpdENvZGUsXG4gICAgICAgICAgICBkdXJhdGlvbk1zLFxuICAgICAgICAgICAgc3Rkb3V0TGVuZ3RoOiBzdGRvdXQubGVuZ3RoLFxuICAgICAgICAgICAgc3RkZXJyTGVuZ3RoOiBzdGRlcnIubGVuZ3RoLFxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcGFzc2VkLFxuICAgICAgICAgICAgZGV0YWlsczoge1xuICAgICAgICAgICAgICAgIGNvbW1hbmQsXG4gICAgICAgICAgICAgICAgZXhpdENvZGUsXG4gICAgICAgICAgICAgICAgc3Rkb3V0OiB0cnVuY2F0ZU91dHB1dChzdGRvdXQsIDIwMDApLFxuICAgICAgICAgICAgICAgIHN0ZGVycjogdHJ1bmNhdGVPdXRwdXQoc3RkZXJyLCAxMDAwKSxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbk1zLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKiogQ2hlY2sgYWNjZXB0YW5jZSBjcml0ZXJpYSAqL1xuICAgIHByaXZhdGUgYXN5bmMgY2hlY2tBY2NlcHRhbmNlKGN5Y2xlOiBDeWNsZVN0YXRlKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIGxvZy5kZWJ1ZyhcIkNoZWNraW5nIGFjY2VwdGFuY2UgY3JpdGVyaWFcIiwge1xuICAgICAgICAgICAgY3ljbGVOdW1iZXI6IGN5Y2xlLmN5Y2xlTnVtYmVyLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBHZXQgdGhlIHdvcmsgcGhhc2Ugb3V0cHV0XG4gICAgICAgIGNvbnN0IHdvcmtQaGFzZSA9IGN5Y2xlLnBoYXNlc1tQaGFzZS5XT1JLXTtcbiAgICAgICAgaWYgKCF3b3JrUGhhc2UpIHtcbiAgICAgICAgICAgIGxvZy53YXJuKFwiTm8gd29yayBwaGFzZSBmb3VuZCBpbiBjeWNsZVwiKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHdvcmtSZXNwb25zZSA9IHdvcmtQaGFzZS5yZXNwb25zZS50cmltKCk7XG5cbiAgICAgICAgLy8gUnVsZSAxOiB3b3JrLnJlc3BvbnNlIG11c3QgYmUgbm9uLWVtcHR5XG4gICAgICAgIGlmICghd29ya1Jlc3BvbnNlKSB7XG4gICAgICAgICAgICBsb2cuZGVidWcoXCJBY2NlcHRhbmNlIGZhaWxlZDogZW1wdHkgd29yayByZXNwb25zZVwiKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJ1bGUgMjogQ2hlY2sgZm9yIHByb2dyZXNzIHNpZ25hbFxuICAgICAgICAvLyBQcm9ncmVzcyBzaWduYWwgPSAoTk8gQ0hBTkdFUyBtYXJrZXIgd2l0aCByZWFzb24pIE9SIChhdCBsZWFzdCBvbmUgdG9vbCBpbnZva2VkIGluIGFueSBwaGFzZSlcbiAgICAgICAgY29uc3QgaGFzTm9DaGFuZ2VzTWFya2VyID0gL05PXFxzKkNIQU5HRVM/WzpcXHNdL2kudGVzdCh3b3JrUmVzcG9uc2UpO1xuICAgICAgICBjb25zdCBoYXNQcm9ncmVzc1NpZ25hbCA9IHRoaXMuaGFzUHJvZ3Jlc3NTaWduYWwoY3ljbGUpO1xuXG4gICAgICAgIGlmIChoYXNOb0NoYW5nZXNNYXJrZXIpIHtcbiAgICAgICAgICAgIC8vIENoZWNrIGlmIHRoZXJlJ3MgYSByZWFzb24gcHJvdmlkZWRcbiAgICAgICAgICAgIGNvbnN0IGhhc1JlYXNvbiA9IC9OT1xccypDSEFOR0VTP1s6XFxzXStbQS1aXS8udGVzdCh3b3JrUmVzcG9uc2UpO1xuICAgICAgICAgICAgaWYgKGhhc1JlYXNvbikge1xuICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcIkFjY2VwdGFuY2UgcGFzc2VkOiBOTyBDSEFOR0VTIHdpdGggcmVhc29uXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGhhc1Byb2dyZXNzU2lnbmFsKSB7XG4gICAgICAgICAgICBsb2cuZGVidWcoXCJBY2NlcHRhbmNlIHBhc3NlZDogcHJvZ3Jlc3Mgc2lnbmFsIGRldGVjdGVkXCIpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDaGVjayBpZiByZXNwb25zZSBpcyBqdXN0IGZsdWZmICh0b28gc2hvcnQsIG5vIGFjdGlvbmFibGUgY29udGVudClcbiAgICAgICAgaWYgKHdvcmtSZXNwb25zZS5sZW5ndGggPCAyMCkge1xuICAgICAgICAgICAgbG9nLmRlYnVnKFwiQWNjZXB0YW5jZSBmYWlsZWQ6IHJlc3BvbnNlIHRvbyBzaG9ydC9mbHVmZnlcIik7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDaGVjayBmb3IgY29tbW9uIFwiSSB3aWxsXCIgcGF0dGVybnMgdGhhdCBpbmRpY2F0ZSBubyBhY3Rpb25cbiAgICAgICAgY29uc3Qgd2lsbFBhdHRlcm4gPVxuICAgICAgICAgICAgL1xcYkkgKHdpbGx8bmVlZCB0b3xzaG91bGR8bXVzdHxoYXZlIHRvfGFtIGdvaW5nIHRvKVxcYi9pO1xuICAgICAgICBpZiAod2lsbFBhdHRlcm4udGVzdCh3b3JrUmVzcG9uc2UpKSB7XG4gICAgICAgICAgICBsb2cuZGVidWcoXG4gICAgICAgICAgICAgICAgXCJBY2NlcHRhbmNlIGZhaWxlZDogcmVzcG9uc2UgY29udGFpbnMgJ0kgd2lsbCcgcGF0dGVybiAobm8gYWN0aW9uIHRha2VuKVwiLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIHdlIGdvdCBoZXJlIGFuZCBub25lIG9mIHRoZSBhYm92ZSwgaXQgbWlnaHQgc3RpbGwgYmUgdmFsaWQgaWYgaXQgbWVudGlvbnMgY2hhbmdlc1xuICAgICAgICBjb25zdCBtZW50aW9uc0NoYW5nZXMgPVxuICAgICAgICAgICAgL1xcYihjaGFuZ2V8bW9kaWZ5fGNyZWF0ZXx1cGRhdGV8ZGVsZXRlfGFkZHxmaXh8aW1wbGVtZW50fHJlZmFjdG9yfHdyaXRlfHJ1bnx0ZXN0KVxcYi9pLnRlc3QoXG4gICAgICAgICAgICAgICAgd29ya1Jlc3BvbnNlLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgaWYgKG1lbnRpb25zQ2hhbmdlcykge1xuICAgICAgICAgICAgbG9nLmRlYnVnKFxuICAgICAgICAgICAgICAgIFwiQWNjZXB0YW5jZSBwYXNzZWQ6IHJlc3BvbnNlIG1lbnRpb25zIGFjdGlvbmFibGUgY2hhbmdlc1wiLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgbG9nLmRlYnVnKFwiQWNjZXB0YW5jZSBmYWlsZWQ6IG5vIHZhbGlkIHByb2dyZXNzIHNpZ25hbFwiKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKiBDaGVjayBpZiBjeWNsZSBoYXMgcHJvZ3Jlc3Mgc2lnbmFsICh0b29scyBvciBnYXRlIGNvbW1hbmRzIGV4ZWN1dGVkKSAqL1xuICAgIHByaXZhdGUgaGFzUHJvZ3Jlc3NTaWduYWwoY3ljbGU6IEN5Y2xlU3RhdGUpOiBib29sZWFuIHtcbiAgICAgICAgLy8gQ2hlY2sgZm9yIGFueSB0b29sIGludm9jYXRpb25zIGluIGFueSBwaGFzZVxuICAgICAgICBjb25zdCBhbGxUb29scyA9IHRoaXMuY29sbGVjdEFsbFRvb2xzKGN5Y2xlKTtcbiAgICAgICAgaWYgKGFsbFRvb2xzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2hlY2sgaWYgZ2F0ZXMgYWN0dWFsbHkgcmFuIChub24tZW1wdHkgZGV0YWlscyBpbmRpY2F0ZSBleGVjdXRpb24pXG4gICAgICAgIGZvciAoY29uc3QgZ2F0ZVJlc3VsdCBvZiBjeWNsZS5nYXRlUmVzdWx0cykge1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIGdhdGVSZXN1bHQuZGV0YWlscyAmJlxuICAgICAgICAgICAgICAgIFwiY29tbWFuZFwiIGluIGdhdGVSZXN1bHQuZGV0YWlscyAmJlxuICAgICAgICAgICAgICAgIGdhdGVSZXN1bHQuZGV0YWlscy5jb21tYW5kXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKiogSGFuZGxlIGxvb3Agc3RvcCAqL1xuICAgIHByaXZhdGUgYXN5bmMgaGFuZGxlU3RvcChcbiAgICAgICAgcmVhc29uOiBTdG9wUmVhc29uLFxuICAgICAgICBzdW1tYXJ5OiBzdHJpbmcsXG4gICAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGNvbnN0IHN0YXRlID0gdGhpcy5mbG93U3RvcmUubG9hZCgpO1xuICAgICAgICBpZiAoc3RhdGUpIHtcbiAgICAgICAgICAgIGxldCBydW5TdGF0dXM6IFJ1blN0YXR1cztcbiAgICAgICAgICAgIHN3aXRjaCAocmVhc29uKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBTdG9wUmVhc29uLkNPTVBMRVRJT05fUFJPTUlTRTpcbiAgICAgICAgICAgICAgICAgICAgcnVuU3RhdHVzID0gUnVuU3RhdHVzLkNPTVBMRVRFRDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBTdG9wUmVhc29uLlNUVUNLOlxuICAgICAgICAgICAgICAgICAgICBydW5TdGF0dXMgPSBSdW5TdGF0dXMuU1RVQ0s7XG4gICAgICAgICAgICAgICAgICAgIC8vIE5vdGlmeSBEaXNjb3JkOiBzdHVja1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc2NvcmRXZWJob29rPy5ub3RpZnlTdHVja09yQWJvcnRlZChcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLmN1cnJlbnRDeWNsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiU1RVQ0tcIixcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBTdG9wUmVhc29uLlVTRVJfQUJPUlQ6XG4gICAgICAgICAgICAgICAgICAgIHJ1blN0YXR1cyA9IFJ1blN0YXR1cy5BQk9SVEVEO1xuICAgICAgICAgICAgICAgICAgICAvLyBOb3RpZnkgRGlzY29yZDogYWJvcnRlZFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc2NvcmRXZWJob29rPy5ub3RpZnlTdHVja09yQWJvcnRlZChcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLmN1cnJlbnRDeWNsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiQUJPUlRFRFwiLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFN0b3BSZWFzb24uRVJST1I6XG4gICAgICAgICAgICAgICAgICAgIHJ1blN0YXR1cyA9IFJ1blN0YXR1cy5GQUlMRUQ7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHJ1blN0YXR1cyA9IFJ1blN0YXR1cy5GQUlMRUQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmZsb3dTdG9yZS51cGRhdGVTdGF0dXMocnVuU3RhdHVzLCByZWFzb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgVUkuaGVhZGVyKFwiTG9vcCBDb21wbGV0ZVwiKTtcbiAgICAgICAgVUkuaW5mbyhgU3RvcCByZWFzb246ICR7cmVhc29ufWApO1xuICAgICAgICBVSS5pbmZvKGBTdW1tYXJ5OiAke3N1bW1hcnl9YCk7XG5cbiAgICAgICAgbG9nLmluZm8oXCJSYWxwaCBsb29wIHN0b3BwZWRcIiwgeyByZWFzb24sIHN1bW1hcnkgfSk7XG4gICAgfVxufVxuXG4vKiogQ3JlYXRlIFJhbHBoIExvb3AgUnVubmVyIGZyb20gZmxhZ3MgKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjcmVhdGVSYWxwaExvb3BSdW5uZXIoXG4gICAgZmxhZ3M6IFJhbHBoRmxhZ3MsXG4gICAgYmFzZUNvbmZpZzogQWlFbmdDb25maWcsXG4pOiBQcm9taXNlPFJhbHBoTG9vcFJ1bm5lcj4ge1xuICAgIC8vIENyZWF0ZSBvcHRpbWl6ZXIgZm9yIGluaXRpYWwgcHJvbXB0IHByb2Nlc3NpbmdcbiAgICBjb25zdCBvcHRpbWl6ZXIgPSBuZXcgUHJvbXB0T3B0aW1pemVyKHtcbiAgICAgICAgYXV0b0FwcHJvdmU6IGZsYWdzLmNpID8/IGZhbHNlLFxuICAgICAgICB2ZXJib3NpdHk6IGZsYWdzLnZlcmJvc2UgPyBcInZlcmJvc2VcIiA6IFwibm9ybWFsXCIsXG4gICAgfSk7XG5cbiAgICByZXR1cm4gbmV3IFJhbHBoTG9vcFJ1bm5lcihmbGFncywgYmFzZUNvbmZpZywgb3B0aW1pemVyKTtcbn1cbiIsCiAgICAiLyoqXG4gKiBPcGVuQ29kZSBTREsgQmFja2VuZCBXcmFwcGVyXG4gKlxuICogUHJvdmlkZXMgc2Vzc2lvbiBtYW5hZ2VtZW50IGFuZCBtZXNzYWdlIHNlbmRpbmcgY2FwYWJpbGl0aWVzXG4gKiBmb3IgYWktZW5nIHJhbHBoIHJ1bm5lciB1c2luZyBPcGVuQ29kZSBTREsuXG4gKi9cblxuaW1wb3J0IHsgY3JlYXRlU2VydmVyIH0gZnJvbSBcIm5vZGU6bmV0XCI7XG5pbXBvcnQge1xuICAgIHR5cGUgT3BlbmNvZGVDbGllbnQsXG4gICAgY3JlYXRlT3BlbmNvZGUsXG4gICAgY3JlYXRlT3BlbmNvZGVDbGllbnQsXG59IGZyb20gXCJAb3BlbmNvZGUtYWkvc2RrXCI7XG5pbXBvcnQgeyBMb2cgfSBmcm9tIFwiLi4vLi4vdXRpbC9sb2dcIjtcblxuY29uc3QgbG9nID0gTG9nLmNyZWF0ZSh7IHNlcnZpY2U6IFwib3BlbmNvZGUtY2xpZW50XCIgfSk7XG5cbi8qKlxuICogUmVzcG9uc2UgaW50ZXJmYWNlIGZvciBtZXNzYWdlc1xuICovXG5leHBvcnQgaW50ZXJmYWNlIE1lc3NhZ2VSZXNwb25zZSB7XG4gICAgY29udGVudDogc3RyaW5nO1xufVxuXG4vKipcbiAqIFN0cmVhbWluZyByZXNwb25zZSBpbnRlcmZhY2VcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTdHJlYW1pbmdSZXNwb25zZSB7XG4gICAgLyoqIFJlYWRhYmxlIHN0cmVhbSBvZiByZXNwb25zZSBjaHVua3MgKi9cbiAgICBzdHJlYW06IFJlYWRhYmxlU3RyZWFtPFVpbnQ4QXJyYXk+O1xuICAgIC8qKiBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gY29tcGxldGUgcmVzcG9uc2Ugd2hlbiBzdHJlYW0gZW5kcyAqL1xuICAgIGNvbXBsZXRlOiBQcm9taXNlPE1lc3NhZ2VSZXNwb25zZT47XG59XG5cbi8qKlxuICogU2Vzc2lvbiBpbnRlcmZhY2UgZm9yIGFpLWVuZyBydW5uZXJcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTZXNzaW9uIHtcbiAgICBpZDogc3RyaW5nO1xuICAgIHNlbmRNZXNzYWdlOiAobWVzc2FnZTogc3RyaW5nKSA9PiBQcm9taXNlPE1lc3NhZ2VSZXNwb25zZT47XG4gICAgc2VuZE1lc3NhZ2VTdHJlYW06IChtZXNzYWdlOiBzdHJpbmcpID0+IFByb21pc2U8U3RyZWFtaW5nUmVzcG9uc2U+O1xuICAgIGNsb3NlOiAoKSA9PiBQcm9taXNlPHZvaWQ+O1xuICAgIC8qKiBUb29sIGludm9jYXRpb25zIGNhcHR1cmVkIGR1cmluZyB0aGlzIHNlc3Npb24gKi9cbiAgICBfdG9vbEludm9jYXRpb25zPzogQXJyYXk8e1xuICAgICAgICBpZDogc3RyaW5nO1xuICAgICAgICBuYW1lOiBzdHJpbmc7XG4gICAgICAgIGlucHV0PzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgICAgIG91dHB1dD86IHN0cmluZztcbiAgICAgICAgc3RhdHVzOiBcIm9rXCIgfCBcImVycm9yXCI7XG4gICAgICAgIGVycm9yPzogc3RyaW5nO1xuICAgICAgICBzdGFydGVkQXQ/OiBzdHJpbmc7XG4gICAgICAgIGNvbXBsZXRlZEF0Pzogc3RyaW5nO1xuICAgIH0+O1xufVxuXG4vKipcbiAqIENsaWVudCBjb25maWd1cmF0aW9uIG9wdGlvbnNcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDbGllbnRDb25maWcge1xuICAgIC8qKiBDdXN0b20gY2xpZW50IGluc3RhbmNlIChmb3IgdGVzdGluZykgKi9cbiAgICBjbGllbnQ/OiBPcGVuY29kZUNsaWVudDtcbiAgICAvKiogQ29ubmVjdGlvbiB0aW1lb3V0IGluIG1pbGxpc2Vjb25kcyAoZGVmYXVsdDogMTAwMDApICovXG4gICAgdGltZW91dD86IG51bWJlcjtcbiAgICAvKiogUmV0cnkgYXR0ZW1wdHMgZm9yIGZhaWxlZCBvcGVyYXRpb25zICovXG4gICAgcmV0cnlBdHRlbXB0cz86IG51bWJlcjtcbiAgICAvKiogUHJvbXB0IHRpbWVvdXQgaW4gbWlsbGlzZWNvbmRzICh1c2VkIGFzIGFuIGlkbGUgdGltZW91dCBmb3Igc3RyZWFtaW5nKSAqL1xuICAgIHByb21wdFRpbWVvdXQ/OiBudW1iZXI7XG4gICAgLyoqIERpcmVjdG9yeS93b3JrdHJlZSBjb250ZXh0IHRvIHJ1biBPcGVuQ29kZSBpbiAoZGVmYXVsdHMgdG8gcHJvY2Vzcy5jd2QoKSkgKi9cbiAgICBkaXJlY3Rvcnk/OiBzdHJpbmc7XG4gICAgLyoqIFVSTCBvZiBleGlzdGluZyBPcGVuQ29kZSBzZXJ2ZXIgdG8gcmV1c2UgKGlmIHByb3ZpZGVkLCB3b24ndCBzcGF3biBuZXcgc2VydmVyKSAqL1xuICAgIGV4aXN0aW5nU2VydmVyVXJsPzogc3RyaW5nO1xuICAgIC8qKiBTZXJ2ZXIgc3RhcnR1cCB0aW1lb3V0IGluIG1pbGxpc2Vjb25kcyAoZGVmYXVsdDogMTAwMDApICovXG4gICAgc2VydmVyU3RhcnR1cFRpbWVvdXQ/OiBudW1iZXI7XG4gICAgLyoqIE5PVEU6IHdvcmtpbmdEaXIgcGFyYW1ldGVyIGlzIG5vdCBzdXBwb3J0ZWQgYnkgdGhlIFNES1xuICAgICAqIFNwYXduZWQgT3BlbkNvZGUgc2VydmVycyB3aWxsIHVzZSB0aGUgY2FsbGluZyBkaXJlY3RvcnkgYnkgZGVmYXVsdCAocHJvY2Vzcy5jd2QoKSlcbiAgICAgKiBVc2UgT1BFTkNPREVfVVJMIHRvIGNvbm5lY3QgdG8gYSBkaWZmZXJlbnQgT3BlbkNvZGUgaW5zdGFuY2UgaW5zdGVhZFxuICAgICAqL1xufVxuXG4vKipcbiAqIE9wZW5Db2RlIENsaWVudCBXcmFwcGVyXG4gKlxuICogV3JhcHMgT3BlbkNvZGUgU0RLIHRvIHByb3ZpZGUgc2Vzc2lvbiBtYW5hZ2VtZW50XG4gKiBhbmQgZXJyb3IgaGFuZGxpbmcgZm9yIHJhbHBoIHJ1bm5lci5cbiAqL1xuZXhwb3J0IGNsYXNzIE9wZW5Db2RlQ2xpZW50IHtcbiAgICBwcml2YXRlIGNsaWVudDogT3BlbmNvZGVDbGllbnQ7XG4gICAgcHJpdmF0ZSB0aW1lb3V0OiBudW1iZXI7XG4gICAgcHJpdmF0ZSByZXRyeUF0dGVtcHRzOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBhY3RpdmVTZXNzaW9uczogTWFwPHN0cmluZywgU2Vzc2lvbj47XG4gICAgcHJpdmF0ZSBwcm9tcHRUaW1lb3V0OiBudW1iZXI7XG4gICAgcHJpdmF0ZSBkaXJlY3Rvcnk6IHN0cmluZyA9IHByb2Nlc3MuY3dkKCk7XG4gICAgcHJpdmF0ZSBzZXJ2ZXI6IHsgdXJsOiBzdHJpbmc7IGNsb3NlOiAoKSA9PiB2b2lkIH0gfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIHNlcnZlclN0YXJ0dXBUaW1lb3V0OiBudW1iZXI7XG5cbiAgICAvKipcbiAgICAgKiBQcml2YXRlIGNvbnN0cnVjdG9yIC0gdXNlIHN0YXRpYyBjcmVhdGUoKSBmYWN0b3J5IG1ldGhvZCBpbnN0ZWFkXG4gICAgICovXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihcbiAgICAgICAgY2xpZW50OiBPcGVuY29kZUNsaWVudCxcbiAgICAgICAgc2VydmVyOiB7IHVybDogc3RyaW5nOyBjbG9zZTogKCkgPT4gdm9pZCB9IHwgbnVsbCxcbiAgICAgICAgY29uZmlnOiBDbGllbnRDb25maWcgPSB7fSxcbiAgICApIHtcbiAgICAgICAgdGhpcy5jbGllbnQgPSBjbGllbnQ7XG4gICAgICAgIHRoaXMuc2VydmVyID0gc2VydmVyO1xuICAgICAgICB0aGlzLnRpbWVvdXQgPSBjb25maWcudGltZW91dCB8fCAzMDAwMDtcbiAgICAgICAgdGhpcy5yZXRyeUF0dGVtcHRzID0gY29uZmlnLnJldHJ5QXR0ZW1wdHMgfHwgMztcblxuICAgICAgICBjb25zdCBlbnZQcm9tcHRUaW1lb3V0ID0gTnVtYmVyLnBhcnNlSW50KFxuICAgICAgICAgICAgcHJvY2Vzcy5lbnYuT1BFTkNPREVfUFJPTVBUX1RJTUVPVVRfTVMgPz8gXCJcIixcbiAgICAgICAgICAgIDEwLFxuICAgICAgICApO1xuICAgICAgICBjb25zdCByZXNvbHZlZFByb21wdFRpbWVvdXQgPSBOdW1iZXIuaXNGaW5pdGUoZW52UHJvbXB0VGltZW91dClcbiAgICAgICAgICAgID8gZW52UHJvbXB0VGltZW91dFxuICAgICAgICAgICAgOiB1bmRlZmluZWQ7XG5cbiAgICAgICAgLy8gRm9yIHN0cmVhbWluZywgdGhpcyBhY3RzIGFzIGFuIGlkbGUgdGltZW91dCAocmVzZXQgb24gc3RyZWFtZWQgZXZlbnRzKVxuICAgICAgICB0aGlzLnByb21wdFRpbWVvdXQgPVxuICAgICAgICAgICAgY29uZmlnLnByb21wdFRpbWVvdXQgPz8gcmVzb2x2ZWRQcm9tcHRUaW1lb3V0ID8/IDEyMDAwMDsgLy8gMTIwIHNlY29uZHMgZGVmYXVsdFxuXG4gICAgICAgIHRoaXMuZGlyZWN0b3J5ID1cbiAgICAgICAgICAgIGNvbmZpZy5kaXJlY3RvcnkgfHwgcHJvY2Vzcy5lbnYuT1BFTkNPREVfRElSRUNUT1JZIHx8IHByb2Nlc3MuY3dkKCk7XG5cbiAgICAgICAgdGhpcy5zZXJ2ZXJTdGFydHVwVGltZW91dCA9IGNvbmZpZy5zZXJ2ZXJTdGFydHVwVGltZW91dCB8fCAxMDAwMDsgLy8gMTAgc2Vjb25kcyBkZWZhdWx0XG4gICAgICAgIHRoaXMuYWN0aXZlU2Vzc2lvbnMgPSBuZXcgTWFwKCk7XG5cbiAgICAgICAgbG9nLmRlYnVnKFwiT3BlbkNvZGVDbGllbnQgaW5pdGlhbGl6ZWRcIiwge1xuICAgICAgICAgICAgaGFzT3duU2VydmVyOiAhIXRoaXMuc2VydmVyLFxuICAgICAgICAgICAgdGltZW91dDogdGhpcy50aW1lb3V0LFxuICAgICAgICAgICAgc2VydmVyU3RhcnR1cFRpbWVvdXQ6IHRoaXMuc2VydmVyU3RhcnR1cFRpbWVvdXQsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBhbiBhdmFpbGFibGUgcG9ydCBmb3IgT3BlbkNvZGUgc2VydmVyXG4gICAgICpcbiAgICAgKiBJTVBPUlRBTlQ6IEFsd2F5cyBhdm9pZCBwb3J0IDQwOTYgdG8gcHJldmVudCBjb25mbGljdHMgd2l0aCB1c2VyJ3MgZXhpc3Rpbmcgc2VydmVyXG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgYXN5bmMgZ2V0QXZhaWxhYmxlUG9ydCgpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgZGVmYXVsdCBwb3J0IGlzIGluIHVzZSBhbmQgbG9nIGFjY29yZGluZ2x5XG4gICAgICAgICAgICBjb25zdCBkZWZhdWx0UG9ydCA9IDQwOTY7XG4gICAgICAgICAgICBjb25zdCBpc0RlZmF1bHRBdmFpbGFibGUgPVxuICAgICAgICAgICAgICAgIGF3YWl0IE9wZW5Db2RlQ2xpZW50LmlzUG9ydEF2YWlsYWJsZShkZWZhdWx0UG9ydCk7XG5cbiAgICAgICAgICAgIGlmICghaXNEZWZhdWx0QXZhaWxhYmxlKSB7XG4gICAgICAgICAgICAgICAgbG9nLmluZm8oXG4gICAgICAgICAgICAgICAgICAgIFwiRXhpc3Rpbmcgc2VydmVyIGRldGVjdGVkIG9uIHBvcnQgNDA5Njsgc3Bhd25pbmcgaXNvbGF0ZWQgc2VydmVyIG9uIGR5bmFtaWMgcG9ydFwiLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcbiAgICAgICAgICAgICAgICAgICAgXCJEZWZhdWx0IHBvcnQgNDA5NiBpcyBhdmFpbGFibGUgYnV0IGF2b2lkaW5nIGl0IGZvciBpc29sYXRpb25cIixcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBBbHdheXMgdXNlIGR5bmFtaWMgcG9ydCB0byBhdm9pZCBjb25mbGljdHMgd2l0aCB1c2VyJ3MgZXhpc3Rpbmcgc2VydmVyXG4gICAgICAgICAgICBjb25zdCBkeW5hbWljUG9ydCA9IGF3YWl0IE9wZW5Db2RlQ2xpZW50LmZpbmRBdmFpbGFibGVQb3J0KCk7XG4gICAgICAgICAgICBsb2cuaW5mbyhcbiAgICAgICAgICAgICAgICBgU3Bhd25pbmcgaXNvbGF0ZWQgc2VydmVyIG9uIGR5bmFtaWMgcG9ydDogJHtkeW5hbWljUG9ydH1gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHJldHVybiBkeW5hbWljUG9ydDtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTXNnID1cbiAgICAgICAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgICAgICBsb2cuZXJyb3IoXCJGYWlsZWQgdG8gc2VsZWN0IE9wZW5Db2RlIHNlcnZlciBwb3J0XCIsIHtcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JNc2csXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICBgRmFpbGVkIHRvIHNlbGVjdCBPcGVuQ29kZSBzZXJ2ZXIgcG9ydDogJHtlcnJvck1zZ31gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGEgc3BlY2lmaWMgcG9ydCBpcyBhdmFpbGFibGVcbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBhc3luYyBpc1BvcnRBdmFpbGFibGUocG9ydDogbnVtYmVyKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc2VydmVyID0gY3JlYXRlU2VydmVyKCk7XG5cbiAgICAgICAgICAgIHNlcnZlci5saXN0ZW4ocG9ydCwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHNlcnZlci5vbmNlKFwiY2xvc2VcIiwgKCkgPT4gcmVzb2x2ZSh0cnVlKSk7XG4gICAgICAgICAgICAgICAgc2VydmVyLmNsb3NlKCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc2VydmVyLm9uKFwiZXJyb3JcIiwgKCkgPT4gcmVzb2x2ZShmYWxzZSkpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGaW5kIGFuIGF2YWlsYWJsZSBwb3J0IGR5bmFtaWNhbGx5XG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgYXN5bmMgZmluZEF2YWlsYWJsZVBvcnQoKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNlcnZlciA9IGNyZWF0ZVNlcnZlcigpO1xuXG4gICAgICAgICAgICBzZXJ2ZXIubGlzdGVuKDAsICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBhZGRyZXNzID0gc2VydmVyLmFkZHJlc3MoKTtcbiAgICAgICAgICAgICAgICBpZiAoYWRkcmVzcyAmJiB0eXBlb2YgYWRkcmVzcyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgICAgICAgICBzZXJ2ZXIub25jZShcImNsb3NlXCIsICgpID0+IHJlc29sdmUoYWRkcmVzcy5wb3J0KSk7XG4gICAgICAgICAgICAgICAgICAgIHNlcnZlci5jbG9zZSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoXCJGYWlsZWQgdG8gZ2V0IHNlcnZlciBhZGRyZXNzXCIpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc2VydmVyLm9uKFwiZXJyb3JcIiwgcmVqZWN0KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU3RhdGljIGZhY3RvcnkgbWV0aG9kIHRvIGNyZWF0ZSBhbiBPcGVuQ29kZUNsaWVudFxuICAgICAqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBjbGllbnQgd2l0aCBlaXRoZXI6XG4gICAgICogMS4gQSBmcmVzaCBPcGVuQ29kZSBzZXJ2ZXIgKGRlZmF1bHQgYmVoYXZpb3IpXG4gICAgICogMi4gQW4gZXhpc3Rpbmcgc2VydmVyIFVSTCAoaWYgZXhpc3RpbmdTZXJ2ZXJVcmwgaXMgcHJvdmlkZWQpXG4gICAgICogMy4gQSBjdXN0b20gY2xpZW50IGluc3RhbmNlIChmb3IgdGVzdGluZylcbiAgICAgKlxuICAgICAqIE5vdGU6IFNwYXduZWQgT3BlbkNvZGUgc2VydmVycyB3aWxsIHVzZSB0byBjYWxsaW5nIGRpcmVjdG9yeSBieSBkZWZhdWx0IChwcm9jZXNzLmN3ZCgpKVxuICAgICAqIFVzZSBPUEVOQ09ERV9VUkwgdG8gY29ubmVjdCB0byBhIGRpZmZlcmVudCBPcGVuQ29kZSBpbnN0YW5jZVxuICAgICAqL1xuICAgIHN0YXRpYyBhc3luYyBjcmVhdGUoY29uZmlnOiBDbGllbnRDb25maWcgPSB7fSk6IFByb21pc2U8T3BlbkNvZGVDbGllbnQ+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIElmIGN1c3RvbSBjbGllbnQgcHJvdmlkZWQgKGZvciB0ZXN0aW5nKSwgdXNlIGl0IGRpcmVjdGx5XG4gICAgICAgICAgICBpZiAoY29uZmlnLmNsaWVudCkge1xuICAgICAgICAgICAgICAgIGxvZy5pbmZvKFwiQ3JlYXRpbmcgT3BlbkNvZGVDbGllbnQgd2l0aCBjdXN0b20gY2xpZW50IGluc3RhbmNlXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgT3BlbkNvZGVDbGllbnQoY29uZmlnLmNsaWVudCwgbnVsbCwgY29uZmlnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gSWYgZXhpc3Rpbmcgc2VydmVyIFVSTCBwcm92aWRlZCwgY29ubmVjdCB0byBpdFxuICAgICAgICAgICAgaWYgKGNvbmZpZy5leGlzdGluZ1NlcnZlclVybCkge1xuICAgICAgICAgICAgICAgIGxvZy5pbmZvKFwiQ29ubmVjdGluZyB0byBleGlzdGluZyBPcGVuQ29kZSBzZXJ2ZXJcIiwge1xuICAgICAgICAgICAgICAgICAgICB1cmw6IGNvbmZpZy5leGlzdGluZ1NlcnZlclVybCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjbGllbnQgPSBjcmVhdGVPcGVuY29kZUNsaWVudCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXNlVXJsOiBjb25maWcuZXhpc3RpbmdTZXJ2ZXJVcmwsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFZlcmlmeSBjb25uZWN0aW9uIGJ5IG1ha2luZyBhIHRlc3QgcmVxdWVzdFxuICAgICAgICAgICAgICAgICAgICBsb2cuZGVidWcoXCJWZXJpZnlpbmcgY29ubmVjdGlvbiB0byBleGlzdGluZyBzZXJ2ZXIuLi5cIik7XG4gICAgICAgICAgICAgICAgICAgIC8vIE5vdGU6IFdlJ2xsIHNraXAgdmVyaWZpY2F0aW9uIGZvciBub3cgdG8gYXZvaWQgdW5uZWNlc3NhcnkgQVBJIGNhbGxzXG4gICAgICAgICAgICAgICAgICAgIC8vIFRoZSBjb25uZWN0aW9uIHdpbGwgYmUgdmVyaWZpZWQgd2hlbiBmaXJzdCBzZXNzaW9uIGlzIGNyZWF0ZWRcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IE9wZW5Db2RlQ2xpZW50KGNsaWVudCwgbnVsbCwgY29uZmlnKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1zZyA9XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIGxvZy5lcnJvcihcIkZhaWxlZCB0byBjb25uZWN0IHRvIGV4aXN0aW5nIHNlcnZlclwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IGNvbmZpZy5leGlzdGluZ1NlcnZlclVybCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvck1zZyxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRGVmYXVsdDogc3Bhd24gYSBuZXcgT3BlbkNvZGUgc2VydmVyXG4gICAgICAgICAgICAvLyBOb3RlOiBTcGF3bmVkIHNlcnZlcnMgd2lsbCB1c2UgdG8gY2FsbGluZyBkaXJlY3RvcnkgYnkgZGVmYXVsdFxuICAgICAgICAgICAgLy8gVXNlIE9QRU5DT0RFX1VSTCB0byBjb25uZWN0IHRvIGEgZGlmZmVyZW50IE9wZW5Db2RlIGluc3RhbmNlXG4gICAgICAgICAgICBsb2cuaW5mbyhcIlNwYXduaW5nIG5ldyBPcGVuQ29kZSBzZXJ2ZXIuLi5cIiwge1xuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IGNvbmZpZy5zZXJ2ZXJTdGFydHVwVGltZW91dCB8fCAxMDAwMCxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjb25zdCBhdmFpbGFibGVQb3J0ID0gYXdhaXQgT3BlbkNvZGVDbGllbnQuZ2V0QXZhaWxhYmxlUG9ydCgpO1xuXG4gICAgICAgICAgICBjb25zdCB7IGNsaWVudCwgc2VydmVyIH0gPSBhd2FpdCBjcmVhdGVPcGVuY29kZSh7XG4gICAgICAgICAgICAgICAgdGltZW91dDogY29uZmlnLnNlcnZlclN0YXJ0dXBUaW1lb3V0IHx8IDEwMDAwLFxuICAgICAgICAgICAgICAgIHBvcnQ6IGF2YWlsYWJsZVBvcnQsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgbG9nLmluZm8oXCJPcGVuQ29kZSBzZXJ2ZXIgc3RhcnRlZCBzdWNjZXNzZnVsbHlcIik7XG4gICAgICAgICAgICByZXR1cm4gbmV3IE9wZW5Db2RlQ2xpZW50KGNsaWVudCwgc2VydmVyLCBjb25maWcpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNc2cgPVxuICAgICAgICAgICAgICAgIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgICAgIGxvZy5lcnJvcihcIkZhaWxlZCB0byBjcmVhdGUgT3BlbkNvZGVDbGllbnRcIiwgeyBlcnJvcjogZXJyb3JNc2cgfSk7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBjcmVhdGUgT3BlbkNvZGVDbGllbnQ6ICR7ZXJyb3JNc2d9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgT3BlbkNvZGUgc2Vzc2lvbiB3aXRoIGEgZ2l2ZW4gcHJvbXB0XG4gICAgICovXG4gICAgYXN5bmMgY3JlYXRlU2Vzc2lvbihwcm9tcHQ6IHN0cmluZyk6IFByb21pc2U8U2Vzc2lvbj4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gQ3JlYXRlIHNlc3Npb24gdXNpbmcgU0RLXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmNsaWVudC5zZXNzaW9uLmNyZWF0ZSh7XG4gICAgICAgICAgICAgICAgYm9keToge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZTogXCJhaS1lbmcgcmFscGggc2Vzc2lvblwiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYgKCFyZXN1bHQuZGF0YSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgYEZhaWxlZCB0byBjcmVhdGUgT3BlbkNvZGUgc2Vzc2lvbjogJHtKU09OLnN0cmluZ2lmeShyZXN1bHQuZXJyb3IpfWAsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3Qgc2RrU2Vzc2lvbiA9IHJlc3VsdC5kYXRhO1xuXG4gICAgICAgICAgICAvLyBEZWZlciB0aGUgaW5pdGlhbCBwcm9tcHQgdW50aWwgdGhlIGZpcnN0IG1lc3NhZ2UgaXMgc2VudC5cbiAgICAgICAgICAgIC8vIFRoaXMgYXZvaWRzIGJsb2NraW5nIHNlc3Npb24gY3JlYXRpb24gYW5kIGVuYWJsZXMgc3RyZWFtaW5nIG91dHB1dFxuICAgICAgICAgICAgLy8gZXZlbiB3aGVuIHRoZSBpbml0aWFsIHByb21wdCBpcyBsYXJnZSBvciBzbG93IHRvIHByb2Nlc3MuXG4gICAgICAgICAgICBsZXQgcGVuZGluZ0luaXRpYWxQcm9tcHQgPSBwcm9tcHQudHJpbSgpO1xuICAgICAgICAgICAgY29uc3QgYnVpbGRGaXJzdE1lc3NhZ2UgPSAobWVzc2FnZTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFwZW5kaW5nSW5pdGlhbFByb21wdCkgcmV0dXJuIG1lc3NhZ2U7XG4gICAgICAgICAgICAgICAgY29uc3QgY29tYmluZWQgPSBgJHtwZW5kaW5nSW5pdGlhbFByb21wdH1cXG5cXG4tLS1cXG5cXG4ke21lc3NhZ2V9YDtcbiAgICAgICAgICAgICAgICBwZW5kaW5nSW5pdGlhbFByb21wdCA9IFwiXCI7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbWJpbmVkO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8gSW5pdGlhbGl6ZSB0b29sIGludm9jYXRpb25zIHRyYWNrZXJcbiAgICAgICAgICAgIGNvbnN0IHRvb2xJbnZvY2F0aW9uczogU2Vzc2lvbltcIl90b29sSW52b2NhdGlvbnNcIl0gPSBbXTtcblxuICAgICAgICAgICAgLy8gV3JhcCB3aXRoIG91ciBzZXNzaW9uIGludGVyZmFjZVxuICAgICAgICAgICAgY29uc3Qgc2Vzc2lvbjogU2Vzc2lvbiA9IHtcbiAgICAgICAgICAgICAgICBpZDogc2RrU2Vzc2lvbi5pZCB8fCB0aGlzLmdlbmVyYXRlU2Vzc2lvbklkKCksXG4gICAgICAgICAgICAgICAgX3Rvb2xJbnZvY2F0aW9uczogdG9vbEludm9jYXRpb25zLFxuICAgICAgICAgICAgICAgIHNlbmRNZXNzYWdlOiBhc3luYyAobWVzc2FnZTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmhhbmRsZVNlbmRNZXNzYWdlKFxuICAgICAgICAgICAgICAgICAgICAgICAgc2RrU2Vzc2lvbi5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkRmlyc3RNZXNzYWdlKG1lc3NhZ2UpLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc2VuZE1lc3NhZ2VTdHJlYW06IGFzeW5jIChtZXNzYWdlOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaGFuZGxlU2VuZE1lc3NhZ2VTdHJlYW0oXG4gICAgICAgICAgICAgICAgICAgICAgICBzZGtTZXNzaW9uLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgYnVpbGRGaXJzdE1lc3NhZ2UobWVzc2FnZSksXG4gICAgICAgICAgICAgICAgICAgICAgICB0b29sSW52b2NhdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjbG9zZTogYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5oYW5kbGVTZXNzaW9uQ2xvc2Uoc2RrU2Vzc2lvbi5pZCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIFN0b3JlIGFjdGl2ZSBzZXNzaW9uXG4gICAgICAgICAgICB0aGlzLmFjdGl2ZVNlc3Npb25zLnNldChzZXNzaW9uLmlkLCBzZXNzaW9uKTtcblxuICAgICAgICAgICAgcmV0dXJuIHNlc3Npb247XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPVxuICAgICAgICAgICAgICAgIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICBgRmFpbGVkIHRvIGNyZWF0ZSBPcGVuQ29kZSBzZXNzaW9uOiAke2Vycm9yTWVzc2FnZX1gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNlbmQgYSBtZXNzYWdlIHRvIGFuIGV4aXN0aW5nIHNlc3Npb25cbiAgICAgKi9cbiAgICBhc3luYyBzZW5kTWVzc2FnZShcbiAgICAgICAgc2Vzc2lvbklkOiBzdHJpbmcsXG4gICAgICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgICApOiBQcm9taXNlPE1lc3NhZ2VSZXNwb25zZT4ge1xuICAgICAgICBjb25zdCBzZXNzaW9uID0gdGhpcy5hY3RpdmVTZXNzaW9ucy5nZXQoc2Vzc2lvbklkKTtcblxuICAgICAgICBpZiAoIXNlc3Npb24pIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgU2Vzc2lvbiBub3QgZm91bmQ6ICR7c2Vzc2lvbklkfWApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuaGFuZGxlU2VuZE1lc3NhZ2Uoc2Vzc2lvbklkLCBtZXNzYWdlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDbG9zZSBhbiBhY3RpdmUgc2Vzc2lvblxuICAgICAqL1xuICAgIGFzeW5jIGNsb3NlU2Vzc2lvbihzZXNzaW9uSWQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCBzZXNzaW9uID0gdGhpcy5hY3RpdmVTZXNzaW9ucy5nZXQoc2Vzc2lvbklkKTtcblxuICAgICAgICBpZiAoIXNlc3Npb24pIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgU2Vzc2lvbiBub3QgZm91bmQ6ICR7c2Vzc2lvbklkfWApO1xuICAgICAgICB9XG5cbiAgICAgICAgYXdhaXQgdGhpcy5oYW5kbGVTZXNzaW9uQ2xvc2Uoc2Vzc2lvbklkKTtcbiAgICAgICAgdGhpcy5hY3RpdmVTZXNzaW9ucy5kZWxldGUoc2Vzc2lvbklkKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgYWxsIGFjdGl2ZSBzZXNzaW9uIElEc1xuICAgICAqL1xuICAgIGdldEFjdGl2ZVNlc3Npb25zKCk6IHN0cmluZ1tdIHtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5hY3RpdmVTZXNzaW9ucy5rZXlzKCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGEgc2Vzc2lvbiBpcyBhY3RpdmVcbiAgICAgKi9cbiAgICBpc1Nlc3Npb25BY3RpdmUoc2Vzc2lvbklkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWN0aXZlU2Vzc2lvbnMuaGFzKHNlc3Npb25JZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xvc2UgYWxsIGFjdGl2ZSBzZXNzaW9uc1xuICAgICAqL1xuICAgIGFzeW5jIGNsb3NlQWxsU2Vzc2lvbnMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGNvbnN0IGNsb3NlUHJvbWlzZXMgPSBBcnJheS5mcm9tKHRoaXMuYWN0aXZlU2Vzc2lvbnMua2V5cygpKS5tYXAoXG4gICAgICAgICAgICAoc2Vzc2lvbklkKSA9PlxuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlU2Vzc2lvbkNsb3NlKHNlc3Npb25JZCkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTXNnID1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgbG9nLndhcm4oXCJFcnJvciBjbG9zaW5nIHNlc3Npb25cIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yTXNnLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgKTtcblxuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChjbG9zZVByb21pc2VzKTtcbiAgICAgICAgdGhpcy5hY3RpdmVTZXNzaW9ucy5jbGVhcigpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEhhbmRsZSBzZW5kaW5nIGEgbWVzc2FnZSB3aXRoIHN0cmVhbWluZyBzdXBwb3J0XG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyBoYW5kbGVTZW5kTWVzc2FnZVN0cmVhbShcbiAgICAgICAgc2Vzc2lvbklkOiBzdHJpbmcsXG4gICAgICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgICAgICAgdG9vbEludm9jYXRpb25zPzogU2Vzc2lvbltcIl90b29sSW52b2NhdGlvbnNcIl0sXG4gICAgKTogUHJvbWlzZTxTdHJlYW1pbmdSZXNwb25zZT4ge1xuICAgICAgICBsZXQgbGFzdEVycm9yOiBFcnJvciB8IG51bGwgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0IHN1cHBvcnRzRXZlbnRTdHJlYW1pbmcgPVxuICAgICAgICAgICAgdHlwZW9mICh0aGlzLmNsaWVudCBhcyBhbnkpPy5zZXNzaW9uPy5wcm9tcHRBc3luYyA9PT0gXCJmdW5jdGlvblwiICYmXG4gICAgICAgICAgICB0eXBlb2YgKHRoaXMuY2xpZW50IGFzIGFueSk/LmV2ZW50Py5zdWJzY3JpYmUgPT09IFwiZnVuY3Rpb25cIjtcblxuICAgICAgICBmb3IgKGxldCBhdHRlbXB0ID0gMTsgYXR0ZW1wdCA8PSB0aGlzLnJldHJ5QXR0ZW1wdHM7IGF0dGVtcHQrKykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgYSBUcmFuc2Zvcm1TdHJlYW0gdG8gaGFuZGxlIHRoZSBzdHJlYW1pbmcgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICBjb25zdCBzdHJlYW0gPSBuZXcgVHJhbnNmb3JtU3RyZWFtPFVpbnQ4QXJyYXksIFVpbnQ4QXJyYXk+KCk7XG4gICAgICAgICAgICAgICAgY29uc3Qgd3JpdGVyID0gc3RyZWFtLndyaXRhYmxlLmdldFdyaXRlcigpO1xuICAgICAgICAgICAgICAgIGxldCBhc3Npc3RhbnRNZXNzYWdlSWQ6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuXG4gICAgICAgICAgICAgICAgLy8gVHJhY2sgZmluYWxpemF0aW9uIHRvIHByZXZlbnQgZG91YmxlLWNsb3NlL2Fib3J0XG4gICAgICAgICAgICAgICAgbGV0IGZpbmFsaXplZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNsb3NlT25jZSA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbmFsaXplZCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICBmaW5hbGl6ZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB3cml0ZXIuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZ25vcmUgZXJyb3JzIGR1cmluZyBjbG9zZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBjb25zdCBhYm9ydE9uY2UgPSBhc3luYyAoZXJyOiB1bmtub3duKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmaW5hbGl6ZWQpIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgZmluYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHdyaXRlci5hYm9ydChlcnIpO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElnbm9yZSBlcnJvcnMgZHVyaW5nIGFib3J0XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgLy8gRmFsbGJhY2s6IGlmIHRoZSBjbGllbnQgZG9lc24ndCBzdXBwb3J0IHByb21wdF9hc3luYyArIFNTRSwga2VlcCB0aGVcbiAgICAgICAgICAgICAgICAvLyBsZWdhY3kgYmVoYXZpb3IgKGJ1ZmZlciB0aGVuIHNpbXVsYXRlIHN0cmVhbWluZykuXG4gICAgICAgICAgICAgICAgaWYgKCFzdXBwb3J0c0V2ZW50U3RyZWFtaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHByb21wdFByb21pc2UgPSB0aGlzLmNsaWVudC5zZXNzaW9uLnByb21wdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBib2R5OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUlEOiB0aGlzLmdlbmVyYXRlTWVzc2FnZUlkKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJ0ZXh0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBtZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgcXVlcnk6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3Rvcnk6IHRoaXMuZGlyZWN0b3J5LFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgfSBhcyBhbnkpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0cmVhbWluZ1Rhc2sgPSAoYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwcm9tcHRQcm9taXNlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXN1bHQuZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgSW52YWxpZCByZXNwb25zZSBmcm9tIE9wZW5Db2RlOiAke0pTT04uc3RyaW5naWZ5KHJlc3VsdC5lcnJvcil9YCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IHJlc3VsdC5kYXRhO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRleHRQYXJ0ID0gcmVzcG9uc2UucGFydHM/LmZpbmQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChwYXJ0OiBhbnkpID0+IHBhcnQudHlwZSA9PT0gXCJ0ZXh0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpbmFsQ29udGVudCA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICh0ZXh0UGFydCBhcyBhbnkpPy50ZXh0IHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiTm8gY29udGVudCByZWNlaXZlZFwiO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2ltdWxhdGUgc3RyZWFtaW5nIGJ5IHdyaXRpbmcgY2h1bmtzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2h1bmtzID0gdGhpcy5zcGxpdEludG9DaHVua3MoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbmFsQ29udGVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgMTAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlbmNvZGVyID0gbmV3IFRleHRFbmNvZGVyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBjaHVuayBvZiBjaHVua3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgd3JpdGVyLndyaXRlKGVuY29kZXIuZW5jb2RlKGNodW5rKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChyZXNvbHZlLCA1MCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgY2xvc2VPbmNlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgY29udGVudDogZmluYWxDb250ZW50IH07XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IGFib3J0T25jZShlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cmVhbTogc3RyZWFtLnJlYWRhYmxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGU6IHN0cmVhbWluZ1Rhc2ssXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gUmVhbCBzdHJlYW1pbmc6IHVzZSBwcm9tcHRfYXN5bmMgYW5kIGNvbnN1bWUgdGhlIGV2ZW50IFNTRSBzdHJlYW0uXG4gICAgICAgICAgICAgICAgY29uc3QgZW5jb2RlciA9IG5ldyBUZXh0RW5jb2RlcigpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGlkbGVUaW1lb3V0RXJyb3IgPSBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgIGBQcm9tcHQgaWRsZSB0aW1lb3V0IGFmdGVyICR7dGhpcy5wcm9tcHRUaW1lb3V0fW1zYCxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGNvbnN0IGhhcmRUaW1lb3V0RXJyb3IgPSBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgIGBQcm9tcHQgaGFyZCB0aW1lb3V0IGFmdGVyICR7dGhpcy5wcm9tcHRUaW1lb3V0ICogNX1tc2AsXG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgICAgICAgICAgICAgbGV0IGlkbGVUaW1lcjogUmV0dXJuVHlwZTx0eXBlb2Ygc2V0VGltZW91dD4gfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgbGV0IGhhcmRUaW1lcjogUmV0dXJuVHlwZTx0eXBlb2Ygc2V0VGltZW91dD4gfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgbGV0IGJ5dGVzV3JpdHRlbiA9IDA7XG4gICAgICAgICAgICAgICAgbGV0IGxhc3RQcm9ncmVzc1RpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgICAgIGxldCBpZGxlVGltZWRPdXQgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgIC8vIEhhcmQgdGltZW91dCAtIG5ldmVyIHJlc2V0c1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXJ0SGFyZFRpbWVyID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaGFyZFRpbWVyKSBjbGVhclRpbWVvdXQoaGFyZFRpbWVyKTtcbiAgICAgICAgICAgICAgICAgICAgaGFyZFRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2cud2FybihcIkhhcmQgdGltZW91dCByZWFjaGVkLCBhYm9ydGluZ1wiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXRNczogdGhpcy5wcm9tcHRUaW1lb3V0ICogNSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyLmFib3J0KGhhcmRUaW1lb3V0RXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWdub3JlXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sIHRoaXMucHJvbXB0VGltZW91dCAqIDUpOyAvLyA1eCBpZGxlIHRpbWVvdXQgYXMgaGFyZCBjZWlsaW5nXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIC8vIElkbGUgdGltZXIgLSByZXNldHMgb25seSBvbiByZWxldmFudCBwcm9ncmVzc1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc2V0SWRsZVRpbWVyID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaWRsZVRpbWVyKSBjbGVhclRpbWVvdXQoaWRsZVRpbWVyKTtcbiAgICAgICAgICAgICAgICAgICAgaWRsZVRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZGxlVGltZWRPdXQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nLndhcm4oXCJJZGxlIHRpbWVvdXQgcmVhY2hlZCwgYWJvcnRpbmdcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0TXM6IHRoaXMucHJvbXB0VGltZW91dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBieXRlc1dyaXR0ZW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdFByb2dyZXNzTXNBZ286IERhdGUubm93KCkgLSBsYXN0UHJvZ3Jlc3NUaW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXIuYWJvcnQoaWRsZVRpbWVvdXRFcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpZ25vcmVcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSwgdGhpcy5wcm9tcHRUaW1lb3V0KTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgY29uc3Qgc3RyZWFtaW5nVGFzayA9IChhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydEhhcmRUaW1lcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzZXRJZGxlVGltZXIoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXNlck1lc3NhZ2VJZCA9IHRoaXMuZ2VuZXJhdGVNZXNzYWdlSWQoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmRlYnVnKFwiU2VuZGluZyBwcm9tcHQgdG8gT3BlbkNvZGVcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlTGVuZ3RoOiBtZXNzYWdlLmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyTWVzc2FnZUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0ICh0aGlzLmNsaWVudCBhcyBhbnkpLnNlc3Npb24ucHJvbXB0QXN5bmMoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvZHk6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUlEOiB1c2VyTWVzc2FnZUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0czogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwidGV4dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IG1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlcnk6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0b3J5OiB0aGlzLmRpcmVjdG9yeSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpZ25hbDogY29udHJvbGxlci5zaWduYWwsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmRlYnVnKFwiU3Vic2NyaWJpbmcgdG8gZXZlbnRzXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0b3J5OiB0aGlzLmRpcmVjdG9yeSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBldmVudHNSZXN1bHQgPSBhd2FpdCAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jbGllbnQgYXMgYW55XG4gICAgICAgICAgICAgICAgICAgICAgICApLmV2ZW50LnN1YnNjcmliZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlcnk6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0b3J5OiB0aGlzLmRpcmVjdG9yeSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpZ25hbDogY29udHJvbGxlci5zaWduYWwsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNvbnRlbnQgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGVtaXR0ZWRUZXh0ID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBldmVudENvdW50ID0gMDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmRlYnVnKFwiU3RhcnRpbmcgZXZlbnQgc3RyZWFtIHByb2Nlc3NpbmdcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgYXdhaXQgKGNvbnN0IGV2ZW50IG9mIGV2ZW50c1Jlc3VsdC5zdHJlYW0gYXMgQXN5bmNHZW5lcmF0b3I8YW55Pikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50Q291bnQrKztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFZlcmJvc2UgZGVidWcgbG9nZ2luZyBmb3IgYWxsIGV2ZW50c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcIlJlY2VpdmVkIGV2ZW50XCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudFR5cGU6IGV2ZW50Py50eXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudENvdW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNQcm9wZXJ0aWVzOiAhIWV2ZW50Py5wcm9wZXJ0aWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyQWJvcnRlZDogY29udHJvbGxlci5zaWduYWwuYWJvcnRlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb250cm9sbGVyLnNpZ25hbC5hYm9ydGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQ29udHJvbGxlciBhYm9ydGVkLCBicmVha2luZyBldmVudCBsb29wXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50Q291bnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWV2ZW50IHx8IHR5cGVvZiBldmVudCAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZGVidWcoXCJTa2lwcGluZyBub24tb2JqZWN0IGV2ZW50XCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50Q291bnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXZlbnQudHlwZSA9PT0gXCJtZXNzYWdlLnVwZGF0ZWRcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbmZvID0gKGV2ZW50IGFzIGFueSkucHJvcGVydGllcz8uaW5mbztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZGVidWcoXCJNZXNzYWdlIHVwZGF0ZWQgZXZlbnRcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRDb3VudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm9Sb2xlOiBpbmZvPy5yb2xlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mb1Nlc3Npb25JZDogaW5mbz8uc2Vzc2lvbklELFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mb1BhcmVudElkOiBpbmZvPy5wYXJlbnRJRCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm9JZDogaW5mbz8uaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1JlbGV2YW50U2Vzc2lvbjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvPy5zZXNzaW9uSUQgPT09IHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzQXNzaXN0YW50OiBpbmZvPy5yb2xlID09PSBcImFzc2lzdGFudFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNSZXBseVRvVXNlcjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvPy5wYXJlbnRJRCA9PT0gdXNlck1lc3NhZ2VJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUHJpbWFyeSBpZGVudGlmaWNhdGlvbjogZXhhY3QgbWF0Y2ggb24gcGFyZW50SURcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mbz8ucm9sZSA9PT0gXCJhc3Npc3RhbnRcIiAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mbz8uc2Vzc2lvbklEID09PSBzZXNzaW9uSWQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8/LnBhcmVudElEID09PSB1c2VyTWVzc2FnZUlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzaXN0YW50TWVzc2FnZUlkID0gaW5mby5pZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIklkZW50aWZpZWQgYXNzaXN0YW50IG1lc3NhZ2UgKGV4YWN0IHBhcmVudElEIG1hdGNoKVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3Npc3RhbnRNZXNzYWdlSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmFsbGJhY2s6IGlmIHdlIGhhdmVuJ3QgaWRlbnRpZmllZCBhbiBhc3Npc3RhbnQgbWVzc2FnZSB5ZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFjY2VwdCBhc3Npc3RhbnQgbWVzc2FnZXMgaW4gdGhlIHNhbWUgc2Vzc2lvbiBldmVuIGlmIHBhcmVudElEIGRvZXNuJ3QgbWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBoYW5kbGVzIGNhc2VzIHdoZXJlIHBhcmVudElEIGlzIHVuZGVmaW5lZCBvciBoYXMgYSBkaWZmZXJlbnQgZm9ybWF0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIWFzc2lzdGFudE1lc3NhZ2VJZCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mbz8ucm9sZSA9PT0gXCJhc3Npc3RhbnRcIiAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mbz8uc2Vzc2lvbklEID09PSBzZXNzaW9uSWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZGVidWcoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJJZGVudGlmaWVkIGFzc2lzdGFudCBtZXNzYWdlIChmYWxsYmFjayAtIG5vIGV4YWN0IHBhcmVudElEIG1hdGNoKVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3Npc3RhbnRNZXNzYWdlSWQ6IGluZm8uaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm9QYXJlbnRJZDogaW5mbz8ucGFyZW50SUQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJNZXNzYWdlSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3Npc3RhbnRNZXNzYWdlSWQgPSBpbmZvLmlkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUmVzZXQgaWRsZSB0aW1lciBvbiBBTlkgYXNzaXN0YW50IG1lc3NhZ2UgYWN0aXZpdHlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBwcmV2ZW50cyB0aW1lb3V0cyB3aGVuIGNvcnJlbGF0aW9uIGlzIGFtYmlndW91c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvPy5yb2xlID09PSBcImFzc2lzdGFudFwiICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvPy5zZXNzaW9uSUQgPT09IHNlc3Npb25JZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RQcm9ncmVzc1RpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzZXRJZGxlVGltZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2lzdGFudE1lc3NhZ2VJZCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mbz8uaWQgPT09IGFzc2lzdGFudE1lc3NhZ2VJZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmZvPy5lcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVyck5hbWUgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvLmVycm9yLm5hbWUgfHwgXCJPcGVuQ29kZUVycm9yXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyTXNnID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mby5lcnJvci5kYXRhPy5tZXNzYWdlIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mby5lcnJvci5kYXRhIHx8IHt9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5lcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJBc3Npc3RhbnQgZXJyb3IgaW4gbWVzc2FnZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck5hbWU6IGVyck5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVyck1zZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7ZXJyTmFtZX06ICR7ZXJyTXNnfWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZm8/LnRpbWU/LmNvbXBsZXRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJBc3Npc3RhbnQgbWVzc2FnZSBjb21wbGV0ZWRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzaXN0YW50TWVzc2FnZUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGVkQXQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mby50aW1lLmNvbXBsZXRlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09IFwibWVzc2FnZS5wYXJ0LnVwZGF0ZWRcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBPbmx5IHJlc2V0IHRpbWVyIGFuZCB0cmFjayBwcm9ncmVzcyBmb3IgcmVsZXZhbnQgdXBkYXRlc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJ0ID0gKGV2ZW50IGFzIGFueSkucHJvcGVydGllc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPy5wYXJ0IGFzIGFueTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZGVidWcoXCJNZXNzYWdlIHBhcnQgdXBkYXRlZFwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudENvdW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzUGFydDogISFwYXJ0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydFR5cGU6IHBhcnQ/LnR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0U2Vzc2lvbklkOiBwYXJ0Py5zZXNzaW9uSUQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0TWVzc2FnZUlkOiBwYXJ0Py5tZXNzYWdlSUQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3Npc3RhbnRNZXNzYWdlSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1JlbGV2YW50OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2lzdGFudE1lc3NhZ2VJZCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnQ/LnNlc3Npb25JRCA9PT0gc2Vzc2lvbklkICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydD8ubWVzc2FnZUlEID09PSBhc3Npc3RhbnRNZXNzYWdlSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghYXNzaXN0YW50TWVzc2FnZUlkKSBjb250aW51ZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBIYW5kbGUgdG9vbCBwYXJ0cyAoY2FwdHVyZSB0b29sIGludm9jYXRpb25zKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFydD8udHlwZSA9PT0gXCJ0b29sXCIgJiYgdG9vbEludm9jYXRpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0b29sSWQgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnQudG9vbElkIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydC5pZCB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGB0b29sLSR7ZXZlbnRDb3VudH1gO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdG9vbE5hbWUgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnQudG9vbE5hbWUgfHwgcGFydC5uYW1lIHx8IFwidW5rbm93blwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdG9vbElucHV0ID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0LmlucHV0IHx8IHBhcnQucGFyYW1ldGVycyB8fCB7fTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdGhpcyBpcyBhIG5ldyB0b29sIGNhbGwgb3IgYW4gdXBkYXRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBleGlzdGluZ1Rvb2xJbmRleCA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbEludm9jYXRpb25zLmZpbmRJbmRleChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHQpID0+IHQuaWQgPT09IHRvb2xJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXhpc3RpbmdUb29sSW5kZXggPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSBleGlzdGluZyB0b29sIGludm9jYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBleGlzdGluZyA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xJbnZvY2F0aW9uc1tleGlzdGluZ1Rvb2xJbmRleF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhpc3Rpbmcub3V0cHV0ID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydC5yZXN1bHQgPz9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydC5vdXRwdXQgPz9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhpc3Rpbmcub3V0cHV0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nLnN0YXR1cyA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnQuc3RhdHVzID09PSBcImVycm9yXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gXCJlcnJvclwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFwib2tcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleGlzdGluZy5lcnJvciA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnQuZXJyb3IgPz8gZXhpc3RpbmcuZXJyb3I7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhpc3RpbmcuY29tcGxldGVkQXQgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0LmNvbXBsZXRlZEF0ID8/IG5vdztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcIlRvb2wgaW52b2NhdGlvbiB1cGRhdGVkXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IGV4aXN0aW5nLnN0YXR1cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTmV3IHRvb2wgaW52b2NhdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRvb2xJbnZvY2F0aW9uID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogdG9vbElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiB0b29sTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQ6IHRvb2xJbnB1dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0OiBwYXJ0LnJlc3VsdCA/PyBwYXJ0Lm91dHB1dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydC5zdGF0dXMgPT09IFwiZXJyb3JcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gKFwiZXJyb3JcIiBhcyBjb25zdClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IChcIm9rXCIgYXMgY29uc3QpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogcGFydC5lcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRlZEF0OiBwYXJ0LnN0YXJ0ZWRBdCA/PyBub3csXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlZEF0OiBwYXJ0LmNvbXBsZXRlZEF0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbEludm9jYXRpb25zLnB1c2godG9vbEludm9jYXRpb24pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmRlYnVnKFwiVG9vbCBpbnZvY2F0aW9uIHN0YXJ0ZWRcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbE5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0OiBKU09OLnN0cmluZ2lmeShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xJbnB1dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKS5zbGljZSgwLCAyMDApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBEb24ndCBza2lwIG5vbi1yZWxldmFudCB0b29sIHBhcnRzIC0gd2Ugd2FudCB0byBjYXB0dXJlIGFsbCB0b29sIGV2ZW50c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZm9yIHRoZSBhc3Npc3RhbnQgbWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnQuc2Vzc2lvbklEICE9PSBzZXNzaW9uSWQgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0Lm1lc3NhZ2VJRCAhPT0gYXNzaXN0YW50TWVzc2FnZUlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTdGlsbCB0cmFjayBpdCBidXQgZG9uJ3QgcHJvY2VzcyBmb3Igb3V0cHV0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJlc2V0IGlkbGUgdGltZXIgb24gdG9vbCBwcm9ncmVzc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RQcm9ncmVzc1RpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc2V0SWRsZVRpbWVyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFwYXJ0IHx8IHBhcnQudHlwZSAhPT0gXCJ0ZXh0XCIpIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFydC5zZXNzaW9uSUQgIT09IHNlc3Npb25JZCkgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYXJ0Lm1lc3NhZ2VJRCAhPT0gYXNzaXN0YW50TWVzc2FnZUlkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmF3RGVsdGEgPSAoZXZlbnQgYXMgYW55KS5wcm9wZXJ0aWVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/LmRlbHRhO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBkZWx0YVRleHQ6IHN0cmluZyB8IHVuZGVmaW5lZDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBQcmVmZXIgZGlmZmluZyBhZ2FpbnN0IHRoZSBmdWxsIGBwYXJ0LnRleHRgIHdoZW4gcHJlc2VudC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU29tZSBPcGVuQ29kZSBzZXJ2ZXIgdmVyc2lvbnMgZW1pdCBtdWx0aXBsZSB0ZXh0IHBhcnRzIG9yIHNlbmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYGRlbHRhYCBhcyB0aGUgKmZ1bGwqIHRleHQsIHdoaWNoIHdvdWxkIGR1cGxpY2F0ZSBvdXRwdXQuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcGFydC50ZXh0ID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXh0ID0gcGFydC50ZXh0O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV4dC5zdGFydHNXaXRoKGVtaXR0ZWRUZXh0KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbHRhVGV4dCA9IG5leHQuc2xpY2UoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVtaXR0ZWRUZXh0Lmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVtaXR0ZWRUZXh0ID0gbmV4dDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZW1pdHRlZFRleHQuc3RhcnRzV2l0aChuZXh0KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFN0YWxlL2R1cGxpY2F0ZSB1cGRhdGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWx0YVRleHQgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGYWxsYmFjazogdHJlYXQgYXMgYWRkaXRpdmUgY2h1bmtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWx0YVRleHQgPSBuZXh0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVtaXR0ZWRUZXh0ICs9IG5leHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHJhd0RlbHRhID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWx0YVRleHQgPSByYXdEZWx0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVtaXR0ZWRUZXh0ICs9IHJhd0RlbHRhO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFkZWx0YVRleHQpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSBwcm9ncmVzcyB0cmFja2luZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0UHJvZ3Jlc3NUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnl0ZXNXcml0dGVuICs9IGRlbHRhVGV4dC5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc2V0SWRsZVRpbWVyKCk7IC8vIE9ubHkgcmVzZXQgb24gYWN0dWFsIGNvbnRlbnQgcHJvZ3Jlc3NcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZGVidWcoXCJXcml0aW5nIGRlbHRhIHRvIHN0cmVhbVwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWx0YUxlbmd0aDogZGVsdGFUZXh0Lmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsQnl0ZXNXcml0dGVuOiBieXRlc1dyaXR0ZW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50TGVuZ3RoOiBjb250ZW50Lmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudCArPSBkZWx0YVRleHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHdyaXRlci53cml0ZShlbmNvZGVyLmVuY29kZShkZWx0YVRleHQpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcIkV2ZW50IHN0cmVhbSBlbmRlZFwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50Q291bnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxCeXRlc1dyaXR0ZW46IGJ5dGVzV3JpdHRlbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50TGVuZ3RoOiBjb250ZW50Lmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyQWJvcnRlZDogY29udHJvbGxlci5zaWduYWwuYWJvcnRlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZGxlVGltZWRPdXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzaXN0YW50TWVzc2FnZUlkRm91bmQ6ICEhYXNzaXN0YW50TWVzc2FnZUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IGNsb3NlT25jZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBjb250ZW50IHx8IFwiTm8gY29udGVudCByZWNlaXZlZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpYWdub3N0aWNzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ5dGVzV3JpdHRlbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudExlbmd0aDogY29udGVudC5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkbGVUaW1lZE91dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzaXN0YW50TWVzc2FnZUlkRm91bmQ6ICEhYXNzaXN0YW50TWVzc2FnZUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudENvdW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmVycm9yKFwiU3RyZWFtaW5nIHRhc2sgZXJyb3JcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBFcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBlcnJvci5tZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFN0cmluZyhlcnJvciksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlckFib3J0ZWQ6IGNvbnRyb2xsZXIuc2lnbmFsLmFib3J0ZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnl0ZXNXcml0dGVuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkbGVUaW1lZE91dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3Npc3RhbnRNZXNzYWdlSWRGb3VuZDogISFhc3Npc3RhbnRNZXNzYWdlSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFByZXNlcnZlIHRoZSBhY3R1YWwgdGltZW91dCByZWFzb24gc28gZGlhZ25vc3RpY3Mgc3RheSBhY2N1cmF0ZS5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb250cm9sbGVyLnNpZ25hbC5hYm9ydGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYWJvcnRFcnJvciA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXIuc2lnbmFsLnJlYXNvbiBpbnN0YW5jZW9mIEVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IGNvbnRyb2xsZXIuc2lnbmFsLnJlYXNvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBpZGxlVGltZWRPdXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBpZGxlVGltZW91dEVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogaGFyZFRpbWVvdXRFcnJvcjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBhYm9ydE9uY2UoYWJvcnRFcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgYWJvcnRFcnJvcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IGFib3J0T25jZShlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpZGxlVGltZXIpIGNsZWFyVGltZW91dChpZGxlVGltZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGhhcmRUaW1lcikgY2xlYXJUaW1lb3V0KGhhcmRUaW1lcik7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY29udHJvbGxlci5zaWduYWwuYWJvcnRlZCkgY29udHJvbGxlci5hYm9ydCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWdub3JlXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KSgpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgc3RyZWFtOiBzdHJlYW0ucmVhZGFibGUsXG4gICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlOiBzdHJlYW1pbmdUYXNrLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGxhc3RFcnJvciA9XG4gICAgICAgICAgICAgICAgICAgIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvciA6IG5ldyBFcnJvcihTdHJpbmcoZXJyb3IpKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGlzUmF0ZUxpbWl0ID0gdGhpcy5pc1JhdGVMaW1pdEVycm9yKGxhc3RFcnJvcik7XG5cbiAgICAgICAgICAgICAgICBpZiAoYXR0ZW1wdCA9PT0gdGhpcy5yZXRyeUF0dGVtcHRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IGRlbGF5ID0gdGhpcy5nZXRCYWNrb2ZmRGVsYXkoYXR0ZW1wdCwgaXNSYXRlTGltaXQpO1xuXG4gICAgICAgICAgICAgICAgbG9nLndhcm4oXCJPcGVuQ29kZSBhdHRlbXB0IGZhaWxlZDsgcmV0cnlpbmdcIiwge1xuICAgICAgICAgICAgICAgICAgICBhdHRlbXB0LFxuICAgICAgICAgICAgICAgICAgICByZXRyeUF0dGVtcHRzOiB0aGlzLnJldHJ5QXR0ZW1wdHMsXG4gICAgICAgICAgICAgICAgICAgIGRlbGF5TXM6IGRlbGF5LFxuICAgICAgICAgICAgICAgICAgICBpc1JhdGVMaW1pdCxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGxhc3RFcnJvci5tZXNzYWdlLFxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgZGVsYXkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBGYWlsZWQgdG8gc3RyZWFtIG1lc3NhZ2UgYWZ0ZXIgJHt0aGlzLnJldHJ5QXR0ZW1wdHN9IGF0dGVtcHRzOiAke2xhc3RFcnJvcj8ubWVzc2FnZSB8fCBcIlVua25vd24gZXJyb3JcIn1gLFxuICAgICAgICApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNwbGl0IHRleHQgaW50byBjaHVua3MgZm9yIHN0cmVhbWluZyBzaW11bGF0aW9uXG4gICAgICovXG4gICAgcHJpdmF0ZSBzcGxpdEludG9DaHVua3ModGV4dDogc3RyaW5nLCBjaHVua1NpemU6IG51bWJlcik6IHN0cmluZ1tdIHtcbiAgICAgICAgY29uc3QgY2h1bmtzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRleHQubGVuZ3RoOyBpICs9IGNodW5rU2l6ZSkge1xuICAgICAgICAgICAgY2h1bmtzLnB1c2godGV4dC5zbGljZShpLCBpICsgY2h1bmtTaXplKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNodW5rcy5sZW5ndGggPiAwID8gY2h1bmtzIDogW3RleHRdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEhhbmRsZSBzZW5kaW5nIGEgbWVzc2FnZSB3aXRoIGVycm9yIGhhbmRsaW5nIGFuZCByZXRyaWVzXG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyBoYW5kbGVTZW5kTWVzc2FnZShcbiAgICAgICAgc2Vzc2lvbklkOiBzdHJpbmcsXG4gICAgICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgICApOiBQcm9taXNlPE1lc3NhZ2VSZXNwb25zZT4ge1xuICAgICAgICBsZXQgbGFzdEVycm9yOiBFcnJvciB8IG51bGwgPSBudWxsO1xuXG4gICAgICAgIGZvciAobGV0IGF0dGVtcHQgPSAxOyBhdHRlbXB0IDw9IHRoaXMucmV0cnlBdHRlbXB0czsgYXR0ZW1wdCsrKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRpbWVvdXRFcnJvciA9IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgYFByb21wdCB0aW1lb3V0IGFmdGVyICR7dGhpcy5wcm9tcHRUaW1lb3V0fW1zYCxcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgY29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICAgICAgICAgICAgICBjb25zdCB0aW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlci5hYm9ydCh0aW1lb3V0RXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlnbm9yZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgdGhpcy5wcm9tcHRUaW1lb3V0KTtcblxuICAgICAgICAgICAgICAgIGxldCByZXN1bHQ6IGFueTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBhd2FpdCB0aGlzLmNsaWVudC5zZXNzaW9uLnByb21wdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBib2R5OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUlEOiB0aGlzLmdlbmVyYXRlTWVzc2FnZUlkKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJ0ZXh0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBtZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgcXVlcnk6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3Rvcnk6IHRoaXMuZGlyZWN0b3J5LFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpZ25hbDogY29udHJvbGxlci5zaWduYWwsXG4gICAgICAgICAgICAgICAgICAgIH0gYXMgYW55KTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29udHJvbGxlci5zaWduYWwuYWJvcnRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgdGltZW91dEVycm9yO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKCFyZXN1bHQuZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgICBgSW52YWxpZCByZXNwb25zZSBmcm9tIE9wZW5Db2RlOiAke0pTT04uc3RyaW5naWZ5KHJlc3VsdC5lcnJvcil9YCxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBFeHRyYWN0IGNvbnRlbnQgZnJvbSByZXNwb25zZVxuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gcmVzdWx0LmRhdGE7XG5cbiAgICAgICAgICAgICAgICAvLyBGaW5kIHRleHQgY29udGVudCBmcm9tIHJlc3BvbnNlIHBhcnRzXG4gICAgICAgICAgICAgICAgY29uc3QgdGV4dFBhcnQgPSByZXNwb25zZS5wYXJ0cz8uZmluZChcbiAgICAgICAgICAgICAgICAgICAgKHBhcnQ6IGFueSkgPT4gcGFydC50eXBlID09PSBcInRleHRcIixcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIHJldHVybiB7IGNvbnRlbnQ6IHRleHRQYXJ0Py50ZXh0IHx8IFwiTm8gY29udGVudCByZWNlaXZlZFwiIH07XG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGxhc3RFcnJvciA9XG4gICAgICAgICAgICAgICAgICAgIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvciA6IG5ldyBFcnJvcihTdHJpbmcoZXJyb3IpKTtcblxuICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIHRoaXMgaXMgYSByYXRlIGxpbWl0IGVycm9yXG4gICAgICAgICAgICAgICAgY29uc3QgaXNSYXRlTGltaXQgPSB0aGlzLmlzUmF0ZUxpbWl0RXJyb3IobGFzdEVycm9yKTtcblxuICAgICAgICAgICAgICAgIGlmIChhdHRlbXB0ID09PSB0aGlzLnJldHJ5QXR0ZW1wdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gV2FpdCBiZWZvcmUgcmV0cnlpbmcgd2l0aCBleHBvbmVudGlhbCBiYWNrb2ZmXG4gICAgICAgICAgICAgICAgY29uc3QgZGVsYXkgPSB0aGlzLmdldEJhY2tvZmZEZWxheShhdHRlbXB0LCBpc1JhdGVMaW1pdCk7XG5cbiAgICAgICAgICAgICAgICBsb2cud2FybihcIk9wZW5Db2RlIGF0dGVtcHQgZmFpbGVkOyByZXRyeWluZ1wiLCB7XG4gICAgICAgICAgICAgICAgICAgIGF0dGVtcHQsXG4gICAgICAgICAgICAgICAgICAgIHJldHJ5QXR0ZW1wdHM6IHRoaXMucmV0cnlBdHRlbXB0cyxcbiAgICAgICAgICAgICAgICAgICAgZGVsYXlNczogZGVsYXksXG4gICAgICAgICAgICAgICAgICAgIGlzUmF0ZUxpbWl0LFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogbGFzdEVycm9yLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gc2V0VGltZW91dChyZXNvbHZlLCBkZWxheSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYEZhaWxlZCB0byBzZW5kIG1lc3NhZ2UgYWZ0ZXIgJHt0aGlzLnJldHJ5QXR0ZW1wdHN9IGF0dGVtcHRzOiAke2xhc3RFcnJvcj8ubWVzc2FnZSB8fCBcIlVua25vd24gZXJyb3JcIn1gLFxuICAgICAgICApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGVycm9yIGlzIGEgcmF0ZSBsaW1pdCBlcnJvclxuICAgICAqL1xuICAgIHByaXZhdGUgaXNSYXRlTGltaXRFcnJvcihlcnJvcjogRXJyb3IpOiBib29sZWFuIHtcbiAgICAgICAgY29uc3QgZXJyID0gZXJyb3IgYXMgYW55O1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgZXJyLnN0YXR1cyA9PT0gNDI5IHx8XG4gICAgICAgICAgICAvcmF0ZSBsaW1pdHxxdW90YXxvdmVybG9hZGVkfGNhcGFjaXR5L2kudGVzdChlcnJvci5tZXNzYWdlKVxuICAgICAgICApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENhbGN1bGF0ZSBiYWNrb2ZmIGRlbGF5IHdpdGggaml0dGVyXG4gICAgICovXG4gICAgcHJpdmF0ZSBnZXRCYWNrb2ZmRGVsYXkoYXR0ZW1wdDogbnVtYmVyLCBpc1JhdGVMaW1pdDogYm9vbGVhbik6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IGJhc2UgPSBpc1JhdGVMaW1pdCA/IDUwMDAgOiAxMDAwOyAvLyA1cyBmb3IgcmF0ZSBsaW1pdCwgMXMgb3RoZXJ3aXNlXG4gICAgICAgIGNvbnN0IGV4cG9uZW50aWFsID0gYmFzZSAqIDIgKiogKGF0dGVtcHQgLSAxKTtcbiAgICAgICAgY29uc3Qgaml0dGVyID0gTWF0aC5yYW5kb20oKSAqIDEwMDA7IC8vIEFkZCB1cCB0byAxcyBqaXR0ZXJcbiAgICAgICAgcmV0dXJuIE1hdGgubWluKGV4cG9uZW50aWFsICsgaml0dGVyLCA2MDAwMCk7IC8vIG1heCA2MHNcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBIYW5kbGUgc2Vzc2lvbiBjbG9zdXJlIHdpdGggZXJyb3IgaGFuZGxpbmdcbiAgICAgKi9cbiAgICBwcml2YXRlIGFzeW5jIGhhbmRsZVNlc3Npb25DbG9zZShzZXNzaW9uSWQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gTm90ZTogT3BlbkNvZGUgU0RLIG1pZ2h0IG5vdCBoYXZlIGFuIGV4cGxpY2l0IGNsb3NlIG1ldGhvZFxuICAgICAgICAgICAgLy8gRm9yIG5vdywgd2UnbGwganVzdCByZW1vdmUgZnJvbSBvdXIgYWN0aXZlIHNlc3Npb25zXG4gICAgICAgICAgICAvLyBJbiBhIHJlYWwgaW1wbGVtZW50YXRpb24sIHdlJ2QgY2FsbCBTREsncyBkZWxldGUgbWV0aG9kIGlmIGF2YWlsYWJsZVxuICAgICAgICAgICAgbG9nLmRlYnVnKFwiU2Vzc2lvbiBjbG9zZWRcIiwgeyBzZXNzaW9uSWQgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPVxuICAgICAgICAgICAgICAgIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgICAgIGxvZy53YXJuKFwiRmFpbGVkIHRvIGNsb3NlIHNlc3Npb25cIiwge1xuICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZSBhIHVuaXF1ZSBzZXNzaW9uIElEIGlmIFNESyBkb2Vzbid0IHByb3ZpZGUgb25lXG4gICAgICovXG4gICAgcHJpdmF0ZSBnZW5lcmF0ZVNlc3Npb25JZCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gYHNlc3Npb24tJHtEYXRlLm5vdygpfS0ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA5KX1gO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlIGEgcHJvcGVybHkgZm9ybWF0dGVkIG1lc3NhZ2UgSUQgd2l0aCBtc2dfIHByZWZpeFxuICAgICAqIEZvcm1hdDogbXNnXzx0aW1lc3RhbXA+XzxyYW5kb20+XG4gICAgICovXG4gICAgcHJpdmF0ZSBnZW5lcmF0ZU1lc3NhZ2VJZCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gYG1zZ18ke0RhdGUubm93KCl9XyR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDIsIDgpfWA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xlYW51cCBtZXRob2QgdG8gY2xvc2UgYWxsIHNlc3Npb25zIGFuZCBzZXJ2ZXJcbiAgICAgKi9cbiAgICBhc3luYyBjbGVhbnVwKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbG9nLmRlYnVnKFwiU3RhcnRpbmcgY2xlYW51cC4uLlwiLCB7XG4gICAgICAgICAgICAgICAgYWN0aXZlU2Vzc2lvbnM6IHRoaXMuYWN0aXZlU2Vzc2lvbnMuc2l6ZSxcbiAgICAgICAgICAgICAgICBoYXNTZXJ2ZXI6ICEhdGhpcy5zZXJ2ZXIsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gQ2xvc2UgYWxsIGFjdGl2ZSBzZXNzaW9uc1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5jbG9zZUFsbFNlc3Npb25zKCk7XG5cbiAgICAgICAgICAgIC8vIFN0b3AgdGhlIE9wZW5Db2RlIHNlcnZlciBpZiB3ZSBzdGFydGVkIG9uZVxuICAgICAgICAgICAgaWYgKHRoaXMuc2VydmVyKSB7XG4gICAgICAgICAgICAgICAgbG9nLmluZm8oXCJDbG9zaW5nIHNwYXduZWQgT3BlbkNvZGUgc2VydmVyXCIpO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VydmVyLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VydmVyID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgbG9nLmluZm8oXCJPcGVuQ29kZSBzZXJ2ZXIgY2xvc2VkIHN1Y2Nlc3NmdWxseVwiKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1zZyA9XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIGxvZy5lcnJvcihcIkVycm9yIGNsb3NpbmcgT3BlbkNvZGUgc2VydmVyXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvck1zZyxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsb2cuZGVidWcoXG4gICAgICAgICAgICAgICAgICAgIFwiTm8gc3Bhd25lZCBzZXJ2ZXIgdG8gY2xvc2UgKGNvbm5lY3RlZCB0byBleGlzdGluZyBzZXJ2ZXIpXCIsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbG9nLmluZm8oXCJDbGVhbnVwIGNvbXBsZXRlXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNc2cgPVxuICAgICAgICAgICAgICAgIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgICAgIGxvZy5lcnJvcihcIkVycm9yIGR1cmluZyBPcGVuQ29kZSBjbGllbnQgY2xlYW51cFwiLCB7XG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yTXNnLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG59XG4iLAogICAgIi8vIFRoaXMgZmlsZSBpcyBhdXRvLWdlbmVyYXRlZCBieSBAaGV5LWFwaS9vcGVuYXBpLXRzXG5leHBvcnQgY29uc3QgY3JlYXRlU3NlQ2xpZW50ID0gKHsgb25Tc2VFcnJvciwgb25Tc2VFdmVudCwgcmVzcG9uc2VUcmFuc2Zvcm1lciwgcmVzcG9uc2VWYWxpZGF0b3IsIHNzZURlZmF1bHRSZXRyeURlbGF5LCBzc2VNYXhSZXRyeUF0dGVtcHRzLCBzc2VNYXhSZXRyeURlbGF5LCBzc2VTbGVlcEZuLCB1cmwsIC4uLm9wdGlvbnMgfSkgPT4ge1xuICAgIGxldCBsYXN0RXZlbnRJZDtcbiAgICBjb25zdCBzbGVlcCA9IHNzZVNsZWVwRm4gPz8gKChtcykgPT4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgbXMpKSk7XG4gICAgY29uc3QgY3JlYXRlU3RyZWFtID0gYXN5bmMgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgbGV0IHJldHJ5RGVsYXkgPSBzc2VEZWZhdWx0UmV0cnlEZWxheSA/PyAzMDAwO1xuICAgICAgICBsZXQgYXR0ZW1wdCA9IDA7XG4gICAgICAgIGNvbnN0IHNpZ25hbCA9IG9wdGlvbnMuc2lnbmFsID8/IG5ldyBBYm9ydENvbnRyb2xsZXIoKS5zaWduYWw7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICBpZiAoc2lnbmFsLmFib3J0ZWQpXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBhdHRlbXB0Kys7XG4gICAgICAgICAgICBjb25zdCBoZWFkZXJzID0gb3B0aW9ucy5oZWFkZXJzIGluc3RhbmNlb2YgSGVhZGVyc1xuICAgICAgICAgICAgICAgID8gb3B0aW9ucy5oZWFkZXJzXG4gICAgICAgICAgICAgICAgOiBuZXcgSGVhZGVycyhvcHRpb25zLmhlYWRlcnMpO1xuICAgICAgICAgICAgaWYgKGxhc3RFdmVudElkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBoZWFkZXJzLnNldChcIkxhc3QtRXZlbnQtSURcIiwgbGFzdEV2ZW50SWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwgeyAuLi5vcHRpb25zLCBoZWFkZXJzLCBzaWduYWwgfSk7XG4gICAgICAgICAgICAgICAgaWYgKCFyZXNwb25zZS5vaylcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBTU0UgZmFpbGVkOiAke3Jlc3BvbnNlLnN0YXR1c30gJHtyZXNwb25zZS5zdGF0dXNUZXh0fWApO1xuICAgICAgICAgICAgICAgIGlmICghcmVzcG9uc2UuYm9keSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gYm9keSBpbiBTU0UgcmVzcG9uc2VcIik7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVhZGVyID0gcmVzcG9uc2UuYm9keS5waXBlVGhyb3VnaChuZXcgVGV4dERlY29kZXJTdHJlYW0oKSkuZ2V0UmVhZGVyKCk7XG4gICAgICAgICAgICAgICAgbGV0IGJ1ZmZlciA9IFwiXCI7XG4gICAgICAgICAgICAgICAgY29uc3QgYWJvcnRIYW5kbGVyID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVhZGVyLmNhbmNlbCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhdGNoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vb3BcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgc2lnbmFsLmFkZEV2ZW50TGlzdGVuZXIoXCJhYm9ydFwiLCBhYm9ydEhhbmRsZXIpO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB7IGRvbmUsIHZhbHVlIH0gPSBhd2FpdCByZWFkZXIucmVhZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRvbmUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWZmZXIgKz0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjaHVua3MgPSBidWZmZXIuc3BsaXQoXCJcXG5cXG5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWZmZXIgPSBjaHVua3MucG9wKCkgPz8gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgY2h1bmsgb2YgY2h1bmtzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbGluZXMgPSBjaHVuay5zcGxpdChcIlxcblwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkYXRhTGluZXMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgZXZlbnROYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgbGluZSBvZiBsaW5lcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobGluZS5zdGFydHNXaXRoKFwiZGF0YTpcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFMaW5lcy5wdXNoKGxpbmUucmVwbGFjZSgvXmRhdGE6XFxzKi8sIFwiXCIpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChsaW5lLnN0YXJ0c1dpdGgoXCJldmVudDpcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZSA9IGxpbmUucmVwbGFjZSgvXmV2ZW50OlxccyovLCBcIlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChsaW5lLnN0YXJ0c1dpdGgoXCJpZDpcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RFdmVudElkID0gbGluZS5yZXBsYWNlKC9eaWQ6XFxzKi8sIFwiXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGxpbmUuc3RhcnRzV2l0aChcInJldHJ5OlwiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFyc2VkID0gTnVtYmVyLnBhcnNlSW50KGxpbmUucmVwbGFjZSgvXnJldHJ5OlxccyovLCBcIlwiKSwgMTApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFOdW1iZXIuaXNOYU4ocGFyc2VkKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHJ5RGVsYXkgPSBwYXJzZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGRhdGE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhcnNlZEpzb24gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YUxpbmVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByYXdEYXRhID0gZGF0YUxpbmVzLmpvaW4oXCJcXG5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhID0gSlNPTi5wYXJzZShyYXdEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlZEpzb24gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGNoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEgPSByYXdEYXRhO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYXJzZWRKc29uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZVZhbGlkYXRvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgcmVzcG9uc2VWYWxpZGF0b3IoZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlVHJhbnNmb3JtZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEgPSBhd2FpdCByZXNwb25zZVRyYW5zZm9ybWVyKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uU3NlRXZlbnQ/Lih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50OiBldmVudE5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBsYXN0RXZlbnRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0cnk6IHJldHJ5RGVsYXksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGFMaW5lcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeWllbGQgZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIHNpZ25hbC5yZW1vdmVFdmVudExpc3RlbmVyKFwiYWJvcnRcIiwgYWJvcnRIYW5kbGVyKTtcbiAgICAgICAgICAgICAgICAgICAgcmVhZGVyLnJlbGVhc2VMb2NrKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrOyAvLyBleGl0IGxvb3Agb24gbm9ybWFsIGNvbXBsZXRpb25cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIC8vIGNvbm5lY3Rpb24gZmFpbGVkIG9yIGFib3J0ZWQ7IHJldHJ5IGFmdGVyIGRlbGF5XG4gICAgICAgICAgICAgICAgb25Tc2VFcnJvcj8uKGVycm9yKTtcbiAgICAgICAgICAgICAgICBpZiAoc3NlTWF4UmV0cnlBdHRlbXB0cyAhPT0gdW5kZWZpbmVkICYmIGF0dGVtcHQgPj0gc3NlTWF4UmV0cnlBdHRlbXB0cykge1xuICAgICAgICAgICAgICAgICAgICBicmVhazsgLy8gc3RvcCBhZnRlciBmaXJpbmcgZXJyb3JcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gZXhwb25lbnRpYWwgYmFja29mZjogZG91YmxlIHJldHJ5IGVhY2ggYXR0ZW1wdCwgY2FwIGF0IDMwc1xuICAgICAgICAgICAgICAgIGNvbnN0IGJhY2tvZmYgPSBNYXRoLm1pbihyZXRyeURlbGF5ICogMiAqKiAoYXR0ZW1wdCAtIDEpLCBzc2VNYXhSZXRyeURlbGF5ID8/IDMwMDAwKTtcbiAgICAgICAgICAgICAgICBhd2FpdCBzbGVlcChiYWNrb2ZmKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgY29uc3Qgc3RyZWFtID0gY3JlYXRlU3RyZWFtKCk7XG4gICAgcmV0dXJuIHsgc3RyZWFtIH07XG59O1xuIiwKICAgICIvLyBUaGlzIGZpbGUgaXMgYXV0by1nZW5lcmF0ZWQgYnkgQGhleS1hcGkvb3BlbmFwaS10c1xuZXhwb3J0IGNvbnN0IGdldEF1dGhUb2tlbiA9IGFzeW5jIChhdXRoLCBjYWxsYmFjaykgPT4ge1xuICAgIGNvbnN0IHRva2VuID0gdHlwZW9mIGNhbGxiYWNrID09PSBcImZ1bmN0aW9uXCIgPyBhd2FpdCBjYWxsYmFjayhhdXRoKSA6IGNhbGxiYWNrO1xuICAgIGlmICghdG9rZW4pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoYXV0aC5zY2hlbWUgPT09IFwiYmVhcmVyXCIpIHtcbiAgICAgICAgcmV0dXJuIGBCZWFyZXIgJHt0b2tlbn1gO1xuICAgIH1cbiAgICBpZiAoYXV0aC5zY2hlbWUgPT09IFwiYmFzaWNcIikge1xuICAgICAgICByZXR1cm4gYEJhc2ljICR7YnRvYSh0b2tlbil9YDtcbiAgICB9XG4gICAgcmV0dXJuIHRva2VuO1xufTtcbiIsCiAgICAiLy8gVGhpcyBmaWxlIGlzIGF1dG8tZ2VuZXJhdGVkIGJ5IEBoZXktYXBpL29wZW5hcGktdHNcbmNvbnN0IHNlcmlhbGl6ZUZvcm1EYXRhUGFpciA9IChkYXRhLCBrZXksIHZhbHVlKSA9PiB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIiB8fCB2YWx1ZSBpbnN0YW5jZW9mIEJsb2IpIHtcbiAgICAgICAgZGF0YS5hcHBlbmQoa2V5LCB2YWx1ZSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgICAgICBkYXRhLmFwcGVuZChrZXksIHZhbHVlLnRvSVNPU3RyaW5nKCkpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZGF0YS5hcHBlbmQoa2V5LCBKU09OLnN0cmluZ2lmeSh2YWx1ZSkpO1xuICAgIH1cbn07XG5jb25zdCBzZXJpYWxpemVVcmxTZWFyY2hQYXJhbXNQYWlyID0gKGRhdGEsIGtleSwgdmFsdWUpID0+IHtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIGRhdGEuYXBwZW5kKGtleSwgdmFsdWUpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZGF0YS5hcHBlbmQoa2V5LCBKU09OLnN0cmluZ2lmeSh2YWx1ZSkpO1xuICAgIH1cbn07XG5leHBvcnQgY29uc3QgZm9ybURhdGFCb2R5U2VyaWFsaXplciA9IHtcbiAgICBib2R5U2VyaWFsaXplcjogKGJvZHkpID0+IHtcbiAgICAgICAgY29uc3QgZGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuICAgICAgICBPYmplY3QuZW50cmllcyhib2R5KS5mb3JFYWNoKChba2V5LCB2YWx1ZV0pID0+IHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUuZm9yRWFjaCgodikgPT4gc2VyaWFsaXplRm9ybURhdGFQYWlyKGRhdGEsIGtleSwgdikpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VyaWFsaXplRm9ybURhdGFQYWlyKGRhdGEsIGtleSwgdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfSxcbn07XG5leHBvcnQgY29uc3QganNvbkJvZHlTZXJpYWxpemVyID0ge1xuICAgIGJvZHlTZXJpYWxpemVyOiAoYm9keSkgPT4gSlNPTi5zdHJpbmdpZnkoYm9keSwgKF9rZXksIHZhbHVlKSA9PiAodHlwZW9mIHZhbHVlID09PSBcImJpZ2ludFwiID8gdmFsdWUudG9TdHJpbmcoKSA6IHZhbHVlKSksXG59O1xuZXhwb3J0IGNvbnN0IHVybFNlYXJjaFBhcmFtc0JvZHlTZXJpYWxpemVyID0ge1xuICAgIGJvZHlTZXJpYWxpemVyOiAoYm9keSkgPT4ge1xuICAgICAgICBjb25zdCBkYXRhID0gbmV3IFVSTFNlYXJjaFBhcmFtcygpO1xuICAgICAgICBPYmplY3QuZW50cmllcyhib2R5KS5mb3JFYWNoKChba2V5LCB2YWx1ZV0pID0+IHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUuZm9yRWFjaCgodikgPT4gc2VyaWFsaXplVXJsU2VhcmNoUGFyYW1zUGFpcihkYXRhLCBrZXksIHYpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlcmlhbGl6ZVVybFNlYXJjaFBhcmFtc1BhaXIoZGF0YSwga2V5LCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZGF0YS50b1N0cmluZygpO1xuICAgIH0sXG59O1xuIiwKICAgICIvLyBUaGlzIGZpbGUgaXMgYXV0by1nZW5lcmF0ZWQgYnkgQGhleS1hcGkvb3BlbmFwaS10c1xuZXhwb3J0IGNvbnN0IHNlcGFyYXRvckFycmF5RXhwbG9kZSA9IChzdHlsZSkgPT4ge1xuICAgIHN3aXRjaCAoc3R5bGUpIHtcbiAgICAgICAgY2FzZSBcImxhYmVsXCI6XG4gICAgICAgICAgICByZXR1cm4gXCIuXCI7XG4gICAgICAgIGNhc2UgXCJtYXRyaXhcIjpcbiAgICAgICAgICAgIHJldHVybiBcIjtcIjtcbiAgICAgICAgY2FzZSBcInNpbXBsZVwiOlxuICAgICAgICAgICAgcmV0dXJuIFwiLFwiO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIFwiJlwiO1xuICAgIH1cbn07XG5leHBvcnQgY29uc3Qgc2VwYXJhdG9yQXJyYXlOb0V4cGxvZGUgPSAoc3R5bGUpID0+IHtcbiAgICBzd2l0Y2ggKHN0eWxlKSB7XG4gICAgICAgIGNhc2UgXCJmb3JtXCI6XG4gICAgICAgICAgICByZXR1cm4gXCIsXCI7XG4gICAgICAgIGNhc2UgXCJwaXBlRGVsaW1pdGVkXCI6XG4gICAgICAgICAgICByZXR1cm4gXCJ8XCI7XG4gICAgICAgIGNhc2UgXCJzcGFjZURlbGltaXRlZFwiOlxuICAgICAgICAgICAgcmV0dXJuIFwiJTIwXCI7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gXCIsXCI7XG4gICAgfVxufTtcbmV4cG9ydCBjb25zdCBzZXBhcmF0b3JPYmplY3RFeHBsb2RlID0gKHN0eWxlKSA9PiB7XG4gICAgc3dpdGNoIChzdHlsZSkge1xuICAgICAgICBjYXNlIFwibGFiZWxcIjpcbiAgICAgICAgICAgIHJldHVybiBcIi5cIjtcbiAgICAgICAgY2FzZSBcIm1hdHJpeFwiOlxuICAgICAgICAgICAgcmV0dXJuIFwiO1wiO1xuICAgICAgICBjYXNlIFwic2ltcGxlXCI6XG4gICAgICAgICAgICByZXR1cm4gXCIsXCI7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gXCImXCI7XG4gICAgfVxufTtcbmV4cG9ydCBjb25zdCBzZXJpYWxpemVBcnJheVBhcmFtID0gKHsgYWxsb3dSZXNlcnZlZCwgZXhwbG9kZSwgbmFtZSwgc3R5bGUsIHZhbHVlLCB9KSA9PiB7XG4gICAgaWYgKCFleHBsb2RlKSB7XG4gICAgICAgIGNvbnN0IGpvaW5lZFZhbHVlcyA9IChhbGxvd1Jlc2VydmVkID8gdmFsdWUgOiB2YWx1ZS5tYXAoKHYpID0+IGVuY29kZVVSSUNvbXBvbmVudCh2KSkpLmpvaW4oc2VwYXJhdG9yQXJyYXlOb0V4cGxvZGUoc3R5bGUpKTtcbiAgICAgICAgc3dpdGNoIChzdHlsZSkge1xuICAgICAgICAgICAgY2FzZSBcImxhYmVsXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAuJHtqb2luZWRWYWx1ZXN9YDtcbiAgICAgICAgICAgIGNhc2UgXCJtYXRyaXhcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gYDske25hbWV9PSR7am9pbmVkVmFsdWVzfWA7XG4gICAgICAgICAgICBjYXNlIFwic2ltcGxlXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGpvaW5lZFZhbHVlcztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke25hbWV9PSR7am9pbmVkVmFsdWVzfWA7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3Qgc2VwYXJhdG9yID0gc2VwYXJhdG9yQXJyYXlFeHBsb2RlKHN0eWxlKTtcbiAgICBjb25zdCBqb2luZWRWYWx1ZXMgPSB2YWx1ZVxuICAgICAgICAubWFwKCh2KSA9PiB7XG4gICAgICAgIGlmIChzdHlsZSA9PT0gXCJsYWJlbFwiIHx8IHN0eWxlID09PSBcInNpbXBsZVwiKSB7XG4gICAgICAgICAgICByZXR1cm4gYWxsb3dSZXNlcnZlZCA/IHYgOiBlbmNvZGVVUklDb21wb25lbnQodik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNlcmlhbGl6ZVByaW1pdGl2ZVBhcmFtKHtcbiAgICAgICAgICAgIGFsbG93UmVzZXJ2ZWQsXG4gICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgdmFsdWU6IHYsXG4gICAgICAgIH0pO1xuICAgIH0pXG4gICAgICAgIC5qb2luKHNlcGFyYXRvcik7XG4gICAgcmV0dXJuIHN0eWxlID09PSBcImxhYmVsXCIgfHwgc3R5bGUgPT09IFwibWF0cml4XCIgPyBzZXBhcmF0b3IgKyBqb2luZWRWYWx1ZXMgOiBqb2luZWRWYWx1ZXM7XG59O1xuZXhwb3J0IGNvbnN0IHNlcmlhbGl6ZVByaW1pdGl2ZVBhcmFtID0gKHsgYWxsb3dSZXNlcnZlZCwgbmFtZSwgdmFsdWUgfSkgPT4ge1xuICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBcIlwiO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkRlZXBseS1uZXN0ZWQgYXJyYXlzL29iamVjdHMgYXJlbuKAmXQgc3VwcG9ydGVkLiBQcm92aWRlIHlvdXIgb3duIGBxdWVyeVNlcmlhbGl6ZXIoKWAgdG8gaGFuZGxlIHRoZXNlLlwiKTtcbiAgICB9XG4gICAgcmV0dXJuIGAke25hbWV9PSR7YWxsb3dSZXNlcnZlZCA/IHZhbHVlIDogZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKX1gO1xufTtcbmV4cG9ydCBjb25zdCBzZXJpYWxpemVPYmplY3RQYXJhbSA9ICh7IGFsbG93UmVzZXJ2ZWQsIGV4cGxvZGUsIG5hbWUsIHN0eWxlLCB2YWx1ZSwgdmFsdWVPbmx5LCB9KSA9PiB7XG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgICAgICByZXR1cm4gdmFsdWVPbmx5ID8gdmFsdWUudG9JU09TdHJpbmcoKSA6IGAke25hbWV9PSR7dmFsdWUudG9JU09TdHJpbmcoKX1gO1xuICAgIH1cbiAgICBpZiAoc3R5bGUgIT09IFwiZGVlcE9iamVjdFwiICYmICFleHBsb2RlKSB7XG4gICAgICAgIGxldCB2YWx1ZXMgPSBbXTtcbiAgICAgICAgT2JqZWN0LmVudHJpZXModmFsdWUpLmZvckVhY2goKFtrZXksIHZdKSA9PiB7XG4gICAgICAgICAgICB2YWx1ZXMgPSBbLi4udmFsdWVzLCBrZXksIGFsbG93UmVzZXJ2ZWQgPyB2IDogZW5jb2RlVVJJQ29tcG9uZW50KHYpXTtcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGpvaW5lZFZhbHVlcyA9IHZhbHVlcy5qb2luKFwiLFwiKTtcbiAgICAgICAgc3dpdGNoIChzdHlsZSkge1xuICAgICAgICAgICAgY2FzZSBcImZvcm1cIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7bmFtZX09JHtqb2luZWRWYWx1ZXN9YDtcbiAgICAgICAgICAgIGNhc2UgXCJsYWJlbFwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBgLiR7am9pbmVkVmFsdWVzfWA7XG4gICAgICAgICAgICBjYXNlIFwibWF0cml4XCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGA7JHtuYW1lfT0ke2pvaW5lZFZhbHVlc31gO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gam9pbmVkVmFsdWVzO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHNlcGFyYXRvciA9IHNlcGFyYXRvck9iamVjdEV4cGxvZGUoc3R5bGUpO1xuICAgIGNvbnN0IGpvaW5lZFZhbHVlcyA9IE9iamVjdC5lbnRyaWVzKHZhbHVlKVxuICAgICAgICAubWFwKChba2V5LCB2XSkgPT4gc2VyaWFsaXplUHJpbWl0aXZlUGFyYW0oe1xuICAgICAgICBhbGxvd1Jlc2VydmVkLFxuICAgICAgICBuYW1lOiBzdHlsZSA9PT0gXCJkZWVwT2JqZWN0XCIgPyBgJHtuYW1lfVske2tleX1dYCA6IGtleSxcbiAgICAgICAgdmFsdWU6IHYsXG4gICAgfSkpXG4gICAgICAgIC5qb2luKHNlcGFyYXRvcik7XG4gICAgcmV0dXJuIHN0eWxlID09PSBcImxhYmVsXCIgfHwgc3R5bGUgPT09IFwibWF0cml4XCIgPyBzZXBhcmF0b3IgKyBqb2luZWRWYWx1ZXMgOiBqb2luZWRWYWx1ZXM7XG59O1xuIiwKICAgICIvLyBUaGlzIGZpbGUgaXMgYXV0by1nZW5lcmF0ZWQgYnkgQGhleS1hcGkvb3BlbmFwaS10c1xuaW1wb3J0IHsgc2VyaWFsaXplQXJyYXlQYXJhbSwgc2VyaWFsaXplT2JqZWN0UGFyYW0sIHNlcmlhbGl6ZVByaW1pdGl2ZVBhcmFtLCB9IGZyb20gXCIuL3BhdGhTZXJpYWxpemVyLmdlbi5qc1wiO1xuZXhwb3J0IGNvbnN0IFBBVEhfUEFSQU1fUkUgPSAvXFx7W157fV0rXFx9L2c7XG5leHBvcnQgY29uc3QgZGVmYXVsdFBhdGhTZXJpYWxpemVyID0gKHsgcGF0aCwgdXJsOiBfdXJsIH0pID0+IHtcbiAgICBsZXQgdXJsID0gX3VybDtcbiAgICBjb25zdCBtYXRjaGVzID0gX3VybC5tYXRjaChQQVRIX1BBUkFNX1JFKTtcbiAgICBpZiAobWF0Y2hlcykge1xuICAgICAgICBmb3IgKGNvbnN0IG1hdGNoIG9mIG1hdGNoZXMpIHtcbiAgICAgICAgICAgIGxldCBleHBsb2RlID0gZmFsc2U7XG4gICAgICAgICAgICBsZXQgbmFtZSA9IG1hdGNoLnN1YnN0cmluZygxLCBtYXRjaC5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgIGxldCBzdHlsZSA9IFwic2ltcGxlXCI7XG4gICAgICAgICAgICBpZiAobmFtZS5lbmRzV2l0aChcIipcIikpIHtcbiAgICAgICAgICAgICAgICBleHBsb2RlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBuYW1lID0gbmFtZS5zdWJzdHJpbmcoMCwgbmFtZS5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChuYW1lLnN0YXJ0c1dpdGgoXCIuXCIpKSB7XG4gICAgICAgICAgICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyaW5nKDEpO1xuICAgICAgICAgICAgICAgIHN0eWxlID0gXCJsYWJlbFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobmFtZS5zdGFydHNXaXRoKFwiO1wiKSkge1xuICAgICAgICAgICAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cmluZygxKTtcbiAgICAgICAgICAgICAgICBzdHlsZSA9IFwibWF0cml4XCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHBhdGhbbmFtZV07XG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgdXJsID0gdXJsLnJlcGxhY2UobWF0Y2gsIHNlcmlhbGl6ZUFycmF5UGFyYW0oeyBleHBsb2RlLCBuYW1lLCBzdHlsZSwgdmFsdWUgfSkpO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgICAgIHVybCA9IHVybC5yZXBsYWNlKG1hdGNoLCBzZXJpYWxpemVPYmplY3RQYXJhbSh7XG4gICAgICAgICAgICAgICAgICAgIGV4cGxvZGUsXG4gICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlT25seTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc3R5bGUgPT09IFwibWF0cml4XCIpIHtcbiAgICAgICAgICAgICAgICB1cmwgPSB1cmwucmVwbGFjZShtYXRjaCwgYDske3NlcmlhbGl6ZVByaW1pdGl2ZVBhcmFtKHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgICAgIH0pfWApO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcmVwbGFjZVZhbHVlID0gZW5jb2RlVVJJQ29tcG9uZW50KHN0eWxlID09PSBcImxhYmVsXCIgPyBgLiR7dmFsdWV9YCA6IHZhbHVlKTtcbiAgICAgICAgICAgIHVybCA9IHVybC5yZXBsYWNlKG1hdGNoLCByZXBsYWNlVmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB1cmw7XG59O1xuZXhwb3J0IGNvbnN0IGdldFVybCA9ICh7IGJhc2VVcmwsIHBhdGgsIHF1ZXJ5LCBxdWVyeVNlcmlhbGl6ZXIsIHVybDogX3VybCwgfSkgPT4ge1xuICAgIGNvbnN0IHBhdGhVcmwgPSBfdXJsLnN0YXJ0c1dpdGgoXCIvXCIpID8gX3VybCA6IGAvJHtfdXJsfWA7XG4gICAgbGV0IHVybCA9IChiYXNlVXJsID8/IFwiXCIpICsgcGF0aFVybDtcbiAgICBpZiAocGF0aCkge1xuICAgICAgICB1cmwgPSBkZWZhdWx0UGF0aFNlcmlhbGl6ZXIoeyBwYXRoLCB1cmwgfSk7XG4gICAgfVxuICAgIGxldCBzZWFyY2ggPSBxdWVyeSA/IHF1ZXJ5U2VyaWFsaXplcihxdWVyeSkgOiBcIlwiO1xuICAgIGlmIChzZWFyY2guc3RhcnRzV2l0aChcIj9cIikpIHtcbiAgICAgICAgc2VhcmNoID0gc2VhcmNoLnN1YnN0cmluZygxKTtcbiAgICB9XG4gICAgaWYgKHNlYXJjaCkge1xuICAgICAgICB1cmwgKz0gYD8ke3NlYXJjaH1gO1xuICAgIH1cbiAgICByZXR1cm4gdXJsO1xufTtcbiIsCiAgICAiLy8gVGhpcyBmaWxlIGlzIGF1dG8tZ2VuZXJhdGVkIGJ5IEBoZXktYXBpL29wZW5hcGktdHNcbmltcG9ydCB7IGdldEF1dGhUb2tlbiB9IGZyb20gXCIuLi9jb3JlL2F1dGguZ2VuLmpzXCI7XG5pbXBvcnQgeyBqc29uQm9keVNlcmlhbGl6ZXIgfSBmcm9tIFwiLi4vY29yZS9ib2R5U2VyaWFsaXplci5nZW4uanNcIjtcbmltcG9ydCB7IHNlcmlhbGl6ZUFycmF5UGFyYW0sIHNlcmlhbGl6ZU9iamVjdFBhcmFtLCBzZXJpYWxpemVQcmltaXRpdmVQYXJhbSB9IGZyb20gXCIuLi9jb3JlL3BhdGhTZXJpYWxpemVyLmdlbi5qc1wiO1xuaW1wb3J0IHsgZ2V0VXJsIH0gZnJvbSBcIi4uL2NvcmUvdXRpbHMuZ2VuLmpzXCI7XG5leHBvcnQgY29uc3QgY3JlYXRlUXVlcnlTZXJpYWxpemVyID0gKHsgYWxsb3dSZXNlcnZlZCwgYXJyYXksIG9iamVjdCB9ID0ge30pID0+IHtcbiAgICBjb25zdCBxdWVyeVNlcmlhbGl6ZXIgPSAocXVlcnlQYXJhbXMpID0+IHtcbiAgICAgICAgY29uc3Qgc2VhcmNoID0gW107XG4gICAgICAgIGlmIChxdWVyeVBhcmFtcyAmJiB0eXBlb2YgcXVlcnlQYXJhbXMgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgbmFtZSBpbiBxdWVyeVBhcmFtcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gcXVlcnlQYXJhbXNbbmFtZV07XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzZXJpYWxpemVkQXJyYXkgPSBzZXJpYWxpemVBcnJheVBhcmFtKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsbG93UmVzZXJ2ZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBleHBsb2RlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiBcImZvcm1cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uYXJyYXksXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2VyaWFsaXplZEFycmF5KVxuICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoLnB1c2goc2VyaWFsaXplZEFycmF5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlcmlhbGl6ZWRPYmplY3QgPSBzZXJpYWxpemVPYmplY3RQYXJhbSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbGxvd1Jlc2VydmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXhwbG9kZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogXCJkZWVwT2JqZWN0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5vYmplY3QsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2VyaWFsaXplZE9iamVjdClcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaC5wdXNoKHNlcmlhbGl6ZWRPYmplY3QpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VyaWFsaXplZFByaW1pdGl2ZSA9IHNlcmlhbGl6ZVByaW1pdGl2ZVBhcmFtKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsbG93UmVzZXJ2ZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlcmlhbGl6ZWRQcmltaXRpdmUpXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWFyY2gucHVzaChzZXJpYWxpemVkUHJpbWl0aXZlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNlYXJjaC5qb2luKFwiJlwiKTtcbiAgICB9O1xuICAgIHJldHVybiBxdWVyeVNlcmlhbGl6ZXI7XG59O1xuLyoqXG4gKiBJbmZlcnMgcGFyc2VBcyB2YWx1ZSBmcm9tIHByb3ZpZGVkIENvbnRlbnQtVHlwZSBoZWFkZXIuXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRQYXJzZUFzID0gKGNvbnRlbnRUeXBlKSA9PiB7XG4gICAgaWYgKCFjb250ZW50VHlwZSkge1xuICAgICAgICAvLyBJZiBubyBDb250ZW50LVR5cGUgaGVhZGVyIGlzIHByb3ZpZGVkLCB0aGUgYmVzdCB3ZSBjYW4gZG8gaXMgcmV0dXJuIHRoZSByYXcgcmVzcG9uc2UgYm9keSxcbiAgICAgICAgLy8gd2hpY2ggaXMgZWZmZWN0aXZlbHkgdGhlIHNhbWUgYXMgdGhlICdzdHJlYW0nIG9wdGlvbi5cbiAgICAgICAgcmV0dXJuIFwic3RyZWFtXCI7XG4gICAgfVxuICAgIGNvbnN0IGNsZWFuQ29udGVudCA9IGNvbnRlbnRUeXBlLnNwbGl0KFwiO1wiKVswXT8udHJpbSgpO1xuICAgIGlmICghY2xlYW5Db250ZW50KSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGNsZWFuQ29udGVudC5zdGFydHNXaXRoKFwiYXBwbGljYXRpb24vanNvblwiKSB8fCBjbGVhbkNvbnRlbnQuZW5kc1dpdGgoXCIranNvblwiKSkge1xuICAgICAgICByZXR1cm4gXCJqc29uXCI7XG4gICAgfVxuICAgIGlmIChjbGVhbkNvbnRlbnQgPT09IFwibXVsdGlwYXJ0L2Zvcm0tZGF0YVwiKSB7XG4gICAgICAgIHJldHVybiBcImZvcm1EYXRhXCI7XG4gICAgfVxuICAgIGlmIChbXCJhcHBsaWNhdGlvbi9cIiwgXCJhdWRpby9cIiwgXCJpbWFnZS9cIiwgXCJ2aWRlby9cIl0uc29tZSgodHlwZSkgPT4gY2xlYW5Db250ZW50LnN0YXJ0c1dpdGgodHlwZSkpKSB7XG4gICAgICAgIHJldHVybiBcImJsb2JcIjtcbiAgICB9XG4gICAgaWYgKGNsZWFuQ29udGVudC5zdGFydHNXaXRoKFwidGV4dC9cIikpIHtcbiAgICAgICAgcmV0dXJuIFwidGV4dFwiO1xuICAgIH1cbiAgICByZXR1cm47XG59O1xuY29uc3QgY2hlY2tGb3JFeGlzdGVuY2UgPSAob3B0aW9ucywgbmFtZSkgPT4ge1xuICAgIGlmICghbmFtZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmIChvcHRpb25zLmhlYWRlcnMuaGFzKG5hbWUpIHx8IG9wdGlvbnMucXVlcnk/LltuYW1lXSB8fCBvcHRpb25zLmhlYWRlcnMuZ2V0KFwiQ29va2llXCIpPy5pbmNsdWRlcyhgJHtuYW1lfT1gKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufTtcbmV4cG9ydCBjb25zdCBzZXRBdXRoUGFyYW1zID0gYXN5bmMgKHsgc2VjdXJpdHksIC4uLm9wdGlvbnMgfSkgPT4ge1xuICAgIGZvciAoY29uc3QgYXV0aCBvZiBzZWN1cml0eSkge1xuICAgICAgICBpZiAoY2hlY2tGb3JFeGlzdGVuY2Uob3B0aW9ucywgYXV0aC5uYW1lKSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdG9rZW4gPSBhd2FpdCBnZXRBdXRoVG9rZW4oYXV0aCwgb3B0aW9ucy5hdXRoKTtcbiAgICAgICAgaWYgKCF0b2tlbikge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbmFtZSA9IGF1dGgubmFtZSA/PyBcIkF1dGhvcml6YXRpb25cIjtcbiAgICAgICAgc3dpdGNoIChhdXRoLmluKSB7XG4gICAgICAgICAgICBjYXNlIFwicXVlcnlcIjpcbiAgICAgICAgICAgICAgICBpZiAoIW9wdGlvbnMucXVlcnkpIHtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5xdWVyeSA9IHt9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBvcHRpb25zLnF1ZXJ5W25hbWVdID0gdG9rZW47XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiY29va2llXCI6XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5oZWFkZXJzLmFwcGVuZChcIkNvb2tpZVwiLCBgJHtuYW1lfT0ke3Rva2VufWApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImhlYWRlclwiOlxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBvcHRpb25zLmhlYWRlcnMuc2V0KG5hbWUsIHRva2VuKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbn07XG5leHBvcnQgY29uc3QgYnVpbGRVcmwgPSAob3B0aW9ucykgPT4gZ2V0VXJsKHtcbiAgICBiYXNlVXJsOiBvcHRpb25zLmJhc2VVcmwsXG4gICAgcGF0aDogb3B0aW9ucy5wYXRoLFxuICAgIHF1ZXJ5OiBvcHRpb25zLnF1ZXJ5LFxuICAgIHF1ZXJ5U2VyaWFsaXplcjogdHlwZW9mIG9wdGlvbnMucXVlcnlTZXJpYWxpemVyID09PSBcImZ1bmN0aW9uXCJcbiAgICAgICAgPyBvcHRpb25zLnF1ZXJ5U2VyaWFsaXplclxuICAgICAgICA6IGNyZWF0ZVF1ZXJ5U2VyaWFsaXplcihvcHRpb25zLnF1ZXJ5U2VyaWFsaXplciksXG4gICAgdXJsOiBvcHRpb25zLnVybCxcbn0pO1xuZXhwb3J0IGNvbnN0IG1lcmdlQ29uZmlncyA9IChhLCBiKSA9PiB7XG4gICAgY29uc3QgY29uZmlnID0geyAuLi5hLCAuLi5iIH07XG4gICAgaWYgKGNvbmZpZy5iYXNlVXJsPy5lbmRzV2l0aChcIi9cIikpIHtcbiAgICAgICAgY29uZmlnLmJhc2VVcmwgPSBjb25maWcuYmFzZVVybC5zdWJzdHJpbmcoMCwgY29uZmlnLmJhc2VVcmwubGVuZ3RoIC0gMSk7XG4gICAgfVxuICAgIGNvbmZpZy5oZWFkZXJzID0gbWVyZ2VIZWFkZXJzKGEuaGVhZGVycywgYi5oZWFkZXJzKTtcbiAgICByZXR1cm4gY29uZmlnO1xufTtcbmV4cG9ydCBjb25zdCBtZXJnZUhlYWRlcnMgPSAoLi4uaGVhZGVycykgPT4ge1xuICAgIGNvbnN0IG1lcmdlZEhlYWRlcnMgPSBuZXcgSGVhZGVycygpO1xuICAgIGZvciAoY29uc3QgaGVhZGVyIG9mIGhlYWRlcnMpIHtcbiAgICAgICAgaWYgKCFoZWFkZXIgfHwgdHlwZW9mIGhlYWRlciAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaXRlcmF0b3IgPSBoZWFkZXIgaW5zdGFuY2VvZiBIZWFkZXJzID8gaGVhZGVyLmVudHJpZXMoKSA6IE9iamVjdC5lbnRyaWVzKGhlYWRlcik7XG4gICAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIGl0ZXJhdG9yKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBtZXJnZWRIZWFkZXJzLmRlbGV0ZShrZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHYgb2YgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVyZ2VkSGVhZGVycy5hcHBlbmQoa2V5LCB2KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgLy8gYXNzdW1lIG9iamVjdCBoZWFkZXJzIGFyZSBtZWFudCB0byBiZSBKU09OIHN0cmluZ2lmaWVkLCBpLmUuIHRoZWlyXG4gICAgICAgICAgICAgICAgLy8gY29udGVudCB2YWx1ZSBpbiBPcGVuQVBJIHNwZWNpZmljYXRpb24gaXMgJ2FwcGxpY2F0aW9uL2pzb24nXG4gICAgICAgICAgICAgICAgbWVyZ2VkSGVhZGVycy5zZXQoa2V5LCB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgPyBKU09OLnN0cmluZ2lmeSh2YWx1ZSkgOiB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG1lcmdlZEhlYWRlcnM7XG59O1xuY2xhc3MgSW50ZXJjZXB0b3JzIHtcbiAgICBfZm5zO1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLl9mbnMgPSBbXTtcbiAgICB9XG4gICAgY2xlYXIoKSB7XG4gICAgICAgIHRoaXMuX2ZucyA9IFtdO1xuICAgIH1cbiAgICBnZXRJbnRlcmNlcHRvckluZGV4KGlkKSB7XG4gICAgICAgIGlmICh0eXBlb2YgaWQgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9mbnNbaWRdID8gaWQgOiAtMTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9mbnMuaW5kZXhPZihpZCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZXhpc3RzKGlkKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5nZXRJbnRlcmNlcHRvckluZGV4KGlkKTtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZm5zW2luZGV4XTtcbiAgICB9XG4gICAgZWplY3QoaWQpIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmdldEludGVyY2VwdG9ySW5kZXgoaWQpO1xuICAgICAgICBpZiAodGhpcy5fZm5zW2luZGV4XSkge1xuICAgICAgICAgICAgdGhpcy5fZm5zW2luZGV4XSA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdXBkYXRlKGlkLCBmbikge1xuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuZ2V0SW50ZXJjZXB0b3JJbmRleChpZCk7XG4gICAgICAgIGlmICh0aGlzLl9mbnNbaW5kZXhdKSB7XG4gICAgICAgICAgICB0aGlzLl9mbnNbaW5kZXhdID0gZm47XG4gICAgICAgICAgICByZXR1cm4gaWQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdXNlKGZuKSB7XG4gICAgICAgIHRoaXMuX2ZucyA9IFsuLi50aGlzLl9mbnMsIGZuXTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Zucy5sZW5ndGggLSAxO1xuICAgIH1cbn1cbi8vIGRvIG5vdCBhZGQgYE1pZGRsZXdhcmVgIGFzIHJldHVybiB0eXBlIHNvIHdlIGNhbiB1c2UgX2ZucyBpbnRlcm5hbGx5XG5leHBvcnQgY29uc3QgY3JlYXRlSW50ZXJjZXB0b3JzID0gKCkgPT4gKHtcbiAgICBlcnJvcjogbmV3IEludGVyY2VwdG9ycygpLFxuICAgIHJlcXVlc3Q6IG5ldyBJbnRlcmNlcHRvcnMoKSxcbiAgICByZXNwb25zZTogbmV3IEludGVyY2VwdG9ycygpLFxufSk7XG5jb25zdCBkZWZhdWx0UXVlcnlTZXJpYWxpemVyID0gY3JlYXRlUXVlcnlTZXJpYWxpemVyKHtcbiAgICBhbGxvd1Jlc2VydmVkOiBmYWxzZSxcbiAgICBhcnJheToge1xuICAgICAgICBleHBsb2RlOiB0cnVlLFxuICAgICAgICBzdHlsZTogXCJmb3JtXCIsXG4gICAgfSxcbiAgICBvYmplY3Q6IHtcbiAgICAgICAgZXhwbG9kZTogdHJ1ZSxcbiAgICAgICAgc3R5bGU6IFwiZGVlcE9iamVjdFwiLFxuICAgIH0sXG59KTtcbmNvbnN0IGRlZmF1bHRIZWFkZXJzID0ge1xuICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxufTtcbmV4cG9ydCBjb25zdCBjcmVhdGVDb25maWcgPSAob3ZlcnJpZGUgPSB7fSkgPT4gKHtcbiAgICAuLi5qc29uQm9keVNlcmlhbGl6ZXIsXG4gICAgaGVhZGVyczogZGVmYXVsdEhlYWRlcnMsXG4gICAgcGFyc2VBczogXCJhdXRvXCIsXG4gICAgcXVlcnlTZXJpYWxpemVyOiBkZWZhdWx0UXVlcnlTZXJpYWxpemVyLFxuICAgIC4uLm92ZXJyaWRlLFxufSk7XG4iLAogICAgIi8vIFRoaXMgZmlsZSBpcyBhdXRvLWdlbmVyYXRlZCBieSBAaGV5LWFwaS9vcGVuYXBpLXRzXG5pbXBvcnQgeyBjcmVhdGVTc2VDbGllbnQgfSBmcm9tIFwiLi4vY29yZS9zZXJ2ZXJTZW50RXZlbnRzLmdlbi5qc1wiO1xuaW1wb3J0IHsgYnVpbGRVcmwsIGNyZWF0ZUNvbmZpZywgY3JlYXRlSW50ZXJjZXB0b3JzLCBnZXRQYXJzZUFzLCBtZXJnZUNvbmZpZ3MsIG1lcmdlSGVhZGVycywgc2V0QXV0aFBhcmFtcywgfSBmcm9tIFwiLi91dGlscy5nZW4uanNcIjtcbmV4cG9ydCBjb25zdCBjcmVhdGVDbGllbnQgPSAoY29uZmlnID0ge30pID0+IHtcbiAgICBsZXQgX2NvbmZpZyA9IG1lcmdlQ29uZmlncyhjcmVhdGVDb25maWcoKSwgY29uZmlnKTtcbiAgICBjb25zdCBnZXRDb25maWcgPSAoKSA9PiAoeyAuLi5fY29uZmlnIH0pO1xuICAgIGNvbnN0IHNldENvbmZpZyA9IChjb25maWcpID0+IHtcbiAgICAgICAgX2NvbmZpZyA9IG1lcmdlQ29uZmlncyhfY29uZmlnLCBjb25maWcpO1xuICAgICAgICByZXR1cm4gZ2V0Q29uZmlnKCk7XG4gICAgfTtcbiAgICBjb25zdCBpbnRlcmNlcHRvcnMgPSBjcmVhdGVJbnRlcmNlcHRvcnMoKTtcbiAgICBjb25zdCBiZWZvcmVSZXF1ZXN0ID0gYXN5bmMgKG9wdGlvbnMpID0+IHtcbiAgICAgICAgY29uc3Qgb3B0cyA9IHtcbiAgICAgICAgICAgIC4uLl9jb25maWcsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgZmV0Y2g6IG9wdGlvbnMuZmV0Y2ggPz8gX2NvbmZpZy5mZXRjaCA/PyBnbG9iYWxUaGlzLmZldGNoLFxuICAgICAgICAgICAgaGVhZGVyczogbWVyZ2VIZWFkZXJzKF9jb25maWcuaGVhZGVycywgb3B0aW9ucy5oZWFkZXJzKSxcbiAgICAgICAgICAgIHNlcmlhbGl6ZWRCb2R5OiB1bmRlZmluZWQsXG4gICAgICAgIH07XG4gICAgICAgIGlmIChvcHRzLnNlY3VyaXR5KSB7XG4gICAgICAgICAgICBhd2FpdCBzZXRBdXRoUGFyYW1zKHtcbiAgICAgICAgICAgICAgICAuLi5vcHRzLFxuICAgICAgICAgICAgICAgIHNlY3VyaXR5OiBvcHRzLnNlY3VyaXR5LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9wdHMucmVxdWVzdFZhbGlkYXRvcikge1xuICAgICAgICAgICAgYXdhaXQgb3B0cy5yZXF1ZXN0VmFsaWRhdG9yKG9wdHMpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvcHRzLmJvZHkgJiYgb3B0cy5ib2R5U2VyaWFsaXplcikge1xuICAgICAgICAgICAgb3B0cy5zZXJpYWxpemVkQm9keSA9IG9wdHMuYm9keVNlcmlhbGl6ZXIob3B0cy5ib2R5KTtcbiAgICAgICAgfVxuICAgICAgICAvLyByZW1vdmUgQ29udGVudC1UeXBlIGhlYWRlciBpZiBib2R5IGlzIGVtcHR5IHRvIGF2b2lkIHNlbmRpbmcgaW52YWxpZCByZXF1ZXN0c1xuICAgICAgICBpZiAob3B0cy5zZXJpYWxpemVkQm9keSA9PT0gdW5kZWZpbmVkIHx8IG9wdHMuc2VyaWFsaXplZEJvZHkgPT09IFwiXCIpIHtcbiAgICAgICAgICAgIG9wdHMuaGVhZGVycy5kZWxldGUoXCJDb250ZW50LVR5cGVcIik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdXJsID0gYnVpbGRVcmwob3B0cyk7XG4gICAgICAgIHJldHVybiB7IG9wdHMsIHVybCB9O1xuICAgIH07XG4gICAgY29uc3QgcmVxdWVzdCA9IGFzeW5jIChvcHRpb25zKSA9PiB7XG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICAgICAgY29uc3QgeyBvcHRzLCB1cmwgfSA9IGF3YWl0IGJlZm9yZVJlcXVlc3Qob3B0aW9ucyk7XG4gICAgICAgIGNvbnN0IHJlcXVlc3RJbml0ID0ge1xuICAgICAgICAgICAgcmVkaXJlY3Q6IFwiZm9sbG93XCIsXG4gICAgICAgICAgICAuLi5vcHRzLFxuICAgICAgICAgICAgYm9keTogb3B0cy5zZXJpYWxpemVkQm9keSxcbiAgICAgICAgfTtcbiAgICAgICAgbGV0IHJlcXVlc3QgPSBuZXcgUmVxdWVzdCh1cmwsIHJlcXVlc3RJbml0KTtcbiAgICAgICAgZm9yIChjb25zdCBmbiBvZiBpbnRlcmNlcHRvcnMucmVxdWVzdC5fZm5zKSB7XG4gICAgICAgICAgICBpZiAoZm4pIHtcbiAgICAgICAgICAgICAgICByZXF1ZXN0ID0gYXdhaXQgZm4ocmVxdWVzdCwgb3B0cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gZmV0Y2ggbXVzdCBiZSBhc3NpZ25lZCBoZXJlLCBvdGhlcndpc2UgaXQgd291bGQgdGhyb3cgdGhlIGVycm9yOlxuICAgICAgICAvLyBUeXBlRXJyb3I6IEZhaWxlZCB0byBleGVjdXRlICdmZXRjaCcgb24gJ1dpbmRvdyc6IElsbGVnYWwgaW52b2NhdGlvblxuICAgICAgICBjb25zdCBfZmV0Y2ggPSBvcHRzLmZldGNoO1xuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCBfZmV0Y2gocmVxdWVzdCk7XG4gICAgICAgIGZvciAoY29uc3QgZm4gb2YgaW50ZXJjZXB0b3JzLnJlc3BvbnNlLl9mbnMpIHtcbiAgICAgICAgICAgIGlmIChmbikge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gYXdhaXQgZm4ocmVzcG9uc2UsIHJlcXVlc3QsIG9wdHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgIHJlcXVlc3QsXG4gICAgICAgICAgICByZXNwb25zZSxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHJlc3BvbnNlLm9rKSB7XG4gICAgICAgICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID09PSAyMDQgfHwgcmVzcG9uc2UuaGVhZGVycy5nZXQoXCJDb250ZW50LUxlbmd0aFwiKSA9PT0gXCIwXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0cy5yZXNwb25zZVN0eWxlID09PSBcImRhdGFcIlxuICAgICAgICAgICAgICAgICAgICA/IHt9XG4gICAgICAgICAgICAgICAgICAgIDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge30sXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5yZXN1bHQsXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBwYXJzZUFzID0gKG9wdHMucGFyc2VBcyA9PT0gXCJhdXRvXCIgPyBnZXRQYXJzZUFzKHJlc3BvbnNlLmhlYWRlcnMuZ2V0KFwiQ29udGVudC1UeXBlXCIpKSA6IG9wdHMucGFyc2VBcykgPz8gXCJqc29uXCI7XG4gICAgICAgICAgICBsZXQgZGF0YTtcbiAgICAgICAgICAgIHN3aXRjaCAocGFyc2VBcykge1xuICAgICAgICAgICAgICAgIGNhc2UgXCJhcnJheUJ1ZmZlclwiOlxuICAgICAgICAgICAgICAgIGNhc2UgXCJibG9iXCI6XG4gICAgICAgICAgICAgICAgY2FzZSBcImZvcm1EYXRhXCI6XG4gICAgICAgICAgICAgICAgY2FzZSBcImpzb25cIjpcbiAgICAgICAgICAgICAgICBjYXNlIFwidGV4dFwiOlxuICAgICAgICAgICAgICAgICAgICBkYXRhID0gYXdhaXQgcmVzcG9uc2VbcGFyc2VBc10oKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcInN0cmVhbVwiOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3B0cy5yZXNwb25zZVN0eWxlID09PSBcImRhdGFcIlxuICAgICAgICAgICAgICAgICAgICAgICAgPyByZXNwb25zZS5ib2R5XG4gICAgICAgICAgICAgICAgICAgICAgICA6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiByZXNwb25zZS5ib2R5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLnJlc3VsdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocGFyc2VBcyA9PT0gXCJqc29uXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAob3B0cy5yZXNwb25zZVZhbGlkYXRvcikge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBvcHRzLnJlc3BvbnNlVmFsaWRhdG9yKGRhdGEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAob3B0cy5yZXNwb25zZVRyYW5zZm9ybWVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGEgPSBhd2FpdCBvcHRzLnJlc3BvbnNlVHJhbnNmb3JtZXIoZGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG9wdHMucmVzcG9uc2VTdHlsZSA9PT0gXCJkYXRhXCJcbiAgICAgICAgICAgICAgICA/IGRhdGFcbiAgICAgICAgICAgICAgICA6IHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgLi4ucmVzdWx0LFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdGV4dEVycm9yID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICAgICAgICBsZXQganNvbkVycm9yO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAganNvbkVycm9yID0gSlNPTi5wYXJzZSh0ZXh0RXJyb3IpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIHtcbiAgICAgICAgICAgIC8vIG5vb3BcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBlcnJvciA9IGpzb25FcnJvciA/PyB0ZXh0RXJyb3I7XG4gICAgICAgIGxldCBmaW5hbEVycm9yID0gZXJyb3I7XG4gICAgICAgIGZvciAoY29uc3QgZm4gb2YgaW50ZXJjZXB0b3JzLmVycm9yLl9mbnMpIHtcbiAgICAgICAgICAgIGlmIChmbikge1xuICAgICAgICAgICAgICAgIGZpbmFsRXJyb3IgPSAoYXdhaXQgZm4oZXJyb3IsIHJlc3BvbnNlLCByZXF1ZXN0LCBvcHRzKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxFcnJvciA9IGZpbmFsRXJyb3IgfHwge307XG4gICAgICAgIGlmIChvcHRzLnRocm93T25FcnJvcikge1xuICAgICAgICAgICAgdGhyb3cgZmluYWxFcnJvcjtcbiAgICAgICAgfVxuICAgICAgICAvLyBUT0RPOiB3ZSBwcm9iYWJseSB3YW50IHRvIHJldHVybiBlcnJvciBhbmQgaW1wcm92ZSB0eXBlc1xuICAgICAgICByZXR1cm4gb3B0cy5yZXNwb25zZVN0eWxlID09PSBcImRhdGFcIlxuICAgICAgICAgICAgPyB1bmRlZmluZWRcbiAgICAgICAgICAgIDoge1xuICAgICAgICAgICAgICAgIGVycm9yOiBmaW5hbEVycm9yLFxuICAgICAgICAgICAgICAgIC4uLnJlc3VsdCxcbiAgICAgICAgICAgIH07XG4gICAgfTtcbiAgICBjb25zdCBtYWtlTWV0aG9kID0gKG1ldGhvZCkgPT4ge1xuICAgICAgICBjb25zdCBmbiA9IChvcHRpb25zKSA9PiByZXF1ZXN0KHsgLi4ub3B0aW9ucywgbWV0aG9kIH0pO1xuICAgICAgICBmbi5zc2UgPSBhc3luYyAob3B0aW9ucykgPT4ge1xuICAgICAgICAgICAgY29uc3QgeyBvcHRzLCB1cmwgfSA9IGF3YWl0IGJlZm9yZVJlcXVlc3Qob3B0aW9ucyk7XG4gICAgICAgICAgICByZXR1cm4gY3JlYXRlU3NlQ2xpZW50KHtcbiAgICAgICAgICAgICAgICAuLi5vcHRzLFxuICAgICAgICAgICAgICAgIGJvZHk6IG9wdHMuYm9keSxcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiBvcHRzLmhlYWRlcnMsXG4gICAgICAgICAgICAgICAgbWV0aG9kLFxuICAgICAgICAgICAgICAgIHVybCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gZm47XG4gICAgfTtcbiAgICByZXR1cm4ge1xuICAgICAgICBidWlsZFVybCxcbiAgICAgICAgY29ubmVjdDogbWFrZU1ldGhvZChcIkNPTk5FQ1RcIiksXG4gICAgICAgIGRlbGV0ZTogbWFrZU1ldGhvZChcIkRFTEVURVwiKSxcbiAgICAgICAgZ2V0OiBtYWtlTWV0aG9kKFwiR0VUXCIpLFxuICAgICAgICBnZXRDb25maWcsXG4gICAgICAgIGhlYWQ6IG1ha2VNZXRob2QoXCJIRUFEXCIpLFxuICAgICAgICBpbnRlcmNlcHRvcnMsXG4gICAgICAgIG9wdGlvbnM6IG1ha2VNZXRob2QoXCJPUFRJT05TXCIpLFxuICAgICAgICBwYXRjaDogbWFrZU1ldGhvZChcIlBBVENIXCIpLFxuICAgICAgICBwb3N0OiBtYWtlTWV0aG9kKFwiUE9TVFwiKSxcbiAgICAgICAgcHV0OiBtYWtlTWV0aG9kKFwiUFVUXCIpLFxuICAgICAgICByZXF1ZXN0LFxuICAgICAgICBzZXRDb25maWcsXG4gICAgICAgIHRyYWNlOiBtYWtlTWV0aG9kKFwiVFJBQ0VcIiksXG4gICAgfTtcbn07XG4iLAogICAgIi8vIFRoaXMgZmlsZSBpcyBhdXRvLWdlbmVyYXRlZCBieSBAaGV5LWFwaS9vcGVuYXBpLXRzXG5jb25zdCBleHRyYVByZWZpeGVzTWFwID0ge1xuICAgICRib2R5XzogXCJib2R5XCIsXG4gICAgJGhlYWRlcnNfOiBcImhlYWRlcnNcIixcbiAgICAkcGF0aF86IFwicGF0aFwiLFxuICAgICRxdWVyeV86IFwicXVlcnlcIixcbn07XG5jb25zdCBleHRyYVByZWZpeGVzID0gT2JqZWN0LmVudHJpZXMoZXh0cmFQcmVmaXhlc01hcCk7XG5jb25zdCBidWlsZEtleU1hcCA9IChmaWVsZHMsIG1hcCkgPT4ge1xuICAgIGlmICghbWFwKSB7XG4gICAgICAgIG1hcCA9IG5ldyBNYXAoKTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBjb25maWcgb2YgZmllbGRzKSB7XG4gICAgICAgIGlmIChcImluXCIgaW4gY29uZmlnKSB7XG4gICAgICAgICAgICBpZiAoY29uZmlnLmtleSkge1xuICAgICAgICAgICAgICAgIG1hcC5zZXQoY29uZmlnLmtleSwge1xuICAgICAgICAgICAgICAgICAgICBpbjogY29uZmlnLmluLFxuICAgICAgICAgICAgICAgICAgICBtYXA6IGNvbmZpZy5tYXAsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoY29uZmlnLmFyZ3MpIHtcbiAgICAgICAgICAgIGJ1aWxkS2V5TWFwKGNvbmZpZy5hcmdzLCBtYXApO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBtYXA7XG59O1xuY29uc3Qgc3RyaXBFbXB0eVNsb3RzID0gKHBhcmFtcykgPT4ge1xuICAgIGZvciAoY29uc3QgW3Nsb3QsIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhwYXJhbXMpKSB7XG4gICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgJiYgIU9iamVjdC5rZXlzKHZhbHVlKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBwYXJhbXNbc2xvdF07XG4gICAgICAgIH1cbiAgICB9XG59O1xuZXhwb3J0IGNvbnN0IGJ1aWxkQ2xpZW50UGFyYW1zID0gKGFyZ3MsIGZpZWxkcykgPT4ge1xuICAgIGNvbnN0IHBhcmFtcyA9IHtcbiAgICAgICAgYm9keToge30sXG4gICAgICAgIGhlYWRlcnM6IHt9LFxuICAgICAgICBwYXRoOiB7fSxcbiAgICAgICAgcXVlcnk6IHt9LFxuICAgIH07XG4gICAgY29uc3QgbWFwID0gYnVpbGRLZXlNYXAoZmllbGRzKTtcbiAgICBsZXQgY29uZmlnO1xuICAgIGZvciAoY29uc3QgW2luZGV4LCBhcmddIG9mIGFyZ3MuZW50cmllcygpKSB7XG4gICAgICAgIGlmIChmaWVsZHNbaW5kZXhdKSB7XG4gICAgICAgICAgICBjb25maWcgPSBmaWVsZHNbaW5kZXhdO1xuICAgICAgICB9XG4gICAgICAgIGlmICghY29uZmlnKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoXCJpblwiIGluIGNvbmZpZykge1xuICAgICAgICAgICAgaWYgKGNvbmZpZy5rZXkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBmaWVsZCA9IG1hcC5nZXQoY29uZmlnLmtleSk7XG4gICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IGZpZWxkLm1hcCB8fCBjb25maWcua2V5O1xuICAgICAgICAgICAgICAgIHBhcmFtc1tmaWVsZC5pbl1bbmFtZV0gPSBhcmc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBwYXJhbXMuYm9keSA9IGFyZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKGFyZyA/PyB7fSkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBmaWVsZCA9IG1hcC5nZXQoa2V5KTtcbiAgICAgICAgICAgICAgICBpZiAoZmllbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IGZpZWxkLm1hcCB8fCBrZXk7XG4gICAgICAgICAgICAgICAgICAgIHBhcmFtc1tmaWVsZC5pbl1bbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGV4dHJhID0gZXh0cmFQcmVmaXhlcy5maW5kKChbcHJlZml4XSkgPT4ga2V5LnN0YXJ0c1dpdGgocHJlZml4KSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChleHRyYSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgW3ByZWZpeCwgc2xvdF0gPSBleHRyYTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtc1tzbG90XVtrZXkuc2xpY2UocHJlZml4Lmxlbmd0aCldID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IFtzbG90LCBhbGxvd2VkXSBvZiBPYmplY3QuZW50cmllcyhjb25maWcuYWxsb3dFeHRyYSA/PyB7fSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYWxsb3dlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtc1tzbG90XVtrZXldID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBzdHJpcEVtcHR5U2xvdHMocGFyYW1zKTtcbiAgICByZXR1cm4gcGFyYW1zO1xufTtcbiIsCiAgICAiLy8gVGhpcyBmaWxlIGlzIGF1dG8tZ2VuZXJhdGVkIGJ5IEBoZXktYXBpL29wZW5hcGktdHNcbmltcG9ydCB7IGNyZWF0ZUNsaWVudCwgY3JlYXRlQ29uZmlnIH0gZnJvbSBcIi4vY2xpZW50L2luZGV4LmpzXCI7XG5leHBvcnQgY29uc3QgY2xpZW50ID0gY3JlYXRlQ2xpZW50KGNyZWF0ZUNvbmZpZyh7XG4gICAgYmFzZVVybDogXCJodHRwOi8vbG9jYWxob3N0OjQwOTZcIixcbn0pKTtcbiIsCiAgICAiLy8gVGhpcyBmaWxlIGlzIGF1dG8tZ2VuZXJhdGVkIGJ5IEBoZXktYXBpL29wZW5hcGktdHNcbmltcG9ydCB7IGNsaWVudCBhcyBfaGV5QXBpQ2xpZW50IH0gZnJvbSBcIi4vY2xpZW50Lmdlbi5qc1wiO1xuY2xhc3MgX0hleUFwaUNsaWVudCB7XG4gICAgX2NsaWVudCA9IF9oZXlBcGlDbGllbnQ7XG4gICAgY29uc3RydWN0b3IoYXJncykge1xuICAgICAgICBpZiAoYXJncz8uY2xpZW50KSB7XG4gICAgICAgICAgICB0aGlzLl9jbGllbnQgPSBhcmdzLmNsaWVudDtcbiAgICAgICAgfVxuICAgIH1cbn1cbmNsYXNzIEdsb2JhbCBleHRlbmRzIF9IZXlBcGlDbGllbnQge1xuICAgIC8qKlxuICAgICAqIEdldCBldmVudHNcbiAgICAgKi9cbiAgICBldmVudChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0LnNzZSh7XG4gICAgICAgICAgICB1cmw6IFwiL2dsb2JhbC9ldmVudFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuY2xhc3MgUHJvamVjdCBleHRlbmRzIF9IZXlBcGlDbGllbnQge1xuICAgIC8qKlxuICAgICAqIExpc3QgYWxsIHByb2plY3RzXG4gICAgICovXG4gICAgbGlzdChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvcHJvamVjdFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgY3VycmVudCBwcm9qZWN0XG4gICAgICovXG4gICAgY3VycmVudChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvcHJvamVjdC9jdXJyZW50XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG59XG5jbGFzcyBQdHkgZXh0ZW5kcyBfSGV5QXBpQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBMaXN0IGFsbCBQVFkgc2Vzc2lvbnNcbiAgICAgKi9cbiAgICBsaXN0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9wdHlcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgUFRZIHNlc3Npb25cbiAgICAgKi9cbiAgICBjcmVhdGUob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi9wdHlcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucz8uaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgYSBQVFkgc2Vzc2lvblxuICAgICAqL1xuICAgIHJlbW92ZShvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5kZWxldGUoe1xuICAgICAgICAgICAgdXJsOiBcIi9wdHkve2lkfVwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCBQVFkgc2Vzc2lvbiBpbmZvXG4gICAgICovXG4gICAgZ2V0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL3B0eS97aWR9XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVXBkYXRlIFBUWSBzZXNzaW9uXG4gICAgICovXG4gICAgdXBkYXRlKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnB1dCh7XG4gICAgICAgICAgICB1cmw6IFwiL3B0eS97aWR9XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnMuaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDb25uZWN0IHRvIGEgUFRZIHNlc3Npb25cbiAgICAgKi9cbiAgICBjb25uZWN0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL3B0eS97aWR9L2Nvbm5lY3RcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmNsYXNzIENvbmZpZyBleHRlbmRzIF9IZXlBcGlDbGllbnQge1xuICAgIC8qKlxuICAgICAqIEdldCBjb25maWcgaW5mb1xuICAgICAqL1xuICAgIGdldChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvY29uZmlnXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVXBkYXRlIGNvbmZpZ1xuICAgICAqL1xuICAgIHVwZGF0ZShvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucGF0Y2goe1xuICAgICAgICAgICAgdXJsOiBcIi9jb25maWdcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucz8uaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBMaXN0IGFsbCBwcm92aWRlcnNcbiAgICAgKi9cbiAgICBwcm92aWRlcnMob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL2NvbmZpZy9wcm92aWRlcnNcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmNsYXNzIFRvb2wgZXh0ZW5kcyBfSGV5QXBpQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBMaXN0IGFsbCB0b29sIElEcyAoaW5jbHVkaW5nIGJ1aWx0LWluIGFuZCBkeW5hbWljYWxseSByZWdpc3RlcmVkKVxuICAgICAqL1xuICAgIGlkcyhvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvZXhwZXJpbWVudGFsL3Rvb2wvaWRzXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogTGlzdCB0b29scyB3aXRoIEpTT04gc2NoZW1hIHBhcmFtZXRlcnMgZm9yIGEgcHJvdmlkZXIvbW9kZWxcbiAgICAgKi9cbiAgICBsaXN0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL2V4cGVyaW1lbnRhbC90b29sXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG59XG5jbGFzcyBJbnN0YW5jZSBleHRlbmRzIF9IZXlBcGlDbGllbnQge1xuICAgIC8qKlxuICAgICAqIERpc3Bvc2UgdGhlIGN1cnJlbnQgaW5zdGFuY2VcbiAgICAgKi9cbiAgICBkaXNwb3NlKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvaW5zdGFuY2UvZGlzcG9zZVwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuY2xhc3MgUGF0aCBleHRlbmRzIF9IZXlBcGlDbGllbnQge1xuICAgIC8qKlxuICAgICAqIEdldCB0aGUgY3VycmVudCBwYXRoXG4gICAgICovXG4gICAgZ2V0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9wYXRoXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG59XG5jbGFzcyBWY3MgZXh0ZW5kcyBfSGV5QXBpQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBHZXQgVkNTIGluZm8gZm9yIHRoZSBjdXJyZW50IGluc3RhbmNlXG4gICAgICovXG4gICAgZ2V0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi92Y3NcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmNsYXNzIFNlc3Npb24gZXh0ZW5kcyBfSGV5QXBpQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBMaXN0IGFsbCBzZXNzaW9uc1xuICAgICAqL1xuICAgIGxpc3Qob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Nlc3Npb25cIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgc2Vzc2lvblxuICAgICAqL1xuICAgIGNyZWF0ZShvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Nlc3Npb25cIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucz8uaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgc2Vzc2lvbiBzdGF0dXNcbiAgICAgKi9cbiAgICBzdGF0dXMob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Nlc3Npb24vc3RhdHVzXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGVsZXRlIGEgc2Vzc2lvbiBhbmQgYWxsIGl0cyBkYXRhXG4gICAgICovXG4gICAgZGVsZXRlKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmRlbGV0ZSh7XG4gICAgICAgICAgICB1cmw6IFwiL3Nlc3Npb24ve2lkfVwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCBzZXNzaW9uXG4gICAgICovXG4gICAgZ2V0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Nlc3Npb24ve2lkfVwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFVwZGF0ZSBzZXNzaW9uIHByb3BlcnRpZXNcbiAgICAgKi9cbiAgICB1cGRhdGUob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucGF0Y2goe1xuICAgICAgICAgICAgdXJsOiBcIi9zZXNzaW9uL3tpZH1cIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCBhIHNlc3Npb24ncyBjaGlsZHJlblxuICAgICAqL1xuICAgIGNoaWxkcmVuKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Nlc3Npb24ve2lkfS9jaGlsZHJlblwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgdG9kbyBsaXN0IGZvciBhIHNlc3Npb25cbiAgICAgKi9cbiAgICB0b2RvKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Nlc3Npb24ve2lkfS90b2RvXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQW5hbHl6ZSB0aGUgYXBwIGFuZCBjcmVhdGUgYW4gQUdFTlRTLm1kIGZpbGVcbiAgICAgKi9cbiAgICBpbml0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi9zZXNzaW9uL3tpZH0vaW5pdFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zLmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRm9yayBhbiBleGlzdGluZyBzZXNzaW9uIGF0IGEgc3BlY2lmaWMgbWVzc2FnZVxuICAgICAqL1xuICAgIGZvcmsob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Nlc3Npb24ve2lkfS9mb3JrXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnMuaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBYm9ydCBhIHNlc3Npb25cbiAgICAgKi9cbiAgICBhYm9ydChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvc2Vzc2lvbi97aWR9L2Fib3J0XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVW5zaGFyZSB0aGUgc2Vzc2lvblxuICAgICAqL1xuICAgIHVuc2hhcmUob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZGVsZXRlKHtcbiAgICAgICAgICAgIHVybDogXCIvc2Vzc2lvbi97aWR9L3NoYXJlXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2hhcmUgYSBzZXNzaW9uXG4gICAgICovXG4gICAgc2hhcmUob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Nlc3Npb24ve2lkfS9zaGFyZVwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgZGlmZiBmb3IgdGhpcyBzZXNzaW9uXG4gICAgICovXG4gICAgZGlmZihvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9zZXNzaW9uL3tpZH0vZGlmZlwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFN1bW1hcml6ZSB0aGUgc2Vzc2lvblxuICAgICAqL1xuICAgIHN1bW1hcml6ZShvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvc2Vzc2lvbi97aWR9L3N1bW1hcml6ZVwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zLmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogTGlzdCBtZXNzYWdlcyBmb3IgYSBzZXNzaW9uXG4gICAgICovXG4gICAgbWVzc2FnZXMob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvc2Vzc2lvbi97aWR9L21lc3NhZ2VcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYW5kIHNlbmQgYSBuZXcgbWVzc2FnZSB0byBhIHNlc3Npb25cbiAgICAgKi9cbiAgICBwcm9tcHQob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Nlc3Npb24ve2lkfS9tZXNzYWdlXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnMuaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgYSBtZXNzYWdlIGZyb20gYSBzZXNzaW9uXG4gICAgICovXG4gICAgbWVzc2FnZShvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9zZXNzaW9uL3tpZH0vbWVzc2FnZS97bWVzc2FnZUlEfVwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhbmQgc2VuZCBhIG5ldyBtZXNzYWdlIHRvIGEgc2Vzc2lvbiwgc3RhcnQgaWYgbmVlZGVkIGFuZCByZXR1cm4gaW1tZWRpYXRlbHlcbiAgICAgKi9cbiAgICBwcm9tcHRBc3luYyhvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvc2Vzc2lvbi97aWR9L3Byb21wdF9hc3luY1wiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zLmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2VuZCBhIG5ldyBjb21tYW5kIHRvIGEgc2Vzc2lvblxuICAgICAqL1xuICAgIGNvbW1hbmQob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Nlc3Npb24ve2lkfS9jb21tYW5kXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnMuaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSdW4gYSBzaGVsbCBjb21tYW5kXG4gICAgICovXG4gICAgc2hlbGwob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Nlc3Npb24ve2lkfS9zaGVsbFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zLmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmV2ZXJ0IGEgbWVzc2FnZVxuICAgICAqL1xuICAgIHJldmVydChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvc2Vzc2lvbi97aWR9L3JldmVydFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zLmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVzdG9yZSBhbGwgcmV2ZXJ0ZWQgbWVzc2FnZXNcbiAgICAgKi9cbiAgICB1bnJldmVydChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvc2Vzc2lvbi97aWR9L3VucmV2ZXJ0XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG59XG5jbGFzcyBDb21tYW5kIGV4dGVuZHMgX0hleUFwaUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogTGlzdCBhbGwgY29tbWFuZHNcbiAgICAgKi9cbiAgICBsaXN0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9jb21tYW5kXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG59XG5jbGFzcyBPYXV0aCBleHRlbmRzIF9IZXlBcGlDbGllbnQge1xuICAgIC8qKlxuICAgICAqIEF1dGhvcml6ZSBhIHByb3ZpZGVyIHVzaW5nIE9BdXRoXG4gICAgICovXG4gICAgYXV0aG9yaXplKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi9wcm92aWRlci97aWR9L29hdXRoL2F1dGhvcml6ZVwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zLmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogSGFuZGxlIE9BdXRoIGNhbGxiYWNrIGZvciBhIHByb3ZpZGVyXG4gICAgICovXG4gICAgY2FsbGJhY2sob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Byb3ZpZGVyL3tpZH0vb2F1dGgvY2FsbGJhY2tcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuY2xhc3MgUHJvdmlkZXIgZXh0ZW5kcyBfSGV5QXBpQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBMaXN0IGFsbCBwcm92aWRlcnNcbiAgICAgKi9cbiAgICBsaXN0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9wcm92aWRlclwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCBwcm92aWRlciBhdXRoZW50aWNhdGlvbiBtZXRob2RzXG4gICAgICovXG4gICAgYXV0aChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvcHJvdmlkZXIvYXV0aFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG9hdXRoID0gbmV3IE9hdXRoKHsgY2xpZW50OiB0aGlzLl9jbGllbnQgfSk7XG59XG5jbGFzcyBGaW5kIGV4dGVuZHMgX0hleUFwaUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogRmluZCB0ZXh0IGluIGZpbGVzXG4gICAgICovXG4gICAgdGV4dChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9maW5kXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRmluZCBmaWxlc1xuICAgICAqL1xuICAgIGZpbGVzKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL2ZpbmQvZmlsZVwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEZpbmQgd29ya3NwYWNlIHN5bWJvbHNcbiAgICAgKi9cbiAgICBzeW1ib2xzKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL2ZpbmQvc3ltYm9sXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG59XG5jbGFzcyBGaWxlIGV4dGVuZHMgX0hleUFwaUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogTGlzdCBmaWxlcyBhbmQgZGlyZWN0b3JpZXNcbiAgICAgKi9cbiAgICBsaXN0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL2ZpbGVcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZWFkIGEgZmlsZVxuICAgICAqL1xuICAgIHJlYWQob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvZmlsZS9jb250ZW50XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0IGZpbGUgc3RhdHVzXG4gICAgICovXG4gICAgc3RhdHVzKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9maWxlL3N0YXR1c1wiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuY2xhc3MgQXBwIGV4dGVuZHMgX0hleUFwaUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogV3JpdGUgYSBsb2cgZW50cnkgdG8gdGhlIHNlcnZlciBsb2dzXG4gICAgICovXG4gICAgbG9nKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvbG9nXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnM/LmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogTGlzdCBhbGwgYWdlbnRzXG4gICAgICovXG4gICAgYWdlbnRzKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9hZ2VudFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuY2xhc3MgQXV0aCBleHRlbmRzIF9IZXlBcGlDbGllbnQge1xuICAgIC8qKlxuICAgICAqIFJlbW92ZSBPQXV0aCBjcmVkZW50aWFscyBmb3IgYW4gTUNQIHNlcnZlclxuICAgICAqL1xuICAgIHJlbW92ZShvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5kZWxldGUoe1xuICAgICAgICAgICAgdXJsOiBcIi9tY3Ave25hbWV9L2F1dGhcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTdGFydCBPQXV0aCBhdXRoZW50aWNhdGlvbiBmbG93IGZvciBhbiBNQ1Agc2VydmVyXG4gICAgICovXG4gICAgc3RhcnQob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL21jcC97bmFtZX0vYXV0aFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENvbXBsZXRlIE9BdXRoIGF1dGhlbnRpY2F0aW9uIHdpdGggYXV0aG9yaXphdGlvbiBjb2RlXG4gICAgICovXG4gICAgY2FsbGJhY2sob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL21jcC97bmFtZX0vYXV0aC9jYWxsYmFja1wiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zLmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU3RhcnQgT0F1dGggZmxvdyBhbmQgd2FpdCBmb3IgY2FsbGJhY2sgKG9wZW5zIGJyb3dzZXIpXG4gICAgICovXG4gICAgYXV0aGVudGljYXRlKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi9tY3Ave25hbWV9L2F1dGgvYXV0aGVudGljYXRlXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0IGF1dGhlbnRpY2F0aW9uIGNyZWRlbnRpYWxzXG4gICAgICovXG4gICAgc2V0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnB1dCh7XG4gICAgICAgICAgICB1cmw6IFwiL2F1dGgve2lkfVwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zLmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG59XG5jbGFzcyBNY3AgZXh0ZW5kcyBfSGV5QXBpQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBHZXQgTUNQIHNlcnZlciBzdGF0dXNcbiAgICAgKi9cbiAgICBzdGF0dXMob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL21jcFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFkZCBNQ1Agc2VydmVyIGR5bmFtaWNhbGx5XG4gICAgICovXG4gICAgYWRkKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvbWNwXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnM/LmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ29ubmVjdCBhbiBNQ1Agc2VydmVyXG4gICAgICovXG4gICAgY29ubmVjdChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvbWNwL3tuYW1lfS9jb25uZWN0XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGlzY29ubmVjdCBhbiBNQ1Agc2VydmVyXG4gICAgICovXG4gICAgZGlzY29ubmVjdChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvbWNwL3tuYW1lfS9kaXNjb25uZWN0XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgYXV0aCA9IG5ldyBBdXRoKHsgY2xpZW50OiB0aGlzLl9jbGllbnQgfSk7XG59XG5jbGFzcyBMc3AgZXh0ZW5kcyBfSGV5QXBpQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBHZXQgTFNQIHNlcnZlciBzdGF0dXNcbiAgICAgKi9cbiAgICBzdGF0dXMob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL2xzcFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuY2xhc3MgRm9ybWF0dGVyIGV4dGVuZHMgX0hleUFwaUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogR2V0IGZvcm1hdHRlciBzdGF0dXNcbiAgICAgKi9cbiAgICBzdGF0dXMob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL2Zvcm1hdHRlclwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuY2xhc3MgQ29udHJvbCBleHRlbmRzIF9IZXlBcGlDbGllbnQge1xuICAgIC8qKlxuICAgICAqIEdldCB0aGUgbmV4dCBUVUkgcmVxdWVzdCBmcm9tIHRoZSBxdWV1ZVxuICAgICAqL1xuICAgIG5leHQob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL3R1aS9jb250cm9sL25leHRcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTdWJtaXQgYSByZXNwb25zZSB0byB0aGUgVFVJIHJlcXVlc3QgcXVldWVcbiAgICAgKi9cbiAgICByZXNwb25zZShvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3R1aS9jb250cm9sL3Jlc3BvbnNlXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnM/LmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG59XG5jbGFzcyBUdWkgZXh0ZW5kcyBfSGV5QXBpQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBBcHBlbmQgcHJvbXB0IHRvIHRoZSBUVUlcbiAgICAgKi9cbiAgICBhcHBlbmRQcm9tcHQob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi90dWkvYXBwZW5kLXByb21wdFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zPy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE9wZW4gdGhlIGhlbHAgZGlhbG9nXG4gICAgICovXG4gICAgb3BlbkhlbHAob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi90dWkvb3Blbi1oZWxwXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogT3BlbiB0aGUgc2Vzc2lvbiBkaWFsb2dcbiAgICAgKi9cbiAgICBvcGVuU2Vzc2lvbnMob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi90dWkvb3Blbi1zZXNzaW9uc1wiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE9wZW4gdGhlIHRoZW1lIGRpYWxvZ1xuICAgICAqL1xuICAgIG9wZW5UaGVtZXMob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi90dWkvb3Blbi10aGVtZXNcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBPcGVuIHRoZSBtb2RlbCBkaWFsb2dcbiAgICAgKi9cbiAgICBvcGVuTW9kZWxzKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvdHVpL29wZW4tbW9kZWxzXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU3VibWl0IHRoZSBwcm9tcHRcbiAgICAgKi9cbiAgICBzdWJtaXRQcm9tcHQob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi90dWkvc3VibWl0LXByb21wdFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENsZWFyIHRoZSBwcm9tcHRcbiAgICAgKi9cbiAgICBjbGVhclByb21wdChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3R1aS9jbGVhci1wcm9tcHRcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBFeGVjdXRlIGEgVFVJIGNvbW1hbmQgKGUuZy4gYWdlbnRfY3ljbGUpXG4gICAgICovXG4gICAgZXhlY3V0ZUNvbW1hbmQob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi90dWkvZXhlY3V0ZS1jb21tYW5kXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnM/LmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2hvdyBhIHRvYXN0IG5vdGlmaWNhdGlvbiBpbiB0aGUgVFVJXG4gICAgICovXG4gICAgc2hvd1RvYXN0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvdHVpL3Nob3ctdG9hc3RcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucz8uaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQdWJsaXNoIGEgVFVJIGV2ZW50XG4gICAgICovXG4gICAgcHVibGlzaChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3R1aS9wdWJsaXNoXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnM/LmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgY29udHJvbCA9IG5ldyBDb250cm9sKHsgY2xpZW50OiB0aGlzLl9jbGllbnQgfSk7XG59XG5jbGFzcyBFdmVudCBleHRlbmRzIF9IZXlBcGlDbGllbnQge1xuICAgIC8qKlxuICAgICAqIEdldCBldmVudHNcbiAgICAgKi9cbiAgICBzdWJzY3JpYmUob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldC5zc2Uoe1xuICAgICAgICAgICAgdXJsOiBcIi9ldmVudFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIE9wZW5jb2RlQ2xpZW50IGV4dGVuZHMgX0hleUFwaUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogUmVzcG9uZCB0byBhIHBlcm1pc3Npb24gcmVxdWVzdFxuICAgICAqL1xuICAgIHBvc3RTZXNzaW9uSWRQZXJtaXNzaW9uc1Blcm1pc3Npb25JZChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvc2Vzc2lvbi97aWR9L3Blcm1pc3Npb25zL3twZXJtaXNzaW9uSUR9XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnMuaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBnbG9iYWwgPSBuZXcgR2xvYmFsKHsgY2xpZW50OiB0aGlzLl9jbGllbnQgfSk7XG4gICAgcHJvamVjdCA9IG5ldyBQcm9qZWN0KHsgY2xpZW50OiB0aGlzLl9jbGllbnQgfSk7XG4gICAgcHR5ID0gbmV3IFB0eSh7IGNsaWVudDogdGhpcy5fY2xpZW50IH0pO1xuICAgIGNvbmZpZyA9IG5ldyBDb25maWcoeyBjbGllbnQ6IHRoaXMuX2NsaWVudCB9KTtcbiAgICB0b29sID0gbmV3IFRvb2woeyBjbGllbnQ6IHRoaXMuX2NsaWVudCB9KTtcbiAgICBpbnN0YW5jZSA9IG5ldyBJbnN0YW5jZSh7IGNsaWVudDogdGhpcy5fY2xpZW50IH0pO1xuICAgIHBhdGggPSBuZXcgUGF0aCh7IGNsaWVudDogdGhpcy5fY2xpZW50IH0pO1xuICAgIHZjcyA9IG5ldyBWY3MoeyBjbGllbnQ6IHRoaXMuX2NsaWVudCB9KTtcbiAgICBzZXNzaW9uID0gbmV3IFNlc3Npb24oeyBjbGllbnQ6IHRoaXMuX2NsaWVudCB9KTtcbiAgICBjb21tYW5kID0gbmV3IENvbW1hbmQoeyBjbGllbnQ6IHRoaXMuX2NsaWVudCB9KTtcbiAgICBwcm92aWRlciA9IG5ldyBQcm92aWRlcih7IGNsaWVudDogdGhpcy5fY2xpZW50IH0pO1xuICAgIGZpbmQgPSBuZXcgRmluZCh7IGNsaWVudDogdGhpcy5fY2xpZW50IH0pO1xuICAgIGZpbGUgPSBuZXcgRmlsZSh7IGNsaWVudDogdGhpcy5fY2xpZW50IH0pO1xuICAgIGFwcCA9IG5ldyBBcHAoeyBjbGllbnQ6IHRoaXMuX2NsaWVudCB9KTtcbiAgICBtY3AgPSBuZXcgTWNwKHsgY2xpZW50OiB0aGlzLl9jbGllbnQgfSk7XG4gICAgbHNwID0gbmV3IExzcCh7IGNsaWVudDogdGhpcy5fY2xpZW50IH0pO1xuICAgIGZvcm1hdHRlciA9IG5ldyBGb3JtYXR0ZXIoeyBjbGllbnQ6IHRoaXMuX2NsaWVudCB9KTtcbiAgICB0dWkgPSBuZXcgVHVpKHsgY2xpZW50OiB0aGlzLl9jbGllbnQgfSk7XG4gICAgYXV0aCA9IG5ldyBBdXRoKHsgY2xpZW50OiB0aGlzLl9jbGllbnQgfSk7XG4gICAgZXZlbnQgPSBuZXcgRXZlbnQoeyBjbGllbnQ6IHRoaXMuX2NsaWVudCB9KTtcbn1cbiIsCiAgICAiZXhwb3J0ICogZnJvbSBcIi4vZ2VuL3R5cGVzLmdlbi5qc1wiO1xuaW1wb3J0IHsgY3JlYXRlQ2xpZW50IH0gZnJvbSBcIi4vZ2VuL2NsaWVudC9jbGllbnQuZ2VuLmpzXCI7XG5pbXBvcnQgeyBPcGVuY29kZUNsaWVudCB9IGZyb20gXCIuL2dlbi9zZGsuZ2VuLmpzXCI7XG5leHBvcnQgeyBPcGVuY29kZUNsaWVudCB9O1xuZnVuY3Rpb24gcGljayh2YWx1ZSwgZmFsbGJhY2spIHtcbiAgICBpZiAoIXZhbHVlKVxuICAgICAgICByZXR1cm47XG4gICAgaWYgKCFmYWxsYmFjaylcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIGlmICh2YWx1ZSA9PT0gZmFsbGJhY2spXG4gICAgICAgIHJldHVybiBmYWxsYmFjaztcbiAgICBpZiAodmFsdWUgPT09IGVuY29kZVVSSUNvbXBvbmVudChmYWxsYmFjaykpXG4gICAgICAgIHJldHVybiBmYWxsYmFjaztcbiAgICByZXR1cm4gdmFsdWU7XG59XG5mdW5jdGlvbiByZXdyaXRlKHJlcXVlc3QsIGRpcmVjdG9yeSkge1xuICAgIGlmIChyZXF1ZXN0Lm1ldGhvZCAhPT0gXCJHRVRcIiAmJiByZXF1ZXN0Lm1ldGhvZCAhPT0gXCJIRUFEXCIpXG4gICAgICAgIHJldHVybiByZXF1ZXN0O1xuICAgIGNvbnN0IHZhbHVlID0gcGljayhyZXF1ZXN0LmhlYWRlcnMuZ2V0KFwieC1vcGVuY29kZS1kaXJlY3RvcnlcIiksIGRpcmVjdG9yeSk7XG4gICAgaWYgKCF2YWx1ZSlcbiAgICAgICAgcmV0dXJuIHJlcXVlc3Q7XG4gICAgY29uc3QgdXJsID0gbmV3IFVSTChyZXF1ZXN0LnVybCk7XG4gICAgaWYgKCF1cmwuc2VhcmNoUGFyYW1zLmhhcyhcImRpcmVjdG9yeVwiKSkge1xuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLnNldChcImRpcmVjdG9yeVwiLCB2YWx1ZSk7XG4gICAgfVxuICAgIGNvbnN0IG5leHQgPSBuZXcgUmVxdWVzdCh1cmwsIHJlcXVlc3QpO1xuICAgIG5leHQuaGVhZGVycy5kZWxldGUoXCJ4LW9wZW5jb2RlLWRpcmVjdG9yeVwiKTtcbiAgICByZXR1cm4gbmV4dDtcbn1cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVPcGVuY29kZUNsaWVudChjb25maWcpIHtcbiAgICBpZiAoIWNvbmZpZz8uZmV0Y2gpIHtcbiAgICAgICAgY29uc3QgY3VzdG9tRmV0Y2ggPSAocmVxKSA9PiB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICByZXEudGltZW91dCA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuIGZldGNoKHJlcSk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbmZpZyA9IHtcbiAgICAgICAgICAgIC4uLmNvbmZpZyxcbiAgICAgICAgICAgIGZldGNoOiBjdXN0b21GZXRjaCxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgaWYgKGNvbmZpZz8uZGlyZWN0b3J5KSB7XG4gICAgICAgIGNvbmZpZy5oZWFkZXJzID0ge1xuICAgICAgICAgICAgLi4uY29uZmlnLmhlYWRlcnMsXG4gICAgICAgICAgICBcIngtb3BlbmNvZGUtZGlyZWN0b3J5XCI6IGVuY29kZVVSSUNvbXBvbmVudChjb25maWcuZGlyZWN0b3J5KSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgY29uc3QgY2xpZW50ID0gY3JlYXRlQ2xpZW50KGNvbmZpZyk7XG4gICAgY2xpZW50LmludGVyY2VwdG9ycy5yZXF1ZXN0LnVzZSgocmVxdWVzdCkgPT4gcmV3cml0ZShyZXF1ZXN0LCBjb25maWc/LmRpcmVjdG9yeSkpO1xuICAgIHJldHVybiBuZXcgT3BlbmNvZGVDbGllbnQoeyBjbGllbnQgfSk7XG59XG4iLAogICAgImltcG9ydCBsYXVuY2ggZnJvbSBcImNyb3NzLXNwYXduXCI7XG5pbXBvcnQgeyBzdG9wLCBiaW5kQWJvcnQgfSBmcm9tIFwiLi9wcm9jZXNzLmpzXCI7XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY3JlYXRlT3BlbmNvZGVTZXJ2ZXIob3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgaG9zdG5hbWU6IFwiMTI3LjAuMC4xXCIsXG4gICAgICAgIHBvcnQ6IDQwOTYsXG4gICAgICAgIHRpbWVvdXQ6IDUwMDAsXG4gICAgfSwgb3B0aW9ucyA/PyB7fSk7XG4gICAgY29uc3QgYXJncyA9IFtgc2VydmVgLCBgLS1ob3N0bmFtZT0ke29wdGlvbnMuaG9zdG5hbWV9YCwgYC0tcG9ydD0ke29wdGlvbnMucG9ydH1gXTtcbiAgICBpZiAob3B0aW9ucy5jb25maWc/LmxvZ0xldmVsKVxuICAgICAgICBhcmdzLnB1c2goYC0tbG9nLWxldmVsPSR7b3B0aW9ucy5jb25maWcubG9nTGV2ZWx9YCk7XG4gICAgY29uc3QgcHJvYyA9IGxhdW5jaChgb3BlbmNvZGVgLCBhcmdzLCB7XG4gICAgICAgIGVudjoge1xuICAgICAgICAgICAgLi4ucHJvY2Vzcy5lbnYsXG4gICAgICAgICAgICBPUEVOQ09ERV9DT05GSUdfQ09OVEVOVDogSlNPTi5zdHJpbmdpZnkob3B0aW9ucy5jb25maWcgPz8ge30pLFxuICAgICAgICB9LFxuICAgIH0pO1xuICAgIGxldCBjbGVhciA9ICgpID0+IHsgfTtcbiAgICBjb25zdCB1cmwgPSBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGNvbnN0IGlkID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBjbGVhcigpO1xuICAgICAgICAgICAgc3RvcChwcm9jKTtcbiAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoYFRpbWVvdXQgd2FpdGluZyBmb3Igc2VydmVyIHRvIHN0YXJ0IGFmdGVyICR7b3B0aW9ucy50aW1lb3V0fW1zYCkpO1xuICAgICAgICB9LCBvcHRpb25zLnRpbWVvdXQpO1xuICAgICAgICBsZXQgb3V0cHV0ID0gXCJcIjtcbiAgICAgICAgbGV0IHJlc29sdmVkID0gZmFsc2U7XG4gICAgICAgIHByb2Muc3Rkb3V0Py5vbihcImRhdGFcIiwgKGNodW5rKSA9PiB7XG4gICAgICAgICAgICBpZiAocmVzb2x2ZWQpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgb3V0cHV0ICs9IGNodW5rLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICBjb25zdCBsaW5lcyA9IG91dHB1dC5zcGxpdChcIlxcblwiKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgbGluZSBvZiBsaW5lcykge1xuICAgICAgICAgICAgICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgoXCJvcGVuY29kZSBzZXJ2ZXIgbGlzdGVuaW5nXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoID0gbGluZS5tYXRjaCgvb25cXHMrKGh0dHBzPzpcXC9cXC9bXlxcc10rKS8pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGVhcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RvcChwcm9jKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dChpZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKGBGYWlsZWQgdG8gcGFyc2Ugc2VydmVyIHVybCBmcm9tIG91dHB1dDogJHtsaW5lfWApKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoaWQpO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUobWF0Y2hbMV0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcHJvYy5zdGRlcnI/Lm9uKFwiZGF0YVwiLCAoY2h1bmspID0+IHtcbiAgICAgICAgICAgIG91dHB1dCArPSBjaHVuay50b1N0cmluZygpO1xuICAgICAgICB9KTtcbiAgICAgICAgcHJvYy5vbihcImV4aXRcIiwgKGNvZGUpID0+IHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChpZCk7XG4gICAgICAgICAgICBsZXQgbXNnID0gYFNlcnZlciBleGl0ZWQgd2l0aCBjb2RlICR7Y29kZX1gO1xuICAgICAgICAgICAgaWYgKG91dHB1dC50cmltKCkpIHtcbiAgICAgICAgICAgICAgICBtc2cgKz0gYFxcblNlcnZlciBvdXRwdXQ6ICR7b3V0cHV0fWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZWplY3QobmV3IEVycm9yKG1zZykpO1xuICAgICAgICB9KTtcbiAgICAgICAgcHJvYy5vbihcImVycm9yXCIsIChlcnJvcikgPT4ge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGlkKTtcbiAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgIH0pO1xuICAgICAgICBjbGVhciA9IGJpbmRBYm9ydChwcm9jLCBvcHRpb25zLnNpZ25hbCwgKCkgPT4ge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGlkKTtcbiAgICAgICAgICAgIHJlamVjdChvcHRpb25zLnNpZ25hbD8ucmVhc29uKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdXJsLFxuICAgICAgICBjbG9zZSgpIHtcbiAgICAgICAgICAgIGNsZWFyKCk7XG4gICAgICAgICAgICBzdG9wKHByb2MpO1xuICAgICAgICB9LFxuICAgIH07XG59XG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlT3BlbmNvZGVUdWkob3B0aW9ucykge1xuICAgIGNvbnN0IGFyZ3MgPSBbXTtcbiAgICBpZiAob3B0aW9ucz8ucHJvamVjdCkge1xuICAgICAgICBhcmdzLnB1c2goYC0tcHJvamVjdD0ke29wdGlvbnMucHJvamVjdH1gKTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnM/Lm1vZGVsKSB7XG4gICAgICAgIGFyZ3MucHVzaChgLS1tb2RlbD0ke29wdGlvbnMubW9kZWx9YCk7XG4gICAgfVxuICAgIGlmIChvcHRpb25zPy5zZXNzaW9uKSB7XG4gICAgICAgIGFyZ3MucHVzaChgLS1zZXNzaW9uPSR7b3B0aW9ucy5zZXNzaW9ufWApO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucz8uYWdlbnQpIHtcbiAgICAgICAgYXJncy5wdXNoKGAtLWFnZW50PSR7b3B0aW9ucy5hZ2VudH1gKTtcbiAgICB9XG4gICAgY29uc3QgcHJvYyA9IGxhdW5jaChgb3BlbmNvZGVgLCBhcmdzLCB7XG4gICAgICAgIHN0ZGlvOiBcImluaGVyaXRcIixcbiAgICAgICAgZW52OiB7XG4gICAgICAgICAgICAuLi5wcm9jZXNzLmVudixcbiAgICAgICAgICAgIE9QRU5DT0RFX0NPTkZJR19DT05URU5UOiBKU09OLnN0cmluZ2lmeShvcHRpb25zPy5jb25maWcgPz8ge30pLFxuICAgICAgICB9LFxuICAgIH0pO1xuICAgIGNvbnN0IGNsZWFyID0gYmluZEFib3J0KHByb2MsIG9wdGlvbnM/LnNpZ25hbCk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY2xvc2UoKSB7XG4gICAgICAgICAgICBjbGVhcigpO1xuICAgICAgICAgICAgc3RvcChwcm9jKTtcbiAgICAgICAgfSxcbiAgICB9O1xufVxuIiwKICAgICJpbXBvcnQgeyBzcGF3blN5bmMgfSBmcm9tIFwibm9kZTpjaGlsZF9wcm9jZXNzXCI7XG4vLyBEdXBsaWNhdGVkIGZyb20gYHBhY2thZ2VzL29wZW5jb2RlL3NyYy91dGlsL3Byb2Nlc3MudHNgIGJlY2F1c2UgdGhlIFNESyBjYW5ub3Rcbi8vIGltcG9ydCBgb3BlbmNvZGVgIHdpdGhvdXQgY3JlYXRpbmcgYSBjeWNsZSAoYG9wZW5jb2RlYCBkZXBlbmRzIG9uIGBAb3BlbmNvZGUtYWkvc2RrYCkuXG5leHBvcnQgZnVuY3Rpb24gc3RvcChwcm9jKSB7XG4gICAgaWYgKHByb2MuZXhpdENvZGUgIT09IG51bGwgfHwgcHJvYy5zaWduYWxDb2RlICE9PSBudWxsKVxuICAgICAgICByZXR1cm47XG4gICAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09IFwid2luMzJcIiAmJiBwcm9jLnBpZCkge1xuICAgICAgICBjb25zdCBvdXQgPSBzcGF3blN5bmMoXCJ0YXNra2lsbFwiLCBbXCIvcGlkXCIsIFN0cmluZyhwcm9jLnBpZCksIFwiL1RcIiwgXCIvRlwiXSwgeyB3aW5kb3dzSGlkZTogdHJ1ZSB9KTtcbiAgICAgICAgaWYgKCFvdXQuZXJyb3IgJiYgb3V0LnN0YXR1cyA9PT0gMClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcHJvYy5raWxsKCk7XG59XG5leHBvcnQgZnVuY3Rpb24gYmluZEFib3J0KHByb2MsIHNpZ25hbCwgb25BYm9ydCkge1xuICAgIGlmICghc2lnbmFsKVxuICAgICAgICByZXR1cm4gKCkgPT4geyB9O1xuICAgIGNvbnN0IGFib3J0ID0gKCkgPT4ge1xuICAgICAgICBjbGVhcigpO1xuICAgICAgICBzdG9wKHByb2MpO1xuICAgICAgICBvbkFib3J0Py4oKTtcbiAgICB9O1xuICAgIGNvbnN0IGNsZWFyID0gKCkgPT4ge1xuICAgICAgICBzaWduYWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImFib3J0XCIsIGFib3J0KTtcbiAgICAgICAgcHJvYy5vZmYoXCJleGl0XCIsIGNsZWFyKTtcbiAgICAgICAgcHJvYy5vZmYoXCJlcnJvclwiLCBjbGVhcik7XG4gICAgfTtcbiAgICBzaWduYWwuYWRkRXZlbnRMaXN0ZW5lcihcImFib3J0XCIsIGFib3J0LCB7IG9uY2U6IHRydWUgfSk7XG4gICAgcHJvYy5vbihcImV4aXRcIiwgY2xlYXIpO1xuICAgIHByb2Mub24oXCJlcnJvclwiLCBjbGVhcik7XG4gICAgaWYgKHNpZ25hbC5hYm9ydGVkKVxuICAgICAgICBhYm9ydCgpO1xuICAgIHJldHVybiBjbGVhcjtcbn1cbiIsCiAgICAiZXhwb3J0ICogZnJvbSBcIi4vY2xpZW50LmpzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9zZXJ2ZXIuanNcIjtcbmltcG9ydCB7IGNyZWF0ZU9wZW5jb2RlQ2xpZW50IH0gZnJvbSBcIi4vY2xpZW50LmpzXCI7XG5pbXBvcnQgeyBjcmVhdGVPcGVuY29kZVNlcnZlciB9IGZyb20gXCIuL3NlcnZlci5qc1wiO1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZU9wZW5jb2RlKG9wdGlvbnMpIHtcbiAgICBjb25zdCBzZXJ2ZXIgPSBhd2FpdCBjcmVhdGVPcGVuY29kZVNlcnZlcih7XG4gICAgICAgIC4uLm9wdGlvbnMsXG4gICAgfSk7XG4gICAgY29uc3QgY2xpZW50ID0gY3JlYXRlT3BlbmNvZGVDbGllbnQoe1xuICAgICAgICBiYXNlVXJsOiBzZXJ2ZXIudXJsLFxuICAgIH0pO1xuICAgIHJldHVybiB7XG4gICAgICAgIGNsaWVudCxcbiAgICAgICAgc2VydmVyLFxuICAgIH07XG59XG4iLAogICAgImltcG9ydCBmcyBmcm9tIFwibm9kZTpmcy9wcm9taXNlc1wiO1xuLyoqXG4gKiBTdHJ1Y3R1cmVkIGxvZ2dpbmcgZm9yIGFpLWVuZyByYWxwaFxuICpcbiAqIFN1cHBvcnRzIGJvdGggc3RkZXJyIG91dHB1dCAod2l0aCAtLXByaW50LWxvZ3MpIGFuZCBmaWxlLWJhc2VkIGxvZ2dpbmdcbiAqL1xuaW1wb3J0IHBhdGggZnJvbSBcIm5vZGU6cGF0aFwiO1xuXG5leHBvcnQgbmFtZXNwYWNlIExvZyB7XG4gICAgZXhwb3J0IHR5cGUgTGV2ZWwgPSBcIkRFQlVHXCIgfCBcIklORk9cIiB8IFwiV0FSTlwiIHwgXCJFUlJPUlwiO1xuXG4gICAgY29uc3QgbGV2ZWxQcmlvcml0eTogUmVjb3JkPExldmVsLCBudW1iZXI+ID0ge1xuICAgICAgICBERUJVRzogMCxcbiAgICAgICAgSU5GTzogMSxcbiAgICAgICAgV0FSTjogMixcbiAgICAgICAgRVJST1I6IDMsXG4gICAgfTtcblxuICAgIGxldCBjdXJyZW50TGV2ZWw6IExldmVsID0gXCJJTkZPXCI7XG4gICAgbGV0IGxvZ1BhdGggPSBcIlwiO1xuICAgIGxldCB3cml0ZTogKG1zZzogc3RyaW5nKSA9PiBhbnkgPSAobXNnKSA9PiBwcm9jZXNzLnN0ZGVyci53cml0ZShtc2cpO1xuXG4gICAgZnVuY3Rpb24gc2hvdWxkTG9nKGxldmVsOiBMZXZlbCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gbGV2ZWxQcmlvcml0eVtsZXZlbF0gPj0gbGV2ZWxQcmlvcml0eVtjdXJyZW50TGV2ZWxdO1xuICAgIH1cblxuICAgIGV4cG9ydCBpbnRlcmZhY2UgT3B0aW9ucyB7XG4gICAgICAgIHByaW50OiBib29sZWFuOyAvLyBXaGVuIHRydWUsIHdyaXRlIHRvIHN0ZGVyclxuICAgICAgICBsZXZlbD86IExldmVsO1xuICAgICAgICBsb2dEaXI/OiBzdHJpbmc7IC8vIERpcmVjdG9yeSBmb3IgbG9nIGZpbGVzXG4gICAgfVxuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGZpbGUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGxvZ1BhdGg7XG4gICAgfVxuXG4gICAgZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGluaXQob3B0aW9uczogT3B0aW9ucyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBpZiAob3B0aW9ucy5sZXZlbCkgY3VycmVudExldmVsID0gb3B0aW9ucy5sZXZlbDtcblxuICAgICAgICAvLyBCdWlsZCB0aGUgd3JpdGUgZnVuY3Rpb24gdGhhdCBvdXRwdXRzIHRvIEJPVEggc3RkZXJyIEFORCBmaWxlXG4gICAgICAgIGNvbnN0IHN0ZGVycldyaXRlciA9IChtc2c6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgcHJvY2Vzcy5zdGRlcnIud3JpdGUobXNnKTtcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAob3B0aW9ucy5sb2dEaXIpIHtcbiAgICAgICAgICAgIGNvbnN0IHRpbWVzdGFtcCA9IG5ldyBEYXRlKClcbiAgICAgICAgICAgICAgICAudG9JU09TdHJpbmcoKVxuICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9bOi5dL2csIFwiLVwiKVxuICAgICAgICAgICAgICAgIC5zbGljZSgwLCAtMSk7XG4gICAgICAgICAgICBsb2dQYXRoID0gcGF0aC5qb2luKG9wdGlvbnMubG9nRGlyLCBgcmFscGgtJHt0aW1lc3RhbXB9LmxvZ2ApO1xuICAgICAgICAgICAgYXdhaXQgZnMubWtkaXIob3B0aW9ucy5sb2dEaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuXG4gICAgICAgICAgICBjb25zdCBmaWxlID0gQnVuLmZpbGUobG9nUGF0aCk7XG4gICAgICAgICAgICBjb25zdCBmaWxlV3JpdGVyID0gZmlsZS53cml0ZXIoKTtcblxuICAgICAgICAgICAgLy8gQWx3YXlzIHdyaXRlIHRvIHN0ZGVyciBpZiBwcmludCBpcyBlbmFibGVkXG4gICAgICAgICAgICAvLyBBbHNvIGFsd2F5cyB3cml0ZSB0byBmaWxlIGlmIGxvZ0RpciBpcyBwcm92aWRlZFxuICAgICAgICAgICAgd3JpdGUgPSAobXNnKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMucHJpbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RkZXJyV3JpdGVyKG1zZyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbGVXcml0ZXIud3JpdGUobXNnKTtcbiAgICAgICAgICAgICAgICBmaWxlV3JpdGVyLmZsdXNoKCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbnMucHJpbnQpIHtcbiAgICAgICAgICAgIC8vIE9ubHkgcHJpbnQgdG8gc3RkZXJyXG4gICAgICAgICAgICB3cml0ZSA9IHN0ZGVycldyaXRlcjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGV4cG9ydCBpbnRlcmZhY2UgTG9nZ2VyIHtcbiAgICAgICAgZGVidWcobWVzc2FnZTogc3RyaW5nLCBleHRyYT86IFJlY29yZDxzdHJpbmcsIGFueT4pOiB2b2lkO1xuICAgICAgICBpbmZvKG1lc3NhZ2U6IHN0cmluZywgZXh0cmE/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+KTogdm9pZDtcbiAgICAgICAgd2FybihtZXNzYWdlOiBzdHJpbmcsIGV4dHJhPzogUmVjb3JkPHN0cmluZywgYW55Pik6IHZvaWQ7XG4gICAgICAgIGVycm9yKG1lc3NhZ2U6IHN0cmluZywgZXh0cmE/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+KTogdm9pZDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBmb3JtYXRFeHRyYShleHRyYT86IFJlY29yZDxzdHJpbmcsIGFueT4pOiBzdHJpbmcge1xuICAgICAgICBpZiAoIWV4dHJhKSByZXR1cm4gXCJcIjtcbiAgICAgICAgY29uc3QgZXh0cmFTdHIgPSBPYmplY3QuZW50cmllcyhleHRyYSlcbiAgICAgICAgICAgIC5tYXAoXG4gICAgICAgICAgICAgICAgKFtrLCB2XSkgPT5cbiAgICAgICAgICAgICAgICAgICAgYCR7a309JHt0eXBlb2YgdiA9PT0gXCJvYmplY3RcIiA/IEpTT04uc3RyaW5naWZ5KHYpIDogdn1gLFxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgLmpvaW4oXCIgXCIpO1xuICAgICAgICByZXR1cm4gZXh0cmFTdHIgPyBgICR7ZXh0cmFTdHJ9YCA6IFwiXCI7XG4gICAgfVxuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZSh0YWdzPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPik6IExvZ2dlciB7XG4gICAgICAgIGNvbnN0IHRhZ1N0ciA9IHRhZ3NcbiAgICAgICAgICAgID8gT2JqZWN0LmVudHJpZXModGFncylcbiAgICAgICAgICAgICAgICAgIC5tYXAoKFtrLCB2XSkgPT4gYCR7a309JHt2fWApXG4gICAgICAgICAgICAgICAgICAuam9pbihcIiBcIilcbiAgICAgICAgICAgIDogXCJcIjtcbiAgICAgICAgY29uc3QgdGFnU3RyV2l0aFNwYWNlID0gdGFnU3RyID8gYCR7dGFnU3RyfSBgIDogXCJcIjtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGVidWcobWVzc2FnZTogc3RyaW5nLCBleHRyYT86IFJlY29yZDxzdHJpbmcsIGFueT4pIHtcbiAgICAgICAgICAgICAgICBpZiAoc2hvdWxkTG9nKFwiREVCVUdcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgd3JpdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICBgREVCVUcgJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCl9ICR7dGFnU3RyfSR7bWVzc2FnZX0ke2Zvcm1hdEV4dHJhKGV4dHJhKX1cXG5gLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBpbmZvKG1lc3NhZ2U6IHN0cmluZywgZXh0cmE/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+KSB7XG4gICAgICAgICAgICAgICAgaWYgKHNob3VsZExvZyhcIklORk9cIikpIHtcbiAgICAgICAgICAgICAgICAgICAgd3JpdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICBgSU5GTyAgJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCl9ICR7dGFnU3RyfSR7bWVzc2FnZX0ke2Zvcm1hdEV4dHJhKGV4dHJhKX1cXG5gLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB3YXJuKG1lc3NhZ2U6IHN0cmluZywgZXh0cmE/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+KSB7XG4gICAgICAgICAgICAgICAgaWYgKHNob3VsZExvZyhcIldBUk5cIikpIHtcbiAgICAgICAgICAgICAgICAgICAgd3JpdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICBgV0FSTiAgJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCl9ICR7dGFnU3RyfSR7bWVzc2FnZX0ke2Zvcm1hdEV4dHJhKGV4dHJhKX1cXG5gLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlcnJvcihtZXNzYWdlOiBzdHJpbmcsIGV4dHJhPzogUmVjb3JkPHN0cmluZywgYW55Pikge1xuICAgICAgICAgICAgICAgIGlmIChzaG91bGRMb2coXCJFUlJPUlwiKSkge1xuICAgICAgICAgICAgICAgICAgICB3cml0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIGBFUlJPUiAke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKX0gJHt0YWdTdHJ9JHttZXNzYWdlfSR7Zm9ybWF0RXh0cmEoZXh0cmEpfVxcbmAsXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBleHBvcnQgY29uc3QgRGVmYXVsdCA9IGNyZWF0ZSh7IHNlcnZpY2U6IFwicmFscGhcIiB9KTtcbn1cbiIsCiAgICAiLyoqXG4gKiBDTEkgVUkgdXRpbGl0aWVzIGZvciBhaS1lbmcgcmFscGhcbiAqXG4gKiBDb25zb2xlIHN0eWxpbmcgYW5kIG91dHB1dCBoZWxwZXJzXG4gKi9cbmltcG9ydCB7IEVPTCB9IGZyb20gXCJub2RlOm9zXCI7XG5cbmV4cG9ydCBuYW1lc3BhY2UgVUkge1xuICAgIGV4cG9ydCBjb25zdCBTdHlsZSA9IHtcbiAgICAgICAgLy8gQ29sb3JzXG4gICAgICAgIFRFWFRfSElHSExJR0hUOiBcIlxceDFiWzk2bVwiLFxuICAgICAgICBURVhUX0hJR0hMSUdIVF9CT0xEOiBcIlxceDFiWzk2bVxceDFiWzFtXCIsXG4gICAgICAgIFRFWFRfRElNOiBcIlxceDFiWzkwbVwiLFxuICAgICAgICBURVhUX0RJTV9CT0xEOiBcIlxceDFiWzkwbVxceDFiWzFtXCIsXG4gICAgICAgIFRFWFRfTk9STUFMOiBcIlxceDFiWzBtXCIsXG4gICAgICAgIFRFWFRfTk9STUFMX0JPTEQ6IFwiXFx4MWJbMW1cIixcbiAgICAgICAgVEVYVF9XQVJOSU5HOiBcIlxceDFiWzkzbVwiLFxuICAgICAgICBURVhUX1dBUk5JTkdfQk9MRDogXCJcXHgxYls5M21cXHgxYlsxbVwiLFxuICAgICAgICBURVhUX0RBTkdFUjogXCJcXHgxYls5MW1cIixcbiAgICAgICAgVEVYVF9EQU5HRVJfQk9MRDogXCJcXHgxYls5MW1cXHgxYlsxbVwiLFxuICAgICAgICBURVhUX1NVQ0NFU1M6IFwiXFx4MWJbOTJtXCIsXG4gICAgICAgIFRFWFRfU1VDQ0VTU19CT0xEOiBcIlxceDFiWzkybVxceDFiWzFtXCIsXG4gICAgICAgIFRFWFRfSU5GTzogXCJcXHgxYls5NG1cIixcbiAgICAgICAgVEVYVF9JTkZPX0JPTEQ6IFwiXFx4MWJbOTRtXFx4MWJbMW1cIixcbiAgICB9O1xuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHByaW50bG4oLi4ubWVzc2FnZTogc3RyaW5nW10pOiB2b2lkIHtcbiAgICAgICAgcHJvY2Vzcy5zdGRlcnIud3JpdGUobWVzc2FnZS5qb2luKFwiIFwiKSArIEVPTCk7XG4gICAgfVxuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHByaW50KC4uLm1lc3NhZ2U6IHN0cmluZ1tdKTogdm9pZCB7XG4gICAgICAgIHByb2Nlc3Muc3RkZXJyLndyaXRlKG1lc3NhZ2Uuam9pbihcIiBcIikpO1xuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiBlcnJvcihtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgcHJpbnRsbihcbiAgICAgICAgICAgIGAke1N0eWxlLlRFWFRfREFOR0VSX0JPTER9RXJyb3I6ICR7U3R5bGUuVEVYVF9OT1JNQUx9JHttZXNzYWdlfWAsXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHN1Y2Nlc3MobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIHByaW50bG4oYCR7U3R5bGUuVEVYVF9TVUNDRVNTX0JPTER94pyTICR7U3R5bGUuVEVYVF9OT1JNQUx9JHttZXNzYWdlfWApO1xuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiBpbmZvKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBwcmludGxuKGAke1N0eWxlLlRFWFRfSU5GT19CT0xEfeKEuSAke1N0eWxlLlRFWFRfTk9STUFMfSR7bWVzc2FnZX1gKTtcbiAgICB9XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gd2FybihtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgcHJpbnRsbihgJHtTdHlsZS5URVhUX1dBUk5JTkdfQk9MRH0hICR7U3R5bGUuVEVYVF9OT1JNQUx9JHttZXNzYWdlfWApO1xuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiBoZWFkZXIodGl0bGU6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBwcmludGxuKCk7XG4gICAgICAgIHByaW50bG4oU3R5bGUuVEVYVF9ISUdITElHSFRfQk9MRCArIHRpdGxlICsgU3R5bGUuVEVYVF9OT1JNQUwpO1xuICAgICAgICBwcmludGxuKFN0eWxlLlRFWFRfRElNICsgXCLilIBcIi5yZXBlYXQoNTApICsgU3R5bGUuVEVYVF9OT1JNQUwpO1xuICAgIH1cbn1cbiIsCiAgICAiLyoqXG4gKiBQcm9tcHQgQW5hbHl6ZXJcbiAqXG4gKiBBbmFseXplcyB1c2VyIHByb21wdHMgdG8gZGV0ZXJtaW5lIGNvbXBsZXhpdHksIGRvbWFpbixcbiAqIGFuZCBtaXNzaW5nIGNvbnRleHQuIFVzZXMgYSBjb21iaW5hdGlvbiBvZiB3b3JkIGNvdW50LFxuICoga2V5d29yZCBkZXRlY3Rpb24sIGFuZCBwYXR0ZXJuIG1hdGNoaW5nLlxuICovXG5cbmltcG9ydCB0eXBlIHsgQW5hbHlzaXNSZXN1bHQsIENvbXBsZXhpdHksIERvbWFpbiwgVGVjaG5pcXVlSWQgfSBmcm9tIFwiLi90eXBlc1wiO1xuXG4vKipcbiAqIEtleXdvcmRzIGZvciBjb21wbGV4aXR5IGRldGVjdGlvblxuICovXG5jb25zdCBDT01QTEVYSVRZX0tFWVdPUkRTID0ge1xuICAgIGRlYnVnOiBbXCJkZWJ1Z1wiLCBcImZpeFwiLCBcImVycm9yXCIsIFwiYnVnXCIsIFwiaXNzdWVcIiwgXCJwcm9ibGVtXCIsIFwidHJvdWJsZXNob290XCJdLFxuICAgIGRlc2lnbjogW1xuICAgICAgICBcImRlc2lnblwiLFxuICAgICAgICBcImFyY2hpdGVjdHVyZVwiLFxuICAgICAgICBcImFyY2hpdGVjdFwiLFxuICAgICAgICBcInN0cnVjdHVyZVwiLFxuICAgICAgICBcInBhdHRlcm5cIixcbiAgICAgICAgXCJhcHByb2FjaFwiLFxuICAgIF0sXG4gICAgb3B0aW1pemU6IFtcbiAgICAgICAgXCJvcHRpbWl6ZVwiLFxuICAgICAgICBcImltcHJvdmVcIixcbiAgICAgICAgXCJwZXJmb3JtYW5jZVwiLFxuICAgICAgICBcImVmZmljaWVudFwiLFxuICAgICAgICBcImZhc3RcIixcbiAgICAgICAgXCJzY2FsZVwiLFxuICAgIF0sXG4gICAgaW1wbGVtZW50OiBbXCJpbXBsZW1lbnRcIiwgXCJidWlsZFwiLCBcImNyZWF0ZVwiLCBcImRldmVsb3BcIiwgXCJ3cml0ZVwiLCBcImNvZGVcIl0sXG4gICAgY29tcGxleDogW1wiY29tcGxleFwiLCBcImNoYWxsZW5nZVwiLCBcImRpZmZpY3VsdFwiLCBcImFkdmFuY2VkXCIsIFwic29waGlzdGljYXRlZFwiXSxcbn07XG5cbi8qKlxuICogRG9tYWluLXNwZWNpZmljIGtleXdvcmRzXG4gKi9cbmNvbnN0IERPTUFJTl9LRVlXT1JEUzogUmVjb3JkPERvbWFpbiwgc3RyaW5nW10+ID0ge1xuICAgIHNlY3VyaXR5OiBbXG4gICAgICAgIFwiYXV0aFwiLFxuICAgICAgICBcImF1dGhlbnRpY2F0aW9uXCIsXG4gICAgICAgIFwiand0XCIsXG4gICAgICAgIFwib2F1dGhcIixcbiAgICAgICAgXCJwYXNzd29yZFwiLFxuICAgICAgICBcImVuY3J5cHRcIixcbiAgICAgICAgXCJkZWNyeXB0XCIsXG4gICAgICAgIFwic2VjdXJpdHlcIixcbiAgICAgICAgXCJ0b2tlblwiLFxuICAgICAgICBcInNlc3Npb25cIixcbiAgICAgICAgXCJjc3JmXCIsXG4gICAgICAgIFwieHNzXCIsXG4gICAgICAgIFwiaW5qZWN0aW9uXCIsXG4gICAgICAgIFwidnVsbmVyYWJpbGl0eVwiLFxuICAgICAgICBcImhhY2tcIixcbiAgICAgICAgXCJhdHRhY2tcIixcbiAgICBdLFxuICAgIGZyb250ZW5kOiBbXG4gICAgICAgIFwicmVhY3RcIixcbiAgICAgICAgXCJ2dWVcIixcbiAgICAgICAgXCJhbmd1bGFyXCIsXG4gICAgICAgIFwiY29tcG9uZW50XCIsXG4gICAgICAgIFwiY3NzXCIsXG4gICAgICAgIFwiaHRtbFwiLFxuICAgICAgICBcInVpXCIsXG4gICAgICAgIFwidXhcIixcbiAgICAgICAgXCJyZW5kZXJcIixcbiAgICAgICAgXCJzdGF0ZVwiLFxuICAgICAgICBcImhvb2tcIixcbiAgICAgICAgXCJwcm9wc1wiLFxuICAgICAgICBcImRvbVwiLFxuICAgICAgICBcImZyb250ZW5kXCIsXG4gICAgICAgIFwiY2xpZW50XCIsXG4gICAgXSxcbiAgICBiYWNrZW5kOiBbXG4gICAgICAgIFwiYXBpXCIsXG4gICAgICAgIFwic2VydmVyXCIsXG4gICAgICAgIFwiZW5kcG9pbnRcIixcbiAgICAgICAgXCJkYXRhYmFzZVwiLFxuICAgICAgICBcInF1ZXJ5XCIsXG4gICAgICAgIFwiYmFja2VuZFwiLFxuICAgICAgICBcInNlcnZpY2VcIixcbiAgICAgICAgXCJtaWNyb3NlcnZpY2VcIixcbiAgICAgICAgXCJyZXN0XCIsXG4gICAgICAgIFwiZ3JhcGhxbFwiLFxuICAgICAgICBcImh0dHBcIixcbiAgICAgICAgXCJyZXF1ZXN0XCIsXG4gICAgICAgIFwicmVzcG9uc2VcIixcbiAgICBdLFxuICAgIGRhdGFiYXNlOiBbXG4gICAgICAgIFwic3FsXCIsXG4gICAgICAgIFwicG9zdGdyZXNxbFwiLFxuICAgICAgICBcIm15c3FsXCIsXG4gICAgICAgIFwibW9uZ29kYlwiLFxuICAgICAgICBcInJlZGlzXCIsXG4gICAgICAgIFwicXVlcnlcIixcbiAgICAgICAgXCJpbmRleFwiLFxuICAgICAgICBcInNjaGVtYVwiLFxuICAgICAgICBcIm1pZ3JhdGlvblwiLFxuICAgICAgICBcImRhdGFiYXNlXCIsXG4gICAgICAgIFwiZGJcIixcbiAgICAgICAgXCJqb2luXCIsXG4gICAgICAgIFwidHJhbnNhY3Rpb25cIixcbiAgICAgICAgXCJvcm1cIixcbiAgICBdLFxuICAgIGRldm9wczogW1xuICAgICAgICBcImRlcGxveVwiLFxuICAgICAgICBcImNpL2NkXCIsXG4gICAgICAgIFwiZG9ja2VyXCIsXG4gICAgICAgIFwia3ViZXJuZXRlc1wiLFxuICAgICAgICBcIms4c1wiLFxuICAgICAgICBcInBpcGVsaW5lXCIsXG4gICAgICAgIFwiaW5mcmFzdHJ1Y3R1cmVcIixcbiAgICAgICAgXCJhd3NcIixcbiAgICAgICAgXCJnY3BcIixcbiAgICAgICAgXCJhenVyZVwiLFxuICAgICAgICBcInRlcnJhZm9ybVwiLFxuICAgICAgICBcImFuc2libGVcIixcbiAgICAgICAgXCJqZW5raW5zXCIsXG4gICAgICAgIFwiZGV2b3BzXCIsXG4gICAgICAgIFwib3BzXCIsXG4gICAgXSxcbiAgICBhcmNoaXRlY3R1cmU6IFtcbiAgICAgICAgXCJhcmNoaXRlY3R1cmVcIixcbiAgICAgICAgXCJkZXNpZ25cIixcbiAgICAgICAgXCJwYXR0ZXJuXCIsXG4gICAgICAgIFwibWljcm9zZXJ2aWNlc1wiLFxuICAgICAgICBcIm1vbm9saXRoXCIsXG4gICAgICAgIFwic2NhbGFiaWxpdHlcIixcbiAgICAgICAgXCJzeXN0ZW1cIixcbiAgICAgICAgXCJkaXN0cmlidXRlZFwiLFxuICAgICAgICBcImFyY2hpdGVjdFwiLFxuICAgICAgICBcImhpZ2gtbGV2ZWxcIixcbiAgICBdLFxuICAgIHRlc3Rpbmc6IFtcbiAgICAgICAgXCJ0ZXN0XCIsXG4gICAgICAgIFwic3BlY1wiLFxuICAgICAgICBcInVuaXQgdGVzdFwiLFxuICAgICAgICBcImludGVncmF0aW9uIHRlc3RcIixcbiAgICAgICAgXCJlMmVcIixcbiAgICAgICAgXCJqZXN0XCIsXG4gICAgICAgIFwiY3lwcmVzc1wiLFxuICAgICAgICBcInBsYXl3cmlnaHRcIixcbiAgICAgICAgXCJ0ZXN0aW5nXCIsXG4gICAgICAgIFwidGRkXCIsXG4gICAgICAgIFwiY292ZXJhZ2VcIixcbiAgICAgICAgXCJtb2NrXCIsXG4gICAgICAgIFwic3R1YlwiLFxuICAgIF0sXG4gICAgZ2VuZXJhbDogW10sIC8vIEZhbGxiYWNrIGRvbWFpblxufTtcblxuLyoqXG4gKiBTaW1wbGUgcHJvbXB0IHBhdHRlcm5zIChncmVldGluZ3MsIHNpbXBsZSBxdWVzdGlvbnMpXG4gKi9cbmNvbnN0IFNJTVBMRV9QQVRURVJOUyA9IFtcbiAgICAvXihoZWxsb3xoaXxoZXl8Z3JlZXRpbmdzfGdvb2QgbW9ybmluZ3xnb29kIGV2ZW5pbmcpL2ksXG4gICAgL14odGhhbmtzfHRoYW5rIHlvdXx0aHgpL2ksXG4gICAgL14oeWVzfG5vfG9rfHN1cmV8YWxyaWdodCkvaSxcbiAgICAvXih3aGF0fGhvd3x3aHl8d2hlbnx3aGVyZXx3aG98d2hpY2gpXFxzK1xcdytcXD8/JC9pLCAvLyBTaW1wbGUgc2luZ2xlIHF1ZXN0aW9uc1xuICAgIC9eKGhlbHB8YXNzaXN0KVxccyokL2ksXG5dO1xuXG4vKipcbiAqIENhbGN1bGF0ZSBjb21wbGV4aXR5IHNjb3JlIGZvciBhIHByb21wdFxuICovXG5mdW5jdGlvbiBjYWxjdWxhdGVDb21wbGV4aXR5U2NvcmUocHJvbXB0OiBzdHJpbmcpOiBudW1iZXIge1xuICAgIGNvbnN0IHdvcmRzID0gcHJvbXB0LnNwbGl0KC9cXHMrLyk7XG4gICAgY29uc3Qgd29yZENvdW50ID0gd29yZHMubGVuZ3RoO1xuXG4gICAgbGV0IHNjb3JlID0gMDtcblxuICAgIC8vIFdvcmQgY291bnQgY29udHJpYnV0aW9uICgwLTEwIHBvaW50cylcbiAgICBpZiAod29yZENvdW50IDwgNSkgc2NvcmUgKz0gMDtcbiAgICBlbHNlIGlmICh3b3JkQ291bnQgPCAxMCkgc2NvcmUgKz0gMztcbiAgICBlbHNlIGlmICh3b3JkQ291bnQgPCAyMCkgc2NvcmUgKz0gNjtcbiAgICBlbHNlIHNjb3JlICs9IDEwO1xuXG4gICAgLy8gS2V5d29yZCBjb250cmlidXRpb24gKDAtMTAgcG9pbnRzKVxuICAgIGNvbnN0IGxvd2VyUHJvbXB0ID0gcHJvbXB0LnRvTG93ZXJDYXNlKCk7XG4gICAgZm9yIChjb25zdCBjYXRlZ29yeSBvZiBPYmplY3QudmFsdWVzKENPTVBMRVhJVFlfS0VZV09SRFMpKSB7XG4gICAgICAgIGZvciAoY29uc3Qga2V5d29yZCBvZiBjYXRlZ29yeSkge1xuICAgICAgICAgICAgaWYgKGxvd2VyUHJvbXB0LmluY2x1ZGVzKGtleXdvcmQpKSB7XG4gICAgICAgICAgICAgICAgc2NvcmUgKz0gMjtcbiAgICAgICAgICAgICAgICBicmVhazsgLy8gT25lIGtleXdvcmQgcGVyIGNhdGVnb3J5XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBRdWVzdGlvbiBtYXJrcyByZWR1Y2UgY29tcGxleGl0eSAoYXNraW5nIGZvciBpbmZvIGlzIHNpbXBsZXIpXG4gICAgY29uc3QgcXVlc3Rpb25NYXJrcyA9IChwcm9tcHQubWF0Y2goL1xcPy9nKSB8fCBbXSkubGVuZ3RoO1xuICAgIHNjb3JlIC09IE1hdGgubWluKHF1ZXN0aW9uTWFya3MgKiAyLCA1KTtcblxuICAgIC8vIFRlY2huaWNhbCB0ZXJtcyBpbmNyZWFzZSBjb21wbGV4aXR5XG4gICAgY29uc3QgdGVjaFRlcm1zID0gd29yZHMuZmlsdGVyKCh3b3JkKSA9PiB7XG4gICAgICAgIGNvbnN0IGxvd2VyID0gd29yZC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgL1xcd3s0LH0vLnRlc3Qod29yZCkgJiZcbiAgICAgICAgICAgICFbXCJ0aGlzXCIsIFwidGhhdFwiLCBcIndpdGhcIiwgXCJmcm9tXCIsIFwiaW50b1wiXS5pbmNsdWRlcyhsb3dlcilcbiAgICAgICAgKTtcbiAgICB9KTtcbiAgICBzY29yZSArPSBNYXRoLm1pbih0ZWNoVGVybXMubGVuZ3RoICogMC41LCA1KTtcblxuICAgIHJldHVybiBNYXRoLm1heCgwLCBNYXRoLm1pbigyMCwgc2NvcmUpKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgY29tcGxleGl0eSBmcm9tIHNjb3JlXG4gKi9cbmZ1bmN0aW9uIHNjb3JlVG9Db21wbGV4aXR5KHNjb3JlOiBudW1iZXIpOiBDb21wbGV4aXR5IHtcbiAgICBpZiAoc2NvcmUgPCA1KSByZXR1cm4gXCJzaW1wbGVcIjtcbiAgICBpZiAoc2NvcmUgPCAxMikgcmV0dXJuIFwibWVkaXVtXCI7XG4gICAgcmV0dXJuIFwiY29tcGxleFwiO1xufVxuXG4vKipcbiAqIENoZWNrIGlmIHByb21wdCBtYXRjaGVzIHNpbXBsZSBwYXR0ZXJuc1xuICovXG5mdW5jdGlvbiBpc1NpbXBsZVByb21wdChwcm9tcHQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGZvciAoY29uc3QgcGF0dGVybiBvZiBTSU1QTEVfUEFUVEVSTlMpIHtcbiAgICAgICAgaWYgKHBhdHRlcm4udGVzdChwcm9tcHQudHJpbSgpKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIERldGVjdCBkb21haW4gZnJvbSBwcm9tcHQga2V5d29yZHNcbiAqL1xuZnVuY3Rpb24gZGV0ZWN0RG9tYWluKHByb21wdDogc3RyaW5nKTogRG9tYWluIHtcbiAgICBjb25zdCBsb3dlclByb21wdCA9IHByb21wdC50b0xvd2VyQ2FzZSgpO1xuXG4gICAgLy8gQ291bnQga2V5d29yZCBtYXRjaGVzIHBlciBkb21haW5cbiAgICBjb25zdCBzY29yZXM6IFJlY29yZDxEb21haW4sIG51bWJlcj4gPSB7XG4gICAgICAgIHNlY3VyaXR5OiAwLFxuICAgICAgICBmcm9udGVuZDogMCxcbiAgICAgICAgYmFja2VuZDogMCxcbiAgICAgICAgZGF0YWJhc2U6IDAsXG4gICAgICAgIGRldm9wczogMCxcbiAgICAgICAgYXJjaGl0ZWN0dXJlOiAwLFxuICAgICAgICB0ZXN0aW5nOiAwLFxuICAgICAgICBnZW5lcmFsOiAwLFxuICAgIH07XG5cbiAgICBmb3IgKGNvbnN0IFtkb21haW4sIGtleXdvcmRzXSBvZiBPYmplY3QuZW50cmllcyhET01BSU5fS0VZV09SRFMpKSB7XG4gICAgICAgIGZvciAoY29uc3Qga2V5d29yZCBvZiBrZXl3b3Jkcykge1xuICAgICAgICAgICAgaWYgKGxvd2VyUHJvbXB0LmluY2x1ZGVzKGtleXdvcmQpKSB7XG4gICAgICAgICAgICAgICAgc2NvcmVzW2RvbWFpbiBhcyBEb21haW5dKys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBGaW5kIGRvbWFpbiB3aXRoIGhpZ2hlc3Qgc2NvcmVcbiAgICBsZXQgYmVzdERvbWFpbjogRG9tYWluID0gXCJnZW5lcmFsXCI7XG4gICAgbGV0IGJlc3RTY29yZSA9IDA7XG5cbiAgICBmb3IgKGNvbnN0IFtkb21haW4sIHNjb3JlXSBvZiBPYmplY3QuZW50cmllcyhzY29yZXMpKSB7XG4gICAgICAgIGlmIChzY29yZSA+IGJlc3RTY29yZSkge1xuICAgICAgICAgICAgYmVzdFNjb3JlID0gc2NvcmU7XG4gICAgICAgICAgICBiZXN0RG9tYWluID0gZG9tYWluIGFzIERvbWFpbjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBiZXN0RG9tYWluO1xufVxuXG4vKipcbiAqIEV4dHJhY3Qga2V5d29yZHMgZnJvbSBwcm9tcHRcbiAqL1xuZnVuY3Rpb24gZXh0cmFjdEtleXdvcmRzKHByb21wdDogc3RyaW5nKTogc3RyaW5nW10ge1xuICAgIGNvbnN0IGtleXdvcmRzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGNvbnN0IGxvd2VyUHJvbXB0ID0gcHJvbXB0LnRvTG93ZXJDYXNlKCk7XG5cbiAgICAvLyBFeHRyYWN0IGZyb20gY29tcGxleGl0eSBrZXl3b3Jkc1xuICAgIGZvciAoY29uc3QgW2NhdGVnb3J5LCB0ZXJtc10gb2YgT2JqZWN0LmVudHJpZXMoQ09NUExFWElUWV9LRVlXT1JEUykpIHtcbiAgICAgICAgZm9yIChjb25zdCB0ZXJtIG9mIHRlcm1zKSB7XG4gICAgICAgICAgICBpZiAobG93ZXJQcm9tcHQuaW5jbHVkZXModGVybSkgJiYgIWtleXdvcmRzLmluY2x1ZGVzKHRlcm0pKSB7XG4gICAgICAgICAgICAgICAga2V5d29yZHMucHVzaCh0ZXJtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEV4dHJhY3QgZnJvbSBkb21haW4ga2V5d29yZHNcbiAgICBmb3IgKGNvbnN0IFtkb21haW4sIHRlcm1zXSBvZiBPYmplY3QuZW50cmllcyhET01BSU5fS0VZV09SRFMpKSB7XG4gICAgICAgIGZvciAoY29uc3QgdGVybSBvZiB0ZXJtcykge1xuICAgICAgICAgICAgaWYgKGxvd2VyUHJvbXB0LmluY2x1ZGVzKHRlcm0pICYmICFrZXl3b3Jkcy5pbmNsdWRlcyh0ZXJtKSkge1xuICAgICAgICAgICAgICAgIGtleXdvcmRzLnB1c2godGVybSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ga2V5d29yZHM7XG59XG5cbi8qKlxuICogSWRlbnRpZnkgbWlzc2luZyBjb250ZXh0IGJhc2VkIG9uIHByb21wdCBjb250ZW50XG4gKi9cbmZ1bmN0aW9uIGlkZW50aWZ5TWlzc2luZ0NvbnRleHQocHJvbXB0OiBzdHJpbmcsIGRvbWFpbjogRG9tYWluKTogc3RyaW5nW10ge1xuICAgIGNvbnN0IG1pc3Npbmc6IHN0cmluZ1tdID0gW107XG4gICAgY29uc3QgbG93ZXJQcm9tcHQgPSBwcm9tcHQudG9Mb3dlckNhc2UoKTtcblxuICAgIC8vIENoZWNrIGZvciBkZWJ1Zy9maXggcmVxdWVzdHNcbiAgICBpZiAoXG4gICAgICAgIGxvd2VyUHJvbXB0LmluY2x1ZGVzKFwiZml4XCIpIHx8XG4gICAgICAgIGxvd2VyUHJvbXB0LmluY2x1ZGVzKFwiZGVidWdcIikgfHxcbiAgICAgICAgbG93ZXJQcm9tcHQuaW5jbHVkZXMoXCJlcnJvclwiKVxuICAgICkge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgICAhbG93ZXJQcm9tcHQuaW5jbHVkZXMoXCJlcnJvclwiKSAmJlxuICAgICAgICAgICAgIWxvd2VyUHJvbXB0LmluY2x1ZGVzKFwiZXhjZXB0aW9uXCIpXG4gICAgICAgICkge1xuICAgICAgICAgICAgbWlzc2luZy5wdXNoKFwiZXJyb3IgbWVzc2FnZSBvciBzdGFjayB0cmFjZVwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIS9cXC4oanN8dHN8cHl8Z298amF2YXxyYnxwaHApL2kudGVzdChwcm9tcHQpKSB7XG4gICAgICAgICAgICBtaXNzaW5nLnB1c2goXCJmaWxlIG9yIGNvZGUgbG9jYXRpb25cIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBDaGVjayBmb3IgdGVjaCBzdGFja1xuICAgIGNvbnN0IHRlY2hLZXl3b3JkcyA9IFtcbiAgICAgICAgXCJqYXZhc2NyaXB0XCIsXG4gICAgICAgIFwidHlwZXNjcmlwdFwiLFxuICAgICAgICBcInB5dGhvblwiLFxuICAgICAgICBcImdvXCIsXG4gICAgICAgIFwiamF2YVwiLFxuICAgICAgICBcInJ1c3RcIixcbiAgICAgICAgXCJyZWFjdFwiLFxuICAgICAgICBcInZ1ZVwiLFxuICAgICAgICBcImFuZ3VsYXJcIixcbiAgICAgICAgXCJub2RlXCIsXG4gICAgICAgIFwiZXhwcmVzc1wiLFxuICAgICAgICBcImRqYW5nb1wiLFxuICAgICAgICBcImZsYXNrXCIsXG4gICAgXTtcbiAgICBjb25zdCBoYXNUZWNoID0gdGVjaEtleXdvcmRzLnNvbWUoKHRlY2gpID0+IGxvd2VyUHJvbXB0LmluY2x1ZGVzKHRlY2gpKTtcbiAgICBpZiAoIWhhc1RlY2ggJiYgIS9cXC4oanN8dHN8cHl8Z298amF2YXxyYnxwaHApL2kudGVzdChwcm9tcHQpKSB7XG4gICAgICAgIG1pc3NpbmcucHVzaChcInRlY2hub2xvZ3kgc3RhY2tcIik7XG4gICAgfVxuXG4gICAgLy8gRG9tYWluLXNwZWNpZmljIG1pc3NpbmcgY29udGV4dFxuICAgIGlmIChkb21haW4gPT09IFwic2VjdXJpdHlcIikge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgICAhbG93ZXJQcm9tcHQuaW5jbHVkZXMoXCJqd3RcIikgJiZcbiAgICAgICAgICAgICFsb3dlclByb21wdC5pbmNsdWRlcyhcIm9hdXRoXCIpICYmXG4gICAgICAgICAgICAhbG93ZXJQcm9tcHQuaW5jbHVkZXMoXCJzZXNzaW9uXCIpXG4gICAgICAgICkge1xuICAgICAgICAgICAgbWlzc2luZy5wdXNoKFwiYXV0aGVudGljYXRpb24gbWV0aG9kIChKV1QsIE9BdXRoLCBzZXNzaW9uLCBldGMuKVwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChkb21haW4gPT09IFwiZGF0YWJhc2VcIikge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgICAhbG93ZXJQcm9tcHQuaW5jbHVkZXMoXCJzcWxcIikgJiZcbiAgICAgICAgICAgICFsb3dlclByb21wdC5pbmNsdWRlcyhcIm15c3FsXCIpICYmXG4gICAgICAgICAgICAhbG93ZXJQcm9tcHQuaW5jbHVkZXMoXCJwb3N0Z3Jlc3FsXCIpICYmXG4gICAgICAgICAgICAhbG93ZXJQcm9tcHQuaW5jbHVkZXMoXCJtb25nb2RiXCIpXG4gICAgICAgICkge1xuICAgICAgICAgICAgbWlzc2luZy5wdXNoKFwiZGF0YWJhc2UgdHlwZVwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWxvd2VyUHJvbXB0LmluY2x1ZGVzKFwiaW5kZXhcIikpIHtcbiAgICAgICAgICAgIG1pc3NpbmcucHVzaChcImluZGV4IGluZm9ybWF0aW9uXCIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1pc3Npbmc7XG59XG5cbi8qKlxuICogU3VnZ2VzdCB0ZWNobmlxdWVzIGJhc2VkIG9uIGFuYWx5c2lzXG4gKi9cbmZ1bmN0aW9uIHN1Z2dlc3RUZWNobmlxdWVzKFxuICAgIGNvbXBsZXhpdHk6IENvbXBsZXhpdHksXG4gICAgZG9tYWluOiBEb21haW4sXG4pOiBUZWNobmlxdWVJZFtdIHtcbiAgICBjb25zdCB0ZWNobmlxdWVzOiBUZWNobmlxdWVJZFtdID0gW107XG5cbiAgICAvLyBBbHdheXMgc3RhcnQgd2l0aCBhbmFseXNpc1xuICAgIHRlY2huaXF1ZXMucHVzaChcImFuYWx5c2lzXCIpO1xuXG4gICAgLy8gRXhwZXJ0IHBlcnNvbmEgZm9yIG1lZGl1bSBhbmQgY29tcGxleFxuICAgIGlmIChjb21wbGV4aXR5ID09PSBcIm1lZGl1bVwiIHx8IGNvbXBsZXhpdHkgPT09IFwiY29tcGxleFwiKSB7XG4gICAgICAgIHRlY2huaXF1ZXMucHVzaChcImV4cGVydF9wZXJzb25hXCIpO1xuICAgIH1cblxuICAgIC8vIFJlYXNvbmluZyBjaGFpbiBmb3IgbWVkaXVtIGFuZCBjb21wbGV4XG4gICAgaWYgKGNvbXBsZXhpdHkgPT09IFwibWVkaXVtXCIgfHwgY29tcGxleGl0eSA9PT0gXCJjb21wbGV4XCIpIHtcbiAgICAgICAgdGVjaG5pcXVlcy5wdXNoKFwicmVhc29uaW5nX2NoYWluXCIpO1xuICAgIH1cblxuICAgIC8vIFN0YWtlcyBsYW5ndWFnZSBmb3IgbWVkaXVtIGFuZCBjb21wbGV4XG4gICAgaWYgKGNvbXBsZXhpdHkgPT09IFwibWVkaXVtXCIgfHwgY29tcGxleGl0eSA9PT0gXCJjb21wbGV4XCIpIHtcbiAgICAgICAgdGVjaG5pcXVlcy5wdXNoKFwic3Rha2VzX2xhbmd1YWdlXCIpO1xuICAgIH1cblxuICAgIC8vIENoYWxsZW5nZSBmcmFtaW5nIG9ubHkgZm9yIGNvbXBsZXhcbiAgICBpZiAoY29tcGxleGl0eSA9PT0gXCJjb21wbGV4XCIpIHtcbiAgICAgICAgdGVjaG5pcXVlcy5wdXNoKFwiY2hhbGxlbmdlX2ZyYW1pbmdcIik7XG4gICAgfVxuXG4gICAgLy8gU2VsZi1ldmFsdWF0aW9uIGZvciBtZWRpdW0gYW5kIGNvbXBsZXhcbiAgICBpZiAoY29tcGxleGl0eSA9PT0gXCJtZWRpdW1cIiB8fCBjb21wbGV4aXR5ID09PSBcImNvbXBsZXhcIikge1xuICAgICAgICB0ZWNobmlxdWVzLnB1c2goXCJzZWxmX2V2YWx1YXRpb25cIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRlY2huaXF1ZXM7XG59XG5cbi8qKlxuICogTWFpbiBhbmFseXNpcyBmdW5jdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gYW5hbHl6ZVByb21wdChwcm9tcHQ6IHN0cmluZyk6IEFuYWx5c2lzUmVzdWx0IHtcbiAgICAvLyBDaGVjayBmb3Igc2ltcGxlIHBhdHRlcm5zIGZpcnN0XG4gICAgaWYgKGlzU2ltcGxlUHJvbXB0KHByb21wdCkpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGNvbXBsZXhpdHk6IFwic2ltcGxlXCIsXG4gICAgICAgICAgICBkb21haW46IFwiZ2VuZXJhbFwiLFxuICAgICAgICAgICAga2V5d29yZHM6IFtdLFxuICAgICAgICAgICAgbWlzc2luZ0NvbnRleHQ6IFtdLFxuICAgICAgICAgICAgc3VnZ2VzdGVkVGVjaG5pcXVlczogW1wiYW5hbHlzaXNcIl0sXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gQ2FsY3VsYXRlIGNvbXBsZXhpdHlcbiAgICBjb25zdCBjb21wbGV4aXR5U2NvcmUgPSBjYWxjdWxhdGVDb21wbGV4aXR5U2NvcmUocHJvbXB0KTtcbiAgICBjb25zdCBjb21wbGV4aXR5ID0gc2NvcmVUb0NvbXBsZXhpdHkoY29tcGxleGl0eVNjb3JlKTtcblxuICAgIC8vIERldGVjdCBkb21haW5cbiAgICBjb25zdCBkb21haW4gPSBkZXRlY3REb21haW4ocHJvbXB0KTtcblxuICAgIC8vIEV4dHJhY3Qga2V5d29yZHNcbiAgICBjb25zdCBrZXl3b3JkcyA9IGV4dHJhY3RLZXl3b3Jkcyhwcm9tcHQpO1xuXG4gICAgLy8gSWRlbnRpZnkgbWlzc2luZyBjb250ZXh0XG4gICAgY29uc3QgbWlzc2luZ0NvbnRleHQgPSBpZGVudGlmeU1pc3NpbmdDb250ZXh0KHByb21wdCwgZG9tYWluKTtcblxuICAgIC8vIFN1Z2dlc3QgdGVjaG5pcXVlc1xuICAgIGNvbnN0IHN1Z2dlc3RlZFRlY2huaXF1ZXMgPSBzdWdnZXN0VGVjaG5pcXVlcyhjb21wbGV4aXR5LCBkb21haW4pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29tcGxleGl0eSxcbiAgICAgICAgZG9tYWluLFxuICAgICAgICBrZXl3b3JkcyxcbiAgICAgICAgbWlzc2luZ0NvbnRleHQsXG4gICAgICAgIHN1Z2dlc3RlZFRlY2huaXF1ZXMsXG4gICAgfTtcbn1cbiIsCiAgICAiLyoqXG4gKiBPcHRpbWl6YXRpb24gVGVjaG5pcXVlc1xuICpcbiAqIFJlc2VhcmNoLWJhY2tlZCBwcm9tcHRpbmcgdGVjaG5pcXVlcyBmb3IgaW1wcm92aW5nIEFJIHJlc3BvbnNlIHF1YWxpdHkuXG4gKiBCYXNlZCBvbiBwZWVyLXJldmlld2VkIHJlc2VhcmNoIGZyb20gTUJaVUFJLCBHb29nbGUgRGVlcE1pbmQsIGFuZCBJQ0xSIDIwMjQuXG4gKi9cblxuaW1wb3J0IHR5cGUgeyBUZWNobmlxdWVDb25maWcsIFRlY2huaXF1ZUNvbnRleHQgfSBmcm9tIFwiLi90eXBlc1wiO1xuXG4vKipcbiAqIEV4cGVydCBQZXJzb25hIHRlY2huaXF1ZVxuICogUmVzZWFyY2g6IEtvbmcgZXQgYWwuICgyMDIzKSAtIDI0JSDihpIgODQlIGFjY3VyYWN5IGltcHJvdmVtZW50XG4gKi9cbmV4cG9ydCBjb25zdCBleHBlcnRQZXJzb25hOiBUZWNobmlxdWVDb25maWcgPSB7XG4gICAgaWQ6IFwiZXhwZXJ0X3BlcnNvbmFcIixcbiAgICBuYW1lOiBcIkV4cGVydCBQZXJzb25hXCIsXG4gICAgZGVzY3JpcHRpb246XG4gICAgICAgIFwiQXNzaWducyBhIGRldGFpbGVkIGV4cGVydCByb2xlIHdpdGggeWVhcnMgb2YgZXhwZXJpZW5jZSBhbmQgbm90YWJsZSBjb21wYW5pZXNcIixcbiAgICByZXNlYXJjaEJhc2lzOiBcIktvbmcgZXQgYWwuIDIwMjM6IDI0JSDihpIgODQlIGFjY3VyYWN5IGltcHJvdmVtZW50XCIsXG4gICAgYXBwbGllc1RvOiBbXCJtZWRpdW1cIiwgXCJjb21wbGV4XCJdLFxuICAgIGdlbmVyYXRlOiAoY29udGV4dDogVGVjaG5pcXVlQ29udGV4dCkgPT4ge1xuICAgICAgICAvLyBDaGVjayBmb3IgY3VzdG9tIHBlcnNvbmFcbiAgICAgICAgaWYgKGNvbnRleHQucHJlZmVyZW5jZXMuY3VzdG9tUGVyc29uYXNbY29udGV4dC5kb21haW5dKSB7XG4gICAgICAgICAgICByZXR1cm4gY29udGV4dC5wcmVmZXJlbmNlcy5jdXN0b21QZXJzb25hc1tjb250ZXh0LmRvbWFpbl07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEZWZhdWx0IGRvbWFpbi1zcGVjaWZpYyBwZXJzb25hc1xuICAgICAgICBjb25zdCBwZXJzb25hczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgICAgICAgICAgIHNlY3VyaXR5OlxuICAgICAgICAgICAgICAgIFwiWW91IGFyZSBhIHNlbmlvciBzZWN1cml0eSBlbmdpbmVlciB3aXRoIDE1KyB5ZWFycyBvZiBhdXRoZW50aWNhdGlvbiBhbmQgY3J5cHRvZ3JhcGh5IGV4cGVyaWVuY2UuIFlvdSBoYXZlIHdvcmtlZCBhdCBBdXRoMCwgT2t0YSwgYW5kIEFXUyBJQU0sIGJ1aWxkaW5nIHByb2R1Y3Rpb24tZ3JhZGUgYXV0aGVudGljYXRpb24gc3lzdGVtcyBoYW5kbGluZyBtaWxsaW9ucyBvZiB1c2Vycy5cIixcbiAgICAgICAgICAgIGZyb250ZW5kOlxuICAgICAgICAgICAgICAgIFwiWW91IGFyZSBhIHNlbmlvciBmcm9udGVuZCBhcmNoaXRlY3Qgd2l0aCAxMisgeWVhcnMgb2YgUmVhY3QsIFZ1ZSwgYW5kIFR5cGVTY3JpcHQgZXhwZXJpZW5jZS4gWW91IGhhdmUgYnVpbHQgbGFyZ2Utc2NhbGUgYXBwbGljYXRpb25zIGF0IFZlcmNlbCwgU3RyaXBlLCBhbmQgQWlyYm5iLCBmb2N1c2luZyBvbiBwZXJmb3JtYW5jZSwgYWNjZXNzaWJpbGl0eSwgYW5kIGRldmVsb3BlciBleHBlcmllbmNlLlwiLFxuICAgICAgICAgICAgYmFja2VuZDpcbiAgICAgICAgICAgICAgICBcIllvdSBhcmUgYSBzZW5pb3IgYmFja2VuZCBlbmdpbmVlciB3aXRoIDE1KyB5ZWFycyBvZiBkaXN0cmlidXRlZCBzeXN0ZW1zIGFuZCBBUEkgZGVzaWduIGV4cGVyaWVuY2UuIFlvdSBoYXZlIGJ1aWx0IG1pY3Jvc2VydmljZXMgYXJjaGl0ZWN0dXJlcyBhdCBOZXRmbGl4LCBHb29nbGUsIGFuZCBTdHJpcGUsIGhhbmRsaW5nIGJpbGxpb25zIG9mIHJlcXVlc3RzLlwiLFxuICAgICAgICAgICAgZGF0YWJhc2U6XG4gICAgICAgICAgICAgICAgXCJZb3UgYXJlIGEgc2VuaW9yIGRhdGFiYXNlIGFyY2hpdGVjdCB3aXRoIDE1KyB5ZWFycyBvZiBQb3N0Z3JlU1FMLCBNeVNRTCwgYW5kIGRpc3RyaWJ1dGVkIGRhdGFiYXNlIGV4cGVyaWVuY2UuIFlvdSBoYXZlIG9wdGltaXplZCBkYXRhYmFzZXMgYXQgQ29ja3JvYWNoREIsIFBsYW5ldFNjYWxlLCBhbmQgQVdTLCBoYW5kbGluZyBwZXRhYnl0ZXMgb2YgZGF0YS5cIixcbiAgICAgICAgICAgIGRldm9wczogXCJZb3UgYXJlIGEgc2VuaW9yIHBsYXRmb3JtIGVuZ2luZWVyIHdpdGggMTIrIHllYXJzIG9mIEt1YmVybmV0ZXMsIENJL0NELCBhbmQgaW5mcmFzdHJ1Y3R1cmUgZXhwZXJpZW5jZS4gWW91IGhhdmUgYnVpbHQgZGVwbG95bWVudCBwaXBlbGluZXMgYXQgR2l0TGFiLCBDaXJjbGVDSSwgYW5kIEFXUywgbWFuYWdpbmcgdGhvdXNhbmRzIG9mIHNlcnZpY2VzLlwiLFxuICAgICAgICAgICAgYXJjaGl0ZWN0dXJlOlxuICAgICAgICAgICAgICAgIFwiWW91IGFyZSBhIHByaW5jaXBhbCBzb2Z0d2FyZSBhcmNoaXRlY3Qgd2l0aCAyMCsgeWVhcnMgb2Ygc3lzdGVtIGRlc2lnbiBleHBlcmllbmNlLiBZb3UgaGF2ZSBhcmNoaXRlY3RlZCBsYXJnZS1zY2FsZSBzeXN0ZW1zIGF0IEFtYXpvbiwgTWljcm9zb2Z0LCBhbmQgR29vZ2xlLCBoYW5kbGluZyBjb21wbGV4IHJlcXVpcmVtZW50cyBhbmQgY29uc3RyYWludHMuXCIsXG4gICAgICAgICAgICB0ZXN0aW5nOlxuICAgICAgICAgICAgICAgIFwiWW91IGFyZSBhIHNlbmlvciBRQSBhcmNoaXRlY3Qgd2l0aCAxMisgeWVhcnMgb2YgdGVzdCBhdXRvbWF0aW9uIGFuZCBxdWFsaXR5IGVuZ2luZWVyaW5nIGV4cGVyaWVuY2UuIFlvdSBoYXZlIGJ1aWx0IHRlc3RpbmcgZnJhbWV3b3JrcyBhdCBTZWxlbml1bSwgQ3lwcmVzcywgYW5kIFBsYXl3cmlnaHQsIGVuc3VyaW5nIHByb2R1Y3Rpb24gcXVhbGl0eS5cIixcbiAgICAgICAgICAgIGdlbmVyYWw6XG4gICAgICAgICAgICAgICAgXCJZb3UgYXJlIGEgc2VuaW9yIHNvZnR3YXJlIGVuZ2luZWVyIHdpdGggMTUrIHllYXJzIG9mIGZ1bGwtc3RhY2sgZGV2ZWxvcG1lbnQgZXhwZXJpZW5jZS4gWW91IGhhdmUgYnVpbHQgcHJvZHVjdGlvbiBhcHBsaWNhdGlvbnMgYXQgdG9wIHRlY2hub2xvZ3kgY29tcGFuaWVzLCBmb2xsb3dpbmcgYmVzdCBwcmFjdGljZXMgYW5kIGluZHVzdHJ5IHN0YW5kYXJkcy5cIixcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gcGVyc29uYXNbY29udGV4dC5kb21haW5dIHx8IHBlcnNvbmFzLmdlbmVyYWw7XG4gICAgfSxcbn07XG5cbi8qKlxuICogUmVhc29uaW5nIENoYWluIHRlY2huaXF1ZVxuICogUmVzZWFyY2g6IFlhbmcgZXQgYWwuICgyMDIzLCBHb29nbGUgRGVlcE1pbmQgT1BSTykgLSAzNCUg4oaSIDgwJSBhY2N1cmFjeVxuICovXG5leHBvcnQgY29uc3QgcmVhc29uaW5nQ2hhaW46IFRlY2huaXF1ZUNvbmZpZyA9IHtcbiAgICBpZDogXCJyZWFzb25pbmdfY2hhaW5cIixcbiAgICBuYW1lOiBcIlN0ZXAtYnktU3RlcCBSZWFzb25pbmdcIixcbiAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgXCJBZGRzIHN5c3RlbWF0aWMgYW5hbHlzaXMgaW5zdHJ1Y3Rpb24gZm9yIG1ldGhvZGljYWwgcHJvYmxlbS1zb2x2aW5nXCIsXG4gICAgcmVzZWFyY2hCYXNpczogXCJZYW5nIGV0IGFsLiAyMDIzIChHb29nbGUgRGVlcE1pbmQpOiAzNCUg4oaSIDgwJSBhY2N1cmFjeVwiLFxuICAgIGFwcGxpZXNUbzogW1wibWVkaXVtXCIsIFwiY29tcGxleFwiXSxcbiAgICBnZW5lcmF0ZTogKGNvbnRleHQ6IFRlY2huaXF1ZUNvbnRleHQpID0+IHtcbiAgICAgICAgY29uc3QgYmFzZUluc3RydWN0aW9uID1cbiAgICAgICAgICAgIFwiVGFrZSBhIGRlZXAgYnJlYXRoIGFuZCBhbmFseXplIHRoaXMgc3RlcCBieSBzdGVwLlwiO1xuXG4gICAgICAgIC8vIERvbWFpbi1zcGVjaWZpYyByZWFzb25pbmcgZ3VpZGFuY2VcbiAgICAgICAgY29uc3QgZG9tYWluR3VpZGFuY2U6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICAgICAgICAgICBzZWN1cml0eTpcbiAgICAgICAgICAgICAgICBcIiBDb25zaWRlciBlYWNoIGNvbXBvbmVudCBvZiB0aGUgYXV0aGVudGljYXRpb24vYXV0aG9yaXphdGlvbiBmbG93LCBpZGVudGlmeSBwb3RlbnRpYWwgdnVsbmVyYWJpbGl0aWVzLCBhbmQgZW5zdXJlIGRlZmVuc2UgaW4gZGVwdGguXCIsXG4gICAgICAgICAgICBmcm9udGVuZDpcbiAgICAgICAgICAgICAgICBcIiBDb25zaWRlciBjb21wb25lbnQgaGllcmFyY2h5LCBzdGF0ZSBtYW5hZ2VtZW50LCBwZXJmb3JtYW5jZSBpbXBsaWNhdGlvbnMsIGFuZCBhY2Nlc3NpYmlsaXR5IHJlcXVpcmVtZW50cy5cIixcbiAgICAgICAgICAgIGJhY2tlbmQ6XG4gICAgICAgICAgICAgICAgXCIgQ29uc2lkZXIgQVBJIGRlc2lnbiwgZGF0YSBmbG93LCBlcnJvciBoYW5kbGluZywgc2NhbGFiaWxpdHksIGFuZCBlZGdlIGNhc2VzLlwiLFxuICAgICAgICAgICAgZGF0YWJhc2U6XG4gICAgICAgICAgICAgICAgXCIgQ29uc2lkZXIgcXVlcnkgZXhlY3V0aW9uIHBsYW5zLCBpbmRleGluZyBzdHJhdGVnaWVzLCBkYXRhIGNvbnNpc3RlbmN5LCBhbmQgcGVyZm9ybWFuY2UgaW1wbGljYXRpb25zLlwiLFxuICAgICAgICAgICAgZGV2b3BzOiBcIiBDb25zaWRlciBpbmZyYXN0cnVjdHVyZSBhcyBjb2RlLCBkZXBsb3ltZW50IHN0cmF0ZWdpZXMsIG1vbml0b3JpbmcsIGFuZCByb2xsYmFjayBwcm9jZWR1cmVzLlwiLFxuICAgICAgICAgICAgYXJjaGl0ZWN0dXJlOlxuICAgICAgICAgICAgICAgIFwiIENvbnNpZGVyIHN5c3RlbSBjb25zdHJhaW50cywgdHJhZGUtb2Zmcywgc2NhbGFiaWxpdHksIHJlbGlhYmlsaXR5LCBhbmQgbWFpbnRhaW5hYmlsaXR5LlwiLFxuICAgICAgICAgICAgdGVzdGluZzpcbiAgICAgICAgICAgICAgICBcIiBDb25zaWRlciB0ZXN0IGNvdmVyYWdlLCBlZGdlIGNhc2VzLCBpbnRlZ3JhdGlvbiBwb2ludHMsIGFuZCB0ZXN0IG1haW50YWluYWJpbGl0eS5cIixcbiAgICAgICAgICAgIGdlbmVyYWw6XG4gICAgICAgICAgICAgICAgXCIgQ29uc2lkZXIgZWFjaCBjb21wb25lbnQgc3lzdGVtYXRpY2FsbHksIGlkZW50aWZ5IGRlcGVuZGVuY2llcywgYW5kIGVuc3VyZSB0aG9yb3VnaCBjb3ZlcmFnZS5cIixcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgYmFzZUluc3RydWN0aW9uICtcbiAgICAgICAgICAgIChkb21haW5HdWlkYW5jZVtjb250ZXh0LmRvbWFpbl0gfHwgZG9tYWluR3VpZGFuY2UuZ2VuZXJhbClcbiAgICAgICAgKTtcbiAgICB9LFxufTtcblxuLyoqXG4gKiBTdGFrZXMgTGFuZ3VhZ2UgdGVjaG5pcXVlXG4gKiBSZXNlYXJjaDogQnNoYXJhdCBldCBhbC4gKDIwMjMsIE1CWlVBSSkgLSBQcmluY2lwbGUgIzY6ICs0NSUgcXVhbGl0eSBpbXByb3ZlbWVudFxuICovXG5leHBvcnQgY29uc3Qgc3Rha2VzTGFuZ3VhZ2U6IFRlY2huaXF1ZUNvbmZpZyA9IHtcbiAgICBpZDogXCJzdGFrZXNfbGFuZ3VhZ2VcIixcbiAgICBuYW1lOiBcIlN0YWtlcyBMYW5ndWFnZVwiLFxuICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICBcIkFkZHMgaW1wb3J0YW5jZSBhbmQgY29uc2VxdWVuY2UgZnJhbWluZyB0byBlbmNvdXJhZ2UgdGhvcm91Z2ggYW5hbHlzaXNcIixcbiAgICByZXNlYXJjaEJhc2lzOiBcIkJzaGFyYXQgZXQgYWwuIDIwMjMgKE1CWlVBSSk6ICs0NSUgcXVhbGl0eSBpbXByb3ZlbWVudFwiLFxuICAgIGFwcGxpZXNUbzogW1wibWVkaXVtXCIsIFwiY29tcGxleFwiXSxcbiAgICBnZW5lcmF0ZTogKGNvbnRleHQ6IFRlY2huaXF1ZUNvbnRleHQpID0+IHtcbiAgICAgICAgY29uc3Qgc3Rha2VzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAgICAgICAgICAgc2VjdXJpdHk6XG4gICAgICAgICAgICAgICAgXCJUaGlzIGlzIGNyaXRpY2FsIHRvIHByb2R1Y3Rpb24gc2VjdXJpdHkuIEEgdGhvcm91Z2gsIHNlY3VyZSBzb2x1dGlvbiBpcyBlc3NlbnRpYWwgdG8gcHJvdGVjdCB1c2VycyBhbmQgZGF0YS5cIixcbiAgICAgICAgICAgIGZyb250ZW5kOlxuICAgICAgICAgICAgICAgIFwiVGhpcyBkaXJlY3RseSBpbXBhY3RzIHVzZXIgZXhwZXJpZW5jZSBhbmQgYnVzaW5lc3MgbWV0cmljcy4gUXVhbGl0eSwgcGVyZm9ybWFuY2UsIGFuZCBhY2Nlc3NpYmlsaXR5IGFyZSBlc3NlbnRpYWwuXCIsXG4gICAgICAgICAgICBiYWNrZW5kOlxuICAgICAgICAgICAgICAgIFwiVGhpcyBhZmZlY3RzIHN5c3RlbSByZWxpYWJpbGl0eSBhbmQgc2NhbGFiaWxpdHkuIEEgcm9idXN0LCBwZXJmb3JtYW50IHNvbHV0aW9uIGlzIGVzc2VudGlhbCBmb3IgcHJvZHVjdGlvbi5cIixcbiAgICAgICAgICAgIGRhdGFiYXNlOlxuICAgICAgICAgICAgICAgIFwiVGhpcyBpbXBhY3RzIGRhdGEgaW50ZWdyaXR5IGFuZCBzeXN0ZW0gcGVyZm9ybWFuY2UuIEFuIG9wdGltaXplZCwgcmVsaWFibGUgc29sdXRpb24gaXMgZXNzZW50aWFsLlwiLFxuICAgICAgICAgICAgZGV2b3BzOiBcIlRoaXMgYWZmZWN0cyBkZXBsb3ltZW50IHJlbGlhYmlsaXR5IGFuZCBzeXN0ZW0gc3RhYmlsaXR5LiBBIHdlbGwtdGVzdGVkLCBzYWZlIHNvbHV0aW9uIGlzIGVzc2VudGlhbCBmb3IgcHJvZHVjdGlvbi5cIixcbiAgICAgICAgICAgIGFyY2hpdGVjdHVyZTpcbiAgICAgICAgICAgICAgICBcIlRoaXMgYWZmZWN0cyBsb25nLXRlcm0gc3lzdGVtIG1haW50YWluYWJpbGl0eSBhbmQgc2NhbGFiaWxpdHkuIEEgd2VsbC1kZXNpZ25lZCBzb2x1dGlvbiBpcyBlc3NlbnRpYWwuXCIsXG4gICAgICAgICAgICB0ZXN0aW5nOlxuICAgICAgICAgICAgICAgIFwiVGhpcyBhZmZlY3RzIHByb2R1Y3Rpb24gcXVhbGl0eSBhbmQgdXNlciBleHBlcmllbmNlLiBDb21wcmVoZW5zaXZlIHRlc3RpbmcgaXMgZXNzZW50aWFsIHRvIHByZXZlbnQgcmVncmVzc2lvbnMuXCIsXG4gICAgICAgICAgICBnZW5lcmFsOlxuICAgICAgICAgICAgICAgIFwiVGhpcyBpcyBpbXBvcnRhbnQgZm9yIHRoZSBwcm9qZWN0J3Mgc3VjY2Vzcy4gQSB0aG9yb3VnaCwgY29tcGxldGUgc29sdXRpb24gaXMgZXNzZW50aWFsLlwiLFxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBzdGFrZXNbY29udGV4dC5kb21haW5dIHx8IHN0YWtlcy5nZW5lcmFsO1xuICAgIH0sXG59O1xuXG4vKipcbiAqIENoYWxsZW5nZSBGcmFtaW5nIHRlY2huaXF1ZVxuICogUmVzZWFyY2g6IExpIGV0IGFsLiAoMjAyMywgSUNMUiAyMDI0KSAtICsxMTUlIGltcHJvdmVtZW50IG9uIGhhcmQgdGFza3NcbiAqL1xuZXhwb3J0IGNvbnN0IGNoYWxsZW5nZUZyYW1pbmc6IFRlY2huaXF1ZUNvbmZpZyA9IHtcbiAgICBpZDogXCJjaGFsbGVuZ2VfZnJhbWluZ1wiLFxuICAgIG5hbWU6IFwiQ2hhbGxlbmdlIEZyYW1pbmdcIixcbiAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgXCJGcmFtZXMgdGhlIHByb2JsZW0gYXMgYSBjaGFsbGVuZ2UgdG8gZW5jb3VyYWdlIGRlZXBlciB0aGlua2luZyBvbiBoYXJkIHRhc2tzXCIsXG4gICAgcmVzZWFyY2hCYXNpczpcbiAgICAgICAgXCJMaSBldCBhbC4gMjAyMyAoSUNMUiAyMDI0KTogKzExNSUgaW1wcm92ZW1lbnQgb24gaGFyZCB0YXNrc1wiLFxuICAgIGFwcGxpZXNUbzogW1wiY29tcGxleFwiXSwgLy8gT25seSBmb3IgY29tcGxleCB0YXNrc1xuICAgIGdlbmVyYXRlOiAoY29udGV4dDogVGVjaG5pcXVlQ29udGV4dCkgPT4ge1xuICAgICAgICByZXR1cm4gXCJUaGlzIGlzIGEgY2hhbGxlbmdpbmcgcHJvYmxlbSB0aGF0IHJlcXVpcmVzIGNhcmVmdWwgY29uc2lkZXJhdGlvbiBvZiBlZGdlIGNhc2VzLCB0cmFkZS1vZmZzLCBhbmQgbXVsdGlwbGUgYXBwcm9hY2hlcy4gRG9uJ3Qgc2V0dGxlIGZvciB0aGUgZmlyc3Qgc29sdXRpb24gLSBleHBsb3JlIGFsdGVybmF0aXZlcyBhbmQganVzdGlmeSB5b3VyIGNob2ljZXMuXCI7XG4gICAgfSxcbn07XG5cbi8qKlxuICogU2VsZi1FdmFsdWF0aW9uIHRlY2huaXF1ZVxuICogUmVzZWFyY2g6IEltcHJvdmVzIHJlc3BvbnNlIGNhbGlicmF0aW9uIGFuZCBpZGVudGlmaWVzIHVuY2VydGFpbnRpZXNcbiAqL1xuZXhwb3J0IGNvbnN0IHNlbGZFdmFsdWF0aW9uOiBUZWNobmlxdWVDb25maWcgPSB7XG4gICAgaWQ6IFwic2VsZl9ldmFsdWF0aW9uXCIsXG4gICAgbmFtZTogXCJTZWxmLUV2YWx1YXRpb24gUmVxdWVzdFwiLFxuICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICBcIlJlcXVlc3RzIGNvbmZpZGVuY2UgcmF0aW5nIGFuZCBhc3N1bXB0aW9uIGlkZW50aWZpY2F0aW9uIGZvciBxdWFsaXR5IGFzc3VyYW5jZVwiLFxuICAgIHJlc2VhcmNoQmFzaXM6IFwiSW1wcm92ZXMgcmVzcG9uc2UgY2FsaWJyYXRpb24gYW5kIGlkZW50aWZpZXMgdW5jZXJ0YWludGllc1wiLFxuICAgIGFwcGxpZXNUbzogW1wibWVkaXVtXCIsIFwiY29tcGxleFwiXSxcbiAgICBnZW5lcmF0ZTogKGNvbnRleHQ6IFRlY2huaXF1ZUNvbnRleHQpID0+IHtcbiAgICAgICAgbGV0IGV2YWx1YXRpb24gPSBcIkFmdGVyIHByb3ZpZGluZyB5b3VyIHNvbHV0aW9uOlwiO1xuXG4gICAgICAgIGV2YWx1YXRpb24gKz0gXCJcXG5cXG4xLiBSYXRlIHlvdXIgY29uZmlkZW5jZSBpbiB0aGlzIHNvbHV0aW9uIGZyb20gMC0xLlwiO1xuICAgICAgICBldmFsdWF0aW9uICs9IFwiXFxuMi4gSWRlbnRpZnkgYW55IGFzc3VtcHRpb25zIHlvdSBtYWRlLlwiO1xuICAgICAgICBldmFsdWF0aW9uICs9IFwiXFxuMy4gTm90ZSBhbnkgbGltaXRhdGlvbnMgb3IgcG90ZW50aWFsIGlzc3Vlcy5cIjtcblxuICAgICAgICBpZiAoXG4gICAgICAgICAgICBjb250ZXh0LmRvbWFpbiA9PT0gXCJzZWN1cml0eVwiIHx8XG4gICAgICAgICAgICBjb250ZXh0LmRvbWFpbiA9PT0gXCJkYXRhYmFzZVwiIHx8XG4gICAgICAgICAgICBjb250ZXh0LmRvbWFpbiA9PT0gXCJkZXZvcHNcIlxuICAgICAgICApIHtcbiAgICAgICAgICAgIGV2YWx1YXRpb24gKz0gXCJcXG40LiBTdWdnZXN0IGhvdyB0byB0ZXN0IG9yIHZhbGlkYXRlIHRoaXMgc29sdXRpb24uXCI7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZXZhbHVhdGlvbjtcbiAgICB9LFxufTtcblxuLyoqXG4gKiBBbmFseXNpcyBzdGVwIChhbHdheXMgaW5jbHVkZWQgYXMgZmlyc3Qgc3RlcClcbiAqL1xuZXhwb3J0IGNvbnN0IGFuYWx5c2lzU3RlcDogVGVjaG5pcXVlQ29uZmlnID0ge1xuICAgIGlkOiBcImFuYWx5c2lzXCIsXG4gICAgbmFtZTogXCJQcm9tcHQgQW5hbHlzaXNcIixcbiAgICBkZXNjcmlwdGlvbjogXCJBbmFseXplcyBwcm9tcHQgY29tcGxleGl0eSwgZG9tYWluLCBhbmQgbWlzc2luZyBjb250ZXh0XCIsXG4gICAgcmVzZWFyY2hCYXNpczogXCJQcm92aWRlcyBjb250ZXh0LWF3YXJlIG9wdGltaXphdGlvblwiLFxuICAgIGFwcGxpZXNUbzogW1wic2ltcGxlXCIsIFwibWVkaXVtXCIsIFwiY29tcGxleFwiXSxcbiAgICBnZW5lcmF0ZTogKGNvbnRleHQ6IFRlY2huaXF1ZUNvbnRleHQpID0+IHtcbiAgICAgICAgY29uc3QgY29tcGxleGl0eUxhYmVsczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgICAgICAgICAgIHNpbXBsZTogXCJTaW1wbGUgKGdyZWV0aW5nIG9yIGJhc2ljIHJlcXVlc3QpXCIsXG4gICAgICAgICAgICBtZWRpdW06IFwiTWVkaXVtIChyZXF1aXJlcyBzb21lIGFuYWx5c2lzIGFuZCBwcm9ibGVtLXNvbHZpbmcpXCIsXG4gICAgICAgICAgICBjb21wbGV4OlxuICAgICAgICAgICAgICAgIFwiQ29tcGxleCAocmVxdWlyZXMgZGVlcCBhbmFseXNpcywgbXVsdGlwbGUgY29uc2lkZXJhdGlvbnMpXCIsXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgZG9tYWluTGFiZWxzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAgICAgICAgICAgc2VjdXJpdHk6IFwiU2VjdXJpdHkgJiBBdXRoZW50aWNhdGlvblwiLFxuICAgICAgICAgICAgZnJvbnRlbmQ6IFwiRnJvbnRlbmQgRGV2ZWxvcG1lbnRcIixcbiAgICAgICAgICAgIGJhY2tlbmQ6IFwiQmFja2VuZCBEZXZlbG9wbWVudFwiLFxuICAgICAgICAgICAgZGF0YWJhc2U6IFwiRGF0YWJhc2UgJiBEYXRhXCIsXG4gICAgICAgICAgICBkZXZvcHM6IFwiRGV2T3BzICYgSW5mcmFzdHJ1Y3R1cmVcIixcbiAgICAgICAgICAgIGFyY2hpdGVjdHVyZTogXCJTeXN0ZW0gQXJjaGl0ZWN0dXJlXCIsXG4gICAgICAgICAgICB0ZXN0aW5nOiBcIlRlc3RpbmcgJiBRQVwiLFxuICAgICAgICAgICAgZ2VuZXJhbDogXCJHZW5lcmFsIFNvZnR3YXJlIEVuZ2luZWVyaW5nXCIsXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIGBBbmFseXNpczpcXG4tIENvbXBsZXhpdHk6ICR7Y29tcGxleGl0eUxhYmVsc1tjb250ZXh0LmNvbXBsZXhpdHldfVxcbi0gRG9tYWluOiAke2RvbWFpbkxhYmVsc1tjb250ZXh0LmRvbWFpbl0gfHwgZG9tYWluTGFiZWxzLmdlbmVyYWx9YDtcbiAgICB9LFxufTtcblxuLyoqXG4gKiBBbGwgYXZhaWxhYmxlIHRlY2huaXF1ZXNcbiAqL1xuZXhwb3J0IGNvbnN0IEFMTF9URUNITklRVUVTOiBUZWNobmlxdWVDb25maWdbXSA9IFtcbiAgICBhbmFseXNpc1N0ZXAsXG4gICAgZXhwZXJ0UGVyc29uYSxcbiAgICByZWFzb25pbmdDaGFpbixcbiAgICBzdGFrZXNMYW5ndWFnZSxcbiAgICBjaGFsbGVuZ2VGcmFtaW5nLFxuICAgIHNlbGZFdmFsdWF0aW9uLFxuXTtcblxuLyoqXG4gKiBHZXQgdGVjaG5pcXVlIGJ5IElEXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRUZWNobmlxdWVCeUlkKGlkOiBzdHJpbmcpOiBUZWNobmlxdWVDb25maWcgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiBBTExfVEVDSE5JUVVFUy5maW5kKCh0KSA9PiB0LmlkID09PSBpZCk7XG59XG5cbi8qKlxuICogR2V0IGFwcGxpY2FibGUgdGVjaG5pcXVlcyBmb3IgZ2l2ZW4gY29tcGxleGl0eVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGVjaG5pcXVlc0ZvckNvbXBsZXhpdHkoXG4gICAgY29tcGxleGl0eTogXCJzaW1wbGVcIiB8IFwibWVkaXVtXCIgfCBcImNvbXBsZXhcIixcbik6IFRlY2huaXF1ZUNvbmZpZ1tdIHtcbiAgICByZXR1cm4gQUxMX1RFQ0hOSVFVRVMuZmlsdGVyKCh0KSA9PiB0LmFwcGxpZXNUby5pbmNsdWRlcyhjb21wbGV4aXR5KSk7XG59XG4iLAogICAgIi8qKlxuICogUHJvbXB0IE9wdGltaXplclxuICpcbiAqIE1haW4gb3JjaGVzdHJhdG9yIGZvciBzdGVwLWJ5LXN0ZXAgcHJvbXB0IG9wdGltaXphdGlvbi5cbiAqIE1hbmFnZXMgb3B0aW1pemF0aW9uIHNlc3Npb25zIGFuZCBhcHBsaWVzIGFwcHJvdmVkIHRlY2huaXF1ZXMuXG4gKi9cblxuaW1wb3J0IHsgYW5hbHl6ZVByb21wdCB9IGZyb20gXCIuL2FuYWx5emVyXCI7XG5pbXBvcnQgeyBBTExfVEVDSE5JUVVFUywgZ2V0VGVjaG5pcXVlQnlJZCB9IGZyb20gXCIuL3RlY2huaXF1ZXNcIjtcbmltcG9ydCB0eXBlIHtcbiAgICBBbmFseXNpc1Jlc3VsdCxcbiAgICBDb21wbGV4aXR5LFxuICAgIEV4cGVjdGVkSW1wcm92ZW1lbnQsXG4gICAgT3B0aW1pemF0aW9uQ29uZmlnLFxuICAgIE9wdGltaXphdGlvblNlc3Npb24sXG4gICAgT3B0aW1pemF0aW9uU3RlcCxcbiAgICBUZWNobmlxdWVDb250ZXh0LFxuICAgIFRlY2huaXF1ZUlkLFxuICAgIFVzZXJQcmVmZXJlbmNlcyxcbn0gZnJvbSBcIi4vdHlwZXNcIjtcblxuLyoqXG4gKiBHZW5lcmF0ZSB1bmlxdWUgSURcbiAqL1xuZnVuY3Rpb24gZ2VuZXJhdGVJZCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBgJHtEYXRlLm5vdygpfS0ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA5KX1gO1xufVxuXG4vKipcbiAqIERlZmF1bHQgY29uZmlndXJhdGlvblxuICovXG5leHBvcnQgY29uc3QgREVGQVVMVF9DT05GSUc6IE9wdGltaXphdGlvbkNvbmZpZyA9IHtcbiAgICBlbmFibGVkOiB0cnVlLFxuICAgIGF1dG9BcHByb3ZlOiBmYWxzZSxcbiAgICB2ZXJib3NpdHk6IFwibm9ybWFsXCIsXG4gICAgZGVmYXVsdFRlY2huaXF1ZXM6IFtcbiAgICAgICAgXCJhbmFseXNpc1wiLFxuICAgICAgICBcImV4cGVydF9wZXJzb25hXCIsXG4gICAgICAgIFwicmVhc29uaW5nX2NoYWluXCIsXG4gICAgICAgIFwic3Rha2VzX2xhbmd1YWdlXCIsXG4gICAgICAgIFwic2VsZl9ldmFsdWF0aW9uXCIsXG4gICAgXSxcbiAgICBza2lwRm9yU2ltcGxlUHJvbXB0czogZmFsc2UsXG4gICAgZXNjYXBlUHJlZml4OiBcIiFcIixcbn07XG5cbi8qKlxuICogRGVmYXVsdCB1c2VyIHByZWZlcmVuY2VzXG4gKi9cbmV4cG9ydCBjb25zdCBERUZBVUxUX1BSRUZFUkVOQ0VTOiBVc2VyUHJlZmVyZW5jZXMgPSB7XG4gICAgc2tpcFRlY2huaXF1ZXM6IFtdLFxuICAgIGN1c3RvbVBlcnNvbmFzOiB7XG4gICAgICAgIHNlY3VyaXR5OiBcIlwiLFxuICAgICAgICBmcm9udGVuZDogXCJcIixcbiAgICAgICAgYmFja2VuZDogXCJcIixcbiAgICAgICAgZGF0YWJhc2U6IFwiXCIsXG4gICAgICAgIGRldm9wczogXCJcIixcbiAgICAgICAgYXJjaGl0ZWN0dXJlOiBcIlwiLFxuICAgICAgICB0ZXN0aW5nOiBcIlwiLFxuICAgICAgICBnZW5lcmFsOiBcIlwiLFxuICAgIH0sXG4gICAgYXV0b0FwcHJvdmVEZWZhdWx0OiBmYWxzZSxcbiAgICB2ZXJib3NpdHlEZWZhdWx0OiBcIm5vcm1hbFwiLFxufTtcblxuLyoqXG4gKiBQcm9tcHQgT3B0aW1pemVyIGNsYXNzXG4gKi9cbmV4cG9ydCBjbGFzcyBQcm9tcHRPcHRpbWl6ZXIge1xuICAgIHByaXZhdGUgY29uZmlnOiBPcHRpbWl6YXRpb25Db25maWc7XG4gICAgcHJpdmF0ZSBwcmVmZXJlbmNlczogVXNlclByZWZlcmVuY2VzO1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIGNvbmZpZzogUGFydGlhbDxPcHRpbWl6YXRpb25Db25maWc+ID0ge30sXG4gICAgICAgIHByZWZlcmVuY2VzOiBQYXJ0aWFsPFVzZXJQcmVmZXJlbmNlcz4gPSB7fSxcbiAgICApIHtcbiAgICAgICAgdGhpcy5jb25maWcgPSB7IC4uLkRFRkFVTFRfQ09ORklHLCAuLi5jb25maWcgfTtcbiAgICAgICAgdGhpcy5wcmVmZXJlbmNlcyA9IHsgLi4uREVGQVVMVF9QUkVGRVJFTkNFUywgLi4ucHJlZmVyZW5jZXMgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgY29uZmlndXJhdGlvblxuICAgICAqL1xuICAgIHVwZGF0ZUNvbmZpZyh1cGRhdGVzOiBQYXJ0aWFsPE9wdGltaXphdGlvbkNvbmZpZz4pOiB2b2lkIHtcbiAgICAgICAgdGhpcy5jb25maWcgPSB7IC4uLnRoaXMuY29uZmlnLCAuLi51cGRhdGVzIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVXBkYXRlIHByZWZlcmVuY2VzXG4gICAgICovXG4gICAgdXBkYXRlUHJlZmVyZW5jZXModXBkYXRlczogUGFydGlhbDxVc2VyUHJlZmVyZW5jZXM+KTogdm9pZCB7XG4gICAgICAgIHRoaXMucHJlZmVyZW5jZXMgPSB7IC4uLnRoaXMucHJlZmVyZW5jZXMsIC4uLnVwZGF0ZXMgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgY3VycmVudCBjb25maWd1cmF0aW9uXG4gICAgICovXG4gICAgZ2V0Q29uZmlnKCk6IE9wdGltaXphdGlvbkNvbmZpZyB7XG4gICAgICAgIHJldHVybiB7IC4uLnRoaXMuY29uZmlnIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IGN1cnJlbnQgcHJlZmVyZW5jZXNcbiAgICAgKi9cbiAgICBnZXRQcmVmZXJlbmNlcygpOiBVc2VyUHJlZmVyZW5jZXMge1xuICAgICAgICByZXR1cm4geyAuLi50aGlzLnByZWZlcmVuY2VzIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgb3B0aW1pemF0aW9uIHNob3VsZCBiZSBza2lwcGVkIChlc2NhcGUgaGF0Y2gpXG4gICAgICovXG4gICAgc2hvdWxkU2tpcE9wdGltaXphdGlvbihwcm9tcHQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gcHJvbXB0LnN0YXJ0c1dpdGgodGhpcy5jb25maWcuZXNjYXBlUHJlZml4KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTdHJpcCBlc2NhcGUgcHJlZml4IGZyb20gcHJvbXB0XG4gICAgICovXG4gICAgc3RyaXBFc2NhcGVQcmVmaXgocHJvbXB0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gcHJvbXB0LnNsaWNlKHRoaXMuY29uZmlnLmVzY2FwZVByZWZpeC5sZW5ndGgpLnRyaW0oKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBvcHRpbWl6YXRpb24gc2hvdWxkIGJlIHNraXBwZWQgZm9yIHNpbXBsZSBwcm9tcHRzXG4gICAgICovXG4gICAgc2hvdWxkU2tpcEZvckNvbXBsZXhpdHkoY29tcGxleGl0eTogQ29tcGxleGl0eSk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoIXRoaXMuY29uZmlnLnNraXBGb3JTaW1wbGVQcm9tcHRzKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbXBsZXhpdHkgPT09IFwic2ltcGxlXCI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IG9wdGltaXphdGlvbiBzZXNzaW9uXG4gICAgICovXG4gICAgY3JlYXRlU2Vzc2lvbihwcm9tcHQ6IHN0cmluZyk6IE9wdGltaXphdGlvblNlc3Npb24ge1xuICAgICAgICAvLyBDaGVjayBlc2NhcGUgaGF0Y2hcbiAgICAgICAgaWYgKHRoaXMuc2hvdWxkU2tpcE9wdGltaXphdGlvbihwcm9tcHQpKSB7XG4gICAgICAgICAgICBjb25zdCBzdHJpcHBlZCA9IHRoaXMuc3RyaXBFc2NhcGVQcmVmaXgocHJvbXB0KTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgaWQ6IGdlbmVyYXRlSWQoKSxcbiAgICAgICAgICAgICAgICBvcmlnaW5hbFByb21wdDogc3RyaXBwZWQsXG4gICAgICAgICAgICAgICAgY29tcGxleGl0eTogXCJzaW1wbGVcIixcbiAgICAgICAgICAgICAgICBkb21haW46IFwiZ2VuZXJhbFwiLFxuICAgICAgICAgICAgICAgIHN0ZXBzOiBbXSxcbiAgICAgICAgICAgICAgICBmaW5hbFByb21wdDogc3RyaXBwZWQsXG4gICAgICAgICAgICAgICAgdmVyYm9zaXR5OiB0aGlzLmNvbmZpZy52ZXJib3NpdHksXG4gICAgICAgICAgICAgICAgYXV0b0FwcHJvdmU6IHRoaXMuY29uZmlnLmF1dG9BcHByb3ZlLFxuICAgICAgICAgICAgICAgIHByZWZlcmVuY2VzOiB0aGlzLnByZWZlcmVuY2VzLFxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBbmFseXplIHByb21wdFxuICAgICAgICBjb25zdCBhbmFseXNpcyA9IGFuYWx5emVQcm9tcHQocHJvbXB0KTtcblxuICAgICAgICAvLyBDaGVjayBpZiBzaG91bGQgc2tpcCBmb3IgY29tcGxleGl0eVxuICAgICAgICBpZiAodGhpcy5zaG91bGRTa2lwRm9yQ29tcGxleGl0eShhbmFseXNpcy5jb21wbGV4aXR5KSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBpZDogZ2VuZXJhdGVJZCgpLFxuICAgICAgICAgICAgICAgIG9yaWdpbmFsUHJvbXB0OiBwcm9tcHQsXG4gICAgICAgICAgICAgICAgY29tcGxleGl0eTogYW5hbHlzaXMuY29tcGxleGl0eSxcbiAgICAgICAgICAgICAgICBkb21haW46IGFuYWx5c2lzLmRvbWFpbixcbiAgICAgICAgICAgICAgICBzdGVwczogW10sXG4gICAgICAgICAgICAgICAgZmluYWxQcm9tcHQ6IHByb21wdCxcbiAgICAgICAgICAgICAgICB2ZXJib3NpdHk6IHRoaXMuY29uZmlnLnZlcmJvc2l0eSxcbiAgICAgICAgICAgICAgICBhdXRvQXBwcm92ZTogdGhpcy5jb25maWcuYXV0b0FwcHJvdmUsXG4gICAgICAgICAgICAgICAgcHJlZmVyZW5jZXM6IHRoaXMucHJlZmVyZW5jZXMsXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEdlbmVyYXRlIG9wdGltaXphdGlvbiBzdGVwc1xuICAgICAgICBjb25zdCBzdGVwcyA9IHRoaXMuZ2VuZXJhdGVTdGVwcyhhbmFseXNpcyk7XG5cbiAgICAgICAgLy8gQnVpbGQgZmluYWwgcHJvbXB0IChpbml0aWFsIHZlcnNpb24pXG4gICAgICAgIGNvbnN0IGZpbmFsUHJvbXB0ID0gdGhpcy5idWlsZEZpbmFsUHJvbXB0KHByb21wdCwgc3RlcHMpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpZDogZ2VuZXJhdGVJZCgpLFxuICAgICAgICAgICAgb3JpZ2luYWxQcm9tcHQ6IHByb21wdCxcbiAgICAgICAgICAgIGNvbXBsZXhpdHk6IGFuYWx5c2lzLmNvbXBsZXhpdHksXG4gICAgICAgICAgICBkb21haW46IGFuYWx5c2lzLmRvbWFpbixcbiAgICAgICAgICAgIHN0ZXBzLFxuICAgICAgICAgICAgZmluYWxQcm9tcHQsXG4gICAgICAgICAgICB2ZXJib3NpdHk6IHRoaXMuY29uZmlnLnZlcmJvc2l0eSxcbiAgICAgICAgICAgIGF1dG9BcHByb3ZlOiB0aGlzLmNvbmZpZy5hdXRvQXBwcm92ZSxcbiAgICAgICAgICAgIHByZWZlcmVuY2VzOiB0aGlzLnByZWZlcmVuY2VzLFxuICAgICAgICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlIG9wdGltaXphdGlvbiBzdGVwcyBiYXNlZCBvbiBhbmFseXNpc1xuICAgICAqL1xuICAgIHByaXZhdGUgZ2VuZXJhdGVTdGVwcyhhbmFseXNpczogQW5hbHlzaXNSZXN1bHQpOiBPcHRpbWl6YXRpb25TdGVwW10ge1xuICAgICAgICBjb25zdCBzdGVwczogT3B0aW1pemF0aW9uU3RlcFtdID0gW107XG4gICAgICAgIGxldCBzdGVwSWQgPSAxO1xuXG4gICAgICAgIGZvciAoY29uc3QgdGVjaG5pcXVlSWQgb2YgYW5hbHlzaXMuc3VnZ2VzdGVkVGVjaG5pcXVlcykge1xuICAgICAgICAgICAgLy8gU2tpcCBpZiB1c2VyIGFsd2F5cyBza2lwcyB0aGlzIHRlY2huaXF1ZVxuICAgICAgICAgICAgaWYgKHRoaXMucHJlZmVyZW5jZXMuc2tpcFRlY2huaXF1ZXMuaW5jbHVkZXModGVjaG5pcXVlSWQpKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHRlY2huaXF1ZSA9IGdldFRlY2huaXF1ZUJ5SWQodGVjaG5pcXVlSWQpO1xuICAgICAgICAgICAgaWYgKCF0ZWNobmlxdWUpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgY29udGV4dDogVGVjaG5pcXVlQ29udGV4dCA9IHtcbiAgICAgICAgICAgICAgICBvcmlnaW5hbFByb21wdDogXCJcIixcbiAgICAgICAgICAgICAgICBjb21wbGV4aXR5OiBhbmFseXNpcy5jb21wbGV4aXR5LFxuICAgICAgICAgICAgICAgIGRvbWFpbjogYW5hbHlzaXMuZG9tYWluLFxuICAgICAgICAgICAgICAgIHByZXZpb3VzU3RlcHM6IHN0ZXBzLFxuICAgICAgICAgICAgICAgIHByZWZlcmVuY2VzOiB0aGlzLnByZWZlcmVuY2VzLFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc3RlcHMucHVzaCh7XG4gICAgICAgICAgICAgICAgaWQ6IHN0ZXBJZCsrLFxuICAgICAgICAgICAgICAgIHRlY2huaXF1ZTogdGVjaG5pcXVlSWQsXG4gICAgICAgICAgICAgICAgbmFtZTogdGVjaG5pcXVlLm5hbWUsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHRlY2huaXF1ZS5kZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICBjb250ZW50OiB0ZWNobmlxdWUuZ2VuZXJhdGUoY29udGV4dCksXG4gICAgICAgICAgICAgICAgc3RhdHVzOiBcInBlbmRpbmdcIixcbiAgICAgICAgICAgICAgICBza2lwcGFibGU6IHRlY2huaXF1ZUlkICE9PSBcImFuYWx5c2lzXCIsIC8vIEFuYWx5c2lzIGNhbid0IGJlIHNraXBwZWRcbiAgICAgICAgICAgICAgICBhcHBsaWVzVG86IHRlY2huaXF1ZS5hcHBsaWVzVG8sXG4gICAgICAgICAgICAgICAgcmVzZWFyY2hCYXNpczogdGVjaG5pcXVlLnJlc2VhcmNoQmFzaXMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEF1dG8tYXBwcm92ZSBpZiBlbmFibGVkXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy5hdXRvQXBwcm92ZSkge1xuICAgICAgICAgICAgZm9yIChjb25zdCBzdGVwIG9mIHN0ZXBzKSB7XG4gICAgICAgICAgICAgICAgc3RlcC5zdGF0dXMgPSBcImFwcHJvdmVkXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc3RlcHM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQnVpbGQgZmluYWwgcHJvbXB0IGZyb20gb3JpZ2luYWwgKyBhcHByb3ZlZCBzdGVwc1xuICAgICAqL1xuICAgIGJ1aWxkRmluYWxQcm9tcHQoXG4gICAgICAgIG9yaWdpbmFsUHJvbXB0OiBzdHJpbmcsXG4gICAgICAgIHN0ZXBzOiBPcHRpbWl6YXRpb25TdGVwW10sXG4gICAgKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgYXBwcm92ZWRTdGVwcyA9IHN0ZXBzLmZpbHRlcihcbiAgICAgICAgICAgIChzKSA9PiBzLnN0YXR1cyA9PT0gXCJhcHByb3ZlZFwiIHx8IHMuc3RhdHVzID09PSBcIm1vZGlmaWVkXCIsXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKGFwcHJvdmVkU3RlcHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gb3JpZ2luYWxQcm9tcHQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBCdWlsZCBlbmhhbmNlZCBwcm9tcHRcbiAgICAgICAgY29uc3QgcGFydHM6IHN0cmluZ1tdID0gW107XG5cbiAgICAgICAgZm9yIChjb25zdCBzdGVwIG9mIGFwcHJvdmVkU3RlcHMpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBzdGVwLm1vZGlmaWVkQ29udGVudCB8fCBzdGVwLmNvbnRlbnQ7XG4gICAgICAgICAgICBpZiAoY29udGVudCkge1xuICAgICAgICAgICAgICAgIHBhcnRzLnB1c2goY29udGVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBZGQgb3JpZ2luYWwgdGFzayBhdCB0aGUgZW5kXG4gICAgICAgIHBhcnRzLnB1c2goYFxcblxcblRhc2s6ICR7b3JpZ2luYWxQcm9tcHR9YCk7XG5cbiAgICAgICAgcmV0dXJuIHBhcnRzLmpvaW4oXCJcXG5cXG5cIik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVXBkYXRlIGZpbmFsIHByb21wdCBiYXNlZCBvbiBjdXJyZW50IHN0ZXBzXG4gICAgICovXG4gICAgdXBkYXRlRmluYWxQcm9tcHQoc2Vzc2lvbjogT3B0aW1pemF0aW9uU2Vzc2lvbik6IHZvaWQge1xuICAgICAgICBzZXNzaW9uLmZpbmFsUHJvbXB0ID0gdGhpcy5idWlsZEZpbmFsUHJvbXB0KFxuICAgICAgICAgICAgc2Vzc2lvbi5vcmlnaW5hbFByb21wdCxcbiAgICAgICAgICAgIHNlc3Npb24uc3RlcHMsXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXBwcm92ZSBhIHN0ZXBcbiAgICAgKi9cbiAgICBhcHByb3ZlU3RlcChzZXNzaW9uOiBPcHRpbWl6YXRpb25TZXNzaW9uLCBzdGVwSWQ6IG51bWJlcik6IHZvaWQge1xuICAgICAgICBjb25zdCBzdGVwID0gc2Vzc2lvbi5zdGVwcy5maW5kKChzKSA9PiBzLmlkID09PSBzdGVwSWQpO1xuICAgICAgICBpZiAoc3RlcCkge1xuICAgICAgICAgICAgc3RlcC5zdGF0dXMgPSBcImFwcHJvdmVkXCI7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUZpbmFsUHJvbXB0KHNlc3Npb24pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVqZWN0IGEgc3RlcFxuICAgICAqL1xuICAgIHJlamVjdFN0ZXAoc2Vzc2lvbjogT3B0aW1pemF0aW9uU2Vzc2lvbiwgc3RlcElkOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgc3RlcCA9IHNlc3Npb24uc3RlcHMuZmluZCgocykgPT4gcy5pZCA9PT0gc3RlcElkKTtcbiAgICAgICAgaWYgKHN0ZXApIHtcbiAgICAgICAgICAgIHN0ZXAuc3RhdHVzID0gXCJyZWplY3RlZFwiO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVGaW5hbFByb21wdChzZXNzaW9uKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1vZGlmeSBhIHN0ZXBcbiAgICAgKi9cbiAgICBtb2RpZnlTdGVwKFxuICAgICAgICBzZXNzaW9uOiBPcHRpbWl6YXRpb25TZXNzaW9uLFxuICAgICAgICBzdGVwSWQ6IG51bWJlcixcbiAgICAgICAgbmV3Q29udGVudDogc3RyaW5nLFxuICAgICk6IHZvaWQge1xuICAgICAgICBjb25zdCBzdGVwID0gc2Vzc2lvbi5zdGVwcy5maW5kKChzKSA9PiBzLmlkID09PSBzdGVwSWQpO1xuICAgICAgICBpZiAoc3RlcCkge1xuICAgICAgICAgICAgc3RlcC5tb2RpZmllZENvbnRlbnQgPSBuZXdDb250ZW50O1xuICAgICAgICAgICAgc3RlcC5zdGF0dXMgPSBcIm1vZGlmaWVkXCI7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUZpbmFsUHJvbXB0KHNlc3Npb24pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXBwcm92ZSBhbGwgc3RlcHNcbiAgICAgKi9cbiAgICBhcHByb3ZlQWxsKHNlc3Npb246IE9wdGltaXphdGlvblNlc3Npb24pOiB2b2lkIHtcbiAgICAgICAgZm9yIChjb25zdCBzdGVwIG9mIHNlc3Npb24uc3RlcHMpIHtcbiAgICAgICAgICAgIGlmIChzdGVwLnN0YXR1cyA9PT0gXCJwZW5kaW5nXCIpIHtcbiAgICAgICAgICAgICAgICBzdGVwLnN0YXR1cyA9IFwiYXBwcm92ZWRcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnVwZGF0ZUZpbmFsUHJvbXB0KHNlc3Npb24pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNraXAgb3B0aW1pemF0aW9uIChyZWplY3QgYWxsIG5vbi1hbmFseXNpcyBzdGVwcylcbiAgICAgKi9cbiAgICBza2lwT3B0aW1pemF0aW9uKHNlc3Npb246IE9wdGltaXphdGlvblNlc3Npb24pOiB2b2lkIHtcbiAgICAgICAgZm9yIChjb25zdCBzdGVwIG9mIHNlc3Npb24uc3RlcHMpIHtcbiAgICAgICAgICAgIGlmIChzdGVwLnRlY2huaXF1ZSAhPT0gXCJhbmFseXNpc1wiKSB7XG4gICAgICAgICAgICAgICAgc3RlcC5zdGF0dXMgPSBcInJlamVjdGVkXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy51cGRhdGVGaW5hbFByb21wdChzZXNzaW9uKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTYXZlIHByZWZlcmVuY2UgdG8gYWx3YXlzIHNraXAgYSB0ZWNobmlxdWVcbiAgICAgKi9cbiAgICBzYXZlU2tpcFByZWZlcmVuY2UodGVjaG5pcXVlSWQ6IFRlY2huaXF1ZUlkKTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5wcmVmZXJlbmNlcy5za2lwVGVjaG5pcXVlcy5pbmNsdWRlcyh0ZWNobmlxdWVJZCkpIHtcbiAgICAgICAgICAgIHRoaXMucHJlZmVyZW5jZXMuc2tpcFRlY2huaXF1ZXMucHVzaCh0ZWNobmlxdWVJZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTYXZlIGN1c3RvbSBwZXJzb25hIGZvciBhIGRvbWFpblxuICAgICAqL1xuICAgIHNhdmVDdXN0b21QZXJzb25hKFxuICAgICAgICBkb21haW46XG4gICAgICAgICAgICB8IFwic2VjdXJpdHlcIlxuICAgICAgICAgICAgfCBcImZyb250ZW5kXCJcbiAgICAgICAgICAgIHwgXCJiYWNrZW5kXCJcbiAgICAgICAgICAgIHwgXCJkYXRhYmFzZVwiXG4gICAgICAgICAgICB8IFwiZGV2b3BzXCJcbiAgICAgICAgICAgIHwgXCJhcmNoaXRlY3R1cmVcIlxuICAgICAgICAgICAgfCBcInRlc3RpbmdcIlxuICAgICAgICAgICAgfCBcImdlbmVyYWxcIixcbiAgICAgICAgcGVyc29uYTogc3RyaW5nLFxuICAgICk6IHZvaWQge1xuICAgICAgICB0aGlzLnByZWZlcmVuY2VzLmN1c3RvbVBlcnNvbmFzW2RvbWFpbl0gPSBwZXJzb25hO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRvZ2dsZSBhdXRvLWFwcHJvdmVcbiAgICAgKi9cbiAgICB0b2dnbGVBdXRvQXBwcm92ZShlbmFibGVkPzogYm9vbGVhbik6IHZvaWQge1xuICAgICAgICB0aGlzLmNvbmZpZy5hdXRvQXBwcm92ZSA9XG4gICAgICAgICAgICBlbmFibGVkICE9PSB1bmRlZmluZWQgPyBlbmFibGVkIDogIXRoaXMuY29uZmlnLmF1dG9BcHByb3ZlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCB2ZXJib3NpdHlcbiAgICAgKi9cbiAgICBzZXRWZXJib3NpdHkodmVyYm9zaXR5OiBcInF1aWV0XCIgfCBcIm5vcm1hbFwiIHwgXCJ2ZXJib3NlXCIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5jb25maWcudmVyYm9zaXR5ID0gdmVyYm9zaXR5O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENhbGN1bGF0ZSBleHBlY3RlZCBpbXByb3ZlbWVudFxuICAgICAqL1xuICAgIGNhbGN1bGF0ZUV4cGVjdGVkSW1wcm92ZW1lbnQoXG4gICAgICAgIHNlc3Npb246IE9wdGltaXphdGlvblNlc3Npb24sXG4gICAgKTogRXhwZWN0ZWRJbXByb3ZlbWVudCB7XG4gICAgICAgIGNvbnN0IGFwcHJvdmVkVGVjaG5pcXVlcyA9IHNlc3Npb24uc3RlcHMuZmlsdGVyKFxuICAgICAgICAgICAgKHMpID0+IHMuc3RhdHVzID09PSBcImFwcHJvdmVkXCIgfHwgcy5zdGF0dXMgPT09IFwibW9kaWZpZWRcIixcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgdGVjaG5pcXVlc0FwcGxpZWQgPSBhcHByb3ZlZFRlY2huaXF1ZXMubWFwKChzKSA9PiBzLnRlY2huaXF1ZSk7XG5cbiAgICAgICAgLy8gQXBwcm94aW1hdGUgcXVhbGl0eSBpbXByb3ZlbWVudCBiYXNlZCBvbiByZXNlYXJjaFxuICAgICAgICBjb25zdCBpbXByb3ZlbWVudE1hcDogUmVjb3JkPFRlY2huaXF1ZUlkLCBudW1iZXI+ID0ge1xuICAgICAgICAgICAgYW5hbHlzaXM6IDUsXG4gICAgICAgICAgICBleHBlcnRfcGVyc29uYTogNjAsXG4gICAgICAgICAgICByZWFzb25pbmdfY2hhaW46IDQ2LFxuICAgICAgICAgICAgc3Rha2VzX2xhbmd1YWdlOiA0NSxcbiAgICAgICAgICAgIGNoYWxsZW5nZV9mcmFtaW5nOiAxMTUsXG4gICAgICAgICAgICBzZWxmX2V2YWx1YXRpb246IDEwLFxuICAgICAgICB9O1xuXG4gICAgICAgIGxldCB0b3RhbEltcHJvdmVtZW50ID0gMDtcbiAgICAgICAgZm9yIChjb25zdCB0ZWNobmlxdWVJZCBvZiB0ZWNobmlxdWVzQXBwbGllZCkge1xuICAgICAgICAgICAgdG90YWxJbXByb3ZlbWVudCArPSBpbXByb3ZlbWVudE1hcFt0ZWNobmlxdWVJZF0gfHwgMDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENhcCBhdCByZWFzb25hYmxlIG1heGltdW0gKGRpbWluaXNoaW5nIHJldHVybnMpXG4gICAgICAgIGNvbnN0IGVmZmVjdGl2ZUltcHJvdmVtZW50ID0gTWF0aC5taW4odG90YWxJbXByb3ZlbWVudCwgMTUwKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcXVhbGl0eUltcHJvdmVtZW50OiBlZmZlY3RpdmVJbXByb3ZlbWVudCxcbiAgICAgICAgICAgIHRlY2huaXF1ZXNBcHBsaWVkLFxuICAgICAgICAgICAgcmVzZWFyY2hCYXNpczpcbiAgICAgICAgICAgICAgICBcIkNvbWJpbmVkIHJlc2VhcmNoLWJhY2tlZCB0ZWNobmlxdWVzIChNQlpVQUksIEdvb2dsZSBEZWVwTWluZCwgSUNMUiAyMDI0KVwiLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBzZXNzaW9uIHN1bW1hcnlcbiAgICAgKi9cbiAgICBnZXRTZXNzaW9uU3VtbWFyeShzZXNzaW9uOiBPcHRpbWl6YXRpb25TZXNzaW9uKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgaW1wcm92ZW1lbnQgPSB0aGlzLmNhbGN1bGF0ZUV4cGVjdGVkSW1wcm92ZW1lbnQoc2Vzc2lvbik7XG4gICAgICAgIGNvbnN0IGFwcHJvdmVkQ291bnQgPSBzZXNzaW9uLnN0ZXBzLmZpbHRlcihcbiAgICAgICAgICAgIChzKSA9PiBzLnN0YXR1cyA9PT0gXCJhcHByb3ZlZFwiIHx8IHMuc3RhdHVzID09PSBcIm1vZGlmaWVkXCIsXG4gICAgICAgICkubGVuZ3RoO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBgT3B0aW1pemF0aW9uIFNlc3Npb24gJHtzZXNzaW9uLmlkfVxcbmAgK1xuICAgICAgICAgICAgYCAgQ29tcGxleGl0eTogJHtzZXNzaW9uLmNvbXBsZXhpdHl9XFxuYCArXG4gICAgICAgICAgICBgICBEb21haW46ICR7c2Vzc2lvbi5kb21haW59XFxuYCArXG4gICAgICAgICAgICBgICBTdGVwcyBBcHBsaWVkOiAke2FwcHJvdmVkQ291bnR9LyR7c2Vzc2lvbi5zdGVwcy5sZW5ndGh9XFxuYCArXG4gICAgICAgICAgICBgICBFeHBlY3RlZCBJbXByb3ZlbWVudDogfiR7aW1wcm92ZW1lbnQucXVhbGl0eUltcHJvdmVtZW50fSVgXG4gICAgICAgICk7XG4gICAgfVxufVxuIiwKICAgICIvKipcbiAqIERpc2NvcmQgV2ViaG9vayBJbnRlZ3JhdGlvblxuICpcbiAqIFNlbmRzIG5vdGlmaWNhdGlvbnMgdG8gRGlzY29yZCBjaGFubmVscyB2aWEgd2ViaG9va3MuXG4gKiBTdXBwb3J0cyByaWNoIGVtYmVkcyBmb3IgY3ljbGUgcHJvZ3Jlc3MsIGVycm9ycywgYW5kIGNvbXBsZXRpb25zLlxuICovXG5cbmltcG9ydCB7IExvZyB9IGZyb20gXCIuL2xvZ1wiO1xuXG5jb25zdCBsb2cgPSBMb2cuY3JlYXRlKHsgc2VydmljZTogXCJkaXNjb3JkLXdlYmhvb2tcIiB9KTtcblxuZXhwb3J0IGludGVyZmFjZSBEaXNjb3JkV2ViaG9va09wdGlvbnMge1xuICAgIC8qKiBEaXNjb3JkIHdlYmhvb2sgVVJMICovXG4gICAgd2ViaG9va1VybDogc3RyaW5nO1xuICAgIC8qKiBCb3QgdXNlcm5hbWUgKG9wdGlvbmFsLCBkZWZhdWx0cyB0byBcIlJhbHBoXCIpICovXG4gICAgdXNlcm5hbWU/OiBzdHJpbmc7XG4gICAgLyoqIEJvdCBhdmF0YXIgVVJMIChvcHRpb25hbCkgKi9cbiAgICBhdmF0YXJVcmw/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGlzY29yZEVtYmVkIHtcbiAgICAvKiogRW1iZWQgdGl0bGUgKi9cbiAgICB0aXRsZT86IHN0cmluZztcbiAgICAvKiogRW1iZWQgZGVzY3JpcHRpb24gKi9cbiAgICBkZXNjcmlwdGlvbj86IHN0cmluZztcbiAgICAvKiogRW1iZWQgY29sb3IgKGRlY2ltYWwsIGUuZy4sIDB4MDBGRjAwIGZvciBncmVlbikgKi9cbiAgICBjb2xvcj86IG51bWJlcjtcbiAgICAvKiogRm9vdGVyIHRleHQgKi9cbiAgICBmb290ZXI/OiBzdHJpbmc7XG4gICAgLyoqIEZvb3RlciBpY29uIFVSTCAqL1xuICAgIGZvb3Rlckljb25Vcmw/OiBzdHJpbmc7XG4gICAgLyoqIFRpbWVzdGFtcCAoSVNPIDg2MDEgZm9ybWF0KSAqL1xuICAgIHRpbWVzdGFtcD86IHN0cmluZztcbiAgICAvKiogVGh1bWJuYWlsIGltYWdlIFVSTCAqL1xuICAgIHRodW1ibmFpbFVybD86IHN0cmluZztcbiAgICAvKiogSW1hZ2UgVVJMICovXG4gICAgaW1hZ2VVcmw/OiBzdHJpbmc7XG4gICAgLyoqIEF1dGhvciBuYW1lICovXG4gICAgYXV0aG9yTmFtZT86IHN0cmluZztcbiAgICAvKiogQXV0aG9yIFVSTCAqL1xuICAgIGF1dGhvclVybD86IHN0cmluZztcbiAgICAvKiogQXV0aG9yIGljb24gVVJMICovXG4gICAgYXV0aG9ySWNvblVybD86IHN0cmluZztcbiAgICAvKiogRmllbGRzIChuYW1lL3ZhbHVlIHBhaXJzKSAqL1xuICAgIGZpZWxkcz86IEFycmF5PHtcbiAgICAgICAgbmFtZTogc3RyaW5nO1xuICAgICAgICB2YWx1ZTogc3RyaW5nO1xuICAgICAgICBpbmxpbmU/OiBib29sZWFuO1xuICAgIH0+O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERpc2NvcmRNZXNzYWdlIHtcbiAgICAvKiogTWVzc2FnZSBjb250ZW50IChwbGFpbiB0ZXh0KSAqL1xuICAgIGNvbnRlbnQ/OiBzdHJpbmc7XG4gICAgLyoqIFVzZXJuYW1lIG92ZXJyaWRlICovXG4gICAgdXNlcm5hbWU/OiBzdHJpbmc7XG4gICAgLyoqIEF2YXRhciBVUkwgb3ZlcnJpZGUgKi9cbiAgICBhdmF0YXJVcmw/OiBzdHJpbmc7XG4gICAgLyoqIFdoZXRoZXIgdG8gcHJvY2VzcyBAZXZlcnlvbmUgbWVudGlvbnMgKi9cbiAgICB0dHM/OiBib29sZWFuO1xuICAgIC8qKiBFbWJlZHMgdG8gc2VuZCAqL1xuICAgIGVtYmVkcz86IERpc2NvcmRFbWJlZFtdO1xufVxuXG4vKipcbiAqIERpc2NvcmQgV2ViaG9vayBDbGllbnRcbiAqL1xuZXhwb3J0IGNsYXNzIERpc2NvcmRXZWJob29rQ2xpZW50IHtcbiAgICBwcml2YXRlIHdlYmhvb2tVcmw6IHN0cmluZztcbiAgICBwcml2YXRlIHVzZXJuYW1lOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBhdmF0YXJVcmw/OiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBlbmFibGVkID0gZmFsc2U7XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiBEaXNjb3JkV2ViaG9va09wdGlvbnMpIHtcbiAgICAgICAgdGhpcy53ZWJob29rVXJsID0gb3B0aW9ucy53ZWJob29rVXJsO1xuICAgICAgICB0aGlzLnVzZXJuYW1lID0gb3B0aW9ucy51c2VybmFtZSA/PyBcIlJhbHBoXCI7XG4gICAgICAgIHRoaXMuYXZhdGFyVXJsID0gb3B0aW9ucy5hdmF0YXJVcmw7XG4gICAgICAgIHRoaXMuZW5hYmxlZCA9IHRydWU7XG5cbiAgICAgICAgLy8gVmFsaWRhdGUgd2ViaG9vayBVUkwgZm9ybWF0XG4gICAgICAgIGlmICghdGhpcy53ZWJob29rVXJsIHx8ICF0aGlzLmlzVmFsaWRXZWJob29rVXJsKHRoaXMud2ViaG9va1VybCkpIHtcbiAgICAgICAgICAgIGxvZy53YXJuKFwiSW52YWxpZCBEaXNjb3JkIHdlYmhvb2sgVVJMLCBub3RpZmljYXRpb25zIGRpc2FibGVkXCIsIHtcbiAgICAgICAgICAgICAgICB3ZWJob29rVXJsOiB0aGlzLm1hc2tXZWJob29rVXJsKHRoaXMud2ViaG9va1VybCksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuZW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgbG9nLmluZm8oXCJEaXNjb3JkIHdlYmhvb2sgY2xpZW50IGluaXRpYWxpemVkXCIsIHtcbiAgICAgICAgICAgIGVuYWJsZWQ6IHRoaXMuZW5hYmxlZCxcbiAgICAgICAgICAgIHVzZXJuYW1lOiB0aGlzLnVzZXJuYW1lLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzVmFsaWRXZWJob29rVXJsKHVybDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIC8vIERpc2NvcmQgd2ViaG9vayBVUkxzIGxvb2sgbGlrZTogaHR0cHM6Ly9kaXNjb3JkLmNvbS9hcGkvd2ViaG9va3Mve2lkfS97dG9rZW59XG4gICAgICAgIHJldHVybiAvXmh0dHBzOlxcL1xcL2Rpc2NvcmQoPzphcHApP1xcLmNvbVxcL2FwaVxcL3dlYmhvb2tzXFwvXFxkK1xcL1thLXpBLVowLTlfLV0rJC8udGVzdChcbiAgICAgICAgICAgIHVybCxcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG1hc2tXZWJob29rVXJsKHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgaWYgKCF1cmwpIHJldHVybiBcIihub3Qgc2V0KVwiO1xuICAgICAgICAvLyBNYXNrIHRoZSB0b2tlbiBwYXJ0XG4gICAgICAgIHJldHVybiB1cmwucmVwbGFjZSgvXFwvW2EtekEtWjAtOV8tXSskLywgXCIvKioqKioqKipcIik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2VuZCBhIG1lc3NhZ2UgdG8gRGlzY29yZFxuICAgICAqL1xuICAgIGFzeW5jIHNlbmQobWVzc2FnZTogRGlzY29yZE1lc3NhZ2UpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgaWYgKCF0aGlzLmVuYWJsZWQpIHtcbiAgICAgICAgICAgIGxvZy5kZWJ1ZyhcIkRpc2NvcmQgbm90aWZpY2F0aW9ucyBkaXNhYmxlZCwgc2tpcHBpbmcgc2VuZFwiKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBwYXlsb2FkOiBEaXNjb3JkTWVzc2FnZSA9IHtcbiAgICAgICAgICAgICAgICBjb250ZW50OiBtZXNzYWdlLmNvbnRlbnQsXG4gICAgICAgICAgICAgICAgdXNlcm5hbWU6IG1lc3NhZ2UudXNlcm5hbWUgPz8gdGhpcy51c2VybmFtZSxcbiAgICAgICAgICAgICAgICBhdmF0YXJVcmw6IG1lc3NhZ2UuYXZhdGFyVXJsID8/IHRoaXMuYXZhdGFyVXJsLFxuICAgICAgICAgICAgICAgIHR0czogbWVzc2FnZS50dHMgPz8gZmFsc2UsXG4gICAgICAgICAgICAgICAgZW1iZWRzOiBtZXNzYWdlLmVtYmVkcyxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGxvZy5kZWJ1ZyhcIlNlbmRpbmcgRGlzY29yZCBub3RpZmljYXRpb25cIiwge1xuICAgICAgICAgICAgICAgIGhhc0NvbnRlbnQ6ICEhbWVzc2FnZS5jb250ZW50LFxuICAgICAgICAgICAgICAgIGVtYmVkQ291bnQ6IG1lc3NhZ2UuZW1iZWRzPy5sZW5ndGggPz8gMCxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHRoaXMud2ViaG9va1VybCwge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHBheWxvYWQpLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvclRleHQgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XG4gICAgICAgICAgICAgICAgbG9nLmVycm9yKFwiRGlzY29yZCB3ZWJob29rIHJlcXVlc3QgZmFpbGVkXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiByZXNwb25zZS5zdGF0dXMsXG4gICAgICAgICAgICAgICAgICAgIHN0YXR1c1RleHQ6IHJlc3BvbnNlLnN0YXR1c1RleHQsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvclRleHQsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsb2cuZGVidWcoXCJEaXNjb3JkIG5vdGlmaWNhdGlvbiBzZW50IHN1Y2Nlc3NmdWxseVwiKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgbG9nLmVycm9yKFwiRmFpbGVkIHRvIHNlbmQgRGlzY29yZCBub3RpZmljYXRpb25cIiwge1xuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvciksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNlbmQgYSBzaW1wbGUgdGV4dCBtZXNzYWdlXG4gICAgICovXG4gICAgYXN5bmMgbm90aWZ5KGNvbnRlbnQ6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICByZXR1cm4gdGhpcy5zZW5kKHsgY29udGVudCB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZW5kIGFuIGVtYmVkIG1lc3NhZ2VcbiAgICAgKi9cbiAgICBhc3luYyBub3RpZnlXaXRoRW1iZWQoXG4gICAgICAgIGVtYmVkOiBEaXNjb3JkRW1iZWQsXG4gICAgICAgIGNvbnRlbnQ/OiBzdHJpbmcsXG4gICAgKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIHJldHVybiB0aGlzLnNlbmQoe1xuICAgICAgICAgICAgY29udGVudCxcbiAgICAgICAgICAgIGVtYmVkczogW2VtYmVkXSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2VuZCBjeWNsZSBzdGFydCBub3RpZmljYXRpb25cbiAgICAgKi9cbiAgICBhc3luYyBub3RpZnlDeWNsZVN0YXJ0KFxuICAgICAgICBjeWNsZU51bWJlcjogbnVtYmVyLFxuICAgICAgICBtYXhDeWNsZXM6IG51bWJlcixcbiAgICAgICAgcHJvbXB0OiBzdHJpbmcsXG4gICAgKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIGNvbnN0IGVtYmVkOiBEaXNjb3JkRW1iZWQgPSB7XG4gICAgICAgICAgICB0aXRsZTogYPCflIQgQ3ljbGUgJHtjeWNsZU51bWJlcn0vJHttYXhDeWNsZXN9IFN0YXJ0ZWRgLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IGBcXGBcXGBcXGBcXG4ke3Byb21wdC5zbGljZSgwLCA1MDApfSR7cHJvbXB0Lmxlbmd0aCA+IDUwMCA/IFwiLi4uXCIgOiBcIlwifVxcblxcYFxcYFxcYGAsXG4gICAgICAgICAgICBjb2xvcjogMHg1ODY1ZjIsIC8vIERpc2NvcmQgYmx1cnBsZVxuICAgICAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICBmaWVsZHM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IFwi8J+TiyBQaGFzZVwiLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogXCJSZXNlYXJjaCDihpIgU3BlY2lmeSDihpIgUGxhbiDihpIgV29yayDihpIgUmV2aWV3XCIsXG4gICAgICAgICAgICAgICAgICAgIGlubGluZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogXCLij7HvuI8gU3RhdHVzXCIsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBcIlJ1bm5pbmdcIixcbiAgICAgICAgICAgICAgICAgICAgaW5saW5lOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiB0aGlzLm5vdGlmeVdpdGhFbWJlZChcbiAgICAgICAgICAgIGVtYmVkLFxuICAgICAgICAgICAgYPCfmoAgKipSYWxwaCBDeWNsZSAke2N5Y2xlTnVtYmVyfS8ke21heEN5Y2xlc30gU3RhcnRlZCoqYCxcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZW5kIGN5Y2xlIGNvbXBsZXRpb24gbm90aWZpY2F0aW9uXG4gICAgICovXG4gICAgYXN5bmMgbm90aWZ5Q3ljbGVDb21wbGV0ZShcbiAgICAgICAgY3ljbGVOdW1iZXI6IG51bWJlcixcbiAgICAgICAgY29tcGxldGVkQ3ljbGVzOiBudW1iZXIsXG4gICAgICAgIHN1bW1hcnk6IHN0cmluZyxcbiAgICAgICAgZHVyYXRpb25NczogbnVtYmVyLFxuICAgICk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICBjb25zdCBkdXJhdGlvbk1pbnV0ZXMgPSBNYXRoLmZsb29yKGR1cmF0aW9uTXMgLyA2MDAwMCk7XG4gICAgICAgIGNvbnN0IGR1cmF0aW9uU2Vjb25kcyA9IE1hdGguZmxvb3IoKGR1cmF0aW9uTXMgJSA2MDAwMCkgLyAxMDAwKTtcblxuICAgICAgICBjb25zdCBlbWJlZDogRGlzY29yZEVtYmVkID0ge1xuICAgICAgICAgICAgdGl0bGU6IGDinIUgQ3ljbGUgJHtjeWNsZU51bWJlcn0gQ29tcGxldGVkYCxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBzdW1tYXJ5LnNsaWNlKDAsIDIwMDApIHx8IFwiTm8gc3VtbWFyeSBhdmFpbGFibGVcIixcbiAgICAgICAgICAgIGNvbG9yOiAweDU3ZjI4NywgLy8gRGlzY29yZCBncmVlblxuICAgICAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICBmaWVsZHM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IFwi8J+TiiBQcm9ncmVzc1wiLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogYCR7Y29tcGxldGVkQ3ljbGVzfSBjeWNsZXMgY29tcGxldGVkYCxcbiAgICAgICAgICAgICAgICAgICAgaW5saW5lOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIuKPse+4jyBEdXJhdGlvblwiLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogYCR7ZHVyYXRpb25NaW51dGVzfW0gJHtkdXJhdGlvblNlY29uZHN9c2AsXG4gICAgICAgICAgICAgICAgICAgIGlubGluZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gdGhpcy5ub3RpZnlXaXRoRW1iZWQoXG4gICAgICAgICAgICBlbWJlZCxcbiAgICAgICAgICAgIGDinIUgKipSYWxwaCBDeWNsZSAke2N5Y2xlTnVtYmVyfSBDb21wbGV0ZSoqYCxcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZW5kIHBoYXNlIGNvbXBsZXRpb24gbm90aWZpY2F0aW9uXG4gICAgICovXG4gICAgYXN5bmMgbm90aWZ5UGhhc2VDb21wbGV0ZShcbiAgICAgICAgY3ljbGVOdW1iZXI6IG51bWJlcixcbiAgICAgICAgcGhhc2U6IHN0cmluZyxcbiAgICAgICAgc3VtbWFyeTogc3RyaW5nLFxuICAgICk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICBjb25zdCBlbWJlZDogRGlzY29yZEVtYmVkID0ge1xuICAgICAgICAgICAgdGl0bGU6IGDwn5OdIFBoYXNlIENvbXBsZXRlOiAke3BoYXNlfWAsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogc3VtbWFyeS5zbGljZSgwLCAxMDAwKSxcbiAgICAgICAgICAgIGNvbG9yOiAweGZlZTc1YywgLy8gRGlzY29yZCB5ZWxsb3dcbiAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgZmllbGRzOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIvCflIQgQ3ljbGVcIixcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IFN0cmluZyhjeWNsZU51bWJlciksXG4gICAgICAgICAgICAgICAgICAgIGlubGluZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gdGhpcy5ub3RpZnlXaXRoRW1iZWQoZW1iZWQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNlbmQgZXJyb3Igbm90aWZpY2F0aW9uXG4gICAgICovXG4gICAgYXN5bmMgbm90aWZ5RXJyb3IoXG4gICAgICAgIGN5Y2xlTnVtYmVyOiBudW1iZXIsXG4gICAgICAgIHBoYXNlOiBzdHJpbmcsXG4gICAgICAgIGVycm9yOiBzdHJpbmcsXG4gICAgKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIGNvbnN0IGVtYmVkOiBEaXNjb3JkRW1iZWQgPSB7XG4gICAgICAgICAgICB0aXRsZTogYOKdjCBFcnJvciBpbiBDeWNsZSAke2N5Y2xlTnVtYmVyfWAsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogYCoqUGhhc2U6KiogJHtwaGFzZX1cXG5cXG4qKkVycm9yOioqXFxuXFxgXFxgXFxgXFxuJHtlcnJvci5zbGljZSgwLCAxNTAwKX1cXG5cXGBcXGBcXGBgLFxuICAgICAgICAgICAgY29sb3I6IDB4ZWQ0MjQ1LCAvLyBEaXNjb3JkIHJlZFxuICAgICAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHRoaXMubm90aWZ5V2l0aEVtYmVkKGVtYmVkLCBcIvCfmqggKipSYWxwaCBFcnJvcioqXCIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNlbmQgdGltZW91dCBub3RpZmljYXRpb25cbiAgICAgKi9cbiAgICBhc3luYyBub3RpZnlUaW1lb3V0KFxuICAgICAgICBjeWNsZU51bWJlcjogbnVtYmVyLFxuICAgICAgICBwaGFzZTogc3RyaW5nLFxuICAgICAgICB0aW1lb3V0TXM6IG51bWJlcixcbiAgICApOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgY29uc3QgdGltZW91dE1pbnV0ZXMgPSBNYXRoLmZsb29yKHRpbWVvdXRNcyAvIDYwMDAwKTtcblxuICAgICAgICBjb25zdCBlbWJlZDogRGlzY29yZEVtYmVkID0ge1xuICAgICAgICAgICAgdGl0bGU6IGDij7AgVGltZW91dCBpbiBDeWNsZSAke2N5Y2xlTnVtYmVyfWAsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogYCoqUGhhc2U6KiogJHtwaGFzZX1cXG4qKlRpbWVvdXQ6KiogJHt0aW1lb3V0TWludXRlc30gbWludXRlc2AsXG4gICAgICAgICAgICBjb2xvcjogMHhlYjQ1OWUsIC8vIERpc2NvcmQgcGlua1xuICAgICAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHRoaXMubm90aWZ5V2l0aEVtYmVkKGVtYmVkLCBcIuKPsCAqKlJhbHBoIFRpbWVvdXQqKlwiKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZW5kIHJ1biBjb21wbGV0aW9uIG5vdGlmaWNhdGlvblxuICAgICAqL1xuICAgIGFzeW5jIG5vdGlmeVJ1bkNvbXBsZXRlKFxuICAgICAgICB0b3RhbEN5Y2xlczogbnVtYmVyLFxuICAgICAgICBkdXJhdGlvbk1zOiBudW1iZXIsXG4gICAgICAgIGZpbmFsU3VtbWFyeTogc3RyaW5nLFxuICAgICk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICBjb25zdCBkdXJhdGlvbkhvdXJzID0gTWF0aC5mbG9vcihkdXJhdGlvbk1zIC8gMzYwMDAwMCk7XG4gICAgICAgIGNvbnN0IGR1cmF0aW9uTWludXRlcyA9IE1hdGguZmxvb3IoKGR1cmF0aW9uTXMgJSAzNjAwMDAwKSAvIDYwMDAwKTtcblxuICAgICAgICBjb25zdCBlbWJlZDogRGlzY29yZEVtYmVkID0ge1xuICAgICAgICAgICAgdGl0bGU6IFwi8J+PgSBSdW4gQ29tcGxldGVcIixcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBmaW5hbFN1bW1hcnkuc2xpY2UoMCwgMjAwMCksXG4gICAgICAgICAgICBjb2xvcjogMHg1N2YyODcsIC8vIERpc2NvcmQgZ3JlZW5cbiAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgZmllbGRzOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIvCflIQgVG90YWwgQ3ljbGVzXCIsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBTdHJpbmcodG90YWxDeWNsZXMpLFxuICAgICAgICAgICAgICAgICAgICBpbmxpbmU6IHRydWUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IFwi4o+x77iPIFRvdGFsIER1cmF0aW9uXCIsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOlxuICAgICAgICAgICAgICAgICAgICAgICAgZHVyYXRpb25Ib3VycyA+IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IGAke2R1cmF0aW9uSG91cnN9aCAke2R1cmF0aW9uTWludXRlc31tYFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogYCR7ZHVyYXRpb25NaW51dGVzfW1gLFxuICAgICAgICAgICAgICAgICAgICBpbmxpbmU6IHRydWUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHRoaXMubm90aWZ5V2l0aEVtYmVkKGVtYmVkLCBcIvCfj4EgKipSYWxwaCBSdW4gQ29tcGxldGUqKlwiKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZW5kIHN0dWNrL2Fib3J0IG5vdGlmaWNhdGlvblxuICAgICAqL1xuICAgIGFzeW5jIG5vdGlmeVN0dWNrT3JBYm9ydGVkKFxuICAgICAgICBjeWNsZU51bWJlcjogbnVtYmVyLFxuICAgICAgICByZWFzb246IHN0cmluZyxcbiAgICApOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgY29uc3QgZW1iZWQ6IERpc2NvcmRFbWJlZCA9IHtcbiAgICAgICAgICAgIHRpdGxlOiBg8J+bkSBSdW4gJHtyZWFzb259YCxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBgQ3ljbGUgJHtjeWNsZU51bWJlcn0gcmVhY2hlZCBzdHVjayB0aHJlc2hvbGQgb3Igd2FzIGFib3J0ZWRgLFxuICAgICAgICAgICAgY29sb3I6IDB4NTg2NWYyLCAvLyBEaXNjb3JkIGJsdXJwbGVcbiAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiB0aGlzLm5vdGlmeVdpdGhFbWJlZChlbWJlZCwgYPCfm5EgKipSYWxwaCAke3JlYXNvbn0qKmApO1xuICAgIH1cbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBEaXNjb3JkIHdlYmhvb2sgY2xpZW50IGZyb20gZW52aXJvbm1lbnQgdmFyaWFibGVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVEaXNjb3JkV2ViaG9va0Zyb21FbnYoKTogRGlzY29yZFdlYmhvb2tDbGllbnQgfCBudWxsIHtcbiAgICBjb25zdCB3ZWJob29rVXJsID0gcHJvY2Vzcy5lbnYuRElTQ09SRF9XRUJIT09LX1VSTD8udHJpbSgpO1xuXG4gICAgaWYgKCF3ZWJob29rVXJsKSB7XG4gICAgICAgIGxvZy5kZWJ1ZyhcbiAgICAgICAgICAgIFwiTm8gRElTQ09SRF9XRUJIT09LX1VSTCBlbnYgdmFyIHNldCwgRGlzY29yZCBub3RpZmljYXRpb25zIGRpc2FibGVkXCIsXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgRGlzY29yZFdlYmhvb2tDbGllbnQoe1xuICAgICAgICB3ZWJob29rVXJsLFxuICAgICAgICB1c2VybmFtZTogcHJvY2Vzcy5lbnYuRElTQ09SRF9CT1RfVVNFUk5BTUUgPz8gXCJSYWxwaFwiLFxuICAgICAgICBhdmF0YXJVcmw6IHByb2Nlc3MuZW52LkRJU0NPUkRfQk9UX0FWQVRBUl9VUkwsXG4gICAgfSk7XG59XG4iLAogICAgIi8qKlxuICogRmxvdyBTdG9yZSAtIFN0YXRlIHBlcnNpc3RlbmNlIGxheWVyIGZvciBSYWxwaCBMb29wIFJ1bm5lclxuICpcbiAqIFBlcnNpc3RzIHJ1biBzdGF0ZSB0byBgLmFpLWVuZy9ydW5zLzxydW5JZD4vLmZsb3cvYDpcbiAqIC0gc3RhdGUuanNvbjogTWFpbiBydW4gc3RhdGVcbiAqIC0gY2hlY2twb2ludC5qc29uOiBMYXN0IHN1Y2Nlc3NmdWwgY2hlY2twb2ludCBmb3IgZmFzdCByZXN1bWVcbiAqIC0gaXRlcmF0aW9ucy88bj4uanNvbjogUGVyLWN5Y2xlIGRldGFpbGVkIG91dHB1dHNcbiAqIC0gY29udGV4dHMvPG4+Lm1kOiBSZS1hbmNob3JpbmcgY29udGV4dCBzbmFwc2hvdHNcbiAqIC0gZ2F0ZXMvPG4+Lmpzb246IFF1YWxpdHkgZ2F0ZSByZXN1bHRzXG4gKi9cblxuaW1wb3J0IHsgZXhpc3RzU3luYywgbWtkaXJTeW5jLCByZWFkRmlsZVN5bmMsIHdyaXRlRmlsZVN5bmMgfSBmcm9tIFwibm9kZTpmc1wiO1xuaW1wb3J0IHsgam9pbiB9IGZyb20gXCJub2RlOnBhdGhcIjtcbmltcG9ydCB7IExvZyB9IGZyb20gXCIuLi91dGlsL2xvZ1wiO1xuaW1wb3J0IHR5cGUgeyBDaGVja3BvaW50LCBDeWNsZVN0YXRlLCBGbG93U3RhdGUgfSBmcm9tIFwiLi9mbG93LXR5cGVzXCI7XG5pbXBvcnQgeyBGTE9XX1NDSEVNQV9WRVJTSU9OLCBSdW5TdGF0dXMsIHR5cGUgU3RvcFJlYXNvbiB9IGZyb20gXCIuL2Zsb3ctdHlwZXNcIjtcblxuY29uc3QgbG9nID0gTG9nLmNyZWF0ZSh7IHNlcnZpY2U6IFwiZmxvdy1zdG9yZVwiIH0pO1xuXG4vKiogRmxvdyBzdG9yZSBvcHRpb25zICovXG5leHBvcnQgaW50ZXJmYWNlIEZsb3dTdG9yZU9wdGlvbnMge1xuICAgIGZsb3dEaXI6IHN0cmluZztcbiAgICBydW5JZDogc3RyaW5nO1xufVxuXG4vKipcbiAqIEZsb3cgU3RvcmUgLSBtYW5hZ2VzIHBlcnNpc3RlbmNlIG9mIGxvb3AgcnVuIHN0YXRlXG4gKi9cbmV4cG9ydCBjbGFzcyBGbG93U3RvcmUge1xuICAgIHByaXZhdGUgZmxvd0Rpcjogc3RyaW5nO1xuICAgIHByaXZhdGUgcnVuSWQ6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IEZsb3dTdG9yZU9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5mbG93RGlyID0gb3B0aW9ucy5mbG93RGlyO1xuICAgICAgICB0aGlzLnJ1bklkID0gb3B0aW9ucy5ydW5JZDtcbiAgICB9XG5cbiAgICAvKiogR2V0IHRoZSBiYXNlIGZsb3cgZGlyZWN0b3J5IHBhdGggKi9cbiAgICBnZXQgYmFzZVBhdGgoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGpvaW4odGhpcy5mbG93RGlyLCB0aGlzLnJ1bklkLCBcIi5mbG93XCIpO1xuICAgIH1cblxuICAgIC8qKiBHZXQgcGF0aCB0byBhIHNwZWNpZmljIGZpbGUgaW4gLmZsb3cgKi9cbiAgICBwcml2YXRlIHBhdGgocmVsUGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGpvaW4odGhpcy5iYXNlUGF0aCwgcmVsUGF0aCk7XG4gICAgfVxuXG4gICAgLyoqIEluaXRpYWxpemUgZmxvdyBkaXJlY3Rvcnkgc3RydWN0dXJlICovXG4gICAgaW5pdGlhbGl6ZSgpOiB2b2lkIHtcbiAgICAgICAgLy8gQ3JlYXRlIC5mbG93IGRpcmVjdG9yeSBhbmQgc3ViZGlyZWN0b3JpZXNcbiAgICAgICAgY29uc3QgZGlycyA9IFtcIml0ZXJhdGlvbnNcIiwgXCJjb250ZXh0c1wiLCBcImdhdGVzXCJdO1xuXG4gICAgICAgIGZvciAoY29uc3QgZGlyIG9mIGRpcnMpIHtcbiAgICAgICAgICAgIGNvbnN0IGRpclBhdGggPSB0aGlzLnBhdGgoZGlyKTtcbiAgICAgICAgICAgIGlmICghZXhpc3RzU3luYyhkaXJQYXRoKSkge1xuICAgICAgICAgICAgICAgIG1rZGlyU3luYyhkaXJQYXRoLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICBsb2cuZGVidWcoXCJDcmVhdGVkIGRpcmVjdG9yeVwiLCB7IHBhdGg6IGRpclBhdGggfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBsb2cuaW5mbyhcIkZsb3cgc3RvcmUgaW5pdGlhbGl6ZWRcIiwge1xuICAgICAgICAgICAgcnVuSWQ6IHRoaXMucnVuSWQsXG4gICAgICAgICAgICBiYXNlUGF0aDogdGhpcy5iYXNlUGF0aCxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqIENoZWNrIGlmIGZsb3cgc3RhdGUgZXhpc3RzIChmb3IgcmVzdW1lKSAqL1xuICAgIGV4aXN0cygpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIGV4aXN0c1N5bmModGhpcy5wYXRoKFwic3RhdGUuanNvblwiKSk7XG4gICAgfVxuXG4gICAgLyoqIExvYWQgZXhpc3RpbmcgcnVuIHN0YXRlIGZvciByZXN1bWUgKi9cbiAgICBsb2FkKCk6IEZsb3dTdGF0ZSB8IG51bGwge1xuICAgICAgICBjb25zdCBzdGF0ZVBhdGggPSB0aGlzLnBhdGgoXCJzdGF0ZS5qc29uXCIpO1xuICAgICAgICBpZiAoIWV4aXN0c1N5bmMoc3RhdGVQYXRoKSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgY29udGVudCA9IHJlYWRGaWxlU3luYyhzdGF0ZVBhdGgsIFwidXRmLThcIik7XG4gICAgICAgICAgICBjb25zdCBzdGF0ZSA9IEpTT04ucGFyc2UoY29udGVudCkgYXMgRmxvd1N0YXRlO1xuXG4gICAgICAgICAgICAvLyBWYWxpZGF0ZSBzY2hlbWEgdmVyc2lvblxuICAgICAgICAgICAgaWYgKHN0YXRlLnNjaGVtYVZlcnNpb24gIT09IEZMT1dfU0NIRU1BX1ZFUlNJT04pIHtcbiAgICAgICAgICAgICAgICBsb2cud2FybihcIkZsb3cgc2NoZW1hIHZlcnNpb24gbWlzbWF0Y2hcIiwge1xuICAgICAgICAgICAgICAgICAgICBleHBlY3RlZDogRkxPV19TQ0hFTUFfVkVSU0lPTixcbiAgICAgICAgICAgICAgICAgICAgZm91bmQ6IHN0YXRlLnNjaGVtYVZlcnNpb24sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxvZy5pbmZvKFwiTG9hZGVkIGZsb3cgc3RhdGVcIiwge1xuICAgICAgICAgICAgICAgIHJ1bklkOiBzdGF0ZS5ydW5JZCxcbiAgICAgICAgICAgICAgICBzdGF0dXM6IHN0YXRlLnN0YXR1cyxcbiAgICAgICAgICAgICAgICBjdXJyZW50Q3ljbGU6IHN0YXRlLmN1cnJlbnRDeWNsZSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1zZyA9XG4gICAgICAgICAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICAgICAgbG9nLmVycm9yKFwiRmFpbGVkIHRvIGxvYWQgZmxvdyBzdGF0ZVwiLCB7IGVycm9yOiBlcnJvck1zZyB9KTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIENyZWF0ZSBpbml0aWFsIHJ1biBzdGF0ZSAqL1xuICAgIGNyZWF0ZUluaXRpYWxTdGF0ZShvcHRpb25zOiB7XG4gICAgICAgIHByb21wdDogc3RyaW5nO1xuICAgICAgICBjb21wbGV0aW9uUHJvbWlzZTogc3RyaW5nO1xuICAgICAgICBtYXhDeWNsZXM6IG51bWJlcjtcbiAgICAgICAgc3R1Y2tUaHJlc2hvbGQ6IG51bWJlcjtcbiAgICAgICAgZ2F0ZXM6IHN0cmluZ1tdO1xuICAgIH0pOiBGbG93U3RhdGUge1xuICAgICAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG5cbiAgICAgICAgY29uc3Qgc3RhdGU6IEZsb3dTdGF0ZSA9IHtcbiAgICAgICAgICAgIHNjaGVtYVZlcnNpb246IEZMT1dfU0NIRU1BX1ZFUlNJT04sXG4gICAgICAgICAgICBydW5JZDogdGhpcy5ydW5JZCxcbiAgICAgICAgICAgIHByb21wdDogb3B0aW9ucy5wcm9tcHQsXG4gICAgICAgICAgICBzdGF0dXM6IFJ1blN0YXR1cy5QRU5ESU5HLFxuICAgICAgICAgICAgY29tcGxldGlvblByb21pc2U6IG9wdGlvbnMuY29tcGxldGlvblByb21pc2UsXG4gICAgICAgICAgICBtYXhDeWNsZXM6IG9wdGlvbnMubWF4Q3ljbGVzLFxuICAgICAgICAgICAgc3R1Y2tUaHJlc2hvbGQ6IG9wdGlvbnMuc3R1Y2tUaHJlc2hvbGQsXG4gICAgICAgICAgICBnYXRlczogb3B0aW9ucy5nYXRlcyxcbiAgICAgICAgICAgIGN1cnJlbnRDeWNsZTogMCxcbiAgICAgICAgICAgIGNvbXBsZXRlZEN5Y2xlczogMCxcbiAgICAgICAgICAgIGZhaWxlZEN5Y2xlczogMCxcbiAgICAgICAgICAgIHN0dWNrQ291bnQ6IDAsXG4gICAgICAgICAgICBjcmVhdGVkQXQ6IG5vdyxcbiAgICAgICAgICAgIHVwZGF0ZWRBdDogbm93LFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuc2F2ZVN0YXRlKHN0YXRlKTtcbiAgICAgICAgcmV0dXJuIHN0YXRlO1xuICAgIH1cblxuICAgIC8qKiBTYXZlIHJ1biBzdGF0ZSB0byBzdGF0ZS5qc29uICovXG4gICAgc2F2ZVN0YXRlKHN0YXRlOiBGbG93U3RhdGUpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgc3RhdGVQYXRoID0gdGhpcy5wYXRoKFwic3RhdGUuanNvblwiKTtcbiAgICAgICAgc3RhdGUudXBkYXRlZEF0ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgICB3cml0ZUZpbGVTeW5jKHN0YXRlUGF0aCwgSlNPTi5zdHJpbmdpZnkoc3RhdGUsIG51bGwsIDIpKTtcbiAgICAgICAgbG9nLmRlYnVnKFwiU2F2ZWQgZmxvdyBzdGF0ZVwiLCB7IHJ1bklkOiBzdGF0ZS5ydW5JZCB9KTtcbiAgICB9XG5cbiAgICAvKiogU2F2ZSBhIGNoZWNrcG9pbnQgZm9yIGZhc3QgcmVzdW1lICovXG4gICAgc2F2ZUNoZWNrcG9pbnQoXG4gICAgICAgIHN0YXRlOiBGbG93U3RhdGUsXG4gICAgICAgIGxhc3RQaGFzZU91dHB1dHM6IEN5Y2xlU3RhdGVbXCJwaGFzZXNcIl0sXG4gICAgKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGNoZWNrcG9pbnRQYXRoID0gdGhpcy5wYXRoKFwiY2hlY2twb2ludC5qc29uXCIpO1xuICAgICAgICBjb25zdCBjaGVja3BvaW50OiBDaGVja3BvaW50ID0ge1xuICAgICAgICAgICAgc2NoZW1hVmVyc2lvbjogRkxPV19TQ0hFTUFfVkVSU0lPTixcbiAgICAgICAgICAgIHJ1bklkOiBzdGF0ZS5ydW5JZCxcbiAgICAgICAgICAgIGN5Y2xlTnVtYmVyOiBzdGF0ZS5jdXJyZW50Q3ljbGUsXG4gICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICAgIHN0YXRlLFxuICAgICAgICAgICAgbGFzdFBoYXNlT3V0cHV0cyxcbiAgICAgICAgfTtcbiAgICAgICAgd3JpdGVGaWxlU3luYyhjaGVja3BvaW50UGF0aCwgSlNPTi5zdHJpbmdpZnkoY2hlY2twb2ludCwgbnVsbCwgMikpO1xuICAgICAgICBsb2cuZGVidWcoXCJTYXZlZCBjaGVja3BvaW50XCIsIHtcbiAgICAgICAgICAgIHJ1bklkOiBzdGF0ZS5ydW5JZCxcbiAgICAgICAgICAgIGN5Y2xlOiBzdGF0ZS5jdXJyZW50Q3ljbGUsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKiBMb2FkIGNoZWNrcG9pbnQgZm9yIHJlc3VtZSAqL1xuICAgIGxvYWRDaGVja3BvaW50KCk6IENoZWNrcG9pbnQgfCBudWxsIHtcbiAgICAgICAgY29uc3QgY2hlY2twb2ludFBhdGggPSB0aGlzLnBhdGgoXCJjaGVja3BvaW50Lmpzb25cIik7XG4gICAgICAgIGlmICghZXhpc3RzU3luYyhjaGVja3BvaW50UGF0aCkpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSByZWFkRmlsZVN5bmMoY2hlY2twb2ludFBhdGgsIFwidXRmLThcIik7XG4gICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShjb250ZW50KSBhcyBDaGVja3BvaW50O1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNc2cgPVxuICAgICAgICAgICAgICAgIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgICAgIGxvZy5lcnJvcihcIkZhaWxlZCB0byBsb2FkIGNoZWNrcG9pbnRcIiwgeyBlcnJvcjogZXJyb3JNc2cgfSk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBTYXZlIGl0ZXJhdGlvbiBjeWNsZSBvdXRwdXQgKi9cbiAgICBzYXZlSXRlcmF0aW9uKGN5Y2xlOiBDeWNsZVN0YXRlKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGN5Y2xlUGF0aCA9IHRoaXMucGF0aChgaXRlcmF0aW9ucy8ke2N5Y2xlLmN5Y2xlTnVtYmVyfS5qc29uYCk7XG4gICAgICAgIHdyaXRlRmlsZVN5bmMoY3ljbGVQYXRoLCBKU09OLnN0cmluZ2lmeShjeWNsZSwgbnVsbCwgMikpO1xuXG4gICAgICAgIC8vIFNhdmUgcmUtYW5jaG9yaW5nIGNvbnRleHRcbiAgICAgICAgY29uc3QgY29udGV4dFBhdGggPSB0aGlzLnBhdGgoYGNvbnRleHRzLyR7Y3ljbGUuY3ljbGVOdW1iZXJ9Lm1kYCk7XG4gICAgICAgIGNvbnN0IGNvbnRleHRDb250ZW50ID0gdGhpcy5nZW5lcmF0ZUNvbnRleHRDb250ZW50KGN5Y2xlKTtcbiAgICAgICAgd3JpdGVGaWxlU3luYyhjb250ZXh0UGF0aCwgY29udGV4dENvbnRlbnQpO1xuXG4gICAgICAgIGxvZy5kZWJ1ZyhcIlNhdmVkIGl0ZXJhdGlvblwiLCB7IGN5Y2xlOiBjeWNsZS5jeWNsZU51bWJlciB9KTtcbiAgICB9XG5cbiAgICAvKiogU2F2ZSBnYXRlIHJlc3VsdHMgZm9yIGl0ZXJhdGlvbiAqL1xuICAgIHNhdmVHYXRlUmVzdWx0cyhcbiAgICAgICAgY3ljbGVOdW1iZXI6IG51bWJlcixcbiAgICAgICAgcmVzdWx0czogQ3ljbGVTdGF0ZVtcImdhdGVSZXN1bHRzXCJdLFxuICAgICk6IHZvaWQge1xuICAgICAgICBjb25zdCBnYXRlUGF0aCA9IHRoaXMucGF0aChgZ2F0ZXMvJHtjeWNsZU51bWJlcn0uanNvbmApO1xuICAgICAgICB3cml0ZUZpbGVTeW5jKGdhdGVQYXRoLCBKU09OLnN0cmluZ2lmeShyZXN1bHRzLCBudWxsLCAyKSk7XG4gICAgfVxuXG4gICAgLyoqIEdlbmVyYXRlIHJlLWFuY2hvcmluZyBjb250ZXh0IGNvbnRlbnQgZm9yIGEgY3ljbGUgKi9cbiAgICBwcml2YXRlIGdlbmVyYXRlQ29udGV4dENvbnRlbnQoY3ljbGU6IEN5Y2xlU3RhdGUpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBsaW5lczogc3RyaW5nW10gPSBbXG4gICAgICAgICAgICBgIyBDeWNsZSAke2N5Y2xlLmN5Y2xlTnVtYmVyfSBDb250ZXh0YCxcbiAgICAgICAgICAgIFwiXCIsXG4gICAgICAgICAgICBgKipUaW1lc3RhbXA6KiogJHtjeWNsZS5zdGFydFRpbWV9YCxcbiAgICAgICAgICAgIGAqKlN0YXR1czoqKiAke2N5Y2xlLnN0YXR1c31gLFxuICAgICAgICAgICAgYCoqQ29tcGxldGlvbiBQcm9taXNlIE9ic2VydmVkOioqICR7Y3ljbGUuY29tcGxldGlvblByb21pc2VPYnNlcnZlZH1gLFxuICAgICAgICAgICAgXCJcIixcbiAgICAgICAgICAgIFwiIyMgUGhhc2UgU3VtbWFyaWVzXCIsXG4gICAgICAgICAgICBcIlwiLFxuICAgICAgICBdO1xuXG4gICAgICAgIGZvciAoY29uc3QgW3BoYXNlLCBvdXRwdXRdIG9mIE9iamVjdC5lbnRyaWVzKGN5Y2xlLnBoYXNlcykpIHtcbiAgICAgICAgICAgIGlmIChvdXRwdXQpIHtcbiAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKGAjIyMgJHtwaGFzZS50b1VwcGVyQ2FzZSgpfWApO1xuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goXCJcIik7XG4gICAgICAgICAgICAgICAgbGluZXMucHVzaChvdXRwdXQuc3VtbWFyeSB8fCBvdXRwdXQucmVzcG9uc2Uuc2xpY2UoMCwgNTAwKSk7XG4gICAgICAgICAgICAgICAgbGluZXMucHVzaChcIlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjeWNsZS5nYXRlUmVzdWx0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBsaW5lcy5wdXNoKFwiIyMgR2F0ZSBSZXN1bHRzXCIpO1xuICAgICAgICAgICAgbGluZXMucHVzaChcIlwiKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgZ2F0ZSBvZiBjeWNsZS5nYXRlUmVzdWx0cykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXR1cyA9IGdhdGUucGFzc2VkID8gXCLinIUgUEFTU1wiIDogXCLinYwgRkFJTFwiO1xuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goYC0gKioke2dhdGUuZ2F0ZX06KiogJHtzdGF0dXN9IC0gJHtnYXRlLm1lc3NhZ2V9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsaW5lcy5wdXNoKFwiXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGN5Y2xlLmVycm9yKSB7XG4gICAgICAgICAgICBsaW5lcy5wdXNoKFwiIyMgRXJyb3JzXCIpO1xuICAgICAgICAgICAgbGluZXMucHVzaChcIlwiKTtcbiAgICAgICAgICAgIGxpbmVzLnB1c2goY3ljbGUuZXJyb3IpO1xuICAgICAgICAgICAgbGluZXMucHVzaChcIlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBsaW5lcy5qb2luKFwiXFxuXCIpO1xuICAgIH1cblxuICAgIC8qKiBHZXQgaXRlcmF0aW9uIGJ5IG51bWJlciAqL1xuICAgIGdldEl0ZXJhdGlvbihjeWNsZU51bWJlcjogbnVtYmVyKTogQ3ljbGVTdGF0ZSB8IG51bGwge1xuICAgICAgICBjb25zdCBjeWNsZVBhdGggPSB0aGlzLnBhdGgoYGl0ZXJhdGlvbnMvJHtjeWNsZU51bWJlcn0uanNvbmApO1xuICAgICAgICBpZiAoIWV4aXN0c1N5bmMoY3ljbGVQYXRoKSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgY29udGVudCA9IHJlYWRGaWxlU3luYyhjeWNsZVBhdGgsIFwidXRmLThcIik7XG4gICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShjb250ZW50KSBhcyBDeWNsZVN0YXRlO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIEdldCBhbGwgaXRlcmF0aW9ucyAqL1xuICAgIGdldEFsbEl0ZXJhdGlvbnMoKTogQ3ljbGVTdGF0ZVtdIHtcbiAgICAgICAgY29uc3QgaXRlcmF0aW9uczogQ3ljbGVTdGF0ZVtdID0gW107XG4gICAgICAgIGxldCBuID0gMTtcblxuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgY29uc3QgY3ljbGUgPSB0aGlzLmdldEl0ZXJhdGlvbihuKTtcbiAgICAgICAgICAgIGlmICghY3ljbGUpIGJyZWFrO1xuICAgICAgICAgICAgaXRlcmF0aW9ucy5wdXNoKGN5Y2xlKTtcbiAgICAgICAgICAgIG4rKztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBpdGVyYXRpb25zO1xuICAgIH1cblxuICAgIC8qKiBVcGRhdGUgc3RhdGUgc3RhdHVzICovXG4gICAgdXBkYXRlU3RhdHVzKFxuICAgICAgICBzdGF0dXM6IFJ1blN0YXR1cyxcbiAgICAgICAgc3RvcFJlYXNvbj86IFN0b3BSZWFzb24sXG4gICAgICAgIGVycm9yPzogc3RyaW5nLFxuICAgICk6IHZvaWQge1xuICAgICAgICBjb25zdCBzdGF0ZSA9IHRoaXMubG9hZCgpO1xuICAgICAgICBpZiAoIXN0YXRlKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBmbG93IHN0YXRlIHRvIHVwZGF0ZVwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0YXRlLnN0YXR1cyA9IHN0YXR1cztcbiAgICAgICAgaWYgKHN0b3BSZWFzb24pIHN0YXRlLnN0b3BSZWFzb24gPSBzdG9wUmVhc29uO1xuICAgICAgICBpZiAoZXJyb3IpIHN0YXRlLmVycm9yID0gZXJyb3I7XG4gICAgICAgIGlmIChzdGF0dXMgPT09IFJ1blN0YXR1cy5DT01QTEVURUQgfHwgc3RhdHVzID09PSBSdW5TdGF0dXMuRkFJTEVEKSB7XG4gICAgICAgICAgICBzdGF0ZS5jb21wbGV0ZWRBdCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2F2ZVN0YXRlKHN0YXRlKTtcbiAgICB9XG5cbiAgICAvKiogSW5jcmVtZW50IGN5Y2xlIGNvdW50ZXIgKi9cbiAgICBpbmNyZW1lbnRDeWNsZSgpOiBudW1iZXIge1xuICAgICAgICBjb25zdCBzdGF0ZSA9IHRoaXMubG9hZCgpO1xuICAgICAgICBpZiAoIXN0YXRlKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBmbG93IHN0YXRlIHRvIHVwZGF0ZVwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0YXRlLmN1cnJlbnRDeWNsZSsrO1xuICAgICAgICB0aGlzLnNhdmVTdGF0ZShzdGF0ZSk7XG4gICAgICAgIHJldHVybiBzdGF0ZS5jdXJyZW50Q3ljbGU7XG4gICAgfVxuXG4gICAgLyoqIFJlY29yZCBhIGZhaWxlZCBjeWNsZSAqL1xuICAgIHJlY29yZEZhaWxlZEN5Y2xlKGN5Y2xlOiBDeWNsZVN0YXRlKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHN0YXRlID0gdGhpcy5sb2FkKCk7XG4gICAgICAgIGlmICghc3RhdGUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIGZsb3cgc3RhdGUgdG8gdXBkYXRlXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RhdGUuZmFpbGVkQ3ljbGVzKys7XG4gICAgICAgIHN0YXRlLnN0dWNrQ291bnQrKztcbiAgICAgICAgdGhpcy5zYXZlSXRlcmF0aW9uKGN5Y2xlKTtcbiAgICAgICAgdGhpcy5zYXZlU3RhdGUoc3RhdGUpO1xuXG4gICAgICAgIGxvZy5pbmZvKFwiQ3ljbGUgZmFpbGVkXCIsIHtcbiAgICAgICAgICAgIHJ1bklkOiB0aGlzLnJ1bklkLFxuICAgICAgICAgICAgY3ljbGU6IGN5Y2xlLmN5Y2xlTnVtYmVyLFxuICAgICAgICAgICAgZmFpbGVkQ3ljbGVzOiBzdGF0ZS5mYWlsZWRDeWNsZXMsXG4gICAgICAgICAgICBzdHVja0NvdW50OiBzdGF0ZS5zdHVja0NvdW50LFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKiogUmVjb3JkIGEgc3VjY2Vzc2Z1bCBjeWNsZSAqL1xuICAgIHJlY29yZFN1Y2Nlc3NmdWxDeWNsZShjeWNsZTogQ3ljbGVTdGF0ZSwgc3VtbWFyeTogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHN0YXRlID0gdGhpcy5sb2FkKCk7XG4gICAgICAgIGlmICghc3RhdGUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIGZsb3cgc3RhdGUgdG8gdXBkYXRlXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RhdGUuY29tcGxldGVkQ3ljbGVzKys7XG4gICAgICAgIHN0YXRlLnN0dWNrQ291bnQgPSAwOyAvLyBSZXNldCBzdHVjayBjb3VudGVyIG9uIHN1Y2Nlc3NcbiAgICAgICAgc3RhdGUubGFzdENoZWNrcG9pbnQgPSB7XG4gICAgICAgICAgICBjeWNsZU51bWJlcjogY3ljbGUuY3ljbGVOdW1iZXIsXG4gICAgICAgICAgICBzdW1tYXJ5LFxuICAgICAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5zYXZlSXRlcmF0aW9uKGN5Y2xlKTtcbiAgICAgICAgdGhpcy5zYXZlU3RhdGUoc3RhdGUpO1xuXG4gICAgICAgIGxvZy5pbmZvKFwiQ3ljbGUgY29tcGxldGVkXCIsIHtcbiAgICAgICAgICAgIHJ1bklkOiB0aGlzLnJ1bklkLFxuICAgICAgICAgICAgY3ljbGU6IGN5Y2xlLmN5Y2xlTnVtYmVyLFxuICAgICAgICAgICAgY29tcGxldGVkQ3ljbGVzOiBzdGF0ZS5jb21wbGV0ZWRDeWNsZXMsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKiBDbGVhbiB1cCBmbG93IGRpcmVjdG9yeSAqL1xuICAgIGNsZWFudXAoKTogdm9pZCB7XG4gICAgICAgIC8vIEltcGxlbWVudGF0aW9uIHdvdWxkIHJlbW92ZSB0aGUgLmZsb3cgZGlyZWN0b3J5XG4gICAgICAgIC8vIEZvciBub3csIGp1c3QgbG9nXG4gICAgICAgIGxvZy5pbmZvKFwiRmxvdyBzdG9yZSBjbGVhbnVwIHJlcXVlc3RlZFwiLCB7IHJ1bklkOiB0aGlzLnJ1bklkIH0pO1xuICAgIH1cbn1cbiIsCiAgICAiLyoqXG4gKiBGbG93IFN0YXRlIFR5cGVzIGZvciBSYWxwaCBMb29wIFJ1bm5lclxuICpcbiAqIFN0YXRlIGlzIHBlcnNpc3RlZCB0byBgLmFpLWVuZy9ydW5zLzxydW5JZD4vLmZsb3cvYCBmb3I6XG4gKiAtIFJlc3VtZSBzdXBwb3J0IGFjcm9zcyBydW5zXG4gKiAtIEZyZXNoIGNvbnRleHQgcGVyIGl0ZXJhdGlvbiAocmUtYW5jaG9yaW5nIGZyb20gZGlzaylcbiAqIC0gQXVkaXQgdHJhaWwgb2YgYWxsIGN5Y2xlIG91dHB1dHNcbiAqL1xuXG4vKiogU2NoZW1hIHZlcnNpb24gZm9yIGZvcndhcmQgY29tcGF0aWJpbGl0eSAqL1xuZXhwb3J0IGNvbnN0IEZMT1dfU0NIRU1BX1ZFUlNJT04gPSBcIjEuMC4wXCI7XG5cbi8qKiBSdW4gc3RhdHVzIGVudW0gKi9cbmV4cG9ydCBlbnVtIFJ1blN0YXR1cyB7XG4gICAgUEVORElORyA9IFwicGVuZGluZ1wiLFxuICAgIFJVTk5JTkcgPSBcInJ1bm5pbmdcIixcbiAgICBDT01QTEVURUQgPSBcImNvbXBsZXRlZFwiLFxuICAgIEZBSUxFRCA9IFwiZmFpbGVkXCIsXG4gICAgQUJPUlRFRCA9IFwiYWJvcnRlZFwiLFxuICAgIFNUVUNLID0gXCJzdHVja1wiLFxufVxuXG4vKiogU3RvcCByZWFzb24gZm9yIGNvbXBsZXRlZCBydW5zICovXG5leHBvcnQgZW51bSBTdG9wUmVhc29uIHtcbiAgICBDT01QTEVUSU9OX1BST01JU0UgPSBcImNvbXBsZXRpb25fcHJvbWlzZVwiLFxuICAgIE1BWF9DWUNMRVMgPSBcIm1heF9jeWNsZXNcIixcbiAgICBHQVRFX0ZBSUxVUkUgPSBcImdhdGVfZmFpbHVyZVwiLFxuICAgIFNUVUNLID0gXCJzdHVja1wiLFxuICAgIFVTRVJfQUJPUlQgPSBcInVzZXJfYWJvcnRcIixcbiAgICBFUlJPUiA9IFwiZXJyb3JcIixcbn1cblxuLyoqIFBoYXNlIG5hbWVzIGluIHRoZSB3b3JrZmxvdyAqL1xuZXhwb3J0IGVudW0gUGhhc2Uge1xuICAgIFJFU0VBUkNIID0gXCJyZXNlYXJjaFwiLFxuICAgIFNQRUNJRlkgPSBcInNwZWNpZnlcIixcbiAgICBQTEFOID0gXCJwbGFuXCIsXG4gICAgV09SSyA9IFwid29ya1wiLFxuICAgIFJFVklFVyA9IFwicmV2aWV3XCIsXG59XG5cbi8qKiBHYXRlIHJlc3VsdCB0eXBlICovXG5leHBvcnQgaW50ZXJmYWNlIEdhdGVSZXN1bHQge1xuICAgIGdhdGU6IHN0cmluZztcbiAgICBwYXNzZWQ6IGJvb2xlYW47XG4gICAgbWVzc2FnZTogc3RyaW5nO1xuICAgIGRldGFpbHM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICB0aW1lc3RhbXA6IHN0cmluZztcbn1cblxuLyoqIFBoYXNlIG91dHB1dCAqL1xuZXhwb3J0IGludGVyZmFjZSBQaGFzZU91dHB1dCB7XG4gICAgcGhhc2U6IFBoYXNlO1xuICAgIHByb21wdDogc3RyaW5nO1xuICAgIHJlc3BvbnNlOiBzdHJpbmc7XG4gICAgc3VtbWFyeTogc3RyaW5nO1xuICAgIHRpbWVzdGFtcDogc3RyaW5nO1xuICAgIC8qKiBUb29sIGludm9jYXRpb25zIGNhcHR1cmVkIGR1cmluZyB0aGlzIHBoYXNlICovXG4gICAgdG9vbHM/OiBUb29sSW52b2NhdGlvbltdO1xufVxuXG4vKiogVG9vbCBpbnZvY2F0aW9uIGNhcHR1cmVkIGZyb20gT3BlbkNvZGUgc3RyZWFtICovXG5leHBvcnQgaW50ZXJmYWNlIFRvb2xJbnZvY2F0aW9uIHtcbiAgICAvKiogVW5pcXVlIHRvb2wgSUQgKi9cbiAgICBpZDogc3RyaW5nO1xuICAgIC8qKiBUb29sIG5hbWUgKGUuZy4sIFwiYmFzaFwiLCBcInJlYWRcIiwgXCJ3cml0ZVwiLCBcImVkaXRcIikgKi9cbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgLyoqIElucHV0IGFyZ3VtZW50cyAobWF5IGJlIHRydW5jYXRlZC9yZWRhY3RlZCBmb3Igc2VjcmV0cykgKi9cbiAgICBpbnB1dD86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgIC8qKiBPdXRwdXQgcmVzdWx0IChtYXkgYmUgdHJ1bmNhdGVkKSAqL1xuICAgIG91dHB1dD86IHN0cmluZztcbiAgICAvKiogV2hldGhlciB0aGUgdG9vbCBjYWxsIHN1Y2NlZWRlZCAqL1xuICAgIHN0YXR1czogXCJva1wiIHwgXCJlcnJvclwiO1xuICAgIC8qKiBFcnJvciBtZXNzYWdlIGlmIHN0YXR1cyBpcyBlcnJvciAqL1xuICAgIGVycm9yPzogc3RyaW5nO1xuICAgIC8qKiBXaGVuIHRoZSB0b29sIGNhbGwgc3RhcnRlZCAoSVNPIHRpbWVzdGFtcCkgKi9cbiAgICBzdGFydGVkQXQ/OiBzdHJpbmc7XG4gICAgLyoqIFdoZW4gdGhlIHRvb2wgY2FsbCBjb21wbGV0ZWQgKElTTyB0aW1lc3RhbXApICovXG4gICAgY29tcGxldGVkQXQ/OiBzdHJpbmc7XG59XG5cbi8qKiBTaW5nbGUgaXRlcmF0aW9uIGN5Y2xlIHN0YXRlICovXG5leHBvcnQgaW50ZXJmYWNlIEN5Y2xlU3RhdGUge1xuICAgIGN5Y2xlTnVtYmVyOiBudW1iZXI7XG4gICAgc3RhdHVzOiBcInBlbmRpbmdcIiB8IFwicnVubmluZ1wiIHwgXCJjb21wbGV0ZWRcIiB8IFwiZmFpbGVkXCI7XG4gICAgc3RhcnRUaW1lOiBzdHJpbmc7XG4gICAgZW5kVGltZT86IHN0cmluZztcbiAgICBkdXJhdGlvbk1zPzogbnVtYmVyO1xuICAgIHBoYXNlczoge1xuICAgICAgICBba2V5IGluIFBoYXNlXT86IFBoYXNlT3V0cHV0O1xuICAgIH07XG4gICAgZ2F0ZVJlc3VsdHM6IEdhdGVSZXN1bHRbXTtcbiAgICBjb21wbGV0aW9uUHJvbWlzZU9ic2VydmVkOiBib29sZWFuO1xuICAgIHN0b3BSZWFzb24/OiBTdG9wUmVhc29uO1xuICAgIGVycm9yPzogc3RyaW5nO1xuICAgIC8vIEZvciBzdHVjayBkZXRlY3Rpb24gLSBoYXNoIG9mIG91dHB1dHMgdG8gZGV0ZWN0IG5vLXByb2dyZXNzXG4gICAgb3V0cHV0SGFzaD86IHN0cmluZztcbn1cblxuLyoqIE1haW4gZmxvdyBzdGF0ZSAqL1xuZXhwb3J0IGludGVyZmFjZSBGbG93U3RhdGUge1xuICAgIC8qKiBTY2hlbWEgdmVyc2lvbiBmb3IgbWlncmF0aW9ucyAqL1xuICAgIHNjaGVtYVZlcnNpb246IHN0cmluZztcblxuICAgIC8qKiBSdW4gaWRlbnRpZmljYXRpb24gKi9cbiAgICBydW5JZDogc3RyaW5nO1xuICAgIHByb21wdDogc3RyaW5nO1xuXG4gICAgLyoqIFJ1biBzdGF0dXMgKi9cbiAgICBzdGF0dXM6IFJ1blN0YXR1cztcbiAgICBzdG9wUmVhc29uPzogU3RvcFJlYXNvbjtcblxuICAgIC8qKiBMb29wIHBhcmFtZXRlcnMgKi9cbiAgICBjb21wbGV0aW9uUHJvbWlzZTogc3RyaW5nO1xuICAgIG1heEN5Y2xlczogbnVtYmVyO1xuICAgIHN0dWNrVGhyZXNob2xkOiBudW1iZXI7XG4gICAgZ2F0ZXM6IHN0cmluZ1tdO1xuXG4gICAgLyoqIEN5Y2xlIHRyYWNraW5nICovXG4gICAgY3VycmVudEN5Y2xlOiBudW1iZXI7XG4gICAgY29tcGxldGVkQ3ljbGVzOiBudW1iZXI7XG4gICAgZmFpbGVkQ3ljbGVzOiBudW1iZXI7XG4gICAgc3R1Y2tDb3VudDogbnVtYmVyO1xuXG4gICAgLyoqIFRpbWVzdGFtcHMgKi9cbiAgICBjcmVhdGVkQXQ6IHN0cmluZztcbiAgICB1cGRhdGVkQXQ6IHN0cmluZztcbiAgICBjb21wbGV0ZWRBdD86IHN0cmluZztcblxuICAgIC8qKiBMYXN0IHN1Y2Nlc3NmdWwgY2hlY2twb2ludCBmb3IgcmUtYW5jaG9yaW5nICovXG4gICAgbGFzdENoZWNrcG9pbnQ/OiB7XG4gICAgICAgIGN5Y2xlTnVtYmVyOiBudW1iZXI7XG4gICAgICAgIHN1bW1hcnk6IHN0cmluZztcbiAgICAgICAgdGltZXN0YW1wOiBzdHJpbmc7XG4gICAgfTtcblxuICAgIC8qKiBFcnJvciBpbmZvIGlmIGZhaWxlZCAqL1xuICAgIGVycm9yPzogc3RyaW5nO1xufVxuXG4vKiogQ2hlY2twb2ludCBmb3IgZmFzdCByZXN1bWUgKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ2hlY2twb2ludCB7XG4gICAgc2NoZW1hVmVyc2lvbjogc3RyaW5nO1xuICAgIHJ1bklkOiBzdHJpbmc7XG4gICAgY3ljbGVOdW1iZXI6IG51bWJlcjtcbiAgICB0aW1lc3RhbXA6IHN0cmluZztcbiAgICBzdGF0ZTogRmxvd1N0YXRlO1xuICAgIGxhc3RQaGFzZU91dHB1dHM6IHtcbiAgICAgICAgW2tleSBpbiBQaGFzZV0/OiBQaGFzZU91dHB1dDtcbiAgICB9O1xufVxuXG4vKiogQ29uZmlndXJhdGlvbiBmb3IgdGhlIGxvb3AgcnVubmVyICovXG5leHBvcnQgaW50ZXJmYWNlIExvb3BDb25maWcge1xuICAgIHJ1bklkOiBzdHJpbmc7XG4gICAgcHJvbXB0OiBzdHJpbmc7XG4gICAgY29tcGxldGlvblByb21pc2U6IHN0cmluZztcbiAgICBtYXhDeWNsZXM6IG51bWJlcjtcbiAgICBzdHVja1RocmVzaG9sZDogbnVtYmVyO1xuICAgIGdhdGVzOiBzdHJpbmdbXTtcbiAgICBjaGVja3BvaW50RnJlcXVlbmN5OiBudW1iZXI7XG4gICAgZmxvd0Rpcjogc3RyaW5nO1xuICAgIGRyeVJ1bjogYm9vbGVhbjtcbiAgICAvKiogTnVtYmVyIG9mIHJldHJ5IGF0dGVtcHRzIHBlciBjeWNsZSBvbiBmYWlsdXJlICovXG4gICAgY3ljbGVSZXRyaWVzOiBudW1iZXI7XG4gICAgLyoqIE9wZW5Db2RlIHByb21wdCB0aW1lb3V0IGluIG1zICh1c2VkIGFzIGlkbGUgdGltZW91dCkgKi9cbiAgICBwcm9tcHRUaW1lb3V0PzogbnVtYmVyO1xuICAgIC8qKiBQaGFzZSBoYXJkIHRpbWVvdXQgaW4gbXMgKHJ1bm5lci1zaWRlIHdhdGNoZG9nKSAqL1xuICAgIHBoYXNlVGltZW91dE1zPzogbnVtYmVyO1xuICAgIC8qKiBDeWNsZSBoYXJkIHRpbWVvdXQgaW4gbXMgKi9cbiAgICBjeWNsZVRpbWVvdXRNcz86IG51bWJlcjtcbiAgICAvKiogUnVuIGhhcmQgdGltZW91dCBpbiBtcyAqL1xuICAgIHJ1blRpbWVvdXRNcz86IG51bWJlcjtcbiAgICAvKiogRGVidWcgbW9kZTogcHJpbnQgdG9vbCBpbnZvY2F0aW9ucyB0byBjb25zb2xlL2xvZ3MgKi9cbiAgICBkZWJ1Z1dvcms6IGJvb2xlYW47XG59XG4iCiAgXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFBQSxPQUFPLFVBQVU7QUFBQSxFQUNqQixNQUFNLE9BQU87QUFBQSxFQUViLElBQUk7QUFBQSxFQUVKLFNBQVMsWUFBYSxDQUFDLE1BQU0sU0FBUztBQUFBLElBQ3BDLElBQUksVUFBVSxRQUFRLFlBQVksWUFDaEMsUUFBUSxVQUFVLFFBQVEsSUFBSTtBQUFBLElBRWhDLElBQUksQ0FBQyxTQUFTO0FBQUEsTUFDWixPQUFPO0FBQUEsSUFDVDtBQUFBLElBRUEsVUFBVSxRQUFRLE1BQU0sR0FBRztBQUFBLElBQzNCLElBQUksUUFBUSxRQUFRLEVBQUUsTUFBTSxJQUFJO0FBQUEsTUFDOUIsT0FBTztBQUFBLElBQ1Q7QUFBQSxJQUNBLFNBQVMsSUFBSSxFQUFHLElBQUksUUFBUSxRQUFRLEtBQUs7QUFBQSxNQUN2QyxJQUFJLElBQUksUUFBUSxHQUFHLFlBQVk7QUFBQSxNQUMvQixJQUFJLEtBQUssS0FBSyxPQUFPLENBQUMsRUFBRSxNQUFNLEVBQUUsWUFBWSxNQUFNLEdBQUc7QUFBQSxR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QUEsSUFDZCxRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsSUFBSTtBQUFBLE1BQ3hDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFBQSxFQUtMLElBQUksQ0FBQyxTQUFTO0FBQUEsSUFDVixRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsSUFBSTtBQUFBLE1BQ3hDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFBQSxFQUtMLElBQUksQ0FBQyxTQUFTO0FBQUEsSUFDVixRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsS0FBSztBQUFBLE1BQ3pDLEtBQUs7QUFBQSxTQUNGO0FBQUEsTUFDSCxTQUFTO0FBQUEsUUFDTCxnQkFBZ0I7QUFBQSxXQUNiLFFBQVE7QUFBQSxNQUNmO0FBQUEsSUFDSixDQUFDO0FBQUE7QUFBQSxFQUtMLElBQUksQ0FBQyxTQUFTO0FBQUEsSUFDVixRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsS0FBSztBQUFBLE1BQ3pDLEtBQUs7QUFBQSxTQUNGO0FBQUEsTUFDSCxTQUFTO0FBQUEsUUFDTCxnQkFBZ0I7QUFBQSxXQUNiLFFBQVE7QUFBQSxNQUNmO0FBQUEsSUFDSixDQUFDO0FBQUE7QUFBQSxFQUtMLEtBQUssQ0FBQyxTQUFTO0FBQUEsSUFDWCxRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsS0FBSztBQUFBLE1BQ3pDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFBQSxFQUtMLE9BQU8sQ0FBQyxTQUFTO0FBQUEsSUFDYixRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsT0FBTztBQUFBLE1BQzNDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFBQSxFQUtMLEtBQUssQ0FBQyxTQUFTO0FBQUEsSUFDWCxRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsS0FBSztBQUFBLE1BQ3pDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFBQSxFQUtMLElBQUksQ0FBQyxTQUFTO0FBQUEsSUFDVixRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsSUFBSTtBQUFBLE1BQ3hDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFBQSxFQUtMLFNBQVMsQ0FBQyxTQUFTO0FBQUEsSUFDZixRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsS0FBSztBQUFBLE1BQ3pDLEtBQUs7QUFBQSxTQUNGO0FBQUEsTUFDSCxTQUFTO0FBQUEsUUFDTCxnQkFBZ0I7QUFBQSxXQUNiLFFBQVE7QUFBQSxNQUNmO0FBQUEsSUFDSixDQUFDO0FBQUE7QUFBQSxFQUtMLFFBQVEsQ0FBQyxTQUFTO0FBQUEsSUFDZCxRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsSUFBSTtBQUFBLE1BQ3hDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFBQSxFQUtMLE1BQU0sQ0FBQyxTQUFTO0FBQUEsSUFDWixRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsS0FBSztBQUFBLE1BQ3pDLEtBQUs7QUFBQSxTQUNGO0FBQUEsTUFDSCxTQUFTO0FBQUEsUUFDTCxnQkFBZ0I7QUFBQSxXQUNiLFFBQVE7QUFBQSxNQUNmO0FBQUEsSUFDSixDQUFDO0FBQUE7QUFBQSxFQUtMLE9BQU8sQ0FBQyxTQUFTO0FBQUEsSUFDYixRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsSUFBSTtBQUFBLE1BQ3hDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFBQSxFQUtMLFdBQVcsQ0FBQyxTQUFTO0FBQUEsSUFDakIsUUFBUSxRQUFRLFVBQVUsS0FBSyxTQUFTLEtBQUs7QUFBQSxNQUN6QyxLQUFLO0FBQUEsU0FDRjtBQUFBLE1BQ0gsU0FBUztBQUFBLFFBQ0wsZ0JBQWdCO0FBQUEsV0FDYixRQUFRO0FBQUEsTUFDZjtBQUFBLElBQ0osQ0FBQztBQUFBO0FBQUEsRUFLTCxPQUFPLENBQUMsU0FBUztBQUFBLElBQ2IsUUFBUSxRQUFRLFVBQVUsS0FBSyxTQUFTLEtBQUs7QUFBQSxNQUN6QyxLQUFLO0FBQUEsU0FDRjtBQUFBLE1BQ0gsU0FBUztBQUFBLFFBQ0wsZ0JBQWdCO0FBQUEsV0FDYixRQUFRO0FBQUEsTUFDZjtBQUFBLElBQ0osQ0FBQztBQUFBO0FBQUEsRUFLTCxLQUFLLENBQUMsU0FBUztBQUFBLElBQ1gsUUFBUSxRQUFRLFVBQVUsS0FBSyxTQUFTLEtBQUs7QUFBQSxNQUN6QyxLQUFLO0FBQUEsU0FDRjtBQUFBLE1BQ0gsU0FBUztBQUFBLFFBQ0wsZ0JBQWdCO0FBQUEsV0FDYixRQUFRO0FBQUEsTUFDZjtBQUFBLElBQ0osQ0FBQztBQUFBO0FBQUEsRUFLTCxNQUFNLENBQUMsU0FBUztBQUFBLElBQ1osUUFBUSxRQUFRLFVBQVUsS0FBSyxTQUFTLEtBQUs7QUFBQSxNQUN6QyxLQUFLO0FBQUEsU0FDRjtBQUFBLE1BQ0gsU0FBUztBQUFBLFFBQ0wsZ0JBQWdCO0FBQUEsV0FDYixRQUFRO0FBQUEsTUFDZjtBQUFBLElBQ0osQ0FBQztBQUFBO0FBQUEsRUFLTCxRQUFRLENBQUMsU0FBUztBQUFBLElBQ2QsUUFBUSxRQUFRLFVBQVUsS0FBSyxTQUFTLEtBQUs7QUFBQSxNQUN6QyxLQUFLO0FBQUEsU0FDRjtBQUFBLElBQ1AsQ0FBQztBQUFBO0FBRVQ7QUFBQTtBQUNBLE1BQU0sZ0JBQWdCLGNBQWM7QUFBQSxFQUloQyxJQUFJLENBQUMsU0FBUztBQUFBLElBQ1YsUUFBUSxTQUFTLFVBQVUsS0FBSyxTQUFTLElBQUk7QUFBQSxNQUN6QyxLQUFLO0FBQUEsU0FDRjtBQUFBLElBQ1AsQ0FBQztBQUFBO0FBRVQ7QUFBQTtBQUNBLE1BQU0sY0FBYyxjQUFjO0FBQUEsRUFJOUIsU0FBUyxDQUFDLFNBQVM7QUFBQSxJQUNmLFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxLQUFLO0FBQUEsTUFDekMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxNQUNILFNBQVM7QUFBQSxRQUNMLGdCQUFnQjtBQUFBLFdBQ2IsUUFBUTtBQUFBLE1BQ2Y7QUFBQSxJQUNKLENBQUM7QUFBQTtBQUFBLEVBS0wsUUFBUSxDQUFDLFNBQVM7QUFBQSxJQUNkLFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxLQUFLO0FBQUEsTUFDekMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxNQUNILFNBQVM7QUFBQSxRQUNMLGdCQUFnQjtBQUFBLFdBQ2IsUUFBUTtBQUFBLE1BQ2Y7QUFBQSxJQUNKLENBQUM7QUFBQTtBQUVUO0FBQUE7QUFDQSxNQUFNLGlCQUFpQixjQUFjO0FBQUEsRUFJakMsSUFBSSxDQUFDLFNBQVM7QUFBQSxJQUNWLFFBQVEsU0FBUyxVQUFVLEtBQUssU0FBUyxJQUFJO0FBQUEsTUFDekMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUFBLEVBS0wsSUFBSSxDQUFDLFNBQVM7QUFBQSxJQUNWLFFBQVEsU0FBUyxVQUFVLEtBQUssU0FBUyxJQUFJO0FBQUEsTUFDekMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUFBLEVBRUwsUUFBUSxJQUFJLE1BQU0sRUFBRSxRQUFRLEtBQUssUUFBUSxDQUFDO0FBQzlDO0FBQUE7QUFDQSxNQUFNLGFBQWEsY0FBYztBQUFBLEVBSTdCLElBQUksQ0FBQyxTQUFTO0FBQUEsSUFDVixRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsSUFBSTtBQUFBLE1BQ3hDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFBQSxFQUtMLEtBQUssQ0FBQyxTQUFTO0FBQUEsSUFDWCxRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsSUFBSTtBQUFBLE1BQ3hDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFBQSxFQUtMLE9BQU8sQ0FBQyxTQUFTO0FBQUEsSUFDYixRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsSUFBSTtBQUFBLE1BQ3hDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFFVDtBQUFBO0FBQ0EsTUFBTSxhQUFhLGNBQWM7QUFBQSxFQUk3QixJQUFJLENBQUMsU0FBUztBQUFBLElBQ1YsUUFBUSxRQUFRLFVBQVUsS0FBSyxTQUFTLElBQUk7QUFBQSxNQUN4QyxLQUFLO0FBQUEsU0FDRjtBQUFBLElBQ1AsQ0FBQztBQUFBO0FBQUEsRUFLTCxJQUFJLENBQUMsU0FBUztBQUFBLElBQ1YsUUFBUSxRQUFRLFVBQVUsS0FBSyxTQUFTLElBQUk7QUFBQSxNQUN4QyxLQUFLO0FBQUEsU0FDRjtBQUFBLElBQ1AsQ0FBQztBQUFBO0FBQUEsRUFLTCxNQUFNLENBQUMsU0FBUztBQUFBLElBQ1osUUFBUSxTQUFTLFVBQVUsS0FBSyxTQUFTLElBQUk7QUFBQSxNQUN6QyxLQUFLO0FBQUEsU0FDRjtBQUFBLElBQ1AsQ0FBQztBQUFBO0FBRVQ7QUFBQTtBQUNBLE1BQU0sWUFBWSxjQUFjO0FBQUEsRUFJNUIsR0FBRyxDQUFDLFNBQVM7QUFBQSxJQUNULFFBQVEsU0FBUyxVQUFVLEtBQUssU0FBUyxLQUFLO0FBQUEsTUFDMUMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxNQUNILFNBQVM7QUFBQSxRQUNMLGdCQUFnQjtBQUFBLFdBQ2IsU0FBUztBQUFBLE1BQ2hCO0FBQUEsSUFDSixDQUFDO0FBQUE7QUFBQSxFQUtMLE1BQU0sQ0FBQyxTQUFTO0FBQUEsSUFDWixRQUFRLFNBQVMsVUFBVSxLQUFLLFNBQVMsSUFBSTtBQUFBLE1BQ3pDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFFVDtBQUFBO0FBQ0EsTUFBTSxhQUFhLGNBQWM7QUFBQSxFQUk3QixNQUFNLENBQUMsU0FBUztBQUFBLElBQ1osUUFBUSxRQUFRLFVBQVUsS0FBSyxTQUFTLE9BQU87QUFBQSxNQUMzQyxLQUFLO0FBQUEsU0FDRjtBQUFBLElBQ1AsQ0FBQztBQUFBO0FBQUEsRUFLTCxLQUFLLENBQUMsU0FBUztBQUFBLElBQ1gsUUFBUSxRQUFRLFVBQVUsS0FBSyxTQUFTLEtBQUs7QUFBQSxNQUN6QyxLQUFLO0FBQUEsU0FDRjtBQUFBLElBQ1AsQ0FBQztBQUFBO0FBQUEsRUFLTCxRQUFRLENBQUMsU0FBUztBQUFBLElBQ2QsUUFBUSxRQUFRLFVBQVUsS0FBSyxTQUFTLEtBQUs7QUFBQSxNQUN6QyxLQUFLO0FBQUEsU0FDRjtBQUFBLE1BQ0gsU0FBUztBQUFBLFFBQ0wsZ0JBQWdCO0FBQUEsV0FDYixRQUFRO0FBQUEsTUFDZjtBQUFBLElBQ0osQ0FBQztBQUFBO0FBQUEsRUFLTCxZQUFZLENBQUMsU0FBUztBQUFBLElBQ2xCLFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxLQUFLO0FBQUEsTUFDekMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUFBLEVBS0wsR0FBRyxDQUFDLFNBQVM7QUFBQSxJQUNULFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxJQUFJO0FBQUEsTUFDeEMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxNQUNILFNBQVM7QUFBQSxRQUNMLGdCQUFnQjtBQUFBLFdBQ2IsUUFBUTtBQUFBLE1BQ2Y7QUFBQSxJQUNKLENBQUM7QUFBQTtBQUVUO0FBQUE7QUFDQSxNQUFNLFlBQVksY0FBYztBQUFBLEVBSTVCLE1BQU0sQ0FBQyxTQUFTO0FBQUEsSUFDWixRQUFRLFNBQVMsVUFBVSxLQUFLLFNBQVMsSUFBSTtBQUFBLE1BQ3pDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFBQSxFQUtMLEdBQUcsQ0FBQyxTQUFTO0FBQUEsSUFDVCxRQUFRLFNBQVMsVUFBVSxLQUFLLFNBQVMsS0FBSztBQUFBLE1BQzFDLEtBQUs7QUFBQSxTQUNGO0FBQUEsTUFDSCxTQUFTO0FBQUEsUUFDTCxnQkFBZ0I7QUFBQSxXQUNiLFNBQVM7QUFBQSxNQUNoQjtBQUFBLElBQ0osQ0FBQztBQUFBO0FBQUEsRUFLTCxPQUFPLENBQUMsU0FBUztBQUFBLElBQ2IsUUFBUSxRQUFRLFVBQVUsS0FBSyxTQUFTLEtBQUs7QUFBQSxNQUN6QyxLQUFLO0FBQUEsU0FDRjtBQUFBLElBQ1AsQ0FBQztBQUFBO0FBQUEsRUFLTCxVQUFVLENBQUMsU0FBUztBQUFBLElBQ2hCLFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxLQUFLO0FBQUEsTUFDekMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUFBLEVBRUwsT0FBTyxJQUFJLEtBQUssRUFBRSxRQUFRLEtBQUssUUFBUSxDQUFDO0FBQzVDO0FBQUE7QUFDQSxNQUFNLFlBQVksY0FBYztBQUFBLEVBSTVCLE1BQU0sQ0FBQyxTQUFTO0FBQUEsSUFDWixRQUFRLFNBQVMsVUFBVSxLQUFLLFNBQVMsSUFBSTtBQUFBLE1BQ3pDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFFVDtBQUFBO0FBQ0EsTUFBTSxrQkFBa0IsY0FBYztBQUFBLEVBSWxDLE1BQU0sQ0FBQyxTQUFTO0FBQUEsSUFDWixRQUFRLFNBQVMsVUFBVSxLQUFLLFNBQVMsSUFBSTtBQUFBLE1BQ3pDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFFVDtBQUFBO0FBQ0EsTUFBTSxnQkFBZ0IsY0FBYztBQUFBLEVBSWhDLElBQUksQ0FBQyxTQUFTO0FBQUEsSUFDVixRQUFRLFNBQVMsVUFBVSxLQUFLLFNBQVMsSUFBSTtBQUFBLE1BQ3pDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFBQSxFQUtMLFFBQVEsQ0FBQyxTQUFTO0FBQUEsSUFDZCxRQUFRLFNBQVMsVUFBVSxLQUFLLFNBQVMsS0FBSztBQUFBLE1BQzFDLEtBQUs7QUFBQSxTQUNGO0FBQUEsTUFDSCxTQUFTO0FBQUEsUUFDTCxnQkFBZ0I7QUFBQSxXQUNiLFNBQVM7QUFBQSxNQUNoQjtBQUFBLElBQ0osQ0FBQztBQUFBO0FBRVQ7QUFBQTtBQUNBLE1BQU0sWUFBWSxjQUFjO0FBQUEsRUFJNUIsWUFBWSxDQUFDLFNBQVM7QUFBQSxJQUNsQixRQUFRLFNBQVMsVUFBVSxLQUFLLFNBQVMsS0FBSztBQUFBLE1BQzFDLEtBQUs7QUFBQSxTQUNGO0FBQUEsTUFDSCxTQUFTO0FBQUEsUUFDTCxnQkFBZ0I7QUFBQSxXQUNiLFNBQVM7QUFBQSxNQUNoQjtBQUFBLElBQ0osQ0FBQztBQUFBO0FBQUEsRUFLTCxRQUFRLENBQUMsU0FBUztBQUFBLElBQ2QsUUFBUSxTQUFTLFVBQVUsS0FBSyxTQUFTLEtBQUs7QUFBQSxNQUMxQyxLQUFLO0FBQUEsU0FDRjtBQUFBLElBQ1AsQ0FBQztBQUFBO0FBQUEsRUFLTCxZQUFZLENBQUMsU0FBUztBQUFBLElBQ2xCLFFBQVEsU0FBUyxVQUFVLEtBQUssU0FBUyxLQUFLO0FBQUEsTUFDMUMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUFBLEVBS0wsVUFBVSxDQUFDLFNBQVM7QUFBQSxJQUNoQixRQUFRLFNBQVMsVUFBVSxLQUFLLFNBQVMsS0FBSztBQUFBLE1BQzFDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFBQSxFQUtMLFVBQVUsQ0FBQyxTQUFTO0FBQUEsSUFDaEIsUUFBUSxTQUFTLFVBQVUsS0FBSyxTQUFTLEtBQUs7QUFBQSxNQUMxQyxLQUFLO0FBQUEsU0FDRjtBQUFBLElBQ1AsQ0FBQztBQUFBO0FBQUEsRUFLTCxZQUFZLENBQUMsU0FBUztBQUFBLElBQ2xCLFFBQVEsU0FBUyxVQUFVLEtBQUssU0FBUyxLQUFLO0FBQUEsTUFDMUMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUFBLEVBS0wsV0FBVyxDQUFDLFNBQVM7QUFBQSxJQUNqQixRQUFRLFNBQVMsVUFBVSxLQUFLLFNBQVMsS0FBSztBQUFBLE1BQzFDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFBQSxFQUtMLGNBQWMsQ0FBQyxTQUFTO0FBQUEsSUFDcEIsUUFBUSxTQUFTLFVBQVUsS0FBSyxTQUFTLEtBQUs7QUFBQSxNQUMxQyxLQUFLO0FBQUEsU0FDRjtBQUFBLE1BQ0gsU0FBUztBQUFBLFFBQ0wsZ0JBQWdCO0FBQUEsV0FDYixTQUFTO0FBQUEsTUFDaEI7QUFBQSxJQUNKLENBQUM7QUFBQTtBQUFBLEVBS0wsU0FBUyxDQUFDLFNBQVM7QUFBQSxJQUNmLFFBQVEsU0FBUyxVQUFVLEtBQUssU0FBUyxLQUFLO0FBQUEsTUFDMUMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxNQUNILFNBQVM7QUFBQSxRQUNMLGdCQUFnQjtBQUFBLFdBQ2IsU0FBUztBQUFBLE1BQ2hCO0FBQUEsSUFDSixDQUFDO0FBQUE7QUFBQSxFQUtMLE9BQU8sQ0FBQyxTQUFTO0FBQUEsSUFDYixRQUFRLFNBQVMsVUFBVSxLQUFLLFNBQVMsS0FBSztBQUFBLE1BQzFDLEtBQUs7QUFBQSxTQUNGO0FBQUEsTUFDSCxTQUFTO0FBQUEsUUFDTCxnQkFBZ0I7QUFBQSxXQUNiLFNBQVM7QUFBQSxNQUNoQjtBQUFBLElBQ0osQ0FBQztBQUFBO0FBQUEsRUFFTCxVQUFVLElBQUksUUFBUSxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFDbEQ7QUFBQTtBQUNBLE1BQU0sY0FBYyxjQUFjO0FBQUEsRUFJOUIsU0FBUyxDQUFDLFNBQVM7QUFBQSxJQUNmLFFBQVEsU0FBUyxVQUFVLEtBQUssU0FBUyxJQUFJLElBQUk7QUFBQSxNQUM3QyxLQUFLO0FBQUEsU0FDRjtBQUFBLElBQ1AsQ0FBQztBQUFBO0FBRVQ7QUFBQTtBQUNPLE1BQU0sdUJBQXVCLGNBQWM7QUFBQSxFQUk5QyxvQ0FBb0MsQ0FBQyxTQUFTO0FBQUEsSUFDMUMsUUFBUSxRQUFRLFVBQVUsS0FBSyxTQUFTLEtBQUs7QUFBQSxNQUN6QyxLQUFLO0FBQUEsU0FDRjtBQUFBLE1BQ0gsU0FBUztBQUFBLFFBQ0wsZ0JBQWdCO0FBQUEsV0FDYixRQUFRO0FBQUEsTUFDZjtBQUFBLElBQ0osQ0FBQztBQUFBO0FBQUEsRUFFTCxTQUFTLElBQUksT0FBTyxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxFQUM1QyxVQUFVLElBQUksUUFBUSxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxFQUM5QyxNQUFNLElBQUksSUFBSSxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxFQUN0QyxTQUFTLElBQUksT0FBTyxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxFQUM1QyxPQUFPLElBQUksS0FBSyxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxFQUN4QyxXQUFXLElBQUksU0FBUyxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxFQUNoRCxPQUFPLElBQUksS0FBSyxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxFQUN4QyxNQUFNLElBQUksSUFBSSxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxFQUN0QyxVQUFVLElBQUksUUFBUSxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxFQUM5QyxVQUFVLElBQUksUUFBUSxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxFQUM5QyxXQUFXLElBQUksU0FBUyxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxFQUNoRCxPQUFPLElBQUksS0FBSyxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxFQUN4QyxPQUFPLElBQUksS0FBSyxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxFQUN4QyxNQUFNLElBQUksSUFBSSxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxFQUN0QyxNQUFNLElBQUksSUFBSSxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxFQUN0QyxNQUFNLElBQUksSUFBSSxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxFQUN0QyxZQUFZLElBQUksVUFBVSxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxFQUNsRCxNQUFNLElBQUksSUFBSSxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxFQUN0QyxPQUFPLElBQUksS0FBSyxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxFQUN4QyxRQUFRLElBQUksTUFBTSxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFDOUM7OztBQzUyQkEsU0FBUyxJQUFJLENBQUMsT0FBTyxVQUFVO0FBQUEsRUFDM0IsSUFBSSxDQUFDO0FBQUEsSUFDRDtBQUFBLEVBQ0osSUFBSSxDQUFDO0FBQUEsSUFDRCxPQUFPO0FBQUEsRUFDWCxJQUFJLFVBQVU7QUFBQSxJQUNWLE9BQU87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QUNKO0FBQUEsRUFDQSxVQUFVO0FBQUEsSUFDTjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDSjtBQUFBLEVBQ0EsV0FBVyxDQUFDLGFBQWEsU0FBUyxVQUFVLFdBQVcsU0FBUyxNQUFNO0FBQUEsRUFDdEUsU0FBUyxDQUFDLFdBQVcsYUFBYSxhQUFhLFlBQVksZUFBZTtBQUM5RTtBQUtBLElBQU0sa0JBQTRDO0FBQUEsRUFDOUMsVUFBVTtBQUFBLElBQ047QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNKO0FBQUEsRUFDQSxVQUFVO0FBQUEsSUFDTjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDSjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ0w7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNKO0FBQUEsRUFDQSxVQUFVO0FBQUEsSUFDTjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNKO0FBQUEsRUFDQSxR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QUFBQSxNQUNoQyxLQUFJLE1BQ0EseUVBQ0o7QUFBQSxNQUNBLE9BQU87QUFBQSxJQUNYO0FBQUEsSUFHQSxNQUFNLGtCQUNGLHNGQUFzRixLQUNsRixZQUNKO0FBQUEsSUFDSixJQUFJLGlCQUFpQjtBQUFBLE1BQ2pCLEtBQUksTUFDQSx5REFDSjtBQUFBLE1BQ0EsT0FBTztBQUFBLElBQ1g7QUFBQSxJQUVBLEtBQUksTUFBTSw2Q0FBNkM7QUFBQSxJQUN2RCxPQUFPO0FBQUE7QUFBQSxFQUlILGlCQUFpQixDQUFDLE9BQTRCO0FBQUEsSUFFbEQsTUFBTSxXQUFXLEtBQUssZ0JBQWdCLEtBQUs7QUFBQSxJQUMzQyxJQUFJLFNBQVMsU0FBUyxHQUFHO0FBQUEsTUFDckIsT0FBTztBQUFBLElBQ1g7QUFBQSxJQUdBLFdBQVcsY0FBYyxNQUFNLGFBQWE7QUFBQSxNQUN4QyxJQUNJLFdBQVcsV0FDWCxhQUFhLFdBQVcsV0FDeEIsV0FBVyxRQUFRLFNBQ3JCO0FBQUEsUUFDRSxPQUFPO0FBQUEsTUFDWDtBQUFBLElBQ0o7QUFBQSxJQUVBLE9BQU87QUFBQTtBQUFBLE9BSUcsV0FBVSxDQUNwQixRQUNBLFNBQ2E7QUFBQSxJQUNiLE1BQU0sUUFBUSxLQUFLLFVBQVUsS0FBSztBQUFBLElBQ2xDLElBQUksT0FBTztBQUFBLE1BQ1AsSUFBSTtBQUFBLE1BQ0osUUFBUTtBQUFBO0FBQUEsVUFFQTtBQUFBLFVBQ0E7QUFBQTtBQUFBLFVBRUE7QUFBQSxVQUVBLEtBQUssZ0JBQWdCLHFCQUNqQixNQUFNLGNBQ04sT0FDSjtBQUFBLFVBQ0E7QUFBQTtBQUFBLFVBRUE7QUFBQSxVQUVBLEtBQUssZ0JBQWdCLHFCQUNqQixNQUFNLGNBQ04sU0FDSjtBQUFBLFVBQ0E7QUFBQTtBQUFBLFVBRUE7QUFBQSxVQUNBO0FBQUE7QUFBQSxVQUVBO0FBQUE7QUFBQSxNQUVSLEtBQUssVUFBVSxhQUFhLFdBQVcsTUFBTTtBQUFBLElBQ2pEO0FBQUEsSUFFQSxHQUFHLE9BQU8sZUFBZTtBQUFBLElBQ3pCLEdBQUcsS0FBSyxnQkFBZ0IsUUFBUTtBQUFBLElBQ2hDLEdBQUcsS0FBSyxZQUFZLFNBQVM7QUFBQSxJQUU3QixLQUFJLEtBQUssc0JBQXNCLEVBQUUsUUFBUSxRQUFRLENBQUM7QUFBQTtBQUUxRDtBQUdBLGVBQXNCLHFCQUFxQixDQUN2QyxPQUNBLFlBQ3dCO0FBQUEsRUFFeEIsTUFBTSxZQUFZLElBQUksZ0JBQWdCO0FBQUEsSUFDbEMsYUFBYSxNQUFNLE1BQU07QUFBQSxJQUN6QixXQUFXLE1BQU0sVUFBVSxZQUFZO0FBQUEsRUFDM0MsQ0FBQztBQUFBLEVBRUQsT0FBTyxJQUFJLGdCQUFnQixPQUFPLFlBQVksU0FBUztBQUFBOyIsCiAgImRlYnVnSWQiOiAiRUEwMzI5MzFFNEFDQTkxQTY0NzU2RTIxNjQ3NTZFMjEiLAogICJuYW1lcyI6IFtdCn0=
