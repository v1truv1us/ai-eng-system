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
export {
  OpenCodeClient
};

//# debugId=B4115646D0E56BE164756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2JhY2tlbmRzL29wZW5jb2RlL2NsaWVudC50cyIsICIuLi9ub2RlX21vZHVsZXMvQG9wZW5jb2RlLWFpL3Nkay9kaXN0L2dlbi9jb3JlL3NlcnZlclNlbnRFdmVudHMuZ2VuLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9Ab3BlbmNvZGUtYWkvc2RrL2Rpc3QvZ2VuL2NvcmUvYXV0aC5nZW4uanMiLCAiLi4vbm9kZV9tb2R1bGVzL0BvcGVuY29kZS1haS9zZGsvZGlzdC9nZW4vY29yZS9ib2R5U2VyaWFsaXplci5nZW4uanMiLCAiLi4vbm9kZV9tb2R1bGVzL0BvcGVuY29kZS1haS9zZGsvZGlzdC9nZW4vY29yZS9wYXRoU2VyaWFsaXplci5nZW4uanMiLCAiLi4vbm9kZV9tb2R1bGVzL0BvcGVuY29kZS1haS9zZGsvZGlzdC9nZW4vY29yZS91dGlscy5nZW4uanMiLCAiLi4vbm9kZV9tb2R1bGVzL0BvcGVuY29kZS1haS9zZGsvZGlzdC9nZW4vY2xpZW50L3V0aWxzLmdlbi5qcyIsICIuLi9ub2RlX21vZHVsZXMvQG9wZW5jb2RlLWFpL3Nkay9kaXN0L2dlbi9jbGllbnQvY2xpZW50Lmdlbi5qcyIsICIuLi9ub2RlX21vZHVsZXMvQG9wZW5jb2RlLWFpL3Nkay9kaXN0L2dlbi9jb3JlL3BhcmFtcy5nZW4uanMiLCAiLi4vbm9kZV9tb2R1bGVzL0BvcGVuY29kZS1haS9zZGsvZGlzdC9nZW4vY2xpZW50Lmdlbi5qcyIsICIuLi9ub2RlX21vZHVsZXMvQG9wZW5jb2RlLWFpL3Nkay9kaXN0L2dlbi9zZGsuZ2VuLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9Ab3BlbmNvZGUtYWkvc2RrL2Rpc3QvY2xpZW50LmpzIiwgIi4uL25vZGVfbW9kdWxlcy9Ab3BlbmNvZGUtYWkvc2RrL2Rpc3Qvc2VydmVyLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9Ab3BlbmNvZGUtYWkvc2RrL2Rpc3QvaW5kZXguanMiLCAiLi4vc3JjL3V0aWwvbG9nLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWwogICAgIi8qKlxuICogT3BlbkNvZGUgU0RLIEJhY2tlbmQgV3JhcHBlclxuICpcbiAqIFByb3ZpZGVzIHNlc3Npb24gbWFuYWdlbWVudCBhbmQgbWVzc2FnZSBzZW5kaW5nIGNhcGFiaWxpdGllc1xuICogZm9yIGFpLWVuZyByYWxwaCBydW5uZXIgdXNpbmcgT3BlbkNvZGUgU0RLLlxuICovXG5cbmltcG9ydCB7IGNyZWF0ZVNlcnZlciB9IGZyb20gXCJub2RlOm5ldFwiO1xuaW1wb3J0IHtcbiAgICB0eXBlIE9wZW5jb2RlQ2xpZW50LFxuICAgIGNyZWF0ZU9wZW5jb2RlLFxuICAgIGNyZWF0ZU9wZW5jb2RlQ2xpZW50LFxufSBmcm9tIFwiQG9wZW5jb2RlLWFpL3Nka1wiO1xuaW1wb3J0IHsgTG9nIH0gZnJvbSBcIi4uLy4uL3V0aWwvbG9nXCI7XG5cbmNvbnN0IGxvZyA9IExvZy5jcmVhdGUoeyBzZXJ2aWNlOiBcIm9wZW5jb2RlLWNsaWVudFwiIH0pO1xuXG4vKipcbiAqIFJlc3BvbnNlIGludGVyZmFjZSBmb3IgbWVzc2FnZXNcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBNZXNzYWdlUmVzcG9uc2Uge1xuICAgIGNvbnRlbnQ6IHN0cmluZztcbn1cblxuLyoqXG4gKiBTdHJlYW1pbmcgcmVzcG9uc2UgaW50ZXJmYWNlXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU3RyZWFtaW5nUmVzcG9uc2Uge1xuICAgIC8qKiBSZWFkYWJsZSBzdHJlYW0gb2YgcmVzcG9uc2UgY2h1bmtzICovXG4gICAgc3RyZWFtOiBSZWFkYWJsZVN0cmVhbTxVaW50OEFycmF5PjtcbiAgICAvKiogUHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGNvbXBsZXRlIHJlc3BvbnNlIHdoZW4gc3RyZWFtIGVuZHMgKi9cbiAgICBjb21wbGV0ZTogUHJvbWlzZTxNZXNzYWdlUmVzcG9uc2U+O1xufVxuXG4vKipcbiAqIFNlc3Npb24gaW50ZXJmYWNlIGZvciBhaS1lbmcgcnVubmVyXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU2Vzc2lvbiB7XG4gICAgaWQ6IHN0cmluZztcbiAgICBzZW5kTWVzc2FnZTogKG1lc3NhZ2U6IHN0cmluZykgPT4gUHJvbWlzZTxNZXNzYWdlUmVzcG9uc2U+O1xuICAgIHNlbmRNZXNzYWdlU3RyZWFtOiAobWVzc2FnZTogc3RyaW5nKSA9PiBQcm9taXNlPFN0cmVhbWluZ1Jlc3BvbnNlPjtcbiAgICBjbG9zZTogKCkgPT4gUHJvbWlzZTx2b2lkPjtcbiAgICAvKiogVG9vbCBpbnZvY2F0aW9ucyBjYXB0dXJlZCBkdXJpbmcgdGhpcyBzZXNzaW9uICovXG4gICAgX3Rvb2xJbnZvY2F0aW9ucz86IEFycmF5PHtcbiAgICAgICAgaWQ6IHN0cmluZztcbiAgICAgICAgbmFtZTogc3RyaW5nO1xuICAgICAgICBpbnB1dD86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgICAgICBvdXRwdXQ/OiBzdHJpbmc7XG4gICAgICAgIHN0YXR1czogXCJva1wiIHwgXCJlcnJvclwiO1xuICAgICAgICBlcnJvcj86IHN0cmluZztcbiAgICAgICAgc3RhcnRlZEF0Pzogc3RyaW5nO1xuICAgICAgICBjb21wbGV0ZWRBdD86IHN0cmluZztcbiAgICB9Pjtcbn1cblxuLyoqXG4gKiBDbGllbnQgY29uZmlndXJhdGlvbiBvcHRpb25zXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ2xpZW50Q29uZmlnIHtcbiAgICAvKiogQ3VzdG9tIGNsaWVudCBpbnN0YW5jZSAoZm9yIHRlc3RpbmcpICovXG4gICAgY2xpZW50PzogT3BlbmNvZGVDbGllbnQ7XG4gICAgLyoqIENvbm5lY3Rpb24gdGltZW91dCBpbiBtaWxsaXNlY29uZHMgKGRlZmF1bHQ6IDEwMDAwKSAqL1xuICAgIHRpbWVvdXQ/OiBudW1iZXI7XG4gICAgLyoqIFJldHJ5IGF0dGVtcHRzIGZvciBmYWlsZWQgb3BlcmF0aW9ucyAqL1xuICAgIHJldHJ5QXR0ZW1wdHM/OiBudW1iZXI7XG4gICAgLyoqIFByb21wdCB0aW1lb3V0IGluIG1pbGxpc2Vjb25kcyAodXNlZCBhcyBhbiBpZGxlIHRpbWVvdXQgZm9yIHN0cmVhbWluZykgKi9cbiAgICBwcm9tcHRUaW1lb3V0PzogbnVtYmVyO1xuICAgIC8qKiBEaXJlY3Rvcnkvd29ya3RyZWUgY29udGV4dCB0byBydW4gT3BlbkNvZGUgaW4gKGRlZmF1bHRzIHRvIHByb2Nlc3MuY3dkKCkpICovXG4gICAgZGlyZWN0b3J5Pzogc3RyaW5nO1xuICAgIC8qKiBVUkwgb2YgZXhpc3RpbmcgT3BlbkNvZGUgc2VydmVyIHRvIHJldXNlIChpZiBwcm92aWRlZCwgd29uJ3Qgc3Bhd24gbmV3IHNlcnZlcikgKi9cbiAgICBleGlzdGluZ1NlcnZlclVybD86IHN0cmluZztcbiAgICAvKiogU2VydmVyIHN0YXJ0dXAgdGltZW91dCBpbiBtaWxsaXNlY29uZHMgKGRlZmF1bHQ6IDEwMDAwKSAqL1xuICAgIHNlcnZlclN0YXJ0dXBUaW1lb3V0PzogbnVtYmVyO1xuICAgIC8qKiBOT1RFOiB3b3JraW5nRGlyIHBhcmFtZXRlciBpcyBub3Qgc3VwcG9ydGVkIGJ5IHRoZSBTREtcbiAgICAgKiBTcGF3bmVkIE9wZW5Db2RlIHNlcnZlcnMgd2lsbCB1c2UgdGhlIGNhbGxpbmcgZGlyZWN0b3J5IGJ5IGRlZmF1bHQgKHByb2Nlc3MuY3dkKCkpXG4gICAgICogVXNlIE9QRU5DT0RFX1VSTCB0byBjb25uZWN0IHRvIGEgZGlmZmVyZW50IE9wZW5Db2RlIGluc3RhbmNlIGluc3RlYWRcbiAgICAgKi9cbn1cblxuLyoqXG4gKiBPcGVuQ29kZSBDbGllbnQgV3JhcHBlclxuICpcbiAqIFdyYXBzIE9wZW5Db2RlIFNESyB0byBwcm92aWRlIHNlc3Npb24gbWFuYWdlbWVudFxuICogYW5kIGVycm9yIGhhbmRsaW5nIGZvciByYWxwaCBydW5uZXIuXG4gKi9cbmV4cG9ydCBjbGFzcyBPcGVuQ29kZUNsaWVudCB7XG4gICAgcHJpdmF0ZSBjbGllbnQ6IE9wZW5jb2RlQ2xpZW50O1xuICAgIHByaXZhdGUgdGltZW91dDogbnVtYmVyO1xuICAgIHByaXZhdGUgcmV0cnlBdHRlbXB0czogbnVtYmVyO1xuICAgIHByaXZhdGUgYWN0aXZlU2Vzc2lvbnM6IE1hcDxzdHJpbmcsIFNlc3Npb24+O1xuICAgIHByaXZhdGUgcHJvbXB0VGltZW91dDogbnVtYmVyO1xuICAgIHByaXZhdGUgZGlyZWN0b3J5OiBzdHJpbmcgPSBwcm9jZXNzLmN3ZCgpO1xuICAgIHByaXZhdGUgc2VydmVyOiB7IHVybDogc3RyaW5nOyBjbG9zZTogKCkgPT4gdm9pZCB9IHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBzZXJ2ZXJTdGFydHVwVGltZW91dDogbnVtYmVyO1xuXG4gICAgLyoqXG4gICAgICogUHJpdmF0ZSBjb25zdHJ1Y3RvciAtIHVzZSBzdGF0aWMgY3JlYXRlKCkgZmFjdG9yeSBtZXRob2QgaW5zdGVhZFxuICAgICAqL1xuICAgIHByaXZhdGUgY29uc3RydWN0b3IoXG4gICAgICAgIGNsaWVudDogT3BlbmNvZGVDbGllbnQsXG4gICAgICAgIHNlcnZlcjogeyB1cmw6IHN0cmluZzsgY2xvc2U6ICgpID0+IHZvaWQgfSB8IG51bGwsXG4gICAgICAgIGNvbmZpZzogQ2xpZW50Q29uZmlnID0ge30sXG4gICAgKSB7XG4gICAgICAgIHRoaXMuY2xpZW50ID0gY2xpZW50O1xuICAgICAgICB0aGlzLnNlcnZlciA9IHNlcnZlcjtcbiAgICAgICAgdGhpcy50aW1lb3V0ID0gY29uZmlnLnRpbWVvdXQgfHwgMzAwMDA7XG4gICAgICAgIHRoaXMucmV0cnlBdHRlbXB0cyA9IGNvbmZpZy5yZXRyeUF0dGVtcHRzIHx8IDM7XG5cbiAgICAgICAgY29uc3QgZW52UHJvbXB0VGltZW91dCA9IE51bWJlci5wYXJzZUludChcbiAgICAgICAgICAgIHByb2Nlc3MuZW52Lk9QRU5DT0RFX1BST01QVF9USU1FT1VUX01TID8/IFwiXCIsXG4gICAgICAgICAgICAxMCxcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgcmVzb2x2ZWRQcm9tcHRUaW1lb3V0ID0gTnVtYmVyLmlzRmluaXRlKGVudlByb21wdFRpbWVvdXQpXG4gICAgICAgICAgICA/IGVudlByb21wdFRpbWVvdXRcbiAgICAgICAgICAgIDogdW5kZWZpbmVkO1xuXG4gICAgICAgIC8vIEZvciBzdHJlYW1pbmcsIHRoaXMgYWN0cyBhcyBhbiBpZGxlIHRpbWVvdXQgKHJlc2V0IG9uIHN0cmVhbWVkIGV2ZW50cylcbiAgICAgICAgdGhpcy5wcm9tcHRUaW1lb3V0ID1cbiAgICAgICAgICAgIGNvbmZpZy5wcm9tcHRUaW1lb3V0ID8/IHJlc29sdmVkUHJvbXB0VGltZW91dCA/PyAxMjAwMDA7IC8vIDEyMCBzZWNvbmRzIGRlZmF1bHRcblxuICAgICAgICB0aGlzLmRpcmVjdG9yeSA9XG4gICAgICAgICAgICBjb25maWcuZGlyZWN0b3J5IHx8IHByb2Nlc3MuZW52Lk9QRU5DT0RFX0RJUkVDVE9SWSB8fCBwcm9jZXNzLmN3ZCgpO1xuXG4gICAgICAgIHRoaXMuc2VydmVyU3RhcnR1cFRpbWVvdXQgPSBjb25maWcuc2VydmVyU3RhcnR1cFRpbWVvdXQgfHwgMTAwMDA7IC8vIDEwIHNlY29uZHMgZGVmYXVsdFxuICAgICAgICB0aGlzLmFjdGl2ZVNlc3Npb25zID0gbmV3IE1hcCgpO1xuXG4gICAgICAgIGxvZy5kZWJ1ZyhcIk9wZW5Db2RlQ2xpZW50IGluaXRpYWxpemVkXCIsIHtcbiAgICAgICAgICAgIGhhc093blNlcnZlcjogISF0aGlzLnNlcnZlcixcbiAgICAgICAgICAgIHRpbWVvdXQ6IHRoaXMudGltZW91dCxcbiAgICAgICAgICAgIHNlcnZlclN0YXJ0dXBUaW1lb3V0OiB0aGlzLnNlcnZlclN0YXJ0dXBUaW1lb3V0LFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgYW4gYXZhaWxhYmxlIHBvcnQgZm9yIE9wZW5Db2RlIHNlcnZlclxuICAgICAqXG4gICAgICogSU1QT1JUQU5UOiBBbHdheXMgYXZvaWQgcG9ydCA0MDk2IHRvIHByZXZlbnQgY29uZmxpY3RzIHdpdGggdXNlcidzIGV4aXN0aW5nIHNlcnZlclxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIGFzeW5jIGdldEF2YWlsYWJsZVBvcnQoKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIENoZWNrIGlmIGRlZmF1bHQgcG9ydCBpcyBpbiB1c2UgYW5kIGxvZyBhY2NvcmRpbmdseVxuICAgICAgICAgICAgY29uc3QgZGVmYXVsdFBvcnQgPSA0MDk2O1xuICAgICAgICAgICAgY29uc3QgaXNEZWZhdWx0QXZhaWxhYmxlID1cbiAgICAgICAgICAgICAgICBhd2FpdCBPcGVuQ29kZUNsaWVudC5pc1BvcnRBdmFpbGFibGUoZGVmYXVsdFBvcnQpO1xuXG4gICAgICAgICAgICBpZiAoIWlzRGVmYXVsdEF2YWlsYWJsZSkge1xuICAgICAgICAgICAgICAgIGxvZy5pbmZvKFxuICAgICAgICAgICAgICAgICAgICBcIkV4aXN0aW5nIHNlcnZlciBkZXRlY3RlZCBvbiBwb3J0IDQwOTY7IHNwYXduaW5nIGlzb2xhdGVkIHNlcnZlciBvbiBkeW5hbWljIHBvcnRcIixcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsb2cuZGVidWcoXG4gICAgICAgICAgICAgICAgICAgIFwiRGVmYXVsdCBwb3J0IDQwOTYgaXMgYXZhaWxhYmxlIGJ1dCBhdm9pZGluZyBpdCBmb3IgaXNvbGF0aW9uXCIsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQWx3YXlzIHVzZSBkeW5hbWljIHBvcnQgdG8gYXZvaWQgY29uZmxpY3RzIHdpdGggdXNlcidzIGV4aXN0aW5nIHNlcnZlclxuICAgICAgICAgICAgY29uc3QgZHluYW1pY1BvcnQgPSBhd2FpdCBPcGVuQ29kZUNsaWVudC5maW5kQXZhaWxhYmxlUG9ydCgpO1xuICAgICAgICAgICAgbG9nLmluZm8oXG4gICAgICAgICAgICAgICAgYFNwYXduaW5nIGlzb2xhdGVkIHNlcnZlciBvbiBkeW5hbWljIHBvcnQ6ICR7ZHluYW1pY1BvcnR9YCxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICByZXR1cm4gZHluYW1pY1BvcnQ7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1zZyA9XG4gICAgICAgICAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICAgICAgbG9nLmVycm9yKFwiRmFpbGVkIHRvIHNlbGVjdCBPcGVuQ29kZSBzZXJ2ZXIgcG9ydFwiLCB7XG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yTXNnLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgYEZhaWxlZCB0byBzZWxlY3QgT3BlbkNvZGUgc2VydmVyIHBvcnQ6ICR7ZXJyb3JNc2d9YCxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBhIHNwZWNpZmljIHBvcnQgaXMgYXZhaWxhYmxlXG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgYXN5bmMgaXNQb3J0QXZhaWxhYmxlKHBvcnQ6IG51bWJlcik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNlcnZlciA9IGNyZWF0ZVNlcnZlcigpO1xuXG4gICAgICAgICAgICBzZXJ2ZXIubGlzdGVuKHBvcnQsICgpID0+IHtcbiAgICAgICAgICAgICAgICBzZXJ2ZXIub25jZShcImNsb3NlXCIsICgpID0+IHJlc29sdmUodHJ1ZSkpO1xuICAgICAgICAgICAgICAgIHNlcnZlci5jbG9zZSgpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHNlcnZlci5vbihcImVycm9yXCIsICgpID0+IHJlc29sdmUoZmFsc2UpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmluZCBhbiBhdmFpbGFibGUgcG9ydCBkeW5hbWljYWxseVxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhdGljIGFzeW5jIGZpbmRBdmFpbGFibGVQb3J0KCk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzZXJ2ZXIgPSBjcmVhdGVTZXJ2ZXIoKTtcblxuICAgICAgICAgICAgc2VydmVyLmxpc3RlbigwLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgYWRkcmVzcyA9IHNlcnZlci5hZGRyZXNzKCk7XG4gICAgICAgICAgICAgICAgaWYgKGFkZHJlc3MgJiYgdHlwZW9mIGFkZHJlc3MgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VydmVyLm9uY2UoXCJjbG9zZVwiLCAoKSA9PiByZXNvbHZlKGFkZHJlc3MucG9ydCkpO1xuICAgICAgICAgICAgICAgICAgICBzZXJ2ZXIuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKFwiRmFpbGVkIHRvIGdldCBzZXJ2ZXIgYWRkcmVzc1wiKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHNlcnZlci5vbihcImVycm9yXCIsIHJlamVjdCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFN0YXRpYyBmYWN0b3J5IG1ldGhvZCB0byBjcmVhdGUgYW4gT3BlbkNvZGVDbGllbnRcbiAgICAgKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgY2xpZW50IHdpdGggZWl0aGVyOlxuICAgICAqIDEuIEEgZnJlc2ggT3BlbkNvZGUgc2VydmVyIChkZWZhdWx0IGJlaGF2aW9yKVxuICAgICAqIDIuIEFuIGV4aXN0aW5nIHNlcnZlciBVUkwgKGlmIGV4aXN0aW5nU2VydmVyVXJsIGlzIHByb3ZpZGVkKVxuICAgICAqIDMuIEEgY3VzdG9tIGNsaWVudCBpbnN0YW5jZSAoZm9yIHRlc3RpbmcpXG4gICAgICpcbiAgICAgKiBOb3RlOiBTcGF3bmVkIE9wZW5Db2RlIHNlcnZlcnMgd2lsbCB1c2UgdG8gY2FsbGluZyBkaXJlY3RvcnkgYnkgZGVmYXVsdCAocHJvY2Vzcy5jd2QoKSlcbiAgICAgKiBVc2UgT1BFTkNPREVfVVJMIHRvIGNvbm5lY3QgdG8gYSBkaWZmZXJlbnQgT3BlbkNvZGUgaW5zdGFuY2VcbiAgICAgKi9cbiAgICBzdGF0aWMgYXN5bmMgY3JlYXRlKGNvbmZpZzogQ2xpZW50Q29uZmlnID0ge30pOiBQcm9taXNlPE9wZW5Db2RlQ2xpZW50PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBJZiBjdXN0b20gY2xpZW50IHByb3ZpZGVkIChmb3IgdGVzdGluZyksIHVzZSBpdCBkaXJlY3RseVxuICAgICAgICAgICAgaWYgKGNvbmZpZy5jbGllbnQpIHtcbiAgICAgICAgICAgICAgICBsb2cuaW5mbyhcIkNyZWF0aW5nIE9wZW5Db2RlQ2xpZW50IHdpdGggY3VzdG9tIGNsaWVudCBpbnN0YW5jZVwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IE9wZW5Db2RlQ2xpZW50KGNvbmZpZy5jbGllbnQsIG51bGwsIGNvbmZpZyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIElmIGV4aXN0aW5nIHNlcnZlciBVUkwgcHJvdmlkZWQsIGNvbm5lY3QgdG8gaXRcbiAgICAgICAgICAgIGlmIChjb25maWcuZXhpc3RpbmdTZXJ2ZXJVcmwpIHtcbiAgICAgICAgICAgICAgICBsb2cuaW5mbyhcIkNvbm5lY3RpbmcgdG8gZXhpc3RpbmcgT3BlbkNvZGUgc2VydmVyXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBjb25maWcuZXhpc3RpbmdTZXJ2ZXJVcmwsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2xpZW50ID0gY3JlYXRlT3BlbmNvZGVDbGllbnQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFzZVVybDogY29uZmlnLmV4aXN0aW5nU2VydmVyVXJsLFxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBWZXJpZnkgY29ubmVjdGlvbiBieSBtYWtpbmcgYSB0ZXN0IHJlcXVlc3RcbiAgICAgICAgICAgICAgICAgICAgbG9nLmRlYnVnKFwiVmVyaWZ5aW5nIGNvbm5lY3Rpb24gdG8gZXhpc3Rpbmcgc2VydmVyLi4uXCIpO1xuICAgICAgICAgICAgICAgICAgICAvLyBOb3RlOiBXZSdsbCBza2lwIHZlcmlmaWNhdGlvbiBmb3Igbm93IHRvIGF2b2lkIHVubmVjZXNzYXJ5IEFQSSBjYWxsc1xuICAgICAgICAgICAgICAgICAgICAvLyBUaGUgY29ubmVjdGlvbiB3aWxsIGJlIHZlcmlmaWVkIHdoZW4gZmlyc3Qgc2Vzc2lvbiBpcyBjcmVhdGVkXG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBPcGVuQ29kZUNsaWVudChjbGllbnQsIG51bGwsIGNvbmZpZyk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNc2cgPVxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICBsb2cuZXJyb3IoXCJGYWlsZWQgdG8gY29ubmVjdCB0byBleGlzdGluZyBzZXJ2ZXJcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBjb25maWcuZXhpc3RpbmdTZXJ2ZXJVcmwsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JNc2csXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIERlZmF1bHQ6IHNwYXduIGEgbmV3IE9wZW5Db2RlIHNlcnZlclxuICAgICAgICAgICAgLy8gTm90ZTogU3Bhd25lZCBzZXJ2ZXJzIHdpbGwgdXNlIHRvIGNhbGxpbmcgZGlyZWN0b3J5IGJ5IGRlZmF1bHRcbiAgICAgICAgICAgIC8vIFVzZSBPUEVOQ09ERV9VUkwgdG8gY29ubmVjdCB0byBhIGRpZmZlcmVudCBPcGVuQ29kZSBpbnN0YW5jZVxuICAgICAgICAgICAgbG9nLmluZm8oXCJTcGF3bmluZyBuZXcgT3BlbkNvZGUgc2VydmVyLi4uXCIsIHtcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiBjb25maWcuc2VydmVyU3RhcnR1cFRpbWVvdXQgfHwgMTAwMDAsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgY29uc3QgYXZhaWxhYmxlUG9ydCA9IGF3YWl0IE9wZW5Db2RlQ2xpZW50LmdldEF2YWlsYWJsZVBvcnQoKTtcblxuICAgICAgICAgICAgY29uc3QgeyBjbGllbnQsIHNlcnZlciB9ID0gYXdhaXQgY3JlYXRlT3BlbmNvZGUoe1xuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IGNvbmZpZy5zZXJ2ZXJTdGFydHVwVGltZW91dCB8fCAxMDAwMCxcbiAgICAgICAgICAgICAgICBwb3J0OiBhdmFpbGFibGVQb3J0LFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGxvZy5pbmZvKFwiT3BlbkNvZGUgc2VydmVyIHN0YXJ0ZWQgc3VjY2Vzc2Z1bGx5XCIpO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBPcGVuQ29kZUNsaWVudChjbGllbnQsIHNlcnZlciwgY29uZmlnKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTXNnID1cbiAgICAgICAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgICAgICBsb2cuZXJyb3IoXCJGYWlsZWQgdG8gY3JlYXRlIE9wZW5Db2RlQ2xpZW50XCIsIHsgZXJyb3I6IGVycm9yTXNnIH0pO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gY3JlYXRlIE9wZW5Db2RlQ2xpZW50OiAke2Vycm9yTXNnfWApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IE9wZW5Db2RlIHNlc3Npb24gd2l0aCBhIGdpdmVuIHByb21wdFxuICAgICAqL1xuICAgIGFzeW5jIGNyZWF0ZVNlc3Npb24ocHJvbXB0OiBzdHJpbmcpOiBQcm9taXNlPFNlc3Npb24+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIENyZWF0ZSBzZXNzaW9uIHVzaW5nIFNES1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5jbGllbnQuc2Vzc2lvbi5jcmVhdGUoe1xuICAgICAgICAgICAgICAgIGJvZHk6IHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IFwiYWktZW5nIHJhbHBoIHNlc3Npb25cIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmICghcmVzdWx0LmRhdGEpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgIGBGYWlsZWQgdG8gY3JlYXRlIE9wZW5Db2RlIHNlc3Npb246ICR7SlNPTi5zdHJpbmdpZnkocmVzdWx0LmVycm9yKX1gLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHNka1Nlc3Npb24gPSByZXN1bHQuZGF0YTtcblxuICAgICAgICAgICAgLy8gRGVmZXIgdGhlIGluaXRpYWwgcHJvbXB0IHVudGlsIHRoZSBmaXJzdCBtZXNzYWdlIGlzIHNlbnQuXG4gICAgICAgICAgICAvLyBUaGlzIGF2b2lkcyBibG9ja2luZyBzZXNzaW9uIGNyZWF0aW9uIGFuZCBlbmFibGVzIHN0cmVhbWluZyBvdXRwdXRcbiAgICAgICAgICAgIC8vIGV2ZW4gd2hlbiB0aGUgaW5pdGlhbCBwcm9tcHQgaXMgbGFyZ2Ugb3Igc2xvdyB0byBwcm9jZXNzLlxuICAgICAgICAgICAgbGV0IHBlbmRpbmdJbml0aWFsUHJvbXB0ID0gcHJvbXB0LnRyaW0oKTtcbiAgICAgICAgICAgIGNvbnN0IGJ1aWxkRmlyc3RNZXNzYWdlID0gKG1lc3NhZ2U6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghcGVuZGluZ0luaXRpYWxQcm9tcHQpIHJldHVybiBtZXNzYWdlO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbWJpbmVkID0gYCR7cGVuZGluZ0luaXRpYWxQcm9tcHR9XFxuXFxuLS0tXFxuXFxuJHttZXNzYWdlfWA7XG4gICAgICAgICAgICAgICAgcGVuZGluZ0luaXRpYWxQcm9tcHQgPSBcIlwiO1xuICAgICAgICAgICAgICAgIHJldHVybiBjb21iaW5lZDtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIEluaXRpYWxpemUgdG9vbCBpbnZvY2F0aW9ucyB0cmFja2VyXG4gICAgICAgICAgICBjb25zdCB0b29sSW52b2NhdGlvbnM6IFNlc3Npb25bXCJfdG9vbEludm9jYXRpb25zXCJdID0gW107XG5cbiAgICAgICAgICAgIC8vIFdyYXAgd2l0aCBvdXIgc2Vzc2lvbiBpbnRlcmZhY2VcbiAgICAgICAgICAgIGNvbnN0IHNlc3Npb246IFNlc3Npb24gPSB7XG4gICAgICAgICAgICAgICAgaWQ6IHNka1Nlc3Npb24uaWQgfHwgdGhpcy5nZW5lcmF0ZVNlc3Npb25JZCgpLFxuICAgICAgICAgICAgICAgIF90b29sSW52b2NhdGlvbnM6IHRvb2xJbnZvY2F0aW9ucyxcbiAgICAgICAgICAgICAgICBzZW5kTWVzc2FnZTogYXN5bmMgKG1lc3NhZ2U6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5oYW5kbGVTZW5kTWVzc2FnZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHNka1Nlc3Npb24uaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBidWlsZEZpcnN0TWVzc2FnZShtZXNzYWdlKSxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNlbmRNZXNzYWdlU3RyZWFtOiBhc3luYyAobWVzc2FnZTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmhhbmRsZVNlbmRNZXNzYWdlU3RyZWFtKFxuICAgICAgICAgICAgICAgICAgICAgICAgc2RrU2Vzc2lvbi5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkRmlyc3RNZXNzYWdlKG1lc3NhZ2UpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbEludm9jYXRpb25zLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY2xvc2U6IGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaGFuZGxlU2Vzc2lvbkNsb3NlKHNka1Nlc3Npb24uaWQpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBTdG9yZSBhY3RpdmUgc2Vzc2lvblxuICAgICAgICAgICAgdGhpcy5hY3RpdmVTZXNzaW9ucy5zZXQoc2Vzc2lvbi5pZCwgc2Vzc2lvbik7XG5cbiAgICAgICAgICAgIHJldHVybiBzZXNzaW9uO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID1cbiAgICAgICAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgYEZhaWxlZCB0byBjcmVhdGUgT3BlbkNvZGUgc2Vzc2lvbjogJHtlcnJvck1lc3NhZ2V9YCxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZW5kIGEgbWVzc2FnZSB0byBhbiBleGlzdGluZyBzZXNzaW9uXG4gICAgICovXG4gICAgYXN5bmMgc2VuZE1lc3NhZ2UoXG4gICAgICAgIHNlc3Npb25JZDogc3RyaW5nLFxuICAgICAgICBtZXNzYWdlOiBzdHJpbmcsXG4gICAgKTogUHJvbWlzZTxNZXNzYWdlUmVzcG9uc2U+IHtcbiAgICAgICAgY29uc3Qgc2Vzc2lvbiA9IHRoaXMuYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25JZCk7XG5cbiAgICAgICAgaWYgKCFzZXNzaW9uKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFNlc3Npb24gbm90IGZvdW5kOiAke3Nlc3Npb25JZH1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmhhbmRsZVNlbmRNZXNzYWdlKHNlc3Npb25JZCwgbWVzc2FnZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xvc2UgYW4gYWN0aXZlIHNlc3Npb25cbiAgICAgKi9cbiAgICBhc3luYyBjbG9zZVNlc3Npb24oc2Vzc2lvbklkOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgY29uc3Qgc2Vzc2lvbiA9IHRoaXMuYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25JZCk7XG5cbiAgICAgICAgaWYgKCFzZXNzaW9uKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFNlc3Npb24gbm90IGZvdW5kOiAke3Nlc3Npb25JZH1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGF3YWl0IHRoaXMuaGFuZGxlU2Vzc2lvbkNsb3NlKHNlc3Npb25JZCk7XG4gICAgICAgIHRoaXMuYWN0aXZlU2Vzc2lvbnMuZGVsZXRlKHNlc3Npb25JZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IGFsbCBhY3RpdmUgc2Vzc2lvbiBJRHNcbiAgICAgKi9cbiAgICBnZXRBY3RpdmVTZXNzaW9ucygpOiBzdHJpbmdbXSB7XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuYWN0aXZlU2Vzc2lvbnMua2V5cygpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBhIHNlc3Npb24gaXMgYWN0aXZlXG4gICAgICovXG4gICAgaXNTZXNzaW9uQWN0aXZlKHNlc3Npb25JZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLmFjdGl2ZVNlc3Npb25zLmhhcyhzZXNzaW9uSWQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENsb3NlIGFsbCBhY3RpdmUgc2Vzc2lvbnNcbiAgICAgKi9cbiAgICBhc3luYyBjbG9zZUFsbFNlc3Npb25zKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCBjbG9zZVByb21pc2VzID0gQXJyYXkuZnJvbSh0aGlzLmFjdGl2ZVNlc3Npb25zLmtleXMoKSkubWFwKFxuICAgICAgICAgICAgKHNlc3Npb25JZCkgPT5cbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZVNlc3Npb25DbG9zZShzZXNzaW9uSWQpLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1zZyA9XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIGxvZy53YXJuKFwiRXJyb3IgY2xvc2luZyBzZXNzaW9uXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvck1zZyxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICk7XG5cbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoY2xvc2VQcm9taXNlcyk7XG4gICAgICAgIHRoaXMuYWN0aXZlU2Vzc2lvbnMuY2xlYXIoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBIYW5kbGUgc2VuZGluZyBhIG1lc3NhZ2Ugd2l0aCBzdHJlYW1pbmcgc3VwcG9ydFxuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgaGFuZGxlU2VuZE1lc3NhZ2VTdHJlYW0oXG4gICAgICAgIHNlc3Npb25JZDogc3RyaW5nLFxuICAgICAgICBtZXNzYWdlOiBzdHJpbmcsXG4gICAgICAgIHRvb2xJbnZvY2F0aW9ucz86IFNlc3Npb25bXCJfdG9vbEludm9jYXRpb25zXCJdLFxuICAgICk6IFByb21pc2U8U3RyZWFtaW5nUmVzcG9uc2U+IHtcbiAgICAgICAgbGV0IGxhc3RFcnJvcjogRXJyb3IgfCBudWxsID0gbnVsbDtcblxuICAgICAgICBjb25zdCBzdXBwb3J0c0V2ZW50U3RyZWFtaW5nID1cbiAgICAgICAgICAgIHR5cGVvZiAodGhpcy5jbGllbnQgYXMgYW55KT8uc2Vzc2lvbj8ucHJvbXB0QXN5bmMgPT09IFwiZnVuY3Rpb25cIiAmJlxuICAgICAgICAgICAgdHlwZW9mICh0aGlzLmNsaWVudCBhcyBhbnkpPy5ldmVudD8uc3Vic2NyaWJlID09PSBcImZ1bmN0aW9uXCI7XG5cbiAgICAgICAgZm9yIChsZXQgYXR0ZW1wdCA9IDE7IGF0dGVtcHQgPD0gdGhpcy5yZXRyeUF0dGVtcHRzOyBhdHRlbXB0KyspIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGEgVHJhbnNmb3JtU3RyZWFtIHRvIGhhbmRsZSB0aGUgc3RyZWFtaW5nIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgY29uc3Qgc3RyZWFtID0gbmV3IFRyYW5zZm9ybVN0cmVhbTxVaW50OEFycmF5LCBVaW50OEFycmF5PigpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHdyaXRlciA9IHN0cmVhbS53cml0YWJsZS5nZXRXcml0ZXIoKTtcblxuICAgICAgICAgICAgICAgIC8vIFRyYWNrIGZpbmFsaXphdGlvbiB0byBwcmV2ZW50IGRvdWJsZS1jbG9zZS9hYm9ydFxuICAgICAgICAgICAgICAgIGxldCBmaW5hbGl6ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBjb25zdCBjbG9zZU9uY2UgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmaW5hbGl6ZWQpIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgZmluYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHdyaXRlci5jbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElnbm9yZSBlcnJvcnMgZHVyaW5nIGNsb3NlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGNvbnN0IGFib3J0T25jZSA9IGFzeW5jIChlcnI6IHVua25vd24pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbmFsaXplZCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICBmaW5hbGl6ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgd3JpdGVyLmFib3J0KGVycik7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWdub3JlIGVycm9ycyBkdXJpbmcgYWJvcnRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAvLyBGYWxsYmFjazogaWYgdGhlIGNsaWVudCBkb2Vzbid0IHN1cHBvcnQgcHJvbXB0X2FzeW5jICsgU1NFLCBrZWVwIHRoZVxuICAgICAgICAgICAgICAgIC8vIGxlZ2FjeSBiZWhhdmlvciAoYnVmZmVyIHRoZW4gc2ltdWxhdGUgc3RyZWFtaW5nKS5cbiAgICAgICAgICAgICAgICBpZiAoIXN1cHBvcnRzRXZlbnRTdHJlYW1pbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJvbXB0UHJvbWlzZSA9IHRoaXMuY2xpZW50LnNlc3Npb24ucHJvbXB0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvZHk6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlSUQ6IHRoaXMuZ2VuZXJhdGVNZXNzYWdlSWQoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0czogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcInRleHRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IG1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBxdWVyeToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdG9yeTogdGhpcy5kaXJlY3RvcnksXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9IGFzIGFueSk7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RyZWFtaW5nVGFzayA9IChhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHByb21wdFByb21pc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXJlc3VsdC5kYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBJbnZhbGlkIHJlc3BvbnNlIGZyb20gT3BlbkNvZGU6ICR7SlNPTi5zdHJpbmdpZnkocmVzdWx0LmVycm9yKX1gLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gcmVzdWx0LmRhdGE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGV4dFBhcnQgPSByZXNwb25zZS5wYXJ0cz8uZmluZChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHBhcnQ6IGFueSkgPT4gcGFydC50eXBlID09PSBcInRleHRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmluYWxDb250ZW50ID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHRleHRQYXJ0IGFzIGFueSk/LnRleHQgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJObyBjb250ZW50IHJlY2VpdmVkXCI7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTaW11bGF0ZSBzdHJlYW1pbmcgYnkgd3JpdGluZyBjaHVua3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjaHVua3MgPSB0aGlzLnNwbGl0SW50b0NodW5rcyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmluYWxDb250ZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAxMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVuY29kZXIgPSBuZXcgVGV4dEVuY29kZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGNodW5rIG9mIGNodW5rcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB3cml0ZXIud3JpdGUoZW5jb2Rlci5lbmNvZGUoY2h1bmspKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KHJlc29sdmUsIDUwKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBjbG9zZU9uY2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBjb250ZW50OiBmaW5hbENvbnRlbnQgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgYWJvcnRPbmNlKGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSkoKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RyZWFtOiBzdHJlYW0ucmVhZGFibGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZTogc3RyZWFtaW5nVGFzayxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBSZWFsIHN0cmVhbWluZzogdXNlIHByb21wdF9hc3luYyBhbmQgY29uc3VtZSB0aGUgZXZlbnQgU1NFIHN0cmVhbS5cbiAgICAgICAgICAgICAgICBjb25zdCBlbmNvZGVyID0gbmV3IFRleHRFbmNvZGVyKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgaWRsZVRpbWVvdXRFcnJvciA9IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgYFByb21wdCBpZGxlIHRpbWVvdXQgYWZ0ZXIgJHt0aGlzLnByb21wdFRpbWVvdXR9bXNgLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgY29uc3QgaGFyZFRpbWVvdXRFcnJvciA9IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgYFByb21wdCBoYXJkIHRpbWVvdXQgYWZ0ZXIgJHt0aGlzLnByb21wdFRpbWVvdXQgKiA1fW1zYCxcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgY29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICAgICAgICAgICAgICBsZXQgaWRsZVRpbWVyOiBSZXR1cm5UeXBlPHR5cGVvZiBzZXRUaW1lb3V0PiB8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBsZXQgaGFyZFRpbWVyOiBSZXR1cm5UeXBlPHR5cGVvZiBzZXRUaW1lb3V0PiB8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBsZXQgYnl0ZXNXcml0dGVuID0gMDtcbiAgICAgICAgICAgICAgICBsZXQgbGFzdFByb2dyZXNzVGltZSA9IERhdGUubm93KCk7XG4gICAgICAgICAgICAgICAgbGV0IGlkbGVUaW1lZE91dCA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgLy8gSGFyZCB0aW1lb3V0IC0gbmV2ZXIgcmVzZXRzXG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhcnRIYXJkVGltZXIgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChoYXJkVGltZXIpIGNsZWFyVGltZW91dChoYXJkVGltZXIpO1xuICAgICAgICAgICAgICAgICAgICBoYXJkVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZy53YXJuKFwiSGFyZCB0aW1lb3V0IHJlYWNoZWQsIGFib3J0aW5nXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dE1zOiB0aGlzLnByb21wdFRpbWVvdXQgKiA1LFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXIuYWJvcnQoaGFyZFRpbWVvdXRFcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpZ25vcmVcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSwgdGhpcy5wcm9tcHRUaW1lb3V0ICogNSk7IC8vIDV4IGlkbGUgdGltZW91dCBhcyBoYXJkIGNlaWxpbmdcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgLy8gSWRsZSB0aW1lciAtIHJlc2V0cyBvbmx5IG9uIHJlbGV2YW50IHByb2dyZXNzXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzZXRJZGxlVGltZXIgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpZGxlVGltZXIpIGNsZWFyVGltZW91dChpZGxlVGltZXIpO1xuICAgICAgICAgICAgICAgICAgICBpZGxlVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkbGVUaW1lZE91dCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2cud2FybihcIklkbGUgdGltZW91dCByZWFjaGVkLCBhYm9ydGluZ1wiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXRNczogdGhpcy5wcm9tcHRUaW1lb3V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ5dGVzV3JpdHRlbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0UHJvZ3Jlc3NNc0FnbzogRGF0ZS5ub3coKSAtIGxhc3RQcm9ncmVzc1RpbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlci5hYm9ydChpZGxlVGltZW91dEVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlnbm9yZVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LCB0aGlzLnByb21wdFRpbWVvdXQpO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBjb25zdCBzdHJlYW1pbmdUYXNrID0gKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0SGFyZFRpbWVyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNldElkbGVUaW1lcigpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1c2VyTWVzc2FnZUlkID0gdGhpcy5nZW5lcmF0ZU1lc3NhZ2VJZCgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2cuZGVidWcoXCJTZW5kaW5nIHByb21wdCB0byBPcGVuQ29kZVwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VMZW5ndGg6IG1lc3NhZ2UubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJNZXNzYWdlSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgKHRoaXMuY2xpZW50IGFzIGFueSkuc2Vzc2lvbi5wcm9tcHRBc3luYyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9keToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlSUQ6IHVzZXJNZXNzYWdlSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJ0ZXh0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogbWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWVyeToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3Rvcnk6IHRoaXMuZGlyZWN0b3J5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2lnbmFsOiBjb250cm9sbGVyLnNpZ25hbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2cuZGVidWcoXCJTdWJzY3JpYmluZyB0byBldmVudHNcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3Rvcnk6IHRoaXMuZGlyZWN0b3J5LFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGV2ZW50c1Jlc3VsdCA9IGF3YWl0IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNsaWVudCBhcyBhbnlcbiAgICAgICAgICAgICAgICAgICAgICAgICkuZXZlbnQuc3Vic2NyaWJlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWVyeToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3Rvcnk6IHRoaXMuZGlyZWN0b3J5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2lnbmFsOiBjb250cm9sbGVyLnNpZ25hbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgYXNzaXN0YW50TWVzc2FnZUlkOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjb250ZW50ID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBlbWl0dGVkVGV4dCA9IFwiXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZXZlbnRDb3VudCA9IDA7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcIlN0YXJ0aW5nIGV2ZW50IHN0cmVhbSBwcm9jZXNzaW5nXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIGF3YWl0IChjb25zdCBldmVudCBvZiBldmVudHNSZXN1bHQuc3RyZWFtIGFzIEFzeW5jR2VuZXJhdG9yPGFueT4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudENvdW50Kys7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBWZXJib3NlIGRlYnVnIGxvZ2dpbmcgZm9yIGFsbCBldmVudHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZGVidWcoXCJSZWNlaXZlZCBldmVudFwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRUeXBlOiBldmVudD8udHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRDb3VudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzUHJvcGVydGllczogISFldmVudD8ucHJvcGVydGllcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlckFib3J0ZWQ6IGNvbnRyb2xsZXIuc2lnbmFsLmFib3J0ZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29udHJvbGxlci5zaWduYWwuYWJvcnRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZGVidWcoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkNvbnRyb2xsZXIgYWJvcnRlZCwgYnJlYWtpbmcgZXZlbnQgbG9vcFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudENvdW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFldmVudCB8fCB0eXBlb2YgZXZlbnQgIT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmRlYnVnKFwiU2tpcHBpbmcgbm9uLW9iamVjdCBldmVudFwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudENvdW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09IFwibWVzc2FnZS51cGRhdGVkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5mbyA9IChldmVudCBhcyBhbnkpLnByb3BlcnRpZXM/LmluZm87XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmRlYnVnKFwiTWVzc2FnZSB1cGRhdGVkIGV2ZW50XCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50Q291bnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvUm9sZTogaW5mbz8ucm9sZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm9TZXNzaW9uSWQ6IGluZm8/LnNlc3Npb25JRCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm9QYXJlbnRJZDogaW5mbz8ucGFyZW50SUQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvSWQ6IGluZm8/LmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNSZWxldmFudFNlc3Npb246XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mbz8uc2Vzc2lvbklEID09PSBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0Fzc2lzdGFudDogaW5mbz8ucm9sZSA9PT0gXCJhc3Npc3RhbnRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzUmVwbHlUb1VzZXI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mbz8ucGFyZW50SUQgPT09IHVzZXJNZXNzYWdlSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFByaW1hcnkgaWRlbnRpZmljYXRpb246IGV4YWN0IG1hdGNoIG9uIHBhcmVudElEXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8/LnJvbGUgPT09IFwiYXNzaXN0YW50XCIgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8/LnNlc3Npb25JRCA9PT0gc2Vzc2lvbklkICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvPy5wYXJlbnRJRCA9PT0gdXNlck1lc3NhZ2VJZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2lzdGFudE1lc3NhZ2VJZCA9IGluZm8uaWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZGVidWcoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJJZGVudGlmaWVkIGFzc2lzdGFudCBtZXNzYWdlIChleGFjdCBwYXJlbnRJRCBtYXRjaClcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzaXN0YW50TWVzc2FnZUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZhbGxiYWNrOiBpZiB3ZSBoYXZlbid0IGlkZW50aWZpZWQgYW4gYXNzaXN0YW50IG1lc3NhZ2UgeWV0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhY2NlcHQgYXNzaXN0YW50IG1lc3NhZ2VzIGluIHRoZSBzYW1lIHNlc3Npb24gZXZlbiBpZiBwYXJlbnRJRCBkb2Vzbid0IG1hdGNoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaGFuZGxlcyBjYXNlcyB3aGVyZSBwYXJlbnRJRCBpcyB1bmRlZmluZWQgb3IgaGFzIGEgZGlmZmVyZW50IGZvcm1hdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICFhc3Npc3RhbnRNZXNzYWdlSWQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8/LnJvbGUgPT09IFwiYXNzaXN0YW50XCIgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8/LnNlc3Npb25JRCA9PT0gc2Vzc2lvbklkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmRlYnVnKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiSWRlbnRpZmllZCBhc3Npc3RhbnQgbWVzc2FnZSAoZmFsbGJhY2sgLSBubyBleGFjdCBwYXJlbnRJRCBtYXRjaClcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzaXN0YW50TWVzc2FnZUlkOiBpbmZvLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvUGFyZW50SWQ6IGluZm8/LnBhcmVudElELFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyTWVzc2FnZUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzaXN0YW50TWVzc2FnZUlkID0gaW5mby5pZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJlc2V0IGlkbGUgdGltZXIgb24gQU5ZIGFzc2lzdGFudCBtZXNzYWdlIGFjdGl2aXR5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgcHJldmVudHMgdGltZW91dHMgd2hlbiBjb3JyZWxhdGlvbiBpcyBhbWJpZ3VvdXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mbz8ucm9sZSA9PT0gXCJhc3Npc3RhbnRcIiAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mbz8uc2Vzc2lvbklEID09PSBzZXNzaW9uSWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0UHJvZ3Jlc3NUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc2V0SWRsZVRpbWVyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3Npc3RhbnRNZXNzYWdlSWQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8/LmlkID09PSBhc3Npc3RhbnRNZXNzYWdlSWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5mbz8uZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJOYW1lID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mby5lcnJvci5uYW1lIHx8IFwiT3BlbkNvZGVFcnJvclwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVyck1zZyA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8uZXJyb3IuZGF0YT8ubWVzc2FnZSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBKU09OLnN0cmluZ2lmeShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8uZXJyb3IuZGF0YSB8fCB7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQXNzaXN0YW50IGVycm9yIGluIG1lc3NhZ2VcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JOYW1lOiBlcnJOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJNc2csXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAke2Vyck5hbWV9OiAke2Vyck1zZ31gLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmZvPy50aW1lPy5jb21wbGV0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZGVidWcoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQXNzaXN0YW50IG1lc3NhZ2UgY29tcGxldGVkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2lzdGFudE1lc3NhZ2VJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlZEF0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8udGltZS5jb21wbGV0ZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChldmVudC50eXBlID09PSBcIm1lc3NhZ2UucGFydC51cGRhdGVkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gT25seSByZXNldCB0aW1lciBhbmQgdHJhY2sgcHJvZ3Jlc3MgZm9yIHJlbGV2YW50IHVwZGF0ZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFydCA9IChldmVudCBhcyBhbnkpLnByb3BlcnRpZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8ucGFydCBhcyBhbnk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmRlYnVnKFwiTWVzc2FnZSBwYXJ0IHVwZGF0ZWRcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRDb3VudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc1BhcnQ6ICEhcGFydCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRUeXBlOiBwYXJ0Py50eXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydFNlc3Npb25JZDogcGFydD8uc2Vzc2lvbklELFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydE1lc3NhZ2VJZDogcGFydD8ubWVzc2FnZUlELFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzaXN0YW50TWVzc2FnZUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNSZWxldmFudDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3Npc3RhbnRNZXNzYWdlSWQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0Py5zZXNzaW9uSUQgPT09IHNlc3Npb25JZCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnQ/Lm1lc3NhZ2VJRCA9PT0gYXNzaXN0YW50TWVzc2FnZUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWFzc2lzdGFudE1lc3NhZ2VJZCkgY29udGludWU7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSGFuZGxlIHRvb2wgcGFydHMgKGNhcHR1cmUgdG9vbCBpbnZvY2F0aW9ucylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnQ/LnR5cGUgPT09IFwidG9vbFwiICYmIHRvb2xJbnZvY2F0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdG9vbElkID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0LnRvb2xJZCB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnQuaWQgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgdG9vbC0ke2V2ZW50Q291bnR9YDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRvb2xOYW1lID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0LnRvb2xOYW1lIHx8IHBhcnQubmFtZSB8fCBcInVua25vd25cIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRvb2xJbnB1dCA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydC5pbnB1dCB8fCBwYXJ0LnBhcmFtZXRlcnMgfHwge307XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIHRoaXMgaXMgYSBuZXcgdG9vbCBjYWxsIG9yIGFuIHVwZGF0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXhpc3RpbmdUb29sSW5kZXggPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xJbnZvY2F0aW9ucy5maW5kSW5kZXgoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICh0KSA9PiB0LmlkID09PSB0b29sSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV4aXN0aW5nVG9vbEluZGV4ID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBVcGRhdGUgZXhpc3RpbmcgdG9vbCBpbnZvY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXhpc3RpbmcgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sSW52b2NhdGlvbnNbZXhpc3RpbmdUb29sSW5kZXhdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nLm91dHB1dCA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnQucmVzdWx0ID8/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnQub3V0cHV0ID8/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nLm91dHB1dDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleGlzdGluZy5zdGF0dXMgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0LnN0YXR1cyA9PT0gXCJlcnJvclwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IFwiZXJyb3JcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBcIm9rXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhpc3RpbmcuZXJyb3IgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0LmVycm9yID8/IGV4aXN0aW5nLmVycm9yO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nLmNvbXBsZXRlZEF0ID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydC5jb21wbGV0ZWRBdCA/PyBub3c7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZGVidWcoXCJUb29sIGludm9jYXRpb24gdXBkYXRlZFwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiBleGlzdGluZy5zdGF0dXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5ldyB0b29sIGludm9jYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0b29sSW52b2NhdGlvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHRvb2xJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogdG9vbE5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0OiB0b29sSW5wdXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dDogcGFydC5yZXN1bHQgPz8gcGFydC5vdXRwdXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnQuc3RhdHVzID09PSBcImVycm9yXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IChcImVycm9yXCIgYXMgY29uc3QpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAoXCJva1wiIGFzIGNvbnN0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IHBhcnQuZXJyb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0ZWRBdDogcGFydC5zdGFydGVkQXQgPz8gbm93LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZWRBdDogcGFydC5jb21wbGV0ZWRBdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xJbnZvY2F0aW9ucy5wdXNoKHRvb2xJbnZvY2F0aW9uKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcIlRvb2wgaW52b2NhdGlvbiBzdGFydGVkXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dDogSlNPTi5zdHJpbmdpZnkoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sSW5wdXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkuc2xpY2UoMCwgMjAwKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRG9uJ3Qgc2tpcCBub24tcmVsZXZhbnQgdG9vbCBwYXJ0cyAtIHdlIHdhbnQgdG8gY2FwdHVyZSBhbGwgdG9vbCBldmVudHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZvciB0aGUgYXNzaXN0YW50IG1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0LnNlc3Npb25JRCAhPT0gc2Vzc2lvbklkIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydC5tZXNzYWdlSUQgIT09IGFzc2lzdGFudE1lc3NhZ2VJZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU3RpbGwgdHJhY2sgaXQgYnV0IGRvbid0IHByb2Nlc3MgZm9yIG91dHB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBSZXNldCBpZGxlIHRpbWVyIG9uIHRvb2wgcHJvZ3Jlc3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0UHJvZ3Jlc3NUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNldElkbGVUaW1lcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcGFydCB8fCBwYXJ0LnR5cGUgIT09IFwidGV4dFwiKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnQuc2Vzc2lvbklEICE9PSBzZXNzaW9uSWQpIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFydC5tZXNzYWdlSUQgIT09IGFzc2lzdGFudE1lc3NhZ2VJZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJhd0RlbHRhID0gKGV2ZW50IGFzIGFueSkucHJvcGVydGllc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPy5kZWx0YTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgZGVsdGFUZXh0OiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUHJlZmVyIGRpZmZpbmcgYWdhaW5zdCB0aGUgZnVsbCBgcGFydC50ZXh0YCB3aGVuIHByZXNlbnQuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNvbWUgT3BlbkNvZGUgc2VydmVyIHZlcnNpb25zIGVtaXQgbXVsdGlwbGUgdGV4dCBwYXJ0cyBvciBzZW5kXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGBkZWx0YWAgYXMgdGhlICpmdWxsKiB0ZXh0LCB3aGljaCB3b3VsZCBkdXBsaWNhdGUgb3V0cHV0LlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHBhcnQudGV4dCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV4dCA9IHBhcnQudGV4dDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5leHQuc3RhcnRzV2l0aChlbWl0dGVkVGV4dCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWx0YVRleHQgPSBuZXh0LnNsaWNlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbWl0dGVkVGV4dC5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbWl0dGVkVGV4dCA9IG5leHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVtaXR0ZWRUZXh0LnN0YXJ0c1dpdGgobmV4dCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTdGFsZS9kdXBsaWNhdGUgdXBkYXRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsdGFUZXh0ID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmFsbGJhY2s6IHRyZWF0IGFzIGFkZGl0aXZlIGNodW5rXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsdGFUZXh0ID0gbmV4dDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbWl0dGVkVGV4dCArPSBuZXh0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiByYXdEZWx0YSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsdGFUZXh0ID0gcmF3RGVsdGE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbWl0dGVkVGV4dCArPSByYXdEZWx0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZGVsdGFUZXh0KSBjb250aW51ZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBVcGRhdGUgcHJvZ3Jlc3MgdHJhY2tpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdFByb2dyZXNzVGltZSA9IERhdGUubm93KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ5dGVzV3JpdHRlbiArPSBkZWx0YVRleHQubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNldElkbGVUaW1lcigpOyAvLyBPbmx5IHJlc2V0IG9uIGFjdHVhbCBjb250ZW50IHByb2dyZXNzXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmRlYnVnKFwiV3JpdGluZyBkZWx0YSB0byBzdHJlYW1cIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsdGFMZW5ndGg6IGRlbHRhVGV4dC5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3RhbEJ5dGVzV3JpdHRlbjogYnl0ZXNXcml0dGVuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudExlbmd0aDogY29udGVudC5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQgKz0gZGVsdGFUZXh0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB3cml0ZXIud3JpdGUoZW5jb2Rlci5lbmNvZGUoZGVsdGFUZXh0KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2cuZGVidWcoXCJFdmVudCBzdHJlYW0gZW5kZWRcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudENvdW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsQnl0ZXNXcml0dGVuOiBieXRlc1dyaXR0ZW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudExlbmd0aDogY29udGVudC5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlckFib3J0ZWQ6IGNvbnRyb2xsZXIuc2lnbmFsLmFib3J0ZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWRsZVRpbWVkT3V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2lzdGFudE1lc3NhZ2VJZEZvdW5kOiAhIWFzc2lzdGFudE1lc3NhZ2VJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBjbG9zZU9uY2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogY29udGVudCB8fCBcIk5vIGNvbnRlbnQgcmVjZWl2ZWRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaWFnbm9zdGljczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBieXRlc1dyaXR0ZW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnRMZW5ndGg6IGNvbnRlbnQubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZGxlVGltZWRPdXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2lzdGFudE1lc3NhZ2VJZEZvdW5kOiAhIWFzc2lzdGFudE1lc3NhZ2VJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRDb3VudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5lcnJvcihcIlN0cmVhbWluZyB0YXNrIGVycm9yXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXNzaW9uSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yIGluc3RhbmNlb2YgRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gZXJyb3IubWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBTdHJpbmcoZXJyb3IpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXJBYm9ydGVkOiBjb250cm9sbGVyLnNpZ25hbC5hYm9ydGVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ5dGVzV3JpdHRlbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZGxlVGltZWRPdXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzaXN0YW50TWVzc2FnZUlkRm91bmQ6ICEhYXNzaXN0YW50TWVzc2FnZUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiB3ZSBhYm9ydGVkLCBub3JtYWxpemUgdG8gb3VyIHRpbWVvdXQgZXJyb3IgQU5EIGVuc3VyZSBzdHJlYW0gaXMgZmluYWxpemVkXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29udHJvbGxlci5zaWduYWwuYWJvcnRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IGFib3J0T25jZShpZGxlVGltZW91dEVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBpZGxlVGltZW91dEVycm9yO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgYWJvcnRPbmNlKGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICAgICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlkbGVUaW1lcikgY2xlYXJUaW1lb3V0KGlkbGVUaW1lcik7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaGFyZFRpbWVyKSBjbGVhclRpbWVvdXQoaGFyZFRpbWVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFjb250cm9sbGVyLnNpZ25hbC5hYm9ydGVkKSBjb250cm9sbGVyLmFib3J0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpZ25vcmVcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pKCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBzdHJlYW06IHN0cmVhbS5yZWFkYWJsZSxcbiAgICAgICAgICAgICAgICAgICAgY29tcGxldGU6IHN0cmVhbWluZ1Rhc2ssXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgbGFzdEVycm9yID1cbiAgICAgICAgICAgICAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yIDogbmV3IEVycm9yKFN0cmluZyhlcnJvcikpO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgaXNSYXRlTGltaXQgPSB0aGlzLmlzUmF0ZUxpbWl0RXJyb3IobGFzdEVycm9yKTtcblxuICAgICAgICAgICAgICAgIGlmIChhdHRlbXB0ID09PSB0aGlzLnJldHJ5QXR0ZW1wdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgZGVsYXkgPSB0aGlzLmdldEJhY2tvZmZEZWxheShhdHRlbXB0LCBpc1JhdGVMaW1pdCk7XG5cbiAgICAgICAgICAgICAgICBsb2cud2FybihcIk9wZW5Db2RlIGF0dGVtcHQgZmFpbGVkOyByZXRyeWluZ1wiLCB7XG4gICAgICAgICAgICAgICAgICAgIGF0dGVtcHQsXG4gICAgICAgICAgICAgICAgICAgIHJldHJ5QXR0ZW1wdHM6IHRoaXMucmV0cnlBdHRlbXB0cyxcbiAgICAgICAgICAgICAgICAgICAgZGVsYXlNczogZGVsYXksXG4gICAgICAgICAgICAgICAgICAgIGlzUmF0ZUxpbWl0LFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogbGFzdEVycm9yLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gc2V0VGltZW91dChyZXNvbHZlLCBkZWxheSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYEZhaWxlZCB0byBzdHJlYW0gbWVzc2FnZSBhZnRlciAke3RoaXMucmV0cnlBdHRlbXB0c30gYXR0ZW1wdHM6ICR7bGFzdEVycm9yPy5tZXNzYWdlIHx8IFwiVW5rbm93biBlcnJvclwifWAsXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU3BsaXQgdGV4dCBpbnRvIGNodW5rcyBmb3Igc3RyZWFtaW5nIHNpbXVsYXRpb25cbiAgICAgKi9cbiAgICBwcml2YXRlIHNwbGl0SW50b0NodW5rcyh0ZXh0OiBzdHJpbmcsIGNodW5rU2l6ZTogbnVtYmVyKTogc3RyaW5nW10ge1xuICAgICAgICBjb25zdCBjaHVua3M6IHN0cmluZ1tdID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGV4dC5sZW5ndGg7IGkgKz0gY2h1bmtTaXplKSB7XG4gICAgICAgICAgICBjaHVua3MucHVzaCh0ZXh0LnNsaWNlKGksIGkgKyBjaHVua1NpemUpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2h1bmtzLmxlbmd0aCA+IDAgPyBjaHVua3MgOiBbdGV4dF07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSGFuZGxlIHNlbmRpbmcgYSBtZXNzYWdlIHdpdGggZXJyb3IgaGFuZGxpbmcgYW5kIHJldHJpZXNcbiAgICAgKi9cbiAgICBwcml2YXRlIGFzeW5jIGhhbmRsZVNlbmRNZXNzYWdlKFxuICAgICAgICBzZXNzaW9uSWQ6IHN0cmluZyxcbiAgICAgICAgbWVzc2FnZTogc3RyaW5nLFxuICAgICk6IFByb21pc2U8TWVzc2FnZVJlc3BvbnNlPiB7XG4gICAgICAgIGxldCBsYXN0RXJyb3I6IEVycm9yIHwgbnVsbCA9IG51bGw7XG5cbiAgICAgICAgZm9yIChsZXQgYXR0ZW1wdCA9IDE7IGF0dGVtcHQgPD0gdGhpcy5yZXRyeUF0dGVtcHRzOyBhdHRlbXB0KyspIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGltZW91dEVycm9yID0gbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICAgICBgUHJvbXB0IHRpbWVvdXQgYWZ0ZXIgJHt0aGlzLnByb21wdFRpbWVvdXR9bXNgLFxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBjb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyLmFib3J0KHRpbWVvdXRFcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWdub3JlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCB0aGlzLnByb21wdFRpbWVvdXQpO1xuXG4gICAgICAgICAgICAgICAgbGV0IHJlc3VsdDogYW55O1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IGF3YWl0IHRoaXMuY2xpZW50LnNlc3Npb24ucHJvbXB0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvZHk6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlSUQ6IHRoaXMuZ2VuZXJhdGVNZXNzYWdlSWQoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0czogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcInRleHRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IG1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHNlc3Npb25JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBxdWVyeToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdG9yeTogdGhpcy5kaXJlY3RvcnksXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgc2lnbmFsOiBjb250cm9sbGVyLnNpZ25hbCxcbiAgICAgICAgICAgICAgICAgICAgfSBhcyBhbnkpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb250cm9sbGVyLnNpZ25hbC5hYm9ydGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyB0aW1lb3V0RXJyb3I7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoIXJlc3VsdC5kYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAgIGBJbnZhbGlkIHJlc3BvbnNlIGZyb20gT3BlbkNvZGU6ICR7SlNPTi5zdHJpbmdpZnkocmVzdWx0LmVycm9yKX1gLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIEV4dHJhY3QgY29udGVudCBmcm9tIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSByZXN1bHQuZGF0YTtcblxuICAgICAgICAgICAgICAgIC8vIEZpbmQgdGV4dCBjb250ZW50IGZyb20gcmVzcG9uc2UgcGFydHNcbiAgICAgICAgICAgICAgICBjb25zdCB0ZXh0UGFydCA9IHJlc3BvbnNlLnBhcnRzPy5maW5kKFxuICAgICAgICAgICAgICAgICAgICAocGFydDogYW55KSA9PiBwYXJ0LnR5cGUgPT09IFwidGV4dFwiLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgY29udGVudDogdGV4dFBhcnQ/LnRleHQgfHwgXCJObyBjb250ZW50IHJlY2VpdmVkXCIgfTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgbGFzdEVycm9yID1cbiAgICAgICAgICAgICAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yIDogbmV3IEVycm9yKFN0cmluZyhlcnJvcikpO1xuXG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdGhpcyBpcyBhIHJhdGUgbGltaXQgZXJyb3JcbiAgICAgICAgICAgICAgICBjb25zdCBpc1JhdGVMaW1pdCA9IHRoaXMuaXNSYXRlTGltaXRFcnJvcihsYXN0RXJyb3IpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGF0dGVtcHQgPT09IHRoaXMucmV0cnlBdHRlbXB0cykge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBXYWl0IGJlZm9yZSByZXRyeWluZyB3aXRoIGV4cG9uZW50aWFsIGJhY2tvZmZcbiAgICAgICAgICAgICAgICBjb25zdCBkZWxheSA9IHRoaXMuZ2V0QmFja29mZkRlbGF5KGF0dGVtcHQsIGlzUmF0ZUxpbWl0KTtcblxuICAgICAgICAgICAgICAgIGxvZy53YXJuKFwiT3BlbkNvZGUgYXR0ZW1wdCBmYWlsZWQ7IHJldHJ5aW5nXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgYXR0ZW1wdCxcbiAgICAgICAgICAgICAgICAgICAgcmV0cnlBdHRlbXB0czogdGhpcy5yZXRyeUF0dGVtcHRzLFxuICAgICAgICAgICAgICAgICAgICBkZWxheU1zOiBkZWxheSxcbiAgICAgICAgICAgICAgICAgICAgaXNSYXRlTGltaXQsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBsYXN0RXJyb3IubWVzc2FnZSxcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIGRlbGF5KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgRmFpbGVkIHRvIHNlbmQgbWVzc2FnZSBhZnRlciAke3RoaXMucmV0cnlBdHRlbXB0c30gYXR0ZW1wdHM6ICR7bGFzdEVycm9yPy5tZXNzYWdlIHx8IFwiVW5rbm93biBlcnJvclwifWAsXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgZXJyb3IgaXMgYSByYXRlIGxpbWl0IGVycm9yXG4gICAgICovXG4gICAgcHJpdmF0ZSBpc1JhdGVMaW1pdEVycm9yKGVycm9yOiBFcnJvcik6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBlcnIgPSBlcnJvciBhcyBhbnk7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBlcnIuc3RhdHVzID09PSA0MjkgfHxcbiAgICAgICAgICAgIC9yYXRlIGxpbWl0fHF1b3RhfG92ZXJsb2FkZWR8Y2FwYWNpdHkvaS50ZXN0KGVycm9yLm1lc3NhZ2UpXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlIGJhY2tvZmYgZGVsYXkgd2l0aCBqaXR0ZXJcbiAgICAgKi9cbiAgICBwcml2YXRlIGdldEJhY2tvZmZEZWxheShhdHRlbXB0OiBudW1iZXIsIGlzUmF0ZUxpbWl0OiBib29sZWFuKTogbnVtYmVyIHtcbiAgICAgICAgY29uc3QgYmFzZSA9IGlzUmF0ZUxpbWl0ID8gNTAwMCA6IDEwMDA7IC8vIDVzIGZvciByYXRlIGxpbWl0LCAxcyBvdGhlcndpc2VcbiAgICAgICAgY29uc3QgZXhwb25lbnRpYWwgPSBiYXNlICogMiAqKiAoYXR0ZW1wdCAtIDEpO1xuICAgICAgICBjb25zdCBqaXR0ZXIgPSBNYXRoLnJhbmRvbSgpICogMTAwMDsgLy8gQWRkIHVwIHRvIDFzIGppdHRlclxuICAgICAgICByZXR1cm4gTWF0aC5taW4oZXhwb25lbnRpYWwgKyBqaXR0ZXIsIDYwMDAwKTsgLy8gbWF4IDYwc1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEhhbmRsZSBzZXNzaW9uIGNsb3N1cmUgd2l0aCBlcnJvciBoYW5kbGluZ1xuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgaGFuZGxlU2Vzc2lvbkNsb3NlKHNlc3Npb25JZDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBOb3RlOiBPcGVuQ29kZSBTREsgbWlnaHQgbm90IGhhdmUgYW4gZXhwbGljaXQgY2xvc2UgbWV0aG9kXG4gICAgICAgICAgICAvLyBGb3Igbm93LCB3ZSdsbCBqdXN0IHJlbW92ZSBmcm9tIG91ciBhY3RpdmUgc2Vzc2lvbnNcbiAgICAgICAgICAgIC8vIEluIGEgcmVhbCBpbXBsZW1lbnRhdGlvbiwgd2UnZCBjYWxsIFNESydzIGRlbGV0ZSBtZXRob2QgaWYgYXZhaWxhYmxlXG4gICAgICAgICAgICBsb2cuZGVidWcoXCJTZXNzaW9uIGNsb3NlZFwiLCB7IHNlc3Npb25JZCB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9XG4gICAgICAgICAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICAgICAgbG9nLndhcm4oXCJGYWlsZWQgdG8gY2xvc2Ugc2Vzc2lvblwiLCB7XG4gICAgICAgICAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlIGEgdW5pcXVlIHNlc3Npb24gSUQgaWYgU0RLIGRvZXNuJ3QgcHJvdmlkZSBvbmVcbiAgICAgKi9cbiAgICBwcml2YXRlIGdlbmVyYXRlU2Vzc2lvbklkKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBgc2Vzc2lvbi0ke0RhdGUubm93KCl9LSR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDkpfWA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2VuZXJhdGUgYSBwcm9wZXJseSBmb3JtYXR0ZWQgbWVzc2FnZSBJRCB3aXRoIG1zZ18gcHJlZml4XG4gICAgICogRm9ybWF0OiBtc2dfPHRpbWVzdGFtcD5fPHJhbmRvbT5cbiAgICAgKi9cbiAgICBwcml2YXRlIGdlbmVyYXRlTWVzc2FnZUlkKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBgbXNnXyR7RGF0ZS5ub3coKX1fJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoMiwgOCl9YDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDbGVhbnVwIG1ldGhvZCB0byBjbG9zZSBhbGwgc2Vzc2lvbnMgYW5kIHNlcnZlclxuICAgICAqL1xuICAgIGFzeW5jIGNsZWFudXAoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsb2cuZGVidWcoXCJTdGFydGluZyBjbGVhbnVwLi4uXCIsIHtcbiAgICAgICAgICAgICAgICBhY3RpdmVTZXNzaW9uczogdGhpcy5hY3RpdmVTZXNzaW9ucy5zaXplLFxuICAgICAgICAgICAgICAgIGhhc1NlcnZlcjogISF0aGlzLnNlcnZlcixcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBDbG9zZSBhbGwgYWN0aXZlIHNlc3Npb25zXG4gICAgICAgICAgICBhd2FpdCB0aGlzLmNsb3NlQWxsU2Vzc2lvbnMoKTtcblxuICAgICAgICAgICAgLy8gU3RvcCB0aGUgT3BlbkNvZGUgc2VydmVyIGlmIHdlIHN0YXJ0ZWQgb25lXG4gICAgICAgICAgICBpZiAodGhpcy5zZXJ2ZXIpIHtcbiAgICAgICAgICAgICAgICBsb2cuaW5mbyhcIkNsb3Npbmcgc3Bhd25lZCBPcGVuQ29kZSBzZXJ2ZXJcIik7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXJ2ZXIuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXJ2ZXIgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICBsb2cuaW5mbyhcIk9wZW5Db2RlIHNlcnZlciBjbG9zZWQgc3VjY2Vzc2Z1bGx5XCIpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTXNnID1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgbG9nLmVycm9yKFwiRXJyb3IgY2xvc2luZyBPcGVuQ29kZSBzZXJ2ZXJcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yTXNnLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcbiAgICAgICAgICAgICAgICAgICAgXCJObyBzcGF3bmVkIHNlcnZlciB0byBjbG9zZSAoY29ubmVjdGVkIHRvIGV4aXN0aW5nIHNlcnZlcilcIixcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsb2cuaW5mbyhcIkNsZWFudXAgY29tcGxldGVcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1zZyA9XG4gICAgICAgICAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICAgICAgbG9nLmVycm9yKFwiRXJyb3IgZHVyaW5nIE9wZW5Db2RlIGNsaWVudCBjbGVhbnVwXCIsIHtcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JNc2csXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsCiAgICAiLy8gVGhpcyBmaWxlIGlzIGF1dG8tZ2VuZXJhdGVkIGJ5IEBoZXktYXBpL29wZW5hcGktdHNcbmV4cG9ydCBjb25zdCBjcmVhdGVTc2VDbGllbnQgPSAoeyBvblNzZUVycm9yLCBvblNzZUV2ZW50LCByZXNwb25zZVRyYW5zZm9ybWVyLCByZXNwb25zZVZhbGlkYXRvciwgc3NlRGVmYXVsdFJldHJ5RGVsYXksIHNzZU1heFJldHJ5QXR0ZW1wdHMsIHNzZU1heFJldHJ5RGVsYXksIHNzZVNsZWVwRm4sIHVybCwgLi4ub3B0aW9ucyB9KSA9PiB7XG4gICAgbGV0IGxhc3RFdmVudElkO1xuICAgIGNvbnN0IHNsZWVwID0gc3NlU2xlZXBGbiA/PyAoKG1zKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gc2V0VGltZW91dChyZXNvbHZlLCBtcykpKTtcbiAgICBjb25zdCBjcmVhdGVTdHJlYW0gPSBhc3luYyBmdW5jdGlvbiogKCkge1xuICAgICAgICBsZXQgcmV0cnlEZWxheSA9IHNzZURlZmF1bHRSZXRyeURlbGF5ID8/IDMwMDA7XG4gICAgICAgIGxldCBhdHRlbXB0ID0gMDtcbiAgICAgICAgY29uc3Qgc2lnbmFsID0gb3B0aW9ucy5zaWduYWwgPz8gbmV3IEFib3J0Q29udHJvbGxlcigpLnNpZ25hbDtcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgIGlmIChzaWduYWwuYWJvcnRlZClcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGF0dGVtcHQrKztcbiAgICAgICAgICAgIGNvbnN0IGhlYWRlcnMgPSBvcHRpb25zLmhlYWRlcnMgaW5zdGFuY2VvZiBIZWFkZXJzXG4gICAgICAgICAgICAgICAgPyBvcHRpb25zLmhlYWRlcnNcbiAgICAgICAgICAgICAgICA6IG5ldyBIZWFkZXJzKG9wdGlvbnMuaGVhZGVycyk7XG4gICAgICAgICAgICBpZiAobGFzdEV2ZW50SWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGhlYWRlcnMuc2V0KFwiTGFzdC1FdmVudC1JRFwiLCBsYXN0RXZlbnRJZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCB7IC4uLm9wdGlvbnMsIGhlYWRlcnMsIHNpZ25hbCB9KTtcbiAgICAgICAgICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFNTRSBmYWlsZWQ6ICR7cmVzcG9uc2Uuc3RhdHVzfSAke3Jlc3BvbnNlLnN0YXR1c1RleHR9YCk7XG4gICAgICAgICAgICAgICAgaWYgKCFyZXNwb25zZS5ib2R5KVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBib2R5IGluIFNTRSByZXNwb25zZVwiKTtcbiAgICAgICAgICAgICAgICBjb25zdCByZWFkZXIgPSByZXNwb25zZS5ib2R5LnBpcGVUaHJvdWdoKG5ldyBUZXh0RGVjb2RlclN0cmVhbSgpKS5nZXRSZWFkZXIoKTtcbiAgICAgICAgICAgICAgICBsZXQgYnVmZmVyID0gXCJcIjtcbiAgICAgICAgICAgICAgICBjb25zdCBhYm9ydEhhbmRsZXIgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWFkZXIuY2FuY2VsKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2F0Y2gge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbm9vcFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBzaWduYWwuYWRkRXZlbnRMaXN0ZW5lcihcImFib3J0XCIsIGFib3J0SGFuZGxlcik7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHsgZG9uZSwgdmFsdWUgfSA9IGF3YWl0IHJlYWRlci5yZWFkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZG9uZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZmZlciArPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNodW5rcyA9IGJ1ZmZlci5zcGxpdChcIlxcblxcblwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZmZlciA9IGNodW5rcy5wb3AoKSA/PyBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBjaHVuayBvZiBjaHVua3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsaW5lcyA9IGNodW5rLnNwbGl0KFwiXFxuXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRhdGFMaW5lcyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBldmVudE5hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBsaW5lIG9mIGxpbmVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgoXCJkYXRhOlwiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YUxpbmVzLnB1c2gobGluZS5yZXBsYWNlKC9eZGF0YTpcXHMqLywgXCJcIikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGxpbmUuc3RhcnRzV2l0aChcImV2ZW50OlwiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lID0gbGluZS5yZXBsYWNlKC9eZXZlbnQ6XFxzKi8sIFwiXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGxpbmUuc3RhcnRzV2l0aChcImlkOlwiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdEV2ZW50SWQgPSBsaW5lLnJlcGxhY2UoL15pZDpcXHMqLywgXCJcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobGluZS5zdGFydHNXaXRoKFwicmV0cnk6XCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJzZWQgPSBOdW1iZXIucGFyc2VJbnQobGluZS5yZXBsYWNlKC9ecmV0cnk6XFxzKi8sIFwiXCIpLCAxMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIU51bWJlci5pc05hTihwYXJzZWQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0cnlEZWxheSA9IHBhcnNlZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGFyc2VkSnNvbiA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRhTGluZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJhd0RhdGEgPSBkYXRhTGluZXMuam9pbihcIlxcblwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEgPSBKU09OLnBhcnNlKHJhd0RhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VkSnNvbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0Y2gge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YSA9IHJhd0RhdGE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnNlZEpzb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlVmFsaWRhdG9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCByZXNwb25zZVZhbGlkYXRvcihkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2VUcmFuc2Zvcm1lcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YSA9IGF3YWl0IHJlc3BvbnNlVHJhbnNmb3JtZXIoZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Tc2VFdmVudD8uKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQ6IGV2ZW50TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGxhc3RFdmVudElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXRyeTogcmV0cnlEZWxheSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YUxpbmVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5aWVsZCBkYXRhO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgc2lnbmFsLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJhYm9ydFwiLCBhYm9ydEhhbmRsZXIpO1xuICAgICAgICAgICAgICAgICAgICByZWFkZXIucmVsZWFzZUxvY2soKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7IC8vIGV4aXQgbG9vcCBvbiBub3JtYWwgY29tcGxldGlvblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgLy8gY29ubmVjdGlvbiBmYWlsZWQgb3IgYWJvcnRlZDsgcmV0cnkgYWZ0ZXIgZGVsYXlcbiAgICAgICAgICAgICAgICBvblNzZUVycm9yPy4oZXJyb3IpO1xuICAgICAgICAgICAgICAgIGlmIChzc2VNYXhSZXRyeUF0dGVtcHRzICE9PSB1bmRlZmluZWQgJiYgYXR0ZW1wdCA+PSBzc2VNYXhSZXRyeUF0dGVtcHRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrOyAvLyBzdG9wIGFmdGVyIGZpcmluZyBlcnJvclxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBleHBvbmVudGlhbCBiYWNrb2ZmOiBkb3VibGUgcmV0cnkgZWFjaCBhdHRlbXB0LCBjYXAgYXQgMzBzXG4gICAgICAgICAgICAgICAgY29uc3QgYmFja29mZiA9IE1hdGgubWluKHJldHJ5RGVsYXkgKiAyICoqIChhdHRlbXB0IC0gMSksIHNzZU1heFJldHJ5RGVsYXkgPz8gMzAwMDApO1xuICAgICAgICAgICAgICAgIGF3YWl0IHNsZWVwKGJhY2tvZmYpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICBjb25zdCBzdHJlYW0gPSBjcmVhdGVTdHJlYW0oKTtcbiAgICByZXR1cm4geyBzdHJlYW0gfTtcbn07XG4iLAogICAgIi8vIFRoaXMgZmlsZSBpcyBhdXRvLWdlbmVyYXRlZCBieSBAaGV5LWFwaS9vcGVuYXBpLXRzXG5leHBvcnQgY29uc3QgZ2V0QXV0aFRva2VuID0gYXN5bmMgKGF1dGgsIGNhbGxiYWNrKSA9PiB7XG4gICAgY29uc3QgdG9rZW4gPSB0eXBlb2YgY2FsbGJhY2sgPT09IFwiZnVuY3Rpb25cIiA/IGF3YWl0IGNhbGxiYWNrKGF1dGgpIDogY2FsbGJhY2s7XG4gICAgaWYgKCF0b2tlbikge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChhdXRoLnNjaGVtZSA9PT0gXCJiZWFyZXJcIikge1xuICAgICAgICByZXR1cm4gYEJlYXJlciAke3Rva2VufWA7XG4gICAgfVxuICAgIGlmIChhdXRoLnNjaGVtZSA9PT0gXCJiYXNpY1wiKSB7XG4gICAgICAgIHJldHVybiBgQmFzaWMgJHtidG9hKHRva2VuKX1gO1xuICAgIH1cbiAgICByZXR1cm4gdG9rZW47XG59O1xuIiwKICAgICIvLyBUaGlzIGZpbGUgaXMgYXV0by1nZW5lcmF0ZWQgYnkgQGhleS1hcGkvb3BlbmFwaS10c1xuY29uc3Qgc2VyaWFsaXplRm9ybURhdGFQYWlyID0gKGRhdGEsIGtleSwgdmFsdWUpID0+IHtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiIHx8IHZhbHVlIGluc3RhbmNlb2YgQmxvYikge1xuICAgICAgICBkYXRhLmFwcGVuZChrZXksIHZhbHVlKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodmFsdWUgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgICAgIGRhdGEuYXBwZW5kKGtleSwgdmFsdWUudG9JU09TdHJpbmcoKSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBkYXRhLmFwcGVuZChrZXksIEpTT04uc3RyaW5naWZ5KHZhbHVlKSk7XG4gICAgfVxufTtcbmNvbnN0IHNlcmlhbGl6ZVVybFNlYXJjaFBhcmFtc1BhaXIgPSAoZGF0YSwga2V5LCB2YWx1ZSkgPT4ge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgZGF0YS5hcHBlbmQoa2V5LCB2YWx1ZSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBkYXRhLmFwcGVuZChrZXksIEpTT04uc3RyaW5naWZ5KHZhbHVlKSk7XG4gICAgfVxufTtcbmV4cG9ydCBjb25zdCBmb3JtRGF0YUJvZHlTZXJpYWxpemVyID0ge1xuICAgIGJvZHlTZXJpYWxpemVyOiAoYm9keSkgPT4ge1xuICAgICAgICBjb25zdCBkYXRhID0gbmV3IEZvcm1EYXRhKCk7XG4gICAgICAgIE9iamVjdC5lbnRyaWVzKGJvZHkpLmZvckVhY2goKFtrZXksIHZhbHVlXSkgPT4ge1xuICAgICAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZS5mb3JFYWNoKCh2KSA9PiBzZXJpYWxpemVGb3JtRGF0YVBhaXIoZGF0YSwga2V5LCB2KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZXJpYWxpemVGb3JtRGF0YVBhaXIoZGF0YSwga2V5LCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9LFxufTtcbmV4cG9ydCBjb25zdCBqc29uQm9keVNlcmlhbGl6ZXIgPSB7XG4gICAgYm9keVNlcmlhbGl6ZXI6IChib2R5KSA9PiBKU09OLnN0cmluZ2lmeShib2R5LCAoX2tleSwgdmFsdWUpID0+ICh0eXBlb2YgdmFsdWUgPT09IFwiYmlnaW50XCIgPyB2YWx1ZS50b1N0cmluZygpIDogdmFsdWUpKSxcbn07XG5leHBvcnQgY29uc3QgdXJsU2VhcmNoUGFyYW1zQm9keVNlcmlhbGl6ZXIgPSB7XG4gICAgYm9keVNlcmlhbGl6ZXI6IChib2R5KSA9PiB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKCk7XG4gICAgICAgIE9iamVjdC5lbnRyaWVzKGJvZHkpLmZvckVhY2goKFtrZXksIHZhbHVlXSkgPT4ge1xuICAgICAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZS5mb3JFYWNoKCh2KSA9PiBzZXJpYWxpemVVcmxTZWFyY2hQYXJhbXNQYWlyKGRhdGEsIGtleSwgdikpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VyaWFsaXplVXJsU2VhcmNoUGFyYW1zUGFpcihkYXRhLCBrZXksIHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBkYXRhLnRvU3RyaW5nKCk7XG4gICAgfSxcbn07XG4iLAogICAgIi8vIFRoaXMgZmlsZSBpcyBhdXRvLWdlbmVyYXRlZCBieSBAaGV5LWFwaS9vcGVuYXBpLXRzXG5leHBvcnQgY29uc3Qgc2VwYXJhdG9yQXJyYXlFeHBsb2RlID0gKHN0eWxlKSA9PiB7XG4gICAgc3dpdGNoIChzdHlsZSkge1xuICAgICAgICBjYXNlIFwibGFiZWxcIjpcbiAgICAgICAgICAgIHJldHVybiBcIi5cIjtcbiAgICAgICAgY2FzZSBcIm1hdHJpeFwiOlxuICAgICAgICAgICAgcmV0dXJuIFwiO1wiO1xuICAgICAgICBjYXNlIFwic2ltcGxlXCI6XG4gICAgICAgICAgICByZXR1cm4gXCIsXCI7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gXCImXCI7XG4gICAgfVxufTtcbmV4cG9ydCBjb25zdCBzZXBhcmF0b3JBcnJheU5vRXhwbG9kZSA9IChzdHlsZSkgPT4ge1xuICAgIHN3aXRjaCAoc3R5bGUpIHtcbiAgICAgICAgY2FzZSBcImZvcm1cIjpcbiAgICAgICAgICAgIHJldHVybiBcIixcIjtcbiAgICAgICAgY2FzZSBcInBpcGVEZWxpbWl0ZWRcIjpcbiAgICAgICAgICAgIHJldHVybiBcInxcIjtcbiAgICAgICAgY2FzZSBcInNwYWNlRGVsaW1pdGVkXCI6XG4gICAgICAgICAgICByZXR1cm4gXCIlMjBcIjtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiBcIixcIjtcbiAgICB9XG59O1xuZXhwb3J0IGNvbnN0IHNlcGFyYXRvck9iamVjdEV4cGxvZGUgPSAoc3R5bGUpID0+IHtcbiAgICBzd2l0Y2ggKHN0eWxlKSB7XG4gICAgICAgIGNhc2UgXCJsYWJlbFwiOlxuICAgICAgICAgICAgcmV0dXJuIFwiLlwiO1xuICAgICAgICBjYXNlIFwibWF0cml4XCI6XG4gICAgICAgICAgICByZXR1cm4gXCI7XCI7XG4gICAgICAgIGNhc2UgXCJzaW1wbGVcIjpcbiAgICAgICAgICAgIHJldHVybiBcIixcIjtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiBcIiZcIjtcbiAgICB9XG59O1xuZXhwb3J0IGNvbnN0IHNlcmlhbGl6ZUFycmF5UGFyYW0gPSAoeyBhbGxvd1Jlc2VydmVkLCBleHBsb2RlLCBuYW1lLCBzdHlsZSwgdmFsdWUsIH0pID0+IHtcbiAgICBpZiAoIWV4cGxvZGUpIHtcbiAgICAgICAgY29uc3Qgam9pbmVkVmFsdWVzID0gKGFsbG93UmVzZXJ2ZWQgPyB2YWx1ZSA6IHZhbHVlLm1hcCgodikgPT4gZW5jb2RlVVJJQ29tcG9uZW50KHYpKSkuam9pbihzZXBhcmF0b3JBcnJheU5vRXhwbG9kZShzdHlsZSkpO1xuICAgICAgICBzd2l0Y2ggKHN0eWxlKSB7XG4gICAgICAgICAgICBjYXNlIFwibGFiZWxcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gYC4ke2pvaW5lZFZhbHVlc31gO1xuICAgICAgICAgICAgY2FzZSBcIm1hdHJpeFwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBgOyR7bmFtZX09JHtqb2luZWRWYWx1ZXN9YDtcbiAgICAgICAgICAgIGNhc2UgXCJzaW1wbGVcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gam9pbmVkVmFsdWVzO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7bmFtZX09JHtqb2luZWRWYWx1ZXN9YDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBzZXBhcmF0b3IgPSBzZXBhcmF0b3JBcnJheUV4cGxvZGUoc3R5bGUpO1xuICAgIGNvbnN0IGpvaW5lZFZhbHVlcyA9IHZhbHVlXG4gICAgICAgIC5tYXAoKHYpID0+IHtcbiAgICAgICAgaWYgKHN0eWxlID09PSBcImxhYmVsXCIgfHwgc3R5bGUgPT09IFwic2ltcGxlXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBhbGxvd1Jlc2VydmVkID8gdiA6IGVuY29kZVVSSUNvbXBvbmVudCh2KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2VyaWFsaXplUHJpbWl0aXZlUGFyYW0oe1xuICAgICAgICAgICAgYWxsb3dSZXNlcnZlZCxcbiAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICB2YWx1ZTogdixcbiAgICAgICAgfSk7XG4gICAgfSlcbiAgICAgICAgLmpvaW4oc2VwYXJhdG9yKTtcbiAgICByZXR1cm4gc3R5bGUgPT09IFwibGFiZWxcIiB8fCBzdHlsZSA9PT0gXCJtYXRyaXhcIiA/IHNlcGFyYXRvciArIGpvaW5lZFZhbHVlcyA6IGpvaW5lZFZhbHVlcztcbn07XG5leHBvcnQgY29uc3Qgc2VyaWFsaXplUHJpbWl0aXZlUGFyYW0gPSAoeyBhbGxvd1Jlc2VydmVkLCBuYW1lLCB2YWx1ZSB9KSA9PiB7XG4gICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRGVlcGx5LW5lc3RlZCBhcnJheXMvb2JqZWN0cyBhcmVu4oCZdCBzdXBwb3J0ZWQuIFByb3ZpZGUgeW91ciBvd24gYHF1ZXJ5U2VyaWFsaXplcigpYCB0byBoYW5kbGUgdGhlc2UuXCIpO1xuICAgIH1cbiAgICByZXR1cm4gYCR7bmFtZX09JHthbGxvd1Jlc2VydmVkID8gdmFsdWUgOiBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpfWA7XG59O1xuZXhwb3J0IGNvbnN0IHNlcmlhbGl6ZU9iamVjdFBhcmFtID0gKHsgYWxsb3dSZXNlcnZlZCwgZXhwbG9kZSwgbmFtZSwgc3R5bGUsIHZhbHVlLCB2YWx1ZU9ubHksIH0pID0+IHtcbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZU9ubHkgPyB2YWx1ZS50b0lTT1N0cmluZygpIDogYCR7bmFtZX09JHt2YWx1ZS50b0lTT1N0cmluZygpfWA7XG4gICAgfVxuICAgIGlmIChzdHlsZSAhPT0gXCJkZWVwT2JqZWN0XCIgJiYgIWV4cGxvZGUpIHtcbiAgICAgICAgbGV0IHZhbHVlcyA9IFtdO1xuICAgICAgICBPYmplY3QuZW50cmllcyh2YWx1ZSkuZm9yRWFjaCgoW2tleSwgdl0pID0+IHtcbiAgICAgICAgICAgIHZhbHVlcyA9IFsuLi52YWx1ZXMsIGtleSwgYWxsb3dSZXNlcnZlZCA/IHYgOiBlbmNvZGVVUklDb21wb25lbnQodildO1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc3Qgam9pbmVkVmFsdWVzID0gdmFsdWVzLmpvaW4oXCIsXCIpO1xuICAgICAgICBzd2l0Y2ggKHN0eWxlKSB7XG4gICAgICAgICAgICBjYXNlIFwiZm9ybVwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBgJHtuYW1lfT0ke2pvaW5lZFZhbHVlc31gO1xuICAgICAgICAgICAgY2FzZSBcImxhYmVsXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAuJHtqb2luZWRWYWx1ZXN9YDtcbiAgICAgICAgICAgIGNhc2UgXCJtYXRyaXhcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gYDske25hbWV9PSR7am9pbmVkVmFsdWVzfWA7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiBqb2luZWRWYWx1ZXM7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3Qgc2VwYXJhdG9yID0gc2VwYXJhdG9yT2JqZWN0RXhwbG9kZShzdHlsZSk7XG4gICAgY29uc3Qgam9pbmVkVmFsdWVzID0gT2JqZWN0LmVudHJpZXModmFsdWUpXG4gICAgICAgIC5tYXAoKFtrZXksIHZdKSA9PiBzZXJpYWxpemVQcmltaXRpdmVQYXJhbSh7XG4gICAgICAgIGFsbG93UmVzZXJ2ZWQsXG4gICAgICAgIG5hbWU6IHN0eWxlID09PSBcImRlZXBPYmplY3RcIiA/IGAke25hbWV9WyR7a2V5fV1gIDoga2V5LFxuICAgICAgICB2YWx1ZTogdixcbiAgICB9KSlcbiAgICAgICAgLmpvaW4oc2VwYXJhdG9yKTtcbiAgICByZXR1cm4gc3R5bGUgPT09IFwibGFiZWxcIiB8fCBzdHlsZSA9PT0gXCJtYXRyaXhcIiA/IHNlcGFyYXRvciArIGpvaW5lZFZhbHVlcyA6IGpvaW5lZFZhbHVlcztcbn07XG4iLAogICAgIi8vIFRoaXMgZmlsZSBpcyBhdXRvLWdlbmVyYXRlZCBieSBAaGV5LWFwaS9vcGVuYXBpLXRzXG5pbXBvcnQgeyBzZXJpYWxpemVBcnJheVBhcmFtLCBzZXJpYWxpemVPYmplY3RQYXJhbSwgc2VyaWFsaXplUHJpbWl0aXZlUGFyYW0sIH0gZnJvbSBcIi4vcGF0aFNlcmlhbGl6ZXIuZ2VuLmpzXCI7XG5leHBvcnQgY29uc3QgUEFUSF9QQVJBTV9SRSA9IC9cXHtbXnt9XStcXH0vZztcbmV4cG9ydCBjb25zdCBkZWZhdWx0UGF0aFNlcmlhbGl6ZXIgPSAoeyBwYXRoLCB1cmw6IF91cmwgfSkgPT4ge1xuICAgIGxldCB1cmwgPSBfdXJsO1xuICAgIGNvbnN0IG1hdGNoZXMgPSBfdXJsLm1hdGNoKFBBVEhfUEFSQU1fUkUpO1xuICAgIGlmIChtYXRjaGVzKSB7XG4gICAgICAgIGZvciAoY29uc3QgbWF0Y2ggb2YgbWF0Y2hlcykge1xuICAgICAgICAgICAgbGV0IGV4cGxvZGUgPSBmYWxzZTtcbiAgICAgICAgICAgIGxldCBuYW1lID0gbWF0Y2guc3Vic3RyaW5nKDEsIG1hdGNoLmxlbmd0aCAtIDEpO1xuICAgICAgICAgICAgbGV0IHN0eWxlID0gXCJzaW1wbGVcIjtcbiAgICAgICAgICAgIGlmIChuYW1lLmVuZHNXaXRoKFwiKlwiKSkge1xuICAgICAgICAgICAgICAgIGV4cGxvZGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cmluZygwLCBuYW1lLmxlbmd0aCAtIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG5hbWUuc3RhcnRzV2l0aChcIi5cIikpIHtcbiAgICAgICAgICAgICAgICBuYW1lID0gbmFtZS5zdWJzdHJpbmcoMSk7XG4gICAgICAgICAgICAgICAgc3R5bGUgPSBcImxhYmVsXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChuYW1lLnN0YXJ0c1dpdGgoXCI7XCIpKSB7XG4gICAgICAgICAgICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyaW5nKDEpO1xuICAgICAgICAgICAgICAgIHN0eWxlID0gXCJtYXRyaXhcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gcGF0aFtuYW1lXTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICB1cmwgPSB1cmwucmVwbGFjZShtYXRjaCwgc2VyaWFsaXplQXJyYXlQYXJhbSh7IGV4cGxvZGUsIG5hbWUsIHN0eWxlLCB2YWx1ZSB9KSk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICAgICAgdXJsID0gdXJsLnJlcGxhY2UobWF0Y2gsIHNlcmlhbGl6ZU9iamVjdFBhcmFtKHtcbiAgICAgICAgICAgICAgICAgICAgZXhwbG9kZSxcbiAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgc3R5bGUsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVPbmx5OiB0cnVlLFxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzdHlsZSA9PT0gXCJtYXRyaXhcIikge1xuICAgICAgICAgICAgICAgIHVybCA9IHVybC5yZXBsYWNlKG1hdGNoLCBgOyR7c2VyaWFsaXplUHJpbWl0aXZlUGFyYW0oe1xuICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICAgICAgfSl9YCk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCByZXBsYWNlVmFsdWUgPSBlbmNvZGVVUklDb21wb25lbnQoc3R5bGUgPT09IFwibGFiZWxcIiA/IGAuJHt2YWx1ZX1gIDogdmFsdWUpO1xuICAgICAgICAgICAgdXJsID0gdXJsLnJlcGxhY2UobWF0Y2gsIHJlcGxhY2VWYWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHVybDtcbn07XG5leHBvcnQgY29uc3QgZ2V0VXJsID0gKHsgYmFzZVVybCwgcGF0aCwgcXVlcnksIHF1ZXJ5U2VyaWFsaXplciwgdXJsOiBfdXJsLCB9KSA9PiB7XG4gICAgY29uc3QgcGF0aFVybCA9IF91cmwuc3RhcnRzV2l0aChcIi9cIikgPyBfdXJsIDogYC8ke191cmx9YDtcbiAgICBsZXQgdXJsID0gKGJhc2VVcmwgPz8gXCJcIikgKyBwYXRoVXJsO1xuICAgIGlmIChwYXRoKSB7XG4gICAgICAgIHVybCA9IGRlZmF1bHRQYXRoU2VyaWFsaXplcih7IHBhdGgsIHVybCB9KTtcbiAgICB9XG4gICAgbGV0IHNlYXJjaCA9IHF1ZXJ5ID8gcXVlcnlTZXJpYWxpemVyKHF1ZXJ5KSA6IFwiXCI7XG4gICAgaWYgKHNlYXJjaC5zdGFydHNXaXRoKFwiP1wiKSkge1xuICAgICAgICBzZWFyY2ggPSBzZWFyY2guc3Vic3RyaW5nKDEpO1xuICAgIH1cbiAgICBpZiAoc2VhcmNoKSB7XG4gICAgICAgIHVybCArPSBgPyR7c2VhcmNofWA7XG4gICAgfVxuICAgIHJldHVybiB1cmw7XG59O1xuIiwKICAgICIvLyBUaGlzIGZpbGUgaXMgYXV0by1nZW5lcmF0ZWQgYnkgQGhleS1hcGkvb3BlbmFwaS10c1xuaW1wb3J0IHsgZ2V0QXV0aFRva2VuIH0gZnJvbSBcIi4uL2NvcmUvYXV0aC5nZW4uanNcIjtcbmltcG9ydCB7IGpzb25Cb2R5U2VyaWFsaXplciB9IGZyb20gXCIuLi9jb3JlL2JvZHlTZXJpYWxpemVyLmdlbi5qc1wiO1xuaW1wb3J0IHsgc2VyaWFsaXplQXJyYXlQYXJhbSwgc2VyaWFsaXplT2JqZWN0UGFyYW0sIHNlcmlhbGl6ZVByaW1pdGl2ZVBhcmFtIH0gZnJvbSBcIi4uL2NvcmUvcGF0aFNlcmlhbGl6ZXIuZ2VuLmpzXCI7XG5pbXBvcnQgeyBnZXRVcmwgfSBmcm9tIFwiLi4vY29yZS91dGlscy5nZW4uanNcIjtcbmV4cG9ydCBjb25zdCBjcmVhdGVRdWVyeVNlcmlhbGl6ZXIgPSAoeyBhbGxvd1Jlc2VydmVkLCBhcnJheSwgb2JqZWN0IH0gPSB7fSkgPT4ge1xuICAgIGNvbnN0IHF1ZXJ5U2VyaWFsaXplciA9IChxdWVyeVBhcmFtcykgPT4ge1xuICAgICAgICBjb25zdCBzZWFyY2ggPSBbXTtcbiAgICAgICAgaWYgKHF1ZXJ5UGFyYW1zICYmIHR5cGVvZiBxdWVyeVBhcmFtcyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgZm9yIChjb25zdCBuYW1lIGluIHF1ZXJ5UGFyYW1zKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBxdWVyeVBhcmFtc1tuYW1lXTtcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlcmlhbGl6ZWRBcnJheSA9IHNlcmlhbGl6ZUFycmF5UGFyYW0oe1xuICAgICAgICAgICAgICAgICAgICAgICAgYWxsb3dSZXNlcnZlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cGxvZGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IFwiZm9ybVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5hcnJheSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzZXJpYWxpemVkQXJyYXkpXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWFyY2gucHVzaChzZXJpYWxpemVkQXJyYXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VyaWFsaXplZE9iamVjdCA9IHNlcmlhbGl6ZU9iamVjdFBhcmFtKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsbG93UmVzZXJ2ZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBleHBsb2RlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiBcImRlZXBPYmplY3RcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLm9iamVjdCxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzZXJpYWxpemVkT2JqZWN0KVxuICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoLnB1c2goc2VyaWFsaXplZE9iamVjdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzZXJpYWxpemVkUHJpbWl0aXZlID0gc2VyaWFsaXplUHJpbWl0aXZlUGFyYW0oe1xuICAgICAgICAgICAgICAgICAgICAgICAgYWxsb3dSZXNlcnZlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2VyaWFsaXplZFByaW1pdGl2ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaC5wdXNoKHNlcmlhbGl6ZWRQcmltaXRpdmUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2VhcmNoLmpvaW4oXCImXCIpO1xuICAgIH07XG4gICAgcmV0dXJuIHF1ZXJ5U2VyaWFsaXplcjtcbn07XG4vKipcbiAqIEluZmVycyBwYXJzZUFzIHZhbHVlIGZyb20gcHJvdmlkZWQgQ29udGVudC1UeXBlIGhlYWRlci5cbiAqL1xuZXhwb3J0IGNvbnN0IGdldFBhcnNlQXMgPSAoY29udGVudFR5cGUpID0+IHtcbiAgICBpZiAoIWNvbnRlbnRUeXBlKSB7XG4gICAgICAgIC8vIElmIG5vIENvbnRlbnQtVHlwZSBoZWFkZXIgaXMgcHJvdmlkZWQsIHRoZSBiZXN0IHdlIGNhbiBkbyBpcyByZXR1cm4gdGhlIHJhdyByZXNwb25zZSBib2R5LFxuICAgICAgICAvLyB3aGljaCBpcyBlZmZlY3RpdmVseSB0aGUgc2FtZSBhcyB0aGUgJ3N0cmVhbScgb3B0aW9uLlxuICAgICAgICByZXR1cm4gXCJzdHJlYW1cIjtcbiAgICB9XG4gICAgY29uc3QgY2xlYW5Db250ZW50ID0gY29udGVudFR5cGUuc3BsaXQoXCI7XCIpWzBdPy50cmltKCk7XG4gICAgaWYgKCFjbGVhbkNvbnRlbnQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoY2xlYW5Db250ZW50LnN0YXJ0c1dpdGgoXCJhcHBsaWNhdGlvbi9qc29uXCIpIHx8IGNsZWFuQ29udGVudC5lbmRzV2l0aChcIitqc29uXCIpKSB7XG4gICAgICAgIHJldHVybiBcImpzb25cIjtcbiAgICB9XG4gICAgaWYgKGNsZWFuQ29udGVudCA9PT0gXCJtdWx0aXBhcnQvZm9ybS1kYXRhXCIpIHtcbiAgICAgICAgcmV0dXJuIFwiZm9ybURhdGFcIjtcbiAgICB9XG4gICAgaWYgKFtcImFwcGxpY2F0aW9uL1wiLCBcImF1ZGlvL1wiLCBcImltYWdlL1wiLCBcInZpZGVvL1wiXS5zb21lKCh0eXBlKSA9PiBjbGVhbkNvbnRlbnQuc3RhcnRzV2l0aCh0eXBlKSkpIHtcbiAgICAgICAgcmV0dXJuIFwiYmxvYlwiO1xuICAgIH1cbiAgICBpZiAoY2xlYW5Db250ZW50LnN0YXJ0c1dpdGgoXCJ0ZXh0L1wiKSkge1xuICAgICAgICByZXR1cm4gXCJ0ZXh0XCI7XG4gICAgfVxuICAgIHJldHVybjtcbn07XG5jb25zdCBjaGVja0ZvckV4aXN0ZW5jZSA9IChvcHRpb25zLCBuYW1lKSA9PiB7XG4gICAgaWYgKCFuYW1lKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMuaGVhZGVycy5oYXMobmFtZSkgfHwgb3B0aW9ucy5xdWVyeT8uW25hbWVdIHx8IG9wdGlvbnMuaGVhZGVycy5nZXQoXCJDb29raWVcIik/LmluY2x1ZGVzKGAke25hbWV9PWApKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59O1xuZXhwb3J0IGNvbnN0IHNldEF1dGhQYXJhbXMgPSBhc3luYyAoeyBzZWN1cml0eSwgLi4ub3B0aW9ucyB9KSA9PiB7XG4gICAgZm9yIChjb25zdCBhdXRoIG9mIHNlY3VyaXR5KSB7XG4gICAgICAgIGlmIChjaGVja0ZvckV4aXN0ZW5jZShvcHRpb25zLCBhdXRoLm5hbWUpKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0b2tlbiA9IGF3YWl0IGdldEF1dGhUb2tlbihhdXRoLCBvcHRpb25zLmF1dGgpO1xuICAgICAgICBpZiAoIXRva2VuKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBuYW1lID0gYXV0aC5uYW1lID8/IFwiQXV0aG9yaXphdGlvblwiO1xuICAgICAgICBzd2l0Y2ggKGF1dGguaW4pIHtcbiAgICAgICAgICAgIGNhc2UgXCJxdWVyeVwiOlxuICAgICAgICAgICAgICAgIGlmICghb3B0aW9ucy5xdWVyeSkge1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnF1ZXJ5ID0ge307XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG9wdGlvbnMucXVlcnlbbmFtZV0gPSB0b2tlbjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJjb29raWVcIjpcbiAgICAgICAgICAgICAgICBvcHRpb25zLmhlYWRlcnMuYXBwZW5kKFwiQ29va2llXCIsIGAke25hbWV9PSR7dG9rZW59YCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiaGVhZGVyXCI6XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIG9wdGlvbnMuaGVhZGVycy5zZXQobmFtZSwgdG9rZW4pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxufTtcbmV4cG9ydCBjb25zdCBidWlsZFVybCA9IChvcHRpb25zKSA9PiBnZXRVcmwoe1xuICAgIGJhc2VVcmw6IG9wdGlvbnMuYmFzZVVybCxcbiAgICBwYXRoOiBvcHRpb25zLnBhdGgsXG4gICAgcXVlcnk6IG9wdGlvbnMucXVlcnksXG4gICAgcXVlcnlTZXJpYWxpemVyOiB0eXBlb2Ygb3B0aW9ucy5xdWVyeVNlcmlhbGl6ZXIgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgICA/IG9wdGlvbnMucXVlcnlTZXJpYWxpemVyXG4gICAgICAgIDogY3JlYXRlUXVlcnlTZXJpYWxpemVyKG9wdGlvbnMucXVlcnlTZXJpYWxpemVyKSxcbiAgICB1cmw6IG9wdGlvbnMudXJsLFxufSk7XG5leHBvcnQgY29uc3QgbWVyZ2VDb25maWdzID0gKGEsIGIpID0+IHtcbiAgICBjb25zdCBjb25maWcgPSB7IC4uLmEsIC4uLmIgfTtcbiAgICBpZiAoY29uZmlnLmJhc2VVcmw/LmVuZHNXaXRoKFwiL1wiKSkge1xuICAgICAgICBjb25maWcuYmFzZVVybCA9IGNvbmZpZy5iYXNlVXJsLnN1YnN0cmluZygwLCBjb25maWcuYmFzZVVybC5sZW5ndGggLSAxKTtcbiAgICB9XG4gICAgY29uZmlnLmhlYWRlcnMgPSBtZXJnZUhlYWRlcnMoYS5oZWFkZXJzLCBiLmhlYWRlcnMpO1xuICAgIHJldHVybiBjb25maWc7XG59O1xuZXhwb3J0IGNvbnN0IG1lcmdlSGVhZGVycyA9ICguLi5oZWFkZXJzKSA9PiB7XG4gICAgY29uc3QgbWVyZ2VkSGVhZGVycyA9IG5ldyBIZWFkZXJzKCk7XG4gICAgZm9yIChjb25zdCBoZWFkZXIgb2YgaGVhZGVycykge1xuICAgICAgICBpZiAoIWhlYWRlciB8fCB0eXBlb2YgaGVhZGVyICE9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpdGVyYXRvciA9IGhlYWRlciBpbnN0YW5jZW9mIEhlYWRlcnMgPyBoZWFkZXIuZW50cmllcygpIDogT2JqZWN0LmVudHJpZXMoaGVhZGVyKTtcbiAgICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgaXRlcmF0b3IpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIG1lcmdlZEhlYWRlcnMuZGVsZXRlKGtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdiBvZiB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBtZXJnZWRIZWFkZXJzLmFwcGVuZChrZXksIHYpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAvLyBhc3N1bWUgb2JqZWN0IGhlYWRlcnMgYXJlIG1lYW50IHRvIGJlIEpTT04gc3RyaW5naWZpZWQsIGkuZS4gdGhlaXJcbiAgICAgICAgICAgICAgICAvLyBjb250ZW50IHZhbHVlIGluIE9wZW5BUEkgc3BlY2lmaWNhdGlvbiBpcyAnYXBwbGljYXRpb24vanNvbidcbiAgICAgICAgICAgICAgICBtZXJnZWRIZWFkZXJzLnNldChrZXksIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiA/IEpTT04uc3RyaW5naWZ5KHZhbHVlKSA6IHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWVyZ2VkSGVhZGVycztcbn07XG5jbGFzcyBJbnRlcmNlcHRvcnMge1xuICAgIF9mbnM7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuX2ZucyA9IFtdO1xuICAgIH1cbiAgICBjbGVhcigpIHtcbiAgICAgICAgdGhpcy5fZm5zID0gW107XG4gICAgfVxuICAgIGdldEludGVyY2VwdG9ySW5kZXgoaWQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpZCA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2Zuc1tpZF0gPyBpZCA6IC0xO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2Zucy5pbmRleE9mKGlkKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBleGlzdHMoaWQpIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmdldEludGVyY2VwdG9ySW5kZXgoaWQpO1xuICAgICAgICByZXR1cm4gISF0aGlzLl9mbnNbaW5kZXhdO1xuICAgIH1cbiAgICBlamVjdChpZCkge1xuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuZ2V0SW50ZXJjZXB0b3JJbmRleChpZCk7XG4gICAgICAgIGlmICh0aGlzLl9mbnNbaW5kZXhdKSB7XG4gICAgICAgICAgICB0aGlzLl9mbnNbaW5kZXhdID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbiAgICB1cGRhdGUoaWQsIGZuKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5nZXRJbnRlcmNlcHRvckluZGV4KGlkKTtcbiAgICAgICAgaWYgKHRoaXMuX2Zuc1tpbmRleF0pIHtcbiAgICAgICAgICAgIHRoaXMuX2Zuc1tpbmRleF0gPSBmbjtcbiAgICAgICAgICAgIHJldHVybiBpZDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB1c2UoZm4pIHtcbiAgICAgICAgdGhpcy5fZm5zID0gWy4uLnRoaXMuX2ZucywgZm5dO1xuICAgICAgICByZXR1cm4gdGhpcy5fZm5zLmxlbmd0aCAtIDE7XG4gICAgfVxufVxuLy8gZG8gbm90IGFkZCBgTWlkZGxld2FyZWAgYXMgcmV0dXJuIHR5cGUgc28gd2UgY2FuIHVzZSBfZm5zIGludGVybmFsbHlcbmV4cG9ydCBjb25zdCBjcmVhdGVJbnRlcmNlcHRvcnMgPSAoKSA9PiAoe1xuICAgIGVycm9yOiBuZXcgSW50ZXJjZXB0b3JzKCksXG4gICAgcmVxdWVzdDogbmV3IEludGVyY2VwdG9ycygpLFxuICAgIHJlc3BvbnNlOiBuZXcgSW50ZXJjZXB0b3JzKCksXG59KTtcbmNvbnN0IGRlZmF1bHRRdWVyeVNlcmlhbGl6ZXIgPSBjcmVhdGVRdWVyeVNlcmlhbGl6ZXIoe1xuICAgIGFsbG93UmVzZXJ2ZWQ6IGZhbHNlLFxuICAgIGFycmF5OiB7XG4gICAgICAgIGV4cGxvZGU6IHRydWUsXG4gICAgICAgIHN0eWxlOiBcImZvcm1cIixcbiAgICB9LFxuICAgIG9iamVjdDoge1xuICAgICAgICBleHBsb2RlOiB0cnVlLFxuICAgICAgICBzdHlsZTogXCJkZWVwT2JqZWN0XCIsXG4gICAgfSxcbn0pO1xuY29uc3QgZGVmYXVsdEhlYWRlcnMgPSB7XG4gICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG59O1xuZXhwb3J0IGNvbnN0IGNyZWF0ZUNvbmZpZyA9IChvdmVycmlkZSA9IHt9KSA9PiAoe1xuICAgIC4uLmpzb25Cb2R5U2VyaWFsaXplcixcbiAgICBoZWFkZXJzOiBkZWZhdWx0SGVhZGVycyxcbiAgICBwYXJzZUFzOiBcImF1dG9cIixcbiAgICBxdWVyeVNlcmlhbGl6ZXI6IGRlZmF1bHRRdWVyeVNlcmlhbGl6ZXIsXG4gICAgLi4ub3ZlcnJpZGUsXG59KTtcbiIsCiAgICAiLy8gVGhpcyBmaWxlIGlzIGF1dG8tZ2VuZXJhdGVkIGJ5IEBoZXktYXBpL29wZW5hcGktdHNcbmltcG9ydCB7IGNyZWF0ZVNzZUNsaWVudCB9IGZyb20gXCIuLi9jb3JlL3NlcnZlclNlbnRFdmVudHMuZ2VuLmpzXCI7XG5pbXBvcnQgeyBidWlsZFVybCwgY3JlYXRlQ29uZmlnLCBjcmVhdGVJbnRlcmNlcHRvcnMsIGdldFBhcnNlQXMsIG1lcmdlQ29uZmlncywgbWVyZ2VIZWFkZXJzLCBzZXRBdXRoUGFyYW1zLCB9IGZyb20gXCIuL3V0aWxzLmdlbi5qc1wiO1xuZXhwb3J0IGNvbnN0IGNyZWF0ZUNsaWVudCA9IChjb25maWcgPSB7fSkgPT4ge1xuICAgIGxldCBfY29uZmlnID0gbWVyZ2VDb25maWdzKGNyZWF0ZUNvbmZpZygpLCBjb25maWcpO1xuICAgIGNvbnN0IGdldENvbmZpZyA9ICgpID0+ICh7IC4uLl9jb25maWcgfSk7XG4gICAgY29uc3Qgc2V0Q29uZmlnID0gKGNvbmZpZykgPT4ge1xuICAgICAgICBfY29uZmlnID0gbWVyZ2VDb25maWdzKF9jb25maWcsIGNvbmZpZyk7XG4gICAgICAgIHJldHVybiBnZXRDb25maWcoKTtcbiAgICB9O1xuICAgIGNvbnN0IGludGVyY2VwdG9ycyA9IGNyZWF0ZUludGVyY2VwdG9ycygpO1xuICAgIGNvbnN0IGJlZm9yZVJlcXVlc3QgPSBhc3luYyAob3B0aW9ucykgPT4ge1xuICAgICAgICBjb25zdCBvcHRzID0ge1xuICAgICAgICAgICAgLi4uX2NvbmZpZyxcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBmZXRjaDogb3B0aW9ucy5mZXRjaCA/PyBfY29uZmlnLmZldGNoID8/IGdsb2JhbFRoaXMuZmV0Y2gsXG4gICAgICAgICAgICBoZWFkZXJzOiBtZXJnZUhlYWRlcnMoX2NvbmZpZy5oZWFkZXJzLCBvcHRpb25zLmhlYWRlcnMpLFxuICAgICAgICAgICAgc2VyaWFsaXplZEJvZHk6IHVuZGVmaW5lZCxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKG9wdHMuc2VjdXJpdHkpIHtcbiAgICAgICAgICAgIGF3YWl0IHNldEF1dGhQYXJhbXMoe1xuICAgICAgICAgICAgICAgIC4uLm9wdHMsXG4gICAgICAgICAgICAgICAgc2VjdXJpdHk6IG9wdHMuc2VjdXJpdHksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob3B0cy5yZXF1ZXN0VmFsaWRhdG9yKSB7XG4gICAgICAgICAgICBhd2FpdCBvcHRzLnJlcXVlc3RWYWxpZGF0b3Iob3B0cyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9wdHMuYm9keSAmJiBvcHRzLmJvZHlTZXJpYWxpemVyKSB7XG4gICAgICAgICAgICBvcHRzLnNlcmlhbGl6ZWRCb2R5ID0gb3B0cy5ib2R5U2VyaWFsaXplcihvcHRzLmJvZHkpO1xuICAgICAgICB9XG4gICAgICAgIC8vIHJlbW92ZSBDb250ZW50LVR5cGUgaGVhZGVyIGlmIGJvZHkgaXMgZW1wdHkgdG8gYXZvaWQgc2VuZGluZyBpbnZhbGlkIHJlcXVlc3RzXG4gICAgICAgIGlmIChvcHRzLnNlcmlhbGl6ZWRCb2R5ID09PSB1bmRlZmluZWQgfHwgb3B0cy5zZXJpYWxpemVkQm9keSA9PT0gXCJcIikge1xuICAgICAgICAgICAgb3B0cy5oZWFkZXJzLmRlbGV0ZShcIkNvbnRlbnQtVHlwZVwiKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB1cmwgPSBidWlsZFVybChvcHRzKTtcbiAgICAgICAgcmV0dXJuIHsgb3B0cywgdXJsIH07XG4gICAgfTtcbiAgICBjb25zdCByZXF1ZXN0ID0gYXN5bmMgKG9wdGlvbnMpID0+IHtcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgICAgICBjb25zdCB7IG9wdHMsIHVybCB9ID0gYXdhaXQgYmVmb3JlUmVxdWVzdChvcHRpb25zKTtcbiAgICAgICAgY29uc3QgcmVxdWVzdEluaXQgPSB7XG4gICAgICAgICAgICByZWRpcmVjdDogXCJmb2xsb3dcIixcbiAgICAgICAgICAgIC4uLm9wdHMsXG4gICAgICAgICAgICBib2R5OiBvcHRzLnNlcmlhbGl6ZWRCb2R5LFxuICAgICAgICB9O1xuICAgICAgICBsZXQgcmVxdWVzdCA9IG5ldyBSZXF1ZXN0KHVybCwgcmVxdWVzdEluaXQpO1xuICAgICAgICBmb3IgKGNvbnN0IGZuIG9mIGludGVyY2VwdG9ycy5yZXF1ZXN0Ll9mbnMpIHtcbiAgICAgICAgICAgIGlmIChmbikge1xuICAgICAgICAgICAgICAgIHJlcXVlc3QgPSBhd2FpdCBmbihyZXF1ZXN0LCBvcHRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBmZXRjaCBtdXN0IGJlIGFzc2lnbmVkIGhlcmUsIG90aGVyd2lzZSBpdCB3b3VsZCB0aHJvdyB0aGUgZXJyb3I6XG4gICAgICAgIC8vIFR5cGVFcnJvcjogRmFpbGVkIHRvIGV4ZWN1dGUgJ2ZldGNoJyBvbiAnV2luZG93JzogSWxsZWdhbCBpbnZvY2F0aW9uXG4gICAgICAgIGNvbnN0IF9mZXRjaCA9IG9wdHMuZmV0Y2g7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IF9mZXRjaChyZXF1ZXN0KTtcbiAgICAgICAgZm9yIChjb25zdCBmbiBvZiBpbnRlcmNlcHRvcnMucmVzcG9uc2UuX2Zucykge1xuICAgICAgICAgICAgaWYgKGZuKSB7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UgPSBhd2FpdCBmbihyZXNwb25zZSwgcmVxdWVzdCwgb3B0cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVzdWx0ID0ge1xuICAgICAgICAgICAgcmVxdWVzdCxcbiAgICAgICAgICAgIHJlc3BvbnNlLFxuICAgICAgICB9O1xuICAgICAgICBpZiAocmVzcG9uc2Uub2spIHtcbiAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPT09IDIwNCB8fCByZXNwb25zZS5oZWFkZXJzLmdldChcIkNvbnRlbnQtTGVuZ3RoXCIpID09PSBcIjBcIikge1xuICAgICAgICAgICAgICAgIHJldHVybiBvcHRzLnJlc3BvbnNlU3R5bGUgPT09IFwiZGF0YVwiXG4gICAgICAgICAgICAgICAgICAgID8ge31cbiAgICAgICAgICAgICAgICAgICAgOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLnJlc3VsdCxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHBhcnNlQXMgPSAob3B0cy5wYXJzZUFzID09PSBcImF1dG9cIiA/IGdldFBhcnNlQXMocmVzcG9uc2UuaGVhZGVycy5nZXQoXCJDb250ZW50LVR5cGVcIikpIDogb3B0cy5wYXJzZUFzKSA/PyBcImpzb25cIjtcbiAgICAgICAgICAgIGxldCBkYXRhO1xuICAgICAgICAgICAgc3dpdGNoIChwYXJzZUFzKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBcImFycmF5QnVmZmVyXCI6XG4gICAgICAgICAgICAgICAgY2FzZSBcImJsb2JcIjpcbiAgICAgICAgICAgICAgICBjYXNlIFwiZm9ybURhdGFcIjpcbiAgICAgICAgICAgICAgICBjYXNlIFwianNvblwiOlxuICAgICAgICAgICAgICAgIGNhc2UgXCJ0ZXh0XCI6XG4gICAgICAgICAgICAgICAgICAgIGRhdGEgPSBhd2FpdCByZXNwb25zZVtwYXJzZUFzXSgpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwic3RyZWFtXCI6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvcHRzLnJlc3BvbnNlU3R5bGUgPT09IFwiZGF0YVwiXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHJlc3BvbnNlLmJvZHlcbiAgICAgICAgICAgICAgICAgICAgICAgIDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHJlc3BvbnNlLmJvZHksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4ucmVzdWx0LFxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwYXJzZUFzID09PSBcImpzb25cIikge1xuICAgICAgICAgICAgICAgIGlmIChvcHRzLnJlc3BvbnNlVmFsaWRhdG9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IG9wdHMucmVzcG9uc2VWYWxpZGF0b3IoZGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChvcHRzLnJlc3BvbnNlVHJhbnNmb3JtZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YSA9IGF3YWl0IG9wdHMucmVzcG9uc2VUcmFuc2Zvcm1lcihkYXRhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gb3B0cy5yZXNwb25zZVN0eWxlID09PSBcImRhdGFcIlxuICAgICAgICAgICAgICAgID8gZGF0YVxuICAgICAgICAgICAgICAgIDoge1xuICAgICAgICAgICAgICAgICAgICBkYXRhLFxuICAgICAgICAgICAgICAgICAgICAuLi5yZXN1bHQsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0ZXh0RXJyb3IgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XG4gICAgICAgIGxldCBqc29uRXJyb3I7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBqc29uRXJyb3IgPSBKU09OLnBhcnNlKHRleHRFcnJvcik7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2gge1xuICAgICAgICAgICAgLy8gbm9vcFxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGVycm9yID0ganNvbkVycm9yID8/IHRleHRFcnJvcjtcbiAgICAgICAgbGV0IGZpbmFsRXJyb3IgPSBlcnJvcjtcbiAgICAgICAgZm9yIChjb25zdCBmbiBvZiBpbnRlcmNlcHRvcnMuZXJyb3IuX2Zucykge1xuICAgICAgICAgICAgaWYgKGZuKSB7XG4gICAgICAgICAgICAgICAgZmluYWxFcnJvciA9IChhd2FpdCBmbihlcnJvciwgcmVzcG9uc2UsIHJlcXVlc3QsIG9wdHMpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmaW5hbEVycm9yID0gZmluYWxFcnJvciB8fCB7fTtcbiAgICAgICAgaWYgKG9wdHMudGhyb3dPbkVycm9yKSB7XG4gICAgICAgICAgICB0aHJvdyBmaW5hbEVycm9yO1xuICAgICAgICB9XG4gICAgICAgIC8vIFRPRE86IHdlIHByb2JhYmx5IHdhbnQgdG8gcmV0dXJuIGVycm9yIGFuZCBpbXByb3ZlIHR5cGVzXG4gICAgICAgIHJldHVybiBvcHRzLnJlc3BvbnNlU3R5bGUgPT09IFwiZGF0YVwiXG4gICAgICAgICAgICA/IHVuZGVmaW5lZFxuICAgICAgICAgICAgOiB7XG4gICAgICAgICAgICAgICAgZXJyb3I6IGZpbmFsRXJyb3IsXG4gICAgICAgICAgICAgICAgLi4ucmVzdWx0LFxuICAgICAgICAgICAgfTtcbiAgICB9O1xuICAgIGNvbnN0IG1ha2VNZXRob2QgPSAobWV0aG9kKSA9PiB7XG4gICAgICAgIGNvbnN0IGZuID0gKG9wdGlvbnMpID0+IHJlcXVlc3QoeyAuLi5vcHRpb25zLCBtZXRob2QgfSk7XG4gICAgICAgIGZuLnNzZSA9IGFzeW5jIChvcHRpb25zKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB7IG9wdHMsIHVybCB9ID0gYXdhaXQgYmVmb3JlUmVxdWVzdChvcHRpb25zKTtcbiAgICAgICAgICAgIHJldHVybiBjcmVhdGVTc2VDbGllbnQoe1xuICAgICAgICAgICAgICAgIC4uLm9wdHMsXG4gICAgICAgICAgICAgICAgYm9keTogb3B0cy5ib2R5LFxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IG9wdHMuaGVhZGVycyxcbiAgICAgICAgICAgICAgICBtZXRob2QsXG4gICAgICAgICAgICAgICAgdXJsLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBmbjtcbiAgICB9O1xuICAgIHJldHVybiB7XG4gICAgICAgIGJ1aWxkVXJsLFxuICAgICAgICBjb25uZWN0OiBtYWtlTWV0aG9kKFwiQ09OTkVDVFwiKSxcbiAgICAgICAgZGVsZXRlOiBtYWtlTWV0aG9kKFwiREVMRVRFXCIpLFxuICAgICAgICBnZXQ6IG1ha2VNZXRob2QoXCJHRVRcIiksXG4gICAgICAgIGdldENvbmZpZyxcbiAgICAgICAgaGVhZDogbWFrZU1ldGhvZChcIkhFQURcIiksXG4gICAgICAgIGludGVyY2VwdG9ycyxcbiAgICAgICAgb3B0aW9uczogbWFrZU1ldGhvZChcIk9QVElPTlNcIiksXG4gICAgICAgIHBhdGNoOiBtYWtlTWV0aG9kKFwiUEFUQ0hcIiksXG4gICAgICAgIHBvc3Q6IG1ha2VNZXRob2QoXCJQT1NUXCIpLFxuICAgICAgICBwdXQ6IG1ha2VNZXRob2QoXCJQVVRcIiksXG4gICAgICAgIHJlcXVlc3QsXG4gICAgICAgIHNldENvbmZpZyxcbiAgICAgICAgdHJhY2U6IG1ha2VNZXRob2QoXCJUUkFDRVwiKSxcbiAgICB9O1xufTtcbiIsCiAgICAiLy8gVGhpcyBmaWxlIGlzIGF1dG8tZ2VuZXJhdGVkIGJ5IEBoZXktYXBpL29wZW5hcGktdHNcbmNvbnN0IGV4dHJhUHJlZml4ZXNNYXAgPSB7XG4gICAgJGJvZHlfOiBcImJvZHlcIixcbiAgICAkaGVhZGVyc186IFwiaGVhZGVyc1wiLFxuICAgICRwYXRoXzogXCJwYXRoXCIsXG4gICAgJHF1ZXJ5XzogXCJxdWVyeVwiLFxufTtcbmNvbnN0IGV4dHJhUHJlZml4ZXMgPSBPYmplY3QuZW50cmllcyhleHRyYVByZWZpeGVzTWFwKTtcbmNvbnN0IGJ1aWxkS2V5TWFwID0gKGZpZWxkcywgbWFwKSA9PiB7XG4gICAgaWYgKCFtYXApIHtcbiAgICAgICAgbWFwID0gbmV3IE1hcCgpO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IGNvbmZpZyBvZiBmaWVsZHMpIHtcbiAgICAgICAgaWYgKFwiaW5cIiBpbiBjb25maWcpIHtcbiAgICAgICAgICAgIGlmIChjb25maWcua2V5KSB7XG4gICAgICAgICAgICAgICAgbWFwLnNldChjb25maWcua2V5LCB7XG4gICAgICAgICAgICAgICAgICAgIGluOiBjb25maWcuaW4sXG4gICAgICAgICAgICAgICAgICAgIG1hcDogY29uZmlnLm1hcCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjb25maWcuYXJncykge1xuICAgICAgICAgICAgYnVpbGRLZXlNYXAoY29uZmlnLmFyZ3MsIG1hcCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG1hcDtcbn07XG5jb25zdCBzdHJpcEVtcHR5U2xvdHMgPSAocGFyYW1zKSA9PiB7XG4gICAgZm9yIChjb25zdCBbc2xvdCwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKHBhcmFtcykpIHtcbiAgICAgICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJiAhT2JqZWN0LmtleXModmFsdWUpLmxlbmd0aCkge1xuICAgICAgICAgICAgZGVsZXRlIHBhcmFtc1tzbG90XTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5leHBvcnQgY29uc3QgYnVpbGRDbGllbnRQYXJhbXMgPSAoYXJncywgZmllbGRzKSA9PiB7XG4gICAgY29uc3QgcGFyYW1zID0ge1xuICAgICAgICBib2R5OiB7fSxcbiAgICAgICAgaGVhZGVyczoge30sXG4gICAgICAgIHBhdGg6IHt9LFxuICAgICAgICBxdWVyeToge30sXG4gICAgfTtcbiAgICBjb25zdCBtYXAgPSBidWlsZEtleU1hcChmaWVsZHMpO1xuICAgIGxldCBjb25maWc7XG4gICAgZm9yIChjb25zdCBbaW5kZXgsIGFyZ10gb2YgYXJncy5lbnRyaWVzKCkpIHtcbiAgICAgICAgaWYgKGZpZWxkc1tpbmRleF0pIHtcbiAgICAgICAgICAgIGNvbmZpZyA9IGZpZWxkc1tpbmRleF07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFjb25maWcpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChcImluXCIgaW4gY29uZmlnKSB7XG4gICAgICAgICAgICBpZiAoY29uZmlnLmtleSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZpZWxkID0gbWFwLmdldChjb25maWcua2V5KTtcbiAgICAgICAgICAgICAgICBjb25zdCBuYW1lID0gZmllbGQubWFwIHx8IGNvbmZpZy5rZXk7XG4gICAgICAgICAgICAgICAgcGFyYW1zW2ZpZWxkLmluXVtuYW1lXSA9IGFyZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHBhcmFtcy5ib2R5ID0gYXJnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoYXJnID8/IHt9KSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZpZWxkID0gbWFwLmdldChrZXkpO1xuICAgICAgICAgICAgICAgIGlmIChmaWVsZCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBuYW1lID0gZmllbGQubWFwIHx8IGtleTtcbiAgICAgICAgICAgICAgICAgICAgcGFyYW1zW2ZpZWxkLmluXVtuYW1lXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXh0cmEgPSBleHRyYVByZWZpeGVzLmZpbmQoKFtwcmVmaXhdKSA9PiBrZXkuc3RhcnRzV2l0aChwcmVmaXgpKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGV4dHJhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBbcHJlZml4LCBzbG90XSA9IGV4dHJhO1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zW3Nsb3RdW2tleS5zbGljZShwcmVmaXgubGVuZ3RoKV0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgW3Nsb3QsIGFsbG93ZWRdIG9mIE9iamVjdC5lbnRyaWVzKGNvbmZpZy5hbGxvd0V4dHJhID8/IHt9KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhbGxvd2VkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zW3Nsb3RdW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHN0cmlwRW1wdHlTbG90cyhwYXJhbXMpO1xuICAgIHJldHVybiBwYXJhbXM7XG59O1xuIiwKICAgICIvLyBUaGlzIGZpbGUgaXMgYXV0by1nZW5lcmF0ZWQgYnkgQGhleS1hcGkvb3BlbmFwaS10c1xuaW1wb3J0IHsgY3JlYXRlQ2xpZW50LCBjcmVhdGVDb25maWcgfSBmcm9tIFwiLi9jbGllbnQvaW5kZXguanNcIjtcbmV4cG9ydCBjb25zdCBjbGllbnQgPSBjcmVhdGVDbGllbnQoY3JlYXRlQ29uZmlnKHtcbiAgICBiYXNlVXJsOiBcImh0dHA6Ly9sb2NhbGhvc3Q6NDA5NlwiLFxufSkpO1xuIiwKICAgICIvLyBUaGlzIGZpbGUgaXMgYXV0by1nZW5lcmF0ZWQgYnkgQGhleS1hcGkvb3BlbmFwaS10c1xuaW1wb3J0IHsgY2xpZW50IGFzIF9oZXlBcGlDbGllbnQgfSBmcm9tIFwiLi9jbGllbnQuZ2VuLmpzXCI7XG5jbGFzcyBfSGV5QXBpQ2xpZW50IHtcbiAgICBfY2xpZW50ID0gX2hleUFwaUNsaWVudDtcbiAgICBjb25zdHJ1Y3RvcihhcmdzKSB7XG4gICAgICAgIGlmIChhcmdzPy5jbGllbnQpIHtcbiAgICAgICAgICAgIHRoaXMuX2NsaWVudCA9IGFyZ3MuY2xpZW50O1xuICAgICAgICB9XG4gICAgfVxufVxuY2xhc3MgR2xvYmFsIGV4dGVuZHMgX0hleUFwaUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogR2V0IGV2ZW50c1xuICAgICAqL1xuICAgIGV2ZW50KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQuc3NlKHtcbiAgICAgICAgICAgIHVybDogXCIvZ2xvYmFsL2V2ZW50XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG59XG5jbGFzcyBQcm9qZWN0IGV4dGVuZHMgX0hleUFwaUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogTGlzdCBhbGwgcHJvamVjdHNcbiAgICAgKi9cbiAgICBsaXN0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9wcm9qZWN0XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBjdXJyZW50IHByb2plY3RcbiAgICAgKi9cbiAgICBjdXJyZW50KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9wcm9qZWN0L2N1cnJlbnRcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmNsYXNzIFB0eSBleHRlbmRzIF9IZXlBcGlDbGllbnQge1xuICAgIC8qKlxuICAgICAqIExpc3QgYWxsIFBUWSBzZXNzaW9uc1xuICAgICAqL1xuICAgIGxpc3Qob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL3B0eVwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBQVFkgc2Vzc2lvblxuICAgICAqL1xuICAgIGNyZWF0ZShvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3B0eVwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zPy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBhIFBUWSBzZXNzaW9uXG4gICAgICovXG4gICAgcmVtb3ZlKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmRlbGV0ZSh7XG4gICAgICAgICAgICB1cmw6IFwiL3B0eS97aWR9XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0IFBUWSBzZXNzaW9uIGluZm9cbiAgICAgKi9cbiAgICBnZXQob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvcHR5L3tpZH1cIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgUFRZIHNlc3Npb25cbiAgICAgKi9cbiAgICB1cGRhdGUob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucHV0KHtcbiAgICAgICAgICAgIHVybDogXCIvcHR5L3tpZH1cIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENvbm5lY3QgdG8gYSBQVFkgc2Vzc2lvblxuICAgICAqL1xuICAgIGNvbm5lY3Qob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvcHR5L3tpZH0vY29ubmVjdFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuY2xhc3MgQ29uZmlnIGV4dGVuZHMgX0hleUFwaUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogR2V0IGNvbmZpZyBpbmZvXG4gICAgICovXG4gICAgZ2V0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9jb25maWdcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgY29uZmlnXG4gICAgICovXG4gICAgdXBkYXRlKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wYXRjaCh7XG4gICAgICAgICAgICB1cmw6IFwiL2NvbmZpZ1wiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zPy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIExpc3QgYWxsIHByb3ZpZGVyc1xuICAgICAqL1xuICAgIHByb3ZpZGVycyhvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvY29uZmlnL3Byb3ZpZGVyc1wiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuY2xhc3MgVG9vbCBleHRlbmRzIF9IZXlBcGlDbGllbnQge1xuICAgIC8qKlxuICAgICAqIExpc3QgYWxsIHRvb2wgSURzIChpbmNsdWRpbmcgYnVpbHQtaW4gYW5kIGR5bmFtaWNhbGx5IHJlZ2lzdGVyZWQpXG4gICAgICovXG4gICAgaWRzKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9leHBlcmltZW50YWwvdG9vbC9pZHNcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBMaXN0IHRvb2xzIHdpdGggSlNPTiBzY2hlbWEgcGFyYW1ldGVycyBmb3IgYSBwcm92aWRlci9tb2RlbFxuICAgICAqL1xuICAgIGxpc3Qob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvZXhwZXJpbWVudGFsL3Rvb2xcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmNsYXNzIEluc3RhbmNlIGV4dGVuZHMgX0hleUFwaUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogRGlzcG9zZSB0aGUgY3VycmVudCBpbnN0YW5jZVxuICAgICAqL1xuICAgIGRpc3Bvc2Uob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi9pbnN0YW5jZS9kaXNwb3NlXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG59XG5jbGFzcyBQYXRoIGV4dGVuZHMgX0hleUFwaUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBjdXJyZW50IHBhdGhcbiAgICAgKi9cbiAgICBnZXQob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL3BhdGhcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmNsYXNzIFZjcyBleHRlbmRzIF9IZXlBcGlDbGllbnQge1xuICAgIC8qKlxuICAgICAqIEdldCBWQ1MgaW5mbyBmb3IgdGhlIGN1cnJlbnQgaW5zdGFuY2VcbiAgICAgKi9cbiAgICBnZXQob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Zjc1wiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuY2xhc3MgU2Vzc2lvbiBleHRlbmRzIF9IZXlBcGlDbGllbnQge1xuICAgIC8qKlxuICAgICAqIExpc3QgYWxsIHNlc3Npb25zXG4gICAgICovXG4gICAgbGlzdChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvc2Vzc2lvblwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBzZXNzaW9uXG4gICAgICovXG4gICAgY3JlYXRlKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvc2Vzc2lvblwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zPy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCBzZXNzaW9uIHN0YXR1c1xuICAgICAqL1xuICAgIHN0YXR1cyhvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvc2Vzc2lvbi9zdGF0dXNcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZWxldGUgYSBzZXNzaW9uIGFuZCBhbGwgaXRzIGRhdGFcbiAgICAgKi9cbiAgICBkZWxldGUob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZGVsZXRlKHtcbiAgICAgICAgICAgIHVybDogXCIvc2Vzc2lvbi97aWR9XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0IHNlc3Npb25cbiAgICAgKi9cbiAgICBnZXQob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvc2Vzc2lvbi97aWR9XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVXBkYXRlIHNlc3Npb24gcHJvcGVydGllc1xuICAgICAqL1xuICAgIHVwZGF0ZShvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wYXRjaCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Nlc3Npb24ve2lkfVwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zLmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0IGEgc2Vzc2lvbidzIGNoaWxkcmVuXG4gICAgICovXG4gICAgY2hpbGRyZW4ob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvc2Vzc2lvbi97aWR9L2NoaWxkcmVuXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0IHRoZSB0b2RvIGxpc3QgZm9yIGEgc2Vzc2lvblxuICAgICAqL1xuICAgIHRvZG8ob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvc2Vzc2lvbi97aWR9L3RvZG9cIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBbmFseXplIHRoZSBhcHAgYW5kIGNyZWF0ZSBhbiBBR0VOVFMubWQgZmlsZVxuICAgICAqL1xuICAgIGluaXQob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Nlc3Npb24ve2lkfS9pbml0XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnMuaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBGb3JrIGFuIGV4aXN0aW5nIHNlc3Npb24gYXQgYSBzcGVjaWZpYyBtZXNzYWdlXG4gICAgICovXG4gICAgZm9yayhvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvc2Vzc2lvbi97aWR9L2ZvcmtcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFib3J0IGEgc2Vzc2lvblxuICAgICAqL1xuICAgIGFib3J0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi9zZXNzaW9uL3tpZH0vYWJvcnRcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBVbnNoYXJlIHRoZSBzZXNzaW9uXG4gICAgICovXG4gICAgdW5zaGFyZShvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5kZWxldGUoe1xuICAgICAgICAgICAgdXJsOiBcIi9zZXNzaW9uL3tpZH0vc2hhcmVcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTaGFyZSBhIHNlc3Npb25cbiAgICAgKi9cbiAgICBzaGFyZShvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvc2Vzc2lvbi97aWR9L3NoYXJlXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBkaWZmIGZvciB0aGlzIHNlc3Npb25cbiAgICAgKi9cbiAgICBkaWZmKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Nlc3Npb24ve2lkfS9kaWZmXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU3VtbWFyaXplIHRoZSBzZXNzaW9uXG4gICAgICovXG4gICAgc3VtbWFyaXplKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi9zZXNzaW9uL3tpZH0vc3VtbWFyaXplXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnMuaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBMaXN0IG1lc3NhZ2VzIGZvciBhIHNlc3Npb25cbiAgICAgKi9cbiAgICBtZXNzYWdlcyhvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9zZXNzaW9uL3tpZH0vbWVzc2FnZVwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhbmQgc2VuZCBhIG5ldyBtZXNzYWdlIHRvIGEgc2Vzc2lvblxuICAgICAqL1xuICAgIHByb21wdChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvc2Vzc2lvbi97aWR9L21lc3NhZ2VcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCBhIG1lc3NhZ2UgZnJvbSBhIHNlc3Npb25cbiAgICAgKi9cbiAgICBtZXNzYWdlKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Nlc3Npb24ve2lkfS9tZXNzYWdlL3ttZXNzYWdlSUR9XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGFuZCBzZW5kIGEgbmV3IG1lc3NhZ2UgdG8gYSBzZXNzaW9uLCBzdGFydCBpZiBuZWVkZWQgYW5kIHJldHVybiBpbW1lZGlhdGVseVxuICAgICAqL1xuICAgIHByb21wdEFzeW5jKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi9zZXNzaW9uL3tpZH0vcHJvbXB0X2FzeW5jXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnMuaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZW5kIGEgbmV3IGNvbW1hbmQgdG8gYSBzZXNzaW9uXG4gICAgICovXG4gICAgY29tbWFuZChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvc2Vzc2lvbi97aWR9L2NvbW1hbmRcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJ1biBhIHNoZWxsIGNvbW1hbmRcbiAgICAgKi9cbiAgICBzaGVsbChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvc2Vzc2lvbi97aWR9L3NoZWxsXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnMuaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXZlcnQgYSBtZXNzYWdlXG4gICAgICovXG4gICAgcmV2ZXJ0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi9zZXNzaW9uL3tpZH0vcmV2ZXJ0XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnMuaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXN0b3JlIGFsbCByZXZlcnRlZCBtZXNzYWdlc1xuICAgICAqL1xuICAgIHVucmV2ZXJ0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi9zZXNzaW9uL3tpZH0vdW5yZXZlcnRcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmNsYXNzIENvbW1hbmQgZXh0ZW5kcyBfSGV5QXBpQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBMaXN0IGFsbCBjb21tYW5kc1xuICAgICAqL1xuICAgIGxpc3Qob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL2NvbW1hbmRcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmNsYXNzIE9hdXRoIGV4dGVuZHMgX0hleUFwaUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogQXV0aG9yaXplIGEgcHJvdmlkZXIgdXNpbmcgT0F1dGhcbiAgICAgKi9cbiAgICBhdXRob3JpemUob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Byb3ZpZGVyL3tpZH0vb2F1dGgvYXV0aG9yaXplXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnMuaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBIYW5kbGUgT0F1dGggY2FsbGJhY2sgZm9yIGEgcHJvdmlkZXJcbiAgICAgKi9cbiAgICBjYWxsYmFjayhvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvcHJvdmlkZXIve2lkfS9vYXV0aC9jYWxsYmFja1wiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zLmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG59XG5jbGFzcyBQcm92aWRlciBleHRlbmRzIF9IZXlBcGlDbGllbnQge1xuICAgIC8qKlxuICAgICAqIExpc3QgYWxsIHByb3ZpZGVyc1xuICAgICAqL1xuICAgIGxpc3Qob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL3Byb3ZpZGVyXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0IHByb3ZpZGVyIGF1dGhlbnRpY2F0aW9uIG1ldGhvZHNcbiAgICAgKi9cbiAgICBhdXRoKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9wcm92aWRlci9hdXRoXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgb2F1dGggPSBuZXcgT2F1dGgoeyBjbGllbnQ6IHRoaXMuX2NsaWVudCB9KTtcbn1cbmNsYXNzIEZpbmQgZXh0ZW5kcyBfSGV5QXBpQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBGaW5kIHRleHQgaW4gZmlsZXNcbiAgICAgKi9cbiAgICB0ZXh0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL2ZpbmRcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBGaW5kIGZpbGVzXG4gICAgICovXG4gICAgZmlsZXMob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvZmluZC9maWxlXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRmluZCB3b3Jrc3BhY2Ugc3ltYm9sc1xuICAgICAqL1xuICAgIHN5bWJvbHMob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvZmluZC9zeW1ib2xcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmNsYXNzIEZpbGUgZXh0ZW5kcyBfSGV5QXBpQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBMaXN0IGZpbGVzIGFuZCBkaXJlY3Rvcmllc1xuICAgICAqL1xuICAgIGxpc3Qob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvZmlsZVwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlYWQgYSBmaWxlXG4gICAgICovXG4gICAgcmVhZChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5nZXQoe1xuICAgICAgICAgICAgdXJsOiBcIi9maWxlL2NvbnRlbnRcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgZmlsZSBzdGF0dXNcbiAgICAgKi9cbiAgICBzdGF0dXMob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL2ZpbGUvc3RhdHVzXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG59XG5jbGFzcyBBcHAgZXh0ZW5kcyBfSGV5QXBpQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBXcml0ZSBhIGxvZyBlbnRyeSB0byB0aGUgc2VydmVyIGxvZ3NcbiAgICAgKi9cbiAgICBsb2cob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi9sb2dcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucz8uaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBMaXN0IGFsbCBhZ2VudHNcbiAgICAgKi9cbiAgICBhZ2VudHMob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmdldCh7XG4gICAgICAgICAgICB1cmw6IFwiL2FnZW50XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG59XG5jbGFzcyBBdXRoIGV4dGVuZHMgX0hleUFwaUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogUmVtb3ZlIE9BdXRoIGNyZWRlbnRpYWxzIGZvciBhbiBNQ1Agc2VydmVyXG4gICAgICovXG4gICAgcmVtb3ZlKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLmRlbGV0ZSh7XG4gICAgICAgICAgICB1cmw6IFwiL21jcC97bmFtZX0vYXV0aFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFN0YXJ0IE9BdXRoIGF1dGhlbnRpY2F0aW9uIGZsb3cgZm9yIGFuIE1DUCBzZXJ2ZXJcbiAgICAgKi9cbiAgICBzdGFydChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvbWNwL3tuYW1lfS9hdXRoXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ29tcGxldGUgT0F1dGggYXV0aGVudGljYXRpb24gd2l0aCBhdXRob3JpemF0aW9uIGNvZGVcbiAgICAgKi9cbiAgICBjYWxsYmFjayhvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvbWNwL3tuYW1lfS9hdXRoL2NhbGxiYWNrXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnMuaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTdGFydCBPQXV0aCBmbG93IGFuZCB3YWl0IGZvciBjYWxsYmFjayAob3BlbnMgYnJvd3NlcilcbiAgICAgKi9cbiAgICBhdXRoZW50aWNhdGUob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL21jcC97bmFtZX0vYXV0aC9hdXRoZW50aWNhdGVcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXQgYXV0aGVudGljYXRpb24gY3JlZGVudGlhbHNcbiAgICAgKi9cbiAgICBzZXQob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnMuY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucHV0KHtcbiAgICAgICAgICAgIHVybDogXCIvYXV0aC97aWR9XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnMuaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmNsYXNzIE1jcCBleHRlbmRzIF9IZXlBcGlDbGllbnQge1xuICAgIC8qKlxuICAgICAqIEdldCBNQ1Agc2VydmVyIHN0YXR1c1xuICAgICAqL1xuICAgIHN0YXR1cyhvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvbWNwXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQWRkIE1DUCBzZXJ2ZXIgZHluYW1pY2FsbHlcbiAgICAgKi9cbiAgICBhZGQob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi9tY3BcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucz8uaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDb25uZWN0IGFuIE1DUCBzZXJ2ZXJcbiAgICAgKi9cbiAgICBjb25uZWN0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi9tY3Ave25hbWV9L2Nvbm5lY3RcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBEaXNjb25uZWN0IGFuIE1DUCBzZXJ2ZXJcbiAgICAgKi9cbiAgICBkaXNjb25uZWN0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi9tY3Ave25hbWV9L2Rpc2Nvbm5lY3RcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBhdXRoID0gbmV3IEF1dGgoeyBjbGllbnQ6IHRoaXMuX2NsaWVudCB9KTtcbn1cbmNsYXNzIExzcCBleHRlbmRzIF9IZXlBcGlDbGllbnQge1xuICAgIC8qKlxuICAgICAqIEdldCBMU1Agc2VydmVyIHN0YXR1c1xuICAgICAqL1xuICAgIHN0YXR1cyhvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvbHNwXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG59XG5jbGFzcyBGb3JtYXR0ZXIgZXh0ZW5kcyBfSGV5QXBpQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBHZXQgZm9ybWF0dGVyIHN0YXR1c1xuICAgICAqL1xuICAgIHN0YXR1cyhvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvZm9ybWF0dGVyXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG59XG5jbGFzcyBDb250cm9sIGV4dGVuZHMgX0hleUFwaUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBuZXh0IFRVSSByZXF1ZXN0IGZyb20gdGhlIHF1ZXVlXG4gICAgICovXG4gICAgbmV4dChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0KHtcbiAgICAgICAgICAgIHVybDogXCIvdHVpL2NvbnRyb2wvbmV4dFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFN1Ym1pdCBhIHJlc3BvbnNlIHRvIHRoZSBUVUkgcmVxdWVzdCBxdWV1ZVxuICAgICAqL1xuICAgIHJlc3BvbnNlKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvdHVpL2NvbnRyb2wvcmVzcG9uc2VcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucz8uaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmNsYXNzIFR1aSBleHRlbmRzIF9IZXlBcGlDbGllbnQge1xuICAgIC8qKlxuICAgICAqIEFwcGVuZCBwcm9tcHQgdG8gdGhlIFRVSVxuICAgICAqL1xuICAgIGFwcGVuZFByb21wdChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3R1aS9hcHBlbmQtcHJvbXB0XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnM/LmhlYWRlcnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogT3BlbiB0aGUgaGVscCBkaWFsb2dcbiAgICAgKi9cbiAgICBvcGVuSGVscChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3R1aS9vcGVuLWhlbHBcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBPcGVuIHRoZSBzZXNzaW9uIGRpYWxvZ1xuICAgICAqL1xuICAgIG9wZW5TZXNzaW9ucyhvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3R1aS9vcGVuLXNlc3Npb25zXCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogT3BlbiB0aGUgdGhlbWUgZGlhbG9nXG4gICAgICovXG4gICAgb3BlblRoZW1lcyhvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3R1aS9vcGVuLXRoZW1lc1wiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE9wZW4gdGhlIG1vZGVsIGRpYWxvZ1xuICAgICAqL1xuICAgIG9wZW5Nb2RlbHMob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi90dWkvb3Blbi1tb2RlbHNcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTdWJtaXQgdGhlIHByb21wdFxuICAgICAqL1xuICAgIHN1Ym1pdFByb21wdChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3R1aS9zdWJtaXQtcHJvbXB0XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2xlYXIgdGhlIHByb21wdFxuICAgICAqL1xuICAgIGNsZWFyUHJvbXB0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvdHVpL2NsZWFyLXByb21wdFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEV4ZWN1dGUgYSBUVUkgY29tbWFuZCAoZS5nLiBhZ2VudF9jeWNsZSlcbiAgICAgKi9cbiAgICBleGVjdXRlQ29tbWFuZChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkucG9zdCh7XG4gICAgICAgICAgICB1cmw6IFwiL3R1aS9leGVjdXRlLWNvbW1hbmRcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucz8uaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTaG93IGEgdG9hc3Qgbm90aWZpY2F0aW9uIGluIHRoZSBUVUlcbiAgICAgKi9cbiAgICBzaG93VG9hc3Qob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gKG9wdGlvbnM/LmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi90dWkvc2hvdy10b2FzdFwiLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zPy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFB1Ymxpc2ggYSBUVUkgZXZlbnRcbiAgICAgKi9cbiAgICBwdWJsaXNoKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zPy5jbGllbnQgPz8gdGhpcy5fY2xpZW50KS5wb3N0KHtcbiAgICAgICAgICAgIHVybDogXCIvdHVpL3B1Ymxpc2hcIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucz8uaGVhZGVycyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBjb250cm9sID0gbmV3IENvbnRyb2woeyBjbGllbnQ6IHRoaXMuX2NsaWVudCB9KTtcbn1cbmNsYXNzIEV2ZW50IGV4dGVuZHMgX0hleUFwaUNsaWVudCB7XG4gICAgLyoqXG4gICAgICogR2V0IGV2ZW50c1xuICAgICAqL1xuICAgIHN1YnNjcmliZShvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiAob3B0aW9ucz8uY2xpZW50ID8/IHRoaXMuX2NsaWVudCkuZ2V0LnNzZSh7XG4gICAgICAgICAgICB1cmw6IFwiL2V2ZW50XCIsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgT3BlbmNvZGVDbGllbnQgZXh0ZW5kcyBfSGV5QXBpQ2xpZW50IHtcbiAgICAvKipcbiAgICAgKiBSZXNwb25kIHRvIGEgcGVybWlzc2lvbiByZXF1ZXN0XG4gICAgICovXG4gICAgcG9zdFNlc3Npb25JZFBlcm1pc3Npb25zUGVybWlzc2lvbklkKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIChvcHRpb25zLmNsaWVudCA/PyB0aGlzLl9jbGllbnQpLnBvc3Qoe1xuICAgICAgICAgICAgdXJsOiBcIi9zZXNzaW9uL3tpZH0vcGVybWlzc2lvbnMve3Blcm1pc3Npb25JRH1cIixcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucy5oZWFkZXJzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGdsb2JhbCA9IG5ldyBHbG9iYWwoeyBjbGllbnQ6IHRoaXMuX2NsaWVudCB9KTtcbiAgICBwcm9qZWN0ID0gbmV3IFByb2plY3QoeyBjbGllbnQ6IHRoaXMuX2NsaWVudCB9KTtcbiAgICBwdHkgPSBuZXcgUHR5KHsgY2xpZW50OiB0aGlzLl9jbGllbnQgfSk7XG4gICAgY29uZmlnID0gbmV3IENvbmZpZyh7IGNsaWVudDogdGhpcy5fY2xpZW50IH0pO1xuICAgIHRvb2wgPSBuZXcgVG9vbCh7IGNsaWVudDogdGhpcy5fY2xpZW50IH0pO1xuICAgIGluc3RhbmNlID0gbmV3IEluc3RhbmNlKHsgY2xpZW50OiB0aGlzLl9jbGllbnQgfSk7XG4gICAgcGF0aCA9IG5ldyBQYXRoKHsgY2xpZW50OiB0aGlzLl9jbGllbnQgfSk7XG4gICAgdmNzID0gbmV3IFZjcyh7IGNsaWVudDogdGhpcy5fY2xpZW50IH0pO1xuICAgIHNlc3Npb24gPSBuZXcgU2Vzc2lvbih7IGNsaWVudDogdGhpcy5fY2xpZW50IH0pO1xuICAgIGNvbW1hbmQgPSBuZXcgQ29tbWFuZCh7IGNsaWVudDogdGhpcy5fY2xpZW50IH0pO1xuICAgIHByb3ZpZGVyID0gbmV3IFByb3ZpZGVyKHsgY2xpZW50OiB0aGlzLl9jbGllbnQgfSk7XG4gICAgZmluZCA9IG5ldyBGaW5kKHsgY2xpZW50OiB0aGlzLl9jbGllbnQgfSk7XG4gICAgZmlsZSA9IG5ldyBGaWxlKHsgY2xpZW50OiB0aGlzLl9jbGllbnQgfSk7XG4gICAgYXBwID0gbmV3IEFwcCh7IGNsaWVudDogdGhpcy5fY2xpZW50IH0pO1xuICAgIG1jcCA9IG5ldyBNY3AoeyBjbGllbnQ6IHRoaXMuX2NsaWVudCB9KTtcbiAgICBsc3AgPSBuZXcgTHNwKHsgY2xpZW50OiB0aGlzLl9jbGllbnQgfSk7XG4gICAgZm9ybWF0dGVyID0gbmV3IEZvcm1hdHRlcih7IGNsaWVudDogdGhpcy5fY2xpZW50IH0pO1xuICAgIHR1aSA9IG5ldyBUdWkoeyBjbGllbnQ6IHRoaXMuX2NsaWVudCB9KTtcbiAgICBhdXRoID0gbmV3IEF1dGgoeyBjbGllbnQ6IHRoaXMuX2NsaWVudCB9KTtcbiAgICBldmVudCA9IG5ldyBFdmVudCh7IGNsaWVudDogdGhpcy5fY2xpZW50IH0pO1xufVxuIiwKICAgICJleHBvcnQgKiBmcm9tIFwiLi9nZW4vdHlwZXMuZ2VuLmpzXCI7XG5pbXBvcnQgeyBjcmVhdGVDbGllbnQgfSBmcm9tIFwiLi9nZW4vY2xpZW50L2NsaWVudC5nZW4uanNcIjtcbmltcG9ydCB7IE9wZW5jb2RlQ2xpZW50IH0gZnJvbSBcIi4vZ2VuL3Nkay5nZW4uanNcIjtcbmV4cG9ydCB7IE9wZW5jb2RlQ2xpZW50IH07XG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlT3BlbmNvZGVDbGllbnQoY29uZmlnKSB7XG4gICAgaWYgKCFjb25maWc/LmZldGNoKSB7XG4gICAgICAgIGNvbnN0IGN1c3RvbUZldGNoID0gKHJlcSkgPT4ge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgcmVxLnRpbWVvdXQgPSBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybiBmZXRjaChyZXEpO1xuICAgICAgICB9O1xuICAgICAgICBjb25maWcgPSB7XG4gICAgICAgICAgICAuLi5jb25maWcsXG4gICAgICAgICAgICBmZXRjaDogY3VzdG9tRmV0Y2gsXG4gICAgICAgIH07XG4gICAgfVxuICAgIGlmIChjb25maWc/LmRpcmVjdG9yeSkge1xuICAgICAgICBjb25maWcuaGVhZGVycyA9IHtcbiAgICAgICAgICAgIC4uLmNvbmZpZy5oZWFkZXJzLFxuICAgICAgICAgICAgXCJ4LW9wZW5jb2RlLWRpcmVjdG9yeVwiOiBjb25maWcuZGlyZWN0b3J5LFxuICAgICAgICB9O1xuICAgIH1cbiAgICBjb25zdCBjbGllbnQgPSBjcmVhdGVDbGllbnQoY29uZmlnKTtcbiAgICByZXR1cm4gbmV3IE9wZW5jb2RlQ2xpZW50KHsgY2xpZW50IH0pO1xufVxuIiwKICAgICJpbXBvcnQgeyBzcGF3biB9IGZyb20gXCJub2RlOmNoaWxkX3Byb2Nlc3NcIjtcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjcmVhdGVPcGVuY29kZVNlcnZlcihvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgICBob3N0bmFtZTogXCIxMjcuMC4wLjFcIixcbiAgICAgICAgcG9ydDogNDA5NixcbiAgICAgICAgdGltZW91dDogNTAwMCxcbiAgICB9LCBvcHRpb25zID8/IHt9KTtcbiAgICBjb25zdCBhcmdzID0gW2BzZXJ2ZWAsIGAtLWhvc3RuYW1lPSR7b3B0aW9ucy5ob3N0bmFtZX1gLCBgLS1wb3J0PSR7b3B0aW9ucy5wb3J0fWBdO1xuICAgIGlmIChvcHRpb25zLmNvbmZpZz8ubG9nTGV2ZWwpXG4gICAgICAgIGFyZ3MucHVzaChgLS1sb2ctbGV2ZWw9JHtvcHRpb25zLmNvbmZpZy5sb2dMZXZlbH1gKTtcbiAgICBjb25zdCBwcm9jID0gc3Bhd24oYG9wZW5jb2RlYCwgYXJncywge1xuICAgICAgICBzaWduYWw6IG9wdGlvbnMuc2lnbmFsLFxuICAgICAgICBlbnY6IHtcbiAgICAgICAgICAgIC4uLnByb2Nlc3MuZW52LFxuICAgICAgICAgICAgT1BFTkNPREVfQ09ORklHX0NPTlRFTlQ6IEpTT04uc3RyaW5naWZ5KG9wdGlvbnMuY29uZmlnID8/IHt9KSxcbiAgICAgICAgfSxcbiAgICB9KTtcbiAgICBjb25zdCB1cmwgPSBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGNvbnN0IGlkID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICByZWplY3QobmV3IEVycm9yKGBUaW1lb3V0IHdhaXRpbmcgZm9yIHNlcnZlciB0byBzdGFydCBhZnRlciAke29wdGlvbnMudGltZW91dH1tc2ApKTtcbiAgICAgICAgfSwgb3B0aW9ucy50aW1lb3V0KTtcbiAgICAgICAgbGV0IG91dHB1dCA9IFwiXCI7XG4gICAgICAgIHByb2Muc3Rkb3V0Py5vbihcImRhdGFcIiwgKGNodW5rKSA9PiB7XG4gICAgICAgICAgICBvdXRwdXQgKz0gY2h1bmsudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIGNvbnN0IGxpbmVzID0gb3V0cHV0LnNwbGl0KFwiXFxuXCIpO1xuICAgICAgICAgICAgZm9yIChjb25zdCBsaW5lIG9mIGxpbmVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGxpbmUuc3RhcnRzV2l0aChcIm9wZW5jb2RlIHNlcnZlciBsaXN0ZW5pbmdcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbWF0Y2ggPSBsaW5lLm1hdGNoKC9vblxccysoaHR0cHM/OlxcL1xcL1teXFxzXSspLyk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghbWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIHBhcnNlIHNlcnZlciB1cmwgZnJvbSBvdXRwdXQ6ICR7bGluZX1gKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoaWQpO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG1hdGNoWzFdKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHByb2Muc3RkZXJyPy5vbihcImRhdGFcIiwgKGNodW5rKSA9PiB7XG4gICAgICAgICAgICBvdXRwdXQgKz0gY2h1bmsudG9TdHJpbmcoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHByb2Mub24oXCJleGl0XCIsIChjb2RlKSA9PiB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQoaWQpO1xuICAgICAgICAgICAgbGV0IG1zZyA9IGBTZXJ2ZXIgZXhpdGVkIHdpdGggY29kZSAke2NvZGV9YDtcbiAgICAgICAgICAgIGlmIChvdXRwdXQudHJpbSgpKSB7XG4gICAgICAgICAgICAgICAgbXNnICs9IGBcXG5TZXJ2ZXIgb3V0cHV0OiAke291dHB1dH1gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihtc2cpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHByb2Mub24oXCJlcnJvclwiLCAoZXJyb3IpID0+IHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChpZCk7XG4gICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKG9wdGlvbnMuc2lnbmFsKSB7XG4gICAgICAgICAgICBvcHRpb25zLnNpZ25hbC5hZGRFdmVudExpc3RlbmVyKFwiYWJvcnRcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dChpZCk7XG4gICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihcIkFib3J0ZWRcIikpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4ge1xuICAgICAgICB1cmwsXG4gICAgICAgIGNsb3NlKCkge1xuICAgICAgICAgICAgcHJvYy5raWxsKCk7XG4gICAgICAgIH0sXG4gICAgfTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVPcGVuY29kZVR1aShvcHRpb25zKSB7XG4gICAgY29uc3QgYXJncyA9IFtdO1xuICAgIGlmIChvcHRpb25zPy5wcm9qZWN0KSB7XG4gICAgICAgIGFyZ3MucHVzaChgLS1wcm9qZWN0PSR7b3B0aW9ucy5wcm9qZWN0fWApO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucz8ubW9kZWwpIHtcbiAgICAgICAgYXJncy5wdXNoKGAtLW1vZGVsPSR7b3B0aW9ucy5tb2RlbH1gKTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnM/LnNlc3Npb24pIHtcbiAgICAgICAgYXJncy5wdXNoKGAtLXNlc3Npb249JHtvcHRpb25zLnNlc3Npb259YCk7XG4gICAgfVxuICAgIGlmIChvcHRpb25zPy5hZ2VudCkge1xuICAgICAgICBhcmdzLnB1c2goYC0tYWdlbnQ9JHtvcHRpb25zLmFnZW50fWApO1xuICAgIH1cbiAgICBjb25zdCBwcm9jID0gc3Bhd24oYG9wZW5jb2RlYCwgYXJncywge1xuICAgICAgICBzaWduYWw6IG9wdGlvbnM/LnNpZ25hbCxcbiAgICAgICAgc3RkaW86IFwiaW5oZXJpdFwiLFxuICAgICAgICBlbnY6IHtcbiAgICAgICAgICAgIC4uLnByb2Nlc3MuZW52LFxuICAgICAgICAgICAgT1BFTkNPREVfQ09ORklHX0NPTlRFTlQ6IEpTT04uc3RyaW5naWZ5KG9wdGlvbnM/LmNvbmZpZyA/PyB7fSksXG4gICAgICAgIH0sXG4gICAgfSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY2xvc2UoKSB7XG4gICAgICAgICAgICBwcm9jLmtpbGwoKTtcbiAgICAgICAgfSxcbiAgICB9O1xufVxuIiwKICAgICJleHBvcnQgKiBmcm9tIFwiLi9jbGllbnQuanNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3NlcnZlci5qc1wiO1xuaW1wb3J0IHsgY3JlYXRlT3BlbmNvZGVDbGllbnQgfSBmcm9tIFwiLi9jbGllbnQuanNcIjtcbmltcG9ydCB7IGNyZWF0ZU9wZW5jb2RlU2VydmVyIH0gZnJvbSBcIi4vc2VydmVyLmpzXCI7XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY3JlYXRlT3BlbmNvZGUob3B0aW9ucykge1xuICAgIGNvbnN0IHNlcnZlciA9IGF3YWl0IGNyZWF0ZU9wZW5jb2RlU2VydmVyKHtcbiAgICAgICAgLi4ub3B0aW9ucyxcbiAgICB9KTtcbiAgICBjb25zdCBjbGllbnQgPSBjcmVhdGVPcGVuY29kZUNsaWVudCh7XG4gICAgICAgIGJhc2VVcmw6IHNlcnZlci51cmwsXG4gICAgfSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY2xpZW50LFxuICAgICAgICBzZXJ2ZXIsXG4gICAgfTtcbn1cbiIsCiAgICAiaW1wb3J0IGZzIGZyb20gXCJub2RlOmZzL3Byb21pc2VzXCI7XG4vKipcbiAqIFN0cnVjdHVyZWQgbG9nZ2luZyBmb3IgYWktZW5nIHJhbHBoXG4gKlxuICogU3VwcG9ydHMgYm90aCBzdGRlcnIgb3V0cHV0ICh3aXRoIC0tcHJpbnQtbG9ncykgYW5kIGZpbGUtYmFzZWQgbG9nZ2luZ1xuICovXG5pbXBvcnQgcGF0aCBmcm9tIFwibm9kZTpwYXRoXCI7XG5cbmV4cG9ydCBuYW1lc3BhY2UgTG9nIHtcbiAgICBleHBvcnQgdHlwZSBMZXZlbCA9IFwiREVCVUdcIiB8IFwiSU5GT1wiIHwgXCJXQVJOXCIgfCBcIkVSUk9SXCI7XG5cbiAgICBjb25zdCBsZXZlbFByaW9yaXR5OiBSZWNvcmQ8TGV2ZWwsIG51bWJlcj4gPSB7XG4gICAgICAgIERFQlVHOiAwLFxuICAgICAgICBJTkZPOiAxLFxuICAgICAgICBXQVJOOiAyLFxuICAgICAgICBFUlJPUjogMyxcbiAgICB9O1xuXG4gICAgbGV0IGN1cnJlbnRMZXZlbDogTGV2ZWwgPSBcIklORk9cIjtcbiAgICBsZXQgbG9nUGF0aCA9IFwiXCI7XG4gICAgbGV0IHdyaXRlOiAobXNnOiBzdHJpbmcpID0+IGFueSA9IChtc2cpID0+IHByb2Nlc3Muc3RkZXJyLndyaXRlKG1zZyk7XG5cbiAgICBmdW5jdGlvbiBzaG91bGRMb2cobGV2ZWw6IExldmVsKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiBsZXZlbFByaW9yaXR5W2xldmVsXSA+PSBsZXZlbFByaW9yaXR5W2N1cnJlbnRMZXZlbF07XG4gICAgfVxuXG4gICAgZXhwb3J0IGludGVyZmFjZSBPcHRpb25zIHtcbiAgICAgICAgcHJpbnQ6IGJvb2xlYW47IC8vIFdoZW4gdHJ1ZSwgd3JpdGUgdG8gc3RkZXJyXG4gICAgICAgIGxldmVsPzogTGV2ZWw7XG4gICAgICAgIGxvZ0Rpcj86IHN0cmluZzsgLy8gRGlyZWN0b3J5IGZvciBsb2cgZmlsZXNcbiAgICB9XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gZmlsZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gbG9nUGF0aDtcbiAgICB9XG5cbiAgICBleHBvcnQgYXN5bmMgZnVuY3Rpb24gaW5pdChvcHRpb25zOiBPcHRpb25zKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGlmIChvcHRpb25zLmxldmVsKSBjdXJyZW50TGV2ZWwgPSBvcHRpb25zLmxldmVsO1xuXG4gICAgICAgIC8vIEJ1aWxkIHRoZSB3cml0ZSBmdW5jdGlvbiB0aGF0IG91dHB1dHMgdG8gQk9USCBzdGRlcnIgQU5EIGZpbGVcbiAgICAgICAgY29uc3Qgc3RkZXJyV3JpdGVyID0gKG1zZzogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICBwcm9jZXNzLnN0ZGVyci53cml0ZShtc2cpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChvcHRpb25zLmxvZ0Rpcikge1xuICAgICAgICAgICAgY29uc3QgdGltZXN0YW1wID0gbmV3IERhdGUoKVxuICAgICAgICAgICAgICAgIC50b0lTT1N0cmluZygpXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoL1s6Ll0vZywgXCItXCIpXG4gICAgICAgICAgICAgICAgLnNsaWNlKDAsIC0xKTtcbiAgICAgICAgICAgIGxvZ1BhdGggPSBwYXRoLmpvaW4ob3B0aW9ucy5sb2dEaXIsIGByYWxwaC0ke3RpbWVzdGFtcH0ubG9nYCk7XG4gICAgICAgICAgICBhd2FpdCBmcy5ta2RpcihvcHRpb25zLmxvZ0RpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG5cbiAgICAgICAgICAgIGNvbnN0IGZpbGUgPSBCdW4uZmlsZShsb2dQYXRoKTtcbiAgICAgICAgICAgIGNvbnN0IGZpbGVXcml0ZXIgPSBmaWxlLndyaXRlcigpO1xuXG4gICAgICAgICAgICAvLyBBbHdheXMgd3JpdGUgdG8gc3RkZXJyIGlmIHByaW50IGlzIGVuYWJsZWRcbiAgICAgICAgICAgIC8vIEFsc28gYWx3YXlzIHdyaXRlIHRvIGZpbGUgaWYgbG9nRGlyIGlzIHByb3ZpZGVkXG4gICAgICAgICAgICB3cml0ZSA9IChtc2cpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5wcmludCkge1xuICAgICAgICAgICAgICAgICAgICBzdGRlcnJXcml0ZXIobXNnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmlsZVdyaXRlci53cml0ZShtc2cpO1xuICAgICAgICAgICAgICAgIGZpbGVXcml0ZXIuZmx1c2goKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5wcmludCkge1xuICAgICAgICAgICAgLy8gT25seSBwcmludCB0byBzdGRlcnJcbiAgICAgICAgICAgIHdyaXRlID0gc3RkZXJyV3JpdGVyO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZXhwb3J0IGludGVyZmFjZSBMb2dnZXIge1xuICAgICAgICBkZWJ1ZyhtZXNzYWdlOiBzdHJpbmcsIGV4dHJhPzogUmVjb3JkPHN0cmluZywgYW55Pik6IHZvaWQ7XG4gICAgICAgIGluZm8obWVzc2FnZTogc3RyaW5nLCBleHRyYT86IFJlY29yZDxzdHJpbmcsIGFueT4pOiB2b2lkO1xuICAgICAgICB3YXJuKG1lc3NhZ2U6IHN0cmluZywgZXh0cmE/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+KTogdm9pZDtcbiAgICAgICAgZXJyb3IobWVzc2FnZTogc3RyaW5nLCBleHRyYT86IFJlY29yZDxzdHJpbmcsIGFueT4pOiB2b2lkO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZvcm1hdEV4dHJhKGV4dHJhPzogUmVjb3JkPHN0cmluZywgYW55Pik6IHN0cmluZyB7XG4gICAgICAgIGlmICghZXh0cmEpIHJldHVybiBcIlwiO1xuICAgICAgICBjb25zdCBleHRyYVN0ciA9IE9iamVjdC5lbnRyaWVzKGV4dHJhKVxuICAgICAgICAgICAgLm1hcChcbiAgICAgICAgICAgICAgICAoW2ssIHZdKSA9PlxuICAgICAgICAgICAgICAgICAgICBgJHtrfT0ke3R5cGVvZiB2ID09PSBcIm9iamVjdFwiID8gSlNPTi5zdHJpbmdpZnkodikgOiB2fWAsXG4gICAgICAgICAgICApXG4gICAgICAgICAgICAuam9pbihcIiBcIik7XG4gICAgICAgIHJldHVybiBleHRyYVN0ciA/IGAgJHtleHRyYVN0cn1gIDogXCJcIjtcbiAgICB9XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gY3JlYXRlKHRhZ3M/OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+KTogTG9nZ2VyIHtcbiAgICAgICAgY29uc3QgdGFnU3RyID0gdGFnc1xuICAgICAgICAgICAgPyBPYmplY3QuZW50cmllcyh0YWdzKVxuICAgICAgICAgICAgICAgICAgLm1hcCgoW2ssIHZdKSA9PiBgJHtrfT0ke3Z9YClcbiAgICAgICAgICAgICAgICAgIC5qb2luKFwiIFwiKVxuICAgICAgICAgICAgOiBcIlwiO1xuICAgICAgICBjb25zdCB0YWdTdHJXaXRoU3BhY2UgPSB0YWdTdHIgPyBgJHt0YWdTdHJ9IGAgOiBcIlwiO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkZWJ1ZyhtZXNzYWdlOiBzdHJpbmcsIGV4dHJhPzogUmVjb3JkPHN0cmluZywgYW55Pikge1xuICAgICAgICAgICAgICAgIGlmIChzaG91bGRMb2coXCJERUJVR1wiKSkge1xuICAgICAgICAgICAgICAgICAgICB3cml0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIGBERUJVRyAke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKX0gJHt0YWdTdHJ9JHttZXNzYWdlfSR7Zm9ybWF0RXh0cmEoZXh0cmEpfVxcbmAsXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGluZm8obWVzc2FnZTogc3RyaW5nLCBleHRyYT86IFJlY29yZDxzdHJpbmcsIGFueT4pIHtcbiAgICAgICAgICAgICAgICBpZiAoc2hvdWxkTG9nKFwiSU5GT1wiKSkge1xuICAgICAgICAgICAgICAgICAgICB3cml0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIGBJTkZPICAke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKX0gJHt0YWdTdHJ9JHttZXNzYWdlfSR7Zm9ybWF0RXh0cmEoZXh0cmEpfVxcbmAsXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHdhcm4obWVzc2FnZTogc3RyaW5nLCBleHRyYT86IFJlY29yZDxzdHJpbmcsIGFueT4pIHtcbiAgICAgICAgICAgICAgICBpZiAoc2hvdWxkTG9nKFwiV0FSTlwiKSkge1xuICAgICAgICAgICAgICAgICAgICB3cml0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIGBXQVJOICAke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKX0gJHt0YWdTdHJ9JHttZXNzYWdlfSR7Zm9ybWF0RXh0cmEoZXh0cmEpfVxcbmAsXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVycm9yKG1lc3NhZ2U6IHN0cmluZywgZXh0cmE/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+KSB7XG4gICAgICAgICAgICAgICAgaWYgKHNob3VsZExvZyhcIkVSUk9SXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHdyaXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgYEVSUk9SICR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpfSAke3RhZ1N0cn0ke21lc3NhZ2V9JHtmb3JtYXRFeHRyYShleHRyYSl9XFxuYCxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGV4cG9ydCBjb25zdCBEZWZhdWx0ID0gY3JlYXRlKHsgc2VydmljZTogXCJyYWxwaFwiIH0pO1xufVxuIgogIF0sCiAgIm1hcHBpbmdzIjogIjtBQU9BOztBQ05PLElBQU0sa0JBQWtCLEdBQUcsWUFBWSxZQUFZLHFCQUFxQixtQkFBbUIsc0JBQXNCLHFCQUFxQixrQkFBa0IsWUFBWSxRQUFRLGNBQWM7QUFBQSxFQUM3TCxJQUFJO0FBQUEsRUFDSixNQUFNLFFBQVEsZUFBZSxDQUFDLE9BQU8sSUFBSSxRQUFRLENBQUMsWUFBWSxXQUFXLFNBQVMsRUFBRSxDQUFDO0FBQUEsRUFDckYsTUFBTSxlQUFlLGdCQUFnQixHQUFHO0FBQUEsSUFDcEMsSUFBSSxhQUFhLHdCQUF3QjtBQUFBLElBQ3pDLElBQUksVUFBVTtBQUFBLElBQ2QsTUFBTSxTQUFTLFFBQVEsVUFBVSxJQUFJLGdCQUFnQixFQUFFO0FBQUEsSUFDdkQsT0FBTyxNQUFNO0FBQUEs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QUFBQSxTQUNGO0FBQUEsTUFDSCxTQUFTO0FBQUEsUUFDTCxnQkFBZ0I7QUFBQSxXQUNiLFFBQVE7QUFBQSxNQUNmO0FBQUEsSUFDSixDQUFDO0FBQUE7QUFBQSxFQUtMLFFBQVEsQ0FBQyxTQUFTO0FBQUEsSUFDZCxRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsSUFBSTtBQUFBLE1BQ3hDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFBQSxFQUtMLElBQUksQ0FBQyxTQUFTO0FBQUEsSUFDVixRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsSUFBSTtBQUFBLE1BQ3hDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFBQSxFQUtMLElBQUksQ0FBQyxTQUFTO0FBQUEsSUFDVixRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsS0FBSztBQUFBLE1BQ3pDLEtBQUs7QUFBQSxTQUNGO0FBQUEsTUFDSCxTQUFTO0FBQUEsUUFDTCxnQkFBZ0I7QUFBQSxXQUNiLFFBQVE7QUFBQSxNQUNmO0FBQUEsSUFDSixDQUFDO0FBQUE7QUFBQSxFQUtMLElBQUksQ0FBQyxTQUFTO0FBQUEsSUFDVixRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsS0FBSztBQUFBLE1BQ3pDLEtBQUs7QUFBQSxTQUNGO0FBQUEsTUFDSCxTQUFTO0FBQUEsUUFDTCxnQkFBZ0I7QUFBQSxXQUNiLFFBQVE7QUFBQSxNQUNmO0FBQUEsSUFDSixDQUFDO0FBQUE7QUFBQSxFQUtMLEtBQUssQ0FBQyxTQUFTO0FBQUEsSUFDWCxRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsS0FBSztBQUFBLE1BQ3pDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFBQSxFQUtMLE9BQU8sQ0FBQyxTQUFTO0FBQUEsSUFDYixRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsT0FBTztBQUFBLE1BQzNDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFBQSxFQUtMLEtBQUssQ0FBQyxTQUFTO0FBQUEsSUFDWCxRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsS0FBSztBQUFBLE1BQ3pDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFBQSxFQUtMLElBQUksQ0FBQyxTQUFTO0FBQUEsSUFDVixRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsSUFBSTtBQUFBLE1BQ3hDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFBQSxFQUtMLFNBQVMsQ0FBQyxTQUFTO0FBQUEsSUFDZixRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsS0FBSztBQUFBLE1BQ3pDLEtBQUs7QUFBQSxTQUNGO0FBQUEsTUFDSCxTQUFTO0FBQUEsUUFDTCxnQkFBZ0I7QUFBQSxXQUNiLFFBQVE7QUFBQSxNQUNmO0FBQUEsSUFDSixDQUFDO0FBQUE7QUFBQSxFQUtMLFFBQVEsQ0FBQyxTQUFTO0FBQUEsSUFDZCxRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsSUFBSTtBQUFBLE1BQ3hDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFBQSxFQUtMLE1BQU0sQ0FBQyxTQUFTO0FBQUEsSUFDWixRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsS0FBSztBQUFBLE1BQ3pDLEtBQUs7QUFBQSxTQUNGO0FBQUEsTUFDSCxTQUFTO0FBQUEsUUFDTCxnQkFBZ0I7QUFBQSxXQUNiLFFBQVE7QUFBQSxNQUNmO0FBQUEsSUFDSixDQUFDO0FBQUE7QUFBQSxFQUtMLE9BQU8sQ0FBQyxTQUFTO0FBQUEsSUFDYixRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsSUFBSTtBQUFBLE1BQ3hDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFBQSxFQUtMLFdBQVcsQ0FBQyxTQUFTO0FBQUEsSUFDakIsUUFBUSxRQUFRLFVBQVUsS0FBSyxTQUFTLEtBQUs7QUFBQSxNQUN6QyxLQUFLO0FBQUEsU0FDRjtBQUFBLE1BQ0gsU0FBUztBQUFBLFFBQ0wsZ0JBQWdCO0FBQUEsV0FDYixRQUFRO0FBQUEsTUFDZjtBQUFBLElBQ0osQ0FBQztBQUFBO0FBQUEsRUFLTCxPQUFPLENBQUMsU0FBUztBQUFBLElBQ2IsUUFBUSxRQUFRLFVBQVUsS0FBSyxTQUFTLEtBQUs7QUFBQSxNQUN6QyxLQUFLO0FBQUEsU0FDRjtBQUFBLE1BQ0gsU0FBUztBQUFBLFFBQ0wsZ0JBQWdCO0FBQUEsV0FDYixRQUFRO0FBQUEsTUFDZjtBQUFBLElBQ0osQ0FBQztBQUFBO0FBQUEsRUFLTCxLQUFLLENBQUMsU0FBUztBQUFBLElBQ1gsUUFBUSxRQUFRLFVBQVUsS0FBSyxTQUFTLEtBQUs7QUFBQSxNQUN6QyxLQUFLO0FBQUEsU0FDRjtBQUFBLE1BQ0gsU0FBUztBQUFBLFFBQ0wsZ0JBQWdCO0FBQUEsV0FDYixRQUFRO0FBQUEsTUFDZjtBQUFBLElBQ0osQ0FBQztBQUFBO0FBQUEsRUFLTCxNQUFNLENBQUMsU0FBUztBQUFBLElBQ1osUUFBUSxRQUFRLFVBQVUsS0FBSyxTQUFTLEtBQUs7QUFBQSxNQUN6QyxLQUFLO0FBQUEsU0FDRjtBQUFBLE1BQ0gsU0FBUztBQUFBLFFBQ0wsZ0JBQWdCO0FBQUEsV0FDYixRQUFRO0FBQUEsTUFDZjtBQUFBLElBQ0osQ0FBQztBQUFBO0FBQUEsRUFLTCxRQUFRLENBQUMsU0FBUztBQUFBLElBQ2QsUUFBUSxRQUFRLFVBQVUsS0FBSyxTQUFTLEtBQUs7QUFBQSxNQUN6QyxLQUFLO0FBQUEsU0FDRjtBQUFBLElBQ1AsQ0FBQztBQUFBO0FBRVQ7QUFBQTtBQUNBLE1BQU0sZ0JBQWdCLGNBQWM7QUFBQSxFQUloQyxJQUFJLENBQUMsU0FBUztBQUFBLElBQ1YsUUFBUSxTQUFTLFVBQVUsS0FBSyxTQUFTLElBQUk7QUFBQSxNQUN6QyxLQUFLO0FBQUEsU0FDRjtBQUFBLElBQ1AsQ0FBQztBQUFBO0FBRVQ7QUFBQTtBQUNBLE1BQU0sY0FBYyxjQUFjO0FBQUEsRUFJOUIsU0FBUyxDQUFDLFNBQVM7QUFBQSxJQUNmLFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxLQUFLO0FBQUEsTUFDekMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxNQUNILFNBQVM7QUFBQSxRQUNMLGdCQUFnQjtBQUFBLFdBQ2IsUUFBUTtBQUFBLE1BQ2Y7QUFBQSxJQUNKLENBQUM7QUFBQTtBQUFBLEVBS0wsUUFBUSxDQUFDLFNBQVM7QUFBQSxJQUNkLFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxLQUFLO0FBQUEsTUFDekMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxNQUNILFNBQVM7QUFBQSxRQUNMLGdCQUFnQjtBQUFBLFdBQ2IsUUFBUTtBQUFBLE1BQ2Y7QUFBQSxJQUNKLENBQUM7QUFBQTtBQUVUO0FBQUE7QUFDQSxNQUFNLGlCQUFpQixjQUFjO0FBQUEsRUFJakMsSUFBSSxDQUFDLFNBQVM7QUFBQSxJQUNWLFFBQVEsU0FBUyxVQUFVLEtBQUssU0FBUyxJQUFJO0FBQUEsTUFDekMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUFBLEVBS0wsSUFBSSxDQUFDLFNBQVM7QUFBQSxJQUNWLFFBQVEsU0FBUyxVQUFVLEtBQUssU0FBUyxJQUFJO0FBQUEsTUFDekMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUFBLEVBRUwsUUFBUSxJQUFJLE1BQU0sRUFBRSxRQUFRLEtBQUssUUFBUSxDQUFDO0FBQzlDO0FBQUE7QUFDQSxNQUFNLGFBQWEsY0FBYztBQUFBLEVBSTdCLElBQUksQ0FBQyxTQUFTO0FBQUEsSUFDVixRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsSUFBSTtBQUFBLE1BQ3hDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFBQSxFQUtMLEtBQUssQ0FBQyxTQUFTO0FBQUEsSUFDWCxRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsSUFBSTtBQUFBLE1BQ3hDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFBQSxFQUtMLE9BQU8sQ0FBQyxTQUFTO0FBQUEsSUFDYixRQUFRLFFBQVEsVUFBVSxLQUFLLFNBQVMsSUFBSTtBQUFBLE1BQ3hDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFFVDtBQUFBO0FBQ0EsTUFBTSxhQUFhLGNBQWM7QUFBQSxFQUk3QixJQUFJLENBQUMsU0FBUztBQUFBLElBQ1YsUUFBUSxRQUFRLFVBQVUsS0FBSyxTQUFTLElBQUk7QUFBQSxNQUN4QyxLQUFLO0FBQUEsU0FDRjtBQUFBLElBQ1AsQ0FBQztBQUFBO0FBQUEsRUFLTCxJQUFJLENBQUMsU0FBUztBQUFBLElBQ1YsUUFBUSxRQUFRLFVBQVUsS0FBSyxTQUFTLElBQUk7QUFBQSxNQUN4QyxLQUFLO0FBQUEsU0FDRjtBQUFBLElBQ1AsQ0FBQztBQUFBO0FBQUEsRUFLTCxNQUFNLENBQUMsU0FBUztBQUFBLElBQ1osUUFBUSxTQUFTLFVBQVUsS0FBSyxTQUFTLElBQUk7QUFBQSxNQUN6QyxLQUFLO0FBQUEsU0FDRjtBQUFBLElBQ1AsQ0FBQztBQUFBO0FBRVQ7QUFBQTtBQUNBLE1BQU0sWUFBWSxjQUFjO0FBQUEsRUFJNUIsR0FBRyxDQUFDLFNBQVM7QUFBQSxJQUNULFFBQVEsU0FBUyxVQUFVLEtBQUssU0FBUyxLQUFLO0FBQUEsTUFDMUMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxNQUNILFNBQVM7QUFBQSxRQUNMLGdCQUFnQjtBQUFBLFdBQ2IsU0FBUztBQUFBLE1BQ2hCO0FBQUEsSUFDSixDQUFDO0FBQUE7QUFBQSxFQUtMLE1BQU0sQ0FBQyxTQUFTO0FBQUEsSUFDWixRQUFRLFNBQVMsVUFBVSxLQUFLLFNBQVMsSUFBSTtBQUFBLE1BQ3pDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFFVDtBQUFBO0FBQ0EsTUFBTSxhQUFhLGNBQWM7QUFBQSxFQUk3QixNQUFNLENBQUMsU0FBUztBQUFBLElBQ1osUUFBUSxRQUFRLFVBQVUsS0FBSyxTQUFTLE9BQU87QUFBQSxNQUMzQyxLQUFLO0FBQUEsU0FDRjtBQUFBLElBQ1AsQ0FBQztBQUFBO0FBQUEsRUFLTCxLQUFLLENBQUMsU0FBUztBQUFBLElBQ1gsUUFBUSxRQUFRLFVBQVUsS0FBSyxTQUFTLEtBQUs7QUFBQSxNQUN6QyxLQUFLO0FBQUEsU0FDRjtBQUFBLElBQ1AsQ0FBQztBQUFBO0FBQUEsRUFLTCxRQUFRLENBQUMsU0FBUztBQUFBLElBQ2QsUUFBUSxRQUFRLFVBQVUsS0FBSyxTQUFTLEtBQUs7QUFBQSxNQUN6QyxLQUFLO0FBQUEsU0FDRjtBQUFBLE1BQ0gsU0FBUztBQUFBLFFBQ0wsZ0JBQWdCO0FBQUEsV0FDYixRQUFRO0FBQUEsTUFDZjtBQUFBLElBQ0osQ0FBQztBQUFBO0FBQUEsRUFLTCxZQUFZLENBQUMsU0FBUztBQUFBLElBQ2xCLFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxLQUFLO0FBQUEsTUFDekMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUFBLEVBS0wsR0FBRyxDQUFDLFNBQVM7QUFBQSxJQUNULFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxJQUFJO0FBQUEsTUFDeEMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxNQUNILFNBQVM7QUFBQSxRQUNMLGdCQUFnQjtBQUFBLFdBQ2IsUUFBUTtBQUFBLE1BQ2Y7QUFBQSxJQUNKLENBQUM7QUFBQTtBQUVUO0FBQUE7QUFDQSxNQUFNLFlBQVksY0FBYztBQUFBLEVBSTVCLE1BQU0sQ0FBQyxTQUFTO0FBQUEsSUFDWixRQUFRLFNBQVMsVUFBVSxLQUFLLFNBQVMsSUFBSTtBQUFBLE1BQ3pDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFBQSxFQUtMLEdBQUcsQ0FBQyxTQUFTO0FBQUEsSUFDVCxRQUFRLFNBQVMsVUFBVSxLQUFLLFNBQVMsS0FBSztBQUFBLE1BQzFDLEtBQUs7QUFBQSxTQUNGO0FBQUEsTUFDSCxTQUFTO0FBQUEsUUFDTCxnQkFBZ0I7QUFBQSxXQUNiLFNBQVM7QUFBQSxNQUNoQjtBQUFBLElBQ0osQ0FBQztBQUFBO0FBQUEsRUFLTCxPQUFPLENBQUMsU0FBUztBQUFBLElBQ2IsUUFBUSxRQUFRLFVBQVUsS0FBSyxTQUFTLEtBQUs7QUFBQSxNQUN6QyxLQUFLO0FBQUEsU0FDRjtBQUFBLElBQ1AsQ0FBQztBQUFBO0FBQUEsRUFLTCxVQUFVLENBQUMsU0FBUztBQUFBLElBQ2hCLFFBQVEsUUFBUSxVQUFVLEtBQUssU0FBUyxLQUFLO0FBQUEsTUFDekMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUFBLEVBRUwsT0FBTyxJQUFJLEtBQUssRUFBRSxRQUFRLEtBQUssUUFBUSxDQUFDO0FBQzVDO0FBQUE7QUFDQSxNQUFNLFlBQVksY0FBYztBQUFBLEVBSTVCLE1BQU0sQ0FBQyxTQUFTO0FBQUEsSUFDWixRQUFRLFNBQVMsVUFBVSxLQUFLLFNBQVMsSUFBSTtBQUFBLE1BQ3pDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFFVDtBQUFBO0FBQ0EsTUFBTSxrQkFBa0IsY0FBYztBQUFBLEVBSWxDLE1BQU0sQ0FBQyxTQUFTO0FBQUEsSUFDWixRQUFRLFNBQVMsVUFBVSxLQUFLLFNBQVMsSUFBSTtBQUFBLE1BQ3pDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFFVDtBQUFBO0FBQ0EsTUFBTSxnQkFBZ0IsY0FBYztBQUFBLEVBSWhDLElBQUksQ0FBQyxTQUFTO0FBQUEsSUFDVixRQUFRLFNBQVMsVUFBVSxLQUFLLFNBQVMsSUFBSTtBQUFBLE1BQ3pDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFBQSxFQUtMLFFBQVEsQ0FBQyxTQUFTO0FBQUEsSUFDZCxRQUFRLFNBQVMsVUFBVSxLQUFLLFNBQVMsS0FBSztBQUFBLE1BQzFDLEtBQUs7QUFBQSxTQUNGO0FBQUEsTUFDSCxTQUFTO0FBQUEsUUFDTCxnQkFBZ0I7QUFBQSxXQUNiLFNBQVM7QUFBQSxNQUNoQjtBQUFBLElBQ0osQ0FBQztBQUFBO0FBRVQ7QUFBQTtBQUNBLE1BQU0sWUFBWSxjQUFjO0FBQUEsRUFJNUIsWUFBWSxDQUFDLFNBQVM7QUFBQSxJQUNsQixRQUFRLFNBQVMsVUFBVSxLQUFLLFNBQVMsS0FBSztBQUFBLE1BQzFDLEtBQUs7QUFBQSxTQUNGO0FBQUEsTUFDSCxTQUFTO0FBQUEsUUFDTCxnQkFBZ0I7QUFBQSxXQUNiLFNBQVM7QUFBQSxNQUNoQjtBQUFBLElBQ0osQ0FBQztBQUFBO0FBQUEsRUFLTCxRQUFRLENBQUMsU0FBUztBQUFBLElBQ2QsUUFBUSxTQUFTLFVBQVUsS0FBSyxTQUFTLEtBQUs7QUFBQSxNQUMxQyxLQUFLO0FBQUEsU0FDRjtBQUFBLElBQ1AsQ0FBQztBQUFBO0FBQUEsRUFLTCxZQUFZLENBQUMsU0FBUztBQUFBLElBQ2xCLFFBQVEsU0FBUyxVQUFVLEtBQUssU0FBUyxLQUFLO0FBQUEsTUFDMUMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUFBLEVBS0wsVUFBVSxDQUFDLFNBQVM7QUFBQSxJQUNoQixRQUFRLFNBQVMsVUFBVSxLQUFLLFNBQVMsS0FBSztBQUFBLE1BQzFDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFBQSxFQUtMLFVBQVUsQ0FBQyxTQUFTO0FBQUEsSUFDaEIsUUFBUSxTQUFTLFVBQVUsS0FBSyxTQUFTLEtBQUs7QUFBQSxNQUMxQyxLQUFLO0FBQUEsU0FDRjtBQUFBLElBQ1AsQ0FBQztBQUFBO0FBQUEsRUFLTCxZQUFZLENBQUMsU0FBUztBQUFBLElBQ2xCLFFBQVEsU0FBUyxVQUFVLEtBQUssU0FBUyxLQUFLO0FBQUEsTUFDMUMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUFBLEVBS0wsV0FBVyxDQUFDLFNBQVM7QUFBQSxJQUNqQixRQUFRLFNBQVMsVUFBVSxLQUFLLFNBQVMsS0FBSztBQUFBLE1BQzFDLEtBQUs7QUFBQSxTQUNGO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFBQSxFQUtMLGNBQWMsQ0FBQyxTQUFTO0FBQUEsSUFDcEIsUUFBUSxTQUFTLFVBQVUsS0FBSyxTQUFTLEtBQUs7QUFBQSxNQUMxQyxLQUFLO0FBQUEsU0FDRjtBQUFBLE1BQ0gsU0FBUztBQUFBLFFBQ0wsZ0JBQWdCO0FBQUEsV0FDYixTQUFTO0FBQUEsTUFDaEI7QUFBQSxJQUNKLENBQUM7QUFBQTtBQUFBLEVBS0wsU0FBUyxDQUFDLFNBQVM7QUFBQSxJQUNmLFFBQVEsU0FBUyxVQUFVLEtBQUssU0FBUyxLQUFLO0FBQUEsTUFDMUMsS0FBSztBQUFBLFNBQ0Y7QUFBQSxNQUNILFNBQVM7QUFBQSxRQUNMLGdCQUFnQjtBQUFBLFdBQ2IsU0FBUztBQUFBLE1BQ2hCO0FBQUEsSUFDSixDQUFDO0FBQUE7QUFBQSxFQUtMLE9BQU8sQ0FBQyxTQUFTO0FBQUEsSUFDYixRQUFRLFNBQVMsVUFBVSxLQUFLLFNBQVMsS0FBSztBQUFBLE1BQzFDLEtBQUs7QUFBQSxTQUNGO0FBQUEsTUFDSCxTQUFTO0FBQUEsUUFDTCxnQkFBZ0I7QUFBQSxXQUNiLFNBQVM7QUFBQSxNQUNoQjtBQUFBLElBQ0osQ0FBQztBQUFBO0FBQUEsRUFFTCxVQUFVLElBQUksUUFBUSxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFDbEQ7QUFBQTtBQUNBLE1BQU0sY0FBYyxjQUFjO0FBQUEsRUFJOUIsU0FBUyxDQUFDLFNBQVM7QUFBQSxJQUNmLFFBQVEsU0FBUyxVQUFVLEtBQUssU0FBUyxJQUFJLElBQUk7QUFBQSxNQUM3QyxLQUFLO0FBQUEsU0FDRjtBQUFBLElBQ1AsQ0FBQztBQUFBO0FBRVQ7QUFBQTtBQUNPLE1BQU0sdUJBQXVCLGNBQWM7QUFBQSxFQUk5QyxvQ0FBb0MsQ0FBQyxTQUFTO0FBQUEsSUFDMUMsUUFBUSxRQUFRLFVBQVUsS0FBSyxTQUFTLEtBQUs7QUFBQSxNQUN6QyxLQUFLO0FBQUEsU0FDRjtBQUFBLE1BQ0gsU0FBUztBQUFBLFFBQ0wsZ0JBQWdCO0FBQUEsV0FDYixRQUFRO0FBQUEsTUFDZjtBQUFBLElBQ0osQ0FBQztBQUFBO0FBQUEsRUFFTCxTQUFTLElBQUksT0FBTyxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxFQUM1QyxVQUFVLElBQUksUUFBUSxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxFQUM5QyxNQUFNLElBQUksSUFBSSxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxFQUN0QyxTQUFTLElBQUksT0FBTyxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxFQUM1QyxPQUFPLElBQUksS0FBSyxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxFQUN4QyxXQUFXLElBQUksU0FBUyxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxFQUNoRCxPQUFPLElBQUksS0FBSyxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxFQUN4QyxNQUFNLElBQUksSUFBSSxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxFQUN0QyxVQUFVLElBQUksUUFBUSxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxFQUM5QyxVQUFVLElBQUksUUFBUSxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxFQUM5QyxXQUFXLElBQUksU0FBUyxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxFQUNoRCxPQUFPLElBQUksS0FBSyxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxFQUN4QyxPQUFPLElBQUksS0FBSyxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxFQUN4QyxNQUFNLElBQUksSUFBSSxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxFQUN0QyxNQUFNLElBQUksSUFBSSxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxFQUN0QyxNQUFNLElBQUksSUFBSSxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxFQUN0QyxZQUFZLElBQUksVUFBVSxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxFQUNsRCxNQUFNLElBQUksSUFBSSxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxFQUN0QyxPQUFPLElBQUksS0FBSyxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxFQUN4QyxRQUFRLElBQUksTUFBTSxFQUFFLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFDOUM7OztBQzUyQk8sU0FBUyxvQkFBb0Is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
