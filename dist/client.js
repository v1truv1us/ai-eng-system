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
export {
  OpenCodeClient
};

//# debugId=C036BA04258DE47D64756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vbm9kZV9tb2R1bGVzL2lzZXhlL3dpbmRvd3MuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2lzZXhlL21vZGUuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2lzZXhlL2luZGV4LmpzIiwgIi4uL25vZGVfbW9kdWxlcy93aGljaC93aGljaC5qcyIsICIuLi9ub2RlX21vZHVsZXMvcGF0aC1rZXkvaW5kZXguanMiLCAiLi4vbm9kZV9tb2R1bGVzL2Nyb3NzLXNwYXduL2xpYi91dGlsL3Jlc29sdmVDb21tYW5kLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9jcm9zcy1zcGF3bi9saWIvdXRpbC9lc2NhcGUuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3NoZWJhbmctcmVnZXgvaW5kZXguanMiLCAiLi4vbm9kZV9tb2R1bGVzL3NoZWJhbmctY29tbWFuZC9pbmRleC5qcyIsICIuLi9ub2RlX21vZHVsZXMvY3Jvc3Mtc3Bhd24vbGliL3V0aWwvcmVhZFNoZWJhbmcuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2Nyb3NzLXNwYXduL2xpYi9wYXJzZS5qcyIsICIuLi9ub2RlX21vZHVsZXMvY3Jvc3Mtc3Bhd24vbGliL2Vub2VudC5qcyIsICIuLi9ub2RlX21vZHVsZXMvY3Jvc3Mtc3Bhd24vaW5kZXguanMiLCAiLi4vc3JjL2JhY2tlbmRzL29wZW5jb2RlL2NsaWVudC50cyIsICIuLi9ub2RlX21vZHVsZXMvQG9wZW5jb2RlLWFpL3Nkay9kaXN0L2dlbi9jb3JlL3NlcnZlclNlbnRFdmVudHMuZ2VuLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9Ab3BlbmNvZGUtYWkvc2RrL2Rpc3QvZ2VuL2NvcmUvYXV0aC5nZW4uanMiLCAiLi4vbm9kZV9tb2R1bGVzL0BvcGVuY29kZS1haS9zZGsvZGlzdC9nZW4vY29yZS9ib2R5U2VyaWFsaXplci5nZW4uanMiLCAiLi4vbm9kZV9tb2R1bGVzL0BvcGVuY29kZS1haS9zZGsvZGlzdC9nZW4vY29yZS9wYXRoU2VyaWFsaXplci5nZW4uanMiLCAiLi4vbm9kZV9tb2R1bGVzL0BvcGVuY29kZS1haS9zZGsvZGlzdC9nZW4vY29yZS91dGlscy5nZW4uanMiLCAiLi4vbm9kZV9tb2R1bGVzL0BvcGVuY29kZS1haS9zZGsvZGlzdC9nZW4vY2xpZW50L3V0aWxzLmdlbi5qcyIsICIuLi9ub2RlX21vZHVsZXMvQG9wZW5jb2RlLWFpL3Nkay9kaXN0L2dlbi9jbGllbnQvY2xpZW50Lmdlbi5qcyIsICIuLi9ub2RlX21vZHVsZXMvQG9wZW5jb2RlLWFpL3Nkay9kaXN0L2dlbi9jb3JlL3BhcmFtcy5nZW4uanMiLCAiLi4vbm9kZV9tb2R1bGVzL0BvcGVuY29kZS1haS9zZGsvZGlzdC9nZW4vY2xpZW50Lmdlbi5qcyIsICIuLi9ub2RlX21vZHVsZXMvQG9wZW5jb2RlLWFpL3Nkay9kaXN0L2dlbi9zZGsuZ2VuLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9Ab3BlbmNvZGUtYWkvc2RrL2Rpc3QvY2xpZW50LmpzIiwgIi4uL25vZGVfbW9kdWxlcy9Ab3BlbmNvZGUtYWkvc2RrL2Rpc3Qvc2VydmVyLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9Ab3BlbmNvZGUtYWkvc2RrL2Rpc3QvcHJvY2Vzcy5qcyIsICIuLi9ub2RlX21vZHVsZXMvQG9wZW5jb2RlLWFpL3Nkay9kaXN0L2luZGV4LmpzIiwgIi4uL3NyYy91dGlsL2xvZy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsKICAgICJtb2R1bGUuZXhwb3J0cyA9IGlzZXhlXG5pc2V4ZS5zeW5jID0gc3luY1xuXG52YXIgZnMgPSByZXF1aXJlKCdmcycpXG5cbmZ1bmN0aW9uIGNoZWNrUGF0aEV4dCAocGF0aCwgb3B0aW9ucykge1xuICB2YXIgcGF0aGV4dCA9IG9wdGlvbnMucGF0aEV4dCAhPT0gdW5kZWZpbmVkID9cbiAgICBvcHRpb25zLnBhdGhFeHQgOiBwcm9jZXNzLmVudi5QQVRIRVhUXG5cbiAgaWYgKCFwYXRoZXh0KSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIHBhdGhleHQgPSBwYXRoZXh0LnNwbGl0KCc7JylcbiAgaWYgKHBhdGhleHQuaW5kZXhPZignJykgIT09IC0xKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHBhdGhleHQubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgcCA9IHBhdGhleHRbaV0udG9Mb3dlckNhc2UoKVxuICAgIGlmIChwICYmIHBhdGguc3Vic3RyKC1wLmxlbmd0aCkudG9Mb3dlckNhc2UoKSA9PT0gcCkge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cbmZ1bmN0aW9uIGNoZWNrU3RhdCAoc3RhdCwgcGF0aCwgb3B0aW9ucykge1xuICBpZiAoIXN0YXQuaXNTeW1ib2xpY0xpbmsoKSAmJiAhc3RhdC5pc0ZpbGUoKSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG4gIHJldHVybiBjaGVja1BhdGhFeHQocGF0aCwgb3B0aW9ucylcbn1cblxuZnVuY3Rpb24gaXNleGUgKHBhdGgsIG9wdGlvbnMsIGNiKSB7XG4gIGZzLnN0YXQocGF0aCwgZnVuY3Rpb24gKGVyLCBzdGF0KSB7XG4gICAgY2IoZXIsIGVyID8gZmFsc2UgOiBjaGVja1N0YXQoc3RhdCwgcGF0aCwgb3B0aW9ucykpXG4gIH0pXG59XG5cbmZ1bmN0aW9uIHN5bmMgKHBhdGgsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIGNoZWNrU3RhdChmcy5zdGF0U3luYyhwYXRoKSwgcGF0aCwgb3B0aW9ucylcbn1cbiIsCiAgICAibW9kdWxlLmV4cG9ydHMgPSBpc2V4ZVxuaXNleGUuc3luYyA9IHN5bmNcblxudmFyIGZzID0gcmVxdWlyZSgnZnMnKVxuXG5mdW5jdGlvbiBpc2V4ZSAocGF0aCwgb3B0aW9ucywgY2IpIHtcbiAgZnMuc3RhdChwYXRoLCBmdW5jdGlvbiAoZXIsIHN0YXQpIHtcbiAgICBjYihlciwgZXIgPyBmYWxzZSA6IGNoZWNrU3RhdChzdGF0LCBvcHRpb25zKSlcbiAgfSlcbn1cblxuZnVuY3Rpb24gc3luYyAocGF0aCwgb3B0aW9ucykge1xuICByZXR1cm4gY2hlY2tTdGF0KGZzLnN0YXRTeW5jKHBhdGgpLCBvcHRpb25zKVxufVxuXG5mdW5jdGlvbiBjaGVja1N0YXQgKHN0YXQsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIHN0YXQuaXNGaWxlKCkgJiYgY2hlY2tNb2RlKHN0YXQsIG9wdGlvbnMpXG59XG5cbmZ1bmN0aW9uIGNoZWNrTW9kZSAoc3RhdCwgb3B0aW9ucykge1xuICB2YXIgbW9kID0gc3RhdC5tb2RlXG4gIHZhciB1aWQgPSBzdGF0LnVpZFxuICB2YXIgZ2lkID0gc3RhdC5naWRcblxuICB2YXIgbXlVaWQgPSBvcHRpb25zLnVpZCAhPT0gdW5kZWZpbmVkID9cbiAgICBvcHRpb25zLnVpZCA6IHByb2Nlc3MuZ2V0dWlkICYmIHByb2Nlc3MuZ2V0dWlkKClcbiAgdmFyIG15R2lkID0gb3B0aW9ucy5naWQgIT09IHVuZGVmaW5lZCA/XG4gICAgb3B0aW9ucy5naWQgOiBwcm9jZXNzLmdldGdpZCAmJiBwcm9jZXNzLmdldGdpZCgpXG5cbiAgdmFyIHUgPSBwYXJzZUludCgnMTAwJywgOClcbiAgdmFyIGcgPSBwYXJzZUludCgnMDEwJywgOClcbiAgdmFyIG8gPSBwYXJzZUludCgnMDAxJywgOClcbiAgdmFyIHVnID0gdSB8IGdcblxuICB2YXIgcmV0ID0gKG1vZCAmIG8pIHx8XG4gICAgKG1vZCAmIGcpICYmIGdpZCA9PT0gbXlHaWQgfHxcbiAgICAobW9kICYgdSkgJiYgdWlkID09PSBteVVpZCB8fFxuICAgIChtb2QgJiB1ZykgJiYgbXlVaWQgPT09IDBcblxuICByZXR1cm4gcmV0XG59XG4iLAogICAgInZhciBmcyA9IHJlcXVpcmUoJ2ZzJylcbnZhciBjb3JlXG5pZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJyB8fCBnbG9iYWwuVEVTVElOR19XSU5ET1dTKSB7XG4gIGNvcmUgPSByZXF1aXJlKCcuL3dpbmRvd3MuanMnKVxufSBlbHNlIHtcbiAgY29yZSA9IHJlcXVpcmUoJy4vbW9kZS5qcycpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNleGVcbmlzZXhlLnN5bmMgPSBzeW5jXG5cbmZ1bmN0aW9uIGlzZXhlIChwYXRoLCBvcHRpb25zLCBjYikge1xuICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjYiA9IG9wdGlvbnNcbiAgICBvcHRpb25zID0ge31cbiAgfVxuXG4gIGlmICghY2IpIHtcbiAgICBpZiAodHlwZW9mIFByb21pc2UgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2NhbGxiYWNrIG5vdCBwcm92aWRlZCcpXG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIGlzZXhlKHBhdGgsIG9wdGlvbnMgfHwge30sIGZ1bmN0aW9uIChlciwgaXMpIHtcbiAgICAgICAgaWYgKGVyKSB7XG4gICAgICAgICAgcmVqZWN0KGVyKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc29sdmUoaXMpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIGNvcmUocGF0aCwgb3B0aW9ucyB8fCB7fSwgZnVuY3Rpb24gKGVyLCBpcykge1xuICAgIC8vIGlnbm9yZSBFQUNDRVMgYmVjYXVzZSB0aGF0IGp1c3QgbWVhbnMgd2UgYXJlbid0IGFsbG93ZWQgdG8gcnVuIGl0XG4gICAgaWYgKGVyKSB7XG4gICAgICBpZiAoZXIuY29kZSA9PT0gJ0VBQ0NFUycgfHwgb3B0aW9ucyAmJiBvcHRpb25zLmlnbm9yZUVycm9ycykge1xuICAgICAgICBlciA9IG51bGxcbiAgICAgICAgaXMgPSBmYWxzZVxuICAgICAgfVxuICAgIH1cbiAgICBjYihlciwgaXMpXG4gIH0pXG59XG5cbmZ1bmN0aW9uIHN5bmMgKHBhdGgsIG9wdGlvbnMpIHtcbiAgLy8gbXkga2luZ2RvbSBmb3IgYSBmaWx0ZXJlZCBjYXRjaFxuICB0cnkge1xuICAgIHJldHVybiBjb3JlLnN5bmMocGF0aCwgb3B0aW9ucyB8fCB7fSlcbiAgfSBjYXRjaCAoZXIpIHtcbiAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLmlnbm9yZUVycm9ycyB8fCBlci5jb2RlID09PSAnRUFDQ0VTJykge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IGVyXG4gICAgfVxuICB9XG59XG4iLAogICAgImNvbnN0IGlzV2luZG93cyA9IHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicgfHxcbiAgICBwcm9jZXNzLmVudi5PU1RZUEUgPT09ICdjeWd3aW4nIHx8XG4gICAgcHJvY2Vzcy5lbnYuT1NUWVBFID09PSAnbXN5cydcblxuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuY29uc3QgQ09MT04gPSBpc1dpbmRvd3MgPyAnOycgOiAnOidcbmNvbnN0IGlzZXhlID0gcmVxdWlyZSgnaXNleGUnKVxuXG5jb25zdCBnZXROb3RGb3VuZEVycm9yID0gKGNtZCkgPT5cbiAgT2JqZWN0LmFzc2lnbihuZXcgRXJyb3IoYG5vdCBmb3VuZDogJHtjbWR9YCksIHsgY29kZTogJ0VOT0VOVCcgfSlcblxuY29uc3QgZ2V0UGF0aEluZm8gPSAoY21kLCBvcHQpID0+IHtcbiAgY29uc3QgY29sb24gPSBvcHQuY29sb24gfHwgQ09MT05cblxuICAvLyBJZiBpdCBoYXMgYSBzbGFzaCwgdGhlbiB3ZSBkb24ndCBib3RoZXIgc2VhcmNoaW5nIHRoZSBwYXRoZW52LlxuICAvLyBqdXN0IGNoZWNrIHRoZSBmaWxlIGl0c2VsZiwgYW5kIHRoYXQncyBpdC5cbiAgY29uc3QgcGF0aEVudiA9IGNtZC5tYXRjaCgvXFwvLykgfHwgaXNXaW5kb3dzICYmIGNtZC5tYXRjaCgvXFxcXC8pID8gWycnXVxuICAgIDogKFxuICAgICAgW1xuICAgICAgICAvLyB3aW5kb3dzIGFsd2F5cyBjaGVja3MgdGhlIGN3ZCBmaXJzdFxuICAgICAgICAuLi4oaXNXaW5kb3dzID8gW3Byb2Nlc3MuY3dkKCldIDogW10pLFxuICAgICAgICAuLi4ob3B0LnBhdGggfHwgcHJvY2Vzcy5lbnYuUEFUSCB8fFxuICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0OiB2ZXJ5IHVudXN1YWwgKi8gJycpLnNwbGl0KGNvbG9uKSxcbiAgICAgIF1cbiAgICApXG4gIGNvbnN0IHBhdGhFeHRFeGUgPSBpc1dpbmRvd3NcbiAgICA/IG9wdC5wYXRoRXh0IHx8IHByb2Nlc3MuZW52LlBBVEhFWFQgfHwgJy5FWEU7LkNNRDsuQkFUOy5DT00nXG4gICAgOiAnJ1xuICBjb25zdCBwYXRoRXh0ID0gaXNXaW5kb3dzID8gcGF0aEV4dEV4ZS5zcGxpdChjb2xvbikgOiBbJyddXG5cbiAgaWYgKGlzV2luZG93cykge1xuICAgIGlmIChjbWQuaW5kZXhPZignLicpICE9PSAtMSAmJiBwYXRoRXh0WzBdICE9PSAnJylcbiAgICAgIHBhdGhFeHQudW5zaGlmdCgnJylcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgcGF0aEVudixcbiAgICBwYXRoRXh0LFxuICAgIHBhdGhFeHRFeGUsXG4gIH1cbn1cblxuY29uc3Qgd2hpY2ggPSAoY21kLCBvcHQsIGNiKSA9PiB7XG4gIGlmICh0eXBlb2Ygb3B0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY2IgPSBvcHRcbiAgICBvcHQgPSB7fVxuICB9XG4gIGlmICghb3B0KVxuICAgIG9wdCA9IHt9XG5cbiAgY29uc3QgeyBwYXRoRW52LCBwYXRoRXh0LCBwYXRoRXh0RXhlIH0gPSBnZXRQYXRoSW5mbyhjbWQsIG9wdClcbiAgY29uc3QgZm91bmQgPSBbXVxuXG4gIGNvbnN0IHN0ZXAgPSBpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBpZiAoaSA9PT0gcGF0aEVudi5sZW5ndGgpXG4gICAgICByZXR1cm4gb3B0LmFsbCAmJiBmb3VuZC5sZW5ndGggPyByZXNvbHZlKGZvdW5kKVxuICAgICAgICA6IHJlamVjdChnZXROb3RGb3VuZEVycm9yKGNtZCkpXG5cbiAgICBjb25zdCBwcFJhdyA9IHBhdGhFbnZbaV1cbiAgICBjb25zdCBwYXRoUGFydCA9IC9eXCIuKlwiJC8udGVzdChwcFJhdykgPyBwcFJhdy5zbGljZSgxLCAtMSkgOiBwcFJhd1xuXG4gICAgY29uc3QgcENtZCA9IHBhdGguam9pbihwYXRoUGFydCwgY21kKVxuICAgIGNvbnN0IHAgPSAhcGF0aFBhcnQgJiYgL15cXC5bXFxcXFxcL10vLnRlc3QoY21kKSA/IGNtZC5zbGljZSgwLCAyKSArIHBDbWRcbiAgICAgIDogcENtZFxuXG4gICAgcmVzb2x2ZShzdWJTdGVwKHAsIGksIDApKVxuICB9KVxuXG4gIGNvbnN0IHN1YlN0ZXAgPSAocCwgaSwgaWkpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBpZiAoaWkgPT09IHBhdGhFeHQubGVuZ3RoKVxuICAgICAgcmV0dXJuIHJlc29sdmUoc3RlcChpICsgMSkpXG4gICAgY29uc3QgZXh0ID0gcGF0aEV4dFtpaV1cbiAgICBpc2V4ZShwICsgZXh0LCB7IHBhdGhFeHQ6IHBhdGhFeHRFeGUgfSwgKGVyLCBpcykgPT4ge1xuICAgICAgaWYgKCFlciAmJiBpcykge1xuICAgICAgICBpZiAob3B0LmFsbClcbiAgICAgICAgICBmb3VuZC5wdXNoKHAgKyBleHQpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZShwICsgZXh0KVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc29sdmUoc3ViU3RlcChwLCBpLCBpaSArIDEpKVxuICAgIH0pXG4gIH0pXG5cbiAgcmV0dXJuIGNiID8gc3RlcCgwKS50aGVuKHJlcyA9PiBjYihudWxsLCByZXMpLCBjYikgOiBzdGVwKDApXG59XG5cbmNvbnN0IHdoaWNoU3luYyA9IChjbWQsIG9wdCkgPT4ge1xuICBvcHQgPSBvcHQgfHwge31cblxuICBjb25zdCB7IHBhdGhFbnYsIHBhdGhFeHQsIHBhdGhFeHRFeGUgfSA9IGdldFBhdGhJbmZvKGNtZCwgb3B0KVxuICBjb25zdCBmb3VuZCA9IFtdXG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXRoRW52Lmxlbmd0aDsgaSArKykge1xuICAgIGNvbnN0IHBwUmF3ID0gcGF0aEVudltpXVxuICAgIGNvbnN0IHBhdGhQYXJ0ID0gL15cIi4qXCIkLy50ZXN0KHBwUmF3KSA/IHBwUmF3LnNsaWNlKDEsIC0xKSA6IHBwUmF3XG5cbiAgICBjb25zdCBwQ21kID0gcGF0aC5qb2luKHBhdGhQYXJ0LCBjbWQpXG4gICAgY29uc3QgcCA9ICFwYXRoUGFydCAmJiAvXlxcLltcXFxcXFwvXS8udGVzdChjbWQpID8gY21kLnNsaWNlKDAsIDIpICsgcENtZFxuICAgICAgOiBwQ21kXG5cbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IHBhdGhFeHQubGVuZ3RoOyBqICsrKSB7XG4gICAgICBjb25zdCBjdXIgPSBwICsgcGF0aEV4dFtqXVxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgaXMgPSBpc2V4ZS5zeW5jKGN1ciwgeyBwYXRoRXh0OiBwYXRoRXh0RXhlIH0pXG4gICAgICAgIGlmIChpcykge1xuICAgICAgICAgIGlmIChvcHQuYWxsKVxuICAgICAgICAgICAgZm91bmQucHVzaChjdXIpXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIGN1clxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChleCkge31cbiAgICB9XG4gIH1cblxuICBpZiAob3B0LmFsbCAmJiBmb3VuZC5sZW5ndGgpXG4gICAgcmV0dXJuIGZvdW5kXG5cbiAgaWYgKG9wdC5ub3Rocm93KVxuICAgIHJldHVybiBudWxsXG5cbiAgdGhyb3cgZ2V0Tm90Rm91bmRFcnJvcihjbWQpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gd2hpY2hcbndoaWNoLnN5bmMgPSB3aGljaFN5bmNcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBwYXRoS2V5ID0gKG9wdGlvbnMgPSB7fSkgPT4ge1xuXHRjb25zdCBlbnZpcm9ubWVudCA9IG9wdGlvbnMuZW52IHx8IHByb2Nlc3MuZW52O1xuXHRjb25zdCBwbGF0Zm9ybSA9IG9wdGlvbnMucGxhdGZvcm0gfHwgcHJvY2Vzcy5wbGF0Zm9ybTtcblxuXHRpZiAocGxhdGZvcm0gIT09ICd3aW4zMicpIHtcblx0XHRyZXR1cm4gJ1BBVEgnO1xuXHR9XG5cblx0cmV0dXJuIE9iamVjdC5rZXlzKGVudmlyb25tZW50KS5yZXZlcnNlKCkuZmluZChrZXkgPT4ga2V5LnRvVXBwZXJDYXNlKCkgPT09ICdQQVRIJykgfHwgJ1BhdGgnO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBwYXRoS2V5O1xuLy8gVE9ETzogUmVtb3ZlIHRoaXMgZm9yIHRoZSBuZXh0IG1ham9yIHJlbGVhc2Vcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBwYXRoS2V5O1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCB3aGljaCA9IHJlcXVpcmUoJ3doaWNoJyk7XG5jb25zdCBnZXRQYXRoS2V5ID0gcmVxdWlyZSgncGF0aC1rZXknKTtcblxuZnVuY3Rpb24gcmVzb2x2ZUNvbW1hbmRBdHRlbXB0KHBhcnNlZCwgd2l0aG91dFBhdGhFeHQpIHtcbiAgICBjb25zdCBlbnYgPSBwYXJzZWQub3B0aW9ucy5lbnYgfHwgcHJvY2Vzcy5lbnY7XG4gICAgY29uc3QgY3dkID0gcHJvY2Vzcy5jd2QoKTtcbiAgICBjb25zdCBoYXNDdXN0b21Dd2QgPSBwYXJzZWQub3B0aW9ucy5jd2QgIT0gbnVsbDtcbiAgICAvLyBXb3JrZXIgdGhyZWFkcyBkbyBub3QgaGF2ZSBwcm9jZXNzLmNoZGlyKClcbiAgICBjb25zdCBzaG91bGRTd2l0Y2hDd2QgPSBoYXNDdXN0b21Dd2QgJiYgcHJvY2Vzcy5jaGRpciAhPT0gdW5kZWZpbmVkICYmICFwcm9jZXNzLmNoZGlyLmRpc2FibGVkO1xuXG4gICAgLy8gSWYgYSBjdXN0b20gYGN3ZGAgd2FzIHNwZWNpZmllZCwgd2UgbmVlZCB0byBjaGFuZ2UgdGhlIHByb2Nlc3MgY3dkXG4gICAgLy8gYmVjYXVzZSBgd2hpY2hgIHdpbGwgZG8gc3RhdCBjYWxscyBidXQgZG9lcyBub3Qgc3VwcG9ydCBhIGN1c3RvbSBjd2RcbiAgICBpZiAoc2hvdWxkU3dpdGNoQ3dkKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBwcm9jZXNzLmNoZGlyKHBhcnNlZC5vcHRpb25zLmN3ZCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgLyogRW1wdHkgKi9cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGxldCByZXNvbHZlZDtcblxuICAgIHRyeSB7XG4gICAgICAgIHJlc29sdmVkID0gd2hpY2guc3luYyhwYXJzZWQuY29tbWFuZCwge1xuICAgICAgICAgICAgcGF0aDogZW52W2dldFBhdGhLZXkoeyBlbnYgfSldLFxuICAgICAgICAgICAgcGF0aEV4dDogd2l0aG91dFBhdGhFeHQgPyBwYXRoLmRlbGltaXRlciA6IHVuZGVmaW5lZCxcbiAgICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvKiBFbXB0eSAqL1xuICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChzaG91bGRTd2l0Y2hDd2QpIHtcbiAgICAgICAgICAgIHByb2Nlc3MuY2hkaXIoY3dkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIElmIHdlIHN1Y2Nlc3NmdWxseSByZXNvbHZlZCwgZW5zdXJlIHRoYXQgYW4gYWJzb2x1dGUgcGF0aCBpcyByZXR1cm5lZFxuICAgIC8vIE5vdGUgdGhhdCB3aGVuIGEgY3VzdG9tIGBjd2RgIHdhcyB1c2VkLCB3ZSBuZWVkIHRvIHJlc29sdmUgdG8gYW4gYWJzb2x1dGUgcGF0aCBiYXNlZCBvbiBpdFxuICAgIGlmIChyZXNvbHZlZCkge1xuICAgICAgICByZXNvbHZlZCA9IHBhdGgucmVzb2x2ZShoYXNDdXN0b21Dd2QgPyBwYXJzZWQub3B0aW9ucy5jd2QgOiAnJywgcmVzb2x2ZWQpO1xuICAgIH1cblxuICAgIHJldHVybiByZXNvbHZlZDtcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZUNvbW1hbmQocGFyc2VkKSB7XG4gICAgcmV0dXJuIHJlc29sdmVDb21tYW5kQXR0ZW1wdChwYXJzZWQpIHx8IHJlc29sdmVDb21tYW5kQXR0ZW1wdChwYXJzZWQsIHRydWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHJlc29sdmVDb21tYW5kO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbi8vIFNlZSBodHRwOi8vd3d3LnJvYnZhbmRlcndvdWRlLmNvbS9lc2NhcGVjaGFycy5waHBcbmNvbnN0IG1ldGFDaGFyc1JlZ0V4cCA9IC8oWygpXFxdWyUhXlwiYDw+Jnw7LCAqP10pL2c7XG5cbmZ1bmN0aW9uIGVzY2FwZUNvbW1hbmQoYXJnKSB7XG4gICAgLy8gRXNjYXBlIG1ldGEgY2hhcnNcbiAgICBhcmcgPSBhcmcucmVwbGFjZShtZXRhQ2hhcnNSZWdFeHAsICdeJDEnKTtcblxuICAgIHJldHVybiBhcmc7XG59XG5cbmZ1bmN0aW9uIGVzY2FwZUFyZ3VtZW50KGFyZywgZG91YmxlRXNjYXBlTWV0YUNoYXJzKSB7XG4gICAgLy8gQ29udmVydCB0byBzdHJpbmdcbiAgICBhcmcgPSBgJHthcmd9YDtcblxuICAgIC8vIEFsZ29yaXRobSBiZWxvdyBpcyBiYXNlZCBvbiBodHRwczovL3FudG0ub3JnL2NtZFxuICAgIC8vIEl0J3Mgc2xpZ2h0bHkgYWx0ZXJlZCB0byBkaXNhYmxlIEpTIGJhY2t0cmFja2luZyB0byBhdm9pZCBoYW5naW5nIG9uIHNwZWNpYWxseSBjcmFmdGVkIGlucHV0XG4gICAgLy8gUGxlYXNlIHNlZSBodHRwczovL2dpdGh1Yi5jb20vbW94eXN0dWRpby9ub2RlLWNyb3NzLXNwYXduL3B1bGwvMTYwIGZvciBtb3JlIGluZm9ybWF0aW9uXG5cbiAgICAvLyBTZXF1ZW5jZSBvZiBiYWNrc2xhc2hlcyBmb2xsb3dlZCBieSBhIGRvdWJsZSBxdW90ZTpcbiAgICAvLyBkb3VibGUgdXAgYWxsIHRoZSBiYWNrc2xhc2hlcyBhbmQgZXNjYXBlIHRoZSBkb3VibGUgcXVvdGVcbiAgICBhcmcgPSBhcmcucmVwbGFjZSgvKD89KFxcXFwrPyk/KVxcMVwiL2csICckMSQxXFxcXFwiJyk7XG5cbiAgICAvLyBTZXF1ZW5jZSBvZiBiYWNrc2xhc2hlcyBmb2xsb3dlZCBieSB0aGUgZW5kIG9mIHRoZSBzdHJpbmdcbiAgICAvLyAod2hpY2ggd2lsbCBiZWNvbWUgYSBkb3VibGUgcXVvdGUgbGF0ZXIpOlxuICAgIC8vIGRvdWJsZSB1cCBhbGwgdGhlIGJhY2tzbGFzaGVzXG4gICAgYXJnID0gYXJnLnJlcGxhY2UoLyg/PShcXFxcKz8pPylcXDEkLywgJyQxJDEnKTtcblxuICAgIC8vIEFsbCBvdGhlciBiYWNrc2xhc2hlcyBvY2N1ciBsaXRlcmFsbHlcblxuICAgIC8vIFF1b3RlIHRoZSB3aG9sZSB0aGluZzpcbiAgICBhcmcgPSBgXCIke2FyZ31cImA7XG5cbiAgICAvLyBFc2NhcGUgbWV0YSBjaGFyc1xuICAgIGFyZyA9IGFyZy5yZXBsYWNlKG1ldGFDaGFyc1JlZ0V4cCwgJ14kMScpO1xuXG4gICAgLy8gRG91YmxlIGVzY2FwZSBtZXRhIGNoYXJzIGlmIG5lY2Vzc2FyeVxuICAgIGlmIChkb3VibGVFc2NhcGVNZXRhQ2hhcnMpIHtcbiAgICAgICAgYXJnID0gYXJnLnJlcGxhY2UobWV0YUNoYXJzUmVnRXhwLCAnXiQxJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFyZztcbn1cblxubW9kdWxlLmV4cG9ydHMuY29tbWFuZCA9IGVzY2FwZUNvbW1hbmQ7XG5tb2R1bGUuZXhwb3J0cy5hcmd1bWVudCA9IGVzY2FwZUFyZ3VtZW50O1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IC9eIyEoLiopLztcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuY29uc3Qgc2hlYmFuZ1JlZ2V4ID0gcmVxdWlyZSgnc2hlYmFuZy1yZWdleCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChzdHJpbmcgPSAnJykgPT4ge1xuXHRjb25zdCBtYXRjaCA9IHN0cmluZy5tYXRjaChzaGViYW5nUmVnZXgpO1xuXG5cdGlmICghbWF0Y2gpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdGNvbnN0IFtwYXRoLCBhcmd1bWVudF0gPSBtYXRjaFswXS5yZXBsYWNlKC8jISA/LywgJycpLnNwbGl0KCcgJyk7XG5cdGNvbnN0IGJpbmFyeSA9IHBhdGguc3BsaXQoJy8nKS5wb3AoKTtcblxuXHRpZiAoYmluYXJ5ID09PSAnZW52Jykge1xuXHRcdHJldHVybiBhcmd1bWVudDtcblx0fVxuXG5cdHJldHVybiBhcmd1bWVudCA/IGAke2JpbmFyeX0gJHthcmd1bWVudH1gIDogYmluYXJ5O1xufTtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5jb25zdCBzaGViYW5nQ29tbWFuZCA9IHJlcXVpcmUoJ3NoZWJhbmctY29tbWFuZCcpO1xuXG5mdW5jdGlvbiByZWFkU2hlYmFuZyhjb21tYW5kKSB7XG4gICAgLy8gUmVhZCB0aGUgZmlyc3QgMTUwIGJ5dGVzIGZyb20gdGhlIGZpbGVcbiAgICBjb25zdCBzaXplID0gMTUwO1xuICAgIGNvbnN0IGJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyhzaXplKTtcblxuICAgIGxldCBmZDtcblxuICAgIHRyeSB7XG4gICAgICAgIGZkID0gZnMub3BlblN5bmMoY29tbWFuZCwgJ3InKTtcbiAgICAgICAgZnMucmVhZFN5bmMoZmQsIGJ1ZmZlciwgMCwgc2l6ZSwgMCk7XG4gICAgICAgIGZzLmNsb3NlU3luYyhmZCk7XG4gICAgfSBjYXRjaCAoZSkgeyAvKiBFbXB0eSAqLyB9XG5cbiAgICAvLyBBdHRlbXB0IHRvIGV4dHJhY3Qgc2hlYmFuZyAobnVsbCBpcyByZXR1cm5lZCBpZiBub3QgYSBzaGViYW5nKVxuICAgIHJldHVybiBzaGViYW5nQ29tbWFuZChidWZmZXIudG9TdHJpbmcoKSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcmVhZFNoZWJhbmc7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IHJlc29sdmVDb21tYW5kID0gcmVxdWlyZSgnLi91dGlsL3Jlc29sdmVDb21tYW5kJyk7XG5jb25zdCBlc2NhcGUgPSByZXF1aXJlKCcuL3V0aWwvZXNjYXBlJyk7XG5jb25zdCByZWFkU2hlYmFuZyA9IHJlcXVpcmUoJy4vdXRpbC9yZWFkU2hlYmFuZycpO1xuXG5jb25zdCBpc1dpbiA9IHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMic7XG5jb25zdCBpc0V4ZWN1dGFibGVSZWdFeHAgPSAvXFwuKD86Y29tfGV4ZSkkL2k7XG5jb25zdCBpc0NtZFNoaW1SZWdFeHAgPSAvbm9kZV9tb2R1bGVzW1xcXFwvXS5iaW5bXFxcXC9dW15cXFxcL10rXFwuY21kJC9pO1xuXG5mdW5jdGlvbiBkZXRlY3RTaGViYW5nKHBhcnNlZCkge1xuICAgIHBhcnNlZC5maWxlID0gcmVzb2x2ZUNvbW1hbmQocGFyc2VkKTtcblxuICAgIGNvbnN0IHNoZWJhbmcgPSBwYXJzZWQuZmlsZSAmJiByZWFkU2hlYmFuZyhwYXJzZWQuZmlsZSk7XG5cbiAgICBpZiAoc2hlYmFuZykge1xuICAgICAgICBwYXJzZWQuYXJncy51bnNoaWZ0KHBhcnNlZC5maWxlKTtcbiAgICAgICAgcGFyc2VkLmNvbW1hbmQgPSBzaGViYW5nO1xuXG4gICAgICAgIHJldHVybiByZXNvbHZlQ29tbWFuZChwYXJzZWQpO1xuICAgIH1cblxuICAgIHJldHVybiBwYXJzZWQuZmlsZTtcbn1cblxuZnVuY3Rpb24gcGFyc2VOb25TaGVsbChwYXJzZWQpIHtcbiAgICBpZiAoIWlzV2luKSB7XG4gICAgICAgIHJldHVybiBwYXJzZWQ7XG4gICAgfVxuXG4gICAgLy8gRGV0ZWN0ICYgYWRkIHN1cHBvcnQgZm9yIHNoZWJhbmdzXG4gICAgY29uc3QgY29tbWFuZEZpbGUgPSBkZXRlY3RTaGViYW5nKHBhcnNlZCk7XG5cbiAgICAvLyBXZSBkb24ndCBuZWVkIGEgc2hlbGwgaWYgdGhlIGNvbW1hbmQgZmlsZW5hbWUgaXMgYW4gZXhlY3V0YWJsZVxuICAgIGNvbnN0IG5lZWRzU2hlbGwgPSAhaXNFeGVjdXRhYmxlUmVnRXhwLnRlc3QoY29tbWFuZEZpbGUpO1xuXG4gICAgLy8gSWYgYSBzaGVsbCBpcyByZXF1aXJlZCwgdXNlIGNtZC5leGUgYW5kIHRha2UgY2FyZSBvZiBlc2NhcGluZyBldmVyeXRoaW5nIGNvcnJlY3RseVxuICAgIC8vIE5vdGUgdGhhdCBgZm9yY2VTaGVsbGAgaXMgYW4gaGlkZGVuIG9wdGlvbiB1c2VkIG9ubHkgaW4gdGVzdHNcbiAgICBpZiAocGFyc2VkLm9wdGlvbnMuZm9yY2VTaGVsbCB8fCBuZWVkc1NoZWxsKSB7XG4gICAgICAgIC8vIE5lZWQgdG8gZG91YmxlIGVzY2FwZSBtZXRhIGNoYXJzIGlmIHRoZSBjb21tYW5kIGlzIGEgY21kLXNoaW0gbG9jYXRlZCBpbiBgbm9kZV9tb2R1bGVzLy5iaW4vYFxuICAgICAgICAvLyBUaGUgY21kLXNoaW0gc2ltcGx5IGNhbGxzIGV4ZWN1dGUgdGhlIHBhY2thZ2UgYmluIGZpbGUgd2l0aCBOb2RlSlMsIHByb3h5aW5nIGFueSBhcmd1bWVudFxuICAgICAgICAvLyBCZWNhdXNlIHRoZSBlc2NhcGUgb2YgbWV0YWNoYXJzIHdpdGggXiBnZXRzIGludGVycHJldGVkIHdoZW4gdGhlIGNtZC5leGUgaXMgZmlyc3QgY2FsbGVkLFxuICAgICAgICAvLyB3ZSBuZWVkIHRvIGRvdWJsZSBlc2NhcGUgdGhlbVxuICAgICAgICBjb25zdCBuZWVkc0RvdWJsZUVzY2FwZU1ldGFDaGFycyA9IGlzQ21kU2hpbVJlZ0V4cC50ZXN0KGNvbW1hbmRGaWxlKTtcblxuICAgICAgICAvLyBOb3JtYWxpemUgcG9zaXggcGF0aHMgaW50byBPUyBjb21wYXRpYmxlIHBhdGhzIChlLmcuOiBmb28vYmFyIC0+IGZvb1xcYmFyKVxuICAgICAgICAvLyBUaGlzIGlzIG5lY2Vzc2FyeSBvdGhlcndpc2UgaXQgd2lsbCBhbHdheXMgZmFpbCB3aXRoIEVOT0VOVCBpbiB0aG9zZSBjYXNlc1xuICAgICAgICBwYXJzZWQuY29tbWFuZCA9IHBhdGgubm9ybWFsaXplKHBhcnNlZC5jb21tYW5kKTtcblxuICAgICAgICAvLyBFc2NhcGUgY29tbWFuZCAmIGFyZ3VtZW50c1xuICAgICAgICBwYXJzZWQuY29tbWFuZCA9IGVzY2FwZS5jb21tYW5kKHBhcnNlZC5jb21tYW5kKTtcbiAgICAgICAgcGFyc2VkLmFyZ3MgPSBwYXJzZWQuYXJncy5tYXAoKGFyZykgPT4gZXNjYXBlLmFyZ3VtZW50KGFyZywgbmVlZHNEb3VibGVFc2NhcGVNZXRhQ2hhcnMpKTtcblxuICAgICAgICBjb25zdCBzaGVsbENvbW1hbmQgPSBbcGFyc2VkLmNvbW1hbmRdLmNvbmNhdChwYXJzZWQuYXJncykuam9pbignICcpO1xuXG4gICAgICAgIHBhcnNlZC5hcmdzID0gWycvZCcsICcvcycsICcvYycsIGBcIiR7c2hlbGxDb21tYW5kfVwiYF07XG4gICAgICAgIHBhcnNlZC5jb21tYW5kID0gcHJvY2Vzcy5lbnYuY29tc3BlYyB8fCAnY21kLmV4ZSc7XG4gICAgICAgIHBhcnNlZC5vcHRpb25zLndpbmRvd3NWZXJiYXRpbUFyZ3VtZW50cyA9IHRydWU7IC8vIFRlbGwgbm9kZSdzIHNwYXduIHRoYXQgdGhlIGFyZ3VtZW50cyBhcmUgYWxyZWFkeSBlc2NhcGVkXG4gICAgfVxuXG4gICAgcmV0dXJuIHBhcnNlZDtcbn1cblxuZnVuY3Rpb24gcGFyc2UoY29tbWFuZCwgYXJncywgb3B0aW9ucykge1xuICAgIC8vIE5vcm1hbGl6ZSBhcmd1bWVudHMsIHNpbWlsYXIgdG8gbm9kZWpzXG4gICAgaWYgKGFyZ3MgJiYgIUFycmF5LmlzQXJyYXkoYXJncykpIHtcbiAgICAgICAgb3B0aW9ucyA9IGFyZ3M7XG4gICAgICAgIGFyZ3MgPSBudWxsO1xuICAgIH1cblxuICAgIGFyZ3MgPSBhcmdzID8gYXJncy5zbGljZSgwKSA6IFtdOyAvLyBDbG9uZSBhcnJheSB0byBhdm9pZCBjaGFuZ2luZyB0aGUgb3JpZ2luYWxcbiAgICBvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgb3B0aW9ucyk7IC8vIENsb25lIG9iamVjdCB0byBhdm9pZCBjaGFuZ2luZyB0aGUgb3JpZ2luYWxcblxuICAgIC8vIEJ1aWxkIG91ciBwYXJzZWQgb2JqZWN0XG4gICAgY29uc3QgcGFyc2VkID0ge1xuICAgICAgICBjb21tYW5kLFxuICAgICAgICBhcmdzLFxuICAgICAgICBvcHRpb25zLFxuICAgICAgICBmaWxlOiB1bmRlZmluZWQsXG4gICAgICAgIG9yaWdpbmFsOiB7XG4gICAgICAgICAgICBjb21tYW5kLFxuICAgICAgICAgICAgYXJncyxcbiAgICAgICAgfSxcbiAgICB9O1xuXG4gICAgLy8gRGVsZWdhdGUgZnVydGhlciBwYXJzaW5nIHRvIHNoZWxsIG9yIG5vbi1zaGVsbFxuICAgIHJldHVybiBvcHRpb25zLnNoZWxsID8gcGFyc2VkIDogcGFyc2VOb25TaGVsbChwYXJzZWQpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHBhcnNlO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbmNvbnN0IGlzV2luID0gcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJztcblxuZnVuY3Rpb24gbm90Rm91bmRFcnJvcihvcmlnaW5hbCwgc3lzY2FsbCkge1xuICAgIHJldHVybiBPYmplY3QuYXNzaWduKG5ldyBFcnJvcihgJHtzeXNjYWxsfSAke29yaWdpbmFsLmNvbW1hbmR9IEVOT0VOVGApLCB7XG4gICAgICAgIGNvZGU6ICdFTk9FTlQnLFxuICAgICAgICBlcnJubzogJ0VOT0VOVCcsXG4gICAgICAgIHN5c2NhbGw6IGAke3N5c2NhbGx9ICR7b3JpZ2luYWwuY29tbWFuZH1gLFxuICAgICAgICBwYXRoOiBvcmlnaW5hbC5jb21tYW5kLFxuICAgICAgICBzcGF3bmFyZ3M6IG9yaWdpbmFsLmFyZ3MsXG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGhvb2tDaGlsZFByb2Nlc3MoY3AsIHBhcnNlZCkge1xuICAgIGlmICghaXNXaW4pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IG9yaWdpbmFsRW1pdCA9IGNwLmVtaXQ7XG5cbiAgICBjcC5lbWl0ID0gZnVuY3Rpb24gKG5hbWUsIGFyZzEpIHtcbiAgICAgICAgLy8gSWYgZW1pdHRpbmcgXCJleGl0XCIgZXZlbnQgYW5kIGV4aXQgY29kZSBpcyAxLCB3ZSBuZWVkIHRvIGNoZWNrIGlmXG4gICAgICAgIC8vIHRoZSBjb21tYW5kIGV4aXN0cyBhbmQgZW1pdCBhbiBcImVycm9yXCIgaW5zdGVhZFxuICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL0luZGlnb1VuaXRlZC9ub2RlLWNyb3NzLXNwYXduL2lzc3Vlcy8xNlxuICAgICAgICBpZiAobmFtZSA9PT0gJ2V4aXQnKSB7XG4gICAgICAgICAgICBjb25zdCBlcnIgPSB2ZXJpZnlFTk9FTlQoYXJnMSwgcGFyc2VkKTtcblxuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbEVtaXQuY2FsbChjcCwgJ2Vycm9yJywgZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBvcmlnaW5hbEVtaXQuYXBwbHkoY3AsIGFyZ3VtZW50cyk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcHJlZmVyLXJlc3QtcGFyYW1zXG4gICAgfTtcbn1cblxuZnVuY3Rpb24gdmVyaWZ5RU5PRU5UKHN0YXR1cywgcGFyc2VkKSB7XG4gICAgaWYgKGlzV2luICYmIHN0YXR1cyA9PT0gMSAmJiAhcGFyc2VkLmZpbGUpIHtcbiAgICAgICAgcmV0dXJuIG5vdEZvdW5kRXJyb3IocGFyc2VkLm9yaWdpbmFsLCAnc3Bhd24nKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gdmVyaWZ5RU5PRU5UU3luYyhzdGF0dXMsIHBhcnNlZCkge1xuICAgIGlmIChpc1dpbiAmJiBzdGF0dXMgPT09IDEgJiYgIXBhcnNlZC5maWxlKSB7XG4gICAgICAgIHJldHVybiBub3RGb3VuZEVycm9yKHBhcnNlZC5vcmlnaW5hbCwgJ3NwYXduU3luYycpO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBob29rQ2hpbGRQcm9jZXNzLFxuICAgIHZlcmlmeUVOT0VOVCxcbiAgICB2ZXJpZnlFTk9FTlRTeW5jLFxuICAgIG5vdEZvdW5kRXJyb3IsXG59O1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbmNvbnN0IGNwID0gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpO1xuY29uc3QgcGFyc2UgPSByZXF1aXJlKCcuL2xpYi9wYXJzZScpO1xuY29uc3QgZW5vZW50ID0gcmVxdWlyZSgnLi9saWIvZW5vZW50Jyk7XG5cbmZ1bmN0aW9uIHNwYXduKGNvbW1hbmQsIGFyZ3MsIG9wdGlvbnMpIHtcbiAgICAvLyBQYXJzZSB0aGUgYXJndW1lbnRzXG4gICAgY29uc3QgcGFyc2VkID0gcGFyc2UoY29tbWFuZCwgYXJncywgb3B0aW9ucyk7XG5cbiAgICAvLyBTcGF3biB0aGUgY2hpbGQgcHJvY2Vzc1xuICAgIGNvbnN0IHNwYXduZWQgPSBjcC5zcGF3bihwYXJzZWQuY29tbWFuZCwgcGFyc2VkLmFyZ3MsIHBhcnNlZC5vcHRpb25zKTtcblxuICAgIC8vIEhvb2sgaW50byBjaGlsZCBwcm9jZXNzIFwiZXhpdFwiIGV2ZW50IHRvIGVtaXQgYW4gZXJyb3IgaWYgdGhlIGNvbW1hbmRcbiAgICAvLyBkb2VzIG5vdCBleGlzdHMsIHNlZTogaHR0cHM6Ly9naXRodWIuY29tL0luZGlnb1VuaXRlZC9ub2RlLWNyb3NzLXNwYXduL2lzc3Vlcy8xNlxuICAgIGVub2VudC5ob29rQ2hpbGRQcm9jZXNzKHNwYXduZWQsIHBhcnNlZCk7XG5cbiAgICByZXR1cm4gc3Bhd25lZDtcbn1cblxuZnVuY3Rpb24gc3Bhd25TeW5jKGNvbW1hbmQsIGFyZ3MsIG9wdGlvbnMpIHtcbiAgICAvLyBQYXJzZSB0aGUgYXJndW1lbnRzXG4gICAgY29uc3QgcGFyc2VkID0gcGFyc2UoY29tbWFuZCwgYXJncywgb3B0aW9ucyk7XG5cbiAgICAvLyBTcGF3biB0aGUgY2hpbGQgcHJvY2Vzc1xuICAgIGNvbnN0IHJlc3VsdCA9IGNwLnNwYXduU3luYyhwYXJzZWQuY29tbWFuZCwgcGFyc2VkLmFyZ3MsIHBhcnNlZC5vcHRpb25zKTtcblxuICAgIC8vIEFuYWx5emUgaWYgdGhlIGNvbW1hbmQgZG9lcyBub3QgZXhpc3QsIHNlZTogaHR0cHM6Ly9naXRodWIuY29tL0luZGlnb1VuaXRlZC9ub2RlLWNyb3NzLXNwYXduL2lzc3Vlcy8xNlxuICAgIHJlc3VsdC5lcnJvciA9IHJlc3VsdC5lcnJvciB8fCBlbm9lbnQudmVyaWZ5RU5PRU5UU3luYyhyZXN1bHQuc3RhdHVzLCBwYXJzZWQpO1xuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzcGF3bjtcbm1vZHVsZS5leHBvcnRzLnNwYXduID0gc3Bhd247XG5tb2R1bGUuZXhwb3J0cy5zeW5jID0gc3Bhd25TeW5jO1xuXG5tb2R1bGUuZXhwb3J0cy5fcGFyc2UgPSBwYXJzZTtcbm1vZHVsZS5leHBvcnRzLl9lbm9lbnQgPSBlbm9lbnQ7XG4iLAogICAgIi8qKlxuICogT3BlbkNvZGUgU0RLIEJhY2tlbmQgV3JhcHBlclxuICpcbiAqIFByb3ZpZGVzIHNlc3Npb24gbWFuYWdlbWVudCBhbmQgbWVzc2FnZSBzZW5kaW5nIGNhcGFiaWxpdGllc1xuICogZm9yIGFpLWVuZyByYWxwaCBydW5uZXIgdXNpbmcgT3BlbkNvZGUgU0RLLlxuICovXG5cbmltcG9ydCB7IGNyZWF0ZVNlcnZlciB9IGZyb20gXCJub2RlOm5ldFwiO1xuaW1wb3J0IHtcbiAgICB0eXBlIE9wZW5jb2RlQ2xpZW50LFxuICAgIGNyZWF0ZU9wZW5jb2RlLFxuICAgIGNyZWF0ZU9wZW5jb2RlQ2xpZW50LFxufSBmcm9tIFwiQG9wZW5jb2RlLWFpL3Nka1wiO1xuaW1wb3J0IHsgTG9nIH0gZnJvbSBcIi4uLy4uL3V0aWwvbG9nXCI7XG5cbmNvbnN0IGxvZyA9IExvZy5jcmVhdGUoeyBzZXJ2aWNlOiBcIm9wZW5jb2RlLWNsaWVudFwiIH0pO1xuXG4vKipcbiAqIFJlc3BvbnNlIGludGVyZmFjZSBmb3IgbWVzc2FnZXNcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBNZXNzYWdlUmVzcG9uc2Uge1xuICAgIGNvbnRlbnQ6IHN0cmluZztcbn1cblxuLyoqXG4gKiBTdHJlYW1pbmcgcmVzcG9uc2UgaW50ZXJmYWNlXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU3RyZWFtaW5nUmVzcG9uc2Uge1xuICAgIC8qKiBSZWFkYWJsZSBzdHJlYW0gb2YgcmVzcG9uc2UgY2h1bmtzICovXG4gICAgc3RyZWFtOiBSZWFkYWJsZVN0cmVhbTxVaW50OEFycmF5PjtcbiAgICAvKiogUHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGNvbXBsZXRlIHJlc3BvbnNlIHdoZW4gc3RyZWFtIGVuZHMgKi9cbiAgICBjb21wbGV0ZTogUHJvbWlzZTxNZXNzYWdlUmVzcG9uc2U+O1xufVxuXG4vKipcbiAqIFNlc3Npb24gaW50ZXJmYWNlIGZvciBhaS1lbmcgcnVubmVyXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU2Vzc2lvbiB7XG4gICAgaWQ6IHN0cmluZztcbiAgICBzZW5kTWVzc2FnZTogKG1lc3NhZ2U6IHN0cmluZykgPT4gUHJvbWlzZTxNZXNzYWdlUmVzcG9uc2U+O1xuICAgIHNlbmRNZXNzYWdlU3RyZWFtOiAobWVzc2FnZTogc3RyaW5nKSA9PiBQcm9taXNlPFN0cmVhbWluZ1Jlc3BvbnNlPjtcbiAgICBjbG9zZTogKCkgPT4gUHJvbWlzZTx2b2lkPjtcbiAgICAvKiogVG9vbCBpbnZvY2F0aW9ucyBjYXB0dXJlZCBkdXJpbmcgdGhpcyBzZXNzaW9uICovXG4gICAgX3Rvb2xJbnZvY2F0aW9ucz86IEFycmF5PHtcbiAgICAgICAgaWQ6IHN0cmluZztcbiAgICAgICAgbmFtZTogc3RyaW5nO1xuICAgICAgICBpbnB1dD86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgICAgICBvdXRwdXQ/OiBzdHJpbmc7XG4gICAgICAgIHN0YXR1czogXCJva1wiIHwgXCJlcnJvclwiO1xuICAgICAgICBlcnJvcj86IHN0cmluZztcbiAgICAgICAgc3RhcnRlZEF0Pzogc3RyaW5nO1xuICAgICAgICBjb21wbGV0ZWRBdD86IHN0cmluZztcbiAgICB9Pjtcbn1cblxuLyoqXG4gKiBDbGllbnQgY29uZmlndXJhdGlvbiBvcHRpb25zXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ2xpZW50Q29uZmlnIHtcbiAgICAvKiogQ3VzdG9tIGNsaWVudCBpbnN0YW5jZSAoZm9yIHRlc3RpbmcpICovXG4gICAgY2xpZW50PzogT3BlbmNvZGVDbGllbnQ7XG4gICAgLyoqIENvbm5lY3Rpb24gdGltZW91dCBpbiBtaWxsaXNlY29uZHMgKGRlZmF1bHQ6IDEwMDAwKSAqL1xuICAgIHRpbWVvdXQ/OiBudW1iZXI7XG4gICAgLyoqIFJldHJ5IGF0dGVtcHRzIGZvciBmYWlsZWQgb3BlcmF0aW9ucyAqL1xuICAgIHJldHJ5QXR0ZW1wdHM/OiBudW1iZXI7XG4gICAgLyoqIFByb21wdCB0aW1lb3V0IGluIG1pbGxpc2Vjb25kcyAodXNlZCBhcyBhbiBpZGxlIHRpbWVvdXQgZm9yIHN0cmVhbWluZykgKi9cbiAgICBwcm9tcHRUaW1lb3V0PzogbnVtYmVyO1xuICAgIC8qKiBEaXJlY3Rvcnkvd29ya3RyZWUgY29udGV4dCB0byBydW4gT3BlbkNvZGUgaW4gKGRlZmF1bHRzIHRvIHByb2Nlc3MuY3dkKCkpICovXG4gICAgZGlyZWN0b3J5Pzogc3RyaW5nO1xuICAgIC8qKiBVUkwgb2YgZXhpc3RpbmcgT3BlbkNvZGUgc2VydmVyIHRvIHJldXNlIChpZiBwcm92aWRlZCwgd29uJ3Qgc3Bhd24gbmV3IHNlcnZlcikgKi9cbiAgICBleGlzdGluZ1NlcnZlclVybD86IHN0cmluZztcbiAgICAvKiogU2VydmVyIHN0YXJ0dXAgdGltZW91dCBpbiBtaWxsaXNlY29uZHMgKGRlZmF1bHQ6IDEwMDAwKSAqL1xuICAgIHNlcnZlclN0YXJ0dXBUaW1lb3V0PzogbnVtYmVyO1xuICAgIC8qKiBOT1RFOiB3b3JraW5nRGlyIHBhcmFtZXRlciBpcyBub3Qgc3VwcG9ydGVkIGJ5IHRoZSBTREtcbiAgICAgKiBTcGF3bmVkIE9wZW5Db2RlIHNlcnZlcnMgd2lsbCB1c2UgdGhlIGNhbGxpbmcgZGlyZWN0b3J5IGJ5IGRlZmF1bHQgKHByb2Nlc3MuY3dkKCkpXG4gICAgICogVXNlIE9QRU5DT0RFX1VSTCB0byBjb25uZWN0IHRvIGEgZGlmZmVyZW50IE9wZW5Db2RlIGluc3RhbmNlIGluc3RlYWRcbiAgICAgKi9cbn1cblxuLyoqXG4gKiBPcGVuQ29kZSBDbGllbnQgV3JhcHBlclxuICpcbiAqIFdyYXBzIE9wZW5Db2RlIFNESyB0byBwcm92aWRlIHNlc3Npb24gbWFuYWdlbWVudFxuICogYW5kIGVycm9yIGhhbmRsaW5nIGZvciByYWxwaCBydW5uZXIuXG4gKi9cbmV4cG9ydCBjbGFzcyBPcGVuQ29kZUNsaWVudCB7XG4gICAgcHJpdmF0ZSBjbGllbnQ6IE9wZW5jb2RlQ2xpZW50O1xuICAgIHByaXZhdGUgdGltZW91dDogbnVtYmVyO1xuICAgIHByaXZhdGUgcmV0cnlBdHRlbXB0czogbnVtYmVyO1xuICAgIHByaXZhdGUgYWN0aXZlU2Vzc2lvbnM6IE1hcDxzdHJpbmcsIFNlc3Npb24+O1xuICAgIHByaXZhdGUgcHJvbXB0VGltZW91dDogbnVtYmVyO1xuICAgIHByaXZhdGUgZGlyZWN0b3J5OiBzdHJpbmcgPSBwcm9jZXNzLmN3ZCgpO1xuICAgIHByaXZhdGUgc2VydmVyOiB7IHVybDogc3RyaW5nOyBjbG9zZTogKCkgPT4gdm9pZCB9IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBzZXJ2ZXJTdGFydHVwVGltZW91dDogbnVtYmVyO1xuXG4gICAgLyoqXG4gICAgICogUHJpdmF0ZSBjb25zdHJ1Y3RvciAtIHVzZSBzdGF0aWMgY3JlYXRlKCkgZmFjdG9yeSBtZXRob2QgaW5zdGVhZFxuICAgICAqL1xuICAgIHByaXZhdGUgY29uc3RydWN0b3IoXG4gICAgICAgIGNsaWVudDogT3BlbmNvZGVDbGllbnQsXG4gICAgICAgIHNlcnZlcjogeyB1cmw6IHN0cmluZzsgY2xvc2U6ICgpID0+IHZvaWQgfSB8IG51bGwsXG4gICAgICAgIGNvbmZpZzogQ2xpZW50Q29uZmlnID0ge30sXG4gICAgKSB7XG4gICAgICAgIHRoaXMuY2xpZW50ID0gY2xpZW50O1xuICAgICAgICB0aGlzLnNlcnZlciA9IHNlcnZlcjtcbiAgICAgICAgdGhpcy50aW1lb3V0ID0gY29uZmlnLnRpbWVvdXQgfHwgMzAwMDA7XG4gICAgICAgIHRoaXMucmV0cnlBdHRlbXB0cyA9IGNvbmZpZy5yZXRyeUF0dGVtcHRzIHx8IDM7XG5cbiAgICAgICAgY29uc3QgZW52UHJvbXB0VGltZW91dCA9IE51bWJlci5wYXJzZUludChcbiAgICAgICAgICAgIHByb2Nlc3MuZW52Lk9QRU5DT0RFX1BST01QVF9USU1FT1VUX01TID8/IFwiXCIsXG4gICAgICAgICAgICAxMCxcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgcmVzb2x2ZWRQcm9tcHRUaW1lb3V0ID0gTnVtYmVyLmlzRmluaXRlKGVudlByb21wdFRpbWVvdXQpXG4gICAgICAgICAgICA/IGVudlByb21wdFRpbWVvdXRcbiAgICAgICAgICAgIDogdW5kZWZpbmVkO1xuXG4gICAgICAgIC8vIEZvciBzdHJlYW1pbmcsIHRoaXMgYWN0cyBhcyBhbiBpZGxlIHRpbWVvdXQgKHJlc2V0IG9uIHN0cmVhbWVkIGV2ZW50cylcbiAgICAgICAgdGhpcy5wcm9tcHRUaW1lb3V0ID1cbiAgICAgICAgICAgIGNvbmZpZy5wcm9tcHRUaW1lb3V0ID8/IHJlc29sdmVkUHJvbXB0VGltZW91dCA/PyAxMjAwMDA7IC8vIDEyMCBzZWNvbmRzIGRlZmF1bHRcblxuICAgICAgICB0aGlzLmRpcmVjdG9yeSA9XG4gICAgICAgICAgICBjb25maWcuZGlyZWN0b3J5IHx8IHByb2Nlc3MuZW52Lk9QRU5DT0RFX0RJUkVDVE9SWSB8fCBwcm9jZXNzLmN3ZCgpO1xuXG4gICAgICAgIHRoaXMuc2VydmVyU3RhcnR1cFRpbWVvdXQgPSBjb25maWcuc2VydmVyU3RhcnR1cFRpbWVvdXQgfHwgMTAwMDA7IC8vIDEwIHNlY29uZHMgZGVmYXVsdFxuICAgICAgICB0aGlzLmFjdGl2ZVNlc3Npb25zID0gbmV3IE1hcCgpO1xuXG4gICAgICAgIGxvZy5kZWJ1ZyhcIk9wZW5Db2RlQ2xpZW50IGluaXRpYWxpemVkXCIsIHtcbiAgICAgICAgICAgIGhhc093blNlcnZlcjogISF0aGlzLnNlcnZlcixcbiAgICAgICAgICAgIHRpbWVvdXQ6IHRoaXMudGltZW91dCxcbiAgICAgICAgICAgIHNlcnZlclN0YXJ0dXBUaW1lb3V0OiB0aGlzLnNlcnZlclN0YXJ0dXBUaW1lb3V0LFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgYW4gYXZhaWxhYmxlIHBvcnQgZm9yIE9wZW5Db2RlIHNlcnZlclxuICAgICAqXG4gICAgICogSU1QT1JUQU5UOiBBbHdheXMgYXZvaWQgcG9ydCA0MDk2IHRvIHByZXZlbnQgY29uZmxpY3RzIHdpdGggdXNlcidzIGV4aXN0aW5nIHNlcnZlclxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIGFzeW5jIGdldEF2YWlsYWJsZVBvcnQoKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIENoZWNrIGlmIGRlZmF1bHQgcG9ydCBpcyBpbiB1c2UgYW5kIGxvZyBhY2NvcmRpbmdseVxuICAgICAgICAgICAgY29uc3QgZGVmYXVsdFBvcnQgPSA0MDk2O1xuICAgICAgICAgICAgY29uc3QgaXNEZWZhdWx0QXZhaWxhYmxlID1cbiAgICAgICAgICAgICAgICBhd2FpdCBPcGVuQ29kZUNsaWVudC5pc1BvcnRBdmFpbGFibGUoZGVmYXVsdFBvcnQpO1xuXG4gICAgICAgICAgICBpZiAoIWlzRGVmYXVsdEF2YWlsYWJsZSkge1xuICAgICAgICAgICAgICAgIGxvZy5pbmZvKFxuICAgICAgICAgICAgICAgICAgICBcIkV4aXN0aW5nIHNlcnZlciBkZXRlY3RlZCBvbiBwb3J0IDQwOTY7IHNwYXduaW5nIGlzb2xhdGVkIHNlcnZlciBvbiBkeW5hbWljIHBvcnRcIixcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsb2cuZGVidWcoXG4gICAgICAgICAgICAgICAgICAgIFwiRGVmYXVsdCBwb3J0IDQwOTYgaXMgYXZhaWxhYmxlIGJ1dCBhdm9pZGluZyBpdCBmb3IgaXNvbGF0aW9uXCIsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQWx3YXlzIHVzZSBkeW5hbWljIHBvcnQgdG8gYXZvaWQgY29uZmxpY3RzIHdpdGggdXNlcidzIGV4aXN0aW5nIHNlcnZlclxuICAgICAgICAgICAgY29uc3QgZHluYW1pY1BvcnQgPSBhd2FpdCBPcGVuQ29kZUNsaWVudC5maW5kQXZhaWxhYmxlUG9ydCgpO1xuICAgICAgICAgICAgbG9nLmluZm8oXG4gICAgICAgICAgICAgICAgYFNwYXduaW5nIGlzb2xhdGVkIHNlcnZlciBvbiBkeW5hbWljIHBvcnQ6ICR7ZHluYW1pY1BvcnR9YCxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICByZXR1cm4gZHluYW1pY1BvcnQ7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1zZyA9XG4gICAgICAgICAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICAgICAgbG9nLmVycm9yKFwiRmFpbGVkIHRvIHNlbGVjdCBPcGVuQ29kZSBzZXJ2ZXIgcG9ydFwiLCB7XG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yTXNnLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgYEZhaWxlZCB0byBzZWxlY3QgT3BlbkNvZGUgc2VydmVyIHBvcnQ6ICR7ZXJyb3JNc2d9YCxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBhIHNwZWNpZmljIHBvcnQgaXMgYXZhaWxhYmxlXG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgYXN5bmMgaXNQb3J0QXZhaWxhYmxlKHBvcnQ6IG51bWJlcik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNlcnZlciA9IGNyZWF0ZVNlcnZlcigpO1xuXG4gICAgICAgICAgICBzZXJ2ZXIubGlzdGVuKHBvcnQsICgpID0+IHtcbiAgICAgICAgICAgICAgICBzZXJ2ZXIub25jZShcImNsb3NlXCIsICgpID0+IHJlc29sdmUodHJ1ZSkpO1xuICAgICAgICAgICAgICAgIHNlcnZlci5jbG9zZSgpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHNlcnZlci5vbihcImVycm9yXCIsICgpID0+IHJlc29sdmUoZmFsc2UpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmluZCBhbiBhdmFpbGFibGUgcG9ydCBkeW5hbWljYWxseVxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIGFzeW5jIGZpbmRBdmFpbGFibGVQb3J0KCk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzZXJ2ZXIgPSBjcmVhdGVTZXJ2ZXIoKTtcblxuICAgICAgICAgICAgc2VydmVyLmxpc3RlbigwLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgYWRkcmVzcyA9IHNlcnZlci5hZGRyZXNzKCk7XG4gICAgICAgICAgICAgICAgaWYgKGFkZHJlc3MgJiYgdHlwZW9mIGFkZHJlc3MgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VydmVyLm9uY2UoXCJjbG9zZVwiLCAoKSA9PiByZXNvbHZlKGFkZHJlc3MucG9ydCkpO1xuICAgICAgICAgICAgICAgICAgICBzZXJ2ZXIuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKFwiRmFpbGVkIHRvIGdldCBzZXJ2ZXIgYWRkcmVzc1wiKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHNlcnZlci5vbihcImVycm9yXCIsIHJlamVjdCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFN0YXRpYyBmYWN0b3J5IG1ldGhvZCB0byBjcmVhdGUgYW4gT3BlbkNvZGVDbGllbnRcbiAgICAgKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgY2xpZW50IHdpdGggZWl0aGVyOlxuICAgICAqIDEuIEEgZnJlc2ggT3BlbkNvZGUgc2VydmVyIChkZWZhdWx0IGJlaGF2aW9yKVxuICAgICAqIDIuIEFuIGV4aXN0aW5nIHNlcnZlciBVUkwgKGlmIGV4aXN0aW5nU2VydmVyVXJsIGlzIHByb3ZpZGVkKVxuICAgICAqIDMuIEEgY3VzdG9tIGNsaWVudCBpbnN0YW5jZSAoZm9yIHRlc3RpbmcpXG4gICAgICpcbiAgICAgKiBOb3RlOiBTcGF3bmVkIE9wZW5Db2RlIHNlcnZlcnMgd2lsbCB1c2UgdG8gY2FsbGluZyBkaXJlY3RvcnkgYnkgZGVmYXVsdCAocHJvY2Vzcy5jd2QoKSlcbiAgICAgKiBVc2UgT1BFTkNPREVfVVJMIHRvIGNvbm5lY3QgdG8gYSBkaWZmZXJlbnQgT3BlbkNvZGUgaW5zdGFuY2VcbiAgICAgKi9cbiAgICBzdGF0aWMgYXN5bmMgY3JlYXRlKGNvbmZpZzogQ2xpZW50Q29uZmlnID0ge30pOiBQcm9taXNlPE9wZW5Db2RlQ2xpZW50PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBJZiBjdXN0b20gY2xpZW50IHByb3ZpZGVkIChmb3IgdGVzdGluZyksIHVzZSBpdCBkaXJlY3RseVxuICAgICAgICAgICAgaWYgKGNvbmZpZy5jbGllbnQpIHtcbiAgICAgICAgICAgICAgICBsb2cuaW5mbyhcIkNyZWF0aW5nIE9wZW5Db2RlQ2xpZW50IHdpdGggY3VzdG9tIGNsaWVudCBpbnN0YW5jZVwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IE9wZW5Db2RlQ2xpZW50KGNvbmZpZy5jbGllbnQsIG51bGwsIGNvbmZpZyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIElmIGV4aXN0aW5nIHNlcnZlciBVUkwgcHJvdmlkZWQsIGNvbm5lY3QgdG8gaXRcbiAgICAgICAgICAgIGlmIChjb25maWcuZXhpc3RpbmdTZXJ2ZXJVcmwpIHtcbiAgICAgICAgICAgICAgICBsb2cuaW5mbyhcIkNvbm5lY3RpbmcgdG8gZXhpc3RpbmcgT3BlbkNvZGUgc2VydmVyXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBjb25maWcuZXhpc3RpbmdTZXJ2ZXJVcmwsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2xpZW50ID0gY3JlYXRlT3BlbmNvZGVDbGllbnQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFzZVVybDogY29uZmlnLmV4aXN0aW5nU2VydmVyVXJsLFxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBWZXJpZnkgY29ubmVjdGlvbiBieSBtYWtpbmcgYSB0ZXN0IHJlcXVlc3RcbiAgICAgICAgICAgICAgICAgICAgbG9nLmRlYnVnKFwiVmVyaWZ5aW5nIGNvbm5lY3Rpb24gdG8gZXhpc3Rpbmcgc2VydmVyLi4uXCIpO1xuICAgICAgICAgICAgICAgICAgICAvLyBOb3RlOiBXZSdsbCBza2lwIHZlcmlmaWNhdGlvbiBmb3Igbm93IHRvIGF2b2lkIHVubmVjZXNzYXJ5IEFQSSBjYWxsc1xuICAgICAgICAgICAgICAgICAgICAvLyBUaGUgY29ubmVjdGlvbiB3aWxsIGJlIHZlcmlmaWVkIHdoZW4gZmlyc3Qgc2Vzc2lvbiBpcyBjcmVhdGVkXG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBPcGVuQ29kZUNsaWVudChjbGllbnQsIG51bGwsIGNvbmZpZyk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNc2cgPVxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICBsb2cuZXJyb3IoXCJGYWlsZWQgdG8gY29ubmVjdCB0byBleGlzdGluZyBzZXJ2ZXJcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBjb25maWcuZXhpc3RpbmdTZXJ2ZXJVcmwsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JNc2csXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIERlZmF1bHQ6IHNwYXduIGEgbmV3IE9wZW5Db2RlIHNlcnZlclxuICAgICAgICAgICAgLy8gTm90ZTogU3Bhd25lZCBzZXJ2ZXJzIHdpbGwgdXNlIHRvIGNhbGxpbmcgZGlyZWN0b3J5IGJ5IGRlZmF1bHRcbiAgICAgICAgICAgIC8vIFVzZSBPUEVOQ09ERV9VUkwgdG8gY29ubmVjdCB0byBhIGRpZmZlcmVudCBPcGVuQ29kZSBpbnN0YW5jZVxuICAgICAgICAgICAgbG9nLmluZm8oXCJTcGF3bmluZyBuZXcgT3BlbkNvZGUgc2VydmVyLi4uXCIsIHtcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiBjb25maWcuc2VydmVyU3RhcnR1cFRpbWVvdXQgfHwgMTAwMDAsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgY29uc3QgYXZhaWxhYmxlUG9ydCA9IGF3YWl0IE9wZW5Db2RlQ2xpZW50LmdldEF2YWlsYWJsZVBvcnQoKTtcblxuICAgICAgICAgICAgY29uc3QgeyBjbGllbnQsIHNlcnZlciB9ID0gYXdhaXQgY3JlYXRlT3BlbmNvZGUoe1xuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IGNvbmZpZy5zZXJ2ZXJTdGFydHVwVGltZW91dCB8fCAxMDAwMCxcbiAgICAgICAgICAgICAgICBwb3J0OiBhdmFpbGFibGVQb3J0LFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGxvZy5pbmZvKFwiT3BlbkNvZGUgc2VydmVyIHN0YXJ0ZWQgc3VjY2Vzc2Z1bGx5XCIpO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBPcGVuQ29kZUNsaWVudChjbGllbnQsIHNlcnZlciwgY29uZmlnKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTXNnID1cbiAgICAgICAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgICAgICBsb2cuZXJyb3IoXCJGYWlsZWQgdG8gY3JlYXRlIE9wZW5Db2RlQ2xpZW50XCIsIHsgZXJyb3I6IGVycm9yTXNnIH0pO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gY3JlYXRlIE9wZW5Db2RlQ2xpZW50OiAke2Vycm9yTXNnfWApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IE9wZW5Db2RlIHNlc3Npb24gd2l0aCBhIGdpdmVuIHByb21wdFxuICAgICAqL1xuICAgIGFzeW5jIGNyZWF0ZVNlc3Npb24ocHJvbXB0OiBzdHJpbmcpOiBQcm9taXNlPFNlc3Npb24+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIENyZWF0ZSBzZXNzaW9uIHVzaW5nIFNES1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5jbGllbnQuc2Vzc2lvbi5jcmVhdGUoe1xuICAgICAgICAgICAgICAgIGJvZHk6IHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IFwiYWktZW5nIHJhbHBoIHNlc3Npb25cIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmICghcmVzdWx0LmRhdGEpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgIGBGYWlsZWQgdG8gY3JlYXRlIE9wZW5Db2RlIHNlc3Npb246ICR7SlNPTi5zdHJpbmdpZnkocmVzdWx0LmVycm9yKX1gLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHNka1Nlc3Npb24gPSByZXN1bHQuZGF0YTtcblxuICAgICAgICAgICAgLy8gRGVmZXIgdGhlIGluaXRpYWwgcHJvbXB0IHVudGlsIHRoZSBmaXJzdCBtZXNzYWdlIGlzIHNlbnQuXG4gICAgICAgICAgICAvLyBUaGlzIGF2b2lkcyBibG9ja2luZyBzZXNzaW9uIGNyZWF0aW9uIGFuZCBlbmFibGVzIHN0cmVhbWluZyBvdXRwdXRcbiAgICAgICAgICAgIC8vIGV2ZW4gd2hlbiB0aGUgaW5pdGlhbCBwcm9tcHQgaXMgbGFyZ2Ugb3Igc2xvdyB0byBwcm9jZXNzLlxuICAgICAgICAgICAgbGV0IHBlbmRpbmdJbml0aWFsUHJvbXB0ID0gcHJvbXB0LnRyaW0oKTtcbiAgICAgICAgICAgIGNvbnN0IGJ1aWxkRmlyc3RNZXNzYWdlID0gKG1lc3NhZ2U6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghcGVuZGluZ0luaXRpYWxQcm9tcHQpIHJldHVybiBtZXNzYWdlO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbWJpbmVkID0gYCR7cGVuZGluZ0luaXRpYWxQcm9tcHR9XFxuXFxuLS0tXFxuXFxuJHttZXNzYWdlfWA7XG4gICAgICAgICAgICAgICAgcGVuZGluZ0luaXRpYWxQcm9tcHQgPSBcIlwiO1xuICAgICAgICAgICAgICAgIHJldHVybiBjb21iaW5lZDtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIEluaXRpYWxpemUgdG9vbCBpbnZvY2F0aW9ucyB0cmFja2VyXG4gICAgICAgICAgICBjb25zdCB0b29sSW52b2NhdGlvbnM6IFNlc3Npb25bXCJfdG9vbEludm9jYXRpb25zXCJdID0gW107XG5cbiAgICAgICAgICAgIC8vIFdyYXAgd2l0aCBvdXIgc2Vzc2lvbiBpbnRlcmZhY2VcbiAgICAgICAgICAgIGNvbnN0IHNlc3Npb246IFNlc3Npb24gPSB7XG4gICAgICAgICAgICAgICAgaWQ6IHNka1Nlc3Npb24uaWQgfHwgdGhpcy5nZW5lcmF0ZVNlc3Npb25JZCgpLFxuICAgICAgICAgICAgICAgIF90b29sSW52b2NhdGlvbnM6IHRvb2xJbnZvY2F0aW9ucyxcbiAgICAgICAgICAgICAgICBzZW5kTWVzc2FnZTogYXN5bmMgKG1lc3NhZ2U6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5oYW5kbGVTZW5kTWVzc2FnZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHNka1Nlc3Npb24uaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBidWlsZEZpcnN0TWVzc2FnZShtZXNzYWdlKSxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNlbmRNZXNzYWdlU3RyZWFtOiBhc3luYyAobWVzc2FnZTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmhhbmRsZVNlbmRNZXNzYWdlU3RyZWFtKFxuICAgICAgICAgICAgICAgICAgICAgICAgc2RrU2Vzc2lvbi5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkRmlyc3RNZXNzYWdlKG1lc3NhZ2UpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbEludm9jYXRpb25zLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY2xvc2U6IGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaGFuZGxlU2Vzc2lvbkNsb3NlKHNka1Nlc3Npb24uaWQpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBTdG9yZSBhY3RpdmUgc2Vzc2lvblxuICAgICAgICAgICAgdGhpcy5hY3RpdmVTZXNzaW9ucy5zZXQoc2Vzc2lvbi5pZCwgc2Vzc2lvbik7XG5cbiAgICAgICAgICAgIHJldHVybiBzZXNzaW9uO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID1cbiAgICAgICAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgYEZhaWxlZCB0byBjcmVhdGUgT3BlbkNvZGUgc2Vzc2lvbjogJHtlcnJvck1lc3NhZ2V9YCxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZW5kIGEgbWVzc2FnZSB0byBhbiBleGlzdGluZyBzZXNzaW9uXG4gICAgICovXG4gICAgYXN5bmMgc2VuZE1lc3NhZ2UoXG4gICAgICAgIHNlc3Npb25JZDogc3RyaW5nLFxuICAgICAgICBtZXNzYWdlOiBzdHJpbmcsXG4gICAgKTogUHJvbWlzZTxNZXNzYWdlUmVzcG9uc2U+IHtcbiAgICAgICAgY29uc3Qgc2Vzc2lvbiA9IHRoaXMuYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25JZCk7XG5cbiAgICAgICAgaWYgKCFzZXNzaW9uKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFNlc3Npb24gbm90IGZvdW5kOiAke3Nlc3Npb25JZH1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmhhbmRsZVNlbmRNZXNzYWdlKHNlc3Npb25JZCwgbWVzc2FnZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xvc2UgYW4gYWN0aXZlIHNlc3Npb25cbiAgICAgKi9cbiAgICBhc3luYyBjbG9zZVNlc3Npb24oc2Vzc2lvbklkOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgY29uc3Qgc2Vzc2lvbiA9IHRoaXMuYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25JZCk7XG5cbiAgICAgICAgaWYgKCFzZXNzaW9uKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFNlc3Npb24gbm90IGZvdW5kOiAke3Nlc3Npb25JZH1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGF3YWl0IHRoaXMuaGFuZGxlU2Vzc2lvbkNsb3NlKHNlc3Npb25JZCk7XG4gICAgICAgIHRoaXMuYWN0aXZlU2Vzc2lvbnMuZGVsZXRlKHNlc3Npb25JZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IGFsbCBhY3RpdmUgc2Vzc2lvbiBJRHNcbiAgICAgKi9cbiAgICBnZXRBY3RpdmVTZXNzaW9ucygpOiBzdHJpbmdbXSB7XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuYWN0aXZlU2Vzc2lvbnMua2V5cygpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBhIHNlc3Npb24gaXMgYWN0aXZlXG4gICAgICovXG4gICAgaXNTZXNzaW9uQWN0aXZlKHNlc3Npb25JZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLmFjdGl2ZVNlc3Npb25zLmhhcyhzZXNzaW9uSWQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENsb3NlIGFsbCBhY3RpdmUgc2Vzc2lvbnNcbiAgICAgKi9cbiAgICBhc3luYyBjbG9zZUFsbFNlc3Npb25zKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCBjbG9zZVByb21pc2VzID0gQXJyYXkuZnJvbSh0aGlzLmFjdGl2ZVNlc3Npb25zLmtleXMoKSkubWFwKFxuICAgICAgICAgICAgKHNlc3Npb25JZCkgPT5cbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZVNlc3Npb25DbG9zZShzZXNzaW9uSWQpLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1zZyA9XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIGxvZy53YXJuKFwiRXJyb3IgY2xvc2luZyBzZXNzaW9uXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvck1zZyxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICk7XG5cbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoY2xvc2VQcm9taXNlcyk7XG4gICAgICAgIHRoaXMuYWN0aXZlU2Vzc2lvbnMuY2xlYXIoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBIYW5kbGUgc2VuZGluZyBhIG1lc3NhZ2Ugd2l0aCBzdHJlYW1pbmcgc3VwcG9ydFxuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgaGFuZGxlU2VuZE1lc3NhZ2VTdHJlYW0oXG4gICAgICAgIHNlc3Npb25JZDogc3RyaW5nLFxuICAgICAgICBtZXNzYWdlOiBzdHJpbmcsXG4gICAgICAgIHRvb2xJbnZvY2F0aW9ucz86IFNlc3Npb25bXCJfdG9vbEludm9jYXRpb25zXCJdLFxuICAgICk6IFByb21pc2U8U3RyZWFtaW5nUmVzcG9uc2U+IHtcbiAgICAgICAgbGV0IGxhc3RFcnJvcjogRXJyb3IgfCBudWxsID0gbnVsbDtcblxuICAgICAgICBjb25zdCBzdXBwb3J0c0V2ZW50U3RyZWFtaW5nID1cbiAgICAgICAgICAgIHR5cGVvZiAodGhpcy5jbGllbnQgYXMgYW55KT8uc2Vzc2lvbj8ucHJvbXB0QXN5bmMgPT09IFwiZnVuY3Rpb25cIiAmJlxuICAgICAgICAgICAgdHlwZW9mICh0aGlzLmNsaWVudCBhcyBhbnkpPy5ldmVudD8uc3Vic2NyaWJlID09PSBcImZ1bmN0aW9uXCI7XG5cbiAgICAgICAgZm9yIChsZXQgYXR0ZW1wdCA9IDE7IGF0dGVtcHQgPD0gdGhpcy5yZXRyeUF0dGVtcHRzOyBhdHRlbXB0KyspIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGEgVHJhbnNmb3JtU3RyZWFtIHRvIGhhbmRsZSB0aGUgc3RyZWFtaW5nIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgY29uc3Qgc3RyZWFtID0gbmV3IFRyYW5zZm9ybVN0cmVhbTxVaW50OEFycmF5LCBVaW50OEFycmF5PigpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHdyaXRlciA9IHN0cmVhbS53cml0YWJsZS5nZXRXcml0ZXIoKTtcbiAgICAgICAgICAgICAgICBsZXQgYXNzaXN0YW50TWVzc2FnZUlkOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcblxuICAgICAgICAgICAgICAgIC8vIFRyYWNrIGZpbmFsaXphdGlvbiB0byBwcmV2ZW50IGRvdWJsZS1jbG9zZS9hYm9ydFxuICAgICAgICAgICAgICAgIGxldCBmaW5hbGl6ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBjb25zdCBjbG9zZU9uY2UgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmaW5hbGl6ZWQpIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgZmluYWxpemVkID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgd3JpdGVyLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWdub3JlIGVycm9ycyBkdXJpbmcgY2xvc2VcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgY29uc3QgYWJvcnRPbmNlID0gYXN5bmMgKGVycjogdW5rbm93bikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZmluYWxpemVkKSByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIGZpbmFsaXplZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB3cml0ZXIuYWJvcnQoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZ25vcmUgZXJyb3JzIGR1cmluZyBhYm9ydFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIC8vIEZhbGxiYWNrOiBpZiB0aGUgY2xpZW50IGRvZXNuJ3Qgc3VwcG9ydCBwcm9tcHRfYXN5bmMgKyBTU0UsIGtlZXAgdGhlXG4gICAgICAgICAgICAgICAgLy8gbGVnYWN5IGJlaGF2aW9yIChidWZmZXIgdGhlbiBzaW11bGF0ZSBzdHJlYW1pbmcpLlxuICAgICAgICAgICAgICAgIGlmICghc3VwcG9ydHNFdmVudFN0cmVhbWluZykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm9tcHRQcm9taXNlID0gdGhpcy5jbGllbnQuc2Vzc2lvbi5wcm9tcHQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgYm9keToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VJRDogdGhpcy5nZW5lcmF0ZU1lc3NhZ2VJZCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwidGV4dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogbWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXJ5OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0b3J5OiB0aGlzLmRpcmVjdG9yeSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIH0gYXMgYW55KTtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdHJlYW1pbmdUYXNrID0gKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcHJvbXB0UHJvbWlzZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcmVzdWx0LmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYEludmFsaWQgcmVzcG9uc2UgZnJvbSBPcGVuQ29kZTogJHtKU09OLnN0cmluZ2lmeShyZXN1bHQuZXJyb3IpfWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSByZXN1bHQuZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0ZXh0UGFydCA9IHJlc3BvbnNlLnBhcnRzPy5maW5kKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAocGFydDogYW55KSA9PiBwYXJ0LnR5cGUgPT09IFwidGV4dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmaW5hbENvbnRlbnQgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAodGV4dFBhcnQgYXMgYW55KT8udGV4dCB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIk5vIGNvbnRlbnQgcmVjZWl2ZWRcIjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNpbXVsYXRlIHN0cmVhbWluZyBieSB3cml0aW5nIGNodW5rc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNodW5rcyA9IHRoaXMuc3BsaXRJbnRvQ2h1bmtzKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaW5hbENvbnRlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDEwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZW5jb2RlciA9IG5ldyBUZXh0RW5jb2RlcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgY2h1bmsgb2YgY2h1bmtzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHdyaXRlci53cml0ZShlbmNvZGVyLmVuY29kZShjaHVuaykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQocmVzb2x2ZSwgNTApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IGNsb3NlT25jZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7IGNvbnRlbnQ6IGZpbmFsQ29udGVudCB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBhYm9ydE9uY2UoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KSgpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJlYW06IHN0cmVhbS5yZWFkYWJsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlOiBzdHJlYW1pbmdUYXNrLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIFJlYWwgc3RyZWFtaW5nOiB1c2UgcHJvbXB0X2FzeW5jIGFuZCBjb25zdW1lIHRoZSBldmVudCBTU0Ugc3RyZWFtLlxuICAgICAgICAgICAgICAgIGNvbnN0IGVuY29kZXIgPSBuZXcgVGV4dEVuY29kZXIoKTtcbiAgICAgICAgICAgICAgICBjb25zdCBpZGxlVGltZW91dEVycm9yID0gbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICAgICBgUHJvbXB0IGlkbGUgdGltZW91dCBhZnRlciAke3RoaXMucHJvbXB0VGltZW91dH1tc2AsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBjb25zdCBoYXJkVGltZW91dEVycm9yID0gbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICAgICBgUHJvbXB0IGhhcmQgdGltZW91dCBhZnRlciAke3RoaXMucHJvbXB0VGltZW91dCAqIDV9bXNgLFxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBjb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgICAgICAgICAgICAgIGxldCBpZGxlVGltZXI6IFJldHVyblR5cGU8dHlwZW9mIHNldFRpbWVvdXQ+IHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIGxldCBoYXJkVGltZXI6IFJldHVyblR5cGU8dHlwZW9mIHNldFRpbWVvdXQ+IHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIGxldCBieXRlc1dyaXR0ZW4gPSAwO1xuICAgICAgICAgICAgICAgIGxldCBsYXN0UHJvZ3Jlc3NUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgICAgICBsZXQgaWRsZVRpbWVkT3V0ID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAvLyBIYXJkIHRpbWVvdXQgLSBuZXZlciByZXNldHNcbiAgICAgICAgICAgICAgICBjb25zdCBzdGFydEhhcmRUaW1lciA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhhcmRUaW1lcikgY2xlYXJUaW1lb3V0KGhhcmRUaW1lcik7XG4gICAgICAgICAgICAgICAgICAgIGhhcmRUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nLndhcm4oXCJIYXJkIHRpbWVvdXQgcmVhY2hlZCwgYWJvcnRpbmdcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0TXM6IHRoaXMucHJvbXB0VGltZW91dCAqIDUsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlci5hYm9ydChoYXJkVGltZW91dEVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlnbm9yZVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LCB0aGlzLnByb21wdFRpbWVvdXQgKiA1KTsgLy8gNXggaWRsZSB0aW1lb3V0IGFzIGhhcmQgY2VpbGluZ1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAvLyBJZGxlIHRpbWVyIC0gcmVzZXRzIG9ubHkgb24gcmVsZXZhbnQgcHJvZ3Jlc3NcbiAgICAgICAgICAgICAgICBjb25zdCByZXNldElkbGVUaW1lciA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlkbGVUaW1lcikgY2xlYXJUaW1lb3V0KGlkbGVUaW1lcik7XG4gICAgICAgICAgICAgICAgICAgIGlkbGVUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWRsZVRpbWVkT3V0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZy53YXJuKFwiSWRsZSB0aW1lb3V0IHJlYWNoZWQsIGFib3J0aW5nXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dE1zOiB0aGlzLnByb21wdFRpbWVvdXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnl0ZXNXcml0dGVuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RQcm9ncmVzc01zQWdvOiBEYXRlLm5vdygpIC0gbGFzdFByb2dyZXNzVGltZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyLmFib3J0KGlkbGVUaW1lb3V0RXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWdub3JlXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sIHRoaXMucHJvbXB0VGltZW91dCk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHN0cmVhbWluZ1Rhc2sgPSAoYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRIYXJkVGltZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc2V0SWRsZVRpbWVyKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJNZXNzYWdlSWQgPSB0aGlzLmdlbmVyYXRlTWVzc2FnZUlkKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcIlNlbmRpbmcgcHJvbXB0IHRvIE9wZW5Db2RlXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUxlbmd0aDogbWVzc2FnZS5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlck1lc3NhZ2VJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCAodGhpcy5jbGllbnQgYXMgYW55KS5zZXNzaW9uLnByb21wdEFzeW5jKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBib2R5OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VJRDogdXNlck1lc3NhZ2VJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcInRleHRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBtZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXJ5OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdG9yeTogdGhpcy5kaXJlY3RvcnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaWduYWw6IGNvbnRyb2xsZXIuc2lnbmFsLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcIlN1YnNjcmliaW5nIHRvIGV2ZW50c1wiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdG9yeTogdGhpcy5kaXJlY3RvcnksXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXZlbnRzUmVzdWx0ID0gYXdhaXQgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2xpZW50IGFzIGFueVxuICAgICAgICAgICAgICAgICAgICAgICAgKS5ldmVudC5zdWJzY3JpYmUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXJ5OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdG9yeTogdGhpcy5kaXJlY3RvcnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaWduYWw6IGNvbnRyb2xsZXIuc2lnbmFsLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjb250ZW50ID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBlbWl0dGVkVGV4dCA9IFwiXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZXZlbnRDb3VudCA9IDA7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcIlN0YXJ0aW5nIGV2ZW50IHN0cmVhbSBwcm9jZXNzaW5nXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIGF3YWl0IChjb25zdCBldmVudCBvZiBldmVudHNSZXN1bHQuc3RyZWFtIGFzIEFzeW5jR2VuZXJhdG9yPGFueT4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudENvdW50Kys7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBWZXJib3NlIGRlYnVnIGxvZ2dpbmcgZm9yIGFsbCBldmVudHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZGVidWcoXCJSZWNlaXZlZCBldmVudFwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRUeXBlOiBldmVudD8udHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRDb3VudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzUHJvcGVydGllczogISFldmVudD8ucHJvcGVydGllcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlckFib3J0ZWQ6IGNvbnRyb2xsZXIuc2lnbmFsLmFib3J0ZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29udHJvbGxlci5zaWduYWwuYWJvcnRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZGVidWcoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkNvbnRyb2xsZXIgYWJvcnRlZCwgYnJlYWtpbmcgZXZlbnQgbG9vcFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudENvdW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFldmVudCB8fCB0eXBlb2YgZXZlbnQgIT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmRlYnVnKFwiU2tpcHBpbmcgbm9uLW9iamVjdCBldmVudFwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudENvdW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09IFwibWVzc2FnZS51cGRhdGVkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5mbyA9IChldmVudCBhcyBhbnkpLnByb3BlcnRpZXM/LmluZm87XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmRlYnVnKFwiTWVzc2FnZSB1cGRhdGVkIGV2ZW50XCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50Q291bnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvUm9sZTogaW5mbz8ucm9sZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm9TZXNzaW9uSWQ6IGluZm8/LnNlc3Npb25JRCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm9QYXJlbnRJZDogaW5mbz8ucGFyZW50SUQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvSWQ6IGluZm8/LmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNSZWxldmFudFNlc3Npb246XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mbz8uc2Vzc2lvbklEID09PSBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0Fzc2lzdGFudDogaW5mbz8ucm9sZSA9PT0gXCJhc3Npc3RhbnRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzUmVwbHlUb1VzZXI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mbz8ucGFyZW50SUQgPT09IHVzZXJNZXNzYWdlSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFByaW1hcnkgaWRlbnRpZmljYXRpb246IGV4YWN0IG1hdGNoIG9uIHBhcmVudElEXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8/LnJvbGUgPT09IFwiYXNzaXN0YW50XCIgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8/LnNlc3Npb25JRCA9PT0gc2Vzc2lvbklkICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvPy5wYXJlbnRJRCA9PT0gdXNlck1lc3NhZ2VJZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2lzdGFudE1lc3NhZ2VJZCA9IGluZm8uaWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZGVidWcoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJJZGVudGlmaWVkIGFzc2lzdGFudCBtZXNzYWdlIChleGFjdCBwYXJlbnRJRCBtYXRjaClcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzaXN0YW50TWVzc2FnZUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZhbGxiYWNrOiBpZiB3ZSBoYXZlbid0IGlkZW50aWZpZWQgYW4gYXNzaXN0YW50IG1lc3NhZ2UgeWV0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhY2NlcHQgYXNzaXN0YW50IG1lc3NhZ2VzIGluIHRoZSBzYW1lIHNlc3Npb24gZXZlbiBpZiBwYXJlbnRJRCBkb2Vzbid0IG1hdGNoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaGFuZGxlcyBjYXNlcyB3aGVyZSBwYXJlbnRJRCBpcyB1bmRlZmluZWQgb3IgaGFzIGEgZGlmZmVyZW50IGZvcm1hdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICFhc3Npc3RhbnRNZXNzYWdlSWQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8/LnJvbGUgPT09IFwiYXNzaXN0YW50XCIgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8/LnNlc3Npb25JRCA9PT0gc2Vzc2lvbklkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmRlYnVnKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiSWRlbnRpZmllZCBhc3Npc3RhbnQgbWVzc2FnZSAoZmFsbGJhY2sgLSBubyBleGFjdCBwYXJlbnRJRCBtYXRjaClcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzaXN0YW50TWVzc2FnZUlkOiBpbmZvLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvUGFyZW50SWQ6IGluZm8/LnBhcmVudElELFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyTWVzc2FnZUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzaXN0YW50TWVzc2FnZUlkID0gaW5mby5pZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJlc2V0IGlkbGUgdGltZXIgb24gQU5ZIGFzc2lzdGFudCBtZXNzYWdlIGFjdGl2aXR5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgcHJldmVudHMgdGltZW91dHMgd2hlbiBjb3JyZWxhdGlvbiBpcyBhbWJpZ3VvdXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mbz8ucm9sZSA9PT0gXCJhc3Npc3RhbnRcIiAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mbz8uc2Vzc2lvbklEID09PSBzZXNzaW9uSWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0UHJvZ3Jlc3NUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc2V0SWRsZVRpbWVyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3Npc3RhbnRNZXNzYWdlSWQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8/LmlkID09PSBhc3Npc3RhbnRNZXNzYWdlSWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5mbz8uZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJOYW1lID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mby5lcnJvci5uYW1lIHx8IFwiT3BlbkNvZGVFcnJvclwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVyck1zZyA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8uZXJyb3IuZGF0YT8ubWVzc2FnZSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBKU09OLnN0cmluZ2lmeShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8uZXJyb3IuZGF0YSB8fCB7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQXNzaXN0YW50IGVycm9yIGluIG1lc3NhZ2VcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JOYW1lOiBlcnJOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJNc2csXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAke2Vyck5hbWV9OiAke2Vyck1zZ31gLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmZvPy50aW1lPy5jb21wbGV0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZGVidWcoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQXNzaXN0YW50IG1lc3NhZ2UgY29tcGxldGVkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2lzdGFudE1lc3NhZ2VJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlZEF0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8udGltZS5jb21wbGV0ZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChldmVudC50eXBlID09PSBcIm1lc3NhZ2UucGFydC51cGRhdGVkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gT25seSByZXNldCB0aW1lciBhbmQgdHJhY2sgcHJvZ3Jlc3MgZm9yIHJlbGV2YW50IHVwZGF0ZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFydCA9IChldmVudCBhcyBhbnkpLnByb3BlcnRpZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8ucGFydCBhcyBhbnk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmRlYnVnKFwiTWVzc2FnZSBwYXJ0IHVwZGF0ZWRcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRDb3VudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc1BhcnQ6ICEhcGFydCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRUeXBlOiBwYXJ0Py50eXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydFNlc3Npb25JZDogcGFydD8uc2Vzc2lvbklELFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydE1lc3NhZ2VJZDogcGFydD8ubWVzc2FnZUlELFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzaXN0YW50TWVzc2FnZUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNSZWxldmFudDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3Npc3RhbnRNZXNzYWdlSWQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0Py5zZXNzaW9uSUQgPT09IHNlc3Npb25JZCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnQ/Lm1lc3NhZ2VJRCA9PT0gYXNzaXN0YW50TWVzc2FnZUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWFzc2lzdGFudE1lc3NhZ2VJZCkgY29udGludWU7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSGFuZGxlIHRvb2wgcGFydHMgKGNhcHR1cmUgdG9vbCBpbnZvY2F0aW9ucylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnQ/LnR5cGUgPT09IFwidG9vbFwiICYmIHRvb2xJbnZvY2F0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdG9vbElkID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0LnRvb2xJZCB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnQuaWQgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgdG9vbC0ke2V2ZW50Q291bnR9YDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRvb2xOYW1lID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0LnRvb2xOYW1lIHx8IHBhcnQubmFtZSB8fCBcInVua25vd25cIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRvb2xJbnB1dCA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydC5pbnB1dCB8fCBwYXJ0LnBhcmFtZXRlcnMgfHwge307XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIHRoaXMgaXMgYSBuZXcgdG9vbCBjYWxsIG9yIGFuIHVwZGF0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXhpc3RpbmdUb29sSW5kZXggPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xJbnZvY2F0aW9ucy5maW5kSW5kZXgoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICh0KSA9PiB0LmlkID09PSB0b29sSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV4aXN0aW5nVG9vbEluZGV4ID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBVcGRhdGUgZXhpc3RpbmcgdG9vbCBpbnZvY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXhpc3RpbmcgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sSW52b2NhdGlvbnNbZXhpc3RpbmdUb29sSW5kZXhdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nLm91dHB1dCA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnQucmVzdWx0ID8/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnQub3V0cHV0ID8/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nLm91dHB1dDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleGlzdGluZy5zdGF0dXMgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0LnN0YXR1cyA9PT0gXCJlcnJvclwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IFwiZXJyb3JcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBcIm9rXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhpc3RpbmcuZXJyb3IgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0LmVycm9yID8/IGV4aXN0aW5nLmVycm9yO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nLmNvbXBsZXRlZEF0ID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydC5jb21wbGV0ZWRBdCA/PyBub3c7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZGVidWcoXCJUb29sIGludm9jYXRpb24gdXBkYXRlZFwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiBleGlzdGluZy5zdGF0dXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5ldyB0b29sIGludm9jYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0b29sSW52b2NhdGlvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHRvb2xJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogdG9vbE5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0OiB0b29sSW5wdXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dDogcGFydC5yZXN1bHQgPz8gcGFydC5vdXRwdXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnQuc3RhdHVzID09PSBcImVycm9yXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IChcImVycm9yXCIgYXMgY29uc3QpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAoXCJva1wiIGFzIGNvbnN0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IHBhcnQuZXJyb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0ZWRBdDogcGFydC5zdGFydGVkQXQgPz8gbm93LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZWRBdDogcGFydC5jb21wbGV0ZWRBdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xJbnZvY2F0aW9ucy5wdXNoKHRvb2xJbnZvY2F0aW9uKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcIlRvb2wgaW52b2NhdGlvbiBzdGFydGVkXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dDogSlNPTi5zdHJpbmdpZnkoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sSW5wdXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkuc2xpY2UoMCwgMjAwKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRG9uJ3Qgc2tpcCBub24tcmVsZXZhbnQgdG9vbCBwYXJ0cyAtIHdlIHdhbnQgdG8gY2FwdHVyZSBhbGwgdG9vbCBldmVudHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZvciB0aGUgYXNzaXN0YW50IG1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0LnNlc3Npb25JRCAhPT0gc2Vzc2lvbklkIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydC5tZXNzYWdlSUQgIT09IGFzc2lzdGFudE1lc3NhZ2VJZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU3RpbGwgdHJhY2sgaXQgYnV0IGRvbid0IHByb2Nlc3MgZm9yIG91dHB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBSZXNldCBpZGxlIHRpbWVyIG9uIHRvb2wgcHJvZ3Jlc3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0UHJvZ3Jlc3NUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNldElkbGVUaW1lcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcGFydCB8fCBwYXJ0LnR5cGUgIT09IFwidGV4dFwiKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnQuc2Vzc2lvbklEICE9PSBzZXNzaW9uSWQpIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFydC5tZXNzYWdlSUQgIT09IGFzc2lzdGFudE1lc3NhZ2VJZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJhd0RlbHRhID0gKGV2ZW50IGFzIGFueSkucHJvcGVydGllc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPy5kZWx0YTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgZGVsdGFUZXh0OiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUHJlZmVyIGRpZmZpbmcgYWdhaW5zdCB0aGUgZnVsbCBgcGFydC50ZXh0YCB3aGVuIHByZXNlbnQuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNvbWUgT3BlbkNvZGUgc2VydmVyIHZlcnNpb25zIGVtaXQgbXVsdGlwbGUgdGV4dCBwYXJ0cyBvciBzZW5kXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGBkZWx0YWAgYXMgdGhlICpmdWxsKiB0ZXh0LCB3aGljaCB3b3VsZCBkdXBsaWNhdGUgb3V0cHV0LlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHBhcnQudGV4dCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV4dCA9IHBhcnQudGV4dDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5leHQuc3RhcnRzV2l0aChlbWl0dGVkVGV4dCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWx0YVRleHQgPSBuZXh0LnNsaWNlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbWl0dGVkVGV4dC5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbWl0dGVkVGV4dCA9IG5leHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVtaXR0ZWRUZXh0LnN0YXJ0c1dpdGgobmV4dCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTdGFsZS9kdXBsaWNhdGUgdXBkYXRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsdGFUZXh0ID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmFsbGJhY2s6IHRyZWF0IGFzIGFkZGl0aXZlIGNodW5rXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsdGFUZXh0ID0gbmV4dDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbWl0dGVkVGV4dCArPSBuZXh0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiByYXdEZWx0YSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsdGFUZXh0ID0gcmF3RGVsdGE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbWl0dGVkVGV4dCArPSByYXdEZWx0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZGVsdGFUZXh0KSBjb250aW51ZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBVcGRhdGUgcHJvZ3Jlc3MgdHJhY2tpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdFByb2dyZXNzVGltZSA9IERhdGUubm93KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ5dGVzV3JpdHRlbiArPSBkZWx0YVRleHQubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNldElkbGVUaW1lcigpOyAvLyBPbmx5IHJlc2V0IG9uIGFjdHVhbCBjb250ZW50IHByb2dyZXNzXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmRlYnVnKFwiV3JpdGluZyBkZWx0YSB0byBzdHJlYW1cIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsdGFMZW5ndGg6IGRlbHRhVGV4dC5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3RhbEJ5dGVzV3JpdHRlbjogYnl0ZXNXcml0dGVuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudExlbmd0aDogY29udGVudC5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQgKz0gZGVsdGFUZXh0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB3cml0ZXIud3JpdGUoZW5jb2Rlci5lbmNvZGUoZGVsdGFUZXh0KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2cuZGVidWcoXCJFdmVudCBzdHJlYW0gZW5kZWRcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudENvdW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsQnl0ZXNXcml0dGVuOiBieXRlc1dyaXR0ZW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudExlbmd0aDogY29udGVudC5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlckFib3J0ZWQ6IGNvbnRyb2xsZXIuc2lnbmFsLmFib3J0ZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWRsZVRpbWVkT3V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2lzdGFudE1lc3NhZ2VJZEZvdW5kOiAhIWFzc2lzdGFudE1lc3NhZ2VJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBjbG9zZU9uY2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogY29udGVudCB8fCBcIk5vIGNvbnRlbnQgcmVjZWl2ZWRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaWFnbm9zdGljczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBieXRlc1dyaXR0ZW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnRMZW5ndGg6IGNvbnRlbnQubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZGxlVGltZWRPdXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2lzdGFudE1lc3NhZ2VJZEZvdW5kOiAhIWFzc2lzdGFudE1lc3NhZ2VJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRDb3VudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5lcnJvcihcIlN0cmVhbWluZyB0YXNrIGVycm9yXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yIGluc3RhbmNlb2YgRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gZXJyb3IubWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBTdHJpbmcoZXJyb3IpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXJBYm9ydGVkOiBjb250cm9sbGVyLnNpZ25hbC5hYm9ydGVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ5dGVzV3JpdHRlbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZGxlVGltZWRPdXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzaXN0YW50TWVzc2FnZUlkRm91bmQ6ICEhYXNzaXN0YW50TWVzc2FnZUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBQcmVzZXJ2ZSB0aGUgYWN0dWFsIHRpbWVvdXQgcmVhc29uIHNvIGRpYWdub3N0aWNzIHN0YXkgYWNjdXJhdGUuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29udHJvbGxlci5zaWduYWwuYWJvcnRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGFib3J0RXJyb3IgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyLnNpZ25hbC5yZWFzb24gaW5zdGFuY2VvZiBFcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBjb250cm9sbGVyLnNpZ25hbC5yZWFzb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogaWRsZVRpbWVkT3V0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gaWRsZVRpbWVvdXRFcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IGhhcmRUaW1lb3V0RXJyb3I7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgYWJvcnRPbmNlKGFib3J0RXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGFib3J0RXJyb3I7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBhYm9ydE9uY2UoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgICAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaWRsZVRpbWVyKSBjbGVhclRpbWVvdXQoaWRsZVRpbWVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChoYXJkVGltZXIpIGNsZWFyVGltZW91dChoYXJkVGltZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWNvbnRyb2xsZXIuc2lnbmFsLmFib3J0ZWQpIGNvbnRyb2xsZXIuYWJvcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlnbm9yZVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSkoKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN0cmVhbTogc3RyZWFtLnJlYWRhYmxlLFxuICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZTogc3RyZWFtaW5nVGFzayxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBsYXN0RXJyb3IgPVxuICAgICAgICAgICAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IgOiBuZXcgRXJyb3IoU3RyaW5nKGVycm9yKSk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBpc1JhdGVMaW1pdCA9IHRoaXMuaXNSYXRlTGltaXRFcnJvcihsYXN0RXJyb3IpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGF0dGVtcHQgPT09IHRoaXMucmV0cnlBdHRlbXB0cykge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb25zdCBkZWxheSA9IHRoaXMuZ2V0QmFja29mZkRlbGF5KGF0dGVtcHQsIGlzUmF0ZUxpbWl0KTtcblxuICAgICAgICAgICAgICAgIGxvZy53YXJuKFwiT3BlbkNvZGUgYXR0ZW1wdCBmYWlsZWQ7IHJldHJ5aW5nXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgYXR0ZW1wdCxcbiAgICAgICAgICAgICAgICAgICAgcmV0cnlBdHRlbXB0czogdGhpcy5yZXRyeUF0dGVtcHRzLFxuICAgICAgICAgICAgICAgICAgICBkZWxheU1zOiBkZWxheSxcbiAgICAgICAgICAgICAgICAgICAgaXNSYXRlTGltaXQsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBsYXN0RXJyb3IubWVzc2FnZSxcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIGRlbGF5KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgRmFpbGVkIHRvIHN0cmVhbSBtZXNzYWdlIGFmdGVyICR7dGhpcy5yZXRyeUF0dGVtcHRzfSBhdHRlbXB0czogJHtsYXN0RXJyb3I/Lm1lc3NhZ2UgfHwgXCJVbmtub3duIGVycm9yXCJ9YCxcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTcGxpdCB0ZXh0IGludG8gY2h1bmtzIGZvciBzdHJlYW1pbmcgc2ltdWxhdGlvblxuICAgICAqL1xuICAgIHByaXZhdGUgc3BsaXRJbnRvQ2h1bmtzKHRleHQ6IHN0cmluZywgY2h1bmtTaXplOiBudW1iZXIpOiBzdHJpbmdbXSB7XG4gICAgICAgIGNvbnN0IGNodW5rczogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0ZXh0Lmxlbmd0aDsgaSArPSBjaHVua1NpemUpIHtcbiAgICAgICAgICAgIGNodW5rcy5wdXNoKHRleHQuc2xpY2UoaSwgaSArIGNodW5rU2l6ZSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjaHVua3MubGVuZ3RoID4gMCA/IGNodW5rcyA6IFt0ZXh0XTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBIYW5kbGUgc2VuZGluZyBhIG1lc3NhZ2Ugd2l0aCBlcnJvciBoYW5kbGluZyBhbmQgcmV0cmllc1xuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgaGFuZGxlU2VuZE1lc3NhZ2UoXG4gICAgICAgIHNlc3Npb25JZDogc3RyaW5nLFxuICAgICAgICBtZXNzYWdlOiBzdHJpbmcsXG4gICAgKTogUHJvbWlzZTxNZXNzYWdlUmVzcG9uc2U+IHtcbiAgICAgICAgbGV0IGxhc3RFcnJvcjogRXJyb3IgfCBudWxsID0gbnVsbDtcblxuICAgICAgICBmb3IgKGxldCBhdHRlbXB0ID0gMTsgYXR0ZW1wdCA8PSB0aGlzLnJldHJ5QXR0ZW1wdHM7IGF0dGVtcHQrKykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCB0aW1lb3V0RXJyb3IgPSBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgIGBQcm9tcHQgdGltZW91dCBhZnRlciAke3RoaXMucHJvbXB0VGltZW91dH1tc2AsXG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgdGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXIuYWJvcnQodGltZW91dEVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpZ25vcmVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIHRoaXMucHJvbXB0VGltZW91dCk7XG5cbiAgICAgICAgICAgICAgICBsZXQgcmVzdWx0OiBhbnk7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gYXdhaXQgdGhpcy5jbGllbnQuc2Vzc2lvbi5wcm9tcHQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgYm9keToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VJRDogdGhpcy5nZW5lcmF0ZU1lc3NhZ2VJZCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwidGV4dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogbWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXJ5OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0b3J5OiB0aGlzLmRpcmVjdG9yeSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBzaWduYWw6IGNvbnRyb2xsZXIuc2lnbmFsLFxuICAgICAgICAgICAgICAgICAgICB9IGFzIGFueSk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbnRyb2xsZXIuc2lnbmFsLmFib3J0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IHRpbWVvdXRFcnJvcjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICghcmVzdWx0LmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgYEludmFsaWQgcmVzcG9uc2UgZnJvbSBPcGVuQ29kZTogJHtKU09OLnN0cmluZ2lmeShyZXN1bHQuZXJyb3IpfWAsXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gRXh0cmFjdCBjb250ZW50IGZyb20gcmVzcG9uc2VcbiAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IHJlc3VsdC5kYXRhO1xuXG4gICAgICAgICAgICAgICAgLy8gRmluZCB0ZXh0IGNvbnRlbnQgZnJvbSByZXNwb25zZSBwYXJ0c1xuICAgICAgICAgICAgICAgIGNvbnN0IHRleHRQYXJ0ID0gcmVzcG9uc2UucGFydHM/LmZpbmQoXG4gICAgICAgICAgICAgICAgICAgIChwYXJ0OiBhbnkpID0+IHBhcnQudHlwZSA9PT0gXCJ0ZXh0XCIsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICByZXR1cm4geyBjb250ZW50OiB0ZXh0UGFydD8udGV4dCB8fCBcIk5vIGNvbnRlbnQgcmVjZWl2ZWRcIiB9O1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBsYXN0RXJyb3IgPVxuICAgICAgICAgICAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IgOiBuZXcgRXJyb3IoU3RyaW5nKGVycm9yKSk7XG5cbiAgICAgICAgICAgICAgICAvLyBDaGVjayBpZiB0aGlzIGlzIGEgcmF0ZSBsaW1pdCBlcnJvclxuICAgICAgICAgICAgICAgIGNvbnN0IGlzUmF0ZUxpbWl0ID0gdGhpcy5pc1JhdGVMaW1pdEVycm9yKGxhc3RFcnJvcik7XG5cbiAgICAgICAgICAgICAgICBpZiAoYXR0ZW1wdCA9PT0gdGhpcy5yZXRyeUF0dGVtcHRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIFdhaXQgYmVmb3JlIHJldHJ5aW5nIHdpdGggZXhwb25lbnRpYWwgYmFja29mZlxuICAgICAgICAgICAgICAgIGNvbnN0IGRlbGF5ID0gdGhpcy5nZXRCYWNrb2ZmRGVsYXkoYXR0ZW1wdCwgaXNSYXRlTGltaXQpO1xuXG4gICAgICAgICAgICAgICAgbG9nLndhcm4oXCJPcGVuQ29kZSBhdHRlbXB0IGZhaWxlZDsgcmV0cnlpbmdcIiwge1xuICAgICAgICAgICAgICAgICAgICBhdHRlbXB0LFxuICAgICAgICAgICAgICAgICAgICByZXRyeUF0dGVtcHRzOiB0aGlzLnJldHJ5QXR0ZW1wdHMsXG4gICAgICAgICAgICAgICAgICAgIGRlbGF5TXM6IGRlbGF5LFxuICAgICAgICAgICAgICAgICAgICBpc1JhdGVMaW1pdCxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGxhc3RFcnJvci5tZXNzYWdlLFxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgZGVsYXkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBGYWlsZWQgdG8gc2VuZCBtZXNzYWdlIGFmdGVyICR7dGhpcy5yZXRyeUF0dGVtcHRzfSBhdHRlbXB0czogJHtsYXN0RXJyb3I/Lm1lc3NhZ2UgfHwgXCJVbmtub3duIGVycm9yXCJ9YCxcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBlcnJvciBpcyBhIHJhdGUgbGltaXQgZXJyb3JcbiAgICAgKi9cbiAgICBwcml2YXRlIGlzUmF0ZUxpbWl0RXJyb3IoZXJyb3I6IEVycm9yKTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IGVyciA9IGVycm9yIGFzIGFueTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIGVyci5zdGF0dXMgPT09IDQyOSB8fFxuICAgICAgICAgICAgL3JhdGUgbGltaXR8cXVvdGF8b3ZlcmxvYWRlZHxjYXBhY2l0eS9pLnRlc3QoZXJyb3IubWVzc2FnZSlcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDYWxjdWxhdGUgYmFja29mZiBkZWxheSB3aXRoIGppdHRlclxuICAgICAqL1xuICAgIHByaXZhdGUgZ2V0QmFja29mZkRlbGF5KGF0dGVtcHQ6IG51bWJlciwgaXNSYXRlTGltaXQ6IGJvb2xlYW4pOiBudW1iZXIge1xuICAgICAgICBjb25zdCBiYXNlID0gaXNSYXRlTGltaXQgPyA1MDAwIDogMTAwMDsgLy8gNXMgZm9yIHJhdGUgbGltaXQsIDFzIG90aGVyd2lzZVxuICAgICAgICBjb25zdCBleHBvbmVudGlhbCA9IGJhc2UgKiAyICoqIChhdHRlbXB0IC0gMSk7XG4gICAgICAgIGNvbnN0IGppdHRlciA9IE1hdGgucmFuZG9tKCkgKiAxMDAwOyAvLyBBZGQgdXAgdG8gMXMgaml0dGVyXG4gICAgICAgIHJldHVybiBNYXRoLm1pbihleHBvbmVudGlhbCArIGppdHRlciwgNjAwMDApOyAvLyBtYXggNjBzXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSGFuZGxlIHNlc3Npb24gY2xvc3VyZSB3aXRoIGVycm9yIGhhbmRsaW5nXG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyBoYW5kbGVTZXNzaW9uQ2xvc2Uoc2Vzc2lvbklkOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIE5vdGU6IE9wZW5Db2RlIFNESyBtaWdodCBub3QgaGF2ZSBhbiBleHBsaWNpdCBjbG9zZSBtZXRob2RcbiAgICAgICAgICAgIC8vIEZvciBub3csIHdlJ2xsIGp1c3QgcmVtb3ZlIGZyb20gb3VyIGFjdGl2ZSBzZXNzaW9uc1xuICAgICAgICAgICAgLy8gSW4gYSByZWFsIGltcGxlbWVudGF0aW9uLCB3ZSdkIGNhbGwgU0RLJ3MgZGVsZXRlIG1ldGhvZCBpZiBhdmFpbGFibGVcbiAgICAgICAgICAgIGxvZy5kZWJ1ZyhcIlNlc3Npb24gY2xvc2VkXCIsIHsgc2Vzc2lvbklkIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID1cbiAgICAgICAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgICAgICBsb2cud2FybihcIkZhaWxlZCB0byBjbG9zZSBzZXNzaW9uXCIsIHtcbiAgICAgICAgICAgICAgICBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2VuZXJhdGUgYSB1bmlxdWUgc2Vzc2lvbiBJRCBpZiBTREsgZG9lc24ndCBwcm92aWRlIG9uZVxuICAgICAqL1xuICAgIHByaXZhdGUgZ2VuZXJhdGVTZXNzaW9uSWQoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGBzZXNzaW9uLSR7RGF0ZS5ub3coKX0tJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgOSl9YDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZSBhIHByb3Blcmx5IGZvcm1hdHRlZCBtZXNzYWdlIElEIHdpdGggbXNnXyBwcmVmaXhcbiAgICAgKiBGb3JtYXQ6IG1zZ188dGltZXN0YW1wPl88cmFuZG9tPlxuICAgICAqL1xuICAgIHByaXZhdGUgZ2VuZXJhdGVNZXNzYWdlSWQoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGBtc2dfJHtEYXRlLm5vdygpfV8ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZygyLCA4KX1gO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENsZWFudXAgbWV0aG9kIHRvIGNsb3NlIGFsbCBzZXNzaW9ucyBhbmQgc2VydmVyXG4gICAgICovXG4gICAgYXN5bmMgY2xlYW51cCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxvZy5kZWJ1ZyhcIlN0YXJ0aW5nIGNsZWFudXAuLi5cIiwge1xuICAgICAgICAgICAgICAgIGFjdGl2ZVNlc3Npb25zOiB0aGlzLmFjdGl2ZVNlc3Npb25zLnNpemUsXG4gICAgICAgICAgICAgICAgaGFzU2VydmVyOiAhIXRoaXMuc2VydmVyLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIENsb3NlIGFsbCBhY3RpdmUgc2Vzc2lvbnNcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuY2xvc2VBbGxTZXNzaW9ucygpO1xuXG4gICAgICAgICAgICAvLyBTdG9wIHRoZSBPcGVuQ29kZSBzZXJ2ZXIgaWYgd2Ugc3RhcnRlZCBvbmVcbiAgICAgICAgICAgIGlmICh0aGlzLnNlcnZlcikge1xuICAgICAgICAgICAgICAgIGxvZy5pbmZvKFwiQ2xvc2luZyBzcGF3bmVkIE9wZW5Db2RlIHNlcnZlclwiKTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlcnZlci5jbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlcnZlciA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIGxvZy5pbmZvKFwiT3BlbkNvZGUgc2VydmVyIGNsb3NlZCBzdWNjZXNzZnVsbHlcIik7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNc2cgPVxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICBsb2cuZXJyb3IoXCJFcnJvciBjbG9zaW5nIE9wZW5Db2RlIHNlcnZlclwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JNc2csXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbG9nLmRlYnVnKFxuICAgICAgICAgICAgICAgICAgICBcIk5vIHNwYXduZWQgc2VydmVyIHRvIGNsb3NlIChjb25uZWN0ZWQgdG8gZXhpc3Rpbmcgc2VydmVyKVwiLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxvZy5pbmZvKFwiQ2xlYW51cCBjb21wbGV0ZVwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTXNnID1cbiAgICAgICAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgICAgICBsb2cuZXJyb3IoXCJFcnJvciBkdXJpbmcgT3BlbkNvZGUgY2xpZW50IGNsZWFudXBcIiwge1xuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvck1zZyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwKICAgICIvLyBUaGlzIGZpbGUgaXMgYXV0by1nZW5lcmF0ZWQgYnkgQGhleS1hcGkvb3BlbmFwaS10c1xuZXhwb3J0IGNvbnN0IGNyZWF0ZVNzZUNsaWVudCA9ICh7IG9uU3NlRXJyb3IsIG9uU3NlRXZlbnQsIHJlc3BvbnNlVHJhbnNmb3JtZXIsIHJlc3BvbnNlVmFsaWRhdG9yLCBzc2VEZWZhdWx0UmV0cnlEZWxheSwgc3NlTWF4UmV0cnlBdHRlbXB0cywgc3NlTWF4UmV0cnlEZWxheSwgc3NlU2xlZXBGbiwgdXJsLCAuLi5vcHRpb25zIH0pID0+IHtcbiAgICBsZXQgbGFzdEV2ZW50SWQ7XG4gICAgY29uc3Qgc2xlZXAgPSBzc2VTbGVlcEZuID8/ICgobXMpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIG1zKSkpO1xuICAgIGNvbnN0IGNyZWF0ZVN0cmVhbSA9IGFzeW5jIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIGxldCByZXRyeURlbGF5ID0gc3NlRGVmYXVsdFJldHJ5RGVsYXkgPz8gMzAwMDtcbiAgICAgICAgbGV0IGF0dGVtcHQgPSAwO1xuICAgICAgICBjb25zdCBzaWduYWwgPSBvcHRpb25zLnNpZ25hbCA/PyBuZXcgQWJvcnRDb250cm9sbGVyKCkuc2lnbmFsO1xuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgaWYgKHNpZ25hbC5hYm9ydGVkKVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgYXR0ZW1wdCsrO1xuICAgICAgICAgICAgY29uc3QgaGVhZGVycyA9IG9wdGlvbnMuaGVhZGVycyBpbnN0YW5jZW9mIEhlYWRlcnNcbiAgICAgICAgICAgICAgICA/IG9wdGlvbnMuaGVhZGVyc1xuICAgICAgICAgICAgICAgIDogbmV3IEhlYWRlcnMob3B0aW9ucy5oZWFkZXJzKTtcbiAgICAgICAgICAgIGlmIChsYXN0RXZlbnRJZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgaGVhZGVycy5zZXQoXCJMYXN0LUV2ZW50LUlEXCIsIGxhc3RFdmVudElkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwsIHsgLi4ub3B0aW9ucywgaGVhZGVycywgc2lnbmFsIH0pO1xuICAgICAgICAgICAgICAgIGlmICghcmVzcG9uc2Uub2spXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgU1NFIGZhaWxlZDogJHtyZXNwb25zZS5zdGF0dXN9ICR7cmVzcG9uc2Uuc3RhdHVzVGV4dH1gKTtcbiAgICAgICAgICAgICAgICBpZiAoIXJlc3BvbnNlLmJvZHkpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIGJvZHkgaW4gU1NFIHJlc3BvbnNlXCIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlYWRlciA9IHJlc3BvbnNlLmJvZHkucGlwZVRocm91Z2gobmV3IFRleHREZWNvZGVyU3RyZWFtKCkpLmdldFJlYWRlcigpO1xuICAgICAgICAgICAgICAgIGxldCBidWZmZXIgPSBcIlwiO1xuICAgICAgICAgICAgICAgIGNvbnN0IGFib3J0SGFuZGxlciA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlYWRlci5jYW5jZWwoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBub29wXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHNpZ25hbC5hZGRFdmVudExpc3RlbmVyKFwiYWJvcnRcIiwgYWJvcnRIYW5kbGVyKTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgeyBkb25lLCB2YWx1ZSB9ID0gYXdhaXQgcmVhZGVyLnJlYWQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkb25lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVmZmVyICs9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2h1bmtzID0gYnVmZmVyLnNwbGl0KFwiXFxuXFxuXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVmZmVyID0gY2h1bmtzLnBvcCgpID8/IFwiXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGNodW5rIG9mIGNodW5rcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxpbmVzID0gY2h1bmsuc3BsaXQoXCJcXG5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZGF0YUxpbmVzID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGV2ZW50TmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxpbmUuc3RhcnRzV2l0aChcImRhdGE6XCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhTGluZXMucHVzaChsaW5lLnJlcGxhY2UoL15kYXRhOlxccyovLCBcIlwiKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobGluZS5zdGFydHNXaXRoKFwiZXZlbnQ6XCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudE5hbWUgPSBsaW5lLnJlcGxhY2UoL15ldmVudDpcXHMqLywgXCJcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobGluZS5zdGFydHNXaXRoKFwiaWQ6XCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0RXZlbnRJZCA9IGxpbmUucmVwbGFjZSgvXmlkOlxccyovLCBcIlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChsaW5lLnN0YXJ0c1dpdGgoXCJyZXRyeTpcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhcnNlZCA9IE51bWJlci5wYXJzZUludChsaW5lLnJlcGxhY2UoL15yZXRyeTpcXHMqLywgXCJcIiksIDEwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghTnVtYmVyLmlzTmFOKHBhcnNlZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXRyeURlbGF5ID0gcGFyc2VkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBkYXRhO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXJzZWRKc29uID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGFMaW5lcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmF3RGF0YSA9IGRhdGFMaW5lcy5qb2luKFwiXFxuXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YSA9IEpTT04ucGFyc2UocmF3RGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJzZWRKc29uID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhID0gcmF3RGF0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFyc2VkSnNvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2VWYWxpZGF0b3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHJlc3BvbnNlVmFsaWRhdG9yKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZVRyYW5zZm9ybWVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhID0gYXdhaXQgcmVzcG9uc2VUcmFuc2Zvcm1lcihkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblNzZUV2ZW50Py4oe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudDogZXZlbnROYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogbGFzdEV2ZW50SWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHJ5OiByZXRyeURlbGF5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRhTGluZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkIGRhdGE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICBzaWduYWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImFib3J0XCIsIGFib3J0SGFuZGxlcik7XG4gICAgICAgICAgICAgICAgICAgIHJlYWRlci5yZWxlYXNlTG9jaygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhazsgLy8gZXhpdCBsb29wIG9uIG5vcm1hbCBjb21wbGV0aW9uXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAvLyBjb25uZWN0aW9uIGZhaWxlZCBvciBhYm9ydGVkOyByZXRyeSBhZnRlciBkZWxheVxuICAgICAgICAgICAgICAgIG9uU3NlRXJyb3I/LihlcnJvcik7XG4gICAgICAgICAgICAgICAgaWYgKHNzZU1heFJldHJ5QXR0ZW1wdHMgIT09IHVuZGVmaW5lZCAmJiBhdHRlbXB0ID49IHNzZU1heFJldHJ5QXR0ZW1wdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7IC8vIHN0b3AgYWZ0ZXIgZmlyaW5nIGVycm9yXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGV4cG9uZW50aWFsIGJhY2tvZmY6IGRvdWJsZSByZXRyeSBlYWNoIGF0dGVtcHQsIGNhcCBhdCAzMHNcbiAgICAgICAgICAgICAgICBjb25zdCBiYWNrb2ZmID0gTWF0aC5taW4ocmV0cnlEZWxheSAqIDIgKiogKGF0dGVtcHQgLSAxKSwgc3NlTWF4UmV0cnlEZWxheSA/PyAzMDAwMCk7XG4gICAgICAgICAgICAgICAgYXdhaXQgc2xlZXAoYmFja29mZik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IHN0cmVhbSA9IGNyZWF0ZVN0cmVhbSgpO1xuICAgIHJldHVybiB7IHN0cmVhbSB9O1xufTtcbiIsCiAgICAiLy8gVGhpcyBmaWxlIGlzIGF1dG8tZ2VuZXJhdGVkIGJ5IEBoZXktYXBpL29wZW5hcGktdHNcbmV4cG9ydCBjb25zdCBnZXRBdXRoVG9rZW4gPSBhc3luYyAoYXV0aCwgY2FsbGJhY2spID0+IHtcbiAgICBjb25zdCB0b2tlbiA9IHR5cGVvZiBjYWxsYmFjayA9PT0gXCJmdW5jdGlvblwiID8gYXdhaXQgY2FsbGJhY2soYXV0aCkgOiBjYWxsYmFjaztcbiAgICBpZiAoIXRva2VuKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGF1dGguc2NoZW1lID09PSBcImJlYXJlclwiKSB7XG4gICAgICAgIHJldHVybiBgQmVhcmVyICR7dG9rZW59YDtcbiAgICB9XG4gICAgaWYgKGF1dGguc2NoZW1lID09PSBcImJhc2ljXCIpIHtcbiAgICAgICAgcmV0dXJuIGBCYXNpYyAke2J0b2EodG9rZW4pfWA7XG4gICAgfVxuICAgIHJldHVybiB0b2tlbjtcbn07XG4iLAogICAgIi8vIFRoaXMgZmlsZSBpcyBhdXRvLWdlbmVyYXRlZCBieSBAaGV5LWFwaS9vcGVuYXBpLXRzXG5jb25zdCBzZXJpYWxpemVGb3JtRGF0YVBhaXIgPSAoZGF0YSwga2V5LCB2YWx1ZSkgPT4ge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIgfHwgdmFsdWUgaW5zdGFuY2VvZiBCbG9iKSB7XG4gICAgICAgIGRhdGEuYXBwZW5kKGtleSwgdmFsdWUpO1xuICAgIH1cbiAgICBlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIERhdGUpIHtcbiAgICAgICAgZGF0YS5hcHBlbmQoa2V5LCB2YWx1ZS50b0lTT1N0cmluZygpKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGRhdGEuYXBwZW5kKGtleSwgSlNPTi5zdHJpbmdpZnkodmFsdWUpKTtcbiAgICB9XG59O1xuY29uc3Qgc2VyaWFsaXplVXJsU2VhcmNoUGFyYW1zUGFpciA9IChkYXRhLCBrZXksIHZhbHVlKSA9PiB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICBkYXRhLmFwcGVuZChrZXksIHZhbHVlKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGRhdGEuYXBwZW5kKGtleSwgSlNPTi5zdHJpbmdpZnkodmFsdWUpKTtcbiAgICB9XG59O1xuZXhwb3J0IGNvbnN0IGZvcm1EYXRhQm9keVNlcmlhbGl6ZXIgPSB7XG4gICAgYm9keVNlcmlhbGl6ZXI6IChib2R5KSA9PiB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBuZXcgRm9ybURhdGEoKTtcbiAgICAgICAgT2JqZWN0LmVudHJpZXMoYm9keSkuZm9yRWFjaCgoW2tleSwgdmFsdWVdKSA9PiB7XG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHZhbHVlLmZvckVhY2goKHYpID0+IHNlcmlhbGl6ZUZvcm1EYXRhUGFpcihkYXRhLCBrZXksIHYpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlcmlhbGl6ZUZvcm1EYXRhUGFpcihkYXRhLCBrZXksIHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH0sXG59O1xuZXhwb3J0IGNvbnN0IGpzb25Cb2R5U2VyaWFsaXplciA9IHtcbiAgICBib2R5U2VyaWFsaXplcjogKGJvZHkpID0+IEpTT04uc3RyaW5naWZ5KGJvZHksIChfa2V5LCB2YWx1ZSkgPT4gKHR5cGVvZiB2YWx1ZSA9PT0gXCJiaWdpbnRcIiA/IHZhbHVlLnRvU3RyaW5nKCkgOiB2YWx1ZSkpLFxufTtcbmV4cG9ydCBjb25zdCB1cmxTZWFyY2hQYXJhbXNCb2R5U2VyaWFsaXplciA9IHtcbiAgICBib2R5U2VyaWFsaXplcjogKGJvZHkpID0+IHtcbiAgICAgICAgY29uc3QgZGF0YSA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoKTtcbiAgICAgICAgT2JqZWN0LmVudHJpZXMoYm9keSkuZm9yRWFjaCgoW2tleSwgdmFsdWVdKSA9PiB7XG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHZhbHVlLmZvckVhY2goKHYpID0+IHNlcmlhbGl6ZVVybFNlYXJjaFBhcmFtc1BhaXIoZGF0YSwga2V5LCB2KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZXJpYWxpemVVcmxTZWFyY2hQYXJhbXNQYWlyKGRhdGEsIGtleSwgdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGRhdGEudG9TdHJpbmcoKTtcbiAgICB9LFxufTtcbiIsCiAgICAiLy8gVGhpcyBmaWxlIGlzIGF1dG8tZ2VuZXJhdGVkIGJ5IEBoZXktYXBpL29wZW5hcGktdHNcbmV4cG9ydCBjb25zdCBzZXBhcmF0b3JBcnJheUV4cGxvZGUgPSAoc3R5bGUpID0+IHtcbiAgICBzd2l0Y2ggKHN0eWxlKSB7XG4gICAgICAgIGNhc2UgXCJsYWJlbFwiOlxuICAgICAgICAgICAgcmV0dXJuIFwiLlwiO1xuICAgICAgICBjYXNlIFwibWF0cml4XCI6XG4gICAgICAgICAgICByZXR1cm4gXCI7XCI7XG4gICAgICAgIGNhc2UgXCJzaW1wbGVcIjpcbiAgICAgICAgICAgIHJldHVybiBcIixcIjtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiBcIiZcIjtcbiAgICB9XG59O1xuZXhwb3J0IGNvbnN0IHNlcGFyYXRvckFycmF5Tm9FeHBsb2RlID0gKHN0eWxlKSA9PiB7XG4gICAgc3dpdGNoIChzdHlsZSkge1xuICAgICAgICBjYXNlIFwiZm9ybVwiOlxuICAgICAgICAgICAgcmV0dXJuIFwiLFwiO1xuICAgICAgICBjYXNlIFwicGlwZURlbGltaXRlZFwiOlxuICAgICAgICAgICAgcmV0dXJuIFwifFwiO1xuICAgICAgICBjYXNlIFwic3BhY2VEZWxpbWl0ZWRcIjpcbiAgICAgICAgICAgIHJldHVybiBcIiUyMFwiO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIFwiLFwiO1xuICAgIH1cbn07XG5leHBvcnQgY29uc3Qgc2VwYXJhdG9yT2JqZWN0RXhwbG9kZSA9IChzdHlsZSkgPT4ge1xuICAgIHN3aXRjaCAoc3R5bGUpIHtcbiAgICAgICAgY2FzZSBcImxhYmVsXCI6XG4gICAgICAgICAgICByZXR1cm4gXCIuXCI7XG4gICAgICAgIGNhc2UgXCJtYXRyaXhcIjpcbiAgICAgICAgICAgIHJldHVybiBcIjtcIjtcbiAgICAgICAgY2FzZSBcInNpbXBsZVwiOlxuICAgICAgICAgICAgcmV0dXJuIFwiLFwiO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIFwiJlwiO1xuICAgIH1cbn07XG5leHBvcnQgY29uc3Qgc2VyaWFsaXplQXJyYXlQYXJhbSA9ICh7IGFsbG93UmVzZXJ2ZWQsIGV4cGxvZGUsIG5hbWUsIHN0eWxlLCB2YWx1ZSwgfSkgPT4ge1xuICAgIGlmICghZXhwbG9kZSkge1xuICAgICAgICBjb25zdCBqb2luZWRWYWx1ZXMgPSAoYWxsb3dSZXNlcnZlZCA/IHZhbHVlIDogdmFsdWUubWFwKCh2KSA9PiBlbmNvZGVVUklDb21wb25lbnQodikpKS5qb2luKHNlcGFyYXRvckFycmF5Tm9FeHBsb2RlKHN0eWxlKSk7XG4gICAgICAgIHN3aXRjaCAoc3R5bGUpIHtcbiAgICAgICAgICAgIGNhc2UgXCJsYWJlbFwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBgLiR7am9pbmVkVmFsdWVzfWA7XG4gICAgICAgICAgICBjYXNlIFwibWF0cml4XCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGA7JHtuYW1lfT0ke2pvaW5lZFZhbHVlc31gO1xuICAgICAgICAgICAgY2FzZSBcInNpbXBsZVwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBqb2luZWRWYWx1ZXM7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiBgJHtuYW1lfT0ke2pvaW5lZFZhbHVlc31gO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHNlcGFyYXRvciA9IHNlcGFyYXRvckFycmF5RXhwbG9kZShzdHlsZSk7XG4gICAgY29uc3Qgam9pbmVkVmFsdWVzID0gdmFsdWVcbiAgICAgICAgLm1hcCgodikgPT4ge1xuICAgICAgICBpZiAoc3R5bGUgPT09IFwibGFiZWxcIiB8fCBzdHlsZSA9PT0gXCJzaW1wbGVcIikge1xuICAgICAgICAgICAgcmV0dXJuIGFsbG93UmVzZXJ2ZWQgPyB2IDogZW5jb2RlVVJJQ29tcG9uZW50KHYpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzZXJpYWxpemVQcmltaXRpdmVQYXJhbSh7XG4gICAgICAgICAgICBhbGxvd1Jlc2VydmVkLFxuICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgIHZhbHVlOiB2LFxuICAgICAgICB9KTtcbiAgICB9KVxuICAgICAgICAuam9pbihzZXBhcmF0b3IpO1xuICAgIHJldHVybiBzdHlsZSA9PT0gXCJsYWJlbFwiIHx8IHN0eWxlID09PSBcIm1hdHJpeFwiID8gc2VwYXJhdG9yICsgam9pbmVkVmFsdWVzIDogam9pbmVkVmFsdWVzO1xufTtcbmV4cG9ydCBjb25zdCBzZXJpYWxpemVQcmltaXRpdmVQYXJhbSA9ICh7IGFsbG93UmVzZXJ2ZWQsIG5hbWUsIHZhbHVlIH0pID0+IHtcbiAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gXCJcIjtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJEZWVwbHktbmVzdGVkIGFycmF5cy9vYmplY3RzIGFyZW7igJl0IHN1cHBvcnRlZC4gUHJvdmlkZSB5b3VyIG93biBgcXVlcnlTZXJpYWxpemVyKClgIHRvIGhhbmRsZSB0aGVzZS5cIik7XG4gICAgfVxuICAgIHJldHVybiBgJHtuYW1lfT0ke2FsbG93UmVzZXJ2ZWQgPyB2YWx1ZSA6IGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSl9YDtcbn07XG5leHBvcnQgY29uc3Qgc2VyaWFsaXplT2JqZWN0UGFyYW0gPSAoeyBhbGxvd1Jlc2VydmVkLCBleHBsb2RlLCBuYW1lLCBzdHlsZSwgdmFsdWUsIHZhbHVlT25seSwgfSkgPT4ge1xuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIERhdGUpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlT25seSA/IHZhbHVlLnRvSVNPU3RyaW5nKCkgOiBgJHtuYW1lfT0ke3ZhbHVlLnRvSVNPU3RyaW5nKCl9YDtcbiAgICB9XG4gICAgaWYgKHN0eWxlICE9PSBcImRlZXBPYmplY3RcIiAmJiAhZXhwbG9kZSkge1xuICAgICAgICBsZXQgdmFsdWVzID0gW107XG4gICAgICAgIE9iamVjdC5lbnRyaWVzKHZhbHVlKS5mb3JFYWNoKChba2V5LCB2XSkgPT4ge1xuICAgICAgICAgICAgdmFsdWVzID0gWy4uLnZhbHVlcywga2V5LCBhbGxvd1Jlc2VydmVkID8gdiA6IGVuY29kZVVSSUNvbXBvbmVudCh2KV07XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBqb2luZWRWYWx1ZXMgPSB2YWx1ZXMuam9pbihcIixcIik7XG4gICAgICAgIHN3aXRjaCAoc3R5bGUpIHtcbiAgICAgICAgICAgIGNhc2UgXCJmb3JtXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke25hbWV9PSR7am9pbmVkVmFsdWVzfWA7XG4gICAgICAgICAgICBjYXNlIFwibGFiZWxcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gYC4ke2pvaW5lZFZhbHVlc31gO1xuICAgICAgICAgICAgY2FzZSBcIm1hdHJpeFwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBgOyR7bmFtZX09JHtqb2luZWRWYWx1ZXN9YDtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGpvaW5lZFZhbHVlcztcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBzZXBhcmF0b3IgPSBzZXBhcmF0b3JPYmplY3RFeHBsb2RlKHN0eWxlKTtcbiAgICBjb25zdCBqb2luZWRWYWx1ZXMgPSBPYmplY3QuZW50cmllcyh2YWx1ZSlcbiAgICAgICAgLm1hcCgoW2tleSwgdl0pID0+IHNlcmlhbGl6ZVByaW1pdGl2ZVBhcmFtKHtcbiAgICAgICAgYWxsb3dSZXNlcnZlZCxcbiAgICAgICAgbmFtZTogc3R5bGUgPT09IFwiZGVlcE9iamVjdFwiID8gYCR7bmFtZX1bJHtrZXl9XWAgOiBrZXksXG4gICAgICAgIHZhbHVlOiB2LFxuICAgIH0pKVxuICAgICAgICAuam9pbihzZXBhcmF0b3IpO1xuICAgIHJldHVybiBzdHlsZSA9PT0gXCJsYWJlbFwiIHx8IHN0eWxlID09PSBcIm1hdHJpeFwiID8gc2VwYXJhdG9yICsgam9pbmVkVmFsdWVzIDogam9pbmVkVmFsdWVzO1xufTtcbiIsCiAgICAiLy8gVGhpcyBmaWxlIGlzIGF1dG8tZ2VuZXJhdGVkIGJ5IEBoZXktYXBpL29wZW5hcGktdHNcbmltcG9ydCB7IHNlcmlhbGl6ZUFycmF5UGFyYW0sIHNlcmlhbGl6ZU9iamVjdFBhcmFtLCBzZXJpYWxpemVQcmltaXRpdmVQYXJhbSwgfSBmcm9tIFwiLi9wYXRoU2VyaWFsaXplci5nZW4uanNcIjtcbmV4cG9ydCBjb25zdCBQQVRIX1BBUkFNX1JFID0gL1xce1tee31dK1xcfS9nO1xuZXhwb3J0IGNvbnN0IGRlZmF1bHRQYXRoU2VyaWFsaXplciA9ICh7IHBhdGgsIHVybDogX3VybCB9KSA9PiB7XG4gICAgbGV0IHVybCA9IF91cmw7XG4gICAgY29uc3QgbWF0Y2hlcyA9IF91cmwubWF0Y2goUEFUSF9QQVJBTV9SRSk7XG4gICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgICAgZm9yIChjb25zdCBtYXRjaCBvZiBtYXRjaGVzKSB7XG4gICAgICAgICAgICBsZXQgZXhwbG9kZSA9IGZhbHNlO1xuICAgICAgICAgICAgbGV0IG5hbWUgPSBtYXRjaC5zdWJzdHJpbmcoMSwgbWF0Y2gubGVuZ3RoIC0gMSk7XG4gICAgICAgICAgICBsZXQgc3R5bGUgPSBcInNpbXBsZVwiO1xuICAgICAgICAgICAgaWYgKG5hbWUuZW5kc1dpdGgoXCIqXCIpKSB7XG4gICAgICAgICAgICAgICAgZXhwbG9kZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyaW5nKDAsIG5hbWUubGVuZ3RoIC0gMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobmFtZS5zdGFydHNXaXRoKFwiLlwiKSkge1xuICAgICAgICAgICAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cmluZygxKTtcbiAgICAgICAgICAgICAgICBzdHlsZSA9IFwibGFiZWxcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG5hbWUuc3RhcnRzV2l0aChcIjtcIikpIHtcbiAgICAgICAgICAgICAgICBuYW1lID0gbmFtZS5zdWJzdHJpbmcoMSk7XG4gICAgICAgICAgICAgICAgc3R5bGUgPSBcIm1hdHJpeFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBwYXRoW25hbWVdO1xuICAgICAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHVybCA9IHVybC5yZXBsYWNlKG1hdGNoLCBzZXJpYWxpemVBcnJheVBhcmFtKHsgZXhwbG9kZSwgbmFtZSwgc3R5bGUsIHZhbHVlIH0pKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgICB1cmwgPSB1cmwucmVwbGFjZShtYXRjaCwgc2VyaWFsaXplT2JqZWN0UGFyYW0oe1xuICAgICAgICAgICAgICAgICAgICBleHBsb2RlLFxuICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICBzdHlsZSxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZU9ubHk6IHRydWUsXG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHN0eWxlID09PSBcIm1hdHJpeFwiKSB7XG4gICAgICAgICAgICAgICAgdXJsID0gdXJsLnJlcGxhY2UobWF0Y2gsIGA7JHtzZXJpYWxpemVQcmltaXRpdmVQYXJhbSh7XG4gICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgICAgICB9KX1gKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHJlcGxhY2VWYWx1ZSA9IGVuY29kZVVSSUNvbXBvbmVudChzdHlsZSA9PT0gXCJsYWJlbFwiID8gYC4ke3ZhbHVlfWAgOiB2YWx1ZSk7XG4gICAgICAgICAgICB1cmwgPSB1cmwucmVwbGFjZShtYXRjaCwgcmVwbGFjZVZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdXJsO1xufTtcbmV4cG9ydCBjb25zdCBnZXRVcmwgPSAoeyBiYXNlVXJsLCBwYXRoLCBxdWVyeSwgcXVlcnlTZXJpYWxpemVyLCB1cmw6IF91cmwsIH0pID0+IHtcbiAgICBjb25zdCBwYXRoVXJsID0gX3VybC5zdGFydHNXaXRoKFwiL1wiKSA/IF91cmwgOiBgLyR7X3VybH1gO1xuICAgIGxldCB1cmwgPSAoYmFzZVVybCA/PyBcIlwiKSArIHBhdGhVcmw7XG4gICAgaWYgKHBhdGgpIHtcbiAgICAgICAgdXJsID0gZGVmYXVsdFBhdGhTZXJpYWxpemVyKHsgcGF0aCwgdXJsIH0pO1xuICAgIH1cbiAgICBsZXQgc2VhcmNoID0gcXVlcnkgPyBxdWVyeVNlcmlhbGl6ZXIocXVlcnkpIDogXCJcIjtcbiAgICBpZiAoc2VhcmNoLnN0YXJ0c1dpdGgoXCI/XCIpKSB7XG4gICAgICAgIHNlYXJjaCA9IHNlYXJjaC5zdWJzdHJpbmcoMSk7XG4gICAgfVxuICAgIGlmIChzZWFyY2gpIHtcbiAgICAgICAgdXJsICs9IGA/JHtzZWFyY2h9YDtcbiAgICB9XG4gICAgcmV0dXJuIHVybDtcbn07XG4iLAogICAgIi8vIFRoaXMgZmlsZSBpcyBhdXRvLWdlbmVyYXRlZCBieSBAaGV5LWFwaS9vcGVuYXBpLXRzXG5pbXBvcnQgeyBnZXRBdXRoVG9rZW4gfSBmcm9tIFwiLi4vY29yZS9hdXRoLmdlbi5qc1wiO1xuaW1wb3J0IHsganNvbkJvZHlTZXJpYWxpemVyIH0gZnJvbSBcIi4uL2NvcmUvYm9keVNlcmlhbGl6ZXIuZ2VuLmpzXCI7XG5pbXBvcnQgeyBzZXJpYWxpemVBcnJheVBhcmFtLCBzZXJpYWxpemVPYmplY3RQYXJhbSwgc2VyaWFsaXplUHJpbWl0aXZlUGFyYW0gfSBmcm9tIFwiLi4vY29yZS9wYXRoU2VyaWFsaXplci5nZW4uanNcIjtcbmltcG9ydCB7IGdldFVybCB9IGZyb20gXCIuLi9jb3JlL3V0aWxzLmdlbi5qc1wiO1xuZXhwb3J0IGNvbnN0IGNyZWF0ZVF1ZXJ5U2VyaWFsaXplciA9ICh7IGFsbG93UmVzZXJ2ZWQsIGFycmF5LCBvYmplY3QgfSA9IHt9KSA9PiB7XG4gICAgY29uc3QgcXVlcnlTZXJpYWxpemVyID0gKHF1ZXJ5UGFyYW1zKSA9PiB7XG4gICAgICAgIGNvbnN0IHNlYXJjaCA9IFtdO1xuICAgICAgICBpZiAocXVlcnlQYXJhbXMgJiYgdHlwZW9mIHF1ZXJ5UGFyYW1zID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IG5hbWUgaW4gcXVlcnlQYXJhbXMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHF1ZXJ5UGFyYW1zW25hbWVdO1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VyaWFsaXplZEFycmF5ID0gc2VyaWFsaXplQXJyYXlQYXJhbSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbGxvd1Jlc2VydmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXhwbG9kZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogXCJmb3JtXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLmFycmF5LFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlcmlhbGl6ZWRBcnJheSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaC5wdXNoKHNlcmlhbGl6ZWRBcnJheSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzZXJpYWxpemVkT2JqZWN0ID0gc2VyaWFsaXplT2JqZWN0UGFyYW0oe1xuICAgICAgICAgICAgICAgICAgICAgICAgYWxsb3dSZXNlcnZlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cGxvZGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IFwiZGVlcE9iamVjdFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgLi4ub2JqZWN0LFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlcmlhbGl6ZWRPYmplY3QpXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWFyY2gucHVzaChzZXJpYWxpemVkT2JqZWN0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlcmlhbGl6ZWRQcmltaXRpdmUgPSBzZXJpYWxpemVQcmltaXRpdmVQYXJhbSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbGxvd1Jlc2VydmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzZXJpYWxpemVkUHJpbWl0aXZlKVxuICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoLnB1c2goc2VyaWFsaXplZFByaW1pdGl2ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzZWFyY2guam9pbihcIiZcIik7XG4gICAgfTtcbiAgICByZXR1cm4gcXVlcnlTZXJpYWxpemVyO1xufTtcbi8qKlxuICogSW5mZXJzIHBhcnNlQXMgdmFsdWUgZnJvbSBwcm92aWRlZCBDb250ZW50LVR5cGUgaGVhZGVyLlxuICovXG5leHBvcnQgY29uc3QgZ2V0UGFyc2VBcyA9IChjb250ZW50VHlwZSkgPT4ge1xuICAgIGlmICghY29udGVudFR5cGUpIHtcbiAgICAgICAgLy8gSWYgbm8gQ29udGVudC1UeXBlIGhlYWRlciBpcyBwcm92aWRlZCwgdGhlIGJlc3Qgd2UgY2FuIGRvIGlzIHJldHVybiB0aGUgcmF3IHJlc3BvbnNlIGJvZHksXG4gICAgICAgIC8vIHdoaWNoIGlzIGVmZmVjdGl2ZWx5IHRoZSBzYW1lIGFzIHRoZSAnc3RyZWFtJyBvcHRpb24uXG4gICAgICAgIHJldHVybiBcInN0cmVhbVwiO1xuICAgIH1cbiAgICBjb25zdCBjbGVhbkNvbnRlbnQgPSBjb250ZW50VHlwZS5zcGxpdChcIjtcIilbMF0/LnRyaW0oKTtcbiAgICBpZiAoIWNsZWFuQ29udGVudCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChjbGVhbkNvbnRlbnQuc3RhcnRzV2l0aChcImFwcGxpY2F0aW9uL2pzb25cIikgfHwgY2xlYW5Db250ZW50LmVuZHNXaXRoKFwiK2pzb25cIikpIHtcbiAgICAgICAgcmV0dXJuIFwianNvblwiO1xuICAgIH1cbiAgICBpZiAoY2xlYW5Db250ZW50ID09PSBcIm11bHRpcGFydC9mb3JtLWRhdGFcIikge1xuICAgICAgICByZXR1cm4gXCJmb3JtRGF0YVwiO1xuICAgIH1cbiAgICBpZiAoW1wiYXBwbGljYXRpb24vXCIsIFwiYXVkaW8vXCIsIFwiaW1hZ2UvXCIsIFwidmlkZW8vXCJdLnNvbWUoKHR5cGUpID0+IGNsZWFuQ29udGVudC5zdGFydHNXaXRoKHR5cGUpKSkge1xuICAgICAgICByZXR1cm4gXCJibG9iXCI7XG4gICAgfVxuICAgIGlmIChjbGVhbkNvbnRlbnQuc3RhcnRzV2l0aChcInRleHQvXCIpKSB7XG4gICAgICAgIHJldHVybiBcInRleHRcIjtcbiAgICB9XG4gICAgcmV0dXJuO1xufTtcbmNvbnN0IGNoZWNrRm9yRXhpc3RlbmNlID0gKG9wdGlvbnMsIG5hbWUpID0+IHtcbiAgICBpZiAoIW5hbWUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy5oZWFkZXJzLmhhcyhuYW1lKSB8fCBvcHRpb25zLnF1ZXJ5Py5bbmFtZV0gfHwgb3B0aW9ucy5oZWFkZXJzLmdldChcIkNvb2tpZVwiKT8uaW5jbHVkZXMoYCR7bmFtZX09YCkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn07XG5leHBvcnQgY29uc3Qgc2V0QXV0aFBhcmFtcyA9IGFzeW5jICh7IHNlY3VyaXR5LCAuLi5vcHRpb25zIH0pID0+IHtcbiAgICBmb3IgKGNvbnN0IGF1dGggb2Ygc2VjdXJpdHkpIHtcbiAgICAgICAgaWYgKGNoZWNrRm9yRXhpc3RlbmNlKG9wdGlvbnMsIGF1dGgubmFtZSkpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRva2VuID0gYXdhaXQgZ2V0QXV0aFRva2VuKGF1dGgsIG9wdGlvbnMuYXV0aCk7XG4gICAgICAgIGlmICghdG9rZW4pIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5hbWUgPSBhdXRoLm5hbWUgPz8gXCJBdXRob3JpemF0aW9uXCI7XG4gICAgICAgIHN3aXRjaCAoYXV0aC5pbikge1xuICAgICAgICAgICAgY2FzZSBcInF1ZXJ5XCI6XG4gICAgICAgICAgICAgICAgaWYgKCFvcHRpb25zLnF1ZXJ5KSB7XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMucXVlcnkgPSB7fTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5xdWVyeVtuYW1lXSA9IHRva2VuO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImNvb2tpZVwiOlxuICAgICAgICAgICAgICAgIG9wdGlvbnMuaGVhZGVycy5hcHBlbmQoXCJDb29raWVcIiwgYCR7bmFtZX09JHt0b2tlbn1gKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJoZWFkZXJcIjpcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5oZWFkZXJzLnNldChuYW1lLCB0b2tlbik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG59O1xuZXhwb3J0IGNvbnN0IGJ1aWxkVXJsID0gKG9wdGlvbnMpID0+IGdldFVybCh7XG4gICAgYmFzZVVybDogb3B0aW9ucy5iYXNlVXJsLFxuICAgIHBhdGg6IG9wdGlvbnMucGF0aCxcbiAgICBxdWVyeTogb3B0aW9ucy5xdWVyeSxcbiAgICBxdWVyeVNlcmlhbGl6ZXI6IHR5cGVvZiBvcHRpb25zLnF1ZXJ5U2VyaWFsaXplciA9PT0gXCJmdW5jdGlvblwiXG4gICAgICAgID8gb3B0aW9ucy5xdWVyeVNlcmlhbGl6ZXJcbiAgICAgICAgOiBjcmVhdGVRdWVyeVNlcmlhbGl6ZXIob3B0aW9ucy5xdWVyeVNlcmlhbGl6ZXIpLFxuICAgIHVybDogb3B0aW9ucy51cmwsXG59KTtcbmV4cG9ydCBjb25zdCBtZXJnZUNvbmZpZ3MgPSAoYSwgYikgPT4ge1xuICAgIGNvbnN0IGNvbmZpZyA9IHsgLi4uYSwgLi4uYiB9O1xuICAgIGlmIChjb25maWcuYmFzZVVybD8uZW5kc1dpdGgoXCIvXCIpKSB7XG4gICAgICAgIGNvbmZpZy5iYXNlVXJsID0gY29uZmlnLmJhc2VVcmwuc3Vic3RyaW5nKDAsIGNvbmZpZy5iYXNlVXJsLmxlbmd0aCAtIDEpO1xuICAgIH1cbiAgICBjb25maWcuaGVhZGVycyA9IG1lcmdlSGVhZGVycyhhLmhlYWRlcnMsIGIuaGVhZGVycyk7XG4gICAgcmV0dXJuIGNvbmZpZztcbn07XG5leHBvcnQgY29uc3QgbWVyZ2VIZWFkZXJzID0gKC4uLmhlYWRlcnMpID0+IHtcbiAgICBjb25zdCBtZXJnZWRIZWFkZXJzID0gbmV3IEhlYWRlcnMoKTtcbiAgICBmb3IgKGNvbnN0IGhlYWRlciBvZiBoZWFkZXJzKSB7XG4gICAgICAgIGlmICghaGVhZGVyIHx8IHR5cGVvZiBoZWFkZXIgIT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGl0ZXJhdG9yID0gaGVhZGVyIGluc3RhbmNlb2YgSGVhZGVycyA/IGhlYWRlci5lbnRyaWVzKCkgOiBPYmplY3QuZW50cmllcyhoZWFkZXIpO1xuICAgICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBpdGVyYXRvcikge1xuICAgICAgICAgICAgaWYgKHZhbHVlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbWVyZ2VkSGVhZGVycy5kZWxldGUoa2V5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCB2IG9mIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lcmdlZEhlYWRlcnMuYXBwZW5kKGtleSwgdik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIC8vIGFzc3VtZSBvYmplY3QgaGVhZGVycyBhcmUgbWVhbnQgdG8gYmUgSlNPTiBzdHJpbmdpZmllZCwgaS5lLiB0aGVpclxuICAgICAgICAgICAgICAgIC8vIGNvbnRlbnQgdmFsdWUgaW4gT3BlbkFQSSBzcGVjaWZpY2F0aW9uIGlzICdhcHBsaWNhdGlvbi9qc29uJ1xuICAgICAgICAgICAgICAgIG1lcmdlZEhlYWRlcnMuc2V0KGtleSwgdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiID8gSlNPTi5zdHJpbmdpZnkodmFsdWUpIDogdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBtZXJnZWRIZWFkZXJzO1xufTtcbmNsYXNzIEludGVyY2VwdG9ycyB7XG4gICAgX2ZucztcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5fZm5zID0gW107XG4gICAgfVxuICAgIGNsZWFyKCkge1xuICAgICAgICB0aGlzLl9mbnMgPSBbXTtcbiAgICB9XG4gICAgZ2V0SW50ZXJjZXB0b3JJbmRleChpZCkge1xuICAgICAgICBpZiAodHlwZW9mIGlkID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZm5zW2lkXSA/IGlkIDogLTE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZm5zLmluZGV4T2YoaWQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGV4aXN0cyhpZCkge1xuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuZ2V0SW50ZXJjZXB0b3JJbmRleChpZCk7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2Zuc1tpbmRleF07XG4gICAgfVxuICAgIGVqZWN0KGlkKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5nZXRJbnRlcmNlcHRvckluZGV4KGlkKTtcbiAgICAgICAgaWYgKHRoaXMuX2Zuc1tpbmRleF0pIHtcbiAgICAgICAgICAgIHRoaXMuX2Zuc1tpbmRleF0gPSBudWxsO1xuICAgICAgICB9XG4gICAgfVxuICAgIHVwZGF0ZShpZCwgZm4pIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmdldEludGVyY2VwdG9ySW5kZXgoaWQpO1xuICAgICAgICBpZiAodGhpcy5fZm5zW2luZGV4XSkge1xuICAgICAgICAgICAgdGhpcy5fZm5zW2luZGV4XSA9IGZuO1xuICAgICAgICAgICAgcmV0dXJuIGlkO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHVzZShmbikge1xuICAgICAgICB0aGlzLl9mbnMgPSBbLi4udGhpcy5fZm5zLCBmbl07XG4gICAgICAgIHJldHVybiB0aGlzLl9mbnMubGVuZ3RoIC0gMTtcbiAgICB9XG59XG4vLyBkbyBub3QgYWRkIGBNaWRkbGV3YXJlYCBhcyByZXR1cm4gdHlwZSBzbyB3ZSBjYW4gdXNlIF9mbnMgaW50ZXJuYWxseVxuZXhwb3J0IGNvbnN0IGNyZWF0ZUludGVyY2VwdG9ycyA9ICgpID0+ICh7XG4gICAgZXJyb3I6IG5ldyBJbnRlcmNlcHRvcnMoKSxcbiAgICByZXF1ZXN0OiBuZXcgSW50ZXJjZXB0b3JzKCksXG4gICAgcmVzcG9uc2U6IG5ldyBJbnRlcmNlcHRvcnMoKSxcbn0pO1xuY29uc3QgZGVmYXVsdFF1ZXJ5U2VyaWFsaXplciA9IGNyZWF0ZVF1ZXJ5U2VyaWFsaXplcih7XG4gICAgYWxsb3dSZXNlcnZlZDogZmFsc2UsXG4gICAgYXJyYXk6IHtcbiAgICAgICAgZXhwbG9kZTogdHJ1ZSxcbiAgICAgICAgc3R5bGU6IFwiZm9ybVwiLFxuICAgIH0sXG4gICAgb2JqZWN0OiB7XG4gICAgICAgIGV4cGxvZGU6IHRydWUsXG4gICAgICAgIHN0eWxlOiBcImRlZXBPYmplY3RcIixcbiAgICB9LFxufSk7XG5jb25zdCBkZWZhdWx0SGVhZGVycyA9IHtcbiAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbn07XG5leHBvcnQgY29uc3QgY3JlYXRlQ29uZmlnID0gKG92ZXJyaWRlID0ge30pID0+ICh7XG4gICAgLi4uanNvbkJvZHlTZXJpYWxpemVyLFxuICAgIGhlYWRlcnM6IGRlZmF1bHRIZWFkZXJzLFxuICAgIHBhcnNlQXM6IFwiYXV0b1wiLFxuICAgIHF1ZXJ5U2VyaWFsaXplcjogZGVmYXVsdFF1ZXJ5U2VyaWFsaXplcixcbiAgICAuLi5vdmVycmlkZSxcbn0pO1xuIiwKICAgICIvLyBUaGlzIGZpbGUgaXMgYXV0by1nZW5lcmF0ZWQgYnkgQGhleS1hcGkvb3BlbmFwaS10c1xuaW1wb3J0IHsgY3JlYXRlU3NlQ2xpZW50IH0gZnJvbSBcIi4uL2NvcmUvc2VydmVyU2VudEV2ZW50cy5nZW4uanNcIjtcbmltcG9ydCB7IGJ1aWxkVXJsLCBjcmVhdGVDb25maWcsIGNyZWF0ZUludGVyY2VwdG9ycywgZ2V0UGFyc2VBcywgbWVyZ2VDb25maWdzLCBtZXJnZUhlYWRlcnMsIHNldEF1dGhQYXJhbXMsIH0gZnJvbSBcIi4vdXRpbHMuZ2VuLmpzXCI7XG5leHBvcnQgY29uc3QgY3JlYXRlQ2xpZW50ID0gKGNvbmZpZyA9IHt9KSA9PiB7XG4gICAgbGV0IF9jb25maWcgPSBtZXJnZUNvbmZpZ3MoY3JlYXRlQ29uZmlnKCksIGNvbmZpZyk7XG4gICAgY29uc3QgZ2V0Q29uZmlnID0gKCkgPT4gKHsgLi4uX2NvbmZpZyB9KTtcbiAgICBjb25zdCBzZXRDb25maWcgPSAoY29uZmlnKSA9PiB7XG4gICAgICAgIF9jb25maWcgPSBtZXJnZUNvbmZpZ3MoX2NvbmZpZywgY29uZmlnKTtcbiAgICAgICAgcmV0dXJuIGdldENvbmZpZygpO1xuICAgIH07XG4gICAgY29uc3QgaW50ZXJjZXB0b3JzID0gY3JlYXRlSW50ZXJjZXB0b3JzKCk7XG4gICAgY29uc3QgYmVmb3JlUmVxdWVzdCA9IGFzeW5jIChvcHRpb25zKSA9PiB7XG4gICAgICAgIGNvbnN0IG9wdHMgPSB7XG4gICAgICAgICAgICAuLi5fY29uZmlnLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGZldGNoOiBvcHRpb25zLmZldGNoID8/IF9jb25maWcuZmV0Y2ggPz8gZ2xvYmFsVGhpcy5mZXRjaCxcbiAgICAgICAgICAgIGhlYWRlcnM6IG1lcmdlSGVhZGVycyhfY29uZmlnLmhlYWRlcnMsIG9wdGlvbnMuaGVhZGVycyksXG4gICAgICAgICAgICBzZXJpYWxpemVkQm9keTogdW5kZWZpbmVkLFxuICAgICAgICB9O1xuICAgICAgICBpZiAob3B0cy5zZWN1cml0eSkge1xuICAgICAgICAgICAgYXdhaXQgc2V0QXV0aFBhcmFtcyh7XG4gICAgICAgICAgICAgICAgLi4ub3B0cyxcbiAgICAgICAgICAgICAgICBzZWN1cml0eTogb3B0cy5zZWN1cml0eSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvcHRzLnJlcXVlc3RWYWxpZGF0b3IpIHtcbiAgICAgICAgICAgIGF3YWl0IG9wdHMucmVxdWVzdFZhbGlkYXRvcihvcHRzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob3B0cy5ib2R5ICYmIG9wdHMuYm9keVNlcmlhbGl6ZXIpIHtcbiAgICAgICAgICAgIG9wdHMuc2VyaWFsaXplZEJvZHkgPSBvcHRzLmJvZHlTZXJpYWxpemVyKG9wdHMuYm9keSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gcmVtb3ZlIENvbnRlbnQtVHlwZSBoZWFkZXIgaWYgYm9keSBpcyBlbXB0eSB0byBhdm9pZCBzZW5kaW5nIGludmFsaWQgcmVxdWVzdHNcbiAgICAgICAgaWYgKG9wdHMuc2VyaWFsaXplZEJvZHkgPT09IHVuZGVmaW5lZCB8fCBvcHRzLnNlcmlhbGl6ZWRCb2R5ID09PSBcIlwiKSB7XG4gICAgICAgICAgICBvcHRzLmhlYWRlcnMuZGVsZXRlKFwiQ29udGVudC1UeXBlXCIpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHVybCA9IGJ1aWxkVXJsKG9wdHMpO1xuICAgICAgICByZXR1cm4geyBvcHRzLCB1cmwgfTtcbiAgICB9O1xuICAgIGNvbnN0IHJlcXVlc3QgPSBhc3luYyAob3B0aW9ucykgPT4ge1xuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yXG4gICAgICAgIGNvbnN0IHsgb3B0cywgdXJsIH0gPSBhd2FpdCBiZWZvcmVSZXF1ZXN0KG9wdGlvbnMpO1xuICAgICAgICBjb25zdCByZXF1ZXN0SW5pdCA9IHtcbiAgICAgICAgICAgIHJlZGlyZWN0OiBcImZvbGxvd1wiLFxuICAgICAgICAgICAgLi4ub3B0cyxcbiAgICAgICAgICAgIGJvZHk6IG9wdHMuc2VyaWFsaXplZEJvZHksXG4gICAgICAgIH07XG4gICAgICAgIGxldCByZXF1ZXN0ID0gbmV3IFJlcXVlc3QodXJsLCByZXF1ZXN0SW5pdCk7XG4gICAgICAgIGZvciAoY29uc3QgZm4gb2YgaW50ZXJjZXB0b3JzLnJlcXVlc3QuX2Zucykge1xuICAgICAgICAgICAgaWYgKGZuKSB7XG4gICAgICAgICAgICAgICAgcmVxdWVzdCA9IGF3YWl0IGZuKHJlcXVlc3QsIG9wdHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIGZldGNoIG11c3QgYmUgYXNzaWduZWQgaGVyZSwgb3RoZXJ3aXNlIGl0IHdvdWxkIHRocm93IHRoZSBlcnJvcjpcbiAgICAgICAgLy8gVHlwZUVycm9yOiBGYWlsZWQgdG8gZXhlY3V0ZSAnZmV0Y2gnIG9uICdXaW5kb3cnOiBJbGxlZ2FsIGludm9jYXRpb25cbiAgICAgICAgY29uc3QgX2ZldGNoID0gb3B0cy5mZXRjaDtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgX2ZldGNoKHJlcXVlc3QpO1xuICAgICAgICBmb3IgKGNvbnN0IGZuIG9mIGludGVyY2VwdG9ycy5yZXNwb25zZS5fZm5zKSB7XG4gICAgICAgICAgICBpZiAoZm4pIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IGF3YWl0IGZuKHJlc3BvbnNlLCByZXF1ZXN0LCBvcHRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICAgICAgICByZXF1ZXN0LFxuICAgICAgICAgICAgcmVzcG9uc2UsXG4gICAgICAgIH07XG4gICAgICAgIGlmIChyZXNwb25zZS5vaykge1xuICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gMjA0IHx8IHJlc3BvbnNlLmhlYWRlcnMuZ2V0KFwiQ29udGVudC1MZW5ndGhcIikgPT09IFwiMFwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wdHMucmVzcG9uc2VTdHlsZSA9PT0gXCJkYXRhXCJcbiAgICAgICAgICAgICAgICAgICAgPyB7fVxuICAgICAgICAgICAgICAgICAgICA6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHt9LFxuICAgICAgICAgICAgICAgICAgICAgICAgLi4ucmVzdWx0LFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcGFyc2VBcyA9IChvcHRzLnBhcnNlQXMgPT09IFwiYXV0b1wiID8gZ2V0UGFyc2VBcyhyZXNwb25zZS5oZWFkZXJzLmdldChcIkNvbnRlbnQtVHlwZVwiKSkgOiBvcHRzLnBhcnNlQXMpID8/IFwianNvblwiO1xuICAgICAgICAgICAgbGV0IGRhdGE7XG4gICAgICAgICAgICBzd2l0Y2ggKHBhcnNlQXMpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwiYXJyYXlCdWZmZXJcIjpcbiAgICAgICAgICAgICAgICBjYXNlIFwiYmxvYlwiOlxuICAgICAgICAgICAgICAgIGNhc2UgXCJmb3JtRGF0YVwiOlxuICAgICAgICAgICAgICAgIGNhc2UgXCJqc29uXCI6XG4gICAgICAgICAgICAgICAgY2FzZSBcInRleHRcIjpcbiAgICAgICAgICAgICAgICAgICAgZGF0YSA9IGF3YWl0IHJlc3BvbnNlW3BhcnNlQXNdKCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJzdHJlYW1cIjpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9wdHMucmVzcG9uc2VTdHlsZSA9PT0gXCJkYXRhXCJcbiAgICAgICAgICAgICAgICAgICAgICAgID8gcmVzcG9uc2UuYm9keVxuICAgICAgICAgICAgICAgICAgICAgICAgOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogcmVzcG9uc2UuYm9keSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5yZXN1bHQsXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHBhcnNlQXMgPT09IFwianNvblwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9wdHMucmVzcG9uc2VWYWxpZGF0b3IpIHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgb3B0cy5yZXNwb25zZVZhbGlkYXRvcihkYXRhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG9wdHMucmVzcG9uc2VUcmFuc2Zvcm1lcikge1xuICAgICAgICAgICAgICAgICAgICBkYXRhID0gYXdhaXQgb3B0cy5yZXNwb25zZVRyYW5zZm9ybWVyKGRhdGEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBvcHRzLnJlc3BvbnNlU3R5bGUgPT09IFwiZGF0YVwiXG4gICAgICAgICAgICAgICAgPyBkYXRhXG4gICAgICAgICAgICAgICAgOiB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGEsXG4gICAgICAgICAgICAgICAgICAgIC4uLnJlc3VsdCxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRleHRFcnJvciA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbiAgICAgICAgbGV0IGpzb25FcnJvcjtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGpzb25FcnJvciA9IEpTT04ucGFyc2UodGV4dEVycm9yKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICAvLyBub29wXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZXJyb3IgPSBqc29uRXJyb3IgPz8gdGV4dEVycm9yO1xuICAgICAgICBsZXQgZmluYWxFcnJvciA9IGVycm9yO1xuICAgICAgICBmb3IgKGNvbnN0IGZuIG9mIGludGVyY2VwdG9ycy5lcnJvci5fZm5zKSB7XG4gICAgICAgICAgICBpZiAoZm4pIHtcbiAgICAgICAgICAgICAgICBmaW5hbEVycm9yID0gKGF3YWl0IGZuKGVycm9yLCByZXNwb25zZSwgcmVxdWVzdCwgb3B0cykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZpbmFsRXJyb3IgPSBmaW5hbEVycm9yIHx8IHt9O1xuICAgICAgICBpZiAob3B0cy50aHJvd09uRXJyb3IpIHtcbiAgICAgICAgICAgIHRocm93IGZpbmFsRXJyb3I7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVE9ETzogd2UgcHJvYmFibHkgd2FudCB0byByZXR1cm4gZXJyb3IgYW5kIGltcHJvdmUgdHlwZXNcbiAgICAgICAgcmV0dXJuIG9wdHMucmVzcG9uc2VTdHlsZSA9PT0gXCJkYXRhXCJcbiAgICAgICAgICAgID8gdW5kZWZpbmVkXG4gICAgICAgICAgICA6IHtcbiAgICAgICAgICAgICAgICBlcnJvcjogZmluYWxFcnJvcixcbiAgICAgICAgICAgICAgICAuLi5yZXN1bHQsXG4gICAgICAgICAgICB9O1xuICAgIH07XG4gICAgY29uc3QgbWFrZU1ldGhvZCA9IChtZXRob2QpID0+IHtcbiAgICAgICAgY29uc3QgZm4gPSAob3B0aW9ucykgPT4gcmVxdWVzdCh7IC4uLm9wdGlvbnMsIG1ldGhvZCB9KTtcbiAgICAgICAgZm4uc3NlID0gYXN5bmMgKG9wdGlvbnMpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHsgb3B0cywgdXJsIH0gPSBhd2FpdCBiZWZvcmVSZXF1ZXN0KG9wdGlvbnMpO1xuICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZVNzZUNsaWVudCh7XG4gICAgICAgICAgICAgICAgLi4ub3B0cyxcbiAgICAgICAgICAgICAgICBib2R5OiBvcHRzLmJvZHksXG4gICAgICAgICAgICAgICAgaGVhZGVyczogb3B0cy5oZWFkZXJzLFxuICAgICAgICAgICAgICAgIG1ldGhvZCxcbiAgICAgICAgICAgICAgICB1cmwsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGZuO1xuICAgIH07XG4gICAgcmV0dXJuIHtcbiAgICAgICAgYnVpbGRVcmwsXG4gICAgICAgIGNvbm5lY3Q6IG1ha2VNZXRob2QoXCJDT05ORUNUXCIpLFxuICAgICAgICBkZWxldGU6IG1ha2VNZXRob2QoXCJERUxFVEVcIiksXG4gICAgICAgIGdldDogbWFrZU1ldGhvZChcIkdFVFwiKSxcbiAgICAgICAgZ2V0Q29uZmlnLFxuICAgICAgICBoZWFkOiBtYWtlTWV0aG9kKFwiSEVBRFwiKSxcbiAgICAgICAgaW50ZXJjZXB0b3JzLFxuICAgICAgICBvcHRpb25zOiBtYWtlTWV0aG9kKFwiT1BUSU9OU1wiKSxcbiAgICAgICAgcGF0Y2g6IG1ha2VNZXRob2QoXCJQQVRDSFwiKSxcbiAgICAgICAgcG9zdDogbWFrZU1ldGhvZChcIlBPU1RcIiksXG4gICAgICAgIHB1dDogbWFrZU1ldGhvZChcIlBVVFwiKSxcbiAgICAgICAgcmVxdWVzdCxcbiAgICAgICAgc2V0Q29uZmlnLFxuICAgICAgICB0cmFjZTogbWFrZU1ldGhvZChcIlRSQUNFXCIpLFxuICAgIH07XG59O1xuIiwKICAgICIvLyBUaGlzIGZpbGUgaXMgYXV0by1nZW5lcmF0ZWQgYnkgQGhleS1hcGkvb3BlbmFwaS10c1xuY29uc3QgZXh0cmFQcmVmaXhlc01hcCA9IHtcbiAgICAkYm9keV86IFwiYm9keVwiLFxuICAgICRoZWFkZXJzXzogXCJoZWFkZXJzXCIsXG4gICAgJHBhdGhfOiBcInBhdGhcIixcbiAgICAkcXVlcnlfOiBcInF1ZXJ5XCIsXG59O1xuY29uc3QgZXh0cmFQcmVmaXhlcyA9IE9iamVjdC5lbnRyaWVzKGV4dHJhUHJlZml4ZXNNYXApO1xuY29uc3QgYnVpbGRLZXlNYXAgPSAoZmllbGRzLCBtYXApID0+IHtcbiAgICBpZiAoIW1hcCkge1xuICAgICAgICBtYXAgPSBuZXcgTWFwKCk7XG4gICAgfVxuICAgIGZvciAoY29uc3QgY29uZmlnIG9mIGZpZWxkcykge1xuICAgICAgICBpZiAoXCJpblwiIGluIGNvbmZpZykge1xuICAgICAgICAgICAgaWYgKGNvbmZpZy5rZXkpIHtcbiAgICAgICAgICAgICAgICBtYXAuc2V0KGNvbmZpZy5rZXksIHtcbiAgICAgICAgICAgICAgICAgICAgaW46IGNvbmZpZy5pbixcbiAgICAgICAgICAgICAgICAgICAgbWFwOiBjb25maWcubWFwLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGNvbmZpZy5hcmdzKSB7XG4gICAgICAgICAgICBidWlsZEtleU1hcChjb25maWcuYXJncywgbWFwKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWFwO1xufTtcbmNvbnN0IHN0cmlwRW1wdHlTbG90cyA9IChwYXJhbXMpID0+IHtcbiAgICBmb3IgKGNvbnN0IFtzbG90LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMocGFyYW1zKSkge1xuICAgICAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmICFPYmplY3Qua2V5cyh2YWx1ZSkubGVuZ3RoKSB7XG4gICAgICAgICAgICBkZWxldGUgcGFyYW1zW3Nsb3RdO1xuICAgICAgICB9XG4gICAgfVxufTtcbmV4cG9ydCBjb25zdCBidWlsZENsaWVudFBhcmFtcyA9IChhcmdzLCBmaWVsZHMpID0+IHtcbiAgICBjb25zdCBwYXJhbXMgPSB7XG4gICAgICAgIGJvZHk6IHt9LFxuICAgICAgICBoZWFkZXJzOiB7fSxcbiAgICAgICAgcGF0aDoge30sXG4gICAgICAgIHF1ZXJ5OiB7fSxcbiAgICB9O1xuICAgIGNvbnN0IG1hcCA9IGJ1aWxkS2V5TWFwKGZpZWxkcyk7XG4gICAgbGV0IGNvbmZpZztcbiAgICBmb3IgKGNvbnN0IFtpbmRleCwgYXJnXSBvZiBhcmdzLmVudHJpZXMoKSkge1xuICAgICAgICBpZiAoZmllbGRzW2luZGV4XSkge1xuICAgICAgICAgICAgY29uZmlnID0gZmllbGRzW2luZGV4XTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWNvbmZpZykge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKFwiaW5cIiBpbiBjb25maWcpIHtcbiAgICAgICAgICAgIGlmIChjb25maWcua2V5KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZmllbGQgPSBtYXAuZ2V0KGNvbmZpZy5rZXkpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBmaWVsZC5tYXAgfHwgY29uZmlnLmtleTtcbiAgICAgICAgICAgICAgICBwYXJhbXNbZmllbGQuaW5dW25hbWVdID0gYXJnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcGFyYW1zLmJvZHkgPSBhcmc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhhcmcgPz8ge30pKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZmllbGQgPSBtYXAuZ2V0KGtleSk7XG4gICAgICAgICAgICAgICAgaWYgKGZpZWxkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBmaWVsZC5tYXAgfHwga2V5O1xuICAgICAgICAgICAgICAgICAgICBwYXJhbXNbZmllbGQuaW5dW25hbWVdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBleHRyYSA9IGV4dHJhUHJlZml4ZXMuZmluZCgoW3ByZWZpeF0pID0+IGtleS5zdGFydHNXaXRoKHByZWZpeCkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXh0cmEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IFtwcmVmaXgsIHNsb3RdID0gZXh0cmE7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXNbc2xvdF1ba2V5LnNsaWNlKHByZWZpeC5sZW5ndGgpXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBbc2xvdCwgYWxsb3dlZF0gb2YgT2JqZWN0LmVudHJpZXMoY29uZmlnLmFsbG93RXh0cmEgPz8ge30pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFsbG93ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXNbc2xvdF1ba2V5XSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgc3RyaXBFbXB0eVNsb3RzKHBhcmFtcyk7XG4gICAgcmV0dXJuIHBhcmFtcztcbn07XG4iLAogICAgIi8vIFRoaXMgZmlsZSBpcyBhdXRvLWdlbmVyYXRlZCBieSBAaGV5LWFwaS9vcGVuYXBpLXRzXG5pbXBvcnQgeyBjcmVhdGVDbGllbnQsIGNyZWF0ZUNvbmZpZyB9IGZyb20gXCIuL2NsaWVudC9pbmRleC5qc1wiO1xuZXhwb3J0IGNvbnN0IGNsaWVudCA9IGNyZWF0ZUNsaWVudChjcmVhdGVDb25maWcoe1xuICAgIGJhc2VVcmw6IFwiaHR0cDovL2xvY2FsaG9zdDo0MDk2XCIsXG59KSk7XG4iLAogICAgIi8vIFRoaXMgZmlsZSBpcyBhdXRvLWdlbmVyYXRlZCBieSBAaGV5LWFwaS9vcGVuYXBpLXRzXG5pbXBvcnQgeyBjbGllbnQgYXMgX2hleUFwaUNsaWVudCB9IGZyb20gXCIuL2NsaWVudC5nZW4uanNcIjtcbmNsYXNzIF9IZXlBcGlDbGllbnQge1xuICAgIF9jbGllbnQgPSBfaGV5QXBpQ2xpZW50O1xuICAgIGNvbnN0cnVjdG9yKGFyZ3MpIHtcbiAgICAgICAgaWYgKGFyZ3M/LmNsaWVudCkge1xuICAgICAgICAgICAgdGhpcy5fY2xpZW50ID0gYXJncy5jbGllbnQ7XG4gICAgICAgIH1cbiAgICB9XG59XG5jbGFzcyBHbG9iYWwgZXh0ZW5kcyBfSGV5QXBpQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBHZXQgZXZlbnRzXG4gICAgICovXG4gICAgZXZlbnQob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldC5zc2Uoe1xuICAgICAgICAgICAgdXJsOiBcIi9nbG9iYWwvZXZlbnRcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmNsYXNzIFByb2plY3QgZXh0ZW5kcyBfSGV5QXBpQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBMaXN0IGFsbCBwcm9qZWN0c1xuICAgICAqL1xuICAgIGxpc3Qob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Byb2plY3RcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGN1cnJlbnQgcHJvamVjdFxuICAgICAqL1xuICAgIGN1cnJlbnQob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Byb2plY3QvY3VycmVudFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuY2xhc3MgUHR5IGV4dGVuZHMgX0hleUFwaUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogTGlzdCBhbGwgUFRZIHNlc3Npb25zXG4gICAgICovXG4gICAgbGlzdChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvcHR5XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IFBUWSBzZXNzaW9uXG4gICAgICovXG4gICAgY3JlYXRlKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvcHR5XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnM/LmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVtb3ZlIGEgUFRZIHNlc3Npb25cbiAgICAgKi9cbiAgICByZW1vdmUob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZGVsZXRlKHtcbiAgICAgICAgICAgIHVybDogXCIvcHR5L3tpZH1cIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgUFRZIHNlc3Npb24gaW5mb1xuICAgICAqL1xuICAgIGdldChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9wdHkve2lkfVwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFVwZGF0ZSBQVFkgc2Vzc2lvblxuICAgICAqL1xuICAgIHVwZGF0ZShvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wdXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9wdHkve2lkfVwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zLmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ29ubmVjdCB0byBhIFBUWSBzZXNzaW9uXG4gICAgICovXG4gICAgY29ubmVjdChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9wdHkve2lkfS9jb25uZWN0XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG59XG5jbGFzcyBDb25maWcgZXh0ZW5kcyBfSGV5QXBpQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBHZXQgY29uZmlnIGluZm9cbiAgICAgKi9cbiAgICBnZXQob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL2NvbmZpZ1wiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFVwZGF0ZSBjb25maWdcbiAgICAgKi9cbiAgICB1cGRhdGUob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBhdGNoKHtcbiAgICAgICAgICAgIHVybDogXCIvY29uZmlnXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnM/LmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogTGlzdCBhbGwgcHJvdmlkZXJzXG4gICAgICovXG4gICAgcHJvdmlkZXJzKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9jb25maWcvcHJvdmlkZXJzXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG59XG5jbGFzcyBUb29sIGV4dGVuZHMgX0hleUFwaUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogTGlzdCBhbGwgdG9vbCBJRHMgKGluY2x1ZGluZyBidWlsdC1pbiBhbmQgZHluYW1pY2FsbHkgcmVnaXN0ZXJlZClcbiAgICAgKi9cbiAgICBpZHMob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL2V4cGVyaW1lbnRhbC90b29sL2lkc1wiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIExpc3QgdG9vbHMgd2l0aCBKU09OIHNjaGVtYSBwYXJhbWV0ZXJzIGZvciBhIHByb3ZpZGVyL21vZGVsXG4gICAgICovXG4gICAgbGlzdChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9leHBlcmltZW50YWwvdG9vbFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuY2xhc3MgSW5zdGFuY2UgZXh0ZW5kcyBfSGV5QXBpQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBEaXNwb3NlIHRoZSBjdXJyZW50IGluc3RhbmNlXG4gICAgICovXG4gICAgZGlzcG9zZShvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL2luc3RhbmNlL2Rpc3Bvc2VcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmNsYXNzIFBhdGggZXh0ZW5kcyBfSGV5QXBpQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGN1cnJlbnQgcGF0aFxuICAgICAqL1xuICAgIGdldChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvcGF0aFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuY2xhc3MgVmNzIGV4dGVuZHMgX0hleUFwaUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogR2V0IFZDUyBpbmZvIGZvciB0aGUgY3VycmVudCBpbnN0YW5jZVxuICAgICAqL1xuICAgIGdldChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvdmNzXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG59XG5jbGFzcyBTZXNzaW9uIGV4dGVuZHMgX0hleUFwaUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogTGlzdCBhbGwgc2Vzc2lvbnNcbiAgICAgKi9cbiAgICBsaXN0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9zZXNzaW9uXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IHNlc3Npb25cbiAgICAgKi9cbiAgICBjcmVhdGUob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi9zZXNzaW9uXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnM/LmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0IHNlc3Npb24gc3RhdHVzXG4gICAgICovXG4gICAgc3RhdHVzKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9zZXNzaW9uL3N0YXR1c1wiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERlbGV0ZSBhIHNlc3Npb24gYW5kIGFsbCBpdHMgZGF0YVxuICAgICAqL1xuICAgIGRlbGV0ZShvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5kZWxldGUoe1xuICAgICAgICAgICAgdXJsOiBcIi9zZXNzaW9uL3tpZH1cIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgc2Vzc2lvblxuICAgICAqL1xuICAgIGdldChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9zZXNzaW9uL3tpZH1cIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgc2Vzc2lvbiBwcm9wZXJ0aWVzXG4gICAgICovXG4gICAgdXBkYXRlKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBhdGNoKHtcbiAgICAgICAgICAgIHVybDogXCIvc2Vzc2lvbi97aWR9XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnMuaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgYSBzZXNzaW9uJ3MgY2hpbGRyZW5cbiAgICAgKi9cbiAgICBjaGlsZHJlbihvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9zZXNzaW9uL3tpZH0vY2hpbGRyZW5cIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHRvZG8gbGlzdCBmb3IgYSBzZXNzaW9uXG4gICAgICovXG4gICAgdG9kbyhvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9zZXNzaW9uL3tpZH0vdG9kb1wiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFuYWx5emUgdGhlIGFwcCBhbmQgY3JlYXRlIGFuIEFHRU5UUy5tZCBmaWxlXG4gICAgICovXG4gICAgaW5pdChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvc2Vzc2lvbi97aWR9L2luaXRcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEZvcmsgYW4gZXhpc3Rpbmcgc2Vzc2lvbiBhdCBhIHNwZWNpZmljIG1lc3NhZ2VcbiAgICAgKi9cbiAgICBmb3JrKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi9zZXNzaW9uL3tpZH0vZm9ya1wiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zLmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQWJvcnQgYSBzZXNzaW9uXG4gICAgICovXG4gICAgYWJvcnQob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Nlc3Npb24ve2lkfS9hYm9ydFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFVuc2hhcmUgdGhlIHNlc3Npb25cbiAgICAgKi9cbiAgICB1bnNoYXJlKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmRlbGV0ZSh7XG4gICAgICAgICAgICB1cmw6IFwiL3Nlc3Npb24ve2lkfS9zaGFyZVwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNoYXJlIGEgc2Vzc2lvblxuICAgICAqL1xuICAgIHNoYXJlKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi9zZXNzaW9uL3tpZH0vc2hhcmVcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGRpZmYgZm9yIHRoaXMgc2Vzc2lvblxuICAgICAqL1xuICAgIGRpZmYob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvc2Vzc2lvbi97aWR9L2RpZmZcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTdW1tYXJpemUgdGhlIHNlc3Npb25cbiAgICAgKi9cbiAgICBzdW1tYXJpemUob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Nlc3Npb24ve2lkfS9zdW1tYXJpemVcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIExpc3QgbWVzc2FnZXMgZm9yIGEgc2Vzc2lvblxuICAgICAqL1xuICAgIG1lc3NhZ2VzKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Nlc3Npb24ve2lkfS9tZXNzYWdlXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGFuZCBzZW5kIGEgbmV3IG1lc3NhZ2UgdG8gYSBzZXNzaW9uXG4gICAgICovXG4gICAgcHJvbXB0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi9zZXNzaW9uL3tpZH0vbWVzc2FnZVwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zLmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0IGEgbWVzc2FnZSBmcm9tIGEgc2Vzc2lvblxuICAgICAqL1xuICAgIG1lc3NhZ2Uob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvc2Vzc2lvbi97aWR9L21lc3NhZ2Uve21lc3NhZ2VJRH1cIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYW5kIHNlbmQgYSBuZXcgbWVzc2FnZSB0byBhIHNlc3Npb24sIHN0YXJ0IGlmIG5lZWRlZCBhbmQgcmV0dXJuIGltbWVkaWF0ZWx5XG4gICAgICovXG4gICAgcHJvbXB0QXN5bmMob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Nlc3Npb24ve2lkfS9wcm9tcHRfYXN5bmNcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNlbmQgYSBuZXcgY29tbWFuZCB0byBhIHNlc3Npb25cbiAgICAgKi9cbiAgICBjb21tYW5kKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi9zZXNzaW9uL3tpZH0vY29tbWFuZFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zLmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUnVuIGEgc2hlbGwgY29tbWFuZFxuICAgICAqL1xuICAgIHNoZWxsKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi9zZXNzaW9uL3tpZH0vc2hlbGxcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJldmVydCBhIG1lc3NhZ2VcbiAgICAgKi9cbiAgICByZXZlcnQob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Nlc3Npb24ve2lkfS9yZXZlcnRcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlc3RvcmUgYWxsIHJldmVydGVkIG1lc3NhZ2VzXG4gICAgICovXG4gICAgdW5yZXZlcnQob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Nlc3Npb24ve2lkfS91bnJldmVydFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuY2xhc3MgQ29tbWFuZCBleHRlbmRzIF9IZXlBcGlDbGllbnQge1xuICAgIC8qKlxuICAgICAqIExpc3QgYWxsIGNvbW1hbmRzXG4gICAgICovXG4gICAgbGlzdChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvY29tbWFuZFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuY2xhc3MgT2F1dGggZXh0ZW5kcyBfSGV5QXBpQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBBdXRob3JpemUgYSBwcm92aWRlciB1c2luZyBPQXV0aFxuICAgICAqL1xuICAgIGF1dGhvcml6ZShvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvcHJvdmlkZXIve2lkfS9vYXV0aC9hdXRob3JpemVcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEhhbmRsZSBPQXV0aCBjYWxsYmFjayBmb3IgYSBwcm92aWRlclxuICAgICAqL1xuICAgIGNhbGxiYWNrKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi9wcm92aWRlci97aWR9L29hdXRoL2NhbGxiYWNrXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnMuaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmNsYXNzIFByb3ZpZGVyIGV4dGVuZHMgX0hleUFwaUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogTGlzdCBhbGwgcHJvdmlkZXJzXG4gICAgICovXG4gICAgbGlzdChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvcHJvdmlkZXJcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgcHJvdmlkZXIgYXV0aGVudGljYXRpb24gbWV0aG9kc1xuICAgICAqL1xuICAgIGF1dGgob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Byb3ZpZGVyL2F1dGhcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBvYXV0aCA9IG5ldyBPYXV0aCh7IGNsaWVudDogdGhpcy5fY2xpZW50IH0pO1xufVxuY2xhc3MgRmluZCBleHRlbmRzIF9IZXlBcGlDbGllbnQge1xuICAgIC8qKlxuICAgICAqIEZpbmQgdGV4dCBpbiBmaWxlc1xuICAgICAqL1xuICAgIHRleHQob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvZmluZFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEZpbmQgZmlsZXNcbiAgICAgKi9cbiAgICBmaWxlcyhvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9maW5kL2ZpbGVcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBGaW5kIHdvcmtzcGFjZSBzeW1ib2xzXG4gICAgICovXG4gICAgc3ltYm9scyhvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9maW5kL3N5bWJvbFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuY2xhc3MgRmlsZSBleHRlbmRzIF9IZXlBcGlDbGllbnQge1xuICAgIC8qKlxuICAgICAqIExpc3QgZmlsZXMgYW5kIGRpcmVjdG9yaWVzXG4gICAgICovXG4gICAgbGlzdChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9maWxlXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVhZCBhIGZpbGVcbiAgICAgKi9cbiAgICByZWFkKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL2ZpbGUvY29udGVudFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCBmaWxlIHN0YXR1c1xuICAgICAqL1xuICAgIHN0YXR1cyhvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvZmlsZS9zdGF0dXNcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmNsYXNzIEFwcCBleHRlbmRzIF9IZXlBcGlDbGllbnQge1xuICAgIC8qKlxuICAgICAqIFdyaXRlIGEgbG9nIGVudHJ5IHRvIHRoZSBzZXJ2ZXIgbG9nc1xuICAgICAqL1xuICAgIGxvZyhvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL2xvZ1wiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zPy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIExpc3QgYWxsIGFnZW50c1xuICAgICAqL1xuICAgIGFnZW50cyhvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvYWdlbnRcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmNsYXNzIEF1dGggZXh0ZW5kcyBfSGV5QXBpQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBSZW1vdmUgT0F1dGggY3JlZGVudGlhbHMgZm9yIGFuIE1DUCBzZXJ2ZXJcbiAgICAgKi9cbiAgICByZW1vdmUob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZGVsZXRlKHtcbiAgICAgICAgICAgIHVybDogXCIvbWNwL3tuYW1lfS9hdXRoXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU3RhcnQgT0F1dGggYXV0aGVudGljYXRpb24gZmxvdyBmb3IgYW4gTUNQIHNlcnZlclxuICAgICAqL1xuICAgIHN0YXJ0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi9tY3Ave25hbWV9L2F1dGhcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDb21wbGV0ZSBPQXV0aCBhdXRoZW50aWNhdGlvbiB3aXRoIGF1dGhvcml6YXRpb24gY29kZVxuICAgICAqL1xuICAgIGNhbGxiYWNrKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi9tY3Ave25hbWV9L2F1dGgvY2FsbGJhY2tcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFN0YXJ0IE9BdXRoIGZsb3cgYW5kIHdhaXQgZm9yIGNhbGxiYWNrIChvcGVucyBicm93c2VyKVxuICAgICAqL1xuICAgIGF1dGhlbnRpY2F0ZShvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvbWNwL3tuYW1lfS9hdXRoL2F1dGhlbnRpY2F0ZVwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldCBhdXRoZW50aWNhdGlvbiBjcmVkZW50aWFsc1xuICAgICAqL1xuICAgIHNldChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wdXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9hdXRoL3tpZH1cIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuY2xhc3MgTWNwIGV4dGVuZHMgX0hleUFwaUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogR2V0IE1DUCBzZXJ2ZXIgc3RhdHVzXG4gICAgICovXG4gICAgc3RhdHVzKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9tY3BcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBZGQgTUNQIHNlcnZlciBkeW5hbWljYWxseVxuICAgICAqL1xuICAgIGFkZChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL21jcFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zPy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENvbm5lY3QgYW4gTUNQIHNlcnZlclxuICAgICAqL1xuICAgIGNvbm5lY3Qob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL21jcC97bmFtZX0vY29ubmVjdFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERpc2Nvbm5lY3QgYW4gTUNQIHNlcnZlclxuICAgICAqL1xuICAgIGRpc2Nvbm5lY3Qob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL21jcC97bmFtZX0vZGlzY29ubmVjdFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGF1dGggPSBuZXcgQXV0aCh7IGNsaWVudDogdGhpcy5fY2xpZW50IH0pO1xufVxuY2xhc3MgTHNwIGV4dGVuZHMgX0hleUFwaUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogR2V0IExTUCBzZXJ2ZXIgc3RhdHVzXG4gICAgICovXG4gICAgc3RhdHVzKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9sc3BcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmNsYXNzIEZvcm1hdHRlciBleHRlbmRzIF9IZXlBcGlDbGllbnQge1xuICAgIC8qKlxuICAgICAqIEdldCBmb3JtYXR0ZXIgc3RhdHVzXG4gICAgICovXG4gICAgc3RhdHVzKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9mb3JtYXR0ZXJcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmNsYXNzIENvbnRyb2wgZXh0ZW5kcyBfSGV5QXBpQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIG5leHQgVFVJIHJlcXVlc3QgZnJvbSB0aGUgcXVldWVcbiAgICAgKi9cbiAgICBuZXh0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi90dWkvY29udHJvbC9uZXh0XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU3VibWl0IGEgcmVzcG9uc2UgdG8gdGhlIFRVSSByZXF1ZXN0IHF1ZXVlXG4gICAgICovXG4gICAgcmVzcG9uc2Uob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi90dWkvY29udHJvbC9yZXNwb25zZVwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zPy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuY2xhc3MgVHVpIGV4dGVuZHMgX0hleUFwaUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogQXBwZW5kIHByb21wdCB0byB0aGUgVFVJXG4gICAgICovXG4gICAgYXBwZW5kUHJvbXB0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvdHVpL2FwcGVuZC1wcm9tcHRcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucz8uaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBPcGVuIHRoZSBoZWxwIGRpYWxvZ1xuICAgICAqL1xuICAgIG9wZW5IZWxwKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvdHVpL29wZW4taGVscFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE9wZW4gdGhlIHNlc3Npb24gZGlhbG9nXG4gICAgICovXG4gICAgb3BlblNlc3Npb25zKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvdHVpL29wZW4tc2Vzc2lvbnNcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBPcGVuIHRoZSB0aGVtZSBkaWFsb2dcbiAgICAgKi9cbiAgICBvcGVuVGhlbWVzKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvdHVpL29wZW4tdGhlbWVzXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogT3BlbiB0aGUgbW9kZWwgZGlhbG9nXG4gICAgICovXG4gICAgb3Blbk1vZGVscyhvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3R1aS9vcGVuLW1vZGVsc1wiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFN1Ym1pdCB0aGUgcHJvbXB0XG4gICAgICovXG4gICAgc3VibWl0UHJvbXB0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvdHVpL3N1Ym1pdC1wcm9tcHRcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDbGVhciB0aGUgcHJvbXB0XG4gICAgICovXG4gICAgY2xlYXJQcm9tcHQob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi90dWkvY2xlYXItcHJvbXB0XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRXhlY3V0ZSBhIFRVSSBjb21tYW5kIChlLmcuIGFnZW50X2N5Y2xlKVxuICAgICAqL1xuICAgIGV4ZWN1dGVDb21tYW5kKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvdHVpL2V4ZWN1dGUtY29tbWFuZFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zPy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNob3cgYSB0b2FzdCBub3RpZmljYXRpb24gaW4gdGhlIFRVSVxuICAgICAqL1xuICAgIHNob3dUb2FzdChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3R1aS9zaG93LXRvYXN0XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnM/LmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUHVibGlzaCBhIFRVSSBldmVudFxuICAgICAqL1xuICAgIHB1Ymxpc2gob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi90dWkvcHVibGlzaFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zPy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGNvbnRyb2wgPSBuZXcgQ29udHJvbCh7IGNsaWVudDogdGhpcy5fY2xpZW50IH0pO1xufVxuY2xhc3MgRXZlbnQgZXh0ZW5kcyBfSGV5QXBpQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBHZXQgZXZlbnRzXG4gICAgICovXG4gICAgc3Vic2NyaWJlKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQuc3NlKHtcbiAgICAgICAgICAgIHVybDogXCIvZXZlbnRcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBPcGVuY29kZUNsaWVudCBleHRlbmRzIF9IZXlBcGlDbGllbnQge1xuICAgIC8qKlxuICAgICAqIFJlc3BvbmQgdG8gYSBwZXJtaXNzaW9uIHJlcXVlc3RcbiAgICAgKi9cbiAgICBwb3N0U2Vzc2lvbklkUGVybWlzc2lvbnNQZXJtaXNzaW9uSWQob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Nlc3Npb24ve2lkfS9wZXJtaXNzaW9ucy97cGVybWlzc2lvbklEfVwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zLmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZ2xvYmFsID0gbmV3IEdsb2JhbCh7IGNsaWVudDogdGhpcy5fY2xpZW50IH0pO1xuICAgIHByb2plY3QgPSBuZXcgUHJvamVjdCh7IGNsaWVudDogdGhpcy5fY2xpZW50IH0pO1xuICAgIHB0eSA9IG5ldyBQdHkoeyBjbGllbnQ6IHRoaXMuX2NsaWVudCB9KTtcbiAgICBjb25maWcgPSBuZXcgQ29uZmlnKHsgY2xpZW50OiB0aGlzLl9jbGllbnQgfSk7XG4gICAgdG9vbCA9IG5ldyBUb29sKHsgY2xpZW50OiB0aGlzLl9jbGllbnQgfSk7XG4gICAgaW5zdGFuY2UgPSBuZXcgSW5zdGFuY2UoeyBjbGllbnQ6IHRoaXMuX2NsaWVudCB9KTtcbiAgICBwYXRoID0gbmV3IFBhdGgoeyBjbGllbnQ6IHRoaXMuX2NsaWVudCB9KTtcbiAgICB2Y3MgPSBuZXcgVmNzKHsgY2xpZW50OiB0aGlzLl9jbGllbnQgfSk7XG4gICAgc2Vzc2lvbiA9IG5ldyBTZXNzaW9uKHsgY2xpZW50OiB0aGlzLl9jbGllbnQgfSk7XG4gICAgY29tbWFuZCA9IG5ldyBDb21tYW5kKHsgY2xpZW50OiB0aGlzLl9jbGllbnQgfSk7XG4gICAgcHJvdmlkZXIgPSBuZXcgUHJvdmlkZXIoeyBjbGllbnQ6IHRoaXMuX2NsaWVudCB9KTtcbiAgICBmaW5kID0gbmV3IEZpbmQoeyBjbGllbnQ6IHRoaXMuX2NsaWVudCB9KTtcbiAgICBmaWxlID0gbmV3IEZpbGUoeyBjbGllbnQ6IHRoaXMuX2NsaWVudCB9KTtcbiAgICBhcHAgPSBuZXcgQXBwKHsgY2xpZW50OiB0aGlzLl9jbGllbnQgfSk7XG4gICAgbWNwID0gbmV3IE1jcCh7IGNsaWVudDogdGhpcy5fY2xpZW50IH0pO1xuICAgIGxzcCA9IG5ldyBMc3AoeyBjbGllbnQ6IHRoaXMuX2NsaWVudCB9KTtcbiAgICBmb3JtYXR0ZXIgPSBuZXcgRm9ybWF0dGVyKHsgY2xpZW50OiB0aGlzLl9jbGllbnQgfSk7XG4gICAgdHVpID0gbmV3IFR1aSh7IGNsaWVudDogdGhpcy5fY2xpZW50IH0pO1xuICAgIGF1dGggPSBuZXcgQXV0aCh7IGNsaWVudDogdGhpcy5fY2xpZW50IH0pO1xuICAgIGV2ZW50ID0gbmV3IEV2ZW50KHsgY2xpZW50OiB0aGlzLl9jbGllbnQgfSk7XG59XG4iLAogICAgImV4cG9ydCAqIGZyb20gXCIuL2dlbi90eXBlcy5nZW4uanNcIjtcbmltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gXCIuL2dlbi9jbGllbnQvY2xpZW50Lmdlbi5qc1wiO1xuaW1wb3J0IHsgT3BlbmNvZGVDbGllbnQgfSBmcm9tIFwiLi9nZW4vc2RrLmdlbi5qc1wiO1xuZXhwb3J0IHsgT3BlbmNvZGVDbGllbnQgfTtcbmZ1bmN0aW9uIHBpY2sodmFsdWUsIGZhbGxiYWNrKSB7XG4gICAgaWYgKCF2YWx1ZSlcbiAgICAgICAgcmV0dXJuO1xuICAgIGlmICghZmFsbGJhY2spXG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICBpZiAodmFsdWUgPT09IGZhbGxiYWNrKVxuICAgICAgICByZXR1cm4gZmFsbGJhY2s7XG4gICAgaWYgKHZhbHVlID09PSBlbmNvZGVVUklDb21wb25lbnQoZmFsbGJhY2spKVxuICAgICAgICByZXR1cm4gZmFsbGJhY2s7XG4gICAgcmV0dXJuIHZhbHVlO1xufVxuZnVuY3Rpb24gcmV3cml0ZShyZXF1ZXN0LCBkaXJlY3RvcnkpIHtcbiAgICBpZiAocmVxdWVzdC5tZXRob2QgIT09IFwiR0VUXCIgJiYgcmVxdWVzdC5tZXRob2QgIT09IFwiSEVBRFwiKVxuICAgICAgICByZXR1cm4gcmVxdWVzdDtcbiAgICBjb25zdCB2YWx1ZSA9IHBpY2socmVxdWVzdC5oZWFkZXJzLmdldChcIngtb3BlbmNvZGUtZGlyZWN0b3J5XCIpLCBkaXJlY3RvcnkpO1xuICAgIGlmICghdmFsdWUpXG4gICAgICAgIHJldHVybiByZXF1ZXN0O1xuICAgIGNvbnN0IHVybCA9IG5ldyBVUkwocmVxdWVzdC51cmwpO1xuICAgIGlmICghdXJsLnNlYXJjaFBhcmFtcy5oYXMoXCJkaXJlY3RvcnlcIikpIHtcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5zZXQoXCJkaXJlY3RvcnlcIiwgdmFsdWUpO1xuICAgIH1cbiAgICBjb25zdCBuZXh0ID0gbmV3IFJlcXVlc3QodXJsLCByZXF1ZXN0KTtcbiAgICBuZXh0LmhlYWRlcnMuZGVsZXRlKFwieC1vcGVuY29kZS1kaXJlY3RvcnlcIik7XG4gICAgcmV0dXJuIG5leHQ7XG59XG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlT3BlbmNvZGVDbGllbnQoY29uZmlnKSB7XG4gICAgaWYgKCFjb25maWc/LmZldGNoKSB7XG4gICAgICAgIGNvbnN0IGN1c3RvbUZldGNoID0gKHJlcSkgPT4ge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgcmVxLnRpbWVvdXQgPSBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybiBmZXRjaChyZXEpO1xuICAgICAgICB9O1xuICAgICAgICBjb25maWcgPSB7XG4gICAgICAgICAgICAuLi5jb25maWcsXG4gICAgICAgICAgICBmZXRjaDogY3VzdG9tRmV0Y2gsXG4gICAgICAgIH07XG4gICAgfVxuICAgIGlmIChjb25maWc/LmRpcmVjdG9yeSkge1xuICAgICAgICBjb25maWcuaGVhZGVycyA9IHtcbiAgICAgICAgICAgIC4uLmNvbmZpZy5oZWFkZXJzLFxuICAgICAgICAgICAgXCJ4LW9wZW5jb2RlLWRpcmVjdG9yeVwiOiBlbmNvZGVVUklDb21wb25lbnQoY29uZmlnLmRpcmVjdG9yeSksXG4gICAgICAgIH07XG4gICAgfVxuICAgIGNvbnN0IGNsaWVudCA9IGNyZWF0ZUNsaWVudChjb25maWcpO1xuICAgIGNsaWVudC5pbnRlcmNlcHRvcnMucmVxdWVzdC51c2UoKHJlcXVlc3QpID0+IHJld3JpdGUocmVxdWVzdCwgY29uZmlnPy5kaXJlY3RvcnkpKTtcbiAgICByZXR1cm4gbmV3IE9wZW5jb2RlQ2xpZW50KHsgY2xpZW50IH0pO1xufVxuIiwKICAgICJpbXBvcnQgbGF1bmNoIGZyb20gXCJjcm9zcy1zcGF3blwiO1xuaW1wb3J0IHsgc3RvcCwgYmluZEFib3J0IH0gZnJvbSBcIi4vcHJvY2Vzcy5qc1wiO1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZU9wZW5jb2RlU2VydmVyKG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgIGhvc3RuYW1lOiBcIjEyNy4wLjAuMVwiLFxuICAgICAgICBwb3J0OiA0MDk2LFxuICAgICAgICB0aW1lb3V0OiA1MDAwLFxuICAgIH0sIG9wdGlvbnMgPz8ge30pO1xuICAgIGNvbnN0IGFyZ3MgPSBbYHNlcnZlYCwgYC0taG9zdG5hbWU9JHtvcHRpb25zLmhvc3RuYW1lfWAsIGAtLXBvcnQ9JHtvcHRpb25zLnBvcnR9YF07XG4gICAgaWYgKG9wdGlvbnMuY29uZmlnPy5sb2dMZXZlbClcbiAgICAgICAgYXJncy5wdXNoKGAtLWxvZy1sZXZlbD0ke29wdGlvbnMuY29uZmlnLmxvZ0xldmVsfWApO1xuICAgIGNvbnN0IHByb2MgPSBsYXVuY2goYG9wZW5jb2RlYCwgYXJncywge1xuICAgICAgICBlbnY6IHtcbiAgICAgICAgICAgIC4uLnByb2Nlc3MuZW52LFxuICAgICAgICAgICAgT1BFTkNPREVfQ09ORklHX0NPTlRFTlQ6IEpTT04uc3RyaW5naWZ5KG9wdGlvbnMuY29uZmlnID8/IHt9KSxcbiAgICAgICAgfSxcbiAgICB9KTtcbiAgICBsZXQgY2xlYXIgPSAoKSA9PiB7IH07XG4gICAgY29uc3QgdXJsID0gYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBjb25zdCBpZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgY2xlYXIoKTtcbiAgICAgICAgICAgIHN0b3AocHJvYyk7XG4gICAgICAgICAgICByZWplY3QobmV3IEVycm9yKGBUaW1lb3V0IHdhaXRpbmcgZm9yIHNlcnZlciB0byBzdGFydCBhZnRlciAke29wdGlvbnMudGltZW91dH1tc2ApKTtcbiAgICAgICAgfSwgb3B0aW9ucy50aW1lb3V0KTtcbiAgICAgICAgbGV0IG91dHB1dCA9IFwiXCI7XG4gICAgICAgIGxldCByZXNvbHZlZCA9IGZhbHNlO1xuICAgICAgICBwcm9jLnN0ZG91dD8ub24oXCJkYXRhXCIsIChjaHVuaykgPT4ge1xuICAgICAgICAgICAgaWYgKHJlc29sdmVkKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIG91dHB1dCArPSBjaHVuay50b1N0cmluZygpO1xuICAgICAgICAgICAgY29uc3QgbGluZXMgPSBvdXRwdXQuc3BsaXQoXCJcXG5cIik7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAobGluZS5zdGFydHNXaXRoKFwib3BlbmNvZGUgc2VydmVyIGxpc3RlbmluZ1wiKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBtYXRjaCA9IGxpbmUubWF0Y2goL29uXFxzKyhodHRwcz86XFwvXFwvW15cXHNdKykvKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFtYXRjaCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0b3AocHJvYyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgRmFpbGVkIHRvIHBhcnNlIHNlcnZlciB1cmwgZnJvbSBvdXRwdXQ6ICR7bGluZX1gKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGlkKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG1hdGNoWzFdKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHByb2Muc3RkZXJyPy5vbihcImRhdGFcIiwgKGNodW5rKSA9PiB7XG4gICAgICAgICAgICBvdXRwdXQgKz0gY2h1bmsudG9TdHJpbmcoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHByb2Mub24oXCJleGl0XCIsIChjb2RlKSA9PiB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQoaWQpO1xuICAgICAgICAgICAgbGV0IG1zZyA9IGBTZXJ2ZXIgZXhpdGVkIHdpdGggY29kZSAke2NvZGV9YDtcbiAgICAgICAgICAgIGlmIChvdXRwdXQudHJpbSgpKSB7XG4gICAgICAgICAgICAgICAgbXNnICs9IGBcXG5TZXJ2ZXIgb3V0cHV0OiAke291dHB1dH1gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihtc2cpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHByb2Mub24oXCJlcnJvclwiLCAoZXJyb3IpID0+IHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChpZCk7XG4gICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICB9KTtcbiAgICAgICAgY2xlYXIgPSBiaW5kQWJvcnQocHJvYywgb3B0aW9ucy5zaWduYWwsICgpID0+IHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChpZCk7XG4gICAgICAgICAgICByZWplY3Qob3B0aW9ucy5zaWduYWw/LnJlYXNvbik7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiB7XG4gICAgICAgIHVybCxcbiAgICAgICAgY2xvc2UoKSB7XG4gICAgICAgICAgICBjbGVhcigpO1xuICAgICAgICAgICAgc3RvcChwcm9jKTtcbiAgICAgICAgfSxcbiAgICB9O1xufVxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU9wZW5jb2RlVHVpKG9wdGlvbnMpIHtcbiAgICBjb25zdCBhcmdzID0gW107XG4gICAgaWYgKG9wdGlvbnM/LnByb2plY3QpIHtcbiAgICAgICAgYXJncy5wdXNoKGAtLXByb2plY3Q9JHtvcHRpb25zLnByb2plY3R9YCk7XG4gICAgfVxuICAgIGlmIChvcHRpb25zPy5tb2RlbCkge1xuICAgICAgICBhcmdzLnB1c2goYC0tbW9kZWw9JHtvcHRpb25zLm1vZGVsfWApO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucz8uc2Vzc2lvbikge1xuICAgICAgICBhcmdzLnB1c2goYC0tc2Vzc2lvbj0ke29wdGlvbnMuc2Vzc2lvbn1gKTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnM/LmFnZW50KSB7XG4gICAgICAgIGFyZ3MucHVzaChgLS1hZ2VudD0ke29wdGlvbnMuYWdlbnR9YCk7XG4gICAgfVxuICAgIGNvbnN0IHByb2MgPSBsYXVuY2goYG9wZW5jb2RlYCwgYXJncywge1xuICAgICAgICBzdGRpbzogXCJpbmhlcml0XCIsXG4gICAgICAgIGVudjoge1xuICAgICAgICAgICAgLi4ucHJvY2Vzcy5lbnYsXG4gICAgICAgICAgICBPUEVOQ09ERV9DT05GSUdfQ09OVEVOVDogSlNPTi5zdHJpbmdpZnkob3B0aW9ucz8uY29uZmlnID8/IHt9KSxcbiAgICAgICAgfSxcbiAgICB9KTtcbiAgICBjb25zdCBjbGVhciA9IGJpbmRBYm9ydChwcm9jLCBvcHRpb25zPy5zaWduYWwpO1xuICAgIHJldHVybiB7XG4gICAgICAgIGNsb3NlKCkge1xuICAgICAgICAgICAgY2xlYXIoKTtcbiAgICAgICAgICAgIHN0b3AocHJvYyk7XG4gICAgICAgIH0sXG4gICAgfTtcbn1cbiIsCiAgICAiaW1wb3J0IHsgc3Bhd25TeW5jIH0gZnJvbSBcIm5vZGU6Y2hpbGRfcHJvY2Vzc1wiO1xuLy8gRHVwbGljYXRlZCBmcm9tIGBwYWNrYWdlcy9vcGVuY29kZS9zcmMvdXRpbC9wcm9jZXNzLnRzYCBiZWNhdXNlIHRoZSBTREsgY2Fubm90XG4vLyBpbXBvcnQgYG9wZW5jb2RlYCB3aXRob3V0IGNyZWF0aW5nIGEgY3ljbGUgKGBvcGVuY29kZWAgZGVwZW5kcyBvbiBgQG9wZW5jb2RlLWFpL3Nka2ApLlxuZXhwb3J0IGZ1bmN0aW9uIHN0b3AocHJvYykge1xuICAgIGlmIChwcm9jLmV4aXRDb2RlICE9PSBudWxsIHx8IHByb2Muc2lnbmFsQ29kZSAhPT0gbnVsbClcbiAgICAgICAgcmV0dXJuO1xuICAgIGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSBcIndpbjMyXCIgJiYgcHJvYy5waWQpIHtcbiAgICAgICAgY29uc3Qgb3V0ID0gc3Bhd25TeW5jKFwidGFza2tpbGxcIiwgW1wiL3BpZFwiLCBTdHJpbmcocHJvYy5waWQpLCBcIi9UXCIsIFwiL0ZcIl0sIHsgd2luZG93c0hpZGU6IHRydWUgfSk7XG4gICAgICAgIGlmICghb3V0LmVycm9yICYmIG91dC5zdGF0dXMgPT09IDApXG4gICAgICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHByb2Mua2lsbCgpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGJpbmRBYm9ydChwcm9jLCBzaWduYWwsIG9uQWJvcnQpIHtcbiAgICBpZiAoIXNpZ25hbClcbiAgICAgICAgcmV0dXJuICgpID0+IHsgfTtcbiAgICBjb25zdCBhYm9ydCA9ICgpID0+IHtcbiAgICAgICAgY2xlYXIoKTtcbiAgICAgICAgc3RvcChwcm9jKTtcbiAgICAgICAgb25BYm9ydD8uKCk7XG4gICAgfTtcbiAgICBjb25zdCBjbGVhciA9ICgpID0+IHtcbiAgICAgICAgc2lnbmFsLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJhYm9ydFwiLCBhYm9ydCk7XG4gICAgICAgIHByb2Mub2ZmKFwiZXhpdFwiLCBjbGVhcik7XG4gICAgICAgIHByb2Mub2ZmKFwiZXJyb3JcIiwgY2xlYXIpO1xuICAgIH07XG4gICAgc2lnbmFsLmFkZEV2ZW50TGlzdGVuZXIoXCJhYm9ydFwiLCBhYm9ydCwgeyBvbmNlOiB0cnVlIH0pO1xuICAgIHByb2Mub24oXCJleGl0XCIsIGNsZWFyKTtcbiAgICBwcm9jLm9uKFwiZXJyb3JcIiwgY2xlYXIpO1xuICAgIGlmIChzaWduYWwuYWJvcnRlZClcbiAgICAgICAgYWJvcnQoKTtcbiAgICByZXR1cm4gY2xlYXI7XG59XG4iLAogICAgImV4cG9ydCAqIGZyb20gXCIuL2NsaWVudC5qc1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vc2VydmVyLmpzXCI7XG5pbXBvcnQgeyBjcmVhdGVPcGVuY29kZUNsaWVudCB9IGZyb20gXCIuL2NsaWVudC5qc1wiO1xuaW1wb3J0IHsgY3JlYXRlT3BlbmNvZGVTZXJ2ZXIgfSBmcm9tIFwiLi9zZXJ2ZXIuanNcIjtcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjcmVhdGVPcGVuY29kZShvcHRpb25zKSB7XG4gICAgY29uc3Qgc2VydmVyID0gYXdhaXQgY3JlYXRlT3BlbmNvZGVTZXJ2ZXIoe1xuICAgICAgICAuLi5vcHRpb25zLFxuICAgIH0pO1xuICAgIGNvbnN0IGNsaWVudCA9IGNyZWF0ZU9wZW5jb2RlQ2xpZW50KHtcbiAgICAgICAgYmFzZVVybDogc2VydmVyLnVybCxcbiAgICB9KTtcbiAgICByZXR1cm4ge1xuICAgICAgICBjbGllbnQsXG4gICAgICAgIHNlcnZlcixcbiAgICB9O1xufVxuIiwKICAgICJpbXBvcnQgZnMgZnJvbSBcIm5vZGU6ZnMvcHJvbWlzZXNcIjtcbi8qKlxuICogU3RydWN0dXJlZCBsb2dnaW5nIGZvciBhaS1lbmcgcmFscGhcbiAqXG4gKiBTdXBwb3J0cyBib3RoIHN0ZGVyciBvdXRwdXQgKHdpdGggLS1wcmludC1sb2dzKSBhbmQgZmlsZS1iYXNlZCBsb2dnaW5nXG4gKi9cbmltcG9ydCBwYXRoIGZyb20gXCJub2RlOnBhdGhcIjtcblxuZXhwb3J0IG5hbWVzcGFjZSBMb2cge1xuICAgIGV4cG9ydCB0eXBlIExldmVsID0gXCJERUJVR1wiIHwgXCJJTkZPXCIgfCBcIldBUk5cIiB8IFwiRVJST1JcIjtcblxuICAgIGNvbnN0IGxldmVsUHJpb3JpdHk6IFJlY29yZDxMZXZlbCwgbnVtYmVyPiA9IHtcbiAgICAgICAgREVCVUc6IDAsXG4gICAgICAgIElORk86IDEsXG4gICAgICAgIFdBUk46IDIsXG4gICAgICAgIEVSUk9SOiAzLFxuICAgIH07XG5cbiAgICBsZXQgY3VycmVudExldmVsOiBMZXZlbCA9IFwiSU5GT1wiO1xuICAgIGxldCBsb2dQYXRoID0gXCJcIjtcbiAgICBsZXQgd3JpdGU6IChtc2c6IHN0cmluZykgPT4gYW55ID0gKG1zZykgPT4gcHJvY2Vzcy5zdGRlcnIud3JpdGUobXNnKTtcblxuICAgIGZ1bmN0aW9uIHNob3VsZExvZyhsZXZlbDogTGV2ZWwpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIGxldmVsUHJpb3JpdHlbbGV2ZWxdID49IGxldmVsUHJpb3JpdHlbY3VycmVudExldmVsXTtcbiAgICB9XG5cbiAgICBleHBvcnQgaW50ZXJmYWNlIE9wdGlvbnMge1xuICAgICAgICBwcmludDogYm9vbGVhbjsgLy8gV2hlbiB0cnVlLCB3cml0ZSB0byBzdGRlcnJcbiAgICAgICAgbGV2ZWw/OiBMZXZlbDtcbiAgICAgICAgbG9nRGlyPzogc3RyaW5nOyAvLyBEaXJlY3RvcnkgZm9yIGxvZyBmaWxlc1xuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiBmaWxlKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBsb2dQYXRoO1xuICAgIH1cblxuICAgIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbml0KG9wdGlvbnM6IE9wdGlvbnMpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgaWYgKG9wdGlvbnMubGV2ZWwpIGN1cnJlbnRMZXZlbCA9IG9wdGlvbnMubGV2ZWw7XG5cbiAgICAgICAgLy8gQnVpbGQgdGhlIHdyaXRlIGZ1bmN0aW9uIHRoYXQgb3V0cHV0cyB0byBCT1RIIHN0ZGVyciBBTkQgZmlsZVxuICAgICAgICBjb25zdCBzdGRlcnJXcml0ZXIgPSAobXNnOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIHByb2Nlc3Muc3RkZXJyLndyaXRlKG1zZyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKG9wdGlvbnMubG9nRGlyKSB7XG4gICAgICAgICAgICBjb25zdCB0aW1lc3RhbXAgPSBuZXcgRGF0ZSgpXG4gICAgICAgICAgICAgICAgLnRvSVNPU3RyaW5nKClcbiAgICAgICAgICAgICAgICAucmVwbGFjZSgvWzouXS9nLCBcIi1cIilcbiAgICAgICAgICAgICAgICAuc2xpY2UoMCwgLTEpO1xuICAgICAgICAgICAgbG9nUGF0aCA9IHBhdGguam9pbihvcHRpb25zLmxvZ0RpciwgYHJhbHBoLSR7dGltZXN0YW1wfS5sb2dgKTtcbiAgICAgICAgICAgIGF3YWl0IGZzLm1rZGlyKG9wdGlvbnMubG9nRGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcblxuICAgICAgICAgICAgY29uc3QgZmlsZSA9IEJ1bi5maWxlKGxvZ1BhdGgpO1xuICAgICAgICAgICAgY29uc3QgZmlsZVdyaXRlciA9IGZpbGUud3JpdGVyKCk7XG5cbiAgICAgICAgICAgIC8vIEFsd2F5cyB3cml0ZSB0byBzdGRlcnIgaWYgcHJpbnQgaXMgZW5hYmxlZFxuICAgICAgICAgICAgLy8gQWxzbyBhbHdheXMgd3JpdGUgdG8gZmlsZSBpZiBsb2dEaXIgaXMgcHJvdmlkZWRcbiAgICAgICAgICAgIHdyaXRlID0gKG1zZykgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLnByaW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHN0ZGVycldyaXRlcihtc2cpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaWxlV3JpdGVyLndyaXRlKG1zZyk7XG4gICAgICAgICAgICAgICAgZmlsZVdyaXRlci5mbHVzaCgpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmIChvcHRpb25zLnByaW50KSB7XG4gICAgICAgICAgICAvLyBPbmx5IHByaW50IHRvIHN0ZGVyclxuICAgICAgICAgICAgd3JpdGUgPSBzdGRlcnJXcml0ZXI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBleHBvcnQgaW50ZXJmYWNlIExvZ2dlciB7XG4gICAgICAgIGRlYnVnKG1lc3NhZ2U6IHN0cmluZywgZXh0cmE/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+KTogdm9pZDtcbiAgICAgICAgaW5mbyhtZXNzYWdlOiBzdHJpbmcsIGV4dHJhPzogUmVjb3JkPHN0cmluZywgYW55Pik6IHZvaWQ7XG4gICAgICAgIHdhcm4obWVzc2FnZTogc3RyaW5nLCBleHRyYT86IFJlY29yZDxzdHJpbmcsIGFueT4pOiB2b2lkO1xuICAgICAgICBlcnJvcihtZXNzYWdlOiBzdHJpbmcsIGV4dHJhPzogUmVjb3JkPHN0cmluZywgYW55Pik6IHZvaWQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZm9ybWF0RXh0cmEoZXh0cmE/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+KTogc3RyaW5nIHtcbiAgICAgICAgaWYgKCFleHRyYSkgcmV0dXJuIFwiXCI7XG4gICAgICAgIGNvbnN0IGV4dHJhU3RyID0gT2JqZWN0LmVudHJpZXMoZXh0cmEpXG4gICAgICAgICAgICAubWFwKFxuICAgICAgICAgICAgICAgIChbaywgdl0pID0+XG4gICAgICAgICAgICAgICAgICAgIGAke2t9PSR7dHlwZW9mIHYgPT09IFwib2JqZWN0XCIgPyBKU09OLnN0cmluZ2lmeSh2KSA6IHZ9YCxcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIC5qb2luKFwiIFwiKTtcbiAgICAgICAgcmV0dXJuIGV4dHJhU3RyID8gYCAke2V4dHJhU3RyfWAgOiBcIlwiO1xuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiBjcmVhdGUodGFncz86IFJlY29yZDxzdHJpbmcsIHN0cmluZz4pOiBMb2dnZXIge1xuICAgICAgICBjb25zdCB0YWdTdHIgPSB0YWdzXG4gICAgICAgICAgICA/IE9iamVjdC5lbnRyaWVzKHRhZ3MpXG4gICAgICAgICAgICAgICAgICAubWFwKChbaywgdl0pID0+IGAke2t9PSR7dn1gKVxuICAgICAgICAgICAgICAgICAgLmpvaW4oXCIgXCIpXG4gICAgICAgICAgICA6IFwiXCI7XG4gICAgICAgIGNvbnN0IHRhZ1N0cldpdGhTcGFjZSA9IHRhZ1N0ciA/IGAke3RhZ1N0cn0gYCA6IFwiXCI7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRlYnVnKG1lc3NhZ2U6IHN0cmluZywgZXh0cmE/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+KSB7XG4gICAgICAgICAgICAgICAgaWYgKHNob3VsZExvZyhcIkRFQlVHXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHdyaXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgYERFQlVHICR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpfSAke3RhZ1N0cn0ke21lc3NhZ2V9JHtmb3JtYXRFeHRyYShleHRyYSl9XFxuYCxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaW5mbyhtZXNzYWdlOiBzdHJpbmcsIGV4dHJhPzogUmVjb3JkPHN0cmluZywgYW55Pikge1xuICAgICAgICAgICAgICAgIGlmIChzaG91bGRMb2coXCJJTkZPXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHdyaXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgYElORk8gICR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpfSAke3RhZ1N0cn0ke21lc3NhZ2V9JHtmb3JtYXRFeHRyYShleHRyYSl9XFxuYCxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgd2FybihtZXNzYWdlOiBzdHJpbmcsIGV4dHJhPzogUmVjb3JkPHN0cmluZywgYW55Pikge1xuICAgICAgICAgICAgICAgIGlmIChzaG91bGRMb2coXCJXQVJOXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHdyaXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgYFdBUk4gICR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpfSAke3RhZ1N0cn0ke21lc3NhZ2V9JHtmb3JtYXRFeHRyYShleHRyYSl9XFxuYCxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZXJyb3IobWVzc2FnZTogc3RyaW5nLCBleHRyYT86IFJlY29yZDxzdHJpbmcsIGFueT4pIHtcbiAgICAgICAgICAgICAgICBpZiAoc2hvdWxkTG9nKFwiRVJST1JcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgd3JpdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICBgRVJST1IgJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCl9ICR7dGFnU3RyfSR7bWVzc2FnZX0ke2Zvcm1hdEV4dHJhKGV4dHJhKX1cXG5gLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZXhwb3J0IGNvbnN0IERlZmF1bHQgPSBjcmVhdGUoeyBzZXJ2aWNlOiBcInJhbHBoXCIgfSk7XG59XG4iCiAgXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFBQSxPQUFPLFVBQVU7QUFBQSxFQUNqQixNQUFNLE9BQU87QUFBQSxFQUViLElBQUk7QUFBQSxFQUVKLFNBQVMsWUFBYSxDQUFDLE1BQU0sU0FBUztBQUFBLElBQ3BDLElBQUksVUFBVSxRQUFRLFlBQVksWUFDaEMsUUFBUSxVQUFVLFFBQVEsSUFBSTtBQUFBLElBRWhDLElBQUksQ0FBQyxTQUFTO0FBQUEsTUFDWixPQUFPO0FBQUEsSUFDVDtBQUFBLElBRUEsVUFBVSxRQUFRLE1BQU0sR0FBRztBQUFBLElBQzNCLElBQUksUUFBUSxRQUFRLEVBQUUsTUFBTSxJQUFJO0FBQUEsTUFDOUIsT0FBTztBQUFBLElBQ1Q7QUFBQSxJQUNBLFNBQVMsSUFBSSxFQUFHLElBQUksUUFBUSxRQUFRLEtBQUs7QUFBQSxNQUN2QyxJQUFJLElBQUksUUFBUSxHQUFHLFlBQVk7QUFBQSxNQUMvQixJQUFJLEtBQUssS0FBSyxPQUFPLENBQUMsRUFBRSxNQUFNLEVBQUUsWUFBWSxNQUFNLEdBQUc7QUFBQSxRQUNuRCxPQUFPO0FBQUEsTUFDVDtBQUFBLElBQ0Y7QUFBQSxJQUNBLE9BQU87QUFBQTtBQUFBLEVBR1QsU0FBUyxTQUFVLENBQUMsTUFBTSxNQUFNLFNBQVM7QUFBQSxJQUN2QyxJQUFJLENBQUMsS0FBSyxlQUFlLEtBQUssQ0FBQyxLQUFLLE9BQU8sR0FBRztBQUFBLE1BQzVDLE9BQU87QUFBQSxJQUNUO0FBQUEsSUFDQSxPQUFPLGFBQWEsTUFBTSxPQUFPO0FBQUE7QUFBQSxFQUduQyxTQUFTLEtBQU0sQ0FBQyxNQUFNLFNBQVMsSUFBSTtBQUFBLElBQ2pDLEdBQUcsS0FBSyxNQUFNLFFBQVMsQ0FBQyxJQUFJLE1BQU07QUFBQSxNQUNoQyxHQUFHLElBQUksS0FBSyxRQUFRLFVBQVUsTUFBTSxNQUFNLE9BQU8sQ0FBQztBQUFBLEtBQ25EO0FBQUE7QUFBQSxFQUdILFNBQVMsSUFBSyxDQUFDLE1BQU0sU0FBUztBQUFBLElBQzVCLE9BQU8sVUFBVSxHQUFHLFNBQVMsSUFBSSxHQUFHLE1BQU0sT0FBTztBQUFBO0FBQUE7Ozs7RUN4Q25ELE9BQU8sVUFBVTtBQUFBLEVBQ2pCLE1BQU0sT0FBTztBQUFBLEVBRWIsSUFBSTtBQUFBLEVBRUosU0FBUyxLQUFNLENBQUMsTUFBTSxTQUFTLElBQUk7QUFBQSxJQUNqQyxHQUFHLEtBQUssTUFBTSxRQUFTLENBQUMsSUFBSSxNQUFNO0FBQUEsTUFDaEMsR0FBRyxJQUFJLEtBQUssUUFBUSxVQUFVLE1BQU0sT0FBTyxDQUFDO0FBQUEsS0FDN0M7QUFBQTtBQUFBLEVBR0gsU0FBUyxJQUFLLENBQUMsTUFBTSxTQUFTO0FBQUEsSUFDNUIsT0FBTyxVQUFVLEdBQUcsU0FBUyxJQUFJLEdBQUcsT0FBTztBQUFBO0FBQUEsRUFHN0MsU0FBUyxTQUFVLENBQUMsTUFBTSxTQUFTO0FBQUEsSUFDakMsT0FBTyxLQUFLLE9BQU8sS0FBSyxVQUFVLE1BQU0sT0FBTztBQUFBO0FBQUEsRUFHakQsU0FBUyxTQUFVLENBQUMsTUFBTSxTQUFTO0FBQUEsSUFDakMsSUFBSSxNQUFNLEtBQUs7QUFBQSxJQUNmLElBQUksTUFBTSxLQUFLO0FBQUEsSUFDZixJQUFJLE1BQU0sS0FBSztBQUFBLElBRWYsSUFBSSxRQUFRLFFBQVEsUUFBUSxZQUMxQixRQUFRLE1BQU0sUUFBUSxVQUFVLFFBQVEsT0FBTztBQUFBLElBQ2pELElBQUksUUFBUSxRQUFRLFFBQVEsWUFDMUIsUUFBUSxNQUFNLFFBQVEsVUFBVSxRQUFRLE9BQU87QUFBQSxJQUVqRCxJQUFJLElBQUksU0FBUyxPQUFPLENBQUM7QUFBQSxJQUN6QixJQUFJLElBQUksU0FBUyxPQUFPLENBQUM7QUFBQSxJQUN6QixJQUFJLElBQUksU0FBUyxPQUFPLENBQUM7QUFBQSxJQUN6QixJQUFJLEtBQUssSUFBSTtBQUFBLElBRWIsSUFBSSxNQUFPLE1BQU0sS0FDZCxNQUFNLEtBQU0sUUFBUSxTQUNwQixNQUFNLEtBQU0sUUFBUSxTQUNwQixNQUFNLE1BQU8sVUFBVTtBQUFBLElBRTFCLE9BQU87QUFBQTtBQUFBOzs7O0VDdkNULElBQUk7QUFBQSxFQUNKLElBQUk7QUFBQSxFQUNKLElBQUksUUFBUSxhQUFhLFdBQVcsT0FBTyxpQkFBaUI7QUFBQSxJQUMxRDtBQUFBLEVBQ0YsRUFBTztBQUFBLElBQ0w7QUFBQTtBQUFBLEVBR0YsT0FBTyxVQUFVO0FBQUEsRUFDakIsTUFBTSxPQUFPO0FBQUEsRUFFYixTQUFTLEtBQU0sQ0FBQyxNQUFNLFNBQVMsSUFBSTtBQUFBLElBQ2pDLElBQUksT0FBTyxZQUFZLFlBQVk7QUFBQSxNQUNqQyxLQUFLO0FBQUEsTUFDTCxVQUFVLENBQUM7QUFBQSxJQUNiO0FBQUEsSUFFQSxJQUFJLENBQUMsSUFBSTtBQUFBLE1BQ1AsSUFBSSxPQUFPLFlBQVksWUFBWTtBQUFBLFFBQ2pDLE1BQU0sSUFBSSxVQUFVLHVCQUF1QjtBQUFBLE1BQzdDO0FBQUEsTUFFQSxPQUFPLElBQUksUUFBUSxRQUFTLENBQUMsU0FBUyxRQUFRO0FBQUEsUUFDNUMsTUFBTSxNQUFNLFdBQVcsQ0FBQyxHQUFHLFFBQVMsQ0FBQyxJQUFJLElBQUk7QUFBQSxVQUMzQyxJQUFJLElBQUk7QUFBQSxZQUNOLE9BQU8sRUFBRTtBQUFBLFVBQ1gsRUFBTztBQUFBLFlBQ0wsUUFBUSxFQUFFO0FBQUE7QUFBQSxTQUViO0FBQUEsT0FDRjtBQUFBLElBQ0g7QUFBQSxJQUVBLEtBQUssTUFBTSxXQUFXLENBQUMsR0FBRyxRQUFTLENBQUMsSUFBSSxJQUFJO0FBQUEsTUFFMUMsSUFBSSxJQUFJO0FBQUEsUUFDTixJQUFJLEdBQUcsU0FBUyxZQUFZLFdBQVcsUUFBUSxjQUFjO0FBQUEsVUFDM0QsS0FBSztBQUFBLFVBQ0wsS0FBSztBQUFBLFFBQ1A7QUFBQSxNQUNGO0FBQUEsTUFDQSxHQUFHLElBQUksRUFBRTtBQUFBLEtBQ1Y7QUFBQTtBQUFBLEVBR0gsU0FBUyxJQUFLLENBQUMsTUFBTSxTQUFTO0FBQUEsSUFFNUIsSUFBSTtBQUFBLE1BQ0YsT0FBTyxLQUFLLEtBQUssTUFBTSxXQUFXLENBQUMsQ0FBQztBQUFBLE1BQ3BDLE9BQU8sSUFBSTtBQUFBLE1BQ1gsSUFBSSxXQUFXLFFBQVEsZ0JBQWdCLEdBQUcsU0FBUyxVQUFVO0FBQUEsUUFDM0QsT0FBTztBQUFBLE1BQ1QsRUFBTztBQUFBLFFBQ0wsTUFBTTtBQUFBO0FBQUE7QUFBQTtBQUFBOzs7O0VDckRaLElBQU0sWUFBWSxRQUFRLGFBQWEsV0FDbkMsUUFBUSxJQUFJLFdBQVcsWUFDdkIsUUFBUSxJQUFJLFdBQVc7QUFBQSxFQUUzQixJQUFNO0FBQUEsRUFDTixJQUFNLFFBQVEsWUFBWSxNQUFNO0FBQUEsRUFDaEMsSUFBTTtBQUFBLEVBRU4sSUFBTSxtQkFBbUIsQ0FBQyxRQUN4QixPQUFPLE9BQU8sSUFBSSxNQUFNLGNBQWMsS0FBSyxHQUFHLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFBQSxFQUVsRSxJQUFNLGNBQWMsQ0FBQyxLQUFLLFFBQVE7QUFBQSxJQUNoQyxNQUFNLFFBQVEsSUFBSSxTQUFTO0FBQUEsSUFJM0IsTUFBTSxVQUFVLElBQUksTUFBTSxJQUFJLEtBQUssYUFBYSxJQUFJLE1BQU0sSUFBSSxJQUFJLENBQUMsRUFBRSxJQUVqRTtBQUFBLE1BRUUsR0FBSSxZQUFZLENBQUMsUUFBUSxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQUEsTUFDbkMsSUFBSSxJQUFJLFFBQVEsUUFBUSxJQUFJLFFBQ2UsSUFBSSxNQUFNLEtBQUs7QUFBQSxJQUM1RDtBQUFBLElBRUosTUFBTSxhQUFhLFlBQ2YsSUFBSSxXQUFXLFFBQVEsSUFBSSxXQUFXLHdCQUN0QztBQUFBLElBQ0osTUFBTSxVQUFVLFlBQVksV0FBVyxNQUFNLEtBQUssSUFBSSxDQUFDLEVBQUU7QUFBQSxJQUV6RCxJQUFJLFdBQVc7QUFBQSxNQUNiLElBQUksSUFBSSxRQUFRLEdBQUcsTUFBTSxNQUFNLFFBQVEsT0FBTztBQUFBLFFBQzVDLFFBQVEsUUFBUSxFQUFFO0FBQUEsSUFDdEI7QUFBQSxJQUVBLE9BQU87QUFBQSxNQUNMO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUE7QUFBQSxFQUdGLElBQU0sUUFBUSxDQUFDLEtBQUssS0FBSyxPQUFPO0FBQUEsSUFDOUIsSUFBSSxPQUFPLFFBQVEsWUFBWTtBQUFBLE1BQzdCLEtBQUs7QUFBQSxNQUNMLE1BQU0sQ0FBQztBQUFBLElBQ1Q7QUFBQSxJQUNBLElBQUksQ0FBQztBQUFBLE1BQ0gsTUFBTSxDQUFDO0FBQUEsSUFFVCxRQUFRLFNBQVMsU0FBUyxlQUFlLFlBQVksS0FBSyxHQUFHO0FBQUEsSUFDN0QsTUFBTSxRQUFRLENBQUM7QUFBQSxJQUVmLE1BQU0sT0FBTyxPQUFLLElBQUksUUFBUSxDQUFDLFNBQVMsV0FBVztBQUFBLE1BQ2pELElBQUksTUFBTSxRQUFRO0FBQUEsUUFDaEIsT0FBTyxJQUFJLE9BQU8sTUFBTSxTQUFTLFFBQVEsS0FBSyxJQUMxQyxPQUFPLGlCQUFpQixHQUFHLENBQUM7QUFBQSxNQUVsQyxNQUFNLFFBQVEsUUFBUTtBQUFBLE1BQ3RCLE1BQU0sV0FBVyxTQUFTLEtBQUssS0FBSyxJQUFJLE1BQU0sTUFBTSxHQUFHLEVBQUUsSUFBSTtBQUFBLE1BRTdELE1BQU0sT0FBTyxLQUFLLEtBQUssVUFBVSxHQUFHO0FBQUEsTUFDcEMsTUFBTSxJQUFJLENBQUMsWUFBWSxZQUFZLEtBQUssR0FBRyxJQUFJLElBQUksTUFBTSxHQUFHLENBQUMsSUFBSSxPQUM3RDtBQUFBLE1BRUosUUFBUSxRQUFRLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFBQSxLQUN6QjtBQUFBLElBRUQsTUFBTSxVQUFVLENBQUMsR0FBRyxHQUFHLE9BQU8sSUFBSSxRQUFRLENBQUMsU0FBUyxXQUFXO0FBQUEsTUFDN0QsSUFBSSxPQUFPLFFBQVE7QUFBQSxRQUNqQixPQUFPLFFBQVEsS0FBSyxJQUFJLENBQUMsQ0FBQztBQUFBLE1BQzVCLE1BQU0sTUFBTSxRQUFRO0FBQUEsTUFDcEIsTUFBTSxJQUFJLEtBQUssRUFBRSxTQUFTLFdBQVcsR0FBRyxDQUFDLElBQUksT0FBTztBQUFBLFFBQ2xELElBQUksQ0FBQyxNQUFNLElBQUk7QUFBQSxVQUNiLElBQUksSUFBSTtBQUFBLFlBQ04sTUFBTSxLQUFLLElBQUksR0FBRztBQUFBLFVBRWxCO0FBQUEsbUJBQU8sUUFBUSxJQUFJLEdBQUc7QUFBQSxRQUMxQjtBQUFBLFFBQ0EsT0FBTyxRQUFRLFFBQVEsR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDO0FBQUEsT0FDckM7QUFBQSxLQUNGO0FBQUEsSUFFRCxPQUFPLEtBQUssS0FBSyxDQUFDLEVBQUUsS0FBSyxTQUFPLEdBQUcsTUFBTSxHQUFHLEdBQUcsRUFBRSxJQUFJLEtBQUssQ0FBQztBQUFBO0FBQUEsRUFHN0QsSUFBTSxZQUFZLENBQUMsS0FBSyxRQUFRO0FBQUEsSUFDOUIsTUFBTSxPQUFPLENBQUM7QUFBQSxJQUVkLFFBQVEsU0FBUyxTQUFTLGVBQWUsWUFBWSxLQUFLLEdBQUc7QUFBQSxJQUM3RCxNQUFNLFFBQVEsQ0FBQztBQUFBLElBRWYsU0FBUyxJQUFJLEVBQUcsSUFBSSxRQUFRLFFBQVEsS0FBTTtBQUFBLE1BQ3hDLE1BQU0sUUFBUSxRQUFRO0FBQUEsTUFDdEIsTUFBTSxXQUFXLFNBQVMsS0FBSyxLQUFLLElBQUksTUFBTSxNQUFNLEdBQUcsRUFBRSxJQUFJO0FBQUEsTUFFN0QsTUFBTSxPQUFPLEtBQUssS0FBSyxVQUFVLEdBQUc7QUFBQSxNQUNwQyxNQUFNLElBQUksQ0FBQyxZQUFZLFlBQVksS0FBSyxHQUFHLElBQUksSUFBSSxNQUFNLEdBQUcsQ0FBQyxJQUFJLE9BQzdEO0FBQUEsTUFFSixTQUFTLElBQUksRUFBRyxJQUFJLFFBQVEsUUFBUSxLQUFNO0FBQUEsUUFDeEMsTUFBTSxNQUFNLElBQUksUUFBUTtBQUFBLFFBQ3hCLElBQUk7QUFBQSxVQUNGLE1BQU0sS0FBSyxNQUFNLEtBQUssS0FBSyxFQUFFLFNBQVMsV0FBVyxDQUFDO0FBQUEsVUFDbEQsSUFBSSxJQUFJO0FBQUEsWUFDTixJQUFJLElBQUk7QUFBQSxjQUNOLE1BQU0sS0FBSyxHQUFHO0FBQUEsWUFFZDtBQUFBLHFCQUFPO0FBQUEsVUFDWDtBQUFBLFVBQ0EsT0FBTyxJQUFJO0FBQUEsTUFDZjtBQUFBLElBQ0Y7QUFBQSxJQUVBLElBQUksSUFBSSxPQUFPLE1BQU07QUFBQSxNQUNuQixPQUFPO0FBQUEsSUFFVCxJQUFJLElBQUk7QUFBQSxNQUNOLE9BQU87QUFBQSxJQUVULE1BQU0saUJBQWlCLEdBQUc7QUFBQTtBQUFBLEVBRzVCLE9BQU8sVUFBVTtBQUFBLEVBQ2pCLE1BQU0sT0FBTztBQUFBOzs7O0VDMUhiLElBQU0sVUFBVSxDQUFDLFVBQVUsQ0FBQyxNQUFNO0FBQUEsSUFDakMsTUFBTSxjQUFjLFFBQVEsT0FBTyxRQUFRO0FBQUEsSUFDM0MsTUFBTSxXQUFXLFFBQVEsWUFBWSxRQUFRO0FBQUEsSUFFN0MsSUFBSSxhQUFhLFNBQVM7QUFBQSxNQUN6QixPQUFPO0FBQUEsSUFDUjtBQUFBLElBRUEsT0FBTyxPQUFPLEtBQUssV0FBVyxFQUFFLFFBQVEsRUFBRSxLQUFLLFNBQU8sSUFBSSxZQUFZLE1BQU0sTUFBTSxLQUFLO0FBQUE7QUFBQSxFQUd4RixPQUFPLFVBQVU7QUFBQSxFQUVqQixPQUFPLFFBQVEsVUFBVTtBQUFBOzs7O0VDYnpCLElBQU07QUFBQSxFQUNOLElBQU07QUFBQSxFQUNOLElBQU07QUFBQSxFQUVOLFNBQVMscUJBQXFCLENBQUMsUUFBUSxnQkFBZ0I7QUFBQSxJQUNuRCxNQUFNLE1BQU0sT0FBTyxRQUFRLE9BQU8sUUFBUTtBQUFBLElBQzFDLE1BQU0sTUFBTSxRQUFRLElBQUk7QUFBQSxJQUN4QixNQUFNLGVBQWUsT0FBTyxRQUFRLE9BQU87QUFBQSxJQUUzQyxNQUFNLGtCQUFrQixnQkFBZ0IsUUFBUSxVQUFVLGFBQWEsQ0FBQyxRQUFRLE1BQU07QUFBQSxJQUl0RixJQUFJLGlCQUFpQjtBQUFBLE1BQ2pCLElBQUk7QUFBQSxRQUNBLFFBQVEsTUFBTSxPQUFPLFFBQVEsR0FBRztBQUFBLFFBQ2xDLE9BQU8sS0FBSztBQUFBLElBR2xCO0FBQUEsSUFFQSxJQUFJO0FBQUEsSUFFSixJQUFJO0FBQUEsTUFDQSxXQUFXLE1BQU0sS0FBSyxPQUFPLFNBQVM7QUFBQSxRQUNsQyxNQUFNLElBQUksV0FBVyxFQUFFLElBQUksQ0FBQztBQUFBLFFBQzVCLFNBQVMsaUJBQWlCLEtBQUssWUFBWTtBQUFBLE1BQy9DLENBQUM7QUFBQSxNQUNILE9BQU8sR0FBRyxXQUVWO0FBQUEsTUFDRSxJQUFJLGlCQUFpQjtBQUFBLFFBQ2pCLFFBQVEsTUFBTSxHQUFHO0FBQUEsTUFDckI7QUFBQTtBQUFBLElBS0osSUFBSSxVQUFVO0FBQUEsTUFDVixXQUFXLEtBQUssUUFBUSxlQUFlLE9BQU8sUUFBUSxNQUFNLElBQUksUUFBUTtBQUFBLElBQzVFO0FBQUEsSUFFQSxPQUFPO0FBQUE7QUFBQSxFQUdYLFNBQVMsY0FBYyxDQUFDLFFBQVE7QUFBQSxJQUM1QixPQUFPLHNCQUFzQixNQUFNLEtBQUssc0JBQXNCLFFBQVEsSUFBSTtBQUFBO0FBQUEsRUFHOUUsT0FBTyxVQUFVO0FBQUE7Ozs7RUNoRGpCLElBQU0sa0JBQWtCO0FBQUEsRUFFeEIsU0FBUyxhQUFhLENBQUMsS0FBSztBQUFBLElBRXhCLE1BQU0sSUFBSSxRQUFRLGlCQUFpQixLQUFLO0FBQUEsSUFFeEMsT0FBTztBQUFBO0FBQUEsRUFHWCxTQUFTLGNBQWMsQ0FBQyxLQUFLLHVCQUF1QjtBQUFBLElBRWhELE1BQU0sR0FBRztBQUFBLElBUVQsTUFBTSxJQUFJLFFBQVEsbUJBQW1CLFVBQVM7QUFBQSxJQUs5QyxNQUFNLElBQUksUUFBUSxrQkFBa0IsTUFBTTtBQUFBLElBSzFDLE1BQU0sSUFBSTtBQUFBLElBR1YsTUFBTSxJQUFJLFFBQVEsaUJBQWlCLEtBQUs7QUFBQSxJQUd4QyxJQUFJLHVCQUF1QjtBQUFBLE1BQ3ZCLE1BQU0sSUFBSSxRQUFRLGlCQUFpQixLQUFLO0FBQUEsSUFDNUM7QUFBQSxJQUVBLE9BQU87QUFBQTtBQUFBLEVBR0ksa0JBQVU7QUFBQSxFQUNWLG1CQUFXO0FBQUE7Ozs7RUM3QzFCLE9BQU8sVUFBVTtBQUFBOzs7O0VDQWpCLElBQU07QUFBQSxFQUVOLE9BQU8sVUFBVSxDQUFDLFNBQVMsT0FBTztBQUFBLElBQ2pDLE1BQU0sUUFBUSxPQUFPLE1BQU0sWUFBWTtBQUFBLElBRXZDLElBQUksQ0FBQyxPQUFPO0FBQUEsTUFDWCxPQUFPO0FBQUEsSUFDUjtBQUFBLElBRUEsT0FBTyxNQUFNLFlBQVksTUFBTSxHQUFHLFFBQVEsUUFBUSxFQUFFLEVBQUUsTUFBTSxHQUFHO0FBQUEsSUFDL0QsTUFBTSxTQUFTLEtBQUssTUFBTSxHQUFHLEVBQUUsSUFBSTtBQUFBLElBRW5DLElBQUksV0FBVyxPQUFPO0FBQUEsTUFDckIsT0FBTztBQUFBLElBQ1I7QUFBQSxJQUVBLE9BQU8sV0FBVyxHQUFHLFVBQVUsYUFBYTtBQUFBO0FBQUE7Ozs7RUNmN0MsSUFBTTtBQUFBLEVBQ04sSUFBTTtBQUFBLEVBRU4sU0FBUyxXQUFXLENBQUMsU0FBUztBQUFBLElBRTFCLE1BQU0sT0FBTztBQUFBLElBQ2IsTUFBTSxTQUFTLE9BQU8sTUFBTSxJQUFJO0FBQUEsSUFFaEMsSUFBSTtBQUFBLElBRUosSUFBSTtBQUFBLE1BQ0EsS0FBSyxHQUFHLFNBQVMsU0FBUyxHQUFHO0FBQUEsTUFDN0IsR0FBRyxTQUFTLElBQUksUUFBUSxHQUFHLE1BQU0sQ0FBQztBQUFBLE1BQ2xDLEdBQUcsVUFBVSxFQUFFO0FBQUEsTUFDakIsT0FBTyxHQUFHO0FBQUEsSUFHWixPQUFPLGVBQWUsT0FBTyxTQUFTLENBQUM7QUFBQTtBQUFBLEVBRzNDLE9BQU8sVUFBVTtBQUFBOzs7O0VDcEJqQixJQUFNO0FBQUEsRUFDTixJQUFNO0FBQUEsRUFDTixJQUFNO0FBQUEsRUFDTixJQUFNO0FBQUEsRUFFTixJQUFNLFFBQVEsUUFBUSxhQUFhO0FBQUEsRUFDbkMsSUFBTSxxQkFBcUI7QUFBQSxFQUMzQixJQUFNLGtCQUFrQjtBQUFBLEVBRXhCLFNBQVMsYUFBYSxDQUFDLFFBQVE7QUFBQSxJQUMzQixPQUFPLE9BQU8sZUFBZSxNQUFNO0FBQUEsSUFFbkMsTUFBTSxVQUFVLE9BQU8sUUFBUSxZQUFZLE9BQU8sSUFBSTtBQUFBLElBRXRELElBQUksU0FBUztBQUFBLE1BQ1QsT0FBTyxLQUFLLFFBQVEsT0FBTyxJQUFJO0FBQUEsTUFDL0IsT0FBTyxVQUFVO0FBQUEsTUFFakIsT0FBTyxlQUFlLE1BQU07QUFBQSxJQUNoQztBQUFBLElBRUEsT0FBTyxPQUFPO0FBQUE7QUFBQSxFQUdsQixTQUFTLGFBQWEsQ0FBQyxRQUFRO0FBQUEsSUFDM0IsSUFBSSxDQUFDLE9BQU87QUFBQSxNQUNSLE9BQU87QUFBQSxJQUNYO0FBQUEsSUFHQSxNQUFNLGNBQWMsY0FBYyxNQUFNO0FBQUEsSUFHeEMsTUFBTSxhQUFhLENBQUMsbUJBQW1CLEtBQUssV0FBVztBQUFBLElBSXZELElBQUksT0FBTyxRQUFRLGNBQWMsWUFBWTtBQUFBLE1BS3pDLE1BQU0sNkJBQTZCLGdCQUFnQixLQUFLLFdBQVc7QUFBQSxNQUluRSxPQUFPLFVBQVUsS0FBSyxVQUFVLE9BQU8sT0FBTztBQUFBLE1BRzlDLE9BQU8sVUFBVSxPQUFPLFFBQVEsT0FBTyxPQUFPO0FBQUEsTUFDOUMsT0FBTyxPQUFPLE9BQU8sS0FBSyxJQUFJLENBQUMsUUFBUSxPQUFPLFNBQVMsS0FBSywwQkFBMEIsQ0FBQztBQUFBLE1BRXZGLE1BQU0sZUFBZSxDQUFDLE9BQU8sT0FBTyxFQUFFLE9BQU8sT0FBTyxJQUFJLEVBQUUsS0FBSyxHQUFHO0FBQUEsTUFFbEUsT0FBTyxPQUFPLENBQUMsTUFBTSxNQUFNLE1BQU0sSUFBSSxlQUFlO0FBQUEsTUFDcEQsT0FBTyxVQUFVLFFBQVEsSUFBSSxXQUFXO0FBQUEsTUFDeEMsT0FBTyxRQUFRLDJCQUEyQjtBQUFBLElBQzlDO0FBQUEsSUFFQSxPQUFPO0FBQUE7QUFBQSxFQUdYLFNBQVMsS0FBSyxDQUFDLFNBQVMsTUFBTSxTQUFTO0FBQUEsSUFFbkMsSUFBSSxRQUFRLENBQUMsTUFBTSxRQUFRLElBQUksR0FBRztBQUFBLE1BQzlCLFVBQVU7QUFBQSxNQUNWLE9BQU87QUFBQSxJQUNYO0FBQUEsSUFFQSxPQUFPLE9BQU8sS0FBSyxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQUEsSUFDL0IsVUFBVSxPQUFPLE9BQU8sQ0FBQyxHQUFHLE9BQU87QUFBQSxJQUduQyxNQUFNLFNBQVM7QUFBQSxNQUNYO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBLE1BQU07QUFBQSxNQUNOLFVBQVU7QUFBQSxRQUNOO0FBQUEsUUFDQTtBQUFBLE1BQ0o7QUFBQSxJQUNKO0FBQUEsSUFHQSxPQUFPLFFBQVEsUUFBUSxTQUFTLGNBQWMsTUFBTTtBQUFBO0FBQUEsRUFHeEQsT0FBTyxVQUFVO0FBQUE7Ozs7RUN4RmpCLElBQU0sUUFBUSxRQUFRLGFBQWE7QUFBQSxFQUVuQyxTQUFTLGFBQWEsQ0FBQyxVQUFVLFNBQVM7QUFBQSxJQUN0QyxPQUFPLE9BQU8sT0FBTyxJQUFJLE1BQU0sR0FBRyxXQUFXLFNBQVMsZ0JBQWdCLEdBQUc7QUFBQSxNQUNyRSxNQUFNO0FBQUEsTUFDTixPQUFPO0FBQUEsTUFDUCxTQUFTLEdBQUcsV0FBVyxTQUFTO0FBQUEsTUFDaEMsTUFBTSxTQUFTO0FBQUEsTUFDZixXQUFXLFNBQVM7QUFBQSxJQUN4QixDQUFDO0FBQUE7QUFBQSxFQUdMLFNBQVMsZ0JBQWdCLENBQUMsSUFBSSxRQUFRO0FBQUEsSUFDbEMsSUFBSSxDQUFDLE9BQU87QUFBQSxNQUNSO0FBQUEsSUFDSjtBQUFBLElBRUEsTUFBTSxlQUFlLEdBQUc7QUFBQSxJQUV4QixHQUFHLE9BQU8sUUFBUyxDQUFDLE1BQU0sTUFBTTtBQUFBLE1BSTVCLElBQUksU0FBUyxRQUFRO0FBQUEsUUFDakIsTUFBTSxNQUFNLGFBQWEsTUFBTSxNQUFNO0FBQUEsUUFFckMsSUFBSSxLQUFLO0FBQUEsVUFDTCxPQUFPLGFBQWEsS0FBSyxJQUFJLFNBQVMsR0FBRztBQUFBLFFBQzdDO0FBQUEsTUFDSjtBQUFBLE1BRUEsT0FBTyxhQUFhLE1BQU0sSUFBSSxTQUFTO0FBQUE7QUFBQTtBQUFBLEVBSS9DLFNBQVMsWUFBWSxDQUFDLFFBQVEsUUFBUTtBQUFBLElBQ2xDLElBQUksU0FBUyxXQUFXLEtBQUssQ0FBQyxPQUFPLE1BQU07QUFBQSxNQUN2QyxPQUFPLGNBQWMsT0FBTyxVQUFVLE9BQU87QUFBQSxJQUNqRDtBQUFBLElBRUEsT0FBTztBQUFBO0FBQUEsRUFHWCxTQUFTLGdCQUFnQixDQUFDLFFBQVEsUUFBUTtBQUFBLElBQ3RDLElBQUksU0FBUyxXQUFXLEtBQUssQ0FBQyxPQUFPLE1BQU07QUFBQSxNQUN2QyxPQUFPLGNBQWMsT0FBTyxVQUFVLFdBQVc7QUFBQSxJQUNyRDtBQUFBLElBRUEsT0FBTztBQUFBO0FBQUEsRUFHWCxPQUFPLFVBQVU7QUFBQSxJQUNiO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDSjtBQUFBOzs7O0VDeERBLElBQU07QUFBQSxFQUNOLElBQU07QUFBQSxFQUNOLElBQU07QUFBQSxFQUVOLFNBQVMsS0FBSyxDQUFDLFNBQVMsTUFBTSxTQUFTO0FBQUEsSUFFbkMsTUFBTSxTQUFTLE1BQU0sU0FBUyxNQUFNLE9BQU87QUFBQSxJQUczQyxNQUFNLFVBQVUsR0FBRyxNQUFNLE9BQU8sU0FBUyxPQUFPLE1BQU0sT0FBTyxPQUFPO0FBQUEsSUFJcEUsT0FBTyxpQkFBaUIsU0FBUyxNQUFNO0FBQUEsSUFFdkMsT0FBTztBQUFBO0FBQUEsRUFHWCxTQUFTLFNBQVMsQ0FBQyxTQUFTLE1BQU0sU0FBUztBQUFBLElBRXZDLE1BQU0sU0FBUyxNQUFNLFNBQVMsTUFBTSxPQUFPO0FBQUEsSUFHM0MsTUFBTSxTQUFTLEdBQUcsVUFBVSxPQUFPLFNBQVMsT0FBTyxNQUFNLE9BQU8sT0FBTztBQUFBLElBR3ZFLE9BQU8sUUFBUSxPQUFPLFNBQVMsT0FBTyxpQkFBaUIsT0FBTyxRQUFRLE1BQU07QUFBQSxJQUU1RSxPQUFPO0FBQUE7QUFBQSxFQUdYLE9BQU8sVUFBVTtBQUFBLEVBQ2pCLE9BQU8sUUFBUSxRQUFRO0FBQUEsRUFDdkIsT0FBTyxRQUFRLE9BQU87QUFBQSxFQUV0QixPQUFPLFFBQVEsU0FBUztBQUFBLEVBQ3hCLE9BQU8sUUFBUSxVQUFVO0FBQUE7OztBQy9CekI7O0FDTk8sSUFBTSxrQkFBa0IsR0FBRyxZQUFZLFlBQVkscUJBQXFCLG1CQUFtQixzQkFBc0IscUJBQXFCLGtCQUFrQixZQUFZLFFBQVEsY0FBYztBQUFBLEVBQzdMLElBQUk7QUFBQSxFQUNKLE1BQU0sUUFBUSxlQUFlLENBQUMsT0FBTyxJQUFJLFFBQVEsQ0FBQyxZQUFZLFdBQVcsU0FBUyxFQUFFLENBQUM7QUFBQSxFQUNyRixNQUFNLGVBQWUsZ0JBQWdCLEdBQUc7QUFBQSxJQUNwQyxJQUFJLGFBQWEsd0JBQXdCO0FBQUEsSUFDekMsSUFBSSxVQUFVO0FBQUEsSUFDZCxNQUFNLFNBQVMsUUFBUSxVQUFVLElBQUksZ0JBQWdCLEVBQUU7QUFBQSxJQUN2RCxPQUFPLE1BQU07QUFBQSxNQUNULElBQUksT0FBTztBQUFBLFFBQ1A7QUFBQSxNQUNKO0FBQUEsTUFDQSxNQUFNLFVBQVUsUUFBUSxtQkFBbUIsVUFDckMsUUFBUSxVQUNSLElBQUksUUFBUSxRQUFRLE9BQU87QUFBQSxNQUNqQyxJQUFJLGdCQUFnQixXQUFXO0FBQUEsUUFDM0IsUUFBUSxJQUFJLGlCQUFpQixXQUFXO0FBQUEsTUFDNUM7QUFBQSxNQUNBLElBQUk7QUFBQSxRQUNBLE1BQU0sV0FBVyxNQUFNLE1BQU0sS0FBSyxLQUFLLFNBQVMsU0FBUyxPQUFPLENBQUM7QUFBQSxRQUNqRSxJQUFJLENBQUMsU0FBUztBQUFBLFVBQ1YsTUFBTSxJQUFJLE1BQU0sZUFBZSxTQUFTLFVBQVUsU0FBUyxZQUFZO0FBQUEsUUFDM0UsSUFBSSxDQUFDLFNBQVM7QUFBQSxVQUNWLE1BQU0sSUFBSSxNQUFNLHlCQUF5QjtBQUFBLFFBQzdDLE1BQU0sU0FBUyxTQUFTLEtBQUssWUFBWSxJQUFJLGlCQUFtQixFQUFFLFVBQVU7QUFBQSxRQUM1RSxJQUFJLFNBQVM7QUFBQSxRQUNiLE1BQU0sZUFBZSxNQUFNO0FBQUEsVUFDdkIsSUFBSTtBQUFBLFlBQ0EsT0FBTyxPQUFPO0FBQUEsWUFFbEIsTUFBTTtBQUFBO0FBQUEsUUFJVixPQUFPLGlCQUFpQixTQUFTLFlBQVk7QUFBQSxRQUM3QyxJQUFJO0FBQUEsVUFDQSxPQUFPLE1BQU07QUFBQSxZQUNULFFBQVEsTUFBTSxVQUFVLE1BQU0sT0FBTyxLQUFLO0FBQUEsWUFDMUMsSUFBSTtBQUFBLGNBQ0E7QUFBQSxZQUNKLFVBQVU7QUFBQSxZQUNWLE1BQU0sU0FBUyxPQUFPLE1BQU07QUFBQTtBQUFBLENBQU07QUFBQSxZQUNsQyxTQUFTLE9BQU8sSUFBSSxLQUFLO0FBQUEsWUFDekIsV0FBVyxTQUFTLFFBQVE7QUFBQSxjQUN4QixNQUFNLFFBQVEsTUFBTSxNQUFNO0FBQUEsQ0FBSTtBQUFBLGNBQzlCLE1BQU0sWUFBWSxDQUFDO0FBQUEsY0FDbkIsSUFBSTtBQUFBLGNBQ0osV0FBVyxRQUFRLE9BQU87QUFBQSxnQkFDdEIsSUFBSSxLQUFLLFdBQVcsT0FBTyxHQUFHO0FBQUEsa0JBQzFCLFVBQVUsS0FBSyxLQUFLLFFBQVEsYUFBYSxFQUFFLENBQUM7QUFBQSxnQkFDaEQsRUFDSyxTQUFJLEtBQUssV0FBVyxRQUFRLEdBQUc7QUFBQSxrQkFDaEMsWUFBWSxLQUFLLFFBQVEsY0FBYyxFQUFFO0FBQUEsZ0JBQzdDLEVBQ0ssU0FBSSxLQUFLLFdBQVcsS0FBSyxHQUFHO0FBQUEsa0JBQzdCLGNBQWMsS0FBSyxRQUFRLFdBQVcsRUFBRTtBQUFBLGdCQUM1QyxFQUNLLFNBQUksS0FBSyxXQUFXLFFBQVEsR0FBRztBQUFBLGtCQUNoQyxNQUFNLFNBQVMsT0FBTyxTQUFTLEtBQUssUUFBUSxjQUFjLEVBQUUsR0FBRyxFQUFFO0FBQUEsa0JBQ2pFLElBQUksQ0FBQyxPQUFPLE1BQU0sTUFBTSxHQUFHO0FBQUEsb0JBQ3ZCLGFBQWE7QUFBQSxrQkFDakI7QUFBQSxnQkFDSjtBQUFBLGNBQ0o7QUFBQSxjQUNBLElBQUk7QUFBQSxjQUNKLElBQUksYUFBYTtBQUFBLGNBQ2pCLElBQUksVUFBVSxRQUFRO0FBQUEsZ0JBQ2xCLE1BQU0sVUFBVSxVQUFVLEtBQUs7QUFBQSxDQUFJO0FBQUEsZ0JBQ25DLElBQUk7QUFBQSxrQkFDQSxPQUFPLEtBQUssTUFBTSxPQUFPO0FBQUEsa0JBQ3pCLGFBQWE7QUFBQSxrQkFFakIsTUFBTTtBQUFBLGtCQUNGLE9BQU87QUFBQTtBQUFBLGNBRWY7QUFBQSxjQUNBLElBQUksWUFBWTtBQUFBLGdCQUNaLElBQUksbUJBQW1CO0FBQUEsa0JBQ25CLE1BQU0sa0JBQWtCLElBQUk7QUFBQSxnQkFDaEM7QUFBQSxnQkFDQSxJQUFJLHFCQUFxQjtBQUFBLGtCQUNyQixPQUFPLE1BQU0sb0JBQW9CLElBQUk7QUFBQSxnQkFDekM7QUFBQSxjQUNKO0FBQUEsY0FDQSxhQUFhO0FBQUEsZ0JBQ1Q7QUFBQSxnQkFDQSxPQUFPO0FBQUEsZ0JBQ1AsSUFBSTtBQUFBLGdCQUNKLE9BQU87QUFBQSxjQUNYLENBQUM7QUFBQSxjQUNELElBQUksVUFBVSxRQUFRO0FBQUEsZ0JBQ2xCLE1BQU07QUFBQSxjQUNWO0FBQUEsWUFDSjtBQUFBLFVBQ0o7QUFBQSxrQkFFSjtBQUFBLFVBQ0ksT0FBTyxvQkFBb0IsU0FBUyxZQUFZO0FBQUEsVUFDaEQsT0FBTyxZQUFZO0FBQUE7QUFBQSxRQUV2QjtBQUFBLFFBRUosT0FBTyxPQUFPO0FBQUEsUUFFVixhQUFhLEtBQUs7QUFBQSxRQUNsQixJQUFJLHdCQUF3QixhQUFhLFdBQVcscUJBQXFCO0FBQUEsVUFDckU7QUFBQSxRQUNKO0FBQUEsUUFFQSxNQUFNLFVBQVUsS0FBSyxJQUFJLGFBQWEsTUFBTSxVQUFVLElBQUksb0JBQW9CLEtBQUs7QUFBQSxRQUNuRixNQUFNLE1BQU0sT0FBTztBQUFBO0FBQUEsSUFFM0I7QUFBQTtBQUFBLEVBRUosTUFBTSxTQUFTLGFBQWE7QUFBQSxFQUM1QixPQUFPLEVBQUUsT0FBTztBQUFBOzs7QUNsSGIsSUFBTSxlQUFlLE9BQU8sTUFBTSxhQUFhO0FBQUEsRUFDbEQsTUFBTSxRQUFRLE9BQU8sYUFBYSxhQUFhLE1BQU0sU0FBUyxJQUFJLElBQUk7QUFBQSxFQUN0RSxJQUFJLENBQUMsT0FBTztBQUFBLElBQ1I7QUFBQSxFQUNKO0FBQUEsRUFDQSxJQUFJLEtBQUssV0FBVyxVQUFVO0FBQUEsSUFDMUIsT0FBTyxVQUFVO0FBQUEsRUFDckI7QUFBQSxFQUNBLElBQUksS0FBSyxXQUFXLFNBQVM7QUFBQSxJQUN6QixPQUFPLFNBQVMsS0FBSyxLQUFLO0FBQUEsRUFDOUI7QUFBQSxFQUNBLE9BQU87QUFBQTs7O0FDeUJKLElBQU0scUJBQXFCO0FBQUEsRUFDOUIsZ0JBQWdCLENBQUMsU0FBUyxLQUFLLFVBQVUsTUFBTSxDQUFDLE1BQU0sVUFBVyxPQUFPLFVBQVUsV0FBVyxNQUFNLFNBQVMsSUFBSSxLQUFNO0FBQzFIOzs7QUN0Q08sSUFBTSx3QkFBd0IsQ0FBQyxVQUFVO0FBQUEsRUFDNUMsUUFBUTtBQUFBLFNBQ0M7QUFBQSxNQUNELE9BQU87QUFBQSxTQUNOO0FBQUEsTUFDRCxPQUFPO0FBQUEsU0FDTjtBQUFBLE1BQ0QsT0FBTztBQUFBO0FBQUEsTUFFUCxPQUFPO0FBQUE7QUFBQTtBQUdaLElBQU0sMEJBQTBCLENBQUMsVUFBVTtBQUFBLEVBQzlDLFFBQVE7QUFBQSxTQUNDO0FBQUEsTUFDRCxPQUFPO0FBQUEsU0FDTjtBQUFBLE1BQ0QsT0FBTztBQUFBLFNBQ047QUFBQSxNQUNELE9BQU87QUFBQTtBQUFBLE1BRVAsT0FBTztBQUFBO0FBQUE7QUFHWixJQUFNLHlCQUF5QixDQUFDLFVBQVU7QUFBQSxFQUM3QyxRQUFRO0FBQUEsU0FDQztBQUFBLE1BQ0QsT0FBTztBQUFBLFNBQ047QUFBQSxNQUNELE9BQU87QUFBQSxTQUNOO0FBQUEsTUFDRCxPQUFPO0FBQUE7QUFBQSxNQUVQLE9BQU87QUFBQTtBQUFBO0FBR1osSUFBTSxzQkFBc0IsR0FBRyxlQUFlLFNBQVMsTUFBTSxPQUFPLFlBQWE7QUFBQSxFQUNwRixJQUFJLENBQUMsU0FBUztBQUFBLElBQ1YsTUFBTSxpQkFBZ0IsZ0JBQWdCLFFBQVEsTUFBTSxJQUFJLENBQUMsTUFBTSxtQkFBbUIsQ0FBQyxDQUFDLEdBQUcsS0FBSyx3QkFBd0IsS0FBSyxDQUFDO0FBQUEsSUFDMUgsUUFBUTtBQUFBLFdBQ0M7QUFBQSxRQUNELE9BQU8sSUFBSTtBQUFBLFdBQ1Y7QUFBQSxRQUNELE9BQU8sSUFBSSxRQUFRO0FBQUEsV0FDbEI7QUFBQSxRQUNELE9BQU87QUFBQTtBQUFBLFFBRVAsT0FBTyxHQUFHLFFBQVE7QUFBQTtBQUFBLEVBRTlCO0FBQUEsRUFDQSxNQUFNLFlBQVksc0JBQXNCLEtBQUs7QUFBQSxFQUM3QyxNQUFNLGVBQWUsTUFDaEIsSUFBSSxDQUFDLE1BQU07QUFBQSxJQUNaLElBQUksVUFBVSxXQUFXLFVBQVUsVUFBVTtBQUFBLE1BQ3pDLE9BQU8sZ0JBQWdCLElBQUksbUJBQW1CLENBQUM7QUFBQSxJQUNuRDtBQUFBLElBQ0EsT0FBTyx3QkFBd0I7QUFBQSxNQUMzQjtBQUFBLE1BQ0E7QUFBQSxNQUNBLE9BQU87QUFBQSxJQUNYLENBQUM7QUFBQSxHQUNKLEVBQ0ksS0FBSyxTQUFTO0FBQUEsRUFDbkIsT0FBTyxVQUFVLFdBQVcsVUFBVSxXQUFXLFlBQVksZUFBZTtBQUFBO0FBRXpFLElBQU0sMEJBQTBCLEdBQUcsZUFBZSxNQUFNLFlBQVk7QUFBQSxFQUN2RSxJQUFJLFVBQVUsYUFBYSxVQUFVLE1BQU07QUFBQSxJQUN2QyxPQUFPO0FBQUEsRUFDWDtBQUFBLEVBQ0EsSUFBSSxPQUFPLFVBQVUsVUFBVTtBQUFBLElBQzNCLE1BQU0sSUFBSSxNQUFNLHNHQUFxRztBQUFBLEVBQ3pIO0FBQUEsRUFDQSxPQUFPLEdBQUcsUUFBUSxnQkFBZ0IsUUFBUSxtQkFBbUIsS0FBSztBQUFBO0FBRS9ELElBQU0sdUJBQXVCLEdBQUcsZUFBZSxTQUFTLE1BQU0sT0FBTyxPQUFPLGdCQUFpQjtBQUFBLEVBQ2hHLElBQUksaUJBQWlCLE1BQU07QUFBQSxJQUN2QixPQUFPLFlBQVksTUFBTSxZQUFZLElBQUksR0FBRyxRQUFRLE1BQU0sWUFBWTtBQUFBLEVBQzFFO0FBQUEsRUFDQSxJQUFJLFVBQVUsZ0JBQWdCLENBQUMsU0FBUztBQUFBLElBQ3BDLElBQUksU0FBUyxDQUFDO0FBQUEsSUFDZCxPQUFPLFFBQVEsS0FBSyxFQUFFLFFBQVEsRUFBRSxLQUFLLE9BQU87QUFBQSxNQUN4QyxTQUFTLENBQUMsR0FBRyxRQUFRLEtBQUssZ0JBQWdCLElBQUksbUJBQW1CLENBQUMsQ0FBQztBQUFBLEtBQ3RFO0FBQUEsSUFDRCxNQUFNLGdCQUFlLE9BQU8sS0FBSyxHQUFHO0FBQUEsSUFDcEMsUUFBUTtBQUFBLFdBQ0M7QUFBQSxRQUNELE9BQU8sR0FBRyxRQUFRO0FBQUEsV0FDakI7QUFBQSxRQUNELE9BQU8sSUFBSTtBQUFBLFdBQ1Y7QUFBQSxRQUNELE9BQU8sSUFBSSxRQUFRO0FBQUE7QUFBQSxRQUVuQixPQUFPO0FBQUE7QUFBQSxFQUVuQjtBQUFBLEVBQ0EsTUFBTSxZQUFZLHVCQUF1QixLQUFLO0FBQUEsRUFDOUMsTUFBTSxlQUFlLE9BQU8sUUFBUSxLQUFLLEVBQ3BDLElBQUksRUFBRSxLQUFLLE9BQU8sd0JBQXdCO0FBQUEsSUFDM0M7QUFBQSxJQUNBLE1BQU0sVUFBVSxlQUFlLEdBQUcsUUFBUSxTQUFTO0FBQUEsSUFDbkQsT0FBTztBQUFBLEVBQ1gsQ0FBQyxDQUFDLEVBQ0csS0FBSyxTQUFTO0FBQUEsRUFDbkIsT0FBTyxVQUFVLFdBQVcsVUFBVSxXQUFXLFlBQVksZUFBZTtBQUFBOzs7QUN0R3pFLElBQU0sZ0JBQWdCO0FBQ3RCLElBQU0sd0JBQXdCLEdBQUcsTUFBTSxLQUFLLFdBQVc7QUFBQSxFQUMxRCxJQUFJLE1BQU07QUFBQSxFQUNWLE1BQU0sVUFBVSxLQUFLLE1BQU0sYUFBYTtBQUFBLEVBQ3hDLElBQUksU0FBUztBQUFBLElBQ1QsV0FBVyxTQUFTLFNBQVM7QUFBQSxNQUN6QixJQUFJLFVBQVU7QUFBQSxNQUNkLElBQUksT0FBTyxNQUFNLFVBQVUsR0FBRyxNQUFNLFNBQVMsQ0FBQztBQUFBLE1BQzlDLElBQUksUUFBUTtBQUFBLE1BQ1osSUFBSSxLQUFLLFNBQVMsR0FBRyxHQUFHO0FBQUEsUUFDcEIsVUFBVTtBQUFBLFFBQ1YsT0FBTyxLQUFLLFVBQVUsR0FBRyxLQUFLLFNBQVMsQ0FBQztBQUFBLE1BQzVDO0FBQUEsTUFDQSxJQUFJLEtBQUssV0FBVyxHQUFHLEdBQUc7QUFBQSxRQUN0QixPQUFPLEtBQUssVUFBVSxDQUFDO0FBQUEsUUFDdkIsUUFBUTtBQUFBLE1BQ1osRUFDSyxTQUFJLEtBQUssV0FBVyxHQUFHLEdBQUc7QUFBQSxRQUMzQixPQUFPLEtBQUssVUFBVSxDQUFDO0FBQUEsUUFDdkIsUUFBUTtBQUFBLE1BQ1o7QUFBQSxNQUNBLE1BQU0sUUFBUSxLQUFLO0FBQUEsTUFDbkIsSUFBSSxVQUFVLGFBQWEsVUFBVSxNQUFNO0FBQUEsUUFDdkM7QUFBQSxNQUNKO0FBQUEsTUFDQSxJQUFJLE1BQU0sUUFBUSxLQUFLLEdBQUc7QUFBQSxRQUN0QixNQUFNLElBQUksUUFBUSxPQUFPLG9CQUFvQixFQUFFLFNBQVMsTUFBTSxPQUFPLE1BQU0sQ0FBQyxDQUFDO0FBQUEsUUFDN0U7QUFBQSxNQUNKO0FBQUEsTUFDQSxJQUFJLE9BQU8sVUFBVSxVQUFVO0FBQUEsUUFDM0IsTUFBTSxJQUFJLFFBQVEsT0FBTyxxQkFBcUI7QUFBQSxVQUMxQztBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0EsV0FBVztBQUFBLFFBQ2YsQ0FBQyxDQUFDO0FBQUEsUUFDRjtBQUFBLE1BQ0o7QUFBQSxNQUNBLElBQUksVUFBVSxVQUFVO0FBQUEsUUFDcEIsTUFBTSxJQUFJLFFBQVEsT0FBTyxJQUFJLHdCQUF3QjtBQUFBLFVBQ2pEO0FBQUEsVUFDQTtBQUFBLFFBQ0osQ0FBQyxHQUFHO0FBQUEsUUFDSjtBQUFBLE1BQ0o7QUFBQSxNQUNBLE1BQU0sZUFBZSxtQkFBbUIsVUFBVSxVQUFVLElBQUksVUFBVSxLQUFLO0FBQUEsTUFDL0UsTUFBTSxJQUFJLFFBQVEsT0FBTyxZQUFZO0FBQUEsSUFDekM7QUFBQSxFQUNKO0FBQUEsRUFDQSxPQUFPO0FBQUE7QUFFSixJQUFNLFNBQVMsR0FBRyxTQUFTLE1BQU0sT0FBTyxpQkFBaUIsS0FBSyxXQUFZO0FBQUEsRUFDN0UsTUFBTSxVQUFVLEtBQUssV0FBVyxHQUFHLElBQUksT0FBTyxJQUFJO0FBQUEsRUFDbEQsSUFBSSxPQUFPLFdBQVcsTUFBTTtBQUFBLEVBQzVCLElBQUksTUFBTTtBQUFBLElBQ04sTUFBTSxzQkFBc0IsRUFBRSxNQUFNLElBQUksQ0FBQztBQUFBLEVBQzdDO0FBQUEsRUFDQSxJQUFJLFNBQVMsUUFBUSxnQkFBZ0IsS0FBSyxJQUFJO0FBQUEsRUFDOUMsSUFBSSxPQUFPLFdBQVcsR0FBRyxHQUFHO0FBQUEsSUFDeEIsU0FBUyxPQUFPLFVBQVUsQ0FBQztBQUFBLEVBQy9CO0FBQUEsRUFDQSxJQUFJLFFBQVE7QUFBQSxJQUNSLE9BQU8sSUFBSTtBQUFBLEVBQ2Y7QUFBQSxFQUNBLE9BQU87QUFBQTs7O0FDOURKLElBQU0sd0JBQXdCLEdBQUcsZUFBZSxPQUFPLFdBQVcsQ0FBQyxNQUFNO0FBQUEsRUFDNUUsTUFBTSxrQkFBa0IsQ0FBQyxnQkFBZ0I7QUFBQSxJQUNyQyxNQUFNLFNBQVMsQ0FBQztBQUFBLElBQ2hCLElBQUksZUFBZSxPQUFPLGdCQUFnQixVQUFVO0FBQUEsTUFDaEQsV0FBVyxRQUFRLGFBQWE7QUFBQSxRQUM1QixNQUFNLFFBQVEsWUFBWTtBQUFBLFFBQzFCLElBQUksVUFBVSxhQUFhLFVBQVUsTUFBTTtBQUFBLFVBQ3ZDO0FBQUEsUUFDSjtBQUFBLFFBQ0EsSUFBSSxNQUFNLFFBQVEsS0FBSyxHQUFHO0FBQUEsVUFDdEIsTUFBTSxrQkFBa0Isb0JBQW9CO0FBQUEsWUFDeEM7QUFBQSxZQUNBLFNBQVM7QUFBQSxZQUNUO0FBQUEsWUFDQSxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxVQUNQLENBQUM7QUFBQSxVQUNELElBQUk7QUFBQSxZQUNBLE9BQU8sS0FBSyxlQUFlO0FBQUEsUUFDbkMsRUFDSyxTQUFJLE9BQU8sVUFBVSxVQUFVO0FBQUEsVUFDaEMsTUFBTSxtQkFBbUIscUJBQXFCO0FBQUEsWUFDMUM7QUFBQSxZQUNBLFNBQVM7QUFBQSxZQUNUO0FBQUEsWUFDQSxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxVQUNQLENBQUM7QUFBQSxVQUNELElBQUk7QUFBQSxZQUNBLE9BQU8sS0FBSyxnQkFBZ0I7QUFBQSxRQUNwQyxFQUNLO0FBQUEsVUFDRCxNQUFNLHNCQUFzQix3QkFBd0I7QUFBQSxZQUNoRDtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsVUFDSixDQUFDO0FBQUEsVUFDRCxJQUFJO0FBQUEsWUFDQSxPQUFPLEtBQUssbUJBQW1CO0FBQUE7QUFBQSxNQUUzQztBQUFBLElBQ0o7QUFBQSxJQUNBLE9BQU8sT0FBTyxLQUFLLEdBQUc7QUFBQTtBQUFBLEVBRTFCLE9BQU87QUFBQTtBQUtKLElBQU0sYUFBYSxDQUFDLGdCQUFnQjtBQUFBLEVBQ3ZDLElBQUksQ0FBQyxhQUFhO0FBQUEsSUFHZCxPQUFPO0FBQUEsRUFDWDtBQUFBLEVBQ0EsTUFBTSxlQUFlLFlBQVksTUFBTSxHQUFHLEVBQUUsSUFBSSxLQUFLO0FBQUEsRUFDckQsSUFBSSxDQUFDLGNBQWM7QUFBQSxJQUNmO0FBQUEsRUFDSjtBQUFBLEVBQ0EsSUFBSSxhQUFhLFdBQVcsa0JBQWtCLEtBQUssYUFBYSxTQUFTLE9BQU8sR0FBRztBQUFBLElBQy9FLE9BQU87QUFBQSxFQUNYO0FBQUEsRUFDQSxJQUFJLGlCQUFpQix1QkFBdUI7QUFBQSxJQUN4QyxPQUFPO0FBQUEsRUFDWDtBQUFBLEVBQ0EsSUFBSSxDQUFDLGdCQUFnQixVQUFVLFVBQVUsUUFBUSxFQUFFLEtBQUssQ0FBQyxTQUFTLGFBQWEsV0FBVyxJQUFJLENBQUMsR0FBRztBQUFBLElBQzlGLE9BQU87QUFBQSxFQUNYO0FBQUEsRUFDQSxJQUFJLGFBQWEsV0FBVyxPQUFPLEdBQUc7QUFBQSxJQUNsQyxPQUFPO0FBQUEsRUFDWDtBQUFBLEVBQ0E7QUFBQTtBQUVKLElBQU0sb0JBQW9CLENBQUMsU0FBUyxTQUFTO0FBQUEsRUFDekMsSUFBSSxDQUFDLE1BQU07QUFBQSxJQUNQLE9BQU87QUFBQSxFQUNYO0FBQUEsRUFDQSxJQUFJLFFBQVEsUUFBUSxJQUFJLElBQUksS0FBSyxRQUFRLFFBQVEsU0FBUyxRQUFRLFFBQVEsSUFBSSxRQUFRLEdBQUcsU0FBUyxHQUFHLE9BQU8sR0FBRztBQUFBLElBQzNHLE9BQU87QUFBQSxFQUNYO0FBQUEsRUFDQSxPQUFPO0FBQUE7QUFFSixJQUFNLGdCQUFnQixTQUFTLGFBQWEsY0FBYztBQUFBLEVBQzdELFdBQVcsUUFBUSxVQUFVO0FBQUEsSUFDekIsSUFBSSxrQkFBa0IsU0FBUyxLQUFLLElBQUksR0FBRztBQUFBLE1BQ3ZDO0FBQUEsSUFDSjtBQUFBLElBQ0EsTUFBTSxRQUFRLE1BQU0sYUFBYSxNQUFNLFFBQVEsSUFBSTtBQUFBLElBQ25ELElBQUksQ0FBQyxPQUFPO0FBQUEsTUFDUjtBQUFBLElBQ0o7QUFBQSxJQUNBLE1BQU0sT0FBTyxLQUFLLFFBQVE7QUFBQSxJQUMxQixRQUFRLEtBQUs7QUFBQSxXQUNKO0FBQUEsUUFDRCxJQUFJLENBQUMsUUFBUSxPQUFPO0FBQUEsVUFDaEIsUUFBUSxRQUFRLENBQUM7QUFBQSxRQUNyQjtBQUFBLFFBQ0EsUUFBUSxNQUFNLFFBQVE7QUFBQSxRQUN0QjtBQUFBLFdBQ0M7QUFBQSxRQUNELFFBQVEsUUFBUSxPQUFPLFVBQVUsR0FBRyxRQUFRLE9BQU87QUFBQSxRQUNuRDtBQUFBLFdBQ0M7QUFBQTtBQUFBLFFBRUQsUUFBUSxRQUFRLElBQUksTUFBTSxLQUFLO0FBQUEsUUFDL0I7QUFBQTtBQUFBLEVBRVo7QUFBQTtBQUVHLElBQU0sV0FBVyxDQUFDLFlBQVksT0FBTztBQUFBLEVBQ3hDLFNBQVMsUUFBUTtBQUFBLEVBQ2pCLE1BQU0sUUFBUTtBQUFBLEVBQ2QsT0FBTyxRQUFRO0FBQUEsRUFDZixpQkFBaUIsT0FBTyxRQUFRLG9CQUFvQixhQUM5QyxRQUFRLGtCQUNSLHNCQUFzQixRQUFRLGVBQWU7QUFBQSxFQUNuRCxLQUFLLFFBQVE7QUFDakIsQ0FBQztBQUNNLElBQU0sZUFBZSxDQUFDLEdBQUcsTUFBTTtBQUFBLEVBQ2xDLE1BQU0sU0FBUyxLQUFLLE1BQU0sRUFBRTtBQUFBLEVBQzVCLElBQUksT0FBTyxTQUFTLFNBQVMsR0FBRyxHQUFHO0FBQUEsSUFDL0IsT0FBTyxVQUFVLE9BQU8sUUFBUSxVQUFVLEdBQUcsT0FBTyxRQUFRLFNBQVMsQ0FBQztBQUFBLEVBQzFFO0FBQUEsRUFDQSxPQUFPLFVBQVUsYUFBYSxFQUFFLFNBQVMsRUFBRSxPQUFPO0FBQUEsRUFDbEQsT0FBTztBQUFBO0FBRUosSUFBTSxlQUFlLElBQUksWUFBWTtBQUFBLEVBQ3hDLE1BQU0sZ0JBQWdCLElBQUk7QUFBQSxFQUMxQixXQUFXLFVBQVUsU0FBUztBQUFBLElBQzFCLElBQUksQ0FBQyxVQUFVLE9BQU8sV0FBVyxVQUFVO0FBQUEsTUFDdkM7QUFBQSxJQUNKO0FBQUEsSUFDQSxNQUFNLFdBQVcsa0JBQWtCLFVBQVUsT0FBTyxRQUFRLElBQUksT0FBTyxRQUFRLE1BQU07QUFBQSxJQUNyRixZQUFZLEtBQUssVUFBVSxVQUFVO0FBQUEsTUFDakMsSUFBSSxVQUFVLE1BQU07QUFBQSxRQUNoQixjQUFjLE9BQU8sR0FBRztBQUFBLE1BQzVCLEVBQ0ssU0FBSSxNQUFNLFFBQVEsS0FBSyxHQUFHO0FBQUEsUUFDM0IsV0FBVyxLQUFLLE9BQU87QUFBQSxVQUNuQixjQUFjLE9BQU8sS0FBSyxDQUFDO0FBQUEsUUFDL0I7QUFBQSxNQUNKLEVBQ0ssU0FBSSxVQUFVLFdBQVc7QUFBQSxRQUcxQixjQUFjLElBQUksS0FBSyxPQUFPLFVBQVUsV0FBVyxLQUFLLFVBQVUsS0FBSyxJQUFJLEtBQUs7QUFBQSxNQUNwRjtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQUEsRUFDQSxPQUFPO0FBQUE7QUFBQTtBQUVYLE1BQU0sYUFBYTtBQUFBLEVBQ2Y7QUFBQSxFQUNBLFdBQVcsR0FBRztBQUFBLElBQ1YsS0FBSyxPQUFPLENBQUM7QUFBQTtBQUFBLEVBRWpCLEtBQUssR0FBRztBQUFBLElBQ0osS0FBSyxPQUFPLENBQUM7QUFBQTtBQUFBLEVBRWpCLG1CQUFtQixDQUFDLElBQUk7QUFBQSxJQUNwQixJQUFJLE9BQU8sT0FBTyxVQUFVO0FBQUEsTUFDeEIsT0FBTyxLQUFLLEtBQUssTUFBTSxLQUFLO0FBQUEsSUFDaEMsRUFDSztBQUFBLE1BQ0QsT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFO0FBQUE7QUFBQTtBQUFBLEVBR25DLE1BQU0sQ0FBQyxJQUFJO0FBQUEsSUFDUCxNQUFNLFFBQVEsS0FBSyxvQkFBb0IsRUFBRTtBQUFBLElBQ3pDLE9BQU8sQ0FBQyxDQUFDLEtBQUssS0FBSztBQUFBO0FBQUEsRUFFdkIsS0FBSyxDQUFDLElBQUk7QUFBQSxJQUNOLE1BQU0sUUFBUSxLQUFLLG9CQUFvQixFQUFFO0FBQUEsSUFDekMsSUFBSSxLQUFLLEtBQUssUUFBUTtBQUFBLE1BQ2xCLEtBQUssS0FBSyxTQUFTO0FBQUEsSUFDdkI7QUFBQTtBQUFBLEVBRUosTUFBTSxDQUFDLElBQUksSUFBSTtBQUFBLElBQ1gsTUFBTSxRQUFRLEtBQUssb0JBQW9CLEVBQUU7QUFBQSxJQUN6QyxJQUFJLEtBQUssS0FBSyxRQUFRO0FBQUEsTUFDbEIsS0FBSyxLQUFLLFNBQVM7QUFBQSxNQUNuQixPQUFPO0FBQUEsSUFDWCxFQUNLO0FBQUEsTUFDRCxPQUFPO0FBQUE7QUFBQTtBQUFBLEVBR2YsR0FBRyxDQUFDLElBQUk7QUFBQSxJQUNKLEtBQUssT0FBTyxDQUFDLEdBQUcsS0FBSyxNQUFNLEVBQUU7QUFBQSxJQUM3QixPQUFPLEtBQUssS0FBSyxTQUFTO0FBQUE7QUFFbEM7QUFFTyxJQUFNLHFCQUFxQixPQUFPO0FBQUEsRUFDckMsT0FBTyxJQUFJO0FBQUEsRUFDWCxTQUFTLElBQUk7QUFBQSxFQUNiLFVBQVUsSUFBSTtBQUNsQjtBQUNBLElBQU0seUJBQXlCLHNCQUFzQjtBQUFBLEVBQ2pELGVBQWU7QUFBQSxFQUNmLE9BQU87QUFBQSxJQUNILFNBQVM7QUFBQSxJQUNULE9BQU87QUFBQSxFQUNYO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDSixTQUFTO0FBQUEsSUFDVCxPQUFPO0FBQUEsRUFDWDtBQUNKLENBQUM7QUFDRCxJQUFNLGlCQUFpQjtBQUFBLEVBQ25CLGdCQUFnQjtBQUNwQjtBQUNPLElBQU0sZUFBZSxDQUFDLFdBQVcsQ0FBQyxPQUFPO0FBQUEsS0FDekM7QUFBQSxFQUNILFNBQVM7QUFBQSxFQUNULFNBQVM7QUFBQSxFQUNULGlCQUFpQjtBQUFBLEtBQ2Q7QUFDUDs7O0FDOU5PLElBQU0sZUFBZSxDQUFDLFNBQVMsQ0FBQyxNQUFNO0FBQUEsRUFDekMsSUFBSSxVQUFVLGFBQWEsYUFBYSxHQUFHLE1BQU07QUFBQSxFQUNqRCxNQUFNLFlBQVksT0FBTyxLQUFLLFFBQVE7QUFBQSxFQUN0QyxNQUFNLFlBQVksQ0FBQyxZQUFXO0FBQUEsSUFDMUIsVUFBVSxhQUFhLFNBQVMsT0FBTTtBQUFBLElBQ3RDLE9BQU8sVUFBVTtBQUFBO0FBQUEsRUFFckIsTUFBTSxlQUFlLG1CQUFtQjtBQUFBLEVBQ3hDLE1BQU0sZ0JBQWdCLE9BQU8sWUFBWTtBQUFBLElBQ3JDLE1BQU0sT0FBTztBQUFBLFNBQ047QUFBQSxTQUNBO0FBQUEsTUFDSCxPQUFPLFFBQVEsU0FBUyxRQUFRLFNBQVMsV0FBVztBQUFBLE1BQ3BELFNBQVMsYUFBYSxRQUFRLFNBQVMsUUFBUSxPQUFPO0FBQUEsTUFDdEQsZ0JBQWdCO0FBQUEsSUFDcEI7QUFBQSxJQUNBLElBQUksS0FBSyxVQUFVO0FBQUEsTUFDZixNQUFNLGNBQWM7QUFBQSxXQUNiO0FBQUEsUUFDSCxVQUFVLEtBQUs7QUFBQSxNQUNuQixDQUFDO0FBQUEsSUFDTDtBQUFBLElBQ0EsSUFBSSxLQUFLLGtCQUFrQjtBQUFBLE1BQ3ZCLE1BQU0sS0FBSyxpQkFBaUIsSUFBSTtBQUFBLElBQ3BDO0FBQUEsSUFDQSxJQUFJLEtBQUssUUFBUSxLQUFLLGdCQUFnQjtBQUFBLE1BQ2xDLEtBQUssaUJBQWlCLEtBQUssZUFBZSxLQUFLLElBQUk7QUFBQSxJQUN2RDtBQUFBLElBRUEsSUFBSSxLQUFLLG1CQUFtQixhQUFhLEtBQUssbUJBQW1CLElBQUk7QUFBQSxNQUNqRSxLQUFLLFFBQVEsT0FBTyxjQUFjO0FBQUEsSUFDdEM7QUFBQSxJQUNBLE1BQU0sTUFBTSxTQUFTLElBQUk7QUFBQSxJQUN6QixPQUFPLEVBQUUsTUFBTSxJQUFJO0FBQUE7QUFBQSxFQUV2QixNQUFNLFVBQVUsT0FBTyxZQUFZO0FBQUEsSUFFL0IsUUFBUSxNQUFNLFFBQVEsTUFBTSxjQUFjLE9BQU87QUFBQSxJQUNqRCxNQUFNLGNBQWM7QUFBQSxNQUNoQixVQUFVO0FBQUEsU0FDUDtBQUFBLE1BQ0gsTUFBTSxLQUFLO0FBQUEsSUFDZjtBQUFBLElBQ0EsSUFBSSxXQUFVLElBQUksUUFBUSxLQUFLLFdBQVc7QUFBQSxJQUMxQyxXQUFXLE1BQU0sYUFBYSxRQUFRLE1BQU07QUFBQSxNQUN4QyxJQUFJLElBQUk7QUFBQSxRQUNKLFdBQVUsTUFBTSxHQUFHLFVBQVMsSUFBSTtBQUFBLE1BQ3BDO0FBQUEsSUFDSjtBQUFBLElBR0EsTUFBTSxTQUFTLEtBQUs7QUFBQSxJQUNwQixJQUFJLFdBQVcsTUFBTSxPQUFPLFFBQU87QUFBQSxJQUNuQyxXQUFXLE1BQU0sYUFBYSxTQUFTLE1BQU07QUFBQSxNQUN6QyxJQUFJLElBQUk7QUFBQSxRQUNKLFdBQVcsTUFBTSxHQUFHLFVBQVUsVUFBUyxJQUFJO0FBQUEsTUFDL0M7QUFBQSxJQUNKO0FBQUEsSUFDQSxNQUFNLFNBQVM7QUFBQSxNQUNYO0FBQUEsTUFDQTtBQUFBLElBQ0o7QUFBQSxJQUNBLElBQUksU0FBUyxJQUFJO0FBQUEsTUFDYixJQUFJLFNBQVMsV0FBVyxPQUFPLFNBQVMsUUFBUSxJQUFJLGdCQUFnQixNQUFNLEtBQUs7QUFBQSxRQUMzRSxPQUFPLEtBQUssa0JBQWtCLFNBQ3hCLENBQUMsSUFDRDtBQUFBLFVBQ0UsTUFBTSxDQUFDO0FBQUEsYUFDSjtBQUFBLFFBQ1A7QUFBQSxNQUNSO0FBQUEsTUFDQSxNQUFNLFdBQVcsS0FBSyxZQUFZLFNBQVMsV0FBVyxTQUFTLFFBQVEsSUFBSSxjQUFjLENBQUMsSUFBSSxLQUFLLFlBQVk7QUFBQSxNQUMvRyxJQUFJO0FBQUEsTUFDSixRQUFRO0FBQUEsYUFDQztBQUFBLGFBQ0E7QUFBQSxhQUNBO0FBQUEsYUFDQTtBQUFBLGFBQ0E7QUFBQSxVQUNELE9BQU8sTUFBTSxTQUFTLFNBQVM7QUFBQSxVQUMvQjtBQUFBLGFBQ0M7QUFBQSxVQUNELE9BQU8sS0FBSyxrQkFBa0IsU0FDeEIsU0FBUyxPQUNUO0FBQUEsWUFDRSxNQUFNLFNBQVM7QUFBQSxlQUNaO0FBQUEsVUFDUDtBQUFBO0FBQUEsTUFFWixJQUFJLFlBQVksUUFBUTtBQUFBLFFBQ3BCLElBQUksS0FBSyxtQkFBbUI7QUFBQSxVQUN4QixNQUFNLEtBQUssa0JBQWtCLElBQUk7QUFBQSxRQUNyQztBQUFBLFFBQ0EsSUFBSSxLQUFLLHFCQUFxQjtBQUFBLFVBQzFCLE9BQU8sTUFBTSxLQUFLLG9CQUFvQixJQUFJO0FBQUEsUUFDOUM7QUFBQSxNQUNKO0FBQUEsTUFDQSxPQUFPLEtBQUssa0JBQWtCLFNBQ3hCLE9BQ0E7QUFBQSxRQUNFO0FBQUEsV0FDRztBQUFBLE1BQ1A7QUFBQSxJQUNSO0FBQUEsSUFDQSxNQUFNLFlBQVksTUFBTSxTQUFTLEtBQUs7QUFBQSxJQUN0QyxJQUFJO0FBQUEsSUFDSixJQUFJO0FBQUEsTUFDQSxZQUFZLEtBQUssTUFBTSxTQUFTO0FBQUEsTUFFcEMsTUFBTTtBQUFBLElBR04sTUFBTSxRQUFRLGFBQWE7QUFBQSxJQUMzQixJQUFJLGFBQWE7QUFBQSxJQUNqQixXQUFXLE1BQU0sYUFBYSxNQUFNLE1BQU07QUFBQSxNQUN0QyxJQUFJLElBQUk7QUFBQSxRQUNKLGFBQWMsTUFBTSxHQUFHLE9BQU8sVUFBVSxVQUFTLElBQUk7QUFBQSxNQUN6RDtBQUFBLElBQ0o7QUFBQSxJQUNBLGFBQWEsY0FBYyxDQUFDO0FBQUEsSUFDNUIsSUFBSSxLQUFLLGNBQWM7QUFBQSxNQUNuQixNQUFNO0FBQUEsSUFDVjtBQUFBLElBRUEsT0FBTyxLQUFLLGtCQUFrQixTQUN4QixZQUNBO0FBQUEsTUFDRSxPQUFPO0FBQUEsU0FDSjtBQUFBLElBQ1A7QUFBQTtBQUFBLEVBRVIsTUFBTSxhQUFhLENBQUMsV0FBVztBQUFBLElBQzNCLE1BQU0sS0FBSyxDQUFDLFlBQVksUUFBUSxLQUFLLFNBQVMsT0FBTyxDQUFDO0FBQUEsSUFDdEQsR0FBRyxNQUFNLE9BQU8sWUFBWTtBQUFBLE1BQ3hCLFFBQVEsTUFBTSxRQUFRLE1BQU0sY0FBYyxPQUFPO0FBQUEsTUFDakQsT0FBTyxnQkFBZ0I7QUFBQSxXQUNoQjtBQUFBLFFBQ0gsTUFBTSxLQUFLO0FBQUEsUUFDWCxTQUFTLEtBQUs7QUFBQSxRQUNkO0FBQUEsUUFDQTtBQUFBLE1BQ0osQ0FBQztBQUFBO0FBQUEsSUFFTCxPQUFPO0FBQUE7QUFBQSxFQUVYLE9BQU87QUFBQSxJQUNIO0FBQUEsSUFDQSxTQUFTLFdBQVcsU0FBUztBQUFBLElBQzdCLFFBQVEsV0FBVyxRQUFRO0FBQUEsSUFDM0IsS0FBSyxXQUFXLEtBQUs7QUFBQSxJQUNyQjtBQUFBLElBQ0EsTUFBTSxXQUFXLE1BQU07QUFBQSxJQUN2QjtBQUFBLElBQ0EsU0FBUyxXQUFXLFNBQVM7QUFBQSxJQUM3QixPQUFPLFdBQVcsT0FBTztBQUFBLElBQ3pCLE1BQU0sV0FBVyxNQUFNO0FBQUEsSUFDdkIsS0FBSyxXQUFXLEtBQUs7QUFBQSxJQUNyQjtBQUFBLElBQ0E7QUFBQSxJQUNBLE9BQU8sV0FBVyxPQUFPO0FBQUEsRUFDN0I7QUFBQTs7QUNsS0osSUFBTSxtQkFBbUI7QUFBQSxFQUNyQixRQUFRO0FBQUEsRUFDUixXQUFXO0FBQUEsRUFDWCxRQUFRO0FBQUEsRUFDUixTQUFTO0FBQ2I7QUFDQSxJQUFNLGdCQUFnQixPQUFPLFFBQVEsZ0JBQWdCOztBQ0w5QyxJQUFNLFNBQVMsYUFBYSxhQUFhO0FBQUEsRUFDNUMsU0FBUztBQUNiLENBQUMsQ0FBQzs7O0FDRkYsTUFBTSxjQUFjO0FBQUEsRUFDaEIsVUFBVTtBQUFBLEVBQ1YsV0FBVyxDQUFDLE1BQU07QUFBQSxJQUNkLElBQUksTUFBTSxRQUFRO0FBQUEsTUFDZCxLQUFLLFVBQVUsS0FBSztBQUFBLElBQ3hCO0FBQUE7QUFFUjtBQUFBO0FBQ0EsTUFBTSxlQUFlLGNBQWM7QUFBQSxFQUkvQixLQUFLLENBQUMsU0FBUztBQUFBLElBQ1gsUUFBUSxTQUFTLFVBQVUsS0FBSyxTQUFTLElBQUksSUFBSTtBQUFBLE1BQzdDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFFVDtBQUFBO0FBQ0EsTUFBTSxnQkFBZ0IsY0FBYztBQUFBLEVBSWhDLElBQUksQ0FBQyxTQUFTO0FBQUEsSUFDVixRQUFRLFNBQVMsVUFBVSxLQUFLLFNBQVMsSUFBSTtBQUFBLE1BQ3pDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFBQSxFQUtMLE9BQU8sQ0FBQyxTQUFTO0FBQUEsSUFDYixRQUFRLFNBQVMsVUFBVSxLQUFLLFNBQVMsSUFBSTtBQUFBLE1BQ3pDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFFVDtBQUFBO0FBQ0EsTUFBTSxZQUFZLGNBQWM7QUFBQSxFQUk1QixJQUFJLENBQUMsU0FBUztBQUFBLElBQ1YsUUFBUSxTQUFTLFVBQVUsS0FBSyxTQUFTLElBQUk7QUFBQSxNQUN6QyxLQUFLO0FBQUEsU0FDRjtBQUFBLElBQ1AsQ0FBQztBQUFBO0FBQUEsRUFLTCxNQUFNLENBQUMsU0FBUztBQUFBLElBQ1osUUFBUSxTQUFTLFVBQVUsS0FBSyxTQUFTLEtBQUs7QUFBQSxNQUMxQyxLQUFLO0FBQUEsU0FDRjtBQUFBLE1BQ0gsU0FBUztBQUFBLFFBQ0wsZ0JBQWdCO0FBQUEsV0FDYixTQUFTO0FBQUEsTUFDaEI7QUFBQSxJQUNKLENBQUM7QUFBQTtBQUFBLEVBS0wsTUFBTSxDQUFDLFNBQVM7QUFBQSxJQUNaLFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxPQUFPO0FBQUEsTUFDM0MsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUFBLEVBS0wsR0FBRyxDQUFDLFNBQVM7QUFBQSxJQUNULFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxJQUFJO0FBQUEsTUFDeEMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUFBLEVBS0wsTUFBTSxDQUFDLFNBQVM7QUFBQSxJQUNaLFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxJQUFJO0FBQUEsTUFDeEMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxNQUNILFNBQVM7QUFBQSxRQUNMLGdCQUFnQjtBQUFBLFdBQ2IsUUFBUTtBQUFBLE1BQ2Y7QUFBQSxJQUNKLENBQUM7QUFBQTtBQUFBLEVBS0wsT0FBTyxDQUFDLFNBQVM7QUFBQSxJQUNiLFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxJQUFJO0FBQUEsTUFDeEMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUVUO0FBQUE7QUFDQSxNQUFNLGVBQWUsY0FBYztBQUFBLEVBSS9CLEdBQUcsQ0FBQyxTQUFTO0FBQUEsSUFDVCxRQUFRLFNBQVMsVUFBVSxLQUFLLFNBQVMsSUFBSTtBQUFBLE1BQ3pDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFBQSxFQUtMLE1BQU0sQ0FBQyxTQUFTO0FBQUEsSUFDWixRQUFRLFNBQVMsVUFBVSxLQUFLLFNBQVMsTUFBTTtBQUFBLE1BQzNDLEtBQUs7QUFBQSxTQUNGO0FBQUEsTUFDSCxTQUFTO0FBQUEsUUFDTCxnQkFBZ0I7QUFBQSxXQUNiLFNBQVM7QUFBQSxNQUNoQjtBQUFBLElBQ0osQ0FBQztBQUFBO0FBQUEsRUFLTCxTQUFTLENBQUMsU0FBUztBQUFBLElBQ2YsUUFBUSxTQUFTLFVBQVUsS0FBSyxTQUFTLElBQUk7QUFBQSxNQUN6QyxLQUFLO0FBQUEsU0FDRjtBQUFBLElBQ1AsQ0FBQztBQUFBO0FBRVQ7QUFBQTtBQUNBLE1BQU0sYUFBYSxjQUFjO0FBQUEsRUFJN0IsR0FBRyxDQUFDLFNBQVM7QUFBQSxJQUNULFFBQVEsU0FBUyxVQUFVLEtBQUssU0FBUyxJQUFJO0FBQUEsTUFDekMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUFBLEVBS0wsSUFBSSxDQUFDLFNBQVM7QUFBQSxJQUNWLFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxJQUFJO0FBQUEsTUFDeEMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUVUO0FBQUE7QUFDQSxNQUFNLGlCQUFpQixjQUFjO0FBQUEsRUFJakMsT0FBTyxDQUFDLFNBQVM7QUFBQSxJQUNiLFFBQVEsU0FBUyxVQUFVLEtBQUssU0FBUyxLQUFLO0FBQUEsTUFDMUMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUVUO0FBQUE7QUFDQSxNQUFNLGFBQWEsY0FBYztBQUFBLEVBSTdCLEdBQUcsQ0FBQyxTQUFTO0FBQUEsSUFDVCxRQUFRLFNBQVMsVUFBVSxLQUFLLFNBQVMsSUFBSTtBQUFBLE1BQ3pDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFFVDtBQUFBO0FBQ0EsTUFBTSxZQUFZLGNBQWM7QUFBQSxFQUk1QixHQUFHLENBQUMsU0FBUztBQUFBLElBQ1QsUUFBUSxTQUFTLFVBQVUsS0FBSyxTQUFTLElBQUk7QUFBQSxNQUN6QyxLQUFLO0FBQUEsU0FDRjtBQUFBLElBQ1AsQ0FBQztBQUFBO0FBRVQ7QUFBQTtBQUNBLE1BQU0sZ0JBQWdCLGNBQWM7QUFBQSxFQUloQyxJQUFJLENBQUMsU0FBUztBQUFBLElBQ1YsUUFBUSxTQUFTLFVBQVUsS0FBSyxTQUFTLElBQUk7QUFBQSxNQUN6QyxLQUFLO0FBQUEsU0FDRjtBQUFBLElBQ1AsQ0FBQztBQUFBO0FBQUEsRUFLTCxNQUFNLENBQUMsU0FBUztBQUFBLElBQ1osUUFBUSxTQUFTLFVBQVUsS0FBSyxTQUFTLEtBQUs7QUFBQSxNQUMxQyxLQUFLO0FBQUEsU0FDRjtBQUFBLE1BQ0gsU0FBUztBQUFBLFFBQ0wsZ0JBQWdCO0FBQUEsV0FDYixTQUFTO0FBQUEsTUFDaEI7QUFBQSxJQUNKLENBQUM7QUFBQTtBQUFBLEVBS0wsTUFBTSxDQUFDLFNBQVM7QUFBQSxJQUNaLFFBQVEsU0FBUyxVQUFVLEtBQUssU0FBUyxJQUFJO0FBQUEsTUFDekMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUFBLEVBS0wsTUFBTSxDQUFDLFNBQVM7QUFBQSxJQUNaLFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxPQUFPO0FBQUEsTUFDM0MsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUFBLEVBS0wsR0FBRyxDQUFDLFNBQVM7QUFBQSxJQUNULFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxJQUFJO0FBQUEsTUFDeEMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUFBLEVBS0wsTUFBTSxDQUFDLFNBQVM7QUFBQSxJQUNaLFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxNQUFNO0FBQUEsTUFDMUMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxNQUNILFNBQVM7QUFBQSxRQUNMLGdCQUFnQjtBQUFBLFdBQ2IsUUFBUTtBQUFBLE1BQ2Y7QUFBQSxJQUNKLENBQUM7QUFBQTtBQUFBLEVBS0wsUUFBUSxDQUFDLFNBQVM7QUFBQSxJQUNkLFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxJQUFJO0FBQUEsTUFDeEMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUFBLEVBS0wsSUFBSSxDQUFDLFNBQVM7QUFBQSxJQUNWLFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxJQUFJO0FBQUEsTUFDeEMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUFBLEVBS0wsSUFBSSxDQUFDLFNBQVM7QUFBQSxJQUNWLFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxLQUFLO0FBQUEsTUFDekMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxNQUNILFNBQVM7QUFBQSxRQUNMLGdCQUFnQjtBQUFBLFdBQ2IsUUFBUTtBQUFBLE1BQ2Y7QUFBQSxJQUNKLENBQUM7QUFBQTtBQUFBLEVBS0wsSUFBSSxDQUFDLFNBQVM7QUFBQSxJQUNWLFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxLQUFLO0FBQUEsTUFDekMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxNQUNILFNBQVM7QUFBQSxRQUNMLGdCQUFnQjtBQUFBLFdBQ2IsUUFBUTtBQUFBLE1BQ2Y7QUFBQSxJQUNKLENBQUM7QUFBQTtBQUFBLEVBS0wsS0FBSyxDQUFDLFNBQVM7QUFBQSxJQUNYLFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxLQUFLO0FBQUEsTUFDekMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUFBLEVBS0wsT0FBTyxDQUFDLFNBQVM7QUFBQSxJQUNiLFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxPQUFPO0FBQUEsTUFDM0MsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUFBLEVBS0wsS0FBSyxDQUFDLFNBQVM7QUFBQSxJQUNYLFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxLQUFLO0FBQUEsTUFDekMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUFBLEVBS0wsSUFBSSxDQUFDLFNBQVM7QUFBQSxJQUNWLFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxJQUFJO0FBQUEsTUFDeEMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUFBLEVBS0wsU0FBUyxDQUFDLFNBQVM7QUFBQSxJQUNmLFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxLQUFLO0FBQUEsTUFDekMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxNQUNILFNBQVM7QUFBQSxRQUNMLGdCQUFnQjtBQUFBLFdBQ2IsUUFBUTtBQUFBLE1BQ2Y7QUFBQSxJQUNKLENBQUM7QUFBQTtBQUFBLEVBS0ws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LE1BQU0sU0FBUyxLQUFLLE9BQU8sSUFBSTtBQUFBLElBQy9CLE9BQU8sS0FBSyxJQUFJLGNBQWMsUUFBUSxLQUFLO0FBQUE7QUFBQSxPQU1qQyxtQkFBa0IsQ0FBQyxXQUFrQztBQUFBLElBQy9ELElBQUk7QUFBQSxNQUlBLElBQUksTUFBTSxrQkFBa0IsRUFBRSxVQUFVLENBQUM7QUFBQSxNQUMzQyxPQUFPLE9BQU87QUFBQSxNQUNaLE1BQU0sZUFDRixpQkFBaUIsUUFBUSxNQUFNLFVBQVUsT0FBTyxLQUFLO0FBQUEsTUFDekQsSUFBSSxLQUFLLDJCQUEyQjtBQUFBLFFBQ2hDO0FBQUEsUUFDQSxPQUFPO0FBQUEsTUFDWCxDQUFDO0FBQUE7QUFBQTtBQUFBLEVBT0QsaUJBQWlCLEdBQVc7QUFBQSxJQUNoQyxPQUFPLFdBQVcsS0FBSyxJQUFJLEtBQUssS0FBSyxPQUFPLEVBQUUsU0FBUyxFQUFFLEVBQUUsT0FBTyxHQUFHLENBQUM7QUFBQTtBQUFBLEVBT2xFLGlCQUFpQixHQUFXO0FBQUEsSUFDaEMsT0FBTyxPQUFPLEtBQUssSUFBSSxLQUFLLEtBQUssT0FBTyxFQUFFLFNBQVMsRUFBRSxFQUFFLFVBQVUsR0FBRyxDQUFDO0FBQUE7QUFBQSxPQU1uRSxRQUFPLEdBQWtCO0FBQUEsSUFDM0IsSUFBSTtBQUFBLE1BQ0EsSUFBSSxNQUFNLHVCQUF1QjtBQUFBLFFBQzdCLGdCQUFnQixLQUFLLGVBQWU7QUFBQSxRQUNwQyxXQUFXLENBQUMsQ0FBQyxLQUFLO0FBQUEsTUFDdEIsQ0FBQztBQUFBLE1BR0QsTUFBTSxLQUFLLGlCQUFpQjtBQUFBLE1BRzVCLElBQUksS0FBSyxRQUFRO0FBQUEsUUFDYixJQUFJLEtBQUssaUNBQWlDO0FBQUEsUUFDMUMsSUFBSTtBQUFBLFVBQ0EsS0FBSyxPQUFPLE1BQU07QUFBQSxVQUNsQixLQUFLLFNBQVM7QUFBQSxVQUNkLElBQUksS0FBSyxxQ0FBcUM7QUFBQSxVQUNoRCxPQUFPLE9BQU87QUFBQSxVQUNaLE1BQU0sV0FDRixpQkFBaUIsUUFBUSxNQUFNLFVBQVUsT0FBTyxLQUFLO0FBQUEsVUFDekQsSUFBSSxNQUFNLGlDQUFpQztBQUFBLFlBQ3ZDLE9BQU87QUFBQSxVQUNYLENBQUM7QUFBQTtBQUFBLE1BRVQsRUFBTztBQUFBLFFBQ0gsSUFBSSxNQUNBLDJEQUNKO0FBQUE7QUFBQSxNQUdKLElBQUksS0FBSyxrQkFBa0I7QUFBQSxNQUMzQjtBQUFBLE1BQ0YsT0FBTyxPQUFPO0FBQUEsTUFDWixNQUFNLFdBQ0YsaUJBQWlCLFFBQVEsTUFBTSxVQUFVLE9BQU8sS0FBSztBQUFBLE1BQ3pELElBQUksTUFBTSx3Q0FBd0M7QUFBQSxRQUM5QyxPQUFPO0FBQUEsTUFDWCxDQUFDO0FBQUEsTUFDRDtBQUFBO0FBQUE7QUFHWjsiLAogICJkZWJ1Z0lkIjogIkMwMzZCQTA0MjU4REU0N0Q2NDc1NkUyMTY0NzU2RTIxIiwKICAibmFtZXMiOiBbXQp9
