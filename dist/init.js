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

// node_modules/yaml/dist/nodes/identity.js
var require_identity = __commonJS((exports) => {
  var ALIAS = Symbol.for("yaml.alias");
  var DOC = Symbol.for("yaml.document");
  var MAP = Symbol.for("yaml.map");
  var PAIR = Symbol.for("yaml.pair");
  var SCALAR = Symbol.for("yaml.scalar");
  var SEQ = Symbol.for("yaml.seq");
  var NODE_TYPE = Symbol.for("yaml.node.type");
  var isAlias = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === ALIAS;
  var isDocument = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === DOC;
  var isMap = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === MAP;
  var isPair = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === PAIR;
  var isScalar = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === SCALAR;
  var isSeq = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === SEQ;
  function isCollection(node) {
    if (node && typeof node === "object")
      switch (node[NODE_TYPE]) {
        case MAP:
        case SEQ:
          return true;
      }
    return false;
  }
  function isNode(node) {
    if (node && typeof node === "object")
      switch (node[NODE_TYPE]) {
        case ALIAS:
        case MAP:
        case SCALAR:
        case SEQ:
          return true;
      }
    return false;
  }
  var hasAnchor = (node) => (isScalar(node) || isCollection(node)) && !!node.anchor;
  exports.ALIAS = ALIAS;
  exports.DOC = DOC;
  exports.MAP = MAP;
  exports.NODE_TYPE = NODE_TYPE;
  exports.PAIR = PAIR;
  exports.SCALAR = SCALAR;
  exports.SEQ = SEQ;
  exports.hasAnchor = hasAnchor;
  exports.isAlias = isAlias;
  exports.isCollection = isCollection;
  exports.isDocument = isDocument;
  exports.isMap = isMap;
  exports.isNode = isNode;
  exports.isPair = isPair;
  exports.isScalar = isScalar;
  exports.isSeq = isSeq;
});

// node_modules/yaml/dist/visit.js
var require_visit = __commonJS((exports) => {
  var identity = require_identity();
  var BREAK = Symbol("break visit");
  var SKIP = Symbol("skip children");
  var REMOVE = Symbol("remove node");
  function visit(node, visitor) {
    const visitor_ = initVisitor(visitor);
    if (identity.isDocument(node)) {
      const cd = visit_(null, node.contents, visitor_, Object.freeze([node]));
      if (cd === REMOVE)
        node.contents = null;
    } else
      visit_(null, node, visitor_, Object.freeze([]));
  }
  visit.BREAK = BREAK;
  visit.SKIP = SKIP;
  visit.REMOVE = REMOVE;
  function visit_(key, node, visitor, path) {
    const ctrl = callVisitor(key, node, visitor, path);
    if (identity.isNode(ctrl) || identity.isPair(ctrl)) {
      replaceNode(key, path, ctrl);
      return visit_(key, ctrl, visitor, path);
    }
    if (typeof ctrl !== "symbol") {
      if (identity.isCollection(node)) {
        path = Object.freeze(path.concat(node));
        for (let i = 0;i < node.items.length; ++i) {
          const ci = visit_(i, node.items[i], visitor, path);
          if (typeof ci === "number")
            i = ci - 1;
          else if (ci === BREAK)
            return BREAK;
          else if (ci === REMOVE) {
            node.items.splice(i, 1);
            i -= 1;
          }
        }
      } else if (identity.isPair(node)) {
        path = Object.freeze(path.concat(node));
        const ck = visit_("key", node.key, visitor, path);
        if (ck === BREAK)
          return BREAK;
        else if (ck === REMOVE)
          node.key = null;
        const cv = visit_("value", node.value, visitor, path);
        if (cv === BREAK)
          return BREAK;
        else if (cv === REMOVE)
          node.value = null;
      }
    }
    return ctrl;
  }
  async function visitAsync(node, visitor) {
    const visitor_ = initVisitor(visitor);
    if (identity.isDocument(node)) {
      const cd = await visitAsync_(null, node.contents, visitor_, Object.freeze([node]));
      if (cd === REMOVE)
        node.contents = null;
    } else
      await visitAsync_(null, node, visitor_, Object.freeze([]));
  }
  visitAsync.BREAK = BREAK;
  visitAsync.SKIP = SKIP;
  visitAsync.REMOVE = REMOVE;
  async function visitAsync_(key, node, visitor, path) {
    const ctrl = await callVisitor(key, node, visitor, path);
    if (identity.isNode(ctrl) || identity.isPair(ctrl)) {
      replaceNode(key, path, ctrl);
      return visitAsync_(key, ctrl, visitor, path);
    }
    if (typeof ctrl !== "symbol") {
      if (identity.isCollection(node)) {
        path = Object.freeze(path.concat(node));
        for (let i = 0;i < node.items.length; ++i) {
          const ci = await visitAsync_(i, node.items[i], visitor, path);
          if (typeof ci === "number")
            i = ci - 1;
          else if (ci === BREAK)
            return BREAK;
          else if (ci === REMOVE) {
            node.items.splice(i, 1);
            i -= 1;
          }
        }
      } else if (identity.isPair(node)) {
        path = Object.freeze(path.concat(node));
        const ck = await visitAsync_("key", node.key, visitor, path);
        if (ck === BREAK)
          return BREAK;
        else if (ck === REMOVE)
          node.key = null;
        const cv = await visitAsync_("value", node.value, visitor, path);
        if (cv === BREAK)
          return BREAK;
        else if (cv === REMOVE)
          node.value = null;
      }
    }
    return ctrl;
  }
  function initVisitor(visitor) {
    if (typeof visitor === "object" && (visitor.Collection || visitor.Node || visitor.Value)) {
      return Object.assign({
        Alias: visitor.Node,
        Map: visitor.Node,
        Scalar: visitor.Node,
        Seq: visitor.Node
      }, visitor.Value && {
        Map: visitor.Value,
        Scalar: visitor.Value,
        Seq: visitor.Value
      }, visitor.Collection && {
        Map: visitor.Collection,
        Seq: visitor.Collection
      }, visitor);
    }
    return visitor;
  }
  function callVisitor(key, node, visitor, path) {
    if (typeof visitor === "function")
      return visitor(key, node, path);
    if (identity.isMap(node))
      return visitor.Map?.(key, node, path);
    if (identity.isSeq(node))
      return visitor.Seq?.(key, node, path);
    if (identity.isPair(node))
      return visitor.Pair?.(key, node, path);
    if (identity.isScalar(node))
      return visitor.Scalar?.(key, node, path);
    if (identity.isAlias(node))
      return visitor.Alias?.(key, node, path);
    return;
  }
  function replaceNode(key, path, node) {
    const parent = path[path.length - 1];
    if (identity.isCollection(parent)) {
      parent.items[key] = node;
    } else if (identity.isPair(parent)) {
      if (key === "key")
        parent.key = node;
      else
        parent.value = node;
    } else if (identity.isDocument(parent)) {
      parent.contents = node;
    } else {
      const pt = identity.isAlias(parent) ? "alias" : "scalar";
      throw new Error(`Cannot replace node with ${pt} parent`);
    }
  }
  exports.visit = visit;
  exports.visitAsync = visitAsync;
});

// node_modules/yaml/dist/doc/directives.js
var require_directives = __commonJS((exports) => {
  var identity = require_identity();
  var visit = require_visit();
  var escapeChars = {
    "!": "%21",
    ",": "%2C",
    "[": "%5B",
    "]": "%5D",
    "{": "%7B",
    "}": "%7D"
  };
  var escapeTagName = (tn) => tn.replace(/[!,[\]{}]/g, (ch) => escapeChars[ch]);

  class Directives {
    constructor(yaml, tags) {
      this.docStart = null;
      this.docEnd = false;
      this.yaml = Object.assign({}, Directives.defaultYaml, yaml);
      this.tags = Object.assign({}, Directives.defaultTags, tags);
    }
    clone() {
      const copy = new Directives(this.yaml, this.tags);
      copy.docStart = this.docStart;
      return copy;
    }
    atDocument() {
      const res = new Directives(this.yaml, this.tags);
      switch (this.yaml.version) {
        case "1.1":
          this.atNextDocument = true;
          break;
        case "1.2":
          this.atNextDocument = false;
          this.yaml = {
            explicit: Directives.defaultYaml.explicit,
            version: "1.2"
          };
          this.tags = Object.assign({}, Directives.defaultTags);
          break;
      }
      return res;
    }
    add(line, onError) {
      if (this.atNextDocument) {
        this.yaml = { explicit: Directives.defaultYaml.explicit, version: "1.1" };
        this.tags = Object.assign({}, Directives.defaultTags);
        this.atNextDocument = false;
      }
      const parts = line.trim().split(/[ \t]+/);
      const name = parts.shift();
      switch (name) {
        case "%TAG": {
          if (parts.length !== 2) {
            onError(0, "%TAG directive should contain exactly two parts");
            if (parts.length < 2)
              return false;
          }
          const [handle, prefix] = parts;
          this.tags[handle] = prefix;
          return true;
        }
        case "%YAML": {
          this.yaml.explicit = true;
          if (parts.length !== 1) {
            onError(0, "%YAML directive should contain exactly one part");
            return false;
          }
          const [version] = parts;
          if (version === "1.1" || version === "1.2") {
            this.yaml.version = version;
            return true;
          } else {
            const isValid = /^\d+\.\d+$/.test(version);
            onError(6, `Unsupported YAML version ${version}`, isValid);
            return false;
          }
        }
        default:
          onError(0, `Unknown directive ${name}`, true);
          return false;
      }
    }
    tagName(source, onError) {
      if (source === "!")
        return "!";
      if (source[0] !== "!") {
        onError(`Not a valid tag: ${source}`);
        return null;
      }
      if (source[1] === "<") {
        const verbatim = source.slice(2, -1);
        if (verbatim === "!" || verbatim === "!!") {
          onError(`Verbatim tags aren't resolved, so ${source} is invalid.`);
          return null;
        }
        if (source[source.length - 1] !== ">")
          onError("Verbatim tags must end with a >");
        return verbatim;
      }
      const [, handle, suffix] = source.match(/^(.*!)([^!]*)$/s);
      if (!suffix)
        onError(`The ${source} tag has no suffix`);
      const prefix = this.tags[handle];
      if (prefix) {
        try {
          return prefix + decodeURIComponent(suffix);
        } catch (error) {
          onError(String(error));
          return null;
        }
      }
      if (handle === "!")
        return source;
      onError(`Could not resolve tag: ${source}`);
      return null;
    }
    tagString(tag) {
      for (const [handle, prefix] of Object.entries(this.tags)) {
        if (tag.startsWith(prefix))
          return handle + escapeTagName(tag.substring(prefix.length));
      }
      return tag[0] === "!" ? tag : `!<${tag}>`;
    }
    toString(doc) {
      const lines = this.yaml.explicit ? [`%YAML ${this.yaml.version || "1.2"}`] : [];
      const tagEntries = Object.entries(this.tags);
      let tagNames;
      if (doc && tagEntries.length > 0 && identity.isNode(doc.contents)) {
        const tags = {};
        visit.visit(doc.contents, (_key, node) => {
          if (identity.isNode(node) && node.tag)
            tags[node.tag] = true;
        });
        tagNames = Object.keys(tags);
      } else
        tagNames = [];
      for (const [handle, prefix] of tagEntries) {
        if (handle === "!!" && prefix === "tag:yaml.org,2002:")
          continue;
        if (!doc || tagNames.some((tn) => tn.startsWith(prefix)))
          lines.push(`%TAG ${handle} ${prefix}`);
      }
      return lines.join(`
`);
    }
  }
  Directives.defaultYaml = { explicit: false, version: "1.2" };
  Directives.defaultTags = { "!!": "tag:yaml.org,2002:" };
  exports.Directives = Directives;
});

// node_modules/yaml/dist/doc/anchors.js
var require_anchors = __commonJS((exports) => {
  var identity = require_identity();
  var visit = require_visit();
  function anchorIsValid(anchor) {
    if (/[\x00-\x19\s,[\]{}]/.test(anchor)) {
      const sa = JSON.stringify(anchor);
      const msg = `Anchor must not contain whitespace or control characters: ${sa}`;
      throw new Error(msg);
    }
    return true;
  }
  function anchorNames(root) {
    const anchors = new Set;
    visit.visit(root, {
      Value(_key, node) {
        if (node.anchor)
          anchors.add(node.anchor);
      }
    });
    return anchors;
  }
  function findNewAnchor(prefix, exclude) {
    for (let i = 1;; ++i) {
      const name = `${prefix}${i}`;
      if (!exclude.has(name))
        return name;
    }
  }
  function createNodeAnchors(doc, prefix) {
    const aliasObjects = [];
    const sourceObjects = new Map;
    let prevAnchors = null;
    return {
      onAnchor: (source) => {
        aliasObjects.push(source);
        prevAnchors ?? (prevAnchors = anchorNames(doc));
        const anchor = findNewAnchor(prefix, prevAnchors);
        prevAnchors.add(anchor);
        return anchor;
      },
      setAnchors: () => {
        for (const source of aliasObjects) {
          const ref = sourceObjects.get(source);
          if (typeof ref === "object" && ref.anchor && (identity.isScalar(ref.node) || identity.isCollection(ref.node))) {
            ref.node.anchor = ref.anchor;
          } else {
            const error = new Error("Failed to resolve repeated object (this should not happen)");
            error.source = source;
            throw error;
          }
        }
      },
      sourceObjects
    };
  }
  exports.anchorIsValid = anchorIsValid;
  exports.anchorNames = anchorNames;
  exports.createNodeAnchors = createNodeAnchors;
  exports.findNewAnchor = findNewAnchor;
});

// node_modules/yaml/dist/doc/applyReviver.js
var require_applyReviver = __commonJS((exports) => {
  function applyReviver(reviver, obj, key, val) {
    if (val && typeof val === "object") {
      if (Array.isArray(val)) {
        for (let i = 0, len = val.length;i < len; ++i) {
          const v0 = val[i];
          const v1 = applyReviver(reviver, val, String(i), v0);
          if (v1 === undefined)
            delete val[i];
          else if (v1 !== v0)
            val[i] = v1;
        }
      } else if (val instanceof Map) {
        for (const k of Array.from(val.keys())) {
          const v0 = val.get(k);
          const v1 = applyReviver(reviver, val, k, v0);
          if (v1 === undefined)
            val.delete(k);
          else if (v1 !== v0)
            val.set(k, v1);
        }
      } else if (val instanceof Set) {
        for (const v0 of Array.from(val)) {
          const v1 = applyReviver(reviver, val, v0, v0);
          if (v1 === undefined)
            val.delete(v0);
          else if (v1 !== v0) {
            val.delete(v0);
            val.add(v1);
          }
        }
      } else {
        for (const [k, v0] of Object.entries(val)) {
          const v1 = applyReviver(reviver, val, k, v0);
          if (v1 === undefined)
            delete val[k];
          else if (v1 !== v0)
            val[k] = v1;
        }
      }
    }
    return reviver.call(obj, key, val);
  }
  exports.applyReviver = applyReviver;
});

// node_modules/yaml/dist/nodes/toJS.js
var require_toJS = __commonJS((exports) => {
  var identity = require_identity();
  function toJS(value, arg, ctx) {
    if (Array.isArray(value))
      return value.map((v, i) => toJS(v, String(i), ctx));
    if (value && typeof value.toJSON === "function") {
      if (!ctx || !identity.hasAnchor(value))
        return value.toJSON(arg, ctx);
      const data = { aliasCount: 0, count: 1, res: undefined };
      ctx.anchors.set(value, data);
      ctx.onCreate = (res2) => {
        data.res = res2;
        delete ctx.onCreate;
      };
      const res = value.toJSON(arg, ctx);
      if (ctx.onCreate)
        ctx.onCreate(res);
      return res;
    }
    if (typeof value === "bigint" && !ctx?.keep)
      return Number(value);
    return value;
  }
  exports.toJS = toJS;
});

// node_modules/yaml/dist/nodes/Node.js
var require_Node = __commonJS((exports) => {
  var applyReviver = require_applyReviver();
  var identity = require_identity();
  var toJS = require_toJS();

  class NodeBase {
    constructor(type) {
      Object.defineProperty(this, identity.NODE_TYPE, { value: type });
    }
    clone() {
      const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
      if (this.range)
        copy.range = this.range.slice();
      return copy;
    }
    toJS(doc, { mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
      if (!identity.isDocument(doc))
        throw new TypeError("A document argument is required");
      const ctx = {
        anchors: new Map,
        doc,
        keep: true,
        mapAsMap: mapAsMap === true,
        mapKeyWarned: false,
        maxAliasCount: typeof maxAliasCount === "number" ? maxAliasCount : 100
      };
      const res = toJS.toJS(this, "", ctx);
      if (typeof onAnchor === "function")
        for (const { count, res: res2 } of ctx.anchors.values())
          onAnchor(res2, count);
      return typeof reviver === "function" ? applyReviver.applyReviver(reviver, { "": res }, "", res) : res;
    }
  }
  exports.NodeBase = NodeBase;
});

// node_modules/yaml/dist/nodes/Alias.js
var require_Alias = __commonJS((exports) => {
  var anchors = require_anchors();
  var visit = require_visit();
  var identity = require_identity();
  var Node = require_Node();
  var toJS = require_toJS();

  class Alias extends Node.NodeBase {
    constructor(source) {
      super(identity.ALIAS);
      this.source = source;
      Object.defineProperty(this, "tag", {
        set() {
          throw new Error("Alias nodes cannot have tags");
        }
      });
    }
    resolve(doc, ctx) {
      let nodes;
      if (ctx?.aliasResolveCache) {
        nodes = ctx.aliasResolveCache;
      } else {
        nodes = [];
        visit.visit(doc, {
          Node: (_key, node) => {
            if (identity.isAlias(node) || identity.hasAnchor(node))
              nodes.push(node);
          }
        });
        if (ctx)
          ctx.aliasResolveCache = nodes;
      }
      let found = undefined;
      for (const node of nodes) {
        if (node === this)
          break;
        if (node.anchor === this.source)
          found = node;
      }
      return found;
    }
    toJSON(_arg, ctx) {
      if (!ctx)
        return { source: this.source };
      const { anchors: anchors2, doc, maxAliasCount } = ctx;
      const source = this.resolve(doc, ctx);
      if (!source) {
        const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
        throw new ReferenceError(msg);
      }
      let data = anchors2.get(source);
      if (!data) {
        toJS.toJS(source, null, ctx);
        data = anchors2.get(source);
      }
      if (data?.res === undefined) {
        const msg = "This should not happen: Alias anchor was not resolved?";
        throw new ReferenceError(msg);
      }
      if (maxAliasCount >= 0) {
        data.count += 1;
        if (data.aliasCount === 0)
          data.aliasCount = getAliasCount(doc, source, anchors2);
        if (data.count * data.aliasCount > maxAliasCount) {
          const msg = "Excessive alias count indicates a resource exhaustion attack";
          throw new ReferenceError(msg);
        }
      }
      return data.res;
    }
    toString(ctx, _onComment, _onChompKeep) {
      const src = `*${this.source}`;
      if (ctx) {
        anchors.anchorIsValid(this.source);
        if (ctx.options.verifyAliasOrder && !ctx.anchors.has(this.source)) {
          const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
          throw new Error(msg);
        }
        if (ctx.implicitKey)
          return `${src} `;
      }
      return src;
    }
  }
  function getAliasCount(doc, node, anchors2) {
    if (identity.isAlias(node)) {
      const source = node.resolve(doc);
      const anchor = anchors2 && source && anchors2.get(source);
      return anchor ? anchor.count * anchor.aliasCount : 0;
    } else if (identity.isCollection(node)) {
      let count = 0;
      for (const item of node.items) {
        const c = getAliasCount(doc, item, anchors2);
        if (c > count)
          count = c;
      }
      return count;
    } else if (identity.isPair(node)) {
      const kc = getAliasCount(doc, node.key, anchors2);
      const vc = getAliasCount(doc, node.value, anchors2);
      return Math.max(kc, vc);
    }
    return 1;
  }
  exports.Alias = Alias;
});

// node_modules/yaml/dist/nodes/Scalar.js
var require_Scalar = __commonJS((exports) => {
  var identity = require_identity();
  var Node = require_Node();
  var toJS = require_toJS();
  var isScalarValue = (value) => !value || typeof value !== "function" && typeof value !== "object";

  class Scalar extends Node.NodeBase {
    constructor(value) {
      super(identity.SCALAR);
      this.value = value;
    }
    toJSON(arg, ctx) {
      return ctx?.keep ? this.value : toJS.toJS(this.value, arg, ctx);
    }
    toString() {
      return String(this.value);
    }
  }
  Scalar.BLOCK_FOLDED = "BLOCK_FOLDED";
  Scalar.BLOCK_LITERAL = "BLOCK_LITERAL";
  Scalar.PLAIN = "PLAIN";
  Scalar.QUOTE_DOUBLE = "QUOTE_DOUBLE";
  Scalar.QUOTE_SINGLE = "QUOTE_SINGLE";
  exports.Scalar = Scalar;
  exports.isScalarValue = isScalarValue;
});

// node_modules/yaml/dist/doc/createNode.js
var require_createNode = __commonJS((exports) => {
  var Alias = require_Alias();
  var identity = require_identity();
  var Scalar = require_Scalar();
  var defaultTagPrefix = "tag:yaml.org,2002:";
  function findTagObject(value, tagName, tags) {
    if (tagName) {
      const match = tags.filter((t) => t.tag === tagName);
      const tagObj = match.find((t) => !t.format) ?? match[0];
      if (!tagObj)
        throw new Error(`Tag ${tagName} not found`);
      return tagObj;
    }
    return tags.find((t) => t.identify?.(value) && !t.format);
  }
  function createNode(value, tagName, ctx) {
    if (identity.isDocument(value))
      value = value.contents;
    if (identity.isNode(value))
      return value;
    if (identity.isPair(value)) {
      const map = ctx.schema[identity.MAP].createNode?.(ctx.schema, null, ctx);
      map.items.push(value);
      return map;
    }
    if (value instanceof String || value instanceof Number || value instanceof Boolean || typeof BigInt !== "undefined" && value instanceof BigInt) {
      value = value.valueOf();
    }
    const { aliasDuplicateObjects, onAnchor, onTagObj, schema, sourceObjects } = ctx;
    let ref = undefined;
    if (aliasDuplicateObjects && value && typeof value === "object") {
      ref = sourceObjects.get(value);
      if (ref) {
        ref.anchor ?? (ref.anchor = onAnchor(value));
        return new Alias.Alias(ref.anchor);
      } else {
        ref = { anchor: null, node: null };
        sourceObjects.set(value, ref);
      }
    }
    if (tagName?.startsWith("!!"))
      tagName = defaultTagPrefix + tagName.slice(2);
    let tagObj = findTagObject(value, tagName, schema.tags);
    if (!tagObj) {
      if (value && typeof value.toJSON === "function") {
        value = value.toJSON();
      }
      if (!value || typeof value !== "object") {
        const node2 = new Scalar.Scalar(value);
        if (ref)
          ref.node = node2;
        return node2;
      }
      tagObj = value instanceof Map ? schema[identity.MAP] : (Symbol.iterator in Object(value)) ? schema[identity.SEQ] : schema[identity.MAP];
    }
    if (onTagObj) {
      onTagObj(tagObj);
      delete ctx.onTagObj;
    }
    const node = tagObj?.createNode ? tagObj.createNode(ctx.schema, value, ctx) : typeof tagObj?.nodeClass?.from === "function" ? tagObj.nodeClass.from(ctx.schema, value, ctx) : new Scalar.Scalar(value);
    if (tagName)
      node.tag = tagName;
    else if (!tagObj.default)
      node.tag = tagObj.tag;
    if (ref)
      ref.node = node;
    return node;
  }
  exports.createNode = createNode;
});

// node_modules/yaml/dist/nodes/Collection.js
var require_Collection = __commonJS((exports) => {
  var createNode = require_createNode();
  var identity = require_identity();
  var Node = require_Node();
  function collectionFromPath(schema, path, value) {
    let v = value;
    for (let i = path.length - 1;i >= 0; --i) {
      const k = path[i];
      if (typeof k === "number" && Number.isInteger(k) && k >= 0) {
        const a = [];
        a[k] = v;
        v = a;
      } else {
        v = new Map([[k, v]]);
      }
    }
    return createNode.createNode(v, undefined, {
      aliasDuplicateObjects: false,
      keepUndefined: false,
      onAnchor: () => {
        throw new Error("This should not happen, please report a bug.");
      },
      schema,
      sourceObjects: new Map
    });
  }
  var isEmptyPath = (path) => path == null || typeof path === "object" && !!path[Symbol.iterator]().next().done;

  class Collection extends Node.NodeBase {
    constructor(type, schema) {
      super(type);
      Object.defineProperty(this, "schema", {
        value: schema,
        configurable: true,
        enumerable: false,
        writable: true
      });
    }
    clone(schema) {
      const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
      if (schema)
        copy.schema = schema;
      copy.items = copy.items.map((it) => identity.isNode(it) || identity.isPair(it) ? it.clone(schema) : it);
      if (this.range)
        copy.range = this.range.slice();
      return copy;
    }
    addIn(path, value) {
      if (isEmptyPath(path))
        this.add(value);
      else {
        const [key, ...rest] = path;
        const node = this.get(key, true);
        if (identity.isCollection(node))
          node.addIn(rest, value);
        else if (node === undefined && this.schema)
          this.set(key, collectionFromPath(this.schema, rest, value));
        else
          throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
      }
    }
    deleteIn(path) {
      const [key, ...rest] = path;
      if (rest.length === 0)
        return this.delete(key);
      const node = this.get(key, true);
      if (identity.isCollection(node))
        return node.deleteIn(rest);
      else
        throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
    }
    getIn(path, keepScalar) {
      const [key, ...rest] = path;
      const node = this.get(key, true);
      if (rest.length === 0)
        return !keepScalar && identity.isScalar(node) ? node.value : node;
      else
        return identity.isCollection(node) ? node.getIn(rest, keepScalar) : undefined;
    }
    hasAllNullValues(allowScalar) {
      return this.items.every((node) => {
        if (!identity.isPair(node))
          return false;
        const n = node.value;
        return n == null || allowScalar && identity.isScalar(n) && n.value == null && !n.commentBefore && !n.comment && !n.tag;
      });
    }
    hasIn(path) {
      const [key, ...rest] = path;
      if (rest.length === 0)
        return this.has(key);
      const node = this.get(key, true);
      return identity.isCollection(node) ? node.hasIn(rest) : false;
    }
    setIn(path, value) {
      const [key, ...rest] = path;
      if (rest.length === 0) {
        this.set(key, value);
      } else {
        const node = this.get(key, true);
        if (identity.isCollection(node))
          node.setIn(rest, value);
        else if (node === undefined && this.schema)
          this.set(key, collectionFromPath(this.schema, rest, value));
        else
          throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
      }
    }
  }
  exports.Collection = Collection;
  exports.collectionFromPath = collectionFromPath;
  exports.isEmptyPath = isEmptyPath;
});

// node_modules/yaml/dist/stringify/stringifyComment.js
var require_stringifyComment = __commonJS((exports) => {
  var stringifyComment = (str) => str.replace(/^(?!$)(?: $)?/gm, "#");
  function indentComment(comment, indent) {
    if (/^\n+$/.test(comment))
      return comment.substring(1);
    return indent ? comment.replace(/^(?! *$)/gm, indent) : comment;
  }
  var lineComment = (str, indent, comment) => str.endsWith(`
`) ? indentComment(comment, indent) : comment.includes(`
`) ? `
` + indentComment(comment, indent) : (str.endsWith(" ") ? "" : " ") + comment;
  exports.indentComment = indentComment;
  exports.lineComment = lineComment;
  exports.stringifyComment = stringifyComment;
});

// node_modules/yaml/dist/stringify/foldFlowLines.js
var require_foldFlowLines = __commonJS((exports) => {
  var FOLD_FLOW = "flow";
  var FOLD_BLOCK = "block";
  var FOLD_QUOTED = "quoted";
  function foldFlowLines(text, indent, mode = "flow", { indentAtStart, lineWidth = 80, minContentWidth = 20, onFold, onOverflow } = {}) {
    if (!lineWidth || lineWidth < 0)
      return text;
    if (lineWidth < minContentWidth)
      minContentWidth = 0;
    const endStep = Math.max(1 + minContentWidth, 1 + lineWidth - indent.length);
    if (text.length <= endStep)
      return text;
    const folds = [];
    const escapedFolds = {};
    let end = lineWidth - indent.length;
    if (typeof indentAtStart === "number") {
      if (indentAtStart > lineWidth - Math.max(2, minContentWidth))
        folds.push(0);
      else
        end = lineWidth - indentAtStart;
    }
    let split = undefined;
    let prev = undefined;
    let overflow = false;
    let i = -1;
    let escStart = -1;
    let escEnd = -1;
    if (mode === FOLD_BLOCK) {
      i = consumeMoreIndentedLines(text, i, indent.length);
      if (i !== -1)
        end = i + endStep;
    }
    for (let ch;ch = text[i += 1]; ) {
      if (mode === FOLD_QUOTED && ch === "\\") {
        escStart = i;
        switch (text[i + 1]) {
          case "x":
            i += 3;
            break;
          case "u":
            i += 5;
            break;
          case "U":
            i += 9;
            break;
          default:
            i += 1;
        }
        escEnd = i;
      }
      if (ch === `
`) {
        if (mode === FOLD_BLOCK)
          i = consumeMoreIndentedLines(text, i, indent.length);
        end = i + indent.length + endStep;
        split = undefined;
      } else {
        if (ch === " " && prev && prev !== " " && prev !== `
` && prev !== "\t") {
          const next = text[i + 1];
          if (next && next !== " " && next !== `
` && next !== "\t")
            split = i;
        }
        if (i >= end) {
          if (split) {
            folds.push(split);
            end = split + endStep;
            split = undefined;
          } else if (mode === FOLD_QUOTED) {
            while (prev === " " || prev === "\t") {
              prev = ch;
              ch = text[i += 1];
              overflow = true;
            }
            const j = i > escEnd + 1 ? i - 2 : escStart - 1;
            if (escapedFolds[j])
              return text;
            folds.push(j);
            escapedFolds[j] = true;
            end = j + endStep;
            split = undefined;
          } else {
            overflow = true;
          }
        }
      }
      prev = ch;
    }
    if (overflow && onOverflow)
      onOverflow();
    if (folds.length === 0)
      return text;
    if (onFold)
      onFold();
    let res = text.slice(0, folds[0]);
    for (let i2 = 0;i2 < folds.length; ++i2) {
      const fold = folds[i2];
      const end2 = folds[i2 + 1] || text.length;
      if (fold === 0)
        res = `
${indent}${text.slice(0, end2)}`;
      else {
        if (mode === FOLD_QUOTED && escapedFolds[fold])
          res += `${text[fold]}\\`;
        res += `
${indent}${text.slice(fold + 1, end2)}`;
      }
    }
    return res;
  }
  function consumeMoreIndentedLines(text, i, indent) {
    let end = i;
    let start = i + 1;
    let ch = text[start];
    while (ch === " " || ch === "\t") {
      if (i < start + indent) {
        ch = text[++i];
      } else {
        do {
          ch = text[++i];
        } while (ch && ch !== `
`);
        end = i;
        start = i + 1;
        ch = text[start];
      }
    }
    return end;
  }
  exports.FOLD_BLOCK = FOLD_BLOCK;
  exports.FOLD_FLOW = FOLD_FLOW;
  exports.FOLD_QUOTED = FOLD_QUOTED;
  exports.foldFlowLines = foldFlowLines;
});

// node_modules/yaml/dist/stringify/stringifyString.js
var require_stringifyString = __commonJS((exports) => {
  var Scalar = require_Scalar();
  var foldFlowLines = require_foldFlowLines();
  var getFoldOptions = (ctx, isBlock) => ({
    indentAtStart: isBlock ? ctx.indent.length : ctx.indentAtStart,
    lineWidth: ctx.options.lineWidth,
    minContentWidth: ctx.options.minContentWidth
  });
  var containsDocumentMarker = (str) => /^(%|---|\.\.\.)/m.test(str);
  function lineLengthOverLimit(str, lineWidth, indentLength) {
    if (!lineWidth || lineWidth < 0)
      return false;
    const limit = lineWidth - indentLength;
    const strLen = str.length;
    if (strLen <= limit)
      return false;
    for (let i = 0, start = 0;i < strLen; ++i) {
      if (str[i] === `
`) {
        if (i - start > limit)
          return true;
        start = i + 1;
        if (strLen - start <= limit)
          return false;
      }
    }
    return true;
  }
  function doubleQuotedString(value, ctx) {
    const json = JSON.stringify(value);
    if (ctx.options.doubleQuotedAsJSON)
      return json;
    const { implicitKey } = ctx;
    const minMultiLineLength = ctx.options.doubleQuotedMinMultiLineLength;
    const indent = ctx.indent || (containsDocumentMarker(value) ? "  " : "");
    let str = "";
    let start = 0;
    for (let i = 0, ch = json[i];ch; ch = json[++i]) {
      if (ch === " " && json[i + 1] === "\\" && json[i + 2] === "n") {
        str += json.slice(start, i) + "\\ ";
        i += 1;
        start = i;
        ch = "\\";
      }
      if (ch === "\\")
        switch (json[i + 1]) {
          case "u":
            {
              str += json.slice(start, i);
              const code = json.substr(i + 2, 4);
              switch (code) {
                case "0000":
                  str += "\\0";
                  break;
                case "0007":
                  str += "\\a";
                  break;
                case "000b":
                  str += "\\v";
                  break;
                case "001b":
                  str += "\\e";
                  break;
                case "0085":
                  str += "\\N";
                  break;
                case "00a0":
                  str += "\\_";
                  break;
                case "2028":
                  str += "\\L";
                  break;
                case "2029":
                  str += "\\P";
                  break;
                default:
                  if (code.substr(0, 2) === "00")
                    str += "\\x" + code.substr(2);
                  else
                    str += json.substr(i, 6);
              }
              i += 5;
              start = i + 1;
            }
            break;
          case "n":
            if (implicitKey || json[i + 2] === '"' || json.length < minMultiLineLength) {
              i += 1;
            } else {
              str += json.slice(start, i) + `

`;
              while (json[i + 2] === "\\" && json[i + 3] === "n" && json[i + 4] !== '"') {
                str += `
`;
                i += 2;
              }
              str += indent;
              if (json[i + 2] === " ")
                str += "\\";
              i += 1;
              start = i + 1;
            }
            break;
          default:
            i += 1;
        }
    }
    str = start ? str + json.slice(start) : json;
    return implicitKey ? str : foldFlowLines.foldFlowLines(str, indent, foldFlowLines.FOLD_QUOTED, getFoldOptions(ctx, false));
  }
  function singleQuotedString(value, ctx) {
    if (ctx.options.singleQuote === false || ctx.implicitKey && value.includes(`
`) || /[ \t]\n|\n[ \t]/.test(value))
      return doubleQuotedString(value, ctx);
    const indent = ctx.indent || (containsDocumentMarker(value) ? "  " : "");
    const res = "'" + value.replace(/'/g, "''").replace(/\n+/g, `$&
${indent}`) + "'";
    return ctx.implicitKey ? res : foldFlowLines.foldFlowLines(res, indent, foldFlowLines.FOLD_FLOW, getFoldOptions(ctx, false));
  }
  function quotedString(value, ctx) {
    const { singleQuote } = ctx.options;
    let qs;
    if (singleQuote === false)
      qs = doubleQuotedString;
    else {
      const hasDouble = value.includes('"');
      const hasSingle = value.includes("'");
      if (hasDouble && !hasSingle)
        qs = singleQuotedString;
      else if (hasSingle && !hasDouble)
        qs = doubleQuotedString;
      else
        qs = singleQuote ? singleQuotedString : doubleQuotedString;
    }
    return qs(value, ctx);
  }
  var blockEndNewlines;
  try {
    blockEndNewlines = new RegExp(`(^|(?<!
))
+(?!
|$)`, "g");
  } catch {
    blockEndNewlines = /\n+(?!\n|$)/g;
  }
  function blockString({ comment, type, value }, ctx, onComment, onChompKeep) {
    const { blockQuote, commentString, lineWidth } = ctx.options;
    if (!blockQuote || /\n[\t ]+$/.test(value)) {
      return quotedString(value, ctx);
    }
    const indent = ctx.indent || (ctx.forceBlockIndent || containsDocumentMarker(value) ? "  " : "");
    const literal = blockQuote === "literal" ? true : blockQuote === "folded" || type === Scalar.Scalar.BLOCK_FOLDED ? false : type === Scalar.Scalar.BLOCK_LITERAL ? true : !lineLengthOverLimit(value, lineWidth, indent.length);
    if (!value)
      return literal ? `|
` : `>
`;
    let chomp;
    let endStart;
    for (endStart = value.length;endStart > 0; --endStart) {
      const ch = value[endStart - 1];
      if (ch !== `
` && ch !== "\t" && ch !== " ")
        break;
    }
    let end = value.substring(endStart);
    const endNlPos = end.indexOf(`
`);
    if (endNlPos === -1) {
      chomp = "-";
    } else if (value === end || endNlPos !== end.length - 1) {
      chomp = "+";
      if (onChompKeep)
        onChompKeep();
    } else {
      chomp = "";
    }
    if (end) {
      value = value.slice(0, -end.length);
      if (end[end.length - 1] === `
`)
        end = end.slice(0, -1);
      end = end.replace(blockEndNewlines, `$&${indent}`);
    }
    let startWithSpace = false;
    let startEnd;
    let startNlPos = -1;
    for (startEnd = 0;startEnd < value.length; ++startEnd) {
      const ch = value[startEnd];
      if (ch === " ")
        startWithSpace = true;
      else if (ch === `
`)
        startNlPos = startEnd;
      else
        break;
    }
    let start = value.substring(0, startNlPos < startEnd ? startNlPos + 1 : startEnd);
    if (start) {
      value = value.substring(start.length);
      start = start.replace(/\n+/g, `$&${indent}`);
    }
    const indentSize = indent ? "2" : "1";
    let header = (startWithSpace ? indentSize : "") + chomp;
    if (comment) {
      header += " " + commentString(comment.replace(/ ?[\r\n]+/g, " "));
      if (onComment)
        onComment();
    }
    if (!literal) {
      const foldedValue = value.replace(/\n+/g, `
$&`).replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g, "$1$2").replace(/\n+/g, `$&${indent}`);
      let literalFallback = false;
      const foldOptions = getFoldOptions(ctx, true);
      if (blockQuote !== "folded" && type !== Scalar.Scalar.BLOCK_FOLDED) {
        foldOptions.onOverflow = () => {
          literalFallback = true;
        };
      }
      const body = foldFlowLines.foldFlowLines(`${start}${foldedValue}${end}`, indent, foldFlowLines.FOLD_BLOCK, foldOptions);
      if (!literalFallback)
        return `>${header}
${indent}${body}`;
    }
    value = value.replace(/\n+/g, `$&${indent}`);
    return `|${header}
${indent}${start}${value}${end}`;
  }
  function plainString(item, ctx, onComment, onChompKeep) {
    const { type, value } = item;
    const { actualString, implicitKey, indent, indentStep, inFlow } = ctx;
    if (implicitKey && value.includes(`
`) || inFlow && /[[\]{},]/.test(value)) {
      return quotedString(value, ctx);
    }
    if (/^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(value)) {
      return implicitKey || inFlow || !value.includes(`
`) ? quotedString(value, ctx) : blockString(item, ctx, onComment, onChompKeep);
    }
    if (!implicitKey && !inFlow && type !== Scalar.Scalar.PLAIN && value.includes(`
`)) {
      return blockString(item, ctx, onComment, onChompKeep);
    }
    if (containsDocumentMarker(value)) {
      if (indent === "") {
        ctx.forceBlockIndent = true;
        return blockString(item, ctx, onComment, onChompKeep);
      } else if (implicitKey && indent === indentStep) {
        return quotedString(value, ctx);
      }
    }
    const str = value.replace(/\n+/g, `$&
${indent}`);
    if (actualString) {
      const test = (tag) => tag.default && tag.tag !== "tag:yaml.org,2002:str" && tag.test?.test(str);
      const { compat, tags } = ctx.doc.schema;
      if (tags.some(test) || compat?.some(test))
        return quotedString(value, ctx);
    }
    return implicitKey ? str : foldFlowLines.foldFlowLines(str, indent, foldFlowLines.FOLD_FLOW, getFoldOptions(ctx, false));
  }
  function stringifyString(item, ctx, onComment, onChompKeep) {
    const { implicitKey, inFlow } = ctx;
    const ss = typeof item.value === "string" ? item : Object.assign({}, item, { value: String(item.value) });
    let { type } = item;
    if (type !== Scalar.Scalar.QUOTE_DOUBLE) {
      if (/[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(ss.value))
        type = Scalar.Scalar.QUOTE_DOUBLE;
    }
    const _stringify = (_type) => {
      switch (_type) {
        case Scalar.Scalar.BLOCK_FOLDED:
        case Scalar.Scalar.BLOCK_LITERAL:
          return implicitKey || inFlow ? quotedString(ss.value, ctx) : blockString(ss, ctx, onComment, onChompKeep);
        case Scalar.Scalar.QUOTE_DOUBLE:
          return doubleQuotedString(ss.value, ctx);
        case Scalar.Scalar.QUOTE_SINGLE:
          return singleQuotedString(ss.value, ctx);
        case Scalar.Scalar.PLAIN:
          return plainString(ss, ctx, onComment, onChompKeep);
        default:
          return null;
      }
    };
    let res = _stringify(type);
    if (res === null) {
      const { defaultKeyType, defaultStringType } = ctx.options;
      const t = implicitKey && defaultKeyType || defaultStringType;
      res = _stringify(t);
      if (res === null)
        throw new Error(`Unsupported default string type ${t}`);
    }
    return res;
  }
  exports.stringifyString = stringifyString;
});

// node_modules/yaml/dist/stringify/stringify.js
var require_stringify = __commonJS((exports) => {
  var anchors = require_anchors();
  var identity = require_identity();
  var stringifyComment = require_stringifyComment();
  var stringifyString = require_stringifyString();
  function createStringifyContext(doc, options) {
    const opt = Object.assign({
      blockQuote: true,
      commentString: stringifyComment.stringifyComment,
      defaultKeyType: null,
      defaultStringType: "PLAIN",
      directives: null,
      doubleQuotedAsJSON: false,
      doubleQuotedMinMultiLineLength: 40,
      falseStr: "false",
      flowCollectionPadding: true,
      indentSeq: true,
      lineWidth: 80,
      minContentWidth: 20,
      nullStr: "null",
      simpleKeys: false,
      singleQuote: null,
      trailingComma: false,
      trueStr: "true",
      verifyAliasOrder: true
    }, doc.schema.toStringOptions, options);
    let inFlow;
    switch (opt.collectionStyle) {
      case "block":
        inFlow = false;
        break;
      case "flow":
        inFlow = true;
        break;
      default:
        inFlow = null;
    }
    return {
      anchors: new Set,
      doc,
      flowCollectionPadding: opt.flowCollectionPadding ? " " : "",
      indent: "",
      indentStep: typeof opt.indent === "number" ? " ".repeat(opt.indent) : "  ",
      inFlow,
      options: opt
    };
  }
  function getTagObject(tags, item) {
    if (item.tag) {
      const match = tags.filter((t) => t.tag === item.tag);
      if (match.length > 0)
        return match.find((t) => t.format === item.format) ?? match[0];
    }
    let tagObj = undefined;
    let obj;
    if (identity.isScalar(item)) {
      obj = item.value;
      let match = tags.filter((t) => t.identify?.(obj));
      if (match.length > 1) {
        const testMatch = match.filter((t) => t.test);
        if (testMatch.length > 0)
          match = testMatch;
      }
      tagObj = match.find((t) => t.format === item.format) ?? match.find((t) => !t.format);
    } else {
      obj = item;
      tagObj = tags.find((t) => t.nodeClass && obj instanceof t.nodeClass);
    }
    if (!tagObj) {
      const name = obj?.constructor?.name ?? (obj === null ? "null" : typeof obj);
      throw new Error(`Tag not resolved for ${name} value`);
    }
    return tagObj;
  }
  function stringifyProps(node, tagObj, { anchors: anchors$1, doc }) {
    if (!doc.directives)
      return "";
    const props = [];
    const anchor = (identity.isScalar(node) || identity.isCollection(node)) && node.anchor;
    if (anchor && anchors.anchorIsValid(anchor)) {
      anchors$1.add(anchor);
      props.push(`&${anchor}`);
    }
    const tag = node.tag ?? (tagObj.default ? null : tagObj.tag);
    if (tag)
      props.push(doc.directives.tagString(tag));
    return props.join(" ");
  }
  function stringify(item, ctx, onComment, onChompKeep) {
    if (identity.isPair(item))
      return item.toString(ctx, onComment, onChompKeep);
    if (identity.isAlias(item)) {
      if (ctx.doc.directives)
        return item.toString(ctx);
      if (ctx.resolvedAliases?.has(item)) {
        throw new TypeError(`Cannot stringify circular structure without alias nodes`);
      } else {
        if (ctx.resolvedAliases)
          ctx.resolvedAliases.add(item);
        else
          ctx.resolvedAliases = new Set([item]);
        item = item.resolve(ctx.doc);
      }
    }
    let tagObj = undefined;
    const node = identity.isNode(item) ? item : ctx.doc.createNode(item, { onTagObj: (o) => tagObj = o });
    tagObj ?? (tagObj = getTagObject(ctx.doc.schema.tags, node));
    const props = stringifyProps(node, tagObj, ctx);
    if (props.length > 0)
      ctx.indentAtStart = (ctx.indentAtStart ?? 0) + props.length + 1;
    const str = typeof tagObj.stringify === "function" ? tagObj.stringify(node, ctx, onComment, onChompKeep) : identity.isScalar(node) ? stringifyString.stringifyString(node, ctx, onComment, onChompKeep) : node.toString(ctx, onComment, onChompKeep);
    if (!props)
      return str;
    return identity.isScalar(node) || str[0] === "{" || str[0] === "[" ? `${props} ${str}` : `${props}
${ctx.indent}${str}`;
  }
  exports.createStringifyContext = createStringifyContext;
  exports.stringify = stringify;
});

// node_modules/yaml/dist/stringify/stringifyPair.js
var require_stringifyPair = __commonJS((exports) => {
  var identity = require_identity();
  var Scalar = require_Scalar();
  var stringify = require_stringify();
  var stringifyComment = require_stringifyComment();
  function stringifyPair({ key, value }, ctx, onComment, onChompKeep) {
    const { allNullValues, doc, indent, indentStep, options: { commentString, indentSeq, simpleKeys } } = ctx;
    let keyComment = identity.isNode(key) && key.comment || null;
    if (simpleKeys) {
      if (keyComment) {
        throw new Error("With simple keys, key nodes cannot have comments");
      }
      if (identity.isCollection(key) || !identity.isNode(key) && typeof key === "object") {
        const msg = "With simple keys, collection cannot be used as a key value";
        throw new Error(msg);
      }
    }
    let explicitKey = !simpleKeys && (!key || keyComment && value == null && !ctx.inFlow || identity.isCollection(key) || (identity.isScalar(key) ? key.type === Scalar.Scalar.BLOCK_FOLDED || key.type === Scalar.Scalar.BLOCK_LITERAL : typeof key === "object"));
    ctx = Object.assign({}, ctx, {
      allNullValues: false,
      implicitKey: !explicitKey && (simpleKeys || !allNullValues),
      indent: indent + indentStep
    });
    let keyCommentDone = false;
    let chompKeep = false;
    let str = stringify.stringify(key, ctx, () => keyCommentDone = true, () => chompKeep = true);
    if (!explicitKey && !ctx.inFlow && str.length > 1024) {
      if (simpleKeys)
        throw new Error("With simple keys, single line scalar must not span more than 1024 characters");
      explicitKey = true;
    }
    if (ctx.inFlow) {
      if (allNullValues || value == null) {
        if (keyCommentDone && onComment)
          onComment();
        return str === "" ? "?" : explicitKey ? `? ${str}` : str;
      }
    } else if (allNullValues && !simpleKeys || value == null && explicitKey) {
      str = `? ${str}`;
      if (keyComment && !keyCommentDone) {
        str += stringifyComment.lineComment(str, ctx.indent, commentString(keyComment));
      } else if (chompKeep && onChompKeep)
        onChompKeep();
      return str;
    }
    if (keyCommentDone)
      keyComment = null;
    if (explicitKey) {
      if (keyComment)
        str += stringifyComment.lineComment(str, ctx.indent, commentString(keyComment));
      str = `? ${str}
${indent}:`;
    } else {
      str = `${str}:`;
      if (keyComment)
        str += stringifyComment.lineComment(str, ctx.indent, commentString(keyComment));
    }
    let vsb, vcb, valueComment;
    if (identity.isNode(value)) {
      vsb = !!value.spaceBefore;
      vcb = value.commentBefore;
      valueComment = value.comment;
    } else {
      vsb = false;
      vcb = null;
      valueComment = null;
      if (value && typeof value === "object")
        value = doc.createNode(value);
    }
    ctx.implicitKey = false;
    if (!explicitKey && !keyComment && identity.isScalar(value))
      ctx.indentAtStart = str.length + 1;
    chompKeep = false;
    if (!indentSeq && indentStep.length >= 2 && !ctx.inFlow && !explicitKey && identity.isSeq(value) && !value.flow && !value.tag && !value.anchor) {
      ctx.indent = ctx.indent.substring(2);
    }
    let valueCommentDone = false;
    const valueStr = stringify.stringify(value, ctx, () => valueCommentDone = true, () => chompKeep = true);
    let ws = " ";
    if (keyComment || vsb || vcb) {
      ws = vsb ? `
` : "";
      if (vcb) {
        const cs = commentString(vcb);
        ws += `
${stringifyComment.indentComment(cs, ctx.indent)}`;
      }
      if (valueStr === "" && !ctx.inFlow) {
        if (ws === `
` && valueComment)
          ws = `

`;
      } else {
        ws += `
${ctx.indent}`;
      }
    } else if (!explicitKey && identity.isCollection(value)) {
      const vs0 = valueStr[0];
      const nl0 = valueStr.indexOf(`
`);
      const hasNewline = nl0 !== -1;
      const flow = ctx.inFlow ?? value.flow ?? value.items.length === 0;
      if (hasNewline || !flow) {
        let hasPropsLine = false;
        if (hasNewline && (vs0 === "&" || vs0 === "!")) {
          let sp0 = valueStr.indexOf(" ");
          if (vs0 === "&" && sp0 !== -1 && sp0 < nl0 && valueStr[sp0 + 1] === "!") {
            sp0 = valueStr.indexOf(" ", sp0 + 1);
          }
          if (sp0 === -1 || nl0 < sp0)
            hasPropsLine = true;
        }
        if (!hasPropsLine)
          ws = `
${ctx.indent}`;
      }
    } else if (valueStr === "" || valueStr[0] === `
`) {
      ws = "";
    }
    str += ws + valueStr;
    if (ctx.inFlow) {
      if (valueCommentDone && onComment)
        onComment();
    } else if (valueComment && !valueCommentDone) {
      str += stringifyComment.lineComment(str, ctx.indent, commentString(valueComment));
    } else if (chompKeep && onChompKeep) {
      onChompKeep();
    }
    return str;
  }
  exports.stringifyPair = stringifyPair;
});

// node_modules/yaml/dist/log.js
var require_log = __commonJS((exports) => {
  var node_process = __require("process");
  function debug(logLevel, ...messages) {
    if (logLevel === "debug")
      console.log(...messages);
  }
  function warn(logLevel, warning) {
    if (logLevel === "debug" || logLevel === "warn") {
      if (typeof node_process.emitWarning === "function")
        node_process.emitWarning(warning);
      else
        console.warn(warning);
    }
  }
  exports.debug = debug;
  exports.warn = warn;
});

// node_modules/yaml/dist/schema/yaml-1.1/merge.js
var require_merge = __commonJS((exports) => {
  var identity = require_identity();
  var Scalar = require_Scalar();
  var MERGE_KEY = "<<";
  var merge = {
    identify: (value) => value === MERGE_KEY || typeof value === "symbol" && value.description === MERGE_KEY,
    default: "key",
    tag: "tag:yaml.org,2002:merge",
    test: /^<<$/,
    resolve: () => Object.assign(new Scalar.Scalar(Symbol(MERGE_KEY)), {
      addToJSMap: addMergeToJSMap
    }),
    stringify: () => MERGE_KEY
  };
  var isMergeKey = (ctx, key) => (merge.identify(key) || identity.isScalar(key) && (!key.type || key.type === Scalar.Scalar.PLAIN) && merge.identify(key.value)) && ctx?.doc.schema.tags.some((tag) => tag.tag === merge.tag && tag.default);
  function addMergeToJSMap(ctx, map, value) {
    value = ctx && identity.isAlias(value) ? value.resolve(ctx.doc) : value;
    if (identity.isSeq(value))
      for (const it of value.items)
        mergeValue(ctx, map, it);
    else if (Array.isArray(value))
      for (const it of value)
        mergeValue(ctx, map, it);
    else
      mergeValue(ctx, map, value);
  }
  function mergeValue(ctx, map, value) {
    const source = ctx && identity.isAlias(value) ? value.resolve(ctx.doc) : value;
    if (!identity.isMap(source))
      throw new Error("Merge sources must be maps or map aliases");
    const srcMap = source.toJSON(null, ctx, Map);
    for (const [key, value2] of srcMap) {
      if (map instanceof Map) {
        if (!map.has(key))
          map.set(key, value2);
      } else if (map instanceof Set) {
        map.add(key);
      } else if (!Object.prototype.hasOwnProperty.call(map, key)) {
        Object.defineProperty(map, key, {
          value: value2,
          writable: true,
          enumerable: true,
          configurable: true
        });
      }
    }
    return map;
  }
  exports.addMergeToJSMap = addMergeToJSMap;
  exports.isMergeKey = isMergeKey;
  exports.merge = merge;
});

// node_modules/yaml/dist/nodes/addPairToJSMap.js
var require_addPairToJSMap = __commonJS((exports) => {
  var log = require_log();
  var merge = require_merge();
  var stringify = require_stringify();
  var identity = require_identity();
  var toJS = require_toJS();
  function addPairToJSMap(ctx, map, { key, value }) {
    if (identity.isNode(key) && key.addToJSMap)
      key.addToJSMap(ctx, map, value);
    else if (merge.isMergeKey(ctx, key))
      merge.addMergeToJSMap(ctx, map, value);
    else {
      const jsKey = toJS.toJS(key, "", ctx);
      if (map instanceof Map) {
        map.set(jsKey, toJS.toJS(value, jsKey, ctx));
      } else if (map instanceof Set) {
        map.add(jsKey);
      } else {
        const stringKey = stringifyKey(key, jsKey, ctx);
        const jsValue = toJS.toJS(value, stringKey, ctx);
        if (stringKey in map)
          Object.defineProperty(map, stringKey, {
            value: jsValue,
            writable: true,
            enumerable: true,
            configurable: true
          });
        else
          map[stringKey] = jsValue;
      }
    }
    return map;
  }
  function stringifyKey(key, jsKey, ctx) {
    if (jsKey === null)
      return "";
    if (typeof jsKey !== "object")
      return String(jsKey);
    if (identity.isNode(key) && ctx?.doc) {
      const strCtx = stringify.createStringifyContext(ctx.doc, {});
      strCtx.anchors = new Set;
      for (const node of ctx.anchors.keys())
        strCtx.anchors.add(node.anchor);
      strCtx.inFlow = true;
      strCtx.inStringifyKey = true;
      const strKey = key.toString(strCtx);
      if (!ctx.mapKeyWarned) {
        let jsonStr = JSON.stringify(strKey);
        if (jsonStr.length > 40)
          jsonStr = jsonStr.substring(0, 36) + '..."';
        log.warn(ctx.doc.options.logLevel, `Keys with collection values will be stringified due to JS Object restrictions: ${jsonStr}. Set mapAsMap: true to use object keys.`);
        ctx.mapKeyWarned = true;
      }
      return strKey;
    }
    return JSON.stringify(jsKey);
  }
  exports.addPairToJSMap = addPairToJSMap;
});

// node_modules/yaml/dist/nodes/Pair.js
var require_Pair = __commonJS((exports) => {
  var createNode = require_createNode();
  var stringifyPair = require_stringifyPair();
  var addPairToJSMap = require_addPairToJSMap();
  var identity = require_identity();
  function createPair(key, value, ctx) {
    const k = createNode.createNode(key, undefined, ctx);
    const v = createNode.createNode(value, undefined, ctx);
    return new Pair(k, v);
  }

  class Pair {
    constructor(key, value = null) {
      Object.defineProperty(this, identity.NODE_TYPE, { value: identity.PAIR });
      this.key = key;
      this.value = value;
    }
    clone(schema) {
      let { key, value } = this;
      if (identity.isNode(key))
        key = key.clone(schema);
      if (identity.isNode(value))
        value = value.clone(schema);
      return new Pair(key, value);
    }
    toJSON(_, ctx) {
      const pair = ctx?.mapAsMap ? new Map : {};
      return addPairToJSMap.addPairToJSMap(ctx, pair, this);
    }
    toString(ctx, onComment, onChompKeep) {
      return ctx?.doc ? stringifyPair.stringifyPair(this, ctx, onComment, onChompKeep) : JSON.stringify(this);
    }
  }
  exports.Pair = Pair;
  exports.createPair = createPair;
});

// node_modules/yaml/dist/stringify/stringifyCollection.js
var require_stringifyCollection = __commonJS((exports) => {
  var identity = require_identity();
  var stringify = require_stringify();
  var stringifyComment = require_stringifyComment();
  function stringifyCollection(collection, ctx, options) {
    const flow = ctx.inFlow ?? collection.flow;
    const stringify2 = flow ? stringifyFlowCollection : stringifyBlockCollection;
    return stringify2(collection, ctx, options);
  }
  function stringifyBlockCollection({ comment, items }, ctx, { blockItemPrefix, flowChars, itemIndent, onChompKeep, onComment }) {
    const { indent, options: { commentString } } = ctx;
    const itemCtx = Object.assign({}, ctx, { indent: itemIndent, type: null });
    let chompKeep = false;
    const lines = [];
    for (let i = 0;i < items.length; ++i) {
      const item = items[i];
      let comment2 = null;
      if (identity.isNode(item)) {
        if (!chompKeep && item.spaceBefore)
          lines.push("");
        addCommentBefore(ctx, lines, item.commentBefore, chompKeep);
        if (item.comment)
          comment2 = item.comment;
      } else if (identity.isPair(item)) {
        const ik = identity.isNode(item.key) ? item.key : null;
        if (ik) {
          if (!chompKeep && ik.spaceBefore)
            lines.push("");
          addCommentBefore(ctx, lines, ik.commentBefore, chompKeep);
        }
      }
      chompKeep = false;
      let str2 = stringify.stringify(item, itemCtx, () => comment2 = null, () => chompKeep = true);
      if (comment2)
        str2 += stringifyComment.lineComment(str2, itemIndent, commentString(comment2));
      if (chompKeep && comment2)
        chompKeep = false;
      lines.push(blockItemPrefix + str2);
    }
    let str;
    if (lines.length === 0) {
      str = flowChars.start + flowChars.end;
    } else {
      str = lines[0];
      for (let i = 1;i < lines.length; ++i) {
        const line = lines[i];
        str += line ? `
${indent}${line}` : `
`;
      }
    }
    if (comment) {
      str += `
` + stringifyComment.indentComment(commentString(comment), indent);
      if (onComment)
        onComment();
    } else if (chompKeep && onChompKeep)
      onChompKeep();
    return str;
  }
  function stringifyFlowCollection({ items }, ctx, { flowChars, itemIndent }) {
    const { indent, indentStep, flowCollectionPadding: fcPadding, options: { commentString } } = ctx;
    itemIndent += indentStep;
    const itemCtx = Object.assign({}, ctx, {
      indent: itemIndent,
      inFlow: true,
      type: null
    });
    let reqNewline = false;
    let linesAtValue = 0;
    const lines = [];
    for (let i = 0;i < items.length; ++i) {
      const item = items[i];
      let comment = null;
      if (identity.isNode(item)) {
        if (item.spaceBefore)
          lines.push("");
        addCommentBefore(ctx, lines, item.commentBefore, false);
        if (item.comment)
          comment = item.comment;
      } else if (identity.isPair(item)) {
        const ik = identity.isNode(item.key) ? item.key : null;
        if (ik) {
          if (ik.spaceBefore)
            lines.push("");
          addCommentBefore(ctx, lines, ik.commentBefore, false);
          if (ik.comment)
            reqNewline = true;
        }
        const iv = identity.isNode(item.value) ? item.value : null;
        if (iv) {
          if (iv.comment)
            comment = iv.comment;
          if (iv.commentBefore)
            reqNewline = true;
        } else if (item.value == null && ik?.comment) {
          comment = ik.comment;
        }
      }
      if (comment)
        reqNewline = true;
      let str = stringify.stringify(item, itemCtx, () => comment = null);
      reqNewline || (reqNewline = lines.length > linesAtValue || str.includes(`
`));
      if (i < items.length - 1) {
        str += ",";
      } else if (ctx.options.trailingComma) {
        if (ctx.options.lineWidth > 0) {
          reqNewline || (reqNewline = lines.reduce((sum, line) => sum + line.length + 2, 2) + (str.length + 2) > ctx.options.lineWidth);
        }
        if (reqNewline) {
          str += ",";
        }
      }
      if (comment)
        str += stringifyComment.lineComment(str, itemIndent, commentString(comment));
      lines.push(str);
      linesAtValue = lines.length;
    }
    const { start, end } = flowChars;
    if (lines.length === 0) {
      return start + end;
    } else {
      if (!reqNewline) {
        const len = lines.reduce((sum, line) => sum + line.length + 2, 2);
        reqNewline = ctx.options.lineWidth > 0 && len > ctx.options.lineWidth;
      }
      if (reqNewline) {
        let str = start;
        for (const line of lines)
          str += line ? `
${indentStep}${indent}${line}` : `
`;
        return `${str}
${indent}${end}`;
      } else {
        return `${start}${fcPadding}${lines.join(" ")}${fcPadding}${end}`;
      }
    }
  }
  function addCommentBefore({ indent, options: { commentString } }, lines, comment, chompKeep) {
    if (comment && chompKeep)
      comment = comment.replace(/^\n+/, "");
    if (comment) {
      const ic = stringifyComment.indentComment(commentString(comment), indent);
      lines.push(ic.trimStart());
    }
  }
  exports.stringifyCollection = stringifyCollection;
});

// node_modules/yaml/dist/nodes/YAMLMap.js
var require_YAMLMap = __commonJS((exports) => {
  var stringifyCollection = require_stringifyCollection();
  var addPairToJSMap = require_addPairToJSMap();
  var Collection = require_Collection();
  var identity = require_identity();
  var Pair = require_Pair();
  var Scalar = require_Scalar();
  function findPair(items, key) {
    const k = identity.isScalar(key) ? key.value : key;
    for (const it of items) {
      if (identity.isPair(it)) {
        if (it.key === key || it.key === k)
          return it;
        if (identity.isScalar(it.key) && it.key.value === k)
          return it;
      }
    }
    return;
  }

  class YAMLMap extends Collection.Collection {
    static get tagName() {
      return "tag:yaml.org,2002:map";
    }
    constructor(schema) {
      super(identity.MAP, schema);
      this.items = [];
    }
    static from(schema, obj, ctx) {
      const { keepUndefined, replacer } = ctx;
      const map = new this(schema);
      const add = (key, value) => {
        if (typeof replacer === "function")
          value = replacer.call(obj, key, value);
        else if (Array.isArray(replacer) && !replacer.includes(key))
          return;
        if (value !== undefined || keepUndefined)
          map.items.push(Pair.createPair(key, value, ctx));
      };
      if (obj instanceof Map) {
        for (const [key, value] of obj)
          add(key, value);
      } else if (obj && typeof obj === "object") {
        for (const key of Object.keys(obj))
          add(key, obj[key]);
      }
      if (typeof schema.sortMapEntries === "function") {
        map.items.sort(schema.sortMapEntries);
      }
      return map;
    }
    add(pair, overwrite) {
      let _pair;
      if (identity.isPair(pair))
        _pair = pair;
      else if (!pair || typeof pair !== "object" || !("key" in pair)) {
        _pair = new Pair.Pair(pair, pair?.value);
      } else
        _pair = new Pair.Pair(pair.key, pair.value);
      const prev = findPair(this.items, _pair.key);
      const sortEntries = this.schema?.sortMapEntries;
      if (prev) {
        if (!overwrite)
          throw new Error(`Key ${_pair.key} already set`);
        if (identity.isScalar(prev.value) && Scalar.isScalarValue(_pair.value))
          prev.value.value = _pair.value;
        else
          prev.value = _pair.value;
      } else if (sortEntries) {
        const i = this.items.findIndex((item) => sortEntries(_pair, item) < 0);
        if (i === -1)
          this.items.push(_pair);
        else
          this.items.splice(i, 0, _pair);
      } else {
        this.items.push(_pair);
      }
    }
    delete(key) {
      const it = findPair(this.items, key);
      if (!it)
        return false;
      const del = this.items.splice(this.items.indexOf(it), 1);
      return del.length > 0;
    }
    get(key, keepScalar) {
      const it = findPair(this.items, key);
      const node = it?.value;
      return (!keepScalar && identity.isScalar(node) ? node.value : node) ?? undefined;
    }
    has(key) {
      return !!findPair(this.items, key);
    }
    set(key, value) {
      this.add(new Pair.Pair(key, value), true);
    }
    toJSON(_, ctx, Type) {
      const map = Type ? new Type : ctx?.mapAsMap ? new Map : {};
      if (ctx?.onCreate)
        ctx.onCreate(map);
      for (const item of this.items)
        addPairToJSMap.addPairToJSMap(ctx, map, item);
      return map;
    }
    toString(ctx, onComment, onChompKeep) {
      if (!ctx)
        return JSON.stringify(this);
      for (const item of this.items) {
        if (!identity.isPair(item))
          throw new Error(`Map items must all be pairs; found ${JSON.stringify(item)} instead`);
      }
      if (!ctx.allNullValues && this.hasAllNullValues(false))
        ctx = Object.assign({}, ctx, { allNullValues: true });
      return stringifyCollection.stringifyCollection(this, ctx, {
        blockItemPrefix: "",
        flowChars: { start: "{", end: "}" },
        itemIndent: ctx.indent || "",
        onChompKeep,
        onComment
      });
    }
  }
  exports.YAMLMap = YAMLMap;
  exports.findPair = findPair;
});

// node_modules/yaml/dist/schema/common/map.js
var require_map = __commonJS((exports) => {
  var identity = require_identity();
  var YAMLMap = require_YAMLMap();
  var map = {
    collection: "map",
    default: true,
    nodeClass: YAMLMap.YAMLMap,
    tag: "tag:yaml.org,2002:map",
    resolve(map2, onError) {
      if (!identity.isMap(map2))
        onError("Expected a mapping for this tag");
      return map2;
    },
    createNode: (schema, obj, ctx) => YAMLMap.YAMLMap.from(schema, obj, ctx)
  };
  exports.map = map;
});

// node_modules/yaml/dist/nodes/YAMLSeq.js
var require_YAMLSeq = __commonJS((exports) => {
  var createNode = require_createNode();
  var stringifyCollection = require_stringifyCollection();
  var Collection = require_Collection();
  var identity = require_identity();
  var Scalar = require_Scalar();
  var toJS = require_toJS();

  class YAMLSeq extends Collection.Collection {
    static get tagName() {
      return "tag:yaml.org,2002:seq";
    }
    constructor(schema) {
      super(identity.SEQ, schema);
      this.items = [];
    }
    add(value) {
      this.items.push(value);
    }
    delete(key) {
      const idx = asItemIndex(key);
      if (typeof idx !== "number")
        return false;
      const del = this.items.splice(idx, 1);
      return del.length > 0;
    }
    get(key, keepScalar) {
      const idx = asItemIndex(key);
      if (typeof idx !== "number")
        return;
      const it = this.items[idx];
      return !keepScalar && identity.isScalar(it) ? it.value : it;
    }
    has(key) {
      const idx = asItemIndex(key);
      return typeof idx === "number" && idx < this.items.length;
    }
    set(key, value) {
      const idx = asItemIndex(key);
      if (typeof idx !== "number")
        throw new Error(`Expected a valid index, not ${key}.`);
      const prev = this.items[idx];
      if (identity.isScalar(prev) && Scalar.isScalarValue(value))
        prev.value = value;
      else
        this.items[idx] = value;
    }
    toJSON(_, ctx) {
      const seq = [];
      if (ctx?.onCreate)
        ctx.onCreate(seq);
      let i = 0;
      for (const item of this.items)
        seq.push(toJS.toJS(item, String(i++), ctx));
      return seq;
    }
    toString(ctx, onComment, onChompKeep) {
      if (!ctx)
        return JSON.stringify(this);
      return stringifyCollection.stringifyCollection(this, ctx, {
        blockItemPrefix: "- ",
        flowChars: { start: "[", end: "]" },
        itemIndent: (ctx.indent || "") + "  ",
        onChompKeep,
        onComment
      });
    }
    static from(schema, obj, ctx) {
      const { replacer } = ctx;
      const seq = new this(schema);
      if (obj && Symbol.iterator in Object(obj)) {
        let i = 0;
        for (let it of obj) {
          if (typeof replacer === "function") {
            const key = obj instanceof Set ? it : String(i++);
            it = replacer.call(obj, key, it);
          }
          seq.items.push(createNode.createNode(it, undefined, ctx));
        }
      }
      return seq;
    }
  }
  function asItemIndex(key) {
    let idx = identity.isScalar(key) ? key.value : key;
    if (idx && typeof idx === "string")
      idx = Number(idx);
    return typeof idx === "number" && Number.isInteger(idx) && idx >= 0 ? idx : null;
  }
  exports.YAMLSeq = YAMLSeq;
});

// node_modules/yaml/dist/schema/common/seq.js
var require_seq = __commonJS((exports) => {
  var identity = require_identity();
  var YAMLSeq = require_YAMLSeq();
  var seq = {
    collection: "seq",
    default: true,
    nodeClass: YAMLSeq.YAMLSeq,
    tag: "tag:yaml.org,2002:seq",
    resolve(seq2, onError) {
      if (!identity.isSeq(seq2))
        onError("Expected a sequence for this tag");
      return seq2;
    },
    createNode: (schema, obj, ctx) => YAMLSeq.YAMLSeq.from(schema, obj, ctx)
  };
  exports.seq = seq;
});

// node_modules/yaml/dist/schema/common/string.js
var require_string = __commonJS((exports) => {
  var stringifyString = require_stringifyString();
  var string = {
    identify: (value) => typeof value === "string",
    default: true,
    tag: "tag:yaml.org,2002:str",
    resolve: (str) => str,
    stringify(item, ctx, onComment, onChompKeep) {
      ctx = Object.assign({ actualString: true }, ctx);
      return stringifyString.stringifyString(item, ctx, onComment, onChompKeep);
    }
  };
  exports.string = string;
});

// node_modules/yaml/dist/schema/common/null.js
var require_null = __commonJS((exports) => {
  var Scalar = require_Scalar();
  var nullTag = {
    identify: (value) => value == null,
    createNode: () => new Scalar.Scalar(null),
    default: true,
    tag: "tag:yaml.org,2002:null",
    test: /^(?:~|[Nn]ull|NULL)?$/,
    resolve: () => new Scalar.Scalar(null),
    stringify: ({ source }, ctx) => typeof source === "string" && nullTag.test.test(source) ? source : ctx.options.nullStr
  };
  exports.nullTag = nullTag;
});

// node_modules/yaml/dist/schema/core/bool.js
var require_bool = __commonJS((exports) => {
  var Scalar = require_Scalar();
  var boolTag = {
    identify: (value) => typeof value === "boolean",
    default: true,
    tag: "tag:yaml.org,2002:bool",
    test: /^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/,
    resolve: (str) => new Scalar.Scalar(str[0] === "t" || str[0] === "T"),
    stringify({ source, value }, ctx) {
      if (source && boolTag.test.test(source)) {
        const sv = source[0] === "t" || source[0] === "T";
        if (value === sv)
          return source;
      }
      return value ? ctx.options.trueStr : ctx.options.falseStr;
    }
  };
  exports.boolTag = boolTag;
});

// node_modules/yaml/dist/stringify/stringifyNumber.js
var require_stringifyNumber = __commonJS((exports) => {
  function stringifyNumber({ format, minFractionDigits, tag, value }) {
    if (typeof value === "bigint")
      return String(value);
    const num = typeof value === "number" ? value : Number(value);
    if (!isFinite(num))
      return isNaN(num) ? ".nan" : num < 0 ? "-.inf" : ".inf";
    let n = Object.is(value, -0) ? "-0" : JSON.stringify(value);
    if (!format && minFractionDigits && (!tag || tag === "tag:yaml.org,2002:float") && /^\d/.test(n)) {
      let i = n.indexOf(".");
      if (i < 0) {
        i = n.length;
        n += ".";
      }
      let d = minFractionDigits - (n.length - i - 1);
      while (d-- > 0)
        n += "0";
    }
    return n;
  }
  exports.stringifyNumber = stringifyNumber;
});

// node_modules/yaml/dist/schema/core/float.js
var require_float = __commonJS((exports) => {
  var Scalar = require_Scalar();
  var stringifyNumber = require_stringifyNumber();
  var floatNaN = {
    identify: (value) => typeof value === "number",
    default: true,
    tag: "tag:yaml.org,2002:float",
    test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
    resolve: (str) => str.slice(-3).toLowerCase() === "nan" ? NaN : str[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
    stringify: stringifyNumber.stringifyNumber
  };
  var floatExp = {
    identify: (value) => typeof value === "number",
    default: true,
    tag: "tag:yaml.org,2002:float",
    format: "EXP",
    test: /^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)[eE][-+]?[0-9]+$/,
    resolve: (str) => parseFloat(str),
    stringify(node) {
      const num = Number(node.value);
      return isFinite(num) ? num.toExponential() : stringifyNumber.stringifyNumber(node);
    }
  };
  var float = {
    identify: (value) => typeof value === "number",
    default: true,
    tag: "tag:yaml.org,2002:float",
    test: /^[-+]?(?:\.[0-9]+|[0-9]+\.[0-9]*)$/,
    resolve(str) {
      const node = new Scalar.Scalar(parseFloat(str));
      const dot = str.indexOf(".");
      if (dot !== -1 && str[str.length - 1] === "0")
        node.minFractionDigits = str.length - dot - 1;
      return node;
    },
    stringify: stringifyNumber.stringifyNumber
  };
  exports.float = float;
  exports.floatExp = floatExp;
  exports.floatNaN = floatNaN;
});

// node_modules/yaml/dist/schema/core/int.js
var require_int = __commonJS((exports) => {
  var stringifyNumber = require_stringifyNumber();
  var intIdentify = (value) => typeof value === "bigint" || Number.isInteger(value);
  var intResolve = (str, offset, radix, { intAsBigInt }) => intAsBigInt ? BigInt(str) : parseInt(str.substring(offset), radix);
  function intStringify(node, radix, prefix) {
    const { value } = node;
    if (intIdentify(value) && value >= 0)
      return prefix + value.toString(radix);
    return stringifyNumber.stringifyNumber(node);
  }
  var intOct = {
    identify: (value) => intIdentify(value) && value >= 0,
    default: true,
    tag: "tag:yaml.org,2002:int",
    format: "OCT",
    test: /^0o[0-7]+$/,
    resolve: (str, _onError, opt) => intResolve(str, 2, 8, opt),
    stringify: (node) => intStringify(node, 8, "0o")
  };
  var int = {
    identify: intIdentify,
    default: true,
    tag: "tag:yaml.org,2002:int",
    test: /^[-+]?[0-9]+$/,
    resolve: (str, _onError, opt) => intResolve(str, 0, 10, opt),
    stringify: stringifyNumber.stringifyNumber
  };
  var intHex = {
    identify: (value) => intIdentify(value) && value >= 0,
    default: true,
    tag: "tag:yaml.org,2002:int",
    format: "HEX",
    test: /^0x[0-9a-fA-F]+$/,
    resolve: (str, _onError, opt) => intResolve(str, 2, 16, opt),
    stringify: (node) => intStringify(node, 16, "0x")
  };
  exports.int = int;
  exports.intHex = intHex;
  exports.intOct = intOct;
});

// node_modules/yaml/dist/schema/core/schema.js
var require_schema = __commonJS((exports) => {
  var map = require_map();
  var _null = require_null();
  var seq = require_seq();
  var string = require_string();
  var bool = require_bool();
  var float = require_float();
  var int = require_int();
  var schema = [
    map.map,
    seq.seq,
    string.string,
    _null.nullTag,
    bool.boolTag,
    int.intOct,
    int.int,
    int.intHex,
    float.floatNaN,
    float.floatExp,
    float.float
  ];
  exports.schema = schema;
});

// node_modules/yaml/dist/schema/json/schema.js
var require_schema2 = __commonJS((exports) => {
  var Scalar = require_Scalar();
  var map = require_map();
  var seq = require_seq();
  function intIdentify(value) {
    return typeof value === "bigint" || Number.isInteger(value);
  }
  var stringifyJSON = ({ value }) => JSON.stringify(value);
  var jsonScalars = [
    {
      identify: (value) => typeof value === "string",
      default: true,
      tag: "tag:yaml.org,2002:str",
      resolve: (str) => str,
      stringify: stringifyJSON
    },
    {
      identify: (value) => value == null,
      createNode: () => new Scalar.Scalar(null),
      default: true,
      tag: "tag:yaml.org,2002:null",
      test: /^null$/,
      resolve: () => null,
      stringify: stringifyJSON
    },
    {
      identify: (value) => typeof value === "boolean",
      default: true,
      tag: "tag:yaml.org,2002:bool",
      test: /^true$|^false$/,
      resolve: (str) => str === "true",
      stringify: stringifyJSON
    },
    {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      test: /^-?(?:0|[1-9][0-9]*)$/,
      resolve: (str, _onError, { intAsBigInt }) => intAsBigInt ? BigInt(str) : parseInt(str, 10),
      stringify: ({ value }) => intIdentify(value) ? value.toString() : JSON.stringify(value)
    },
    {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,
      resolve: (str) => parseFloat(str),
      stringify: stringifyJSON
    }
  ];
  var jsonError = {
    default: true,
    tag: "",
    test: /^/,
    resolve(str, onError) {
      onError(`Unresolved plain scalar ${JSON.stringify(str)}`);
      return str;
    }
  };
  var schema = [map.map, seq.seq].concat(jsonScalars, jsonError);
  exports.schema = schema;
});

// node_modules/yaml/dist/schema/yaml-1.1/binary.js
var require_binary = __commonJS((exports) => {
  var node_buffer = __require("buffer");
  var Scalar = require_Scalar();
  var stringifyString = require_stringifyString();
  var binary = {
    identify: (value) => value instanceof Uint8Array,
    default: false,
    tag: "tag:yaml.org,2002:binary",
    resolve(src, onError) {
      if (typeof node_buffer.Buffer === "function") {
        return node_buffer.Buffer.from(src, "base64");
      } else if (typeof atob === "function") {
        const str = atob(src.replace(/[\n\r]/g, ""));
        const buffer = new Uint8Array(str.length);
        for (let i = 0;i < str.length; ++i)
          buffer[i] = str.charCodeAt(i);
        return buffer;
      } else {
        onError("This environment does not support reading binary tags; either Buffer or atob is required");
        return src;
      }
    },
    stringify({ comment, type, value }, ctx, onComment, onChompKeep) {
      if (!value)
        return "";
      const buf = value;
      let str;
      if (typeof node_buffer.Buffer === "function") {
        str = buf instanceof node_buffer.Buffer ? buf.toString("base64") : node_buffer.Buffer.from(buf.buffer).toString("base64");
      } else if (typeof btoa === "function") {
        let s = "";
        for (let i = 0;i < buf.length; ++i)
          s += String.fromCharCode(buf[i]);
        str = btoa(s);
      } else {
        throw new Error("This environment does not support writing binary tags; either Buffer or btoa is required");
      }
      type ?? (type = Scalar.Scalar.BLOCK_LITERAL);
      if (type !== Scalar.Scalar.QUOTE_DOUBLE) {
        const lineWidth = Math.max(ctx.options.lineWidth - ctx.indent.length, ctx.options.minContentWidth);
        const n = Math.ceil(str.length / lineWidth);
        const lines = new Array(n);
        for (let i = 0, o = 0;i < n; ++i, o += lineWidth) {
          lines[i] = str.substr(o, lineWidth);
        }
        str = lines.join(type === Scalar.Scalar.BLOCK_LITERAL ? `
` : " ");
      }
      return stringifyString.stringifyString({ comment, type, value: str }, ctx, onComment, onChompKeep);
    }
  };
  exports.binary = binary;
});

// node_modules/yaml/dist/schema/yaml-1.1/pairs.js
var require_pairs = __commonJS((exports) => {
  var identity = require_identity();
  var Pair = require_Pair();
  var Scalar = require_Scalar();
  var YAMLSeq = require_YAMLSeq();
  function resolvePairs(seq, onError) {
    if (identity.isSeq(seq)) {
      for (let i = 0;i < seq.items.length; ++i) {
        let item = seq.items[i];
        if (identity.isPair(item))
          continue;
        else if (identity.isMap(item)) {
          if (item.items.length > 1)
            onError("Each pair must have its own sequence indicator");
          const pair = item.items[0] || new Pair.Pair(new Scalar.Scalar(null));
          if (item.commentBefore)
            pair.key.commentBefore = pair.key.commentBefore ? `${item.commentBefore}
${pair.key.commentBefore}` : item.commentBefore;
          if (item.comment) {
            const cn = pair.value ?? pair.key;
            cn.comment = cn.comment ? `${item.comment}
${cn.comment}` : item.comment;
          }
          item = pair;
        }
        seq.items[i] = identity.isPair(item) ? item : new Pair.Pair(item);
      }
    } else
      onError("Expected a sequence for this tag");
    return seq;
  }
  function createPairs(schema, iterable, ctx) {
    const { replacer } = ctx;
    const pairs2 = new YAMLSeq.YAMLSeq(schema);
    pairs2.tag = "tag:yaml.org,2002:pairs";
    let i = 0;
    if (iterable && Symbol.iterator in Object(iterable))
      for (let it of iterable) {
        if (typeof replacer === "function")
          it = replacer.call(iterable, String(i++), it);
        let key, value;
        if (Array.isArray(it)) {
          if (it.length === 2) {
            key = it[0];
            value = it[1];
          } else
            throw new TypeError(`Expected [key, value] tuple: ${it}`);
        } else if (it && it instanceof Object) {
          const keys = Object.keys(it);
          if (keys.length === 1) {
            key = keys[0];
            value = it[key];
          } else {
            throw new TypeError(`Expected tuple with one key, not ${keys.length} keys`);
          }
        } else {
          key = it;
        }
        pairs2.items.push(Pair.createPair(key, value, ctx));
      }
    return pairs2;
  }
  var pairs = {
    collection: "seq",
    default: false,
    tag: "tag:yaml.org,2002:pairs",
    resolve: resolvePairs,
    createNode: createPairs
  };
  exports.createPairs = createPairs;
  exports.pairs = pairs;
  exports.resolvePairs = resolvePairs;
});

// node_modules/yaml/dist/schema/yaml-1.1/omap.js
var require_omap = __commonJS((exports) => {
  var identity = require_identity();
  var toJS = require_toJS();
  var YAMLMap = require_YAMLMap();
  var YAMLSeq = require_YAMLSeq();
  var pairs = require_pairs();

  class YAMLOMap extends YAMLSeq.YAMLSeq {
    constructor() {
      super();
      this.add = YAMLMap.YAMLMap.prototype.add.bind(this);
      this.delete = YAMLMap.YAMLMap.prototype.delete.bind(this);
      this.get = YAMLMap.YAMLMap.prototype.get.bind(this);
      this.has = YAMLMap.YAMLMap.prototype.has.bind(this);
      this.set = YAMLMap.YAMLMap.prototype.set.bind(this);
      this.tag = YAMLOMap.tag;
    }
    toJSON(_, ctx) {
      if (!ctx)
        return super.toJSON(_);
      const map = new Map;
      if (ctx?.onCreate)
        ctx.onCreate(map);
      for (const pair of this.items) {
        let key, value;
        if (identity.isPair(pair)) {
          key = toJS.toJS(pair.key, "", ctx);
          value = toJS.toJS(pair.value, key, ctx);
        } else {
          key = toJS.toJS(pair, "", ctx);
        }
        if (map.has(key))
          throw new Error("Ordered maps must not include duplicate keys");
        map.set(key, value);
      }
      return map;
    }
    static from(schema, iterable, ctx) {
      const pairs$1 = pairs.createPairs(schema, iterable, ctx);
      const omap2 = new this;
      omap2.items = pairs$1.items;
      return omap2;
    }
  }
  YAMLOMap.tag = "tag:yaml.org,2002:omap";
  var omap = {
    collection: "seq",
    identify: (value) => value instanceof Map,
    nodeClass: YAMLOMap,
    default: false,
    tag: "tag:yaml.org,2002:omap",
    resolve(seq, onError) {
      const pairs$1 = pairs.resolvePairs(seq, onError);
      const seenKeys = [];
      for (const { key } of pairs$1.items) {
        if (identity.isScalar(key)) {
          if (seenKeys.includes(key.value)) {
            onError(`Ordered maps must not include duplicate keys: ${key.value}`);
          } else {
            seenKeys.push(key.value);
          }
        }
      }
      return Object.assign(new YAMLOMap, pairs$1);
    },
    createNode: (schema, iterable, ctx) => YAMLOMap.from(schema, iterable, ctx)
  };
  exports.YAMLOMap = YAMLOMap;
  exports.omap = omap;
});

// node_modules/yaml/dist/schema/yaml-1.1/bool.js
var require_bool2 = __commonJS((exports) => {
  var Scalar = require_Scalar();
  function boolStringify({ value, source }, ctx) {
    const boolObj = value ? trueTag : falseTag;
    if (source && boolObj.test.test(source))
      return source;
    return value ? ctx.options.trueStr : ctx.options.falseStr;
  }
  var trueTag = {
    identify: (value) => value === true,
    default: true,
    tag: "tag:yaml.org,2002:bool",
    test: /^(?:Y|y|[Yy]es|YES|[Tt]rue|TRUE|[Oo]n|ON)$/,
    resolve: () => new Scalar.Scalar(true),
    stringify: boolStringify
  };
  var falseTag = {
    identify: (value) => value === false,
    default: true,
    tag: "tag:yaml.org,2002:bool",
    test: /^(?:N|n|[Nn]o|NO|[Ff]alse|FALSE|[Oo]ff|OFF)$/,
    resolve: () => new Scalar.Scalar(false),
    stringify: boolStringify
  };
  exports.falseTag = falseTag;
  exports.trueTag = trueTag;
});

// node_modules/yaml/dist/schema/yaml-1.1/float.js
var require_float2 = __commonJS((exports) => {
  var Scalar = require_Scalar();
  var stringifyNumber = require_stringifyNumber();
  var floatNaN = {
    identify: (value) => typeof value === "number",
    default: true,
    tag: "tag:yaml.org,2002:float",
    test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
    resolve: (str) => str.slice(-3).toLowerCase() === "nan" ? NaN : str[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
    stringify: stringifyNumber.stringifyNumber
  };
  var floatExp = {
    identify: (value) => typeof value === "number",
    default: true,
    tag: "tag:yaml.org,2002:float",
    format: "EXP",
    test: /^[-+]?(?:[0-9][0-9_]*)?(?:\.[0-9_]*)?[eE][-+]?[0-9]+$/,
    resolve: (str) => parseFloat(str.replace(/_/g, "")),
    stringify(node) {
      const num = Number(node.value);
      return isFinite(num) ? num.toExponential() : stringifyNumber.stringifyNumber(node);
    }
  };
  var float = {
    identify: (value) => typeof value === "number",
    default: true,
    tag: "tag:yaml.org,2002:float",
    test: /^[-+]?(?:[0-9][0-9_]*)?\.[0-9_]*$/,
    resolve(str) {
      const node = new Scalar.Scalar(parseFloat(str.replace(/_/g, "")));
      const dot = str.indexOf(".");
      if (dot !== -1) {
        const f = str.substring(dot + 1).replace(/_/g, "");
        if (f[f.length - 1] === "0")
          node.minFractionDigits = f.length;
      }
      return node;
    },
    stringify: stringifyNumber.stringifyNumber
  };
  exports.float = float;
  exports.floatExp = floatExp;
  exports.floatNaN = floatNaN;
});

// node_modules/yaml/dist/schema/yaml-1.1/int.js
var require_int2 = __commonJS((exports) => {
  var stringifyNumber = require_stringifyNumber();
  var intIdentify = (value) => typeof value === "bigint" || Number.isInteger(value);
  function intResolve(str, offset, radix, { intAsBigInt }) {
    const sign = str[0];
    if (sign === "-" || sign === "+")
      offset += 1;
    str = str.substring(offset).replace(/_/g, "");
    if (intAsBigInt) {
      switch (radix) {
        case 2:
          str = `0b${str}`;
          break;
        case 8:
          str = `0o${str}`;
          break;
        case 16:
          str = `0x${str}`;
          break;
      }
      const n2 = BigInt(str);
      return sign === "-" ? BigInt(-1) * n2 : n2;
    }
    const n = parseInt(str, radix);
    return sign === "-" ? -1 * n : n;
  }
  function intStringify(node, radix, prefix) {
    const { value } = node;
    if (intIdentify(value)) {
      const str = value.toString(radix);
      return value < 0 ? "-" + prefix + str.substr(1) : prefix + str;
    }
    return stringifyNumber.stringifyNumber(node);
  }
  var intBin = {
    identify: intIdentify,
    default: true,
    tag: "tag:yaml.org,2002:int",
    format: "BIN",
    test: /^[-+]?0b[0-1_]+$/,
    resolve: (str, _onError, opt) => intResolve(str, 2, 2, opt),
    stringify: (node) => intStringify(node, 2, "0b")
  };
  var intOct = {
    identify: intIdentify,
    default: true,
    tag: "tag:yaml.org,2002:int",
    format: "OCT",
    test: /^[-+]?0[0-7_]+$/,
    resolve: (str, _onError, opt) => intResolve(str, 1, 8, opt),
    stringify: (node) => intStringify(node, 8, "0")
  };
  var int = {
    identify: intIdentify,
    default: true,
    tag: "tag:yaml.org,2002:int",
    test: /^[-+]?[0-9][0-9_]*$/,
    resolve: (str, _onError, opt) => intResolve(str, 0, 10, opt),
    stringify: stringifyNumber.stringifyNumber
  };
  var intHex = {
    identify: intIdentify,
    default: true,
    tag: "tag:yaml.org,2002:int",
    format: "HEX",
    test: /^[-+]?0x[0-9a-fA-F_]+$/,
    resolve: (str, _onError, opt) => intResolve(str, 2, 16, opt),
    stringify: (node) => intStringify(node, 16, "0x")
  };
  exports.int = int;
  exports.intBin = intBin;
  exports.intHex = intHex;
  exports.intOct = intOct;
});

// node_modules/yaml/dist/schema/yaml-1.1/set.js
var require_set = __commonJS((exports) => {
  var identity = require_identity();
  var Pair = require_Pair();
  var YAMLMap = require_YAMLMap();

  class YAMLSet extends YAMLMap.YAMLMap {
    constructor(schema) {
      super(schema);
      this.tag = YAMLSet.tag;
    }
    add(key) {
      let pair;
      if (identity.isPair(key))
        pair = key;
      else if (key && typeof key === "object" && "key" in key && "value" in key && key.value === null)
        pair = new Pair.Pair(key.key, null);
      else
        pair = new Pair.Pair(key, null);
      const prev = YAMLMap.findPair(this.items, pair.key);
      if (!prev)
        this.items.push(pair);
    }
    get(key, keepPair) {
      const pair = YAMLMap.findPair(this.items, key);
      return !keepPair && identity.isPair(pair) ? identity.isScalar(pair.key) ? pair.key.value : pair.key : pair;
    }
    set(key, value) {
      if (typeof value !== "boolean")
        throw new Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof value}`);
      const prev = YAMLMap.findPair(this.items, key);
      if (prev && !value) {
        this.items.splice(this.items.indexOf(prev), 1);
      } else if (!prev && value) {
        this.items.push(new Pair.Pair(key));
      }
    }
    toJSON(_, ctx) {
      return super.toJSON(_, ctx, Set);
    }
    toString(ctx, onComment, onChompKeep) {
      if (!ctx)
        return JSON.stringify(this);
      if (this.hasAllNullValues(true))
        return super.toString(Object.assign({}, ctx, { allNullValues: true }), onComment, onChompKeep);
      else
        throw new Error("Set items must all have null values");
    }
    static from(schema, iterable, ctx) {
      const { replacer } = ctx;
      const set2 = new this(schema);
      if (iterable && Symbol.iterator in Object(iterable))
        for (let value of iterable) {
          if (typeof replacer === "function")
            value = replacer.call(iterable, value, value);
          set2.items.push(Pair.createPair(value, null, ctx));
        }
      return set2;
    }
  }
  YAMLSet.tag = "tag:yaml.org,2002:set";
  var set = {
    collection: "map",
    identify: (value) => value instanceof Set,
    nodeClass: YAMLSet,
    default: false,
    tag: "tag:yaml.org,2002:set",
    createNode: (schema, iterable, ctx) => YAMLSet.from(schema, iterable, ctx),
    resolve(map, onError) {
      if (identity.isMap(map)) {
        if (map.hasAllNullValues(true))
          return Object.assign(new YAMLSet, map);
        else
          onError("Set items must all have null values");
      } else
        onError("Expected a mapping for this tag");
      return map;
    }
  };
  exports.YAMLSet = YAMLSet;
  exports.set = set;
});

// node_modules/yaml/dist/schema/yaml-1.1/timestamp.js
var require_timestamp = __commonJS((exports) => {
  var stringifyNumber = require_stringifyNumber();
  function parseSexagesimal(str, asBigInt) {
    const sign = str[0];
    const parts = sign === "-" || sign === "+" ? str.substring(1) : str;
    const num = (n) => asBigInt ? BigInt(n) : Number(n);
    const res = parts.replace(/_/g, "").split(":").reduce((res2, p) => res2 * num(60) + num(p), num(0));
    return sign === "-" ? num(-1) * res : res;
  }
  function stringifySexagesimal(node) {
    let { value } = node;
    let num = (n) => n;
    if (typeof value === "bigint")
      num = (n) => BigInt(n);
    else if (isNaN(value) || !isFinite(value))
      return stringifyNumber.stringifyNumber(node);
    let sign = "";
    if (value < 0) {
      sign = "-";
      value *= num(-1);
    }
    const _60 = num(60);
    const parts = [value % _60];
    if (value < 60) {
      parts.unshift(0);
    } else {
      value = (value - parts[0]) / _60;
      parts.unshift(value % _60);
      if (value >= 60) {
        value = (value - parts[0]) / _60;
        parts.unshift(value);
      }
    }
    return sign + parts.map((n) => String(n).padStart(2, "0")).join(":").replace(/000000\d*$/, "");
  }
  var intTime = {
    identify: (value) => typeof value === "bigint" || Number.isInteger(value),
    default: true,
    tag: "tag:yaml.org,2002:int",
    format: "TIME",
    test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+$/,
    resolve: (str, _onError, { intAsBigInt }) => parseSexagesimal(str, intAsBigInt),
    stringify: stringifySexagesimal
  };
  var floatTime = {
    identify: (value) => typeof value === "number",
    default: true,
    tag: "tag:yaml.org,2002:float",
    format: "TIME",
    test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*$/,
    resolve: (str) => parseSexagesimal(str, false),
    stringify: stringifySexagesimal
  };
  var timestamp = {
    identify: (value) => value instanceof Date,
    default: true,
    tag: "tag:yaml.org,2002:timestamp",
    test: RegExp("^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})" + "(?:" + "(?:t|T|[ \\t]+)" + "([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)" + "(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?" + ")?$"),
    resolve(str) {
      const match = str.match(timestamp.test);
      if (!match)
        throw new Error("!!timestamp expects a date, starting with yyyy-mm-dd");
      const [, year, month, day, hour, minute, second] = match.map(Number);
      const millisec = match[7] ? Number((match[7] + "00").substr(1, 3)) : 0;
      let date = Date.UTC(year, month - 1, day, hour || 0, minute || 0, second || 0, millisec);
      const tz = match[8];
      if (tz && tz !== "Z") {
        let d = parseSexagesimal(tz, false);
        if (Math.abs(d) < 30)
          d *= 60;
        date -= 60000 * d;
      }
      return new Date(date);
    },
    stringify: ({ value }) => value?.toISOString().replace(/(T00:00:00)?\.000Z$/, "") ?? ""
  };
  exports.floatTime = floatTime;
  exports.intTime = intTime;
  exports.timestamp = timestamp;
});

// node_modules/yaml/dist/schema/yaml-1.1/schema.js
var require_schema3 = __commonJS((exports) => {
  var map = require_map();
  var _null = require_null();
  var seq = require_seq();
  var string = require_string();
  var binary = require_binary();
  var bool = require_bool2();
  var float = require_float2();
  var int = require_int2();
  var merge = require_merge();
  var omap = require_omap();
  var pairs = require_pairs();
  var set = require_set();
  var timestamp = require_timestamp();
  var schema = [
    map.map,
    seq.seq,
    string.string,
    _null.nullTag,
    bool.trueTag,
    bool.falseTag,
    int.intBin,
    int.intOct,
    int.int,
    int.intHex,
    float.floatNaN,
    float.floatExp,
    float.float,
    binary.binary,
    merge.merge,
    omap.omap,
    pairs.pairs,
    set.set,
    timestamp.intTime,
    timestamp.floatTime,
    timestamp.timestamp
  ];
  exports.schema = schema;
});

// node_modules/yaml/dist/schema/tags.js
var require_tags = __commonJS((exports) => {
  var map = require_map();
  var _null = require_null();
  var seq = require_seq();
  var string = require_string();
  var bool = require_bool();
  var float = require_float();
  var int = require_int();
  var schema = require_schema();
  var schema$1 = require_schema2();
  var binary = require_binary();
  var merge = require_merge();
  var omap = require_omap();
  var pairs = require_pairs();
  var schema$2 = require_schema3();
  var set = require_set();
  var timestamp = require_timestamp();
  var schemas = new Map([
    ["core", schema.schema],
    ["failsafe", [map.map, seq.seq, string.string]],
    ["json", schema$1.schema],
    ["yaml11", schema$2.schema],
    ["yaml-1.1", schema$2.schema]
  ]);
  var tagsByName = {
    binary: binary.binary,
    bool: bool.boolTag,
    float: float.float,
    floatExp: float.floatExp,
    floatNaN: float.floatNaN,
    floatTime: timestamp.floatTime,
    int: int.int,
    intHex: int.intHex,
    intOct: int.intOct,
    intTime: timestamp.intTime,
    map: map.map,
    merge: merge.merge,
    null: _null.nullTag,
    omap: omap.omap,
    pairs: pairs.pairs,
    seq: seq.seq,
    set: set.set,
    timestamp: timestamp.timestamp
  };
  var coreKnownTags = {
    "tag:yaml.org,2002:binary": binary.binary,
    "tag:yaml.org,2002:merge": merge.merge,
    "tag:yaml.org,2002:omap": omap.omap,
    "tag:yaml.org,2002:pairs": pairs.pairs,
    "tag:yaml.org,2002:set": set.set,
    "tag:yaml.org,2002:timestamp": timestamp.timestamp
  };
  function getTags(customTags, schemaName, addMergeTag) {
    const schemaTags = schemas.get(schemaName);
    if (schemaTags && !customTags) {
      return addMergeTag && !schemaTags.includes(merge.merge) ? schemaTags.concat(merge.merge) : schemaTags.slice();
    }
    let tags = schemaTags;
    if (!tags) {
      if (Array.isArray(customTags))
        tags = [];
      else {
        const keys = Array.from(schemas.keys()).filter((key) => key !== "yaml11").map((key) => JSON.stringify(key)).join(", ");
        throw new Error(`Unknown schema "${schemaName}"; use one of ${keys} or define customTags array`);
      }
    }
    if (Array.isArray(customTags)) {
      for (const tag of customTags)
        tags = tags.concat(tag);
    } else if (typeof customTags === "function") {
      tags = customTags(tags.slice());
    }
    if (addMergeTag)
      tags = tags.concat(merge.merge);
    return tags.reduce((tags2, tag) => {
      const tagObj = typeof tag === "string" ? tagsByName[tag] : tag;
      if (!tagObj) {
        const tagName = JSON.stringify(tag);
        const keys = Object.keys(tagsByName).map((key) => JSON.stringify(key)).join(", ");
        throw new Error(`Unknown custom tag ${tagName}; use one of ${keys}`);
      }
      if (!tags2.includes(tagObj))
        tags2.push(tagObj);
      return tags2;
    }, []);
  }
  exports.coreKnownTags = coreKnownTags;
  exports.getTags = getTags;
});

// node_modules/yaml/dist/schema/Schema.js
var require_Schema = __commonJS((exports) => {
  var identity = require_identity();
  var map = require_map();
  var seq = require_seq();
  var string = require_string();
  var tags = require_tags();
  var sortMapEntriesByKey = (a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0;

  class Schema {
    constructor({ compat, customTags, merge, resolveKnownTags, schema, sortMapEntries, toStringDefaults }) {
      this.compat = Array.isArray(compat) ? tags.getTags(compat, "compat") : compat ? tags.getTags(null, compat) : null;
      this.name = typeof schema === "string" && schema || "core";
      this.knownTags = resolveKnownTags ? tags.coreKnownTags : {};
      this.tags = tags.getTags(customTags, this.name, merge);
      this.toStringOptions = toStringDefaults ?? null;
      Object.defineProperty(this, identity.MAP, { value: map.map });
      Object.defineProperty(this, identity.SCALAR, { value: string.string });
      Object.defineProperty(this, identity.SEQ, { value: seq.seq });
      this.sortMapEntries = typeof sortMapEntries === "function" ? sortMapEntries : sortMapEntries === true ? sortMapEntriesByKey : null;
    }
    clone() {
      const copy = Object.create(Schema.prototype, Object.getOwnPropertyDescriptors(this));
      copy.tags = this.tags.slice();
      return copy;
    }
  }
  exports.Schema = Schema;
});

// node_modules/yaml/dist/stringify/stringifyDocument.js
var require_stringifyDocument = __commonJS((exports) => {
  var identity = require_identity();
  var stringify = require_stringify();
  var stringifyComment = require_stringifyComment();
  function stringifyDocument(doc, options) {
    const lines = [];
    let hasDirectives = options.directives === true;
    if (options.directives !== false && doc.directives) {
      const dir = doc.directives.toString(doc);
      if (dir) {
        lines.push(dir);
        hasDirectives = true;
      } else if (doc.directives.docStart)
        hasDirectives = true;
    }
    if (hasDirectives)
      lines.push("---");
    const ctx = stringify.createStringifyContext(doc, options);
    const { commentString } = ctx.options;
    if (doc.commentBefore) {
      if (lines.length !== 1)
        lines.unshift("");
      const cs = commentString(doc.commentBefore);
      lines.unshift(stringifyComment.indentComment(cs, ""));
    }
    let chompKeep = false;
    let contentComment = null;
    if (doc.contents) {
      if (identity.isNode(doc.contents)) {
        if (doc.contents.spaceBefore && hasDirectives)
          lines.push("");
        if (doc.contents.commentBefore) {
          const cs = commentString(doc.contents.commentBefore);
          lines.push(stringifyComment.indentComment(cs, ""));
        }
        ctx.forceBlockIndent = !!doc.comment;
        contentComment = doc.contents.comment;
      }
      const onChompKeep = contentComment ? undefined : () => chompKeep = true;
      let body = stringify.stringify(doc.contents, ctx, () => contentComment = null, onChompKeep);
      if (contentComment)
        body += stringifyComment.lineComment(body, "", commentString(contentComment));
      if ((body[0] === "|" || body[0] === ">") && lines[lines.length - 1] === "---") {
        lines[lines.length - 1] = `--- ${body}`;
      } else
        lines.push(body);
    } else {
      lines.push(stringify.stringify(doc.contents, ctx));
    }
    if (doc.directives?.docEnd) {
      if (doc.comment) {
        const cs = commentString(doc.comment);
        if (cs.includes(`
`)) {
          lines.push("...");
          lines.push(stringifyComment.indentComment(cs, ""));
        } else {
          lines.push(`... ${cs}`);
        }
      } else {
        lines.push("...");
      }
    } else {
      let dc = doc.comment;
      if (dc && chompKeep)
        dc = dc.replace(/^\n+/, "");
      if (dc) {
        if ((!chompKeep || contentComment) && lines[lines.length - 1] !== "")
          lines.push("");
        lines.push(stringifyComment.indentComment(commentString(dc), ""));
      }
    }
    return lines.join(`
`) + `
`;
  }
  exports.stringifyDocument = stringifyDocument;
});

// node_modules/yaml/dist/doc/Document.js
var require_Document = __commonJS((exports) => {
  var Alias = require_Alias();
  var Collection = require_Collection();
  var identity = require_identity();
  var Pair = require_Pair();
  var toJS = require_toJS();
  var Schema = require_Schema();
  var stringifyDocument = require_stringifyDocument();
  var anchors = require_anchors();
  var applyReviver = require_applyReviver();
  var createNode = require_createNode();
  var directives = require_directives();

  class Document {
    constructor(value, replacer, options) {
      this.commentBefore = null;
      this.comment = null;
      this.errors = [];
      this.warnings = [];
      Object.defineProperty(this, identity.NODE_TYPE, { value: identity.DOC });
      let _replacer = null;
      if (typeof replacer === "function" || Array.isArray(replacer)) {
        _replacer = replacer;
      } else if (options === undefined && replacer) {
        options = replacer;
        replacer = undefined;
      }
      const opt = Object.assign({
        intAsBigInt: false,
        keepSourceTokens: false,
        logLevel: "warn",
        prettyErrors: true,
        strict: true,
        stringKeys: false,
        uniqueKeys: true,
        version: "1.2"
      }, options);
      this.options = opt;
      let { version } = opt;
      if (options?._directives) {
        this.directives = options._directives.atDocument();
        if (this.directives.yaml.explicit)
          version = this.directives.yaml.version;
      } else
        this.directives = new directives.Directives({ version });
      this.setSchema(version, options);
      this.contents = value === undefined ? null : this.createNode(value, _replacer, options);
    }
    clone() {
      const copy = Object.create(Document.prototype, {
        [identity.NODE_TYPE]: { value: identity.DOC }
      });
      copy.commentBefore = this.commentBefore;
      copy.comment = this.comment;
      copy.errors = this.errors.slice();
      copy.warnings = this.warnings.slice();
      copy.options = Object.assign({}, this.options);
      if (this.directives)
        copy.directives = this.directives.clone();
      copy.schema = this.schema.clone();
      copy.contents = identity.isNode(this.contents) ? this.contents.clone(copy.schema) : this.contents;
      if (this.range)
        copy.range = this.range.slice();
      return copy;
    }
    add(value) {
      if (assertCollection(this.contents))
        this.contents.add(value);
    }
    addIn(path, value) {
      if (assertCollection(this.contents))
        this.contents.addIn(path, value);
    }
    createAlias(node, name) {
      if (!node.anchor) {
        const prev = anchors.anchorNames(this);
        node.anchor = !name || prev.has(name) ? anchors.findNewAnchor(name || "a", prev) : name;
      }
      return new Alias.Alias(node.anchor);
    }
    createNode(value, replacer, options) {
      let _replacer = undefined;
      if (typeof replacer === "function") {
        value = replacer.call({ "": value }, "", value);
        _replacer = replacer;
      } else if (Array.isArray(replacer)) {
        const keyToStr = (v) => typeof v === "number" || v instanceof String || v instanceof Number;
        const asStr = replacer.filter(keyToStr).map(String);
        if (asStr.length > 0)
          replacer = replacer.concat(asStr);
        _replacer = replacer;
      } else if (options === undefined && replacer) {
        options = replacer;
        replacer = undefined;
      }
      const { aliasDuplicateObjects, anchorPrefix, flow, keepUndefined, onTagObj, tag } = options ?? {};
      const { onAnchor, setAnchors, sourceObjects } = anchors.createNodeAnchors(this, anchorPrefix || "a");
      const ctx = {
        aliasDuplicateObjects: aliasDuplicateObjects ?? true,
        keepUndefined: keepUndefined ?? false,
        onAnchor,
        onTagObj,
        replacer: _replacer,
        schema: this.schema,
        sourceObjects
      };
      const node = createNode.createNode(value, tag, ctx);
      if (flow && identity.isCollection(node))
        node.flow = true;
      setAnchors();
      return node;
    }
    createPair(key, value, options = {}) {
      const k = this.createNode(key, null, options);
      const v = this.createNode(value, null, options);
      return new Pair.Pair(k, v);
    }
    delete(key) {
      return assertCollection(this.contents) ? this.contents.delete(key) : false;
    }
    deleteIn(path) {
      if (Collection.isEmptyPath(path)) {
        if (this.contents == null)
          return false;
        this.contents = null;
        return true;
      }
      return assertCollection(this.contents) ? this.contents.deleteIn(path) : false;
    }
    get(key, keepScalar) {
      return identity.isCollection(this.contents) ? this.contents.get(key, keepScalar) : undefined;
    }
    getIn(path, keepScalar) {
      if (Collection.isEmptyPath(path))
        return !keepScalar && identity.isScalar(this.contents) ? this.contents.value : this.contents;
      return identity.isCollection(this.contents) ? this.contents.getIn(path, keepScalar) : undefined;
    }
    has(key) {
      return identity.isCollection(this.contents) ? this.contents.has(key) : false;
    }
    hasIn(path) {
      if (Collection.isEmptyPath(path))
        return this.contents !== undefined;
      return identity.isCollection(this.contents) ? this.contents.hasIn(path) : false;
    }
    set(key, value) {
      if (this.contents == null) {
        this.contents = Collection.collectionFromPath(this.schema, [key], value);
      } else if (assertCollection(this.contents)) {
        this.contents.set(key, value);
      }
    }
    setIn(path, value) {
      if (Collection.isEmptyPath(path)) {
        this.contents = value;
      } else if (this.contents == null) {
        this.contents = Collection.collectionFromPath(this.schema, Array.from(path), value);
      } else if (assertCollection(this.contents)) {
        this.contents.setIn(path, value);
      }
    }
    setSchema(version, options = {}) {
      if (typeof version === "number")
        version = String(version);
      let opt;
      switch (version) {
        case "1.1":
          if (this.directives)
            this.directives.yaml.version = "1.1";
          else
            this.directives = new directives.Directives({ version: "1.1" });
          opt = { resolveKnownTags: false, schema: "yaml-1.1" };
          break;
        case "1.2":
        case "next":
          if (this.directives)
            this.directives.yaml.version = version;
          else
            this.directives = new directives.Directives({ version });
          opt = { resolveKnownTags: true, schema: "core" };
          break;
        case null:
          if (this.directives)
            delete this.directives;
          opt = null;
          break;
        default: {
          const sv = JSON.stringify(version);
          throw new Error(`Expected '1.1', '1.2' or null as first argument, but found: ${sv}`);
        }
      }
      if (options.schema instanceof Object)
        this.schema = options.schema;
      else if (opt)
        this.schema = new Schema.Schema(Object.assign(opt, options));
      else
        throw new Error(`With a null YAML version, the { schema: Schema } option is required`);
    }
    toJS({ json, jsonArg, mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
      const ctx = {
        anchors: new Map,
        doc: this,
        keep: !json,
        mapAsMap: mapAsMap === true,
        mapKeyWarned: false,
        maxAliasCount: typeof maxAliasCount === "number" ? maxAliasCount : 100
      };
      const res = toJS.toJS(this.contents, jsonArg ?? "", ctx);
      if (typeof onAnchor === "function")
        for (const { count, res: res2 } of ctx.anchors.values())
          onAnchor(res2, count);
      return typeof reviver === "function" ? applyReviver.applyReviver(reviver, { "": res }, "", res) : res;
    }
    toJSON(jsonArg, onAnchor) {
      return this.toJS({ json: true, jsonArg, mapAsMap: false, onAnchor });
    }
    toString(options = {}) {
      if (this.errors.length > 0)
        throw new Error("Document with errors cannot be stringified");
      if ("indent" in options && (!Number.isInteger(options.indent) || Number(options.indent) <= 0)) {
        const s = JSON.stringify(options.indent);
        throw new Error(`"indent" option must be a positive integer, not ${s}`);
      }
      return stringifyDocument.stringifyDocument(this, options);
    }
  }
  function assertCollection(contents) {
    if (identity.isCollection(contents))
      return true;
    throw new Error("Expected a YAML collection as document contents");
  }
  exports.Document = Document;
});

// node_modules/yaml/dist/errors.js
var require_errors = __commonJS((exports) => {
  class YAMLError extends Error {
    constructor(name, pos, code, message) {
      super();
      this.name = name;
      this.code = code;
      this.message = message;
      this.pos = pos;
    }
  }

  class YAMLParseError extends YAMLError {
    constructor(pos, code, message) {
      super("YAMLParseError", pos, code, message);
    }
  }

  class YAMLWarning extends YAMLError {
    constructor(pos, code, message) {
      super("YAMLWarning", pos, code, message);
    }
  }
  var prettifyError = (src, lc) => (error) => {
    if (error.pos[0] === -1)
      return;
    error.linePos = error.pos.map((pos) => lc.linePos(pos));
    const { line, col } = error.linePos[0];
    error.message += ` at line ${line}, column ${col}`;
    let ci = col - 1;
    let lineStr = src.substring(lc.lineStarts[line - 1], lc.lineStarts[line]).replace(/[\n\r]+$/, "");
    if (ci >= 60 && lineStr.length > 80) {
      const trimStart = Math.min(ci - 39, lineStr.length - 79);
      lineStr = "…" + lineStr.substring(trimStart);
      ci -= trimStart - 1;
    }
    if (lineStr.length > 80)
      lineStr = lineStr.substring(0, 79) + "…";
    if (line > 1 && /^ *$/.test(lineStr.substring(0, ci))) {
      let prev = src.substring(lc.lineStarts[line - 2], lc.lineStarts[line - 1]);
      if (prev.length > 80)
        prev = prev.substring(0, 79) + `…
`;
      lineStr = prev + lineStr;
    }
    if (/[^ ]/.test(lineStr)) {
      let count = 1;
      const end = error.linePos[1];
      if (end?.line === line && end.col > col) {
        count = Math.max(1, Math.min(end.col - col, 80 - ci));
      }
      const pointer = " ".repeat(ci) + "^".repeat(count);
      error.message += `:

${lineStr}
${pointer}
`;
    }
  };
  exports.YAMLError = YAMLError;
  exports.YAMLParseError = YAMLParseError;
  exports.YAMLWarning = YAMLWarning;
  exports.prettifyError = prettifyError;
});

// node_modules/yaml/dist/compose/resolve-props.js
var require_resolve_props = __commonJS((exports) => {
  function resolveProps(tokens, { flow, indicator, next, offset, onError, parentIndent, startOnNewline }) {
    let spaceBefore = false;
    let atNewline = startOnNewline;
    let hasSpace = startOnNewline;
    let comment = "";
    let commentSep = "";
    let hasNewline = false;
    let reqSpace = false;
    let tab = null;
    let anchor = null;
    let tag = null;
    let newlineAfterProp = null;
    let comma = null;
    let found = null;
    let start = null;
    for (const token of tokens) {
      if (reqSpace) {
        if (token.type !== "space" && token.type !== "newline" && token.type !== "comma")
          onError(token.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
        reqSpace = false;
      }
      if (tab) {
        if (atNewline && token.type !== "comment" && token.type !== "newline") {
          onError(tab, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
        }
        tab = null;
      }
      switch (token.type) {
        case "space":
          if (!flow && (indicator !== "doc-start" || next?.type !== "flow-collection") && token.source.includes("\t")) {
            tab = token;
          }
          hasSpace = true;
          break;
        case "comment": {
          if (!hasSpace)
            onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
          const cb = token.source.substring(1) || " ";
          if (!comment)
            comment = cb;
          else
            comment += commentSep + cb;
          commentSep = "";
          atNewline = false;
          break;
        }
        case "newline":
          if (atNewline) {
            if (comment)
              comment += token.source;
            else if (!found || indicator !== "seq-item-ind")
              spaceBefore = true;
          } else
            commentSep += token.source;
          atNewline = true;
          hasNewline = true;
          if (anchor || tag)
            newlineAfterProp = token;
          hasSpace = true;
          break;
        case "anchor":
          if (anchor)
            onError(token, "MULTIPLE_ANCHORS", "A node can have at most one anchor");
          if (token.source.endsWith(":"))
            onError(token.offset + token.source.length - 1, "BAD_ALIAS", "Anchor ending in : is ambiguous", true);
          anchor = token;
          start ?? (start = token.offset);
          atNewline = false;
          hasSpace = false;
          reqSpace = true;
          break;
        case "tag": {
          if (tag)
            onError(token, "MULTIPLE_TAGS", "A node can have at most one tag");
          tag = token;
          start ?? (start = token.offset);
          atNewline = false;
          hasSpace = false;
          reqSpace = true;
          break;
        }
        case indicator:
          if (anchor || tag)
            onError(token, "BAD_PROP_ORDER", `Anchors and tags must be after the ${token.source} indicator`);
          if (found)
            onError(token, "UNEXPECTED_TOKEN", `Unexpected ${token.source} in ${flow ?? "collection"}`);
          found = token;
          atNewline = indicator === "seq-item-ind" || indicator === "explicit-key-ind";
          hasSpace = false;
          break;
        case "comma":
          if (flow) {
            if (comma)
              onError(token, "UNEXPECTED_TOKEN", `Unexpected , in ${flow}`);
            comma = token;
            atNewline = false;
            hasSpace = false;
            break;
          }
        default:
          onError(token, "UNEXPECTED_TOKEN", `Unexpected ${token.type} token`);
          atNewline = false;
          hasSpace = false;
      }
    }
    const last = tokens[tokens.length - 1];
    const end = last ? last.offset + last.source.length : offset;
    if (reqSpace && next && next.type !== "space" && next.type !== "newline" && next.type !== "comma" && (next.type !== "scalar" || next.source !== "")) {
      onError(next.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
    }
    if (tab && (atNewline && tab.indent <= parentIndent || next?.type === "block-map" || next?.type === "block-seq"))
      onError(tab, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
    return {
      comma,
      found,
      spaceBefore,
      comment,
      hasNewline,
      anchor,
      tag,
      newlineAfterProp,
      end,
      start: start ?? end
    };
  }
  exports.resolveProps = resolveProps;
});

// node_modules/yaml/dist/compose/util-contains-newline.js
var require_util_contains_newline = __commonJS((exports) => {
  function containsNewline(key) {
    if (!key)
      return null;
    switch (key.type) {
      case "alias":
      case "scalar":
      case "double-quoted-scalar":
      case "single-quoted-scalar":
        if (key.source.includes(`
`))
          return true;
        if (key.end) {
          for (const st of key.end)
            if (st.type === "newline")
              return true;
        }
        return false;
      case "flow-collection":
        for (const it of key.items) {
          for (const st of it.start)
            if (st.type === "newline")
              return true;
          if (it.sep) {
            for (const st of it.sep)
              if (st.type === "newline")
                return true;
          }
          if (containsNewline(it.key) || containsNewline(it.value))
            return true;
        }
        return false;
      default:
        return true;
    }
  }
  exports.containsNewline = containsNewline;
});

// node_modules/yaml/dist/compose/util-flow-indent-check.js
var require_util_flow_indent_check = __commonJS((exports) => {
  var utilContainsNewline = require_util_contains_newline();
  function flowIndentCheck(indent, fc, onError) {
    if (fc?.type === "flow-collection") {
      const end = fc.end[0];
      if (end.indent === indent && (end.source === "]" || end.source === "}") && utilContainsNewline.containsNewline(fc)) {
        const msg = "Flow end indicator should be more indented than parent";
        onError(end, "BAD_INDENT", msg, true);
      }
    }
  }
  exports.flowIndentCheck = flowIndentCheck;
});

// node_modules/yaml/dist/compose/util-map-includes.js
var require_util_map_includes = __commonJS((exports) => {
  var identity = require_identity();
  function mapIncludes(ctx, items, search) {
    const { uniqueKeys } = ctx.options;
    if (uniqueKeys === false)
      return false;
    const isEqual = typeof uniqueKeys === "function" ? uniqueKeys : (a, b) => a === b || identity.isScalar(a) && identity.isScalar(b) && a.value === b.value;
    return items.some((pair) => isEqual(pair.key, search));
  }
  exports.mapIncludes = mapIncludes;
});

// node_modules/yaml/dist/compose/resolve-block-map.js
var require_resolve_block_map = __commonJS((exports) => {
  var Pair = require_Pair();
  var YAMLMap = require_YAMLMap();
  var resolveProps = require_resolve_props();
  var utilContainsNewline = require_util_contains_newline();
  var utilFlowIndentCheck = require_util_flow_indent_check();
  var utilMapIncludes = require_util_map_includes();
  var startColMsg = "All mapping items must start at the same column";
  function resolveBlockMap({ composeNode, composeEmptyNode }, ctx, bm, onError, tag) {
    const NodeClass = tag?.nodeClass ?? YAMLMap.YAMLMap;
    const map = new NodeClass(ctx.schema);
    if (ctx.atRoot)
      ctx.atRoot = false;
    let offset = bm.offset;
    let commentEnd = null;
    for (const collItem of bm.items) {
      const { start, key, sep, value } = collItem;
      const keyProps = resolveProps.resolveProps(start, {
        indicator: "explicit-key-ind",
        next: key ?? sep?.[0],
        offset,
        onError,
        parentIndent: bm.indent,
        startOnNewline: true
      });
      const implicitKey = !keyProps.found;
      if (implicitKey) {
        if (key) {
          if (key.type === "block-seq")
            onError(offset, "BLOCK_AS_IMPLICIT_KEY", "A block sequence may not be used as an implicit map key");
          else if ("indent" in key && key.indent !== bm.indent)
            onError(offset, "BAD_INDENT", startColMsg);
        }
        if (!keyProps.anchor && !keyProps.tag && !sep) {
          commentEnd = keyProps.end;
          if (keyProps.comment) {
            if (map.comment)
              map.comment += `
` + keyProps.comment;
            else
              map.comment = keyProps.comment;
          }
          continue;
        }
        if (keyProps.newlineAfterProp || utilContainsNewline.containsNewline(key)) {
          onError(key ?? start[start.length - 1], "MULTILINE_IMPLICIT_KEY", "Implicit keys need to be on a single line");
        }
      } else if (keyProps.found?.indent !== bm.indent) {
        onError(offset, "BAD_INDENT", startColMsg);
      }
      ctx.atKey = true;
      const keyStart = keyProps.end;
      const keyNode = key ? composeNode(ctx, key, keyProps, onError) : composeEmptyNode(ctx, keyStart, start, null, keyProps, onError);
      if (ctx.schema.compat)
        utilFlowIndentCheck.flowIndentCheck(bm.indent, key, onError);
      ctx.atKey = false;
      if (utilMapIncludes.mapIncludes(ctx, map.items, keyNode))
        onError(keyStart, "DUPLICATE_KEY", "Map keys must be unique");
      const valueProps = resolveProps.resolveProps(sep ?? [], {
        indicator: "map-value-ind",
        next: value,
        offset: keyNode.range[2],
        onError,
        parentIndent: bm.indent,
        startOnNewline: !key || key.type === "block-scalar"
      });
      offset = valueProps.end;
      if (valueProps.found) {
        if (implicitKey) {
          if (value?.type === "block-map" && !valueProps.hasNewline)
            onError(offset, "BLOCK_AS_IMPLICIT_KEY", "Nested mappings are not allowed in compact mappings");
          if (ctx.options.strict && keyProps.start < valueProps.found.offset - 1024)
            onError(keyNode.range, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit block mapping key");
        }
        const valueNode = value ? composeNode(ctx, value, valueProps, onError) : composeEmptyNode(ctx, offset, sep, null, valueProps, onError);
        if (ctx.schema.compat)
          utilFlowIndentCheck.flowIndentCheck(bm.indent, value, onError);
        offset = valueNode.range[2];
        const pair = new Pair.Pair(keyNode, valueNode);
        if (ctx.options.keepSourceTokens)
          pair.srcToken = collItem;
        map.items.push(pair);
      } else {
        if (implicitKey)
          onError(keyNode.range, "MISSING_CHAR", "Implicit map keys need to be followed by map values");
        if (valueProps.comment) {
          if (keyNode.comment)
            keyNode.comment += `
` + valueProps.comment;
          else
            keyNode.comment = valueProps.comment;
        }
        const pair = new Pair.Pair(keyNode);
        if (ctx.options.keepSourceTokens)
          pair.srcToken = collItem;
        map.items.push(pair);
      }
    }
    if (commentEnd && commentEnd < offset)
      onError(commentEnd, "IMPOSSIBLE", "Map comment with trailing content");
    map.range = [bm.offset, offset, commentEnd ?? offset];
    return map;
  }
  exports.resolveBlockMap = resolveBlockMap;
});

// node_modules/yaml/dist/compose/resolve-block-seq.js
var require_resolve_block_seq = __commonJS((exports) => {
  var YAMLSeq = require_YAMLSeq();
  var resolveProps = require_resolve_props();
  var utilFlowIndentCheck = require_util_flow_indent_check();
  function resolveBlockSeq({ composeNode, composeEmptyNode }, ctx, bs, onError, tag) {
    const NodeClass = tag?.nodeClass ?? YAMLSeq.YAMLSeq;
    const seq = new NodeClass(ctx.schema);
    if (ctx.atRoot)
      ctx.atRoot = false;
    if (ctx.atKey)
      ctx.atKey = false;
    let offset = bs.offset;
    let commentEnd = null;
    for (const { start, value } of bs.items) {
      const props = resolveProps.resolveProps(start, {
        indicator: "seq-item-ind",
        next: value,
        offset,
        onError,
        parentIndent: bs.indent,
        startOnNewline: true
      });
      if (!props.found) {
        if (props.anchor || props.tag || value) {
          if (value?.type === "block-seq")
            onError(props.end, "BAD_INDENT", "All sequence items must start at the same column");
          else
            onError(offset, "MISSING_CHAR", "Sequence item without - indicator");
        } else {
          commentEnd = props.end;
          if (props.comment)
            seq.comment = props.comment;
          continue;
        }
      }
      const node = value ? composeNode(ctx, value, props, onError) : composeEmptyNode(ctx, props.end, start, null, props, onError);
      if (ctx.schema.compat)
        utilFlowIndentCheck.flowIndentCheck(bs.indent, value, onError);
      offset = node.range[2];
      seq.items.push(node);
    }
    seq.range = [bs.offset, offset, commentEnd ?? offset];
    return seq;
  }
  exports.resolveBlockSeq = resolveBlockSeq;
});

// node_modules/yaml/dist/compose/resolve-end.js
var require_resolve_end = __commonJS((exports) => {
  function resolveEnd(end, offset, reqSpace, onError) {
    let comment = "";
    if (end) {
      let hasSpace = false;
      let sep = "";
      for (const token of end) {
        const { source, type } = token;
        switch (type) {
          case "space":
            hasSpace = true;
            break;
          case "comment": {
            if (reqSpace && !hasSpace)
              onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
            const cb = source.substring(1) || " ";
            if (!comment)
              comment = cb;
            else
              comment += sep + cb;
            sep = "";
            break;
          }
          case "newline":
            if (comment)
              sep += source;
            hasSpace = true;
            break;
          default:
            onError(token, "UNEXPECTED_TOKEN", `Unexpected ${type} at node end`);
        }
        offset += source.length;
      }
    }
    return { comment, offset };
  }
  exports.resolveEnd = resolveEnd;
});

// node_modules/yaml/dist/compose/resolve-flow-collection.js
var require_resolve_flow_collection = __commonJS((exports) => {
  var identity = require_identity();
  var Pair = require_Pair();
  var YAMLMap = require_YAMLMap();
  var YAMLSeq = require_YAMLSeq();
  var resolveEnd = require_resolve_end();
  var resolveProps = require_resolve_props();
  var utilContainsNewline = require_util_contains_newline();
  var utilMapIncludes = require_util_map_includes();
  var blockMsg = "Block collections are not allowed within flow collections";
  var isBlock = (token) => token && (token.type === "block-map" || token.type === "block-seq");
  function resolveFlowCollection({ composeNode, composeEmptyNode }, ctx, fc, onError, tag) {
    const isMap = fc.start.source === "{";
    const fcName = isMap ? "flow map" : "flow sequence";
    const NodeClass = tag?.nodeClass ?? (isMap ? YAMLMap.YAMLMap : YAMLSeq.YAMLSeq);
    const coll = new NodeClass(ctx.schema);
    coll.flow = true;
    const atRoot = ctx.atRoot;
    if (atRoot)
      ctx.atRoot = false;
    if (ctx.atKey)
      ctx.atKey = false;
    let offset = fc.offset + fc.start.source.length;
    for (let i = 0;i < fc.items.length; ++i) {
      const collItem = fc.items[i];
      const { start, key, sep, value } = collItem;
      const props = resolveProps.resolveProps(start, {
        flow: fcName,
        indicator: "explicit-key-ind",
        next: key ?? sep?.[0],
        offset,
        onError,
        parentIndent: fc.indent,
        startOnNewline: false
      });
      if (!props.found) {
        if (!props.anchor && !props.tag && !sep && !value) {
          if (i === 0 && props.comma)
            onError(props.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${fcName}`);
          else if (i < fc.items.length - 1)
            onError(props.start, "UNEXPECTED_TOKEN", `Unexpected empty item in ${fcName}`);
          if (props.comment) {
            if (coll.comment)
              coll.comment += `
` + props.comment;
            else
              coll.comment = props.comment;
          }
          offset = props.end;
          continue;
        }
        if (!isMap && ctx.options.strict && utilContainsNewline.containsNewline(key))
          onError(key, "MULTILINE_IMPLICIT_KEY", "Implicit keys of flow sequence pairs need to be on a single line");
      }
      if (i === 0) {
        if (props.comma)
          onError(props.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${fcName}`);
      } else {
        if (!props.comma)
          onError(props.start, "MISSING_CHAR", `Missing , between ${fcName} items`);
        if (props.comment) {
          let prevItemComment = "";
          loop:
            for (const st of start) {
              switch (st.type) {
                case "comma":
                case "space":
                  break;
                case "comment":
                  prevItemComment = st.source.substring(1);
                  break loop;
                default:
                  break loop;
              }
            }
          if (prevItemComment) {
            let prev = coll.items[coll.items.length - 1];
            if (identity.isPair(prev))
              prev = prev.value ?? prev.key;
            if (prev.comment)
              prev.comment += `
` + prevItemComment;
            else
              prev.comment = prevItemComment;
            props.comment = props.comment.substring(prevItemComment.length + 1);
          }
        }
      }
      if (!isMap && !sep && !props.found) {
        const valueNode = value ? composeNode(ctx, value, props, onError) : composeEmptyNode(ctx, props.end, sep, null, props, onError);
        coll.items.push(valueNode);
        offset = valueNode.range[2];
        if (isBlock(value))
          onError(valueNode.range, "BLOCK_IN_FLOW", blockMsg);
      } else {
        ctx.atKey = true;
        const keyStart = props.end;
        const keyNode = key ? composeNode(ctx, key, props, onError) : composeEmptyNode(ctx, keyStart, start, null, props, onError);
        if (isBlock(key))
          onError(keyNode.range, "BLOCK_IN_FLOW", blockMsg);
        ctx.atKey = false;
        const valueProps = resolveProps.resolveProps(sep ?? [], {
          flow: fcName,
          indicator: "map-value-ind",
          next: value,
          offset: keyNode.range[2],
          onError,
          parentIndent: fc.indent,
          startOnNewline: false
        });
        if (valueProps.found) {
          if (!isMap && !props.found && ctx.options.strict) {
            if (sep)
              for (const st of sep) {
                if (st === valueProps.found)
                  break;
                if (st.type === "newline") {
                  onError(st, "MULTILINE_IMPLICIT_KEY", "Implicit keys of flow sequence pairs need to be on a single line");
                  break;
                }
              }
            if (props.start < valueProps.found.offset - 1024)
              onError(valueProps.found, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit flow sequence key");
          }
        } else if (value) {
          if ("source" in value && value.source?.[0] === ":")
            onError(value, "MISSING_CHAR", `Missing space after : in ${fcName}`);
          else
            onError(valueProps.start, "MISSING_CHAR", `Missing , or : between ${fcName} items`);
        }
        const valueNode = value ? composeNode(ctx, value, valueProps, onError) : valueProps.found ? composeEmptyNode(ctx, valueProps.end, sep, null, valueProps, onError) : null;
        if (valueNode) {
          if (isBlock(value))
            onError(valueNode.range, "BLOCK_IN_FLOW", blockMsg);
        } else if (valueProps.comment) {
          if (keyNode.comment)
            keyNode.comment += `
` + valueProps.comment;
          else
            keyNode.comment = valueProps.comment;
        }
        const pair = new Pair.Pair(keyNode, valueNode);
        if (ctx.options.keepSourceTokens)
          pair.srcToken = collItem;
        if (isMap) {
          const map = coll;
          if (utilMapIncludes.mapIncludes(ctx, map.items, keyNode))
            onError(keyStart, "DUPLICATE_KEY", "Map keys must be unique");
          map.items.push(pair);
        } else {
          const map = new YAMLMap.YAMLMap(ctx.schema);
          map.flow = true;
          map.items.push(pair);
          const endRange = (valueNode ?? keyNode).range;
          map.range = [keyNode.range[0], endRange[1], endRange[2]];
          coll.items.push(map);
        }
        offset = valueNode ? valueNode.range[2] : valueProps.end;
      }
    }
    const expectedEnd = isMap ? "}" : "]";
    const [ce, ...ee] = fc.end;
    let cePos = offset;
    if (ce?.source === expectedEnd)
      cePos = ce.offset + ce.source.length;
    else {
      const name = fcName[0].toUpperCase() + fcName.substring(1);
      const msg = atRoot ? `${name} must end with a ${expectedEnd}` : `${name} in block collection must be sufficiently indented and end with a ${expectedEnd}`;
      onError(offset, atRoot ? "MISSING_CHAR" : "BAD_INDENT", msg);
      if (ce && ce.source.length !== 1)
        ee.unshift(ce);
    }
    if (ee.length > 0) {
      const end = resolveEnd.resolveEnd(ee, cePos, ctx.options.strict, onError);
      if (end.comment) {
        if (coll.comment)
          coll.comment += `
` + end.comment;
        else
          coll.comment = end.comment;
      }
      coll.range = [fc.offset, cePos, end.offset];
    } else {
      coll.range = [fc.offset, cePos, cePos];
    }
    return coll;
  }
  exports.resolveFlowCollection = resolveFlowCollection;
});

// node_modules/yaml/dist/compose/compose-collection.js
var require_compose_collection = __commonJS((exports) => {
  var identity = require_identity();
  var Scalar = require_Scalar();
  var YAMLMap = require_YAMLMap();
  var YAMLSeq = require_YAMLSeq();
  var resolveBlockMap = require_resolve_block_map();
  var resolveBlockSeq = require_resolve_block_seq();
  var resolveFlowCollection = require_resolve_flow_collection();
  function resolveCollection(CN, ctx, token, onError, tagName, tag) {
    const coll = token.type === "block-map" ? resolveBlockMap.resolveBlockMap(CN, ctx, token, onError, tag) : token.type === "block-seq" ? resolveBlockSeq.resolveBlockSeq(CN, ctx, token, onError, tag) : resolveFlowCollection.resolveFlowCollection(CN, ctx, token, onError, tag);
    const Coll = coll.constructor;
    if (tagName === "!" || tagName === Coll.tagName) {
      coll.tag = Coll.tagName;
      return coll;
    }
    if (tagName)
      coll.tag = tagName;
    return coll;
  }
  function composeCollection(CN, ctx, token, props, onError) {
    const tagToken = props.tag;
    const tagName = !tagToken ? null : ctx.directives.tagName(tagToken.source, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg));
    if (token.type === "block-seq") {
      const { anchor, newlineAfterProp: nl } = props;
      const lastProp = anchor && tagToken ? anchor.offset > tagToken.offset ? anchor : tagToken : anchor ?? tagToken;
      if (lastProp && (!nl || nl.offset < lastProp.offset)) {
        const message = "Missing newline after block sequence props";
        onError(lastProp, "MISSING_CHAR", message);
      }
    }
    const expType = token.type === "block-map" ? "map" : token.type === "block-seq" ? "seq" : token.start.source === "{" ? "map" : "seq";
    if (!tagToken || !tagName || tagName === "!" || tagName === YAMLMap.YAMLMap.tagName && expType === "map" || tagName === YAMLSeq.YAMLSeq.tagName && expType === "seq") {
      return resolveCollection(CN, ctx, token, onError, tagName);
    }
    let tag = ctx.schema.tags.find((t) => t.tag === tagName && t.collection === expType);
    if (!tag) {
      const kt = ctx.schema.knownTags[tagName];
      if (kt?.collection === expType) {
        ctx.schema.tags.push(Object.assign({}, kt, { default: false }));
        tag = kt;
      } else {
        if (kt) {
          onError(tagToken, "BAD_COLLECTION_TYPE", `${kt.tag} used for ${expType} collection, but expects ${kt.collection ?? "scalar"}`, true);
        } else {
          onError(tagToken, "TAG_RESOLVE_FAILED", `Unresolved tag: ${tagName}`, true);
        }
        return resolveCollection(CN, ctx, token, onError, tagName);
      }
    }
    const coll = resolveCollection(CN, ctx, token, onError, tagName, tag);
    const res = tag.resolve?.(coll, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg), ctx.options) ?? coll;
    const node = identity.isNode(res) ? res : new Scalar.Scalar(res);
    node.range = coll.range;
    node.tag = tagName;
    if (tag?.format)
      node.format = tag.format;
    return node;
  }
  exports.composeCollection = composeCollection;
});

// node_modules/yaml/dist/compose/resolve-block-scalar.js
var require_resolve_block_scalar = __commonJS((exports) => {
  var Scalar = require_Scalar();
  function resolveBlockScalar(ctx, scalar, onError) {
    const start = scalar.offset;
    const header = parseBlockScalarHeader(scalar, ctx.options.strict, onError);
    if (!header)
      return { value: "", type: null, comment: "", range: [start, start, start] };
    const type = header.mode === ">" ? Scalar.Scalar.BLOCK_FOLDED : Scalar.Scalar.BLOCK_LITERAL;
    const lines = scalar.source ? splitLines(scalar.source) : [];
    let chompStart = lines.length;
    for (let i = lines.length - 1;i >= 0; --i) {
      const content = lines[i][1];
      if (content === "" || content === "\r")
        chompStart = i;
      else
        break;
    }
    if (chompStart === 0) {
      const value2 = header.chomp === "+" && lines.length > 0 ? `
`.repeat(Math.max(1, lines.length - 1)) : "";
      let end2 = start + header.length;
      if (scalar.source)
        end2 += scalar.source.length;
      return { value: value2, type, comment: header.comment, range: [start, end2, end2] };
    }
    let trimIndent = scalar.indent + header.indent;
    let offset = scalar.offset + header.length;
    let contentStart = 0;
    for (let i = 0;i < chompStart; ++i) {
      const [indent, content] = lines[i];
      if (content === "" || content === "\r") {
        if (header.indent === 0 && indent.length > trimIndent)
          trimIndent = indent.length;
      } else {
        if (indent.length < trimIndent) {
          const message = "Block scalars with more-indented leading empty lines must use an explicit indentation indicator";
          onError(offset + indent.length, "MISSING_CHAR", message);
        }
        if (header.indent === 0)
          trimIndent = indent.length;
        contentStart = i;
        if (trimIndent === 0 && !ctx.atRoot) {
          const message = "Block scalar values in collections must be indented";
          onError(offset, "BAD_INDENT", message);
        }
        break;
      }
      offset += indent.length + content.length + 1;
    }
    for (let i = lines.length - 1;i >= chompStart; --i) {
      if (lines[i][0].length > trimIndent)
        chompStart = i + 1;
    }
    let value = "";
    let sep = "";
    let prevMoreIndented = false;
    for (let i = 0;i < contentStart; ++i)
      value += lines[i][0].slice(trimIndent) + `
`;
    for (let i = contentStart;i < chompStart; ++i) {
      let [indent, content] = lines[i];
      offset += indent.length + content.length + 1;
      const crlf = content[content.length - 1] === "\r";
      if (crlf)
        content = content.slice(0, -1);
      if (content && indent.length < trimIndent) {
        const src = header.indent ? "explicit indentation indicator" : "first line";
        const message = `Block scalar lines must not be less indented than their ${src}`;
        onError(offset - content.length - (crlf ? 2 : 1), "BAD_INDENT", message);
        indent = "";
      }
      if (type === Scalar.Scalar.BLOCK_LITERAL) {
        value += sep + indent.slice(trimIndent) + content;
        sep = `
`;
      } else if (indent.length > trimIndent || content[0] === "\t") {
        if (sep === " ")
          sep = `
`;
        else if (!prevMoreIndented && sep === `
`)
          sep = `

`;
        value += sep + indent.slice(trimIndent) + content;
        sep = `
`;
        prevMoreIndented = true;
      } else if (content === "") {
        if (sep === `
`)
          value += `
`;
        else
          sep = `
`;
      } else {
        value += sep + content;
        sep = " ";
        prevMoreIndented = false;
      }
    }
    switch (header.chomp) {
      case "-":
        break;
      case "+":
        for (let i = chompStart;i < lines.length; ++i)
          value += `
` + lines[i][0].slice(trimIndent);
        if (value[value.length - 1] !== `
`)
          value += `
`;
        break;
      default:
        value += `
`;
    }
    const end = start + header.length + scalar.source.length;
    return { value, type, comment: header.comment, range: [start, end, end] };
  }
  function parseBlockScalarHeader({ offset, props }, strict, onError) {
    if (props[0].type !== "block-scalar-header") {
      onError(props[0], "IMPOSSIBLE", "Block scalar header not found");
      return null;
    }
    const { source } = props[0];
    const mode = source[0];
    let indent = 0;
    let chomp = "";
    let error = -1;
    for (let i = 1;i < source.length; ++i) {
      const ch = source[i];
      if (!chomp && (ch === "-" || ch === "+"))
        chomp = ch;
      else {
        const n = Number(ch);
        if (!indent && n)
          indent = n;
        else if (error === -1)
          error = offset + i;
      }
    }
    if (error !== -1)
      onError(error, "UNEXPECTED_TOKEN", `Block scalar header includes extra characters: ${source}`);
    let hasSpace = false;
    let comment = "";
    let length = source.length;
    for (let i = 1;i < props.length; ++i) {
      const token = props[i];
      switch (token.type) {
        case "space":
          hasSpace = true;
        case "newline":
          length += token.source.length;
          break;
        case "comment":
          if (strict && !hasSpace) {
            const message = "Comments must be separated from other tokens by white space characters";
            onError(token, "MISSING_CHAR", message);
          }
          length += token.source.length;
          comment = token.source.substring(1);
          break;
        case "error":
          onError(token, "UNEXPECTED_TOKEN", token.message);
          length += token.source.length;
          break;
        default: {
          const message = `Unexpected token in block scalar header: ${token.type}`;
          onError(token, "UNEXPECTED_TOKEN", message);
          const ts = token.source;
          if (ts && typeof ts === "string")
            length += ts.length;
        }
      }
    }
    return { mode, indent, chomp, comment, length };
  }
  function splitLines(source) {
    const split = source.split(/\n( *)/);
    const first = split[0];
    const m = first.match(/^( *)/);
    const line0 = m?.[1] ? [m[1], first.slice(m[1].length)] : ["", first];
    const lines = [line0];
    for (let i = 1;i < split.length; i += 2)
      lines.push([split[i], split[i + 1]]);
    return lines;
  }
  exports.resolveBlockScalar = resolveBlockScalar;
});

// node_modules/yaml/dist/compose/resolve-flow-scalar.js
var require_resolve_flow_scalar = __commonJS((exports) => {
  var Scalar = require_Scalar();
  var resolveEnd = require_resolve_end();
  function resolveFlowScalar(scalar, strict, onError) {
    const { offset, type, source, end } = scalar;
    let _type;
    let value;
    const _onError = (rel, code, msg) => onError(offset + rel, code, msg);
    switch (type) {
      case "scalar":
        _type = Scalar.Scalar.PLAIN;
        value = plainValue(source, _onError);
        break;
      case "single-quoted-scalar":
        _type = Scalar.Scalar.QUOTE_SINGLE;
        value = singleQuotedValue(source, _onError);
        break;
      case "double-quoted-scalar":
        _type = Scalar.Scalar.QUOTE_DOUBLE;
        value = doubleQuotedValue(source, _onError);
        break;
      default:
        onError(scalar, "UNEXPECTED_TOKEN", `Expected a flow scalar value, but found: ${type}`);
        return {
          value: "",
          type: null,
          comment: "",
          range: [offset, offset + source.length, offset + source.length]
        };
    }
    const valueEnd = offset + source.length;
    const re = resolveEnd.resolveEnd(end, valueEnd, strict, onError);
    return {
      value,
      type: _type,
      comment: re.comment,
      range: [offset, valueEnd, re.offset]
    };
  }
  function plainValue(source, onError) {
    let badChar = "";
    switch (source[0]) {
      case "\t":
        badChar = "a tab character";
        break;
      case ",":
        badChar = "flow indicator character ,";
        break;
      case "%":
        badChar = "directive indicator character %";
        break;
      case "|":
      case ">": {
        badChar = `block scalar indicator ${source[0]}`;
        break;
      }
      case "@":
      case "`": {
        badChar = `reserved character ${source[0]}`;
        break;
      }
    }
    if (badChar)
      onError(0, "BAD_SCALAR_START", `Plain value cannot start with ${badChar}`);
    return foldLines(source);
  }
  function singleQuotedValue(source, onError) {
    if (source[source.length - 1] !== "'" || source.length === 1)
      onError(source.length, "MISSING_CHAR", "Missing closing 'quote");
    return foldLines(source.slice(1, -1)).replace(/''/g, "'");
  }
  function foldLines(source) {
    let first, line;
    try {
      first = new RegExp(`(.*?)(?<![ 	])[ 	]*\r?
`, "sy");
      line = new RegExp(`[ 	]*(.*?)(?:(?<![ 	])[ 	]*)?\r?
`, "sy");
    } catch {
      first = /(.*?)[ \t]*\r?\n/sy;
      line = /[ \t]*(.*?)[ \t]*\r?\n/sy;
    }
    let match = first.exec(source);
    if (!match)
      return source;
    let res = match[1];
    let sep = " ";
    let pos = first.lastIndex;
    line.lastIndex = pos;
    while (match = line.exec(source)) {
      if (match[1] === "") {
        if (sep === `
`)
          res += sep;
        else
          sep = `
`;
      } else {
        res += sep + match[1];
        sep = " ";
      }
      pos = line.lastIndex;
    }
    const last = /[ \t]*(.*)/sy;
    last.lastIndex = pos;
    match = last.exec(source);
    return res + sep + (match?.[1] ?? "");
  }
  function doubleQuotedValue(source, onError) {
    let res = "";
    for (let i = 1;i < source.length - 1; ++i) {
      const ch = source[i];
      if (ch === "\r" && source[i + 1] === `
`)
        continue;
      if (ch === `
`) {
        const { fold, offset } = foldNewline(source, i);
        res += fold;
        i = offset;
      } else if (ch === "\\") {
        let next = source[++i];
        const cc = escapeCodes[next];
        if (cc)
          res += cc;
        else if (next === `
`) {
          next = source[i + 1];
          while (next === " " || next === "\t")
            next = source[++i + 1];
        } else if (next === "\r" && source[i + 1] === `
`) {
          next = source[++i + 1];
          while (next === " " || next === "\t")
            next = source[++i + 1];
        } else if (next === "x" || next === "u" || next === "U") {
          const length = { x: 2, u: 4, U: 8 }[next];
          res += parseCharCode(source, i + 1, length, onError);
          i += length;
        } else {
          const raw = source.substr(i - 1, 2);
          onError(i - 1, "BAD_DQ_ESCAPE", `Invalid escape sequence ${raw}`);
          res += raw;
        }
      } else if (ch === " " || ch === "\t") {
        const wsStart = i;
        let next = source[i + 1];
        while (next === " " || next === "\t")
          next = source[++i + 1];
        if (next !== `
` && !(next === "\r" && source[i + 2] === `
`))
          res += i > wsStart ? source.slice(wsStart, i + 1) : ch;
      } else {
        res += ch;
      }
    }
    if (source[source.length - 1] !== '"' || source.length === 1)
      onError(source.length, "MISSING_CHAR", 'Missing closing "quote');
    return res;
  }
  function foldNewline(source, offset) {
    let fold = "";
    let ch = source[offset + 1];
    while (ch === " " || ch === "\t" || ch === `
` || ch === "\r") {
      if (ch === "\r" && source[offset + 2] !== `
`)
        break;
      if (ch === `
`)
        fold += `
`;
      offset += 1;
      ch = source[offset + 1];
    }
    if (!fold)
      fold = " ";
    return { fold, offset };
  }
  var escapeCodes = {
    "0": "\x00",
    a: "\x07",
    b: "\b",
    e: "\x1B",
    f: "\f",
    n: `
`,
    r: "\r",
    t: "\t",
    v: "\v",
    N: "",
    _: " ",
    L: "\u2028",
    P: "\u2029",
    " ": " ",
    '"': '"',
    "/": "/",
    "\\": "\\",
    "\t": "\t"
  };
  function parseCharCode(source, offset, length, onError) {
    const cc = source.substr(offset, length);
    const ok = cc.length === length && /^[0-9a-fA-F]+$/.test(cc);
    const code = ok ? parseInt(cc, 16) : NaN;
    if (isNaN(code)) {
      const raw = source.substr(offset - 2, length + 2);
      onError(offset - 2, "BAD_DQ_ESCAPE", `Invalid escape sequence ${raw}`);
      return raw;
    }
    return String.fromCodePoint(code);
  }
  exports.resolveFlowScalar = resolveFlowScalar;
});

// node_modules/yaml/dist/compose/compose-scalar.js
var require_compose_scalar = __commonJS((exports) => {
  var identity = require_identity();
  var Scalar = require_Scalar();
  var resolveBlockScalar = require_resolve_block_scalar();
  var resolveFlowScalar = require_resolve_flow_scalar();
  function composeScalar(ctx, token, tagToken, onError) {
    const { value, type, comment, range } = token.type === "block-scalar" ? resolveBlockScalar.resolveBlockScalar(ctx, token, onError) : resolveFlowScalar.resolveFlowScalar(token, ctx.options.strict, onError);
    const tagName = tagToken ? ctx.directives.tagName(tagToken.source, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg)) : null;
    let tag;
    if (ctx.options.stringKeys && ctx.atKey) {
      tag = ctx.schema[identity.SCALAR];
    } else if (tagName)
      tag = findScalarTagByName(ctx.schema, value, tagName, tagToken, onError);
    else if (token.type === "scalar")
      tag = findScalarTagByTest(ctx, value, token, onError);
    else
      tag = ctx.schema[identity.SCALAR];
    let scalar;
    try {
      const res = tag.resolve(value, (msg) => onError(tagToken ?? token, "TAG_RESOLVE_FAILED", msg), ctx.options);
      scalar = identity.isScalar(res) ? res : new Scalar.Scalar(res);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      onError(tagToken ?? token, "TAG_RESOLVE_FAILED", msg);
      scalar = new Scalar.Scalar(value);
    }
    scalar.range = range;
    scalar.source = value;
    if (type)
      scalar.type = type;
    if (tagName)
      scalar.tag = tagName;
    if (tag.format)
      scalar.format = tag.format;
    if (comment)
      scalar.comment = comment;
    return scalar;
  }
  function findScalarTagByName(schema, value, tagName, tagToken, onError) {
    if (tagName === "!")
      return schema[identity.SCALAR];
    const matchWithTest = [];
    for (const tag of schema.tags) {
      if (!tag.collection && tag.tag === tagName) {
        if (tag.default && tag.test)
          matchWithTest.push(tag);
        else
          return tag;
      }
    }
    for (const tag of matchWithTest)
      if (tag.test?.test(value))
        return tag;
    const kt = schema.knownTags[tagName];
    if (kt && !kt.collection) {
      schema.tags.push(Object.assign({}, kt, { default: false, test: undefined }));
      return kt;
    }
    onError(tagToken, "TAG_RESOLVE_FAILED", `Unresolved tag: ${tagName}`, tagName !== "tag:yaml.org,2002:str");
    return schema[identity.SCALAR];
  }
  function findScalarTagByTest({ atKey, directives, schema }, value, token, onError) {
    const tag = schema.tags.find((tag2) => (tag2.default === true || atKey && tag2.default === "key") && tag2.test?.test(value)) || schema[identity.SCALAR];
    if (schema.compat) {
      const compat = schema.compat.find((tag2) => tag2.default && tag2.test?.test(value)) ?? schema[identity.SCALAR];
      if (tag.tag !== compat.tag) {
        const ts = directives.tagString(tag.tag);
        const cs = directives.tagString(compat.tag);
        const msg = `Value may be parsed as either ${ts} or ${cs}`;
        onError(token, "TAG_RESOLVE_FAILED", msg, true);
      }
    }
    return tag;
  }
  exports.composeScalar = composeScalar;
});

// node_modules/yaml/dist/compose/util-empty-scalar-position.js
var require_util_empty_scalar_position = __commonJS((exports) => {
  function emptyScalarPosition(offset, before, pos) {
    if (before) {
      pos ?? (pos = before.length);
      for (let i = pos - 1;i >= 0; --i) {
        let st = before[i];
        switch (st.type) {
          case "space":
          case "comment":
          case "newline":
            offset -= st.source.length;
            continue;
        }
        st = before[++i];
        while (st?.type === "space") {
          offset += st.source.length;
          st = before[++i];
        }
        break;
      }
    }
    return offset;
  }
  exports.emptyScalarPosition = emptyScalarPosition;
});

// node_modules/yaml/dist/compose/compose-node.js
var require_compose_node = __commonJS((exports) => {
  var Alias = require_Alias();
  var identity = require_identity();
  var composeCollection = require_compose_collection();
  var composeScalar = require_compose_scalar();
  var resolveEnd = require_resolve_end();
  var utilEmptyScalarPosition = require_util_empty_scalar_position();
  var CN = { composeNode, composeEmptyNode };
  function composeNode(ctx, token, props, onError) {
    const atKey = ctx.atKey;
    const { spaceBefore, comment, anchor, tag } = props;
    let node;
    let isSrcToken = true;
    switch (token.type) {
      case "alias":
        node = composeAlias(ctx, token, onError);
        if (anchor || tag)
          onError(token, "ALIAS_PROPS", "An alias node must not specify any properties");
        break;
      case "scalar":
      case "single-quoted-scalar":
      case "double-quoted-scalar":
      case "block-scalar":
        node = composeScalar.composeScalar(ctx, token, tag, onError);
        if (anchor)
          node.anchor = anchor.source.substring(1);
        break;
      case "block-map":
      case "block-seq":
      case "flow-collection":
        try {
          node = composeCollection.composeCollection(CN, ctx, token, props, onError);
          if (anchor)
            node.anchor = anchor.source.substring(1);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          onError(token, "RESOURCE_EXHAUSTION", message);
        }
        break;
      default: {
        const message = token.type === "error" ? token.message : `Unsupported token (type: ${token.type})`;
        onError(token, "UNEXPECTED_TOKEN", message);
        isSrcToken = false;
      }
    }
    node ?? (node = composeEmptyNode(ctx, token.offset, undefined, null, props, onError));
    if (anchor && node.anchor === "")
      onError(anchor, "BAD_ALIAS", "Anchor cannot be an empty string");
    if (atKey && ctx.options.stringKeys && (!identity.isScalar(node) || typeof node.value !== "string" || node.tag && node.tag !== "tag:yaml.org,2002:str")) {
      const msg = "With stringKeys, all keys must be strings";
      onError(tag ?? token, "NON_STRING_KEY", msg);
    }
    if (spaceBefore)
      node.spaceBefore = true;
    if (comment) {
      if (token.type === "scalar" && token.source === "")
        node.comment = comment;
      else
        node.commentBefore = comment;
    }
    if (ctx.options.keepSourceTokens && isSrcToken)
      node.srcToken = token;
    return node;
  }
  function composeEmptyNode(ctx, offset, before, pos, { spaceBefore, comment, anchor, tag, end }, onError) {
    const token = {
      type: "scalar",
      offset: utilEmptyScalarPosition.emptyScalarPosition(offset, before, pos),
      indent: -1,
      source: ""
    };
    const node = composeScalar.composeScalar(ctx, token, tag, onError);
    if (anchor) {
      node.anchor = anchor.source.substring(1);
      if (node.anchor === "")
        onError(anchor, "BAD_ALIAS", "Anchor cannot be an empty string");
    }
    if (spaceBefore)
      node.spaceBefore = true;
    if (comment) {
      node.comment = comment;
      node.range[2] = end;
    }
    return node;
  }
  function composeAlias({ options }, { offset, source, end }, onError) {
    const alias = new Alias.Alias(source.substring(1));
    if (alias.source === "")
      onError(offset, "BAD_ALIAS", "Alias cannot be an empty string");
    if (alias.source.endsWith(":"))
      onError(offset + source.length - 1, "BAD_ALIAS", "Alias ending in : is ambiguous", true);
    const valueEnd = offset + source.length;
    const re = resolveEnd.resolveEnd(end, valueEnd, options.strict, onError);
    alias.range = [offset, valueEnd, re.offset];
    if (re.comment)
      alias.comment = re.comment;
    return alias;
  }
  exports.composeEmptyNode = composeEmptyNode;
  exports.composeNode = composeNode;
});

// node_modules/yaml/dist/compose/compose-doc.js
var require_compose_doc = __commonJS((exports) => {
  var Document = require_Document();
  var composeNode = require_compose_node();
  var resolveEnd = require_resolve_end();
  var resolveProps = require_resolve_props();
  function composeDoc(options, directives, { offset, start, value, end }, onError) {
    const opts = Object.assign({ _directives: directives }, options);
    const doc = new Document.Document(undefined, opts);
    const ctx = {
      atKey: false,
      atRoot: true,
      directives: doc.directives,
      options: doc.options,
      schema: doc.schema
    };
    const props = resolveProps.resolveProps(start, {
      indicator: "doc-start",
      next: value ?? end?.[0],
      offset,
      onError,
      parentIndent: 0,
      startOnNewline: true
    });
    if (props.found) {
      doc.directives.docStart = true;
      if (value && (value.type === "block-map" || value.type === "block-seq") && !props.hasNewline)
        onError(props.end, "MISSING_CHAR", "Block collection cannot start on same line with directives-end marker");
    }
    doc.contents = value ? composeNode.composeNode(ctx, value, props, onError) : composeNode.composeEmptyNode(ctx, props.end, start, null, props, onError);
    const contentEnd = doc.contents.range[2];
    const re = resolveEnd.resolveEnd(end, contentEnd, false, onError);
    if (re.comment)
      doc.comment = re.comment;
    doc.range = [offset, contentEnd, re.offset];
    return doc;
  }
  exports.composeDoc = composeDoc;
});

// node_modules/yaml/dist/compose/composer.js
var require_composer = __commonJS((exports) => {
  var node_process = __require("process");
  var directives = require_directives();
  var Document = require_Document();
  var errors = require_errors();
  var identity = require_identity();
  var composeDoc = require_compose_doc();
  var resolveEnd = require_resolve_end();
  function getErrorPos(src) {
    if (typeof src === "number")
      return [src, src + 1];
    if (Array.isArray(src))
      return src.length === 2 ? src : [src[0], src[1]];
    const { offset, source } = src;
    return [offset, offset + (typeof source === "string" ? source.length : 1)];
  }
  function parsePrelude(prelude) {
    let comment = "";
    let atComment = false;
    let afterEmptyLine = false;
    for (let i = 0;i < prelude.length; ++i) {
      const source = prelude[i];
      switch (source[0]) {
        case "#":
          comment += (comment === "" ? "" : afterEmptyLine ? `

` : `
`) + (source.substring(1) || " ");
          atComment = true;
          afterEmptyLine = false;
          break;
        case "%":
          if (prelude[i + 1]?.[0] !== "#")
            i += 1;
          atComment = false;
          break;
        default:
          if (!atComment)
            afterEmptyLine = true;
          atComment = false;
      }
    }
    return { comment, afterEmptyLine };
  }

  class Composer {
    constructor(options = {}) {
      this.doc = null;
      this.atDirectives = false;
      this.prelude = [];
      this.errors = [];
      this.warnings = [];
      this.onError = (source, code, message, warning) => {
        const pos = getErrorPos(source);
        if (warning)
          this.warnings.push(new errors.YAMLWarning(pos, code, message));
        else
          this.errors.push(new errors.YAMLParseError(pos, code, message));
      };
      this.directives = new directives.Directives({ version: options.version || "1.2" });
      this.options = options;
    }
    decorate(doc, afterDoc) {
      const { comment, afterEmptyLine } = parsePrelude(this.prelude);
      if (comment) {
        const dc = doc.contents;
        if (afterDoc) {
          doc.comment = doc.comment ? `${doc.comment}
${comment}` : comment;
        } else if (afterEmptyLine || doc.directives.docStart || !dc) {
          doc.commentBefore = comment;
        } else if (identity.isCollection(dc) && !dc.flow && dc.items.length > 0) {
          let it = dc.items[0];
          if (identity.isPair(it))
            it = it.key;
          const cb = it.commentBefore;
          it.commentBefore = cb ? `${comment}
${cb}` : comment;
        } else {
          const cb = dc.commentBefore;
          dc.commentBefore = cb ? `${comment}
${cb}` : comment;
        }
      }
      if (afterDoc) {
        Array.prototype.push.apply(doc.errors, this.errors);
        Array.prototype.push.apply(doc.warnings, this.warnings);
      } else {
        doc.errors = this.errors;
        doc.warnings = this.warnings;
      }
      this.prelude = [];
      this.errors = [];
      this.warnings = [];
    }
    streamInfo() {
      return {
        comment: parsePrelude(this.prelude).comment,
        directives: this.directives,
        errors: this.errors,
        warnings: this.warnings
      };
    }
    *compose(tokens, forceDoc = false, endOffset = -1) {
      for (const token of tokens)
        yield* this.next(token);
      yield* this.end(forceDoc, endOffset);
    }
    *next(token) {
      if (node_process.env.LOG_STREAM)
        console.dir(token, { depth: null });
      switch (token.type) {
        case "directive":
          this.directives.add(token.source, (offset, message, warning) => {
            const pos = getErrorPos(token);
            pos[0] += offset;
            this.onError(pos, "BAD_DIRECTIVE", message, warning);
          });
          this.prelude.push(token.source);
          this.atDirectives = true;
          break;
        case "document": {
          const doc = composeDoc.composeDoc(this.options, this.directives, token, this.onError);
          if (this.atDirectives && !doc.directives.docStart)
            this.onError(token, "MISSING_CHAR", "Missing directives-end/doc-start indicator line");
          this.decorate(doc, false);
          if (this.doc)
            yield this.doc;
          this.doc = doc;
          this.atDirectives = false;
          break;
        }
        case "byte-order-mark":
        case "space":
          break;
        case "comment":
        case "newline":
          this.prelude.push(token.source);
          break;
        case "error": {
          const msg = token.source ? `${token.message}: ${JSON.stringify(token.source)}` : token.message;
          const error = new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", msg);
          if (this.atDirectives || !this.doc)
            this.errors.push(error);
          else
            this.doc.errors.push(error);
          break;
        }
        case "doc-end": {
          if (!this.doc) {
            const msg = "Unexpected doc-end without preceding document";
            this.errors.push(new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", msg));
            break;
          }
          this.doc.directives.docEnd = true;
          const end = resolveEnd.resolveEnd(token.end, token.offset + token.source.length, this.doc.options.strict, this.onError);
          this.decorate(this.doc, true);
          if (end.comment) {
            const dc = this.doc.comment;
            this.doc.comment = dc ? `${dc}
${end.comment}` : end.comment;
          }
          this.doc.range[2] = end.offset;
          break;
        }
        default:
          this.errors.push(new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", `Unsupported token ${token.type}`));
      }
    }
    *end(forceDoc = false, endOffset = -1) {
      if (this.doc) {
        this.decorate(this.doc, true);
        yield this.doc;
        this.doc = null;
      } else if (forceDoc) {
        const opts = Object.assign({ _directives: this.directives }, this.options);
        const doc = new Document.Document(undefined, opts);
        if (this.atDirectives)
          this.onError(endOffset, "MISSING_CHAR", "Missing directives-end indicator line");
        doc.range = [0, endOffset, endOffset];
        this.decorate(doc, false);
        yield doc;
      }
    }
  }
  exports.Composer = Composer;
});

// node_modules/yaml/dist/parse/cst-scalar.js
var require_cst_scalar = __commonJS((exports) => {
  var resolveBlockScalar = require_resolve_block_scalar();
  var resolveFlowScalar = require_resolve_flow_scalar();
  var errors = require_errors();
  var stringifyString = require_stringifyString();
  function resolveAsScalar(token, strict = true, onError) {
    if (token) {
      const _onError = (pos, code, message) => {
        const offset = typeof pos === "number" ? pos : Array.isArray(pos) ? pos[0] : pos.offset;
        if (onError)
          onError(offset, code, message);
        else
          throw new errors.YAMLParseError([offset, offset + 1], code, message);
      };
      switch (token.type) {
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
          return resolveFlowScalar.resolveFlowScalar(token, strict, _onError);
        case "block-scalar":
          return resolveBlockScalar.resolveBlockScalar({ options: { strict } }, token, _onError);
      }
    }
    return null;
  }
  function createScalarToken(value, context) {
    const { implicitKey = false, indent, inFlow = false, offset = -1, type = "PLAIN" } = context;
    const source = stringifyString.stringifyString({ type, value }, {
      implicitKey,
      indent: indent > 0 ? " ".repeat(indent) : "",
      inFlow,
      options: { blockQuote: true, lineWidth: -1 }
    });
    const end = context.end ?? [
      { type: "newline", offset: -1, indent, source: `
` }
    ];
    switch (source[0]) {
      case "|":
      case ">": {
        const he = source.indexOf(`
`);
        const head = source.substring(0, he);
        const body = source.substring(he + 1) + `
`;
        const props = [
          { type: "block-scalar-header", offset, indent, source: head }
        ];
        if (!addEndtoBlockProps(props, end))
          props.push({ type: "newline", offset: -1, indent, source: `
` });
        return { type: "block-scalar", offset, indent, props, source: body };
      }
      case '"':
        return { type: "double-quoted-scalar", offset, indent, source, end };
      case "'":
        return { type: "single-quoted-scalar", offset, indent, source, end };
      default:
        return { type: "scalar", offset, indent, source, end };
    }
  }
  function setScalarValue(token, value, context = {}) {
    let { afterKey = false, implicitKey = false, inFlow = false, type } = context;
    let indent = "indent" in token ? token.indent : null;
    if (afterKey && typeof indent === "number")
      indent += 2;
    if (!type)
      switch (token.type) {
        case "single-quoted-scalar":
          type = "QUOTE_SINGLE";
          break;
        case "double-quoted-scalar":
          type = "QUOTE_DOUBLE";
          break;
        case "block-scalar": {
          const header = token.props[0];
          if (header.type !== "block-scalar-header")
            throw new Error("Invalid block scalar header");
          type = header.source[0] === ">" ? "BLOCK_FOLDED" : "BLOCK_LITERAL";
          break;
        }
        default:
          type = "PLAIN";
      }
    const source = stringifyString.stringifyString({ type, value }, {
      implicitKey: implicitKey || indent === null,
      indent: indent !== null && indent > 0 ? " ".repeat(indent) : "",
      inFlow,
      options: { blockQuote: true, lineWidth: -1 }
    });
    switch (source[0]) {
      case "|":
      case ">":
        setBlockScalarValue(token, source);
        break;
      case '"':
        setFlowScalarValue(token, source, "double-quoted-scalar");
        break;
      case "'":
        setFlowScalarValue(token, source, "single-quoted-scalar");
        break;
      default:
        setFlowScalarValue(token, source, "scalar");
    }
  }
  function setBlockScalarValue(token, source) {
    const he = source.indexOf(`
`);
    const head = source.substring(0, he);
    const body = source.substring(he + 1) + `
`;
    if (token.type === "block-scalar") {
      const header = token.props[0];
      if (header.type !== "block-scalar-header")
        throw new Error("Invalid block scalar header");
      header.source = head;
      token.source = body;
    } else {
      const { offset } = token;
      const indent = "indent" in token ? token.indent : -1;
      const props = [
        { type: "block-scalar-header", offset, indent, source: head }
      ];
      if (!addEndtoBlockProps(props, "end" in token ? token.end : undefined))
        props.push({ type: "newline", offset: -1, indent, source: `
` });
      for (const key of Object.keys(token))
        if (key !== "type" && key !== "offset")
          delete token[key];
      Object.assign(token, { type: "block-scalar", indent, props, source: body });
    }
  }
  function addEndtoBlockProps(props, end) {
    if (end)
      for (const st of end)
        switch (st.type) {
          case "space":
          case "comment":
            props.push(st);
            break;
          case "newline":
            props.push(st);
            return true;
        }
    return false;
  }
  function setFlowScalarValue(token, source, type) {
    switch (token.type) {
      case "scalar":
      case "double-quoted-scalar":
      case "single-quoted-scalar":
        token.type = type;
        token.source = source;
        break;
      case "block-scalar": {
        const end = token.props.slice(1);
        let oa = source.length;
        if (token.props[0].type === "block-scalar-header")
          oa -= token.props[0].source.length;
        for (const tok of end)
          tok.offset += oa;
        delete token.props;
        Object.assign(token, { type, source, end });
        break;
      }
      case "block-map":
      case "block-seq": {
        const offset = token.offset + source.length;
        const nl = { type: "newline", offset, indent: token.indent, source: `
` };
        delete token.items;
        Object.assign(token, { type, source, end: [nl] });
        break;
      }
      default: {
        const indent = "indent" in token ? token.indent : -1;
        const end = "end" in token && Array.isArray(token.end) ? token.end.filter((st) => st.type === "space" || st.type === "comment" || st.type === "newline") : [];
        for (const key of Object.keys(token))
          if (key !== "type" && key !== "offset")
            delete token[key];
        Object.assign(token, { type, indent, source, end });
      }
    }
  }
  exports.createScalarToken = createScalarToken;
  exports.resolveAsScalar = resolveAsScalar;
  exports.setScalarValue = setScalarValue;
});

// node_modules/yaml/dist/parse/cst-stringify.js
var require_cst_stringify = __commonJS((exports) => {
  var stringify = (cst) => ("type" in cst) ? stringifyToken(cst) : stringifyItem(cst);
  function stringifyToken(token) {
    switch (token.type) {
      case "block-scalar": {
        let res = "";
        for (const tok of token.props)
          res += stringifyToken(tok);
        return res + token.source;
      }
      case "block-map":
      case "block-seq": {
        let res = "";
        for (const item of token.items)
          res += stringifyItem(item);
        return res;
      }
      case "flow-collection": {
        let res = token.start.source;
        for (const item of token.items)
          res += stringifyItem(item);
        for (const st of token.end)
          res += st.source;
        return res;
      }
      case "document": {
        let res = stringifyItem(token);
        if (token.end)
          for (const st of token.end)
            res += st.source;
        return res;
      }
      default: {
        let res = token.source;
        if ("end" in token && token.end)
          for (const st of token.end)
            res += st.source;
        return res;
      }
    }
  }
  function stringifyItem({ start, key, sep, value }) {
    let res = "";
    for (const st of start)
      res += st.source;
    if (key)
      res += stringifyToken(key);
    if (sep)
      for (const st of sep)
        res += st.source;
    if (value)
      res += stringifyToken(value);
    return res;
  }
  exports.stringify = stringify;
});

// node_modules/yaml/dist/parse/cst-visit.js
var require_cst_visit = __commonJS((exports) => {
  var BREAK = Symbol("break visit");
  var SKIP = Symbol("skip children");
  var REMOVE = Symbol("remove item");
  function visit(cst, visitor) {
    if ("type" in cst && cst.type === "document")
      cst = { start: cst.start, value: cst.value };
    _visit(Object.freeze([]), cst, visitor);
  }
  visit.BREAK = BREAK;
  visit.SKIP = SKIP;
  visit.REMOVE = REMOVE;
  visit.itemAtPath = (cst, path) => {
    let item = cst;
    for (const [field, index] of path) {
      const tok = item?.[field];
      if (tok && "items" in tok) {
        item = tok.items[index];
      } else
        return;
    }
    return item;
  };
  visit.parentCollection = (cst, path) => {
    const parent = visit.itemAtPath(cst, path.slice(0, -1));
    const field = path[path.length - 1][0];
    const coll = parent?.[field];
    if (coll && "items" in coll)
      return coll;
    throw new Error("Parent collection not found");
  };
  function _visit(path, item, visitor) {
    let ctrl = visitor(item, path);
    if (typeof ctrl === "symbol")
      return ctrl;
    for (const field of ["key", "value"]) {
      const token = item[field];
      if (token && "items" in token) {
        for (let i = 0;i < token.items.length; ++i) {
          const ci = _visit(Object.freeze(path.concat([[field, i]])), token.items[i], visitor);
          if (typeof ci === "number")
            i = ci - 1;
          else if (ci === BREAK)
            return BREAK;
          else if (ci === REMOVE) {
            token.items.splice(i, 1);
            i -= 1;
          }
        }
        if (typeof ctrl === "function" && field === "key")
          ctrl = ctrl(item, path);
      }
    }
    return typeof ctrl === "function" ? ctrl(item, path) : ctrl;
  }
  exports.visit = visit;
});

// node_modules/yaml/dist/parse/cst.js
var require_cst = __commonJS((exports) => {
  var cstScalar = require_cst_scalar();
  var cstStringify = require_cst_stringify();
  var cstVisit = require_cst_visit();
  var BOM = "\uFEFF";
  var DOCUMENT = "\x02";
  var FLOW_END = "\x18";
  var SCALAR = "\x1F";
  var isCollection = (token) => !!token && ("items" in token);
  var isScalar = (token) => !!token && (token.type === "scalar" || token.type === "single-quoted-scalar" || token.type === "double-quoted-scalar" || token.type === "block-scalar");
  function prettyToken(token) {
    switch (token) {
      case BOM:
        return "<BOM>";
      case DOCUMENT:
        return "<DOC>";
      case FLOW_END:
        return "<FLOW_END>";
      case SCALAR:
        return "<SCALAR>";
      default:
        return JSON.stringify(token);
    }
  }
  function tokenType(source) {
    switch (source) {
      case BOM:
        return "byte-order-mark";
      case DOCUMENT:
        return "doc-mode";
      case FLOW_END:
        return "flow-error-end";
      case SCALAR:
        return "scalar";
      case "---":
        return "doc-start";
      case "...":
        return "doc-end";
      case "":
      case `
`:
      case `\r
`:
        return "newline";
      case "-":
        return "seq-item-ind";
      case "?":
        return "explicit-key-ind";
      case ":":
        return "map-value-ind";
      case "{":
        return "flow-map-start";
      case "}":
        return "flow-map-end";
      case "[":
        return "flow-seq-start";
      case "]":
        return "flow-seq-end";
      case ",":
        return "comma";
    }
    switch (source[0]) {
      case " ":
      case "\t":
        return "space";
      case "#":
        return "comment";
      case "%":
        return "directive-line";
      case "*":
        return "alias";
      case "&":
        return "anchor";
      case "!":
        return "tag";
      case "'":
        return "single-quoted-scalar";
      case '"':
        return "double-quoted-scalar";
      case "|":
      case ">":
        return "block-scalar-header";
    }
    return null;
  }
  exports.createScalarToken = cstScalar.createScalarToken;
  exports.resolveAsScalar = cstScalar.resolveAsScalar;
  exports.setScalarValue = cstScalar.setScalarValue;
  exports.stringify = cstStringify.stringify;
  exports.visit = cstVisit.visit;
  exports.BOM = BOM;
  exports.DOCUMENT = DOCUMENT;
  exports.FLOW_END = FLOW_END;
  exports.SCALAR = SCALAR;
  exports.isCollection = isCollection;
  exports.isScalar = isScalar;
  exports.prettyToken = prettyToken;
  exports.tokenType = tokenType;
});

// node_modules/yaml/dist/parse/lexer.js
var require_lexer = __commonJS((exports) => {
  var cst = require_cst();
  function isEmpty(ch) {
    switch (ch) {
      case undefined:
      case " ":
      case `
`:
      case "\r":
      case "\t":
        return true;
      default:
        return false;
    }
  }
  var hexDigits = new Set("0123456789ABCDEFabcdef");
  var tagChars = new Set("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-#;/?:@&=+$_.!~*'()");
  var flowIndicatorChars = new Set(",[]{}");
  var invalidAnchorChars = new Set(` ,[]{}
\r	`);
  var isNotAnchorChar = (ch) => !ch || invalidAnchorChars.has(ch);

  class Lexer {
    constructor() {
      this.atEnd = false;
      this.blockScalarIndent = -1;
      this.blockScalarKeep = false;
      this.buffer = "";
      this.flowKey = false;
      this.flowLevel = 0;
      this.indentNext = 0;
      this.indentValue = 0;
      this.lineEndPos = null;
      this.next = null;
      this.pos = 0;
    }
    *lex(source, incomplete = false) {
      if (source) {
        if (typeof source !== "string")
          throw TypeError("source is not a string");
        this.buffer = this.buffer ? this.buffer + source : source;
        this.lineEndPos = null;
      }
      this.atEnd = !incomplete;
      let next = this.next ?? "stream";
      while (next && (incomplete || this.hasChars(1)))
        next = yield* this.parseNext(next);
    }
    atLineEnd() {
      let i = this.pos;
      let ch = this.buffer[i];
      while (ch === " " || ch === "\t")
        ch = this.buffer[++i];
      if (!ch || ch === "#" || ch === `
`)
        return true;
      if (ch === "\r")
        return this.buffer[i + 1] === `
`;
      return false;
    }
    charAt(n) {
      return this.buffer[this.pos + n];
    }
    continueScalar(offset) {
      let ch = this.buffer[offset];
      if (this.indentNext > 0) {
        let indent = 0;
        while (ch === " ")
          ch = this.buffer[++indent + offset];
        if (ch === "\r") {
          const next = this.buffer[indent + offset + 1];
          if (next === `
` || !next && !this.atEnd)
            return offset + indent + 1;
        }
        return ch === `
` || indent >= this.indentNext || !ch && !this.atEnd ? offset + indent : -1;
      }
      if (ch === "-" || ch === ".") {
        const dt = this.buffer.substr(offset, 3);
        if ((dt === "---" || dt === "...") && isEmpty(this.buffer[offset + 3]))
          return -1;
      }
      return offset;
    }
    getLine() {
      let end = this.lineEndPos;
      if (typeof end !== "number" || end !== -1 && end < this.pos) {
        end = this.buffer.indexOf(`
`, this.pos);
        this.lineEndPos = end;
      }
      if (end === -1)
        return this.atEnd ? this.buffer.substring(this.pos) : null;
      if (this.buffer[end - 1] === "\r")
        end -= 1;
      return this.buffer.substring(this.pos, end);
    }
    hasChars(n) {
      return this.pos + n <= this.buffer.length;
    }
    setNext(state) {
      this.buffer = this.buffer.substring(this.pos);
      this.pos = 0;
      this.lineEndPos = null;
      this.next = state;
      return null;
    }
    peek(n) {
      return this.buffer.substr(this.pos, n);
    }
    *parseNext(next) {
      switch (next) {
        case "stream":
          return yield* this.parseStream();
        case "line-start":
          return yield* this.parseLineStart();
        case "block-start":
          return yield* this.parseBlockStart();
        case "doc":
          return yield* this.parseDocument();
        case "flow":
          return yield* this.parseFlowCollection();
        case "quoted-scalar":
          return yield* this.parseQuotedScalar();
        case "block-scalar":
          return yield* this.parseBlockScalar();
        case "plain-scalar":
          return yield* this.parsePlainScalar();
      }
    }
    *parseStream() {
      let line = this.getLine();
      if (line === null)
        return this.setNext("stream");
      if (line[0] === cst.BOM) {
        yield* this.pushCount(1);
        line = line.substring(1);
      }
      if (line[0] === "%") {
        let dirEnd = line.length;
        let cs = line.indexOf("#");
        while (cs !== -1) {
          const ch = line[cs - 1];
          if (ch === " " || ch === "\t") {
            dirEnd = cs - 1;
            break;
          } else {
            cs = line.indexOf("#", cs + 1);
          }
        }
        while (true) {
          const ch = line[dirEnd - 1];
          if (ch === " " || ch === "\t")
            dirEnd -= 1;
          else
            break;
        }
        const n = (yield* this.pushCount(dirEnd)) + (yield* this.pushSpaces(true));
        yield* this.pushCount(line.length - n);
        this.pushNewline();
        return "stream";
      }
      if (this.atLineEnd()) {
        const sp = yield* this.pushSpaces(true);
        yield* this.pushCount(line.length - sp);
        yield* this.pushNewline();
        return "stream";
      }
      yield cst.DOCUMENT;
      return yield* this.parseLineStart();
    }
    *parseLineStart() {
      const ch = this.charAt(0);
      if (!ch && !this.atEnd)
        return this.setNext("line-start");
      if (ch === "-" || ch === ".") {
        if (!this.atEnd && !this.hasChars(4))
          return this.setNext("line-start");
        const s = this.peek(3);
        if ((s === "---" || s === "...") && isEmpty(this.charAt(3))) {
          yield* this.pushCount(3);
          this.indentValue = 0;
          this.indentNext = 0;
          return s === "---" ? "doc" : "stream";
        }
      }
      this.indentValue = yield* this.pushSpaces(false);
      if (this.indentNext > this.indentValue && !isEmpty(this.charAt(1)))
        this.indentNext = this.indentValue;
      return yield* this.parseBlockStart();
    }
    *parseBlockStart() {
      const [ch0, ch1] = this.peek(2);
      if (!ch1 && !this.atEnd)
        return this.setNext("block-start");
      if ((ch0 === "-" || ch0 === "?" || ch0 === ":") && isEmpty(ch1)) {
        const n = (yield* this.pushCount(1)) + (yield* this.pushSpaces(true));
        this.indentNext = this.indentValue + 1;
        this.indentValue += n;
        return yield* this.parseBlockStart();
      }
      return "doc";
    }
    *parseDocument() {
      yield* this.pushSpaces(true);
      const line = this.getLine();
      if (line === null)
        return this.setNext("doc");
      let n = yield* this.pushIndicators();
      switch (line[n]) {
        case "#":
          yield* this.pushCount(line.length - n);
        case undefined:
          yield* this.pushNewline();
          return yield* this.parseLineStart();
        case "{":
        case "[":
          yield* this.pushCount(1);
          this.flowKey = false;
          this.flowLevel = 1;
          return "flow";
        case "}":
        case "]":
          yield* this.pushCount(1);
          return "doc";
        case "*":
          yield* this.pushUntil(isNotAnchorChar);
          return "doc";
        case '"':
        case "'":
          return yield* this.parseQuotedScalar();
        case "|":
        case ">":
          n += yield* this.parseBlockScalarHeader();
          n += yield* this.pushSpaces(true);
          yield* this.pushCount(line.length - n);
          yield* this.pushNewline();
          return yield* this.parseBlockScalar();
        default:
          return yield* this.parsePlainScalar();
      }
    }
    *parseFlowCollection() {
      let nl, sp;
      let indent = -1;
      do {
        nl = yield* this.pushNewline();
        if (nl > 0) {
          sp = yield* this.pushSpaces(false);
          this.indentValue = indent = sp;
        } else {
          sp = 0;
        }
        sp += yield* this.pushSpaces(true);
      } while (nl + sp > 0);
      const line = this.getLine();
      if (line === null)
        return this.setNext("flow");
      if (indent !== -1 && indent < this.indentNext && line[0] !== "#" || indent === 0 && (line.startsWith("---") || line.startsWith("...")) && isEmpty(line[3])) {
        const atFlowEndMarker = indent === this.indentNext - 1 && this.flowLevel === 1 && (line[0] === "]" || line[0] === "}");
        if (!atFlowEndMarker) {
          this.flowLevel = 0;
          yield cst.FLOW_END;
          return yield* this.parseLineStart();
        }
      }
      let n = 0;
      while (line[n] === ",") {
        n += yield* this.pushCount(1);
        n += yield* this.pushSpaces(true);
        this.flowKey = false;
      }
      n += yield* this.pushIndicators();
      switch (line[n]) {
        case undefined:
          return "flow";
        case "#":
          yield* this.pushCount(line.length - n);
          return "flow";
        case "{":
        case "[":
          yield* this.pushCount(1);
          this.flowKey = false;
          this.flowLevel += 1;
          return "flow";
        case "}":
        case "]":
          yield* this.pushCount(1);
          this.flowKey = true;
          this.flowLevel -= 1;
          return this.flowLevel ? "flow" : "doc";
        case "*":
          yield* this.pushUntil(isNotAnchorChar);
          return "flow";
        case '"':
        case "'":
          this.flowKey = true;
          return yield* this.parseQuotedScalar();
        case ":": {
          const next = this.charAt(1);
          if (this.flowKey || isEmpty(next) || next === ",") {
            this.flowKey = false;
            yield* this.pushCount(1);
            yield* this.pushSpaces(true);
            return "flow";
          }
        }
        default:
          this.flowKey = false;
          return yield* this.parsePlainScalar();
      }
    }
    *parseQuotedScalar() {
      const quote = this.charAt(0);
      let end = this.buffer.indexOf(quote, this.pos + 1);
      if (quote === "'") {
        while (end !== -1 && this.buffer[end + 1] === "'")
          end = this.buffer.indexOf("'", end + 2);
      } else {
        while (end !== -1) {
          let n = 0;
          while (this.buffer[end - 1 - n] === "\\")
            n += 1;
          if (n % 2 === 0)
            break;
          end = this.buffer.indexOf('"', end + 1);
        }
      }
      const qb = this.buffer.substring(0, end);
      let nl = qb.indexOf(`
`, this.pos);
      if (nl !== -1) {
        while (nl !== -1) {
          const cs = this.continueScalar(nl + 1);
          if (cs === -1)
            break;
          nl = qb.indexOf(`
`, cs);
        }
        if (nl !== -1) {
          end = nl - (qb[nl - 1] === "\r" ? 2 : 1);
        }
      }
      if (end === -1) {
        if (!this.atEnd)
          return this.setNext("quoted-scalar");
        end = this.buffer.length;
      }
      yield* this.pushToIndex(end + 1, false);
      return this.flowLevel ? "flow" : "doc";
    }
    *parseBlockScalarHeader() {
      this.blockScalarIndent = -1;
      this.blockScalarKeep = false;
      let i = this.pos;
      while (true) {
        const ch = this.buffer[++i];
        if (ch === "+")
          this.blockScalarKeep = true;
        else if (ch > "0" && ch <= "9")
          this.blockScalarIndent = Number(ch) - 1;
        else if (ch !== "-")
          break;
      }
      return yield* this.pushUntil((ch) => isEmpty(ch) || ch === "#");
    }
    *parseBlockScalar() {
      let nl = this.pos - 1;
      let indent = 0;
      let ch;
      loop:
        for (let i2 = this.pos;ch = this.buffer[i2]; ++i2) {
          switch (ch) {
            case " ":
              indent += 1;
              break;
            case `
`:
              nl = i2;
              indent = 0;
              break;
            case "\r": {
              const next = this.buffer[i2 + 1];
              if (!next && !this.atEnd)
                return this.setNext("block-scalar");
              if (next === `
`)
                break;
            }
            default:
              break loop;
          }
        }
      if (!ch && !this.atEnd)
        return this.setNext("block-scalar");
      if (indent >= this.indentNext) {
        if (this.blockScalarIndent === -1)
          this.indentNext = indent;
        else {
          this.indentNext = this.blockScalarIndent + (this.indentNext === 0 ? 1 : this.indentNext);
        }
        do {
          const cs = this.continueScalar(nl + 1);
          if (cs === -1)
            break;
          nl = this.buffer.indexOf(`
`, cs);
        } while (nl !== -1);
        if (nl === -1) {
          if (!this.atEnd)
            return this.setNext("block-scalar");
          nl = this.buffer.length;
        }
      }
      let i = nl + 1;
      ch = this.buffer[i];
      while (ch === " ")
        ch = this.buffer[++i];
      if (ch === "\t") {
        while (ch === "\t" || ch === " " || ch === "\r" || ch === `
`)
          ch = this.buffer[++i];
        nl = i - 1;
      } else if (!this.blockScalarKeep) {
        do {
          let i2 = nl - 1;
          let ch2 = this.buffer[i2];
          if (ch2 === "\r")
            ch2 = this.buffer[--i2];
          const lastChar = i2;
          while (ch2 === " ")
            ch2 = this.buffer[--i2];
          if (ch2 === `
` && i2 >= this.pos && i2 + 1 + indent > lastChar)
            nl = i2;
          else
            break;
        } while (true);
      }
      yield cst.SCALAR;
      yield* this.pushToIndex(nl + 1, true);
      return yield* this.parseLineStart();
    }
    *parsePlainScalar() {
      const inFlow = this.flowLevel > 0;
      let end = this.pos - 1;
      let i = this.pos - 1;
      let ch;
      while (ch = this.buffer[++i]) {
        if (ch === ":") {
          const next = this.buffer[i + 1];
          if (isEmpty(next) || inFlow && flowIndicatorChars.has(next))
            break;
          end = i;
        } else if (isEmpty(ch)) {
          let next = this.buffer[i + 1];
          if (ch === "\r") {
            if (next === `
`) {
              i += 1;
              ch = `
`;
              next = this.buffer[i + 1];
            } else
              end = i;
          }
          if (next === "#" || inFlow && flowIndicatorChars.has(next))
            break;
          if (ch === `
`) {
            const cs = this.continueScalar(i + 1);
            if (cs === -1)
              break;
            i = Math.max(i, cs - 2);
          }
        } else {
          if (inFlow && flowIndicatorChars.has(ch))
            break;
          end = i;
        }
      }
      if (!ch && !this.atEnd)
        return this.setNext("plain-scalar");
      yield cst.SCALAR;
      yield* this.pushToIndex(end + 1, true);
      return inFlow ? "flow" : "doc";
    }
    *pushCount(n) {
      if (n > 0) {
        yield this.buffer.substr(this.pos, n);
        this.pos += n;
        return n;
      }
      return 0;
    }
    *pushToIndex(i, allowEmpty) {
      const s = this.buffer.slice(this.pos, i);
      if (s) {
        yield s;
        this.pos += s.length;
        return s.length;
      } else if (allowEmpty)
        yield "";
      return 0;
    }
    *pushIndicators() {
      switch (this.charAt(0)) {
        case "!":
          return (yield* this.pushTag()) + (yield* this.pushSpaces(true)) + (yield* this.pushIndicators());
        case "&":
          return (yield* this.pushUntil(isNotAnchorChar)) + (yield* this.pushSpaces(true)) + (yield* this.pushIndicators());
        case "-":
        case "?":
        case ":": {
          const inFlow = this.flowLevel > 0;
          const ch1 = this.charAt(1);
          if (isEmpty(ch1) || inFlow && flowIndicatorChars.has(ch1)) {
            if (!inFlow)
              this.indentNext = this.indentValue + 1;
            else if (this.flowKey)
              this.flowKey = false;
            return (yield* this.pushCount(1)) + (yield* this.pushSpaces(true)) + (yield* this.pushIndicators());
          }
        }
      }
      return 0;
    }
    *pushTag() {
      if (this.charAt(1) === "<") {
        let i = this.pos + 2;
        let ch = this.buffer[i];
        while (!isEmpty(ch) && ch !== ">")
          ch = this.buffer[++i];
        return yield* this.pushToIndex(ch === ">" ? i + 1 : i, false);
      } else {
        let i = this.pos + 1;
        let ch = this.buffer[i];
        while (ch) {
          if (tagChars.has(ch))
            ch = this.buffer[++i];
          else if (ch === "%" && hexDigits.has(this.buffer[i + 1]) && hexDigits.has(this.buffer[i + 2])) {
            ch = this.buffer[i += 3];
          } else
            break;
        }
        return yield* this.pushToIndex(i, false);
      }
    }
    *pushNewline() {
      const ch = this.buffer[this.pos];
      if (ch === `
`)
        return yield* this.pushCount(1);
      else if (ch === "\r" && this.charAt(1) === `
`)
        return yield* this.pushCount(2);
      else
        return 0;
    }
    *pushSpaces(allowTabs) {
      let i = this.pos - 1;
      let ch;
      do {
        ch = this.buffer[++i];
      } while (ch === " " || allowTabs && ch === "\t");
      const n = i - this.pos;
      if (n > 0) {
        yield this.buffer.substr(this.pos, n);
        this.pos = i;
      }
      return n;
    }
    *pushUntil(test) {
      let i = this.pos;
      let ch = this.buffer[i];
      while (!test(ch))
        ch = this.buffer[++i];
      return yield* this.pushToIndex(i, false);
    }
  }
  exports.Lexer = Lexer;
});

// node_modules/yaml/dist/parse/line-counter.js
var require_line_counter = __commonJS((exports) => {
  class LineCounter {
    constructor() {
      this.lineStarts = [];
      this.addNewLine = (offset) => this.lineStarts.push(offset);
      this.linePos = (offset) => {
        let low = 0;
        let high = this.lineStarts.length;
        while (low < high) {
          const mid = low + high >> 1;
          if (this.lineStarts[mid] < offset)
            low = mid + 1;
          else
            high = mid;
        }
        if (this.lineStarts[low] === offset)
          return { line: low + 1, col: 1 };
        if (low === 0)
          return { line: 0, col: offset };
        const start = this.lineStarts[low - 1];
        return { line: low, col: offset - start + 1 };
      };
    }
  }
  exports.LineCounter = LineCounter;
});

// node_modules/yaml/dist/parse/parser.js
var require_parser = __commonJS((exports) => {
  var node_process = __require("process");
  var cst = require_cst();
  var lexer = require_lexer();
  function includesToken(list, type) {
    for (let i = 0;i < list.length; ++i)
      if (list[i].type === type)
        return true;
    return false;
  }
  function findNonEmptyIndex(list) {
    for (let i = 0;i < list.length; ++i) {
      switch (list[i].type) {
        case "space":
        case "comment":
        case "newline":
          break;
        default:
          return i;
      }
    }
    return -1;
  }
  function isFlowToken(token) {
    switch (token?.type) {
      case "alias":
      case "scalar":
      case "single-quoted-scalar":
      case "double-quoted-scalar":
      case "flow-collection":
        return true;
      default:
        return false;
    }
  }
  function getPrevProps(parent) {
    switch (parent.type) {
      case "document":
        return parent.start;
      case "block-map": {
        const it = parent.items[parent.items.length - 1];
        return it.sep ?? it.start;
      }
      case "block-seq":
        return parent.items[parent.items.length - 1].start;
      default:
        return [];
    }
  }
  function getFirstKeyStartProps(prev) {
    if (prev.length === 0)
      return [];
    let i = prev.length;
    loop:
      while (--i >= 0) {
        switch (prev[i].type) {
          case "doc-start":
          case "explicit-key-ind":
          case "map-value-ind":
          case "seq-item-ind":
          case "newline":
            break loop;
        }
      }
    while (prev[++i]?.type === "space") {}
    return prev.splice(i, prev.length);
  }
  function fixFlowSeqItems(fc) {
    if (fc.start.type === "flow-seq-start") {
      for (const it of fc.items) {
        if (it.sep && !it.value && !includesToken(it.start, "explicit-key-ind") && !includesToken(it.sep, "map-value-ind")) {
          if (it.key)
            it.value = it.key;
          delete it.key;
          if (isFlowToken(it.value)) {
            if (it.value.end)
              Array.prototype.push.apply(it.value.end, it.sep);
            else
              it.value.end = it.sep;
          } else
            Array.prototype.push.apply(it.start, it.sep);
          delete it.sep;
        }
      }
    }
  }

  class Parser {
    constructor(onNewLine) {
      this.atNewLine = true;
      this.atScalar = false;
      this.indent = 0;
      this.offset = 0;
      this.onKeyLine = false;
      this.stack = [];
      this.source = "";
      this.type = "";
      this.lexer = new lexer.Lexer;
      this.onNewLine = onNewLine;
    }
    *parse(source, incomplete = false) {
      if (this.onNewLine && this.offset === 0)
        this.onNewLine(0);
      for (const lexeme of this.lexer.lex(source, incomplete))
        yield* this.next(lexeme);
      if (!incomplete)
        yield* this.end();
    }
    *next(source) {
      this.source = source;
      if (node_process.env.LOG_TOKENS)
        console.log("|", cst.prettyToken(source));
      if (this.atScalar) {
        this.atScalar = false;
        yield* this.step();
        this.offset += source.length;
        return;
      }
      const type = cst.tokenType(source);
      if (!type) {
        const message = `Not a YAML token: ${source}`;
        yield* this.pop({ type: "error", offset: this.offset, message, source });
        this.offset += source.length;
      } else if (type === "scalar") {
        this.atNewLine = false;
        this.atScalar = true;
        this.type = "scalar";
      } else {
        this.type = type;
        yield* this.step();
        switch (type) {
          case "newline":
            this.atNewLine = true;
            this.indent = 0;
            if (this.onNewLine)
              this.onNewLine(this.offset + source.length);
            break;
          case "space":
            if (this.atNewLine && source[0] === " ")
              this.indent += source.length;
            break;
          case "explicit-key-ind":
          case "map-value-ind":
          case "seq-item-ind":
            if (this.atNewLine)
              this.indent += source.length;
            break;
          case "doc-mode":
          case "flow-error-end":
            return;
          default:
            this.atNewLine = false;
        }
        this.offset += source.length;
      }
    }
    *end() {
      while (this.stack.length > 0)
        yield* this.pop();
    }
    get sourceToken() {
      const st = {
        type: this.type,
        offset: this.offset,
        indent: this.indent,
        source: this.source
      };
      return st;
    }
    *step() {
      const top = this.peek(1);
      if (this.type === "doc-end" && top?.type !== "doc-end") {
        while (this.stack.length > 0)
          yield* this.pop();
        this.stack.push({
          type: "doc-end",
          offset: this.offset,
          source: this.source
        });
        return;
      }
      if (!top)
        return yield* this.stream();
      switch (top.type) {
        case "document":
          return yield* this.document(top);
        case "alias":
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
          return yield* this.scalar(top);
        case "block-scalar":
          return yield* this.blockScalar(top);
        case "block-map":
          return yield* this.blockMap(top);
        case "block-seq":
          return yield* this.blockSequence(top);
        case "flow-collection":
          return yield* this.flowCollection(top);
        case "doc-end":
          return yield* this.documentEnd(top);
      }
      yield* this.pop();
    }
    peek(n) {
      return this.stack[this.stack.length - n];
    }
    *pop(error) {
      const token = error ?? this.stack.pop();
      if (!token) {
        const message = "Tried to pop an empty stack";
        yield { type: "error", offset: this.offset, source: "", message };
      } else if (this.stack.length === 0) {
        yield token;
      } else {
        const top = this.peek(1);
        if (token.type === "block-scalar") {
          token.indent = "indent" in top ? top.indent : 0;
        } else if (token.type === "flow-collection" && top.type === "document") {
          token.indent = 0;
        }
        if (token.type === "flow-collection")
          fixFlowSeqItems(token);
        switch (top.type) {
          case "document":
            top.value = token;
            break;
          case "block-scalar":
            top.props.push(token);
            break;
          case "block-map": {
            const it = top.items[top.items.length - 1];
            if (it.value) {
              top.items.push({ start: [], key: token, sep: [] });
              this.onKeyLine = true;
              return;
            } else if (it.sep) {
              it.value = token;
            } else {
              Object.assign(it, { key: token, sep: [] });
              this.onKeyLine = !it.explicitKey;
              return;
            }
            break;
          }
          case "block-seq": {
            const it = top.items[top.items.length - 1];
            if (it.value)
              top.items.push({ start: [], value: token });
            else
              it.value = token;
            break;
          }
          case "flow-collection": {
            const it = top.items[top.items.length - 1];
            if (!it || it.value)
              top.items.push({ start: [], key: token, sep: [] });
            else if (it.sep)
              it.value = token;
            else
              Object.assign(it, { key: token, sep: [] });
            return;
          }
          default:
            yield* this.pop();
            yield* this.pop(token);
        }
        if ((top.type === "document" || top.type === "block-map" || top.type === "block-seq") && (token.type === "block-map" || token.type === "block-seq")) {
          const last = token.items[token.items.length - 1];
          if (last && !last.sep && !last.value && last.start.length > 0 && findNonEmptyIndex(last.start) === -1 && (token.indent === 0 || last.start.every((st) => st.type !== "comment" || st.indent < token.indent))) {
            if (top.type === "document")
              top.end = last.start;
            else
              top.items.push({ start: last.start });
            token.items.splice(-1, 1);
          }
        }
      }
    }
    *stream() {
      switch (this.type) {
        case "directive-line":
          yield { type: "directive", offset: this.offset, source: this.source };
          return;
        case "byte-order-mark":
        case "space":
        case "comment":
        case "newline":
          yield this.sourceToken;
          return;
        case "doc-mode":
        case "doc-start": {
          const doc = {
            type: "document",
            offset: this.offset,
            start: []
          };
          if (this.type === "doc-start")
            doc.start.push(this.sourceToken);
          this.stack.push(doc);
          return;
        }
      }
      yield {
        type: "error",
        offset: this.offset,
        message: `Unexpected ${this.type} token in YAML stream`,
        source: this.source
      };
    }
    *document(doc) {
      if (doc.value)
        return yield* this.lineEnd(doc);
      switch (this.type) {
        case "doc-start": {
          if (findNonEmptyIndex(doc.start) !== -1) {
            yield* this.pop();
            yield* this.step();
          } else
            doc.start.push(this.sourceToken);
          return;
        }
        case "anchor":
        case "tag":
        case "space":
        case "comment":
        case "newline":
          doc.start.push(this.sourceToken);
          return;
      }
      const bv = this.startBlockValue(doc);
      if (bv)
        this.stack.push(bv);
      else {
        yield {
          type: "error",
          offset: this.offset,
          message: `Unexpected ${this.type} token in YAML document`,
          source: this.source
        };
      }
    }
    *scalar(scalar) {
      if (this.type === "map-value-ind") {
        const prev = getPrevProps(this.peek(2));
        const start = getFirstKeyStartProps(prev);
        let sep;
        if (scalar.end) {
          sep = scalar.end;
          sep.push(this.sourceToken);
          delete scalar.end;
        } else
          sep = [this.sourceToken];
        const map = {
          type: "block-map",
          offset: scalar.offset,
          indent: scalar.indent,
          items: [{ start, key: scalar, sep }]
        };
        this.onKeyLine = true;
        this.stack[this.stack.length - 1] = map;
      } else
        yield* this.lineEnd(scalar);
    }
    *blockScalar(scalar) {
      switch (this.type) {
        case "space":
        case "comment":
        case "newline":
          scalar.props.push(this.sourceToken);
          return;
        case "scalar":
          scalar.source = this.source;
          this.atNewLine = true;
          this.indent = 0;
          if (this.onNewLine) {
            let nl = this.source.indexOf(`
`) + 1;
            while (nl !== 0) {
              this.onNewLine(this.offset + nl);
              nl = this.source.indexOf(`
`, nl) + 1;
            }
          }
          yield* this.pop();
          break;
        default:
          yield* this.pop();
          yield* this.step();
      }
    }
    *blockMap(map) {
      const it = map.items[map.items.length - 1];
      switch (this.type) {
        case "newline":
          this.onKeyLine = false;
          if (it.value) {
            const end = "end" in it.value ? it.value.end : undefined;
            const last = Array.isArray(end) ? end[end.length - 1] : undefined;
            if (last?.type === "comment")
              end?.push(this.sourceToken);
            else
              map.items.push({ start: [this.sourceToken] });
          } else if (it.sep) {
            it.sep.push(this.sourceToken);
          } else {
            it.start.push(this.sourceToken);
          }
          return;
        case "space":
        case "comment":
          if (it.value) {
            map.items.push({ start: [this.sourceToken] });
          } else if (it.sep) {
            it.sep.push(this.sourceToken);
          } else {
            if (this.atIndentedComment(it.start, map.indent)) {
              const prev = map.items[map.items.length - 2];
              const end = prev?.value?.end;
              if (Array.isArray(end)) {
                Array.prototype.push.apply(end, it.start);
                end.push(this.sourceToken);
                map.items.pop();
                return;
              }
            }
            it.start.push(this.sourceToken);
          }
          return;
      }
      if (this.indent >= map.indent) {
        const atMapIndent = !this.onKeyLine && this.indent === map.indent;
        const atNextItem = atMapIndent && (it.sep || it.explicitKey) && this.type !== "seq-item-ind";
        let start = [];
        if (atNextItem && it.sep && !it.value) {
          const nl = [];
          for (let i = 0;i < it.sep.length; ++i) {
            const st = it.sep[i];
            switch (st.type) {
              case "newline":
                nl.push(i);
                break;
              case "space":
                break;
              case "comment":
                if (st.indent > map.indent)
                  nl.length = 0;
                break;
              default:
                nl.length = 0;
            }
          }
          if (nl.length >= 2)
            start = it.sep.splice(nl[1]);
        }
        switch (this.type) {
          case "anchor":
          case "tag":
            if (atNextItem || it.value) {
              start.push(this.sourceToken);
              map.items.push({ start });
              this.onKeyLine = true;
            } else if (it.sep) {
              it.sep.push(this.sourceToken);
            } else {
              it.start.push(this.sourceToken);
            }
            return;
          case "explicit-key-ind":
            if (!it.sep && !it.explicitKey) {
              it.start.push(this.sourceToken);
              it.explicitKey = true;
            } else if (atNextItem || it.value) {
              start.push(this.sourceToken);
              map.items.push({ start, explicitKey: true });
            } else {
              this.stack.push({
                type: "block-map",
                offset: this.offset,
                indent: this.indent,
                items: [{ start: [this.sourceToken], explicitKey: true }]
              });
            }
            this.onKeyLine = true;
            return;
          case "map-value-ind":
            if (it.explicitKey) {
              if (!it.sep) {
                if (includesToken(it.start, "newline")) {
                  Object.assign(it, { key: null, sep: [this.sourceToken] });
                } else {
                  const start2 = getFirstKeyStartProps(it.start);
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start: start2, key: null, sep: [this.sourceToken] }]
                  });
                }
              } else if (it.value) {
                map.items.push({ start: [], key: null, sep: [this.sourceToken] });
              } else if (includesToken(it.sep, "map-value-ind")) {
                this.stack.push({
                  type: "block-map",
                  offset: this.offset,
                  indent: this.indent,
                  items: [{ start, key: null, sep: [this.sourceToken] }]
                });
              } else if (isFlowToken(it.key) && !includesToken(it.sep, "newline")) {
                const start2 = getFirstKeyStartProps(it.start);
                const key = it.key;
                const sep = it.sep;
                sep.push(this.sourceToken);
                delete it.key;
                delete it.sep;
                this.stack.push({
                  type: "block-map",
                  offset: this.offset,
                  indent: this.indent,
                  items: [{ start: start2, key, sep }]
                });
              } else if (start.length > 0) {
                it.sep = it.sep.concat(start, this.sourceToken);
              } else {
                it.sep.push(this.sourceToken);
              }
            } else {
              if (!it.sep) {
                Object.assign(it, { key: null, sep: [this.sourceToken] });
              } else if (it.value || atNextItem) {
                map.items.push({ start, key: null, sep: [this.sourceToken] });
              } else if (includesToken(it.sep, "map-value-ind")) {
                this.stack.push({
                  type: "block-map",
                  offset: this.offset,
                  indent: this.indent,
                  items: [{ start: [], key: null, sep: [this.sourceToken] }]
                });
              } else {
                it.sep.push(this.sourceToken);
              }
            }
            this.onKeyLine = true;
            return;
          case "alias":
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar": {
            const fs = this.flowScalar(this.type);
            if (atNextItem || it.value) {
              map.items.push({ start, key: fs, sep: [] });
              this.onKeyLine = true;
            } else if (it.sep) {
              this.stack.push(fs);
            } else {
              Object.assign(it, { key: fs, sep: [] });
              this.onKeyLine = true;
            }
            return;
          }
          default: {
            const bv = this.startBlockValue(map);
            if (bv) {
              if (bv.type === "block-seq") {
                if (!it.explicitKey && it.sep && !includesToken(it.sep, "newline")) {
                  yield* this.pop({
                    type: "error",
                    offset: this.offset,
                    message: "Unexpected block-seq-ind on same line with key",
                    source: this.source
                  });
                  return;
                }
              } else if (atMapIndent) {
                map.items.push({ start });
              }
              this.stack.push(bv);
              return;
            }
          }
        }
      }
      yield* this.pop();
      yield* this.step();
    }
    *blockSequence(seq) {
      const it = seq.items[seq.items.length - 1];
      switch (this.type) {
        case "newline":
          if (it.value) {
            const end = "end" in it.value ? it.value.end : undefined;
            const last = Array.isArray(end) ? end[end.length - 1] : undefined;
            if (last?.type === "comment")
              end?.push(this.sourceToken);
            else
              seq.items.push({ start: [this.sourceToken] });
          } else
            it.start.push(this.sourceToken);
          return;
        case "space":
        case "comment":
          if (it.value)
            seq.items.push({ start: [this.sourceToken] });
          else {
            if (this.atIndentedComment(it.start, seq.indent)) {
              const prev = seq.items[seq.items.length - 2];
              const end = prev?.value?.end;
              if (Array.isArray(end)) {
                Array.prototype.push.apply(end, it.start);
                end.push(this.sourceToken);
                seq.items.pop();
                return;
              }
            }
            it.start.push(this.sourceToken);
          }
          return;
        case "anchor":
        case "tag":
          if (it.value || this.indent <= seq.indent)
            break;
          it.start.push(this.sourceToken);
          return;
        case "seq-item-ind":
          if (this.indent !== seq.indent)
            break;
          if (it.value || includesToken(it.start, "seq-item-ind"))
            seq.items.push({ start: [this.sourceToken] });
          else
            it.start.push(this.sourceToken);
          return;
      }
      if (this.indent > seq.indent) {
        const bv = this.startBlockValue(seq);
        if (bv) {
          this.stack.push(bv);
          return;
        }
      }
      yield* this.pop();
      yield* this.step();
    }
    *flowCollection(fc) {
      const it = fc.items[fc.items.length - 1];
      if (this.type === "flow-error-end") {
        let top;
        do {
          yield* this.pop();
          top = this.peek(1);
        } while (top?.type === "flow-collection");
      } else if (fc.end.length === 0) {
        switch (this.type) {
          case "comma":
          case "explicit-key-ind":
            if (!it || it.sep)
              fc.items.push({ start: [this.sourceToken] });
            else
              it.start.push(this.sourceToken);
            return;
          case "map-value-ind":
            if (!it || it.value)
              fc.items.push({ start: [], key: null, sep: [this.sourceToken] });
            else if (it.sep)
              it.sep.push(this.sourceToken);
            else
              Object.assign(it, { key: null, sep: [this.sourceToken] });
            return;
          case "space":
          case "comment":
          case "newline":
          case "anchor":
          case "tag":
            if (!it || it.value)
              fc.items.push({ start: [this.sourceToken] });
            else if (it.sep)
              it.sep.push(this.sourceToken);
            else
              it.start.push(this.sourceToken);
            return;
          case "alias":
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar": {
            const fs = this.flowScalar(this.type);
            if (!it || it.value)
              fc.items.push({ start: [], key: fs, sep: [] });
            else if (it.sep)
              this.stack.push(fs);
            else
              Object.assign(it, { key: fs, sep: [] });
            return;
          }
          case "flow-map-end":
          case "flow-seq-end":
            fc.end.push(this.sourceToken);
            return;
        }
        const bv = this.startBlockValue(fc);
        if (bv)
          this.stack.push(bv);
        else {
          yield* this.pop();
          yield* this.step();
        }
      } else {
        const parent = this.peek(2);
        if (parent.type === "block-map" && (this.type === "map-value-ind" && parent.indent === fc.indent || this.type === "newline" && !parent.items[parent.items.length - 1].sep)) {
          yield* this.pop();
          yield* this.step();
        } else if (this.type === "map-value-ind" && parent.type !== "flow-collection") {
          const prev = getPrevProps(parent);
          const start = getFirstKeyStartProps(prev);
          fixFlowSeqItems(fc);
          const sep = fc.end.splice(1, fc.end.length);
          sep.push(this.sourceToken);
          const map = {
            type: "block-map",
            offset: fc.offset,
            indent: fc.indent,
            items: [{ start, key: fc, sep }]
          };
          this.onKeyLine = true;
          this.stack[this.stack.length - 1] = map;
        } else {
          yield* this.lineEnd(fc);
        }
      }
    }
    flowScalar(type) {
      if (this.onNewLine) {
        let nl = this.source.indexOf(`
`) + 1;
        while (nl !== 0) {
          this.onNewLine(this.offset + nl);
          nl = this.source.indexOf(`
`, nl) + 1;
        }
      }
      return {
        type,
        offset: this.offset,
        indent: this.indent,
        source: this.source
      };
    }
    startBlockValue(parent) {
      switch (this.type) {
        case "alias":
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
          return this.flowScalar(this.type);
        case "block-scalar-header":
          return {
            type: "block-scalar",
            offset: this.offset,
            indent: this.indent,
            props: [this.sourceToken],
            source: ""
          };
        case "flow-map-start":
        case "flow-seq-start":
          return {
            type: "flow-collection",
            offset: this.offset,
            indent: this.indent,
            start: this.sourceToken,
            items: [],
            end: []
          };
        case "seq-item-ind":
          return {
            type: "block-seq",
            offset: this.offset,
            indent: this.indent,
            items: [{ start: [this.sourceToken] }]
          };
        case "explicit-key-ind": {
          this.onKeyLine = true;
          const prev = getPrevProps(parent);
          const start = getFirstKeyStartProps(prev);
          start.push(this.sourceToken);
          return {
            type: "block-map",
            offset: this.offset,
            indent: this.indent,
            items: [{ start, explicitKey: true }]
          };
        }
        case "map-value-ind": {
          this.onKeyLine = true;
          const prev = getPrevProps(parent);
          const start = getFirstKeyStartProps(prev);
          return {
            type: "block-map",
            offset: this.offset,
            indent: this.indent,
            items: [{ start, key: null, sep: [this.sourceToken] }]
          };
        }
      }
      return null;
    }
    atIndentedComment(start, indent) {
      if (this.type !== "comment")
        return false;
      if (this.indent <= indent)
        return false;
      return start.every((st) => st.type === "newline" || st.type === "space");
    }
    *documentEnd(docEnd) {
      if (this.type !== "doc-mode") {
        if (docEnd.end)
          docEnd.end.push(this.sourceToken);
        else
          docEnd.end = [this.sourceToken];
        if (this.type === "newline")
          yield* this.pop();
      }
    }
    *lineEnd(token) {
      switch (this.type) {
        case "comma":
        case "doc-start":
        case "doc-end":
        case "flow-seq-end":
        case "flow-map-end":
        case "map-value-ind":
          yield* this.pop();
          yield* this.step();
          break;
        case "newline":
          this.onKeyLine = false;
        case "space":
        case "comment":
        default:
          if (token.end)
            token.end.push(this.sourceToken);
          else
            token.end = [this.sourceToken];
          if (this.type === "newline")
            yield* this.pop();
      }
    }
  }
  exports.Parser = Parser;
});

// node_modules/yaml/dist/public-api.js
var require_public_api = __commonJS((exports) => {
  var composer = require_composer();
  var Document = require_Document();
  var errors = require_errors();
  var log = require_log();
  var identity = require_identity();
  var lineCounter = require_line_counter();
  var parser = require_parser();
  function parseOptions(options) {
    const prettyErrors = options.prettyErrors !== false;
    const lineCounter$1 = options.lineCounter || prettyErrors && new lineCounter.LineCounter || null;
    return { lineCounter: lineCounter$1, prettyErrors };
  }
  function parseAllDocuments(source, options = {}) {
    const { lineCounter: lineCounter2, prettyErrors } = parseOptions(options);
    const parser$1 = new parser.Parser(lineCounter2?.addNewLine);
    const composer$1 = new composer.Composer(options);
    const docs = Array.from(composer$1.compose(parser$1.parse(source)));
    if (prettyErrors && lineCounter2)
      for (const doc of docs) {
        doc.errors.forEach(errors.prettifyError(source, lineCounter2));
        doc.warnings.forEach(errors.prettifyError(source, lineCounter2));
      }
    if (docs.length > 0)
      return docs;
    return Object.assign([], { empty: true }, composer$1.streamInfo());
  }
  function parseDocument(source, options = {}) {
    const { lineCounter: lineCounter2, prettyErrors } = parseOptions(options);
    const parser$1 = new parser.Parser(lineCounter2?.addNewLine);
    const composer$1 = new composer.Composer(options);
    let doc = null;
    for (const _doc of composer$1.compose(parser$1.parse(source), true, source.length)) {
      if (!doc)
        doc = _doc;
      else if (doc.options.logLevel !== "silent") {
        doc.errors.push(new errors.YAMLParseError(_doc.range.slice(0, 2), "MULTIPLE_DOCS", "Source contains multiple documents; please use YAML.parseAllDocuments()"));
        break;
      }
    }
    if (prettyErrors && lineCounter2) {
      doc.errors.forEach(errors.prettifyError(source, lineCounter2));
      doc.warnings.forEach(errors.prettifyError(source, lineCounter2));
    }
    return doc;
  }
  function parse(src, reviver, options) {
    let _reviver = undefined;
    if (typeof reviver === "function") {
      _reviver = reviver;
    } else if (options === undefined && reviver && typeof reviver === "object") {
      options = reviver;
    }
    const doc = parseDocument(src, options);
    if (!doc)
      return null;
    doc.warnings.forEach((warning) => log.warn(doc.options.logLevel, warning));
    if (doc.errors.length > 0) {
      if (doc.options.logLevel !== "silent")
        throw doc.errors[0];
      else
        doc.errors = [];
    }
    return doc.toJS(Object.assign({ reviver: _reviver }, options));
  }
  function stringify(value, replacer, options) {
    let _replacer = null;
    if (typeof replacer === "function" || Array.isArray(replacer)) {
      _replacer = replacer;
    } else if (options === undefined && replacer) {
      options = replacer;
    }
    if (typeof options === "string")
      options = options.length;
    if (typeof options === "number") {
      const indent = Math.round(options);
      options = indent < 1 ? undefined : indent > 8 ? { indent: 8 } : { indent };
    }
    if (value === undefined) {
      const { keepUndefined } = options ?? replacer ?? {};
      if (!keepUndefined)
        return;
    }
    if (identity.isDocument(value) && !_replacer)
      return value.toString(options);
    return new Document.Document(value, _replacer, options).toString(options);
  }
  exports.parse = parse;
  exports.parseAllDocuments = parseAllDocuments;
  exports.parseDocument = parseDocument;
  exports.stringify = stringify;
});

// node_modules/yaml/dist/index.js
var require_dist = __commonJS((exports) => {
  var composer = require_composer();
  var Document = require_Document();
  var Schema = require_Schema();
  var errors = require_errors();
  var Alias = require_Alias();
  var identity = require_identity();
  var Pair = require_Pair();
  var Scalar = require_Scalar();
  var YAMLMap = require_YAMLMap();
  var YAMLSeq = require_YAMLSeq();
  var cst = require_cst();
  var lexer = require_lexer();
  var lineCounter = require_line_counter();
  var parser = require_parser();
  var publicApi = require_public_api();
  var visit = require_visit();
  exports.Composer = composer.Composer;
  exports.Document = Document.Document;
  exports.Schema = Schema.Schema;
  exports.YAMLError = errors.YAMLError;
  exports.YAMLParseError = errors.YAMLParseError;
  exports.YAMLWarning = errors.YAMLWarning;
  exports.Alias = Alias.Alias;
  exports.isAlias = identity.isAlias;
  exports.isCollection = identity.isCollection;
  exports.isDocument = identity.isDocument;
  exports.isMap = identity.isMap;
  exports.isNode = identity.isNode;
  exports.isPair = identity.isPair;
  exports.isScalar = identity.isScalar;
  exports.isSeq = identity.isSeq;
  exports.Pair = Pair.Pair;
  exports.Scalar = Scalar.Scalar;
  exports.YAMLMap = YAMLMap.YAMLMap;
  exports.YAMLSeq = YAMLSeq.YAMLSeq;
  exports.CST = cst;
  exports.Lexer = lexer.Lexer;
  exports.LineCounter = lineCounter.LineCounter;
  exports.Parser = parser.Parser;
  exports.parse = publicApi.parse;
  exports.parseAllDocuments = publicApi.parseAllDocuments;
  exports.parseDocument = publicApi.parseDocument;
  exports.stringify = publicApi.stringify;
  exports.visit = visit.visit;
  exports.visitAsync = visit.visitAsync;
});

// src/install/init.ts
var import_yaml = __toESM(require_dist(), 1);
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

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

// src/config/schema.ts
var DEFAULT_CONFIG = {
  version: 1,
  runner: {
    backend: "opencode",
    review: "opencode",
    artifactsDir: ".ai-eng/runs",
    maxIters: 3,
    printLogs: false,
    logLevel: "INFO"
  },
  loop: {
    maxCycles: 50,
    cycleRetries: 2,
    checkpointFrequency: 1,
    stuckThreshold: 5
  },
  debug: {
    work: false
  },
  opencode: {
    model: "claude-3-5-sonnet-latest",
    temperature: 0.2,
    serverUrl: undefined,
    directory: undefined,
    promptTimeoutMs: 120000
  },
  anthropic: {
    enabled: false,
    model: "claude-3-5-sonnet-latest"
  },
  gates: {
    lint: { command: "bun run lint" },
    typecheck: { command: "bun run typecheck" },
    test: { command: "bun test" },
    build: { command: "bun run build" },
    acceptance: { command: "git diff --name-only" }
  },
  models: {
    research: "github-copilot/gpt-5.2",
    planning: "github-copilot/gpt-5.2",
    exploration: "github-copilot/gpt-5.2",
    coding: "github-copilot/gpt-5.2",
    default: "github-copilot/gpt-5.2"
  },
  notifications: {
    discord: {
      enabled: false,
      username: "Ralph",
      avatarUrl: undefined,
      webhook: {
        source: "env",
        envVar: "DISCORD_WEBHOOK_URL"
      }
    }
  },
  ui: {
    silent: false
  }
};

// src/install/init.ts
async function initConfig(flags) {
  const configDir = join(process.cwd(), ".ai-eng");
  const configPath = join(configDir, "config.yaml");
  if (existsSync(configPath) && !flags.overwrite) {
    UI.error("Configuration file already exists:");
    console.error(`  ${configPath}`);
    console.error("Use --overwrite to replace it, or edit the existing file.");
    process.exit(1);
  }
  if (flags.interactive) {
    console.log("⚠️  Interactive mode requires additional dependencies.");
    console.log("  npm install @clack/prompts");
    console.log(`For now, creating config with defaults...
`);
  }
  try {
    await mkdir(configDir, { recursive: true });
    const yamlContent = import_yaml.default.stringify(DEFAULT_CONFIG, {
      indent: 2,
      lineWidth: 0
    });
    await writeFile(configPath, yamlContent, "utf-8");
    console.log("✅ Initialized .ai-eng/config.yaml with defaults");
    console.log(`
\uD83D\uDCCB Next steps:`);
    console.log("  1. Edit .ai-eng/config.yaml to customize settings");
    console.log("  2. Set up AI models and backends");
    console.log("  3. Configure quality gates for your project");
    console.log(`  4. Run 'ai-eng ralph "your task"' to start development`);
  } catch (error) {
    console.error(`Failed to write configuration file: ${configPath}`);
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    }
    process.exit(1);
  }
}
export {
  initConfig
};

//# debugId=AF7FB165196DD9B264756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9ub2Rlcy9pZGVudGl0eS5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3Zpc2l0LmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3QvZG9jL2RpcmVjdGl2ZXMuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9kb2MvYW5jaG9ycy5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L2RvYy9hcHBseVJldml2ZXIuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9ub2Rlcy90b0pTLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3Qvbm9kZXMvTm9kZS5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L25vZGVzL0FsaWFzLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3Qvbm9kZXMvU2NhbGFyLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3QvZG9jL2NyZWF0ZU5vZGUuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9ub2Rlcy9Db2xsZWN0aW9uLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3Qvc3RyaW5naWZ5L3N0cmluZ2lmeUNvbW1lbnQuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9zdHJpbmdpZnkvZm9sZEZsb3dMaW5lcy5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3N0cmluZ2lmeS9zdHJpbmdpZnlTdHJpbmcuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9zdHJpbmdpZnkvc3RyaW5naWZ5LmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3Qvc3RyaW5naWZ5L3N0cmluZ2lmeVBhaXIuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9sb2cuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9zY2hlbWEveWFtbC0xLjEvbWVyZ2UuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9ub2Rlcy9hZGRQYWlyVG9KU01hcC5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L25vZGVzL1BhaXIuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9zdHJpbmdpZnkvc3RyaW5naWZ5Q29sbGVjdGlvbi5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L25vZGVzL1lBTUxNYXAuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9zY2hlbWEvY29tbW9uL21hcC5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L25vZGVzL1lBTUxTZXEuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9zY2hlbWEvY29tbW9uL3NlcS5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3NjaGVtYS9jb21tb24vc3RyaW5nLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3Qvc2NoZW1hL2NvbW1vbi9udWxsLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3Qvc2NoZW1hL2NvcmUvYm9vbC5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3N0cmluZ2lmeS9zdHJpbmdpZnlOdW1iZXIuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9zY2hlbWEvY29yZS9mbG9hdC5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3NjaGVtYS9jb3JlL2ludC5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3NjaGVtYS9jb3JlL3NjaGVtYS5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3NjaGVtYS9qc29uL3NjaGVtYS5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3NjaGVtYS95YW1sLTEuMS9iaW5hcnkuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9zY2hlbWEveWFtbC0xLjEvcGFpcnMuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9zY2hlbWEveWFtbC0xLjEvb21hcC5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3NjaGVtYS95YW1sLTEuMS9ib29sLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3Qvc2NoZW1hL3lhbWwtMS4xL2Zsb2F0LmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3Qvc2NoZW1hL3lhbWwtMS4xL2ludC5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3NjaGVtYS95YW1sLTEuMS9zZXQuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9zY2hlbWEveWFtbC0xLjEvdGltZXN0YW1wLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3Qvc2NoZW1hL3lhbWwtMS4xL3NjaGVtYS5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3NjaGVtYS90YWdzLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3Qvc2NoZW1hL1NjaGVtYS5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3N0cmluZ2lmeS9zdHJpbmdpZnlEb2N1bWVudC5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L2RvYy9Eb2N1bWVudC5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L2Vycm9ycy5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L2NvbXBvc2UvcmVzb2x2ZS1wcm9wcy5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L2NvbXBvc2UvdXRpbC1jb250YWlucy1uZXdsaW5lLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3QvY29tcG9zZS91dGlsLWZsb3ctaW5kZW50LWNoZWNrLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3QvY29tcG9zZS91dGlsLW1hcC1pbmNsdWRlcy5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L2NvbXBvc2UvcmVzb2x2ZS1ibG9jay1tYXAuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9jb21wb3NlL3Jlc29sdmUtYmxvY2stc2VxLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3QvY29tcG9zZS9yZXNvbHZlLWVuZC5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L2NvbXBvc2UvcmVzb2x2ZS1mbG93LWNvbGxlY3Rpb24uanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9jb21wb3NlL2NvbXBvc2UtY29sbGVjdGlvbi5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L2NvbXBvc2UvcmVzb2x2ZS1ibG9jay1zY2FsYXIuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9jb21wb3NlL3Jlc29sdmUtZmxvdy1zY2FsYXIuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9jb21wb3NlL2NvbXBvc2Utc2NhbGFyLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3QvY29tcG9zZS91dGlsLWVtcHR5LXNjYWxhci1wb3NpdGlvbi5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L2NvbXBvc2UvY29tcG9zZS1ub2RlLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3QvY29tcG9zZS9jb21wb3NlLWRvYy5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L2NvbXBvc2UvY29tcG9zZXIuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9wYXJzZS9jc3Qtc2NhbGFyLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3QvcGFyc2UvY3N0LXN0cmluZ2lmeS5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3BhcnNlL2NzdC12aXNpdC5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3BhcnNlL2NzdC5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3BhcnNlL2xleGVyLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3QvcGFyc2UvbGluZS1jb3VudGVyLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3QvcGFyc2UvcGFyc2VyLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3QvcHVibGljLWFwaS5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L2luZGV4LmpzIiwgIi4uL3NyYy9pbnN0YWxsL2luaXQudHMiLCAiLi4vc3JjL2NsaS91aS50cyIsICIuLi9zcmMvY29uZmlnL3NjaGVtYS50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsKICAgICIndXNlIHN0cmljdCc7XG5cbmNvbnN0IEFMSUFTID0gU3ltYm9sLmZvcigneWFtbC5hbGlhcycpO1xuY29uc3QgRE9DID0gU3ltYm9sLmZvcigneWFtbC5kb2N1bWVudCcpO1xuY29uc3QgTUFQID0gU3ltYm9sLmZvcigneWFtbC5tYXAnKTtcbmNvbnN0IFBBSVIgPSBTeW1ib2wuZm9yKCd5YW1sLnBhaXInKTtcbmNvbnN0IFNDQUxBUiA9IFN5bWJvbC5mb3IoJ3lhbWwuc2NhbGFyJyk7XG5jb25zdCBTRVEgPSBTeW1ib2wuZm9yKCd5YW1sLnNlcScpO1xuY29uc3QgTk9ERV9UWVBFID0gU3ltYm9sLmZvcigneWFtbC5ub2RlLnR5cGUnKTtcbmNvbnN0IGlzQWxpYXMgPSAobm9kZSkgPT4gISFub2RlICYmIHR5cGVvZiBub2RlID09PSAnb2JqZWN0JyAmJiBub2RlW05PREVfVFlQRV0gPT09IEFMSUFTO1xuY29uc3QgaXNEb2N1bWVudCA9IChub2RlKSA9PiAhIW5vZGUgJiYgdHlwZW9mIG5vZGUgPT09ICdvYmplY3QnICYmIG5vZGVbTk9ERV9UWVBFXSA9PT0gRE9DO1xuY29uc3QgaXNNYXAgPSAobm9kZSkgPT4gISFub2RlICYmIHR5cGVvZiBub2RlID09PSAnb2JqZWN0JyAmJiBub2RlW05PREVfVFlQRV0gPT09IE1BUDtcbmNvbnN0IGlzUGFpciA9IChub2RlKSA9PiAhIW5vZGUgJiYgdHlwZW9mIG5vZGUgPT09ICdvYmplY3QnICYmIG5vZGVbTk9ERV9UWVBFXSA9PT0gUEFJUjtcbmNvbnN0IGlzU2NhbGFyID0gKG5vZGUpID0+ICEhbm9kZSAmJiB0eXBlb2Ygbm9kZSA9PT0gJ29iamVjdCcgJiYgbm9kZVtOT0RFX1RZUEVdID09PSBTQ0FMQVI7XG5jb25zdCBpc1NlcSA9IChub2RlKSA9PiAhIW5vZGUgJiYgdHlwZW9mIG5vZGUgPT09ICdvYmplY3QnICYmIG5vZGVbTk9ERV9UWVBFXSA9PT0gU0VRO1xuZnVuY3Rpb24gaXNDb2xsZWN0aW9uKG5vZGUpIHtcbiAgICBpZiAobm9kZSAmJiB0eXBlb2Ygbm9kZSA9PT0gJ29iamVjdCcpXG4gICAgICAgIHN3aXRjaCAobm9kZVtOT0RFX1RZUEVdKSB7XG4gICAgICAgICAgICBjYXNlIE1BUDpcbiAgICAgICAgICAgIGNhc2UgU0VROlxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuZnVuY3Rpb24gaXNOb2RlKG5vZGUpIHtcbiAgICBpZiAobm9kZSAmJiB0eXBlb2Ygbm9kZSA9PT0gJ29iamVjdCcpXG4gICAgICAgIHN3aXRjaCAobm9kZVtOT0RFX1RZUEVdKSB7XG4gICAgICAgICAgICBjYXNlIEFMSUFTOlxuICAgICAgICAgICAgY2FzZSBNQVA6XG4gICAgICAgICAgICBjYXNlIFNDQUxBUjpcbiAgICAgICAgICAgIGNhc2UgU0VROlxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuY29uc3QgaGFzQW5jaG9yID0gKG5vZGUpID0+IChpc1NjYWxhcihub2RlKSB8fCBpc0NvbGxlY3Rpb24obm9kZSkpICYmICEhbm9kZS5hbmNob3I7XG5cbmV4cG9ydHMuQUxJQVMgPSBBTElBUztcbmV4cG9ydHMuRE9DID0gRE9DO1xuZXhwb3J0cy5NQVAgPSBNQVA7XG5leHBvcnRzLk5PREVfVFlQRSA9IE5PREVfVFlQRTtcbmV4cG9ydHMuUEFJUiA9IFBBSVI7XG5leHBvcnRzLlNDQUxBUiA9IFNDQUxBUjtcbmV4cG9ydHMuU0VRID0gU0VRO1xuZXhwb3J0cy5oYXNBbmNob3IgPSBoYXNBbmNob3I7XG5leHBvcnRzLmlzQWxpYXMgPSBpc0FsaWFzO1xuZXhwb3J0cy5pc0NvbGxlY3Rpb24gPSBpc0NvbGxlY3Rpb247XG5leHBvcnRzLmlzRG9jdW1lbnQgPSBpc0RvY3VtZW50O1xuZXhwb3J0cy5pc01hcCA9IGlzTWFwO1xuZXhwb3J0cy5pc05vZGUgPSBpc05vZGU7XG5leHBvcnRzLmlzUGFpciA9IGlzUGFpcjtcbmV4cG9ydHMuaXNTY2FsYXIgPSBpc1NjYWxhcjtcbmV4cG9ydHMuaXNTZXEgPSBpc1NlcTtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuL25vZGVzL2lkZW50aXR5LmpzJyk7XG5cbmNvbnN0IEJSRUFLID0gU3ltYm9sKCdicmVhayB2aXNpdCcpO1xuY29uc3QgU0tJUCA9IFN5bWJvbCgnc2tpcCBjaGlsZHJlbicpO1xuY29uc3QgUkVNT1ZFID0gU3ltYm9sKCdyZW1vdmUgbm9kZScpO1xuLyoqXG4gKiBBcHBseSBhIHZpc2l0b3IgdG8gYW4gQVNUIG5vZGUgb3IgZG9jdW1lbnQuXG4gKlxuICogV2Fsa3MgdGhyb3VnaCB0aGUgdHJlZSAoZGVwdGgtZmlyc3QpIHN0YXJ0aW5nIGZyb20gYG5vZGVgLCBjYWxsaW5nIGFcbiAqIGB2aXNpdG9yYCBmdW5jdGlvbiB3aXRoIHRocmVlIGFyZ3VtZW50czpcbiAqICAgLSBga2V5YDogRm9yIHNlcXVlbmNlIHZhbHVlcyBhbmQgbWFwIGBQYWlyYCwgdGhlIG5vZGUncyBpbmRleCBpbiB0aGVcbiAqICAgICBjb2xsZWN0aW9uLiBXaXRoaW4gYSBgUGFpcmAsIGAna2V5J2Agb3IgYCd2YWx1ZSdgLCBjb3JyZXNwb25kaW5nbHkuXG4gKiAgICAgYG51bGxgIGZvciB0aGUgcm9vdCBub2RlLlxuICogICAtIGBub2RlYDogVGhlIGN1cnJlbnQgbm9kZS5cbiAqICAgLSBgcGF0aGA6IFRoZSBhbmNlc3RyeSBvZiB0aGUgY3VycmVudCBub2RlLlxuICpcbiAqIFRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIHZpc2l0b3IgbWF5IGJlIHVzZWQgdG8gY29udHJvbCB0aGUgdHJhdmVyc2FsOlxuICogICAtIGB1bmRlZmluZWRgIChkZWZhdWx0KTogRG8gbm90aGluZyBhbmQgY29udGludWVcbiAqICAgLSBgdmlzaXQuU0tJUGA6IERvIG5vdCB2aXNpdCB0aGUgY2hpbGRyZW4gb2YgdGhpcyBub2RlLCBjb250aW51ZSB3aXRoIG5leHRcbiAqICAgICBzaWJsaW5nXG4gKiAgIC0gYHZpc2l0LkJSRUFLYDogVGVybWluYXRlIHRyYXZlcnNhbCBjb21wbGV0ZWx5XG4gKiAgIC0gYHZpc2l0LlJFTU9WRWA6IFJlbW92ZSB0aGUgY3VycmVudCBub2RlLCB0aGVuIGNvbnRpbnVlIHdpdGggdGhlIG5leHQgb25lXG4gKiAgIC0gYE5vZGVgOiBSZXBsYWNlIHRoZSBjdXJyZW50IG5vZGUsIHRoZW4gY29udGludWUgYnkgdmlzaXRpbmcgaXRcbiAqICAgLSBgbnVtYmVyYDogV2hpbGUgaXRlcmF0aW5nIHRoZSBpdGVtcyBvZiBhIHNlcXVlbmNlIG9yIG1hcCwgc2V0IHRoZSBpbmRleFxuICogICAgIG9mIHRoZSBuZXh0IHN0ZXAuIFRoaXMgaXMgdXNlZnVsIGVzcGVjaWFsbHkgaWYgdGhlIGluZGV4IG9mIHRoZSBjdXJyZW50XG4gKiAgICAgbm9kZSBoYXMgY2hhbmdlZC5cbiAqXG4gKiBJZiBgdmlzaXRvcmAgaXMgYSBzaW5nbGUgZnVuY3Rpb24sIGl0IHdpbGwgYmUgY2FsbGVkIHdpdGggYWxsIHZhbHVlc1xuICogZW5jb3VudGVyZWQgaW4gdGhlIHRyZWUsIGluY2x1ZGluZyBlLmcuIGBudWxsYCB2YWx1ZXMuIEFsdGVybmF0aXZlbHksXG4gKiBzZXBhcmF0ZSB2aXNpdG9yIGZ1bmN0aW9ucyBtYXkgYmUgZGVmaW5lZCBmb3IgZWFjaCBgTWFwYCwgYFBhaXJgLCBgU2VxYCxcbiAqIGBBbGlhc2AgYW5kIGBTY2FsYXJgIG5vZGUuIFRvIGRlZmluZSB0aGUgc2FtZSB2aXNpdG9yIGZ1bmN0aW9uIGZvciBtb3JlIHRoYW5cbiAqIG9uZSBub2RlIHR5cGUsIHVzZSB0aGUgYENvbGxlY3Rpb25gIChtYXAgYW5kIHNlcSksIGBWYWx1ZWAgKG1hcCwgc2VxICYgc2NhbGFyKVxuICogYW5kIGBOb2RlYCAoYWxpYXMsIG1hcCwgc2VxICYgc2NhbGFyKSB0YXJnZXRzLiBPZiBhbGwgdGhlc2UsIG9ubHkgdGhlIG1vc3RcbiAqIHNwZWNpZmljIGRlZmluZWQgb25lIHdpbGwgYmUgdXNlZCBmb3IgZWFjaCBub2RlLlxuICovXG5mdW5jdGlvbiB2aXNpdChub2RlLCB2aXNpdG9yKSB7XG4gICAgY29uc3QgdmlzaXRvcl8gPSBpbml0VmlzaXRvcih2aXNpdG9yKTtcbiAgICBpZiAoaWRlbnRpdHkuaXNEb2N1bWVudChub2RlKSkge1xuICAgICAgICBjb25zdCBjZCA9IHZpc2l0XyhudWxsLCBub2RlLmNvbnRlbnRzLCB2aXNpdG9yXywgT2JqZWN0LmZyZWV6ZShbbm9kZV0pKTtcbiAgICAgICAgaWYgKGNkID09PSBSRU1PVkUpXG4gICAgICAgICAgICBub2RlLmNvbnRlbnRzID0gbnVsbDtcbiAgICB9XG4gICAgZWxzZVxuICAgICAgICB2aXNpdF8obnVsbCwgbm9kZSwgdmlzaXRvcl8sIE9iamVjdC5mcmVlemUoW10pKTtcbn1cbi8vIFdpdGhvdXQgdGhlIGBhcyBzeW1ib2xgIGNhc3RzLCBUUyBkZWNsYXJlcyB0aGVzZSBpbiB0aGUgYHZpc2l0YFxuLy8gbmFtZXNwYWNlIHVzaW5nIGB2YXJgLCBidXQgdGhlbiBjb21wbGFpbnMgYWJvdXQgdGhhdCBiZWNhdXNlXG4vLyBgdW5pcXVlIHN5bWJvbGAgbXVzdCBiZSBgY29uc3RgLlxuLyoqIFRlcm1pbmF0ZSB2aXNpdCB0cmF2ZXJzYWwgY29tcGxldGVseSAqL1xudmlzaXQuQlJFQUsgPSBCUkVBSztcbi8qKiBEbyBub3QgdmlzaXQgdGhlIGNoaWxkcmVuIG9mIHRoZSBjdXJyZW50IG5vZGUgKi9cbnZpc2l0LlNLSVAgPSBTS0lQO1xuLyoqIFJlbW92ZSB0aGUgY3VycmVudCBub2RlICovXG52aXNpdC5SRU1PVkUgPSBSRU1PVkU7XG5mdW5jdGlvbiB2aXNpdF8oa2V5LCBub2RlLCB2aXNpdG9yLCBwYXRoKSB7XG4gICAgY29uc3QgY3RybCA9IGNhbGxWaXNpdG9yKGtleSwgbm9kZSwgdmlzaXRvciwgcGF0aCk7XG4gICAgaWYgKGlkZW50aXR5LmlzTm9kZShjdHJsKSB8fCBpZGVudGl0eS5pc1BhaXIoY3RybCkpIHtcbiAgICAgICAgcmVwbGFjZU5vZGUoa2V5LCBwYXRoLCBjdHJsKTtcbiAgICAgICAgcmV0dXJuIHZpc2l0XyhrZXksIGN0cmwsIHZpc2l0b3IsIHBhdGgpO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGN0cmwgIT09ICdzeW1ib2wnKSB7XG4gICAgICAgIGlmIChpZGVudGl0eS5pc0NvbGxlY3Rpb24obm9kZSkpIHtcbiAgICAgICAgICAgIHBhdGggPSBPYmplY3QuZnJlZXplKHBhdGguY29uY2F0KG5vZGUpKTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZS5pdGVtcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNpID0gdmlzaXRfKGksIG5vZGUuaXRlbXNbaV0sIHZpc2l0b3IsIHBhdGgpO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY2kgPT09ICdudW1iZXInKVxuICAgICAgICAgICAgICAgICAgICBpID0gY2kgLSAxO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNpID09PSBCUkVBSylcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEJSRUFLO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNpID09PSBSRU1PVkUpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5pdGVtcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGkgLT0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaWRlbnRpdHkuaXNQYWlyKG5vZGUpKSB7XG4gICAgICAgICAgICBwYXRoID0gT2JqZWN0LmZyZWV6ZShwYXRoLmNvbmNhdChub2RlKSk7XG4gICAgICAgICAgICBjb25zdCBjayA9IHZpc2l0Xygna2V5Jywgbm9kZS5rZXksIHZpc2l0b3IsIHBhdGgpO1xuICAgICAgICAgICAgaWYgKGNrID09PSBCUkVBSylcbiAgICAgICAgICAgICAgICByZXR1cm4gQlJFQUs7XG4gICAgICAgICAgICBlbHNlIGlmIChjayA9PT0gUkVNT1ZFKVxuICAgICAgICAgICAgICAgIG5vZGUua2V5ID0gbnVsbDtcbiAgICAgICAgICAgIGNvbnN0IGN2ID0gdmlzaXRfKCd2YWx1ZScsIG5vZGUudmFsdWUsIHZpc2l0b3IsIHBhdGgpO1xuICAgICAgICAgICAgaWYgKGN2ID09PSBCUkVBSylcbiAgICAgICAgICAgICAgICByZXR1cm4gQlJFQUs7XG4gICAgICAgICAgICBlbHNlIGlmIChjdiA9PT0gUkVNT1ZFKVxuICAgICAgICAgICAgICAgIG5vZGUudmFsdWUgPSBudWxsO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjdHJsO1xufVxuLyoqXG4gKiBBcHBseSBhbiBhc3luYyB2aXNpdG9yIHRvIGFuIEFTVCBub2RlIG9yIGRvY3VtZW50LlxuICpcbiAqIFdhbGtzIHRocm91Z2ggdGhlIHRyZWUgKGRlcHRoLWZpcnN0KSBzdGFydGluZyBmcm9tIGBub2RlYCwgY2FsbGluZyBhXG4gKiBgdmlzaXRvcmAgZnVuY3Rpb24gd2l0aCB0aHJlZSBhcmd1bWVudHM6XG4gKiAgIC0gYGtleWA6IEZvciBzZXF1ZW5jZSB2YWx1ZXMgYW5kIG1hcCBgUGFpcmAsIHRoZSBub2RlJ3MgaW5kZXggaW4gdGhlXG4gKiAgICAgY29sbGVjdGlvbi4gV2l0aGluIGEgYFBhaXJgLCBgJ2tleSdgIG9yIGAndmFsdWUnYCwgY29ycmVzcG9uZGluZ2x5LlxuICogICAgIGBudWxsYCBmb3IgdGhlIHJvb3Qgbm9kZS5cbiAqICAgLSBgbm9kZWA6IFRoZSBjdXJyZW50IG5vZGUuXG4gKiAgIC0gYHBhdGhgOiBUaGUgYW5jZXN0cnkgb2YgdGhlIGN1cnJlbnQgbm9kZS5cbiAqXG4gKiBUaGUgcmV0dXJuIHZhbHVlIG9mIHRoZSB2aXNpdG9yIG1heSBiZSB1c2VkIHRvIGNvbnRyb2wgdGhlIHRyYXZlcnNhbDpcbiAqICAgLSBgUHJvbWlzZWA6IE11c3QgcmVzb2x2ZSB0byBvbmUgb2YgdGhlIGZvbGxvd2luZyB2YWx1ZXNcbiAqICAgLSBgdW5kZWZpbmVkYCAoZGVmYXVsdCk6IERvIG5vdGhpbmcgYW5kIGNvbnRpbnVlXG4gKiAgIC0gYHZpc2l0LlNLSVBgOiBEbyBub3QgdmlzaXQgdGhlIGNoaWxkcmVuIG9mIHRoaXMgbm9kZSwgY29udGludWUgd2l0aCBuZXh0XG4gKiAgICAgc2libGluZ1xuICogICAtIGB2aXNpdC5CUkVBS2A6IFRlcm1pbmF0ZSB0cmF2ZXJzYWwgY29tcGxldGVseVxuICogICAtIGB2aXNpdC5SRU1PVkVgOiBSZW1vdmUgdGhlIGN1cnJlbnQgbm9kZSwgdGhlbiBjb250aW51ZSB3aXRoIHRoZSBuZXh0IG9uZVxuICogICAtIGBOb2RlYDogUmVwbGFjZSB0aGUgY3VycmVudCBub2RlLCB0aGVuIGNvbnRpbnVlIGJ5IHZpc2l0aW5nIGl0XG4gKiAgIC0gYG51bWJlcmA6IFdoaWxlIGl0ZXJhdGluZyB0aGUgaXRlbXMgb2YgYSBzZXF1ZW5jZSBvciBtYXAsIHNldCB0aGUgaW5kZXhcbiAqICAgICBvZiB0aGUgbmV4dCBzdGVwLiBUaGlzIGlzIHVzZWZ1bCBlc3BlY2lhbGx5IGlmIHRoZSBpbmRleCBvZiB0aGUgY3VycmVudFxuICogICAgIG5vZGUgaGFzIGNoYW5nZWQuXG4gKlxuICogSWYgYHZpc2l0b3JgIGlzIGEgc2luZ2xlIGZ1bmN0aW9uLCBpdCB3aWxsIGJlIGNhbGxlZCB3aXRoIGFsbCB2YWx1ZXNcbiAqIGVuY291bnRlcmVkIGluIHRoZSB0cmVlLCBpbmNsdWRpbmcgZS5nLiBgbnVsbGAgdmFsdWVzLiBBbHRlcm5hdGl2ZWx5LFxuICogc2VwYXJhdGUgdmlzaXRvciBmdW5jdGlvbnMgbWF5IGJlIGRlZmluZWQgZm9yIGVhY2ggYE1hcGAsIGBQYWlyYCwgYFNlcWAsXG4gKiBgQWxpYXNgIGFuZCBgU2NhbGFyYCBub2RlLiBUbyBkZWZpbmUgdGhlIHNhbWUgdmlzaXRvciBmdW5jdGlvbiBmb3IgbW9yZSB0aGFuXG4gKiBvbmUgbm9kZSB0eXBlLCB1c2UgdGhlIGBDb2xsZWN0aW9uYCAobWFwIGFuZCBzZXEpLCBgVmFsdWVgIChtYXAsIHNlcSAmIHNjYWxhcilcbiAqIGFuZCBgTm9kZWAgKGFsaWFzLCBtYXAsIHNlcSAmIHNjYWxhcikgdGFyZ2V0cy4gT2YgYWxsIHRoZXNlLCBvbmx5IHRoZSBtb3N0XG4gKiBzcGVjaWZpYyBkZWZpbmVkIG9uZSB3aWxsIGJlIHVzZWQgZm9yIGVhY2ggbm9kZS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gdmlzaXRBc3luYyhub2RlLCB2aXNpdG9yKSB7XG4gICAgY29uc3QgdmlzaXRvcl8gPSBpbml0VmlzaXRvcih2aXNpdG9yKTtcbiAgICBpZiAoaWRlbnRpdHkuaXNEb2N1bWVudChub2RlKSkge1xuICAgICAgICBjb25zdCBjZCA9IGF3YWl0IHZpc2l0QXN5bmNfKG51bGwsIG5vZGUuY29udGVudHMsIHZpc2l0b3JfLCBPYmplY3QuZnJlZXplKFtub2RlXSkpO1xuICAgICAgICBpZiAoY2QgPT09IFJFTU9WRSlcbiAgICAgICAgICAgIG5vZGUuY29udGVudHMgPSBudWxsO1xuICAgIH1cbiAgICBlbHNlXG4gICAgICAgIGF3YWl0IHZpc2l0QXN5bmNfKG51bGwsIG5vZGUsIHZpc2l0b3JfLCBPYmplY3QuZnJlZXplKFtdKSk7XG59XG4vLyBXaXRob3V0IHRoZSBgYXMgc3ltYm9sYCBjYXN0cywgVFMgZGVjbGFyZXMgdGhlc2UgaW4gdGhlIGB2aXNpdGBcbi8vIG5hbWVzcGFjZSB1c2luZyBgdmFyYCwgYnV0IHRoZW4gY29tcGxhaW5zIGFib3V0IHRoYXQgYmVjYXVzZVxuLy8gYHVuaXF1ZSBzeW1ib2xgIG11c3QgYmUgYGNvbnN0YC5cbi8qKiBUZXJtaW5hdGUgdmlzaXQgdHJhdmVyc2FsIGNvbXBsZXRlbHkgKi9cbnZpc2l0QXN5bmMuQlJFQUsgPSBCUkVBSztcbi8qKiBEbyBub3QgdmlzaXQgdGhlIGNoaWxkcmVuIG9mIHRoZSBjdXJyZW50IG5vZGUgKi9cbnZpc2l0QXN5bmMuU0tJUCA9IFNLSVA7XG4vKiogUmVtb3ZlIHRoZSBjdXJyZW50IG5vZGUgKi9cbnZpc2l0QXN5bmMuUkVNT1ZFID0gUkVNT1ZFO1xuYXN5bmMgZnVuY3Rpb24gdmlzaXRBc3luY18oa2V5LCBub2RlLCB2aXNpdG9yLCBwYXRoKSB7XG4gICAgY29uc3QgY3RybCA9IGF3YWl0IGNhbGxWaXNpdG9yKGtleSwgbm9kZSwgdmlzaXRvciwgcGF0aCk7XG4gICAgaWYgKGlkZW50aXR5LmlzTm9kZShjdHJsKSB8fCBpZGVudGl0eS5pc1BhaXIoY3RybCkpIHtcbiAgICAgICAgcmVwbGFjZU5vZGUoa2V5LCBwYXRoLCBjdHJsKTtcbiAgICAgICAgcmV0dXJuIHZpc2l0QXN5bmNfKGtleSwgY3RybCwgdmlzaXRvciwgcGF0aCk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgY3RybCAhPT0gJ3N5bWJvbCcpIHtcbiAgICAgICAgaWYgKGlkZW50aXR5LmlzQ29sbGVjdGlvbihub2RlKSkge1xuICAgICAgICAgICAgcGF0aCA9IE9iamVjdC5mcmVlemUocGF0aC5jb25jYXQobm9kZSkpO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2RlLml0ZW1zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2kgPSBhd2FpdCB2aXNpdEFzeW5jXyhpLCBub2RlLml0ZW1zW2ldLCB2aXNpdG9yLCBwYXRoKTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNpID09PSAnbnVtYmVyJylcbiAgICAgICAgICAgICAgICAgICAgaSA9IGNpIC0gMTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChjaSA9PT0gQlJFQUspXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBCUkVBSztcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChjaSA9PT0gUkVNT1ZFKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUuaXRlbXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICBpIC09IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGlkZW50aXR5LmlzUGFpcihub2RlKSkge1xuICAgICAgICAgICAgcGF0aCA9IE9iamVjdC5mcmVlemUocGF0aC5jb25jYXQobm9kZSkpO1xuICAgICAgICAgICAgY29uc3QgY2sgPSBhd2FpdCB2aXNpdEFzeW5jXygna2V5Jywgbm9kZS5rZXksIHZpc2l0b3IsIHBhdGgpO1xuICAgICAgICAgICAgaWYgKGNrID09PSBCUkVBSylcbiAgICAgICAgICAgICAgICByZXR1cm4gQlJFQUs7XG4gICAgICAgICAgICBlbHNlIGlmIChjayA9PT0gUkVNT1ZFKVxuICAgICAgICAgICAgICAgIG5vZGUua2V5ID0gbnVsbDtcbiAgICAgICAgICAgIGNvbnN0IGN2ID0gYXdhaXQgdmlzaXRBc3luY18oJ3ZhbHVlJywgbm9kZS52YWx1ZSwgdmlzaXRvciwgcGF0aCk7XG4gICAgICAgICAgICBpZiAoY3YgPT09IEJSRUFLKVxuICAgICAgICAgICAgICAgIHJldHVybiBCUkVBSztcbiAgICAgICAgICAgIGVsc2UgaWYgKGN2ID09PSBSRU1PVkUpXG4gICAgICAgICAgICAgICAgbm9kZS52YWx1ZSA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGN0cmw7XG59XG5mdW5jdGlvbiBpbml0VmlzaXRvcih2aXNpdG9yKSB7XG4gICAgaWYgKHR5cGVvZiB2aXNpdG9yID09PSAnb2JqZWN0JyAmJlxuICAgICAgICAodmlzaXRvci5Db2xsZWN0aW9uIHx8IHZpc2l0b3IuTm9kZSB8fCB2aXNpdG9yLlZhbHVlKSkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICBBbGlhczogdmlzaXRvci5Ob2RlLFxuICAgICAgICAgICAgTWFwOiB2aXNpdG9yLk5vZGUsXG4gICAgICAgICAgICBTY2FsYXI6IHZpc2l0b3IuTm9kZSxcbiAgICAgICAgICAgIFNlcTogdmlzaXRvci5Ob2RlXG4gICAgICAgIH0sIHZpc2l0b3IuVmFsdWUgJiYge1xuICAgICAgICAgICAgTWFwOiB2aXNpdG9yLlZhbHVlLFxuICAgICAgICAgICAgU2NhbGFyOiB2aXNpdG9yLlZhbHVlLFxuICAgICAgICAgICAgU2VxOiB2aXNpdG9yLlZhbHVlXG4gICAgICAgIH0sIHZpc2l0b3IuQ29sbGVjdGlvbiAmJiB7XG4gICAgICAgICAgICBNYXA6IHZpc2l0b3IuQ29sbGVjdGlvbixcbiAgICAgICAgICAgIFNlcTogdmlzaXRvci5Db2xsZWN0aW9uXG4gICAgICAgIH0sIHZpc2l0b3IpO1xuICAgIH1cbiAgICByZXR1cm4gdmlzaXRvcjtcbn1cbmZ1bmN0aW9uIGNhbGxWaXNpdG9yKGtleSwgbm9kZSwgdmlzaXRvciwgcGF0aCkge1xuICAgIGlmICh0eXBlb2YgdmlzaXRvciA9PT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgcmV0dXJuIHZpc2l0b3Ioa2V5LCBub2RlLCBwYXRoKTtcbiAgICBpZiAoaWRlbnRpdHkuaXNNYXAobm9kZSkpXG4gICAgICAgIHJldHVybiB2aXNpdG9yLk1hcD8uKGtleSwgbm9kZSwgcGF0aCk7XG4gICAgaWYgKGlkZW50aXR5LmlzU2VxKG5vZGUpKVxuICAgICAgICByZXR1cm4gdmlzaXRvci5TZXE/LihrZXksIG5vZGUsIHBhdGgpO1xuICAgIGlmIChpZGVudGl0eS5pc1BhaXIobm9kZSkpXG4gICAgICAgIHJldHVybiB2aXNpdG9yLlBhaXI/LihrZXksIG5vZGUsIHBhdGgpO1xuICAgIGlmIChpZGVudGl0eS5pc1NjYWxhcihub2RlKSlcbiAgICAgICAgcmV0dXJuIHZpc2l0b3IuU2NhbGFyPy4oa2V5LCBub2RlLCBwYXRoKTtcbiAgICBpZiAoaWRlbnRpdHkuaXNBbGlhcyhub2RlKSlcbiAgICAgICAgcmV0dXJuIHZpc2l0b3IuQWxpYXM/LihrZXksIG5vZGUsIHBhdGgpO1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG59XG5mdW5jdGlvbiByZXBsYWNlTm9kZShrZXksIHBhdGgsIG5vZGUpIHtcbiAgICBjb25zdCBwYXJlbnQgPSBwYXRoW3BhdGgubGVuZ3RoIC0gMV07XG4gICAgaWYgKGlkZW50aXR5LmlzQ29sbGVjdGlvbihwYXJlbnQpKSB7XG4gICAgICAgIHBhcmVudC5pdGVtc1trZXldID0gbm9kZTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaWRlbnRpdHkuaXNQYWlyKHBhcmVudCkpIHtcbiAgICAgICAgaWYgKGtleSA9PT0gJ2tleScpXG4gICAgICAgICAgICBwYXJlbnQua2V5ID0gbm9kZTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcGFyZW50LnZhbHVlID0gbm9kZTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaWRlbnRpdHkuaXNEb2N1bWVudChwYXJlbnQpKSB7XG4gICAgICAgIHBhcmVudC5jb250ZW50cyA9IG5vZGU7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjb25zdCBwdCA9IGlkZW50aXR5LmlzQWxpYXMocGFyZW50KSA/ICdhbGlhcycgOiAnc2NhbGFyJztcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW5ub3QgcmVwbGFjZSBub2RlIHdpdGggJHtwdH0gcGFyZW50YCk7XG4gICAgfVxufVxuXG5leHBvcnRzLnZpc2l0ID0gdmlzaXQ7XG5leHBvcnRzLnZpc2l0QXN5bmMgPSB2aXNpdEFzeW5jO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBpZGVudGl0eSA9IHJlcXVpcmUoJy4uL25vZGVzL2lkZW50aXR5LmpzJyk7XG52YXIgdmlzaXQgPSByZXF1aXJlKCcuLi92aXNpdC5qcycpO1xuXG5jb25zdCBlc2NhcGVDaGFycyA9IHtcbiAgICAnISc6ICclMjEnLFxuICAgICcsJzogJyUyQycsXG4gICAgJ1snOiAnJTVCJyxcbiAgICAnXSc6ICclNUQnLFxuICAgICd7JzogJyU3QicsXG4gICAgJ30nOiAnJTdEJ1xufTtcbmNvbnN0IGVzY2FwZVRhZ05hbWUgPSAodG4pID0+IHRuLnJlcGxhY2UoL1shLFtcXF17fV0vZywgY2ggPT4gZXNjYXBlQ2hhcnNbY2hdKTtcbmNsYXNzIERpcmVjdGl2ZXMge1xuICAgIGNvbnN0cnVjdG9yKHlhbWwsIHRhZ3MpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSBkaXJlY3RpdmVzLWVuZC9kb2Mtc3RhcnQgbWFya2VyIGAtLS1gLiBJZiBgbnVsbGAsIGEgbWFya2VyIG1heSBzdGlsbCBiZVxuICAgICAgICAgKiBpbmNsdWRlZCBpbiB0aGUgZG9jdW1lbnQncyBzdHJpbmdpZmllZCByZXByZXNlbnRhdGlvbi5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZG9jU3RhcnQgPSBudWxsO1xuICAgICAgICAvKiogVGhlIGRvYy1lbmQgbWFya2VyIGAuLi5gLiAgKi9cbiAgICAgICAgdGhpcy5kb2NFbmQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy55YW1sID0gT2JqZWN0LmFzc2lnbih7fSwgRGlyZWN0aXZlcy5kZWZhdWx0WWFtbCwgeWFtbCk7XG4gICAgICAgIHRoaXMudGFncyA9IE9iamVjdC5hc3NpZ24oe30sIERpcmVjdGl2ZXMuZGVmYXVsdFRhZ3MsIHRhZ3MpO1xuICAgIH1cbiAgICBjbG9uZSgpIHtcbiAgICAgICAgY29uc3QgY29weSA9IG5ldyBEaXJlY3RpdmVzKHRoaXMueWFtbCwgdGhpcy50YWdzKTtcbiAgICAgICAgY29weS5kb2NTdGFydCA9IHRoaXMuZG9jU3RhcnQ7XG4gICAgICAgIHJldHVybiBjb3B5O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBEdXJpbmcgcGFyc2luZywgZ2V0IGEgRGlyZWN0aXZlcyBpbnN0YW5jZSBmb3IgdGhlIGN1cnJlbnQgZG9jdW1lbnQgYW5kXG4gICAgICogdXBkYXRlIHRoZSBzdHJlYW0gc3RhdGUgYWNjb3JkaW5nIHRvIHRoZSBjdXJyZW50IHZlcnNpb24ncyBzcGVjLlxuICAgICAqL1xuICAgIGF0RG9jdW1lbnQoKSB7XG4gICAgICAgIGNvbnN0IHJlcyA9IG5ldyBEaXJlY3RpdmVzKHRoaXMueWFtbCwgdGhpcy50YWdzKTtcbiAgICAgICAgc3dpdGNoICh0aGlzLnlhbWwudmVyc2lvbikge1xuICAgICAgICAgICAgY2FzZSAnMS4xJzpcbiAgICAgICAgICAgICAgICB0aGlzLmF0TmV4dERvY3VtZW50ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJzEuMic6XG4gICAgICAgICAgICAgICAgdGhpcy5hdE5leHREb2N1bWVudCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMueWFtbCA9IHtcbiAgICAgICAgICAgICAgICAgICAgZXhwbGljaXQ6IERpcmVjdGl2ZXMuZGVmYXVsdFlhbWwuZXhwbGljaXQsXG4gICAgICAgICAgICAgICAgICAgIHZlcnNpb246ICcxLjInXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0aGlzLnRhZ3MgPSBPYmplY3QuYXNzaWduKHt9LCBEaXJlY3RpdmVzLmRlZmF1bHRUYWdzKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBAcGFyYW0gb25FcnJvciAtIE1heSBiZSBjYWxsZWQgZXZlbiBpZiB0aGUgYWN0aW9uIHdhcyBzdWNjZXNzZnVsXG4gICAgICogQHJldHVybnMgYHRydWVgIG9uIHN1Y2Nlc3NcbiAgICAgKi9cbiAgICBhZGQobGluZSwgb25FcnJvcikge1xuICAgICAgICBpZiAodGhpcy5hdE5leHREb2N1bWVudCkge1xuICAgICAgICAgICAgdGhpcy55YW1sID0geyBleHBsaWNpdDogRGlyZWN0aXZlcy5kZWZhdWx0WWFtbC5leHBsaWNpdCwgdmVyc2lvbjogJzEuMScgfTtcbiAgICAgICAgICAgIHRoaXMudGFncyA9IE9iamVjdC5hc3NpZ24oe30sIERpcmVjdGl2ZXMuZGVmYXVsdFRhZ3MpO1xuICAgICAgICAgICAgdGhpcy5hdE5leHREb2N1bWVudCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBhcnRzID0gbGluZS50cmltKCkuc3BsaXQoL1sgXFx0XSsvKTtcbiAgICAgICAgY29uc3QgbmFtZSA9IHBhcnRzLnNoaWZ0KCk7XG4gICAgICAgIHN3aXRjaCAobmFtZSkge1xuICAgICAgICAgICAgY2FzZSAnJVRBRyc6IHtcbiAgICAgICAgICAgICAgICBpZiAocGFydHMubGVuZ3RoICE9PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IoMCwgJyVUQUcgZGlyZWN0aXZlIHNob3VsZCBjb250YWluIGV4YWN0bHkgdHdvIHBhcnRzJyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPCAyKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBbaGFuZGxlLCBwcmVmaXhdID0gcGFydHM7XG4gICAgICAgICAgICAgICAgdGhpcy50YWdzW2hhbmRsZV0gPSBwcmVmaXg7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlICclWUFNTCc6IHtcbiAgICAgICAgICAgICAgICB0aGlzLnlhbWwuZXhwbGljaXQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGlmIChwYXJ0cy5sZW5ndGggIT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcigwLCAnJVlBTUwgZGlyZWN0aXZlIHNob3VsZCBjb250YWluIGV4YWN0bHkgb25lIHBhcnQnKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBbdmVyc2lvbl0gPSBwYXJ0cztcbiAgICAgICAgICAgICAgICBpZiAodmVyc2lvbiA9PT0gJzEuMScgfHwgdmVyc2lvbiA9PT0gJzEuMicpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy55YW1sLnZlcnNpb24gPSB2ZXJzaW9uO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGlzVmFsaWQgPSAvXlxcZCtcXC5cXGQrJC8udGVzdCh2ZXJzaW9uKTtcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcig2LCBgVW5zdXBwb3J0ZWQgWUFNTCB2ZXJzaW9uICR7dmVyc2lvbn1gLCBpc1ZhbGlkKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgb25FcnJvcigwLCBgVW5rbm93biBkaXJlY3RpdmUgJHtuYW1lfWAsIHRydWUpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXNvbHZlcyBhIHRhZywgbWF0Y2hpbmcgaGFuZGxlcyB0byB0aG9zZSBkZWZpbmVkIGluICVUQUcgZGlyZWN0aXZlcy5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIFJlc29sdmVkIHRhZywgd2hpY2ggbWF5IGFsc28gYmUgdGhlIG5vbi1zcGVjaWZpYyB0YWcgYCchJ2Agb3IgYVxuICAgICAqICAgYCchbG9jYWwnYCB0YWcsIG9yIGBudWxsYCBpZiB1bnJlc29sdmFibGUuXG4gICAgICovXG4gICAgdGFnTmFtZShzb3VyY2UsIG9uRXJyb3IpIHtcbiAgICAgICAgaWYgKHNvdXJjZSA9PT0gJyEnKVxuICAgICAgICAgICAgcmV0dXJuICchJzsgLy8gbm9uLXNwZWNpZmljIHRhZ1xuICAgICAgICBpZiAoc291cmNlWzBdICE9PSAnIScpIHtcbiAgICAgICAgICAgIG9uRXJyb3IoYE5vdCBhIHZhbGlkIHRhZzogJHtzb3VyY2V9YCk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc291cmNlWzFdID09PSAnPCcpIHtcbiAgICAgICAgICAgIGNvbnN0IHZlcmJhdGltID0gc291cmNlLnNsaWNlKDIsIC0xKTtcbiAgICAgICAgICAgIGlmICh2ZXJiYXRpbSA9PT0gJyEnIHx8IHZlcmJhdGltID09PSAnISEnKSB7XG4gICAgICAgICAgICAgICAgb25FcnJvcihgVmVyYmF0aW0gdGFncyBhcmVuJ3QgcmVzb2x2ZWQsIHNvICR7c291cmNlfSBpcyBpbnZhbGlkLmApO1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNvdXJjZVtzb3VyY2UubGVuZ3RoIC0gMV0gIT09ICc+JylcbiAgICAgICAgICAgICAgICBvbkVycm9yKCdWZXJiYXRpbSB0YWdzIG11c3QgZW5kIHdpdGggYSA+Jyk7XG4gICAgICAgICAgICByZXR1cm4gdmVyYmF0aW07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgWywgaGFuZGxlLCBzdWZmaXhdID0gc291cmNlLm1hdGNoKC9eKC4qISkoW14hXSopJC9zKTtcbiAgICAgICAgaWYgKCFzdWZmaXgpXG4gICAgICAgICAgICBvbkVycm9yKGBUaGUgJHtzb3VyY2V9IHRhZyBoYXMgbm8gc3VmZml4YCk7XG4gICAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMudGFnc1toYW5kbGVdO1xuICAgICAgICBpZiAocHJlZml4KSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcmVmaXggKyBkZWNvZGVVUklDb21wb25lbnQoc3VmZml4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIG9uRXJyb3IoU3RyaW5nKGVycm9yKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGhhbmRsZSA9PT0gJyEnKVxuICAgICAgICAgICAgcmV0dXJuIHNvdXJjZTsgLy8gbG9jYWwgdGFnXG4gICAgICAgIG9uRXJyb3IoYENvdWxkIG5vdCByZXNvbHZlIHRhZzogJHtzb3VyY2V9YCk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHaXZlbiBhIGZ1bGx5IHJlc29sdmVkIHRhZywgcmV0dXJucyBpdHMgcHJpbnRhYmxlIHN0cmluZyBmb3JtLFxuICAgICAqIHRha2luZyBpbnRvIGFjY291bnQgY3VycmVudCB0YWcgcHJlZml4ZXMgYW5kIGRlZmF1bHRzLlxuICAgICAqL1xuICAgIHRhZ1N0cmluZyh0YWcpIHtcbiAgICAgICAgZm9yIChjb25zdCBbaGFuZGxlLCBwcmVmaXhdIG9mIE9iamVjdC5lbnRyaWVzKHRoaXMudGFncykpIHtcbiAgICAgICAgICAgIGlmICh0YWcuc3RhcnRzV2l0aChwcmVmaXgpKVxuICAgICAgICAgICAgICAgIHJldHVybiBoYW5kbGUgKyBlc2NhcGVUYWdOYW1lKHRhZy5zdWJzdHJpbmcocHJlZml4Lmxlbmd0aCkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0YWdbMF0gPT09ICchJyA/IHRhZyA6IGAhPCR7dGFnfT5gO1xuICAgIH1cbiAgICB0b1N0cmluZyhkb2MpIHtcbiAgICAgICAgY29uc3QgbGluZXMgPSB0aGlzLnlhbWwuZXhwbGljaXRcbiAgICAgICAgICAgID8gW2AlWUFNTCAke3RoaXMueWFtbC52ZXJzaW9uIHx8ICcxLjInfWBdXG4gICAgICAgICAgICA6IFtdO1xuICAgICAgICBjb25zdCB0YWdFbnRyaWVzID0gT2JqZWN0LmVudHJpZXModGhpcy50YWdzKTtcbiAgICAgICAgbGV0IHRhZ05hbWVzO1xuICAgICAgICBpZiAoZG9jICYmIHRhZ0VudHJpZXMubGVuZ3RoID4gMCAmJiBpZGVudGl0eS5pc05vZGUoZG9jLmNvbnRlbnRzKSkge1xuICAgICAgICAgICAgY29uc3QgdGFncyA9IHt9O1xuICAgICAgICAgICAgdmlzaXQudmlzaXQoZG9jLmNvbnRlbnRzLCAoX2tleSwgbm9kZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChpZGVudGl0eS5pc05vZGUobm9kZSkgJiYgbm9kZS50YWcpXG4gICAgICAgICAgICAgICAgICAgIHRhZ3Nbbm9kZS50YWddID0gdHJ1ZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGFnTmFtZXMgPSBPYmplY3Qua2V5cyh0YWdzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0YWdOYW1lcyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IFtoYW5kbGUsIHByZWZpeF0gb2YgdGFnRW50cmllcykge1xuICAgICAgICAgICAgaWYgKGhhbmRsZSA9PT0gJyEhJyAmJiBwcmVmaXggPT09ICd0YWc6eWFtbC5vcmcsMjAwMjonKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgaWYgKCFkb2MgfHwgdGFnTmFtZXMuc29tZSh0biA9PiB0bi5zdGFydHNXaXRoKHByZWZpeCkpKVxuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goYCVUQUcgJHtoYW5kbGV9ICR7cHJlZml4fWApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsaW5lcy5qb2luKCdcXG4nKTtcbiAgICB9XG59XG5EaXJlY3RpdmVzLmRlZmF1bHRZYW1sID0geyBleHBsaWNpdDogZmFsc2UsIHZlcnNpb246ICcxLjInIH07XG5EaXJlY3RpdmVzLmRlZmF1bHRUYWdzID0geyAnISEnOiAndGFnOnlhbWwub3JnLDIwMDI6JyB9O1xuXG5leHBvcnRzLkRpcmVjdGl2ZXMgPSBEaXJlY3RpdmVzO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBpZGVudGl0eSA9IHJlcXVpcmUoJy4uL25vZGVzL2lkZW50aXR5LmpzJyk7XG52YXIgdmlzaXQgPSByZXF1aXJlKCcuLi92aXNpdC5qcycpO1xuXG4vKipcbiAqIFZlcmlmeSB0aGF0IHRoZSBpbnB1dCBzdHJpbmcgaXMgYSB2YWxpZCBhbmNob3IuXG4gKlxuICogV2lsbCB0aHJvdyBvbiBlcnJvcnMuXG4gKi9cbmZ1bmN0aW9uIGFuY2hvcklzVmFsaWQoYW5jaG9yKSB7XG4gICAgaWYgKC9bXFx4MDAtXFx4MTlcXHMsW1xcXXt9XS8udGVzdChhbmNob3IpKSB7XG4gICAgICAgIGNvbnN0IHNhID0gSlNPTi5zdHJpbmdpZnkoYW5jaG9yKTtcbiAgICAgICAgY29uc3QgbXNnID0gYEFuY2hvciBtdXN0IG5vdCBjb250YWluIHdoaXRlc3BhY2Ugb3IgY29udHJvbCBjaGFyYWN0ZXJzOiAke3NhfWA7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn1cbmZ1bmN0aW9uIGFuY2hvck5hbWVzKHJvb3QpIHtcbiAgICBjb25zdCBhbmNob3JzID0gbmV3IFNldCgpO1xuICAgIHZpc2l0LnZpc2l0KHJvb3QsIHtcbiAgICAgICAgVmFsdWUoX2tleSwgbm9kZSkge1xuICAgICAgICAgICAgaWYgKG5vZGUuYW5jaG9yKVxuICAgICAgICAgICAgICAgIGFuY2hvcnMuYWRkKG5vZGUuYW5jaG9yKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBhbmNob3JzO1xufVxuLyoqIEZpbmQgYSBuZXcgYW5jaG9yIG5hbWUgd2l0aCB0aGUgZ2l2ZW4gYHByZWZpeGAgYW5kIGEgb25lLWluZGV4ZWQgc3VmZml4LiAqL1xuZnVuY3Rpb24gZmluZE5ld0FuY2hvcihwcmVmaXgsIGV4Y2x1ZGUpIHtcbiAgICBmb3IgKGxldCBpID0gMTsgdHJ1ZTsgKytpKSB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBgJHtwcmVmaXh9JHtpfWA7XG4gICAgICAgIGlmICghZXhjbHVkZS5oYXMobmFtZSkpXG4gICAgICAgICAgICByZXR1cm4gbmFtZTtcbiAgICB9XG59XG5mdW5jdGlvbiBjcmVhdGVOb2RlQW5jaG9ycyhkb2MsIHByZWZpeCkge1xuICAgIGNvbnN0IGFsaWFzT2JqZWN0cyA9IFtdO1xuICAgIGNvbnN0IHNvdXJjZU9iamVjdHMgPSBuZXcgTWFwKCk7XG4gICAgbGV0IHByZXZBbmNob3JzID0gbnVsbDtcbiAgICByZXR1cm4ge1xuICAgICAgICBvbkFuY2hvcjogKHNvdXJjZSkgPT4ge1xuICAgICAgICAgICAgYWxpYXNPYmplY3RzLnB1c2goc291cmNlKTtcbiAgICAgICAgICAgIHByZXZBbmNob3JzID8/IChwcmV2QW5jaG9ycyA9IGFuY2hvck5hbWVzKGRvYykpO1xuICAgICAgICAgICAgY29uc3QgYW5jaG9yID0gZmluZE5ld0FuY2hvcihwcmVmaXgsIHByZXZBbmNob3JzKTtcbiAgICAgICAgICAgIHByZXZBbmNob3JzLmFkZChhbmNob3IpO1xuICAgICAgICAgICAgcmV0dXJuIGFuY2hvcjtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdpdGggY2lyY3VsYXIgcmVmZXJlbmNlcywgdGhlIHNvdXJjZSBub2RlIGlzIG9ubHkgcmVzb2x2ZWQgYWZ0ZXIgYWxsXG4gICAgICAgICAqIG9mIGl0cyBjaGlsZCBub2RlcyBhcmUuIFRoaXMgaXMgd2h5IGFuY2hvcnMgYXJlIHNldCBvbmx5IGFmdGVyIGFsbCBvZlxuICAgICAgICAgKiB0aGUgbm9kZXMgaGF2ZSBiZWVuIGNyZWF0ZWQuXG4gICAgICAgICAqL1xuICAgICAgICBzZXRBbmNob3JzOiAoKSA9PiB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHNvdXJjZSBvZiBhbGlhc09iamVjdHMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZWYgPSBzb3VyY2VPYmplY3RzLmdldChzb3VyY2UpO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcmVmID09PSAnb2JqZWN0JyAmJlxuICAgICAgICAgICAgICAgICAgICByZWYuYW5jaG9yICYmXG4gICAgICAgICAgICAgICAgICAgIChpZGVudGl0eS5pc1NjYWxhcihyZWYubm9kZSkgfHwgaWRlbnRpdHkuaXNDb2xsZWN0aW9uKHJlZi5ub2RlKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVmLm5vZGUuYW5jaG9yID0gcmVmLmFuY2hvcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yID0gbmV3IEVycm9yKCdGYWlsZWQgdG8gcmVzb2x2ZSByZXBlYXRlZCBvYmplY3QgKHRoaXMgc2hvdWxkIG5vdCBoYXBwZW4pJyk7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yLnNvdXJjZSA9IHNvdXJjZTtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBzb3VyY2VPYmplY3RzXG4gICAgfTtcbn1cblxuZXhwb3J0cy5hbmNob3JJc1ZhbGlkID0gYW5jaG9ySXNWYWxpZDtcbmV4cG9ydHMuYW5jaG9yTmFtZXMgPSBhbmNob3JOYW1lcztcbmV4cG9ydHMuY3JlYXRlTm9kZUFuY2hvcnMgPSBjcmVhdGVOb2RlQW5jaG9ycztcbmV4cG9ydHMuZmluZE5ld0FuY2hvciA9IGZpbmROZXdBbmNob3I7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBBcHBsaWVzIHRoZSBKU09OLnBhcnNlIHJldml2ZXIgYWxnb3JpdGhtIGFzIGRlZmluZWQgaW4gdGhlIEVDTUEtMjYyIHNwZWMsXG4gKiBpbiBzZWN0aW9uIDI0LjUuMS4xIFwiUnVudGltZSBTZW1hbnRpY3M6IEludGVybmFsaXplSlNPTlByb3BlcnR5XCIgb2YgdGhlXG4gKiAyMDIxIGVkaXRpb246IGh0dHBzOi8vdGMzOS5lcy9lY21hMjYyLyNzZWMtanNvbi5wYXJzZVxuICpcbiAqIEluY2x1ZGVzIGV4dGVuc2lvbnMgZm9yIGhhbmRsaW5nIE1hcCBhbmQgU2V0IG9iamVjdHMuXG4gKi9cbmZ1bmN0aW9uIGFwcGx5UmV2aXZlcihyZXZpdmVyLCBvYmosIGtleSwgdmFsKSB7XG4gICAgaWYgKHZhbCAmJiB0eXBlb2YgdmFsID09PSAnb2JqZWN0Jykge1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWwpKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gdmFsLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdjAgPSB2YWxbaV07XG4gICAgICAgICAgICAgICAgY29uc3QgdjEgPSBhcHBseVJldml2ZXIocmV2aXZlciwgdmFsLCBTdHJpbmcoaSksIHYwKTtcbiAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWFycmF5LWRlbGV0ZVxuICAgICAgICAgICAgICAgIGlmICh2MSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgdmFsW2ldO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHYxICE9PSB2MClcbiAgICAgICAgICAgICAgICAgICAgdmFsW2ldID0gdjE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodmFsIGluc3RhbmNlb2YgTWFwKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGsgb2YgQXJyYXkuZnJvbSh2YWwua2V5cygpKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHYwID0gdmFsLmdldChrKTtcbiAgICAgICAgICAgICAgICBjb25zdCB2MSA9IGFwcGx5UmV2aXZlcihyZXZpdmVyLCB2YWwsIGssIHYwKTtcbiAgICAgICAgICAgICAgICBpZiAodjEgPT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICAgICAgdmFsLmRlbGV0ZShrKTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmICh2MSAhPT0gdjApXG4gICAgICAgICAgICAgICAgICAgIHZhbC5zZXQoaywgdjEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHZhbCBpbnN0YW5jZW9mIFNldCkge1xuICAgICAgICAgICAgZm9yIChjb25zdCB2MCBvZiBBcnJheS5mcm9tKHZhbCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2MSA9IGFwcGx5UmV2aXZlcihyZXZpdmVyLCB2YWwsIHYwLCB2MCk7XG4gICAgICAgICAgICAgICAgaWYgKHYxID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgIHZhbC5kZWxldGUodjApO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHYxICE9PSB2MCkge1xuICAgICAgICAgICAgICAgICAgICB2YWwuZGVsZXRlKHYwKTtcbiAgICAgICAgICAgICAgICAgICAgdmFsLmFkZCh2MSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZm9yIChjb25zdCBbaywgdjBdIG9mIE9iamVjdC5lbnRyaWVzKHZhbCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2MSA9IGFwcGx5UmV2aXZlcihyZXZpdmVyLCB2YWwsIGssIHYwKTtcbiAgICAgICAgICAgICAgICBpZiAodjEgPT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHZhbFtrXTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmICh2MSAhPT0gdjApXG4gICAgICAgICAgICAgICAgICAgIHZhbFtrXSA9IHYxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXZpdmVyLmNhbGwob2JqLCBrZXksIHZhbCk7XG59XG5cbmV4cG9ydHMuYXBwbHlSZXZpdmVyID0gYXBwbHlSZXZpdmVyO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBpZGVudGl0eSA9IHJlcXVpcmUoJy4vaWRlbnRpdHkuanMnKTtcblxuLyoqXG4gKiBSZWN1cnNpdmVseSBjb252ZXJ0IGFueSBub2RlIG9yIGl0cyBjb250ZW50cyB0byBuYXRpdmUgSmF2YVNjcmlwdFxuICpcbiAqIEBwYXJhbSB2YWx1ZSAtIFRoZSBpbnB1dCB2YWx1ZVxuICogQHBhcmFtIGFyZyAtIElmIGB2YWx1ZWAgZGVmaW5lcyBhIGB0b0pTT04oKWAgbWV0aG9kLCB1c2UgdGhpc1xuICogICBhcyBpdHMgZmlyc3QgYXJndW1lbnRcbiAqIEBwYXJhbSBjdHggLSBDb252ZXJzaW9uIGNvbnRleHQsIG9yaWdpbmFsbHkgc2V0IGluIERvY3VtZW50I3RvSlMoKS4gSWZcbiAqICAgYHsga2VlcDogdHJ1ZSB9YCBpcyBub3Qgc2V0LCBvdXRwdXQgc2hvdWxkIGJlIHN1aXRhYmxlIGZvciBKU09OXG4gKiAgIHN0cmluZ2lmaWNhdGlvbi5cbiAqL1xuZnVuY3Rpb24gdG9KUyh2YWx1ZSwgYXJnLCBjdHgpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVuc2FmZS1yZXR1cm5cbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpXG4gICAgICAgIHJldHVybiB2YWx1ZS5tYXAoKHYsIGkpID0+IHRvSlModiwgU3RyaW5nKGkpLCBjdHgpKTtcbiAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlLnRvSlNPTiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVuc2FmZS1jYWxsXG4gICAgICAgIGlmICghY3R4IHx8ICFpZGVudGl0eS5oYXNBbmNob3IodmFsdWUpKVxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnRvSlNPTihhcmcsIGN0eCk7XG4gICAgICAgIGNvbnN0IGRhdGEgPSB7IGFsaWFzQ291bnQ6IDAsIGNvdW50OiAxLCByZXM6IHVuZGVmaW5lZCB9O1xuICAgICAgICBjdHguYW5jaG9ycy5zZXQodmFsdWUsIGRhdGEpO1xuICAgICAgICBjdHgub25DcmVhdGUgPSByZXMgPT4ge1xuICAgICAgICAgICAgZGF0YS5yZXMgPSByZXM7XG4gICAgICAgICAgICBkZWxldGUgY3R4Lm9uQ3JlYXRlO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCByZXMgPSB2YWx1ZS50b0pTT04oYXJnLCBjdHgpO1xuICAgICAgICBpZiAoY3R4Lm9uQ3JlYXRlKVxuICAgICAgICAgICAgY3R4Lm9uQ3JlYXRlKHJlcyk7XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdiaWdpbnQnICYmICFjdHg/LmtlZXApXG4gICAgICAgIHJldHVybiBOdW1iZXIodmFsdWUpO1xuICAgIHJldHVybiB2YWx1ZTtcbn1cblxuZXhwb3J0cy50b0pTID0gdG9KUztcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYXBwbHlSZXZpdmVyID0gcmVxdWlyZSgnLi4vZG9jL2FwcGx5UmV2aXZlci5qcycpO1xudmFyIGlkZW50aXR5ID0gcmVxdWlyZSgnLi9pZGVudGl0eS5qcycpO1xudmFyIHRvSlMgPSByZXF1aXJlKCcuL3RvSlMuanMnKTtcblxuY2xhc3MgTm9kZUJhc2Uge1xuICAgIGNvbnN0cnVjdG9yKHR5cGUpIHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIGlkZW50aXR5Lk5PREVfVFlQRSwgeyB2YWx1ZTogdHlwZSB9KTtcbiAgICB9XG4gICAgLyoqIENyZWF0ZSBhIGNvcHkgb2YgdGhpcyBub2RlLiAgKi9cbiAgICBjbG9uZSgpIHtcbiAgICAgICAgY29uc3QgY29weSA9IE9iamVjdC5jcmVhdGUoT2JqZWN0LmdldFByb3RvdHlwZU9mKHRoaXMpLCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyh0aGlzKSk7XG4gICAgICAgIGlmICh0aGlzLnJhbmdlKVxuICAgICAgICAgICAgY29weS5yYW5nZSA9IHRoaXMucmFuZ2Uuc2xpY2UoKTtcbiAgICAgICAgcmV0dXJuIGNvcHk7XG4gICAgfVxuICAgIC8qKiBBIHBsYWluIEphdmFTY3JpcHQgcmVwcmVzZW50YXRpb24gb2YgdGhpcyBub2RlLiAqL1xuICAgIHRvSlMoZG9jLCB7IG1hcEFzTWFwLCBtYXhBbGlhc0NvdW50LCBvbkFuY2hvciwgcmV2aXZlciB9ID0ge30pIHtcbiAgICAgICAgaWYgKCFpZGVudGl0eS5pc0RvY3VtZW50KGRvYykpXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBIGRvY3VtZW50IGFyZ3VtZW50IGlzIHJlcXVpcmVkJyk7XG4gICAgICAgIGNvbnN0IGN0eCA9IHtcbiAgICAgICAgICAgIGFuY2hvcnM6IG5ldyBNYXAoKSxcbiAgICAgICAgICAgIGRvYyxcbiAgICAgICAgICAgIGtlZXA6IHRydWUsXG4gICAgICAgICAgICBtYXBBc01hcDogbWFwQXNNYXAgPT09IHRydWUsXG4gICAgICAgICAgICBtYXBLZXlXYXJuZWQ6IGZhbHNlLFxuICAgICAgICAgICAgbWF4QWxpYXNDb3VudDogdHlwZW9mIG1heEFsaWFzQ291bnQgPT09ICdudW1iZXInID8gbWF4QWxpYXNDb3VudCA6IDEwMFxuICAgICAgICB9O1xuICAgICAgICBjb25zdCByZXMgPSB0b0pTLnRvSlModGhpcywgJycsIGN0eCk7XG4gICAgICAgIGlmICh0eXBlb2Ygb25BbmNob3IgPT09ICdmdW5jdGlvbicpXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHsgY291bnQsIHJlcyB9IG9mIGN0eC5hbmNob3JzLnZhbHVlcygpKVxuICAgICAgICAgICAgICAgIG9uQW5jaG9yKHJlcywgY291bnQpO1xuICAgICAgICByZXR1cm4gdHlwZW9mIHJldml2ZXIgPT09ICdmdW5jdGlvbidcbiAgICAgICAgICAgID8gYXBwbHlSZXZpdmVyLmFwcGx5UmV2aXZlcihyZXZpdmVyLCB7ICcnOiByZXMgfSwgJycsIHJlcylcbiAgICAgICAgICAgIDogcmVzO1xuICAgIH1cbn1cblxuZXhwb3J0cy5Ob2RlQmFzZSA9IE5vZGVCYXNlO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBhbmNob3JzID0gcmVxdWlyZSgnLi4vZG9jL2FuY2hvcnMuanMnKTtcbnZhciB2aXNpdCA9IHJlcXVpcmUoJy4uL3Zpc2l0LmpzJyk7XG52YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuL2lkZW50aXR5LmpzJyk7XG52YXIgTm9kZSA9IHJlcXVpcmUoJy4vTm9kZS5qcycpO1xudmFyIHRvSlMgPSByZXF1aXJlKCcuL3RvSlMuanMnKTtcblxuY2xhc3MgQWxpYXMgZXh0ZW5kcyBOb2RlLk5vZGVCYXNlIHtcbiAgICBjb25zdHJ1Y3Rvcihzb3VyY2UpIHtcbiAgICAgICAgc3VwZXIoaWRlbnRpdHkuQUxJQVMpO1xuICAgICAgICB0aGlzLnNvdXJjZSA9IHNvdXJjZTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICd0YWcnLCB7XG4gICAgICAgICAgICBzZXQoKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBbGlhcyBub2RlcyBjYW5ub3QgaGF2ZSB0YWdzJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXNvbHZlIHRoZSB2YWx1ZSBvZiB0aGlzIGFsaWFzIHdpdGhpbiBgZG9jYCwgZmluZGluZyB0aGUgbGFzdFxuICAgICAqIGluc3RhbmNlIG9mIHRoZSBgc291cmNlYCBhbmNob3IgYmVmb3JlIHRoaXMgbm9kZS5cbiAgICAgKi9cbiAgICByZXNvbHZlKGRvYywgY3R4KSB7XG4gICAgICAgIGxldCBub2RlcztcbiAgICAgICAgaWYgKGN0eD8uYWxpYXNSZXNvbHZlQ2FjaGUpIHtcbiAgICAgICAgICAgIG5vZGVzID0gY3R4LmFsaWFzUmVzb2x2ZUNhY2hlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbm9kZXMgPSBbXTtcbiAgICAgICAgICAgIHZpc2l0LnZpc2l0KGRvYywge1xuICAgICAgICAgICAgICAgIE5vZGU6IChfa2V5LCBub2RlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpZGVudGl0eS5pc0FsaWFzKG5vZGUpIHx8IGlkZW50aXR5Lmhhc0FuY2hvcihub2RlKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzLnB1c2gobm9kZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoY3R4KVxuICAgICAgICAgICAgICAgIGN0eC5hbGlhc1Jlc29sdmVDYWNoZSA9IG5vZGVzO1xuICAgICAgICB9XG4gICAgICAgIGxldCBmb3VuZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgZm9yIChjb25zdCBub2RlIG9mIG5vZGVzKSB7XG4gICAgICAgICAgICBpZiAobm9kZSA9PT0gdGhpcylcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGlmIChub2RlLmFuY2hvciA9PT0gdGhpcy5zb3VyY2UpXG4gICAgICAgICAgICAgICAgZm91bmQgPSBub2RlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmb3VuZDtcbiAgICB9XG4gICAgdG9KU09OKF9hcmcsIGN0eCkge1xuICAgICAgICBpZiAoIWN0eClcbiAgICAgICAgICAgIHJldHVybiB7IHNvdXJjZTogdGhpcy5zb3VyY2UgfTtcbiAgICAgICAgY29uc3QgeyBhbmNob3JzLCBkb2MsIG1heEFsaWFzQ291bnQgfSA9IGN0eDtcbiAgICAgICAgY29uc3Qgc291cmNlID0gdGhpcy5yZXNvbHZlKGRvYywgY3R4KTtcbiAgICAgICAgaWYgKCFzb3VyY2UpIHtcbiAgICAgICAgICAgIGNvbnN0IG1zZyA9IGBVbnJlc29sdmVkIGFsaWFzICh0aGUgYW5jaG9yIG11c3QgYmUgc2V0IGJlZm9yZSB0aGUgYWxpYXMpOiAke3RoaXMuc291cmNlfWA7XG4gICAgICAgICAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IobXNnKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgZGF0YSA9IGFuY2hvcnMuZ2V0KHNvdXJjZSk7XG4gICAgICAgIGlmICghZGF0YSkge1xuICAgICAgICAgICAgLy8gUmVzb2x2ZSBhbmNob3JzIGZvciBOb2RlLnByb3RvdHlwZS50b0pTKClcbiAgICAgICAgICAgIHRvSlMudG9KUyhzb3VyY2UsIG51bGwsIGN0eCk7XG4gICAgICAgICAgICBkYXRhID0gYW5jaG9ycy5nZXQoc291cmNlKTtcbiAgICAgICAgfVxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgaWYgKGRhdGE/LnJlcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjb25zdCBtc2cgPSAnVGhpcyBzaG91bGQgbm90IGhhcHBlbjogQWxpYXMgYW5jaG9yIHdhcyBub3QgcmVzb2x2ZWQ/JztcbiAgICAgICAgICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihtc2cpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChtYXhBbGlhc0NvdW50ID49IDApIHtcbiAgICAgICAgICAgIGRhdGEuY291bnQgKz0gMTtcbiAgICAgICAgICAgIGlmIChkYXRhLmFsaWFzQ291bnQgPT09IDApXG4gICAgICAgICAgICAgICAgZGF0YS5hbGlhc0NvdW50ID0gZ2V0QWxpYXNDb3VudChkb2MsIHNvdXJjZSwgYW5jaG9ycyk7XG4gICAgICAgICAgICBpZiAoZGF0YS5jb3VudCAqIGRhdGEuYWxpYXNDb3VudCA+IG1heEFsaWFzQ291bnQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtc2cgPSAnRXhjZXNzaXZlIGFsaWFzIGNvdW50IGluZGljYXRlcyBhIHJlc291cmNlIGV4aGF1c3Rpb24gYXR0YWNrJztcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IobXNnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGF0YS5yZXM7XG4gICAgfVxuICAgIHRvU3RyaW5nKGN0eCwgX29uQ29tbWVudCwgX29uQ2hvbXBLZWVwKSB7XG4gICAgICAgIGNvbnN0IHNyYyA9IGAqJHt0aGlzLnNvdXJjZX1gO1xuICAgICAgICBpZiAoY3R4KSB7XG4gICAgICAgICAgICBhbmNob3JzLmFuY2hvcklzVmFsaWQodGhpcy5zb3VyY2UpO1xuICAgICAgICAgICAgaWYgKGN0eC5vcHRpb25zLnZlcmlmeUFsaWFzT3JkZXIgJiYgIWN0eC5hbmNob3JzLmhhcyh0aGlzLnNvdXJjZSkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtc2cgPSBgVW5yZXNvbHZlZCBhbGlhcyAodGhlIGFuY2hvciBtdXN0IGJlIHNldCBiZWZvcmUgdGhlIGFsaWFzKTogJHt0aGlzLnNvdXJjZX1gO1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGN0eC5pbXBsaWNpdEtleSlcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7c3JjfSBgO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzcmM7XG4gICAgfVxufVxuZnVuY3Rpb24gZ2V0QWxpYXNDb3VudChkb2MsIG5vZGUsIGFuY2hvcnMpIHtcbiAgICBpZiAoaWRlbnRpdHkuaXNBbGlhcyhub2RlKSkge1xuICAgICAgICBjb25zdCBzb3VyY2UgPSBub2RlLnJlc29sdmUoZG9jKTtcbiAgICAgICAgY29uc3QgYW5jaG9yID0gYW5jaG9ycyAmJiBzb3VyY2UgJiYgYW5jaG9ycy5nZXQoc291cmNlKTtcbiAgICAgICAgcmV0dXJuIGFuY2hvciA/IGFuY2hvci5jb3VudCAqIGFuY2hvci5hbGlhc0NvdW50IDogMDtcbiAgICB9XG4gICAgZWxzZSBpZiAoaWRlbnRpdHkuaXNDb2xsZWN0aW9uKG5vZGUpKSB7XG4gICAgICAgIGxldCBjb3VudCA9IDA7XG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBub2RlLml0ZW1zKSB7XG4gICAgICAgICAgICBjb25zdCBjID0gZ2V0QWxpYXNDb3VudChkb2MsIGl0ZW0sIGFuY2hvcnMpO1xuICAgICAgICAgICAgaWYgKGMgPiBjb3VudClcbiAgICAgICAgICAgICAgICBjb3VudCA9IGM7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvdW50O1xuICAgIH1cbiAgICBlbHNlIGlmIChpZGVudGl0eS5pc1BhaXIobm9kZSkpIHtcbiAgICAgICAgY29uc3Qga2MgPSBnZXRBbGlhc0NvdW50KGRvYywgbm9kZS5rZXksIGFuY2hvcnMpO1xuICAgICAgICBjb25zdCB2YyA9IGdldEFsaWFzQ291bnQoZG9jLCBub2RlLnZhbHVlLCBhbmNob3JzKTtcbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KGtjLCB2Yyk7XG4gICAgfVxuICAgIHJldHVybiAxO1xufVxuXG5leHBvcnRzLkFsaWFzID0gQWxpYXM7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIGlkZW50aXR5ID0gcmVxdWlyZSgnLi9pZGVudGl0eS5qcycpO1xudmFyIE5vZGUgPSByZXF1aXJlKCcuL05vZGUuanMnKTtcbnZhciB0b0pTID0gcmVxdWlyZSgnLi90b0pTLmpzJyk7XG5cbmNvbnN0IGlzU2NhbGFyVmFsdWUgPSAodmFsdWUpID0+ICF2YWx1ZSB8fCAodHlwZW9mIHZhbHVlICE9PSAnZnVuY3Rpb24nICYmIHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcpO1xuY2xhc3MgU2NhbGFyIGV4dGVuZHMgTm9kZS5Ob2RlQmFzZSB7XG4gICAgY29uc3RydWN0b3IodmFsdWUpIHtcbiAgICAgICAgc3VwZXIoaWRlbnRpdHkuU0NBTEFSKTtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgICB0b0pTT04oYXJnLCBjdHgpIHtcbiAgICAgICAgcmV0dXJuIGN0eD8ua2VlcCA/IHRoaXMudmFsdWUgOiB0b0pTLnRvSlModGhpcy52YWx1ZSwgYXJnLCBjdHgpO1xuICAgIH1cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIFN0cmluZyh0aGlzLnZhbHVlKTtcbiAgICB9XG59XG5TY2FsYXIuQkxPQ0tfRk9MREVEID0gJ0JMT0NLX0ZPTERFRCc7XG5TY2FsYXIuQkxPQ0tfTElURVJBTCA9ICdCTE9DS19MSVRFUkFMJztcblNjYWxhci5QTEFJTiA9ICdQTEFJTic7XG5TY2FsYXIuUVVPVEVfRE9VQkxFID0gJ1FVT1RFX0RPVUJMRSc7XG5TY2FsYXIuUVVPVEVfU0lOR0xFID0gJ1FVT1RFX1NJTkdMRSc7XG5cbmV4cG9ydHMuU2NhbGFyID0gU2NhbGFyO1xuZXhwb3J0cy5pc1NjYWxhclZhbHVlID0gaXNTY2FsYXJWYWx1ZTtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQWxpYXMgPSByZXF1aXJlKCcuLi9ub2Rlcy9BbGlhcy5qcycpO1xudmFyIGlkZW50aXR5ID0gcmVxdWlyZSgnLi4vbm9kZXMvaWRlbnRpdHkuanMnKTtcbnZhciBTY2FsYXIgPSByZXF1aXJlKCcuLi9ub2Rlcy9TY2FsYXIuanMnKTtcblxuY29uc3QgZGVmYXVsdFRhZ1ByZWZpeCA9ICd0YWc6eWFtbC5vcmcsMjAwMjonO1xuZnVuY3Rpb24gZmluZFRhZ09iamVjdCh2YWx1ZSwgdGFnTmFtZSwgdGFncykge1xuICAgIGlmICh0YWdOYW1lKSB7XG4gICAgICAgIGNvbnN0IG1hdGNoID0gdGFncy5maWx0ZXIodCA9PiB0LnRhZyA9PT0gdGFnTmFtZSk7XG4gICAgICAgIGNvbnN0IHRhZ09iaiA9IG1hdGNoLmZpbmQodCA9PiAhdC5mb3JtYXQpID8/IG1hdGNoWzBdO1xuICAgICAgICBpZiAoIXRhZ09iailcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVGFnICR7dGFnTmFtZX0gbm90IGZvdW5kYCk7XG4gICAgICAgIHJldHVybiB0YWdPYmo7XG4gICAgfVxuICAgIHJldHVybiB0YWdzLmZpbmQodCA9PiB0LmlkZW50aWZ5Py4odmFsdWUpICYmICF0LmZvcm1hdCk7XG59XG5mdW5jdGlvbiBjcmVhdGVOb2RlKHZhbHVlLCB0YWdOYW1lLCBjdHgpIHtcbiAgICBpZiAoaWRlbnRpdHkuaXNEb2N1bWVudCh2YWx1ZSkpXG4gICAgICAgIHZhbHVlID0gdmFsdWUuY29udGVudHM7XG4gICAgaWYgKGlkZW50aXR5LmlzTm9kZSh2YWx1ZSkpXG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICBpZiAoaWRlbnRpdHkuaXNQYWlyKHZhbHVlKSkge1xuICAgICAgICBjb25zdCBtYXAgPSBjdHguc2NoZW1hW2lkZW50aXR5Lk1BUF0uY3JlYXRlTm9kZT8uKGN0eC5zY2hlbWEsIG51bGwsIGN0eCk7XG4gICAgICAgIG1hcC5pdGVtcy5wdXNoKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIG1hcDtcbiAgICB9XG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgU3RyaW5nIHx8XG4gICAgICAgIHZhbHVlIGluc3RhbmNlb2YgTnVtYmVyIHx8XG4gICAgICAgIHZhbHVlIGluc3RhbmNlb2YgQm9vbGVhbiB8fFxuICAgICAgICAodHlwZW9mIEJpZ0ludCAhPT0gJ3VuZGVmaW5lZCcgJiYgdmFsdWUgaW5zdGFuY2VvZiBCaWdJbnQpIC8vIG5vdCBzdXBwb3J0ZWQgZXZlcnl3aGVyZVxuICAgICkge1xuICAgICAgICAvLyBodHRwczovL3RjMzkuZXMvZWNtYTI2Mi8jc2VjLXNlcmlhbGl6ZWpzb25wcm9wZXJ0eVxuICAgICAgICB2YWx1ZSA9IHZhbHVlLnZhbHVlT2YoKTtcbiAgICB9XG4gICAgY29uc3QgeyBhbGlhc0R1cGxpY2F0ZU9iamVjdHMsIG9uQW5jaG9yLCBvblRhZ09iaiwgc2NoZW1hLCBzb3VyY2VPYmplY3RzIH0gPSBjdHg7XG4gICAgLy8gRGV0ZWN0IGR1cGxpY2F0ZSByZWZlcmVuY2VzIHRvIHRoZSBzYW1lIG9iamVjdCAmIHVzZSBBbGlhcyBub2RlcyBmb3IgYWxsXG4gICAgLy8gYWZ0ZXIgZmlyc3QuIFRoZSBgcmVmYCB3cmFwcGVyIGFsbG93cyBmb3IgY2lyY3VsYXIgcmVmZXJlbmNlcyB0byByZXNvbHZlLlxuICAgIGxldCByZWYgPSB1bmRlZmluZWQ7XG4gICAgaWYgKGFsaWFzRHVwbGljYXRlT2JqZWN0cyAmJiB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIHJlZiA9IHNvdXJjZU9iamVjdHMuZ2V0KHZhbHVlKTtcbiAgICAgICAgaWYgKHJlZikge1xuICAgICAgICAgICAgcmVmLmFuY2hvciA/PyAocmVmLmFuY2hvciA9IG9uQW5jaG9yKHZhbHVlKSk7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEFsaWFzLkFsaWFzKHJlZi5hbmNob3IpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmVmID0geyBhbmNob3I6IG51bGwsIG5vZGU6IG51bGwgfTtcbiAgICAgICAgICAgIHNvdXJjZU9iamVjdHMuc2V0KHZhbHVlLCByZWYpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmICh0YWdOYW1lPy5zdGFydHNXaXRoKCchIScpKVxuICAgICAgICB0YWdOYW1lID0gZGVmYXVsdFRhZ1ByZWZpeCArIHRhZ05hbWUuc2xpY2UoMik7XG4gICAgbGV0IHRhZ09iaiA9IGZpbmRUYWdPYmplY3QodmFsdWUsIHRhZ05hbWUsIHNjaGVtYS50YWdzKTtcbiAgICBpZiAoIXRhZ09iaikge1xuICAgICAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlLnRvSlNPTiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnNhZmUtY2FsbFxuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS50b0pTT04oKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXZhbHVlIHx8IHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBuZXcgU2NhbGFyLlNjYWxhcih2YWx1ZSk7XG4gICAgICAgICAgICBpZiAocmVmKVxuICAgICAgICAgICAgICAgIHJlZi5ub2RlID0gbm9kZTtcbiAgICAgICAgICAgIHJldHVybiBub2RlO1xuICAgICAgICB9XG4gICAgICAgIHRhZ09iaiA9XG4gICAgICAgICAgICB2YWx1ZSBpbnN0YW5jZW9mIE1hcFxuICAgICAgICAgICAgICAgID8gc2NoZW1hW2lkZW50aXR5Lk1BUF1cbiAgICAgICAgICAgICAgICA6IFN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QodmFsdWUpXG4gICAgICAgICAgICAgICAgICAgID8gc2NoZW1hW2lkZW50aXR5LlNFUV1cbiAgICAgICAgICAgICAgICAgICAgOiBzY2hlbWFbaWRlbnRpdHkuTUFQXTtcbiAgICB9XG4gICAgaWYgKG9uVGFnT2JqKSB7XG4gICAgICAgIG9uVGFnT2JqKHRhZ09iaik7XG4gICAgICAgIGRlbGV0ZSBjdHgub25UYWdPYmo7XG4gICAgfVxuICAgIGNvbnN0IG5vZGUgPSB0YWdPYmo/LmNyZWF0ZU5vZGVcbiAgICAgICAgPyB0YWdPYmouY3JlYXRlTm9kZShjdHguc2NoZW1hLCB2YWx1ZSwgY3R4KVxuICAgICAgICA6IHR5cGVvZiB0YWdPYmo/Lm5vZGVDbGFzcz8uZnJvbSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgPyB0YWdPYmoubm9kZUNsYXNzLmZyb20oY3R4LnNjaGVtYSwgdmFsdWUsIGN0eClcbiAgICAgICAgICAgIDogbmV3IFNjYWxhci5TY2FsYXIodmFsdWUpO1xuICAgIGlmICh0YWdOYW1lKVxuICAgICAgICBub2RlLnRhZyA9IHRhZ05hbWU7XG4gICAgZWxzZSBpZiAoIXRhZ09iai5kZWZhdWx0KVxuICAgICAgICBub2RlLnRhZyA9IHRhZ09iai50YWc7XG4gICAgaWYgKHJlZilcbiAgICAgICAgcmVmLm5vZGUgPSBub2RlO1xuICAgIHJldHVybiBub2RlO1xufVxuXG5leHBvcnRzLmNyZWF0ZU5vZGUgPSBjcmVhdGVOb2RlO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBjcmVhdGVOb2RlID0gcmVxdWlyZSgnLi4vZG9jL2NyZWF0ZU5vZGUuanMnKTtcbnZhciBpZGVudGl0eSA9IHJlcXVpcmUoJy4vaWRlbnRpdHkuanMnKTtcbnZhciBOb2RlID0gcmVxdWlyZSgnLi9Ob2RlLmpzJyk7XG5cbmZ1bmN0aW9uIGNvbGxlY3Rpb25Gcm9tUGF0aChzY2hlbWEsIHBhdGgsIHZhbHVlKSB7XG4gICAgbGV0IHYgPSB2YWx1ZTtcbiAgICBmb3IgKGxldCBpID0gcGF0aC5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICBjb25zdCBrID0gcGF0aFtpXTtcbiAgICAgICAgaWYgKHR5cGVvZiBrID09PSAnbnVtYmVyJyAmJiBOdW1iZXIuaXNJbnRlZ2VyKGspICYmIGsgPj0gMCkge1xuICAgICAgICAgICAgY29uc3QgYSA9IFtdO1xuICAgICAgICAgICAgYVtrXSA9IHY7XG4gICAgICAgICAgICB2ID0gYTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHYgPSBuZXcgTWFwKFtbaywgdl1dKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY3JlYXRlTm9kZS5jcmVhdGVOb2RlKHYsIHVuZGVmaW5lZCwge1xuICAgICAgICBhbGlhc0R1cGxpY2F0ZU9iamVjdHM6IGZhbHNlLFxuICAgICAgICBrZWVwVW5kZWZpbmVkOiBmYWxzZSxcbiAgICAgICAgb25BbmNob3I6ICgpID0+IHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGhpcyBzaG91bGQgbm90IGhhcHBlbiwgcGxlYXNlIHJlcG9ydCBhIGJ1Zy4nKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2NoZW1hLFxuICAgICAgICBzb3VyY2VPYmplY3RzOiBuZXcgTWFwKClcbiAgICB9KTtcbn1cbi8vIFR5cGUgZ3VhcmQgaXMgaW50ZW50aW9uYWxseSBhIGxpdHRsZSB3cm9uZyBzbyBhcyB0byBiZSBtb3JlIHVzZWZ1bCxcbi8vIGFzIGl0IGRvZXMgbm90IGNvdmVyIHVudHlwYWJsZSBlbXB0eSBub24tc3RyaW5nIGl0ZXJhYmxlcyAoZS5nLiBbXSkuXG5jb25zdCBpc0VtcHR5UGF0aCA9IChwYXRoKSA9PiBwYXRoID09IG51bGwgfHxcbiAgICAodHlwZW9mIHBhdGggPT09ICdvYmplY3QnICYmICEhcGF0aFtTeW1ib2wuaXRlcmF0b3JdKCkubmV4dCgpLmRvbmUpO1xuY2xhc3MgQ29sbGVjdGlvbiBleHRlbmRzIE5vZGUuTm9kZUJhc2Uge1xuICAgIGNvbnN0cnVjdG9yKHR5cGUsIHNjaGVtYSkge1xuICAgICAgICBzdXBlcih0eXBlKTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdzY2hlbWEnLCB7XG4gICAgICAgICAgICB2YWx1ZTogc2NoZW1hLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICB3cml0YWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgY29weSBvZiB0aGlzIGNvbGxlY3Rpb24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gc2NoZW1hIC0gSWYgZGVmaW5lZCwgb3ZlcndyaXRlcyB0aGUgb3JpZ2luYWwncyBzY2hlbWFcbiAgICAgKi9cbiAgICBjbG9uZShzY2hlbWEpIHtcbiAgICAgICAgY29uc3QgY29weSA9IE9iamVjdC5jcmVhdGUoT2JqZWN0LmdldFByb3RvdHlwZU9mKHRoaXMpLCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyh0aGlzKSk7XG4gICAgICAgIGlmIChzY2hlbWEpXG4gICAgICAgICAgICBjb3B5LnNjaGVtYSA9IHNjaGVtYTtcbiAgICAgICAgY29weS5pdGVtcyA9IGNvcHkuaXRlbXMubWFwKGl0ID0+IGlkZW50aXR5LmlzTm9kZShpdCkgfHwgaWRlbnRpdHkuaXNQYWlyKGl0KSA/IGl0LmNsb25lKHNjaGVtYSkgOiBpdCk7XG4gICAgICAgIGlmICh0aGlzLnJhbmdlKVxuICAgICAgICAgICAgY29weS5yYW5nZSA9IHRoaXMucmFuZ2Uuc2xpY2UoKTtcbiAgICAgICAgcmV0dXJuIGNvcHk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFkZHMgYSB2YWx1ZSB0byB0aGUgY29sbGVjdGlvbi4gRm9yIGAhIW1hcGAgYW5kIGAhIW9tYXBgIHRoZSB2YWx1ZSBtdXN0XG4gICAgICogYmUgYSBQYWlyIGluc3RhbmNlIG9yIGEgYHsga2V5LCB2YWx1ZSB9YCBvYmplY3QsIHdoaWNoIG1heSBub3QgaGF2ZSBhIGtleVxuICAgICAqIHRoYXQgYWxyZWFkeSBleGlzdHMgaW4gdGhlIG1hcC5cbiAgICAgKi9cbiAgICBhZGRJbihwYXRoLCB2YWx1ZSkge1xuICAgICAgICBpZiAoaXNFbXB0eVBhdGgocGF0aCkpXG4gICAgICAgICAgICB0aGlzLmFkZCh2YWx1ZSk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgW2tleSwgLi4ucmVzdF0gPSBwYXRoO1xuICAgICAgICAgICAgY29uc3Qgbm9kZSA9IHRoaXMuZ2V0KGtleSwgdHJ1ZSk7XG4gICAgICAgICAgICBpZiAoaWRlbnRpdHkuaXNDb2xsZWN0aW9uKG5vZGUpKVxuICAgICAgICAgICAgICAgIG5vZGUuYWRkSW4ocmVzdCwgdmFsdWUpO1xuICAgICAgICAgICAgZWxzZSBpZiAobm9kZSA9PT0gdW5kZWZpbmVkICYmIHRoaXMuc2NoZW1hKVxuICAgICAgICAgICAgICAgIHRoaXMuc2V0KGtleSwgY29sbGVjdGlvbkZyb21QYXRoKHRoaXMuc2NoZW1hLCByZXN0LCB2YWx1ZSkpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgWUFNTCBjb2xsZWN0aW9uIGF0ICR7a2V5fS4gUmVtYWluaW5nIHBhdGg6ICR7cmVzdH1gKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGEgdmFsdWUgZnJvbSB0aGUgY29sbGVjdGlvbi5cbiAgICAgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGl0ZW0gd2FzIGZvdW5kIGFuZCByZW1vdmVkLlxuICAgICAqL1xuICAgIGRlbGV0ZUluKHBhdGgpIHtcbiAgICAgICAgY29uc3QgW2tleSwgLi4ucmVzdF0gPSBwYXRoO1xuICAgICAgICBpZiAocmVzdC5sZW5ndGggPT09IDApXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kZWxldGUoa2V5KTtcbiAgICAgICAgY29uc3Qgbm9kZSA9IHRoaXMuZ2V0KGtleSwgdHJ1ZSk7XG4gICAgICAgIGlmIChpZGVudGl0eS5pc0NvbGxlY3Rpb24obm9kZSkpXG4gICAgICAgICAgICByZXR1cm4gbm9kZS5kZWxldGVJbihyZXN0KTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCBZQU1MIGNvbGxlY3Rpb24gYXQgJHtrZXl9LiBSZW1haW5pbmcgcGF0aDogJHtyZXN0fWApO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGl0ZW0gYXQgYGtleWAsIG9yIGB1bmRlZmluZWRgIGlmIG5vdCBmb3VuZC4gQnkgZGVmYXVsdCB1bndyYXBzXG4gICAgICogc2NhbGFyIHZhbHVlcyBmcm9tIHRoZWlyIHN1cnJvdW5kaW5nIG5vZGU7IHRvIGRpc2FibGUgc2V0IGBrZWVwU2NhbGFyYCB0b1xuICAgICAqIGB0cnVlYCAoY29sbGVjdGlvbnMgYXJlIGFsd2F5cyByZXR1cm5lZCBpbnRhY3QpLlxuICAgICAqL1xuICAgIGdldEluKHBhdGgsIGtlZXBTY2FsYXIpIHtcbiAgICAgICAgY29uc3QgW2tleSwgLi4ucmVzdF0gPSBwYXRoO1xuICAgICAgICBjb25zdCBub2RlID0gdGhpcy5nZXQoa2V5LCB0cnVlKTtcbiAgICAgICAgaWYgKHJlc3QubGVuZ3RoID09PSAwKVxuICAgICAgICAgICAgcmV0dXJuICFrZWVwU2NhbGFyICYmIGlkZW50aXR5LmlzU2NhbGFyKG5vZGUpID8gbm9kZS52YWx1ZSA6IG5vZGU7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBpZGVudGl0eS5pc0NvbGxlY3Rpb24obm9kZSkgPyBub2RlLmdldEluKHJlc3QsIGtlZXBTY2FsYXIpIDogdW5kZWZpbmVkO1xuICAgIH1cbiAgICBoYXNBbGxOdWxsVmFsdWVzKGFsbG93U2NhbGFyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLml0ZW1zLmV2ZXJ5KG5vZGUgPT4ge1xuICAgICAgICAgICAgaWYgKCFpZGVudGl0eS5pc1BhaXIobm9kZSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgY29uc3QgbiA9IG5vZGUudmFsdWU7XG4gICAgICAgICAgICByZXR1cm4gKG4gPT0gbnVsbCB8fFxuICAgICAgICAgICAgICAgIChhbGxvd1NjYWxhciAmJlxuICAgICAgICAgICAgICAgICAgICBpZGVudGl0eS5pc1NjYWxhcihuKSAmJlxuICAgICAgICAgICAgICAgICAgICBuLnZhbHVlID09IG51bGwgJiZcbiAgICAgICAgICAgICAgICAgICAgIW4uY29tbWVudEJlZm9yZSAmJlxuICAgICAgICAgICAgICAgICAgICAhbi5jb21tZW50ICYmXG4gICAgICAgICAgICAgICAgICAgICFuLnRhZykpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIHRoZSBjb2xsZWN0aW9uIGluY2x1ZGVzIGEgdmFsdWUgd2l0aCB0aGUga2V5IGBrZXlgLlxuICAgICAqL1xuICAgIGhhc0luKHBhdGgpIHtcbiAgICAgICAgY29uc3QgW2tleSwgLi4ucmVzdF0gPSBwYXRoO1xuICAgICAgICBpZiAocmVzdC5sZW5ndGggPT09IDApXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5oYXMoa2V5KTtcbiAgICAgICAgY29uc3Qgbm9kZSA9IHRoaXMuZ2V0KGtleSwgdHJ1ZSk7XG4gICAgICAgIHJldHVybiBpZGVudGl0eS5pc0NvbGxlY3Rpb24obm9kZSkgPyBub2RlLmhhc0luKHJlc3QpIDogZmFsc2U7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldHMgYSB2YWx1ZSBpbiB0aGlzIGNvbGxlY3Rpb24uIEZvciBgISFzZXRgLCBgdmFsdWVgIG5lZWRzIHRvIGJlIGFcbiAgICAgKiBib29sZWFuIHRvIGFkZC9yZW1vdmUgdGhlIGl0ZW0gZnJvbSB0aGUgc2V0LlxuICAgICAqL1xuICAgIHNldEluKHBhdGgsIHZhbHVlKSB7XG4gICAgICAgIGNvbnN0IFtrZXksIC4uLnJlc3RdID0gcGF0aDtcbiAgICAgICAgaWYgKHJlc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLmdldChrZXksIHRydWUpO1xuICAgICAgICAgICAgaWYgKGlkZW50aXR5LmlzQ29sbGVjdGlvbihub2RlKSlcbiAgICAgICAgICAgICAgICBub2RlLnNldEluKHJlc3QsIHZhbHVlKTtcbiAgICAgICAgICAgIGVsc2UgaWYgKG5vZGUgPT09IHVuZGVmaW5lZCAmJiB0aGlzLnNjaGVtYSlcbiAgICAgICAgICAgICAgICB0aGlzLnNldChrZXksIGNvbGxlY3Rpb25Gcm9tUGF0aCh0aGlzLnNjaGVtYSwgcmVzdCwgdmFsdWUpKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIFlBTUwgY29sbGVjdGlvbiBhdCAke2tleX0uIFJlbWFpbmluZyBwYXRoOiAke3Jlc3R9YCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydHMuQ29sbGVjdGlvbiA9IENvbGxlY3Rpb247XG5leHBvcnRzLmNvbGxlY3Rpb25Gcm9tUGF0aCA9IGNvbGxlY3Rpb25Gcm9tUGF0aDtcbmV4cG9ydHMuaXNFbXB0eVBhdGggPSBpc0VtcHR5UGF0aDtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFN0cmluZ2lmaWVzIGEgY29tbWVudC5cbiAqXG4gKiBFbXB0eSBjb21tZW50IGxpbmVzIGFyZSBsZWZ0IGVtcHR5LFxuICogbGluZXMgY29uc2lzdGluZyBvZiBhIHNpbmdsZSBzcGFjZSBhcmUgcmVwbGFjZWQgYnkgYCNgLFxuICogYW5kIGFsbCBvdGhlciBsaW5lcyBhcmUgcHJlZml4ZWQgd2l0aCBhIGAjYC5cbiAqL1xuY29uc3Qgc3RyaW5naWZ5Q29tbWVudCA9IChzdHIpID0+IHN0ci5yZXBsYWNlKC9eKD8hJCkoPzogJCk/L2dtLCAnIycpO1xuZnVuY3Rpb24gaW5kZW50Q29tbWVudChjb21tZW50LCBpbmRlbnQpIHtcbiAgICBpZiAoL15cXG4rJC8udGVzdChjb21tZW50KSlcbiAgICAgICAgcmV0dXJuIGNvbW1lbnQuc3Vic3RyaW5nKDEpO1xuICAgIHJldHVybiBpbmRlbnQgPyBjb21tZW50LnJlcGxhY2UoL14oPyEgKiQpL2dtLCBpbmRlbnQpIDogY29tbWVudDtcbn1cbmNvbnN0IGxpbmVDb21tZW50ID0gKHN0ciwgaW5kZW50LCBjb21tZW50KSA9PiBzdHIuZW5kc1dpdGgoJ1xcbicpXG4gICAgPyBpbmRlbnRDb21tZW50KGNvbW1lbnQsIGluZGVudClcbiAgICA6IGNvbW1lbnQuaW5jbHVkZXMoJ1xcbicpXG4gICAgICAgID8gJ1xcbicgKyBpbmRlbnRDb21tZW50KGNvbW1lbnQsIGluZGVudClcbiAgICAgICAgOiAoc3RyLmVuZHNXaXRoKCcgJykgPyAnJyA6ICcgJykgKyBjb21tZW50O1xuXG5leHBvcnRzLmluZGVudENvbW1lbnQgPSBpbmRlbnRDb21tZW50O1xuZXhwb3J0cy5saW5lQ29tbWVudCA9IGxpbmVDb21tZW50O1xuZXhwb3J0cy5zdHJpbmdpZnlDb21tZW50ID0gc3RyaW5naWZ5Q29tbWVudDtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBGT0xEX0ZMT1cgPSAnZmxvdyc7XG5jb25zdCBGT0xEX0JMT0NLID0gJ2Jsb2NrJztcbmNvbnN0IEZPTERfUVVPVEVEID0gJ3F1b3RlZCc7XG4vKipcbiAqIFRyaWVzIHRvIGtlZXAgaW5wdXQgYXQgdXAgdG8gYGxpbmVXaWR0aGAgY2hhcmFjdGVycywgc3BsaXR0aW5nIG9ubHkgb24gc3BhY2VzXG4gKiBub3QgZm9sbG93ZWQgYnkgbmV3bGluZXMgb3Igc3BhY2VzIHVubGVzcyBgbW9kZWAgaXMgYCdxdW90ZWQnYC4gTGluZXMgYXJlXG4gKiB0ZXJtaW5hdGVkIHdpdGggYFxcbmAgYW5kIHN0YXJ0ZWQgd2l0aCBgaW5kZW50YC5cbiAqL1xuZnVuY3Rpb24gZm9sZEZsb3dMaW5lcyh0ZXh0LCBpbmRlbnQsIG1vZGUgPSAnZmxvdycsIHsgaW5kZW50QXRTdGFydCwgbGluZVdpZHRoID0gODAsIG1pbkNvbnRlbnRXaWR0aCA9IDIwLCBvbkZvbGQsIG9uT3ZlcmZsb3cgfSA9IHt9KSB7XG4gICAgaWYgKCFsaW5lV2lkdGggfHwgbGluZVdpZHRoIDwgMClcbiAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgaWYgKGxpbmVXaWR0aCA8IG1pbkNvbnRlbnRXaWR0aClcbiAgICAgICAgbWluQ29udGVudFdpZHRoID0gMDtcbiAgICBjb25zdCBlbmRTdGVwID0gTWF0aC5tYXgoMSArIG1pbkNvbnRlbnRXaWR0aCwgMSArIGxpbmVXaWR0aCAtIGluZGVudC5sZW5ndGgpO1xuICAgIGlmICh0ZXh0Lmxlbmd0aCA8PSBlbmRTdGVwKVxuICAgICAgICByZXR1cm4gdGV4dDtcbiAgICBjb25zdCBmb2xkcyA9IFtdO1xuICAgIGNvbnN0IGVzY2FwZWRGb2xkcyA9IHt9O1xuICAgIGxldCBlbmQgPSBsaW5lV2lkdGggLSBpbmRlbnQubGVuZ3RoO1xuICAgIGlmICh0eXBlb2YgaW5kZW50QXRTdGFydCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgaWYgKGluZGVudEF0U3RhcnQgPiBsaW5lV2lkdGggLSBNYXRoLm1heCgyLCBtaW5Db250ZW50V2lkdGgpKVxuICAgICAgICAgICAgZm9sZHMucHVzaCgwKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZW5kID0gbGluZVdpZHRoIC0gaW5kZW50QXRTdGFydDtcbiAgICB9XG4gICAgbGV0IHNwbGl0ID0gdW5kZWZpbmVkO1xuICAgIGxldCBwcmV2ID0gdW5kZWZpbmVkO1xuICAgIGxldCBvdmVyZmxvdyA9IGZhbHNlO1xuICAgIGxldCBpID0gLTE7XG4gICAgbGV0IGVzY1N0YXJ0ID0gLTE7XG4gICAgbGV0IGVzY0VuZCA9IC0xO1xuICAgIGlmIChtb2RlID09PSBGT0xEX0JMT0NLKSB7XG4gICAgICAgIGkgPSBjb25zdW1lTW9yZUluZGVudGVkTGluZXModGV4dCwgaSwgaW5kZW50Lmxlbmd0aCk7XG4gICAgICAgIGlmIChpICE9PSAtMSlcbiAgICAgICAgICAgIGVuZCA9IGkgKyBlbmRTdGVwO1xuICAgIH1cbiAgICBmb3IgKGxldCBjaDsgKGNoID0gdGV4dFsoaSArPSAxKV0pOykge1xuICAgICAgICBpZiAobW9kZSA9PT0gRk9MRF9RVU9URUQgJiYgY2ggPT09ICdcXFxcJykge1xuICAgICAgICAgICAgZXNjU3RhcnQgPSBpO1xuICAgICAgICAgICAgc3dpdGNoICh0ZXh0W2kgKyAxXSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ3gnOlxuICAgICAgICAgICAgICAgICAgICBpICs9IDM7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3UnOlxuICAgICAgICAgICAgICAgICAgICBpICs9IDU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ1UnOlxuICAgICAgICAgICAgICAgICAgICBpICs9IDk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGkgKz0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVzY0VuZCA9IGk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoID09PSAnXFxuJykge1xuICAgICAgICAgICAgaWYgKG1vZGUgPT09IEZPTERfQkxPQ0spXG4gICAgICAgICAgICAgICAgaSA9IGNvbnN1bWVNb3JlSW5kZW50ZWRMaW5lcyh0ZXh0LCBpLCBpbmRlbnQubGVuZ3RoKTtcbiAgICAgICAgICAgIGVuZCA9IGkgKyBpbmRlbnQubGVuZ3RoICsgZW5kU3RlcDtcbiAgICAgICAgICAgIHNwbGl0ID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKGNoID09PSAnICcgJiZcbiAgICAgICAgICAgICAgICBwcmV2ICYmXG4gICAgICAgICAgICAgICAgcHJldiAhPT0gJyAnICYmXG4gICAgICAgICAgICAgICAgcHJldiAhPT0gJ1xcbicgJiZcbiAgICAgICAgICAgICAgICBwcmV2ICE9PSAnXFx0Jykge1xuICAgICAgICAgICAgICAgIC8vIHNwYWNlIHN1cnJvdW5kZWQgYnkgbm9uLXNwYWNlIGNhbiBiZSByZXBsYWNlZCB3aXRoIG5ld2xpbmUgKyBpbmRlbnRcbiAgICAgICAgICAgICAgICBjb25zdCBuZXh0ID0gdGV4dFtpICsgMV07XG4gICAgICAgICAgICAgICAgaWYgKG5leHQgJiYgbmV4dCAhPT0gJyAnICYmIG5leHQgIT09ICdcXG4nICYmIG5leHQgIT09ICdcXHQnKVxuICAgICAgICAgICAgICAgICAgICBzcGxpdCA9IGk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaSA+PSBlbmQpIHtcbiAgICAgICAgICAgICAgICBpZiAoc3BsaXQpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9sZHMucHVzaChzcGxpdCk7XG4gICAgICAgICAgICAgICAgICAgIGVuZCA9IHNwbGl0ICsgZW5kU3RlcDtcbiAgICAgICAgICAgICAgICAgICAgc3BsaXQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG1vZGUgPT09IEZPTERfUVVPVEVEKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHdoaXRlLXNwYWNlIGNvbGxlY3RlZCBhdCBlbmQgbWF5IHN0cmV0Y2ggcGFzdCBsaW5lV2lkdGhcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKHByZXYgPT09ICcgJyB8fCBwcmV2ID09PSAnXFx0Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJldiA9IGNoO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2ggPSB0ZXh0WyhpICs9IDEpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG92ZXJmbG93ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBBY2NvdW50IGZvciBuZXdsaW5lIGVzY2FwZSwgYnV0IGRvbid0IGJyZWFrIHByZWNlZGluZyBlc2NhcGVcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaiA9IGkgPiBlc2NFbmQgKyAxID8gaSAtIDIgOiBlc2NTdGFydCAtIDE7XG4gICAgICAgICAgICAgICAgICAgIC8vIEJhaWwgb3V0IGlmIGxpbmVXaWR0aCAmIG1pbkNvbnRlbnRXaWR0aCBhcmUgc2hvcnRlciB0aGFuIGFuIGVzY2FwZSBzdHJpbmdcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVzY2FwZWRGb2xkc1tqXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0ZXh0O1xuICAgICAgICAgICAgICAgICAgICBmb2xkcy5wdXNoKGopO1xuICAgICAgICAgICAgICAgICAgICBlc2NhcGVkRm9sZHNbal0gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBlbmQgPSBqICsgZW5kU3RlcDtcbiAgICAgICAgICAgICAgICAgICAgc3BsaXQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBvdmVyZmxvdyA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHByZXYgPSBjaDtcbiAgICB9XG4gICAgaWYgKG92ZXJmbG93ICYmIG9uT3ZlcmZsb3cpXG4gICAgICAgIG9uT3ZlcmZsb3coKTtcbiAgICBpZiAoZm9sZHMubGVuZ3RoID09PSAwKVxuICAgICAgICByZXR1cm4gdGV4dDtcbiAgICBpZiAob25Gb2xkKVxuICAgICAgICBvbkZvbGQoKTtcbiAgICBsZXQgcmVzID0gdGV4dC5zbGljZSgwLCBmb2xkc1swXSk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmb2xkcy5sZW5ndGg7ICsraSkge1xuICAgICAgICBjb25zdCBmb2xkID0gZm9sZHNbaV07XG4gICAgICAgIGNvbnN0IGVuZCA9IGZvbGRzW2kgKyAxXSB8fCB0ZXh0Lmxlbmd0aDtcbiAgICAgICAgaWYgKGZvbGQgPT09IDApXG4gICAgICAgICAgICByZXMgPSBgXFxuJHtpbmRlbnR9JHt0ZXh0LnNsaWNlKDAsIGVuZCl9YDtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAobW9kZSA9PT0gRk9MRF9RVU9URUQgJiYgZXNjYXBlZEZvbGRzW2ZvbGRdKVxuICAgICAgICAgICAgICAgIHJlcyArPSBgJHt0ZXh0W2ZvbGRdfVxcXFxgO1xuICAgICAgICAgICAgcmVzICs9IGBcXG4ke2luZGVudH0ke3RleHQuc2xpY2UoZm9sZCArIDEsIGVuZCl9YDtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xufVxuLyoqXG4gKiBQcmVzdW1lcyBgaSArIDFgIGlzIGF0IHRoZSBzdGFydCBvZiBhIGxpbmVcbiAqIEByZXR1cm5zIGluZGV4IG9mIGxhc3QgbmV3bGluZSBpbiBtb3JlLWluZGVudGVkIGJsb2NrXG4gKi9cbmZ1bmN0aW9uIGNvbnN1bWVNb3JlSW5kZW50ZWRMaW5lcyh0ZXh0LCBpLCBpbmRlbnQpIHtcbiAgICBsZXQgZW5kID0gaTtcbiAgICBsZXQgc3RhcnQgPSBpICsgMTtcbiAgICBsZXQgY2ggPSB0ZXh0W3N0YXJ0XTtcbiAgICB3aGlsZSAoY2ggPT09ICcgJyB8fCBjaCA9PT0gJ1xcdCcpIHtcbiAgICAgICAgaWYgKGkgPCBzdGFydCArIGluZGVudCkge1xuICAgICAgICAgICAgY2ggPSB0ZXh0WysraV07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgY2ggPSB0ZXh0WysraV07XG4gICAgICAgICAgICB9IHdoaWxlIChjaCAmJiBjaCAhPT0gJ1xcbicpO1xuICAgICAgICAgICAgZW5kID0gaTtcbiAgICAgICAgICAgIHN0YXJ0ID0gaSArIDE7XG4gICAgICAgICAgICBjaCA9IHRleHRbc3RhcnRdO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBlbmQ7XG59XG5cbmV4cG9ydHMuRk9MRF9CTE9DSyA9IEZPTERfQkxPQ0s7XG5leHBvcnRzLkZPTERfRkxPVyA9IEZPTERfRkxPVztcbmV4cG9ydHMuRk9MRF9RVU9URUQgPSBGT0xEX1FVT1RFRDtcbmV4cG9ydHMuZm9sZEZsb3dMaW5lcyA9IGZvbGRGbG93TGluZXM7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIFNjYWxhciA9IHJlcXVpcmUoJy4uL25vZGVzL1NjYWxhci5qcycpO1xudmFyIGZvbGRGbG93TGluZXMgPSByZXF1aXJlKCcuL2ZvbGRGbG93TGluZXMuanMnKTtcblxuY29uc3QgZ2V0Rm9sZE9wdGlvbnMgPSAoY3R4LCBpc0Jsb2NrKSA9PiAoe1xuICAgIGluZGVudEF0U3RhcnQ6IGlzQmxvY2sgPyBjdHguaW5kZW50Lmxlbmd0aCA6IGN0eC5pbmRlbnRBdFN0YXJ0LFxuICAgIGxpbmVXaWR0aDogY3R4Lm9wdGlvbnMubGluZVdpZHRoLFxuICAgIG1pbkNvbnRlbnRXaWR0aDogY3R4Lm9wdGlvbnMubWluQ29udGVudFdpZHRoXG59KTtcbi8vIEFsc28gY2hlY2tzIGZvciBsaW5lcyBzdGFydGluZyB3aXRoICUsIGFzIHBhcnNpbmcgdGhlIG91dHB1dCBhcyBZQU1MIDEuMSB3aWxsXG4vLyBwcmVzdW1lIHRoYXQncyBzdGFydGluZyBhIG5ldyBkb2N1bWVudC5cbmNvbnN0IGNvbnRhaW5zRG9jdW1lbnRNYXJrZXIgPSAoc3RyKSA9PiAvXiglfC0tLXxcXC5cXC5cXC4pL20udGVzdChzdHIpO1xuZnVuY3Rpb24gbGluZUxlbmd0aE92ZXJMaW1pdChzdHIsIGxpbmVXaWR0aCwgaW5kZW50TGVuZ3RoKSB7XG4gICAgaWYgKCFsaW5lV2lkdGggfHwgbGluZVdpZHRoIDwgMClcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIGNvbnN0IGxpbWl0ID0gbGluZVdpZHRoIC0gaW5kZW50TGVuZ3RoO1xuICAgIGNvbnN0IHN0ckxlbiA9IHN0ci5sZW5ndGg7XG4gICAgaWYgKHN0ckxlbiA8PSBsaW1pdClcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIGZvciAobGV0IGkgPSAwLCBzdGFydCA9IDA7IGkgPCBzdHJMZW47ICsraSkge1xuICAgICAgICBpZiAoc3RyW2ldID09PSAnXFxuJykge1xuICAgICAgICAgICAgaWYgKGkgLSBzdGFydCA+IGxpbWl0KVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgc3RhcnQgPSBpICsgMTtcbiAgICAgICAgICAgIGlmIChzdHJMZW4gLSBzdGFydCA8PSBsaW1pdClcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59XG5mdW5jdGlvbiBkb3VibGVRdW90ZWRTdHJpbmcodmFsdWUsIGN0eCkge1xuICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgaWYgKGN0eC5vcHRpb25zLmRvdWJsZVF1b3RlZEFzSlNPTilcbiAgICAgICAgcmV0dXJuIGpzb247XG4gICAgY29uc3QgeyBpbXBsaWNpdEtleSB9ID0gY3R4O1xuICAgIGNvbnN0IG1pbk11bHRpTGluZUxlbmd0aCA9IGN0eC5vcHRpb25zLmRvdWJsZVF1b3RlZE1pbk11bHRpTGluZUxlbmd0aDtcbiAgICBjb25zdCBpbmRlbnQgPSBjdHguaW5kZW50IHx8IChjb250YWluc0RvY3VtZW50TWFya2VyKHZhbHVlKSA/ICcgICcgOiAnJyk7XG4gICAgbGV0IHN0ciA9ICcnO1xuICAgIGxldCBzdGFydCA9IDA7XG4gICAgZm9yIChsZXQgaSA9IDAsIGNoID0ganNvbltpXTsgY2g7IGNoID0ganNvblsrK2ldKSB7XG4gICAgICAgIGlmIChjaCA9PT0gJyAnICYmIGpzb25baSArIDFdID09PSAnXFxcXCcgJiYganNvbltpICsgMl0gPT09ICduJykge1xuICAgICAgICAgICAgLy8gc3BhY2UgYmVmb3JlIG5ld2xpbmUgbmVlZHMgdG8gYmUgZXNjYXBlZCB0byBub3QgYmUgZm9sZGVkXG4gICAgICAgICAgICBzdHIgKz0ganNvbi5zbGljZShzdGFydCwgaSkgKyAnXFxcXCAnO1xuICAgICAgICAgICAgaSArPSAxO1xuICAgICAgICAgICAgc3RhcnQgPSBpO1xuICAgICAgICAgICAgY2ggPSAnXFxcXCc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoID09PSAnXFxcXCcpXG4gICAgICAgICAgICBzd2l0Y2ggKGpzb25baSArIDFdKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAndSc6XG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0ciArPSBqc29uLnNsaWNlKHN0YXJ0LCBpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvZGUgPSBqc29uLnN1YnN0cihpICsgMiwgNCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKGNvZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICcwMDAwJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9ICdcXFxcMCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJzAwMDcnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0gJ1xcXFxhJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnMDAwYic6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ciArPSAnXFxcXHYnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICcwMDFiJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9ICdcXFxcZSc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJzAwODUnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0gJ1xcXFxOJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnMDBhMCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ciArPSAnXFxcXF8nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICcyMDI4JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9ICdcXFxcTCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJzIwMjknOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0gJ1xcXFxQJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvZGUuc3Vic3RyKDAsIDIpID09PSAnMDAnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9ICdcXFxceCcgKyBjb2RlLnN1YnN0cigyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9IGpzb24uc3Vic3RyKGksIDYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaSArPSA1O1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnQgPSBpICsgMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICduJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKGltcGxpY2l0S2V5IHx8XG4gICAgICAgICAgICAgICAgICAgICAgICBqc29uW2kgKyAyXSA9PT0gJ1wiJyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAganNvbi5sZW5ndGggPCBtaW5NdWx0aUxpbmVMZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGkgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZvbGRpbmcgd2lsbCBlYXQgZmlyc3QgbmV3bGluZVxuICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9IGpzb24uc2xpY2Uoc3RhcnQsIGkpICsgJ1xcblxcbic7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAoanNvbltpICsgMl0gPT09ICdcXFxcJyAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGpzb25baSArIDNdID09PSAnbicgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqc29uW2kgKyA0XSAhPT0gJ1wiJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ciArPSAnXFxuJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpICs9IDI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0gaW5kZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc3BhY2UgYWZ0ZXIgbmV3bGluZSBuZWVkcyB0byBiZSBlc2NhcGVkIHRvIG5vdCBiZSBmb2xkZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqc29uW2kgKyAyXSA9PT0gJyAnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ciArPSAnXFxcXCc7XG4gICAgICAgICAgICAgICAgICAgICAgICBpICs9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydCA9IGkgKyAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGkgKz0gMTtcbiAgICAgICAgICAgIH1cbiAgICB9XG4gICAgc3RyID0gc3RhcnQgPyBzdHIgKyBqc29uLnNsaWNlKHN0YXJ0KSA6IGpzb247XG4gICAgcmV0dXJuIGltcGxpY2l0S2V5XG4gICAgICAgID8gc3RyXG4gICAgICAgIDogZm9sZEZsb3dMaW5lcy5mb2xkRmxvd0xpbmVzKHN0ciwgaW5kZW50LCBmb2xkRmxvd0xpbmVzLkZPTERfUVVPVEVELCBnZXRGb2xkT3B0aW9ucyhjdHgsIGZhbHNlKSk7XG59XG5mdW5jdGlvbiBzaW5nbGVRdW90ZWRTdHJpbmcodmFsdWUsIGN0eCkge1xuICAgIGlmIChjdHgub3B0aW9ucy5zaW5nbGVRdW90ZSA9PT0gZmFsc2UgfHxcbiAgICAgICAgKGN0eC5pbXBsaWNpdEtleSAmJiB2YWx1ZS5pbmNsdWRlcygnXFxuJykpIHx8XG4gICAgICAgIC9bIFxcdF1cXG58XFxuWyBcXHRdLy50ZXN0KHZhbHVlKSAvLyBzaW5nbGUgcXVvdGVkIHN0cmluZyBjYW4ndCBoYXZlIGxlYWRpbmcgb3IgdHJhaWxpbmcgd2hpdGVzcGFjZSBhcm91bmQgbmV3bGluZVxuICAgIClcbiAgICAgICAgcmV0dXJuIGRvdWJsZVF1b3RlZFN0cmluZyh2YWx1ZSwgY3R4KTtcbiAgICBjb25zdCBpbmRlbnQgPSBjdHguaW5kZW50IHx8IChjb250YWluc0RvY3VtZW50TWFya2VyKHZhbHVlKSA/ICcgICcgOiAnJyk7XG4gICAgY29uc3QgcmVzID0gXCInXCIgKyB2YWx1ZS5yZXBsYWNlKC8nL2csIFwiJydcIikucmVwbGFjZSgvXFxuKy9nLCBgJCZcXG4ke2luZGVudH1gKSArIFwiJ1wiO1xuICAgIHJldHVybiBjdHguaW1wbGljaXRLZXlcbiAgICAgICAgPyByZXNcbiAgICAgICAgOiBmb2xkRmxvd0xpbmVzLmZvbGRGbG93TGluZXMocmVzLCBpbmRlbnQsIGZvbGRGbG93TGluZXMuRk9MRF9GTE9XLCBnZXRGb2xkT3B0aW9ucyhjdHgsIGZhbHNlKSk7XG59XG5mdW5jdGlvbiBxdW90ZWRTdHJpbmcodmFsdWUsIGN0eCkge1xuICAgIGNvbnN0IHsgc2luZ2xlUXVvdGUgfSA9IGN0eC5vcHRpb25zO1xuICAgIGxldCBxcztcbiAgICBpZiAoc2luZ2xlUXVvdGUgPT09IGZhbHNlKVxuICAgICAgICBxcyA9IGRvdWJsZVF1b3RlZFN0cmluZztcbiAgICBlbHNlIHtcbiAgICAgICAgY29uc3QgaGFzRG91YmxlID0gdmFsdWUuaW5jbHVkZXMoJ1wiJyk7XG4gICAgICAgIGNvbnN0IGhhc1NpbmdsZSA9IHZhbHVlLmluY2x1ZGVzKFwiJ1wiKTtcbiAgICAgICAgaWYgKGhhc0RvdWJsZSAmJiAhaGFzU2luZ2xlKVxuICAgICAgICAgICAgcXMgPSBzaW5nbGVRdW90ZWRTdHJpbmc7XG4gICAgICAgIGVsc2UgaWYgKGhhc1NpbmdsZSAmJiAhaGFzRG91YmxlKVxuICAgICAgICAgICAgcXMgPSBkb3VibGVRdW90ZWRTdHJpbmc7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHFzID0gc2luZ2xlUXVvdGUgPyBzaW5nbGVRdW90ZWRTdHJpbmcgOiBkb3VibGVRdW90ZWRTdHJpbmc7XG4gICAgfVxuICAgIHJldHVybiBxcyh2YWx1ZSwgY3R4KTtcbn1cbi8vIFRoZSBuZWdhdGl2ZSBsb29rYmVoaW5kIGF2b2lkcyBhIHBvbHlub21pYWwgc2VhcmNoLFxuLy8gYnV0IGlzbid0IHN1cHBvcnRlZCB5ZXQgb24gU2FmYXJpOiBodHRwczovL2Nhbml1c2UuY29tL2pzLXJlZ2V4cC1sb29rYmVoaW5kXG5sZXQgYmxvY2tFbmROZXdsaW5lcztcbnRyeSB7XG4gICAgYmxvY2tFbmROZXdsaW5lcyA9IG5ldyBSZWdFeHAoJyhefCg/PCFcXG4pKVxcbisoPyFcXG58JCknLCAnZycpO1xufVxuY2F0Y2gge1xuICAgIGJsb2NrRW5kTmV3bGluZXMgPSAvXFxuKyg/IVxcbnwkKS9nO1xufVxuZnVuY3Rpb24gYmxvY2tTdHJpbmcoeyBjb21tZW50LCB0eXBlLCB2YWx1ZSB9LCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApIHtcbiAgICBjb25zdCB7IGJsb2NrUXVvdGUsIGNvbW1lbnRTdHJpbmcsIGxpbmVXaWR0aCB9ID0gY3R4Lm9wdGlvbnM7XG4gICAgLy8gMS4gQmxvY2sgY2FuJ3QgZW5kIGluIHdoaXRlc3BhY2UgdW5sZXNzIHRoZSBsYXN0IGxpbmUgaXMgbm9uLWVtcHR5LlxuICAgIC8vIDIuIFN0cmluZ3MgY29uc2lzdGluZyBvZiBvbmx5IHdoaXRlc3BhY2UgYXJlIGJlc3QgcmVuZGVyZWQgZXhwbGljaXRseS5cbiAgICBpZiAoIWJsb2NrUXVvdGUgfHwgL1xcbltcXHQgXSskLy50ZXN0KHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gcXVvdGVkU3RyaW5nKHZhbHVlLCBjdHgpO1xuICAgIH1cbiAgICBjb25zdCBpbmRlbnQgPSBjdHguaW5kZW50IHx8XG4gICAgICAgIChjdHguZm9yY2VCbG9ja0luZGVudCB8fCBjb250YWluc0RvY3VtZW50TWFya2VyKHZhbHVlKSA/ICcgICcgOiAnJyk7XG4gICAgY29uc3QgbGl0ZXJhbCA9IGJsb2NrUXVvdGUgPT09ICdsaXRlcmFsJ1xuICAgICAgICA/IHRydWVcbiAgICAgICAgOiBibG9ja1F1b3RlID09PSAnZm9sZGVkJyB8fCB0eXBlID09PSBTY2FsYXIuU2NhbGFyLkJMT0NLX0ZPTERFRFxuICAgICAgICAgICAgPyBmYWxzZVxuICAgICAgICAgICAgOiB0eXBlID09PSBTY2FsYXIuU2NhbGFyLkJMT0NLX0xJVEVSQUxcbiAgICAgICAgICAgICAgICA/IHRydWVcbiAgICAgICAgICAgICAgICA6ICFsaW5lTGVuZ3RoT3ZlckxpbWl0KHZhbHVlLCBsaW5lV2lkdGgsIGluZGVudC5sZW5ndGgpO1xuICAgIGlmICghdmFsdWUpXG4gICAgICAgIHJldHVybiBsaXRlcmFsID8gJ3xcXG4nIDogJz5cXG4nO1xuICAgIC8vIGRldGVybWluZSBjaG9tcGluZyBmcm9tIHdoaXRlc3BhY2UgYXQgdmFsdWUgZW5kXG4gICAgbGV0IGNob21wO1xuICAgIGxldCBlbmRTdGFydDtcbiAgICBmb3IgKGVuZFN0YXJ0ID0gdmFsdWUubGVuZ3RoOyBlbmRTdGFydCA+IDA7IC0tZW5kU3RhcnQpIHtcbiAgICAgICAgY29uc3QgY2ggPSB2YWx1ZVtlbmRTdGFydCAtIDFdO1xuICAgICAgICBpZiAoY2ggIT09ICdcXG4nICYmIGNoICE9PSAnXFx0JyAmJiBjaCAhPT0gJyAnKVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGxldCBlbmQgPSB2YWx1ZS5zdWJzdHJpbmcoZW5kU3RhcnQpO1xuICAgIGNvbnN0IGVuZE5sUG9zID0gZW5kLmluZGV4T2YoJ1xcbicpO1xuICAgIGlmIChlbmRObFBvcyA9PT0gLTEpIHtcbiAgICAgICAgY2hvbXAgPSAnLSc7IC8vIHN0cmlwXG4gICAgfVxuICAgIGVsc2UgaWYgKHZhbHVlID09PSBlbmQgfHwgZW5kTmxQb3MgIT09IGVuZC5sZW5ndGggLSAxKSB7XG4gICAgICAgIGNob21wID0gJysnOyAvLyBrZWVwXG4gICAgICAgIGlmIChvbkNob21wS2VlcClcbiAgICAgICAgICAgIG9uQ2hvbXBLZWVwKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjaG9tcCA9ICcnOyAvLyBjbGlwXG4gICAgfVxuICAgIGlmIChlbmQpIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5zbGljZSgwLCAtZW5kLmxlbmd0aCk7XG4gICAgICAgIGlmIChlbmRbZW5kLmxlbmd0aCAtIDFdID09PSAnXFxuJylcbiAgICAgICAgICAgIGVuZCA9IGVuZC5zbGljZSgwLCAtMSk7XG4gICAgICAgIGVuZCA9IGVuZC5yZXBsYWNlKGJsb2NrRW5kTmV3bGluZXMsIGAkJiR7aW5kZW50fWApO1xuICAgIH1cbiAgICAvLyBkZXRlcm1pbmUgaW5kZW50IGluZGljYXRvciBmcm9tIHdoaXRlc3BhY2UgYXQgdmFsdWUgc3RhcnRcbiAgICBsZXQgc3RhcnRXaXRoU3BhY2UgPSBmYWxzZTtcbiAgICBsZXQgc3RhcnRFbmQ7XG4gICAgbGV0IHN0YXJ0TmxQb3MgPSAtMTtcbiAgICBmb3IgKHN0YXJ0RW5kID0gMDsgc3RhcnRFbmQgPCB2YWx1ZS5sZW5ndGg7ICsrc3RhcnRFbmQpIHtcbiAgICAgICAgY29uc3QgY2ggPSB2YWx1ZVtzdGFydEVuZF07XG4gICAgICAgIGlmIChjaCA9PT0gJyAnKVxuICAgICAgICAgICAgc3RhcnRXaXRoU3BhY2UgPSB0cnVlO1xuICAgICAgICBlbHNlIGlmIChjaCA9PT0gJ1xcbicpXG4gICAgICAgICAgICBzdGFydE5sUG9zID0gc3RhcnRFbmQ7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBsZXQgc3RhcnQgPSB2YWx1ZS5zdWJzdHJpbmcoMCwgc3RhcnRObFBvcyA8IHN0YXJ0RW5kID8gc3RhcnRObFBvcyArIDEgOiBzdGFydEVuZCk7XG4gICAgaWYgKHN0YXJ0KSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWUuc3Vic3RyaW5nKHN0YXJ0Lmxlbmd0aCk7XG4gICAgICAgIHN0YXJ0ID0gc3RhcnQucmVwbGFjZSgvXFxuKy9nLCBgJCYke2luZGVudH1gKTtcbiAgICB9XG4gICAgY29uc3QgaW5kZW50U2l6ZSA9IGluZGVudCA/ICcyJyA6ICcxJzsgLy8gcm9vdCBpcyBhdCAtMVxuICAgIC8vIExlYWRpbmcgfCBvciA+IGlzIGFkZGVkIGxhdGVyXG4gICAgbGV0IGhlYWRlciA9IChzdGFydFdpdGhTcGFjZSA/IGluZGVudFNpemUgOiAnJykgKyBjaG9tcDtcbiAgICBpZiAoY29tbWVudCkge1xuICAgICAgICBoZWFkZXIgKz0gJyAnICsgY29tbWVudFN0cmluZyhjb21tZW50LnJlcGxhY2UoLyA/W1xcclxcbl0rL2csICcgJykpO1xuICAgICAgICBpZiAob25Db21tZW50KVxuICAgICAgICAgICAgb25Db21tZW50KCk7XG4gICAgfVxuICAgIGlmICghbGl0ZXJhbCkge1xuICAgICAgICBjb25zdCBmb2xkZWRWYWx1ZSA9IHZhbHVlXG4gICAgICAgICAgICAucmVwbGFjZSgvXFxuKy9nLCAnXFxuJCYnKVxuICAgICAgICAgICAgLnJlcGxhY2UoLyg/Ol58XFxuKShbXFx0IF0uKikoPzooW1xcblxcdCBdKilcXG4oPyFbXFxuXFx0IF0pKT8vZywgJyQxJDInKSAvLyBtb3JlLWluZGVudGVkIGxpbmVzIGFyZW4ndCBmb2xkZWRcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIF4gbW9yZS1pbmQuIF4gZW1wdHkgICAgIF4gY2FwdHVyZSBuZXh0IGVtcHR5IGxpbmVzIG9ubHkgYXQgZW5kIG9mIGluZGVudFxuICAgICAgICAgICAgLnJlcGxhY2UoL1xcbisvZywgYCQmJHtpbmRlbnR9YCk7XG4gICAgICAgIGxldCBsaXRlcmFsRmFsbGJhY2sgPSBmYWxzZTtcbiAgICAgICAgY29uc3QgZm9sZE9wdGlvbnMgPSBnZXRGb2xkT3B0aW9ucyhjdHgsIHRydWUpO1xuICAgICAgICBpZiAoYmxvY2tRdW90ZSAhPT0gJ2ZvbGRlZCcgJiYgdHlwZSAhPT0gU2NhbGFyLlNjYWxhci5CTE9DS19GT0xERUQpIHtcbiAgICAgICAgICAgIGZvbGRPcHRpb25zLm9uT3ZlcmZsb3cgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgbGl0ZXJhbEZhbGxiYWNrID0gdHJ1ZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYm9keSA9IGZvbGRGbG93TGluZXMuZm9sZEZsb3dMaW5lcyhgJHtzdGFydH0ke2ZvbGRlZFZhbHVlfSR7ZW5kfWAsIGluZGVudCwgZm9sZEZsb3dMaW5lcy5GT0xEX0JMT0NLLCBmb2xkT3B0aW9ucyk7XG4gICAgICAgIGlmICghbGl0ZXJhbEZhbGxiYWNrKVxuICAgICAgICAgICAgcmV0dXJuIGA+JHtoZWFkZXJ9XFxuJHtpbmRlbnR9JHtib2R5fWA7XG4gICAgfVxuICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZSgvXFxuKy9nLCBgJCYke2luZGVudH1gKTtcbiAgICByZXR1cm4gYHwke2hlYWRlcn1cXG4ke2luZGVudH0ke3N0YXJ0fSR7dmFsdWV9JHtlbmR9YDtcbn1cbmZ1bmN0aW9uIHBsYWluU3RyaW5nKGl0ZW0sIGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCkge1xuICAgIGNvbnN0IHsgdHlwZSwgdmFsdWUgfSA9IGl0ZW07XG4gICAgY29uc3QgeyBhY3R1YWxTdHJpbmcsIGltcGxpY2l0S2V5LCBpbmRlbnQsIGluZGVudFN0ZXAsIGluRmxvdyB9ID0gY3R4O1xuICAgIGlmICgoaW1wbGljaXRLZXkgJiYgdmFsdWUuaW5jbHVkZXMoJ1xcbicpKSB8fFxuICAgICAgICAoaW5GbG93ICYmIC9bW1xcXXt9LF0vLnRlc3QodmFsdWUpKSkge1xuICAgICAgICByZXR1cm4gcXVvdGVkU3RyaW5nKHZhbHVlLCBjdHgpO1xuICAgIH1cbiAgICBpZiAoL15bXFxuXFx0ICxbXFxde30jJiohfD4nXCIlQGBdfF5bPy1dJHxeWz8tXVsgXFx0XXxbXFxuOl1bIFxcdF18WyBcXHRdXFxufFtcXG5cXHQgXSN8W1xcblxcdCA6XSQvLnRlc3QodmFsdWUpKSB7XG4gICAgICAgIC8vIG5vdCBhbGxvd2VkOlxuICAgICAgICAvLyAtICctJyBvciAnPydcbiAgICAgICAgLy8gLSBzdGFydCB3aXRoIGFuIGluZGljYXRvciBjaGFyYWN0ZXIgKGV4Y2VwdCBbPzotXSkgb3IgL1s/LV0gL1xuICAgICAgICAvLyAtICdcXG4gJywgJzogJyBvciAnIFxcbicgYW55d2hlcmVcbiAgICAgICAgLy8gLSAnIycgbm90IHByZWNlZGVkIGJ5IGEgbm9uLXNwYWNlIGNoYXJcbiAgICAgICAgLy8gLSBlbmQgd2l0aCAnICcgb3IgJzonXG4gICAgICAgIHJldHVybiBpbXBsaWNpdEtleSB8fCBpbkZsb3cgfHwgIXZhbHVlLmluY2x1ZGVzKCdcXG4nKVxuICAgICAgICAgICAgPyBxdW90ZWRTdHJpbmcodmFsdWUsIGN0eClcbiAgICAgICAgICAgIDogYmxvY2tTdHJpbmcoaXRlbSwgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKTtcbiAgICB9XG4gICAgaWYgKCFpbXBsaWNpdEtleSAmJlxuICAgICAgICAhaW5GbG93ICYmXG4gICAgICAgIHR5cGUgIT09IFNjYWxhci5TY2FsYXIuUExBSU4gJiZcbiAgICAgICAgdmFsdWUuaW5jbHVkZXMoJ1xcbicpKSB7XG4gICAgICAgIC8vIFdoZXJlIGFsbG93ZWQgJiB0eXBlIG5vdCBzZXQgZXhwbGljaXRseSwgcHJlZmVyIGJsb2NrIHN0eWxlIGZvciBtdWx0aWxpbmUgc3RyaW5nc1xuICAgICAgICByZXR1cm4gYmxvY2tTdHJpbmcoaXRlbSwgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKTtcbiAgICB9XG4gICAgaWYgKGNvbnRhaW5zRG9jdW1lbnRNYXJrZXIodmFsdWUpKSB7XG4gICAgICAgIGlmIChpbmRlbnQgPT09ICcnKSB7XG4gICAgICAgICAgICBjdHguZm9yY2VCbG9ja0luZGVudCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm4gYmxvY2tTdHJpbmcoaXRlbSwgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpbXBsaWNpdEtleSAmJiBpbmRlbnQgPT09IGluZGVudFN0ZXApIHtcbiAgICAgICAgICAgIHJldHVybiBxdW90ZWRTdHJpbmcodmFsdWUsIGN0eCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3Qgc3RyID0gdmFsdWUucmVwbGFjZSgvXFxuKy9nLCBgJCZcXG4ke2luZGVudH1gKTtcbiAgICAvLyBWZXJpZnkgdGhhdCBvdXRwdXQgd2lsbCBiZSBwYXJzZWQgYXMgYSBzdHJpbmcsIGFzIGUuZy4gcGxhaW4gbnVtYmVycyBhbmRcbiAgICAvLyBib29sZWFucyBnZXQgcGFyc2VkIHdpdGggdGhvc2UgdHlwZXMgaW4gdjEuMiAoZS5nLiAnNDInLCAndHJ1ZScgJiAnMC45ZS0zJyksXG4gICAgLy8gYW5kIG90aGVycyBpbiB2MS4xLlxuICAgIGlmIChhY3R1YWxTdHJpbmcpIHtcbiAgICAgICAgY29uc3QgdGVzdCA9ICh0YWcpID0+IHRhZy5kZWZhdWx0ICYmIHRhZy50YWcgIT09ICd0YWc6eWFtbC5vcmcsMjAwMjpzdHInICYmIHRhZy50ZXN0Py50ZXN0KHN0cik7XG4gICAgICAgIGNvbnN0IHsgY29tcGF0LCB0YWdzIH0gPSBjdHguZG9jLnNjaGVtYTtcbiAgICAgICAgaWYgKHRhZ3Muc29tZSh0ZXN0KSB8fCBjb21wYXQ/LnNvbWUodGVzdCkpXG4gICAgICAgICAgICByZXR1cm4gcXVvdGVkU3RyaW5nKHZhbHVlLCBjdHgpO1xuICAgIH1cbiAgICByZXR1cm4gaW1wbGljaXRLZXlcbiAgICAgICAgPyBzdHJcbiAgICAgICAgOiBmb2xkRmxvd0xpbmVzLmZvbGRGbG93TGluZXMoc3RyLCBpbmRlbnQsIGZvbGRGbG93TGluZXMuRk9MRF9GTE9XLCBnZXRGb2xkT3B0aW9ucyhjdHgsIGZhbHNlKSk7XG59XG5mdW5jdGlvbiBzdHJpbmdpZnlTdHJpbmcoaXRlbSwgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKSB7XG4gICAgY29uc3QgeyBpbXBsaWNpdEtleSwgaW5GbG93IH0gPSBjdHg7XG4gICAgY29uc3Qgc3MgPSB0eXBlb2YgaXRlbS52YWx1ZSA9PT0gJ3N0cmluZydcbiAgICAgICAgPyBpdGVtXG4gICAgICAgIDogT2JqZWN0LmFzc2lnbih7fSwgaXRlbSwgeyB2YWx1ZTogU3RyaW5nKGl0ZW0udmFsdWUpIH0pO1xuICAgIGxldCB7IHR5cGUgfSA9IGl0ZW07XG4gICAgaWYgKHR5cGUgIT09IFNjYWxhci5TY2FsYXIuUVVPVEVfRE9VQkxFKSB7XG4gICAgICAgIC8vIGZvcmNlIGRvdWJsZSBxdW90ZXMgb24gY29udHJvbCBjaGFyYWN0ZXJzICYgdW5wYWlyZWQgc3Vycm9nYXRlc1xuICAgICAgICBpZiAoL1tcXHgwMC1cXHgwOFxceDBiLVxceDFmXFx4N2YtXFx4OWZcXHV7RDgwMH0tXFx1e0RGRkZ9XS91LnRlc3Qoc3MudmFsdWUpKVxuICAgICAgICAgICAgdHlwZSA9IFNjYWxhci5TY2FsYXIuUVVPVEVfRE9VQkxFO1xuICAgIH1cbiAgICBjb25zdCBfc3RyaW5naWZ5ID0gKF90eXBlKSA9PiB7XG4gICAgICAgIHN3aXRjaCAoX3R5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgU2NhbGFyLlNjYWxhci5CTE9DS19GT0xERUQ6XG4gICAgICAgICAgICBjYXNlIFNjYWxhci5TY2FsYXIuQkxPQ0tfTElURVJBTDpcbiAgICAgICAgICAgICAgICByZXR1cm4gaW1wbGljaXRLZXkgfHwgaW5GbG93XG4gICAgICAgICAgICAgICAgICAgID8gcXVvdGVkU3RyaW5nKHNzLnZhbHVlLCBjdHgpIC8vIGJsb2NrcyBhcmUgbm90IHZhbGlkIGluc2lkZSBmbG93IGNvbnRhaW5lcnNcbiAgICAgICAgICAgICAgICAgICAgOiBibG9ja1N0cmluZyhzcywgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKTtcbiAgICAgICAgICAgIGNhc2UgU2NhbGFyLlNjYWxhci5RVU9URV9ET1VCTEU6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvdWJsZVF1b3RlZFN0cmluZyhzcy52YWx1ZSwgY3R4KTtcbiAgICAgICAgICAgIGNhc2UgU2NhbGFyLlNjYWxhci5RVU9URV9TSU5HTEU6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNpbmdsZVF1b3RlZFN0cmluZyhzcy52YWx1ZSwgY3R4KTtcbiAgICAgICAgICAgIGNhc2UgU2NhbGFyLlNjYWxhci5QTEFJTjpcbiAgICAgICAgICAgICAgICByZXR1cm4gcGxhaW5TdHJpbmcoc3MsIGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCk7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBsZXQgcmVzID0gX3N0cmluZ2lmeSh0eXBlKTtcbiAgICBpZiAocmVzID09PSBudWxsKSB7XG4gICAgICAgIGNvbnN0IHsgZGVmYXVsdEtleVR5cGUsIGRlZmF1bHRTdHJpbmdUeXBlIH0gPSBjdHgub3B0aW9ucztcbiAgICAgICAgY29uc3QgdCA9IChpbXBsaWNpdEtleSAmJiBkZWZhdWx0S2V5VHlwZSkgfHwgZGVmYXVsdFN0cmluZ1R5cGU7XG4gICAgICAgIHJlcyA9IF9zdHJpbmdpZnkodCk7XG4gICAgICAgIGlmIChyZXMgPT09IG51bGwpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIGRlZmF1bHQgc3RyaW5nIHR5cGUgJHt0fWApO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xufVxuXG5leHBvcnRzLnN0cmluZ2lmeVN0cmluZyA9IHN0cmluZ2lmeVN0cmluZztcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYW5jaG9ycyA9IHJlcXVpcmUoJy4uL2RvYy9hbmNob3JzLmpzJyk7XG52YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuLi9ub2Rlcy9pZGVudGl0eS5qcycpO1xudmFyIHN0cmluZ2lmeUNvbW1lbnQgPSByZXF1aXJlKCcuL3N0cmluZ2lmeUNvbW1lbnQuanMnKTtcbnZhciBzdHJpbmdpZnlTdHJpbmcgPSByZXF1aXJlKCcuL3N0cmluZ2lmeVN0cmluZy5qcycpO1xuXG5mdW5jdGlvbiBjcmVhdGVTdHJpbmdpZnlDb250ZXh0KGRvYywgb3B0aW9ucykge1xuICAgIGNvbnN0IG9wdCA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgICBibG9ja1F1b3RlOiB0cnVlLFxuICAgICAgICBjb21tZW50U3RyaW5nOiBzdHJpbmdpZnlDb21tZW50LnN0cmluZ2lmeUNvbW1lbnQsXG4gICAgICAgIGRlZmF1bHRLZXlUeXBlOiBudWxsLFxuICAgICAgICBkZWZhdWx0U3RyaW5nVHlwZTogJ1BMQUlOJyxcbiAgICAgICAgZGlyZWN0aXZlczogbnVsbCxcbiAgICAgICAgZG91YmxlUXVvdGVkQXNKU09OOiBmYWxzZSxcbiAgICAgICAgZG91YmxlUXVvdGVkTWluTXVsdGlMaW5lTGVuZ3RoOiA0MCxcbiAgICAgICAgZmFsc2VTdHI6ICdmYWxzZScsXG4gICAgICAgIGZsb3dDb2xsZWN0aW9uUGFkZGluZzogdHJ1ZSxcbiAgICAgICAgaW5kZW50U2VxOiB0cnVlLFxuICAgICAgICBsaW5lV2lkdGg6IDgwLFxuICAgICAgICBtaW5Db250ZW50V2lkdGg6IDIwLFxuICAgICAgICBudWxsU3RyOiAnbnVsbCcsXG4gICAgICAgIHNpbXBsZUtleXM6IGZhbHNlLFxuICAgICAgICBzaW5nbGVRdW90ZTogbnVsbCxcbiAgICAgICAgdHJhaWxpbmdDb21tYTogZmFsc2UsXG4gICAgICAgIHRydWVTdHI6ICd0cnVlJyxcbiAgICAgICAgdmVyaWZ5QWxpYXNPcmRlcjogdHJ1ZVxuICAgIH0sIGRvYy5zY2hlbWEudG9TdHJpbmdPcHRpb25zLCBvcHRpb25zKTtcbiAgICBsZXQgaW5GbG93O1xuICAgIHN3aXRjaCAob3B0LmNvbGxlY3Rpb25TdHlsZSkge1xuICAgICAgICBjYXNlICdibG9jayc6XG4gICAgICAgICAgICBpbkZsb3cgPSBmYWxzZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdmbG93JzpcbiAgICAgICAgICAgIGluRmxvdyA9IHRydWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGluRmxvdyA9IG51bGw7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIGFuY2hvcnM6IG5ldyBTZXQoKSxcbiAgICAgICAgZG9jLFxuICAgICAgICBmbG93Q29sbGVjdGlvblBhZGRpbmc6IG9wdC5mbG93Q29sbGVjdGlvblBhZGRpbmcgPyAnICcgOiAnJyxcbiAgICAgICAgaW5kZW50OiAnJyxcbiAgICAgICAgaW5kZW50U3RlcDogdHlwZW9mIG9wdC5pbmRlbnQgPT09ICdudW1iZXInID8gJyAnLnJlcGVhdChvcHQuaW5kZW50KSA6ICcgICcsXG4gICAgICAgIGluRmxvdyxcbiAgICAgICAgb3B0aW9uczogb3B0XG4gICAgfTtcbn1cbmZ1bmN0aW9uIGdldFRhZ09iamVjdCh0YWdzLCBpdGVtKSB7XG4gICAgaWYgKGl0ZW0udGFnKSB7XG4gICAgICAgIGNvbnN0IG1hdGNoID0gdGFncy5maWx0ZXIodCA9PiB0LnRhZyA9PT0gaXRlbS50YWcpO1xuICAgICAgICBpZiAobWF0Y2gubGVuZ3RoID4gMClcbiAgICAgICAgICAgIHJldHVybiBtYXRjaC5maW5kKHQgPT4gdC5mb3JtYXQgPT09IGl0ZW0uZm9ybWF0KSA/PyBtYXRjaFswXTtcbiAgICB9XG4gICAgbGV0IHRhZ09iaiA9IHVuZGVmaW5lZDtcbiAgICBsZXQgb2JqO1xuICAgIGlmIChpZGVudGl0eS5pc1NjYWxhcihpdGVtKSkge1xuICAgICAgICBvYmogPSBpdGVtLnZhbHVlO1xuICAgICAgICBsZXQgbWF0Y2ggPSB0YWdzLmZpbHRlcih0ID0+IHQuaWRlbnRpZnk/LihvYmopKTtcbiAgICAgICAgaWYgKG1hdGNoLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIGNvbnN0IHRlc3RNYXRjaCA9IG1hdGNoLmZpbHRlcih0ID0+IHQudGVzdCk7XG4gICAgICAgICAgICBpZiAodGVzdE1hdGNoLmxlbmd0aCA+IDApXG4gICAgICAgICAgICAgICAgbWF0Y2ggPSB0ZXN0TWF0Y2g7XG4gICAgICAgIH1cbiAgICAgICAgdGFnT2JqID1cbiAgICAgICAgICAgIG1hdGNoLmZpbmQodCA9PiB0LmZvcm1hdCA9PT0gaXRlbS5mb3JtYXQpID8/IG1hdGNoLmZpbmQodCA9PiAhdC5mb3JtYXQpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgb2JqID0gaXRlbTtcbiAgICAgICAgdGFnT2JqID0gdGFncy5maW5kKHQgPT4gdC5ub2RlQ2xhc3MgJiYgb2JqIGluc3RhbmNlb2YgdC5ub2RlQ2xhc3MpO1xuICAgIH1cbiAgICBpZiAoIXRhZ09iaikge1xuICAgICAgICBjb25zdCBuYW1lID0gb2JqPy5jb25zdHJ1Y3Rvcj8ubmFtZSA/PyAob2JqID09PSBudWxsID8gJ251bGwnIDogdHlwZW9mIG9iaik7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVGFnIG5vdCByZXNvbHZlZCBmb3IgJHtuYW1lfSB2YWx1ZWApO1xuICAgIH1cbiAgICByZXR1cm4gdGFnT2JqO1xufVxuLy8gbmVlZHMgdG8gYmUgY2FsbGVkIGJlZm9yZSB2YWx1ZSBzdHJpbmdpZmllciB0byBhbGxvdyBmb3IgY2lyY3VsYXIgYW5jaG9yIHJlZnNcbmZ1bmN0aW9uIHN0cmluZ2lmeVByb3BzKG5vZGUsIHRhZ09iaiwgeyBhbmNob3JzOiBhbmNob3JzJDEsIGRvYyB9KSB7XG4gICAgaWYgKCFkb2MuZGlyZWN0aXZlcylcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIGNvbnN0IHByb3BzID0gW107XG4gICAgY29uc3QgYW5jaG9yID0gKGlkZW50aXR5LmlzU2NhbGFyKG5vZGUpIHx8IGlkZW50aXR5LmlzQ29sbGVjdGlvbihub2RlKSkgJiYgbm9kZS5hbmNob3I7XG4gICAgaWYgKGFuY2hvciAmJiBhbmNob3JzLmFuY2hvcklzVmFsaWQoYW5jaG9yKSkge1xuICAgICAgICBhbmNob3JzJDEuYWRkKGFuY2hvcik7XG4gICAgICAgIHByb3BzLnB1c2goYCYke2FuY2hvcn1gKTtcbiAgICB9XG4gICAgY29uc3QgdGFnID0gbm9kZS50YWcgPz8gKHRhZ09iai5kZWZhdWx0ID8gbnVsbCA6IHRhZ09iai50YWcpO1xuICAgIGlmICh0YWcpXG4gICAgICAgIHByb3BzLnB1c2goZG9jLmRpcmVjdGl2ZXMudGFnU3RyaW5nKHRhZykpO1xuICAgIHJldHVybiBwcm9wcy5qb2luKCcgJyk7XG59XG5mdW5jdGlvbiBzdHJpbmdpZnkoaXRlbSwgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKSB7XG4gICAgaWYgKGlkZW50aXR5LmlzUGFpcihpdGVtKSlcbiAgICAgICAgcmV0dXJuIGl0ZW0udG9TdHJpbmcoY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKTtcbiAgICBpZiAoaWRlbnRpdHkuaXNBbGlhcyhpdGVtKSkge1xuICAgICAgICBpZiAoY3R4LmRvYy5kaXJlY3RpdmVzKVxuICAgICAgICAgICAgcmV0dXJuIGl0ZW0udG9TdHJpbmcoY3R4KTtcbiAgICAgICAgaWYgKGN0eC5yZXNvbHZlZEFsaWFzZXM/LmhhcyhpdGVtKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgQ2Fubm90IHN0cmluZ2lmeSBjaXJjdWxhciBzdHJ1Y3R1cmUgd2l0aG91dCBhbGlhcyBub2Rlc2ApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKGN0eC5yZXNvbHZlZEFsaWFzZXMpXG4gICAgICAgICAgICAgICAgY3R4LnJlc29sdmVkQWxpYXNlcy5hZGQoaXRlbSk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgY3R4LnJlc29sdmVkQWxpYXNlcyA9IG5ldyBTZXQoW2l0ZW1dKTtcbiAgICAgICAgICAgIGl0ZW0gPSBpdGVtLnJlc29sdmUoY3R4LmRvYyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgbGV0IHRhZ09iaiA9IHVuZGVmaW5lZDtcbiAgICBjb25zdCBub2RlID0gaWRlbnRpdHkuaXNOb2RlKGl0ZW0pXG4gICAgICAgID8gaXRlbVxuICAgICAgICA6IGN0eC5kb2MuY3JlYXRlTm9kZShpdGVtLCB7IG9uVGFnT2JqOiBvID0+ICh0YWdPYmogPSBvKSB9KTtcbiAgICB0YWdPYmogPz8gKHRhZ09iaiA9IGdldFRhZ09iamVjdChjdHguZG9jLnNjaGVtYS50YWdzLCBub2RlKSk7XG4gICAgY29uc3QgcHJvcHMgPSBzdHJpbmdpZnlQcm9wcyhub2RlLCB0YWdPYmosIGN0eCk7XG4gICAgaWYgKHByb3BzLmxlbmd0aCA+IDApXG4gICAgICAgIGN0eC5pbmRlbnRBdFN0YXJ0ID0gKGN0eC5pbmRlbnRBdFN0YXJ0ID8/IDApICsgcHJvcHMubGVuZ3RoICsgMTtcbiAgICBjb25zdCBzdHIgPSB0eXBlb2YgdGFnT2JqLnN0cmluZ2lmeSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICA/IHRhZ09iai5zdHJpbmdpZnkobm9kZSwgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKVxuICAgICAgICA6IGlkZW50aXR5LmlzU2NhbGFyKG5vZGUpXG4gICAgICAgICAgICA/IHN0cmluZ2lmeVN0cmluZy5zdHJpbmdpZnlTdHJpbmcobm9kZSwgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKVxuICAgICAgICAgICAgOiBub2RlLnRvU3RyaW5nKGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCk7XG4gICAgaWYgKCFwcm9wcylcbiAgICAgICAgcmV0dXJuIHN0cjtcbiAgICByZXR1cm4gaWRlbnRpdHkuaXNTY2FsYXIobm9kZSkgfHwgc3RyWzBdID09PSAneycgfHwgc3RyWzBdID09PSAnWydcbiAgICAgICAgPyBgJHtwcm9wc30gJHtzdHJ9YFxuICAgICAgICA6IGAke3Byb3BzfVxcbiR7Y3R4LmluZGVudH0ke3N0cn1gO1xufVxuXG5leHBvcnRzLmNyZWF0ZVN0cmluZ2lmeUNvbnRleHQgPSBjcmVhdGVTdHJpbmdpZnlDb250ZXh0O1xuZXhwb3J0cy5zdHJpbmdpZnkgPSBzdHJpbmdpZnk7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIGlkZW50aXR5ID0gcmVxdWlyZSgnLi4vbm9kZXMvaWRlbnRpdHkuanMnKTtcbnZhciBTY2FsYXIgPSByZXF1aXJlKCcuLi9ub2Rlcy9TY2FsYXIuanMnKTtcbnZhciBzdHJpbmdpZnkgPSByZXF1aXJlKCcuL3N0cmluZ2lmeS5qcycpO1xudmFyIHN0cmluZ2lmeUNvbW1lbnQgPSByZXF1aXJlKCcuL3N0cmluZ2lmeUNvbW1lbnQuanMnKTtcblxuZnVuY3Rpb24gc3RyaW5naWZ5UGFpcih7IGtleSwgdmFsdWUgfSwgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKSB7XG4gICAgY29uc3QgeyBhbGxOdWxsVmFsdWVzLCBkb2MsIGluZGVudCwgaW5kZW50U3RlcCwgb3B0aW9uczogeyBjb21tZW50U3RyaW5nLCBpbmRlbnRTZXEsIHNpbXBsZUtleXMgfSB9ID0gY3R4O1xuICAgIGxldCBrZXlDb21tZW50ID0gKGlkZW50aXR5LmlzTm9kZShrZXkpICYmIGtleS5jb21tZW50KSB8fCBudWxsO1xuICAgIGlmIChzaW1wbGVLZXlzKSB7XG4gICAgICAgIGlmIChrZXlDb21tZW50KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1dpdGggc2ltcGxlIGtleXMsIGtleSBub2RlcyBjYW5ub3QgaGF2ZSBjb21tZW50cycpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpZGVudGl0eS5pc0NvbGxlY3Rpb24oa2V5KSB8fCAoIWlkZW50aXR5LmlzTm9kZShrZXkpICYmIHR5cGVvZiBrZXkgPT09ICdvYmplY3QnKSkge1xuICAgICAgICAgICAgY29uc3QgbXNnID0gJ1dpdGggc2ltcGxlIGtleXMsIGNvbGxlY3Rpb24gY2Fubm90IGJlIHVzZWQgYXMgYSBrZXkgdmFsdWUnO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgbGV0IGV4cGxpY2l0S2V5ID0gIXNpbXBsZUtleXMgJiZcbiAgICAgICAgKCFrZXkgfHxcbiAgICAgICAgICAgIChrZXlDb21tZW50ICYmIHZhbHVlID09IG51bGwgJiYgIWN0eC5pbkZsb3cpIHx8XG4gICAgICAgICAgICBpZGVudGl0eS5pc0NvbGxlY3Rpb24oa2V5KSB8fFxuICAgICAgICAgICAgKGlkZW50aXR5LmlzU2NhbGFyKGtleSlcbiAgICAgICAgICAgICAgICA/IGtleS50eXBlID09PSBTY2FsYXIuU2NhbGFyLkJMT0NLX0ZPTERFRCB8fCBrZXkudHlwZSA9PT0gU2NhbGFyLlNjYWxhci5CTE9DS19MSVRFUkFMXG4gICAgICAgICAgICAgICAgOiB0eXBlb2Yga2V5ID09PSAnb2JqZWN0JykpO1xuICAgIGN0eCA9IE9iamVjdC5hc3NpZ24oe30sIGN0eCwge1xuICAgICAgICBhbGxOdWxsVmFsdWVzOiBmYWxzZSxcbiAgICAgICAgaW1wbGljaXRLZXk6ICFleHBsaWNpdEtleSAmJiAoc2ltcGxlS2V5cyB8fCAhYWxsTnVsbFZhbHVlcyksXG4gICAgICAgIGluZGVudDogaW5kZW50ICsgaW5kZW50U3RlcFxuICAgIH0pO1xuICAgIGxldCBrZXlDb21tZW50RG9uZSA9IGZhbHNlO1xuICAgIGxldCBjaG9tcEtlZXAgPSBmYWxzZTtcbiAgICBsZXQgc3RyID0gc3RyaW5naWZ5LnN0cmluZ2lmeShrZXksIGN0eCwgKCkgPT4gKGtleUNvbW1lbnREb25lID0gdHJ1ZSksICgpID0+IChjaG9tcEtlZXAgPSB0cnVlKSk7XG4gICAgaWYgKCFleHBsaWNpdEtleSAmJiAhY3R4LmluRmxvdyAmJiBzdHIubGVuZ3RoID4gMTAyNCkge1xuICAgICAgICBpZiAoc2ltcGxlS2V5cylcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignV2l0aCBzaW1wbGUga2V5cywgc2luZ2xlIGxpbmUgc2NhbGFyIG11c3Qgbm90IHNwYW4gbW9yZSB0aGFuIDEwMjQgY2hhcmFjdGVycycpO1xuICAgICAgICBleHBsaWNpdEtleSA9IHRydWU7XG4gICAgfVxuICAgIGlmIChjdHguaW5GbG93KSB7XG4gICAgICAgIGlmIChhbGxOdWxsVmFsdWVzIHx8IHZhbHVlID09IG51bGwpIHtcbiAgICAgICAgICAgIGlmIChrZXlDb21tZW50RG9uZSAmJiBvbkNvbW1lbnQpXG4gICAgICAgICAgICAgICAgb25Db21tZW50KCk7XG4gICAgICAgICAgICByZXR1cm4gc3RyID09PSAnJyA/ICc/JyA6IGV4cGxpY2l0S2V5ID8gYD8gJHtzdHJ9YCA6IHN0cjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgoYWxsTnVsbFZhbHVlcyAmJiAhc2ltcGxlS2V5cykgfHwgKHZhbHVlID09IG51bGwgJiYgZXhwbGljaXRLZXkpKSB7XG4gICAgICAgIHN0ciA9IGA/ICR7c3RyfWA7XG4gICAgICAgIGlmIChrZXlDb21tZW50ICYmICFrZXlDb21tZW50RG9uZSkge1xuICAgICAgICAgICAgc3RyICs9IHN0cmluZ2lmeUNvbW1lbnQubGluZUNvbW1lbnQoc3RyLCBjdHguaW5kZW50LCBjb21tZW50U3RyaW5nKGtleUNvbW1lbnQpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjaG9tcEtlZXAgJiYgb25DaG9tcEtlZXApXG4gICAgICAgICAgICBvbkNob21wS2VlcCgpO1xuICAgICAgICByZXR1cm4gc3RyO1xuICAgIH1cbiAgICBpZiAoa2V5Q29tbWVudERvbmUpXG4gICAgICAgIGtleUNvbW1lbnQgPSBudWxsO1xuICAgIGlmIChleHBsaWNpdEtleSkge1xuICAgICAgICBpZiAoa2V5Q29tbWVudClcbiAgICAgICAgICAgIHN0ciArPSBzdHJpbmdpZnlDb21tZW50LmxpbmVDb21tZW50KHN0ciwgY3R4LmluZGVudCwgY29tbWVudFN0cmluZyhrZXlDb21tZW50KSk7XG4gICAgICAgIHN0ciA9IGA/ICR7c3RyfVxcbiR7aW5kZW50fTpgO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgc3RyID0gYCR7c3RyfTpgO1xuICAgICAgICBpZiAoa2V5Q29tbWVudClcbiAgICAgICAgICAgIHN0ciArPSBzdHJpbmdpZnlDb21tZW50LmxpbmVDb21tZW50KHN0ciwgY3R4LmluZGVudCwgY29tbWVudFN0cmluZyhrZXlDb21tZW50KSk7XG4gICAgfVxuICAgIGxldCB2c2IsIHZjYiwgdmFsdWVDb21tZW50O1xuICAgIGlmIChpZGVudGl0eS5pc05vZGUodmFsdWUpKSB7XG4gICAgICAgIHZzYiA9ICEhdmFsdWUuc3BhY2VCZWZvcmU7XG4gICAgICAgIHZjYiA9IHZhbHVlLmNvbW1lbnRCZWZvcmU7XG4gICAgICAgIHZhbHVlQ29tbWVudCA9IHZhbHVlLmNvbW1lbnQ7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB2c2IgPSBmYWxzZTtcbiAgICAgICAgdmNiID0gbnVsbDtcbiAgICAgICAgdmFsdWVDb21tZW50ID0gbnVsbDtcbiAgICAgICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpXG4gICAgICAgICAgICB2YWx1ZSA9IGRvYy5jcmVhdGVOb2RlKHZhbHVlKTtcbiAgICB9XG4gICAgY3R4LmltcGxpY2l0S2V5ID0gZmFsc2U7XG4gICAgaWYgKCFleHBsaWNpdEtleSAmJiAha2V5Q29tbWVudCAmJiBpZGVudGl0eS5pc1NjYWxhcih2YWx1ZSkpXG4gICAgICAgIGN0eC5pbmRlbnRBdFN0YXJ0ID0gc3RyLmxlbmd0aCArIDE7XG4gICAgY2hvbXBLZWVwID0gZmFsc2U7XG4gICAgaWYgKCFpbmRlbnRTZXEgJiZcbiAgICAgICAgaW5kZW50U3RlcC5sZW5ndGggPj0gMiAmJlxuICAgICAgICAhY3R4LmluRmxvdyAmJlxuICAgICAgICAhZXhwbGljaXRLZXkgJiZcbiAgICAgICAgaWRlbnRpdHkuaXNTZXEodmFsdWUpICYmXG4gICAgICAgICF2YWx1ZS5mbG93ICYmXG4gICAgICAgICF2YWx1ZS50YWcgJiZcbiAgICAgICAgIXZhbHVlLmFuY2hvcikge1xuICAgICAgICAvLyBJZiBpbmRlbnRTZXEgPT09IGZhbHNlLCBjb25zaWRlciAnLSAnIGFzIHBhcnQgb2YgaW5kZW50YXRpb24gd2hlcmUgcG9zc2libGVcbiAgICAgICAgY3R4LmluZGVudCA9IGN0eC5pbmRlbnQuc3Vic3RyaW5nKDIpO1xuICAgIH1cbiAgICBsZXQgdmFsdWVDb21tZW50RG9uZSA9IGZhbHNlO1xuICAgIGNvbnN0IHZhbHVlU3RyID0gc3RyaW5naWZ5LnN0cmluZ2lmeSh2YWx1ZSwgY3R4LCAoKSA9PiAodmFsdWVDb21tZW50RG9uZSA9IHRydWUpLCAoKSA9PiAoY2hvbXBLZWVwID0gdHJ1ZSkpO1xuICAgIGxldCB3cyA9ICcgJztcbiAgICBpZiAoa2V5Q29tbWVudCB8fCB2c2IgfHwgdmNiKSB7XG4gICAgICAgIHdzID0gdnNiID8gJ1xcbicgOiAnJztcbiAgICAgICAgaWYgKHZjYikge1xuICAgICAgICAgICAgY29uc3QgY3MgPSBjb21tZW50U3RyaW5nKHZjYik7XG4gICAgICAgICAgICB3cyArPSBgXFxuJHtzdHJpbmdpZnlDb21tZW50LmluZGVudENvbW1lbnQoY3MsIGN0eC5pbmRlbnQpfWA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHZhbHVlU3RyID09PSAnJyAmJiAhY3R4LmluRmxvdykge1xuICAgICAgICAgICAgaWYgKHdzID09PSAnXFxuJyAmJiB2YWx1ZUNvbW1lbnQpXG4gICAgICAgICAgICAgICAgd3MgPSAnXFxuXFxuJztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHdzICs9IGBcXG4ke2N0eC5pbmRlbnR9YDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICghZXhwbGljaXRLZXkgJiYgaWRlbnRpdHkuaXNDb2xsZWN0aW9uKHZhbHVlKSkge1xuICAgICAgICBjb25zdCB2czAgPSB2YWx1ZVN0clswXTtcbiAgICAgICAgY29uc3QgbmwwID0gdmFsdWVTdHIuaW5kZXhPZignXFxuJyk7XG4gICAgICAgIGNvbnN0IGhhc05ld2xpbmUgPSBubDAgIT09IC0xO1xuICAgICAgICBjb25zdCBmbG93ID0gY3R4LmluRmxvdyA/PyB2YWx1ZS5mbG93ID8/IHZhbHVlLml0ZW1zLmxlbmd0aCA9PT0gMDtcbiAgICAgICAgaWYgKGhhc05ld2xpbmUgfHwgIWZsb3cpIHtcbiAgICAgICAgICAgIGxldCBoYXNQcm9wc0xpbmUgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmIChoYXNOZXdsaW5lICYmICh2czAgPT09ICcmJyB8fCB2czAgPT09ICchJykpIHtcbiAgICAgICAgICAgICAgICBsZXQgc3AwID0gdmFsdWVTdHIuaW5kZXhPZignICcpO1xuICAgICAgICAgICAgICAgIGlmICh2czAgPT09ICcmJyAmJlxuICAgICAgICAgICAgICAgICAgICBzcDAgIT09IC0xICYmXG4gICAgICAgICAgICAgICAgICAgIHNwMCA8IG5sMCAmJlxuICAgICAgICAgICAgICAgICAgICB2YWx1ZVN0cltzcDAgKyAxXSA9PT0gJyEnKSB7XG4gICAgICAgICAgICAgICAgICAgIHNwMCA9IHZhbHVlU3RyLmluZGV4T2YoJyAnLCBzcDAgKyAxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHNwMCA9PT0gLTEgfHwgbmwwIDwgc3AwKVxuICAgICAgICAgICAgICAgICAgICBoYXNQcm9wc0xpbmUgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFoYXNQcm9wc0xpbmUpXG4gICAgICAgICAgICAgICAgd3MgPSBgXFxuJHtjdHguaW5kZW50fWA7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAodmFsdWVTdHIgPT09ICcnIHx8IHZhbHVlU3RyWzBdID09PSAnXFxuJykge1xuICAgICAgICB3cyA9ICcnO1xuICAgIH1cbiAgICBzdHIgKz0gd3MgKyB2YWx1ZVN0cjtcbiAgICBpZiAoY3R4LmluRmxvdykge1xuICAgICAgICBpZiAodmFsdWVDb21tZW50RG9uZSAmJiBvbkNvbW1lbnQpXG4gICAgICAgICAgICBvbkNvbW1lbnQoKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodmFsdWVDb21tZW50ICYmICF2YWx1ZUNvbW1lbnREb25lKSB7XG4gICAgICAgIHN0ciArPSBzdHJpbmdpZnlDb21tZW50LmxpbmVDb21tZW50KHN0ciwgY3R4LmluZGVudCwgY29tbWVudFN0cmluZyh2YWx1ZUNvbW1lbnQpKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoY2hvbXBLZWVwICYmIG9uQ2hvbXBLZWVwKSB7XG4gICAgICAgIG9uQ2hvbXBLZWVwKCk7XG4gICAgfVxuICAgIHJldHVybiBzdHI7XG59XG5cbmV4cG9ydHMuc3RyaW5naWZ5UGFpciA9IHN0cmluZ2lmeVBhaXI7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIG5vZGVfcHJvY2VzcyA9IHJlcXVpcmUoJ3Byb2Nlc3MnKTtcblxuZnVuY3Rpb24gZGVidWcobG9nTGV2ZWwsIC4uLm1lc3NhZ2VzKSB7XG4gICAgaWYgKGxvZ0xldmVsID09PSAnZGVidWcnKVxuICAgICAgICBjb25zb2xlLmxvZyguLi5tZXNzYWdlcyk7XG59XG5mdW5jdGlvbiB3YXJuKGxvZ0xldmVsLCB3YXJuaW5nKSB7XG4gICAgaWYgKGxvZ0xldmVsID09PSAnZGVidWcnIHx8IGxvZ0xldmVsID09PSAnd2FybicpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBub2RlX3Byb2Nlc3MuZW1pdFdhcm5pbmcgPT09ICdmdW5jdGlvbicpXG4gICAgICAgICAgICBub2RlX3Byb2Nlc3MuZW1pdFdhcm5pbmcod2FybmluZyk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybih3YXJuaW5nKTtcbiAgICB9XG59XG5cbmV4cG9ydHMuZGVidWcgPSBkZWJ1ZztcbmV4cG9ydHMud2FybiA9IHdhcm47XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIGlkZW50aXR5ID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvaWRlbnRpdHkuanMnKTtcbnZhciBTY2FsYXIgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9TY2FsYXIuanMnKTtcblxuLy8gSWYgdGhlIHZhbHVlIGFzc29jaWF0ZWQgd2l0aCBhIG1lcmdlIGtleSBpcyBhIHNpbmdsZSBtYXBwaW5nIG5vZGUsIGVhY2ggb2Zcbi8vIGl0cyBrZXkvdmFsdWUgcGFpcnMgaXMgaW5zZXJ0ZWQgaW50byB0aGUgY3VycmVudCBtYXBwaW5nLCB1bmxlc3MgdGhlIGtleVxuLy8gYWxyZWFkeSBleGlzdHMgaW4gaXQuIElmIHRoZSB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggdGhlIG1lcmdlIGtleSBpcyBhXG4vLyBzZXF1ZW5jZSwgdGhlbiB0aGlzIHNlcXVlbmNlIGlzIGV4cGVjdGVkIHRvIGNvbnRhaW4gbWFwcGluZyBub2RlcyBhbmQgZWFjaFxuLy8gb2YgdGhlc2Ugbm9kZXMgaXMgbWVyZ2VkIGluIHR1cm4gYWNjb3JkaW5nIHRvIGl0cyBvcmRlciBpbiB0aGUgc2VxdWVuY2UuXG4vLyBLZXlzIGluIG1hcHBpbmcgbm9kZXMgZWFybGllciBpbiB0aGUgc2VxdWVuY2Ugb3ZlcnJpZGUga2V5cyBzcGVjaWZpZWQgaW5cbi8vIGxhdGVyIG1hcHBpbmcgbm9kZXMuIC0tIGh0dHA6Ly95YW1sLm9yZy90eXBlL21lcmdlLmh0bWxcbmNvbnN0IE1FUkdFX0tFWSA9ICc8PCc7XG5jb25zdCBtZXJnZSA9IHtcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gdmFsdWUgPT09IE1FUkdFX0tFWSB8fFxuICAgICAgICAodHlwZW9mIHZhbHVlID09PSAnc3ltYm9sJyAmJiB2YWx1ZS5kZXNjcmlwdGlvbiA9PT0gTUVSR0VfS0VZKSxcbiAgICBkZWZhdWx0OiAna2V5JyxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjptZXJnZScsXG4gICAgdGVzdDogL148PCQvLFxuICAgIHJlc29sdmU6ICgpID0+IE9iamVjdC5hc3NpZ24obmV3IFNjYWxhci5TY2FsYXIoU3ltYm9sKE1FUkdFX0tFWSkpLCB7XG4gICAgICAgIGFkZFRvSlNNYXA6IGFkZE1lcmdlVG9KU01hcFxuICAgIH0pLFxuICAgIHN0cmluZ2lmeTogKCkgPT4gTUVSR0VfS0VZXG59O1xuY29uc3QgaXNNZXJnZUtleSA9IChjdHgsIGtleSkgPT4gKG1lcmdlLmlkZW50aWZ5KGtleSkgfHxcbiAgICAoaWRlbnRpdHkuaXNTY2FsYXIoa2V5KSAmJlxuICAgICAgICAoIWtleS50eXBlIHx8IGtleS50eXBlID09PSBTY2FsYXIuU2NhbGFyLlBMQUlOKSAmJlxuICAgICAgICBtZXJnZS5pZGVudGlmeShrZXkudmFsdWUpKSkgJiZcbiAgICBjdHg/LmRvYy5zY2hlbWEudGFncy5zb21lKHRhZyA9PiB0YWcudGFnID09PSBtZXJnZS50YWcgJiYgdGFnLmRlZmF1bHQpO1xuZnVuY3Rpb24gYWRkTWVyZ2VUb0pTTWFwKGN0eCwgbWFwLCB2YWx1ZSkge1xuICAgIHZhbHVlID0gY3R4ICYmIGlkZW50aXR5LmlzQWxpYXModmFsdWUpID8gdmFsdWUucmVzb2x2ZShjdHguZG9jKSA6IHZhbHVlO1xuICAgIGlmIChpZGVudGl0eS5pc1NlcSh2YWx1ZSkpXG4gICAgICAgIGZvciAoY29uc3QgaXQgb2YgdmFsdWUuaXRlbXMpXG4gICAgICAgICAgICBtZXJnZVZhbHVlKGN0eCwgbWFwLCBpdCk7XG4gICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpXG4gICAgICAgIGZvciAoY29uc3QgaXQgb2YgdmFsdWUpXG4gICAgICAgICAgICBtZXJnZVZhbHVlKGN0eCwgbWFwLCBpdCk7XG4gICAgZWxzZVxuICAgICAgICBtZXJnZVZhbHVlKGN0eCwgbWFwLCB2YWx1ZSk7XG59XG5mdW5jdGlvbiBtZXJnZVZhbHVlKGN0eCwgbWFwLCB2YWx1ZSkge1xuICAgIGNvbnN0IHNvdXJjZSA9IGN0eCAmJiBpZGVudGl0eS5pc0FsaWFzKHZhbHVlKSA/IHZhbHVlLnJlc29sdmUoY3R4LmRvYykgOiB2YWx1ZTtcbiAgICBpZiAoIWlkZW50aXR5LmlzTWFwKHNvdXJjZSkpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTWVyZ2Ugc291cmNlcyBtdXN0IGJlIG1hcHMgb3IgbWFwIGFsaWFzZXMnKTtcbiAgICBjb25zdCBzcmNNYXAgPSBzb3VyY2UudG9KU09OKG51bGwsIGN0eCwgTWFwKTtcbiAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBzcmNNYXApIHtcbiAgICAgICAgaWYgKG1hcCBpbnN0YW5jZW9mIE1hcCkge1xuICAgICAgICAgICAgaWYgKCFtYXAuaGFzKGtleSkpXG4gICAgICAgICAgICAgICAgbWFwLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChtYXAgaW5zdGFuY2VvZiBTZXQpIHtcbiAgICAgICAgICAgIG1hcC5hZGQoa2V5KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICghT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG1hcCwga2V5KSkge1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG1hcCwga2V5LCB7XG4gICAgICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBtYXA7XG59XG5cbmV4cG9ydHMuYWRkTWVyZ2VUb0pTTWFwID0gYWRkTWVyZ2VUb0pTTWFwO1xuZXhwb3J0cy5pc01lcmdlS2V5ID0gaXNNZXJnZUtleTtcbmV4cG9ydHMubWVyZ2UgPSBtZXJnZTtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbG9nID0gcmVxdWlyZSgnLi4vbG9nLmpzJyk7XG52YXIgbWVyZ2UgPSByZXF1aXJlKCcuLi9zY2hlbWEveWFtbC0xLjEvbWVyZ2UuanMnKTtcbnZhciBzdHJpbmdpZnkgPSByZXF1aXJlKCcuLi9zdHJpbmdpZnkvc3RyaW5naWZ5LmpzJyk7XG52YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuL2lkZW50aXR5LmpzJyk7XG52YXIgdG9KUyA9IHJlcXVpcmUoJy4vdG9KUy5qcycpO1xuXG5mdW5jdGlvbiBhZGRQYWlyVG9KU01hcChjdHgsIG1hcCwgeyBrZXksIHZhbHVlIH0pIHtcbiAgICBpZiAoaWRlbnRpdHkuaXNOb2RlKGtleSkgJiYga2V5LmFkZFRvSlNNYXApXG4gICAgICAgIGtleS5hZGRUb0pTTWFwKGN0eCwgbWFwLCB2YWx1ZSk7XG4gICAgLy8gVE9ETzogU2hvdWxkIGRyb3AgdGhpcyBzcGVjaWFsIGNhc2UgZm9yIGJhcmUgPDwgaGFuZGxpbmdcbiAgICBlbHNlIGlmIChtZXJnZS5pc01lcmdlS2V5KGN0eCwga2V5KSlcbiAgICAgICAgbWVyZ2UuYWRkTWVyZ2VUb0pTTWFwKGN0eCwgbWFwLCB2YWx1ZSk7XG4gICAgZWxzZSB7XG4gICAgICAgIGNvbnN0IGpzS2V5ID0gdG9KUy50b0pTKGtleSwgJycsIGN0eCk7XG4gICAgICAgIGlmIChtYXAgaW5zdGFuY2VvZiBNYXApIHtcbiAgICAgICAgICAgIG1hcC5zZXQoanNLZXksIHRvSlMudG9KUyh2YWx1ZSwganNLZXksIGN0eCkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG1hcCBpbnN0YW5jZW9mIFNldCkge1xuICAgICAgICAgICAgbWFwLmFkZChqc0tleSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBzdHJpbmdLZXkgPSBzdHJpbmdpZnlLZXkoa2V5LCBqc0tleSwgY3R4KTtcbiAgICAgICAgICAgIGNvbnN0IGpzVmFsdWUgPSB0b0pTLnRvSlModmFsdWUsIHN0cmluZ0tleSwgY3R4KTtcbiAgICAgICAgICAgIGlmIChzdHJpbmdLZXkgaW4gbWFwKVxuICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShtYXAsIHN0cmluZ0tleSwge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZToganNWYWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG1hcFtzdHJpbmdLZXldID0ganNWYWx1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWFwO1xufVxuZnVuY3Rpb24gc3RyaW5naWZ5S2V5KGtleSwganNLZXksIGN0eCkge1xuICAgIGlmIChqc0tleSA9PT0gbnVsbClcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tYmFzZS10by1zdHJpbmdcbiAgICBpZiAodHlwZW9mIGpzS2V5ICE9PSAnb2JqZWN0JylcbiAgICAgICAgcmV0dXJuIFN0cmluZyhqc0tleSk7XG4gICAgaWYgKGlkZW50aXR5LmlzTm9kZShrZXkpICYmIGN0eD8uZG9jKSB7XG4gICAgICAgIGNvbnN0IHN0ckN0eCA9IHN0cmluZ2lmeS5jcmVhdGVTdHJpbmdpZnlDb250ZXh0KGN0eC5kb2MsIHt9KTtcbiAgICAgICAgc3RyQ3R4LmFuY2hvcnMgPSBuZXcgU2V0KCk7XG4gICAgICAgIGZvciAoY29uc3Qgbm9kZSBvZiBjdHguYW5jaG9ycy5rZXlzKCkpXG4gICAgICAgICAgICBzdHJDdHguYW5jaG9ycy5hZGQobm9kZS5hbmNob3IpO1xuICAgICAgICBzdHJDdHguaW5GbG93ID0gdHJ1ZTtcbiAgICAgICAgc3RyQ3R4LmluU3RyaW5naWZ5S2V5ID0gdHJ1ZTtcbiAgICAgICAgY29uc3Qgc3RyS2V5ID0ga2V5LnRvU3RyaW5nKHN0ckN0eCk7XG4gICAgICAgIGlmICghY3R4Lm1hcEtleVdhcm5lZCkge1xuICAgICAgICAgICAgbGV0IGpzb25TdHIgPSBKU09OLnN0cmluZ2lmeShzdHJLZXkpO1xuICAgICAgICAgICAgaWYgKGpzb25TdHIubGVuZ3RoID4gNDApXG4gICAgICAgICAgICAgICAganNvblN0ciA9IGpzb25TdHIuc3Vic3RyaW5nKDAsIDM2KSArICcuLi5cIic7XG4gICAgICAgICAgICBsb2cud2FybihjdHguZG9jLm9wdGlvbnMubG9nTGV2ZWwsIGBLZXlzIHdpdGggY29sbGVjdGlvbiB2YWx1ZXMgd2lsbCBiZSBzdHJpbmdpZmllZCBkdWUgdG8gSlMgT2JqZWN0IHJlc3RyaWN0aW9uczogJHtqc29uU3RyfS4gU2V0IG1hcEFzTWFwOiB0cnVlIHRvIHVzZSBvYmplY3Qga2V5cy5gKTtcbiAgICAgICAgICAgIGN0eC5tYXBLZXlXYXJuZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdHJLZXk7XG4gICAgfVxuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShqc0tleSk7XG59XG5cbmV4cG9ydHMuYWRkUGFpclRvSlNNYXAgPSBhZGRQYWlyVG9KU01hcDtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY3JlYXRlTm9kZSA9IHJlcXVpcmUoJy4uL2RvYy9jcmVhdGVOb2RlLmpzJyk7XG52YXIgc3RyaW5naWZ5UGFpciA9IHJlcXVpcmUoJy4uL3N0cmluZ2lmeS9zdHJpbmdpZnlQYWlyLmpzJyk7XG52YXIgYWRkUGFpclRvSlNNYXAgPSByZXF1aXJlKCcuL2FkZFBhaXJUb0pTTWFwLmpzJyk7XG52YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuL2lkZW50aXR5LmpzJyk7XG5cbmZ1bmN0aW9uIGNyZWF0ZVBhaXIoa2V5LCB2YWx1ZSwgY3R4KSB7XG4gICAgY29uc3QgayA9IGNyZWF0ZU5vZGUuY3JlYXRlTm9kZShrZXksIHVuZGVmaW5lZCwgY3R4KTtcbiAgICBjb25zdCB2ID0gY3JlYXRlTm9kZS5jcmVhdGVOb2RlKHZhbHVlLCB1bmRlZmluZWQsIGN0eCk7XG4gICAgcmV0dXJuIG5ldyBQYWlyKGssIHYpO1xufVxuY2xhc3MgUGFpciB7XG4gICAgY29uc3RydWN0b3Ioa2V5LCB2YWx1ZSA9IG51bGwpIHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIGlkZW50aXR5Lk5PREVfVFlQRSwgeyB2YWx1ZTogaWRlbnRpdHkuUEFJUiB9KTtcbiAgICAgICAgdGhpcy5rZXkgPSBrZXk7XG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gICAgY2xvbmUoc2NoZW1hKSB7XG4gICAgICAgIGxldCB7IGtleSwgdmFsdWUgfSA9IHRoaXM7XG4gICAgICAgIGlmIChpZGVudGl0eS5pc05vZGUoa2V5KSlcbiAgICAgICAgICAgIGtleSA9IGtleS5jbG9uZShzY2hlbWEpO1xuICAgICAgICBpZiAoaWRlbnRpdHkuaXNOb2RlKHZhbHVlKSlcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUuY2xvbmUoc2NoZW1hKTtcbiAgICAgICAgcmV0dXJuIG5ldyBQYWlyKGtleSwgdmFsdWUpO1xuICAgIH1cbiAgICB0b0pTT04oXywgY3R4KSB7XG4gICAgICAgIGNvbnN0IHBhaXIgPSBjdHg/Lm1hcEFzTWFwID8gbmV3IE1hcCgpIDoge307XG4gICAgICAgIHJldHVybiBhZGRQYWlyVG9KU01hcC5hZGRQYWlyVG9KU01hcChjdHgsIHBhaXIsIHRoaXMpO1xuICAgIH1cbiAgICB0b1N0cmluZyhjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApIHtcbiAgICAgICAgcmV0dXJuIGN0eD8uZG9jXG4gICAgICAgICAgICA/IHN0cmluZ2lmeVBhaXIuc3RyaW5naWZ5UGFpcih0aGlzLCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApXG4gICAgICAgICAgICA6IEpTT04uc3RyaW5naWZ5KHRoaXMpO1xuICAgIH1cbn1cblxuZXhwb3J0cy5QYWlyID0gUGFpcjtcbmV4cG9ydHMuY3JlYXRlUGFpciA9IGNyZWF0ZVBhaXI7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIGlkZW50aXR5ID0gcmVxdWlyZSgnLi4vbm9kZXMvaWRlbnRpdHkuanMnKTtcbnZhciBzdHJpbmdpZnkgPSByZXF1aXJlKCcuL3N0cmluZ2lmeS5qcycpO1xudmFyIHN0cmluZ2lmeUNvbW1lbnQgPSByZXF1aXJlKCcuL3N0cmluZ2lmeUNvbW1lbnQuanMnKTtcblxuZnVuY3Rpb24gc3RyaW5naWZ5Q29sbGVjdGlvbihjb2xsZWN0aW9uLCBjdHgsIG9wdGlvbnMpIHtcbiAgICBjb25zdCBmbG93ID0gY3R4LmluRmxvdyA/PyBjb2xsZWN0aW9uLmZsb3c7XG4gICAgY29uc3Qgc3RyaW5naWZ5ID0gZmxvdyA/IHN0cmluZ2lmeUZsb3dDb2xsZWN0aW9uIDogc3RyaW5naWZ5QmxvY2tDb2xsZWN0aW9uO1xuICAgIHJldHVybiBzdHJpbmdpZnkoY29sbGVjdGlvbiwgY3R4LCBvcHRpb25zKTtcbn1cbmZ1bmN0aW9uIHN0cmluZ2lmeUJsb2NrQ29sbGVjdGlvbih7IGNvbW1lbnQsIGl0ZW1zIH0sIGN0eCwgeyBibG9ja0l0ZW1QcmVmaXgsIGZsb3dDaGFycywgaXRlbUluZGVudCwgb25DaG9tcEtlZXAsIG9uQ29tbWVudCB9KSB7XG4gICAgY29uc3QgeyBpbmRlbnQsIG9wdGlvbnM6IHsgY29tbWVudFN0cmluZyB9IH0gPSBjdHg7XG4gICAgY29uc3QgaXRlbUN0eCA9IE9iamVjdC5hc3NpZ24oe30sIGN0eCwgeyBpbmRlbnQ6IGl0ZW1JbmRlbnQsIHR5cGU6IG51bGwgfSk7XG4gICAgbGV0IGNob21wS2VlcCA9IGZhbHNlOyAvLyBmbGFnIGZvciB0aGUgcHJlY2VkaW5nIG5vZGUncyBzdGF0dXNcbiAgICBjb25zdCBsaW5lcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgY29uc3QgaXRlbSA9IGl0ZW1zW2ldO1xuICAgICAgICBsZXQgY29tbWVudCA9IG51bGw7XG4gICAgICAgIGlmIChpZGVudGl0eS5pc05vZGUoaXRlbSkpIHtcbiAgICAgICAgICAgIGlmICghY2hvbXBLZWVwICYmIGl0ZW0uc3BhY2VCZWZvcmUpXG4gICAgICAgICAgICAgICAgbGluZXMucHVzaCgnJyk7XG4gICAgICAgICAgICBhZGRDb21tZW50QmVmb3JlKGN0eCwgbGluZXMsIGl0ZW0uY29tbWVudEJlZm9yZSwgY2hvbXBLZWVwKTtcbiAgICAgICAgICAgIGlmIChpdGVtLmNvbW1lbnQpXG4gICAgICAgICAgICAgICAgY29tbWVudCA9IGl0ZW0uY29tbWVudDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpZGVudGl0eS5pc1BhaXIoaXRlbSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGlrID0gaWRlbnRpdHkuaXNOb2RlKGl0ZW0ua2V5KSA/IGl0ZW0ua2V5IDogbnVsbDtcbiAgICAgICAgICAgIGlmIChpaykge1xuICAgICAgICAgICAgICAgIGlmICghY2hvbXBLZWVwICYmIGlrLnNwYWNlQmVmb3JlKVxuICAgICAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKCcnKTtcbiAgICAgICAgICAgICAgICBhZGRDb21tZW50QmVmb3JlKGN0eCwgbGluZXMsIGlrLmNvbW1lbnRCZWZvcmUsIGNob21wS2VlcCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2hvbXBLZWVwID0gZmFsc2U7XG4gICAgICAgIGxldCBzdHIgPSBzdHJpbmdpZnkuc3RyaW5naWZ5KGl0ZW0sIGl0ZW1DdHgsICgpID0+IChjb21tZW50ID0gbnVsbCksICgpID0+IChjaG9tcEtlZXAgPSB0cnVlKSk7XG4gICAgICAgIGlmIChjb21tZW50KVxuICAgICAgICAgICAgc3RyICs9IHN0cmluZ2lmeUNvbW1lbnQubGluZUNvbW1lbnQoc3RyLCBpdGVtSW5kZW50LCBjb21tZW50U3RyaW5nKGNvbW1lbnQpKTtcbiAgICAgICAgaWYgKGNob21wS2VlcCAmJiBjb21tZW50KVxuICAgICAgICAgICAgY2hvbXBLZWVwID0gZmFsc2U7XG4gICAgICAgIGxpbmVzLnB1c2goYmxvY2tJdGVtUHJlZml4ICsgc3RyKTtcbiAgICB9XG4gICAgbGV0IHN0cjtcbiAgICBpZiAobGluZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHN0ciA9IGZsb3dDaGFycy5zdGFydCArIGZsb3dDaGFycy5lbmQ7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBzdHIgPSBsaW5lc1swXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCBsaW5lcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgY29uc3QgbGluZSA9IGxpbmVzW2ldO1xuICAgICAgICAgICAgc3RyICs9IGxpbmUgPyBgXFxuJHtpbmRlbnR9JHtsaW5lfWAgOiAnXFxuJztcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoY29tbWVudCkge1xuICAgICAgICBzdHIgKz0gJ1xcbicgKyBzdHJpbmdpZnlDb21tZW50LmluZGVudENvbW1lbnQoY29tbWVudFN0cmluZyhjb21tZW50KSwgaW5kZW50KTtcbiAgICAgICAgaWYgKG9uQ29tbWVudClcbiAgICAgICAgICAgIG9uQ29tbWVudCgpO1xuICAgIH1cbiAgICBlbHNlIGlmIChjaG9tcEtlZXAgJiYgb25DaG9tcEtlZXApXG4gICAgICAgIG9uQ2hvbXBLZWVwKCk7XG4gICAgcmV0dXJuIHN0cjtcbn1cbmZ1bmN0aW9uIHN0cmluZ2lmeUZsb3dDb2xsZWN0aW9uKHsgaXRlbXMgfSwgY3R4LCB7IGZsb3dDaGFycywgaXRlbUluZGVudCB9KSB7XG4gICAgY29uc3QgeyBpbmRlbnQsIGluZGVudFN0ZXAsIGZsb3dDb2xsZWN0aW9uUGFkZGluZzogZmNQYWRkaW5nLCBvcHRpb25zOiB7IGNvbW1lbnRTdHJpbmcgfSB9ID0gY3R4O1xuICAgIGl0ZW1JbmRlbnQgKz0gaW5kZW50U3RlcDtcbiAgICBjb25zdCBpdGVtQ3R4ID0gT2JqZWN0LmFzc2lnbih7fSwgY3R4LCB7XG4gICAgICAgIGluZGVudDogaXRlbUluZGVudCxcbiAgICAgICAgaW5GbG93OiB0cnVlLFxuICAgICAgICB0eXBlOiBudWxsXG4gICAgfSk7XG4gICAgbGV0IHJlcU5ld2xpbmUgPSBmYWxzZTtcbiAgICBsZXQgbGluZXNBdFZhbHVlID0gMDtcbiAgICBjb25zdCBsaW5lcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgY29uc3QgaXRlbSA9IGl0ZW1zW2ldO1xuICAgICAgICBsZXQgY29tbWVudCA9IG51bGw7XG4gICAgICAgIGlmIChpZGVudGl0eS5pc05vZGUoaXRlbSkpIHtcbiAgICAgICAgICAgIGlmIChpdGVtLnNwYWNlQmVmb3JlKVxuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goJycpO1xuICAgICAgICAgICAgYWRkQ29tbWVudEJlZm9yZShjdHgsIGxpbmVzLCBpdGVtLmNvbW1lbnRCZWZvcmUsIGZhbHNlKTtcbiAgICAgICAgICAgIGlmIChpdGVtLmNvbW1lbnQpXG4gICAgICAgICAgICAgICAgY29tbWVudCA9IGl0ZW0uY29tbWVudDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpZGVudGl0eS5pc1BhaXIoaXRlbSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGlrID0gaWRlbnRpdHkuaXNOb2RlKGl0ZW0ua2V5KSA/IGl0ZW0ua2V5IDogbnVsbDtcbiAgICAgICAgICAgIGlmIChpaykge1xuICAgICAgICAgICAgICAgIGlmIChpay5zcGFjZUJlZm9yZSlcbiAgICAgICAgICAgICAgICAgICAgbGluZXMucHVzaCgnJyk7XG4gICAgICAgICAgICAgICAgYWRkQ29tbWVudEJlZm9yZShjdHgsIGxpbmVzLCBpay5jb21tZW50QmVmb3JlLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgaWYgKGlrLmNvbW1lbnQpXG4gICAgICAgICAgICAgICAgICAgIHJlcU5ld2xpbmUgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgaXYgPSBpZGVudGl0eS5pc05vZGUoaXRlbS52YWx1ZSkgPyBpdGVtLnZhbHVlIDogbnVsbDtcbiAgICAgICAgICAgIGlmIChpdikge1xuICAgICAgICAgICAgICAgIGlmIChpdi5jb21tZW50KVxuICAgICAgICAgICAgICAgICAgICBjb21tZW50ID0gaXYuY29tbWVudDtcbiAgICAgICAgICAgICAgICBpZiAoaXYuY29tbWVudEJlZm9yZSlcbiAgICAgICAgICAgICAgICAgICAgcmVxTmV3bGluZSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpdGVtLnZhbHVlID09IG51bGwgJiYgaWs/LmNvbW1lbnQpIHtcbiAgICAgICAgICAgICAgICBjb21tZW50ID0gaWsuY29tbWVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoY29tbWVudClcbiAgICAgICAgICAgIHJlcU5ld2xpbmUgPSB0cnVlO1xuICAgICAgICBsZXQgc3RyID0gc3RyaW5naWZ5LnN0cmluZ2lmeShpdGVtLCBpdGVtQ3R4LCAoKSA9PiAoY29tbWVudCA9IG51bGwpKTtcbiAgICAgICAgcmVxTmV3bGluZSB8fCAocmVxTmV3bGluZSA9IGxpbmVzLmxlbmd0aCA+IGxpbmVzQXRWYWx1ZSB8fCBzdHIuaW5jbHVkZXMoJ1xcbicpKTtcbiAgICAgICAgaWYgKGkgPCBpdGVtcy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICBzdHIgKz0gJywnO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGN0eC5vcHRpb25zLnRyYWlsaW5nQ29tbWEpIHtcbiAgICAgICAgICAgIGlmIChjdHgub3B0aW9ucy5saW5lV2lkdGggPiAwKSB7XG4gICAgICAgICAgICAgICAgcmVxTmV3bGluZSB8fCAocmVxTmV3bGluZSA9IGxpbmVzLnJlZHVjZSgoc3VtLCBsaW5lKSA9PiBzdW0gKyBsaW5lLmxlbmd0aCArIDIsIDIpICtcbiAgICAgICAgICAgICAgICAgICAgKHN0ci5sZW5ndGggKyAyKSA+XG4gICAgICAgICAgICAgICAgICAgIGN0eC5vcHRpb25zLmxpbmVXaWR0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmVxTmV3bGluZSkge1xuICAgICAgICAgICAgICAgIHN0ciArPSAnLCc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbW1lbnQpXG4gICAgICAgICAgICBzdHIgKz0gc3RyaW5naWZ5Q29tbWVudC5saW5lQ29tbWVudChzdHIsIGl0ZW1JbmRlbnQsIGNvbW1lbnRTdHJpbmcoY29tbWVudCkpO1xuICAgICAgICBsaW5lcy5wdXNoKHN0cik7XG4gICAgICAgIGxpbmVzQXRWYWx1ZSA9IGxpbmVzLmxlbmd0aDtcbiAgICB9XG4gICAgY29uc3QgeyBzdGFydCwgZW5kIH0gPSBmbG93Q2hhcnM7XG4gICAgaWYgKGxpbmVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gc3RhcnQgKyBlbmQ7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpZiAoIXJlcU5ld2xpbmUpIHtcbiAgICAgICAgICAgIGNvbnN0IGxlbiA9IGxpbmVzLnJlZHVjZSgoc3VtLCBsaW5lKSA9PiBzdW0gKyBsaW5lLmxlbmd0aCArIDIsIDIpO1xuICAgICAgICAgICAgcmVxTmV3bGluZSA9IGN0eC5vcHRpb25zLmxpbmVXaWR0aCA+IDAgJiYgbGVuID4gY3R4Lm9wdGlvbnMubGluZVdpZHRoO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyZXFOZXdsaW5lKSB7XG4gICAgICAgICAgICBsZXQgc3RyID0gc3RhcnQ7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpXG4gICAgICAgICAgICAgICAgc3RyICs9IGxpbmUgPyBgXFxuJHtpbmRlbnRTdGVwfSR7aW5kZW50fSR7bGluZX1gIDogJ1xcbic7XG4gICAgICAgICAgICByZXR1cm4gYCR7c3RyfVxcbiR7aW5kZW50fSR7ZW5kfWA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gYCR7c3RhcnR9JHtmY1BhZGRpbmd9JHtsaW5lcy5qb2luKCcgJyl9JHtmY1BhZGRpbmd9JHtlbmR9YDtcbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIGFkZENvbW1lbnRCZWZvcmUoeyBpbmRlbnQsIG9wdGlvbnM6IHsgY29tbWVudFN0cmluZyB9IH0sIGxpbmVzLCBjb21tZW50LCBjaG9tcEtlZXApIHtcbiAgICBpZiAoY29tbWVudCAmJiBjaG9tcEtlZXApXG4gICAgICAgIGNvbW1lbnQgPSBjb21tZW50LnJlcGxhY2UoL15cXG4rLywgJycpO1xuICAgIGlmIChjb21tZW50KSB7XG4gICAgICAgIGNvbnN0IGljID0gc3RyaW5naWZ5Q29tbWVudC5pbmRlbnRDb21tZW50KGNvbW1lbnRTdHJpbmcoY29tbWVudCksIGluZGVudCk7XG4gICAgICAgIGxpbmVzLnB1c2goaWMudHJpbVN0YXJ0KCkpOyAvLyBBdm9pZCBkb3VibGUgaW5kZW50IG9uIGZpcnN0IGxpbmVcbiAgICB9XG59XG5cbmV4cG9ydHMuc3RyaW5naWZ5Q29sbGVjdGlvbiA9IHN0cmluZ2lmeUNvbGxlY3Rpb247XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIHN0cmluZ2lmeUNvbGxlY3Rpb24gPSByZXF1aXJlKCcuLi9zdHJpbmdpZnkvc3RyaW5naWZ5Q29sbGVjdGlvbi5qcycpO1xudmFyIGFkZFBhaXJUb0pTTWFwID0gcmVxdWlyZSgnLi9hZGRQYWlyVG9KU01hcC5qcycpO1xudmFyIENvbGxlY3Rpb24gPSByZXF1aXJlKCcuL0NvbGxlY3Rpb24uanMnKTtcbnZhciBpZGVudGl0eSA9IHJlcXVpcmUoJy4vaWRlbnRpdHkuanMnKTtcbnZhciBQYWlyID0gcmVxdWlyZSgnLi9QYWlyLmpzJyk7XG52YXIgU2NhbGFyID0gcmVxdWlyZSgnLi9TY2FsYXIuanMnKTtcblxuZnVuY3Rpb24gZmluZFBhaXIoaXRlbXMsIGtleSkge1xuICAgIGNvbnN0IGsgPSBpZGVudGl0eS5pc1NjYWxhcihrZXkpID8ga2V5LnZhbHVlIDoga2V5O1xuICAgIGZvciAoY29uc3QgaXQgb2YgaXRlbXMpIHtcbiAgICAgICAgaWYgKGlkZW50aXR5LmlzUGFpcihpdCkpIHtcbiAgICAgICAgICAgIGlmIChpdC5rZXkgPT09IGtleSB8fCBpdC5rZXkgPT09IGspXG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0O1xuICAgICAgICAgICAgaWYgKGlkZW50aXR5LmlzU2NhbGFyKGl0LmtleSkgJiYgaXQua2V5LnZhbHVlID09PSBrKVxuICAgICAgICAgICAgICAgIHJldHVybiBpdDtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufVxuY2xhc3MgWUFNTE1hcCBleHRlbmRzIENvbGxlY3Rpb24uQ29sbGVjdGlvbiB7XG4gICAgc3RhdGljIGdldCB0YWdOYW1lKCkge1xuICAgICAgICByZXR1cm4gJ3RhZzp5YW1sLm9yZywyMDAyOm1hcCc7XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKHNjaGVtYSkge1xuICAgICAgICBzdXBlcihpZGVudGl0eS5NQVAsIHNjaGVtYSk7XG4gICAgICAgIHRoaXMuaXRlbXMgPSBbXTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQSBnZW5lcmljIGNvbGxlY3Rpb24gcGFyc2luZyBtZXRob2QgdGhhdCBjYW4gYmUgZXh0ZW5kZWRcbiAgICAgKiB0byBvdGhlciBub2RlIGNsYXNzZXMgdGhhdCBpbmhlcml0IGZyb20gWUFNTE1hcFxuICAgICAqL1xuICAgIHN0YXRpYyBmcm9tKHNjaGVtYSwgb2JqLCBjdHgpIHtcbiAgICAgICAgY29uc3QgeyBrZWVwVW5kZWZpbmVkLCByZXBsYWNlciB9ID0gY3R4O1xuICAgICAgICBjb25zdCBtYXAgPSBuZXcgdGhpcyhzY2hlbWEpO1xuICAgICAgICBjb25zdCBhZGQgPSAoa2V5LCB2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiByZXBsYWNlciA9PT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHJlcGxhY2VyLmNhbGwob2JqLCBrZXksIHZhbHVlKTtcbiAgICAgICAgICAgIGVsc2UgaWYgKEFycmF5LmlzQXJyYXkocmVwbGFjZXIpICYmICFyZXBsYWNlci5pbmNsdWRlcyhrZXkpKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkIHx8IGtlZXBVbmRlZmluZWQpXG4gICAgICAgICAgICAgICAgbWFwLml0ZW1zLnB1c2goUGFpci5jcmVhdGVQYWlyKGtleSwgdmFsdWUsIGN0eCkpO1xuICAgICAgICB9O1xuICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgTWFwKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBvYmopXG4gICAgICAgICAgICAgICAgYWRkKGtleSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG9iaiAmJiB0eXBlb2Ygb2JqID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMob2JqKSlcbiAgICAgICAgICAgICAgICBhZGQoa2V5LCBvYmpba2V5XSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBzY2hlbWEuc29ydE1hcEVudHJpZXMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIG1hcC5pdGVtcy5zb3J0KHNjaGVtYS5zb3J0TWFwRW50cmllcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1hcDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQWRkcyBhIHZhbHVlIHRvIHRoZSBjb2xsZWN0aW9uLlxuICAgICAqXG4gICAgICogQHBhcmFtIG92ZXJ3cml0ZSAtIElmIG5vdCBzZXQgYHRydWVgLCB1c2luZyBhIGtleSB0aGF0IGlzIGFscmVhZHkgaW4gdGhlXG4gICAgICogICBjb2xsZWN0aW9uIHdpbGwgdGhyb3cuIE90aGVyd2lzZSwgb3ZlcndyaXRlcyB0aGUgcHJldmlvdXMgdmFsdWUuXG4gICAgICovXG4gICAgYWRkKHBhaXIsIG92ZXJ3cml0ZSkge1xuICAgICAgICBsZXQgX3BhaXI7XG4gICAgICAgIGlmIChpZGVudGl0eS5pc1BhaXIocGFpcikpXG4gICAgICAgICAgICBfcGFpciA9IHBhaXI7XG4gICAgICAgIGVsc2UgaWYgKCFwYWlyIHx8IHR5cGVvZiBwYWlyICE9PSAnb2JqZWN0JyB8fCAhKCdrZXknIGluIHBhaXIpKSB7XG4gICAgICAgICAgICAvLyBJbiBUeXBlU2NyaXB0LCB0aGlzIG5ldmVyIGhhcHBlbnMuXG4gICAgICAgICAgICBfcGFpciA9IG5ldyBQYWlyLlBhaXIocGFpciwgcGFpcj8udmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIF9wYWlyID0gbmV3IFBhaXIuUGFpcihwYWlyLmtleSwgcGFpci52YWx1ZSk7XG4gICAgICAgIGNvbnN0IHByZXYgPSBmaW5kUGFpcih0aGlzLml0ZW1zLCBfcGFpci5rZXkpO1xuICAgICAgICBjb25zdCBzb3J0RW50cmllcyA9IHRoaXMuc2NoZW1hPy5zb3J0TWFwRW50cmllcztcbiAgICAgICAgaWYgKHByZXYpIHtcbiAgICAgICAgICAgIGlmICghb3ZlcndyaXRlKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgS2V5ICR7X3BhaXIua2V5fSBhbHJlYWR5IHNldGApO1xuICAgICAgICAgICAgLy8gRm9yIHNjYWxhcnMsIGtlZXAgdGhlIG9sZCBub2RlICYgaXRzIGNvbW1lbnRzIGFuZCBhbmNob3JzXG4gICAgICAgICAgICBpZiAoaWRlbnRpdHkuaXNTY2FsYXIocHJldi52YWx1ZSkgJiYgU2NhbGFyLmlzU2NhbGFyVmFsdWUoX3BhaXIudmFsdWUpKVxuICAgICAgICAgICAgICAgIHByZXYudmFsdWUudmFsdWUgPSBfcGFpci52YWx1ZTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBwcmV2LnZhbHVlID0gX3BhaXIudmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoc29ydEVudHJpZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGkgPSB0aGlzLml0ZW1zLmZpbmRJbmRleChpdGVtID0+IHNvcnRFbnRyaWVzKF9wYWlyLCBpdGVtKSA8IDApO1xuICAgICAgICAgICAgaWYgKGkgPT09IC0xKVxuICAgICAgICAgICAgICAgIHRoaXMuaXRlbXMucHVzaChfcGFpcik7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhpcy5pdGVtcy5zcGxpY2UoaSwgMCwgX3BhaXIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5pdGVtcy5wdXNoKF9wYWlyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBkZWxldGUoa2V5KSB7XG4gICAgICAgIGNvbnN0IGl0ID0gZmluZFBhaXIodGhpcy5pdGVtcywga2V5KTtcbiAgICAgICAgaWYgKCFpdClcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgY29uc3QgZGVsID0gdGhpcy5pdGVtcy5zcGxpY2UodGhpcy5pdGVtcy5pbmRleE9mKGl0KSwgMSk7XG4gICAgICAgIHJldHVybiBkZWwubGVuZ3RoID4gMDtcbiAgICB9XG4gICAgZ2V0KGtleSwga2VlcFNjYWxhcikge1xuICAgICAgICBjb25zdCBpdCA9IGZpbmRQYWlyKHRoaXMuaXRlbXMsIGtleSk7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBpdD8udmFsdWU7XG4gICAgICAgIHJldHVybiAoIWtlZXBTY2FsYXIgJiYgaWRlbnRpdHkuaXNTY2FsYXIobm9kZSkgPyBub2RlLnZhbHVlIDogbm9kZSkgPz8gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBoYXMoa2V5KSB7XG4gICAgICAgIHJldHVybiAhIWZpbmRQYWlyKHRoaXMuaXRlbXMsIGtleSk7XG4gICAgfVxuICAgIHNldChrZXksIHZhbHVlKSB7XG4gICAgICAgIHRoaXMuYWRkKG5ldyBQYWlyLlBhaXIoa2V5LCB2YWx1ZSksIHRydWUpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBAcGFyYW0gY3R4IC0gQ29udmVyc2lvbiBjb250ZXh0LCBvcmlnaW5hbGx5IHNldCBpbiBEb2N1bWVudCN0b0pTKClcbiAgICAgKiBAcGFyYW0ge0NsYXNzfSBUeXBlIC0gSWYgc2V0LCBmb3JjZXMgdGhlIHJldHVybmVkIGNvbGxlY3Rpb24gdHlwZVxuICAgICAqIEByZXR1cm5zIEluc3RhbmNlIG9mIFR5cGUsIE1hcCwgb3IgT2JqZWN0XG4gICAgICovXG4gICAgdG9KU09OKF8sIGN0eCwgVHlwZSkge1xuICAgICAgICBjb25zdCBtYXAgPSBUeXBlID8gbmV3IFR5cGUoKSA6IGN0eD8ubWFwQXNNYXAgPyBuZXcgTWFwKCkgOiB7fTtcbiAgICAgICAgaWYgKGN0eD8ub25DcmVhdGUpXG4gICAgICAgICAgICBjdHgub25DcmVhdGUobWFwKTtcbiAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIHRoaXMuaXRlbXMpXG4gICAgICAgICAgICBhZGRQYWlyVG9KU01hcC5hZGRQYWlyVG9KU01hcChjdHgsIG1hcCwgaXRlbSk7XG4gICAgICAgIHJldHVybiBtYXA7XG4gICAgfVxuICAgIHRvU3RyaW5nKGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCkge1xuICAgICAgICBpZiAoIWN0eClcbiAgICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzKTtcbiAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIHRoaXMuaXRlbXMpIHtcbiAgICAgICAgICAgIGlmICghaWRlbnRpdHkuaXNQYWlyKGl0ZW0pKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTWFwIGl0ZW1zIG11c3QgYWxsIGJlIHBhaXJzOyBmb3VuZCAke0pTT04uc3RyaW5naWZ5KGl0ZW0pfSBpbnN0ZWFkYCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFjdHguYWxsTnVsbFZhbHVlcyAmJiB0aGlzLmhhc0FsbE51bGxWYWx1ZXMoZmFsc2UpKVxuICAgICAgICAgICAgY3R4ID0gT2JqZWN0LmFzc2lnbih7fSwgY3R4LCB7IGFsbE51bGxWYWx1ZXM6IHRydWUgfSk7XG4gICAgICAgIHJldHVybiBzdHJpbmdpZnlDb2xsZWN0aW9uLnN0cmluZ2lmeUNvbGxlY3Rpb24odGhpcywgY3R4LCB7XG4gICAgICAgICAgICBibG9ja0l0ZW1QcmVmaXg6ICcnLFxuICAgICAgICAgICAgZmxvd0NoYXJzOiB7IHN0YXJ0OiAneycsIGVuZDogJ30nIH0sXG4gICAgICAgICAgICBpdGVtSW5kZW50OiBjdHguaW5kZW50IHx8ICcnLFxuICAgICAgICAgICAgb25DaG9tcEtlZXAsXG4gICAgICAgICAgICBvbkNvbW1lbnRcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5leHBvcnRzLllBTUxNYXAgPSBZQU1MTWFwO1xuZXhwb3J0cy5maW5kUGFpciA9IGZpbmRQYWlyO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBpZGVudGl0eSA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL2lkZW50aXR5LmpzJyk7XG52YXIgWUFNTE1hcCA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL1lBTUxNYXAuanMnKTtcblxuY29uc3QgbWFwID0ge1xuICAgIGNvbGxlY3Rpb246ICdtYXAnLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgbm9kZUNsYXNzOiBZQU1MTWFwLllBTUxNYXAsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6bWFwJyxcbiAgICByZXNvbHZlKG1hcCwgb25FcnJvcikge1xuICAgICAgICBpZiAoIWlkZW50aXR5LmlzTWFwKG1hcCkpXG4gICAgICAgICAgICBvbkVycm9yKCdFeHBlY3RlZCBhIG1hcHBpbmcgZm9yIHRoaXMgdGFnJyk7XG4gICAgICAgIHJldHVybiBtYXA7XG4gICAgfSxcbiAgICBjcmVhdGVOb2RlOiAoc2NoZW1hLCBvYmosIGN0eCkgPT4gWUFNTE1hcC5ZQU1MTWFwLmZyb20oc2NoZW1hLCBvYmosIGN0eClcbn07XG5cbmV4cG9ydHMubWFwID0gbWFwO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBjcmVhdGVOb2RlID0gcmVxdWlyZSgnLi4vZG9jL2NyZWF0ZU5vZGUuanMnKTtcbnZhciBzdHJpbmdpZnlDb2xsZWN0aW9uID0gcmVxdWlyZSgnLi4vc3RyaW5naWZ5L3N0cmluZ2lmeUNvbGxlY3Rpb24uanMnKTtcbnZhciBDb2xsZWN0aW9uID0gcmVxdWlyZSgnLi9Db2xsZWN0aW9uLmpzJyk7XG52YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuL2lkZW50aXR5LmpzJyk7XG52YXIgU2NhbGFyID0gcmVxdWlyZSgnLi9TY2FsYXIuanMnKTtcbnZhciB0b0pTID0gcmVxdWlyZSgnLi90b0pTLmpzJyk7XG5cbmNsYXNzIFlBTUxTZXEgZXh0ZW5kcyBDb2xsZWN0aW9uLkNvbGxlY3Rpb24ge1xuICAgIHN0YXRpYyBnZXQgdGFnTmFtZSgpIHtcbiAgICAgICAgcmV0dXJuICd0YWc6eWFtbC5vcmcsMjAwMjpzZXEnO1xuICAgIH1cbiAgICBjb25zdHJ1Y3RvcihzY2hlbWEpIHtcbiAgICAgICAgc3VwZXIoaWRlbnRpdHkuU0VRLCBzY2hlbWEpO1xuICAgICAgICB0aGlzLml0ZW1zID0gW107XG4gICAgfVxuICAgIGFkZCh2YWx1ZSkge1xuICAgICAgICB0aGlzLml0ZW1zLnB1c2godmFsdWUpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGEgdmFsdWUgZnJvbSB0aGUgY29sbGVjdGlvbi5cbiAgICAgKlxuICAgICAqIGBrZXlgIG11c3QgY29udGFpbiBhIHJlcHJlc2VudGF0aW9uIG9mIGFuIGludGVnZXIgZm9yIHRoaXMgdG8gc3VjY2VlZC5cbiAgICAgKiBJdCBtYXkgYmUgd3JhcHBlZCBpbiBhIGBTY2FsYXJgLlxuICAgICAqXG4gICAgICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBpdGVtIHdhcyBmb3VuZCBhbmQgcmVtb3ZlZC5cbiAgICAgKi9cbiAgICBkZWxldGUoa2V5KSB7XG4gICAgICAgIGNvbnN0IGlkeCA9IGFzSXRlbUluZGV4KGtleSk7XG4gICAgICAgIGlmICh0eXBlb2YgaWR4ICE9PSAnbnVtYmVyJylcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgY29uc3QgZGVsID0gdGhpcy5pdGVtcy5zcGxpY2UoaWR4LCAxKTtcbiAgICAgICAgcmV0dXJuIGRlbC5sZW5ndGggPiAwO1xuICAgIH1cbiAgICBnZXQoa2V5LCBrZWVwU2NhbGFyKSB7XG4gICAgICAgIGNvbnN0IGlkeCA9IGFzSXRlbUluZGV4KGtleSk7XG4gICAgICAgIGlmICh0eXBlb2YgaWR4ICE9PSAnbnVtYmVyJylcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIGNvbnN0IGl0ID0gdGhpcy5pdGVtc1tpZHhdO1xuICAgICAgICByZXR1cm4gIWtlZXBTY2FsYXIgJiYgaWRlbnRpdHkuaXNTY2FsYXIoaXQpID8gaXQudmFsdWUgOiBpdDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIHRoZSBjb2xsZWN0aW9uIGluY2x1ZGVzIGEgdmFsdWUgd2l0aCB0aGUga2V5IGBrZXlgLlxuICAgICAqXG4gICAgICogYGtleWAgbXVzdCBjb250YWluIGEgcmVwcmVzZW50YXRpb24gb2YgYW4gaW50ZWdlciBmb3IgdGhpcyB0byBzdWNjZWVkLlxuICAgICAqIEl0IG1heSBiZSB3cmFwcGVkIGluIGEgYFNjYWxhcmAuXG4gICAgICovXG4gICAgaGFzKGtleSkge1xuICAgICAgICBjb25zdCBpZHggPSBhc0l0ZW1JbmRleChrZXkpO1xuICAgICAgICByZXR1cm4gdHlwZW9mIGlkeCA9PT0gJ251bWJlcicgJiYgaWR4IDwgdGhpcy5pdGVtcy5sZW5ndGg7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldHMgYSB2YWx1ZSBpbiB0aGlzIGNvbGxlY3Rpb24uIEZvciBgISFzZXRgLCBgdmFsdWVgIG5lZWRzIHRvIGJlIGFcbiAgICAgKiBib29sZWFuIHRvIGFkZC9yZW1vdmUgdGhlIGl0ZW0gZnJvbSB0aGUgc2V0LlxuICAgICAqXG4gICAgICogSWYgYGtleWAgZG9lcyBub3QgY29udGFpbiBhIHJlcHJlc2VudGF0aW9uIG9mIGFuIGludGVnZXIsIHRoaXMgd2lsbCB0aHJvdy5cbiAgICAgKiBJdCBtYXkgYmUgd3JhcHBlZCBpbiBhIGBTY2FsYXJgLlxuICAgICAqL1xuICAgIHNldChrZXksIHZhbHVlKSB7XG4gICAgICAgIGNvbnN0IGlkeCA9IGFzSXRlbUluZGV4KGtleSk7XG4gICAgICAgIGlmICh0eXBlb2YgaWR4ICE9PSAnbnVtYmVyJylcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgYSB2YWxpZCBpbmRleCwgbm90ICR7a2V5fS5gKTtcbiAgICAgICAgY29uc3QgcHJldiA9IHRoaXMuaXRlbXNbaWR4XTtcbiAgICAgICAgaWYgKGlkZW50aXR5LmlzU2NhbGFyKHByZXYpICYmIFNjYWxhci5pc1NjYWxhclZhbHVlKHZhbHVlKSlcbiAgICAgICAgICAgIHByZXYudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5pdGVtc1tpZHhdID0gdmFsdWU7XG4gICAgfVxuICAgIHRvSlNPTihfLCBjdHgpIHtcbiAgICAgICAgY29uc3Qgc2VxID0gW107XG4gICAgICAgIGlmIChjdHg/Lm9uQ3JlYXRlKVxuICAgICAgICAgICAgY3R4Lm9uQ3JlYXRlKHNlcSk7XG4gICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIHRoaXMuaXRlbXMpXG4gICAgICAgICAgICBzZXEucHVzaCh0b0pTLnRvSlMoaXRlbSwgU3RyaW5nKGkrKyksIGN0eCkpO1xuICAgICAgICByZXR1cm4gc2VxO1xuICAgIH1cbiAgICB0b1N0cmluZyhjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApIHtcbiAgICAgICAgaWYgKCFjdHgpXG4gICAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcyk7XG4gICAgICAgIHJldHVybiBzdHJpbmdpZnlDb2xsZWN0aW9uLnN0cmluZ2lmeUNvbGxlY3Rpb24odGhpcywgY3R4LCB7XG4gICAgICAgICAgICBibG9ja0l0ZW1QcmVmaXg6ICctICcsXG4gICAgICAgICAgICBmbG93Q2hhcnM6IHsgc3RhcnQ6ICdbJywgZW5kOiAnXScgfSxcbiAgICAgICAgICAgIGl0ZW1JbmRlbnQ6IChjdHguaW5kZW50IHx8ICcnKSArICcgICcsXG4gICAgICAgICAgICBvbkNob21wS2VlcCxcbiAgICAgICAgICAgIG9uQ29tbWVudFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgc3RhdGljIGZyb20oc2NoZW1hLCBvYmosIGN0eCkge1xuICAgICAgICBjb25zdCB7IHJlcGxhY2VyIH0gPSBjdHg7XG4gICAgICAgIGNvbnN0IHNlcSA9IG5ldyB0aGlzKHNjaGVtYSk7XG4gICAgICAgIGlmIChvYmogJiYgU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdChvYmopKSB7XG4gICAgICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgICAgICBmb3IgKGxldCBpdCBvZiBvYmopIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHJlcGxhY2VyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGtleSA9IG9iaiBpbnN0YW5jZW9mIFNldCA/IGl0IDogU3RyaW5nKGkrKyk7XG4gICAgICAgICAgICAgICAgICAgIGl0ID0gcmVwbGFjZXIuY2FsbChvYmosIGtleSwgaXQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzZXEuaXRlbXMucHVzaChjcmVhdGVOb2RlLmNyZWF0ZU5vZGUoaXQsIHVuZGVmaW5lZCwgY3R4KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNlcTtcbiAgICB9XG59XG5mdW5jdGlvbiBhc0l0ZW1JbmRleChrZXkpIHtcbiAgICBsZXQgaWR4ID0gaWRlbnRpdHkuaXNTY2FsYXIoa2V5KSA/IGtleS52YWx1ZSA6IGtleTtcbiAgICBpZiAoaWR4ICYmIHR5cGVvZiBpZHggPT09ICdzdHJpbmcnKVxuICAgICAgICBpZHggPSBOdW1iZXIoaWR4KTtcbiAgICByZXR1cm4gdHlwZW9mIGlkeCA9PT0gJ251bWJlcicgJiYgTnVtYmVyLmlzSW50ZWdlcihpZHgpICYmIGlkeCA+PSAwXG4gICAgICAgID8gaWR4XG4gICAgICAgIDogbnVsbDtcbn1cblxuZXhwb3J0cy5ZQU1MU2VxID0gWUFNTFNlcTtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9pZGVudGl0eS5qcycpO1xudmFyIFlBTUxTZXEgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9ZQU1MU2VxLmpzJyk7XG5cbmNvbnN0IHNlcSA9IHtcbiAgICBjb2xsZWN0aW9uOiAnc2VxJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIG5vZGVDbGFzczogWUFNTFNlcS5ZQU1MU2VxLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOnNlcScsXG4gICAgcmVzb2x2ZShzZXEsIG9uRXJyb3IpIHtcbiAgICAgICAgaWYgKCFpZGVudGl0eS5pc1NlcShzZXEpKVxuICAgICAgICAgICAgb25FcnJvcignRXhwZWN0ZWQgYSBzZXF1ZW5jZSBmb3IgdGhpcyB0YWcnKTtcbiAgICAgICAgcmV0dXJuIHNlcTtcbiAgICB9LFxuICAgIGNyZWF0ZU5vZGU6IChzY2hlbWEsIG9iaiwgY3R4KSA9PiBZQU1MU2VxLllBTUxTZXEuZnJvbShzY2hlbWEsIG9iaiwgY3R4KVxufTtcblxuZXhwb3J0cy5zZXEgPSBzZXE7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIHN0cmluZ2lmeVN0cmluZyA9IHJlcXVpcmUoJy4uLy4uL3N0cmluZ2lmeS9zdHJpbmdpZnlTdHJpbmcuanMnKTtcblxuY29uc3Qgc3RyaW5nID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6c3RyJyxcbiAgICByZXNvbHZlOiBzdHIgPT4gc3RyLFxuICAgIHN0cmluZ2lmeShpdGVtLCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApIHtcbiAgICAgICAgY3R4ID0gT2JqZWN0LmFzc2lnbih7IGFjdHVhbFN0cmluZzogdHJ1ZSB9LCBjdHgpO1xuICAgICAgICByZXR1cm4gc3RyaW5naWZ5U3RyaW5nLnN0cmluZ2lmeVN0cmluZyhpdGVtLCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApO1xuICAgIH1cbn07XG5cbmV4cG9ydHMuc3RyaW5nID0gc3RyaW5nO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBTY2FsYXIgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9TY2FsYXIuanMnKTtcblxuY29uc3QgbnVsbFRhZyA9IHtcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gdmFsdWUgPT0gbnVsbCxcbiAgICBjcmVhdGVOb2RlOiAoKSA9PiBuZXcgU2NhbGFyLlNjYWxhcihudWxsKSxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOm51bGwnLFxuICAgIHRlc3Q6IC9eKD86fnxbTm5ddWxsfE5VTEwpPyQvLFxuICAgIHJlc29sdmU6ICgpID0+IG5ldyBTY2FsYXIuU2NhbGFyKG51bGwpLFxuICAgIHN0cmluZ2lmeTogKHsgc291cmNlIH0sIGN0eCkgPT4gdHlwZW9mIHNvdXJjZSA9PT0gJ3N0cmluZycgJiYgbnVsbFRhZy50ZXN0LnRlc3Qoc291cmNlKVxuICAgICAgICA/IHNvdXJjZVxuICAgICAgICA6IGN0eC5vcHRpb25zLm51bGxTdHJcbn07XG5cbmV4cG9ydHMubnVsbFRhZyA9IG51bGxUYWc7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIFNjYWxhciA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL1NjYWxhci5qcycpO1xuXG5jb25zdCBib29sVGFnID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmJvb2wnLFxuICAgIHRlc3Q6IC9eKD86W1R0XXJ1ZXxUUlVFfFtGZl1hbHNlfEZBTFNFKSQvLFxuICAgIHJlc29sdmU6IHN0ciA9PiBuZXcgU2NhbGFyLlNjYWxhcihzdHJbMF0gPT09ICd0JyB8fCBzdHJbMF0gPT09ICdUJyksXG4gICAgc3RyaW5naWZ5KHsgc291cmNlLCB2YWx1ZSB9LCBjdHgpIHtcbiAgICAgICAgaWYgKHNvdXJjZSAmJiBib29sVGFnLnRlc3QudGVzdChzb3VyY2UpKSB7XG4gICAgICAgICAgICBjb25zdCBzdiA9IHNvdXJjZVswXSA9PT0gJ3QnIHx8IHNvdXJjZVswXSA9PT0gJ1QnO1xuICAgICAgICAgICAgaWYgKHZhbHVlID09PSBzdilcbiAgICAgICAgICAgICAgICByZXR1cm4gc291cmNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWx1ZSA/IGN0eC5vcHRpb25zLnRydWVTdHIgOiBjdHgub3B0aW9ucy5mYWxzZVN0cjtcbiAgICB9XG59O1xuXG5leHBvcnRzLmJvb2xUYWcgPSBib29sVGFnO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIHN0cmluZ2lmeU51bWJlcih7IGZvcm1hdCwgbWluRnJhY3Rpb25EaWdpdHMsIHRhZywgdmFsdWUgfSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdiaWdpbnQnKVxuICAgICAgICByZXR1cm4gU3RyaW5nKHZhbHVlKTtcbiAgICBjb25zdCBudW0gPSB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInID8gdmFsdWUgOiBOdW1iZXIodmFsdWUpO1xuICAgIGlmICghaXNGaW5pdGUobnVtKSlcbiAgICAgICAgcmV0dXJuIGlzTmFOKG51bSkgPyAnLm5hbicgOiBudW0gPCAwID8gJy0uaW5mJyA6ICcuaW5mJztcbiAgICBsZXQgbiA9IE9iamVjdC5pcyh2YWx1ZSwgLTApID8gJy0wJyA6IEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcbiAgICBpZiAoIWZvcm1hdCAmJlxuICAgICAgICBtaW5GcmFjdGlvbkRpZ2l0cyAmJlxuICAgICAgICAoIXRhZyB8fCB0YWcgPT09ICd0YWc6eWFtbC5vcmcsMjAwMjpmbG9hdCcpICYmXG4gICAgICAgIC9eXFxkLy50ZXN0KG4pKSB7XG4gICAgICAgIGxldCBpID0gbi5pbmRleE9mKCcuJyk7XG4gICAgICAgIGlmIChpIDwgMCkge1xuICAgICAgICAgICAgaSA9IG4ubGVuZ3RoO1xuICAgICAgICAgICAgbiArPSAnLic7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGQgPSBtaW5GcmFjdGlvbkRpZ2l0cyAtIChuLmxlbmd0aCAtIGkgLSAxKTtcbiAgICAgICAgd2hpbGUgKGQtLSA+IDApXG4gICAgICAgICAgICBuICs9ICcwJztcbiAgICB9XG4gICAgcmV0dXJuIG47XG59XG5cbmV4cG9ydHMuc3RyaW5naWZ5TnVtYmVyID0gc3RyaW5naWZ5TnVtYmVyO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBTY2FsYXIgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9TY2FsYXIuanMnKTtcbnZhciBzdHJpbmdpZnlOdW1iZXIgPSByZXF1aXJlKCcuLi8uLi9zdHJpbmdpZnkvc3RyaW5naWZ5TnVtYmVyLmpzJyk7XG5cbmNvbnN0IGZsb2F0TmFOID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6ZmxvYXQnLFxuICAgIHRlc3Q6IC9eKD86Wy0rXT9cXC4oPzppbmZ8SW5mfElORil8XFwubmFufFxcLk5hTnxcXC5OQU4pJC8sXG4gICAgcmVzb2x2ZTogc3RyID0+IHN0ci5zbGljZSgtMykudG9Mb3dlckNhc2UoKSA9PT0gJ25hbidcbiAgICAgICAgPyBOYU5cbiAgICAgICAgOiBzdHJbMF0gPT09ICctJ1xuICAgICAgICAgICAgPyBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFlcbiAgICAgICAgICAgIDogTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZLFxuICAgIHN0cmluZ2lmeTogc3RyaW5naWZ5TnVtYmVyLnN0cmluZ2lmeU51bWJlclxufTtcbmNvbnN0IGZsb2F0RXhwID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6ZmxvYXQnLFxuICAgIGZvcm1hdDogJ0VYUCcsXG4gICAgdGVzdDogL15bLStdPyg/OlxcLlswLTldK3xbMC05XSsoPzpcXC5bMC05XSopPylbZUVdWy0rXT9bMC05XSskLyxcbiAgICByZXNvbHZlOiBzdHIgPT4gcGFyc2VGbG9hdChzdHIpLFxuICAgIHN0cmluZ2lmeShub2RlKSB7XG4gICAgICAgIGNvbnN0IG51bSA9IE51bWJlcihub2RlLnZhbHVlKTtcbiAgICAgICAgcmV0dXJuIGlzRmluaXRlKG51bSkgPyBudW0udG9FeHBvbmVudGlhbCgpIDogc3RyaW5naWZ5TnVtYmVyLnN0cmluZ2lmeU51bWJlcihub2RlKTtcbiAgICB9XG59O1xuY29uc3QgZmxvYXQgPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpmbG9hdCcsXG4gICAgdGVzdDogL15bLStdPyg/OlxcLlswLTldK3xbMC05XStcXC5bMC05XSopJC8sXG4gICAgcmVzb2x2ZShzdHIpIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IG5ldyBTY2FsYXIuU2NhbGFyKHBhcnNlRmxvYXQoc3RyKSk7XG4gICAgICAgIGNvbnN0IGRvdCA9IHN0ci5pbmRleE9mKCcuJyk7XG4gICAgICAgIGlmIChkb3QgIT09IC0xICYmIHN0cltzdHIubGVuZ3RoIC0gMV0gPT09ICcwJylcbiAgICAgICAgICAgIG5vZGUubWluRnJhY3Rpb25EaWdpdHMgPSBzdHIubGVuZ3RoIC0gZG90IC0gMTtcbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfSxcbiAgICBzdHJpbmdpZnk6IHN0cmluZ2lmeU51bWJlci5zdHJpbmdpZnlOdW1iZXJcbn07XG5cbmV4cG9ydHMuZmxvYXQgPSBmbG9hdDtcbmV4cG9ydHMuZmxvYXRFeHAgPSBmbG9hdEV4cDtcbmV4cG9ydHMuZmxvYXROYU4gPSBmbG9hdE5hTjtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgc3RyaW5naWZ5TnVtYmVyID0gcmVxdWlyZSgnLi4vLi4vc3RyaW5naWZ5L3N0cmluZ2lmeU51bWJlci5qcycpO1xuXG5jb25zdCBpbnRJZGVudGlmeSA9ICh2YWx1ZSkgPT4gdHlwZW9mIHZhbHVlID09PSAnYmlnaW50JyB8fCBOdW1iZXIuaXNJbnRlZ2VyKHZhbHVlKTtcbmNvbnN0IGludFJlc29sdmUgPSAoc3RyLCBvZmZzZXQsIHJhZGl4LCB7IGludEFzQmlnSW50IH0pID0+IChpbnRBc0JpZ0ludCA/IEJpZ0ludChzdHIpIDogcGFyc2VJbnQoc3RyLnN1YnN0cmluZyhvZmZzZXQpLCByYWRpeCkpO1xuZnVuY3Rpb24gaW50U3RyaW5naWZ5KG5vZGUsIHJhZGl4LCBwcmVmaXgpIHtcbiAgICBjb25zdCB7IHZhbHVlIH0gPSBub2RlO1xuICAgIGlmIChpbnRJZGVudGlmeSh2YWx1ZSkgJiYgdmFsdWUgPj0gMClcbiAgICAgICAgcmV0dXJuIHByZWZpeCArIHZhbHVlLnRvU3RyaW5nKHJhZGl4KTtcbiAgICByZXR1cm4gc3RyaW5naWZ5TnVtYmVyLnN0cmluZ2lmeU51bWJlcihub2RlKTtcbn1cbmNvbnN0IGludE9jdCA9IHtcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gaW50SWRlbnRpZnkodmFsdWUpICYmIHZhbHVlID49IDAsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjppbnQnLFxuICAgIGZvcm1hdDogJ09DVCcsXG4gICAgdGVzdDogL14wb1swLTddKyQvLFxuICAgIHJlc29sdmU6IChzdHIsIF9vbkVycm9yLCBvcHQpID0+IGludFJlc29sdmUoc3RyLCAyLCA4LCBvcHQpLFxuICAgIHN0cmluZ2lmeTogbm9kZSA9PiBpbnRTdHJpbmdpZnkobm9kZSwgOCwgJzBvJylcbn07XG5jb25zdCBpbnQgPSB7XG4gICAgaWRlbnRpZnk6IGludElkZW50aWZ5LFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6aW50JyxcbiAgICB0ZXN0OiAvXlstK10/WzAtOV0rJC8sXG4gICAgcmVzb2x2ZTogKHN0ciwgX29uRXJyb3IsIG9wdCkgPT4gaW50UmVzb2x2ZShzdHIsIDAsIDEwLCBvcHQpLFxuICAgIHN0cmluZ2lmeTogc3RyaW5naWZ5TnVtYmVyLnN0cmluZ2lmeU51bWJlclxufTtcbmNvbnN0IGludEhleCA9IHtcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gaW50SWRlbnRpZnkodmFsdWUpICYmIHZhbHVlID49IDAsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjppbnQnLFxuICAgIGZvcm1hdDogJ0hFWCcsXG4gICAgdGVzdDogL14weFswLTlhLWZBLUZdKyQvLFxuICAgIHJlc29sdmU6IChzdHIsIF9vbkVycm9yLCBvcHQpID0+IGludFJlc29sdmUoc3RyLCAyLCAxNiwgb3B0KSxcbiAgICBzdHJpbmdpZnk6IG5vZGUgPT4gaW50U3RyaW5naWZ5KG5vZGUsIDE2LCAnMHgnKVxufTtcblxuZXhwb3J0cy5pbnQgPSBpbnQ7XG5leHBvcnRzLmludEhleCA9IGludEhleDtcbmV4cG9ydHMuaW50T2N0ID0gaW50T2N0O1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBtYXAgPSByZXF1aXJlKCcuLi9jb21tb24vbWFwLmpzJyk7XG52YXIgX251bGwgPSByZXF1aXJlKCcuLi9jb21tb24vbnVsbC5qcycpO1xudmFyIHNlcSA9IHJlcXVpcmUoJy4uL2NvbW1vbi9zZXEuanMnKTtcbnZhciBzdHJpbmcgPSByZXF1aXJlKCcuLi9jb21tb24vc3RyaW5nLmpzJyk7XG52YXIgYm9vbCA9IHJlcXVpcmUoJy4vYm9vbC5qcycpO1xudmFyIGZsb2F0ID0gcmVxdWlyZSgnLi9mbG9hdC5qcycpO1xudmFyIGludCA9IHJlcXVpcmUoJy4vaW50LmpzJyk7XG5cbmNvbnN0IHNjaGVtYSA9IFtcbiAgICBtYXAubWFwLFxuICAgIHNlcS5zZXEsXG4gICAgc3RyaW5nLnN0cmluZyxcbiAgICBfbnVsbC5udWxsVGFnLFxuICAgIGJvb2wuYm9vbFRhZyxcbiAgICBpbnQuaW50T2N0LFxuICAgIGludC5pbnQsXG4gICAgaW50LmludEhleCxcbiAgICBmbG9hdC5mbG9hdE5hTixcbiAgICBmbG9hdC5mbG9hdEV4cCxcbiAgICBmbG9hdC5mbG9hdFxuXTtcblxuZXhwb3J0cy5zY2hlbWEgPSBzY2hlbWE7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIFNjYWxhciA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL1NjYWxhci5qcycpO1xudmFyIG1hcCA9IHJlcXVpcmUoJy4uL2NvbW1vbi9tYXAuanMnKTtcbnZhciBzZXEgPSByZXF1aXJlKCcuLi9jb21tb24vc2VxLmpzJyk7XG5cbmZ1bmN0aW9uIGludElkZW50aWZ5KHZhbHVlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ2JpZ2ludCcgfHwgTnVtYmVyLmlzSW50ZWdlcih2YWx1ZSk7XG59XG5jb25zdCBzdHJpbmdpZnlKU09OID0gKHsgdmFsdWUgfSkgPT4gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuY29uc3QganNvblNjYWxhcnMgPSBbXG4gICAge1xuICAgICAgICBpZGVudGlmeTogdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6c3RyJyxcbiAgICAgICAgcmVzb2x2ZTogc3RyID0+IHN0cixcbiAgICAgICAgc3RyaW5naWZ5OiBzdHJpbmdpZnlKU09OXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB2YWx1ZSA9PSBudWxsLFxuICAgICAgICBjcmVhdGVOb2RlOiAoKSA9PiBuZXcgU2NhbGFyLlNjYWxhcihudWxsKSxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6bnVsbCcsXG4gICAgICAgIHRlc3Q6IC9ebnVsbCQvLFxuICAgICAgICByZXNvbHZlOiAoKSA9PiBudWxsLFxuICAgICAgICBzdHJpbmdpZnk6IHN0cmluZ2lmeUpTT05cbiAgICB9LFxuICAgIHtcbiAgICAgICAgaWRlbnRpZnk6IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpib29sJyxcbiAgICAgICAgdGVzdDogL150cnVlJHxeZmFsc2UkLyxcbiAgICAgICAgcmVzb2x2ZTogc3RyID0+IHN0ciA9PT0gJ3RydWUnLFxuICAgICAgICBzdHJpbmdpZnk6IHN0cmluZ2lmeUpTT05cbiAgICB9LFxuICAgIHtcbiAgICAgICAgaWRlbnRpZnk6IGludElkZW50aWZ5LFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjppbnQnLFxuICAgICAgICB0ZXN0OiAvXi0/KD86MHxbMS05XVswLTldKikkLyxcbiAgICAgICAgcmVzb2x2ZTogKHN0ciwgX29uRXJyb3IsIHsgaW50QXNCaWdJbnQgfSkgPT4gaW50QXNCaWdJbnQgPyBCaWdJbnQoc3RyKSA6IHBhcnNlSW50KHN0ciwgMTApLFxuICAgICAgICBzdHJpbmdpZnk6ICh7IHZhbHVlIH0pID0+IGludElkZW50aWZ5KHZhbHVlKSA/IHZhbHVlLnRvU3RyaW5nKCkgOiBKU09OLnN0cmluZ2lmeSh2YWx1ZSlcbiAgICB9LFxuICAgIHtcbiAgICAgICAgaWRlbnRpZnk6IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmZsb2F0JyxcbiAgICAgICAgdGVzdDogL14tPyg/OjB8WzEtOV1bMC05XSopKD86XFwuWzAtOV0qKT8oPzpbZUVdWy0rXT9bMC05XSspPyQvLFxuICAgICAgICByZXNvbHZlOiBzdHIgPT4gcGFyc2VGbG9hdChzdHIpLFxuICAgICAgICBzdHJpbmdpZnk6IHN0cmluZ2lmeUpTT05cbiAgICB9XG5dO1xuY29uc3QganNvbkVycm9yID0ge1xuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAnJyxcbiAgICB0ZXN0OiAvXi8sXG4gICAgcmVzb2x2ZShzdHIsIG9uRXJyb3IpIHtcbiAgICAgICAgb25FcnJvcihgVW5yZXNvbHZlZCBwbGFpbiBzY2FsYXIgJHtKU09OLnN0cmluZ2lmeShzdHIpfWApO1xuICAgICAgICByZXR1cm4gc3RyO1xuICAgIH1cbn07XG5jb25zdCBzY2hlbWEgPSBbbWFwLm1hcCwgc2VxLnNlcV0uY29uY2F0KGpzb25TY2FsYXJzLCBqc29uRXJyb3IpO1xuXG5leHBvcnRzLnNjaGVtYSA9IHNjaGVtYTtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbm9kZV9idWZmZXIgPSByZXF1aXJlKCdidWZmZXInKTtcbnZhciBTY2FsYXIgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9TY2FsYXIuanMnKTtcbnZhciBzdHJpbmdpZnlTdHJpbmcgPSByZXF1aXJlKCcuLi8uLi9zdHJpbmdpZnkvc3RyaW5naWZ5U3RyaW5nLmpzJyk7XG5cbmNvbnN0IGJpbmFyeSA9IHtcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gdmFsdWUgaW5zdGFuY2VvZiBVaW50OEFycmF5LCAvLyBCdWZmZXIgaW5oZXJpdHMgZnJvbSBVaW50OEFycmF5XG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6YmluYXJ5JyxcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgQnVmZmVyIGluIG5vZGUgYW5kIGFuIFVpbnQ4QXJyYXkgaW4gYnJvd3NlcnNcbiAgICAgKlxuICAgICAqIFRvIHVzZSB0aGUgcmVzdWx0aW5nIGJ1ZmZlciBhcyBhbiBpbWFnZSwgeW91J2xsIHdhbnQgdG8gZG8gc29tZXRoaW5nIGxpa2U6XG4gICAgICpcbiAgICAgKiAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbYnVmZmVyXSwgeyB0eXBlOiAnaW1hZ2UvanBlZycgfSlcbiAgICAgKiAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwaG90bycpLnNyYyA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYilcbiAgICAgKi9cbiAgICByZXNvbHZlKHNyYywgb25FcnJvcikge1xuICAgICAgICBpZiAodHlwZW9mIG5vZGVfYnVmZmVyLkJ1ZmZlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgcmV0dXJuIG5vZGVfYnVmZmVyLkJ1ZmZlci5mcm9tKHNyYywgJ2Jhc2U2NCcpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiBhdG9iID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAvLyBPbiBJRSAxMSwgYXRvYigpIGNhbid0IGhhbmRsZSBuZXdsaW5lc1xuICAgICAgICAgICAgY29uc3Qgc3RyID0gYXRvYihzcmMucmVwbGFjZSgvW1xcblxccl0vZywgJycpKTtcbiAgICAgICAgICAgIGNvbnN0IGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KHN0ci5sZW5ndGgpO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyArK2kpXG4gICAgICAgICAgICAgICAgYnVmZmVyW2ldID0gc3RyLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgICAgICByZXR1cm4gYnVmZmVyO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgb25FcnJvcignVGhpcyBlbnZpcm9ubWVudCBkb2VzIG5vdCBzdXBwb3J0IHJlYWRpbmcgYmluYXJ5IHRhZ3M7IGVpdGhlciBCdWZmZXIgb3IgYXRvYiBpcyByZXF1aXJlZCcpO1xuICAgICAgICAgICAgcmV0dXJuIHNyYztcbiAgICAgICAgfVxuICAgIH0sXG4gICAgc3RyaW5naWZ5KHsgY29tbWVudCwgdHlwZSwgdmFsdWUgfSwgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKSB7XG4gICAgICAgIGlmICghdmFsdWUpXG4gICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgIGNvbnN0IGJ1ZiA9IHZhbHVlOyAvLyBjaGVja2VkIGVhcmxpZXIgYnkgYmluYXJ5LmlkZW50aWZ5KClcbiAgICAgICAgbGV0IHN0cjtcbiAgICAgICAgaWYgKHR5cGVvZiBub2RlX2J1ZmZlci5CdWZmZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHN0ciA9XG4gICAgICAgICAgICAgICAgYnVmIGluc3RhbmNlb2Ygbm9kZV9idWZmZXIuQnVmZmVyXG4gICAgICAgICAgICAgICAgICAgID8gYnVmLnRvU3RyaW5nKCdiYXNlNjQnKVxuICAgICAgICAgICAgICAgICAgICA6IG5vZGVfYnVmZmVyLkJ1ZmZlci5mcm9tKGJ1Zi5idWZmZXIpLnRvU3RyaW5nKCdiYXNlNjQnKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0eXBlb2YgYnRvYSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgbGV0IHMgPSAnJztcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYnVmLmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgICAgIHMgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0pO1xuICAgICAgICAgICAgc3RyID0gYnRvYShzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGhpcyBlbnZpcm9ubWVudCBkb2VzIG5vdCBzdXBwb3J0IHdyaXRpbmcgYmluYXJ5IHRhZ3M7IGVpdGhlciBCdWZmZXIgb3IgYnRvYSBpcyByZXF1aXJlZCcpO1xuICAgICAgICB9XG4gICAgICAgIHR5cGUgPz8gKHR5cGUgPSBTY2FsYXIuU2NhbGFyLkJMT0NLX0xJVEVSQUwpO1xuICAgICAgICBpZiAodHlwZSAhPT0gU2NhbGFyLlNjYWxhci5RVU9URV9ET1VCTEUpIHtcbiAgICAgICAgICAgIGNvbnN0IGxpbmVXaWR0aCA9IE1hdGgubWF4KGN0eC5vcHRpb25zLmxpbmVXaWR0aCAtIGN0eC5pbmRlbnQubGVuZ3RoLCBjdHgub3B0aW9ucy5taW5Db250ZW50V2lkdGgpO1xuICAgICAgICAgICAgY29uc3QgbiA9IE1hdGguY2VpbChzdHIubGVuZ3RoIC8gbGluZVdpZHRoKTtcbiAgICAgICAgICAgIGNvbnN0IGxpbmVzID0gbmV3IEFycmF5KG4pO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDAsIG8gPSAwOyBpIDwgbjsgKytpLCBvICs9IGxpbmVXaWR0aCkge1xuICAgICAgICAgICAgICAgIGxpbmVzW2ldID0gc3RyLnN1YnN0cihvLCBsaW5lV2lkdGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3RyID0gbGluZXMuam9pbih0eXBlID09PSBTY2FsYXIuU2NhbGFyLkJMT0NLX0xJVEVSQUwgPyAnXFxuJyA6ICcgJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0cmluZ2lmeVN0cmluZy5zdHJpbmdpZnlTdHJpbmcoeyBjb21tZW50LCB0eXBlLCB2YWx1ZTogc3RyIH0sIGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCk7XG4gICAgfVxufTtcblxuZXhwb3J0cy5iaW5hcnkgPSBiaW5hcnk7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIGlkZW50aXR5ID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvaWRlbnRpdHkuanMnKTtcbnZhciBQYWlyID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvUGFpci5qcycpO1xudmFyIFNjYWxhciA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL1NjYWxhci5qcycpO1xudmFyIFlBTUxTZXEgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9ZQU1MU2VxLmpzJyk7XG5cbmZ1bmN0aW9uIHJlc29sdmVQYWlycyhzZXEsIG9uRXJyb3IpIHtcbiAgICBpZiAoaWRlbnRpdHkuaXNTZXEoc2VxKSkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNlcS5pdGVtcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgbGV0IGl0ZW0gPSBzZXEuaXRlbXNbaV07XG4gICAgICAgICAgICBpZiAoaWRlbnRpdHkuaXNQYWlyKGl0ZW0pKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgZWxzZSBpZiAoaWRlbnRpdHkuaXNNYXAoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS5pdGVtcy5sZW5ndGggPiAxKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKCdFYWNoIHBhaXIgbXVzdCBoYXZlIGl0cyBvd24gc2VxdWVuY2UgaW5kaWNhdG9yJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFpciA9IGl0ZW0uaXRlbXNbMF0gfHwgbmV3IFBhaXIuUGFpcihuZXcgU2NhbGFyLlNjYWxhcihudWxsKSk7XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0uY29tbWVudEJlZm9yZSlcbiAgICAgICAgICAgICAgICAgICAgcGFpci5rZXkuY29tbWVudEJlZm9yZSA9IHBhaXIua2V5LmNvbW1lbnRCZWZvcmVcbiAgICAgICAgICAgICAgICAgICAgICAgID8gYCR7aXRlbS5jb21tZW50QmVmb3JlfVxcbiR7cGFpci5rZXkuY29tbWVudEJlZm9yZX1gXG4gICAgICAgICAgICAgICAgICAgICAgICA6IGl0ZW0uY29tbWVudEJlZm9yZTtcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS5jb21tZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNuID0gcGFpci52YWx1ZSA/PyBwYWlyLmtleTtcbiAgICAgICAgICAgICAgICAgICAgY24uY29tbWVudCA9IGNuLmNvbW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgID8gYCR7aXRlbS5jb21tZW50fVxcbiR7Y24uY29tbWVudH1gXG4gICAgICAgICAgICAgICAgICAgICAgICA6IGl0ZW0uY29tbWVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaXRlbSA9IHBhaXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZXEuaXRlbXNbaV0gPSBpZGVudGl0eS5pc1BhaXIoaXRlbSkgPyBpdGVtIDogbmV3IFBhaXIuUGFpcihpdGVtKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlXG4gICAgICAgIG9uRXJyb3IoJ0V4cGVjdGVkIGEgc2VxdWVuY2UgZm9yIHRoaXMgdGFnJyk7XG4gICAgcmV0dXJuIHNlcTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZVBhaXJzKHNjaGVtYSwgaXRlcmFibGUsIGN0eCkge1xuICAgIGNvbnN0IHsgcmVwbGFjZXIgfSA9IGN0eDtcbiAgICBjb25zdCBwYWlycyA9IG5ldyBZQU1MU2VxLllBTUxTZXEoc2NoZW1hKTtcbiAgICBwYWlycy50YWcgPSAndGFnOnlhbWwub3JnLDIwMDI6cGFpcnMnO1xuICAgIGxldCBpID0gMDtcbiAgICBpZiAoaXRlcmFibGUgJiYgU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdChpdGVyYWJsZSkpXG4gICAgICAgIGZvciAobGV0IGl0IG9mIGl0ZXJhYmxlKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHJlcGxhY2VyID09PSAnZnVuY3Rpb24nKVxuICAgICAgICAgICAgICAgIGl0ID0gcmVwbGFjZXIuY2FsbChpdGVyYWJsZSwgU3RyaW5nKGkrKyksIGl0KTtcbiAgICAgICAgICAgIGxldCBrZXksIHZhbHVlO1xuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoaXQpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGl0Lmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgICAgICAgICAgICBrZXkgPSBpdFswXTtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBpdFsxXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBba2V5LCB2YWx1ZV0gdHVwbGU6ICR7aXR9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpdCAmJiBpdCBpbnN0YW5jZW9mIE9iamVjdCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyhpdCk7XG4gICAgICAgICAgICAgICAgaWYgKGtleXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGtleSA9IGtleXNbMF07XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gaXRba2V5XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEV4cGVjdGVkIHR1cGxlIHdpdGggb25lIGtleSwgbm90ICR7a2V5cy5sZW5ndGh9IGtleXNgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBrZXkgPSBpdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhaXJzLml0ZW1zLnB1c2goUGFpci5jcmVhdGVQYWlyKGtleSwgdmFsdWUsIGN0eCkpO1xuICAgICAgICB9XG4gICAgcmV0dXJuIHBhaXJzO1xufVxuY29uc3QgcGFpcnMgPSB7XG4gICAgY29sbGVjdGlvbjogJ3NlcScsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6cGFpcnMnLFxuICAgIHJlc29sdmU6IHJlc29sdmVQYWlycyxcbiAgICBjcmVhdGVOb2RlOiBjcmVhdGVQYWlyc1xufTtcblxuZXhwb3J0cy5jcmVhdGVQYWlycyA9IGNyZWF0ZVBhaXJzO1xuZXhwb3J0cy5wYWlycyA9IHBhaXJzO1xuZXhwb3J0cy5yZXNvbHZlUGFpcnMgPSByZXNvbHZlUGFpcnM7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIGlkZW50aXR5ID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvaWRlbnRpdHkuanMnKTtcbnZhciB0b0pTID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvdG9KUy5qcycpO1xudmFyIFlBTUxNYXAgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9ZQU1MTWFwLmpzJyk7XG52YXIgWUFNTFNlcSA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL1lBTUxTZXEuanMnKTtcbnZhciBwYWlycyA9IHJlcXVpcmUoJy4vcGFpcnMuanMnKTtcblxuY2xhc3MgWUFNTE9NYXAgZXh0ZW5kcyBZQU1MU2VxLllBTUxTZXEge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmFkZCA9IFlBTUxNYXAuWUFNTE1hcC5wcm90b3R5cGUuYWRkLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuZGVsZXRlID0gWUFNTE1hcC5ZQU1MTWFwLnByb3RvdHlwZS5kZWxldGUuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5nZXQgPSBZQU1MTWFwLllBTUxNYXAucHJvdG90eXBlLmdldC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmhhcyA9IFlBTUxNYXAuWUFNTE1hcC5wcm90b3R5cGUuaGFzLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuc2V0ID0gWUFNTE1hcC5ZQU1MTWFwLnByb3RvdHlwZS5zZXQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy50YWcgPSBZQU1MT01hcC50YWc7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIElmIGBjdHhgIGlzIGdpdmVuLCB0aGUgcmV0dXJuIHR5cGUgaXMgYWN0dWFsbHkgYE1hcDx1bmtub3duLCB1bmtub3duPmAsXG4gICAgICogYnV0IFR5cGVTY3JpcHQgd29uJ3QgYWxsb3cgd2lkZW5pbmcgdGhlIHNpZ25hdHVyZSBvZiBhIGNoaWxkIG1ldGhvZC5cbiAgICAgKi9cbiAgICB0b0pTT04oXywgY3R4KSB7XG4gICAgICAgIGlmICghY3R4KVxuICAgICAgICAgICAgcmV0dXJuIHN1cGVyLnRvSlNPTihfKTtcbiAgICAgICAgY29uc3QgbWFwID0gbmV3IE1hcCgpO1xuICAgICAgICBpZiAoY3R4Py5vbkNyZWF0ZSlcbiAgICAgICAgICAgIGN0eC5vbkNyZWF0ZShtYXApO1xuICAgICAgICBmb3IgKGNvbnN0IHBhaXIgb2YgdGhpcy5pdGVtcykge1xuICAgICAgICAgICAgbGV0IGtleSwgdmFsdWU7XG4gICAgICAgICAgICBpZiAoaWRlbnRpdHkuaXNQYWlyKHBhaXIpKSB7XG4gICAgICAgICAgICAgICAga2V5ID0gdG9KUy50b0pTKHBhaXIua2V5LCAnJywgY3R4KTtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHRvSlMudG9KUyhwYWlyLnZhbHVlLCBrZXksIGN0eCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBrZXkgPSB0b0pTLnRvSlMocGFpciwgJycsIGN0eCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobWFwLmhhcyhrZXkpKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignT3JkZXJlZCBtYXBzIG11c3Qgbm90IGluY2x1ZGUgZHVwbGljYXRlIGtleXMnKTtcbiAgICAgICAgICAgIG1hcC5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1hcDtcbiAgICB9XG4gICAgc3RhdGljIGZyb20oc2NoZW1hLCBpdGVyYWJsZSwgY3R4KSB7XG4gICAgICAgIGNvbnN0IHBhaXJzJDEgPSBwYWlycy5jcmVhdGVQYWlycyhzY2hlbWEsIGl0ZXJhYmxlLCBjdHgpO1xuICAgICAgICBjb25zdCBvbWFwID0gbmV3IHRoaXMoKTtcbiAgICAgICAgb21hcC5pdGVtcyA9IHBhaXJzJDEuaXRlbXM7XG4gICAgICAgIHJldHVybiBvbWFwO1xuICAgIH1cbn1cbllBTUxPTWFwLnRhZyA9ICd0YWc6eWFtbC5vcmcsMjAwMjpvbWFwJztcbmNvbnN0IG9tYXAgPSB7XG4gICAgY29sbGVjdGlvbjogJ3NlcScsXG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHZhbHVlIGluc3RhbmNlb2YgTWFwLFxuICAgIG5vZGVDbGFzczogWUFNTE9NYXAsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6b21hcCcsXG4gICAgcmVzb2x2ZShzZXEsIG9uRXJyb3IpIHtcbiAgICAgICAgY29uc3QgcGFpcnMkMSA9IHBhaXJzLnJlc29sdmVQYWlycyhzZXEsIG9uRXJyb3IpO1xuICAgICAgICBjb25zdCBzZWVuS2V5cyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IHsga2V5IH0gb2YgcGFpcnMkMS5pdGVtcykge1xuICAgICAgICAgICAgaWYgKGlkZW50aXR5LmlzU2NhbGFyKGtleSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoc2VlbktleXMuaW5jbHVkZXMoa2V5LnZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKGBPcmRlcmVkIG1hcHMgbXVzdCBub3QgaW5jbHVkZSBkdXBsaWNhdGUga2V5czogJHtrZXkudmFsdWV9YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzZWVuS2V5cy5wdXNoKGtleS52YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKG5ldyBZQU1MT01hcCgpLCBwYWlycyQxKTtcbiAgICB9LFxuICAgIGNyZWF0ZU5vZGU6IChzY2hlbWEsIGl0ZXJhYmxlLCBjdHgpID0+IFlBTUxPTWFwLmZyb20oc2NoZW1hLCBpdGVyYWJsZSwgY3R4KVxufTtcblxuZXhwb3J0cy5ZQU1MT01hcCA9IFlBTUxPTWFwO1xuZXhwb3J0cy5vbWFwID0gb21hcDtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgU2NhbGFyID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvU2NhbGFyLmpzJyk7XG5cbmZ1bmN0aW9uIGJvb2xTdHJpbmdpZnkoeyB2YWx1ZSwgc291cmNlIH0sIGN0eCkge1xuICAgIGNvbnN0IGJvb2xPYmogPSB2YWx1ZSA/IHRydWVUYWcgOiBmYWxzZVRhZztcbiAgICBpZiAoc291cmNlICYmIGJvb2xPYmoudGVzdC50ZXN0KHNvdXJjZSkpXG4gICAgICAgIHJldHVybiBzb3VyY2U7XG4gICAgcmV0dXJuIHZhbHVlID8gY3R4Lm9wdGlvbnMudHJ1ZVN0ciA6IGN0eC5vcHRpb25zLmZhbHNlU3RyO1xufVxuY29uc3QgdHJ1ZVRhZyA9IHtcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gdmFsdWUgPT09IHRydWUsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpib29sJyxcbiAgICB0ZXN0OiAvXig/Oll8eXxbWXldZXN8WUVTfFtUdF1ydWV8VFJVRXxbT29dbnxPTikkLyxcbiAgICByZXNvbHZlOiAoKSA9PiBuZXcgU2NhbGFyLlNjYWxhcih0cnVlKSxcbiAgICBzdHJpbmdpZnk6IGJvb2xTdHJpbmdpZnlcbn07XG5jb25zdCBmYWxzZVRhZyA9IHtcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gdmFsdWUgPT09IGZhbHNlLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6Ym9vbCcsXG4gICAgdGVzdDogL14oPzpOfG58W05uXW98Tk98W0ZmXWFsc2V8RkFMU0V8W09vXWZmfE9GRikkLyxcbiAgICByZXNvbHZlOiAoKSA9PiBuZXcgU2NhbGFyLlNjYWxhcihmYWxzZSksXG4gICAgc3RyaW5naWZ5OiBib29sU3RyaW5naWZ5XG59O1xuXG5leHBvcnRzLmZhbHNlVGFnID0gZmFsc2VUYWc7XG5leHBvcnRzLnRydWVUYWcgPSB0cnVlVGFnO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBTY2FsYXIgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9TY2FsYXIuanMnKTtcbnZhciBzdHJpbmdpZnlOdW1iZXIgPSByZXF1aXJlKCcuLi8uLi9zdHJpbmdpZnkvc3RyaW5naWZ5TnVtYmVyLmpzJyk7XG5cbmNvbnN0IGZsb2F0TmFOID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6ZmxvYXQnLFxuICAgIHRlc3Q6IC9eKD86Wy0rXT9cXC4oPzppbmZ8SW5mfElORil8XFwubmFufFxcLk5hTnxcXC5OQU4pJC8sXG4gICAgcmVzb2x2ZTogKHN0cikgPT4gc3RyLnNsaWNlKC0zKS50b0xvd2VyQ2FzZSgpID09PSAnbmFuJ1xuICAgICAgICA/IE5hTlxuICAgICAgICA6IHN0clswXSA9PT0gJy0nXG4gICAgICAgICAgICA/IE51bWJlci5ORUdBVElWRV9JTkZJTklUWVxuICAgICAgICAgICAgOiBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFksXG4gICAgc3RyaW5naWZ5OiBzdHJpbmdpZnlOdW1iZXIuc3RyaW5naWZ5TnVtYmVyXG59O1xuY29uc3QgZmxvYXRFeHAgPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpmbG9hdCcsXG4gICAgZm9ybWF0OiAnRVhQJyxcbiAgICB0ZXN0OiAvXlstK10/KD86WzAtOV1bMC05X10qKT8oPzpcXC5bMC05X10qKT9bZUVdWy0rXT9bMC05XSskLyxcbiAgICByZXNvbHZlOiAoc3RyKSA9PiBwYXJzZUZsb2F0KHN0ci5yZXBsYWNlKC9fL2csICcnKSksXG4gICAgc3RyaW5naWZ5KG5vZGUpIHtcbiAgICAgICAgY29uc3QgbnVtID0gTnVtYmVyKG5vZGUudmFsdWUpO1xuICAgICAgICByZXR1cm4gaXNGaW5pdGUobnVtKSA/IG51bS50b0V4cG9uZW50aWFsKCkgOiBzdHJpbmdpZnlOdW1iZXIuc3RyaW5naWZ5TnVtYmVyKG5vZGUpO1xuICAgIH1cbn07XG5jb25zdCBmbG9hdCA9IHtcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmZsb2F0JyxcbiAgICB0ZXN0OiAvXlstK10/KD86WzAtOV1bMC05X10qKT9cXC5bMC05X10qJC8sXG4gICAgcmVzb2x2ZShzdHIpIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IG5ldyBTY2FsYXIuU2NhbGFyKHBhcnNlRmxvYXQoc3RyLnJlcGxhY2UoL18vZywgJycpKSk7XG4gICAgICAgIGNvbnN0IGRvdCA9IHN0ci5pbmRleE9mKCcuJyk7XG4gICAgICAgIGlmIChkb3QgIT09IC0xKSB7XG4gICAgICAgICAgICBjb25zdCBmID0gc3RyLnN1YnN0cmluZyhkb3QgKyAxKS5yZXBsYWNlKC9fL2csICcnKTtcbiAgICAgICAgICAgIGlmIChmW2YubGVuZ3RoIC0gMV0gPT09ICcwJylcbiAgICAgICAgICAgICAgICBub2RlLm1pbkZyYWN0aW9uRGlnaXRzID0gZi5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfSxcbiAgICBzdHJpbmdpZnk6IHN0cmluZ2lmeU51bWJlci5zdHJpbmdpZnlOdW1iZXJcbn07XG5cbmV4cG9ydHMuZmxvYXQgPSBmbG9hdDtcbmV4cG9ydHMuZmxvYXRFeHAgPSBmbG9hdEV4cDtcbmV4cG9ydHMuZmxvYXROYU4gPSBmbG9hdE5hTjtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgc3RyaW5naWZ5TnVtYmVyID0gcmVxdWlyZSgnLi4vLi4vc3RyaW5naWZ5L3N0cmluZ2lmeU51bWJlci5qcycpO1xuXG5jb25zdCBpbnRJZGVudGlmeSA9ICh2YWx1ZSkgPT4gdHlwZW9mIHZhbHVlID09PSAnYmlnaW50JyB8fCBOdW1iZXIuaXNJbnRlZ2VyKHZhbHVlKTtcbmZ1bmN0aW9uIGludFJlc29sdmUoc3RyLCBvZmZzZXQsIHJhZGl4LCB7IGludEFzQmlnSW50IH0pIHtcbiAgICBjb25zdCBzaWduID0gc3RyWzBdO1xuICAgIGlmIChzaWduID09PSAnLScgfHwgc2lnbiA9PT0gJysnKVxuICAgICAgICBvZmZzZXQgKz0gMTtcbiAgICBzdHIgPSBzdHIuc3Vic3RyaW5nKG9mZnNldCkucmVwbGFjZSgvXy9nLCAnJyk7XG4gICAgaWYgKGludEFzQmlnSW50KSB7XG4gICAgICAgIHN3aXRjaCAocmFkaXgpIHtcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICBzdHIgPSBgMGIke3N0cn1gO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA4OlxuICAgICAgICAgICAgICAgIHN0ciA9IGAwbyR7c3RyfWA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDE2OlxuICAgICAgICAgICAgICAgIHN0ciA9IGAweCR7c3RyfWA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbiA9IEJpZ0ludChzdHIpO1xuICAgICAgICByZXR1cm4gc2lnbiA9PT0gJy0nID8gQmlnSW50KC0xKSAqIG4gOiBuO1xuICAgIH1cbiAgICBjb25zdCBuID0gcGFyc2VJbnQoc3RyLCByYWRpeCk7XG4gICAgcmV0dXJuIHNpZ24gPT09ICctJyA/IC0xICogbiA6IG47XG59XG5mdW5jdGlvbiBpbnRTdHJpbmdpZnkobm9kZSwgcmFkaXgsIHByZWZpeCkge1xuICAgIGNvbnN0IHsgdmFsdWUgfSA9IG5vZGU7XG4gICAgaWYgKGludElkZW50aWZ5KHZhbHVlKSkge1xuICAgICAgICBjb25zdCBzdHIgPSB2YWx1ZS50b1N0cmluZyhyYWRpeCk7XG4gICAgICAgIHJldHVybiB2YWx1ZSA8IDAgPyAnLScgKyBwcmVmaXggKyBzdHIuc3Vic3RyKDEpIDogcHJlZml4ICsgc3RyO1xuICAgIH1cbiAgICByZXR1cm4gc3RyaW5naWZ5TnVtYmVyLnN0cmluZ2lmeU51bWJlcihub2RlKTtcbn1cbmNvbnN0IGludEJpbiA9IHtcbiAgICBpZGVudGlmeTogaW50SWRlbnRpZnksXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjppbnQnLFxuICAgIGZvcm1hdDogJ0JJTicsXG4gICAgdGVzdDogL15bLStdPzBiWzAtMV9dKyQvLFxuICAgIHJlc29sdmU6IChzdHIsIF9vbkVycm9yLCBvcHQpID0+IGludFJlc29sdmUoc3RyLCAyLCAyLCBvcHQpLFxuICAgIHN0cmluZ2lmeTogbm9kZSA9PiBpbnRTdHJpbmdpZnkobm9kZSwgMiwgJzBiJylcbn07XG5jb25zdCBpbnRPY3QgPSB7XG4gICAgaWRlbnRpZnk6IGludElkZW50aWZ5LFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6aW50JyxcbiAgICBmb3JtYXQ6ICdPQ1QnLFxuICAgIHRlc3Q6IC9eWy0rXT8wWzAtN19dKyQvLFxuICAgIHJlc29sdmU6IChzdHIsIF9vbkVycm9yLCBvcHQpID0+IGludFJlc29sdmUoc3RyLCAxLCA4LCBvcHQpLFxuICAgIHN0cmluZ2lmeTogbm9kZSA9PiBpbnRTdHJpbmdpZnkobm9kZSwgOCwgJzAnKVxufTtcbmNvbnN0IGludCA9IHtcbiAgICBpZGVudGlmeTogaW50SWRlbnRpZnksXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjppbnQnLFxuICAgIHRlc3Q6IC9eWy0rXT9bMC05XVswLTlfXSokLyxcbiAgICByZXNvbHZlOiAoc3RyLCBfb25FcnJvciwgb3B0KSA9PiBpbnRSZXNvbHZlKHN0ciwgMCwgMTAsIG9wdCksXG4gICAgc3RyaW5naWZ5OiBzdHJpbmdpZnlOdW1iZXIuc3RyaW5naWZ5TnVtYmVyXG59O1xuY29uc3QgaW50SGV4ID0ge1xuICAgIGlkZW50aWZ5OiBpbnRJZGVudGlmeSxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmludCcsXG4gICAgZm9ybWF0OiAnSEVYJyxcbiAgICB0ZXN0OiAvXlstK10/MHhbMC05YS1mQS1GX10rJC8sXG4gICAgcmVzb2x2ZTogKHN0ciwgX29uRXJyb3IsIG9wdCkgPT4gaW50UmVzb2x2ZShzdHIsIDIsIDE2LCBvcHQpLFxuICAgIHN0cmluZ2lmeTogbm9kZSA9PiBpbnRTdHJpbmdpZnkobm9kZSwgMTYsICcweCcpXG59O1xuXG5leHBvcnRzLmludCA9IGludDtcbmV4cG9ydHMuaW50QmluID0gaW50QmluO1xuZXhwb3J0cy5pbnRIZXggPSBpbnRIZXg7XG5leHBvcnRzLmludE9jdCA9IGludE9jdDtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9pZGVudGl0eS5qcycpO1xudmFyIFBhaXIgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9QYWlyLmpzJyk7XG52YXIgWUFNTE1hcCA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL1lBTUxNYXAuanMnKTtcblxuY2xhc3MgWUFNTFNldCBleHRlbmRzIFlBTUxNYXAuWUFNTE1hcCB7XG4gICAgY29uc3RydWN0b3Ioc2NoZW1hKSB7XG4gICAgICAgIHN1cGVyKHNjaGVtYSk7XG4gICAgICAgIHRoaXMudGFnID0gWUFNTFNldC50YWc7XG4gICAgfVxuICAgIGFkZChrZXkpIHtcbiAgICAgICAgbGV0IHBhaXI7XG4gICAgICAgIGlmIChpZGVudGl0eS5pc1BhaXIoa2V5KSlcbiAgICAgICAgICAgIHBhaXIgPSBrZXk7XG4gICAgICAgIGVsc2UgaWYgKGtleSAmJlxuICAgICAgICAgICAgdHlwZW9mIGtleSA9PT0gJ29iamVjdCcgJiZcbiAgICAgICAgICAgICdrZXknIGluIGtleSAmJlxuICAgICAgICAgICAgJ3ZhbHVlJyBpbiBrZXkgJiZcbiAgICAgICAgICAgIGtleS52YWx1ZSA9PT0gbnVsbClcbiAgICAgICAgICAgIHBhaXIgPSBuZXcgUGFpci5QYWlyKGtleS5rZXksIG51bGwpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBwYWlyID0gbmV3IFBhaXIuUGFpcihrZXksIG51bGwpO1xuICAgICAgICBjb25zdCBwcmV2ID0gWUFNTE1hcC5maW5kUGFpcih0aGlzLml0ZW1zLCBwYWlyLmtleSk7XG4gICAgICAgIGlmICghcHJldilcbiAgICAgICAgICAgIHRoaXMuaXRlbXMucHVzaChwYWlyKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogSWYgYGtlZXBQYWlyYCBpcyBgdHJ1ZWAsIHJldHVybnMgdGhlIFBhaXIgbWF0Y2hpbmcgYGtleWAuXG4gICAgICogT3RoZXJ3aXNlLCByZXR1cm5zIHRoZSB2YWx1ZSBvZiB0aGF0IFBhaXIncyBrZXkuXG4gICAgICovXG4gICAgZ2V0KGtleSwga2VlcFBhaXIpIHtcbiAgICAgICAgY29uc3QgcGFpciA9IFlBTUxNYXAuZmluZFBhaXIodGhpcy5pdGVtcywga2V5KTtcbiAgICAgICAgcmV0dXJuICFrZWVwUGFpciAmJiBpZGVudGl0eS5pc1BhaXIocGFpcilcbiAgICAgICAgICAgID8gaWRlbnRpdHkuaXNTY2FsYXIocGFpci5rZXkpXG4gICAgICAgICAgICAgICAgPyBwYWlyLmtleS52YWx1ZVxuICAgICAgICAgICAgICAgIDogcGFpci5rZXlcbiAgICAgICAgICAgIDogcGFpcjtcbiAgICB9XG4gICAgc2V0KGtleSwgdmFsdWUpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ2Jvb2xlYW4nKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCBib29sZWFuIHZhbHVlIGZvciBzZXQoa2V5LCB2YWx1ZSkgaW4gYSBZQU1MIHNldCwgbm90ICR7dHlwZW9mIHZhbHVlfWApO1xuICAgICAgICBjb25zdCBwcmV2ID0gWUFNTE1hcC5maW5kUGFpcih0aGlzLml0ZW1zLCBrZXkpO1xuICAgICAgICBpZiAocHJldiAmJiAhdmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuaXRlbXMuc3BsaWNlKHRoaXMuaXRlbXMuaW5kZXhPZihwcmV2KSwgMSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIXByZXYgJiYgdmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuaXRlbXMucHVzaChuZXcgUGFpci5QYWlyKGtleSkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHRvSlNPTihfLCBjdHgpIHtcbiAgICAgICAgcmV0dXJuIHN1cGVyLnRvSlNPTihfLCBjdHgsIFNldCk7XG4gICAgfVxuICAgIHRvU3RyaW5nKGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCkge1xuICAgICAgICBpZiAoIWN0eClcbiAgICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzKTtcbiAgICAgICAgaWYgKHRoaXMuaGFzQWxsTnVsbFZhbHVlcyh0cnVlKSlcbiAgICAgICAgICAgIHJldHVybiBzdXBlci50b1N0cmluZyhPYmplY3QuYXNzaWduKHt9LCBjdHgsIHsgYWxsTnVsbFZhbHVlczogdHJ1ZSB9KSwgb25Db21tZW50LCBvbkNob21wS2VlcCk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignU2V0IGl0ZW1zIG11c3QgYWxsIGhhdmUgbnVsbCB2YWx1ZXMnKTtcbiAgICB9XG4gICAgc3RhdGljIGZyb20oc2NoZW1hLCBpdGVyYWJsZSwgY3R4KSB7XG4gICAgICAgIGNvbnN0IHsgcmVwbGFjZXIgfSA9IGN0eDtcbiAgICAgICAgY29uc3Qgc2V0ID0gbmV3IHRoaXMoc2NoZW1hKTtcbiAgICAgICAgaWYgKGl0ZXJhYmxlICYmIFN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QoaXRlcmFibGUpKVxuICAgICAgICAgICAgZm9yIChsZXQgdmFsdWUgb2YgaXRlcmFibGUpIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHJlcGxhY2VyID09PSAnZnVuY3Rpb24nKVxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHJlcGxhY2VyLmNhbGwoaXRlcmFibGUsIHZhbHVlLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgc2V0Lml0ZW1zLnB1c2goUGFpci5jcmVhdGVQYWlyKHZhbHVlLCBudWxsLCBjdHgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNldDtcbiAgICB9XG59XG5ZQU1MU2V0LnRhZyA9ICd0YWc6eWFtbC5vcmcsMjAwMjpzZXQnO1xuY29uc3Qgc2V0ID0ge1xuICAgIGNvbGxlY3Rpb246ICdtYXAnLFxuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB2YWx1ZSBpbnN0YW5jZW9mIFNldCxcbiAgICBub2RlQ2xhc3M6IFlBTUxTZXQsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6c2V0JyxcbiAgICBjcmVhdGVOb2RlOiAoc2NoZW1hLCBpdGVyYWJsZSwgY3R4KSA9PiBZQU1MU2V0LmZyb20oc2NoZW1hLCBpdGVyYWJsZSwgY3R4KSxcbiAgICByZXNvbHZlKG1hcCwgb25FcnJvcikge1xuICAgICAgICBpZiAoaWRlbnRpdHkuaXNNYXAobWFwKSkge1xuICAgICAgICAgICAgaWYgKG1hcC5oYXNBbGxOdWxsVmFsdWVzKHRydWUpKVxuICAgICAgICAgICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKG5ldyBZQU1MU2V0KCksIG1hcCk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgb25FcnJvcignU2V0IGl0ZW1zIG11c3QgYWxsIGhhdmUgbnVsbCB2YWx1ZXMnKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBvbkVycm9yKCdFeHBlY3RlZCBhIG1hcHBpbmcgZm9yIHRoaXMgdGFnJyk7XG4gICAgICAgIHJldHVybiBtYXA7XG4gICAgfVxufTtcblxuZXhwb3J0cy5ZQU1MU2V0ID0gWUFNTFNldDtcbmV4cG9ydHMuc2V0ID0gc2V0O1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBzdHJpbmdpZnlOdW1iZXIgPSByZXF1aXJlKCcuLi8uLi9zdHJpbmdpZnkvc3RyaW5naWZ5TnVtYmVyLmpzJyk7XG5cbi8qKiBJbnRlcm5hbCB0eXBlcyBoYW5kbGUgYmlnaW50IGFzIG51bWJlciwgYmVjYXVzZSBUUyBjYW4ndCBmaWd1cmUgaXQgb3V0LiAqL1xuZnVuY3Rpb24gcGFyc2VTZXhhZ2VzaW1hbChzdHIsIGFzQmlnSW50KSB7XG4gICAgY29uc3Qgc2lnbiA9IHN0clswXTtcbiAgICBjb25zdCBwYXJ0cyA9IHNpZ24gPT09ICctJyB8fCBzaWduID09PSAnKycgPyBzdHIuc3Vic3RyaW5nKDEpIDogc3RyO1xuICAgIGNvbnN0IG51bSA9IChuKSA9PiBhc0JpZ0ludCA/IEJpZ0ludChuKSA6IE51bWJlcihuKTtcbiAgICBjb25zdCByZXMgPSBwYXJ0c1xuICAgICAgICAucmVwbGFjZSgvXy9nLCAnJylcbiAgICAgICAgLnNwbGl0KCc6JylcbiAgICAgICAgLnJlZHVjZSgocmVzLCBwKSA9PiByZXMgKiBudW0oNjApICsgbnVtKHApLCBudW0oMCkpO1xuICAgIHJldHVybiAoc2lnbiA9PT0gJy0nID8gbnVtKC0xKSAqIHJlcyA6IHJlcyk7XG59XG4vKipcbiAqIGhoaGg6bW06c3Muc3NzXG4gKlxuICogSW50ZXJuYWwgdHlwZXMgaGFuZGxlIGJpZ2ludCBhcyBudW1iZXIsIGJlY2F1c2UgVFMgY2FuJ3QgZmlndXJlIGl0IG91dC5cbiAqL1xuZnVuY3Rpb24gc3RyaW5naWZ5U2V4YWdlc2ltYWwobm9kZSkge1xuICAgIGxldCB7IHZhbHVlIH0gPSBub2RlO1xuICAgIGxldCBudW0gPSAobikgPT4gbjtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnYmlnaW50JylcbiAgICAgICAgbnVtID0gbiA9PiBCaWdJbnQobik7XG4gICAgZWxzZSBpZiAoaXNOYU4odmFsdWUpIHx8ICFpc0Zpbml0ZSh2YWx1ZSkpXG4gICAgICAgIHJldHVybiBzdHJpbmdpZnlOdW1iZXIuc3RyaW5naWZ5TnVtYmVyKG5vZGUpO1xuICAgIGxldCBzaWduID0gJyc7XG4gICAgaWYgKHZhbHVlIDwgMCkge1xuICAgICAgICBzaWduID0gJy0nO1xuICAgICAgICB2YWx1ZSAqPSBudW0oLTEpO1xuICAgIH1cbiAgICBjb25zdCBfNjAgPSBudW0oNjApO1xuICAgIGNvbnN0IHBhcnRzID0gW3ZhbHVlICUgXzYwXTsgLy8gc2Vjb25kcywgaW5jbHVkaW5nIG1zXG4gICAgaWYgKHZhbHVlIDwgNjApIHtcbiAgICAgICAgcGFydHMudW5zaGlmdCgwKTsgLy8gYXQgbGVhc3Qgb25lIDogaXMgcmVxdWlyZWRcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHZhbHVlID0gKHZhbHVlIC0gcGFydHNbMF0pIC8gXzYwO1xuICAgICAgICBwYXJ0cy51bnNoaWZ0KHZhbHVlICUgXzYwKTsgLy8gbWludXRlc1xuICAgICAgICBpZiAodmFsdWUgPj0gNjApIHtcbiAgICAgICAgICAgIHZhbHVlID0gKHZhbHVlIC0gcGFydHNbMF0pIC8gXzYwO1xuICAgICAgICAgICAgcGFydHMudW5zaGlmdCh2YWx1ZSk7IC8vIGhvdXJzXG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIChzaWduICtcbiAgICAgICAgcGFydHNcbiAgICAgICAgICAgIC5tYXAobiA9PiBTdHJpbmcobikucGFkU3RhcnQoMiwgJzAnKSlcbiAgICAgICAgICAgIC5qb2luKCc6JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC8wMDAwMDBcXGQqJC8sICcnKSAvLyAlIDYwIG1heSBpbnRyb2R1Y2UgZXJyb3JcbiAgICApO1xufVxuY29uc3QgaW50VGltZSA9IHtcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnYmlnaW50JyB8fCBOdW1iZXIuaXNJbnRlZ2VyKHZhbHVlKSxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmludCcsXG4gICAgZm9ybWF0OiAnVElNRScsXG4gICAgdGVzdDogL15bLStdP1swLTldWzAtOV9dKig/OjpbMC01XT9bMC05XSkrJC8sXG4gICAgcmVzb2x2ZTogKHN0ciwgX29uRXJyb3IsIHsgaW50QXNCaWdJbnQgfSkgPT4gcGFyc2VTZXhhZ2VzaW1hbChzdHIsIGludEFzQmlnSW50KSxcbiAgICBzdHJpbmdpZnk6IHN0cmluZ2lmeVNleGFnZXNpbWFsXG59O1xuY29uc3QgZmxvYXRUaW1lID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6ZmxvYXQnLFxuICAgIGZvcm1hdDogJ1RJTUUnLFxuICAgIHRlc3Q6IC9eWy0rXT9bMC05XVswLTlfXSooPzo6WzAtNV0/WzAtOV0pK1xcLlswLTlfXSokLyxcbiAgICByZXNvbHZlOiBzdHIgPT4gcGFyc2VTZXhhZ2VzaW1hbChzdHIsIGZhbHNlKSxcbiAgICBzdHJpbmdpZnk6IHN0cmluZ2lmeVNleGFnZXNpbWFsXG59O1xuY29uc3QgdGltZXN0YW1wID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB2YWx1ZSBpbnN0YW5jZW9mIERhdGUsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjp0aW1lc3RhbXAnLFxuICAgIC8vIElmIHRoZSB0aW1lIHpvbmUgaXMgb21pdHRlZCwgdGhlIHRpbWVzdGFtcCBpcyBhc3N1bWVkIHRvIGJlIHNwZWNpZmllZCBpbiBVVEMuIFRoZSB0aW1lIHBhcnRcbiAgICAvLyBtYXkgYmUgb21pdHRlZCBhbHRvZ2V0aGVyLCByZXN1bHRpbmcgaW4gYSBkYXRlIGZvcm1hdC4gSW4gc3VjaCBhIGNhc2UsIHRoZSB0aW1lIHBhcnQgaXNcbiAgICAvLyBhc3N1bWVkIHRvIGJlIDAwOjAwOjAwWiAoc3RhcnQgb2YgZGF5LCBVVEMpLlxuICAgIHRlc3Q6IFJlZ0V4cCgnXihbMC05XXs0fSktKFswLTldezEsMn0pLShbMC05XXsxLDJ9KScgKyAvLyBZWVlZLU1tLURkXG4gICAgICAgICcoPzonICsgLy8gdGltZSBpcyBvcHRpb25hbFxuICAgICAgICAnKD86dHxUfFsgXFxcXHRdKyknICsgLy8gdCB8IFQgfCB3aGl0ZXNwYWNlXG4gICAgICAgICcoWzAtOV17MSwyfSk6KFswLTldezEsMn0pOihbMC05XXsxLDJ9KFxcXFwuWzAtOV0rKT8pJyArIC8vIEhoOk1tOlNzKC5zcyk/XG4gICAgICAgICcoPzpbIFxcXFx0XSooWnxbLStdWzAxMl0/WzAtOV0oPzo6WzAtOV17Mn0pPykpPycgKyAvLyBaIHwgKzUgfCAtMDM6MzBcbiAgICAgICAgJyk/JCcpLFxuICAgIHJlc29sdmUoc3RyKSB7XG4gICAgICAgIGNvbnN0IG1hdGNoID0gc3RyLm1hdGNoKHRpbWVzdGFtcC50ZXN0KTtcbiAgICAgICAgaWYgKCFtYXRjaClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignISF0aW1lc3RhbXAgZXhwZWN0cyBhIGRhdGUsIHN0YXJ0aW5nIHdpdGggeXl5eS1tbS1kZCcpO1xuICAgICAgICBjb25zdCBbLCB5ZWFyLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZF0gPSBtYXRjaC5tYXAoTnVtYmVyKTtcbiAgICAgICAgY29uc3QgbWlsbGlzZWMgPSBtYXRjaFs3XSA/IE51bWJlcigobWF0Y2hbN10gKyAnMDAnKS5zdWJzdHIoMSwgMykpIDogMDtcbiAgICAgICAgbGV0IGRhdGUgPSBEYXRlLlVUQyh5ZWFyLCBtb250aCAtIDEsIGRheSwgaG91ciB8fCAwLCBtaW51dGUgfHwgMCwgc2Vjb25kIHx8IDAsIG1pbGxpc2VjKTtcbiAgICAgICAgY29uc3QgdHogPSBtYXRjaFs4XTtcbiAgICAgICAgaWYgKHR6ICYmIHR6ICE9PSAnWicpIHtcbiAgICAgICAgICAgIGxldCBkID0gcGFyc2VTZXhhZ2VzaW1hbCh0eiwgZmFsc2UpO1xuICAgICAgICAgICAgaWYgKE1hdGguYWJzKGQpIDwgMzApXG4gICAgICAgICAgICAgICAgZCAqPSA2MDtcbiAgICAgICAgICAgIGRhdGUgLT0gNjAwMDAgKiBkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZShkYXRlKTtcbiAgICB9LFxuICAgIHN0cmluZ2lmeTogKHsgdmFsdWUgfSkgPT4gdmFsdWU/LnRvSVNPU3RyaW5nKCkucmVwbGFjZSgvKFQwMDowMDowMCk/XFwuMDAwWiQvLCAnJykgPz8gJydcbn07XG5cbmV4cG9ydHMuZmxvYXRUaW1lID0gZmxvYXRUaW1lO1xuZXhwb3J0cy5pbnRUaW1lID0gaW50VGltZTtcbmV4cG9ydHMudGltZXN0YW1wID0gdGltZXN0YW1wO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBtYXAgPSByZXF1aXJlKCcuLi9jb21tb24vbWFwLmpzJyk7XG52YXIgX251bGwgPSByZXF1aXJlKCcuLi9jb21tb24vbnVsbC5qcycpO1xudmFyIHNlcSA9IHJlcXVpcmUoJy4uL2NvbW1vbi9zZXEuanMnKTtcbnZhciBzdHJpbmcgPSByZXF1aXJlKCcuLi9jb21tb24vc3RyaW5nLmpzJyk7XG52YXIgYmluYXJ5ID0gcmVxdWlyZSgnLi9iaW5hcnkuanMnKTtcbnZhciBib29sID0gcmVxdWlyZSgnLi9ib29sLmpzJyk7XG52YXIgZmxvYXQgPSByZXF1aXJlKCcuL2Zsb2F0LmpzJyk7XG52YXIgaW50ID0gcmVxdWlyZSgnLi9pbnQuanMnKTtcbnZhciBtZXJnZSA9IHJlcXVpcmUoJy4vbWVyZ2UuanMnKTtcbnZhciBvbWFwID0gcmVxdWlyZSgnLi9vbWFwLmpzJyk7XG52YXIgcGFpcnMgPSByZXF1aXJlKCcuL3BhaXJzLmpzJyk7XG52YXIgc2V0ID0gcmVxdWlyZSgnLi9zZXQuanMnKTtcbnZhciB0aW1lc3RhbXAgPSByZXF1aXJlKCcuL3RpbWVzdGFtcC5qcycpO1xuXG5jb25zdCBzY2hlbWEgPSBbXG4gICAgbWFwLm1hcCxcbiAgICBzZXEuc2VxLFxuICAgIHN0cmluZy5zdHJpbmcsXG4gICAgX251bGwubnVsbFRhZyxcbiAgICBib29sLnRydWVUYWcsXG4gICAgYm9vbC5mYWxzZVRhZyxcbiAgICBpbnQuaW50QmluLFxuICAgIGludC5pbnRPY3QsXG4gICAgaW50LmludCxcbiAgICBpbnQuaW50SGV4LFxuICAgIGZsb2F0LmZsb2F0TmFOLFxuICAgIGZsb2F0LmZsb2F0RXhwLFxuICAgIGZsb2F0LmZsb2F0LFxuICAgIGJpbmFyeS5iaW5hcnksXG4gICAgbWVyZ2UubWVyZ2UsXG4gICAgb21hcC5vbWFwLFxuICAgIHBhaXJzLnBhaXJzLFxuICAgIHNldC5zZXQsXG4gICAgdGltZXN0YW1wLmludFRpbWUsXG4gICAgdGltZXN0YW1wLmZsb2F0VGltZSxcbiAgICB0aW1lc3RhbXAudGltZXN0YW1wXG5dO1xuXG5leHBvcnRzLnNjaGVtYSA9IHNjaGVtYTtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbWFwID0gcmVxdWlyZSgnLi9jb21tb24vbWFwLmpzJyk7XG52YXIgX251bGwgPSByZXF1aXJlKCcuL2NvbW1vbi9udWxsLmpzJyk7XG52YXIgc2VxID0gcmVxdWlyZSgnLi9jb21tb24vc2VxLmpzJyk7XG52YXIgc3RyaW5nID0gcmVxdWlyZSgnLi9jb21tb24vc3RyaW5nLmpzJyk7XG52YXIgYm9vbCA9IHJlcXVpcmUoJy4vY29yZS9ib29sLmpzJyk7XG52YXIgZmxvYXQgPSByZXF1aXJlKCcuL2NvcmUvZmxvYXQuanMnKTtcbnZhciBpbnQgPSByZXF1aXJlKCcuL2NvcmUvaW50LmpzJyk7XG52YXIgc2NoZW1hID0gcmVxdWlyZSgnLi9jb3JlL3NjaGVtYS5qcycpO1xudmFyIHNjaGVtYSQxID0gcmVxdWlyZSgnLi9qc29uL3NjaGVtYS5qcycpO1xudmFyIGJpbmFyeSA9IHJlcXVpcmUoJy4veWFtbC0xLjEvYmluYXJ5LmpzJyk7XG52YXIgbWVyZ2UgPSByZXF1aXJlKCcuL3lhbWwtMS4xL21lcmdlLmpzJyk7XG52YXIgb21hcCA9IHJlcXVpcmUoJy4veWFtbC0xLjEvb21hcC5qcycpO1xudmFyIHBhaXJzID0gcmVxdWlyZSgnLi95YW1sLTEuMS9wYWlycy5qcycpO1xudmFyIHNjaGVtYSQyID0gcmVxdWlyZSgnLi95YW1sLTEuMS9zY2hlbWEuanMnKTtcbnZhciBzZXQgPSByZXF1aXJlKCcuL3lhbWwtMS4xL3NldC5qcycpO1xudmFyIHRpbWVzdGFtcCA9IHJlcXVpcmUoJy4veWFtbC0xLjEvdGltZXN0YW1wLmpzJyk7XG5cbmNvbnN0IHNjaGVtYXMgPSBuZXcgTWFwKFtcbiAgICBbJ2NvcmUnLCBzY2hlbWEuc2NoZW1hXSxcbiAgICBbJ2ZhaWxzYWZlJywgW21hcC5tYXAsIHNlcS5zZXEsIHN0cmluZy5zdHJpbmddXSxcbiAgICBbJ2pzb24nLCBzY2hlbWEkMS5zY2hlbWFdLFxuICAgIFsneWFtbDExJywgc2NoZW1hJDIuc2NoZW1hXSxcbiAgICBbJ3lhbWwtMS4xJywgc2NoZW1hJDIuc2NoZW1hXVxuXSk7XG5jb25zdCB0YWdzQnlOYW1lID0ge1xuICAgIGJpbmFyeTogYmluYXJ5LmJpbmFyeSxcbiAgICBib29sOiBib29sLmJvb2xUYWcsXG4gICAgZmxvYXQ6IGZsb2F0LmZsb2F0LFxuICAgIGZsb2F0RXhwOiBmbG9hdC5mbG9hdEV4cCxcbiAgICBmbG9hdE5hTjogZmxvYXQuZmxvYXROYU4sXG4gICAgZmxvYXRUaW1lOiB0aW1lc3RhbXAuZmxvYXRUaW1lLFxuICAgIGludDogaW50LmludCxcbiAgICBpbnRIZXg6IGludC5pbnRIZXgsXG4gICAgaW50T2N0OiBpbnQuaW50T2N0LFxuICAgIGludFRpbWU6IHRpbWVzdGFtcC5pbnRUaW1lLFxuICAgIG1hcDogbWFwLm1hcCxcbiAgICBtZXJnZTogbWVyZ2UubWVyZ2UsXG4gICAgbnVsbDogX251bGwubnVsbFRhZyxcbiAgICBvbWFwOiBvbWFwLm9tYXAsXG4gICAgcGFpcnM6IHBhaXJzLnBhaXJzLFxuICAgIHNlcTogc2VxLnNlcSxcbiAgICBzZXQ6IHNldC5zZXQsXG4gICAgdGltZXN0YW1wOiB0aW1lc3RhbXAudGltZXN0YW1wXG59O1xuY29uc3QgY29yZUtub3duVGFncyA9IHtcbiAgICAndGFnOnlhbWwub3JnLDIwMDI6YmluYXJ5JzogYmluYXJ5LmJpbmFyeSxcbiAgICAndGFnOnlhbWwub3JnLDIwMDI6bWVyZ2UnOiBtZXJnZS5tZXJnZSxcbiAgICAndGFnOnlhbWwub3JnLDIwMDI6b21hcCc6IG9tYXAub21hcCxcbiAgICAndGFnOnlhbWwub3JnLDIwMDI6cGFpcnMnOiBwYWlycy5wYWlycyxcbiAgICAndGFnOnlhbWwub3JnLDIwMDI6c2V0Jzogc2V0LnNldCxcbiAgICAndGFnOnlhbWwub3JnLDIwMDI6dGltZXN0YW1wJzogdGltZXN0YW1wLnRpbWVzdGFtcFxufTtcbmZ1bmN0aW9uIGdldFRhZ3MoY3VzdG9tVGFncywgc2NoZW1hTmFtZSwgYWRkTWVyZ2VUYWcpIHtcbiAgICBjb25zdCBzY2hlbWFUYWdzID0gc2NoZW1hcy5nZXQoc2NoZW1hTmFtZSk7XG4gICAgaWYgKHNjaGVtYVRhZ3MgJiYgIWN1c3RvbVRhZ3MpIHtcbiAgICAgICAgcmV0dXJuIGFkZE1lcmdlVGFnICYmICFzY2hlbWFUYWdzLmluY2x1ZGVzKG1lcmdlLm1lcmdlKVxuICAgICAgICAgICAgPyBzY2hlbWFUYWdzLmNvbmNhdChtZXJnZS5tZXJnZSlcbiAgICAgICAgICAgIDogc2NoZW1hVGFncy5zbGljZSgpO1xuICAgIH1cbiAgICBsZXQgdGFncyA9IHNjaGVtYVRhZ3M7XG4gICAgaWYgKCF0YWdzKSB7XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KGN1c3RvbVRhZ3MpKVxuICAgICAgICAgICAgdGFncyA9IFtdO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGtleXMgPSBBcnJheS5mcm9tKHNjaGVtYXMua2V5cygpKVxuICAgICAgICAgICAgICAgIC5maWx0ZXIoa2V5ID0+IGtleSAhPT0gJ3lhbWwxMScpXG4gICAgICAgICAgICAgICAgLm1hcChrZXkgPT4gSlNPTi5zdHJpbmdpZnkoa2V5KSlcbiAgICAgICAgICAgICAgICAuam9pbignLCAnKTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBzY2hlbWEgXCIke3NjaGVtYU5hbWV9XCI7IHVzZSBvbmUgb2YgJHtrZXlzfSBvciBkZWZpbmUgY3VzdG9tVGFncyBhcnJheWApO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChBcnJheS5pc0FycmF5KGN1c3RvbVRhZ3MpKSB7XG4gICAgICAgIGZvciAoY29uc3QgdGFnIG9mIGN1c3RvbVRhZ3MpXG4gICAgICAgICAgICB0YWdzID0gdGFncy5jb25jYXQodGFnKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIGN1c3RvbVRhZ3MgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGFncyA9IGN1c3RvbVRhZ3ModGFncy5zbGljZSgpKTtcbiAgICB9XG4gICAgaWYgKGFkZE1lcmdlVGFnKVxuICAgICAgICB0YWdzID0gdGFncy5jb25jYXQobWVyZ2UubWVyZ2UpO1xuICAgIHJldHVybiB0YWdzLnJlZHVjZSgodGFncywgdGFnKSA9PiB7XG4gICAgICAgIGNvbnN0IHRhZ09iaiA9IHR5cGVvZiB0YWcgPT09ICdzdHJpbmcnID8gdGFnc0J5TmFtZVt0YWddIDogdGFnO1xuICAgICAgICBpZiAoIXRhZ09iaikge1xuICAgICAgICAgICAgY29uc3QgdGFnTmFtZSA9IEpTT04uc3RyaW5naWZ5KHRhZyk7XG4gICAgICAgICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXModGFnc0J5TmFtZSlcbiAgICAgICAgICAgICAgICAubWFwKGtleSA9PiBKU09OLnN0cmluZ2lmeShrZXkpKVxuICAgICAgICAgICAgICAgIC5qb2luKCcsICcpO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIGN1c3RvbSB0YWcgJHt0YWdOYW1lfTsgdXNlIG9uZSBvZiAke2tleXN9YCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0YWdzLmluY2x1ZGVzKHRhZ09iaikpXG4gICAgICAgICAgICB0YWdzLnB1c2godGFnT2JqKTtcbiAgICAgICAgcmV0dXJuIHRhZ3M7XG4gICAgfSwgW10pO1xufVxuXG5leHBvcnRzLmNvcmVLbm93blRhZ3MgPSBjb3JlS25vd25UYWdzO1xuZXhwb3J0cy5nZXRUYWdzID0gZ2V0VGFncztcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuLi9ub2Rlcy9pZGVudGl0eS5qcycpO1xudmFyIG1hcCA9IHJlcXVpcmUoJy4vY29tbW9uL21hcC5qcycpO1xudmFyIHNlcSA9IHJlcXVpcmUoJy4vY29tbW9uL3NlcS5qcycpO1xudmFyIHN0cmluZyA9IHJlcXVpcmUoJy4vY29tbW9uL3N0cmluZy5qcycpO1xudmFyIHRhZ3MgPSByZXF1aXJlKCcuL3RhZ3MuanMnKTtcblxuY29uc3Qgc29ydE1hcEVudHJpZXNCeUtleSA9IChhLCBiKSA9PiBhLmtleSA8IGIua2V5ID8gLTEgOiBhLmtleSA+IGIua2V5ID8gMSA6IDA7XG5jbGFzcyBTY2hlbWEge1xuICAgIGNvbnN0cnVjdG9yKHsgY29tcGF0LCBjdXN0b21UYWdzLCBtZXJnZSwgcmVzb2x2ZUtub3duVGFncywgc2NoZW1hLCBzb3J0TWFwRW50cmllcywgdG9TdHJpbmdEZWZhdWx0cyB9KSB7XG4gICAgICAgIHRoaXMuY29tcGF0ID0gQXJyYXkuaXNBcnJheShjb21wYXQpXG4gICAgICAgICAgICA/IHRhZ3MuZ2V0VGFncyhjb21wYXQsICdjb21wYXQnKVxuICAgICAgICAgICAgOiBjb21wYXRcbiAgICAgICAgICAgICAgICA/IHRhZ3MuZ2V0VGFncyhudWxsLCBjb21wYXQpXG4gICAgICAgICAgICAgICAgOiBudWxsO1xuICAgICAgICB0aGlzLm5hbWUgPSAodHlwZW9mIHNjaGVtYSA9PT0gJ3N0cmluZycgJiYgc2NoZW1hKSB8fCAnY29yZSc7XG4gICAgICAgIHRoaXMua25vd25UYWdzID0gcmVzb2x2ZUtub3duVGFncyA/IHRhZ3MuY29yZUtub3duVGFncyA6IHt9O1xuICAgICAgICB0aGlzLnRhZ3MgPSB0YWdzLmdldFRhZ3MoY3VzdG9tVGFncywgdGhpcy5uYW1lLCBtZXJnZSk7XG4gICAgICAgIHRoaXMudG9TdHJpbmdPcHRpb25zID0gdG9TdHJpbmdEZWZhdWx0cyA/PyBudWxsO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgaWRlbnRpdHkuTUFQLCB7IHZhbHVlOiBtYXAubWFwIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgaWRlbnRpdHkuU0NBTEFSLCB7IHZhbHVlOiBzdHJpbmcuc3RyaW5nIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgaWRlbnRpdHkuU0VRLCB7IHZhbHVlOiBzZXEuc2VxIH0pO1xuICAgICAgICAvLyBVc2VkIGJ5IGNyZWF0ZU1hcCgpXG4gICAgICAgIHRoaXMuc29ydE1hcEVudHJpZXMgPVxuICAgICAgICAgICAgdHlwZW9mIHNvcnRNYXBFbnRyaWVzID09PSAnZnVuY3Rpb24nXG4gICAgICAgICAgICAgICAgPyBzb3J0TWFwRW50cmllc1xuICAgICAgICAgICAgICAgIDogc29ydE1hcEVudHJpZXMgPT09IHRydWVcbiAgICAgICAgICAgICAgICAgICAgPyBzb3J0TWFwRW50cmllc0J5S2V5XG4gICAgICAgICAgICAgICAgICAgIDogbnVsbDtcbiAgICB9XG4gICAgY2xvbmUoKSB7XG4gICAgICAgIGNvbnN0IGNvcHkgPSBPYmplY3QuY3JlYXRlKFNjaGVtYS5wcm90b3R5cGUsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHRoaXMpKTtcbiAgICAgICAgY29weS50YWdzID0gdGhpcy50YWdzLnNsaWNlKCk7XG4gICAgICAgIHJldHVybiBjb3B5O1xuICAgIH1cbn1cblxuZXhwb3J0cy5TY2hlbWEgPSBTY2hlbWE7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIGlkZW50aXR5ID0gcmVxdWlyZSgnLi4vbm9kZXMvaWRlbnRpdHkuanMnKTtcbnZhciBzdHJpbmdpZnkgPSByZXF1aXJlKCcuL3N0cmluZ2lmeS5qcycpO1xudmFyIHN0cmluZ2lmeUNvbW1lbnQgPSByZXF1aXJlKCcuL3N0cmluZ2lmeUNvbW1lbnQuanMnKTtcblxuZnVuY3Rpb24gc3RyaW5naWZ5RG9jdW1lbnQoZG9jLCBvcHRpb25zKSB7XG4gICAgY29uc3QgbGluZXMgPSBbXTtcbiAgICBsZXQgaGFzRGlyZWN0aXZlcyA9IG9wdGlvbnMuZGlyZWN0aXZlcyA9PT0gdHJ1ZTtcbiAgICBpZiAob3B0aW9ucy5kaXJlY3RpdmVzICE9PSBmYWxzZSAmJiBkb2MuZGlyZWN0aXZlcykge1xuICAgICAgICBjb25zdCBkaXIgPSBkb2MuZGlyZWN0aXZlcy50b1N0cmluZyhkb2MpO1xuICAgICAgICBpZiAoZGlyKSB7XG4gICAgICAgICAgICBsaW5lcy5wdXNoKGRpcik7XG4gICAgICAgICAgICBoYXNEaXJlY3RpdmVzID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChkb2MuZGlyZWN0aXZlcy5kb2NTdGFydClcbiAgICAgICAgICAgIGhhc0RpcmVjdGl2ZXMgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAoaGFzRGlyZWN0aXZlcylcbiAgICAgICAgbGluZXMucHVzaCgnLS0tJyk7XG4gICAgY29uc3QgY3R4ID0gc3RyaW5naWZ5LmNyZWF0ZVN0cmluZ2lmeUNvbnRleHQoZG9jLCBvcHRpb25zKTtcbiAgICBjb25zdCB7IGNvbW1lbnRTdHJpbmcgfSA9IGN0eC5vcHRpb25zO1xuICAgIGlmIChkb2MuY29tbWVudEJlZm9yZSkge1xuICAgICAgICBpZiAobGluZXMubGVuZ3RoICE9PSAxKVxuICAgICAgICAgICAgbGluZXMudW5zaGlmdCgnJyk7XG4gICAgICAgIGNvbnN0IGNzID0gY29tbWVudFN0cmluZyhkb2MuY29tbWVudEJlZm9yZSk7XG4gICAgICAgIGxpbmVzLnVuc2hpZnQoc3RyaW5naWZ5Q29tbWVudC5pbmRlbnRDb21tZW50KGNzLCAnJykpO1xuICAgIH1cbiAgICBsZXQgY2hvbXBLZWVwID0gZmFsc2U7XG4gICAgbGV0IGNvbnRlbnRDb21tZW50ID0gbnVsbDtcbiAgICBpZiAoZG9jLmNvbnRlbnRzKSB7XG4gICAgICAgIGlmIChpZGVudGl0eS5pc05vZGUoZG9jLmNvbnRlbnRzKSkge1xuICAgICAgICAgICAgaWYgKGRvYy5jb250ZW50cy5zcGFjZUJlZm9yZSAmJiBoYXNEaXJlY3RpdmVzKVxuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goJycpO1xuICAgICAgICAgICAgaWYgKGRvYy5jb250ZW50cy5jb21tZW50QmVmb3JlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY3MgPSBjb21tZW50U3RyaW5nKGRvYy5jb250ZW50cy5jb21tZW50QmVmb3JlKTtcbiAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKHN0cmluZ2lmeUNvbW1lbnQuaW5kZW50Q29tbWVudChjcywgJycpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHRvcC1sZXZlbCBibG9jayBzY2FsYXJzIG5lZWQgdG8gYmUgaW5kZW50ZWQgaWYgZm9sbG93ZWQgYnkgYSBjb21tZW50XG4gICAgICAgICAgICBjdHguZm9yY2VCbG9ja0luZGVudCA9ICEhZG9jLmNvbW1lbnQ7XG4gICAgICAgICAgICBjb250ZW50Q29tbWVudCA9IGRvYy5jb250ZW50cy5jb21tZW50O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG9uQ2hvbXBLZWVwID0gY29udGVudENvbW1lbnQgPyB1bmRlZmluZWQgOiAoKSA9PiAoY2hvbXBLZWVwID0gdHJ1ZSk7XG4gICAgICAgIGxldCBib2R5ID0gc3RyaW5naWZ5LnN0cmluZ2lmeShkb2MuY29udGVudHMsIGN0eCwgKCkgPT4gKGNvbnRlbnRDb21tZW50ID0gbnVsbCksIG9uQ2hvbXBLZWVwKTtcbiAgICAgICAgaWYgKGNvbnRlbnRDb21tZW50KVxuICAgICAgICAgICAgYm9keSArPSBzdHJpbmdpZnlDb21tZW50LmxpbmVDb21tZW50KGJvZHksICcnLCBjb21tZW50U3RyaW5nKGNvbnRlbnRDb21tZW50KSk7XG4gICAgICAgIGlmICgoYm9keVswXSA9PT0gJ3wnIHx8IGJvZHlbMF0gPT09ICc+JykgJiZcbiAgICAgICAgICAgIGxpbmVzW2xpbmVzLmxlbmd0aCAtIDFdID09PSAnLS0tJykge1xuICAgICAgICAgICAgLy8gVG9wLWxldmVsIGJsb2NrIHNjYWxhcnMgd2l0aCBhIHByZWNlZGluZyBkb2MgbWFya2VyIG91Z2h0IHRvIHVzZSB0aGVcbiAgICAgICAgICAgIC8vIHNhbWUgbGluZSBmb3IgdGhlaXIgaGVhZGVyLlxuICAgICAgICAgICAgbGluZXNbbGluZXMubGVuZ3RoIC0gMV0gPSBgLS0tICR7Ym9keX1gO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGxpbmVzLnB1c2goYm9keSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBsaW5lcy5wdXNoKHN0cmluZ2lmeS5zdHJpbmdpZnkoZG9jLmNvbnRlbnRzLCBjdHgpKTtcbiAgICB9XG4gICAgaWYgKGRvYy5kaXJlY3RpdmVzPy5kb2NFbmQpIHtcbiAgICAgICAgaWYgKGRvYy5jb21tZW50KSB7XG4gICAgICAgICAgICBjb25zdCBjcyA9IGNvbW1lbnRTdHJpbmcoZG9jLmNvbW1lbnQpO1xuICAgICAgICAgICAgaWYgKGNzLmluY2x1ZGVzKCdcXG4nKSkge1xuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goJy4uLicpO1xuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goc3RyaW5naWZ5Q29tbWVudC5pbmRlbnRDb21tZW50KGNzLCAnJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgbGluZXMucHVzaChgLi4uICR7Y3N9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsaW5lcy5wdXNoKCcuLi4nKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgbGV0IGRjID0gZG9jLmNvbW1lbnQ7XG4gICAgICAgIGlmIChkYyAmJiBjaG9tcEtlZXApXG4gICAgICAgICAgICBkYyA9IGRjLnJlcGxhY2UoL15cXG4rLywgJycpO1xuICAgICAgICBpZiAoZGMpIHtcbiAgICAgICAgICAgIGlmICgoIWNob21wS2VlcCB8fCBjb250ZW50Q29tbWVudCkgJiYgbGluZXNbbGluZXMubGVuZ3RoIC0gMV0gIT09ICcnKVxuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goJycpO1xuICAgICAgICAgICAgbGluZXMucHVzaChzdHJpbmdpZnlDb21tZW50LmluZGVudENvbW1lbnQoY29tbWVudFN0cmluZyhkYyksICcnKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpICsgJ1xcbic7XG59XG5cbmV4cG9ydHMuc3RyaW5naWZ5RG9jdW1lbnQgPSBzdHJpbmdpZnlEb2N1bWVudDtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQWxpYXMgPSByZXF1aXJlKCcuLi9ub2Rlcy9BbGlhcy5qcycpO1xudmFyIENvbGxlY3Rpb24gPSByZXF1aXJlKCcuLi9ub2Rlcy9Db2xsZWN0aW9uLmpzJyk7XG52YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuLi9ub2Rlcy9pZGVudGl0eS5qcycpO1xudmFyIFBhaXIgPSByZXF1aXJlKCcuLi9ub2Rlcy9QYWlyLmpzJyk7XG52YXIgdG9KUyA9IHJlcXVpcmUoJy4uL25vZGVzL3RvSlMuanMnKTtcbnZhciBTY2hlbWEgPSByZXF1aXJlKCcuLi9zY2hlbWEvU2NoZW1hLmpzJyk7XG52YXIgc3RyaW5naWZ5RG9jdW1lbnQgPSByZXF1aXJlKCcuLi9zdHJpbmdpZnkvc3RyaW5naWZ5RG9jdW1lbnQuanMnKTtcbnZhciBhbmNob3JzID0gcmVxdWlyZSgnLi9hbmNob3JzLmpzJyk7XG52YXIgYXBwbHlSZXZpdmVyID0gcmVxdWlyZSgnLi9hcHBseVJldml2ZXIuanMnKTtcbnZhciBjcmVhdGVOb2RlID0gcmVxdWlyZSgnLi9jcmVhdGVOb2RlLmpzJyk7XG52YXIgZGlyZWN0aXZlcyA9IHJlcXVpcmUoJy4vZGlyZWN0aXZlcy5qcycpO1xuXG5jbGFzcyBEb2N1bWVudCB7XG4gICAgY29uc3RydWN0b3IodmFsdWUsIHJlcGxhY2VyLCBvcHRpb25zKSB7XG4gICAgICAgIC8qKiBBIGNvbW1lbnQgYmVmb3JlIHRoaXMgRG9jdW1lbnQgKi9cbiAgICAgICAgdGhpcy5jb21tZW50QmVmb3JlID0gbnVsbDtcbiAgICAgICAgLyoqIEEgY29tbWVudCBpbW1lZGlhdGVseSBhZnRlciB0aGlzIERvY3VtZW50ICovXG4gICAgICAgIHRoaXMuY29tbWVudCA9IG51bGw7XG4gICAgICAgIC8qKiBFcnJvcnMgZW5jb3VudGVyZWQgZHVyaW5nIHBhcnNpbmcuICovXG4gICAgICAgIHRoaXMuZXJyb3JzID0gW107XG4gICAgICAgIC8qKiBXYXJuaW5ncyBlbmNvdW50ZXJlZCBkdXJpbmcgcGFyc2luZy4gKi9cbiAgICAgICAgdGhpcy53YXJuaW5ncyA9IFtdO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgaWRlbnRpdHkuTk9ERV9UWVBFLCB7IHZhbHVlOiBpZGVudGl0eS5ET0MgfSk7XG4gICAgICAgIGxldCBfcmVwbGFjZXIgPSBudWxsO1xuICAgICAgICBpZiAodHlwZW9mIHJlcGxhY2VyID09PSAnZnVuY3Rpb24nIHx8IEFycmF5LmlzQXJyYXkocmVwbGFjZXIpKSB7XG4gICAgICAgICAgICBfcmVwbGFjZXIgPSByZXBsYWNlcjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChvcHRpb25zID09PSB1bmRlZmluZWQgJiYgcmVwbGFjZXIpIHtcbiAgICAgICAgICAgIG9wdGlvbnMgPSByZXBsYWNlcjtcbiAgICAgICAgICAgIHJlcGxhY2VyID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG9wdCA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgICAgICAgaW50QXNCaWdJbnQ6IGZhbHNlLFxuICAgICAgICAgICAga2VlcFNvdXJjZVRva2VuczogZmFsc2UsXG4gICAgICAgICAgICBsb2dMZXZlbDogJ3dhcm4nLFxuICAgICAgICAgICAgcHJldHR5RXJyb3JzOiB0cnVlLFxuICAgICAgICAgICAgc3RyaWN0OiB0cnVlLFxuICAgICAgICAgICAgc3RyaW5nS2V5czogZmFsc2UsXG4gICAgICAgICAgICB1bmlxdWVLZXlzOiB0cnVlLFxuICAgICAgICAgICAgdmVyc2lvbjogJzEuMidcbiAgICAgICAgfSwgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdDtcbiAgICAgICAgbGV0IHsgdmVyc2lvbiB9ID0gb3B0O1xuICAgICAgICBpZiAob3B0aW9ucz8uX2RpcmVjdGl2ZXMpIHtcbiAgICAgICAgICAgIHRoaXMuZGlyZWN0aXZlcyA9IG9wdGlvbnMuX2RpcmVjdGl2ZXMuYXREb2N1bWVudCgpO1xuICAgICAgICAgICAgaWYgKHRoaXMuZGlyZWN0aXZlcy55YW1sLmV4cGxpY2l0KVxuICAgICAgICAgICAgICAgIHZlcnNpb24gPSB0aGlzLmRpcmVjdGl2ZXMueWFtbC52ZXJzaW9uO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMuZGlyZWN0aXZlcyA9IG5ldyBkaXJlY3RpdmVzLkRpcmVjdGl2ZXMoeyB2ZXJzaW9uIH0pO1xuICAgICAgICB0aGlzLnNldFNjaGVtYSh2ZXJzaW9uLCBvcHRpb25zKTtcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBXZSBjYW4ndCByZWFsbHkga25vdyB0aGF0IHRoaXMgbWF0Y2hlcyBDb250ZW50cy5cbiAgICAgICAgdGhpcy5jb250ZW50cyA9XG4gICAgICAgICAgICB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IHRoaXMuY3JlYXRlTm9kZSh2YWx1ZSwgX3JlcGxhY2VyLCBvcHRpb25zKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgZGVlcCBjb3B5IG9mIHRoaXMgRG9jdW1lbnQgYW5kIGl0cyBjb250ZW50cy5cbiAgICAgKlxuICAgICAqIEN1c3RvbSBOb2RlIHZhbHVlcyB0aGF0IGluaGVyaXQgZnJvbSBgT2JqZWN0YCBzdGlsbCByZWZlciB0byB0aGVpciBvcmlnaW5hbCBpbnN0YW5jZXMuXG4gICAgICovXG4gICAgY2xvbmUoKSB7XG4gICAgICAgIGNvbnN0IGNvcHkgPSBPYmplY3QuY3JlYXRlKERvY3VtZW50LnByb3RvdHlwZSwge1xuICAgICAgICAgICAgW2lkZW50aXR5Lk5PREVfVFlQRV06IHsgdmFsdWU6IGlkZW50aXR5LkRPQyB9XG4gICAgICAgIH0pO1xuICAgICAgICBjb3B5LmNvbW1lbnRCZWZvcmUgPSB0aGlzLmNvbW1lbnRCZWZvcmU7XG4gICAgICAgIGNvcHkuY29tbWVudCA9IHRoaXMuY29tbWVudDtcbiAgICAgICAgY29weS5lcnJvcnMgPSB0aGlzLmVycm9ycy5zbGljZSgpO1xuICAgICAgICBjb3B5Lndhcm5pbmdzID0gdGhpcy53YXJuaW5ncy5zbGljZSgpO1xuICAgICAgICBjb3B5Lm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLm9wdGlvbnMpO1xuICAgICAgICBpZiAodGhpcy5kaXJlY3RpdmVzKVxuICAgICAgICAgICAgY29weS5kaXJlY3RpdmVzID0gdGhpcy5kaXJlY3RpdmVzLmNsb25lKCk7XG4gICAgICAgIGNvcHkuc2NoZW1hID0gdGhpcy5zY2hlbWEuY2xvbmUoKTtcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBXZSBjYW4ndCByZWFsbHkga25vdyB0aGF0IHRoaXMgbWF0Y2hlcyBDb250ZW50cy5cbiAgICAgICAgY29weS5jb250ZW50cyA9IGlkZW50aXR5LmlzTm9kZSh0aGlzLmNvbnRlbnRzKVxuICAgICAgICAgICAgPyB0aGlzLmNvbnRlbnRzLmNsb25lKGNvcHkuc2NoZW1hKVxuICAgICAgICAgICAgOiB0aGlzLmNvbnRlbnRzO1xuICAgICAgICBpZiAodGhpcy5yYW5nZSlcbiAgICAgICAgICAgIGNvcHkucmFuZ2UgPSB0aGlzLnJhbmdlLnNsaWNlKCk7XG4gICAgICAgIHJldHVybiBjb3B5O1xuICAgIH1cbiAgICAvKiogQWRkcyBhIHZhbHVlIHRvIHRoZSBkb2N1bWVudC4gKi9cbiAgICBhZGQodmFsdWUpIHtcbiAgICAgICAgaWYgKGFzc2VydENvbGxlY3Rpb24odGhpcy5jb250ZW50cykpXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRzLmFkZCh2YWx1ZSk7XG4gICAgfVxuICAgIC8qKiBBZGRzIGEgdmFsdWUgdG8gdGhlIGRvY3VtZW50LiAqL1xuICAgIGFkZEluKHBhdGgsIHZhbHVlKSB7XG4gICAgICAgIGlmIChhc3NlcnRDb2xsZWN0aW9uKHRoaXMuY29udGVudHMpKVxuICAgICAgICAgICAgdGhpcy5jb250ZW50cy5hZGRJbihwYXRoLCB2YWx1ZSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBgQWxpYXNgIG5vZGUsIGVuc3VyaW5nIHRoYXQgdGhlIHRhcmdldCBgbm9kZWAgaGFzIHRoZSByZXF1aXJlZCBhbmNob3IuXG4gICAgICpcbiAgICAgKiBJZiBgbm9kZWAgYWxyZWFkeSBoYXMgYW4gYW5jaG9yLCBgbmFtZWAgaXMgaWdub3JlZC5cbiAgICAgKiBPdGhlcndpc2UsIHRoZSBgbm9kZS5hbmNob3JgIHZhbHVlIHdpbGwgYmUgc2V0IHRvIGBuYW1lYCxcbiAgICAgKiBvciBpZiBhbiBhbmNob3Igd2l0aCB0aGF0IG5hbWUgaXMgYWxyZWFkeSBwcmVzZW50IGluIHRoZSBkb2N1bWVudCxcbiAgICAgKiBgbmFtZWAgd2lsbCBiZSB1c2VkIGFzIGEgcHJlZml4IGZvciBhIG5ldyB1bmlxdWUgYW5jaG9yLlxuICAgICAqIElmIGBuYW1lYCBpcyB1bmRlZmluZWQsIHRoZSBnZW5lcmF0ZWQgYW5jaG9yIHdpbGwgdXNlICdhJyBhcyBhIHByZWZpeC5cbiAgICAgKi9cbiAgICBjcmVhdGVBbGlhcyhub2RlLCBuYW1lKSB7XG4gICAgICAgIGlmICghbm9kZS5hbmNob3IpIHtcbiAgICAgICAgICAgIGNvbnN0IHByZXYgPSBhbmNob3JzLmFuY2hvck5hbWVzKHRoaXMpO1xuICAgICAgICAgICAgbm9kZS5hbmNob3IgPVxuICAgICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvcHJlZmVyLW51bGxpc2gtY29hbGVzY2luZ1xuICAgICAgICAgICAgICAgICFuYW1lIHx8IHByZXYuaGFzKG5hbWUpID8gYW5jaG9ycy5maW5kTmV3QW5jaG9yKG5hbWUgfHwgJ2EnLCBwcmV2KSA6IG5hbWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBBbGlhcy5BbGlhcyhub2RlLmFuY2hvcik7XG4gICAgfVxuICAgIGNyZWF0ZU5vZGUodmFsdWUsIHJlcGxhY2VyLCBvcHRpb25zKSB7XG4gICAgICAgIGxldCBfcmVwbGFjZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmICh0eXBlb2YgcmVwbGFjZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHZhbHVlID0gcmVwbGFjZXIuY2FsbCh7ICcnOiB2YWx1ZSB9LCAnJywgdmFsdWUpO1xuICAgICAgICAgICAgX3JlcGxhY2VyID0gcmVwbGFjZXI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheShyZXBsYWNlcikpIHtcbiAgICAgICAgICAgIGNvbnN0IGtleVRvU3RyID0gKHYpID0+IHR5cGVvZiB2ID09PSAnbnVtYmVyJyB8fCB2IGluc3RhbmNlb2YgU3RyaW5nIHx8IHYgaW5zdGFuY2VvZiBOdW1iZXI7XG4gICAgICAgICAgICBjb25zdCBhc1N0ciA9IHJlcGxhY2VyLmZpbHRlcihrZXlUb1N0cikubWFwKFN0cmluZyk7XG4gICAgICAgICAgICBpZiAoYXNTdHIubGVuZ3RoID4gMClcbiAgICAgICAgICAgICAgICByZXBsYWNlciA9IHJlcGxhY2VyLmNvbmNhdChhc1N0cik7XG4gICAgICAgICAgICBfcmVwbGFjZXIgPSByZXBsYWNlcjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChvcHRpb25zID09PSB1bmRlZmluZWQgJiYgcmVwbGFjZXIpIHtcbiAgICAgICAgICAgIG9wdGlvbnMgPSByZXBsYWNlcjtcbiAgICAgICAgICAgIHJlcGxhY2VyID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHsgYWxpYXNEdXBsaWNhdGVPYmplY3RzLCBhbmNob3JQcmVmaXgsIGZsb3csIGtlZXBVbmRlZmluZWQsIG9uVGFnT2JqLCB0YWcgfSA9IG9wdGlvbnMgPz8ge307XG4gICAgICAgIGNvbnN0IHsgb25BbmNob3IsIHNldEFuY2hvcnMsIHNvdXJjZU9iamVjdHMgfSA9IGFuY2hvcnMuY3JlYXRlTm9kZUFuY2hvcnModGhpcywgXG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvcHJlZmVyLW51bGxpc2gtY29hbGVzY2luZ1xuICAgICAgICBhbmNob3JQcmVmaXggfHwgJ2EnKTtcbiAgICAgICAgY29uc3QgY3R4ID0ge1xuICAgICAgICAgICAgYWxpYXNEdXBsaWNhdGVPYmplY3RzOiBhbGlhc0R1cGxpY2F0ZU9iamVjdHMgPz8gdHJ1ZSxcbiAgICAgICAgICAgIGtlZXBVbmRlZmluZWQ6IGtlZXBVbmRlZmluZWQgPz8gZmFsc2UsXG4gICAgICAgICAgICBvbkFuY2hvcixcbiAgICAgICAgICAgIG9uVGFnT2JqLFxuICAgICAgICAgICAgcmVwbGFjZXI6IF9yZXBsYWNlcixcbiAgICAgICAgICAgIHNjaGVtYTogdGhpcy5zY2hlbWEsXG4gICAgICAgICAgICBzb3VyY2VPYmplY3RzXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IG5vZGUgPSBjcmVhdGVOb2RlLmNyZWF0ZU5vZGUodmFsdWUsIHRhZywgY3R4KTtcbiAgICAgICAgaWYgKGZsb3cgJiYgaWRlbnRpdHkuaXNDb2xsZWN0aW9uKG5vZGUpKVxuICAgICAgICAgICAgbm9kZS5mbG93ID0gdHJ1ZTtcbiAgICAgICAgc2V0QW5jaG9ycygpO1xuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ29udmVydCBhIGtleSBhbmQgYSB2YWx1ZSBpbnRvIGEgYFBhaXJgIHVzaW5nIHRoZSBjdXJyZW50IHNjaGVtYSxcbiAgICAgKiByZWN1cnNpdmVseSB3cmFwcGluZyBhbGwgdmFsdWVzIGFzIGBTY2FsYXJgIG9yIGBDb2xsZWN0aW9uYCBub2Rlcy5cbiAgICAgKi9cbiAgICBjcmVhdGVQYWlyKGtleSwgdmFsdWUsIG9wdGlvbnMgPSB7fSkge1xuICAgICAgICBjb25zdCBrID0gdGhpcy5jcmVhdGVOb2RlKGtleSwgbnVsbCwgb3B0aW9ucyk7XG4gICAgICAgIGNvbnN0IHYgPSB0aGlzLmNyZWF0ZU5vZGUodmFsdWUsIG51bGwsIG9wdGlvbnMpO1xuICAgICAgICByZXR1cm4gbmV3IFBhaXIuUGFpcihrLCB2KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhIHZhbHVlIGZyb20gdGhlIGRvY3VtZW50LlxuICAgICAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgaXRlbSB3YXMgZm91bmQgYW5kIHJlbW92ZWQuXG4gICAgICovXG4gICAgZGVsZXRlKGtleSkge1xuICAgICAgICByZXR1cm4gYXNzZXJ0Q29sbGVjdGlvbih0aGlzLmNvbnRlbnRzKSA/IHRoaXMuY29udGVudHMuZGVsZXRlKGtleSkgOiBmYWxzZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhIHZhbHVlIGZyb20gdGhlIGRvY3VtZW50LlxuICAgICAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgaXRlbSB3YXMgZm91bmQgYW5kIHJlbW92ZWQuXG4gICAgICovXG4gICAgZGVsZXRlSW4ocGF0aCkge1xuICAgICAgICBpZiAoQ29sbGVjdGlvbi5pc0VtcHR5UGF0aChwYXRoKSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuY29udGVudHMgPT0gbnVsbClcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFByZXN1bWVkIGltcG9zc2libGUgaWYgU3RyaWN0IGV4dGVuZHMgZmFsc2VcbiAgICAgICAgICAgIHRoaXMuY29udGVudHMgPSBudWxsO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFzc2VydENvbGxlY3Rpb24odGhpcy5jb250ZW50cylcbiAgICAgICAgICAgID8gdGhpcy5jb250ZW50cy5kZWxldGVJbihwYXRoKVxuICAgICAgICAgICAgOiBmYWxzZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmV0dXJucyBpdGVtIGF0IGBrZXlgLCBvciBgdW5kZWZpbmVkYCBpZiBub3QgZm91bmQuIEJ5IGRlZmF1bHQgdW53cmFwc1xuICAgICAqIHNjYWxhciB2YWx1ZXMgZnJvbSB0aGVpciBzdXJyb3VuZGluZyBub2RlOyB0byBkaXNhYmxlIHNldCBga2VlcFNjYWxhcmAgdG9cbiAgICAgKiBgdHJ1ZWAgKGNvbGxlY3Rpb25zIGFyZSBhbHdheXMgcmV0dXJuZWQgaW50YWN0KS5cbiAgICAgKi9cbiAgICBnZXQoa2V5LCBrZWVwU2NhbGFyKSB7XG4gICAgICAgIHJldHVybiBpZGVudGl0eS5pc0NvbGxlY3Rpb24odGhpcy5jb250ZW50cylcbiAgICAgICAgICAgID8gdGhpcy5jb250ZW50cy5nZXQoa2V5LCBrZWVwU2NhbGFyKVxuICAgICAgICAgICAgOiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJldHVybnMgaXRlbSBhdCBgcGF0aGAsIG9yIGB1bmRlZmluZWRgIGlmIG5vdCBmb3VuZC4gQnkgZGVmYXVsdCB1bndyYXBzXG4gICAgICogc2NhbGFyIHZhbHVlcyBmcm9tIHRoZWlyIHN1cnJvdW5kaW5nIG5vZGU7IHRvIGRpc2FibGUgc2V0IGBrZWVwU2NhbGFyYCB0b1xuICAgICAqIGB0cnVlYCAoY29sbGVjdGlvbnMgYXJlIGFsd2F5cyByZXR1cm5lZCBpbnRhY3QpLlxuICAgICAqL1xuICAgIGdldEluKHBhdGgsIGtlZXBTY2FsYXIpIHtcbiAgICAgICAgaWYgKENvbGxlY3Rpb24uaXNFbXB0eVBhdGgocGF0aCkpXG4gICAgICAgICAgICByZXR1cm4gIWtlZXBTY2FsYXIgJiYgaWRlbnRpdHkuaXNTY2FsYXIodGhpcy5jb250ZW50cylcbiAgICAgICAgICAgICAgICA/IHRoaXMuY29udGVudHMudmFsdWVcbiAgICAgICAgICAgICAgICA6IHRoaXMuY29udGVudHM7XG4gICAgICAgIHJldHVybiBpZGVudGl0eS5pc0NvbGxlY3Rpb24odGhpcy5jb250ZW50cylcbiAgICAgICAgICAgID8gdGhpcy5jb250ZW50cy5nZXRJbihwYXRoLCBrZWVwU2NhbGFyKVxuICAgICAgICAgICAgOiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiB0aGUgZG9jdW1lbnQgaW5jbHVkZXMgYSB2YWx1ZSB3aXRoIHRoZSBrZXkgYGtleWAuXG4gICAgICovXG4gICAgaGFzKGtleSkge1xuICAgICAgICByZXR1cm4gaWRlbnRpdHkuaXNDb2xsZWN0aW9uKHRoaXMuY29udGVudHMpID8gdGhpcy5jb250ZW50cy5oYXMoa2V5KSA6IGZhbHNlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgdGhlIGRvY3VtZW50IGluY2x1ZGVzIGEgdmFsdWUgYXQgYHBhdGhgLlxuICAgICAqL1xuICAgIGhhc0luKHBhdGgpIHtcbiAgICAgICAgaWYgKENvbGxlY3Rpb24uaXNFbXB0eVBhdGgocGF0aCkpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb250ZW50cyAhPT0gdW5kZWZpbmVkO1xuICAgICAgICByZXR1cm4gaWRlbnRpdHkuaXNDb2xsZWN0aW9uKHRoaXMuY29udGVudHMpID8gdGhpcy5jb250ZW50cy5oYXNJbihwYXRoKSA6IGZhbHNlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXRzIGEgdmFsdWUgaW4gdGhpcyBkb2N1bWVudC4gRm9yIGAhIXNldGAsIGB2YWx1ZWAgbmVlZHMgdG8gYmUgYVxuICAgICAqIGJvb2xlYW4gdG8gYWRkL3JlbW92ZSB0aGUgaXRlbSBmcm9tIHRoZSBzZXQuXG4gICAgICovXG4gICAgc2V0KGtleSwgdmFsdWUpIHtcbiAgICAgICAgaWYgKHRoaXMuY29udGVudHMgPT0gbnVsbCkge1xuICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBXZSBjYW4ndCByZWFsbHkga25vdyB0aGF0IHRoaXMgbWF0Y2hlcyBDb250ZW50cy5cbiAgICAgICAgICAgIHRoaXMuY29udGVudHMgPSBDb2xsZWN0aW9uLmNvbGxlY3Rpb25Gcm9tUGF0aCh0aGlzLnNjaGVtYSwgW2tleV0sIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChhc3NlcnRDb2xsZWN0aW9uKHRoaXMuY29udGVudHMpKSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRzLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXRzIGEgdmFsdWUgaW4gdGhpcyBkb2N1bWVudC4gRm9yIGAhIXNldGAsIGB2YWx1ZWAgbmVlZHMgdG8gYmUgYVxuICAgICAqIGJvb2xlYW4gdG8gYWRkL3JlbW92ZSB0aGUgaXRlbSBmcm9tIHRoZSBzZXQuXG4gICAgICovXG4gICAgc2V0SW4ocGF0aCwgdmFsdWUpIHtcbiAgICAgICAgaWYgKENvbGxlY3Rpb24uaXNFbXB0eVBhdGgocGF0aCkpIHtcbiAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgV2UgY2FuJ3QgcmVhbGx5IGtub3cgdGhhdCB0aGlzIG1hdGNoZXMgQ29udGVudHMuXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRzID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGhpcy5jb250ZW50cyA9PSBudWxsKSB7XG4gICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFdlIGNhbid0IHJlYWxseSBrbm93IHRoYXQgdGhpcyBtYXRjaGVzIENvbnRlbnRzLlxuICAgICAgICAgICAgdGhpcy5jb250ZW50cyA9IENvbGxlY3Rpb24uY29sbGVjdGlvbkZyb21QYXRoKHRoaXMuc2NoZW1hLCBBcnJheS5mcm9tKHBhdGgpLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYXNzZXJ0Q29sbGVjdGlvbih0aGlzLmNvbnRlbnRzKSkge1xuICAgICAgICAgICAgdGhpcy5jb250ZW50cy5zZXRJbihwYXRoLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2hhbmdlIHRoZSBZQU1MIHZlcnNpb24gYW5kIHNjaGVtYSB1c2VkIGJ5IHRoZSBkb2N1bWVudC5cbiAgICAgKiBBIGBudWxsYCB2ZXJzaW9uIGRpc2FibGVzIHN1cHBvcnQgZm9yIGRpcmVjdGl2ZXMsIGV4cGxpY2l0IHRhZ3MsIGFuY2hvcnMsIGFuZCBhbGlhc2VzLlxuICAgICAqIEl0IGFsc28gcmVxdWlyZXMgdGhlIGBzY2hlbWFgIG9wdGlvbiB0byBiZSBnaXZlbiBhcyBhIGBTY2hlbWFgIGluc3RhbmNlIHZhbHVlLlxuICAgICAqXG4gICAgICogT3ZlcnJpZGVzIGFsbCBwcmV2aW91c2x5IHNldCBzY2hlbWEgb3B0aW9ucy5cbiAgICAgKi9cbiAgICBzZXRTY2hlbWEodmVyc2lvbiwgb3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIGlmICh0eXBlb2YgdmVyc2lvbiA9PT0gJ251bWJlcicpXG4gICAgICAgICAgICB2ZXJzaW9uID0gU3RyaW5nKHZlcnNpb24pO1xuICAgICAgICBsZXQgb3B0O1xuICAgICAgICBzd2l0Y2ggKHZlcnNpb24pIHtcbiAgICAgICAgICAgIGNhc2UgJzEuMSc6XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZGlyZWN0aXZlcylcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXJlY3RpdmVzLnlhbWwudmVyc2lvbiA9ICcxLjEnO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXJlY3RpdmVzID0gbmV3IGRpcmVjdGl2ZXMuRGlyZWN0aXZlcyh7IHZlcnNpb246ICcxLjEnIH0pO1xuICAgICAgICAgICAgICAgIG9wdCA9IHsgcmVzb2x2ZUtub3duVGFnczogZmFsc2UsIHNjaGVtYTogJ3lhbWwtMS4xJyB9O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnMS4yJzpcbiAgICAgICAgICAgIGNhc2UgJ25leHQnOlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmRpcmVjdGl2ZXMpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGlyZWN0aXZlcy55YW1sLnZlcnNpb24gPSB2ZXJzaW9uO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXJlY3RpdmVzID0gbmV3IGRpcmVjdGl2ZXMuRGlyZWN0aXZlcyh7IHZlcnNpb24gfSk7XG4gICAgICAgICAgICAgICAgb3B0ID0geyByZXNvbHZlS25vd25UYWdzOiB0cnVlLCBzY2hlbWE6ICdjb3JlJyB9O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBudWxsOlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmRpcmVjdGl2ZXMpXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLmRpcmVjdGl2ZXM7XG4gICAgICAgICAgICAgICAgb3B0ID0gbnVsbDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgICAgICBjb25zdCBzdiA9IEpTT04uc3RyaW5naWZ5KHZlcnNpb24pO1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgJzEuMScsICcxLjInIG9yIG51bGwgYXMgZmlyc3QgYXJndW1lbnQsIGJ1dCBmb3VuZDogJHtzdn1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBOb3QgdXNpbmcgYGluc3RhbmNlb2YgU2NoZW1hYCB0byBhbGxvdyBmb3IgZHVjayB0eXBpbmdcbiAgICAgICAgaWYgKG9wdGlvbnMuc2NoZW1hIGluc3RhbmNlb2YgT2JqZWN0KVxuICAgICAgICAgICAgdGhpcy5zY2hlbWEgPSBvcHRpb25zLnNjaGVtYTtcbiAgICAgICAgZWxzZSBpZiAob3B0KVxuICAgICAgICAgICAgdGhpcy5zY2hlbWEgPSBuZXcgU2NoZW1hLlNjaGVtYShPYmplY3QuYXNzaWduKG9wdCwgb3B0aW9ucykpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFdpdGggYSBudWxsIFlBTUwgdmVyc2lvbiwgdGhlIHsgc2NoZW1hOiBTY2hlbWEgfSBvcHRpb24gaXMgcmVxdWlyZWRgKTtcbiAgICB9XG4gICAgLy8ganNvbiAmIGpzb25BcmcgYXJlIG9ubHkgdXNlZCBmcm9tIHRvSlNPTigpXG4gICAgdG9KUyh7IGpzb24sIGpzb25BcmcsIG1hcEFzTWFwLCBtYXhBbGlhc0NvdW50LCBvbkFuY2hvciwgcmV2aXZlciB9ID0ge30pIHtcbiAgICAgICAgY29uc3QgY3R4ID0ge1xuICAgICAgICAgICAgYW5jaG9yczogbmV3IE1hcCgpLFxuICAgICAgICAgICAgZG9jOiB0aGlzLFxuICAgICAgICAgICAga2VlcDogIWpzb24sXG4gICAgICAgICAgICBtYXBBc01hcDogbWFwQXNNYXAgPT09IHRydWUsXG4gICAgICAgICAgICBtYXBLZXlXYXJuZWQ6IGZhbHNlLFxuICAgICAgICAgICAgbWF4QWxpYXNDb3VudDogdHlwZW9mIG1heEFsaWFzQ291bnQgPT09ICdudW1iZXInID8gbWF4QWxpYXNDb3VudCA6IDEwMFxuICAgICAgICB9O1xuICAgICAgICBjb25zdCByZXMgPSB0b0pTLnRvSlModGhpcy5jb250ZW50cywganNvbkFyZyA/PyAnJywgY3R4KTtcbiAgICAgICAgaWYgKHR5cGVvZiBvbkFuY2hvciA9PT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgICAgIGZvciAoY29uc3QgeyBjb3VudCwgcmVzIH0gb2YgY3R4LmFuY2hvcnMudmFsdWVzKCkpXG4gICAgICAgICAgICAgICAgb25BbmNob3IocmVzLCBjb3VudCk7XG4gICAgICAgIHJldHVybiB0eXBlb2YgcmV2aXZlciA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgPyBhcHBseVJldml2ZXIuYXBwbHlSZXZpdmVyKHJldml2ZXIsIHsgJyc6IHJlcyB9LCAnJywgcmVzKVxuICAgICAgICAgICAgOiByZXM7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgZG9jdW1lbnQgYGNvbnRlbnRzYC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBqc29uQXJnIFVzZWQgYnkgYEpTT04uc3RyaW5naWZ5YCB0byBpbmRpY2F0ZSB0aGUgYXJyYXkgaW5kZXggb3JcbiAgICAgKiAgIHByb3BlcnR5IG5hbWUuXG4gICAgICovXG4gICAgdG9KU09OKGpzb25BcmcsIG9uQW5jaG9yKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRvSlMoeyBqc29uOiB0cnVlLCBqc29uQXJnLCBtYXBBc01hcDogZmFsc2UsIG9uQW5jaG9yIH0pO1xuICAgIH1cbiAgICAvKiogQSBZQU1MIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBkb2N1bWVudC4gKi9cbiAgICB0b1N0cmluZyhvcHRpb25zID0ge30pIHtcbiAgICAgICAgaWYgKHRoaXMuZXJyb3JzLmxlbmd0aCA+IDApXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RvY3VtZW50IHdpdGggZXJyb3JzIGNhbm5vdCBiZSBzdHJpbmdpZmllZCcpO1xuICAgICAgICBpZiAoJ2luZGVudCcgaW4gb3B0aW9ucyAmJlxuICAgICAgICAgICAgKCFOdW1iZXIuaXNJbnRlZ2VyKG9wdGlvbnMuaW5kZW50KSB8fCBOdW1iZXIob3B0aW9ucy5pbmRlbnQpIDw9IDApKSB7XG4gICAgICAgICAgICBjb25zdCBzID0gSlNPTi5zdHJpbmdpZnkob3B0aW9ucy5pbmRlbnQpO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBcImluZGVudFwiIG9wdGlvbiBtdXN0IGJlIGEgcG9zaXRpdmUgaW50ZWdlciwgbm90ICR7c31gKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3RyaW5naWZ5RG9jdW1lbnQuc3RyaW5naWZ5RG9jdW1lbnQodGhpcywgb3B0aW9ucyk7XG4gICAgfVxufVxuZnVuY3Rpb24gYXNzZXJ0Q29sbGVjdGlvbihjb250ZW50cykge1xuICAgIGlmIChpZGVudGl0eS5pc0NvbGxlY3Rpb24oY29udGVudHMpKVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0V4cGVjdGVkIGEgWUFNTCBjb2xsZWN0aW9uIGFzIGRvY3VtZW50IGNvbnRlbnRzJyk7XG59XG5cbmV4cG9ydHMuRG9jdW1lbnQgPSBEb2N1bWVudDtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG5jbGFzcyBZQU1MRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gICAgY29uc3RydWN0b3IobmFtZSwgcG9zLCBjb2RlLCBtZXNzYWdlKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMuY29kZSA9IGNvZGU7XG4gICAgICAgIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG4gICAgICAgIHRoaXMucG9zID0gcG9zO1xuICAgIH1cbn1cbmNsYXNzIFlBTUxQYXJzZUVycm9yIGV4dGVuZHMgWUFNTEVycm9yIHtcbiAgICBjb25zdHJ1Y3Rvcihwb3MsIGNvZGUsIG1lc3NhZ2UpIHtcbiAgICAgICAgc3VwZXIoJ1lBTUxQYXJzZUVycm9yJywgcG9zLCBjb2RlLCBtZXNzYWdlKTtcbiAgICB9XG59XG5jbGFzcyBZQU1MV2FybmluZyBleHRlbmRzIFlBTUxFcnJvciB7XG4gICAgY29uc3RydWN0b3IocG9zLCBjb2RlLCBtZXNzYWdlKSB7XG4gICAgICAgIHN1cGVyKCdZQU1MV2FybmluZycsIHBvcywgY29kZSwgbWVzc2FnZSk7XG4gICAgfVxufVxuY29uc3QgcHJldHRpZnlFcnJvciA9IChzcmMsIGxjKSA9PiAoZXJyb3IpID0+IHtcbiAgICBpZiAoZXJyb3IucG9zWzBdID09PSAtMSlcbiAgICAgICAgcmV0dXJuO1xuICAgIGVycm9yLmxpbmVQb3MgPSBlcnJvci5wb3MubWFwKHBvcyA9PiBsYy5saW5lUG9zKHBvcykpO1xuICAgIGNvbnN0IHsgbGluZSwgY29sIH0gPSBlcnJvci5saW5lUG9zWzBdO1xuICAgIGVycm9yLm1lc3NhZ2UgKz0gYCBhdCBsaW5lICR7bGluZX0sIGNvbHVtbiAke2NvbH1gO1xuICAgIGxldCBjaSA9IGNvbCAtIDE7XG4gICAgbGV0IGxpbmVTdHIgPSBzcmNcbiAgICAgICAgLnN1YnN0cmluZyhsYy5saW5lU3RhcnRzW2xpbmUgLSAxXSwgbGMubGluZVN0YXJ0c1tsaW5lXSlcbiAgICAgICAgLnJlcGxhY2UoL1tcXG5cXHJdKyQvLCAnJyk7XG4gICAgLy8gVHJpbSB0byBtYXggODAgY2hhcnMsIGtlZXBpbmcgY29sIHBvc2l0aW9uIG5lYXIgdGhlIG1pZGRsZVxuICAgIGlmIChjaSA+PSA2MCAmJiBsaW5lU3RyLmxlbmd0aCA+IDgwKSB7XG4gICAgICAgIGNvbnN0IHRyaW1TdGFydCA9IE1hdGgubWluKGNpIC0gMzksIGxpbmVTdHIubGVuZ3RoIC0gNzkpO1xuICAgICAgICBsaW5lU3RyID0gJ+KApicgKyBsaW5lU3RyLnN1YnN0cmluZyh0cmltU3RhcnQpO1xuICAgICAgICBjaSAtPSB0cmltU3RhcnQgLSAxO1xuICAgIH1cbiAgICBpZiAobGluZVN0ci5sZW5ndGggPiA4MClcbiAgICAgICAgbGluZVN0ciA9IGxpbmVTdHIuc3Vic3RyaW5nKDAsIDc5KSArICfigKYnO1xuICAgIC8vIEluY2x1ZGUgcHJldmlvdXMgbGluZSBpbiBjb250ZXh0IGlmIHBvaW50aW5nIGF0IGxpbmUgc3RhcnRcbiAgICBpZiAobGluZSA+IDEgJiYgL14gKiQvLnRlc3QobGluZVN0ci5zdWJzdHJpbmcoMCwgY2kpKSkge1xuICAgICAgICAvLyBSZWdleHAgd29uJ3QgbWF0Y2ggaWYgc3RhcnQgaXMgdHJpbW1lZFxuICAgICAgICBsZXQgcHJldiA9IHNyYy5zdWJzdHJpbmcobGMubGluZVN0YXJ0c1tsaW5lIC0gMl0sIGxjLmxpbmVTdGFydHNbbGluZSAtIDFdKTtcbiAgICAgICAgaWYgKHByZXYubGVuZ3RoID4gODApXG4gICAgICAgICAgICBwcmV2ID0gcHJldi5zdWJzdHJpbmcoMCwgNzkpICsgJ+KAplxcbic7XG4gICAgICAgIGxpbmVTdHIgPSBwcmV2ICsgbGluZVN0cjtcbiAgICB9XG4gICAgaWYgKC9bXiBdLy50ZXN0KGxpbmVTdHIpKSB7XG4gICAgICAgIGxldCBjb3VudCA9IDE7XG4gICAgICAgIGNvbnN0IGVuZCA9IGVycm9yLmxpbmVQb3NbMV07XG4gICAgICAgIGlmIChlbmQ/LmxpbmUgPT09IGxpbmUgJiYgZW5kLmNvbCA+IGNvbCkge1xuICAgICAgICAgICAgY291bnQgPSBNYXRoLm1heCgxLCBNYXRoLm1pbihlbmQuY29sIC0gY29sLCA4MCAtIGNpKSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcG9pbnRlciA9ICcgJy5yZXBlYXQoY2kpICsgJ14nLnJlcGVhdChjb3VudCk7XG4gICAgICAgIGVycm9yLm1lc3NhZ2UgKz0gYDpcXG5cXG4ke2xpbmVTdHJ9XFxuJHtwb2ludGVyfVxcbmA7XG4gICAgfVxufTtcblxuZXhwb3J0cy5ZQU1MRXJyb3IgPSBZQU1MRXJyb3I7XG5leHBvcnRzLllBTUxQYXJzZUVycm9yID0gWUFNTFBhcnNlRXJyb3I7XG5leHBvcnRzLllBTUxXYXJuaW5nID0gWUFNTFdhcm5pbmc7XG5leHBvcnRzLnByZXR0aWZ5RXJyb3IgPSBwcmV0dGlmeUVycm9yO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIHJlc29sdmVQcm9wcyh0b2tlbnMsIHsgZmxvdywgaW5kaWNhdG9yLCBuZXh0LCBvZmZzZXQsIG9uRXJyb3IsIHBhcmVudEluZGVudCwgc3RhcnRPbk5ld2xpbmUgfSkge1xuICAgIGxldCBzcGFjZUJlZm9yZSA9IGZhbHNlO1xuICAgIGxldCBhdE5ld2xpbmUgPSBzdGFydE9uTmV3bGluZTtcbiAgICBsZXQgaGFzU3BhY2UgPSBzdGFydE9uTmV3bGluZTtcbiAgICBsZXQgY29tbWVudCA9ICcnO1xuICAgIGxldCBjb21tZW50U2VwID0gJyc7XG4gICAgbGV0IGhhc05ld2xpbmUgPSBmYWxzZTtcbiAgICBsZXQgcmVxU3BhY2UgPSBmYWxzZTtcbiAgICBsZXQgdGFiID0gbnVsbDtcbiAgICBsZXQgYW5jaG9yID0gbnVsbDtcbiAgICBsZXQgdGFnID0gbnVsbDtcbiAgICBsZXQgbmV3bGluZUFmdGVyUHJvcCA9IG51bGw7XG4gICAgbGV0IGNvbW1hID0gbnVsbDtcbiAgICBsZXQgZm91bmQgPSBudWxsO1xuICAgIGxldCBzdGFydCA9IG51bGw7XG4gICAgZm9yIChjb25zdCB0b2tlbiBvZiB0b2tlbnMpIHtcbiAgICAgICAgaWYgKHJlcVNwYWNlKSB7XG4gICAgICAgICAgICBpZiAodG9rZW4udHlwZSAhPT0gJ3NwYWNlJyAmJlxuICAgICAgICAgICAgICAgIHRva2VuLnR5cGUgIT09ICduZXdsaW5lJyAmJlxuICAgICAgICAgICAgICAgIHRva2VuLnR5cGUgIT09ICdjb21tYScpXG4gICAgICAgICAgICAgICAgb25FcnJvcih0b2tlbi5vZmZzZXQsICdNSVNTSU5HX0NIQVInLCAnVGFncyBhbmQgYW5jaG9ycyBtdXN0IGJlIHNlcGFyYXRlZCBmcm9tIHRoZSBuZXh0IHRva2VuIGJ5IHdoaXRlIHNwYWNlJyk7XG4gICAgICAgICAgICByZXFTcGFjZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0YWIpIHtcbiAgICAgICAgICAgIGlmIChhdE5ld2xpbmUgJiYgdG9rZW4udHlwZSAhPT0gJ2NvbW1lbnQnICYmIHRva2VuLnR5cGUgIT09ICduZXdsaW5lJykge1xuICAgICAgICAgICAgICAgIG9uRXJyb3IodGFiLCAnVEFCX0FTX0lOREVOVCcsICdUYWJzIGFyZSBub3QgYWxsb3dlZCBhcyBpbmRlbnRhdGlvbicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGFiID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBzd2l0Y2ggKHRva2VuLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcbiAgICAgICAgICAgICAgICAvLyBBdCB0aGUgZG9jIGxldmVsLCB0YWJzIGF0IGxpbmUgc3RhcnQgbWF5IGJlIHBhcnNlZFxuICAgICAgICAgICAgICAgIC8vIGFzIGxlYWRpbmcgd2hpdGUgc3BhY2UgcmF0aGVyIHRoYW4gaW5kZW50YXRpb24uXG4gICAgICAgICAgICAgICAgLy8gSW4gYSBmbG93IGNvbGxlY3Rpb24sIG9ubHkgdGhlIHBhcnNlciBoYW5kbGVzIGluZGVudC5cbiAgICAgICAgICAgICAgICBpZiAoIWZsb3cgJiZcbiAgICAgICAgICAgICAgICAgICAgKGluZGljYXRvciAhPT0gJ2RvYy1zdGFydCcgfHwgbmV4dD8udHlwZSAhPT0gJ2Zsb3ctY29sbGVjdGlvbicpICYmXG4gICAgICAgICAgICAgICAgICAgIHRva2VuLnNvdXJjZS5pbmNsdWRlcygnXFx0JykpIHtcbiAgICAgICAgICAgICAgICAgICAgdGFiID0gdG9rZW47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGhhc1NwYWNlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2NvbW1lbnQnOiB7XG4gICAgICAgICAgICAgICAgaWYgKCFoYXNTcGFjZSlcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcih0b2tlbiwgJ01JU1NJTkdfQ0hBUicsICdDb21tZW50cyBtdXN0IGJlIHNlcGFyYXRlZCBmcm9tIG90aGVyIHRva2VucyBieSB3aGl0ZSBzcGFjZSBjaGFyYWN0ZXJzJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgY2IgPSB0b2tlbi5zb3VyY2Uuc3Vic3RyaW5nKDEpIHx8ICcgJztcbiAgICAgICAgICAgICAgICBpZiAoIWNvbW1lbnQpXG4gICAgICAgICAgICAgICAgICAgIGNvbW1lbnQgPSBjYjtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGNvbW1lbnQgKz0gY29tbWVudFNlcCArIGNiO1xuICAgICAgICAgICAgICAgIGNvbW1lbnRTZXAgPSAnJztcbiAgICAgICAgICAgICAgICBhdE5ld2xpbmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgIGlmIChhdE5ld2xpbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbW1lbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21tZW50ICs9IHRva2VuLnNvdXJjZTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoIWZvdW5kIHx8IGluZGljYXRvciAhPT0gJ3NlcS1pdGVtLWluZCcpXG4gICAgICAgICAgICAgICAgICAgICAgICBzcGFjZUJlZm9yZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgY29tbWVudFNlcCArPSB0b2tlbi5zb3VyY2U7XG4gICAgICAgICAgICAgICAgYXROZXdsaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBoYXNOZXdsaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpZiAoYW5jaG9yIHx8IHRhZylcbiAgICAgICAgICAgICAgICAgICAgbmV3bGluZUFmdGVyUHJvcCA9IHRva2VuO1xuICAgICAgICAgICAgICAgIGhhc1NwYWNlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2FuY2hvcic6XG4gICAgICAgICAgICAgICAgaWYgKGFuY2hvcilcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcih0b2tlbiwgJ01VTFRJUExFX0FOQ0hPUlMnLCAnQSBub2RlIGNhbiBoYXZlIGF0IG1vc3Qgb25lIGFuY2hvcicpO1xuICAgICAgICAgICAgICAgIGlmICh0b2tlbi5zb3VyY2UuZW5kc1dpdGgoJzonKSlcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcih0b2tlbi5vZmZzZXQgKyB0b2tlbi5zb3VyY2UubGVuZ3RoIC0gMSwgJ0JBRF9BTElBUycsICdBbmNob3IgZW5kaW5nIGluIDogaXMgYW1iaWd1b3VzJywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgYW5jaG9yID0gdG9rZW47XG4gICAgICAgICAgICAgICAgc3RhcnQgPz8gKHN0YXJ0ID0gdG9rZW4ub2Zmc2V0KTtcbiAgICAgICAgICAgICAgICBhdE5ld2xpbmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBoYXNTcGFjZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHJlcVNwYWNlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3RhZyc6IHtcbiAgICAgICAgICAgICAgICBpZiAodGFnKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnTVVMVElQTEVfVEFHUycsICdBIG5vZGUgY2FuIGhhdmUgYXQgbW9zdCBvbmUgdGFnJyk7XG4gICAgICAgICAgICAgICAgdGFnID0gdG9rZW47XG4gICAgICAgICAgICAgICAgc3RhcnQgPz8gKHN0YXJ0ID0gdG9rZW4ub2Zmc2V0KTtcbiAgICAgICAgICAgICAgICBhdE5ld2xpbmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBoYXNTcGFjZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHJlcVNwYWNlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgaW5kaWNhdG9yOlxuICAgICAgICAgICAgICAgIC8vIENvdWxkIGhlcmUgaGFuZGxlIHByZWNlZGluZyBjb21tZW50cyBkaWZmZXJlbnRseVxuICAgICAgICAgICAgICAgIGlmIChhbmNob3IgfHwgdGFnKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnQkFEX1BST1BfT1JERVInLCBgQW5jaG9ycyBhbmQgdGFncyBtdXN0IGJlIGFmdGVyIHRoZSAke3Rva2VuLnNvdXJjZX0gaW5kaWNhdG9yYCk7XG4gICAgICAgICAgICAgICAgaWYgKGZvdW5kKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnVU5FWFBFQ1RFRF9UT0tFTicsIGBVbmV4cGVjdGVkICR7dG9rZW4uc291cmNlfSBpbiAke2Zsb3cgPz8gJ2NvbGxlY3Rpb24nfWApO1xuICAgICAgICAgICAgICAgIGZvdW5kID0gdG9rZW47XG4gICAgICAgICAgICAgICAgYXROZXdsaW5lID1cbiAgICAgICAgICAgICAgICAgICAgaW5kaWNhdG9yID09PSAnc2VxLWl0ZW0taW5kJyB8fCBpbmRpY2F0b3IgPT09ICdleHBsaWNpdC1rZXktaW5kJztcbiAgICAgICAgICAgICAgICBoYXNTcGFjZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnY29tbWEnOlxuICAgICAgICAgICAgICAgIGlmIChmbG93KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb21tYSlcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdVTkVYUEVDVEVEX1RPS0VOJywgYFVuZXhwZWN0ZWQgLCBpbiAke2Zsb3d9YCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbW1hID0gdG9rZW47XG4gICAgICAgICAgICAgICAgICAgIGF0TmV3bGluZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBoYXNTcGFjZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBlbHNlIGZhbGx0aHJvdWdoXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdVTkVYUEVDVEVEX1RPS0VOJywgYFVuZXhwZWN0ZWQgJHt0b2tlbi50eXBlfSB0b2tlbmApO1xuICAgICAgICAgICAgICAgIGF0TmV3bGluZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGhhc1NwYWNlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgbGFzdCA9IHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV07XG4gICAgY29uc3QgZW5kID0gbGFzdCA/IGxhc3Qub2Zmc2V0ICsgbGFzdC5zb3VyY2UubGVuZ3RoIDogb2Zmc2V0O1xuICAgIGlmIChyZXFTcGFjZSAmJlxuICAgICAgICBuZXh0ICYmXG4gICAgICAgIG5leHQudHlwZSAhPT0gJ3NwYWNlJyAmJlxuICAgICAgICBuZXh0LnR5cGUgIT09ICduZXdsaW5lJyAmJlxuICAgICAgICBuZXh0LnR5cGUgIT09ICdjb21tYScgJiZcbiAgICAgICAgKG5leHQudHlwZSAhPT0gJ3NjYWxhcicgfHwgbmV4dC5zb3VyY2UgIT09ICcnKSkge1xuICAgICAgICBvbkVycm9yKG5leHQub2Zmc2V0LCAnTUlTU0lOR19DSEFSJywgJ1RhZ3MgYW5kIGFuY2hvcnMgbXVzdCBiZSBzZXBhcmF0ZWQgZnJvbSB0aGUgbmV4dCB0b2tlbiBieSB3aGl0ZSBzcGFjZScpO1xuICAgIH1cbiAgICBpZiAodGFiICYmXG4gICAgICAgICgoYXROZXdsaW5lICYmIHRhYi5pbmRlbnQgPD0gcGFyZW50SW5kZW50KSB8fFxuICAgICAgICAgICAgbmV4dD8udHlwZSA9PT0gJ2Jsb2NrLW1hcCcgfHxcbiAgICAgICAgICAgIG5leHQ/LnR5cGUgPT09ICdibG9jay1zZXEnKSlcbiAgICAgICAgb25FcnJvcih0YWIsICdUQUJfQVNfSU5ERU5UJywgJ1RhYnMgYXJlIG5vdCBhbGxvd2VkIGFzIGluZGVudGF0aW9uJyk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29tbWEsXG4gICAgICAgIGZvdW5kLFxuICAgICAgICBzcGFjZUJlZm9yZSxcbiAgICAgICAgY29tbWVudCxcbiAgICAgICAgaGFzTmV3bGluZSxcbiAgICAgICAgYW5jaG9yLFxuICAgICAgICB0YWcsXG4gICAgICAgIG5ld2xpbmVBZnRlclByb3AsXG4gICAgICAgIGVuZCxcbiAgICAgICAgc3RhcnQ6IHN0YXJ0ID8/IGVuZFxuICAgIH07XG59XG5cbmV4cG9ydHMucmVzb2x2ZVByb3BzID0gcmVzb2x2ZVByb3BzO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIGNvbnRhaW5zTmV3bGluZShrZXkpIHtcbiAgICBpZiAoIWtleSlcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgc3dpdGNoIChrZXkudHlwZSkge1xuICAgICAgICBjYXNlICdhbGlhcyc6XG4gICAgICAgIGNhc2UgJ3NjYWxhcic6XG4gICAgICAgIGNhc2UgJ2RvdWJsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgY2FzZSAnc2luZ2xlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICAgICAgaWYgKGtleS5zb3VyY2UuaW5jbHVkZXMoJ1xcbicpKVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgaWYgKGtleS5lbmQpXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBzdCBvZiBrZXkuZW5kKVxuICAgICAgICAgICAgICAgICAgICBpZiAoc3QudHlwZSA9PT0gJ25ld2xpbmUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGNhc2UgJ2Zsb3ctY29sbGVjdGlvbic6XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGl0IG9mIGtleS5pdGVtcykge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgc3Qgb2YgaXQuc3RhcnQpXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdC50eXBlID09PSAnbmV3bGluZScpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpZiAoaXQuc2VwKVxuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHN0IG9mIGl0LnNlcClcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdC50eXBlID09PSAnbmV3bGluZScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgaWYgKGNvbnRhaW5zTmV3bGluZShpdC5rZXkpIHx8IGNvbnRhaW5zTmV3bGluZShpdC52YWx1ZSkpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxufVxuXG5leHBvcnRzLmNvbnRhaW5zTmV3bGluZSA9IGNvbnRhaW5zTmV3bGluZTtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbENvbnRhaW5zTmV3bGluZSA9IHJlcXVpcmUoJy4vdXRpbC1jb250YWlucy1uZXdsaW5lLmpzJyk7XG5cbmZ1bmN0aW9uIGZsb3dJbmRlbnRDaGVjayhpbmRlbnQsIGZjLCBvbkVycm9yKSB7XG4gICAgaWYgKGZjPy50eXBlID09PSAnZmxvdy1jb2xsZWN0aW9uJykge1xuICAgICAgICBjb25zdCBlbmQgPSBmYy5lbmRbMF07XG4gICAgICAgIGlmIChlbmQuaW5kZW50ID09PSBpbmRlbnQgJiZcbiAgICAgICAgICAgIChlbmQuc291cmNlID09PSAnXScgfHwgZW5kLnNvdXJjZSA9PT0gJ30nKSAmJlxuICAgICAgICAgICAgdXRpbENvbnRhaW5zTmV3bGluZS5jb250YWluc05ld2xpbmUoZmMpKSB7XG4gICAgICAgICAgICBjb25zdCBtc2cgPSAnRmxvdyBlbmQgaW5kaWNhdG9yIHNob3VsZCBiZSBtb3JlIGluZGVudGVkIHRoYW4gcGFyZW50JztcbiAgICAgICAgICAgIG9uRXJyb3IoZW5kLCAnQkFEX0lOREVOVCcsIG1zZywgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydHMuZmxvd0luZGVudENoZWNrID0gZmxvd0luZGVudENoZWNrO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBpZGVudGl0eSA9IHJlcXVpcmUoJy4uL25vZGVzL2lkZW50aXR5LmpzJyk7XG5cbmZ1bmN0aW9uIG1hcEluY2x1ZGVzKGN0eCwgaXRlbXMsIHNlYXJjaCkge1xuICAgIGNvbnN0IHsgdW5pcXVlS2V5cyB9ID0gY3R4Lm9wdGlvbnM7XG4gICAgaWYgKHVuaXF1ZUtleXMgPT09IGZhbHNlKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgY29uc3QgaXNFcXVhbCA9IHR5cGVvZiB1bmlxdWVLZXlzID09PSAnZnVuY3Rpb24nXG4gICAgICAgID8gdW5pcXVlS2V5c1xuICAgICAgICA6IChhLCBiKSA9PiBhID09PSBiIHx8IChpZGVudGl0eS5pc1NjYWxhcihhKSAmJiBpZGVudGl0eS5pc1NjYWxhcihiKSAmJiBhLnZhbHVlID09PSBiLnZhbHVlKTtcbiAgICByZXR1cm4gaXRlbXMuc29tZShwYWlyID0+IGlzRXF1YWwocGFpci5rZXksIHNlYXJjaCkpO1xufVxuXG5leHBvcnRzLm1hcEluY2x1ZGVzID0gbWFwSW5jbHVkZXM7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIFBhaXIgPSByZXF1aXJlKCcuLi9ub2Rlcy9QYWlyLmpzJyk7XG52YXIgWUFNTE1hcCA9IHJlcXVpcmUoJy4uL25vZGVzL1lBTUxNYXAuanMnKTtcbnZhciByZXNvbHZlUHJvcHMgPSByZXF1aXJlKCcuL3Jlc29sdmUtcHJvcHMuanMnKTtcbnZhciB1dGlsQ29udGFpbnNOZXdsaW5lID0gcmVxdWlyZSgnLi91dGlsLWNvbnRhaW5zLW5ld2xpbmUuanMnKTtcbnZhciB1dGlsRmxvd0luZGVudENoZWNrID0gcmVxdWlyZSgnLi91dGlsLWZsb3ctaW5kZW50LWNoZWNrLmpzJyk7XG52YXIgdXRpbE1hcEluY2x1ZGVzID0gcmVxdWlyZSgnLi91dGlsLW1hcC1pbmNsdWRlcy5qcycpO1xuXG5jb25zdCBzdGFydENvbE1zZyA9ICdBbGwgbWFwcGluZyBpdGVtcyBtdXN0IHN0YXJ0IGF0IHRoZSBzYW1lIGNvbHVtbic7XG5mdW5jdGlvbiByZXNvbHZlQmxvY2tNYXAoeyBjb21wb3NlTm9kZSwgY29tcG9zZUVtcHR5Tm9kZSB9LCBjdHgsIGJtLCBvbkVycm9yLCB0YWcpIHtcbiAgICBjb25zdCBOb2RlQ2xhc3MgPSB0YWc/Lm5vZGVDbGFzcyA/PyBZQU1MTWFwLllBTUxNYXA7XG4gICAgY29uc3QgbWFwID0gbmV3IE5vZGVDbGFzcyhjdHguc2NoZW1hKTtcbiAgICBpZiAoY3R4LmF0Um9vdClcbiAgICAgICAgY3R4LmF0Um9vdCA9IGZhbHNlO1xuICAgIGxldCBvZmZzZXQgPSBibS5vZmZzZXQ7XG4gICAgbGV0IGNvbW1lbnRFbmQgPSBudWxsO1xuICAgIGZvciAoY29uc3QgY29sbEl0ZW0gb2YgYm0uaXRlbXMpIHtcbiAgICAgICAgY29uc3QgeyBzdGFydCwga2V5LCBzZXAsIHZhbHVlIH0gPSBjb2xsSXRlbTtcbiAgICAgICAgLy8ga2V5IHByb3BlcnRpZXNcbiAgICAgICAgY29uc3Qga2V5UHJvcHMgPSByZXNvbHZlUHJvcHMucmVzb2x2ZVByb3BzKHN0YXJ0LCB7XG4gICAgICAgICAgICBpbmRpY2F0b3I6ICdleHBsaWNpdC1rZXktaW5kJyxcbiAgICAgICAgICAgIG5leHQ6IGtleSA/PyBzZXA/LlswXSxcbiAgICAgICAgICAgIG9mZnNldCxcbiAgICAgICAgICAgIG9uRXJyb3IsXG4gICAgICAgICAgICBwYXJlbnRJbmRlbnQ6IGJtLmluZGVudCxcbiAgICAgICAgICAgIHN0YXJ0T25OZXdsaW5lOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBpbXBsaWNpdEtleSA9ICFrZXlQcm9wcy5mb3VuZDtcbiAgICAgICAgaWYgKGltcGxpY2l0S2V5KSB7XG4gICAgICAgICAgICBpZiAoa2V5KSB7XG4gICAgICAgICAgICAgICAgaWYgKGtleS50eXBlID09PSAnYmxvY2stc2VxJylcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcihvZmZzZXQsICdCTE9DS19BU19JTVBMSUNJVF9LRVknLCAnQSBibG9jayBzZXF1ZW5jZSBtYXkgbm90IGJlIHVzZWQgYXMgYW4gaW1wbGljaXQgbWFwIGtleScpO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKCdpbmRlbnQnIGluIGtleSAmJiBrZXkuaW5kZW50ICE9PSBibS5pbmRlbnQpXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3Iob2Zmc2V0LCAnQkFEX0lOREVOVCcsIHN0YXJ0Q29sTXNnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgha2V5UHJvcHMuYW5jaG9yICYmICFrZXlQcm9wcy50YWcgJiYgIXNlcCkge1xuICAgICAgICAgICAgICAgIGNvbW1lbnRFbmQgPSBrZXlQcm9wcy5lbmQ7XG4gICAgICAgICAgICAgICAgaWYgKGtleVByb3BzLmNvbW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1hcC5jb21tZW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwLmNvbW1lbnQgKz0gJ1xcbicgKyBrZXlQcm9wcy5jb21tZW50O1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXAuY29tbWVudCA9IGtleVByb3BzLmNvbW1lbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGtleVByb3BzLm5ld2xpbmVBZnRlclByb3AgfHwgdXRpbENvbnRhaW5zTmV3bGluZS5jb250YWluc05ld2xpbmUoa2V5KSkge1xuICAgICAgICAgICAgICAgIG9uRXJyb3Ioa2V5ID8/IHN0YXJ0W3N0YXJ0Lmxlbmd0aCAtIDFdLCAnTVVMVElMSU5FX0lNUExJQ0lUX0tFWScsICdJbXBsaWNpdCBrZXlzIG5lZWQgdG8gYmUgb24gYSBzaW5nbGUgbGluZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGtleVByb3BzLmZvdW5kPy5pbmRlbnQgIT09IGJtLmluZGVudCkge1xuICAgICAgICAgICAgb25FcnJvcihvZmZzZXQsICdCQURfSU5ERU5UJywgc3RhcnRDb2xNc2cpO1xuICAgICAgICB9XG4gICAgICAgIC8vIGtleSB2YWx1ZVxuICAgICAgICBjdHguYXRLZXkgPSB0cnVlO1xuICAgICAgICBjb25zdCBrZXlTdGFydCA9IGtleVByb3BzLmVuZDtcbiAgICAgICAgY29uc3Qga2V5Tm9kZSA9IGtleVxuICAgICAgICAgICAgPyBjb21wb3NlTm9kZShjdHgsIGtleSwga2V5UHJvcHMsIG9uRXJyb3IpXG4gICAgICAgICAgICA6IGNvbXBvc2VFbXB0eU5vZGUoY3R4LCBrZXlTdGFydCwgc3RhcnQsIG51bGwsIGtleVByb3BzLCBvbkVycm9yKTtcbiAgICAgICAgaWYgKGN0eC5zY2hlbWEuY29tcGF0KVxuICAgICAgICAgICAgdXRpbEZsb3dJbmRlbnRDaGVjay5mbG93SW5kZW50Q2hlY2soYm0uaW5kZW50LCBrZXksIG9uRXJyb3IpO1xuICAgICAgICBjdHguYXRLZXkgPSBmYWxzZTtcbiAgICAgICAgaWYgKHV0aWxNYXBJbmNsdWRlcy5tYXBJbmNsdWRlcyhjdHgsIG1hcC5pdGVtcywga2V5Tm9kZSkpXG4gICAgICAgICAgICBvbkVycm9yKGtleVN0YXJ0LCAnRFVQTElDQVRFX0tFWScsICdNYXAga2V5cyBtdXN0IGJlIHVuaXF1ZScpO1xuICAgICAgICAvLyB2YWx1ZSBwcm9wZXJ0aWVzXG4gICAgICAgIGNvbnN0IHZhbHVlUHJvcHMgPSByZXNvbHZlUHJvcHMucmVzb2x2ZVByb3BzKHNlcCA/PyBbXSwge1xuICAgICAgICAgICAgaW5kaWNhdG9yOiAnbWFwLXZhbHVlLWluZCcsXG4gICAgICAgICAgICBuZXh0OiB2YWx1ZSxcbiAgICAgICAgICAgIG9mZnNldDoga2V5Tm9kZS5yYW5nZVsyXSxcbiAgICAgICAgICAgIG9uRXJyb3IsXG4gICAgICAgICAgICBwYXJlbnRJbmRlbnQ6IGJtLmluZGVudCxcbiAgICAgICAgICAgIHN0YXJ0T25OZXdsaW5lOiAha2V5IHx8IGtleS50eXBlID09PSAnYmxvY2stc2NhbGFyJ1xuICAgICAgICB9KTtcbiAgICAgICAgb2Zmc2V0ID0gdmFsdWVQcm9wcy5lbmQ7XG4gICAgICAgIGlmICh2YWx1ZVByb3BzLmZvdW5kKSB7XG4gICAgICAgICAgICBpZiAoaW1wbGljaXRLZXkpIHtcbiAgICAgICAgICAgICAgICBpZiAodmFsdWU/LnR5cGUgPT09ICdibG9jay1tYXAnICYmICF2YWx1ZVByb3BzLmhhc05ld2xpbmUpXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3Iob2Zmc2V0LCAnQkxPQ0tfQVNfSU1QTElDSVRfS0VZJywgJ05lc3RlZCBtYXBwaW5ncyBhcmUgbm90IGFsbG93ZWQgaW4gY29tcGFjdCBtYXBwaW5ncycpO1xuICAgICAgICAgICAgICAgIGlmIChjdHgub3B0aW9ucy5zdHJpY3QgJiZcbiAgICAgICAgICAgICAgICAgICAga2V5UHJvcHMuc3RhcnQgPCB2YWx1ZVByb3BzLmZvdW5kLm9mZnNldCAtIDEwMjQpXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3Ioa2V5Tm9kZS5yYW5nZSwgJ0tFWV9PVkVSXzEwMjRfQ0hBUlMnLCAnVGhlIDogaW5kaWNhdG9yIG11c3QgYmUgYXQgbW9zdCAxMDI0IGNoYXJzIGFmdGVyIHRoZSBzdGFydCBvZiBhbiBpbXBsaWNpdCBibG9jayBtYXBwaW5nIGtleScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gdmFsdWUgdmFsdWVcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlTm9kZSA9IHZhbHVlXG4gICAgICAgICAgICAgICAgPyBjb21wb3NlTm9kZShjdHgsIHZhbHVlLCB2YWx1ZVByb3BzLCBvbkVycm9yKVxuICAgICAgICAgICAgICAgIDogY29tcG9zZUVtcHR5Tm9kZShjdHgsIG9mZnNldCwgc2VwLCBudWxsLCB2YWx1ZVByb3BzLCBvbkVycm9yKTtcbiAgICAgICAgICAgIGlmIChjdHguc2NoZW1hLmNvbXBhdClcbiAgICAgICAgICAgICAgICB1dGlsRmxvd0luZGVudENoZWNrLmZsb3dJbmRlbnRDaGVjayhibS5pbmRlbnQsIHZhbHVlLCBvbkVycm9yKTtcbiAgICAgICAgICAgIG9mZnNldCA9IHZhbHVlTm9kZS5yYW5nZVsyXTtcbiAgICAgICAgICAgIGNvbnN0IHBhaXIgPSBuZXcgUGFpci5QYWlyKGtleU5vZGUsIHZhbHVlTm9kZSk7XG4gICAgICAgICAgICBpZiAoY3R4Lm9wdGlvbnMua2VlcFNvdXJjZVRva2VucylcbiAgICAgICAgICAgICAgICBwYWlyLnNyY1Rva2VuID0gY29sbEl0ZW07XG4gICAgICAgICAgICBtYXAuaXRlbXMucHVzaChwYWlyKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIGtleSB3aXRoIG5vIHZhbHVlXG4gICAgICAgICAgICBpZiAoaW1wbGljaXRLZXkpXG4gICAgICAgICAgICAgICAgb25FcnJvcihrZXlOb2RlLnJhbmdlLCAnTUlTU0lOR19DSEFSJywgJ0ltcGxpY2l0IG1hcCBrZXlzIG5lZWQgdG8gYmUgZm9sbG93ZWQgYnkgbWFwIHZhbHVlcycpO1xuICAgICAgICAgICAgaWYgKHZhbHVlUHJvcHMuY29tbWVudCkge1xuICAgICAgICAgICAgICAgIGlmIChrZXlOb2RlLmNvbW1lbnQpXG4gICAgICAgICAgICAgICAgICAgIGtleU5vZGUuY29tbWVudCArPSAnXFxuJyArIHZhbHVlUHJvcHMuY29tbWVudDtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGtleU5vZGUuY29tbWVudCA9IHZhbHVlUHJvcHMuY29tbWVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHBhaXIgPSBuZXcgUGFpci5QYWlyKGtleU5vZGUpO1xuICAgICAgICAgICAgaWYgKGN0eC5vcHRpb25zLmtlZXBTb3VyY2VUb2tlbnMpXG4gICAgICAgICAgICAgICAgcGFpci5zcmNUb2tlbiA9IGNvbGxJdGVtO1xuICAgICAgICAgICAgbWFwLml0ZW1zLnB1c2gocGFpcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGNvbW1lbnRFbmQgJiYgY29tbWVudEVuZCA8IG9mZnNldClcbiAgICAgICAgb25FcnJvcihjb21tZW50RW5kLCAnSU1QT1NTSUJMRScsICdNYXAgY29tbWVudCB3aXRoIHRyYWlsaW5nIGNvbnRlbnQnKTtcbiAgICBtYXAucmFuZ2UgPSBbYm0ub2Zmc2V0LCBvZmZzZXQsIGNvbW1lbnRFbmQgPz8gb2Zmc2V0XTtcbiAgICByZXR1cm4gbWFwO1xufVxuXG5leHBvcnRzLnJlc29sdmVCbG9ja01hcCA9IHJlc29sdmVCbG9ja01hcDtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgWUFNTFNlcSA9IHJlcXVpcmUoJy4uL25vZGVzL1lBTUxTZXEuanMnKTtcbnZhciByZXNvbHZlUHJvcHMgPSByZXF1aXJlKCcuL3Jlc29sdmUtcHJvcHMuanMnKTtcbnZhciB1dGlsRmxvd0luZGVudENoZWNrID0gcmVxdWlyZSgnLi91dGlsLWZsb3ctaW5kZW50LWNoZWNrLmpzJyk7XG5cbmZ1bmN0aW9uIHJlc29sdmVCbG9ja1NlcSh7IGNvbXBvc2VOb2RlLCBjb21wb3NlRW1wdHlOb2RlIH0sIGN0eCwgYnMsIG9uRXJyb3IsIHRhZykge1xuICAgIGNvbnN0IE5vZGVDbGFzcyA9IHRhZz8ubm9kZUNsYXNzID8/IFlBTUxTZXEuWUFNTFNlcTtcbiAgICBjb25zdCBzZXEgPSBuZXcgTm9kZUNsYXNzKGN0eC5zY2hlbWEpO1xuICAgIGlmIChjdHguYXRSb290KVxuICAgICAgICBjdHguYXRSb290ID0gZmFsc2U7XG4gICAgaWYgKGN0eC5hdEtleSlcbiAgICAgICAgY3R4LmF0S2V5ID0gZmFsc2U7XG4gICAgbGV0IG9mZnNldCA9IGJzLm9mZnNldDtcbiAgICBsZXQgY29tbWVudEVuZCA9IG51bGw7XG4gICAgZm9yIChjb25zdCB7IHN0YXJ0LCB2YWx1ZSB9IG9mIGJzLml0ZW1zKSB7XG4gICAgICAgIGNvbnN0IHByb3BzID0gcmVzb2x2ZVByb3BzLnJlc29sdmVQcm9wcyhzdGFydCwge1xuICAgICAgICAgICAgaW5kaWNhdG9yOiAnc2VxLWl0ZW0taW5kJyxcbiAgICAgICAgICAgIG5leHQ6IHZhbHVlLFxuICAgICAgICAgICAgb2Zmc2V0LFxuICAgICAgICAgICAgb25FcnJvcixcbiAgICAgICAgICAgIHBhcmVudEluZGVudDogYnMuaW5kZW50LFxuICAgICAgICAgICAgc3RhcnRPbk5ld2xpbmU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICghcHJvcHMuZm91bmQpIHtcbiAgICAgICAgICAgIGlmIChwcm9wcy5hbmNob3IgfHwgcHJvcHMudGFnIHx8IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlPy50eXBlID09PSAnYmxvY2stc2VxJylcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcihwcm9wcy5lbmQsICdCQURfSU5ERU5UJywgJ0FsbCBzZXF1ZW5jZSBpdGVtcyBtdXN0IHN0YXJ0IGF0IHRoZSBzYW1lIGNvbHVtbicpO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcihvZmZzZXQsICdNSVNTSU5HX0NIQVInLCAnU2VxdWVuY2UgaXRlbSB3aXRob3V0IC0gaW5kaWNhdG9yJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb21tZW50RW5kID0gcHJvcHMuZW5kO1xuICAgICAgICAgICAgICAgIGlmIChwcm9wcy5jb21tZW50KVxuICAgICAgICAgICAgICAgICAgICBzZXEuY29tbWVudCA9IHByb3BzLmNvbW1lbnQ7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgbm9kZSA9IHZhbHVlXG4gICAgICAgICAgICA/IGNvbXBvc2VOb2RlKGN0eCwgdmFsdWUsIHByb3BzLCBvbkVycm9yKVxuICAgICAgICAgICAgOiBjb21wb3NlRW1wdHlOb2RlKGN0eCwgcHJvcHMuZW5kLCBzdGFydCwgbnVsbCwgcHJvcHMsIG9uRXJyb3IpO1xuICAgICAgICBpZiAoY3R4LnNjaGVtYS5jb21wYXQpXG4gICAgICAgICAgICB1dGlsRmxvd0luZGVudENoZWNrLmZsb3dJbmRlbnRDaGVjayhicy5pbmRlbnQsIHZhbHVlLCBvbkVycm9yKTtcbiAgICAgICAgb2Zmc2V0ID0gbm9kZS5yYW5nZVsyXTtcbiAgICAgICAgc2VxLml0ZW1zLnB1c2gobm9kZSk7XG4gICAgfVxuICAgIHNlcS5yYW5nZSA9IFticy5vZmZzZXQsIG9mZnNldCwgY29tbWVudEVuZCA/PyBvZmZzZXRdO1xuICAgIHJldHVybiBzZXE7XG59XG5cbmV4cG9ydHMucmVzb2x2ZUJsb2NrU2VxID0gcmVzb2x2ZUJsb2NrU2VxO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIHJlc29sdmVFbmQoZW5kLCBvZmZzZXQsIHJlcVNwYWNlLCBvbkVycm9yKSB7XG4gICAgbGV0IGNvbW1lbnQgPSAnJztcbiAgICBpZiAoZW5kKSB7XG4gICAgICAgIGxldCBoYXNTcGFjZSA9IGZhbHNlO1xuICAgICAgICBsZXQgc2VwID0gJyc7XG4gICAgICAgIGZvciAoY29uc3QgdG9rZW4gb2YgZW5kKSB7XG4gICAgICAgICAgICBjb25zdCB7IHNvdXJjZSwgdHlwZSB9ID0gdG9rZW47XG4gICAgICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICAgICAgICAgIGhhc1NwYWNlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlcVNwYWNlICYmICFoYXNTcGFjZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdNSVNTSU5HX0NIQVInLCAnQ29tbWVudHMgbXVzdCBiZSBzZXBhcmF0ZWQgZnJvbSBvdGhlciB0b2tlbnMgYnkgd2hpdGUgc3BhY2UgY2hhcmFjdGVycycpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjYiA9IHNvdXJjZS5zdWJzdHJpbmcoMSkgfHwgJyAnO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWNvbW1lbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21tZW50ID0gY2I7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1lbnQgKz0gc2VwICsgY2I7XG4gICAgICAgICAgICAgICAgICAgIHNlcCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FzZSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb21tZW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgc2VwICs9IHNvdXJjZTtcbiAgICAgICAgICAgICAgICAgICAgaGFzU3BhY2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnVU5FWFBFQ1RFRF9UT0tFTicsIGBVbmV4cGVjdGVkICR7dHlwZX0gYXQgbm9kZSBlbmRgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9mZnNldCArPSBzb3VyY2UubGVuZ3RoO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7IGNvbW1lbnQsIG9mZnNldCB9O1xufVxuXG5leHBvcnRzLnJlc29sdmVFbmQgPSByZXNvbHZlRW5kO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBpZGVudGl0eSA9IHJlcXVpcmUoJy4uL25vZGVzL2lkZW50aXR5LmpzJyk7XG52YXIgUGFpciA9IHJlcXVpcmUoJy4uL25vZGVzL1BhaXIuanMnKTtcbnZhciBZQU1MTWFwID0gcmVxdWlyZSgnLi4vbm9kZXMvWUFNTE1hcC5qcycpO1xudmFyIFlBTUxTZXEgPSByZXF1aXJlKCcuLi9ub2Rlcy9ZQU1MU2VxLmpzJyk7XG52YXIgcmVzb2x2ZUVuZCA9IHJlcXVpcmUoJy4vcmVzb2x2ZS1lbmQuanMnKTtcbnZhciByZXNvbHZlUHJvcHMgPSByZXF1aXJlKCcuL3Jlc29sdmUtcHJvcHMuanMnKTtcbnZhciB1dGlsQ29udGFpbnNOZXdsaW5lID0gcmVxdWlyZSgnLi91dGlsLWNvbnRhaW5zLW5ld2xpbmUuanMnKTtcbnZhciB1dGlsTWFwSW5jbHVkZXMgPSByZXF1aXJlKCcuL3V0aWwtbWFwLWluY2x1ZGVzLmpzJyk7XG5cbmNvbnN0IGJsb2NrTXNnID0gJ0Jsb2NrIGNvbGxlY3Rpb25zIGFyZSBub3QgYWxsb3dlZCB3aXRoaW4gZmxvdyBjb2xsZWN0aW9ucyc7XG5jb25zdCBpc0Jsb2NrID0gKHRva2VuKSA9PiB0b2tlbiAmJiAodG9rZW4udHlwZSA9PT0gJ2Jsb2NrLW1hcCcgfHwgdG9rZW4udHlwZSA9PT0gJ2Jsb2NrLXNlcScpO1xuZnVuY3Rpb24gcmVzb2x2ZUZsb3dDb2xsZWN0aW9uKHsgY29tcG9zZU5vZGUsIGNvbXBvc2VFbXB0eU5vZGUgfSwgY3R4LCBmYywgb25FcnJvciwgdGFnKSB7XG4gICAgY29uc3QgaXNNYXAgPSBmYy5zdGFydC5zb3VyY2UgPT09ICd7JztcbiAgICBjb25zdCBmY05hbWUgPSBpc01hcCA/ICdmbG93IG1hcCcgOiAnZmxvdyBzZXF1ZW5jZSc7XG4gICAgY29uc3QgTm9kZUNsYXNzID0gKHRhZz8ubm9kZUNsYXNzID8/IChpc01hcCA/IFlBTUxNYXAuWUFNTE1hcCA6IFlBTUxTZXEuWUFNTFNlcSkpO1xuICAgIGNvbnN0IGNvbGwgPSBuZXcgTm9kZUNsYXNzKGN0eC5zY2hlbWEpO1xuICAgIGNvbGwuZmxvdyA9IHRydWU7XG4gICAgY29uc3QgYXRSb290ID0gY3R4LmF0Um9vdDtcbiAgICBpZiAoYXRSb290KVxuICAgICAgICBjdHguYXRSb290ID0gZmFsc2U7XG4gICAgaWYgKGN0eC5hdEtleSlcbiAgICAgICAgY3R4LmF0S2V5ID0gZmFsc2U7XG4gICAgbGV0IG9mZnNldCA9IGZjLm9mZnNldCArIGZjLnN0YXJ0LnNvdXJjZS5sZW5ndGg7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmYy5pdGVtcy5sZW5ndGg7ICsraSkge1xuICAgICAgICBjb25zdCBjb2xsSXRlbSA9IGZjLml0ZW1zW2ldO1xuICAgICAgICBjb25zdCB7IHN0YXJ0LCBrZXksIHNlcCwgdmFsdWUgfSA9IGNvbGxJdGVtO1xuICAgICAgICBjb25zdCBwcm9wcyA9IHJlc29sdmVQcm9wcy5yZXNvbHZlUHJvcHMoc3RhcnQsIHtcbiAgICAgICAgICAgIGZsb3c6IGZjTmFtZSxcbiAgICAgICAgICAgIGluZGljYXRvcjogJ2V4cGxpY2l0LWtleS1pbmQnLFxuICAgICAgICAgICAgbmV4dDoga2V5ID8/IHNlcD8uWzBdLFxuICAgICAgICAgICAgb2Zmc2V0LFxuICAgICAgICAgICAgb25FcnJvcixcbiAgICAgICAgICAgIHBhcmVudEluZGVudDogZmMuaW5kZW50LFxuICAgICAgICAgICAgc3RhcnRPbk5ld2xpbmU6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIXByb3BzLmZvdW5kKSB7XG4gICAgICAgICAgICBpZiAoIXByb3BzLmFuY2hvciAmJiAhcHJvcHMudGFnICYmICFzZXAgJiYgIXZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGkgPT09IDAgJiYgcHJvcHMuY29tbWEpXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IocHJvcHMuY29tbWEsICdVTkVYUEVDVEVEX1RPS0VOJywgYFVuZXhwZWN0ZWQgLCBpbiAke2ZjTmFtZX1gKTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChpIDwgZmMuaXRlbXMubGVuZ3RoIC0gMSlcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcihwcm9wcy5zdGFydCwgJ1VORVhQRUNURURfVE9LRU4nLCBgVW5leHBlY3RlZCBlbXB0eSBpdGVtIGluICR7ZmNOYW1lfWApO1xuICAgICAgICAgICAgICAgIGlmIChwcm9wcy5jb21tZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb2xsLmNvbW1lbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xsLmNvbW1lbnQgKz0gJ1xcbicgKyBwcm9wcy5jb21tZW50O1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xsLmNvbW1lbnQgPSBwcm9wcy5jb21tZW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBvZmZzZXQgPSBwcm9wcy5lbmQ7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWlzTWFwICYmIGN0eC5vcHRpb25zLnN0cmljdCAmJiB1dGlsQ29udGFpbnNOZXdsaW5lLmNvbnRhaW5zTmV3bGluZShrZXkpKVxuICAgICAgICAgICAgICAgIG9uRXJyb3Ioa2V5LCAvLyBjaGVja2VkIGJ5IGNvbnRhaW5zTmV3bGluZSgpXG4gICAgICAgICAgICAgICAgJ01VTFRJTElORV9JTVBMSUNJVF9LRVknLCAnSW1wbGljaXQga2V5cyBvZiBmbG93IHNlcXVlbmNlIHBhaXJzIG5lZWQgdG8gYmUgb24gYSBzaW5nbGUgbGluZScpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpID09PSAwKSB7XG4gICAgICAgICAgICBpZiAocHJvcHMuY29tbWEpXG4gICAgICAgICAgICAgICAgb25FcnJvcihwcm9wcy5jb21tYSwgJ1VORVhQRUNURURfVE9LRU4nLCBgVW5leHBlY3RlZCAsIGluICR7ZmNOYW1lfWApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKCFwcm9wcy5jb21tYSlcbiAgICAgICAgICAgICAgICBvbkVycm9yKHByb3BzLnN0YXJ0LCAnTUlTU0lOR19DSEFSJywgYE1pc3NpbmcgLCBiZXR3ZWVuICR7ZmNOYW1lfSBpdGVtc2ApO1xuICAgICAgICAgICAgaWYgKHByb3BzLmNvbW1lbnQpIHtcbiAgICAgICAgICAgICAgICBsZXQgcHJldkl0ZW1Db21tZW50ID0gJyc7XG4gICAgICAgICAgICAgICAgbG9vcDogZm9yIChjb25zdCBzdCBvZiBzdGFydCkge1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHN0LnR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2NvbW1hJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2NvbW1lbnQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZXZJdGVtQ29tbWVudCA9IHN0LnNvdXJjZS5zdWJzdHJpbmcoMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWsgbG9vcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWsgbG9vcDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocHJldkl0ZW1Db21tZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBwcmV2ID0gY29sbC5pdGVtc1tjb2xsLml0ZW1zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaWRlbnRpdHkuaXNQYWlyKHByZXYpKVxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldiA9IHByZXYudmFsdWUgPz8gcHJldi5rZXk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcmV2LmNvbW1lbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2LmNvbW1lbnQgKz0gJ1xcbicgKyBwcmV2SXRlbUNvbW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXYuY29tbWVudCA9IHByZXZJdGVtQ29tbWVudDtcbiAgICAgICAgICAgICAgICAgICAgcHJvcHMuY29tbWVudCA9IHByb3BzLmNvbW1lbnQuc3Vic3RyaW5nKHByZXZJdGVtQ29tbWVudC5sZW5ndGggKyAxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFpc01hcCAmJiAhc2VwICYmICFwcm9wcy5mb3VuZCkge1xuICAgICAgICAgICAgLy8gaXRlbSBpcyBhIHZhbHVlIGluIGEgc2VxXG4gICAgICAgICAgICAvLyDihpIga2V5ICYgc2VwIGFyZSBlbXB0eSwgc3RhcnQgZG9lcyBub3QgaW5jbHVkZSA/IG9yIDpcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlTm9kZSA9IHZhbHVlXG4gICAgICAgICAgICAgICAgPyBjb21wb3NlTm9kZShjdHgsIHZhbHVlLCBwcm9wcywgb25FcnJvcilcbiAgICAgICAgICAgICAgICA6IGNvbXBvc2VFbXB0eU5vZGUoY3R4LCBwcm9wcy5lbmQsIHNlcCwgbnVsbCwgcHJvcHMsIG9uRXJyb3IpO1xuICAgICAgICAgICAgY29sbC5pdGVtcy5wdXNoKHZhbHVlTm9kZSk7XG4gICAgICAgICAgICBvZmZzZXQgPSB2YWx1ZU5vZGUucmFuZ2VbMl07XG4gICAgICAgICAgICBpZiAoaXNCbG9jayh2YWx1ZSkpXG4gICAgICAgICAgICAgICAgb25FcnJvcih2YWx1ZU5vZGUucmFuZ2UsICdCTE9DS19JTl9GTE9XJywgYmxvY2tNc2cpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gaXRlbSBpcyBhIGtleSt2YWx1ZSBwYWlyXG4gICAgICAgICAgICAvLyBrZXkgdmFsdWVcbiAgICAgICAgICAgIGN0eC5hdEtleSA9IHRydWU7XG4gICAgICAgICAgICBjb25zdCBrZXlTdGFydCA9IHByb3BzLmVuZDtcbiAgICAgICAgICAgIGNvbnN0IGtleU5vZGUgPSBrZXlcbiAgICAgICAgICAgICAgICA/IGNvbXBvc2VOb2RlKGN0eCwga2V5LCBwcm9wcywgb25FcnJvcilcbiAgICAgICAgICAgICAgICA6IGNvbXBvc2VFbXB0eU5vZGUoY3R4LCBrZXlTdGFydCwgc3RhcnQsIG51bGwsIHByb3BzLCBvbkVycm9yKTtcbiAgICAgICAgICAgIGlmIChpc0Jsb2NrKGtleSkpXG4gICAgICAgICAgICAgICAgb25FcnJvcihrZXlOb2RlLnJhbmdlLCAnQkxPQ0tfSU5fRkxPVycsIGJsb2NrTXNnKTtcbiAgICAgICAgICAgIGN0eC5hdEtleSA9IGZhbHNlO1xuICAgICAgICAgICAgLy8gdmFsdWUgcHJvcGVydGllc1xuICAgICAgICAgICAgY29uc3QgdmFsdWVQcm9wcyA9IHJlc29sdmVQcm9wcy5yZXNvbHZlUHJvcHMoc2VwID8/IFtdLCB7XG4gICAgICAgICAgICAgICAgZmxvdzogZmNOYW1lLFxuICAgICAgICAgICAgICAgIGluZGljYXRvcjogJ21hcC12YWx1ZS1pbmQnLFxuICAgICAgICAgICAgICAgIG5leHQ6IHZhbHVlLFxuICAgICAgICAgICAgICAgIG9mZnNldDoga2V5Tm9kZS5yYW5nZVsyXSxcbiAgICAgICAgICAgICAgICBvbkVycm9yLFxuICAgICAgICAgICAgICAgIHBhcmVudEluZGVudDogZmMuaW5kZW50LFxuICAgICAgICAgICAgICAgIHN0YXJ0T25OZXdsaW5lOiBmYWxzZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAodmFsdWVQcm9wcy5mb3VuZCkge1xuICAgICAgICAgICAgICAgIGlmICghaXNNYXAgJiYgIXByb3BzLmZvdW5kICYmIGN0eC5vcHRpb25zLnN0cmljdCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2VwKVxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBzdCBvZiBzZXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3QgPT09IHZhbHVlUHJvcHMuZm91bmQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdC50eXBlID09PSAnbmV3bGluZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25FcnJvcihzdCwgJ01VTFRJTElORV9JTVBMSUNJVF9LRVknLCAnSW1wbGljaXQga2V5cyBvZiBmbG93IHNlcXVlbmNlIHBhaXJzIG5lZWQgdG8gYmUgb24gYSBzaW5nbGUgbGluZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9wcy5zdGFydCA8IHZhbHVlUHJvcHMuZm91bmQub2Zmc2V0IC0gMTAyNClcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRXJyb3IodmFsdWVQcm9wcy5mb3VuZCwgJ0tFWV9PVkVSXzEwMjRfQ0hBUlMnLCAnVGhlIDogaW5kaWNhdG9yIG11c3QgYmUgYXQgbW9zdCAxMDI0IGNoYXJzIGFmdGVyIHRoZSBzdGFydCBvZiBhbiBpbXBsaWNpdCBmbG93IHNlcXVlbmNlIGtleScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCdzb3VyY2UnIGluIHZhbHVlICYmIHZhbHVlLnNvdXJjZT8uWzBdID09PSAnOicpXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IodmFsdWUsICdNSVNTSU5HX0NIQVInLCBgTWlzc2luZyBzcGFjZSBhZnRlciA6IGluICR7ZmNOYW1lfWApO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcih2YWx1ZVByb3BzLnN0YXJ0LCAnTUlTU0lOR19DSEFSJywgYE1pc3NpbmcgLCBvciA6IGJldHdlZW4gJHtmY05hbWV9IGl0ZW1zYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyB2YWx1ZSB2YWx1ZVxuICAgICAgICAgICAgY29uc3QgdmFsdWVOb2RlID0gdmFsdWVcbiAgICAgICAgICAgICAgICA/IGNvbXBvc2VOb2RlKGN0eCwgdmFsdWUsIHZhbHVlUHJvcHMsIG9uRXJyb3IpXG4gICAgICAgICAgICAgICAgOiB2YWx1ZVByb3BzLmZvdW5kXG4gICAgICAgICAgICAgICAgICAgID8gY29tcG9zZUVtcHR5Tm9kZShjdHgsIHZhbHVlUHJvcHMuZW5kLCBzZXAsIG51bGwsIHZhbHVlUHJvcHMsIG9uRXJyb3IpXG4gICAgICAgICAgICAgICAgICAgIDogbnVsbDtcbiAgICAgICAgICAgIGlmICh2YWx1ZU5vZGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNCbG9jayh2YWx1ZSkpXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IodmFsdWVOb2RlLnJhbmdlLCAnQkxPQ0tfSU5fRkxPVycsIGJsb2NrTXNnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHZhbHVlUHJvcHMuY29tbWVudCkge1xuICAgICAgICAgICAgICAgIGlmIChrZXlOb2RlLmNvbW1lbnQpXG4gICAgICAgICAgICAgICAgICAgIGtleU5vZGUuY29tbWVudCArPSAnXFxuJyArIHZhbHVlUHJvcHMuY29tbWVudDtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGtleU5vZGUuY29tbWVudCA9IHZhbHVlUHJvcHMuY29tbWVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHBhaXIgPSBuZXcgUGFpci5QYWlyKGtleU5vZGUsIHZhbHVlTm9kZSk7XG4gICAgICAgICAgICBpZiAoY3R4Lm9wdGlvbnMua2VlcFNvdXJjZVRva2VucylcbiAgICAgICAgICAgICAgICBwYWlyLnNyY1Rva2VuID0gY29sbEl0ZW07XG4gICAgICAgICAgICBpZiAoaXNNYXApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXAgPSBjb2xsO1xuICAgICAgICAgICAgICAgIGlmICh1dGlsTWFwSW5jbHVkZXMubWFwSW5jbHVkZXMoY3R4LCBtYXAuaXRlbXMsIGtleU5vZGUpKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKGtleVN0YXJ0LCAnRFVQTElDQVRFX0tFWScsICdNYXAga2V5cyBtdXN0IGJlIHVuaXF1ZScpO1xuICAgICAgICAgICAgICAgIG1hcC5pdGVtcy5wdXNoKHBhaXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWFwID0gbmV3IFlBTUxNYXAuWUFNTE1hcChjdHguc2NoZW1hKTtcbiAgICAgICAgICAgICAgICBtYXAuZmxvdyA9IHRydWU7XG4gICAgICAgICAgICAgICAgbWFwLml0ZW1zLnB1c2gocGFpcik7XG4gICAgICAgICAgICAgICAgY29uc3QgZW5kUmFuZ2UgPSAodmFsdWVOb2RlID8/IGtleU5vZGUpLnJhbmdlO1xuICAgICAgICAgICAgICAgIG1hcC5yYW5nZSA9IFtrZXlOb2RlLnJhbmdlWzBdLCBlbmRSYW5nZVsxXSwgZW5kUmFuZ2VbMl1dO1xuICAgICAgICAgICAgICAgIGNvbGwuaXRlbXMucHVzaChtYXApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb2Zmc2V0ID0gdmFsdWVOb2RlID8gdmFsdWVOb2RlLnJhbmdlWzJdIDogdmFsdWVQcm9wcy5lbmQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgZXhwZWN0ZWRFbmQgPSBpc01hcCA/ICd9JyA6ICddJztcbiAgICBjb25zdCBbY2UsIC4uLmVlXSA9IGZjLmVuZDtcbiAgICBsZXQgY2VQb3MgPSBvZmZzZXQ7XG4gICAgaWYgKGNlPy5zb3VyY2UgPT09IGV4cGVjdGVkRW5kKVxuICAgICAgICBjZVBvcyA9IGNlLm9mZnNldCArIGNlLnNvdXJjZS5sZW5ndGg7XG4gICAgZWxzZSB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBmY05hbWVbMF0udG9VcHBlckNhc2UoKSArIGZjTmFtZS5zdWJzdHJpbmcoMSk7XG4gICAgICAgIGNvbnN0IG1zZyA9IGF0Um9vdFxuICAgICAgICAgICAgPyBgJHtuYW1lfSBtdXN0IGVuZCB3aXRoIGEgJHtleHBlY3RlZEVuZH1gXG4gICAgICAgICAgICA6IGAke25hbWV9IGluIGJsb2NrIGNvbGxlY3Rpb24gbXVzdCBiZSBzdWZmaWNpZW50bHkgaW5kZW50ZWQgYW5kIGVuZCB3aXRoIGEgJHtleHBlY3RlZEVuZH1gO1xuICAgICAgICBvbkVycm9yKG9mZnNldCwgYXRSb290ID8gJ01JU1NJTkdfQ0hBUicgOiAnQkFEX0lOREVOVCcsIG1zZyk7XG4gICAgICAgIGlmIChjZSAmJiBjZS5zb3VyY2UubGVuZ3RoICE9PSAxKVxuICAgICAgICAgICAgZWUudW5zaGlmdChjZSk7XG4gICAgfVxuICAgIGlmIChlZS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGVuZCA9IHJlc29sdmVFbmQucmVzb2x2ZUVuZChlZSwgY2VQb3MsIGN0eC5vcHRpb25zLnN0cmljdCwgb25FcnJvcik7XG4gICAgICAgIGlmIChlbmQuY29tbWVudCkge1xuICAgICAgICAgICAgaWYgKGNvbGwuY29tbWVudClcbiAgICAgICAgICAgICAgICBjb2xsLmNvbW1lbnQgKz0gJ1xcbicgKyBlbmQuY29tbWVudDtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBjb2xsLmNvbW1lbnQgPSBlbmQuY29tbWVudDtcbiAgICAgICAgfVxuICAgICAgICBjb2xsLnJhbmdlID0gW2ZjLm9mZnNldCwgY2VQb3MsIGVuZC5vZmZzZXRdO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgY29sbC5yYW5nZSA9IFtmYy5vZmZzZXQsIGNlUG9zLCBjZVBvc107XG4gICAgfVxuICAgIHJldHVybiBjb2xsO1xufVxuXG5leHBvcnRzLnJlc29sdmVGbG93Q29sbGVjdGlvbiA9IHJlc29sdmVGbG93Q29sbGVjdGlvbjtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuLi9ub2Rlcy9pZGVudGl0eS5qcycpO1xudmFyIFNjYWxhciA9IHJlcXVpcmUoJy4uL25vZGVzL1NjYWxhci5qcycpO1xudmFyIFlBTUxNYXAgPSByZXF1aXJlKCcuLi9ub2Rlcy9ZQU1MTWFwLmpzJyk7XG52YXIgWUFNTFNlcSA9IHJlcXVpcmUoJy4uL25vZGVzL1lBTUxTZXEuanMnKTtcbnZhciByZXNvbHZlQmxvY2tNYXAgPSByZXF1aXJlKCcuL3Jlc29sdmUtYmxvY2stbWFwLmpzJyk7XG52YXIgcmVzb2x2ZUJsb2NrU2VxID0gcmVxdWlyZSgnLi9yZXNvbHZlLWJsb2NrLXNlcS5qcycpO1xudmFyIHJlc29sdmVGbG93Q29sbGVjdGlvbiA9IHJlcXVpcmUoJy4vcmVzb2x2ZS1mbG93LWNvbGxlY3Rpb24uanMnKTtcblxuZnVuY3Rpb24gcmVzb2x2ZUNvbGxlY3Rpb24oQ04sIGN0eCwgdG9rZW4sIG9uRXJyb3IsIHRhZ05hbWUsIHRhZykge1xuICAgIGNvbnN0IGNvbGwgPSB0b2tlbi50eXBlID09PSAnYmxvY2stbWFwJ1xuICAgICAgICA/IHJlc29sdmVCbG9ja01hcC5yZXNvbHZlQmxvY2tNYXAoQ04sIGN0eCwgdG9rZW4sIG9uRXJyb3IsIHRhZylcbiAgICAgICAgOiB0b2tlbi50eXBlID09PSAnYmxvY2stc2VxJ1xuICAgICAgICAgICAgPyByZXNvbHZlQmxvY2tTZXEucmVzb2x2ZUJsb2NrU2VxKENOLCBjdHgsIHRva2VuLCBvbkVycm9yLCB0YWcpXG4gICAgICAgICAgICA6IHJlc29sdmVGbG93Q29sbGVjdGlvbi5yZXNvbHZlRmxvd0NvbGxlY3Rpb24oQ04sIGN0eCwgdG9rZW4sIG9uRXJyb3IsIHRhZyk7XG4gICAgY29uc3QgQ29sbCA9IGNvbGwuY29uc3RydWN0b3I7XG4gICAgLy8gSWYgd2UgZ290IGEgdGFnTmFtZSBtYXRjaGluZyB0aGUgY2xhc3MsIG9yIHRoZSB0YWcgbmFtZSBpcyAnIScsXG4gICAgLy8gdGhlbiB1c2UgdGhlIHRhZ05hbWUgZnJvbSB0aGUgbm9kZSBjbGFzcyB1c2VkIHRvIGNyZWF0ZSBpdC5cbiAgICBpZiAodGFnTmFtZSA9PT0gJyEnIHx8IHRhZ05hbWUgPT09IENvbGwudGFnTmFtZSkge1xuICAgICAgICBjb2xsLnRhZyA9IENvbGwudGFnTmFtZTtcbiAgICAgICAgcmV0dXJuIGNvbGw7XG4gICAgfVxuICAgIGlmICh0YWdOYW1lKVxuICAgICAgICBjb2xsLnRhZyA9IHRhZ05hbWU7XG4gICAgcmV0dXJuIGNvbGw7XG59XG5mdW5jdGlvbiBjb21wb3NlQ29sbGVjdGlvbihDTiwgY3R4LCB0b2tlbiwgcHJvcHMsIG9uRXJyb3IpIHtcbiAgICBjb25zdCB0YWdUb2tlbiA9IHByb3BzLnRhZztcbiAgICBjb25zdCB0YWdOYW1lID0gIXRhZ1Rva2VuXG4gICAgICAgID8gbnVsbFxuICAgICAgICA6IGN0eC5kaXJlY3RpdmVzLnRhZ05hbWUodGFnVG9rZW4uc291cmNlLCBtc2cgPT4gb25FcnJvcih0YWdUb2tlbiwgJ1RBR19SRVNPTFZFX0ZBSUxFRCcsIG1zZykpO1xuICAgIGlmICh0b2tlbi50eXBlID09PSAnYmxvY2stc2VxJykge1xuICAgICAgICBjb25zdCB7IGFuY2hvciwgbmV3bGluZUFmdGVyUHJvcDogbmwgfSA9IHByb3BzO1xuICAgICAgICBjb25zdCBsYXN0UHJvcCA9IGFuY2hvciAmJiB0YWdUb2tlblxuICAgICAgICAgICAgPyBhbmNob3Iub2Zmc2V0ID4gdGFnVG9rZW4ub2Zmc2V0XG4gICAgICAgICAgICAgICAgPyBhbmNob3JcbiAgICAgICAgICAgICAgICA6IHRhZ1Rva2VuXG4gICAgICAgICAgICA6IChhbmNob3IgPz8gdGFnVG9rZW4pO1xuICAgICAgICBpZiAobGFzdFByb3AgJiYgKCFubCB8fCBubC5vZmZzZXQgPCBsYXN0UHJvcC5vZmZzZXQpKSB7XG4gICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gJ01pc3NpbmcgbmV3bGluZSBhZnRlciBibG9jayBzZXF1ZW5jZSBwcm9wcyc7XG4gICAgICAgICAgICBvbkVycm9yKGxhc3RQcm9wLCAnTUlTU0lOR19DSEFSJywgbWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgZXhwVHlwZSA9IHRva2VuLnR5cGUgPT09ICdibG9jay1tYXAnXG4gICAgICAgID8gJ21hcCdcbiAgICAgICAgOiB0b2tlbi50eXBlID09PSAnYmxvY2stc2VxJ1xuICAgICAgICAgICAgPyAnc2VxJ1xuICAgICAgICAgICAgOiB0b2tlbi5zdGFydC5zb3VyY2UgPT09ICd7J1xuICAgICAgICAgICAgICAgID8gJ21hcCdcbiAgICAgICAgICAgICAgICA6ICdzZXEnO1xuICAgIC8vIHNob3J0Y3V0OiBjaGVjayBpZiBpdCdzIGEgZ2VuZXJpYyBZQU1MTWFwIG9yIFlBTUxTZXFcbiAgICAvLyBiZWZvcmUganVtcGluZyBpbnRvIHRoZSBjdXN0b20gdGFnIGxvZ2ljLlxuICAgIGlmICghdGFnVG9rZW4gfHxcbiAgICAgICAgIXRhZ05hbWUgfHxcbiAgICAgICAgdGFnTmFtZSA9PT0gJyEnIHx8XG4gICAgICAgICh0YWdOYW1lID09PSBZQU1MTWFwLllBTUxNYXAudGFnTmFtZSAmJiBleHBUeXBlID09PSAnbWFwJykgfHxcbiAgICAgICAgKHRhZ05hbWUgPT09IFlBTUxTZXEuWUFNTFNlcS50YWdOYW1lICYmIGV4cFR5cGUgPT09ICdzZXEnKSkge1xuICAgICAgICByZXR1cm4gcmVzb2x2ZUNvbGxlY3Rpb24oQ04sIGN0eCwgdG9rZW4sIG9uRXJyb3IsIHRhZ05hbWUpO1xuICAgIH1cbiAgICBsZXQgdGFnID0gY3R4LnNjaGVtYS50YWdzLmZpbmQodCA9PiB0LnRhZyA9PT0gdGFnTmFtZSAmJiB0LmNvbGxlY3Rpb24gPT09IGV4cFR5cGUpO1xuICAgIGlmICghdGFnKSB7XG4gICAgICAgIGNvbnN0IGt0ID0gY3R4LnNjaGVtYS5rbm93blRhZ3NbdGFnTmFtZV07XG4gICAgICAgIGlmIChrdD8uY29sbGVjdGlvbiA9PT0gZXhwVHlwZSkge1xuICAgICAgICAgICAgY3R4LnNjaGVtYS50YWdzLnB1c2goT2JqZWN0LmFzc2lnbih7fSwga3QsIHsgZGVmYXVsdDogZmFsc2UgfSkpO1xuICAgICAgICAgICAgdGFnID0ga3Q7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoa3QpIHtcbiAgICAgICAgICAgICAgICBvbkVycm9yKHRhZ1Rva2VuLCAnQkFEX0NPTExFQ1RJT05fVFlQRScsIGAke2t0LnRhZ30gdXNlZCBmb3IgJHtleHBUeXBlfSBjb2xsZWN0aW9uLCBidXQgZXhwZWN0cyAke2t0LmNvbGxlY3Rpb24gPz8gJ3NjYWxhcid9YCwgdHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBvbkVycm9yKHRhZ1Rva2VuLCAnVEFHX1JFU09MVkVfRkFJTEVEJywgYFVucmVzb2x2ZWQgdGFnOiAke3RhZ05hbWV9YCwgdHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzb2x2ZUNvbGxlY3Rpb24oQ04sIGN0eCwgdG9rZW4sIG9uRXJyb3IsIHRhZ05hbWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGNvbGwgPSByZXNvbHZlQ29sbGVjdGlvbihDTiwgY3R4LCB0b2tlbiwgb25FcnJvciwgdGFnTmFtZSwgdGFnKTtcbiAgICBjb25zdCByZXMgPSB0YWcucmVzb2x2ZT8uKGNvbGwsIG1zZyA9PiBvbkVycm9yKHRhZ1Rva2VuLCAnVEFHX1JFU09MVkVfRkFJTEVEJywgbXNnKSwgY3R4Lm9wdGlvbnMpID8/IGNvbGw7XG4gICAgY29uc3Qgbm9kZSA9IGlkZW50aXR5LmlzTm9kZShyZXMpXG4gICAgICAgID8gcmVzXG4gICAgICAgIDogbmV3IFNjYWxhci5TY2FsYXIocmVzKTtcbiAgICBub2RlLnJhbmdlID0gY29sbC5yYW5nZTtcbiAgICBub2RlLnRhZyA9IHRhZ05hbWU7XG4gICAgaWYgKHRhZz8uZm9ybWF0KVxuICAgICAgICBub2RlLmZvcm1hdCA9IHRhZy5mb3JtYXQ7XG4gICAgcmV0dXJuIG5vZGU7XG59XG5cbmV4cG9ydHMuY29tcG9zZUNvbGxlY3Rpb24gPSBjb21wb3NlQ29sbGVjdGlvbjtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgU2NhbGFyID0gcmVxdWlyZSgnLi4vbm9kZXMvU2NhbGFyLmpzJyk7XG5cbmZ1bmN0aW9uIHJlc29sdmVCbG9ja1NjYWxhcihjdHgsIHNjYWxhciwgb25FcnJvcikge1xuICAgIGNvbnN0IHN0YXJ0ID0gc2NhbGFyLm9mZnNldDtcbiAgICBjb25zdCBoZWFkZXIgPSBwYXJzZUJsb2NrU2NhbGFySGVhZGVyKHNjYWxhciwgY3R4Lm9wdGlvbnMuc3RyaWN0LCBvbkVycm9yKTtcbiAgICBpZiAoIWhlYWRlcilcbiAgICAgICAgcmV0dXJuIHsgdmFsdWU6ICcnLCB0eXBlOiBudWxsLCBjb21tZW50OiAnJywgcmFuZ2U6IFtzdGFydCwgc3RhcnQsIHN0YXJ0XSB9O1xuICAgIGNvbnN0IHR5cGUgPSBoZWFkZXIubW9kZSA9PT0gJz4nID8gU2NhbGFyLlNjYWxhci5CTE9DS19GT0xERUQgOiBTY2FsYXIuU2NhbGFyLkJMT0NLX0xJVEVSQUw7XG4gICAgY29uc3QgbGluZXMgPSBzY2FsYXIuc291cmNlID8gc3BsaXRMaW5lcyhzY2FsYXIuc291cmNlKSA6IFtdO1xuICAgIC8vIGRldGVybWluZSB0aGUgZW5kIG9mIGNvbnRlbnQgJiBzdGFydCBvZiBjaG9tcGluZ1xuICAgIGxldCBjaG9tcFN0YXJ0ID0gbGluZXMubGVuZ3RoO1xuICAgIGZvciAobGV0IGkgPSBsaW5lcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICBjb25zdCBjb250ZW50ID0gbGluZXNbaV1bMV07XG4gICAgICAgIGlmIChjb250ZW50ID09PSAnJyB8fCBjb250ZW50ID09PSAnXFxyJylcbiAgICAgICAgICAgIGNob21wU3RhcnQgPSBpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG4gICAgLy8gc2hvcnRjdXQgZm9yIGVtcHR5IGNvbnRlbnRzXG4gICAgaWYgKGNob21wU3RhcnQgPT09IDApIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBoZWFkZXIuY2hvbXAgPT09ICcrJyAmJiBsaW5lcy5sZW5ndGggPiAwXG4gICAgICAgICAgICA/ICdcXG4nLnJlcGVhdChNYXRoLm1heCgxLCBsaW5lcy5sZW5ndGggLSAxKSlcbiAgICAgICAgICAgIDogJyc7XG4gICAgICAgIGxldCBlbmQgPSBzdGFydCArIGhlYWRlci5sZW5ndGg7XG4gICAgICAgIGlmIChzY2FsYXIuc291cmNlKVxuICAgICAgICAgICAgZW5kICs9IHNjYWxhci5zb3VyY2UubGVuZ3RoO1xuICAgICAgICByZXR1cm4geyB2YWx1ZSwgdHlwZSwgY29tbWVudDogaGVhZGVyLmNvbW1lbnQsIHJhbmdlOiBbc3RhcnQsIGVuZCwgZW5kXSB9O1xuICAgIH1cbiAgICAvLyBmaW5kIHRoZSBpbmRlbnRhdGlvbiBsZXZlbCB0byB0cmltIGZyb20gc3RhcnRcbiAgICBsZXQgdHJpbUluZGVudCA9IHNjYWxhci5pbmRlbnQgKyBoZWFkZXIuaW5kZW50O1xuICAgIGxldCBvZmZzZXQgPSBzY2FsYXIub2Zmc2V0ICsgaGVhZGVyLmxlbmd0aDtcbiAgICBsZXQgY29udGVudFN0YXJ0ID0gMDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNob21wU3RhcnQ7ICsraSkge1xuICAgICAgICBjb25zdCBbaW5kZW50LCBjb250ZW50XSA9IGxpbmVzW2ldO1xuICAgICAgICBpZiAoY29udGVudCA9PT0gJycgfHwgY29udGVudCA9PT0gJ1xccicpIHtcbiAgICAgICAgICAgIGlmIChoZWFkZXIuaW5kZW50ID09PSAwICYmIGluZGVudC5sZW5ndGggPiB0cmltSW5kZW50KVxuICAgICAgICAgICAgICAgIHRyaW1JbmRlbnQgPSBpbmRlbnQubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKGluZGVudC5sZW5ndGggPCB0cmltSW5kZW50KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9ICdCbG9jayBzY2FsYXJzIHdpdGggbW9yZS1pbmRlbnRlZCBsZWFkaW5nIGVtcHR5IGxpbmVzIG11c3QgdXNlIGFuIGV4cGxpY2l0IGluZGVudGF0aW9uIGluZGljYXRvcic7XG4gICAgICAgICAgICAgICAgb25FcnJvcihvZmZzZXQgKyBpbmRlbnQubGVuZ3RoLCAnTUlTU0lOR19DSEFSJywgbWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaGVhZGVyLmluZGVudCA9PT0gMClcbiAgICAgICAgICAgICAgICB0cmltSW5kZW50ID0gaW5kZW50Lmxlbmd0aDtcbiAgICAgICAgICAgIGNvbnRlbnRTdGFydCA9IGk7XG4gICAgICAgICAgICBpZiAodHJpbUluZGVudCA9PT0gMCAmJiAhY3R4LmF0Um9vdCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSAnQmxvY2sgc2NhbGFyIHZhbHVlcyBpbiBjb2xsZWN0aW9ucyBtdXN0IGJlIGluZGVudGVkJztcbiAgICAgICAgICAgICAgICBvbkVycm9yKG9mZnNldCwgJ0JBRF9JTkRFTlQnLCBtZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIG9mZnNldCArPSBpbmRlbnQubGVuZ3RoICsgY29udGVudC5sZW5ndGggKyAxO1xuICAgIH1cbiAgICAvLyBpbmNsdWRlIHRyYWlsaW5nIG1vcmUtaW5kZW50ZWQgZW1wdHkgbGluZXMgaW4gY29udGVudFxuICAgIGZvciAobGV0IGkgPSBsaW5lcy5sZW5ndGggLSAxOyBpID49IGNob21wU3RhcnQ7IC0taSkge1xuICAgICAgICBpZiAobGluZXNbaV1bMF0ubGVuZ3RoID4gdHJpbUluZGVudClcbiAgICAgICAgICAgIGNob21wU3RhcnQgPSBpICsgMTtcbiAgICB9XG4gICAgbGV0IHZhbHVlID0gJyc7XG4gICAgbGV0IHNlcCA9ICcnO1xuICAgIGxldCBwcmV2TW9yZUluZGVudGVkID0gZmFsc2U7XG4gICAgLy8gbGVhZGluZyB3aGl0ZXNwYWNlIGlzIGtlcHQgaW50YWN0XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb250ZW50U3RhcnQ7ICsraSlcbiAgICAgICAgdmFsdWUgKz0gbGluZXNbaV1bMF0uc2xpY2UodHJpbUluZGVudCkgKyAnXFxuJztcbiAgICBmb3IgKGxldCBpID0gY29udGVudFN0YXJ0OyBpIDwgY2hvbXBTdGFydDsgKytpKSB7XG4gICAgICAgIGxldCBbaW5kZW50LCBjb250ZW50XSA9IGxpbmVzW2ldO1xuICAgICAgICBvZmZzZXQgKz0gaW5kZW50Lmxlbmd0aCArIGNvbnRlbnQubGVuZ3RoICsgMTtcbiAgICAgICAgY29uc3QgY3JsZiA9IGNvbnRlbnRbY29udGVudC5sZW5ndGggLSAxXSA9PT0gJ1xccic7XG4gICAgICAgIGlmIChjcmxmKVxuICAgICAgICAgICAgY29udGVudCA9IGNvbnRlbnQuc2xpY2UoMCwgLTEpO1xuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgYWxyZWFkeSBjYXVnaHQgaW4gbGV4ZXIgKi9cbiAgICAgICAgaWYgKGNvbnRlbnQgJiYgaW5kZW50Lmxlbmd0aCA8IHRyaW1JbmRlbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IHNyYyA9IGhlYWRlci5pbmRlbnRcbiAgICAgICAgICAgICAgICA/ICdleHBsaWNpdCBpbmRlbnRhdGlvbiBpbmRpY2F0b3InXG4gICAgICAgICAgICAgICAgOiAnZmlyc3QgbGluZSc7XG4gICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gYEJsb2NrIHNjYWxhciBsaW5lcyBtdXN0IG5vdCBiZSBsZXNzIGluZGVudGVkIHRoYW4gdGhlaXIgJHtzcmN9YDtcbiAgICAgICAgICAgIG9uRXJyb3Iob2Zmc2V0IC0gY29udGVudC5sZW5ndGggLSAoY3JsZiA/IDIgOiAxKSwgJ0JBRF9JTkRFTlQnLCBtZXNzYWdlKTtcbiAgICAgICAgICAgIGluZGVudCA9ICcnO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlID09PSBTY2FsYXIuU2NhbGFyLkJMT0NLX0xJVEVSQUwpIHtcbiAgICAgICAgICAgIHZhbHVlICs9IHNlcCArIGluZGVudC5zbGljZSh0cmltSW5kZW50KSArIGNvbnRlbnQ7XG4gICAgICAgICAgICBzZXAgPSAnXFxuJztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpbmRlbnQubGVuZ3RoID4gdHJpbUluZGVudCB8fCBjb250ZW50WzBdID09PSAnXFx0Jykge1xuICAgICAgICAgICAgLy8gbW9yZS1pbmRlbnRlZCBjb250ZW50IHdpdGhpbiBhIGZvbGRlZCBibG9ja1xuICAgICAgICAgICAgaWYgKHNlcCA9PT0gJyAnKVxuICAgICAgICAgICAgICAgIHNlcCA9ICdcXG4nO1xuICAgICAgICAgICAgZWxzZSBpZiAoIXByZXZNb3JlSW5kZW50ZWQgJiYgc2VwID09PSAnXFxuJylcbiAgICAgICAgICAgICAgICBzZXAgPSAnXFxuXFxuJztcbiAgICAgICAgICAgIHZhbHVlICs9IHNlcCArIGluZGVudC5zbGljZSh0cmltSW5kZW50KSArIGNvbnRlbnQ7XG4gICAgICAgICAgICBzZXAgPSAnXFxuJztcbiAgICAgICAgICAgIHByZXZNb3JlSW5kZW50ZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGNvbnRlbnQgPT09ICcnKSB7XG4gICAgICAgICAgICAvLyBlbXB0eSBsaW5lXG4gICAgICAgICAgICBpZiAoc2VwID09PSAnXFxuJylcbiAgICAgICAgICAgICAgICB2YWx1ZSArPSAnXFxuJztcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBzZXAgPSAnXFxuJztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHZhbHVlICs9IHNlcCArIGNvbnRlbnQ7XG4gICAgICAgICAgICBzZXAgPSAnICc7XG4gICAgICAgICAgICBwcmV2TW9yZUluZGVudGVkID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc3dpdGNoIChoZWFkZXIuY2hvbXApIHtcbiAgICAgICAgY2FzZSAnLSc6XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnKyc6XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gY2hvbXBTdGFydDsgaSA8IGxpbmVzLmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgICAgIHZhbHVlICs9ICdcXG4nICsgbGluZXNbaV1bMF0uc2xpY2UodHJpbUluZGVudCk7XG4gICAgICAgICAgICBpZiAodmFsdWVbdmFsdWUubGVuZ3RoIC0gMV0gIT09ICdcXG4nKVxuICAgICAgICAgICAgICAgIHZhbHVlICs9ICdcXG4nO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB2YWx1ZSArPSAnXFxuJztcbiAgICB9XG4gICAgY29uc3QgZW5kID0gc3RhcnQgKyBoZWFkZXIubGVuZ3RoICsgc2NhbGFyLnNvdXJjZS5sZW5ndGg7XG4gICAgcmV0dXJuIHsgdmFsdWUsIHR5cGUsIGNvbW1lbnQ6IGhlYWRlci5jb21tZW50LCByYW5nZTogW3N0YXJ0LCBlbmQsIGVuZF0gfTtcbn1cbmZ1bmN0aW9uIHBhcnNlQmxvY2tTY2FsYXJIZWFkZXIoeyBvZmZzZXQsIHByb3BzIH0sIHN0cmljdCwgb25FcnJvcikge1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiBzaG91bGQgbm90IGhhcHBlbiAqL1xuICAgIGlmIChwcm9wc1swXS50eXBlICE9PSAnYmxvY2stc2NhbGFyLWhlYWRlcicpIHtcbiAgICAgICAgb25FcnJvcihwcm9wc1swXSwgJ0lNUE9TU0lCTEUnLCAnQmxvY2sgc2NhbGFyIGhlYWRlciBub3QgZm91bmQnKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHsgc291cmNlIH0gPSBwcm9wc1swXTtcbiAgICBjb25zdCBtb2RlID0gc291cmNlWzBdO1xuICAgIGxldCBpbmRlbnQgPSAwO1xuICAgIGxldCBjaG9tcCA9ICcnO1xuICAgIGxldCBlcnJvciA9IC0xO1xuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgc291cmNlLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGNvbnN0IGNoID0gc291cmNlW2ldO1xuICAgICAgICBpZiAoIWNob21wICYmIChjaCA9PT0gJy0nIHx8IGNoID09PSAnKycpKVxuICAgICAgICAgICAgY2hvbXAgPSBjaDtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBuID0gTnVtYmVyKGNoKTtcbiAgICAgICAgICAgIGlmICghaW5kZW50ICYmIG4pXG4gICAgICAgICAgICAgICAgaW5kZW50ID0gbjtcbiAgICAgICAgICAgIGVsc2UgaWYgKGVycm9yID09PSAtMSlcbiAgICAgICAgICAgICAgICBlcnJvciA9IG9mZnNldCArIGk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGVycm9yICE9PSAtMSlcbiAgICAgICAgb25FcnJvcihlcnJvciwgJ1VORVhQRUNURURfVE9LRU4nLCBgQmxvY2sgc2NhbGFyIGhlYWRlciBpbmNsdWRlcyBleHRyYSBjaGFyYWN0ZXJzOiAke3NvdXJjZX1gKTtcbiAgICBsZXQgaGFzU3BhY2UgPSBmYWxzZTtcbiAgICBsZXQgY29tbWVudCA9ICcnO1xuICAgIGxldCBsZW5ndGggPSBzb3VyY2UubGVuZ3RoO1xuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgcHJvcHMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgY29uc3QgdG9rZW4gPSBwcm9wc1tpXTtcbiAgICAgICAgc3dpdGNoICh0b2tlbi50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICAgICAgaGFzU3BhY2UgPSB0cnVlO1xuICAgICAgICAgICAgLy8gZmFsbHRocm91Z2hcbiAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgIGxlbmd0aCArPSB0b2tlbi5zb3VyY2UubGVuZ3RoO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgICAgICAgICAgaWYgKHN0cmljdCAmJiAhaGFzU3BhY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9ICdDb21tZW50cyBtdXN0IGJlIHNlcGFyYXRlZCBmcm9tIG90aGVyIHRva2VucyBieSB3aGl0ZSBzcGFjZSBjaGFyYWN0ZXJzJztcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcih0b2tlbiwgJ01JU1NJTkdfQ0hBUicsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZW5ndGggKz0gdG9rZW4uc291cmNlLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBjb21tZW50ID0gdG9rZW4uc291cmNlLnN1YnN0cmluZygxKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2Vycm9yJzpcbiAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnVU5FWFBFQ1RFRF9UT0tFTicsIHRva2VuLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIGxlbmd0aCArPSB0b2tlbi5zb3VyY2UubGVuZ3RoO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgc2hvdWxkIG5vdCBoYXBwZW4gKi9cbiAgICAgICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gYFVuZXhwZWN0ZWQgdG9rZW4gaW4gYmxvY2sgc2NhbGFyIGhlYWRlcjogJHt0b2tlbi50eXBlfWA7XG4gICAgICAgICAgICAgICAgb25FcnJvcih0b2tlbiwgJ1VORVhQRUNURURfVE9LRU4nLCBtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICBjb25zdCB0cyA9IHRva2VuLnNvdXJjZTtcbiAgICAgICAgICAgICAgICBpZiAodHMgJiYgdHlwZW9mIHRzID09PSAnc3RyaW5nJylcbiAgICAgICAgICAgICAgICAgICAgbGVuZ3RoICs9IHRzLmxlbmd0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4geyBtb2RlLCBpbmRlbnQsIGNob21wLCBjb21tZW50LCBsZW5ndGggfTtcbn1cbi8qKiBAcmV0dXJucyBBcnJheSBvZiBsaW5lcyBzcGxpdCB1cCBhcyBgW2luZGVudCwgY29udGVudF1gICovXG5mdW5jdGlvbiBzcGxpdExpbmVzKHNvdXJjZSkge1xuICAgIGNvbnN0IHNwbGl0ID0gc291cmNlLnNwbGl0KC9cXG4oICopLyk7XG4gICAgY29uc3QgZmlyc3QgPSBzcGxpdFswXTtcbiAgICBjb25zdCBtID0gZmlyc3QubWF0Y2goL14oICopLyk7XG4gICAgY29uc3QgbGluZTAgPSBtPy5bMV1cbiAgICAgICAgPyBbbVsxXSwgZmlyc3Quc2xpY2UobVsxXS5sZW5ndGgpXVxuICAgICAgICA6IFsnJywgZmlyc3RdO1xuICAgIGNvbnN0IGxpbmVzID0gW2xpbmUwXTtcbiAgICBmb3IgKGxldCBpID0gMTsgaSA8IHNwbGl0Lmxlbmd0aDsgaSArPSAyKVxuICAgICAgICBsaW5lcy5wdXNoKFtzcGxpdFtpXSwgc3BsaXRbaSArIDFdXSk7XG4gICAgcmV0dXJuIGxpbmVzO1xufVxuXG5leHBvcnRzLnJlc29sdmVCbG9ja1NjYWxhciA9IHJlc29sdmVCbG9ja1NjYWxhcjtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgU2NhbGFyID0gcmVxdWlyZSgnLi4vbm9kZXMvU2NhbGFyLmpzJyk7XG52YXIgcmVzb2x2ZUVuZCA9IHJlcXVpcmUoJy4vcmVzb2x2ZS1lbmQuanMnKTtcblxuZnVuY3Rpb24gcmVzb2x2ZUZsb3dTY2FsYXIoc2NhbGFyLCBzdHJpY3QsIG9uRXJyb3IpIHtcbiAgICBjb25zdCB7IG9mZnNldCwgdHlwZSwgc291cmNlLCBlbmQgfSA9IHNjYWxhcjtcbiAgICBsZXQgX3R5cGU7XG4gICAgbGV0IHZhbHVlO1xuICAgIGNvbnN0IF9vbkVycm9yID0gKHJlbCwgY29kZSwgbXNnKSA9PiBvbkVycm9yKG9mZnNldCArIHJlbCwgY29kZSwgbXNnKTtcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgY2FzZSAnc2NhbGFyJzpcbiAgICAgICAgICAgIF90eXBlID0gU2NhbGFyLlNjYWxhci5QTEFJTjtcbiAgICAgICAgICAgIHZhbHVlID0gcGxhaW5WYWx1ZShzb3VyY2UsIF9vbkVycm9yKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdzaW5nbGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgICAgICBfdHlwZSA9IFNjYWxhci5TY2FsYXIuUVVPVEVfU0lOR0xFO1xuICAgICAgICAgICAgdmFsdWUgPSBzaW5nbGVRdW90ZWRWYWx1ZShzb3VyY2UsIF9vbkVycm9yKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdkb3VibGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgICAgICBfdHlwZSA9IFNjYWxhci5TY2FsYXIuUVVPVEVfRE9VQkxFO1xuICAgICAgICAgICAgdmFsdWUgPSBkb3VibGVRdW90ZWRWYWx1ZShzb3VyY2UsIF9vbkVycm9yKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCBzaG91bGQgbm90IGhhcHBlbiAqL1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgb25FcnJvcihzY2FsYXIsICdVTkVYUEVDVEVEX1RPS0VOJywgYEV4cGVjdGVkIGEgZmxvdyBzY2FsYXIgdmFsdWUsIGJ1dCBmb3VuZDogJHt0eXBlfWApO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogJycsXG4gICAgICAgICAgICAgICAgdHlwZTogbnVsbCxcbiAgICAgICAgICAgICAgICBjb21tZW50OiAnJyxcbiAgICAgICAgICAgICAgICByYW5nZTogW29mZnNldCwgb2Zmc2V0ICsgc291cmNlLmxlbmd0aCwgb2Zmc2V0ICsgc291cmNlLmxlbmd0aF1cbiAgICAgICAgICAgIH07XG4gICAgfVxuICAgIGNvbnN0IHZhbHVlRW5kID0gb2Zmc2V0ICsgc291cmNlLmxlbmd0aDtcbiAgICBjb25zdCByZSA9IHJlc29sdmVFbmQucmVzb2x2ZUVuZChlbmQsIHZhbHVlRW5kLCBzdHJpY3QsIG9uRXJyb3IpO1xuICAgIHJldHVybiB7XG4gICAgICAgIHZhbHVlLFxuICAgICAgICB0eXBlOiBfdHlwZSxcbiAgICAgICAgY29tbWVudDogcmUuY29tbWVudCxcbiAgICAgICAgcmFuZ2U6IFtvZmZzZXQsIHZhbHVlRW5kLCByZS5vZmZzZXRdXG4gICAgfTtcbn1cbmZ1bmN0aW9uIHBsYWluVmFsdWUoc291cmNlLCBvbkVycm9yKSB7XG4gICAgbGV0IGJhZENoYXIgPSAnJztcbiAgICBzd2l0Y2ggKHNvdXJjZVswXSkge1xuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCBzaG91bGQgbm90IGhhcHBlbiAqL1xuICAgICAgICBjYXNlICdcXHQnOlxuICAgICAgICAgICAgYmFkQ2hhciA9ICdhIHRhYiBjaGFyYWN0ZXInO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJywnOlxuICAgICAgICAgICAgYmFkQ2hhciA9ICdmbG93IGluZGljYXRvciBjaGFyYWN0ZXIgLCc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnJSc6XG4gICAgICAgICAgICBiYWRDaGFyID0gJ2RpcmVjdGl2ZSBpbmRpY2F0b3IgY2hhcmFjdGVyICUnO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3wnOlxuICAgICAgICBjYXNlICc+Jzoge1xuICAgICAgICAgICAgYmFkQ2hhciA9IGBibG9jayBzY2FsYXIgaW5kaWNhdG9yICR7c291cmNlWzBdfWA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdAJzpcbiAgICAgICAgY2FzZSAnYCc6IHtcbiAgICAgICAgICAgIGJhZENoYXIgPSBgcmVzZXJ2ZWQgY2hhcmFjdGVyICR7c291cmNlWzBdfWA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoYmFkQ2hhcilcbiAgICAgICAgb25FcnJvcigwLCAnQkFEX1NDQUxBUl9TVEFSVCcsIGBQbGFpbiB2YWx1ZSBjYW5ub3Qgc3RhcnQgd2l0aCAke2JhZENoYXJ9YCk7XG4gICAgcmV0dXJuIGZvbGRMaW5lcyhzb3VyY2UpO1xufVxuZnVuY3Rpb24gc2luZ2xlUXVvdGVkVmFsdWUoc291cmNlLCBvbkVycm9yKSB7XG4gICAgaWYgKHNvdXJjZVtzb3VyY2UubGVuZ3RoIC0gMV0gIT09IFwiJ1wiIHx8IHNvdXJjZS5sZW5ndGggPT09IDEpXG4gICAgICAgIG9uRXJyb3Ioc291cmNlLmxlbmd0aCwgJ01JU1NJTkdfQ0hBUicsIFwiTWlzc2luZyBjbG9zaW5nICdxdW90ZVwiKTtcbiAgICByZXR1cm4gZm9sZExpbmVzKHNvdXJjZS5zbGljZSgxLCAtMSkpLnJlcGxhY2UoLycnL2csIFwiJ1wiKTtcbn1cbmZ1bmN0aW9uIGZvbGRMaW5lcyhzb3VyY2UpIHtcbiAgICAvKipcbiAgICAgKiBUaGUgbmVnYXRpdmUgbG9va2JlaGluZCBoZXJlIGFuZCBpbiB0aGUgYHJlYCBSZWdFeHAgaXMgdG9cbiAgICAgKiBwcmV2ZW50IGNhdXNpbmcgYSBwb2x5bm9taWFsIHNlYXJjaCB0aW1lIGluIGNlcnRhaW4gY2FzZXMuXG4gICAgICpcbiAgICAgKiBUaGUgdHJ5LWNhdGNoIGlzIGZvciBTYWZhcmksIHdoaWNoIGRvZXNuJ3Qgc3VwcG9ydCB0aGlzIHlldDpcbiAgICAgKiBodHRwczovL2Nhbml1c2UuY29tL2pzLXJlZ2V4cC1sb29rYmVoaW5kXG4gICAgICovXG4gICAgbGV0IGZpcnN0LCBsaW5lO1xuICAgIHRyeSB7XG4gICAgICAgIGZpcnN0ID0gbmV3IFJlZ0V4cCgnKC4qPykoPzwhWyBcXHRdKVsgXFx0XSpcXHI/XFxuJywgJ3N5Jyk7XG4gICAgICAgIGxpbmUgPSBuZXcgUmVnRXhwKCdbIFxcdF0qKC4qPykoPzooPzwhWyBcXHRdKVsgXFx0XSopP1xccj9cXG4nLCAnc3knKTtcbiAgICB9XG4gICAgY2F0Y2gge1xuICAgICAgICBmaXJzdCA9IC8oLio/KVsgXFx0XSpcXHI/XFxuL3N5O1xuICAgICAgICBsaW5lID0gL1sgXFx0XSooLio/KVsgXFx0XSpcXHI/XFxuL3N5O1xuICAgIH1cbiAgICBsZXQgbWF0Y2ggPSBmaXJzdC5leGVjKHNvdXJjZSk7XG4gICAgaWYgKCFtYXRjaClcbiAgICAgICAgcmV0dXJuIHNvdXJjZTtcbiAgICBsZXQgcmVzID0gbWF0Y2hbMV07XG4gICAgbGV0IHNlcCA9ICcgJztcbiAgICBsZXQgcG9zID0gZmlyc3QubGFzdEluZGV4O1xuICAgIGxpbmUubGFzdEluZGV4ID0gcG9zO1xuICAgIHdoaWxlICgobWF0Y2ggPSBsaW5lLmV4ZWMoc291cmNlKSkpIHtcbiAgICAgICAgaWYgKG1hdGNoWzFdID09PSAnJykge1xuICAgICAgICAgICAgaWYgKHNlcCA9PT0gJ1xcbicpXG4gICAgICAgICAgICAgICAgcmVzICs9IHNlcDtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBzZXAgPSAnXFxuJztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJlcyArPSBzZXAgKyBtYXRjaFsxXTtcbiAgICAgICAgICAgIHNlcCA9ICcgJztcbiAgICAgICAgfVxuICAgICAgICBwb3MgPSBsaW5lLmxhc3RJbmRleDtcbiAgICB9XG4gICAgY29uc3QgbGFzdCA9IC9bIFxcdF0qKC4qKS9zeTtcbiAgICBsYXN0Lmxhc3RJbmRleCA9IHBvcztcbiAgICBtYXRjaCA9IGxhc3QuZXhlYyhzb3VyY2UpO1xuICAgIHJldHVybiByZXMgKyBzZXAgKyAobWF0Y2g/LlsxXSA/PyAnJyk7XG59XG5mdW5jdGlvbiBkb3VibGVRdW90ZWRWYWx1ZShzb3VyY2UsIG9uRXJyb3IpIHtcbiAgICBsZXQgcmVzID0gJyc7XG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPCBzb3VyY2UubGVuZ3RoIC0gMTsgKytpKSB7XG4gICAgICAgIGNvbnN0IGNoID0gc291cmNlW2ldO1xuICAgICAgICBpZiAoY2ggPT09ICdcXHInICYmIHNvdXJjZVtpICsgMV0gPT09ICdcXG4nKVxuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIGlmIChjaCA9PT0gJ1xcbicpIHtcbiAgICAgICAgICAgIGNvbnN0IHsgZm9sZCwgb2Zmc2V0IH0gPSBmb2xkTmV3bGluZShzb3VyY2UsIGkpO1xuICAgICAgICAgICAgcmVzICs9IGZvbGQ7XG4gICAgICAgICAgICBpID0gb2Zmc2V0O1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGNoID09PSAnXFxcXCcpIHtcbiAgICAgICAgICAgIGxldCBuZXh0ID0gc291cmNlWysraV07XG4gICAgICAgICAgICBjb25zdCBjYyA9IGVzY2FwZUNvZGVzW25leHRdO1xuICAgICAgICAgICAgaWYgKGNjKVxuICAgICAgICAgICAgICAgIHJlcyArPSBjYztcbiAgICAgICAgICAgIGVsc2UgaWYgKG5leHQgPT09ICdcXG4nKSB7XG4gICAgICAgICAgICAgICAgLy8gc2tpcCBlc2NhcGVkIG5ld2xpbmVzLCBidXQgc3RpbGwgdHJpbSB0aGUgZm9sbG93aW5nIGxpbmVcbiAgICAgICAgICAgICAgICBuZXh0ID0gc291cmNlW2kgKyAxXTtcbiAgICAgICAgICAgICAgICB3aGlsZSAobmV4dCA9PT0gJyAnIHx8IG5leHQgPT09ICdcXHQnKVxuICAgICAgICAgICAgICAgICAgICBuZXh0ID0gc291cmNlWysraSArIDFdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobmV4dCA9PT0gJ1xccicgJiYgc291cmNlW2kgKyAxXSA9PT0gJ1xcbicpIHtcbiAgICAgICAgICAgICAgICAvLyBza2lwIGVzY2FwZWQgQ1JMRiBuZXdsaW5lcywgYnV0IHN0aWxsIHRyaW0gdGhlIGZvbGxvd2luZyBsaW5lXG4gICAgICAgICAgICAgICAgbmV4dCA9IHNvdXJjZVsrK2kgKyAxXTtcbiAgICAgICAgICAgICAgICB3aGlsZSAobmV4dCA9PT0gJyAnIHx8IG5leHQgPT09ICdcXHQnKVxuICAgICAgICAgICAgICAgICAgICBuZXh0ID0gc291cmNlWysraSArIDFdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobmV4dCA9PT0gJ3gnIHx8IG5leHQgPT09ICd1JyB8fCBuZXh0ID09PSAnVScpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsZW5ndGggPSB7IHg6IDIsIHU6IDQsIFU6IDggfVtuZXh0XTtcbiAgICAgICAgICAgICAgICByZXMgKz0gcGFyc2VDaGFyQ29kZShzb3VyY2UsIGkgKyAxLCBsZW5ndGgsIG9uRXJyb3IpO1xuICAgICAgICAgICAgICAgIGkgKz0gbGVuZ3RoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmF3ID0gc291cmNlLnN1YnN0cihpIC0gMSwgMik7XG4gICAgICAgICAgICAgICAgb25FcnJvcihpIC0gMSwgJ0JBRF9EUV9FU0NBUEUnLCBgSW52YWxpZCBlc2NhcGUgc2VxdWVuY2UgJHtyYXd9YCk7XG4gICAgICAgICAgICAgICAgcmVzICs9IHJhdztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjaCA9PT0gJyAnIHx8IGNoID09PSAnXFx0Jykge1xuICAgICAgICAgICAgLy8gdHJpbSB0cmFpbGluZyB3aGl0ZXNwYWNlXG4gICAgICAgICAgICBjb25zdCB3c1N0YXJ0ID0gaTtcbiAgICAgICAgICAgIGxldCBuZXh0ID0gc291cmNlW2kgKyAxXTtcbiAgICAgICAgICAgIHdoaWxlIChuZXh0ID09PSAnICcgfHwgbmV4dCA9PT0gJ1xcdCcpXG4gICAgICAgICAgICAgICAgbmV4dCA9IHNvdXJjZVsrK2kgKyAxXTtcbiAgICAgICAgICAgIGlmIChuZXh0ICE9PSAnXFxuJyAmJiAhKG5leHQgPT09ICdcXHInICYmIHNvdXJjZVtpICsgMl0gPT09ICdcXG4nKSlcbiAgICAgICAgICAgICAgICByZXMgKz0gaSA+IHdzU3RhcnQgPyBzb3VyY2Uuc2xpY2Uod3NTdGFydCwgaSArIDEpIDogY2g7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXMgKz0gY2g7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHNvdXJjZVtzb3VyY2UubGVuZ3RoIC0gMV0gIT09ICdcIicgfHwgc291cmNlLmxlbmd0aCA9PT0gMSlcbiAgICAgICAgb25FcnJvcihzb3VyY2UubGVuZ3RoLCAnTUlTU0lOR19DSEFSJywgJ01pc3NpbmcgY2xvc2luZyBcInF1b3RlJyk7XG4gICAgcmV0dXJuIHJlcztcbn1cbi8qKlxuICogRm9sZCBhIHNpbmdsZSBuZXdsaW5lIGludG8gYSBzcGFjZSwgbXVsdGlwbGUgbmV3bGluZXMgdG8gTiAtIDEgbmV3bGluZXMuXG4gKiBQcmVzdW1lcyBgc291cmNlW29mZnNldF0gPT09ICdcXG4nYFxuICovXG5mdW5jdGlvbiBmb2xkTmV3bGluZShzb3VyY2UsIG9mZnNldCkge1xuICAgIGxldCBmb2xkID0gJyc7XG4gICAgbGV0IGNoID0gc291cmNlW29mZnNldCArIDFdO1xuICAgIHdoaWxlIChjaCA9PT0gJyAnIHx8IGNoID09PSAnXFx0JyB8fCBjaCA9PT0gJ1xcbicgfHwgY2ggPT09ICdcXHInKSB7XG4gICAgICAgIGlmIChjaCA9PT0gJ1xccicgJiYgc291cmNlW29mZnNldCArIDJdICE9PSAnXFxuJylcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBpZiAoY2ggPT09ICdcXG4nKVxuICAgICAgICAgICAgZm9sZCArPSAnXFxuJztcbiAgICAgICAgb2Zmc2V0ICs9IDE7XG4gICAgICAgIGNoID0gc291cmNlW29mZnNldCArIDFdO1xuICAgIH1cbiAgICBpZiAoIWZvbGQpXG4gICAgICAgIGZvbGQgPSAnICc7XG4gICAgcmV0dXJuIHsgZm9sZCwgb2Zmc2V0IH07XG59XG5jb25zdCBlc2NhcGVDb2RlcyA9IHtcbiAgICAnMCc6ICdcXDAnLCAvLyBudWxsIGNoYXJhY3RlclxuICAgIGE6ICdcXHgwNycsIC8vIGJlbGwgY2hhcmFjdGVyXG4gICAgYjogJ1xcYicsIC8vIGJhY2tzcGFjZVxuICAgIGU6ICdcXHgxYicsIC8vIGVzY2FwZSBjaGFyYWN0ZXJcbiAgICBmOiAnXFxmJywgLy8gZm9ybSBmZWVkXG4gICAgbjogJ1xcbicsIC8vIGxpbmUgZmVlZFxuICAgIHI6ICdcXHInLCAvLyBjYXJyaWFnZSByZXR1cm5cbiAgICB0OiAnXFx0JywgLy8gaG9yaXpvbnRhbCB0YWJcbiAgICB2OiAnXFx2JywgLy8gdmVydGljYWwgdGFiXG4gICAgTjogJ1xcdTAwODUnLCAvLyBVbmljb2RlIG5leHQgbGluZVxuICAgIF86ICdcXHUwMGEwJywgLy8gVW5pY29kZSBub24tYnJlYWtpbmcgc3BhY2VcbiAgICBMOiAnXFx1MjAyOCcsIC8vIFVuaWNvZGUgbGluZSBzZXBhcmF0b3JcbiAgICBQOiAnXFx1MjAyOScsIC8vIFVuaWNvZGUgcGFyYWdyYXBoIHNlcGFyYXRvclxuICAgICcgJzogJyAnLFxuICAgICdcIic6ICdcIicsXG4gICAgJy8nOiAnLycsXG4gICAgJ1xcXFwnOiAnXFxcXCcsXG4gICAgJ1xcdCc6ICdcXHQnXG59O1xuZnVuY3Rpb24gcGFyc2VDaGFyQ29kZShzb3VyY2UsIG9mZnNldCwgbGVuZ3RoLCBvbkVycm9yKSB7XG4gICAgY29uc3QgY2MgPSBzb3VyY2Uuc3Vic3RyKG9mZnNldCwgbGVuZ3RoKTtcbiAgICBjb25zdCBvayA9IGNjLmxlbmd0aCA9PT0gbGVuZ3RoICYmIC9eWzAtOWEtZkEtRl0rJC8udGVzdChjYyk7XG4gICAgY29uc3QgY29kZSA9IG9rID8gcGFyc2VJbnQoY2MsIDE2KSA6IE5hTjtcbiAgICBpZiAoaXNOYU4oY29kZSkpIHtcbiAgICAgICAgY29uc3QgcmF3ID0gc291cmNlLnN1YnN0cihvZmZzZXQgLSAyLCBsZW5ndGggKyAyKTtcbiAgICAgICAgb25FcnJvcihvZmZzZXQgLSAyLCAnQkFEX0RRX0VTQ0FQRScsIGBJbnZhbGlkIGVzY2FwZSBzZXF1ZW5jZSAke3Jhd31gKTtcbiAgICAgICAgcmV0dXJuIHJhdztcbiAgICB9XG4gICAgcmV0dXJuIFN0cmluZy5mcm9tQ29kZVBvaW50KGNvZGUpO1xufVxuXG5leHBvcnRzLnJlc29sdmVGbG93U2NhbGFyID0gcmVzb2x2ZUZsb3dTY2FsYXI7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIGlkZW50aXR5ID0gcmVxdWlyZSgnLi4vbm9kZXMvaWRlbnRpdHkuanMnKTtcbnZhciBTY2FsYXIgPSByZXF1aXJlKCcuLi9ub2Rlcy9TY2FsYXIuanMnKTtcbnZhciByZXNvbHZlQmxvY2tTY2FsYXIgPSByZXF1aXJlKCcuL3Jlc29sdmUtYmxvY2stc2NhbGFyLmpzJyk7XG52YXIgcmVzb2x2ZUZsb3dTY2FsYXIgPSByZXF1aXJlKCcuL3Jlc29sdmUtZmxvdy1zY2FsYXIuanMnKTtcblxuZnVuY3Rpb24gY29tcG9zZVNjYWxhcihjdHgsIHRva2VuLCB0YWdUb2tlbiwgb25FcnJvcikge1xuICAgIGNvbnN0IHsgdmFsdWUsIHR5cGUsIGNvbW1lbnQsIHJhbmdlIH0gPSB0b2tlbi50eXBlID09PSAnYmxvY2stc2NhbGFyJ1xuICAgICAgICA/IHJlc29sdmVCbG9ja1NjYWxhci5yZXNvbHZlQmxvY2tTY2FsYXIoY3R4LCB0b2tlbiwgb25FcnJvcilcbiAgICAgICAgOiByZXNvbHZlRmxvd1NjYWxhci5yZXNvbHZlRmxvd1NjYWxhcih0b2tlbiwgY3R4Lm9wdGlvbnMuc3RyaWN0LCBvbkVycm9yKTtcbiAgICBjb25zdCB0YWdOYW1lID0gdGFnVG9rZW5cbiAgICAgICAgPyBjdHguZGlyZWN0aXZlcy50YWdOYW1lKHRhZ1Rva2VuLnNvdXJjZSwgbXNnID0+IG9uRXJyb3IodGFnVG9rZW4sICdUQUdfUkVTT0xWRV9GQUlMRUQnLCBtc2cpKVxuICAgICAgICA6IG51bGw7XG4gICAgbGV0IHRhZztcbiAgICBpZiAoY3R4Lm9wdGlvbnMuc3RyaW5nS2V5cyAmJiBjdHguYXRLZXkpIHtcbiAgICAgICAgdGFnID0gY3R4LnNjaGVtYVtpZGVudGl0eS5TQ0FMQVJdO1xuICAgIH1cbiAgICBlbHNlIGlmICh0YWdOYW1lKVxuICAgICAgICB0YWcgPSBmaW5kU2NhbGFyVGFnQnlOYW1lKGN0eC5zY2hlbWEsIHZhbHVlLCB0YWdOYW1lLCB0YWdUb2tlbiwgb25FcnJvcik7XG4gICAgZWxzZSBpZiAodG9rZW4udHlwZSA9PT0gJ3NjYWxhcicpXG4gICAgICAgIHRhZyA9IGZpbmRTY2FsYXJUYWdCeVRlc3QoY3R4LCB2YWx1ZSwgdG9rZW4sIG9uRXJyb3IpO1xuICAgIGVsc2VcbiAgICAgICAgdGFnID0gY3R4LnNjaGVtYVtpZGVudGl0eS5TQ0FMQVJdO1xuICAgIGxldCBzY2FsYXI7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzID0gdGFnLnJlc29sdmUodmFsdWUsIG1zZyA9PiBvbkVycm9yKHRhZ1Rva2VuID8/IHRva2VuLCAnVEFHX1JFU09MVkVfRkFJTEVEJywgbXNnKSwgY3R4Lm9wdGlvbnMpO1xuICAgICAgICBzY2FsYXIgPSBpZGVudGl0eS5pc1NjYWxhcihyZXMpID8gcmVzIDogbmV3IFNjYWxhci5TY2FsYXIocmVzKTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1zZyA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgb25FcnJvcih0YWdUb2tlbiA/PyB0b2tlbiwgJ1RBR19SRVNPTFZFX0ZBSUxFRCcsIG1zZyk7XG4gICAgICAgIHNjYWxhciA9IG5ldyBTY2FsYXIuU2NhbGFyKHZhbHVlKTtcbiAgICB9XG4gICAgc2NhbGFyLnJhbmdlID0gcmFuZ2U7XG4gICAgc2NhbGFyLnNvdXJjZSA9IHZhbHVlO1xuICAgIGlmICh0eXBlKVxuICAgICAgICBzY2FsYXIudHlwZSA9IHR5cGU7XG4gICAgaWYgKHRhZ05hbWUpXG4gICAgICAgIHNjYWxhci50YWcgPSB0YWdOYW1lO1xuICAgIGlmICh0YWcuZm9ybWF0KVxuICAgICAgICBzY2FsYXIuZm9ybWF0ID0gdGFnLmZvcm1hdDtcbiAgICBpZiAoY29tbWVudClcbiAgICAgICAgc2NhbGFyLmNvbW1lbnQgPSBjb21tZW50O1xuICAgIHJldHVybiBzY2FsYXI7XG59XG5mdW5jdGlvbiBmaW5kU2NhbGFyVGFnQnlOYW1lKHNjaGVtYSwgdmFsdWUsIHRhZ05hbWUsIHRhZ1Rva2VuLCBvbkVycm9yKSB7XG4gICAgaWYgKHRhZ05hbWUgPT09ICchJylcbiAgICAgICAgcmV0dXJuIHNjaGVtYVtpZGVudGl0eS5TQ0FMQVJdOyAvLyBub24tc3BlY2lmaWMgdGFnXG4gICAgY29uc3QgbWF0Y2hXaXRoVGVzdCA9IFtdO1xuICAgIGZvciAoY29uc3QgdGFnIG9mIHNjaGVtYS50YWdzKSB7XG4gICAgICAgIGlmICghdGFnLmNvbGxlY3Rpb24gJiYgdGFnLnRhZyA9PT0gdGFnTmFtZSkge1xuICAgICAgICAgICAgaWYgKHRhZy5kZWZhdWx0ICYmIHRhZy50ZXN0KVxuICAgICAgICAgICAgICAgIG1hdGNoV2l0aFRlc3QucHVzaCh0YWcpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJldHVybiB0YWc7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yIChjb25zdCB0YWcgb2YgbWF0Y2hXaXRoVGVzdClcbiAgICAgICAgaWYgKHRhZy50ZXN0Py50ZXN0KHZhbHVlKSlcbiAgICAgICAgICAgIHJldHVybiB0YWc7XG4gICAgY29uc3Qga3QgPSBzY2hlbWEua25vd25UYWdzW3RhZ05hbWVdO1xuICAgIGlmIChrdCAmJiAha3QuY29sbGVjdGlvbikge1xuICAgICAgICAvLyBFbnN1cmUgdGhhdCB0aGUga25vd24gdGFnIGlzIGF2YWlsYWJsZSBmb3Igc3RyaW5naWZ5aW5nLFxuICAgICAgICAvLyBidXQgZG9lcyBub3QgZ2V0IHVzZWQgYnkgZGVmYXVsdC5cbiAgICAgICAgc2NoZW1hLnRhZ3MucHVzaChPYmplY3QuYXNzaWduKHt9LCBrdCwgeyBkZWZhdWx0OiBmYWxzZSwgdGVzdDogdW5kZWZpbmVkIH0pKTtcbiAgICAgICAgcmV0dXJuIGt0O1xuICAgIH1cbiAgICBvbkVycm9yKHRhZ1Rva2VuLCAnVEFHX1JFU09MVkVfRkFJTEVEJywgYFVucmVzb2x2ZWQgdGFnOiAke3RhZ05hbWV9YCwgdGFnTmFtZSAhPT0gJ3RhZzp5YW1sLm9yZywyMDAyOnN0cicpO1xuICAgIHJldHVybiBzY2hlbWFbaWRlbnRpdHkuU0NBTEFSXTtcbn1cbmZ1bmN0aW9uIGZpbmRTY2FsYXJUYWdCeVRlc3QoeyBhdEtleSwgZGlyZWN0aXZlcywgc2NoZW1hIH0sIHZhbHVlLCB0b2tlbiwgb25FcnJvcikge1xuICAgIGNvbnN0IHRhZyA9IHNjaGVtYS50YWdzLmZpbmQodGFnID0+ICh0YWcuZGVmYXVsdCA9PT0gdHJ1ZSB8fCAoYXRLZXkgJiYgdGFnLmRlZmF1bHQgPT09ICdrZXknKSkgJiZcbiAgICAgICAgdGFnLnRlc3Q/LnRlc3QodmFsdWUpKSB8fCBzY2hlbWFbaWRlbnRpdHkuU0NBTEFSXTtcbiAgICBpZiAoc2NoZW1hLmNvbXBhdCkge1xuICAgICAgICBjb25zdCBjb21wYXQgPSBzY2hlbWEuY29tcGF0LmZpbmQodGFnID0+IHRhZy5kZWZhdWx0ICYmIHRhZy50ZXN0Py50ZXN0KHZhbHVlKSkgPz9cbiAgICAgICAgICAgIHNjaGVtYVtpZGVudGl0eS5TQ0FMQVJdO1xuICAgICAgICBpZiAodGFnLnRhZyAhPT0gY29tcGF0LnRhZykge1xuICAgICAgICAgICAgY29uc3QgdHMgPSBkaXJlY3RpdmVzLnRhZ1N0cmluZyh0YWcudGFnKTtcbiAgICAgICAgICAgIGNvbnN0IGNzID0gZGlyZWN0aXZlcy50YWdTdHJpbmcoY29tcGF0LnRhZyk7XG4gICAgICAgICAgICBjb25zdCBtc2cgPSBgVmFsdWUgbWF5IGJlIHBhcnNlZCBhcyBlaXRoZXIgJHt0c30gb3IgJHtjc31gO1xuICAgICAgICAgICAgb25FcnJvcih0b2tlbiwgJ1RBR19SRVNPTFZFX0ZBSUxFRCcsIG1zZywgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRhZztcbn1cblxuZXhwb3J0cy5jb21wb3NlU2NhbGFyID0gY29tcG9zZVNjYWxhcjtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBlbXB0eVNjYWxhclBvc2l0aW9uKG9mZnNldCwgYmVmb3JlLCBwb3MpIHtcbiAgICBpZiAoYmVmb3JlKSB7XG4gICAgICAgIHBvcyA/PyAocG9zID0gYmVmb3JlLmxlbmd0aCk7XG4gICAgICAgIGZvciAobGV0IGkgPSBwb3MgLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICAgICAgbGV0IHN0ID0gYmVmb3JlW2ldO1xuICAgICAgICAgICAgc3dpdGNoIChzdC50eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ2NvbW1lbnQnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQgLT0gc3Quc291cmNlLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBUZWNobmljYWxseSwgYW4gZW1wdHkgc2NhbGFyIGlzIGltbWVkaWF0ZWx5IGFmdGVyIHRoZSBsYXN0IG5vbi1lbXB0eVxuICAgICAgICAgICAgLy8gbm9kZSwgYnV0IGl0J3MgbW9yZSB1c2VmdWwgdG8gcGxhY2UgaXQgYWZ0ZXIgYW55IHdoaXRlc3BhY2UuXG4gICAgICAgICAgICBzdCA9IGJlZm9yZVsrK2ldO1xuICAgICAgICAgICAgd2hpbGUgKHN0Py50eXBlID09PSAnc3BhY2UnKSB7XG4gICAgICAgICAgICAgICAgb2Zmc2V0ICs9IHN0LnNvdXJjZS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgc3QgPSBiZWZvcmVbKytpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvZmZzZXQ7XG59XG5cbmV4cG9ydHMuZW1wdHlTY2FsYXJQb3NpdGlvbiA9IGVtcHR5U2NhbGFyUG9zaXRpb247XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIEFsaWFzID0gcmVxdWlyZSgnLi4vbm9kZXMvQWxpYXMuanMnKTtcbnZhciBpZGVudGl0eSA9IHJlcXVpcmUoJy4uL25vZGVzL2lkZW50aXR5LmpzJyk7XG52YXIgY29tcG9zZUNvbGxlY3Rpb24gPSByZXF1aXJlKCcuL2NvbXBvc2UtY29sbGVjdGlvbi5qcycpO1xudmFyIGNvbXBvc2VTY2FsYXIgPSByZXF1aXJlKCcuL2NvbXBvc2Utc2NhbGFyLmpzJyk7XG52YXIgcmVzb2x2ZUVuZCA9IHJlcXVpcmUoJy4vcmVzb2x2ZS1lbmQuanMnKTtcbnZhciB1dGlsRW1wdHlTY2FsYXJQb3NpdGlvbiA9IHJlcXVpcmUoJy4vdXRpbC1lbXB0eS1zY2FsYXItcG9zaXRpb24uanMnKTtcblxuY29uc3QgQ04gPSB7IGNvbXBvc2VOb2RlLCBjb21wb3NlRW1wdHlOb2RlIH07XG5mdW5jdGlvbiBjb21wb3NlTm9kZShjdHgsIHRva2VuLCBwcm9wcywgb25FcnJvcikge1xuICAgIGNvbnN0IGF0S2V5ID0gY3R4LmF0S2V5O1xuICAgIGNvbnN0IHsgc3BhY2VCZWZvcmUsIGNvbW1lbnQsIGFuY2hvciwgdGFnIH0gPSBwcm9wcztcbiAgICBsZXQgbm9kZTtcbiAgICBsZXQgaXNTcmNUb2tlbiA9IHRydWU7XG4gICAgc3dpdGNoICh0b2tlbi50eXBlKSB7XG4gICAgICAgIGNhc2UgJ2FsaWFzJzpcbiAgICAgICAgICAgIG5vZGUgPSBjb21wb3NlQWxpYXMoY3R4LCB0b2tlbiwgb25FcnJvcik7XG4gICAgICAgICAgICBpZiAoYW5jaG9yIHx8IHRhZylcbiAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnQUxJQVNfUFJPUFMnLCAnQW4gYWxpYXMgbm9kZSBtdXN0IG5vdCBzcGVjaWZ5IGFueSBwcm9wZXJ0aWVzJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnc2NhbGFyJzpcbiAgICAgICAgY2FzZSAnc2luZ2xlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICBjYXNlICdkb3VibGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgIGNhc2UgJ2Jsb2NrLXNjYWxhcic6XG4gICAgICAgICAgICBub2RlID0gY29tcG9zZVNjYWxhci5jb21wb3NlU2NhbGFyKGN0eCwgdG9rZW4sIHRhZywgb25FcnJvcik7XG4gICAgICAgICAgICBpZiAoYW5jaG9yKVxuICAgICAgICAgICAgICAgIG5vZGUuYW5jaG9yID0gYW5jaG9yLnNvdXJjZS5zdWJzdHJpbmcoMSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnYmxvY2stbWFwJzpcbiAgICAgICAgY2FzZSAnYmxvY2stc2VxJzpcbiAgICAgICAgY2FzZSAnZmxvdy1jb2xsZWN0aW9uJzpcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbm9kZSA9IGNvbXBvc2VDb2xsZWN0aW9uLmNvbXBvc2VDb2xsZWN0aW9uKENOLCBjdHgsIHRva2VuLCBwcm9wcywgb25FcnJvcik7XG4gICAgICAgICAgICAgICAgaWYgKGFuY2hvcilcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5hbmNob3IgPSBhbmNob3Iuc291cmNlLnN1YnN0cmluZygxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIC8vIEFsbW9zdCBjZXJ0YWlubHkgaGVyZSBkdWUgdG8gYSBzdGFjayBvdmVyZmxvd1xuICAgICAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgICAgICAgICAgb25FcnJvcih0b2tlbiwgJ1JFU09VUkNFX0VYSEFVU1RJT04nLCBtZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gdG9rZW4udHlwZSA9PT0gJ2Vycm9yJ1xuICAgICAgICAgICAgICAgID8gdG9rZW4ubWVzc2FnZVxuICAgICAgICAgICAgICAgIDogYFVuc3VwcG9ydGVkIHRva2VuICh0eXBlOiAke3Rva2VuLnR5cGV9KWA7XG4gICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnVU5FWFBFQ1RFRF9UT0tFTicsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgaXNTcmNUb2tlbiA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIG5vZGUgPz8gKG5vZGUgPSBjb21wb3NlRW1wdHlOb2RlKGN0eCwgdG9rZW4ub2Zmc2V0LCB1bmRlZmluZWQsIG51bGwsIHByb3BzLCBvbkVycm9yKSk7XG4gICAgaWYgKGFuY2hvciAmJiBub2RlLmFuY2hvciA9PT0gJycpXG4gICAgICAgIG9uRXJyb3IoYW5jaG9yLCAnQkFEX0FMSUFTJywgJ0FuY2hvciBjYW5ub3QgYmUgYW4gZW1wdHkgc3RyaW5nJyk7XG4gICAgaWYgKGF0S2V5ICYmXG4gICAgICAgIGN0eC5vcHRpb25zLnN0cmluZ0tleXMgJiZcbiAgICAgICAgKCFpZGVudGl0eS5pc1NjYWxhcihub2RlKSB8fFxuICAgICAgICAgICAgdHlwZW9mIG5vZGUudmFsdWUgIT09ICdzdHJpbmcnIHx8XG4gICAgICAgICAgICAobm9kZS50YWcgJiYgbm9kZS50YWcgIT09ICd0YWc6eWFtbC5vcmcsMjAwMjpzdHInKSkpIHtcbiAgICAgICAgY29uc3QgbXNnID0gJ1dpdGggc3RyaW5nS2V5cywgYWxsIGtleXMgbXVzdCBiZSBzdHJpbmdzJztcbiAgICAgICAgb25FcnJvcih0YWcgPz8gdG9rZW4sICdOT05fU1RSSU5HX0tFWScsIG1zZyk7XG4gICAgfVxuICAgIGlmIChzcGFjZUJlZm9yZSlcbiAgICAgICAgbm9kZS5zcGFjZUJlZm9yZSA9IHRydWU7XG4gICAgaWYgKGNvbW1lbnQpIHtcbiAgICAgICAgaWYgKHRva2VuLnR5cGUgPT09ICdzY2FsYXInICYmIHRva2VuLnNvdXJjZSA9PT0gJycpXG4gICAgICAgICAgICBub2RlLmNvbW1lbnQgPSBjb21tZW50O1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBub2RlLmNvbW1lbnRCZWZvcmUgPSBjb21tZW50O1xuICAgIH1cbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFR5cGUgY2hlY2tpbmcgbWlzc2VzIG1lYW5pbmcgb2YgaXNTcmNUb2tlblxuICAgIGlmIChjdHgub3B0aW9ucy5rZWVwU291cmNlVG9rZW5zICYmIGlzU3JjVG9rZW4pXG4gICAgICAgIG5vZGUuc3JjVG9rZW4gPSB0b2tlbjtcbiAgICByZXR1cm4gbm9kZTtcbn1cbmZ1bmN0aW9uIGNvbXBvc2VFbXB0eU5vZGUoY3R4LCBvZmZzZXQsIGJlZm9yZSwgcG9zLCB7IHNwYWNlQmVmb3JlLCBjb21tZW50LCBhbmNob3IsIHRhZywgZW5kIH0sIG9uRXJyb3IpIHtcbiAgICBjb25zdCB0b2tlbiA9IHtcbiAgICAgICAgdHlwZTogJ3NjYWxhcicsXG4gICAgICAgIG9mZnNldDogdXRpbEVtcHR5U2NhbGFyUG9zaXRpb24uZW1wdHlTY2FsYXJQb3NpdGlvbihvZmZzZXQsIGJlZm9yZSwgcG9zKSxcbiAgICAgICAgaW5kZW50OiAtMSxcbiAgICAgICAgc291cmNlOiAnJ1xuICAgIH07XG4gICAgY29uc3Qgbm9kZSA9IGNvbXBvc2VTY2FsYXIuY29tcG9zZVNjYWxhcihjdHgsIHRva2VuLCB0YWcsIG9uRXJyb3IpO1xuICAgIGlmIChhbmNob3IpIHtcbiAgICAgICAgbm9kZS5hbmNob3IgPSBhbmNob3Iuc291cmNlLnN1YnN0cmluZygxKTtcbiAgICAgICAgaWYgKG5vZGUuYW5jaG9yID09PSAnJylcbiAgICAgICAgICAgIG9uRXJyb3IoYW5jaG9yLCAnQkFEX0FMSUFTJywgJ0FuY2hvciBjYW5ub3QgYmUgYW4gZW1wdHkgc3RyaW5nJyk7XG4gICAgfVxuICAgIGlmIChzcGFjZUJlZm9yZSlcbiAgICAgICAgbm9kZS5zcGFjZUJlZm9yZSA9IHRydWU7XG4gICAgaWYgKGNvbW1lbnQpIHtcbiAgICAgICAgbm9kZS5jb21tZW50ID0gY29tbWVudDtcbiAgICAgICAgbm9kZS5yYW5nZVsyXSA9IGVuZDtcbiAgICB9XG4gICAgcmV0dXJuIG5vZGU7XG59XG5mdW5jdGlvbiBjb21wb3NlQWxpYXMoeyBvcHRpb25zIH0sIHsgb2Zmc2V0LCBzb3VyY2UsIGVuZCB9LCBvbkVycm9yKSB7XG4gICAgY29uc3QgYWxpYXMgPSBuZXcgQWxpYXMuQWxpYXMoc291cmNlLnN1YnN0cmluZygxKSk7XG4gICAgaWYgKGFsaWFzLnNvdXJjZSA9PT0gJycpXG4gICAgICAgIG9uRXJyb3Iob2Zmc2V0LCAnQkFEX0FMSUFTJywgJ0FsaWFzIGNhbm5vdCBiZSBhbiBlbXB0eSBzdHJpbmcnKTtcbiAgICBpZiAoYWxpYXMuc291cmNlLmVuZHNXaXRoKCc6JykpXG4gICAgICAgIG9uRXJyb3Iob2Zmc2V0ICsgc291cmNlLmxlbmd0aCAtIDEsICdCQURfQUxJQVMnLCAnQWxpYXMgZW5kaW5nIGluIDogaXMgYW1iaWd1b3VzJywgdHJ1ZSk7XG4gICAgY29uc3QgdmFsdWVFbmQgPSBvZmZzZXQgKyBzb3VyY2UubGVuZ3RoO1xuICAgIGNvbnN0IHJlID0gcmVzb2x2ZUVuZC5yZXNvbHZlRW5kKGVuZCwgdmFsdWVFbmQsIG9wdGlvbnMuc3RyaWN0LCBvbkVycm9yKTtcbiAgICBhbGlhcy5yYW5nZSA9IFtvZmZzZXQsIHZhbHVlRW5kLCByZS5vZmZzZXRdO1xuICAgIGlmIChyZS5jb21tZW50KVxuICAgICAgICBhbGlhcy5jb21tZW50ID0gcmUuY29tbWVudDtcbiAgICByZXR1cm4gYWxpYXM7XG59XG5cbmV4cG9ydHMuY29tcG9zZUVtcHR5Tm9kZSA9IGNvbXBvc2VFbXB0eU5vZGU7XG5leHBvcnRzLmNvbXBvc2VOb2RlID0gY29tcG9zZU5vZGU7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIERvY3VtZW50ID0gcmVxdWlyZSgnLi4vZG9jL0RvY3VtZW50LmpzJyk7XG52YXIgY29tcG9zZU5vZGUgPSByZXF1aXJlKCcuL2NvbXBvc2Utbm9kZS5qcycpO1xudmFyIHJlc29sdmVFbmQgPSByZXF1aXJlKCcuL3Jlc29sdmUtZW5kLmpzJyk7XG52YXIgcmVzb2x2ZVByb3BzID0gcmVxdWlyZSgnLi9yZXNvbHZlLXByb3BzLmpzJyk7XG5cbmZ1bmN0aW9uIGNvbXBvc2VEb2Mob3B0aW9ucywgZGlyZWN0aXZlcywgeyBvZmZzZXQsIHN0YXJ0LCB2YWx1ZSwgZW5kIH0sIG9uRXJyb3IpIHtcbiAgICBjb25zdCBvcHRzID0gT2JqZWN0LmFzc2lnbih7IF9kaXJlY3RpdmVzOiBkaXJlY3RpdmVzIH0sIG9wdGlvbnMpO1xuICAgIGNvbnN0IGRvYyA9IG5ldyBEb2N1bWVudC5Eb2N1bWVudCh1bmRlZmluZWQsIG9wdHMpO1xuICAgIGNvbnN0IGN0eCA9IHtcbiAgICAgICAgYXRLZXk6IGZhbHNlLFxuICAgICAgICBhdFJvb3Q6IHRydWUsXG4gICAgICAgIGRpcmVjdGl2ZXM6IGRvYy5kaXJlY3RpdmVzLFxuICAgICAgICBvcHRpb25zOiBkb2Mub3B0aW9ucyxcbiAgICAgICAgc2NoZW1hOiBkb2Muc2NoZW1hXG4gICAgfTtcbiAgICBjb25zdCBwcm9wcyA9IHJlc29sdmVQcm9wcy5yZXNvbHZlUHJvcHMoc3RhcnQsIHtcbiAgICAgICAgaW5kaWNhdG9yOiAnZG9jLXN0YXJ0JyxcbiAgICAgICAgbmV4dDogdmFsdWUgPz8gZW5kPy5bMF0sXG4gICAgICAgIG9mZnNldCxcbiAgICAgICAgb25FcnJvcixcbiAgICAgICAgcGFyZW50SW5kZW50OiAwLFxuICAgICAgICBzdGFydE9uTmV3bGluZTogdHJ1ZVxuICAgIH0pO1xuICAgIGlmIChwcm9wcy5mb3VuZCkge1xuICAgICAgICBkb2MuZGlyZWN0aXZlcy5kb2NTdGFydCA9IHRydWU7XG4gICAgICAgIGlmICh2YWx1ZSAmJlxuICAgICAgICAgICAgKHZhbHVlLnR5cGUgPT09ICdibG9jay1tYXAnIHx8IHZhbHVlLnR5cGUgPT09ICdibG9jay1zZXEnKSAmJlxuICAgICAgICAgICAgIXByb3BzLmhhc05ld2xpbmUpXG4gICAgICAgICAgICBvbkVycm9yKHByb3BzLmVuZCwgJ01JU1NJTkdfQ0hBUicsICdCbG9jayBjb2xsZWN0aW9uIGNhbm5vdCBzdGFydCBvbiBzYW1lIGxpbmUgd2l0aCBkaXJlY3RpdmVzLWVuZCBtYXJrZXInKTtcbiAgICB9XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciBJZiBDb250ZW50cyBpcyBzZXQsIGxldCdzIHRydXN0IHRoZSB1c2VyXG4gICAgZG9jLmNvbnRlbnRzID0gdmFsdWVcbiAgICAgICAgPyBjb21wb3NlTm9kZS5jb21wb3NlTm9kZShjdHgsIHZhbHVlLCBwcm9wcywgb25FcnJvcilcbiAgICAgICAgOiBjb21wb3NlTm9kZS5jb21wb3NlRW1wdHlOb2RlKGN0eCwgcHJvcHMuZW5kLCBzdGFydCwgbnVsbCwgcHJvcHMsIG9uRXJyb3IpO1xuICAgIGNvbnN0IGNvbnRlbnRFbmQgPSBkb2MuY29udGVudHMucmFuZ2VbMl07XG4gICAgY29uc3QgcmUgPSByZXNvbHZlRW5kLnJlc29sdmVFbmQoZW5kLCBjb250ZW50RW5kLCBmYWxzZSwgb25FcnJvcik7XG4gICAgaWYgKHJlLmNvbW1lbnQpXG4gICAgICAgIGRvYy5jb21tZW50ID0gcmUuY29tbWVudDtcbiAgICBkb2MucmFuZ2UgPSBbb2Zmc2V0LCBjb250ZW50RW5kLCByZS5vZmZzZXRdO1xuICAgIHJldHVybiBkb2M7XG59XG5cbmV4cG9ydHMuY29tcG9zZURvYyA9IGNvbXBvc2VEb2M7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIG5vZGVfcHJvY2VzcyA9IHJlcXVpcmUoJ3Byb2Nlc3MnKTtcbnZhciBkaXJlY3RpdmVzID0gcmVxdWlyZSgnLi4vZG9jL2RpcmVjdGl2ZXMuanMnKTtcbnZhciBEb2N1bWVudCA9IHJlcXVpcmUoJy4uL2RvYy9Eb2N1bWVudC5qcycpO1xudmFyIGVycm9ycyA9IHJlcXVpcmUoJy4uL2Vycm9ycy5qcycpO1xudmFyIGlkZW50aXR5ID0gcmVxdWlyZSgnLi4vbm9kZXMvaWRlbnRpdHkuanMnKTtcbnZhciBjb21wb3NlRG9jID0gcmVxdWlyZSgnLi9jb21wb3NlLWRvYy5qcycpO1xudmFyIHJlc29sdmVFbmQgPSByZXF1aXJlKCcuL3Jlc29sdmUtZW5kLmpzJyk7XG5cbmZ1bmN0aW9uIGdldEVycm9yUG9zKHNyYykge1xuICAgIGlmICh0eXBlb2Ygc3JjID09PSAnbnVtYmVyJylcbiAgICAgICAgcmV0dXJuIFtzcmMsIHNyYyArIDFdO1xuICAgIGlmIChBcnJheS5pc0FycmF5KHNyYykpXG4gICAgICAgIHJldHVybiBzcmMubGVuZ3RoID09PSAyID8gc3JjIDogW3NyY1swXSwgc3JjWzFdXTtcbiAgICBjb25zdCB7IG9mZnNldCwgc291cmNlIH0gPSBzcmM7XG4gICAgcmV0dXJuIFtvZmZzZXQsIG9mZnNldCArICh0eXBlb2Ygc291cmNlID09PSAnc3RyaW5nJyA/IHNvdXJjZS5sZW5ndGggOiAxKV07XG59XG5mdW5jdGlvbiBwYXJzZVByZWx1ZGUocHJlbHVkZSkge1xuICAgIGxldCBjb21tZW50ID0gJyc7XG4gICAgbGV0IGF0Q29tbWVudCA9IGZhbHNlO1xuICAgIGxldCBhZnRlckVtcHR5TGluZSA9IGZhbHNlO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJlbHVkZS5sZW5ndGg7ICsraSkge1xuICAgICAgICBjb25zdCBzb3VyY2UgPSBwcmVsdWRlW2ldO1xuICAgICAgICBzd2l0Y2ggKHNvdXJjZVswXSkge1xuICAgICAgICAgICAgY2FzZSAnIyc6XG4gICAgICAgICAgICAgICAgY29tbWVudCArPVxuICAgICAgICAgICAgICAgICAgICAoY29tbWVudCA9PT0gJycgPyAnJyA6IGFmdGVyRW1wdHlMaW5lID8gJ1xcblxcbicgOiAnXFxuJykgK1xuICAgICAgICAgICAgICAgICAgICAgICAgKHNvdXJjZS5zdWJzdHJpbmcoMSkgfHwgJyAnKTtcbiAgICAgICAgICAgICAgICBhdENvbW1lbnQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGFmdGVyRW1wdHlMaW5lID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICclJzpcbiAgICAgICAgICAgICAgICBpZiAocHJlbHVkZVtpICsgMV0/LlswXSAhPT0gJyMnKVxuICAgICAgICAgICAgICAgICAgICBpICs9IDE7XG4gICAgICAgICAgICAgICAgYXRDb21tZW50ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIC8vIFRoaXMgbWF5IGJlIHdyb25nIGFmdGVyIGRvYy1lbmQsIGJ1dCBpbiB0aGF0IGNhc2UgaXQgZG9lc24ndCBtYXR0ZXJcbiAgICAgICAgICAgICAgICBpZiAoIWF0Q29tbWVudClcbiAgICAgICAgICAgICAgICAgICAgYWZ0ZXJFbXB0eUxpbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGF0Q29tbWVudCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7IGNvbW1lbnQsIGFmdGVyRW1wdHlMaW5lIH07XG59XG4vKipcbiAqIENvbXBvc2UgYSBzdHJlYW0gb2YgQ1NUIG5vZGVzIGludG8gYSBzdHJlYW0gb2YgWUFNTCBEb2N1bWVudHMuXG4gKlxuICogYGBgdHNcbiAqIGltcG9ydCB7IENvbXBvc2VyLCBQYXJzZXIgfSBmcm9tICd5YW1sJ1xuICpcbiAqIGNvbnN0IHNyYzogc3RyaW5nID0gLi4uXG4gKiBjb25zdCB0b2tlbnMgPSBuZXcgUGFyc2VyKCkucGFyc2Uoc3JjKVxuICogY29uc3QgZG9jcyA9IG5ldyBDb21wb3NlcigpLmNvbXBvc2UodG9rZW5zKVxuICogYGBgXG4gKi9cbmNsYXNzIENvbXBvc2VyIHtcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcbiAgICAgICAgdGhpcy5kb2MgPSBudWxsO1xuICAgICAgICB0aGlzLmF0RGlyZWN0aXZlcyA9IGZhbHNlO1xuICAgICAgICB0aGlzLnByZWx1ZGUgPSBbXTtcbiAgICAgICAgdGhpcy5lcnJvcnMgPSBbXTtcbiAgICAgICAgdGhpcy53YXJuaW5ncyA9IFtdO1xuICAgICAgICB0aGlzLm9uRXJyb3IgPSAoc291cmNlLCBjb2RlLCBtZXNzYWdlLCB3YXJuaW5nKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwb3MgPSBnZXRFcnJvclBvcyhzb3VyY2UpO1xuICAgICAgICAgICAgaWYgKHdhcm5pbmcpXG4gICAgICAgICAgICAgICAgdGhpcy53YXJuaW5ncy5wdXNoKG5ldyBlcnJvcnMuWUFNTFdhcm5pbmcocG9zLCBjb2RlLCBtZXNzYWdlKSk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhpcy5lcnJvcnMucHVzaChuZXcgZXJyb3JzLllBTUxQYXJzZUVycm9yKHBvcywgY29kZSwgbWVzc2FnZSkpO1xuICAgICAgICB9O1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L3ByZWZlci1udWxsaXNoLWNvYWxlc2NpbmdcbiAgICAgICAgdGhpcy5kaXJlY3RpdmVzID0gbmV3IGRpcmVjdGl2ZXMuRGlyZWN0aXZlcyh7IHZlcnNpb246IG9wdGlvbnMudmVyc2lvbiB8fCAnMS4yJyB9KTtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB9XG4gICAgZGVjb3JhdGUoZG9jLCBhZnRlckRvYykge1xuICAgICAgICBjb25zdCB7IGNvbW1lbnQsIGFmdGVyRW1wdHlMaW5lIH0gPSBwYXJzZVByZWx1ZGUodGhpcy5wcmVsdWRlKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyh7IGRjOiBkb2MuY29tbWVudCwgcHJlbHVkZSwgY29tbWVudCB9KVxuICAgICAgICBpZiAoY29tbWVudCkge1xuICAgICAgICAgICAgY29uc3QgZGMgPSBkb2MuY29udGVudHM7XG4gICAgICAgICAgICBpZiAoYWZ0ZXJEb2MpIHtcbiAgICAgICAgICAgICAgICBkb2MuY29tbWVudCA9IGRvYy5jb21tZW50ID8gYCR7ZG9jLmNvbW1lbnR9XFxuJHtjb21tZW50fWAgOiBjb21tZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoYWZ0ZXJFbXB0eUxpbmUgfHwgZG9jLmRpcmVjdGl2ZXMuZG9jU3RhcnQgfHwgIWRjKSB7XG4gICAgICAgICAgICAgICAgZG9jLmNvbW1lbnRCZWZvcmUgPSBjb21tZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoaWRlbnRpdHkuaXNDb2xsZWN0aW9uKGRjKSAmJiAhZGMuZmxvdyAmJiBkYy5pdGVtcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgbGV0IGl0ID0gZGMuaXRlbXNbMF07XG4gICAgICAgICAgICAgICAgaWYgKGlkZW50aXR5LmlzUGFpcihpdCkpXG4gICAgICAgICAgICAgICAgICAgIGl0ID0gaXQua2V5O1xuICAgICAgICAgICAgICAgIGNvbnN0IGNiID0gaXQuY29tbWVudEJlZm9yZTtcbiAgICAgICAgICAgICAgICBpdC5jb21tZW50QmVmb3JlID0gY2IgPyBgJHtjb21tZW50fVxcbiR7Y2J9YCA6IGNvbW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjYiA9IGRjLmNvbW1lbnRCZWZvcmU7XG4gICAgICAgICAgICAgICAgZGMuY29tbWVudEJlZm9yZSA9IGNiID8gYCR7Y29tbWVudH1cXG4ke2NifWAgOiBjb21tZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChhZnRlckRvYykge1xuICAgICAgICAgICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkoZG9jLmVycm9ycywgdGhpcy5lcnJvcnMpO1xuICAgICAgICAgICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkoZG9jLndhcm5pbmdzLCB0aGlzLndhcm5pbmdzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGRvYy5lcnJvcnMgPSB0aGlzLmVycm9ycztcbiAgICAgICAgICAgIGRvYy53YXJuaW5ncyA9IHRoaXMud2FybmluZ3M7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wcmVsdWRlID0gW107XG4gICAgICAgIHRoaXMuZXJyb3JzID0gW107XG4gICAgICAgIHRoaXMud2FybmluZ3MgPSBbXTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3VycmVudCBzdHJlYW0gc3RhdHVzIGluZm9ybWF0aW9uLlxuICAgICAqXG4gICAgICogTW9zdGx5IHVzZWZ1bCBhdCB0aGUgZW5kIG9mIGlucHV0IGZvciBhbiBlbXB0eSBzdHJlYW0uXG4gICAgICovXG4gICAgc3RyZWFtSW5mbygpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGNvbW1lbnQ6IHBhcnNlUHJlbHVkZSh0aGlzLnByZWx1ZGUpLmNvbW1lbnQsXG4gICAgICAgICAgICBkaXJlY3RpdmVzOiB0aGlzLmRpcmVjdGl2ZXMsXG4gICAgICAgICAgICBlcnJvcnM6IHRoaXMuZXJyb3JzLFxuICAgICAgICAgICAgd2FybmluZ3M6IHRoaXMud2FybmluZ3NcbiAgICAgICAgfTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ29tcG9zZSB0b2tlbnMgaW50byBkb2N1bWVudHMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZm9yY2VEb2MgLSBJZiB0aGUgc3RyZWFtIGNvbnRhaW5zIG5vIGRvY3VtZW50LCBzdGlsbCBlbWl0IGEgZmluYWwgZG9jdW1lbnQgaW5jbHVkaW5nIGFueSBjb21tZW50cyBhbmQgZGlyZWN0aXZlcyB0aGF0IHdvdWxkIGJlIGFwcGxpZWQgdG8gYSBzdWJzZXF1ZW50IGRvY3VtZW50LlxuICAgICAqIEBwYXJhbSBlbmRPZmZzZXQgLSBTaG91bGQgYmUgc2V0IGlmIGBmb3JjZURvY2AgaXMgYWxzbyBzZXQsIHRvIHNldCB0aGUgZG9jdW1lbnQgcmFuZ2UgZW5kIGFuZCB0byBpbmRpY2F0ZSBlcnJvcnMgY29ycmVjdGx5LlxuICAgICAqL1xuICAgICpjb21wb3NlKHRva2VucywgZm9yY2VEb2MgPSBmYWxzZSwgZW5kT2Zmc2V0ID0gLTEpIHtcbiAgICAgICAgZm9yIChjb25zdCB0b2tlbiBvZiB0b2tlbnMpXG4gICAgICAgICAgICB5aWVsZCogdGhpcy5uZXh0KHRva2VuKTtcbiAgICAgICAgeWllbGQqIHRoaXMuZW5kKGZvcmNlRG9jLCBlbmRPZmZzZXQpO1xuICAgIH1cbiAgICAvKiogQWR2YW5jZSB0aGUgY29tcG9zZXIgYnkgb25lIENTVCB0b2tlbi4gKi9cbiAgICAqbmV4dCh0b2tlbikge1xuICAgICAgICBpZiAobm9kZV9wcm9jZXNzLmVudi5MT0dfU1RSRUFNKVxuICAgICAgICAgICAgY29uc29sZS5kaXIodG9rZW4sIHsgZGVwdGg6IG51bGwgfSk7XG4gICAgICAgIHN3aXRjaCAodG9rZW4udHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnZGlyZWN0aXZlJzpcbiAgICAgICAgICAgICAgICB0aGlzLmRpcmVjdGl2ZXMuYWRkKHRva2VuLnNvdXJjZSwgKG9mZnNldCwgbWVzc2FnZSwgd2FybmluZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwb3MgPSBnZXRFcnJvclBvcyh0b2tlbik7XG4gICAgICAgICAgICAgICAgICAgIHBvc1swXSArPSBvZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25FcnJvcihwb3MsICdCQURfRElSRUNUSVZFJywgbWVzc2FnZSwgd2FybmluZyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmVsdWRlLnB1c2godG9rZW4uc291cmNlKTtcbiAgICAgICAgICAgICAgICB0aGlzLmF0RGlyZWN0aXZlcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdkb2N1bWVudCc6IHtcbiAgICAgICAgICAgICAgICBjb25zdCBkb2MgPSBjb21wb3NlRG9jLmNvbXBvc2VEb2ModGhpcy5vcHRpb25zLCB0aGlzLmRpcmVjdGl2ZXMsIHRva2VuLCB0aGlzLm9uRXJyb3IpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmF0RGlyZWN0aXZlcyAmJiAhZG9jLmRpcmVjdGl2ZXMuZG9jU3RhcnQpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25FcnJvcih0b2tlbiwgJ01JU1NJTkdfQ0hBUicsICdNaXNzaW5nIGRpcmVjdGl2ZXMtZW5kL2RvYy1zdGFydCBpbmRpY2F0b3IgbGluZScpO1xuICAgICAgICAgICAgICAgIHRoaXMuZGVjb3JhdGUoZG9jLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZG9jKVxuICAgICAgICAgICAgICAgICAgICB5aWVsZCB0aGlzLmRvYztcbiAgICAgICAgICAgICAgICB0aGlzLmRvYyA9IGRvYztcbiAgICAgICAgICAgICAgICB0aGlzLmF0RGlyZWN0aXZlcyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSAnYnl0ZS1vcmRlci1tYXJrJzpcbiAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2NvbW1lbnQnOlxuICAgICAgICAgICAgY2FzZSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgICAgdGhpcy5wcmVsdWRlLnB1c2godG9rZW4uc291cmNlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2Vycm9yJzoge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1zZyA9IHRva2VuLnNvdXJjZVxuICAgICAgICAgICAgICAgICAgICA/IGAke3Rva2VuLm1lc3NhZ2V9OiAke0pTT04uc3RyaW5naWZ5KHRva2VuLnNvdXJjZSl9YFxuICAgICAgICAgICAgICAgICAgICA6IHRva2VuLm1lc3NhZ2U7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBuZXcgZXJyb3JzLllBTUxQYXJzZUVycm9yKGdldEVycm9yUG9zKHRva2VuKSwgJ1VORVhQRUNURURfVE9LRU4nLCBtc2cpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmF0RGlyZWN0aXZlcyB8fCAhdGhpcy5kb2MpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXJyb3JzLnB1c2goZXJyb3IpO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kb2MuZXJyb3JzLnB1c2goZXJyb3IpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSAnZG9jLWVuZCc6IHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuZG9jKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1zZyA9ICdVbmV4cGVjdGVkIGRvYy1lbmQgd2l0aG91dCBwcmVjZWRpbmcgZG9jdW1lbnQnO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVycm9ycy5wdXNoKG5ldyBlcnJvcnMuWUFNTFBhcnNlRXJyb3IoZ2V0RXJyb3JQb3ModG9rZW4pLCAnVU5FWFBFQ1RFRF9UT0tFTicsIG1zZykpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5kb2MuZGlyZWN0aXZlcy5kb2NFbmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGNvbnN0IGVuZCA9IHJlc29sdmVFbmQucmVzb2x2ZUVuZCh0b2tlbi5lbmQsIHRva2VuLm9mZnNldCArIHRva2VuLnNvdXJjZS5sZW5ndGgsIHRoaXMuZG9jLm9wdGlvbnMuc3RyaWN0LCB0aGlzLm9uRXJyb3IpO1xuICAgICAgICAgICAgICAgIHRoaXMuZGVjb3JhdGUodGhpcy5kb2MsIHRydWUpO1xuICAgICAgICAgICAgICAgIGlmIChlbmQuY29tbWVudCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBkYyA9IHRoaXMuZG9jLmNvbW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZG9jLmNvbW1lbnQgPSBkYyA/IGAke2RjfVxcbiR7ZW5kLmNvbW1lbnR9YCA6IGVuZC5jb21tZW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmRvYy5yYW5nZVsyXSA9IGVuZC5vZmZzZXQ7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRoaXMuZXJyb3JzLnB1c2gobmV3IGVycm9ycy5ZQU1MUGFyc2VFcnJvcihnZXRFcnJvclBvcyh0b2tlbiksICdVTkVYUEVDVEVEX1RPS0VOJywgYFVuc3VwcG9ydGVkIHRva2VuICR7dG9rZW4udHlwZX1gKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2FsbCBhdCBlbmQgb2YgaW5wdXQgdG8geWllbGQgYW55IHJlbWFpbmluZyBkb2N1bWVudC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBmb3JjZURvYyAtIElmIHRoZSBzdHJlYW0gY29udGFpbnMgbm8gZG9jdW1lbnQsIHN0aWxsIGVtaXQgYSBmaW5hbCBkb2N1bWVudCBpbmNsdWRpbmcgYW55IGNvbW1lbnRzIGFuZCBkaXJlY3RpdmVzIHRoYXQgd291bGQgYmUgYXBwbGllZCB0byBhIHN1YnNlcXVlbnQgZG9jdW1lbnQuXG4gICAgICogQHBhcmFtIGVuZE9mZnNldCAtIFNob3VsZCBiZSBzZXQgaWYgYGZvcmNlRG9jYCBpcyBhbHNvIHNldCwgdG8gc2V0IHRoZSBkb2N1bWVudCByYW5nZSBlbmQgYW5kIHRvIGluZGljYXRlIGVycm9ycyBjb3JyZWN0bHkuXG4gICAgICovXG4gICAgKmVuZChmb3JjZURvYyA9IGZhbHNlLCBlbmRPZmZzZXQgPSAtMSkge1xuICAgICAgICBpZiAodGhpcy5kb2MpIHtcbiAgICAgICAgICAgIHRoaXMuZGVjb3JhdGUodGhpcy5kb2MsIHRydWUpO1xuICAgICAgICAgICAgeWllbGQgdGhpcy5kb2M7XG4gICAgICAgICAgICB0aGlzLmRvYyA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZm9yY2VEb2MpIHtcbiAgICAgICAgICAgIGNvbnN0IG9wdHMgPSBPYmplY3QuYXNzaWduKHsgX2RpcmVjdGl2ZXM6IHRoaXMuZGlyZWN0aXZlcyB9LCB0aGlzLm9wdGlvbnMpO1xuICAgICAgICAgICAgY29uc3QgZG9jID0gbmV3IERvY3VtZW50LkRvY3VtZW50KHVuZGVmaW5lZCwgb3B0cyk7XG4gICAgICAgICAgICBpZiAodGhpcy5hdERpcmVjdGl2ZXMpXG4gICAgICAgICAgICAgICAgdGhpcy5vbkVycm9yKGVuZE9mZnNldCwgJ01JU1NJTkdfQ0hBUicsICdNaXNzaW5nIGRpcmVjdGl2ZXMtZW5kIGluZGljYXRvciBsaW5lJyk7XG4gICAgICAgICAgICBkb2MucmFuZ2UgPSBbMCwgZW5kT2Zmc2V0LCBlbmRPZmZzZXRdO1xuICAgICAgICAgICAgdGhpcy5kZWNvcmF0ZShkb2MsIGZhbHNlKTtcbiAgICAgICAgICAgIHlpZWxkIGRvYztcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0cy5Db21wb3NlciA9IENvbXBvc2VyO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciByZXNvbHZlQmxvY2tTY2FsYXIgPSByZXF1aXJlKCcuLi9jb21wb3NlL3Jlc29sdmUtYmxvY2stc2NhbGFyLmpzJyk7XG52YXIgcmVzb2x2ZUZsb3dTY2FsYXIgPSByZXF1aXJlKCcuLi9jb21wb3NlL3Jlc29sdmUtZmxvdy1zY2FsYXIuanMnKTtcbnZhciBlcnJvcnMgPSByZXF1aXJlKCcuLi9lcnJvcnMuanMnKTtcbnZhciBzdHJpbmdpZnlTdHJpbmcgPSByZXF1aXJlKCcuLi9zdHJpbmdpZnkvc3RyaW5naWZ5U3RyaW5nLmpzJyk7XG5cbmZ1bmN0aW9uIHJlc29sdmVBc1NjYWxhcih0b2tlbiwgc3RyaWN0ID0gdHJ1ZSwgb25FcnJvcikge1xuICAgIGlmICh0b2tlbikge1xuICAgICAgICBjb25zdCBfb25FcnJvciA9IChwb3MsIGNvZGUsIG1lc3NhZ2UpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG9mZnNldCA9IHR5cGVvZiBwb3MgPT09ICdudW1iZXInID8gcG9zIDogQXJyYXkuaXNBcnJheShwb3MpID8gcG9zWzBdIDogcG9zLm9mZnNldDtcbiAgICAgICAgICAgIGlmIChvbkVycm9yKVxuICAgICAgICAgICAgICAgIG9uRXJyb3Iob2Zmc2V0LCBjb2RlLCBtZXNzYWdlKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgZXJyb3JzLllBTUxQYXJzZUVycm9yKFtvZmZzZXQsIG9mZnNldCArIDFdLCBjb2RlLCBtZXNzYWdlKTtcbiAgICAgICAgfTtcbiAgICAgICAgc3dpdGNoICh0b2tlbi50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdzY2FsYXInOlxuICAgICAgICAgICAgY2FzZSAnc2luZ2xlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICAgICAgY2FzZSAnZG91YmxlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICAgICAgICAgIHJldHVybiByZXNvbHZlRmxvd1NjYWxhci5yZXNvbHZlRmxvd1NjYWxhcih0b2tlbiwgc3RyaWN0LCBfb25FcnJvcik7XG4gICAgICAgICAgICBjYXNlICdibG9jay1zY2FsYXInOlxuICAgICAgICAgICAgICAgIHJldHVybiByZXNvbHZlQmxvY2tTY2FsYXIucmVzb2x2ZUJsb2NrU2NhbGFyKHsgb3B0aW9uczogeyBzdHJpY3QgfSB9LCB0b2tlbiwgX29uRXJyb3IpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufVxuLyoqXG4gKiBDcmVhdGUgYSBuZXcgc2NhbGFyIHRva2VuIHdpdGggYHZhbHVlYFxuICpcbiAqIFZhbHVlcyB0aGF0IHJlcHJlc2VudCBhbiBhY3R1YWwgc3RyaW5nIGJ1dCBtYXkgYmUgcGFyc2VkIGFzIGEgZGlmZmVyZW50IHR5cGUgc2hvdWxkIHVzZSBhIGB0eXBlYCBvdGhlciB0aGFuIGAnUExBSU4nYCxcbiAqIGFzIHRoaXMgZnVuY3Rpb24gZG9lcyBub3Qgc3VwcG9ydCBhbnkgc2NoZW1hIG9wZXJhdGlvbnMgYW5kIHdvbid0IGNoZWNrIGZvciBzdWNoIGNvbmZsaWN0cy5cbiAqXG4gKiBAcGFyYW0gdmFsdWUgVGhlIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmFsdWUsIHdoaWNoIHdpbGwgaGF2ZSBpdHMgY29udGVudCBwcm9wZXJseSBpbmRlbnRlZC5cbiAqIEBwYXJhbSBjb250ZXh0LmVuZCBDb21tZW50cyBhbmQgd2hpdGVzcGFjZSBhZnRlciB0aGUgZW5kIG9mIHRoZSB2YWx1ZSwgb3IgYWZ0ZXIgdGhlIGJsb2NrIHNjYWxhciBoZWFkZXIuIElmIHVuZGVmaW5lZCwgYSBuZXdsaW5lIHdpbGwgYmUgYWRkZWQuXG4gKiBAcGFyYW0gY29udGV4dC5pbXBsaWNpdEtleSBCZWluZyB3aXRoaW4gYW4gaW1wbGljaXQga2V5IG1heSBhZmZlY3QgdGhlIHJlc29sdmVkIHR5cGUgb2YgdGhlIHRva2VuJ3MgdmFsdWUuXG4gKiBAcGFyYW0gY29udGV4dC5pbmRlbnQgVGhlIGluZGVudCBsZXZlbCBvZiB0aGUgdG9rZW4uXG4gKiBAcGFyYW0gY29udGV4dC5pbkZsb3cgSXMgdGhpcyBzY2FsYXIgd2l0aGluIGEgZmxvdyBjb2xsZWN0aW9uPyBUaGlzIG1heSBhZmZlY3QgdGhlIHJlc29sdmVkIHR5cGUgb2YgdGhlIHRva2VuJ3MgdmFsdWUuXG4gKiBAcGFyYW0gY29udGV4dC5vZmZzZXQgVGhlIG9mZnNldCBwb3NpdGlvbiBvZiB0aGUgdG9rZW4uXG4gKiBAcGFyYW0gY29udGV4dC50eXBlIFRoZSBwcmVmZXJyZWQgdHlwZSBvZiB0aGUgc2NhbGFyIHRva2VuLiBJZiB1bmRlZmluZWQsIHRoZSBwcmV2aW91cyB0eXBlIG9mIHRoZSBgdG9rZW5gIHdpbGwgYmUgdXNlZCwgZGVmYXVsdGluZyB0byBgJ1BMQUlOJ2AuXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVNjYWxhclRva2VuKHZhbHVlLCBjb250ZXh0KSB7XG4gICAgY29uc3QgeyBpbXBsaWNpdEtleSA9IGZhbHNlLCBpbmRlbnQsIGluRmxvdyA9IGZhbHNlLCBvZmZzZXQgPSAtMSwgdHlwZSA9ICdQTEFJTicgfSA9IGNvbnRleHQ7XG4gICAgY29uc3Qgc291cmNlID0gc3RyaW5naWZ5U3RyaW5nLnN0cmluZ2lmeVN0cmluZyh7IHR5cGUsIHZhbHVlIH0sIHtcbiAgICAgICAgaW1wbGljaXRLZXksXG4gICAgICAgIGluZGVudDogaW5kZW50ID4gMCA/ICcgJy5yZXBlYXQoaW5kZW50KSA6ICcnLFxuICAgICAgICBpbkZsb3csXG4gICAgICAgIG9wdGlvbnM6IHsgYmxvY2tRdW90ZTogdHJ1ZSwgbGluZVdpZHRoOiAtMSB9XG4gICAgfSk7XG4gICAgY29uc3QgZW5kID0gY29udGV4dC5lbmQgPz8gW1xuICAgICAgICB7IHR5cGU6ICduZXdsaW5lJywgb2Zmc2V0OiAtMSwgaW5kZW50LCBzb3VyY2U6ICdcXG4nIH1cbiAgICBdO1xuICAgIHN3aXRjaCAoc291cmNlWzBdKSB7XG4gICAgICAgIGNhc2UgJ3wnOlxuICAgICAgICBjYXNlICc+Jzoge1xuICAgICAgICAgICAgY29uc3QgaGUgPSBzb3VyY2UuaW5kZXhPZignXFxuJyk7XG4gICAgICAgICAgICBjb25zdCBoZWFkID0gc291cmNlLnN1YnN0cmluZygwLCBoZSk7XG4gICAgICAgICAgICBjb25zdCBib2R5ID0gc291cmNlLnN1YnN0cmluZyhoZSArIDEpICsgJ1xcbic7XG4gICAgICAgICAgICBjb25zdCBwcm9wcyA9IFtcbiAgICAgICAgICAgICAgICB7IHR5cGU6ICdibG9jay1zY2FsYXItaGVhZGVyJywgb2Zmc2V0LCBpbmRlbnQsIHNvdXJjZTogaGVhZCB9XG4gICAgICAgICAgICBdO1xuICAgICAgICAgICAgaWYgKCFhZGRFbmR0b0Jsb2NrUHJvcHMocHJvcHMsIGVuZCkpXG4gICAgICAgICAgICAgICAgcHJvcHMucHVzaCh7IHR5cGU6ICduZXdsaW5lJywgb2Zmc2V0OiAtMSwgaW5kZW50LCBzb3VyY2U6ICdcXG4nIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2Jsb2NrLXNjYWxhcicsIG9mZnNldCwgaW5kZW50LCBwcm9wcywgc291cmNlOiBib2R5IH07XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnXCInOlxuICAgICAgICAgICAgcmV0dXJuIHsgdHlwZTogJ2RvdWJsZS1xdW90ZWQtc2NhbGFyJywgb2Zmc2V0LCBpbmRlbnQsIHNvdXJjZSwgZW5kIH07XG4gICAgICAgIGNhc2UgXCInXCI6XG4gICAgICAgICAgICByZXR1cm4geyB0eXBlOiAnc2luZ2xlLXF1b3RlZC1zY2FsYXInLCBvZmZzZXQsIGluZGVudCwgc291cmNlLCBlbmQgfTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiB7IHR5cGU6ICdzY2FsYXInLCBvZmZzZXQsIGluZGVudCwgc291cmNlLCBlbmQgfTtcbiAgICB9XG59XG4vKipcbiAqIFNldCB0aGUgdmFsdWUgb2YgYHRva2VuYCB0byB0aGUgZ2l2ZW4gc3RyaW5nIGB2YWx1ZWAsIG92ZXJ3cml0aW5nIGFueSBwcmV2aW91cyBjb250ZW50cyBhbmQgdHlwZSB0aGF0IGl0IG1heSBoYXZlLlxuICpcbiAqIEJlc3QgZWZmb3J0cyBhcmUgbWFkZSB0byByZXRhaW4gYW55IGNvbW1lbnRzIHByZXZpb3VzbHkgYXNzb2NpYXRlZCB3aXRoIHRoZSBgdG9rZW5gLFxuICogdGhvdWdoIGFsbCBjb250ZW50cyB3aXRoaW4gYSBjb2xsZWN0aW9uJ3MgYGl0ZW1zYCB3aWxsIGJlIG92ZXJ3cml0dGVuLlxuICpcbiAqIFZhbHVlcyB0aGF0IHJlcHJlc2VudCBhbiBhY3R1YWwgc3RyaW5nIGJ1dCBtYXkgYmUgcGFyc2VkIGFzIGEgZGlmZmVyZW50IHR5cGUgc2hvdWxkIHVzZSBhIGB0eXBlYCBvdGhlciB0aGFuIGAnUExBSU4nYCxcbiAqIGFzIHRoaXMgZnVuY3Rpb24gZG9lcyBub3Qgc3VwcG9ydCBhbnkgc2NoZW1hIG9wZXJhdGlvbnMgYW5kIHdvbid0IGNoZWNrIGZvciBzdWNoIGNvbmZsaWN0cy5cbiAqXG4gKiBAcGFyYW0gdG9rZW4gQW55IHRva2VuLiBJZiBpdCBkb2VzIG5vdCBpbmNsdWRlIGFuIGBpbmRlbnRgIHZhbHVlLCB0aGUgdmFsdWUgd2lsbCBiZSBzdHJpbmdpZmllZCBhcyBpZiBpdCB3ZXJlIGFuIGltcGxpY2l0IGtleS5cbiAqIEBwYXJhbSB2YWx1ZSBUaGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB2YWx1ZSwgd2hpY2ggd2lsbCBoYXZlIGl0cyBjb250ZW50IHByb3Blcmx5IGluZGVudGVkLlxuICogQHBhcmFtIGNvbnRleHQuYWZ0ZXJLZXkgSW4gbW9zdCBjYXNlcywgdmFsdWVzIGFmdGVyIGEga2V5IHNob3VsZCBoYXZlIGFuIGFkZGl0aW9uYWwgbGV2ZWwgb2YgaW5kZW50YXRpb24uXG4gKiBAcGFyYW0gY29udGV4dC5pbXBsaWNpdEtleSBCZWluZyB3aXRoaW4gYW4gaW1wbGljaXQga2V5IG1heSBhZmZlY3QgdGhlIHJlc29sdmVkIHR5cGUgb2YgdGhlIHRva2VuJ3MgdmFsdWUuXG4gKiBAcGFyYW0gY29udGV4dC5pbkZsb3cgQmVpbmcgd2l0aGluIGEgZmxvdyBjb2xsZWN0aW9uIG1heSBhZmZlY3QgdGhlIHJlc29sdmVkIHR5cGUgb2YgdGhlIHRva2VuJ3MgdmFsdWUuXG4gKiBAcGFyYW0gY29udGV4dC50eXBlIFRoZSBwcmVmZXJyZWQgdHlwZSBvZiB0aGUgc2NhbGFyIHRva2VuLiBJZiB1bmRlZmluZWQsIHRoZSBwcmV2aW91cyB0eXBlIG9mIHRoZSBgdG9rZW5gIHdpbGwgYmUgdXNlZCwgZGVmYXVsdGluZyB0byBgJ1BMQUlOJ2AuXG4gKi9cbmZ1bmN0aW9uIHNldFNjYWxhclZhbHVlKHRva2VuLCB2YWx1ZSwgY29udGV4dCA9IHt9KSB7XG4gICAgbGV0IHsgYWZ0ZXJLZXkgPSBmYWxzZSwgaW1wbGljaXRLZXkgPSBmYWxzZSwgaW5GbG93ID0gZmFsc2UsIHR5cGUgfSA9IGNvbnRleHQ7XG4gICAgbGV0IGluZGVudCA9ICdpbmRlbnQnIGluIHRva2VuID8gdG9rZW4uaW5kZW50IDogbnVsbDtcbiAgICBpZiAoYWZ0ZXJLZXkgJiYgdHlwZW9mIGluZGVudCA9PT0gJ251bWJlcicpXG4gICAgICAgIGluZGVudCArPSAyO1xuICAgIGlmICghdHlwZSlcbiAgICAgICAgc3dpdGNoICh0b2tlbi50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdzaW5nbGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgICAgICAgICAgdHlwZSA9ICdRVU9URV9TSU5HTEUnO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZG91YmxlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICAgICAgICAgIHR5cGUgPSAnUVVPVEVfRE9VQkxFJztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2Jsb2NrLXNjYWxhcic6IHtcbiAgICAgICAgICAgICAgICBjb25zdCBoZWFkZXIgPSB0b2tlbi5wcm9wc1swXTtcbiAgICAgICAgICAgICAgICBpZiAoaGVhZGVyLnR5cGUgIT09ICdibG9jay1zY2FsYXItaGVhZGVyJylcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGJsb2NrIHNjYWxhciBoZWFkZXInKTtcbiAgICAgICAgICAgICAgICB0eXBlID0gaGVhZGVyLnNvdXJjZVswXSA9PT0gJz4nID8gJ0JMT0NLX0ZPTERFRCcgOiAnQkxPQ0tfTElURVJBTCc7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHR5cGUgPSAnUExBSU4nO1xuICAgICAgICB9XG4gICAgY29uc3Qgc291cmNlID0gc3RyaW5naWZ5U3RyaW5nLnN0cmluZ2lmeVN0cmluZyh7IHR5cGUsIHZhbHVlIH0sIHtcbiAgICAgICAgaW1wbGljaXRLZXk6IGltcGxpY2l0S2V5IHx8IGluZGVudCA9PT0gbnVsbCxcbiAgICAgICAgaW5kZW50OiBpbmRlbnQgIT09IG51bGwgJiYgaW5kZW50ID4gMCA/ICcgJy5yZXBlYXQoaW5kZW50KSA6ICcnLFxuICAgICAgICBpbkZsb3csXG4gICAgICAgIG9wdGlvbnM6IHsgYmxvY2tRdW90ZTogdHJ1ZSwgbGluZVdpZHRoOiAtMSB9XG4gICAgfSk7XG4gICAgc3dpdGNoIChzb3VyY2VbMF0pIHtcbiAgICAgICAgY2FzZSAnfCc6XG4gICAgICAgIGNhc2UgJz4nOlxuICAgICAgICAgICAgc2V0QmxvY2tTY2FsYXJWYWx1ZSh0b2tlbiwgc291cmNlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdcIic6XG4gICAgICAgICAgICBzZXRGbG93U2NhbGFyVmFsdWUodG9rZW4sIHNvdXJjZSwgJ2RvdWJsZS1xdW90ZWQtc2NhbGFyJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcIidcIjpcbiAgICAgICAgICAgIHNldEZsb3dTY2FsYXJWYWx1ZSh0b2tlbiwgc291cmNlLCAnc2luZ2xlLXF1b3RlZC1zY2FsYXInKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgc2V0Rmxvd1NjYWxhclZhbHVlKHRva2VuLCBzb3VyY2UsICdzY2FsYXInKTtcbiAgICB9XG59XG5mdW5jdGlvbiBzZXRCbG9ja1NjYWxhclZhbHVlKHRva2VuLCBzb3VyY2UpIHtcbiAgICBjb25zdCBoZSA9IHNvdXJjZS5pbmRleE9mKCdcXG4nKTtcbiAgICBjb25zdCBoZWFkID0gc291cmNlLnN1YnN0cmluZygwLCBoZSk7XG4gICAgY29uc3QgYm9keSA9IHNvdXJjZS5zdWJzdHJpbmcoaGUgKyAxKSArICdcXG4nO1xuICAgIGlmICh0b2tlbi50eXBlID09PSAnYmxvY2stc2NhbGFyJykge1xuICAgICAgICBjb25zdCBoZWFkZXIgPSB0b2tlbi5wcm9wc1swXTtcbiAgICAgICAgaWYgKGhlYWRlci50eXBlICE9PSAnYmxvY2stc2NhbGFyLWhlYWRlcicpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgYmxvY2sgc2NhbGFyIGhlYWRlcicpO1xuICAgICAgICBoZWFkZXIuc291cmNlID0gaGVhZDtcbiAgICAgICAgdG9rZW4uc291cmNlID0gYm9keTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNvbnN0IHsgb2Zmc2V0IH0gPSB0b2tlbjtcbiAgICAgICAgY29uc3QgaW5kZW50ID0gJ2luZGVudCcgaW4gdG9rZW4gPyB0b2tlbi5pbmRlbnQgOiAtMTtcbiAgICAgICAgY29uc3QgcHJvcHMgPSBbXG4gICAgICAgICAgICB7IHR5cGU6ICdibG9jay1zY2FsYXItaGVhZGVyJywgb2Zmc2V0LCBpbmRlbnQsIHNvdXJjZTogaGVhZCB9XG4gICAgICAgIF07XG4gICAgICAgIGlmICghYWRkRW5kdG9CbG9ja1Byb3BzKHByb3BzLCAnZW5kJyBpbiB0b2tlbiA/IHRva2VuLmVuZCA6IHVuZGVmaW5lZCkpXG4gICAgICAgICAgICBwcm9wcy5wdXNoKHsgdHlwZTogJ25ld2xpbmUnLCBvZmZzZXQ6IC0xLCBpbmRlbnQsIHNvdXJjZTogJ1xcbicgfSk7XG4gICAgICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHRva2VuKSlcbiAgICAgICAgICAgIGlmIChrZXkgIT09ICd0eXBlJyAmJiBrZXkgIT09ICdvZmZzZXQnKVxuICAgICAgICAgICAgICAgIGRlbGV0ZSB0b2tlbltrZXldO1xuICAgICAgICBPYmplY3QuYXNzaWduKHRva2VuLCB7IHR5cGU6ICdibG9jay1zY2FsYXInLCBpbmRlbnQsIHByb3BzLCBzb3VyY2U6IGJvZHkgfSk7XG4gICAgfVxufVxuLyoqIEByZXR1cm5zIGB0cnVlYCBpZiBsYXN0IHRva2VuIGlzIGEgbmV3bGluZSAqL1xuZnVuY3Rpb24gYWRkRW5kdG9CbG9ja1Byb3BzKHByb3BzLCBlbmQpIHtcbiAgICBpZiAoZW5kKVxuICAgICAgICBmb3IgKGNvbnN0IHN0IG9mIGVuZClcbiAgICAgICAgICAgIHN3aXRjaCAoc3QudHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcbiAgICAgICAgICAgICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgICAgICAgICAgICAgcHJvcHMucHVzaChzdCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgICAgICBwcm9wcy5wdXNoKHN0KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuZnVuY3Rpb24gc2V0Rmxvd1NjYWxhclZhbHVlKHRva2VuLCBzb3VyY2UsIHR5cGUpIHtcbiAgICBzd2l0Y2ggKHRva2VuLnR5cGUpIHtcbiAgICAgICAgY2FzZSAnc2NhbGFyJzpcbiAgICAgICAgY2FzZSAnZG91YmxlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICBjYXNlICdzaW5nbGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgICAgICB0b2tlbi50eXBlID0gdHlwZTtcbiAgICAgICAgICAgIHRva2VuLnNvdXJjZSA9IHNvdXJjZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdibG9jay1zY2FsYXInOiB7XG4gICAgICAgICAgICBjb25zdCBlbmQgPSB0b2tlbi5wcm9wcy5zbGljZSgxKTtcbiAgICAgICAgICAgIGxldCBvYSA9IHNvdXJjZS5sZW5ndGg7XG4gICAgICAgICAgICBpZiAodG9rZW4ucHJvcHNbMF0udHlwZSA9PT0gJ2Jsb2NrLXNjYWxhci1oZWFkZXInKVxuICAgICAgICAgICAgICAgIG9hIC09IHRva2VuLnByb3BzWzBdLnNvdXJjZS5sZW5ndGg7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHRvayBvZiBlbmQpXG4gICAgICAgICAgICAgICAgdG9rLm9mZnNldCArPSBvYTtcbiAgICAgICAgICAgIGRlbGV0ZSB0b2tlbi5wcm9wcztcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odG9rZW4sIHsgdHlwZSwgc291cmNlLCBlbmQgfSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdibG9jay1tYXAnOlxuICAgICAgICBjYXNlICdibG9jay1zZXEnOiB7XG4gICAgICAgICAgICBjb25zdCBvZmZzZXQgPSB0b2tlbi5vZmZzZXQgKyBzb3VyY2UubGVuZ3RoO1xuICAgICAgICAgICAgY29uc3QgbmwgPSB7IHR5cGU6ICduZXdsaW5lJywgb2Zmc2V0LCBpbmRlbnQ6IHRva2VuLmluZGVudCwgc291cmNlOiAnXFxuJyB9O1xuICAgICAgICAgICAgZGVsZXRlIHRva2VuLml0ZW1zO1xuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih0b2tlbiwgeyB0eXBlLCBzb3VyY2UsIGVuZDogW25sXSB9KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgIGNvbnN0IGluZGVudCA9ICdpbmRlbnQnIGluIHRva2VuID8gdG9rZW4uaW5kZW50IDogLTE7XG4gICAgICAgICAgICBjb25zdCBlbmQgPSAnZW5kJyBpbiB0b2tlbiAmJiBBcnJheS5pc0FycmF5KHRva2VuLmVuZClcbiAgICAgICAgICAgICAgICA/IHRva2VuLmVuZC5maWx0ZXIoc3QgPT4gc3QudHlwZSA9PT0gJ3NwYWNlJyB8fFxuICAgICAgICAgICAgICAgICAgICBzdC50eXBlID09PSAnY29tbWVudCcgfHxcbiAgICAgICAgICAgICAgICAgICAgc3QudHlwZSA9PT0gJ25ld2xpbmUnKVxuICAgICAgICAgICAgICAgIDogW107XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyh0b2tlbikpXG4gICAgICAgICAgICAgICAgaWYgKGtleSAhPT0gJ3R5cGUnICYmIGtleSAhPT0gJ29mZnNldCcpXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB0b2tlbltrZXldO1xuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih0b2tlbiwgeyB0eXBlLCBpbmRlbnQsIHNvdXJjZSwgZW5kIH0pO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnRzLmNyZWF0ZVNjYWxhclRva2VuID0gY3JlYXRlU2NhbGFyVG9rZW47XG5leHBvcnRzLnJlc29sdmVBc1NjYWxhciA9IHJlc29sdmVBc1NjYWxhcjtcbmV4cG9ydHMuc2V0U2NhbGFyVmFsdWUgPSBzZXRTY2FsYXJWYWx1ZTtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFN0cmluZ2lmeSBhIENTVCBkb2N1bWVudCwgdG9rZW4sIG9yIGNvbGxlY3Rpb24gaXRlbVxuICpcbiAqIEZhaXIgd2FybmluZzogVGhpcyBhcHBsaWVzIG5vIHZhbGlkYXRpb24gd2hhdHNvZXZlciwgYW5kXG4gKiBzaW1wbHkgY29uY2F0ZW5hdGVzIHRoZSBzb3VyY2VzIGluIHRoZWlyIGxvZ2ljYWwgb3JkZXIuXG4gKi9cbmNvbnN0IHN0cmluZ2lmeSA9IChjc3QpID0+ICd0eXBlJyBpbiBjc3QgPyBzdHJpbmdpZnlUb2tlbihjc3QpIDogc3RyaW5naWZ5SXRlbShjc3QpO1xuZnVuY3Rpb24gc3RyaW5naWZ5VG9rZW4odG9rZW4pIHtcbiAgICBzd2l0Y2ggKHRva2VuLnR5cGUpIHtcbiAgICAgICAgY2FzZSAnYmxvY2stc2NhbGFyJzoge1xuICAgICAgICAgICAgbGV0IHJlcyA9ICcnO1xuICAgICAgICAgICAgZm9yIChjb25zdCB0b2sgb2YgdG9rZW4ucHJvcHMpXG4gICAgICAgICAgICAgICAgcmVzICs9IHN0cmluZ2lmeVRva2VuKHRvayk7XG4gICAgICAgICAgICByZXR1cm4gcmVzICsgdG9rZW4uc291cmNlO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ2Jsb2NrLW1hcCc6XG4gICAgICAgIGNhc2UgJ2Jsb2NrLXNlcSc6IHtcbiAgICAgICAgICAgIGxldCByZXMgPSAnJztcbiAgICAgICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiB0b2tlbi5pdGVtcylcbiAgICAgICAgICAgICAgICByZXMgKz0gc3RyaW5naWZ5SXRlbShpdGVtKTtcbiAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnZmxvdy1jb2xsZWN0aW9uJzoge1xuICAgICAgICAgICAgbGV0IHJlcyA9IHRva2VuLnN0YXJ0LnNvdXJjZTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiB0b2tlbi5pdGVtcylcbiAgICAgICAgICAgICAgICByZXMgKz0gc3RyaW5naWZ5SXRlbShpdGVtKTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgc3Qgb2YgdG9rZW4uZW5kKVxuICAgICAgICAgICAgICAgIHJlcyArPSBzdC5zb3VyY2U7XG4gICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ2RvY3VtZW50Jzoge1xuICAgICAgICAgICAgbGV0IHJlcyA9IHN0cmluZ2lmeUl0ZW0odG9rZW4pO1xuICAgICAgICAgICAgaWYgKHRva2VuLmVuZClcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHN0IG9mIHRva2VuLmVuZClcbiAgICAgICAgICAgICAgICAgICAgcmVzICs9IHN0LnNvdXJjZTtcbiAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgIH1cbiAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgbGV0IHJlcyA9IHRva2VuLnNvdXJjZTtcbiAgICAgICAgICAgIGlmICgnZW5kJyBpbiB0b2tlbiAmJiB0b2tlbi5lbmQpXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBzdCBvZiB0b2tlbi5lbmQpXG4gICAgICAgICAgICAgICAgICAgIHJlcyArPSBzdC5zb3VyY2U7XG4gICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gc3RyaW5naWZ5SXRlbSh7IHN0YXJ0LCBrZXksIHNlcCwgdmFsdWUgfSkge1xuICAgIGxldCByZXMgPSAnJztcbiAgICBmb3IgKGNvbnN0IHN0IG9mIHN0YXJ0KVxuICAgICAgICByZXMgKz0gc3Quc291cmNlO1xuICAgIGlmIChrZXkpXG4gICAgICAgIHJlcyArPSBzdHJpbmdpZnlUb2tlbihrZXkpO1xuICAgIGlmIChzZXApXG4gICAgICAgIGZvciAoY29uc3Qgc3Qgb2Ygc2VwKVxuICAgICAgICAgICAgcmVzICs9IHN0LnNvdXJjZTtcbiAgICBpZiAodmFsdWUpXG4gICAgICAgIHJlcyArPSBzdHJpbmdpZnlUb2tlbih2YWx1ZSk7XG4gICAgcmV0dXJuIHJlcztcbn1cblxuZXhwb3J0cy5zdHJpbmdpZnkgPSBzdHJpbmdpZnk7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxuY29uc3QgQlJFQUsgPSBTeW1ib2woJ2JyZWFrIHZpc2l0Jyk7XG5jb25zdCBTS0lQID0gU3ltYm9sKCdza2lwIGNoaWxkcmVuJyk7XG5jb25zdCBSRU1PVkUgPSBTeW1ib2woJ3JlbW92ZSBpdGVtJyk7XG4vKipcbiAqIEFwcGx5IGEgdmlzaXRvciB0byBhIENTVCBkb2N1bWVudCBvciBpdGVtLlxuICpcbiAqIFdhbGtzIHRocm91Z2ggdGhlIHRyZWUgKGRlcHRoLWZpcnN0KSBzdGFydGluZyBmcm9tIHRoZSByb290LCBjYWxsaW5nIGFcbiAqIGB2aXNpdG9yYCBmdW5jdGlvbiB3aXRoIHR3byBhcmd1bWVudHMgd2hlbiBlbnRlcmluZyBlYWNoIGl0ZW06XG4gKiAgIC0gYGl0ZW1gOiBUaGUgY3VycmVudCBpdGVtLCB3aGljaCBpbmNsdWRlZCB0aGUgZm9sbG93aW5nIG1lbWJlcnM6XG4gKiAgICAgLSBgc3RhcnQ6IFNvdXJjZVRva2VuW11gIOKAkyBTb3VyY2UgdG9rZW5zIGJlZm9yZSB0aGUga2V5IG9yIHZhbHVlLFxuICogICAgICAgcG9zc2libHkgaW5jbHVkaW5nIGl0cyBhbmNob3Igb3IgdGFnLlxuICogICAgIC0gYGtleT86IFRva2VuIHwgbnVsbGAg4oCTIFNldCBmb3IgcGFpciB2YWx1ZXMuIE1heSB0aGVuIGJlIGBudWxsYCwgaWZcbiAqICAgICAgIHRoZSBrZXkgYmVmb3JlIHRoZSBgOmAgc2VwYXJhdG9yIGlzIGVtcHR5LlxuICogICAgIC0gYHNlcD86IFNvdXJjZVRva2VuW11gIOKAkyBTb3VyY2UgdG9rZW5zIGJldHdlZW4gdGhlIGtleSBhbmQgdGhlIHZhbHVlLFxuICogICAgICAgd2hpY2ggc2hvdWxkIGluY2x1ZGUgdGhlIGA6YCBtYXAgdmFsdWUgaW5kaWNhdG9yIGlmIGB2YWx1ZWAgaXMgc2V0LlxuICogICAgIC0gYHZhbHVlPzogVG9rZW5gIOKAkyBUaGUgdmFsdWUgb2YgYSBzZXF1ZW5jZSBpdGVtLCBvciBvZiBhIG1hcCBwYWlyLlxuICogICAtIGBwYXRoYDogVGhlIHN0ZXBzIGZyb20gdGhlIHJvb3QgdG8gdGhlIGN1cnJlbnQgbm9kZSwgYXMgYW4gYXJyYXkgb2ZcbiAqICAgICBgWydrZXknIHwgJ3ZhbHVlJywgbnVtYmVyXWAgdHVwbGVzLlxuICpcbiAqIFRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIHZpc2l0b3IgbWF5IGJlIHVzZWQgdG8gY29udHJvbCB0aGUgdHJhdmVyc2FsOlxuICogICAtIGB1bmRlZmluZWRgIChkZWZhdWx0KTogRG8gbm90aGluZyBhbmQgY29udGludWVcbiAqICAgLSBgdmlzaXQuU0tJUGA6IERvIG5vdCB2aXNpdCB0aGUgY2hpbGRyZW4gb2YgdGhpcyB0b2tlbiwgY29udGludWUgd2l0aFxuICogICAgICBuZXh0IHNpYmxpbmdcbiAqICAgLSBgdmlzaXQuQlJFQUtgOiBUZXJtaW5hdGUgdHJhdmVyc2FsIGNvbXBsZXRlbHlcbiAqICAgLSBgdmlzaXQuUkVNT1ZFYDogUmVtb3ZlIHRoZSBjdXJyZW50IGl0ZW0sIHRoZW4gY29udGludWUgd2l0aCB0aGUgbmV4dCBvbmVcbiAqICAgLSBgbnVtYmVyYDogU2V0IHRoZSBpbmRleCBvZiB0aGUgbmV4dCBzdGVwLiBUaGlzIGlzIHVzZWZ1bCBlc3BlY2lhbGx5IGlmXG4gKiAgICAgdGhlIGluZGV4IG9mIHRoZSBjdXJyZW50IHRva2VuIGhhcyBjaGFuZ2VkLlxuICogICAtIGBmdW5jdGlvbmA6IERlZmluZSB0aGUgbmV4dCB2aXNpdG9yIGZvciB0aGlzIGl0ZW0uIEFmdGVyIHRoZSBvcmlnaW5hbFxuICogICAgIHZpc2l0b3IgaXMgY2FsbGVkIG9uIGl0ZW0gZW50cnksIG5leHQgdmlzaXRvcnMgYXJlIGNhbGxlZCBhZnRlciBoYW5kbGluZ1xuICogICAgIGEgbm9uLWVtcHR5IGBrZXlgIGFuZCB3aGVuIGV4aXRpbmcgdGhlIGl0ZW0uXG4gKi9cbmZ1bmN0aW9uIHZpc2l0KGNzdCwgdmlzaXRvcikge1xuICAgIGlmICgndHlwZScgaW4gY3N0ICYmIGNzdC50eXBlID09PSAnZG9jdW1lbnQnKVxuICAgICAgICBjc3QgPSB7IHN0YXJ0OiBjc3Quc3RhcnQsIHZhbHVlOiBjc3QudmFsdWUgfTtcbiAgICBfdmlzaXQoT2JqZWN0LmZyZWV6ZShbXSksIGNzdCwgdmlzaXRvcik7XG59XG4vLyBXaXRob3V0IHRoZSBgYXMgc3ltYm9sYCBjYXN0cywgVFMgZGVjbGFyZXMgdGhlc2UgaW4gdGhlIGB2aXNpdGBcbi8vIG5hbWVzcGFjZSB1c2luZyBgdmFyYCwgYnV0IHRoZW4gY29tcGxhaW5zIGFib3V0IHRoYXQgYmVjYXVzZVxuLy8gYHVuaXF1ZSBzeW1ib2xgIG11c3QgYmUgYGNvbnN0YC5cbi8qKiBUZXJtaW5hdGUgdmlzaXQgdHJhdmVyc2FsIGNvbXBsZXRlbHkgKi9cbnZpc2l0LkJSRUFLID0gQlJFQUs7XG4vKiogRG8gbm90IHZpc2l0IHRoZSBjaGlsZHJlbiBvZiB0aGUgY3VycmVudCBpdGVtICovXG52aXNpdC5TS0lQID0gU0tJUDtcbi8qKiBSZW1vdmUgdGhlIGN1cnJlbnQgaXRlbSAqL1xudmlzaXQuUkVNT1ZFID0gUkVNT1ZFO1xuLyoqIEZpbmQgdGhlIGl0ZW0gYXQgYHBhdGhgIGZyb20gYGNzdGAgYXMgdGhlIHJvb3QgKi9cbnZpc2l0Lml0ZW1BdFBhdGggPSAoY3N0LCBwYXRoKSA9PiB7XG4gICAgbGV0IGl0ZW0gPSBjc3Q7XG4gICAgZm9yIChjb25zdCBbZmllbGQsIGluZGV4XSBvZiBwYXRoKSB7XG4gICAgICAgIGNvbnN0IHRvayA9IGl0ZW0/LltmaWVsZF07XG4gICAgICAgIGlmICh0b2sgJiYgJ2l0ZW1zJyBpbiB0b2spIHtcbiAgICAgICAgICAgIGl0ZW0gPSB0b2suaXRlbXNbaW5kZXhdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHJldHVybiBpdGVtO1xufTtcbi8qKlxuICogR2V0IHRoZSBpbW1lZGlhdGUgcGFyZW50IGNvbGxlY3Rpb24gb2YgdGhlIGl0ZW0gYXQgYHBhdGhgIGZyb20gYGNzdGAgYXMgdGhlIHJvb3QuXG4gKlxuICogVGhyb3dzIGFuIGVycm9yIGlmIHRoZSBjb2xsZWN0aW9uIGlzIG5vdCBmb3VuZCwgd2hpY2ggc2hvdWxkIG5ldmVyIGhhcHBlbiBpZiB0aGUgaXRlbSBpdHNlbGYgZXhpc3RzLlxuICovXG52aXNpdC5wYXJlbnRDb2xsZWN0aW9uID0gKGNzdCwgcGF0aCkgPT4ge1xuICAgIGNvbnN0IHBhcmVudCA9IHZpc2l0Lml0ZW1BdFBhdGgoY3N0LCBwYXRoLnNsaWNlKDAsIC0xKSk7XG4gICAgY29uc3QgZmllbGQgPSBwYXRoW3BhdGgubGVuZ3RoIC0gMV1bMF07XG4gICAgY29uc3QgY29sbCA9IHBhcmVudD8uW2ZpZWxkXTtcbiAgICBpZiAoY29sbCAmJiAnaXRlbXMnIGluIGNvbGwpXG4gICAgICAgIHJldHVybiBjb2xsO1xuICAgIHRocm93IG5ldyBFcnJvcignUGFyZW50IGNvbGxlY3Rpb24gbm90IGZvdW5kJyk7XG59O1xuZnVuY3Rpb24gX3Zpc2l0KHBhdGgsIGl0ZW0sIHZpc2l0b3IpIHtcbiAgICBsZXQgY3RybCA9IHZpc2l0b3IoaXRlbSwgcGF0aCk7XG4gICAgaWYgKHR5cGVvZiBjdHJsID09PSAnc3ltYm9sJylcbiAgICAgICAgcmV0dXJuIGN0cmw7XG4gICAgZm9yIChjb25zdCBmaWVsZCBvZiBbJ2tleScsICd2YWx1ZSddKSB7XG4gICAgICAgIGNvbnN0IHRva2VuID0gaXRlbVtmaWVsZF07XG4gICAgICAgIGlmICh0b2tlbiAmJiAnaXRlbXMnIGluIHRva2VuKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRva2VuLml0ZW1zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2kgPSBfdmlzaXQoT2JqZWN0LmZyZWV6ZShwYXRoLmNvbmNhdChbW2ZpZWxkLCBpXV0pKSwgdG9rZW4uaXRlbXNbaV0sIHZpc2l0b3IpO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY2kgPT09ICdudW1iZXInKVxuICAgICAgICAgICAgICAgICAgICBpID0gY2kgLSAxO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNpID09PSBCUkVBSylcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEJSRUFLO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNpID09PSBSRU1PVkUpIHtcbiAgICAgICAgICAgICAgICAgICAgdG9rZW4uaXRlbXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICBpIC09IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBjdHJsID09PSAnZnVuY3Rpb24nICYmIGZpZWxkID09PSAna2V5JylcbiAgICAgICAgICAgICAgICBjdHJsID0gY3RybChpdGVtLCBwYXRoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHlwZW9mIGN0cmwgPT09ICdmdW5jdGlvbicgPyBjdHJsKGl0ZW0sIHBhdGgpIDogY3RybDtcbn1cblxuZXhwb3J0cy52aXNpdCA9IHZpc2l0O1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBjc3RTY2FsYXIgPSByZXF1aXJlKCcuL2NzdC1zY2FsYXIuanMnKTtcbnZhciBjc3RTdHJpbmdpZnkgPSByZXF1aXJlKCcuL2NzdC1zdHJpbmdpZnkuanMnKTtcbnZhciBjc3RWaXNpdCA9IHJlcXVpcmUoJy4vY3N0LXZpc2l0LmpzJyk7XG5cbi8qKiBUaGUgYnl0ZSBvcmRlciBtYXJrICovXG5jb25zdCBCT00gPSAnXFx1e0ZFRkZ9Jztcbi8qKiBTdGFydCBvZiBkb2MtbW9kZSAqL1xuY29uc3QgRE9DVU1FTlQgPSAnXFx4MDInOyAvLyBDMDogU3RhcnQgb2YgVGV4dFxuLyoqIFVuZXhwZWN0ZWQgZW5kIG9mIGZsb3ctbW9kZSAqL1xuY29uc3QgRkxPV19FTkQgPSAnXFx4MTgnOyAvLyBDMDogQ2FuY2VsXG4vKiogTmV4dCB0b2tlbiBpcyBhIHNjYWxhciB2YWx1ZSAqL1xuY29uc3QgU0NBTEFSID0gJ1xceDFmJzsgLy8gQzA6IFVuaXQgU2VwYXJhdG9yXG4vKiogQHJldHVybnMgYHRydWVgIGlmIGB0b2tlbmAgaXMgYSBmbG93IG9yIGJsb2NrIGNvbGxlY3Rpb24gKi9cbmNvbnN0IGlzQ29sbGVjdGlvbiA9ICh0b2tlbikgPT4gISF0b2tlbiAmJiAnaXRlbXMnIGluIHRva2VuO1xuLyoqIEByZXR1cm5zIGB0cnVlYCBpZiBgdG9rZW5gIGlzIGEgZmxvdyBvciBibG9jayBzY2FsYXI7IG5vdCBhbiBhbGlhcyAqL1xuY29uc3QgaXNTY2FsYXIgPSAodG9rZW4pID0+ICEhdG9rZW4gJiZcbiAgICAodG9rZW4udHlwZSA9PT0gJ3NjYWxhcicgfHxcbiAgICAgICAgdG9rZW4udHlwZSA9PT0gJ3NpbmdsZS1xdW90ZWQtc2NhbGFyJyB8fFxuICAgICAgICB0b2tlbi50eXBlID09PSAnZG91YmxlLXF1b3RlZC1zY2FsYXInIHx8XG4gICAgICAgIHRva2VuLnR5cGUgPT09ICdibG9jay1zY2FsYXInKTtcbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4vKiogR2V0IGEgcHJpbnRhYmxlIHJlcHJlc2VudGF0aW9uIG9mIGEgbGV4ZXIgdG9rZW4gKi9cbmZ1bmN0aW9uIHByZXR0eVRva2VuKHRva2VuKSB7XG4gICAgc3dpdGNoICh0b2tlbikge1xuICAgICAgICBjYXNlIEJPTTpcbiAgICAgICAgICAgIHJldHVybiAnPEJPTT4nO1xuICAgICAgICBjYXNlIERPQ1VNRU5UOlxuICAgICAgICAgICAgcmV0dXJuICc8RE9DPic7XG4gICAgICAgIGNhc2UgRkxPV19FTkQ6XG4gICAgICAgICAgICByZXR1cm4gJzxGTE9XX0VORD4nO1xuICAgICAgICBjYXNlIFNDQUxBUjpcbiAgICAgICAgICAgIHJldHVybiAnPFNDQUxBUj4nO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHRva2VuKTtcbiAgICB9XG59XG4vKiogSWRlbnRpZnkgdGhlIHR5cGUgb2YgYSBsZXhlciB0b2tlbi4gTWF5IHJldHVybiBgbnVsbGAgZm9yIHVua25vd24gdG9rZW5zLiAqL1xuZnVuY3Rpb24gdG9rZW5UeXBlKHNvdXJjZSkge1xuICAgIHN3aXRjaCAoc291cmNlKSB7XG4gICAgICAgIGNhc2UgQk9NOlxuICAgICAgICAgICAgcmV0dXJuICdieXRlLW9yZGVyLW1hcmsnO1xuICAgICAgICBjYXNlIERPQ1VNRU5UOlxuICAgICAgICAgICAgcmV0dXJuICdkb2MtbW9kZSc7XG4gICAgICAgIGNhc2UgRkxPV19FTkQ6XG4gICAgICAgICAgICByZXR1cm4gJ2Zsb3ctZXJyb3ItZW5kJztcbiAgICAgICAgY2FzZSBTQ0FMQVI6XG4gICAgICAgICAgICByZXR1cm4gJ3NjYWxhcic7XG4gICAgICAgIGNhc2UgJy0tLSc6XG4gICAgICAgICAgICByZXR1cm4gJ2RvYy1zdGFydCc7XG4gICAgICAgIGNhc2UgJy4uLic6XG4gICAgICAgICAgICByZXR1cm4gJ2RvYy1lbmQnO1xuICAgICAgICBjYXNlICcnOlxuICAgICAgICBjYXNlICdcXG4nOlxuICAgICAgICBjYXNlICdcXHJcXG4nOlxuICAgICAgICAgICAgcmV0dXJuICduZXdsaW5lJztcbiAgICAgICAgY2FzZSAnLSc6XG4gICAgICAgICAgICByZXR1cm4gJ3NlcS1pdGVtLWluZCc7XG4gICAgICAgIGNhc2UgJz8nOlxuICAgICAgICAgICAgcmV0dXJuICdleHBsaWNpdC1rZXktaW5kJztcbiAgICAgICAgY2FzZSAnOic6XG4gICAgICAgICAgICByZXR1cm4gJ21hcC12YWx1ZS1pbmQnO1xuICAgICAgICBjYXNlICd7JzpcbiAgICAgICAgICAgIHJldHVybiAnZmxvdy1tYXAtc3RhcnQnO1xuICAgICAgICBjYXNlICd9JzpcbiAgICAgICAgICAgIHJldHVybiAnZmxvdy1tYXAtZW5kJztcbiAgICAgICAgY2FzZSAnWyc6XG4gICAgICAgICAgICByZXR1cm4gJ2Zsb3ctc2VxLXN0YXJ0JztcbiAgICAgICAgY2FzZSAnXSc6XG4gICAgICAgICAgICByZXR1cm4gJ2Zsb3ctc2VxLWVuZCc7XG4gICAgICAgIGNhc2UgJywnOlxuICAgICAgICAgICAgcmV0dXJuICdjb21tYSc7XG4gICAgfVxuICAgIHN3aXRjaCAoc291cmNlWzBdKSB7XG4gICAgICAgIGNhc2UgJyAnOlxuICAgICAgICBjYXNlICdcXHQnOlxuICAgICAgICAgICAgcmV0dXJuICdzcGFjZSc7XG4gICAgICAgIGNhc2UgJyMnOlxuICAgICAgICAgICAgcmV0dXJuICdjb21tZW50JztcbiAgICAgICAgY2FzZSAnJSc6XG4gICAgICAgICAgICByZXR1cm4gJ2RpcmVjdGl2ZS1saW5lJztcbiAgICAgICAgY2FzZSAnKic6XG4gICAgICAgICAgICByZXR1cm4gJ2FsaWFzJztcbiAgICAgICAgY2FzZSAnJic6XG4gICAgICAgICAgICByZXR1cm4gJ2FuY2hvcic7XG4gICAgICAgIGNhc2UgJyEnOlxuICAgICAgICAgICAgcmV0dXJuICd0YWcnO1xuICAgICAgICBjYXNlIFwiJ1wiOlxuICAgICAgICAgICAgcmV0dXJuICdzaW5nbGUtcXVvdGVkLXNjYWxhcic7XG4gICAgICAgIGNhc2UgJ1wiJzpcbiAgICAgICAgICAgIHJldHVybiAnZG91YmxlLXF1b3RlZC1zY2FsYXInO1xuICAgICAgICBjYXNlICd8JzpcbiAgICAgICAgY2FzZSAnPic6XG4gICAgICAgICAgICByZXR1cm4gJ2Jsb2NrLXNjYWxhci1oZWFkZXInO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn1cblxuZXhwb3J0cy5jcmVhdGVTY2FsYXJUb2tlbiA9IGNzdFNjYWxhci5jcmVhdGVTY2FsYXJUb2tlbjtcbmV4cG9ydHMucmVzb2x2ZUFzU2NhbGFyID0gY3N0U2NhbGFyLnJlc29sdmVBc1NjYWxhcjtcbmV4cG9ydHMuc2V0U2NhbGFyVmFsdWUgPSBjc3RTY2FsYXIuc2V0U2NhbGFyVmFsdWU7XG5leHBvcnRzLnN0cmluZ2lmeSA9IGNzdFN0cmluZ2lmeS5zdHJpbmdpZnk7XG5leHBvcnRzLnZpc2l0ID0gY3N0VmlzaXQudmlzaXQ7XG5leHBvcnRzLkJPTSA9IEJPTTtcbmV4cG9ydHMuRE9DVU1FTlQgPSBET0NVTUVOVDtcbmV4cG9ydHMuRkxPV19FTkQgPSBGTE9XX0VORDtcbmV4cG9ydHMuU0NBTEFSID0gU0NBTEFSO1xuZXhwb3J0cy5pc0NvbGxlY3Rpb24gPSBpc0NvbGxlY3Rpb247XG5leHBvcnRzLmlzU2NhbGFyID0gaXNTY2FsYXI7XG5leHBvcnRzLnByZXR0eVRva2VuID0gcHJldHR5VG9rZW47XG5leHBvcnRzLnRva2VuVHlwZSA9IHRva2VuVHlwZTtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY3N0ID0gcmVxdWlyZSgnLi9jc3QuanMnKTtcblxuLypcblNUQVJUIC0+IHN0cmVhbVxuXG5zdHJlYW1cbiAgZGlyZWN0aXZlIC0+IGxpbmUtZW5kIC0+IHN0cmVhbVxuICBpbmRlbnQgKyBsaW5lLWVuZCAtPiBzdHJlYW1cbiAgW2Vsc2VdIC0+IGxpbmUtc3RhcnRcblxubGluZS1lbmRcbiAgY29tbWVudCAtPiBsaW5lLWVuZFxuICBuZXdsaW5lIC0+IC5cbiAgaW5wdXQtZW5kIC0+IEVORFxuXG5saW5lLXN0YXJ0XG4gIGRvYy1zdGFydCAtPiBkb2NcbiAgZG9jLWVuZCAtPiBzdHJlYW1cbiAgW2Vsc2VdIC0+IGluZGVudCAtPiBibG9jay1zdGFydFxuXG5ibG9jay1zdGFydFxuICBzZXEtaXRlbS1zdGFydCAtPiBibG9jay1zdGFydFxuICBleHBsaWNpdC1rZXktc3RhcnQgLT4gYmxvY2stc3RhcnRcbiAgbWFwLXZhbHVlLXN0YXJ0IC0+IGJsb2NrLXN0YXJ0XG4gIFtlbHNlXSAtPiBkb2NcblxuZG9jXG4gIGxpbmUtZW5kIC0+IGxpbmUtc3RhcnRcbiAgc3BhY2VzIC0+IGRvY1xuICBhbmNob3IgLT4gZG9jXG4gIHRhZyAtPiBkb2NcbiAgZmxvdy1zdGFydCAtPiBmbG93IC0+IGRvY1xuICBmbG93LWVuZCAtPiBlcnJvciAtPiBkb2NcbiAgc2VxLWl0ZW0tc3RhcnQgLT4gZXJyb3IgLT4gZG9jXG4gIGV4cGxpY2l0LWtleS1zdGFydCAtPiBlcnJvciAtPiBkb2NcbiAgbWFwLXZhbHVlLXN0YXJ0IC0+IGRvY1xuICBhbGlhcyAtPiBkb2NcbiAgcXVvdGUtc3RhcnQgLT4gcXVvdGVkLXNjYWxhciAtPiBkb2NcbiAgYmxvY2stc2NhbGFyLWhlYWRlciAtPiBsaW5lLWVuZCAtPiBibG9jay1zY2FsYXIobWluKSAtPiBsaW5lLXN0YXJ0XG4gIFtlbHNlXSAtPiBwbGFpbi1zY2FsYXIoZmFsc2UsIG1pbikgLT4gZG9jXG5cbmZsb3dcbiAgbGluZS1lbmQgLT4gZmxvd1xuICBzcGFjZXMgLT4gZmxvd1xuICBhbmNob3IgLT4gZmxvd1xuICB0YWcgLT4gZmxvd1xuICBmbG93LXN0YXJ0IC0+IGZsb3cgLT4gZmxvd1xuICBmbG93LWVuZCAtPiAuXG4gIHNlcS1pdGVtLXN0YXJ0IC0+IGVycm9yIC0+IGZsb3dcbiAgZXhwbGljaXQta2V5LXN0YXJ0IC0+IGZsb3dcbiAgbWFwLXZhbHVlLXN0YXJ0IC0+IGZsb3dcbiAgYWxpYXMgLT4gZmxvd1xuICBxdW90ZS1zdGFydCAtPiBxdW90ZWQtc2NhbGFyIC0+IGZsb3dcbiAgY29tbWEgLT4gZmxvd1xuICBbZWxzZV0gLT4gcGxhaW4tc2NhbGFyKHRydWUsIDApIC0+IGZsb3dcblxucXVvdGVkLXNjYWxhclxuICBxdW90ZS1lbmQgLT4gLlxuICBbZWxzZV0gLT4gcXVvdGVkLXNjYWxhclxuXG5ibG9jay1zY2FsYXIobWluKVxuICBuZXdsaW5lICsgcGVlayhpbmRlbnQgPCBtaW4pIC0+IC5cbiAgW2Vsc2VdIC0+IGJsb2NrLXNjYWxhcihtaW4pXG5cbnBsYWluLXNjYWxhcihpcy1mbG93LCBtaW4pXG4gIHNjYWxhci1lbmQoaXMtZmxvdykgLT4gLlxuICBwZWVrKG5ld2xpbmUgKyAoaW5kZW50IDwgbWluKSkgLT4gLlxuICBbZWxzZV0gLT4gcGxhaW4tc2NhbGFyKG1pbilcbiovXG5mdW5jdGlvbiBpc0VtcHR5KGNoKSB7XG4gICAgc3dpdGNoIChjaCkge1xuICAgICAgICBjYXNlIHVuZGVmaW5lZDpcbiAgICAgICAgY2FzZSAnICc6XG4gICAgICAgIGNhc2UgJ1xcbic6XG4gICAgICAgIGNhc2UgJ1xccic6XG4gICAgICAgIGNhc2UgJ1xcdCc6XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5jb25zdCBoZXhEaWdpdHMgPSBuZXcgU2V0KCcwMTIzNDU2Nzg5QUJDREVGYWJjZGVmJyk7XG5jb25zdCB0YWdDaGFycyA9IG5ldyBTZXQoXCIwMTIzNDU2Nzg5QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ei0jOy8/OkAmPSskXy4hfionKClcIik7XG5jb25zdCBmbG93SW5kaWNhdG9yQ2hhcnMgPSBuZXcgU2V0KCcsW117fScpO1xuY29uc3QgaW52YWxpZEFuY2hvckNoYXJzID0gbmV3IFNldCgnICxbXXt9XFxuXFxyXFx0Jyk7XG5jb25zdCBpc05vdEFuY2hvckNoYXIgPSAoY2gpID0+ICFjaCB8fCBpbnZhbGlkQW5jaG9yQ2hhcnMuaGFzKGNoKTtcbi8qKlxuICogU3BsaXRzIGFuIGlucHV0IHN0cmluZyBpbnRvIGxleGljYWwgdG9rZW5zLCBpLmUuIHNtYWxsZXIgc3RyaW5ncyB0aGF0IGFyZVxuICogZWFzaWx5IGlkZW50aWZpYWJsZSBieSBgdG9rZW5zLnRva2VuVHlwZSgpYC5cbiAqXG4gKiBMZXhpbmcgc3RhcnRzIGFsd2F5cyBpbiBhIFwic3RyZWFtXCIgY29udGV4dC4gSW5jb21wbGV0ZSBpbnB1dCBtYXkgYmUgYnVmZmVyZWRcbiAqIHVudGlsIGEgY29tcGxldGUgdG9rZW4gY2FuIGJlIGVtaXR0ZWQuXG4gKlxuICogSW4gYWRkaXRpb24gdG8gc2xpY2VzIG9mIHRoZSBvcmlnaW5hbCBpbnB1dCwgdGhlIGZvbGxvd2luZyBjb250cm9sIGNoYXJhY3RlcnNcbiAqIG1heSBhbHNvIGJlIGVtaXR0ZWQ6XG4gKlxuICogLSBgXFx4MDJgIChTdGFydCBvZiBUZXh0KTogQSBkb2N1bWVudCBzdGFydHMgd2l0aCB0aGUgbmV4dCB0b2tlblxuICogLSBgXFx4MThgIChDYW5jZWwpOiBVbmV4cGVjdGVkIGVuZCBvZiBmbG93LW1vZGUgKGluZGljYXRlcyBhbiBlcnJvcilcbiAqIC0gYFxceDFmYCAoVW5pdCBTZXBhcmF0b3IpOiBOZXh0IHRva2VuIGlzIGEgc2NhbGFyIHZhbHVlXG4gKiAtIGBcXHV7RkVGRn1gIChCeXRlIG9yZGVyIG1hcmspOiBFbWl0dGVkIHNlcGFyYXRlbHkgb3V0c2lkZSBkb2N1bWVudHNcbiAqL1xuY2xhc3MgTGV4ZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogRmxhZyBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIGVuZCBvZiB0aGUgY3VycmVudCBidWZmZXIgbWFya3MgdGhlIGVuZCBvZlxuICAgICAgICAgKiBhbGwgaW5wdXRcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuYXRFbmQgPSBmYWxzZTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEV4cGxpY2l0IGluZGVudCBzZXQgaW4gYmxvY2sgc2NhbGFyIGhlYWRlciwgYXMgYW4gb2Zmc2V0IGZyb20gdGhlIGN1cnJlbnRcbiAgICAgICAgICogbWluaW11bSBpbmRlbnQsIHNvIGUuZy4gc2V0IHRvIDEgZnJvbSBhIGhlYWRlciBgfDIrYC4gU2V0IHRvIC0xIGlmIG5vdFxuICAgICAgICAgKiBleHBsaWNpdGx5IHNldC5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuYmxvY2tTY2FsYXJJbmRlbnQgPSAtMTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEJsb2NrIHNjYWxhcnMgdGhhdCBpbmNsdWRlIGEgKyAoa2VlcCkgY2hvbXBpbmcgaW5kaWNhdG9yIGluIHRoZWlyIGhlYWRlclxuICAgICAgICAgKiBpbmNsdWRlIHRyYWlsaW5nIGVtcHR5IGxpbmVzLCB3aGljaCBhcmUgb3RoZXJ3aXNlIGV4Y2x1ZGVkIGZyb20gdGhlXG4gICAgICAgICAqIHNjYWxhcidzIGNvbnRlbnRzLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5ibG9ja1NjYWxhcktlZXAgPSBmYWxzZTtcbiAgICAgICAgLyoqIEN1cnJlbnQgaW5wdXQgKi9cbiAgICAgICAgdGhpcy5idWZmZXIgPSAnJztcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZsYWcgbm90aW5nIHdoZXRoZXIgdGhlIG1hcCB2YWx1ZSBpbmRpY2F0b3IgOiBjYW4gaW1tZWRpYXRlbHkgZm9sbG93IHRoaXNcbiAgICAgICAgICogbm9kZSB3aXRoaW4gYSBmbG93IGNvbnRleHQuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmZsb3dLZXkgPSBmYWxzZTtcbiAgICAgICAgLyoqIENvdW50IG9mIHN1cnJvdW5kaW5nIGZsb3cgY29sbGVjdGlvbiBsZXZlbHMuICovXG4gICAgICAgIHRoaXMuZmxvd0xldmVsID0gMDtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIE1pbmltdW0gbGV2ZWwgb2YgaW5kZW50YXRpb24gcmVxdWlyZWQgZm9yIG5leHQgbGluZXMgdG8gYmUgcGFyc2VkIGFzIGFcbiAgICAgICAgICogcGFydCBvZiB0aGUgY3VycmVudCBzY2FsYXIgdmFsdWUuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmluZGVudE5leHQgPSAwO1xuICAgICAgICAvKiogSW5kZW50YXRpb24gbGV2ZWwgb2YgdGhlIGN1cnJlbnQgbGluZS4gKi9cbiAgICAgICAgdGhpcy5pbmRlbnRWYWx1ZSA9IDA7XG4gICAgICAgIC8qKiBQb3NpdGlvbiBvZiB0aGUgbmV4dCBcXG4gY2hhcmFjdGVyLiAqL1xuICAgICAgICB0aGlzLmxpbmVFbmRQb3MgPSBudWxsO1xuICAgICAgICAvKiogU3RvcmVzIHRoZSBzdGF0ZSBvZiB0aGUgbGV4ZXIgaWYgcmVhY2hpbmcgdGhlIGVuZCBvZiBpbmNwb21wbGV0ZSBpbnB1dCAqL1xuICAgICAgICB0aGlzLm5leHQgPSBudWxsO1xuICAgICAgICAvKiogQSBwb2ludGVyIHRvIGBidWZmZXJgOyB0aGUgY3VycmVudCBwb3NpdGlvbiBvZiB0aGUgbGV4ZXIuICovXG4gICAgICAgIHRoaXMucG9zID0gMDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2VuZXJhdGUgWUFNTCB0b2tlbnMgZnJvbSB0aGUgYHNvdXJjZWAgc3RyaW5nLiBJZiBgaW5jb21wbGV0ZWAsXG4gICAgICogYSBwYXJ0IG9mIHRoZSBsYXN0IGxpbmUgbWF5IGJlIGxlZnQgYXMgYSBidWZmZXIgZm9yIHRoZSBuZXh0IGNhbGwuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBBIGdlbmVyYXRvciBvZiBsZXhpY2FsIHRva2Vuc1xuICAgICAqL1xuICAgICpsZXgoc291cmNlLCBpbmNvbXBsZXRlID0gZmFsc2UpIHtcbiAgICAgICAgaWYgKHNvdXJjZSkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBzb3VyY2UgIT09ICdzdHJpbmcnKVxuICAgICAgICAgICAgICAgIHRocm93IFR5cGVFcnJvcignc291cmNlIGlzIG5vdCBhIHN0cmluZycpO1xuICAgICAgICAgICAgdGhpcy5idWZmZXIgPSB0aGlzLmJ1ZmZlciA/IHRoaXMuYnVmZmVyICsgc291cmNlIDogc291cmNlO1xuICAgICAgICAgICAgdGhpcy5saW5lRW5kUG9zID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmF0RW5kID0gIWluY29tcGxldGU7XG4gICAgICAgIGxldCBuZXh0ID0gdGhpcy5uZXh0ID8/ICdzdHJlYW0nO1xuICAgICAgICB3aGlsZSAobmV4dCAmJiAoaW5jb21wbGV0ZSB8fCB0aGlzLmhhc0NoYXJzKDEpKSlcbiAgICAgICAgICAgIG5leHQgPSB5aWVsZCogdGhpcy5wYXJzZU5leHQobmV4dCk7XG4gICAgfVxuICAgIGF0TGluZUVuZCgpIHtcbiAgICAgICAgbGV0IGkgPSB0aGlzLnBvcztcbiAgICAgICAgbGV0IGNoID0gdGhpcy5idWZmZXJbaV07XG4gICAgICAgIHdoaWxlIChjaCA9PT0gJyAnIHx8IGNoID09PSAnXFx0JylcbiAgICAgICAgICAgIGNoID0gdGhpcy5idWZmZXJbKytpXTtcbiAgICAgICAgaWYgKCFjaCB8fCBjaCA9PT0gJyMnIHx8IGNoID09PSAnXFxuJylcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICBpZiAoY2ggPT09ICdcXHInKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYnVmZmVyW2kgKyAxXSA9PT0gJ1xcbic7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY2hhckF0KG4pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYnVmZmVyW3RoaXMucG9zICsgbl07XG4gICAgfVxuICAgIGNvbnRpbnVlU2NhbGFyKG9mZnNldCkge1xuICAgICAgICBsZXQgY2ggPSB0aGlzLmJ1ZmZlcltvZmZzZXRdO1xuICAgICAgICBpZiAodGhpcy5pbmRlbnROZXh0ID4gMCkge1xuICAgICAgICAgICAgbGV0IGluZGVudCA9IDA7XG4gICAgICAgICAgICB3aGlsZSAoY2ggPT09ICcgJylcbiAgICAgICAgICAgICAgICBjaCA9IHRoaXMuYnVmZmVyWysraW5kZW50ICsgb2Zmc2V0XTtcbiAgICAgICAgICAgIGlmIChjaCA9PT0gJ1xccicpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXh0ID0gdGhpcy5idWZmZXJbaW5kZW50ICsgb2Zmc2V0ICsgMV07XG4gICAgICAgICAgICAgICAgaWYgKG5leHQgPT09ICdcXG4nIHx8ICghbmV4dCAmJiAhdGhpcy5hdEVuZCkpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvZmZzZXQgKyBpbmRlbnQgKyAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGNoID09PSAnXFxuJyB8fCBpbmRlbnQgPj0gdGhpcy5pbmRlbnROZXh0IHx8ICghY2ggJiYgIXRoaXMuYXRFbmQpXG4gICAgICAgICAgICAgICAgPyBvZmZzZXQgKyBpbmRlbnRcbiAgICAgICAgICAgICAgICA6IC0xO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaCA9PT0gJy0nIHx8IGNoID09PSAnLicpIHtcbiAgICAgICAgICAgIGNvbnN0IGR0ID0gdGhpcy5idWZmZXIuc3Vic3RyKG9mZnNldCwgMyk7XG4gICAgICAgICAgICBpZiAoKGR0ID09PSAnLS0tJyB8fCBkdCA9PT0gJy4uLicpICYmIGlzRW1wdHkodGhpcy5idWZmZXJbb2Zmc2V0ICsgM10pKVxuICAgICAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb2Zmc2V0O1xuICAgIH1cbiAgICBnZXRMaW5lKCkge1xuICAgICAgICBsZXQgZW5kID0gdGhpcy5saW5lRW5kUG9zO1xuICAgICAgICBpZiAodHlwZW9mIGVuZCAhPT0gJ251bWJlcicgfHwgKGVuZCAhPT0gLTEgJiYgZW5kIDwgdGhpcy5wb3MpKSB7XG4gICAgICAgICAgICBlbmQgPSB0aGlzLmJ1ZmZlci5pbmRleE9mKCdcXG4nLCB0aGlzLnBvcyk7XG4gICAgICAgICAgICB0aGlzLmxpbmVFbmRQb3MgPSBlbmQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVuZCA9PT0gLTEpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hdEVuZCA/IHRoaXMuYnVmZmVyLnN1YnN0cmluZyh0aGlzLnBvcykgOiBudWxsO1xuICAgICAgICBpZiAodGhpcy5idWZmZXJbZW5kIC0gMV0gPT09ICdcXHInKVxuICAgICAgICAgICAgZW5kIC09IDE7XG4gICAgICAgIHJldHVybiB0aGlzLmJ1ZmZlci5zdWJzdHJpbmcodGhpcy5wb3MsIGVuZCk7XG4gICAgfVxuICAgIGhhc0NoYXJzKG4pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucG9zICsgbiA8PSB0aGlzLmJ1ZmZlci5sZW5ndGg7XG4gICAgfVxuICAgIHNldE5leHQoc3RhdGUpIHtcbiAgICAgICAgdGhpcy5idWZmZXIgPSB0aGlzLmJ1ZmZlci5zdWJzdHJpbmcodGhpcy5wb3MpO1xuICAgICAgICB0aGlzLnBvcyA9IDA7XG4gICAgICAgIHRoaXMubGluZUVuZFBvcyA9IG51bGw7XG4gICAgICAgIHRoaXMubmV4dCA9IHN0YXRlO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcGVlayhuKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJ1ZmZlci5zdWJzdHIodGhpcy5wb3MsIG4pO1xuICAgIH1cbiAgICAqcGFyc2VOZXh0KG5leHQpIHtcbiAgICAgICAgc3dpdGNoIChuZXh0KSB7XG4gICAgICAgICAgICBjYXNlICdzdHJlYW0nOlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZVN0cmVhbSgpO1xuICAgICAgICAgICAgY2FzZSAnbGluZS1zdGFydCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlTGluZVN0YXJ0KCk7XG4gICAgICAgICAgICBjYXNlICdibG9jay1zdGFydCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlQmxvY2tTdGFydCgpO1xuICAgICAgICAgICAgY2FzZSAnZG9jJzpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VEb2N1bWVudCgpO1xuICAgICAgICAgICAgY2FzZSAnZmxvdyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlRmxvd0NvbGxlY3Rpb24oKTtcbiAgICAgICAgICAgIGNhc2UgJ3F1b3RlZC1zY2FsYXInOlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZVF1b3RlZFNjYWxhcigpO1xuICAgICAgICAgICAgY2FzZSAnYmxvY2stc2NhbGFyJzpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VCbG9ja1NjYWxhcigpO1xuICAgICAgICAgICAgY2FzZSAncGxhaW4tc2NhbGFyJzpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VQbGFpblNjYWxhcigpO1xuICAgICAgICB9XG4gICAgfVxuICAgICpwYXJzZVN0cmVhbSgpIHtcbiAgICAgICAgbGV0IGxpbmUgPSB0aGlzLmdldExpbmUoKTtcbiAgICAgICAgaWYgKGxpbmUgPT09IG51bGwpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXROZXh0KCdzdHJlYW0nKTtcbiAgICAgICAgaWYgKGxpbmVbMF0gPT09IGNzdC5CT00pIHtcbiAgICAgICAgICAgIHlpZWxkKiB0aGlzLnB1c2hDb3VudCgxKTtcbiAgICAgICAgICAgIGxpbmUgPSBsaW5lLnN1YnN0cmluZygxKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobGluZVswXSA9PT0gJyUnKSB7XG4gICAgICAgICAgICBsZXQgZGlyRW5kID0gbGluZS5sZW5ndGg7XG4gICAgICAgICAgICBsZXQgY3MgPSBsaW5lLmluZGV4T2YoJyMnKTtcbiAgICAgICAgICAgIHdoaWxlIChjcyAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjaCA9IGxpbmVbY3MgLSAxXTtcbiAgICAgICAgICAgICAgICBpZiAoY2ggPT09ICcgJyB8fCBjaCA9PT0gJ1xcdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgZGlyRW5kID0gY3MgLSAxO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNzID0gbGluZS5pbmRleE9mKCcjJywgY3MgKyAxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoID0gbGluZVtkaXJFbmQgLSAxXTtcbiAgICAgICAgICAgICAgICBpZiAoY2ggPT09ICcgJyB8fCBjaCA9PT0gJ1xcdCcpXG4gICAgICAgICAgICAgICAgICAgIGRpckVuZCAtPSAxO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBuID0gKHlpZWxkKiB0aGlzLnB1c2hDb3VudChkaXJFbmQpKSArICh5aWVsZCogdGhpcy5wdXNoU3BhY2VzKHRydWUpKTtcbiAgICAgICAgICAgIHlpZWxkKiB0aGlzLnB1c2hDb3VudChsaW5lLmxlbmd0aCAtIG4pOyAvLyBwb3NzaWJsZSBjb21tZW50XG4gICAgICAgICAgICB0aGlzLnB1c2hOZXdsaW5lKCk7XG4gICAgICAgICAgICByZXR1cm4gJ3N0cmVhbSc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuYXRMaW5lRW5kKCkpIHtcbiAgICAgICAgICAgIGNvbnN0IHNwID0geWllbGQqIHRoaXMucHVzaFNwYWNlcyh0cnVlKTtcbiAgICAgICAgICAgIHlpZWxkKiB0aGlzLnB1c2hDb3VudChsaW5lLmxlbmd0aCAtIHNwKTtcbiAgICAgICAgICAgIHlpZWxkKiB0aGlzLnB1c2hOZXdsaW5lKCk7XG4gICAgICAgICAgICByZXR1cm4gJ3N0cmVhbSc7XG4gICAgICAgIH1cbiAgICAgICAgeWllbGQgY3N0LkRPQ1VNRU5UO1xuICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VMaW5lU3RhcnQoKTtcbiAgICB9XG4gICAgKnBhcnNlTGluZVN0YXJ0KCkge1xuICAgICAgICBjb25zdCBjaCA9IHRoaXMuY2hhckF0KDApO1xuICAgICAgICBpZiAoIWNoICYmICF0aGlzLmF0RW5kKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0TmV4dCgnbGluZS1zdGFydCcpO1xuICAgICAgICBpZiAoY2ggPT09ICctJyB8fCBjaCA9PT0gJy4nKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuYXRFbmQgJiYgIXRoaXMuaGFzQ2hhcnMoNCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0TmV4dCgnbGluZS1zdGFydCcpO1xuICAgICAgICAgICAgY29uc3QgcyA9IHRoaXMucGVlaygzKTtcbiAgICAgICAgICAgIGlmICgocyA9PT0gJy0tLScgfHwgcyA9PT0gJy4uLicpICYmIGlzRW1wdHkodGhpcy5jaGFyQXQoMykpKSB7XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaENvdW50KDMpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5kZW50VmFsdWUgPSAwO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5kZW50TmV4dCA9IDA7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHMgPT09ICctLS0nID8gJ2RvYycgOiAnc3RyZWFtJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmluZGVudFZhbHVlID0geWllbGQqIHRoaXMucHVzaFNwYWNlcyhmYWxzZSk7XG4gICAgICAgIGlmICh0aGlzLmluZGVudE5leHQgPiB0aGlzLmluZGVudFZhbHVlICYmICFpc0VtcHR5KHRoaXMuY2hhckF0KDEpKSlcbiAgICAgICAgICAgIHRoaXMuaW5kZW50TmV4dCA9IHRoaXMuaW5kZW50VmFsdWU7XG4gICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZUJsb2NrU3RhcnQoKTtcbiAgICB9XG4gICAgKnBhcnNlQmxvY2tTdGFydCgpIHtcbiAgICAgICAgY29uc3QgW2NoMCwgY2gxXSA9IHRoaXMucGVlaygyKTtcbiAgICAgICAgaWYgKCFjaDEgJiYgIXRoaXMuYXRFbmQpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXROZXh0KCdibG9jay1zdGFydCcpO1xuICAgICAgICBpZiAoKGNoMCA9PT0gJy0nIHx8IGNoMCA9PT0gJz8nIHx8IGNoMCA9PT0gJzonKSAmJiBpc0VtcHR5KGNoMSkpIHtcbiAgICAgICAgICAgIGNvbnN0IG4gPSAoeWllbGQqIHRoaXMucHVzaENvdW50KDEpKSArICh5aWVsZCogdGhpcy5wdXNoU3BhY2VzKHRydWUpKTtcbiAgICAgICAgICAgIHRoaXMuaW5kZW50TmV4dCA9IHRoaXMuaW5kZW50VmFsdWUgKyAxO1xuICAgICAgICAgICAgdGhpcy5pbmRlbnRWYWx1ZSArPSBuO1xuICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlQmxvY2tTdGFydCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAnZG9jJztcbiAgICB9XG4gICAgKnBhcnNlRG9jdW1lbnQoKSB7XG4gICAgICAgIHlpZWxkKiB0aGlzLnB1c2hTcGFjZXModHJ1ZSk7XG4gICAgICAgIGNvbnN0IGxpbmUgPSB0aGlzLmdldExpbmUoKTtcbiAgICAgICAgaWYgKGxpbmUgPT09IG51bGwpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXROZXh0KCdkb2MnKTtcbiAgICAgICAgbGV0IG4gPSB5aWVsZCogdGhpcy5wdXNoSW5kaWNhdG9ycygpO1xuICAgICAgICBzd2l0Y2ggKGxpbmVbbl0pIHtcbiAgICAgICAgICAgIGNhc2UgJyMnOlxuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnB1c2hDb3VudChsaW5lLmxlbmd0aCAtIG4pO1xuICAgICAgICAgICAgLy8gZmFsbHRocm91Z2hcbiAgICAgICAgICAgIGNhc2UgdW5kZWZpbmVkOlxuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnB1c2hOZXdsaW5lKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlTGluZVN0YXJ0KCk7XG4gICAgICAgICAgICBjYXNlICd7JzpcbiAgICAgICAgICAgIGNhc2UgJ1snOlxuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnB1c2hDb3VudCgxKTtcbiAgICAgICAgICAgICAgICB0aGlzLmZsb3dLZXkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLmZsb3dMZXZlbCA9IDE7XG4gICAgICAgICAgICAgICAgcmV0dXJuICdmbG93JztcbiAgICAgICAgICAgIGNhc2UgJ30nOlxuICAgICAgICAgICAgY2FzZSAnXSc6XG4gICAgICAgICAgICAgICAgLy8gdGhpcyBpcyBhbiBlcnJvclxuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnB1c2hDb3VudCgxKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2RvYyc7XG4gICAgICAgICAgICBjYXNlICcqJzpcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoVW50aWwoaXNOb3RBbmNob3JDaGFyKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2RvYyc7XG4gICAgICAgICAgICBjYXNlICdcIic6XG4gICAgICAgICAgICBjYXNlIFwiJ1wiOlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZVF1b3RlZFNjYWxhcigpO1xuICAgICAgICAgICAgY2FzZSAnfCc6XG4gICAgICAgICAgICBjYXNlICc+JzpcbiAgICAgICAgICAgICAgICBuICs9IHlpZWxkKiB0aGlzLnBhcnNlQmxvY2tTY2FsYXJIZWFkZXIoKTtcbiAgICAgICAgICAgICAgICBuICs9IHlpZWxkKiB0aGlzLnB1c2hTcGFjZXModHJ1ZSk7XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaENvdW50KGxpbmUubGVuZ3RoIC0gbik7XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaE5ld2xpbmUoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VCbG9ja1NjYWxhcigpO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VQbGFpblNjYWxhcigpO1xuICAgICAgICB9XG4gICAgfVxuICAgICpwYXJzZUZsb3dDb2xsZWN0aW9uKCkge1xuICAgICAgICBsZXQgbmwsIHNwO1xuICAgICAgICBsZXQgaW5kZW50ID0gLTE7XG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIG5sID0geWllbGQqIHRoaXMucHVzaE5ld2xpbmUoKTtcbiAgICAgICAgICAgIGlmIChubCA+IDApIHtcbiAgICAgICAgICAgICAgICBzcCA9IHlpZWxkKiB0aGlzLnB1c2hTcGFjZXMoZmFsc2UpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5kZW50VmFsdWUgPSBpbmRlbnQgPSBzcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHNwID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNwICs9IHlpZWxkKiB0aGlzLnB1c2hTcGFjZXModHJ1ZSk7XG4gICAgICAgIH0gd2hpbGUgKG5sICsgc3AgPiAwKTtcbiAgICAgICAgY29uc3QgbGluZSA9IHRoaXMuZ2V0TGluZSgpO1xuICAgICAgICBpZiAobGluZSA9PT0gbnVsbClcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldE5leHQoJ2Zsb3cnKTtcbiAgICAgICAgaWYgKChpbmRlbnQgIT09IC0xICYmIGluZGVudCA8IHRoaXMuaW5kZW50TmV4dCAmJiBsaW5lWzBdICE9PSAnIycpIHx8XG4gICAgICAgICAgICAoaW5kZW50ID09PSAwICYmXG4gICAgICAgICAgICAgICAgKGxpbmUuc3RhcnRzV2l0aCgnLS0tJykgfHwgbGluZS5zdGFydHNXaXRoKCcuLi4nKSkgJiZcbiAgICAgICAgICAgICAgICBpc0VtcHR5KGxpbmVbM10pKSkge1xuICAgICAgICAgICAgLy8gQWxsb3dpbmcgZm9yIHRoZSB0ZXJtaW5hbCBdIG9yIH0gYXQgdGhlIHNhbWUgKHJhdGhlciB0aGFuIGdyZWF0ZXIpXG4gICAgICAgICAgICAvLyBpbmRlbnQgbGV2ZWwgYXMgdGhlIGluaXRpYWwgWyBvciB7IGlzIHRlY2huaWNhbGx5IGludmFsaWQsIGJ1dFxuICAgICAgICAgICAgLy8gZmFpbGluZyBoZXJlIHdvdWxkIGJlIHN1cnByaXNpbmcgdG8gdXNlcnMuXG4gICAgICAgICAgICBjb25zdCBhdEZsb3dFbmRNYXJrZXIgPSBpbmRlbnQgPT09IHRoaXMuaW5kZW50TmV4dCAtIDEgJiZcbiAgICAgICAgICAgICAgICB0aGlzLmZsb3dMZXZlbCA9PT0gMSAmJlxuICAgICAgICAgICAgICAgIChsaW5lWzBdID09PSAnXScgfHwgbGluZVswXSA9PT0gJ30nKTtcbiAgICAgICAgICAgIGlmICghYXRGbG93RW5kTWFya2VyKSB7XG4gICAgICAgICAgICAgICAgLy8gdGhpcyBpcyBhbiBlcnJvclxuICAgICAgICAgICAgICAgIHRoaXMuZmxvd0xldmVsID0gMDtcbiAgICAgICAgICAgICAgICB5aWVsZCBjc3QuRkxPV19FTkQ7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlTGluZVN0YXJ0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbGV0IG4gPSAwO1xuICAgICAgICB3aGlsZSAobGluZVtuXSA9PT0gJywnKSB7XG4gICAgICAgICAgICBuICs9IHlpZWxkKiB0aGlzLnB1c2hDb3VudCgxKTtcbiAgICAgICAgICAgIG4gKz0geWllbGQqIHRoaXMucHVzaFNwYWNlcyh0cnVlKTtcbiAgICAgICAgICAgIHRoaXMuZmxvd0tleSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIG4gKz0geWllbGQqIHRoaXMucHVzaEluZGljYXRvcnMoKTtcbiAgICAgICAgc3dpdGNoIChsaW5lW25dKSB7XG4gICAgICAgICAgICBjYXNlIHVuZGVmaW5lZDpcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2Zsb3cnO1xuICAgICAgICAgICAgY2FzZSAnIyc6XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaENvdW50KGxpbmUubGVuZ3RoIC0gbik7XG4gICAgICAgICAgICAgICAgcmV0dXJuICdmbG93JztcbiAgICAgICAgICAgIGNhc2UgJ3snOlxuICAgICAgICAgICAgY2FzZSAnWyc6XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaENvdW50KDEpO1xuICAgICAgICAgICAgICAgIHRoaXMuZmxvd0tleSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMuZmxvd0xldmVsICs9IDE7XG4gICAgICAgICAgICAgICAgcmV0dXJuICdmbG93JztcbiAgICAgICAgICAgIGNhc2UgJ30nOlxuICAgICAgICAgICAgY2FzZSAnXSc6XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaENvdW50KDEpO1xuICAgICAgICAgICAgICAgIHRoaXMuZmxvd0tleSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5mbG93TGV2ZWwgLT0gMTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5mbG93TGV2ZWwgPyAnZmxvdycgOiAnZG9jJztcbiAgICAgICAgICAgIGNhc2UgJyonOlxuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnB1c2hVbnRpbChpc05vdEFuY2hvckNoYXIpO1xuICAgICAgICAgICAgICAgIHJldHVybiAnZmxvdyc7XG4gICAgICAgICAgICBjYXNlICdcIic6XG4gICAgICAgICAgICBjYXNlIFwiJ1wiOlxuICAgICAgICAgICAgICAgIHRoaXMuZmxvd0tleSA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlUXVvdGVkU2NhbGFyKCk7XG4gICAgICAgICAgICBjYXNlICc6Jzoge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5leHQgPSB0aGlzLmNoYXJBdCgxKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5mbG93S2V5IHx8IGlzRW1wdHkobmV4dCkgfHwgbmV4dCA9PT0gJywnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmxvd0tleSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoQ291bnQoMSk7XG4gICAgICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnB1c2hTcGFjZXModHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnZmxvdyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gZmFsbHRocm91Z2hcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhpcy5mbG93S2V5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlUGxhaW5TY2FsYXIoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAqcGFyc2VRdW90ZWRTY2FsYXIoKSB7XG4gICAgICAgIGNvbnN0IHF1b3RlID0gdGhpcy5jaGFyQXQoMCk7XG4gICAgICAgIGxldCBlbmQgPSB0aGlzLmJ1ZmZlci5pbmRleE9mKHF1b3RlLCB0aGlzLnBvcyArIDEpO1xuICAgICAgICBpZiAocXVvdGUgPT09IFwiJ1wiKSB7XG4gICAgICAgICAgICB3aGlsZSAoZW5kICE9PSAtMSAmJiB0aGlzLmJ1ZmZlcltlbmQgKyAxXSA9PT0gXCInXCIpXG4gICAgICAgICAgICAgICAgZW5kID0gdGhpcy5idWZmZXIuaW5kZXhPZihcIidcIiwgZW5kICsgMik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBkb3VibGUtcXVvdGVcbiAgICAgICAgICAgIHdoaWxlIChlbmQgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgbGV0IG4gPSAwO1xuICAgICAgICAgICAgICAgIHdoaWxlICh0aGlzLmJ1ZmZlcltlbmQgLSAxIC0gbl0gPT09ICdcXFxcJylcbiAgICAgICAgICAgICAgICAgICAgbiArPSAxO1xuICAgICAgICAgICAgICAgIGlmIChuICUgMiA9PT0gMClcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZW5kID0gdGhpcy5idWZmZXIuaW5kZXhPZignXCInLCBlbmQgKyAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBPbmx5IGxvb2tpbmcgZm9yIG5ld2xpbmVzIHdpdGhpbiB0aGUgcXVvdGVzXG4gICAgICAgIGNvbnN0IHFiID0gdGhpcy5idWZmZXIuc3Vic3RyaW5nKDAsIGVuZCk7XG4gICAgICAgIGxldCBubCA9IHFiLmluZGV4T2YoJ1xcbicsIHRoaXMucG9zKTtcbiAgICAgICAgaWYgKG5sICE9PSAtMSkge1xuICAgICAgICAgICAgd2hpbGUgKG5sICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNzID0gdGhpcy5jb250aW51ZVNjYWxhcihubCArIDEpO1xuICAgICAgICAgICAgICAgIGlmIChjcyA9PT0gLTEpXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIG5sID0gcWIuaW5kZXhPZignXFxuJywgY3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG5sICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIC8vIHRoaXMgaXMgYW4gZXJyb3IgY2F1c2VkIGJ5IGFuIHVuZXhwZWN0ZWQgdW5pbmRlbnRcbiAgICAgICAgICAgICAgICBlbmQgPSBubCAtIChxYltubCAtIDFdID09PSAnXFxyJyA/IDIgOiAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZW5kID09PSAtMSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmF0RW5kKVxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldE5leHQoJ3F1b3RlZC1zY2FsYXInKTtcbiAgICAgICAgICAgIGVuZCA9IHRoaXMuYnVmZmVyLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICB5aWVsZCogdGhpcy5wdXNoVG9JbmRleChlbmQgKyAxLCBmYWxzZSk7XG4gICAgICAgIHJldHVybiB0aGlzLmZsb3dMZXZlbCA/ICdmbG93JyA6ICdkb2MnO1xuICAgIH1cbiAgICAqcGFyc2VCbG9ja1NjYWxhckhlYWRlcigpIHtcbiAgICAgICAgdGhpcy5ibG9ja1NjYWxhckluZGVudCA9IC0xO1xuICAgICAgICB0aGlzLmJsb2NrU2NhbGFyS2VlcCA9IGZhbHNlO1xuICAgICAgICBsZXQgaSA9IHRoaXMucG9zO1xuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgY29uc3QgY2ggPSB0aGlzLmJ1ZmZlclsrK2ldO1xuICAgICAgICAgICAgaWYgKGNoID09PSAnKycpXG4gICAgICAgICAgICAgICAgdGhpcy5ibG9ja1NjYWxhcktlZXAgPSB0cnVlO1xuICAgICAgICAgICAgZWxzZSBpZiAoY2ggPiAnMCcgJiYgY2ggPD0gJzknKVxuICAgICAgICAgICAgICAgIHRoaXMuYmxvY2tTY2FsYXJJbmRlbnQgPSBOdW1iZXIoY2gpIC0gMTtcbiAgICAgICAgICAgIGVsc2UgaWYgKGNoICE9PSAnLScpXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnB1c2hVbnRpbChjaCA9PiBpc0VtcHR5KGNoKSB8fCBjaCA9PT0gJyMnKTtcbiAgICB9XG4gICAgKnBhcnNlQmxvY2tTY2FsYXIoKSB7XG4gICAgICAgIGxldCBubCA9IHRoaXMucG9zIC0gMTsgLy8gbWF5IGJlIC0xIGlmIHRoaXMucG9zID09PSAwXG4gICAgICAgIGxldCBpbmRlbnQgPSAwO1xuICAgICAgICBsZXQgY2g7XG4gICAgICAgIGxvb3A6IGZvciAobGV0IGkgPSB0aGlzLnBvczsgKGNoID0gdGhpcy5idWZmZXJbaV0pOyArK2kpIHtcbiAgICAgICAgICAgIHN3aXRjaCAoY2gpIHtcbiAgICAgICAgICAgICAgICBjYXNlICcgJzpcbiAgICAgICAgICAgICAgICAgICAgaW5kZW50ICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ1xcbic6XG4gICAgICAgICAgICAgICAgICAgIG5sID0gaTtcbiAgICAgICAgICAgICAgICAgICAgaW5kZW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnXFxyJzoge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXh0ID0gdGhpcy5idWZmZXJbaSArIDFdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIW5leHQgJiYgIXRoaXMuYXRFbmQpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXROZXh0KCdibG9jay1zY2FsYXInKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5leHQgPT09ICdcXG4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfSAvLyBmYWxsdGhyb3VnaFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrIGxvb3A7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFjaCAmJiAhdGhpcy5hdEVuZClcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldE5leHQoJ2Jsb2NrLXNjYWxhcicpO1xuICAgICAgICBpZiAoaW5kZW50ID49IHRoaXMuaW5kZW50TmV4dCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuYmxvY2tTY2FsYXJJbmRlbnQgPT09IC0xKVxuICAgICAgICAgICAgICAgIHRoaXMuaW5kZW50TmV4dCA9IGluZGVudDtcbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuaW5kZW50TmV4dCA9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYmxvY2tTY2FsYXJJbmRlbnQgKyAodGhpcy5pbmRlbnROZXh0ID09PSAwID8gMSA6IHRoaXMuaW5kZW50TmV4dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgY29uc3QgY3MgPSB0aGlzLmNvbnRpbnVlU2NhbGFyKG5sICsgMSk7XG4gICAgICAgICAgICAgICAgaWYgKGNzID09PSAtMSlcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgbmwgPSB0aGlzLmJ1ZmZlci5pbmRleE9mKCdcXG4nLCBjcyk7XG4gICAgICAgICAgICB9IHdoaWxlIChubCAhPT0gLTEpO1xuICAgICAgICAgICAgaWYgKG5sID09PSAtMSkge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5hdEVuZClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0TmV4dCgnYmxvY2stc2NhbGFyJyk7XG4gICAgICAgICAgICAgICAgbmwgPSB0aGlzLmJ1ZmZlci5sZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gVHJhaWxpbmcgaW5zdWZmaWNpZW50bHkgaW5kZW50ZWQgdGFicyBhcmUgaW52YWxpZC5cbiAgICAgICAgLy8gVG8gY2F0Y2ggdGhhdCBkdXJpbmcgcGFyc2luZywgd2UgaW5jbHVkZSB0aGVtIGluIHRoZSBibG9jayBzY2FsYXIgdmFsdWUuXG4gICAgICAgIGxldCBpID0gbmwgKyAxO1xuICAgICAgICBjaCA9IHRoaXMuYnVmZmVyW2ldO1xuICAgICAgICB3aGlsZSAoY2ggPT09ICcgJylcbiAgICAgICAgICAgIGNoID0gdGhpcy5idWZmZXJbKytpXTtcbiAgICAgICAgaWYgKGNoID09PSAnXFx0Jykge1xuICAgICAgICAgICAgd2hpbGUgKGNoID09PSAnXFx0JyB8fCBjaCA9PT0gJyAnIHx8IGNoID09PSAnXFxyJyB8fCBjaCA9PT0gJ1xcbicpXG4gICAgICAgICAgICAgICAgY2ggPSB0aGlzLmJ1ZmZlclsrK2ldO1xuICAgICAgICAgICAgbmwgPSBpIC0gMTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICghdGhpcy5ibG9ja1NjYWxhcktlZXApIHtcbiAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICBsZXQgaSA9IG5sIC0gMTtcbiAgICAgICAgICAgICAgICBsZXQgY2ggPSB0aGlzLmJ1ZmZlcltpXTtcbiAgICAgICAgICAgICAgICBpZiAoY2ggPT09ICdcXHInKVxuICAgICAgICAgICAgICAgICAgICBjaCA9IHRoaXMuYnVmZmVyWy0taV07XG4gICAgICAgICAgICAgICAgY29uc3QgbGFzdENoYXIgPSBpOyAvLyBEcm9wIHRoZSBsaW5lIGlmIGxhc3QgY2hhciBub3QgbW9yZSBpbmRlbnRlZFxuICAgICAgICAgICAgICAgIHdoaWxlIChjaCA9PT0gJyAnKVxuICAgICAgICAgICAgICAgICAgICBjaCA9IHRoaXMuYnVmZmVyWy0taV07XG4gICAgICAgICAgICAgICAgaWYgKGNoID09PSAnXFxuJyAmJiBpID49IHRoaXMucG9zICYmIGkgKyAxICsgaW5kZW50ID4gbGFzdENoYXIpXG4gICAgICAgICAgICAgICAgICAgIG5sID0gaTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfSB3aGlsZSAodHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgeWllbGQgY3N0LlNDQUxBUjtcbiAgICAgICAgeWllbGQqIHRoaXMucHVzaFRvSW5kZXgobmwgKyAxLCB0cnVlKTtcbiAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlTGluZVN0YXJ0KCk7XG4gICAgfVxuICAgICpwYXJzZVBsYWluU2NhbGFyKCkge1xuICAgICAgICBjb25zdCBpbkZsb3cgPSB0aGlzLmZsb3dMZXZlbCA+IDA7XG4gICAgICAgIGxldCBlbmQgPSB0aGlzLnBvcyAtIDE7XG4gICAgICAgIGxldCBpID0gdGhpcy5wb3MgLSAxO1xuICAgICAgICBsZXQgY2g7XG4gICAgICAgIHdoaWxlICgoY2ggPSB0aGlzLmJ1ZmZlclsrK2ldKSkge1xuICAgICAgICAgICAgaWYgKGNoID09PSAnOicpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXh0ID0gdGhpcy5idWZmZXJbaSArIDFdO1xuICAgICAgICAgICAgICAgIGlmIChpc0VtcHR5KG5leHQpIHx8IChpbkZsb3cgJiYgZmxvd0luZGljYXRvckNoYXJzLmhhcyhuZXh0KSkpXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGVuZCA9IGk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpc0VtcHR5KGNoKSkge1xuICAgICAgICAgICAgICAgIGxldCBuZXh0ID0gdGhpcy5idWZmZXJbaSArIDFdO1xuICAgICAgICAgICAgICAgIGlmIChjaCA9PT0gJ1xccicpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5leHQgPT09ICdcXG4nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpICs9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaCA9ICdcXG4nO1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dCA9IHRoaXMuYnVmZmVyW2kgKyAxXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmQgPSBpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobmV4dCA9PT0gJyMnIHx8IChpbkZsb3cgJiYgZmxvd0luZGljYXRvckNoYXJzLmhhcyhuZXh0KSkpXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGlmIChjaCA9PT0gJ1xcbicpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY3MgPSB0aGlzLmNvbnRpbnVlU2NhbGFyKGkgKyAxKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNzID09PSAtMSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBpID0gTWF0aC5tYXgoaSwgY3MgLSAyKTsgLy8gdG8gYWR2YW5jZSwgYnV0IHN0aWxsIGFjY291bnQgZm9yICcgIydcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5GbG93ICYmIGZsb3dJbmRpY2F0b3JDaGFycy5oYXMoY2gpKVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBlbmQgPSBpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghY2ggJiYgIXRoaXMuYXRFbmQpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXROZXh0KCdwbGFpbi1zY2FsYXInKTtcbiAgICAgICAgeWllbGQgY3N0LlNDQUxBUjtcbiAgICAgICAgeWllbGQqIHRoaXMucHVzaFRvSW5kZXgoZW5kICsgMSwgdHJ1ZSk7XG4gICAgICAgIHJldHVybiBpbkZsb3cgPyAnZmxvdycgOiAnZG9jJztcbiAgICB9XG4gICAgKnB1c2hDb3VudChuKSB7XG4gICAgICAgIGlmIChuID4gMCkge1xuICAgICAgICAgICAgeWllbGQgdGhpcy5idWZmZXIuc3Vic3RyKHRoaXMucG9zLCBuKTtcbiAgICAgICAgICAgIHRoaXMucG9zICs9IG47XG4gICAgICAgICAgICByZXR1cm4gbjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG4gICAgKnB1c2hUb0luZGV4KGksIGFsbG93RW1wdHkpIHtcbiAgICAgICAgY29uc3QgcyA9IHRoaXMuYnVmZmVyLnNsaWNlKHRoaXMucG9zLCBpKTtcbiAgICAgICAgaWYgKHMpIHtcbiAgICAgICAgICAgIHlpZWxkIHM7XG4gICAgICAgICAgICB0aGlzLnBvcyArPSBzLmxlbmd0aDtcbiAgICAgICAgICAgIHJldHVybiBzLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChhbGxvd0VtcHR5KVxuICAgICAgICAgICAgeWllbGQgJyc7XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICAqcHVzaEluZGljYXRvcnMoKSB7XG4gICAgICAgIHN3aXRjaCAodGhpcy5jaGFyQXQoMCkpIHtcbiAgICAgICAgICAgIGNhc2UgJyEnOlxuICAgICAgICAgICAgICAgIHJldHVybiAoKHlpZWxkKiB0aGlzLnB1c2hUYWcoKSkgK1xuICAgICAgICAgICAgICAgICAgICAoeWllbGQqIHRoaXMucHVzaFNwYWNlcyh0cnVlKSkgK1xuICAgICAgICAgICAgICAgICAgICAoeWllbGQqIHRoaXMucHVzaEluZGljYXRvcnMoKSkpO1xuICAgICAgICAgICAgY2FzZSAnJic6XG4gICAgICAgICAgICAgICAgcmV0dXJuICgoeWllbGQqIHRoaXMucHVzaFVudGlsKGlzTm90QW5jaG9yQ2hhcikpICtcbiAgICAgICAgICAgICAgICAgICAgKHlpZWxkKiB0aGlzLnB1c2hTcGFjZXModHJ1ZSkpICtcbiAgICAgICAgICAgICAgICAgICAgKHlpZWxkKiB0aGlzLnB1c2hJbmRpY2F0b3JzKCkpKTtcbiAgICAgICAgICAgIGNhc2UgJy0nOiAvLyB0aGlzIGlzIGFuIGVycm9yXG4gICAgICAgICAgICBjYXNlICc/JzogLy8gdGhpcyBpcyBhbiBlcnJvciBvdXRzaWRlIGZsb3cgY29sbGVjdGlvbnNcbiAgICAgICAgICAgIGNhc2UgJzonOiB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5GbG93ID0gdGhpcy5mbG93TGV2ZWwgPiAwO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoMSA9IHRoaXMuY2hhckF0KDEpO1xuICAgICAgICAgICAgICAgIGlmIChpc0VtcHR5KGNoMSkgfHwgKGluRmxvdyAmJiBmbG93SW5kaWNhdG9yQ2hhcnMuaGFzKGNoMSkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaW5GbG93KVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmRlbnROZXh0ID0gdGhpcy5pbmRlbnRWYWx1ZSArIDE7XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuZmxvd0tleSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZmxvd0tleSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCh5aWVsZCogdGhpcy5wdXNoQ291bnQoMSkpICtcbiAgICAgICAgICAgICAgICAgICAgICAgICh5aWVsZCogdGhpcy5wdXNoU3BhY2VzKHRydWUpKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAoeWllbGQqIHRoaXMucHVzaEluZGljYXRvcnMoKSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG4gICAgKnB1c2hUYWcoKSB7XG4gICAgICAgIGlmICh0aGlzLmNoYXJBdCgxKSA9PT0gJzwnKSB7XG4gICAgICAgICAgICBsZXQgaSA9IHRoaXMucG9zICsgMjtcbiAgICAgICAgICAgIGxldCBjaCA9IHRoaXMuYnVmZmVyW2ldO1xuICAgICAgICAgICAgd2hpbGUgKCFpc0VtcHR5KGNoKSAmJiBjaCAhPT0gJz4nKVxuICAgICAgICAgICAgICAgIGNoID0gdGhpcy5idWZmZXJbKytpXTtcbiAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wdXNoVG9JbmRleChjaCA9PT0gJz4nID8gaSArIDEgOiBpLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsZXQgaSA9IHRoaXMucG9zICsgMTtcbiAgICAgICAgICAgIGxldCBjaCA9IHRoaXMuYnVmZmVyW2ldO1xuICAgICAgICAgICAgd2hpbGUgKGNoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRhZ0NoYXJzLmhhcyhjaCkpXG4gICAgICAgICAgICAgICAgICAgIGNoID0gdGhpcy5idWZmZXJbKytpXTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChjaCA9PT0gJyUnICYmXG4gICAgICAgICAgICAgICAgICAgIGhleERpZ2l0cy5oYXModGhpcy5idWZmZXJbaSArIDFdKSAmJlxuICAgICAgICAgICAgICAgICAgICBoZXhEaWdpdHMuaGFzKHRoaXMuYnVmZmVyW2kgKyAyXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2ggPSB0aGlzLmJ1ZmZlclsoaSArPSAzKV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucHVzaFRvSW5kZXgoaSwgZmFsc2UpO1xuICAgICAgICB9XG4gICAgfVxuICAgICpwdXNoTmV3bGluZSgpIHtcbiAgICAgICAgY29uc3QgY2ggPSB0aGlzLmJ1ZmZlclt0aGlzLnBvc107XG4gICAgICAgIGlmIChjaCA9PT0gJ1xcbicpXG4gICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucHVzaENvdW50KDEpO1xuICAgICAgICBlbHNlIGlmIChjaCA9PT0gJ1xccicgJiYgdGhpcy5jaGFyQXQoMSkgPT09ICdcXG4nKVxuICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnB1c2hDb3VudCgyKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgICpwdXNoU3BhY2VzKGFsbG93VGFicykge1xuICAgICAgICBsZXQgaSA9IHRoaXMucG9zIC0gMTtcbiAgICAgICAgbGV0IGNoO1xuICAgICAgICBkbyB7XG4gICAgICAgICAgICBjaCA9IHRoaXMuYnVmZmVyWysraV07XG4gICAgICAgIH0gd2hpbGUgKGNoID09PSAnICcgfHwgKGFsbG93VGFicyAmJiBjaCA9PT0gJ1xcdCcpKTtcbiAgICAgICAgY29uc3QgbiA9IGkgLSB0aGlzLnBvcztcbiAgICAgICAgaWYgKG4gPiAwKSB7XG4gICAgICAgICAgICB5aWVsZCB0aGlzLmJ1ZmZlci5zdWJzdHIodGhpcy5wb3MsIG4pO1xuICAgICAgICAgICAgdGhpcy5wb3MgPSBpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuO1xuICAgIH1cbiAgICAqcHVzaFVudGlsKHRlc3QpIHtcbiAgICAgICAgbGV0IGkgPSB0aGlzLnBvcztcbiAgICAgICAgbGV0IGNoID0gdGhpcy5idWZmZXJbaV07XG4gICAgICAgIHdoaWxlICghdGVzdChjaCkpXG4gICAgICAgICAgICBjaCA9IHRoaXMuYnVmZmVyWysraV07XG4gICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wdXNoVG9JbmRleChpLCBmYWxzZSk7XG4gICAgfVxufVxuXG5leHBvcnRzLkxleGVyID0gTGV4ZXI7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBUcmFja3MgbmV3bGluZXMgZHVyaW5nIHBhcnNpbmcgaW4gb3JkZXIgdG8gcHJvdmlkZSBhbiBlZmZpY2llbnQgQVBJIGZvclxuICogZGV0ZXJtaW5pbmcgdGhlIG9uZS1pbmRleGVkIGB7IGxpbmUsIGNvbCB9YCBwb3NpdGlvbiBmb3IgYW55IG9mZnNldFxuICogd2l0aGluIHRoZSBpbnB1dC5cbiAqL1xuY2xhc3MgTGluZUNvdW50ZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmxpbmVTdGFydHMgPSBbXTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNob3VsZCBiZSBjYWxsZWQgaW4gYXNjZW5kaW5nIG9yZGVyLiBPdGhlcndpc2UsIGNhbGxcbiAgICAgICAgICogYGxpbmVDb3VudGVyLmxpbmVTdGFydHMuc29ydCgpYCBiZWZvcmUgY2FsbGluZyBgbGluZVBvcygpYC5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuYWRkTmV3TGluZSA9IChvZmZzZXQpID0+IHRoaXMubGluZVN0YXJ0cy5wdXNoKG9mZnNldCk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBQZXJmb3JtcyBhIGJpbmFyeSBzZWFyY2ggYW5kIHJldHVybnMgdGhlIDEtaW5kZXhlZCB7IGxpbmUsIGNvbCB9XG4gICAgICAgICAqIHBvc2l0aW9uIG9mIGBvZmZzZXRgLiBJZiBgbGluZSA9PT0gMGAsIGBhZGROZXdMaW5lYCBoYXMgbmV2ZXIgYmVlblxuICAgICAgICAgKiBjYWxsZWQgb3IgYG9mZnNldGAgaXMgYmVmb3JlIHRoZSBmaXJzdCBrbm93biBuZXdsaW5lLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5saW5lUG9zID0gKG9mZnNldCkgPT4ge1xuICAgICAgICAgICAgbGV0IGxvdyA9IDA7XG4gICAgICAgICAgICBsZXQgaGlnaCA9IHRoaXMubGluZVN0YXJ0cy5sZW5ndGg7XG4gICAgICAgICAgICB3aGlsZSAobG93IDwgaGlnaCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1pZCA9IChsb3cgKyBoaWdoKSA+PiAxOyAvLyBNYXRoLmZsb29yKChsb3cgKyBoaWdoKSAvIDIpXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubGluZVN0YXJ0c1ttaWRdIDwgb2Zmc2V0KVxuICAgICAgICAgICAgICAgICAgICBsb3cgPSBtaWQgKyAxO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgaGlnaCA9IG1pZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLmxpbmVTdGFydHNbbG93XSA9PT0gb2Zmc2V0KVxuICAgICAgICAgICAgICAgIHJldHVybiB7IGxpbmU6IGxvdyArIDEsIGNvbDogMSB9O1xuICAgICAgICAgICAgaWYgKGxvdyA9PT0gMClcbiAgICAgICAgICAgICAgICByZXR1cm4geyBsaW5lOiAwLCBjb2w6IG9mZnNldCB9O1xuICAgICAgICAgICAgY29uc3Qgc3RhcnQgPSB0aGlzLmxpbmVTdGFydHNbbG93IC0gMV07XG4gICAgICAgICAgICByZXR1cm4geyBsaW5lOiBsb3csIGNvbDogb2Zmc2V0IC0gc3RhcnQgKyAxIH07XG4gICAgICAgIH07XG4gICAgfVxufVxuXG5leHBvcnRzLkxpbmVDb3VudGVyID0gTGluZUNvdW50ZXI7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIG5vZGVfcHJvY2VzcyA9IHJlcXVpcmUoJ3Byb2Nlc3MnKTtcbnZhciBjc3QgPSByZXF1aXJlKCcuL2NzdC5qcycpO1xudmFyIGxleGVyID0gcmVxdWlyZSgnLi9sZXhlci5qcycpO1xuXG5mdW5jdGlvbiBpbmNsdWRlc1Rva2VuKGxpc3QsIHR5cGUpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyArK2kpXG4gICAgICAgIGlmIChsaXN0W2ldLnR5cGUgPT09IHR5cGUpXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICByZXR1cm4gZmFsc2U7XG59XG5mdW5jdGlvbiBmaW5kTm9uRW1wdHlJbmRleChsaXN0KSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHN3aXRjaCAobGlzdFtpXS50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gLTE7XG59XG5mdW5jdGlvbiBpc0Zsb3dUb2tlbih0b2tlbikge1xuICAgIHN3aXRjaCAodG9rZW4/LnR5cGUpIHtcbiAgICAgICAgY2FzZSAnYWxpYXMnOlxuICAgICAgICBjYXNlICdzY2FsYXInOlxuICAgICAgICBjYXNlICdzaW5nbGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgIGNhc2UgJ2RvdWJsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgY2FzZSAnZmxvdy1jb2xsZWN0aW9uJzpcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGdldFByZXZQcm9wcyhwYXJlbnQpIHtcbiAgICBzd2l0Y2ggKHBhcmVudC50eXBlKSB7XG4gICAgICAgIGNhc2UgJ2RvY3VtZW50JzpcbiAgICAgICAgICAgIHJldHVybiBwYXJlbnQuc3RhcnQ7XG4gICAgICAgIGNhc2UgJ2Jsb2NrLW1hcCc6IHtcbiAgICAgICAgICAgIGNvbnN0IGl0ID0gcGFyZW50Lml0ZW1zW3BhcmVudC5pdGVtcy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgIHJldHVybiBpdC5zZXAgPz8gaXQuc3RhcnQ7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnYmxvY2stc2VxJzpcbiAgICAgICAgICAgIHJldHVybiBwYXJlbnQuaXRlbXNbcGFyZW50Lml0ZW1zLmxlbmd0aCAtIDFdLnN0YXJ0O1xuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCBzaG91bGQgbm90IGhhcHBlbiAqL1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbn1cbi8qKiBOb3RlOiBNYXkgbW9kaWZ5IGlucHV0IGFycmF5ICovXG5mdW5jdGlvbiBnZXRGaXJzdEtleVN0YXJ0UHJvcHMocHJldikge1xuICAgIGlmIChwcmV2Lmxlbmd0aCA9PT0gMClcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIGxldCBpID0gcHJldi5sZW5ndGg7XG4gICAgbG9vcDogd2hpbGUgKC0taSA+PSAwKSB7XG4gICAgICAgIHN3aXRjaCAocHJldltpXS50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdkb2Mtc3RhcnQnOlxuICAgICAgICAgICAgY2FzZSAnZXhwbGljaXQta2V5LWluZCc6XG4gICAgICAgICAgICBjYXNlICdtYXAtdmFsdWUtaW5kJzpcbiAgICAgICAgICAgIGNhc2UgJ3NlcS1pdGVtLWluZCc6XG4gICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICBicmVhayBsb29wO1xuICAgICAgICB9XG4gICAgfVxuICAgIHdoaWxlIChwcmV2WysraV0/LnR5cGUgPT09ICdzcGFjZScpIHtcbiAgICAgICAgLyogbG9vcCAqL1xuICAgIH1cbiAgICByZXR1cm4gcHJldi5zcGxpY2UoaSwgcHJldi5sZW5ndGgpO1xufVxuZnVuY3Rpb24gZml4Rmxvd1NlcUl0ZW1zKGZjKSB7XG4gICAgaWYgKGZjLnN0YXJ0LnR5cGUgPT09ICdmbG93LXNlcS1zdGFydCcpIHtcbiAgICAgICAgZm9yIChjb25zdCBpdCBvZiBmYy5pdGVtcykge1xuICAgICAgICAgICAgaWYgKGl0LnNlcCAmJlxuICAgICAgICAgICAgICAgICFpdC52YWx1ZSAmJlxuICAgICAgICAgICAgICAgICFpbmNsdWRlc1Rva2VuKGl0LnN0YXJ0LCAnZXhwbGljaXQta2V5LWluZCcpICYmXG4gICAgICAgICAgICAgICAgIWluY2x1ZGVzVG9rZW4oaXQuc2VwLCAnbWFwLXZhbHVlLWluZCcpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGl0LmtleSlcbiAgICAgICAgICAgICAgICAgICAgaXQudmFsdWUgPSBpdC5rZXk7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGl0LmtleTtcbiAgICAgICAgICAgICAgICBpZiAoaXNGbG93VG9rZW4oaXQudmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpdC52YWx1ZS5lbmQpXG4gICAgICAgICAgICAgICAgICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShpdC52YWx1ZS5lbmQsIGl0LnNlcCk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0LnZhbHVlLmVuZCA9IGl0LnNlcDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShpdC5zdGFydCwgaXQuc2VwKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgaXQuc2VwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuLyoqXG4gKiBBIFlBTUwgY29uY3JldGUgc3ludGF4IHRyZWUgKENTVCkgcGFyc2VyXG4gKlxuICogYGBgdHNcbiAqIGNvbnN0IHNyYzogc3RyaW5nID0gLi4uXG4gKiBmb3IgKGNvbnN0IHRva2VuIG9mIG5ldyBQYXJzZXIoKS5wYXJzZShzcmMpKSB7XG4gKiAgIC8vIHRva2VuOiBUb2tlblxuICogfVxuICogYGBgXG4gKlxuICogVG8gdXNlIHRoZSBwYXJzZXIgd2l0aCBhIHVzZXItcHJvdmlkZWQgbGV4ZXI6XG4gKlxuICogYGBgdHNcbiAqIGZ1bmN0aW9uKiBwYXJzZShzb3VyY2U6IHN0cmluZywgbGV4ZXI6IExleGVyKSB7XG4gKiAgIGNvbnN0IHBhcnNlciA9IG5ldyBQYXJzZXIoKVxuICogICBmb3IgKGNvbnN0IGxleGVtZSBvZiBsZXhlci5sZXgoc291cmNlKSlcbiAqICAgICB5aWVsZCogcGFyc2VyLm5leHQobGV4ZW1lKVxuICogICB5aWVsZCogcGFyc2VyLmVuZCgpXG4gKiB9XG4gKlxuICogY29uc3Qgc3JjOiBzdHJpbmcgPSAuLi5cbiAqIGNvbnN0IGxleGVyID0gbmV3IExleGVyKClcbiAqIGZvciAoY29uc3QgdG9rZW4gb2YgcGFyc2Uoc3JjLCBsZXhlcikpIHtcbiAqICAgLy8gdG9rZW46IFRva2VuXG4gKiB9XG4gKiBgYGBcbiAqL1xuY2xhc3MgUGFyc2VyIHtcbiAgICAvKipcbiAgICAgKiBAcGFyYW0gb25OZXdMaW5lIC0gSWYgZGVmaW5lZCwgY2FsbGVkIHNlcGFyYXRlbHkgd2l0aCB0aGUgc3RhcnQgcG9zaXRpb24gb2ZcbiAgICAgKiAgIGVhY2ggbmV3IGxpbmUgKGluIGBwYXJzZSgpYCwgaW5jbHVkaW5nIHRoZSBzdGFydCBvZiBpbnB1dCkuXG4gICAgICovXG4gICAgY29uc3RydWN0b3Iob25OZXdMaW5lKSB7XG4gICAgICAgIC8qKiBJZiB0cnVlLCBzcGFjZSBhbmQgc2VxdWVuY2UgaW5kaWNhdG9ycyBjb3VudCBhcyBpbmRlbnRhdGlvbiAqL1xuICAgICAgICB0aGlzLmF0TmV3TGluZSA9IHRydWU7XG4gICAgICAgIC8qKiBJZiB0cnVlLCBuZXh0IHRva2VuIGlzIGEgc2NhbGFyIHZhbHVlICovXG4gICAgICAgIHRoaXMuYXRTY2FsYXIgPSBmYWxzZTtcbiAgICAgICAgLyoqIEN1cnJlbnQgaW5kZW50YXRpb24gbGV2ZWwgKi9cbiAgICAgICAgdGhpcy5pbmRlbnQgPSAwO1xuICAgICAgICAvKiogQ3VycmVudCBvZmZzZXQgc2luY2UgdGhlIHN0YXJ0IG9mIHBhcnNpbmcgKi9cbiAgICAgICAgdGhpcy5vZmZzZXQgPSAwO1xuICAgICAgICAvKiogT24gdGhlIHNhbWUgbGluZSB3aXRoIGEgYmxvY2sgbWFwIGtleSAqL1xuICAgICAgICB0aGlzLm9uS2V5TGluZSA9IGZhbHNlO1xuICAgICAgICAvKiogVG9wIGluZGljYXRlcyB0aGUgbm9kZSB0aGF0J3MgY3VycmVudGx5IGJlaW5nIGJ1aWx0ICovXG4gICAgICAgIHRoaXMuc3RhY2sgPSBbXTtcbiAgICAgICAgLyoqIFRoZSBzb3VyY2Ugb2YgdGhlIGN1cnJlbnQgdG9rZW4sIHNldCBpbiBwYXJzZSgpICovXG4gICAgICAgIHRoaXMuc291cmNlID0gJyc7XG4gICAgICAgIC8qKiBUaGUgdHlwZSBvZiB0aGUgY3VycmVudCB0b2tlbiwgc2V0IGluIHBhcnNlKCkgKi9cbiAgICAgICAgdGhpcy50eXBlID0gJyc7XG4gICAgICAgIC8vIE11c3QgYmUgZGVmaW5lZCBhZnRlciBgbmV4dCgpYFxuICAgICAgICB0aGlzLmxleGVyID0gbmV3IGxleGVyLkxleGVyKCk7XG4gICAgICAgIHRoaXMub25OZXdMaW5lID0gb25OZXdMaW5lO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQYXJzZSBgc291cmNlYCBhcyBhIFlBTUwgc3RyZWFtLlxuICAgICAqIElmIGBpbmNvbXBsZXRlYCwgYSBwYXJ0IG9mIHRoZSBsYXN0IGxpbmUgbWF5IGJlIGxlZnQgYXMgYSBidWZmZXIgZm9yIHRoZSBuZXh0IGNhbGwuXG4gICAgICpcbiAgICAgKiBFcnJvcnMgYXJlIG5vdCB0aHJvd24sIGJ1dCB5aWVsZGVkIGFzIGB7IHR5cGU6ICdlcnJvcicsIG1lc3NhZ2UgfWAgdG9rZW5zLlxuICAgICAqXG4gICAgICogQHJldHVybnMgQSBnZW5lcmF0b3Igb2YgdG9rZW5zIHJlcHJlc2VudGluZyBlYWNoIGRpcmVjdGl2ZSwgZG9jdW1lbnQsIGFuZCBvdGhlciBzdHJ1Y3R1cmUuXG4gICAgICovXG4gICAgKnBhcnNlKHNvdXJjZSwgaW5jb21wbGV0ZSA9IGZhbHNlKSB7XG4gICAgICAgIGlmICh0aGlzLm9uTmV3TGluZSAmJiB0aGlzLm9mZnNldCA9PT0gMClcbiAgICAgICAgICAgIHRoaXMub25OZXdMaW5lKDApO1xuICAgICAgICBmb3IgKGNvbnN0IGxleGVtZSBvZiB0aGlzLmxleGVyLmxleChzb3VyY2UsIGluY29tcGxldGUpKVxuICAgICAgICAgICAgeWllbGQqIHRoaXMubmV4dChsZXhlbWUpO1xuICAgICAgICBpZiAoIWluY29tcGxldGUpXG4gICAgICAgICAgICB5aWVsZCogdGhpcy5lbmQoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQWR2YW5jZSB0aGUgcGFyc2VyIGJ5IHRoZSBgc291cmNlYCBvZiBvbmUgbGV4aWNhbCB0b2tlbi5cbiAgICAgKi9cbiAgICAqbmV4dChzb3VyY2UpIHtcbiAgICAgICAgdGhpcy5zb3VyY2UgPSBzb3VyY2U7XG4gICAgICAgIGlmIChub2RlX3Byb2Nlc3MuZW52LkxPR19UT0tFTlMpXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnfCcsIGNzdC5wcmV0dHlUb2tlbihzb3VyY2UpKTtcbiAgICAgICAgaWYgKHRoaXMuYXRTY2FsYXIpIHtcbiAgICAgICAgICAgIHRoaXMuYXRTY2FsYXIgPSBmYWxzZTtcbiAgICAgICAgICAgIHlpZWxkKiB0aGlzLnN0ZXAoKTtcbiAgICAgICAgICAgIHRoaXMub2Zmc2V0ICs9IHNvdXJjZS5sZW5ndGg7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdHlwZSA9IGNzdC50b2tlblR5cGUoc291cmNlKTtcbiAgICAgICAgaWYgKCF0eXBlKSB7XG4gICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gYE5vdCBhIFlBTUwgdG9rZW46ICR7c291cmNlfWA7XG4gICAgICAgICAgICB5aWVsZCogdGhpcy5wb3AoeyB0eXBlOiAnZXJyb3InLCBvZmZzZXQ6IHRoaXMub2Zmc2V0LCBtZXNzYWdlLCBzb3VyY2UgfSk7XG4gICAgICAgICAgICB0aGlzLm9mZnNldCArPSBzb3VyY2UubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHR5cGUgPT09ICdzY2FsYXInKSB7XG4gICAgICAgICAgICB0aGlzLmF0TmV3TGluZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5hdFNjYWxhciA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLnR5cGUgPSAnc2NhbGFyJztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgICAgICAgICB5aWVsZCogdGhpcy5zdGVwKCk7XG4gICAgICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hdE5ld0xpbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmluZGVudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm9uTmV3TGluZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25OZXdMaW5lKHRoaXMub2Zmc2V0ICsgc291cmNlLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuYXROZXdMaW5lICYmIHNvdXJjZVswXSA9PT0gJyAnKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmRlbnQgKz0gc291cmNlLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnZXhwbGljaXQta2V5LWluZCc6XG4gICAgICAgICAgICAgICAgY2FzZSAnbWFwLXZhbHVlLWluZCc6XG4gICAgICAgICAgICAgICAgY2FzZSAnc2VxLWl0ZW0taW5kJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuYXROZXdMaW5lKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmRlbnQgKz0gc291cmNlLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnZG9jLW1vZGUnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ2Zsb3ctZXJyb3ItZW5kJzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXROZXdMaW5lID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm9mZnNldCArPSBzb3VyY2UubGVuZ3RoO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKiBDYWxsIGF0IGVuZCBvZiBpbnB1dCB0byBwdXNoIG91dCBhbnkgcmVtYWluaW5nIGNvbnN0cnVjdGlvbnMgKi9cbiAgICAqZW5kKCkge1xuICAgICAgICB3aGlsZSAodGhpcy5zdGFjay5sZW5ndGggPiAwKVxuICAgICAgICAgICAgeWllbGQqIHRoaXMucG9wKCk7XG4gICAgfVxuICAgIGdldCBzb3VyY2VUb2tlbigpIHtcbiAgICAgICAgY29uc3Qgc3QgPSB7XG4gICAgICAgICAgICB0eXBlOiB0aGlzLnR5cGUsXG4gICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgaW5kZW50OiB0aGlzLmluZGVudCxcbiAgICAgICAgICAgIHNvdXJjZTogdGhpcy5zb3VyY2VcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHN0O1xuICAgIH1cbiAgICAqc3RlcCgpIHtcbiAgICAgICAgY29uc3QgdG9wID0gdGhpcy5wZWVrKDEpO1xuICAgICAgICBpZiAodGhpcy50eXBlID09PSAnZG9jLWVuZCcgJiYgdG9wPy50eXBlICE9PSAnZG9jLWVuZCcpIHtcbiAgICAgICAgICAgIHdoaWxlICh0aGlzLnN0YWNrLmxlbmd0aCA+IDApXG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucG9wKCk7XG4gICAgICAgICAgICB0aGlzLnN0YWNrLnB1c2goe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdkb2MtZW5kJyxcbiAgICAgICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgICAgIHNvdXJjZTogdGhpcy5zb3VyY2VcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdG9wKVxuICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnN0cmVhbSgpO1xuICAgICAgICBzd2l0Y2ggKHRvcC50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdkb2N1bWVudCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLmRvY3VtZW50KHRvcCk7XG4gICAgICAgICAgICBjYXNlICdhbGlhcyc6XG4gICAgICAgICAgICBjYXNlICdzY2FsYXInOlxuICAgICAgICAgICAgY2FzZSAnc2luZ2xlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICAgICAgY2FzZSAnZG91YmxlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5zY2FsYXIodG9wKTtcbiAgICAgICAgICAgIGNhc2UgJ2Jsb2NrLXNjYWxhcic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLmJsb2NrU2NhbGFyKHRvcCk7XG4gICAgICAgICAgICBjYXNlICdibG9jay1tYXAnOlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5ibG9ja01hcCh0b3ApO1xuICAgICAgICAgICAgY2FzZSAnYmxvY2stc2VxJzpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMuYmxvY2tTZXF1ZW5jZSh0b3ApO1xuICAgICAgICAgICAgY2FzZSAnZmxvdy1jb2xsZWN0aW9uJzpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMuZmxvd0NvbGxlY3Rpb24odG9wKTtcbiAgICAgICAgICAgIGNhc2UgJ2RvYy1lbmQnOlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5kb2N1bWVudEVuZCh0b3ApO1xuICAgICAgICB9XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0IHNob3VsZCBub3QgaGFwcGVuICovXG4gICAgICAgIHlpZWxkKiB0aGlzLnBvcCgpO1xuICAgIH1cbiAgICBwZWVrKG4pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhY2tbdGhpcy5zdGFjay5sZW5ndGggLSBuXTtcbiAgICB9XG4gICAgKnBvcChlcnJvcikge1xuICAgICAgICBjb25zdCB0b2tlbiA9IGVycm9yID8/IHRoaXMuc3RhY2sucG9wKCk7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiBzaG91bGQgbm90IGhhcHBlbiAqL1xuICAgICAgICBpZiAoIXRva2VuKSB7XG4gICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gJ1RyaWVkIHRvIHBvcCBhbiBlbXB0eSBzdGFjayc7XG4gICAgICAgICAgICB5aWVsZCB7IHR5cGU6ICdlcnJvcicsIG9mZnNldDogdGhpcy5vZmZzZXQsIHNvdXJjZTogJycsIG1lc3NhZ2UgfTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzLnN0YWNrLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgeWllbGQgdG9rZW47XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCB0b3AgPSB0aGlzLnBlZWsoMSk7XG4gICAgICAgICAgICBpZiAodG9rZW4udHlwZSA9PT0gJ2Jsb2NrLXNjYWxhcicpIHtcbiAgICAgICAgICAgICAgICAvLyBCbG9jayBzY2FsYXJzIHVzZSB0aGVpciBwYXJlbnQgcmF0aGVyIHRoYW4gaGVhZGVyIGluZGVudFxuICAgICAgICAgICAgICAgIHRva2VuLmluZGVudCA9ICdpbmRlbnQnIGluIHRvcCA/IHRvcC5pbmRlbnQgOiAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodG9rZW4udHlwZSA9PT0gJ2Zsb3ctY29sbGVjdGlvbicgJiYgdG9wLnR5cGUgPT09ICdkb2N1bWVudCcpIHtcbiAgICAgICAgICAgICAgICAvLyBJZ25vcmUgYWxsIGluZGVudCBmb3IgdG9wLWxldmVsIGZsb3cgY29sbGVjdGlvbnNcbiAgICAgICAgICAgICAgICB0b2tlbi5pbmRlbnQgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRva2VuLnR5cGUgPT09ICdmbG93LWNvbGxlY3Rpb24nKVxuICAgICAgICAgICAgICAgIGZpeEZsb3dTZXFJdGVtcyh0b2tlbik7XG4gICAgICAgICAgICBzd2l0Y2ggKHRvcC50eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnZG9jdW1lbnQnOlxuICAgICAgICAgICAgICAgICAgICB0b3AudmFsdWUgPSB0b2tlbjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnYmxvY2stc2NhbGFyJzpcbiAgICAgICAgICAgICAgICAgICAgdG9wLnByb3BzLnB1c2godG9rZW4pOyAvLyBlcnJvclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdibG9jay1tYXAnOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGl0ID0gdG9wLml0ZW1zW3RvcC5pdGVtcy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3AuaXRlbXMucHVzaCh7IHN0YXJ0OiBbXSwga2V5OiB0b2tlbiwgc2VwOiBbXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25LZXlMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpdC5zZXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0LnZhbHVlID0gdG9rZW47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKGl0LCB7IGtleTogdG9rZW4sIHNlcDogW10gfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uS2V5TGluZSA9ICFpdC5leHBsaWNpdEtleTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FzZSAnYmxvY2stc2VxJzoge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpdCA9IHRvcC5pdGVtc1t0b3AuaXRlbXMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChpdC52YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcC5pdGVtcy5wdXNoKHsgc3RhcnQ6IFtdLCB2YWx1ZTogdG9rZW4gfSk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0LnZhbHVlID0gdG9rZW47XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXNlICdmbG93LWNvbGxlY3Rpb24nOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGl0ID0gdG9wLml0ZW1zW3RvcC5pdGVtcy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpdCB8fCBpdC52YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcC5pdGVtcy5wdXNoKHsgc3RhcnQ6IFtdLCBrZXk6IHRva2VuLCBzZXA6IFtdIH0pO1xuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpdC5zZXApXG4gICAgICAgICAgICAgICAgICAgICAgICBpdC52YWx1ZSA9IHRva2VuO1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKGl0LCB7IGtleTogdG9rZW4sIHNlcDogW10gfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgc2hvdWxkIG5vdCBoYXBwZW4gKi9cbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucG9wKHRva2VuKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgodG9wLnR5cGUgPT09ICdkb2N1bWVudCcgfHxcbiAgICAgICAgICAgICAgICB0b3AudHlwZSA9PT0gJ2Jsb2NrLW1hcCcgfHxcbiAgICAgICAgICAgICAgICB0b3AudHlwZSA9PT0gJ2Jsb2NrLXNlcScpICYmXG4gICAgICAgICAgICAgICAgKHRva2VuLnR5cGUgPT09ICdibG9jay1tYXAnIHx8IHRva2VuLnR5cGUgPT09ICdibG9jay1zZXEnKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxhc3QgPSB0b2tlbi5pdGVtc1t0b2tlbi5pdGVtcy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICBpZiAobGFzdCAmJlxuICAgICAgICAgICAgICAgICAgICAhbGFzdC5zZXAgJiZcbiAgICAgICAgICAgICAgICAgICAgIWxhc3QudmFsdWUgJiZcbiAgICAgICAgICAgICAgICAgICAgbGFzdC5zdGFydC5sZW5ndGggPiAwICYmXG4gICAgICAgICAgICAgICAgICAgIGZpbmROb25FbXB0eUluZGV4KGxhc3Quc3RhcnQpID09PSAtMSAmJlxuICAgICAgICAgICAgICAgICAgICAodG9rZW4uaW5kZW50ID09PSAwIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0LnN0YXJ0LmV2ZXJ5KHN0ID0+IHN0LnR5cGUgIT09ICdjb21tZW50JyB8fCBzdC5pbmRlbnQgPCB0b2tlbi5pbmRlbnQpKSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodG9wLnR5cGUgPT09ICdkb2N1bWVudCcpXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3AuZW5kID0gbGFzdC5zdGFydDtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgdG9wLml0ZW1zLnB1c2goeyBzdGFydDogbGFzdC5zdGFydCB9KTtcbiAgICAgICAgICAgICAgICAgICAgdG9rZW4uaXRlbXMuc3BsaWNlKC0xLCAxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgKnN0cmVhbSgpIHtcbiAgICAgICAgc3dpdGNoICh0aGlzLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2RpcmVjdGl2ZS1saW5lJzpcbiAgICAgICAgICAgICAgICB5aWVsZCB7IHR5cGU6ICdkaXJlY3RpdmUnLCBvZmZzZXQ6IHRoaXMub2Zmc2V0LCBzb3VyY2U6IHRoaXMuc291cmNlIH07XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgY2FzZSAnYnl0ZS1vcmRlci1tYXJrJzpcbiAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcbiAgICAgICAgICAgIGNhc2UgJ2NvbW1lbnQnOlxuICAgICAgICAgICAgY2FzZSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgICAgeWllbGQgdGhpcy5zb3VyY2VUb2tlbjtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBjYXNlICdkb2MtbW9kZSc6XG4gICAgICAgICAgICBjYXNlICdkb2Mtc3RhcnQnOiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZG9jID0ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnZG9jdW1lbnQnLFxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICBzdGFydDogW11cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnR5cGUgPT09ICdkb2Mtc3RhcnQnKVxuICAgICAgICAgICAgICAgICAgICBkb2Muc3RhcnQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YWNrLnB1c2goZG9jKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgeWllbGQge1xuICAgICAgICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICBtZXNzYWdlOiBgVW5leHBlY3RlZCAke3RoaXMudHlwZX0gdG9rZW4gaW4gWUFNTCBzdHJlYW1gLFxuICAgICAgICAgICAgc291cmNlOiB0aGlzLnNvdXJjZVxuICAgICAgICB9O1xuICAgIH1cbiAgICAqZG9jdW1lbnQoZG9jKSB7XG4gICAgICAgIGlmIChkb2MudmFsdWUpXG4gICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMubGluZUVuZChkb2MpO1xuICAgICAgICBzd2l0Y2ggKHRoaXMudHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnZG9jLXN0YXJ0Jzoge1xuICAgICAgICAgICAgICAgIGlmIChmaW5kTm9uRW1wdHlJbmRleChkb2Muc3RhcnQpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgeWllbGQqIHRoaXMuc3RlcCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGRvYy5zdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgJ2FuY2hvcic6XG4gICAgICAgICAgICBjYXNlICd0YWcnOlxuICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICBkb2Muc3RhcnQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYnYgPSB0aGlzLnN0YXJ0QmxvY2tWYWx1ZShkb2MpO1xuICAgICAgICBpZiAoYnYpXG4gICAgICAgICAgICB0aGlzLnN0YWNrLnB1c2goYnYpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHlpZWxkIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogYFVuZXhwZWN0ZWQgJHt0aGlzLnR5cGV9IHRva2VuIGluIFlBTUwgZG9jdW1lbnRgLFxuICAgICAgICAgICAgICAgIHNvdXJjZTogdGhpcy5zb3VyY2VcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG4gICAgKnNjYWxhcihzY2FsYXIpIHtcbiAgICAgICAgaWYgKHRoaXMudHlwZSA9PT0gJ21hcC12YWx1ZS1pbmQnKSB7XG4gICAgICAgICAgICBjb25zdCBwcmV2ID0gZ2V0UHJldlByb3BzKHRoaXMucGVlaygyKSk7XG4gICAgICAgICAgICBjb25zdCBzdGFydCA9IGdldEZpcnN0S2V5U3RhcnRQcm9wcyhwcmV2KTtcbiAgICAgICAgICAgIGxldCBzZXA7XG4gICAgICAgICAgICBpZiAoc2NhbGFyLmVuZCkge1xuICAgICAgICAgICAgICAgIHNlcCA9IHNjYWxhci5lbmQ7XG4gICAgICAgICAgICAgICAgc2VwLnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHNjYWxhci5lbmQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgc2VwID0gW3RoaXMuc291cmNlVG9rZW5dO1xuICAgICAgICAgICAgY29uc3QgbWFwID0ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdibG9jay1tYXAnLFxuICAgICAgICAgICAgICAgIG9mZnNldDogc2NhbGFyLm9mZnNldCxcbiAgICAgICAgICAgICAgICBpbmRlbnQ6IHNjYWxhci5pbmRlbnQsXG4gICAgICAgICAgICAgICAgaXRlbXM6IFt7IHN0YXJ0LCBrZXk6IHNjYWxhciwgc2VwIH1dXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5vbktleUxpbmUgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5zdGFja1t0aGlzLnN0YWNrLmxlbmd0aCAtIDFdID0gbWFwO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHlpZWxkKiB0aGlzLmxpbmVFbmQoc2NhbGFyKTtcbiAgICB9XG4gICAgKmJsb2NrU2NhbGFyKHNjYWxhcikge1xuICAgICAgICBzd2l0Y2ggKHRoaXMudHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICBzY2FsYXIucHJvcHMucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBjYXNlICdzY2FsYXInOlxuICAgICAgICAgICAgICAgIHNjYWxhci5zb3VyY2UgPSB0aGlzLnNvdXJjZTtcbiAgICAgICAgICAgICAgICAvLyBibG9jay1zY2FsYXIgc291cmNlIGluY2x1ZGVzIHRyYWlsaW5nIG5ld2xpbmVcbiAgICAgICAgICAgICAgICB0aGlzLmF0TmV3TGluZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5pbmRlbnQgPSAwO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9uTmV3TGluZSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbmwgPSB0aGlzLnNvdXJjZS5pbmRleE9mKCdcXG4nKSArIDE7XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChubCAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbk5ld0xpbmUodGhpcy5vZmZzZXQgKyBubCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBubCA9IHRoaXMuc291cmNlLmluZGV4T2YoJ1xcbicsIG5sKSArIDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucG9wKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCBzaG91bGQgbm90IGhhcHBlbiAqL1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wb3AoKTtcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5zdGVwKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgKmJsb2NrTWFwKG1hcCkge1xuICAgICAgICBjb25zdCBpdCA9IG1hcC5pdGVtc1ttYXAuaXRlbXMubGVuZ3RoIC0gMV07XG4gICAgICAgIC8vIGl0LnNlcCBpcyB0cnVlLWlzaCBpZiBwYWlyIGFscmVhZHkgaGFzIGtleSBvciA6IHNlcGFyYXRvclxuICAgICAgICBzd2l0Y2ggKHRoaXMudHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgICAgdGhpcy5vbktleUxpbmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAoaXQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZW5kID0gJ2VuZCcgaW4gaXQudmFsdWUgPyBpdC52YWx1ZS5lbmQgOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGxhc3QgPSBBcnJheS5pc0FycmF5KGVuZCkgPyBlbmRbZW5kLmxlbmd0aCAtIDFdIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICBpZiAobGFzdD8udHlwZSA9PT0gJ2NvbW1lbnQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kPy5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXAuaXRlbXMucHVzaCh7IHN0YXJ0OiBbdGhpcy5zb3VyY2VUb2tlbl0gfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGl0LnNlcCkge1xuICAgICAgICAgICAgICAgICAgICBpdC5zZXAucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGl0LnN0YXJ0LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcbiAgICAgICAgICAgIGNhc2UgJ2NvbW1lbnQnOlxuICAgICAgICAgICAgICAgIGlmIChpdC52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBtYXAuaXRlbXMucHVzaCh7IHN0YXJ0OiBbdGhpcy5zb3VyY2VUb2tlbl0gfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGl0LnNlcCkge1xuICAgICAgICAgICAgICAgICAgICBpdC5zZXAucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmF0SW5kZW50ZWRDb21tZW50KGl0LnN0YXJ0LCBtYXAuaW5kZW50KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJldiA9IG1hcC5pdGVtc1ttYXAuaXRlbXMubGVuZ3RoIC0gMl07XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlbmQgPSBwcmV2Py52YWx1ZT8uZW5kO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZW5kKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KGVuZCwgaXQuc3RhcnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuZC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5pdGVtcy5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaXQuc3RhcnQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmluZGVudCA+PSBtYXAuaW5kZW50KSB7XG4gICAgICAgICAgICBjb25zdCBhdE1hcEluZGVudCA9ICF0aGlzLm9uS2V5TGluZSAmJiB0aGlzLmluZGVudCA9PT0gbWFwLmluZGVudDtcbiAgICAgICAgICAgIGNvbnN0IGF0TmV4dEl0ZW0gPSBhdE1hcEluZGVudCAmJlxuICAgICAgICAgICAgICAgIChpdC5zZXAgfHwgaXQuZXhwbGljaXRLZXkpICYmXG4gICAgICAgICAgICAgICAgdGhpcy50eXBlICE9PSAnc2VxLWl0ZW0taW5kJztcbiAgICAgICAgICAgIC8vIEZvciBlbXB0eSBub2RlcywgYXNzaWduIG5ld2xpbmUtc2VwYXJhdGVkIG5vdCBpbmRlbnRlZCBlbXB0eSB0b2tlbnMgdG8gZm9sbG93aW5nIG5vZGVcbiAgICAgICAgICAgIGxldCBzdGFydCA9IFtdO1xuICAgICAgICAgICAgaWYgKGF0TmV4dEl0ZW0gJiYgaXQuc2VwICYmICFpdC52YWx1ZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5sID0gW107XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdC5zZXAubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3QgPSBpdC5zZXBbaV07XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoc3QudHlwZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmwucHVzaChpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2NvbW1lbnQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdC5pbmRlbnQgPiBtYXAuaW5kZW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBubC5sZW5ndGggPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBubC5sZW5ndGggPSAwO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChubC5sZW5ndGggPj0gMilcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQgPSBpdC5zZXAuc3BsaWNlKG5sWzFdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN3aXRjaCAodGhpcy50eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnYW5jaG9yJzpcbiAgICAgICAgICAgICAgICBjYXNlICd0YWcnOlxuICAgICAgICAgICAgICAgICAgICBpZiAoYXROZXh0SXRlbSB8fCBpdC52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5pdGVtcy5wdXNoKHsgc3RhcnQgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uS2V5TGluZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaXQuc2VwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdC5zZXAucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0LnN0YXJ0LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2V4cGxpY2l0LWtleS1pbmQnOlxuICAgICAgICAgICAgICAgICAgICBpZiAoIWl0LnNlcCAmJiAhaXQuZXhwbGljaXRLZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0LnN0YXJ0LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdC5leHBsaWNpdEtleSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoYXROZXh0SXRlbSB8fCBpdC52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5pdGVtcy5wdXNoKHsgc3RhcnQsIGV4cGxpY2l0S2V5OiB0cnVlIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGFjay5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYmxvY2stbWFwJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZGVudDogdGhpcy5pbmRlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFt7IHN0YXJ0OiBbdGhpcy5zb3VyY2VUb2tlbl0sIGV4cGxpY2l0S2V5OiB0cnVlIH1dXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uS2V5TGluZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICBjYXNlICdtYXAtdmFsdWUtaW5kJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0LmV4cGxpY2l0S2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWl0LnNlcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmNsdWRlc1Rva2VuKGl0LnN0YXJ0LCAnbmV3bGluZScpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oaXQsIHsga2V5OiBudWxsLCBzZXA6IFt0aGlzLnNvdXJjZVRva2VuXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gZ2V0Rmlyc3RLZXlTdGFydFByb3BzKGl0LnN0YXJ0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGFjay5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdibG9jay1tYXAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZGVudDogdGhpcy5pbmRlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogW3sgc3RhcnQsIGtleTogbnVsbCwgc2VwOiBbdGhpcy5zb3VyY2VUb2tlbl0gfV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaXQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXAuaXRlbXMucHVzaCh7IHN0YXJ0OiBbXSwga2V5OiBudWxsLCBzZXA6IFt0aGlzLnNvdXJjZVRva2VuXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGluY2x1ZGVzVG9rZW4oaXQuc2VwLCAnbWFwLXZhbHVlLWluZCcpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGFjay5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Jsb2NrLW1hcCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZGVudDogdGhpcy5pbmRlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbeyBzdGFydCwga2V5OiBudWxsLCBzZXA6IFt0aGlzLnNvdXJjZVRva2VuXSB9XVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaXNGbG93VG9rZW4oaXQua2V5KSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICFpbmNsdWRlc1Rva2VuKGl0LnNlcCwgJ25ld2xpbmUnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gZ2V0Rmlyc3RLZXlTdGFydFByb3BzKGl0LnN0YXJ0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBrZXkgPSBpdC5rZXk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VwID0gaXQuc2VwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlcC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHlwZSBndWFyZCBpcyB3cm9uZyBoZXJlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGl0LmtleTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHR5cGUgZ3VhcmQgaXMgd3JvbmcgaGVyZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBpdC5zZXA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGFjay5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Jsb2NrLW1hcCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZGVudDogdGhpcy5pbmRlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbeyBzdGFydCwga2V5LCBzZXAgfV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHN0YXJ0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOb3QgYWN0dWFsbHkgYXQgbmV4dCBpdGVtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXQuc2VwID0gaXQuc2VwLmNvbmNhdChzdGFydCwgdGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdC5zZXAucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXQuc2VwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihpdCwgeyBrZXk6IG51bGwsIHNlcDogW3RoaXMuc291cmNlVG9rZW5dIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaXQudmFsdWUgfHwgYXROZXh0SXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5pdGVtcy5wdXNoKHsgc3RhcnQsIGtleTogbnVsbCwgc2VwOiBbdGhpcy5zb3VyY2VUb2tlbl0gfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpbmNsdWRlc1Rva2VuKGl0LnNlcCwgJ21hcC12YWx1ZS1pbmQnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhY2sucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdibG9jay1tYXAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRlbnQ6IHRoaXMuaW5kZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogW3sgc3RhcnQ6IFtdLCBrZXk6IG51bGwsIHNlcDogW3RoaXMuc291cmNlVG9rZW5dIH1dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdC5zZXAucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uS2V5TGluZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICBjYXNlICdhbGlhcyc6XG4gICAgICAgICAgICAgICAgY2FzZSAnc2NhbGFyJzpcbiAgICAgICAgICAgICAgICBjYXNlICdzaW5nbGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgICAgICAgICAgY2FzZSAnZG91YmxlLXF1b3RlZC1zY2FsYXInOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZzID0gdGhpcy5mbG93U2NhbGFyKHRoaXMudHlwZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhdE5leHRJdGVtIHx8IGl0LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXAuaXRlbXMucHVzaCh7IHN0YXJ0LCBrZXk6IGZzLCBzZXA6IFtdIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbktleUxpbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGl0LnNlcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGFjay5wdXNoKGZzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oaXQsIHsga2V5OiBmcywgc2VwOiBbXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25LZXlMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYnYgPSB0aGlzLnN0YXJ0QmxvY2tWYWx1ZShtYXApO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYnYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChidi50eXBlID09PSAnYmxvY2stc2VxJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXQuZXhwbGljaXRLZXkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXQuc2VwICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICFpbmNsdWRlc1Rva2VuKGl0LnNlcCwgJ25ld2xpbmUnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wb3Aoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnVW5leHBlY3RlZCBibG9jay1zZXEtaW5kIG9uIHNhbWUgbGluZSB3aXRoIGtleScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IHRoaXMuc291cmNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoYXRNYXBJbmRlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXAuaXRlbXMucHVzaCh7IHN0YXJ0IH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGFjay5wdXNoKGJ2KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB5aWVsZCogdGhpcy5wb3AoKTtcbiAgICAgICAgeWllbGQqIHRoaXMuc3RlcCgpO1xuICAgIH1cbiAgICAqYmxvY2tTZXF1ZW5jZShzZXEpIHtcbiAgICAgICAgY29uc3QgaXQgPSBzZXEuaXRlbXNbc2VxLml0ZW1zLmxlbmd0aCAtIDFdO1xuICAgICAgICBzd2l0Y2ggKHRoaXMudHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgICAgaWYgKGl0LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVuZCA9ICdlbmQnIGluIGl0LnZhbHVlID8gaXQudmFsdWUuZW5kIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsYXN0ID0gQXJyYXkuaXNBcnJheShlbmQpID8gZW5kW2VuZC5sZW5ndGggLSAxXSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxhc3Q/LnR5cGUgPT09ICdjb21tZW50JylcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZD8ucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgc2VxLml0ZW1zLnB1c2goeyBzdGFydDogW3RoaXMuc291cmNlVG9rZW5dIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGl0LnN0YXJ0LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgICAgICAgICAgaWYgKGl0LnZhbHVlKVxuICAgICAgICAgICAgICAgICAgICBzZXEuaXRlbXMucHVzaCh7IHN0YXJ0OiBbdGhpcy5zb3VyY2VUb2tlbl0gfSk7XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmF0SW5kZW50ZWRDb21tZW50KGl0LnN0YXJ0LCBzZXEuaW5kZW50KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJldiA9IHNlcS5pdGVtc1tzZXEuaXRlbXMubGVuZ3RoIC0gMl07XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlbmQgPSBwcmV2Py52YWx1ZT8uZW5kO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZW5kKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KGVuZCwgaXQuc3RhcnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuZC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlcS5pdGVtcy5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaXQuc3RhcnQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgY2FzZSAnYW5jaG9yJzpcbiAgICAgICAgICAgIGNhc2UgJ3RhZyc6XG4gICAgICAgICAgICAgICAgaWYgKGl0LnZhbHVlIHx8IHRoaXMuaW5kZW50IDw9IHNlcS5pbmRlbnQpXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGl0LnN0YXJ0LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgY2FzZSAnc2VxLWl0ZW0taW5kJzpcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pbmRlbnQgIT09IHNlcS5pbmRlbnQpXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGlmIChpdC52YWx1ZSB8fCBpbmNsdWRlc1Rva2VuKGl0LnN0YXJ0LCAnc2VxLWl0ZW0taW5kJykpXG4gICAgICAgICAgICAgICAgICAgIHNlcS5pdGVtcy5wdXNoKHsgc3RhcnQ6IFt0aGlzLnNvdXJjZVRva2VuXSB9KTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGl0LnN0YXJ0LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmluZGVudCA+IHNlcS5pbmRlbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IGJ2ID0gdGhpcy5zdGFydEJsb2NrVmFsdWUoc2VxKTtcbiAgICAgICAgICAgIGlmIChidikge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhY2sucHVzaChidik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHlpZWxkKiB0aGlzLnBvcCgpO1xuICAgICAgICB5aWVsZCogdGhpcy5zdGVwKCk7XG4gICAgfVxuICAgICpmbG93Q29sbGVjdGlvbihmYykge1xuICAgICAgICBjb25zdCBpdCA9IGZjLml0ZW1zW2ZjLml0ZW1zLmxlbmd0aCAtIDFdO1xuICAgICAgICBpZiAodGhpcy50eXBlID09PSAnZmxvdy1lcnJvci1lbmQnKSB7XG4gICAgICAgICAgICBsZXQgdG9wO1xuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnBvcCgpO1xuICAgICAgICAgICAgICAgIHRvcCA9IHRoaXMucGVlaygxKTtcbiAgICAgICAgICAgIH0gd2hpbGUgKHRvcD8udHlwZSA9PT0gJ2Zsb3ctY29sbGVjdGlvbicpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGZjLmVuZC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHN3aXRjaCAodGhpcy50eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnY29tbWEnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ2V4cGxpY2l0LWtleS1pbmQnOlxuICAgICAgICAgICAgICAgICAgICBpZiAoIWl0IHx8IGl0LnNlcClcbiAgICAgICAgICAgICAgICAgICAgICAgIGZjLml0ZW1zLnB1c2goeyBzdGFydDogW3RoaXMuc291cmNlVG9rZW5dIH0pO1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBpdC5zdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgY2FzZSAnbWFwLXZhbHVlLWluZCc6XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXQgfHwgaXQudmFsdWUpXG4gICAgICAgICAgICAgICAgICAgICAgICBmYy5pdGVtcy5wdXNoKHsgc3RhcnQ6IFtdLCBrZXk6IG51bGwsIHNlcDogW3RoaXMuc291cmNlVG9rZW5dIH0pO1xuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpdC5zZXApXG4gICAgICAgICAgICAgICAgICAgICAgICBpdC5zZXAucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihpdCwgeyBrZXk6IG51bGwsIHNlcDogW3RoaXMuc291cmNlVG9rZW5dIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ2NvbW1lbnQnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ2FuY2hvcic6XG4gICAgICAgICAgICAgICAgY2FzZSAndGFnJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpdCB8fCBpdC52YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGZjLml0ZW1zLnB1c2goeyBzdGFydDogW3RoaXMuc291cmNlVG9rZW5dIH0pO1xuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpdC5zZXApXG4gICAgICAgICAgICAgICAgICAgICAgICBpdC5zZXAucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgaXQuc3RhcnQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2FsaWFzJzpcbiAgICAgICAgICAgICAgICBjYXNlICdzY2FsYXInOlxuICAgICAgICAgICAgICAgIGNhc2UgJ3NpbmdsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgICAgICAgICBjYXNlICdkb3VibGUtcXVvdGVkLXNjYWxhcic6IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZnMgPSB0aGlzLmZsb3dTY2FsYXIodGhpcy50eXBlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpdCB8fCBpdC52YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGZjLml0ZW1zLnB1c2goeyBzdGFydDogW10sIGtleTogZnMsIHNlcDogW10gfSk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGl0LnNlcClcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhY2sucHVzaChmcyk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oaXQsIHsga2V5OiBmcywgc2VwOiBbXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXNlICdmbG93LW1hcC1lbmQnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ2Zsb3ctc2VxLWVuZCc6XG4gICAgICAgICAgICAgICAgICAgIGZjLmVuZC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBidiA9IHRoaXMuc3RhcnRCbG9ja1ZhbHVlKGZjKTtcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlIHNob3VsZCBub3QgaGFwcGVuICovXG4gICAgICAgICAgICBpZiAoYnYpXG4gICAgICAgICAgICAgICAgdGhpcy5zdGFjay5wdXNoKGJ2KTtcbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnBvcCgpO1xuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnN0ZXAoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHBhcmVudCA9IHRoaXMucGVlaygyKTtcbiAgICAgICAgICAgIGlmIChwYXJlbnQudHlwZSA9PT0gJ2Jsb2NrLW1hcCcgJiZcbiAgICAgICAgICAgICAgICAoKHRoaXMudHlwZSA9PT0gJ21hcC12YWx1ZS1pbmQnICYmIHBhcmVudC5pbmRlbnQgPT09IGZjLmluZGVudCkgfHxcbiAgICAgICAgICAgICAgICAgICAgKHRoaXMudHlwZSA9PT0gJ25ld2xpbmUnICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAhcGFyZW50Lml0ZW1zW3BhcmVudC5pdGVtcy5sZW5ndGggLSAxXS5zZXApKSkge1xuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnBvcCgpO1xuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnN0ZXAoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMudHlwZSA9PT0gJ21hcC12YWx1ZS1pbmQnICYmXG4gICAgICAgICAgICAgICAgcGFyZW50LnR5cGUgIT09ICdmbG93LWNvbGxlY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJldiA9IGdldFByZXZQcm9wcyhwYXJlbnQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gZ2V0Rmlyc3RLZXlTdGFydFByb3BzKHByZXYpO1xuICAgICAgICAgICAgICAgIGZpeEZsb3dTZXFJdGVtcyhmYyk7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2VwID0gZmMuZW5kLnNwbGljZSgxLCBmYy5lbmQubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICBzZXAucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXAgPSB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdibG9jay1tYXAnLFxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IGZjLm9mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgaW5kZW50OiBmYy5pbmRlbnQsXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbeyBzdGFydCwga2V5OiBmYywgc2VwIH1dXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0aGlzLm9uS2V5TGluZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGFja1t0aGlzLnN0YWNrLmxlbmd0aCAtIDFdID0gbWFwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMubGluZUVuZChmYyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZmxvd1NjYWxhcih0eXBlKSB7XG4gICAgICAgIGlmICh0aGlzLm9uTmV3TGluZSkge1xuICAgICAgICAgICAgbGV0IG5sID0gdGhpcy5zb3VyY2UuaW5kZXhPZignXFxuJykgKyAxO1xuICAgICAgICAgICAgd2hpbGUgKG5sICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vbk5ld0xpbmUodGhpcy5vZmZzZXQgKyBubCk7XG4gICAgICAgICAgICAgICAgbmwgPSB0aGlzLnNvdXJjZS5pbmRleE9mKCdcXG4nLCBubCkgKyAxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0eXBlLFxuICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgIGluZGVudDogdGhpcy5pbmRlbnQsXG4gICAgICAgICAgICBzb3VyY2U6IHRoaXMuc291cmNlXG4gICAgICAgIH07XG4gICAgfVxuICAgIHN0YXJ0QmxvY2tWYWx1ZShwYXJlbnQpIHtcbiAgICAgICAgc3dpdGNoICh0aGlzLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2FsaWFzJzpcbiAgICAgICAgICAgIGNhc2UgJ3NjYWxhcic6XG4gICAgICAgICAgICBjYXNlICdzaW5nbGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgICAgICBjYXNlICdkb3VibGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmxvd1NjYWxhcih0aGlzLnR5cGUpO1xuICAgICAgICAgICAgY2FzZSAnYmxvY2stc2NhbGFyLWhlYWRlcic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Jsb2NrLXNjYWxhcicsXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgIGluZGVudDogdGhpcy5pbmRlbnQsXG4gICAgICAgICAgICAgICAgICAgIHByb3BzOiBbdGhpcy5zb3VyY2VUb2tlbl0sXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogJydcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgY2FzZSAnZmxvdy1tYXAtc3RhcnQnOlxuICAgICAgICAgICAgY2FzZSAnZmxvdy1zZXEtc3RhcnQnOlxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdmbG93LWNvbGxlY3Rpb24nLFxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICBpbmRlbnQ6IHRoaXMuaW5kZW50LFxuICAgICAgICAgICAgICAgICAgICBzdGFydDogdGhpcy5zb3VyY2VUb2tlbixcbiAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFtdLFxuICAgICAgICAgICAgICAgICAgICBlbmQ6IFtdXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNhc2UgJ3NlcS1pdGVtLWluZCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Jsb2NrLXNlcScsXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgIGluZGVudDogdGhpcy5pbmRlbnQsXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbeyBzdGFydDogW3RoaXMuc291cmNlVG9rZW5dIH1dXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNhc2UgJ2V4cGxpY2l0LWtleS1pbmQnOiB7XG4gICAgICAgICAgICAgICAgdGhpcy5vbktleUxpbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGNvbnN0IHByZXYgPSBnZXRQcmV2UHJvcHMocGFyZW50KTtcbiAgICAgICAgICAgICAgICBjb25zdCBzdGFydCA9IGdldEZpcnN0S2V5U3RhcnRQcm9wcyhwcmV2KTtcbiAgICAgICAgICAgICAgICBzdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdibG9jay1tYXAnLFxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICBpbmRlbnQ6IHRoaXMuaW5kZW50LFxuICAgICAgICAgICAgICAgICAgICBpdGVtczogW3sgc3RhcnQsIGV4cGxpY2l0S2V5OiB0cnVlIH1dXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgJ21hcC12YWx1ZS1pbmQnOiB7XG4gICAgICAgICAgICAgICAgdGhpcy5vbktleUxpbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGNvbnN0IHByZXYgPSBnZXRQcmV2UHJvcHMocGFyZW50KTtcbiAgICAgICAgICAgICAgICBjb25zdCBzdGFydCA9IGdldEZpcnN0S2V5U3RhcnRQcm9wcyhwcmV2KTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYmxvY2stbWFwJyxcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgaW5kZW50OiB0aGlzLmluZGVudCxcbiAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFt7IHN0YXJ0LCBrZXk6IG51bGwsIHNlcDogW3RoaXMuc291cmNlVG9rZW5dIH1dXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgYXRJbmRlbnRlZENvbW1lbnQoc3RhcnQsIGluZGVudCkge1xuICAgICAgICBpZiAodGhpcy50eXBlICE9PSAnY29tbWVudCcpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmICh0aGlzLmluZGVudCA8PSBpbmRlbnQpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIHJldHVybiBzdGFydC5ldmVyeShzdCA9PiBzdC50eXBlID09PSAnbmV3bGluZScgfHwgc3QudHlwZSA9PT0gJ3NwYWNlJyk7XG4gICAgfVxuICAgICpkb2N1bWVudEVuZChkb2NFbmQpIHtcbiAgICAgICAgaWYgKHRoaXMudHlwZSAhPT0gJ2RvYy1tb2RlJykge1xuICAgICAgICAgICAgaWYgKGRvY0VuZC5lbmQpXG4gICAgICAgICAgICAgICAgZG9jRW5kLmVuZC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGRvY0VuZC5lbmQgPSBbdGhpcy5zb3VyY2VUb2tlbl07XG4gICAgICAgICAgICBpZiAodGhpcy50eXBlID09PSAnbmV3bGluZScpXG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucG9wKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgKmxpbmVFbmQodG9rZW4pIHtcbiAgICAgICAgc3dpdGNoICh0aGlzLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2NvbW1hJzpcbiAgICAgICAgICAgIGNhc2UgJ2RvYy1zdGFydCc6XG4gICAgICAgICAgICBjYXNlICdkb2MtZW5kJzpcbiAgICAgICAgICAgIGNhc2UgJ2Zsb3ctc2VxLWVuZCc6XG4gICAgICAgICAgICBjYXNlICdmbG93LW1hcC1lbmQnOlxuICAgICAgICAgICAgY2FzZSAnbWFwLXZhbHVlLWluZCc6XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucG9wKCk7XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMuc3RlcCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgICAgdGhpcy5vbktleUxpbmUgPSBmYWxzZTtcbiAgICAgICAgICAgIC8vIGZhbGx0aHJvdWdoXG4gICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgLy8gYWxsIG90aGVyIHZhbHVlcyBhcmUgZXJyb3JzXG4gICAgICAgICAgICAgICAgaWYgKHRva2VuLmVuZClcbiAgICAgICAgICAgICAgICAgICAgdG9rZW4uZW5kLnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB0b2tlbi5lbmQgPSBbdGhpcy5zb3VyY2VUb2tlbl07XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudHlwZSA9PT0gJ25ld2xpbmUnKVxuICAgICAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wb3AoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0cy5QYXJzZXIgPSBQYXJzZXI7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIGNvbXBvc2VyID0gcmVxdWlyZSgnLi9jb21wb3NlL2NvbXBvc2VyLmpzJyk7XG52YXIgRG9jdW1lbnQgPSByZXF1aXJlKCcuL2RvYy9Eb2N1bWVudC5qcycpO1xudmFyIGVycm9ycyA9IHJlcXVpcmUoJy4vZXJyb3JzLmpzJyk7XG52YXIgbG9nID0gcmVxdWlyZSgnLi9sb2cuanMnKTtcbnZhciBpZGVudGl0eSA9IHJlcXVpcmUoJy4vbm9kZXMvaWRlbnRpdHkuanMnKTtcbnZhciBsaW5lQ291bnRlciA9IHJlcXVpcmUoJy4vcGFyc2UvbGluZS1jb3VudGVyLmpzJyk7XG52YXIgcGFyc2VyID0gcmVxdWlyZSgnLi9wYXJzZS9wYXJzZXIuanMnKTtcblxuZnVuY3Rpb24gcGFyc2VPcHRpb25zKG9wdGlvbnMpIHtcbiAgICBjb25zdCBwcmV0dHlFcnJvcnMgPSBvcHRpb25zLnByZXR0eUVycm9ycyAhPT0gZmFsc2U7XG4gICAgY29uc3QgbGluZUNvdW50ZXIkMSA9IG9wdGlvbnMubGluZUNvdW50ZXIgfHwgKHByZXR0eUVycm9ycyAmJiBuZXcgbGluZUNvdW50ZXIuTGluZUNvdW50ZXIoKSkgfHwgbnVsbDtcbiAgICByZXR1cm4geyBsaW5lQ291bnRlcjogbGluZUNvdW50ZXIkMSwgcHJldHR5RXJyb3JzIH07XG59XG4vKipcbiAqIFBhcnNlIHRoZSBpbnB1dCBhcyBhIHN0cmVhbSBvZiBZQU1MIGRvY3VtZW50cy5cbiAqXG4gKiBEb2N1bWVudHMgc2hvdWxkIGJlIHNlcGFyYXRlZCBmcm9tIGVhY2ggb3RoZXIgYnkgYC4uLmAgb3IgYC0tLWAgbWFya2VyIGxpbmVzLlxuICpcbiAqIEByZXR1cm5zIElmIGFuIGVtcHR5IGBkb2NzYCBhcnJheSBpcyByZXR1cm5lZCwgaXQgd2lsbCBiZSBvZiB0eXBlXG4gKiAgIEVtcHR5U3RyZWFtIGFuZCBjb250YWluIGFkZGl0aW9uYWwgc3RyZWFtIGluZm9ybWF0aW9uLiBJblxuICogICBUeXBlU2NyaXB0LCB5b3Ugc2hvdWxkIHVzZSBgJ2VtcHR5JyBpbiBkb2NzYCBhcyBhIHR5cGUgZ3VhcmQgZm9yIGl0LlxuICovXG5mdW5jdGlvbiBwYXJzZUFsbERvY3VtZW50cyhzb3VyY2UsIG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IHsgbGluZUNvdW50ZXIsIHByZXR0eUVycm9ycyB9ID0gcGFyc2VPcHRpb25zKG9wdGlvbnMpO1xuICAgIGNvbnN0IHBhcnNlciQxID0gbmV3IHBhcnNlci5QYXJzZXIobGluZUNvdW50ZXI/LmFkZE5ld0xpbmUpO1xuICAgIGNvbnN0IGNvbXBvc2VyJDEgPSBuZXcgY29tcG9zZXIuQ29tcG9zZXIob3B0aW9ucyk7XG4gICAgY29uc3QgZG9jcyA9IEFycmF5LmZyb20oY29tcG9zZXIkMS5jb21wb3NlKHBhcnNlciQxLnBhcnNlKHNvdXJjZSkpKTtcbiAgICBpZiAocHJldHR5RXJyb3JzICYmIGxpbmVDb3VudGVyKVxuICAgICAgICBmb3IgKGNvbnN0IGRvYyBvZiBkb2NzKSB7XG4gICAgICAgICAgICBkb2MuZXJyb3JzLmZvckVhY2goZXJyb3JzLnByZXR0aWZ5RXJyb3Ioc291cmNlLCBsaW5lQ291bnRlcikpO1xuICAgICAgICAgICAgZG9jLndhcm5pbmdzLmZvckVhY2goZXJyb3JzLnByZXR0aWZ5RXJyb3Ioc291cmNlLCBsaW5lQ291bnRlcikpO1xuICAgICAgICB9XG4gICAgaWYgKGRvY3MubGVuZ3RoID4gMClcbiAgICAgICAgcmV0dXJuIGRvY3M7XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oW10sIHsgZW1wdHk6IHRydWUgfSwgY29tcG9zZXIkMS5zdHJlYW1JbmZvKCkpO1xufVxuLyoqIFBhcnNlIGFuIGlucHV0IHN0cmluZyBpbnRvIGEgc2luZ2xlIFlBTUwuRG9jdW1lbnQgKi9cbmZ1bmN0aW9uIHBhcnNlRG9jdW1lbnQoc291cmNlLCBvcHRpb25zID0ge30pIHtcbiAgICBjb25zdCB7IGxpbmVDb3VudGVyLCBwcmV0dHlFcnJvcnMgfSA9IHBhcnNlT3B0aW9ucyhvcHRpb25zKTtcbiAgICBjb25zdCBwYXJzZXIkMSA9IG5ldyBwYXJzZXIuUGFyc2VyKGxpbmVDb3VudGVyPy5hZGROZXdMaW5lKTtcbiAgICBjb25zdCBjb21wb3NlciQxID0gbmV3IGNvbXBvc2VyLkNvbXBvc2VyKG9wdGlvbnMpO1xuICAgIC8vIGBkb2NgIGlzIGFsd2F5cyBzZXQgYnkgY29tcG9zZS5lbmQodHJ1ZSkgYXQgdGhlIHZlcnkgbGF0ZXN0XG4gICAgbGV0IGRvYyA9IG51bGw7XG4gICAgZm9yIChjb25zdCBfZG9jIG9mIGNvbXBvc2VyJDEuY29tcG9zZShwYXJzZXIkMS5wYXJzZShzb3VyY2UpLCB0cnVlLCBzb3VyY2UubGVuZ3RoKSkge1xuICAgICAgICBpZiAoIWRvYylcbiAgICAgICAgICAgIGRvYyA9IF9kb2M7XG4gICAgICAgIGVsc2UgaWYgKGRvYy5vcHRpb25zLmxvZ0xldmVsICE9PSAnc2lsZW50Jykge1xuICAgICAgICAgICAgZG9jLmVycm9ycy5wdXNoKG5ldyBlcnJvcnMuWUFNTFBhcnNlRXJyb3IoX2RvYy5yYW5nZS5zbGljZSgwLCAyKSwgJ01VTFRJUExFX0RPQ1MnLCAnU291cmNlIGNvbnRhaW5zIG11bHRpcGxlIGRvY3VtZW50czsgcGxlYXNlIHVzZSBZQU1MLnBhcnNlQWxsRG9jdW1lbnRzKCknKSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAocHJldHR5RXJyb3JzICYmIGxpbmVDb3VudGVyKSB7XG4gICAgICAgIGRvYy5lcnJvcnMuZm9yRWFjaChlcnJvcnMucHJldHRpZnlFcnJvcihzb3VyY2UsIGxpbmVDb3VudGVyKSk7XG4gICAgICAgIGRvYy53YXJuaW5ncy5mb3JFYWNoKGVycm9ycy5wcmV0dGlmeUVycm9yKHNvdXJjZSwgbGluZUNvdW50ZXIpKTtcbiAgICB9XG4gICAgcmV0dXJuIGRvYztcbn1cbmZ1bmN0aW9uIHBhcnNlKHNyYywgcmV2aXZlciwgb3B0aW9ucykge1xuICAgIGxldCBfcmV2aXZlciA9IHVuZGVmaW5lZDtcbiAgICBpZiAodHlwZW9mIHJldml2ZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgX3Jldml2ZXIgPSByZXZpdmVyO1xuICAgIH1cbiAgICBlbHNlIGlmIChvcHRpb25zID09PSB1bmRlZmluZWQgJiYgcmV2aXZlciAmJiB0eXBlb2YgcmV2aXZlciA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgb3B0aW9ucyA9IHJldml2ZXI7XG4gICAgfVxuICAgIGNvbnN0IGRvYyA9IHBhcnNlRG9jdW1lbnQoc3JjLCBvcHRpb25zKTtcbiAgICBpZiAoIWRvYylcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgZG9jLndhcm5pbmdzLmZvckVhY2god2FybmluZyA9PiBsb2cud2Fybihkb2Mub3B0aW9ucy5sb2dMZXZlbCwgd2FybmluZykpO1xuICAgIGlmIChkb2MuZXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgaWYgKGRvYy5vcHRpb25zLmxvZ0xldmVsICE9PSAnc2lsZW50JylcbiAgICAgICAgICAgIHRocm93IGRvYy5lcnJvcnNbMF07XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGRvYy5lcnJvcnMgPSBbXTtcbiAgICB9XG4gICAgcmV0dXJuIGRvYy50b0pTKE9iamVjdC5hc3NpZ24oeyByZXZpdmVyOiBfcmV2aXZlciB9LCBvcHRpb25zKSk7XG59XG5mdW5jdGlvbiBzdHJpbmdpZnkodmFsdWUsIHJlcGxhY2VyLCBvcHRpb25zKSB7XG4gICAgbGV0IF9yZXBsYWNlciA9IG51bGw7XG4gICAgaWYgKHR5cGVvZiByZXBsYWNlciA9PT0gJ2Z1bmN0aW9uJyB8fCBBcnJheS5pc0FycmF5KHJlcGxhY2VyKSkge1xuICAgICAgICBfcmVwbGFjZXIgPSByZXBsYWNlcjtcbiAgICB9XG4gICAgZWxzZSBpZiAob3B0aW9ucyA9PT0gdW5kZWZpbmVkICYmIHJlcGxhY2VyKSB7XG4gICAgICAgIG9wdGlvbnMgPSByZXBsYWNlcjtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnc3RyaW5nJylcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMubGVuZ3RoO1xuICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgY29uc3QgaW5kZW50ID0gTWF0aC5yb3VuZChvcHRpb25zKTtcbiAgICAgICAgb3B0aW9ucyA9IGluZGVudCA8IDEgPyB1bmRlZmluZWQgOiBpbmRlbnQgPiA4ID8geyBpbmRlbnQ6IDggfSA6IHsgaW5kZW50IH07XG4gICAgfVxuICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnN0IHsga2VlcFVuZGVmaW5lZCB9ID0gb3B0aW9ucyA/PyByZXBsYWNlciA/PyB7fTtcbiAgICAgICAgaWYgKCFrZWVwVW5kZWZpbmVkKVxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgaWYgKGlkZW50aXR5LmlzRG9jdW1lbnQodmFsdWUpICYmICFfcmVwbGFjZXIpXG4gICAgICAgIHJldHVybiB2YWx1ZS50b1N0cmluZyhvcHRpb25zKTtcbiAgICByZXR1cm4gbmV3IERvY3VtZW50LkRvY3VtZW50KHZhbHVlLCBfcmVwbGFjZXIsIG9wdGlvbnMpLnRvU3RyaW5nKG9wdGlvbnMpO1xufVxuXG5leHBvcnRzLnBhcnNlID0gcGFyc2U7XG5leHBvcnRzLnBhcnNlQWxsRG9jdW1lbnRzID0gcGFyc2VBbGxEb2N1bWVudHM7XG5leHBvcnRzLnBhcnNlRG9jdW1lbnQgPSBwYXJzZURvY3VtZW50O1xuZXhwb3J0cy5zdHJpbmdpZnkgPSBzdHJpbmdpZnk7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIGNvbXBvc2VyID0gcmVxdWlyZSgnLi9jb21wb3NlL2NvbXBvc2VyLmpzJyk7XG52YXIgRG9jdW1lbnQgPSByZXF1aXJlKCcuL2RvYy9Eb2N1bWVudC5qcycpO1xudmFyIFNjaGVtYSA9IHJlcXVpcmUoJy4vc2NoZW1hL1NjaGVtYS5qcycpO1xudmFyIGVycm9ycyA9IHJlcXVpcmUoJy4vZXJyb3JzLmpzJyk7XG52YXIgQWxpYXMgPSByZXF1aXJlKCcuL25vZGVzL0FsaWFzLmpzJyk7XG52YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuL25vZGVzL2lkZW50aXR5LmpzJyk7XG52YXIgUGFpciA9IHJlcXVpcmUoJy4vbm9kZXMvUGFpci5qcycpO1xudmFyIFNjYWxhciA9IHJlcXVpcmUoJy4vbm9kZXMvU2NhbGFyLmpzJyk7XG52YXIgWUFNTE1hcCA9IHJlcXVpcmUoJy4vbm9kZXMvWUFNTE1hcC5qcycpO1xudmFyIFlBTUxTZXEgPSByZXF1aXJlKCcuL25vZGVzL1lBTUxTZXEuanMnKTtcbnZhciBjc3QgPSByZXF1aXJlKCcuL3BhcnNlL2NzdC5qcycpO1xudmFyIGxleGVyID0gcmVxdWlyZSgnLi9wYXJzZS9sZXhlci5qcycpO1xudmFyIGxpbmVDb3VudGVyID0gcmVxdWlyZSgnLi9wYXJzZS9saW5lLWNvdW50ZXIuanMnKTtcbnZhciBwYXJzZXIgPSByZXF1aXJlKCcuL3BhcnNlL3BhcnNlci5qcycpO1xudmFyIHB1YmxpY0FwaSA9IHJlcXVpcmUoJy4vcHVibGljLWFwaS5qcycpO1xudmFyIHZpc2l0ID0gcmVxdWlyZSgnLi92aXNpdC5qcycpO1xuXG5cblxuZXhwb3J0cy5Db21wb3NlciA9IGNvbXBvc2VyLkNvbXBvc2VyO1xuZXhwb3J0cy5Eb2N1bWVudCA9IERvY3VtZW50LkRvY3VtZW50O1xuZXhwb3J0cy5TY2hlbWEgPSBTY2hlbWEuU2NoZW1hO1xuZXhwb3J0cy5ZQU1MRXJyb3IgPSBlcnJvcnMuWUFNTEVycm9yO1xuZXhwb3J0cy5ZQU1MUGFyc2VFcnJvciA9IGVycm9ycy5ZQU1MUGFyc2VFcnJvcjtcbmV4cG9ydHMuWUFNTFdhcm5pbmcgPSBlcnJvcnMuWUFNTFdhcm5pbmc7XG5leHBvcnRzLkFsaWFzID0gQWxpYXMuQWxpYXM7XG5leHBvcnRzLmlzQWxpYXMgPSBpZGVudGl0eS5pc0FsaWFzO1xuZXhwb3J0cy5pc0NvbGxlY3Rpb24gPSBpZGVudGl0eS5pc0NvbGxlY3Rpb247XG5leHBvcnRzLmlzRG9jdW1lbnQgPSBpZGVudGl0eS5pc0RvY3VtZW50O1xuZXhwb3J0cy5pc01hcCA9IGlkZW50aXR5LmlzTWFwO1xuZXhwb3J0cy5pc05vZGUgPSBpZGVudGl0eS5pc05vZGU7XG5leHBvcnRzLmlzUGFpciA9IGlkZW50aXR5LmlzUGFpcjtcbmV4cG9ydHMuaXNTY2FsYXIgPSBpZGVudGl0eS5pc1NjYWxhcjtcbmV4cG9ydHMuaXNTZXEgPSBpZGVudGl0eS5pc1NlcTtcbmV4cG9ydHMuUGFpciA9IFBhaXIuUGFpcjtcbmV4cG9ydHMuU2NhbGFyID0gU2NhbGFyLlNjYWxhcjtcbmV4cG9ydHMuWUFNTE1hcCA9IFlBTUxNYXAuWUFNTE1hcDtcbmV4cG9ydHMuWUFNTFNlcSA9IFlBTUxTZXEuWUFNTFNlcTtcbmV4cG9ydHMuQ1NUID0gY3N0O1xuZXhwb3J0cy5MZXhlciA9IGxleGVyLkxleGVyO1xuZXhwb3J0cy5MaW5lQ291bnRlciA9IGxpbmVDb3VudGVyLkxpbmVDb3VudGVyO1xuZXhwb3J0cy5QYXJzZXIgPSBwYXJzZXIuUGFyc2VyO1xuZXhwb3J0cy5wYXJzZSA9IHB1YmxpY0FwaS5wYXJzZTtcbmV4cG9ydHMucGFyc2VBbGxEb2N1bWVudHMgPSBwdWJsaWNBcGkucGFyc2VBbGxEb2N1bWVudHM7XG5leHBvcnRzLnBhcnNlRG9jdW1lbnQgPSBwdWJsaWNBcGkucGFyc2VEb2N1bWVudDtcbmV4cG9ydHMuc3RyaW5naWZ5ID0gcHVibGljQXBpLnN0cmluZ2lmeTtcbmV4cG9ydHMudmlzaXQgPSB2aXNpdC52aXNpdDtcbmV4cG9ydHMudmlzaXRBc3luYyA9IHZpc2l0LnZpc2l0QXN5bmM7XG4iLAogICAgIi8qKlxuICogSW5pdGlhbGl6ZSBhaS1lbmcgY29uZmlndXJhdGlvbiBmaWxlXG4gKi9cblxuaW1wb3J0IHsgZXhpc3RzU3luYyB9IGZyb20gXCJub2RlOmZzXCI7XG5pbXBvcnQgeyBta2Rpciwgd3JpdGVGaWxlIH0gZnJvbSBcIm5vZGU6ZnMvcHJvbWlzZXNcIjtcbmltcG9ydCB7IGpvaW4gfSBmcm9tIFwibm9kZTpwYXRoXCI7XG5pbXBvcnQgWUFNTCBmcm9tIFwieWFtbFwiO1xuaW1wb3J0IHR5cGUgeyBJbml0RmxhZ3MgfSBmcm9tIFwiLi4vY2xpL2ZsYWdzXCI7XG5pbXBvcnQgeyBVSSB9IGZyb20gXCIuLi9jbGkvdWlcIjtcbmltcG9ydCB7IERFRkFVTFRfQ09ORklHIH0gZnJvbSBcIi4uL2NvbmZpZy9zY2hlbWFcIjtcblxuLyoqXG4gKiBJbml0aWFsaXplIGNvbmZpZ3VyYXRpb24gZmlsZVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW5pdENvbmZpZyhmbGFnczogSW5pdEZsYWdzKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgY29uZmlnRGlyID0gam9pbihwcm9jZXNzLmN3ZCgpLCBcIi5haS1lbmdcIik7XG4gICAgY29uc3QgY29uZmlnUGF0aCA9IGpvaW4oY29uZmlnRGlyLCBcImNvbmZpZy55YW1sXCIpO1xuXG4gICAgLy8gQ2hlY2sgaWYgY29uZmlnIGFscmVhZHkgZXhpc3RzXG4gICAgaWYgKGV4aXN0c1N5bmMoY29uZmlnUGF0aCkgJiYgIWZsYWdzLm92ZXJ3cml0ZSkge1xuICAgICAgICBVSS5lcnJvcihcIkNvbmZpZ3VyYXRpb24gZmlsZSBhbHJlYWR5IGV4aXN0czpcIik7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYCAgJHtjb25maWdQYXRofWApO1xuICAgICAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICAgICAgXCJVc2UgLS1vdmVyd3JpdGUgdG8gcmVwbGFjZSBpdCwgb3IgZWRpdCB0aGUgZXhpc3RpbmcgZmlsZS5cIixcbiAgICAgICAgKTtcbiAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgIH1cblxuICAgIGlmIChmbGFncy5pbnRlcmFjdGl2ZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIuKaoO+4jyAgSW50ZXJhY3RpdmUgbW9kZSByZXF1aXJlcyBhZGRpdGlvbmFsIGRlcGVuZGVuY2llcy5cIik7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiICBucG0gaW5zdGFsbCBAY2xhY2svcHJvbXB0c1wiKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJGb3Igbm93LCBjcmVhdGluZyBjb25maWcgd2l0aCBkZWZhdWx0cy4uLlxcblwiKTtcbiAgICB9XG5cbiAgICAvLyBXcml0ZSBkZWZhdWx0IGNvbmZpZ3VyYXRpb25cbiAgICB0cnkge1xuICAgICAgICAvLyBDcmVhdGUgLmFpLWVuZyBkaXJlY3RvcnkgaWYgaXQgZG9lc24ndCBleGlzdFxuICAgICAgICBhd2FpdCBta2Rpcihjb25maWdEaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuXG4gICAgICAgIGNvbnN0IHlhbWxDb250ZW50ID0gWUFNTC5zdHJpbmdpZnkoREVGQVVMVF9DT05GSUcsIHtcbiAgICAgICAgICAgIGluZGVudDogMixcbiAgICAgICAgICAgIGxpbmVXaWR0aDogMCxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXdhaXQgd3JpdGVGaWxlKGNvbmZpZ1BhdGgsIHlhbWxDb250ZW50LCBcInV0Zi04XCIpO1xuICAgICAgICBjb25zb2xlLmxvZyhcIuKchSBJbml0aWFsaXplZCAuYWktZW5nL2NvbmZpZy55YW1sIHdpdGggZGVmYXVsdHNcIik7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiXFxu8J+TiyBOZXh0IHN0ZXBzOlwiKTtcbiAgICAgICAgY29uc29sZS5sb2coXCIgIDEuIEVkaXQgLmFpLWVuZy9jb25maWcueWFtbCB0byBjdXN0b21pemUgc2V0dGluZ3NcIik7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiICAyLiBTZXQgdXAgQUkgbW9kZWxzIGFuZCBiYWNrZW5kc1wiKTtcbiAgICAgICAgY29uc29sZS5sb2coXCIgIDMuIENvbmZpZ3VyZSBxdWFsaXR5IGdhdGVzIGZvciB5b3VyIHByb2plY3RcIik7XG4gICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgXCIgIDQuIFJ1biAnYWktZW5nIHJhbHBoIFxcXCJ5b3VyIHRhc2tcXFwiJyB0byBzdGFydCBkZXZlbG9wbWVudFwiLFxuICAgICAgICApO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYEZhaWxlZCB0byB3cml0ZSBjb25maWd1cmF0aW9uIGZpbGU6ICR7Y29uZmlnUGF0aH1gKTtcbiAgICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yOiAke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgICAgIH1cbiAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgIH1cbn1cbiIsCiAgICAiLyoqXG4gKiBDTEkgVUkgdXRpbGl0aWVzIGZvciBhaS1lbmcgcmFscGhcbiAqXG4gKiBDb25zb2xlIHN0eWxpbmcgYW5kIG91dHB1dCBoZWxwZXJzXG4gKi9cbmltcG9ydCB7IEVPTCB9IGZyb20gXCJub2RlOm9zXCI7XG5cbmV4cG9ydCBuYW1lc3BhY2UgVUkge1xuICAgIGV4cG9ydCBjb25zdCBTdHlsZSA9IHtcbiAgICAgICAgLy8gQ29sb3JzXG4gICAgICAgIFRFWFRfSElHSExJR0hUOiBcIlxceDFiWzk2bVwiLFxuICAgICAgICBURVhUX0hJR0hMSUdIVF9CT0xEOiBcIlxceDFiWzk2bVxceDFiWzFtXCIsXG4gICAgICAgIFRFWFRfRElNOiBcIlxceDFiWzkwbVwiLFxuICAgICAgICBURVhUX0RJTV9CT0xEOiBcIlxceDFiWzkwbVxceDFiWzFtXCIsXG4gICAgICAgIFRFWFRfTk9STUFMOiBcIlxceDFiWzBtXCIsXG4gICAgICAgIFRFWFRfTk9STUFMX0JPTEQ6IFwiXFx4MWJbMW1cIixcbiAgICAgICAgVEVYVF9XQVJOSU5HOiBcIlxceDFiWzkzbVwiLFxuICAgICAgICBURVhUX1dBUk5JTkdfQk9MRDogXCJcXHgxYls5M21cXHgxYlsxbVwiLFxuICAgICAgICBURVhUX0RBTkdFUjogXCJcXHgxYls5MW1cIixcbiAgICAgICAgVEVYVF9EQU5HRVJfQk9MRDogXCJcXHgxYls5MW1cXHgxYlsxbVwiLFxuICAgICAgICBURVhUX1NVQ0NFU1M6IFwiXFx4MWJbOTJtXCIsXG4gICAgICAgIFRFWFRfU1VDQ0VTU19CT0xEOiBcIlxceDFiWzkybVxceDFiWzFtXCIsXG4gICAgICAgIFRFWFRfSU5GTzogXCJcXHgxYls5NG1cIixcbiAgICAgICAgVEVYVF9JTkZPX0JPTEQ6IFwiXFx4MWJbOTRtXFx4MWJbMW1cIixcbiAgICB9O1xuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHByaW50bG4oLi4ubWVzc2FnZTogc3RyaW5nW10pOiB2b2lkIHtcbiAgICAgICAgcHJvY2Vzcy5zdGRlcnIud3JpdGUobWVzc2FnZS5qb2luKFwiIFwiKSArIEVPTCk7XG4gICAgfVxuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHByaW50KC4uLm1lc3NhZ2U6IHN0cmluZ1tdKTogdm9pZCB7XG4gICAgICAgIHByb2Nlc3Muc3RkZXJyLndyaXRlKG1lc3NhZ2Uuam9pbihcIiBcIikpO1xuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiBlcnJvcihtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgcHJpbnRsbihcbiAgICAgICAgICAgIGAke1N0eWxlLlRFWFRfREFOR0VSX0JPTER9RXJyb3I6ICR7U3R5bGUuVEVYVF9OT1JNQUx9JHttZXNzYWdlfWAsXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHN1Y2Nlc3MobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIHByaW50bG4oYCR7U3R5bGUuVEVYVF9TVUNDRVNTX0JPTER94pyTICR7U3R5bGUuVEVYVF9OT1JNQUx9JHttZXNzYWdlfWApO1xuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiBpbmZvKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBwcmludGxuKGAke1N0eWxlLlRFWFRfSU5GT19CT0xEfeKEuSAke1N0eWxlLlRFWFRfTk9STUFMfSR7bWVzc2FnZX1gKTtcbiAgICB9XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gd2FybihtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgcHJpbnRsbihgJHtTdHlsZS5URVhUX1dBUk5JTkdfQk9MRH0hICR7U3R5bGUuVEVYVF9OT1JNQUx9JHttZXNzYWdlfWApO1xuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiBoZWFkZXIodGl0bGU6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBwcmludGxuKCk7XG4gICAgICAgIHByaW50bG4oU3R5bGUuVEVYVF9ISUdITElHSFRfQk9MRCArIHRpdGxlICsgU3R5bGUuVEVYVF9OT1JNQUwpO1xuICAgICAgICBwcmludGxuKFN0eWxlLlRFWFRfRElNICsgXCLilIBcIi5yZXBlYXQoNTApICsgU3R5bGUuVEVYVF9OT1JNQUwpO1xuICAgIH1cbn1cbiIsCiAgICAiLyoqXG4gKiBBSSBFbmdpbmVlcmluZyBTeXN0ZW0gQ29uZmlndXJhdGlvbiBTY2hlbWFcbiAqL1xuXG4vKipcbiAqIFJ1bm5lciBDb25maWd1cmF0aW9uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUnVubmVyQ29uZmlnIHtcbiAgICAvKiogQmFja2VuZCB0byB1c2UgZm9yIGV4ZWN1dGlvbiAqL1xuICAgIGJhY2tlbmQ6IFwib3BlbmNvZGVcIiB8IFwiYW50aHJvcGljXCI7XG4gICAgLyoqIFJldmlldyBtb2RlIGZvciBBSSByZXZpZXdzICovXG4gICAgcmV2aWV3OiBcIm5vbmVcIiB8IFwib3BlbmNvZGVcIiB8IFwiYW50aHJvcGljXCIgfCBcImJvdGhcIjtcbiAgICAvKiogRGlyZWN0b3J5IGZvciBydW4gYXJ0aWZhY3RzICovXG4gICAgYXJ0aWZhY3RzRGlyOiBzdHJpbmc7XG4gICAgLyoqIE1heGltdW0gaXRlcmF0aW9ucyBwZXIgcnVuICovXG4gICAgbWF4SXRlcnM6IG51bWJlcjtcbiAgICAvKiogUHJpbnQgbG9ncyB0byBzdGRlcnIgKi9cbiAgICBwcmludExvZ3M/OiBib29sZWFuO1xuICAgIC8qKiBMb2cgbGV2ZWwgKi9cbiAgICBsb2dMZXZlbD86IFwiREVCVUdcIiB8IFwiSU5GT1wiIHwgXCJXQVJOXCIgfCBcIkVSUk9SXCI7XG59XG5cbi8qKlxuICogTG9vcCBDb25maWd1cmF0aW9uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTG9vcENvbmZpZyB7XG4gICAgLyoqIE1heGltdW0gbnVtYmVyIG9mIGxvb3AgY3ljbGVzICovXG4gICAgbWF4Q3ljbGVzOiBudW1iZXI7XG4gICAgLyoqIE51bWJlciBvZiByZXRyeSBhdHRlbXB0cyBwZXIgY3ljbGUgb24gZmFpbHVyZSAqL1xuICAgIGN5Y2xlUmV0cmllczogbnVtYmVyO1xuICAgIC8qKiBDaGVja3BvaW50IGZyZXF1ZW5jeSAoc2F2ZSBzdGF0ZSBldmVyeSBOIGN5Y2xlcykgKi9cbiAgICBjaGVja3BvaW50RnJlcXVlbmN5OiBudW1iZXI7XG4gICAgLyoqIFN0dWNrIGRldGVjdGlvbiB0aHJlc2hvbGQgLSBhYm9ydCBhZnRlciBOIGN5Y2xlcyB3aXRoIG5vIHByb2dyZXNzICovXG4gICAgc3R1Y2tUaHJlc2hvbGQ6IG51bWJlcjtcbn1cblxuLyoqXG4gKiBEZWJ1ZyBDb25maWd1cmF0aW9uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRGVidWdDb25maWcge1xuICAgIC8qKiBQcmludCBldmVyeSB0b29sIGludm9jYXRpb24gaW5wdXQvb3V0cHV0IHRvIGNvbnNvbGUgYW5kIGxvZ3MgKi9cbiAgICB3b3JrOiBib29sZWFuO1xufVxuXG4vKipcbiAqIE9wZW5Db2RlIENvbmZpZ3VyYXRpb25cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBPcGVuQ29kZUNvbmZpZyB7XG4gICAgLyoqIE1vZGVsIHRvIHVzZSBmb3IgT3BlbkNvZGUgKi9cbiAgICBtb2RlbDogc3RyaW5nO1xuICAgIC8qKiBUZW1wZXJhdHVyZSBmb3IgZ2VuZXJhdGlvbiAqL1xuICAgIHRlbXBlcmF0dXJlOiBudW1iZXI7XG4gICAgLyoqIEV4aXN0aW5nIHNlcnZlciBVUkwgKG9wdGlvbmFsIC0gd2lsbCBzcGF3biBpZiBub3QgcHJvdmlkZWQpICovXG4gICAgc2VydmVyVXJsPzogc3RyaW5nO1xuICAgIC8qKiBXb3JraW5nIGRpcmVjdG9yeSBmb3IgT3BlbkNvZGUgc2Vzc2lvbiAqL1xuICAgIGRpcmVjdG9yeT86IHN0cmluZztcbiAgICAvKiogUHJvbXB0IHRpbWVvdXQgaW4gbWlsbGlzZWNvbmRzICovXG4gICAgcHJvbXB0VGltZW91dE1zPzogbnVtYmVyO1xufVxuXG4vKipcbiAqIEFudGhyb3BpYyBDb25maWd1cmF0aW9uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW50aHJvcGljQ29uZmlnIHtcbiAgICAvKiogV2hldGhlciBBbnRocm9waWMgYmFja2VuZCBpcyBlbmFibGVkICovXG4gICAgZW5hYmxlZDogYm9vbGVhbjtcbiAgICAvKiogTW9kZWwgdG8gdXNlIGZvciBBbnRocm9waWMgKi9cbiAgICBtb2RlbDogc3RyaW5nO1xufVxuXG4vKipcbiAqIEdhdGUgQ29tbWFuZCBDb25maWd1cmF0aW9uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgR2F0ZUNvbW1hbmRDb25maWcge1xuICAgIC8qKiBDb21tYW5kIHRvIGV4ZWN1dGUgZm9yIHRoaXMgZ2F0ZSAqL1xuICAgIGNvbW1hbmQ6IHN0cmluZztcbn1cblxuLyoqXG4gKiBRdWFsaXR5IEdhdGVzIENvbmZpZ3VyYXRpb25cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBHYXRlc0NvbmZpZyB7XG4gICAgLyoqIExpbnQgZ2F0ZSBjb25maWd1cmF0aW9uICovXG4gICAgbGludDogR2F0ZUNvbW1hbmRDb25maWc7XG4gICAgLyoqIFR5cGUgY2hlY2sgZ2F0ZSBjb25maWd1cmF0aW9uICovXG4gICAgdHlwZWNoZWNrOiBHYXRlQ29tbWFuZENvbmZpZztcbiAgICAvKiogVGVzdCBnYXRlIGNvbmZpZ3VyYXRpb24gKi9cbiAgICB0ZXN0OiBHYXRlQ29tbWFuZENvbmZpZztcbiAgICAvKiogQnVpbGQgZ2F0ZSBjb25maWd1cmF0aW9uICovXG4gICAgYnVpbGQ6IEdhdGVDb21tYW5kQ29uZmlnO1xuICAgIC8qKiBBY2NlcHRhbmNlIGdhdGUgY29uZmlndXJhdGlvbiAoZS5nLiwgZ2l0IGRpZmYgLS1uYW1lLW9ubHkpICovXG4gICAgYWNjZXB0YW5jZTogR2F0ZUNvbW1hbmRDb25maWc7XG59XG5cbi8qKlxuICogTW9kZWxzIENvbmZpZ3VyYXRpb25cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBNb2RlbHNDb25maWcge1xuICAgIC8qKiBNb2RlbCBmb3IgcmVzZWFyY2ggdGFza3MgKi9cbiAgICByZXNlYXJjaDogc3RyaW5nO1xuICAgIC8qKiBNb2RlbCBmb3IgcGxhbm5pbmcgdGFza3MgKi9cbiAgICBwbGFubmluZzogc3RyaW5nO1xuICAgIC8qKiBNb2RlbCBmb3IgY29kZWJhc2UgZXhwbG9yYXRpb24gKi9cbiAgICBleHBsb3JhdGlvbjogc3RyaW5nO1xuICAgIC8qKiBNb2RlbCBmb3IgY29kaW5nL2ltcGxlbWVudGF0aW9uICovXG4gICAgY29kaW5nOiBzdHJpbmc7XG4gICAgLyoqIERlZmF1bHQgZmFsbGJhY2sgbW9kZWwgKi9cbiAgICBkZWZhdWx0OiBzdHJpbmc7XG59XG5cbi8qKlxuICogTm90aWZpY2F0aW9uIENvbmZpZ3VyYXRpb25cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBOb3RpZmljYXRpb25zQ29uZmlnIHtcbiAgICAvKiogRGlzY29yZCBub3RpZmljYXRpb24gc2V0dGluZ3MgKi9cbiAgICBkaXNjb3JkOiB7XG4gICAgICAgIC8qKiBFbmFibGUgRGlzY29yZCBub3RpZmljYXRpb25zICovXG4gICAgICAgIGVuYWJsZWQ6IGJvb2xlYW47XG4gICAgICAgIC8qKiBCb3QgdXNlcm5hbWUgKi9cbiAgICAgICAgdXNlcm5hbWU6IHN0cmluZztcbiAgICAgICAgLyoqIEJvdCBhdmF0YXIgVVJMICovXG4gICAgICAgIGF2YXRhclVybD86IHN0cmluZztcbiAgICAgICAgLyoqIFdlYmhvb2sgVVJMIChzaG91bGQgY29tZSBmcm9tIGVudiwgbmV2ZXIgaGFyZGNvZGVkKSAqL1xuICAgICAgICB3ZWJob29rPzoge1xuICAgICAgICAgICAgLyoqIFNvdXJjZSB0eXBlIC0gb25seSAnZW52JyBzdXBwb3J0ZWQgZm9yIHNlY3JldHMgKi9cbiAgICAgICAgICAgIHNvdXJjZTogXCJlbnZcIjtcbiAgICAgICAgICAgIC8qKiBFbnZpcm9ubWVudCB2YXJpYWJsZSBuYW1lIGZvciB0aGUgd2ViaG9vayBVUkwgKi9cbiAgICAgICAgICAgIGVudlZhcjogc3RyaW5nO1xuICAgICAgICB9O1xuICAgIH07XG59XG5cbi8qKlxuICogVUkgQ29uZmlndXJhdGlvblxuICovXG5leHBvcnQgaW50ZXJmYWNlIFVpQ29uZmlnIHtcbiAgICAvKiogU3VwcHJlc3Mgbm9pc3kgd2FybmluZ3MvbG9ncyAqL1xuICAgIHNpbGVudDogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBNYWluIENvbmZpZ3VyYXRpb24gU2NoZW1hXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQWlFbmdDb25maWcge1xuICAgIC8qKiBDb25maWd1cmF0aW9uIHZlcnNpb24gKi9cbiAgICB2ZXJzaW9uOiBudW1iZXI7XG4gICAgLyoqIFJ1bm5lciBjb25maWd1cmF0aW9uICovXG4gICAgcnVubmVyOiBSdW5uZXJDb25maWc7XG4gICAgLyoqIExvb3AgY29uZmlndXJhdGlvbiAqL1xuICAgIGxvb3A6IExvb3BDb25maWc7XG4gICAgLyoqIERlYnVnIGNvbmZpZ3VyYXRpb24gKi9cbiAgICBkZWJ1ZzogRGVidWdDb25maWc7XG4gICAgLyoqIE9wZW5Db2RlIGNvbmZpZ3VyYXRpb24gKi9cbiAgICBvcGVuY29kZTogT3BlbkNvZGVDb25maWc7XG4gICAgLyoqIEFudGhyb3BpYyBjb25maWd1cmF0aW9uICovXG4gICAgYW50aHJvcGljOiBBbnRocm9waWNDb25maWc7XG4gICAgLyoqIFF1YWxpdHkgZ2F0ZXMgY29uZmlndXJhdGlvbiAqL1xuICAgIGdhdGVzOiBHYXRlc0NvbmZpZztcbiAgICAvKiogTW9kZWxzIGNvbmZpZ3VyYXRpb24gKi9cbiAgICBtb2RlbHM6IE1vZGVsc0NvbmZpZztcbiAgICAvKiogTm90aWZpY2F0aW9ucyBjb25maWd1cmF0aW9uICovXG4gICAgbm90aWZpY2F0aW9uczogTm90aWZpY2F0aW9uc0NvbmZpZztcbiAgICAvKiogVUkgY29uZmlndXJhdGlvbiAqL1xuICAgIHVpOiBVaUNvbmZpZztcbn1cblxuLyoqXG4gKiBEZWZhdWx0IGNvbmZpZ3VyYXRpb25cbiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfQ09ORklHOiBBaUVuZ0NvbmZpZyA9IHtcbiAgICB2ZXJzaW9uOiAxLFxuICAgIHJ1bm5lcjoge1xuICAgICAgICBiYWNrZW5kOiBcIm9wZW5jb2RlXCIsXG4gICAgICAgIHJldmlldzogXCJvcGVuY29kZVwiLFxuICAgICAgICBhcnRpZmFjdHNEaXI6IFwiLmFpLWVuZy9ydW5zXCIsXG4gICAgICAgIG1heEl0ZXJzOiAzLFxuICAgICAgICBwcmludExvZ3M6IGZhbHNlLFxuICAgICAgICBsb2dMZXZlbDogXCJJTkZPXCIsXG4gICAgfSxcbiAgICBsb29wOiB7XG4gICAgICAgIG1heEN5Y2xlczogNTAsXG4gICAgICAgIGN5Y2xlUmV0cmllczogMixcbiAgICAgICAgY2hlY2twb2ludEZyZXF1ZW5jeTogMSxcbiAgICAgICAgc3R1Y2tUaHJlc2hvbGQ6IDUsXG4gICAgfSxcbiAgICBkZWJ1Zzoge1xuICAgICAgICB3b3JrOiBmYWxzZSxcbiAgICB9LFxuICAgIG9wZW5jb2RlOiB7XG4gICAgICAgIG1vZGVsOiBcImNsYXVkZS0zLTUtc29ubmV0LWxhdGVzdFwiLFxuICAgICAgICB0ZW1wZXJhdHVyZTogMC4yLFxuICAgICAgICBzZXJ2ZXJVcmw6IHVuZGVmaW5lZCxcbiAgICAgICAgZGlyZWN0b3J5OiB1bmRlZmluZWQsXG4gICAgICAgIHByb21wdFRpbWVvdXRNczogMTIwMDAwLFxuICAgIH0sXG4gICAgYW50aHJvcGljOiB7XG4gICAgICAgIGVuYWJsZWQ6IGZhbHNlLFxuICAgICAgICBtb2RlbDogXCJjbGF1ZGUtMy01LXNvbm5ldC1sYXRlc3RcIixcbiAgICB9LFxuICAgIGdhdGVzOiB7XG4gICAgICAgIGxpbnQ6IHsgY29tbWFuZDogXCJidW4gcnVuIGxpbnRcIiB9LFxuICAgICAgICB0eXBlY2hlY2s6IHsgY29tbWFuZDogXCJidW4gcnVuIHR5cGVjaGVja1wiIH0sXG4gICAgICAgIHRlc3Q6IHsgY29tbWFuZDogXCJidW4gdGVzdFwiIH0sXG4gICAgICAgIGJ1aWxkOiB7IGNvbW1hbmQ6IFwiYnVuIHJ1biBidWlsZFwiIH0sXG4gICAgICAgIGFjY2VwdGFuY2U6IHsgY29tbWFuZDogXCJnaXQgZGlmZiAtLW5hbWUtb25seVwiIH0sXG4gICAgfSxcbiAgICBtb2RlbHM6IHtcbiAgICAgICAgcmVzZWFyY2g6IFwiZ2l0aHViLWNvcGlsb3QvZ3B0LTUuMlwiLFxuICAgICAgICBwbGFubmluZzogXCJnaXRodWItY29waWxvdC9ncHQtNS4yXCIsXG4gICAgICAgIGV4cGxvcmF0aW9uOiBcImdpdGh1Yi1jb3BpbG90L2dwdC01LjJcIixcbiAgICAgICAgY29kaW5nOiBcImdpdGh1Yi1jb3BpbG90L2dwdC01LjJcIixcbiAgICAgICAgZGVmYXVsdDogXCJnaXRodWItY29waWxvdC9ncHQtNS4yXCIsXG4gICAgfSxcbiAgICBub3RpZmljYXRpb25zOiB7XG4gICAgICAgIGRpc2NvcmQ6IHtcbiAgICAgICAgICAgIGVuYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgdXNlcm5hbWU6IFwiUmFscGhcIixcbiAgICAgICAgICAgIGF2YXRhclVybDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgd2ViaG9vazoge1xuICAgICAgICAgICAgICAgIHNvdXJjZTogXCJlbnZcIixcbiAgICAgICAgICAgICAgICBlbnZWYXI6IFwiRElTQ09SRF9XRUJIT09LX1VSTFwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgIHVpOiB7XG4gICAgICAgIHNpbGVudDogZmFsc2UsXG4gICAgfSxcbn07XG4iCiAgXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFFQSxJQUFNLFFBQVEsT0FBTyxJQUFJLFlBQVk7QUFBQSxFQUNyQyxJQUFNLE1BQU0sT0FBTyxJQUFJLGVBQWU7QUFBQSxFQUN0QyxJQUFNLE1BQU0sT0FBTyxJQUFJLFVBQVU7QUFBQSxFQUNqQyxJQUFNLE9BQU8sT0FBTyxJQUFJLFdBQVc7QUFBQSxFQUNuQyxJQUFNLFNBQVMsT0FBTyxJQUFJLGFBQWE7QUFBQSxFQUN2QyxJQUFNLE1BQU0sT0FBTyxJQUFJLFVBQVU7QUFBQSxFQUNqQyxJQUFNLFlBQVksT0FBTyxJQUFJLGdCQUFnQjtBQUFBLEVBQzdDLElBQU0sVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFFBQVEsT0FBTyxTQUFTLFlBQVksS0FBSyxlQUFlO0FBQUEsRUFDcEYsSUFBTSxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUMsUUFBUSxPQUFPLFNBQVMsWUFBWSxLQUFLLGVBQWU7QUFBQSxFQUN2RixJQUFNLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxRQUFRLE9BQU8sU0FBUyxZQUFZLEtBQUssZUFBZTtBQUFBLEVBQ2xGLElBQU0sU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFFBQVEsT0FBTyxTQUFTLFlBQVksS0FBSyxlQUFlO0FBQUEsRUFDbkYsSUFB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
