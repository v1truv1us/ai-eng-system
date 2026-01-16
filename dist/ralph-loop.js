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
var __require = /* @__PURE__ */ createRequire(import.meta.url);

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
// node_modules/@opencode-ai/sdk/dist/server.js
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
            let assistantMessageId2 = null;
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
                  assistantMessageId2 = info.id;
                  log.debug("Identified assistant message (exact parentID match)", {
                    sessionId,
                    assistantMessageId: assistantMessageId2
                  });
                } else if (!assistantMessageId2 && info?.role === "assistant" && info?.sessionID === sessionId) {
                  log.debug("Identified assistant message (fallback - no exact parentID match)", {
                    sessionId,
                    assistantMessageId: info.id,
                    infoParentId: info?.parentID,
                    userMessageId
                  });
                  assistantMessageId2 = info.id;
                }
                if (info?.role === "assistant" && info?.sessionID === sessionId) {
                  lastProgressTime = Date.now();
                  resetIdleTimer();
                }
                if (assistantMessageId2 && info?.id === assistantMessageId2) {
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
                      assistantMessageId: assistantMessageId2,
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
                  assistantMessageId: assistantMessageId2,
                  isRelevant: assistantMessageId2 && part?.sessionID === sessionId && part?.messageID === assistantMessageId2
                });
                if (!assistantMessageId2)
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
                  if (part.sessionID !== sessionId || part.messageID !== assistantMessageId2) {} else {
                    lastProgressTime = Date.now();
                    resetIdleTimer();
                  }
                  continue;
                }
                if (!part || part.type !== "text")
                  continue;
                if (part.sessionID !== sessionId)
                  continue;
                if (part.messageID !== assistantMessageId2)
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
              assistantMessageIdFound: !!assistantMessageId2
            });
            await closeOnce();
            return {
              content: content || "No content received",
              diagnostics: {
                bytesWritten,
                contentLength: content.length,
                idleTimedOut,
                assistantMessageIdFound: !!assistantMessageId2,
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

//# debugId=289999D74B9BD6F364756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2V4ZWN1dGlvbi9yYWxwaC1sb29wLnRzIiwgIi4uL3NyYy9iYWNrZW5kcy9vcGVuY29kZS9jbGllbnQudHMiLCAiLi4vbm9kZV9tb2R1bGVzL0BvcGVuY29kZS1haS9zZGsvZGlzdC9nZW4vY29yZS9zZXJ2ZXJTZW50RXZlbnRzLmdlbi5qcyIsICIuLi9ub2RlX21vZHVsZXMvQG9wZW5jb2RlLWFpL3Nkay9kaXN0L2dlbi9jb3JlL2F1dGguZ2VuLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9Ab3BlbmNvZGUtYWkvc2RrL2Rpc3QvZ2VuL2NvcmUvYm9keVNlcmlhbGl6ZXIuZ2VuLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9Ab3BlbmNvZGUtYWkvc2RrL2Rpc3QvZ2VuL2NvcmUvcGF0aFNlcmlhbGl6ZXIuZ2VuLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9Ab3BlbmNvZGUtYWkvc2RrL2Rpc3QvZ2VuL2NvcmUvdXRpbHMuZ2VuLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9Ab3BlbmNvZGUtYWkvc2RrL2Rpc3QvZ2VuL2NsaWVudC91dGlscy5nZW4uanMiLCAiLi4vbm9kZV9tb2R1bGVzL0BvcGVuY29kZS1haS9zZGsvZGlzdC9nZW4vY2xpZW50L2NsaWVudC5nZW4uanMiLCAiLi4vbm9kZV9tb2R1bGVzL0BvcGVuY29kZS1haS9zZGsvZGlzdC9nZW4vY29yZS9wYXJhbXMuZ2VuLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9Ab3BlbmNvZGUtYWkvc2RrL2Rpc3QvZ2VuL2NsaWVudC5nZW4uanMiLCAiLi4vbm9kZV9tb2R1bGVzL0BvcGVuY29kZS1haS9zZGsvZGlzdC9nZW4vc2RrLmdlbi5qcyIsICIuLi9ub2RlX21vZHVsZXMvQG9wZW5jb2RlLWFpL3Nkay9kaXN0L2NsaWVudC5qcyIsICIuLi9ub2RlX21vZHVsZXMvQG9wZW5jb2RlLWFpL3Nkay9kaXN0L3NlcnZlci5qcyIsICIuLi9ub2RlX21vZHVsZXMvQG9wZW5jb2RlLWFpL3Nkay9kaXN0L2luZGV4LmpzIiwgIi4uL3NyYy91dGlsL2xvZy50cyIsICIuLi9zcmMvY2xpL3VpLnRzIiwgIi4uL3NyYy9wcm9tcHQtb3B0aW1pemF0aW9uL2FuYWx5emVyLnRzIiwgIi4uL3NyYy9wcm9tcHQtb3B0aW1pemF0aW9uL3RlY2huaXF1ZXMudHMiLCAiLi4vc3JjL3Byb21wdC1vcHRpbWl6YXRpb24vb3B0aW1pemVyLnRzIiwgIi4uL3NyYy91dGlsL2Rpc2NvcmQtd2ViaG9vay50cyIsICIuLi9zcmMvZXhlY3V0aW9uL2Zsb3ctc3RvcmUudHMiLCAiLi4vc3JjL2V4ZWN1dGlvbi9mbG93LXR5cGVzLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWwogICAgIi8qKlxuICogUmFscGggTG9vcCBSdW5uZXIgLSBCYXNoLWxvb3Agc3R5bGUgaXRlcmF0aW9uIHdpdGggZnJlc2ggY29udGV4dCBwZXIgY3ljbGVcbiAqXG4gKiBJbXBsZW1lbnRzIHRoZSBvcmlnaW5hbCBSYWxwaCBXaWdndW0gdmlzaW9uOlxuICogLSBGcmVzaCBPcGVuQ29kZSBzZXNzaW9uIHBlciBpdGVyYXRpb24gKG5vIHRyYW5zY3JpcHQgY2Fycnktb3ZlcilcbiAqIC0gRmlsZSBJL08gYXMgc3RhdGUgKC5haS1lbmcvcnVucy88cnVuSWQ+Ly5mbG93KVxuICogLSBEZXRlcm1pbmlzdGljIHJlLWFuY2hvcmluZyBmcm9tIGRpc2sgc3RhdGUgZWFjaCBjeWNsZVxuICogLSBNdWx0aS1waGFzZSB3b3JrZmxvdyAocmVzZWFyY2gg4oaSIHNwZWNpZnkg4oaSIHBsYW4g4oaSIHdvcmsg4oaSIHJldmlldylcbiAqIC0gUXVhbGl0eSBnYXRlcyB0aGF0IGJsb2NrIHVudGlsIHBhc3NlZFxuICovXG5cbmltcG9ydCB7IGV4ZWNTeW5jIH0gZnJvbSBcIm5vZGU6Y2hpbGRfcHJvY2Vzc1wiO1xuaW1wb3J0IHsgY3JlYXRlSGFzaCB9IGZyb20gXCJub2RlOmNyeXB0b1wiO1xuaW1wb3J0IHsgcmVhZEZpbGUsIHJlYWRkaXIgfSBmcm9tIFwibm9kZTpmcy9wcm9taXNlc1wiO1xuaW1wb3J0IHsgam9pbiwgcGFyc2UgfSBmcm9tIFwibm9kZTpwYXRoXCI7XG5pbXBvcnQgeyBPcGVuQ29kZUNsaWVudCwgdHlwZSBTZXNzaW9uIH0gZnJvbSBcIi4uL2JhY2tlbmRzL29wZW5jb2RlL2NsaWVudFwiO1xuaW1wb3J0IHR5cGUgeyBSYWxwaEZsYWdzIH0gZnJvbSBcIi4uL2NsaS9mbGFnc1wiO1xuaW1wb3J0IHsgVUkgfSBmcm9tIFwiLi4vY2xpL3VpXCI7XG5pbXBvcnQgdHlwZSB7IEFpRW5nQ29uZmlnLCBHYXRlQ29tbWFuZENvbmZpZyB9IGZyb20gXCIuLi9jb25maWcvc2NoZW1hXCI7XG5pbXBvcnQgeyBQcm9tcHRPcHRpbWl6ZXIgfSBmcm9tIFwiLi4vcHJvbXB0LW9wdGltaXphdGlvbi9vcHRpbWl6ZXJcIjtcbmltcG9ydCB0eXBlIHsgRGlzY29yZFdlYmhvb2tDbGllbnQgfSBmcm9tIFwiLi4vdXRpbC9kaXNjb3JkLXdlYmhvb2tcIjtcbmltcG9ydCB7IGNyZWF0ZURpc2NvcmRXZWJob29rRnJvbUVudiB9IGZyb20gXCIuLi91dGlsL2Rpc2NvcmQtd2ViaG9va1wiO1xuaW1wb3J0IHsgTG9nIH0gZnJvbSBcIi4uL3V0aWwvbG9nXCI7XG5pbXBvcnQgeyBGbG93U3RvcmUsIHR5cGUgRmxvd1N0b3JlT3B0aW9ucyB9IGZyb20gXCIuL2Zsb3ctc3RvcmVcIjtcbmltcG9ydCB0eXBlIHtcbiAgICBDeWNsZVN0YXRlLFxuICAgIEdhdGVSZXN1bHQsXG4gICAgTG9vcENvbmZpZyxcbiAgICBUb29sSW52b2NhdGlvbixcbn0gZnJvbSBcIi4vZmxvdy10eXBlc1wiO1xuaW1wb3J0IHtcbiAgICBGTE9XX1NDSEVNQV9WRVJTSU9OLFxuICAgIFBoYXNlLFxuICAgIFJ1blN0YXR1cyxcbiAgICBTdG9wUmVhc29uLFxufSBmcm9tIFwiLi9mbG93LXR5cGVzXCI7XG5cbmNvbnN0IGxvZyA9IExvZy5jcmVhdGUoeyBzZXJ2aWNlOiBcInJhbHBoLWxvb3BcIiB9KTtcblxuLyoqIERlZmF1bHQgcXVhbGl0eSBnYXRlcyAqL1xuY29uc3QgREVGQVVMVF9HQVRFUyA9IFtcInRlc3RcIiwgXCJsaW50XCIsIFwiYWNjZXB0YW5jZVwiXTtcblxuLyoqIERlZmF1bHQgbWF4IGN5Y2xlcyAqL1xuY29uc3QgREVGQVVMVF9NQVhfQ1lDTEVTID0gNTA7XG5cbi8qKiBEZWZhdWx0IHN0dWNrIHRocmVzaG9sZCAqL1xuY29uc3QgREVGQVVMVF9TVFVDS19USFJFU0hPTEQgPSA1O1xuXG4vKiogRGVmYXVsdCBjaGVja3BvaW50IGZyZXF1ZW5jeSAqL1xuY29uc3QgREVGQVVMVF9DSEVDS1BPSU5UX0ZSRVFVRU5DWSA9IDE7XG5cbi8qKiBEZWZhdWx0IGN5Y2xlIHJldHJpZXMgKi9cbmNvbnN0IERFRkFVTFRfQ1lDTEVfUkVUUklFUyA9IDI7XG5cbi8qKiBTZWNyZXRzIHBhdHRlcm5zIHRvIHJlZGFjdCBpbiBkZWJ1ZyBvdXRwdXQgKi9cbmNvbnN0IFNFQ1JFVF9QQVRURVJOUyA9IFtcbiAgICAvYXBpW18tXT9rZXkvaSxcbiAgICAvdG9rZW4vaSxcbiAgICAvc2VjcmV0L2ksXG4gICAgL3Bhc3N3b3JkL2ksXG4gICAgL2NyZWRlbnRpYWwvaSxcbiAgICAvd2ViaG9vay9pLFxuICAgIC9hdXRoL2ksXG4gICAgL2JlYXJlci9pLFxuICAgIC9wcml2YXRlW18tXT9rZXkvaSxcbl07XG5cbi8qKlxuICogUmVkYWN0IHNlY3JldHMgZnJvbSBhIHN0cmluZ1xuICovXG5mdW5jdGlvbiByZWRhY3RTZWNyZXRzKHRleHQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICBsZXQgcmVzdWx0ID0gdGV4dDtcbiAgICBmb3IgKGNvbnN0IHBhdHRlcm4gb2YgU0VDUkVUX1BBVFRFUk5TKSB7XG4gICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKFxuICAgICAgICAgICAgbmV3IFJlZ0V4cChcbiAgICAgICAgICAgICAgICBgJHtwYXR0ZXJuLnNvdXJjZX1bXCInXT9cXFxccypbOj1dXFxcXHMqW1wiJ10/KFteXCInXCIsXFxcXHNdKylgLFxuICAgICAgICAgICAgICAgIFwiZ2lcIixcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBgJHtwYXR0ZXJuLnNvdXJjZX09XCJbUkVEQUNURURdXCJgLFxuICAgICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIFRydW5jYXRlIGxvbmcgb3V0cHV0IGZvciBsb2dnaW5nXG4gKi9cbmZ1bmN0aW9uIHRydW5jYXRlT3V0cHV0KHRleHQ6IHN0cmluZywgbWF4TGVuZ3RoID0gMTAwMCk6IHN0cmluZyB7XG4gICAgaWYgKHRleHQubGVuZ3RoIDw9IG1heExlbmd0aCkgcmV0dXJuIHRleHQ7XG4gICAgcmV0dXJuIGAke3RleHQuc3Vic3RyaW5nKDAsIG1heExlbmd0aCl9XFxuLi4uIFt0cnVuY2F0ZWQgJHt0ZXh0Lmxlbmd0aCAtIG1heExlbmd0aH0gY2hhcnNdYDtcbn1cblxuLyoqXG4gKiBSYWxwaCBMb29wIFJ1bm5lciAtIG9yY2hlc3RyYXRlcyBpdGVyYXRpb24gbG9vcHMgd2l0aCBmcmVzaCBzZXNzaW9uc1xuICovXG5leHBvcnQgY2xhc3MgUmFscGhMb29wUnVubmVyIHtcbiAgICBwcml2YXRlIGNvbmZpZzogTG9vcENvbmZpZztcbiAgICBwcml2YXRlIGZsb3dTdG9yZTogRmxvd1N0b3JlO1xuICAgIHByaXZhdGUgZmxhZ3M6IFJhbHBoRmxhZ3M7XG4gICAgcHJpdmF0ZSBiYXNlQ29uZmlnOiBBaUVuZ0NvbmZpZztcbiAgICBwcml2YXRlIG9wdGltaXplcjogUHJvbXB0T3B0aW1pemVyO1xuICAgIHByaXZhdGUgZGlzY29yZFdlYmhvb2s6IERpc2NvcmRXZWJob29rQ2xpZW50IHwgbnVsbDtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBmbGFnczogUmFscGhGbGFncyxcbiAgICAgICAgYmFzZUNvbmZpZzogQWlFbmdDb25maWcsXG4gICAgICAgIG9wdGltaXplcjogUHJvbXB0T3B0aW1pemVyLFxuICAgICkge1xuICAgICAgICB0aGlzLmZsYWdzID0gZmxhZ3M7XG4gICAgICAgIHRoaXMuYmFzZUNvbmZpZyA9IGJhc2VDb25maWc7XG4gICAgICAgIHRoaXMub3B0aW1pemVyID0gb3B0aW1pemVyO1xuXG4gICAgICAgIC8vIEJ1aWxkIGxvb3AgY29uZmlnIGZyb20gZmxhZ3NcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLmJ1aWxkTG9vcENvbmZpZygpO1xuICAgICAgICBjb25zdCBmbG93U3RvcmVPcHRpb25zOiBGbG93U3RvcmVPcHRpb25zID0ge1xuICAgICAgICAgICAgZmxvd0RpcjogdGhpcy5jb25maWcuZmxvd0RpcixcbiAgICAgICAgICAgIHJ1bklkOiB0aGlzLmNvbmZpZy5ydW5JZCxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5mbG93U3RvcmUgPSBuZXcgRmxvd1N0b3JlKGZsb3dTdG9yZU9wdGlvbnMpO1xuXG4gICAgICAgIC8vIEluaXRpYWxpemUgRGlzY29yZCB3ZWJob29rIGZyb20gZW52aXJvbm1lbnRcbiAgICAgICAgdGhpcy5kaXNjb3JkV2ViaG9vayA9IGNyZWF0ZURpc2NvcmRXZWJob29rRnJvbUVudigpO1xuICAgIH1cblxuICAgIC8qKiBCdWlsZCBsb29wIGNvbmZpZyBmcm9tIGZsYWdzICovXG4gICAgcHJpdmF0ZSBidWlsZExvb3BDb25maWcoKTogTG9vcENvbmZpZyB7XG4gICAgICAgIC8vIERldGVybWluZSBjb21wbGV0aW9uIHByb21pc2UgYmFzZWQgb24gbW9kZVxuICAgICAgICBsZXQgY29tcGxldGlvblByb21pc2UgPSB0aGlzLmZsYWdzLmNvbXBsZXRpb25Qcm9taXNlID8/IFwiXCI7XG5cbiAgICAgICAgaWYgKHRoaXMuZmxhZ3Muc2hpcCkge1xuICAgICAgICAgICAgLy8gU2hpcCBtb2RlOiBhdXRvLWV4aXQgd2hlbiBhZ2VudCBvdXRwdXRzIFNISVBcbiAgICAgICAgICAgIGNvbXBsZXRpb25Qcm9taXNlID0gXCI8cHJvbWlzZT5TSElQPC9wcm9taXNlPlwiO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZmxhZ3MuZHJhZnQpIHtcbiAgICAgICAgICAgIC8vIERyYWZ0IG1vZGU6IHJ1biBmb3IgbWF4LWN5Y2xlcywgc3RvcCBmb3IgcmV2aWV3IChubyBhdXRvLWV4aXQpXG4gICAgICAgICAgICBjb21wbGV0aW9uUHJvbWlzZSA9IFwiXCI7XG4gICAgICAgIH0gZWxzZSBpZiAoIWNvbXBsZXRpb25Qcm9taXNlKSB7XG4gICAgICAgICAgICAvLyBObyBmbGFnIHNwZWNpZmllZCBhbmQgbm8gY29tcGxldGlvbiBwcm9taXNlOiBkZWZhdWx0IHRvIGRyYWZ0IG1vZGVcbiAgICAgICAgICAgIGNvbXBsZXRpb25Qcm9taXNlID0gXCJcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEdlbmVyYXRlIHJ1biBJRCBpZiBub3QgcmVzdW1pbmdcbiAgICAgICAgbGV0IHJ1bklkID0gdGhpcy5mbGFncy5ydW5JZDtcbiAgICAgICAgaWYgKCFydW5JZCkge1xuICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIGV4aXN0aW5nIGZsb3cgc3RhdGVcbiAgICAgICAgICAgIGNvbnN0IGRlZmF1bHRSdW5JZCA9IHRoaXMuZ2VuZXJhdGVSdW5JZCgpO1xuICAgICAgICAgICAgY29uc3QgZGVmYXVsdEZsb3dEaXIgPSB0aGlzLmdldERlZmF1bHRGbG93RGlyKGRlZmF1bHRSdW5JZCk7XG4gICAgICAgICAgICBjb25zdCBjaGVja1N0b3JlID0gbmV3IEZsb3dTdG9yZSh7XG4gICAgICAgICAgICAgICAgZmxvd0RpcjogdGhpcy5mbGFncy53b3JraW5nRGlyXG4gICAgICAgICAgICAgICAgICAgID8gam9pbih0aGlzLmZsYWdzLndvcmtpbmdEaXIsIFwiLmFpLWVuZ1wiKVxuICAgICAgICAgICAgICAgICAgICA6IFwiLmFpLWVuZ1wiLFxuICAgICAgICAgICAgICAgIHJ1bklkOiBkZWZhdWx0UnVuSWQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJ1bklkID0gZGVmYXVsdFJ1bklkO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJ1bklkLFxuICAgICAgICAgICAgcHJvbXB0OiB0aGlzLmZsYWdzLndvcmtmbG93ID8/IFwiXCIsXG4gICAgICAgICAgICBjb21wbGV0aW9uUHJvbWlzZSxcbiAgICAgICAgICAgIG1heEN5Y2xlczogdGhpcy5mbGFncy5tYXhDeWNsZXMgPz8gREVGQVVMVF9NQVhfQ1lDTEVTLFxuICAgICAgICAgICAgc3R1Y2tUaHJlc2hvbGQ6XG4gICAgICAgICAgICAgICAgdGhpcy5mbGFncy5zdHVja1RocmVzaG9sZCA/PyBERUZBVUxUX1NUVUNLX1RIUkVTSE9MRCxcbiAgICAgICAgICAgIGdhdGVzOiB0aGlzLmZsYWdzLmdhdGVzID8/IERFRkFVTFRfR0FURVMsXG4gICAgICAgICAgICBjaGVja3BvaW50RnJlcXVlbmN5OlxuICAgICAgICAgICAgICAgIHRoaXMuZmxhZ3MuY2hlY2twb2ludEZyZXF1ZW5jeSA/PyBERUZBVUxUX0NIRUNLUE9JTlRfRlJFUVVFTkNZLFxuICAgICAgICAgICAgZmxvd0RpcjogdGhpcy5nZXREZWZhdWx0Rmxvd0RpcihydW5JZCksXG4gICAgICAgICAgICBkcnlSdW46IHRoaXMuZmxhZ3MuZHJ5UnVuID8/IGZhbHNlLFxuICAgICAgICAgICAgY3ljbGVSZXRyaWVzOlxuICAgICAgICAgICAgICAgIHRoaXMuYmFzZUNvbmZpZy5sb29wPy5jeWNsZVJldHJpZXMgPz8gREVGQVVMVF9DWUNMRV9SRVRSSUVTLFxuICAgICAgICAgICAgZGVidWdXb3JrOlxuICAgICAgICAgICAgICAgIHRoaXMuZmxhZ3MuZGVidWdXb3JrID8/IHRoaXMuYmFzZUNvbmZpZy5kZWJ1Zz8ud29yayA/PyBmYWxzZSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKiogR2V0IGRlZmF1bHQgZmxvdyBkaXJlY3RvcnkgcGF0aCAqL1xuICAgIHByaXZhdGUgZ2V0RGVmYXVsdEZsb3dEaXIocnVuSWQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IGFydGlmYWN0c0RpciA9IHRoaXMuYmFzZUNvbmZpZy5ydW5uZXIuYXJ0aWZhY3RzRGlyO1xuICAgICAgICBpZiAodGhpcy5mbGFncy53b3JraW5nRGlyKSB7XG4gICAgICAgICAgICByZXR1cm4gam9pbih0aGlzLmZsYWdzLndvcmtpbmdEaXIsIGFydGlmYWN0c0Rpcik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGpvaW4ocHJvY2Vzcy5jd2QoKSwgYXJ0aWZhY3RzRGlyKTtcbiAgICB9XG5cbiAgICAvKiogR2VuZXJhdGUgYSB1bmlxdWUgcnVuIElEICovXG4gICAgcHJpdmF0ZSBnZW5lcmF0ZVJ1bklkKCk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IHRpbWVzdGFtcCA9IERhdGUubm93KCkudG9TdHJpbmcoMzYpO1xuICAgICAgICBjb25zdCByYW5kb20gPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoMiwgOCk7XG4gICAgICAgIHJldHVybiBgcnVuLSR7dGltZXN0YW1wfS0ke3JhbmRvbX1gO1xuICAgIH1cblxuICAgIC8qKiBHZW5lcmF0ZSBhIGhhc2ggb2Ygb3V0cHV0IGZvciBzdHVjayBkZXRlY3Rpb24gKi9cbiAgICBwcml2YXRlIGhhc2hPdXRwdXQob3V0cHV0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gY3JlYXRlSGFzaChcInNoYTI1NlwiKVxuICAgICAgICAgICAgLnVwZGF0ZShvdXRwdXQpXG4gICAgICAgICAgICAuZGlnZXN0KFwiaGV4XCIpXG4gICAgICAgICAgICAuc3Vic3RyaW5nKDAsIDE2KTtcbiAgICB9XG5cbiAgICAvKiogUnVuIHRoZSBsb29wICovXG4gICAgYXN5bmMgcnVuKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBVSS5oZWFkZXIoXCJSYWxwaCBMb29wIFJ1bm5lclwiKTtcblxuICAgICAgICAvLyBDaGVjayBmb3IgcmVzdW1lXG4gICAgICAgIGlmICh0aGlzLmZsYWdzLnJlc3VtZSkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5yZXN1bWUoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFN0YXJ0IGZyZXNoIHJ1blxuICAgICAgICBhd2FpdCB0aGlzLnN0YXJ0RnJlc2goKTtcbiAgICB9XG5cbiAgICAvKiogU3RhcnQgYSBmcmVzaCBydW4gKi9cbiAgICBwcml2YXRlIGFzeW5jIHN0YXJ0RnJlc2goKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGxvZy5pbmZvKFwiU3RhcnRpbmcgZnJlc2ggUmFscGggbG9vcFwiLCB7XG4gICAgICAgICAgICBydW5JZDogdGhpcy5jb25maWcucnVuSWQsXG4gICAgICAgICAgICBwcm9tcHQ6IHRoaXMuY29uZmlnLnByb21wdC5zdWJzdHJpbmcoMCwgMTAwKSxcbiAgICAgICAgICAgIGNvbXBsZXRpb25Qcm9taXNlOiB0aGlzLmNvbmZpZy5jb21wbGV0aW9uUHJvbWlzZSxcbiAgICAgICAgICAgIG1heEN5Y2xlczogdGhpcy5jb25maWcubWF4Q3ljbGVzLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBJbml0aWFsaXplIGZsb3cgc3RvcmVcbiAgICAgICAgdGhpcy5mbG93U3RvcmUuaW5pdGlhbGl6ZSgpO1xuXG4gICAgICAgIC8vIENyZWF0ZSBpbml0aWFsIHN0YXRlXG4gICAgICAgIGNvbnN0IGluaXRpYWxTdGF0ZSA9IHRoaXMuZmxvd1N0b3JlLmNyZWF0ZUluaXRpYWxTdGF0ZSh7XG4gICAgICAgICAgICBwcm9tcHQ6IHRoaXMuY29uZmlnLnByb21wdCxcbiAgICAgICAgICAgIGNvbXBsZXRpb25Qcm9taXNlOiB0aGlzLmNvbmZpZy5jb21wbGV0aW9uUHJvbWlzZSxcbiAgICAgICAgICAgIG1heEN5Y2xlczogdGhpcy5jb25maWcubWF4Q3ljbGVzLFxuICAgICAgICAgICAgc3R1Y2tUaHJlc2hvbGQ6IHRoaXMuY29uZmlnLnN0dWNrVGhyZXNob2xkLFxuICAgICAgICAgICAgZ2F0ZXM6IHRoaXMuY29uZmlnLmdhdGVzLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBVcGRhdGUgc3RhdHVzIHRvIHJ1bm5pbmdcbiAgICAgICAgdGhpcy5mbG93U3RvcmUudXBkYXRlU3RhdHVzKFJ1blN0YXR1cy5SVU5OSU5HKTtcblxuICAgICAgICAvLyBSdW4gdGhlIGxvb3BcbiAgICAgICAgYXdhaXQgdGhpcy5ydW5Mb29wKCk7XG4gICAgfVxuXG4gICAgLyoqIFJlc3VtZSBmcm9tIHByZXZpb3VzIHJ1biAqL1xuICAgIHByaXZhdGUgYXN5bmMgcmVzdW1lKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBsb2cuaW5mbyhcIlJlc3VtaW5nIFJhbHBoIGxvb3BcIiwgeyBydW5JZDogdGhpcy5jb25maWcucnVuSWQgfSk7XG5cbiAgICAgICAgY29uc3Qgc3RhdGUgPSB0aGlzLmZsb3dTdG9yZS5sb2FkKCk7XG4gICAgICAgIGlmICghc3RhdGUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICBgTm8gZmxvdyBzdGF0ZSBmb3VuZCBmb3IgcnVuIElEOiAke3RoaXMuY29uZmlnLnJ1bklkfS4gQ2Fubm90IHJlc3VtZS5gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzdGF0ZS5zdGF0dXMgPT09IFJ1blN0YXR1cy5DT01QTEVURUQpIHtcbiAgICAgICAgICAgIFVJLndhcm4oXCJUaGlzIHJ1biBoYXMgYWxyZWFkeSBjb21wbGV0ZWQuXCIpO1xuICAgICAgICAgICAgVUkuaW5mbyhgU3RvcCByZWFzb246ICR7c3RhdGUuc3RvcFJlYXNvbn1gKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzdGF0ZS5zdGF0dXMgPT09IFJ1blN0YXR1cy5GQUlMRUQpIHtcbiAgICAgICAgICAgIFVJLndhcm4oXCJUaGlzIHJ1biBwcmV2aW91c2x5IGZhaWxlZC5cIik7XG4gICAgICAgICAgICBVSS5pbmZvKGBFcnJvcjogJHtzdGF0ZS5lcnJvcn1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlc3VtZSB0aGUgbG9vcFxuICAgICAgICBhd2FpdCB0aGlzLnJ1bkxvb3AoKTtcbiAgICB9XG5cbiAgICAvKiogTWFpbiBsb29wIGV4ZWN1dGlvbiAqL1xuICAgIHByaXZhdGUgYXN5bmMgcnVuTG9vcCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgY29uc3Qgc3RhdGUgPSB0aGlzLmZsb3dTdG9yZS5sb2FkKCk7XG4gICAgICAgIGlmICghc3RhdGUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIGZsb3cgc3RhdGUgZm91bmRcIik7XG4gICAgICAgIH1cblxuICAgICAgICBVSS5pbmZvKGBSdW4gSUQ6ICR7dGhpcy5jb25maWcucnVuSWR9YCk7XG4gICAgICAgIFVJLmluZm8oYEZsb3cgZGlyZWN0b3J5OiAke3RoaXMuZmxvd1N0b3JlLmJhc2VQYXRofWApO1xuICAgICAgICBVSS5pbmZvKFxuICAgICAgICAgICAgYENvbXBsZXRpb24gcHJvbWlzZTogJHt0aGlzLmNvbmZpZy5jb21wbGV0aW9uUHJvbWlzZSB8fCBcIihub25lKVwifWAsXG4gICAgICAgICk7XG4gICAgICAgIFVJLmluZm8oYE1heCBjeWNsZXM6ICR7dGhpcy5jb25maWcubWF4Q3ljbGVzfWApO1xuICAgICAgICBVSS5pbmZvKGBDeWNsZSByZXRyaWVzOiAke3RoaXMuY29uZmlnLmN5Y2xlUmV0cmllc31gKTtcbiAgICAgICAgVUkuaW5mbyhgU3R1Y2sgdGhyZXNob2xkOiAke3RoaXMuY29uZmlnLnN0dWNrVGhyZXNob2xkfWApO1xuICAgICAgICBVSS5pbmZvKFxuICAgICAgICAgICAgYERlYnVnIHdvcms6ICR7dGhpcy5jb25maWcuZGVidWdXb3JrID8gXCJlbmFibGVkXCIgOiBcImRpc2FibGVkXCJ9YCxcbiAgICAgICAgKTtcbiAgICAgICAgVUkucHJpbnRsbigpO1xuXG4gICAgICAgIC8vIENoZWNrIGlmIHdlIHNob3VsZCBza2lwIG9wdGltaXphdGlvbiAoYWxyZWFkeSBkb25lIG9uIGluaXRpYWwgaW5nZXN0KVxuICAgICAgICAvLyBGb3IgbG9vcCBtb2RlLCB3ZSBza2lwIHJlLW9wdGltaXphdGlvbiBlYWNoIGN5Y2xlXG5cbiAgICAgICAgLy8gUnVuIGN5Y2xlc1xuICAgICAgICBmb3IgKFxuICAgICAgICAgICAgbGV0IGN5Y2xlTnVtYmVyID0gc3RhdGUuY3VycmVudEN5Y2xlICsgMTtcbiAgICAgICAgICAgIGN5Y2xlTnVtYmVyIDw9IHRoaXMuY29uZmlnLm1heEN5Y2xlcztcbiAgICAgICAgICAgIGN5Y2xlTnVtYmVyKytcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBVSS5oZWFkZXIoYEN5Y2xlICR7Y3ljbGVOdW1iZXJ9LyR7dGhpcy5jb25maWcubWF4Q3ljbGVzfWApO1xuXG4gICAgICAgICAgICAvLyBOb3RpZnkgRGlzY29yZDogY3ljbGUgc3RhcnRlZFxuICAgICAgICAgICAgY29uc3QgcnVuU3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgIHRoaXMuZGlzY29yZFdlYmhvb2s/Lm5vdGlmeUN5Y2xlU3RhcnQoXG4gICAgICAgICAgICAgICAgY3ljbGVOdW1iZXIsXG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcubWF4Q3ljbGVzLFxuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLnByb21wdCxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIC8vIEV4ZWN1dGUgY3ljbGUgd2l0aCByZXRyeSBsb2dpY1xuICAgICAgICAgICAgbGV0IGF0dGVtcHQgPSAwO1xuICAgICAgICAgICAgbGV0IHJlc3VsdDoge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGJvb2xlYW47XG4gICAgICAgICAgICAgICAgY3ljbGVTdGF0ZTogQ3ljbGVTdGF0ZTtcbiAgICAgICAgICAgICAgICBzdW1tYXJ5OiBzdHJpbmc7XG4gICAgICAgICAgICAgICAgc3RvcFJlYXNvbj86IFN0b3BSZWFzb247XG4gICAgICAgICAgICB9IHwgbnVsbCA9IG51bGw7XG4gICAgICAgICAgICBsZXQgbGFzdEVycm9yOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcblxuICAgICAgICAgICAgd2hpbGUgKGF0dGVtcHQgPD0gdGhpcy5jb25maWcuY3ljbGVSZXRyaWVzKSB7XG4gICAgICAgICAgICAgICAgYXR0ZW1wdCsrO1xuICAgICAgICAgICAgICAgIGNvbnN0IGlzUmV0cnkgPSBhdHRlbXB0ID4gMTtcblxuICAgICAgICAgICAgICAgIGlmIChpc1JldHJ5KSB7XG4gICAgICAgICAgICAgICAgICAgIFVJLmluZm8oXG4gICAgICAgICAgICAgICAgICAgICAgICBgUmV0cnkgYXR0ZW1wdCAke2F0dGVtcHR9LyR7dGhpcy5jb25maWcuY3ljbGVSZXRyaWVzICsgMX1gLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICBsb2cuaW5mbyhcIlJldHJ5aW5nIGN5Y2xlXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN5Y2xlTnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXR0ZW1wdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RFcnJvcixcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGZyZXNoIE9wZW5Db2RlIHNlc3Npb24gZm9yIHRoaXMgY3ljbGVcbiAgICAgICAgICAgICAgICBjb25zdCBjbGllbnQgPSBhd2FpdCBPcGVuQ29kZUNsaWVudC5jcmVhdGUoe1xuICAgICAgICAgICAgICAgICAgICBzZXJ2ZXJTdGFydHVwVGltZW91dDogMTAwMDAsXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAvLyBSZS1hbmNob3IgY29udGV4dCBmcm9tIGRpc2sgKHdpdGggcmV0cnkgZmFpbHVyZSBpbmplY3RlZCBpZiB0aGlzIGlzIGEgcmV0cnkpXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRleHQgPSBhd2FpdCB0aGlzLmJ1aWxkUmVBbmNob3JlZENvbnRleHQoXG4gICAgICAgICAgICAgICAgICAgICAgICBjeWNsZU51bWJlcixcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzUmV0cnkgPyAobGFzdEVycm9yID8/IHVuZGVmaW5lZCkgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gRXhlY3V0ZSB0aGUgY3ljbGUgd2l0aCBmcmVzaCBzZXNzaW9uXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IGF3YWl0IHRoaXMuZXhlY3V0ZUN5Y2xlKFxuICAgICAgICAgICAgICAgICAgICAgICAgY3ljbGVOdW1iZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGllbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0LFxuICAgICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFJlY29yZCB0aGUgY3ljbGVcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZsb3dTdG9yZS5yZWNvcmRTdWNjZXNzZnVsQ3ljbGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LmN5Y2xlU3RhdGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnN1bW1hcnksXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBOb3RpZnkgRGlzY29yZDogY3ljbGUgY29tcGxldGVkXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkdXJhdGlvbk1zID0gRGF0ZS5ub3coKSAtIHJ1blN0YXJ0VGltZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGlzY29yZFdlYmhvb2s/Lm5vdGlmeUN5Y2xlQ29tcGxldGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3ljbGVOdW1iZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mbG93U3RvcmUubG9hZCgpPy5jb21wbGV0ZWRDeWNsZXMgPz9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3ljbGVOdW1iZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnN1bW1hcnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZHVyYXRpb25NcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZsb3dTdG9yZS5yZWNvcmRGYWlsZWRDeWNsZShyZXN1bHQuY3ljbGVTdGF0ZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5vdGlmeSBEaXNjb3JkOiBjeWNsZSBmYWlsZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGlzY29yZFdlYmhvb2s/Lm5vdGlmeUVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN5Y2xlTnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5jeWNsZVN0YXRlLnBoYXNlc1tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQuY3ljbGVTdGF0ZS5waGFzZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkucG9wKCkgYXMga2V5b2YgdHlwZW9mIHJlc3VsdC5jeWNsZVN0YXRlLnBoYXNlc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0/LnBoYXNlID8/IFwidW5rbm93blwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5jeWNsZVN0YXRlLmVycm9yID8/IFwiVW5rbm93biBlcnJvclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIEJyZWFrIHJldHJ5IGxvb3Agb24gc3VjY2VzcyBvciBub24tcmV0cnlhYmxlIGZhaWx1cmVcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIERldGVybWluZSBpZiB3ZSBzaG91bGQgcmV0cnkgdGhpcyBmYWlsdXJlXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNob3VsZFJldHJ5ID0gdGhpcy5zaG91bGRSZXRyeUZhaWx1cmUocmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFzaG91bGRSZXRyeSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBsYXN0RXJyb3IgPSByZXN1bHQuc3VtbWFyeTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1zZyA9XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RFcnJvciA9IGVycm9yTXNnO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIHdlIHNob3VsZCByZXRyeSB0aGlzIGVycm9yXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNob3VsZFJldHJ5ID0gdGhpcy5zaG91bGRSZXRyeU9uRXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2hvdWxkUmV0cnkgJiYgYXR0ZW1wdCA8PSB0aGlzLmNvbmZpZy5jeWNsZVJldHJpZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZy53YXJuKFwiQ3ljbGUgZXJyb3IsIHdpbGwgcmV0cnlcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN5Y2xlTnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF0dGVtcHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yTXNnLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBOb24tcmV0cnlhYmxlIG9yIG1heCByZXRyaWVzIGV4Y2VlZGVkXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIENsZWFuIHVwIHRoZSBzZXNzaW9uIGZvciB0aGlzIGN5Y2xlXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGNsaWVudC5jbGVhbnVwKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBJZiByZXN1bHQgaXMgbnVsbCBhZnRlciBhbGwgcmV0cmllcywgd2UgaGFkIGEgY2F0YXN0cm9waGljIGZhaWx1cmVcbiAgICAgICAgICAgIGlmICghcmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kaXNjb3JkV2ViaG9vaz8ubm90aWZ5U3R1Y2tPckFib3J0ZWQoXG4gICAgICAgICAgICAgICAgICAgIGN5Y2xlTnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICBcIkZBSUxFRF9BTExfUkVUUklFU1wiLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5oYW5kbGVTdG9wKFxuICAgICAgICAgICAgICAgICAgICBTdG9wUmVhc29uLkVSUk9SLFxuICAgICAgICAgICAgICAgICAgICBgQ3ljbGUgJHtjeWNsZU51bWJlcn0gZmFpbGVkIGFmdGVyICR7dGhpcy5jb25maWcuY3ljbGVSZXRyaWVzICsgMX0gYXR0ZW1wdHM6ICR7bGFzdEVycm9yID8/IFwidW5rbm93biBlcnJvclwifWAsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIENoZWNrIHN0b3AgY29uZGl0aW9uc1xuICAgICAgICAgICAgaWYgKHJlc3VsdC5zdG9wUmVhc29uKSB7XG4gICAgICAgICAgICAgICAgLy8gTm90aWZ5IERpc2NvcmQ6IHJ1biBzdG9wcGVkXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5oYW5kbGVTdG9wKHJlc3VsdC5zdG9wUmVhc29uLCByZXN1bHQuc3VtbWFyeSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDaGVjayBpZiBzdHVja1xuICAgICAgICAgICAgY29uc3QgY3VycmVudFN0YXRlID0gdGhpcy5mbG93U3RvcmUubG9hZCgpO1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIGN1cnJlbnRTdGF0ZSAmJlxuICAgICAgICAgICAgICAgIGN1cnJlbnRTdGF0ZS5zdHVja0NvdW50ID49IHRoaXMuY29uZmlnLnN0dWNrVGhyZXNob2xkXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAvLyBOb3RpZnkgRGlzY29yZDogc3R1Y2tcbiAgICAgICAgICAgICAgICB0aGlzLmRpc2NvcmRXZWJob29rPy5ub3RpZnlTdHVja09yQWJvcnRlZChjeWNsZU51bWJlciwgXCJTVFVDS1wiKTtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmhhbmRsZVN0b3AoXG4gICAgICAgICAgICAgICAgICAgIFN0b3BSZWFzb24uU1RVQ0ssXG4gICAgICAgICAgICAgICAgICAgIGBObyBwcm9ncmVzcyBmb3IgJHt0aGlzLmNvbmZpZy5zdHVja1RocmVzaG9sZH0gY29uc2VjdXRpdmUgY3ljbGVzYCxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gU2F2ZSBjaGVja3BvaW50IGlmIG5lZWRlZFxuICAgICAgICAgICAgaWYgKGN5Y2xlTnVtYmVyICUgdGhpcy5jb25maWcuY2hlY2twb2ludEZyZXF1ZW5jeSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZmxvd1N0b3JlLnNhdmVDaGVja3BvaW50KFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmZsb3dTdG9yZS5sb2FkKCkhLFxuICAgICAgICAgICAgICAgICAgICByZXN1bHQuY3ljbGVTdGF0ZS5waGFzZXMsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgVUkucHJpbnRsbigpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTWF4IGN5Y2xlcyByZWFjaGVkIC0gbm90aWZ5IERpc2NvcmRcbiAgICAgICAgdGhpcy5kaXNjb3JkV2ViaG9vaz8ubm90aWZ5UnVuQ29tcGxldGUoXG4gICAgICAgICAgICBzdGF0ZS5jb21wbGV0ZWRDeWNsZXMsXG4gICAgICAgICAgICBEYXRlLm5vdygpIC0gbmV3IERhdGUoc3RhdGUuY3JlYXRlZEF0KS5nZXRUaW1lKCksXG4gICAgICAgICAgICBgQ29tcGxldGVkICR7c3RhdGUuY29tcGxldGVkQ3ljbGVzfSBjeWNsZXMgKG1heCAke3RoaXMuY29uZmlnLm1heEN5Y2xlc30pYCxcbiAgICAgICAgKTtcbiAgICAgICAgYXdhaXQgdGhpcy5oYW5kbGVTdG9wKFN0b3BSZWFzb24uTUFYX0NZQ0xFUywgXCJNYXhpbXVtIGN5Y2xlcyByZWFjaGVkXCIpO1xuICAgIH1cblxuICAgIC8qKiBEZXRlcm1pbmUgaWYgYSBmYWlsdXJlIHNob3VsZCB0cmlnZ2VyIGEgcmV0cnkgKi9cbiAgICBwcml2YXRlIHNob3VsZFJldHJ5RmFpbHVyZShyZXN1bHQ6IHtcbiAgICAgICAgc3VjY2VzczogYm9vbGVhbjtcbiAgICAgICAgY3ljbGVTdGF0ZTogQ3ljbGVTdGF0ZTtcbiAgICAgICAgc3VtbWFyeTogc3RyaW5nO1xuICAgIH0pOiBib29sZWFuIHtcbiAgICAgICAgLy8gQ2hlY2sgZm9yIGdhdGUgZmFpbHVyZXNcbiAgICAgICAgY29uc3QgZmFpbGVkR2F0ZXMgPSByZXN1bHQuY3ljbGVTdGF0ZS5nYXRlUmVzdWx0cy5maWx0ZXIoXG4gICAgICAgICAgICAoZykgPT4gIWcucGFzc2VkLFxuICAgICAgICApO1xuICAgICAgICBpZiAoZmFpbGVkR2F0ZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDaGVjayBmb3IgZW1wdHkgd29yayByZXNwb25zZSAob3VyIGFjY2VwdGFuY2UgcnVsZSlcbiAgICAgICAgY29uc3Qgd29ya1BoYXNlID0gcmVzdWx0LmN5Y2xlU3RhdGUucGhhc2VzW1BoYXNlLldPUktdO1xuICAgICAgICBpZiAod29ya1BoYXNlICYmICF3b3JrUGhhc2UucmVzcG9uc2UudHJpbSgpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKiogRGV0ZXJtaW5lIGlmIGFuIGVycm9yIHNob3VsZCB0cmlnZ2VyIGEgcmV0cnkgKi9cbiAgICBwcml2YXRlIHNob3VsZFJldHJ5T25FcnJvcihlcnJvcjogdW5rbm93bik6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICAgICAgLy8gUmV0cnkgb24gdGltZW91dFxuICAgICAgICAgICAgaWYgKGVycm9yLm1lc3NhZ2UuaW5jbHVkZXMoXCJ0aW1lb3V0XCIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBSZXRyeSBvbiBzdHJlYW0gZXJyb3JzXG4gICAgICAgICAgICBpZiAoZXJyb3IubWVzc2FnZS5pbmNsdWRlcyhcInN0cmVhbVwiKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gUmV0cnkgb24gT3BlbkNvZGUgY29ubmVjdGlvbiBlcnJvcnNcbiAgICAgICAgICAgIGlmIChlcnJvci5tZXNzYWdlLmluY2x1ZGVzKFwiT3BlbkNvZGVcIikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqIEJ1aWxkIHJlLWFuY2hvcmVkIGNvbnRleHQgZm9yIGEgY3ljbGUgKi9cbiAgICBwcml2YXRlIGFzeW5jIGJ1aWxkUmVBbmNob3JlZENvbnRleHQoXG4gICAgICAgIGN5Y2xlTnVtYmVyOiBudW1iZXIsXG4gICAgICAgIHJldHJ5RmFpbHVyZT86IHN0cmluZyxcbiAgICApOiBQcm9taXNlPHN0cmluZz4ge1xuICAgICAgICBjb25zdCBjb250ZXh0UGFydHM6IHN0cmluZ1tdID0gW107XG5cbiAgICAgICAgLy8gQWx3YXlzIHN0YXJ0IHdpdGggdGhlIG9yaWdpbmFsIHByb21wdFxuICAgICAgICBjb250ZXh0UGFydHMucHVzaChgIyBPcmlnaW5hbCBUYXNrXFxuXFxuJHt0aGlzLmNvbmZpZy5wcm9tcHR9XFxuYCk7XG5cbiAgICAgICAgLy8gQWRkIHJldHJ5IGZhaWx1cmUgaW5mbyBpZiB0aGlzIGlzIGEgcmV0cnlcbiAgICAgICAgaWYgKHJldHJ5RmFpbHVyZSkge1xuICAgICAgICAgICAgY29udGV4dFBhcnRzLnB1c2goXG4gICAgICAgICAgICAgICAgYCMgUHJldmlvdXMgQXR0ZW1wdCBGYWlsZWRcXG5cXG5UaGUgcHJldmlvdXMgYXR0ZW1wdCBoYWQgYW4gaXNzdWU6XFxuJHtyZXRyeUZhaWx1cmV9XFxuXFxuUGxlYXNlIGFuYWx5emUgd2hhdCB3ZW50IHdyb25nIGFuZCB0cnkgYSBkaWZmZXJlbnQgYXBwcm9hY2guXFxuYCxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBZGQgcHJldmlvdXMgY3ljbGUgc3VtbWFyeSBpZiBhdmFpbGFibGVcbiAgICAgICAgY29uc3QgcHJldmlvdXNDeWNsZSA9IHRoaXMuZmxvd1N0b3JlLmdldEl0ZXJhdGlvbihjeWNsZU51bWJlciAtIDEpO1xuICAgICAgICBpZiAocHJldmlvdXNDeWNsZSkge1xuICAgICAgICAgICAgY29udGV4dFBhcnRzLnB1c2goXG4gICAgICAgICAgICAgICAgYCMgUHJldmlvdXMgQ3ljbGUgKCR7Y3ljbGVOdW1iZXIgLSAxfSkgU3VtbWFyeVxcblxcbmAsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgY29udGV4dFBhcnRzLnB1c2gocHJldmlvdXNDeWNsZS5lcnJvciA/IFwiRkFJTEVEXFxuXCIgOiBcIkNPTVBMRVRFRFxcblwiKTtcblxuICAgICAgICAgICAgaWYgKHByZXZpb3VzQ3ljbGUuZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0UGFydHMucHVzaChgRXJyb3I6ICR7cHJldmlvdXNDeWNsZS5lcnJvcn1cXG5gKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQWRkIGdhdGUgcmVzdWx0c1xuICAgICAgICAgICAgaWYgKHByZXZpb3VzQ3ljbGUuZ2F0ZVJlc3VsdHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGNvbnRleHRQYXJ0cy5wdXNoKFwiXFxuIyMgR2F0ZSBSZXN1bHRzXFxuXFxuXCIpO1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgZ2F0ZSBvZiBwcmV2aW91c0N5Y2xlLmdhdGVSZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0YXR1cyA9IGdhdGUucGFzc2VkID8gXCLinIVcIiA6IFwi4p2MXCI7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHRQYXJ0cy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICAgICAgYC0gJHtzdGF0dXN9ICR7Z2F0ZS5nYXRlfTogJHtnYXRlLm1lc3NhZ2V9XFxuYCxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEFkZCB0b29sIHVzYWdlIHN1bW1hcnkgZnJvbSBwcmV2aW91cyBjeWNsZVxuICAgICAgICAgICAgY29uc3QgYWxsVG9vbHMgPSB0aGlzLmNvbGxlY3RBbGxUb29scyhwcmV2aW91c0N5Y2xlKTtcbiAgICAgICAgICAgIGlmIChhbGxUb29scy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgY29udGV4dFBhcnRzLnB1c2goXCJcXG4jIyBUb29sIFVzYWdlIGluIFByZXZpb3VzIEN5Y2xlXFxuXFxuXCIpO1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdG9vbCBvZiBhbGxUb29scy5zbGljZSgwLCAxMCkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RhdHVzSWNvbiA9IHRvb2wuc3RhdHVzID09PSBcIm9rXCIgPyBcIuKchVwiIDogXCLinYxcIjtcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dFBhcnRzLnB1c2goXG4gICAgICAgICAgICAgICAgICAgICAgICBgJHtzdGF0dXNJY29ufSAke3Rvb2wubmFtZX06ICR7dG9vbC5zdGF0dXN9XFxuYCxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGFsbFRvb2xzLmxlbmd0aCA+IDEwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHRQYXJ0cy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICAgICAgYC4uLiBhbmQgJHthbGxUb29scy5sZW5ndGggLSAxMH0gbW9yZSB0b29sc1xcbmAsXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWRkIGxhc3QgY2hlY2twb2ludCBzdW1tYXJ5XG4gICAgICAgIGNvbnN0IHN0YXRlID0gdGhpcy5mbG93U3RvcmUubG9hZCgpO1xuICAgICAgICBpZiAoc3RhdGU/Lmxhc3RDaGVja3BvaW50KSB7XG4gICAgICAgICAgICBjb250ZXh0UGFydHMucHVzaChcbiAgICAgICAgICAgICAgICBgXFxuIyBMYXN0IENoZWNrcG9pbnRcXG5cXG5DeWNsZSAke3N0YXRlLmxhc3RDaGVja3BvaW50LmN5Y2xlTnVtYmVyfTogJHtzdGF0ZS5sYXN0Q2hlY2twb2ludC5zdW1tYXJ5fVxcbmAsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQXV0by1sb2FkIHJlbGV2YW50IHNwZWNzIGZyb20gc3BlY3MvIGRpcmVjdG9yeVxuICAgICAgICBjb25zdCBzcGVjc0NvbnRleHQgPSBhd2FpdCB0aGlzLmxvYWRSZWxldmFudFNwZWNzKCk7XG4gICAgICAgIGlmIChzcGVjc0NvbnRleHQpIHtcbiAgICAgICAgICAgIGNvbnRleHRQYXJ0cy5wdXNoKHNwZWNzQ29udGV4dCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBZGQgZ2l0IHN0YXR1cyBpZiBhdmFpbGFibGVcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGdpdFN0YXR1cyA9IGF3YWl0IHRoaXMuZ2V0R2l0U3RhdHVzKCk7XG4gICAgICAgICAgICBpZiAoZ2l0U3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgY29udGV4dFBhcnRzLnB1c2goYFxcbiMgR2l0IFN0YXR1c1xcblxcbiR7Z2l0U3RhdHVzfVxcbmApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIC8vIEdpdCBzdGF0dXMgbm90IGF2YWlsYWJsZSwgc2tpcFxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWRkIGNvbXBsZXRpb24gY3JpdGVyaWEgcmVtaW5kZXJcbiAgICAgICAgY29udGV4dFBhcnRzLnB1c2goXG4gICAgICAgICAgICBgXFxuIyBDb21wbGV0aW9uIENyaXRlcmlhXFxuXFxuTG9vcCBleGl0cyB3aGVuIHlvdSBvdXRwdXQgZXhhY3RseTogJHt0aGlzLmNvbmZpZy5jb21wbGV0aW9uUHJvbWlzZSB8fCBcIihub25lIC0gd2lsbCBydW4gYWxsIGN5Y2xlcylcIn1cXG5gLFxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiBjb250ZXh0UGFydHMuam9pbihcIlxcblwiKTtcbiAgICB9XG5cbiAgICAvKiogQ29sbGVjdCBhbGwgdG9vbCBpbnZvY2F0aW9ucyBmcm9tIGEgY3ljbGUgc3RhdGUgKi9cbiAgICBwcml2YXRlIGNvbGxlY3RBbGxUb29scyhjeWNsZTogQ3ljbGVTdGF0ZSk6IFRvb2xJbnZvY2F0aW9uW10ge1xuICAgICAgICBjb25zdCB0b29sczogVG9vbEludm9jYXRpb25bXSA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IHBoYXNlIG9mIE9iamVjdC52YWx1ZXMoY3ljbGUucGhhc2VzKSkge1xuICAgICAgICAgICAgaWYgKHBoYXNlPy50b29scykge1xuICAgICAgICAgICAgICAgIHRvb2xzLnB1c2goLi4ucGhhc2UudG9vbHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0b29scztcbiAgICB9XG5cbiAgICAvKiogTG9hZCByZWxldmFudCBzcGVjcyBmcm9tIHNwZWNzLyBkaXJlY3RvcnkgbWF0Y2hpbmcgdGhlIHByb21wdCAqL1xuICAgIHByaXZhdGUgYXN5bmMgbG9hZFJlbGV2YW50U3BlY3MoKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XG4gICAgICAgIGNvbnN0IHNwZWNzRGlyID0gam9pbihwcm9jZXNzLmN3ZCgpLCBcInNwZWNzXCIpO1xuICAgICAgICBsZXQgc3BlY3M6IHN0cmluZ1tdO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgc3BlY3MgPSBhd2FpdCByZWFkZGlyKHNwZWNzRGlyKTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAvLyBObyBzcGVjcyBkaXJlY3RvcnksIHNraXBcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcHJvbXB0TG93ZXIgPSB0aGlzLmNvbmZpZy5wcm9tcHQudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgY29uc3QgcHJvbXB0VG9rZW5zID0gbmV3IFNldChcbiAgICAgICAgICAgIHByb21wdExvd2VyLnNwbGl0KC9cXFcrLykuZmlsdGVyKCh0KSA9PiB0Lmxlbmd0aCA+IDIpLFxuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IG1hdGNoZXM6IHsgZGlyOiBzdHJpbmc7IHNjb3JlOiBudW1iZXI7IHRpdGxlPzogc3RyaW5nIH1bXSA9IFtdO1xuXG4gICAgICAgIGZvciAoY29uc3Qgc3BlY0RpciBvZiBzcGVjcykge1xuICAgICAgICAgICAgLy8gU2tpcCBzcGVjaWFsIGRpcmVjdG9yaWVzXG4gICAgICAgICAgICBpZiAoc3BlY0Rpci5zdGFydHNXaXRoKFwiLlwiKSkgY29udGludWU7XG5cbiAgICAgICAgICAgIGNvbnN0IHNwZWNQYXRoID0gam9pbihzcGVjc0Rpciwgc3BlY0RpciwgXCJzcGVjLm1kXCIpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCBzcGVjQ29udGVudCA9IGF3YWl0IHJlYWRGaWxlKHNwZWNQYXRoLCBcInV0Zi04XCIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHNwZWNDb250ZW50TG93ZXIgPSBzcGVjQ29udGVudC50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICAgICAgICAgICAgLy8gRXh0cmFjdCB0aXRsZSBmcm9tIHNwZWNcbiAgICAgICAgICAgICAgICBjb25zdCB0aXRsZU1hdGNoID0gc3BlY0NvbnRlbnQubWF0Y2goL14jICguKykkL20pO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRpdGxlID0gdGl0bGVNYXRjaD8uWzFdO1xuXG4gICAgICAgICAgICAgICAgLy8gQ2FsY3VsYXRlIHNpbXBsZSB0b2tlbiBvdmVybGFwIHNjb3JlXG4gICAgICAgICAgICAgICAgbGV0IHNjb3JlID0gMDtcbiAgICAgICAgICAgICAgICBjb25zdCBzcGVjVG9rZW5zID0gbmV3IFNldChcbiAgICAgICAgICAgICAgICAgICAgc3BlY0NvbnRlbnRMb3dlci5zcGxpdCgvXFxXKy8pLmZpbHRlcigodCkgPT4gdC5sZW5ndGggPiAyKSxcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCB0b2tlbiBvZiBwcm9tcHRUb2tlbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNwZWNUb2tlbnMuaGFzKHRva2VuKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcmUrKztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIEJvbnVzIGZvciBkaXJlY3RvcnkgbmFtZSBtYXRjaFxuICAgICAgICAgICAgICAgIGNvbnN0IGRpckxvd2VyID0gc3BlY0Rpci50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgcHJvbXB0TG93ZXIuaW5jbHVkZXMoZGlyTG93ZXIpIHx8XG4gICAgICAgICAgICAgICAgICAgIGRpckxvd2VyLmluY2x1ZGVzKFwiZmxlZXR0b29sc1wiKVxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICBzY29yZSArPSA1O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChzY29yZSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgbWF0Y2hlcy5wdXNoKHsgZGlyOiBzcGVjRGlyLCBzY29yZSwgdGl0bGUgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgICAgLy8gTm8gc3BlYy5tZCBpbiB0aGlzIGRpcmVjdG9yeSwgc2tpcFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gU29ydCBieSBzY29yZSBhbmQgdGFrZSB0b3AgMlxuICAgICAgICBtYXRjaGVzLnNvcnQoKGEsIGIpID0+IGIuc2NvcmUgLSBhLnNjb3JlKTtcbiAgICAgICAgY29uc3QgdG9wTWF0Y2hlcyA9IG1hdGNoZXMuc2xpY2UoMCwgMik7XG5cbiAgICAgICAgaWYgKHRvcE1hdGNoZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IFtcIlxcbiMgUmVsZXZhbnQgU3BlY2lmaWNhdGlvbnNcXG5cIl07XG5cbiAgICAgICAgZm9yIChjb25zdCBtYXRjaCBvZiB0b3BNYXRjaGVzKSB7XG4gICAgICAgICAgICBjb25zdCBzcGVjUGF0aCA9IGpvaW4oc3BlY3NEaXIsIG1hdGNoLmRpciwgXCJzcGVjLm1kXCIpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCBzcGVjQ29udGVudCA9IGF3YWl0IHJlYWRGaWxlKHNwZWNQYXRoLCBcInV0Zi04XCIpO1xuXG4gICAgICAgICAgICAgICAgLy8gSW5jbHVkZSBvdmVydmlldyBhbmQgYWNjZXB0YW5jZSBjcml0ZXJpYSBzZWN0aW9uc1xuICAgICAgICAgICAgICAgIGNvbnN0IG92ZXJ2aWV3TWF0Y2ggPSBzcGVjQ29udGVudC5tYXRjaChcbiAgICAgICAgICAgICAgICAgICAgL14oIyAuKz8pKD86XFxuXFxuIyMgT3ZlcnZpZXdcXG5cXG4pKFtcXHNcXFNdKj8pKD89XFxuXFxuIyMgfFxcblxcbiMjIyApL20sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBjb25zdCB1c2VyU3Rvcmllc01hdGNoID0gc3BlY0NvbnRlbnQubWF0Y2goXG4gICAgICAgICAgICAgICAgICAgIC9eKCMjIFVzZXIgU3Rvcmllc1xcblxcbikoW1xcc1xcU10qPykoPz1cXG5cXG4jIyB8XFxuXFxuIyMjICkvbSxcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goYFxcbiMjICR7bWF0Y2gudGl0bGUgfHwgbWF0Y2guZGlyfVxcbmApO1xuXG4gICAgICAgICAgICAgICAgaWYgKG92ZXJ2aWV3TWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2gob3ZlcnZpZXdNYXRjaFsyXS50cmltKCkpO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaChcIlxcblwiKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAodXNlclN0b3JpZXNNYXRjaCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBJbmNsdWRlIGZpcnN0IDMgdXNlciBzdG9yaWVzXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0b3JpZXMgPSB1c2VyU3Rvcmllc01hdGNoWzJdXG4gICAgICAgICAgICAgICAgICAgICAgICAuc3BsaXQoL1xcbiMjIyAvKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnNsaWNlKDAsIDMpO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaChcIlxcbiMjIyBLZXkgVXNlciBTdG9yaWVzXFxuXCIpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHN0b3J5IG9mIHN0b3JpZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdG9yeS50cmltKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaChgXFxuIyMjICR7c3RvcnkudHJpbSgpfVxcbmApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbG9nLmRlYnVnKFwiTG9hZGVkIHNwZWMgZm9yIGNvbnRleHRcIiwge1xuICAgICAgICAgICAgICAgICAgICBzcGVjOiBtYXRjaC5kaXIsXG4gICAgICAgICAgICAgICAgICAgIHNjb3JlOiBtYXRjaC5zY29yZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICAgIGxvZy53YXJuKFwiRmFpbGVkIHRvIHJlYWQgc3BlY1wiLCB7IHNwZWM6IG1hdGNoLmRpciB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQuam9pbihcIlxcblwiKTtcbiAgICB9XG5cbiAgICAvKiogR2V0IGdpdCBzdGF0dXMgZm9yIGNvbnRleHQgKi9cbiAgICBwcml2YXRlIGFzeW5jIGdldEdpdFN0YXR1cygpOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHsgZXhlY1N5bmMgfSA9IGF3YWl0IGltcG9ydChcIm5vZGU6Y2hpbGRfcHJvY2Vzc1wiKTtcbiAgICAgICAgICAgIGNvbnN0IGRpZmYgPSBleGVjU3luYyhcImdpdCBkaWZmIC0tc3RhdFwiLCB7XG4gICAgICAgICAgICAgICAgZW5jb2Rpbmc6IFwidXRmLThcIixcbiAgICAgICAgICAgICAgICBjd2Q6IHByb2Nlc3MuY3dkKCksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnN0IHN0YXR1cyA9IGV4ZWNTeW5jKFwiZ2l0IHN0YXR1cyAtLXNob3J0XCIsIHtcbiAgICAgICAgICAgICAgICBlbmNvZGluZzogXCJ1dGYtOFwiLFxuICAgICAgICAgICAgICAgIGN3ZDogcHJvY2Vzcy5jd2QoKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGBcXGBcXGBcXGBcXG4ke2RpZmZ9XFxuJHtzdGF0dXN9XFxuXFxgXFxgXFxgYDtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBFeGVjdXRlIGEgc2luZ2xlIGN5Y2xlIHdpdGggZnJlc2ggc2Vzc2lvbiAqL1xuICAgIHByaXZhdGUgYXN5bmMgZXhlY3V0ZUN5Y2xlKFxuICAgICAgICBjeWNsZU51bWJlcjogbnVtYmVyLFxuICAgICAgICBjbGllbnQ6IE9wZW5Db2RlQ2xpZW50LFxuICAgICAgICBjb250ZXh0OiBzdHJpbmcsXG4gICAgKTogUHJvbWlzZTx7XG4gICAgICAgIHN1Y2Nlc3M6IGJvb2xlYW47XG4gICAgICAgIGN5Y2xlU3RhdGU6IEN5Y2xlU3RhdGU7XG4gICAgICAgIHN1bW1hcnk6IHN0cmluZztcbiAgICAgICAgc3RvcFJlYXNvbj86IFN0b3BSZWFzb247XG4gICAgfT4ge1xuICAgICAgICBjb25zdCBzdGFydFRpbWUgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIGNvbnN0IGN5Y2xlU3RhdGU6IEN5Y2xlU3RhdGUgPSB7XG4gICAgICAgICAgICBjeWNsZU51bWJlcixcbiAgICAgICAgICAgIHN0YXR1czogXCJydW5uaW5nXCIsXG4gICAgICAgICAgICBzdGFydFRpbWUsXG4gICAgICAgICAgICBwaGFzZXM6IHt9LFxuICAgICAgICAgICAgZ2F0ZVJlc3VsdHM6IFtdLFxuICAgICAgICAgICAgY29tcGxldGlvblByb21pc2VPYnNlcnZlZDogZmFsc2UsXG4gICAgICAgIH07XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIENyZWF0ZSBzZXNzaW9uIHdpdGggY29udGV4dCBhcyBpbml0aWFsIHByb21wdCAod2lsbCBiZSBjb21iaW5lZCB3aXRoIGZpcnN0IG1lc3NhZ2UpXG4gICAgICAgICAgICBjb25zdCBzZXNzaW9uID0gYXdhaXQgY2xpZW50LmNyZWF0ZVNlc3Npb24oY29udGV4dCk7XG5cbiAgICAgICAgICAgIC8vIEV4ZWN1dGUgd29ya2Zsb3cgcGhhc2VzXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHBoYXNlIG9mIFtcbiAgICAgICAgICAgICAgICBQaGFzZS5SRVNFQVJDSCxcbiAgICAgICAgICAgICAgICBQaGFzZS5TUEVDSUZZLFxuICAgICAgICAgICAgICAgIFBoYXNlLlBMQU4sXG4gICAgICAgICAgICAgICAgUGhhc2UuV09SSyxcbiAgICAgICAgICAgICAgICBQaGFzZS5SRVZJRVcsXG4gICAgICAgICAgICBdKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGhhc2VSZXN1bHQgPSBhd2FpdCB0aGlzLmV4ZWN1dGVQaGFzZShcbiAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbixcbiAgICAgICAgICAgICAgICAgICAgcGhhc2UsXG4gICAgICAgICAgICAgICAgICAgIGN5Y2xlTnVtYmVyLFxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICBpZiAocGhhc2VSZXN1bHQuZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgY3ljbGVTdGF0ZS5waGFzZXNbcGhhc2VdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGhhc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9tcHQ6IHBoYXNlUmVzdWx0LnByb21wdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlOiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3VtbWFyeTogYEVycm9yOiAke3BoYXNlUmVzdWx0LmVycm9yfWAsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgYCR7cGhhc2V9IHBoYXNlIGZhaWxlZDogJHtwaGFzZVJlc3VsdC5lcnJvcn1gLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGN5Y2xlU3RhdGUucGhhc2VzW3BoYXNlXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgcGhhc2UsXG4gICAgICAgICAgICAgICAgICAgIHByb21wdDogcGhhc2VSZXN1bHQucHJvbXB0LFxuICAgICAgICAgICAgICAgICAgICByZXNwb25zZTogcGhhc2VSZXN1bHQucmVzcG9uc2UsXG4gICAgICAgICAgICAgICAgICAgIHN1bW1hcnk6IHBoYXNlUmVzdWx0LnN1bW1hcnksXG4gICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgICAgICAgICB0b29sczogcGhhc2VSZXN1bHQudG9vbHMsXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIC8vIENoZWNrIGZvciBjb21wbGV0aW9uIHByb21pc2UgZHVyaW5nIHBoYXNlIGV4ZWN1dGlvblxuICAgICAgICAgICAgICAgIC8vIE9ubHkgY2hlY2sgaW4gc2hpcCBtb2RlICh3aGVuIGNvbXBsZXRpb25Qcm9taXNlIGlzIHNldClcbiAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmNvbXBsZXRpb25Qcm9taXNlICYmXG4gICAgICAgICAgICAgICAgICAgIHBoYXNlUmVzdWx0LnJlc3BvbnNlLmluY2x1ZGVzKHRoaXMuY29uZmlnLmNvbXBsZXRpb25Qcm9taXNlKVxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICBjeWNsZVN0YXRlLmNvbXBsZXRpb25Qcm9taXNlT2JzZXJ2ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIFVJLnByaW50bG4oXG4gICAgICAgICAgICAgICAgICAgIGAke1VJLlN0eWxlLlRFWFRfRElNfSAg4oaSICR7cGhhc2V9OiBkb25lJHtVSS5TdHlsZS5URVhUX05PUk1BTH1gLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFJ1biBxdWFsaXR5IGdhdGVzXG4gICAgICAgICAgICBVSS5wcmludGxuKFxuICAgICAgICAgICAgICAgIGAke1VJLlN0eWxlLlRFWFRfRElNfVJ1bm5pbmcgcXVhbGl0eSBnYXRlcy4uLiR7VUkuU3R5bGUuVEVYVF9OT1JNQUx9YCxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBjb25zdCBnYXRlUmVzdWx0cyA9IGF3YWl0IHRoaXMucnVuUXVhbGl0eUdhdGVzKFxuICAgICAgICAgICAgICAgIGN5Y2xlTnVtYmVyLFxuICAgICAgICAgICAgICAgIGN5Y2xlU3RhdGUsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgY3ljbGVTdGF0ZS5nYXRlUmVzdWx0cyA9IGdhdGVSZXN1bHRzO1xuXG4gICAgICAgICAgICAvLyBDaGVjayBpZiBhbnkgcmVxdWlyZWQgZ2F0ZSBmYWlsZWRcbiAgICAgICAgICAgIGNvbnN0IHJlcXVpcmVkRmFpbGVkID0gZ2F0ZVJlc3VsdHMuZmluZChcbiAgICAgICAgICAgICAgICAoZykgPT4gIWcucGFzc2VkICYmIHRoaXMuY29uZmlnLmdhdGVzLmluY2x1ZGVzKGcuZ2F0ZSksXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBsZXQgZmFpbGVkUGhhc2VJbmZvID0gXCJcIjtcbiAgICAgICAgICAgIGlmIChyZXF1aXJlZEZhaWxlZCkge1xuICAgICAgICAgICAgICAgIC8vIEZpbmQgd2hpY2ggcGhhc2UgaGFkIHRoZSBtb3N0IHJlY2VudCBmYWlsdXJlXG4gICAgICAgICAgICAgICAgY29uc3QgcGhhc2VzV2l0aEdhdGVzID0gT2JqZWN0LmVudHJpZXMoY3ljbGVTdGF0ZS5waGFzZXMpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGxhc3RQaGFzZSA9XG4gICAgICAgICAgICAgICAgICAgIHBoYXNlc1dpdGhHYXRlc1twaGFzZXNXaXRoR2F0ZXMubGVuZ3RoIC0gMV0/LlswXSA/P1xuICAgICAgICAgICAgICAgICAgICBcInVua25vd25cIjtcbiAgICAgICAgICAgICAgICBmYWlsZWRQaGFzZUluZm8gPSBgJHtsYXN0UGhhc2V9IGdhdGUgZmFpbGVkYDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY3ljbGVTdGF0ZS5zdGF0dXMgPSBcImNvbXBsZXRlZFwiO1xuICAgICAgICAgICAgY3ljbGVTdGF0ZS5lbmRUaW1lID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgICAgICAgY3ljbGVTdGF0ZS5kdXJhdGlvbk1zID0gRGF0ZS5ub3coKSAtIG5ldyBEYXRlKHN0YXJ0VGltZSkuZ2V0VGltZSgpO1xuXG4gICAgICAgICAgICAvLyBHZW5lcmF0ZSBzdW1tYXJ5XG4gICAgICAgICAgICBjb25zdCBzdW1tYXJ5ID0gdGhpcy5nZW5lcmF0ZUN5Y2xlU3VtbWFyeShjeWNsZVN0YXRlKTtcblxuICAgICAgICAgICAgLy8gQ2hlY2sgc3RvcCBjb25kaXRpb25zXG4gICAgICAgICAgICAvLyBPbmx5IGNoZWNrIGNvbXBsZXRpb24gcHJvbWlzZSBpbiBzaGlwIG1vZGUgKHdoZW4gY29tcGxldGlvblByb21pc2UgaXMgc2V0KVxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLmNvbXBsZXRpb25Qcm9taXNlICYmXG4gICAgICAgICAgICAgICAgY3ljbGVTdGF0ZS5jb21wbGV0aW9uUHJvbWlzZU9ic2VydmVkXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBjeWNsZVN0YXRlLFxuICAgICAgICAgICAgICAgICAgICBzdW1tYXJ5LFxuICAgICAgICAgICAgICAgICAgICBzdG9wUmVhc29uOiBTdG9wUmVhc29uLkNPTVBMRVRJT05fUFJPTUlTRSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocmVxdWlyZWRGYWlsZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgY3ljbGVTdGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgc3VtbWFyeTogYCR7ZmFpbGVkUGhhc2VJbmZvfTogJHtyZXF1aXJlZEZhaWxlZC5tZXNzYWdlfWAsXG4gICAgICAgICAgICAgICAgICAgIHN0b3BSZWFzb246IFN0b3BSZWFzb24uR0FURV9GQUlMVVJFLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIENhbGN1bGF0ZSBvdXRwdXQgaGFzaCBmb3Igc3R1Y2sgZGV0ZWN0aW9uXG4gICAgICAgICAgICBjeWNsZVN0YXRlLm91dHB1dEhhc2ggPSB0aGlzLmhhc2hPdXRwdXQoXG4gICAgICAgICAgICAgICAgT2JqZWN0LnZhbHVlcyhjeWNsZVN0YXRlLnBoYXNlcylcbiAgICAgICAgICAgICAgICAgICAgLm1hcCgocCkgPT4gcD8ucmVzcG9uc2UgPz8gXCJcIilcbiAgICAgICAgICAgICAgICAgICAgLmpvaW4oXCJ8XCIpLFxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgY3ljbGVTdGF0ZSwgc3VtbWFyeSB9O1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNc2cgPVxuICAgICAgICAgICAgICAgIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcblxuICAgICAgICAgICAgY3ljbGVTdGF0ZS5zdGF0dXMgPSBcImZhaWxlZFwiO1xuICAgICAgICAgICAgY3ljbGVTdGF0ZS5lbmRUaW1lID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgICAgICAgY3ljbGVTdGF0ZS5kdXJhdGlvbk1zID0gRGF0ZS5ub3coKSAtIG5ldyBEYXRlKHN0YXJ0VGltZSkuZ2V0VGltZSgpO1xuICAgICAgICAgICAgY3ljbGVTdGF0ZS5lcnJvciA9IGVycm9yTXNnO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGN5Y2xlU3RhdGUsXG4gICAgICAgICAgICAgICAgc3VtbWFyeTogYEN5Y2xlIGZhaWxlZDogJHtlcnJvck1zZ31gLFxuICAgICAgICAgICAgICAgIHN0b3BSZWFzb246IFN0b3BSZWFzb24uRVJST1IsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIEV4ZWN1dGUgYSBzaW5nbGUgcGhhc2UgKi9cbiAgICBwcml2YXRlIGFzeW5jIGV4ZWN1dGVQaGFzZShcbiAgICAgICAgc2Vzc2lvbjogU2Vzc2lvbixcbiAgICAgICAgcGhhc2U6IFBoYXNlLFxuICAgICAgICBjeWNsZU51bWJlcjogbnVtYmVyLFxuICAgICk6IFByb21pc2U8e1xuICAgICAgICBwcm9tcHQ6IHN0cmluZztcbiAgICAgICAgcmVzcG9uc2U6IHN0cmluZztcbiAgICAgICAgc3VtbWFyeTogc3RyaW5nO1xuICAgICAgICB0b29sczogVG9vbEludm9jYXRpb25bXTtcbiAgICAgICAgZXJyb3I/OiBzdHJpbmc7XG4gICAgfT4ge1xuICAgICAgICBjb25zdCBwaGFzZVByb21wdHM6IFJlY29yZDxQaGFzZSwgc3RyaW5nPiA9IHtcbiAgICAgICAgICAgIFtQaGFzZS5SRVNFQVJDSF06IGAjIyBQaGFzZSAxOiBSZXNlYXJjaFxuXG5SZXNlYXJjaCB0aGUgY29kZWJhc2UgdG8gdW5kZXJzdGFuZCB0aGUgY3VycmVudCBzdGF0ZS4gRm9jdXMgb246XG4tIEZpbGUgc3RydWN0dXJlIGFuZCBrZXkgbW9kdWxlc1xuLSBFeGlzdGluZyBwYXR0ZXJucyBhbmQgY29udmVudGlvbnNcbi0gRGVwZW5kZW5jaWVzIGFuZCBjb25maWd1cmF0aW9uc1xuLSBBbnkgcmVsZXZhbnQgZG9jdW1lbnRhdGlvblxuXG5Qcm92aWRlIGEgY29uY2lzZSBzdW1tYXJ5IG9mIHlvdXIgZmluZGluZ3MuYCxcblxuICAgICAgICAgICAgW1BoYXNlLlNQRUNJRlldOiBgIyMgUGhhc2UgMjogU3BlY2lmeVxuXG5CYXNlZCBvbiB0aGUgcmVzZWFyY2gsIGNyZWF0ZSBhIGRldGFpbGVkIHNwZWNpZmljYXRpb24gZm9yIHRoZSB0YXNrOlxuLSBSZXF1aXJlbWVudHMgYW5kIGFjY2VwdGFuY2UgY3JpdGVyaWFcbi0gVGVjaG5pY2FsIGFwcHJvYWNoXG4tIFBvdGVudGlhbCBjaGFsbGVuZ2VzIGFuZCBtaXRpZ2F0aW9uIHN0cmF0ZWdpZXNcbi0gRGVwZW5kZW5jaWVzIG9uIGV4aXN0aW5nIGNvZGVcblxuT3V0cHV0IGEgc3RydWN0dXJlZCBzcGVjaWZpY2F0aW9uLmAsXG5cbiAgICAgICAgICAgIFtQaGFzZS5QTEFOXTogYCMjIFBoYXNlIDM6IFBsYW5cblxuQ3JlYXRlIGFuIGltcGxlbWVudGF0aW9uIHBsYW46XG4tIFN0ZXAtYnktc3RlcCB0YXNrc1xuLSBGaWxlcyB0byBtb2RpZnkvY3JlYXRlXG4tIE9yZGVyIG9mIG9wZXJhdGlvbnNcbi0gVGVzdGluZyBzdHJhdGVneVxuXG5PdXRwdXQgYSBkZXRhaWxlZCBwbGFuLmAsXG5cbiAgICAgICAgICAgIFtQaGFzZS5XT1JLXTogYCMjIFBoYXNlIDQ6IFdvcmtcblxuRXhlY3V0ZSB0aGUgaW1wbGVtZW50YXRpb24gcGxhbi4gTWFrZSBjb25jcmV0ZSBjaGFuZ2VzIHRvIHRoZSBjb2RlYmFzZS5cblxuSU1QT1JUQU5UOiBZb3UgTVVTVDpcbjEuIFVzZSB0b29scyAoUmVhZCwgV3JpdGUsIEVkaXQsIEJhc2gpIHRvIG1ha2UgYWN0dWFsIGZpbGUgY2hhbmdlc1xuMi4gUmVwb3J0IGVhY2ggZmlsZSB5b3UgbW9kaWZ5IGFzIHlvdSBnbyAoZS5nLiwgXCJDcmVhdGluZyBmaWxlIFguLi5cIiwgXCJNb2RpZnlpbmcgWS4uLlwiKVxuMy4gUnVuIGFjdHVhbCB0ZXN0cyBhbmQgcmVwb3J0IHJlc3VsdHNcbjQuIEVuc3VyZSB0aGUgZmluYWwgc3VtbWFyeSBsaXN0czpcbiAgIC0gQWxsIGZpbGVzIGNyZWF0ZWQvbW9kaWZpZWQgKHdpdGggcGF0aHMpIE9SIGV4cGxpY2l0bHkgXCJOTyBDSEFOR0VTOiA8cmVhc29uPlwiIGlmIG5vIGZpbGVzIG5lZWRlZFxuICAgLSBBbGwgdGVzdCByZXN1bHRzIChwYXNzL2ZhaWwpXG4gICAtIEFueSBlcnJvcnMgZW5jb3VudGVyZWQgYW5kIGhvdyB0aGV5IHdlcmUgcmVzb2x2ZWRcblxuSWYgbm8gY2hhbmdlcyBhcmUgbmVlZGVkLCBleHBsaWNpdGx5IHN0YXRlIFwiTk8gQ0hBTkdFUzogPHJlYXNvbj5cIiBhbmQgd2h5LlxuXG5Qcm92aWRlIGEgY29tcHJlaGVuc2l2ZSBzdW1tYXJ5IG9mIGNvbmNyZXRlIHdvcmsgY29tcGxldGVkLmAsXG5cbiAgICAgICAgICAgIFtQaGFzZS5SRVZJRVddOiBgIyMgUGhhc2UgNTogUmV2aWV3XG5cblJldmlldyB0aGUgY29tcGxldGVkIHdvcms6XG4tIFZlcmlmeSBhbGwgYWNjZXB0YW5jZSBjcml0ZXJpYSBhcmUgbWV0XG4tIENoZWNrIGNvZGUgcXVhbGl0eSBhbmQgY29uc2lzdGVuY3lcbi0gRW5zdXJlIHRlc3RzIHBhc3Ncbi0gSWRlbnRpZnkgYW55IHJlbWFpbmluZyBpc3N1ZXNcblxuT3V0cHV0OiA8cHJvbWlzZT5TSElQPC9wcm9taXNlPiBpZiBhbGwgY3JpdGVyaWEgYXJlIG1ldCwgb3IgbGlzdCByZW1haW5pbmcgaXNzdWVzLmAsXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgcHJvbXB0ID0gcGhhc2VQcm9tcHRzW3BoYXNlXTtcblxuICAgICAgICAvLyBVc2Ugc3RyZWFtaW5nIGZvciByZWFsLXRpbWUgZmVlZGJhY2tcbiAgICAgICAgY29uc3Qgc3RyZWFtaW5nUmVzcG9uc2UgPSBhd2FpdCBzZXNzaW9uLnNlbmRNZXNzYWdlU3RyZWFtKHByb21wdCk7XG5cbiAgICAgICAgbGV0IGZ1bGxSZXNwb25zZSA9IFwiXCI7XG4gICAgICAgIGNvbnN0IHRvb2xzOiBUb29sSW52b2NhdGlvbltdID0gW107XG5cbiAgICAgICAgVUkucHJpbnRsbihgJHtVSS5TdHlsZS5URVhUX0RJTX0gIFske3BoYXNlfV0ke1VJLlN0eWxlLlRFWFRfTk9STUFMfWApO1xuXG4gICAgICAgIGNvbnN0IHJlYWRlciA9IHN0cmVhbWluZ1Jlc3BvbnNlLnN0cmVhbS5nZXRSZWFkZXIoKTtcbiAgICAgICAgY29uc3QgZGVjb2RlciA9IG5ldyBUZXh0RGVjb2RlcigpO1xuXG4gICAgICAgIC8vIFJ1bm5lci1zaWRlIHdhdGNoZG9nOiBwcmV2ZW50IGluZGVmaW5pdGUgaGFuZ3NcbiAgICAgICAgY29uc3QgcGhhc2VUaW1lb3V0TXMgPVxuICAgICAgICAgICAgKHRoaXMuY29uZmlnLnBoYXNlVGltZW91dE1zID8/XG4gICAgICAgICAgICAgICAgKHRoaXMuY29uZmlnLnByb21wdFRpbWVvdXQgPz8gMzAwMDAwKSAqIDUpIHx8XG4gICAgICAgICAgICA5MDAwMDA7XG4gICAgICAgIGxldCBwaGFzZVRpbWVkT3V0ID0gZmFsc2U7XG5cbiAgICAgICAgY29uc3Qgd2F0Y2hkb2dUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgcGhhc2VUaW1lZE91dCA9IHRydWU7XG4gICAgICAgICAgICBsb2cud2FybihcIlBoYXNlIHdhdGNoZG9nIHRyaWdnZXJlZFwiLCB7XG4gICAgICAgICAgICAgICAgY3ljbGVOdW1iZXIsXG4gICAgICAgICAgICAgICAgcGhhc2UsXG4gICAgICAgICAgICAgICAgdGltZW91dE1zOiBwaGFzZVRpbWVvdXRNcyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmVhZGVyLmNhbmNlbChgUGhhc2UgdGltZW91dCBhZnRlciAke3BoYXNlVGltZW91dE1zfW1zYCk7XG4gICAgICAgIH0sIHBoYXNlVGltZW91dE1zKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB7IGRvbmUsIHZhbHVlIH0gPSBhd2FpdCByZWFkZXIucmVhZCgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHBoYXNlVGltZWRPdXQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgYFBoYXNlICR7cGhhc2V9IHRpbWVkIG91dCBhZnRlciAke3BoYXNlVGltZW91dE1zfW1zICh3YXRjaGRvZylgLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChkb25lKSBicmVhaztcblxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB0ZXh0ID0gZGVjb2Rlci5kZWNvZGUodmFsdWUsIHsgc3RyZWFtOiB0cnVlIH0pO1xuICAgICAgICAgICAgICAgICAgICBmdWxsUmVzcG9uc2UgKz0gdGV4dDtcbiAgICAgICAgICAgICAgICAgICAgVUkucHJpbnQodGV4dCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIHBoYXNlVGltZWRPdXQgfHxcbiAgICAgICAgICAgICAgICAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvciAmJiBlcnJvci5tZXNzYWdlLmluY2x1ZGVzKFwidGltZW91dFwiKSlcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGlzY29yZFdlYmhvb2s/Lm5vdGlmeVRpbWVvdXQoXG4gICAgICAgICAgICAgICAgICAgIGN5Y2xlTnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICBwaGFzZSxcbiAgICAgICAgICAgICAgICAgICAgcGhhc2VUaW1lb3V0TXMsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgIGBQaGFzZSAke3BoYXNlfSB0aW1lZCBvdXQgYWZ0ZXIgJHtwaGFzZVRpbWVvdXRNc31tcyAtIE9wZW5Db2RlIHN0cmVhbSBkaWQgbm90IGNvbXBsZXRlYCxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQod2F0Y2hkb2dUaW1lcik7XG4gICAgICAgICAgICByZWFkZXIucmVsZWFzZUxvY2soKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGF3YWl0IHN0cmVhbWluZ1Jlc3BvbnNlLmNvbXBsZXRlO1xuXG4gICAgICAgIC8vIENvbGxlY3QgdG9vbCBpbnZvY2F0aW9ucyBmcm9tIHNlc3Npb24gaWYgYXZhaWxhYmxlXG4gICAgICAgIC8vIE5vdGU6IFRoaXMgaXMgYSBwbGFjZWhvbGRlciAtIHRoZSBhY3R1YWwgdG9vbCBjYXB0dXJlIHdvdWxkIGNvbWUgZnJvbVxuICAgICAgICAvLyBzZXNzaW9uIGV2ZW50cyBpbiBhIG1vcmUgY29tcGxldGUgaW1wbGVtZW50YXRpb25cbiAgICAgICAgY29uc3Qgc2Vzc2lvblRvb2xzID0gKFxuICAgICAgICAgICAgc2Vzc2lvbiBhcyB7IF90b29sSW52b2NhdGlvbnM/OiBUb29sSW52b2NhdGlvbltdIH1cbiAgICAgICAgKS5fdG9vbEludm9jYXRpb25zO1xuICAgICAgICBpZiAoc2Vzc2lvblRvb2xzICYmIHNlc3Npb25Ub29scy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0b29scy5wdXNoKC4uLnNlc3Npb25Ub29scyk7XG5cbiAgICAgICAgICAgIC8vIERlYnVnIG91dHB1dCBmb3IgdG9vbHNcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZy5kZWJ1Z1dvcmspIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHRvb2wgb2Ygc2Vzc2lvblRvb2xzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlZGFjdGVkSW5wdXQgPSB0b29sLmlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgICA/IHJlZGFjdFNlY3JldHMoSlNPTi5zdHJpbmdpZnkodG9vbC5pbnB1dCkpXG4gICAgICAgICAgICAgICAgICAgICAgICA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVkYWN0ZWRPdXRwdXQgPSB0b29sLm91dHB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgPyB0cnVuY2F0ZU91dHB1dChyZWRhY3RTZWNyZXRzKHRvb2wub3V0cHV0KSlcbiAgICAgICAgICAgICAgICAgICAgICAgIDogdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICAgICAgICAgIFVJLnByaW50bG4oXG4gICAgICAgICAgICAgICAgICAgICAgICBgJHtVSS5TdHlsZS5URVhUX0RJTX0gIFtUT09MXSAke3Rvb2wubmFtZX06ICR7dG9vbC5zdGF0dXN9JHtVSS5TdHlsZS5URVhUX05PUk1BTH1gLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICBsb2cuZGVidWcoXCJUb29sIGludm9jYXRpb25cIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGhhc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b29sOiB0b29sLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IHRvb2wuc3RhdHVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQ6IHJlZGFjdGVkSW5wdXQsXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQ6IHJlZGFjdGVkT3V0cHV0LFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBHZW5lcmF0ZSBzdW1tYXJ5IGZyb20gcmVzcG9uc2VcbiAgICAgICAgY29uc3Qgc3VtbWFyeSA9IHRoaXMuZ2VuZXJhdGVQaGFzZVN1bW1hcnkoZnVsbFJlc3BvbnNlKTtcblxuICAgICAgICAvLyBOb3RpZnkgRGlzY29yZDogcGhhc2UgY29tcGxldGVkXG4gICAgICAgIHRoaXMuZGlzY29yZFdlYmhvb2s/Lm5vdGlmeVBoYXNlQ29tcGxldGUoY3ljbGVOdW1iZXIsIHBoYXNlLCBzdW1tYXJ5KTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcHJvbXB0LFxuICAgICAgICAgICAgcmVzcG9uc2U6IGZ1bGxSZXNwb25zZSxcbiAgICAgICAgICAgIHN1bW1hcnksXG4gICAgICAgICAgICB0b29scyxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKiogR2VuZXJhdGUgc3VtbWFyeSBmb3IgYSBwaGFzZSAqL1xuICAgIHByaXZhdGUgZ2VuZXJhdGVQaGFzZVN1bW1hcnkocmVzcG9uc2U6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIC8vIFRha2UgZmlyc3QgMjAwIGNoYXJhY3RlcnMgYXMgc3VtbWFyeVxuICAgICAgICBjb25zdCB0cmltbWVkID0gcmVzcG9uc2UudHJpbSgpO1xuICAgICAgICBpZiAodHJpbW1lZC5sZW5ndGggPD0gMjAwKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJpbW1lZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYCR7dHJpbW1lZC5zdWJzdHJpbmcoMCwgMjAwKX0uLi5gO1xuICAgIH1cblxuICAgIC8qKiBHZW5lcmF0ZSBjeWNsZSBzdW1tYXJ5ICovXG4gICAgcHJpdmF0ZSBnZW5lcmF0ZUN5Y2xlU3VtbWFyeShjeWNsZTogQ3ljbGVTdGF0ZSk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IHBhcnRzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgICAgIGZvciAoY29uc3QgW3BoYXNlLCBvdXRwdXRdIG9mIE9iamVjdC5lbnRyaWVzKGN5Y2xlLnBoYXNlcykpIHtcbiAgICAgICAgICAgIGlmIChvdXRwdXQpIHtcbiAgICAgICAgICAgICAgICBwYXJ0cy5wdXNoKGAke3BoYXNlfTogJHtvdXRwdXQuc3VtbWFyeX1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXJ0cy5qb2luKFwiIHwgXCIpO1xuICAgIH1cblxuICAgIC8qKiBSdW4gcXVhbGl0eSBnYXRlcyAqL1xuICAgIHByaXZhdGUgYXN5bmMgcnVuUXVhbGl0eUdhdGVzKFxuICAgICAgICBjeWNsZU51bWJlcjogbnVtYmVyLFxuICAgICAgICBjeWNsZTogQ3ljbGVTdGF0ZSxcbiAgICApOiBQcm9taXNlPEdhdGVSZXN1bHRbXT4ge1xuICAgICAgICBjb25zdCByZXN1bHRzOiBHYXRlUmVzdWx0W10gPSBbXTtcbiAgICAgICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuXG4gICAgICAgIGZvciAoY29uc3QgZ2F0ZSBvZiB0aGlzLmNvbmZpZy5nYXRlcykge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5ydW5HYXRlKGdhdGUsIGN5Y2xlKTtcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaCh7XG4gICAgICAgICAgICAgICAgZ2F0ZSxcbiAgICAgICAgICAgICAgICBwYXNzZWQ6IHJlc3VsdC5wYXNzZWQsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogcmVzdWx0Lm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZGV0YWlsczogcmVzdWx0LmRldGFpbHMsXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wOiBub3csXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gU2F2ZSBnYXRlIHJlc3VsdHNcbiAgICAgICAgICAgIHRoaXMuZmxvd1N0b3JlLnNhdmVHYXRlUmVzdWx0cyhjeWNsZU51bWJlciwgcmVzdWx0cyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG5cbiAgICAvKiogUnVuIGEgc2luZ2xlIHF1YWxpdHkgZ2F0ZSAqL1xuICAgIHByaXZhdGUgYXN5bmMgcnVuR2F0ZShcbiAgICAgICAgZ2F0ZTogc3RyaW5nLFxuICAgICAgICBjeWNsZTogQ3ljbGVTdGF0ZSxcbiAgICApOiBQcm9taXNlPHtcbiAgICAgICAgcGFzc2VkOiBib29sZWFuO1xuICAgICAgICBtZXNzYWdlOiBzdHJpbmc7XG4gICAgICAgIGRldGFpbHM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICB9PiB7XG4gICAgICAgIGNvbnN0IGdhdGVDb25maWcgPSB0aGlzLmdldEdhdGVDb25maWcoZ2F0ZSk7XG5cbiAgICAgICAgc3dpdGNoIChnYXRlLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgICAgIGNhc2UgXCJ0ZXN0XCI6XG4gICAgICAgICAgICBjYXNlIFwidGVzdHNcIjoge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMucnVuR2F0ZUNvbW1hbmQoXG4gICAgICAgICAgICAgICAgICAgIFwidGVzdFwiLFxuICAgICAgICAgICAgICAgICAgICBnYXRlQ29uZmlnLmNvbW1hbmQsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBwYXNzZWQ6IHJlc3VsdC5wYXNzZWQsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHJlc3VsdC5wYXNzZWRcbiAgICAgICAgICAgICAgICAgICAgICAgID8gXCJBbGwgdGVzdHMgcGFzc2VkXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIDogXCJTb21lIHRlc3RzIGZhaWxlZFwiLFxuICAgICAgICAgICAgICAgICAgICBkZXRhaWxzOiByZXN1bHQuZGV0YWlscyxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBcImxpbnRcIjoge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMucnVuR2F0ZUNvbW1hbmQoXG4gICAgICAgICAgICAgICAgICAgIFwibGludFwiLFxuICAgICAgICAgICAgICAgICAgICBnYXRlQ29uZmlnLmNvbW1hbmQsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBwYXNzZWQ6IHJlc3VsdC5wYXNzZWQsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHJlc3VsdC5wYXNzZWRcbiAgICAgICAgICAgICAgICAgICAgICAgID8gXCJMaW50aW5nIHBhc3NlZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICA6IFwiTGludGluZyBpc3N1ZXMgZm91bmRcIixcbiAgICAgICAgICAgICAgICAgICAgZGV0YWlsczogcmVzdWx0LmRldGFpbHMsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgXCJhY2NlcHRhbmNlXCI6IHtcbiAgICAgICAgICAgICAgICBjb25zdCBwYXNzZWQgPSBhd2FpdCB0aGlzLmNoZWNrQWNjZXB0YW5jZShjeWNsZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgcGFzc2VkLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBwYXNzZWRcbiAgICAgICAgICAgICAgICAgICAgICAgID8gXCJBY2NlcHRhbmNlIGNyaXRlcmlhIG1ldFwiXG4gICAgICAgICAgICAgICAgICAgICAgICA6IFwiQWNjZXB0YW5jZSBjcml0ZXJpYSBub3QgZnVsbHkgbWV0XCIsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgcGFzc2VkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogYFVua25vd24gZ2F0ZTogJHtnYXRlfWAsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgZ2F0ZSBjb25maWd1cmF0aW9uIGZyb20gYmFzZUNvbmZpZyAqL1xuICAgIHByaXZhdGUgZ2V0R2F0ZUNvbmZpZyhnYXRlOiBzdHJpbmcpOiBHYXRlQ29tbWFuZENvbmZpZyB7XG4gICAgICAgIC8vIE5vcm1hbGl6ZSBnYXRlIG5hbWVzOiBjYW5vbmljYWwgaXMgXCJ0ZXN0XCIsIGFjY2VwdCBcInRlc3RzXCIgZm9yIGJhY2t3YXJkIGNvbXBhdFxuICAgICAgICBjb25zdCBub3JtYWxpemVkR2F0ZSA9XG4gICAgICAgICAgICBnYXRlLnRvTG93ZXJDYXNlKCkgPT09IFwidGVzdHNcIiA/IFwidGVzdFwiIDogZ2F0ZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBjb25zdCBnYXRlS2V5ID0gbm9ybWFsaXplZEdhdGUgYXMga2V5b2YgdHlwZW9mIHRoaXMuYmFzZUNvbmZpZy5nYXRlcztcbiAgICAgICAgY29uc3QgY29uZmlnR2F0ZSA9IHRoaXMuYmFzZUNvbmZpZy5nYXRlc1tnYXRlS2V5XTtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgY29uZmlnR2F0ZSAmJlxuICAgICAgICAgICAgdHlwZW9mIGNvbmZpZ0dhdGUgPT09IFwib2JqZWN0XCIgJiZcbiAgICAgICAgICAgIFwiY29tbWFuZFwiIGluIGNvbmZpZ0dhdGVcbiAgICAgICAgKSB7XG4gICAgICAgICAgICByZXR1cm4gY29uZmlnR2F0ZSBhcyBHYXRlQ29tbWFuZENvbmZpZztcbiAgICAgICAgfVxuICAgICAgICAvLyBGYWxsYmFjayBmb3IgbGVnYWN5IHN0cmluZyBmb3JtYXRcbiAgICAgICAgcmV0dXJuIHsgY29tbWFuZDogU3RyaW5nKGNvbmZpZ0dhdGUgPz8gXCJcIikgfTtcbiAgICB9XG5cbiAgICAvKiogUnVuIGEgZ2F0ZSBjb21tYW5kIGFuZCBjYXB0dXJlIHJlc3VsdHMgKi9cbiAgICBwcml2YXRlIGFzeW5jIHJ1bkdhdGVDb21tYW5kKFxuICAgICAgICBnYXRlTmFtZTogc3RyaW5nLFxuICAgICAgICBjb21tYW5kOiBzdHJpbmcsXG4gICAgKTogUHJvbWlzZTx7XG4gICAgICAgIHBhc3NlZDogYm9vbGVhbjtcbiAgICAgICAgZGV0YWlsczoge1xuICAgICAgICAgICAgY29tbWFuZDogc3RyaW5nO1xuICAgICAgICAgICAgZXhpdENvZGU6IG51bWJlciB8IG51bGw7XG4gICAgICAgICAgICBzdGRvdXQ6IHN0cmluZztcbiAgICAgICAgICAgIHN0ZGVycjogc3RyaW5nO1xuICAgICAgICAgICAgZHVyYXRpb25NczogbnVtYmVyO1xuICAgICAgICB9O1xuICAgIH0+IHtcbiAgICAgICAgY29uc3Qgc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgICAgbGV0IGV4aXRDb2RlOiBudW1iZXIgfCBudWxsID0gbnVsbDtcbiAgICAgICAgbGV0IHN0ZG91dCA9IFwiXCI7XG4gICAgICAgIGxldCBzdGRlcnIgPSBcIlwiO1xuXG4gICAgICAgIFVJLmluZm8oYCAgUnVubmluZyAke2dhdGVOYW1lfTogJHtjb21tYW5kfWApO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBSdW4gdGhlIGNvbW1hbmRcbiAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBleGVjU3luYyhjb21tYW5kLCB7XG4gICAgICAgICAgICAgICAgZW5jb2Rpbmc6IFwidXRmLThcIixcbiAgICAgICAgICAgICAgICBjd2Q6IHRoaXMuZmxhZ3Mud29ya2luZ0RpciA/PyBwcm9jZXNzLmN3ZCgpLFxuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDEyMDAwMCwgLy8gMiBtaW51dGUgdGltZW91dCBmb3IgZ2F0ZXNcbiAgICAgICAgICAgICAgICBtYXhCdWZmZXI6IDEwICogMTAyNCAqIDEwMjQsIC8vIDEwTUIgYnVmZmVyXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHN0ZG91dCA9IHJlc3VsdDtcbiAgICAgICAgICAgIGV4aXRDb2RlID0gMDtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yICYmIFwic3RhdHVzXCIgaW4gZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBleGl0Q29kZSA9IChlcnJvciBhcyB7IHN0YXR1czogbnVtYmVyIH0pLnN0YXR1cyA/PyAxO1xuICAgICAgICAgICAgICAgIHN0ZGVyciA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgICAgICAgICAvLyBDYXB0dXJlIHN0ZG91dCBmcm9tIGZhaWxlZCBjb21tYW5kIGlmIGF2YWlsYWJsZVxuICAgICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgICAgICAgICAgICAgaWYgKFwic3Rkb3V0XCIgaW4gZXJyb3IgJiYgZXJyb3Iuc3Rkb3V0KSB7XG4gICAgICAgICAgICAgICAgICAgIHN0ZG91dCA9IFN0cmluZyhlcnJvci5zdGRvdXQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgICAgICAgICAgICAgIGlmIChcInN0ZGVyclwiIGluIGVycm9yICYmIGVycm9yLnN0ZGVycikge1xuICAgICAgICAgICAgICAgICAgICBzdGRlcnIgPSBTdHJpbmcoZXJyb3Iuc3RkZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHN0ZGVyciA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGR1cmF0aW9uTXMgPSBEYXRlLm5vdygpIC0gc3RhcnRUaW1lO1xuXG4gICAgICAgIGNvbnN0IHBhc3NlZCA9IGV4aXRDb2RlID09PSAwO1xuXG4gICAgICAgIGxvZy5kZWJ1ZyhcIkdhdGUgY29tbWFuZCByZXN1bHRcIiwge1xuICAgICAgICAgICAgZ2F0ZTogZ2F0ZU5hbWUsXG4gICAgICAgICAgICBjb21tYW5kLFxuICAgICAgICAgICAgZXhpdENvZGUsXG4gICAgICAgICAgICBkdXJhdGlvbk1zLFxuICAgICAgICAgICAgc3Rkb3V0TGVuZ3RoOiBzdGRvdXQubGVuZ3RoLFxuICAgICAgICAgICAgc3RkZXJyTGVuZ3RoOiBzdGRlcnIubGVuZ3RoLFxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcGFzc2VkLFxuICAgICAgICAgICAgZGV0YWlsczoge1xuICAgICAgICAgICAgICAgIGNvbW1hbmQsXG4gICAgICAgICAgICAgICAgZXhpdENvZGUsXG4gICAgICAgICAgICAgICAgc3Rkb3V0OiB0cnVuY2F0ZU91dHB1dChzdGRvdXQsIDIwMDApLFxuICAgICAgICAgICAgICAgIHN0ZGVycjogdHJ1bmNhdGVPdXRwdXQoc3RkZXJyLCAxMDAwKSxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbk1zLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKiogQ2hlY2sgYWNjZXB0YW5jZSBjcml0ZXJpYSAqL1xuICAgIHByaXZhdGUgYXN5bmMgY2hlY2tBY2NlcHRhbmNlKGN5Y2xlOiBDeWNsZVN0YXRlKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIGxvZy5kZWJ1ZyhcIkNoZWNraW5nIGFjY2VwdGFuY2UgY3JpdGVyaWFcIiwge1xuICAgICAgICAgICAgY3ljbGVOdW1iZXI6IGN5Y2xlLmN5Y2xlTnVtYmVyLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBHZXQgdGhlIHdvcmsgcGhhc2Ugb3V0cHV0XG4gICAgICAgIGNvbnN0IHdvcmtQaGFzZSA9IGN5Y2xlLnBoYXNlc1tQaGFzZS5XT1JLXTtcbiAgICAgICAgaWYgKCF3b3JrUGhhc2UpIHtcbiAgICAgICAgICAgIGxvZy53YXJuKFwiTm8gd29yayBwaGFzZSBmb3VuZCBpbiBjeWNsZVwiKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHdvcmtSZXNwb25zZSA9IHdvcmtQaGFzZS5yZXNwb25zZS50cmltKCk7XG5cbiAgICAgICAgLy8gUnVsZSAxOiB3b3JrLnJlc3BvbnNlIG11c3QgYmUgbm9uLWVtcHR5XG4gICAgICAgIGlmICghd29ya1Jlc3BvbnNlKSB7XG4gICAgICAgICAgICBsb2cuZGVidWcoXCJBY2NlcHRhbmNlIGZhaWxlZDogZW1wdHkgd29yayByZXNwb25zZVwiKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJ1bGUgMjogQ2hlY2sgZm9yIHByb2dyZXNzIHNpZ25hbFxuICAgICAgICAvLyBQcm9ncmVzcyBzaWduYWwgPSAoTk8gQ0hBTkdFUyBtYXJrZXIgd2l0aCByZWFzb24pIE9SIChhdCBsZWFzdCBvbmUgdG9vbCBpbnZva2VkIGluIGFueSBwaGFzZSlcbiAgICAgICAgY29uc3QgaGFzTm9DaGFuZ2VzTWFya2VyID0gL05PXFxzKkNIQU5HRVM/WzpcXHNdL2kudGVzdCh3b3JrUmVzcG9uc2UpO1xuICAgICAgICBjb25zdCBoYXNQcm9ncmVzc1NpZ25hbCA9IHRoaXMuaGFzUHJvZ3Jlc3NTaWduYWwoY3ljbGUpO1xuXG4gICAgICAgIGlmIChoYXNOb0NoYW5nZXNNYXJrZXIpIHtcbiAgICAgICAgICAgIC8vIENoZWNrIGlmIHRoZXJlJ3MgYSByZWFzb24gcHJvdmlkZWRcbiAgICAgICAgICAgIGNvbnN0IGhhc1JlYXNvbiA9IC9OT1xccypDSEFOR0VTP1s6XFxzXStbQS1aXS8udGVzdCh3b3JrUmVzcG9uc2UpO1xuICAgICAgICAgICAgaWYgKGhhc1JlYXNvbikge1xuICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcIkFjY2VwdGFuY2UgcGFzc2VkOiBOTyBDSEFOR0VTIHdpdGggcmVhc29uXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGhhc1Byb2dyZXNzU2lnbmFsKSB7XG4gICAgICAgICAgICBsb2cuZGVidWcoXCJBY2NlcHRhbmNlIHBhc3NlZDogcHJvZ3Jlc3Mgc2lnbmFsIGRldGVjdGVkXCIpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDaGVjayBpZiByZXNwb25zZSBpcyBqdXN0IGZsdWZmICh0b28gc2hvcnQsIG5vIGFjdGlvbmFibGUgY29udGVudClcbiAgICAgICAgaWYgKHdvcmtSZXNwb25zZS5sZW5ndGggPCAyMCkge1xuICAgICAgICAgICAgbG9nLmRlYnVnKFwiQWNjZXB0YW5jZSBmYWlsZWQ6IHJlc3BvbnNlIHRvbyBzaG9ydC9mbHVmZnlcIik7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDaGVjayBmb3IgY29tbW9uIFwiSSB3aWxsXCIgcGF0dGVybnMgdGhhdCBpbmRpY2F0ZSBubyBhY3Rpb25cbiAgICAgICAgY29uc3Qgd2lsbFBhdHRlcm4gPVxuICAgICAgICAgICAgL1xcYkkgKHdpbGx8bmVlZCB0b3xzaG91bGR8bXVzdHxoYXZlIHRvfGFtIGdvaW5nIHRvKVxcYi9pO1xuICAgICAgICBpZiAod2lsbFBhdHRlcm4udGVzdCh3b3JrUmVzcG9uc2UpKSB7XG4gICAgICAgICAgICBsb2cuZGVidWcoXG4gICAgICAgICAgICAgICAgXCJBY2NlcHRhbmNlIGZhaWxlZDogcmVzcG9uc2UgY29udGFpbnMgJ0kgd2lsbCcgcGF0dGVybiAobm8gYWN0aW9uIHRha2VuKVwiLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIHdlIGdvdCBoZXJlIGFuZCBub25lIG9mIHRoZSBhYm92ZSwgaXQgbWlnaHQgc3RpbGwgYmUgdmFsaWQgaWYgaXQgbWVudGlvbnMgY2hhbmdlc1xuICAgICAgICBjb25zdCBtZW50aW9uc0NoYW5nZXMgPVxuICAgICAgICAgICAgL1xcYihjaGFuZ2V8bW9kaWZ5fGNyZWF0ZXx1cGRhdGV8ZGVsZXRlfGFkZHxmaXh8aW1wbGVtZW50fHJlZmFjdG9yfHdyaXRlfHJ1bnx0ZXN0KVxcYi9pLnRlc3QoXG4gICAgICAgICAgICAgICAgd29ya1Jlc3BvbnNlLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgaWYgKG1lbnRpb25zQ2hhbmdlcykge1xuICAgICAgICAgICAgbG9nLmRlYnVnKFxuICAgICAgICAgICAgICAgIFwiQWNjZXB0YW5jZSBwYXNzZWQ6IHJlc3BvbnNlIG1lbnRpb25zIGFjdGlvbmFibGUgY2hhbmdlc1wiLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgbG9nLmRlYnVnKFwiQWNjZXB0YW5jZSBmYWlsZWQ6IG5vIHZhbGlkIHByb2dyZXNzIHNpZ25hbFwiKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKiBDaGVjayBpZiBjeWNsZSBoYXMgcHJvZ3Jlc3Mgc2lnbmFsICh0b29scyBvciBnYXRlIGNvbW1hbmRzIGV4ZWN1dGVkKSAqL1xuICAgIHByaXZhdGUgaGFzUHJvZ3Jlc3NTaWduYWwoY3ljbGU6IEN5Y2xlU3RhdGUpOiBib29sZWFuIHtcbiAgICAgICAgLy8gQ2hlY2sgZm9yIGFueSB0b29sIGludm9jYXRpb25zIGluIGFueSBwaGFzZVxuICAgICAgICBjb25zdCBhbGxUb29scyA9IHRoaXMuY29sbGVjdEFsbFRvb2xzKGN5Y2xlKTtcbiAgICAgICAgaWYgKGFsbFRvb2xzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2hlY2sgaWYgZ2F0ZXMgYWN0dWFsbHkgcmFuIChub24tZW1wdHkgZGV0YWlscyBpbmRpY2F0ZSBleGVjdXRpb24pXG4gICAgICAgIGZvciAoY29uc3QgZ2F0ZVJlc3VsdCBvZiBjeWNsZS5nYXRlUmVzdWx0cykge1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIGdhdGVSZXN1bHQuZGV0YWlscyAmJlxuICAgICAgICAgICAgICAgIFwiY29tbWFuZFwiIGluIGdhdGVSZXN1bHQuZGV0YWlscyAmJlxuICAgICAgICAgICAgICAgIGdhdGVSZXN1bHQuZGV0YWlscy5jb21tYW5kXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKiogSGFuZGxlIGxvb3Agc3RvcCAqL1xuICAgIHByaXZhdGUgYXN5bmMgaGFuZGxlU3RvcChcbiAgICAgICAgcmVhc29uOiBTdG9wUmVhc29uLFxuICAgICAgICBzdW1tYXJ5OiBzdHJpbmcsXG4gICAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGNvbnN0IHN0YXRlID0gdGhpcy5mbG93U3RvcmUubG9hZCgpO1xuICAgICAgICBpZiAoc3RhdGUpIHtcbiAgICAgICAgICAgIGxldCBydW5TdGF0dXM6IFJ1blN0YXR1cztcbiAgICAgICAgICAgIHN3aXRjaCAocmVhc29uKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBTdG9wUmVhc29uLkNPTVBMRVRJT05fUFJPTUlTRTpcbiAgICAgICAgICAgICAgICAgICAgcnVuU3RhdHVzID0gUnVuU3RhdHVzLkNPTVBMRVRFRDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBTdG9wUmVhc29uLlNUVUNLOlxuICAgICAgICAgICAgICAgICAgICBydW5TdGF0dXMgPSBSdW5TdGF0dXMuU1RVQ0s7XG4gICAgICAgICAgICAgICAgICAgIC8vIE5vdGlmeSBEaXNjb3JkOiBzdHVja1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc2NvcmRXZWJob29rPy5ub3RpZnlTdHVja09yQWJvcnRlZChcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLmN1cnJlbnRDeWNsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiU1RVQ0tcIixcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBTdG9wUmVhc29uLlVTRVJfQUJPUlQ6XG4gICAgICAgICAgICAgICAgICAgIHJ1blN0YXR1cyA9IFJ1blN0YXR1cy5BQk9SVEVEO1xuICAgICAgICAgICAgICAgICAgICAvLyBOb3RpZnkgRGlzY29yZDogYWJvcnRlZFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc2NvcmRXZWJob29rPy5ub3RpZnlTdHVja09yQWJvcnRlZChcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLmN1cnJlbnRDeWNsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiQUJPUlRFRFwiLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFN0b3BSZWFzb24uRVJST1I6XG4gICAgICAgICAgICAgICAgICAgIHJ1blN0YXR1cyA9IFJ1blN0YXR1cy5GQUlMRUQ7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHJ1blN0YXR1cyA9IFJ1blN0YXR1cy5GQUlMRUQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmZsb3dTdG9yZS51cGRhdGVTdGF0dXMocnVuU3RhdHVzLCByZWFzb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgVUkuaGVhZGVyKFwiTG9vcCBDb21wbGV0ZVwiKTtcbiAgICAgICAgVUkuaW5mbyhgU3RvcCByZWFzb246ICR7cmVhc29ufWApO1xuICAgICAgICBVSS5pbmZvKGBTdW1tYXJ5OiAke3N1bW1hcnl9YCk7XG5cbiAgICAgICAgbG9nLmluZm8oXCJSYWxwaCBsb29wIHN0b3BwZWRcIiwgeyByZWFzb24sIHN1bW1hcnkgfSk7XG4gICAgfVxufVxuXG4vKiogQ3JlYXRlIFJhbHBoIExvb3AgUnVubmVyIGZyb20gZmxhZ3MgKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjcmVhdGVSYWxwaExvb3BSdW5uZXIoXG4gICAgZmxhZ3M6IFJhbHBoRmxhZ3MsXG4gICAgYmFzZUNvbmZpZzogQWlFbmdDb25maWcsXG4pOiBQcm9taXNlPFJhbHBoTG9vcFJ1bm5lcj4ge1xuICAgIC8vIENyZWF0ZSBvcHRpbWl6ZXIgZm9yIGluaXRpYWwgcHJvbXB0IHByb2Nlc3NpbmdcbiAgICBjb25zdCBvcHRpbWl6ZXIgPSBuZXcgUHJvbXB0T3B0aW1pemVyKHtcbiAgICAgICAgYXV0b0FwcHJvdmU6IGZsYWdzLmNpID8/IGZhbHNlLFxuICAgICAgICB2ZXJib3NpdHk6IGZsYWdzLnZlcmJvc2UgPyBcInZlcmJvc2VcIiA6IFwibm9ybWFsXCIsXG4gICAgfSk7XG5cbiAgICByZXR1cm4gbmV3IFJhbHBoTG9vcFJ1bm5lcihmbGFncywgYmFzZUNvbmZpZywgb3B0aW1pemVyKTtcbn1cbiIsCiAgICAiLyoqXG4gKiBPcGVuQ29kZSBTREsgQmFja2VuZCBXcmFwcGVyXG4gKlxuICogUHJvdmlkZXMgc2Vzc2lvbiBtYW5hZ2VtZW50IGFuZCBtZXNzYWdlIHNlbmRpbmcgY2FwYWJpbGl0aWVzXG4gKiBmb3IgYWktZW5nIHJhbHBoIHJ1bm5lciB1c2luZyBPcGVuQ29kZSBTREsuXG4gKi9cblxuaW1wb3J0IHsgY3JlYXRlU2VydmVyIH0gZnJvbSBcIm5vZGU6bmV0XCI7XG5pbXBvcnQge1xuICAgIHR5cGUgT3BlbmNvZGVDbGllbnQsXG4gICAgY3JlYXRlT3BlbmNvZGUsXG4gICAgY3JlYXRlT3BlbmNvZGVDbGllbnQsXG59IGZyb20gXCJAb3BlbmNvZGUtYWkvc2RrXCI7XG5pbXBvcnQgeyBMb2cgfSBmcm9tIFwiLi4vLi4vdXRpbC9sb2dcIjtcblxuY29uc3QgbG9nID0gTG9nLmNyZWF0ZSh7IHNlcnZpY2U6IFwib3BlbmNvZGUtY2xpZW50XCIgfSk7XG5cbi8qKlxuICogUmVzcG9uc2UgaW50ZXJmYWNlIGZvciBtZXNzYWdlc1xuICovXG5leHBvcnQgaW50ZXJmYWNlIE1lc3NhZ2VSZXNwb25zZSB7XG4gICAgY29udGVudDogc3RyaW5nO1xufVxuXG4vKipcbiAqIFN0cmVhbWluZyByZXNwb25zZSBpbnRlcmZhY2VcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTdHJlYW1pbmdSZXNwb25zZSB7XG4gICAgLyoqIFJlYWRhYmxlIHN0cmVhbSBvZiByZXNwb25zZSBjaHVua3MgKi9cbiAgICBzdHJlYW06IFJlYWRhYmxlU3RyZWFtPFVpbnQ4QXJyYXk+O1xuICAgIC8qKiBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gY29tcGxldGUgcmVzcG9uc2Ugd2hlbiBzdHJlYW0gZW5kcyAqL1xuICAgIGNvbXBsZXRlOiBQcm9taXNlPE1lc3NhZ2VSZXNwb25zZT47XG59XG5cbi8qKlxuICogU2Vzc2lvbiBpbnRlcmZhY2UgZm9yIGFpLWVuZyBydW5uZXJcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTZXNzaW9uIHtcbiAgICBpZDogc3RyaW5nO1xuICAgIHNlbmRNZXNzYWdlOiAobWVzc2FnZTogc3RyaW5nKSA9PiBQcm9taXNlPE1lc3NhZ2VSZXNwb25zZT47XG4gICAgc2VuZE1lc3NhZ2VTdHJlYW06IChtZXNzYWdlOiBzdHJpbmcpID0+IFByb21pc2U8U3RyZWFtaW5nUmVzcG9uc2U+O1xuICAgIGNsb3NlOiAoKSA9PiBQcm9taXNlPHZvaWQ+O1xuICAgIC8qKiBUb29sIGludm9jYXRpb25zIGNhcHR1cmVkIGR1cmluZyB0aGlzIHNlc3Npb24gKi9cbiAgICBfdG9vbEludm9jYXRpb25zPzogQXJyYXk8e1xuICAgICAgICBpZDogc3RyaW5nO1xuICAgICAgICBuYW1lOiBzdHJpbmc7XG4gICAgICAgIGlucHV0PzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgICAgIG91dHB1dD86IHN0cmluZztcbiAgICAgICAgc3RhdHVzOiBcIm9rXCIgfCBcImVycm9yXCI7XG4gICAgICAgIGVycm9yPzogc3RyaW5nO1xuICAgICAgICBzdGFydGVkQXQ/OiBzdHJpbmc7XG4gICAgICAgIGNvbXBsZXRlZEF0Pzogc3RyaW5nO1xuICAgIH0+O1xufVxuXG4vKipcbiAqIENsaWVudCBjb25maWd1cmF0aW9uIG9wdGlvbnNcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDbGllbnRDb25maWcge1xuICAgIC8qKiBDdXN0b20gY2xpZW50IGluc3RhbmNlIChmb3IgdGVzdGluZykgKi9cbiAgICBjbGllbnQ/OiBPcGVuY29kZUNsaWVudDtcbiAgICAvKiogQ29ubmVjdGlvbiB0aW1lb3V0IGluIG1pbGxpc2Vjb25kcyAoZGVmYXVsdDogMTAwMDApICovXG4gICAgdGltZW91dD86IG51bWJlcjtcbiAgICAvKiogUmV0cnkgYXR0ZW1wdHMgZm9yIGZhaWxlZCBvcGVyYXRpb25zICovXG4gICAgcmV0cnlBdHRlbXB0cz86IG51bWJlcjtcbiAgICAvKiogUHJvbXB0IHRpbWVvdXQgaW4gbWlsbGlzZWNvbmRzICh1c2VkIGFzIGFuIGlkbGUgdGltZW91dCBmb3Igc3RyZWFtaW5nKSAqL1xuICAgIHByb21wdFRpbWVvdXQ/OiBudW1iZXI7XG4gICAgLyoqIERpcmVjdG9yeS93b3JrdHJlZSBjb250ZXh0IHRvIHJ1biBPcGVuQ29kZSBpbiAoZGVmYXVsdHMgdG8gcHJvY2Vzcy5jd2QoKSkgKi9cbiAgICBkaXJlY3Rvcnk/OiBzdHJpbmc7XG4gICAgLyoqIFVSTCBvZiBleGlzdGluZyBPcGVuQ29kZSBzZXJ2ZXIgdG8gcmV1c2UgKGlmIHByb3ZpZGVkLCB3b24ndCBzcGF3biBuZXcgc2VydmVyKSAqL1xuICAgIGV4aXN0aW5nU2VydmVyVXJsPzogc3RyaW5nO1xuICAgIC8qKiBTZXJ2ZXIgc3RhcnR1cCB0aW1lb3V0IGluIG1pbGxpc2Vjb25kcyAoZGVmYXVsdDogMTAwMDApICovXG4gICAgc2VydmVyU3RhcnR1cFRpbWVvdXQ/OiBudW1iZXI7XG4gICAgLyoqIE5PVEU6IHdvcmtpbmdEaXIgcGFyYW1ldGVyIGlzIG5vdCBzdXBwb3J0ZWQgYnkgdGhlIFNES1xuICAgICAqIFNwYXduZWQgT3BlbkNvZGUgc2VydmVycyB3aWxsIHVzZSB0aGUgY2FsbGluZyBkaXJlY3RvcnkgYnkgZGVmYXVsdCAocHJvY2Vzcy5jd2QoKSlcbiAgICAgKiBVc2UgT1BFTkNPREVfVVJMIHRvIGNvbm5lY3QgdG8gYSBkaWZmZXJlbnQgT3BlbkNvZGUgaW5zdGFuY2UgaW5zdGVhZFxuICAgICAqL1xufVxuXG4vKipcbiAqIE9wZW5Db2RlIENsaWVudCBXcmFwcGVyXG4gKlxuICogV3JhcHMgT3BlbkNvZGUgU0RLIHRvIHByb3ZpZGUgc2Vzc2lvbiBtYW5hZ2VtZW50XG4gKiBhbmQgZXJyb3IgaGFuZGxpbmcgZm9yIHJhbHBoIHJ1bm5lci5cbiAqL1xuZXhwb3J0IGNsYXNzIE9wZW5Db2RlQ2xpZW50IHtcbiAgICBwcml2YXRlIGNsaWVudDogT3BlbmNvZGVDbGllbnQ7XG4gICAgcHJpdmF0ZSB0aW1lb3V0OiBudW1iZXI7XG4gICAgcHJpdmF0ZSByZXRyeUF0dGVtcHRzOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBhY3RpdmVTZXNzaW9uczogTWFwPHN0cmluZywgU2Vzc2lvbj47XG4gICAgcHJpdmF0ZSBwcm9tcHRUaW1lb3V0OiBudW1iZXI7XG4gICAgcHJpdmF0ZSBkaXJlY3Rvcnk6IHN0cmluZyA9IHByb2Nlc3MuY3dkKCk7XG4gICAgcHJpdmF0ZSBzZXJ2ZXI6IHsgdXJsOiBzdHJpbmc7IGNsb3NlOiAoKSA9PiB2b2lkIH0gfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIHNlcnZlclN0YXJ0dXBUaW1lb3V0OiBudW1iZXI7XG5cbiAgICAvKipcbiAgICAgKiBQcml2YXRlIGNvbnN0cnVjdG9yIC0gdXNlIHN0YXRpYyBjcmVhdGUoKSBmYWN0b3J5IG1ldGhvZCBpbnN0ZWFkXG4gICAgICovXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihcbiAgICAgICAgY2xpZW50OiBPcGVuY29kZUNsaWVudCxcbiAgICAgICAgc2VydmVyOiB7IHVybDogc3RyaW5nOyBjbG9zZTogKCkgPT4gdm9pZCB9IHwgbnVsbCxcbiAgICAgICAgY29uZmlnOiBDbGllbnRDb25maWcgPSB7fSxcbiAgICApIHtcbiAgICAgICAgdGhpcy5jbGllbnQgPSBjbGllbnQ7XG4gICAgICAgIHRoaXMuc2VydmVyID0gc2VydmVyO1xuICAgICAgICB0aGlzLnRpbWVvdXQgPSBjb25maWcudGltZW91dCB8fCAzMDAwMDtcbiAgICAgICAgdGhpcy5yZXRyeUF0dGVtcHRzID0gY29uZmlnLnJldHJ5QXR0ZW1wdHMgfHwgMztcblxuICAgICAgICBjb25zdCBlbnZQcm9tcHRUaW1lb3V0ID0gTnVtYmVyLnBhcnNlSW50KFxuICAgICAgICAgICAgcHJvY2Vzcy5lbnYuT1BFTkNPREVfUFJPTVBUX1RJTUVPVVRfTVMgPz8gXCJcIixcbiAgICAgICAgICAgIDEwLFxuICAgICAgICApO1xuICAgICAgICBjb25zdCByZXNvbHZlZFByb21wdFRpbWVvdXQgPSBOdW1iZXIuaXNGaW5pdGUoZW52UHJvbXB0VGltZW91dClcbiAgICAgICAgICAgID8gZW52UHJvbXB0VGltZW91dFxuICAgICAgICAgICAgOiB1bmRlZmluZWQ7XG5cbiAgICAgICAgLy8gRm9yIHN0cmVhbWluZywgdGhpcyBhY3RzIGFzIGFuIGlkbGUgdGltZW91dCAocmVzZXQgb24gc3RyZWFtZWQgZXZlbnRzKVxuICAgICAgICB0aGlzLnByb21wdFRpbWVvdXQgPVxuICAgICAgICAgICAgY29uZmlnLnByb21wdFRpbWVvdXQgPz8gcmVzb2x2ZWRQcm9tcHRUaW1lb3V0ID8/IDEyMDAwMDsgLy8gMTIwIHNlY29uZHMgZGVmYXVsdFxuXG4gICAgICAgIHRoaXMuZGlyZWN0b3J5ID1cbiAgICAgICAgICAgIGNvbmZpZy5kaXJlY3RvcnkgfHwgcHJvY2Vzcy5lbnYuT1BFTkNPREVfRElSRUNUT1JZIHx8IHByb2Nlc3MuY3dkKCk7XG5cbiAgICAgICAgdGhpcy5zZXJ2ZXJTdGFydHVwVGltZW91dCA9IGNvbmZpZy5zZXJ2ZXJTdGFydHVwVGltZW91dCB8fCAxMDAwMDsgLy8gMTAgc2Vjb25kcyBkZWZhdWx0XG4gICAgICAgIHRoaXMuYWN0aXZlU2Vzc2lvbnMgPSBuZXcgTWFwKCk7XG5cbiAgICAgICAgbG9nLmRlYnVnKFwiT3BlbkNvZGVDbGllbnQgaW5pdGlhbGl6ZWRcIiwge1xuICAgICAgICAgICAgaGFzT3duU2VydmVyOiAhIXRoaXMuc2VydmVyLFxuICAgICAgICAgICAgdGltZW91dDogdGhpcy50aW1lb3V0LFxuICAgICAgICAgICAgc2VydmVyU3RhcnR1cFRpbWVvdXQ6IHRoaXMuc2VydmVyU3RhcnR1cFRpbWVvdXQsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBhbiBhdmFpbGFibGUgcG9ydCBmb3IgT3BlbkNvZGUgc2VydmVyXG4gICAgICpcbiAgICAgKiBJTVBPUlRBTlQ6IEFsd2F5cyBhdm9pZCBwb3J0IDQwOTYgdG8gcHJldmVudCBjb25mbGljdHMgd2l0aCB1c2VyJ3MgZXhpc3Rpbmcgc2VydmVyXG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgYXN5bmMgZ2V0QXZhaWxhYmxlUG9ydCgpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgZGVmYXVsdCBwb3J0IGlzIGluIHVzZSBhbmQgbG9nIGFjY29yZGluZ2x5XG4gICAgICAgICAgICBjb25zdCBkZWZhdWx0UG9ydCA9IDQwOTY7XG4gICAgICAgICAgICBjb25zdCBpc0RlZmF1bHRBdmFpbGFibGUgPVxuICAgICAgICAgICAgICAgIGF3YWl0IE9wZW5Db2RlQ2xpZW50LmlzUG9ydEF2YWlsYWJsZShkZWZhdWx0UG9ydCk7XG5cbiAgICAgICAgICAgIGlmICghaXNEZWZhdWx0QXZhaWxhYmxlKSB7XG4gICAgICAgICAgICAgICAgbG9nLmluZm8oXG4gICAgICAgICAgICAgICAgICAgIFwiRXhpc3Rpbmcgc2VydmVyIGRldGVjdGVkIG9uIHBvcnQgNDA5Njsgc3Bhd25pbmcgaXNvbGF0ZWQgc2VydmVyIG9uIGR5bmFtaWMgcG9ydFwiLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcbiAgICAgICAgICAgICAgICAgICAgXCJEZWZhdWx0IHBvcnQgNDA5NiBpcyBhdmFpbGFibGUgYnV0IGF2b2lkaW5nIGl0IGZvciBpc29sYXRpb25cIixcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBBbHdheXMgdXNlIGR5bmFtaWMgcG9ydCB0byBhdm9pZCBjb25mbGljdHMgd2l0aCB1c2VyJ3MgZXhpc3Rpbmcgc2VydmVyXG4gICAgICAgICAgICBjb25zdCBkeW5hbWljUG9ydCA9IGF3YWl0IE9wZW5Db2RlQ2xpZW50LmZpbmRBdmFpbGFibGVQb3J0KCk7XG4gICAgICAgICAgICBsb2cuaW5mbyhcbiAgICAgICAgICAgICAgICBgU3Bhd25pbmcgaXNvbGF0ZWQgc2VydmVyIG9uIGR5bmFtaWMgcG9ydDogJHtkeW5hbWljUG9ydH1gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHJldHVybiBkeW5hbWljUG9ydDtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTXNnID1cbiAgICAgICAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgICAgICBsb2cuZXJyb3IoXCJGYWlsZWQgdG8gc2VsZWN0IE9wZW5Db2RlIHNlcnZlciBwb3J0XCIsIHtcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JNc2csXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICBgRmFpbGVkIHRvIHNlbGVjdCBPcGVuQ29kZSBzZXJ2ZXIgcG9ydDogJHtlcnJvck1zZ31gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGEgc3BlY2lmaWMgcG9ydCBpcyBhdmFpbGFibGVcbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBhc3luYyBpc1BvcnRBdmFpbGFibGUocG9ydDogbnVtYmVyKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc2VydmVyID0gY3JlYXRlU2VydmVyKCk7XG5cbiAgICAgICAgICAgIHNlcnZlci5saXN0ZW4ocG9ydCwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHNlcnZlci5vbmNlKFwiY2xvc2VcIiwgKCkgPT4gcmVzb2x2ZSh0cnVlKSk7XG4gICAgICAgICAgICAgICAgc2VydmVyLmNsb3NlKCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc2VydmVyLm9uKFwiZXJyb3JcIiwgKCkgPT4gcmVzb2x2ZShmYWxzZSkpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGaW5kIGFuIGF2YWlsYWJsZSBwb3J0IGR5bmFtaWNhbGx5XG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgYXN5bmMgZmluZEF2YWlsYWJsZVBvcnQoKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNlcnZlciA9IGNyZWF0ZVNlcnZlcigpO1xuXG4gICAgICAgICAgICBzZXJ2ZXIubGlzdGVuKDAsICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBhZGRyZXNzID0gc2VydmVyLmFkZHJlc3MoKTtcbiAgICAgICAgICAgICAgICBpZiAoYWRkcmVzcyAmJiB0eXBlb2YgYWRkcmVzcyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgICAgICAgICBzZXJ2ZXIub25jZShcImNsb3NlXCIsICgpID0+IHJlc29sdmUoYWRkcmVzcy5wb3J0KSk7XG4gICAgICAgICAgICAgICAgICAgIHNlcnZlci5jbG9zZSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoXCJGYWlsZWQgdG8gZ2V0IHNlcnZlciBhZGRyZXNzXCIpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc2VydmVyLm9uKFwiZXJyb3JcIiwgcmVqZWN0KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU3RhdGljIGZhY3RvcnkgbWV0aG9kIHRvIGNyZWF0ZSBhbiBPcGVuQ29kZUNsaWVudFxuICAgICAqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBjbGllbnQgd2l0aCBlaXRoZXI6XG4gICAgICogMS4gQSBmcmVzaCBPcGVuQ29kZSBzZXJ2ZXIgKGRlZmF1bHQgYmVoYXZpb3IpXG4gICAgICogMi4gQW4gZXhpc3Rpbmcgc2VydmVyIFVSTCAoaWYgZXhpc3RpbmdTZXJ2ZXJVcmwgaXMgcHJvdmlkZWQpXG4gICAgICogMy4gQSBjdXN0b20gY2xpZW50IGluc3RhbmNlIChmb3IgdGVzdGluZylcbiAgICAgKlxuICAgICAqIE5vdGU6IFNwYXduZWQgT3BlbkNvZGUgc2VydmVycyB3aWxsIHVzZSB0byBjYWxsaW5nIGRpcmVjdG9yeSBieSBkZWZhdWx0IChwcm9jZXNzLmN3ZCgpKVxuICAgICAqIFVzZSBPUEVOQ09ERV9VUkwgdG8gY29ubmVjdCB0byBhIGRpZmZlcmVudCBPcGVuQ29kZSBpbnN0YW5jZVxuICAgICAqL1xuICAgIHN0YXRpYyBhc3luYyBjcmVhdGUoY29uZmlnOiBDbGllbnRDb25maWcgPSB7fSk6IFByb21pc2U8T3BlbkNvZGVDbGllbnQ+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIElmIGN1c3RvbSBjbGllbnQgcHJvdmlkZWQgKGZvciB0ZXN0aW5nKSwgdXNlIGl0IGRpcmVjdGx5XG4gICAgICAgICAgICBpZiAoY29uZmlnLmNsaWVudCkge1xuICAgICAgICAgICAgICAgIGxvZy5pbmZvKFwiQ3JlYXRpbmcgT3BlbkNvZGVDbGllbnQgd2l0aCBjdXN0b20gY2xpZW50IGluc3RhbmNlXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgT3BlbkNvZGVDbGllbnQoY29uZmlnLmNsaWVudCwgbnVsbCwgY29uZmlnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gSWYgZXhpc3Rpbmcgc2VydmVyIFVSTCBwcm92aWRlZCwgY29ubmVjdCB0byBpdFxuICAgICAgICAgICAgaWYgKGNvbmZpZy5leGlzdGluZ1NlcnZlclVybCkge1xuICAgICAgICAgICAgICAgIGxvZy5pbmZvKFwiQ29ubmVjdGluZyB0byBleGlzdGluZyBPcGVuQ29kZSBzZXJ2ZXJcIiwge1xuICAgICAgICAgICAgICAgICAgICB1cmw6IGNvbmZpZy5leGlzdGluZ1NlcnZlclVybCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjbGllbnQgPSBjcmVhdGVPcGVuY29kZUNsaWVudCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXNlVXJsOiBjb25maWcuZXhpc3RpbmdTZXJ2ZXJVcmwsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFZlcmlmeSBjb25uZWN0aW9uIGJ5IG1ha2luZyBhIHRlc3QgcmVxdWVzdFxuICAgICAgICAgICAgICAgICAgICBsb2cuZGVidWcoXCJWZXJpZnlpbmcgY29ubmVjdGlvbiB0byBleGlzdGluZyBzZXJ2ZXIuLi5cIik7XG4gICAgICAgICAgICAgICAgICAgIC8vIE5vdGU6IFdlJ2xsIHNraXAgdmVyaWZpY2F0aW9uIGZvciBub3cgdG8gYXZvaWQgdW5uZWNlc3NhcnkgQVBJIGNhbGxzXG4gICAgICAgICAgICAgICAgICAgIC8vIFRoZSBjb25uZWN0aW9uIHdpbGwgYmUgdmVyaWZpZWQgd2hlbiBmaXJzdCBzZXNzaW9uIGlzIGNyZWF0ZWRcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IE9wZW5Db2RlQ2xpZW50KGNsaWVudCwgbnVsbCwgY29uZmlnKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1zZyA9XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIGxvZy5lcnJvcihcIkZhaWxlZCB0byBjb25uZWN0IHRvIGV4aXN0aW5nIHNlcnZlclwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IGNvbmZpZy5leGlzdGluZ1NlcnZlclVybCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvck1zZyxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRGVmYXVsdDogc3Bhd24gYSBuZXcgT3BlbkNvZGUgc2VydmVyXG4gICAgICAgICAgICAvLyBOb3RlOiBTcGF3bmVkIHNlcnZlcnMgd2lsbCB1c2UgdG8gY2FsbGluZyBkaXJlY3RvcnkgYnkgZGVmYXVsdFxuICAgICAgICAgICAgLy8gVXNlIE9QRU5DT0RFX1VSTCB0byBjb25uZWN0IHRvIGEgZGlmZmVyZW50IE9wZW5Db2RlIGluc3RhbmNlXG4gICAgICAgICAgICBsb2cuaW5mbyhcIlNwYXduaW5nIG5ldyBPcGVuQ29kZSBzZXJ2ZXIuLi5cIiwge1xuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IGNvbmZpZy5zZXJ2ZXJTdGFydHVwVGltZW91dCB8fCAxMDAwMCxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjb25zdCBhdmFpbGFibGVQb3J0ID0gYXdhaXQgT3BlbkNvZGVDbGllbnQuZ2V0QXZhaWxhYmxlUG9ydCgpO1xuXG4gICAgICAgICAgICBjb25zdCB7IGNsaWVudCwgc2VydmVyIH0gPSBhd2FpdCBjcmVhdGVPcGVuY29kZSh7XG4gICAgICAgICAgICAgICAgdGltZW91dDogY29uZmlnLnNlcnZlclN0YXJ0dXBUaW1lb3V0IHx8IDEwMDAwLFxuICAgICAgICAgICAgICAgIHBvcnQ6IGF2YWlsYWJsZVBvcnQsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgbG9nLmluZm8oXCJPcGVuQ29kZSBzZXJ2ZXIgc3RhcnRlZCBzdWNjZXNzZnVsbHlcIik7XG4gICAgICAgICAgICByZXR1cm4gbmV3IE9wZW5Db2RlQ2xpZW50KGNsaWVudCwgc2VydmVyLCBjb25maWcpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNc2cgPVxuICAgICAgICAgICAgICAgIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgICAgIGxvZy5lcnJvcihcIkZhaWxlZCB0byBjcmVhdGUgT3BlbkNvZGVDbGllbnRcIiwgeyBlcnJvcjogZXJyb3JNc2cgfSk7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBjcmVhdGUgT3BlbkNvZGVDbGllbnQ6ICR7ZXJyb3JNc2d9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgT3BlbkNvZGUgc2Vzc2lvbiB3aXRoIGEgZ2l2ZW4gcHJvbXB0XG4gICAgICovXG4gICAgYXN5bmMgY3JlYXRlU2Vzc2lvbihwcm9tcHQ6IHN0cmluZyk6IFByb21pc2U8U2Vzc2lvbj4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gQ3JlYXRlIHNlc3Npb24gdXNpbmcgU0RLXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmNsaWVudC5zZXNzaW9uLmNyZWF0ZSh7XG4gICAgICAgICAgICAgICAgYm9keToge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZTogXCJhaS1lbmcgcmFscGggc2Vzc2lvblwiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYgKCFyZXN1bHQuZGF0YSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgYEZhaWxlZCB0byBjcmVhdGUgT3BlbkNvZGUgc2Vzc2lvbjogJHtKU09OLnN0cmluZ2lmeShyZXN1bHQuZXJyb3IpfWAsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3Qgc2RrU2Vzc2lvbiA9IHJlc3VsdC5kYXRhO1xuXG4gICAgICAgICAgICAvLyBEZWZlciB0aGUgaW5pdGlhbCBwcm9tcHQgdW50aWwgdGhlIGZpcnN0IG1lc3NhZ2UgaXMgc2VudC5cbiAgICAgICAgICAgIC8vIFRoaXMgYXZvaWRzIGJsb2NraW5nIHNlc3Npb24gY3JlYXRpb24gYW5kIGVuYWJsZXMgc3RyZWFtaW5nIG91dHB1dFxuICAgICAgICAgICAgLy8gZXZlbiB3aGVuIHRoZSBpbml0aWFsIHByb21wdCBpcyBsYXJnZSBvciBzbG93IHRvIHByb2Nlc3MuXG4gICAgICAgICAgICBsZXQgcGVuZGluZ0luaXRpYWxQcm9tcHQgPSBwcm9tcHQudHJpbSgpO1xuICAgICAgICAgICAgY29uc3QgYnVpbGRGaXJzdE1lc3NhZ2UgPSAobWVzc2FnZTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFwZW5kaW5nSW5pdGlhbFByb21wdCkgcmV0dXJuIG1lc3NhZ2U7XG4gICAgICAgICAgICAgICAgY29uc3QgY29tYmluZWQgPSBgJHtwZW5kaW5nSW5pdGlhbFByb21wdH1cXG5cXG4tLS1cXG5cXG4ke21lc3NhZ2V9YDtcbiAgICAgICAgICAgICAgICBwZW5kaW5nSW5pdGlhbFByb21wdCA9IFwiXCI7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbWJpbmVkO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8gSW5pdGlhbGl6ZSB0b29sIGludm9jYXRpb25zIHRyYWNrZXJcbiAgICAgICAgICAgIGNvbnN0IHRvb2xJbnZvY2F0aW9uczogU2Vzc2lvbltcIl90b29sSW52b2NhdGlvbnNcIl0gPSBbXTtcblxuICAgICAgICAgICAgLy8gV3JhcCB3aXRoIG91ciBzZXNzaW9uIGludGVyZmFjZVxuICAgICAgICAgICAgY29uc3Qgc2Vzc2lvbjogU2Vzc2lvbiA9IHtcbiAgICAgICAgICAgICAgICBpZDogc2RrU2Vzc2lvbi5pZCB8fCB0aGlzLmdlbmVyYXRlU2Vzc2lvbklkKCksXG4gICAgICAgICAgICAgICAgX3Rvb2xJbnZvY2F0aW9uczogdG9vbEludm9jYXRpb25zLFxuICAgICAgICAgICAgICAgIHNlbmRNZXNzYWdlOiBhc3luYyAobWVzc2FnZTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmhhbmRsZVNlbmRNZXNzYWdlKFxuICAgICAgICAgICAgICAgICAgICAgICAgc2RrU2Vzc2lvbi5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkRmlyc3RNZXNzYWdlKG1lc3NhZ2UpLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc2VuZE1lc3NhZ2VTdHJlYW06IGFzeW5jIChtZXNzYWdlOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaGFuZGxlU2VuZE1lc3NhZ2VTdHJlYW0oXG4gICAgICAgICAgICAgICAgICAgICAgICBzZGtTZXNzaW9uLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgYnVpbGRGaXJzdE1lc3NhZ2UobWVzc2FnZSksXG4gICAgICAgICAgICAgICAgICAgICAgICB0b29sSW52b2NhdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjbG9zZTogYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5oYW5kbGVTZXNzaW9uQ2xvc2Uoc2RrU2Vzc2lvbi5pZCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIFN0b3JlIGFjdGl2ZSBzZXNzaW9uXG4gICAgICAgICAgICB0aGlzLmFjdGl2ZVNlc3Npb25zLnNldChzZXNzaW9uLmlkLCBzZXNzaW9uKTtcblxuICAgICAgICAgICAgcmV0dXJuIHNlc3Npb247XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPVxuICAgICAgICAgICAgICAgIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICBgRmFpbGVkIHRvIGNyZWF0ZSBPcGVuQ29kZSBzZXNzaW9uOiAke2Vycm9yTWVzc2FnZX1gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNlbmQgYSBtZXNzYWdlIHRvIGFuIGV4aXN0aW5nIHNlc3Npb25cbiAgICAgKi9cbiAgICBhc3luYyBzZW5kTWVzc2FnZShcbiAgICAgICAgc2Vzc2lvbklkOiBzdHJpbmcsXG4gICAgICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgICApOiBQcm9taXNlPE1lc3NhZ2VSZXNwb25zZT4ge1xuICAgICAgICBjb25zdCBzZXNzaW9uID0gdGhpcy5hY3RpdmVTZXNzaW9ucy5nZXQoc2Vzc2lvbklkKTtcblxuICAgICAgICBpZiAoIXNlc3Npb24pIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgU2Vzc2lvbiBub3QgZm91bmQ6ICR7c2Vzc2lvbklkfWApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuaGFuZGxlU2VuZE1lc3NhZ2Uoc2Vzc2lvbklkLCBtZXNzYWdlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDbG9zZSBhbiBhY3RpdmUgc2Vzc2lvblxuICAgICAqL1xuICAgIGFzeW5jIGNsb3NlU2Vzc2lvbihzZXNzaW9uSWQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCBzZXNzaW9uID0gdGhpcy5hY3RpdmVTZXNzaW9ucy5nZXQoc2Vzc2lvbklkKTtcblxuICAgICAgICBpZiAoIXNlc3Npb24pIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgU2Vzc2lvbiBub3QgZm91bmQ6ICR7c2Vzc2lvbklkfWApO1xuICAgICAgICB9XG5cbiAgICAgICAgYXdhaXQgdGhpcy5oYW5kbGVTZXNzaW9uQ2xvc2Uoc2Vzc2lvbklkKTtcbiAgICAgICAgdGhpcy5hY3RpdmVTZXNzaW9ucy5kZWxldGUoc2Vzc2lvbklkKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgYWxsIGFjdGl2ZSBzZXNzaW9uIElEc1xuICAgICAqL1xuICAgIGdldEFjdGl2ZVNlc3Npb25zKCk6IHN0cmluZ1tdIHtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5hY3RpdmVTZXNzaW9ucy5rZXlzKCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGEgc2Vzc2lvbiBpcyBhY3RpdmVcbiAgICAgKi9cbiAgICBpc1Nlc3Npb25BY3RpdmUoc2Vzc2lvbklkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWN0aXZlU2Vzc2lvbnMuaGFzKHNlc3Npb25JZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xvc2UgYWxsIGFjdGl2ZSBzZXNzaW9uc1xuICAgICAqL1xuICAgIGFzeW5jIGNsb3NlQWxsU2Vzc2lvbnMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGNvbnN0IGNsb3NlUHJvbWlzZXMgPSBBcnJheS5mcm9tKHRoaXMuYWN0aXZlU2Vzc2lvbnMua2V5cygpKS5tYXAoXG4gICAgICAgICAgICAoc2Vzc2lvbklkKSA9PlxuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlU2Vzc2lvbkNsb3NlKHNlc3Npb25JZCkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTXNnID1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgbG9nLndhcm4oXCJFcnJvciBjbG9zaW5nIHNlc3Npb25cIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yTXNnLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgKTtcblxuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChjbG9zZVByb21pc2VzKTtcbiAgICAgICAgdGhpcy5hY3RpdmVTZXNzaW9ucy5jbGVhcigpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEhhbmRsZSBzZW5kaW5nIGEgbWVzc2FnZSB3aXRoIHN0cmVhbWluZyBzdXBwb3J0XG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyBoYW5kbGVTZW5kTWVzc2FnZVN0cmVhbShcbiAgICAgICAgc2Vzc2lvbklkOiBzdHJpbmcsXG4gICAgICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgICAgICAgdG9vbEludm9jYXRpb25zPzogU2Vzc2lvbltcIl90b29sSW52b2NhdGlvbnNcIl0sXG4gICAgKTogUHJvbWlzZTxTdHJlYW1pbmdSZXNwb25zZT4ge1xuICAgICAgICBsZXQgbGFzdEVycm9yOiBFcnJvciB8IG51bGwgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0IHN1cHBvcnRzRXZlbnRTdHJlYW1pbmcgPVxuICAgICAgICAgICAgdHlwZW9mICh0aGlzLmNsaWVudCBhcyBhbnkpPy5zZXNzaW9uPy5wcm9tcHRBc3luYyA9PT0gXCJmdW5jdGlvblwiICYmXG4gICAgICAgICAgICB0eXBlb2YgKHRoaXMuY2xpZW50IGFzIGFueSk/LmV2ZW50Py5zdWJzY3JpYmUgPT09IFwiZnVuY3Rpb25cIjtcblxuICAgICAgICBmb3IgKGxldCBhdHRlbXB0ID0gMTsgYXR0ZW1wdCA8PSB0aGlzLnJldHJ5QXR0ZW1wdHM7IGF0dGVtcHQrKykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgYSBUcmFuc2Zvcm1TdHJlYW0gdG8gaGFuZGxlIHRoZSBzdHJlYW1pbmcgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICBjb25zdCBzdHJlYW0gPSBuZXcgVHJhbnNmb3JtU3RyZWFtPFVpbnQ4QXJyYXksIFVpbnQ4QXJyYXk+KCk7XG4gICAgICAgICAgICAgICAgY29uc3Qgd3JpdGVyID0gc3RyZWFtLndyaXRhYmxlLmdldFdyaXRlcigpO1xuXG4gICAgICAgICAgICAgICAgLy8gVHJhY2sgZmluYWxpemF0aW9uIHRvIHByZXZlbnQgZG91YmxlLWNsb3NlL2Fib3J0XG4gICAgICAgICAgICAgICAgbGV0IGZpbmFsaXplZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNsb3NlT25jZSA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbmFsaXplZCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICBmaW5hbGl6ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgd3JpdGVyLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWdub3JlIGVycm9ycyBkdXJpbmcgY2xvc2VcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgY29uc3QgYWJvcnRPbmNlID0gYXN5bmMgKGVycjogdW5rbm93bikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZmluYWxpemVkKSByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIGZpbmFsaXplZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB3cml0ZXIuYWJvcnQoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZ25vcmUgZXJyb3JzIGR1cmluZyBhYm9ydFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIC8vIEZhbGxiYWNrOiBpZiB0aGUgY2xpZW50IGRvZXNuJ3Qgc3VwcG9ydCBwcm9tcHRfYXN5bmMgKyBTU0UsIGtlZXAgdGhlXG4gICAgICAgICAgICAgICAgLy8gbGVnYWN5IGJlaGF2aW9yIChidWZmZXIgdGhlbiBzaW11bGF0ZSBzdHJlYW1pbmcpLlxuICAgICAgICAgICAgICAgIGlmICghc3VwcG9ydHNFdmVudFN0cmVhbWluZykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm9tcHRQcm9taXNlID0gdGhpcy5jbGllbnQuc2Vzc2lvbi5wcm9tcHQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgYm9keToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VJRDogdGhpcy5nZW5lcmF0ZU1lc3NhZ2VJZCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwidGV4dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogbWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXJ5OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0b3J5OiB0aGlzLmRpcmVjdG9yeSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIH0gYXMgYW55KTtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdHJlYW1pbmdUYXNrID0gKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcHJvbXB0UHJvbWlzZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcmVzdWx0LmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYEludmFsaWQgcmVzcG9uc2UgZnJvbSBPcGVuQ29kZTogJHtKU09OLnN0cmluZ2lmeShyZXN1bHQuZXJyb3IpfWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSByZXN1bHQuZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0ZXh0UGFydCA9IHJlc3BvbnNlLnBhcnRzPy5maW5kKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAocGFydDogYW55KSA9PiBwYXJ0LnR5cGUgPT09IFwidGV4dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmaW5hbENvbnRlbnQgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAodGV4dFBhcnQgYXMgYW55KT8udGV4dCB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIk5vIGNvbnRlbnQgcmVjZWl2ZWRcIjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNpbXVsYXRlIHN0cmVhbWluZyBieSB3cml0aW5nIGNodW5rc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNodW5rcyA9IHRoaXMuc3BsaXRJbnRvQ2h1bmtzKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaW5hbENvbnRlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDEwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZW5jb2RlciA9IG5ldyBUZXh0RW5jb2RlcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgY2h1bmsgb2YgY2h1bmtzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHdyaXRlci53cml0ZShlbmNvZGVyLmVuY29kZShjaHVuaykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQocmVzb2x2ZSwgNTApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IGNsb3NlT25jZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7IGNvbnRlbnQ6IGZpbmFsQ29udGVudCB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBhYm9ydE9uY2UoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KSgpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJlYW06IHN0cmVhbS5yZWFkYWJsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlOiBzdHJlYW1pbmdUYXNrLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIFJlYWwgc3RyZWFtaW5nOiB1c2UgcHJvbXB0X2FzeW5jIGFuZCBjb25zdW1lIHRoZSBldmVudCBTU0Ugc3RyZWFtLlxuICAgICAgICAgICAgICAgIGNvbnN0IGVuY29kZXIgPSBuZXcgVGV4dEVuY29kZXIoKTtcbiAgICAgICAgICAgICAgICBjb25zdCBpZGxlVGltZW91dEVycm9yID0gbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICAgICBgUHJvbXB0IGlkbGUgdGltZW91dCBhZnRlciAke3RoaXMucHJvbXB0VGltZW91dH1tc2AsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBjb25zdCBoYXJkVGltZW91dEVycm9yID0gbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICAgICBgUHJvbXB0IGhhcmQgdGltZW91dCBhZnRlciAke3RoaXMucHJvbXB0VGltZW91dCAqIDV9bXNgLFxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBjb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgICAgICAgICAgICAgIGxldCBpZGxlVGltZXI6IFJldHVyblR5cGU8dHlwZW9mIHNldFRpbWVvdXQ+IHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIGxldCBoYXJkVGltZXI6IFJldHVyblR5cGU8dHlwZW9mIHNldFRpbWVvdXQ+IHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIGxldCBieXRlc1dyaXR0ZW4gPSAwO1xuICAgICAgICAgICAgICAgIGxldCBsYXN0UHJvZ3Jlc3NUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgICAgICBsZXQgaWRsZVRpbWVkT3V0ID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAvLyBIYXJkIHRpbWVvdXQgLSBuZXZlciByZXNldHNcbiAgICAgICAgICAgICAgICBjb25zdCBzdGFydEhhcmRUaW1lciA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhhcmRUaW1lcikgY2xlYXJUaW1lb3V0KGhhcmRUaW1lcik7XG4gICAgICAgICAgICAgICAgICAgIGhhcmRUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nLndhcm4oXCJIYXJkIHRpbWVvdXQgcmVhY2hlZCwgYWJvcnRpbmdcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0TXM6IHRoaXMucHJvbXB0VGltZW91dCAqIDUsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlci5hYm9ydChoYXJkVGltZW91dEVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlnbm9yZVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LCB0aGlzLnByb21wdFRpbWVvdXQgKiA1KTsgLy8gNXggaWRsZSB0aW1lb3V0IGFzIGhhcmQgY2VpbGluZ1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAvLyBJZGxlIHRpbWVyIC0gcmVzZXRzIG9ubHkgb24gcmVsZXZhbnQgcHJvZ3Jlc3NcbiAgICAgICAgICAgICAgICBjb25zdCByZXNldElkbGVUaW1lciA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlkbGVUaW1lcikgY2xlYXJUaW1lb3V0KGlkbGVUaW1lcik7XG4gICAgICAgICAgICAgICAgICAgIGlkbGVUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWRsZVRpbWVkT3V0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZy53YXJuKFwiSWRsZSB0aW1lb3V0IHJlYWNoZWQsIGFib3J0aW5nXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dE1zOiB0aGlzLnByb21wdFRpbWVvdXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnl0ZXNXcml0dGVuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RQcm9ncmVzc01zQWdvOiBEYXRlLm5vdygpIC0gbGFzdFByb2dyZXNzVGltZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyLmFib3J0KGlkbGVUaW1lb3V0RXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWdub3JlXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sIHRoaXMucHJvbXB0VGltZW91dCk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHN0cmVhbWluZ1Rhc2sgPSAoYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRIYXJkVGltZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc2V0SWRsZVRpbWVyKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJNZXNzYWdlSWQgPSB0aGlzLmdlbmVyYXRlTWVzc2FnZUlkKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcIlNlbmRpbmcgcHJvbXB0IHRvIE9wZW5Db2RlXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUxlbmd0aDogbWVzc2FnZS5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlck1lc3NhZ2VJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCAodGhpcy5jbGllbnQgYXMgYW55KS5zZXNzaW9uLnByb21wdEFzeW5jKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBib2R5OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VJRDogdXNlck1lc3NhZ2VJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcInRleHRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBtZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXJ5OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdG9yeTogdGhpcy5kaXJlY3RvcnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaWduYWw6IGNvbnRyb2xsZXIuc2lnbmFsLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcIlN1YnNjcmliaW5nIHRvIGV2ZW50c1wiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdG9yeTogdGhpcy5kaXJlY3RvcnksXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXZlbnRzUmVzdWx0ID0gYXdhaXQgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2xpZW50IGFzIGFueVxuICAgICAgICAgICAgICAgICAgICAgICAgKS5ldmVudC5zdWJzY3JpYmUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXJ5OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdG9yeTogdGhpcy5kaXJlY3RvcnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaWduYWw6IGNvbnRyb2xsZXIuc2lnbmFsLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBhc3Npc3RhbnRNZXNzYWdlSWQ6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNvbnRlbnQgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGVtaXR0ZWRUZXh0ID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBldmVudENvdW50ID0gMDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmRlYnVnKFwiU3RhcnRpbmcgZXZlbnQgc3RyZWFtIHByb2Nlc3NpbmdcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgYXdhaXQgKGNvbnN0IGV2ZW50IG9mIGV2ZW50c1Jlc3VsdC5zdHJlYW0gYXMgQXN5bmNHZW5lcmF0b3I8YW55Pikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50Q291bnQrKztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFZlcmJvc2UgZGVidWcgbG9nZ2luZyBmb3IgYWxsIGV2ZW50c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcIlJlY2VpdmVkIGV2ZW50XCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudFR5cGU6IGV2ZW50Py50eXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudENvdW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNQcm9wZXJ0aWVzOiAhIWV2ZW50Py5wcm9wZXJ0aWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyQWJvcnRlZDogY29udHJvbGxlci5zaWduYWwuYWJvcnRlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb250cm9sbGVyLnNpZ25hbC5hYm9ydGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQ29udHJvbGxlciBhYm9ydGVkLCBicmVha2luZyBldmVudCBsb29wXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50Q291bnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWV2ZW50IHx8IHR5cGVvZiBldmVudCAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZGVidWcoXCJTa2lwcGluZyBub24tb2JqZWN0IGV2ZW50XCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50Q291bnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXZlbnQudHlwZSA9PT0gXCJtZXNzYWdlLnVwZGF0ZWRcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbmZvID0gKGV2ZW50IGFzIGFueSkucHJvcGVydGllcz8uaW5mbztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZGVidWcoXCJNZXNzYWdlIHVwZGF0ZWQgZXZlbnRcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRDb3VudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm9Sb2xlOiBpbmZvPy5yb2xlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mb1Nlc3Npb25JZDogaW5mbz8uc2Vzc2lvbklELFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mb1BhcmVudElkOiBpbmZvPy5wYXJlbnRJRCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm9JZDogaW5mbz8uaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1JlbGV2YW50U2Vzc2lvbjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvPy5zZXNzaW9uSUQgPT09IHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzQXNzaXN0YW50OiBpbmZvPy5yb2xlID09PSBcImFzc2lzdGFudFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNSZXBseVRvVXNlcjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvPy5wYXJlbnRJRCA9PT0gdXNlck1lc3NhZ2VJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUHJpbWFyeSBpZGVudGlmaWNhdGlvbjogZXhhY3QgbWF0Y2ggb24gcGFyZW50SURcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mbz8ucm9sZSA9PT0gXCJhc3Npc3RhbnRcIiAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mbz8uc2Vzc2lvbklEID09PSBzZXNzaW9uSWQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8/LnBhcmVudElEID09PSB1c2VyTWVzc2FnZUlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzaXN0YW50TWVzc2FnZUlkID0gaW5mby5pZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIklkZW50aWZpZWQgYXNzaXN0YW50IG1lc3NhZ2UgKGV4YWN0IHBhcmVudElEIG1hdGNoKVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3Npc3RhbnRNZXNzYWdlSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmFsbGJhY2s6IGlmIHdlIGhhdmVuJ3QgaWRlbnRpZmllZCBhbiBhc3Npc3RhbnQgbWVzc2FnZSB5ZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFjY2VwdCBhc3Npc3RhbnQgbWVzc2FnZXMgaW4gdGhlIHNhbWUgc2Vzc2lvbiBldmVuIGlmIHBhcmVudElEIGRvZXNuJ3QgbWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBoYW5kbGVzIGNhc2VzIHdoZXJlIHBhcmVudElEIGlzIHVuZGVmaW5lZCBvciBoYXMgYSBkaWZmZXJlbnQgZm9ybWF0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIWFzc2lzdGFudE1lc3NhZ2VJZCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mbz8ucm9sZSA9PT0gXCJhc3Npc3RhbnRcIiAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mbz8uc2Vzc2lvbklEID09PSBzZXNzaW9uSWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZGVidWcoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJJZGVudGlmaWVkIGFzc2lzdGFudCBtZXNzYWdlIChmYWxsYmFjayAtIG5vIGV4YWN0IHBhcmVudElEIG1hdGNoKVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3Npc3RhbnRNZXNzYWdlSWQ6IGluZm8uaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm9QYXJlbnRJZDogaW5mbz8ucGFyZW50SUQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJNZXNzYWdlSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3Npc3RhbnRNZXNzYWdlSWQgPSBpbmZvLmlkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUmVzZXQgaWRsZSB0aW1lciBvbiBBTlkgYXNzaXN0YW50IG1lc3NhZ2UgYWN0aXZpdHlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBwcmV2ZW50cyB0aW1lb3V0cyB3aGVuIGNvcnJlbGF0aW9uIGlzIGFtYmlndW91c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvPy5yb2xlID09PSBcImFzc2lzdGFudFwiICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvPy5zZXNzaW9uSUQgPT09IHNlc3Npb25JZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RQcm9ncmVzc1RpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzZXRJZGxlVGltZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2lzdGFudE1lc3NhZ2VJZCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mbz8uaWQgPT09IGFzc2lzdGFudE1lc3NhZ2VJZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmZvPy5lcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVyck5hbWUgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvLmVycm9yLm5hbWUgfHwgXCJPcGVuQ29kZUVycm9yXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyTXNnID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mby5lcnJvci5kYXRhPy5tZXNzYWdlIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mby5lcnJvci5kYXRhIHx8IHt9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5lcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJBc3Npc3RhbnQgZXJyb3IgaW4gbWVzc2FnZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck5hbWU6IGVyck5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVyck1zZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7ZXJyTmFtZX06ICR7ZXJyTXNnfWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZm8/LnRpbWU/LmNvbXBsZXRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJBc3Npc3RhbnQgbWVzc2FnZSBjb21wbGV0ZWRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzaXN0YW50TWVzc2FnZUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGVkQXQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mby50aW1lLmNvbXBsZXRlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09IFwibWVzc2FnZS5wYXJ0LnVwZGF0ZWRcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBPbmx5IHJlc2V0IHRpbWVyIGFuZCB0cmFjayBwcm9ncmVzcyBmb3IgcmVsZXZhbnQgdXBkYXRlc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJ0ID0gKGV2ZW50IGFzIGFueSkucHJvcGVydGllc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPy5wYXJ0IGFzIGFueTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZGVidWcoXCJNZXNzYWdlIHBhcnQgdXBkYXRlZFwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudENvdW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzUGFydDogISFwYXJ0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydFR5cGU6IHBhcnQ/LnR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0U2Vzc2lvbklkOiBwYXJ0Py5zZXNzaW9uSUQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0TWVzc2FnZUlkOiBwYXJ0Py5tZXNzYWdlSUQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3Npc3RhbnRNZXNzYWdlSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1JlbGV2YW50OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2lzdGFudE1lc3NhZ2VJZCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnQ/LnNlc3Npb25JRCA9PT0gc2Vzc2lvbklkICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydD8ubWVzc2FnZUlEID09PSBhc3Npc3RhbnRNZXNzYWdlSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghYXNzaXN0YW50TWVzc2FnZUlkKSBjb250aW51ZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBIYW5kbGUgdG9vbCBwYXJ0cyAoY2FwdHVyZSB0b29sIGludm9jYXRpb25zKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFydD8udHlwZSA9PT0gXCJ0b29sXCIgJiYgdG9vbEludm9jYXRpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0b29sSWQgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnQudG9vbElkIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydC5pZCB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGB0b29sLSR7ZXZlbnRDb3VudH1gO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdG9vbE5hbWUgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnQudG9vbE5hbWUgfHwgcGFydC5uYW1lIHx8IFwidW5rbm93blwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdG9vbElucHV0ID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0LmlucHV0IHx8IHBhcnQucGFyYW1ldGVycyB8fCB7fTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdGhpcyBpcyBhIG5ldyB0b29sIGNhbGwgb3IgYW4gdXBkYXRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBleGlzdGluZ1Rvb2xJbmRleCA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbEludm9jYXRpb25zLmZpbmRJbmRleChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHQpID0+IHQuaWQgPT09IHRvb2xJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXhpc3RpbmdUb29sSW5kZXggPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSBleGlzdGluZyB0b29sIGludm9jYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBleGlzdGluZyA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xJbnZvY2F0aW9uc1tleGlzdGluZ1Rvb2xJbmRleF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhpc3Rpbmcub3V0cHV0ID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydC5yZXN1bHQgPz9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydC5vdXRwdXQgPz9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhpc3Rpbmcub3V0cHV0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nLnN0YXR1cyA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnQuc3RhdHVzID09PSBcImVycm9yXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gXCJlcnJvclwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFwib2tcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleGlzdGluZy5lcnJvciA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnQuZXJyb3IgPz8gZXhpc3RpbmcuZXJyb3I7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhpc3RpbmcuY29tcGxldGVkQXQgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0LmNvbXBsZXRlZEF0ID8/IG5vdztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcIlRvb2wgaW52b2NhdGlvbiB1cGRhdGVkXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IGV4aXN0aW5nLnN0YXR1cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTmV3IHRvb2wgaW52b2NhdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRvb2xJbnZvY2F0aW9uID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogdG9vbElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiB0b29sTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQ6IHRvb2xJbnB1dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0OiBwYXJ0LnJlc3VsdCA/PyBwYXJ0Lm91dHB1dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydC5zdGF0dXMgPT09IFwiZXJyb3JcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gKFwiZXJyb3JcIiBhcyBjb25zdClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IChcIm9rXCIgYXMgY29uc3QpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogcGFydC5lcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRlZEF0OiBwYXJ0LnN0YXJ0ZWRBdCA/PyBub3csXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlZEF0OiBwYXJ0LmNvbXBsZXRlZEF0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbEludm9jYXRpb25zLnB1c2godG9vbEludm9jYXRpb24pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmRlYnVnKFwiVG9vbCBpbnZvY2F0aW9uIHN0YXJ0ZWRcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbE5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0OiBKU09OLnN0cmluZ2lmeShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xJbnB1dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKS5zbGljZSgwLCAyMDApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBEb24ndCBza2lwIG5vbi1yZWxldmFudCB0b29sIHBhcnRzIC0gd2Ugd2FudCB0byBjYXB0dXJlIGFsbCB0b29sIGV2ZW50c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZm9yIHRoZSBhc3Npc3RhbnQgbWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnQuc2Vzc2lvbklEICE9PSBzZXNzaW9uSWQgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0Lm1lc3NhZ2VJRCAhPT0gYXNzaXN0YW50TWVzc2FnZUlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTdGlsbCB0cmFjayBpdCBidXQgZG9uJ3QgcHJvY2VzcyBmb3Igb3V0cHV0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJlc2V0IGlkbGUgdGltZXIgb24gdG9vbCBwcm9ncmVzc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RQcm9ncmVzc1RpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc2V0SWRsZVRpbWVyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFwYXJ0IHx8IHBhcnQudHlwZSAhPT0gXCJ0ZXh0XCIpIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFydC5zZXNzaW9uSUQgIT09IHNlc3Npb25JZCkgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYXJ0Lm1lc3NhZ2VJRCAhPT0gYXNzaXN0YW50TWVzc2FnZUlkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmF3RGVsdGEgPSAoZXZlbnQgYXMgYW55KS5wcm9wZXJ0aWVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/LmRlbHRhO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBkZWx0YVRleHQ6IHN0cmluZyB8IHVuZGVmaW5lZDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBQcmVmZXIgZGlmZmluZyBhZ2FpbnN0IHRoZSBmdWxsIGBwYXJ0LnRleHRgIHdoZW4gcHJlc2VudC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU29tZSBPcGVuQ29kZSBzZXJ2ZXIgdmVyc2lvbnMgZW1pdCBtdWx0aXBsZSB0ZXh0IHBhcnRzIG9yIHNlbmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYGRlbHRhYCBhcyB0aGUgKmZ1bGwqIHRleHQsIHdoaWNoIHdvdWxkIGR1cGxpY2F0ZSBvdXRwdXQuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcGFydC50ZXh0ID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXh0ID0gcGFydC50ZXh0O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV4dC5zdGFydHNXaXRoKGVtaXR0ZWRUZXh0KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbHRhVGV4dCA9IG5leHQuc2xpY2UoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVtaXR0ZWRUZXh0Lmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVtaXR0ZWRUZXh0ID0gbmV4dDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZW1pdHRlZFRleHQuc3RhcnRzV2l0aChuZXh0KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFN0YWxlL2R1cGxpY2F0ZSB1cGRhdGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWx0YVRleHQgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGYWxsYmFjazogdHJlYXQgYXMgYWRkaXRpdmUgY2h1bmtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWx0YVRleHQgPSBuZXh0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVtaXR0ZWRUZXh0ICs9IG5leHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHJhd0RlbHRhID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWx0YVRleHQgPSByYXdEZWx0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVtaXR0ZWRUZXh0ICs9IHJhd0RlbHRhO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFkZWx0YVRleHQpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSBwcm9ncmVzcyB0cmFja2luZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0UHJvZ3Jlc3NUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnl0ZXNXcml0dGVuICs9IGRlbHRhVGV4dC5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc2V0SWRsZVRpbWVyKCk7IC8vIE9ubHkgcmVzZXQgb24gYWN0dWFsIGNvbnRlbnQgcHJvZ3Jlc3NcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZGVidWcoXCJXcml0aW5nIGRlbHRhIHRvIHN0cmVhbVwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWx0YUxlbmd0aDogZGVsdGFUZXh0Lmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsQnl0ZXNXcml0dGVuOiBieXRlc1dyaXR0ZW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50TGVuZ3RoOiBjb250ZW50Lmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudCArPSBkZWx0YVRleHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHdyaXRlci53cml0ZShlbmNvZGVyLmVuY29kZShkZWx0YVRleHQpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcIkV2ZW50IHN0cmVhbSBlbmRlZFwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50Q291bnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxCeXRlc1dyaXR0ZW46IGJ5dGVzV3JpdHRlbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50TGVuZ3RoOiBjb250ZW50Lmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyQWJvcnRlZDogY29udHJvbGxlci5zaWduYWwuYWJvcnRlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZGxlVGltZWRPdXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzaXN0YW50TWVzc2FnZUlkRm91bmQ6ICEhYXNzaXN0YW50TWVzc2FnZUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IGNsb3NlT25jZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBjb250ZW50IHx8IFwiTm8gY29udGVudCByZWNlaXZlZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpYWdub3N0aWNzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ5dGVzV3JpdHRlbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudExlbmd0aDogY29udGVudC5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkbGVUaW1lZE91dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzaXN0YW50TWVzc2FnZUlkRm91bmQ6ICEhYXNzaXN0YW50TWVzc2FnZUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudENvdW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmVycm9yKFwiU3RyZWFtaW5nIHRhc2sgZXJyb3JcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBFcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBlcnJvci5tZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFN0cmluZyhlcnJvciksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlckFib3J0ZWQ6IGNvbnRyb2xsZXIuc2lnbmFsLmFib3J0ZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnl0ZXNXcml0dGVuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkbGVUaW1lZE91dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3Npc3RhbnRNZXNzYWdlSWRGb3VuZDogISFhc3Npc3RhbnRNZXNzYWdlSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIHdlIGFib3J0ZWQsIG5vcm1hbGl6ZSB0byBvdXIgdGltZW91dCBlcnJvciBBTkQgZW5zdXJlIHN0cmVhbSBpcyBmaW5hbGl6ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb250cm9sbGVyLnNpZ25hbC5hYm9ydGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgYWJvcnRPbmNlKGlkbGVUaW1lb3V0RXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGlkbGVUaW1lb3V0RXJyb3I7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBhYm9ydE9uY2UoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgICAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaWRsZVRpbWVyKSBjbGVhclRpbWVvdXQoaWRsZVRpbWVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChoYXJkVGltZXIpIGNsZWFyVGltZW91dChoYXJkVGltZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWNvbnRyb2xsZXIuc2lnbmFsLmFib3J0ZWQpIGNvbnRyb2xsZXIuYWJvcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlnbm9yZVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSkoKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN0cmVhbTogc3RyZWFtLnJlYWRhYmxlLFxuICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZTogc3RyZWFtaW5nVGFzayxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBsYXN0RXJyb3IgPVxuICAgICAgICAgICAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IgOiBuZXcgRXJyb3IoU3RyaW5nKGVycm9yKSk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBpc1JhdGVMaW1pdCA9IHRoaXMuaXNSYXRlTGltaXRFcnJvcihsYXN0RXJyb3IpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGF0dGVtcHQgPT09IHRoaXMucmV0cnlBdHRlbXB0cykge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb25zdCBkZWxheSA9IHRoaXMuZ2V0QmFja29mZkRlbGF5KGF0dGVtcHQsIGlzUmF0ZUxpbWl0KTtcblxuICAgICAgICAgICAgICAgIGxvZy53YXJuKFwiT3BlbkNvZGUgYXR0ZW1wdCBmYWlsZWQ7IHJldHJ5aW5nXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgYXR0ZW1wdCxcbiAgICAgICAgICAgICAgICAgICAgcmV0cnlBdHRlbXB0czogdGhpcy5yZXRyeUF0dGVtcHRzLFxuICAgICAgICAgICAgICAgICAgICBkZWxheU1zOiBkZWxheSxcbiAgICAgICAgICAgICAgICAgICAgaXNSYXRlTGltaXQsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBsYXN0RXJyb3IubWVzc2FnZSxcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIGRlbGF5KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgRmFpbGVkIHRvIHN0cmVhbSBtZXNzYWdlIGFmdGVyICR7dGhpcy5yZXRyeUF0dGVtcHRzfSBhdHRlbXB0czogJHtsYXN0RXJyb3I/Lm1lc3NhZ2UgfHwgXCJVbmtub3duIGVycm9yXCJ9YCxcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTcGxpdCB0ZXh0IGludG8gY2h1bmtzIGZvciBzdHJlYW1pbmcgc2ltdWxhdGlvblxuICAgICAqL1xuICAgIHByaXZhdGUgc3BsaXRJbnRvQ2h1bmtzKHRleHQ6IHN0cmluZywgY2h1bmtTaXplOiBudW1iZXIpOiBzdHJpbmdbXSB7XG4gICAgICAgIGNvbnN0IGNodW5rczogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0ZXh0Lmxlbmd0aDsgaSArPSBjaHVua1NpemUpIHtcbiAgICAgICAgICAgIGNodW5rcy5wdXNoKHRleHQuc2xpY2UoaSwgaSArIGNodW5rU2l6ZSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjaHVua3MubGVuZ3RoID4gMCA/IGNodW5rcyA6IFt0ZXh0XTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBIYW5kbGUgc2VuZGluZyBhIG1lc3NhZ2Ugd2l0aCBlcnJvciBoYW5kbGluZyBhbmQgcmV0cmllc1xuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgaGFuZGxlU2VuZE1lc3NhZ2UoXG4gICAgICAgIHNlc3Npb25JZDogc3RyaW5nLFxuICAgICAgICBtZXNzYWdlOiBzdHJpbmcsXG4gICAgKTogUHJvbWlzZTxNZXNzYWdlUmVzcG9uc2U+IHtcbiAgICAgICAgbGV0IGxhc3RFcnJvcjogRXJyb3IgfCBudWxsID0gbnVsbDtcblxuICAgICAgICBmb3IgKGxldCBhdHRlbXB0ID0gMTsgYXR0ZW1wdCA8PSB0aGlzLnJldHJ5QXR0ZW1wdHM7IGF0dGVtcHQrKykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCB0aW1lb3V0RXJyb3IgPSBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgIGBQcm9tcHQgdGltZW91dCBhZnRlciAke3RoaXMucHJvbXB0VGltZW91dH1tc2AsXG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgdGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXIuYWJvcnQodGltZW91dEVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpZ25vcmVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIHRoaXMucHJvbXB0VGltZW91dCk7XG5cbiAgICAgICAgICAgICAgICBsZXQgcmVzdWx0OiBhbnk7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gYXdhaXQgdGhpcy5jbGllbnQuc2Vzc2lvbi5wcm9tcHQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgYm9keToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VJRDogdGhpcy5nZW5lcmF0ZU1lc3NhZ2VJZCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwidGV4dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogbWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXJ5OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0b3J5OiB0aGlzLmRpcmVjdG9yeSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBzaWduYWw6IGNvbnRyb2xsZXIuc2lnbmFsLFxuICAgICAgICAgICAgICAgICAgICB9IGFzIGFueSk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbnRyb2xsZXIuc2lnbmFsLmFib3J0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IHRpbWVvdXRFcnJvcjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICghcmVzdWx0LmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgYEludmFsaWQgcmVzcG9uc2UgZnJvbSBPcGVuQ29kZTogJHtKU09OLnN0cmluZ2lmeShyZXN1bHQuZXJyb3IpfWAsXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gRXh0cmFjdCBjb250ZW50IGZyb20gcmVzcG9uc2VcbiAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IHJlc3VsdC5kYXRhO1xuXG4gICAgICAgICAgICAgICAgLy8gRmluZCB0ZXh0IGNvbnRlbnQgZnJvbSByZXNwb25zZSBwYXJ0c1xuICAgICAgICAgICAgICAgIGNvbnN0IHRleHRQYXJ0ID0gcmVzcG9uc2UucGFydHM/LmZpbmQoXG4gICAgICAgICAgICAgICAgICAgIChwYXJ0OiBhbnkpID0+IHBhcnQudHlwZSA9PT0gXCJ0ZXh0XCIsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICByZXR1cm4geyBjb250ZW50OiB0ZXh0UGFydD8udGV4dCB8fCBcIk5vIGNvbnRlbnQgcmVjZWl2ZWRcIiB9O1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBsYXN0RXJyb3IgPVxuICAgICAgICAgICAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IgOiBuZXcgRXJyb3IoU3RyaW5nKGVycm9yKSk7XG5cbiAgICAgICAgICAgICAgICAvLyBDaGVjayBpZiB0aGlzIGlzIGEgcmF0ZSBsaW1pdCBlcnJvclxuICAgICAgICAgICAgICAgIGNvbnN0IGlzUmF0ZUxpbWl0ID0gdGhpcy5pc1JhdGVMaW1pdEVycm9yKGxhc3RFcnJvcik7XG5cbiAgICAgICAgICAgICAgICBpZiAoYXR0ZW1wdCA9PT0gdGhpcy5yZXRyeUF0dGVtcHRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIFdhaXQgYmVmb3JlIHJldHJ5aW5nIHdpdGggZXhwb25lbnRpYWwgYmFja29mZlxuICAgICAgICAgICAgICAgIGNvbnN0IGRlbGF5ID0gdGhpcy5nZXRCYWNrb2ZmRGVsYXkoYXR0ZW1wdCwgaXNSYXRlTGltaXQpO1xuXG4gICAgICAgICAgICAgICAgbG9nLndhcm4oXCJPcGVuQ29kZSBhdHRlbXB0IGZhaWxlZDsgcmV0cnlpbmdcIiwge1xuICAgICAgICAgICAgICAgICAgICBhdHRlbXB0LFxuICAgICAgICAgICAgICAgICAgICByZXRyeUF0dGVtcHRzOiB0aGlzLnJldHJ5QXR0ZW1wdHMsXG4gICAgICAgICAgICAgICAgICAgIGRlbGF5TXM6IGRlbGF5LFxuICAgICAgICAgICAgICAgICAgICBpc1JhdGVMaW1pdCxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGxhc3RFcnJvci5tZXNzYWdlLFxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgZGVsYXkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBGYWlsZWQgdG8gc2VuZCBtZXNzYWdlIGFmdGVyICR7dGhpcy5yZXRyeUF0dGVtcHRzfSBhdHRlbXB0czogJHtsYXN0RXJyb3I/Lm1lc3NhZ2UgfHwgXCJVbmtub3duIGVycm9yXCJ9YCxcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBlcnJvciBpcyBhIHJhdGUgbGltaXQgZXJyb3JcbiAgICAgKi9cbiAgICBwcml2YXRlIGlzUmF0ZUxpbWl0RXJyb3IoZXJyb3I6IEVycm9yKTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IGVyciA9IGVycm9yIGFzIGFueTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIGVyci5zdGF0dXMgPT09IDQyOSB8fFxuICAgICAgICAgICAgL3JhdGUgbGltaXR8cXVvdGF8b3ZlcmxvYWRlZHxjYXBhY2l0eS9pLnRlc3QoZXJyb3IubWVzc2FnZSlcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDYWxjdWxhdGUgYmFja29mZiBkZWxheSB3aXRoIGppdHRlclxuICAgICAqL1xuICAgIHByaXZhdGUgZ2V0QmFja29mZkRlbGF5KGF0dGVtcHQ6IG51bWJlciwgaXNSYXRlTGltaXQ6IGJvb2xlYW4pOiBudW1iZXIge1xuICAgICAgICBjb25zdCBiYXNlID0gaXNSYXRlTGltaXQgPyA1MDAwIDogMTAwMDsgLy8gNXMgZm9yIHJhdGUgbGltaXQsIDFzIG90aGVyd2lzZVxuICAgICAgICBjb25zdCBleHBvbmVudGlhbCA9IGJhc2UgKiAyICoqIChhdHRlbXB0IC0gMSk7XG4gICAgICAgIGNvbnN0IGppdHRlciA9IE1hdGgucmFuZG9tKCkgKiAxMDAwOyAvLyBBZGQgdXAgdG8gMXMgaml0dGVyXG4gICAgICAgIHJldHVybiBNYXRoLm1pbihleHBvbmVudGlhbCArIGppdHRlciwgNjAwMDApOyAvLyBtYXggNjBzXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSGFuZGxlIHNlc3Npb24gY2xvc3VyZSB3aXRoIGVycm9yIGhhbmRsaW5nXG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyBoYW5kbGVTZXNzaW9uQ2xvc2Uoc2Vzc2lvbklkOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIE5vdGU6IE9wZW5Db2RlIFNESyBtaWdodCBub3QgaGF2ZSBhbiBleHBsaWNpdCBjbG9zZSBtZXRob2RcbiAgICAgICAgICAgIC8vIEZvciBub3csIHdlJ2xsIGp1c3QgcmVtb3ZlIGZyb20gb3VyIGFjdGl2ZSBzZXNzaW9uc1xuICAgICAgICAgICAgLy8gSW4gYSByZWFsIGltcGxlbWVudGF0aW9uLCB3ZSdkIGNhbGwgU0RLJ3MgZGVsZXRlIG1ldGhvZCBpZiBhdmFpbGFibGVcbiAgICAgICAgICAgIGxvZy5kZWJ1ZyhcIlNlc3Npb24gY2xvc2VkXCIsIHsgc2Vzc2lvbklkIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID1cbiAgICAgICAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgICAgICBsb2cud2FybihcIkZhaWxlZCB0byBjbG9zZSBzZXNzaW9uXCIsIHtcbiAgICAgICAgICAgICAgICBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2VuZXJhdGUgYSB1bmlxdWUgc2Vzc2lvbiBJRCBpZiBTREsgZG9lc24ndCBwcm92aWRlIG9uZVxuICAgICAqL1xuICAgIHByaXZhdGUgZ2VuZXJhdGVTZXNzaW9uSWQoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGBzZXNzaW9uLSR7RGF0ZS5ub3coKX0tJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgOSl9YDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZSBhIHByb3Blcmx5IGZvcm1hdHRlZCBtZXNzYWdlIElEIHdpdGggbXNnXyBwcmVmaXhcbiAgICAgKiBGb3JtYXQ6IG1zZ188dGltZXN0YW1wPl88cmFuZG9tPlxuICAgICAqL1xuICAgIHByaXZhdGUgZ2VuZXJhdGVNZXNzYWdlSWQoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGBtc2dfJHtEYXRlLm5vdygpfV8ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZygyLCA4KX1gO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENsZWFudXAgbWV0aG9kIHRvIGNsb3NlIGFsbCBzZXNzaW9ucyBhbmQgc2VydmVyXG4gICAgICovXG4gICAgYXN5bmMgY2xlYW51cCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxvZy5kZWJ1ZyhcIlN0YXJ0aW5nIGNsZWFudXAuLi5cIiwge1xuICAgICAgICAgICAgICAgIGFjdGl2ZVNlc3Npb25zOiB0aGlzLmFjdGl2ZVNlc3Npb25zLnNpemUsXG4gICAgICAgICAgICAgICAgaGFzU2VydmVyOiAhIXRoaXMuc2VydmVyLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIENsb3NlIGFsbCBhY3RpdmUgc2Vzc2lvbnNcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuY2xvc2VBbGxTZXNzaW9ucygpO1xuXG4gICAgICAgICAgICAvLyBTdG9wIHRoZSBPcGVuQ29kZSBzZXJ2ZXIgaWYgd2Ugc3RhcnRlZCBvbmVcbiAgICAgICAgICAgIGlmICh0aGlzLnNlcnZlcikge1xuICAgICAgICAgICAgICAgIGxvZy5pbmZvKFwiQ2xvc2luZyBzcGF3bmVkIE9wZW5Db2RlIHNlcnZlclwiKTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlcnZlci5jbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlcnZlciA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIGxvZy5pbmZvKFwiT3BlbkNvZGUgc2VydmVyIGNsb3NlZCBzdWNjZXNzZnVsbHlcIik7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNc2cgPVxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICBsb2cuZXJyb3IoXCJFcnJvciBjbG9zaW5nIE9wZW5Db2RlIHNlcnZlclwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JNc2csXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbG9nLmRlYnVnKFxuICAgICAgICAgICAgICAgICAgICBcIk5vIHNwYXduZWQgc2VydmVyIHRvIGNsb3NlIChjb25uZWN0ZWQgdG8gZXhpc3Rpbmcgc2VydmVyKVwiLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxvZy5pbmZvKFwiQ2xlYW51cCBjb21wbGV0ZVwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTXNnID1cbiAgICAgICAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgICAgICBsb2cuZXJyb3IoXCJFcnJvciBkdXJpbmcgT3BlbkNvZGUgY2xpZW50IGNsZWFudXBcIiwge1xuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvck1zZyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwKICAgICIvLyBUaGlzIGZpbGUgaXMgYXV0by1nZW5lcmF0ZWQgYnkgQGhleS1hcGkvb3BlbmFwaS10c1xuZXhwb3J0IGNvbnN0IGNyZWF0ZVNzZUNsaWVudCA9ICh7IG9uU3NlRXJyb3IsIG9uU3NlRXZlbnQsIHJlc3BvbnNlVHJhbnNmb3JtZXIsIHJlc3BvbnNlVmFsaWRhdG9yLCBzc2VEZWZhdWx0UmV0cnlEZWxheSwgc3NlTWF4UmV0cnlBdHRlbXB0cywgc3NlTWF4UmV0cnlEZWxheSwgc3NlU2xlZXBGbiwgdXJsLCAuLi5vcHRpb25zIH0pID0+IHtcbiAgICBsZXQgbGFzdEV2ZW50SWQ7XG4gICAgY29uc3Qgc2xlZXAgPSBzc2VTbGVlcEZuID8/ICgobXMpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIG1zKSkpO1xuICAgIGNvbnN0IGNyZWF0ZVN0cmVhbSA9IGFzeW5jIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIGxldCByZXRyeURlbGF5ID0gc3NlRGVmYXVsdFJldHJ5RGVsYXkgPz8gMzAwMDtcbiAgICAgICAgbGV0IGF0dGVtcHQgPSAwO1xuICAgICAgICBjb25zdCBzaWduYWwgPSBvcHRpb25zLnNpZ25hbCA/PyBuZXcgQWJvcnRDb250cm9sbGVyKCkuc2lnbmFsO1xuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgaWYgKHNpZ25hbC5hYm9ydGVkKVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgYXR0ZW1wdCsrO1xuICAgICAgICAgICAgY29uc3QgaGVhZGVycyA9IG9wdGlvbnMuaGVhZGVycyBpbnN0YW5jZW9mIEhlYWRlcnNcbiAgICAgICAgICAgICAgICA/IG9wdGlvbnMuaGVhZGVyc1xuICAgICAgICAgICAgICAgIDogbmV3IEhlYWRlcnMob3B0aW9ucy5oZWFkZXJzKTtcbiAgICAgICAgICAgIGlmIChsYXN0RXZlbnRJZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgaGVhZGVycy5zZXQoXCJMYXN0LUV2ZW50LUlEXCIsIGxhc3RFdmVudElkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwsIHsgLi4ub3B0aW9ucywgaGVhZGVycywgc2lnbmFsIH0pO1xuICAgICAgICAgICAgICAgIGlmICghcmVzcG9uc2Uub2spXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgU1NFIGZhaWxlZDogJHtyZXNwb25zZS5zdGF0dXN9ICR7cmVzcG9uc2Uuc3RhdHVzVGV4dH1gKTtcbiAgICAgICAgICAgICAgICBpZiAoIXJlc3BvbnNlLmJvZHkpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIGJvZHkgaW4gU1NFIHJlc3BvbnNlXCIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlYWRlciA9IHJlc3BvbnNlLmJvZHkucGlwZVRocm91Z2gobmV3IFRleHREZWNvZGVyU3RyZWFtKCkpLmdldFJlYWRlcigpO1xuICAgICAgICAgICAgICAgIGxldCBidWZmZXIgPSBcIlwiO1xuICAgICAgICAgICAgICAgIGNvbnN0IGFib3J0SGFuZGxlciA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlYWRlci5jYW5jZWwoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBub29wXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHNpZ25hbC5hZGRFdmVudExpc3RlbmVyKFwiYWJvcnRcIiwgYWJvcnRIYW5kbGVyKTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgeyBkb25lLCB2YWx1ZSB9ID0gYXdhaXQgcmVhZGVyLnJlYWQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkb25lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVmZmVyICs9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2h1bmtzID0gYnVmZmVyLnNwbGl0KFwiXFxuXFxuXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVmZmVyID0gY2h1bmtzLnBvcCgpID8/IFwiXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGNodW5rIG9mIGNodW5rcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxpbmVzID0gY2h1bmsuc3BsaXQoXCJcXG5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZGF0YUxpbmVzID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGV2ZW50TmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxpbmUuc3RhcnRzV2l0aChcImRhdGE6XCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhTGluZXMucHVzaChsaW5lLnJlcGxhY2UoL15kYXRhOlxccyovLCBcIlwiKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobGluZS5zdGFydHNXaXRoKFwiZXZlbnQ6XCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudE5hbWUgPSBsaW5lLnJlcGxhY2UoL15ldmVudDpcXHMqLywgXCJcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobGluZS5zdGFydHNXaXRoKFwiaWQ6XCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0RXZlbnRJZCA9IGxpbmUucmVwbGFjZSgvXmlkOlxccyovLCBcIlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChsaW5lLnN0YXJ0c1dpdGgoXCJyZXRyeTpcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhcnNlZCA9IE51bWJlci5wYXJzZUludChsaW5lLnJlcGxhY2UoL15yZXRyeTpcXHMqLywgXCJcIiksIDEwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghTnVtYmVyLmlzTmFOKHBhcnNlZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXRyeURlbGF5ID0gcGFyc2VkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBkYXRhO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXJzZWRKc29uID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGFMaW5lcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmF3RGF0YSA9IGRhdGFMaW5lcy5qb2luKFwiXFxuXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YSA9IEpTT04ucGFyc2UocmF3RGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJzZWRKc29uID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhID0gcmF3RGF0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFyc2VkSnNvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2VWYWxpZGF0b3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHJlc3BvbnNlVmFsaWRhdG9yKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZVRyYW5zZm9ybWVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhID0gYXdhaXQgcmVzcG9uc2VUcmFuc2Zvcm1lcihkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblNzZUV2ZW50Py4oe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudDogZXZlbnROYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogbGFzdEV2ZW50SWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHJ5OiByZXRyeURlbGF5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRhTGluZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkIGRhdGE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICBzaWduYWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImFib3J0XCIsIGFib3J0SGFuZGxlcik7XG4gICAgICAgICAgICAgICAgICAgIHJlYWRlci5yZWxlYXNlTG9jaygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhazsgLy8gZXhpdCBsb29wIG9uIG5vcm1hbCBjb21wbGV0aW9uXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAvLyBjb25uZWN0aW9uIGZhaWxlZCBvciBhYm9ydGVkOyByZXRyeSBhZnRlciBkZWxheVxuICAgICAgICAgICAgICAgIG9uU3NlRXJyb3I/LihlcnJvcik7XG4gICAgICAgICAgICAgICAgaWYgKHNzZU1heFJldHJ5QXR0ZW1wdHMgIT09IHVuZGVmaW5lZCAmJiBhdHRlbXB0ID49IHNzZU1heFJldHJ5QXR0ZW1wdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7IC8vIHN0b3AgYWZ0ZXIgZmlyaW5nIGVycm9yXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGV4cG9uZW50aWFsIGJhY2tvZmY6IGRvdWJsZSByZXRyeSBlYWNoIGF0dGVtcHQsIGNhcCBhdCAzMHNcbiAgICAgICAgICAgICAgICBjb25zdCBiYWNrb2ZmID0gTWF0aC5taW4ocmV0cnlEZWxheSAqIDIgKiogKGF0dGVtcHQgLSAxKSwgc3NlTWF4UmV0cnlEZWxheSA/PyAzMDAwMCk7XG4gICAgICAgICAgICAgICAgYXdhaXQgc2xlZXAoYmFja29mZik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IHN0cmVhbSA9IGNyZWF0ZVN0cmVhbSgpO1xuICAgIHJldHVybiB7IHN0cmVhbSB9O1xufTtcbiIsCiAgICAiLy8gVGhpcyBmaWxlIGlzIGF1dG8tZ2VuZXJhdGVkIGJ5IEBoZXktYXBpL29wZW5hcGktdHNcbmV4cG9ydCBjb25zdCBnZXRBdXRoVG9rZW4gPSBhc3luYyAoYXV0aCwgY2FsbGJhY2spID0+IHtcbiAgICBjb25zdCB0b2tlbiA9IHR5cGVvZiBjYWxsYmFjayA9PT0gXCJmdW5jdGlvblwiID8gYXdhaXQgY2FsbGJhY2soYXV0aCkgOiBjYWxsYmFjaztcbiAgICBpZiAoIXRva2VuKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGF1dGguc2NoZW1lID09PSBcImJlYXJlclwiKSB7XG4gICAgICAgIHJldHVybiBgQmVhcmVyICR7dG9rZW59YDtcbiAgICB9XG4gICAgaWYgKGF1dGguc2NoZW1lID09PSBcImJhc2ljXCIpIHtcbiAgICAgICAgcmV0dXJuIGBCYXNpYyAke2J0b2EodG9rZW4pfWA7XG4gICAgfVxuICAgIHJldHVybiB0b2tlbjtcbn07XG4iLAogICAgIi8vIFRoaXMgZmlsZSBpcyBhdXRvLWdlbmVyYXRlZCBieSBAaGV5LWFwaS9vcGVuYXBpLXRzXG5jb25zdCBzZXJpYWxpemVGb3JtRGF0YVBhaXIgPSAoZGF0YSwga2V5LCB2YWx1ZSkgPT4ge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIgfHwgdmFsdWUgaW5zdGFuY2VvZiBCbG9iKSB7XG4gICAgICAgIGRhdGEuYXBwZW5kKGtleSwgdmFsdWUpO1xuICAgIH1cbiAgICBlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIERhdGUpIHtcbiAgICAgICAgZGF0YS5hcHBlbmQoa2V5LCB2YWx1ZS50b0lTT1N0cmluZygpKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGRhdGEuYXBwZW5kKGtleSwgSlNPTi5zdHJpbmdpZnkodmFsdWUpKTtcbiAgICB9XG59O1xuY29uc3Qgc2VyaWFsaXplVXJsU2VhcmNoUGFyYW1zUGFpciA9IChkYXRhLCBrZXksIHZhbHVlKSA9PiB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICBkYXRhLmFwcGVuZChrZXksIHZhbHVlKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGRhdGEuYXBwZW5kKGtleSwgSlNPTi5zdHJpbmdpZnkodmFsdWUpKTtcbiAgICB9XG59O1xuZXhwb3J0IGNvbnN0IGZvcm1EYXRhQm9keVNlcmlhbGl6ZXIgPSB7XG4gICAgYm9keVNlcmlhbGl6ZXI6IChib2R5KSA9PiB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBuZXcgRm9ybURhdGEoKTtcbiAgICAgICAgT2JqZWN0LmVudHJpZXMoYm9keSkuZm9yRWFjaCgoW2tleSwgdmFsdWVdKSA9PiB7XG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHZhbHVlLmZvckVhY2goKHYpID0+IHNlcmlhbGl6ZUZvcm1EYXRhUGFpcihkYXRhLCBrZXksIHYpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlcmlhbGl6ZUZvcm1EYXRhUGFpcihkYXRhLCBrZXksIHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH0sXG59O1xuZXhwb3J0IGNvbnN0IGpzb25Cb2R5U2VyaWFsaXplciA9IHtcbiAgICBib2R5U2VyaWFsaXplcjogKGJvZHkpID0+IEpTT04uc3RyaW5naWZ5KGJvZHksIChfa2V5LCB2YWx1ZSkgPT4gKHR5cGVvZiB2YWx1ZSA9PT0gXCJiaWdpbnRcIiA/IHZhbHVlLnRvU3RyaW5nKCkgOiB2YWx1ZSkpLFxufTtcbmV4cG9ydCBjb25zdCB1cmxTZWFyY2hQYXJhbXNCb2R5U2VyaWFsaXplciA9IHtcbiAgICBib2R5U2VyaWFsaXplcjogKGJvZHkpID0+IHtcbiAgICAgICAgY29uc3QgZGF0YSA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoKTtcbiAgICAgICAgT2JqZWN0LmVudHJpZXMoYm9keSkuZm9yRWFjaCgoW2tleSwgdmFsdWVdKSA9PiB7XG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHZhbHVlLmZvckVhY2goKHYpID0+IHNlcmlhbGl6ZVVybFNlYXJjaFBhcmFtc1BhaXIoZGF0YSwga2V5LCB2KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZXJpYWxpemVVcmxTZWFyY2hQYXJhbXNQYWlyKGRhdGEsIGtleSwgdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGRhdGEudG9TdHJpbmcoKTtcbiAgICB9LFxufTtcbiIsCiAgICAiLy8gVGhpcyBmaWxlIGlzIGF1dG8tZ2VuZXJhdGVkIGJ5IEBoZXktYXBpL29wZW5hcGktdHNcbmV4cG9ydCBjb25zdCBzZXBhcmF0b3JBcnJheUV4cGxvZGUgPSAoc3R5bGUpID0+IHtcbiAgICBzd2l0Y2ggKHN0eWxlKSB7XG4gICAgICAgIGNhc2UgXCJsYWJlbFwiOlxuICAgICAgICAgICAgcmV0dXJuIFwiLlwiO1xuICAgICAgICBjYXNlIFwibWF0cml4XCI6XG4gICAgICAgICAgICByZXR1cm4gXCI7XCI7XG4gICAgICAgIGNhc2UgXCJzaW1wbGVcIjpcbiAgICAgICAgICAgIHJldHVybiBcIixcIjtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiBcIiZcIjtcbiAgICB9XG59O1xuZXhwb3J0IGNvbnN0IHNlcGFyYXRvckFycmF5Tm9FeHBsb2RlID0gKHN0eWxlKSA9PiB7XG4gICAgc3dpdGNoIChzdHlsZSkge1xuICAgICAgICBjYXNlIFwiZm9ybVwiOlxuICAgICAgICAgICAgcmV0dXJuIFwiLFwiO1xuICAgICAgICBjYXNlIFwicGlwZURlbGltaXRlZFwiOlxuICAgICAgICAgICAgcmV0dXJuIFwifFwiO1xuICAgICAgICBjYXNlIFwic3BhY2VEZWxpbWl0ZWRcIjpcbiAgICAgICAgICAgIHJldHVybiBcIiUyMFwiO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIFwiLFwiO1xuICAgIH1cbn07XG5leHBvcnQgY29uc3Qgc2VwYXJhdG9yT2JqZWN0RXhwbG9kZSA9IChzdHlsZSkgPT4ge1xuICAgIHN3aXRjaCAoc3R5bGUpIHtcbiAgICAgICAgY2FzZSBcImxhYmVsXCI6XG4gICAgICAgICAgICByZXR1cm4gXCIuXCI7XG4gICAgICAgIGNhc2UgXCJtYXRyaXhcIjpcbiAgICAgICAgICAgIHJldHVybiBcIjtcIjtcbiAgICAgICAgY2FzZSBcInNpbXBsZVwiOlxuICAgICAgICAgICAgcmV0dXJuIFwiLFwiO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIFwiJlwiO1xuICAgIH1cbn07XG5leHBvcnQgY29uc3Qgc2VyaWFsaXplQXJyYXlQYXJhbSA9ICh7IGFsbG93UmVzZXJ2ZWQsIGV4cGxvZGUsIG5hbWUsIHN0eWxlLCB2YWx1ZSwgfSkgPT4ge1xuICAgIGlmICghZXhwbG9kZSkge1xuICAgICAgICBjb25zdCBqb2luZWRWYWx1ZXMgPSAoYWxsb3dSZXNlcnZlZCA/IHZhbHVlIDogdmFsdWUubWFwKCh2KSA9PiBlbmNvZGVVUklDb21wb25lbnQodikpKS5qb2luKHNlcGFyYXRvckFycmF5Tm9FeHBsb2RlKHN0eWxlKSk7XG4gICAgICAgIHN3aXRjaCAoc3R5bGUpIHtcbiAgICAgICAgICAgIGNhc2UgXCJsYWJlbFwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBgLiR7am9pbmVkVmFsdWVzfWA7XG4gICAgICAgICAgICBjYXNlIFwibWF0cml4XCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGA7JHtuYW1lfT0ke2pvaW5lZFZhbHVlc31gO1xuICAgICAgICAgICAgY2FzZSBcInNpbXBsZVwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBqb2luZWRWYWx1ZXM7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiBgJHtuYW1lfT0ke2pvaW5lZFZhbHVlc31gO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHNlcGFyYXRvciA9IHNlcGFyYXRvckFycmF5RXhwbG9kZShzdHlsZSk7XG4gICAgY29uc3Qgam9pbmVkVmFsdWVzID0gdmFsdWVcbiAgICAgICAgLm1hcCgodikgPT4ge1xuICAgICAgICBpZiAoc3R5bGUgPT09IFwibGFiZWxcIiB8fCBzdHlsZSA9PT0gXCJzaW1wbGVcIikge1xuICAgICAgICAgICAgcmV0dXJuIGFsbG93UmVzZXJ2ZWQgPyB2IDogZW5jb2RlVVJJQ29tcG9uZW50KHYpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzZXJpYWxpemVQcmltaXRpdmVQYXJhbSh7XG4gICAgICAgICAgICBhbGxvd1Jlc2VydmVkLFxuICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgIHZhbHVlOiB2LFxuICAgICAgICB9KTtcbiAgICB9KVxuICAgICAgICAuam9pbihzZXBhcmF0b3IpO1xuICAgIHJldHVybiBzdHlsZSA9PT0gXCJsYWJlbFwiIHx8IHN0eWxlID09PSBcIm1hdHJpeFwiID8gc2VwYXJhdG9yICsgam9pbmVkVmFsdWVzIDogam9pbmVkVmFsdWVzO1xufTtcbmV4cG9ydCBjb25zdCBzZXJpYWxpemVQcmltaXRpdmVQYXJhbSA9ICh7IGFsbG93UmVzZXJ2ZWQsIG5hbWUsIHZhbHVlIH0pID0+IHtcbiAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gXCJcIjtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJEZWVwbHktbmVzdGVkIGFycmF5cy9vYmplY3RzIGFyZW7igJl0IHN1cHBvcnRlZC4gUHJvdmlkZSB5b3VyIG93biBgcXVlcnlTZXJpYWxpemVyKClgIHRvIGhhbmRsZSB0aGVzZS5cIik7XG4gICAgfVxuICAgIHJldHVybiBgJHtuYW1lfT0ke2FsbG93UmVzZXJ2ZWQgPyB2YWx1ZSA6IGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSl9YDtcbn07XG5leHBvcnQgY29uc3Qgc2VyaWFsaXplT2JqZWN0UGFyYW0gPSAoeyBhbGxvd1Jlc2VydmVkLCBleHBsb2RlLCBuYW1lLCBzdHlsZSwgdmFsdWUsIHZhbHVlT25seSwgfSkgPT4ge1xuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIERhdGUpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlT25seSA/IHZhbHVlLnRvSVNPU3RyaW5nKCkgOiBgJHtuYW1lfT0ke3ZhbHVlLnRvSVNPU3RyaW5nKCl9YDtcbiAgICB9XG4gICAgaWYgKHN0eWxlICE9PSBcImRlZXBPYmplY3RcIiAmJiAhZXhwbG9kZSkge1xuICAgICAgICBsZXQgdmFsdWVzID0gW107XG4gICAgICAgIE9iamVjdC5lbnRyaWVzKHZhbHVlKS5mb3JFYWNoKChba2V5LCB2XSkgPT4ge1xuICAgICAgICAgICAgdmFsdWVzID0gWy4uLnZhbHVlcywga2V5LCBhbGxvd1Jlc2VydmVkID8gdiA6IGVuY29kZVVSSUNvbXBvbmVudCh2KV07XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBqb2luZWRWYWx1ZXMgPSB2YWx1ZXMuam9pbihcIixcIik7XG4gICAgICAgIHN3aXRjaCAoc3R5bGUpIHtcbiAgICAgICAgICAgIGNhc2UgXCJmb3JtXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke25hbWV9PSR7am9pbmVkVmFsdWVzfWA7XG4gICAgICAgICAgICBjYXNlIFwibGFiZWxcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gYC4ke2pvaW5lZFZhbHVlc31gO1xuICAgICAgICAgICAgY2FzZSBcIm1hdHJpeFwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBgOyR7bmFtZX09JHtqb2luZWRWYWx1ZXN9YDtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGpvaW5lZFZhbHVlcztcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBzZXBhcmF0b3IgPSBzZXBhcmF0b3JPYmplY3RFeHBsb2RlKHN0eWxlKTtcbiAgICBjb25zdCBqb2luZWRWYWx1ZXMgPSBPYmplY3QuZW50cmllcyh2YWx1ZSlcbiAgICAgICAgLm1hcCgoW2tleSwgdl0pID0+IHNlcmlhbGl6ZVByaW1pdGl2ZVBhcmFtKHtcbiAgICAgICAgYWxsb3dSZXNlcnZlZCxcbiAgICAgICAgbmFtZTogc3R5bGUgPT09IFwiZGVlcE9iamVjdFwiID8gYCR7bmFtZX1bJHtrZXl9XWAgOiBrZXksXG4gICAgICAgIHZhbHVlOiB2LFxuICAgIH0pKVxuICAgICAgICAuam9pbihzZXBhcmF0b3IpO1xuICAgIHJldHVybiBzdHlsZSA9PT0gXCJsYWJlbFwiIHx8IHN0eWxlID09PSBcIm1hdHJpeFwiID8gc2VwYXJhdG9yICsgam9pbmVkVmFsdWVzIDogam9pbmVkVmFsdWVzO1xufTtcbiIsCiAgICAiLy8gVGhpcyBmaWxlIGlzIGF1dG8tZ2VuZXJhdGVkIGJ5IEBoZXktYXBpL29wZW5hcGktdHNcbmltcG9ydCB7IHNlcmlhbGl6ZUFycmF5UGFyYW0sIHNlcmlhbGl6ZU9iamVjdFBhcmFtLCBzZXJpYWxpemVQcmltaXRpdmVQYXJhbSwgfSBmcm9tIFwiLi9wYXRoU2VyaWFsaXplci5nZW4uanNcIjtcbmV4cG9ydCBjb25zdCBQQVRIX1BBUkFNX1JFID0gL1xce1tee31dK1xcfS9nO1xuZXhwb3J0IGNvbnN0IGRlZmF1bHRQYXRoU2VyaWFsaXplciA9ICh7IHBhdGgsIHVybDogX3VybCB9KSA9PiB7XG4gICAgbGV0IHVybCA9IF91cmw7XG4gICAgY29uc3QgbWF0Y2hlcyA9IF91cmwubWF0Y2goUEFUSF9QQVJBTV9SRSk7XG4gICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgICAgZm9yIChjb25zdCBtYXRjaCBvZiBtYXRjaGVzKSB7XG4gICAgICAgICAgICBsZXQgZXhwbG9kZSA9IGZhbHNlO1xuICAgICAgICAgICAgbGV0IG5hbWUgPSBtYXRjaC5zdWJzdHJpbmcoMSwgbWF0Y2gubGVuZ3RoIC0gMSk7XG4gICAgICAgICAgICBsZXQgc3R5bGUgPSBcInNpbXBsZVwiO1xuICAgICAgICAgICAgaWYgKG5hbWUuZW5kc1dpdGgoXCIqXCIpKSB7XG4gICAgICAgICAgICAgICAgZXhwbG9kZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyaW5nKDAsIG5hbWUubGVuZ3RoIC0gMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobmFtZS5zdGFydHNXaXRoKFwiLlwiKSkge1xuICAgICAgICAgICAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cmluZygxKTtcbiAgICAgICAgICAgICAgICBzdHlsZSA9IFwibGFiZWxcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG5hbWUuc3RhcnRzV2l0aChcIjtcIikpIHtcbiAgICAgICAgICAgICAgICBuYW1lID0gbmFtZS5zdWJzdHJpbmcoMSk7XG4gICAgICAgICAgICAgICAgc3R5bGUgPSBcIm1hdHJpeFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBwYXRoW25hbWVdO1xuICAgICAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHVybCA9IHVybC5yZXBsYWNlKG1hdGNoLCBzZXJpYWxpemVBcnJheVBhcmFtKHsgZXhwbG9kZSwgbmFtZSwgc3R5bGUsIHZhbHVlIH0pKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgICB1cmwgPSB1cmwucmVwbGFjZShtYXRjaCwgc2VyaWFsaXplT2JqZWN0UGFyYW0oe1xuICAgICAgICAgICAgICAgICAgICBleHBsb2RlLFxuICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICBzdHlsZSxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZU9ubHk6IHRydWUsXG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHN0eWxlID09PSBcIm1hdHJpeFwiKSB7XG4gICAgICAgICAgICAgICAgdXJsID0gdXJsLnJlcGxhY2UobWF0Y2gsIGA7JHtzZXJpYWxpemVQcmltaXRpdmVQYXJhbSh7XG4gICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgICAgICB9KX1gKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHJlcGxhY2VWYWx1ZSA9IGVuY29kZVVSSUNvbXBvbmVudChzdHlsZSA9PT0gXCJsYWJlbFwiID8gYC4ke3ZhbHVlfWAgOiB2YWx1ZSk7XG4gICAgICAgICAgICB1cmwgPSB1cmwucmVwbGFjZShtYXRjaCwgcmVwbGFjZVZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdXJsO1xufTtcbmV4cG9ydCBjb25zdCBnZXRVcmwgPSAoeyBiYXNlVXJsLCBwYXRoLCBxdWVyeSwgcXVlcnlTZXJpYWxpemVyLCB1cmw6IF91cmwsIH0pID0+IHtcbiAgICBjb25zdCBwYXRoVXJsID0gX3VybC5zdGFydHNXaXRoKFwiL1wiKSA/IF91cmwgOiBgLyR7X3VybH1gO1xuICAgIGxldCB1cmwgPSAoYmFzZVVybCA/PyBcIlwiKSArIHBhdGhVcmw7XG4gICAgaWYgKHBhdGgpIHtcbiAgICAgICAgdXJsID0gZGVmYXVsdFBhdGhTZXJpYWxpemVyKHsgcGF0aCwgdXJsIH0pO1xuICAgIH1cbiAgICBsZXQgc2VhcmNoID0gcXVlcnkgPyBxdWVyeVNlcmlhbGl6ZXIocXVlcnkpIDogXCJcIjtcbiAgICBpZiAoc2VhcmNoLnN0YXJ0c1dpdGgoXCI/XCIpKSB7XG4gICAgICAgIHNlYXJjaCA9IHNlYXJjaC5zdWJzdHJpbmcoMSk7XG4gICAgfVxuICAgIGlmIChzZWFyY2gpIHtcbiAgICAgICAgdXJsICs9IGA/JHtzZWFyY2h9YDtcbiAgICB9XG4gICAgcmV0dXJuIHVybDtcbn07XG4iLAogICAgIi8vIFRoaXMgZmlsZSBpcyBhdXRvLWdlbmVyYXRlZCBieSBAaGV5LWFwaS9vcGVuYXBpLXRzXG5pbXBvcnQgeyBnZXRBdXRoVG9rZW4gfSBmcm9tIFwiLi4vY29yZS9hdXRoLmdlbi5qc1wiO1xuaW1wb3J0IHsganNvbkJvZHlTZXJpYWxpemVyIH0gZnJvbSBcIi4uL2NvcmUvYm9keVNlcmlhbGl6ZXIuZ2VuLmpzXCI7XG5pbXBvcnQgeyBzZXJpYWxpemVBcnJheVBhcmFtLCBzZXJpYWxpemVPYmplY3RQYXJhbSwgc2VyaWFsaXplUHJpbWl0aXZlUGFyYW0gfSBmcm9tIFwiLi4vY29yZS9wYXRoU2VyaWFsaXplci5nZW4uanNcIjtcbmltcG9ydCB7IGdldFVybCB9IGZyb20gXCIuLi9jb3JlL3V0aWxzLmdlbi5qc1wiO1xuZXhwb3J0IGNvbnN0IGNyZWF0ZVF1ZXJ5U2VyaWFsaXplciA9ICh7IGFsbG93UmVzZXJ2ZWQsIGFycmF5LCBvYmplY3QgfSA9IHt9KSA9PiB7XG4gICAgY29uc3QgcXVlcnlTZXJpYWxpemVyID0gKHF1ZXJ5UGFyYW1zKSA9PiB7XG4gICAgICAgIGNvbnN0IHNlYXJjaCA9IFtdO1xuICAgICAgICBpZiAocXVlcnlQYXJhbXMgJiYgdHlwZW9mIHF1ZXJ5UGFyYW1zID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IG5hbWUgaW4gcXVlcnlQYXJhbXMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHF1ZXJ5UGFyYW1zW25hbWVdO1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VyaWFsaXplZEFycmF5ID0gc2VyaWFsaXplQXJyYXlQYXJhbSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbGxvd1Jlc2VydmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXhwbG9kZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogXCJmb3JtXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLmFycmF5LFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlcmlhbGl6ZWRBcnJheSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaC5wdXNoKHNlcmlhbGl6ZWRBcnJheSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzZXJpYWxpemVkT2JqZWN0ID0gc2VyaWFsaXplT2JqZWN0UGFyYW0oe1xuICAgICAgICAgICAgICAgICAgICAgICAgYWxsb3dSZXNlcnZlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cGxvZGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IFwiZGVlcE9iamVjdFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgLi4ub2JqZWN0LFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlcmlhbGl6ZWRPYmplY3QpXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWFyY2gucHVzaChzZXJpYWxpemVkT2JqZWN0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlcmlhbGl6ZWRQcmltaXRpdmUgPSBzZXJpYWxpemVQcmltaXRpdmVQYXJhbSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbGxvd1Jlc2VydmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzZXJpYWxpemVkUHJpbWl0aXZlKVxuICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoLnB1c2goc2VyaWFsaXplZFByaW1pdGl2ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzZWFyY2guam9pbihcIiZcIik7XG4gICAgfTtcbiAgICByZXR1cm4gcXVlcnlTZXJpYWxpemVyO1xufTtcbi8qKlxuICogSW5mZXJzIHBhcnNlQXMgdmFsdWUgZnJvbSBwcm92aWRlZCBDb250ZW50LVR5cGUgaGVhZGVyLlxuICovXG5leHBvcnQgY29uc3QgZ2V0UGFyc2VBcyA9IChjb250ZW50VHlwZSkgPT4ge1xuICAgIGlmICghY29udGVudFR5cGUpIHtcbiAgICAgICAgLy8gSWYgbm8gQ29udGVudC1UeXBlIGhlYWRlciBpcyBwcm92aWRlZCwgdGhlIGJlc3Qgd2UgY2FuIGRvIGlzIHJldHVybiB0aGUgcmF3IHJlc3BvbnNlIGJvZHksXG4gICAgICAgIC8vIHdoaWNoIGlzIGVmZmVjdGl2ZWx5IHRoZSBzYW1lIGFzIHRoZSAnc3RyZWFtJyBvcHRpb24uXG4gICAgICAgIHJldHVybiBcInN0cmVhbVwiO1xuICAgIH1cbiAgICBjb25zdCBjbGVhbkNvbnRlbnQgPSBjb250ZW50VHlwZS5zcGxpdChcIjtcIilbMF0/LnRyaW0oKTtcbiAgICBpZiAoIWNsZWFuQ29udGVudCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChjbGVhbkNvbnRlbnQuc3RhcnRzV2l0aChcImFwcGxpY2F0aW9uL2pzb25cIikgfHwgY2xlYW5Db250ZW50LmVuZHNXaXRoKFwiK2pzb25cIikpIHtcbiAgICAgICAgcmV0dXJuIFwianNvblwiO1xuICAgIH1cbiAgICBpZiAoY2xlYW5Db250ZW50ID09PSBcIm11bHRpcGFydC9mb3JtLWRhdGFcIikge1xuICAgICAgICByZXR1cm4gXCJmb3JtRGF0YVwiO1xuICAgIH1cbiAgICBpZiAoW1wiYXBwbGljYXRpb24vXCIsIFwiYXVkaW8vXCIsIFwiaW1hZ2UvXCIsIFwidmlkZW8vXCJdLnNvbWUoKHR5cGUpID0+IGNsZWFuQ29udGVudC5zdGFydHNXaXRoKHR5cGUpKSkge1xuICAgICAgICByZXR1cm4gXCJibG9iXCI7XG4gICAgfVxuICAgIGlmIChjbGVhbkNvbnRlbnQuc3RhcnRzV2l0aChcInRleHQvXCIpKSB7XG4gICAgICAgIHJldHVybiBcInRleHRcIjtcbiAgICB9XG4gICAgcmV0dXJuO1xufTtcbmNvbnN0IGNoZWNrRm9yRXhpc3RlbmNlID0gKG9wdGlvbnMsIG5hbWUpID0+IHtcbiAgICBpZiAoIW5hbWUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy5oZWFkZXJzLmhhcyhuYW1lKSB8fCBvcHRpb25zLnF1ZXJ5Py5bbmFtZV0gfHwgb3B0aW9ucy5oZWFkZXJzLmdldChcIkNvb2tpZVwiKT8uaW5jbHVkZXMoYCR7bmFtZX09YCkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn07XG5leHBvcnQgY29uc3Qgc2V0QXV0aFBhcmFtcyA9IGFzeW5jICh7IHNlY3VyaXR5LCAuLi5vcHRpb25zIH0pID0+IHtcbiAgICBmb3IgKGNvbnN0IGF1dGggb2Ygc2VjdXJpdHkpIHtcbiAgICAgICAgaWYgKGNoZWNrRm9yRXhpc3RlbmNlKG9wdGlvbnMsIGF1dGgubmFtZSkpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRva2VuID0gYXdhaXQgZ2V0QXV0aFRva2VuKGF1dGgsIG9wdGlvbnMuYXV0aCk7XG4gICAgICAgIGlmICghdG9rZW4pIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5hbWUgPSBhdXRoLm5hbWUgPz8gXCJBdXRob3JpemF0aW9uXCI7XG4gICAgICAgIHN3aXRjaCAoYXV0aC5pbikge1xuICAgICAgICAgICAgY2FzZSBcInF1ZXJ5XCI6XG4gICAgICAgICAgICAgICAgaWYgKCFvcHRpb25zLnF1ZXJ5KSB7XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMucXVlcnkgPSB7fTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5xdWVyeVtuYW1lXSA9IHRva2VuO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImNvb2tpZVwiOlxuICAgICAgICAgICAgICAgIG9wdGlvbnMuaGVhZGVycy5hcHBlbmQoXCJDb29raWVcIiwgYCR7bmFtZX09JHt0b2tlbn1gKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJoZWFkZXJcIjpcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5oZWFkZXJzLnNldChuYW1lLCB0b2tlbik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG59O1xuZXhwb3J0IGNvbnN0IGJ1aWxkVXJsID0gKG9wdGlvbnMpID0+IGdldFVybCh7XG4gICAgYmFzZVVybDogb3B0aW9ucy5iYXNlVXJsLFxuICAgIHBhdGg6IG9wdGlvbnMucGF0aCxcbiAgICBxdWVyeTogb3B0aW9ucy5xdWVyeSxcbiAgICBxdWVyeVNlcmlhbGl6ZXI6IHR5cGVvZiBvcHRpb25zLnF1ZXJ5U2VyaWFsaXplciA9PT0gXCJmdW5jdGlvblwiXG4gICAgICAgID8gb3B0aW9ucy5xdWVyeVNlcmlhbGl6ZXJcbiAgICAgICAgOiBjcmVhdGVRdWVyeVNlcmlhbGl6ZXIob3B0aW9ucy5xdWVyeVNlcmlhbGl6ZXIpLFxuICAgIHVybDogb3B0aW9ucy51cmwsXG59KTtcbmV4cG9ydCBjb25zdCBtZXJnZUNvbmZpZ3MgPSAoYSwgYikgPT4ge1xuICAgIGNvbnN0IGNvbmZpZyA9IHsgLi4uYSwgLi4uYiB9O1xuICAgIGlmIChjb25maWcuYmFzZVVybD8uZW5kc1dpdGgoXCIvXCIpKSB7XG4gICAgICAgIGNvbmZpZy5iYXNlVXJsID0gY29uZmlnLmJhc2VVcmwuc3Vic3RyaW5nKDAsIGNvbmZpZy5iYXNlVXJsLmxlbmd0aCAtIDEpO1xuICAgIH1cbiAgICBjb25maWcuaGVhZGVycyA9IG1lcmdlSGVhZGVycyhhLmhlYWRlcnMsIGIuaGVhZGVycyk7XG4gICAgcmV0dXJuIGNvbmZpZztcbn07XG5leHBvcnQgY29uc3QgbWVyZ2VIZWFkZXJzID0gKC4uLmhlYWRlcnMpID0+IHtcbiAgICBjb25zdCBtZXJnZWRIZWFkZXJzID0gbmV3IEhlYWRlcnMoKTtcbiAgICBmb3IgKGNvbnN0IGhlYWRlciBvZiBoZWFkZXJzKSB7XG4gICAgICAgIGlmICghaGVhZGVyIHx8IHR5cGVvZiBoZWFkZXIgIT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGl0ZXJhdG9yID0gaGVhZGVyIGluc3RhbmNlb2YgSGVhZGVycyA/IGhlYWRlci5lbnRyaWVzKCkgOiBPYmplY3QuZW50cmllcyhoZWFkZXIpO1xuICAgICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBpdGVyYXRvcikge1xuICAgICAgICAgICAgaWYgKHZhbHVlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbWVyZ2VkSGVhZGVycy5kZWxldGUoa2V5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCB2IG9mIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lcmdlZEhlYWRlcnMuYXBwZW5kKGtleSwgdik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIC8vIGFzc3VtZSBvYmplY3QgaGVhZGVycyBhcmUgbWVhbnQgdG8gYmUgSlNPTiBzdHJpbmdpZmllZCwgaS5lLiB0aGVpclxuICAgICAgICAgICAgICAgIC8vIGNvbnRlbnQgdmFsdWUgaW4gT3BlbkFQSSBzcGVjaWZpY2F0aW9uIGlzICdhcHBsaWNhdGlvbi9qc29uJ1xuICAgICAgICAgICAgICAgIG1lcmdlZEhlYWRlcnMuc2V0KGtleSwgdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiID8gSlNPTi5zdHJpbmdpZnkodmFsdWUpIDogdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBtZXJnZWRIZWFkZXJzO1xufTtcbmNsYXNzIEludGVyY2VwdG9ycyB7XG4gICAgX2ZucztcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5fZm5zID0gW107XG4gICAgfVxuICAgIGNsZWFyKCkge1xuICAgICAgICB0aGlzLl9mbnMgPSBbXTtcbiAgICB9XG4gICAgZ2V0SW50ZXJjZXB0b3JJbmRleChpZCkge1xuICAgICAgICBpZiAodHlwZW9mIGlkID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZm5zW2lkXSA/IGlkIDogLTE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZm5zLmluZGV4T2YoaWQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGV4aXN0cyhpZCkge1xuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuZ2V0SW50ZXJjZXB0b3JJbmRleChpZCk7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2Zuc1tpbmRleF07XG4gICAgfVxuICAgIGVqZWN0KGlkKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5nZXRJbnRlcmNlcHRvckluZGV4KGlkKTtcbiAgICAgICAgaWYgKHRoaXMuX2Zuc1tpbmRleF0pIHtcbiAgICAgICAgICAgIHRoaXMuX2Zuc1tpbmRleF0gPSBudWxsO1xuICAgICAgICB9XG4gICAgfVxuICAgIHVwZGF0ZShpZCwgZm4pIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmdldEludGVyY2VwdG9ySW5kZXgoaWQpO1xuICAgICAgICBpZiAodGhpcy5fZm5zW2luZGV4XSkge1xuICAgICAgICAgICAgdGhpcy5fZm5zW2luZGV4XSA9IGZuO1xuICAgICAgICAgICAgcmV0dXJuIGlkO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHVzZShmbikge1xuICAgICAgICB0aGlzLl9mbnMgPSBbLi4udGhpcy5fZm5zLCBmbl07XG4gICAgICAgIHJldHVybiB0aGlzLl9mbnMubGVuZ3RoIC0gMTtcbiAgICB9XG59XG4vLyBkbyBub3QgYWRkIGBNaWRkbGV3YXJlYCBhcyByZXR1cm4gdHlwZSBzbyB3ZSBjYW4gdXNlIF9mbnMgaW50ZXJuYWxseVxuZXhwb3J0IGNvbnN0IGNyZWF0ZUludGVyY2VwdG9ycyA9ICgpID0+ICh7XG4gICAgZXJyb3I6IG5ldyBJbnRlcmNlcHRvcnMoKSxcbiAgICByZXF1ZXN0OiBuZXcgSW50ZXJjZXB0b3JzKCksXG4gICAgcmVzcG9uc2U6IG5ldyBJbnRlcmNlcHRvcnMoKSxcbn0pO1xuY29uc3QgZGVmYXVsdFF1ZXJ5U2VyaWFsaXplciA9IGNyZWF0ZVF1ZXJ5U2VyaWFsaXplcih7XG4gICAgYWxsb3dSZXNlcnZlZDogZmFsc2UsXG4gICAgYXJyYXk6IHtcbiAgICAgICAgZXhwbG9kZTogdHJ1ZSxcbiAgICAgICAgc3R5bGU6IFwiZm9ybVwiLFxuICAgIH0sXG4gICAgb2JqZWN0OiB7XG4gICAgICAgIGV4cGxvZGU6IHRydWUsXG4gICAgICAgIHN0eWxlOiBcImRlZXBPYmplY3RcIixcbiAgICB9LFxufSk7XG5jb25zdCBkZWZhdWx0SGVhZGVycyA9IHtcbiAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbn07XG5leHBvcnQgY29uc3QgY3JlYXRlQ29uZmlnID0gKG92ZXJyaWRlID0ge30pID0+ICh7XG4gICAgLi4uanNvbkJvZHlTZXJpYWxpemVyLFxuICAgIGhlYWRlcnM6IGRlZmF1bHRIZWFkZXJzLFxuICAgIHBhcnNlQXM6IFwiYXV0b1wiLFxuICAgIHF1ZXJ5U2VyaWFsaXplcjogZGVmYXVsdFF1ZXJ5U2VyaWFsaXplcixcbiAgICAuLi5vdmVycmlkZSxcbn0pO1xuIiwKICAgICIvLyBUaGlzIGZpbGUgaXMgYXV0by1nZW5lcmF0ZWQgYnkgQGhleS1hcGkvb3BlbmFwaS10c1xuaW1wb3J0IHsgY3JlYXRlU3NlQ2xpZW50IH0gZnJvbSBcIi4uL2NvcmUvc2VydmVyU2VudEV2ZW50cy5nZW4uanNcIjtcbmltcG9ydCB7IGJ1aWxkVXJsLCBjcmVhdGVDb25maWcsIGNyZWF0ZUludGVyY2VwdG9ycywgZ2V0UGFyc2VBcywgbWVyZ2VDb25maWdzLCBtZXJnZUhlYWRlcnMsIHNldEF1dGhQYXJhbXMsIH0gZnJvbSBcIi4vdXRpbHMuZ2VuLmpzXCI7XG5leHBvcnQgY29uc3QgY3JlYXRlQ2xpZW50ID0gKGNvbmZpZyA9IHt9KSA9PiB7XG4gICAgbGV0IF9jb25maWcgPSBtZXJnZUNvbmZpZ3MoY3JlYXRlQ29uZmlnKCksIGNvbmZpZyk7XG4gICAgY29uc3QgZ2V0Q29uZmlnID0gKCkgPT4gKHsgLi4uX2NvbmZpZyB9KTtcbiAgICBjb25zdCBzZXRDb25maWcgPSAoY29uZmlnKSA9PiB7XG4gICAgICAgIF9jb25maWcgPSBtZXJnZUNvbmZpZ3MoX2NvbmZpZywgY29uZmlnKTtcbiAgICAgICAgcmV0dXJuIGdldENvbmZpZygpO1xuICAgIH07XG4gICAgY29uc3QgaW50ZXJjZXB0b3JzID0gY3JlYXRlSW50ZXJjZXB0b3JzKCk7XG4gICAgY29uc3QgYmVmb3JlUmVxdWVzdCA9IGFzeW5jIChvcHRpb25zKSA9PiB7XG4gICAgICAgIGNvbnN0IG9wdHMgPSB7XG4gICAgICAgICAgICAuLi5fY29uZmlnLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGZldGNoOiBvcHRpb25zLmZldGNoID8/IF9jb25maWcuZmV0Y2ggPz8gZ2xvYmFsVGhpcy5mZXRjaCxcbiAgICAgICAgICAgIGhlYWRlcnM6IG1lcmdlSGVhZGVycyhfY29uZmlnLmhlYWRlcnMsIG9wdGlvbnMuaGVhZGVycyksXG4gICAgICAgICAgICBzZXJpYWxpemVkQm9keTogdW5kZWZpbmVkLFxuICAgICAgICB9O1xuICAgICAgICBpZiAob3B0cy5zZWN1cml0eSkge1xuICAgICAgICAgICAgYXdhaXQgc2V0QXV0aFBhcmFtcyh7XG4gICAgICAgICAgICAgICAgLi4ub3B0cyxcbiAgICAgICAgICAgICAgICBzZWN1cml0eTogb3B0cy5zZWN1cml0eSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvcHRzLnJlcXVlc3RWYWxpZGF0b3IpIHtcbiAgICAgICAgICAgIGF3YWl0IG9wdHMucmVxdWVzdFZhbGlkYXRvcihvcHRzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob3B0cy5ib2R5ICYmIG9wdHMuYm9keVNlcmlhbGl6ZXIpIHtcbiAgICAgICAgICAgIG9wdHMuc2VyaWFsaXplZEJvZHkgPSBvcHRzLmJvZHlTZXJpYWxpemVyKG9wdHMuYm9keSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gcmVtb3ZlIENvbnRlbnQtVHlwZSBoZWFkZXIgaWYgYm9keSBpcyBlbXB0eSB0byBhdm9pZCBzZW5kaW5nIGludmFsaWQgcmVxdWVzdHNcbiAgICAgICAgaWYgKG9wdHMuc2VyaWFsaXplZEJvZHkgPT09IHVuZGVmaW5lZCB8fCBvcHRzLnNlcmlhbGl6ZWRCb2R5ID09PSBcIlwiKSB7XG4gICAgICAgICAgICBvcHRzLmhlYWRlcnMuZGVsZXRlKFwiQ29udGVudC1UeXBlXCIpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHVybCA9IGJ1aWxkVXJsKG9wdHMpO1xuICAgICAgICByZXR1cm4geyBvcHRzLCB1cmwgfTtcbiAgICB9O1xuICAgIGNvbnN0IHJlcXVlc3QgPSBhc3luYyAob3B0aW9ucykgPT4ge1xuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yXG4gICAgICAgIGNvbnN0IHsgb3B0cywgdXJsIH0gPSBhd2FpdCBiZWZvcmVSZXF1ZXN0KG9wdGlvbnMpO1xuICAgICAgICBjb25zdCByZXF1ZXN0SW5pdCA9IHtcbiAgICAgICAgICAgIHJlZGlyZWN0OiBcImZvbGxvd1wiLFxuICAgICAgICAgICAgLi4ub3B0cyxcbiAgICAgICAgICAgIGJvZHk6IG9wdHMuc2VyaWFsaXplZEJvZHksXG4gICAgICAgIH07XG4gICAgICAgIGxldCByZXF1ZXN0ID0gbmV3IFJlcXVlc3QodXJsLCByZXF1ZXN0SW5pdCk7XG4gICAgICAgIGZvciAoY29uc3QgZm4gb2YgaW50ZXJjZXB0b3JzLnJlcXVlc3QuX2Zucykge1xuICAgICAgICAgICAgaWYgKGZuKSB7XG4gICAgICAgICAgICAgICAgcmVxdWVzdCA9IGF3YWl0IGZuKHJlcXVlc3QsIG9wdHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIGZldGNoIG11c3QgYmUgYXNzaWduZWQgaGVyZSwgb3RoZXJ3aXNlIGl0IHdvdWxkIHRocm93IHRoZSBlcnJvcjpcbiAgICAgICAgLy8gVHlwZUVycm9yOiBGYWlsZWQgdG8gZXhlY3V0ZSAnZmV0Y2gnIG9uICdXaW5kb3cnOiBJbGxlZ2FsIGludm9jYXRpb25cbiAgICAgICAgY29uc3QgX2ZldGNoID0gb3B0cy5mZXRjaDtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgX2ZldGNoKHJlcXVlc3QpO1xuICAgICAgICBmb3IgKGNvbnN0IGZuIG9mIGludGVyY2VwdG9ycy5yZXNwb25zZS5fZm5zKSB7XG4gICAgICAgICAgICBpZiAoZm4pIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IGF3YWl0IGZuKHJlc3BvbnNlLCByZXF1ZXN0LCBvcHRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICAgICAgICByZXF1ZXN0LFxuICAgICAgICAgICAgcmVzcG9uc2UsXG4gICAgICAgIH07XG4gICAgICAgIGlmIChyZXNwb25zZS5vaykge1xuICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gMjA0IHx8IHJlc3BvbnNlLmhlYWRlcnMuZ2V0KFwiQ29udGVudC1MZW5ndGhcIikgPT09IFwiMFwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wdHMucmVzcG9uc2VTdHlsZSA9PT0gXCJkYXRhXCJcbiAgICAgICAgICAgICAgICAgICAgPyB7fVxuICAgICAgICAgICAgICAgICAgICA6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHt9LFxuICAgICAgICAgICAgICAgICAgICAgICAgLi4ucmVzdWx0LFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcGFyc2VBcyA9IChvcHRzLnBhcnNlQXMgPT09IFwiYXV0b1wiID8gZ2V0UGFyc2VBcyhyZXNwb25zZS5oZWFkZXJzLmdldChcIkNvbnRlbnQtVHlwZVwiKSkgOiBvcHRzLnBhcnNlQXMpID8/IFwianNvblwiO1xuICAgICAgICAgICAgbGV0IGRhdGE7XG4gICAgICAgICAgICBzd2l0Y2ggKHBhcnNlQXMpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwiYXJyYXlCdWZmZXJcIjpcbiAgICAgICAgICAgICAgICBjYXNlIFwiYmxvYlwiOlxuICAgICAgICAgICAgICAgIGNhc2UgXCJmb3JtRGF0YVwiOlxuICAgICAgICAgICAgICAgIGNhc2UgXCJqc29uXCI6XG4gICAgICAgICAgICAgICAgY2FzZSBcInRleHRcIjpcbiAgICAgICAgICAgICAgICAgICAgZGF0YSA9IGF3YWl0IHJlc3BvbnNlW3BhcnNlQXNdKCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJzdHJlYW1cIjpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9wdHMucmVzcG9uc2VTdHlsZSA9PT0gXCJkYXRhXCJcbiAgICAgICAgICAgICAgICAgICAgICAgID8gcmVzcG9uc2UuYm9keVxuICAgICAgICAgICAgICAgICAgICAgICAgOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogcmVzcG9uc2UuYm9keSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5yZXN1bHQsXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHBhcnNlQXMgPT09IFwianNvblwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9wdHMucmVzcG9uc2VWYWxpZGF0b3IpIHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgb3B0cy5yZXNwb25zZVZhbGlkYXRvcihkYXRhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG9wdHMucmVzcG9uc2VUcmFuc2Zvcm1lcikge1xuICAgICAgICAgICAgICAgICAgICBkYXRhID0gYXdhaXQgb3B0cy5yZXNwb25zZVRyYW5zZm9ybWVyKGRhdGEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBvcHRzLnJlc3BvbnNlU3R5bGUgPT09IFwiZGF0YVwiXG4gICAgICAgICAgICAgICAgPyBkYXRhXG4gICAgICAgICAgICAgICAgOiB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGEsXG4gICAgICAgICAgICAgICAgICAgIC4uLnJlc3VsdCxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRleHRFcnJvciA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbiAgICAgICAgbGV0IGpzb25FcnJvcjtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGpzb25FcnJvciA9IEpTT04ucGFyc2UodGV4dEVycm9yKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICAvLyBub29wXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZXJyb3IgPSBqc29uRXJyb3IgPz8gdGV4dEVycm9yO1xuICAgICAgICBsZXQgZmluYWxFcnJvciA9IGVycm9yO1xuICAgICAgICBmb3IgKGNvbnN0IGZuIG9mIGludGVyY2VwdG9ycy5lcnJvci5fZm5zKSB7XG4gICAgICAgICAgICBpZiAoZm4pIHtcbiAgICAgICAgICAgICAgICBmaW5hbEVycm9yID0gKGF3YWl0IGZuKGVycm9yLCByZXNwb25zZSwgcmVxdWVzdCwgb3B0cykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZpbmFsRXJyb3IgPSBmaW5hbEVycm9yIHx8IHt9O1xuICAgICAgICBpZiAob3B0cy50aHJvd09uRXJyb3IpIHtcbiAgICAgICAgICAgIHRocm93IGZpbmFsRXJyb3I7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVE9ETzogd2UgcHJvYmFibHkgd2FudCB0byByZXR1cm4gZXJyb3IgYW5kIGltcHJvdmUgdHlwZXNcbiAgICAgICAgcmV0dXJuIG9wdHMucmVzcG9uc2VTdHlsZSA9PT0gXCJkYXRhXCJcbiAgICAgICAgICAgID8gdW5kZWZpbmVkXG4gICAgICAgICAgICA6IHtcbiAgICAgICAgICAgICAgICBlcnJvcjogZmluYWxFcnJvcixcbiAgICAgICAgICAgICAgICAuLi5yZXN1bHQsXG4gICAgICAgICAgICB9O1xuICAgIH07XG4gICAgY29uc3QgbWFrZU1ldGhvZCA9IChtZXRob2QpID0+IHtcbiAgICAgICAgY29uc3QgZm4gPSAob3B0aW9ucykgPT4gcmVxdWVzdCh7IC4uLm9wdGlvbnMsIG1ldGhvZCB9KTtcbiAgICAgICAgZm4uc3NlID0gYXN5bmMgKG9wdGlvbnMpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHsgb3B0cywgdXJsIH0gPSBhd2FpdCBiZWZvcmVSZXF1ZXN0KG9wdGlvbnMpO1xuICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZVNzZUNsaWVudCh7XG4gICAgICAgICAgICAgICAgLi4ub3B0cyxcbiAgICAgICAgICAgICAgICBib2R5OiBvcHRzLmJvZHksXG4gICAgICAgICAgICAgICAgaGVhZGVyczogb3B0cy5oZWFkZXJzLFxuICAgICAgICAgICAgICAgIG1ldGhvZCxcbiAgICAgICAgICAgICAgICB1cmwsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGZuO1xuICAgIH07XG4gICAgcmV0dXJuIHtcbiAgICAgICAgYnVpbGRVcmwsXG4gICAgICAgIGNvbm5lY3Q6IG1ha2VNZXRob2QoXCJDT05ORUNUXCIpLFxuICAgICAgICBkZWxldGU6IG1ha2VNZXRob2QoXCJERUxFVEVcIiksXG4gICAgICAgIGdldDogbWFrZU1ldGhvZChcIkdFVFwiKSxcbiAgICAgICAgZ2V0Q29uZmlnLFxuICAgICAgICBoZWFkOiBtYWtlTWV0aG9kKFwiSEVBRFwiKSxcbiAgICAgICAgaW50ZXJjZXB0b3JzLFxuICAgICAgICBvcHRpb25zOiBtYWtlTWV0aG9kKFwiT1BUSU9OU1wiKSxcbiAgICAgICAgcGF0Y2g6IG1ha2VNZXRob2QoXCJQQVRDSFwiKSxcbiAgICAgICAgcG9zdDogbWFrZU1ldGhvZChcIlBPU1RcIiksXG4gICAgICAgIHB1dDogbWFrZU1ldGhvZChcIlBVVFwiKSxcbiAgICAgICAgcmVxdWVzdCxcbiAgICAgICAgc2V0Q29uZmlnLFxuICAgICAgICB0cmFjZTogbWFrZU1ldGhvZChcIlRSQUNFXCIpLFxuICAgIH07XG59O1xuIiwKICAgICIvLyBUaGlzIGZpbGUgaXMgYXV0by1nZW5lcmF0ZWQgYnkgQGhleS1hcGkvb3BlbmFwaS10c1xuY29uc3QgZXh0cmFQcmVmaXhlc01hcCA9IHtcbiAgICAkYm9keV86IFwiYm9keVwiLFxuICAgICRoZWFkZXJzXzogXCJoZWFkZXJzXCIsXG4gICAgJHBhdGhfOiBcInBhdGhcIixcbiAgICAkcXVlcnlfOiBcInF1ZXJ5XCIsXG59O1xuY29uc3QgZXh0cmFQcmVmaXhlcyA9IE9iamVjdC5lbnRyaWVzKGV4dHJhUHJlZml4ZXNNYXApO1xuY29uc3QgYnVpbGRLZXlNYXAgPSAoZmllbGRzLCBtYXApID0+IHtcbiAgICBpZiAoIW1hcCkge1xuICAgICAgICBtYXAgPSBuZXcgTWFwKCk7XG4gICAgfVxuICAgIGZvciAoY29uc3QgY29uZmlnIG9mIGZpZWxkcykge1xuICAgICAgICBpZiAoXCJpblwiIGluIGNvbmZpZykge1xuICAgICAgICAgICAgaWYgKGNvbmZpZy5rZXkpIHtcbiAgICAgICAgICAgICAgICBtYXAuc2V0KGNvbmZpZy5rZXksIHtcbiAgICAgICAgICAgICAgICAgICAgaW46IGNvbmZpZy5pbixcbiAgICAgICAgICAgICAgICAgICAgbWFwOiBjb25maWcubWFwLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGNvbmZpZy5hcmdzKSB7XG4gICAgICAgICAgICBidWlsZEtleU1hcChjb25maWcuYXJncywgbWFwKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWFwO1xufTtcbmNvbnN0IHN0cmlwRW1wdHlTbG90cyA9IChwYXJhbXMpID0+IHtcbiAgICBmb3IgKGNvbnN0IFtzbG90LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMocGFyYW1zKSkge1xuICAgICAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmICFPYmplY3Qua2V5cyh2YWx1ZSkubGVuZ3RoKSB7XG4gICAgICAgICAgICBkZWxldGUgcGFyYW1zW3Nsb3RdO1xuICAgICAgICB9XG4gICAgfVxufTtcbmV4cG9ydCBjb25zdCBidWlsZENsaWVudFBhcmFtcyA9IChhcmdzLCBmaWVsZHMpID0+IHtcbiAgICBjb25zdCBwYXJhbXMgPSB7XG4gICAgICAgIGJvZHk6IHt9LFxuICAgICAgICBoZWFkZXJzOiB7fSxcbiAgICAgICAgcGF0aDoge30sXG4gICAgICAgIHF1ZXJ5OiB7fSxcbiAgICB9O1xuICAgIGNvbnN0IG1hcCA9IGJ1aWxkS2V5TWFwKGZpZWxkcyk7XG4gICAgbGV0IGNvbmZpZztcbiAgICBmb3IgKGNvbnN0IFtpbmRleCwgYXJnXSBvZiBhcmdzLmVudHJpZXMoKSkge1xuICAgICAgICBpZiAoZmllbGRzW2luZGV4XSkge1xuICAgICAgICAgICAgY29uZmlnID0gZmllbGRzW2luZGV4XTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWNvbmZpZykge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKFwiaW5cIiBpbiBjb25maWcpIHtcbiAgICAgICAgICAgIGlmIChjb25maWcua2V5KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZmllbGQgPSBtYXAuZ2V0KGNvbmZpZy5rZXkpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBmaWVsZC5tYXAgfHwgY29uZmlnLmtleTtcbiAgICAgICAgICAgICAgICBwYXJhbXNbZmllbGQuaW5dW25hbWVdID0gYXJnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcGFyYW1zLmJvZHkgPSBhcmc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhhcmcgPz8ge30pKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZmllbGQgPSBtYXAuZ2V0KGtleSk7XG4gICAgICAgICAgICAgICAgaWYgKGZpZWxkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBmaWVsZC5tYXAgfHwga2V5O1xuICAgICAgICAgICAgICAgICAgICBwYXJhbXNbZmllbGQuaW5dW25hbWVdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBleHRyYSA9IGV4dHJhUHJlZml4ZXMuZmluZCgoW3ByZWZpeF0pID0+IGtleS5zdGFydHNXaXRoKHByZWZpeCkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXh0cmEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IFtwcmVmaXgsIHNsb3RdID0gZXh0cmE7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXNbc2xvdF1ba2V5LnNsaWNlKHByZWZpeC5sZW5ndGgpXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBbc2xvdCwgYWxsb3dlZF0gb2YgT2JqZWN0LmVudHJpZXMoY29uZmlnLmFsbG93RXh0cmEgPz8ge30pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFsbG93ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXNbc2xvdF1ba2V5XSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgc3RyaXBFbXB0eVNsb3RzKHBhcmFtcyk7XG4gICAgcmV0dXJuIHBhcmFtcztcbn07XG4iLAogICAgIi8vIFRoaXMgZmlsZSBpcyBhdXRvLWdlbmVyYXRlZCBieSBAaGV5LWFwaS9vcGVuYXBpLXRzXG5pbXBvcnQgeyBjcmVhdGVDbGllbnQsIGNyZWF0ZUNvbmZpZyB9IGZyb20gXCIuL2NsaWVudC9pbmRleC5qc1wiO1xuZXhwb3J0IGNvbnN0IGNsaWVudCA9IGNyZWF0ZUNsaWVudChjcmVhdGVDb25maWcoe1xuICAgIGJhc2VVcmw6IFwiaHR0cDovL2xvY2FsaG9zdDo0MDk2XCIsXG59KSk7XG4iLAogICAgIi8vIFRoaXMgZmlsZSBpcyBhdXRvLWdlbmVyYXRlZCBieSBAaGV5LWFwaS9vcGVuYXBpLXRzXG5pbXBvcnQgeyBjbGllbnQgYXMgX2hleUFwaUNsaWVudCB9IGZyb20gXCIuL2NsaWVudC5nZW4uanNcIjtcbmNsYXNzIF9IZXlBcGlDbGllbnQge1xuICAgIF9jbGllbnQgPSBfaGV5QXBpQ2xpZW50O1xuICAgIGNvbnN0cnVjdG9yKGFyZ3MpIHtcbiAgICAgICAgaWYgKGFyZ3M/LmNsaWVudCkge1xuICAgICAgICAgICAgdGhpcy5fY2xpZW50ID0gYXJncy5jbGllbnQ7XG4gICAgICAgIH1cbiAgICB9XG59XG5jbGFzcyBHbG9iYWwgZXh0ZW5kcyBfSGV5QXBpQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBHZXQgZXZlbnRzXG4gICAgICovXG4gICAgZXZlbnQob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldC5zc2Uoe1xuICAgICAgICAgICAgdXJsOiBcIi9nbG9iYWwvZXZlbnRcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmNsYXNzIFByb2plY3QgZXh0ZW5kcyBfSGV5QXBpQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBMaXN0IGFsbCBwcm9qZWN0c1xuICAgICAqL1xuICAgIGxpc3Qob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Byb2plY3RcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGN1cnJlbnQgcHJvamVjdFxuICAgICAqL1xuICAgIGN1cnJlbnQob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Byb2plY3QvY3VycmVudFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuY2xhc3MgUHR5IGV4dGVuZHMgX0hleUFwaUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogTGlzdCBhbGwgUFRZIHNlc3Npb25zXG4gICAgICovXG4gICAgbGlzdChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvcHR5XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IFBUWSBzZXNzaW9uXG4gICAgICovXG4gICAgY3JlYXRlKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvcHR5XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnM/LmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVtb3ZlIGEgUFRZIHNlc3Npb25cbiAgICAgKi9cbiAgICByZW1vdmUob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZGVsZXRlKHtcbiAgICAgICAgICAgIHVybDogXCIvcHR5L3tpZH1cIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgUFRZIHNlc3Npb24gaW5mb1xuICAgICAqL1xuICAgIGdldChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9wdHkve2lkfVwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFVwZGF0ZSBQVFkgc2Vzc2lvblxuICAgICAqL1xuICAgIHVwZGF0ZShvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wdXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9wdHkve2lkfVwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zLmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ29ubmVjdCB0byBhIFBUWSBzZXNzaW9uXG4gICAgICovXG4gICAgY29ubmVjdChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9wdHkve2lkfS9jb25uZWN0XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG59XG5jbGFzcyBDb25maWcgZXh0ZW5kcyBfSGV5QXBpQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBHZXQgY29uZmlnIGluZm9cbiAgICAgKi9cbiAgICBnZXQob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL2NvbmZpZ1wiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFVwZGF0ZSBjb25maWdcbiAgICAgKi9cbiAgICB1cGRhdGUob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBhdGNoKHtcbiAgICAgICAgICAgIHVybDogXCIvY29uZmlnXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnM/LmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogTGlzdCBhbGwgcHJvdmlkZXJzXG4gICAgICovXG4gICAgcHJvdmlkZXJzKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9jb25maWcvcHJvdmlkZXJzXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG59XG5jbGFzcyBUb29sIGV4dGVuZHMgX0hleUFwaUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogTGlzdCBhbGwgdG9vbCBJRHMgKGluY2x1ZGluZyBidWlsdC1pbiBhbmQgZHluYW1pY2FsbHkgcmVnaXN0ZXJlZClcbiAgICAgKi9cbiAgICBpZHMob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL2V4cGVyaW1lbnRhbC90b29sL2lkc1wiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIExpc3QgdG9vbHMgd2l0aCBKU09OIHNjaGVtYSBwYXJhbWV0ZXJzIGZvciBhIHByb3ZpZGVyL21vZGVsXG4gICAgICovXG4gICAgbGlzdChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9leHBlcmltZW50YWwvdG9vbFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuY2xhc3MgSW5zdGFuY2UgZXh0ZW5kcyBfSGV5QXBpQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBEaXNwb3NlIHRoZSBjdXJyZW50IGluc3RhbmNlXG4gICAgICovXG4gICAgZGlzcG9zZShvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL2luc3RhbmNlL2Rpc3Bvc2VcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmNsYXNzIFBhdGggZXh0ZW5kcyBfSGV5QXBpQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGN1cnJlbnQgcGF0aFxuICAgICAqL1xuICAgIGdldChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvcGF0aFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuY2xhc3MgVmNzIGV4dGVuZHMgX0hleUFwaUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogR2V0IFZDUyBpbmZvIGZvciB0aGUgY3VycmVudCBpbnN0YW5jZVxuICAgICAqL1xuICAgIGdldChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvdmNzXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG59XG5jbGFzcyBTZXNzaW9uIGV4dGVuZHMgX0hleUFwaUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogTGlzdCBhbGwgc2Vzc2lvbnNcbiAgICAgKi9cbiAgICBsaXN0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9zZXNzaW9uXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IHNlc3Npb25cbiAgICAgKi9cbiAgICBjcmVhdGUob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi9zZXNzaW9uXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnM/LmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0IHNlc3Npb24gc3RhdHVzXG4gICAgICovXG4gICAgc3RhdHVzKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9zZXNzaW9uL3N0YXR1c1wiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERlbGV0ZSBhIHNlc3Npb24gYW5kIGFsbCBpdHMgZGF0YVxuICAgICAqL1xuICAgIGRlbGV0ZShvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5kZWxldGUoe1xuICAgICAgICAgICAgdXJsOiBcIi9zZXNzaW9uL3tpZH1cIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgc2Vzc2lvblxuICAgICAqL1xuICAgIGdldChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9zZXNzaW9uL3tpZH1cIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgc2Vzc2lvbiBwcm9wZXJ0aWVzXG4gICAgICovXG4gICAgdXBkYXRlKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBhdGNoKHtcbiAgICAgICAgICAgIHVybDogXCIvc2Vzc2lvbi97aWR9XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnMuaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgYSBzZXNzaW9uJ3MgY2hpbGRyZW5cbiAgICAgKi9cbiAgICBjaGlsZHJlbihvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9zZXNzaW9uL3tpZH0vY2hpbGRyZW5cIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHRvZG8gbGlzdCBmb3IgYSBzZXNzaW9uXG4gICAgICovXG4gICAgdG9kbyhvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9zZXNzaW9uL3tpZH0vdG9kb1wiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFuYWx5emUgdGhlIGFwcCBhbmQgY3JlYXRlIGFuIEFHRU5UUy5tZCBmaWxlXG4gICAgICovXG4gICAgaW5pdChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvc2Vzc2lvbi97aWR9L2luaXRcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEZvcmsgYW4gZXhpc3Rpbmcgc2Vzc2lvbiBhdCBhIHNwZWNpZmljIG1lc3NhZ2VcbiAgICAgKi9cbiAgICBmb3JrKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi9zZXNzaW9uL3tpZH0vZm9ya1wiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zLmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQWJvcnQgYSBzZXNzaW9uXG4gICAgICovXG4gICAgYWJvcnQob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Nlc3Npb24ve2lkfS9hYm9ydFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFVuc2hhcmUgdGhlIHNlc3Npb25cbiAgICAgKi9cbiAgICB1bnNoYXJlKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmRlbGV0ZSh7XG4gICAgICAgICAgICB1cmw6IFwiL3Nlc3Npb24ve2lkfS9zaGFyZVwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNoYXJlIGEgc2Vzc2lvblxuICAgICAqL1xuICAgIHNoYXJlKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi9zZXNzaW9uL3tpZH0vc2hhcmVcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGRpZmYgZm9yIHRoaXMgc2Vzc2lvblxuICAgICAqL1xuICAgIGRpZmYob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvc2Vzc2lvbi97aWR9L2RpZmZcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTdW1tYXJpemUgdGhlIHNlc3Npb25cbiAgICAgKi9cbiAgICBzdW1tYXJpemUob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Nlc3Npb24ve2lkfS9zdW1tYXJpemVcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIExpc3QgbWVzc2FnZXMgZm9yIGEgc2Vzc2lvblxuICAgICAqL1xuICAgIG1lc3NhZ2VzKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Nlc3Npb24ve2lkfS9tZXNzYWdlXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGFuZCBzZW5kIGEgbmV3IG1lc3NhZ2UgdG8gYSBzZXNzaW9uXG4gICAgICovXG4gICAgcHJvbXB0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi9zZXNzaW9uL3tpZH0vbWVzc2FnZVwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zLmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0IGEgbWVzc2FnZSBmcm9tIGEgc2Vzc2lvblxuICAgICAqL1xuICAgIG1lc3NhZ2Uob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvc2Vzc2lvbi97aWR9L21lc3NhZ2Uve21lc3NhZ2VJRH1cIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYW5kIHNlbmQgYSBuZXcgbWVzc2FnZSB0byBhIHNlc3Npb24sIHN0YXJ0IGlmIG5lZWRlZCBhbmQgcmV0dXJuIGltbWVkaWF0ZWx5XG4gICAgICovXG4gICAgcHJvbXB0QXN5bmMob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Nlc3Npb24ve2lkfS9wcm9tcHRfYXN5bmNcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNlbmQgYSBuZXcgY29tbWFuZCB0byBhIHNlc3Npb25cbiAgICAgKi9cbiAgICBjb21tYW5kKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi9zZXNzaW9uL3tpZH0vY29tbWFuZFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zLmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUnVuIGEgc2hlbGwgY29tbWFuZFxuICAgICAqL1xuICAgIHNoZWxsKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi9zZXNzaW9uL3tpZH0vc2hlbGxcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJldmVydCBhIG1lc3NhZ2VcbiAgICAgKi9cbiAgICByZXZlcnQob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Nlc3Npb24ve2lkfS9yZXZlcnRcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlc3RvcmUgYWxsIHJldmVydGVkIG1lc3NhZ2VzXG4gICAgICovXG4gICAgdW5yZXZlcnQob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Nlc3Npb24ve2lkfS91bnJldmVydFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuY2xhc3MgQ29tbWFuZCBleHRlbmRzIF9IZXlBcGlDbGllbnQge1xuICAgIC8qKlxuICAgICAqIExpc3QgYWxsIGNvbW1hbmRzXG4gICAgICovXG4gICAgbGlzdChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvY29tbWFuZFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuY2xhc3MgT2F1dGggZXh0ZW5kcyBfSGV5QXBpQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBBdXRob3JpemUgYSBwcm92aWRlciB1c2luZyBPQXV0aFxuICAgICAqL1xuICAgIGF1dGhvcml6ZShvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvcHJvdmlkZXIve2lkfS9vYXV0aC9hdXRob3JpemVcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEhhbmRsZSBPQXV0aCBjYWxsYmFjayBmb3IgYSBwcm92aWRlclxuICAgICAqL1xuICAgIGNhbGxiYWNrKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi9wcm92aWRlci97aWR9L29hdXRoL2NhbGxiYWNrXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnMuaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmNsYXNzIFByb3ZpZGVyIGV4dGVuZHMgX0hleUFwaUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogTGlzdCBhbGwgcHJvdmlkZXJzXG4gICAgICovXG4gICAgbGlzdChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvcHJvdmlkZXJcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgcHJvdmlkZXIgYXV0aGVudGljYXRpb24gbWV0aG9kc1xuICAgICAqL1xuICAgIGF1dGgob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Byb3ZpZGVyL2F1dGhcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBvYXV0aCA9IG5ldyBPYXV0aCh7IGNsaWVudDogdGhpcy5fY2xpZW50IH0pO1xufVxuY2xhc3MgRmluZCBleHRlbmRzIF9IZXlBcGlDbGllbnQge1xuICAgIC8qKlxuICAgICAqIEZpbmQgdGV4dCBpbiBmaWxlc1xuICAgICAqL1xuICAgIHRleHQob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvZmluZFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEZpbmQgZmlsZXNcbiAgICAgKi9cbiAgICBmaWxlcyhvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9maW5kL2ZpbGVcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBGaW5kIHdvcmtzcGFjZSBzeW1ib2xzXG4gICAgICovXG4gICAgc3ltYm9scyhvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9maW5kL3N5bWJvbFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuY2xhc3MgRmlsZSBleHRlbmRzIF9IZXlBcGlDbGllbnQge1xuICAgIC8qKlxuICAgICAqIExpc3QgZmlsZXMgYW5kIGRpcmVjdG9yaWVzXG4gICAgICovXG4gICAgbGlzdChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9maWxlXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVhZCBhIGZpbGVcbiAgICAgKi9cbiAgICByZWFkKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL2ZpbGUvY29udGVudFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCBmaWxlIHN0YXR1c1xuICAgICAqL1xuICAgIHN0YXR1cyhvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvZmlsZS9zdGF0dXNcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmNsYXNzIEFwcCBleHRlbmRzIF9IZXlBcGlDbGllbnQge1xuICAgIC8qKlxuICAgICAqIFdyaXRlIGEgbG9nIGVudHJ5IHRvIHRoZSBzZXJ2ZXIgbG9nc1xuICAgICAqL1xuICAgIGxvZyhvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL2xvZ1wiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zPy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIExpc3QgYWxsIGFnZW50c1xuICAgICAqL1xuICAgIGFnZW50cyhvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvYWdlbnRcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmNsYXNzIEF1dGggZXh0ZW5kcyBfSGV5QXBpQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBSZW1vdmUgT0F1dGggY3JlZGVudGlhbHMgZm9yIGFuIE1DUCBzZXJ2ZXJcbiAgICAgKi9cbiAgICByZW1vdmUob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZGVsZXRlKHtcbiAgICAgICAgICAgIHVybDogXCIvbWNwL3tuYW1lfS9hdXRoXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU3RhcnQgT0F1dGggYXV0aGVudGljYXRpb24gZmxvdyBmb3IgYW4gTUNQIHNlcnZlclxuICAgICAqL1xuICAgIHN0YXJ0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi9tY3Ave25hbWV9L2F1dGhcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDb21wbGV0ZSBPQXV0aCBhdXRoZW50aWNhdGlvbiB3aXRoIGF1dGhvcml6YXRpb24gY29kZVxuICAgICAqL1xuICAgIGNhbGxiYWNrKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi9tY3Ave25hbWV9L2F1dGgvY2FsbGJhY2tcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFN0YXJ0IE9BdXRoIGZsb3cgYW5kIHdhaXQgZm9yIGNhbGxiYWNrIChvcGVucyBicm93c2VyKVxuICAgICAqL1xuICAgIGF1dGhlbnRpY2F0ZShvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvbWNwL3tuYW1lfS9hdXRoL2F1dGhlbnRpY2F0ZVwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldCBhdXRoZW50aWNhdGlvbiBjcmVkZW50aWFsc1xuICAgICAqL1xuICAgIHNldChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wdXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9hdXRoL3tpZH1cIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuY2xhc3MgTWNwIGV4dGVuZHMgX0hleUFwaUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogR2V0IE1DUCBzZXJ2ZXIgc3RhdHVzXG4gICAgICovXG4gICAgc3RhdHVzKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9tY3BcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBZGQgTUNQIHNlcnZlciBkeW5hbWljYWxseVxuICAgICAqL1xuICAgIGFkZChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL21jcFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zPy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENvbm5lY3QgYW4gTUNQIHNlcnZlclxuICAgICAqL1xuICAgIGNvbm5lY3Qob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL21jcC97bmFtZX0vY29ubmVjdFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERpc2Nvbm5lY3QgYW4gTUNQIHNlcnZlclxuICAgICAqL1xuICAgIGRpc2Nvbm5lY3Qob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL21jcC97bmFtZX0vZGlzY29ubmVjdFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGF1dGggPSBuZXcgQXV0aCh7IGNsaWVudDogdGhpcy5fY2xpZW50IH0pO1xufVxuY2xhc3MgTHNwIGV4dGVuZHMgX0hleUFwaUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogR2V0IExTUCBzZXJ2ZXIgc3RhdHVzXG4gICAgICovXG4gICAgc3RhdHVzKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9sc3BcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmNsYXNzIEZvcm1hdHRlciBleHRlbmRzIF9IZXlBcGlDbGllbnQge1xuICAgIC8qKlxuICAgICAqIEdldCBmb3JtYXR0ZXIgc3RhdHVzXG4gICAgICovXG4gICAgc3RhdHVzKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9mb3JtYXR0ZXJcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmNsYXNzIENvbnRyb2wgZXh0ZW5kcyBfSGV5QXBpQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIG5leHQgVFVJIHJlcXVlc3QgZnJvbSB0aGUgcXVldWVcbiAgICAgKi9cbiAgICBuZXh0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi90dWkvY29udHJvbC9uZXh0XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU3VibWl0IGEgcmVzcG9uc2UgdG8gdGhlIFRVSSByZXF1ZXN0IHF1ZXVlXG4gICAgICovXG4gICAgcmVzcG9uc2Uob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi90dWkvY29udHJvbC9yZXNwb25zZVwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zPy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuY2xhc3MgVHVpIGV4dGVuZHMgX0hleUFwaUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogQXBwZW5kIHByb21wdCB0byB0aGUgVFVJXG4gICAgICovXG4gICAgYXBwZW5kUHJvbXB0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvdHVpL2FwcGVuZC1wcm9tcHRcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucz8uaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBPcGVuIHRoZSBoZWxwIGRpYWxvZ1xuICAgICAqL1xuICAgIG9wZW5IZWxwKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvdHVpL29wZW4taGVscFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE9wZW4gdGhlIHNlc3Npb24gZGlhbG9nXG4gICAgICovXG4gICAgb3BlblNlc3Npb25zKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvdHVpL29wZW4tc2Vzc2lvbnNcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBPcGVuIHRoZSB0aGVtZSBkaWFsb2dcbiAgICAgKi9cbiAgICBvcGVuVGhlbWVzKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvdHVpL29wZW4tdGhlbWVzXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogT3BlbiB0aGUgbW9kZWwgZGlhbG9nXG4gICAgICovXG4gICAgb3Blbk1vZGVscyhvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3R1aS9vcGVuLW1vZGVsc1wiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFN1Ym1pdCB0aGUgcHJvbXB0XG4gICAgICovXG4gICAgc3VibWl0UHJvbXB0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvdHVpL3N1Ym1pdC1wcm9tcHRcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDbGVhciB0aGUgcHJvbXB0XG4gICAgICovXG4gICAgY2xlYXJQcm9tcHQob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi90dWkvY2xlYXItcHJvbXB0XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRXhlY3V0ZSBhIFRVSSBjb21tYW5kIChlLmcuIGFnZW50X2N5Y2xlKVxuICAgICAqL1xuICAgIGV4ZWN1dGVDb21tYW5kKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvdHVpL2V4ZWN1dGUtY29tbWFuZFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zPy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNob3cgYSB0b2FzdCBub3RpZmljYXRpb24gaW4gdGhlIFRVSVxuICAgICAqL1xuICAgIHNob3dUb2FzdChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3R1aS9zaG93LXRvYXN0XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnM/LmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUHVibGlzaCBhIFRVSSBldmVudFxuICAgICAqL1xuICAgIHB1Ymxpc2gob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi90dWkvcHVibGlzaFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zPy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGNvbnRyb2wgPSBuZXcgQ29udHJvbCh7IGNsaWVudDogdGhpcy5fY2xpZW50IH0pO1xufVxuY2xhc3MgRXZlbnQgZXh0ZW5kcyBfSGV5QXBpQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBHZXQgZXZlbnRzXG4gICAgICovXG4gICAgc3Vic2NyaWJlKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQuc3NlKHtcbiAgICAgICAgICAgIHVybDogXCIvZXZlbnRcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBPcGVuY29kZUNsaWVudCBleHRlbmRzIF9IZXlBcGlDbGllbnQge1xuICAgIC8qKlxuICAgICAqIFJlc3BvbmQgdG8gYSBwZXJtaXNzaW9uIHJlcXVlc3RcbiAgICAgKi9cbiAgICBwb3N0U2Vzc2lvbklkUGVybWlzc2lvbnNQZXJtaXNzaW9uSWQob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Nlc3Npb24ve2lkfS9wZXJtaXNzaW9ucy97cGVybWlzc2lvbklEfVwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zLmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZ2xvYmFsID0gbmV3IEdsb2JhbCh7IGNsaWVudDogdGhpcy5fY2xpZW50IH0pO1xuICAgIHByb2plY3QgPSBuZXcgUHJvamVjdCh7IGNsaWVudDogdGhpcy5fY2xpZW50IH0pO1xuICAgIHB0eSA9IG5ldyBQdHkoeyBjbGllbnQ6IHRoaXMuX2NsaWVudCB9KTtcbiAgICBjb25maWcgPSBuZXcgQ29uZmlnKHsgY2xpZW50OiB0aGlzLl9jbGllbnQgfSk7XG4gICAgdG9vbCA9IG5ldyBUb29sKHsgY2xpZW50OiB0aGlzLl9jbGllbnQgfSk7XG4gICAgaW5zdGFuY2UgPSBuZXcgSW5zdGFuY2UoeyBjbGllbnQ6IHRoaXMuX2NsaWVudCB9KTtcbiAgICBwYXRoID0gbmV3IFBhdGgoeyBjbGllbnQ6IHRoaXMuX2NsaWVudCB9KTtcbiAgICB2Y3MgPSBuZXcgVmNzKHsgY2xpZW50OiB0aGlzLl9jbGllbnQgfSk7XG4gICAgc2Vzc2lvbiA9IG5ldyBTZXNzaW9uKHsgY2xpZW50OiB0aGlzLl9jbGllbnQgfSk7XG4gICAgY29tbWFuZCA9IG5ldyBDb21tYW5kKHsgY2xpZW50OiB0aGlzLl9jbGllbnQgfSk7XG4gICAgcHJvdmlkZXIgPSBuZXcgUHJvdmlkZXIoeyBjbGllbnQ6IHRoaXMuX2NsaWVudCB9KTtcbiAgICBmaW5kID0gbmV3IEZpbmQoeyBjbGllbnQ6IHRoaXMuX2NsaWVudCB9KTtcbiAgICBmaWxlID0gbmV3IEZpbGUoeyBjbGllbnQ6IHRoaXMuX2NsaWVudCB9KTtcbiAgICBhcHAgPSBuZXcgQXBwKHsgY2xpZW50OiB0aGlzLl9jbGllbnQgfSk7XG4gICAgbWNwID0gbmV3IE1jcCh7IGNsaWVudDogdGhpcy5fY2xpZW50IH0pO1xuICAgIGxzcCA9IG5ldyBMc3AoeyBjbGllbnQ6IHRoaXMuX2NsaWVudCB9KTtcbiAgICBmb3JtYXR0ZXIgPSBuZXcgRm9ybWF0dGVyKHsgY2xpZW50OiB0aGlzLl9jbGllbnQgfSk7XG4gICAgdHVpID0gbmV3IFR1aSh7IGNsaWVudDogdGhpcy5fY2xpZW50IH0pO1xuICAgIGF1dGggPSBuZXcgQXV0aCh7IGNsaWVudDogdGhpcy5fY2xpZW50IH0pO1xuICAgIGV2ZW50ID0gbmV3IEV2ZW50KHsgY2xpZW50OiB0aGlzLl9jbGllbnQgfSk7XG59XG4iLAogICAgImV4cG9ydCAqIGZyb20gXCIuL2dlbi90eXBlcy5nZW4uanNcIjtcbmltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gXCIuL2dlbi9jbGllbnQvY2xpZW50Lmdlbi5qc1wiO1xuaW1wb3J0IHsgT3BlbmNvZGVDbGllbnQgfSBmcm9tIFwiLi9nZW4vc2RrLmdlbi5qc1wiO1xuZXhwb3J0IHsgT3BlbmNvZGVDbGllbnQgfTtcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVPcGVuY29kZUNsaWVudChjb25maWcpIHtcbiAgICBpZiAoIWNvbmZpZz8uZmV0Y2gpIHtcbiAgICAgICAgY29uc3QgY3VzdG9tRmV0Y2ggPSAocmVxKSA9PiB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICByZXEudGltZW91dCA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuIGZldGNoKHJlcSk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbmZpZyA9IHtcbiAgICAgICAgICAgIC4uLmNvbmZpZyxcbiAgICAgICAgICAgIGZldGNoOiBjdXN0b21GZXRjaCxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgaWYgKGNvbmZpZz8uZGlyZWN0b3J5KSB7XG4gICAgICAgIGNvbmZpZy5oZWFkZXJzID0ge1xuICAgICAgICAgICAgLi4uY29uZmlnLmhlYWRlcnMsXG4gICAgICAgICAgICBcIngtb3BlbmNvZGUtZGlyZWN0b3J5XCI6IGNvbmZpZy5kaXJlY3RvcnksXG4gICAgICAgIH07XG4gICAgfVxuICAgIGNvbnN0IGNsaWVudCA9IGNyZWF0ZUNsaWVudChjb25maWcpO1xuICAgIHJldHVybiBuZXcgT3BlbmNvZGVDbGllbnQoeyBjbGllbnQgfSk7XG59XG4iLAogICAgImltcG9ydCB7IHNwYXduIH0gZnJvbSBcIm5vZGU6Y2hpbGRfcHJvY2Vzc1wiO1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZU9wZW5jb2RlU2VydmVyKG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgIGhvc3RuYW1lOiBcIjEyNy4wLjAuMVwiLFxuICAgICAgICBwb3J0OiA0MDk2LFxuICAgICAgICB0aW1lb3V0OiA1MDAwLFxuICAgIH0sIG9wdGlvbnMgPz8ge30pO1xuICAgIGNvbnN0IGFyZ3MgPSBbYHNlcnZlYCwgYC0taG9zdG5hbWU9JHtvcHRpb25zLmhvc3RuYW1lfWAsIGAtLXBvcnQ9JHtvcHRpb25zLnBvcnR9YF07XG4gICAgaWYgKG9wdGlvbnMuY29uZmlnPy5sb2dMZXZlbClcbiAgICAgICAgYXJncy5wdXNoKGAtLWxvZy1sZXZlbD0ke29wdGlvbnMuY29uZmlnLmxvZ0xldmVsfWApO1xuICAgIGNvbnN0IHByb2MgPSBzcGF3bihgb3BlbmNvZGVgLCBhcmdzLCB7XG4gICAgICAgIHNpZ25hbDogb3B0aW9ucy5zaWduYWwsXG4gICAgICAgIGVudjoge1xuICAgICAgICAgICAgLi4ucHJvY2Vzcy5lbnYsXG4gICAgICAgICAgICBPUEVOQ09ERV9DT05GSUdfQ09OVEVOVDogSlNPTi5zdHJpbmdpZnkob3B0aW9ucy5jb25maWcgPz8ge30pLFxuICAgICAgICB9LFxuICAgIH0pO1xuICAgIGNvbnN0IHVybCA9IGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgY29uc3QgaWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoYFRpbWVvdXQgd2FpdGluZyBmb3Igc2VydmVyIHRvIHN0YXJ0IGFmdGVyICR7b3B0aW9ucy50aW1lb3V0fW1zYCkpO1xuICAgICAgICB9LCBvcHRpb25zLnRpbWVvdXQpO1xuICAgICAgICBsZXQgb3V0cHV0ID0gXCJcIjtcbiAgICAgICAgcHJvYy5zdGRvdXQ/Lm9uKFwiZGF0YVwiLCAoY2h1bmspID0+IHtcbiAgICAgICAgICAgIG91dHB1dCArPSBjaHVuay50b1N0cmluZygpO1xuICAgICAgICAgICAgY29uc3QgbGluZXMgPSBvdXRwdXQuc3BsaXQoXCJcXG5cIik7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAobGluZS5zdGFydHNXaXRoKFwib3BlbmNvZGUgc2VydmVyIGxpc3RlbmluZ1wiKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBtYXRjaCA9IGxpbmUubWF0Y2goL29uXFxzKyhodHRwcz86XFwvXFwvW15cXHNdKykvKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFtYXRjaCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gcGFyc2Ugc2VydmVyIHVybCBmcm9tIG91dHB1dDogJHtsaW5lfWApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dChpZCk7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUobWF0Y2hbMV0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcHJvYy5zdGRlcnI/Lm9uKFwiZGF0YVwiLCAoY2h1bmspID0+IHtcbiAgICAgICAgICAgIG91dHB1dCArPSBjaHVuay50b1N0cmluZygpO1xuICAgICAgICB9KTtcbiAgICAgICAgcHJvYy5vbihcImV4aXRcIiwgKGNvZGUpID0+IHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChpZCk7XG4gICAgICAgICAgICBsZXQgbXNnID0gYFNlcnZlciBleGl0ZWQgd2l0aCBjb2RlICR7Y29kZX1gO1xuICAgICAgICAgICAgaWYgKG91dHB1dC50cmltKCkpIHtcbiAgICAgICAgICAgICAgICBtc2cgKz0gYFxcblNlcnZlciBvdXRwdXQ6ICR7b3V0cHV0fWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZWplY3QobmV3IEVycm9yKG1zZykpO1xuICAgICAgICB9KTtcbiAgICAgICAgcHJvYy5vbihcImVycm9yXCIsIChlcnJvcikgPT4ge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGlkKTtcbiAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAob3B0aW9ucy5zaWduYWwpIHtcbiAgICAgICAgICAgIG9wdGlvbnMuc2lnbmFsLmFkZEV2ZW50TGlzdGVuZXIoXCJhYm9ydFwiLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGlkKTtcbiAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKFwiQWJvcnRlZFwiKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiB7XG4gICAgICAgIHVybCxcbiAgICAgICAgY2xvc2UoKSB7XG4gICAgICAgICAgICBwcm9jLmtpbGwoKTtcbiAgICAgICAgfSxcbiAgICB9O1xufVxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU9wZW5jb2RlVHVpKG9wdGlvbnMpIHtcbiAgICBjb25zdCBhcmdzID0gW107XG4gICAgaWYgKG9wdGlvbnM/LnByb2plY3QpIHtcbiAgICAgICAgYXJncy5wdXNoKGAtLXByb2plY3Q9JHtvcHRpb25zLnByb2plY3R9YCk7XG4gICAgfVxuICAgIGlmIChvcHRpb25zPy5tb2RlbCkge1xuICAgICAgICBhcmdzLnB1c2goYC0tbW9kZWw9JHtvcHRpb25zLm1vZGVsfWApO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucz8uc2Vzc2lvbikge1xuICAgICAgICBhcmdzLnB1c2goYC0tc2Vzc2lvbj0ke29wdGlvbnMuc2Vzc2lvbn1gKTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnM/LmFnZW50KSB7XG4gICAgICAgIGFyZ3MucHVzaChgLS1hZ2VudD0ke29wdGlvbnMuYWdlbnR9YCk7XG4gICAgfVxuICAgIGNvbnN0IHByb2MgPSBzcGF3bihgb3BlbmNvZGVgLCBhcmdzLCB7XG4gICAgICAgIHNpZ25hbDogb3B0aW9ucz8uc2lnbmFsLFxuICAgICAgICBzdGRpbzogXCJpbmhlcml0XCIsXG4gICAgICAgIGVudjoge1xuICAgICAgICAgICAgLi4ucHJvY2Vzcy5lbnYsXG4gICAgICAgICAgICBPUEVOQ09ERV9DT05GSUdfQ09OVEVOVDogSlNPTi5zdHJpbmdpZnkob3B0aW9ucz8uY29uZmlnID8/IHt9KSxcbiAgICAgICAgfSxcbiAgICB9KTtcbiAgICByZXR1cm4ge1xuICAgICAgICBjbG9zZSgpIHtcbiAgICAgICAgICAgIHByb2Mua2lsbCgpO1xuICAgICAgICB9LFxuICAgIH07XG59XG4iLAogICAgImV4cG9ydCAqIGZyb20gXCIuL2NsaWVudC5qc1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vc2VydmVyLmpzXCI7XG5pbXBvcnQgeyBjcmVhdGVPcGVuY29kZUNsaWVudCB9IGZyb20gXCIuL2NsaWVudC5qc1wiO1xuaW1wb3J0IHsgY3JlYXRlT3BlbmNvZGVTZXJ2ZXIgfSBmcm9tIFwiLi9zZXJ2ZXIuanNcIjtcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjcmVhdGVPcGVuY29kZShvcHRpb25zKSB7XG4gICAgY29uc3Qgc2VydmVyID0gYXdhaXQgY3JlYXRlT3BlbmNvZGVTZXJ2ZXIoe1xuICAgICAgICAuLi5vcHRpb25zLFxuICAgIH0pO1xuICAgIGNvbnN0IGNsaWVudCA9IGNyZWF0ZU9wZW5jb2RlQ2xpZW50KHtcbiAgICAgICAgYmFzZVVybDogc2VydmVyLnVybCxcbiAgICB9KTtcbiAgICByZXR1cm4ge1xuICAgICAgICBjbGllbnQsXG4gICAgICAgIHNlcnZlcixcbiAgICB9O1xufVxuIiwKICAgICJpbXBvcnQgZnMgZnJvbSBcIm5vZGU6ZnMvcHJvbWlzZXNcIjtcbi8qKlxuICogU3RydWN0dXJlZCBsb2dnaW5nIGZvciBhaS1lbmcgcmFscGhcbiAqXG4gKiBTdXBwb3J0cyBib3RoIHN0ZGVyciBvdXRwdXQgKHdpdGggLS1wcmludC1sb2dzKSBhbmQgZmlsZS1iYXNlZCBsb2dnaW5nXG4gKi9cbmltcG9ydCBwYXRoIGZyb20gXCJub2RlOnBhdGhcIjtcblxuZXhwb3J0IG5hbWVzcGFjZSBMb2cge1xuICAgIGV4cG9ydCB0eXBlIExldmVsID0gXCJERUJVR1wiIHwgXCJJTkZPXCIgfCBcIldBUk5cIiB8IFwiRVJST1JcIjtcblxuICAgIGNvbnN0IGxldmVsUHJpb3JpdHk6IFJlY29yZDxMZXZlbCwgbnVtYmVyPiA9IHtcbiAgICAgICAgREVCVUc6IDAsXG4gICAgICAgIElORk86IDEsXG4gICAgICAgIFdBUk46IDIsXG4gICAgICAgIEVSUk9SOiAzLFxuICAgIH07XG5cbiAgICBsZXQgY3VycmVudExldmVsOiBMZXZlbCA9IFwiSU5GT1wiO1xuICAgIGxldCBsb2dQYXRoID0gXCJcIjtcbiAgICBsZXQgd3JpdGU6IChtc2c6IHN0cmluZykgPT4gYW55ID0gKG1zZykgPT4gcHJvY2Vzcy5zdGRlcnIud3JpdGUobXNnKTtcblxuICAgIGZ1bmN0aW9uIHNob3VsZExvZyhsZXZlbDogTGV2ZWwpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIGxldmVsUHJpb3JpdHlbbGV2ZWxdID49IGxldmVsUHJpb3JpdHlbY3VycmVudExldmVsXTtcbiAgICB9XG5cbiAgICBleHBvcnQgaW50ZXJmYWNlIE9wdGlvbnMge1xuICAgICAgICBwcmludDogYm9vbGVhbjsgLy8gV2hlbiB0cnVlLCB3cml0ZSB0byBzdGRlcnJcbiAgICAgICAgbGV2ZWw/OiBMZXZlbDtcbiAgICAgICAgbG9nRGlyPzogc3RyaW5nOyAvLyBEaXJlY3RvcnkgZm9yIGxvZyBmaWxlc1xuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiBmaWxlKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBsb2dQYXRoO1xuICAgIH1cblxuICAgIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbml0KG9wdGlvbnM6IE9wdGlvbnMpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgaWYgKG9wdGlvbnMubGV2ZWwpIGN1cnJlbnRMZXZlbCA9IG9wdGlvbnMubGV2ZWw7XG5cbiAgICAgICAgLy8gQnVpbGQgdGhlIHdyaXRlIGZ1bmN0aW9uIHRoYXQgb3V0cHV0cyB0byBCT1RIIHN0ZGVyciBBTkQgZmlsZVxuICAgICAgICBjb25zdCBzdGRlcnJXcml0ZXIgPSAobXNnOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIHByb2Nlc3Muc3RkZXJyLndyaXRlKG1zZyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKG9wdGlvbnMubG9nRGlyKSB7XG4gICAgICAgICAgICBjb25zdCB0aW1lc3RhbXAgPSBuZXcgRGF0ZSgpXG4gICAgICAgICAgICAgICAgLnRvSVNPU3RyaW5nKClcbiAgICAgICAgICAgICAgICAucmVwbGFjZSgvWzouXS9nLCBcIi1cIilcbiAgICAgICAgICAgICAgICAuc2xpY2UoMCwgLTEpO1xuICAgICAgICAgICAgbG9nUGF0aCA9IHBhdGguam9pbihvcHRpb25zLmxvZ0RpciwgYHJhbHBoLSR7dGltZXN0YW1wfS5sb2dgKTtcbiAgICAgICAgICAgIGF3YWl0IGZzLm1rZGlyKG9wdGlvbnMubG9nRGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcblxuICAgICAgICAgICAgY29uc3QgZmlsZSA9IEJ1bi5maWxlKGxvZ1BhdGgpO1xuICAgICAgICAgICAgY29uc3QgZmlsZVdyaXRlciA9IGZpbGUud3JpdGVyKCk7XG5cbiAgICAgICAgICAgIC8vIEFsd2F5cyB3cml0ZSB0byBzdGRlcnIgaWYgcHJpbnQgaXMgZW5hYmxlZFxuICAgICAgICAgICAgLy8gQWxzbyBhbHdheXMgd3JpdGUgdG8gZmlsZSBpZiBsb2dEaXIgaXMgcHJvdmlkZWRcbiAgICAgICAgICAgIHdyaXRlID0gKG1zZykgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLnByaW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHN0ZGVycldyaXRlcihtc2cpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaWxlV3JpdGVyLndyaXRlKG1zZyk7XG4gICAgICAgICAgICAgICAgZmlsZVdyaXRlci5mbHVzaCgpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmIChvcHRpb25zLnByaW50KSB7XG4gICAgICAgICAgICAvLyBPbmx5IHByaW50IHRvIHN0ZGVyclxuICAgICAgICAgICAgd3JpdGUgPSBzdGRlcnJXcml0ZXI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBleHBvcnQgaW50ZXJmYWNlIExvZ2dlciB7XG4gICAgICAgIGRlYnVnKG1lc3NhZ2U6IHN0cmluZywgZXh0cmE/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+KTogdm9pZDtcbiAgICAgICAgaW5mbyhtZXNzYWdlOiBzdHJpbmcsIGV4dHJhPzogUmVjb3JkPHN0cmluZywgYW55Pik6IHZvaWQ7XG4gICAgICAgIHdhcm4obWVzc2FnZTogc3RyaW5nLCBleHRyYT86IFJlY29yZDxzdHJpbmcsIGFueT4pOiB2b2lkO1xuICAgICAgICBlcnJvcihtZXNzYWdlOiBzdHJpbmcsIGV4dHJhPzogUmVjb3JkPHN0cmluZywgYW55Pik6IHZvaWQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZm9ybWF0RXh0cmEoZXh0cmE/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+KTogc3RyaW5nIHtcbiAgICAgICAgaWYgKCFleHRyYSkgcmV0dXJuIFwiXCI7XG4gICAgICAgIGNvbnN0IGV4dHJhU3RyID0gT2JqZWN0LmVudHJpZXMoZXh0cmEpXG4gICAgICAgICAgICAubWFwKFxuICAgICAgICAgICAgICAgIChbaywgdl0pID0+XG4gICAgICAgICAgICAgICAgICAgIGAke2t9PSR7dHlwZW9mIHYgPT09IFwib2JqZWN0XCIgPyBKU09OLnN0cmluZ2lmeSh2KSA6IHZ9YCxcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIC5qb2luKFwiIFwiKTtcbiAgICAgICAgcmV0dXJuIGV4dHJhU3RyID8gYCAke2V4dHJhU3RyfWAgOiBcIlwiO1xuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiBjcmVhdGUodGFncz86IFJlY29yZDxzdHJpbmcsIHN0cmluZz4pOiBMb2dnZXIge1xuICAgICAgICBjb25zdCB0YWdTdHIgPSB0YWdzXG4gICAgICAgICAgICA/IE9iamVjdC5lbnRyaWVzKHRhZ3MpXG4gICAgICAgICAgICAgICAgICAubWFwKChbaywgdl0pID0+IGAke2t9PSR7dn1gKVxuICAgICAgICAgICAgICAgICAgLmpvaW4oXCIgXCIpXG4gICAgICAgICAgICA6IFwiXCI7XG4gICAgICAgIGNvbnN0IHRhZ1N0cldpdGhTcGFjZSA9IHRhZ1N0ciA/IGAke3RhZ1N0cn0gYCA6IFwiXCI7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRlYnVnKG1lc3NhZ2U6IHN0cmluZywgZXh0cmE/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+KSB7XG4gICAgICAgICAgICAgICAgaWYgKHNob3VsZExvZyhcIkRFQlVHXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHdyaXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgYERFQlVHICR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpfSAke3RhZ1N0cn0ke21lc3NhZ2V9JHtmb3JtYXRFeHRyYShleHRyYSl9XFxuYCxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaW5mbyhtZXNzYWdlOiBzdHJpbmcsIGV4dHJhPzogUmVjb3JkPHN0cmluZywgYW55Pikge1xuICAgICAgICAgICAgICAgIGlmIChzaG91bGRMb2coXCJJTkZPXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHdyaXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgYElORk8gICR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpfSAke3RhZ1N0cn0ke21lc3NhZ2V9JHtmb3JtYXRFeHRyYShleHRyYSl9XFxuYCxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgd2FybihtZXNzYWdlOiBzdHJpbmcsIGV4dHJhPzogUmVjb3JkPHN0cmluZywgYW55Pikge1xuICAgICAgICAgICAgICAgIGlmIChzaG91bGRMb2coXCJXQVJOXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHdyaXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgYFdBUk4gICR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpfSAke3RhZ1N0cn0ke21lc3NhZ2V9JHtmb3JtYXRFeHRyYShleHRyYSl9XFxuYCxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZXJyb3IobWVzc2FnZTogc3RyaW5nLCBleHRyYT86IFJlY29yZDxzdHJpbmcsIGFueT4pIHtcbiAgICAgICAgICAgICAgICBpZiAoc2hvdWxkTG9nKFwiRVJST1JcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgd3JpdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICBgRVJST1IgJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCl9ICR7dGFnU3RyfSR7bWVzc2FnZX0ke2Zvcm1hdEV4dHJhKGV4dHJhKX1cXG5gLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZXhwb3J0IGNvbnN0IERlZmF1bHQgPSBjcmVhdGUoeyBzZXJ2aWNlOiBcInJhbHBoXCIgfSk7XG59XG4iLAogICAgIi8qKlxuICogQ0xJIFVJIHV0aWxpdGllcyBmb3IgYWktZW5nIHJhbHBoXG4gKlxuICogQ29uc29sZSBzdHlsaW5nIGFuZCBvdXRwdXQgaGVscGVyc1xuICovXG5pbXBvcnQgeyBFT0wgfSBmcm9tIFwibm9kZTpvc1wiO1xuXG5leHBvcnQgbmFtZXNwYWNlIFVJIHtcbiAgICBleHBvcnQgY29uc3QgU3R5bGUgPSB7XG4gICAgICAgIC8vIENvbG9yc1xuICAgICAgICBURVhUX0hJR0hMSUdIVDogXCJcXHgxYls5Nm1cIixcbiAgICAgICAgVEVYVF9ISUdITElHSFRfQk9MRDogXCJcXHgxYls5Nm1cXHgxYlsxbVwiLFxuICAgICAgICBURVhUX0RJTTogXCJcXHgxYls5MG1cIixcbiAgICAgICAgVEVYVF9ESU1fQk9MRDogXCJcXHgxYls5MG1cXHgxYlsxbVwiLFxuICAgICAgICBURVhUX05PUk1BTDogXCJcXHgxYlswbVwiLFxuICAgICAgICBURVhUX05PUk1BTF9CT0xEOiBcIlxceDFiWzFtXCIsXG4gICAgICAgIFRFWFRfV0FSTklORzogXCJcXHgxYls5M21cIixcbiAgICAgICAgVEVYVF9XQVJOSU5HX0JPTEQ6IFwiXFx4MWJbOTNtXFx4MWJbMW1cIixcbiAgICAgICAgVEVYVF9EQU5HRVI6IFwiXFx4MWJbOTFtXCIsXG4gICAgICAgIFRFWFRfREFOR0VSX0JPTEQ6IFwiXFx4MWJbOTFtXFx4MWJbMW1cIixcbiAgICAgICAgVEVYVF9TVUNDRVNTOiBcIlxceDFiWzkybVwiLFxuICAgICAgICBURVhUX1NVQ0NFU1NfQk9MRDogXCJcXHgxYls5Mm1cXHgxYlsxbVwiLFxuICAgICAgICBURVhUX0lORk86IFwiXFx4MWJbOTRtXCIsXG4gICAgICAgIFRFWFRfSU5GT19CT0xEOiBcIlxceDFiWzk0bVxceDFiWzFtXCIsXG4gICAgfTtcblxuICAgIGV4cG9ydCBmdW5jdGlvbiBwcmludGxuKC4uLm1lc3NhZ2U6IHN0cmluZ1tdKTogdm9pZCB7XG4gICAgICAgIHByb2Nlc3Muc3RkZXJyLndyaXRlKG1lc3NhZ2Uuam9pbihcIiBcIikgKyBFT0wpO1xuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiBwcmludCguLi5tZXNzYWdlOiBzdHJpbmdbXSk6IHZvaWQge1xuICAgICAgICBwcm9jZXNzLnN0ZGVyci53cml0ZShtZXNzYWdlLmpvaW4oXCIgXCIpKTtcbiAgICB9XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gZXJyb3IobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIHByaW50bG4oXG4gICAgICAgICAgICBgJHtTdHlsZS5URVhUX0RBTkdFUl9CT0xEfUVycm9yOiAke1N0eWxlLlRFWFRfTk9STUFMfSR7bWVzc2FnZX1gLFxuICAgICAgICApO1xuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiBzdWNjZXNzKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBwcmludGxuKGAke1N0eWxlLlRFWFRfU1VDQ0VTU19CT0xEfeKckyAke1N0eWxlLlRFWFRfTk9STUFMfSR7bWVzc2FnZX1gKTtcbiAgICB9XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gaW5mbyhtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgcHJpbnRsbihgJHtTdHlsZS5URVhUX0lORk9fQk9MRH3ihLkgJHtTdHlsZS5URVhUX05PUk1BTH0ke21lc3NhZ2V9YCk7XG4gICAgfVxuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHdhcm4obWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIHByaW50bG4oYCR7U3R5bGUuVEVYVF9XQVJOSU5HX0JPTER9ISAke1N0eWxlLlRFWFRfTk9STUFMfSR7bWVzc2FnZX1gKTtcbiAgICB9XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gaGVhZGVyKHRpdGxlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgcHJpbnRsbigpO1xuICAgICAgICBwcmludGxuKFN0eWxlLlRFWFRfSElHSExJR0hUX0JPTEQgKyB0aXRsZSArIFN0eWxlLlRFWFRfTk9STUFMKTtcbiAgICAgICAgcHJpbnRsbihTdHlsZS5URVhUX0RJTSArIFwi4pSAXCIucmVwZWF0KDUwKSArIFN0eWxlLlRFWFRfTk9STUFMKTtcbiAgICB9XG59XG4iLAogICAgIi8qKlxuICogUHJvbXB0IEFuYWx5emVyXG4gKlxuICogQW5hbHl6ZXMgdXNlciBwcm9tcHRzIHRvIGRldGVybWluZSBjb21wbGV4aXR5LCBkb21haW4sXG4gKiBhbmQgbWlzc2luZyBjb250ZXh0LiBVc2VzIGEgY29tYmluYXRpb24gb2Ygd29yZCBjb3VudCxcbiAqIGtleXdvcmQgZGV0ZWN0aW9uLCBhbmQgcGF0dGVybiBtYXRjaGluZy5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7IEFuYWx5c2lzUmVzdWx0LCBDb21wbGV4aXR5LCBEb21haW4sIFRlY2huaXF1ZUlkIH0gZnJvbSBcIi4vdHlwZXNcIjtcblxuLyoqXG4gKiBLZXl3b3JkcyBmb3IgY29tcGxleGl0eSBkZXRlY3Rpb25cbiAqL1xuY29uc3QgQ09NUExFWElUWV9LRVlXT1JEUyA9IHtcbiAgICBkZWJ1ZzogW1wiZGVidWdcIiwgXCJmaXhcIiwgXCJlcnJvclwiLCBcImJ1Z1wiLCBcImlzc3VlXCIsIFwicHJvYmxlbVwiLCBcInRyb3VibGVzaG9vdFwiXSxcbiAgICBkZXNpZ246IFtcbiAgICAgICAgXCJkZXNpZ25cIixcbiAgICAgICAgXCJhcmNoaXRlY3R1cmVcIixcbiAgICAgICAgXCJhcmNoaXRlY3RcIixcbiAgICAgICAgXCJzdHJ1Y3R1cmVcIixcbiAgICAgICAgXCJwYXR0ZXJuXCIsXG4gICAgICAgIFwiYXBwcm9hY2hcIixcbiAgICBdLFxuICAgIG9wdGltaXplOiBbXG4gICAgICAgIFwib3B0aW1pemVcIixcbiAgICAgICAgXCJpbXByb3ZlXCIsXG4gICAgICAgIFwicGVyZm9ybWFuY2VcIixcbiAgICAgICAgXCJlZmZpY2llbnRcIixcbiAgICAgICAgXCJmYXN0XCIsXG4gICAgICAgIFwic2NhbGVcIixcbiAgICBdLFxuICAgIGltcGxlbWVudDogW1wiaW1wbGVtZW50XCIsIFwiYnVpbGRcIiwgXCJjcmVhdGVcIiwgXCJkZXZlbG9wXCIsIFwid3JpdGVcIiwgXCJjb2RlXCJdLFxuICAgIGNvbXBsZXg6IFtcImNvbXBsZXhcIiwgXCJjaGFsbGVuZ2VcIiwgXCJkaWZmaWN1bHRcIiwgXCJhZHZhbmNlZFwiLCBcInNvcGhpc3RpY2F0ZWRcIl0sXG59O1xuXG4vKipcbiAqIERvbWFpbi1zcGVjaWZpYyBrZXl3b3Jkc1xuICovXG5jb25zdCBET01BSU5fS0VZV09SRFM6IFJlY29yZDxEb21haW4sIHN0cmluZ1tdPiA9IHtcbiAgICBzZWN1cml0eTogW1xuICAgICAgICBcImF1dGhcIixcbiAgICAgICAgXCJhdXRoZW50aWNhdGlvblwiLFxuICAgICAgICBcImp3dFwiLFxuICAgICAgICBcIm9hdXRoXCIsXG4gICAgICAgIFwicGFzc3dvcmRcIixcbiAgICAgICAgXCJlbmNyeXB0XCIsXG4gICAgICAgIFwiZGVjcnlwdFwiLFxuICAgICAgICBcInNlY3VyaXR5XCIsXG4gICAgICAgIFwidG9rZW5cIixcbiAgICAgICAgXCJzZXNzaW9uXCIsXG4gICAgICAgIFwiY3NyZlwiLFxuICAgICAgICBcInhzc1wiLFxuICAgICAgICBcImluamVjdGlvblwiLFxuICAgICAgICBcInZ1bG5lcmFiaWxpdHlcIixcbiAgICAgICAgXCJoYWNrXCIsXG4gICAgICAgIFwiYXR0YWNrXCIsXG4gICAgXSxcbiAgICBmcm9udGVuZDogW1xuICAgICAgICBcInJlYWN0XCIsXG4gICAgICAgIFwidnVlXCIsXG4gICAgICAgIFwiYW5ndWxhclwiLFxuICAgICAgICBcImNvbXBvbmVudFwiLFxuICAgICAgICBcImNzc1wiLFxuICAgICAgICBcImh0bWxcIixcbiAgICAgICAgXCJ1aVwiLFxuICAgICAgICBcInV4XCIsXG4gICAgICAgIFwicmVuZGVyXCIsXG4gICAgICAgIFwic3RhdGVcIixcbiAgICAgICAgXCJob29rXCIsXG4gICAgICAgIFwicHJvcHNcIixcbiAgICAgICAgXCJkb21cIixcbiAgICAgICAgXCJmcm9udGVuZFwiLFxuICAgICAgICBcImNsaWVudFwiLFxuICAgIF0sXG4gICAgYmFja2VuZDogW1xuICAgICAgICBcImFwaVwiLFxuICAgICAgICBcInNlcnZlclwiLFxuICAgICAgICBcImVuZHBvaW50XCIsXG4gICAgICAgIFwiZGF0YWJhc2VcIixcbiAgICAgICAgXCJxdWVyeVwiLFxuICAgICAgICBcImJhY2tlbmRcIixcbiAgICAgICAgXCJzZXJ2aWNlXCIsXG4gICAgICAgIFwibWljcm9zZXJ2aWNlXCIsXG4gICAgICAgIFwicmVzdFwiLFxuICAgICAgICBcImdyYXBocWxcIixcbiAgICAgICAgXCJodHRwXCIsXG4gICAgICAgIFwicmVxdWVzdFwiLFxuICAgICAgICBcInJlc3BvbnNlXCIsXG4gICAgXSxcbiAgICBkYXRhYmFzZTogW1xuICAgICAgICBcInNxbFwiLFxuICAgICAgICBcInBvc3RncmVzcWxcIixcbiAgICAgICAgXCJteXNxbFwiLFxuICAgICAgICBcIm1vbmdvZGJcIixcbiAgICAgICAgXCJyZWRpc1wiLFxuICAgICAgICBcInF1ZXJ5XCIsXG4gICAgICAgIFwiaW5kZXhcIixcbiAgICAgICAgXCJzY2hlbWFcIixcbiAgICAgICAgXCJtaWdyYXRpb25cIixcbiAgICAgICAgXCJkYXRhYmFzZVwiLFxuICAgICAgICBcImRiXCIsXG4gICAgICAgIFwiam9pblwiLFxuICAgICAgICBcInRyYW5zYWN0aW9uXCIsXG4gICAgICAgIFwib3JtXCIsXG4gICAgXSxcbiAgICBkZXZvcHM6IFtcbiAgICAgICAgXCJkZXBsb3lcIixcbiAgICAgICAgXCJjaS9jZFwiLFxuICAgICAgICBcImRvY2tlclwiLFxuICAgICAgICBcImt1YmVybmV0ZXNcIixcbiAgICAgICAgXCJrOHNcIixcbiAgICAgICAgXCJwaXBlbGluZVwiLFxuICAgICAgICBcImluZnJhc3RydWN0dXJlXCIsXG4gICAgICAgIFwiYXdzXCIsXG4gICAgICAgIFwiZ2NwXCIsXG4gICAgICAgIFwiYXp1cmVcIixcbiAgICAgICAgXCJ0ZXJyYWZvcm1cIixcbiAgICAgICAgXCJhbnNpYmxlXCIsXG4gICAgICAgIFwiamVua2luc1wiLFxuICAgICAgICBcImRldm9wc1wiLFxuICAgICAgICBcIm9wc1wiLFxuICAgIF0sXG4gICAgYXJjaGl0ZWN0dXJlOiBbXG4gICAgICAgIFwiYXJjaGl0ZWN0dXJlXCIsXG4gICAgICAgIFwiZGVzaWduXCIsXG4gICAgICAgIFwicGF0dGVyblwiLFxuICAgICAgICBcIm1pY3Jvc2VydmljZXNcIixcbiAgICAgICAgXCJtb25vbGl0aFwiLFxuICAgICAgICBcInNjYWxhYmlsaXR5XCIsXG4gICAgICAgIFwic3lzdGVtXCIsXG4gICAgICAgIFwiZGlzdHJpYnV0ZWRcIixcbiAgICAgICAgXCJhcmNoaXRlY3RcIixcbiAgICAgICAgXCJoaWdoLWxldmVsXCIsXG4gICAgXSxcbiAgICB0ZXN0aW5nOiBbXG4gICAgICAgIFwidGVzdFwiLFxuICAgICAgICBcInNwZWNcIixcbiAgICAgICAgXCJ1bml0IHRlc3RcIixcbiAgICAgICAgXCJpbnRlZ3JhdGlvbiB0ZXN0XCIsXG4gICAgICAgIFwiZTJlXCIsXG4gICAgICAgIFwiamVzdFwiLFxuICAgICAgICBcImN5cHJlc3NcIixcbiAgICAgICAgXCJwbGF5d3JpZ2h0XCIsXG4gICAgICAgIFwidGVzdGluZ1wiLFxuICAgICAgICBcInRkZFwiLFxuICAgICAgICBcImNvdmVyYWdlXCIsXG4gICAgICAgIFwibW9ja1wiLFxuICAgICAgICBcInN0dWJcIixcbiAgICBdLFxuICAgIGdlbmVyYWw6IFtdLCAvLyBGYWxsYmFjayBkb21haW5cbn07XG5cbi8qKlxuICogU2ltcGxlIHByb21wdCBwYXR0ZXJucyAoZ3JlZXRpbmdzLCBzaW1wbGUgcXVlc3Rpb25zKVxuICovXG5jb25zdCBTSU1QTEVfUEFUVEVSTlMgPSBbXG4gICAgL14oaGVsbG98aGl8aGV5fGdyZWV0aW5nc3xnb29kIG1vcm5pbmd8Z29vZCBldmVuaW5nKS9pLFxuICAgIC9eKHRoYW5rc3x0aGFuayB5b3V8dGh4KS9pLFxuICAgIC9eKHllc3xub3xva3xzdXJlfGFscmlnaHQpL2ksXG4gICAgL14od2hhdHxob3d8d2h5fHdoZW58d2hlcmV8d2hvfHdoaWNoKVxccytcXHcrXFw/PyQvaSwgLy8gU2ltcGxlIHNpbmdsZSBxdWVzdGlvbnNcbiAgICAvXihoZWxwfGFzc2lzdClcXHMqJC9pLFxuXTtcblxuLyoqXG4gKiBDYWxjdWxhdGUgY29tcGxleGl0eSBzY29yZSBmb3IgYSBwcm9tcHRcbiAqL1xuZnVuY3Rpb24gY2FsY3VsYXRlQ29tcGxleGl0eVNjb3JlKHByb21wdDogc3RyaW5nKTogbnVtYmVyIHtcbiAgICBjb25zdCB3b3JkcyA9IHByb21wdC5zcGxpdCgvXFxzKy8pO1xuICAgIGNvbnN0IHdvcmRDb3VudCA9IHdvcmRzLmxlbmd0aDtcblxuICAgIGxldCBzY29yZSA9IDA7XG5cbiAgICAvLyBXb3JkIGNvdW50IGNvbnRyaWJ1dGlvbiAoMC0xMCBwb2ludHMpXG4gICAgaWYgKHdvcmRDb3VudCA8IDUpIHNjb3JlICs9IDA7XG4gICAgZWxzZSBpZiAod29yZENvdW50IDwgMTApIHNjb3JlICs9IDM7XG4gICAgZWxzZSBpZiAod29yZENvdW50IDwgMjApIHNjb3JlICs9IDY7XG4gICAgZWxzZSBzY29yZSArPSAxMDtcblxuICAgIC8vIEtleXdvcmQgY29udHJpYnV0aW9uICgwLTEwIHBvaW50cylcbiAgICBjb25zdCBsb3dlclByb21wdCA9IHByb21wdC50b0xvd2VyQ2FzZSgpO1xuICAgIGZvciAoY29uc3QgY2F0ZWdvcnkgb2YgT2JqZWN0LnZhbHVlcyhDT01QTEVYSVRZX0tFWVdPUkRTKSkge1xuICAgICAgICBmb3IgKGNvbnN0IGtleXdvcmQgb2YgY2F0ZWdvcnkpIHtcbiAgICAgICAgICAgIGlmIChsb3dlclByb21wdC5pbmNsdWRlcyhrZXl3b3JkKSkge1xuICAgICAgICAgICAgICAgIHNjb3JlICs9IDI7XG4gICAgICAgICAgICAgICAgYnJlYWs7IC8vIE9uZSBrZXl3b3JkIHBlciBjYXRlZ29yeVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gUXVlc3Rpb24gbWFya3MgcmVkdWNlIGNvbXBsZXhpdHkgKGFza2luZyBmb3IgaW5mbyBpcyBzaW1wbGVyKVxuICAgIGNvbnN0IHF1ZXN0aW9uTWFya3MgPSAocHJvbXB0Lm1hdGNoKC9cXD8vZykgfHwgW10pLmxlbmd0aDtcbiAgICBzY29yZSAtPSBNYXRoLm1pbihxdWVzdGlvbk1hcmtzICogMiwgNSk7XG5cbiAgICAvLyBUZWNobmljYWwgdGVybXMgaW5jcmVhc2UgY29tcGxleGl0eVxuICAgIGNvbnN0IHRlY2hUZXJtcyA9IHdvcmRzLmZpbHRlcigod29yZCkgPT4ge1xuICAgICAgICBjb25zdCBsb3dlciA9IHdvcmQudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIC9cXHd7NCx9Ly50ZXN0KHdvcmQpICYmXG4gICAgICAgICAgICAhW1widGhpc1wiLCBcInRoYXRcIiwgXCJ3aXRoXCIsIFwiZnJvbVwiLCBcImludG9cIl0uaW5jbHVkZXMobG93ZXIpXG4gICAgICAgICk7XG4gICAgfSk7XG4gICAgc2NvcmUgKz0gTWF0aC5taW4odGVjaFRlcm1zLmxlbmd0aCAqIDAuNSwgNSk7XG5cbiAgICByZXR1cm4gTWF0aC5tYXgoMCwgTWF0aC5taW4oMjAsIHNjb3JlKSk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGNvbXBsZXhpdHkgZnJvbSBzY29yZVxuICovXG5mdW5jdGlvbiBzY29yZVRvQ29tcGxleGl0eShzY29yZTogbnVtYmVyKTogQ29tcGxleGl0eSB7XG4gICAgaWYgKHNjb3JlIDwgNSkgcmV0dXJuIFwic2ltcGxlXCI7XG4gICAgaWYgKHNjb3JlIDwgMTIpIHJldHVybiBcIm1lZGl1bVwiO1xuICAgIHJldHVybiBcImNvbXBsZXhcIjtcbn1cblxuLyoqXG4gKiBDaGVjayBpZiBwcm9tcHQgbWF0Y2hlcyBzaW1wbGUgcGF0dGVybnNcbiAqL1xuZnVuY3Rpb24gaXNTaW1wbGVQcm9tcHQocHJvbXB0OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBmb3IgKGNvbnN0IHBhdHRlcm4gb2YgU0lNUExFX1BBVFRFUk5TKSB7XG4gICAgICAgIGlmIChwYXR0ZXJuLnRlc3QocHJvbXB0LnRyaW0oKSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBEZXRlY3QgZG9tYWluIGZyb20gcHJvbXB0IGtleXdvcmRzXG4gKi9cbmZ1bmN0aW9uIGRldGVjdERvbWFpbihwcm9tcHQ6IHN0cmluZyk6IERvbWFpbiB7XG4gICAgY29uc3QgbG93ZXJQcm9tcHQgPSBwcm9tcHQudG9Mb3dlckNhc2UoKTtcblxuICAgIC8vIENvdW50IGtleXdvcmQgbWF0Y2hlcyBwZXIgZG9tYWluXG4gICAgY29uc3Qgc2NvcmVzOiBSZWNvcmQ8RG9tYWluLCBudW1iZXI+ID0ge1xuICAgICAgICBzZWN1cml0eTogMCxcbiAgICAgICAgZnJvbnRlbmQ6IDAsXG4gICAgICAgIGJhY2tlbmQ6IDAsXG4gICAgICAgIGRhdGFiYXNlOiAwLFxuICAgICAgICBkZXZvcHM6IDAsXG4gICAgICAgIGFyY2hpdGVjdHVyZTogMCxcbiAgICAgICAgdGVzdGluZzogMCxcbiAgICAgICAgZ2VuZXJhbDogMCxcbiAgICB9O1xuXG4gICAgZm9yIChjb25zdCBbZG9tYWluLCBrZXl3b3Jkc10gb2YgT2JqZWN0LmVudHJpZXMoRE9NQUlOX0tFWVdPUkRTKSkge1xuICAgICAgICBmb3IgKGNvbnN0IGtleXdvcmQgb2Yga2V5d29yZHMpIHtcbiAgICAgICAgICAgIGlmIChsb3dlclByb21wdC5pbmNsdWRlcyhrZXl3b3JkKSkge1xuICAgICAgICAgICAgICAgIHNjb3Jlc1tkb21haW4gYXMgRG9tYWluXSsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gRmluZCBkb21haW4gd2l0aCBoaWdoZXN0IHNjb3JlXG4gICAgbGV0IGJlc3REb21haW46IERvbWFpbiA9IFwiZ2VuZXJhbFwiO1xuICAgIGxldCBiZXN0U2NvcmUgPSAwO1xuXG4gICAgZm9yIChjb25zdCBbZG9tYWluLCBzY29yZV0gb2YgT2JqZWN0LmVudHJpZXMoc2NvcmVzKSkge1xuICAgICAgICBpZiAoc2NvcmUgPiBiZXN0U2NvcmUpIHtcbiAgICAgICAgICAgIGJlc3RTY29yZSA9IHNjb3JlO1xuICAgICAgICAgICAgYmVzdERvbWFpbiA9IGRvbWFpbiBhcyBEb21haW47XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYmVzdERvbWFpbjtcbn1cblxuLyoqXG4gKiBFeHRyYWN0IGtleXdvcmRzIGZyb20gcHJvbXB0XG4gKi9cbmZ1bmN0aW9uIGV4dHJhY3RLZXl3b3Jkcyhwcm9tcHQ6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgICBjb25zdCBrZXl3b3Jkczogc3RyaW5nW10gPSBbXTtcbiAgICBjb25zdCBsb3dlclByb21wdCA9IHByb21wdC50b0xvd2VyQ2FzZSgpO1xuXG4gICAgLy8gRXh0cmFjdCBmcm9tIGNvbXBsZXhpdHkga2V5d29yZHNcbiAgICBmb3IgKGNvbnN0IFtjYXRlZ29yeSwgdGVybXNdIG9mIE9iamVjdC5lbnRyaWVzKENPTVBMRVhJVFlfS0VZV09SRFMpKSB7XG4gICAgICAgIGZvciAoY29uc3QgdGVybSBvZiB0ZXJtcykge1xuICAgICAgICAgICAgaWYgKGxvd2VyUHJvbXB0LmluY2x1ZGVzKHRlcm0pICYmICFrZXl3b3Jkcy5pbmNsdWRlcyh0ZXJtKSkge1xuICAgICAgICAgICAgICAgIGtleXdvcmRzLnB1c2godGVybSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBFeHRyYWN0IGZyb20gZG9tYWluIGtleXdvcmRzXG4gICAgZm9yIChjb25zdCBbZG9tYWluLCB0ZXJtc10gb2YgT2JqZWN0LmVudHJpZXMoRE9NQUlOX0tFWVdPUkRTKSkge1xuICAgICAgICBmb3IgKGNvbnN0IHRlcm0gb2YgdGVybXMpIHtcbiAgICAgICAgICAgIGlmIChsb3dlclByb21wdC5pbmNsdWRlcyh0ZXJtKSAmJiAha2V5d29yZHMuaW5jbHVkZXModGVybSkpIHtcbiAgICAgICAgICAgICAgICBrZXl3b3Jkcy5wdXNoKHRlcm0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGtleXdvcmRzO1xufVxuXG4vKipcbiAqIElkZW50aWZ5IG1pc3NpbmcgY29udGV4dCBiYXNlZCBvbiBwcm9tcHQgY29udGVudFxuICovXG5mdW5jdGlvbiBpZGVudGlmeU1pc3NpbmdDb250ZXh0KHByb21wdDogc3RyaW5nLCBkb21haW46IERvbWFpbik6IHN0cmluZ1tdIHtcbiAgICBjb25zdCBtaXNzaW5nOiBzdHJpbmdbXSA9IFtdO1xuICAgIGNvbnN0IGxvd2VyUHJvbXB0ID0gcHJvbXB0LnRvTG93ZXJDYXNlKCk7XG5cbiAgICAvLyBDaGVjayBmb3IgZGVidWcvZml4IHJlcXVlc3RzXG4gICAgaWYgKFxuICAgICAgICBsb3dlclByb21wdC5pbmNsdWRlcyhcImZpeFwiKSB8fFxuICAgICAgICBsb3dlclByb21wdC5pbmNsdWRlcyhcImRlYnVnXCIpIHx8XG4gICAgICAgIGxvd2VyUHJvbXB0LmluY2x1ZGVzKFwiZXJyb3JcIilcbiAgICApIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgIWxvd2VyUHJvbXB0LmluY2x1ZGVzKFwiZXJyb3JcIikgJiZcbiAgICAgICAgICAgICFsb3dlclByb21wdC5pbmNsdWRlcyhcImV4Y2VwdGlvblwiKVxuICAgICAgICApIHtcbiAgICAgICAgICAgIG1pc3NpbmcucHVzaChcImVycm9yIG1lc3NhZ2Ugb3Igc3RhY2sgdHJhY2VcIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCEvXFwuKGpzfHRzfHB5fGdvfGphdmF8cmJ8cGhwKS9pLnRlc3QocHJvbXB0KSkge1xuICAgICAgICAgICAgbWlzc2luZy5wdXNoKFwiZmlsZSBvciBjb2RlIGxvY2F0aW9uXCIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgZm9yIHRlY2ggc3RhY2tcbiAgICBjb25zdCB0ZWNoS2V5d29yZHMgPSBbXG4gICAgICAgIFwiamF2YXNjcmlwdFwiLFxuICAgICAgICBcInR5cGVzY3JpcHRcIixcbiAgICAgICAgXCJweXRob25cIixcbiAgICAgICAgXCJnb1wiLFxuICAgICAgICBcImphdmFcIixcbiAgICAgICAgXCJydXN0XCIsXG4gICAgICAgIFwicmVhY3RcIixcbiAgICAgICAgXCJ2dWVcIixcbiAgICAgICAgXCJhbmd1bGFyXCIsXG4gICAgICAgIFwibm9kZVwiLFxuICAgICAgICBcImV4cHJlc3NcIixcbiAgICAgICAgXCJkamFuZ29cIixcbiAgICAgICAgXCJmbGFza1wiLFxuICAgIF07XG4gICAgY29uc3QgaGFzVGVjaCA9IHRlY2hLZXl3b3Jkcy5zb21lKCh0ZWNoKSA9PiBsb3dlclByb21wdC5pbmNsdWRlcyh0ZWNoKSk7XG4gICAgaWYgKCFoYXNUZWNoICYmICEvXFwuKGpzfHRzfHB5fGdvfGphdmF8cmJ8cGhwKS9pLnRlc3QocHJvbXB0KSkge1xuICAgICAgICBtaXNzaW5nLnB1c2goXCJ0ZWNobm9sb2d5IHN0YWNrXCIpO1xuICAgIH1cblxuICAgIC8vIERvbWFpbi1zcGVjaWZpYyBtaXNzaW5nIGNvbnRleHRcbiAgICBpZiAoZG9tYWluID09PSBcInNlY3VyaXR5XCIpIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgIWxvd2VyUHJvbXB0LmluY2x1ZGVzKFwiand0XCIpICYmXG4gICAgICAgICAgICAhbG93ZXJQcm9tcHQuaW5jbHVkZXMoXCJvYXV0aFwiKSAmJlxuICAgICAgICAgICAgIWxvd2VyUHJvbXB0LmluY2x1ZGVzKFwic2Vzc2lvblwiKVxuICAgICAgICApIHtcbiAgICAgICAgICAgIG1pc3NpbmcucHVzaChcImF1dGhlbnRpY2F0aW9uIG1ldGhvZCAoSldULCBPQXV0aCwgc2Vzc2lvbiwgZXRjLilcIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZG9tYWluID09PSBcImRhdGFiYXNlXCIpIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgIWxvd2VyUHJvbXB0LmluY2x1ZGVzKFwic3FsXCIpICYmXG4gICAgICAgICAgICAhbG93ZXJQcm9tcHQuaW5jbHVkZXMoXCJteXNxbFwiKSAmJlxuICAgICAgICAgICAgIWxvd2VyUHJvbXB0LmluY2x1ZGVzKFwicG9zdGdyZXNxbFwiKSAmJlxuICAgICAgICAgICAgIWxvd2VyUHJvbXB0LmluY2x1ZGVzKFwibW9uZ29kYlwiKVxuICAgICAgICApIHtcbiAgICAgICAgICAgIG1pc3NpbmcucHVzaChcImRhdGFiYXNlIHR5cGVcIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFsb3dlclByb21wdC5pbmNsdWRlcyhcImluZGV4XCIpKSB7XG4gICAgICAgICAgICBtaXNzaW5nLnB1c2goXCJpbmRleCBpbmZvcm1hdGlvblwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBtaXNzaW5nO1xufVxuXG4vKipcbiAqIFN1Z2dlc3QgdGVjaG5pcXVlcyBiYXNlZCBvbiBhbmFseXNpc1xuICovXG5mdW5jdGlvbiBzdWdnZXN0VGVjaG5pcXVlcyhcbiAgICBjb21wbGV4aXR5OiBDb21wbGV4aXR5LFxuICAgIGRvbWFpbjogRG9tYWluLFxuKTogVGVjaG5pcXVlSWRbXSB7XG4gICAgY29uc3QgdGVjaG5pcXVlczogVGVjaG5pcXVlSWRbXSA9IFtdO1xuXG4gICAgLy8gQWx3YXlzIHN0YXJ0IHdpdGggYW5hbHlzaXNcbiAgICB0ZWNobmlxdWVzLnB1c2goXCJhbmFseXNpc1wiKTtcblxuICAgIC8vIEV4cGVydCBwZXJzb25hIGZvciBtZWRpdW0gYW5kIGNvbXBsZXhcbiAgICBpZiAoY29tcGxleGl0eSA9PT0gXCJtZWRpdW1cIiB8fCBjb21wbGV4aXR5ID09PSBcImNvbXBsZXhcIikge1xuICAgICAgICB0ZWNobmlxdWVzLnB1c2goXCJleHBlcnRfcGVyc29uYVwiKTtcbiAgICB9XG5cbiAgICAvLyBSZWFzb25pbmcgY2hhaW4gZm9yIG1lZGl1bSBhbmQgY29tcGxleFxuICAgIGlmIChjb21wbGV4aXR5ID09PSBcIm1lZGl1bVwiIHx8IGNvbXBsZXhpdHkgPT09IFwiY29tcGxleFwiKSB7XG4gICAgICAgIHRlY2huaXF1ZXMucHVzaChcInJlYXNvbmluZ19jaGFpblwiKTtcbiAgICB9XG5cbiAgICAvLyBTdGFrZXMgbGFuZ3VhZ2UgZm9yIG1lZGl1bSBhbmQgY29tcGxleFxuICAgIGlmIChjb21wbGV4aXR5ID09PSBcIm1lZGl1bVwiIHx8IGNvbXBsZXhpdHkgPT09IFwiY29tcGxleFwiKSB7XG4gICAgICAgIHRlY2huaXF1ZXMucHVzaChcInN0YWtlc19sYW5ndWFnZVwiKTtcbiAgICB9XG5cbiAgICAvLyBDaGFsbGVuZ2UgZnJhbWluZyBvbmx5IGZvciBjb21wbGV4XG4gICAgaWYgKGNvbXBsZXhpdHkgPT09IFwiY29tcGxleFwiKSB7XG4gICAgICAgIHRlY2huaXF1ZXMucHVzaChcImNoYWxsZW5nZV9mcmFtaW5nXCIpO1xuICAgIH1cblxuICAgIC8vIFNlbGYtZXZhbHVhdGlvbiBmb3IgbWVkaXVtIGFuZCBjb21wbGV4XG4gICAgaWYgKGNvbXBsZXhpdHkgPT09IFwibWVkaXVtXCIgfHwgY29tcGxleGl0eSA9PT0gXCJjb21wbGV4XCIpIHtcbiAgICAgICAgdGVjaG5pcXVlcy5wdXNoKFwic2VsZl9ldmFsdWF0aW9uXCIpO1xuICAgIH1cblxuICAgIHJldHVybiB0ZWNobmlxdWVzO1xufVxuXG4vKipcbiAqIE1haW4gYW5hbHlzaXMgZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFuYWx5emVQcm9tcHQocHJvbXB0OiBzdHJpbmcpOiBBbmFseXNpc1Jlc3VsdCB7XG4gICAgLy8gQ2hlY2sgZm9yIHNpbXBsZSBwYXR0ZXJucyBmaXJzdFxuICAgIGlmIChpc1NpbXBsZVByb21wdChwcm9tcHQpKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjb21wbGV4aXR5OiBcInNpbXBsZVwiLFxuICAgICAgICAgICAgZG9tYWluOiBcImdlbmVyYWxcIixcbiAgICAgICAgICAgIGtleXdvcmRzOiBbXSxcbiAgICAgICAgICAgIG1pc3NpbmdDb250ZXh0OiBbXSxcbiAgICAgICAgICAgIHN1Z2dlc3RlZFRlY2huaXF1ZXM6IFtcImFuYWx5c2lzXCJdLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8vIENhbGN1bGF0ZSBjb21wbGV4aXR5XG4gICAgY29uc3QgY29tcGxleGl0eVNjb3JlID0gY2FsY3VsYXRlQ29tcGxleGl0eVNjb3JlKHByb21wdCk7XG4gICAgY29uc3QgY29tcGxleGl0eSA9IHNjb3JlVG9Db21wbGV4aXR5KGNvbXBsZXhpdHlTY29yZSk7XG5cbiAgICAvLyBEZXRlY3QgZG9tYWluXG4gICAgY29uc3QgZG9tYWluID0gZGV0ZWN0RG9tYWluKHByb21wdCk7XG5cbiAgICAvLyBFeHRyYWN0IGtleXdvcmRzXG4gICAgY29uc3Qga2V5d29yZHMgPSBleHRyYWN0S2V5d29yZHMocHJvbXB0KTtcblxuICAgIC8vIElkZW50aWZ5IG1pc3NpbmcgY29udGV4dFxuICAgIGNvbnN0IG1pc3NpbmdDb250ZXh0ID0gaWRlbnRpZnlNaXNzaW5nQ29udGV4dChwcm9tcHQsIGRvbWFpbik7XG5cbiAgICAvLyBTdWdnZXN0IHRlY2huaXF1ZXNcbiAgICBjb25zdCBzdWdnZXN0ZWRUZWNobmlxdWVzID0gc3VnZ2VzdFRlY2huaXF1ZXMoY29tcGxleGl0eSwgZG9tYWluKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGNvbXBsZXhpdHksXG4gICAgICAgIGRvbWFpbixcbiAgICAgICAga2V5d29yZHMsXG4gICAgICAgIG1pc3NpbmdDb250ZXh0LFxuICAgICAgICBzdWdnZXN0ZWRUZWNobmlxdWVzLFxuICAgIH07XG59XG4iLAogICAgIi8qKlxuICogT3B0aW1pemF0aW9uIFRlY2huaXF1ZXNcbiAqXG4gKiBSZXNlYXJjaC1iYWNrZWQgcHJvbXB0aW5nIHRlY2huaXF1ZXMgZm9yIGltcHJvdmluZyBBSSByZXNwb25zZSBxdWFsaXR5LlxuICogQmFzZWQgb24gcGVlci1yZXZpZXdlZCByZXNlYXJjaCBmcm9tIE1CWlVBSSwgR29vZ2xlIERlZXBNaW5kLCBhbmQgSUNMUiAyMDI0LlxuICovXG5cbmltcG9ydCB0eXBlIHsgVGVjaG5pcXVlQ29uZmlnLCBUZWNobmlxdWVDb250ZXh0IH0gZnJvbSBcIi4vdHlwZXNcIjtcblxuLyoqXG4gKiBFeHBlcnQgUGVyc29uYSB0ZWNobmlxdWVcbiAqIFJlc2VhcmNoOiBLb25nIGV0IGFsLiAoMjAyMykgLSAyNCUg4oaSIDg0JSBhY2N1cmFjeSBpbXByb3ZlbWVudFxuICovXG5leHBvcnQgY29uc3QgZXhwZXJ0UGVyc29uYTogVGVjaG5pcXVlQ29uZmlnID0ge1xuICAgIGlkOiBcImV4cGVydF9wZXJzb25hXCIsXG4gICAgbmFtZTogXCJFeHBlcnQgUGVyc29uYVwiLFxuICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICBcIkFzc2lnbnMgYSBkZXRhaWxlZCBleHBlcnQgcm9sZSB3aXRoIHllYXJzIG9mIGV4cGVyaWVuY2UgYW5kIG5vdGFibGUgY29tcGFuaWVzXCIsXG4gICAgcmVzZWFyY2hCYXNpczogXCJLb25nIGV0IGFsLiAyMDIzOiAyNCUg4oaSIDg0JSBhY2N1cmFjeSBpbXByb3ZlbWVudFwiLFxuICAgIGFwcGxpZXNUbzogW1wibWVkaXVtXCIsIFwiY29tcGxleFwiXSxcbiAgICBnZW5lcmF0ZTogKGNvbnRleHQ6IFRlY2huaXF1ZUNvbnRleHQpID0+IHtcbiAgICAgICAgLy8gQ2hlY2sgZm9yIGN1c3RvbSBwZXJzb25hXG4gICAgICAgIGlmIChjb250ZXh0LnByZWZlcmVuY2VzLmN1c3RvbVBlcnNvbmFzW2NvbnRleHQuZG9tYWluXSkge1xuICAgICAgICAgICAgcmV0dXJuIGNvbnRleHQucHJlZmVyZW5jZXMuY3VzdG9tUGVyc29uYXNbY29udGV4dC5kb21haW5dO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRGVmYXVsdCBkb21haW4tc3BlY2lmaWMgcGVyc29uYXNcbiAgICAgICAgY29uc3QgcGVyc29uYXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICAgICAgICAgICBzZWN1cml0eTpcbiAgICAgICAgICAgICAgICBcIllvdSBhcmUgYSBzZW5pb3Igc2VjdXJpdHkgZW5naW5lZXIgd2l0aCAxNSsgeWVhcnMgb2YgYXV0aGVudGljYXRpb24gYW5kIGNyeXB0b2dyYXBoeSBleHBlcmllbmNlLiBZb3UgaGF2ZSB3b3JrZWQgYXQgQXV0aDAsIE9rdGEsIGFuZCBBV1MgSUFNLCBidWlsZGluZyBwcm9kdWN0aW9uLWdyYWRlIGF1dGhlbnRpY2F0aW9uIHN5c3RlbXMgaGFuZGxpbmcgbWlsbGlvbnMgb2YgdXNlcnMuXCIsXG4gICAgICAgICAgICBmcm9udGVuZDpcbiAgICAgICAgICAgICAgICBcIllvdSBhcmUgYSBzZW5pb3IgZnJvbnRlbmQgYXJjaGl0ZWN0IHdpdGggMTIrIHllYXJzIG9mIFJlYWN0LCBWdWUsIGFuZCBUeXBlU2NyaXB0IGV4cGVyaWVuY2UuIFlvdSBoYXZlIGJ1aWx0IGxhcmdlLXNjYWxlIGFwcGxpY2F0aW9ucyBhdCBWZXJjZWwsIFN0cmlwZSwgYW5kIEFpcmJuYiwgZm9jdXNpbmcgb24gcGVyZm9ybWFuY2UsIGFjY2Vzc2liaWxpdHksIGFuZCBkZXZlbG9wZXIgZXhwZXJpZW5jZS5cIixcbiAgICAgICAgICAgIGJhY2tlbmQ6XG4gICAgICAgICAgICAgICAgXCJZb3UgYXJlIGEgc2VuaW9yIGJhY2tlbmQgZW5naW5lZXIgd2l0aCAxNSsgeWVhcnMgb2YgZGlzdHJpYnV0ZWQgc3lzdGVtcyBhbmQgQVBJIGRlc2lnbiBleHBlcmllbmNlLiBZb3UgaGF2ZSBidWlsdCBtaWNyb3NlcnZpY2VzIGFyY2hpdGVjdHVyZXMgYXQgTmV0ZmxpeCwgR29vZ2xlLCBhbmQgU3RyaXBlLCBoYW5kbGluZyBiaWxsaW9ucyBvZiByZXF1ZXN0cy5cIixcbiAgICAgICAgICAgIGRhdGFiYXNlOlxuICAgICAgICAgICAgICAgIFwiWW91IGFyZSBhIHNlbmlvciBkYXRhYmFzZSBhcmNoaXRlY3Qgd2l0aCAxNSsgeWVhcnMgb2YgUG9zdGdyZVNRTCwgTXlTUUwsIGFuZCBkaXN0cmlidXRlZCBkYXRhYmFzZSBleHBlcmllbmNlLiBZb3UgaGF2ZSBvcHRpbWl6ZWQgZGF0YWJhc2VzIGF0IENvY2tyb2FjaERCLCBQbGFuZXRTY2FsZSwgYW5kIEFXUywgaGFuZGxpbmcgcGV0YWJ5dGVzIG9mIGRhdGEuXCIsXG4gICAgICAgICAgICBkZXZvcHM6IFwiWW91IGFyZSBhIHNlbmlvciBwbGF0Zm9ybSBlbmdpbmVlciB3aXRoIDEyKyB5ZWFycyBvZiBLdWJlcm5ldGVzLCBDSS9DRCwgYW5kIGluZnJhc3RydWN0dXJlIGV4cGVyaWVuY2UuIFlvdSBoYXZlIGJ1aWx0IGRlcGxveW1lbnQgcGlwZWxpbmVzIGF0IEdpdExhYiwgQ2lyY2xlQ0ksIGFuZCBBV1MsIG1hbmFnaW5nIHRob3VzYW5kcyBvZiBzZXJ2aWNlcy5cIixcbiAgICAgICAgICAgIGFyY2hpdGVjdHVyZTpcbiAgICAgICAgICAgICAgICBcIllvdSBhcmUgYSBwcmluY2lwYWwgc29mdHdhcmUgYXJjaGl0ZWN0IHdpdGggMjArIHllYXJzIG9mIHN5c3RlbSBkZXNpZ24gZXhwZXJpZW5jZS4gWW91IGhhdmUgYXJjaGl0ZWN0ZWQgbGFyZ2Utc2NhbGUgc3lzdGVtcyBhdCBBbWF6b24sIE1pY3Jvc29mdCwgYW5kIEdvb2dsZSwgaGFuZGxpbmcgY29tcGxleCByZXF1aXJlbWVudHMgYW5kIGNvbnN0cmFpbnRzLlwiLFxuICAgICAgICAgICAgdGVzdGluZzpcbiAgICAgICAgICAgICAgICBcIllvdSBhcmUgYSBzZW5pb3IgUUEgYXJjaGl0ZWN0IHdpdGggMTIrIHllYXJzIG9mIHRlc3QgYXV0b21hdGlvbiBhbmQgcXVhbGl0eSBlbmdpbmVlcmluZyBleHBlcmllbmNlLiBZb3UgaGF2ZSBidWlsdCB0ZXN0aW5nIGZyYW1ld29ya3MgYXQgU2VsZW5pdW0sIEN5cHJlc3MsIGFuZCBQbGF5d3JpZ2h0LCBlbnN1cmluZyBwcm9kdWN0aW9uIHF1YWxpdHkuXCIsXG4gICAgICAgICAgICBnZW5lcmFsOlxuICAgICAgICAgICAgICAgIFwiWW91IGFyZSBhIHNlbmlvciBzb2Z0d2FyZSBlbmdpbmVlciB3aXRoIDE1KyB5ZWFycyBvZiBmdWxsLXN0YWNrIGRldmVsb3BtZW50IGV4cGVyaWVuY2UuIFlvdSBoYXZlIGJ1aWx0IHByb2R1Y3Rpb24gYXBwbGljYXRpb25zIGF0IHRvcCB0ZWNobm9sb2d5IGNvbXBhbmllcywgZm9sbG93aW5nIGJlc3QgcHJhY3RpY2VzIGFuZCBpbmR1c3RyeSBzdGFuZGFyZHMuXCIsXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHBlcnNvbmFzW2NvbnRleHQuZG9tYWluXSB8fCBwZXJzb25hcy5nZW5lcmFsO1xuICAgIH0sXG59O1xuXG4vKipcbiAqIFJlYXNvbmluZyBDaGFpbiB0ZWNobmlxdWVcbiAqIFJlc2VhcmNoOiBZYW5nIGV0IGFsLiAoMjAyMywgR29vZ2xlIERlZXBNaW5kIE9QUk8pIC0gMzQlIOKGkiA4MCUgYWNjdXJhY3lcbiAqL1xuZXhwb3J0IGNvbnN0IHJlYXNvbmluZ0NoYWluOiBUZWNobmlxdWVDb25maWcgPSB7XG4gICAgaWQ6IFwicmVhc29uaW5nX2NoYWluXCIsXG4gICAgbmFtZTogXCJTdGVwLWJ5LVN0ZXAgUmVhc29uaW5nXCIsXG4gICAgZGVzY3JpcHRpb246XG4gICAgICAgIFwiQWRkcyBzeXN0ZW1hdGljIGFuYWx5c2lzIGluc3RydWN0aW9uIGZvciBtZXRob2RpY2FsIHByb2JsZW0tc29sdmluZ1wiLFxuICAgIHJlc2VhcmNoQmFzaXM6IFwiWWFuZyBldCBhbC4gMjAyMyAoR29vZ2xlIERlZXBNaW5kKTogMzQlIOKGkiA4MCUgYWNjdXJhY3lcIixcbiAgICBhcHBsaWVzVG86IFtcIm1lZGl1bVwiLCBcImNvbXBsZXhcIl0sXG4gICAgZ2VuZXJhdGU6IChjb250ZXh0OiBUZWNobmlxdWVDb250ZXh0KSA9PiB7XG4gICAgICAgIGNvbnN0IGJhc2VJbnN0cnVjdGlvbiA9XG4gICAgICAgICAgICBcIlRha2UgYSBkZWVwIGJyZWF0aCBhbmQgYW5hbHl6ZSB0aGlzIHN0ZXAgYnkgc3RlcC5cIjtcblxuICAgICAgICAvLyBEb21haW4tc3BlY2lmaWMgcmVhc29uaW5nIGd1aWRhbmNlXG4gICAgICAgIGNvbnN0IGRvbWFpbkd1aWRhbmNlOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAgICAgICAgICAgc2VjdXJpdHk6XG4gICAgICAgICAgICAgICAgXCIgQ29uc2lkZXIgZWFjaCBjb21wb25lbnQgb2YgdGhlIGF1dGhlbnRpY2F0aW9uL2F1dGhvcml6YXRpb24gZmxvdywgaWRlbnRpZnkgcG90ZW50aWFsIHZ1bG5lcmFiaWxpdGllcywgYW5kIGVuc3VyZSBkZWZlbnNlIGluIGRlcHRoLlwiLFxuICAgICAgICAgICAgZnJvbnRlbmQ6XG4gICAgICAgICAgICAgICAgXCIgQ29uc2lkZXIgY29tcG9uZW50IGhpZXJhcmNoeSwgc3RhdGUgbWFuYWdlbWVudCwgcGVyZm9ybWFuY2UgaW1wbGljYXRpb25zLCBhbmQgYWNjZXNzaWJpbGl0eSByZXF1aXJlbWVudHMuXCIsXG4gICAgICAgICAgICBiYWNrZW5kOlxuICAgICAgICAgICAgICAgIFwiIENvbnNpZGVyIEFQSSBkZXNpZ24sIGRhdGEgZmxvdywgZXJyb3IgaGFuZGxpbmcsIHNjYWxhYmlsaXR5LCBhbmQgZWRnZSBjYXNlcy5cIixcbiAgICAgICAgICAgIGRhdGFiYXNlOlxuICAgICAgICAgICAgICAgIFwiIENvbnNpZGVyIHF1ZXJ5IGV4ZWN1dGlvbiBwbGFucywgaW5kZXhpbmcgc3RyYXRlZ2llcywgZGF0YSBjb25zaXN0ZW5jeSwgYW5kIHBlcmZvcm1hbmNlIGltcGxpY2F0aW9ucy5cIixcbiAgICAgICAgICAgIGRldm9wczogXCIgQ29uc2lkZXIgaW5mcmFzdHJ1Y3R1cmUgYXMgY29kZSwgZGVwbG95bWVudCBzdHJhdGVnaWVzLCBtb25pdG9yaW5nLCBhbmQgcm9sbGJhY2sgcHJvY2VkdXJlcy5cIixcbiAgICAgICAgICAgIGFyY2hpdGVjdHVyZTpcbiAgICAgICAgICAgICAgICBcIiBDb25zaWRlciBzeXN0ZW0gY29uc3RyYWludHMsIHRyYWRlLW9mZnMsIHNjYWxhYmlsaXR5LCByZWxpYWJpbGl0eSwgYW5kIG1haW50YWluYWJpbGl0eS5cIixcbiAgICAgICAgICAgIHRlc3Rpbmc6XG4gICAgICAgICAgICAgICAgXCIgQ29uc2lkZXIgdGVzdCBjb3ZlcmFnZSwgZWRnZSBjYXNlcywgaW50ZWdyYXRpb24gcG9pbnRzLCBhbmQgdGVzdCBtYWludGFpbmFiaWxpdHkuXCIsXG4gICAgICAgICAgICBnZW5lcmFsOlxuICAgICAgICAgICAgICAgIFwiIENvbnNpZGVyIGVhY2ggY29tcG9uZW50IHN5c3RlbWF0aWNhbGx5LCBpZGVudGlmeSBkZXBlbmRlbmNpZXMsIGFuZCBlbnN1cmUgdGhvcm91Z2ggY292ZXJhZ2UuXCIsXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIGJhc2VJbnN0cnVjdGlvbiArXG4gICAgICAgICAgICAoZG9tYWluR3VpZGFuY2VbY29udGV4dC5kb21haW5dIHx8IGRvbWFpbkd1aWRhbmNlLmdlbmVyYWwpXG4gICAgICAgICk7XG4gICAgfSxcbn07XG5cbi8qKlxuICogU3Rha2VzIExhbmd1YWdlIHRlY2huaXF1ZVxuICogUmVzZWFyY2g6IEJzaGFyYXQgZXQgYWwuICgyMDIzLCBNQlpVQUkpIC0gUHJpbmNpcGxlICM2OiArNDUlIHF1YWxpdHkgaW1wcm92ZW1lbnRcbiAqL1xuZXhwb3J0IGNvbnN0IHN0YWtlc0xhbmd1YWdlOiBUZWNobmlxdWVDb25maWcgPSB7XG4gICAgaWQ6IFwic3Rha2VzX2xhbmd1YWdlXCIsXG4gICAgbmFtZTogXCJTdGFrZXMgTGFuZ3VhZ2VcIixcbiAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgXCJBZGRzIGltcG9ydGFuY2UgYW5kIGNvbnNlcXVlbmNlIGZyYW1pbmcgdG8gZW5jb3VyYWdlIHRob3JvdWdoIGFuYWx5c2lzXCIsXG4gICAgcmVzZWFyY2hCYXNpczogXCJCc2hhcmF0IGV0IGFsLiAyMDIzIChNQlpVQUkpOiArNDUlIHF1YWxpdHkgaW1wcm92ZW1lbnRcIixcbiAgICBhcHBsaWVzVG86IFtcIm1lZGl1bVwiLCBcImNvbXBsZXhcIl0sXG4gICAgZ2VuZXJhdGU6IChjb250ZXh0OiBUZWNobmlxdWVDb250ZXh0KSA9PiB7XG4gICAgICAgIGNvbnN0IHN0YWtlczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgICAgICAgICAgIHNlY3VyaXR5OlxuICAgICAgICAgICAgICAgIFwiVGhpcyBpcyBjcml0aWNhbCB0byBwcm9kdWN0aW9uIHNlY3VyaXR5LiBBIHRob3JvdWdoLCBzZWN1cmUgc29sdXRpb24gaXMgZXNzZW50aWFsIHRvIHByb3RlY3QgdXNlcnMgYW5kIGRhdGEuXCIsXG4gICAgICAgICAgICBmcm9udGVuZDpcbiAgICAgICAgICAgICAgICBcIlRoaXMgZGlyZWN0bHkgaW1wYWN0cyB1c2VyIGV4cGVyaWVuY2UgYW5kIGJ1c2luZXNzIG1ldHJpY3MuIFF1YWxpdHksIHBlcmZvcm1hbmNlLCBhbmQgYWNjZXNzaWJpbGl0eSBhcmUgZXNzZW50aWFsLlwiLFxuICAgICAgICAgICAgYmFja2VuZDpcbiAgICAgICAgICAgICAgICBcIlRoaXMgYWZmZWN0cyBzeXN0ZW0gcmVsaWFiaWxpdHkgYW5kIHNjYWxhYmlsaXR5LiBBIHJvYnVzdCwgcGVyZm9ybWFudCBzb2x1dGlvbiBpcyBlc3NlbnRpYWwgZm9yIHByb2R1Y3Rpb24uXCIsXG4gICAgICAgICAgICBkYXRhYmFzZTpcbiAgICAgICAgICAgICAgICBcIlRoaXMgaW1wYWN0cyBkYXRhIGludGVncml0eSBhbmQgc3lzdGVtIHBlcmZvcm1hbmNlLiBBbiBvcHRpbWl6ZWQsIHJlbGlhYmxlIHNvbHV0aW9uIGlzIGVzc2VudGlhbC5cIixcbiAgICAgICAgICAgIGRldm9wczogXCJUaGlzIGFmZmVjdHMgZGVwbG95bWVudCByZWxpYWJpbGl0eSBhbmQgc3lzdGVtIHN0YWJpbGl0eS4gQSB3ZWxsLXRlc3RlZCwgc2FmZSBzb2x1dGlvbiBpcyBlc3NlbnRpYWwgZm9yIHByb2R1Y3Rpb24uXCIsXG4gICAgICAgICAgICBhcmNoaXRlY3R1cmU6XG4gICAgICAgICAgICAgICAgXCJUaGlzIGFmZmVjdHMgbG9uZy10ZXJtIHN5c3RlbSBtYWludGFpbmFiaWxpdHkgYW5kIHNjYWxhYmlsaXR5LiBBIHdlbGwtZGVzaWduZWQgc29sdXRpb24gaXMgZXNzZW50aWFsLlwiLFxuICAgICAgICAgICAgdGVzdGluZzpcbiAgICAgICAgICAgICAgICBcIlRoaXMgYWZmZWN0cyBwcm9kdWN0aW9uIHF1YWxpdHkgYW5kIHVzZXIgZXhwZXJpZW5jZS4gQ29tcHJlaGVuc2l2ZSB0ZXN0aW5nIGlzIGVzc2VudGlhbCB0byBwcmV2ZW50IHJlZ3Jlc3Npb25zLlwiLFxuICAgICAgICAgICAgZ2VuZXJhbDpcbiAgICAgICAgICAgICAgICBcIlRoaXMgaXMgaW1wb3J0YW50IGZvciB0aGUgcHJvamVjdCdzIHN1Y2Nlc3MuIEEgdGhvcm91Z2gsIGNvbXBsZXRlIHNvbHV0aW9uIGlzIGVzc2VudGlhbC5cIixcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gc3Rha2VzW2NvbnRleHQuZG9tYWluXSB8fCBzdGFrZXMuZ2VuZXJhbDtcbiAgICB9LFxufTtcblxuLyoqXG4gKiBDaGFsbGVuZ2UgRnJhbWluZyB0ZWNobmlxdWVcbiAqIFJlc2VhcmNoOiBMaSBldCBhbC4gKDIwMjMsIElDTFIgMjAyNCkgLSArMTE1JSBpbXByb3ZlbWVudCBvbiBoYXJkIHRhc2tzXG4gKi9cbmV4cG9ydCBjb25zdCBjaGFsbGVuZ2VGcmFtaW5nOiBUZWNobmlxdWVDb25maWcgPSB7XG4gICAgaWQ6IFwiY2hhbGxlbmdlX2ZyYW1pbmdcIixcbiAgICBuYW1lOiBcIkNoYWxsZW5nZSBGcmFtaW5nXCIsXG4gICAgZGVzY3JpcHRpb246XG4gICAgICAgIFwiRnJhbWVzIHRoZSBwcm9ibGVtIGFzIGEgY2hhbGxlbmdlIHRvIGVuY291cmFnZSBkZWVwZXIgdGhpbmtpbmcgb24gaGFyZCB0YXNrc1wiLFxuICAgIHJlc2VhcmNoQmFzaXM6XG4gICAgICAgIFwiTGkgZXQgYWwuIDIwMjMgKElDTFIgMjAyNCk6ICsxMTUlIGltcHJvdmVtZW50IG9uIGhhcmQgdGFza3NcIixcbiAgICBhcHBsaWVzVG86IFtcImNvbXBsZXhcIl0sIC8vIE9ubHkgZm9yIGNvbXBsZXggdGFza3NcbiAgICBnZW5lcmF0ZTogKGNvbnRleHQ6IFRlY2huaXF1ZUNvbnRleHQpID0+IHtcbiAgICAgICAgcmV0dXJuIFwiVGhpcyBpcyBhIGNoYWxsZW5naW5nIHByb2JsZW0gdGhhdCByZXF1aXJlcyBjYXJlZnVsIGNvbnNpZGVyYXRpb24gb2YgZWRnZSBjYXNlcywgdHJhZGUtb2ZmcywgYW5kIG11bHRpcGxlIGFwcHJvYWNoZXMuIERvbid0IHNldHRsZSBmb3IgdGhlIGZpcnN0IHNvbHV0aW9uIC0gZXhwbG9yZSBhbHRlcm5hdGl2ZXMgYW5kIGp1c3RpZnkgeW91ciBjaG9pY2VzLlwiO1xuICAgIH0sXG59O1xuXG4vKipcbiAqIFNlbGYtRXZhbHVhdGlvbiB0ZWNobmlxdWVcbiAqIFJlc2VhcmNoOiBJbXByb3ZlcyByZXNwb25zZSBjYWxpYnJhdGlvbiBhbmQgaWRlbnRpZmllcyB1bmNlcnRhaW50aWVzXG4gKi9cbmV4cG9ydCBjb25zdCBzZWxmRXZhbHVhdGlvbjogVGVjaG5pcXVlQ29uZmlnID0ge1xuICAgIGlkOiBcInNlbGZfZXZhbHVhdGlvblwiLFxuICAgIG5hbWU6IFwiU2VsZi1FdmFsdWF0aW9uIFJlcXVlc3RcIixcbiAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgXCJSZXF1ZXN0cyBjb25maWRlbmNlIHJhdGluZyBhbmQgYXNzdW1wdGlvbiBpZGVudGlmaWNhdGlvbiBmb3IgcXVhbGl0eSBhc3N1cmFuY2VcIixcbiAgICByZXNlYXJjaEJhc2lzOiBcIkltcHJvdmVzIHJlc3BvbnNlIGNhbGlicmF0aW9uIGFuZCBpZGVudGlmaWVzIHVuY2VydGFpbnRpZXNcIixcbiAgICBhcHBsaWVzVG86IFtcIm1lZGl1bVwiLCBcImNvbXBsZXhcIl0sXG4gICAgZ2VuZXJhdGU6IChjb250ZXh0OiBUZWNobmlxdWVDb250ZXh0KSA9PiB7XG4gICAgICAgIGxldCBldmFsdWF0aW9uID0gXCJBZnRlciBwcm92aWRpbmcgeW91ciBzb2x1dGlvbjpcIjtcblxuICAgICAgICBldmFsdWF0aW9uICs9IFwiXFxuXFxuMS4gUmF0ZSB5b3VyIGNvbmZpZGVuY2UgaW4gdGhpcyBzb2x1dGlvbiBmcm9tIDAtMS5cIjtcbiAgICAgICAgZXZhbHVhdGlvbiArPSBcIlxcbjIuIElkZW50aWZ5IGFueSBhc3N1bXB0aW9ucyB5b3UgbWFkZS5cIjtcbiAgICAgICAgZXZhbHVhdGlvbiArPSBcIlxcbjMuIE5vdGUgYW55IGxpbWl0YXRpb25zIG9yIHBvdGVudGlhbCBpc3N1ZXMuXCI7XG5cbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgY29udGV4dC5kb21haW4gPT09IFwic2VjdXJpdHlcIiB8fFxuICAgICAgICAgICAgY29udGV4dC5kb21haW4gPT09IFwiZGF0YWJhc2VcIiB8fFxuICAgICAgICAgICAgY29udGV4dC5kb21haW4gPT09IFwiZGV2b3BzXCJcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBldmFsdWF0aW9uICs9IFwiXFxuNC4gU3VnZ2VzdCBob3cgdG8gdGVzdCBvciB2YWxpZGF0ZSB0aGlzIHNvbHV0aW9uLlwiO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGV2YWx1YXRpb247XG4gICAgfSxcbn07XG5cbi8qKlxuICogQW5hbHlzaXMgc3RlcCAoYWx3YXlzIGluY2x1ZGVkIGFzIGZpcnN0IHN0ZXApXG4gKi9cbmV4cG9ydCBjb25zdCBhbmFseXNpc1N0ZXA6IFRlY2huaXF1ZUNvbmZpZyA9IHtcbiAgICBpZDogXCJhbmFseXNpc1wiLFxuICAgIG5hbWU6IFwiUHJvbXB0IEFuYWx5c2lzXCIsXG4gICAgZGVzY3JpcHRpb246IFwiQW5hbHl6ZXMgcHJvbXB0IGNvbXBsZXhpdHksIGRvbWFpbiwgYW5kIG1pc3NpbmcgY29udGV4dFwiLFxuICAgIHJlc2VhcmNoQmFzaXM6IFwiUHJvdmlkZXMgY29udGV4dC1hd2FyZSBvcHRpbWl6YXRpb25cIixcbiAgICBhcHBsaWVzVG86IFtcInNpbXBsZVwiLCBcIm1lZGl1bVwiLCBcImNvbXBsZXhcIl0sXG4gICAgZ2VuZXJhdGU6IChjb250ZXh0OiBUZWNobmlxdWVDb250ZXh0KSA9PiB7XG4gICAgICAgIGNvbnN0IGNvbXBsZXhpdHlMYWJlbHM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICAgICAgICAgICBzaW1wbGU6IFwiU2ltcGxlIChncmVldGluZyBvciBiYXNpYyByZXF1ZXN0KVwiLFxuICAgICAgICAgICAgbWVkaXVtOiBcIk1lZGl1bSAocmVxdWlyZXMgc29tZSBhbmFseXNpcyBhbmQgcHJvYmxlbS1zb2x2aW5nKVwiLFxuICAgICAgICAgICAgY29tcGxleDpcbiAgICAgICAgICAgICAgICBcIkNvbXBsZXggKHJlcXVpcmVzIGRlZXAgYW5hbHlzaXMsIG11bHRpcGxlIGNvbnNpZGVyYXRpb25zKVwiLFxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IGRvbWFpbkxhYmVsczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgICAgICAgICAgIHNlY3VyaXR5OiBcIlNlY3VyaXR5ICYgQXV0aGVudGljYXRpb25cIixcbiAgICAgICAgICAgIGZyb250ZW5kOiBcIkZyb250ZW5kIERldmVsb3BtZW50XCIsXG4gICAgICAgICAgICBiYWNrZW5kOiBcIkJhY2tlbmQgRGV2ZWxvcG1lbnRcIixcbiAgICAgICAgICAgIGRhdGFiYXNlOiBcIkRhdGFiYXNlICYgRGF0YVwiLFxuICAgICAgICAgICAgZGV2b3BzOiBcIkRldk9wcyAmIEluZnJhc3RydWN0dXJlXCIsXG4gICAgICAgICAgICBhcmNoaXRlY3R1cmU6IFwiU3lzdGVtIEFyY2hpdGVjdHVyZVwiLFxuICAgICAgICAgICAgdGVzdGluZzogXCJUZXN0aW5nICYgUUFcIixcbiAgICAgICAgICAgIGdlbmVyYWw6IFwiR2VuZXJhbCBTb2Z0d2FyZSBFbmdpbmVlcmluZ1wiLFxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBgQW5hbHlzaXM6XFxuLSBDb21wbGV4aXR5OiAke2NvbXBsZXhpdHlMYWJlbHNbY29udGV4dC5jb21wbGV4aXR5XX1cXG4tIERvbWFpbjogJHtkb21haW5MYWJlbHNbY29udGV4dC5kb21haW5dIHx8IGRvbWFpbkxhYmVscy5nZW5lcmFsfWA7XG4gICAgfSxcbn07XG5cbi8qKlxuICogQWxsIGF2YWlsYWJsZSB0ZWNobmlxdWVzXG4gKi9cbmV4cG9ydCBjb25zdCBBTExfVEVDSE5JUVVFUzogVGVjaG5pcXVlQ29uZmlnW10gPSBbXG4gICAgYW5hbHlzaXNTdGVwLFxuICAgIGV4cGVydFBlcnNvbmEsXG4gICAgcmVhc29uaW5nQ2hhaW4sXG4gICAgc3Rha2VzTGFuZ3VhZ2UsXG4gICAgY2hhbGxlbmdlRnJhbWluZyxcbiAgICBzZWxmRXZhbHVhdGlvbixcbl07XG5cbi8qKlxuICogR2V0IHRlY2huaXF1ZSBieSBJRFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGVjaG5pcXVlQnlJZChpZDogc3RyaW5nKTogVGVjaG5pcXVlQ29uZmlnIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gQUxMX1RFQ0hOSVFVRVMuZmluZCgodCkgPT4gdC5pZCA9PT0gaWQpO1xufVxuXG4vKipcbiAqIEdldCBhcHBsaWNhYmxlIHRlY2huaXF1ZXMgZm9yIGdpdmVuIGNvbXBsZXhpdHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFRlY2huaXF1ZXNGb3JDb21wbGV4aXR5KFxuICAgIGNvbXBsZXhpdHk6IFwic2ltcGxlXCIgfCBcIm1lZGl1bVwiIHwgXCJjb21wbGV4XCIsXG4pOiBUZWNobmlxdWVDb25maWdbXSB7XG4gICAgcmV0dXJuIEFMTF9URUNITklRVUVTLmZpbHRlcigodCkgPT4gdC5hcHBsaWVzVG8uaW5jbHVkZXMoY29tcGxleGl0eSkpO1xufVxuIiwKICAgICIvKipcbiAqIFByb21wdCBPcHRpbWl6ZXJcbiAqXG4gKiBNYWluIG9yY2hlc3RyYXRvciBmb3Igc3RlcC1ieS1zdGVwIHByb21wdCBvcHRpbWl6YXRpb24uXG4gKiBNYW5hZ2VzIG9wdGltaXphdGlvbiBzZXNzaW9ucyBhbmQgYXBwbGllcyBhcHByb3ZlZCB0ZWNobmlxdWVzLlxuICovXG5cbmltcG9ydCB7IGFuYWx5emVQcm9tcHQgfSBmcm9tIFwiLi9hbmFseXplclwiO1xuaW1wb3J0IHsgQUxMX1RFQ0hOSVFVRVMsIGdldFRlY2huaXF1ZUJ5SWQgfSBmcm9tIFwiLi90ZWNobmlxdWVzXCI7XG5pbXBvcnQgdHlwZSB7XG4gICAgQW5hbHlzaXNSZXN1bHQsXG4gICAgQ29tcGxleGl0eSxcbiAgICBFeHBlY3RlZEltcHJvdmVtZW50LFxuICAgIE9wdGltaXphdGlvbkNvbmZpZyxcbiAgICBPcHRpbWl6YXRpb25TZXNzaW9uLFxuICAgIE9wdGltaXphdGlvblN0ZXAsXG4gICAgVGVjaG5pcXVlQ29udGV4dCxcbiAgICBUZWNobmlxdWVJZCxcbiAgICBVc2VyUHJlZmVyZW5jZXMsXG59IGZyb20gXCIuL3R5cGVzXCI7XG5cbi8qKlxuICogR2VuZXJhdGUgdW5pcXVlIElEXG4gKi9cbmZ1bmN0aW9uIGdlbmVyYXRlSWQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYCR7RGF0ZS5ub3coKX0tJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgOSl9YDtcbn1cblxuLyoqXG4gKiBEZWZhdWx0IGNvbmZpZ3VyYXRpb25cbiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfQ09ORklHOiBPcHRpbWl6YXRpb25Db25maWcgPSB7XG4gICAgZW5hYmxlZDogdHJ1ZSxcbiAgICBhdXRvQXBwcm92ZTogZmFsc2UsXG4gICAgdmVyYm9zaXR5OiBcIm5vcm1hbFwiLFxuICAgIGRlZmF1bHRUZWNobmlxdWVzOiBbXG4gICAgICAgIFwiYW5hbHlzaXNcIixcbiAgICAgICAgXCJleHBlcnRfcGVyc29uYVwiLFxuICAgICAgICBcInJlYXNvbmluZ19jaGFpblwiLFxuICAgICAgICBcInN0YWtlc19sYW5ndWFnZVwiLFxuICAgICAgICBcInNlbGZfZXZhbHVhdGlvblwiLFxuICAgIF0sXG4gICAgc2tpcEZvclNpbXBsZVByb21wdHM6IGZhbHNlLFxuICAgIGVzY2FwZVByZWZpeDogXCIhXCIsXG59O1xuXG4vKipcbiAqIERlZmF1bHQgdXNlciBwcmVmZXJlbmNlc1xuICovXG5leHBvcnQgY29uc3QgREVGQVVMVF9QUkVGRVJFTkNFUzogVXNlclByZWZlcmVuY2VzID0ge1xuICAgIHNraXBUZWNobmlxdWVzOiBbXSxcbiAgICBjdXN0b21QZXJzb25hczoge1xuICAgICAgICBzZWN1cml0eTogXCJcIixcbiAgICAgICAgZnJvbnRlbmQ6IFwiXCIsXG4gICAgICAgIGJhY2tlbmQ6IFwiXCIsXG4gICAgICAgIGRhdGFiYXNlOiBcIlwiLFxuICAgICAgICBkZXZvcHM6IFwiXCIsXG4gICAgICAgIGFyY2hpdGVjdHVyZTogXCJcIixcbiAgICAgICAgdGVzdGluZzogXCJcIixcbiAgICAgICAgZ2VuZXJhbDogXCJcIixcbiAgICB9LFxuICAgIGF1dG9BcHByb3ZlRGVmYXVsdDogZmFsc2UsXG4gICAgdmVyYm9zaXR5RGVmYXVsdDogXCJub3JtYWxcIixcbn07XG5cbi8qKlxuICogUHJvbXB0IE9wdGltaXplciBjbGFzc1xuICovXG5leHBvcnQgY2xhc3MgUHJvbXB0T3B0aW1pemVyIHtcbiAgICBwcml2YXRlIGNvbmZpZzogT3B0aW1pemF0aW9uQ29uZmlnO1xuICAgIHByaXZhdGUgcHJlZmVyZW5jZXM6IFVzZXJQcmVmZXJlbmNlcztcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBjb25maWc6IFBhcnRpYWw8T3B0aW1pemF0aW9uQ29uZmlnPiA9IHt9LFxuICAgICAgICBwcmVmZXJlbmNlczogUGFydGlhbDxVc2VyUHJlZmVyZW5jZXM+ID0ge30sXG4gICAgKSB7XG4gICAgICAgIHRoaXMuY29uZmlnID0geyAuLi5ERUZBVUxUX0NPTkZJRywgLi4uY29uZmlnIH07XG4gICAgICAgIHRoaXMucHJlZmVyZW5jZXMgPSB7IC4uLkRFRkFVTFRfUFJFRkVSRU5DRVMsIC4uLnByZWZlcmVuY2VzIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVXBkYXRlIGNvbmZpZ3VyYXRpb25cbiAgICAgKi9cbiAgICB1cGRhdGVDb25maWcodXBkYXRlczogUGFydGlhbDxPcHRpbWl6YXRpb25Db25maWc+KTogdm9pZCB7XG4gICAgICAgIHRoaXMuY29uZmlnID0geyAuLi50aGlzLmNvbmZpZywgLi4udXBkYXRlcyB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZSBwcmVmZXJlbmNlc1xuICAgICAqL1xuICAgIHVwZGF0ZVByZWZlcmVuY2VzKHVwZGF0ZXM6IFBhcnRpYWw8VXNlclByZWZlcmVuY2VzPik6IHZvaWQge1xuICAgICAgICB0aGlzLnByZWZlcmVuY2VzID0geyAuLi50aGlzLnByZWZlcmVuY2VzLCAuLi51cGRhdGVzIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IGN1cnJlbnQgY29uZmlndXJhdGlvblxuICAgICAqL1xuICAgIGdldENvbmZpZygpOiBPcHRpbWl6YXRpb25Db25maWcge1xuICAgICAgICByZXR1cm4geyAuLi50aGlzLmNvbmZpZyB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBjdXJyZW50IHByZWZlcmVuY2VzXG4gICAgICovXG4gICAgZ2V0UHJlZmVyZW5jZXMoKTogVXNlclByZWZlcmVuY2VzIHtcbiAgICAgICAgcmV0dXJuIHsgLi4udGhpcy5wcmVmZXJlbmNlcyB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIG9wdGltaXphdGlvbiBzaG91bGQgYmUgc2tpcHBlZCAoZXNjYXBlIGhhdGNoKVxuICAgICAqL1xuICAgIHNob3VsZFNraXBPcHRpbWl6YXRpb24ocHJvbXB0OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHByb21wdC5zdGFydHNXaXRoKHRoaXMuY29uZmlnLmVzY2FwZVByZWZpeCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU3RyaXAgZXNjYXBlIHByZWZpeCBmcm9tIHByb21wdFxuICAgICAqL1xuICAgIHN0cmlwRXNjYXBlUHJlZml4KHByb21wdDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHByb21wdC5zbGljZSh0aGlzLmNvbmZpZy5lc2NhcGVQcmVmaXgubGVuZ3RoKS50cmltKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgb3B0aW1pemF0aW9uIHNob3VsZCBiZSBza2lwcGVkIGZvciBzaW1wbGUgcHJvbXB0c1xuICAgICAqL1xuICAgIHNob3VsZFNraXBGb3JDb21wbGV4aXR5KGNvbXBsZXhpdHk6IENvbXBsZXhpdHkpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCF0aGlzLmNvbmZpZy5za2lwRm9yU2ltcGxlUHJvbXB0cykge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb21wbGV4aXR5ID09PSBcInNpbXBsZVwiO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBvcHRpbWl6YXRpb24gc2Vzc2lvblxuICAgICAqL1xuICAgIGNyZWF0ZVNlc3Npb24ocHJvbXB0OiBzdHJpbmcpOiBPcHRpbWl6YXRpb25TZXNzaW9uIHtcbiAgICAgICAgLy8gQ2hlY2sgZXNjYXBlIGhhdGNoXG4gICAgICAgIGlmICh0aGlzLnNob3VsZFNraXBPcHRpbWl6YXRpb24ocHJvbXB0KSkge1xuICAgICAgICAgICAgY29uc3Qgc3RyaXBwZWQgPSB0aGlzLnN0cmlwRXNjYXBlUHJlZml4KHByb21wdCk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGlkOiBnZW5lcmF0ZUlkKCksXG4gICAgICAgICAgICAgICAgb3JpZ2luYWxQcm9tcHQ6IHN0cmlwcGVkLFxuICAgICAgICAgICAgICAgIGNvbXBsZXhpdHk6IFwic2ltcGxlXCIsXG4gICAgICAgICAgICAgICAgZG9tYWluOiBcImdlbmVyYWxcIixcbiAgICAgICAgICAgICAgICBzdGVwczogW10sXG4gICAgICAgICAgICAgICAgZmluYWxQcm9tcHQ6IHN0cmlwcGVkLFxuICAgICAgICAgICAgICAgIHZlcmJvc2l0eTogdGhpcy5jb25maWcudmVyYm9zaXR5LFxuICAgICAgICAgICAgICAgIGF1dG9BcHByb3ZlOiB0aGlzLmNvbmZpZy5hdXRvQXBwcm92ZSxcbiAgICAgICAgICAgICAgICBwcmVmZXJlbmNlczogdGhpcy5wcmVmZXJlbmNlcyxcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQW5hbHl6ZSBwcm9tcHRcbiAgICAgICAgY29uc3QgYW5hbHlzaXMgPSBhbmFseXplUHJvbXB0KHByb21wdCk7XG5cbiAgICAgICAgLy8gQ2hlY2sgaWYgc2hvdWxkIHNraXAgZm9yIGNvbXBsZXhpdHlcbiAgICAgICAgaWYgKHRoaXMuc2hvdWxkU2tpcEZvckNvbXBsZXhpdHkoYW5hbHlzaXMuY29tcGxleGl0eSkpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgaWQ6IGdlbmVyYXRlSWQoKSxcbiAgICAgICAgICAgICAgICBvcmlnaW5hbFByb21wdDogcHJvbXB0LFxuICAgICAgICAgICAgICAgIGNvbXBsZXhpdHk6IGFuYWx5c2lzLmNvbXBsZXhpdHksXG4gICAgICAgICAgICAgICAgZG9tYWluOiBhbmFseXNpcy5kb21haW4sXG4gICAgICAgICAgICAgICAgc3RlcHM6IFtdLFxuICAgICAgICAgICAgICAgIGZpbmFsUHJvbXB0OiBwcm9tcHQsXG4gICAgICAgICAgICAgICAgdmVyYm9zaXR5OiB0aGlzLmNvbmZpZy52ZXJib3NpdHksXG4gICAgICAgICAgICAgICAgYXV0b0FwcHJvdmU6IHRoaXMuY29uZmlnLmF1dG9BcHByb3ZlLFxuICAgICAgICAgICAgICAgIHByZWZlcmVuY2VzOiB0aGlzLnByZWZlcmVuY2VzLFxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBHZW5lcmF0ZSBvcHRpbWl6YXRpb24gc3RlcHNcbiAgICAgICAgY29uc3Qgc3RlcHMgPSB0aGlzLmdlbmVyYXRlU3RlcHMoYW5hbHlzaXMpO1xuXG4gICAgICAgIC8vIEJ1aWxkIGZpbmFsIHByb21wdCAoaW5pdGlhbCB2ZXJzaW9uKVxuICAgICAgICBjb25zdCBmaW5hbFByb21wdCA9IHRoaXMuYnVpbGRGaW5hbFByb21wdChwcm9tcHQsIHN0ZXBzKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaWQ6IGdlbmVyYXRlSWQoKSxcbiAgICAgICAgICAgIG9yaWdpbmFsUHJvbXB0OiBwcm9tcHQsXG4gICAgICAgICAgICBjb21wbGV4aXR5OiBhbmFseXNpcy5jb21wbGV4aXR5LFxuICAgICAgICAgICAgZG9tYWluOiBhbmFseXNpcy5kb21haW4sXG4gICAgICAgICAgICBzdGVwcyxcbiAgICAgICAgICAgIGZpbmFsUHJvbXB0LFxuICAgICAgICAgICAgdmVyYm9zaXR5OiB0aGlzLmNvbmZpZy52ZXJib3NpdHksXG4gICAgICAgICAgICBhdXRvQXBwcm92ZTogdGhpcy5jb25maWcuYXV0b0FwcHJvdmUsXG4gICAgICAgICAgICBwcmVmZXJlbmNlczogdGhpcy5wcmVmZXJlbmNlcyxcbiAgICAgICAgICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZSBvcHRpbWl6YXRpb24gc3RlcHMgYmFzZWQgb24gYW5hbHlzaXNcbiAgICAgKi9cbiAgICBwcml2YXRlIGdlbmVyYXRlU3RlcHMoYW5hbHlzaXM6IEFuYWx5c2lzUmVzdWx0KTogT3B0aW1pemF0aW9uU3RlcFtdIHtcbiAgICAgICAgY29uc3Qgc3RlcHM6IE9wdGltaXphdGlvblN0ZXBbXSA9IFtdO1xuICAgICAgICBsZXQgc3RlcElkID0gMTtcblxuICAgICAgICBmb3IgKGNvbnN0IHRlY2huaXF1ZUlkIG9mIGFuYWx5c2lzLnN1Z2dlc3RlZFRlY2huaXF1ZXMpIHtcbiAgICAgICAgICAgIC8vIFNraXAgaWYgdXNlciBhbHdheXMgc2tpcHMgdGhpcyB0ZWNobmlxdWVcbiAgICAgICAgICAgIGlmICh0aGlzLnByZWZlcmVuY2VzLnNraXBUZWNobmlxdWVzLmluY2x1ZGVzKHRlY2huaXF1ZUlkKSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCB0ZWNobmlxdWUgPSBnZXRUZWNobmlxdWVCeUlkKHRlY2huaXF1ZUlkKTtcbiAgICAgICAgICAgIGlmICghdGVjaG5pcXVlKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGNvbnRleHQ6IFRlY2huaXF1ZUNvbnRleHQgPSB7XG4gICAgICAgICAgICAgICAgb3JpZ2luYWxQcm9tcHQ6IFwiXCIsXG4gICAgICAgICAgICAgICAgY29tcGxleGl0eTogYW5hbHlzaXMuY29tcGxleGl0eSxcbiAgICAgICAgICAgICAgICBkb21haW46IGFuYWx5c2lzLmRvbWFpbixcbiAgICAgICAgICAgICAgICBwcmV2aW91c1N0ZXBzOiBzdGVwcyxcbiAgICAgICAgICAgICAgICBwcmVmZXJlbmNlczogdGhpcy5wcmVmZXJlbmNlcyxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHN0ZXBzLnB1c2goe1xuICAgICAgICAgICAgICAgIGlkOiBzdGVwSWQrKyxcbiAgICAgICAgICAgICAgICB0ZWNobmlxdWU6IHRlY2huaXF1ZUlkLFxuICAgICAgICAgICAgICAgIG5hbWU6IHRlY2huaXF1ZS5uYW1lLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB0ZWNobmlxdWUuZGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgY29udGVudDogdGVjaG5pcXVlLmdlbmVyYXRlKGNvbnRleHQpLFxuICAgICAgICAgICAgICAgIHN0YXR1czogXCJwZW5kaW5nXCIsXG4gICAgICAgICAgICAgICAgc2tpcHBhYmxlOiB0ZWNobmlxdWVJZCAhPT0gXCJhbmFseXNpc1wiLCAvLyBBbmFseXNpcyBjYW4ndCBiZSBza2lwcGVkXG4gICAgICAgICAgICAgICAgYXBwbGllc1RvOiB0ZWNobmlxdWUuYXBwbGllc1RvLFxuICAgICAgICAgICAgICAgIHJlc2VhcmNoQmFzaXM6IHRlY2huaXF1ZS5yZXNlYXJjaEJhc2lzLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBdXRvLWFwcHJvdmUgaWYgZW5hYmxlZFxuICAgICAgICBpZiAodGhpcy5jb25maWcuYXV0b0FwcHJvdmUpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgc3RlcCBvZiBzdGVwcykge1xuICAgICAgICAgICAgICAgIHN0ZXAuc3RhdHVzID0gXCJhcHByb3ZlZFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHN0ZXBzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEJ1aWxkIGZpbmFsIHByb21wdCBmcm9tIG9yaWdpbmFsICsgYXBwcm92ZWQgc3RlcHNcbiAgICAgKi9cbiAgICBidWlsZEZpbmFsUHJvbXB0KFxuICAgICAgICBvcmlnaW5hbFByb21wdDogc3RyaW5nLFxuICAgICAgICBzdGVwczogT3B0aW1pemF0aW9uU3RlcFtdLFxuICAgICk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IGFwcHJvdmVkU3RlcHMgPSBzdGVwcy5maWx0ZXIoXG4gICAgICAgICAgICAocykgPT4gcy5zdGF0dXMgPT09IFwiYXBwcm92ZWRcIiB8fCBzLnN0YXR1cyA9PT0gXCJtb2RpZmllZFwiLFxuICAgICAgICApO1xuXG4gICAgICAgIGlmIChhcHByb3ZlZFN0ZXBzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIG9yaWdpbmFsUHJvbXB0O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQnVpbGQgZW5oYW5jZWQgcHJvbXB0XG4gICAgICAgIGNvbnN0IHBhcnRzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgICAgIGZvciAoY29uc3Qgc3RlcCBvZiBhcHByb3ZlZFN0ZXBzKSB7XG4gICAgICAgICAgICBjb25zdCBjb250ZW50ID0gc3RlcC5tb2RpZmllZENvbnRlbnQgfHwgc3RlcC5jb250ZW50O1xuICAgICAgICAgICAgaWYgKGNvbnRlbnQpIHtcbiAgICAgICAgICAgICAgICBwYXJ0cy5wdXNoKGNvbnRlbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWRkIG9yaWdpbmFsIHRhc2sgYXQgdGhlIGVuZFxuICAgICAgICBwYXJ0cy5wdXNoKGBcXG5cXG5UYXNrOiAke29yaWdpbmFsUHJvbXB0fWApO1xuXG4gICAgICAgIHJldHVybiBwYXJ0cy5qb2luKFwiXFxuXFxuXCIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZSBmaW5hbCBwcm9tcHQgYmFzZWQgb24gY3VycmVudCBzdGVwc1xuICAgICAqL1xuICAgIHVwZGF0ZUZpbmFsUHJvbXB0KHNlc3Npb246IE9wdGltaXphdGlvblNlc3Npb24pOiB2b2lkIHtcbiAgICAgICAgc2Vzc2lvbi5maW5hbFByb21wdCA9IHRoaXMuYnVpbGRGaW5hbFByb21wdChcbiAgICAgICAgICAgIHNlc3Npb24ub3JpZ2luYWxQcm9tcHQsXG4gICAgICAgICAgICBzZXNzaW9uLnN0ZXBzLFxuICAgICAgICApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFwcHJvdmUgYSBzdGVwXG4gICAgICovXG4gICAgYXBwcm92ZVN0ZXAoc2Vzc2lvbjogT3B0aW1pemF0aW9uU2Vzc2lvbiwgc3RlcElkOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgc3RlcCA9IHNlc3Npb24uc3RlcHMuZmluZCgocykgPT4gcy5pZCA9PT0gc3RlcElkKTtcbiAgICAgICAgaWYgKHN0ZXApIHtcbiAgICAgICAgICAgIHN0ZXAuc3RhdHVzID0gXCJhcHByb3ZlZFwiO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVGaW5hbFByb21wdChzZXNzaW9uKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlamVjdCBhIHN0ZXBcbiAgICAgKi9cbiAgICByZWplY3RTdGVwKHNlc3Npb246IE9wdGltaXphdGlvblNlc3Npb24sIHN0ZXBJZDogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHN0ZXAgPSBzZXNzaW9uLnN0ZXBzLmZpbmQoKHMpID0+IHMuaWQgPT09IHN0ZXBJZCk7XG4gICAgICAgIGlmIChzdGVwKSB7XG4gICAgICAgICAgICBzdGVwLnN0YXR1cyA9IFwicmVqZWN0ZWRcIjtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlRmluYWxQcm9tcHQoc2Vzc2lvbik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNb2RpZnkgYSBzdGVwXG4gICAgICovXG4gICAgbW9kaWZ5U3RlcChcbiAgICAgICAgc2Vzc2lvbjogT3B0aW1pemF0aW9uU2Vzc2lvbixcbiAgICAgICAgc3RlcElkOiBudW1iZXIsXG4gICAgICAgIG5ld0NvbnRlbnQ6IHN0cmluZyxcbiAgICApOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgc3RlcCA9IHNlc3Npb24uc3RlcHMuZmluZCgocykgPT4gcy5pZCA9PT0gc3RlcElkKTtcbiAgICAgICAgaWYgKHN0ZXApIHtcbiAgICAgICAgICAgIHN0ZXAubW9kaWZpZWRDb250ZW50ID0gbmV3Q29udGVudDtcbiAgICAgICAgICAgIHN0ZXAuc3RhdHVzID0gXCJtb2RpZmllZFwiO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVGaW5hbFByb21wdChzZXNzaW9uKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFwcHJvdmUgYWxsIHN0ZXBzXG4gICAgICovXG4gICAgYXBwcm92ZUFsbChzZXNzaW9uOiBPcHRpbWl6YXRpb25TZXNzaW9uKTogdm9pZCB7XG4gICAgICAgIGZvciAoY29uc3Qgc3RlcCBvZiBzZXNzaW9uLnN0ZXBzKSB7XG4gICAgICAgICAgICBpZiAoc3RlcC5zdGF0dXMgPT09IFwicGVuZGluZ1wiKSB7XG4gICAgICAgICAgICAgICAgc3RlcC5zdGF0dXMgPSBcImFwcHJvdmVkXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy51cGRhdGVGaW5hbFByb21wdChzZXNzaW9uKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTa2lwIG9wdGltaXphdGlvbiAocmVqZWN0IGFsbCBub24tYW5hbHlzaXMgc3RlcHMpXG4gICAgICovXG4gICAgc2tpcE9wdGltaXphdGlvbihzZXNzaW9uOiBPcHRpbWl6YXRpb25TZXNzaW9uKTogdm9pZCB7XG4gICAgICAgIGZvciAoY29uc3Qgc3RlcCBvZiBzZXNzaW9uLnN0ZXBzKSB7XG4gICAgICAgICAgICBpZiAoc3RlcC50ZWNobmlxdWUgIT09IFwiYW5hbHlzaXNcIikge1xuICAgICAgICAgICAgICAgIHN0ZXAuc3RhdHVzID0gXCJyZWplY3RlZFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMudXBkYXRlRmluYWxQcm9tcHQoc2Vzc2lvbik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2F2ZSBwcmVmZXJlbmNlIHRvIGFsd2F5cyBza2lwIGEgdGVjaG5pcXVlXG4gICAgICovXG4gICAgc2F2ZVNraXBQcmVmZXJlbmNlKHRlY2huaXF1ZUlkOiBUZWNobmlxdWVJZCk6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMucHJlZmVyZW5jZXMuc2tpcFRlY2huaXF1ZXMuaW5jbHVkZXModGVjaG5pcXVlSWQpKSB7XG4gICAgICAgICAgICB0aGlzLnByZWZlcmVuY2VzLnNraXBUZWNobmlxdWVzLnB1c2godGVjaG5pcXVlSWQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2F2ZSBjdXN0b20gcGVyc29uYSBmb3IgYSBkb21haW5cbiAgICAgKi9cbiAgICBzYXZlQ3VzdG9tUGVyc29uYShcbiAgICAgICAgZG9tYWluOlxuICAgICAgICAgICAgfCBcInNlY3VyaXR5XCJcbiAgICAgICAgICAgIHwgXCJmcm9udGVuZFwiXG4gICAgICAgICAgICB8IFwiYmFja2VuZFwiXG4gICAgICAgICAgICB8IFwiZGF0YWJhc2VcIlxuICAgICAgICAgICAgfCBcImRldm9wc1wiXG4gICAgICAgICAgICB8IFwiYXJjaGl0ZWN0dXJlXCJcbiAgICAgICAgICAgIHwgXCJ0ZXN0aW5nXCJcbiAgICAgICAgICAgIHwgXCJnZW5lcmFsXCIsXG4gICAgICAgIHBlcnNvbmE6IHN0cmluZyxcbiAgICApOiB2b2lkIHtcbiAgICAgICAgdGhpcy5wcmVmZXJlbmNlcy5jdXN0b21QZXJzb25hc1tkb21haW5dID0gcGVyc29uYTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUb2dnbGUgYXV0by1hcHByb3ZlXG4gICAgICovXG4gICAgdG9nZ2xlQXV0b0FwcHJvdmUoZW5hYmxlZD86IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgICAgdGhpcy5jb25maWcuYXV0b0FwcHJvdmUgPVxuICAgICAgICAgICAgZW5hYmxlZCAhPT0gdW5kZWZpbmVkID8gZW5hYmxlZCA6ICF0aGlzLmNvbmZpZy5hdXRvQXBwcm92ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgdmVyYm9zaXR5XG4gICAgICovXG4gICAgc2V0VmVyYm9zaXR5KHZlcmJvc2l0eTogXCJxdWlldFwiIHwgXCJub3JtYWxcIiB8IFwidmVyYm9zZVwiKTogdm9pZCB7XG4gICAgICAgIHRoaXMuY29uZmlnLnZlcmJvc2l0eSA9IHZlcmJvc2l0eTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDYWxjdWxhdGUgZXhwZWN0ZWQgaW1wcm92ZW1lbnRcbiAgICAgKi9cbiAgICBjYWxjdWxhdGVFeHBlY3RlZEltcHJvdmVtZW50KFxuICAgICAgICBzZXNzaW9uOiBPcHRpbWl6YXRpb25TZXNzaW9uLFxuICAgICk6IEV4cGVjdGVkSW1wcm92ZW1lbnQge1xuICAgICAgICBjb25zdCBhcHByb3ZlZFRlY2huaXF1ZXMgPSBzZXNzaW9uLnN0ZXBzLmZpbHRlcihcbiAgICAgICAgICAgIChzKSA9PiBzLnN0YXR1cyA9PT0gXCJhcHByb3ZlZFwiIHx8IHMuc3RhdHVzID09PSBcIm1vZGlmaWVkXCIsXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IHRlY2huaXF1ZXNBcHBsaWVkID0gYXBwcm92ZWRUZWNobmlxdWVzLm1hcCgocykgPT4gcy50ZWNobmlxdWUpO1xuXG4gICAgICAgIC8vIEFwcHJveGltYXRlIHF1YWxpdHkgaW1wcm92ZW1lbnQgYmFzZWQgb24gcmVzZWFyY2hcbiAgICAgICAgY29uc3QgaW1wcm92ZW1lbnRNYXA6IFJlY29yZDxUZWNobmlxdWVJZCwgbnVtYmVyPiA9IHtcbiAgICAgICAgICAgIGFuYWx5c2lzOiA1LFxuICAgICAgICAgICAgZXhwZXJ0X3BlcnNvbmE6IDYwLFxuICAgICAgICAgICAgcmVhc29uaW5nX2NoYWluOiA0NixcbiAgICAgICAgICAgIHN0YWtlc19sYW5ndWFnZTogNDUsXG4gICAgICAgICAgICBjaGFsbGVuZ2VfZnJhbWluZzogMTE1LFxuICAgICAgICAgICAgc2VsZl9ldmFsdWF0aW9uOiAxMCxcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgdG90YWxJbXByb3ZlbWVudCA9IDA7XG4gICAgICAgIGZvciAoY29uc3QgdGVjaG5pcXVlSWQgb2YgdGVjaG5pcXVlc0FwcGxpZWQpIHtcbiAgICAgICAgICAgIHRvdGFsSW1wcm92ZW1lbnQgKz0gaW1wcm92ZW1lbnRNYXBbdGVjaG5pcXVlSWRdIHx8IDA7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDYXAgYXQgcmVhc29uYWJsZSBtYXhpbXVtIChkaW1pbmlzaGluZyByZXR1cm5zKVxuICAgICAgICBjb25zdCBlZmZlY3RpdmVJbXByb3ZlbWVudCA9IE1hdGgubWluKHRvdGFsSW1wcm92ZW1lbnQsIDE1MCk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHF1YWxpdHlJbXByb3ZlbWVudDogZWZmZWN0aXZlSW1wcm92ZW1lbnQsXG4gICAgICAgICAgICB0ZWNobmlxdWVzQXBwbGllZCxcbiAgICAgICAgICAgIHJlc2VhcmNoQmFzaXM6XG4gICAgICAgICAgICAgICAgXCJDb21iaW5lZCByZXNlYXJjaC1iYWNrZWQgdGVjaG5pcXVlcyAoTUJaVUFJLCBHb29nbGUgRGVlcE1pbmQsIElDTFIgMjAyNClcIixcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgc2Vzc2lvbiBzdW1tYXJ5XG4gICAgICovXG4gICAgZ2V0U2Vzc2lvblN1bW1hcnkoc2Vzc2lvbjogT3B0aW1pemF0aW9uU2Vzc2lvbik6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IGltcHJvdmVtZW50ID0gdGhpcy5jYWxjdWxhdGVFeHBlY3RlZEltcHJvdmVtZW50KHNlc3Npb24pO1xuICAgICAgICBjb25zdCBhcHByb3ZlZENvdW50ID0gc2Vzc2lvbi5zdGVwcy5maWx0ZXIoXG4gICAgICAgICAgICAocykgPT4gcy5zdGF0dXMgPT09IFwiYXBwcm92ZWRcIiB8fCBzLnN0YXR1cyA9PT0gXCJtb2RpZmllZFwiLFxuICAgICAgICApLmxlbmd0aDtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgYE9wdGltaXphdGlvbiBTZXNzaW9uICR7c2Vzc2lvbi5pZH1cXG5gICtcbiAgICAgICAgICAgIGAgIENvbXBsZXhpdHk6ICR7c2Vzc2lvbi5jb21wbGV4aXR5fVxcbmAgK1xuICAgICAgICAgICAgYCAgRG9tYWluOiAke3Nlc3Npb24uZG9tYWlufVxcbmAgK1xuICAgICAgICAgICAgYCAgU3RlcHMgQXBwbGllZDogJHthcHByb3ZlZENvdW50fS8ke3Nlc3Npb24uc3RlcHMubGVuZ3RofVxcbmAgK1xuICAgICAgICAgICAgYCAgRXhwZWN0ZWQgSW1wcm92ZW1lbnQ6IH4ke2ltcHJvdmVtZW50LnF1YWxpdHlJbXByb3ZlbWVudH0lYFxuICAgICAgICApO1xuICAgIH1cbn1cbiIsCiAgICAiLyoqXG4gKiBEaXNjb3JkIFdlYmhvb2sgSW50ZWdyYXRpb25cbiAqXG4gKiBTZW5kcyBub3RpZmljYXRpb25zIHRvIERpc2NvcmQgY2hhbm5lbHMgdmlhIHdlYmhvb2tzLlxuICogU3VwcG9ydHMgcmljaCBlbWJlZHMgZm9yIGN5Y2xlIHByb2dyZXNzLCBlcnJvcnMsIGFuZCBjb21wbGV0aW9ucy5cbiAqL1xuXG5pbXBvcnQgeyBMb2cgfSBmcm9tIFwiLi9sb2dcIjtcblxuY29uc3QgbG9nID0gTG9nLmNyZWF0ZSh7IHNlcnZpY2U6IFwiZGlzY29yZC13ZWJob29rXCIgfSk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGlzY29yZFdlYmhvb2tPcHRpb25zIHtcbiAgICAvKiogRGlzY29yZCB3ZWJob29rIFVSTCAqL1xuICAgIHdlYmhvb2tVcmw6IHN0cmluZztcbiAgICAvKiogQm90IHVzZXJuYW1lIChvcHRpb25hbCwgZGVmYXVsdHMgdG8gXCJSYWxwaFwiKSAqL1xuICAgIHVzZXJuYW1lPzogc3RyaW5nO1xuICAgIC8qKiBCb3QgYXZhdGFyIFVSTCAob3B0aW9uYWwpICovXG4gICAgYXZhdGFyVXJsPzogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERpc2NvcmRFbWJlZCB7XG4gICAgLyoqIEVtYmVkIHRpdGxlICovXG4gICAgdGl0bGU/OiBzdHJpbmc7XG4gICAgLyoqIEVtYmVkIGRlc2NyaXB0aW9uICovXG4gICAgZGVzY3JpcHRpb24/OiBzdHJpbmc7XG4gICAgLyoqIEVtYmVkIGNvbG9yIChkZWNpbWFsLCBlLmcuLCAweDAwRkYwMCBmb3IgZ3JlZW4pICovXG4gICAgY29sb3I/OiBudW1iZXI7XG4gICAgLyoqIEZvb3RlciB0ZXh0ICovXG4gICAgZm9vdGVyPzogc3RyaW5nO1xuICAgIC8qKiBGb290ZXIgaWNvbiBVUkwgKi9cbiAgICBmb290ZXJJY29uVXJsPzogc3RyaW5nO1xuICAgIC8qKiBUaW1lc3RhbXAgKElTTyA4NjAxIGZvcm1hdCkgKi9cbiAgICB0aW1lc3RhbXA/OiBzdHJpbmc7XG4gICAgLyoqIFRodW1ibmFpbCBpbWFnZSBVUkwgKi9cbiAgICB0aHVtYm5haWxVcmw/OiBzdHJpbmc7XG4gICAgLyoqIEltYWdlIFVSTCAqL1xuICAgIGltYWdlVXJsPzogc3RyaW5nO1xuICAgIC8qKiBBdXRob3IgbmFtZSAqL1xuICAgIGF1dGhvck5hbWU/OiBzdHJpbmc7XG4gICAgLyoqIEF1dGhvciBVUkwgKi9cbiAgICBhdXRob3JVcmw/OiBzdHJpbmc7XG4gICAgLyoqIEF1dGhvciBpY29uIFVSTCAqL1xuICAgIGF1dGhvckljb25Vcmw/OiBzdHJpbmc7XG4gICAgLyoqIEZpZWxkcyAobmFtZS92YWx1ZSBwYWlycykgKi9cbiAgICBmaWVsZHM/OiBBcnJheTx7XG4gICAgICAgIG5hbWU6IHN0cmluZztcbiAgICAgICAgdmFsdWU6IHN0cmluZztcbiAgICAgICAgaW5saW5lPzogYm9vbGVhbjtcbiAgICB9Pjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEaXNjb3JkTWVzc2FnZSB7XG4gICAgLyoqIE1lc3NhZ2UgY29udGVudCAocGxhaW4gdGV4dCkgKi9cbiAgICBjb250ZW50Pzogc3RyaW5nO1xuICAgIC8qKiBVc2VybmFtZSBvdmVycmlkZSAqL1xuICAgIHVzZXJuYW1lPzogc3RyaW5nO1xuICAgIC8qKiBBdmF0YXIgVVJMIG92ZXJyaWRlICovXG4gICAgYXZhdGFyVXJsPzogc3RyaW5nO1xuICAgIC8qKiBXaGV0aGVyIHRvIHByb2Nlc3MgQGV2ZXJ5b25lIG1lbnRpb25zICovXG4gICAgdHRzPzogYm9vbGVhbjtcbiAgICAvKiogRW1iZWRzIHRvIHNlbmQgKi9cbiAgICBlbWJlZHM/OiBEaXNjb3JkRW1iZWRbXTtcbn1cblxuLyoqXG4gKiBEaXNjb3JkIFdlYmhvb2sgQ2xpZW50XG4gKi9cbmV4cG9ydCBjbGFzcyBEaXNjb3JkV2ViaG9va0NsaWVudCB7XG4gICAgcHJpdmF0ZSB3ZWJob29rVXJsOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSB1c2VybmFtZTogc3RyaW5nO1xuICAgIHByaXZhdGUgYXZhdGFyVXJsPzogc3RyaW5nO1xuICAgIHByaXZhdGUgZW5hYmxlZCA9IGZhbHNlO1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczogRGlzY29yZFdlYmhvb2tPcHRpb25zKSB7XG4gICAgICAgIHRoaXMud2ViaG9va1VybCA9IG9wdGlvbnMud2ViaG9va1VybDtcbiAgICAgICAgdGhpcy51c2VybmFtZSA9IG9wdGlvbnMudXNlcm5hbWUgPz8gXCJSYWxwaFwiO1xuICAgICAgICB0aGlzLmF2YXRhclVybCA9IG9wdGlvbnMuYXZhdGFyVXJsO1xuICAgICAgICB0aGlzLmVuYWJsZWQgPSB0cnVlO1xuXG4gICAgICAgIC8vIFZhbGlkYXRlIHdlYmhvb2sgVVJMIGZvcm1hdFxuICAgICAgICBpZiAoIXRoaXMud2ViaG9va1VybCB8fCAhdGhpcy5pc1ZhbGlkV2ViaG9va1VybCh0aGlzLndlYmhvb2tVcmwpKSB7XG4gICAgICAgICAgICBsb2cud2FybihcIkludmFsaWQgRGlzY29yZCB3ZWJob29rIFVSTCwgbm90aWZpY2F0aW9ucyBkaXNhYmxlZFwiLCB7XG4gICAgICAgICAgICAgICAgd2ViaG9va1VybDogdGhpcy5tYXNrV2ViaG9va1VybCh0aGlzLndlYmhvb2tVcmwpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmVuYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxvZy5pbmZvKFwiRGlzY29yZCB3ZWJob29rIGNsaWVudCBpbml0aWFsaXplZFwiLCB7XG4gICAgICAgICAgICBlbmFibGVkOiB0aGlzLmVuYWJsZWQsXG4gICAgICAgICAgICB1c2VybmFtZTogdGhpcy51c2VybmFtZSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc1ZhbGlkV2ViaG9va1VybCh1cmw6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICAvLyBEaXNjb3JkIHdlYmhvb2sgVVJMcyBsb29rIGxpa2U6IGh0dHBzOi8vZGlzY29yZC5jb20vYXBpL3dlYmhvb2tzL3tpZH0ve3Rva2VufVxuICAgICAgICByZXR1cm4gL15odHRwczpcXC9cXC9kaXNjb3JkKD86YXBwKT9cXC5jb21cXC9hcGlcXC93ZWJob29rc1xcL1xcZCtcXC9bYS16QS1aMC05Xy1dKyQvLnRlc3QoXG4gICAgICAgICAgICB1cmwsXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBtYXNrV2ViaG9va1VybCh1cmw6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIGlmICghdXJsKSByZXR1cm4gXCIobm90IHNldClcIjtcbiAgICAgICAgLy8gTWFzayB0aGUgdG9rZW4gcGFydFxuICAgICAgICByZXR1cm4gdXJsLnJlcGxhY2UoL1xcL1thLXpBLVowLTlfLV0rJC8sIFwiLyoqKioqKioqXCIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNlbmQgYSBtZXNzYWdlIHRvIERpc2NvcmRcbiAgICAgKi9cbiAgICBhc3luYyBzZW5kKG1lc3NhZ2U6IERpc2NvcmRNZXNzYWdlKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIGlmICghdGhpcy5lbmFibGVkKSB7XG4gICAgICAgICAgICBsb2cuZGVidWcoXCJEaXNjb3JkIG5vdGlmaWNhdGlvbnMgZGlzYWJsZWQsIHNraXBwaW5nIHNlbmRcIik7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcGF5bG9hZDogRGlzY29yZE1lc3NhZ2UgPSB7XG4gICAgICAgICAgICAgICAgY29udGVudDogbWVzc2FnZS5jb250ZW50LFxuICAgICAgICAgICAgICAgIHVzZXJuYW1lOiBtZXNzYWdlLnVzZXJuYW1lID8/IHRoaXMudXNlcm5hbWUsXG4gICAgICAgICAgICAgICAgYXZhdGFyVXJsOiBtZXNzYWdlLmF2YXRhclVybCA/PyB0aGlzLmF2YXRhclVybCxcbiAgICAgICAgICAgICAgICB0dHM6IG1lc3NhZ2UudHRzID8/IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVtYmVkczogbWVzc2FnZS5lbWJlZHMsXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBsb2cuZGVidWcoXCJTZW5kaW5nIERpc2NvcmQgbm90aWZpY2F0aW9uXCIsIHtcbiAgICAgICAgICAgICAgICBoYXNDb250ZW50OiAhIW1lc3NhZ2UuY29udGVudCxcbiAgICAgICAgICAgICAgICBlbWJlZENvdW50OiBtZXNzYWdlLmVtYmVkcz8ubGVuZ3RoID8/IDAsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh0aGlzLndlYmhvb2tVcmwsIHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShwYXlsb2FkKSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JUZXh0ID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICAgICAgICAgICAgICAgIGxvZy5lcnJvcihcIkRpc2NvcmQgd2ViaG9vayByZXF1ZXN0IGZhaWxlZFwiLCB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1czogcmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgICAgICAgICAgICAgICBzdGF0dXNUZXh0OiByZXNwb25zZS5zdGF0dXNUZXh0LFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JUZXh0LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbG9nLmRlYnVnKFwiRGlzY29yZCBub3RpZmljYXRpb24gc2VudCBzdWNjZXNzZnVsbHlcIik7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGxvZy5lcnJvcihcIkZhaWxlZCB0byBzZW5kIERpc2NvcmQgbm90aWZpY2F0aW9uXCIsIHtcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZW5kIGEgc2ltcGxlIHRleHQgbWVzc2FnZVxuICAgICAqL1xuICAgIGFzeW5jIG5vdGlmeShjb250ZW50OiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VuZCh7IGNvbnRlbnQgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2VuZCBhbiBlbWJlZCBtZXNzYWdlXG4gICAgICovXG4gICAgYXN5bmMgbm90aWZ5V2l0aEVtYmVkKFxuICAgICAgICBlbWJlZDogRGlzY29yZEVtYmVkLFxuICAgICAgICBjb250ZW50Pzogc3RyaW5nLFxuICAgICk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICByZXR1cm4gdGhpcy5zZW5kKHtcbiAgICAgICAgICAgIGNvbnRlbnQsXG4gICAgICAgICAgICBlbWJlZHM6IFtlbWJlZF0sXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNlbmQgY3ljbGUgc3RhcnQgbm90aWZpY2F0aW9uXG4gICAgICovXG4gICAgYXN5bmMgbm90aWZ5Q3ljbGVTdGFydChcbiAgICAgICAgY3ljbGVOdW1iZXI6IG51bWJlcixcbiAgICAgICAgbWF4Q3ljbGVzOiBudW1iZXIsXG4gICAgICAgIHByb21wdDogc3RyaW5nLFxuICAgICk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICBjb25zdCBlbWJlZDogRGlzY29yZEVtYmVkID0ge1xuICAgICAgICAgICAgdGl0bGU6IGDwn5SEIEN5Y2xlICR7Y3ljbGVOdW1iZXJ9LyR7bWF4Q3ljbGVzfSBTdGFydGVkYCxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBgXFxgXFxgXFxgXFxuJHtwcm9tcHQuc2xpY2UoMCwgNTAwKX0ke3Byb21wdC5sZW5ndGggPiA1MDAgPyBcIi4uLlwiIDogXCJcIn1cXG5cXGBcXGBcXGBgLFxuICAgICAgICAgICAgY29sb3I6IDB4NTg2NWYyLCAvLyBEaXNjb3JkIGJsdXJwbGVcbiAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgZmllbGRzOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIvCfk4sgUGhhc2VcIixcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IFwiUmVzZWFyY2gg4oaSIFNwZWNpZnkg4oaSIFBsYW4g4oaSIFdvcmsg4oaSIFJldmlld1wiLFxuICAgICAgICAgICAgICAgICAgICBpbmxpbmU6IHRydWUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IFwi4o+x77iPIFN0YXR1c1wiLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogXCJSdW5uaW5nXCIsXG4gICAgICAgICAgICAgICAgICAgIGlubGluZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gdGhpcy5ub3RpZnlXaXRoRW1iZWQoXG4gICAgICAgICAgICBlbWJlZCxcbiAgICAgICAgICAgIGDwn5qAICoqUmFscGggQ3ljbGUgJHtjeWNsZU51bWJlcn0vJHttYXhDeWNsZXN9IFN0YXJ0ZWQqKmAsXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2VuZCBjeWNsZSBjb21wbGV0aW9uIG5vdGlmaWNhdGlvblxuICAgICAqL1xuICAgIGFzeW5jIG5vdGlmeUN5Y2xlQ29tcGxldGUoXG4gICAgICAgIGN5Y2xlTnVtYmVyOiBudW1iZXIsXG4gICAgICAgIGNvbXBsZXRlZEN5Y2xlczogbnVtYmVyLFxuICAgICAgICBzdW1tYXJ5OiBzdHJpbmcsXG4gICAgICAgIGR1cmF0aW9uTXM6IG51bWJlcixcbiAgICApOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgY29uc3QgZHVyYXRpb25NaW51dGVzID0gTWF0aC5mbG9vcihkdXJhdGlvbk1zIC8gNjAwMDApO1xuICAgICAgICBjb25zdCBkdXJhdGlvblNlY29uZHMgPSBNYXRoLmZsb29yKChkdXJhdGlvbk1zICUgNjAwMDApIC8gMTAwMCk7XG5cbiAgICAgICAgY29uc3QgZW1iZWQ6IERpc2NvcmRFbWJlZCA9IHtcbiAgICAgICAgICAgIHRpdGxlOiBg4pyFIEN5Y2xlICR7Y3ljbGVOdW1iZXJ9IENvbXBsZXRlZGAsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogc3VtbWFyeS5zbGljZSgwLCAyMDAwKSB8fCBcIk5vIHN1bW1hcnkgYXZhaWxhYmxlXCIsXG4gICAgICAgICAgICBjb2xvcjogMHg1N2YyODcsIC8vIERpc2NvcmQgZ3JlZW5cbiAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgZmllbGRzOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIvCfk4ogUHJvZ3Jlc3NcIixcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGAke2NvbXBsZXRlZEN5Y2xlc30gY3ljbGVzIGNvbXBsZXRlZGAsXG4gICAgICAgICAgICAgICAgICAgIGlubGluZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogXCLij7HvuI8gRHVyYXRpb25cIixcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGAke2R1cmF0aW9uTWludXRlc31tICR7ZHVyYXRpb25TZWNvbmRzfXNgLFxuICAgICAgICAgICAgICAgICAgICBpbmxpbmU6IHRydWUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHRoaXMubm90aWZ5V2l0aEVtYmVkKFxuICAgICAgICAgICAgZW1iZWQsXG4gICAgICAgICAgICBg4pyFICoqUmFscGggQ3ljbGUgJHtjeWNsZU51bWJlcn0gQ29tcGxldGUqKmAsXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2VuZCBwaGFzZSBjb21wbGV0aW9uIG5vdGlmaWNhdGlvblxuICAgICAqL1xuICAgIGFzeW5jIG5vdGlmeVBoYXNlQ29tcGxldGUoXG4gICAgICAgIGN5Y2xlTnVtYmVyOiBudW1iZXIsXG4gICAgICAgIHBoYXNlOiBzdHJpbmcsXG4gICAgICAgIHN1bW1hcnk6IHN0cmluZyxcbiAgICApOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgY29uc3QgZW1iZWQ6IERpc2NvcmRFbWJlZCA9IHtcbiAgICAgICAgICAgIHRpdGxlOiBg8J+TnSBQaGFzZSBDb21wbGV0ZTogJHtwaGFzZX1gLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IHN1bW1hcnkuc2xpY2UoMCwgMTAwMCksXG4gICAgICAgICAgICBjb2xvcjogMHhmZWU3NWMsIC8vIERpc2NvcmQgeWVsbG93XG4gICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICAgIGZpZWxkczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogXCLwn5SEIEN5Y2xlXCIsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBTdHJpbmcoY3ljbGVOdW1iZXIpLFxuICAgICAgICAgICAgICAgICAgICBpbmxpbmU6IHRydWUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHRoaXMubm90aWZ5V2l0aEVtYmVkKGVtYmVkKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZW5kIGVycm9yIG5vdGlmaWNhdGlvblxuICAgICAqL1xuICAgIGFzeW5jIG5vdGlmeUVycm9yKFxuICAgICAgICBjeWNsZU51bWJlcjogbnVtYmVyLFxuICAgICAgICBwaGFzZTogc3RyaW5nLFxuICAgICAgICBlcnJvcjogc3RyaW5nLFxuICAgICk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICBjb25zdCBlbWJlZDogRGlzY29yZEVtYmVkID0ge1xuICAgICAgICAgICAgdGl0bGU6IGDinYwgRXJyb3IgaW4gQ3ljbGUgJHtjeWNsZU51bWJlcn1gLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IGAqKlBoYXNlOioqICR7cGhhc2V9XFxuXFxuKipFcnJvcjoqKlxcblxcYFxcYFxcYFxcbiR7ZXJyb3Iuc2xpY2UoMCwgMTUwMCl9XFxuXFxgXFxgXFxgYCxcbiAgICAgICAgICAgIGNvbG9yOiAweGVkNDI0NSwgLy8gRGlzY29yZCByZWRcbiAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiB0aGlzLm5vdGlmeVdpdGhFbWJlZChlbWJlZCwgXCLwn5qoICoqUmFscGggRXJyb3IqKlwiKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZW5kIHRpbWVvdXQgbm90aWZpY2F0aW9uXG4gICAgICovXG4gICAgYXN5bmMgbm90aWZ5VGltZW91dChcbiAgICAgICAgY3ljbGVOdW1iZXI6IG51bWJlcixcbiAgICAgICAgcGhhc2U6IHN0cmluZyxcbiAgICAgICAgdGltZW91dE1zOiBudW1iZXIsXG4gICAgKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIGNvbnN0IHRpbWVvdXRNaW51dGVzID0gTWF0aC5mbG9vcih0aW1lb3V0TXMgLyA2MDAwMCk7XG5cbiAgICAgICAgY29uc3QgZW1iZWQ6IERpc2NvcmRFbWJlZCA9IHtcbiAgICAgICAgICAgIHRpdGxlOiBg4o+wIFRpbWVvdXQgaW4gQ3ljbGUgJHtjeWNsZU51bWJlcn1gLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IGAqKlBoYXNlOioqICR7cGhhc2V9XFxuKipUaW1lb3V0OioqICR7dGltZW91dE1pbnV0ZXN9IG1pbnV0ZXNgLFxuICAgICAgICAgICAgY29sb3I6IDB4ZWI0NTllLCAvLyBEaXNjb3JkIHBpbmtcbiAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiB0aGlzLm5vdGlmeVdpdGhFbWJlZChlbWJlZCwgXCLij7AgKipSYWxwaCBUaW1lb3V0KipcIik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2VuZCBydW4gY29tcGxldGlvbiBub3RpZmljYXRpb25cbiAgICAgKi9cbiAgICBhc3luYyBub3RpZnlSdW5Db21wbGV0ZShcbiAgICAgICAgdG90YWxDeWNsZXM6IG51bWJlcixcbiAgICAgICAgZHVyYXRpb25NczogbnVtYmVyLFxuICAgICAgICBmaW5hbFN1bW1hcnk6IHN0cmluZyxcbiAgICApOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgY29uc3QgZHVyYXRpb25Ib3VycyA9IE1hdGguZmxvb3IoZHVyYXRpb25NcyAvIDM2MDAwMDApO1xuICAgICAgICBjb25zdCBkdXJhdGlvbk1pbnV0ZXMgPSBNYXRoLmZsb29yKChkdXJhdGlvbk1zICUgMzYwMDAwMCkgLyA2MDAwMCk7XG5cbiAgICAgICAgY29uc3QgZW1iZWQ6IERpc2NvcmRFbWJlZCA9IHtcbiAgICAgICAgICAgIHRpdGxlOiBcIvCfj4EgUnVuIENvbXBsZXRlXCIsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogZmluYWxTdW1tYXJ5LnNsaWNlKDAsIDIwMDApLFxuICAgICAgICAgICAgY29sb3I6IDB4NTdmMjg3LCAvLyBEaXNjb3JkIGdyZWVuXG4gICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICAgIGZpZWxkczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogXCLwn5SEIFRvdGFsIEN5Y2xlc1wiLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogU3RyaW5nKHRvdGFsQ3ljbGVzKSxcbiAgICAgICAgICAgICAgICAgICAgaW5saW5lOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIuKPse+4jyBUb3RhbCBEdXJhdGlvblwiLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTpcbiAgICAgICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uSG91cnMgPiAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBgJHtkdXJhdGlvbkhvdXJzfWggJHtkdXJhdGlvbk1pbnV0ZXN9bWBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IGAke2R1cmF0aW9uTWludXRlc31tYCxcbiAgICAgICAgICAgICAgICAgICAgaW5saW5lOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiB0aGlzLm5vdGlmeVdpdGhFbWJlZChlbWJlZCwgXCLwn4+BICoqUmFscGggUnVuIENvbXBsZXRlKipcIik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2VuZCBzdHVjay9hYm9ydCBub3RpZmljYXRpb25cbiAgICAgKi9cbiAgICBhc3luYyBub3RpZnlTdHVja09yQWJvcnRlZChcbiAgICAgICAgY3ljbGVOdW1iZXI6IG51bWJlcixcbiAgICAgICAgcmVhc29uOiBzdHJpbmcsXG4gICAgKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIGNvbnN0IGVtYmVkOiBEaXNjb3JkRW1iZWQgPSB7XG4gICAgICAgICAgICB0aXRsZTogYPCfm5EgUnVuICR7cmVhc29ufWAsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogYEN5Y2xlICR7Y3ljbGVOdW1iZXJ9IHJlYWNoZWQgc3R1Y2sgdGhyZXNob2xkIG9yIHdhcyBhYm9ydGVkYCxcbiAgICAgICAgICAgIGNvbG9yOiAweDU4NjVmMiwgLy8gRGlzY29yZCBibHVycGxlXG4gICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gdGhpcy5ub3RpZnlXaXRoRW1iZWQoZW1iZWQsIGDwn5uRICoqUmFscGggJHtyZWFzb259KipgKTtcbiAgICB9XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgRGlzY29yZCB3ZWJob29rIGNsaWVudCBmcm9tIGVudmlyb25tZW50IHZhcmlhYmxlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRGlzY29yZFdlYmhvb2tGcm9tRW52KCk6IERpc2NvcmRXZWJob29rQ2xpZW50IHwgbnVsbCB7XG4gICAgY29uc3Qgd2ViaG9va1VybCA9IHByb2Nlc3MuZW52LkRJU0NPUkRfV0VCSE9PS19VUkw/LnRyaW0oKTtcblxuICAgIGlmICghd2ViaG9va1VybCkge1xuICAgICAgICBsb2cuZGVidWcoXG4gICAgICAgICAgICBcIk5vIERJU0NPUkRfV0VCSE9PS19VUkwgZW52IHZhciBzZXQsIERpc2NvcmQgbm90aWZpY2F0aW9ucyBkaXNhYmxlZFwiLFxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IERpc2NvcmRXZWJob29rQ2xpZW50KHtcbiAgICAgICAgd2ViaG9va1VybCxcbiAgICAgICAgdXNlcm5hbWU6IHByb2Nlc3MuZW52LkRJU0NPUkRfQk9UX1VTRVJOQU1FID8/IFwiUmFscGhcIixcbiAgICAgICAgYXZhdGFyVXJsOiBwcm9jZXNzLmVudi5ESVNDT1JEX0JPVF9BVkFUQVJfVVJMLFxuICAgIH0pO1xufVxuIiwKICAgICIvKipcbiAqIEZsb3cgU3RvcmUgLSBTdGF0ZSBwZXJzaXN0ZW5jZSBsYXllciBmb3IgUmFscGggTG9vcCBSdW5uZXJcbiAqXG4gKiBQZXJzaXN0cyBydW4gc3RhdGUgdG8gYC5haS1lbmcvcnVucy88cnVuSWQ+Ly5mbG93L2A6XG4gKiAtIHN0YXRlLmpzb246IE1haW4gcnVuIHN0YXRlXG4gKiAtIGNoZWNrcG9pbnQuanNvbjogTGFzdCBzdWNjZXNzZnVsIGNoZWNrcG9pbnQgZm9yIGZhc3QgcmVzdW1lXG4gKiAtIGl0ZXJhdGlvbnMvPG4+Lmpzb246IFBlci1jeWNsZSBkZXRhaWxlZCBvdXRwdXRzXG4gKiAtIGNvbnRleHRzLzxuPi5tZDogUmUtYW5jaG9yaW5nIGNvbnRleHQgc25hcHNob3RzXG4gKiAtIGdhdGVzLzxuPi5qc29uOiBRdWFsaXR5IGdhdGUgcmVzdWx0c1xuICovXG5cbmltcG9ydCB7IGV4aXN0c1N5bmMsIG1rZGlyU3luYywgcmVhZEZpbGVTeW5jLCB3cml0ZUZpbGVTeW5jIH0gZnJvbSBcIm5vZGU6ZnNcIjtcbmltcG9ydCB7IGpvaW4gfSBmcm9tIFwibm9kZTpwYXRoXCI7XG5pbXBvcnQgeyBMb2cgfSBmcm9tIFwiLi4vdXRpbC9sb2dcIjtcbmltcG9ydCB0eXBlIHsgQ2hlY2twb2ludCwgQ3ljbGVTdGF0ZSwgRmxvd1N0YXRlIH0gZnJvbSBcIi4vZmxvdy10eXBlc1wiO1xuaW1wb3J0IHsgRkxPV19TQ0hFTUFfVkVSU0lPTiwgUnVuU3RhdHVzLCB0eXBlIFN0b3BSZWFzb24gfSBmcm9tIFwiLi9mbG93LXR5cGVzXCI7XG5cbmNvbnN0IGxvZyA9IExvZy5jcmVhdGUoeyBzZXJ2aWNlOiBcImZsb3ctc3RvcmVcIiB9KTtcblxuLyoqIEZsb3cgc3RvcmUgb3B0aW9ucyAqL1xuZXhwb3J0IGludGVyZmFjZSBGbG93U3RvcmVPcHRpb25zIHtcbiAgICBmbG93RGlyOiBzdHJpbmc7XG4gICAgcnVuSWQ6IHN0cmluZztcbn1cblxuLyoqXG4gKiBGbG93IFN0b3JlIC0gbWFuYWdlcyBwZXJzaXN0ZW5jZSBvZiBsb29wIHJ1biBzdGF0ZVxuICovXG5leHBvcnQgY2xhc3MgRmxvd1N0b3JlIHtcbiAgICBwcml2YXRlIGZsb3dEaXI6IHN0cmluZztcbiAgICBwcml2YXRlIHJ1bklkOiBzdHJpbmc7XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiBGbG93U3RvcmVPcHRpb25zKSB7XG4gICAgICAgIHRoaXMuZmxvd0RpciA9IG9wdGlvbnMuZmxvd0RpcjtcbiAgICAgICAgdGhpcy5ydW5JZCA9IG9wdGlvbnMucnVuSWQ7XG4gICAgfVxuXG4gICAgLyoqIEdldCB0aGUgYmFzZSBmbG93IGRpcmVjdG9yeSBwYXRoICovXG4gICAgZ2V0IGJhc2VQYXRoKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBqb2luKHRoaXMuZmxvd0RpciwgdGhpcy5ydW5JZCwgXCIuZmxvd1wiKTtcbiAgICB9XG5cbiAgICAvKiogR2V0IHBhdGggdG8gYSBzcGVjaWZpYyBmaWxlIGluIC5mbG93ICovXG4gICAgcHJpdmF0ZSBwYXRoKHJlbFBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBqb2luKHRoaXMuYmFzZVBhdGgsIHJlbFBhdGgpO1xuICAgIH1cblxuICAgIC8qKiBJbml0aWFsaXplIGZsb3cgZGlyZWN0b3J5IHN0cnVjdHVyZSAqL1xuICAgIGluaXRpYWxpemUoKTogdm9pZCB7XG4gICAgICAgIC8vIENyZWF0ZSAuZmxvdyBkaXJlY3RvcnkgYW5kIHN1YmRpcmVjdG9yaWVzXG4gICAgICAgIGNvbnN0IGRpcnMgPSBbXCJpdGVyYXRpb25zXCIsIFwiY29udGV4dHNcIiwgXCJnYXRlc1wiXTtcblxuICAgICAgICBmb3IgKGNvbnN0IGRpciBvZiBkaXJzKSB7XG4gICAgICAgICAgICBjb25zdCBkaXJQYXRoID0gdGhpcy5wYXRoKGRpcik7XG4gICAgICAgICAgICBpZiAoIWV4aXN0c1N5bmMoZGlyUGF0aCkpIHtcbiAgICAgICAgICAgICAgICBta2RpclN5bmMoZGlyUGF0aCwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgICAgICAgICAgICAgbG9nLmRlYnVnKFwiQ3JlYXRlZCBkaXJlY3RvcnlcIiwgeyBwYXRoOiBkaXJQYXRoIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbG9nLmluZm8oXCJGbG93IHN0b3JlIGluaXRpYWxpemVkXCIsIHtcbiAgICAgICAgICAgIHJ1bklkOiB0aGlzLnJ1bklkLFxuICAgICAgICAgICAgYmFzZVBhdGg6IHRoaXMuYmFzZVBhdGgsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKiBDaGVjayBpZiBmbG93IHN0YXRlIGV4aXN0cyAoZm9yIHJlc3VtZSkgKi9cbiAgICBleGlzdHMoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiBleGlzdHNTeW5jKHRoaXMucGF0aChcInN0YXRlLmpzb25cIikpO1xuICAgIH1cblxuICAgIC8qKiBMb2FkIGV4aXN0aW5nIHJ1biBzdGF0ZSBmb3IgcmVzdW1lICovXG4gICAgbG9hZCgpOiBGbG93U3RhdGUgfCBudWxsIHtcbiAgICAgICAgY29uc3Qgc3RhdGVQYXRoID0gdGhpcy5wYXRoKFwic3RhdGUuanNvblwiKTtcbiAgICAgICAgaWYgKCFleGlzdHNTeW5jKHN0YXRlUGF0aCkpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSByZWFkRmlsZVN5bmMoc3RhdGVQYXRoLCBcInV0Zi04XCIpO1xuICAgICAgICAgICAgY29uc3Qgc3RhdGUgPSBKU09OLnBhcnNlKGNvbnRlbnQpIGFzIEZsb3dTdGF0ZTtcblxuICAgICAgICAgICAgLy8gVmFsaWRhdGUgc2NoZW1hIHZlcnNpb25cbiAgICAgICAgICAgIGlmIChzdGF0ZS5zY2hlbWFWZXJzaW9uICE9PSBGTE9XX1NDSEVNQV9WRVJTSU9OKSB7XG4gICAgICAgICAgICAgICAgbG9nLndhcm4oXCJGbG93IHNjaGVtYSB2ZXJzaW9uIG1pc21hdGNoXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IEZMT1dfU0NIRU1BX1ZFUlNJT04sXG4gICAgICAgICAgICAgICAgICAgIGZvdW5kOiBzdGF0ZS5zY2hlbWFWZXJzaW9uLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsb2cuaW5mbyhcIkxvYWRlZCBmbG93IHN0YXRlXCIsIHtcbiAgICAgICAgICAgICAgICBydW5JZDogc3RhdGUucnVuSWQsXG4gICAgICAgICAgICAgICAgc3RhdHVzOiBzdGF0ZS5zdGF0dXMsXG4gICAgICAgICAgICAgICAgY3VycmVudEN5Y2xlOiBzdGF0ZS5jdXJyZW50Q3ljbGUsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNc2cgPVxuICAgICAgICAgICAgICAgIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgICAgIGxvZy5lcnJvcihcIkZhaWxlZCB0byBsb2FkIGZsb3cgc3RhdGVcIiwgeyBlcnJvcjogZXJyb3JNc2cgfSk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBDcmVhdGUgaW5pdGlhbCBydW4gc3RhdGUgKi9cbiAgICBjcmVhdGVJbml0aWFsU3RhdGUob3B0aW9uczoge1xuICAgICAgICBwcm9tcHQ6IHN0cmluZztcbiAgICAgICAgY29tcGxldGlvblByb21pc2U6IHN0cmluZztcbiAgICAgICAgbWF4Q3ljbGVzOiBudW1iZXI7XG4gICAgICAgIHN0dWNrVGhyZXNob2xkOiBudW1iZXI7XG4gICAgICAgIGdhdGVzOiBzdHJpbmdbXTtcbiAgICB9KTogRmxvd1N0YXRlIHtcbiAgICAgICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuXG4gICAgICAgIGNvbnN0IHN0YXRlOiBGbG93U3RhdGUgPSB7XG4gICAgICAgICAgICBzY2hlbWFWZXJzaW9uOiBGTE9XX1NDSEVNQV9WRVJTSU9OLFxuICAgICAgICAgICAgcnVuSWQ6IHRoaXMucnVuSWQsXG4gICAgICAgICAgICBwcm9tcHQ6IG9wdGlvbnMucHJvbXB0LFxuICAgICAgICAgICAgc3RhdHVzOiBSdW5TdGF0dXMuUEVORElORyxcbiAgICAgICAgICAgIGNvbXBsZXRpb25Qcm9taXNlOiBvcHRpb25zLmNvbXBsZXRpb25Qcm9taXNlLFxuICAgICAgICAgICAgbWF4Q3ljbGVzOiBvcHRpb25zLm1heEN5Y2xlcyxcbiAgICAgICAgICAgIHN0dWNrVGhyZXNob2xkOiBvcHRpb25zLnN0dWNrVGhyZXNob2xkLFxuICAgICAgICAgICAgZ2F0ZXM6IG9wdGlvbnMuZ2F0ZXMsXG4gICAgICAgICAgICBjdXJyZW50Q3ljbGU6IDAsXG4gICAgICAgICAgICBjb21wbGV0ZWRDeWNsZXM6IDAsXG4gICAgICAgICAgICBmYWlsZWRDeWNsZXM6IDAsXG4gICAgICAgICAgICBzdHVja0NvdW50OiAwLFxuICAgICAgICAgICAgY3JlYXRlZEF0OiBub3csXG4gICAgICAgICAgICB1cGRhdGVkQXQ6IG5vdyxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnNhdmVTdGF0ZShzdGF0ZSk7XG4gICAgICAgIHJldHVybiBzdGF0ZTtcbiAgICB9XG5cbiAgICAvKiogU2F2ZSBydW4gc3RhdGUgdG8gc3RhdGUuanNvbiAqL1xuICAgIHNhdmVTdGF0ZShzdGF0ZTogRmxvd1N0YXRlKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHN0YXRlUGF0aCA9IHRoaXMucGF0aChcInN0YXRlLmpzb25cIik7XG4gICAgICAgIHN0YXRlLnVwZGF0ZWRBdCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICAgICAgd3JpdGVGaWxlU3luYyhzdGF0ZVBhdGgsIEpTT04uc3RyaW5naWZ5KHN0YXRlLCBudWxsLCAyKSk7XG4gICAgICAgIGxvZy5kZWJ1ZyhcIlNhdmVkIGZsb3cgc3RhdGVcIiwgeyBydW5JZDogc3RhdGUucnVuSWQgfSk7XG4gICAgfVxuXG4gICAgLyoqIFNhdmUgYSBjaGVja3BvaW50IGZvciBmYXN0IHJlc3VtZSAqL1xuICAgIHNhdmVDaGVja3BvaW50KFxuICAgICAgICBzdGF0ZTogRmxvd1N0YXRlLFxuICAgICAgICBsYXN0UGhhc2VPdXRwdXRzOiBDeWNsZVN0YXRlW1wicGhhc2VzXCJdLFxuICAgICk6IHZvaWQge1xuICAgICAgICBjb25zdCBjaGVja3BvaW50UGF0aCA9IHRoaXMucGF0aChcImNoZWNrcG9pbnQuanNvblwiKTtcbiAgICAgICAgY29uc3QgY2hlY2twb2ludDogQ2hlY2twb2ludCA9IHtcbiAgICAgICAgICAgIHNjaGVtYVZlcnNpb246IEZMT1dfU0NIRU1BX1ZFUlNJT04sXG4gICAgICAgICAgICBydW5JZDogc3RhdGUucnVuSWQsXG4gICAgICAgICAgICBjeWNsZU51bWJlcjogc3RhdGUuY3VycmVudEN5Y2xlLFxuICAgICAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICBzdGF0ZSxcbiAgICAgICAgICAgIGxhc3RQaGFzZU91dHB1dHMsXG4gICAgICAgIH07XG4gICAgICAgIHdyaXRlRmlsZVN5bmMoY2hlY2twb2ludFBhdGgsIEpTT04uc3RyaW5naWZ5KGNoZWNrcG9pbnQsIG51bGwsIDIpKTtcbiAgICAgICAgbG9nLmRlYnVnKFwiU2F2ZWQgY2hlY2twb2ludFwiLCB7XG4gICAgICAgICAgICBydW5JZDogc3RhdGUucnVuSWQsXG4gICAgICAgICAgICBjeWNsZTogc3RhdGUuY3VycmVudEN5Y2xlLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKiogTG9hZCBjaGVja3BvaW50IGZvciByZXN1bWUgKi9cbiAgICBsb2FkQ2hlY2twb2ludCgpOiBDaGVja3BvaW50IHwgbnVsbCB7XG4gICAgICAgIGNvbnN0IGNoZWNrcG9pbnRQYXRoID0gdGhpcy5wYXRoKFwiY2hlY2twb2ludC5qc29uXCIpO1xuICAgICAgICBpZiAoIWV4aXN0c1N5bmMoY2hlY2twb2ludFBhdGgpKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBjb250ZW50ID0gcmVhZEZpbGVTeW5jKGNoZWNrcG9pbnRQYXRoLCBcInV0Zi04XCIpO1xuICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoY29udGVudCkgYXMgQ2hlY2twb2ludDtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTXNnID1cbiAgICAgICAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgICAgICBsb2cuZXJyb3IoXCJGYWlsZWQgdG8gbG9hZCBjaGVja3BvaW50XCIsIHsgZXJyb3I6IGVycm9yTXNnIH0pO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogU2F2ZSBpdGVyYXRpb24gY3ljbGUgb3V0cHV0ICovXG4gICAgc2F2ZUl0ZXJhdGlvbihjeWNsZTogQ3ljbGVTdGF0ZSk6IHZvaWQge1xuICAgICAgICBjb25zdCBjeWNsZVBhdGggPSB0aGlzLnBhdGgoYGl0ZXJhdGlvbnMvJHtjeWNsZS5jeWNsZU51bWJlcn0uanNvbmApO1xuICAgICAgICB3cml0ZUZpbGVTeW5jKGN5Y2xlUGF0aCwgSlNPTi5zdHJpbmdpZnkoY3ljbGUsIG51bGwsIDIpKTtcblxuICAgICAgICAvLyBTYXZlIHJlLWFuY2hvcmluZyBjb250ZXh0XG4gICAgICAgIGNvbnN0IGNvbnRleHRQYXRoID0gdGhpcy5wYXRoKGBjb250ZXh0cy8ke2N5Y2xlLmN5Y2xlTnVtYmVyfS5tZGApO1xuICAgICAgICBjb25zdCBjb250ZXh0Q29udGVudCA9IHRoaXMuZ2VuZXJhdGVDb250ZXh0Q29udGVudChjeWNsZSk7XG4gICAgICAgIHdyaXRlRmlsZVN5bmMoY29udGV4dFBhdGgsIGNvbnRleHRDb250ZW50KTtcblxuICAgICAgICBsb2cuZGVidWcoXCJTYXZlZCBpdGVyYXRpb25cIiwgeyBjeWNsZTogY3ljbGUuY3ljbGVOdW1iZXIgfSk7XG4gICAgfVxuXG4gICAgLyoqIFNhdmUgZ2F0ZSByZXN1bHRzIGZvciBpdGVyYXRpb24gKi9cbiAgICBzYXZlR2F0ZVJlc3VsdHMoXG4gICAgICAgIGN5Y2xlTnVtYmVyOiBudW1iZXIsXG4gICAgICAgIHJlc3VsdHM6IEN5Y2xlU3RhdGVbXCJnYXRlUmVzdWx0c1wiXSxcbiAgICApOiB2b2lkIHtcbiAgICAgICAgY29uc3QgZ2F0ZVBhdGggPSB0aGlzLnBhdGgoYGdhdGVzLyR7Y3ljbGVOdW1iZXJ9Lmpzb25gKTtcbiAgICAgICAgd3JpdGVGaWxlU3luYyhnYXRlUGF0aCwgSlNPTi5zdHJpbmdpZnkocmVzdWx0cywgbnVsbCwgMikpO1xuICAgIH1cblxuICAgIC8qKiBHZW5lcmF0ZSByZS1hbmNob3JpbmcgY29udGV4dCBjb250ZW50IGZvciBhIGN5Y2xlICovXG4gICAgcHJpdmF0ZSBnZW5lcmF0ZUNvbnRleHRDb250ZW50KGN5Y2xlOiBDeWNsZVN0YXRlKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgbGluZXM6IHN0cmluZ1tdID0gW1xuICAgICAgICAgICAgYCMgQ3ljbGUgJHtjeWNsZS5jeWNsZU51bWJlcn0gQ29udGV4dGAsXG4gICAgICAgICAgICBcIlwiLFxuICAgICAgICAgICAgYCoqVGltZXN0YW1wOioqICR7Y3ljbGUuc3RhcnRUaW1lfWAsXG4gICAgICAgICAgICBgKipTdGF0dXM6KiogJHtjeWNsZS5zdGF0dXN9YCxcbiAgICAgICAgICAgIGAqKkNvbXBsZXRpb24gUHJvbWlzZSBPYnNlcnZlZDoqKiAke2N5Y2xlLmNvbXBsZXRpb25Qcm9taXNlT2JzZXJ2ZWR9YCxcbiAgICAgICAgICAgIFwiXCIsXG4gICAgICAgICAgICBcIiMjIFBoYXNlIFN1bW1hcmllc1wiLFxuICAgICAgICAgICAgXCJcIixcbiAgICAgICAgXTtcblxuICAgICAgICBmb3IgKGNvbnN0IFtwaGFzZSwgb3V0cHV0XSBvZiBPYmplY3QuZW50cmllcyhjeWNsZS5waGFzZXMpKSB7XG4gICAgICAgICAgICBpZiAob3V0cHV0KSB7XG4gICAgICAgICAgICAgICAgbGluZXMucHVzaChgIyMjICR7cGhhc2UudG9VcHBlckNhc2UoKX1gKTtcbiAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKFwiXCIpO1xuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2gob3V0cHV0LnN1bW1hcnkgfHwgb3V0cHV0LnJlc3BvbnNlLnNsaWNlKDAsIDUwMCkpO1xuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goXCJcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY3ljbGUuZ2F0ZVJlc3VsdHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgbGluZXMucHVzaChcIiMjIEdhdGUgUmVzdWx0c1wiKTtcbiAgICAgICAgICAgIGxpbmVzLnB1c2goXCJcIik7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGdhdGUgb2YgY3ljbGUuZ2F0ZVJlc3VsdHMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzdGF0dXMgPSBnYXRlLnBhc3NlZCA/IFwi4pyFIFBBU1NcIiA6IFwi4p2MIEZBSUxcIjtcbiAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKGAtICoqJHtnYXRlLmdhdGV9OioqICR7c3RhdHVzfSAtICR7Z2F0ZS5tZXNzYWdlfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGluZXMucHVzaChcIlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjeWNsZS5lcnJvcikge1xuICAgICAgICAgICAgbGluZXMucHVzaChcIiMjIEVycm9yc1wiKTtcbiAgICAgICAgICAgIGxpbmVzLnB1c2goXCJcIik7XG4gICAgICAgICAgICBsaW5lcy5wdXNoKGN5Y2xlLmVycm9yKTtcbiAgICAgICAgICAgIGxpbmVzLnB1c2goXCJcIik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbGluZXMuam9pbihcIlxcblwiKTtcbiAgICB9XG5cbiAgICAvKiogR2V0IGl0ZXJhdGlvbiBieSBudW1iZXIgKi9cbiAgICBnZXRJdGVyYXRpb24oY3ljbGVOdW1iZXI6IG51bWJlcik6IEN5Y2xlU3RhdGUgfCBudWxsIHtcbiAgICAgICAgY29uc3QgY3ljbGVQYXRoID0gdGhpcy5wYXRoKGBpdGVyYXRpb25zLyR7Y3ljbGVOdW1iZXJ9Lmpzb25gKTtcbiAgICAgICAgaWYgKCFleGlzdHNTeW5jKGN5Y2xlUGF0aCkpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSByZWFkRmlsZVN5bmMoY3ljbGVQYXRoLCBcInV0Zi04XCIpO1xuICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoY29udGVudCkgYXMgQ3ljbGVTdGF0ZTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBHZXQgYWxsIGl0ZXJhdGlvbnMgKi9cbiAgICBnZXRBbGxJdGVyYXRpb25zKCk6IEN5Y2xlU3RhdGVbXSB7XG4gICAgICAgIGNvbnN0IGl0ZXJhdGlvbnM6IEN5Y2xlU3RhdGVbXSA9IFtdO1xuICAgICAgICBsZXQgbiA9IDE7XG5cbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgIGNvbnN0IGN5Y2xlID0gdGhpcy5nZXRJdGVyYXRpb24obik7XG4gICAgICAgICAgICBpZiAoIWN5Y2xlKSBicmVhaztcbiAgICAgICAgICAgIGl0ZXJhdGlvbnMucHVzaChjeWNsZSk7XG4gICAgICAgICAgICBuKys7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaXRlcmF0aW9ucztcbiAgICB9XG5cbiAgICAvKiogVXBkYXRlIHN0YXRlIHN0YXR1cyAqL1xuICAgIHVwZGF0ZVN0YXR1cyhcbiAgICAgICAgc3RhdHVzOiBSdW5TdGF0dXMsXG4gICAgICAgIHN0b3BSZWFzb24/OiBTdG9wUmVhc29uLFxuICAgICAgICBlcnJvcj86IHN0cmluZyxcbiAgICApOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgc3RhdGUgPSB0aGlzLmxvYWQoKTtcbiAgICAgICAgaWYgKCFzdGF0ZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gZmxvdyBzdGF0ZSB0byB1cGRhdGVcIik7XG4gICAgICAgIH1cblxuICAgICAgICBzdGF0ZS5zdGF0dXMgPSBzdGF0dXM7XG4gICAgICAgIGlmIChzdG9wUmVhc29uKSBzdGF0ZS5zdG9wUmVhc29uID0gc3RvcFJlYXNvbjtcbiAgICAgICAgaWYgKGVycm9yKSBzdGF0ZS5lcnJvciA9IGVycm9yO1xuICAgICAgICBpZiAoc3RhdHVzID09PSBSdW5TdGF0dXMuQ09NUExFVEVEIHx8IHN0YXR1cyA9PT0gUnVuU3RhdHVzLkZBSUxFRCkge1xuICAgICAgICAgICAgc3RhdGUuY29tcGxldGVkQXQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNhdmVTdGF0ZShzdGF0ZSk7XG4gICAgfVxuXG4gICAgLyoqIEluY3JlbWVudCBjeWNsZSBjb3VudGVyICovXG4gICAgaW5jcmVtZW50Q3ljbGUoKTogbnVtYmVyIHtcbiAgICAgICAgY29uc3Qgc3RhdGUgPSB0aGlzLmxvYWQoKTtcbiAgICAgICAgaWYgKCFzdGF0ZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gZmxvdyBzdGF0ZSB0byB1cGRhdGVcIik7XG4gICAgICAgIH1cblxuICAgICAgICBzdGF0ZS5jdXJyZW50Q3ljbGUrKztcbiAgICAgICAgdGhpcy5zYXZlU3RhdGUoc3RhdGUpO1xuICAgICAgICByZXR1cm4gc3RhdGUuY3VycmVudEN5Y2xlO1xuICAgIH1cblxuICAgIC8qKiBSZWNvcmQgYSBmYWlsZWQgY3ljbGUgKi9cbiAgICByZWNvcmRGYWlsZWRDeWNsZShjeWNsZTogQ3ljbGVTdGF0ZSk6IHZvaWQge1xuICAgICAgICBjb25zdCBzdGF0ZSA9IHRoaXMubG9hZCgpO1xuICAgICAgICBpZiAoIXN0YXRlKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBmbG93IHN0YXRlIHRvIHVwZGF0ZVwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0YXRlLmZhaWxlZEN5Y2xlcysrO1xuICAgICAgICBzdGF0ZS5zdHVja0NvdW50Kys7XG4gICAgICAgIHRoaXMuc2F2ZUl0ZXJhdGlvbihjeWNsZSk7XG4gICAgICAgIHRoaXMuc2F2ZVN0YXRlKHN0YXRlKTtcblxuICAgICAgICBsb2cuaW5mbyhcIkN5Y2xlIGZhaWxlZFwiLCB7XG4gICAgICAgICAgICBydW5JZDogdGhpcy5ydW5JZCxcbiAgICAgICAgICAgIGN5Y2xlOiBjeWNsZS5jeWNsZU51bWJlcixcbiAgICAgICAgICAgIGZhaWxlZEN5Y2xlczogc3RhdGUuZmFpbGVkQ3ljbGVzLFxuICAgICAgICAgICAgc3R1Y2tDb3VudDogc3RhdGUuc3R1Y2tDb3VudCxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqIFJlY29yZCBhIHN1Y2Nlc3NmdWwgY3ljbGUgKi9cbiAgICByZWNvcmRTdWNjZXNzZnVsQ3ljbGUoY3ljbGU6IEN5Y2xlU3RhdGUsIHN1bW1hcnk6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBjb25zdCBzdGF0ZSA9IHRoaXMubG9hZCgpO1xuICAgICAgICBpZiAoIXN0YXRlKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBmbG93IHN0YXRlIHRvIHVwZGF0ZVwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0YXRlLmNvbXBsZXRlZEN5Y2xlcysrO1xuICAgICAgICBzdGF0ZS5zdHVja0NvdW50ID0gMDsgLy8gUmVzZXQgc3R1Y2sgY291bnRlciBvbiBzdWNjZXNzXG4gICAgICAgIHN0YXRlLmxhc3RDaGVja3BvaW50ID0ge1xuICAgICAgICAgICAgY3ljbGVOdW1iZXI6IGN5Y2xlLmN5Y2xlTnVtYmVyLFxuICAgICAgICAgICAgc3VtbWFyeSxcbiAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuc2F2ZUl0ZXJhdGlvbihjeWNsZSk7XG4gICAgICAgIHRoaXMuc2F2ZVN0YXRlKHN0YXRlKTtcblxuICAgICAgICBsb2cuaW5mbyhcIkN5Y2xlIGNvbXBsZXRlZFwiLCB7XG4gICAgICAgICAgICBydW5JZDogdGhpcy5ydW5JZCxcbiAgICAgICAgICAgIGN5Y2xlOiBjeWNsZS5jeWNsZU51bWJlcixcbiAgICAgICAgICAgIGNvbXBsZXRlZEN5Y2xlczogc3RhdGUuY29tcGxldGVkQ3ljbGVzLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKiogQ2xlYW4gdXAgZmxvdyBkaXJlY3RvcnkgKi9cbiAgICBjbGVhbnVwKCk6IHZvaWQge1xuICAgICAgICAvLyBJbXBsZW1lbnRhdGlvbiB3b3VsZCByZW1vdmUgdGhlIC5mbG93IGRpcmVjdG9yeVxuICAgICAgICAvLyBGb3Igbm93LCBqdXN0IGxvZ1xuICAgICAgICBsb2cuaW5mbyhcIkZsb3cgc3RvcmUgY2xlYW51cCByZXF1ZXN0ZWRcIiwgeyBydW5JZDogdGhpcy5ydW5JZCB9KTtcbiAgICB9XG59XG4iLAogICAgIi8qKlxuICogRmxvdyBTdGF0ZSBUeXBlcyBmb3IgUmFscGggTG9vcCBSdW5uZXJcbiAqXG4gKiBTdGF0ZSBpcyBwZXJzaXN0ZWQgdG8gYC5haS1lbmcvcnVucy88cnVuSWQ+Ly5mbG93L2AgZm9yOlxuICogLSBSZXN1bWUgc3VwcG9ydCBhY3Jvc3MgcnVuc1xuICogLSBGcmVzaCBjb250ZXh0IHBlciBpdGVyYXRpb24gKHJlLWFuY2hvcmluZyBmcm9tIGRpc2spXG4gKiAtIEF1ZGl0IHRyYWlsIG9mIGFsbCBjeWNsZSBvdXRwdXRzXG4gKi9cblxuLyoqIFNjaGVtYSB2ZXJzaW9uIGZvciBmb3J3YXJkIGNvbXBhdGliaWxpdHkgKi9cbmV4cG9ydCBjb25zdCBGTE9XX1NDSEVNQV9WRVJTSU9OID0gXCIxLjAuMFwiO1xuXG4vKiogUnVuIHN0YXR1cyBlbnVtICovXG5leHBvcnQgZW51bSBSdW5TdGF0dXMge1xuICAgIFBFTkRJTkcgPSBcInBlbmRpbmdcIixcbiAgICBSVU5OSU5HID0gXCJydW5uaW5nXCIsXG4gICAgQ09NUExFVEVEID0gXCJjb21wbGV0ZWRcIixcbiAgICBGQUlMRUQgPSBcImZhaWxlZFwiLFxuICAgIEFCT1JURUQgPSBcImFib3J0ZWRcIixcbiAgICBTVFVDSyA9IFwic3R1Y2tcIixcbn1cblxuLyoqIFN0b3AgcmVhc29uIGZvciBjb21wbGV0ZWQgcnVucyAqL1xuZXhwb3J0IGVudW0gU3RvcFJlYXNvbiB7XG4gICAgQ09NUExFVElPTl9QUk9NSVNFID0gXCJjb21wbGV0aW9uX3Byb21pc2VcIixcbiAgICBNQVhfQ1lDTEVTID0gXCJtYXhfY3ljbGVzXCIsXG4gICAgR0FURV9GQUlMVVJFID0gXCJnYXRlX2ZhaWx1cmVcIixcbiAgICBTVFVDSyA9IFwic3R1Y2tcIixcbiAgICBVU0VSX0FCT1JUID0gXCJ1c2VyX2Fib3J0XCIsXG4gICAgRVJST1IgPSBcImVycm9yXCIsXG59XG5cbi8qKiBQaGFzZSBuYW1lcyBpbiB0aGUgd29ya2Zsb3cgKi9cbmV4cG9ydCBlbnVtIFBoYXNlIHtcbiAgICBSRVNFQVJDSCA9IFwicmVzZWFyY2hcIixcbiAgICBTUEVDSUZZID0gXCJzcGVjaWZ5XCIsXG4gICAgUExBTiA9IFwicGxhblwiLFxuICAgIFdPUksgPSBcIndvcmtcIixcbiAgICBSRVZJRVcgPSBcInJldmlld1wiLFxufVxuXG4vKiogR2F0ZSByZXN1bHQgdHlwZSAqL1xuZXhwb3J0IGludGVyZmFjZSBHYXRlUmVzdWx0IHtcbiAgICBnYXRlOiBzdHJpbmc7XG4gICAgcGFzc2VkOiBib29sZWFuO1xuICAgIG1lc3NhZ2U6IHN0cmluZztcbiAgICBkZXRhaWxzPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgdGltZXN0YW1wOiBzdHJpbmc7XG59XG5cbi8qKiBQaGFzZSBvdXRwdXQgKi9cbmV4cG9ydCBpbnRlcmZhY2UgUGhhc2VPdXRwdXQge1xuICAgIHBoYXNlOiBQaGFzZTtcbiAgICBwcm9tcHQ6IHN0cmluZztcbiAgICByZXNwb25zZTogc3RyaW5nO1xuICAgIHN1bW1hcnk6IHN0cmluZztcbiAgICB0aW1lc3RhbXA6IHN0cmluZztcbiAgICAvKiogVG9vbCBpbnZvY2F0aW9ucyBjYXB0dXJlZCBkdXJpbmcgdGhpcyBwaGFzZSAqL1xuICAgIHRvb2xzPzogVG9vbEludm9jYXRpb25bXTtcbn1cblxuLyoqIFRvb2wgaW52b2NhdGlvbiBjYXB0dXJlZCBmcm9tIE9wZW5Db2RlIHN0cmVhbSAqL1xuZXhwb3J0IGludGVyZmFjZSBUb29sSW52b2NhdGlvbiB7XG4gICAgLyoqIFVuaXF1ZSB0b29sIElEICovXG4gICAgaWQ6IHN0cmluZztcbiAgICAvKiogVG9vbCBuYW1lIChlLmcuLCBcImJhc2hcIiwgXCJyZWFkXCIsIFwid3JpdGVcIiwgXCJlZGl0XCIpICovXG4gICAgbmFtZTogc3RyaW5nO1xuICAgIC8qKiBJbnB1dCBhcmd1bWVudHMgKG1heSBiZSB0cnVuY2F0ZWQvcmVkYWN0ZWQgZm9yIHNlY3JldHMpICovXG4gICAgaW5wdXQ/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICAvKiogT3V0cHV0IHJlc3VsdCAobWF5IGJlIHRydW5jYXRlZCkgKi9cbiAgICBvdXRwdXQ/OiBzdHJpbmc7XG4gICAgLyoqIFdoZXRoZXIgdGhlIHRvb2wgY2FsbCBzdWNjZWVkZWQgKi9cbiAgICBzdGF0dXM6IFwib2tcIiB8IFwiZXJyb3JcIjtcbiAgICAvKiogRXJyb3IgbWVzc2FnZSBpZiBzdGF0dXMgaXMgZXJyb3IgKi9cbiAgICBlcnJvcj86IHN0cmluZztcbiAgICAvKiogV2hlbiB0aGUgdG9vbCBjYWxsIHN0YXJ0ZWQgKElTTyB0aW1lc3RhbXApICovXG4gICAgc3RhcnRlZEF0Pzogc3RyaW5nO1xuICAgIC8qKiBXaGVuIHRoZSB0b29sIGNhbGwgY29tcGxldGVkIChJU08gdGltZXN0YW1wKSAqL1xuICAgIGNvbXBsZXRlZEF0Pzogc3RyaW5nO1xufVxuXG4vKiogU2luZ2xlIGl0ZXJhdGlvbiBjeWNsZSBzdGF0ZSAqL1xuZXhwb3J0IGludGVyZmFjZSBDeWNsZVN0YXRlIHtcbiAgICBjeWNsZU51bWJlcjogbnVtYmVyO1xuICAgIHN0YXR1czogXCJwZW5kaW5nXCIgfCBcInJ1bm5pbmdcIiB8IFwiY29tcGxldGVkXCIgfCBcImZhaWxlZFwiO1xuICAgIHN0YXJ0VGltZTogc3RyaW5nO1xuICAgIGVuZFRpbWU/OiBzdHJpbmc7XG4gICAgZHVyYXRpb25Ncz86IG51bWJlcjtcbiAgICBwaGFzZXM6IHtcbiAgICAgICAgW2tleSBpbiBQaGFzZV0/OiBQaGFzZU91dHB1dDtcbiAgICB9O1xuICAgIGdhdGVSZXN1bHRzOiBHYXRlUmVzdWx0W107XG4gICAgY29tcGxldGlvblByb21pc2VPYnNlcnZlZDogYm9vbGVhbjtcbiAgICBzdG9wUmVhc29uPzogU3RvcFJlYXNvbjtcbiAgICBlcnJvcj86IHN0cmluZztcbiAgICAvLyBGb3Igc3R1Y2sgZGV0ZWN0aW9uIC0gaGFzaCBvZiBvdXRwdXRzIHRvIGRldGVjdCBuby1wcm9ncmVzc1xuICAgIG91dHB1dEhhc2g/OiBzdHJpbmc7XG59XG5cbi8qKiBNYWluIGZsb3cgc3RhdGUgKi9cbmV4cG9ydCBpbnRlcmZhY2UgRmxvd1N0YXRlIHtcbiAgICAvKiogU2NoZW1hIHZlcnNpb24gZm9yIG1pZ3JhdGlvbnMgKi9cbiAgICBzY2hlbWFWZXJzaW9uOiBzdHJpbmc7XG5cbiAgICAvKiogUnVuIGlkZW50aWZpY2F0aW9uICovXG4gICAgcnVuSWQ6IHN0cmluZztcbiAgICBwcm9tcHQ6IHN0cmluZztcblxuICAgIC8qKiBSdW4gc3RhdHVzICovXG4gICAgc3RhdHVzOiBSdW5TdGF0dXM7XG4gICAgc3RvcFJlYXNvbj86IFN0b3BSZWFzb247XG5cbiAgICAvKiogTG9vcCBwYXJhbWV0ZXJzICovXG4gICAgY29tcGxldGlvblByb21pc2U6IHN0cmluZztcbiAgICBtYXhDeWNsZXM6IG51bWJlcjtcbiAgICBzdHVja1RocmVzaG9sZDogbnVtYmVyO1xuICAgIGdhdGVzOiBzdHJpbmdbXTtcblxuICAgIC8qKiBDeWNsZSB0cmFja2luZyAqL1xuICAgIGN1cnJlbnRDeWNsZTogbnVtYmVyO1xuICAgIGNvbXBsZXRlZEN5Y2xlczogbnVtYmVyO1xuICAgIGZhaWxlZEN5Y2xlczogbnVtYmVyO1xuICAgIHN0dWNrQ291bnQ6IG51bWJlcjtcblxuICAgIC8qKiBUaW1lc3RhbXBzICovXG4gICAgY3JlYXRlZEF0OiBzdHJpbmc7XG4gICAgdXBkYXRlZEF0OiBzdHJpbmc7XG4gICAgY29tcGxldGVkQXQ/OiBzdHJpbmc7XG5cbiAgICAvKiogTGFzdCBzdWNjZXNzZnVsIGNoZWNrcG9pbnQgZm9yIHJlLWFuY2hvcmluZyAqL1xuICAgIGxhc3RDaGVja3BvaW50Pzoge1xuICAgICAgICBjeWNsZU51bWJlcjogbnVtYmVyO1xuICAgICAgICBzdW1tYXJ5OiBzdHJpbmc7XG4gICAgICAgIHRpbWVzdGFtcDogc3RyaW5nO1xuICAgIH07XG5cbiAgICAvKiogRXJyb3IgaW5mbyBpZiBmYWlsZWQgKi9cbiAgICBlcnJvcj86IHN0cmluZztcbn1cblxuLyoqIENoZWNrcG9pbnQgZm9yIGZhc3QgcmVzdW1lICovXG5leHBvcnQgaW50ZXJmYWNlIENoZWNrcG9pbnQge1xuICAgIHNjaGVtYVZlcnNpb246IHN0cmluZztcbiAgICBydW5JZDogc3RyaW5nO1xuICAgIGN5Y2xlTnVtYmVyOiBudW1iZXI7XG4gICAgdGltZXN0YW1wOiBzdHJpbmc7XG4gICAgc3RhdGU6IEZsb3dTdGF0ZTtcbiAgICBsYXN0UGhhc2VPdXRwdXRzOiB7XG4gICAgICAgIFtrZXkgaW4gUGhhc2VdPzogUGhhc2VPdXRwdXQ7XG4gICAgfTtcbn1cblxuLyoqIENvbmZpZ3VyYXRpb24gZm9yIHRoZSBsb29wIHJ1bm5lciAqL1xuZXhwb3J0IGludGVyZmFjZSBMb29wQ29uZmlnIHtcbiAgICBydW5JZDogc3RyaW5nO1xuICAgIHByb21wdDogc3RyaW5nO1xuICAgIGNvbXBsZXRpb25Qcm9taXNlOiBzdHJpbmc7XG4gICAgbWF4Q3ljbGVzOiBudW1iZXI7XG4gICAgc3R1Y2tUaHJlc2hvbGQ6IG51bWJlcjtcbiAgICBnYXRlczogc3RyaW5nW107XG4gICAgY2hlY2twb2ludEZyZXF1ZW5jeTogbnVtYmVyO1xuICAgIGZsb3dEaXI6IHN0cmluZztcbiAgICBkcnlSdW46IGJvb2xlYW47XG4gICAgLyoqIE51bWJlciBvZiByZXRyeSBhdHRlbXB0cyBwZXIgY3ljbGUgb24gZmFpbHVyZSAqL1xuICAgIGN5Y2xlUmV0cmllczogbnVtYmVyO1xuICAgIC8qKiBPcGVuQ29kZSBwcm9tcHQgdGltZW91dCBpbiBtcyAodXNlZCBhcyBpZGxlIHRpbWVvdXQpICovXG4gICAgcHJvbXB0VGltZW91dD86IG51bWJlcjtcbiAgICAvKiogUGhhc2UgaGFyZCB0aW1lb3V0IGluIG1zIChydW5uZXItc2lkZSB3YXRjaGRvZykgKi9cbiAgICBwaGFzZVRpbWVvdXRNcz86IG51bWJlcjtcbiAgICAvKiogQ3ljbGUgaGFyZCB0aW1lb3V0IGluIG1zICovXG4gICAgY3ljbGVUaW1lb3V0TXM/OiBudW1iZXI7XG4gICAgLyoqIFJ1biBoYXJkIHRpbWVvdXQgaW4gbXMgKi9cbiAgICBydW5UaW1lb3V0TXM/OiBudW1iZXI7XG4gICAgLyoqIERlYnVnIG1vZGU6IHByaW50IHRvb2wgaW52b2NhdGlvbnMgdG8gY29uc29sZS9sb2dzICovXG4gICAgZGVidWdXb3JrOiBib29sZWFuO1xufVxuIgogIF0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFXQTtBQUNBO0FBQ0E7QUFDQSxpQkFBUzs7O0FDUFQ7O0FDTk8sSUFBTSxrQkFBa0IsR0FBRyxZQUFZLFlBQVkscUJBQXFCLG1CQUFtQixzQkFBc0IscUJBQXFCLGtCQUFrQixZQUFZLFFBQVEsY0FBYztBQUFBLEVBQzdMLElBQUk7QUFBQSxFQUNKLE1BQU0sUUFBUSxlQUFlLENBQUMsT0FBTyxJQUFJLFFBQVEsQ0FBQyxZQUFZLFdBQVcsU0FBUyxFQUFFLENBQUM7QUFBQSxFQUNyRixNQUFNLGVBQWUsZ0JBQWdCLEdBQUc7QUFBQSxJQUNwQyxJQUFJLGFBQWEsd0JBQXdCO0FBQUEsSUFDekMsSUFBSSxVQUFVO0FBQUEsSUFDZCxNQUFNLFNBQVMsUUFBUSxVQUFVLElBQUksZ0JBQWdCLEVBQUU7QUFBQSxJQUN2RCxPQUFPLE1BQU07QUFBQSxNQUNULElBQUksT0FBTztBQUFBLFFBQ1A7QUFBQSxNQUNKO0FBQUEsTUFDQSxNQUFNLFVBQVUsUUFBUSxtQkFBbUIsVUFDckMsUUFBUSxVQUNSLElBQUksUUFBUSxRQUFRLE9BQU87QUFBQSxNQUNqQyxJQUFJLGdCQUFnQixXQUFXO0FBQUEsUUFDM0IsUUFBUSxJQUFJLGlCQUFpQixXQUFXO0FBQUEsTUFDNUM7QUFBQSxNQUNBLElBQUk7QUFBQSxRQUNBLE1BQU0sV0FBVyxNQUFNLE1BQU0sS0FBSyxLQUFLLFNBQVMsU0FBUyxPQUFPLENBQUM7QUFBQSxRQUNqRSxJQUFJLENBQUMsU0FBUztBQUFBLFVBQ1YsTUFBTSxJQUFJLE1BQU0sZUFBZSxTQUFTLFVBQVUsU0FBUyxZQUFZO0FBQUEsUUFDM0UsSUFBSSxDQUFDLFNBQVM7QUFBQSxVQUNWLE1BQU0sSUFBSSxNQUFNLHlCQUF5QjtBQUFBLFFBQzdDLE1BQU0sU0FBUyxTQUFTLEtBQUssWUFBWSxJQUFJLGlCQUFtQixFQUFFLFVBQVU7QUFBQSxRQUM1RSxJQUFJLFNBQVM7QUFBQSxRQUNiLE1BQU0sZUFBZSxNQUFNO0FBQUEsVUFDdkIsSUFBSTtBQUFBLFlBQ0EsT0FBTyxPQUFPO0FBQUEsWUFFbEIsTUFBTTtBQUFBO0FBQUEsUUFJVixPQUFPLGlCQUFpQixTQUFTLFlBQVk7QUFBQSxRQUM3QyxJQUFJO0FBQUEsVUFDQSxPQUFPLE1BQU07QUFBQSxZQUNULFFBQVEsTUFBTSxVQUFVLE1BQU0sT0FBTyxLQUFLO0FBQUEsWUFDMUMsSUFBSTtBQUFBLGNBQ0E7QUFBQSxZQUNKLFVBQVU7QUFBQSxZQUNWLE1BQU0sU0FBUyxPQUFPLE1BQU07QUFBQTtBQUFBLENBQU07QUFBQSxZQUNsQyxTQUFTLE9BQU8sSUFBSSxLQUFLO0FBQUEsWUFDekIsV0FBVyxTQUFTLFFBQVE7QUFBQSxjQUN4QixNQUFNLFFBQVEsTUFBTSxNQUFNO0FBQUEsQ0FBSTtBQUFBLGNBQzlCLE1BQU0sWUFBWSxDQUFDO0FBQUEsY0FDbkIsSUFBSTtBQUFBLGNBQ0osV0FBVyxRQUFRLE9BQU87QUFBQSxnQkFDdEIsSUFBSSxLQUFLLFdBQVcsT0FBTyxHQUFHO0FBQUEsa0JBQzFCLFVBQVUsS0FBSyxLQUFLLFFBQVEsYUFBYSxFQUFFLENBQUM7QUFBQSxnQkFDaEQsRUFDSyxTQUFJLEtBQUssV0FBVyxRQUFRLEdBQUc7QUFBQSxrQkFDaEMsWUFBWSxLQUFLLFFBQVEsY0FBYyxFQUFFO0FBQUEsZ0JBQzdDLEVBQ0ssU0FBSSxLQUFLLFdBQVcsS0FBSyxHQUFHO0FBQUEsa0JBQzdCLGNBQWMsS0FBSyxRQUFRLFdBQVcsRUFBRTtBQUFBLGdCQUM1QyxFQUNLLFNBQUksS0FBSyxXQUFXLFFBQVEsR0FBRztBQUFBLGtCQUNoQyxNQUFNLFNBQVMsT0FBTyxTQUFTLEtBQUssUUFBUSxjQUFjLEVBQUUsR0FBRyxFQUFFO0FBQUEsa0JBQ2pFLElBQUksQ0FBQyxPQUFPLE1BQU0sTUFBTSxHQUFHO0FBQUEsb0JBQ3ZCLGFBQWE7QUFBQSxrQkFDakI7QUFBQSxnQkFDSjtBQUFBLGNBQ0o7QUFBQSxjQUNBLElBQUk7QUFBQSxjQUNKLElBQUksYUFBYTtBQUFBLGNBQ2pCLElBQUksVUFBVSxRQUFRO0FBQUEsZ0JBQ2xCLE1BQU0sVUFBVSxVQUFVLEtBQUs7QUFBQSxDQUFJO0FBQUEsZ0JBQ25DLElBQUk7QUFBQSxrQkFDQSxPQUFPLEtBQUssTUFBTSxPQUFPO0FBQUEsa0JBQ3pCLGFBQWE7QUFBQSxrQkFFakIsTUFBTTtBQUFBLGtCQUNGLE9BQU87QUFBQTtBQUFBLGNBRWY7QUFBQSxjQUNBLElBQUksWUFBWTtBQUFBLGdCQUNaLElBQUksbUJBQW1CO0FBQUEsa0JBQ25CLE1BQU0sa0JBQWtCLElBQUk7QUFBQSxnQkFDaEM7QUFBQSxnQkFDQSxJQUFJLHFCQUFxQjtBQUFBLGtCQUNyQixPQUFPLE1BQU0sb0JBQW9CLElBQUk7QUFBQSxnQkFDekM7QUFBQSxjQUNKO0FBQUEsY0FDQSxhQUFhO0FBQUEsZ0JBQ1Q7QUFBQSxnQkFDQSxPQUFPO0FBQUEsZ0JBQ1AsSUFBSTtBQUFBLGdCQUNKLE9BQU87QUFBQSxjQUNYLENBQUM7QUFBQSxjQUNELElBQUksVUFBVSxRQUFRO0FBQUEsZ0JBQ2xCLE1BQU07QUFBQSxjQUNWO0FBQUEsWUFDSjtBQUFBLFVBQ0o7QUFBQSxrQkFFSjtBQUFBLFVBQ0ksT0FBTyxvQkFBb0IsU0FBUyxZQUFZO0FBQUEsVUFDaEQsT0FBTyxZQUFZO0FBQUE7QUFBQSxRQUV2QjtBQUFBLFFBRUosT0FBTyxPQUFPO0FBQUEsUUFFVixhQUFhLEtBQUs7QUFBQSxRQUNsQixJQUFJLHdCQUF3QixhQUFhLFdBQVcscUJBQXFCO0FBQUEsVUFDckU7QUFBQSxRQUNKO0FBQUEsUUFFQSxNQUFNLFVBQVUsS0FBSyxJQUFJLGFBQWEsTUFBTSxVQUFVLElBQUksb0JBQW9CLEtBQUs7QUFBQSxRQUNuRixNQUFNLE1BQU0sT0FBTztBQUFBO0FBQUEsSUFFM0I7QUFBQTtBQUFBLEVBRUosTUFBTSxTQUFTLGFBQWE7QUFBQSxFQUM1QixPQUFPLEVBQUUsT0FBTztBQUFBOzs7QUNsSGIsSUFBTSxlQUFlLE9BQU8sTUFBTSxhQUFhO0FBQUEsRUFDbEQsTUFBTSxRQUFRLE9BQU8sYUFBYSxhQUFhLE1BQU0sU0FBUyxJQUFJLElBQUk7QUFBQSxFQUN0RSxJQUFJLENBQUMsT0FBTztBQUFBLElBQ1I7QUFBQSxFQUNKO0FBQUEsRUFDQSxJQUFJLEtBQUssV0FBVyxVQUFVO0FBQUEsSUFDMUIsT0FBTyxVQUFVO0FBQUEsRUFDckI7QUFBQSxFQUNBLElBQUksS0FBSyxXQUFXLFNBQVM7QUFBQSxJQUN6QixPQUFPLFNBQVMsS0FBSyxLQUFLO0FBQUEsRUFDOUI7QUFBQSxFQUNBLE9BQU87QUFBQTs7O0FDeUJKLElBQU0scUJBQXFCO0FBQUEsRUFDOUIsZ0JBQWdCLENBQUMsU0FBUyxLQUFLLFVBQVUsTUFBTSxDQUFDLE1BQU0sVUFBVyxPQUFPLFVBQVUsV0FBVyxNQUFNLFNBQVMsSUFBSSxLQUFNO0FBQzFIOzs7QUN0Q08sSUFBTSx3QkFBd0IsQ0FBQyxVQUFVO0FBQUEsRUFDNUMsUUFBUTtBQUFBLFNBQ0M7QUFBQSxNQUNELE9BQU87QUFBQSxTQUNOO0FBQUEsTUFDRCxPQUFPO0FBQUEsU0FDTjtBQUFBLE1BQ0QsT0FBTztBQUFBO0FBQUEsTUFFUCxPQUFPO0FBQUE7QUFBQTtBQUdaLElBQU0sMEJBQTBCLENBQUMsVUFBVTtBQUFBLEVBQzlDLFFBQVE7QUFBQSxTQUNDO0FBQUEsTUFDRCxPQUFPO0FBQUEsU0FDTjtBQUFBLE1BQ0QsT0FBTztBQUFBLFNBQ047QUFBQSxNQUNELE9BQU87QUFBQTtBQUFBLE1BRVAsT0FBTztBQUFBO0FBQUE7QUFHWixJQUFNLHlCQUF5QixDQUFDLFVBQVU7QUFBQSxFQUM3QyxRQUFRO0FBQUEsU0FDQztBQUFBLE1BQ0QsT0FBTztBQUFBLFNBQ047QUFBQSxNQUNELE9BQU87QUFBQSxTQUNOO0FBQUEsTUFDRCxPQUFPO0FBQUE7QUFBQSxNQUVQLE9BQU87QUFBQTtBQUFBO0FBR1osSUFBTSxzQkFBc0IsR0FBRyxlQUFlLFNBQVMsTUFBTSxPQUFPLFlBQWE7QUFBQSxFQUNwRixJQUFJLENBQUMsU0FBUztBQUFBLElBQ1YsTUFBTSxpQkFBZ0IsZ0JBQWdCLFFBQVEsTUFBTSxJQUFJLENBQUMsTUFBTSxtQkFBbUIsQ0FBQyxDQUFDLEdBQUcsS0FBSyx3QkFBd0IsS0FBSyxDQUFDO0FBQUEsSUFDMUgsUUFBUTtBQUFBLFdBQ0M7QUFBQSxRQUNELE9BQU8sSUFBSTtBQUFBLFdBQ1Y7QUFBQSxRQUNELE9BQU8sSUFBSSxRQUFRO0FBQUEsV0FDbEI7QUFBQSxRQUNELE9BQU87QUFBQTtBQUFBLFFBRVAsT0FBTyxHQUFHLFFBQVE7QUFBQTtBQUFBLEVBRTlCO0FBQUEsRUFDQSxNQUFNLFlBQVksc0JBQXNCLEtBQUs7QUFBQSxFQUM3QyxNQUFNLGVBQWUsTUFDaEIsSUFBSSxDQUFDLE1BQU07QUFBQSxJQUNaLElBQUksVUFBVSxXQUFXLFVBQVUsVUFBVTtBQUFBLE1BQ3pDLE9BQU8sZ0JBQWdCLElBQUksbUJBQW1CLENBQUM7QUFBQSxJQUNuRDtBQUFBLElBQ0EsT0FBTyx3QkFBd0I7QUFBQSxNQUMzQjtBQUFBLE1BQ0E7QUFBQSxNQUNBLE9BQU87QUFBQSxJQUNYLENBQUM7QUFBQSxHQUNKLEVBQ0ksS0FBSyxTQUFTO0FBQUEsRUFDbkIsT0FBTyxVQUFVLFdBQVcsVUFBVSxXQUFXLFlBQVksZUFBZTtBQUFBO0FBRXpFLElBQU0sMEJBQTBCLEdBQUcsZUFBZSxNQUFNLFlBQVk7QUFBQSxFQUN2RSxJQUFJLFVBQVUsYUFBYSxVQUFVLE1BQU07QUFBQSxJQUN2QyxPQUFPO0FBQUEsRUFDWDtBQUFBLEVBQ0EsSUFBSSxPQUFPLFVBQVUsVUFBVTtBQUFBLElBQzNCLE1BQU0sSUFBSSxNQUFNLHNHQUFxRztBQUFBLEVBQ3pIO0FBQUEsRUFDQSxPQUFPLEdBQUcsUUFBUSxnQkFBZ0IsUUFBUSxtQkFBbUIsS0FBSztBQUFBO0FBRS9ELElBQU0sdUJBQXVCLEdBQUcsZUFBZSxTQUFTLE1BQU0sT0FBTyxPQUFPLGdCQUFpQjtBQUFBLEVBQ2hHLElBQUksaUJBQWlCLE1BQU07QUFBQSxJQUN2QixPQUFPLFlBQVksTUFBTSxZQUFZLElBQUksR0FBRyxRQUFRLE1BQU0sWUFBWTtBQUFBLEVBQzFFO0FBQUEsRUFDQSxJQUFJLFVBQVUsZ0JBQWdCLENBQUMsU0FBUztBQUFBLElBQ3BDLElBQUksU0FBUyxDQUFDO0FBQUEsSUFDZCxPQUFPLFFBQVEsS0FBSyxFQUFFLFFBQVEsRUFBRSxLQUFLLE9BQU87QUFBQSxNQUN4QyxTQUFTLENBQUMsR0FBRyxRQUFRLEtBQUssZ0JBQWdCLElBQUksbUJBQW1CLENBQUMsQ0FBQztBQUFBLEtBQ3RFO0FBQUEsSUFDRCxNQUFNLGdCQUFlLE9BQU8sS0FBSyxHQUFHO0FBQUEsSUFDcEMsUUFBUTtBQUFBLFdBQ0M7QUFBQSxRQUNELE9BQU8sR0FBRyxRQUFRO0FBQUEsV0FDakI7QUFBQSxRQUNELE9BQU8sSUFBSTtBQUFBLFdBQ1Y7QUFBQSxRQUNELE9BQU8sSUFBSSxRQUFRO0FBQUE7QUFBQSxRQUVuQixPQUFPO0FBQUE7QUFBQSxFQUVuQjtBQUFBLEVBQ0EsTUFBTSxZQUFZLHVCQUF1QixLQUFLO0FBQUEsRUFDOUMsTUFBTSxlQUFlLE9BQU8sUUFBUSxLQUFLLEVBQ3BDLElBQUksRUFBRSxLQUFLLE9BQU8sd0JBQXdCO0FBQUEsSUFDM0M7QUFBQSxJQUNBLE1BQU0sVUFBVSxlQUFlLEdBQUcsUUFBUSxTQUFTO0FBQUEsSUFDbkQsT0FBTztBQUFBLEVBQ1gsQ0FBQyxDQUFDLEVBQ0csS0FBSyxTQUFTO0FBQUEsRUFDbkIsT0FBTyxVQUFVLFdBQVcsVUFBVSxXQUFXLFlBQVksZUFBZTtBQUFBOzs7QUN0R3pFLElBQU0sZ0JBQWdCO0FBQ3RCLElBQU0sd0JBQXdCLEdBQUcsTUFBTSxLQUFLLFdBQVc7QUFBQSxFQUMxRCxJQUFJLE1BQU07QUFBQSxFQUNWLE1BQU0sVUFBVSxLQUFLLE1BQU0sYUFBYTtBQUFBLEVBQ3hDLElBQUksU0FBUztBQUFBLElBQ1QsV0FBVyxTQUFTLFNBQVM7QUFBQSxNQUN6QixJQUFJLFVBQVU7QUFBQSxNQUNkLElBQUksT0FBTyxNQUFNLFVBQVUsR0FBRyxNQUFNLFNBQVMsQ0FBQztBQUFBLE1BQzlDLElBQUksUUFBUTtBQUFBLE1BQ1osSUFBSSxLQUFLLFNBQVMsR0FBRyxHQUFHO0FBQUEsUUFDcEIsVUFBVTtBQUFBLFFBQ1YsT0FBTyxLQUFLLFVBQVUsR0FBRyxLQUFLLFNBQVMsQ0FBQztBQUFBLE1BQzVDO0FBQUEsTUFDQSxJQUFJLEtBQUssV0FBVyxHQUFHLEdBQUc7QUFBQSxRQUN0QixPQUFPLEtBQUssVUFBVSxDQUFDO0FBQUEsUUFDdkIsUUFBUTtBQUFBLE1BQ1osRUFDSyxTQUFJLEtBQUssV0FBVyxHQUFHLEdBQUc7QUFBQSxRQUMzQixPQUFPLEtBQUssVUFBVSxDQUFDO0FBQUEsUUFDdkIsUUFBUTtBQUFBLE1BQ1o7QUFBQSxNQUNBLE1BQU0sUUFBUSxLQUFLO0FBQUEsTUFDbkIsSUFBSSxVQUFVLGFBQWEsVUFBVSxNQUFNO0FBQUEsUUFDdkM7QUFBQSxNQUNKO0FBQUEsTUFDQSxJQUFJLE1BQU0sUUFBUSxLQUFLLEdBQUc7QUFBQSxRQUN0QixNQUFNLElBQUksUUFBUSxPQUFPLG9CQUFvQixFQUFFLFNBQVMsTUFBTSxPQUFPLE1BQU0sQ0FBQyxDQUFDO0FBQUEsUUFDN0U7QUFBQSxNQUNKO0FBQUEsTUFDQSxJQUFJLE9BQU8sVUFBVSxVQUFVO0FBQUEsUUFDM0IsTUFBTSxJQUFJLFFBQVEsT0FBTyxxQkFBcUI7QUFBQSxVQUMxQztBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0EsV0FBVztBQUFBLFFBQ2YsQ0FBQyxDQUFDO0FBQUEsUUFDRjtBQUFBLE1BQ0o7QUFBQSxNQUNBLElBQUksVUFBVSxVQUFVO0FBQUEsUUFDcEIsTUFBTSxJQUFJLFFBQVEsT0FBTyxJQUFJLHdCQUF3QjtBQUFBLFVBQ2pEO0FBQUEsVUFDQTtBQUFBLFFBQ0osQ0FBQyxHQUFHO0FBQUEsUUFDSjtBQUFBLE1BQ0o7QUFBQSxNQUNBLE1BQU0sZUFBZSxtQkFBbUIsVUFBVSxVQUFVLElBQUksVUFBVSxLQUFLO0FBQUEsTUFDL0UsTUFBTSxJQUFJLFFBQVEsT0FBTyxZQUFZO0FBQUEsSUFDekM7QUFBQSxFQUNKO0FBQUEsRUFDQSxPQUFPO0FBQUE7QUFFSixJQUFNLFNBQVMsR0FBRyxTQUFTLE1BQU0sT0FBTyxpQkFBaUIsS0FBSyxXQUFZO0FBQUEsRUFDN0UsTUFBTSxVQUFVLEtBQUssV0FBVyxHQUFHLElBQUksT0FBTyxJQUFJO0FBQUEsRUFDbEQsSUFBSSxPQUFPLFdBQVcsTUFBTTtBQUFBLEVBQzVCLElBQUksTUFBTTtBQUFBLElBQ04sTUFBTSxzQkFBc0IsRUFBRSxNQUFNLElBQUksQ0FBQztBQUFBLEVBQzdDO0FBQUEsRUFDQSxJQUFJLFNBQVMsUUFBUSxnQkFBZ0IsS0FBSyxJQUFJO0FBQUEsRUFDOUMsSUFBSSxPQUFPLFdBQVcsR0FBRyxHQUFHO0FBQUEsSUFDeEIsU0FBUyxPQUFPLFVBQVUsQ0FBQztBQUFBLEVBQy9CO0FBQUEsRUFDQSxJQUFJLFFBQVE7QUFBQSxJQUNSLE9BQU8sSUFBSTtBQUFBLEVBQ2Y7QUFBQSxFQUNBLE9BQU87QUFBQTs7O0FDOURKLElBQU0sd0JBQXdCLEdBQUcsZUFBZSxPQUFPLFdBQVcsQ0FBQyxNQUFNO0FBQUEsRUFDNUUsTUFBTSxrQkFBa0IsQ0FBQyxnQkFBZ0I7QUFBQSxJQUNyQyxNQUFNLFNBQVMsQ0FBQztBQUFBLElBQ2hCLElBQUksZUFBZSxPQUFPLGdCQUFnQixVQUFVO0FBQUEsTUFDaEQsV0FBVyxRQUFRLGFBQWE7QUFBQSxRQUM1QixNQUFNLFFBQVEsWUFBWTtBQUFBLFFBQzFCLElBQUksVUFBVSxhQUFhLFVBQVUsTUFBTTtBQUFBLFVBQ3ZDO0FBQUEsUUFDSjtBQUFBLFFBQ0EsSUFBSSxNQUFNLFFBQVEsS0FBSyxHQUFHO0FBQUEsVUFDdEIsTUFBTSxrQkFBa0Isb0JBQW9CO0FBQUEsWUFDeEM7QUFBQSxZQUNBLFNBQVM7QUFBQSxZQUNUO0FBQUEsWUFDQSxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxVQUNQLENBQUM7QUFBQSxVQUNELElBQUk7QUFBQSxZQUNBLE9BQU8sS0FBSyxlQUFlO0FBQUEsUUFDbkMsRUFDSyxTQUFJLE9BQU8sVUFBVSxVQUFVO0FBQUEsVUFDaEMsTUFBTSxtQkFBbUIscUJBQXFCO0FBQUEsWUFDMUM7QUFBQSxZQUNBLFNBQVM7QUFBQSxZQUNUO0FBQUEsWUFDQSxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxVQUNQLENBQUM7QUFBQSxVQUNELElBQUk7QUFBQSxZQUNBLE9BQU8sS0FBSyxnQkFBZ0I7QUFBQSxRQUNwQyxFQUNLO0FBQUEsVUFDRCxNQUFNLHNCQUFzQix3QkFBd0I7QUFBQSxZQUNoRDtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsVUFDSixDQUFDO0FBQUEsVUFDRCxJQUFJO0FBQUEsWUFDQSxPQUFPLEtBQUssbUJBQW1CO0FBQUE7QUFBQSxNQUUzQztBQUFBLElBQ0o7QUFBQSxJQUNBLE9BQU8sT0FBTyxLQUFLLEdBQUc7QUFBQTtBQUFBLEVBRTFCLE9BQU87QUFBQTtBQUtKLElBQU0sYUFBYSxDQUFDLGdCQUFnQjtBQUFBLEVBQ3ZDLElBQUksQ0FBQyxhQUFhO0FBQUEsSUFHZCxPQUFPO0FBQUEsRUFDWDtBQUFBLEVBQ0EsTUFBTSxlQUFlLFlBQVksTUFBTSxHQUFHLEVBQUUsSUFBSSxLQUFLO0FBQUEsRUFDckQsSUFBSSxDQUFDLGNBQWM7QUFBQSxJQUNmO0FBQUEsRUFDSjtBQUFBLEVBQ0EsSUFBSSxhQUFhLFdBQVcsa0JBQWtCLEtBQUssYUFBYSxTQUFTLE9BQU8sR0FBRztBQUFBLElBQy9FLE9BQU87QUFBQSxFQUNYO0FBQUEsRUFDQSxJQUFJLGlCQUFpQix1QkFBdUI7QUFBQSxJQUN4QyxPQUFPO0FBQUEsRUFDWDtBQUFBLEVBQ0EsSUFBSSxDQUFDLGdCQUFnQixVQUFVLFVBQVUsUUFBUSxFQUFFLEtBQUssQ0FBQyxTQUFTLGFBQWEsV0FBVyxJQUFJLENBQUMsR0FBRztBQUFBLElBQzlGLE9BQU87QUFBQSxFQUNYO0FBQUEsRUFDQSxJQUFJLGFBQWEsV0FBVyxPQUFPLEdBQUc7QUFBQSxJQUNsQyxPQUFPO0FBQUEsRUFDWDtBQUFBLEVBQ0E7QUFBQTtBQUVKLElBQU0sb0JBQW9CLENBQUMsU0FBUyxTQUFTO0FBQUEsRUFDekMsSUFBSSxDQUFDLE1BQU07QUFBQSxJQUNQLE9BQU87QUFBQSxFQUNYO0FBQUEsRUFDQSxJQUFJLFFBQVEsUUFBUSxJQUFJLElBQUksS0FBSyxRQUFRLFFBQVEsU0FBUyxRQUFRLFFBQVEsSUFBSSxRQUFRLEdBQUcsU0FBUyxHQUFHLE9BQU8sR0FBRztBQUFBLElBQzNHLE9BQU87QUFBQSxFQUNYO0FBQUEsRUFDQSxPQUFPO0FBQUE7QUFFSixJQUFNLGdCQUFnQixTQUFTLGFBQWEsY0FBYztBQUFBLEVBQzdELFdBQVcsUUFBUSxVQUFVO0FBQUEsSUFDekIsSUFBSSxrQkFBa0IsU0FBUyxLQUFLLElBQUksR0FBRztBQUFBLE1BQ3ZDO0FBQUEsSUFDSjtBQUFBLElBQ0EsTUFBTSxRQUFRLE1BQU0sYUFBYSxNQUFNLFFBQVEsSUFBSTtBQUFBLElBQ25ELElBQUksQ0FBQyxPQUFPO0FBQUEsTUFDUjtBQUFBLElBQ0o7QUFBQSxJQUNBLE1BQU0sT0FBTyxLQUFLLFFBQVE7QUFBQSxJQUMxQixRQUFRLEtBQUs7QUFBQSxXQUNKO0FBQUEsUUFDRCxJQUFJLENBQUMsUUFBUSxPQUFPO0FBQUEsVUFDaEIsUUFBUSxRQUFRLENBQUM7QUFBQSxRQUNyQjtBQUFBLFFBQ0EsUUFBUSxNQUFNLFFBQVE7QUFBQSxRQUN0QjtBQUFBLFdBQ0M7QUFBQSxRQUNELFFBQVEsUUFBUSxPQUFPLFVBQVUsR0FBRyxRQUFRLE9BQU87QUFBQSxRQUNuRDtBQUFBLFdBQ0M7QUFBQTtBQUFBLFFBRUQsUUFBUSxRQUFRLElBQUksTUFBTSxLQUFLO0FBQUEsUUFDL0I7QUFBQTtBQUFBLEVBRVo7QUFBQTtBQUVHLElBQU0sV0FBVyxDQUFDLFlBQVksT0FBTztBQUFBLEVBQ3hDLFNBQVMsUUFBUTtBQUFBLEVBQ2pCLE1BQU0sUUFBUTtBQUFBLEVBQ2QsT0FBTyxRQUFRO0FBQUEsRUFDZixpQkFBaUIsT0FBTyxRQUFRLG9CQUFvQixhQUM5QyxRQUFRLGtCQUNSLHNCQUFzQixRQUFRLGVBQWU7QUFBQSxFQUNuRCxLQUFLLFFBQVE7QUFDakIsQ0FBQztBQUNNLElBQU0sZUFBZSxDQUFDLEdBQUcsTUFBTTtBQUFBLEVBQ2xDLE1BQU0sU0FBUyxLQUFLLE1BQU0sRUFBRTtBQUFBLEVBQzVCLElBQUksT0FBTyxTQUFTLFNBQVMsR0FBRyxHQUFHO0FBQUEsSUFDL0IsT0FBTyxVQUFVLE9BQU8sUUFBUSxVQUFVLEdBQUcsT0FBTyxRQUFRLFNBQVMsQ0FBQztBQUFBLEVBQzFFO0FBQUEsRUFDQSxPQUFPLFVBQVUsYUFBYSxFQUFFLFNBQVMsRUFBRSxPQUFPO0FBQUEsRUFDbEQsT0FBTztBQUFBO0FBRUosSUFBTSxlQUFlLElBQUksWUFBWTtBQUFBLEVBQ3hDLE1BQU0sZ0JBQWdCLElBQUk7QUFBQSxFQUMxQixXQUFXLFVBQVUsU0FBUztBQUFBLElBQzFCLElBQUksQ0FBQyxVQUFVLE9BQU8sV0FBVyxVQUFVO0FBQUEsTUFDdkM7QUFBQSxJQUNKO0FBQUEsSUFDQSxNQUFNLFdBQVcsa0JBQWtCLFVBQVUsT0FBTyxRQUFRLElBQUksT0FBTyxRQUFRLE1BQU07QUFBQSxJQUNyRixZQUFZLEtBQUssVUFBVSxVQUFVO0FBQUEsTUFDakMsSUFBSSxVQUFVLE1BQU07QUFBQSxRQUNoQixjQUFjLE9BQU8sR0FBRztBQUFBLE1BQzVCLEVBQ0ssU0FBSSxNQUFNLFFBQVEsS0FBSyxHQUFHO0FBQUEsUUFDM0IsV0FBVyxLQUFLLE9BQU87QUFBQSxVQUNuQixjQUFjLE9BQU8sS0FBSyxDQUFDO0FBQUEsUUFDL0I7QUFBQSxNQUNKLEVBQ0ssU0FBSSxVQUFVLFdBQVc7QUFBQSxRQUcxQixjQUFjLElBQUksS0FBSyxPQUFPLFVBQVUsV0FBVyxLQUFLLFVBQVUsS0FBSyxJQUFJLEtBQUs7QUFBQSxNQUNwRjtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQUEsRUFDQSxPQUFPO0FBQUE7QUFBQTtBQUVYLE1BQU0sYUFBYTtBQUFBLEVBQ2Y7QUFBQSxFQUNBLFdBQVcsR0FBRztBQUFBLElBQ1YsS0FBSyxPQUFPLENBQUM7QUFBQTtBQUFBLEVBRWpCLEtBQUssR0FBRztBQUFBLElBQ0osS0FBSyxPQUFPLENBQUM7QUFBQTtBQUFBLEVBRWpCLG1CQUFtQixDQUFDLElBQUk7QUFBQSxJQUNwQixJQUFJLE9BQU8sT0FBTyxVQUFVO0FBQUEsTUFDeEIsT0FBTyxLQUFLLEtBQUssTUFBTSxLQUFLO0FBQUEsSUFDaEMsRUFDSztBQUFBLE1BQ0QsT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFO0FBQUE7QUFBQTtBQUFBLEVBR25DLE1BQU0sQ0FBQyxJQUFJO0FBQUEsSUFDUCxNQUFNLFFBQVEsS0FBSyxvQkFBb0IsRUFBRTtBQUFBLElBQ3pDLE9BQU8sQ0FBQyxDQUFDLEtBQUssS0FBSztBQUFBO0FBQUEsRUFFdkIsS0FBSyxDQUFDLElBQUk7QUFBQSxJQUNOLE1BQU0sUUFBUSxLQUFLLG9CQUFvQixFQUFFO0FBQUEsSUFDekMsSUFBSSxLQUFLLEtBQUssUUFBUTtBQUFBLE1BQ2xCLEtBQUssS0FBSyxTQUFTO0FBQUEsSUFDdkI7QUFBQTtBQUFBLEVBRUosTUFBTSxDQUFDLElBQUksSUFBSTtBQUFBLElBQ1gsTUFBTSxRQUFRLEtBQUssb0JBQW9CLEVBQUU7QUFBQSxJQUN6QyxJQUFJLEtBQUssS0FBSyxRQUFRO0FBQUEsTUFDbEIsS0FBSyxLQUFLLFNBQVM7QUFBQSxNQUNuQixPQUFPO0FBQUEsSUFDWCxFQUNLO0FBQUEsTUFDRCxPQUFPO0FBQUE7QUFBQTtBQUFBLEVBR2YsR0FBRyxDQUFDLElBQUk7QUFBQSxJQUNKLEtBQUssT0FBTyxDQUFDLEdBQUcsS0FBSyxNQUFNLEVBQUU7QUFBQSxJQUM3QixPQUFPLEtBQUssS0FBSyxTQUFTO0FBQUE7QUFFbEM7QUFFTyxJQUFNLHFCQUFxQixPQUFPO0FBQUEsRUFDckMsT0FBTyxJQUFJO0FBQUEsRUFDWCxTQUFTLElBQUk7QUFBQSxFQUNiLFVBQVUsSUFBSTtBQUNsQjtBQUNBLElBQU0seUJBQXlCLHNCQUFzQjtBQUFBLEVBQ2pELGVBQWU7QUFBQSxFQUNmLE9BQU87QUFBQSxJQUNILFNBQVM7QUFBQSxJQUNULE9BQU87QUFBQSxFQUNYO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDSixTQUFTO0FBQUEsSUFDVCxPQUFPO0FBQUEsRUFDWDtBQUNKLENBQUM7QUFDRCxJQUFNLGlCQUFpQjtBQUFBLEVBQ25CLGdCQUFnQjtBQUNwQjtBQUNPLElBQU0sZUFBZSxDQUFDLFdBQVcsQ0FBQyxPQUFPO0FBQUEsS0FDekM7QUFBQSxFQUNILFNBQVM7QUFBQSxFQUNULFNBQVM7QUFBQSxFQUNULGlCQUFpQjtBQUFBLEtBQ2Q7QUFDUDs7O0FDOU5PLElBQU0sZUFBZSxDQUFDLFNBQVMsQ0FBQyxNQUFNO0FBQUEsRUFDekMsSUFBSSxVQUFVLGFBQWEsYUFBYSxHQUFHLE1BQU07QUFBQSxFQUNqRCxNQUFNLFlBQVksT0FBTyxLQUFLLFFBQVE7QUFBQSxFQUN0QyxNQUFNLFlBQVksQ0FBQyxZQUFXO0FBQUEsSUFDMUIsVUFBVSxhQUFhLFNBQVMsT0FBTTtBQUFBLElBQ3RDLE9BQU8sVUFBVTtBQUFBO0FBQUEsRUFFckIsTUFBTSxlQUFlLG1CQUFtQjtBQUFBLEVBQ3hDLE1BQU0sZ0JBQWdCLE9BQU8sWUFBWTtBQUFBLElBQ3JDLE1BQU0sT0FBTztBQUFBLFNBQ047QUFBQSxTQUNBO0FBQUEsTUFDSCxPQUFPLFFBQVEsU0FBUyxRQUFRLFNBQVMsV0FBVztBQUFBLE1BQ3BELFNBQVMsYUFBYSxRQUFRLFNBQVMsUUFBUSxPQUFPO0FBQUEsTUFDdEQsZ0JBQWdCO0FBQUEsSUFDcEI7QUFBQSxJQUNBLElBQUksS0FBSyxVQUFVO0FBQUEsTUFDZixNQUFNLGNBQWM7QUFBQSxXQUNiO0FBQUEsUUFDSCxVQUFVLEtBQUs7QUFBQSxNQUNuQixDQUFDO0FBQUEsSUFDTDtBQUFBLElBQ0EsSUFBSSxLQUFLLGtCQUFrQjtBQUFBLE1BQ3ZCLE1BQU0sS0FBSyxpQkFBaUIsSUFBSTtBQUFBLElBQ3BDO0FBQUEsSUFDQSxJQUFJLEtBQUssUUFBUSxLQUFLLGdCQUFnQjtBQUFBLE1BQ2xDLEtBQUssaUJBQWlCLEtBQUssZUFBZSxLQUFLLElBQUk7QUFBQSxJQUN2RDtBQUFBLElBRUEsSUFBSSxLQUFLLG1CQUFtQixhQUFhLEtBQUssbUJBQW1CLElBQUk7QUFBQSxNQUNqRSxLQUFLLFFBQVEsT0FBTyxjQUFjO0FBQUEsSUFDdEM7QUFBQSxJQUNBLE1BQU0sTUFBTSxTQUFTLElBQUk7QUFBQSxJQUN6QixPQUFPLEVBQUUsTUFBTSxJQUFJO0FBQUE7QUFBQSxFQUV2QixNQUFNLFVBQVUsT0FBTyxZQUFZO0FBQUEsSUFFL0IsUUFBUSxNQUFNLFFBQVEsTUFBTSxjQUFjLE9BQU87QUFBQSxJQUNqRCxNQUFNLGNBQWM7QUFBQSxNQUNoQixVQUFVO0FBQUEsU0FDUDtBQUFBLE1BQ0gsTUFBTSxLQUFLO0FBQUEsSUFDZjtBQUFBLElBQ0EsSUFBSSxXQUFVLElBQUksUUFBUSxLQUFLLFdBQVc7QUFBQSxJQUMxQyxXQUFXLE1BQU0sYUFBYSxRQUFRLE1BQU07QUFBQSxNQUN4QyxJQUFJLElBQUk7QUFBQSxRQUNKLFdBQVUsTUFBTSxHQUFHLFVBQVMsSUFBSTtBQUFBLE1BQ3BDO0FBQUEsSUFDSjtBQUFBLElBR0EsTUFBTSxTQUFTLEtBQUs7QUFBQSxJQUNwQixJQUFJLFdBQVcsTUFBTSxPQUFPLFFBQU87QUFBQSxJQUNuQyxXQUFXLE1BQU0sYUFBYSxTQUFTLE1BQU07QUFBQSxNQUN6QyxJQUFJLElBQUk7QUFBQSxRQUNKLFdBQVcsTUFBTSxHQUFHLFVBQVUsVUFBUyxJQUFJO0FBQUEsTUFDL0M7QUFBQSxJQUNKO0FBQUEsSUFDQSxNQUFNLFNBQVM7QUFBQSxNQUNYO0FBQUEsTUFDQTtBQUFBLElBQ0o7QUFBQSxJQUNBLElBQUksU0FBUyxJQUFJO0FBQUEsTUFDYixJQUFJLFNBQVMsV0FBVyxPQUFPLFNBQVMsUUFBUSxJQUFJLGdCQUFnQixNQUFNLEtBQUs7QUFBQSxRQUMzRSxPQUFPLEtBQUssa0JBQWtCLFNBQ3hCLENBQUMsSUFDRDtBQUFBLFVBQ0UsTUFBTSxDQUFDO0FBQUEsYUFDSjtBQUFBLFFBQ1A7QUFBQSxNQUNSO0FBQUEsTUFDQSxNQUFNLFdBQVcsS0FBSyxZQUFZLFNBQVMsV0FBVyxTQUFTLFFBQVEsSUFBSSxjQUFjLENBQUMsSUFBSSxLQUFLLFlBQVk7QUFBQSxNQUMvRyxJQUFJO0FBQUEsTUFDSixRQUFRO0FBQUEsYUFDQztBQUFBLGFBQ0E7QUFBQSxhQUNBO0FBQUEsYUFDQTtBQUFBLGFBQ0E7QUFBQSxVQUNELE9BQU8sTUFBTSxTQUFTLFNBQVM7QUFBQSxVQUMvQjtBQUFBLGFBQ0M7QUFBQSxVQUNELE9BQU8sS0FBSyxrQkFBa0IsU0FDeEIsU0FBUyxPQUNUO0FBQUEsWUFDRSxNQUFNLFNBQVM7QUFBQSxlQUNaO0FBQUEsVUFDUDtBQUFBO0FBQUEsTUFFWixJQUFJLFlBQVksUUFBUTtBQUFBLFFBQ3BCLElBQUksS0FBSyxtQkFBbUI7QUFBQSxVQUN4QixNQUFNLEtBQUssa0JBQWtCLElBQUk7QUFBQSxRQUNyQztBQUFBLFFBQ0EsSUFBSSxLQUFLLHFCQUFxQjtBQUFBLFVBQzFCLE9BQU8sTUFBTSxLQUFLLG9CQUFvQixJQUFJO0FBQUEsUUFDOUM7QUFBQSxNQUNKO0FBQUEsTUFDQSxPQUFPLEtBQUssa0JBQWtCLFNBQ3hCLE9BQ0E7QUFBQSxRQUNFO0FBQUEsV0FDRztBQUFBLE1BQ1A7QUFBQSxJQUNSO0FBQUEsSUFDQSxNQUFNLFlBQVksTUFBTSxTQUFTLEtBQUs7QUFBQSxJQUN0QyxJQUFJO0FBQUEsSUFDSixJQUFJO0FBQUEsTUFDQSxZQUFZLEtBQUssTUFBTSxTQUFTO0FBQUEsTUFFcEMsTUFBTTtBQUFBLElBR04sTUFBTSxRQUFRLGFBQWE7QUFBQSxJQUMzQixJQUFJLGFBQWE7QUFBQSxJQUNqQixXQUFXLE1BQU0sYUFBYSxNQUFNLE1BQU07QUFBQSxNQUN0QyxJQUFJLElBQUk7QUFBQSxRQUNKLGFBQWMsTUFBTSxHQUFHLE9BQU8sVUFBVSxVQUFTLElBQUk7QUFBQSxNQUN6RDtBQUFBLElBQ0o7QUFBQSxJQUNBLGFBQWEsY0FBYyxDQUFDO0FBQUEsSUFDNUIsSUFBSSxLQUFLLGNBQWM7QUFBQSxNQUNuQixNQUFNO0FBQUEsSUFDVjtBQUFBLElBRUEsT0FBTyxLQUFLLGtCQUFrQixTQUN4QixZQUNBO0FBQUEsTUFDRSxPQUFPO0FBQUEsU0FDSjtBQUFBLElBQ1A7QUFBQTtBQUFBLEVBRVIsTUFBTSxhQUFhLENBQUMsV0FBVztBQUFBLElBQzNCLE1BQU0sS0FBSyxDQUFDLFlBQVksUUFBUSxLQUFLLFNBQVMsT0FBTyxDQUFDO0FBQUEsSUFDdEQsR0FBRyxNQUFNLE9BQU8sWUFBWTtBQUFBLE1BQ3hCLFFBQVEsTUFBTSxRQUFRLE1BQU0sY0FBYyxPQUFPO0FBQUEsTUFDakQsT0FBTyxnQkFBZ0I7QUFBQSxXQUNoQjtBQUFBLFFBQ0gsTUFBTSxLQUFLO0FBQUEsUUFDWCxTQUFTLEtBQUs7QUFBQSxRQUNkO0FBQUEsUUFDQTtBQUFBLE1BQ0osQ0FBQztBQUFBO0FBQUEsSUFFTCxPQUFPO0FBQUE7QUFBQSxFQUVYLE9BQU87QUFBQSxJQUNIO0FBQUEsSUFDQSxTQUFTLFdBQVcsU0FBUztBQUFBLElBQzdCLFFBQVEsV0FBVyxRQUFRO0FBQUEsSUFDM0IsS0FBSyxXQUFXLEtBQUs7QUFBQSxJQUNyQjtBQUFBLElBQ0EsTUFBTSxXQUFXLE1BQU07QUFBQSxJQUN2QjtBQUFBLElBQ0EsU0FBUyxXQUFXLFNBQVM7QUFBQSxJQUM3QixPQUFPLFdBQVcsT0FBTztBQUFBLElBQ3pCLE1BQU0sV0FBVyxNQUFNO0FBQUEsSUFDdkIsS0FBSyxXQUFXLEtBQUs7QUFBQSxJQUNyQjtBQUFBLElBQ0E7QUFBQSxJQUNBLE9BQU8sV0FBVyxPQUFPO0FBQUEsRUFDN0I7QUFBQTs7QUNsS0osSUFBTSxtQkFBbUI7QUFBQSxFQUNyQixRQUFRO0FBQUEsRUFDUixXQUFXO0FBQUEsRUFDWCxRQUFRO0FBQUEsRUFDUixTQUFTO0FBQ2I7QUFDQSxJQUFNLGdCQUFnQixPQUFPLFFBQVEsZ0JBQWdCOztBQ0w5QyxJQUFNLFNBQVMsYUFBYSxhQUFhO0FBQUEsRUFDNUMsU0FBUztBQUNiLENBQUMsQ0FBQzs7O0FDRkYsTUFBTSxjQUFjO0FBQUEsRUFDaEIsVUFBVTtBQUFBLEVBQ1YsV0FBVyxDQUFDLE1BQU07QUFBQSxJQUNkLElBQUksTUFBTSxRQUFRO0FBQUEsTUFDZCxLQUFLLFVBQVUsS0FBSztBQUFBLElBQ3hCO0FBQUE7QUFFUjtBQUFBO0FBQ0EsTUFBTSxlQUFlLGNBQWM7QUFBQSxFQUkvQixLQUFLLENBQUMsU0FBUztBQUFBLElBQ1gsUUFBUSxTQUFTLFVBQVUsS0FBSyxTQUFTLElBQUksSUFBSTtBQUFBLE1BQzdDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFFVDtBQUFBO0FBQ0EsTUFBTSxnQkFBZ0IsY0FBYztBQUFBLEVBSWhDLElBQUksQ0FBQyxTQUFTO0FBQUEsSUFDVixRQUFRLFNBQVMsVUFBVSxLQUFLLFNBQVMsSUFBSTtBQUFBLE1BQ3pDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFBQSxFQUtMLE9BQU8sQ0FBQyxTQUFTO0FBQUEsSUFDYixRQUFRLFNBQVMsVUFBVSxLQUFLLFNBQVMsSUFBSTtBQUFBLE1BQ3pDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFFVDtBQUFBO0FBQ0EsTUFBTSxZQUFZLGNBQWM7QUFBQSxFQUk1QixJQUFJLENBQUMsU0FBUztBQUFBLElBQ1YsUUFBUSxTQUFTLFVBQVUsS0FBSyxTQUFTLElBQUk7QUFBQSxNQUN6QyxLQUFLO0FBQUEsU0FDRjtBQUFBLElBQ1AsQ0FBQztBQUFBO0FBQUEsRUFLTCxNQUFNLENBQUMsU0FBUztBQUFBLElBQ1osUUFBUSxTQUFTLFVBQVUsS0FBSyxTQUFTLEtBQUs7QUFBQSxNQUMxQyxLQUFLO0FBQUEsU0FDRjtBQUFBLE1BQ0gsU0FBUztBQUFBLFFBQ0wsZ0JBQWdCO0FBQUEsV0FDYixTQUFTO0FBQUEsTUFDaEI7QUFBQSxJQUNKLENBQUM7QUFBQTtBQUFBLEVBS0wsTUFBTSxDQUFDLFNBQVM7QUFBQSxJQUNaLFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxPQUFPO0FBQUEsTUFDM0MsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUFBLEVBS0wsR0FBRyxDQUFDLFNBQVM7QUFBQSxJQUNULFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxJQUFJO0FBQUEsTUFDeEMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUFBLEVBS0wsTUFBTSxDQUFDLFNBQVM7QUFBQSxJQUNaLFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxJQUFJO0FBQUEsTUFDeEMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxNQUNILFNBQVM7QUFBQSxRQUNMLGdCQUFnQjtBQUFBLFdBQ2IsUUFBUTtBQUFBLE1BQ2Y7QUFBQSxJQUNKLENBQUM7QUFBQTtBQUFBLEVBS0wsT0FBTyxDQUFDLFNBQVM7QUFBQSxJQUNiLFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxJQUFJO0FBQUEsTUFDeEMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUVUO0FBQUE7QUFDQSxNQUFNLGVBQWUsY0FBYztBQUFBLEVBSS9CLEdBQUcsQ0FBQyxTQUFTO0FBQUEsSUFDVCxRQUFRLFNBQVMsVUFBVSxLQUFLLFNBQVMsSUFBSTtBQUFBLE1BQ3pDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFBQSxFQUtMLE1BQU0sQ0FBQyxTQUFTO0FBQUEsSUFDWixRQUFRLFNBQVMsVUFBVSxLQUFLLFNBQVMsTUFBTTtBQUFBLE1BQzNDLEtBQUs7QUFBQSxTQUNGO0FBQUEsTUFDSCxTQUFTO0FBQUEsUUFDTCxnQkFBZ0I7QUFBQSxXQUNiLFNBQVM7QUFBQSxNQUNoQjtBQUFBLElBQ0osQ0FBQztBQUFBO0FBQUEsRUFLTCxTQUFTLENBQUMsU0FBUztBQUFBLElBQ2YsUUFBUSxTQUFTLFVBQVUsS0FBSyxTQUFTLElBQUk7QUFBQSxNQUN6QyxLQUFLO0FBQUEsU0FDRjtBQUFBLElBQ1AsQ0FBQztBQUFBO0FBRVQ7QUFBQTtBQUNBLE1BQU0sYUFBYSxjQUFjO0FBQUEsRUFJN0IsR0FBRyxDQUFDLFNBQVM7QUFBQSxJQUNULFFBQVEsU0FBUyxVQUFVLEtBQUssU0FBUyxJQUFJO0FBQUEsTUFDekMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUFBLEVBS0wsSUFBSSxDQUFDLFNBQVM7QUFBQSxJQUNWLFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxJQUFJO0FBQUEsTUFDeEMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUVUO0FBQUE7QUFDQSxNQUFNLGlCQUFpQixjQUFjO0FBQUEsRUFJakMsT0FBTyxDQUFDLFNBQVM7QUFBQSxJQUNiLFFBQVEsU0FBUyxVQUFVLEtBQUssU0FBUyxLQUFLO0FBQUEsTUFDMUMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUVUO0FBQUE7QUFDQSxNQUFNLGFBQWEsY0FBYztBQUFBLEVBSTdCLEdBQUcsQ0FBQyxTQUFTO0FBQUEsSUFDVCxRQUFRLFNBQVMsVUFBVSxLQUFLLFNBQVMsSUFBSTtBQUFBLE1BQ3pDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFFVDtBQUFBO0FBQ0EsTUFBTSxZQUFZLGNBQWM7QUFBQSxFQUk1QixHQUFHLENBQUMsU0FBUztBQUFBLElBQ1QsUUFBUSxTQUFTLFVBQVUsS0FBSyxTQUFTLElBQUk7QUFBQSxNQUN6QyxLQUFLO0FBQUEsU0FDRjtBQUFBLElBQ1AsQ0FBQztBQUFBO0FBRVQ7QUFBQTtBQUNBLE1BQU0sZ0JBQWdCLGNBQWM7QUFBQSxFQUloQyxJQUFJLENBQUMsU0FBUztBQUFBLElBQ1YsUUFBUSxTQUFTLFVBQVUsS0FBSyxTQUFTLElBQUk7QUFBQSxNQUN6QyxLQUFLO0FBQUEsU0FDRjtBQUFBLElBQ1AsQ0FBQztBQUFBO0FBQUEsRUFLTCxNQUFNLENBQUMsU0FBUztBQUFBLElBQ1osUUFBUSxTQUFTLFVBQVUsS0FBSyxTQUFTLEtBQUs7QUFBQSxNQUMxQyxLQUFLO0FBQUEsU0FDRjtBQUFBLE1BQ0gsU0FBUztBQUFBLFFBQ0wsZ0JBQWdCO0FBQUEsV0FDYixTQUFTO0FBQUEsTUFDaEI7QUFBQSxJQUNKLENBQUM7QUFBQTtBQUFBLEVBS0wsTUFBTSxDQUFDLFNBQVM7QUFBQSxJQUNaLFFBQVEsU0FBUyxVQUFVLEtBQUssU0FBUyxJQUFJO0FBQUEsTUFDekMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUFBLEVBS0wsTUFBTSxDQUFDLFNBQVM7QUFBQSxJQUNaLFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxPQUFPO0FBQUEsTUFDM0MsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUFBLEVBS0wsR0FBRyxDQUFDLFNBQVM7QUFBQSxJQUNULFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxJQUFJO0FBQUEsTUFDeEMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUFBLEVBS0wsTUFBTSxDQUFDLFNBQVM7QUFBQSxJQUNaLFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxNQUFNO0FBQUEsTUFDMUMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxNQUNILFNBQVM7QUFBQSxRQUNMLGdCQUFnQjtBQUFBLFdBQ2IsUUFBUTtBQUFBLE1BQ2Y7QUFBQSxJQUNKLENBQUM7QUFBQTtBQUFBLEVBS0wsUUFBUSxDQUFDLFNBQVM7QUFBQSxJQUNkLFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxJQUFJO0FBQUEsTUFDeEMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUFBLEVBS0wsSUFBSSxDQUFDLFNBQVM7QUFBQSxJQUNWLFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxJQUFJO0FBQUEsTUFDeEMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUFBLEVBS0wsSUFBSSxDQUFDLFNBQVM7QUFBQSxJQUNWLFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxLQUFLO0FBQUEsTUFDekMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxNQUNILFNBQVM7QUFBQSxRQUNMLGdCQUFnQjtBQUFBLFdBQ2IsUUFBUTtBQUFBLE1BQ2Y7QUFBQSxJQUNKLENBQUM7QUFBQTtBQUFBLEVBS0wsSUFBSSxDQUFDLFNBQVM7QUFBQSxJQUNWLFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxLQUFLO0FBQUEsTUFDekMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxNQUNILFNBQVM7QUFBQSxRQUNMLGdCQUFnQjtBQUFBLFdBQ2IsUUFBUTtBQUFBLE1BQ2Y7QUFBQSxJQUNKLENBQUM7QUFBQTtBQUFBLEVBS0wsS0FBSyxDQUFDLFNBQVM7QUFBQSxJQUNYLFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxLQUFLO0FBQUEsTUFDekMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUFBLEVBS0wsT0FBTyxDQUFDLFNBQVM7QUFBQSxJQUNiLFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxPQUFPO0FBQUEsTUFDM0MsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUFBLEVBS0wsS0FBSyxDQUFDLFNBQVM7QUFBQSxJQUNYLFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxLQUFLO0FBQUEsTUFDekMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUFBLEVBS0wsSUFBSSxDQUFDLFNBQVM7QUFBQSxJQUNWLFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxJQUFJO0FBQUEsTUFDeEMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUFBLEVBS0wsU0FBUyxDQUFDLFNBQVM7QUFBQSxJQUNmLFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxLQUFLO0FBQUEsTUFDekMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxNQUNILFNBQVM7QUFBQSxRQUNMLGdCQUFnQjtBQUFBLFdBQ2IsUUFBUTtBQUFBLE1BQ2Y7QUFBQSxJQUNKLENBQUM7QUFBQTtBQUFBLEVBS0wsUUFBUSxDQUFDLFNBQVM7QUFBQSxJQUNkLFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxJQUFJO0FBQUEsTUFDeEMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUFBLEVBS0wsTUFBTSxDQUFDLFNBQVM7QUFBQSxJQUNaLFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxLQUFLO0FBQUEsTUFDekMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxNQUNILFNBQVM7QUFBQSxRQUNMLGdCQUFnQjtBQUFBLFdBQ2IsUUFBUTtBQUFBLE1BQ2Y7QUFBQSxJQUNKLENBQUM7QUFBQTtBQUFBLEVBS0wsT0FBTyxDQUFDLFNBQVM7QUFBQSxJQUNiLFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxJQUFJO0FBQUEsTUFDeEMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUFBLEVBS0wsV0FBVyxDQUFDLFNBQVM7QUFBQSxJQUNqQixRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsS0FBSztBQUFBLE1BQ3pDLEtBQUs7QUFBQSxTQUNGO0FBQUEsTUFDSCxTQUFTO0FBQUEsUUFDTCxnQkFBZ0I7QUFBQSxXQUNiLFFBQVE7QUFBQSxNQUNmO0FBQUEsSUFDSixDQUFDO0FBQUE7QUFBQSxFQUtMLE9BQU8sQ0FBQyxTQUFTO0FBQUEsSUFDYixRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsS0FBSztBQUFBLE1BQ3pDLEtBQUs7QUFBQSxTQUNGO0FBQUEsTUFDSCxTQUFTO0FBQUEsUUFDTCxnQkFBZ0I7QUFBQSxXQUNiLFFBQVE7QUFBQSxNQUNmO0FBQUEsSUFDSixDQUFDO0FBQUE7QUFBQSxFQUtMLEtBQUssQ0FBQyxTQUFTO0FBQUEsSUFDWCxRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsS0FBSztBQUFBLE1BQ3pDLEtBQUs7QUFBQSxTQUNGO0FBQUEsTUFDSCxTQUFTO0FBQUEsUUFDTCxnQkFBZ0I7QUFBQSxXQUNiLFFBQVE7QUFBQSxNQUNmO0FBQUEsSUFDSixDQUFDO0FBQUE7QUFBQSxFQUtMLE1BQU0sQ0FBQyxTQUFTO0FBQUEsSUFDWixRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsS0FBSztBQUFBLE1BQ3pDLEtBQUs7QUFBQSxTQUNGO0FBQUEsTUFDSCxTQUFTO0FBQUEsUUFDTCxnQkFBZ0I7QUFBQSxXQUNiLFFBQVE7QUFBQSxNQUNmO0FBQUEsSUFDSixDQUFDO0FBQUE7QUFBQSxFQUtMLFFBQVEsQ0FBQyxTQUFTO0FBQUEsSUFDZCxRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsS0FBSztBQUFBLE1BQ3pDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFFVDtBQUFBO0FBQ0EsTUFBTSxnQkFBZ0IsY0FBYztBQUFBLEVBSWhDLElBQUksQ0FBQyxTQUFTO0FBQUEsSUFDVixRQUFRLFNBQVMsVUFBVSxLQUFLLFNBQVMsSUFBSTtBQUFBLE1BQ3pDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFFVDtBQUFBO0FBQ0EsTUFBTSxjQUFjLGNBQWM7QUFBQSxFQUk5QixTQUFTLENBQUMsU0FBUztBQUFBLElBQ2YsUUFBUSxRQUFRLFVBQVUsS0FBSyxTQUFTLEtBQUs7QUFBQSxNQUN6QyxLQUFLO0FBQUEsU0FDRjtBQUFBLE1BQ0gsU0FBUztBQUFBLFFBQ0wsZ0JBQWdCO0FBQUEsV0FDYixRQUFRO0FBQUEsTUFDZjtBQUFBLElBQ0osQ0FBQztBQUFBO0FBQUEsRUFLTCxRQUFRLENBQUMsU0FBUztBQUFBLElBQ2QsUUFBUSxRQUFRLFVBQVUsS0FBSyxTQUFTLEtBQUs7QUFBQSxNQUN6QyxLQUFLO0FBQUEsU0FDRjtBQUFBLE1BQ0gsU0FBUztBQUFBLFFBQ0wsZ0JBQWdCO0FBQUEsV0FDYixRQUFRO0FBQUEsTUFDZjtBQUFBLElBQ0osQ0FBQztBQUFBO0FBRVQ7QUFBQTtBQUNBLE1BQU0saUJBQWlCLGNBQWM7QUFBQSxFQUlqQyxJQUFJLENBQUMsU0FBUztBQUFBLElBQ1YsUUFBUSxTQUFTLFVBQVUsS0FBSyxTQUFTLElBQUk7QUFBQSxNQUN6QyxLQUFLO0FBQUEsU0FDRjtBQUFBLElBQ1AsQ0FBQztBQUFBO0FBQUEsRUFLTCxJQUFJLENBQUMsU0FBUztBQUFBLElBQ1YsUUFBUSxTQUFTLFVBQVUsS0FBSyxTQUFTLElBQUk7QUFBQSxNQUN6QyxLQUFLO0FBQUEsU0FDRjtBQUFBLElBQ1AsQ0FBQztBQUFBO0FBQUEsRUFFTCxRQUFRLElBQUksTUFBTSxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFDOUM7QUFBQTtBQUNBLE1BQU0sYUFBYSxjQUFjO0FBQUEsRUFJN0IsSUFBSSxDQUFDLFNBQVM7QUFBQSxJQUNWLFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxJQUFJO0FBQUEsTUFDeEMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUFBLEVBS0wsS0FBSyxDQUFDLFNBQVM7QUFBQSxJQUNYLFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxJQUFJO0FBQUEsTUFDeEMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUFBLEVBS0wsT0FBTyxDQUFDLFNBQVM7QUFBQSxJQUNiLFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxJQUFJO0FBQUEsTUFDeEMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUVUO0FBQUE7QUFDQSxNQUFNLGFBQWEsY0FBYztBQUFBLEVBSTdCLElBQUksQ0FBQyxTQUFTO0FBQUEsSUFDVixRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsSUFBSTtBQUFBLE1BQ3hDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFBQSxFQUtMLElBQUksQ0FBQyxTQUFTO0FBQUEsSUFDVixRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsSUFBSTtBQUFBLE1BQ3hDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFBQSxFQUtMLE1BQU0sQ0FBQyxTQUFTO0FBQUEsSUFDWixRQUFRLFNBQVMsVUFBVSxLQUFLLFNBQVMsSUFBSTtBQUFBLE1BQ3pDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFFVDtBQUFBO0FBQ0EsTUFBTSxZQUFZLGNBQWM7QUFBQSxFQUk1QixHQUFHLENBQUMsU0FBUztBQUFBLElBQ1QsUUFBUSxTQUFTLFVBQVUsS0FBSyxTQUFTLEtBQUs7QUFBQSxNQUMxQyxLQUFLO0FBQUEsU0FDRjtBQUFBLE1BQ0gsU0FBUztBQUFBLFFBQ0wsZ0JBQWdCO0FBQUEsV0FDYixTQUFTO0FBQUEsTUFDaEI7QUFBQSxJQUNKLENBQUM7QUFBQTtBQUFBLEVBS0wsTUFBTSxDQUFDLFNBQVM7QUFBQSxJQUNaLFFBQVEsU0FBUyxVQUFVLEtBQUssU0FBUyxJQUFJO0FBQUEsTUFDekMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUVUO0FBQUE7QUFDQSxNQUFNLGFBQWEsY0FBYztBQUFBLEVBSTdCLE1BQU0sQ0FBQyxTQUFTO0FBQUEsSUFDWixRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsT0FBTztBQUFBLE1BQzNDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFBQSxFQUtMLEtBQUssQ0FBQyxTQUFTO0FBQUEsSUFDWCxRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsS0FBSztBQUFBLE1BQ3pDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFBQSxFQUtMLFFBQVEsQ0FBQyxTQUFTO0FBQUEsSUFDZCxRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsS0FBSztBQUFBLE1BQ3pDLEtBQUs7QUFBQSxTQUNGO0FBQUEsTUFDSCxTQUFTO0FBQUEsUUFDTCxnQkFBZ0I7QUFBQSxXQUNiLFFBQVE7QUFBQSxNQUNmO0FBQUEsSUFDSixDQUFDO0FBQUE7QUFBQSxFQUtMLFlBQVksQ0FBQyxTQUFTO0FBQUEsSUFDbEIsUUFBUSxRQUFRLFVBQVUsS0FBSyxTQUFTLEtBQUs7QUFBQSxNQUN6QyxLQUFLO0FBQUEsU0FDRjtBQUFBLElBQ1AsQ0FBQztBQUFBO0FBQUEsRUFLTCxHQUFHLENBQUMsU0FBUztBQUFBLElBQ1QsUUFBUSxRQUFRLFVBQVUsS0FBSyxTQUFTLElBQUk7QUFBQSxNQUN4QyxLQUFLO0FBQUEsU0FDRjtBQUFBLE1BQ0gsU0FBUztBQUFBLFFBQ0wsZ0JBQWdCO0FBQUEsV0FDYixRQUFRO0FBQUEsTUFDZjtBQUFBLElBQ0osQ0FBQztBQUFBO0FBRVQ7QUFBQTtBQUNBLE1BQU0sWUFBWSxjQUFjO0FBQUEsRUFJNUIsTUFBTSxDQUFDLFNBQVM7QUFBQSxJQUNaLFFBQVEsU0FBUyxVQUFVLEtBQUssU0FBUyxJQUFJO0FBQUEsTUFDekMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUFBLEVBS0wsR0FBRyxDQUFDLFNBQVM7QUFBQSxJQUNULFFBQVEsU0FBUyxVQUFVLEtBQUssU0FBUyxLQUFLO0FBQUEsTUFDMUMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxNQUNILFNBQVM7QUFBQSxRQUNMLGdCQUFnQjtBQUFBLFdBQ2IsU0FBUztBQUFBLE1BQ2hCO0FBQUEsSUFDSixDQUFDO0FBQUE7QUFBQSxFQUtMLE9BQU8sQ0FBQyxTQUFTO0FBQUEsSUFDYixRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsS0FBSztBQUFBLE1BQ3pDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFBQSxFQUtMLFVBQVUsQ0FBQyxTQUFTO0FBQUEsSUFDaEIsUUFBUSxRQUFRLFVBQVUsS0FBSyxTQUFTLEtBQUs7QUFBQSxNQUN6QyxLQUFLO0FBQUEsU0FDRjtBQUFBLElBQ1AsQ0FBQztBQUFBO0FBQUEsRUFFTCxPQUFPLElBQUksS0FBSyxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFDNUM7QUFBQTtBQUNBLE1BQU0sWUFBWSxjQUFjO0FBQUEsRUFJNUIsTUFBTSxDQUFDLFNBQVM7QUFBQSxJQUNaLFFBQVEsU0FBUyxVQUFVLEtBQUssU0FBUyxJQUFJO0FBQUEsTUFDekMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUVUO0FBQUE7QUFDQSxNQUFNLGtCQUFrQixjQUFjO0FBQUEsRUFJbEMsTUFBTSxDQUFDLFNBQVM7QUFBQSxJQUNaLFFBQVEsU0FBUyxVQUFVLEtBQUssU0FBUyxJQUFJO0FBQUEsTUFDekMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUVUO0FBQUE7QUFDQSxNQUFNLGdCQUFnQixjQUFjO0FBQUEsRUFJaEMsSUFBSSxDQUFDLFNBQVM7QUFBQSxJQUNWLFFBQVEsU0FBUyxVQUFVLEtBQUssU0FBUyxJQUFJO0FBQUEsTUFDekMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUFBLEVBS0wsUUFBUSxDQUFDLFNBQVM7QUFBQSxJQUNkLFFBQVEsU0FBUyxVQUFVLEtBQUssU0FBUyxLQUFLO0FBQUEsTUFDMUMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxNQUNILFNBQVM7QUFBQSxRQUNMLGdCQUFnQjtBQUFBLFdBQ2IsU0FBUztBQUFBLE1BQ2hCO0FBQUEsSUFDSixDQUFDO0FBQUE7QUFFVDtBQUFBO0FBQ0EsTUFBTSxZQUFZLGNBQWM7QUFBQSxFQUk1QixZQUFZLENBQUMsU0FBUztBQUFBLElBQ2xCLFFBQVEsU0FBUyxVQUFVLEtBQUssU0FBUyxLQUFLO0FBQUEsTUFDMUMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxNQUNILFNBQVM7QUFBQSxRQUNMLGdCQUFnQjtBQUFBLFdBQ2IsU0FBUztBQUFBLE1BQ2hCO0FBQUEsSUFDSixDQUFDO0FBQUE7QUFBQSxFQUtMLFFBQVEsQ0FBQyxTQUFTO0FBQUEsSUFDZCxRQUFRLFNBQVMsVUFBVSxLQUFLLFNBQVMsS0FBSztBQUFBLE1BQzFDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFBQSxFQUtMLFlBQVksQ0FBQyxTQUFTO0FBQUEsSUFDbEIsUUFBUSxTQUFTLFVBQVUsS0FBSyxTQUFTLEtBQUs7QUFBQSxNQUMxQyxLQUFLO0FBQUEsU0FDRjtBQUFBLElBQ1AsQ0FBQztBQUFBO0FBQUEsRUFLTCxVQUFVLENBQUMsU0FBUztBQUFBLElBQ2hCLFFBQVEsU0FBUyxVQUFVLEtBQUssU0FBUyxLQUFLO0FBQUEsTUFDMUMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUFBLEVBS0wsVUFBVSxDQUFDLFNBQVM7QUFBQSxJQUNoQixRQUFRLFNBQVMsVUFBVSxLQUFLLFNBQVMsS0FBSztBQUFBLE1BQzFDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFBQSxFQUtMLFlBQVksQ0FBQyxTQUFTO0FBQUEsSUFDbEIsUUFBUSxTQUFTLFVBQVUsS0FBSyxTQUFTLEtBQUs7QUFBQSxNQUMxQyxLQUFLO0FBQUEsU0FDRjtBQUFBLElBQ1AsQ0FBQztBQUFBO0FBQUEsRUFLTCxXQUFXLENBQUMsU0FBUztBQUFBLElBQ2pCLFFBQVEsU0FBUyxVQUFVLEtBQUssU0FBUyxLQUFLO0FBQUEsTUFDMUMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUFBLEVBS0wsY0FBYyxDQUFDLFNBQVM7QUFBQSxJQUNwQixRQUFRLFNBQVMsVUFBVSxLQUFLLFNBQVMsS0FBSztBQUFBLE1BQzFDLEtBQUs7QUFBQSxTQUNGO0FBQUEsTUFDSCxTQUFTO0FBQUEsUUFDTCxnQkFBZ0I7QUFBQSxXQUNiLFNBQVM7QUFBQSxNQUNoQjtBQUFBLElBQ0osQ0FBQztBQUFBO0FBQUEsRUFLTCxTQUFTLENBQUMsU0FBUztBQUFBLElBQ2YsUUFBUSxTQUFTLFVBQVUsS0FBSyxTQUFTLEtBQUs7QUFBQSxNQUMxQyxLQUFLO0FBQUEsU0FDRjtBQUFBLE1BQ0gsU0FBUztBQUFBLFFBQ0wsZ0JBQWdCO0FBQUEsV0FDYixTQUFTO0FBQUEsTUFDaEI7QUFBQSxJQUNKLENBQUM7QUFBQTtBQUFBLEVBS0wsT0FBTyxDQUFDLFNBQVM7QUFBQSxJQUNiLFFBQVEsU0FBUyxVQUFVLEtBQUssU0FBUyxLQUFLO0FBQUEsTUFDMUMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxNQUNILFNBQVM7QUFBQSxRQUNMLGdCQUFnQjtBQUFBLFdBQ2IsU0FBUztBQUFBLE1BQ2hCO0FBQUEsSUFDSixDQUFDO0FBQUE7QUFBQSxFQUVMLFVBQVUsSUFBSSxRQUFRLEVBQUUsUUFBUSxLQUFLLFFBQVEsQ0FBQztBQUNsRDtBQUFBO0FBQ0EsTUFBTSxjQUFjLGNBQWM7QUFBQSxFQUk5QixTQUFTLENBQUMsU0FBUztBQUFBLElBQ2YsUUFBUSxTQUFTLFVBQVUsS0FBSyxTQUFTLElBQUksSUFBSTtBQUFBLE1BQzdDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFFVDtBQUFBO0FBQ08sTUFBTSx1QkFBdUIsY0FBYztBQUFBLEVBSTlDLG9DQUFvQyxDQUFDLFNBQVM7QUFBQSxJQUMxQyxRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsS0FBSztBQUFBLE1BQ3pDLEtBQUs7QUFBQSxTQUNGO0FBQUEsTUFDSCxTQUFTO0FBQUEsUUFDTCxnQkFBZ0I7QUFBQSxXQUNiLFFBQVE7QUFBQSxNQUNmO0FBQUEsSUFDSixDQUFDO0FBQUE7QUFBQSxFQUVMLFNBQVMsSUFBSSxPQUFPLEVBQUUsUUFBUSxLQUFLLFFBQVEsQ0FBQztBQUFBLEVBQzVDLFVBQVUsSUFBSSxRQUFRLEVBQUUsUUFBUSxLQUFLLFFBQVEsQ0FBQztBQUFBLEVBQzlDLE1BQU0sSUFBSSxJQUFJLEVBQUUsUUFBUSxLQUFLLFFBQVEsQ0FBQztBQUFBLEVBQ3RDLFNBQVMsSUFBSSxPQUFPLEVBQUUsUUFBUSxLQUFLLFFBQVEsQ0FBQztBQUFBLEVBQzVDLE9BQU8sSUFBSSxLQUFLLEVBQUUsUUFBUSxLQUFLLFFBQVEsQ0FBQztBQUFBLEVBQ3hDLFdBQVcsSUFBSSxTQUFTLEVBQUUsUUFBUSxLQUFLLFFBQVEsQ0FBQztBQUFBLEVBQ2hELE9BQU8sSUFBSSxLQUFLLEVBQUUsUUFBUSxLQUFLLFFBQVEsQ0FBQztBQUFBLEVBQ3hDLE1BQU0sSUFBSSxJQUFJLEVBQUUsUUFBUSxLQUFLLFFBQVEsQ0FBQztBQUFBLEVBQ3RDLFVBQVUsSUFBSSxRQUFRLEVBQUUsUUFBUSxLQUFLLFFBQVEsQ0FBQztBQUFBLEVBQzlDLFVBQVUsSUFBSSxRQUFRLEVBQUUsUUFBUSxLQUFLLFFBQVEsQ0FBQztBQUFBLEVBQzlDLFdBQVcsSUFBSSxTQUFTLEVBQUUsUUFBUSxLQUFLLFFBQVEsQ0FBQztBQUFBLEVBQ2hELE9BQU8sSUFBSSxLQUFLLEVBQUUsUUFBUSxLQUFLLFFBQVEsQ0FBQztBQUFBLEVBQ3hDLE9BQU8sSUFBSSxLQUFLLEVBQUUsUUFBUSxLQUFLLFFBQVEsQ0FBQztBQUFBLEVBQ3hDLE1BQU0sSUFBSSxJQUFJLEVBQUUsUUFBUSxLQUFLLFFBQVEsQ0FBQztBQUFBLEVBQ3RDLE1BQU0sSUFBSSxJQUFJLEVBQUUsUUFBUSxLQUFLLFFBQVEsQ0FBQztBQUFBLEVBQ3RDLE1BQU0sSUFBSSxJQUFJLEVBQUUsUUFBUSxLQUFLLFFBQVEsQ0FBQztBQUFBLEVBQ3RDLFlBQVksSUFBSSxVQUFVLEVBQUUsUUFBUSxLQUFLLFFBQVEsQ0FBQztBQUFBLEVBQ2xELE1BQU0sSUFBSSxJQUFJLEVBQUUsUUFBUSxLQUFLLFFBQVEsQ0FBQztBQUFBLEVBQ3RDLE9BQU8sSUFBSSxLQUFLLEVBQUUsUUFBUSxLQUFLLFFBQVEsQ0FBQztBQUFBLEVBQ3hDLFFBQVEsSUFBSSxNQUFNLEVBQUUsUUFBUSxLQUFLLFFBQVEsQ0FBQztBQUM5Qzs7O0FDNTJCTyxTQUFTLG9CQUFvQixDQUFDLFFBQVE7QUFBQSxFQUN6QyxJQUFJLENBQUMsUUFBUSxPQUFPO0FBQUEsSUFDaEIsTUFBTSxjQUFjLENBQUMsUUFBUTtBQUFBLE1BRXpCLElBQUksVUFBVTtBQUFBLE1BQ2QsT0FBTyxNQUFNLEdBQUc7QUFBQTtBQUFBLElBRXBCLFNBQVM7QUFBQSxTQUNGO0FBQUEsTUFDSCxPQUFPO0FBQUEsSUFDWDtBQUFBLEVBQ0o7QUFBQSxFQUNBLElBQUksUUFBUSxXQUFXO0FBQUEsSUFDbkIsT0FBTyxVQUFVO0FBQUEsU0FDVixPQUFPO0FBQUEsTUFDVix3QkFBd0IsT0FBTztBQUFBLElBQ25DO0FBQUEsRUFDSjtBQUFBLEVBQ0EsTUFBTSxVQUFTLGFBQWEsTUFBTTtBQUFBLEVBQ2xDLE9BQU8sSUFBSSxlQUFlLEVBQUUsZ0JBQU8sQ0FBQztBQUFBOztBQ3ZCeEM7QUFDQSxlQUFzQixvQkFBb0IsQ0FBQyxTQUFTO0FBQUEsRUFDaEQsVUFBVSxPQUFPLE9BQU87QUFBQSxJQUNwQixVQUFVO0FBQUEsSUFDVixNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsRUFDYixHQUFHLFdBQVcsQ0FBQyxDQUFDO0FBQUEsRUFDaEIsTUFBTSxPQUFPLENBQUMsU0FBUyxjQUFjLFFBQVEsWUFBWSxVQUFVLFFBQVEsTUFBTTtBQUFBLEVBQ2pGLElBQUksUUFBUSxRQUFRO0FBQUEsSUFDaEIsS0FBSyxLQUFLLGVBQWUsUUFBUSxPQUFPLFVBQVU7QUFBQSxFQUN0RCxNQUFNLE9BQU8sTUFBTSxZQUFZLE1BQU07QUFBQSxJQUNqQyxRQUFRLFFBQVE7QUFBQSxJQUNoQixLQUFLO0FBQUEsU0FDRSxRQUFRO0FBQUEsTUFDWCx5QkFBeUIsS0FBSyxVQUFVLFFBQVEsVUFBVSxDQUFDLENBQUM7QUFBQSxJQUNoRTtBQUFBLEVBQ0osQ0FBQztBQUFBLEVBQ0QsTUFBTSxNQUFNLE1BQU0sSUFBSSxRQUFRLENBQUMsU0FBUyxXQUFXO0FBQUEsSUFDL0MsTUFBTSxLQUFLLFdBQVcsTUFBTTtBQUFBLE1BQ3hCLE9BQU8sSUFBSSxNQUFNLDZDQUE2QyxRQUFRLFdBQVcsQ0FBQztBQUFBLE9BQ25GLFFBQVEsT0FBTztBQUFBLElBQ2xCLElBQUksU0FBUztBQUFBLElBQ2IsS0FBSyxRQUFRLEdBQUcsUUFBUSxDQUFDLFVBQVU7QUFBQSxNQUMvQixVQUFVLE1BQU0sU0FBUztBQUFBLE1BQ3pCLE1BQU0sUUFBUSxPQUFPLE1BQU07QUFBQSxDQUFJO0FBQUEsTUFDL0IsV0FBVyxRQUFRLE9BQU87QUFBQSxRQUN0QixJQUFJLEtBQUssV0FBVywyQkFBMkIsR0FBRztBQUFBLFVBQzlDLE1BQU0sUUFBUSxLQUFLLE1BQU0sMEJBQTBCO0FBQUEsVUFDbkQsSUFBSSxDQUFDLE9BQU87QUFBQSxZQUNSLE1BQU0sSUFBSSxNQUFNLDJDQUEyQyxNQUFNO0FBQUEsVUFDckU7QUFBQSxVQUNBLGFBQWEsRUFBRTtBQUFBLFVBQ2YsUUFBUSxNQUFNLEVBQUU7QUFBQSxVQUNoQjtBQUFBLFFBQ0o7QUFBQSxNQUNKO0FBQUEsS0FDSDtBQUFBLElBQ0QsS0FBSyxRQUFRLEdBQUcsUUFBUSxDQUFDLFVBQVU7QUFBQSxNQUMvQixVQUFVLE1BQU0sU0FBUztBQUFBLEtBQzVCO0FBQUEsSUFDRCxLQUFLLEdBQUcsUUFBUSxDQUFDLFNBQVM7QUFBQSxNQUN0QixhQUFhLEVBQUU7QUFBQSxNQUNmLElBQUksTUFBTSwyQkFBMkI7QUFBQSxNQUNyQyxJQUFJLE9BQU8sS0FBSyxHQUFHO0FBQUEsUUFDZixPQUFPO0FBQUEsaUJBQW9CO0FBQUEsTUFDL0I7QUFBQSxNQUNBLE9BQU8sSUFBSSxNQUFNLEdBQUcsQ0FBQztBQUFBLEtBQ3hCO0FBQUEsSUFDRCxLQUFLLEdBQUcsU0FBUyxDQUFDLFVBQVU7QUFBQSxNQUN4QixhQUFhLEVBQUU7QUFBQSxNQUNmLE9BQU8sS0FBSztBQUFBLEtBQ2Y7QUFBQSxJQUNELElBQUksUUFBUSxRQUFRO0FBQUEsTUFDaEIsUUFBUSxPQUFPLGlCQUFpQixTQUFTLE1BQU07QUFBQSxRQUMzQyxhQUFhLEVBQUU7QUFBQSxRQUNmLE9BQU8sSUFBSSxNQUFNLFNBQVMsQ0FBQztBQUFBLE9BQzlCO0FBQUEsSUFDTDtBQUFBLEdBQ0g7QUFBQSxFQUNELE9BQU87QUFBQSxJQUNIO0FBQUEsSUFDQSxLQUFLLEdBQUc7QUFBQSxNQUNKLEtBQUssS0FBSztBQUFBO0FBQUEsRUFFbEI7QUFBQTs7QUM1REosZUFBc0IsY0FBYyxDQUFDLFNBQVM7QUFBQSxFQUMxQyxNQUFNLFVBQVMsTUFBTSxxQkFBcUI7QUFBQSxPQUNuQztBQUFBLEVBQ1AsQ0FBQztBQUFBLEVBQ0QsTUFBTSxVQUFTLHFCQUFxQjtBQUFBLElBQ2hDLFNBQVMsUUFBTztBQUFBLEVBQ3BCLENBQUM7QUFBQSxFQUNELE9BQU87QUFBQSxJQUNIO0FBQUEsSUFDQTtBQUFBLEVBQ0o7QUFBQTs7O0FDZEo7QUFNQTtBQUVPLElBQVU7QUFBQSxDQUFWLENBQVUsUUFBVjtBQUFBLEVBR0gsTUFBTSxnQkFBdUM7QUFBQSxJQUN6QyxPQUFPO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsRUFDWDtBQUFBLEVBRUEsSUFBSSxlQUFzQjtBQUFBLEVBQzFCLElBQUksVUFBVTtBQUFBLEVBQ2QsSUFBSSxRQUE4QixDQUFDLFFBQVEsUUFBUSxPQUFPLE1BQU0sR0FBRztBQUFBLEVBRW5FLFNBQVMsU0FBUyxDQUFDLE9BQXVCO0FBQUEsSUFDdEMsT0FBTyxjQUFjLFVBQVUsY0FBYztBQUFBO0FBQUEsRUFTMUMsU0FBUyxJQUFJLEdBQVc7QUFBQSxJQUMzQixPQUFPO0FBQUE7QUFBQSxFQURKLElBQVM7QUFBQSxFQUloQixlQUFzQixJQUFJLENBQUMsU0FBaUM7QUFBQSxJQUN4RCxJQUFJLFFBQVE7QUFBQSxNQUFPLGVBQWUsUUFBUTtBQUFBLElBRzFDLE1BQU0sZUFBZSxDQUFDLFFBQWdCO0FBQUEsTUFDbEMsUUFBUSxPQUFPLE1BQU0sR0FBRztBQUFBO0FBQUEsSUFHNUIsSUFBSSxRQUFRLFFBQVE7QUFBQSxNQUNoQixNQUFNLFlBQVksSUFBSSxLQUFLLEVBQ3RCLFlBQVksRUFDWixRQUFRLFNBQVMsR0FBRyxFQUNwQixNQUFNLEdBQUcsRUFBRTtBQUFBLE1BQ2hCLFVBQVUsS0FBSyxLQUFLLFFBQVEsUUFBUSxTQUFTLGVBQWU7QUFBQSxNQUM1RCxNQUFNLEdBQUcsTUFBTSxRQUFRLFFBQVEsRUFBRSxXQUFXLEtBQUssQ0FBQztBQUFBLE1BRWxELE1BQU0sUUFBTyxJQUFJLEtBQUssT0FBTztBQUFBLE1BQzdCLE1BQU0sYUFBYSxNQUFLLE9BQU87QUFBQSxNQUkvQixRQUFRLENBQUMsUUFBUTtBQUFBLFFBQ2IsSUFBSSxRQUFRLE9BQU87QUFBQSxVQUNmLGFBQWEsR0FBRztBQUFBLFFBQ3BCO0FBQUEsUUFDQSxXQUFXLE1BQU0sR0FBRztBQUFBLFFBQ3BCLFdBQVcsTUFBTTtBQUFBO0FBQUEsSUFFekIsRUFBTyxTQUFJLFFBQVEsT0FBTztBQUFBLE1BRXRCLFFBQVE7QUFBQSxJQUNaO0FBQUE7QUFBQSxFQS9CSixJQUFzQjtBQUFBLEVBeUN0QixTQUFTLFdBQVcsQ0FBQyxPQUFxQztBQUFBLElBQ3RELElBQUksQ0FBQztBQUFBLE1BQU8sT0FBTztBQUFBLElBQ25CLE1BQU0sV0FBVyxPQUFPLFFBQVEsS0FBSyxFQUNoQyxJQUNHLEVBQUUsR0FBRyxPQUNELEdBQUcsS0FBSyxPQUFPLE1BQU0sV0FBVyxLQUFLLFVBQVUsQ0FBQyxJQUFJLEdBQzVELEVBQ0MsS0FBSyxHQUFHO0FBQUEsSUFDYixPQUFPLFdBQVcsSUFBSSxhQUFhO0FBQUE7QUFBQSxFQUdoQyxTQUFTLE1BQU0sQ0FBQyxNQUF1QztBQUFBLElBQzFELE1BQU0sU0FBUyxPQUNULE9BQU8sUUFBUSxJQUFJLEVBQ2QsSUFBSSxFQUFFLEdBQUcsT0FBTyxHQUFHLEtBQUssR0FBRyxFQUMzQixLQUFLLEdBQUcsSUFDYjtBQUFBLElBQ04sTUFBTSxrQkFBa0IsU0FBUyxHQUFHLFlBQVk7QUFBQSxJQUVoRCxPQUFPO0FBQUEsTUFDSCxLQUFLLENBQUMsU0FBaUIsT0FBNkI7QUFBQSxRQUNoRCxJQUFJLFVBQVUsT0FBTyxHQUFHO0FBQUEsVUFDcEIsTUFDSSxTQUFTLElBQUksS0FBSyxFQUFFLFlBQVksS0FBSyxTQUFTLFVBQVUsWUFBWSxLQUFLO0FBQUEsQ0FDN0U7QUFBQSxRQUNKO0FBQUE7QUFBQSxNQUVKLElBQUksQ0FBQyxTQUFpQixPQUE2QjtBQUFBLFFBQy9DLElBQUksVUFBVSxNQUFNLEdBQUc7QUFBQSxVQUNuQixNQUNJLFNBQVMsSUFBSSxLQUFLLEVBQUUsWUFBWSxLQUFLLFNBQVMsVUFBVSxZQUFZLEtBQUs7QUFBQSxDQUM3RTtBQUFBLFFBQ0o7QUFBQTtBQUFBLE1BRUosSUFBSSxDQUFDLFNBQWlCLE9BQTZCO0FBQUEsUUFDL0MsSUFBSSxVQUFVLE1BQU0sR0FBRztBQUFBLFVBQ25CLE1BQ0ksU0FBUyxJQUFJLEtBQUssRUFBRSxZQUFZLEtBQUssU0FBUyxVQUFVLFlBQVksS0FBSztBQUFBLENBQzdFO0FBQUEsUUFDSjtBQUFBO0FBQUEsTUFFSixLQUFLLENBQUMsU0FBaUIsT0FBNkI7QUFBQSxRQUNoRCxJQUFJLFVBQVUsT0FBTyxHQUFHO0FBQUEsVUFDcEIsTUFDSSxTQUFTLElBQUksS0FBSyxFQUFFLFlBQVksS0FBSyxTQUFTLFVBQVUsWUFBWSxLQUFLO0FBQUEsQ0FDN0U7QUFBQSxRQUNKO0FBQUE7QUFBQSxJQUVSO0FBQUE7QUFBQSxFQXJDRyxJQUFTO0FBQUEsRUF3Q0gsY0FBVSxPQUFPLEVBQUUsU0FBUyxRQUFRLENBQUM7QUFBQSxHQXhIckM7OztBZE9qQixJQUFNLE1BQU0sSUFBSSxPQUFPLEVBQUUsU0FBUyxrQkFBa0IsQ0FBQztBQUFBO0FBc0U5QyxNQUFNLGVBQWU7QUFBQSxFQUNoQjtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBLFlBQW9CLFFBQVEsSUFBSTtBQUFBLEVBQ2hDLFNBQW9EO0FBQUEsRUFDcEQ7QUFBQSxFQUtBLFdBQVcsQ0FDZixTQUNBLFNBQ0EsU0FBdUIsQ0FBQyxHQUMxQjtBQUFBLElBQ0UsS0FBSyxTQUFTO0FBQUEsSUFDZCxLQUFLLFNBQVM7QUFBQSxJQUNkLEtBQUssVUFBVSxPQUFPLFdBQVc7QUFBQSxJQUNqQyxLQUFLLGdCQUFnQixPQUFPLGlCQUFpQjtBQUFBLElBRTdDLE1BQU0sbUJBQW1CLE9BQU8sU0FDNUIsUUFBUSxJQUFJLDhCQUE4QixJQUMxQyxFQUNKO0FBQUEsSUFDQSxNQUFNLHdCQUF3QixPQUFPLFNBQVMsZ0JBQWdCLElBQ3hELG1CQUNBO0FBQUEsSUFHTixLQUFLLGdCQUNELE9BQU8saUJBQWlCLHlCQUF5QjtBQUFBLElBRXJELEtBQUssWUFDRCxPQUFPLGFBQWEsUUFBUSxJQUFJLHNCQUFzQixRQUFRLElBQUk7QUFBQSxJQUV0RSxLQUFLLHVCQUF1QixPQUFPLHdCQUF3QjtBQUFBLElBQzNELEtBQUssaUJBQWlCLElBQUk7QUFBQSxJQUUxQixJQUFJLE1BQU0sOEJBQThCO0FBQUEsTUFDcEMsY0FBYyxDQUFDLENBQUMsS0FBSztBQUFBLE1BQ3JCLFNBQVMsS0FBSztBQUFBLE1BQ2Qsc0JBQXNCLEtBQUs7QUFBQSxJQUMvQixDQUFDO0FBQUE7QUFBQSxjQVFnQixpQkFBZ0IsR0FBb0I7QUFBQSxJQUNyRCxJQUFJO0FBQUEsTUFFQSxNQUFNLGNBQWM7QUFBQSxNQUNwQixNQUFNLHFCQUNGLE1BQU0sZUFBZSxnQkFBZ0IsV0FBVztBQUFBLE1BRXBELElBQUksQ0FBQyxvQkFBb0I7QUFBQSxRQUNyQixJQUFJLEtBQ0EsaUZBQ0o7QUFBQSxNQUNKLEVBQU87QUFBQSxRQUNILElBQUksTUFDQSw4REFDSjtBQUFBO0FBQUEsTUFJSixNQUFNLGNBQWMsTUFBTSxlQUFlLGtCQUFrQjtBQUFBLE1BQzNELElBQUksS0FDQSw2Q0FBNkMsYUFDakQ7QUFBQSxNQUNBLE9BQU87QUFBQSxNQUNULE9BQU8sT0FBTztBQUFBLE1BQ1osTUFBTSxXQUNGLGlCQUFpQixRQUFRLE1BQU0sVUFBVSxPQUFPLEtBQUs7QUFBQSxNQUN6RCxJQUFJLE1BQU0seUNBQXlDO0FBQUEsUUFDL0MsT0FBTztBQUFBLE1BQ1gsQ0FBQztBQUFBLE1BQ0QsTUFBTSxJQUFJLE1BQ04sMENBQTBDLFVBQzlDO0FBQUE7QUFBQTtBQUFBLGNBT2EsZ0JBQWUsQ0FBQyxNQUFnQztBQUFBLElBQ2pFLE9BQU8sSUFBSSxRQUFRLENBQUMsWUFBWTtBQUFBLE1BQzVCLE1BQU0sVUFBUyxhQUFhO0FBQUEsTUFFNUIsUUFBTyxPQUFPLE1BQU0sTUFBTTtBQUFBLFFBQ3RCLFFBQU8sS0FBSyxTQUFTLE1BQU0sUUFBUSxJQUFJLENBQUM7QUFBQSxRQUN4QyxRQUFPLE1BQU07QUFBQSxPQUNoQjtBQUFBLE1BRUQsUUFBTyxHQUFHLFNBQVMsTUFBTSxRQUFRLEtBQUssQ0FBQztBQUFBLEtBQzFDO0FBQUE7QUFBQSxjQU1nQixrQkFBaUIsR0FBb0I7QUFBQSxJQUN0RCxPQUFPLElBQUksUUFBUSxDQUFDLFNBQVMsV0FBVztBQUFBLE1BQ3BDLE1BQU0sVUFBUyxhQUFhO0FBQUEsTUFFNUIsUUFBTyxPQUFPLEdBQUcsTUFBTTtBQUFBLFFBQ25CLE1BQU0sVUFBVSxRQUFPLFFBQVE7QUFBQSxRQUMvQixJQUFJLFdBQVcsT0FBTyxZQUFZLFVBQVU7QUFBQSxVQUN4QyxRQUFPLEtBQUssU0FBUyxNQUFNLFFBQVEsUUFBUSxJQUFJLENBQUM7QUFBQSxVQUNoRCxRQUFPLE1BQU07QUFBQSxRQUNqQixFQUFPO0FBQUEsVUFDSCxPQUFPLElBQUksTUFBTSw4QkFBOEIsQ0FBQztBQUFBO0FBQUEsT0FFdkQ7QUFBQSxNQUVELFFBQU8sR0FBRyxTQUFTLE1BQU07QUFBQSxLQUM1QjtBQUFBO0FBQUEsY0FjUSxPQUFNLENBQUMsU0FBdUIsQ0FBQyxHQUE0QjtBQUFBLElBQ3BFLElBQUk7QUFBQSxNQUVBLElBQUksT0FBTyxRQUFRO0FBQUEsUUFDZixJQUFJLEtBQUsscURBQXFEO0FBQUEsUUFDOUQsT0FBTyxJQUFJLGVBQWUsT0FBTyxRQUFRLE1BQU0sTUFBTTtBQUFBLE1BQ3pEO0FBQUEsTUFHQSxJQUFJLE9BQU8sbUJBQW1CO0FBQUEsUUFDMUIsSUFBSSxLQUFLLDBDQUEwQztBQUFBLFVBQy9DLEtBQUssT0FBTztBQUFBLFFBQ2hCLENBQUM7QUFBQSxRQUNELElBQUk7QUFBQSxVQUNBLE1BQU0sVUFBUyxxQkFBcUI7QUFBQSxZQUNoQyxTQUFTLE9BQU87QUFBQSxVQUNwQixDQUFDO0FBQUEsVUFHRCxJQUFJLE1BQU0sNENBQTRDO0FBQUEsVUFJdEQsT0FBTyxJQUFJLGVBQWUsU0FBUSxNQUFNLE1BQU07QUFBQSxVQUNoRCxPQUFPLE9BQU87QUFBQSxVQUNaLE1BQU0sV0FDRixpQkFBaUIsUUFBUSxNQUFNLFVBQVUsT0FBTyxLQUFLO0FBQUEsVUFDekQsSUFBSSxNQUFNLHdDQUF3QztBQUFBLFlBQzlDLEtBQUssT0FBTztBQUFBLFlBQ1osT0FBTztBQUFBLFVBQ1gsQ0FBQztBQUFBLFVBQ0QsTUFBTTtBQUFBO0FBQUEsTUFFZDtBQUFBLE1BS0EsSUFBSSxLQUFLLG1DQUFtQztBQUFBLFFBQ3hDLFNBQVMsT0FBTyx3QkFBd0I7QUFBQSxNQUM1QyxDQUFDO0FBQUEsTUFFRCxNQUFNLGdCQUFnQixNQUFNLGVBQWUsaUJBQWlCO0FBQUEsTUFFNUQsUUFBUSxpQkFBUSxvQkFBVyxNQUFNLGVBQWU7QUFBQSxRQUM1QyxTQUFTLE9BQU8sd0JBQXdCO0FBQUEsUUFDeEMsTUFBTTtBQUFBLE1BQ1YsQ0FBQztBQUFBLE1BRUQsSUFBSSxLQUFLLHNDQUFzQztBQUFBLE1BQy9DLE9BQU8sSUFBSSxlQUFlLFNBQVEsU0FBUSxNQUFNO0FBQUEsTUFDbEQsT0FBTyxPQUFPO0FBQUEsTUFDWixNQUFNLFdBQ0YsaUJBQWlCLFFBQVEsTUFBTSxVQUFVLE9BQU8sS0FBSztBQUFBLE1BQ3pELElBQUksTUFBTSxtQ0FBbUMsRUFBRSxPQUFPLFNBQVMsQ0FBQztBQUFBLE1BQ2hFLE1BQU0sSUFBSSxNQUFNLG9DQUFvQyxVQUFVO0FBQUE7QUFBQTtBQUFBLE9BT2hFLGNBQWEsQ0FBQyxRQUFrQztBQUFBLElBQ2xELElBQUk7QUFBQSxNQUVBLE1BQU0sU0FBUyxNQUFNLEtBQUssT0FBTyxRQUFRLE9BQU87QUFBQSxRQUM1QyxNQUFNO0FBQUEsVUFDRixPQUFPO0FBQUEsUUFDWDtBQUFBLE1BQ0osQ0FBQztBQUFBLE1BRUQsSUFBSSxDQUFDLE9BQU8sTUFBTTtBQUFBLFFBQ2QsTUFBTSxJQUFJLE1BQ04sc0NBQXNDLEtBQUssVUFBVSxPQUFPLEtBQUssR0FDckU7QUFBQSxNQUNKO0FBQUEsTUFFQSxNQUFNLGFBQWEsT0FBTztBQUFBLE1BSzFCLElBQUksdUJBQXVCLE9BQU8sS0FBSztBQUFBLE1BQ3ZDLE1BQU0sb0JBQW9CLENBQUMsWUFBb0I7QUFBQSxRQUMzQyxJQUFJLENBQUM7QUFBQSxVQUFzQixPQUFPO0FBQUEsUUFDbEMsTUFBTSxXQUFXLEdBQUc7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQUFrQztBQUFBLFFBQ3RELHVCQUF1QjtBQUFBLFFBQ3ZCLE9BQU87QUFBQTtBQUFBLE1BSVgsTUFBTSxrQkFBK0MsQ0FBQztBQUFBLE1BR3RELE1BQU0sVUFBbUI7QUFBQSxRQUNyQixJQUFJLFdBQVcsTUFBTSxLQUFLLGtCQUFrQjtBQUFBLFFBQzVDLGtCQUFrQjtBQUFBLFFBQ2xCLGFBQWEsT0FBTyxZQUFvQjtBQUFBLFVBQ3BDLE9BQU8sS0FBSyxrQkFDUixXQUFXLElBQ1gsa0JBQWtCLE9BQU8sQ0FDN0I7QUFBQTtBQUFBLFFBRUosbUJBQW1CLE9BQU8sWUFBb0I7QUFBQSxVQUMxQyxPQUFPLEtBQUssd0JBQ1IsV0FBVyxJQUNYLGtCQUFrQixPQUFPLEdBQ3pCLGVBQ0o7QUFBQTtBQUFBLFFBRUosT0FBTyxZQUFZO0FBQUEsVUFDZixPQUFPLEtBQUssbUJBQW1CLFdBQVcsRUFBRTtBQUFBO0FBQUEsTUFFcEQ7QUFBQSxNQUdBLEtBQUssZUFBZSxJQUFJLFFBQVEsSUFBSSxPQUFPO0FBQUEsTUFFM0MsT0FBTztBQUFBLE1BQ1QsT0FBTyxPQUFPO0FBQUEsTUFDWixNQUFNLGVBQ0YsaUJBQWlCLFFBQVEsTUFBTSxVQUFVLE9BQU8sS0FBSztBQUFBLE1BQ3pELE1BQU0sSUFBSSxNQUNOLHNDQUFzQyxjQUMxQztBQUFBO0FBQUE7QUFBQSxPQU9GLFlBQVcsQ0FDYixXQUNBLFNBQ3dCO0FBQUEsSUFDeEIsTUFBTSxVQUFVLEtBQUssZUFBZSxJQUFJLFNBQVM7QUFBQSxJQUVqRCxJQUFJLENBQUMsU0FBUztBQUFBLE1BQ1YsTUFBTSxJQUFJLE1BQU0sc0JBQXNCLFdBQVc7QUFBQSxJQUNyRDtBQUFBLElBRUEsT0FBTyxLQUFLLGtCQUFrQixXQUFXLE9BQU87QUFBQTtBQUFBLE9BTTlDLGFBQVksQ0FBQyxXQUFrQztBQUFBLElBQ2pELE1BQU0sVUFBVSxLQUFLLGVBQWUsSUFBSSxTQUFTO0FBQUEsSUFFakQsSUFBSSxDQUFDLFNBQVM7QUFBQSxNQUNWLE1BQU0sSUFBSSxNQUFNLHNCQUFzQixXQUFXO0FBQUEsSUFDckQ7QUFBQSxJQUVBLE1BQU0sS0FBSyxtQkFBbUIsU0FBUztBQUFBLElBQ3ZDLEtBQUssZUFBZSxPQUFPLFNBQVM7QUFBQTtBQUFBLEVBTXhDLGlCQUFpQixHQUFhO0FBQUEsSUFDMUIsT0FBTyxNQUFNLEtBQUssS0FBSyxlQUFlLEtBQUssQ0FBQztBQUFBO0FBQUEsRUFNaEQsZUFBZSxDQUFDLFdBQTRCO0FBQUEsSUFDeEMsT0FBTyxLQUFLLGVBQWUsSUFBSSxTQUFTO0FBQUE7QUFBQSxPQU10QyxpQkFBZ0IsR0FBa0I7QUFBQSxJQUNwQyxNQUFNLGdCQUFnQixNQUFNLEtBQUssS0FBSyxlQUFlLEtBQUssQ0FBQyxFQUFFLElBQ3pELENBQUMsY0FDRyxLQUFLLG1CQUFtQixTQUFTLEVBQUUsTUFBTSxDQUFDLFVBQVU7QUFBQSxNQUNoRCxNQUFNLFdBQ0YsaUJBQWlCLFFBQVEsTUFBTSxVQUFVLE9BQU8sS0FBSztBQUFBLE1BQ3pELElBQUksS0FBSyx5QkFBeUI7QUFBQSxRQUM5QjtBQUFBLFFBQ0EsT0FBTztBQUFBLE1BQ1gsQ0FBQztBQUFBLEtBQ0osQ0FDVDtBQUFBLElBRUEsTUFBTSxRQUFRLElBQUksYUFBYTtBQUFBLElBQy9CLEtBQUssZUFBZSxNQUFNO0FBQUE7QUFBQSxPQU1oQix3QkFBdUIsQ0FDakMsV0FDQSxTQUNBLGlCQUMwQjtBQUFBLElBQzFCLElBQUksWUFBMEI7QUFBQSxJQUU5QixNQUFNLHlCQUNGLE9BQVEsS0FBSyxRQUFnQixTQUFTLGdCQUFnQixjQUN0RCxPQUFRLEtBQUssUUFBZ0IsT0FBTyxjQUFjO0FBQUEsSUFFdEQsU0FBUyxVQUFVLEVBQUcsV0FBVyxLQUFLLGVBQWUsV0FBVztBQUFBLE1BQzVELElBQUk7QUFBQSxRQUVBLE1BQU0sU0FBUyxJQUFJO0FBQUEsUUFDbkIsTUFBTSxTQUFTLE9BQU8sU0FBUyxVQUFVO0FBQUEsUUFHekMsSUFBSSxZQUFZO0FBQUEsUUFDaEIsTUFBTSxZQUFZLFlBQVk7QUFBQSxVQUMxQixJQUFJO0FBQUEsWUFBVztBQUFBLFVBQ2YsWUFBWTtBQUFBLFVBQ1osSUFBSTtBQUFBLFlBQ0EsTUFBTSxPQUFPLE1BQU07QUFBQSxZQUNyQixNQUFNO0FBQUE7QUFBQSxRQUlaLE1BQU0sWUFBWSxPQUFPLFFBQWlCO0FBQUEsVUFDdEMsSUFBSTtBQUFBLFlBQVc7QUFBQSxVQUNmLFlBQVk7QUFBQSxVQUNaLElBQUk7QUFBQSxZQUNBLE1BQU0sT0FBTyxNQUFNLEdBQUc7QUFBQSxZQUN4QixNQUFNO0FBQUE7QUFBQSxRQU9aLElBQUksQ0FBQyx3QkFBd0I7QUFBQSxVQUN6QixNQUFNLGdCQUFnQixLQUFLLE9BQU8sUUFBUSxPQUFPO0FBQUEsWUFDN0MsTUFBTTtBQUFBLGNBQ0YsV0FBVyxLQUFLLGtCQUFrQjtBQUFBLGNBQ2xDLE9BQU87QUFBQSxnQkFDSDtBQUFBLGtCQUNJLE1BQU07QUFBQSxrQkFDTixNQUFNO0FBQUEsZ0JBQ1Y7QUFBQSxjQUNKO0FBQUEsWUFDSjtBQUFBLFlBQ0EsTUFBTTtBQUFBLGNBQ0YsSUFBSTtBQUFBLFlBQ1I7QUFBQSxZQUNBLE9BQU87QUFBQSxjQUNILFdBQVcsS0FBSztBQUFBLFlBQ3BCO0FBQUEsVUFDSixDQUFRO0FBQUEsVUFFUixNQUFNLGtCQUFpQixZQUFZO0FBQUEsWUFDL0IsSUFBSTtBQUFBLGNBQ0EsTUFBTSxTQUFTLE1BQU07QUFBQSxjQUVyQixJQUFJLENBQUMsT0FBTyxNQUFNO0FBQUEsZ0JBQ2QsTUFBTSxJQUFJLE1BQ04sbUNBQW1DLEtBQUssVUFBVSxPQUFPLEtBQUssR0FDbEU7QUFBQSxjQUNKO0FBQUEsY0FFQSxNQUFNLFdBQVcsT0FBTztBQUFBLGNBQ3hCLE1BQU0sV0FBVyxTQUFTLE9BQU8sS0FDN0IsQ0FBQyxTQUFjLEtBQUssU0FBUyxNQUNqQztBQUFBLGNBRUEsTUFBTSxlQUNELFVBQWtCLFFBQ25CO0FBQUEsY0FHSixNQUFNLFNBQVMsS0FBSyxnQkFDaEIsY0FDQSxFQUNKO0FBQUEsY0FDQSxNQUFNLFdBQVUsSUFBSTtBQUFBLGNBQ3BCLFdBQVcsU0FBUyxRQUFRO0FBQUEsZ0JBQ3hCLE1BQU0sT0FBTyxNQUFNLFNBQVEsT0FBTyxLQUFLLENBQUM7QUFBQSxnQkFDeEMsTUFBTSxJQUFJLFFBQVEsQ0FBQyxZQUNmLFdBQVcsU0FBUyxFQUFFLENBQzFCO0FBQUEsY0FDSjtBQUFBLGNBRUEsTUFBTSxVQUFVO0FBQUEsY0FDaEIsT0FBTyxFQUFFLFNBQVMsYUFBYTtBQUFBLGNBQ2pDLE9BQU8sT0FBTztBQUFBLGNBQ1osTUFBTSxVQUFVLEtBQUs7QUFBQSxjQUNyQixNQUFNO0FBQUE7QUFBQSxhQUVYO0FBQUEsVUFFSCxPQUFPO0FBQUEsWUFDSCxRQUFRLE9BQU87QUFBQSxZQUNmLFVBQVU7QUFBQSxVQUNkO0FBQUEsUUFDSjtBQUFBLFFBR0EsTUFBTSxVQUFVLElBQUk7QUFBQSxRQUNwQixNQUFNLG1CQUFtQixJQUFJLE1BQ3pCLDZCQUE2QixLQUFLLGlCQUN0QztBQUFBLFFBQ0EsTUFBTSxtQkFBbUIsSUFBSSxNQUN6Qiw2QkFBNkIsS0FBSyxnQkFBZ0IsS0FDdEQ7QUFBQSxRQUVBLE1BQU0sYUFBYSxJQUFJO0FBQUEsUUFDdkIsSUFBSTtBQUFBLFFBQ0osSUFBSTtBQUFBLFFBQ0osSUFBSSxlQUFlO0FBQUEsUUFDbkIsSUFBSSxtQkFBbUIsS0FBSyxJQUFJO0FBQUEsUUFDaEMsSUFBSSxlQUFlO0FBQUEsUUFHbkIsTUFBTSxpQkFBaUIsTUFBTTtBQUFBLFVBQ3pCLElBQUk7QUFBQSxZQUFXLGFBQWEsU0FBUztBQUFBLFVBQ3JDLFlBQVksV0FBVyxNQUFNO0FBQUEsWUFDekIsSUFBSSxLQUFLLGtDQUFrQztBQUFBLGNBQ3ZDO0FBQUEsY0FDQSxXQUFXLEtBQUssZ0JBQWdCO0FBQUEsWUFDcEMsQ0FBQztBQUFBLFlBQ0QsSUFBSTtBQUFBLGNBQ0EsV0FBVyxNQUFNLGdCQUFnQjtBQUFBLGNBQ25DLE1BQU07QUFBQSxhQUdULEtBQUssZ0JBQWdCLENBQUM7QUFBQTtBQUFBLFFBSTdCLE1BQU0saUJBQWlCLE1BQU07QUFBQSxVQUN6QixJQUFJO0FBQUEsWUFBVyxhQUFhLFNBQVM7QUFBQSxVQUNyQyxZQUFZLFdBQVcsTUFBTTtBQUFBLFlBQ3pCLGVBQWU7QUFBQSxZQUNmLElBQUksS0FBSyxrQ0FBa0M7QUFBQSxjQUN2QztBQUFBLGNBQ0EsV0FBVyxLQUFLO0FBQUEsY0FDaEI7QUFBQSxjQUNBLG1CQUFtQixLQUFLLElBQUksSUFBSTtBQUFBLFlBQ3BDLENBQUM7QUFBQSxZQUNELElBQUk7QUFBQSxjQUNBLFdBQVcsTUFBTSxnQkFBZ0I7QUFBQSxjQUNuQyxNQUFNO0FBQUEsYUFHVCxLQUFLLGFBQWE7QUFBQTtBQUFBLFFBR3pCLE1BQU0saUJBQWlCLFlBQVk7QUFBQSxVQUMvQixJQUFJO0FBQUEsWUFDQSxlQUFlO0FBQUEsWUFDZixlQUFlO0FBQUEsWUFFZixNQUFNLGdCQUFnQixLQUFLLGtCQUFrQjtBQUFBLFlBRTdDLElBQUksTUFBTSw4QkFBOEI7QUFBQSxjQUNwQztBQUFBLGNBQ0EsZUFBZSxRQUFRO0FBQUEsY0FDdkI7QUFBQSxZQUNKLENBQUM7QUFBQSxZQUVELE1BQU8sS0FBSyxPQUFlLFFBQVEsWUFBWTtBQUFBLGNBQzNDLE1BQU07QUFBQSxnQkFDRixXQUFXO0FBQUEsZ0JBQ1gsT0FBTztBQUFBLGtCQUNIO0FBQUEsb0JBQ0ksTUFBTTtBQUFBLG9CQUNOLE1BQU07QUFBQSxrQkFDVjtBQUFBLGdCQUNKO0FBQUEsY0FDSjtBQUFBLGNBQ0EsTUFBTTtBQUFBLGdCQUNGLElBQUk7QUFBQSxjQUNSO0FBQUEsY0FDQSxPQUFPO0FBQUEsZ0JBQ0gsV0FBVyxLQUFLO0FBQUEsY0FDcEI7QUFBQSxjQUNBLFFBQVEsV0FBVztBQUFBLFlBQ3ZCLENBQUM7QUFBQSxZQUVELElBQUksTUFBTSx5QkFBeUI7QUFBQSxjQUMvQjtBQUFBLGNBQ0EsV0FBVyxLQUFLO0FBQUEsWUFDcEIsQ0FBQztBQUFBLFlBRUQsTUFBTSxlQUFlLE1BQ2pCLEtBQUssT0FDUCxNQUFNLFVBQVU7QUFBQSxjQUNkLE9BQU87QUFBQSxnQkFDSCxXQUFXLEtBQUs7QUFBQSxjQUNwQjtBQUFBLGNBQ0EsUUFBUSxXQUFXO0FBQUEsWUFDdkIsQ0FBQztBQUFBLFlBRUQsSUFBSSxzQkFBb0M7QUFBQSxZQUN4QyxJQUFJLFVBQVU7QUFBQSxZQUNkLElBQUksY0FBYztBQUFBLFlBQ2xCLElBQUksYUFBYTtBQUFBLFlBRWpCLElBQUksTUFBTSxvQ0FBb0M7QUFBQSxjQUMxQztBQUFBLFlBQ0osQ0FBQztBQUFBLFlBRUQsaUJBQWlCLFNBQVMsYUFBYSxRQUErQjtBQUFBLGNBQ2xFO0FBQUEsY0FHQSxJQUFJLE1BQU0sa0JBQWtCO0FBQUEsZ0JBQ3hCO0FBQUEsZ0JBQ0EsV0FBVyxPQUFPO0FBQUEsZ0JBQ2xCO0FBQUEsZ0JBQ0EsZUFBZSxDQUFDLENBQUMsT0FBTztBQUFBLGdCQUN4QixtQkFBbUIsV0FBVyxPQUFPO0FBQUEsY0FDekMsQ0FBQztBQUFBLGNBRUQsSUFBSSxXQUFXLE9BQU8sU0FBUztBQUFBLGdCQUMzQixJQUFJLE1BQ0EsMkNBQ0E7QUFBQSxrQkFDSTtBQUFBLGtCQUNBO0FBQUEsZ0JBQ0osQ0FDSjtBQUFBLGdCQUNBO0FBQUEsY0FDSjtBQUFBLGNBRUEsSUFBSSxDQUFDLFNBQVMsT0FBTyxVQUFVLFVBQVU7QUFBQSxnQkFDckMsSUFBSSxNQUFNLDZCQUE2QjtBQUFBLGtCQUNuQztBQUFBLGtCQUNBO0FBQUEsZ0JBQ0osQ0FBQztBQUFBLGdCQUNEO0FBQUEsY0FDSjtBQUFBLGNBRUEsSUFBSSxNQUFNLFNBQVMsbUJBQW1CO0FBQUEsZ0JBQ2xDLE1BQU0sT0FBUSxNQUFjLFlBQVk7QUFBQSxnQkFFeEMsSUFBSSxNQUFNLHlCQUF5QjtBQUFBLGtCQUMvQjtBQUFBLGtCQUNBO0FBQUEsa0JBQ0EsVUFBVSxNQUFNO0FBQUEsa0JBQ2hCLGVBQWUsTUFBTTtBQUFBLGtCQUNyQixjQUFjLE1BQU07QUFBQSxrQkFDcEIsUUFBUSxNQUFNO0FBQUEsa0JBQ2QsbUJBQ0ksTUFBTSxjQUFjO0FBQUEsa0JBQ3hCLGFBQWEsTUFBTSxTQUFTO0FBQUEsa0JBQzVCLGVBQ0ksTUFBTSxhQUFhO0FBQUEsZ0JBQzNCLENBQUM7QUFBQSxnQkFHRCxJQUNJLE1BQU0sU0FBUyxlQUNmLE1BQU0sY0FBYyxhQUNwQixNQUFNLGFBQWEsZUFDckI7QUFBQSxrQkFDRSxzQkFBcUIsS0FBSztBQUFBLGtCQUMxQixJQUFJLE1BQ0EsdURBQ0E7QUFBQSxvQkFDSTtBQUFBLG9CQUNBO0FBQUEsa0JBQ0osQ0FDSjtBQUFBLGdCQUNKLEVBSUssU0FDRCxDQUFDLHVCQUNELE1BQU0sU0FBUyxlQUNmLE1BQU0sY0FBYyxXQUN0QjtBQUFBLGtCQUNFLElBQUksTUFDQSxxRUFDQTtBQUFBLG9CQUNJO0FBQUEsb0JBQ0Esb0JBQW9CLEtBQUs7QUFBQSxvQkFDekIsY0FBYyxNQUFNO0FBQUEsb0JBQ3BCO0FBQUEsa0JBQ0osQ0FDSjtBQUFBLGtCQUNBLHNCQUFxQixLQUFLO0FBQUEsZ0JBQzlCO0FBQUEsZ0JBSUEsSUFDSSxNQUFNLFNBQVMsZUFDZixNQUFNLGNBQWMsV0FDdEI7QUFBQSxrQkFDRSxtQkFBbUIsS0FBSyxJQUFJO0FBQUEsa0JBQzVCLGVBQWU7QUFBQSxnQkFDbkI7QUFBQSxnQkFFQSxJQUNJLHVCQUNBLE1BQU0sT0FBTyxxQkFDZjtBQUFBLGtCQUNFLElBQUksTUFBTSxPQUFPO0FBQUEsb0JBQ2IsTUFBTSxVQUNGLEtBQUssTUFBTSxRQUFRO0FBQUEsb0JBQ3ZCLE1BQU0sU0FDRixLQUFLLE1BQU0sTUFBTSxXQUNqQixLQUFLLFVBQ0QsS0FBSyxNQUFNLFFBQVEsQ0FBQyxDQUN4QjtBQUFBLG9CQUNKLElBQUksTUFDQSw4QkFDQTtBQUFBLHNCQUNJO0FBQUEsc0JBQ0EsV0FBVztBQUFBLHNCQUNYLGNBQWM7QUFBQSxvQkFDbEIsQ0FDSjtBQUFBLG9CQUNBLE1BQU0sSUFBSSxNQUNOLEdBQUcsWUFBWSxRQUNuQjtBQUFBLGtCQUNKO0FBQUEsa0JBRUEsSUFBSSxNQUFNLE1BQU0sV0FBVztBQUFBLG9CQUN2QixJQUFJLE1BQ0EsK0JBQ0E7QUFBQSxzQkFDSTtBQUFBLHNCQUNBO0FBQUEsc0JBQ0EsYUFDSSxLQUFLLEtBQUs7QUFBQSxvQkFDbEIsQ0FDSjtBQUFBLG9CQUNBO0FBQUEsa0JBQ0o7QUFBQSxnQkFDSjtBQUFBLGdCQUVBO0FBQUEsY0FDSjtBQUFBLGNBRUEsSUFBSSxNQUFNLFNBQVMsd0JBQXdCO0FBQUEsZ0JBRXZDLE1BQU0sT0FBUSxNQUFjLFlBQ3RCO0FBQUEsZ0JBRU4sSUFBSSxNQUFNLHdCQUF3QjtBQUFBLGtCQUM5QjtBQUFBLGtCQUNBO0FBQUEsa0JBQ0EsU0FBUyxDQUFDLENBQUM7QUFBQSxrQkFDWCxVQUFVLE1BQU07QUFBQSxrQkFDaEIsZUFBZSxNQUFNO0FBQUEsa0JBQ3JCLGVBQWUsTUFBTTtBQUFBLGtCQUNyQjtBQUFBLGtCQUNBLFlBQ0ksdUJBQ0EsTUFBTSxjQUFjLGFBQ3BCLE1BQU0sY0FBYztBQUFBLGdCQUM1QixDQUFDO0FBQUEsZ0JBRUQsSUFBSSxDQUFDO0FBQUEsa0JBQW9CO0FBQUEsZ0JBR3pCLElBQUksTUFBTSxTQUFTLFVBQVUsaUJBQWlCO0FBQUEsa0JBQzFDLE1BQU0sU0FDRixLQUFLLFVBQ0wsS0FBSyxNQUNMLFFBQVE7QUFBQSxrQkFDWixNQUFNLFdBQ0YsS0FBSyxZQUFZLEtBQUssUUFBUTtBQUFBLGtCQUNsQyxNQUFNLFlBQ0YsS0FBSyxTQUFTLEtBQUssY0FBYyxDQUFDO0FBQUEsa0JBR3RDLE1BQU0sb0JBQ0YsZ0JBQWdCLFVBQ1osQ0FBQyxNQUFNLEVBQUUsT0FBTyxNQUNwQjtBQUFBLGtCQUNKLE1BQU0sTUFBTSxJQUFJLEtBQUssRUFBRSxZQUFZO0FBQUEsa0JBRW5DLElBQUkscUJBQXFCLEdBQUc7QUFBQSxvQkFFeEIsTUFBTSxXQUNGLGdCQUFnQjtBQUFBLG9CQUNwQixTQUFTLFNBQ0wsS0FBSyxVQUNMLEtBQUssVUFDTCxTQUFTO0FBQUEsb0JBQ2IsU0FBUyxTQUNMLEtBQUssV0FBVyxVQUNWLFVBQ0E7QUFBQSxvQkFDVixTQUFTLFFBQ0wsS0FBSyxTQUFTLFNBQVM7QUFBQSxvQkFDM0IsU0FBUyxjQUNMLEtBQUssZUFBZTtBQUFBLG9CQUV4QixJQUFJLE1BQU0sMkJBQTJCO0FBQUEsc0JBQ2pDO0FBQUEsc0JBQ0E7QUFBQSxzQkFDQTtBQUFBLHNCQUNBLFFBQVEsU0FBUztBQUFBLG9CQUNyQixDQUFDO0FBQUEsa0JBQ0wsRUFBTztBQUFBLG9CQUVILE1BQU0saUJBQWlCO0FBQUEsc0JBQ25CLElBQUk7QUFBQSxzQkFDSixNQUFNO0FBQUEsc0JBQ04sT0FBTztBQUFBLHNCQUNQLFFBQVEsS0FBSyxVQUFVLEtBQUs7QUFBQSxzQkFDNUIsUUFDSSxLQUFLLFdBQVcsVUFDVCxVQUNBO0FBQUEsc0JBQ1gsT0FBTyxLQUFLO0FBQUEsc0JBQ1osV0FBVyxLQUFLLGFBQWE7QUFBQSxzQkFDN0IsYUFBYSxLQUFLO0FBQUEsb0JBQ3RCO0FBQUEsb0JBQ0EsZ0JBQWdCLEtBQUssY0FBYztBQUFBLG9CQUVuQyxJQUFJLE1BQU0sMkJBQTJCO0FBQUEsc0JBQ2pDO0FBQUEsc0JBQ0E7QUFBQSxzQkFDQTtBQUFBLHNCQUNBLE9BQU8sS0FBSyxVQUNSLFNBQ0osRUFBRSxNQUFNLEdBQUcsR0FBRztBQUFBLG9CQUNsQixDQUFDO0FBQUE7QUFBQSxrQkFLTCxJQUNJLEtBQUssY0FBYyxhQUNuQixLQUFLLGNBQWMscUJBQ3JCLENBRUYsRUFBTztBQUFBLG9CQUVILG1CQUFtQixLQUFLLElBQUk7QUFBQSxvQkFDNUIsZUFBZTtBQUFBO0FBQUEsa0JBR25CO0FBQUEsZ0JBQ0o7QUFBQSxnQkFFQSxJQUFJLENBQUMsUUFBUSxLQUFLLFNBQVM7QUFBQSxrQkFBUTtBQUFBLGdCQUNuQyxJQUFJLEtBQUssY0FBYztBQUFBLGtCQUFXO0FBQUEsZ0JBQ2xDLElBQUksS0FBSyxjQUFjO0FBQUEsa0JBQ25CO0FBQUEsZ0JBRUosTUFBTSxXQUFZLE1BQWMsWUFDMUI7QUFBQSxnQkFFTixJQUFJO0FBQUEsZ0JBS0osSUFBSSxPQUFPLEtBQUssU0FBUyxVQUFVO0FBQUEsa0JBQy9CLE1BQU0sT0FBTyxLQUFLO0FBQUEsa0JBRWxCLElBQUksS0FBSyxXQUFXLFdBQVcsR0FBRztBQUFBLG9CQUM5QixZQUFZLEtBQUssTUFDYixZQUFZLE1BQ2hCO0FBQUEsb0JBQ0EsY0FBYztBQUFBLGtCQUNsQixFQUFPLFNBQUksWUFBWSxXQUFXLElBQUksR0FBRztBQUFBLG9CQUVyQyxZQUFZO0FBQUEsa0JBQ2hCLEVBQU87QUFBQSxvQkFFSCxZQUFZO0FBQUEsb0JBQ1osZUFBZTtBQUFBO0FBQUEsZ0JBRXZCLEVBQU8sU0FBSSxPQUFPLGFBQWEsVUFBVTtBQUFBLGtCQUNyQyxZQUFZO0FBQUEsa0JBQ1osZUFBZTtBQUFBLGdCQUNuQjtBQUFBLGdCQUVBLElBQUksQ0FBQztBQUFBLGtCQUFXO0FBQUEsZ0JBR2hCLG1CQUFtQixLQUFLLElBQUk7QUFBQSxnQkFDNUIsZ0JBQWdCLFVBQVU7QUFBQSxnQkFDMUIsZUFBZTtBQUFBLGdCQUVmLElBQUksTUFBTSwyQkFBMkI7QUFBQSxrQkFDakM7QUFBQSxrQkFDQSxhQUFhLFVBQVU7QUFBQSxrQkFDdkIsbUJBQW1CO0FBQUEsa0JBQ25CLGVBQWUsUUFBUTtBQUFBLGdCQUMzQixDQUFDO0FBQUEsZ0JBRUQsV0FBVztBQUFBLGdCQUNYLE1BQU0sT0FBTyxNQUFNLFFBQVEsT0FBTyxTQUFTLENBQUM7QUFBQSxjQUNoRDtBQUFBLFlBQ0o7QUFBQSxZQUVBLElBQUksTUFBTSxzQkFBc0I7QUFBQSxjQUM1QjtBQUFBLGNBQ0E7QUFBQSxjQUNBLG1CQUFtQjtBQUFBLGNBQ25CLGVBQWUsUUFBUTtBQUFBLGNBQ3ZCLG1CQUFtQixXQUFXLE9BQU87QUFBQSxjQUNyQztBQUFBLGNBQ0EseUJBQXlCLENBQUMsQ0FBQztBQUFBLFlBQy9CLENBQUM7QUFBQSxZQUVELE1BQU0sVUFBVTtBQUFBLFlBQ2hCLE9BQU87QUFBQSxjQUNILFNBQVMsV0FBVztBQUFBLGNBQ3BCLGFBQWE7QUFBQSxnQkFDVDtBQUFBLGdCQUNBLGVBQWUsUUFBUTtBQUFBLGdCQUN2QjtBQUFBLGdCQUNBLHlCQUF5QixDQUFDLENBQUM7QUFBQSxnQkFDM0I7QUFBQSxjQUNKO0FBQUEsWUFDSjtBQUFBLFlBQ0YsT0FBTyxPQUFPO0FBQUEsWUFDWixJQUFJLE1BQU0sd0JBQXdCO0FBQUEsY0FDOUI7QUFBQSxjQUNBLE9BQ0ksaUJBQWlCLFFBQ1gsTUFBTSxVQUNOLE9BQU8sS0FBSztBQUFBLGNBQ3RCLG1CQUFtQixXQUFXLE9BQU87QUFBQSxjQUNyQztBQUFBLGNBQ0E7QUFBQSxjQUNBLHlCQUF5QixDQUFDLENBQUM7QUFBQSxZQUMvQixDQUFDO0FBQUEsWUFFRCxJQUFJLFdBQVcsT0FBTyxTQUFTO0FBQUEsY0FDM0IsTUFBTSxVQUFVLGdCQUFnQjtBQUFBLGNBQ2hDLE1BQU07QUFBQSxZQUNWO0FBQUEsWUFDQSxNQUFNLFVBQVUsS0FBSztBQUFBLFlBQ3JCLE1BQU07QUFBQSxvQkFDUjtBQUFBLFlBQ0UsSUFBSTtBQUFBLGNBQVcsYUFBYSxTQUFTO0FBQUEsWUFDckMsSUFBSTtBQUFBLGNBQVcsYUFBYSxTQUFTO0FBQUEsWUFDckMsSUFBSTtBQUFBLGNBQ0EsSUFBSSxDQUFDLFdBQVcsT0FBTztBQUFBLGdCQUFTLFdBQVcsTUFBTTtBQUFBLGNBQ25ELE1BQU07QUFBQTtBQUFBLFdBSWI7QUFBQSxRQUVILE9BQU87QUFBQSxVQUNILFFBQVEsT0FBTztBQUFBLFVBQ2YsVUFBVTtBQUFBLFFBQ2Q7QUFBQSxRQUNGLE9BQU8sT0FBTztBQUFBLFFBQ1osWUFDSSxpQkFBaUIsUUFBUSxRQUFRLElBQUksTUFBTSxPQUFPLEtBQUssQ0FBQztBQUFBLFFBRTVELE1BQU0sY0FBYyxLQUFLLGlCQUFpQixTQUFTO0FBQUEsUUFFbkQsSUFBSSxZQUFZLEtBQUssZUFBZTtBQUFBLFVBQ2hDO0FBQUEsUUFDSjtBQUFBLFFBRUEsTUFBTSxRQUFRLEtBQUssZ0JBQWdCLFNBQVMsV0FBVztBQUFBLFFBRXZELElBQUksS0FBSyxxQ0FBcUM7QUFBQSxVQUMxQztBQUFBLFVBQ0EsZUFBZSxLQUFLO0FBQUEsVUFDcEIsU0FBUztBQUFBLFVBQ1Q7QUFBQSxVQUNBLE9BQU8sVUFBVTtBQUFBLFFBQ3JCLENBQUM7QUFBQSxRQUVELE1BQU0sSUFBSSxRQUFRLENBQUMsWUFBWSxXQUFXLFNBQVMsS0FBSyxDQUFDO0FBQUE7QUFBQSxJQUVqRTtBQUFBLElBRUEsTUFBTSxJQUFJLE1BQ04sa0NBQWtDLEtBQUssMkJBQTJCLFdBQVcsV0FBVyxpQkFDNUY7QUFBQTtBQUFBLEVBTUksZUFBZSxDQUFDLE1BQWMsV0FBNkI7QUFBQSxJQUMvRCxNQUFNLFNBQW1CLENBQUM7QUFBQSxJQUMxQixTQUFTLElBQUksRUFBRyxJQUFJLEtBQUssUUFBUSxLQUFLLFdBQVc7QUFBQSxNQUM3QyxPQUFPLEtBQUssS0FBSyxNQUFNLEdBQUcsSUFBSSxTQUFTLENBQUM7QUFBQSxJQUM1QztBQUFBLElBQ0EsT0FBTyxPQUFPLFNBQVMsSUFBSSxTQUFTLENBQUMsSUFBSTtBQUFBO0FBQUEsT0FNL0Isa0JBQWlCLENBQzNCLFdBQ0EsU0FDd0I7QUFBQSxJQUN4QixJQUFJLFlBQTBCO0FBQUEsSUFFOUIsU0FBUyxVQUFVLEVBQUcsV0FBVyxLQUFLLGVBQWUsV0FBVztBQUFBLE1BQzVELElBQUk7QUFBQSxRQUNBLE1BQU0sZUFBZSxJQUFJLE1BQ3JCLHdCQUF3QixLQUFLLGlCQUNqQztBQUFBLFFBRUEsTUFBTSxhQUFhLElBQUk7QUFBQSxRQUN2QixNQUFNLFFBQVEsV0FBVyxNQUFNO0FBQUEsVUFDM0IsSUFBSTtBQUFBLFlBQ0EsV0FBVyxNQUFNLFlBQVk7QUFBQSxZQUMvQixNQUFNO0FBQUEsV0FHVCxLQUFLLGFBQWE7QUFBQSxRQUVyQixJQUFJO0FBQUEsUUFDSixJQUFJO0FBQUEsVUFDQSxTQUFTLE1BQU0sS0FBSyxPQUFPLFFBQVEsT0FBTztBQUFBLFlBQ3RDLE1BQU07QUFBQSxjQUNGLFdBQVcsS0FBSyxrQkFBa0I7QUFBQSxjQUNsQyxPQUFPO0FBQUEsZ0JBQ0g7QUFBQSxrQkFDSSxNQUFNO0FBQUEsa0JBQ04sTUFBTTtBQUFBLGdCQUNWO0FBQUEsY0FDSjtBQUFBLFlBQ0o7QUFBQSxZQUNBLE1BQU07QUFBQSxjQUNGLElBQUk7QUFBQSxZQUNSO0FBQUEsWUFDQSxPQUFPO0FBQUEsY0FDSCxXQUFXLEtBQUs7QUFBQSxZQUNwQjtBQUFBLFlBQ0EsUUFBUSxXQUFXO0FBQUEsVUFDdkIsQ0FBUTtBQUFBLFVBQ1YsT0FBTyxPQUFPO0FBQUEsVUFDWixJQUFJLFdBQVcsT0FBTyxTQUFTO0FBQUEsWUFDM0IsTUFBTTtBQUFBLFVBQ1Y7QUFBQSxVQUNBLE1BQU07QUFBQSxrQkFDUjtBQUFBLFVBQ0UsYUFBYSxLQUFLO0FBQUE7QUFBQSxRQUd0QixJQUFJLENBQUMsT0FBTyxNQUFNO0FBQUEsVUFDZCxNQUFNLElBQUksTUFDTixtQ0FBbUMsS0FBSyxVQUFVLE9BQU8sS0FBSyxHQUNsRTtBQUFBLFFBQ0o7QUFBQSxRQUdBLE1BQU0sV0FBVyxPQUFPO0FBQUEsUUFHeEIsTUFBTSxXQUFXLFNBQVMsT0FBTyxLQUM3QixDQUFDLFNBQWMsS0FBSyxTQUFTLE1BQ2pDO0FBQUEsUUFDQSxPQUFPLEVBQUUsU0FBUyxVQUFVLFFBQVEsc0JBQXNCO0FBQUEsUUFDNUQsT0FBTyxPQUFPO0FBQUEsUUFDWixZQUNJLGlCQUFpQixRQUFRLFFBQVEsSUFBSSxNQUFNLE9BQU8sS0FBSyxDQUFDO0FBQUEsUUFHNUQsTUFBTSxjQUFjLEtBQUssaUJBQWlCLFNBQVM7QUFBQSxRQUVuRCxJQUFJLFlBQVksS0FBSyxlQUFlO0FBQUEsVUFDaEM7QUFBQSxRQUNKO0FBQUEsUUFHQSxNQUFNLFFBQVEsS0FBSyxnQkFBZ0IsU0FBUyxXQUFXO0FBQUEsUUFFdkQsSUFBSSxLQUFLLHFDQUFxQztBQUFBLFVBQzFDO0FBQUEsVUFDQSxlQUFlLEtBQUs7QUFBQSxVQUNwQixTQUFTO0FBQUEsVUFDVDtBQUFBLFVBQ0EsT0FBTyxVQUFVO0FBQUEsUUFDckIsQ0FBQztBQUFBLFFBRUQsTUFBTSxJQUFJLFFBQVEsQ0FBQyxZQUFZLFdBQVcsU0FBUyxLQUFLLENBQUM7QUFBQTtBQUFBLElBRWpFO0FBQUEsSUFFQSxNQUFNLElBQUksTUFDTixnQ0FBZ0MsS0FBSywyQkFBMkIsV0FBVyxXQUFXLGlCQUMxRjtBQUFBO0FBQUEsRUFNSSxnQkFBZ0IsQ0FBQyxPQUF1QjtBQUFBLElBQzVDLE1BQU0sTUFBTTtBQUFBLElBQ1osT0FDSSxJQUFJLFdBQVcsT0FDZix3Q0FBd0MsS0FBSyxNQUFNLE9BQU87QUFBQTtBQUFBLEVBTzFELGVBQWUsQ0FBQyxTQUFpQixhQUE4QjtBQUFBLElBQ25FLE1BQU0sT0FBTyxjQUFjLE9BQU87QUFBQSxJQUNsQyxNQUFNLGNBQWMsT0FBTyxNQUFNLFVBQVU7QUFBQSxJQUMzQyxNQUFNLFNBQVMsS0FBSyxPQUFPLElBQUk7QUFBQSxJQUMvQixPQUFPLEtBQUssSUFBSSxjQUFjLFFBQVEsS0FBSztBQUFBO0FBQUEsT0FNakMsbUJBQWtCLENBQUMsV0FBa0M7QUFBQSxJQUMvRCxJQUFJO0FBQUEsTUFJQSxJQUFJLE1BQU0sa0JBQWtCLEVBQUUsVUFBVSxDQUFDO0FBQUEsTUFDM0MsT0FBTyxPQUFPO0FBQUEsTUFDWixNQUFNLGVBQ0YsaUJBQWlCLFFBQVEsTUFBTSxVQUFVLE9BQU8sS0FBSztBQUFBLE1BQ3pELElBQUksS0FBSywyQkFBMkI7QUFBQSxRQUNoQztBQUFBLFFBQ0EsT0FBTztBQUFBLE1BQ1gsQ0FBQztBQUFBO0FBQUE7QUFBQSxFQU9ELGlCQUFpQixHQUFXO0FBQUEsSUFDaEMsT0FBTyxXQUFXLEtBQUssSUFBSSxLQUFLLEtBQUssT0FBTyxFQUFFLFNBQVMsRUFBRSxFQUFFLE9BQU8sR0FBRyxDQUFDO0FBQUE7QUFBQSxFQU9sRSxpQkFBaUIsR0FBVztBQUFBLElBQ2hDLE9BQU8sT0FBTyxLQUFLLElBQUksS0FBSyxLQUFLLE9BQU8sRUFBRSxTQUFTLEVBQUUsRUFBRSxVQUFVLEdBQUcsQ0FBQztBQUFBO0FBQUEsT0FNbkUsUUFBTyxHQUFrQjtBQUFBLElBQzNCLElBQUk7QUFBQSxNQUNBLElBQUksTUFBTSx1QkFBdUI7QUFBQSxRQUM3QixnQkFBZ0IsS0FBSyxlQUFlO0FBQUEsUUFDcEMsV0FBVyxDQUFDLENBQUMsS0FBSztBQUFBLE1BQ3RCLENBQUM7QUFBQSxNQUdELE1BQU0sS0FBSyxpQkFBaUI7QUFBQSxNQUc1QixJQUFJLEtBQUssUUFBUTtBQUFBLFFBQ2IsSUFBSSxLQUFLLGlDQUFpQztBQUFBLFFBQzFDLElBQUk7QUFBQSxVQUNBLEtBQUssT0FBTyxNQUFNO0FBQUEsVUFDbEIsS0FBSyxTQUFTO0FBQUEsVUFDZCxJQUFJLEtBQUsscUNBQXFDO0FBQUEsVUFDaEQsT0FBTyxPQUFPO0FBQUEsVUFDWixNQUFNLFdBQ0YsaUJBQWlCLFFBQVEsTUFBTSxVQUFVLE9BQU8sS0FBSztBQUFBLFVBQ3pELElBQUksTUFBTSxpQ0FBaUM7QUFBQSxZQUN2QyxPQUFPO0FBQUEsVUFDWCxDQUFDO0FBQUE7QUFBQSxNQUVULEVBQU87QUFBQSxRQUNILElBQUksTUFDQSwyREFDSjtBQUFBO0FBQUEsTUFHSixJQUFJLEtBQUssa0JBQWtCO0FBQUEsTUFDM0I7QUFBQSxNQUNGLE9BQU8sT0FBTztBQUFBLE1BQ1osTUFBTSxXQUNGLGlCQUFpQixRQUFRLE1BQU0sVUFBVSxPQUFPLEtBQUs7QUFBQSxNQUN6RCxJQUFJLE1BQU0sd0NBQXdDO0FBQUEsUUFDOUMsT0FBTztBQUFBLE1BQ1gsQ0FBQztBQUFBLE1BQ0Q7QUFBQTtBQUFBO0FBR1o7OztBZXZyQ0E7QUFFTyxJQUFVO0FBQUEsQ0FBVixDQUFVLE9BQVY7QUFBQSxFQUNVLFdBQVE7QUFBQSxJQUVqQixnQkFBZ0I7QUFBQSxJQUNoQixxQkFBcUI7QUFBQSxJQUNyQixVQUFVO0FBQUEsSUFDVixlQUFlO0FBQUEsSUFDZixhQUFhO0FBQUEsSUFDYixrQkFBa0I7QUFBQSxJQUNsQixjQUFjO0FBQUEsSUFDZCxtQkFBbUI7QUFBQSxJQUNuQixhQUFhO0FBQUEsSUFDYixrQkFBa0I7QUFBQSxJQUNsQixjQUFjO0FBQUEsSUFDZCxtQkFBbUI7QUFBQSxJQUNuQixXQUFXO0FBQUEsSUFDWCxnQkFBZ0I7QUFBQSxFQUNwQjtBQUFBLEVBRU8sU0FBUyxPQUFPLElBQUksU0FBeUI7QUFBQSxJQUNoRCxRQUFRLE9BQU8sTUFBTSxRQUFRLEtBQUssR0FBRyxJQUFJLEdBQUc7QUFBQTtBQUFBLEVBRHpDLEdBQVM7QUFBQSxFQUlULFNBQVMsS0FBSyxJQUFJLFNBQXlCO0FBQUEsSUFDOUMsUUFBUSxPQUFPLE1BQU0sUUFBUSxLQUFLLEdBQUcsQ0FBQztBQUFBO0FBQUEsRUFEbkMsR0FBUztBQUFBLEVBSVQsU0FBUyxLQUFLLENBQUMsU0FBdUI7QUFBQSxJQUN6QyxRQUNJLEdBQUcsU0FBTSwwQkFBMEIsU0FBTSxjQUFjLFNBQzNEO0FBQUE7QUFBQSxFQUhHLEdBQVM7QUFBQSxFQU1ULFNBQVMsT0FBTyxDQUFDLFNBQXVCO0FBQUEsSUFDM0MsUUFBUSxHQUFHLFNBQU0sc0JBQXFCLFNBQU0sY0FBYyxTQUFTO0FBQUE7QUFBQSxFQURoRSxHQUFTO0FBQUEsRUFJVCxTQUFTLElBQUksQ0FBQyxTQUF1QjtBQUFBLElBQ3hDLFFBQVEsR0FBRyxTQUFNLG1CQUFrQixTQUFNLGNBQWMsU0FBUztBQUFBO0FBQUEsRUFEN0QsR0FBUztBQUFBLEVBSVQsU0FBUyxJQUFJLENBQUMsU0FBdUI7QUFBQSxJQUN4QyxRQUFRLEdBQUcsU0FBTSxzQkFBc0IsU0FBTSxjQUFjLFNBQVM7QUFBQTtBQUFBLEVBRGpFLEdBQVM7QUFBQSxFQUlULFNBQVMsTUFBTSxDQUFDLE9BQXFCO0FBQUEsSUFDeEMsUUFBUTtBQUFBLElBQ1IsUUFBUSxTQUFNLHNCQUFzQixRQUFRLFNBQU0sV0FBVztBQUFBLElBQzdELFFBQVEsU0FBTSxXQUFXLElBQUcsT0FBTyxFQUFFLElBQUksU0FBTSxXQUFXO0FBQUE7QUFBQSxFQUh2RCxHQUFTO0FBQUEsR0E3Q0g7OztBQ01qQixJQUFNLHNCQUFzQjtBQUFBLEVBQ3hCLE9BQU8sQ0FBQyxTQUFTLE9BQU8sU0FBUyxPQUFPLFNBQVMsV0FBVyxjQUFjO0FBQUEsRUFDMUUsUUFBUTtBQUFBLElBQ0o7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0o7QUFBQSxFQUNBLFVBQVU7QUFBQSxJQUNOO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNKO0FBQUEsRUFDQSxXQUFXLENBQUMsYUFBYSxTQUFTLFVBQVUsV0FBVyxTQUFTLE1BQU07QUFBQSxFQUN0RSxTQUFTLENBQUMsV0FBVyxhQUFhLGFBQWEsWUFBWSxlQUFlO0FBQzlFO0FBS0EsSUFBTSxrQkFBNEM7QUFBQSxFQUM5QyxVQUFVO0FBQUEsSUFDTjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0o7QUFBQSxFQUNBLFVBQVU7QUFBQSxJQUNOO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNKO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDTDtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0o7QUFBQSxFQUNBLFVBQVU7QUFBQSxJQUNOO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0o7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNKO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNKO0FBQUEsRUFDQSxjQUFjO0FBQUEsSUFDVjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0o7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNMO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEs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
