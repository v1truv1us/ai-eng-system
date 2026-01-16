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
      if (i < items.length - 1)
        str += ",";
      if (comment)
        str += stringifyComment.lineComment(str, itemIndent, commentString(comment));
      if (!reqNewline && (lines.length > linesAtValue || str.includes(`
`)))
        reqNewline = true;
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
        node = composeCollection.composeCollection(CN, ctx, token, props, onError);
        if (anchor)
          node.anchor = anchor.source.substring(1);
        break;
      default: {
        const message = token.type === "error" ? token.message : `Unsupported token (type: ${token.type})`;
        onError(token, "UNEXPECTED_TOKEN", message);
        node = composeEmptyNode(ctx, token.offset, undefined, null, props, onError);
        isSrcToken = false;
      }
    }
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

// src/config/loadConfig.ts
var import_yaml = __toESM(require_dist(), 1);
import { readFile } from "node:fs/promises";
import { join } from "node:path";

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

// src/config/loadConfig.ts
var ROOT = process.env.TEST_ROOT ?? process.cwd();
function applyEnvOverrides(config) {
  if (process.env.OPENCODE_URL) {
    config.opencode.serverUrl = process.env.OPENCODE_URL;
  }
  if (process.env.OPENCODE_DIRECTORY) {
    config.opencode.directory = process.env.OPENCODE_DIRECTORY;
  }
  if (process.env.OPENCODE_PROMPT_TIMEOUT_MS) {
    const timeout = Number.parseInt(process.env.OPENCODE_PROMPT_TIMEOUT_MS, 10);
    if (Number.isNaN(timeout)) {
      config.opencode.promptTimeoutMs = timeout;
    }
  }
  if (process.env.DISCORD_BOT_USERNAME) {
    config.notifications.discord.username = process.env.DISCORD_BOT_USERNAME;
  }
  if (process.env.DISCORD_BOT_AVATAR_URL) {
    config.notifications.discord.avatarUrl = process.env.DISCORD_BOT_AVATAR_URL;
  }
  if (process.env.AI_ENG_SILENT) {
    config.ui.silent = process.env.AI_ENG_SILENT === "1" || process.env.AI_ENG_SILENT === "true";
  }
  if (process.env.AI_ENG_CYCLE_RETRIES) {
    const retries = Number.parseInt(process.env.AI_ENG_CYCLE_RETRIES, 10);
    if (!Number.isNaN(retries)) {
      config.loop.cycleRetries = retries;
    }
  }
  if (process.env.AI_ENG_DEBUG_WORK) {
    config.debug.work = process.env.AI_ENG_DEBUG_WORK === "1" || process.env.AI_ENG_DEBUG_WORK === "true";
  }
  if (process.env.AI_ENG_TEST_CMD) {
    config.gates.test.command = process.env.AI_ENG_TEST_CMD;
  }
  if (process.env.AI_ENG_LINT_CMD) {
    config.gates.lint.command = process.env.AI_ENG_LINT_CMD;
  }
  if (process.env.AI_ENG_ACCEPTANCE_CMD) {
    config.gates.acceptance.command = process.env.AI_ENG_ACCEPTANCE_CMD;
  }
  if (process.env.AI_ENG_TYPECHECK_CMD) {
    config.gates.typecheck.command = process.env.AI_ENG_TYPECHECK_CMD;
  }
  if (process.env.AI_ENG_BUILD_CMD) {
    config.gates.build.command = process.env.AI_ENG_BUILD_CMD;
  }
}
function mergeGateConfig(existing, incoming) {
  if (typeof incoming === "string") {
    return { command: incoming };
  }
  return {
    command: incoming.command ?? existing.command
  };
}
async function loadConfig(flags) {
  const config = {
    version: DEFAULT_CONFIG.version,
    runner: { ...DEFAULT_CONFIG.runner },
    loop: { ...DEFAULT_CONFIG.loop },
    debug: { ...DEFAULT_CONFIG.debug },
    opencode: { ...DEFAULT_CONFIG.opencode },
    anthropic: { ...DEFAULT_CONFIG.anthropic },
    gates: {
      lint: { ...DEFAULT_CONFIG.gates.lint },
      typecheck: { ...DEFAULT_CONFIG.gates.typecheck },
      test: { ...DEFAULT_CONFIG.gates.test },
      build: { ...DEFAULT_CONFIG.gates.build },
      acceptance: { ...DEFAULT_CONFIG.gates.acceptance }
    },
    models: { ...DEFAULT_CONFIG.models },
    notifications: {
      discord: { ...DEFAULT_CONFIG.notifications.discord }
    },
    ui: { ...DEFAULT_CONFIG.ui }
  };
  const configPath = join(ROOT, ".ai-eng", "config.yaml");
  try {
    const configContent = await readFile(configPath, "utf-8");
    const userConfig = import_yaml.default.parse(configContent);
    if (userConfig.version) {
      config.version = userConfig.version;
    }
    if (userConfig.runner) {
      config.runner = { ...config.runner, ...userConfig.runner };
    }
    if (userConfig.loop) {
      config.loop = { ...config.loop, ...userConfig.loop };
    }
    if (userConfig.debug) {
      config.debug = { ...config.debug, ...userConfig.debug };
    }
    if (userConfig.opencode) {
      config.opencode = { ...config.opencode, ...userConfig.opencode };
    }
    if (userConfig.anthropic) {
      config.anthropic = { ...config.anthropic, ...userConfig.anthropic };
    }
    if (userConfig.gates) {
      if (userConfig.gates.lint) {
        config.gates.lint = mergeGateConfig(config.gates.lint, userConfig.gates.lint);
      }
      if (userConfig.gates.typecheck) {
        config.gates.typecheck = mergeGateConfig(config.gates.typecheck, userConfig.gates.typecheck);
      }
      if (userConfig.gates.test) {
        config.gates.test = mergeGateConfig(config.gates.test, userConfig.gates.test);
      }
      if (userConfig.gates.build) {
        config.gates.build = mergeGateConfig(config.gates.build, userConfig.gates.build);
      }
      if (userConfig.gates.acceptance) {
        config.gates.acceptance = mergeGateConfig(config.gates.acceptance, userConfig.gates.acceptance);
      }
    }
    if (userConfig.models) {
      config.models = { ...config.models, ...userConfig.models };
    }
    if (userConfig.notifications) {
      if (userConfig.notifications.discord) {
        config.notifications.discord = {
          ...config.notifications.discord,
          ...userConfig.notifications.discord
        };
      }
    }
    if (userConfig.ui) {
      config.ui = { ...config.ui, ...userConfig.ui };
    }
  } catch (error) {
    if (!(error instanceof Error && error.message.includes("ENOENT"))) {
      console.warn(`Warning: Failed to load config from ${configPath}, using defaults`);
    }
  }
  applyEnvOverrides(config);
  if (flags.maxIters !== undefined) {
    config.runner.maxIters = flags.maxIters;
  }
  if (flags.review !== undefined) {
    config.runner.review = flags.review;
  }
  if (flags.maxCycles !== undefined) {
    config.loop.maxCycles = flags.maxCycles;
  }
  if (flags.stuckThreshold !== undefined) {
    config.loop.stuckThreshold = flags.stuckThreshold;
  }
  if (flags.checkpointFrequency !== undefined) {
    config.loop.checkpointFrequency = flags.checkpointFrequency;
  }
  if (flags.printLogs !== undefined) {
    config.runner.printLogs = flags.printLogs;
  }
  if (flags.logLevel !== undefined) {
    config.runner.logLevel = flags.logLevel;
  }
  if (flags.verbose) {
    config.runner.logLevel = "DEBUG";
  }
  if (flags.workingDir !== undefined) {
    config.opencode.directory = flags.workingDir;
  }
  if (flags.dryRun !== undefined) {}
  return config;
}
export {
  loadConfig
};

//# debugId=FC029B2DA563959A64756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9ub2Rlcy9pZGVudGl0eS5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3Zpc2l0LmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3QvZG9jL2RpcmVjdGl2ZXMuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9kb2MvYW5jaG9ycy5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L2RvYy9hcHBseVJldml2ZXIuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9ub2Rlcy90b0pTLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3Qvbm9kZXMvTm9kZS5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L25vZGVzL0FsaWFzLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3Qvbm9kZXMvU2NhbGFyLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3QvZG9jL2NyZWF0ZU5vZGUuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9ub2Rlcy9Db2xsZWN0aW9uLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3Qvc3RyaW5naWZ5L3N0cmluZ2lmeUNvbW1lbnQuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9zdHJpbmdpZnkvZm9sZEZsb3dMaW5lcy5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3N0cmluZ2lmeS9zdHJpbmdpZnlTdHJpbmcuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9zdHJpbmdpZnkvc3RyaW5naWZ5LmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3Qvc3RyaW5naWZ5L3N0cmluZ2lmeVBhaXIuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9sb2cuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9zY2hlbWEveWFtbC0xLjEvbWVyZ2UuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9ub2Rlcy9hZGRQYWlyVG9KU01hcC5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L25vZGVzL1BhaXIuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9zdHJpbmdpZnkvc3RyaW5naWZ5Q29sbGVjdGlvbi5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L25vZGVzL1lBTUxNYXAuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9zY2hlbWEvY29tbW9uL21hcC5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L25vZGVzL1lBTUxTZXEuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9zY2hlbWEvY29tbW9uL3NlcS5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3NjaGVtYS9jb21tb24vc3RyaW5nLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3Qvc2NoZW1hL2NvbW1vbi9udWxsLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3Qvc2NoZW1hL2NvcmUvYm9vbC5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3N0cmluZ2lmeS9zdHJpbmdpZnlOdW1iZXIuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9zY2hlbWEvY29yZS9mbG9hdC5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3NjaGVtYS9jb3JlL2ludC5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3NjaGVtYS9jb3JlL3NjaGVtYS5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3NjaGVtYS9qc29uL3NjaGVtYS5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3NjaGVtYS95YW1sLTEuMS9iaW5hcnkuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9zY2hlbWEveWFtbC0xLjEvcGFpcnMuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9zY2hlbWEveWFtbC0xLjEvb21hcC5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3NjaGVtYS95YW1sLTEuMS9ib29sLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3Qvc2NoZW1hL3lhbWwtMS4xL2Zsb2F0LmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3Qvc2NoZW1hL3lhbWwtMS4xL2ludC5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3NjaGVtYS95YW1sLTEuMS9zZXQuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9zY2hlbWEveWFtbC0xLjEvdGltZXN0YW1wLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3Qvc2NoZW1hL3lhbWwtMS4xL3NjaGVtYS5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3NjaGVtYS90YWdzLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3Qvc2NoZW1hL1NjaGVtYS5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3N0cmluZ2lmeS9zdHJpbmdpZnlEb2N1bWVudC5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L2RvYy9Eb2N1bWVudC5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L2Vycm9ycy5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L2NvbXBvc2UvcmVzb2x2ZS1wcm9wcy5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L2NvbXBvc2UvdXRpbC1jb250YWlucy1uZXdsaW5lLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3QvY29tcG9zZS91dGlsLWZsb3ctaW5kZW50LWNoZWNrLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3QvY29tcG9zZS91dGlsLW1hcC1pbmNsdWRlcy5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L2NvbXBvc2UvcmVzb2x2ZS1ibG9jay1tYXAuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9jb21wb3NlL3Jlc29sdmUtYmxvY2stc2VxLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3QvY29tcG9zZS9yZXNvbHZlLWVuZC5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L2NvbXBvc2UvcmVzb2x2ZS1mbG93LWNvbGxlY3Rpb24uanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9jb21wb3NlL2NvbXBvc2UtY29sbGVjdGlvbi5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L2NvbXBvc2UvcmVzb2x2ZS1ibG9jay1zY2FsYXIuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9jb21wb3NlL3Jlc29sdmUtZmxvdy1zY2FsYXIuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9jb21wb3NlL2NvbXBvc2Utc2NhbGFyLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3QvY29tcG9zZS91dGlsLWVtcHR5LXNjYWxhci1wb3NpdGlvbi5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L2NvbXBvc2UvY29tcG9zZS1ub2RlLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3QvY29tcG9zZS9jb21wb3NlLWRvYy5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L2NvbXBvc2UvY29tcG9zZXIuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9wYXJzZS9jc3Qtc2NhbGFyLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3QvcGFyc2UvY3N0LXN0cmluZ2lmeS5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3BhcnNlL2NzdC12aXNpdC5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3BhcnNlL2NzdC5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3BhcnNlL2xleGVyLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3QvcGFyc2UvbGluZS1jb3VudGVyLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3QvcGFyc2UvcGFyc2VyLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3QvcHVibGljLWFwaS5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L2luZGV4LmpzIiwgIi4uL3NyYy9jb25maWcvbG9hZENvbmZpZy50cyIsICIuLi9zcmMvY29uZmlnL3NjaGVtYS50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsKICAgICIndXNlIHN0cmljdCc7XG5cbmNvbnN0IEFMSUFTID0gU3ltYm9sLmZvcigneWFtbC5hbGlhcycpO1xuY29uc3QgRE9DID0gU3ltYm9sLmZvcigneWFtbC5kb2N1bWVudCcpO1xuY29uc3QgTUFQID0gU3ltYm9sLmZvcigneWFtbC5tYXAnKTtcbmNvbnN0IFBBSVIgPSBTeW1ib2wuZm9yKCd5YW1sLnBhaXInKTtcbmNvbnN0IFNDQUxBUiA9IFN5bWJvbC5mb3IoJ3lhbWwuc2NhbGFyJyk7XG5jb25zdCBTRVEgPSBTeW1ib2wuZm9yKCd5YW1sLnNlcScpO1xuY29uc3QgTk9ERV9UWVBFID0gU3ltYm9sLmZvcigneWFtbC5ub2RlLnR5cGUnKTtcbmNvbnN0IGlzQWxpYXMgPSAobm9kZSkgPT4gISFub2RlICYmIHR5cGVvZiBub2RlID09PSAnb2JqZWN0JyAmJiBub2RlW05PREVfVFlQRV0gPT09IEFMSUFTO1xuY29uc3QgaXNEb2N1bWVudCA9IChub2RlKSA9PiAhIW5vZGUgJiYgdHlwZW9mIG5vZGUgPT09ICdvYmplY3QnICYmIG5vZGVbTk9ERV9UWVBFXSA9PT0gRE9DO1xuY29uc3QgaXNNYXAgPSAobm9kZSkgPT4gISFub2RlICYmIHR5cGVvZiBub2RlID09PSAnb2JqZWN0JyAmJiBub2RlW05PREVfVFlQRV0gPT09IE1BUDtcbmNvbnN0IGlzUGFpciA9IChub2RlKSA9PiAhIW5vZGUgJiYgdHlwZW9mIG5vZGUgPT09ICdvYmplY3QnICYmIG5vZGVbTk9ERV9UWVBFXSA9PT0gUEFJUjtcbmNvbnN0IGlzU2NhbGFyID0gKG5vZGUpID0+ICEhbm9kZSAmJiB0eXBlb2Ygbm9kZSA9PT0gJ29iamVjdCcgJiYgbm9kZVtOT0RFX1RZUEVdID09PSBTQ0FMQVI7XG5jb25zdCBpc1NlcSA9IChub2RlKSA9PiAhIW5vZGUgJiYgdHlwZW9mIG5vZGUgPT09ICdvYmplY3QnICYmIG5vZGVbTk9ERV9UWVBFXSA9PT0gU0VRO1xuZnVuY3Rpb24gaXNDb2xsZWN0aW9uKG5vZGUpIHtcbiAgICBpZiAobm9kZSAmJiB0eXBlb2Ygbm9kZSA9PT0gJ29iamVjdCcpXG4gICAgICAgIHN3aXRjaCAobm9kZVtOT0RFX1RZUEVdKSB7XG4gICAgICAgICAgICBjYXNlIE1BUDpcbiAgICAgICAgICAgIGNhc2UgU0VROlxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuZnVuY3Rpb24gaXNOb2RlKG5vZGUpIHtcbiAgICBpZiAobm9kZSAmJiB0eXBlb2Ygbm9kZSA9PT0gJ29iamVjdCcpXG4gICAgICAgIHN3aXRjaCAobm9kZVtOT0RFX1RZUEVdKSB7XG4gICAgICAgICAgICBjYXNlIEFMSUFTOlxuICAgICAgICAgICAgY2FzZSBNQVA6XG4gICAgICAgICAgICBjYXNlIFNDQUxBUjpcbiAgICAgICAgICAgIGNhc2UgU0VROlxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuY29uc3QgaGFzQW5jaG9yID0gKG5vZGUpID0+IChpc1NjYWxhcihub2RlKSB8fCBpc0NvbGxlY3Rpb24obm9kZSkpICYmICEhbm9kZS5hbmNob3I7XG5cbmV4cG9ydHMuQUxJQVMgPSBBTElBUztcbmV4cG9ydHMuRE9DID0gRE9DO1xuZXhwb3J0cy5NQVAgPSBNQVA7XG5leHBvcnRzLk5PREVfVFlQRSA9IE5PREVfVFlQRTtcbmV4cG9ydHMuUEFJUiA9IFBBSVI7XG5leHBvcnRzLlNDQUxBUiA9IFNDQUxBUjtcbmV4cG9ydHMuU0VRID0gU0VRO1xuZXhwb3J0cy5oYXNBbmNob3IgPSBoYXNBbmNob3I7XG5leHBvcnRzLmlzQWxpYXMgPSBpc0FsaWFzO1xuZXhwb3J0cy5pc0NvbGxlY3Rpb24gPSBpc0NvbGxlY3Rpb247XG5leHBvcnRzLmlzRG9jdW1lbnQgPSBpc0RvY3VtZW50O1xuZXhwb3J0cy5pc01hcCA9IGlzTWFwO1xuZXhwb3J0cy5pc05vZGUgPSBpc05vZGU7XG5leHBvcnRzLmlzUGFpciA9IGlzUGFpcjtcbmV4cG9ydHMuaXNTY2FsYXIgPSBpc1NjYWxhcjtcbmV4cG9ydHMuaXNTZXEgPSBpc1NlcTtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuL25vZGVzL2lkZW50aXR5LmpzJyk7XG5cbmNvbnN0IEJSRUFLID0gU3ltYm9sKCdicmVhayB2aXNpdCcpO1xuY29uc3QgU0tJUCA9IFN5bWJvbCgnc2tpcCBjaGlsZHJlbicpO1xuY29uc3QgUkVNT1ZFID0gU3ltYm9sKCdyZW1vdmUgbm9kZScpO1xuLyoqXG4gKiBBcHBseSBhIHZpc2l0b3IgdG8gYW4gQVNUIG5vZGUgb3IgZG9jdW1lbnQuXG4gKlxuICogV2Fsa3MgdGhyb3VnaCB0aGUgdHJlZSAoZGVwdGgtZmlyc3QpIHN0YXJ0aW5nIGZyb20gYG5vZGVgLCBjYWxsaW5nIGFcbiAqIGB2aXNpdG9yYCBmdW5jdGlvbiB3aXRoIHRocmVlIGFyZ3VtZW50czpcbiAqICAgLSBga2V5YDogRm9yIHNlcXVlbmNlIHZhbHVlcyBhbmQgbWFwIGBQYWlyYCwgdGhlIG5vZGUncyBpbmRleCBpbiB0aGVcbiAqICAgICBjb2xsZWN0aW9uLiBXaXRoaW4gYSBgUGFpcmAsIGAna2V5J2Agb3IgYCd2YWx1ZSdgLCBjb3JyZXNwb25kaW5nbHkuXG4gKiAgICAgYG51bGxgIGZvciB0aGUgcm9vdCBub2RlLlxuICogICAtIGBub2RlYDogVGhlIGN1cnJlbnQgbm9kZS5cbiAqICAgLSBgcGF0aGA6IFRoZSBhbmNlc3RyeSBvZiB0aGUgY3VycmVudCBub2RlLlxuICpcbiAqIFRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIHZpc2l0b3IgbWF5IGJlIHVzZWQgdG8gY29udHJvbCB0aGUgdHJhdmVyc2FsOlxuICogICAtIGB1bmRlZmluZWRgIChkZWZhdWx0KTogRG8gbm90aGluZyBhbmQgY29udGludWVcbiAqICAgLSBgdmlzaXQuU0tJUGA6IERvIG5vdCB2aXNpdCB0aGUgY2hpbGRyZW4gb2YgdGhpcyBub2RlLCBjb250aW51ZSB3aXRoIG5leHRcbiAqICAgICBzaWJsaW5nXG4gKiAgIC0gYHZpc2l0LkJSRUFLYDogVGVybWluYXRlIHRyYXZlcnNhbCBjb21wbGV0ZWx5XG4gKiAgIC0gYHZpc2l0LlJFTU9WRWA6IFJlbW92ZSB0aGUgY3VycmVudCBub2RlLCB0aGVuIGNvbnRpbnVlIHdpdGggdGhlIG5leHQgb25lXG4gKiAgIC0gYE5vZGVgOiBSZXBsYWNlIHRoZSBjdXJyZW50IG5vZGUsIHRoZW4gY29udGludWUgYnkgdmlzaXRpbmcgaXRcbiAqICAgLSBgbnVtYmVyYDogV2hpbGUgaXRlcmF0aW5nIHRoZSBpdGVtcyBvZiBhIHNlcXVlbmNlIG9yIG1hcCwgc2V0IHRoZSBpbmRleFxuICogICAgIG9mIHRoZSBuZXh0IHN0ZXAuIFRoaXMgaXMgdXNlZnVsIGVzcGVjaWFsbHkgaWYgdGhlIGluZGV4IG9mIHRoZSBjdXJyZW50XG4gKiAgICAgbm9kZSBoYXMgY2hhbmdlZC5cbiAqXG4gKiBJZiBgdmlzaXRvcmAgaXMgYSBzaW5nbGUgZnVuY3Rpb24sIGl0IHdpbGwgYmUgY2FsbGVkIHdpdGggYWxsIHZhbHVlc1xuICogZW5jb3VudGVyZWQgaW4gdGhlIHRyZWUsIGluY2x1ZGluZyBlLmcuIGBudWxsYCB2YWx1ZXMuIEFsdGVybmF0aXZlbHksXG4gKiBzZXBhcmF0ZSB2aXNpdG9yIGZ1bmN0aW9ucyBtYXkgYmUgZGVmaW5lZCBmb3IgZWFjaCBgTWFwYCwgYFBhaXJgLCBgU2VxYCxcbiAqIGBBbGlhc2AgYW5kIGBTY2FsYXJgIG5vZGUuIFRvIGRlZmluZSB0aGUgc2FtZSB2aXNpdG9yIGZ1bmN0aW9uIGZvciBtb3JlIHRoYW5cbiAqIG9uZSBub2RlIHR5cGUsIHVzZSB0aGUgYENvbGxlY3Rpb25gIChtYXAgYW5kIHNlcSksIGBWYWx1ZWAgKG1hcCwgc2VxICYgc2NhbGFyKVxuICogYW5kIGBOb2RlYCAoYWxpYXMsIG1hcCwgc2VxICYgc2NhbGFyKSB0YXJnZXRzLiBPZiBhbGwgdGhlc2UsIG9ubHkgdGhlIG1vc3RcbiAqIHNwZWNpZmljIGRlZmluZWQgb25lIHdpbGwgYmUgdXNlZCBmb3IgZWFjaCBub2RlLlxuICovXG5mdW5jdGlvbiB2aXNpdChub2RlLCB2aXNpdG9yKSB7XG4gICAgY29uc3QgdmlzaXRvcl8gPSBpbml0VmlzaXRvcih2aXNpdG9yKTtcbiAgICBpZiAoaWRlbnRpdHkuaXNEb2N1bWVudChub2RlKSkge1xuICAgICAgICBjb25zdCBjZCA9IHZpc2l0XyhudWxsLCBub2RlLmNvbnRlbnRzLCB2aXNpdG9yXywgT2JqZWN0LmZyZWV6ZShbbm9kZV0pKTtcbiAgICAgICAgaWYgKGNkID09PSBSRU1PVkUpXG4gICAgICAgICAgICBub2RlLmNvbnRlbnRzID0gbnVsbDtcbiAgICB9XG4gICAgZWxzZVxuICAgICAgICB2aXNpdF8obnVsbCwgbm9kZSwgdmlzaXRvcl8sIE9iamVjdC5mcmVlemUoW10pKTtcbn1cbi8vIFdpdGhvdXQgdGhlIGBhcyBzeW1ib2xgIGNhc3RzLCBUUyBkZWNsYXJlcyB0aGVzZSBpbiB0aGUgYHZpc2l0YFxuLy8gbmFtZXNwYWNlIHVzaW5nIGB2YXJgLCBidXQgdGhlbiBjb21wbGFpbnMgYWJvdXQgdGhhdCBiZWNhdXNlXG4vLyBgdW5pcXVlIHN5bWJvbGAgbXVzdCBiZSBgY29uc3RgLlxuLyoqIFRlcm1pbmF0ZSB2aXNpdCB0cmF2ZXJzYWwgY29tcGxldGVseSAqL1xudmlzaXQuQlJFQUsgPSBCUkVBSztcbi8qKiBEbyBub3QgdmlzaXQgdGhlIGNoaWxkcmVuIG9mIHRoZSBjdXJyZW50IG5vZGUgKi9cbnZpc2l0LlNLSVAgPSBTS0lQO1xuLyoqIFJlbW92ZSB0aGUgY3VycmVudCBub2RlICovXG52aXNpdC5SRU1PVkUgPSBSRU1PVkU7XG5mdW5jdGlvbiB2aXNpdF8oa2V5LCBub2RlLCB2aXNpdG9yLCBwYXRoKSB7XG4gICAgY29uc3QgY3RybCA9IGNhbGxWaXNpdG9yKGtleSwgbm9kZSwgdmlzaXRvciwgcGF0aCk7XG4gICAgaWYgKGlkZW50aXR5LmlzTm9kZShjdHJsKSB8fCBpZGVudGl0eS5pc1BhaXIoY3RybCkpIHtcbiAgICAgICAgcmVwbGFjZU5vZGUoa2V5LCBwYXRoLCBjdHJsKTtcbiAgICAgICAgcmV0dXJuIHZpc2l0XyhrZXksIGN0cmwsIHZpc2l0b3IsIHBhdGgpO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGN0cmwgIT09ICdzeW1ib2wnKSB7XG4gICAgICAgIGlmIChpZGVudGl0eS5pc0NvbGxlY3Rpb24obm9kZSkpIHtcbiAgICAgICAgICAgIHBhdGggPSBPYmplY3QuZnJlZXplKHBhdGguY29uY2F0KG5vZGUpKTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZS5pdGVtcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNpID0gdmlzaXRfKGksIG5vZGUuaXRlbXNbaV0sIHZpc2l0b3IsIHBhdGgpO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY2kgPT09ICdudW1iZXInKVxuICAgICAgICAgICAgICAgICAgICBpID0gY2kgLSAxO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNpID09PSBCUkVBSylcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEJSRUFLO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNpID09PSBSRU1PVkUpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5pdGVtcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGkgLT0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaWRlbnRpdHkuaXNQYWlyKG5vZGUpKSB7XG4gICAgICAgICAgICBwYXRoID0gT2JqZWN0LmZyZWV6ZShwYXRoLmNvbmNhdChub2RlKSk7XG4gICAgICAgICAgICBjb25zdCBjayA9IHZpc2l0Xygna2V5Jywgbm9kZS5rZXksIHZpc2l0b3IsIHBhdGgpO1xuICAgICAgICAgICAgaWYgKGNrID09PSBCUkVBSylcbiAgICAgICAgICAgICAgICByZXR1cm4gQlJFQUs7XG4gICAgICAgICAgICBlbHNlIGlmIChjayA9PT0gUkVNT1ZFKVxuICAgICAgICAgICAgICAgIG5vZGUua2V5ID0gbnVsbDtcbiAgICAgICAgICAgIGNvbnN0IGN2ID0gdmlzaXRfKCd2YWx1ZScsIG5vZGUudmFsdWUsIHZpc2l0b3IsIHBhdGgpO1xuICAgICAgICAgICAgaWYgKGN2ID09PSBCUkVBSylcbiAgICAgICAgICAgICAgICByZXR1cm4gQlJFQUs7XG4gICAgICAgICAgICBlbHNlIGlmIChjdiA9PT0gUkVNT1ZFKVxuICAgICAgICAgICAgICAgIG5vZGUudmFsdWUgPSBudWxsO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjdHJsO1xufVxuLyoqXG4gKiBBcHBseSBhbiBhc3luYyB2aXNpdG9yIHRvIGFuIEFTVCBub2RlIG9yIGRvY3VtZW50LlxuICpcbiAqIFdhbGtzIHRocm91Z2ggdGhlIHRyZWUgKGRlcHRoLWZpcnN0KSBzdGFydGluZyBmcm9tIGBub2RlYCwgY2FsbGluZyBhXG4gKiBgdmlzaXRvcmAgZnVuY3Rpb24gd2l0aCB0aHJlZSBhcmd1bWVudHM6XG4gKiAgIC0gYGtleWA6IEZvciBzZXF1ZW5jZSB2YWx1ZXMgYW5kIG1hcCBgUGFpcmAsIHRoZSBub2RlJ3MgaW5kZXggaW4gdGhlXG4gKiAgICAgY29sbGVjdGlvbi4gV2l0aGluIGEgYFBhaXJgLCBgJ2tleSdgIG9yIGAndmFsdWUnYCwgY29ycmVzcG9uZGluZ2x5LlxuICogICAgIGBudWxsYCBmb3IgdGhlIHJvb3Qgbm9kZS5cbiAqICAgLSBgbm9kZWA6IFRoZSBjdXJyZW50IG5vZGUuXG4gKiAgIC0gYHBhdGhgOiBUaGUgYW5jZXN0cnkgb2YgdGhlIGN1cnJlbnQgbm9kZS5cbiAqXG4gKiBUaGUgcmV0dXJuIHZhbHVlIG9mIHRoZSB2aXNpdG9yIG1heSBiZSB1c2VkIHRvIGNvbnRyb2wgdGhlIHRyYXZlcnNhbDpcbiAqICAgLSBgUHJvbWlzZWA6IE11c3QgcmVzb2x2ZSB0byBvbmUgb2YgdGhlIGZvbGxvd2luZyB2YWx1ZXNcbiAqICAgLSBgdW5kZWZpbmVkYCAoZGVmYXVsdCk6IERvIG5vdGhpbmcgYW5kIGNvbnRpbnVlXG4gKiAgIC0gYHZpc2l0LlNLSVBgOiBEbyBub3QgdmlzaXQgdGhlIGNoaWxkcmVuIG9mIHRoaXMgbm9kZSwgY29udGludWUgd2l0aCBuZXh0XG4gKiAgICAgc2libGluZ1xuICogICAtIGB2aXNpdC5CUkVBS2A6IFRlcm1pbmF0ZSB0cmF2ZXJzYWwgY29tcGxldGVseVxuICogICAtIGB2aXNpdC5SRU1PVkVgOiBSZW1vdmUgdGhlIGN1cnJlbnQgbm9kZSwgdGhlbiBjb250aW51ZSB3aXRoIHRoZSBuZXh0IG9uZVxuICogICAtIGBOb2RlYDogUmVwbGFjZSB0aGUgY3VycmVudCBub2RlLCB0aGVuIGNvbnRpbnVlIGJ5IHZpc2l0aW5nIGl0XG4gKiAgIC0gYG51bWJlcmA6IFdoaWxlIGl0ZXJhdGluZyB0aGUgaXRlbXMgb2YgYSBzZXF1ZW5jZSBvciBtYXAsIHNldCB0aGUgaW5kZXhcbiAqICAgICBvZiB0aGUgbmV4dCBzdGVwLiBUaGlzIGlzIHVzZWZ1bCBlc3BlY2lhbGx5IGlmIHRoZSBpbmRleCBvZiB0aGUgY3VycmVudFxuICogICAgIG5vZGUgaGFzIGNoYW5nZWQuXG4gKlxuICogSWYgYHZpc2l0b3JgIGlzIGEgc2luZ2xlIGZ1bmN0aW9uLCBpdCB3aWxsIGJlIGNhbGxlZCB3aXRoIGFsbCB2YWx1ZXNcbiAqIGVuY291bnRlcmVkIGluIHRoZSB0cmVlLCBpbmNsdWRpbmcgZS5nLiBgbnVsbGAgdmFsdWVzLiBBbHRlcm5hdGl2ZWx5LFxuICogc2VwYXJhdGUgdmlzaXRvciBmdW5jdGlvbnMgbWF5IGJlIGRlZmluZWQgZm9yIGVhY2ggYE1hcGAsIGBQYWlyYCwgYFNlcWAsXG4gKiBgQWxpYXNgIGFuZCBgU2NhbGFyYCBub2RlLiBUbyBkZWZpbmUgdGhlIHNhbWUgdmlzaXRvciBmdW5jdGlvbiBmb3IgbW9yZSB0aGFuXG4gKiBvbmUgbm9kZSB0eXBlLCB1c2UgdGhlIGBDb2xsZWN0aW9uYCAobWFwIGFuZCBzZXEpLCBgVmFsdWVgIChtYXAsIHNlcSAmIHNjYWxhcilcbiAqIGFuZCBgTm9kZWAgKGFsaWFzLCBtYXAsIHNlcSAmIHNjYWxhcikgdGFyZ2V0cy4gT2YgYWxsIHRoZXNlLCBvbmx5IHRoZSBtb3N0XG4gKiBzcGVjaWZpYyBkZWZpbmVkIG9uZSB3aWxsIGJlIHVzZWQgZm9yIGVhY2ggbm9kZS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gdmlzaXRBc3luYyhub2RlLCB2aXNpdG9yKSB7XG4gICAgY29uc3QgdmlzaXRvcl8gPSBpbml0VmlzaXRvcih2aXNpdG9yKTtcbiAgICBpZiAoaWRlbnRpdHkuaXNEb2N1bWVudChub2RlKSkge1xuICAgICAgICBjb25zdCBjZCA9IGF3YWl0IHZpc2l0QXN5bmNfKG51bGwsIG5vZGUuY29udGVudHMsIHZpc2l0b3JfLCBPYmplY3QuZnJlZXplKFtub2RlXSkpO1xuICAgICAgICBpZiAoY2QgPT09IFJFTU9WRSlcbiAgICAgICAgICAgIG5vZGUuY29udGVudHMgPSBudWxsO1xuICAgIH1cbiAgICBlbHNlXG4gICAgICAgIGF3YWl0IHZpc2l0QXN5bmNfKG51bGwsIG5vZGUsIHZpc2l0b3JfLCBPYmplY3QuZnJlZXplKFtdKSk7XG59XG4vLyBXaXRob3V0IHRoZSBgYXMgc3ltYm9sYCBjYXN0cywgVFMgZGVjbGFyZXMgdGhlc2UgaW4gdGhlIGB2aXNpdGBcbi8vIG5hbWVzcGFjZSB1c2luZyBgdmFyYCwgYnV0IHRoZW4gY29tcGxhaW5zIGFib3V0IHRoYXQgYmVjYXVzZVxuLy8gYHVuaXF1ZSBzeW1ib2xgIG11c3QgYmUgYGNvbnN0YC5cbi8qKiBUZXJtaW5hdGUgdmlzaXQgdHJhdmVyc2FsIGNvbXBsZXRlbHkgKi9cbnZpc2l0QXN5bmMuQlJFQUsgPSBCUkVBSztcbi8qKiBEbyBub3QgdmlzaXQgdGhlIGNoaWxkcmVuIG9mIHRoZSBjdXJyZW50IG5vZGUgKi9cbnZpc2l0QXN5bmMuU0tJUCA9IFNLSVA7XG4vKiogUmVtb3ZlIHRoZSBjdXJyZW50IG5vZGUgKi9cbnZpc2l0QXN5bmMuUkVNT1ZFID0gUkVNT1ZFO1xuYXN5bmMgZnVuY3Rpb24gdmlzaXRBc3luY18oa2V5LCBub2RlLCB2aXNpdG9yLCBwYXRoKSB7XG4gICAgY29uc3QgY3RybCA9IGF3YWl0IGNhbGxWaXNpdG9yKGtleSwgbm9kZSwgdmlzaXRvciwgcGF0aCk7XG4gICAgaWYgKGlkZW50aXR5LmlzTm9kZShjdHJsKSB8fCBpZGVudGl0eS5pc1BhaXIoY3RybCkpIHtcbiAgICAgICAgcmVwbGFjZU5vZGUoa2V5LCBwYXRoLCBjdHJsKTtcbiAgICAgICAgcmV0dXJuIHZpc2l0QXN5bmNfKGtleSwgY3RybCwgdmlzaXRvciwgcGF0aCk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgY3RybCAhPT0gJ3N5bWJvbCcpIHtcbiAgICAgICAgaWYgKGlkZW50aXR5LmlzQ29sbGVjdGlvbihub2RlKSkge1xuICAgICAgICAgICAgcGF0aCA9IE9iamVjdC5mcmVlemUocGF0aC5jb25jYXQobm9kZSkpO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2RlLml0ZW1zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2kgPSBhd2FpdCB2aXNpdEFzeW5jXyhpLCBub2RlLml0ZW1zW2ldLCB2aXNpdG9yLCBwYXRoKTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNpID09PSAnbnVtYmVyJylcbiAgICAgICAgICAgICAgICAgICAgaSA9IGNpIC0gMTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChjaSA9PT0gQlJFQUspXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBCUkVBSztcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChjaSA9PT0gUkVNT1ZFKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUuaXRlbXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICBpIC09IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGlkZW50aXR5LmlzUGFpcihub2RlKSkge1xuICAgICAgICAgICAgcGF0aCA9IE9iamVjdC5mcmVlemUocGF0aC5jb25jYXQobm9kZSkpO1xuICAgICAgICAgICAgY29uc3QgY2sgPSBhd2FpdCB2aXNpdEFzeW5jXygna2V5Jywgbm9kZS5rZXksIHZpc2l0b3IsIHBhdGgpO1xuICAgICAgICAgICAgaWYgKGNrID09PSBCUkVBSylcbiAgICAgICAgICAgICAgICByZXR1cm4gQlJFQUs7XG4gICAgICAgICAgICBlbHNlIGlmIChjayA9PT0gUkVNT1ZFKVxuICAgICAgICAgICAgICAgIG5vZGUua2V5ID0gbnVsbDtcbiAgICAgICAgICAgIGNvbnN0IGN2ID0gYXdhaXQgdmlzaXRBc3luY18oJ3ZhbHVlJywgbm9kZS52YWx1ZSwgdmlzaXRvciwgcGF0aCk7XG4gICAgICAgICAgICBpZiAoY3YgPT09IEJSRUFLKVxuICAgICAgICAgICAgICAgIHJldHVybiBCUkVBSztcbiAgICAgICAgICAgIGVsc2UgaWYgKGN2ID09PSBSRU1PVkUpXG4gICAgICAgICAgICAgICAgbm9kZS52YWx1ZSA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGN0cmw7XG59XG5mdW5jdGlvbiBpbml0VmlzaXRvcih2aXNpdG9yKSB7XG4gICAgaWYgKHR5cGVvZiB2aXNpdG9yID09PSAnb2JqZWN0JyAmJlxuICAgICAgICAodmlzaXRvci5Db2xsZWN0aW9uIHx8IHZpc2l0b3IuTm9kZSB8fCB2aXNpdG9yLlZhbHVlKSkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICBBbGlhczogdmlzaXRvci5Ob2RlLFxuICAgICAgICAgICAgTWFwOiB2aXNpdG9yLk5vZGUsXG4gICAgICAgICAgICBTY2FsYXI6IHZpc2l0b3IuTm9kZSxcbiAgICAgICAgICAgIFNlcTogdmlzaXRvci5Ob2RlXG4gICAgICAgIH0sIHZpc2l0b3IuVmFsdWUgJiYge1xuICAgICAgICAgICAgTWFwOiB2aXNpdG9yLlZhbHVlLFxuICAgICAgICAgICAgU2NhbGFyOiB2aXNpdG9yLlZhbHVlLFxuICAgICAgICAgICAgU2VxOiB2aXNpdG9yLlZhbHVlXG4gICAgICAgIH0sIHZpc2l0b3IuQ29sbGVjdGlvbiAmJiB7XG4gICAgICAgICAgICBNYXA6IHZpc2l0b3IuQ29sbGVjdGlvbixcbiAgICAgICAgICAgIFNlcTogdmlzaXRvci5Db2xsZWN0aW9uXG4gICAgICAgIH0sIHZpc2l0b3IpO1xuICAgIH1cbiAgICByZXR1cm4gdmlzaXRvcjtcbn1cbmZ1bmN0aW9uIGNhbGxWaXNpdG9yKGtleSwgbm9kZSwgdmlzaXRvciwgcGF0aCkge1xuICAgIGlmICh0eXBlb2YgdmlzaXRvciA9PT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgcmV0dXJuIHZpc2l0b3Ioa2V5LCBub2RlLCBwYXRoKTtcbiAgICBpZiAoaWRlbnRpdHkuaXNNYXAobm9kZSkpXG4gICAgICAgIHJldHVybiB2aXNpdG9yLk1hcD8uKGtleSwgbm9kZSwgcGF0aCk7XG4gICAgaWYgKGlkZW50aXR5LmlzU2VxKG5vZGUpKVxuICAgICAgICByZXR1cm4gdmlzaXRvci5TZXE/LihrZXksIG5vZGUsIHBhdGgpO1xuICAgIGlmIChpZGVudGl0eS5pc1BhaXIobm9kZSkpXG4gICAgICAgIHJldHVybiB2aXNpdG9yLlBhaXI/LihrZXksIG5vZGUsIHBhdGgpO1xuICAgIGlmIChpZGVudGl0eS5pc1NjYWxhcihub2RlKSlcbiAgICAgICAgcmV0dXJuIHZpc2l0b3IuU2NhbGFyPy4oa2V5LCBub2RlLCBwYXRoKTtcbiAgICBpZiAoaWRlbnRpdHkuaXNBbGlhcyhub2RlKSlcbiAgICAgICAgcmV0dXJuIHZpc2l0b3IuQWxpYXM/LihrZXksIG5vZGUsIHBhdGgpO1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG59XG5mdW5jdGlvbiByZXBsYWNlTm9kZShrZXksIHBhdGgsIG5vZGUpIHtcbiAgICBjb25zdCBwYXJlbnQgPSBwYXRoW3BhdGgubGVuZ3RoIC0gMV07XG4gICAgaWYgKGlkZW50aXR5LmlzQ29sbGVjdGlvbihwYXJlbnQpKSB7XG4gICAgICAgIHBhcmVudC5pdGVtc1trZXldID0gbm9kZTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaWRlbnRpdHkuaXNQYWlyKHBhcmVudCkpIHtcbiAgICAgICAgaWYgKGtleSA9PT0gJ2tleScpXG4gICAgICAgICAgICBwYXJlbnQua2V5ID0gbm9kZTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcGFyZW50LnZhbHVlID0gbm9kZTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaWRlbnRpdHkuaXNEb2N1bWVudChwYXJlbnQpKSB7XG4gICAgICAgIHBhcmVudC5jb250ZW50cyA9IG5vZGU7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjb25zdCBwdCA9IGlkZW50aXR5LmlzQWxpYXMocGFyZW50KSA/ICdhbGlhcycgOiAnc2NhbGFyJztcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW5ub3QgcmVwbGFjZSBub2RlIHdpdGggJHtwdH0gcGFyZW50YCk7XG4gICAgfVxufVxuXG5leHBvcnRzLnZpc2l0ID0gdmlzaXQ7XG5leHBvcnRzLnZpc2l0QXN5bmMgPSB2aXNpdEFzeW5jO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBpZGVudGl0eSA9IHJlcXVpcmUoJy4uL25vZGVzL2lkZW50aXR5LmpzJyk7XG52YXIgdmlzaXQgPSByZXF1aXJlKCcuLi92aXNpdC5qcycpO1xuXG5jb25zdCBlc2NhcGVDaGFycyA9IHtcbiAgICAnISc6ICclMjEnLFxuICAgICcsJzogJyUyQycsXG4gICAgJ1snOiAnJTVCJyxcbiAgICAnXSc6ICclNUQnLFxuICAgICd7JzogJyU3QicsXG4gICAgJ30nOiAnJTdEJ1xufTtcbmNvbnN0IGVzY2FwZVRhZ05hbWUgPSAodG4pID0+IHRuLnJlcGxhY2UoL1shLFtcXF17fV0vZywgY2ggPT4gZXNjYXBlQ2hhcnNbY2hdKTtcbmNsYXNzIERpcmVjdGl2ZXMge1xuICAgIGNvbnN0cnVjdG9yKHlhbWwsIHRhZ3MpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSBkaXJlY3RpdmVzLWVuZC9kb2Mtc3RhcnQgbWFya2VyIGAtLS1gLiBJZiBgbnVsbGAsIGEgbWFya2VyIG1heSBzdGlsbCBiZVxuICAgICAgICAgKiBpbmNsdWRlZCBpbiB0aGUgZG9jdW1lbnQncyBzdHJpbmdpZmllZCByZXByZXNlbnRhdGlvbi5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZG9jU3RhcnQgPSBudWxsO1xuICAgICAgICAvKiogVGhlIGRvYy1lbmQgbWFya2VyIGAuLi5gLiAgKi9cbiAgICAgICAgdGhpcy5kb2NFbmQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy55YW1sID0gT2JqZWN0LmFzc2lnbih7fSwgRGlyZWN0aXZlcy5kZWZhdWx0WWFtbCwgeWFtbCk7XG4gICAgICAgIHRoaXMudGFncyA9IE9iamVjdC5hc3NpZ24oe30sIERpcmVjdGl2ZXMuZGVmYXVsdFRhZ3MsIHRhZ3MpO1xuICAgIH1cbiAgICBjbG9uZSgpIHtcbiAgICAgICAgY29uc3QgY29weSA9IG5ldyBEaXJlY3RpdmVzKHRoaXMueWFtbCwgdGhpcy50YWdzKTtcbiAgICAgICAgY29weS5kb2NTdGFydCA9IHRoaXMuZG9jU3RhcnQ7XG4gICAgICAgIHJldHVybiBjb3B5O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBEdXJpbmcgcGFyc2luZywgZ2V0IGEgRGlyZWN0aXZlcyBpbnN0YW5jZSBmb3IgdGhlIGN1cnJlbnQgZG9jdW1lbnQgYW5kXG4gICAgICogdXBkYXRlIHRoZSBzdHJlYW0gc3RhdGUgYWNjb3JkaW5nIHRvIHRoZSBjdXJyZW50IHZlcnNpb24ncyBzcGVjLlxuICAgICAqL1xuICAgIGF0RG9jdW1lbnQoKSB7XG4gICAgICAgIGNvbnN0IHJlcyA9IG5ldyBEaXJlY3RpdmVzKHRoaXMueWFtbCwgdGhpcy50YWdzKTtcbiAgICAgICAgc3dpdGNoICh0aGlzLnlhbWwudmVyc2lvbikge1xuICAgICAgICAgICAgY2FzZSAnMS4xJzpcbiAgICAgICAgICAgICAgICB0aGlzLmF0TmV4dERvY3VtZW50ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJzEuMic6XG4gICAgICAgICAgICAgICAgdGhpcy5hdE5leHREb2N1bWVudCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMueWFtbCA9IHtcbiAgICAgICAgICAgICAgICAgICAgZXhwbGljaXQ6IERpcmVjdGl2ZXMuZGVmYXVsdFlhbWwuZXhwbGljaXQsXG4gICAgICAgICAgICAgICAgICAgIHZlcnNpb246ICcxLjInXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0aGlzLnRhZ3MgPSBPYmplY3QuYXNzaWduKHt9LCBEaXJlY3RpdmVzLmRlZmF1bHRUYWdzKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBAcGFyYW0gb25FcnJvciAtIE1heSBiZSBjYWxsZWQgZXZlbiBpZiB0aGUgYWN0aW9uIHdhcyBzdWNjZXNzZnVsXG4gICAgICogQHJldHVybnMgYHRydWVgIG9uIHN1Y2Nlc3NcbiAgICAgKi9cbiAgICBhZGQobGluZSwgb25FcnJvcikge1xuICAgICAgICBpZiAodGhpcy5hdE5leHREb2N1bWVudCkge1xuICAgICAgICAgICAgdGhpcy55YW1sID0geyBleHBsaWNpdDogRGlyZWN0aXZlcy5kZWZhdWx0WWFtbC5leHBsaWNpdCwgdmVyc2lvbjogJzEuMScgfTtcbiAgICAgICAgICAgIHRoaXMudGFncyA9IE9iamVjdC5hc3NpZ24oe30sIERpcmVjdGl2ZXMuZGVmYXVsdFRhZ3MpO1xuICAgICAgICAgICAgdGhpcy5hdE5leHREb2N1bWVudCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBhcnRzID0gbGluZS50cmltKCkuc3BsaXQoL1sgXFx0XSsvKTtcbiAgICAgICAgY29uc3QgbmFtZSA9IHBhcnRzLnNoaWZ0KCk7XG4gICAgICAgIHN3aXRjaCAobmFtZSkge1xuICAgICAgICAgICAgY2FzZSAnJVRBRyc6IHtcbiAgICAgICAgICAgICAgICBpZiAocGFydHMubGVuZ3RoICE9PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IoMCwgJyVUQUcgZGlyZWN0aXZlIHNob3VsZCBjb250YWluIGV4YWN0bHkgdHdvIHBhcnRzJyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPCAyKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBbaGFuZGxlLCBwcmVmaXhdID0gcGFydHM7XG4gICAgICAgICAgICAgICAgdGhpcy50YWdzW2hhbmRsZV0gPSBwcmVmaXg7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlICclWUFNTCc6IHtcbiAgICAgICAgICAgICAgICB0aGlzLnlhbWwuZXhwbGljaXQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGlmIChwYXJ0cy5sZW5ndGggIT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcigwLCAnJVlBTUwgZGlyZWN0aXZlIHNob3VsZCBjb250YWluIGV4YWN0bHkgb25lIHBhcnQnKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBbdmVyc2lvbl0gPSBwYXJ0cztcbiAgICAgICAgICAgICAgICBpZiAodmVyc2lvbiA9PT0gJzEuMScgfHwgdmVyc2lvbiA9PT0gJzEuMicpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy55YW1sLnZlcnNpb24gPSB2ZXJzaW9uO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGlzVmFsaWQgPSAvXlxcZCtcXC5cXGQrJC8udGVzdCh2ZXJzaW9uKTtcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcig2LCBgVW5zdXBwb3J0ZWQgWUFNTCB2ZXJzaW9uICR7dmVyc2lvbn1gLCBpc1ZhbGlkKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgb25FcnJvcigwLCBgVW5rbm93biBkaXJlY3RpdmUgJHtuYW1lfWAsIHRydWUpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXNvbHZlcyBhIHRhZywgbWF0Y2hpbmcgaGFuZGxlcyB0byB0aG9zZSBkZWZpbmVkIGluICVUQUcgZGlyZWN0aXZlcy5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIFJlc29sdmVkIHRhZywgd2hpY2ggbWF5IGFsc28gYmUgdGhlIG5vbi1zcGVjaWZpYyB0YWcgYCchJ2Agb3IgYVxuICAgICAqICAgYCchbG9jYWwnYCB0YWcsIG9yIGBudWxsYCBpZiB1bnJlc29sdmFibGUuXG4gICAgICovXG4gICAgdGFnTmFtZShzb3VyY2UsIG9uRXJyb3IpIHtcbiAgICAgICAgaWYgKHNvdXJjZSA9PT0gJyEnKVxuICAgICAgICAgICAgcmV0dXJuICchJzsgLy8gbm9uLXNwZWNpZmljIHRhZ1xuICAgICAgICBpZiAoc291cmNlWzBdICE9PSAnIScpIHtcbiAgICAgICAgICAgIG9uRXJyb3IoYE5vdCBhIHZhbGlkIHRhZzogJHtzb3VyY2V9YCk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc291cmNlWzFdID09PSAnPCcpIHtcbiAgICAgICAgICAgIGNvbnN0IHZlcmJhdGltID0gc291cmNlLnNsaWNlKDIsIC0xKTtcbiAgICAgICAgICAgIGlmICh2ZXJiYXRpbSA9PT0gJyEnIHx8IHZlcmJhdGltID09PSAnISEnKSB7XG4gICAgICAgICAgICAgICAgb25FcnJvcihgVmVyYmF0aW0gdGFncyBhcmVuJ3QgcmVzb2x2ZWQsIHNvICR7c291cmNlfSBpcyBpbnZhbGlkLmApO1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNvdXJjZVtzb3VyY2UubGVuZ3RoIC0gMV0gIT09ICc+JylcbiAgICAgICAgICAgICAgICBvbkVycm9yKCdWZXJiYXRpbSB0YWdzIG11c3QgZW5kIHdpdGggYSA+Jyk7XG4gICAgICAgICAgICByZXR1cm4gdmVyYmF0aW07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgWywgaGFuZGxlLCBzdWZmaXhdID0gc291cmNlLm1hdGNoKC9eKC4qISkoW14hXSopJC9zKTtcbiAgICAgICAgaWYgKCFzdWZmaXgpXG4gICAgICAgICAgICBvbkVycm9yKGBUaGUgJHtzb3VyY2V9IHRhZyBoYXMgbm8gc3VmZml4YCk7XG4gICAgICAgIGNvbnN0IHByZWZpeCA9IHRoaXMudGFnc1toYW5kbGVdO1xuICAgICAgICBpZiAocHJlZml4KSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcmVmaXggKyBkZWNvZGVVUklDb21wb25lbnQoc3VmZml4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIG9uRXJyb3IoU3RyaW5nKGVycm9yKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGhhbmRsZSA9PT0gJyEnKVxuICAgICAgICAgICAgcmV0dXJuIHNvdXJjZTsgLy8gbG9jYWwgdGFnXG4gICAgICAgIG9uRXJyb3IoYENvdWxkIG5vdCByZXNvbHZlIHRhZzogJHtzb3VyY2V9YCk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHaXZlbiBhIGZ1bGx5IHJlc29sdmVkIHRhZywgcmV0dXJucyBpdHMgcHJpbnRhYmxlIHN0cmluZyBmb3JtLFxuICAgICAqIHRha2luZyBpbnRvIGFjY291bnQgY3VycmVudCB0YWcgcHJlZml4ZXMgYW5kIGRlZmF1bHRzLlxuICAgICAqL1xuICAgIHRhZ1N0cmluZyh0YWcpIHtcbiAgICAgICAgZm9yIChjb25zdCBbaGFuZGxlLCBwcmVmaXhdIG9mIE9iamVjdC5lbnRyaWVzKHRoaXMudGFncykpIHtcbiAgICAgICAgICAgIGlmICh0YWcuc3RhcnRzV2l0aChwcmVmaXgpKVxuICAgICAgICAgICAgICAgIHJldHVybiBoYW5kbGUgKyBlc2NhcGVUYWdOYW1lKHRhZy5zdWJzdHJpbmcocHJlZml4Lmxlbmd0aCkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0YWdbMF0gPT09ICchJyA/IHRhZyA6IGAhPCR7dGFnfT5gO1xuICAgIH1cbiAgICB0b1N0cmluZyhkb2MpIHtcbiAgICAgICAgY29uc3QgbGluZXMgPSB0aGlzLnlhbWwuZXhwbGljaXRcbiAgICAgICAgICAgID8gW2AlWUFNTCAke3RoaXMueWFtbC52ZXJzaW9uIHx8ICcxLjInfWBdXG4gICAgICAgICAgICA6IFtdO1xuICAgICAgICBjb25zdCB0YWdFbnRyaWVzID0gT2JqZWN0LmVudHJpZXModGhpcy50YWdzKTtcbiAgICAgICAgbGV0IHRhZ05hbWVzO1xuICAgICAgICBpZiAoZG9jICYmIHRhZ0VudHJpZXMubGVuZ3RoID4gMCAmJiBpZGVudGl0eS5pc05vZGUoZG9jLmNvbnRlbnRzKSkge1xuICAgICAgICAgICAgY29uc3QgdGFncyA9IHt9O1xuICAgICAgICAgICAgdmlzaXQudmlzaXQoZG9jLmNvbnRlbnRzLCAoX2tleSwgbm9kZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChpZGVudGl0eS5pc05vZGUobm9kZSkgJiYgbm9kZS50YWcpXG4gICAgICAgICAgICAgICAgICAgIHRhZ3Nbbm9kZS50YWddID0gdHJ1ZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGFnTmFtZXMgPSBPYmplY3Qua2V5cyh0YWdzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0YWdOYW1lcyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IFtoYW5kbGUsIHByZWZpeF0gb2YgdGFnRW50cmllcykge1xuICAgICAgICAgICAgaWYgKGhhbmRsZSA9PT0gJyEhJyAmJiBwcmVmaXggPT09ICd0YWc6eWFtbC5vcmcsMjAwMjonKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgaWYgKCFkb2MgfHwgdGFnTmFtZXMuc29tZSh0biA9PiB0bi5zdGFydHNXaXRoKHByZWZpeCkpKVxuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goYCVUQUcgJHtoYW5kbGV9ICR7cHJlZml4fWApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsaW5lcy5qb2luKCdcXG4nKTtcbiAgICB9XG59XG5EaXJlY3RpdmVzLmRlZmF1bHRZYW1sID0geyBleHBsaWNpdDogZmFsc2UsIHZlcnNpb246ICcxLjInIH07XG5EaXJlY3RpdmVzLmRlZmF1bHRUYWdzID0geyAnISEnOiAndGFnOnlhbWwub3JnLDIwMDI6JyB9O1xuXG5leHBvcnRzLkRpcmVjdGl2ZXMgPSBEaXJlY3RpdmVzO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBpZGVudGl0eSA9IHJlcXVpcmUoJy4uL25vZGVzL2lkZW50aXR5LmpzJyk7XG52YXIgdmlzaXQgPSByZXF1aXJlKCcuLi92aXNpdC5qcycpO1xuXG4vKipcbiAqIFZlcmlmeSB0aGF0IHRoZSBpbnB1dCBzdHJpbmcgaXMgYSB2YWxpZCBhbmNob3IuXG4gKlxuICogV2lsbCB0aHJvdyBvbiBlcnJvcnMuXG4gKi9cbmZ1bmN0aW9uIGFuY2hvcklzVmFsaWQoYW5jaG9yKSB7XG4gICAgaWYgKC9bXFx4MDAtXFx4MTlcXHMsW1xcXXt9XS8udGVzdChhbmNob3IpKSB7XG4gICAgICAgIGNvbnN0IHNhID0gSlNPTi5zdHJpbmdpZnkoYW5jaG9yKTtcbiAgICAgICAgY29uc3QgbXNnID0gYEFuY2hvciBtdXN0IG5vdCBjb250YWluIHdoaXRlc3BhY2Ugb3IgY29udHJvbCBjaGFyYWN0ZXJzOiAke3NhfWA7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn1cbmZ1bmN0aW9uIGFuY2hvck5hbWVzKHJvb3QpIHtcbiAgICBjb25zdCBhbmNob3JzID0gbmV3IFNldCgpO1xuICAgIHZpc2l0LnZpc2l0KHJvb3QsIHtcbiAgICAgICAgVmFsdWUoX2tleSwgbm9kZSkge1xuICAgICAgICAgICAgaWYgKG5vZGUuYW5jaG9yKVxuICAgICAgICAgICAgICAgIGFuY2hvcnMuYWRkKG5vZGUuYW5jaG9yKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBhbmNob3JzO1xufVxuLyoqIEZpbmQgYSBuZXcgYW5jaG9yIG5hbWUgd2l0aCB0aGUgZ2l2ZW4gYHByZWZpeGAgYW5kIGEgb25lLWluZGV4ZWQgc3VmZml4LiAqL1xuZnVuY3Rpb24gZmluZE5ld0FuY2hvcihwcmVmaXgsIGV4Y2x1ZGUpIHtcbiAgICBmb3IgKGxldCBpID0gMTsgdHJ1ZTsgKytpKSB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBgJHtwcmVmaXh9JHtpfWA7XG4gICAgICAgIGlmICghZXhjbHVkZS5oYXMobmFtZSkpXG4gICAgICAgICAgICByZXR1cm4gbmFtZTtcbiAgICB9XG59XG5mdW5jdGlvbiBjcmVhdGVOb2RlQW5jaG9ycyhkb2MsIHByZWZpeCkge1xuICAgIGNvbnN0IGFsaWFzT2JqZWN0cyA9IFtdO1xuICAgIGNvbnN0IHNvdXJjZU9iamVjdHMgPSBuZXcgTWFwKCk7XG4gICAgbGV0IHByZXZBbmNob3JzID0gbnVsbDtcbiAgICByZXR1cm4ge1xuICAgICAgICBvbkFuY2hvcjogKHNvdXJjZSkgPT4ge1xuICAgICAgICAgICAgYWxpYXNPYmplY3RzLnB1c2goc291cmNlKTtcbiAgICAgICAgICAgIHByZXZBbmNob3JzID8/IChwcmV2QW5jaG9ycyA9IGFuY2hvck5hbWVzKGRvYykpO1xuICAgICAgICAgICAgY29uc3QgYW5jaG9yID0gZmluZE5ld0FuY2hvcihwcmVmaXgsIHByZXZBbmNob3JzKTtcbiAgICAgICAgICAgIHByZXZBbmNob3JzLmFkZChhbmNob3IpO1xuICAgICAgICAgICAgcmV0dXJuIGFuY2hvcjtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdpdGggY2lyY3VsYXIgcmVmZXJlbmNlcywgdGhlIHNvdXJjZSBub2RlIGlzIG9ubHkgcmVzb2x2ZWQgYWZ0ZXIgYWxsXG4gICAgICAgICAqIG9mIGl0cyBjaGlsZCBub2RlcyBhcmUuIFRoaXMgaXMgd2h5IGFuY2hvcnMgYXJlIHNldCBvbmx5IGFmdGVyIGFsbCBvZlxuICAgICAgICAgKiB0aGUgbm9kZXMgaGF2ZSBiZWVuIGNyZWF0ZWQuXG4gICAgICAgICAqL1xuICAgICAgICBzZXRBbmNob3JzOiAoKSA9PiB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHNvdXJjZSBvZiBhbGlhc09iamVjdHMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZWYgPSBzb3VyY2VPYmplY3RzLmdldChzb3VyY2UpO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcmVmID09PSAnb2JqZWN0JyAmJlxuICAgICAgICAgICAgICAgICAgICByZWYuYW5jaG9yICYmXG4gICAgICAgICAgICAgICAgICAgIChpZGVudGl0eS5pc1NjYWxhcihyZWYubm9kZSkgfHwgaWRlbnRpdHkuaXNDb2xsZWN0aW9uKHJlZi5ub2RlKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVmLm5vZGUuYW5jaG9yID0gcmVmLmFuY2hvcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yID0gbmV3IEVycm9yKCdGYWlsZWQgdG8gcmVzb2x2ZSByZXBlYXRlZCBvYmplY3QgKHRoaXMgc2hvdWxkIG5vdCBoYXBwZW4pJyk7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yLnNvdXJjZSA9IHNvdXJjZTtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBzb3VyY2VPYmplY3RzXG4gICAgfTtcbn1cblxuZXhwb3J0cy5hbmNob3JJc1ZhbGlkID0gYW5jaG9ySXNWYWxpZDtcbmV4cG9ydHMuYW5jaG9yTmFtZXMgPSBhbmNob3JOYW1lcztcbmV4cG9ydHMuY3JlYXRlTm9kZUFuY2hvcnMgPSBjcmVhdGVOb2RlQW5jaG9ycztcbmV4cG9ydHMuZmluZE5ld0FuY2hvciA9IGZpbmROZXdBbmNob3I7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBBcHBsaWVzIHRoZSBKU09OLnBhcnNlIHJldml2ZXIgYWxnb3JpdGhtIGFzIGRlZmluZWQgaW4gdGhlIEVDTUEtMjYyIHNwZWMsXG4gKiBpbiBzZWN0aW9uIDI0LjUuMS4xIFwiUnVudGltZSBTZW1hbnRpY3M6IEludGVybmFsaXplSlNPTlByb3BlcnR5XCIgb2YgdGhlXG4gKiAyMDIxIGVkaXRpb246IGh0dHBzOi8vdGMzOS5lcy9lY21hMjYyLyNzZWMtanNvbi5wYXJzZVxuICpcbiAqIEluY2x1ZGVzIGV4dGVuc2lvbnMgZm9yIGhhbmRsaW5nIE1hcCBhbmQgU2V0IG9iamVjdHMuXG4gKi9cbmZ1bmN0aW9uIGFwcGx5UmV2aXZlcihyZXZpdmVyLCBvYmosIGtleSwgdmFsKSB7XG4gICAgaWYgKHZhbCAmJiB0eXBlb2YgdmFsID09PSAnb2JqZWN0Jykge1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWwpKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gdmFsLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdjAgPSB2YWxbaV07XG4gICAgICAgICAgICAgICAgY29uc3QgdjEgPSBhcHBseVJldml2ZXIocmV2aXZlciwgdmFsLCBTdHJpbmcoaSksIHYwKTtcbiAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWFycmF5LWRlbGV0ZVxuICAgICAgICAgICAgICAgIGlmICh2MSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgdmFsW2ldO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHYxICE9PSB2MClcbiAgICAgICAgICAgICAgICAgICAgdmFsW2ldID0gdjE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodmFsIGluc3RhbmNlb2YgTWFwKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGsgb2YgQXJyYXkuZnJvbSh2YWwua2V5cygpKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHYwID0gdmFsLmdldChrKTtcbiAgICAgICAgICAgICAgICBjb25zdCB2MSA9IGFwcGx5UmV2aXZlcihyZXZpdmVyLCB2YWwsIGssIHYwKTtcbiAgICAgICAgICAgICAgICBpZiAodjEgPT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICAgICAgdmFsLmRlbGV0ZShrKTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmICh2MSAhPT0gdjApXG4gICAgICAgICAgICAgICAgICAgIHZhbC5zZXQoaywgdjEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHZhbCBpbnN0YW5jZW9mIFNldCkge1xuICAgICAgICAgICAgZm9yIChjb25zdCB2MCBvZiBBcnJheS5mcm9tKHZhbCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2MSA9IGFwcGx5UmV2aXZlcihyZXZpdmVyLCB2YWwsIHYwLCB2MCk7XG4gICAgICAgICAgICAgICAgaWYgKHYxID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgIHZhbC5kZWxldGUodjApO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHYxICE9PSB2MCkge1xuICAgICAgICAgICAgICAgICAgICB2YWwuZGVsZXRlKHYwKTtcbiAgICAgICAgICAgICAgICAgICAgdmFsLmFkZCh2MSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZm9yIChjb25zdCBbaywgdjBdIG9mIE9iamVjdC5lbnRyaWVzKHZhbCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2MSA9IGFwcGx5UmV2aXZlcihyZXZpdmVyLCB2YWwsIGssIHYwKTtcbiAgICAgICAgICAgICAgICBpZiAodjEgPT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHZhbFtrXTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmICh2MSAhPT0gdjApXG4gICAgICAgICAgICAgICAgICAgIHZhbFtrXSA9IHYxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXZpdmVyLmNhbGwob2JqLCBrZXksIHZhbCk7XG59XG5cbmV4cG9ydHMuYXBwbHlSZXZpdmVyID0gYXBwbHlSZXZpdmVyO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBpZGVudGl0eSA9IHJlcXVpcmUoJy4vaWRlbnRpdHkuanMnKTtcblxuLyoqXG4gKiBSZWN1cnNpdmVseSBjb252ZXJ0IGFueSBub2RlIG9yIGl0cyBjb250ZW50cyB0byBuYXRpdmUgSmF2YVNjcmlwdFxuICpcbiAqIEBwYXJhbSB2YWx1ZSAtIFRoZSBpbnB1dCB2YWx1ZVxuICogQHBhcmFtIGFyZyAtIElmIGB2YWx1ZWAgZGVmaW5lcyBhIGB0b0pTT04oKWAgbWV0aG9kLCB1c2UgdGhpc1xuICogICBhcyBpdHMgZmlyc3QgYXJndW1lbnRcbiAqIEBwYXJhbSBjdHggLSBDb252ZXJzaW9uIGNvbnRleHQsIG9yaWdpbmFsbHkgc2V0IGluIERvY3VtZW50I3RvSlMoKS4gSWZcbiAqICAgYHsga2VlcDogdHJ1ZSB9YCBpcyBub3Qgc2V0LCBvdXRwdXQgc2hvdWxkIGJlIHN1aXRhYmxlIGZvciBKU09OXG4gKiAgIHN0cmluZ2lmaWNhdGlvbi5cbiAqL1xuZnVuY3Rpb24gdG9KUyh2YWx1ZSwgYXJnLCBjdHgpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVuc2FmZS1yZXR1cm5cbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpXG4gICAgICAgIHJldHVybiB2YWx1ZS5tYXAoKHYsIGkpID0+IHRvSlModiwgU3RyaW5nKGkpLCBjdHgpKTtcbiAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlLnRvSlNPTiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVuc2FmZS1jYWxsXG4gICAgICAgIGlmICghY3R4IHx8ICFpZGVudGl0eS5oYXNBbmNob3IodmFsdWUpKVxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnRvSlNPTihhcmcsIGN0eCk7XG4gICAgICAgIGNvbnN0IGRhdGEgPSB7IGFsaWFzQ291bnQ6IDAsIGNvdW50OiAxLCByZXM6IHVuZGVmaW5lZCB9O1xuICAgICAgICBjdHguYW5jaG9ycy5zZXQodmFsdWUsIGRhdGEpO1xuICAgICAgICBjdHgub25DcmVhdGUgPSByZXMgPT4ge1xuICAgICAgICAgICAgZGF0YS5yZXMgPSByZXM7XG4gICAgICAgICAgICBkZWxldGUgY3R4Lm9uQ3JlYXRlO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCByZXMgPSB2YWx1ZS50b0pTT04oYXJnLCBjdHgpO1xuICAgICAgICBpZiAoY3R4Lm9uQ3JlYXRlKVxuICAgICAgICAgICAgY3R4Lm9uQ3JlYXRlKHJlcyk7XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdiaWdpbnQnICYmICFjdHg/LmtlZXApXG4gICAgICAgIHJldHVybiBOdW1iZXIodmFsdWUpO1xuICAgIHJldHVybiB2YWx1ZTtcbn1cblxuZXhwb3J0cy50b0pTID0gdG9KUztcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYXBwbHlSZXZpdmVyID0gcmVxdWlyZSgnLi4vZG9jL2FwcGx5UmV2aXZlci5qcycpO1xudmFyIGlkZW50aXR5ID0gcmVxdWlyZSgnLi9pZGVudGl0eS5qcycpO1xudmFyIHRvSlMgPSByZXF1aXJlKCcuL3RvSlMuanMnKTtcblxuY2xhc3MgTm9kZUJhc2Uge1xuICAgIGNvbnN0cnVjdG9yKHR5cGUpIHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIGlkZW50aXR5Lk5PREVfVFlQRSwgeyB2YWx1ZTogdHlwZSB9KTtcbiAgICB9XG4gICAgLyoqIENyZWF0ZSBhIGNvcHkgb2YgdGhpcyBub2RlLiAgKi9cbiAgICBjbG9uZSgpIHtcbiAgICAgICAgY29uc3QgY29weSA9IE9iamVjdC5jcmVhdGUoT2JqZWN0LmdldFByb3RvdHlwZU9mKHRoaXMpLCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyh0aGlzKSk7XG4gICAgICAgIGlmICh0aGlzLnJhbmdlKVxuICAgICAgICAgICAgY29weS5yYW5nZSA9IHRoaXMucmFuZ2Uuc2xpY2UoKTtcbiAgICAgICAgcmV0dXJuIGNvcHk7XG4gICAgfVxuICAgIC8qKiBBIHBsYWluIEphdmFTY3JpcHQgcmVwcmVzZW50YXRpb24gb2YgdGhpcyBub2RlLiAqL1xuICAgIHRvSlMoZG9jLCB7IG1hcEFzTWFwLCBtYXhBbGlhc0NvdW50LCBvbkFuY2hvciwgcmV2aXZlciB9ID0ge30pIHtcbiAgICAgICAgaWYgKCFpZGVudGl0eS5pc0RvY3VtZW50KGRvYykpXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBIGRvY3VtZW50IGFyZ3VtZW50IGlzIHJlcXVpcmVkJyk7XG4gICAgICAgIGNvbnN0IGN0eCA9IHtcbiAgICAgICAgICAgIGFuY2hvcnM6IG5ldyBNYXAoKSxcbiAgICAgICAgICAgIGRvYyxcbiAgICAgICAgICAgIGtlZXA6IHRydWUsXG4gICAgICAgICAgICBtYXBBc01hcDogbWFwQXNNYXAgPT09IHRydWUsXG4gICAgICAgICAgICBtYXBLZXlXYXJuZWQ6IGZhbHNlLFxuICAgICAgICAgICAgbWF4QWxpYXNDb3VudDogdHlwZW9mIG1heEFsaWFzQ291bnQgPT09ICdudW1iZXInID8gbWF4QWxpYXNDb3VudCA6IDEwMFxuICAgICAgICB9O1xuICAgICAgICBjb25zdCByZXMgPSB0b0pTLnRvSlModGhpcywgJycsIGN0eCk7XG4gICAgICAgIGlmICh0eXBlb2Ygb25BbmNob3IgPT09ICdmdW5jdGlvbicpXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHsgY291bnQsIHJlcyB9IG9mIGN0eC5hbmNob3JzLnZhbHVlcygpKVxuICAgICAgICAgICAgICAgIG9uQW5jaG9yKHJlcywgY291bnQpO1xuICAgICAgICByZXR1cm4gdHlwZW9mIHJldml2ZXIgPT09ICdmdW5jdGlvbidcbiAgICAgICAgICAgID8gYXBwbHlSZXZpdmVyLmFwcGx5UmV2aXZlcihyZXZpdmVyLCB7ICcnOiByZXMgfSwgJycsIHJlcylcbiAgICAgICAgICAgIDogcmVzO1xuICAgIH1cbn1cblxuZXhwb3J0cy5Ob2RlQmFzZSA9IE5vZGVCYXNlO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBhbmNob3JzID0gcmVxdWlyZSgnLi4vZG9jL2FuY2hvcnMuanMnKTtcbnZhciB2aXNpdCA9IHJlcXVpcmUoJy4uL3Zpc2l0LmpzJyk7XG52YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuL2lkZW50aXR5LmpzJyk7XG52YXIgTm9kZSA9IHJlcXVpcmUoJy4vTm9kZS5qcycpO1xudmFyIHRvSlMgPSByZXF1aXJlKCcuL3RvSlMuanMnKTtcblxuY2xhc3MgQWxpYXMgZXh0ZW5kcyBOb2RlLk5vZGVCYXNlIHtcbiAgICBjb25zdHJ1Y3Rvcihzb3VyY2UpIHtcbiAgICAgICAgc3VwZXIoaWRlbnRpdHkuQUxJQVMpO1xuICAgICAgICB0aGlzLnNvdXJjZSA9IHNvdXJjZTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICd0YWcnLCB7XG4gICAgICAgICAgICBzZXQoKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBbGlhcyBub2RlcyBjYW5ub3QgaGF2ZSB0YWdzJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXNvbHZlIHRoZSB2YWx1ZSBvZiB0aGlzIGFsaWFzIHdpdGhpbiBgZG9jYCwgZmluZGluZyB0aGUgbGFzdFxuICAgICAqIGluc3RhbmNlIG9mIHRoZSBgc291cmNlYCBhbmNob3IgYmVmb3JlIHRoaXMgbm9kZS5cbiAgICAgKi9cbiAgICByZXNvbHZlKGRvYywgY3R4KSB7XG4gICAgICAgIGxldCBub2RlcztcbiAgICAgICAgaWYgKGN0eD8uYWxpYXNSZXNvbHZlQ2FjaGUpIHtcbiAgICAgICAgICAgIG5vZGVzID0gY3R4LmFsaWFzUmVzb2x2ZUNhY2hlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbm9kZXMgPSBbXTtcbiAgICAgICAgICAgIHZpc2l0LnZpc2l0KGRvYywge1xuICAgICAgICAgICAgICAgIE5vZGU6IChfa2V5LCBub2RlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpZGVudGl0eS5pc0FsaWFzKG5vZGUpIHx8IGlkZW50aXR5Lmhhc0FuY2hvcihub2RlKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzLnB1c2gobm9kZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoY3R4KVxuICAgICAgICAgICAgICAgIGN0eC5hbGlhc1Jlc29sdmVDYWNoZSA9IG5vZGVzO1xuICAgICAgICB9XG4gICAgICAgIGxldCBmb3VuZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgZm9yIChjb25zdCBub2RlIG9mIG5vZGVzKSB7XG4gICAgICAgICAgICBpZiAobm9kZSA9PT0gdGhpcylcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGlmIChub2RlLmFuY2hvciA9PT0gdGhpcy5zb3VyY2UpXG4gICAgICAgICAgICAgICAgZm91bmQgPSBub2RlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmb3VuZDtcbiAgICB9XG4gICAgdG9KU09OKF9hcmcsIGN0eCkge1xuICAgICAgICBpZiAoIWN0eClcbiAgICAgICAgICAgIHJldHVybiB7IHNvdXJjZTogdGhpcy5zb3VyY2UgfTtcbiAgICAgICAgY29uc3QgeyBhbmNob3JzLCBkb2MsIG1heEFsaWFzQ291bnQgfSA9IGN0eDtcbiAgICAgICAgY29uc3Qgc291cmNlID0gdGhpcy5yZXNvbHZlKGRvYywgY3R4KTtcbiAgICAgICAgaWYgKCFzb3VyY2UpIHtcbiAgICAgICAgICAgIGNvbnN0IG1zZyA9IGBVbnJlc29sdmVkIGFsaWFzICh0aGUgYW5jaG9yIG11c3QgYmUgc2V0IGJlZm9yZSB0aGUgYWxpYXMpOiAke3RoaXMuc291cmNlfWA7XG4gICAgICAgICAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IobXNnKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgZGF0YSA9IGFuY2hvcnMuZ2V0KHNvdXJjZSk7XG4gICAgICAgIGlmICghZGF0YSkge1xuICAgICAgICAgICAgLy8gUmVzb2x2ZSBhbmNob3JzIGZvciBOb2RlLnByb3RvdHlwZS50b0pTKClcbiAgICAgICAgICAgIHRvSlMudG9KUyhzb3VyY2UsIG51bGwsIGN0eCk7XG4gICAgICAgICAgICBkYXRhID0gYW5jaG9ycy5nZXQoc291cmNlKTtcbiAgICAgICAgfVxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgaWYgKGRhdGE/LnJlcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjb25zdCBtc2cgPSAnVGhpcyBzaG91bGQgbm90IGhhcHBlbjogQWxpYXMgYW5jaG9yIHdhcyBub3QgcmVzb2x2ZWQ/JztcbiAgICAgICAgICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihtc2cpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChtYXhBbGlhc0NvdW50ID49IDApIHtcbiAgICAgICAgICAgIGRhdGEuY291bnQgKz0gMTtcbiAgICAgICAgICAgIGlmIChkYXRhLmFsaWFzQ291bnQgPT09IDApXG4gICAgICAgICAgICAgICAgZGF0YS5hbGlhc0NvdW50ID0gZ2V0QWxpYXNDb3VudChkb2MsIHNvdXJjZSwgYW5jaG9ycyk7XG4gICAgICAgICAgICBpZiAoZGF0YS5jb3VudCAqIGRhdGEuYWxpYXNDb3VudCA+IG1heEFsaWFzQ291bnQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtc2cgPSAnRXhjZXNzaXZlIGFsaWFzIGNvdW50IGluZGljYXRlcyBhIHJlc291cmNlIGV4aGF1c3Rpb24gYXR0YWNrJztcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IobXNnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGF0YS5yZXM7XG4gICAgfVxuICAgIHRvU3RyaW5nKGN0eCwgX29uQ29tbWVudCwgX29uQ2hvbXBLZWVwKSB7XG4gICAgICAgIGNvbnN0IHNyYyA9IGAqJHt0aGlzLnNvdXJjZX1gO1xuICAgICAgICBpZiAoY3R4KSB7XG4gICAgICAgICAgICBhbmNob3JzLmFuY2hvcklzVmFsaWQodGhpcy5zb3VyY2UpO1xuICAgICAgICAgICAgaWYgKGN0eC5vcHRpb25zLnZlcmlmeUFsaWFzT3JkZXIgJiYgIWN0eC5hbmNob3JzLmhhcyh0aGlzLnNvdXJjZSkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtc2cgPSBgVW5yZXNvbHZlZCBhbGlhcyAodGhlIGFuY2hvciBtdXN0IGJlIHNldCBiZWZvcmUgdGhlIGFsaWFzKTogJHt0aGlzLnNvdXJjZX1gO1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGN0eC5pbXBsaWNpdEtleSlcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7c3JjfSBgO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzcmM7XG4gICAgfVxufVxuZnVuY3Rpb24gZ2V0QWxpYXNDb3VudChkb2MsIG5vZGUsIGFuY2hvcnMpIHtcbiAgICBpZiAoaWRlbnRpdHkuaXNBbGlhcyhub2RlKSkge1xuICAgICAgICBjb25zdCBzb3VyY2UgPSBub2RlLnJlc29sdmUoZG9jKTtcbiAgICAgICAgY29uc3QgYW5jaG9yID0gYW5jaG9ycyAmJiBzb3VyY2UgJiYgYW5jaG9ycy5nZXQoc291cmNlKTtcbiAgICAgICAgcmV0dXJuIGFuY2hvciA/IGFuY2hvci5jb3VudCAqIGFuY2hvci5hbGlhc0NvdW50IDogMDtcbiAgICB9XG4gICAgZWxzZSBpZiAoaWRlbnRpdHkuaXNDb2xsZWN0aW9uKG5vZGUpKSB7XG4gICAgICAgIGxldCBjb3VudCA9IDA7XG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBub2RlLml0ZW1zKSB7XG4gICAgICAgICAgICBjb25zdCBjID0gZ2V0QWxpYXNDb3VudChkb2MsIGl0ZW0sIGFuY2hvcnMpO1xuICAgICAgICAgICAgaWYgKGMgPiBjb3VudClcbiAgICAgICAgICAgICAgICBjb3VudCA9IGM7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvdW50O1xuICAgIH1cbiAgICBlbHNlIGlmIChpZGVudGl0eS5pc1BhaXIobm9kZSkpIHtcbiAgICAgICAgY29uc3Qga2MgPSBnZXRBbGlhc0NvdW50KGRvYywgbm9kZS5rZXksIGFuY2hvcnMpO1xuICAgICAgICBjb25zdCB2YyA9IGdldEFsaWFzQ291bnQoZG9jLCBub2RlLnZhbHVlLCBhbmNob3JzKTtcbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KGtjLCB2Yyk7XG4gICAgfVxuICAgIHJldHVybiAxO1xufVxuXG5leHBvcnRzLkFsaWFzID0gQWxpYXM7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIGlkZW50aXR5ID0gcmVxdWlyZSgnLi9pZGVudGl0eS5qcycpO1xudmFyIE5vZGUgPSByZXF1aXJlKCcuL05vZGUuanMnKTtcbnZhciB0b0pTID0gcmVxdWlyZSgnLi90b0pTLmpzJyk7XG5cbmNvbnN0IGlzU2NhbGFyVmFsdWUgPSAodmFsdWUpID0+ICF2YWx1ZSB8fCAodHlwZW9mIHZhbHVlICE9PSAnZnVuY3Rpb24nICYmIHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcpO1xuY2xhc3MgU2NhbGFyIGV4dGVuZHMgTm9kZS5Ob2RlQmFzZSB7XG4gICAgY29uc3RydWN0b3IodmFsdWUpIHtcbiAgICAgICAgc3VwZXIoaWRlbnRpdHkuU0NBTEFSKTtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgICB0b0pTT04oYXJnLCBjdHgpIHtcbiAgICAgICAgcmV0dXJuIGN0eD8ua2VlcCA/IHRoaXMudmFsdWUgOiB0b0pTLnRvSlModGhpcy52YWx1ZSwgYXJnLCBjdHgpO1xuICAgIH1cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIFN0cmluZyh0aGlzLnZhbHVlKTtcbiAgICB9XG59XG5TY2FsYXIuQkxPQ0tfRk9MREVEID0gJ0JMT0NLX0ZPTERFRCc7XG5TY2FsYXIuQkxPQ0tfTElURVJBTCA9ICdCTE9DS19MSVRFUkFMJztcblNjYWxhci5QTEFJTiA9ICdQTEFJTic7XG5TY2FsYXIuUVVPVEVfRE9VQkxFID0gJ1FVT1RFX0RPVUJMRSc7XG5TY2FsYXIuUVVPVEVfU0lOR0xFID0gJ1FVT1RFX1NJTkdMRSc7XG5cbmV4cG9ydHMuU2NhbGFyID0gU2NhbGFyO1xuZXhwb3J0cy5pc1NjYWxhclZhbHVlID0gaXNTY2FsYXJWYWx1ZTtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQWxpYXMgPSByZXF1aXJlKCcuLi9ub2Rlcy9BbGlhcy5qcycpO1xudmFyIGlkZW50aXR5ID0gcmVxdWlyZSgnLi4vbm9kZXMvaWRlbnRpdHkuanMnKTtcbnZhciBTY2FsYXIgPSByZXF1aXJlKCcuLi9ub2Rlcy9TY2FsYXIuanMnKTtcblxuY29uc3QgZGVmYXVsdFRhZ1ByZWZpeCA9ICd0YWc6eWFtbC5vcmcsMjAwMjonO1xuZnVuY3Rpb24gZmluZFRhZ09iamVjdCh2YWx1ZSwgdGFnTmFtZSwgdGFncykge1xuICAgIGlmICh0YWdOYW1lKSB7XG4gICAgICAgIGNvbnN0IG1hdGNoID0gdGFncy5maWx0ZXIodCA9PiB0LnRhZyA9PT0gdGFnTmFtZSk7XG4gICAgICAgIGNvbnN0IHRhZ09iaiA9IG1hdGNoLmZpbmQodCA9PiAhdC5mb3JtYXQpID8/IG1hdGNoWzBdO1xuICAgICAgICBpZiAoIXRhZ09iailcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVGFnICR7dGFnTmFtZX0gbm90IGZvdW5kYCk7XG4gICAgICAgIHJldHVybiB0YWdPYmo7XG4gICAgfVxuICAgIHJldHVybiB0YWdzLmZpbmQodCA9PiB0LmlkZW50aWZ5Py4odmFsdWUpICYmICF0LmZvcm1hdCk7XG59XG5mdW5jdGlvbiBjcmVhdGVOb2RlKHZhbHVlLCB0YWdOYW1lLCBjdHgpIHtcbiAgICBpZiAoaWRlbnRpdHkuaXNEb2N1bWVudCh2YWx1ZSkpXG4gICAgICAgIHZhbHVlID0gdmFsdWUuY29udGVudHM7XG4gICAgaWYgKGlkZW50aXR5LmlzTm9kZSh2YWx1ZSkpXG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICBpZiAoaWRlbnRpdHkuaXNQYWlyKHZhbHVlKSkge1xuICAgICAgICBjb25zdCBtYXAgPSBjdHguc2NoZW1hW2lkZW50aXR5Lk1BUF0uY3JlYXRlTm9kZT8uKGN0eC5zY2hlbWEsIG51bGwsIGN0eCk7XG4gICAgICAgIG1hcC5pdGVtcy5wdXNoKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIG1hcDtcbiAgICB9XG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgU3RyaW5nIHx8XG4gICAgICAgIHZhbHVlIGluc3RhbmNlb2YgTnVtYmVyIHx8XG4gICAgICAgIHZhbHVlIGluc3RhbmNlb2YgQm9vbGVhbiB8fFxuICAgICAgICAodHlwZW9mIEJpZ0ludCAhPT0gJ3VuZGVmaW5lZCcgJiYgdmFsdWUgaW5zdGFuY2VvZiBCaWdJbnQpIC8vIG5vdCBzdXBwb3J0ZWQgZXZlcnl3aGVyZVxuICAgICkge1xuICAgICAgICAvLyBodHRwczovL3RjMzkuZXMvZWNtYTI2Mi8jc2VjLXNlcmlhbGl6ZWpzb25wcm9wZXJ0eVxuICAgICAgICB2YWx1ZSA9IHZhbHVlLnZhbHVlT2YoKTtcbiAgICB9XG4gICAgY29uc3QgeyBhbGlhc0R1cGxpY2F0ZU9iamVjdHMsIG9uQW5jaG9yLCBvblRhZ09iaiwgc2NoZW1hLCBzb3VyY2VPYmplY3RzIH0gPSBjdHg7XG4gICAgLy8gRGV0ZWN0IGR1cGxpY2F0ZSByZWZlcmVuY2VzIHRvIHRoZSBzYW1lIG9iamVjdCAmIHVzZSBBbGlhcyBub2RlcyBmb3IgYWxsXG4gICAgLy8gYWZ0ZXIgZmlyc3QuIFRoZSBgcmVmYCB3cmFwcGVyIGFsbG93cyBmb3IgY2lyY3VsYXIgcmVmZXJlbmNlcyB0byByZXNvbHZlLlxuICAgIGxldCByZWYgPSB1bmRlZmluZWQ7XG4gICAgaWYgKGFsaWFzRHVwbGljYXRlT2JqZWN0cyAmJiB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIHJlZiA9IHNvdXJjZU9iamVjdHMuZ2V0KHZhbHVlKTtcbiAgICAgICAgaWYgKHJlZikge1xuICAgICAgICAgICAgcmVmLmFuY2hvciA/PyAocmVmLmFuY2hvciA9IG9uQW5jaG9yKHZhbHVlKSk7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEFsaWFzLkFsaWFzKHJlZi5hbmNob3IpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmVmID0geyBhbmNob3I6IG51bGwsIG5vZGU6IG51bGwgfTtcbiAgICAgICAgICAgIHNvdXJjZU9iamVjdHMuc2V0KHZhbHVlLCByZWYpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmICh0YWdOYW1lPy5zdGFydHNXaXRoKCchIScpKVxuICAgICAgICB0YWdOYW1lID0gZGVmYXVsdFRhZ1ByZWZpeCArIHRhZ05hbWUuc2xpY2UoMik7XG4gICAgbGV0IHRhZ09iaiA9IGZpbmRUYWdPYmplY3QodmFsdWUsIHRhZ05hbWUsIHNjaGVtYS50YWdzKTtcbiAgICBpZiAoIXRhZ09iaikge1xuICAgICAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlLnRvSlNPTiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnNhZmUtY2FsbFxuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS50b0pTT04oKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXZhbHVlIHx8IHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBuZXcgU2NhbGFyLlNjYWxhcih2YWx1ZSk7XG4gICAgICAgICAgICBpZiAocmVmKVxuICAgICAgICAgICAgICAgIHJlZi5ub2RlID0gbm9kZTtcbiAgICAgICAgICAgIHJldHVybiBub2RlO1xuICAgICAgICB9XG4gICAgICAgIHRhZ09iaiA9XG4gICAgICAgICAgICB2YWx1ZSBpbnN0YW5jZW9mIE1hcFxuICAgICAgICAgICAgICAgID8gc2NoZW1hW2lkZW50aXR5Lk1BUF1cbiAgICAgICAgICAgICAgICA6IFN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QodmFsdWUpXG4gICAgICAgICAgICAgICAgICAgID8gc2NoZW1hW2lkZW50aXR5LlNFUV1cbiAgICAgICAgICAgICAgICAgICAgOiBzY2hlbWFbaWRlbnRpdHkuTUFQXTtcbiAgICB9XG4gICAgaWYgKG9uVGFnT2JqKSB7XG4gICAgICAgIG9uVGFnT2JqKHRhZ09iaik7XG4gICAgICAgIGRlbGV0ZSBjdHgub25UYWdPYmo7XG4gICAgfVxuICAgIGNvbnN0IG5vZGUgPSB0YWdPYmo/LmNyZWF0ZU5vZGVcbiAgICAgICAgPyB0YWdPYmouY3JlYXRlTm9kZShjdHguc2NoZW1hLCB2YWx1ZSwgY3R4KVxuICAgICAgICA6IHR5cGVvZiB0YWdPYmo/Lm5vZGVDbGFzcz8uZnJvbSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgPyB0YWdPYmoubm9kZUNsYXNzLmZyb20oY3R4LnNjaGVtYSwgdmFsdWUsIGN0eClcbiAgICAgICAgICAgIDogbmV3IFNjYWxhci5TY2FsYXIodmFsdWUpO1xuICAgIGlmICh0YWdOYW1lKVxuICAgICAgICBub2RlLnRhZyA9IHRhZ05hbWU7XG4gICAgZWxzZSBpZiAoIXRhZ09iai5kZWZhdWx0KVxuICAgICAgICBub2RlLnRhZyA9IHRhZ09iai50YWc7XG4gICAgaWYgKHJlZilcbiAgICAgICAgcmVmLm5vZGUgPSBub2RlO1xuICAgIHJldHVybiBub2RlO1xufVxuXG5leHBvcnRzLmNyZWF0ZU5vZGUgPSBjcmVhdGVOb2RlO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBjcmVhdGVOb2RlID0gcmVxdWlyZSgnLi4vZG9jL2NyZWF0ZU5vZGUuanMnKTtcbnZhciBpZGVudGl0eSA9IHJlcXVpcmUoJy4vaWRlbnRpdHkuanMnKTtcbnZhciBOb2RlID0gcmVxdWlyZSgnLi9Ob2RlLmpzJyk7XG5cbmZ1bmN0aW9uIGNvbGxlY3Rpb25Gcm9tUGF0aChzY2hlbWEsIHBhdGgsIHZhbHVlKSB7XG4gICAgbGV0IHYgPSB2YWx1ZTtcbiAgICBmb3IgKGxldCBpID0gcGF0aC5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICBjb25zdCBrID0gcGF0aFtpXTtcbiAgICAgICAgaWYgKHR5cGVvZiBrID09PSAnbnVtYmVyJyAmJiBOdW1iZXIuaXNJbnRlZ2VyKGspICYmIGsgPj0gMCkge1xuICAgICAgICAgICAgY29uc3QgYSA9IFtdO1xuICAgICAgICAgICAgYVtrXSA9IHY7XG4gICAgICAgICAgICB2ID0gYTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHYgPSBuZXcgTWFwKFtbaywgdl1dKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY3JlYXRlTm9kZS5jcmVhdGVOb2RlKHYsIHVuZGVmaW5lZCwge1xuICAgICAgICBhbGlhc0R1cGxpY2F0ZU9iamVjdHM6IGZhbHNlLFxuICAgICAgICBrZWVwVW5kZWZpbmVkOiBmYWxzZSxcbiAgICAgICAgb25BbmNob3I6ICgpID0+IHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGhpcyBzaG91bGQgbm90IGhhcHBlbiwgcGxlYXNlIHJlcG9ydCBhIGJ1Zy4nKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2NoZW1hLFxuICAgICAgICBzb3VyY2VPYmplY3RzOiBuZXcgTWFwKClcbiAgICB9KTtcbn1cbi8vIFR5cGUgZ3VhcmQgaXMgaW50ZW50aW9uYWxseSBhIGxpdHRsZSB3cm9uZyBzbyBhcyB0byBiZSBtb3JlIHVzZWZ1bCxcbi8vIGFzIGl0IGRvZXMgbm90IGNvdmVyIHVudHlwYWJsZSBlbXB0eSBub24tc3RyaW5nIGl0ZXJhYmxlcyAoZS5nLiBbXSkuXG5jb25zdCBpc0VtcHR5UGF0aCA9IChwYXRoKSA9PiBwYXRoID09IG51bGwgfHxcbiAgICAodHlwZW9mIHBhdGggPT09ICdvYmplY3QnICYmICEhcGF0aFtTeW1ib2wuaXRlcmF0b3JdKCkubmV4dCgpLmRvbmUpO1xuY2xhc3MgQ29sbGVjdGlvbiBleHRlbmRzIE5vZGUuTm9kZUJhc2Uge1xuICAgIGNvbnN0cnVjdG9yKHR5cGUsIHNjaGVtYSkge1xuICAgICAgICBzdXBlcih0eXBlKTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdzY2hlbWEnLCB7XG4gICAgICAgICAgICB2YWx1ZTogc2NoZW1hLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICB3cml0YWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgY29weSBvZiB0aGlzIGNvbGxlY3Rpb24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gc2NoZW1hIC0gSWYgZGVmaW5lZCwgb3ZlcndyaXRlcyB0aGUgb3JpZ2luYWwncyBzY2hlbWFcbiAgICAgKi9cbiAgICBjbG9uZShzY2hlbWEpIHtcbiAgICAgICAgY29uc3QgY29weSA9IE9iamVjdC5jcmVhdGUoT2JqZWN0LmdldFByb3RvdHlwZU9mKHRoaXMpLCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyh0aGlzKSk7XG4gICAgICAgIGlmIChzY2hlbWEpXG4gICAgICAgICAgICBjb3B5LnNjaGVtYSA9IHNjaGVtYTtcbiAgICAgICAgY29weS5pdGVtcyA9IGNvcHkuaXRlbXMubWFwKGl0ID0+IGlkZW50aXR5LmlzTm9kZShpdCkgfHwgaWRlbnRpdHkuaXNQYWlyKGl0KSA/IGl0LmNsb25lKHNjaGVtYSkgOiBpdCk7XG4gICAgICAgIGlmICh0aGlzLnJhbmdlKVxuICAgICAgICAgICAgY29weS5yYW5nZSA9IHRoaXMucmFuZ2Uuc2xpY2UoKTtcbiAgICAgICAgcmV0dXJuIGNvcHk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFkZHMgYSB2YWx1ZSB0byB0aGUgY29sbGVjdGlvbi4gRm9yIGAhIW1hcGAgYW5kIGAhIW9tYXBgIHRoZSB2YWx1ZSBtdXN0XG4gICAgICogYmUgYSBQYWlyIGluc3RhbmNlIG9yIGEgYHsga2V5LCB2YWx1ZSB9YCBvYmplY3QsIHdoaWNoIG1heSBub3QgaGF2ZSBhIGtleVxuICAgICAqIHRoYXQgYWxyZWFkeSBleGlzdHMgaW4gdGhlIG1hcC5cbiAgICAgKi9cbiAgICBhZGRJbihwYXRoLCB2YWx1ZSkge1xuICAgICAgICBpZiAoaXNFbXB0eVBhdGgocGF0aCkpXG4gICAgICAgICAgICB0aGlzLmFkZCh2YWx1ZSk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgW2tleSwgLi4ucmVzdF0gPSBwYXRoO1xuICAgICAgICAgICAgY29uc3Qgbm9kZSA9IHRoaXMuZ2V0KGtleSwgdHJ1ZSk7XG4gICAgICAgICAgICBpZiAoaWRlbnRpdHkuaXNDb2xsZWN0aW9uKG5vZGUpKVxuICAgICAgICAgICAgICAgIG5vZGUuYWRkSW4ocmVzdCwgdmFsdWUpO1xuICAgICAgICAgICAgZWxzZSBpZiAobm9kZSA9PT0gdW5kZWZpbmVkICYmIHRoaXMuc2NoZW1hKVxuICAgICAgICAgICAgICAgIHRoaXMuc2V0KGtleSwgY29sbGVjdGlvbkZyb21QYXRoKHRoaXMuc2NoZW1hLCByZXN0LCB2YWx1ZSkpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgWUFNTCBjb2xsZWN0aW9uIGF0ICR7a2V5fS4gUmVtYWluaW5nIHBhdGg6ICR7cmVzdH1gKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGEgdmFsdWUgZnJvbSB0aGUgY29sbGVjdGlvbi5cbiAgICAgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGl0ZW0gd2FzIGZvdW5kIGFuZCByZW1vdmVkLlxuICAgICAqL1xuICAgIGRlbGV0ZUluKHBhdGgpIHtcbiAgICAgICAgY29uc3QgW2tleSwgLi4ucmVzdF0gPSBwYXRoO1xuICAgICAgICBpZiAocmVzdC5sZW5ndGggPT09IDApXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kZWxldGUoa2V5KTtcbiAgICAgICAgY29uc3Qgbm9kZSA9IHRoaXMuZ2V0KGtleSwgdHJ1ZSk7XG4gICAgICAgIGlmIChpZGVudGl0eS5pc0NvbGxlY3Rpb24obm9kZSkpXG4gICAgICAgICAgICByZXR1cm4gbm9kZS5kZWxldGVJbihyZXN0KTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCBZQU1MIGNvbGxlY3Rpb24gYXQgJHtrZXl9LiBSZW1haW5pbmcgcGF0aDogJHtyZXN0fWApO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGl0ZW0gYXQgYGtleWAsIG9yIGB1bmRlZmluZWRgIGlmIG5vdCBmb3VuZC4gQnkgZGVmYXVsdCB1bndyYXBzXG4gICAgICogc2NhbGFyIHZhbHVlcyBmcm9tIHRoZWlyIHN1cnJvdW5kaW5nIG5vZGU7IHRvIGRpc2FibGUgc2V0IGBrZWVwU2NhbGFyYCB0b1xuICAgICAqIGB0cnVlYCAoY29sbGVjdGlvbnMgYXJlIGFsd2F5cyByZXR1cm5lZCBpbnRhY3QpLlxuICAgICAqL1xuICAgIGdldEluKHBhdGgsIGtlZXBTY2FsYXIpIHtcbiAgICAgICAgY29uc3QgW2tleSwgLi4ucmVzdF0gPSBwYXRoO1xuICAgICAgICBjb25zdCBub2RlID0gdGhpcy5nZXQoa2V5LCB0cnVlKTtcbiAgICAgICAgaWYgKHJlc3QubGVuZ3RoID09PSAwKVxuICAgICAgICAgICAgcmV0dXJuICFrZWVwU2NhbGFyICYmIGlkZW50aXR5LmlzU2NhbGFyKG5vZGUpID8gbm9kZS52YWx1ZSA6IG5vZGU7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBpZGVudGl0eS5pc0NvbGxlY3Rpb24obm9kZSkgPyBub2RlLmdldEluKHJlc3QsIGtlZXBTY2FsYXIpIDogdW5kZWZpbmVkO1xuICAgIH1cbiAgICBoYXNBbGxOdWxsVmFsdWVzKGFsbG93U2NhbGFyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLml0ZW1zLmV2ZXJ5KG5vZGUgPT4ge1xuICAgICAgICAgICAgaWYgKCFpZGVudGl0eS5pc1BhaXIobm9kZSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgY29uc3QgbiA9IG5vZGUudmFsdWU7XG4gICAgICAgICAgICByZXR1cm4gKG4gPT0gbnVsbCB8fFxuICAgICAgICAgICAgICAgIChhbGxvd1NjYWxhciAmJlxuICAgICAgICAgICAgICAgICAgICBpZGVudGl0eS5pc1NjYWxhcihuKSAmJlxuICAgICAgICAgICAgICAgICAgICBuLnZhbHVlID09IG51bGwgJiZcbiAgICAgICAgICAgICAgICAgICAgIW4uY29tbWVudEJlZm9yZSAmJlxuICAgICAgICAgICAgICAgICAgICAhbi5jb21tZW50ICYmXG4gICAgICAgICAgICAgICAgICAgICFuLnRhZykpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIHRoZSBjb2xsZWN0aW9uIGluY2x1ZGVzIGEgdmFsdWUgd2l0aCB0aGUga2V5IGBrZXlgLlxuICAgICAqL1xuICAgIGhhc0luKHBhdGgpIHtcbiAgICAgICAgY29uc3QgW2tleSwgLi4ucmVzdF0gPSBwYXRoO1xuICAgICAgICBpZiAocmVzdC5sZW5ndGggPT09IDApXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5oYXMoa2V5KTtcbiAgICAgICAgY29uc3Qgbm9kZSA9IHRoaXMuZ2V0KGtleSwgdHJ1ZSk7XG4gICAgICAgIHJldHVybiBpZGVudGl0eS5pc0NvbGxlY3Rpb24obm9kZSkgPyBub2RlLmhhc0luKHJlc3QpIDogZmFsc2U7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldHMgYSB2YWx1ZSBpbiB0aGlzIGNvbGxlY3Rpb24uIEZvciBgISFzZXRgLCBgdmFsdWVgIG5lZWRzIHRvIGJlIGFcbiAgICAgKiBib29sZWFuIHRvIGFkZC9yZW1vdmUgdGhlIGl0ZW0gZnJvbSB0aGUgc2V0LlxuICAgICAqL1xuICAgIHNldEluKHBhdGgsIHZhbHVlKSB7XG4gICAgICAgIGNvbnN0IFtrZXksIC4uLnJlc3RdID0gcGF0aDtcbiAgICAgICAgaWYgKHJlc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLmdldChrZXksIHRydWUpO1xuICAgICAgICAgICAgaWYgKGlkZW50aXR5LmlzQ29sbGVjdGlvbihub2RlKSlcbiAgICAgICAgICAgICAgICBub2RlLnNldEluKHJlc3QsIHZhbHVlKTtcbiAgICAgICAgICAgIGVsc2UgaWYgKG5vZGUgPT09IHVuZGVmaW5lZCAmJiB0aGlzLnNjaGVtYSlcbiAgICAgICAgICAgICAgICB0aGlzLnNldChrZXksIGNvbGxlY3Rpb25Gcm9tUGF0aCh0aGlzLnNjaGVtYSwgcmVzdCwgdmFsdWUpKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIFlBTUwgY29sbGVjdGlvbiBhdCAke2tleX0uIFJlbWFpbmluZyBwYXRoOiAke3Jlc3R9YCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydHMuQ29sbGVjdGlvbiA9IENvbGxlY3Rpb247XG5leHBvcnRzLmNvbGxlY3Rpb25Gcm9tUGF0aCA9IGNvbGxlY3Rpb25Gcm9tUGF0aDtcbmV4cG9ydHMuaXNFbXB0eVBhdGggPSBpc0VtcHR5UGF0aDtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFN0cmluZ2lmaWVzIGEgY29tbWVudC5cbiAqXG4gKiBFbXB0eSBjb21tZW50IGxpbmVzIGFyZSBsZWZ0IGVtcHR5LFxuICogbGluZXMgY29uc2lzdGluZyBvZiBhIHNpbmdsZSBzcGFjZSBhcmUgcmVwbGFjZWQgYnkgYCNgLFxuICogYW5kIGFsbCBvdGhlciBsaW5lcyBhcmUgcHJlZml4ZWQgd2l0aCBhIGAjYC5cbiAqL1xuY29uc3Qgc3RyaW5naWZ5Q29tbWVudCA9IChzdHIpID0+IHN0ci5yZXBsYWNlKC9eKD8hJCkoPzogJCk/L2dtLCAnIycpO1xuZnVuY3Rpb24gaW5kZW50Q29tbWVudChjb21tZW50LCBpbmRlbnQpIHtcbiAgICBpZiAoL15cXG4rJC8udGVzdChjb21tZW50KSlcbiAgICAgICAgcmV0dXJuIGNvbW1lbnQuc3Vic3RyaW5nKDEpO1xuICAgIHJldHVybiBpbmRlbnQgPyBjb21tZW50LnJlcGxhY2UoL14oPyEgKiQpL2dtLCBpbmRlbnQpIDogY29tbWVudDtcbn1cbmNvbnN0IGxpbmVDb21tZW50ID0gKHN0ciwgaW5kZW50LCBjb21tZW50KSA9PiBzdHIuZW5kc1dpdGgoJ1xcbicpXG4gICAgPyBpbmRlbnRDb21tZW50KGNvbW1lbnQsIGluZGVudClcbiAgICA6IGNvbW1lbnQuaW5jbHVkZXMoJ1xcbicpXG4gICAgICAgID8gJ1xcbicgKyBpbmRlbnRDb21tZW50KGNvbW1lbnQsIGluZGVudClcbiAgICAgICAgOiAoc3RyLmVuZHNXaXRoKCcgJykgPyAnJyA6ICcgJykgKyBjb21tZW50O1xuXG5leHBvcnRzLmluZGVudENvbW1lbnQgPSBpbmRlbnRDb21tZW50O1xuZXhwb3J0cy5saW5lQ29tbWVudCA9IGxpbmVDb21tZW50O1xuZXhwb3J0cy5zdHJpbmdpZnlDb21tZW50ID0gc3RyaW5naWZ5Q29tbWVudDtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBGT0xEX0ZMT1cgPSAnZmxvdyc7XG5jb25zdCBGT0xEX0JMT0NLID0gJ2Jsb2NrJztcbmNvbnN0IEZPTERfUVVPVEVEID0gJ3F1b3RlZCc7XG4vKipcbiAqIFRyaWVzIHRvIGtlZXAgaW5wdXQgYXQgdXAgdG8gYGxpbmVXaWR0aGAgY2hhcmFjdGVycywgc3BsaXR0aW5nIG9ubHkgb24gc3BhY2VzXG4gKiBub3QgZm9sbG93ZWQgYnkgbmV3bGluZXMgb3Igc3BhY2VzIHVubGVzcyBgbW9kZWAgaXMgYCdxdW90ZWQnYC4gTGluZXMgYXJlXG4gKiB0ZXJtaW5hdGVkIHdpdGggYFxcbmAgYW5kIHN0YXJ0ZWQgd2l0aCBgaW5kZW50YC5cbiAqL1xuZnVuY3Rpb24gZm9sZEZsb3dMaW5lcyh0ZXh0LCBpbmRlbnQsIG1vZGUgPSAnZmxvdycsIHsgaW5kZW50QXRTdGFydCwgbGluZVdpZHRoID0gODAsIG1pbkNvbnRlbnRXaWR0aCA9IDIwLCBvbkZvbGQsIG9uT3ZlcmZsb3cgfSA9IHt9KSB7XG4gICAgaWYgKCFsaW5lV2lkdGggfHwgbGluZVdpZHRoIDwgMClcbiAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgaWYgKGxpbmVXaWR0aCA8IG1pbkNvbnRlbnRXaWR0aClcbiAgICAgICAgbWluQ29udGVudFdpZHRoID0gMDtcbiAgICBjb25zdCBlbmRTdGVwID0gTWF0aC5tYXgoMSArIG1pbkNvbnRlbnRXaWR0aCwgMSArIGxpbmVXaWR0aCAtIGluZGVudC5sZW5ndGgpO1xuICAgIGlmICh0ZXh0Lmxlbmd0aCA8PSBlbmRTdGVwKVxuICAgICAgICByZXR1cm4gdGV4dDtcbiAgICBjb25zdCBmb2xkcyA9IFtdO1xuICAgIGNvbnN0IGVzY2FwZWRGb2xkcyA9IHt9O1xuICAgIGxldCBlbmQgPSBsaW5lV2lkdGggLSBpbmRlbnQubGVuZ3RoO1xuICAgIGlmICh0eXBlb2YgaW5kZW50QXRTdGFydCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgaWYgKGluZGVudEF0U3RhcnQgPiBsaW5lV2lkdGggLSBNYXRoLm1heCgyLCBtaW5Db250ZW50V2lkdGgpKVxuICAgICAgICAgICAgZm9sZHMucHVzaCgwKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZW5kID0gbGluZVdpZHRoIC0gaW5kZW50QXRTdGFydDtcbiAgICB9XG4gICAgbGV0IHNwbGl0ID0gdW5kZWZpbmVkO1xuICAgIGxldCBwcmV2ID0gdW5kZWZpbmVkO1xuICAgIGxldCBvdmVyZmxvdyA9IGZhbHNlO1xuICAgIGxldCBpID0gLTE7XG4gICAgbGV0IGVzY1N0YXJ0ID0gLTE7XG4gICAgbGV0IGVzY0VuZCA9IC0xO1xuICAgIGlmIChtb2RlID09PSBGT0xEX0JMT0NLKSB7XG4gICAgICAgIGkgPSBjb25zdW1lTW9yZUluZGVudGVkTGluZXModGV4dCwgaSwgaW5kZW50Lmxlbmd0aCk7XG4gICAgICAgIGlmIChpICE9PSAtMSlcbiAgICAgICAgICAgIGVuZCA9IGkgKyBlbmRTdGVwO1xuICAgIH1cbiAgICBmb3IgKGxldCBjaDsgKGNoID0gdGV4dFsoaSArPSAxKV0pOykge1xuICAgICAgICBpZiAobW9kZSA9PT0gRk9MRF9RVU9URUQgJiYgY2ggPT09ICdcXFxcJykge1xuICAgICAgICAgICAgZXNjU3RhcnQgPSBpO1xuICAgICAgICAgICAgc3dpdGNoICh0ZXh0W2kgKyAxXSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ3gnOlxuICAgICAgICAgICAgICAgICAgICBpICs9IDM7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3UnOlxuICAgICAgICAgICAgICAgICAgICBpICs9IDU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ1UnOlxuICAgICAgICAgICAgICAgICAgICBpICs9IDk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGkgKz0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVzY0VuZCA9IGk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoID09PSAnXFxuJykge1xuICAgICAgICAgICAgaWYgKG1vZGUgPT09IEZPTERfQkxPQ0spXG4gICAgICAgICAgICAgICAgaSA9IGNvbnN1bWVNb3JlSW5kZW50ZWRMaW5lcyh0ZXh0LCBpLCBpbmRlbnQubGVuZ3RoKTtcbiAgICAgICAgICAgIGVuZCA9IGkgKyBpbmRlbnQubGVuZ3RoICsgZW5kU3RlcDtcbiAgICAgICAgICAgIHNwbGl0ID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKGNoID09PSAnICcgJiZcbiAgICAgICAgICAgICAgICBwcmV2ICYmXG4gICAgICAgICAgICAgICAgcHJldiAhPT0gJyAnICYmXG4gICAgICAgICAgICAgICAgcHJldiAhPT0gJ1xcbicgJiZcbiAgICAgICAgICAgICAgICBwcmV2ICE9PSAnXFx0Jykge1xuICAgICAgICAgICAgICAgIC8vIHNwYWNlIHN1cnJvdW5kZWQgYnkgbm9uLXNwYWNlIGNhbiBiZSByZXBsYWNlZCB3aXRoIG5ld2xpbmUgKyBpbmRlbnRcbiAgICAgICAgICAgICAgICBjb25zdCBuZXh0ID0gdGV4dFtpICsgMV07XG4gICAgICAgICAgICAgICAgaWYgKG5leHQgJiYgbmV4dCAhPT0gJyAnICYmIG5leHQgIT09ICdcXG4nICYmIG5leHQgIT09ICdcXHQnKVxuICAgICAgICAgICAgICAgICAgICBzcGxpdCA9IGk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaSA+PSBlbmQpIHtcbiAgICAgICAgICAgICAgICBpZiAoc3BsaXQpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9sZHMucHVzaChzcGxpdCk7XG4gICAgICAgICAgICAgICAgICAgIGVuZCA9IHNwbGl0ICsgZW5kU3RlcDtcbiAgICAgICAgICAgICAgICAgICAgc3BsaXQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG1vZGUgPT09IEZPTERfUVVPVEVEKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHdoaXRlLXNwYWNlIGNvbGxlY3RlZCBhdCBlbmQgbWF5IHN0cmV0Y2ggcGFzdCBsaW5lV2lkdGhcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKHByZXYgPT09ICcgJyB8fCBwcmV2ID09PSAnXFx0Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJldiA9IGNoO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2ggPSB0ZXh0WyhpICs9IDEpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG92ZXJmbG93ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBBY2NvdW50IGZvciBuZXdsaW5lIGVzY2FwZSwgYnV0IGRvbid0IGJyZWFrIHByZWNlZGluZyBlc2NhcGVcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaiA9IGkgPiBlc2NFbmQgKyAxID8gaSAtIDIgOiBlc2NTdGFydCAtIDE7XG4gICAgICAgICAgICAgICAgICAgIC8vIEJhaWwgb3V0IGlmIGxpbmVXaWR0aCAmIG1pbkNvbnRlbnRXaWR0aCBhcmUgc2hvcnRlciB0aGFuIGFuIGVzY2FwZSBzdHJpbmdcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVzY2FwZWRGb2xkc1tqXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0ZXh0O1xuICAgICAgICAgICAgICAgICAgICBmb2xkcy5wdXNoKGopO1xuICAgICAgICAgICAgICAgICAgICBlc2NhcGVkRm9sZHNbal0gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBlbmQgPSBqICsgZW5kU3RlcDtcbiAgICAgICAgICAgICAgICAgICAgc3BsaXQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBvdmVyZmxvdyA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHByZXYgPSBjaDtcbiAgICB9XG4gICAgaWYgKG92ZXJmbG93ICYmIG9uT3ZlcmZsb3cpXG4gICAgICAgIG9uT3ZlcmZsb3coKTtcbiAgICBpZiAoZm9sZHMubGVuZ3RoID09PSAwKVxuICAgICAgICByZXR1cm4gdGV4dDtcbiAgICBpZiAob25Gb2xkKVxuICAgICAgICBvbkZvbGQoKTtcbiAgICBsZXQgcmVzID0gdGV4dC5zbGljZSgwLCBmb2xkc1swXSk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmb2xkcy5sZW5ndGg7ICsraSkge1xuICAgICAgICBjb25zdCBmb2xkID0gZm9sZHNbaV07XG4gICAgICAgIGNvbnN0IGVuZCA9IGZvbGRzW2kgKyAxXSB8fCB0ZXh0Lmxlbmd0aDtcbiAgICAgICAgaWYgKGZvbGQgPT09IDApXG4gICAgICAgICAgICByZXMgPSBgXFxuJHtpbmRlbnR9JHt0ZXh0LnNsaWNlKDAsIGVuZCl9YDtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAobW9kZSA9PT0gRk9MRF9RVU9URUQgJiYgZXNjYXBlZEZvbGRzW2ZvbGRdKVxuICAgICAgICAgICAgICAgIHJlcyArPSBgJHt0ZXh0W2ZvbGRdfVxcXFxgO1xuICAgICAgICAgICAgcmVzICs9IGBcXG4ke2luZGVudH0ke3RleHQuc2xpY2UoZm9sZCArIDEsIGVuZCl9YDtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xufVxuLyoqXG4gKiBQcmVzdW1lcyBgaSArIDFgIGlzIGF0IHRoZSBzdGFydCBvZiBhIGxpbmVcbiAqIEByZXR1cm5zIGluZGV4IG9mIGxhc3QgbmV3bGluZSBpbiBtb3JlLWluZGVudGVkIGJsb2NrXG4gKi9cbmZ1bmN0aW9uIGNvbnN1bWVNb3JlSW5kZW50ZWRMaW5lcyh0ZXh0LCBpLCBpbmRlbnQpIHtcbiAgICBsZXQgZW5kID0gaTtcbiAgICBsZXQgc3RhcnQgPSBpICsgMTtcbiAgICBsZXQgY2ggPSB0ZXh0W3N0YXJ0XTtcbiAgICB3aGlsZSAoY2ggPT09ICcgJyB8fCBjaCA9PT0gJ1xcdCcpIHtcbiAgICAgICAgaWYgKGkgPCBzdGFydCArIGluZGVudCkge1xuICAgICAgICAgICAgY2ggPSB0ZXh0WysraV07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgY2ggPSB0ZXh0WysraV07XG4gICAgICAgICAgICB9IHdoaWxlIChjaCAmJiBjaCAhPT0gJ1xcbicpO1xuICAgICAgICAgICAgZW5kID0gaTtcbiAgICAgICAgICAgIHN0YXJ0ID0gaSArIDE7XG4gICAgICAgICAgICBjaCA9IHRleHRbc3RhcnRdO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBlbmQ7XG59XG5cbmV4cG9ydHMuRk9MRF9CTE9DSyA9IEZPTERfQkxPQ0s7XG5leHBvcnRzLkZPTERfRkxPVyA9IEZPTERfRkxPVztcbmV4cG9ydHMuRk9MRF9RVU9URUQgPSBGT0xEX1FVT1RFRDtcbmV4cG9ydHMuZm9sZEZsb3dMaW5lcyA9IGZvbGRGbG93TGluZXM7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIFNjYWxhciA9IHJlcXVpcmUoJy4uL25vZGVzL1NjYWxhci5qcycpO1xudmFyIGZvbGRGbG93TGluZXMgPSByZXF1aXJlKCcuL2ZvbGRGbG93TGluZXMuanMnKTtcblxuY29uc3QgZ2V0Rm9sZE9wdGlvbnMgPSAoY3R4LCBpc0Jsb2NrKSA9PiAoe1xuICAgIGluZGVudEF0U3RhcnQ6IGlzQmxvY2sgPyBjdHguaW5kZW50Lmxlbmd0aCA6IGN0eC5pbmRlbnRBdFN0YXJ0LFxuICAgIGxpbmVXaWR0aDogY3R4Lm9wdGlvbnMubGluZVdpZHRoLFxuICAgIG1pbkNvbnRlbnRXaWR0aDogY3R4Lm9wdGlvbnMubWluQ29udGVudFdpZHRoXG59KTtcbi8vIEFsc28gY2hlY2tzIGZvciBsaW5lcyBzdGFydGluZyB3aXRoICUsIGFzIHBhcnNpbmcgdGhlIG91dHB1dCBhcyBZQU1MIDEuMSB3aWxsXG4vLyBwcmVzdW1lIHRoYXQncyBzdGFydGluZyBhIG5ldyBkb2N1bWVudC5cbmNvbnN0IGNvbnRhaW5zRG9jdW1lbnRNYXJrZXIgPSAoc3RyKSA9PiAvXiglfC0tLXxcXC5cXC5cXC4pL20udGVzdChzdHIpO1xuZnVuY3Rpb24gbGluZUxlbmd0aE92ZXJMaW1pdChzdHIsIGxpbmVXaWR0aCwgaW5kZW50TGVuZ3RoKSB7XG4gICAgaWYgKCFsaW5lV2lkdGggfHwgbGluZVdpZHRoIDwgMClcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIGNvbnN0IGxpbWl0ID0gbGluZVdpZHRoIC0gaW5kZW50TGVuZ3RoO1xuICAgIGNvbnN0IHN0ckxlbiA9IHN0ci5sZW5ndGg7XG4gICAgaWYgKHN0ckxlbiA8PSBsaW1pdClcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIGZvciAobGV0IGkgPSAwLCBzdGFydCA9IDA7IGkgPCBzdHJMZW47ICsraSkge1xuICAgICAgICBpZiAoc3RyW2ldID09PSAnXFxuJykge1xuICAgICAgICAgICAgaWYgKGkgLSBzdGFydCA+IGxpbWl0KVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgc3RhcnQgPSBpICsgMTtcbiAgICAgICAgICAgIGlmIChzdHJMZW4gLSBzdGFydCA8PSBsaW1pdClcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59XG5mdW5jdGlvbiBkb3VibGVRdW90ZWRTdHJpbmcodmFsdWUsIGN0eCkge1xuICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgaWYgKGN0eC5vcHRpb25zLmRvdWJsZVF1b3RlZEFzSlNPTilcbiAgICAgICAgcmV0dXJuIGpzb247XG4gICAgY29uc3QgeyBpbXBsaWNpdEtleSB9ID0gY3R4O1xuICAgIGNvbnN0IG1pbk11bHRpTGluZUxlbmd0aCA9IGN0eC5vcHRpb25zLmRvdWJsZVF1b3RlZE1pbk11bHRpTGluZUxlbmd0aDtcbiAgICBjb25zdCBpbmRlbnQgPSBjdHguaW5kZW50IHx8IChjb250YWluc0RvY3VtZW50TWFya2VyKHZhbHVlKSA/ICcgICcgOiAnJyk7XG4gICAgbGV0IHN0ciA9ICcnO1xuICAgIGxldCBzdGFydCA9IDA7XG4gICAgZm9yIChsZXQgaSA9IDAsIGNoID0ganNvbltpXTsgY2g7IGNoID0ganNvblsrK2ldKSB7XG4gICAgICAgIGlmIChjaCA9PT0gJyAnICYmIGpzb25baSArIDFdID09PSAnXFxcXCcgJiYganNvbltpICsgMl0gPT09ICduJykge1xuICAgICAgICAgICAgLy8gc3BhY2UgYmVmb3JlIG5ld2xpbmUgbmVlZHMgdG8gYmUgZXNjYXBlZCB0byBub3QgYmUgZm9sZGVkXG4gICAgICAgICAgICBzdHIgKz0ganNvbi5zbGljZShzdGFydCwgaSkgKyAnXFxcXCAnO1xuICAgICAgICAgICAgaSArPSAxO1xuICAgICAgICAgICAgc3RhcnQgPSBpO1xuICAgICAgICAgICAgY2ggPSAnXFxcXCc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoID09PSAnXFxcXCcpXG4gICAgICAgICAgICBzd2l0Y2ggKGpzb25baSArIDFdKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAndSc6XG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0ciArPSBqc29uLnNsaWNlKHN0YXJ0LCBpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvZGUgPSBqc29uLnN1YnN0cihpICsgMiwgNCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKGNvZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICcwMDAwJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9ICdcXFxcMCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJzAwMDcnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0gJ1xcXFxhJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnMDAwYic6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ciArPSAnXFxcXHYnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICcwMDFiJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9ICdcXFxcZSc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJzAwODUnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0gJ1xcXFxOJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnMDBhMCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ciArPSAnXFxcXF8nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICcyMDI4JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9ICdcXFxcTCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJzIwMjknOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0gJ1xcXFxQJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvZGUuc3Vic3RyKDAsIDIpID09PSAnMDAnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9ICdcXFxceCcgKyBjb2RlLnN1YnN0cigyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9IGpzb24uc3Vic3RyKGksIDYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaSArPSA1O1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnQgPSBpICsgMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICduJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKGltcGxpY2l0S2V5IHx8XG4gICAgICAgICAgICAgICAgICAgICAgICBqc29uW2kgKyAyXSA9PT0gJ1wiJyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAganNvbi5sZW5ndGggPCBtaW5NdWx0aUxpbmVMZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGkgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZvbGRpbmcgd2lsbCBlYXQgZmlyc3QgbmV3bGluZVxuICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9IGpzb24uc2xpY2Uoc3RhcnQsIGkpICsgJ1xcblxcbic7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAoanNvbltpICsgMl0gPT09ICdcXFxcJyAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGpzb25baSArIDNdID09PSAnbicgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqc29uW2kgKyA0XSAhPT0gJ1wiJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ciArPSAnXFxuJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpICs9IDI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0gaW5kZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc3BhY2UgYWZ0ZXIgbmV3bGluZSBuZWVkcyB0byBiZSBlc2NhcGVkIHRvIG5vdCBiZSBmb2xkZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqc29uW2kgKyAyXSA9PT0gJyAnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ciArPSAnXFxcXCc7XG4gICAgICAgICAgICAgICAgICAgICAgICBpICs9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydCA9IGkgKyAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGkgKz0gMTtcbiAgICAgICAgICAgIH1cbiAgICB9XG4gICAgc3RyID0gc3RhcnQgPyBzdHIgKyBqc29uLnNsaWNlKHN0YXJ0KSA6IGpzb247XG4gICAgcmV0dXJuIGltcGxpY2l0S2V5XG4gICAgICAgID8gc3RyXG4gICAgICAgIDogZm9sZEZsb3dMaW5lcy5mb2xkRmxvd0xpbmVzKHN0ciwgaW5kZW50LCBmb2xkRmxvd0xpbmVzLkZPTERfUVVPVEVELCBnZXRGb2xkT3B0aW9ucyhjdHgsIGZhbHNlKSk7XG59XG5mdW5jdGlvbiBzaW5nbGVRdW90ZWRTdHJpbmcodmFsdWUsIGN0eCkge1xuICAgIGlmIChjdHgub3B0aW9ucy5zaW5nbGVRdW90ZSA9PT0gZmFsc2UgfHxcbiAgICAgICAgKGN0eC5pbXBsaWNpdEtleSAmJiB2YWx1ZS5pbmNsdWRlcygnXFxuJykpIHx8XG4gICAgICAgIC9bIFxcdF1cXG58XFxuWyBcXHRdLy50ZXN0KHZhbHVlKSAvLyBzaW5nbGUgcXVvdGVkIHN0cmluZyBjYW4ndCBoYXZlIGxlYWRpbmcgb3IgdHJhaWxpbmcgd2hpdGVzcGFjZSBhcm91bmQgbmV3bGluZVxuICAgIClcbiAgICAgICAgcmV0dXJuIGRvdWJsZVF1b3RlZFN0cmluZyh2YWx1ZSwgY3R4KTtcbiAgICBjb25zdCBpbmRlbnQgPSBjdHguaW5kZW50IHx8IChjb250YWluc0RvY3VtZW50TWFya2VyKHZhbHVlKSA/ICcgICcgOiAnJyk7XG4gICAgY29uc3QgcmVzID0gXCInXCIgKyB2YWx1ZS5yZXBsYWNlKC8nL2csIFwiJydcIikucmVwbGFjZSgvXFxuKy9nLCBgJCZcXG4ke2luZGVudH1gKSArIFwiJ1wiO1xuICAgIHJldHVybiBjdHguaW1wbGljaXRLZXlcbiAgICAgICAgPyByZXNcbiAgICAgICAgOiBmb2xkRmxvd0xpbmVzLmZvbGRGbG93TGluZXMocmVzLCBpbmRlbnQsIGZvbGRGbG93TGluZXMuRk9MRF9GTE9XLCBnZXRGb2xkT3B0aW9ucyhjdHgsIGZhbHNlKSk7XG59XG5mdW5jdGlvbiBxdW90ZWRTdHJpbmcodmFsdWUsIGN0eCkge1xuICAgIGNvbnN0IHsgc2luZ2xlUXVvdGUgfSA9IGN0eC5vcHRpb25zO1xuICAgIGxldCBxcztcbiAgICBpZiAoc2luZ2xlUXVvdGUgPT09IGZhbHNlKVxuICAgICAgICBxcyA9IGRvdWJsZVF1b3RlZFN0cmluZztcbiAgICBlbHNlIHtcbiAgICAgICAgY29uc3QgaGFzRG91YmxlID0gdmFsdWUuaW5jbHVkZXMoJ1wiJyk7XG4gICAgICAgIGNvbnN0IGhhc1NpbmdsZSA9IHZhbHVlLmluY2x1ZGVzKFwiJ1wiKTtcbiAgICAgICAgaWYgKGhhc0RvdWJsZSAmJiAhaGFzU2luZ2xlKVxuICAgICAgICAgICAgcXMgPSBzaW5nbGVRdW90ZWRTdHJpbmc7XG4gICAgICAgIGVsc2UgaWYgKGhhc1NpbmdsZSAmJiAhaGFzRG91YmxlKVxuICAgICAgICAgICAgcXMgPSBkb3VibGVRdW90ZWRTdHJpbmc7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHFzID0gc2luZ2xlUXVvdGUgPyBzaW5nbGVRdW90ZWRTdHJpbmcgOiBkb3VibGVRdW90ZWRTdHJpbmc7XG4gICAgfVxuICAgIHJldHVybiBxcyh2YWx1ZSwgY3R4KTtcbn1cbi8vIFRoZSBuZWdhdGl2ZSBsb29rYmVoaW5kIGF2b2lkcyBhIHBvbHlub21pYWwgc2VhcmNoLFxuLy8gYnV0IGlzbid0IHN1cHBvcnRlZCB5ZXQgb24gU2FmYXJpOiBodHRwczovL2Nhbml1c2UuY29tL2pzLXJlZ2V4cC1sb29rYmVoaW5kXG5sZXQgYmxvY2tFbmROZXdsaW5lcztcbnRyeSB7XG4gICAgYmxvY2tFbmROZXdsaW5lcyA9IG5ldyBSZWdFeHAoJyhefCg/PCFcXG4pKVxcbisoPyFcXG58JCknLCAnZycpO1xufVxuY2F0Y2gge1xuICAgIGJsb2NrRW5kTmV3bGluZXMgPSAvXFxuKyg/IVxcbnwkKS9nO1xufVxuZnVuY3Rpb24gYmxvY2tTdHJpbmcoeyBjb21tZW50LCB0eXBlLCB2YWx1ZSB9LCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApIHtcbiAgICBjb25zdCB7IGJsb2NrUXVvdGUsIGNvbW1lbnRTdHJpbmcsIGxpbmVXaWR0aCB9ID0gY3R4Lm9wdGlvbnM7XG4gICAgLy8gMS4gQmxvY2sgY2FuJ3QgZW5kIGluIHdoaXRlc3BhY2UgdW5sZXNzIHRoZSBsYXN0IGxpbmUgaXMgbm9uLWVtcHR5LlxuICAgIC8vIDIuIFN0cmluZ3MgY29uc2lzdGluZyBvZiBvbmx5IHdoaXRlc3BhY2UgYXJlIGJlc3QgcmVuZGVyZWQgZXhwbGljaXRseS5cbiAgICBpZiAoIWJsb2NrUXVvdGUgfHwgL1xcbltcXHQgXSskLy50ZXN0KHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gcXVvdGVkU3RyaW5nKHZhbHVlLCBjdHgpO1xuICAgIH1cbiAgICBjb25zdCBpbmRlbnQgPSBjdHguaW5kZW50IHx8XG4gICAgICAgIChjdHguZm9yY2VCbG9ja0luZGVudCB8fCBjb250YWluc0RvY3VtZW50TWFya2VyKHZhbHVlKSA/ICcgICcgOiAnJyk7XG4gICAgY29uc3QgbGl0ZXJhbCA9IGJsb2NrUXVvdGUgPT09ICdsaXRlcmFsJ1xuICAgICAgICA/IHRydWVcbiAgICAgICAgOiBibG9ja1F1b3RlID09PSAnZm9sZGVkJyB8fCB0eXBlID09PSBTY2FsYXIuU2NhbGFyLkJMT0NLX0ZPTERFRFxuICAgICAgICAgICAgPyBmYWxzZVxuICAgICAgICAgICAgOiB0eXBlID09PSBTY2FsYXIuU2NhbGFyLkJMT0NLX0xJVEVSQUxcbiAgICAgICAgICAgICAgICA/IHRydWVcbiAgICAgICAgICAgICAgICA6ICFsaW5lTGVuZ3RoT3ZlckxpbWl0KHZhbHVlLCBsaW5lV2lkdGgsIGluZGVudC5sZW5ndGgpO1xuICAgIGlmICghdmFsdWUpXG4gICAgICAgIHJldHVybiBsaXRlcmFsID8gJ3xcXG4nIDogJz5cXG4nO1xuICAgIC8vIGRldGVybWluZSBjaG9tcGluZyBmcm9tIHdoaXRlc3BhY2UgYXQgdmFsdWUgZW5kXG4gICAgbGV0IGNob21wO1xuICAgIGxldCBlbmRTdGFydDtcbiAgICBmb3IgKGVuZFN0YXJ0ID0gdmFsdWUubGVuZ3RoOyBlbmRTdGFydCA+IDA7IC0tZW5kU3RhcnQpIHtcbiAgICAgICAgY29uc3QgY2ggPSB2YWx1ZVtlbmRTdGFydCAtIDFdO1xuICAgICAgICBpZiAoY2ggIT09ICdcXG4nICYmIGNoICE9PSAnXFx0JyAmJiBjaCAhPT0gJyAnKVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGxldCBlbmQgPSB2YWx1ZS5zdWJzdHJpbmcoZW5kU3RhcnQpO1xuICAgIGNvbnN0IGVuZE5sUG9zID0gZW5kLmluZGV4T2YoJ1xcbicpO1xuICAgIGlmIChlbmRObFBvcyA9PT0gLTEpIHtcbiAgICAgICAgY2hvbXAgPSAnLSc7IC8vIHN0cmlwXG4gICAgfVxuICAgIGVsc2UgaWYgKHZhbHVlID09PSBlbmQgfHwgZW5kTmxQb3MgIT09IGVuZC5sZW5ndGggLSAxKSB7XG4gICAgICAgIGNob21wID0gJysnOyAvLyBrZWVwXG4gICAgICAgIGlmIChvbkNob21wS2VlcClcbiAgICAgICAgICAgIG9uQ2hvbXBLZWVwKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjaG9tcCA9ICcnOyAvLyBjbGlwXG4gICAgfVxuICAgIGlmIChlbmQpIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5zbGljZSgwLCAtZW5kLmxlbmd0aCk7XG4gICAgICAgIGlmIChlbmRbZW5kLmxlbmd0aCAtIDFdID09PSAnXFxuJylcbiAgICAgICAgICAgIGVuZCA9IGVuZC5zbGljZSgwLCAtMSk7XG4gICAgICAgIGVuZCA9IGVuZC5yZXBsYWNlKGJsb2NrRW5kTmV3bGluZXMsIGAkJiR7aW5kZW50fWApO1xuICAgIH1cbiAgICAvLyBkZXRlcm1pbmUgaW5kZW50IGluZGljYXRvciBmcm9tIHdoaXRlc3BhY2UgYXQgdmFsdWUgc3RhcnRcbiAgICBsZXQgc3RhcnRXaXRoU3BhY2UgPSBmYWxzZTtcbiAgICBsZXQgc3RhcnRFbmQ7XG4gICAgbGV0IHN0YXJ0TmxQb3MgPSAtMTtcbiAgICBmb3IgKHN0YXJ0RW5kID0gMDsgc3RhcnRFbmQgPCB2YWx1ZS5sZW5ndGg7ICsrc3RhcnRFbmQpIHtcbiAgICAgICAgY29uc3QgY2ggPSB2YWx1ZVtzdGFydEVuZF07XG4gICAgICAgIGlmIChjaCA9PT0gJyAnKVxuICAgICAgICAgICAgc3RhcnRXaXRoU3BhY2UgPSB0cnVlO1xuICAgICAgICBlbHNlIGlmIChjaCA9PT0gJ1xcbicpXG4gICAgICAgICAgICBzdGFydE5sUG9zID0gc3RhcnRFbmQ7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBsZXQgc3RhcnQgPSB2YWx1ZS5zdWJzdHJpbmcoMCwgc3RhcnRObFBvcyA8IHN0YXJ0RW5kID8gc3RhcnRObFBvcyArIDEgOiBzdGFydEVuZCk7XG4gICAgaWYgKHN0YXJ0KSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWUuc3Vic3RyaW5nKHN0YXJ0Lmxlbmd0aCk7XG4gICAgICAgIHN0YXJ0ID0gc3RhcnQucmVwbGFjZSgvXFxuKy9nLCBgJCYke2luZGVudH1gKTtcbiAgICB9XG4gICAgY29uc3QgaW5kZW50U2l6ZSA9IGluZGVudCA/ICcyJyA6ICcxJzsgLy8gcm9vdCBpcyBhdCAtMVxuICAgIC8vIExlYWRpbmcgfCBvciA+IGlzIGFkZGVkIGxhdGVyXG4gICAgbGV0IGhlYWRlciA9IChzdGFydFdpdGhTcGFjZSA/IGluZGVudFNpemUgOiAnJykgKyBjaG9tcDtcbiAgICBpZiAoY29tbWVudCkge1xuICAgICAgICBoZWFkZXIgKz0gJyAnICsgY29tbWVudFN0cmluZyhjb21tZW50LnJlcGxhY2UoLyA/W1xcclxcbl0rL2csICcgJykpO1xuICAgICAgICBpZiAob25Db21tZW50KVxuICAgICAgICAgICAgb25Db21tZW50KCk7XG4gICAgfVxuICAgIGlmICghbGl0ZXJhbCkge1xuICAgICAgICBjb25zdCBmb2xkZWRWYWx1ZSA9IHZhbHVlXG4gICAgICAgICAgICAucmVwbGFjZSgvXFxuKy9nLCAnXFxuJCYnKVxuICAgICAgICAgICAgLnJlcGxhY2UoLyg/Ol58XFxuKShbXFx0IF0uKikoPzooW1xcblxcdCBdKilcXG4oPyFbXFxuXFx0IF0pKT8vZywgJyQxJDInKSAvLyBtb3JlLWluZGVudGVkIGxpbmVzIGFyZW4ndCBmb2xkZWRcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIF4gbW9yZS1pbmQuIF4gZW1wdHkgICAgIF4gY2FwdHVyZSBuZXh0IGVtcHR5IGxpbmVzIG9ubHkgYXQgZW5kIG9mIGluZGVudFxuICAgICAgICAgICAgLnJlcGxhY2UoL1xcbisvZywgYCQmJHtpbmRlbnR9YCk7XG4gICAgICAgIGxldCBsaXRlcmFsRmFsbGJhY2sgPSBmYWxzZTtcbiAgICAgICAgY29uc3QgZm9sZE9wdGlvbnMgPSBnZXRGb2xkT3B0aW9ucyhjdHgsIHRydWUpO1xuICAgICAgICBpZiAoYmxvY2tRdW90ZSAhPT0gJ2ZvbGRlZCcgJiYgdHlwZSAhPT0gU2NhbGFyLlNjYWxhci5CTE9DS19GT0xERUQpIHtcbiAgICAgICAgICAgIGZvbGRPcHRpb25zLm9uT3ZlcmZsb3cgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgbGl0ZXJhbEZhbGxiYWNrID0gdHJ1ZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYm9keSA9IGZvbGRGbG93TGluZXMuZm9sZEZsb3dMaW5lcyhgJHtzdGFydH0ke2ZvbGRlZFZhbHVlfSR7ZW5kfWAsIGluZGVudCwgZm9sZEZsb3dMaW5lcy5GT0xEX0JMT0NLLCBmb2xkT3B0aW9ucyk7XG4gICAgICAgIGlmICghbGl0ZXJhbEZhbGxiYWNrKVxuICAgICAgICAgICAgcmV0dXJuIGA+JHtoZWFkZXJ9XFxuJHtpbmRlbnR9JHtib2R5fWA7XG4gICAgfVxuICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZSgvXFxuKy9nLCBgJCYke2luZGVudH1gKTtcbiAgICByZXR1cm4gYHwke2hlYWRlcn1cXG4ke2luZGVudH0ke3N0YXJ0fSR7dmFsdWV9JHtlbmR9YDtcbn1cbmZ1bmN0aW9uIHBsYWluU3RyaW5nKGl0ZW0sIGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCkge1xuICAgIGNvbnN0IHsgdHlwZSwgdmFsdWUgfSA9IGl0ZW07XG4gICAgY29uc3QgeyBhY3R1YWxTdHJpbmcsIGltcGxpY2l0S2V5LCBpbmRlbnQsIGluZGVudFN0ZXAsIGluRmxvdyB9ID0gY3R4O1xuICAgIGlmICgoaW1wbGljaXRLZXkgJiYgdmFsdWUuaW5jbHVkZXMoJ1xcbicpKSB8fFxuICAgICAgICAoaW5GbG93ICYmIC9bW1xcXXt9LF0vLnRlc3QodmFsdWUpKSkge1xuICAgICAgICByZXR1cm4gcXVvdGVkU3RyaW5nKHZhbHVlLCBjdHgpO1xuICAgIH1cbiAgICBpZiAoL15bXFxuXFx0ICxbXFxde30jJiohfD4nXCIlQGBdfF5bPy1dJHxeWz8tXVsgXFx0XXxbXFxuOl1bIFxcdF18WyBcXHRdXFxufFtcXG5cXHQgXSN8W1xcblxcdCA6XSQvLnRlc3QodmFsdWUpKSB7XG4gICAgICAgIC8vIG5vdCBhbGxvd2VkOlxuICAgICAgICAvLyAtICctJyBvciAnPydcbiAgICAgICAgLy8gLSBzdGFydCB3aXRoIGFuIGluZGljYXRvciBjaGFyYWN0ZXIgKGV4Y2VwdCBbPzotXSkgb3IgL1s/LV0gL1xuICAgICAgICAvLyAtICdcXG4gJywgJzogJyBvciAnIFxcbicgYW55d2hlcmVcbiAgICAgICAgLy8gLSAnIycgbm90IHByZWNlZGVkIGJ5IGEgbm9uLXNwYWNlIGNoYXJcbiAgICAgICAgLy8gLSBlbmQgd2l0aCAnICcgb3IgJzonXG4gICAgICAgIHJldHVybiBpbXBsaWNpdEtleSB8fCBpbkZsb3cgfHwgIXZhbHVlLmluY2x1ZGVzKCdcXG4nKVxuICAgICAgICAgICAgPyBxdW90ZWRTdHJpbmcodmFsdWUsIGN0eClcbiAgICAgICAgICAgIDogYmxvY2tTdHJpbmcoaXRlbSwgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKTtcbiAgICB9XG4gICAgaWYgKCFpbXBsaWNpdEtleSAmJlxuICAgICAgICAhaW5GbG93ICYmXG4gICAgICAgIHR5cGUgIT09IFNjYWxhci5TY2FsYXIuUExBSU4gJiZcbiAgICAgICAgdmFsdWUuaW5jbHVkZXMoJ1xcbicpKSB7XG4gICAgICAgIC8vIFdoZXJlIGFsbG93ZWQgJiB0eXBlIG5vdCBzZXQgZXhwbGljaXRseSwgcHJlZmVyIGJsb2NrIHN0eWxlIGZvciBtdWx0aWxpbmUgc3RyaW5nc1xuICAgICAgICByZXR1cm4gYmxvY2tTdHJpbmcoaXRlbSwgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKTtcbiAgICB9XG4gICAgaWYgKGNvbnRhaW5zRG9jdW1lbnRNYXJrZXIodmFsdWUpKSB7XG4gICAgICAgIGlmIChpbmRlbnQgPT09ICcnKSB7XG4gICAgICAgICAgICBjdHguZm9yY2VCbG9ja0luZGVudCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm4gYmxvY2tTdHJpbmcoaXRlbSwgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpbXBsaWNpdEtleSAmJiBpbmRlbnQgPT09IGluZGVudFN0ZXApIHtcbiAgICAgICAgICAgIHJldHVybiBxdW90ZWRTdHJpbmcodmFsdWUsIGN0eCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3Qgc3RyID0gdmFsdWUucmVwbGFjZSgvXFxuKy9nLCBgJCZcXG4ke2luZGVudH1gKTtcbiAgICAvLyBWZXJpZnkgdGhhdCBvdXRwdXQgd2lsbCBiZSBwYXJzZWQgYXMgYSBzdHJpbmcsIGFzIGUuZy4gcGxhaW4gbnVtYmVycyBhbmRcbiAgICAvLyBib29sZWFucyBnZXQgcGFyc2VkIHdpdGggdGhvc2UgdHlwZXMgaW4gdjEuMiAoZS5nLiAnNDInLCAndHJ1ZScgJiAnMC45ZS0zJyksXG4gICAgLy8gYW5kIG90aGVycyBpbiB2MS4xLlxuICAgIGlmIChhY3R1YWxTdHJpbmcpIHtcbiAgICAgICAgY29uc3QgdGVzdCA9ICh0YWcpID0+IHRhZy5kZWZhdWx0ICYmIHRhZy50YWcgIT09ICd0YWc6eWFtbC5vcmcsMjAwMjpzdHInICYmIHRhZy50ZXN0Py50ZXN0KHN0cik7XG4gICAgICAgIGNvbnN0IHsgY29tcGF0LCB0YWdzIH0gPSBjdHguZG9jLnNjaGVtYTtcbiAgICAgICAgaWYgKHRhZ3Muc29tZSh0ZXN0KSB8fCBjb21wYXQ/LnNvbWUodGVzdCkpXG4gICAgICAgICAgICByZXR1cm4gcXVvdGVkU3RyaW5nKHZhbHVlLCBjdHgpO1xuICAgIH1cbiAgICByZXR1cm4gaW1wbGljaXRLZXlcbiAgICAgICAgPyBzdHJcbiAgICAgICAgOiBmb2xkRmxvd0xpbmVzLmZvbGRGbG93TGluZXMoc3RyLCBpbmRlbnQsIGZvbGRGbG93TGluZXMuRk9MRF9GTE9XLCBnZXRGb2xkT3B0aW9ucyhjdHgsIGZhbHNlKSk7XG59XG5mdW5jdGlvbiBzdHJpbmdpZnlTdHJpbmcoaXRlbSwgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKSB7XG4gICAgY29uc3QgeyBpbXBsaWNpdEtleSwgaW5GbG93IH0gPSBjdHg7XG4gICAgY29uc3Qgc3MgPSB0eXBlb2YgaXRlbS52YWx1ZSA9PT0gJ3N0cmluZydcbiAgICAgICAgPyBpdGVtXG4gICAgICAgIDogT2JqZWN0LmFzc2lnbih7fSwgaXRlbSwgeyB2YWx1ZTogU3RyaW5nKGl0ZW0udmFsdWUpIH0pO1xuICAgIGxldCB7IHR5cGUgfSA9IGl0ZW07XG4gICAgaWYgKHR5cGUgIT09IFNjYWxhci5TY2FsYXIuUVVPVEVfRE9VQkxFKSB7XG4gICAgICAgIC8vIGZvcmNlIGRvdWJsZSBxdW90ZXMgb24gY29udHJvbCBjaGFyYWN0ZXJzICYgdW5wYWlyZWQgc3Vycm9nYXRlc1xuICAgICAgICBpZiAoL1tcXHgwMC1cXHgwOFxceDBiLVxceDFmXFx4N2YtXFx4OWZcXHV7RDgwMH0tXFx1e0RGRkZ9XS91LnRlc3Qoc3MudmFsdWUpKVxuICAgICAgICAgICAgdHlwZSA9IFNjYWxhci5TY2FsYXIuUVVPVEVfRE9VQkxFO1xuICAgIH1cbiAgICBjb25zdCBfc3RyaW5naWZ5ID0gKF90eXBlKSA9PiB7XG4gICAgICAgIHN3aXRjaCAoX3R5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgU2NhbGFyLlNjYWxhci5CTE9DS19GT0xERUQ6XG4gICAgICAgICAgICBjYXNlIFNjYWxhci5TY2FsYXIuQkxPQ0tfTElURVJBTDpcbiAgICAgICAgICAgICAgICByZXR1cm4gaW1wbGljaXRLZXkgfHwgaW5GbG93XG4gICAgICAgICAgICAgICAgICAgID8gcXVvdGVkU3RyaW5nKHNzLnZhbHVlLCBjdHgpIC8vIGJsb2NrcyBhcmUgbm90IHZhbGlkIGluc2lkZSBmbG93IGNvbnRhaW5lcnNcbiAgICAgICAgICAgICAgICAgICAgOiBibG9ja1N0cmluZyhzcywgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKTtcbiAgICAgICAgICAgIGNhc2UgU2NhbGFyLlNjYWxhci5RVU9URV9ET1VCTEU6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvdWJsZVF1b3RlZFN0cmluZyhzcy52YWx1ZSwgY3R4KTtcbiAgICAgICAgICAgIGNhc2UgU2NhbGFyLlNjYWxhci5RVU9URV9TSU5HTEU6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNpbmdsZVF1b3RlZFN0cmluZyhzcy52YWx1ZSwgY3R4KTtcbiAgICAgICAgICAgIGNhc2UgU2NhbGFyLlNjYWxhci5QTEFJTjpcbiAgICAgICAgICAgICAgICByZXR1cm4gcGxhaW5TdHJpbmcoc3MsIGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCk7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBsZXQgcmVzID0gX3N0cmluZ2lmeSh0eXBlKTtcbiAgICBpZiAocmVzID09PSBudWxsKSB7XG4gICAgICAgIGNvbnN0IHsgZGVmYXVsdEtleVR5cGUsIGRlZmF1bHRTdHJpbmdUeXBlIH0gPSBjdHgub3B0aW9ucztcbiAgICAgICAgY29uc3QgdCA9IChpbXBsaWNpdEtleSAmJiBkZWZhdWx0S2V5VHlwZSkgfHwgZGVmYXVsdFN0cmluZ1R5cGU7XG4gICAgICAgIHJlcyA9IF9zdHJpbmdpZnkodCk7XG4gICAgICAgIGlmIChyZXMgPT09IG51bGwpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIGRlZmF1bHQgc3RyaW5nIHR5cGUgJHt0fWApO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xufVxuXG5leHBvcnRzLnN0cmluZ2lmeVN0cmluZyA9IHN0cmluZ2lmeVN0cmluZztcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYW5jaG9ycyA9IHJlcXVpcmUoJy4uL2RvYy9hbmNob3JzLmpzJyk7XG52YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuLi9ub2Rlcy9pZGVudGl0eS5qcycpO1xudmFyIHN0cmluZ2lmeUNvbW1lbnQgPSByZXF1aXJlKCcuL3N0cmluZ2lmeUNvbW1lbnQuanMnKTtcbnZhciBzdHJpbmdpZnlTdHJpbmcgPSByZXF1aXJlKCcuL3N0cmluZ2lmeVN0cmluZy5qcycpO1xuXG5mdW5jdGlvbiBjcmVhdGVTdHJpbmdpZnlDb250ZXh0KGRvYywgb3B0aW9ucykge1xuICAgIGNvbnN0IG9wdCA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgICBibG9ja1F1b3RlOiB0cnVlLFxuICAgICAgICBjb21tZW50U3RyaW5nOiBzdHJpbmdpZnlDb21tZW50LnN0cmluZ2lmeUNvbW1lbnQsXG4gICAgICAgIGRlZmF1bHRLZXlUeXBlOiBudWxsLFxuICAgICAgICBkZWZhdWx0U3RyaW5nVHlwZTogJ1BMQUlOJyxcbiAgICAgICAgZGlyZWN0aXZlczogbnVsbCxcbiAgICAgICAgZG91YmxlUXVvdGVkQXNKU09OOiBmYWxzZSxcbiAgICAgICAgZG91YmxlUXVvdGVkTWluTXVsdGlMaW5lTGVuZ3RoOiA0MCxcbiAgICAgICAgZmFsc2VTdHI6ICdmYWxzZScsXG4gICAgICAgIGZsb3dDb2xsZWN0aW9uUGFkZGluZzogdHJ1ZSxcbiAgICAgICAgaW5kZW50U2VxOiB0cnVlLFxuICAgICAgICBsaW5lV2lkdGg6IDgwLFxuICAgICAgICBtaW5Db250ZW50V2lkdGg6IDIwLFxuICAgICAgICBudWxsU3RyOiAnbnVsbCcsXG4gICAgICAgIHNpbXBsZUtleXM6IGZhbHNlLFxuICAgICAgICBzaW5nbGVRdW90ZTogbnVsbCxcbiAgICAgICAgdHJ1ZVN0cjogJ3RydWUnLFxuICAgICAgICB2ZXJpZnlBbGlhc09yZGVyOiB0cnVlXG4gICAgfSwgZG9jLnNjaGVtYS50b1N0cmluZ09wdGlvbnMsIG9wdGlvbnMpO1xuICAgIGxldCBpbkZsb3c7XG4gICAgc3dpdGNoIChvcHQuY29sbGVjdGlvblN0eWxlKSB7XG4gICAgICAgIGNhc2UgJ2Jsb2NrJzpcbiAgICAgICAgICAgIGluRmxvdyA9IGZhbHNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2Zsb3cnOlxuICAgICAgICAgICAgaW5GbG93ID0gdHJ1ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgaW5GbG93ID0gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgYW5jaG9yczogbmV3IFNldCgpLFxuICAgICAgICBkb2MsXG4gICAgICAgIGZsb3dDb2xsZWN0aW9uUGFkZGluZzogb3B0LmZsb3dDb2xsZWN0aW9uUGFkZGluZyA/ICcgJyA6ICcnLFxuICAgICAgICBpbmRlbnQ6ICcnLFxuICAgICAgICBpbmRlbnRTdGVwOiB0eXBlb2Ygb3B0LmluZGVudCA9PT0gJ251bWJlcicgPyAnICcucmVwZWF0KG9wdC5pbmRlbnQpIDogJyAgJyxcbiAgICAgICAgaW5GbG93LFxuICAgICAgICBvcHRpb25zOiBvcHRcbiAgICB9O1xufVxuZnVuY3Rpb24gZ2V0VGFnT2JqZWN0KHRhZ3MsIGl0ZW0pIHtcbiAgICBpZiAoaXRlbS50YWcpIHtcbiAgICAgICAgY29uc3QgbWF0Y2ggPSB0YWdzLmZpbHRlcih0ID0+IHQudGFnID09PSBpdGVtLnRhZyk7XG4gICAgICAgIGlmIChtYXRjaC5sZW5ndGggPiAwKVxuICAgICAgICAgICAgcmV0dXJuIG1hdGNoLmZpbmQodCA9PiB0LmZvcm1hdCA9PT0gaXRlbS5mb3JtYXQpID8/IG1hdGNoWzBdO1xuICAgIH1cbiAgICBsZXQgdGFnT2JqID0gdW5kZWZpbmVkO1xuICAgIGxldCBvYmo7XG4gICAgaWYgKGlkZW50aXR5LmlzU2NhbGFyKGl0ZW0pKSB7XG4gICAgICAgIG9iaiA9IGl0ZW0udmFsdWU7XG4gICAgICAgIGxldCBtYXRjaCA9IHRhZ3MuZmlsdGVyKHQgPT4gdC5pZGVudGlmeT8uKG9iaikpO1xuICAgICAgICBpZiAobWF0Y2gubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgY29uc3QgdGVzdE1hdGNoID0gbWF0Y2guZmlsdGVyKHQgPT4gdC50ZXN0KTtcbiAgICAgICAgICAgIGlmICh0ZXN0TWF0Y2gubGVuZ3RoID4gMClcbiAgICAgICAgICAgICAgICBtYXRjaCA9IHRlc3RNYXRjaDtcbiAgICAgICAgfVxuICAgICAgICB0YWdPYmogPVxuICAgICAgICAgICAgbWF0Y2guZmluZCh0ID0+IHQuZm9ybWF0ID09PSBpdGVtLmZvcm1hdCkgPz8gbWF0Y2guZmluZCh0ID0+ICF0LmZvcm1hdCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBvYmogPSBpdGVtO1xuICAgICAgICB0YWdPYmogPSB0YWdzLmZpbmQodCA9PiB0Lm5vZGVDbGFzcyAmJiBvYmogaW5zdGFuY2VvZiB0Lm5vZGVDbGFzcyk7XG4gICAgfVxuICAgIGlmICghdGFnT2JqKSB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBvYmo/LmNvbnN0cnVjdG9yPy5uYW1lID8/IChvYmogPT09IG51bGwgPyAnbnVsbCcgOiB0eXBlb2Ygb2JqKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUYWcgbm90IHJlc29sdmVkIGZvciAke25hbWV9IHZhbHVlYCk7XG4gICAgfVxuICAgIHJldHVybiB0YWdPYmo7XG59XG4vLyBuZWVkcyB0byBiZSBjYWxsZWQgYmVmb3JlIHZhbHVlIHN0cmluZ2lmaWVyIHRvIGFsbG93IGZvciBjaXJjdWxhciBhbmNob3IgcmVmc1xuZnVuY3Rpb24gc3RyaW5naWZ5UHJvcHMobm9kZSwgdGFnT2JqLCB7IGFuY2hvcnM6IGFuY2hvcnMkMSwgZG9jIH0pIHtcbiAgICBpZiAoIWRvYy5kaXJlY3RpdmVzKVxuICAgICAgICByZXR1cm4gJyc7XG4gICAgY29uc3QgcHJvcHMgPSBbXTtcbiAgICBjb25zdCBhbmNob3IgPSAoaWRlbnRpdHkuaXNTY2FsYXIobm9kZSkgfHwgaWRlbnRpdHkuaXNDb2xsZWN0aW9uKG5vZGUpKSAmJiBub2RlLmFuY2hvcjtcbiAgICBpZiAoYW5jaG9yICYmIGFuY2hvcnMuYW5jaG9ySXNWYWxpZChhbmNob3IpKSB7XG4gICAgICAgIGFuY2hvcnMkMS5hZGQoYW5jaG9yKTtcbiAgICAgICAgcHJvcHMucHVzaChgJiR7YW5jaG9yfWApO1xuICAgIH1cbiAgICBjb25zdCB0YWcgPSBub2RlLnRhZyA/PyAodGFnT2JqLmRlZmF1bHQgPyBudWxsIDogdGFnT2JqLnRhZyk7XG4gICAgaWYgKHRhZylcbiAgICAgICAgcHJvcHMucHVzaChkb2MuZGlyZWN0aXZlcy50YWdTdHJpbmcodGFnKSk7XG4gICAgcmV0dXJuIHByb3BzLmpvaW4oJyAnKTtcbn1cbmZ1bmN0aW9uIHN0cmluZ2lmeShpdGVtLCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApIHtcbiAgICBpZiAoaWRlbnRpdHkuaXNQYWlyKGl0ZW0pKVxuICAgICAgICByZXR1cm4gaXRlbS50b1N0cmluZyhjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApO1xuICAgIGlmIChpZGVudGl0eS5pc0FsaWFzKGl0ZW0pKSB7XG4gICAgICAgIGlmIChjdHguZG9jLmRpcmVjdGl2ZXMpXG4gICAgICAgICAgICByZXR1cm4gaXRlbS50b1N0cmluZyhjdHgpO1xuICAgICAgICBpZiAoY3R4LnJlc29sdmVkQWxpYXNlcz8uaGFzKGl0ZW0pKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBDYW5ub3Qgc3RyaW5naWZ5IGNpcmN1bGFyIHN0cnVjdHVyZSB3aXRob3V0IGFsaWFzIG5vZGVzYCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoY3R4LnJlc29sdmVkQWxpYXNlcylcbiAgICAgICAgICAgICAgICBjdHgucmVzb2x2ZWRBbGlhc2VzLmFkZChpdGVtKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBjdHgucmVzb2x2ZWRBbGlhc2VzID0gbmV3IFNldChbaXRlbV0pO1xuICAgICAgICAgICAgaXRlbSA9IGl0ZW0ucmVzb2x2ZShjdHguZG9jKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBsZXQgdGFnT2JqID0gdW5kZWZpbmVkO1xuICAgIGNvbnN0IG5vZGUgPSBpZGVudGl0eS5pc05vZGUoaXRlbSlcbiAgICAgICAgPyBpdGVtXG4gICAgICAgIDogY3R4LmRvYy5jcmVhdGVOb2RlKGl0ZW0sIHsgb25UYWdPYmo6IG8gPT4gKHRhZ09iaiA9IG8pIH0pO1xuICAgIHRhZ09iaiA/PyAodGFnT2JqID0gZ2V0VGFnT2JqZWN0KGN0eC5kb2Muc2NoZW1hLnRhZ3MsIG5vZGUpKTtcbiAgICBjb25zdCBwcm9wcyA9IHN0cmluZ2lmeVByb3BzKG5vZGUsIHRhZ09iaiwgY3R4KTtcbiAgICBpZiAocHJvcHMubGVuZ3RoID4gMClcbiAgICAgICAgY3R4LmluZGVudEF0U3RhcnQgPSAoY3R4LmluZGVudEF0U3RhcnQgPz8gMCkgKyBwcm9wcy5sZW5ndGggKyAxO1xuICAgIGNvbnN0IHN0ciA9IHR5cGVvZiB0YWdPYmouc3RyaW5naWZ5ID09PSAnZnVuY3Rpb24nXG4gICAgICAgID8gdGFnT2JqLnN0cmluZ2lmeShub2RlLCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApXG4gICAgICAgIDogaWRlbnRpdHkuaXNTY2FsYXIobm9kZSlcbiAgICAgICAgICAgID8gc3RyaW5naWZ5U3RyaW5nLnN0cmluZ2lmeVN0cmluZyhub2RlLCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApXG4gICAgICAgICAgICA6IG5vZGUudG9TdHJpbmcoY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKTtcbiAgICBpZiAoIXByb3BzKVxuICAgICAgICByZXR1cm4gc3RyO1xuICAgIHJldHVybiBpZGVudGl0eS5pc1NjYWxhcihub2RlKSB8fCBzdHJbMF0gPT09ICd7JyB8fCBzdHJbMF0gPT09ICdbJ1xuICAgICAgICA/IGAke3Byb3BzfSAke3N0cn1gXG4gICAgICAgIDogYCR7cHJvcHN9XFxuJHtjdHguaW5kZW50fSR7c3RyfWA7XG59XG5cbmV4cG9ydHMuY3JlYXRlU3RyaW5naWZ5Q29udGV4dCA9IGNyZWF0ZVN0cmluZ2lmeUNvbnRleHQ7XG5leHBvcnRzLnN0cmluZ2lmeSA9IHN0cmluZ2lmeTtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuLi9ub2Rlcy9pZGVudGl0eS5qcycpO1xudmFyIFNjYWxhciA9IHJlcXVpcmUoJy4uL25vZGVzL1NjYWxhci5qcycpO1xudmFyIHN0cmluZ2lmeSA9IHJlcXVpcmUoJy4vc3RyaW5naWZ5LmpzJyk7XG52YXIgc3RyaW5naWZ5Q29tbWVudCA9IHJlcXVpcmUoJy4vc3RyaW5naWZ5Q29tbWVudC5qcycpO1xuXG5mdW5jdGlvbiBzdHJpbmdpZnlQYWlyKHsga2V5LCB2YWx1ZSB9LCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApIHtcbiAgICBjb25zdCB7IGFsbE51bGxWYWx1ZXMsIGRvYywgaW5kZW50LCBpbmRlbnRTdGVwLCBvcHRpb25zOiB7IGNvbW1lbnRTdHJpbmcsIGluZGVudFNlcSwgc2ltcGxlS2V5cyB9IH0gPSBjdHg7XG4gICAgbGV0IGtleUNvbW1lbnQgPSAoaWRlbnRpdHkuaXNOb2RlKGtleSkgJiYga2V5LmNvbW1lbnQpIHx8IG51bGw7XG4gICAgaWYgKHNpbXBsZUtleXMpIHtcbiAgICAgICAgaWYgKGtleUNvbW1lbnQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignV2l0aCBzaW1wbGUga2V5cywga2V5IG5vZGVzIGNhbm5vdCBoYXZlIGNvbW1lbnRzJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlkZW50aXR5LmlzQ29sbGVjdGlvbihrZXkpIHx8ICghaWRlbnRpdHkuaXNOb2RlKGtleSkgJiYgdHlwZW9mIGtleSA9PT0gJ29iamVjdCcpKSB7XG4gICAgICAgICAgICBjb25zdCBtc2cgPSAnV2l0aCBzaW1wbGUga2V5cywgY29sbGVjdGlvbiBjYW5ub3QgYmUgdXNlZCBhcyBhIGtleSB2YWx1ZSc7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IobXNnKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBsZXQgZXhwbGljaXRLZXkgPSAhc2ltcGxlS2V5cyAmJlxuICAgICAgICAoIWtleSB8fFxuICAgICAgICAgICAgKGtleUNvbW1lbnQgJiYgdmFsdWUgPT0gbnVsbCAmJiAhY3R4LmluRmxvdykgfHxcbiAgICAgICAgICAgIGlkZW50aXR5LmlzQ29sbGVjdGlvbihrZXkpIHx8XG4gICAgICAgICAgICAoaWRlbnRpdHkuaXNTY2FsYXIoa2V5KVxuICAgICAgICAgICAgICAgID8ga2V5LnR5cGUgPT09IFNjYWxhci5TY2FsYXIuQkxPQ0tfRk9MREVEIHx8IGtleS50eXBlID09PSBTY2FsYXIuU2NhbGFyLkJMT0NLX0xJVEVSQUxcbiAgICAgICAgICAgICAgICA6IHR5cGVvZiBrZXkgPT09ICdvYmplY3QnKSk7XG4gICAgY3R4ID0gT2JqZWN0LmFzc2lnbih7fSwgY3R4LCB7XG4gICAgICAgIGFsbE51bGxWYWx1ZXM6IGZhbHNlLFxuICAgICAgICBpbXBsaWNpdEtleTogIWV4cGxpY2l0S2V5ICYmIChzaW1wbGVLZXlzIHx8ICFhbGxOdWxsVmFsdWVzKSxcbiAgICAgICAgaW5kZW50OiBpbmRlbnQgKyBpbmRlbnRTdGVwXG4gICAgfSk7XG4gICAgbGV0IGtleUNvbW1lbnREb25lID0gZmFsc2U7XG4gICAgbGV0IGNob21wS2VlcCA9IGZhbHNlO1xuICAgIGxldCBzdHIgPSBzdHJpbmdpZnkuc3RyaW5naWZ5KGtleSwgY3R4LCAoKSA9PiAoa2V5Q29tbWVudERvbmUgPSB0cnVlKSwgKCkgPT4gKGNob21wS2VlcCA9IHRydWUpKTtcbiAgICBpZiAoIWV4cGxpY2l0S2V5ICYmICFjdHguaW5GbG93ICYmIHN0ci5sZW5ndGggPiAxMDI0KSB7XG4gICAgICAgIGlmIChzaW1wbGVLZXlzKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdXaXRoIHNpbXBsZSBrZXlzLCBzaW5nbGUgbGluZSBzY2FsYXIgbXVzdCBub3Qgc3BhbiBtb3JlIHRoYW4gMTAyNCBjaGFyYWN0ZXJzJyk7XG4gICAgICAgIGV4cGxpY2l0S2V5ID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGN0eC5pbkZsb3cpIHtcbiAgICAgICAgaWYgKGFsbE51bGxWYWx1ZXMgfHwgdmFsdWUgPT0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKGtleUNvbW1lbnREb25lICYmIG9uQ29tbWVudClcbiAgICAgICAgICAgICAgICBvbkNvbW1lbnQoKTtcbiAgICAgICAgICAgIHJldHVybiBzdHIgPT09ICcnID8gJz8nIDogZXhwbGljaXRLZXkgPyBgPyAke3N0cn1gIDogc3RyO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKChhbGxOdWxsVmFsdWVzICYmICFzaW1wbGVLZXlzKSB8fCAodmFsdWUgPT0gbnVsbCAmJiBleHBsaWNpdEtleSkpIHtcbiAgICAgICAgc3RyID0gYD8gJHtzdHJ9YDtcbiAgICAgICAgaWYgKGtleUNvbW1lbnQgJiYgIWtleUNvbW1lbnREb25lKSB7XG4gICAgICAgICAgICBzdHIgKz0gc3RyaW5naWZ5Q29tbWVudC5saW5lQ29tbWVudChzdHIsIGN0eC5pbmRlbnQsIGNvbW1lbnRTdHJpbmcoa2V5Q29tbWVudCkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGNob21wS2VlcCAmJiBvbkNob21wS2VlcClcbiAgICAgICAgICAgIG9uQ2hvbXBLZWVwKCk7XG4gICAgICAgIHJldHVybiBzdHI7XG4gICAgfVxuICAgIGlmIChrZXlDb21tZW50RG9uZSlcbiAgICAgICAga2V5Q29tbWVudCA9IG51bGw7XG4gICAgaWYgKGV4cGxpY2l0S2V5KSB7XG4gICAgICAgIGlmIChrZXlDb21tZW50KVxuICAgICAgICAgICAgc3RyICs9IHN0cmluZ2lmeUNvbW1lbnQubGluZUNvbW1lbnQoc3RyLCBjdHguaW5kZW50LCBjb21tZW50U3RyaW5nKGtleUNvbW1lbnQpKTtcbiAgICAgICAgc3RyID0gYD8gJHtzdHJ9XFxuJHtpbmRlbnR9OmA7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBzdHIgPSBgJHtzdHJ9OmA7XG4gICAgICAgIGlmIChrZXlDb21tZW50KVxuICAgICAgICAgICAgc3RyICs9IHN0cmluZ2lmeUNvbW1lbnQubGluZUNvbW1lbnQoc3RyLCBjdHguaW5kZW50LCBjb21tZW50U3RyaW5nKGtleUNvbW1lbnQpKTtcbiAgICB9XG4gICAgbGV0IHZzYiwgdmNiLCB2YWx1ZUNvbW1lbnQ7XG4gICAgaWYgKGlkZW50aXR5LmlzTm9kZSh2YWx1ZSkpIHtcbiAgICAgICAgdnNiID0gISF2YWx1ZS5zcGFjZUJlZm9yZTtcbiAgICAgICAgdmNiID0gdmFsdWUuY29tbWVudEJlZm9yZTtcbiAgICAgICAgdmFsdWVDb21tZW50ID0gdmFsdWUuY29tbWVudDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHZzYiA9IGZhbHNlO1xuICAgICAgICB2Y2IgPSBudWxsO1xuICAgICAgICB2YWx1ZUNvbW1lbnQgPSBudWxsO1xuICAgICAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JylcbiAgICAgICAgICAgIHZhbHVlID0gZG9jLmNyZWF0ZU5vZGUodmFsdWUpO1xuICAgIH1cbiAgICBjdHguaW1wbGljaXRLZXkgPSBmYWxzZTtcbiAgICBpZiAoIWV4cGxpY2l0S2V5ICYmICFrZXlDb21tZW50ICYmIGlkZW50aXR5LmlzU2NhbGFyKHZhbHVlKSlcbiAgICAgICAgY3R4LmluZGVudEF0U3RhcnQgPSBzdHIubGVuZ3RoICsgMTtcbiAgICBjaG9tcEtlZXAgPSBmYWxzZTtcbiAgICBpZiAoIWluZGVudFNlcSAmJlxuICAgICAgICBpbmRlbnRTdGVwLmxlbmd0aCA+PSAyICYmXG4gICAgICAgICFjdHguaW5GbG93ICYmXG4gICAgICAgICFleHBsaWNpdEtleSAmJlxuICAgICAgICBpZGVudGl0eS5pc1NlcSh2YWx1ZSkgJiZcbiAgICAgICAgIXZhbHVlLmZsb3cgJiZcbiAgICAgICAgIXZhbHVlLnRhZyAmJlxuICAgICAgICAhdmFsdWUuYW5jaG9yKSB7XG4gICAgICAgIC8vIElmIGluZGVudFNlcSA9PT0gZmFsc2UsIGNvbnNpZGVyICctICcgYXMgcGFydCBvZiBpbmRlbnRhdGlvbiB3aGVyZSBwb3NzaWJsZVxuICAgICAgICBjdHguaW5kZW50ID0gY3R4LmluZGVudC5zdWJzdHJpbmcoMik7XG4gICAgfVxuICAgIGxldCB2YWx1ZUNvbW1lbnREb25lID0gZmFsc2U7XG4gICAgY29uc3QgdmFsdWVTdHIgPSBzdHJpbmdpZnkuc3RyaW5naWZ5KHZhbHVlLCBjdHgsICgpID0+ICh2YWx1ZUNvbW1lbnREb25lID0gdHJ1ZSksICgpID0+IChjaG9tcEtlZXAgPSB0cnVlKSk7XG4gICAgbGV0IHdzID0gJyAnO1xuICAgIGlmIChrZXlDb21tZW50IHx8IHZzYiB8fCB2Y2IpIHtcbiAgICAgICAgd3MgPSB2c2IgPyAnXFxuJyA6ICcnO1xuICAgICAgICBpZiAodmNiKSB7XG4gICAgICAgICAgICBjb25zdCBjcyA9IGNvbW1lbnRTdHJpbmcodmNiKTtcbiAgICAgICAgICAgIHdzICs9IGBcXG4ke3N0cmluZ2lmeUNvbW1lbnQuaW5kZW50Q29tbWVudChjcywgY3R4LmluZGVudCl9YDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodmFsdWVTdHIgPT09ICcnICYmICFjdHguaW5GbG93KSB7XG4gICAgICAgICAgICBpZiAod3MgPT09ICdcXG4nICYmIHZhbHVlQ29tbWVudClcbiAgICAgICAgICAgICAgICB3cyA9ICdcXG5cXG4nO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgd3MgKz0gYFxcbiR7Y3R4LmluZGVudH1gO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKCFleHBsaWNpdEtleSAmJiBpZGVudGl0eS5pc0NvbGxlY3Rpb24odmFsdWUpKSB7XG4gICAgICAgIGNvbnN0IHZzMCA9IHZhbHVlU3RyWzBdO1xuICAgICAgICBjb25zdCBubDAgPSB2YWx1ZVN0ci5pbmRleE9mKCdcXG4nKTtcbiAgICAgICAgY29uc3QgaGFzTmV3bGluZSA9IG5sMCAhPT0gLTE7XG4gICAgICAgIGNvbnN0IGZsb3cgPSBjdHguaW5GbG93ID8/IHZhbHVlLmZsb3cgPz8gdmFsdWUuaXRlbXMubGVuZ3RoID09PSAwO1xuICAgICAgICBpZiAoaGFzTmV3bGluZSB8fCAhZmxvdykge1xuICAgICAgICAgICAgbGV0IGhhc1Byb3BzTGluZSA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKGhhc05ld2xpbmUgJiYgKHZzMCA9PT0gJyYnIHx8IHZzMCA9PT0gJyEnKSkge1xuICAgICAgICAgICAgICAgIGxldCBzcDAgPSB2YWx1ZVN0ci5pbmRleE9mKCcgJyk7XG4gICAgICAgICAgICAgICAgaWYgKHZzMCA9PT0gJyYnICYmXG4gICAgICAgICAgICAgICAgICAgIHNwMCAhPT0gLTEgJiZcbiAgICAgICAgICAgICAgICAgICAgc3AwIDwgbmwwICYmXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlU3RyW3NwMCArIDFdID09PSAnIScpIHtcbiAgICAgICAgICAgICAgICAgICAgc3AwID0gdmFsdWVTdHIuaW5kZXhPZignICcsIHNwMCArIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoc3AwID09PSAtMSB8fCBubDAgPCBzcDApXG4gICAgICAgICAgICAgICAgICAgIGhhc1Byb3BzTGluZSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWhhc1Byb3BzTGluZSlcbiAgICAgICAgICAgICAgICB3cyA9IGBcXG4ke2N0eC5pbmRlbnR9YDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICh2YWx1ZVN0ciA9PT0gJycgfHwgdmFsdWVTdHJbMF0gPT09ICdcXG4nKSB7XG4gICAgICAgIHdzID0gJyc7XG4gICAgfVxuICAgIHN0ciArPSB3cyArIHZhbHVlU3RyO1xuICAgIGlmIChjdHguaW5GbG93KSB7XG4gICAgICAgIGlmICh2YWx1ZUNvbW1lbnREb25lICYmIG9uQ29tbWVudClcbiAgICAgICAgICAgIG9uQ29tbWVudCgpO1xuICAgIH1cbiAgICBlbHNlIGlmICh2YWx1ZUNvbW1lbnQgJiYgIXZhbHVlQ29tbWVudERvbmUpIHtcbiAgICAgICAgc3RyICs9IHN0cmluZ2lmeUNvbW1lbnQubGluZUNvbW1lbnQoc3RyLCBjdHguaW5kZW50LCBjb21tZW50U3RyaW5nKHZhbHVlQ29tbWVudCkpO1xuICAgIH1cbiAgICBlbHNlIGlmIChjaG9tcEtlZXAgJiYgb25DaG9tcEtlZXApIHtcbiAgICAgICAgb25DaG9tcEtlZXAoKTtcbiAgICB9XG4gICAgcmV0dXJuIHN0cjtcbn1cblxuZXhwb3J0cy5zdHJpbmdpZnlQYWlyID0gc3RyaW5naWZ5UGFpcjtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbm9kZV9wcm9jZXNzID0gcmVxdWlyZSgncHJvY2VzcycpO1xuXG5mdW5jdGlvbiBkZWJ1Zyhsb2dMZXZlbCwgLi4ubWVzc2FnZXMpIHtcbiAgICBpZiAobG9nTGV2ZWwgPT09ICdkZWJ1ZycpXG4gICAgICAgIGNvbnNvbGUubG9nKC4uLm1lc3NhZ2VzKTtcbn1cbmZ1bmN0aW9uIHdhcm4obG9nTGV2ZWwsIHdhcm5pbmcpIHtcbiAgICBpZiAobG9nTGV2ZWwgPT09ICdkZWJ1ZycgfHwgbG9nTGV2ZWwgPT09ICd3YXJuJykge1xuICAgICAgICBpZiAodHlwZW9mIG5vZGVfcHJvY2Vzcy5lbWl0V2FybmluZyA9PT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgICAgIG5vZGVfcHJvY2Vzcy5lbWl0V2FybmluZyh3YXJuaW5nKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgY29uc29sZS53YXJuKHdhcm5pbmcpO1xuICAgIH1cbn1cblxuZXhwb3J0cy5kZWJ1ZyA9IGRlYnVnO1xuZXhwb3J0cy53YXJuID0gd2FybjtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9pZGVudGl0eS5qcycpO1xudmFyIFNjYWxhciA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL1NjYWxhci5qcycpO1xuXG4vLyBJZiB0aGUgdmFsdWUgYXNzb2NpYXRlZCB3aXRoIGEgbWVyZ2Uga2V5IGlzIGEgc2luZ2xlIG1hcHBpbmcgbm9kZSwgZWFjaCBvZlxuLy8gaXRzIGtleS92YWx1ZSBwYWlycyBpcyBpbnNlcnRlZCBpbnRvIHRoZSBjdXJyZW50IG1hcHBpbmcsIHVubGVzcyB0aGUga2V5XG4vLyBhbHJlYWR5IGV4aXN0cyBpbiBpdC4gSWYgdGhlIHZhbHVlIGFzc29jaWF0ZWQgd2l0aCB0aGUgbWVyZ2Uga2V5IGlzIGFcbi8vIHNlcXVlbmNlLCB0aGVuIHRoaXMgc2VxdWVuY2UgaXMgZXhwZWN0ZWQgdG8gY29udGFpbiBtYXBwaW5nIG5vZGVzIGFuZCBlYWNoXG4vLyBvZiB0aGVzZSBub2RlcyBpcyBtZXJnZWQgaW4gdHVybiBhY2NvcmRpbmcgdG8gaXRzIG9yZGVyIGluIHRoZSBzZXF1ZW5jZS5cbi8vIEtleXMgaW4gbWFwcGluZyBub2RlcyBlYXJsaWVyIGluIHRoZSBzZXF1ZW5jZSBvdmVycmlkZSBrZXlzIHNwZWNpZmllZCBpblxuLy8gbGF0ZXIgbWFwcGluZyBub2Rlcy4gLS0gaHR0cDovL3lhbWwub3JnL3R5cGUvbWVyZ2UuaHRtbFxuY29uc3QgTUVSR0VfS0VZID0gJzw8JztcbmNvbnN0IG1lcmdlID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB2YWx1ZSA9PT0gTUVSR0VfS0VZIHx8XG4gICAgICAgICh0eXBlb2YgdmFsdWUgPT09ICdzeW1ib2wnICYmIHZhbHVlLmRlc2NyaXB0aW9uID09PSBNRVJHRV9LRVkpLFxuICAgIGRlZmF1bHQ6ICdrZXknLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOm1lcmdlJyxcbiAgICB0ZXN0OiAvXjw8JC8sXG4gICAgcmVzb2x2ZTogKCkgPT4gT2JqZWN0LmFzc2lnbihuZXcgU2NhbGFyLlNjYWxhcihTeW1ib2woTUVSR0VfS0VZKSksIHtcbiAgICAgICAgYWRkVG9KU01hcDogYWRkTWVyZ2VUb0pTTWFwXG4gICAgfSksXG4gICAgc3RyaW5naWZ5OiAoKSA9PiBNRVJHRV9LRVlcbn07XG5jb25zdCBpc01lcmdlS2V5ID0gKGN0eCwga2V5KSA9PiAobWVyZ2UuaWRlbnRpZnkoa2V5KSB8fFxuICAgIChpZGVudGl0eS5pc1NjYWxhcihrZXkpICYmXG4gICAgICAgICgha2V5LnR5cGUgfHwga2V5LnR5cGUgPT09IFNjYWxhci5TY2FsYXIuUExBSU4pICYmXG4gICAgICAgIG1lcmdlLmlkZW50aWZ5KGtleS52YWx1ZSkpKSAmJlxuICAgIGN0eD8uZG9jLnNjaGVtYS50YWdzLnNvbWUodGFnID0+IHRhZy50YWcgPT09IG1lcmdlLnRhZyAmJiB0YWcuZGVmYXVsdCk7XG5mdW5jdGlvbiBhZGRNZXJnZVRvSlNNYXAoY3R4LCBtYXAsIHZhbHVlKSB7XG4gICAgdmFsdWUgPSBjdHggJiYgaWRlbnRpdHkuaXNBbGlhcyh2YWx1ZSkgPyB2YWx1ZS5yZXNvbHZlKGN0eC5kb2MpIDogdmFsdWU7XG4gICAgaWYgKGlkZW50aXR5LmlzU2VxKHZhbHVlKSlcbiAgICAgICAgZm9yIChjb25zdCBpdCBvZiB2YWx1ZS5pdGVtcylcbiAgICAgICAgICAgIG1lcmdlVmFsdWUoY3R4LCBtYXAsIGl0KTtcbiAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSlcbiAgICAgICAgZm9yIChjb25zdCBpdCBvZiB2YWx1ZSlcbiAgICAgICAgICAgIG1lcmdlVmFsdWUoY3R4LCBtYXAsIGl0KTtcbiAgICBlbHNlXG4gICAgICAgIG1lcmdlVmFsdWUoY3R4LCBtYXAsIHZhbHVlKTtcbn1cbmZ1bmN0aW9uIG1lcmdlVmFsdWUoY3R4LCBtYXAsIHZhbHVlKSB7XG4gICAgY29uc3Qgc291cmNlID0gY3R4ICYmIGlkZW50aXR5LmlzQWxpYXModmFsdWUpID8gdmFsdWUucmVzb2x2ZShjdHguZG9jKSA6IHZhbHVlO1xuICAgIGlmICghaWRlbnRpdHkuaXNNYXAoc291cmNlKSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNZXJnZSBzb3VyY2VzIG11c3QgYmUgbWFwcyBvciBtYXAgYWxpYXNlcycpO1xuICAgIGNvbnN0IHNyY01hcCA9IHNvdXJjZS50b0pTT04obnVsbCwgY3R4LCBNYXApO1xuICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIHNyY01hcCkge1xuICAgICAgICBpZiAobWFwIGluc3RhbmNlb2YgTWFwKSB7XG4gICAgICAgICAgICBpZiAoIW1hcC5oYXMoa2V5KSlcbiAgICAgICAgICAgICAgICBtYXAuc2V0KGtleSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG1hcCBpbnN0YW5jZW9mIFNldCkge1xuICAgICAgICAgICAgbWFwLmFkZChrZXkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobWFwLCBrZXkpKSB7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobWFwLCBrZXksIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG1hcDtcbn1cblxuZXhwb3J0cy5hZGRNZXJnZVRvSlNNYXAgPSBhZGRNZXJnZVRvSlNNYXA7XG5leHBvcnRzLmlzTWVyZ2VLZXkgPSBpc01lcmdlS2V5O1xuZXhwb3J0cy5tZXJnZSA9IG1lcmdlO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBsb2cgPSByZXF1aXJlKCcuLi9sb2cuanMnKTtcbnZhciBtZXJnZSA9IHJlcXVpcmUoJy4uL3NjaGVtYS95YW1sLTEuMS9tZXJnZS5qcycpO1xudmFyIHN0cmluZ2lmeSA9IHJlcXVpcmUoJy4uL3N0cmluZ2lmeS9zdHJpbmdpZnkuanMnKTtcbnZhciBpZGVudGl0eSA9IHJlcXVpcmUoJy4vaWRlbnRpdHkuanMnKTtcbnZhciB0b0pTID0gcmVxdWlyZSgnLi90b0pTLmpzJyk7XG5cbmZ1bmN0aW9uIGFkZFBhaXJUb0pTTWFwKGN0eCwgbWFwLCB7IGtleSwgdmFsdWUgfSkge1xuICAgIGlmIChpZGVudGl0eS5pc05vZGUoa2V5KSAmJiBrZXkuYWRkVG9KU01hcClcbiAgICAgICAga2V5LmFkZFRvSlNNYXAoY3R4LCBtYXAsIHZhbHVlKTtcbiAgICAvLyBUT0RPOiBTaG91bGQgZHJvcCB0aGlzIHNwZWNpYWwgY2FzZSBmb3IgYmFyZSA8PCBoYW5kbGluZ1xuICAgIGVsc2UgaWYgKG1lcmdlLmlzTWVyZ2VLZXkoY3R4LCBrZXkpKVxuICAgICAgICBtZXJnZS5hZGRNZXJnZVRvSlNNYXAoY3R4LCBtYXAsIHZhbHVlKTtcbiAgICBlbHNlIHtcbiAgICAgICAgY29uc3QganNLZXkgPSB0b0pTLnRvSlMoa2V5LCAnJywgY3R4KTtcbiAgICAgICAgaWYgKG1hcCBpbnN0YW5jZW9mIE1hcCkge1xuICAgICAgICAgICAgbWFwLnNldChqc0tleSwgdG9KUy50b0pTKHZhbHVlLCBqc0tleSwgY3R4KSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobWFwIGluc3RhbmNlb2YgU2V0KSB7XG4gICAgICAgICAgICBtYXAuYWRkKGpzS2V5KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHN0cmluZ0tleSA9IHN0cmluZ2lmeUtleShrZXksIGpzS2V5LCBjdHgpO1xuICAgICAgICAgICAgY29uc3QganNWYWx1ZSA9IHRvSlMudG9KUyh2YWx1ZSwgc3RyaW5nS2V5LCBjdHgpO1xuICAgICAgICAgICAgaWYgKHN0cmluZ0tleSBpbiBtYXApXG4gICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG1hcCwgc3RyaW5nS2V5LCB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBqc1ZhbHVlLFxuICAgICAgICAgICAgICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbWFwW3N0cmluZ0tleV0gPSBqc1ZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBtYXA7XG59XG5mdW5jdGlvbiBzdHJpbmdpZnlLZXkoa2V5LCBqc0tleSwgY3R4KSB7XG4gICAgaWYgKGpzS2V5ID09PSBudWxsKVxuICAgICAgICByZXR1cm4gJyc7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1iYXNlLXRvLXN0cmluZ1xuICAgIGlmICh0eXBlb2YganNLZXkgIT09ICdvYmplY3QnKVxuICAgICAgICByZXR1cm4gU3RyaW5nKGpzS2V5KTtcbiAgICBpZiAoaWRlbnRpdHkuaXNOb2RlKGtleSkgJiYgY3R4Py5kb2MpIHtcbiAgICAgICAgY29uc3Qgc3RyQ3R4ID0gc3RyaW5naWZ5LmNyZWF0ZVN0cmluZ2lmeUNvbnRleHQoY3R4LmRvYywge30pO1xuICAgICAgICBzdHJDdHguYW5jaG9ycyA9IG5ldyBTZXQoKTtcbiAgICAgICAgZm9yIChjb25zdCBub2RlIG9mIGN0eC5hbmNob3JzLmtleXMoKSlcbiAgICAgICAgICAgIHN0ckN0eC5hbmNob3JzLmFkZChub2RlLmFuY2hvcik7XG4gICAgICAgIHN0ckN0eC5pbkZsb3cgPSB0cnVlO1xuICAgICAgICBzdHJDdHguaW5TdHJpbmdpZnlLZXkgPSB0cnVlO1xuICAgICAgICBjb25zdCBzdHJLZXkgPSBrZXkudG9TdHJpbmcoc3RyQ3R4KTtcbiAgICAgICAgaWYgKCFjdHgubWFwS2V5V2FybmVkKSB7XG4gICAgICAgICAgICBsZXQganNvblN0ciA9IEpTT04uc3RyaW5naWZ5KHN0cktleSk7XG4gICAgICAgICAgICBpZiAoanNvblN0ci5sZW5ndGggPiA0MClcbiAgICAgICAgICAgICAgICBqc29uU3RyID0ganNvblN0ci5zdWJzdHJpbmcoMCwgMzYpICsgJy4uLlwiJztcbiAgICAgICAgICAgIGxvZy53YXJuKGN0eC5kb2Mub3B0aW9ucy5sb2dMZXZlbCwgYEtleXMgd2l0aCBjb2xsZWN0aW9uIHZhbHVlcyB3aWxsIGJlIHN0cmluZ2lmaWVkIGR1ZSB0byBKUyBPYmplY3QgcmVzdHJpY3Rpb25zOiAke2pzb25TdHJ9LiBTZXQgbWFwQXNNYXA6IHRydWUgdG8gdXNlIG9iamVjdCBrZXlzLmApO1xuICAgICAgICAgICAgY3R4Lm1hcEtleVdhcm5lZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0cktleTtcbiAgICB9XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGpzS2V5KTtcbn1cblxuZXhwb3J0cy5hZGRQYWlyVG9KU01hcCA9IGFkZFBhaXJUb0pTTWFwO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBjcmVhdGVOb2RlID0gcmVxdWlyZSgnLi4vZG9jL2NyZWF0ZU5vZGUuanMnKTtcbnZhciBzdHJpbmdpZnlQYWlyID0gcmVxdWlyZSgnLi4vc3RyaW5naWZ5L3N0cmluZ2lmeVBhaXIuanMnKTtcbnZhciBhZGRQYWlyVG9KU01hcCA9IHJlcXVpcmUoJy4vYWRkUGFpclRvSlNNYXAuanMnKTtcbnZhciBpZGVudGl0eSA9IHJlcXVpcmUoJy4vaWRlbnRpdHkuanMnKTtcblxuZnVuY3Rpb24gY3JlYXRlUGFpcihrZXksIHZhbHVlLCBjdHgpIHtcbiAgICBjb25zdCBrID0gY3JlYXRlTm9kZS5jcmVhdGVOb2RlKGtleSwgdW5kZWZpbmVkLCBjdHgpO1xuICAgIGNvbnN0IHYgPSBjcmVhdGVOb2RlLmNyZWF0ZU5vZGUodmFsdWUsIHVuZGVmaW5lZCwgY3R4KTtcbiAgICByZXR1cm4gbmV3IFBhaXIoaywgdik7XG59XG5jbGFzcyBQYWlyIHtcbiAgICBjb25zdHJ1Y3RvcihrZXksIHZhbHVlID0gbnVsbCkge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgaWRlbnRpdHkuTk9ERV9UWVBFLCB7IHZhbHVlOiBpZGVudGl0eS5QQUlSIH0pO1xuICAgICAgICB0aGlzLmtleSA9IGtleTtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgICBjbG9uZShzY2hlbWEpIHtcbiAgICAgICAgbGV0IHsga2V5LCB2YWx1ZSB9ID0gdGhpcztcbiAgICAgICAgaWYgKGlkZW50aXR5LmlzTm9kZShrZXkpKVxuICAgICAgICAgICAga2V5ID0ga2V5LmNsb25lKHNjaGVtYSk7XG4gICAgICAgIGlmIChpZGVudGl0eS5pc05vZGUodmFsdWUpKVxuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5jbG9uZShzY2hlbWEpO1xuICAgICAgICByZXR1cm4gbmV3IFBhaXIoa2V5LCB2YWx1ZSk7XG4gICAgfVxuICAgIHRvSlNPTihfLCBjdHgpIHtcbiAgICAgICAgY29uc3QgcGFpciA9IGN0eD8ubWFwQXNNYXAgPyBuZXcgTWFwKCkgOiB7fTtcbiAgICAgICAgcmV0dXJuIGFkZFBhaXJUb0pTTWFwLmFkZFBhaXJUb0pTTWFwKGN0eCwgcGFpciwgdGhpcyk7XG4gICAgfVxuICAgIHRvU3RyaW5nKGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCkge1xuICAgICAgICByZXR1cm4gY3R4Py5kb2NcbiAgICAgICAgICAgID8gc3RyaW5naWZ5UGFpci5zdHJpbmdpZnlQYWlyKHRoaXMsIGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcClcbiAgICAgICAgICAgIDogSlNPTi5zdHJpbmdpZnkodGhpcyk7XG4gICAgfVxufVxuXG5leHBvcnRzLlBhaXIgPSBQYWlyO1xuZXhwb3J0cy5jcmVhdGVQYWlyID0gY3JlYXRlUGFpcjtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuLi9ub2Rlcy9pZGVudGl0eS5qcycpO1xudmFyIHN0cmluZ2lmeSA9IHJlcXVpcmUoJy4vc3RyaW5naWZ5LmpzJyk7XG52YXIgc3RyaW5naWZ5Q29tbWVudCA9IHJlcXVpcmUoJy4vc3RyaW5naWZ5Q29tbWVudC5qcycpO1xuXG5mdW5jdGlvbiBzdHJpbmdpZnlDb2xsZWN0aW9uKGNvbGxlY3Rpb24sIGN0eCwgb3B0aW9ucykge1xuICAgIGNvbnN0IGZsb3cgPSBjdHguaW5GbG93ID8/IGNvbGxlY3Rpb24uZmxvdztcbiAgICBjb25zdCBzdHJpbmdpZnkgPSBmbG93ID8gc3RyaW5naWZ5Rmxvd0NvbGxlY3Rpb24gOiBzdHJpbmdpZnlCbG9ja0NvbGxlY3Rpb247XG4gICAgcmV0dXJuIHN0cmluZ2lmeShjb2xsZWN0aW9uLCBjdHgsIG9wdGlvbnMpO1xufVxuZnVuY3Rpb24gc3RyaW5naWZ5QmxvY2tDb2xsZWN0aW9uKHsgY29tbWVudCwgaXRlbXMgfSwgY3R4LCB7IGJsb2NrSXRlbVByZWZpeCwgZmxvd0NoYXJzLCBpdGVtSW5kZW50LCBvbkNob21wS2VlcCwgb25Db21tZW50IH0pIHtcbiAgICBjb25zdCB7IGluZGVudCwgb3B0aW9uczogeyBjb21tZW50U3RyaW5nIH0gfSA9IGN0eDtcbiAgICBjb25zdCBpdGVtQ3R4ID0gT2JqZWN0LmFzc2lnbih7fSwgY3R4LCB7IGluZGVudDogaXRlbUluZGVudCwgdHlwZTogbnVsbCB9KTtcbiAgICBsZXQgY2hvbXBLZWVwID0gZmFsc2U7IC8vIGZsYWcgZm9yIHRoZSBwcmVjZWRpbmcgbm9kZSdzIHN0YXR1c1xuICAgIGNvbnN0IGxpbmVzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7ICsraSkge1xuICAgICAgICBjb25zdCBpdGVtID0gaXRlbXNbaV07XG4gICAgICAgIGxldCBjb21tZW50ID0gbnVsbDtcbiAgICAgICAgaWYgKGlkZW50aXR5LmlzTm9kZShpdGVtKSkge1xuICAgICAgICAgICAgaWYgKCFjaG9tcEtlZXAgJiYgaXRlbS5zcGFjZUJlZm9yZSlcbiAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKCcnKTtcbiAgICAgICAgICAgIGFkZENvbW1lbnRCZWZvcmUoY3R4LCBsaW5lcywgaXRlbS5jb21tZW50QmVmb3JlLCBjaG9tcEtlZXApO1xuICAgICAgICAgICAgaWYgKGl0ZW0uY29tbWVudClcbiAgICAgICAgICAgICAgICBjb21tZW50ID0gaXRlbS5jb21tZW50O1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGlkZW50aXR5LmlzUGFpcihpdGVtKSkge1xuICAgICAgICAgICAgY29uc3QgaWsgPSBpZGVudGl0eS5pc05vZGUoaXRlbS5rZXkpID8gaXRlbS5rZXkgOiBudWxsO1xuICAgICAgICAgICAgaWYgKGlrKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFjaG9tcEtlZXAgJiYgaWsuc3BhY2VCZWZvcmUpXG4gICAgICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goJycpO1xuICAgICAgICAgICAgICAgIGFkZENvbW1lbnRCZWZvcmUoY3R4LCBsaW5lcywgaWsuY29tbWVudEJlZm9yZSwgY2hvbXBLZWVwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjaG9tcEtlZXAgPSBmYWxzZTtcbiAgICAgICAgbGV0IHN0ciA9IHN0cmluZ2lmeS5zdHJpbmdpZnkoaXRlbSwgaXRlbUN0eCwgKCkgPT4gKGNvbW1lbnQgPSBudWxsKSwgKCkgPT4gKGNob21wS2VlcCA9IHRydWUpKTtcbiAgICAgICAgaWYgKGNvbW1lbnQpXG4gICAgICAgICAgICBzdHIgKz0gc3RyaW5naWZ5Q29tbWVudC5saW5lQ29tbWVudChzdHIsIGl0ZW1JbmRlbnQsIGNvbW1lbnRTdHJpbmcoY29tbWVudCkpO1xuICAgICAgICBpZiAoY2hvbXBLZWVwICYmIGNvbW1lbnQpXG4gICAgICAgICAgICBjaG9tcEtlZXAgPSBmYWxzZTtcbiAgICAgICAgbGluZXMucHVzaChibG9ja0l0ZW1QcmVmaXggKyBzdHIpO1xuICAgIH1cbiAgICBsZXQgc3RyO1xuICAgIGlmIChsaW5lcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgc3RyID0gZmxvd0NoYXJzLnN0YXJ0ICsgZmxvd0NoYXJzLmVuZDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHN0ciA9IGxpbmVzWzBdO1xuICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8IGxpbmVzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBjb25zdCBsaW5lID0gbGluZXNbaV07XG4gICAgICAgICAgICBzdHIgKz0gbGluZSA/IGBcXG4ke2luZGVudH0ke2xpbmV9YCA6ICdcXG4nO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChjb21tZW50KSB7XG4gICAgICAgIHN0ciArPSAnXFxuJyArIHN0cmluZ2lmeUNvbW1lbnQuaW5kZW50Q29tbWVudChjb21tZW50U3RyaW5nKGNvbW1lbnQpLCBpbmRlbnQpO1xuICAgICAgICBpZiAob25Db21tZW50KVxuICAgICAgICAgICAgb25Db21tZW50KCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGNob21wS2VlcCAmJiBvbkNob21wS2VlcClcbiAgICAgICAgb25DaG9tcEtlZXAoKTtcbiAgICByZXR1cm4gc3RyO1xufVxuZnVuY3Rpb24gc3RyaW5naWZ5Rmxvd0NvbGxlY3Rpb24oeyBpdGVtcyB9LCBjdHgsIHsgZmxvd0NoYXJzLCBpdGVtSW5kZW50IH0pIHtcbiAgICBjb25zdCB7IGluZGVudCwgaW5kZW50U3RlcCwgZmxvd0NvbGxlY3Rpb25QYWRkaW5nOiBmY1BhZGRpbmcsIG9wdGlvbnM6IHsgY29tbWVudFN0cmluZyB9IH0gPSBjdHg7XG4gICAgaXRlbUluZGVudCArPSBpbmRlbnRTdGVwO1xuICAgIGNvbnN0IGl0ZW1DdHggPSBPYmplY3QuYXNzaWduKHt9LCBjdHgsIHtcbiAgICAgICAgaW5kZW50OiBpdGVtSW5kZW50LFxuICAgICAgICBpbkZsb3c6IHRydWUsXG4gICAgICAgIHR5cGU6IG51bGxcbiAgICB9KTtcbiAgICBsZXQgcmVxTmV3bGluZSA9IGZhbHNlO1xuICAgIGxldCBsaW5lc0F0VmFsdWUgPSAwO1xuICAgIGNvbnN0IGxpbmVzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7ICsraSkge1xuICAgICAgICBjb25zdCBpdGVtID0gaXRlbXNbaV07XG4gICAgICAgIGxldCBjb21tZW50ID0gbnVsbDtcbiAgICAgICAgaWYgKGlkZW50aXR5LmlzTm9kZShpdGVtKSkge1xuICAgICAgICAgICAgaWYgKGl0ZW0uc3BhY2VCZWZvcmUpXG4gICAgICAgICAgICAgICAgbGluZXMucHVzaCgnJyk7XG4gICAgICAgICAgICBhZGRDb21tZW50QmVmb3JlKGN0eCwgbGluZXMsIGl0ZW0uY29tbWVudEJlZm9yZSwgZmFsc2UpO1xuICAgICAgICAgICAgaWYgKGl0ZW0uY29tbWVudClcbiAgICAgICAgICAgICAgICBjb21tZW50ID0gaXRlbS5jb21tZW50O1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGlkZW50aXR5LmlzUGFpcihpdGVtKSkge1xuICAgICAgICAgICAgY29uc3QgaWsgPSBpZGVudGl0eS5pc05vZGUoaXRlbS5rZXkpID8gaXRlbS5rZXkgOiBudWxsO1xuICAgICAgICAgICAgaWYgKGlrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlrLnNwYWNlQmVmb3JlKVxuICAgICAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKCcnKTtcbiAgICAgICAgICAgICAgICBhZGRDb21tZW50QmVmb3JlKGN0eCwgbGluZXMsIGlrLmNvbW1lbnRCZWZvcmUsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICBpZiAoaWsuY29tbWVudClcbiAgICAgICAgICAgICAgICAgICAgcmVxTmV3bGluZSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBpdiA9IGlkZW50aXR5LmlzTm9kZShpdGVtLnZhbHVlKSA/IGl0ZW0udmFsdWUgOiBudWxsO1xuICAgICAgICAgICAgaWYgKGl2KSB7XG4gICAgICAgICAgICAgICAgaWYgKGl2LmNvbW1lbnQpXG4gICAgICAgICAgICAgICAgICAgIGNvbW1lbnQgPSBpdi5jb21tZW50O1xuICAgICAgICAgICAgICAgIGlmIChpdi5jb21tZW50QmVmb3JlKVxuICAgICAgICAgICAgICAgICAgICByZXFOZXdsaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGl0ZW0udmFsdWUgPT0gbnVsbCAmJiBpaz8uY29tbWVudCkge1xuICAgICAgICAgICAgICAgIGNvbW1lbnQgPSBpay5jb21tZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChjb21tZW50KVxuICAgICAgICAgICAgcmVxTmV3bGluZSA9IHRydWU7XG4gICAgICAgIGxldCBzdHIgPSBzdHJpbmdpZnkuc3RyaW5naWZ5KGl0ZW0sIGl0ZW1DdHgsICgpID0+IChjb21tZW50ID0gbnVsbCkpO1xuICAgICAgICBpZiAoaSA8IGl0ZW1zLmxlbmd0aCAtIDEpXG4gICAgICAgICAgICBzdHIgKz0gJywnO1xuICAgICAgICBpZiAoY29tbWVudClcbiAgICAgICAgICAgIHN0ciArPSBzdHJpbmdpZnlDb21tZW50LmxpbmVDb21tZW50KHN0ciwgaXRlbUluZGVudCwgY29tbWVudFN0cmluZyhjb21tZW50KSk7XG4gICAgICAgIGlmICghcmVxTmV3bGluZSAmJiAobGluZXMubGVuZ3RoID4gbGluZXNBdFZhbHVlIHx8IHN0ci5pbmNsdWRlcygnXFxuJykpKVxuICAgICAgICAgICAgcmVxTmV3bGluZSA9IHRydWU7XG4gICAgICAgIGxpbmVzLnB1c2goc3RyKTtcbiAgICAgICAgbGluZXNBdFZhbHVlID0gbGluZXMubGVuZ3RoO1xuICAgIH1cbiAgICBjb25zdCB7IHN0YXJ0LCBlbmQgfSA9IGZsb3dDaGFycztcbiAgICBpZiAobGluZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBzdGFydCArIGVuZDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGlmICghcmVxTmV3bGluZSkge1xuICAgICAgICAgICAgY29uc3QgbGVuID0gbGluZXMucmVkdWNlKChzdW0sIGxpbmUpID0+IHN1bSArIGxpbmUubGVuZ3RoICsgMiwgMik7XG4gICAgICAgICAgICByZXFOZXdsaW5lID0gY3R4Lm9wdGlvbnMubGluZVdpZHRoID4gMCAmJiBsZW4gPiBjdHgub3B0aW9ucy5saW5lV2lkdGg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJlcU5ld2xpbmUpIHtcbiAgICAgICAgICAgIGxldCBzdHIgPSBzdGFydDtcbiAgICAgICAgICAgIGZvciAoY29uc3QgbGluZSBvZiBsaW5lcylcbiAgICAgICAgICAgICAgICBzdHIgKz0gbGluZSA/IGBcXG4ke2luZGVudFN0ZXB9JHtpbmRlbnR9JHtsaW5lfWAgOiAnXFxuJztcbiAgICAgICAgICAgIHJldHVybiBgJHtzdHJ9XFxuJHtpbmRlbnR9JHtlbmR9YDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBgJHtzdGFydH0ke2ZjUGFkZGluZ30ke2xpbmVzLmpvaW4oJyAnKX0ke2ZjUGFkZGluZ30ke2VuZH1gO1xuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gYWRkQ29tbWVudEJlZm9yZSh7IGluZGVudCwgb3B0aW9uczogeyBjb21tZW50U3RyaW5nIH0gfSwgbGluZXMsIGNvbW1lbnQsIGNob21wS2VlcCkge1xuICAgIGlmIChjb21tZW50ICYmIGNob21wS2VlcClcbiAgICAgICAgY29tbWVudCA9IGNvbW1lbnQucmVwbGFjZSgvXlxcbisvLCAnJyk7XG4gICAgaWYgKGNvbW1lbnQpIHtcbiAgICAgICAgY29uc3QgaWMgPSBzdHJpbmdpZnlDb21tZW50LmluZGVudENvbW1lbnQoY29tbWVudFN0cmluZyhjb21tZW50KSwgaW5kZW50KTtcbiAgICAgICAgbGluZXMucHVzaChpYy50cmltU3RhcnQoKSk7IC8vIEF2b2lkIGRvdWJsZSBpbmRlbnQgb24gZmlyc3QgbGluZVxuICAgIH1cbn1cblxuZXhwb3J0cy5zdHJpbmdpZnlDb2xsZWN0aW9uID0gc3RyaW5naWZ5Q29sbGVjdGlvbjtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgc3RyaW5naWZ5Q29sbGVjdGlvbiA9IHJlcXVpcmUoJy4uL3N0cmluZ2lmeS9zdHJpbmdpZnlDb2xsZWN0aW9uLmpzJyk7XG52YXIgYWRkUGFpclRvSlNNYXAgPSByZXF1aXJlKCcuL2FkZFBhaXJUb0pTTWFwLmpzJyk7XG52YXIgQ29sbGVjdGlvbiA9IHJlcXVpcmUoJy4vQ29sbGVjdGlvbi5qcycpO1xudmFyIGlkZW50aXR5ID0gcmVxdWlyZSgnLi9pZGVudGl0eS5qcycpO1xudmFyIFBhaXIgPSByZXF1aXJlKCcuL1BhaXIuanMnKTtcbnZhciBTY2FsYXIgPSByZXF1aXJlKCcuL1NjYWxhci5qcycpO1xuXG5mdW5jdGlvbiBmaW5kUGFpcihpdGVtcywga2V5KSB7XG4gICAgY29uc3QgayA9IGlkZW50aXR5LmlzU2NhbGFyKGtleSkgPyBrZXkudmFsdWUgOiBrZXk7XG4gICAgZm9yIChjb25zdCBpdCBvZiBpdGVtcykge1xuICAgICAgICBpZiAoaWRlbnRpdHkuaXNQYWlyKGl0KSkge1xuICAgICAgICAgICAgaWYgKGl0LmtleSA9PT0ga2V5IHx8IGl0LmtleSA9PT0gaylcbiAgICAgICAgICAgICAgICByZXR1cm4gaXQ7XG4gICAgICAgICAgICBpZiAoaWRlbnRpdHkuaXNTY2FsYXIoaXQua2V5KSAmJiBpdC5rZXkudmFsdWUgPT09IGspXG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0O1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG59XG5jbGFzcyBZQU1MTWFwIGV4dGVuZHMgQ29sbGVjdGlvbi5Db2xsZWN0aW9uIHtcbiAgICBzdGF0aWMgZ2V0IHRhZ05hbWUoKSB7XG4gICAgICAgIHJldHVybiAndGFnOnlhbWwub3JnLDIwMDI6bWFwJztcbiAgICB9XG4gICAgY29uc3RydWN0b3Ioc2NoZW1hKSB7XG4gICAgICAgIHN1cGVyKGlkZW50aXR5Lk1BUCwgc2NoZW1hKTtcbiAgICAgICAgdGhpcy5pdGVtcyA9IFtdO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBIGdlbmVyaWMgY29sbGVjdGlvbiBwYXJzaW5nIG1ldGhvZCB0aGF0IGNhbiBiZSBleHRlbmRlZFxuICAgICAqIHRvIG90aGVyIG5vZGUgY2xhc3NlcyB0aGF0IGluaGVyaXQgZnJvbSBZQU1MTWFwXG4gICAgICovXG4gICAgc3RhdGljIGZyb20oc2NoZW1hLCBvYmosIGN0eCkge1xuICAgICAgICBjb25zdCB7IGtlZXBVbmRlZmluZWQsIHJlcGxhY2VyIH0gPSBjdHg7XG4gICAgICAgIGNvbnN0IG1hcCA9IG5ldyB0aGlzKHNjaGVtYSk7XG4gICAgICAgIGNvbnN0IGFkZCA9IChrZXksIHZhbHVlKSA9PiB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHJlcGxhY2VyID09PSAnZnVuY3Rpb24nKVxuICAgICAgICAgICAgICAgIHZhbHVlID0gcmVwbGFjZXIuY2FsbChvYmosIGtleSwgdmFsdWUpO1xuICAgICAgICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheShyZXBsYWNlcikgJiYgIXJlcGxhY2VyLmluY2x1ZGVzKGtleSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQgfHwga2VlcFVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICBtYXAuaXRlbXMucHVzaChQYWlyLmNyZWF0ZVBhaXIoa2V5LCB2YWx1ZSwgY3R4KSk7XG4gICAgICAgIH07XG4gICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBNYXApIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIG9iailcbiAgICAgICAgICAgICAgICBhZGQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAob2JqICYmIHR5cGVvZiBvYmogPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhvYmopKVxuICAgICAgICAgICAgICAgIGFkZChrZXksIG9ialtrZXldKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHNjaGVtYS5zb3J0TWFwRW50cmllcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgbWFwLml0ZW1zLnNvcnQoc2NoZW1hLnNvcnRNYXBFbnRyaWVzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWFwO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgdmFsdWUgdG8gdGhlIGNvbGxlY3Rpb24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gb3ZlcndyaXRlIC0gSWYgbm90IHNldCBgdHJ1ZWAsIHVzaW5nIGEga2V5IHRoYXQgaXMgYWxyZWFkeSBpbiB0aGVcbiAgICAgKiAgIGNvbGxlY3Rpb24gd2lsbCB0aHJvdy4gT3RoZXJ3aXNlLCBvdmVyd3JpdGVzIHRoZSBwcmV2aW91cyB2YWx1ZS5cbiAgICAgKi9cbiAgICBhZGQocGFpciwgb3ZlcndyaXRlKSB7XG4gICAgICAgIGxldCBfcGFpcjtcbiAgICAgICAgaWYgKGlkZW50aXR5LmlzUGFpcihwYWlyKSlcbiAgICAgICAgICAgIF9wYWlyID0gcGFpcjtcbiAgICAgICAgZWxzZSBpZiAoIXBhaXIgfHwgdHlwZW9mIHBhaXIgIT09ICdvYmplY3QnIHx8ICEoJ2tleScgaW4gcGFpcikpIHtcbiAgICAgICAgICAgIC8vIEluIFR5cGVTY3JpcHQsIHRoaXMgbmV2ZXIgaGFwcGVucy5cbiAgICAgICAgICAgIF9wYWlyID0gbmV3IFBhaXIuUGFpcihwYWlyLCBwYWlyPy52YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgX3BhaXIgPSBuZXcgUGFpci5QYWlyKHBhaXIua2V5LCBwYWlyLnZhbHVlKTtcbiAgICAgICAgY29uc3QgcHJldiA9IGZpbmRQYWlyKHRoaXMuaXRlbXMsIF9wYWlyLmtleSk7XG4gICAgICAgIGNvbnN0IHNvcnRFbnRyaWVzID0gdGhpcy5zY2hlbWE/LnNvcnRNYXBFbnRyaWVzO1xuICAgICAgICBpZiAocHJldikge1xuICAgICAgICAgICAgaWYgKCFvdmVyd3JpdGUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBLZXkgJHtfcGFpci5rZXl9IGFscmVhZHkgc2V0YCk7XG4gICAgICAgICAgICAvLyBGb3Igc2NhbGFycywga2VlcCB0aGUgb2xkIG5vZGUgJiBpdHMgY29tbWVudHMgYW5kIGFuY2hvcnNcbiAgICAgICAgICAgIGlmIChpZGVudGl0eS5pc1NjYWxhcihwcmV2LnZhbHVlKSAmJiBTY2FsYXIuaXNTY2FsYXJWYWx1ZShfcGFpci52YWx1ZSkpXG4gICAgICAgICAgICAgICAgcHJldi52YWx1ZS52YWx1ZSA9IF9wYWlyLnZhbHVlO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHByZXYudmFsdWUgPSBfcGFpci52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChzb3J0RW50cmllcykge1xuICAgICAgICAgICAgY29uc3QgaSA9IHRoaXMuaXRlbXMuZmluZEluZGV4KGl0ZW0gPT4gc29ydEVudHJpZXMoX3BhaXIsIGl0ZW0pIDwgMCk7XG4gICAgICAgICAgICBpZiAoaSA9PT0gLTEpXG4gICAgICAgICAgICAgICAgdGhpcy5pdGVtcy5wdXNoKF9wYWlyKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0aGlzLml0ZW1zLnNwbGljZShpLCAwLCBfcGFpcik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLml0ZW1zLnB1c2goX3BhaXIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGRlbGV0ZShrZXkpIHtcbiAgICAgICAgY29uc3QgaXQgPSBmaW5kUGFpcih0aGlzLml0ZW1zLCBrZXkpO1xuICAgICAgICBpZiAoIWl0KVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBjb25zdCBkZWwgPSB0aGlzLml0ZW1zLnNwbGljZSh0aGlzLml0ZW1zLmluZGV4T2YoaXQpLCAxKTtcbiAgICAgICAgcmV0dXJuIGRlbC5sZW5ndGggPiAwO1xuICAgIH1cbiAgICBnZXQoa2V5LCBrZWVwU2NhbGFyKSB7XG4gICAgICAgIGNvbnN0IGl0ID0gZmluZFBhaXIodGhpcy5pdGVtcywga2V5KTtcbiAgICAgICAgY29uc3Qgbm9kZSA9IGl0Py52YWx1ZTtcbiAgICAgICAgcmV0dXJuICgha2VlcFNjYWxhciAmJiBpZGVudGl0eS5pc1NjYWxhcihub2RlKSA/IG5vZGUudmFsdWUgOiBub2RlKSA/PyB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGhhcyhrZXkpIHtcbiAgICAgICAgcmV0dXJuICEhZmluZFBhaXIodGhpcy5pdGVtcywga2V5KTtcbiAgICB9XG4gICAgc2V0KGtleSwgdmFsdWUpIHtcbiAgICAgICAgdGhpcy5hZGQobmV3IFBhaXIuUGFpcihrZXksIHZhbHVlKSwgdHJ1ZSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEBwYXJhbSBjdHggLSBDb252ZXJzaW9uIGNvbnRleHQsIG9yaWdpbmFsbHkgc2V0IGluIERvY3VtZW50I3RvSlMoKVxuICAgICAqIEBwYXJhbSB7Q2xhc3N9IFR5cGUgLSBJZiBzZXQsIGZvcmNlcyB0aGUgcmV0dXJuZWQgY29sbGVjdGlvbiB0eXBlXG4gICAgICogQHJldHVybnMgSW5zdGFuY2Ugb2YgVHlwZSwgTWFwLCBvciBPYmplY3RcbiAgICAgKi9cbiAgICB0b0pTT04oXywgY3R4LCBUeXBlKSB7XG4gICAgICAgIGNvbnN0IG1hcCA9IFR5cGUgPyBuZXcgVHlwZSgpIDogY3R4Py5tYXBBc01hcCA/IG5ldyBNYXAoKSA6IHt9O1xuICAgICAgICBpZiAoY3R4Py5vbkNyZWF0ZSlcbiAgICAgICAgICAgIGN0eC5vbkNyZWF0ZShtYXApO1xuICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgdGhpcy5pdGVtcylcbiAgICAgICAgICAgIGFkZFBhaXJUb0pTTWFwLmFkZFBhaXJUb0pTTWFwKGN0eCwgbWFwLCBpdGVtKTtcbiAgICAgICAgcmV0dXJuIG1hcDtcbiAgICB9XG4gICAgdG9TdHJpbmcoY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKSB7XG4gICAgICAgIGlmICghY3R4KVxuICAgICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHRoaXMpO1xuICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgdGhpcy5pdGVtcykge1xuICAgICAgICAgICAgaWYgKCFpZGVudGl0eS5pc1BhaXIoaXRlbSkpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBNYXAgaXRlbXMgbXVzdCBhbGwgYmUgcGFpcnM7IGZvdW5kICR7SlNPTi5zdHJpbmdpZnkoaXRlbSl9IGluc3RlYWRgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWN0eC5hbGxOdWxsVmFsdWVzICYmIHRoaXMuaGFzQWxsTnVsbFZhbHVlcyhmYWxzZSkpXG4gICAgICAgICAgICBjdHggPSBPYmplY3QuYXNzaWduKHt9LCBjdHgsIHsgYWxsTnVsbFZhbHVlczogdHJ1ZSB9KTtcbiAgICAgICAgcmV0dXJuIHN0cmluZ2lmeUNvbGxlY3Rpb24uc3RyaW5naWZ5Q29sbGVjdGlvbih0aGlzLCBjdHgsIHtcbiAgICAgICAgICAgIGJsb2NrSXRlbVByZWZpeDogJycsXG4gICAgICAgICAgICBmbG93Q2hhcnM6IHsgc3RhcnQ6ICd7JywgZW5kOiAnfScgfSxcbiAgICAgICAgICAgIGl0ZW1JbmRlbnQ6IGN0eC5pbmRlbnQgfHwgJycsXG4gICAgICAgICAgICBvbkNob21wS2VlcCxcbiAgICAgICAgICAgIG9uQ29tbWVudFxuICAgICAgICB9KTtcbiAgICB9XG59XG5cbmV4cG9ydHMuWUFNTE1hcCA9IFlBTUxNYXA7XG5leHBvcnRzLmZpbmRQYWlyID0gZmluZFBhaXI7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIGlkZW50aXR5ID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvaWRlbnRpdHkuanMnKTtcbnZhciBZQU1MTWFwID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvWUFNTE1hcC5qcycpO1xuXG5jb25zdCBtYXAgPSB7XG4gICAgY29sbGVjdGlvbjogJ21hcCcsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICBub2RlQ2xhc3M6IFlBTUxNYXAuWUFNTE1hcCxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjptYXAnLFxuICAgIHJlc29sdmUobWFwLCBvbkVycm9yKSB7XG4gICAgICAgIGlmICghaWRlbnRpdHkuaXNNYXAobWFwKSlcbiAgICAgICAgICAgIG9uRXJyb3IoJ0V4cGVjdGVkIGEgbWFwcGluZyBmb3IgdGhpcyB0YWcnKTtcbiAgICAgICAgcmV0dXJuIG1hcDtcbiAgICB9LFxuICAgIGNyZWF0ZU5vZGU6IChzY2hlbWEsIG9iaiwgY3R4KSA9PiBZQU1MTWFwLllBTUxNYXAuZnJvbShzY2hlbWEsIG9iaiwgY3R4KVxufTtcblxuZXhwb3J0cy5tYXAgPSBtYXA7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIGNyZWF0ZU5vZGUgPSByZXF1aXJlKCcuLi9kb2MvY3JlYXRlTm9kZS5qcycpO1xudmFyIHN0cmluZ2lmeUNvbGxlY3Rpb24gPSByZXF1aXJlKCcuLi9zdHJpbmdpZnkvc3RyaW5naWZ5Q29sbGVjdGlvbi5qcycpO1xudmFyIENvbGxlY3Rpb24gPSByZXF1aXJlKCcuL0NvbGxlY3Rpb24uanMnKTtcbnZhciBpZGVudGl0eSA9IHJlcXVpcmUoJy4vaWRlbnRpdHkuanMnKTtcbnZhciBTY2FsYXIgPSByZXF1aXJlKCcuL1NjYWxhci5qcycpO1xudmFyIHRvSlMgPSByZXF1aXJlKCcuL3RvSlMuanMnKTtcblxuY2xhc3MgWUFNTFNlcSBleHRlbmRzIENvbGxlY3Rpb24uQ29sbGVjdGlvbiB7XG4gICAgc3RhdGljIGdldCB0YWdOYW1lKCkge1xuICAgICAgICByZXR1cm4gJ3RhZzp5YW1sLm9yZywyMDAyOnNlcSc7XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKHNjaGVtYSkge1xuICAgICAgICBzdXBlcihpZGVudGl0eS5TRVEsIHNjaGVtYSk7XG4gICAgICAgIHRoaXMuaXRlbXMgPSBbXTtcbiAgICB9XG4gICAgYWRkKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuaXRlbXMucHVzaCh2YWx1ZSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYSB2YWx1ZSBmcm9tIHRoZSBjb2xsZWN0aW9uLlxuICAgICAqXG4gICAgICogYGtleWAgbXVzdCBjb250YWluIGEgcmVwcmVzZW50YXRpb24gb2YgYW4gaW50ZWdlciBmb3IgdGhpcyB0byBzdWNjZWVkLlxuICAgICAqIEl0IG1heSBiZSB3cmFwcGVkIGluIGEgYFNjYWxhcmAuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGl0ZW0gd2FzIGZvdW5kIGFuZCByZW1vdmVkLlxuICAgICAqL1xuICAgIGRlbGV0ZShrZXkpIHtcbiAgICAgICAgY29uc3QgaWR4ID0gYXNJdGVtSW5kZXgoa2V5KTtcbiAgICAgICAgaWYgKHR5cGVvZiBpZHggIT09ICdudW1iZXInKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBjb25zdCBkZWwgPSB0aGlzLml0ZW1zLnNwbGljZShpZHgsIDEpO1xuICAgICAgICByZXR1cm4gZGVsLmxlbmd0aCA+IDA7XG4gICAgfVxuICAgIGdldChrZXksIGtlZXBTY2FsYXIpIHtcbiAgICAgICAgY29uc3QgaWR4ID0gYXNJdGVtSW5kZXgoa2V5KTtcbiAgICAgICAgaWYgKHR5cGVvZiBpZHggIT09ICdudW1iZXInKVxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgY29uc3QgaXQgPSB0aGlzLml0ZW1zW2lkeF07XG4gICAgICAgIHJldHVybiAha2VlcFNjYWxhciAmJiBpZGVudGl0eS5pc1NjYWxhcihpdCkgPyBpdC52YWx1ZSA6IGl0O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgdGhlIGNvbGxlY3Rpb24gaW5jbHVkZXMgYSB2YWx1ZSB3aXRoIHRoZSBrZXkgYGtleWAuXG4gICAgICpcbiAgICAgKiBga2V5YCBtdXN0IGNvbnRhaW4gYSByZXByZXNlbnRhdGlvbiBvZiBhbiBpbnRlZ2VyIGZvciB0aGlzIHRvIHN1Y2NlZWQuXG4gICAgICogSXQgbWF5IGJlIHdyYXBwZWQgaW4gYSBgU2NhbGFyYC5cbiAgICAgKi9cbiAgICBoYXMoa2V5KSB7XG4gICAgICAgIGNvbnN0IGlkeCA9IGFzSXRlbUluZGV4KGtleSk7XG4gICAgICAgIHJldHVybiB0eXBlb2YgaWR4ID09PSAnbnVtYmVyJyAmJiBpZHggPCB0aGlzLml0ZW1zLmxlbmd0aDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0cyBhIHZhbHVlIGluIHRoaXMgY29sbGVjdGlvbi4gRm9yIGAhIXNldGAsIGB2YWx1ZWAgbmVlZHMgdG8gYmUgYVxuICAgICAqIGJvb2xlYW4gdG8gYWRkL3JlbW92ZSB0aGUgaXRlbSBmcm9tIHRoZSBzZXQuXG4gICAgICpcbiAgICAgKiBJZiBga2V5YCBkb2VzIG5vdCBjb250YWluIGEgcmVwcmVzZW50YXRpb24gb2YgYW4gaW50ZWdlciwgdGhpcyB3aWxsIHRocm93LlxuICAgICAqIEl0IG1heSBiZSB3cmFwcGVkIGluIGEgYFNjYWxhcmAuXG4gICAgICovXG4gICAgc2V0KGtleSwgdmFsdWUpIHtcbiAgICAgICAgY29uc3QgaWR4ID0gYXNJdGVtSW5kZXgoa2V5KTtcbiAgICAgICAgaWYgKHR5cGVvZiBpZHggIT09ICdudW1iZXInKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCBhIHZhbGlkIGluZGV4LCBub3QgJHtrZXl9LmApO1xuICAgICAgICBjb25zdCBwcmV2ID0gdGhpcy5pdGVtc1tpZHhdO1xuICAgICAgICBpZiAoaWRlbnRpdHkuaXNTY2FsYXIocHJldikgJiYgU2NhbGFyLmlzU2NhbGFyVmFsdWUodmFsdWUpKVxuICAgICAgICAgICAgcHJldi52YWx1ZSA9IHZhbHVlO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aGlzLml0ZW1zW2lkeF0gPSB2YWx1ZTtcbiAgICB9XG4gICAgdG9KU09OKF8sIGN0eCkge1xuICAgICAgICBjb25zdCBzZXEgPSBbXTtcbiAgICAgICAgaWYgKGN0eD8ub25DcmVhdGUpXG4gICAgICAgICAgICBjdHgub25DcmVhdGUoc2VxKTtcbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgdGhpcy5pdGVtcylcbiAgICAgICAgICAgIHNlcS5wdXNoKHRvSlMudG9KUyhpdGVtLCBTdHJpbmcoaSsrKSwgY3R4KSk7XG4gICAgICAgIHJldHVybiBzZXE7XG4gICAgfVxuICAgIHRvU3RyaW5nKGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCkge1xuICAgICAgICBpZiAoIWN0eClcbiAgICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzKTtcbiAgICAgICAgcmV0dXJuIHN0cmluZ2lmeUNvbGxlY3Rpb24uc3RyaW5naWZ5Q29sbGVjdGlvbih0aGlzLCBjdHgsIHtcbiAgICAgICAgICAgIGJsb2NrSXRlbVByZWZpeDogJy0gJyxcbiAgICAgICAgICAgIGZsb3dDaGFyczogeyBzdGFydDogJ1snLCBlbmQ6ICddJyB9LFxuICAgICAgICAgICAgaXRlbUluZGVudDogKGN0eC5pbmRlbnQgfHwgJycpICsgJyAgJyxcbiAgICAgICAgICAgIG9uQ2hvbXBLZWVwLFxuICAgICAgICAgICAgb25Db21tZW50XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBzdGF0aWMgZnJvbShzY2hlbWEsIG9iaiwgY3R4KSB7XG4gICAgICAgIGNvbnN0IHsgcmVwbGFjZXIgfSA9IGN0eDtcbiAgICAgICAgY29uc3Qgc2VxID0gbmV3IHRoaXMoc2NoZW1hKTtcbiAgICAgICAgaWYgKG9iaiAmJiBTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KG9iaikpIHtcbiAgICAgICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgICAgIGZvciAobGV0IGl0IG9mIG9iaikge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcmVwbGFjZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qga2V5ID0gb2JqIGluc3RhbmNlb2YgU2V0ID8gaXQgOiBTdHJpbmcoaSsrKTtcbiAgICAgICAgICAgICAgICAgICAgaXQgPSByZXBsYWNlci5jYWxsKG9iaiwga2V5LCBpdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNlcS5pdGVtcy5wdXNoKGNyZWF0ZU5vZGUuY3JlYXRlTm9kZShpdCwgdW5kZWZpbmVkLCBjdHgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2VxO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGFzSXRlbUluZGV4KGtleSkge1xuICAgIGxldCBpZHggPSBpZGVudGl0eS5pc1NjYWxhcihrZXkpID8ga2V5LnZhbHVlIDoga2V5O1xuICAgIGlmIChpZHggJiYgdHlwZW9mIGlkeCA9PT0gJ3N0cmluZycpXG4gICAgICAgIGlkeCA9IE51bWJlcihpZHgpO1xuICAgIHJldHVybiB0eXBlb2YgaWR4ID09PSAnbnVtYmVyJyAmJiBOdW1iZXIuaXNJbnRlZ2VyKGlkeCkgJiYgaWR4ID49IDBcbiAgICAgICAgPyBpZHhcbiAgICAgICAgOiBudWxsO1xufVxuXG5leHBvcnRzLllBTUxTZXEgPSBZQU1MU2VxO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBpZGVudGl0eSA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL2lkZW50aXR5LmpzJyk7XG52YXIgWUFNTFNlcSA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL1lBTUxTZXEuanMnKTtcblxuY29uc3Qgc2VxID0ge1xuICAgIGNvbGxlY3Rpb246ICdzZXEnLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgbm9kZUNsYXNzOiBZQU1MU2VxLllBTUxTZXEsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6c2VxJyxcbiAgICByZXNvbHZlKHNlcSwgb25FcnJvcikge1xuICAgICAgICBpZiAoIWlkZW50aXR5LmlzU2VxKHNlcSkpXG4gICAgICAgICAgICBvbkVycm9yKCdFeHBlY3RlZCBhIHNlcXVlbmNlIGZvciB0aGlzIHRhZycpO1xuICAgICAgICByZXR1cm4gc2VxO1xuICAgIH0sXG4gICAgY3JlYXRlTm9kZTogKHNjaGVtYSwgb2JqLCBjdHgpID0+IFlBTUxTZXEuWUFNTFNlcS5mcm9tKHNjaGVtYSwgb2JqLCBjdHgpXG59O1xuXG5leHBvcnRzLnNlcSA9IHNlcTtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgc3RyaW5naWZ5U3RyaW5nID0gcmVxdWlyZSgnLi4vLi4vc3RyaW5naWZ5L3N0cmluZ2lmeVN0cmluZy5qcycpO1xuXG5jb25zdCBzdHJpbmcgPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpzdHInLFxuICAgIHJlc29sdmU6IHN0ciA9PiBzdHIsXG4gICAgc3RyaW5naWZ5KGl0ZW0sIGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCkge1xuICAgICAgICBjdHggPSBPYmplY3QuYXNzaWduKHsgYWN0dWFsU3RyaW5nOiB0cnVlIH0sIGN0eCk7XG4gICAgICAgIHJldHVybiBzdHJpbmdpZnlTdHJpbmcuc3RyaW5naWZ5U3RyaW5nKGl0ZW0sIGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCk7XG4gICAgfVxufTtcblxuZXhwb3J0cy5zdHJpbmcgPSBzdHJpbmc7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIFNjYWxhciA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL1NjYWxhci5qcycpO1xuXG5jb25zdCBudWxsVGFnID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB2YWx1ZSA9PSBudWxsLFxuICAgIGNyZWF0ZU5vZGU6ICgpID0+IG5ldyBTY2FsYXIuU2NhbGFyKG51bGwpLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6bnVsbCcsXG4gICAgdGVzdDogL14oPzp+fFtObl11bGx8TlVMTCk/JC8sXG4gICAgcmVzb2x2ZTogKCkgPT4gbmV3IFNjYWxhci5TY2FsYXIobnVsbCksXG4gICAgc3RyaW5naWZ5OiAoeyBzb3VyY2UgfSwgY3R4KSA9PiB0eXBlb2Ygc291cmNlID09PSAnc3RyaW5nJyAmJiBudWxsVGFnLnRlc3QudGVzdChzb3VyY2UpXG4gICAgICAgID8gc291cmNlXG4gICAgICAgIDogY3R4Lm9wdGlvbnMubnVsbFN0clxufTtcblxuZXhwb3J0cy5udWxsVGFnID0gbnVsbFRhZztcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgU2NhbGFyID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvU2NhbGFyLmpzJyk7XG5cbmNvbnN0IGJvb2xUYWcgPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6Ym9vbCcsXG4gICAgdGVzdDogL14oPzpbVHRdcnVlfFRSVUV8W0ZmXWFsc2V8RkFMU0UpJC8sXG4gICAgcmVzb2x2ZTogc3RyID0+IG5ldyBTY2FsYXIuU2NhbGFyKHN0clswXSA9PT0gJ3QnIHx8IHN0clswXSA9PT0gJ1QnKSxcbiAgICBzdHJpbmdpZnkoeyBzb3VyY2UsIHZhbHVlIH0sIGN0eCkge1xuICAgICAgICBpZiAoc291cmNlICYmIGJvb2xUYWcudGVzdC50ZXN0KHNvdXJjZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IHN2ID0gc291cmNlWzBdID09PSAndCcgfHwgc291cmNlWzBdID09PSAnVCc7XG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IHN2KVxuICAgICAgICAgICAgICAgIHJldHVybiBzb3VyY2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbHVlID8gY3R4Lm9wdGlvbnMudHJ1ZVN0ciA6IGN0eC5vcHRpb25zLmZhbHNlU3RyO1xuICAgIH1cbn07XG5cbmV4cG9ydHMuYm9vbFRhZyA9IGJvb2xUYWc7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gc3RyaW5naWZ5TnVtYmVyKHsgZm9ybWF0LCBtaW5GcmFjdGlvbkRpZ2l0cywgdGFnLCB2YWx1ZSB9KSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2JpZ2ludCcpXG4gICAgICAgIHJldHVybiBTdHJpbmcodmFsdWUpO1xuICAgIGNvbnN0IG51bSA9IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgPyB2YWx1ZSA6IE51bWJlcih2YWx1ZSk7XG4gICAgaWYgKCFpc0Zpbml0ZShudW0pKVxuICAgICAgICByZXR1cm4gaXNOYU4obnVtKSA/ICcubmFuJyA6IG51bSA8IDAgPyAnLS5pbmYnIDogJy5pbmYnO1xuICAgIGxldCBuID0gT2JqZWN0LmlzKHZhbHVlLCAtMCkgPyAnLTAnIDogSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgIGlmICghZm9ybWF0ICYmXG4gICAgICAgIG1pbkZyYWN0aW9uRGlnaXRzICYmXG4gICAgICAgICghdGFnIHx8IHRhZyA9PT0gJ3RhZzp5YW1sLm9yZywyMDAyOmZsb2F0JykgJiZcbiAgICAgICAgL15cXGQvLnRlc3QobikpIHtcbiAgICAgICAgbGV0IGkgPSBuLmluZGV4T2YoJy4nKTtcbiAgICAgICAgaWYgKGkgPCAwKSB7XG4gICAgICAgICAgICBpID0gbi5sZW5ndGg7XG4gICAgICAgICAgICBuICs9ICcuJztcbiAgICAgICAgfVxuICAgICAgICBsZXQgZCA9IG1pbkZyYWN0aW9uRGlnaXRzIC0gKG4ubGVuZ3RoIC0gaSAtIDEpO1xuICAgICAgICB3aGlsZSAoZC0tID4gMClcbiAgICAgICAgICAgIG4gKz0gJzAnO1xuICAgIH1cbiAgICByZXR1cm4gbjtcbn1cblxuZXhwb3J0cy5zdHJpbmdpZnlOdW1iZXIgPSBzdHJpbmdpZnlOdW1iZXI7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIFNjYWxhciA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL1NjYWxhci5qcycpO1xudmFyIHN0cmluZ2lmeU51bWJlciA9IHJlcXVpcmUoJy4uLy4uL3N0cmluZ2lmeS9zdHJpbmdpZnlOdW1iZXIuanMnKTtcblxuY29uc3QgZmxvYXROYU4gPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpmbG9hdCcsXG4gICAgdGVzdDogL14oPzpbLStdP1xcLig/OmluZnxJbmZ8SU5GKXxcXC5uYW58XFwuTmFOfFxcLk5BTikkLyxcbiAgICByZXNvbHZlOiBzdHIgPT4gc3RyLnNsaWNlKC0zKS50b0xvd2VyQ2FzZSgpID09PSAnbmFuJ1xuICAgICAgICA/IE5hTlxuICAgICAgICA6IHN0clswXSA9PT0gJy0nXG4gICAgICAgICAgICA/IE51bWJlci5ORUdBVElWRV9JTkZJTklUWVxuICAgICAgICAgICAgOiBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFksXG4gICAgc3RyaW5naWZ5OiBzdHJpbmdpZnlOdW1iZXIuc3RyaW5naWZ5TnVtYmVyXG59O1xuY29uc3QgZmxvYXRFeHAgPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpmbG9hdCcsXG4gICAgZm9ybWF0OiAnRVhQJyxcbiAgICB0ZXN0OiAvXlstK10/KD86XFwuWzAtOV0rfFswLTldKyg/OlxcLlswLTldKik/KVtlRV1bLStdP1swLTldKyQvLFxuICAgIHJlc29sdmU6IHN0ciA9PiBwYXJzZUZsb2F0KHN0ciksXG4gICAgc3RyaW5naWZ5KG5vZGUpIHtcbiAgICAgICAgY29uc3QgbnVtID0gTnVtYmVyKG5vZGUudmFsdWUpO1xuICAgICAgICByZXR1cm4gaXNGaW5pdGUobnVtKSA/IG51bS50b0V4cG9uZW50aWFsKCkgOiBzdHJpbmdpZnlOdW1iZXIuc3RyaW5naWZ5TnVtYmVyKG5vZGUpO1xuICAgIH1cbn07XG5jb25zdCBmbG9hdCA9IHtcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmZsb2F0JyxcbiAgICB0ZXN0OiAvXlstK10/KD86XFwuWzAtOV0rfFswLTldK1xcLlswLTldKikkLyxcbiAgICByZXNvbHZlKHN0cikge1xuICAgICAgICBjb25zdCBub2RlID0gbmV3IFNjYWxhci5TY2FsYXIocGFyc2VGbG9hdChzdHIpKTtcbiAgICAgICAgY29uc3QgZG90ID0gc3RyLmluZGV4T2YoJy4nKTtcbiAgICAgICAgaWYgKGRvdCAhPT0gLTEgJiYgc3RyW3N0ci5sZW5ndGggLSAxXSA9PT0gJzAnKVxuICAgICAgICAgICAgbm9kZS5taW5GcmFjdGlvbkRpZ2l0cyA9IHN0ci5sZW5ndGggLSBkb3QgLSAxO1xuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICB9LFxuICAgIHN0cmluZ2lmeTogc3RyaW5naWZ5TnVtYmVyLnN0cmluZ2lmeU51bWJlclxufTtcblxuZXhwb3J0cy5mbG9hdCA9IGZsb2F0O1xuZXhwb3J0cy5mbG9hdEV4cCA9IGZsb2F0RXhwO1xuZXhwb3J0cy5mbG9hdE5hTiA9IGZsb2F0TmFOO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBzdHJpbmdpZnlOdW1iZXIgPSByZXF1aXJlKCcuLi8uLi9zdHJpbmdpZnkvc3RyaW5naWZ5TnVtYmVyLmpzJyk7XG5cbmNvbnN0IGludElkZW50aWZ5ID0gKHZhbHVlKSA9PiB0eXBlb2YgdmFsdWUgPT09ICdiaWdpbnQnIHx8IE51bWJlci5pc0ludGVnZXIodmFsdWUpO1xuY29uc3QgaW50UmVzb2x2ZSA9IChzdHIsIG9mZnNldCwgcmFkaXgsIHsgaW50QXNCaWdJbnQgfSkgPT4gKGludEFzQmlnSW50ID8gQmlnSW50KHN0cikgOiBwYXJzZUludChzdHIuc3Vic3RyaW5nKG9mZnNldCksIHJhZGl4KSk7XG5mdW5jdGlvbiBpbnRTdHJpbmdpZnkobm9kZSwgcmFkaXgsIHByZWZpeCkge1xuICAgIGNvbnN0IHsgdmFsdWUgfSA9IG5vZGU7XG4gICAgaWYgKGludElkZW50aWZ5KHZhbHVlKSAmJiB2YWx1ZSA+PSAwKVxuICAgICAgICByZXR1cm4gcHJlZml4ICsgdmFsdWUudG9TdHJpbmcocmFkaXgpO1xuICAgIHJldHVybiBzdHJpbmdpZnlOdW1iZXIuc3RyaW5naWZ5TnVtYmVyKG5vZGUpO1xufVxuY29uc3QgaW50T2N0ID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiBpbnRJZGVudGlmeSh2YWx1ZSkgJiYgdmFsdWUgPj0gMCxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmludCcsXG4gICAgZm9ybWF0OiAnT0NUJyxcbiAgICB0ZXN0OiAvXjBvWzAtN10rJC8sXG4gICAgcmVzb2x2ZTogKHN0ciwgX29uRXJyb3IsIG9wdCkgPT4gaW50UmVzb2x2ZShzdHIsIDIsIDgsIG9wdCksXG4gICAgc3RyaW5naWZ5OiBub2RlID0+IGludFN0cmluZ2lmeShub2RlLCA4LCAnMG8nKVxufTtcbmNvbnN0IGludCA9IHtcbiAgICBpZGVudGlmeTogaW50SWRlbnRpZnksXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjppbnQnLFxuICAgIHRlc3Q6IC9eWy0rXT9bMC05XSskLyxcbiAgICByZXNvbHZlOiAoc3RyLCBfb25FcnJvciwgb3B0KSA9PiBpbnRSZXNvbHZlKHN0ciwgMCwgMTAsIG9wdCksXG4gICAgc3RyaW5naWZ5OiBzdHJpbmdpZnlOdW1iZXIuc3RyaW5naWZ5TnVtYmVyXG59O1xuY29uc3QgaW50SGV4ID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiBpbnRJZGVudGlmeSh2YWx1ZSkgJiYgdmFsdWUgPj0gMCxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmludCcsXG4gICAgZm9ybWF0OiAnSEVYJyxcbiAgICB0ZXN0OiAvXjB4WzAtOWEtZkEtRl0rJC8sXG4gICAgcmVzb2x2ZTogKHN0ciwgX29uRXJyb3IsIG9wdCkgPT4gaW50UmVzb2x2ZShzdHIsIDIsIDE2LCBvcHQpLFxuICAgIHN0cmluZ2lmeTogbm9kZSA9PiBpbnRTdHJpbmdpZnkobm9kZSwgMTYsICcweCcpXG59O1xuXG5leHBvcnRzLmludCA9IGludDtcbmV4cG9ydHMuaW50SGV4ID0gaW50SGV4O1xuZXhwb3J0cy5pbnRPY3QgPSBpbnRPY3Q7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIG1hcCA9IHJlcXVpcmUoJy4uL2NvbW1vbi9tYXAuanMnKTtcbnZhciBfbnVsbCA9IHJlcXVpcmUoJy4uL2NvbW1vbi9udWxsLmpzJyk7XG52YXIgc2VxID0gcmVxdWlyZSgnLi4vY29tbW9uL3NlcS5qcycpO1xudmFyIHN0cmluZyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9zdHJpbmcuanMnKTtcbnZhciBib29sID0gcmVxdWlyZSgnLi9ib29sLmpzJyk7XG52YXIgZmxvYXQgPSByZXF1aXJlKCcuL2Zsb2F0LmpzJyk7XG52YXIgaW50ID0gcmVxdWlyZSgnLi9pbnQuanMnKTtcblxuY29uc3Qgc2NoZW1hID0gW1xuICAgIG1hcC5tYXAsXG4gICAgc2VxLnNlcSxcbiAgICBzdHJpbmcuc3RyaW5nLFxuICAgIF9udWxsLm51bGxUYWcsXG4gICAgYm9vbC5ib29sVGFnLFxuICAgIGludC5pbnRPY3QsXG4gICAgaW50LmludCxcbiAgICBpbnQuaW50SGV4LFxuICAgIGZsb2F0LmZsb2F0TmFOLFxuICAgIGZsb2F0LmZsb2F0RXhwLFxuICAgIGZsb2F0LmZsb2F0XG5dO1xuXG5leHBvcnRzLnNjaGVtYSA9IHNjaGVtYTtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgU2NhbGFyID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvU2NhbGFyLmpzJyk7XG52YXIgbWFwID0gcmVxdWlyZSgnLi4vY29tbW9uL21hcC5qcycpO1xudmFyIHNlcSA9IHJlcXVpcmUoJy4uL2NvbW1vbi9zZXEuanMnKTtcblxuZnVuY3Rpb24gaW50SWRlbnRpZnkodmFsdWUpIHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnYmlnaW50JyB8fCBOdW1iZXIuaXNJbnRlZ2VyKHZhbHVlKTtcbn1cbmNvbnN0IHN0cmluZ2lmeUpTT04gPSAoeyB2YWx1ZSB9KSA9PiBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG5jb25zdCBqc29uU2NhbGFycyA9IFtcbiAgICB7XG4gICAgICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpzdHInLFxuICAgICAgICByZXNvbHZlOiBzdHIgPT4gc3RyLFxuICAgICAgICBzdHJpbmdpZnk6IHN0cmluZ2lmeUpTT05cbiAgICB9LFxuICAgIHtcbiAgICAgICAgaWRlbnRpZnk6IHZhbHVlID0+IHZhbHVlID09IG51bGwsXG4gICAgICAgIGNyZWF0ZU5vZGU6ICgpID0+IG5ldyBTY2FsYXIuU2NhbGFyKG51bGwpLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpudWxsJyxcbiAgICAgICAgdGVzdDogL15udWxsJC8sXG4gICAgICAgIHJlc29sdmU6ICgpID0+IG51bGwsXG4gICAgICAgIHN0cmluZ2lmeTogc3RyaW5naWZ5SlNPTlxuICAgIH0sXG4gICAge1xuICAgICAgICBpZGVudGlmeTogdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmJvb2wnLFxuICAgICAgICB0ZXN0OiAvXnRydWUkfF5mYWxzZSQvLFxuICAgICAgICByZXNvbHZlOiBzdHIgPT4gc3RyID09PSAndHJ1ZScsXG4gICAgICAgIHN0cmluZ2lmeTogc3RyaW5naWZ5SlNPTlxuICAgIH0sXG4gICAge1xuICAgICAgICBpZGVudGlmeTogaW50SWRlbnRpZnksXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmludCcsXG4gICAgICAgIHRlc3Q6IC9eLT8oPzowfFsxLTldWzAtOV0qKSQvLFxuICAgICAgICByZXNvbHZlOiAoc3RyLCBfb25FcnJvciwgeyBpbnRBc0JpZ0ludCB9KSA9PiBpbnRBc0JpZ0ludCA/IEJpZ0ludChzdHIpIDogcGFyc2VJbnQoc3RyLCAxMCksXG4gICAgICAgIHN0cmluZ2lmeTogKHsgdmFsdWUgfSkgPT4gaW50SWRlbnRpZnkodmFsdWUpID8gdmFsdWUudG9TdHJpbmcoKSA6IEpTT04uc3RyaW5naWZ5KHZhbHVlKVxuICAgIH0sXG4gICAge1xuICAgICAgICBpZGVudGlmeTogdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6ZmxvYXQnLFxuICAgICAgICB0ZXN0OiAvXi0/KD86MHxbMS05XVswLTldKikoPzpcXC5bMC05XSopPyg/OltlRV1bLStdP1swLTldKyk/JC8sXG4gICAgICAgIHJlc29sdmU6IHN0ciA9PiBwYXJzZUZsb2F0KHN0ciksXG4gICAgICAgIHN0cmluZ2lmeTogc3RyaW5naWZ5SlNPTlxuICAgIH1cbl07XG5jb25zdCBqc29uRXJyb3IgPSB7XG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICcnLFxuICAgIHRlc3Q6IC9eLyxcbiAgICByZXNvbHZlKHN0ciwgb25FcnJvcikge1xuICAgICAgICBvbkVycm9yKGBVbnJlc29sdmVkIHBsYWluIHNjYWxhciAke0pTT04uc3RyaW5naWZ5KHN0cil9YCk7XG4gICAgICAgIHJldHVybiBzdHI7XG4gICAgfVxufTtcbmNvbnN0IHNjaGVtYSA9IFttYXAubWFwLCBzZXEuc2VxXS5jb25jYXQoanNvblNjYWxhcnMsIGpzb25FcnJvcik7XG5cbmV4cG9ydHMuc2NoZW1hID0gc2NoZW1hO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBub2RlX2J1ZmZlciA9IHJlcXVpcmUoJ2J1ZmZlcicpO1xudmFyIFNjYWxhciA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL1NjYWxhci5qcycpO1xudmFyIHN0cmluZ2lmeVN0cmluZyA9IHJlcXVpcmUoJy4uLy4uL3N0cmluZ2lmeS9zdHJpbmdpZnlTdHJpbmcuanMnKTtcblxuY29uc3QgYmluYXJ5ID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB2YWx1ZSBpbnN0YW5jZW9mIFVpbnQ4QXJyYXksIC8vIEJ1ZmZlciBpbmhlcml0cyBmcm9tIFVpbnQ4QXJyYXlcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpiaW5hcnknLFxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBCdWZmZXIgaW4gbm9kZSBhbmQgYW4gVWludDhBcnJheSBpbiBicm93c2Vyc1xuICAgICAqXG4gICAgICogVG8gdXNlIHRoZSByZXN1bHRpbmcgYnVmZmVyIGFzIGFuIGltYWdlLCB5b3UnbGwgd2FudCB0byBkbyBzb21ldGhpbmcgbGlrZTpcbiAgICAgKlxuICAgICAqICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFtidWZmZXJdLCB7IHR5cGU6ICdpbWFnZS9qcGVnJyB9KVxuICAgICAqICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3Bob3RvJykuc3JjID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKVxuICAgICAqL1xuICAgIHJlc29sdmUoc3JjLCBvbkVycm9yKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygbm9kZV9idWZmZXIuQnVmZmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICByZXR1cm4gbm9kZV9idWZmZXIuQnVmZmVyLmZyb20oc3JjLCAnYmFzZTY0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIGF0b2IgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIC8vIE9uIElFIDExLCBhdG9iKCkgY2FuJ3QgaGFuZGxlIG5ld2xpbmVzXG4gICAgICAgICAgICBjb25zdCBzdHIgPSBhdG9iKHNyYy5yZXBsYWNlKC9bXFxuXFxyXS9nLCAnJykpO1xuICAgICAgICAgICAgY29uc3QgYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoc3RyLmxlbmd0aCk7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0ci5sZW5ndGg7ICsraSlcbiAgICAgICAgICAgICAgICBidWZmZXJbaV0gPSBzdHIuY2hhckNvZGVBdChpKTtcbiAgICAgICAgICAgIHJldHVybiBidWZmZXI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBvbkVycm9yKCdUaGlzIGVudmlyb25tZW50IGRvZXMgbm90IHN1cHBvcnQgcmVhZGluZyBiaW5hcnkgdGFnczsgZWl0aGVyIEJ1ZmZlciBvciBhdG9iIGlzIHJlcXVpcmVkJyk7XG4gICAgICAgICAgICByZXR1cm4gc3JjO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBzdHJpbmdpZnkoeyBjb21tZW50LCB0eXBlLCB2YWx1ZSB9LCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApIHtcbiAgICAgICAgaWYgKCF2YWx1ZSlcbiAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgY29uc3QgYnVmID0gdmFsdWU7IC8vIGNoZWNrZWQgZWFybGllciBieSBiaW5hcnkuaWRlbnRpZnkoKVxuICAgICAgICBsZXQgc3RyO1xuICAgICAgICBpZiAodHlwZW9mIG5vZGVfYnVmZmVyLkJ1ZmZlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgc3RyID1cbiAgICAgICAgICAgICAgICBidWYgaW5zdGFuY2VvZiBub2RlX2J1ZmZlci5CdWZmZXJcbiAgICAgICAgICAgICAgICAgICAgPyBidWYudG9TdHJpbmcoJ2Jhc2U2NCcpXG4gICAgICAgICAgICAgICAgICAgIDogbm9kZV9idWZmZXIuQnVmZmVyLmZyb20oYnVmLmJ1ZmZlcikudG9TdHJpbmcoJ2Jhc2U2NCcpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiBidG9hID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBsZXQgcyA9ICcnO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBidWYubGVuZ3RoOyArK2kpXG4gICAgICAgICAgICAgICAgcyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSk7XG4gICAgICAgICAgICBzdHIgPSBidG9hKHMpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGlzIGVudmlyb25tZW50IGRvZXMgbm90IHN1cHBvcnQgd3JpdGluZyBiaW5hcnkgdGFnczsgZWl0aGVyIEJ1ZmZlciBvciBidG9hIGlzIHJlcXVpcmVkJyk7XG4gICAgICAgIH1cbiAgICAgICAgdHlwZSA/PyAodHlwZSA9IFNjYWxhci5TY2FsYXIuQkxPQ0tfTElURVJBTCk7XG4gICAgICAgIGlmICh0eXBlICE9PSBTY2FsYXIuU2NhbGFyLlFVT1RFX0RPVUJMRSkge1xuICAgICAgICAgICAgY29uc3QgbGluZVdpZHRoID0gTWF0aC5tYXgoY3R4Lm9wdGlvbnMubGluZVdpZHRoIC0gY3R4LmluZGVudC5sZW5ndGgsIGN0eC5vcHRpb25zLm1pbkNvbnRlbnRXaWR0aCk7XG4gICAgICAgICAgICBjb25zdCBuID0gTWF0aC5jZWlsKHN0ci5sZW5ndGggLyBsaW5lV2lkdGgpO1xuICAgICAgICAgICAgY29uc3QgbGluZXMgPSBuZXcgQXJyYXkobik7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgbyA9IDA7IGkgPCBuOyArK2ksIG8gKz0gbGluZVdpZHRoKSB7XG4gICAgICAgICAgICAgICAgbGluZXNbaV0gPSBzdHIuc3Vic3RyKG8sIGxpbmVXaWR0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdHIgPSBsaW5lcy5qb2luKHR5cGUgPT09IFNjYWxhci5TY2FsYXIuQkxPQ0tfTElURVJBTCA/ICdcXG4nIDogJyAnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3RyaW5naWZ5U3RyaW5nLnN0cmluZ2lmeVN0cmluZyh7IGNvbW1lbnQsIHR5cGUsIHZhbHVlOiBzdHIgfSwgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKTtcbiAgICB9XG59O1xuXG5leHBvcnRzLmJpbmFyeSA9IGJpbmFyeTtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9pZGVudGl0eS5qcycpO1xudmFyIFBhaXIgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9QYWlyLmpzJyk7XG52YXIgU2NhbGFyID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvU2NhbGFyLmpzJyk7XG52YXIgWUFNTFNlcSA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL1lBTUxTZXEuanMnKTtcblxuZnVuY3Rpb24gcmVzb2x2ZVBhaXJzKHNlcSwgb25FcnJvcikge1xuICAgIGlmIChpZGVudGl0eS5pc1NlcShzZXEpKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2VxLml0ZW1zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBsZXQgaXRlbSA9IHNlcS5pdGVtc1tpXTtcbiAgICAgICAgICAgIGlmIChpZGVudGl0eS5pc1BhaXIoaXRlbSkpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICBlbHNlIGlmIChpZGVudGl0eS5pc01hcChpdGVtKSkge1xuICAgICAgICAgICAgICAgIGlmIChpdGVtLml0ZW1zLmxlbmd0aCA+IDEpXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IoJ0VhY2ggcGFpciBtdXN0IGhhdmUgaXRzIG93biBzZXF1ZW5jZSBpbmRpY2F0b3InKTtcbiAgICAgICAgICAgICAgICBjb25zdCBwYWlyID0gaXRlbS5pdGVtc1swXSB8fCBuZXcgUGFpci5QYWlyKG5ldyBTY2FsYXIuU2NhbGFyKG51bGwpKTtcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS5jb21tZW50QmVmb3JlKVxuICAgICAgICAgICAgICAgICAgICBwYWlyLmtleS5jb21tZW50QmVmb3JlID0gcGFpci5rZXkuY29tbWVudEJlZm9yZVxuICAgICAgICAgICAgICAgICAgICAgICAgPyBgJHtpdGVtLmNvbW1lbnRCZWZvcmV9XFxuJHtwYWlyLmtleS5jb21tZW50QmVmb3JlfWBcbiAgICAgICAgICAgICAgICAgICAgICAgIDogaXRlbS5jb21tZW50QmVmb3JlO1xuICAgICAgICAgICAgICAgIGlmIChpdGVtLmNvbW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY24gPSBwYWlyLnZhbHVlID8/IHBhaXIua2V5O1xuICAgICAgICAgICAgICAgICAgICBjbi5jb21tZW50ID0gY24uY29tbWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgPyBgJHtpdGVtLmNvbW1lbnR9XFxuJHtjbi5jb21tZW50fWBcbiAgICAgICAgICAgICAgICAgICAgICAgIDogaXRlbS5jb21tZW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpdGVtID0gcGFpcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlcS5pdGVtc1tpXSA9IGlkZW50aXR5LmlzUGFpcihpdGVtKSA/IGl0ZW0gOiBuZXcgUGFpci5QYWlyKGl0ZW0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2VcbiAgICAgICAgb25FcnJvcignRXhwZWN0ZWQgYSBzZXF1ZW5jZSBmb3IgdGhpcyB0YWcnKTtcbiAgICByZXR1cm4gc2VxO1xufVxuZnVuY3Rpb24gY3JlYXRlUGFpcnMoc2NoZW1hLCBpdGVyYWJsZSwgY3R4KSB7XG4gICAgY29uc3QgeyByZXBsYWNlciB9ID0gY3R4O1xuICAgIGNvbnN0IHBhaXJzID0gbmV3IFlBTUxTZXEuWUFNTFNlcShzY2hlbWEpO1xuICAgIHBhaXJzLnRhZyA9ICd0YWc6eWFtbC5vcmcsMjAwMjpwYWlycyc7XG4gICAgbGV0IGkgPSAwO1xuICAgIGlmIChpdGVyYWJsZSAmJiBTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KGl0ZXJhYmxlKSlcbiAgICAgICAgZm9yIChsZXQgaXQgb2YgaXRlcmFibGUpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcmVwbGFjZXIgPT09ICdmdW5jdGlvbicpXG4gICAgICAgICAgICAgICAgaXQgPSByZXBsYWNlci5jYWxsKGl0ZXJhYmxlLCBTdHJpbmcoaSsrKSwgaXQpO1xuICAgICAgICAgICAgbGV0IGtleSwgdmFsdWU7XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShpdCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXQubGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgIGtleSA9IGl0WzBdO1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IGl0WzFdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEV4cGVjdGVkIFtrZXksIHZhbHVlXSB0dXBsZTogJHtpdH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGl0ICYmIGl0IGluc3RhbmNlb2YgT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKGl0KTtcbiAgICAgICAgICAgICAgICBpZiAoa2V5cy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAga2V5ID0ga2V5c1swXTtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBpdFtrZXldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgdHVwbGUgd2l0aCBvbmUga2V5LCBub3QgJHtrZXlzLmxlbmd0aH0ga2V5c2ApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGtleSA9IGl0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGFpcnMuaXRlbXMucHVzaChQYWlyLmNyZWF0ZVBhaXIoa2V5LCB2YWx1ZSwgY3R4KSk7XG4gICAgICAgIH1cbiAgICByZXR1cm4gcGFpcnM7XG59XG5jb25zdCBwYWlycyA9IHtcbiAgICBjb2xsZWN0aW9uOiAnc2VxJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpwYWlycycsXG4gICAgcmVzb2x2ZTogcmVzb2x2ZVBhaXJzLFxuICAgIGNyZWF0ZU5vZGU6IGNyZWF0ZVBhaXJzXG59O1xuXG5leHBvcnRzLmNyZWF0ZVBhaXJzID0gY3JlYXRlUGFpcnM7XG5leHBvcnRzLnBhaXJzID0gcGFpcnM7XG5leHBvcnRzLnJlc29sdmVQYWlycyA9IHJlc29sdmVQYWlycztcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9pZGVudGl0eS5qcycpO1xudmFyIHRvSlMgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy90b0pTLmpzJyk7XG52YXIgWUFNTE1hcCA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL1lBTUxNYXAuanMnKTtcbnZhciBZQU1MU2VxID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvWUFNTFNlcS5qcycpO1xudmFyIHBhaXJzID0gcmVxdWlyZSgnLi9wYWlycy5qcycpO1xuXG5jbGFzcyBZQU1MT01hcCBleHRlbmRzIFlBTUxTZXEuWUFNTFNlcSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuYWRkID0gWUFNTE1hcC5ZQU1MTWFwLnByb3RvdHlwZS5hZGQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5kZWxldGUgPSBZQU1MTWFwLllBTUxNYXAucHJvdG90eXBlLmRlbGV0ZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmdldCA9IFlBTUxNYXAuWUFNTE1hcC5wcm90b3R5cGUuZ2V0LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuaGFzID0gWUFNTE1hcC5ZQU1MTWFwLnByb3RvdHlwZS5oYXMuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5zZXQgPSBZQU1MTWFwLllBTUxNYXAucHJvdG90eXBlLnNldC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnRhZyA9IFlBTUxPTWFwLnRhZztcbiAgICB9XG4gICAgLyoqXG4gICAgICogSWYgYGN0eGAgaXMgZ2l2ZW4sIHRoZSByZXR1cm4gdHlwZSBpcyBhY3R1YWxseSBgTWFwPHVua25vd24sIHVua25vd24+YCxcbiAgICAgKiBidXQgVHlwZVNjcmlwdCB3b24ndCBhbGxvdyB3aWRlbmluZyB0aGUgc2lnbmF0dXJlIG9mIGEgY2hpbGQgbWV0aG9kLlxuICAgICAqL1xuICAgIHRvSlNPTihfLCBjdHgpIHtcbiAgICAgICAgaWYgKCFjdHgpXG4gICAgICAgICAgICByZXR1cm4gc3VwZXIudG9KU09OKF8pO1xuICAgICAgICBjb25zdCBtYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgIGlmIChjdHg/Lm9uQ3JlYXRlKVxuICAgICAgICAgICAgY3R4Lm9uQ3JlYXRlKG1hcCk7XG4gICAgICAgIGZvciAoY29uc3QgcGFpciBvZiB0aGlzLml0ZW1zKSB7XG4gICAgICAgICAgICBsZXQga2V5LCB2YWx1ZTtcbiAgICAgICAgICAgIGlmIChpZGVudGl0eS5pc1BhaXIocGFpcikpIHtcbiAgICAgICAgICAgICAgICBrZXkgPSB0b0pTLnRvSlMocGFpci5rZXksICcnLCBjdHgpO1xuICAgICAgICAgICAgICAgIHZhbHVlID0gdG9KUy50b0pTKHBhaXIudmFsdWUsIGtleSwgY3R4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGtleSA9IHRvSlMudG9KUyhwYWlyLCAnJywgY3R4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChtYXAuaGFzKGtleSkpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdPcmRlcmVkIG1hcHMgbXVzdCBub3QgaW5jbHVkZSBkdXBsaWNhdGUga2V5cycpO1xuICAgICAgICAgICAgbWFwLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWFwO1xuICAgIH1cbiAgICBzdGF0aWMgZnJvbShzY2hlbWEsIGl0ZXJhYmxlLCBjdHgpIHtcbiAgICAgICAgY29uc3QgcGFpcnMkMSA9IHBhaXJzLmNyZWF0ZVBhaXJzKHNjaGVtYSwgaXRlcmFibGUsIGN0eCk7XG4gICAgICAgIGNvbnN0IG9tYXAgPSBuZXcgdGhpcygpO1xuICAgICAgICBvbWFwLml0ZW1zID0gcGFpcnMkMS5pdGVtcztcbiAgICAgICAgcmV0dXJuIG9tYXA7XG4gICAgfVxufVxuWUFNTE9NYXAudGFnID0gJ3RhZzp5YW1sLm9yZywyMDAyOm9tYXAnO1xuY29uc3Qgb21hcCA9IHtcbiAgICBjb2xsZWN0aW9uOiAnc2VxJyxcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gdmFsdWUgaW5zdGFuY2VvZiBNYXAsXG4gICAgbm9kZUNsYXNzOiBZQU1MT01hcCxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpvbWFwJyxcbiAgICByZXNvbHZlKHNlcSwgb25FcnJvcikge1xuICAgICAgICBjb25zdCBwYWlycyQxID0gcGFpcnMucmVzb2x2ZVBhaXJzKHNlcSwgb25FcnJvcik7XG4gICAgICAgIGNvbnN0IHNlZW5LZXlzID0gW107XG4gICAgICAgIGZvciAoY29uc3QgeyBrZXkgfSBvZiBwYWlycyQxLml0ZW1zKSB7XG4gICAgICAgICAgICBpZiAoaWRlbnRpdHkuaXNTY2FsYXIoa2V5KSkge1xuICAgICAgICAgICAgICAgIGlmIChzZWVuS2V5cy5pbmNsdWRlcyhrZXkudmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IoYE9yZGVyZWQgbWFwcyBtdXN0IG5vdCBpbmNsdWRlIGR1cGxpY2F0ZSBrZXlzOiAke2tleS52YWx1ZX1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHNlZW5LZXlzLnB1c2goa2V5LnZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24obmV3IFlBTUxPTWFwKCksIHBhaXJzJDEpO1xuICAgIH0sXG4gICAgY3JlYXRlTm9kZTogKHNjaGVtYSwgaXRlcmFibGUsIGN0eCkgPT4gWUFNTE9NYXAuZnJvbShzY2hlbWEsIGl0ZXJhYmxlLCBjdHgpXG59O1xuXG5leHBvcnRzLllBTUxPTWFwID0gWUFNTE9NYXA7XG5leHBvcnRzLm9tYXAgPSBvbWFwO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBTY2FsYXIgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9TY2FsYXIuanMnKTtcblxuZnVuY3Rpb24gYm9vbFN0cmluZ2lmeSh7IHZhbHVlLCBzb3VyY2UgfSwgY3R4KSB7XG4gICAgY29uc3QgYm9vbE9iaiA9IHZhbHVlID8gdHJ1ZVRhZyA6IGZhbHNlVGFnO1xuICAgIGlmIChzb3VyY2UgJiYgYm9vbE9iai50ZXN0LnRlc3Qoc291cmNlKSlcbiAgICAgICAgcmV0dXJuIHNvdXJjZTtcbiAgICByZXR1cm4gdmFsdWUgPyBjdHgub3B0aW9ucy50cnVlU3RyIDogY3R4Lm9wdGlvbnMuZmFsc2VTdHI7XG59XG5jb25zdCB0cnVlVGFnID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB2YWx1ZSA9PT0gdHJ1ZSxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmJvb2wnLFxuICAgIHRlc3Q6IC9eKD86WXx5fFtZeV1lc3xZRVN8W1R0XXJ1ZXxUUlVFfFtPb11ufE9OKSQvLFxuICAgIHJlc29sdmU6ICgpID0+IG5ldyBTY2FsYXIuU2NhbGFyKHRydWUpLFxuICAgIHN0cmluZ2lmeTogYm9vbFN0cmluZ2lmeVxufTtcbmNvbnN0IGZhbHNlVGFnID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB2YWx1ZSA9PT0gZmFsc2UsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpib29sJyxcbiAgICB0ZXN0OiAvXig/Ok58bnxbTm5db3xOT3xbRmZdYWxzZXxGQUxTRXxbT29dZmZ8T0ZGKSQvLFxuICAgIHJlc29sdmU6ICgpID0+IG5ldyBTY2FsYXIuU2NhbGFyKGZhbHNlKSxcbiAgICBzdHJpbmdpZnk6IGJvb2xTdHJpbmdpZnlcbn07XG5cbmV4cG9ydHMuZmFsc2VUYWcgPSBmYWxzZVRhZztcbmV4cG9ydHMudHJ1ZVRhZyA9IHRydWVUYWc7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIFNjYWxhciA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL1NjYWxhci5qcycpO1xudmFyIHN0cmluZ2lmeU51bWJlciA9IHJlcXVpcmUoJy4uLy4uL3N0cmluZ2lmeS9zdHJpbmdpZnlOdW1iZXIuanMnKTtcblxuY29uc3QgZmxvYXROYU4gPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpmbG9hdCcsXG4gICAgdGVzdDogL14oPzpbLStdP1xcLig/OmluZnxJbmZ8SU5GKXxcXC5uYW58XFwuTmFOfFxcLk5BTikkLyxcbiAgICByZXNvbHZlOiAoc3RyKSA9PiBzdHIuc2xpY2UoLTMpLnRvTG93ZXJDYXNlKCkgPT09ICduYW4nXG4gICAgICAgID8gTmFOXG4gICAgICAgIDogc3RyWzBdID09PSAnLSdcbiAgICAgICAgICAgID8gTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZXG4gICAgICAgICAgICA6IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSxcbiAgICBzdHJpbmdpZnk6IHN0cmluZ2lmeU51bWJlci5zdHJpbmdpZnlOdW1iZXJcbn07XG5jb25zdCBmbG9hdEV4cCA9IHtcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmZsb2F0JyxcbiAgICBmb3JtYXQ6ICdFWFAnLFxuICAgIHRlc3Q6IC9eWy0rXT8oPzpbMC05XVswLTlfXSopPyg/OlxcLlswLTlfXSopP1tlRV1bLStdP1swLTldKyQvLFxuICAgIHJlc29sdmU6IChzdHIpID0+IHBhcnNlRmxvYXQoc3RyLnJlcGxhY2UoL18vZywgJycpKSxcbiAgICBzdHJpbmdpZnkobm9kZSkge1xuICAgICAgICBjb25zdCBudW0gPSBOdW1iZXIobm9kZS52YWx1ZSk7XG4gICAgICAgIHJldHVybiBpc0Zpbml0ZShudW0pID8gbnVtLnRvRXhwb25lbnRpYWwoKSA6IHN0cmluZ2lmeU51bWJlci5zdHJpbmdpZnlOdW1iZXIobm9kZSk7XG4gICAgfVxufTtcbmNvbnN0IGZsb2F0ID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6ZmxvYXQnLFxuICAgIHRlc3Q6IC9eWy0rXT8oPzpbMC05XVswLTlfXSopP1xcLlswLTlfXSokLyxcbiAgICByZXNvbHZlKHN0cikge1xuICAgICAgICBjb25zdCBub2RlID0gbmV3IFNjYWxhci5TY2FsYXIocGFyc2VGbG9hdChzdHIucmVwbGFjZSgvXy9nLCAnJykpKTtcbiAgICAgICAgY29uc3QgZG90ID0gc3RyLmluZGV4T2YoJy4nKTtcbiAgICAgICAgaWYgKGRvdCAhPT0gLTEpIHtcbiAgICAgICAgICAgIGNvbnN0IGYgPSBzdHIuc3Vic3RyaW5nKGRvdCArIDEpLnJlcGxhY2UoL18vZywgJycpO1xuICAgICAgICAgICAgaWYgKGZbZi5sZW5ndGggLSAxXSA9PT0gJzAnKVxuICAgICAgICAgICAgICAgIG5vZGUubWluRnJhY3Rpb25EaWdpdHMgPSBmLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICB9LFxuICAgIHN0cmluZ2lmeTogc3RyaW5naWZ5TnVtYmVyLnN0cmluZ2lmeU51bWJlclxufTtcblxuZXhwb3J0cy5mbG9hdCA9IGZsb2F0O1xuZXhwb3J0cy5mbG9hdEV4cCA9IGZsb2F0RXhwO1xuZXhwb3J0cy5mbG9hdE5hTiA9IGZsb2F0TmFOO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBzdHJpbmdpZnlOdW1iZXIgPSByZXF1aXJlKCcuLi8uLi9zdHJpbmdpZnkvc3RyaW5naWZ5TnVtYmVyLmpzJyk7XG5cbmNvbnN0IGludElkZW50aWZ5ID0gKHZhbHVlKSA9PiB0eXBlb2YgdmFsdWUgPT09ICdiaWdpbnQnIHx8IE51bWJlci5pc0ludGVnZXIodmFsdWUpO1xuZnVuY3Rpb24gaW50UmVzb2x2ZShzdHIsIG9mZnNldCwgcmFkaXgsIHsgaW50QXNCaWdJbnQgfSkge1xuICAgIGNvbnN0IHNpZ24gPSBzdHJbMF07XG4gICAgaWYgKHNpZ24gPT09ICctJyB8fCBzaWduID09PSAnKycpXG4gICAgICAgIG9mZnNldCArPSAxO1xuICAgIHN0ciA9IHN0ci5zdWJzdHJpbmcob2Zmc2V0KS5yZXBsYWNlKC9fL2csICcnKTtcbiAgICBpZiAoaW50QXNCaWdJbnQpIHtcbiAgICAgICAgc3dpdGNoIChyYWRpeCkge1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIHN0ciA9IGAwYiR7c3RyfWA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDg6XG4gICAgICAgICAgICAgICAgc3RyID0gYDBvJHtzdHJ9YDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMTY6XG4gICAgICAgICAgICAgICAgc3RyID0gYDB4JHtzdHJ9YDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBuID0gQmlnSW50KHN0cik7XG4gICAgICAgIHJldHVybiBzaWduID09PSAnLScgPyBCaWdJbnQoLTEpICogbiA6IG47XG4gICAgfVxuICAgIGNvbnN0IG4gPSBwYXJzZUludChzdHIsIHJhZGl4KTtcbiAgICByZXR1cm4gc2lnbiA9PT0gJy0nID8gLTEgKiBuIDogbjtcbn1cbmZ1bmN0aW9uIGludFN0cmluZ2lmeShub2RlLCByYWRpeCwgcHJlZml4KSB7XG4gICAgY29uc3QgeyB2YWx1ZSB9ID0gbm9kZTtcbiAgICBpZiAoaW50SWRlbnRpZnkodmFsdWUpKSB7XG4gICAgICAgIGNvbnN0IHN0ciA9IHZhbHVlLnRvU3RyaW5nKHJhZGl4KTtcbiAgICAgICAgcmV0dXJuIHZhbHVlIDwgMCA/ICctJyArIHByZWZpeCArIHN0ci5zdWJzdHIoMSkgOiBwcmVmaXggKyBzdHI7XG4gICAgfVxuICAgIHJldHVybiBzdHJpbmdpZnlOdW1iZXIuc3RyaW5naWZ5TnVtYmVyKG5vZGUpO1xufVxuY29uc3QgaW50QmluID0ge1xuICAgIGlkZW50aWZ5OiBpbnRJZGVudGlmeSxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmludCcsXG4gICAgZm9ybWF0OiAnQklOJyxcbiAgICB0ZXN0OiAvXlstK10/MGJbMC0xX10rJC8sXG4gICAgcmVzb2x2ZTogKHN0ciwgX29uRXJyb3IsIG9wdCkgPT4gaW50UmVzb2x2ZShzdHIsIDIsIDIsIG9wdCksXG4gICAgc3RyaW5naWZ5OiBub2RlID0+IGludFN0cmluZ2lmeShub2RlLCAyLCAnMGInKVxufTtcbmNvbnN0IGludE9jdCA9IHtcbiAgICBpZGVudGlmeTogaW50SWRlbnRpZnksXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjppbnQnLFxuICAgIGZvcm1hdDogJ09DVCcsXG4gICAgdGVzdDogL15bLStdPzBbMC03X10rJC8sXG4gICAgcmVzb2x2ZTogKHN0ciwgX29uRXJyb3IsIG9wdCkgPT4gaW50UmVzb2x2ZShzdHIsIDEsIDgsIG9wdCksXG4gICAgc3RyaW5naWZ5OiBub2RlID0+IGludFN0cmluZ2lmeShub2RlLCA4LCAnMCcpXG59O1xuY29uc3QgaW50ID0ge1xuICAgIGlkZW50aWZ5OiBpbnRJZGVudGlmeSxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmludCcsXG4gICAgdGVzdDogL15bLStdP1swLTldWzAtOV9dKiQvLFxuICAgIHJlc29sdmU6IChzdHIsIF9vbkVycm9yLCBvcHQpID0+IGludFJlc29sdmUoc3RyLCAwLCAxMCwgb3B0KSxcbiAgICBzdHJpbmdpZnk6IHN0cmluZ2lmeU51bWJlci5zdHJpbmdpZnlOdW1iZXJcbn07XG5jb25zdCBpbnRIZXggPSB7XG4gICAgaWRlbnRpZnk6IGludElkZW50aWZ5LFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6aW50JyxcbiAgICBmb3JtYXQ6ICdIRVgnLFxuICAgIHRlc3Q6IC9eWy0rXT8weFswLTlhLWZBLUZfXSskLyxcbiAgICByZXNvbHZlOiAoc3RyLCBfb25FcnJvciwgb3B0KSA9PiBpbnRSZXNvbHZlKHN0ciwgMiwgMTYsIG9wdCksXG4gICAgc3RyaW5naWZ5OiBub2RlID0+IGludFN0cmluZ2lmeShub2RlLCAxNiwgJzB4Jylcbn07XG5cbmV4cG9ydHMuaW50ID0gaW50O1xuZXhwb3J0cy5pbnRCaW4gPSBpbnRCaW47XG5leHBvcnRzLmludEhleCA9IGludEhleDtcbmV4cG9ydHMuaW50T2N0ID0gaW50T2N0O1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBpZGVudGl0eSA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL2lkZW50aXR5LmpzJyk7XG52YXIgUGFpciA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL1BhaXIuanMnKTtcbnZhciBZQU1MTWFwID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvWUFNTE1hcC5qcycpO1xuXG5jbGFzcyBZQU1MU2V0IGV4dGVuZHMgWUFNTE1hcC5ZQU1MTWFwIHtcbiAgICBjb25zdHJ1Y3RvcihzY2hlbWEpIHtcbiAgICAgICAgc3VwZXIoc2NoZW1hKTtcbiAgICAgICAgdGhpcy50YWcgPSBZQU1MU2V0LnRhZztcbiAgICB9XG4gICAgYWRkKGtleSkge1xuICAgICAgICBsZXQgcGFpcjtcbiAgICAgICAgaWYgKGlkZW50aXR5LmlzUGFpcihrZXkpKVxuICAgICAgICAgICAgcGFpciA9IGtleTtcbiAgICAgICAgZWxzZSBpZiAoa2V5ICYmXG4gICAgICAgICAgICB0eXBlb2Yga2V5ID09PSAnb2JqZWN0JyAmJlxuICAgICAgICAgICAgJ2tleScgaW4ga2V5ICYmXG4gICAgICAgICAgICAndmFsdWUnIGluIGtleSAmJlxuICAgICAgICAgICAga2V5LnZhbHVlID09PSBudWxsKVxuICAgICAgICAgICAgcGFpciA9IG5ldyBQYWlyLlBhaXIoa2V5LmtleSwgbnVsbCk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHBhaXIgPSBuZXcgUGFpci5QYWlyKGtleSwgbnVsbCk7XG4gICAgICAgIGNvbnN0IHByZXYgPSBZQU1MTWFwLmZpbmRQYWlyKHRoaXMuaXRlbXMsIHBhaXIua2V5KTtcbiAgICAgICAgaWYgKCFwcmV2KVxuICAgICAgICAgICAgdGhpcy5pdGVtcy5wdXNoKHBhaXIpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBJZiBga2VlcFBhaXJgIGlzIGB0cnVlYCwgcmV0dXJucyB0aGUgUGFpciBtYXRjaGluZyBga2V5YC5cbiAgICAgKiBPdGhlcndpc2UsIHJldHVybnMgdGhlIHZhbHVlIG9mIHRoYXQgUGFpcidzIGtleS5cbiAgICAgKi9cbiAgICBnZXQoa2V5LCBrZWVwUGFpcikge1xuICAgICAgICBjb25zdCBwYWlyID0gWUFNTE1hcC5maW5kUGFpcih0aGlzLml0ZW1zLCBrZXkpO1xuICAgICAgICByZXR1cm4gIWtlZXBQYWlyICYmIGlkZW50aXR5LmlzUGFpcihwYWlyKVxuICAgICAgICAgICAgPyBpZGVudGl0eS5pc1NjYWxhcihwYWlyLmtleSlcbiAgICAgICAgICAgICAgICA/IHBhaXIua2V5LnZhbHVlXG4gICAgICAgICAgICAgICAgOiBwYWlyLmtleVxuICAgICAgICAgICAgOiBwYWlyO1xuICAgIH1cbiAgICBzZXQoa2V5LCB2YWx1ZSkge1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnYm9vbGVhbicpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIGJvb2xlYW4gdmFsdWUgZm9yIHNldChrZXksIHZhbHVlKSBpbiBhIFlBTUwgc2V0LCBub3QgJHt0eXBlb2YgdmFsdWV9YCk7XG4gICAgICAgIGNvbnN0IHByZXYgPSBZQU1MTWFwLmZpbmRQYWlyKHRoaXMuaXRlbXMsIGtleSk7XG4gICAgICAgIGlmIChwcmV2ICYmICF2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5pdGVtcy5zcGxpY2UodGhpcy5pdGVtcy5pbmRleE9mKHByZXYpLCAxKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICghcHJldiAmJiB2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5pdGVtcy5wdXNoKG5ldyBQYWlyLlBhaXIoa2V5KSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdG9KU09OKF8sIGN0eCkge1xuICAgICAgICByZXR1cm4gc3VwZXIudG9KU09OKF8sIGN0eCwgU2V0KTtcbiAgICB9XG4gICAgdG9TdHJpbmcoY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKSB7XG4gICAgICAgIGlmICghY3R4KVxuICAgICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHRoaXMpO1xuICAgICAgICBpZiAodGhpcy5oYXNBbGxOdWxsVmFsdWVzKHRydWUpKVxuICAgICAgICAgICAgcmV0dXJuIHN1cGVyLnRvU3RyaW5nKE9iamVjdC5hc3NpZ24oe30sIGN0eCwgeyBhbGxOdWxsVmFsdWVzOiB0cnVlIH0pLCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTZXQgaXRlbXMgbXVzdCBhbGwgaGF2ZSBudWxsIHZhbHVlcycpO1xuICAgIH1cbiAgICBzdGF0aWMgZnJvbShzY2hlbWEsIGl0ZXJhYmxlLCBjdHgpIHtcbiAgICAgICAgY29uc3QgeyByZXBsYWNlciB9ID0gY3R4O1xuICAgICAgICBjb25zdCBzZXQgPSBuZXcgdGhpcyhzY2hlbWEpO1xuICAgICAgICBpZiAoaXRlcmFibGUgJiYgU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdChpdGVyYWJsZSkpXG4gICAgICAgICAgICBmb3IgKGxldCB2YWx1ZSBvZiBpdGVyYWJsZSkge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcmVwbGFjZXIgPT09ICdmdW5jdGlvbicpXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gcmVwbGFjZXIuY2FsbChpdGVyYWJsZSwgdmFsdWUsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICBzZXQuaXRlbXMucHVzaChQYWlyLmNyZWF0ZVBhaXIodmFsdWUsIG51bGwsIGN0eCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2V0O1xuICAgIH1cbn1cbllBTUxTZXQudGFnID0gJ3RhZzp5YW1sLm9yZywyMDAyOnNldCc7XG5jb25zdCBzZXQgPSB7XG4gICAgY29sbGVjdGlvbjogJ21hcCcsXG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHZhbHVlIGluc3RhbmNlb2YgU2V0LFxuICAgIG5vZGVDbGFzczogWUFNTFNldCxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpzZXQnLFxuICAgIGNyZWF0ZU5vZGU6IChzY2hlbWEsIGl0ZXJhYmxlLCBjdHgpID0+IFlBTUxTZXQuZnJvbShzY2hlbWEsIGl0ZXJhYmxlLCBjdHgpLFxuICAgIHJlc29sdmUobWFwLCBvbkVycm9yKSB7XG4gICAgICAgIGlmIChpZGVudGl0eS5pc01hcChtYXApKSB7XG4gICAgICAgICAgICBpZiAobWFwLmhhc0FsbE51bGxWYWx1ZXModHJ1ZSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24obmV3IFlBTUxTZXQoKSwgbWFwKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBvbkVycm9yKCdTZXQgaXRlbXMgbXVzdCBhbGwgaGF2ZSBudWxsIHZhbHVlcycpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG9uRXJyb3IoJ0V4cGVjdGVkIGEgbWFwcGluZyBmb3IgdGhpcyB0YWcnKTtcbiAgICAgICAgcmV0dXJuIG1hcDtcbiAgICB9XG59O1xuXG5leHBvcnRzLllBTUxTZXQgPSBZQU1MU2V0O1xuZXhwb3J0cy5zZXQgPSBzZXQ7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIHN0cmluZ2lmeU51bWJlciA9IHJlcXVpcmUoJy4uLy4uL3N0cmluZ2lmeS9zdHJpbmdpZnlOdW1iZXIuanMnKTtcblxuLyoqIEludGVybmFsIHR5cGVzIGhhbmRsZSBiaWdpbnQgYXMgbnVtYmVyLCBiZWNhdXNlIFRTIGNhbid0IGZpZ3VyZSBpdCBvdXQuICovXG5mdW5jdGlvbiBwYXJzZVNleGFnZXNpbWFsKHN0ciwgYXNCaWdJbnQpIHtcbiAgICBjb25zdCBzaWduID0gc3RyWzBdO1xuICAgIGNvbnN0IHBhcnRzID0gc2lnbiA9PT0gJy0nIHx8IHNpZ24gPT09ICcrJyA/IHN0ci5zdWJzdHJpbmcoMSkgOiBzdHI7XG4gICAgY29uc3QgbnVtID0gKG4pID0+IGFzQmlnSW50ID8gQmlnSW50KG4pIDogTnVtYmVyKG4pO1xuICAgIGNvbnN0IHJlcyA9IHBhcnRzXG4gICAgICAgIC5yZXBsYWNlKC9fL2csICcnKVxuICAgICAgICAuc3BsaXQoJzonKVxuICAgICAgICAucmVkdWNlKChyZXMsIHApID0+IHJlcyAqIG51bSg2MCkgKyBudW0ocCksIG51bSgwKSk7XG4gICAgcmV0dXJuIChzaWduID09PSAnLScgPyBudW0oLTEpICogcmVzIDogcmVzKTtcbn1cbi8qKlxuICogaGhoaDptbTpzcy5zc3NcbiAqXG4gKiBJbnRlcm5hbCB0eXBlcyBoYW5kbGUgYmlnaW50IGFzIG51bWJlciwgYmVjYXVzZSBUUyBjYW4ndCBmaWd1cmUgaXQgb3V0LlxuICovXG5mdW5jdGlvbiBzdHJpbmdpZnlTZXhhZ2VzaW1hbChub2RlKSB7XG4gICAgbGV0IHsgdmFsdWUgfSA9IG5vZGU7XG4gICAgbGV0IG51bSA9IChuKSA9PiBuO1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdiaWdpbnQnKVxuICAgICAgICBudW0gPSBuID0+IEJpZ0ludChuKTtcbiAgICBlbHNlIGlmIChpc05hTih2YWx1ZSkgfHwgIWlzRmluaXRlKHZhbHVlKSlcbiAgICAgICAgcmV0dXJuIHN0cmluZ2lmeU51bWJlci5zdHJpbmdpZnlOdW1iZXIobm9kZSk7XG4gICAgbGV0IHNpZ24gPSAnJztcbiAgICBpZiAodmFsdWUgPCAwKSB7XG4gICAgICAgIHNpZ24gPSAnLSc7XG4gICAgICAgIHZhbHVlICo9IG51bSgtMSk7XG4gICAgfVxuICAgIGNvbnN0IF82MCA9IG51bSg2MCk7XG4gICAgY29uc3QgcGFydHMgPSBbdmFsdWUgJSBfNjBdOyAvLyBzZWNvbmRzLCBpbmNsdWRpbmcgbXNcbiAgICBpZiAodmFsdWUgPCA2MCkge1xuICAgICAgICBwYXJ0cy51bnNoaWZ0KDApOyAvLyBhdCBsZWFzdCBvbmUgOiBpcyByZXF1aXJlZFxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdmFsdWUgPSAodmFsdWUgLSBwYXJ0c1swXSkgLyBfNjA7XG4gICAgICAgIHBhcnRzLnVuc2hpZnQodmFsdWUgJSBfNjApOyAvLyBtaW51dGVzXG4gICAgICAgIGlmICh2YWx1ZSA+PSA2MCkge1xuICAgICAgICAgICAgdmFsdWUgPSAodmFsdWUgLSBwYXJ0c1swXSkgLyBfNjA7XG4gICAgICAgICAgICBwYXJ0cy51bnNoaWZ0KHZhbHVlKTsgLy8gaG91cnNcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gKHNpZ24gK1xuICAgICAgICBwYXJ0c1xuICAgICAgICAgICAgLm1hcChuID0+IFN0cmluZyhuKS5wYWRTdGFydCgyLCAnMCcpKVxuICAgICAgICAgICAgLmpvaW4oJzonKVxuICAgICAgICAgICAgLnJlcGxhY2UoLzAwMDAwMFxcZCokLywgJycpIC8vICUgNjAgbWF5IGludHJvZHVjZSBlcnJvclxuICAgICk7XG59XG5jb25zdCBpbnRUaW1lID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdiaWdpbnQnIHx8IE51bWJlci5pc0ludGVnZXIodmFsdWUpLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6aW50JyxcbiAgICBmb3JtYXQ6ICdUSU1FJyxcbiAgICB0ZXN0OiAvXlstK10/WzAtOV1bMC05X10qKD86OlswLTVdP1swLTldKSskLyxcbiAgICByZXNvbHZlOiAoc3RyLCBfb25FcnJvciwgeyBpbnRBc0JpZ0ludCB9KSA9PiBwYXJzZVNleGFnZXNpbWFsKHN0ciwgaW50QXNCaWdJbnQpLFxuICAgIHN0cmluZ2lmeTogc3RyaW5naWZ5U2V4YWdlc2ltYWxcbn07XG5jb25zdCBmbG9hdFRpbWUgPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpmbG9hdCcsXG4gICAgZm9ybWF0OiAnVElNRScsXG4gICAgdGVzdDogL15bLStdP1swLTldWzAtOV9dKig/OjpbMC01XT9bMC05XSkrXFwuWzAtOV9dKiQvLFxuICAgIHJlc29sdmU6IHN0ciA9PiBwYXJzZVNleGFnZXNpbWFsKHN0ciwgZmFsc2UpLFxuICAgIHN0cmluZ2lmeTogc3RyaW5naWZ5U2V4YWdlc2ltYWxcbn07XG5jb25zdCB0aW1lc3RhbXAgPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHZhbHVlIGluc3RhbmNlb2YgRGF0ZSxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOnRpbWVzdGFtcCcsXG4gICAgLy8gSWYgdGhlIHRpbWUgem9uZSBpcyBvbWl0dGVkLCB0aGUgdGltZXN0YW1wIGlzIGFzc3VtZWQgdG8gYmUgc3BlY2lmaWVkIGluIFVUQy4gVGhlIHRpbWUgcGFydFxuICAgIC8vIG1heSBiZSBvbWl0dGVkIGFsdG9nZXRoZXIsIHJlc3VsdGluZyBpbiBhIGRhdGUgZm9ybWF0LiBJbiBzdWNoIGEgY2FzZSwgdGhlIHRpbWUgcGFydCBpc1xuICAgIC8vIGFzc3VtZWQgdG8gYmUgMDA6MDA6MDBaIChzdGFydCBvZiBkYXksIFVUQykuXG4gICAgdGVzdDogUmVnRXhwKCdeKFswLTldezR9KS0oWzAtOV17MSwyfSktKFswLTldezEsMn0pJyArIC8vIFlZWVktTW0tRGRcbiAgICAgICAgJyg/OicgKyAvLyB0aW1lIGlzIG9wdGlvbmFsXG4gICAgICAgICcoPzp0fFR8WyBcXFxcdF0rKScgKyAvLyB0IHwgVCB8IHdoaXRlc3BhY2VcbiAgICAgICAgJyhbMC05XXsxLDJ9KTooWzAtOV17MSwyfSk6KFswLTldezEsMn0oXFxcXC5bMC05XSspPyknICsgLy8gSGg6TW06U3MoLnNzKT9cbiAgICAgICAgJyg/OlsgXFxcXHRdKihafFstK11bMDEyXT9bMC05XSg/OjpbMC05XXsyfSk/KSk/JyArIC8vIFogfCArNSB8IC0wMzozMFxuICAgICAgICAnKT8kJyksXG4gICAgcmVzb2x2ZShzdHIpIHtcbiAgICAgICAgY29uc3QgbWF0Y2ggPSBzdHIubWF0Y2godGltZXN0YW1wLnRlc3QpO1xuICAgICAgICBpZiAoIW1hdGNoKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCchIXRpbWVzdGFtcCBleHBlY3RzIGEgZGF0ZSwgc3RhcnRpbmcgd2l0aCB5eXl5LW1tLWRkJyk7XG4gICAgICAgIGNvbnN0IFssIHllYXIsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kXSA9IG1hdGNoLm1hcChOdW1iZXIpO1xuICAgICAgICBjb25zdCBtaWxsaXNlYyA9IG1hdGNoWzddID8gTnVtYmVyKChtYXRjaFs3XSArICcwMCcpLnN1YnN0cigxLCAzKSkgOiAwO1xuICAgICAgICBsZXQgZGF0ZSA9IERhdGUuVVRDKHllYXIsIG1vbnRoIC0gMSwgZGF5LCBob3VyIHx8IDAsIG1pbnV0ZSB8fCAwLCBzZWNvbmQgfHwgMCwgbWlsbGlzZWMpO1xuICAgICAgICBjb25zdCB0eiA9IG1hdGNoWzhdO1xuICAgICAgICBpZiAodHogJiYgdHogIT09ICdaJykge1xuICAgICAgICAgICAgbGV0IGQgPSBwYXJzZVNleGFnZXNpbWFsKHR6LCBmYWxzZSk7XG4gICAgICAgICAgICBpZiAoTWF0aC5hYnMoZCkgPCAzMClcbiAgICAgICAgICAgICAgICBkICo9IDYwO1xuICAgICAgICAgICAgZGF0ZSAtPSA2MDAwMCAqIGQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKGRhdGUpO1xuICAgIH0sXG4gICAgc3RyaW5naWZ5OiAoeyB2YWx1ZSB9KSA9PiB2YWx1ZT8udG9JU09TdHJpbmcoKS5yZXBsYWNlKC8oVDAwOjAwOjAwKT9cXC4wMDBaJC8sICcnKSA/PyAnJ1xufTtcblxuZXhwb3J0cy5mbG9hdFRpbWUgPSBmbG9hdFRpbWU7XG5leHBvcnRzLmludFRpbWUgPSBpbnRUaW1lO1xuZXhwb3J0cy50aW1lc3RhbXAgPSB0aW1lc3RhbXA7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIG1hcCA9IHJlcXVpcmUoJy4uL2NvbW1vbi9tYXAuanMnKTtcbnZhciBfbnVsbCA9IHJlcXVpcmUoJy4uL2NvbW1vbi9udWxsLmpzJyk7XG52YXIgc2VxID0gcmVxdWlyZSgnLi4vY29tbW9uL3NlcS5qcycpO1xudmFyIHN0cmluZyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9zdHJpbmcuanMnKTtcbnZhciBiaW5hcnkgPSByZXF1aXJlKCcuL2JpbmFyeS5qcycpO1xudmFyIGJvb2wgPSByZXF1aXJlKCcuL2Jvb2wuanMnKTtcbnZhciBmbG9hdCA9IHJlcXVpcmUoJy4vZmxvYXQuanMnKTtcbnZhciBpbnQgPSByZXF1aXJlKCcuL2ludC5qcycpO1xudmFyIG1lcmdlID0gcmVxdWlyZSgnLi9tZXJnZS5qcycpO1xudmFyIG9tYXAgPSByZXF1aXJlKCcuL29tYXAuanMnKTtcbnZhciBwYWlycyA9IHJlcXVpcmUoJy4vcGFpcnMuanMnKTtcbnZhciBzZXQgPSByZXF1aXJlKCcuL3NldC5qcycpO1xudmFyIHRpbWVzdGFtcCA9IHJlcXVpcmUoJy4vdGltZXN0YW1wLmpzJyk7XG5cbmNvbnN0IHNjaGVtYSA9IFtcbiAgICBtYXAubWFwLFxuICAgIHNlcS5zZXEsXG4gICAgc3RyaW5nLnN0cmluZyxcbiAgICBfbnVsbC5udWxsVGFnLFxuICAgIGJvb2wudHJ1ZVRhZyxcbiAgICBib29sLmZhbHNlVGFnLFxuICAgIGludC5pbnRCaW4sXG4gICAgaW50LmludE9jdCxcbiAgICBpbnQuaW50LFxuICAgIGludC5pbnRIZXgsXG4gICAgZmxvYXQuZmxvYXROYU4sXG4gICAgZmxvYXQuZmxvYXRFeHAsXG4gICAgZmxvYXQuZmxvYXQsXG4gICAgYmluYXJ5LmJpbmFyeSxcbiAgICBtZXJnZS5tZXJnZSxcbiAgICBvbWFwLm9tYXAsXG4gICAgcGFpcnMucGFpcnMsXG4gICAgc2V0LnNldCxcbiAgICB0aW1lc3RhbXAuaW50VGltZSxcbiAgICB0aW1lc3RhbXAuZmxvYXRUaW1lLFxuICAgIHRpbWVzdGFtcC50aW1lc3RhbXBcbl07XG5cbmV4cG9ydHMuc2NoZW1hID0gc2NoZW1hO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBtYXAgPSByZXF1aXJlKCcuL2NvbW1vbi9tYXAuanMnKTtcbnZhciBfbnVsbCA9IHJlcXVpcmUoJy4vY29tbW9uL251bGwuanMnKTtcbnZhciBzZXEgPSByZXF1aXJlKCcuL2NvbW1vbi9zZXEuanMnKTtcbnZhciBzdHJpbmcgPSByZXF1aXJlKCcuL2NvbW1vbi9zdHJpbmcuanMnKTtcbnZhciBib29sID0gcmVxdWlyZSgnLi9jb3JlL2Jvb2wuanMnKTtcbnZhciBmbG9hdCA9IHJlcXVpcmUoJy4vY29yZS9mbG9hdC5qcycpO1xudmFyIGludCA9IHJlcXVpcmUoJy4vY29yZS9pbnQuanMnKTtcbnZhciBzY2hlbWEgPSByZXF1aXJlKCcuL2NvcmUvc2NoZW1hLmpzJyk7XG52YXIgc2NoZW1hJDEgPSByZXF1aXJlKCcuL2pzb24vc2NoZW1hLmpzJyk7XG52YXIgYmluYXJ5ID0gcmVxdWlyZSgnLi95YW1sLTEuMS9iaW5hcnkuanMnKTtcbnZhciBtZXJnZSA9IHJlcXVpcmUoJy4veWFtbC0xLjEvbWVyZ2UuanMnKTtcbnZhciBvbWFwID0gcmVxdWlyZSgnLi95YW1sLTEuMS9vbWFwLmpzJyk7XG52YXIgcGFpcnMgPSByZXF1aXJlKCcuL3lhbWwtMS4xL3BhaXJzLmpzJyk7XG52YXIgc2NoZW1hJDIgPSByZXF1aXJlKCcuL3lhbWwtMS4xL3NjaGVtYS5qcycpO1xudmFyIHNldCA9IHJlcXVpcmUoJy4veWFtbC0xLjEvc2V0LmpzJyk7XG52YXIgdGltZXN0YW1wID0gcmVxdWlyZSgnLi95YW1sLTEuMS90aW1lc3RhbXAuanMnKTtcblxuY29uc3Qgc2NoZW1hcyA9IG5ldyBNYXAoW1xuICAgIFsnY29yZScsIHNjaGVtYS5zY2hlbWFdLFxuICAgIFsnZmFpbHNhZmUnLCBbbWFwLm1hcCwgc2VxLnNlcSwgc3RyaW5nLnN0cmluZ11dLFxuICAgIFsnanNvbicsIHNjaGVtYSQxLnNjaGVtYV0sXG4gICAgWyd5YW1sMTEnLCBzY2hlbWEkMi5zY2hlbWFdLFxuICAgIFsneWFtbC0xLjEnLCBzY2hlbWEkMi5zY2hlbWFdXG5dKTtcbmNvbnN0IHRhZ3NCeU5hbWUgPSB7XG4gICAgYmluYXJ5OiBiaW5hcnkuYmluYXJ5LFxuICAgIGJvb2w6IGJvb2wuYm9vbFRhZyxcbiAgICBmbG9hdDogZmxvYXQuZmxvYXQsXG4gICAgZmxvYXRFeHA6IGZsb2F0LmZsb2F0RXhwLFxuICAgIGZsb2F0TmFOOiBmbG9hdC5mbG9hdE5hTixcbiAgICBmbG9hdFRpbWU6IHRpbWVzdGFtcC5mbG9hdFRpbWUsXG4gICAgaW50OiBpbnQuaW50LFxuICAgIGludEhleDogaW50LmludEhleCxcbiAgICBpbnRPY3Q6IGludC5pbnRPY3QsXG4gICAgaW50VGltZTogdGltZXN0YW1wLmludFRpbWUsXG4gICAgbWFwOiBtYXAubWFwLFxuICAgIG1lcmdlOiBtZXJnZS5tZXJnZSxcbiAgICBudWxsOiBfbnVsbC5udWxsVGFnLFxuICAgIG9tYXA6IG9tYXAub21hcCxcbiAgICBwYWlyczogcGFpcnMucGFpcnMsXG4gICAgc2VxOiBzZXEuc2VxLFxuICAgIHNldDogc2V0LnNldCxcbiAgICB0aW1lc3RhbXA6IHRpbWVzdGFtcC50aW1lc3RhbXBcbn07XG5jb25zdCBjb3JlS25vd25UYWdzID0ge1xuICAgICd0YWc6eWFtbC5vcmcsMjAwMjpiaW5hcnknOiBiaW5hcnkuYmluYXJ5LFxuICAgICd0YWc6eWFtbC5vcmcsMjAwMjptZXJnZSc6IG1lcmdlLm1lcmdlLFxuICAgICd0YWc6eWFtbC5vcmcsMjAwMjpvbWFwJzogb21hcC5vbWFwLFxuICAgICd0YWc6eWFtbC5vcmcsMjAwMjpwYWlycyc6IHBhaXJzLnBhaXJzLFxuICAgICd0YWc6eWFtbC5vcmcsMjAwMjpzZXQnOiBzZXQuc2V0LFxuICAgICd0YWc6eWFtbC5vcmcsMjAwMjp0aW1lc3RhbXAnOiB0aW1lc3RhbXAudGltZXN0YW1wXG59O1xuZnVuY3Rpb24gZ2V0VGFncyhjdXN0b21UYWdzLCBzY2hlbWFOYW1lLCBhZGRNZXJnZVRhZykge1xuICAgIGNvbnN0IHNjaGVtYVRhZ3MgPSBzY2hlbWFzLmdldChzY2hlbWFOYW1lKTtcbiAgICBpZiAoc2NoZW1hVGFncyAmJiAhY3VzdG9tVGFncykge1xuICAgICAgICByZXR1cm4gYWRkTWVyZ2VUYWcgJiYgIXNjaGVtYVRhZ3MuaW5jbHVkZXMobWVyZ2UubWVyZ2UpXG4gICAgICAgICAgICA/IHNjaGVtYVRhZ3MuY29uY2F0KG1lcmdlLm1lcmdlKVxuICAgICAgICAgICAgOiBzY2hlbWFUYWdzLnNsaWNlKCk7XG4gICAgfVxuICAgIGxldCB0YWdzID0gc2NoZW1hVGFncztcbiAgICBpZiAoIXRhZ3MpIHtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoY3VzdG9tVGFncykpXG4gICAgICAgICAgICB0YWdzID0gW107XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3Qga2V5cyA9IEFycmF5LmZyb20oc2NoZW1hcy5rZXlzKCkpXG4gICAgICAgICAgICAgICAgLmZpbHRlcihrZXkgPT4ga2V5ICE9PSAneWFtbDExJylcbiAgICAgICAgICAgICAgICAubWFwKGtleSA9PiBKU09OLnN0cmluZ2lmeShrZXkpKVxuICAgICAgICAgICAgICAgIC5qb2luKCcsICcpO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHNjaGVtYSBcIiR7c2NoZW1hTmFtZX1cIjsgdXNlIG9uZSBvZiAke2tleXN9IG9yIGRlZmluZSBjdXN0b21UYWdzIGFycmF5YCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoY3VzdG9tVGFncykpIHtcbiAgICAgICAgZm9yIChjb25zdCB0YWcgb2YgY3VzdG9tVGFncylcbiAgICAgICAgICAgIHRhZ3MgPSB0YWdzLmNvbmNhdCh0YWcpO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgY3VzdG9tVGFncyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0YWdzID0gY3VzdG9tVGFncyh0YWdzLnNsaWNlKCkpO1xuICAgIH1cbiAgICBpZiAoYWRkTWVyZ2VUYWcpXG4gICAgICAgIHRhZ3MgPSB0YWdzLmNvbmNhdChtZXJnZS5tZXJnZSk7XG4gICAgcmV0dXJuIHRhZ3MucmVkdWNlKCh0YWdzLCB0YWcpID0+IHtcbiAgICAgICAgY29uc3QgdGFnT2JqID0gdHlwZW9mIHRhZyA9PT0gJ3N0cmluZycgPyB0YWdzQnlOYW1lW3RhZ10gOiB0YWc7XG4gICAgICAgIGlmICghdGFnT2JqKSB7XG4gICAgICAgICAgICBjb25zdCB0YWdOYW1lID0gSlNPTi5zdHJpbmdpZnkodGFnKTtcbiAgICAgICAgICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyh0YWdzQnlOYW1lKVxuICAgICAgICAgICAgICAgIC5tYXAoa2V5ID0+IEpTT04uc3RyaW5naWZ5KGtleSkpXG4gICAgICAgICAgICAgICAgLmpvaW4oJywgJyk7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gY3VzdG9tIHRhZyAke3RhZ05hbWV9OyB1c2Ugb25lIG9mICR7a2V5c31gKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRhZ3MuaW5jbHVkZXModGFnT2JqKSlcbiAgICAgICAgICAgIHRhZ3MucHVzaCh0YWdPYmopO1xuICAgICAgICByZXR1cm4gdGFncztcbiAgICB9LCBbXSk7XG59XG5cbmV4cG9ydHMuY29yZUtub3duVGFncyA9IGNvcmVLbm93blRhZ3M7XG5leHBvcnRzLmdldFRhZ3MgPSBnZXRUYWdzO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBpZGVudGl0eSA9IHJlcXVpcmUoJy4uL25vZGVzL2lkZW50aXR5LmpzJyk7XG52YXIgbWFwID0gcmVxdWlyZSgnLi9jb21tb24vbWFwLmpzJyk7XG52YXIgc2VxID0gcmVxdWlyZSgnLi9jb21tb24vc2VxLmpzJyk7XG52YXIgc3RyaW5nID0gcmVxdWlyZSgnLi9jb21tb24vc3RyaW5nLmpzJyk7XG52YXIgdGFncyA9IHJlcXVpcmUoJy4vdGFncy5qcycpO1xuXG5jb25zdCBzb3J0TWFwRW50cmllc0J5S2V5ID0gKGEsIGIpID0+IGEua2V5IDwgYi5rZXkgPyAtMSA6IGEua2V5ID4gYi5rZXkgPyAxIDogMDtcbmNsYXNzIFNjaGVtYSB7XG4gICAgY29uc3RydWN0b3IoeyBjb21wYXQsIGN1c3RvbVRhZ3MsIG1lcmdlLCByZXNvbHZlS25vd25UYWdzLCBzY2hlbWEsIHNvcnRNYXBFbnRyaWVzLCB0b1N0cmluZ0RlZmF1bHRzIH0pIHtcbiAgICAgICAgdGhpcy5jb21wYXQgPSBBcnJheS5pc0FycmF5KGNvbXBhdClcbiAgICAgICAgICAgID8gdGFncy5nZXRUYWdzKGNvbXBhdCwgJ2NvbXBhdCcpXG4gICAgICAgICAgICA6IGNvbXBhdFxuICAgICAgICAgICAgICAgID8gdGFncy5nZXRUYWdzKG51bGwsIGNvbXBhdClcbiAgICAgICAgICAgICAgICA6IG51bGw7XG4gICAgICAgIHRoaXMubmFtZSA9ICh0eXBlb2Ygc2NoZW1hID09PSAnc3RyaW5nJyAmJiBzY2hlbWEpIHx8ICdjb3JlJztcbiAgICAgICAgdGhpcy5rbm93blRhZ3MgPSByZXNvbHZlS25vd25UYWdzID8gdGFncy5jb3JlS25vd25UYWdzIDoge307XG4gICAgICAgIHRoaXMudGFncyA9IHRhZ3MuZ2V0VGFncyhjdXN0b21UYWdzLCB0aGlzLm5hbWUsIG1lcmdlKTtcbiAgICAgICAgdGhpcy50b1N0cmluZ09wdGlvbnMgPSB0b1N0cmluZ0RlZmF1bHRzID8/IG51bGw7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBpZGVudGl0eS5NQVAsIHsgdmFsdWU6IG1hcC5tYXAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBpZGVudGl0eS5TQ0FMQVIsIHsgdmFsdWU6IHN0cmluZy5zdHJpbmcgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBpZGVudGl0eS5TRVEsIHsgdmFsdWU6IHNlcS5zZXEgfSk7XG4gICAgICAgIC8vIFVzZWQgYnkgY3JlYXRlTWFwKClcbiAgICAgICAgdGhpcy5zb3J0TWFwRW50cmllcyA9XG4gICAgICAgICAgICB0eXBlb2Ygc29ydE1hcEVudHJpZXMgPT09ICdmdW5jdGlvbidcbiAgICAgICAgICAgICAgICA/IHNvcnRNYXBFbnRyaWVzXG4gICAgICAgICAgICAgICAgOiBzb3J0TWFwRW50cmllcyA9PT0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICA/IHNvcnRNYXBFbnRyaWVzQnlLZXlcbiAgICAgICAgICAgICAgICAgICAgOiBudWxsO1xuICAgIH1cbiAgICBjbG9uZSgpIHtcbiAgICAgICAgY29uc3QgY29weSA9IE9iamVjdC5jcmVhdGUoU2NoZW1hLnByb3RvdHlwZSwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnModGhpcykpO1xuICAgICAgICBjb3B5LnRhZ3MgPSB0aGlzLnRhZ3Muc2xpY2UoKTtcbiAgICAgICAgcmV0dXJuIGNvcHk7XG4gICAgfVxufVxuXG5leHBvcnRzLlNjaGVtYSA9IFNjaGVtYTtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuLi9ub2Rlcy9pZGVudGl0eS5qcycpO1xudmFyIHN0cmluZ2lmeSA9IHJlcXVpcmUoJy4vc3RyaW5naWZ5LmpzJyk7XG52YXIgc3RyaW5naWZ5Q29tbWVudCA9IHJlcXVpcmUoJy4vc3RyaW5naWZ5Q29tbWVudC5qcycpO1xuXG5mdW5jdGlvbiBzdHJpbmdpZnlEb2N1bWVudChkb2MsIG9wdGlvbnMpIHtcbiAgICBjb25zdCBsaW5lcyA9IFtdO1xuICAgIGxldCBoYXNEaXJlY3RpdmVzID0gb3B0aW9ucy5kaXJlY3RpdmVzID09PSB0cnVlO1xuICAgIGlmIChvcHRpb25zLmRpcmVjdGl2ZXMgIT09IGZhbHNlICYmIGRvYy5kaXJlY3RpdmVzKSB7XG4gICAgICAgIGNvbnN0IGRpciA9IGRvYy5kaXJlY3RpdmVzLnRvU3RyaW5nKGRvYyk7XG4gICAgICAgIGlmIChkaXIpIHtcbiAgICAgICAgICAgIGxpbmVzLnB1c2goZGlyKTtcbiAgICAgICAgICAgIGhhc0RpcmVjdGl2ZXMgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGRvYy5kaXJlY3RpdmVzLmRvY1N0YXJ0KVxuICAgICAgICAgICAgaGFzRGlyZWN0aXZlcyA9IHRydWU7XG4gICAgfVxuICAgIGlmIChoYXNEaXJlY3RpdmVzKVxuICAgICAgICBsaW5lcy5wdXNoKCctLS0nKTtcbiAgICBjb25zdCBjdHggPSBzdHJpbmdpZnkuY3JlYXRlU3RyaW5naWZ5Q29udGV4dChkb2MsIG9wdGlvbnMpO1xuICAgIGNvbnN0IHsgY29tbWVudFN0cmluZyB9ID0gY3R4Lm9wdGlvbnM7XG4gICAgaWYgKGRvYy5jb21tZW50QmVmb3JlKSB7XG4gICAgICAgIGlmIChsaW5lcy5sZW5ndGggIT09IDEpXG4gICAgICAgICAgICBsaW5lcy51bnNoaWZ0KCcnKTtcbiAgICAgICAgY29uc3QgY3MgPSBjb21tZW50U3RyaW5nKGRvYy5jb21tZW50QmVmb3JlKTtcbiAgICAgICAgbGluZXMudW5zaGlmdChzdHJpbmdpZnlDb21tZW50LmluZGVudENvbW1lbnQoY3MsICcnKSk7XG4gICAgfVxuICAgIGxldCBjaG9tcEtlZXAgPSBmYWxzZTtcbiAgICBsZXQgY29udGVudENvbW1lbnQgPSBudWxsO1xuICAgIGlmIChkb2MuY29udGVudHMpIHtcbiAgICAgICAgaWYgKGlkZW50aXR5LmlzTm9kZShkb2MuY29udGVudHMpKSB7XG4gICAgICAgICAgICBpZiAoZG9jLmNvbnRlbnRzLnNwYWNlQmVmb3JlICYmIGhhc0RpcmVjdGl2ZXMpXG4gICAgICAgICAgICAgICAgbGluZXMucHVzaCgnJyk7XG4gICAgICAgICAgICBpZiAoZG9jLmNvbnRlbnRzLmNvbW1lbnRCZWZvcmUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjcyA9IGNvbW1lbnRTdHJpbmcoZG9jLmNvbnRlbnRzLmNvbW1lbnRCZWZvcmUpO1xuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goc3RyaW5naWZ5Q29tbWVudC5pbmRlbnRDb21tZW50KGNzLCAnJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gdG9wLWxldmVsIGJsb2NrIHNjYWxhcnMgbmVlZCB0byBiZSBpbmRlbnRlZCBpZiBmb2xsb3dlZCBieSBhIGNvbW1lbnRcbiAgICAgICAgICAgIGN0eC5mb3JjZUJsb2NrSW5kZW50ID0gISFkb2MuY29tbWVudDtcbiAgICAgICAgICAgIGNvbnRlbnRDb21tZW50ID0gZG9jLmNvbnRlbnRzLmNvbW1lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgb25DaG9tcEtlZXAgPSBjb250ZW50Q29tbWVudCA/IHVuZGVmaW5lZCA6ICgpID0+IChjaG9tcEtlZXAgPSB0cnVlKTtcbiAgICAgICAgbGV0IGJvZHkgPSBzdHJpbmdpZnkuc3RyaW5naWZ5KGRvYy5jb250ZW50cywgY3R4LCAoKSA9PiAoY29udGVudENvbW1lbnQgPSBudWxsKSwgb25DaG9tcEtlZXApO1xuICAgICAgICBpZiAoY29udGVudENvbW1lbnQpXG4gICAgICAgICAgICBib2R5ICs9IHN0cmluZ2lmeUNvbW1lbnQubGluZUNvbW1lbnQoYm9keSwgJycsIGNvbW1lbnRTdHJpbmcoY29udGVudENvbW1lbnQpKTtcbiAgICAgICAgaWYgKChib2R5WzBdID09PSAnfCcgfHwgYm9keVswXSA9PT0gJz4nKSAmJlxuICAgICAgICAgICAgbGluZXNbbGluZXMubGVuZ3RoIC0gMV0gPT09ICctLS0nKSB7XG4gICAgICAgICAgICAvLyBUb3AtbGV2ZWwgYmxvY2sgc2NhbGFycyB3aXRoIGEgcHJlY2VkaW5nIGRvYyBtYXJrZXIgb3VnaHQgdG8gdXNlIHRoZVxuICAgICAgICAgICAgLy8gc2FtZSBsaW5lIGZvciB0aGVpciBoZWFkZXIuXG4gICAgICAgICAgICBsaW5lc1tsaW5lcy5sZW5ndGggLSAxXSA9IGAtLS0gJHtib2R5fWA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbGluZXMucHVzaChib2R5KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGxpbmVzLnB1c2goc3RyaW5naWZ5LnN0cmluZ2lmeShkb2MuY29udGVudHMsIGN0eCkpO1xuICAgIH1cbiAgICBpZiAoZG9jLmRpcmVjdGl2ZXM/LmRvY0VuZCkge1xuICAgICAgICBpZiAoZG9jLmNvbW1lbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IGNzID0gY29tbWVudFN0cmluZyhkb2MuY29tbWVudCk7XG4gICAgICAgICAgICBpZiAoY3MuaW5jbHVkZXMoJ1xcbicpKSB7XG4gICAgICAgICAgICAgICAgbGluZXMucHVzaCgnLi4uJyk7XG4gICAgICAgICAgICAgICAgbGluZXMucHVzaChzdHJpbmdpZnlDb21tZW50LmluZGVudENvbW1lbnQoY3MsICcnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKGAuLi4gJHtjc31gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGxpbmVzLnB1c2goJy4uLicpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBsZXQgZGMgPSBkb2MuY29tbWVudDtcbiAgICAgICAgaWYgKGRjICYmIGNob21wS2VlcClcbiAgICAgICAgICAgIGRjID0gZGMucmVwbGFjZSgvXlxcbisvLCAnJyk7XG4gICAgICAgIGlmIChkYykge1xuICAgICAgICAgICAgaWYgKCghY2hvbXBLZWVwIHx8IGNvbnRlbnRDb21tZW50KSAmJiBsaW5lc1tsaW5lcy5sZW5ndGggLSAxXSAhPT0gJycpXG4gICAgICAgICAgICAgICAgbGluZXMucHVzaCgnJyk7XG4gICAgICAgICAgICBsaW5lcy5wdXNoKHN0cmluZ2lmeUNvbW1lbnQuaW5kZW50Q29tbWVudChjb21tZW50U3RyaW5nKGRjKSwgJycpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbGluZXMuam9pbignXFxuJykgKyAnXFxuJztcbn1cblxuZXhwb3J0cy5zdHJpbmdpZnlEb2N1bWVudCA9IHN0cmluZ2lmeURvY3VtZW50O1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBBbGlhcyA9IHJlcXVpcmUoJy4uL25vZGVzL0FsaWFzLmpzJyk7XG52YXIgQ29sbGVjdGlvbiA9IHJlcXVpcmUoJy4uL25vZGVzL0NvbGxlY3Rpb24uanMnKTtcbnZhciBpZGVudGl0eSA9IHJlcXVpcmUoJy4uL25vZGVzL2lkZW50aXR5LmpzJyk7XG52YXIgUGFpciA9IHJlcXVpcmUoJy4uL25vZGVzL1BhaXIuanMnKTtcbnZhciB0b0pTID0gcmVxdWlyZSgnLi4vbm9kZXMvdG9KUy5qcycpO1xudmFyIFNjaGVtYSA9IHJlcXVpcmUoJy4uL3NjaGVtYS9TY2hlbWEuanMnKTtcbnZhciBzdHJpbmdpZnlEb2N1bWVudCA9IHJlcXVpcmUoJy4uL3N0cmluZ2lmeS9zdHJpbmdpZnlEb2N1bWVudC5qcycpO1xudmFyIGFuY2hvcnMgPSByZXF1aXJlKCcuL2FuY2hvcnMuanMnKTtcbnZhciBhcHBseVJldml2ZXIgPSByZXF1aXJlKCcuL2FwcGx5UmV2aXZlci5qcycpO1xudmFyIGNyZWF0ZU5vZGUgPSByZXF1aXJlKCcuL2NyZWF0ZU5vZGUuanMnKTtcbnZhciBkaXJlY3RpdmVzID0gcmVxdWlyZSgnLi9kaXJlY3RpdmVzLmpzJyk7XG5cbmNsYXNzIERvY3VtZW50IHtcbiAgICBjb25zdHJ1Y3Rvcih2YWx1ZSwgcmVwbGFjZXIsIG9wdGlvbnMpIHtcbiAgICAgICAgLyoqIEEgY29tbWVudCBiZWZvcmUgdGhpcyBEb2N1bWVudCAqL1xuICAgICAgICB0aGlzLmNvbW1lbnRCZWZvcmUgPSBudWxsO1xuICAgICAgICAvKiogQSBjb21tZW50IGltbWVkaWF0ZWx5IGFmdGVyIHRoaXMgRG9jdW1lbnQgKi9cbiAgICAgICAgdGhpcy5jb21tZW50ID0gbnVsbDtcbiAgICAgICAgLyoqIEVycm9ycyBlbmNvdW50ZXJlZCBkdXJpbmcgcGFyc2luZy4gKi9cbiAgICAgICAgdGhpcy5lcnJvcnMgPSBbXTtcbiAgICAgICAgLyoqIFdhcm5pbmdzIGVuY291bnRlcmVkIGR1cmluZyBwYXJzaW5nLiAqL1xuICAgICAgICB0aGlzLndhcm5pbmdzID0gW107XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBpZGVudGl0eS5OT0RFX1RZUEUsIHsgdmFsdWU6IGlkZW50aXR5LkRPQyB9KTtcbiAgICAgICAgbGV0IF9yZXBsYWNlciA9IG51bGw7XG4gICAgICAgIGlmICh0eXBlb2YgcmVwbGFjZXIgPT09ICdmdW5jdGlvbicgfHwgQXJyYXkuaXNBcnJheShyZXBsYWNlcikpIHtcbiAgICAgICAgICAgIF9yZXBsYWNlciA9IHJlcGxhY2VyO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG9wdGlvbnMgPT09IHVuZGVmaW5lZCAmJiByZXBsYWNlcikge1xuICAgICAgICAgICAgb3B0aW9ucyA9IHJlcGxhY2VyO1xuICAgICAgICAgICAgcmVwbGFjZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgb3B0ID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICBpbnRBc0JpZ0ludDogZmFsc2UsXG4gICAgICAgICAgICBrZWVwU291cmNlVG9rZW5zOiBmYWxzZSxcbiAgICAgICAgICAgIGxvZ0xldmVsOiAnd2FybicsXG4gICAgICAgICAgICBwcmV0dHlFcnJvcnM6IHRydWUsXG4gICAgICAgICAgICBzdHJpY3Q6IHRydWUsXG4gICAgICAgICAgICBzdHJpbmdLZXlzOiBmYWxzZSxcbiAgICAgICAgICAgIHVuaXF1ZUtleXM6IHRydWUsXG4gICAgICAgICAgICB2ZXJzaW9uOiAnMS4yJ1xuICAgICAgICB9LCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0O1xuICAgICAgICBsZXQgeyB2ZXJzaW9uIH0gPSBvcHQ7XG4gICAgICAgIGlmIChvcHRpb25zPy5fZGlyZWN0aXZlcykge1xuICAgICAgICAgICAgdGhpcy5kaXJlY3RpdmVzID0gb3B0aW9ucy5fZGlyZWN0aXZlcy5hdERvY3VtZW50KCk7XG4gICAgICAgICAgICBpZiAodGhpcy5kaXJlY3RpdmVzLnlhbWwuZXhwbGljaXQpXG4gICAgICAgICAgICAgICAgdmVyc2lvbiA9IHRoaXMuZGlyZWN0aXZlcy55YW1sLnZlcnNpb247XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5kaXJlY3RpdmVzID0gbmV3IGRpcmVjdGl2ZXMuRGlyZWN0aXZlcyh7IHZlcnNpb24gfSk7XG4gICAgICAgIHRoaXMuc2V0U2NoZW1hKHZlcnNpb24sIG9wdGlvbnMpO1xuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFdlIGNhbid0IHJlYWxseSBrbm93IHRoYXQgdGhpcyBtYXRjaGVzIENvbnRlbnRzLlxuICAgICAgICB0aGlzLmNvbnRlbnRzID1cbiAgICAgICAgICAgIHZhbHVlID09PSB1bmRlZmluZWQgPyBudWxsIDogdGhpcy5jcmVhdGVOb2RlKHZhbHVlLCBfcmVwbGFjZXIsIG9wdGlvbnMpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBkZWVwIGNvcHkgb2YgdGhpcyBEb2N1bWVudCBhbmQgaXRzIGNvbnRlbnRzLlxuICAgICAqXG4gICAgICogQ3VzdG9tIE5vZGUgdmFsdWVzIHRoYXQgaW5oZXJpdCBmcm9tIGBPYmplY3RgIHN0aWxsIHJlZmVyIHRvIHRoZWlyIG9yaWdpbmFsIGluc3RhbmNlcy5cbiAgICAgKi9cbiAgICBjbG9uZSgpIHtcbiAgICAgICAgY29uc3QgY29weSA9IE9iamVjdC5jcmVhdGUoRG9jdW1lbnQucHJvdG90eXBlLCB7XG4gICAgICAgICAgICBbaWRlbnRpdHkuTk9ERV9UWVBFXTogeyB2YWx1ZTogaWRlbnRpdHkuRE9DIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGNvcHkuY29tbWVudEJlZm9yZSA9IHRoaXMuY29tbWVudEJlZm9yZTtcbiAgICAgICAgY29weS5jb21tZW50ID0gdGhpcy5jb21tZW50O1xuICAgICAgICBjb3B5LmVycm9ycyA9IHRoaXMuZXJyb3JzLnNsaWNlKCk7XG4gICAgICAgIGNvcHkud2FybmluZ3MgPSB0aGlzLndhcm5pbmdzLnNsaWNlKCk7XG4gICAgICAgIGNvcHkub3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMub3B0aW9ucyk7XG4gICAgICAgIGlmICh0aGlzLmRpcmVjdGl2ZXMpXG4gICAgICAgICAgICBjb3B5LmRpcmVjdGl2ZXMgPSB0aGlzLmRpcmVjdGl2ZXMuY2xvbmUoKTtcbiAgICAgICAgY29weS5zY2hlbWEgPSB0aGlzLnNjaGVtYS5jbG9uZSgpO1xuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFdlIGNhbid0IHJlYWxseSBrbm93IHRoYXQgdGhpcyBtYXRjaGVzIENvbnRlbnRzLlxuICAgICAgICBjb3B5LmNvbnRlbnRzID0gaWRlbnRpdHkuaXNOb2RlKHRoaXMuY29udGVudHMpXG4gICAgICAgICAgICA/IHRoaXMuY29udGVudHMuY2xvbmUoY29weS5zY2hlbWEpXG4gICAgICAgICAgICA6IHRoaXMuY29udGVudHM7XG4gICAgICAgIGlmICh0aGlzLnJhbmdlKVxuICAgICAgICAgICAgY29weS5yYW5nZSA9IHRoaXMucmFuZ2Uuc2xpY2UoKTtcbiAgICAgICAgcmV0dXJuIGNvcHk7XG4gICAgfVxuICAgIC8qKiBBZGRzIGEgdmFsdWUgdG8gdGhlIGRvY3VtZW50LiAqL1xuICAgIGFkZCh2YWx1ZSkge1xuICAgICAgICBpZiAoYXNzZXJ0Q29sbGVjdGlvbih0aGlzLmNvbnRlbnRzKSlcbiAgICAgICAgICAgIHRoaXMuY29udGVudHMuYWRkKHZhbHVlKTtcbiAgICB9XG4gICAgLyoqIEFkZHMgYSB2YWx1ZSB0byB0aGUgZG9jdW1lbnQuICovXG4gICAgYWRkSW4ocGF0aCwgdmFsdWUpIHtcbiAgICAgICAgaWYgKGFzc2VydENvbGxlY3Rpb24odGhpcy5jb250ZW50cykpXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRzLmFkZEluKHBhdGgsIHZhbHVlKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IGBBbGlhc2Agbm9kZSwgZW5zdXJpbmcgdGhhdCB0aGUgdGFyZ2V0IGBub2RlYCBoYXMgdGhlIHJlcXVpcmVkIGFuY2hvci5cbiAgICAgKlxuICAgICAqIElmIGBub2RlYCBhbHJlYWR5IGhhcyBhbiBhbmNob3IsIGBuYW1lYCBpcyBpZ25vcmVkLlxuICAgICAqIE90aGVyd2lzZSwgdGhlIGBub2RlLmFuY2hvcmAgdmFsdWUgd2lsbCBiZSBzZXQgdG8gYG5hbWVgLFxuICAgICAqIG9yIGlmIGFuIGFuY2hvciB3aXRoIHRoYXQgbmFtZSBpcyBhbHJlYWR5IHByZXNlbnQgaW4gdGhlIGRvY3VtZW50LFxuICAgICAqIGBuYW1lYCB3aWxsIGJlIHVzZWQgYXMgYSBwcmVmaXggZm9yIGEgbmV3IHVuaXF1ZSBhbmNob3IuXG4gICAgICogSWYgYG5hbWVgIGlzIHVuZGVmaW5lZCwgdGhlIGdlbmVyYXRlZCBhbmNob3Igd2lsbCB1c2UgJ2EnIGFzIGEgcHJlZml4LlxuICAgICAqL1xuICAgIGNyZWF0ZUFsaWFzKG5vZGUsIG5hbWUpIHtcbiAgICAgICAgaWYgKCFub2RlLmFuY2hvcikge1xuICAgICAgICAgICAgY29uc3QgcHJldiA9IGFuY2hvcnMuYW5jaG9yTmFtZXModGhpcyk7XG4gICAgICAgICAgICBub2RlLmFuY2hvciA9XG4gICAgICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9wcmVmZXItbnVsbGlzaC1jb2FsZXNjaW5nXG4gICAgICAgICAgICAgICAgIW5hbWUgfHwgcHJldi5oYXMobmFtZSkgPyBhbmNob3JzLmZpbmROZXdBbmNob3IobmFtZSB8fCAnYScsIHByZXYpIDogbmFtZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IEFsaWFzLkFsaWFzKG5vZGUuYW5jaG9yKTtcbiAgICB9XG4gICAgY3JlYXRlTm9kZSh2YWx1ZSwgcmVwbGFjZXIsIG9wdGlvbnMpIHtcbiAgICAgICAgbGV0IF9yZXBsYWNlciA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHR5cGVvZiByZXBsYWNlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgdmFsdWUgPSByZXBsYWNlci5jYWxsKHsgJyc6IHZhbHVlIH0sICcnLCB2YWx1ZSk7XG4gICAgICAgICAgICBfcmVwbGFjZXIgPSByZXBsYWNlcjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5KHJlcGxhY2VyKSkge1xuICAgICAgICAgICAgY29uc3Qga2V5VG9TdHIgPSAodikgPT4gdHlwZW9mIHYgPT09ICdudW1iZXInIHx8IHYgaW5zdGFuY2VvZiBTdHJpbmcgfHwgdiBpbnN0YW5jZW9mIE51bWJlcjtcbiAgICAgICAgICAgIGNvbnN0IGFzU3RyID0gcmVwbGFjZXIuZmlsdGVyKGtleVRvU3RyKS5tYXAoU3RyaW5nKTtcbiAgICAgICAgICAgIGlmIChhc1N0ci5sZW5ndGggPiAwKVxuICAgICAgICAgICAgICAgIHJlcGxhY2VyID0gcmVwbGFjZXIuY29uY2F0KGFzU3RyKTtcbiAgICAgICAgICAgIF9yZXBsYWNlciA9IHJlcGxhY2VyO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG9wdGlvbnMgPT09IHVuZGVmaW5lZCAmJiByZXBsYWNlcikge1xuICAgICAgICAgICAgb3B0aW9ucyA9IHJlcGxhY2VyO1xuICAgICAgICAgICAgcmVwbGFjZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgeyBhbGlhc0R1cGxpY2F0ZU9iamVjdHMsIGFuY2hvclByZWZpeCwgZmxvdywga2VlcFVuZGVmaW5lZCwgb25UYWdPYmosIHRhZyB9ID0gb3B0aW9ucyA/PyB7fTtcbiAgICAgICAgY29uc3QgeyBvbkFuY2hvciwgc2V0QW5jaG9ycywgc291cmNlT2JqZWN0cyB9ID0gYW5jaG9ycy5jcmVhdGVOb2RlQW5jaG9ycyh0aGlzLCBcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9wcmVmZXItbnVsbGlzaC1jb2FsZXNjaW5nXG4gICAgICAgIGFuY2hvclByZWZpeCB8fCAnYScpO1xuICAgICAgICBjb25zdCBjdHggPSB7XG4gICAgICAgICAgICBhbGlhc0R1cGxpY2F0ZU9iamVjdHM6IGFsaWFzRHVwbGljYXRlT2JqZWN0cyA/PyB0cnVlLFxuICAgICAgICAgICAga2VlcFVuZGVmaW5lZDoga2VlcFVuZGVmaW5lZCA/PyBmYWxzZSxcbiAgICAgICAgICAgIG9uQW5jaG9yLFxuICAgICAgICAgICAgb25UYWdPYmosXG4gICAgICAgICAgICByZXBsYWNlcjogX3JlcGxhY2VyLFxuICAgICAgICAgICAgc2NoZW1hOiB0aGlzLnNjaGVtYSxcbiAgICAgICAgICAgIHNvdXJjZU9iamVjdHNcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3Qgbm9kZSA9IGNyZWF0ZU5vZGUuY3JlYXRlTm9kZSh2YWx1ZSwgdGFnLCBjdHgpO1xuICAgICAgICBpZiAoZmxvdyAmJiBpZGVudGl0eS5pc0NvbGxlY3Rpb24obm9kZSkpXG4gICAgICAgICAgICBub2RlLmZsb3cgPSB0cnVlO1xuICAgICAgICBzZXRBbmNob3JzKCk7XG4gICAgICAgIHJldHVybiBub2RlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0IGEga2V5IGFuZCBhIHZhbHVlIGludG8gYSBgUGFpcmAgdXNpbmcgdGhlIGN1cnJlbnQgc2NoZW1hLFxuICAgICAqIHJlY3Vyc2l2ZWx5IHdyYXBwaW5nIGFsbCB2YWx1ZXMgYXMgYFNjYWxhcmAgb3IgYENvbGxlY3Rpb25gIG5vZGVzLlxuICAgICAqL1xuICAgIGNyZWF0ZVBhaXIoa2V5LCB2YWx1ZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIGNvbnN0IGsgPSB0aGlzLmNyZWF0ZU5vZGUoa2V5LCBudWxsLCBvcHRpb25zKTtcbiAgICAgICAgY29uc3QgdiA9IHRoaXMuY3JlYXRlTm9kZSh2YWx1ZSwgbnVsbCwgb3B0aW9ucyk7XG4gICAgICAgIHJldHVybiBuZXcgUGFpci5QYWlyKGssIHYpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGEgdmFsdWUgZnJvbSB0aGUgZG9jdW1lbnQuXG4gICAgICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBpdGVtIHdhcyBmb3VuZCBhbmQgcmVtb3ZlZC5cbiAgICAgKi9cbiAgICBkZWxldGUoa2V5KSB7XG4gICAgICAgIHJldHVybiBhc3NlcnRDb2xsZWN0aW9uKHRoaXMuY29udGVudHMpID8gdGhpcy5jb250ZW50cy5kZWxldGUoa2V5KSA6IGZhbHNlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGEgdmFsdWUgZnJvbSB0aGUgZG9jdW1lbnQuXG4gICAgICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBpdGVtIHdhcyBmb3VuZCBhbmQgcmVtb3ZlZC5cbiAgICAgKi9cbiAgICBkZWxldGVJbihwYXRoKSB7XG4gICAgICAgIGlmIChDb2xsZWN0aW9uLmlzRW1wdHlQYXRoKHBhdGgpKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5jb250ZW50cyA9PSBudWxsKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgUHJlc3VtZWQgaW1wb3NzaWJsZSBpZiBTdHJpY3QgZXh0ZW5kcyBmYWxzZVxuICAgICAgICAgICAgdGhpcy5jb250ZW50cyA9IG51bGw7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYXNzZXJ0Q29sbGVjdGlvbih0aGlzLmNvbnRlbnRzKVxuICAgICAgICAgICAgPyB0aGlzLmNvbnRlbnRzLmRlbGV0ZUluKHBhdGgpXG4gICAgICAgICAgICA6IGZhbHNlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGl0ZW0gYXQgYGtleWAsIG9yIGB1bmRlZmluZWRgIGlmIG5vdCBmb3VuZC4gQnkgZGVmYXVsdCB1bndyYXBzXG4gICAgICogc2NhbGFyIHZhbHVlcyBmcm9tIHRoZWlyIHN1cnJvdW5kaW5nIG5vZGU7IHRvIGRpc2FibGUgc2V0IGBrZWVwU2NhbGFyYCB0b1xuICAgICAqIGB0cnVlYCAoY29sbGVjdGlvbnMgYXJlIGFsd2F5cyByZXR1cm5lZCBpbnRhY3QpLlxuICAgICAqL1xuICAgIGdldChrZXksIGtlZXBTY2FsYXIpIHtcbiAgICAgICAgcmV0dXJuIGlkZW50aXR5LmlzQ29sbGVjdGlvbih0aGlzLmNvbnRlbnRzKVxuICAgICAgICAgICAgPyB0aGlzLmNvbnRlbnRzLmdldChrZXksIGtlZXBTY2FsYXIpXG4gICAgICAgICAgICA6IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmV0dXJucyBpdGVtIGF0IGBwYXRoYCwgb3IgYHVuZGVmaW5lZGAgaWYgbm90IGZvdW5kLiBCeSBkZWZhdWx0IHVud3JhcHNcbiAgICAgKiBzY2FsYXIgdmFsdWVzIGZyb20gdGhlaXIgc3Vycm91bmRpbmcgbm9kZTsgdG8gZGlzYWJsZSBzZXQgYGtlZXBTY2FsYXJgIHRvXG4gICAgICogYHRydWVgIChjb2xsZWN0aW9ucyBhcmUgYWx3YXlzIHJldHVybmVkIGludGFjdCkuXG4gICAgICovXG4gICAgZ2V0SW4ocGF0aCwga2VlcFNjYWxhcikge1xuICAgICAgICBpZiAoQ29sbGVjdGlvbi5pc0VtcHR5UGF0aChwYXRoKSlcbiAgICAgICAgICAgIHJldHVybiAha2VlcFNjYWxhciAmJiBpZGVudGl0eS5pc1NjYWxhcih0aGlzLmNvbnRlbnRzKVxuICAgICAgICAgICAgICAgID8gdGhpcy5jb250ZW50cy52YWx1ZVxuICAgICAgICAgICAgICAgIDogdGhpcy5jb250ZW50cztcbiAgICAgICAgcmV0dXJuIGlkZW50aXR5LmlzQ29sbGVjdGlvbih0aGlzLmNvbnRlbnRzKVxuICAgICAgICAgICAgPyB0aGlzLmNvbnRlbnRzLmdldEluKHBhdGgsIGtlZXBTY2FsYXIpXG4gICAgICAgICAgICA6IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIHRoZSBkb2N1bWVudCBpbmNsdWRlcyBhIHZhbHVlIHdpdGggdGhlIGtleSBga2V5YC5cbiAgICAgKi9cbiAgICBoYXMoa2V5KSB7XG4gICAgICAgIHJldHVybiBpZGVudGl0eS5pc0NvbGxlY3Rpb24odGhpcy5jb250ZW50cykgPyB0aGlzLmNvbnRlbnRzLmhhcyhrZXkpIDogZmFsc2U7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiB0aGUgZG9jdW1lbnQgaW5jbHVkZXMgYSB2YWx1ZSBhdCBgcGF0aGAuXG4gICAgICovXG4gICAgaGFzSW4ocGF0aCkge1xuICAgICAgICBpZiAoQ29sbGVjdGlvbi5pc0VtcHR5UGF0aChwYXRoKSlcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbnRlbnRzICE9PSB1bmRlZmluZWQ7XG4gICAgICAgIHJldHVybiBpZGVudGl0eS5pc0NvbGxlY3Rpb24odGhpcy5jb250ZW50cykgPyB0aGlzLmNvbnRlbnRzLmhhc0luKHBhdGgpIDogZmFsc2U7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldHMgYSB2YWx1ZSBpbiB0aGlzIGRvY3VtZW50LiBGb3IgYCEhc2V0YCwgYHZhbHVlYCBuZWVkcyB0byBiZSBhXG4gICAgICogYm9vbGVhbiB0byBhZGQvcmVtb3ZlIHRoZSBpdGVtIGZyb20gdGhlIHNldC5cbiAgICAgKi9cbiAgICBzZXQoa2V5LCB2YWx1ZSkge1xuICAgICAgICBpZiAodGhpcy5jb250ZW50cyA9PSBudWxsKSB7XG4gICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFdlIGNhbid0IHJlYWxseSBrbm93IHRoYXQgdGhpcyBtYXRjaGVzIENvbnRlbnRzLlxuICAgICAgICAgICAgdGhpcy5jb250ZW50cyA9IENvbGxlY3Rpb24uY29sbGVjdGlvbkZyb21QYXRoKHRoaXMuc2NoZW1hLCBba2V5XSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGFzc2VydENvbGxlY3Rpb24odGhpcy5jb250ZW50cykpIHtcbiAgICAgICAgICAgIHRoaXMuY29udGVudHMuc2V0KGtleSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldHMgYSB2YWx1ZSBpbiB0aGlzIGRvY3VtZW50LiBGb3IgYCEhc2V0YCwgYHZhbHVlYCBuZWVkcyB0byBiZSBhXG4gICAgICogYm9vbGVhbiB0byBhZGQvcmVtb3ZlIHRoZSBpdGVtIGZyb20gdGhlIHNldC5cbiAgICAgKi9cbiAgICBzZXRJbihwYXRoLCB2YWx1ZSkge1xuICAgICAgICBpZiAoQ29sbGVjdGlvbi5pc0VtcHR5UGF0aChwYXRoKSkge1xuICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBXZSBjYW4ndCByZWFsbHkga25vdyB0aGF0IHRoaXMgbWF0Y2hlcyBDb250ZW50cy5cbiAgICAgICAgICAgIHRoaXMuY29udGVudHMgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzLmNvbnRlbnRzID09IG51bGwpIHtcbiAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgV2UgY2FuJ3QgcmVhbGx5IGtub3cgdGhhdCB0aGlzIG1hdGNoZXMgQ29udGVudHMuXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRzID0gQ29sbGVjdGlvbi5jb2xsZWN0aW9uRnJvbVBhdGgodGhpcy5zY2hlbWEsIEFycmF5LmZyb20ocGF0aCksIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChhc3NlcnRDb2xsZWN0aW9uKHRoaXMuY29udGVudHMpKSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRzLnNldEluKHBhdGgsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGFuZ2UgdGhlIFlBTUwgdmVyc2lvbiBhbmQgc2NoZW1hIHVzZWQgYnkgdGhlIGRvY3VtZW50LlxuICAgICAqIEEgYG51bGxgIHZlcnNpb24gZGlzYWJsZXMgc3VwcG9ydCBmb3IgZGlyZWN0aXZlcywgZXhwbGljaXQgdGFncywgYW5jaG9ycywgYW5kIGFsaWFzZXMuXG4gICAgICogSXQgYWxzbyByZXF1aXJlcyB0aGUgYHNjaGVtYWAgb3B0aW9uIHRvIGJlIGdpdmVuIGFzIGEgYFNjaGVtYWAgaW5zdGFuY2UgdmFsdWUuXG4gICAgICpcbiAgICAgKiBPdmVycmlkZXMgYWxsIHByZXZpb3VzbHkgc2V0IHNjaGVtYSBvcHRpb25zLlxuICAgICAqL1xuICAgIHNldFNjaGVtYSh2ZXJzaW9uLCBvcHRpb25zID0ge30pIHtcbiAgICAgICAgaWYgKHR5cGVvZiB2ZXJzaW9uID09PSAnbnVtYmVyJylcbiAgICAgICAgICAgIHZlcnNpb24gPSBTdHJpbmcodmVyc2lvbik7XG4gICAgICAgIGxldCBvcHQ7XG4gICAgICAgIHN3aXRjaCAodmVyc2lvbikge1xuICAgICAgICAgICAgY2FzZSAnMS4xJzpcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5kaXJlY3RpdmVzKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpcmVjdGl2ZXMueWFtbC52ZXJzaW9uID0gJzEuMSc7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpcmVjdGl2ZXMgPSBuZXcgZGlyZWN0aXZlcy5EaXJlY3RpdmVzKHsgdmVyc2lvbjogJzEuMScgfSk7XG4gICAgICAgICAgICAgICAgb3B0ID0geyByZXNvbHZlS25vd25UYWdzOiBmYWxzZSwgc2NoZW1hOiAneWFtbC0xLjEnIH07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICcxLjInOlxuICAgICAgICAgICAgY2FzZSAnbmV4dCc6XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZGlyZWN0aXZlcylcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXJlY3RpdmVzLnlhbWwudmVyc2lvbiA9IHZlcnNpb247XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpcmVjdGl2ZXMgPSBuZXcgZGlyZWN0aXZlcy5EaXJlY3RpdmVzKHsgdmVyc2lvbiB9KTtcbiAgICAgICAgICAgICAgICBvcHQgPSB7IHJlc29sdmVLbm93blRhZ3M6IHRydWUsIHNjaGVtYTogJ2NvcmUnIH07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIG51bGw6XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZGlyZWN0aXZlcylcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuZGlyZWN0aXZlcztcbiAgICAgICAgICAgICAgICBvcHQgPSBudWxsO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN2ID0gSlNPTi5zdHJpbmdpZnkodmVyc2lvbik7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCAnMS4xJywgJzEuMicgb3IgbnVsbCBhcyBmaXJzdCBhcmd1bWVudCwgYnV0IGZvdW5kOiAke3N2fWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIE5vdCB1c2luZyBgaW5zdGFuY2VvZiBTY2hlbWFgIHRvIGFsbG93IGZvciBkdWNrIHR5cGluZ1xuICAgICAgICBpZiAob3B0aW9ucy5zY2hlbWEgaW5zdGFuY2VvZiBPYmplY3QpXG4gICAgICAgICAgICB0aGlzLnNjaGVtYSA9IG9wdGlvbnMuc2NoZW1hO1xuICAgICAgICBlbHNlIGlmIChvcHQpXG4gICAgICAgICAgICB0aGlzLnNjaGVtYSA9IG5ldyBTY2hlbWEuU2NoZW1hKE9iamVjdC5hc3NpZ24ob3B0LCBvcHRpb25zKSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgV2l0aCBhIG51bGwgWUFNTCB2ZXJzaW9uLCB0aGUgeyBzY2hlbWE6IFNjaGVtYSB9IG9wdGlvbiBpcyByZXF1aXJlZGApO1xuICAgIH1cbiAgICAvLyBqc29uICYganNvbkFyZyBhcmUgb25seSB1c2VkIGZyb20gdG9KU09OKClcbiAgICB0b0pTKHsganNvbiwganNvbkFyZywgbWFwQXNNYXAsIG1heEFsaWFzQ291bnQsIG9uQW5jaG9yLCByZXZpdmVyIH0gPSB7fSkge1xuICAgICAgICBjb25zdCBjdHggPSB7XG4gICAgICAgICAgICBhbmNob3JzOiBuZXcgTWFwKCksXG4gICAgICAgICAgICBkb2M6IHRoaXMsXG4gICAgICAgICAgICBrZWVwOiAhanNvbixcbiAgICAgICAgICAgIG1hcEFzTWFwOiBtYXBBc01hcCA9PT0gdHJ1ZSxcbiAgICAgICAgICAgIG1hcEtleVdhcm5lZDogZmFsc2UsXG4gICAgICAgICAgICBtYXhBbGlhc0NvdW50OiB0eXBlb2YgbWF4QWxpYXNDb3VudCA9PT0gJ251bWJlcicgPyBtYXhBbGlhc0NvdW50IDogMTAwXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHJlcyA9IHRvSlMudG9KUyh0aGlzLmNvbnRlbnRzLCBqc29uQXJnID8/ICcnLCBjdHgpO1xuICAgICAgICBpZiAodHlwZW9mIG9uQW5jaG9yID09PSAnZnVuY3Rpb24nKVxuICAgICAgICAgICAgZm9yIChjb25zdCB7IGNvdW50LCByZXMgfSBvZiBjdHguYW5jaG9ycy52YWx1ZXMoKSlcbiAgICAgICAgICAgICAgICBvbkFuY2hvcihyZXMsIGNvdW50KTtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiByZXZpdmVyID09PSAnZnVuY3Rpb24nXG4gICAgICAgICAgICA/IGFwcGx5UmV2aXZlci5hcHBseVJldml2ZXIocmV2aXZlciwgeyAnJzogcmVzIH0sICcnLCByZXMpXG4gICAgICAgICAgICA6IHJlcztcbiAgICB9XG4gICAgLyoqXG4gICAgICogQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBkb2N1bWVudCBgY29udGVudHNgLlxuICAgICAqXG4gICAgICogQHBhcmFtIGpzb25BcmcgVXNlZCBieSBgSlNPTi5zdHJpbmdpZnlgIHRvIGluZGljYXRlIHRoZSBhcnJheSBpbmRleCBvclxuICAgICAqICAgcHJvcGVydHkgbmFtZS5cbiAgICAgKi9cbiAgICB0b0pTT04oanNvbkFyZywgb25BbmNob3IpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudG9KUyh7IGpzb246IHRydWUsIGpzb25BcmcsIG1hcEFzTWFwOiBmYWxzZSwgb25BbmNob3IgfSk7XG4gICAgfVxuICAgIC8qKiBBIFlBTUwgcmVwcmVzZW50YXRpb24gb2YgdGhlIGRvY3VtZW50LiAqL1xuICAgIHRvU3RyaW5nKG9wdGlvbnMgPSB7fSkge1xuICAgICAgICBpZiAodGhpcy5lcnJvcnMubGVuZ3RoID4gMClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRG9jdW1lbnQgd2l0aCBlcnJvcnMgY2Fubm90IGJlIHN0cmluZ2lmaWVkJyk7XG4gICAgICAgIGlmICgnaW5kZW50JyBpbiBvcHRpb25zICYmXG4gICAgICAgICAgICAoIU51bWJlci5pc0ludGVnZXIob3B0aW9ucy5pbmRlbnQpIHx8IE51bWJlcihvcHRpb25zLmluZGVudCkgPD0gMCkpIHtcbiAgICAgICAgICAgIGNvbnN0IHMgPSBKU09OLnN0cmluZ2lmeShvcHRpb25zLmluZGVudCk7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFwiaW5kZW50XCIgb3B0aW9uIG11c3QgYmUgYSBwb3NpdGl2ZSBpbnRlZ2VyLCBub3QgJHtzfWApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdHJpbmdpZnlEb2N1bWVudC5zdHJpbmdpZnlEb2N1bWVudCh0aGlzLCBvcHRpb25zKTtcbiAgICB9XG59XG5mdW5jdGlvbiBhc3NlcnRDb2xsZWN0aW9uKGNvbnRlbnRzKSB7XG4gICAgaWYgKGlkZW50aXR5LmlzQ29sbGVjdGlvbihjb250ZW50cykpXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIHRocm93IG5ldyBFcnJvcignRXhwZWN0ZWQgYSBZQU1MIGNvbGxlY3Rpb24gYXMgZG9jdW1lbnQgY29udGVudHMnKTtcbn1cblxuZXhwb3J0cy5Eb2N1bWVudCA9IERvY3VtZW50O1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbmNsYXNzIFlBTUxFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBwb3MsIGNvZGUsIG1lc3NhZ2UpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgdGhpcy5jb2RlID0gY29kZTtcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICAgICAgdGhpcy5wb3MgPSBwb3M7XG4gICAgfVxufVxuY2xhc3MgWUFNTFBhcnNlRXJyb3IgZXh0ZW5kcyBZQU1MRXJyb3Ige1xuICAgIGNvbnN0cnVjdG9yKHBvcywgY29kZSwgbWVzc2FnZSkge1xuICAgICAgICBzdXBlcignWUFNTFBhcnNlRXJyb3InLCBwb3MsIGNvZGUsIG1lc3NhZ2UpO1xuICAgIH1cbn1cbmNsYXNzIFlBTUxXYXJuaW5nIGV4dGVuZHMgWUFNTEVycm9yIHtcbiAgICBjb25zdHJ1Y3Rvcihwb3MsIGNvZGUsIG1lc3NhZ2UpIHtcbiAgICAgICAgc3VwZXIoJ1lBTUxXYXJuaW5nJywgcG9zLCBjb2RlLCBtZXNzYWdlKTtcbiAgICB9XG59XG5jb25zdCBwcmV0dGlmeUVycm9yID0gKHNyYywgbGMpID0+IChlcnJvcikgPT4ge1xuICAgIGlmIChlcnJvci5wb3NbMF0gPT09IC0xKVxuICAgICAgICByZXR1cm47XG4gICAgZXJyb3IubGluZVBvcyA9IGVycm9yLnBvcy5tYXAocG9zID0+IGxjLmxpbmVQb3MocG9zKSk7XG4gICAgY29uc3QgeyBsaW5lLCBjb2wgfSA9IGVycm9yLmxpbmVQb3NbMF07XG4gICAgZXJyb3IubWVzc2FnZSArPSBgIGF0IGxpbmUgJHtsaW5lfSwgY29sdW1uICR7Y29sfWA7XG4gICAgbGV0IGNpID0gY29sIC0gMTtcbiAgICBsZXQgbGluZVN0ciA9IHNyY1xuICAgICAgICAuc3Vic3RyaW5nKGxjLmxpbmVTdGFydHNbbGluZSAtIDFdLCBsYy5saW5lU3RhcnRzW2xpbmVdKVxuICAgICAgICAucmVwbGFjZSgvW1xcblxccl0rJC8sICcnKTtcbiAgICAvLyBUcmltIHRvIG1heCA4MCBjaGFycywga2VlcGluZyBjb2wgcG9zaXRpb24gbmVhciB0aGUgbWlkZGxlXG4gICAgaWYgKGNpID49IDYwICYmIGxpbmVTdHIubGVuZ3RoID4gODApIHtcbiAgICAgICAgY29uc3QgdHJpbVN0YXJ0ID0gTWF0aC5taW4oY2kgLSAzOSwgbGluZVN0ci5sZW5ndGggLSA3OSk7XG4gICAgICAgIGxpbmVTdHIgPSAn4oCmJyArIGxpbmVTdHIuc3Vic3RyaW5nKHRyaW1TdGFydCk7XG4gICAgICAgIGNpIC09IHRyaW1TdGFydCAtIDE7XG4gICAgfVxuICAgIGlmIChsaW5lU3RyLmxlbmd0aCA+IDgwKVxuICAgICAgICBsaW5lU3RyID0gbGluZVN0ci5zdWJzdHJpbmcoMCwgNzkpICsgJ+KApic7XG4gICAgLy8gSW5jbHVkZSBwcmV2aW91cyBsaW5lIGluIGNvbnRleHQgaWYgcG9pbnRpbmcgYXQgbGluZSBzdGFydFxuICAgIGlmIChsaW5lID4gMSAmJiAvXiAqJC8udGVzdChsaW5lU3RyLnN1YnN0cmluZygwLCBjaSkpKSB7XG4gICAgICAgIC8vIFJlZ2V4cCB3b24ndCBtYXRjaCBpZiBzdGFydCBpcyB0cmltbWVkXG4gICAgICAgIGxldCBwcmV2ID0gc3JjLnN1YnN0cmluZyhsYy5saW5lU3RhcnRzW2xpbmUgLSAyXSwgbGMubGluZVN0YXJ0c1tsaW5lIC0gMV0pO1xuICAgICAgICBpZiAocHJldi5sZW5ndGggPiA4MClcbiAgICAgICAgICAgIHByZXYgPSBwcmV2LnN1YnN0cmluZygwLCA3OSkgKyAn4oCmXFxuJztcbiAgICAgICAgbGluZVN0ciA9IHByZXYgKyBsaW5lU3RyO1xuICAgIH1cbiAgICBpZiAoL1teIF0vLnRlc3QobGluZVN0cikpIHtcbiAgICAgICAgbGV0IGNvdW50ID0gMTtcbiAgICAgICAgY29uc3QgZW5kID0gZXJyb3IubGluZVBvc1sxXTtcbiAgICAgICAgaWYgKGVuZD8ubGluZSA9PT0gbGluZSAmJiBlbmQuY29sID4gY29sKSB7XG4gICAgICAgICAgICBjb3VudCA9IE1hdGgubWF4KDEsIE1hdGgubWluKGVuZC5jb2wgLSBjb2wsIDgwIC0gY2kpKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwb2ludGVyID0gJyAnLnJlcGVhdChjaSkgKyAnXicucmVwZWF0KGNvdW50KTtcbiAgICAgICAgZXJyb3IubWVzc2FnZSArPSBgOlxcblxcbiR7bGluZVN0cn1cXG4ke3BvaW50ZXJ9XFxuYDtcbiAgICB9XG59O1xuXG5leHBvcnRzLllBTUxFcnJvciA9IFlBTUxFcnJvcjtcbmV4cG9ydHMuWUFNTFBhcnNlRXJyb3IgPSBZQU1MUGFyc2VFcnJvcjtcbmV4cG9ydHMuWUFNTFdhcm5pbmcgPSBZQU1MV2FybmluZztcbmV4cG9ydHMucHJldHRpZnlFcnJvciA9IHByZXR0aWZ5RXJyb3I7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gcmVzb2x2ZVByb3BzKHRva2VucywgeyBmbG93LCBpbmRpY2F0b3IsIG5leHQsIG9mZnNldCwgb25FcnJvciwgcGFyZW50SW5kZW50LCBzdGFydE9uTmV3bGluZSB9KSB7XG4gICAgbGV0IHNwYWNlQmVmb3JlID0gZmFsc2U7XG4gICAgbGV0IGF0TmV3bGluZSA9IHN0YXJ0T25OZXdsaW5lO1xuICAgIGxldCBoYXNTcGFjZSA9IHN0YXJ0T25OZXdsaW5lO1xuICAgIGxldCBjb21tZW50ID0gJyc7XG4gICAgbGV0IGNvbW1lbnRTZXAgPSAnJztcbiAgICBsZXQgaGFzTmV3bGluZSA9IGZhbHNlO1xuICAgIGxldCByZXFTcGFjZSA9IGZhbHNlO1xuICAgIGxldCB0YWIgPSBudWxsO1xuICAgIGxldCBhbmNob3IgPSBudWxsO1xuICAgIGxldCB0YWcgPSBudWxsO1xuICAgIGxldCBuZXdsaW5lQWZ0ZXJQcm9wID0gbnVsbDtcbiAgICBsZXQgY29tbWEgPSBudWxsO1xuICAgIGxldCBmb3VuZCA9IG51bGw7XG4gICAgbGV0IHN0YXJ0ID0gbnVsbDtcbiAgICBmb3IgKGNvbnN0IHRva2VuIG9mIHRva2Vucykge1xuICAgICAgICBpZiAocmVxU3BhY2UpIHtcbiAgICAgICAgICAgIGlmICh0b2tlbi50eXBlICE9PSAnc3BhY2UnICYmXG4gICAgICAgICAgICAgICAgdG9rZW4udHlwZSAhPT0gJ25ld2xpbmUnICYmXG4gICAgICAgICAgICAgICAgdG9rZW4udHlwZSAhPT0gJ2NvbW1hJylcbiAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLm9mZnNldCwgJ01JU1NJTkdfQ0hBUicsICdUYWdzIGFuZCBhbmNob3JzIG11c3QgYmUgc2VwYXJhdGVkIGZyb20gdGhlIG5leHQgdG9rZW4gYnkgd2hpdGUgc3BhY2UnKTtcbiAgICAgICAgICAgIHJlcVNwYWNlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRhYikge1xuICAgICAgICAgICAgaWYgKGF0TmV3bGluZSAmJiB0b2tlbi50eXBlICE9PSAnY29tbWVudCcgJiYgdG9rZW4udHlwZSAhPT0gJ25ld2xpbmUnKSB7XG4gICAgICAgICAgICAgICAgb25FcnJvcih0YWIsICdUQUJfQVNfSU5ERU5UJywgJ1RhYnMgYXJlIG5vdCBhbGxvd2VkIGFzIGluZGVudGF0aW9uJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0YWIgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHN3aXRjaCAodG9rZW4udHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgICAgIC8vIEF0IHRoZSBkb2MgbGV2ZWwsIHRhYnMgYXQgbGluZSBzdGFydCBtYXkgYmUgcGFyc2VkXG4gICAgICAgICAgICAgICAgLy8gYXMgbGVhZGluZyB3aGl0ZSBzcGFjZSByYXRoZXIgdGhhbiBpbmRlbnRhdGlvbi5cbiAgICAgICAgICAgICAgICAvLyBJbiBhIGZsb3cgY29sbGVjdGlvbiwgb25seSB0aGUgcGFyc2VyIGhhbmRsZXMgaW5kZW50LlxuICAgICAgICAgICAgICAgIGlmICghZmxvdyAmJlxuICAgICAgICAgICAgICAgICAgICAoaW5kaWNhdG9yICE9PSAnZG9jLXN0YXJ0JyB8fCBuZXh0Py50eXBlICE9PSAnZmxvdy1jb2xsZWN0aW9uJykgJiZcbiAgICAgICAgICAgICAgICAgICAgdG9rZW4uc291cmNlLmluY2x1ZGVzKCdcXHQnKSkge1xuICAgICAgICAgICAgICAgICAgICB0YWIgPSB0b2tlbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaGFzU3BhY2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6IHtcbiAgICAgICAgICAgICAgICBpZiAoIWhhc1NwYWNlKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnTUlTU0lOR19DSEFSJywgJ0NvbW1lbnRzIG11c3QgYmUgc2VwYXJhdGVkIGZyb20gb3RoZXIgdG9rZW5zIGJ5IHdoaXRlIHNwYWNlIGNoYXJhY3RlcnMnKTtcbiAgICAgICAgICAgICAgICBjb25zdCBjYiA9IHRva2VuLnNvdXJjZS5zdWJzdHJpbmcoMSkgfHwgJyAnO1xuICAgICAgICAgICAgICAgIGlmICghY29tbWVudClcbiAgICAgICAgICAgICAgICAgICAgY29tbWVudCA9IGNiO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgY29tbWVudCArPSBjb21tZW50U2VwICsgY2I7XG4gICAgICAgICAgICAgICAgY29tbWVudFNlcCA9ICcnO1xuICAgICAgICAgICAgICAgIGF0TmV3bGluZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgICAgaWYgKGF0TmV3bGluZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29tbWVudClcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1lbnQgKz0gdG9rZW4uc291cmNlO1xuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICghZm91bmQgfHwgaW5kaWNhdG9yICE9PSAnc2VxLWl0ZW0taW5kJylcbiAgICAgICAgICAgICAgICAgICAgICAgIHNwYWNlQmVmb3JlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBjb21tZW50U2VwICs9IHRva2VuLnNvdXJjZTtcbiAgICAgICAgICAgICAgICBhdE5ld2xpbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGhhc05ld2xpbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGlmIChhbmNob3IgfHwgdGFnKVxuICAgICAgICAgICAgICAgICAgICBuZXdsaW5lQWZ0ZXJQcm9wID0gdG9rZW47XG4gICAgICAgICAgICAgICAgaGFzU3BhY2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYW5jaG9yJzpcbiAgICAgICAgICAgICAgICBpZiAoYW5jaG9yKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnTVVMVElQTEVfQU5DSE9SUycsICdBIG5vZGUgY2FuIGhhdmUgYXQgbW9zdCBvbmUgYW5jaG9yJyk7XG4gICAgICAgICAgICAgICAgaWYgKHRva2VuLnNvdXJjZS5lbmRzV2l0aCgnOicpKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLm9mZnNldCArIHRva2VuLnNvdXJjZS5sZW5ndGggLSAxLCAnQkFEX0FMSUFTJywgJ0FuY2hvciBlbmRpbmcgaW4gOiBpcyBhbWJpZ3VvdXMnLCB0cnVlKTtcbiAgICAgICAgICAgICAgICBhbmNob3IgPSB0b2tlbjtcbiAgICAgICAgICAgICAgICBzdGFydCA/PyAoc3RhcnQgPSB0b2tlbi5vZmZzZXQpO1xuICAgICAgICAgICAgICAgIGF0TmV3bGluZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGhhc1NwYWNlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgcmVxU3BhY2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAndGFnJzoge1xuICAgICAgICAgICAgICAgIGlmICh0YWcpXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdNVUxUSVBMRV9UQUdTJywgJ0Egbm9kZSBjYW4gaGF2ZSBhdCBtb3N0IG9uZSB0YWcnKTtcbiAgICAgICAgICAgICAgICB0YWcgPSB0b2tlbjtcbiAgICAgICAgICAgICAgICBzdGFydCA/PyAoc3RhcnQgPSB0b2tlbi5vZmZzZXQpO1xuICAgICAgICAgICAgICAgIGF0TmV3bGluZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGhhc1NwYWNlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgcmVxU3BhY2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBpbmRpY2F0b3I6XG4gICAgICAgICAgICAgICAgLy8gQ291bGQgaGVyZSBoYW5kbGUgcHJlY2VkaW5nIGNvbW1lbnRzIGRpZmZlcmVudGx5XG4gICAgICAgICAgICAgICAgaWYgKGFuY2hvciB8fCB0YWcpXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdCQURfUFJPUF9PUkRFUicsIGBBbmNob3JzIGFuZCB0YWdzIG11c3QgYmUgYWZ0ZXIgdGhlICR7dG9rZW4uc291cmNlfSBpbmRpY2F0b3JgKTtcbiAgICAgICAgICAgICAgICBpZiAoZm91bmQpXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdVTkVYUEVDVEVEX1RPS0VOJywgYFVuZXhwZWN0ZWQgJHt0b2tlbi5zb3VyY2V9IGluICR7ZmxvdyA/PyAnY29sbGVjdGlvbid9YCk7XG4gICAgICAgICAgICAgICAgZm91bmQgPSB0b2tlbjtcbiAgICAgICAgICAgICAgICBhdE5ld2xpbmUgPVxuICAgICAgICAgICAgICAgICAgICBpbmRpY2F0b3IgPT09ICdzZXEtaXRlbS1pbmQnIHx8IGluZGljYXRvciA9PT0gJ2V4cGxpY2l0LWtleS1pbmQnO1xuICAgICAgICAgICAgICAgIGhhc1NwYWNlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdjb21tYSc6XG4gICAgICAgICAgICAgICAgaWYgKGZsb3cpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbW1hKVxuICAgICAgICAgICAgICAgICAgICAgICAgb25FcnJvcih0b2tlbiwgJ1VORVhQRUNURURfVE9LRU4nLCBgVW5leHBlY3RlZCAsIGluICR7Zmxvd31gKTtcbiAgICAgICAgICAgICAgICAgICAgY29tbWEgPSB0b2tlbjtcbiAgICAgICAgICAgICAgICAgICAgYXROZXdsaW5lID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGhhc1NwYWNlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGVsc2UgZmFsbHRocm91Z2hcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgb25FcnJvcih0b2tlbiwgJ1VORVhQRUNURURfVE9LRU4nLCBgVW5leHBlY3RlZCAke3Rva2VuLnR5cGV9IHRva2VuYCk7XG4gICAgICAgICAgICAgICAgYXROZXdsaW5lID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaGFzU3BhY2UgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBsYXN0ID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXTtcbiAgICBjb25zdCBlbmQgPSBsYXN0ID8gbGFzdC5vZmZzZXQgKyBsYXN0LnNvdXJjZS5sZW5ndGggOiBvZmZzZXQ7XG4gICAgaWYgKHJlcVNwYWNlICYmXG4gICAgICAgIG5leHQgJiZcbiAgICAgICAgbmV4dC50eXBlICE9PSAnc3BhY2UnICYmXG4gICAgICAgIG5leHQudHlwZSAhPT0gJ25ld2xpbmUnICYmXG4gICAgICAgIG5leHQudHlwZSAhPT0gJ2NvbW1hJyAmJlxuICAgICAgICAobmV4dC50eXBlICE9PSAnc2NhbGFyJyB8fCBuZXh0LnNvdXJjZSAhPT0gJycpKSB7XG4gICAgICAgIG9uRXJyb3IobmV4dC5vZmZzZXQsICdNSVNTSU5HX0NIQVInLCAnVGFncyBhbmQgYW5jaG9ycyBtdXN0IGJlIHNlcGFyYXRlZCBmcm9tIHRoZSBuZXh0IHRva2VuIGJ5IHdoaXRlIHNwYWNlJyk7XG4gICAgfVxuICAgIGlmICh0YWIgJiZcbiAgICAgICAgKChhdE5ld2xpbmUgJiYgdGFiLmluZGVudCA8PSBwYXJlbnRJbmRlbnQpIHx8XG4gICAgICAgICAgICBuZXh0Py50eXBlID09PSAnYmxvY2stbWFwJyB8fFxuICAgICAgICAgICAgbmV4dD8udHlwZSA9PT0gJ2Jsb2NrLXNlcScpKVxuICAgICAgICBvbkVycm9yKHRhYiwgJ1RBQl9BU19JTkRFTlQnLCAnVGFicyBhcmUgbm90IGFsbG93ZWQgYXMgaW5kZW50YXRpb24nKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb21tYSxcbiAgICAgICAgZm91bmQsXG4gICAgICAgIHNwYWNlQmVmb3JlLFxuICAgICAgICBjb21tZW50LFxuICAgICAgICBoYXNOZXdsaW5lLFxuICAgICAgICBhbmNob3IsXG4gICAgICAgIHRhZyxcbiAgICAgICAgbmV3bGluZUFmdGVyUHJvcCxcbiAgICAgICAgZW5kLFxuICAgICAgICBzdGFydDogc3RhcnQgPz8gZW5kXG4gICAgfTtcbn1cblxuZXhwb3J0cy5yZXNvbHZlUHJvcHMgPSByZXNvbHZlUHJvcHM7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gY29udGFpbnNOZXdsaW5lKGtleSkge1xuICAgIGlmICgha2V5KVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICBzd2l0Y2ggKGtleS50eXBlKSB7XG4gICAgICAgIGNhc2UgJ2FsaWFzJzpcbiAgICAgICAgY2FzZSAnc2NhbGFyJzpcbiAgICAgICAgY2FzZSAnZG91YmxlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICBjYXNlICdzaW5nbGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgICAgICBpZiAoa2V5LnNvdXJjZS5pbmNsdWRlcygnXFxuJykpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICBpZiAoa2V5LmVuZClcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHN0IG9mIGtleS5lbmQpXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdC50eXBlID09PSAnbmV3bGluZScpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgY2FzZSAnZmxvdy1jb2xsZWN0aW9uJzpcbiAgICAgICAgICAgIGZvciAoY29uc3QgaXQgb2Yga2V5Lml0ZW1zKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBzdCBvZiBpdC5zdGFydClcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0LnR5cGUgPT09ICduZXdsaW5lJylcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIGlmIChpdC5zZXApXG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgc3Qgb2YgaXQuc2VwKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0LnR5cGUgPT09ICduZXdsaW5lJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpZiAoY29udGFpbnNOZXdsaW5lKGl0LmtleSkgfHwgY29udGFpbnNOZXdsaW5lKGl0LnZhbHVlKSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG59XG5cbmV4cG9ydHMuY29udGFpbnNOZXdsaW5lID0gY29udGFpbnNOZXdsaW5lO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlsQ29udGFpbnNOZXdsaW5lID0gcmVxdWlyZSgnLi91dGlsLWNvbnRhaW5zLW5ld2xpbmUuanMnKTtcblxuZnVuY3Rpb24gZmxvd0luZGVudENoZWNrKGluZGVudCwgZmMsIG9uRXJyb3IpIHtcbiAgICBpZiAoZmM/LnR5cGUgPT09ICdmbG93LWNvbGxlY3Rpb24nKSB7XG4gICAgICAgIGNvbnN0IGVuZCA9IGZjLmVuZFswXTtcbiAgICAgICAgaWYgKGVuZC5pbmRlbnQgPT09IGluZGVudCAmJlxuICAgICAgICAgICAgKGVuZC5zb3VyY2UgPT09ICddJyB8fCBlbmQuc291cmNlID09PSAnfScpICYmXG4gICAgICAgICAgICB1dGlsQ29udGFpbnNOZXdsaW5lLmNvbnRhaW5zTmV3bGluZShmYykpIHtcbiAgICAgICAgICAgIGNvbnN0IG1zZyA9ICdGbG93IGVuZCBpbmRpY2F0b3Igc2hvdWxkIGJlIG1vcmUgaW5kZW50ZWQgdGhhbiBwYXJlbnQnO1xuICAgICAgICAgICAgb25FcnJvcihlbmQsICdCQURfSU5ERU5UJywgbXNnLCB0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0cy5mbG93SW5kZW50Q2hlY2sgPSBmbG93SW5kZW50Q2hlY2s7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIGlkZW50aXR5ID0gcmVxdWlyZSgnLi4vbm9kZXMvaWRlbnRpdHkuanMnKTtcblxuZnVuY3Rpb24gbWFwSW5jbHVkZXMoY3R4LCBpdGVtcywgc2VhcmNoKSB7XG4gICAgY29uc3QgeyB1bmlxdWVLZXlzIH0gPSBjdHgub3B0aW9ucztcbiAgICBpZiAodW5pcXVlS2V5cyA9PT0gZmFsc2UpXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICBjb25zdCBpc0VxdWFsID0gdHlwZW9mIHVuaXF1ZUtleXMgPT09ICdmdW5jdGlvbidcbiAgICAgICAgPyB1bmlxdWVLZXlzXG4gICAgICAgIDogKGEsIGIpID0+IGEgPT09IGIgfHwgKGlkZW50aXR5LmlzU2NhbGFyKGEpICYmIGlkZW50aXR5LmlzU2NhbGFyKGIpICYmIGEudmFsdWUgPT09IGIudmFsdWUpO1xuICAgIHJldHVybiBpdGVtcy5zb21lKHBhaXIgPT4gaXNFcXVhbChwYWlyLmtleSwgc2VhcmNoKSk7XG59XG5cbmV4cG9ydHMubWFwSW5jbHVkZXMgPSBtYXBJbmNsdWRlcztcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgUGFpciA9IHJlcXVpcmUoJy4uL25vZGVzL1BhaXIuanMnKTtcbnZhciBZQU1MTWFwID0gcmVxdWlyZSgnLi4vbm9kZXMvWUFNTE1hcC5qcycpO1xudmFyIHJlc29sdmVQcm9wcyA9IHJlcXVpcmUoJy4vcmVzb2x2ZS1wcm9wcy5qcycpO1xudmFyIHV0aWxDb250YWluc05ld2xpbmUgPSByZXF1aXJlKCcuL3V0aWwtY29udGFpbnMtbmV3bGluZS5qcycpO1xudmFyIHV0aWxGbG93SW5kZW50Q2hlY2sgPSByZXF1aXJlKCcuL3V0aWwtZmxvdy1pbmRlbnQtY2hlY2suanMnKTtcbnZhciB1dGlsTWFwSW5jbHVkZXMgPSByZXF1aXJlKCcuL3V0aWwtbWFwLWluY2x1ZGVzLmpzJyk7XG5cbmNvbnN0IHN0YXJ0Q29sTXNnID0gJ0FsbCBtYXBwaW5nIGl0ZW1zIG11c3Qgc3RhcnQgYXQgdGhlIHNhbWUgY29sdW1uJztcbmZ1bmN0aW9uIHJlc29sdmVCbG9ja01hcCh7IGNvbXBvc2VOb2RlLCBjb21wb3NlRW1wdHlOb2RlIH0sIGN0eCwgYm0sIG9uRXJyb3IsIHRhZykge1xuICAgIGNvbnN0IE5vZGVDbGFzcyA9IHRhZz8ubm9kZUNsYXNzID8/IFlBTUxNYXAuWUFNTE1hcDtcbiAgICBjb25zdCBtYXAgPSBuZXcgTm9kZUNsYXNzKGN0eC5zY2hlbWEpO1xuICAgIGlmIChjdHguYXRSb290KVxuICAgICAgICBjdHguYXRSb290ID0gZmFsc2U7XG4gICAgbGV0IG9mZnNldCA9IGJtLm9mZnNldDtcbiAgICBsZXQgY29tbWVudEVuZCA9IG51bGw7XG4gICAgZm9yIChjb25zdCBjb2xsSXRlbSBvZiBibS5pdGVtcykge1xuICAgICAgICBjb25zdCB7IHN0YXJ0LCBrZXksIHNlcCwgdmFsdWUgfSA9IGNvbGxJdGVtO1xuICAgICAgICAvLyBrZXkgcHJvcGVydGllc1xuICAgICAgICBjb25zdCBrZXlQcm9wcyA9IHJlc29sdmVQcm9wcy5yZXNvbHZlUHJvcHMoc3RhcnQsIHtcbiAgICAgICAgICAgIGluZGljYXRvcjogJ2V4cGxpY2l0LWtleS1pbmQnLFxuICAgICAgICAgICAgbmV4dDoga2V5ID8/IHNlcD8uWzBdLFxuICAgICAgICAgICAgb2Zmc2V0LFxuICAgICAgICAgICAgb25FcnJvcixcbiAgICAgICAgICAgIHBhcmVudEluZGVudDogYm0uaW5kZW50LFxuICAgICAgICAgICAgc3RhcnRPbk5ld2xpbmU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGltcGxpY2l0S2V5ID0gIWtleVByb3BzLmZvdW5kO1xuICAgICAgICBpZiAoaW1wbGljaXRLZXkpIHtcbiAgICAgICAgICAgIGlmIChrZXkpIHtcbiAgICAgICAgICAgICAgICBpZiAoa2V5LnR5cGUgPT09ICdibG9jay1zZXEnKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKG9mZnNldCwgJ0JMT0NLX0FTX0lNUExJQ0lUX0tFWScsICdBIGJsb2NrIHNlcXVlbmNlIG1heSBub3QgYmUgdXNlZCBhcyBhbiBpbXBsaWNpdCBtYXAga2V5Jyk7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoJ2luZGVudCcgaW4ga2V5ICYmIGtleS5pbmRlbnQgIT09IGJtLmluZGVudClcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcihvZmZzZXQsICdCQURfSU5ERU5UJywgc3RhcnRDb2xNc2cpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFrZXlQcm9wcy5hbmNob3IgJiYgIWtleVByb3BzLnRhZyAmJiAhc2VwKSB7XG4gICAgICAgICAgICAgICAgY29tbWVudEVuZCA9IGtleVByb3BzLmVuZDtcbiAgICAgICAgICAgICAgICBpZiAoa2V5UHJvcHMuY29tbWVudCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobWFwLmNvbW1lbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXAuY29tbWVudCArPSAnXFxuJyArIGtleVByb3BzLmNvbW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5jb21tZW50ID0ga2V5UHJvcHMuY29tbWVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoa2V5UHJvcHMubmV3bGluZUFmdGVyUHJvcCB8fCB1dGlsQ29udGFpbnNOZXdsaW5lLmNvbnRhaW5zTmV3bGluZShrZXkpKSB7XG4gICAgICAgICAgICAgICAgb25FcnJvcihrZXkgPz8gc3RhcnRbc3RhcnQubGVuZ3RoIC0gMV0sICdNVUxUSUxJTkVfSU1QTElDSVRfS0VZJywgJ0ltcGxpY2l0IGtleXMgbmVlZCB0byBiZSBvbiBhIHNpbmdsZSBsaW5lJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoa2V5UHJvcHMuZm91bmQ/LmluZGVudCAhPT0gYm0uaW5kZW50KSB7XG4gICAgICAgICAgICBvbkVycm9yKG9mZnNldCwgJ0JBRF9JTkRFTlQnLCBzdGFydENvbE1zZyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8ga2V5IHZhbHVlXG4gICAgICAgIGN0eC5hdEtleSA9IHRydWU7XG4gICAgICAgIGNvbnN0IGtleVN0YXJ0ID0ga2V5UHJvcHMuZW5kO1xuICAgICAgICBjb25zdCBrZXlOb2RlID0ga2V5XG4gICAgICAgICAgICA/IGNvbXBvc2VOb2RlKGN0eCwga2V5LCBrZXlQcm9wcywgb25FcnJvcilcbiAgICAgICAgICAgIDogY29tcG9zZUVtcHR5Tm9kZShjdHgsIGtleVN0YXJ0LCBzdGFydCwgbnVsbCwga2V5UHJvcHMsIG9uRXJyb3IpO1xuICAgICAgICBpZiAoY3R4LnNjaGVtYS5jb21wYXQpXG4gICAgICAgICAgICB1dGlsRmxvd0luZGVudENoZWNrLmZsb3dJbmRlbnRDaGVjayhibS5pbmRlbnQsIGtleSwgb25FcnJvcik7XG4gICAgICAgIGN0eC5hdEtleSA9IGZhbHNlO1xuICAgICAgICBpZiAodXRpbE1hcEluY2x1ZGVzLm1hcEluY2x1ZGVzKGN0eCwgbWFwLml0ZW1zLCBrZXlOb2RlKSlcbiAgICAgICAgICAgIG9uRXJyb3Ioa2V5U3RhcnQsICdEVVBMSUNBVEVfS0VZJywgJ01hcCBrZXlzIG11c3QgYmUgdW5pcXVlJyk7XG4gICAgICAgIC8vIHZhbHVlIHByb3BlcnRpZXNcbiAgICAgICAgY29uc3QgdmFsdWVQcm9wcyA9IHJlc29sdmVQcm9wcy5yZXNvbHZlUHJvcHMoc2VwID8/IFtdLCB7XG4gICAgICAgICAgICBpbmRpY2F0b3I6ICdtYXAtdmFsdWUtaW5kJyxcbiAgICAgICAgICAgIG5leHQ6IHZhbHVlLFxuICAgICAgICAgICAgb2Zmc2V0OiBrZXlOb2RlLnJhbmdlWzJdLFxuICAgICAgICAgICAgb25FcnJvcixcbiAgICAgICAgICAgIHBhcmVudEluZGVudDogYm0uaW5kZW50LFxuICAgICAgICAgICAgc3RhcnRPbk5ld2xpbmU6ICFrZXkgfHwga2V5LnR5cGUgPT09ICdibG9jay1zY2FsYXInXG4gICAgICAgIH0pO1xuICAgICAgICBvZmZzZXQgPSB2YWx1ZVByb3BzLmVuZDtcbiAgICAgICAgaWYgKHZhbHVlUHJvcHMuZm91bmQpIHtcbiAgICAgICAgICAgIGlmIChpbXBsaWNpdEtleSkge1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZT8udHlwZSA9PT0gJ2Jsb2NrLW1hcCcgJiYgIXZhbHVlUHJvcHMuaGFzTmV3bGluZSlcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcihvZmZzZXQsICdCTE9DS19BU19JTVBMSUNJVF9LRVknLCAnTmVzdGVkIG1hcHBpbmdzIGFyZSBub3QgYWxsb3dlZCBpbiBjb21wYWN0IG1hcHBpbmdzJyk7XG4gICAgICAgICAgICAgICAgaWYgKGN0eC5vcHRpb25zLnN0cmljdCAmJlxuICAgICAgICAgICAgICAgICAgICBrZXlQcm9wcy5zdGFydCA8IHZhbHVlUHJvcHMuZm91bmQub2Zmc2V0IC0gMTAyNClcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcihrZXlOb2RlLnJhbmdlLCAnS0VZX09WRVJfMTAyNF9DSEFSUycsICdUaGUgOiBpbmRpY2F0b3IgbXVzdCBiZSBhdCBtb3N0IDEwMjQgY2hhcnMgYWZ0ZXIgdGhlIHN0YXJ0IG9mIGFuIGltcGxpY2l0IGJsb2NrIG1hcHBpbmcga2V5Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyB2YWx1ZSB2YWx1ZVxuICAgICAgICAgICAgY29uc3QgdmFsdWVOb2RlID0gdmFsdWVcbiAgICAgICAgICAgICAgICA/IGNvbXBvc2VOb2RlKGN0eCwgdmFsdWUsIHZhbHVlUHJvcHMsIG9uRXJyb3IpXG4gICAgICAgICAgICAgICAgOiBjb21wb3NlRW1wdHlOb2RlKGN0eCwgb2Zmc2V0LCBzZXAsIG51bGwsIHZhbHVlUHJvcHMsIG9uRXJyb3IpO1xuICAgICAgICAgICAgaWYgKGN0eC5zY2hlbWEuY29tcGF0KVxuICAgICAgICAgICAgICAgIHV0aWxGbG93SW5kZW50Q2hlY2suZmxvd0luZGVudENoZWNrKGJtLmluZGVudCwgdmFsdWUsIG9uRXJyb3IpO1xuICAgICAgICAgICAgb2Zmc2V0ID0gdmFsdWVOb2RlLnJhbmdlWzJdO1xuICAgICAgICAgICAgY29uc3QgcGFpciA9IG5ldyBQYWlyLlBhaXIoa2V5Tm9kZSwgdmFsdWVOb2RlKTtcbiAgICAgICAgICAgIGlmIChjdHgub3B0aW9ucy5rZWVwU291cmNlVG9rZW5zKVxuICAgICAgICAgICAgICAgIHBhaXIuc3JjVG9rZW4gPSBjb2xsSXRlbTtcbiAgICAgICAgICAgIG1hcC5pdGVtcy5wdXNoKHBhaXIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8ga2V5IHdpdGggbm8gdmFsdWVcbiAgICAgICAgICAgIGlmIChpbXBsaWNpdEtleSlcbiAgICAgICAgICAgICAgICBvbkVycm9yKGtleU5vZGUucmFuZ2UsICdNSVNTSU5HX0NIQVInLCAnSW1wbGljaXQgbWFwIGtleXMgbmVlZCB0byBiZSBmb2xsb3dlZCBieSBtYXAgdmFsdWVzJyk7XG4gICAgICAgICAgICBpZiAodmFsdWVQcm9wcy5jb21tZW50KSB7XG4gICAgICAgICAgICAgICAgaWYgKGtleU5vZGUuY29tbWVudClcbiAgICAgICAgICAgICAgICAgICAga2V5Tm9kZS5jb21tZW50ICs9ICdcXG4nICsgdmFsdWVQcm9wcy5jb21tZW50O1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAga2V5Tm9kZS5jb21tZW50ID0gdmFsdWVQcm9wcy5jb21tZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcGFpciA9IG5ldyBQYWlyLlBhaXIoa2V5Tm9kZSk7XG4gICAgICAgICAgICBpZiAoY3R4Lm9wdGlvbnMua2VlcFNvdXJjZVRva2VucylcbiAgICAgICAgICAgICAgICBwYWlyLnNyY1Rva2VuID0gY29sbEl0ZW07XG4gICAgICAgICAgICBtYXAuaXRlbXMucHVzaChwYWlyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoY29tbWVudEVuZCAmJiBjb21tZW50RW5kIDwgb2Zmc2V0KVxuICAgICAgICBvbkVycm9yKGNvbW1lbnRFbmQsICdJTVBPU1NJQkxFJywgJ01hcCBjb21tZW50IHdpdGggdHJhaWxpbmcgY29udGVudCcpO1xuICAgIG1hcC5yYW5nZSA9IFtibS5vZmZzZXQsIG9mZnNldCwgY29tbWVudEVuZCA/PyBvZmZzZXRdO1xuICAgIHJldHVybiBtYXA7XG59XG5cbmV4cG9ydHMucmVzb2x2ZUJsb2NrTWFwID0gcmVzb2x2ZUJsb2NrTWFwO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBZQU1MU2VxID0gcmVxdWlyZSgnLi4vbm9kZXMvWUFNTFNlcS5qcycpO1xudmFyIHJlc29sdmVQcm9wcyA9IHJlcXVpcmUoJy4vcmVzb2x2ZS1wcm9wcy5qcycpO1xudmFyIHV0aWxGbG93SW5kZW50Q2hlY2sgPSByZXF1aXJlKCcuL3V0aWwtZmxvdy1pbmRlbnQtY2hlY2suanMnKTtcblxuZnVuY3Rpb24gcmVzb2x2ZUJsb2NrU2VxKHsgY29tcG9zZU5vZGUsIGNvbXBvc2VFbXB0eU5vZGUgfSwgY3R4LCBicywgb25FcnJvciwgdGFnKSB7XG4gICAgY29uc3QgTm9kZUNsYXNzID0gdGFnPy5ub2RlQ2xhc3MgPz8gWUFNTFNlcS5ZQU1MU2VxO1xuICAgIGNvbnN0IHNlcSA9IG5ldyBOb2RlQ2xhc3MoY3R4LnNjaGVtYSk7XG4gICAgaWYgKGN0eC5hdFJvb3QpXG4gICAgICAgIGN0eC5hdFJvb3QgPSBmYWxzZTtcbiAgICBpZiAoY3R4LmF0S2V5KVxuICAgICAgICBjdHguYXRLZXkgPSBmYWxzZTtcbiAgICBsZXQgb2Zmc2V0ID0gYnMub2Zmc2V0O1xuICAgIGxldCBjb21tZW50RW5kID0gbnVsbDtcbiAgICBmb3IgKGNvbnN0IHsgc3RhcnQsIHZhbHVlIH0gb2YgYnMuaXRlbXMpIHtcbiAgICAgICAgY29uc3QgcHJvcHMgPSByZXNvbHZlUHJvcHMucmVzb2x2ZVByb3BzKHN0YXJ0LCB7XG4gICAgICAgICAgICBpbmRpY2F0b3I6ICdzZXEtaXRlbS1pbmQnLFxuICAgICAgICAgICAgbmV4dDogdmFsdWUsXG4gICAgICAgICAgICBvZmZzZXQsXG4gICAgICAgICAgICBvbkVycm9yLFxuICAgICAgICAgICAgcGFyZW50SW5kZW50OiBicy5pbmRlbnQsXG4gICAgICAgICAgICBzdGFydE9uTmV3bGluZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCFwcm9wcy5mb3VuZCkge1xuICAgICAgICAgICAgaWYgKHByb3BzLmFuY2hvciB8fCBwcm9wcy50YWcgfHwgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZiAodmFsdWU/LnR5cGUgPT09ICdibG9jay1zZXEnKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHByb3BzLmVuZCwgJ0JBRF9JTkRFTlQnLCAnQWxsIHNlcXVlbmNlIGl0ZW1zIG11c3Qgc3RhcnQgYXQgdGhlIHNhbWUgY29sdW1uJyk7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKG9mZnNldCwgJ01JU1NJTkdfQ0hBUicsICdTZXF1ZW5jZSBpdGVtIHdpdGhvdXQgLSBpbmRpY2F0b3InKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbW1lbnRFbmQgPSBwcm9wcy5lbmQ7XG4gICAgICAgICAgICAgICAgaWYgKHByb3BzLmNvbW1lbnQpXG4gICAgICAgICAgICAgICAgICAgIHNlcS5jb21tZW50ID0gcHJvcHMuY29tbWVudDtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBub2RlID0gdmFsdWVcbiAgICAgICAgICAgID8gY29tcG9zZU5vZGUoY3R4LCB2YWx1ZSwgcHJvcHMsIG9uRXJyb3IpXG4gICAgICAgICAgICA6IGNvbXBvc2VFbXB0eU5vZGUoY3R4LCBwcm9wcy5lbmQsIHN0YXJ0LCBudWxsLCBwcm9wcywgb25FcnJvcik7XG4gICAgICAgIGlmIChjdHguc2NoZW1hLmNvbXBhdClcbiAgICAgICAgICAgIHV0aWxGbG93SW5kZW50Q2hlY2suZmxvd0luZGVudENoZWNrKGJzLmluZGVudCwgdmFsdWUsIG9uRXJyb3IpO1xuICAgICAgICBvZmZzZXQgPSBub2RlLnJhbmdlWzJdO1xuICAgICAgICBzZXEuaXRlbXMucHVzaChub2RlKTtcbiAgICB9XG4gICAgc2VxLnJhbmdlID0gW2JzLm9mZnNldCwgb2Zmc2V0LCBjb21tZW50RW5kID8/IG9mZnNldF07XG4gICAgcmV0dXJuIHNlcTtcbn1cblxuZXhwb3J0cy5yZXNvbHZlQmxvY2tTZXEgPSByZXNvbHZlQmxvY2tTZXE7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gcmVzb2x2ZUVuZChlbmQsIG9mZnNldCwgcmVxU3BhY2UsIG9uRXJyb3IpIHtcbiAgICBsZXQgY29tbWVudCA9ICcnO1xuICAgIGlmIChlbmQpIHtcbiAgICAgICAgbGV0IGhhc1NwYWNlID0gZmFsc2U7XG4gICAgICAgIGxldCBzZXAgPSAnJztcbiAgICAgICAgZm9yIChjb25zdCB0b2tlbiBvZiBlbmQpIHtcbiAgICAgICAgICAgIGNvbnN0IHsgc291cmNlLCB0eXBlIH0gPSB0b2tlbjtcbiAgICAgICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcbiAgICAgICAgICAgICAgICAgICAgaGFzU3BhY2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdjb21tZW50Jzoge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVxU3BhY2UgJiYgIWhhc1NwYWNlKVxuICAgICAgICAgICAgICAgICAgICAgICAgb25FcnJvcih0b2tlbiwgJ01JU1NJTkdfQ0hBUicsICdDb21tZW50cyBtdXN0IGJlIHNlcGFyYXRlZCBmcm9tIG90aGVyIHRva2VucyBieSB3aGl0ZSBzcGFjZSBjaGFyYWN0ZXJzJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNiID0gc291cmNlLnN1YnN0cmluZygxKSB8fCAnICc7XG4gICAgICAgICAgICAgICAgICAgIGlmICghY29tbWVudClcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1lbnQgPSBjYjtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgY29tbWVudCArPSBzZXAgKyBjYjtcbiAgICAgICAgICAgICAgICAgICAgc2VwID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbW1lbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXAgKz0gc291cmNlO1xuICAgICAgICAgICAgICAgICAgICBoYXNTcGFjZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdVTkVYUEVDVEVEX1RPS0VOJywgYFVuZXhwZWN0ZWQgJHt0eXBlfSBhdCBub2RlIGVuZGApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb2Zmc2V0ICs9IHNvdXJjZS5sZW5ndGg7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHsgY29tbWVudCwgb2Zmc2V0IH07XG59XG5cbmV4cG9ydHMucmVzb2x2ZUVuZCA9IHJlc29sdmVFbmQ7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIGlkZW50aXR5ID0gcmVxdWlyZSgnLi4vbm9kZXMvaWRlbnRpdHkuanMnKTtcbnZhciBQYWlyID0gcmVxdWlyZSgnLi4vbm9kZXMvUGFpci5qcycpO1xudmFyIFlBTUxNYXAgPSByZXF1aXJlKCcuLi9ub2Rlcy9ZQU1MTWFwLmpzJyk7XG52YXIgWUFNTFNlcSA9IHJlcXVpcmUoJy4uL25vZGVzL1lBTUxTZXEuanMnKTtcbnZhciByZXNvbHZlRW5kID0gcmVxdWlyZSgnLi9yZXNvbHZlLWVuZC5qcycpO1xudmFyIHJlc29sdmVQcm9wcyA9IHJlcXVpcmUoJy4vcmVzb2x2ZS1wcm9wcy5qcycpO1xudmFyIHV0aWxDb250YWluc05ld2xpbmUgPSByZXF1aXJlKCcuL3V0aWwtY29udGFpbnMtbmV3bGluZS5qcycpO1xudmFyIHV0aWxNYXBJbmNsdWRlcyA9IHJlcXVpcmUoJy4vdXRpbC1tYXAtaW5jbHVkZXMuanMnKTtcblxuY29uc3QgYmxvY2tNc2cgPSAnQmxvY2sgY29sbGVjdGlvbnMgYXJlIG5vdCBhbGxvd2VkIHdpdGhpbiBmbG93IGNvbGxlY3Rpb25zJztcbmNvbnN0IGlzQmxvY2sgPSAodG9rZW4pID0+IHRva2VuICYmICh0b2tlbi50eXBlID09PSAnYmxvY2stbWFwJyB8fCB0b2tlbi50eXBlID09PSAnYmxvY2stc2VxJyk7XG5mdW5jdGlvbiByZXNvbHZlRmxvd0NvbGxlY3Rpb24oeyBjb21wb3NlTm9kZSwgY29tcG9zZUVtcHR5Tm9kZSB9LCBjdHgsIGZjLCBvbkVycm9yLCB0YWcpIHtcbiAgICBjb25zdCBpc01hcCA9IGZjLnN0YXJ0LnNvdXJjZSA9PT0gJ3snO1xuICAgIGNvbnN0IGZjTmFtZSA9IGlzTWFwID8gJ2Zsb3cgbWFwJyA6ICdmbG93IHNlcXVlbmNlJztcbiAgICBjb25zdCBOb2RlQ2xhc3MgPSAodGFnPy5ub2RlQ2xhc3MgPz8gKGlzTWFwID8gWUFNTE1hcC5ZQU1MTWFwIDogWUFNTFNlcS5ZQU1MU2VxKSk7XG4gICAgY29uc3QgY29sbCA9IG5ldyBOb2RlQ2xhc3MoY3R4LnNjaGVtYSk7XG4gICAgY29sbC5mbG93ID0gdHJ1ZTtcbiAgICBjb25zdCBhdFJvb3QgPSBjdHguYXRSb290O1xuICAgIGlmIChhdFJvb3QpXG4gICAgICAgIGN0eC5hdFJvb3QgPSBmYWxzZTtcbiAgICBpZiAoY3R4LmF0S2V5KVxuICAgICAgICBjdHguYXRLZXkgPSBmYWxzZTtcbiAgICBsZXQgb2Zmc2V0ID0gZmMub2Zmc2V0ICsgZmMuc3RhcnQuc291cmNlLmxlbmd0aDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZjLml0ZW1zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGNvbnN0IGNvbGxJdGVtID0gZmMuaXRlbXNbaV07XG4gICAgICAgIGNvbnN0IHsgc3RhcnQsIGtleSwgc2VwLCB2YWx1ZSB9ID0gY29sbEl0ZW07XG4gICAgICAgIGNvbnN0IHByb3BzID0gcmVzb2x2ZVByb3BzLnJlc29sdmVQcm9wcyhzdGFydCwge1xuICAgICAgICAgICAgZmxvdzogZmNOYW1lLFxuICAgICAgICAgICAgaW5kaWNhdG9yOiAnZXhwbGljaXQta2V5LWluZCcsXG4gICAgICAgICAgICBuZXh0OiBrZXkgPz8gc2VwPy5bMF0sXG4gICAgICAgICAgICBvZmZzZXQsXG4gICAgICAgICAgICBvbkVycm9yLFxuICAgICAgICAgICAgcGFyZW50SW5kZW50OiBmYy5pbmRlbnQsXG4gICAgICAgICAgICBzdGFydE9uTmV3bGluZTogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICghcHJvcHMuZm91bmQpIHtcbiAgICAgICAgICAgIGlmICghcHJvcHMuYW5jaG9yICYmICFwcm9wcy50YWcgJiYgIXNlcCAmJiAhdmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoaSA9PT0gMCAmJiBwcm9wcy5jb21tYSlcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcihwcm9wcy5jb21tYSwgJ1VORVhQRUNURURfVE9LRU4nLCBgVW5leHBlY3RlZCAsIGluICR7ZmNOYW1lfWApO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGkgPCBmYy5pdGVtcy5sZW5ndGggLSAxKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHByb3BzLnN0YXJ0LCAnVU5FWFBFQ1RFRF9UT0tFTicsIGBVbmV4cGVjdGVkIGVtcHR5IGl0ZW0gaW4gJHtmY05hbWV9YCk7XG4gICAgICAgICAgICAgICAgaWYgKHByb3BzLmNvbW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbGwuY29tbWVudClcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbGwuY29tbWVudCArPSAnXFxuJyArIHByb3BzLmNvbW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbGwuY29tbWVudCA9IHByb3BzLmNvbW1lbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG9mZnNldCA9IHByb3BzLmVuZDtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaXNNYXAgJiYgY3R4Lm9wdGlvbnMuc3RyaWN0ICYmIHV0aWxDb250YWluc05ld2xpbmUuY29udGFpbnNOZXdsaW5lKGtleSkpXG4gICAgICAgICAgICAgICAgb25FcnJvcihrZXksIC8vIGNoZWNrZWQgYnkgY29udGFpbnNOZXdsaW5lKClcbiAgICAgICAgICAgICAgICAnTVVMVElMSU5FX0lNUExJQ0lUX0tFWScsICdJbXBsaWNpdCBrZXlzIG9mIGZsb3cgc2VxdWVuY2UgcGFpcnMgbmVlZCB0byBiZSBvbiBhIHNpbmdsZSBsaW5lJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGkgPT09IDApIHtcbiAgICAgICAgICAgIGlmIChwcm9wcy5jb21tYSlcbiAgICAgICAgICAgICAgICBvbkVycm9yKHByb3BzLmNvbW1hLCAnVU5FWFBFQ1RFRF9UT0tFTicsIGBVbmV4cGVjdGVkICwgaW4gJHtmY05hbWV9YCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoIXByb3BzLmNvbW1hKVxuICAgICAgICAgICAgICAgIG9uRXJyb3IocHJvcHMuc3RhcnQsICdNSVNTSU5HX0NIQVInLCBgTWlzc2luZyAsIGJldHdlZW4gJHtmY05hbWV9IGl0ZW1zYCk7XG4gICAgICAgICAgICBpZiAocHJvcHMuY29tbWVudCkge1xuICAgICAgICAgICAgICAgIGxldCBwcmV2SXRlbUNvbW1lbnQgPSAnJztcbiAgICAgICAgICAgICAgICBsb29wOiBmb3IgKGNvbnN0IHN0IG9mIHN0YXJ0KSB7XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoc3QudHlwZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnY29tbWEnOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJldkl0ZW1Db21tZW50ID0gc3Quc291cmNlLnN1YnN0cmluZygxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhayBsb29wO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhayBsb29wO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChwcmV2SXRlbUNvbW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHByZXYgPSBjb2xsLml0ZW1zW2NvbGwuaXRlbXMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChpZGVudGl0eS5pc1BhaXIocHJldikpXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2ID0gcHJldi52YWx1ZSA/PyBwcmV2LmtleTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByZXYuY29tbWVudClcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXYuY29tbWVudCArPSAnXFxuJyArIHByZXZJdGVtQ29tbWVudDtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldi5jb21tZW50ID0gcHJldkl0ZW1Db21tZW50O1xuICAgICAgICAgICAgICAgICAgICBwcm9wcy5jb21tZW50ID0gcHJvcHMuY29tbWVudC5zdWJzdHJpbmcocHJldkl0ZW1Db21tZW50Lmxlbmd0aCArIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIWlzTWFwICYmICFzZXAgJiYgIXByb3BzLmZvdW5kKSB7XG4gICAgICAgICAgICAvLyBpdGVtIGlzIGEgdmFsdWUgaW4gYSBzZXFcbiAgICAgICAgICAgIC8vIOKGkiBrZXkgJiBzZXAgYXJlIGVtcHR5LCBzdGFydCBkb2VzIG5vdCBpbmNsdWRlID8gb3IgOlxuICAgICAgICAgICAgY29uc3QgdmFsdWVOb2RlID0gdmFsdWVcbiAgICAgICAgICAgICAgICA/IGNvbXBvc2VOb2RlKGN0eCwgdmFsdWUsIHByb3BzLCBvbkVycm9yKVxuICAgICAgICAgICAgICAgIDogY29tcG9zZUVtcHR5Tm9kZShjdHgsIHByb3BzLmVuZCwgc2VwLCBudWxsLCBwcm9wcywgb25FcnJvcik7XG4gICAgICAgICAgICBjb2xsLml0ZW1zLnB1c2godmFsdWVOb2RlKTtcbiAgICAgICAgICAgIG9mZnNldCA9IHZhbHVlTm9kZS5yYW5nZVsyXTtcbiAgICAgICAgICAgIGlmIChpc0Jsb2NrKHZhbHVlKSlcbiAgICAgICAgICAgICAgICBvbkVycm9yKHZhbHVlTm9kZS5yYW5nZSwgJ0JMT0NLX0lOX0ZMT1cnLCBibG9ja01zZyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBpdGVtIGlzIGEga2V5K3ZhbHVlIHBhaXJcbiAgICAgICAgICAgIC8vIGtleSB2YWx1ZVxuICAgICAgICAgICAgY3R4LmF0S2V5ID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbnN0IGtleVN0YXJ0ID0gcHJvcHMuZW5kO1xuICAgICAgICAgICAgY29uc3Qga2V5Tm9kZSA9IGtleVxuICAgICAgICAgICAgICAgID8gY29tcG9zZU5vZGUoY3R4LCBrZXksIHByb3BzLCBvbkVycm9yKVxuICAgICAgICAgICAgICAgIDogY29tcG9zZUVtcHR5Tm9kZShjdHgsIGtleVN0YXJ0LCBzdGFydCwgbnVsbCwgcHJvcHMsIG9uRXJyb3IpO1xuICAgICAgICAgICAgaWYgKGlzQmxvY2soa2V5KSlcbiAgICAgICAgICAgICAgICBvbkVycm9yKGtleU5vZGUucmFuZ2UsICdCTE9DS19JTl9GTE9XJywgYmxvY2tNc2cpO1xuICAgICAgICAgICAgY3R4LmF0S2V5ID0gZmFsc2U7XG4gICAgICAgICAgICAvLyB2YWx1ZSBwcm9wZXJ0aWVzXG4gICAgICAgICAgICBjb25zdCB2YWx1ZVByb3BzID0gcmVzb2x2ZVByb3BzLnJlc29sdmVQcm9wcyhzZXAgPz8gW10sIHtcbiAgICAgICAgICAgICAgICBmbG93OiBmY05hbWUsXG4gICAgICAgICAgICAgICAgaW5kaWNhdG9yOiAnbWFwLXZhbHVlLWluZCcsXG4gICAgICAgICAgICAgICAgbmV4dDogdmFsdWUsXG4gICAgICAgICAgICAgICAgb2Zmc2V0OiBrZXlOb2RlLnJhbmdlWzJdLFxuICAgICAgICAgICAgICAgIG9uRXJyb3IsXG4gICAgICAgICAgICAgICAgcGFyZW50SW5kZW50OiBmYy5pbmRlbnQsXG4gICAgICAgICAgICAgICAgc3RhcnRPbk5ld2xpbmU6IGZhbHNlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmICh2YWx1ZVByb3BzLmZvdW5kKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc01hcCAmJiAhcHJvcHMuZm91bmQgJiYgY3R4Lm9wdGlvbnMuc3RyaWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzZXApXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHN0IG9mIHNlcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdCA9PT0gdmFsdWVQcm9wcy5mb3VuZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0LnR5cGUgPT09ICduZXdsaW5lJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHN0LCAnTVVMVElMSU5FX0lNUExJQ0lUX0tFWScsICdJbXBsaWNpdCBrZXlzIG9mIGZsb3cgc2VxdWVuY2UgcGFpcnMgbmVlZCB0byBiZSBvbiBhIHNpbmdsZSBsaW5lJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHByb3BzLnN0YXJ0IDwgdmFsdWVQcm9wcy5mb3VuZC5vZmZzZXQgLSAxMDI0KVxuICAgICAgICAgICAgICAgICAgICAgICAgb25FcnJvcih2YWx1ZVByb3BzLmZvdW5kLCAnS0VZX09WRVJfMTAyNF9DSEFSUycsICdUaGUgOiBpbmRpY2F0b3IgbXVzdCBiZSBhdCBtb3N0IDEwMjQgY2hhcnMgYWZ0ZXIgdGhlIHN0YXJ0IG9mIGFuIGltcGxpY2l0IGZsb3cgc2VxdWVuY2Uga2V5Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoJ3NvdXJjZScgaW4gdmFsdWUgJiYgdmFsdWUuc291cmNlPy5bMF0gPT09ICc6JylcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcih2YWx1ZSwgJ01JU1NJTkdfQ0hBUicsIGBNaXNzaW5nIHNwYWNlIGFmdGVyIDogaW4gJHtmY05hbWV9YCk7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHZhbHVlUHJvcHMuc3RhcnQsICdNSVNTSU5HX0NIQVInLCBgTWlzc2luZyAsIG9yIDogYmV0d2VlbiAke2ZjTmFtZX0gaXRlbXNgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHZhbHVlIHZhbHVlXG4gICAgICAgICAgICBjb25zdCB2YWx1ZU5vZGUgPSB2YWx1ZVxuICAgICAgICAgICAgICAgID8gY29tcG9zZU5vZGUoY3R4LCB2YWx1ZSwgdmFsdWVQcm9wcywgb25FcnJvcilcbiAgICAgICAgICAgICAgICA6IHZhbHVlUHJvcHMuZm91bmRcbiAgICAgICAgICAgICAgICAgICAgPyBjb21wb3NlRW1wdHlOb2RlKGN0eCwgdmFsdWVQcm9wcy5lbmQsIHNlcCwgbnVsbCwgdmFsdWVQcm9wcywgb25FcnJvcilcbiAgICAgICAgICAgICAgICAgICAgOiBudWxsO1xuICAgICAgICAgICAgaWYgKHZhbHVlTm9kZSkge1xuICAgICAgICAgICAgICAgIGlmIChpc0Jsb2NrKHZhbHVlKSlcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcih2YWx1ZU5vZGUucmFuZ2UsICdCTE9DS19JTl9GTE9XJywgYmxvY2tNc2cpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodmFsdWVQcm9wcy5jb21tZW50KSB7XG4gICAgICAgICAgICAgICAgaWYgKGtleU5vZGUuY29tbWVudClcbiAgICAgICAgICAgICAgICAgICAga2V5Tm9kZS5jb21tZW50ICs9ICdcXG4nICsgdmFsdWVQcm9wcy5jb21tZW50O1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAga2V5Tm9kZS5jb21tZW50ID0gdmFsdWVQcm9wcy5jb21tZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcGFpciA9IG5ldyBQYWlyLlBhaXIoa2V5Tm9kZSwgdmFsdWVOb2RlKTtcbiAgICAgICAgICAgIGlmIChjdHgub3B0aW9ucy5rZWVwU291cmNlVG9rZW5zKVxuICAgICAgICAgICAgICAgIHBhaXIuc3JjVG9rZW4gPSBjb2xsSXRlbTtcbiAgICAgICAgICAgIGlmIChpc01hcCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1hcCA9IGNvbGw7XG4gICAgICAgICAgICAgICAgaWYgKHV0aWxNYXBJbmNsdWRlcy5tYXBJbmNsdWRlcyhjdHgsIG1hcC5pdGVtcywga2V5Tm9kZSkpXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3Ioa2V5U3RhcnQsICdEVVBMSUNBVEVfS0VZJywgJ01hcCBrZXlzIG11c3QgYmUgdW5pcXVlJyk7XG4gICAgICAgICAgICAgICAgbWFwLml0ZW1zLnB1c2gocGFpcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXAgPSBuZXcgWUFNTE1hcC5ZQU1MTWFwKGN0eC5zY2hlbWEpO1xuICAgICAgICAgICAgICAgIG1hcC5mbG93ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBtYXAuaXRlbXMucHVzaChwYWlyKTtcbiAgICAgICAgICAgICAgICBjb25zdCBlbmRSYW5nZSA9ICh2YWx1ZU5vZGUgPz8ga2V5Tm9kZSkucmFuZ2U7XG4gICAgICAgICAgICAgICAgbWFwLnJhbmdlID0gW2tleU5vZGUucmFuZ2VbMF0sIGVuZFJhbmdlWzFdLCBlbmRSYW5nZVsyXV07XG4gICAgICAgICAgICAgICAgY29sbC5pdGVtcy5wdXNoKG1hcCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvZmZzZXQgPSB2YWx1ZU5vZGUgPyB2YWx1ZU5vZGUucmFuZ2VbMl0gOiB2YWx1ZVByb3BzLmVuZDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBleHBlY3RlZEVuZCA9IGlzTWFwID8gJ30nIDogJ10nO1xuICAgIGNvbnN0IFtjZSwgLi4uZWVdID0gZmMuZW5kO1xuICAgIGxldCBjZVBvcyA9IG9mZnNldDtcbiAgICBpZiAoY2U/LnNvdXJjZSA9PT0gZXhwZWN0ZWRFbmQpXG4gICAgICAgIGNlUG9zID0gY2Uub2Zmc2V0ICsgY2Uuc291cmNlLmxlbmd0aDtcbiAgICBlbHNlIHtcbiAgICAgICAgY29uc3QgbmFtZSA9IGZjTmFtZVswXS50b1VwcGVyQ2FzZSgpICsgZmNOYW1lLnN1YnN0cmluZygxKTtcbiAgICAgICAgY29uc3QgbXNnID0gYXRSb290XG4gICAgICAgICAgICA/IGAke25hbWV9IG11c3QgZW5kIHdpdGggYSAke2V4cGVjdGVkRW5kfWBcbiAgICAgICAgICAgIDogYCR7bmFtZX0gaW4gYmxvY2sgY29sbGVjdGlvbiBtdXN0IGJlIHN1ZmZpY2llbnRseSBpbmRlbnRlZCBhbmQgZW5kIHdpdGggYSAke2V4cGVjdGVkRW5kfWA7XG4gICAgICAgIG9uRXJyb3Iob2Zmc2V0LCBhdFJvb3QgPyAnTUlTU0lOR19DSEFSJyA6ICdCQURfSU5ERU5UJywgbXNnKTtcbiAgICAgICAgaWYgKGNlICYmIGNlLnNvdXJjZS5sZW5ndGggIT09IDEpXG4gICAgICAgICAgICBlZS51bnNoaWZ0KGNlKTtcbiAgICB9XG4gICAgaWYgKGVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgZW5kID0gcmVzb2x2ZUVuZC5yZXNvbHZlRW5kKGVlLCBjZVBvcywgY3R4Lm9wdGlvbnMuc3RyaWN0LCBvbkVycm9yKTtcbiAgICAgICAgaWYgKGVuZC5jb21tZW50KSB7XG4gICAgICAgICAgICBpZiAoY29sbC5jb21tZW50KVxuICAgICAgICAgICAgICAgIGNvbGwuY29tbWVudCArPSAnXFxuJyArIGVuZC5jb21tZW50O1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGNvbGwuY29tbWVudCA9IGVuZC5jb21tZW50O1xuICAgICAgICB9XG4gICAgICAgIGNvbGwucmFuZ2UgPSBbZmMub2Zmc2V0LCBjZVBvcywgZW5kLm9mZnNldF07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjb2xsLnJhbmdlID0gW2ZjLm9mZnNldCwgY2VQb3MsIGNlUG9zXTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbGw7XG59XG5cbmV4cG9ydHMucmVzb2x2ZUZsb3dDb2xsZWN0aW9uID0gcmVzb2x2ZUZsb3dDb2xsZWN0aW9uO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBpZGVudGl0eSA9IHJlcXVpcmUoJy4uL25vZGVzL2lkZW50aXR5LmpzJyk7XG52YXIgU2NhbGFyID0gcmVxdWlyZSgnLi4vbm9kZXMvU2NhbGFyLmpzJyk7XG52YXIgWUFNTE1hcCA9IHJlcXVpcmUoJy4uL25vZGVzL1lBTUxNYXAuanMnKTtcbnZhciBZQU1MU2VxID0gcmVxdWlyZSgnLi4vbm9kZXMvWUFNTFNlcS5qcycpO1xudmFyIHJlc29sdmVCbG9ja01hcCA9IHJlcXVpcmUoJy4vcmVzb2x2ZS1ibG9jay1tYXAuanMnKTtcbnZhciByZXNvbHZlQmxvY2tTZXEgPSByZXF1aXJlKCcuL3Jlc29sdmUtYmxvY2stc2VxLmpzJyk7XG52YXIgcmVzb2x2ZUZsb3dDb2xsZWN0aW9uID0gcmVxdWlyZSgnLi9yZXNvbHZlLWZsb3ctY29sbGVjdGlvbi5qcycpO1xuXG5mdW5jdGlvbiByZXNvbHZlQ29sbGVjdGlvbihDTiwgY3R4LCB0b2tlbiwgb25FcnJvciwgdGFnTmFtZSwgdGFnKSB7XG4gICAgY29uc3QgY29sbCA9IHRva2VuLnR5cGUgPT09ICdibG9jay1tYXAnXG4gICAgICAgID8gcmVzb2x2ZUJsb2NrTWFwLnJlc29sdmVCbG9ja01hcChDTiwgY3R4LCB0b2tlbiwgb25FcnJvciwgdGFnKVxuICAgICAgICA6IHRva2VuLnR5cGUgPT09ICdibG9jay1zZXEnXG4gICAgICAgICAgICA/IHJlc29sdmVCbG9ja1NlcS5yZXNvbHZlQmxvY2tTZXEoQ04sIGN0eCwgdG9rZW4sIG9uRXJyb3IsIHRhZylcbiAgICAgICAgICAgIDogcmVzb2x2ZUZsb3dDb2xsZWN0aW9uLnJlc29sdmVGbG93Q29sbGVjdGlvbihDTiwgY3R4LCB0b2tlbiwgb25FcnJvciwgdGFnKTtcbiAgICBjb25zdCBDb2xsID0gY29sbC5jb25zdHJ1Y3RvcjtcbiAgICAvLyBJZiB3ZSBnb3QgYSB0YWdOYW1lIG1hdGNoaW5nIHRoZSBjbGFzcywgb3IgdGhlIHRhZyBuYW1lIGlzICchJyxcbiAgICAvLyB0aGVuIHVzZSB0aGUgdGFnTmFtZSBmcm9tIHRoZSBub2RlIGNsYXNzIHVzZWQgdG8gY3JlYXRlIGl0LlxuICAgIGlmICh0YWdOYW1lID09PSAnIScgfHwgdGFnTmFtZSA9PT0gQ29sbC50YWdOYW1lKSB7XG4gICAgICAgIGNvbGwudGFnID0gQ29sbC50YWdOYW1lO1xuICAgICAgICByZXR1cm4gY29sbDtcbiAgICB9XG4gICAgaWYgKHRhZ05hbWUpXG4gICAgICAgIGNvbGwudGFnID0gdGFnTmFtZTtcbiAgICByZXR1cm4gY29sbDtcbn1cbmZ1bmN0aW9uIGNvbXBvc2VDb2xsZWN0aW9uKENOLCBjdHgsIHRva2VuLCBwcm9wcywgb25FcnJvcikge1xuICAgIGNvbnN0IHRhZ1Rva2VuID0gcHJvcHMudGFnO1xuICAgIGNvbnN0IHRhZ05hbWUgPSAhdGFnVG9rZW5cbiAgICAgICAgPyBudWxsXG4gICAgICAgIDogY3R4LmRpcmVjdGl2ZXMudGFnTmFtZSh0YWdUb2tlbi5zb3VyY2UsIG1zZyA9PiBvbkVycm9yKHRhZ1Rva2VuLCAnVEFHX1JFU09MVkVfRkFJTEVEJywgbXNnKSk7XG4gICAgaWYgKHRva2VuLnR5cGUgPT09ICdibG9jay1zZXEnKSB7XG4gICAgICAgIGNvbnN0IHsgYW5jaG9yLCBuZXdsaW5lQWZ0ZXJQcm9wOiBubCB9ID0gcHJvcHM7XG4gICAgICAgIGNvbnN0IGxhc3RQcm9wID0gYW5jaG9yICYmIHRhZ1Rva2VuXG4gICAgICAgICAgICA/IGFuY2hvci5vZmZzZXQgPiB0YWdUb2tlbi5vZmZzZXRcbiAgICAgICAgICAgICAgICA/IGFuY2hvclxuICAgICAgICAgICAgICAgIDogdGFnVG9rZW5cbiAgICAgICAgICAgIDogKGFuY2hvciA/PyB0YWdUb2tlbik7XG4gICAgICAgIGlmIChsYXN0UHJvcCAmJiAoIW5sIHx8IG5sLm9mZnNldCA8IGxhc3RQcm9wLm9mZnNldCkpIHtcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSAnTWlzc2luZyBuZXdsaW5lIGFmdGVyIGJsb2NrIHNlcXVlbmNlIHByb3BzJztcbiAgICAgICAgICAgIG9uRXJyb3IobGFzdFByb3AsICdNSVNTSU5HX0NIQVInLCBtZXNzYWdlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBleHBUeXBlID0gdG9rZW4udHlwZSA9PT0gJ2Jsb2NrLW1hcCdcbiAgICAgICAgPyAnbWFwJ1xuICAgICAgICA6IHRva2VuLnR5cGUgPT09ICdibG9jay1zZXEnXG4gICAgICAgICAgICA/ICdzZXEnXG4gICAgICAgICAgICA6IHRva2VuLnN0YXJ0LnNvdXJjZSA9PT0gJ3snXG4gICAgICAgICAgICAgICAgPyAnbWFwJ1xuICAgICAgICAgICAgICAgIDogJ3NlcSc7XG4gICAgLy8gc2hvcnRjdXQ6IGNoZWNrIGlmIGl0J3MgYSBnZW5lcmljIFlBTUxNYXAgb3IgWUFNTFNlcVxuICAgIC8vIGJlZm9yZSBqdW1waW5nIGludG8gdGhlIGN1c3RvbSB0YWcgbG9naWMuXG4gICAgaWYgKCF0YWdUb2tlbiB8fFxuICAgICAgICAhdGFnTmFtZSB8fFxuICAgICAgICB0YWdOYW1lID09PSAnIScgfHxcbiAgICAgICAgKHRhZ05hbWUgPT09IFlBTUxNYXAuWUFNTE1hcC50YWdOYW1lICYmIGV4cFR5cGUgPT09ICdtYXAnKSB8fFxuICAgICAgICAodGFnTmFtZSA9PT0gWUFNTFNlcS5ZQU1MU2VxLnRhZ05hbWUgJiYgZXhwVHlwZSA9PT0gJ3NlcScpKSB7XG4gICAgICAgIHJldHVybiByZXNvbHZlQ29sbGVjdGlvbihDTiwgY3R4LCB0b2tlbiwgb25FcnJvciwgdGFnTmFtZSk7XG4gICAgfVxuICAgIGxldCB0YWcgPSBjdHguc2NoZW1hLnRhZ3MuZmluZCh0ID0+IHQudGFnID09PSB0YWdOYW1lICYmIHQuY29sbGVjdGlvbiA9PT0gZXhwVHlwZSk7XG4gICAgaWYgKCF0YWcpIHtcbiAgICAgICAgY29uc3Qga3QgPSBjdHguc2NoZW1hLmtub3duVGFnc1t0YWdOYW1lXTtcbiAgICAgICAgaWYgKGt0Py5jb2xsZWN0aW9uID09PSBleHBUeXBlKSB7XG4gICAgICAgICAgICBjdHguc2NoZW1hLnRhZ3MucHVzaChPYmplY3QuYXNzaWduKHt9LCBrdCwgeyBkZWZhdWx0OiBmYWxzZSB9KSk7XG4gICAgICAgICAgICB0YWcgPSBrdDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChrdCkge1xuICAgICAgICAgICAgICAgIG9uRXJyb3IodGFnVG9rZW4sICdCQURfQ09MTEVDVElPTl9UWVBFJywgYCR7a3QudGFnfSB1c2VkIGZvciAke2V4cFR5cGV9IGNvbGxlY3Rpb24sIGJ1dCBleHBlY3RzICR7a3QuY29sbGVjdGlvbiA/PyAnc2NhbGFyJ31gLCB0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIG9uRXJyb3IodGFnVG9rZW4sICdUQUdfUkVTT0xWRV9GQUlMRUQnLCBgVW5yZXNvbHZlZCB0YWc6ICR7dGFnTmFtZX1gLCB0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlQ29sbGVjdGlvbihDTiwgY3R4LCB0b2tlbiwgb25FcnJvciwgdGFnTmFtZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgY29sbCA9IHJlc29sdmVDb2xsZWN0aW9uKENOLCBjdHgsIHRva2VuLCBvbkVycm9yLCB0YWdOYW1lLCB0YWcpO1xuICAgIGNvbnN0IHJlcyA9IHRhZy5yZXNvbHZlPy4oY29sbCwgbXNnID0+IG9uRXJyb3IodGFnVG9rZW4sICdUQUdfUkVTT0xWRV9GQUlMRUQnLCBtc2cpLCBjdHgub3B0aW9ucykgPz8gY29sbDtcbiAgICBjb25zdCBub2RlID0gaWRlbnRpdHkuaXNOb2RlKHJlcylcbiAgICAgICAgPyByZXNcbiAgICAgICAgOiBuZXcgU2NhbGFyLlNjYWxhcihyZXMpO1xuICAgIG5vZGUucmFuZ2UgPSBjb2xsLnJhbmdlO1xuICAgIG5vZGUudGFnID0gdGFnTmFtZTtcbiAgICBpZiAodGFnPy5mb3JtYXQpXG4gICAgICAgIG5vZGUuZm9ybWF0ID0gdGFnLmZvcm1hdDtcbiAgICByZXR1cm4gbm9kZTtcbn1cblxuZXhwb3J0cy5jb21wb3NlQ29sbGVjdGlvbiA9IGNvbXBvc2VDb2xsZWN0aW9uO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBTY2FsYXIgPSByZXF1aXJlKCcuLi9ub2Rlcy9TY2FsYXIuanMnKTtcblxuZnVuY3Rpb24gcmVzb2x2ZUJsb2NrU2NhbGFyKGN0eCwgc2NhbGFyLCBvbkVycm9yKSB7XG4gICAgY29uc3Qgc3RhcnQgPSBzY2FsYXIub2Zmc2V0O1xuICAgIGNvbnN0IGhlYWRlciA9IHBhcnNlQmxvY2tTY2FsYXJIZWFkZXIoc2NhbGFyLCBjdHgub3B0aW9ucy5zdHJpY3QsIG9uRXJyb3IpO1xuICAgIGlmICghaGVhZGVyKVxuICAgICAgICByZXR1cm4geyB2YWx1ZTogJycsIHR5cGU6IG51bGwsIGNvbW1lbnQ6ICcnLCByYW5nZTogW3N0YXJ0LCBzdGFydCwgc3RhcnRdIH07XG4gICAgY29uc3QgdHlwZSA9IGhlYWRlci5tb2RlID09PSAnPicgPyBTY2FsYXIuU2NhbGFyLkJMT0NLX0ZPTERFRCA6IFNjYWxhci5TY2FsYXIuQkxPQ0tfTElURVJBTDtcbiAgICBjb25zdCBsaW5lcyA9IHNjYWxhci5zb3VyY2UgPyBzcGxpdExpbmVzKHNjYWxhci5zb3VyY2UpIDogW107XG4gICAgLy8gZGV0ZXJtaW5lIHRoZSBlbmQgb2YgY29udGVudCAmIHN0YXJ0IG9mIGNob21waW5nXG4gICAgbGV0IGNob21wU3RhcnQgPSBsaW5lcy5sZW5ndGg7XG4gICAgZm9yIChsZXQgaSA9IGxpbmVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBsaW5lc1tpXVsxXTtcbiAgICAgICAgaWYgKGNvbnRlbnQgPT09ICcnIHx8IGNvbnRlbnQgPT09ICdcXHInKVxuICAgICAgICAgICAgY2hvbXBTdGFydCA9IGk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICAvLyBzaG9ydGN1dCBmb3IgZW1wdHkgY29udGVudHNcbiAgICBpZiAoY2hvbXBTdGFydCA9PT0gMCkge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGhlYWRlci5jaG9tcCA9PT0gJysnICYmIGxpbmVzLmxlbmd0aCA+IDBcbiAgICAgICAgICAgID8gJ1xcbicucmVwZWF0KE1hdGgubWF4KDEsIGxpbmVzLmxlbmd0aCAtIDEpKVxuICAgICAgICAgICAgOiAnJztcbiAgICAgICAgbGV0IGVuZCA9IHN0YXJ0ICsgaGVhZGVyLmxlbmd0aDtcbiAgICAgICAgaWYgKHNjYWxhci5zb3VyY2UpXG4gICAgICAgICAgICBlbmQgKz0gc2NhbGFyLnNvdXJjZS5sZW5ndGg7XG4gICAgICAgIHJldHVybiB7IHZhbHVlLCB0eXBlLCBjb21tZW50OiBoZWFkZXIuY29tbWVudCwgcmFuZ2U6IFtzdGFydCwgZW5kLCBlbmRdIH07XG4gICAgfVxuICAgIC8vIGZpbmQgdGhlIGluZGVudGF0aW9uIGxldmVsIHRvIHRyaW0gZnJvbSBzdGFydFxuICAgIGxldCB0cmltSW5kZW50ID0gc2NhbGFyLmluZGVudCArIGhlYWRlci5pbmRlbnQ7XG4gICAgbGV0IG9mZnNldCA9IHNjYWxhci5vZmZzZXQgKyBoZWFkZXIubGVuZ3RoO1xuICAgIGxldCBjb250ZW50U3RhcnQgPSAwO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hvbXBTdGFydDsgKytpKSB7XG4gICAgICAgIGNvbnN0IFtpbmRlbnQsIGNvbnRlbnRdID0gbGluZXNbaV07XG4gICAgICAgIGlmIChjb250ZW50ID09PSAnJyB8fCBjb250ZW50ID09PSAnXFxyJykge1xuICAgICAgICAgICAgaWYgKGhlYWRlci5pbmRlbnQgPT09IDAgJiYgaW5kZW50Lmxlbmd0aCA+IHRyaW1JbmRlbnQpXG4gICAgICAgICAgICAgICAgdHJpbUluZGVudCA9IGluZGVudC5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoaW5kZW50Lmxlbmd0aCA8IHRyaW1JbmRlbnQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gJ0Jsb2NrIHNjYWxhcnMgd2l0aCBtb3JlLWluZGVudGVkIGxlYWRpbmcgZW1wdHkgbGluZXMgbXVzdCB1c2UgYW4gZXhwbGljaXQgaW5kZW50YXRpb24gaW5kaWNhdG9yJztcbiAgICAgICAgICAgICAgICBvbkVycm9yKG9mZnNldCArIGluZGVudC5sZW5ndGgsICdNSVNTSU5HX0NIQVInLCBtZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChoZWFkZXIuaW5kZW50ID09PSAwKVxuICAgICAgICAgICAgICAgIHRyaW1JbmRlbnQgPSBpbmRlbnQubGVuZ3RoO1xuICAgICAgICAgICAgY29udGVudFN0YXJ0ID0gaTtcbiAgICAgICAgICAgIGlmICh0cmltSW5kZW50ID09PSAwICYmICFjdHguYXRSb290KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9ICdCbG9jayBzY2FsYXIgdmFsdWVzIGluIGNvbGxlY3Rpb25zIG11c3QgYmUgaW5kZW50ZWQnO1xuICAgICAgICAgICAgICAgIG9uRXJyb3Iob2Zmc2V0LCAnQkFEX0lOREVOVCcsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgb2Zmc2V0ICs9IGluZGVudC5sZW5ndGggKyBjb250ZW50Lmxlbmd0aCArIDE7XG4gICAgfVxuICAgIC8vIGluY2x1ZGUgdHJhaWxpbmcgbW9yZS1pbmRlbnRlZCBlbXB0eSBsaW5lcyBpbiBjb250ZW50XG4gICAgZm9yIChsZXQgaSA9IGxpbmVzLmxlbmd0aCAtIDE7IGkgPj0gY2hvbXBTdGFydDsgLS1pKSB7XG4gICAgICAgIGlmIChsaW5lc1tpXVswXS5sZW5ndGggPiB0cmltSW5kZW50KVxuICAgICAgICAgICAgY2hvbXBTdGFydCA9IGkgKyAxO1xuICAgIH1cbiAgICBsZXQgdmFsdWUgPSAnJztcbiAgICBsZXQgc2VwID0gJyc7XG4gICAgbGV0IHByZXZNb3JlSW5kZW50ZWQgPSBmYWxzZTtcbiAgICAvLyBsZWFkaW5nIHdoaXRlc3BhY2UgaXMga2VwdCBpbnRhY3RcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbnRlbnRTdGFydDsgKytpKVxuICAgICAgICB2YWx1ZSArPSBsaW5lc1tpXVswXS5zbGljZSh0cmltSW5kZW50KSArICdcXG4nO1xuICAgIGZvciAobGV0IGkgPSBjb250ZW50U3RhcnQ7IGkgPCBjaG9tcFN0YXJ0OyArK2kpIHtcbiAgICAgICAgbGV0IFtpbmRlbnQsIGNvbnRlbnRdID0gbGluZXNbaV07XG4gICAgICAgIG9mZnNldCArPSBpbmRlbnQubGVuZ3RoICsgY29udGVudC5sZW5ndGggKyAxO1xuICAgICAgICBjb25zdCBjcmxmID0gY29udGVudFtjb250ZW50Lmxlbmd0aCAtIDFdID09PSAnXFxyJztcbiAgICAgICAgaWYgKGNybGYpXG4gICAgICAgICAgICBjb250ZW50ID0gY29udGVudC5zbGljZSgwLCAtMSk7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiBhbHJlYWR5IGNhdWdodCBpbiBsZXhlciAqL1xuICAgICAgICBpZiAoY29udGVudCAmJiBpbmRlbnQubGVuZ3RoIDwgdHJpbUluZGVudCkge1xuICAgICAgICAgICAgY29uc3Qgc3JjID0gaGVhZGVyLmluZGVudFxuICAgICAgICAgICAgICAgID8gJ2V4cGxpY2l0IGluZGVudGF0aW9uIGluZGljYXRvcidcbiAgICAgICAgICAgICAgICA6ICdmaXJzdCBsaW5lJztcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBgQmxvY2sgc2NhbGFyIGxpbmVzIG11c3Qgbm90IGJlIGxlc3MgaW5kZW50ZWQgdGhhbiB0aGVpciAke3NyY31gO1xuICAgICAgICAgICAgb25FcnJvcihvZmZzZXQgLSBjb250ZW50Lmxlbmd0aCAtIChjcmxmID8gMiA6IDEpLCAnQkFEX0lOREVOVCcsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgaW5kZW50ID0gJyc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGUgPT09IFNjYWxhci5TY2FsYXIuQkxPQ0tfTElURVJBTCkge1xuICAgICAgICAgICAgdmFsdWUgKz0gc2VwICsgaW5kZW50LnNsaWNlKHRyaW1JbmRlbnQpICsgY29udGVudDtcbiAgICAgICAgICAgIHNlcCA9ICdcXG4nO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGluZGVudC5sZW5ndGggPiB0cmltSW5kZW50IHx8IGNvbnRlbnRbMF0gPT09ICdcXHQnKSB7XG4gICAgICAgICAgICAvLyBtb3JlLWluZGVudGVkIGNvbnRlbnQgd2l0aGluIGEgZm9sZGVkIGJsb2NrXG4gICAgICAgICAgICBpZiAoc2VwID09PSAnICcpXG4gICAgICAgICAgICAgICAgc2VwID0gJ1xcbic7XG4gICAgICAgICAgICBlbHNlIGlmICghcHJldk1vcmVJbmRlbnRlZCAmJiBzZXAgPT09ICdcXG4nKVxuICAgICAgICAgICAgICAgIHNlcCA9ICdcXG5cXG4nO1xuICAgICAgICAgICAgdmFsdWUgKz0gc2VwICsgaW5kZW50LnNsaWNlKHRyaW1JbmRlbnQpICsgY29udGVudDtcbiAgICAgICAgICAgIHNlcCA9ICdcXG4nO1xuICAgICAgICAgICAgcHJldk1vcmVJbmRlbnRlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoY29udGVudCA9PT0gJycpIHtcbiAgICAgICAgICAgIC8vIGVtcHR5IGxpbmVcbiAgICAgICAgICAgIGlmIChzZXAgPT09ICdcXG4nKVxuICAgICAgICAgICAgICAgIHZhbHVlICs9ICdcXG4nO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHNlcCA9ICdcXG4nO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFsdWUgKz0gc2VwICsgY29udGVudDtcbiAgICAgICAgICAgIHNlcCA9ICcgJztcbiAgICAgICAgICAgIHByZXZNb3JlSW5kZW50ZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzd2l0Y2ggKGhlYWRlci5jaG9tcCkge1xuICAgICAgICBjYXNlICctJzpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICcrJzpcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBjaG9tcFN0YXJ0OyBpIDwgbGluZXMubGVuZ3RoOyArK2kpXG4gICAgICAgICAgICAgICAgdmFsdWUgKz0gJ1xcbicgKyBsaW5lc1tpXVswXS5zbGljZSh0cmltSW5kZW50KTtcbiAgICAgICAgICAgIGlmICh2YWx1ZVt2YWx1ZS5sZW5ndGggLSAxXSAhPT0gJ1xcbicpXG4gICAgICAgICAgICAgICAgdmFsdWUgKz0gJ1xcbic7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHZhbHVlICs9ICdcXG4nO1xuICAgIH1cbiAgICBjb25zdCBlbmQgPSBzdGFydCArIGhlYWRlci5sZW5ndGggKyBzY2FsYXIuc291cmNlLmxlbmd0aDtcbiAgICByZXR1cm4geyB2YWx1ZSwgdHlwZSwgY29tbWVudDogaGVhZGVyLmNvbW1lbnQsIHJhbmdlOiBbc3RhcnQsIGVuZCwgZW5kXSB9O1xufVxuZnVuY3Rpb24gcGFyc2VCbG9ja1NjYWxhckhlYWRlcih7IG9mZnNldCwgcHJvcHMgfSwgc3RyaWN0LCBvbkVycm9yKSB7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmIHNob3VsZCBub3QgaGFwcGVuICovXG4gICAgaWYgKHByb3BzWzBdLnR5cGUgIT09ICdibG9jay1zY2FsYXItaGVhZGVyJykge1xuICAgICAgICBvbkVycm9yKHByb3BzWzBdLCAnSU1QT1NTSUJMRScsICdCbG9jayBzY2FsYXIgaGVhZGVyIG5vdCBmb3VuZCcpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgeyBzb3VyY2UgfSA9IHByb3BzWzBdO1xuICAgIGNvbnN0IG1vZGUgPSBzb3VyY2VbMF07XG4gICAgbGV0IGluZGVudCA9IDA7XG4gICAgbGV0IGNob21wID0gJyc7XG4gICAgbGV0IGVycm9yID0gLTE7XG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPCBzb3VyY2UubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgY29uc3QgY2ggPSBzb3VyY2VbaV07XG4gICAgICAgIGlmICghY2hvbXAgJiYgKGNoID09PSAnLScgfHwgY2ggPT09ICcrJykpXG4gICAgICAgICAgICBjaG9tcCA9IGNoO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IG4gPSBOdW1iZXIoY2gpO1xuICAgICAgICAgICAgaWYgKCFpbmRlbnQgJiYgbilcbiAgICAgICAgICAgICAgICBpbmRlbnQgPSBuO1xuICAgICAgICAgICAgZWxzZSBpZiAoZXJyb3IgPT09IC0xKVxuICAgICAgICAgICAgICAgIGVycm9yID0gb2Zmc2V0ICsgaTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoZXJyb3IgIT09IC0xKVxuICAgICAgICBvbkVycm9yKGVycm9yLCAnVU5FWFBFQ1RFRF9UT0tFTicsIGBCbG9jayBzY2FsYXIgaGVhZGVyIGluY2x1ZGVzIGV4dHJhIGNoYXJhY3RlcnM6ICR7c291cmNlfWApO1xuICAgIGxldCBoYXNTcGFjZSA9IGZhbHNlO1xuICAgIGxldCBjb21tZW50ID0gJyc7XG4gICAgbGV0IGxlbmd0aCA9IHNvdXJjZS5sZW5ndGg7XG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPCBwcm9wcy5sZW5ndGg7ICsraSkge1xuICAgICAgICBjb25zdCB0b2tlbiA9IHByb3BzW2ldO1xuICAgICAgICBzd2l0Y2ggKHRva2VuLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcbiAgICAgICAgICAgICAgICBoYXNTcGFjZSA9IHRydWU7XG4gICAgICAgICAgICAvLyBmYWxsdGhyb3VnaFxuICAgICAgICAgICAgY2FzZSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgICAgbGVuZ3RoICs9IHRva2VuLnNvdXJjZS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgICAgICAgICBpZiAoc3RyaWN0ICYmICFoYXNTcGFjZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gJ0NvbW1lbnRzIG11c3QgYmUgc2VwYXJhdGVkIGZyb20gb3RoZXIgdG9rZW5zIGJ5IHdoaXRlIHNwYWNlIGNoYXJhY3RlcnMnO1xuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnTUlTU0lOR19DSEFSJywgbWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxlbmd0aCArPSB0b2tlbi5zb3VyY2UubGVuZ3RoO1xuICAgICAgICAgICAgICAgIGNvbW1lbnQgPSB0b2tlbi5zb3VyY2Uuc3Vic3RyaW5nKDEpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZXJyb3InOlxuICAgICAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdVTkVYUEVDVEVEX1RPS0VOJywgdG9rZW4ubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgbGVuZ3RoICs9IHRva2VuLnNvdXJjZS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCBzaG91bGQgbm90IGhhcHBlbiAqL1xuICAgICAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBgVW5leHBlY3RlZCB0b2tlbiBpbiBibG9jayBzY2FsYXIgaGVhZGVyOiAke3Rva2VuLnR5cGV9YDtcbiAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnVU5FWFBFQ1RFRF9UT0tFTicsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRzID0gdG9rZW4uc291cmNlO1xuICAgICAgICAgICAgICAgIGlmICh0cyAmJiB0eXBlb2YgdHMgPT09ICdzdHJpbmcnKVxuICAgICAgICAgICAgICAgICAgICBsZW5ndGggKz0gdHMubGVuZ3RoO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7IG1vZGUsIGluZGVudCwgY2hvbXAsIGNvbW1lbnQsIGxlbmd0aCB9O1xufVxuLyoqIEByZXR1cm5zIEFycmF5IG9mIGxpbmVzIHNwbGl0IHVwIGFzIGBbaW5kZW50LCBjb250ZW50XWAgKi9cbmZ1bmN0aW9uIHNwbGl0TGluZXMoc291cmNlKSB7XG4gICAgY29uc3Qgc3BsaXQgPSBzb3VyY2Uuc3BsaXQoL1xcbiggKikvKTtcbiAgICBjb25zdCBmaXJzdCA9IHNwbGl0WzBdO1xuICAgIGNvbnN0IG0gPSBmaXJzdC5tYXRjaCgvXiggKikvKTtcbiAgICBjb25zdCBsaW5lMCA9IG0/LlsxXVxuICAgICAgICA/IFttWzFdLCBmaXJzdC5zbGljZShtWzFdLmxlbmd0aCldXG4gICAgICAgIDogWycnLCBmaXJzdF07XG4gICAgY29uc3QgbGluZXMgPSBbbGluZTBdO1xuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgc3BsaXQubGVuZ3RoOyBpICs9IDIpXG4gICAgICAgIGxpbmVzLnB1c2goW3NwbGl0W2ldLCBzcGxpdFtpICsgMV1dKTtcbiAgICByZXR1cm4gbGluZXM7XG59XG5cbmV4cG9ydHMucmVzb2x2ZUJsb2NrU2NhbGFyID0gcmVzb2x2ZUJsb2NrU2NhbGFyO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBTY2FsYXIgPSByZXF1aXJlKCcuLi9ub2Rlcy9TY2FsYXIuanMnKTtcbnZhciByZXNvbHZlRW5kID0gcmVxdWlyZSgnLi9yZXNvbHZlLWVuZC5qcycpO1xuXG5mdW5jdGlvbiByZXNvbHZlRmxvd1NjYWxhcihzY2FsYXIsIHN0cmljdCwgb25FcnJvcikge1xuICAgIGNvbnN0IHsgb2Zmc2V0LCB0eXBlLCBzb3VyY2UsIGVuZCB9ID0gc2NhbGFyO1xuICAgIGxldCBfdHlwZTtcbiAgICBsZXQgdmFsdWU7XG4gICAgY29uc3QgX29uRXJyb3IgPSAocmVsLCBjb2RlLCBtc2cpID0+IG9uRXJyb3Iob2Zmc2V0ICsgcmVsLCBjb2RlLCBtc2cpO1xuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICBjYXNlICdzY2FsYXInOlxuICAgICAgICAgICAgX3R5cGUgPSBTY2FsYXIuU2NhbGFyLlBMQUlOO1xuICAgICAgICAgICAgdmFsdWUgPSBwbGFpblZhbHVlKHNvdXJjZSwgX29uRXJyb3IpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3NpbmdsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgICAgIF90eXBlID0gU2NhbGFyLlNjYWxhci5RVU9URV9TSU5HTEU7XG4gICAgICAgICAgICB2YWx1ZSA9IHNpbmdsZVF1b3RlZFZhbHVlKHNvdXJjZSwgX29uRXJyb3IpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2RvdWJsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgICAgIF90eXBlID0gU2NhbGFyLlNjYWxhci5RVU9URV9ET1VCTEU7XG4gICAgICAgICAgICB2YWx1ZSA9IGRvdWJsZVF1b3RlZFZhbHVlKHNvdXJjZSwgX29uRXJyb3IpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0IHNob3VsZCBub3QgaGFwcGVuICovXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBvbkVycm9yKHNjYWxhciwgJ1VORVhQRUNURURfVE9LRU4nLCBgRXhwZWN0ZWQgYSBmbG93IHNjYWxhciB2YWx1ZSwgYnV0IGZvdW5kOiAke3R5cGV9YCk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHZhbHVlOiAnJyxcbiAgICAgICAgICAgICAgICB0eXBlOiBudWxsLFxuICAgICAgICAgICAgICAgIGNvbW1lbnQ6ICcnLFxuICAgICAgICAgICAgICAgIHJhbmdlOiBbb2Zmc2V0LCBvZmZzZXQgKyBzb3VyY2UubGVuZ3RoLCBvZmZzZXQgKyBzb3VyY2UubGVuZ3RoXVxuICAgICAgICAgICAgfTtcbiAgICB9XG4gICAgY29uc3QgdmFsdWVFbmQgPSBvZmZzZXQgKyBzb3VyY2UubGVuZ3RoO1xuICAgIGNvbnN0IHJlID0gcmVzb2x2ZUVuZC5yZXNvbHZlRW5kKGVuZCwgdmFsdWVFbmQsIHN0cmljdCwgb25FcnJvcik7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmFsdWUsXG4gICAgICAgIHR5cGU6IF90eXBlLFxuICAgICAgICBjb21tZW50OiByZS5jb21tZW50LFxuICAgICAgICByYW5nZTogW29mZnNldCwgdmFsdWVFbmQsIHJlLm9mZnNldF1cbiAgICB9O1xufVxuZnVuY3Rpb24gcGxhaW5WYWx1ZShzb3VyY2UsIG9uRXJyb3IpIHtcbiAgICBsZXQgYmFkQ2hhciA9ICcnO1xuICAgIHN3aXRjaCAoc291cmNlWzBdKSB7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0IHNob3VsZCBub3QgaGFwcGVuICovXG4gICAgICAgIGNhc2UgJ1xcdCc6XG4gICAgICAgICAgICBiYWRDaGFyID0gJ2EgdGFiIGNoYXJhY3Rlcic7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnLCc6XG4gICAgICAgICAgICBiYWRDaGFyID0gJ2Zsb3cgaW5kaWNhdG9yIGNoYXJhY3RlciAsJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICclJzpcbiAgICAgICAgICAgIGJhZENoYXIgPSAnZGlyZWN0aXZlIGluZGljYXRvciBjaGFyYWN0ZXIgJSc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnfCc6XG4gICAgICAgIGNhc2UgJz4nOiB7XG4gICAgICAgICAgICBiYWRDaGFyID0gYGJsb2NrIHNjYWxhciBpbmRpY2F0b3IgJHtzb3VyY2VbMF19YDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ0AnOlxuICAgICAgICBjYXNlICdgJzoge1xuICAgICAgICAgICAgYmFkQ2hhciA9IGByZXNlcnZlZCBjaGFyYWN0ZXIgJHtzb3VyY2VbMF19YDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChiYWRDaGFyKVxuICAgICAgICBvbkVycm9yKDAsICdCQURfU0NBTEFSX1NUQVJUJywgYFBsYWluIHZhbHVlIGNhbm5vdCBzdGFydCB3aXRoICR7YmFkQ2hhcn1gKTtcbiAgICByZXR1cm4gZm9sZExpbmVzKHNvdXJjZSk7XG59XG5mdW5jdGlvbiBzaW5nbGVRdW90ZWRWYWx1ZShzb3VyY2UsIG9uRXJyb3IpIHtcbiAgICBpZiAoc291cmNlW3NvdXJjZS5sZW5ndGggLSAxXSAhPT0gXCInXCIgfHwgc291cmNlLmxlbmd0aCA9PT0gMSlcbiAgICAgICAgb25FcnJvcihzb3VyY2UubGVuZ3RoLCAnTUlTU0lOR19DSEFSJywgXCJNaXNzaW5nIGNsb3NpbmcgJ3F1b3RlXCIpO1xuICAgIHJldHVybiBmb2xkTGluZXMoc291cmNlLnNsaWNlKDEsIC0xKSkucmVwbGFjZSgvJycvZywgXCInXCIpO1xufVxuZnVuY3Rpb24gZm9sZExpbmVzKHNvdXJjZSkge1xuICAgIC8qKlxuICAgICAqIFRoZSBuZWdhdGl2ZSBsb29rYmVoaW5kIGhlcmUgYW5kIGluIHRoZSBgcmVgIFJlZ0V4cCBpcyB0b1xuICAgICAqIHByZXZlbnQgY2F1c2luZyBhIHBvbHlub21pYWwgc2VhcmNoIHRpbWUgaW4gY2VydGFpbiBjYXNlcy5cbiAgICAgKlxuICAgICAqIFRoZSB0cnktY2F0Y2ggaXMgZm9yIFNhZmFyaSwgd2hpY2ggZG9lc24ndCBzdXBwb3J0IHRoaXMgeWV0OlxuICAgICAqIGh0dHBzOi8vY2FuaXVzZS5jb20vanMtcmVnZXhwLWxvb2tiZWhpbmRcbiAgICAgKi9cbiAgICBsZXQgZmlyc3QsIGxpbmU7XG4gICAgdHJ5IHtcbiAgICAgICAgZmlyc3QgPSBuZXcgUmVnRXhwKCcoLio/KSg/PCFbIFxcdF0pWyBcXHRdKlxccj9cXG4nLCAnc3knKTtcbiAgICAgICAgbGluZSA9IG5ldyBSZWdFeHAoJ1sgXFx0XSooLio/KSg/Oig/PCFbIFxcdF0pWyBcXHRdKik/XFxyP1xcbicsICdzeScpO1xuICAgIH1cbiAgICBjYXRjaCB7XG4gICAgICAgIGZpcnN0ID0gLyguKj8pWyBcXHRdKlxccj9cXG4vc3k7XG4gICAgICAgIGxpbmUgPSAvWyBcXHRdKiguKj8pWyBcXHRdKlxccj9cXG4vc3k7XG4gICAgfVxuICAgIGxldCBtYXRjaCA9IGZpcnN0LmV4ZWMoc291cmNlKTtcbiAgICBpZiAoIW1hdGNoKVxuICAgICAgICByZXR1cm4gc291cmNlO1xuICAgIGxldCByZXMgPSBtYXRjaFsxXTtcbiAgICBsZXQgc2VwID0gJyAnO1xuICAgIGxldCBwb3MgPSBmaXJzdC5sYXN0SW5kZXg7XG4gICAgbGluZS5sYXN0SW5kZXggPSBwb3M7XG4gICAgd2hpbGUgKChtYXRjaCA9IGxpbmUuZXhlYyhzb3VyY2UpKSkge1xuICAgICAgICBpZiAobWF0Y2hbMV0gPT09ICcnKSB7XG4gICAgICAgICAgICBpZiAoc2VwID09PSAnXFxuJylcbiAgICAgICAgICAgICAgICByZXMgKz0gc2VwO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHNlcCA9ICdcXG4nO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmVzICs9IHNlcCArIG1hdGNoWzFdO1xuICAgICAgICAgICAgc2VwID0gJyAnO1xuICAgICAgICB9XG4gICAgICAgIHBvcyA9IGxpbmUubGFzdEluZGV4O1xuICAgIH1cbiAgICBjb25zdCBsYXN0ID0gL1sgXFx0XSooLiopL3N5O1xuICAgIGxhc3QubGFzdEluZGV4ID0gcG9zO1xuICAgIG1hdGNoID0gbGFzdC5leGVjKHNvdXJjZSk7XG4gICAgcmV0dXJuIHJlcyArIHNlcCArIChtYXRjaD8uWzFdID8/ICcnKTtcbn1cbmZ1bmN0aW9uIGRvdWJsZVF1b3RlZFZhbHVlKHNvdXJjZSwgb25FcnJvcikge1xuICAgIGxldCByZXMgPSAnJztcbiAgICBmb3IgKGxldCBpID0gMTsgaSA8IHNvdXJjZS5sZW5ndGggLSAxOyArK2kpIHtcbiAgICAgICAgY29uc3QgY2ggPSBzb3VyY2VbaV07XG4gICAgICAgIGlmIChjaCA9PT0gJ1xccicgJiYgc291cmNlW2kgKyAxXSA9PT0gJ1xcbicpXG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgaWYgKGNoID09PSAnXFxuJykge1xuICAgICAgICAgICAgY29uc3QgeyBmb2xkLCBvZmZzZXQgfSA9IGZvbGROZXdsaW5lKHNvdXJjZSwgaSk7XG4gICAgICAgICAgICByZXMgKz0gZm9sZDtcbiAgICAgICAgICAgIGkgPSBvZmZzZXQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoY2ggPT09ICdcXFxcJykge1xuICAgICAgICAgICAgbGV0IG5leHQgPSBzb3VyY2VbKytpXTtcbiAgICAgICAgICAgIGNvbnN0IGNjID0gZXNjYXBlQ29kZXNbbmV4dF07XG4gICAgICAgICAgICBpZiAoY2MpXG4gICAgICAgICAgICAgICAgcmVzICs9IGNjO1xuICAgICAgICAgICAgZWxzZSBpZiAobmV4dCA9PT0gJ1xcbicpIHtcbiAgICAgICAgICAgICAgICAvLyBza2lwIGVzY2FwZWQgbmV3bGluZXMsIGJ1dCBzdGlsbCB0cmltIHRoZSBmb2xsb3dpbmcgbGluZVxuICAgICAgICAgICAgICAgIG5leHQgPSBzb3VyY2VbaSArIDFdO1xuICAgICAgICAgICAgICAgIHdoaWxlIChuZXh0ID09PSAnICcgfHwgbmV4dCA9PT0gJ1xcdCcpXG4gICAgICAgICAgICAgICAgICAgIG5leHQgPSBzb3VyY2VbKytpICsgMV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChuZXh0ID09PSAnXFxyJyAmJiBzb3VyY2VbaSArIDFdID09PSAnXFxuJykge1xuICAgICAgICAgICAgICAgIC8vIHNraXAgZXNjYXBlZCBDUkxGIG5ld2xpbmVzLCBidXQgc3RpbGwgdHJpbSB0aGUgZm9sbG93aW5nIGxpbmVcbiAgICAgICAgICAgICAgICBuZXh0ID0gc291cmNlWysraSArIDFdO1xuICAgICAgICAgICAgICAgIHdoaWxlIChuZXh0ID09PSAnICcgfHwgbmV4dCA9PT0gJ1xcdCcpXG4gICAgICAgICAgICAgICAgICAgIG5leHQgPSBzb3VyY2VbKytpICsgMV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChuZXh0ID09PSAneCcgfHwgbmV4dCA9PT0gJ3UnIHx8IG5leHQgPT09ICdVJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxlbmd0aCA9IHsgeDogMiwgdTogNCwgVTogOCB9W25leHRdO1xuICAgICAgICAgICAgICAgIHJlcyArPSBwYXJzZUNoYXJDb2RlKHNvdXJjZSwgaSArIDEsIGxlbmd0aCwgb25FcnJvcik7XG4gICAgICAgICAgICAgICAgaSArPSBsZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCByYXcgPSBzb3VyY2Uuc3Vic3RyKGkgLSAxLCAyKTtcbiAgICAgICAgICAgICAgICBvbkVycm9yKGkgLSAxLCAnQkFEX0RRX0VTQ0FQRScsIGBJbnZhbGlkIGVzY2FwZSBzZXF1ZW5jZSAke3Jhd31gKTtcbiAgICAgICAgICAgICAgICByZXMgKz0gcmF3O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGNoID09PSAnICcgfHwgY2ggPT09ICdcXHQnKSB7XG4gICAgICAgICAgICAvLyB0cmltIHRyYWlsaW5nIHdoaXRlc3BhY2VcbiAgICAgICAgICAgIGNvbnN0IHdzU3RhcnQgPSBpO1xuICAgICAgICAgICAgbGV0IG5leHQgPSBzb3VyY2VbaSArIDFdO1xuICAgICAgICAgICAgd2hpbGUgKG5leHQgPT09ICcgJyB8fCBuZXh0ID09PSAnXFx0JylcbiAgICAgICAgICAgICAgICBuZXh0ID0gc291cmNlWysraSArIDFdO1xuICAgICAgICAgICAgaWYgKG5leHQgIT09ICdcXG4nICYmICEobmV4dCA9PT0gJ1xccicgJiYgc291cmNlW2kgKyAyXSA9PT0gJ1xcbicpKVxuICAgICAgICAgICAgICAgIHJlcyArPSBpID4gd3NTdGFydCA/IHNvdXJjZS5zbGljZSh3c1N0YXJ0LCBpICsgMSkgOiBjaDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJlcyArPSBjaDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoc291cmNlW3NvdXJjZS5sZW5ndGggLSAxXSAhPT0gJ1wiJyB8fCBzb3VyY2UubGVuZ3RoID09PSAxKVxuICAgICAgICBvbkVycm9yKHNvdXJjZS5sZW5ndGgsICdNSVNTSU5HX0NIQVInLCAnTWlzc2luZyBjbG9zaW5nIFwicXVvdGUnKTtcbiAgICByZXR1cm4gcmVzO1xufVxuLyoqXG4gKiBGb2xkIGEgc2luZ2xlIG5ld2xpbmUgaW50byBhIHNwYWNlLCBtdWx0aXBsZSBuZXdsaW5lcyB0byBOIC0gMSBuZXdsaW5lcy5cbiAqIFByZXN1bWVzIGBzb3VyY2Vbb2Zmc2V0XSA9PT0gJ1xcbidgXG4gKi9cbmZ1bmN0aW9uIGZvbGROZXdsaW5lKHNvdXJjZSwgb2Zmc2V0KSB7XG4gICAgbGV0IGZvbGQgPSAnJztcbiAgICBsZXQgY2ggPSBzb3VyY2Vbb2Zmc2V0ICsgMV07XG4gICAgd2hpbGUgKGNoID09PSAnICcgfHwgY2ggPT09ICdcXHQnIHx8IGNoID09PSAnXFxuJyB8fCBjaCA9PT0gJ1xccicpIHtcbiAgICAgICAgaWYgKGNoID09PSAnXFxyJyAmJiBzb3VyY2Vbb2Zmc2V0ICsgMl0gIT09ICdcXG4nKVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGlmIChjaCA9PT0gJ1xcbicpXG4gICAgICAgICAgICBmb2xkICs9ICdcXG4nO1xuICAgICAgICBvZmZzZXQgKz0gMTtcbiAgICAgICAgY2ggPSBzb3VyY2Vbb2Zmc2V0ICsgMV07XG4gICAgfVxuICAgIGlmICghZm9sZClcbiAgICAgICAgZm9sZCA9ICcgJztcbiAgICByZXR1cm4geyBmb2xkLCBvZmZzZXQgfTtcbn1cbmNvbnN0IGVzY2FwZUNvZGVzID0ge1xuICAgICcwJzogJ1xcMCcsIC8vIG51bGwgY2hhcmFjdGVyXG4gICAgYTogJ1xceDA3JywgLy8gYmVsbCBjaGFyYWN0ZXJcbiAgICBiOiAnXFxiJywgLy8gYmFja3NwYWNlXG4gICAgZTogJ1xceDFiJywgLy8gZXNjYXBlIGNoYXJhY3RlclxuICAgIGY6ICdcXGYnLCAvLyBmb3JtIGZlZWRcbiAgICBuOiAnXFxuJywgLy8gbGluZSBmZWVkXG4gICAgcjogJ1xccicsIC8vIGNhcnJpYWdlIHJldHVyblxuICAgIHQ6ICdcXHQnLCAvLyBob3Jpem9udGFsIHRhYlxuICAgIHY6ICdcXHYnLCAvLyB2ZXJ0aWNhbCB0YWJcbiAgICBOOiAnXFx1MDA4NScsIC8vIFVuaWNvZGUgbmV4dCBsaW5lXG4gICAgXzogJ1xcdTAwYTAnLCAvLyBVbmljb2RlIG5vbi1icmVha2luZyBzcGFjZVxuICAgIEw6ICdcXHUyMDI4JywgLy8gVW5pY29kZSBsaW5lIHNlcGFyYXRvclxuICAgIFA6ICdcXHUyMDI5JywgLy8gVW5pY29kZSBwYXJhZ3JhcGggc2VwYXJhdG9yXG4gICAgJyAnOiAnICcsXG4gICAgJ1wiJzogJ1wiJyxcbiAgICAnLyc6ICcvJyxcbiAgICAnXFxcXCc6ICdcXFxcJyxcbiAgICAnXFx0JzogJ1xcdCdcbn07XG5mdW5jdGlvbiBwYXJzZUNoYXJDb2RlKHNvdXJjZSwgb2Zmc2V0LCBsZW5ndGgsIG9uRXJyb3IpIHtcbiAgICBjb25zdCBjYyA9IHNvdXJjZS5zdWJzdHIob2Zmc2V0LCBsZW5ndGgpO1xuICAgIGNvbnN0IG9rID0gY2MubGVuZ3RoID09PSBsZW5ndGggJiYgL15bMC05YS1mQS1GXSskLy50ZXN0KGNjKTtcbiAgICBjb25zdCBjb2RlID0gb2sgPyBwYXJzZUludChjYywgMTYpIDogTmFOO1xuICAgIGlmIChpc05hTihjb2RlKSkge1xuICAgICAgICBjb25zdCByYXcgPSBzb3VyY2Uuc3Vic3RyKG9mZnNldCAtIDIsIGxlbmd0aCArIDIpO1xuICAgICAgICBvbkVycm9yKG9mZnNldCAtIDIsICdCQURfRFFfRVNDQVBFJywgYEludmFsaWQgZXNjYXBlIHNlcXVlbmNlICR7cmF3fWApO1xuICAgICAgICByZXR1cm4gcmF3O1xuICAgIH1cbiAgICByZXR1cm4gU3RyaW5nLmZyb21Db2RlUG9pbnQoY29kZSk7XG59XG5cbmV4cG9ydHMucmVzb2x2ZUZsb3dTY2FsYXIgPSByZXNvbHZlRmxvd1NjYWxhcjtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuLi9ub2Rlcy9pZGVudGl0eS5qcycpO1xudmFyIFNjYWxhciA9IHJlcXVpcmUoJy4uL25vZGVzL1NjYWxhci5qcycpO1xudmFyIHJlc29sdmVCbG9ja1NjYWxhciA9IHJlcXVpcmUoJy4vcmVzb2x2ZS1ibG9jay1zY2FsYXIuanMnKTtcbnZhciByZXNvbHZlRmxvd1NjYWxhciA9IHJlcXVpcmUoJy4vcmVzb2x2ZS1mbG93LXNjYWxhci5qcycpO1xuXG5mdW5jdGlvbiBjb21wb3NlU2NhbGFyKGN0eCwgdG9rZW4sIHRhZ1Rva2VuLCBvbkVycm9yKSB7XG4gICAgY29uc3QgeyB2YWx1ZSwgdHlwZSwgY29tbWVudCwgcmFuZ2UgfSA9IHRva2VuLnR5cGUgPT09ICdibG9jay1zY2FsYXInXG4gICAgICAgID8gcmVzb2x2ZUJsb2NrU2NhbGFyLnJlc29sdmVCbG9ja1NjYWxhcihjdHgsIHRva2VuLCBvbkVycm9yKVxuICAgICAgICA6IHJlc29sdmVGbG93U2NhbGFyLnJlc29sdmVGbG93U2NhbGFyKHRva2VuLCBjdHgub3B0aW9ucy5zdHJpY3QsIG9uRXJyb3IpO1xuICAgIGNvbnN0IHRhZ05hbWUgPSB0YWdUb2tlblxuICAgICAgICA/IGN0eC5kaXJlY3RpdmVzLnRhZ05hbWUodGFnVG9rZW4uc291cmNlLCBtc2cgPT4gb25FcnJvcih0YWdUb2tlbiwgJ1RBR19SRVNPTFZFX0ZBSUxFRCcsIG1zZykpXG4gICAgICAgIDogbnVsbDtcbiAgICBsZXQgdGFnO1xuICAgIGlmIChjdHgub3B0aW9ucy5zdHJpbmdLZXlzICYmIGN0eC5hdEtleSkge1xuICAgICAgICB0YWcgPSBjdHguc2NoZW1hW2lkZW50aXR5LlNDQUxBUl07XG4gICAgfVxuICAgIGVsc2UgaWYgKHRhZ05hbWUpXG4gICAgICAgIHRhZyA9IGZpbmRTY2FsYXJUYWdCeU5hbWUoY3R4LnNjaGVtYSwgdmFsdWUsIHRhZ05hbWUsIHRhZ1Rva2VuLCBvbkVycm9yKTtcbiAgICBlbHNlIGlmICh0b2tlbi50eXBlID09PSAnc2NhbGFyJylcbiAgICAgICAgdGFnID0gZmluZFNjYWxhclRhZ0J5VGVzdChjdHgsIHZhbHVlLCB0b2tlbiwgb25FcnJvcik7XG4gICAgZWxzZVxuICAgICAgICB0YWcgPSBjdHguc2NoZW1hW2lkZW50aXR5LlNDQUxBUl07XG4gICAgbGV0IHNjYWxhcjtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZXMgPSB0YWcucmVzb2x2ZSh2YWx1ZSwgbXNnID0+IG9uRXJyb3IodGFnVG9rZW4gPz8gdG9rZW4sICdUQUdfUkVTT0xWRV9GQUlMRUQnLCBtc2cpLCBjdHgub3B0aW9ucyk7XG4gICAgICAgIHNjYWxhciA9IGlkZW50aXR5LmlzU2NhbGFyKHJlcykgPyByZXMgOiBuZXcgU2NhbGFyLlNjYWxhcihyZXMpO1xuICAgIH1cbiAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbXNnID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICBvbkVycm9yKHRhZ1Rva2VuID8/IHRva2VuLCAnVEFHX1JFU09MVkVfRkFJTEVEJywgbXNnKTtcbiAgICAgICAgc2NhbGFyID0gbmV3IFNjYWxhci5TY2FsYXIodmFsdWUpO1xuICAgIH1cbiAgICBzY2FsYXIucmFuZ2UgPSByYW5nZTtcbiAgICBzY2FsYXIuc291cmNlID0gdmFsdWU7XG4gICAgaWYgKHR5cGUpXG4gICAgICAgIHNjYWxhci50eXBlID0gdHlwZTtcbiAgICBpZiAodGFnTmFtZSlcbiAgICAgICAgc2NhbGFyLnRhZyA9IHRhZ05hbWU7XG4gICAgaWYgKHRhZy5mb3JtYXQpXG4gICAgICAgIHNjYWxhci5mb3JtYXQgPSB0YWcuZm9ybWF0O1xuICAgIGlmIChjb21tZW50KVxuICAgICAgICBzY2FsYXIuY29tbWVudCA9IGNvbW1lbnQ7XG4gICAgcmV0dXJuIHNjYWxhcjtcbn1cbmZ1bmN0aW9uIGZpbmRTY2FsYXJUYWdCeU5hbWUoc2NoZW1hLCB2YWx1ZSwgdGFnTmFtZSwgdGFnVG9rZW4sIG9uRXJyb3IpIHtcbiAgICBpZiAodGFnTmFtZSA9PT0gJyEnKVxuICAgICAgICByZXR1cm4gc2NoZW1hW2lkZW50aXR5LlNDQUxBUl07IC8vIG5vbi1zcGVjaWZpYyB0YWdcbiAgICBjb25zdCBtYXRjaFdpdGhUZXN0ID0gW107XG4gICAgZm9yIChjb25zdCB0YWcgb2Ygc2NoZW1hLnRhZ3MpIHtcbiAgICAgICAgaWYgKCF0YWcuY29sbGVjdGlvbiAmJiB0YWcudGFnID09PSB0YWdOYW1lKSB7XG4gICAgICAgICAgICBpZiAodGFnLmRlZmF1bHQgJiYgdGFnLnRlc3QpXG4gICAgICAgICAgICAgICAgbWF0Y2hXaXRoVGVzdC5wdXNoKHRhZyk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhZztcbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGNvbnN0IHRhZyBvZiBtYXRjaFdpdGhUZXN0KVxuICAgICAgICBpZiAodGFnLnRlc3Q/LnRlc3QodmFsdWUpKVxuICAgICAgICAgICAgcmV0dXJuIHRhZztcbiAgICBjb25zdCBrdCA9IHNjaGVtYS5rbm93blRhZ3NbdGFnTmFtZV07XG4gICAgaWYgKGt0ICYmICFrdC5jb2xsZWN0aW9uKSB7XG4gICAgICAgIC8vIEVuc3VyZSB0aGF0IHRoZSBrbm93biB0YWcgaXMgYXZhaWxhYmxlIGZvciBzdHJpbmdpZnlpbmcsXG4gICAgICAgIC8vIGJ1dCBkb2VzIG5vdCBnZXQgdXNlZCBieSBkZWZhdWx0LlxuICAgICAgICBzY2hlbWEudGFncy5wdXNoKE9iamVjdC5hc3NpZ24oe30sIGt0LCB7IGRlZmF1bHQ6IGZhbHNlLCB0ZXN0OiB1bmRlZmluZWQgfSkpO1xuICAgICAgICByZXR1cm4ga3Q7XG4gICAgfVxuICAgIG9uRXJyb3IodGFnVG9rZW4sICdUQUdfUkVTT0xWRV9GQUlMRUQnLCBgVW5yZXNvbHZlZCB0YWc6ICR7dGFnTmFtZX1gLCB0YWdOYW1lICE9PSAndGFnOnlhbWwub3JnLDIwMDI6c3RyJyk7XG4gICAgcmV0dXJuIHNjaGVtYVtpZGVudGl0eS5TQ0FMQVJdO1xufVxuZnVuY3Rpb24gZmluZFNjYWxhclRhZ0J5VGVzdCh7IGF0S2V5LCBkaXJlY3RpdmVzLCBzY2hlbWEgfSwgdmFsdWUsIHRva2VuLCBvbkVycm9yKSB7XG4gICAgY29uc3QgdGFnID0gc2NoZW1hLnRhZ3MuZmluZCh0YWcgPT4gKHRhZy5kZWZhdWx0ID09PSB0cnVlIHx8IChhdEtleSAmJiB0YWcuZGVmYXVsdCA9PT0gJ2tleScpKSAmJlxuICAgICAgICB0YWcudGVzdD8udGVzdCh2YWx1ZSkpIHx8IHNjaGVtYVtpZGVudGl0eS5TQ0FMQVJdO1xuICAgIGlmIChzY2hlbWEuY29tcGF0KSB7XG4gICAgICAgIGNvbnN0IGNvbXBhdCA9IHNjaGVtYS5jb21wYXQuZmluZCh0YWcgPT4gdGFnLmRlZmF1bHQgJiYgdGFnLnRlc3Q/LnRlc3QodmFsdWUpKSA/P1xuICAgICAgICAgICAgc2NoZW1hW2lkZW50aXR5LlNDQUxBUl07XG4gICAgICAgIGlmICh0YWcudGFnICE9PSBjb21wYXQudGFnKSB7XG4gICAgICAgICAgICBjb25zdCB0cyA9IGRpcmVjdGl2ZXMudGFnU3RyaW5nKHRhZy50YWcpO1xuICAgICAgICAgICAgY29uc3QgY3MgPSBkaXJlY3RpdmVzLnRhZ1N0cmluZyhjb21wYXQudGFnKTtcbiAgICAgICAgICAgIGNvbnN0IG1zZyA9IGBWYWx1ZSBtYXkgYmUgcGFyc2VkIGFzIGVpdGhlciAke3RzfSBvciAke2NzfWA7XG4gICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnVEFHX1JFU09MVkVfRkFJTEVEJywgbXNnLCB0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGFnO1xufVxuXG5leHBvcnRzLmNvbXBvc2VTY2FsYXIgPSBjb21wb3NlU2NhbGFyO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIGVtcHR5U2NhbGFyUG9zaXRpb24ob2Zmc2V0LCBiZWZvcmUsIHBvcykge1xuICAgIGlmIChiZWZvcmUpIHtcbiAgICAgICAgcG9zID8/IChwb3MgPSBiZWZvcmUubGVuZ3RoKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IHBvcyAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgICAgICBsZXQgc3QgPSBiZWZvcmVbaV07XG4gICAgICAgICAgICBzd2l0Y2ggKHN0LnR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgICAgICAgICAgY2FzZSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgICAgICAgIG9mZnNldCAtPSBzdC5zb3VyY2UubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFRlY2huaWNhbGx5LCBhbiBlbXB0eSBzY2FsYXIgaXMgaW1tZWRpYXRlbHkgYWZ0ZXIgdGhlIGxhc3Qgbm9uLWVtcHR5XG4gICAgICAgICAgICAvLyBub2RlLCBidXQgaXQncyBtb3JlIHVzZWZ1bCB0byBwbGFjZSBpdCBhZnRlciBhbnkgd2hpdGVzcGFjZS5cbiAgICAgICAgICAgIHN0ID0gYmVmb3JlWysraV07XG4gICAgICAgICAgICB3aGlsZSAoc3Q/LnR5cGUgPT09ICdzcGFjZScpIHtcbiAgICAgICAgICAgICAgICBvZmZzZXQgKz0gc3Quc291cmNlLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBzdCA9IGJlZm9yZVsrK2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9mZnNldDtcbn1cblxuZXhwb3J0cy5lbXB0eVNjYWxhclBvc2l0aW9uID0gZW1wdHlTY2FsYXJQb3NpdGlvbjtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQWxpYXMgPSByZXF1aXJlKCcuLi9ub2Rlcy9BbGlhcy5qcycpO1xudmFyIGlkZW50aXR5ID0gcmVxdWlyZSgnLi4vbm9kZXMvaWRlbnRpdHkuanMnKTtcbnZhciBjb21wb3NlQ29sbGVjdGlvbiA9IHJlcXVpcmUoJy4vY29tcG9zZS1jb2xsZWN0aW9uLmpzJyk7XG52YXIgY29tcG9zZVNjYWxhciA9IHJlcXVpcmUoJy4vY29tcG9zZS1zY2FsYXIuanMnKTtcbnZhciByZXNvbHZlRW5kID0gcmVxdWlyZSgnLi9yZXNvbHZlLWVuZC5qcycpO1xudmFyIHV0aWxFbXB0eVNjYWxhclBvc2l0aW9uID0gcmVxdWlyZSgnLi91dGlsLWVtcHR5LXNjYWxhci1wb3NpdGlvbi5qcycpO1xuXG5jb25zdCBDTiA9IHsgY29tcG9zZU5vZGUsIGNvbXBvc2VFbXB0eU5vZGUgfTtcbmZ1bmN0aW9uIGNvbXBvc2VOb2RlKGN0eCwgdG9rZW4sIHByb3BzLCBvbkVycm9yKSB7XG4gICAgY29uc3QgYXRLZXkgPSBjdHguYXRLZXk7XG4gICAgY29uc3QgeyBzcGFjZUJlZm9yZSwgY29tbWVudCwgYW5jaG9yLCB0YWcgfSA9IHByb3BzO1xuICAgIGxldCBub2RlO1xuICAgIGxldCBpc1NyY1Rva2VuID0gdHJ1ZTtcbiAgICBzd2l0Y2ggKHRva2VuLnR5cGUpIHtcbiAgICAgICAgY2FzZSAnYWxpYXMnOlxuICAgICAgICAgICAgbm9kZSA9IGNvbXBvc2VBbGlhcyhjdHgsIHRva2VuLCBvbkVycm9yKTtcbiAgICAgICAgICAgIGlmIChhbmNob3IgfHwgdGFnKVxuICAgICAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdBTElBU19QUk9QUycsICdBbiBhbGlhcyBub2RlIG11c3Qgbm90IHNwZWNpZnkgYW55IHByb3BlcnRpZXMnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdzY2FsYXInOlxuICAgICAgICBjYXNlICdzaW5nbGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgIGNhc2UgJ2RvdWJsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgY2FzZSAnYmxvY2stc2NhbGFyJzpcbiAgICAgICAgICAgIG5vZGUgPSBjb21wb3NlU2NhbGFyLmNvbXBvc2VTY2FsYXIoY3R4LCB0b2tlbiwgdGFnLCBvbkVycm9yKTtcbiAgICAgICAgICAgIGlmIChhbmNob3IpXG4gICAgICAgICAgICAgICAgbm9kZS5hbmNob3IgPSBhbmNob3Iuc291cmNlLnN1YnN0cmluZygxKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdibG9jay1tYXAnOlxuICAgICAgICBjYXNlICdibG9jay1zZXEnOlxuICAgICAgICBjYXNlICdmbG93LWNvbGxlY3Rpb24nOlxuICAgICAgICAgICAgbm9kZSA9IGNvbXBvc2VDb2xsZWN0aW9uLmNvbXBvc2VDb2xsZWN0aW9uKENOLCBjdHgsIHRva2VuLCBwcm9wcywgb25FcnJvcik7XG4gICAgICAgICAgICBpZiAoYW5jaG9yKVxuICAgICAgICAgICAgICAgIG5vZGUuYW5jaG9yID0gYW5jaG9yLnNvdXJjZS5zdWJzdHJpbmcoMSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9IHRva2VuLnR5cGUgPT09ICdlcnJvcidcbiAgICAgICAgICAgICAgICA/IHRva2VuLm1lc3NhZ2VcbiAgICAgICAgICAgICAgICA6IGBVbnN1cHBvcnRlZCB0b2tlbiAodHlwZTogJHt0b2tlbi50eXBlfSlgO1xuICAgICAgICAgICAgb25FcnJvcih0b2tlbiwgJ1VORVhQRUNURURfVE9LRU4nLCBtZXNzYWdlKTtcbiAgICAgICAgICAgIG5vZGUgPSBjb21wb3NlRW1wdHlOb2RlKGN0eCwgdG9rZW4ub2Zmc2V0LCB1bmRlZmluZWQsIG51bGwsIHByb3BzLCBvbkVycm9yKTtcbiAgICAgICAgICAgIGlzU3JjVG9rZW4gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoYW5jaG9yICYmIG5vZGUuYW5jaG9yID09PSAnJylcbiAgICAgICAgb25FcnJvcihhbmNob3IsICdCQURfQUxJQVMnLCAnQW5jaG9yIGNhbm5vdCBiZSBhbiBlbXB0eSBzdHJpbmcnKTtcbiAgICBpZiAoYXRLZXkgJiZcbiAgICAgICAgY3R4Lm9wdGlvbnMuc3RyaW5nS2V5cyAmJlxuICAgICAgICAoIWlkZW50aXR5LmlzU2NhbGFyKG5vZGUpIHx8XG4gICAgICAgICAgICB0eXBlb2Ygbm9kZS52YWx1ZSAhPT0gJ3N0cmluZycgfHxcbiAgICAgICAgICAgIChub2RlLnRhZyAmJiBub2RlLnRhZyAhPT0gJ3RhZzp5YW1sLm9yZywyMDAyOnN0cicpKSkge1xuICAgICAgICBjb25zdCBtc2cgPSAnV2l0aCBzdHJpbmdLZXlzLCBhbGwga2V5cyBtdXN0IGJlIHN0cmluZ3MnO1xuICAgICAgICBvbkVycm9yKHRhZyA/PyB0b2tlbiwgJ05PTl9TVFJJTkdfS0VZJywgbXNnKTtcbiAgICB9XG4gICAgaWYgKHNwYWNlQmVmb3JlKVxuICAgICAgICBub2RlLnNwYWNlQmVmb3JlID0gdHJ1ZTtcbiAgICBpZiAoY29tbWVudCkge1xuICAgICAgICBpZiAodG9rZW4udHlwZSA9PT0gJ3NjYWxhcicgJiYgdG9rZW4uc291cmNlID09PSAnJylcbiAgICAgICAgICAgIG5vZGUuY29tbWVudCA9IGNvbW1lbnQ7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG5vZGUuY29tbWVudEJlZm9yZSA9IGNvbW1lbnQ7XG4gICAgfVxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgVHlwZSBjaGVja2luZyBtaXNzZXMgbWVhbmluZyBvZiBpc1NyY1Rva2VuXG4gICAgaWYgKGN0eC5vcHRpb25zLmtlZXBTb3VyY2VUb2tlbnMgJiYgaXNTcmNUb2tlbilcbiAgICAgICAgbm9kZS5zcmNUb2tlbiA9IHRva2VuO1xuICAgIHJldHVybiBub2RlO1xufVxuZnVuY3Rpb24gY29tcG9zZUVtcHR5Tm9kZShjdHgsIG9mZnNldCwgYmVmb3JlLCBwb3MsIHsgc3BhY2VCZWZvcmUsIGNvbW1lbnQsIGFuY2hvciwgdGFnLCBlbmQgfSwgb25FcnJvcikge1xuICAgIGNvbnN0IHRva2VuID0ge1xuICAgICAgICB0eXBlOiAnc2NhbGFyJyxcbiAgICAgICAgb2Zmc2V0OiB1dGlsRW1wdHlTY2FsYXJQb3NpdGlvbi5lbXB0eVNjYWxhclBvc2l0aW9uKG9mZnNldCwgYmVmb3JlLCBwb3MpLFxuICAgICAgICBpbmRlbnQ6IC0xLFxuICAgICAgICBzb3VyY2U6ICcnXG4gICAgfTtcbiAgICBjb25zdCBub2RlID0gY29tcG9zZVNjYWxhci5jb21wb3NlU2NhbGFyKGN0eCwgdG9rZW4sIHRhZywgb25FcnJvcik7XG4gICAgaWYgKGFuY2hvcikge1xuICAgICAgICBub2RlLmFuY2hvciA9IGFuY2hvci5zb3VyY2Uuc3Vic3RyaW5nKDEpO1xuICAgICAgICBpZiAobm9kZS5hbmNob3IgPT09ICcnKVxuICAgICAgICAgICAgb25FcnJvcihhbmNob3IsICdCQURfQUxJQVMnLCAnQW5jaG9yIGNhbm5vdCBiZSBhbiBlbXB0eSBzdHJpbmcnKTtcbiAgICB9XG4gICAgaWYgKHNwYWNlQmVmb3JlKVxuICAgICAgICBub2RlLnNwYWNlQmVmb3JlID0gdHJ1ZTtcbiAgICBpZiAoY29tbWVudCkge1xuICAgICAgICBub2RlLmNvbW1lbnQgPSBjb21tZW50O1xuICAgICAgICBub2RlLnJhbmdlWzJdID0gZW5kO1xuICAgIH1cbiAgICByZXR1cm4gbm9kZTtcbn1cbmZ1bmN0aW9uIGNvbXBvc2VBbGlhcyh7IG9wdGlvbnMgfSwgeyBvZmZzZXQsIHNvdXJjZSwgZW5kIH0sIG9uRXJyb3IpIHtcbiAgICBjb25zdCBhbGlhcyA9IG5ldyBBbGlhcy5BbGlhcyhzb3VyY2Uuc3Vic3RyaW5nKDEpKTtcbiAgICBpZiAoYWxpYXMuc291cmNlID09PSAnJylcbiAgICAgICAgb25FcnJvcihvZmZzZXQsICdCQURfQUxJQVMnLCAnQWxpYXMgY2Fubm90IGJlIGFuIGVtcHR5IHN0cmluZycpO1xuICAgIGlmIChhbGlhcy5zb3VyY2UuZW5kc1dpdGgoJzonKSlcbiAgICAgICAgb25FcnJvcihvZmZzZXQgKyBzb3VyY2UubGVuZ3RoIC0gMSwgJ0JBRF9BTElBUycsICdBbGlhcyBlbmRpbmcgaW4gOiBpcyBhbWJpZ3VvdXMnLCB0cnVlKTtcbiAgICBjb25zdCB2YWx1ZUVuZCA9IG9mZnNldCArIHNvdXJjZS5sZW5ndGg7XG4gICAgY29uc3QgcmUgPSByZXNvbHZlRW5kLnJlc29sdmVFbmQoZW5kLCB2YWx1ZUVuZCwgb3B0aW9ucy5zdHJpY3QsIG9uRXJyb3IpO1xuICAgIGFsaWFzLnJhbmdlID0gW29mZnNldCwgdmFsdWVFbmQsIHJlLm9mZnNldF07XG4gICAgaWYgKHJlLmNvbW1lbnQpXG4gICAgICAgIGFsaWFzLmNvbW1lbnQgPSByZS5jb21tZW50O1xuICAgIHJldHVybiBhbGlhcztcbn1cblxuZXhwb3J0cy5jb21wb3NlRW1wdHlOb2RlID0gY29tcG9zZUVtcHR5Tm9kZTtcbmV4cG9ydHMuY29tcG9zZU5vZGUgPSBjb21wb3NlTm9kZTtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgRG9jdW1lbnQgPSByZXF1aXJlKCcuLi9kb2MvRG9jdW1lbnQuanMnKTtcbnZhciBjb21wb3NlTm9kZSA9IHJlcXVpcmUoJy4vY29tcG9zZS1ub2RlLmpzJyk7XG52YXIgcmVzb2x2ZUVuZCA9IHJlcXVpcmUoJy4vcmVzb2x2ZS1lbmQuanMnKTtcbnZhciByZXNvbHZlUHJvcHMgPSByZXF1aXJlKCcuL3Jlc29sdmUtcHJvcHMuanMnKTtcblxuZnVuY3Rpb24gY29tcG9zZURvYyhvcHRpb25zLCBkaXJlY3RpdmVzLCB7IG9mZnNldCwgc3RhcnQsIHZhbHVlLCBlbmQgfSwgb25FcnJvcikge1xuICAgIGNvbnN0IG9wdHMgPSBPYmplY3QuYXNzaWduKHsgX2RpcmVjdGl2ZXM6IGRpcmVjdGl2ZXMgfSwgb3B0aW9ucyk7XG4gICAgY29uc3QgZG9jID0gbmV3IERvY3VtZW50LkRvY3VtZW50KHVuZGVmaW5lZCwgb3B0cyk7XG4gICAgY29uc3QgY3R4ID0ge1xuICAgICAgICBhdEtleTogZmFsc2UsXG4gICAgICAgIGF0Um9vdDogdHJ1ZSxcbiAgICAgICAgZGlyZWN0aXZlczogZG9jLmRpcmVjdGl2ZXMsXG4gICAgICAgIG9wdGlvbnM6IGRvYy5vcHRpb25zLFxuICAgICAgICBzY2hlbWE6IGRvYy5zY2hlbWFcbiAgICB9O1xuICAgIGNvbnN0IHByb3BzID0gcmVzb2x2ZVByb3BzLnJlc29sdmVQcm9wcyhzdGFydCwge1xuICAgICAgICBpbmRpY2F0b3I6ICdkb2Mtc3RhcnQnLFxuICAgICAgICBuZXh0OiB2YWx1ZSA/PyBlbmQ/LlswXSxcbiAgICAgICAgb2Zmc2V0LFxuICAgICAgICBvbkVycm9yLFxuICAgICAgICBwYXJlbnRJbmRlbnQ6IDAsXG4gICAgICAgIHN0YXJ0T25OZXdsaW5lOiB0cnVlXG4gICAgfSk7XG4gICAgaWYgKHByb3BzLmZvdW5kKSB7XG4gICAgICAgIGRvYy5kaXJlY3RpdmVzLmRvY1N0YXJ0ID0gdHJ1ZTtcbiAgICAgICAgaWYgKHZhbHVlICYmXG4gICAgICAgICAgICAodmFsdWUudHlwZSA9PT0gJ2Jsb2NrLW1hcCcgfHwgdmFsdWUudHlwZSA9PT0gJ2Jsb2NrLXNlcScpICYmXG4gICAgICAgICAgICAhcHJvcHMuaGFzTmV3bGluZSlcbiAgICAgICAgICAgIG9uRXJyb3IocHJvcHMuZW5kLCAnTUlTU0lOR19DSEFSJywgJ0Jsb2NrIGNvbGxlY3Rpb24gY2Fubm90IHN0YXJ0IG9uIHNhbWUgbGluZSB3aXRoIGRpcmVjdGl2ZXMtZW5kIG1hcmtlcicpO1xuICAgIH1cbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIElmIENvbnRlbnRzIGlzIHNldCwgbGV0J3MgdHJ1c3QgdGhlIHVzZXJcbiAgICBkb2MuY29udGVudHMgPSB2YWx1ZVxuICAgICAgICA/IGNvbXBvc2VOb2RlLmNvbXBvc2VOb2RlKGN0eCwgdmFsdWUsIHByb3BzLCBvbkVycm9yKVxuICAgICAgICA6IGNvbXBvc2VOb2RlLmNvbXBvc2VFbXB0eU5vZGUoY3R4LCBwcm9wcy5lbmQsIHN0YXJ0LCBudWxsLCBwcm9wcywgb25FcnJvcik7XG4gICAgY29uc3QgY29udGVudEVuZCA9IGRvYy5jb250ZW50cy5yYW5nZVsyXTtcbiAgICBjb25zdCByZSA9IHJlc29sdmVFbmQucmVzb2x2ZUVuZChlbmQsIGNvbnRlbnRFbmQsIGZhbHNlLCBvbkVycm9yKTtcbiAgICBpZiAocmUuY29tbWVudClcbiAgICAgICAgZG9jLmNvbW1lbnQgPSByZS5jb21tZW50O1xuICAgIGRvYy5yYW5nZSA9IFtvZmZzZXQsIGNvbnRlbnRFbmQsIHJlLm9mZnNldF07XG4gICAgcmV0dXJuIGRvYztcbn1cblxuZXhwb3J0cy5jb21wb3NlRG9jID0gY29tcG9zZURvYztcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbm9kZV9wcm9jZXNzID0gcmVxdWlyZSgncHJvY2VzcycpO1xudmFyIGRpcmVjdGl2ZXMgPSByZXF1aXJlKCcuLi9kb2MvZGlyZWN0aXZlcy5qcycpO1xudmFyIERvY3VtZW50ID0gcmVxdWlyZSgnLi4vZG9jL0RvY3VtZW50LmpzJyk7XG52YXIgZXJyb3JzID0gcmVxdWlyZSgnLi4vZXJyb3JzLmpzJyk7XG52YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuLi9ub2Rlcy9pZGVudGl0eS5qcycpO1xudmFyIGNvbXBvc2VEb2MgPSByZXF1aXJlKCcuL2NvbXBvc2UtZG9jLmpzJyk7XG52YXIgcmVzb2x2ZUVuZCA9IHJlcXVpcmUoJy4vcmVzb2x2ZS1lbmQuanMnKTtcblxuZnVuY3Rpb24gZ2V0RXJyb3JQb3Moc3JjKSB7XG4gICAgaWYgKHR5cGVvZiBzcmMgPT09ICdudW1iZXInKVxuICAgICAgICByZXR1cm4gW3NyYywgc3JjICsgMV07XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoc3JjKSlcbiAgICAgICAgcmV0dXJuIHNyYy5sZW5ndGggPT09IDIgPyBzcmMgOiBbc3JjWzBdLCBzcmNbMV1dO1xuICAgIGNvbnN0IHsgb2Zmc2V0LCBzb3VyY2UgfSA9IHNyYztcbiAgICByZXR1cm4gW29mZnNldCwgb2Zmc2V0ICsgKHR5cGVvZiBzb3VyY2UgPT09ICdzdHJpbmcnID8gc291cmNlLmxlbmd0aCA6IDEpXTtcbn1cbmZ1bmN0aW9uIHBhcnNlUHJlbHVkZShwcmVsdWRlKSB7XG4gICAgbGV0IGNvbW1lbnQgPSAnJztcbiAgICBsZXQgYXRDb21tZW50ID0gZmFsc2U7XG4gICAgbGV0IGFmdGVyRW1wdHlMaW5lID0gZmFsc2U7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcmVsdWRlLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGNvbnN0IHNvdXJjZSA9IHByZWx1ZGVbaV07XG4gICAgICAgIHN3aXRjaCAoc291cmNlWzBdKSB7XG4gICAgICAgICAgICBjYXNlICcjJzpcbiAgICAgICAgICAgICAgICBjb21tZW50ICs9XG4gICAgICAgICAgICAgICAgICAgIChjb21tZW50ID09PSAnJyA/ICcnIDogYWZ0ZXJFbXB0eUxpbmUgPyAnXFxuXFxuJyA6ICdcXG4nKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAoc291cmNlLnN1YnN0cmluZygxKSB8fCAnICcpO1xuICAgICAgICAgICAgICAgIGF0Q29tbWVudCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYWZ0ZXJFbXB0eUxpbmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJyUnOlxuICAgICAgICAgICAgICAgIGlmIChwcmVsdWRlW2kgKyAxXT8uWzBdICE9PSAnIycpXG4gICAgICAgICAgICAgICAgICAgIGkgKz0gMTtcbiAgICAgICAgICAgICAgICBhdENvbW1lbnQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgLy8gVGhpcyBtYXkgYmUgd3JvbmcgYWZ0ZXIgZG9jLWVuZCwgYnV0IGluIHRoYXQgY2FzZSBpdCBkb2Vzbid0IG1hdHRlclxuICAgICAgICAgICAgICAgIGlmICghYXRDb21tZW50KVxuICAgICAgICAgICAgICAgICAgICBhZnRlckVtcHR5TGluZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgYXRDb21tZW50ID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHsgY29tbWVudCwgYWZ0ZXJFbXB0eUxpbmUgfTtcbn1cbi8qKlxuICogQ29tcG9zZSBhIHN0cmVhbSBvZiBDU1Qgbm9kZXMgaW50byBhIHN0cmVhbSBvZiBZQU1MIERvY3VtZW50cy5cbiAqXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgQ29tcG9zZXIsIFBhcnNlciB9IGZyb20gJ3lhbWwnXG4gKlxuICogY29uc3Qgc3JjOiBzdHJpbmcgPSAuLi5cbiAqIGNvbnN0IHRva2VucyA9IG5ldyBQYXJzZXIoKS5wYXJzZShzcmMpXG4gKiBjb25zdCBkb2NzID0gbmV3IENvbXBvc2VyKCkuY29tcG9zZSh0b2tlbnMpXG4gKiBgYGBcbiAqL1xuY2xhc3MgQ29tcG9zZXIge1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgICAgICB0aGlzLmRvYyA9IG51bGw7XG4gICAgICAgIHRoaXMuYXREaXJlY3RpdmVzID0gZmFsc2U7XG4gICAgICAgIHRoaXMucHJlbHVkZSA9IFtdO1xuICAgICAgICB0aGlzLmVycm9ycyA9IFtdO1xuICAgICAgICB0aGlzLndhcm5pbmdzID0gW107XG4gICAgICAgIHRoaXMub25FcnJvciA9IChzb3VyY2UsIGNvZGUsIG1lc3NhZ2UsIHdhcm5pbmcpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHBvcyA9IGdldEVycm9yUG9zKHNvdXJjZSk7XG4gICAgICAgICAgICBpZiAod2FybmluZylcbiAgICAgICAgICAgICAgICB0aGlzLndhcm5pbmdzLnB1c2gobmV3IGVycm9ycy5ZQU1MV2FybmluZyhwb3MsIGNvZGUsIG1lc3NhZ2UpKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0aGlzLmVycm9ycy5wdXNoKG5ldyBlcnJvcnMuWUFNTFBhcnNlRXJyb3IocG9zLCBjb2RlLCBtZXNzYWdlKSk7XG4gICAgICAgIH07XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvcHJlZmVyLW51bGxpc2gtY29hbGVzY2luZ1xuICAgICAgICB0aGlzLmRpcmVjdGl2ZXMgPSBuZXcgZGlyZWN0aXZlcy5EaXJlY3RpdmVzKHsgdmVyc2lvbjogb3B0aW9ucy52ZXJzaW9uIHx8ICcxLjInIH0pO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIH1cbiAgICBkZWNvcmF0ZShkb2MsIGFmdGVyRG9jKSB7XG4gICAgICAgIGNvbnN0IHsgY29tbWVudCwgYWZ0ZXJFbXB0eUxpbmUgfSA9IHBhcnNlUHJlbHVkZSh0aGlzLnByZWx1ZGUpO1xuICAgICAgICAvL2NvbnNvbGUubG9nKHsgZGM6IGRvYy5jb21tZW50LCBwcmVsdWRlLCBjb21tZW50IH0pXG4gICAgICAgIGlmIChjb21tZW50KSB7XG4gICAgICAgICAgICBjb25zdCBkYyA9IGRvYy5jb250ZW50cztcbiAgICAgICAgICAgIGlmIChhZnRlckRvYykge1xuICAgICAgICAgICAgICAgIGRvYy5jb21tZW50ID0gZG9jLmNvbW1lbnQgPyBgJHtkb2MuY29tbWVudH1cXG4ke2NvbW1lbnR9YCA6IGNvbW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChhZnRlckVtcHR5TGluZSB8fCBkb2MuZGlyZWN0aXZlcy5kb2NTdGFydCB8fCAhZGMpIHtcbiAgICAgICAgICAgICAgICBkb2MuY29tbWVudEJlZm9yZSA9IGNvbW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpZGVudGl0eS5pc0NvbGxlY3Rpb24oZGMpICYmICFkYy5mbG93ICYmIGRjLml0ZW1zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBsZXQgaXQgPSBkYy5pdGVtc1swXTtcbiAgICAgICAgICAgICAgICBpZiAoaWRlbnRpdHkuaXNQYWlyKGl0KSlcbiAgICAgICAgICAgICAgICAgICAgaXQgPSBpdC5rZXk7XG4gICAgICAgICAgICAgICAgY29uc3QgY2IgPSBpdC5jb21tZW50QmVmb3JlO1xuICAgICAgICAgICAgICAgIGl0LmNvbW1lbnRCZWZvcmUgPSBjYiA/IGAke2NvbW1lbnR9XFxuJHtjYn1gIDogY29tbWVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNiID0gZGMuY29tbWVudEJlZm9yZTtcbiAgICAgICAgICAgICAgICBkYy5jb21tZW50QmVmb3JlID0gY2IgPyBgJHtjb21tZW50fVxcbiR7Y2J9YCA6IGNvbW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFmdGVyRG9jKSB7XG4gICAgICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShkb2MuZXJyb3JzLCB0aGlzLmVycm9ycyk7XG4gICAgICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShkb2Mud2FybmluZ3MsIHRoaXMud2FybmluZ3MpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZG9jLmVycm9ycyA9IHRoaXMuZXJyb3JzO1xuICAgICAgICAgICAgZG9jLndhcm5pbmdzID0gdGhpcy53YXJuaW5ncztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnByZWx1ZGUgPSBbXTtcbiAgICAgICAgdGhpcy5lcnJvcnMgPSBbXTtcbiAgICAgICAgdGhpcy53YXJuaW5ncyA9IFtdO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDdXJyZW50IHN0cmVhbSBzdGF0dXMgaW5mb3JtYXRpb24uXG4gICAgICpcbiAgICAgKiBNb3N0bHkgdXNlZnVsIGF0IHRoZSBlbmQgb2YgaW5wdXQgZm9yIGFuIGVtcHR5IHN0cmVhbS5cbiAgICAgKi9cbiAgICBzdHJlYW1JbmZvKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY29tbWVudDogcGFyc2VQcmVsdWRlKHRoaXMucHJlbHVkZSkuY29tbWVudCxcbiAgICAgICAgICAgIGRpcmVjdGl2ZXM6IHRoaXMuZGlyZWN0aXZlcyxcbiAgICAgICAgICAgIGVycm9yczogdGhpcy5lcnJvcnMsXG4gICAgICAgICAgICB3YXJuaW5nczogdGhpcy53YXJuaW5nc1xuICAgICAgICB9O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDb21wb3NlIHRva2VucyBpbnRvIGRvY3VtZW50cy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBmb3JjZURvYyAtIElmIHRoZSBzdHJlYW0gY29udGFpbnMgbm8gZG9jdW1lbnQsIHN0aWxsIGVtaXQgYSBmaW5hbCBkb2N1bWVudCBpbmNsdWRpbmcgYW55IGNvbW1lbnRzIGFuZCBkaXJlY3RpdmVzIHRoYXQgd291bGQgYmUgYXBwbGllZCB0byBhIHN1YnNlcXVlbnQgZG9jdW1lbnQuXG4gICAgICogQHBhcmFtIGVuZE9mZnNldCAtIFNob3VsZCBiZSBzZXQgaWYgYGZvcmNlRG9jYCBpcyBhbHNvIHNldCwgdG8gc2V0IHRoZSBkb2N1bWVudCByYW5nZSBlbmQgYW5kIHRvIGluZGljYXRlIGVycm9ycyBjb3JyZWN0bHkuXG4gICAgICovXG4gICAgKmNvbXBvc2UodG9rZW5zLCBmb3JjZURvYyA9IGZhbHNlLCBlbmRPZmZzZXQgPSAtMSkge1xuICAgICAgICBmb3IgKGNvbnN0IHRva2VuIG9mIHRva2VucylcbiAgICAgICAgICAgIHlpZWxkKiB0aGlzLm5leHQodG9rZW4pO1xuICAgICAgICB5aWVsZCogdGhpcy5lbmQoZm9yY2VEb2MsIGVuZE9mZnNldCk7XG4gICAgfVxuICAgIC8qKiBBZHZhbmNlIHRoZSBjb21wb3NlciBieSBvbmUgQ1NUIHRva2VuLiAqL1xuICAgICpuZXh0KHRva2VuKSB7XG4gICAgICAgIGlmIChub2RlX3Byb2Nlc3MuZW52LkxPR19TVFJFQU0pXG4gICAgICAgICAgICBjb25zb2xlLmRpcih0b2tlbiwgeyBkZXB0aDogbnVsbCB9KTtcbiAgICAgICAgc3dpdGNoICh0b2tlbi50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdkaXJlY3RpdmUnOlxuICAgICAgICAgICAgICAgIHRoaXMuZGlyZWN0aXZlcy5hZGQodG9rZW4uc291cmNlLCAob2Zmc2V0LCBtZXNzYWdlLCB3YXJuaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBvcyA9IGdldEVycm9yUG9zKHRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgcG9zWzBdICs9IG9mZnNldDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkVycm9yKHBvcywgJ0JBRF9ESVJFQ1RJVkUnLCBtZXNzYWdlLCB3YXJuaW5nKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLnByZWx1ZGUucHVzaCh0b2tlbi5zb3VyY2UpO1xuICAgICAgICAgICAgICAgIHRoaXMuYXREaXJlY3RpdmVzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2RvY3VtZW50Jzoge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRvYyA9IGNvbXBvc2VEb2MuY29tcG9zZURvYyh0aGlzLm9wdGlvbnMsIHRoaXMuZGlyZWN0aXZlcywgdG9rZW4sIHRoaXMub25FcnJvcik7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYXREaXJlY3RpdmVzICYmICFkb2MuZGlyZWN0aXZlcy5kb2NTdGFydClcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkVycm9yKHRva2VuLCAnTUlTU0lOR19DSEFSJywgJ01pc3NpbmcgZGlyZWN0aXZlcy1lbmQvZG9jLXN0YXJ0IGluZGljYXRvciBsaW5lJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5kZWNvcmF0ZShkb2MsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5kb2MpXG4gICAgICAgICAgICAgICAgICAgIHlpZWxkIHRoaXMuZG9jO1xuICAgICAgICAgICAgICAgIHRoaXMuZG9jID0gZG9jO1xuICAgICAgICAgICAgICAgIHRoaXMuYXREaXJlY3RpdmVzID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlICdieXRlLW9yZGVyLW1hcmsnOlxuICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICB0aGlzLnByZWx1ZGUucHVzaCh0b2tlbi5zb3VyY2UpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZXJyb3InOiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbXNnID0gdG9rZW4uc291cmNlXG4gICAgICAgICAgICAgICAgICAgID8gYCR7dG9rZW4ubWVzc2FnZX06ICR7SlNPTi5zdHJpbmdpZnkodG9rZW4uc291cmNlKX1gXG4gICAgICAgICAgICAgICAgICAgIDogdG9rZW4ubWVzc2FnZTtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvciA9IG5ldyBlcnJvcnMuWUFNTFBhcnNlRXJyb3IoZ2V0RXJyb3JQb3ModG9rZW4pLCAnVU5FWFBFQ1RFRF9UT0tFTicsIG1zZyk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYXREaXJlY3RpdmVzIHx8ICF0aGlzLmRvYylcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lcnJvcnMucHVzaChlcnJvcik7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRvYy5lcnJvcnMucHVzaChlcnJvcik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlICdkb2MtZW5kJzoge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5kb2MpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbXNnID0gJ1VuZXhwZWN0ZWQgZG9jLWVuZCB3aXRob3V0IHByZWNlZGluZyBkb2N1bWVudCc7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXJyb3JzLnB1c2gobmV3IGVycm9ycy5ZQU1MUGFyc2VFcnJvcihnZXRFcnJvclBvcyh0b2tlbiksICdVTkVYUEVDVEVEX1RPS0VOJywgbXNnKSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmRvYy5kaXJlY3RpdmVzLmRvY0VuZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgY29uc3QgZW5kID0gcmVzb2x2ZUVuZC5yZXNvbHZlRW5kKHRva2VuLmVuZCwgdG9rZW4ub2Zmc2V0ICsgdG9rZW4uc291cmNlLmxlbmd0aCwgdGhpcy5kb2Mub3B0aW9ucy5zdHJpY3QsIHRoaXMub25FcnJvcik7XG4gICAgICAgICAgICAgICAgdGhpcy5kZWNvcmF0ZSh0aGlzLmRvYywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgaWYgKGVuZC5jb21tZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRjID0gdGhpcy5kb2MuY29tbWVudDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kb2MuY29tbWVudCA9IGRjID8gYCR7ZGN9XFxuJHtlbmQuY29tbWVudH1gIDogZW5kLmNvbW1lbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuZG9jLnJhbmdlWzJdID0gZW5kLm9mZnNldDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhpcy5lcnJvcnMucHVzaChuZXcgZXJyb3JzLllBTUxQYXJzZUVycm9yKGdldEVycm9yUG9zKHRva2VuKSwgJ1VORVhQRUNURURfVE9LRU4nLCBgVW5zdXBwb3J0ZWQgdG9rZW4gJHt0b2tlbi50eXBlfWApKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBDYWxsIGF0IGVuZCBvZiBpbnB1dCB0byB5aWVsZCBhbnkgcmVtYWluaW5nIGRvY3VtZW50LlxuICAgICAqXG4gICAgICogQHBhcmFtIGZvcmNlRG9jIC0gSWYgdGhlIHN0cmVhbSBjb250YWlucyBubyBkb2N1bWVudCwgc3RpbGwgZW1pdCBhIGZpbmFsIGRvY3VtZW50IGluY2x1ZGluZyBhbnkgY29tbWVudHMgYW5kIGRpcmVjdGl2ZXMgdGhhdCB3b3VsZCBiZSBhcHBsaWVkIHRvIGEgc3Vic2VxdWVudCBkb2N1bWVudC5cbiAgICAgKiBAcGFyYW0gZW5kT2Zmc2V0IC0gU2hvdWxkIGJlIHNldCBpZiBgZm9yY2VEb2NgIGlzIGFsc28gc2V0LCB0byBzZXQgdGhlIGRvY3VtZW50IHJhbmdlIGVuZCBhbmQgdG8gaW5kaWNhdGUgZXJyb3JzIGNvcnJlY3RseS5cbiAgICAgKi9cbiAgICAqZW5kKGZvcmNlRG9jID0gZmFsc2UsIGVuZE9mZnNldCA9IC0xKSB7XG4gICAgICAgIGlmICh0aGlzLmRvYykge1xuICAgICAgICAgICAgdGhpcy5kZWNvcmF0ZSh0aGlzLmRvYywgdHJ1ZSk7XG4gICAgICAgICAgICB5aWVsZCB0aGlzLmRvYztcbiAgICAgICAgICAgIHRoaXMuZG9jID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChmb3JjZURvYykge1xuICAgICAgICAgICAgY29uc3Qgb3B0cyA9IE9iamVjdC5hc3NpZ24oeyBfZGlyZWN0aXZlczogdGhpcy5kaXJlY3RpdmVzIH0sIHRoaXMub3B0aW9ucyk7XG4gICAgICAgICAgICBjb25zdCBkb2MgPSBuZXcgRG9jdW1lbnQuRG9jdW1lbnQodW5kZWZpbmVkLCBvcHRzKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmF0RGlyZWN0aXZlcylcbiAgICAgICAgICAgICAgICB0aGlzLm9uRXJyb3IoZW5kT2Zmc2V0LCAnTUlTU0lOR19DSEFSJywgJ01pc3NpbmcgZGlyZWN0aXZlcy1lbmQgaW5kaWNhdG9yIGxpbmUnKTtcbiAgICAgICAgICAgIGRvYy5yYW5nZSA9IFswLCBlbmRPZmZzZXQsIGVuZE9mZnNldF07XG4gICAgICAgICAgICB0aGlzLmRlY29yYXRlKGRvYywgZmFsc2UpO1xuICAgICAgICAgICAgeWllbGQgZG9jO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnRzLkNvbXBvc2VyID0gQ29tcG9zZXI7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIHJlc29sdmVCbG9ja1NjYWxhciA9IHJlcXVpcmUoJy4uL2NvbXBvc2UvcmVzb2x2ZS1ibG9jay1zY2FsYXIuanMnKTtcbnZhciByZXNvbHZlRmxvd1NjYWxhciA9IHJlcXVpcmUoJy4uL2NvbXBvc2UvcmVzb2x2ZS1mbG93LXNjYWxhci5qcycpO1xudmFyIGVycm9ycyA9IHJlcXVpcmUoJy4uL2Vycm9ycy5qcycpO1xudmFyIHN0cmluZ2lmeVN0cmluZyA9IHJlcXVpcmUoJy4uL3N0cmluZ2lmeS9zdHJpbmdpZnlTdHJpbmcuanMnKTtcblxuZnVuY3Rpb24gcmVzb2x2ZUFzU2NhbGFyKHRva2VuLCBzdHJpY3QgPSB0cnVlLCBvbkVycm9yKSB7XG4gICAgaWYgKHRva2VuKSB7XG4gICAgICAgIGNvbnN0IF9vbkVycm9yID0gKHBvcywgY29kZSwgbWVzc2FnZSkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgb2Zmc2V0ID0gdHlwZW9mIHBvcyA9PT0gJ251bWJlcicgPyBwb3MgOiBBcnJheS5pc0FycmF5KHBvcykgPyBwb3NbMF0gOiBwb3Mub2Zmc2V0O1xuICAgICAgICAgICAgaWYgKG9uRXJyb3IpXG4gICAgICAgICAgICAgICAgb25FcnJvcihvZmZzZXQsIGNvZGUsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBlcnJvcnMuWUFNTFBhcnNlRXJyb3IoW29mZnNldCwgb2Zmc2V0ICsgMV0sIGNvZGUsIG1lc3NhZ2UpO1xuICAgICAgICB9O1xuICAgICAgICBzd2l0Y2ggKHRva2VuLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ3NjYWxhcic6XG4gICAgICAgICAgICBjYXNlICdzaW5nbGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgICAgICBjYXNlICdkb3VibGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmVGbG93U2NhbGFyLnJlc29sdmVGbG93U2NhbGFyKHRva2VuLCBzdHJpY3QsIF9vbkVycm9yKTtcbiAgICAgICAgICAgIGNhc2UgJ2Jsb2NrLXNjYWxhcic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmVCbG9ja1NjYWxhci5yZXNvbHZlQmxvY2tTY2FsYXIoeyBvcHRpb25zOiB7IHN0cmljdCB9IH0sIHRva2VuLCBfb25FcnJvcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59XG4vKipcbiAqIENyZWF0ZSBhIG5ldyBzY2FsYXIgdG9rZW4gd2l0aCBgdmFsdWVgXG4gKlxuICogVmFsdWVzIHRoYXQgcmVwcmVzZW50IGFuIGFjdHVhbCBzdHJpbmcgYnV0IG1heSBiZSBwYXJzZWQgYXMgYSBkaWZmZXJlbnQgdHlwZSBzaG91bGQgdXNlIGEgYHR5cGVgIG90aGVyIHRoYW4gYCdQTEFJTidgLFxuICogYXMgdGhpcyBmdW5jdGlvbiBkb2VzIG5vdCBzdXBwb3J0IGFueSBzY2hlbWEgb3BlcmF0aW9ucyBhbmQgd29uJ3QgY2hlY2sgZm9yIHN1Y2ggY29uZmxpY3RzLlxuICpcbiAqIEBwYXJhbSB2YWx1ZSBUaGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB2YWx1ZSwgd2hpY2ggd2lsbCBoYXZlIGl0cyBjb250ZW50IHByb3Blcmx5IGluZGVudGVkLlxuICogQHBhcmFtIGNvbnRleHQuZW5kIENvbW1lbnRzIGFuZCB3aGl0ZXNwYWNlIGFmdGVyIHRoZSBlbmQgb2YgdGhlIHZhbHVlLCBvciBhZnRlciB0aGUgYmxvY2sgc2NhbGFyIGhlYWRlci4gSWYgdW5kZWZpbmVkLCBhIG5ld2xpbmUgd2lsbCBiZSBhZGRlZC5cbiAqIEBwYXJhbSBjb250ZXh0LmltcGxpY2l0S2V5IEJlaW5nIHdpdGhpbiBhbiBpbXBsaWNpdCBrZXkgbWF5IGFmZmVjdCB0aGUgcmVzb2x2ZWQgdHlwZSBvZiB0aGUgdG9rZW4ncyB2YWx1ZS5cbiAqIEBwYXJhbSBjb250ZXh0LmluZGVudCBUaGUgaW5kZW50IGxldmVsIG9mIHRoZSB0b2tlbi5cbiAqIEBwYXJhbSBjb250ZXh0LmluRmxvdyBJcyB0aGlzIHNjYWxhciB3aXRoaW4gYSBmbG93IGNvbGxlY3Rpb24/IFRoaXMgbWF5IGFmZmVjdCB0aGUgcmVzb2x2ZWQgdHlwZSBvZiB0aGUgdG9rZW4ncyB2YWx1ZS5cbiAqIEBwYXJhbSBjb250ZXh0Lm9mZnNldCBUaGUgb2Zmc2V0IHBvc2l0aW9uIG9mIHRoZSB0b2tlbi5cbiAqIEBwYXJhbSBjb250ZXh0LnR5cGUgVGhlIHByZWZlcnJlZCB0eXBlIG9mIHRoZSBzY2FsYXIgdG9rZW4uIElmIHVuZGVmaW5lZCwgdGhlIHByZXZpb3VzIHR5cGUgb2YgdGhlIGB0b2tlbmAgd2lsbCBiZSB1c2VkLCBkZWZhdWx0aW5nIHRvIGAnUExBSU4nYC5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlU2NhbGFyVG9rZW4odmFsdWUsIGNvbnRleHQpIHtcbiAgICBjb25zdCB7IGltcGxpY2l0S2V5ID0gZmFsc2UsIGluZGVudCwgaW5GbG93ID0gZmFsc2UsIG9mZnNldCA9IC0xLCB0eXBlID0gJ1BMQUlOJyB9ID0gY29udGV4dDtcbiAgICBjb25zdCBzb3VyY2UgPSBzdHJpbmdpZnlTdHJpbmcuc3RyaW5naWZ5U3RyaW5nKHsgdHlwZSwgdmFsdWUgfSwge1xuICAgICAgICBpbXBsaWNpdEtleSxcbiAgICAgICAgaW5kZW50OiBpbmRlbnQgPiAwID8gJyAnLnJlcGVhdChpbmRlbnQpIDogJycsXG4gICAgICAgIGluRmxvdyxcbiAgICAgICAgb3B0aW9uczogeyBibG9ja1F1b3RlOiB0cnVlLCBsaW5lV2lkdGg6IC0xIH1cbiAgICB9KTtcbiAgICBjb25zdCBlbmQgPSBjb250ZXh0LmVuZCA/PyBbXG4gICAgICAgIHsgdHlwZTogJ25ld2xpbmUnLCBvZmZzZXQ6IC0xLCBpbmRlbnQsIHNvdXJjZTogJ1xcbicgfVxuICAgIF07XG4gICAgc3dpdGNoIChzb3VyY2VbMF0pIHtcbiAgICAgICAgY2FzZSAnfCc6XG4gICAgICAgIGNhc2UgJz4nOiB7XG4gICAgICAgICAgICBjb25zdCBoZSA9IHNvdXJjZS5pbmRleE9mKCdcXG4nKTtcbiAgICAgICAgICAgIGNvbnN0IGhlYWQgPSBzb3VyY2Uuc3Vic3RyaW5nKDAsIGhlKTtcbiAgICAgICAgICAgIGNvbnN0IGJvZHkgPSBzb3VyY2Uuc3Vic3RyaW5nKGhlICsgMSkgKyAnXFxuJztcbiAgICAgICAgICAgIGNvbnN0IHByb3BzID0gW1xuICAgICAgICAgICAgICAgIHsgdHlwZTogJ2Jsb2NrLXNjYWxhci1oZWFkZXInLCBvZmZzZXQsIGluZGVudCwgc291cmNlOiBoZWFkIH1cbiAgICAgICAgICAgIF07XG4gICAgICAgICAgICBpZiAoIWFkZEVuZHRvQmxvY2tQcm9wcyhwcm9wcywgZW5kKSlcbiAgICAgICAgICAgICAgICBwcm9wcy5wdXNoKHsgdHlwZTogJ25ld2xpbmUnLCBvZmZzZXQ6IC0xLCBpbmRlbnQsIHNvdXJjZTogJ1xcbicgfSk7XG4gICAgICAgICAgICByZXR1cm4geyB0eXBlOiAnYmxvY2stc2NhbGFyJywgb2Zmc2V0LCBpbmRlbnQsIHByb3BzLCBzb3VyY2U6IGJvZHkgfTtcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdcIic6XG4gICAgICAgICAgICByZXR1cm4geyB0eXBlOiAnZG91YmxlLXF1b3RlZC1zY2FsYXInLCBvZmZzZXQsIGluZGVudCwgc291cmNlLCBlbmQgfTtcbiAgICAgICAgY2FzZSBcIidcIjpcbiAgICAgICAgICAgIHJldHVybiB7IHR5cGU6ICdzaW5nbGUtcXVvdGVkLXNjYWxhcicsIG9mZnNldCwgaW5kZW50LCBzb3VyY2UsIGVuZCB9O1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3NjYWxhcicsIG9mZnNldCwgaW5kZW50LCBzb3VyY2UsIGVuZCB9O1xuICAgIH1cbn1cbi8qKlxuICogU2V0IHRoZSB2YWx1ZSBvZiBgdG9rZW5gIHRvIHRoZSBnaXZlbiBzdHJpbmcgYHZhbHVlYCwgb3ZlcndyaXRpbmcgYW55IHByZXZpb3VzIGNvbnRlbnRzIGFuZCB0eXBlIHRoYXQgaXQgbWF5IGhhdmUuXG4gKlxuICogQmVzdCBlZmZvcnRzIGFyZSBtYWRlIHRvIHJldGFpbiBhbnkgY29tbWVudHMgcHJldmlvdXNseSBhc3NvY2lhdGVkIHdpdGggdGhlIGB0b2tlbmAsXG4gKiB0aG91Z2ggYWxsIGNvbnRlbnRzIHdpdGhpbiBhIGNvbGxlY3Rpb24ncyBgaXRlbXNgIHdpbGwgYmUgb3ZlcndyaXR0ZW4uXG4gKlxuICogVmFsdWVzIHRoYXQgcmVwcmVzZW50IGFuIGFjdHVhbCBzdHJpbmcgYnV0IG1heSBiZSBwYXJzZWQgYXMgYSBkaWZmZXJlbnQgdHlwZSBzaG91bGQgdXNlIGEgYHR5cGVgIG90aGVyIHRoYW4gYCdQTEFJTidgLFxuICogYXMgdGhpcyBmdW5jdGlvbiBkb2VzIG5vdCBzdXBwb3J0IGFueSBzY2hlbWEgb3BlcmF0aW9ucyBhbmQgd29uJ3QgY2hlY2sgZm9yIHN1Y2ggY29uZmxpY3RzLlxuICpcbiAqIEBwYXJhbSB0b2tlbiBBbnkgdG9rZW4uIElmIGl0IGRvZXMgbm90IGluY2x1ZGUgYW4gYGluZGVudGAgdmFsdWUsIHRoZSB2YWx1ZSB3aWxsIGJlIHN0cmluZ2lmaWVkIGFzIGlmIGl0IHdlcmUgYW4gaW1wbGljaXQga2V5LlxuICogQHBhcmFtIHZhbHVlIFRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZhbHVlLCB3aGljaCB3aWxsIGhhdmUgaXRzIGNvbnRlbnQgcHJvcGVybHkgaW5kZW50ZWQuXG4gKiBAcGFyYW0gY29udGV4dC5hZnRlcktleSBJbiBtb3N0IGNhc2VzLCB2YWx1ZXMgYWZ0ZXIgYSBrZXkgc2hvdWxkIGhhdmUgYW4gYWRkaXRpb25hbCBsZXZlbCBvZiBpbmRlbnRhdGlvbi5cbiAqIEBwYXJhbSBjb250ZXh0LmltcGxpY2l0S2V5IEJlaW5nIHdpdGhpbiBhbiBpbXBsaWNpdCBrZXkgbWF5IGFmZmVjdCB0aGUgcmVzb2x2ZWQgdHlwZSBvZiB0aGUgdG9rZW4ncyB2YWx1ZS5cbiAqIEBwYXJhbSBjb250ZXh0LmluRmxvdyBCZWluZyB3aXRoaW4gYSBmbG93IGNvbGxlY3Rpb24gbWF5IGFmZmVjdCB0aGUgcmVzb2x2ZWQgdHlwZSBvZiB0aGUgdG9rZW4ncyB2YWx1ZS5cbiAqIEBwYXJhbSBjb250ZXh0LnR5cGUgVGhlIHByZWZlcnJlZCB0eXBlIG9mIHRoZSBzY2FsYXIgdG9rZW4uIElmIHVuZGVmaW5lZCwgdGhlIHByZXZpb3VzIHR5cGUgb2YgdGhlIGB0b2tlbmAgd2lsbCBiZSB1c2VkLCBkZWZhdWx0aW5nIHRvIGAnUExBSU4nYC5cbiAqL1xuZnVuY3Rpb24gc2V0U2NhbGFyVmFsdWUodG9rZW4sIHZhbHVlLCBjb250ZXh0ID0ge30pIHtcbiAgICBsZXQgeyBhZnRlcktleSA9IGZhbHNlLCBpbXBsaWNpdEtleSA9IGZhbHNlLCBpbkZsb3cgPSBmYWxzZSwgdHlwZSB9ID0gY29udGV4dDtcbiAgICBsZXQgaW5kZW50ID0gJ2luZGVudCcgaW4gdG9rZW4gPyB0b2tlbi5pbmRlbnQgOiBudWxsO1xuICAgIGlmIChhZnRlcktleSAmJiB0eXBlb2YgaW5kZW50ID09PSAnbnVtYmVyJylcbiAgICAgICAgaW5kZW50ICs9IDI7XG4gICAgaWYgKCF0eXBlKVxuICAgICAgICBzd2l0Y2ggKHRva2VuLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ3NpbmdsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgICAgICAgICB0eXBlID0gJ1FVT1RFX1NJTkdMRSc7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdkb3VibGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgICAgICAgICAgdHlwZSA9ICdRVU9URV9ET1VCTEUnO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYmxvY2stc2NhbGFyJzoge1xuICAgICAgICAgICAgICAgIGNvbnN0IGhlYWRlciA9IHRva2VuLnByb3BzWzBdO1xuICAgICAgICAgICAgICAgIGlmIChoZWFkZXIudHlwZSAhPT0gJ2Jsb2NrLXNjYWxhci1oZWFkZXInKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgYmxvY2sgc2NhbGFyIGhlYWRlcicpO1xuICAgICAgICAgICAgICAgIHR5cGUgPSBoZWFkZXIuc291cmNlWzBdID09PSAnPicgPyAnQkxPQ0tfRk9MREVEJyA6ICdCTE9DS19MSVRFUkFMJztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdHlwZSA9ICdQTEFJTic7XG4gICAgICAgIH1cbiAgICBjb25zdCBzb3VyY2UgPSBzdHJpbmdpZnlTdHJpbmcuc3RyaW5naWZ5U3RyaW5nKHsgdHlwZSwgdmFsdWUgfSwge1xuICAgICAgICBpbXBsaWNpdEtleTogaW1wbGljaXRLZXkgfHwgaW5kZW50ID09PSBudWxsLFxuICAgICAgICBpbmRlbnQ6IGluZGVudCAhPT0gbnVsbCAmJiBpbmRlbnQgPiAwID8gJyAnLnJlcGVhdChpbmRlbnQpIDogJycsXG4gICAgICAgIGluRmxvdyxcbiAgICAgICAgb3B0aW9uczogeyBibG9ja1F1b3RlOiB0cnVlLCBsaW5lV2lkdGg6IC0xIH1cbiAgICB9KTtcbiAgICBzd2l0Y2ggKHNvdXJjZVswXSkge1xuICAgICAgICBjYXNlICd8JzpcbiAgICAgICAgY2FzZSAnPic6XG4gICAgICAgICAgICBzZXRCbG9ja1NjYWxhclZhbHVlKHRva2VuLCBzb3VyY2UpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ1wiJzpcbiAgICAgICAgICAgIHNldEZsb3dTY2FsYXJWYWx1ZSh0b2tlbiwgc291cmNlLCAnZG91YmxlLXF1b3RlZC1zY2FsYXInKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiJ1wiOlxuICAgICAgICAgICAgc2V0Rmxvd1NjYWxhclZhbHVlKHRva2VuLCBzb3VyY2UsICdzaW5nbGUtcXVvdGVkLXNjYWxhcicpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBzZXRGbG93U2NhbGFyVmFsdWUodG9rZW4sIHNvdXJjZSwgJ3NjYWxhcicpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHNldEJsb2NrU2NhbGFyVmFsdWUodG9rZW4sIHNvdXJjZSkge1xuICAgIGNvbnN0IGhlID0gc291cmNlLmluZGV4T2YoJ1xcbicpO1xuICAgIGNvbnN0IGhlYWQgPSBzb3VyY2Uuc3Vic3RyaW5nKDAsIGhlKTtcbiAgICBjb25zdCBib2R5ID0gc291cmNlLnN1YnN0cmluZyhoZSArIDEpICsgJ1xcbic7XG4gICAgaWYgKHRva2VuLnR5cGUgPT09ICdibG9jay1zY2FsYXInKSB7XG4gICAgICAgIGNvbnN0IGhlYWRlciA9IHRva2VuLnByb3BzWzBdO1xuICAgICAgICBpZiAoaGVhZGVyLnR5cGUgIT09ICdibG9jay1zY2FsYXItaGVhZGVyJylcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBibG9jayBzY2FsYXIgaGVhZGVyJyk7XG4gICAgICAgIGhlYWRlci5zb3VyY2UgPSBoZWFkO1xuICAgICAgICB0b2tlbi5zb3VyY2UgPSBib2R5O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgY29uc3QgeyBvZmZzZXQgfSA9IHRva2VuO1xuICAgICAgICBjb25zdCBpbmRlbnQgPSAnaW5kZW50JyBpbiB0b2tlbiA/IHRva2VuLmluZGVudCA6IC0xO1xuICAgICAgICBjb25zdCBwcm9wcyA9IFtcbiAgICAgICAgICAgIHsgdHlwZTogJ2Jsb2NrLXNjYWxhci1oZWFkZXInLCBvZmZzZXQsIGluZGVudCwgc291cmNlOiBoZWFkIH1cbiAgICAgICAgXTtcbiAgICAgICAgaWYgKCFhZGRFbmR0b0Jsb2NrUHJvcHMocHJvcHMsICdlbmQnIGluIHRva2VuID8gdG9rZW4uZW5kIDogdW5kZWZpbmVkKSlcbiAgICAgICAgICAgIHByb3BzLnB1c2goeyB0eXBlOiAnbmV3bGluZScsIG9mZnNldDogLTEsIGluZGVudCwgc291cmNlOiAnXFxuJyB9KTtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXModG9rZW4pKVxuICAgICAgICAgICAgaWYgKGtleSAhPT0gJ3R5cGUnICYmIGtleSAhPT0gJ29mZnNldCcpXG4gICAgICAgICAgICAgICAgZGVsZXRlIHRva2VuW2tleV07XG4gICAgICAgIE9iamVjdC5hc3NpZ24odG9rZW4sIHsgdHlwZTogJ2Jsb2NrLXNjYWxhcicsIGluZGVudCwgcHJvcHMsIHNvdXJjZTogYm9keSB9KTtcbiAgICB9XG59XG4vKiogQHJldHVybnMgYHRydWVgIGlmIGxhc3QgdG9rZW4gaXMgYSBuZXdsaW5lICovXG5mdW5jdGlvbiBhZGRFbmR0b0Jsb2NrUHJvcHMocHJvcHMsIGVuZCkge1xuICAgIGlmIChlbmQpXG4gICAgICAgIGZvciAoY29uc3Qgc3Qgb2YgZW5kKVxuICAgICAgICAgICAgc3dpdGNoIChzdC50eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ2NvbW1lbnQnOlxuICAgICAgICAgICAgICAgICAgICBwcm9wcy5wdXNoKHN0KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgICAgICAgIHByb3BzLnB1c2goc3QpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5mdW5jdGlvbiBzZXRGbG93U2NhbGFyVmFsdWUodG9rZW4sIHNvdXJjZSwgdHlwZSkge1xuICAgIHN3aXRjaCAodG9rZW4udHlwZSkge1xuICAgICAgICBjYXNlICdzY2FsYXInOlxuICAgICAgICBjYXNlICdkb3VibGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgIGNhc2UgJ3NpbmdsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgICAgIHRva2VuLnR5cGUgPSB0eXBlO1xuICAgICAgICAgICAgdG9rZW4uc291cmNlID0gc291cmNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2Jsb2NrLXNjYWxhcic6IHtcbiAgICAgICAgICAgIGNvbnN0IGVuZCA9IHRva2VuLnByb3BzLnNsaWNlKDEpO1xuICAgICAgICAgICAgbGV0IG9hID0gc291cmNlLmxlbmd0aDtcbiAgICAgICAgICAgIGlmICh0b2tlbi5wcm9wc1swXS50eXBlID09PSAnYmxvY2stc2NhbGFyLWhlYWRlcicpXG4gICAgICAgICAgICAgICAgb2EgLT0gdG9rZW4ucHJvcHNbMF0uc291cmNlLmxlbmd0aDtcbiAgICAgICAgICAgIGZvciAoY29uc3QgdG9rIG9mIGVuZClcbiAgICAgICAgICAgICAgICB0b2sub2Zmc2V0ICs9IG9hO1xuICAgICAgICAgICAgZGVsZXRlIHRva2VuLnByb3BzO1xuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih0b2tlbiwgeyB0eXBlLCBzb3VyY2UsIGVuZCB9KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ2Jsb2NrLW1hcCc6XG4gICAgICAgIGNhc2UgJ2Jsb2NrLXNlcSc6IHtcbiAgICAgICAgICAgIGNvbnN0IG9mZnNldCA9IHRva2VuLm9mZnNldCArIHNvdXJjZS5sZW5ndGg7XG4gICAgICAgICAgICBjb25zdCBubCA9IHsgdHlwZTogJ25ld2xpbmUnLCBvZmZzZXQsIGluZGVudDogdG9rZW4uaW5kZW50LCBzb3VyY2U6ICdcXG4nIH07XG4gICAgICAgICAgICBkZWxldGUgdG9rZW4uaXRlbXM7XG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKHRva2VuLCB7IHR5cGUsIHNvdXJjZSwgZW5kOiBbbmxdIH0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgY29uc3QgaW5kZW50ID0gJ2luZGVudCcgaW4gdG9rZW4gPyB0b2tlbi5pbmRlbnQgOiAtMTtcbiAgICAgICAgICAgIGNvbnN0IGVuZCA9ICdlbmQnIGluIHRva2VuICYmIEFycmF5LmlzQXJyYXkodG9rZW4uZW5kKVxuICAgICAgICAgICAgICAgID8gdG9rZW4uZW5kLmZpbHRlcihzdCA9PiBzdC50eXBlID09PSAnc3BhY2UnIHx8XG4gICAgICAgICAgICAgICAgICAgIHN0LnR5cGUgPT09ICdjb21tZW50JyB8fFxuICAgICAgICAgICAgICAgICAgICBzdC50eXBlID09PSAnbmV3bGluZScpXG4gICAgICAgICAgICAgICAgOiBbXTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHRva2VuKSlcbiAgICAgICAgICAgICAgICBpZiAoa2V5ICE9PSAndHlwZScgJiYga2V5ICE9PSAnb2Zmc2V0JylcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHRva2VuW2tleV07XG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKHRva2VuLCB7IHR5cGUsIGluZGVudCwgc291cmNlLCBlbmQgfSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydHMuY3JlYXRlU2NhbGFyVG9rZW4gPSBjcmVhdGVTY2FsYXJUb2tlbjtcbmV4cG9ydHMucmVzb2x2ZUFzU2NhbGFyID0gcmVzb2x2ZUFzU2NhbGFyO1xuZXhwb3J0cy5zZXRTY2FsYXJWYWx1ZSA9IHNldFNjYWxhclZhbHVlO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogU3RyaW5naWZ5IGEgQ1NUIGRvY3VtZW50LCB0b2tlbiwgb3IgY29sbGVjdGlvbiBpdGVtXG4gKlxuICogRmFpciB3YXJuaW5nOiBUaGlzIGFwcGxpZXMgbm8gdmFsaWRhdGlvbiB3aGF0c29ldmVyLCBhbmRcbiAqIHNpbXBseSBjb25jYXRlbmF0ZXMgdGhlIHNvdXJjZXMgaW4gdGhlaXIgbG9naWNhbCBvcmRlci5cbiAqL1xuY29uc3Qgc3RyaW5naWZ5ID0gKGNzdCkgPT4gJ3R5cGUnIGluIGNzdCA/IHN0cmluZ2lmeVRva2VuKGNzdCkgOiBzdHJpbmdpZnlJdGVtKGNzdCk7XG5mdW5jdGlvbiBzdHJpbmdpZnlUb2tlbih0b2tlbikge1xuICAgIHN3aXRjaCAodG9rZW4udHlwZSkge1xuICAgICAgICBjYXNlICdibG9jay1zY2FsYXInOiB7XG4gICAgICAgICAgICBsZXQgcmVzID0gJyc7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHRvayBvZiB0b2tlbi5wcm9wcylcbiAgICAgICAgICAgICAgICByZXMgKz0gc3RyaW5naWZ5VG9rZW4odG9rKTtcbiAgICAgICAgICAgIHJldHVybiByZXMgKyB0b2tlbi5zb3VyY2U7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnYmxvY2stbWFwJzpcbiAgICAgICAgY2FzZSAnYmxvY2stc2VxJzoge1xuICAgICAgICAgICAgbGV0IHJlcyA9ICcnO1xuICAgICAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIHRva2VuLml0ZW1zKVxuICAgICAgICAgICAgICAgIHJlcyArPSBzdHJpbmdpZnlJdGVtKGl0ZW0pO1xuICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdmbG93LWNvbGxlY3Rpb24nOiB7XG4gICAgICAgICAgICBsZXQgcmVzID0gdG9rZW4uc3RhcnQuc291cmNlO1xuICAgICAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIHRva2VuLml0ZW1zKVxuICAgICAgICAgICAgICAgIHJlcyArPSBzdHJpbmdpZnlJdGVtKGl0ZW0pO1xuICAgICAgICAgICAgZm9yIChjb25zdCBzdCBvZiB0b2tlbi5lbmQpXG4gICAgICAgICAgICAgICAgcmVzICs9IHN0LnNvdXJjZTtcbiAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnZG9jdW1lbnQnOiB7XG4gICAgICAgICAgICBsZXQgcmVzID0gc3RyaW5naWZ5SXRlbSh0b2tlbik7XG4gICAgICAgICAgICBpZiAodG9rZW4uZW5kKVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgc3Qgb2YgdG9rZW4uZW5kKVxuICAgICAgICAgICAgICAgICAgICByZXMgKz0gc3Quc291cmNlO1xuICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgfVxuICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICBsZXQgcmVzID0gdG9rZW4uc291cmNlO1xuICAgICAgICAgICAgaWYgKCdlbmQnIGluIHRva2VuICYmIHRva2VuLmVuZClcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHN0IG9mIHRva2VuLmVuZClcbiAgICAgICAgICAgICAgICAgICAgcmVzICs9IHN0LnNvdXJjZTtcbiAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBzdHJpbmdpZnlJdGVtKHsgc3RhcnQsIGtleSwgc2VwLCB2YWx1ZSB9KSB7XG4gICAgbGV0IHJlcyA9ICcnO1xuICAgIGZvciAoY29uc3Qgc3Qgb2Ygc3RhcnQpXG4gICAgICAgIHJlcyArPSBzdC5zb3VyY2U7XG4gICAgaWYgKGtleSlcbiAgICAgICAgcmVzICs9IHN0cmluZ2lmeVRva2VuKGtleSk7XG4gICAgaWYgKHNlcClcbiAgICAgICAgZm9yIChjb25zdCBzdCBvZiBzZXApXG4gICAgICAgICAgICByZXMgKz0gc3Quc291cmNlO1xuICAgIGlmICh2YWx1ZSlcbiAgICAgICAgcmVzICs9IHN0cmluZ2lmeVRva2VuKHZhbHVlKTtcbiAgICByZXR1cm4gcmVzO1xufVxuXG5leHBvcnRzLnN0cmluZ2lmeSA9IHN0cmluZ2lmeTtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBCUkVBSyA9IFN5bWJvbCgnYnJlYWsgdmlzaXQnKTtcbmNvbnN0IFNLSVAgPSBTeW1ib2woJ3NraXAgY2hpbGRyZW4nKTtcbmNvbnN0IFJFTU9WRSA9IFN5bWJvbCgncmVtb3ZlIGl0ZW0nKTtcbi8qKlxuICogQXBwbHkgYSB2aXNpdG9yIHRvIGEgQ1NUIGRvY3VtZW50IG9yIGl0ZW0uXG4gKlxuICogV2Fsa3MgdGhyb3VnaCB0aGUgdHJlZSAoZGVwdGgtZmlyc3QpIHN0YXJ0aW5nIGZyb20gdGhlIHJvb3QsIGNhbGxpbmcgYVxuICogYHZpc2l0b3JgIGZ1bmN0aW9uIHdpdGggdHdvIGFyZ3VtZW50cyB3aGVuIGVudGVyaW5nIGVhY2ggaXRlbTpcbiAqICAgLSBgaXRlbWA6IFRoZSBjdXJyZW50IGl0ZW0sIHdoaWNoIGluY2x1ZGVkIHRoZSBmb2xsb3dpbmcgbWVtYmVyczpcbiAqICAgICAtIGBzdGFydDogU291cmNlVG9rZW5bXWAg4oCTIFNvdXJjZSB0b2tlbnMgYmVmb3JlIHRoZSBrZXkgb3IgdmFsdWUsXG4gKiAgICAgICBwb3NzaWJseSBpbmNsdWRpbmcgaXRzIGFuY2hvciBvciB0YWcuXG4gKiAgICAgLSBga2V5PzogVG9rZW4gfCBudWxsYCDigJMgU2V0IGZvciBwYWlyIHZhbHVlcy4gTWF5IHRoZW4gYmUgYG51bGxgLCBpZlxuICogICAgICAgdGhlIGtleSBiZWZvcmUgdGhlIGA6YCBzZXBhcmF0b3IgaXMgZW1wdHkuXG4gKiAgICAgLSBgc2VwPzogU291cmNlVG9rZW5bXWAg4oCTIFNvdXJjZSB0b2tlbnMgYmV0d2VlbiB0aGUga2V5IGFuZCB0aGUgdmFsdWUsXG4gKiAgICAgICB3aGljaCBzaG91bGQgaW5jbHVkZSB0aGUgYDpgIG1hcCB2YWx1ZSBpbmRpY2F0b3IgaWYgYHZhbHVlYCBpcyBzZXQuXG4gKiAgICAgLSBgdmFsdWU/OiBUb2tlbmAg4oCTIFRoZSB2YWx1ZSBvZiBhIHNlcXVlbmNlIGl0ZW0sIG9yIG9mIGEgbWFwIHBhaXIuXG4gKiAgIC0gYHBhdGhgOiBUaGUgc3RlcHMgZnJvbSB0aGUgcm9vdCB0byB0aGUgY3VycmVudCBub2RlLCBhcyBhbiBhcnJheSBvZlxuICogICAgIGBbJ2tleScgfCAndmFsdWUnLCBudW1iZXJdYCB0dXBsZXMuXG4gKlxuICogVGhlIHJldHVybiB2YWx1ZSBvZiB0aGUgdmlzaXRvciBtYXkgYmUgdXNlZCB0byBjb250cm9sIHRoZSB0cmF2ZXJzYWw6XG4gKiAgIC0gYHVuZGVmaW5lZGAgKGRlZmF1bHQpOiBEbyBub3RoaW5nIGFuZCBjb250aW51ZVxuICogICAtIGB2aXNpdC5TS0lQYDogRG8gbm90IHZpc2l0IHRoZSBjaGlsZHJlbiBvZiB0aGlzIHRva2VuLCBjb250aW51ZSB3aXRoXG4gKiAgICAgIG5leHQgc2libGluZ1xuICogICAtIGB2aXNpdC5CUkVBS2A6IFRlcm1pbmF0ZSB0cmF2ZXJzYWwgY29tcGxldGVseVxuICogICAtIGB2aXNpdC5SRU1PVkVgOiBSZW1vdmUgdGhlIGN1cnJlbnQgaXRlbSwgdGhlbiBjb250aW51ZSB3aXRoIHRoZSBuZXh0IG9uZVxuICogICAtIGBudW1iZXJgOiBTZXQgdGhlIGluZGV4IG9mIHRoZSBuZXh0IHN0ZXAuIFRoaXMgaXMgdXNlZnVsIGVzcGVjaWFsbHkgaWZcbiAqICAgICB0aGUgaW5kZXggb2YgdGhlIGN1cnJlbnQgdG9rZW4gaGFzIGNoYW5nZWQuXG4gKiAgIC0gYGZ1bmN0aW9uYDogRGVmaW5lIHRoZSBuZXh0IHZpc2l0b3IgZm9yIHRoaXMgaXRlbS4gQWZ0ZXIgdGhlIG9yaWdpbmFsXG4gKiAgICAgdmlzaXRvciBpcyBjYWxsZWQgb24gaXRlbSBlbnRyeSwgbmV4dCB2aXNpdG9ycyBhcmUgY2FsbGVkIGFmdGVyIGhhbmRsaW5nXG4gKiAgICAgYSBub24tZW1wdHkgYGtleWAgYW5kIHdoZW4gZXhpdGluZyB0aGUgaXRlbS5cbiAqL1xuZnVuY3Rpb24gdmlzaXQoY3N0LCB2aXNpdG9yKSB7XG4gICAgaWYgKCd0eXBlJyBpbiBjc3QgJiYgY3N0LnR5cGUgPT09ICdkb2N1bWVudCcpXG4gICAgICAgIGNzdCA9IHsgc3RhcnQ6IGNzdC5zdGFydCwgdmFsdWU6IGNzdC52YWx1ZSB9O1xuICAgIF92aXNpdChPYmplY3QuZnJlZXplKFtdKSwgY3N0LCB2aXNpdG9yKTtcbn1cbi8vIFdpdGhvdXQgdGhlIGBhcyBzeW1ib2xgIGNhc3RzLCBUUyBkZWNsYXJlcyB0aGVzZSBpbiB0aGUgYHZpc2l0YFxuLy8gbmFtZXNwYWNlIHVzaW5nIGB2YXJgLCBidXQgdGhlbiBjb21wbGFpbnMgYWJvdXQgdGhhdCBiZWNhdXNlXG4vLyBgdW5pcXVlIHN5bWJvbGAgbXVzdCBiZSBgY29uc3RgLlxuLyoqIFRlcm1pbmF0ZSB2aXNpdCB0cmF2ZXJzYWwgY29tcGxldGVseSAqL1xudmlzaXQuQlJFQUsgPSBCUkVBSztcbi8qKiBEbyBub3QgdmlzaXQgdGhlIGNoaWxkcmVuIG9mIHRoZSBjdXJyZW50IGl0ZW0gKi9cbnZpc2l0LlNLSVAgPSBTS0lQO1xuLyoqIFJlbW92ZSB0aGUgY3VycmVudCBpdGVtICovXG52aXNpdC5SRU1PVkUgPSBSRU1PVkU7XG4vKiogRmluZCB0aGUgaXRlbSBhdCBgcGF0aGAgZnJvbSBgY3N0YCBhcyB0aGUgcm9vdCAqL1xudmlzaXQuaXRlbUF0UGF0aCA9IChjc3QsIHBhdGgpID0+IHtcbiAgICBsZXQgaXRlbSA9IGNzdDtcbiAgICBmb3IgKGNvbnN0IFtmaWVsZCwgaW5kZXhdIG9mIHBhdGgpIHtcbiAgICAgICAgY29uc3QgdG9rID0gaXRlbT8uW2ZpZWxkXTtcbiAgICAgICAgaWYgKHRvayAmJiAnaXRlbXMnIGluIHRvaykge1xuICAgICAgICAgICAgaXRlbSA9IHRvay5pdGVtc1tpbmRleF07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgcmV0dXJuIGl0ZW07XG59O1xuLyoqXG4gKiBHZXQgdGhlIGltbWVkaWF0ZSBwYXJlbnQgY29sbGVjdGlvbiBvZiB0aGUgaXRlbSBhdCBgcGF0aGAgZnJvbSBgY3N0YCBhcyB0aGUgcm9vdC5cbiAqXG4gKiBUaHJvd3MgYW4gZXJyb3IgaWYgdGhlIGNvbGxlY3Rpb24gaXMgbm90IGZvdW5kLCB3aGljaCBzaG91bGQgbmV2ZXIgaGFwcGVuIGlmIHRoZSBpdGVtIGl0c2VsZiBleGlzdHMuXG4gKi9cbnZpc2l0LnBhcmVudENvbGxlY3Rpb24gPSAoY3N0LCBwYXRoKSA9PiB7XG4gICAgY29uc3QgcGFyZW50ID0gdmlzaXQuaXRlbUF0UGF0aChjc3QsIHBhdGguc2xpY2UoMCwgLTEpKTtcbiAgICBjb25zdCBmaWVsZCA9IHBhdGhbcGF0aC5sZW5ndGggLSAxXVswXTtcbiAgICBjb25zdCBjb2xsID0gcGFyZW50Py5bZmllbGRdO1xuICAgIGlmIChjb2xsICYmICdpdGVtcycgaW4gY29sbClcbiAgICAgICAgcmV0dXJuIGNvbGw7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdQYXJlbnQgY29sbGVjdGlvbiBub3QgZm91bmQnKTtcbn07XG5mdW5jdGlvbiBfdmlzaXQocGF0aCwgaXRlbSwgdmlzaXRvcikge1xuICAgIGxldCBjdHJsID0gdmlzaXRvcihpdGVtLCBwYXRoKTtcbiAgICBpZiAodHlwZW9mIGN0cmwgPT09ICdzeW1ib2wnKVxuICAgICAgICByZXR1cm4gY3RybDtcbiAgICBmb3IgKGNvbnN0IGZpZWxkIG9mIFsna2V5JywgJ3ZhbHVlJ10pIHtcbiAgICAgICAgY29uc3QgdG9rZW4gPSBpdGVtW2ZpZWxkXTtcbiAgICAgICAgaWYgKHRva2VuICYmICdpdGVtcycgaW4gdG9rZW4pIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdG9rZW4uaXRlbXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjaSA9IF92aXNpdChPYmplY3QuZnJlZXplKHBhdGguY29uY2F0KFtbZmllbGQsIGldXSkpLCB0b2tlbi5pdGVtc1tpXSwgdmlzaXRvcik7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjaSA9PT0gJ251bWJlcicpXG4gICAgICAgICAgICAgICAgICAgIGkgPSBjaSAtIDE7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoY2kgPT09IEJSRUFLKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQlJFQUs7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoY2kgPT09IFJFTU9WRSkge1xuICAgICAgICAgICAgICAgICAgICB0b2tlbi5pdGVtcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGkgLT0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZW9mIGN0cmwgPT09ICdmdW5jdGlvbicgJiYgZmllbGQgPT09ICdrZXknKVxuICAgICAgICAgICAgICAgIGN0cmwgPSBjdHJsKGl0ZW0sIHBhdGgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0eXBlb2YgY3RybCA9PT0gJ2Z1bmN0aW9uJyA/IGN0cmwoaXRlbSwgcGF0aCkgOiBjdHJsO1xufVxuXG5leHBvcnRzLnZpc2l0ID0gdmlzaXQ7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIGNzdFNjYWxhciA9IHJlcXVpcmUoJy4vY3N0LXNjYWxhci5qcycpO1xudmFyIGNzdFN0cmluZ2lmeSA9IHJlcXVpcmUoJy4vY3N0LXN0cmluZ2lmeS5qcycpO1xudmFyIGNzdFZpc2l0ID0gcmVxdWlyZSgnLi9jc3QtdmlzaXQuanMnKTtcblxuLyoqIFRoZSBieXRlIG9yZGVyIG1hcmsgKi9cbmNvbnN0IEJPTSA9ICdcXHV7RkVGRn0nO1xuLyoqIFN0YXJ0IG9mIGRvYy1tb2RlICovXG5jb25zdCBET0NVTUVOVCA9ICdcXHgwMic7IC8vIEMwOiBTdGFydCBvZiBUZXh0XG4vKiogVW5leHBlY3RlZCBlbmQgb2YgZmxvdy1tb2RlICovXG5jb25zdCBGTE9XX0VORCA9ICdcXHgxOCc7IC8vIEMwOiBDYW5jZWxcbi8qKiBOZXh0IHRva2VuIGlzIGEgc2NhbGFyIHZhbHVlICovXG5jb25zdCBTQ0FMQVIgPSAnXFx4MWYnOyAvLyBDMDogVW5pdCBTZXBhcmF0b3Jcbi8qKiBAcmV0dXJucyBgdHJ1ZWAgaWYgYHRva2VuYCBpcyBhIGZsb3cgb3IgYmxvY2sgY29sbGVjdGlvbiAqL1xuY29uc3QgaXNDb2xsZWN0aW9uID0gKHRva2VuKSA9PiAhIXRva2VuICYmICdpdGVtcycgaW4gdG9rZW47XG4vKiogQHJldHVybnMgYHRydWVgIGlmIGB0b2tlbmAgaXMgYSBmbG93IG9yIGJsb2NrIHNjYWxhcjsgbm90IGFuIGFsaWFzICovXG5jb25zdCBpc1NjYWxhciA9ICh0b2tlbikgPT4gISF0b2tlbiAmJlxuICAgICh0b2tlbi50eXBlID09PSAnc2NhbGFyJyB8fFxuICAgICAgICB0b2tlbi50eXBlID09PSAnc2luZ2xlLXF1b3RlZC1zY2FsYXInIHx8XG4gICAgICAgIHRva2VuLnR5cGUgPT09ICdkb3VibGUtcXVvdGVkLXNjYWxhcicgfHxcbiAgICAgICAgdG9rZW4udHlwZSA9PT0gJ2Jsb2NrLXNjYWxhcicpO1xuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbi8qKiBHZXQgYSBwcmludGFibGUgcmVwcmVzZW50YXRpb24gb2YgYSBsZXhlciB0b2tlbiAqL1xuZnVuY3Rpb24gcHJldHR5VG9rZW4odG9rZW4pIHtcbiAgICBzd2l0Y2ggKHRva2VuKSB7XG4gICAgICAgIGNhc2UgQk9NOlxuICAgICAgICAgICAgcmV0dXJuICc8Qk9NPic7XG4gICAgICAgIGNhc2UgRE9DVU1FTlQ6XG4gICAgICAgICAgICByZXR1cm4gJzxET0M+JztcbiAgICAgICAgY2FzZSBGTE9XX0VORDpcbiAgICAgICAgICAgIHJldHVybiAnPEZMT1dfRU5EPic7XG4gICAgICAgIGNhc2UgU0NBTEFSOlxuICAgICAgICAgICAgcmV0dXJuICc8U0NBTEFSPic7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodG9rZW4pO1xuICAgIH1cbn1cbi8qKiBJZGVudGlmeSB0aGUgdHlwZSBvZiBhIGxleGVyIHRva2VuLiBNYXkgcmV0dXJuIGBudWxsYCBmb3IgdW5rbm93biB0b2tlbnMuICovXG5mdW5jdGlvbiB0b2tlblR5cGUoc291cmNlKSB7XG4gICAgc3dpdGNoIChzb3VyY2UpIHtcbiAgICAgICAgY2FzZSBCT006XG4gICAgICAgICAgICByZXR1cm4gJ2J5dGUtb3JkZXItbWFyayc7XG4gICAgICAgIGNhc2UgRE9DVU1FTlQ6XG4gICAgICAgICAgICByZXR1cm4gJ2RvYy1tb2RlJztcbiAgICAgICAgY2FzZSBGTE9XX0VORDpcbiAgICAgICAgICAgIHJldHVybiAnZmxvdy1lcnJvci1lbmQnO1xuICAgICAgICBjYXNlIFNDQUxBUjpcbiAgICAgICAgICAgIHJldHVybiAnc2NhbGFyJztcbiAgICAgICAgY2FzZSAnLS0tJzpcbiAgICAgICAgICAgIHJldHVybiAnZG9jLXN0YXJ0JztcbiAgICAgICAgY2FzZSAnLi4uJzpcbiAgICAgICAgICAgIHJldHVybiAnZG9jLWVuZCc7XG4gICAgICAgIGNhc2UgJyc6XG4gICAgICAgIGNhc2UgJ1xcbic6XG4gICAgICAgIGNhc2UgJ1xcclxcbic6XG4gICAgICAgICAgICByZXR1cm4gJ25ld2xpbmUnO1xuICAgICAgICBjYXNlICctJzpcbiAgICAgICAgICAgIHJldHVybiAnc2VxLWl0ZW0taW5kJztcbiAgICAgICAgY2FzZSAnPyc6XG4gICAgICAgICAgICByZXR1cm4gJ2V4cGxpY2l0LWtleS1pbmQnO1xuICAgICAgICBjYXNlICc6JzpcbiAgICAgICAgICAgIHJldHVybiAnbWFwLXZhbHVlLWluZCc7XG4gICAgICAgIGNhc2UgJ3snOlxuICAgICAgICAgICAgcmV0dXJuICdmbG93LW1hcC1zdGFydCc7XG4gICAgICAgIGNhc2UgJ30nOlxuICAgICAgICAgICAgcmV0dXJuICdmbG93LW1hcC1lbmQnO1xuICAgICAgICBjYXNlICdbJzpcbiAgICAgICAgICAgIHJldHVybiAnZmxvdy1zZXEtc3RhcnQnO1xuICAgICAgICBjYXNlICddJzpcbiAgICAgICAgICAgIHJldHVybiAnZmxvdy1zZXEtZW5kJztcbiAgICAgICAgY2FzZSAnLCc6XG4gICAgICAgICAgICByZXR1cm4gJ2NvbW1hJztcbiAgICB9XG4gICAgc3dpdGNoIChzb3VyY2VbMF0pIHtcbiAgICAgICAgY2FzZSAnICc6XG4gICAgICAgIGNhc2UgJ1xcdCc6XG4gICAgICAgICAgICByZXR1cm4gJ3NwYWNlJztcbiAgICAgICAgY2FzZSAnIyc6XG4gICAgICAgICAgICByZXR1cm4gJ2NvbW1lbnQnO1xuICAgICAgICBjYXNlICclJzpcbiAgICAgICAgICAgIHJldHVybiAnZGlyZWN0aXZlLWxpbmUnO1xuICAgICAgICBjYXNlICcqJzpcbiAgICAgICAgICAgIHJldHVybiAnYWxpYXMnO1xuICAgICAgICBjYXNlICcmJzpcbiAgICAgICAgICAgIHJldHVybiAnYW5jaG9yJztcbiAgICAgICAgY2FzZSAnISc6XG4gICAgICAgICAgICByZXR1cm4gJ3RhZyc7XG4gICAgICAgIGNhc2UgXCInXCI6XG4gICAgICAgICAgICByZXR1cm4gJ3NpbmdsZS1xdW90ZWQtc2NhbGFyJztcbiAgICAgICAgY2FzZSAnXCInOlxuICAgICAgICAgICAgcmV0dXJuICdkb3VibGUtcXVvdGVkLXNjYWxhcic7XG4gICAgICAgIGNhc2UgJ3wnOlxuICAgICAgICBjYXNlICc+JzpcbiAgICAgICAgICAgIHJldHVybiAnYmxvY2stc2NhbGFyLWhlYWRlcic7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufVxuXG5leHBvcnRzLmNyZWF0ZVNjYWxhclRva2VuID0gY3N0U2NhbGFyLmNyZWF0ZVNjYWxhclRva2VuO1xuZXhwb3J0cy5yZXNvbHZlQXNTY2FsYXIgPSBjc3RTY2FsYXIucmVzb2x2ZUFzU2NhbGFyO1xuZXhwb3J0cy5zZXRTY2FsYXJWYWx1ZSA9IGNzdFNjYWxhci5zZXRTY2FsYXJWYWx1ZTtcbmV4cG9ydHMuc3RyaW5naWZ5ID0gY3N0U3RyaW5naWZ5LnN0cmluZ2lmeTtcbmV4cG9ydHMudmlzaXQgPSBjc3RWaXNpdC52aXNpdDtcbmV4cG9ydHMuQk9NID0gQk9NO1xuZXhwb3J0cy5ET0NVTUVOVCA9IERPQ1VNRU5UO1xuZXhwb3J0cy5GTE9XX0VORCA9IEZMT1dfRU5EO1xuZXhwb3J0cy5TQ0FMQVIgPSBTQ0FMQVI7XG5leHBvcnRzLmlzQ29sbGVjdGlvbiA9IGlzQ29sbGVjdGlvbjtcbmV4cG9ydHMuaXNTY2FsYXIgPSBpc1NjYWxhcjtcbmV4cG9ydHMucHJldHR5VG9rZW4gPSBwcmV0dHlUb2tlbjtcbmV4cG9ydHMudG9rZW5UeXBlID0gdG9rZW5UeXBlO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBjc3QgPSByZXF1aXJlKCcuL2NzdC5qcycpO1xuXG4vKlxuU1RBUlQgLT4gc3RyZWFtXG5cbnN0cmVhbVxuICBkaXJlY3RpdmUgLT4gbGluZS1lbmQgLT4gc3RyZWFtXG4gIGluZGVudCArIGxpbmUtZW5kIC0+IHN0cmVhbVxuICBbZWxzZV0gLT4gbGluZS1zdGFydFxuXG5saW5lLWVuZFxuICBjb21tZW50IC0+IGxpbmUtZW5kXG4gIG5ld2xpbmUgLT4gLlxuICBpbnB1dC1lbmQgLT4gRU5EXG5cbmxpbmUtc3RhcnRcbiAgZG9jLXN0YXJ0IC0+IGRvY1xuICBkb2MtZW5kIC0+IHN0cmVhbVxuICBbZWxzZV0gLT4gaW5kZW50IC0+IGJsb2NrLXN0YXJ0XG5cbmJsb2NrLXN0YXJ0XG4gIHNlcS1pdGVtLXN0YXJ0IC0+IGJsb2NrLXN0YXJ0XG4gIGV4cGxpY2l0LWtleS1zdGFydCAtPiBibG9jay1zdGFydFxuICBtYXAtdmFsdWUtc3RhcnQgLT4gYmxvY2stc3RhcnRcbiAgW2Vsc2VdIC0+IGRvY1xuXG5kb2NcbiAgbGluZS1lbmQgLT4gbGluZS1zdGFydFxuICBzcGFjZXMgLT4gZG9jXG4gIGFuY2hvciAtPiBkb2NcbiAgdGFnIC0+IGRvY1xuICBmbG93LXN0YXJ0IC0+IGZsb3cgLT4gZG9jXG4gIGZsb3ctZW5kIC0+IGVycm9yIC0+IGRvY1xuICBzZXEtaXRlbS1zdGFydCAtPiBlcnJvciAtPiBkb2NcbiAgZXhwbGljaXQta2V5LXN0YXJ0IC0+IGVycm9yIC0+IGRvY1xuICBtYXAtdmFsdWUtc3RhcnQgLT4gZG9jXG4gIGFsaWFzIC0+IGRvY1xuICBxdW90ZS1zdGFydCAtPiBxdW90ZWQtc2NhbGFyIC0+IGRvY1xuICBibG9jay1zY2FsYXItaGVhZGVyIC0+IGxpbmUtZW5kIC0+IGJsb2NrLXNjYWxhcihtaW4pIC0+IGxpbmUtc3RhcnRcbiAgW2Vsc2VdIC0+IHBsYWluLXNjYWxhcihmYWxzZSwgbWluKSAtPiBkb2NcblxuZmxvd1xuICBsaW5lLWVuZCAtPiBmbG93XG4gIHNwYWNlcyAtPiBmbG93XG4gIGFuY2hvciAtPiBmbG93XG4gIHRhZyAtPiBmbG93XG4gIGZsb3ctc3RhcnQgLT4gZmxvdyAtPiBmbG93XG4gIGZsb3ctZW5kIC0+IC5cbiAgc2VxLWl0ZW0tc3RhcnQgLT4gZXJyb3IgLT4gZmxvd1xuICBleHBsaWNpdC1rZXktc3RhcnQgLT4gZmxvd1xuICBtYXAtdmFsdWUtc3RhcnQgLT4gZmxvd1xuICBhbGlhcyAtPiBmbG93XG4gIHF1b3RlLXN0YXJ0IC0+IHF1b3RlZC1zY2FsYXIgLT4gZmxvd1xuICBjb21tYSAtPiBmbG93XG4gIFtlbHNlXSAtPiBwbGFpbi1zY2FsYXIodHJ1ZSwgMCkgLT4gZmxvd1xuXG5xdW90ZWQtc2NhbGFyXG4gIHF1b3RlLWVuZCAtPiAuXG4gIFtlbHNlXSAtPiBxdW90ZWQtc2NhbGFyXG5cbmJsb2NrLXNjYWxhcihtaW4pXG4gIG5ld2xpbmUgKyBwZWVrKGluZGVudCA8IG1pbikgLT4gLlxuICBbZWxzZV0gLT4gYmxvY2stc2NhbGFyKG1pbilcblxucGxhaW4tc2NhbGFyKGlzLWZsb3csIG1pbilcbiAgc2NhbGFyLWVuZChpcy1mbG93KSAtPiAuXG4gIHBlZWsobmV3bGluZSArIChpbmRlbnQgPCBtaW4pKSAtPiAuXG4gIFtlbHNlXSAtPiBwbGFpbi1zY2FsYXIobWluKVxuKi9cbmZ1bmN0aW9uIGlzRW1wdHkoY2gpIHtcbiAgICBzd2l0Y2ggKGNoKSB7XG4gICAgICAgIGNhc2UgdW5kZWZpbmVkOlxuICAgICAgICBjYXNlICcgJzpcbiAgICAgICAgY2FzZSAnXFxuJzpcbiAgICAgICAgY2FzZSAnXFxyJzpcbiAgICAgICAgY2FzZSAnXFx0JzpcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cbmNvbnN0IGhleERpZ2l0cyA9IG5ldyBTZXQoJzAxMjM0NTY3ODlBQkNERUZhYmNkZWYnKTtcbmNvbnN0IHRhZ0NoYXJzID0gbmV3IFNldChcIjAxMjM0NTY3ODlBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6LSM7Lz86QCY9KyRfLiF+KicoKVwiKTtcbmNvbnN0IGZsb3dJbmRpY2F0b3JDaGFycyA9IG5ldyBTZXQoJyxbXXt9Jyk7XG5jb25zdCBpbnZhbGlkQW5jaG9yQ2hhcnMgPSBuZXcgU2V0KCcgLFtde31cXG5cXHJcXHQnKTtcbmNvbnN0IGlzTm90QW5jaG9yQ2hhciA9IChjaCkgPT4gIWNoIHx8IGludmFsaWRBbmNob3JDaGFycy5oYXMoY2gpO1xuLyoqXG4gKiBTcGxpdHMgYW4gaW5wdXQgc3RyaW5nIGludG8gbGV4aWNhbCB0b2tlbnMsIGkuZS4gc21hbGxlciBzdHJpbmdzIHRoYXQgYXJlXG4gKiBlYXNpbHkgaWRlbnRpZmlhYmxlIGJ5IGB0b2tlbnMudG9rZW5UeXBlKClgLlxuICpcbiAqIExleGluZyBzdGFydHMgYWx3YXlzIGluIGEgXCJzdHJlYW1cIiBjb250ZXh0LiBJbmNvbXBsZXRlIGlucHV0IG1heSBiZSBidWZmZXJlZFxuICogdW50aWwgYSBjb21wbGV0ZSB0b2tlbiBjYW4gYmUgZW1pdHRlZC5cbiAqXG4gKiBJbiBhZGRpdGlvbiB0byBzbGljZXMgb2YgdGhlIG9yaWdpbmFsIGlucHV0LCB0aGUgZm9sbG93aW5nIGNvbnRyb2wgY2hhcmFjdGVyc1xuICogbWF5IGFsc28gYmUgZW1pdHRlZDpcbiAqXG4gKiAtIGBcXHgwMmAgKFN0YXJ0IG9mIFRleHQpOiBBIGRvY3VtZW50IHN0YXJ0cyB3aXRoIHRoZSBuZXh0IHRva2VuXG4gKiAtIGBcXHgxOGAgKENhbmNlbCk6IFVuZXhwZWN0ZWQgZW5kIG9mIGZsb3ctbW9kZSAoaW5kaWNhdGVzIGFuIGVycm9yKVxuICogLSBgXFx4MWZgIChVbml0IFNlcGFyYXRvcik6IE5leHQgdG9rZW4gaXMgYSBzY2FsYXIgdmFsdWVcbiAqIC0gYFxcdXtGRUZGfWAgKEJ5dGUgb3JkZXIgbWFyayk6IEVtaXR0ZWQgc2VwYXJhdGVseSBvdXRzaWRlIGRvY3VtZW50c1xuICovXG5jbGFzcyBMZXhlciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGbGFnIGluZGljYXRpbmcgd2hldGhlciB0aGUgZW5kIG9mIHRoZSBjdXJyZW50IGJ1ZmZlciBtYXJrcyB0aGUgZW5kIG9mXG4gICAgICAgICAqIGFsbCBpbnB1dFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5hdEVuZCA9IGZhbHNlO1xuICAgICAgICAvKipcbiAgICAgICAgICogRXhwbGljaXQgaW5kZW50IHNldCBpbiBibG9jayBzY2FsYXIgaGVhZGVyLCBhcyBhbiBvZmZzZXQgZnJvbSB0aGUgY3VycmVudFxuICAgICAgICAgKiBtaW5pbXVtIGluZGVudCwgc28gZS5nLiBzZXQgdG8gMSBmcm9tIGEgaGVhZGVyIGB8MitgLiBTZXQgdG8gLTEgaWYgbm90XG4gICAgICAgICAqIGV4cGxpY2l0bHkgc2V0LlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5ibG9ja1NjYWxhckluZGVudCA9IC0xO1xuICAgICAgICAvKipcbiAgICAgICAgICogQmxvY2sgc2NhbGFycyB0aGF0IGluY2x1ZGUgYSArIChrZWVwKSBjaG9tcGluZyBpbmRpY2F0b3IgaW4gdGhlaXIgaGVhZGVyXG4gICAgICAgICAqIGluY2x1ZGUgdHJhaWxpbmcgZW1wdHkgbGluZXMsIHdoaWNoIGFyZSBvdGhlcndpc2UgZXhjbHVkZWQgZnJvbSB0aGVcbiAgICAgICAgICogc2NhbGFyJ3MgY29udGVudHMuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmJsb2NrU2NhbGFyS2VlcCA9IGZhbHNlO1xuICAgICAgICAvKiogQ3VycmVudCBpbnB1dCAqL1xuICAgICAgICB0aGlzLmJ1ZmZlciA9ICcnO1xuICAgICAgICAvKipcbiAgICAgICAgICogRmxhZyBub3Rpbmcgd2hldGhlciB0aGUgbWFwIHZhbHVlIGluZGljYXRvciA6IGNhbiBpbW1lZGlhdGVseSBmb2xsb3cgdGhpc1xuICAgICAgICAgKiBub2RlIHdpdGhpbiBhIGZsb3cgY29udGV4dC5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZmxvd0tleSA9IGZhbHNlO1xuICAgICAgICAvKiogQ291bnQgb2Ygc3Vycm91bmRpbmcgZmxvdyBjb2xsZWN0aW9uIGxldmVscy4gKi9cbiAgICAgICAgdGhpcy5mbG93TGV2ZWwgPSAwO1xuICAgICAgICAvKipcbiAgICAgICAgICogTWluaW11bSBsZXZlbCBvZiBpbmRlbnRhdGlvbiByZXF1aXJlZCBmb3IgbmV4dCBsaW5lcyB0byBiZSBwYXJzZWQgYXMgYVxuICAgICAgICAgKiBwYXJ0IG9mIHRoZSBjdXJyZW50IHNjYWxhciB2YWx1ZS5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaW5kZW50TmV4dCA9IDA7XG4gICAgICAgIC8qKiBJbmRlbnRhdGlvbiBsZXZlbCBvZiB0aGUgY3VycmVudCBsaW5lLiAqL1xuICAgICAgICB0aGlzLmluZGVudFZhbHVlID0gMDtcbiAgICAgICAgLyoqIFBvc2l0aW9uIG9mIHRoZSBuZXh0IFxcbiBjaGFyYWN0ZXIuICovXG4gICAgICAgIHRoaXMubGluZUVuZFBvcyA9IG51bGw7XG4gICAgICAgIC8qKiBTdG9yZXMgdGhlIHN0YXRlIG9mIHRoZSBsZXhlciBpZiByZWFjaGluZyB0aGUgZW5kIG9mIGluY3BvbXBsZXRlIGlucHV0ICovXG4gICAgICAgIHRoaXMubmV4dCA9IG51bGw7XG4gICAgICAgIC8qKiBBIHBvaW50ZXIgdG8gYGJ1ZmZlcmA7IHRoZSBjdXJyZW50IHBvc2l0aW9uIG9mIHRoZSBsZXhlci4gKi9cbiAgICAgICAgdGhpcy5wb3MgPSAwO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZSBZQU1MIHRva2VucyBmcm9tIHRoZSBgc291cmNlYCBzdHJpbmcuIElmIGBpbmNvbXBsZXRlYCxcbiAgICAgKiBhIHBhcnQgb2YgdGhlIGxhc3QgbGluZSBtYXkgYmUgbGVmdCBhcyBhIGJ1ZmZlciBmb3IgdGhlIG5leHQgY2FsbC5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIEEgZ2VuZXJhdG9yIG9mIGxleGljYWwgdG9rZW5zXG4gICAgICovXG4gICAgKmxleChzb3VyY2UsIGluY29tcGxldGUgPSBmYWxzZSkge1xuICAgICAgICBpZiAoc291cmNlKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHNvdXJjZSAhPT0gJ3N0cmluZycpXG4gICAgICAgICAgICAgICAgdGhyb3cgVHlwZUVycm9yKCdzb3VyY2UgaXMgbm90IGEgc3RyaW5nJyk7XG4gICAgICAgICAgICB0aGlzLmJ1ZmZlciA9IHRoaXMuYnVmZmVyID8gdGhpcy5idWZmZXIgKyBzb3VyY2UgOiBzb3VyY2U7XG4gICAgICAgICAgICB0aGlzLmxpbmVFbmRQb3MgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYXRFbmQgPSAhaW5jb21wbGV0ZTtcbiAgICAgICAgbGV0IG5leHQgPSB0aGlzLm5leHQgPz8gJ3N0cmVhbSc7XG4gICAgICAgIHdoaWxlIChuZXh0ICYmIChpbmNvbXBsZXRlIHx8IHRoaXMuaGFzQ2hhcnMoMSkpKVxuICAgICAgICAgICAgbmV4dCA9IHlpZWxkKiB0aGlzLnBhcnNlTmV4dChuZXh0KTtcbiAgICB9XG4gICAgYXRMaW5lRW5kKCkge1xuICAgICAgICBsZXQgaSA9IHRoaXMucG9zO1xuICAgICAgICBsZXQgY2ggPSB0aGlzLmJ1ZmZlcltpXTtcbiAgICAgICAgd2hpbGUgKGNoID09PSAnICcgfHwgY2ggPT09ICdcXHQnKVxuICAgICAgICAgICAgY2ggPSB0aGlzLmJ1ZmZlclsrK2ldO1xuICAgICAgICBpZiAoIWNoIHx8IGNoID09PSAnIycgfHwgY2ggPT09ICdcXG4nKVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIGlmIChjaCA9PT0gJ1xccicpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5idWZmZXJbaSArIDFdID09PSAnXFxuJztcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjaGFyQXQobikge1xuICAgICAgICByZXR1cm4gdGhpcy5idWZmZXJbdGhpcy5wb3MgKyBuXTtcbiAgICB9XG4gICAgY29udGludWVTY2FsYXIob2Zmc2V0KSB7XG4gICAgICAgIGxldCBjaCA9IHRoaXMuYnVmZmVyW29mZnNldF07XG4gICAgICAgIGlmICh0aGlzLmluZGVudE5leHQgPiAwKSB7XG4gICAgICAgICAgICBsZXQgaW5kZW50ID0gMDtcbiAgICAgICAgICAgIHdoaWxlIChjaCA9PT0gJyAnKVxuICAgICAgICAgICAgICAgIGNoID0gdGhpcy5idWZmZXJbKytpbmRlbnQgKyBvZmZzZXRdO1xuICAgICAgICAgICAgaWYgKGNoID09PSAnXFxyJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5leHQgPSB0aGlzLmJ1ZmZlcltpbmRlbnQgKyBvZmZzZXQgKyAxXTtcbiAgICAgICAgICAgICAgICBpZiAobmV4dCA9PT0gJ1xcbicgfHwgKCFuZXh0ICYmICF0aGlzLmF0RW5kKSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9mZnNldCArIGluZGVudCArIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY2ggPT09ICdcXG4nIHx8IGluZGVudCA+PSB0aGlzLmluZGVudE5leHQgfHwgKCFjaCAmJiAhdGhpcy5hdEVuZClcbiAgICAgICAgICAgICAgICA/IG9mZnNldCArIGluZGVudFxuICAgICAgICAgICAgICAgIDogLTE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoID09PSAnLScgfHwgY2ggPT09ICcuJykge1xuICAgICAgICAgICAgY29uc3QgZHQgPSB0aGlzLmJ1ZmZlci5zdWJzdHIob2Zmc2V0LCAzKTtcbiAgICAgICAgICAgIGlmICgoZHQgPT09ICctLS0nIHx8IGR0ID09PSAnLi4uJykgJiYgaXNFbXB0eSh0aGlzLmJ1ZmZlcltvZmZzZXQgKyAzXSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvZmZzZXQ7XG4gICAgfVxuICAgIGdldExpbmUoKSB7XG4gICAgICAgIGxldCBlbmQgPSB0aGlzLmxpbmVFbmRQb3M7XG4gICAgICAgIGlmICh0eXBlb2YgZW5kICE9PSAnbnVtYmVyJyB8fCAoZW5kICE9PSAtMSAmJiBlbmQgPCB0aGlzLnBvcykpIHtcbiAgICAgICAgICAgIGVuZCA9IHRoaXMuYnVmZmVyLmluZGV4T2YoJ1xcbicsIHRoaXMucG9zKTtcbiAgICAgICAgICAgIHRoaXMubGluZUVuZFBvcyA9IGVuZDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZW5kID09PSAtMSlcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmF0RW5kID8gdGhpcy5idWZmZXIuc3Vic3RyaW5nKHRoaXMucG9zKSA6IG51bGw7XG4gICAgICAgIGlmICh0aGlzLmJ1ZmZlcltlbmQgLSAxXSA9PT0gJ1xccicpXG4gICAgICAgICAgICBlbmQgLT0gMTtcbiAgICAgICAgcmV0dXJuIHRoaXMuYnVmZmVyLnN1YnN0cmluZyh0aGlzLnBvcywgZW5kKTtcbiAgICB9XG4gICAgaGFzQ2hhcnMobikge1xuICAgICAgICByZXR1cm4gdGhpcy5wb3MgKyBuIDw9IHRoaXMuYnVmZmVyLmxlbmd0aDtcbiAgICB9XG4gICAgc2V0TmV4dChzdGF0ZSkge1xuICAgICAgICB0aGlzLmJ1ZmZlciA9IHRoaXMuYnVmZmVyLnN1YnN0cmluZyh0aGlzLnBvcyk7XG4gICAgICAgIHRoaXMucG9zID0gMDtcbiAgICAgICAgdGhpcy5saW5lRW5kUG9zID0gbnVsbDtcbiAgICAgICAgdGhpcy5uZXh0ID0gc3RhdGU7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBwZWVrKG4pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYnVmZmVyLnN1YnN0cih0aGlzLnBvcywgbik7XG4gICAgfVxuICAgICpwYXJzZU5leHQobmV4dCkge1xuICAgICAgICBzd2l0Y2ggKG5leHQpIHtcbiAgICAgICAgICAgIGNhc2UgJ3N0cmVhbSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlU3RyZWFtKCk7XG4gICAgICAgICAgICBjYXNlICdsaW5lLXN0YXJ0JzpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VMaW5lU3RhcnQoKTtcbiAgICAgICAgICAgIGNhc2UgJ2Jsb2NrLXN0YXJ0JzpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VCbG9ja1N0YXJ0KCk7XG4gICAgICAgICAgICBjYXNlICdkb2MnOlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZURvY3VtZW50KCk7XG4gICAgICAgICAgICBjYXNlICdmbG93JzpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VGbG93Q29sbGVjdGlvbigpO1xuICAgICAgICAgICAgY2FzZSAncXVvdGVkLXNjYWxhcic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlUXVvdGVkU2NhbGFyKCk7XG4gICAgICAgICAgICBjYXNlICdibG9jay1zY2FsYXInOlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZUJsb2NrU2NhbGFyKCk7XG4gICAgICAgICAgICBjYXNlICdwbGFpbi1zY2FsYXInOlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZVBsYWluU2NhbGFyKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgKnBhcnNlU3RyZWFtKCkge1xuICAgICAgICBsZXQgbGluZSA9IHRoaXMuZ2V0TGluZSgpO1xuICAgICAgICBpZiAobGluZSA9PT0gbnVsbClcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldE5leHQoJ3N0cmVhbScpO1xuICAgICAgICBpZiAobGluZVswXSA9PT0gY3N0LkJPTSkge1xuICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaENvdW50KDEpO1xuICAgICAgICAgICAgbGluZSA9IGxpbmUuc3Vic3RyaW5nKDEpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsaW5lWzBdID09PSAnJScpIHtcbiAgICAgICAgICAgIGxldCBkaXJFbmQgPSBsaW5lLmxlbmd0aDtcbiAgICAgICAgICAgIGxldCBjcyA9IGxpbmUuaW5kZXhPZignIycpO1xuICAgICAgICAgICAgd2hpbGUgKGNzICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoID0gbGluZVtjcyAtIDFdO1xuICAgICAgICAgICAgICAgIGlmIChjaCA9PT0gJyAnIHx8IGNoID09PSAnXFx0Jykge1xuICAgICAgICAgICAgICAgICAgICBkaXJFbmQgPSBjcyAtIDE7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY3MgPSBsaW5lLmluZGV4T2YoJyMnLCBjcyArIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2ggPSBsaW5lW2RpckVuZCAtIDFdO1xuICAgICAgICAgICAgICAgIGlmIChjaCA9PT0gJyAnIHx8IGNoID09PSAnXFx0JylcbiAgICAgICAgICAgICAgICAgICAgZGlyRW5kIC09IDE7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IG4gPSAoeWllbGQqIHRoaXMucHVzaENvdW50KGRpckVuZCkpICsgKHlpZWxkKiB0aGlzLnB1c2hTcGFjZXModHJ1ZSkpO1xuICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaENvdW50KGxpbmUubGVuZ3RoIC0gbik7IC8vIHBvc3NpYmxlIGNvbW1lbnRcbiAgICAgICAgICAgIHRoaXMucHVzaE5ld2xpbmUoKTtcbiAgICAgICAgICAgIHJldHVybiAnc3RyZWFtJztcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5hdExpbmVFbmQoKSkge1xuICAgICAgICAgICAgY29uc3Qgc3AgPSB5aWVsZCogdGhpcy5wdXNoU3BhY2VzKHRydWUpO1xuICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaENvdW50KGxpbmUubGVuZ3RoIC0gc3ApO1xuICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaE5ld2xpbmUoKTtcbiAgICAgICAgICAgIHJldHVybiAnc3RyZWFtJztcbiAgICAgICAgfVxuICAgICAgICB5aWVsZCBjc3QuRE9DVU1FTlQ7XG4gICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZUxpbmVTdGFydCgpO1xuICAgIH1cbiAgICAqcGFyc2VMaW5lU3RhcnQoKSB7XG4gICAgICAgIGNvbnN0IGNoID0gdGhpcy5jaGFyQXQoMCk7XG4gICAgICAgIGlmICghY2ggJiYgIXRoaXMuYXRFbmQpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXROZXh0KCdsaW5lLXN0YXJ0Jyk7XG4gICAgICAgIGlmIChjaCA9PT0gJy0nIHx8IGNoID09PSAnLicpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5hdEVuZCAmJiAhdGhpcy5oYXNDaGFycyg0KSlcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXROZXh0KCdsaW5lLXN0YXJ0Jyk7XG4gICAgICAgICAgICBjb25zdCBzID0gdGhpcy5wZWVrKDMpO1xuICAgICAgICAgICAgaWYgKChzID09PSAnLS0tJyB8fCBzID09PSAnLi4uJykgJiYgaXNFbXB0eSh0aGlzLmNoYXJBdCgzKSkpIHtcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoQ291bnQoMyk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbmRlbnRWYWx1ZSA9IDA7XG4gICAgICAgICAgICAgICAgdGhpcy5pbmRlbnROZXh0ID0gMDtcbiAgICAgICAgICAgICAgICByZXR1cm4gcyA9PT0gJy0tLScgPyAnZG9jJyA6ICdzdHJlYW0nO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuaW5kZW50VmFsdWUgPSB5aWVsZCogdGhpcy5wdXNoU3BhY2VzKGZhbHNlKTtcbiAgICAgICAgaWYgKHRoaXMuaW5kZW50TmV4dCA+IHRoaXMuaW5kZW50VmFsdWUgJiYgIWlzRW1wdHkodGhpcy5jaGFyQXQoMSkpKVxuICAgICAgICAgICAgdGhpcy5pbmRlbnROZXh0ID0gdGhpcy5pbmRlbnRWYWx1ZTtcbiAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlQmxvY2tTdGFydCgpO1xuICAgIH1cbiAgICAqcGFyc2VCbG9ja1N0YXJ0KCkge1xuICAgICAgICBjb25zdCBbY2gwLCBjaDFdID0gdGhpcy5wZWVrKDIpO1xuICAgICAgICBpZiAoIWNoMSAmJiAhdGhpcy5hdEVuZClcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldE5leHQoJ2Jsb2NrLXN0YXJ0Jyk7XG4gICAgICAgIGlmICgoY2gwID09PSAnLScgfHwgY2gwID09PSAnPycgfHwgY2gwID09PSAnOicpICYmIGlzRW1wdHkoY2gxKSkge1xuICAgICAgICAgICAgY29uc3QgbiA9ICh5aWVsZCogdGhpcy5wdXNoQ291bnQoMSkpICsgKHlpZWxkKiB0aGlzLnB1c2hTcGFjZXModHJ1ZSkpO1xuICAgICAgICAgICAgdGhpcy5pbmRlbnROZXh0ID0gdGhpcy5pbmRlbnRWYWx1ZSArIDE7XG4gICAgICAgICAgICB0aGlzLmluZGVudFZhbHVlICs9IG47XG4gICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VCbG9ja1N0YXJ0KCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICdkb2MnO1xuICAgIH1cbiAgICAqcGFyc2VEb2N1bWVudCgpIHtcbiAgICAgICAgeWllbGQqIHRoaXMucHVzaFNwYWNlcyh0cnVlKTtcbiAgICAgICAgY29uc3QgbGluZSA9IHRoaXMuZ2V0TGluZSgpO1xuICAgICAgICBpZiAobGluZSA9PT0gbnVsbClcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldE5leHQoJ2RvYycpO1xuICAgICAgICBsZXQgbiA9IHlpZWxkKiB0aGlzLnB1c2hJbmRpY2F0b3JzKCk7XG4gICAgICAgIHN3aXRjaCAobGluZVtuXSkge1xuICAgICAgICAgICAgY2FzZSAnIyc6XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaENvdW50KGxpbmUubGVuZ3RoIC0gbik7XG4gICAgICAgICAgICAvLyBmYWxsdGhyb3VnaFxuICAgICAgICAgICAgY2FzZSB1bmRlZmluZWQ6XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaE5ld2xpbmUoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VMaW5lU3RhcnQoKTtcbiAgICAgICAgICAgIGNhc2UgJ3snOlxuICAgICAgICAgICAgY2FzZSAnWyc6XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaENvdW50KDEpO1xuICAgICAgICAgICAgICAgIHRoaXMuZmxvd0tleSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMuZmxvd0xldmVsID0gMTtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2Zsb3cnO1xuICAgICAgICAgICAgY2FzZSAnfSc6XG4gICAgICAgICAgICBjYXNlICddJzpcbiAgICAgICAgICAgICAgICAvLyB0aGlzIGlzIGFuIGVycm9yXG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaENvdW50KDEpO1xuICAgICAgICAgICAgICAgIHJldHVybiAnZG9jJztcbiAgICAgICAgICAgIGNhc2UgJyonOlxuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnB1c2hVbnRpbChpc05vdEFuY2hvckNoYXIpO1xuICAgICAgICAgICAgICAgIHJldHVybiAnZG9jJztcbiAgICAgICAgICAgIGNhc2UgJ1wiJzpcbiAgICAgICAgICAgIGNhc2UgXCInXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlUXVvdGVkU2NhbGFyKCk7XG4gICAgICAgICAgICBjYXNlICd8JzpcbiAgICAgICAgICAgIGNhc2UgJz4nOlxuICAgICAgICAgICAgICAgIG4gKz0geWllbGQqIHRoaXMucGFyc2VCbG9ja1NjYWxhckhlYWRlcigpO1xuICAgICAgICAgICAgICAgIG4gKz0geWllbGQqIHRoaXMucHVzaFNwYWNlcyh0cnVlKTtcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoQ291bnQobGluZS5sZW5ndGggLSBuKTtcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoTmV3bGluZSgpO1xuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZUJsb2NrU2NhbGFyKCk7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZVBsYWluU2NhbGFyKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgKnBhcnNlRmxvd0NvbGxlY3Rpb24oKSB7XG4gICAgICAgIGxldCBubCwgc3A7XG4gICAgICAgIGxldCBpbmRlbnQgPSAtMTtcbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgbmwgPSB5aWVsZCogdGhpcy5wdXNoTmV3bGluZSgpO1xuICAgICAgICAgICAgaWYgKG5sID4gMCkge1xuICAgICAgICAgICAgICAgIHNwID0geWllbGQqIHRoaXMucHVzaFNwYWNlcyhmYWxzZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbmRlbnRWYWx1ZSA9IGluZGVudCA9IHNwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgc3AgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3AgKz0geWllbGQqIHRoaXMucHVzaFNwYWNlcyh0cnVlKTtcbiAgICAgICAgfSB3aGlsZSAobmwgKyBzcCA+IDApO1xuICAgICAgICBjb25zdCBsaW5lID0gdGhpcy5nZXRMaW5lKCk7XG4gICAgICAgIGlmIChsaW5lID09PSBudWxsKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0TmV4dCgnZmxvdycpO1xuICAgICAgICBpZiAoKGluZGVudCAhPT0gLTEgJiYgaW5kZW50IDwgdGhpcy5pbmRlbnROZXh0ICYmIGxpbmVbMF0gIT09ICcjJykgfHxcbiAgICAgICAgICAgIChpbmRlbnQgPT09IDAgJiZcbiAgICAgICAgICAgICAgICAobGluZS5zdGFydHNXaXRoKCctLS0nKSB8fCBsaW5lLnN0YXJ0c1dpdGgoJy4uLicpKSAmJlxuICAgICAgICAgICAgICAgIGlzRW1wdHkobGluZVszXSkpKSB7XG4gICAgICAgICAgICAvLyBBbGxvd2luZyBmb3IgdGhlIHRlcm1pbmFsIF0gb3IgfSBhdCB0aGUgc2FtZSAocmF0aGVyIHRoYW4gZ3JlYXRlcilcbiAgICAgICAgICAgIC8vIGluZGVudCBsZXZlbCBhcyB0aGUgaW5pdGlhbCBbIG9yIHsgaXMgdGVjaG5pY2FsbHkgaW52YWxpZCwgYnV0XG4gICAgICAgICAgICAvLyBmYWlsaW5nIGhlcmUgd291bGQgYmUgc3VycHJpc2luZyB0byB1c2Vycy5cbiAgICAgICAgICAgIGNvbnN0IGF0Rmxvd0VuZE1hcmtlciA9IGluZGVudCA9PT0gdGhpcy5pbmRlbnROZXh0IC0gMSAmJlxuICAgICAgICAgICAgICAgIHRoaXMuZmxvd0xldmVsID09PSAxICYmXG4gICAgICAgICAgICAgICAgKGxpbmVbMF0gPT09ICddJyB8fCBsaW5lWzBdID09PSAnfScpO1xuICAgICAgICAgICAgaWYgKCFhdEZsb3dFbmRNYXJrZXIpIHtcbiAgICAgICAgICAgICAgICAvLyB0aGlzIGlzIGFuIGVycm9yXG4gICAgICAgICAgICAgICAgdGhpcy5mbG93TGV2ZWwgPSAwO1xuICAgICAgICAgICAgICAgIHlpZWxkIGNzdC5GTE9XX0VORDtcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VMaW5lU3RhcnQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBsZXQgbiA9IDA7XG4gICAgICAgIHdoaWxlIChsaW5lW25dID09PSAnLCcpIHtcbiAgICAgICAgICAgIG4gKz0geWllbGQqIHRoaXMucHVzaENvdW50KDEpO1xuICAgICAgICAgICAgbiArPSB5aWVsZCogdGhpcy5wdXNoU3BhY2VzKHRydWUpO1xuICAgICAgICAgICAgdGhpcy5mbG93S2V5ID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgbiArPSB5aWVsZCogdGhpcy5wdXNoSW5kaWNhdG9ycygpO1xuICAgICAgICBzd2l0Y2ggKGxpbmVbbl0pIHtcbiAgICAgICAgICAgIGNhc2UgdW5kZWZpbmVkOlxuICAgICAgICAgICAgICAgIHJldHVybiAnZmxvdyc7XG4gICAgICAgICAgICBjYXNlICcjJzpcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoQ291bnQobGluZS5sZW5ndGggLSBuKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2Zsb3cnO1xuICAgICAgICAgICAgY2FzZSAneyc6XG4gICAgICAgICAgICBjYXNlICdbJzpcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoQ291bnQoMSk7XG4gICAgICAgICAgICAgICAgdGhpcy5mbG93S2V5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5mbG93TGV2ZWwgKz0gMTtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2Zsb3cnO1xuICAgICAgICAgICAgY2FzZSAnfSc6XG4gICAgICAgICAgICBjYXNlICddJzpcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoQ291bnQoMSk7XG4gICAgICAgICAgICAgICAgdGhpcy5mbG93S2V5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmZsb3dMZXZlbCAtPSAxO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmZsb3dMZXZlbCA/ICdmbG93JyA6ICdkb2MnO1xuICAgICAgICAgICAgY2FzZSAnKic6XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaFVudGlsKGlzTm90QW5jaG9yQ2hhcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuICdmbG93JztcbiAgICAgICAgICAgIGNhc2UgJ1wiJzpcbiAgICAgICAgICAgIGNhc2UgXCInXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5mbG93S2V5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VRdW90ZWRTY2FsYXIoKTtcbiAgICAgICAgICAgIGNhc2UgJzonOiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV4dCA9IHRoaXMuY2hhckF0KDEpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmZsb3dLZXkgfHwgaXNFbXB0eShuZXh0KSB8fCBuZXh0ID09PSAnLCcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5mbG93S2V5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnB1c2hDb3VudCgxKTtcbiAgICAgICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaFNwYWNlcyh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdmbG93JztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBmYWxsdGhyb3VnaFxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aGlzLmZsb3dLZXkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VQbGFpblNjYWxhcigpO1xuICAgICAgICB9XG4gICAgfVxuICAgICpwYXJzZVF1b3RlZFNjYWxhcigpIHtcbiAgICAgICAgY29uc3QgcXVvdGUgPSB0aGlzLmNoYXJBdCgwKTtcbiAgICAgICAgbGV0IGVuZCA9IHRoaXMuYnVmZmVyLmluZGV4T2YocXVvdGUsIHRoaXMucG9zICsgMSk7XG4gICAgICAgIGlmIChxdW90ZSA9PT0gXCInXCIpIHtcbiAgICAgICAgICAgIHdoaWxlIChlbmQgIT09IC0xICYmIHRoaXMuYnVmZmVyW2VuZCArIDFdID09PSBcIidcIilcbiAgICAgICAgICAgICAgICBlbmQgPSB0aGlzLmJ1ZmZlci5pbmRleE9mKFwiJ1wiLCBlbmQgKyAyKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIGRvdWJsZS1xdW90ZVxuICAgICAgICAgICAgd2hpbGUgKGVuZCAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBsZXQgbiA9IDA7XG4gICAgICAgICAgICAgICAgd2hpbGUgKHRoaXMuYnVmZmVyW2VuZCAtIDEgLSBuXSA9PT0gJ1xcXFwnKVxuICAgICAgICAgICAgICAgICAgICBuICs9IDE7XG4gICAgICAgICAgICAgICAgaWYgKG4gJSAyID09PSAwKVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBlbmQgPSB0aGlzLmJ1ZmZlci5pbmRleE9mKCdcIicsIGVuZCArIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIE9ubHkgbG9va2luZyBmb3IgbmV3bGluZXMgd2l0aGluIHRoZSBxdW90ZXNcbiAgICAgICAgY29uc3QgcWIgPSB0aGlzLmJ1ZmZlci5zdWJzdHJpbmcoMCwgZW5kKTtcbiAgICAgICAgbGV0IG5sID0gcWIuaW5kZXhPZignXFxuJywgdGhpcy5wb3MpO1xuICAgICAgICBpZiAobmwgIT09IC0xKSB7XG4gICAgICAgICAgICB3aGlsZSAobmwgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY3MgPSB0aGlzLmNvbnRpbnVlU2NhbGFyKG5sICsgMSk7XG4gICAgICAgICAgICAgICAgaWYgKGNzID09PSAtMSlcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgbmwgPSBxYi5pbmRleE9mKCdcXG4nLCBjcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobmwgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgLy8gdGhpcyBpcyBhbiBlcnJvciBjYXVzZWQgYnkgYW4gdW5leHBlY3RlZCB1bmluZGVudFxuICAgICAgICAgICAgICAgIGVuZCA9IG5sIC0gKHFiW25sIC0gMV0gPT09ICdcXHInID8gMiA6IDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChlbmQgPT09IC0xKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuYXRFbmQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0TmV4dCgncXVvdGVkLXNjYWxhcicpO1xuICAgICAgICAgICAgZW5kID0gdGhpcy5idWZmZXIubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIHlpZWxkKiB0aGlzLnB1c2hUb0luZGV4KGVuZCArIDEsIGZhbHNlKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmxvd0xldmVsID8gJ2Zsb3cnIDogJ2RvYyc7XG4gICAgfVxuICAgICpwYXJzZUJsb2NrU2NhbGFySGVhZGVyKCkge1xuICAgICAgICB0aGlzLmJsb2NrU2NhbGFySW5kZW50ID0gLTE7XG4gICAgICAgIHRoaXMuYmxvY2tTY2FsYXJLZWVwID0gZmFsc2U7XG4gICAgICAgIGxldCBpID0gdGhpcy5wb3M7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICBjb25zdCBjaCA9IHRoaXMuYnVmZmVyWysraV07XG4gICAgICAgICAgICBpZiAoY2ggPT09ICcrJylcbiAgICAgICAgICAgICAgICB0aGlzLmJsb2NrU2NhbGFyS2VlcCA9IHRydWU7XG4gICAgICAgICAgICBlbHNlIGlmIChjaCA+ICcwJyAmJiBjaCA8PSAnOScpXG4gICAgICAgICAgICAgICAgdGhpcy5ibG9ja1NjYWxhckluZGVudCA9IE51bWJlcihjaCkgLSAxO1xuICAgICAgICAgICAgZWxzZSBpZiAoY2ggIT09ICctJylcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucHVzaFVudGlsKGNoID0+IGlzRW1wdHkoY2gpIHx8IGNoID09PSAnIycpO1xuICAgIH1cbiAgICAqcGFyc2VCbG9ja1NjYWxhcigpIHtcbiAgICAgICAgbGV0IG5sID0gdGhpcy5wb3MgLSAxOyAvLyBtYXkgYmUgLTEgaWYgdGhpcy5wb3MgPT09IDBcbiAgICAgICAgbGV0IGluZGVudCA9IDA7XG4gICAgICAgIGxldCBjaDtcbiAgICAgICAgbG9vcDogZm9yIChsZXQgaSA9IHRoaXMucG9zOyAoY2ggPSB0aGlzLmJ1ZmZlcltpXSk7ICsraSkge1xuICAgICAgICAgICAgc3dpdGNoIChjaCkge1xuICAgICAgICAgICAgICAgIGNhc2UgJyAnOlxuICAgICAgICAgICAgICAgICAgICBpbmRlbnQgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnXFxuJzpcbiAgICAgICAgICAgICAgICAgICAgbmwgPSBpO1xuICAgICAgICAgICAgICAgICAgICBpbmRlbnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdcXHInOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5leHQgPSB0aGlzLmJ1ZmZlcltpICsgMV07XG4gICAgICAgICAgICAgICAgICAgIGlmICghbmV4dCAmJiAhdGhpcy5hdEVuZClcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldE5leHQoJ2Jsb2NrLXNjYWxhcicpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobmV4dCA9PT0gJ1xcbicpXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9IC8vIGZhbGx0aHJvdWdoXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgYnJlYWsgbG9vcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIWNoICYmICF0aGlzLmF0RW5kKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0TmV4dCgnYmxvY2stc2NhbGFyJyk7XG4gICAgICAgIGlmIChpbmRlbnQgPj0gdGhpcy5pbmRlbnROZXh0KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5ibG9ja1NjYWxhckluZGVudCA9PT0gLTEpXG4gICAgICAgICAgICAgICAgdGhpcy5pbmRlbnROZXh0ID0gaW5kZW50O1xuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbmRlbnROZXh0ID1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ibG9ja1NjYWxhckluZGVudCArICh0aGlzLmluZGVudE5leHQgPT09IDAgPyAxIDogdGhpcy5pbmRlbnROZXh0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjcyA9IHRoaXMuY29udGludWVTY2FsYXIobmwgKyAxKTtcbiAgICAgICAgICAgICAgICBpZiAoY3MgPT09IC0xKVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBubCA9IHRoaXMuYnVmZmVyLmluZGV4T2YoJ1xcbicsIGNzKTtcbiAgICAgICAgICAgIH0gd2hpbGUgKG5sICE9PSAtMSk7XG4gICAgICAgICAgICBpZiAobmwgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmF0RW5kKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXROZXh0KCdibG9jay1zY2FsYXInKTtcbiAgICAgICAgICAgICAgICBubCA9IHRoaXMuYnVmZmVyLmxlbmd0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBUcmFpbGluZyBpbnN1ZmZpY2llbnRseSBpbmRlbnRlZCB0YWJzIGFyZSBpbnZhbGlkLlxuICAgICAgICAvLyBUbyBjYXRjaCB0aGF0IGR1cmluZyBwYXJzaW5nLCB3ZSBpbmNsdWRlIHRoZW0gaW4gdGhlIGJsb2NrIHNjYWxhciB2YWx1ZS5cbiAgICAgICAgbGV0IGkgPSBubCArIDE7XG4gICAgICAgIGNoID0gdGhpcy5idWZmZXJbaV07XG4gICAgICAgIHdoaWxlIChjaCA9PT0gJyAnKVxuICAgICAgICAgICAgY2ggPSB0aGlzLmJ1ZmZlclsrK2ldO1xuICAgICAgICBpZiAoY2ggPT09ICdcXHQnKSB7XG4gICAgICAgICAgICB3aGlsZSAoY2ggPT09ICdcXHQnIHx8IGNoID09PSAnICcgfHwgY2ggPT09ICdcXHInIHx8IGNoID09PSAnXFxuJylcbiAgICAgICAgICAgICAgICBjaCA9IHRoaXMuYnVmZmVyWysraV07XG4gICAgICAgICAgICBubCA9IGkgLSAxO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCF0aGlzLmJsb2NrU2NhbGFyS2VlcCkge1xuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIGxldCBpID0gbmwgLSAxO1xuICAgICAgICAgICAgICAgIGxldCBjaCA9IHRoaXMuYnVmZmVyW2ldO1xuICAgICAgICAgICAgICAgIGlmIChjaCA9PT0gJ1xccicpXG4gICAgICAgICAgICAgICAgICAgIGNoID0gdGhpcy5idWZmZXJbLS1pXTtcbiAgICAgICAgICAgICAgICBjb25zdCBsYXN0Q2hhciA9IGk7IC8vIERyb3AgdGhlIGxpbmUgaWYgbGFzdCBjaGFyIG5vdCBtb3JlIGluZGVudGVkXG4gICAgICAgICAgICAgICAgd2hpbGUgKGNoID09PSAnICcpXG4gICAgICAgICAgICAgICAgICAgIGNoID0gdGhpcy5idWZmZXJbLS1pXTtcbiAgICAgICAgICAgICAgICBpZiAoY2ggPT09ICdcXG4nICYmIGkgPj0gdGhpcy5wb3MgJiYgaSArIDEgKyBpbmRlbnQgPiBsYXN0Q2hhcilcbiAgICAgICAgICAgICAgICAgICAgbmwgPSBpO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9IHdoaWxlICh0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICB5aWVsZCBjc3QuU0NBTEFSO1xuICAgICAgICB5aWVsZCogdGhpcy5wdXNoVG9JbmRleChubCArIDEsIHRydWUpO1xuICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VMaW5lU3RhcnQoKTtcbiAgICB9XG4gICAgKnBhcnNlUGxhaW5TY2FsYXIoKSB7XG4gICAgICAgIGNvbnN0IGluRmxvdyA9IHRoaXMuZmxvd0xldmVsID4gMDtcbiAgICAgICAgbGV0IGVuZCA9IHRoaXMucG9zIC0gMTtcbiAgICAgICAgbGV0IGkgPSB0aGlzLnBvcyAtIDE7XG4gICAgICAgIGxldCBjaDtcbiAgICAgICAgd2hpbGUgKChjaCA9IHRoaXMuYnVmZmVyWysraV0pKSB7XG4gICAgICAgICAgICBpZiAoY2ggPT09ICc6Jykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5leHQgPSB0aGlzLmJ1ZmZlcltpICsgMV07XG4gICAgICAgICAgICAgICAgaWYgKGlzRW1wdHkobmV4dCkgfHwgKGluRmxvdyAmJiBmbG93SW5kaWNhdG9yQ2hhcnMuaGFzKG5leHQpKSlcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZW5kID0gaTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGlzRW1wdHkoY2gpKSB7XG4gICAgICAgICAgICAgICAgbGV0IG5leHQgPSB0aGlzLmJ1ZmZlcltpICsgMV07XG4gICAgICAgICAgICAgICAgaWYgKGNoID09PSAnXFxyJykge1xuICAgICAgICAgICAgICAgICAgICBpZiAobmV4dCA9PT0gJ1xcbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGkgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoID0gJ1xcbic7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0ID0gdGhpcy5idWZmZXJbaSArIDFdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZCA9IGk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChuZXh0ID09PSAnIycgfHwgKGluRmxvdyAmJiBmbG93SW5kaWNhdG9yQ2hhcnMuaGFzKG5leHQpKSlcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgaWYgKGNoID09PSAnXFxuJykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjcyA9IHRoaXMuY29udGludWVTY2FsYXIoaSArIDEpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3MgPT09IC0xKVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGkgPSBNYXRoLm1heChpLCBjcyAtIDIpOyAvLyB0byBhZHZhbmNlLCBidXQgc3RpbGwgYWNjb3VudCBmb3IgJyAjJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChpbkZsb3cgJiYgZmxvd0luZGljYXRvckNoYXJzLmhhcyhjaCkpXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGVuZCA9IGk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFjaCAmJiAhdGhpcy5hdEVuZClcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldE5leHQoJ3BsYWluLXNjYWxhcicpO1xuICAgICAgICB5aWVsZCBjc3QuU0NBTEFSO1xuICAgICAgICB5aWVsZCogdGhpcy5wdXNoVG9JbmRleChlbmQgKyAxLCB0cnVlKTtcbiAgICAgICAgcmV0dXJuIGluRmxvdyA/ICdmbG93JyA6ICdkb2MnO1xuICAgIH1cbiAgICAqcHVzaENvdW50KG4pIHtcbiAgICAgICAgaWYgKG4gPiAwKSB7XG4gICAgICAgICAgICB5aWVsZCB0aGlzLmJ1ZmZlci5zdWJzdHIodGhpcy5wb3MsIG4pO1xuICAgICAgICAgICAgdGhpcy5wb3MgKz0gbjtcbiAgICAgICAgICAgIHJldHVybiBuO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICAqcHVzaFRvSW5kZXgoaSwgYWxsb3dFbXB0eSkge1xuICAgICAgICBjb25zdCBzID0gdGhpcy5idWZmZXIuc2xpY2UodGhpcy5wb3MsIGkpO1xuICAgICAgICBpZiAocykge1xuICAgICAgICAgICAgeWllbGQgcztcbiAgICAgICAgICAgIHRoaXMucG9zICs9IHMubGVuZ3RoO1xuICAgICAgICAgICAgcmV0dXJuIHMubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGFsbG93RW1wdHkpXG4gICAgICAgICAgICB5aWVsZCAnJztcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgICpwdXNoSW5kaWNhdG9ycygpIHtcbiAgICAgICAgc3dpdGNoICh0aGlzLmNoYXJBdCgwKSkge1xuICAgICAgICAgICAgY2FzZSAnISc6XG4gICAgICAgICAgICAgICAgcmV0dXJuICgoeWllbGQqIHRoaXMucHVzaFRhZygpKSArXG4gICAgICAgICAgICAgICAgICAgICh5aWVsZCogdGhpcy5wdXNoU3BhY2VzKHRydWUpKSArXG4gICAgICAgICAgICAgICAgICAgICh5aWVsZCogdGhpcy5wdXNoSW5kaWNhdG9ycygpKSk7XG4gICAgICAgICAgICBjYXNlICcmJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gKCh5aWVsZCogdGhpcy5wdXNoVW50aWwoaXNOb3RBbmNob3JDaGFyKSkgK1xuICAgICAgICAgICAgICAgICAgICAoeWllbGQqIHRoaXMucHVzaFNwYWNlcyh0cnVlKSkgK1xuICAgICAgICAgICAgICAgICAgICAoeWllbGQqIHRoaXMucHVzaEluZGljYXRvcnMoKSkpO1xuICAgICAgICAgICAgY2FzZSAnLSc6IC8vIHRoaXMgaXMgYW4gZXJyb3JcbiAgICAgICAgICAgIGNhc2UgJz8nOiAvLyB0aGlzIGlzIGFuIGVycm9yIG91dHNpZGUgZmxvdyBjb2xsZWN0aW9uc1xuICAgICAgICAgICAgY2FzZSAnOic6IHtcbiAgICAgICAgICAgICAgICBjb25zdCBpbkZsb3cgPSB0aGlzLmZsb3dMZXZlbCA+IDA7XG4gICAgICAgICAgICAgICAgY29uc3QgY2gxID0gdGhpcy5jaGFyQXQoMSk7XG4gICAgICAgICAgICAgICAgaWYgKGlzRW1wdHkoY2gxKSB8fCAoaW5GbG93ICYmIGZsb3dJbmRpY2F0b3JDaGFycy5oYXMoY2gxKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpbkZsb3cpXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluZGVudE5leHQgPSB0aGlzLmluZGVudFZhbHVlICsgMTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5mbG93S2V5KVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mbG93S2V5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoKHlpZWxkKiB0aGlzLnB1c2hDb3VudCgxKSkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgKHlpZWxkKiB0aGlzLnB1c2hTcGFjZXModHJ1ZSkpICtcbiAgICAgICAgICAgICAgICAgICAgICAgICh5aWVsZCogdGhpcy5wdXNoSW5kaWNhdG9ycygpKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICAqcHVzaFRhZygpIHtcbiAgICAgICAgaWYgKHRoaXMuY2hhckF0KDEpID09PSAnPCcpIHtcbiAgICAgICAgICAgIGxldCBpID0gdGhpcy5wb3MgKyAyO1xuICAgICAgICAgICAgbGV0IGNoID0gdGhpcy5idWZmZXJbaV07XG4gICAgICAgICAgICB3aGlsZSAoIWlzRW1wdHkoY2gpICYmIGNoICE9PSAnPicpXG4gICAgICAgICAgICAgICAgY2ggPSB0aGlzLmJ1ZmZlclsrK2ldO1xuICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnB1c2hUb0luZGV4KGNoID09PSAnPicgPyBpICsgMSA6IGksIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGxldCBpID0gdGhpcy5wb3MgKyAxO1xuICAgICAgICAgICAgbGV0IGNoID0gdGhpcy5idWZmZXJbaV07XG4gICAgICAgICAgICB3aGlsZSAoY2gpIHtcbiAgICAgICAgICAgICAgICBpZiAodGFnQ2hhcnMuaGFzKGNoKSlcbiAgICAgICAgICAgICAgICAgICAgY2ggPSB0aGlzLmJ1ZmZlclsrK2ldO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNoID09PSAnJScgJiZcbiAgICAgICAgICAgICAgICAgICAgaGV4RGlnaXRzLmhhcyh0aGlzLmJ1ZmZlcltpICsgMV0pICYmXG4gICAgICAgICAgICAgICAgICAgIGhleERpZ2l0cy5oYXModGhpcy5idWZmZXJbaSArIDJdKSkge1xuICAgICAgICAgICAgICAgICAgICBjaCA9IHRoaXMuYnVmZmVyWyhpICs9IDMpXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wdXNoVG9JbmRleChpLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgKnB1c2hOZXdsaW5lKCkge1xuICAgICAgICBjb25zdCBjaCA9IHRoaXMuYnVmZmVyW3RoaXMucG9zXTtcbiAgICAgICAgaWYgKGNoID09PSAnXFxuJylcbiAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wdXNoQ291bnQoMSk7XG4gICAgICAgIGVsc2UgaWYgKGNoID09PSAnXFxyJyAmJiB0aGlzLmNoYXJBdCgxKSA9PT0gJ1xcbicpXG4gICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucHVzaENvdW50KDIpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICB9XG4gICAgKnB1c2hTcGFjZXMoYWxsb3dUYWJzKSB7XG4gICAgICAgIGxldCBpID0gdGhpcy5wb3MgLSAxO1xuICAgICAgICBsZXQgY2g7XG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIGNoID0gdGhpcy5idWZmZXJbKytpXTtcbiAgICAgICAgfSB3aGlsZSAoY2ggPT09ICcgJyB8fCAoYWxsb3dUYWJzICYmIGNoID09PSAnXFx0JykpO1xuICAgICAgICBjb25zdCBuID0gaSAtIHRoaXMucG9zO1xuICAgICAgICBpZiAobiA+IDApIHtcbiAgICAgICAgICAgIHlpZWxkIHRoaXMuYnVmZmVyLnN1YnN0cih0aGlzLnBvcywgbik7XG4gICAgICAgICAgICB0aGlzLnBvcyA9IGk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG47XG4gICAgfVxuICAgICpwdXNoVW50aWwodGVzdCkge1xuICAgICAgICBsZXQgaSA9IHRoaXMucG9zO1xuICAgICAgICBsZXQgY2ggPSB0aGlzLmJ1ZmZlcltpXTtcbiAgICAgICAgd2hpbGUgKCF0ZXN0KGNoKSlcbiAgICAgICAgICAgIGNoID0gdGhpcy5idWZmZXJbKytpXTtcbiAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnB1c2hUb0luZGV4KGksIGZhbHNlKTtcbiAgICB9XG59XG5cbmV4cG9ydHMuTGV4ZXIgPSBMZXhlcjtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFRyYWNrcyBuZXdsaW5lcyBkdXJpbmcgcGFyc2luZyBpbiBvcmRlciB0byBwcm92aWRlIGFuIGVmZmljaWVudCBBUEkgZm9yXG4gKiBkZXRlcm1pbmluZyB0aGUgb25lLWluZGV4ZWQgYHsgbGluZSwgY29sIH1gIHBvc2l0aW9uIGZvciBhbnkgb2Zmc2V0XG4gKiB3aXRoaW4gdGhlIGlucHV0LlxuICovXG5jbGFzcyBMaW5lQ291bnRlciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMubGluZVN0YXJ0cyA9IFtdO1xuICAgICAgICAvKipcbiAgICAgICAgICogU2hvdWxkIGJlIGNhbGxlZCBpbiBhc2NlbmRpbmcgb3JkZXIuIE90aGVyd2lzZSwgY2FsbFxuICAgICAgICAgKiBgbGluZUNvdW50ZXIubGluZVN0YXJ0cy5zb3J0KClgIGJlZm9yZSBjYWxsaW5nIGBsaW5lUG9zKClgLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5hZGROZXdMaW5lID0gKG9mZnNldCkgPT4gdGhpcy5saW5lU3RhcnRzLnB1c2gob2Zmc2V0KTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFBlcmZvcm1zIGEgYmluYXJ5IHNlYXJjaCBhbmQgcmV0dXJucyB0aGUgMS1pbmRleGVkIHsgbGluZSwgY29sIH1cbiAgICAgICAgICogcG9zaXRpb24gb2YgYG9mZnNldGAuIElmIGBsaW5lID09PSAwYCwgYGFkZE5ld0xpbmVgIGhhcyBuZXZlciBiZWVuXG4gICAgICAgICAqIGNhbGxlZCBvciBgb2Zmc2V0YCBpcyBiZWZvcmUgdGhlIGZpcnN0IGtub3duIG5ld2xpbmUuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmxpbmVQb3MgPSAob2Zmc2V0KSA9PiB7XG4gICAgICAgICAgICBsZXQgbG93ID0gMDtcbiAgICAgICAgICAgIGxldCBoaWdoID0gdGhpcy5saW5lU3RhcnRzLmxlbmd0aDtcbiAgICAgICAgICAgIHdoaWxlIChsb3cgPCBoaWdoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWlkID0gKGxvdyArIGhpZ2gpID4+IDE7IC8vIE1hdGguZmxvb3IoKGxvdyArIGhpZ2gpIC8gMilcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5saW5lU3RhcnRzW21pZF0gPCBvZmZzZXQpXG4gICAgICAgICAgICAgICAgICAgIGxvdyA9IG1pZCArIDE7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBoaWdoID0gbWlkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMubGluZVN0YXJ0c1tsb3ddID09PSBvZmZzZXQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgbGluZTogbG93ICsgMSwgY29sOiAxIH07XG4gICAgICAgICAgICBpZiAobG93ID09PSAwKVxuICAgICAgICAgICAgICAgIHJldHVybiB7IGxpbmU6IDAsIGNvbDogb2Zmc2V0IH07XG4gICAgICAgICAgICBjb25zdCBzdGFydCA9IHRoaXMubGluZVN0YXJ0c1tsb3cgLSAxXTtcbiAgICAgICAgICAgIHJldHVybiB7IGxpbmU6IGxvdywgY29sOiBvZmZzZXQgLSBzdGFydCArIDEgfTtcbiAgICAgICAgfTtcbiAgICB9XG59XG5cbmV4cG9ydHMuTGluZUNvdW50ZXIgPSBMaW5lQ291bnRlcjtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbm9kZV9wcm9jZXNzID0gcmVxdWlyZSgncHJvY2VzcycpO1xudmFyIGNzdCA9IHJlcXVpcmUoJy4vY3N0LmpzJyk7XG52YXIgbGV4ZXIgPSByZXF1aXJlKCcuL2xleGVyLmpzJyk7XG5cbmZ1bmN0aW9uIGluY2x1ZGVzVG9rZW4obGlzdCwgdHlwZSkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7ICsraSlcbiAgICAgICAgaWYgKGxpc3RbaV0udHlwZSA9PT0gdHlwZSlcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgIHJldHVybiBmYWxzZTtcbn1cbmZ1bmN0aW9uIGZpbmROb25FbXB0eUluZGV4KGxpc3QpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgc3dpdGNoIChsaXN0W2ldLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcbiAgICAgICAgICAgIGNhc2UgJ2NvbW1lbnQnOlxuICAgICAgICAgICAgY2FzZSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiAtMTtcbn1cbmZ1bmN0aW9uIGlzRmxvd1Rva2VuKHRva2VuKSB7XG4gICAgc3dpdGNoICh0b2tlbj8udHlwZSkge1xuICAgICAgICBjYXNlICdhbGlhcyc6XG4gICAgICAgIGNhc2UgJ3NjYWxhcic6XG4gICAgICAgIGNhc2UgJ3NpbmdsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgY2FzZSAnZG91YmxlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICBjYXNlICdmbG93LWNvbGxlY3Rpb24nOlxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuZnVuY3Rpb24gZ2V0UHJldlByb3BzKHBhcmVudCkge1xuICAgIHN3aXRjaCAocGFyZW50LnR5cGUpIHtcbiAgICAgICAgY2FzZSAnZG9jdW1lbnQnOlxuICAgICAgICAgICAgcmV0dXJuIHBhcmVudC5zdGFydDtcbiAgICAgICAgY2FzZSAnYmxvY2stbWFwJzoge1xuICAgICAgICAgICAgY29uc3QgaXQgPSBwYXJlbnQuaXRlbXNbcGFyZW50Lml0ZW1zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgcmV0dXJuIGl0LnNlcCA/PyBpdC5zdGFydDtcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdibG9jay1zZXEnOlxuICAgICAgICAgICAgcmV0dXJuIHBhcmVudC5pdGVtc1twYXJlbnQuaXRlbXMubGVuZ3RoIC0gMV0uc3RhcnQ7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0IHNob3VsZCBub3QgaGFwcGVuICovXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgfVxufVxuLyoqIE5vdGU6IE1heSBtb2RpZnkgaW5wdXQgYXJyYXkgKi9cbmZ1bmN0aW9uIGdldEZpcnN0S2V5U3RhcnRQcm9wcyhwcmV2KSB7XG4gICAgaWYgKHByZXYubGVuZ3RoID09PSAwKVxuICAgICAgICByZXR1cm4gW107XG4gICAgbGV0IGkgPSBwcmV2Lmxlbmd0aDtcbiAgICBsb29wOiB3aGlsZSAoLS1pID49IDApIHtcbiAgICAgICAgc3dpdGNoIChwcmV2W2ldLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2RvYy1zdGFydCc6XG4gICAgICAgICAgICBjYXNlICdleHBsaWNpdC1rZXktaW5kJzpcbiAgICAgICAgICAgIGNhc2UgJ21hcC12YWx1ZS1pbmQnOlxuICAgICAgICAgICAgY2FzZSAnc2VxLWl0ZW0taW5kJzpcbiAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgIGJyZWFrIGxvb3A7XG4gICAgICAgIH1cbiAgICB9XG4gICAgd2hpbGUgKHByZXZbKytpXT8udHlwZSA9PT0gJ3NwYWNlJykge1xuICAgICAgICAvKiBsb29wICovXG4gICAgfVxuICAgIHJldHVybiBwcmV2LnNwbGljZShpLCBwcmV2Lmxlbmd0aCk7XG59XG5mdW5jdGlvbiBmaXhGbG93U2VxSXRlbXMoZmMpIHtcbiAgICBpZiAoZmMuc3RhcnQudHlwZSA9PT0gJ2Zsb3ctc2VxLXN0YXJ0Jykge1xuICAgICAgICBmb3IgKGNvbnN0IGl0IG9mIGZjLml0ZW1zKSB7XG4gICAgICAgICAgICBpZiAoaXQuc2VwICYmXG4gICAgICAgICAgICAgICAgIWl0LnZhbHVlICYmXG4gICAgICAgICAgICAgICAgIWluY2x1ZGVzVG9rZW4oaXQuc3RhcnQsICdleHBsaWNpdC1rZXktaW5kJykgJiZcbiAgICAgICAgICAgICAgICAhaW5jbHVkZXNUb2tlbihpdC5zZXAsICdtYXAtdmFsdWUtaW5kJykpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXQua2V5KVxuICAgICAgICAgICAgICAgICAgICBpdC52YWx1ZSA9IGl0LmtleTtcbiAgICAgICAgICAgICAgICBkZWxldGUgaXQua2V5O1xuICAgICAgICAgICAgICAgIGlmIChpc0Zsb3dUb2tlbihpdC52YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0LnZhbHVlLmVuZClcbiAgICAgICAgICAgICAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KGl0LnZhbHVlLmVuZCwgaXQuc2VwKTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgaXQudmFsdWUuZW5kID0gaXQuc2VwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KGl0LnN0YXJ0LCBpdC5zZXApO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBpdC5zZXA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4vKipcbiAqIEEgWUFNTCBjb25jcmV0ZSBzeW50YXggdHJlZSAoQ1NUKSBwYXJzZXJcbiAqXG4gKiBgYGB0c1xuICogY29uc3Qgc3JjOiBzdHJpbmcgPSAuLi5cbiAqIGZvciAoY29uc3QgdG9rZW4gb2YgbmV3IFBhcnNlcigpLnBhcnNlKHNyYykpIHtcbiAqICAgLy8gdG9rZW46IFRva2VuXG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBUbyB1c2UgdGhlIHBhcnNlciB3aXRoIGEgdXNlci1wcm92aWRlZCBsZXhlcjpcbiAqXG4gKiBgYGB0c1xuICogZnVuY3Rpb24qIHBhcnNlKHNvdXJjZTogc3RyaW5nLCBsZXhlcjogTGV4ZXIpIHtcbiAqICAgY29uc3QgcGFyc2VyID0gbmV3IFBhcnNlcigpXG4gKiAgIGZvciAoY29uc3QgbGV4ZW1lIG9mIGxleGVyLmxleChzb3VyY2UpKVxuICogICAgIHlpZWxkKiBwYXJzZXIubmV4dChsZXhlbWUpXG4gKiAgIHlpZWxkKiBwYXJzZXIuZW5kKClcbiAqIH1cbiAqXG4gKiBjb25zdCBzcmM6IHN0cmluZyA9IC4uLlxuICogY29uc3QgbGV4ZXIgPSBuZXcgTGV4ZXIoKVxuICogZm9yIChjb25zdCB0b2tlbiBvZiBwYXJzZShzcmMsIGxleGVyKSkge1xuICogICAvLyB0b2tlbjogVG9rZW5cbiAqIH1cbiAqIGBgYFxuICovXG5jbGFzcyBQYXJzZXIge1xuICAgIC8qKlxuICAgICAqIEBwYXJhbSBvbk5ld0xpbmUgLSBJZiBkZWZpbmVkLCBjYWxsZWQgc2VwYXJhdGVseSB3aXRoIHRoZSBzdGFydCBwb3NpdGlvbiBvZlxuICAgICAqICAgZWFjaCBuZXcgbGluZSAoaW4gYHBhcnNlKClgLCBpbmNsdWRpbmcgdGhlIHN0YXJ0IG9mIGlucHV0KS5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcihvbk5ld0xpbmUpIHtcbiAgICAgICAgLyoqIElmIHRydWUsIHNwYWNlIGFuZCBzZXF1ZW5jZSBpbmRpY2F0b3JzIGNvdW50IGFzIGluZGVudGF0aW9uICovXG4gICAgICAgIHRoaXMuYXROZXdMaW5lID0gdHJ1ZTtcbiAgICAgICAgLyoqIElmIHRydWUsIG5leHQgdG9rZW4gaXMgYSBzY2FsYXIgdmFsdWUgKi9cbiAgICAgICAgdGhpcy5hdFNjYWxhciA9IGZhbHNlO1xuICAgICAgICAvKiogQ3VycmVudCBpbmRlbnRhdGlvbiBsZXZlbCAqL1xuICAgICAgICB0aGlzLmluZGVudCA9IDA7XG4gICAgICAgIC8qKiBDdXJyZW50IG9mZnNldCBzaW5jZSB0aGUgc3RhcnQgb2YgcGFyc2luZyAqL1xuICAgICAgICB0aGlzLm9mZnNldCA9IDA7XG4gICAgICAgIC8qKiBPbiB0aGUgc2FtZSBsaW5lIHdpdGggYSBibG9jayBtYXAga2V5ICovXG4gICAgICAgIHRoaXMub25LZXlMaW5lID0gZmFsc2U7XG4gICAgICAgIC8qKiBUb3AgaW5kaWNhdGVzIHRoZSBub2RlIHRoYXQncyBjdXJyZW50bHkgYmVpbmcgYnVpbHQgKi9cbiAgICAgICAgdGhpcy5zdGFjayA9IFtdO1xuICAgICAgICAvKiogVGhlIHNvdXJjZSBvZiB0aGUgY3VycmVudCB0b2tlbiwgc2V0IGluIHBhcnNlKCkgKi9cbiAgICAgICAgdGhpcy5zb3VyY2UgPSAnJztcbiAgICAgICAgLyoqIFRoZSB0eXBlIG9mIHRoZSBjdXJyZW50IHRva2VuLCBzZXQgaW4gcGFyc2UoKSAqL1xuICAgICAgICB0aGlzLnR5cGUgPSAnJztcbiAgICAgICAgLy8gTXVzdCBiZSBkZWZpbmVkIGFmdGVyIGBuZXh0KClgXG4gICAgICAgIHRoaXMubGV4ZXIgPSBuZXcgbGV4ZXIuTGV4ZXIoKTtcbiAgICAgICAgdGhpcy5vbk5ld0xpbmUgPSBvbk5ld0xpbmU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFBhcnNlIGBzb3VyY2VgIGFzIGEgWUFNTCBzdHJlYW0uXG4gICAgICogSWYgYGluY29tcGxldGVgLCBhIHBhcnQgb2YgdGhlIGxhc3QgbGluZSBtYXkgYmUgbGVmdCBhcyBhIGJ1ZmZlciBmb3IgdGhlIG5leHQgY2FsbC5cbiAgICAgKlxuICAgICAqIEVycm9ycyBhcmUgbm90IHRocm93biwgYnV0IHlpZWxkZWQgYXMgYHsgdHlwZTogJ2Vycm9yJywgbWVzc2FnZSB9YCB0b2tlbnMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBBIGdlbmVyYXRvciBvZiB0b2tlbnMgcmVwcmVzZW50aW5nIGVhY2ggZGlyZWN0aXZlLCBkb2N1bWVudCwgYW5kIG90aGVyIHN0cnVjdHVyZS5cbiAgICAgKi9cbiAgICAqcGFyc2Uoc291cmNlLCBpbmNvbXBsZXRlID0gZmFsc2UpIHtcbiAgICAgICAgaWYgKHRoaXMub25OZXdMaW5lICYmIHRoaXMub2Zmc2V0ID09PSAwKVxuICAgICAgICAgICAgdGhpcy5vbk5ld0xpbmUoMCk7XG4gICAgICAgIGZvciAoY29uc3QgbGV4ZW1lIG9mIHRoaXMubGV4ZXIubGV4KHNvdXJjZSwgaW5jb21wbGV0ZSkpXG4gICAgICAgICAgICB5aWVsZCogdGhpcy5uZXh0KGxleGVtZSk7XG4gICAgICAgIGlmICghaW5jb21wbGV0ZSlcbiAgICAgICAgICAgIHlpZWxkKiB0aGlzLmVuZCgpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBZHZhbmNlIHRoZSBwYXJzZXIgYnkgdGhlIGBzb3VyY2VgIG9mIG9uZSBsZXhpY2FsIHRva2VuLlxuICAgICAqL1xuICAgICpuZXh0KHNvdXJjZSkge1xuICAgICAgICB0aGlzLnNvdXJjZSA9IHNvdXJjZTtcbiAgICAgICAgaWYgKG5vZGVfcHJvY2Vzcy5lbnYuTE9HX1RPS0VOUylcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCd8JywgY3N0LnByZXR0eVRva2VuKHNvdXJjZSkpO1xuICAgICAgICBpZiAodGhpcy5hdFNjYWxhcikge1xuICAgICAgICAgICAgdGhpcy5hdFNjYWxhciA9IGZhbHNlO1xuICAgICAgICAgICAgeWllbGQqIHRoaXMuc3RlcCgpO1xuICAgICAgICAgICAgdGhpcy5vZmZzZXQgKz0gc291cmNlLmxlbmd0aDtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0eXBlID0gY3N0LnRva2VuVHlwZShzb3VyY2UpO1xuICAgICAgICBpZiAoIXR5cGUpIHtcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBgTm90IGEgWUFNTCB0b2tlbjogJHtzb3VyY2V9YDtcbiAgICAgICAgICAgIHlpZWxkKiB0aGlzLnBvcCh7IHR5cGU6ICdlcnJvcicsIG9mZnNldDogdGhpcy5vZmZzZXQsIG1lc3NhZ2UsIHNvdXJjZSB9KTtcbiAgICAgICAgICAgIHRoaXMub2Zmc2V0ICs9IHNvdXJjZS5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZSA9PT0gJ3NjYWxhcicpIHtcbiAgICAgICAgICAgIHRoaXMuYXROZXdMaW5lID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmF0U2NhbGFyID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMudHlwZSA9ICdzY2FsYXInO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICAgICAgICAgIHlpZWxkKiB0aGlzLnN0ZXAoKTtcbiAgICAgICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmF0TmV3TGluZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5kZW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMub25OZXdMaW5lKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbk5ld0xpbmUodGhpcy5vZmZzZXQgKyBzb3VyY2UubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5hdE5ld0xpbmUgJiYgc291cmNlWzBdID09PSAnICcpXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluZGVudCArPSBzb3VyY2UubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdleHBsaWNpdC1rZXktaW5kJzpcbiAgICAgICAgICAgICAgICBjYXNlICdtYXAtdmFsdWUtaW5kJzpcbiAgICAgICAgICAgICAgICBjYXNlICdzZXEtaXRlbS1pbmQnOlxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5hdE5ld0xpbmUpXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluZGVudCArPSBzb3VyY2UubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdkb2MtbW9kZSc6XG4gICAgICAgICAgICAgICAgY2FzZSAnZmxvdy1lcnJvci1lbmQnOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hdE5ld0xpbmUgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMub2Zmc2V0ICs9IHNvdXJjZS5sZW5ndGg7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqIENhbGwgYXQgZW5kIG9mIGlucHV0IHRvIHB1c2ggb3V0IGFueSByZW1haW5pbmcgY29uc3RydWN0aW9ucyAqL1xuICAgICplbmQoKSB7XG4gICAgICAgIHdoaWxlICh0aGlzLnN0YWNrLmxlbmd0aCA+IDApXG4gICAgICAgICAgICB5aWVsZCogdGhpcy5wb3AoKTtcbiAgICB9XG4gICAgZ2V0IHNvdXJjZVRva2VuKCkge1xuICAgICAgICBjb25zdCBzdCA9IHtcbiAgICAgICAgICAgIHR5cGU6IHRoaXMudHlwZSxcbiAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICBpbmRlbnQ6IHRoaXMuaW5kZW50LFxuICAgICAgICAgICAgc291cmNlOiB0aGlzLnNvdXJjZVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gc3Q7XG4gICAgfVxuICAgICpzdGVwKCkge1xuICAgICAgICBjb25zdCB0b3AgPSB0aGlzLnBlZWsoMSk7XG4gICAgICAgIGlmICh0aGlzLnR5cGUgPT09ICdkb2MtZW5kJyAmJiB0b3A/LnR5cGUgIT09ICdkb2MtZW5kJykge1xuICAgICAgICAgICAgd2hpbGUgKHRoaXMuc3RhY2subGVuZ3RoID4gMClcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wb3AoKTtcbiAgICAgICAgICAgIHRoaXMuc3RhY2sucHVzaCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2RvYy1lbmQnLFxuICAgICAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICAgICAgc291cmNlOiB0aGlzLnNvdXJjZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0b3ApXG4gICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMuc3RyZWFtKCk7XG4gICAgICAgIHN3aXRjaCAodG9wLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2RvY3VtZW50JzpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMuZG9jdW1lbnQodG9wKTtcbiAgICAgICAgICAgIGNhc2UgJ2FsaWFzJzpcbiAgICAgICAgICAgIGNhc2UgJ3NjYWxhcic6XG4gICAgICAgICAgICBjYXNlICdzaW5nbGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgICAgICBjYXNlICdkb3VibGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnNjYWxhcih0b3ApO1xuICAgICAgICAgICAgY2FzZSAnYmxvY2stc2NhbGFyJzpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMuYmxvY2tTY2FsYXIodG9wKTtcbiAgICAgICAgICAgIGNhc2UgJ2Jsb2NrLW1hcCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLmJsb2NrTWFwKHRvcCk7XG4gICAgICAgICAgICBjYXNlICdibG9jay1zZXEnOlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5ibG9ja1NlcXVlbmNlKHRvcCk7XG4gICAgICAgICAgICBjYXNlICdmbG93LWNvbGxlY3Rpb24nOlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5mbG93Q29sbGVjdGlvbih0b3ApO1xuICAgICAgICAgICAgY2FzZSAnZG9jLWVuZCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLmRvY3VtZW50RW5kKHRvcCk7XG4gICAgICAgIH1cbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgc2hvdWxkIG5vdCBoYXBwZW4gKi9cbiAgICAgICAgeWllbGQqIHRoaXMucG9wKCk7XG4gICAgfVxuICAgIHBlZWsobikge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGFja1t0aGlzLnN0YWNrLmxlbmd0aCAtIG5dO1xuICAgIH1cbiAgICAqcG9wKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IHRva2VuID0gZXJyb3IgPz8gdGhpcy5zdGFjay5wb3AoKTtcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmIHNob3VsZCBub3QgaGFwcGVuICovXG4gICAgICAgIGlmICghdG9rZW4pIHtcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSAnVHJpZWQgdG8gcG9wIGFuIGVtcHR5IHN0YWNrJztcbiAgICAgICAgICAgIHlpZWxkIHsgdHlwZTogJ2Vycm9yJywgb2Zmc2V0OiB0aGlzLm9mZnNldCwgc291cmNlOiAnJywgbWVzc2FnZSB9O1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMuc3RhY2subGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB5aWVsZCB0b2tlbjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHRvcCA9IHRoaXMucGVlaygxKTtcbiAgICAgICAgICAgIGlmICh0b2tlbi50eXBlID09PSAnYmxvY2stc2NhbGFyJykge1xuICAgICAgICAgICAgICAgIC8vIEJsb2NrIHNjYWxhcnMgdXNlIHRoZWlyIHBhcmVudCByYXRoZXIgdGhhbiBoZWFkZXIgaW5kZW50XG4gICAgICAgICAgICAgICAgdG9rZW4uaW5kZW50ID0gJ2luZGVudCcgaW4gdG9wID8gdG9wLmluZGVudCA6IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh0b2tlbi50eXBlID09PSAnZmxvdy1jb2xsZWN0aW9uJyAmJiB0b3AudHlwZSA9PT0gJ2RvY3VtZW50Jykge1xuICAgICAgICAgICAgICAgIC8vIElnbm9yZSBhbGwgaW5kZW50IGZvciB0b3AtbGV2ZWwgZmxvdyBjb2xsZWN0aW9uc1xuICAgICAgICAgICAgICAgIHRva2VuLmluZGVudCA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodG9rZW4udHlwZSA9PT0gJ2Zsb3ctY29sbGVjdGlvbicpXG4gICAgICAgICAgICAgICAgZml4Rmxvd1NlcUl0ZW1zKHRva2VuKTtcbiAgICAgICAgICAgIHN3aXRjaCAodG9wLnR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdkb2N1bWVudCc6XG4gICAgICAgICAgICAgICAgICAgIHRvcC52YWx1ZSA9IHRva2VuO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdibG9jay1zY2FsYXInOlxuICAgICAgICAgICAgICAgICAgICB0b3AucHJvcHMucHVzaCh0b2tlbik7IC8vIGVycm9yXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2Jsb2NrLW1hcCc6IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaXQgPSB0b3AuaXRlbXNbdG9wLml0ZW1zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcC5pdGVtcy5wdXNoKHsgc3RhcnQ6IFtdLCBrZXk6IHRva2VuLCBzZXA6IFtdIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbktleUxpbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGl0LnNlcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXQudmFsdWUgPSB0b2tlbjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oaXQsIHsga2V5OiB0b2tlbiwgc2VwOiBbXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25LZXlMaW5lID0gIWl0LmV4cGxpY2l0S2V5O1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXNlICdibG9jay1zZXEnOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGl0ID0gdG9wLml0ZW1zW3RvcC5pdGVtcy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0LnZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgdG9wLml0ZW1zLnB1c2goeyBzdGFydDogW10sIHZhbHVlOiB0b2tlbiB9KTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgaXQudmFsdWUgPSB0b2tlbjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgJ2Zsb3ctY29sbGVjdGlvbic6IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaXQgPSB0b3AuaXRlbXNbdG9wLml0ZW1zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWl0IHx8IGl0LnZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgdG9wLml0ZW1zLnB1c2goeyBzdGFydDogW10sIGtleTogdG9rZW4sIHNlcDogW10gfSk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGl0LnNlcClcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0LnZhbHVlID0gdG9rZW47XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oaXQsIHsga2V5OiB0b2tlbiwgc2VwOiBbXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCBzaG91bGQgbm90IGhhcHBlbiAqL1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wb3AodG9rZW4pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCh0b3AudHlwZSA9PT0gJ2RvY3VtZW50JyB8fFxuICAgICAgICAgICAgICAgIHRvcC50eXBlID09PSAnYmxvY2stbWFwJyB8fFxuICAgICAgICAgICAgICAgIHRvcC50eXBlID09PSAnYmxvY2stc2VxJykgJiZcbiAgICAgICAgICAgICAgICAodG9rZW4udHlwZSA9PT0gJ2Jsb2NrLW1hcCcgfHwgdG9rZW4udHlwZSA9PT0gJ2Jsb2NrLXNlcScpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbGFzdCA9IHRva2VuLml0ZW1zW3Rva2VuLml0ZW1zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgIGlmIChsYXN0ICYmXG4gICAgICAgICAgICAgICAgICAgICFsYXN0LnNlcCAmJlxuICAgICAgICAgICAgICAgICAgICAhbGFzdC52YWx1ZSAmJlxuICAgICAgICAgICAgICAgICAgICBsYXN0LnN0YXJ0Lmxlbmd0aCA+IDAgJiZcbiAgICAgICAgICAgICAgICAgICAgZmluZE5vbkVtcHR5SW5kZXgobGFzdC5zdGFydCkgPT09IC0xICYmXG4gICAgICAgICAgICAgICAgICAgICh0b2tlbi5pbmRlbnQgPT09IDAgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3Quc3RhcnQuZXZlcnkoc3QgPT4gc3QudHlwZSAhPT0gJ2NvbW1lbnQnIHx8IHN0LmluZGVudCA8IHRva2VuLmluZGVudCkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0b3AudHlwZSA9PT0gJ2RvY3VtZW50JylcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcC5lbmQgPSBsYXN0LnN0YXJ0O1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3AuaXRlbXMucHVzaCh7IHN0YXJ0OiBsYXN0LnN0YXJ0IH0pO1xuICAgICAgICAgICAgICAgICAgICB0b2tlbi5pdGVtcy5zcGxpY2UoLTEsIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAqc3RyZWFtKCkge1xuICAgICAgICBzd2l0Y2ggKHRoaXMudHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnZGlyZWN0aXZlLWxpbmUnOlxuICAgICAgICAgICAgICAgIHlpZWxkIHsgdHlwZTogJ2RpcmVjdGl2ZScsIG9mZnNldDogdGhpcy5vZmZzZXQsIHNvdXJjZTogdGhpcy5zb3VyY2UgfTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBjYXNlICdieXRlLW9yZGVyLW1hcmsnOlxuICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICB5aWVsZCB0aGlzLnNvdXJjZVRva2VuO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIGNhc2UgJ2RvYy1tb2RlJzpcbiAgICAgICAgICAgIGNhc2UgJ2RvYy1zdGFydCc6IHtcbiAgICAgICAgICAgICAgICBjb25zdCBkb2MgPSB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdkb2N1bWVudCcsXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0OiBbXVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudHlwZSA9PT0gJ2RvYy1zdGFydCcpXG4gICAgICAgICAgICAgICAgICAgIGRvYy5zdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhY2sucHVzaChkb2MpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB5aWVsZCB7XG4gICAgICAgICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGBVbmV4cGVjdGVkICR7dGhpcy50eXBlfSB0b2tlbiBpbiBZQU1MIHN0cmVhbWAsXG4gICAgICAgICAgICBzb3VyY2U6IHRoaXMuc291cmNlXG4gICAgICAgIH07XG4gICAgfVxuICAgICpkb2N1bWVudChkb2MpIHtcbiAgICAgICAgaWYgKGRvYy52YWx1ZSlcbiAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5saW5lRW5kKGRvYyk7XG4gICAgICAgIHN3aXRjaCAodGhpcy50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdkb2Mtc3RhcnQnOiB7XG4gICAgICAgICAgICAgICAgaWYgKGZpbmROb25FbXB0eUluZGV4KGRvYy5zdGFydCkgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5zdGVwKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgZG9jLnN0YXJ0LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSAnYW5jaG9yJzpcbiAgICAgICAgICAgIGNhc2UgJ3RhZyc6XG4gICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgIGRvYy5zdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBidiA9IHRoaXMuc3RhcnRCbG9ja1ZhbHVlKGRvYyk7XG4gICAgICAgIGlmIChidilcbiAgICAgICAgICAgIHRoaXMuc3RhY2sucHVzaChidik7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgeWllbGQge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdlcnJvcicsXG4gICAgICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBgVW5leHBlY3RlZCAke3RoaXMudHlwZX0gdG9rZW4gaW4gWUFNTCBkb2N1bWVudGAsXG4gICAgICAgICAgICAgICAgc291cmNlOiB0aGlzLnNvdXJjZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAqc2NhbGFyKHNjYWxhcikge1xuICAgICAgICBpZiAodGhpcy50eXBlID09PSAnbWFwLXZhbHVlLWluZCcpIHtcbiAgICAgICAgICAgIGNvbnN0IHByZXYgPSBnZXRQcmV2UHJvcHModGhpcy5wZWVrKDIpKTtcbiAgICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gZ2V0Rmlyc3RLZXlTdGFydFByb3BzKHByZXYpO1xuICAgICAgICAgICAgbGV0IHNlcDtcbiAgICAgICAgICAgIGlmIChzY2FsYXIuZW5kKSB7XG4gICAgICAgICAgICAgICAgc2VwID0gc2NhbGFyLmVuZDtcbiAgICAgICAgICAgICAgICBzZXAucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgc2NhbGFyLmVuZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBzZXAgPSBbdGhpcy5zb3VyY2VUb2tlbl07XG4gICAgICAgICAgICBjb25zdCBtYXAgPSB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2Jsb2NrLW1hcCcsXG4gICAgICAgICAgICAgICAgb2Zmc2V0OiBzY2FsYXIub2Zmc2V0LFxuICAgICAgICAgICAgICAgIGluZGVudDogc2NhbGFyLmluZGVudCxcbiAgICAgICAgICAgICAgICBpdGVtczogW3sgc3RhcnQsIGtleTogc2NhbGFyLCBzZXAgfV1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLm9uS2V5TGluZSA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLnN0YWNrW3RoaXMuc3RhY2subGVuZ3RoIC0gMV0gPSBtYXA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgeWllbGQqIHRoaXMubGluZUVuZChzY2FsYXIpO1xuICAgIH1cbiAgICAqYmxvY2tTY2FsYXIoc2NhbGFyKSB7XG4gICAgICAgIHN3aXRjaCAodGhpcy50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgIHNjYWxhci5wcm9wcy5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIGNhc2UgJ3NjYWxhcic6XG4gICAgICAgICAgICAgICAgc2NhbGFyLnNvdXJjZSA9IHRoaXMuc291cmNlO1xuICAgICAgICAgICAgICAgIC8vIGJsb2NrLXNjYWxhciBzb3VyY2UgaW5jbHVkZXMgdHJhaWxpbmcgbmV3bGluZVxuICAgICAgICAgICAgICAgIHRoaXMuYXROZXdMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmluZGVudCA9IDA7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub25OZXdMaW5lKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBubCA9IHRoaXMuc291cmNlLmluZGV4T2YoJ1xcbicpICsgMTtcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKG5sICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uTmV3TGluZSh0aGlzLm9mZnNldCArIG5sKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5sID0gdGhpcy5zb3VyY2UuaW5kZXhPZignXFxuJywgbmwpICsgMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wb3AoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0IHNob3VsZCBub3QgaGFwcGVuICovXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnBvcCgpO1xuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnN0ZXAoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAqYmxvY2tNYXAobWFwKSB7XG4gICAgICAgIGNvbnN0IGl0ID0gbWFwLml0ZW1zW21hcC5pdGVtcy5sZW5ndGggLSAxXTtcbiAgICAgICAgLy8gaXQuc2VwIGlzIHRydWUtaXNoIGlmIHBhaXIgYWxyZWFkeSBoYXMga2V5IG9yIDogc2VwYXJhdG9yXG4gICAgICAgIHN3aXRjaCAodGhpcy50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICB0aGlzLm9uS2V5TGluZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmIChpdC52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlbmQgPSAnZW5kJyBpbiBpdC52YWx1ZSA/IGl0LnZhbHVlLmVuZCA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbGFzdCA9IEFycmF5LmlzQXJyYXkoZW5kKSA/IGVuZFtlbmQubGVuZ3RoIC0gMV0gOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsYXN0Py50eXBlID09PSAnY29tbWVudCcpXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmQ/LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5pdGVtcy5wdXNoKHsgc3RhcnQ6IFt0aGlzLnNvdXJjZVRva2VuXSB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaXQuc2VwKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0LnNlcC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaXQuc3RhcnQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgICAgICAgICAgaWYgKGl0LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIG1hcC5pdGVtcy5wdXNoKHsgc3RhcnQ6IFt0aGlzLnNvdXJjZVRva2VuXSB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaXQuc2VwKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0LnNlcC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuYXRJbmRlbnRlZENvbW1lbnQoaXQuc3RhcnQsIG1hcC5pbmRlbnQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwcmV2ID0gbWFwLml0ZW1zW21hcC5pdGVtcy5sZW5ndGggLSAyXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVuZCA9IHByZXY/LnZhbHVlPy5lbmQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShlbmQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkoZW5kLCBpdC5zdGFydCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5kLnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwLml0ZW1zLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpdC5zdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuaW5kZW50ID49IG1hcC5pbmRlbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IGF0TWFwSW5kZW50ID0gIXRoaXMub25LZXlMaW5lICYmIHRoaXMuaW5kZW50ID09PSBtYXAuaW5kZW50O1xuICAgICAgICAgICAgY29uc3QgYXROZXh0SXRlbSA9IGF0TWFwSW5kZW50ICYmXG4gICAgICAgICAgICAgICAgKGl0LnNlcCB8fCBpdC5leHBsaWNpdEtleSkgJiZcbiAgICAgICAgICAgICAgICB0aGlzLnR5cGUgIT09ICdzZXEtaXRlbS1pbmQnO1xuICAgICAgICAgICAgLy8gRm9yIGVtcHR5IG5vZGVzLCBhc3NpZ24gbmV3bGluZS1zZXBhcmF0ZWQgbm90IGluZGVudGVkIGVtcHR5IHRva2VucyB0byBmb2xsb3dpbmcgbm9kZVxuICAgICAgICAgICAgbGV0IHN0YXJ0ID0gW107XG4gICAgICAgICAgICBpZiAoYXROZXh0SXRlbSAmJiBpdC5zZXAgJiYgIWl0LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmwgPSBbXTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0LnNlcC5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdCA9IGl0LnNlcFtpXTtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChzdC50eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBubC5wdXNoKGkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0LmluZGVudCA+IG1hcC5pbmRlbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5sLmxlbmd0aCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5sLmxlbmd0aCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5sLmxlbmd0aCA+PSAyKVxuICAgICAgICAgICAgICAgICAgICBzdGFydCA9IGl0LnNlcC5zcGxpY2UobmxbMV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3dpdGNoICh0aGlzLnR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdhbmNob3InOlxuICAgICAgICAgICAgICAgIGNhc2UgJ3RhZyc6XG4gICAgICAgICAgICAgICAgICAgIGlmIChhdE5leHRJdGVtIHx8IGl0LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFwLml0ZW1zLnB1c2goeyBzdGFydCB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25LZXlMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpdC5zZXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0LnNlcC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXQuc3RhcnQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgY2FzZSAnZXhwbGljaXQta2V5LWluZCc6XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXQuc2VwICYmICFpdC5leHBsaWNpdEtleSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXQuc3RhcnQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0LmV4cGxpY2l0S2V5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChhdE5leHRJdGVtIHx8IGl0LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFwLml0ZW1zLnB1c2goeyBzdGFydCwgZXhwbGljaXRLZXk6IHRydWUgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YWNrLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdibG9jay1tYXAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZW50OiB0aGlzLmluZGVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogW3sgc3RhcnQ6IFt0aGlzLnNvdXJjZVRva2VuXSwgZXhwbGljaXRLZXk6IHRydWUgfV1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25LZXlMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGNhc2UgJ21hcC12YWx1ZS1pbmQnOlxuICAgICAgICAgICAgICAgICAgICBpZiAoaXQuZXhwbGljaXRLZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXQuc2VwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluY2x1ZGVzVG9rZW4oaXQuc3RhcnQsICduZXdsaW5lJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihpdCwgeyBrZXk6IG51bGwsIHNlcDogW3RoaXMuc291cmNlVG9rZW5dIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RhcnQgPSBnZXRGaXJzdEtleVN0YXJ0UHJvcHMoaXQuc3RhcnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YWNrLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Jsb2NrLW1hcCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZW50OiB0aGlzLmluZGVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbeyBzdGFydCwga2V5OiBudWxsLCBzZXA6IFt0aGlzLnNvdXJjZVRva2VuXSB9XVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpdC52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5pdGVtcy5wdXNoKHsgc3RhcnQ6IFtdLCBrZXk6IG51bGwsIHNlcDogW3RoaXMuc291cmNlVG9rZW5dIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaW5jbHVkZXNUb2tlbihpdC5zZXAsICdtYXAtdmFsdWUtaW5kJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YWNrLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYmxvY2stbWFwJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZW50OiB0aGlzLmluZGVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFt7IHN0YXJ0LCBrZXk6IG51bGwsIHNlcDogW3RoaXMuc291cmNlVG9rZW5dIH1dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpc0Zsb3dUb2tlbihpdC5rZXkpICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIWluY2x1ZGVzVG9rZW4oaXQuc2VwLCAnbmV3bGluZScpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RhcnQgPSBnZXRGaXJzdEtleVN0YXJ0UHJvcHMoaXQuc3RhcnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGtleSA9IGl0LmtleTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzZXAgPSBpdC5zZXA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VwLnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0eXBlIGd1YXJkIGlzIHdyb25nIGhlcmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgaXQua2V5O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHlwZSBndWFyZCBpcyB3cm9uZyBoZXJlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGl0LnNlcDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YWNrLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYmxvY2stbWFwJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZW50OiB0aGlzLmluZGVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFt7IHN0YXJ0LCBrZXksIHNlcCB9XVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoc3RhcnQubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5vdCBhY3R1YWxseSBhdCBuZXh0IGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdC5zZXAgPSBpdC5zZXAuY29uY2F0KHN0YXJ0LCB0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0LnNlcC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpdC5zZXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKGl0LCB7IGtleTogbnVsbCwgc2VwOiBbdGhpcy5zb3VyY2VUb2tlbl0gfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpdC52YWx1ZSB8fCBhdE5leHRJdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwLml0ZW1zLnB1c2goeyBzdGFydCwga2V5OiBudWxsLCBzZXA6IFt0aGlzLnNvdXJjZVRva2VuXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGluY2x1ZGVzVG9rZW4oaXQuc2VwLCAnbWFwLXZhbHVlLWluZCcpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGFjay5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Jsb2NrLW1hcCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZGVudDogdGhpcy5pbmRlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbeyBzdGFydDogW10sIGtleTogbnVsbCwgc2VwOiBbdGhpcy5zb3VyY2VUb2tlbl0gfV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0LnNlcC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25LZXlMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2FsaWFzJzpcbiAgICAgICAgICAgICAgICBjYXNlICdzY2FsYXInOlxuICAgICAgICAgICAgICAgIGNhc2UgJ3NpbmdsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgICAgICAgICBjYXNlICdkb3VibGUtcXVvdGVkLXNjYWxhcic6IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZnMgPSB0aGlzLmZsb3dTY2FsYXIodGhpcy50eXBlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGF0TmV4dEl0ZW0gfHwgaXQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5pdGVtcy5wdXNoKHsgc3RhcnQsIGtleTogZnMsIHNlcDogW10gfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uS2V5TGluZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaXQuc2VwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YWNrLnB1c2goZnMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihpdCwgeyBrZXk6IGZzLCBzZXA6IFtdIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbktleUxpbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBidiA9IHRoaXMuc3RhcnRCbG9ja1ZhbHVlKG1hcCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChidikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJ2LnR5cGUgPT09ICdibG9jay1zZXEnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpdC5leHBsaWNpdEtleSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdC5zZXAgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIWluY2x1ZGVzVG9rZW4oaXQuc2VwLCAnbmV3bGluZScpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnBvcCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdVbmV4cGVjdGVkIGJsb2NrLXNlcS1pbmQgb24gc2FtZSBsaW5lIHdpdGgga2V5JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogdGhpcy5zb3VyY2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChhdE1hcEluZGVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5pdGVtcy5wdXNoKHsgc3RhcnQgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YWNrLnB1c2goYnYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHlpZWxkKiB0aGlzLnBvcCgpO1xuICAgICAgICB5aWVsZCogdGhpcy5zdGVwKCk7XG4gICAgfVxuICAgICpibG9ja1NlcXVlbmNlKHNlcSkge1xuICAgICAgICBjb25zdCBpdCA9IHNlcS5pdGVtc1tzZXEuaXRlbXMubGVuZ3RoIC0gMV07XG4gICAgICAgIHN3aXRjaCAodGhpcy50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICBpZiAoaXQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZW5kID0gJ2VuZCcgaW4gaXQudmFsdWUgPyBpdC52YWx1ZS5lbmQgOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGxhc3QgPSBBcnJheS5pc0FycmF5KGVuZCkgPyBlbmRbZW5kLmxlbmd0aCAtIDFdIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICBpZiAobGFzdD8udHlwZSA9PT0gJ2NvbW1lbnQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kPy5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXEuaXRlbXMucHVzaCh7IHN0YXJ0OiBbdGhpcy5zb3VyY2VUb2tlbl0gfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgaXQuc3RhcnQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgICAgICAgICBpZiAoaXQudmFsdWUpXG4gICAgICAgICAgICAgICAgICAgIHNlcS5pdGVtcy5wdXNoKHsgc3RhcnQ6IFt0aGlzLnNvdXJjZVRva2VuXSB9KTtcbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuYXRJbmRlbnRlZENvbW1lbnQoaXQuc3RhcnQsIHNlcS5pbmRlbnQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwcmV2ID0gc2VxLml0ZW1zW3NlcS5pdGVtcy5sZW5ndGggLSAyXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVuZCA9IHByZXY/LnZhbHVlPy5lbmQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShlbmQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkoZW5kLCBpdC5zdGFydCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5kLnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VxLml0ZW1zLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpdC5zdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBjYXNlICdhbmNob3InOlxuICAgICAgICAgICAgY2FzZSAndGFnJzpcbiAgICAgICAgICAgICAgICBpZiAoaXQudmFsdWUgfHwgdGhpcy5pbmRlbnQgPD0gc2VxLmluZGVudClcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgaXQuc3RhcnQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBjYXNlICdzZXEtaXRlbS1pbmQnOlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmluZGVudCAhPT0gc2VxLmluZGVudClcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgaWYgKGl0LnZhbHVlIHx8IGluY2x1ZGVzVG9rZW4oaXQuc3RhcnQsICdzZXEtaXRlbS1pbmQnKSlcbiAgICAgICAgICAgICAgICAgICAgc2VxLml0ZW1zLnB1c2goeyBzdGFydDogW3RoaXMuc291cmNlVG9rZW5dIH0pO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgaXQuc3RhcnQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuaW5kZW50ID4gc2VxLmluZGVudCkge1xuICAgICAgICAgICAgY29uc3QgYnYgPSB0aGlzLnN0YXJ0QmxvY2tWYWx1ZShzZXEpO1xuICAgICAgICAgICAgaWYgKGJ2KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGFjay5wdXNoKGJ2KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgeWllbGQqIHRoaXMucG9wKCk7XG4gICAgICAgIHlpZWxkKiB0aGlzLnN0ZXAoKTtcbiAgICB9XG4gICAgKmZsb3dDb2xsZWN0aW9uKGZjKSB7XG4gICAgICAgIGNvbnN0IGl0ID0gZmMuaXRlbXNbZmMuaXRlbXMubGVuZ3RoIC0gMV07XG4gICAgICAgIGlmICh0aGlzLnR5cGUgPT09ICdmbG93LWVycm9yLWVuZCcpIHtcbiAgICAgICAgICAgIGxldCB0b3A7XG4gICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucG9wKCk7XG4gICAgICAgICAgICAgICAgdG9wID0gdGhpcy5wZWVrKDEpO1xuICAgICAgICAgICAgfSB3aGlsZSAodG9wPy50eXBlID09PSAnZmxvdy1jb2xsZWN0aW9uJyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZmMuZW5kLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgc3dpdGNoICh0aGlzLnR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdjb21tYSc6XG4gICAgICAgICAgICAgICAgY2FzZSAnZXhwbGljaXQta2V5LWluZCc6XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXQgfHwgaXQuc2VwKVxuICAgICAgICAgICAgICAgICAgICAgICAgZmMuaXRlbXMucHVzaCh7IHN0YXJ0OiBbdGhpcy5zb3VyY2VUb2tlbl0gfSk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0LnN0YXJ0LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICBjYXNlICdtYXAtdmFsdWUtaW5kJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpdCB8fCBpdC52YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGZjLml0ZW1zLnB1c2goeyBzdGFydDogW10sIGtleTogbnVsbCwgc2VwOiBbdGhpcy5zb3VyY2VUb2tlbl0gfSk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGl0LnNlcClcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0LnNlcC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKGl0LCB7IGtleTogbnVsbCwgc2VwOiBbdGhpcy5zb3VyY2VUb2tlbl0gfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgICAgICAgICAgY2FzZSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgICAgY2FzZSAnYW5jaG9yJzpcbiAgICAgICAgICAgICAgICBjYXNlICd0YWcnOlxuICAgICAgICAgICAgICAgICAgICBpZiAoIWl0IHx8IGl0LnZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgZmMuaXRlbXMucHVzaCh7IHN0YXJ0OiBbdGhpcy5zb3VyY2VUb2tlbl0gfSk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGl0LnNlcClcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0LnNlcC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBpdC5zdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgY2FzZSAnYWxpYXMnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ3NjYWxhcic6XG4gICAgICAgICAgICAgICAgY2FzZSAnc2luZ2xlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICAgICAgICAgIGNhc2UgJ2RvdWJsZS1xdW90ZWQtc2NhbGFyJzoge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmcyA9IHRoaXMuZmxvd1NjYWxhcih0aGlzLnR5cGUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWl0IHx8IGl0LnZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgZmMuaXRlbXMucHVzaCh7IHN0YXJ0OiBbXSwga2V5OiBmcywgc2VwOiBbXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaXQuc2VwKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGFjay5wdXNoKGZzKTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihpdCwgeyBrZXk6IGZzLCBzZXA6IFtdIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgJ2Zsb3ctbWFwLWVuZCc6XG4gICAgICAgICAgICAgICAgY2FzZSAnZmxvdy1zZXEtZW5kJzpcbiAgICAgICAgICAgICAgICAgICAgZmMuZW5kLnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGJ2ID0gdGhpcy5zdGFydEJsb2NrVmFsdWUoZmMpO1xuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2Ugc2hvdWxkIG5vdCBoYXBwZW4gKi9cbiAgICAgICAgICAgIGlmIChidilcbiAgICAgICAgICAgICAgICB0aGlzLnN0YWNrLnB1c2goYnYpO1xuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucG9wKCk7XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMuc3RlcCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgcGFyZW50ID0gdGhpcy5wZWVrKDIpO1xuICAgICAgICAgICAgaWYgKHBhcmVudC50eXBlID09PSAnYmxvY2stbWFwJyAmJlxuICAgICAgICAgICAgICAgICgodGhpcy50eXBlID09PSAnbWFwLXZhbHVlLWluZCcgJiYgcGFyZW50LmluZGVudCA9PT0gZmMuaW5kZW50KSB8fFxuICAgICAgICAgICAgICAgICAgICAodGhpcy50eXBlID09PSAnbmV3bGluZScgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICFwYXJlbnQuaXRlbXNbcGFyZW50Lml0ZW1zLmxlbmd0aCAtIDFdLnNlcCkpKSB7XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucG9wKCk7XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMuc3RlcCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy50eXBlID09PSAnbWFwLXZhbHVlLWluZCcgJiZcbiAgICAgICAgICAgICAgICBwYXJlbnQudHlwZSAhPT0gJ2Zsb3ctY29sbGVjdGlvbicpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwcmV2ID0gZ2V0UHJldlByb3BzKHBhcmVudCk7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhcnQgPSBnZXRGaXJzdEtleVN0YXJ0UHJvcHMocHJldik7XG4gICAgICAgICAgICAgICAgZml4Rmxvd1NlcUl0ZW1zKGZjKTtcbiAgICAgICAgICAgICAgICBjb25zdCBzZXAgPSBmYy5lbmQuc3BsaWNlKDEsIGZjLmVuZC5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIHNlcC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1hcCA9IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Jsb2NrLW1hcCcsXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldDogZmMub2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICBpbmRlbnQ6IGZjLmluZGVudCxcbiAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFt7IHN0YXJ0LCBrZXk6IGZjLCBzZXAgfV1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMub25LZXlMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YWNrW3RoaXMuc3RhY2subGVuZ3RoIC0gMV0gPSBtYXA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5saW5lRW5kKGZjKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBmbG93U2NhbGFyKHR5cGUpIHtcbiAgICAgICAgaWYgKHRoaXMub25OZXdMaW5lKSB7XG4gICAgICAgICAgICBsZXQgbmwgPSB0aGlzLnNvdXJjZS5pbmRleE9mKCdcXG4nKSArIDE7XG4gICAgICAgICAgICB3aGlsZSAobmwgIT09IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uTmV3TGluZSh0aGlzLm9mZnNldCArIG5sKTtcbiAgICAgICAgICAgICAgICBubCA9IHRoaXMuc291cmNlLmluZGV4T2YoJ1xcbicsIG5sKSArIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgaW5kZW50OiB0aGlzLmluZGVudCxcbiAgICAgICAgICAgIHNvdXJjZTogdGhpcy5zb3VyY2VcbiAgICAgICAgfTtcbiAgICB9XG4gICAgc3RhcnRCbG9ja1ZhbHVlKHBhcmVudCkge1xuICAgICAgICBzd2l0Y2ggKHRoaXMudHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnYWxpYXMnOlxuICAgICAgICAgICAgY2FzZSAnc2NhbGFyJzpcbiAgICAgICAgICAgIGNhc2UgJ3NpbmdsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgICAgIGNhc2UgJ2RvdWJsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5mbG93U2NhbGFyKHRoaXMudHlwZSk7XG4gICAgICAgICAgICBjYXNlICdibG9jay1zY2FsYXItaGVhZGVyJzpcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYmxvY2stc2NhbGFyJyxcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgaW5kZW50OiB0aGlzLmluZGVudCxcbiAgICAgICAgICAgICAgICAgICAgcHJvcHM6IFt0aGlzLnNvdXJjZVRva2VuXSxcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiAnJ1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjYXNlICdmbG93LW1hcC1zdGFydCc6XG4gICAgICAgICAgICBjYXNlICdmbG93LXNlcS1zdGFydCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Zsb3ctY29sbGVjdGlvbicsXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgIGluZGVudDogdGhpcy5pbmRlbnQsXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0OiB0aGlzLnNvdXJjZVRva2VuLFxuICAgICAgICAgICAgICAgICAgICBpdGVtczogW10sXG4gICAgICAgICAgICAgICAgICAgIGVuZDogW11cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgY2FzZSAnc2VxLWl0ZW0taW5kJzpcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYmxvY2stc2VxJyxcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgaW5kZW50OiB0aGlzLmluZGVudCxcbiAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFt7IHN0YXJ0OiBbdGhpcy5zb3VyY2VUb2tlbl0gfV1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgY2FzZSAnZXhwbGljaXQta2V5LWluZCc6IHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uS2V5TGluZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJldiA9IGdldFByZXZQcm9wcyhwYXJlbnQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gZ2V0Rmlyc3RLZXlTdGFydFByb3BzKHByZXYpO1xuICAgICAgICAgICAgICAgIHN0YXJ0LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Jsb2NrLW1hcCcsXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgIGluZGVudDogdGhpcy5pbmRlbnQsXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbeyBzdGFydCwgZXhwbGljaXRLZXk6IHRydWUgfV1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSAnbWFwLXZhbHVlLWluZCc6IHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uS2V5TGluZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJldiA9IGdldFByZXZQcm9wcyhwYXJlbnQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gZ2V0Rmlyc3RLZXlTdGFydFByb3BzKHByZXYpO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdibG9jay1tYXAnLFxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICBpbmRlbnQ6IHRoaXMuaW5kZW50LFxuICAgICAgICAgICAgICAgICAgICBpdGVtczogW3sgc3RhcnQsIGtleTogbnVsbCwgc2VwOiBbdGhpcy5zb3VyY2VUb2tlbl0gfV1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBhdEluZGVudGVkQ29tbWVudChzdGFydCwgaW5kZW50KSB7XG4gICAgICAgIGlmICh0aGlzLnR5cGUgIT09ICdjb21tZW50JylcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYgKHRoaXMuaW5kZW50IDw9IGluZGVudClcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHN0YXJ0LmV2ZXJ5KHN0ID0+IHN0LnR5cGUgPT09ICduZXdsaW5lJyB8fCBzdC50eXBlID09PSAnc3BhY2UnKTtcbiAgICB9XG4gICAgKmRvY3VtZW50RW5kKGRvY0VuZCkge1xuICAgICAgICBpZiAodGhpcy50eXBlICE9PSAnZG9jLW1vZGUnKSB7XG4gICAgICAgICAgICBpZiAoZG9jRW5kLmVuZClcbiAgICAgICAgICAgICAgICBkb2NFbmQuZW5kLnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgZG9jRW5kLmVuZCA9IFt0aGlzLnNvdXJjZVRva2VuXTtcbiAgICAgICAgICAgIGlmICh0aGlzLnR5cGUgPT09ICduZXdsaW5lJylcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wb3AoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAqbGluZUVuZCh0b2tlbikge1xuICAgICAgICBzd2l0Y2ggKHRoaXMudHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnY29tbWEnOlxuICAgICAgICAgICAgY2FzZSAnZG9jLXN0YXJ0JzpcbiAgICAgICAgICAgIGNhc2UgJ2RvYy1lbmQnOlxuICAgICAgICAgICAgY2FzZSAnZmxvdy1zZXEtZW5kJzpcbiAgICAgICAgICAgIGNhc2UgJ2Zsb3ctbWFwLWVuZCc6XG4gICAgICAgICAgICBjYXNlICdtYXAtdmFsdWUtaW5kJzpcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wb3AoKTtcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5zdGVwKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICB0aGlzLm9uS2V5TGluZSA9IGZhbHNlO1xuICAgICAgICAgICAgLy8gZmFsbHRocm91Z2hcbiAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcbiAgICAgICAgICAgIGNhc2UgJ2NvbW1lbnQnOlxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAvLyBhbGwgb3RoZXIgdmFsdWVzIGFyZSBlcnJvcnNcbiAgICAgICAgICAgICAgICBpZiAodG9rZW4uZW5kKVxuICAgICAgICAgICAgICAgICAgICB0b2tlbi5lbmQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHRva2VuLmVuZCA9IFt0aGlzLnNvdXJjZVRva2VuXTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy50eXBlID09PSAnbmV3bGluZScpXG4gICAgICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnBvcCgpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnRzLlBhcnNlciA9IFBhcnNlcjtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY29tcG9zZXIgPSByZXF1aXJlKCcuL2NvbXBvc2UvY29tcG9zZXIuanMnKTtcbnZhciBEb2N1bWVudCA9IHJlcXVpcmUoJy4vZG9jL0RvY3VtZW50LmpzJyk7XG52YXIgZXJyb3JzID0gcmVxdWlyZSgnLi9lcnJvcnMuanMnKTtcbnZhciBsb2cgPSByZXF1aXJlKCcuL2xvZy5qcycpO1xudmFyIGlkZW50aXR5ID0gcmVxdWlyZSgnLi9ub2Rlcy9pZGVudGl0eS5qcycpO1xudmFyIGxpbmVDb3VudGVyID0gcmVxdWlyZSgnLi9wYXJzZS9saW5lLWNvdW50ZXIuanMnKTtcbnZhciBwYXJzZXIgPSByZXF1aXJlKCcuL3BhcnNlL3BhcnNlci5qcycpO1xuXG5mdW5jdGlvbiBwYXJzZU9wdGlvbnMob3B0aW9ucykge1xuICAgIGNvbnN0IHByZXR0eUVycm9ycyA9IG9wdGlvbnMucHJldHR5RXJyb3JzICE9PSBmYWxzZTtcbiAgICBjb25zdCBsaW5lQ291bnRlciQxID0gb3B0aW9ucy5saW5lQ291bnRlciB8fCAocHJldHR5RXJyb3JzICYmIG5ldyBsaW5lQ291bnRlci5MaW5lQ291bnRlcigpKSB8fCBudWxsO1xuICAgIHJldHVybiB7IGxpbmVDb3VudGVyOiBsaW5lQ291bnRlciQxLCBwcmV0dHlFcnJvcnMgfTtcbn1cbi8qKlxuICogUGFyc2UgdGhlIGlucHV0IGFzIGEgc3RyZWFtIG9mIFlBTUwgZG9jdW1lbnRzLlxuICpcbiAqIERvY3VtZW50cyBzaG91bGQgYmUgc2VwYXJhdGVkIGZyb20gZWFjaCBvdGhlciBieSBgLi4uYCBvciBgLS0tYCBtYXJrZXIgbGluZXMuXG4gKlxuICogQHJldHVybnMgSWYgYW4gZW1wdHkgYGRvY3NgIGFycmF5IGlzIHJldHVybmVkLCBpdCB3aWxsIGJlIG9mIHR5cGVcbiAqICAgRW1wdHlTdHJlYW0gYW5kIGNvbnRhaW4gYWRkaXRpb25hbCBzdHJlYW0gaW5mb3JtYXRpb24uIEluXG4gKiAgIFR5cGVTY3JpcHQsIHlvdSBzaG91bGQgdXNlIGAnZW1wdHknIGluIGRvY3NgIGFzIGEgdHlwZSBndWFyZCBmb3IgaXQuXG4gKi9cbmZ1bmN0aW9uIHBhcnNlQWxsRG9jdW1lbnRzKHNvdXJjZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgY29uc3QgeyBsaW5lQ291bnRlciwgcHJldHR5RXJyb3JzIH0gPSBwYXJzZU9wdGlvbnMob3B0aW9ucyk7XG4gICAgY29uc3QgcGFyc2VyJDEgPSBuZXcgcGFyc2VyLlBhcnNlcihsaW5lQ291bnRlcj8uYWRkTmV3TGluZSk7XG4gICAgY29uc3QgY29tcG9zZXIkMSA9IG5ldyBjb21wb3Nlci5Db21wb3NlcihvcHRpb25zKTtcbiAgICBjb25zdCBkb2NzID0gQXJyYXkuZnJvbShjb21wb3NlciQxLmNvbXBvc2UocGFyc2VyJDEucGFyc2Uoc291cmNlKSkpO1xuICAgIGlmIChwcmV0dHlFcnJvcnMgJiYgbGluZUNvdW50ZXIpXG4gICAgICAgIGZvciAoY29uc3QgZG9jIG9mIGRvY3MpIHtcbiAgICAgICAgICAgIGRvYy5lcnJvcnMuZm9yRWFjaChlcnJvcnMucHJldHRpZnlFcnJvcihzb3VyY2UsIGxpbmVDb3VudGVyKSk7XG4gICAgICAgICAgICBkb2Mud2FybmluZ3MuZm9yRWFjaChlcnJvcnMucHJldHRpZnlFcnJvcihzb3VyY2UsIGxpbmVDb3VudGVyKSk7XG4gICAgICAgIH1cbiAgICBpZiAoZG9jcy5sZW5ndGggPiAwKVxuICAgICAgICByZXR1cm4gZG9jcztcbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihbXSwgeyBlbXB0eTogdHJ1ZSB9LCBjb21wb3NlciQxLnN0cmVhbUluZm8oKSk7XG59XG4vKiogUGFyc2UgYW4gaW5wdXQgc3RyaW5nIGludG8gYSBzaW5nbGUgWUFNTC5Eb2N1bWVudCAqL1xuZnVuY3Rpb24gcGFyc2VEb2N1bWVudChzb3VyY2UsIG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IHsgbGluZUNvdW50ZXIsIHByZXR0eUVycm9ycyB9ID0gcGFyc2VPcHRpb25zKG9wdGlvbnMpO1xuICAgIGNvbnN0IHBhcnNlciQxID0gbmV3IHBhcnNlci5QYXJzZXIobGluZUNvdW50ZXI/LmFkZE5ld0xpbmUpO1xuICAgIGNvbnN0IGNvbXBvc2VyJDEgPSBuZXcgY29tcG9zZXIuQ29tcG9zZXIob3B0aW9ucyk7XG4gICAgLy8gYGRvY2AgaXMgYWx3YXlzIHNldCBieSBjb21wb3NlLmVuZCh0cnVlKSBhdCB0aGUgdmVyeSBsYXRlc3RcbiAgICBsZXQgZG9jID0gbnVsbDtcbiAgICBmb3IgKGNvbnN0IF9kb2Mgb2YgY29tcG9zZXIkMS5jb21wb3NlKHBhcnNlciQxLnBhcnNlKHNvdXJjZSksIHRydWUsIHNvdXJjZS5sZW5ndGgpKSB7XG4gICAgICAgIGlmICghZG9jKVxuICAgICAgICAgICAgZG9jID0gX2RvYztcbiAgICAgICAgZWxzZSBpZiAoZG9jLm9wdGlvbnMubG9nTGV2ZWwgIT09ICdzaWxlbnQnKSB7XG4gICAgICAgICAgICBkb2MuZXJyb3JzLnB1c2gobmV3IGVycm9ycy5ZQU1MUGFyc2VFcnJvcihfZG9jLnJhbmdlLnNsaWNlKDAsIDIpLCAnTVVMVElQTEVfRE9DUycsICdTb3VyY2UgY29udGFpbnMgbXVsdGlwbGUgZG9jdW1lbnRzOyBwbGVhc2UgdXNlIFlBTUwucGFyc2VBbGxEb2N1bWVudHMoKScpKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChwcmV0dHlFcnJvcnMgJiYgbGluZUNvdW50ZXIpIHtcbiAgICAgICAgZG9jLmVycm9ycy5mb3JFYWNoKGVycm9ycy5wcmV0dGlmeUVycm9yKHNvdXJjZSwgbGluZUNvdW50ZXIpKTtcbiAgICAgICAgZG9jLndhcm5pbmdzLmZvckVhY2goZXJyb3JzLnByZXR0aWZ5RXJyb3Ioc291cmNlLCBsaW5lQ291bnRlcikpO1xuICAgIH1cbiAgICByZXR1cm4gZG9jO1xufVxuZnVuY3Rpb24gcGFyc2Uoc3JjLCByZXZpdmVyLCBvcHRpb25zKSB7XG4gICAgbGV0IF9yZXZpdmVyID0gdW5kZWZpbmVkO1xuICAgIGlmICh0eXBlb2YgcmV2aXZlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBfcmV2aXZlciA9IHJldml2ZXI7XG4gICAgfVxuICAgIGVsc2UgaWYgKG9wdGlvbnMgPT09IHVuZGVmaW5lZCAmJiByZXZpdmVyICYmIHR5cGVvZiByZXZpdmVyID09PSAnb2JqZWN0Jykge1xuICAgICAgICBvcHRpb25zID0gcmV2aXZlcjtcbiAgICB9XG4gICAgY29uc3QgZG9jID0gcGFyc2VEb2N1bWVudChzcmMsIG9wdGlvbnMpO1xuICAgIGlmICghZG9jKVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICBkb2Mud2FybmluZ3MuZm9yRWFjaCh3YXJuaW5nID0+IGxvZy53YXJuKGRvYy5vcHRpb25zLmxvZ0xldmVsLCB3YXJuaW5nKSk7XG4gICAgaWYgKGRvYy5lcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgICBpZiAoZG9jLm9wdGlvbnMubG9nTGV2ZWwgIT09ICdzaWxlbnQnKVxuICAgICAgICAgICAgdGhyb3cgZG9jLmVycm9yc1swXTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZG9jLmVycm9ycyA9IFtdO1xuICAgIH1cbiAgICByZXR1cm4gZG9jLnRvSlMoT2JqZWN0LmFzc2lnbih7IHJldml2ZXI6IF9yZXZpdmVyIH0sIG9wdGlvbnMpKTtcbn1cbmZ1bmN0aW9uIHN0cmluZ2lmeSh2YWx1ZSwgcmVwbGFjZXIsIG9wdGlvbnMpIHtcbiAgICBsZXQgX3JlcGxhY2VyID0gbnVsbDtcbiAgICBpZiAodHlwZW9mIHJlcGxhY2VyID09PSAnZnVuY3Rpb24nIHx8IEFycmF5LmlzQXJyYXkocmVwbGFjZXIpKSB7XG4gICAgICAgIF9yZXBsYWNlciA9IHJlcGxhY2VyO1xuICAgIH1cbiAgICBlbHNlIGlmIChvcHRpb25zID09PSB1bmRlZmluZWQgJiYgcmVwbGFjZXIpIHtcbiAgICAgICAgb3B0aW9ucyA9IHJlcGxhY2VyO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdzdHJpbmcnKVxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucy5sZW5ndGg7XG4gICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnbnVtYmVyJykge1xuICAgICAgICBjb25zdCBpbmRlbnQgPSBNYXRoLnJvdW5kKG9wdGlvbnMpO1xuICAgICAgICBvcHRpb25zID0gaW5kZW50IDwgMSA/IHVuZGVmaW5lZCA6IGluZGVudCA+IDggPyB7IGluZGVudDogOCB9IDogeyBpbmRlbnQgfTtcbiAgICB9XG4gICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29uc3QgeyBrZWVwVW5kZWZpbmVkIH0gPSBvcHRpb25zID8/IHJlcGxhY2VyID8/IHt9O1xuICAgICAgICBpZiAoIWtlZXBVbmRlZmluZWQpXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBpZiAoaWRlbnRpdHkuaXNEb2N1bWVudCh2YWx1ZSkgJiYgIV9yZXBsYWNlcilcbiAgICAgICAgcmV0dXJuIHZhbHVlLnRvU3RyaW5nKG9wdGlvbnMpO1xuICAgIHJldHVybiBuZXcgRG9jdW1lbnQuRG9jdW1lbnQodmFsdWUsIF9yZXBsYWNlciwgb3B0aW9ucykudG9TdHJpbmcob3B0aW9ucyk7XG59XG5cbmV4cG9ydHMucGFyc2UgPSBwYXJzZTtcbmV4cG9ydHMucGFyc2VBbGxEb2N1bWVudHMgPSBwYXJzZUFsbERvY3VtZW50cztcbmV4cG9ydHMucGFyc2VEb2N1bWVudCA9IHBhcnNlRG9jdW1lbnQ7XG5leHBvcnRzLnN0cmluZ2lmeSA9IHN0cmluZ2lmeTtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY29tcG9zZXIgPSByZXF1aXJlKCcuL2NvbXBvc2UvY29tcG9zZXIuanMnKTtcbnZhciBEb2N1bWVudCA9IHJlcXVpcmUoJy4vZG9jL0RvY3VtZW50LmpzJyk7XG52YXIgU2NoZW1hID0gcmVxdWlyZSgnLi9zY2hlbWEvU2NoZW1hLmpzJyk7XG52YXIgZXJyb3JzID0gcmVxdWlyZSgnLi9lcnJvcnMuanMnKTtcbnZhciBBbGlhcyA9IHJlcXVpcmUoJy4vbm9kZXMvQWxpYXMuanMnKTtcbnZhciBpZGVudGl0eSA9IHJlcXVpcmUoJy4vbm9kZXMvaWRlbnRpdHkuanMnKTtcbnZhciBQYWlyID0gcmVxdWlyZSgnLi9ub2Rlcy9QYWlyLmpzJyk7XG52YXIgU2NhbGFyID0gcmVxdWlyZSgnLi9ub2Rlcy9TY2FsYXIuanMnKTtcbnZhciBZQU1MTWFwID0gcmVxdWlyZSgnLi9ub2Rlcy9ZQU1MTWFwLmpzJyk7XG52YXIgWUFNTFNlcSA9IHJlcXVpcmUoJy4vbm9kZXMvWUFNTFNlcS5qcycpO1xudmFyIGNzdCA9IHJlcXVpcmUoJy4vcGFyc2UvY3N0LmpzJyk7XG52YXIgbGV4ZXIgPSByZXF1aXJlKCcuL3BhcnNlL2xleGVyLmpzJyk7XG52YXIgbGluZUNvdW50ZXIgPSByZXF1aXJlKCcuL3BhcnNlL2xpbmUtY291bnRlci5qcycpO1xudmFyIHBhcnNlciA9IHJlcXVpcmUoJy4vcGFyc2UvcGFyc2VyLmpzJyk7XG52YXIgcHVibGljQXBpID0gcmVxdWlyZSgnLi9wdWJsaWMtYXBpLmpzJyk7XG52YXIgdmlzaXQgPSByZXF1aXJlKCcuL3Zpc2l0LmpzJyk7XG5cblxuXG5leHBvcnRzLkNvbXBvc2VyID0gY29tcG9zZXIuQ29tcG9zZXI7XG5leHBvcnRzLkRvY3VtZW50ID0gRG9jdW1lbnQuRG9jdW1lbnQ7XG5leHBvcnRzLlNjaGVtYSA9IFNjaGVtYS5TY2hlbWE7XG5leHBvcnRzLllBTUxFcnJvciA9IGVycm9ycy5ZQU1MRXJyb3I7XG5leHBvcnRzLllBTUxQYXJzZUVycm9yID0gZXJyb3JzLllBTUxQYXJzZUVycm9yO1xuZXhwb3J0cy5ZQU1MV2FybmluZyA9IGVycm9ycy5ZQU1MV2FybmluZztcbmV4cG9ydHMuQWxpYXMgPSBBbGlhcy5BbGlhcztcbmV4cG9ydHMuaXNBbGlhcyA9IGlkZW50aXR5LmlzQWxpYXM7XG5leHBvcnRzLmlzQ29sbGVjdGlvbiA9IGlkZW50aXR5LmlzQ29sbGVjdGlvbjtcbmV4cG9ydHMuaXNEb2N1bWVudCA9IGlkZW50aXR5LmlzRG9jdW1lbnQ7XG5leHBvcnRzLmlzTWFwID0gaWRlbnRpdHkuaXNNYXA7XG5leHBvcnRzLmlzTm9kZSA9IGlkZW50aXR5LmlzTm9kZTtcbmV4cG9ydHMuaXNQYWlyID0gaWRlbnRpdHkuaXNQYWlyO1xuZXhwb3J0cy5pc1NjYWxhciA9IGlkZW50aXR5LmlzU2NhbGFyO1xuZXhwb3J0cy5pc1NlcSA9IGlkZW50aXR5LmlzU2VxO1xuZXhwb3J0cy5QYWlyID0gUGFpci5QYWlyO1xuZXhwb3J0cy5TY2FsYXIgPSBTY2FsYXIuU2NhbGFyO1xuZXhwb3J0cy5ZQU1MTWFwID0gWUFNTE1hcC5ZQU1MTWFwO1xuZXhwb3J0cy5ZQU1MU2VxID0gWUFNTFNlcS5ZQU1MU2VxO1xuZXhwb3J0cy5DU1QgPSBjc3Q7XG5leHBvcnRzLkxleGVyID0gbGV4ZXIuTGV4ZXI7XG5leHBvcnRzLkxpbmVDb3VudGVyID0gbGluZUNvdW50ZXIuTGluZUNvdW50ZXI7XG5leHBvcnRzLlBhcnNlciA9IHBhcnNlci5QYXJzZXI7XG5leHBvcnRzLnBhcnNlID0gcHVibGljQXBpLnBhcnNlO1xuZXhwb3J0cy5wYXJzZUFsbERvY3VtZW50cyA9IHB1YmxpY0FwaS5wYXJzZUFsbERvY3VtZW50cztcbmV4cG9ydHMucGFyc2VEb2N1bWVudCA9IHB1YmxpY0FwaS5wYXJzZURvY3VtZW50O1xuZXhwb3J0cy5zdHJpbmdpZnkgPSBwdWJsaWNBcGkuc3RyaW5naWZ5O1xuZXhwb3J0cy52aXNpdCA9IHZpc2l0LnZpc2l0O1xuZXhwb3J0cy52aXNpdEFzeW5jID0gdmlzaXQudmlzaXRBc3luYztcbiIsCiAgICAiLyoqXG4gKiBDb25maWd1cmF0aW9uIExvYWRlciBmb3IgYWktZW5nIHJhbHBoXG4gKi9cblxuaW1wb3J0IHsgcmVhZEZpbGUgfSBmcm9tIFwibm9kZTpmcy9wcm9taXNlc1wiO1xuaW1wb3J0IHsgam9pbiB9IGZyb20gXCJub2RlOnBhdGhcIjtcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGggfSBmcm9tIFwibm9kZTp1cmxcIjtcbmltcG9ydCBZQU1MIGZyb20gXCJ5YW1sXCI7XG5pbXBvcnQgdHlwZSB7IFJhbHBoRmxhZ3MgfSBmcm9tIFwiLi4vY2xpL2ZsYWdzXCI7XG5pbXBvcnQgdHlwZSB7IEFpRW5nQ29uZmlnLCBERUZBVUxUX0NPTkZJRyB9IGZyb20gXCIuL3NjaGVtYVwiO1xuaW1wb3J0IHsgREVGQVVMVF9DT05GSUcgYXMgSEFSRENPREVEX0RFRkFVTFRTIH0gZnJvbSBcIi4vc2NoZW1hXCI7XG5cbi8vIFVzZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5IHdoZXJlIGNvbW1hbmQgaXMgY2FsbGVkIGZyb21cbi8vIFRoaXMgZW5zdXJlcyAuYWktZW5nL2NvbmZpZy55YW1sIGlzIGxvYWRlZCBmcm9tIHVzZXIncyBwcm9qZWN0IGRpcmVjdG9yeVxuY29uc3QgUk9PVCA9IHByb2Nlc3MuZW52LlRFU1RfUk9PVCA/PyBwcm9jZXNzLmN3ZCgpO1xuXG4vKipcbiAqIEVudmlyb25tZW50IHZhcmlhYmxlIHRvIGNvbmZpZyBrZXkgbWFwcGluZ1xuICovXG5jb25zdCBFTlZfVkFSX01BUFBJTkc6IFJlY29yZDxzdHJpbmcsIGtleW9mIEFpRW5nQ29uZmlnPiA9IHtcbiAgICAvLyBPcGVuQ29kZVxuICAgIE9QRU5DT0RFX1VSTDogXCJvcGVuY29kZVwiLFxuICAgIE9QRU5DT0RFX0RJUkVDVE9SWTogXCJvcGVuY29kZVwiLFxuICAgIE9QRU5DT0RFX1BST01QVF9USU1FT1VUX01TOiBcIm9wZW5jb2RlXCIsXG4gICAgLy8gRGlzY29yZCAobm9uLXNlY3JldClcbiAgICBESVNDT1JEX0JPVF9VU0VSTkFNRTogXCJub3RpZmljYXRpb25zXCIsXG4gICAgRElTQ09SRF9CT1RfQVZBVEFSX1VSTDogXCJub3RpZmljYXRpb25zXCIsXG4gICAgLy8gVUlcbiAgICBBSV9FTkdfU0lMRU5UOiBcInVpXCIsXG4gICAgLy8gTG9vcFxuICAgIEFJX0VOR19DWUNMRV9SRVRSSUVTOiBcImxvb3BcIixcbiAgICAvLyBEZWJ1Z1xuICAgIEFJX0VOR19ERUJVR19XT1JLOiBcImRlYnVnXCIsXG4gICAgLy8gR2F0ZXMgKGNvbW1hbmRzKVxuICAgIEFJX0VOR19URVNUX0NNRDogXCJnYXRlc1wiLFxuICAgIEFJX0VOR19MSU5UX0NNRDogXCJnYXRlc1wiLFxuICAgIEFJX0VOR19BQ0NFUFRBTkNFX0NNRDogXCJnYXRlc1wiLFxuICAgIEFJX0VOR19UWVBFQ0hFQ0tfQ01EOiBcImdhdGVzXCIsXG4gICAgQUlfRU5HX0JVSUxEX0NNRDogXCJnYXRlc1wiLFxufTtcblxuLyoqXG4gKiBHZXQgbmVzdGVkIHZhbHVlIGZyb20gb2JqZWN0IHVzaW5nIGRvdCBub3RhdGlvblxuICovXG5mdW5jdGlvbiBnZXROZXN0ZWRWYWx1ZShvYmo6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LCBwYXRoOiBzdHJpbmcpOiB1bmtub3duIHtcbiAgICByZXR1cm4gcGF0aC5zcGxpdChcIi5cIikucmVkdWNlPHVua25vd24+KChjdXJyZW50LCBrZXkpID0+IHtcbiAgICAgICAgaWYgKGN1cnJlbnQgJiYgdHlwZW9mIGN1cnJlbnQgPT09IFwib2JqZWN0XCIgJiYga2V5IGluIGN1cnJlbnQpIHtcbiAgICAgICAgICAgIHJldHVybiAoY3VycmVudCBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPilba2V5XTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH0sIG9iaik7XG59XG5cbi8qKlxuICogU2V0IG5lc3RlZCB2YWx1ZSBpbiBvYmplY3QgdXNpbmcgZG90IG5vdGF0aW9uXG4gKi9cbmZ1bmN0aW9uIHNldE5lc3RlZFZhbHVlKFxuICAgIG9iajogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sXG4gICAgcGF0aDogc3RyaW5nLFxuICAgIHZhbHVlOiB1bmtub3duLFxuKTogdm9pZCB7XG4gICAgY29uc3Qga2V5cyA9IHBhdGguc3BsaXQoXCIuXCIpO1xuICAgIGNvbnN0IGxhc3RLZXkgPSBrZXlzLnBvcCgpITtcbiAgICBjb25zdCB0YXJnZXQgPSBrZXlzLnJlZHVjZTxSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4oKGN1cnJlbnQsIGtleSkgPT4ge1xuICAgICAgICBpZiAoIWN1cnJlbnRba2V5XSB8fCB0eXBlb2YgY3VycmVudFtrZXldICE9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICBjdXJyZW50W2tleV0gPSB7fTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY3VycmVudFtrZXldIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgIH0sIG9iaik7XG4gICAgdGFyZ2V0W2xhc3RLZXldID0gdmFsdWU7XG59XG5cbi8qKlxuICogQXBwbHkgZW52aXJvbm1lbnQgdmFyaWFibGUgb3ZlcnJpZGVzIHRvIGNvbmZpZ1xuICovXG5mdW5jdGlvbiBhcHBseUVudk92ZXJyaWRlcyhjb25maWc6IEFpRW5nQ29uZmlnKTogdm9pZCB7XG4gICAgLy8gT3BlbkNvZGUgb3ZlcnJpZGVzXG4gICAgaWYgKHByb2Nlc3MuZW52Lk9QRU5DT0RFX1VSTCkge1xuICAgICAgICBjb25maWcub3BlbmNvZGUuc2VydmVyVXJsID0gcHJvY2Vzcy5lbnYuT1BFTkNPREVfVVJMO1xuICAgIH1cbiAgICBpZiAocHJvY2Vzcy5lbnYuT1BFTkNPREVfRElSRUNUT1JZKSB7XG4gICAgICAgIGNvbmZpZy5vcGVuY29kZS5kaXJlY3RvcnkgPSBwcm9jZXNzLmVudi5PUEVOQ09ERV9ESVJFQ1RPUlk7XG4gICAgfVxuICAgIGlmIChwcm9jZXNzLmVudi5PUEVOQ09ERV9QUk9NUFRfVElNRU9VVF9NUykge1xuICAgICAgICBjb25zdCB0aW1lb3V0ID0gTnVtYmVyLnBhcnNlSW50KFxuICAgICAgICAgICAgcHJvY2Vzcy5lbnYuT1BFTkNPREVfUFJPTVBUX1RJTUVPVVRfTVMsXG4gICAgICAgICAgICAxMCxcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKE51bWJlci5pc05hTih0aW1lb3V0KSkge1xuICAgICAgICAgICAgY29uZmlnLm9wZW5jb2RlLnByb21wdFRpbWVvdXRNcyA9IHRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBEaXNjb3JkIG92ZXJyaWRlcyAobm9uLXNlY3JldClcbiAgICBpZiAocHJvY2Vzcy5lbnYuRElTQ09SRF9CT1RfVVNFUk5BTUUpIHtcbiAgICAgICAgY29uZmlnLm5vdGlmaWNhdGlvbnMuZGlzY29yZC51c2VybmFtZSA9XG4gICAgICAgICAgICBwcm9jZXNzLmVudi5ESVNDT1JEX0JPVF9VU0VSTkFNRTtcbiAgICB9XG4gICAgaWYgKHByb2Nlc3MuZW52LkRJU0NPUkRfQk9UX0FWQVRBUl9VUkwpIHtcbiAgICAgICAgY29uZmlnLm5vdGlmaWNhdGlvbnMuZGlzY29yZC5hdmF0YXJVcmwgPVxuICAgICAgICAgICAgcHJvY2Vzcy5lbnYuRElTQ09SRF9CT1RfQVZBVEFSX1VSTDtcbiAgICB9XG5cbiAgICAvLyBVSSBvdmVycmlkZVxuICAgIGlmIChwcm9jZXNzLmVudi5BSV9FTkdfU0lMRU5UKSB7XG4gICAgICAgIGNvbmZpZy51aS5zaWxlbnQgPVxuICAgICAgICAgICAgcHJvY2Vzcy5lbnYuQUlfRU5HX1NJTEVOVCA9PT0gXCIxXCIgfHxcbiAgICAgICAgICAgIHByb2Nlc3MuZW52LkFJX0VOR19TSUxFTlQgPT09IFwidHJ1ZVwiO1xuICAgIH1cblxuICAgIC8vIExvb3Agb3ZlcnJpZGVzXG4gICAgaWYgKHByb2Nlc3MuZW52LkFJX0VOR19DWUNMRV9SRVRSSUVTKSB7XG4gICAgICAgIGNvbnN0IHJldHJpZXMgPSBOdW1iZXIucGFyc2VJbnQocHJvY2Vzcy5lbnYuQUlfRU5HX0NZQ0xFX1JFVFJJRVMsIDEwKTtcbiAgICAgICAgaWYgKCFOdW1iZXIuaXNOYU4ocmV0cmllcykpIHtcbiAgICAgICAgICAgIGNvbmZpZy5sb29wLmN5Y2xlUmV0cmllcyA9IHJldHJpZXM7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBEZWJ1ZyBvdmVycmlkZXNcbiAgICBpZiAocHJvY2Vzcy5lbnYuQUlfRU5HX0RFQlVHX1dPUkspIHtcbiAgICAgICAgY29uZmlnLmRlYnVnLndvcmsgPVxuICAgICAgICAgICAgcHJvY2Vzcy5lbnYuQUlfRU5HX0RFQlVHX1dPUksgPT09IFwiMVwiIHx8XG4gICAgICAgICAgICBwcm9jZXNzLmVudi5BSV9FTkdfREVCVUdfV09SSyA9PT0gXCJ0cnVlXCI7XG4gICAgfVxuXG4gICAgLy8gR2F0ZSBjb21tYW5kIG92ZXJyaWRlc1xuICAgIGlmIChwcm9jZXNzLmVudi5BSV9FTkdfVEVTVF9DTUQpIHtcbiAgICAgICAgY29uZmlnLmdhdGVzLnRlc3QuY29tbWFuZCA9IHByb2Nlc3MuZW52LkFJX0VOR19URVNUX0NNRDtcbiAgICB9XG4gICAgaWYgKHByb2Nlc3MuZW52LkFJX0VOR19MSU5UX0NNRCkge1xuICAgICAgICBjb25maWcuZ2F0ZXMubGludC5jb21tYW5kID0gcHJvY2Vzcy5lbnYuQUlfRU5HX0xJTlRfQ01EO1xuICAgIH1cbiAgICBpZiAocHJvY2Vzcy5lbnYuQUlfRU5HX0FDQ0VQVEFOQ0VfQ01EKSB7XG4gICAgICAgIGNvbmZpZy5nYXRlcy5hY2NlcHRhbmNlLmNvbW1hbmQgPSBwcm9jZXNzLmVudi5BSV9FTkdfQUNDRVBUQU5DRV9DTUQ7XG4gICAgfVxuICAgIGlmIChwcm9jZXNzLmVudi5BSV9FTkdfVFlQRUNIRUNLX0NNRCkge1xuICAgICAgICBjb25maWcuZ2F0ZXMudHlwZWNoZWNrLmNvbW1hbmQgPSBwcm9jZXNzLmVudi5BSV9FTkdfVFlQRUNIRUNLX0NNRDtcbiAgICB9XG4gICAgaWYgKHByb2Nlc3MuZW52LkFJX0VOR19CVUlMRF9DTUQpIHtcbiAgICAgICAgY29uZmlnLmdhdGVzLmJ1aWxkLmNvbW1hbmQgPSBwcm9jZXNzLmVudi5BSV9FTkdfQlVJTERfQ01EO1xuICAgIH1cbn1cblxuLyoqXG4gKiBEZWVwIG1lcmdlIHR3byBvYmplY3RzICh0YXJnZXQgPC0gc291cmNlKVxuICovXG5mdW5jdGlvbiBkZWVwTWVyZ2U8VCBleHRlbmRzIFJlY29yZDxzdHJpbmcsIHVua25vd24+PihcbiAgICB0YXJnZXQ6IFQsXG4gICAgc291cmNlOiBQYXJ0aWFsPFQ+LFxuKTogVCB7XG4gICAgY29uc3QgcmVzdWx0ID0geyAuLi50YXJnZXQgfSBhcyBUO1xuICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHNvdXJjZSkgYXMgQXJyYXk8a2V5b2YgVD4pIHtcbiAgICAgICAgY29uc3Qgc291cmNlVmFsdWUgPSBzb3VyY2Vba2V5XTtcbiAgICAgICAgY29uc3QgdGFyZ2V0VmFsdWUgPSB0YXJnZXRba2V5XTtcblxuICAgICAgICBpZiAoc291cmNlVmFsdWUgPT09IHVuZGVmaW5lZCkgY29udGludWU7XG5cbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgc291cmNlVmFsdWUgJiZcbiAgICAgICAgICAgIHR5cGVvZiBzb3VyY2VWYWx1ZSA9PT0gXCJvYmplY3RcIiAmJlxuICAgICAgICAgICAgIUFycmF5LmlzQXJyYXkoc291cmNlVmFsdWUpXG4gICAgICAgICkge1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIHRhcmdldFZhbHVlICYmXG4gICAgICAgICAgICAgICAgdHlwZW9mIHRhcmdldFZhbHVlID09PSBcIm9iamVjdFwiICYmXG4gICAgICAgICAgICAgICAgIUFycmF5LmlzQXJyYXkodGFyZ2V0VmFsdWUpXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID0gZGVlcE1lcmdlKFxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRWYWx1ZSBhcyBhbnksXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZVZhbHVlIGFzIGFueSxcbiAgICAgICAgICAgICAgICApIGFzIGFueTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W2tleV0gPSBzb3VyY2VWYWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdFtrZXldID0gc291cmNlVmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBNZXJnZSBnYXRlIGNvbW1hbmQgY29uZmlncyAoaGFuZGxlIGxlZ2FjeSBzdHJpbmcgZm9ybWF0KVxuICovXG5mdW5jdGlvbiBtZXJnZUdhdGVDb25maWcoXG4gICAgZXhpc3Rpbmc6IHsgY29tbWFuZDogc3RyaW5nIH0sXG4gICAgaW5jb21pbmc6IHN0cmluZyB8IHsgY29tbWFuZD86IHN0cmluZyB9LFxuKTogeyBjb21tYW5kOiBzdHJpbmcgfSB7XG4gICAgaWYgKHR5cGVvZiBpbmNvbWluZyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICByZXR1cm4geyBjb21tYW5kOiBpbmNvbWluZyB9O1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBjb21tYW5kOiBpbmNvbWluZy5jb21tYW5kID8/IGV4aXN0aW5nLmNvbW1hbmQsXG4gICAgfTtcbn1cblxuLyoqXG4gKiBMb2FkIGNvbmZpZ3VyYXRpb24gZnJvbSAuYWktZW5nL2NvbmZpZy55YW1sXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2FkQ29uZmlnKGZsYWdzOiBSYWxwaEZsYWdzKTogUHJvbWlzZTxBaUVuZ0NvbmZpZz4ge1xuICAgIC8vIFN0YXJ0IHdpdGggZGVmYXVsdCBjb25maWdcbiAgICBjb25zdCBjb25maWc6IEFpRW5nQ29uZmlnID0ge1xuICAgICAgICB2ZXJzaW9uOiBIQVJEQ09ERURfREVGQVVMVFMudmVyc2lvbixcbiAgICAgICAgcnVubmVyOiB7IC4uLkhBUkRDT0RFRF9ERUZBVUxUUy5ydW5uZXIgfSxcbiAgICAgICAgbG9vcDogeyAuLi5IQVJEQ09ERURfREVGQVVMVFMubG9vcCB9LFxuICAgICAgICBkZWJ1ZzogeyAuLi5IQVJEQ09ERURfREVGQVVMVFMuZGVidWcgfSxcbiAgICAgICAgb3BlbmNvZGU6IHsgLi4uSEFSRENPREVEX0RFRkFVTFRTLm9wZW5jb2RlIH0sXG4gICAgICAgIGFudGhyb3BpYzogeyAuLi5IQVJEQ09ERURfREVGQVVMVFMuYW50aHJvcGljIH0sXG4gICAgICAgIGdhdGVzOiB7XG4gICAgICAgICAgICBsaW50OiB7IC4uLkhBUkRDT0RFRF9ERUZBVUxUUy5nYXRlcy5saW50IH0sXG4gICAgICAgICAgICB0eXBlY2hlY2s6IHsgLi4uSEFSRENPREVEX0RFRkFVTFRTLmdhdGVzLnR5cGVjaGVjayB9LFxuICAgICAgICAgICAgdGVzdDogeyAuLi5IQVJEQ09ERURfREVGQVVMVFMuZ2F0ZXMudGVzdCB9LFxuICAgICAgICAgICAgYnVpbGQ6IHsgLi4uSEFSRENPREVEX0RFRkFVTFRTLmdhdGVzLmJ1aWxkIH0sXG4gICAgICAgICAgICBhY2NlcHRhbmNlOiB7IC4uLkhBUkRDT0RFRF9ERUZBVUxUUy5nYXRlcy5hY2NlcHRhbmNlIH0sXG4gICAgICAgIH0sXG4gICAgICAgIG1vZGVsczogeyAuLi5IQVJEQ09ERURfREVGQVVMVFMubW9kZWxzIH0sXG4gICAgICAgIG5vdGlmaWNhdGlvbnM6IHtcbiAgICAgICAgICAgIGRpc2NvcmQ6IHsgLi4uSEFSRENPREVEX0RFRkFVTFRTLm5vdGlmaWNhdGlvbnMuZGlzY29yZCB9LFxuICAgICAgICB9LFxuICAgICAgICB1aTogeyAuLi5IQVJEQ09ERURfREVGQVVMVFMudWkgfSxcbiAgICB9O1xuXG4gICAgLy8gVHJ5IHRvIGxvYWQgZnJvbSBjb25maWcgZmlsZVxuICAgIGNvbnN0IGNvbmZpZ1BhdGggPSBqb2luKFJPT1QsIFwiLmFpLWVuZ1wiLCBcImNvbmZpZy55YW1sXCIpO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGNvbmZpZ0NvbnRlbnQgPSBhd2FpdCByZWFkRmlsZShjb25maWdQYXRoLCBcInV0Zi04XCIpO1xuICAgICAgICBjb25zdCB1c2VyQ29uZmlnID0gWUFNTC5wYXJzZShjb25maWdDb250ZW50KTtcblxuICAgICAgICBpZiAodXNlckNvbmZpZy52ZXJzaW9uKSB7XG4gICAgICAgICAgICBjb25maWcudmVyc2lvbiA9IHVzZXJDb25maWcudmVyc2lvbjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodXNlckNvbmZpZy5ydW5uZXIpIHtcbiAgICAgICAgICAgIGNvbmZpZy5ydW5uZXIgPSB7IC4uLmNvbmZpZy5ydW5uZXIsIC4uLnVzZXJDb25maWcucnVubmVyIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHVzZXJDb25maWcubG9vcCkge1xuICAgICAgICAgICAgY29uZmlnLmxvb3AgPSB7IC4uLmNvbmZpZy5sb29wLCAuLi51c2VyQ29uZmlnLmxvb3AgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodXNlckNvbmZpZy5kZWJ1Zykge1xuICAgICAgICAgICAgY29uZmlnLmRlYnVnID0geyAuLi5jb25maWcuZGVidWcsIC4uLnVzZXJDb25maWcuZGVidWcgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodXNlckNvbmZpZy5vcGVuY29kZSkge1xuICAgICAgICAgICAgY29uZmlnLm9wZW5jb2RlID0geyAuLi5jb25maWcub3BlbmNvZGUsIC4uLnVzZXJDb25maWcub3BlbmNvZGUgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodXNlckNvbmZpZy5hbnRocm9waWMpIHtcbiAgICAgICAgICAgIGNvbmZpZy5hbnRocm9waWMgPSB7IC4uLmNvbmZpZy5hbnRocm9waWMsIC4uLnVzZXJDb25maWcuYW50aHJvcGljIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHVzZXJDb25maWcuZ2F0ZXMpIHtcbiAgICAgICAgICAgIGlmICh1c2VyQ29uZmlnLmdhdGVzLmxpbnQpIHtcbiAgICAgICAgICAgICAgICBjb25maWcuZ2F0ZXMubGludCA9IG1lcmdlR2F0ZUNvbmZpZyhcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnLmdhdGVzLmxpbnQsXG4gICAgICAgICAgICAgICAgICAgIHVzZXJDb25maWcuZ2F0ZXMubGludCxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHVzZXJDb25maWcuZ2F0ZXMudHlwZWNoZWNrKSB7XG4gICAgICAgICAgICAgICAgY29uZmlnLmdhdGVzLnR5cGVjaGVjayA9IG1lcmdlR2F0ZUNvbmZpZyhcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnLmdhdGVzLnR5cGVjaGVjayxcbiAgICAgICAgICAgICAgICAgICAgdXNlckNvbmZpZy5nYXRlcy50eXBlY2hlY2ssXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh1c2VyQ29uZmlnLmdhdGVzLnRlc3QpIHtcbiAgICAgICAgICAgICAgICBjb25maWcuZ2F0ZXMudGVzdCA9IG1lcmdlR2F0ZUNvbmZpZyhcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnLmdhdGVzLnRlc3QsXG4gICAgICAgICAgICAgICAgICAgIHVzZXJDb25maWcuZ2F0ZXMudGVzdCxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHVzZXJDb25maWcuZ2F0ZXMuYnVpbGQpIHtcbiAgICAgICAgICAgICAgICBjb25maWcuZ2F0ZXMuYnVpbGQgPSBtZXJnZUdhdGVDb25maWcoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZy5nYXRlcy5idWlsZCxcbiAgICAgICAgICAgICAgICAgICAgdXNlckNvbmZpZy5nYXRlcy5idWlsZCxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHVzZXJDb25maWcuZ2F0ZXMuYWNjZXB0YW5jZSkge1xuICAgICAgICAgICAgICAgIGNvbmZpZy5nYXRlcy5hY2NlcHRhbmNlID0gbWVyZ2VHYXRlQ29uZmlnKFxuICAgICAgICAgICAgICAgICAgICBjb25maWcuZ2F0ZXMuYWNjZXB0YW5jZSxcbiAgICAgICAgICAgICAgICAgICAgdXNlckNvbmZpZy5nYXRlcy5hY2NlcHRhbmNlLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHVzZXJDb25maWcubW9kZWxzKSB7XG4gICAgICAgICAgICBjb25maWcubW9kZWxzID0geyAuLi5jb25maWcubW9kZWxzLCAuLi51c2VyQ29uZmlnLm1vZGVscyB9O1xuICAgICAgICB9XG4gICAgICAgIGlmICh1c2VyQ29uZmlnLm5vdGlmaWNhdGlvbnMpIHtcbiAgICAgICAgICAgIGlmICh1c2VyQ29uZmlnLm5vdGlmaWNhdGlvbnMuZGlzY29yZCkge1xuICAgICAgICAgICAgICAgIGNvbmZpZy5ub3RpZmljYXRpb25zLmRpc2NvcmQgPSB7XG4gICAgICAgICAgICAgICAgICAgIC4uLmNvbmZpZy5ub3RpZmljYXRpb25zLmRpc2NvcmQsXG4gICAgICAgICAgICAgICAgICAgIC4uLnVzZXJDb25maWcubm90aWZpY2F0aW9ucy5kaXNjb3JkLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHVzZXJDb25maWcudWkpIHtcbiAgICAgICAgICAgIGNvbmZpZy51aSA9IHsgLi4uY29uZmlnLnVpLCAuLi51c2VyQ29uZmlnLnVpIH07XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAvLyBDb25maWcgZmlsZSBub3QgZm91bmQgb3IgaW52YWxpZCAtIHVzZSBkZWZhdWx0c1xuICAgICAgICBpZiAoIShlcnJvciBpbnN0YW5jZW9mIEVycm9yICYmIGVycm9yLm1lc3NhZ2UuaW5jbHVkZXMoXCJFTk9FTlRcIikpKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgICAgICAgYFdhcm5pbmc6IEZhaWxlZCB0byBsb2FkIGNvbmZpZyBmcm9tICR7Y29uZmlnUGF0aH0sIHVzaW5nIGRlZmF1bHRzYCxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBBcHBseSBlbnZpcm9ubWVudCB2YXJpYWJsZSBvdmVycmlkZXMgKGVudiB0YWtlcyBwcmVjZWRlbmNlIG92ZXIgeWFtbClcbiAgICBhcHBseUVudk92ZXJyaWRlcyhjb25maWcpO1xuXG4gICAgLy8gT3ZlcnJpZGUgd2l0aCBDTEkgZmxhZ3MgKGhpZ2hlc3QgcHJpb3JpdHkpXG4gICAgaWYgKGZsYWdzLm1heEl0ZXJzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29uZmlnLnJ1bm5lci5tYXhJdGVycyA9IGZsYWdzLm1heEl0ZXJzO1xuICAgIH1cbiAgICBpZiAoZmxhZ3MucmV2aWV3ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29uZmlnLnJ1bm5lci5yZXZpZXcgPSBmbGFncy5yZXZpZXc7XG4gICAgfVxuICAgIGlmIChmbGFncy5tYXhDeWNsZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjb25maWcubG9vcC5tYXhDeWNsZXMgPSBmbGFncy5tYXhDeWNsZXM7XG4gICAgfVxuICAgIGlmIChmbGFncy5zdHVja1RocmVzaG9sZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbmZpZy5sb29wLnN0dWNrVGhyZXNob2xkID0gZmxhZ3Muc3R1Y2tUaHJlc2hvbGQ7XG4gICAgfVxuICAgIGlmIChmbGFncy5jaGVja3BvaW50RnJlcXVlbmN5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29uZmlnLmxvb3AuY2hlY2twb2ludEZyZXF1ZW5jeSA9IGZsYWdzLmNoZWNrcG9pbnRGcmVxdWVuY3k7XG4gICAgfVxuICAgIGlmIChmbGFncy5wcmludExvZ3MgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjb25maWcucnVubmVyLnByaW50TG9ncyA9IGZsYWdzLnByaW50TG9ncztcbiAgICB9XG4gICAgaWYgKGZsYWdzLmxvZ0xldmVsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29uZmlnLnJ1bm5lci5sb2dMZXZlbCA9IGZsYWdzLmxvZ0xldmVsO1xuICAgIH1cbiAgICBpZiAoZmxhZ3MudmVyYm9zZSkge1xuICAgICAgICBjb25maWcucnVubmVyLmxvZ0xldmVsID0gXCJERUJVR1wiO1xuICAgIH1cbiAgICBpZiAoZmxhZ3Mud29ya2luZ0RpciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbmZpZy5vcGVuY29kZS5kaXJlY3RvcnkgPSBmbGFncy53b3JraW5nRGlyO1xuICAgIH1cbiAgICBpZiAoZmxhZ3MuZHJ5UnVuICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy8gZHJ5UnVuIGNvdWxkIGJlIHVzZWQgYnkgZ2F0ZXMgb3Igb3RoZXIgY29tcG9uZW50c1xuICAgIH1cblxuICAgIHJldHVybiBjb25maWc7XG59XG4iLAogICAgIi8qKlxuICogQUkgRW5naW5lZXJpbmcgU3lzdGVtIENvbmZpZ3VyYXRpb24gU2NoZW1hXG4gKi9cblxuLyoqXG4gKiBSdW5uZXIgQ29uZmlndXJhdGlvblxuICovXG5leHBvcnQgaW50ZXJmYWNlIFJ1bm5lckNvbmZpZyB7XG4gICAgLyoqIEJhY2tlbmQgdG8gdXNlIGZvciBleGVjdXRpb24gKi9cbiAgICBiYWNrZW5kOiBcIm9wZW5jb2RlXCIgfCBcImFudGhyb3BpY1wiO1xuICAgIC8qKiBSZXZpZXcgbW9kZSBmb3IgQUkgcmV2aWV3cyAqL1xuICAgIHJldmlldzogXCJub25lXCIgfCBcIm9wZW5jb2RlXCIgfCBcImFudGhyb3BpY1wiIHwgXCJib3RoXCI7XG4gICAgLyoqIERpcmVjdG9yeSBmb3IgcnVuIGFydGlmYWN0cyAqL1xuICAgIGFydGlmYWN0c0Rpcjogc3RyaW5nO1xuICAgIC8qKiBNYXhpbXVtIGl0ZXJhdGlvbnMgcGVyIHJ1biAqL1xuICAgIG1heEl0ZXJzOiBudW1iZXI7XG4gICAgLyoqIFByaW50IGxvZ3MgdG8gc3RkZXJyICovXG4gICAgcHJpbnRMb2dzPzogYm9vbGVhbjtcbiAgICAvKiogTG9nIGxldmVsICovXG4gICAgbG9nTGV2ZWw/OiBcIkRFQlVHXCIgfCBcIklORk9cIiB8IFwiV0FSTlwiIHwgXCJFUlJPUlwiO1xufVxuXG4vKipcbiAqIExvb3AgQ29uZmlndXJhdGlvblxuICovXG5leHBvcnQgaW50ZXJmYWNlIExvb3BDb25maWcge1xuICAgIC8qKiBNYXhpbXVtIG51bWJlciBvZiBsb29wIGN5Y2xlcyAqL1xuICAgIG1heEN5Y2xlczogbnVtYmVyO1xuICAgIC8qKiBOdW1iZXIgb2YgcmV0cnkgYXR0ZW1wdHMgcGVyIGN5Y2xlIG9uIGZhaWx1cmUgKi9cbiAgICBjeWNsZVJldHJpZXM6IG51bWJlcjtcbiAgICAvKiogQ2hlY2twb2ludCBmcmVxdWVuY3kgKHNhdmUgc3RhdGUgZXZlcnkgTiBjeWNsZXMpICovXG4gICAgY2hlY2twb2ludEZyZXF1ZW5jeTogbnVtYmVyO1xuICAgIC8qKiBTdHVjayBkZXRlY3Rpb24gdGhyZXNob2xkIC0gYWJvcnQgYWZ0ZXIgTiBjeWNsZXMgd2l0aCBubyBwcm9ncmVzcyAqL1xuICAgIHN0dWNrVGhyZXNob2xkOiBudW1iZXI7XG59XG5cbi8qKlxuICogRGVidWcgQ29uZmlndXJhdGlvblxuICovXG5leHBvcnQgaW50ZXJmYWNlIERlYnVnQ29uZmlnIHtcbiAgICAvKiogUHJpbnQgZXZlcnkgdG9vbCBpbnZvY2F0aW9uIGlucHV0L291dHB1dCB0byBjb25zb2xlIGFuZCBsb2dzICovXG4gICAgd29yazogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBPcGVuQ29kZSBDb25maWd1cmF0aW9uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgT3BlbkNvZGVDb25maWcge1xuICAgIC8qKiBNb2RlbCB0byB1c2UgZm9yIE9wZW5Db2RlICovXG4gICAgbW9kZWw6IHN0cmluZztcbiAgICAvKiogVGVtcGVyYXR1cmUgZm9yIGdlbmVyYXRpb24gKi9cbiAgICB0ZW1wZXJhdHVyZTogbnVtYmVyO1xuICAgIC8qKiBFeGlzdGluZyBzZXJ2ZXIgVVJMIChvcHRpb25hbCAtIHdpbGwgc3Bhd24gaWYgbm90IHByb3ZpZGVkKSAqL1xuICAgIHNlcnZlclVybD86IHN0cmluZztcbiAgICAvKiogV29ya2luZyBkaXJlY3RvcnkgZm9yIE9wZW5Db2RlIHNlc3Npb24gKi9cbiAgICBkaXJlY3Rvcnk/OiBzdHJpbmc7XG4gICAgLyoqIFByb21wdCB0aW1lb3V0IGluIG1pbGxpc2Vjb25kcyAqL1xuICAgIHByb21wdFRpbWVvdXRNcz86IG51bWJlcjtcbn1cblxuLyoqXG4gKiBBbnRocm9waWMgQ29uZmlndXJhdGlvblxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFudGhyb3BpY0NvbmZpZyB7XG4gICAgLyoqIFdoZXRoZXIgQW50aHJvcGljIGJhY2tlbmQgaXMgZW5hYmxlZCAqL1xuICAgIGVuYWJsZWQ6IGJvb2xlYW47XG4gICAgLyoqIE1vZGVsIHRvIHVzZSBmb3IgQW50aHJvcGljICovXG4gICAgbW9kZWw6IHN0cmluZztcbn1cblxuLyoqXG4gKiBHYXRlIENvbW1hbmQgQ29uZmlndXJhdGlvblxuICovXG5leHBvcnQgaW50ZXJmYWNlIEdhdGVDb21tYW5kQ29uZmlnIHtcbiAgICAvKiogQ29tbWFuZCB0byBleGVjdXRlIGZvciB0aGlzIGdhdGUgKi9cbiAgICBjb21tYW5kOiBzdHJpbmc7XG59XG5cbi8qKlxuICogUXVhbGl0eSBHYXRlcyBDb25maWd1cmF0aW9uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgR2F0ZXNDb25maWcge1xuICAgIC8qKiBMaW50IGdhdGUgY29uZmlndXJhdGlvbiAqL1xuICAgIGxpbnQ6IEdhdGVDb21tYW5kQ29uZmlnO1xuICAgIC8qKiBUeXBlIGNoZWNrIGdhdGUgY29uZmlndXJhdGlvbiAqL1xuICAgIHR5cGVjaGVjazogR2F0ZUNvbW1hbmRDb25maWc7XG4gICAgLyoqIFRlc3QgZ2F0ZSBjb25maWd1cmF0aW9uICovXG4gICAgdGVzdDogR2F0ZUNvbW1hbmRDb25maWc7XG4gICAgLyoqIEJ1aWxkIGdhdGUgY29uZmlndXJhdGlvbiAqL1xuICAgIGJ1aWxkOiBHYXRlQ29tbWFuZENvbmZpZztcbiAgICAvKiogQWNjZXB0YW5jZSBnYXRlIGNvbmZpZ3VyYXRpb24gKGUuZy4sIGdpdCBkaWZmIC0tbmFtZS1vbmx5KSAqL1xuICAgIGFjY2VwdGFuY2U6IEdhdGVDb21tYW5kQ29uZmlnO1xufVxuXG4vKipcbiAqIE1vZGVscyBDb25maWd1cmF0aW9uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTW9kZWxzQ29uZmlnIHtcbiAgICAvKiogTW9kZWwgZm9yIHJlc2VhcmNoIHRhc2tzICovXG4gICAgcmVzZWFyY2g6IHN0cmluZztcbiAgICAvKiogTW9kZWwgZm9yIHBsYW5uaW5nIHRhc2tzICovXG4gICAgcGxhbm5pbmc6IHN0cmluZztcbiAgICAvKiogTW9kZWwgZm9yIGNvZGViYXNlIGV4cGxvcmF0aW9uICovXG4gICAgZXhwbG9yYXRpb246IHN0cmluZztcbiAgICAvKiogTW9kZWwgZm9yIGNvZGluZy9pbXBsZW1lbnRhdGlvbiAqL1xuICAgIGNvZGluZzogc3RyaW5nO1xuICAgIC8qKiBEZWZhdWx0IGZhbGxiYWNrIG1vZGVsICovXG4gICAgZGVmYXVsdDogc3RyaW5nO1xufVxuXG4vKipcbiAqIE5vdGlmaWNhdGlvbiBDb25maWd1cmF0aW9uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTm90aWZpY2F0aW9uc0NvbmZpZyB7XG4gICAgLyoqIERpc2NvcmQgbm90aWZpY2F0aW9uIHNldHRpbmdzICovXG4gICAgZGlzY29yZDoge1xuICAgICAgICAvKiogRW5hYmxlIERpc2NvcmQgbm90aWZpY2F0aW9ucyAqL1xuICAgICAgICBlbmFibGVkOiBib29sZWFuO1xuICAgICAgICAvKiogQm90IHVzZXJuYW1lICovXG4gICAgICAgIHVzZXJuYW1lOiBzdHJpbmc7XG4gICAgICAgIC8qKiBCb3QgYXZhdGFyIFVSTCAqL1xuICAgICAgICBhdmF0YXJVcmw/OiBzdHJpbmc7XG4gICAgICAgIC8qKiBXZWJob29rIFVSTCAoc2hvdWxkIGNvbWUgZnJvbSBlbnYsIG5ldmVyIGhhcmRjb2RlZCkgKi9cbiAgICAgICAgd2ViaG9vaz86IHtcbiAgICAgICAgICAgIC8qKiBTb3VyY2UgdHlwZSAtIG9ubHkgJ2Vudicgc3VwcG9ydGVkIGZvciBzZWNyZXRzICovXG4gICAgICAgICAgICBzb3VyY2U6IFwiZW52XCI7XG4gICAgICAgICAgICAvKiogRW52aXJvbm1lbnQgdmFyaWFibGUgbmFtZSBmb3IgdGhlIHdlYmhvb2sgVVJMICovXG4gICAgICAgICAgICBlbnZWYXI6IHN0cmluZztcbiAgICAgICAgfTtcbiAgICB9O1xufVxuXG4vKipcbiAqIFVJIENvbmZpZ3VyYXRpb25cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBVaUNvbmZpZyB7XG4gICAgLyoqIFN1cHByZXNzIG5vaXN5IHdhcm5pbmdzL2xvZ3MgKi9cbiAgICBzaWxlbnQ6IGJvb2xlYW47XG59XG5cbi8qKlxuICogTWFpbiBDb25maWd1cmF0aW9uIFNjaGVtYVxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFpRW5nQ29uZmlnIHtcbiAgICAvKiogQ29uZmlndXJhdGlvbiB2ZXJzaW9uICovXG4gICAgdmVyc2lvbjogbnVtYmVyO1xuICAgIC8qKiBSdW5uZXIgY29uZmlndXJhdGlvbiAqL1xuICAgIHJ1bm5lcjogUnVubmVyQ29uZmlnO1xuICAgIC8qKiBMb29wIGNvbmZpZ3VyYXRpb24gKi9cbiAgICBsb29wOiBMb29wQ29uZmlnO1xuICAgIC8qKiBEZWJ1ZyBjb25maWd1cmF0aW9uICovXG4gICAgZGVidWc6IERlYnVnQ29uZmlnO1xuICAgIC8qKiBPcGVuQ29kZSBjb25maWd1cmF0aW9uICovXG4gICAgb3BlbmNvZGU6IE9wZW5Db2RlQ29uZmlnO1xuICAgIC8qKiBBbnRocm9waWMgY29uZmlndXJhdGlvbiAqL1xuICAgIGFudGhyb3BpYzogQW50aHJvcGljQ29uZmlnO1xuICAgIC8qKiBRdWFsaXR5IGdhdGVzIGNvbmZpZ3VyYXRpb24gKi9cbiAgICBnYXRlczogR2F0ZXNDb25maWc7XG4gICAgLyoqIE1vZGVscyBjb25maWd1cmF0aW9uICovXG4gICAgbW9kZWxzOiBNb2RlbHNDb25maWc7XG4gICAgLyoqIE5vdGlmaWNhdGlvbnMgY29uZmlndXJhdGlvbiAqL1xuICAgIG5vdGlmaWNhdGlvbnM6IE5vdGlmaWNhdGlvbnNDb25maWc7XG4gICAgLyoqIFVJIGNvbmZpZ3VyYXRpb24gKi9cbiAgICB1aTogVWlDb25maWc7XG59XG5cbi8qKlxuICogRGVmYXVsdCBjb25maWd1cmF0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBERUZBVUxUX0NPTkZJRzogQWlFbmdDb25maWcgPSB7XG4gICAgdmVyc2lvbjogMSxcbiAgICBydW5uZXI6IHtcbiAgICAgICAgYmFja2VuZDogXCJvcGVuY29kZVwiLFxuICAgICAgICByZXZpZXc6IFwib3BlbmNvZGVcIixcbiAgICAgICAgYXJ0aWZhY3RzRGlyOiBcIi5haS1lbmcvcnVuc1wiLFxuICAgICAgICBtYXhJdGVyczogMyxcbiAgICAgICAgcHJpbnRMb2dzOiBmYWxzZSxcbiAgICAgICAgbG9nTGV2ZWw6IFwiSU5GT1wiLFxuICAgIH0sXG4gICAgbG9vcDoge1xuICAgICAgICBtYXhDeWNsZXM6IDUwLFxuICAgICAgICBjeWNsZVJldHJpZXM6IDIsXG4gICAgICAgIGNoZWNrcG9pbnRGcmVxdWVuY3k6IDEsXG4gICAgICAgIHN0dWNrVGhyZXNob2xkOiA1LFxuICAgIH0sXG4gICAgZGVidWc6IHtcbiAgICAgICAgd29yazogZmFsc2UsXG4gICAgfSxcbiAgICBvcGVuY29kZToge1xuICAgICAgICBtb2RlbDogXCJjbGF1ZGUtMy01LXNvbm5ldC1sYXRlc3RcIixcbiAgICAgICAgdGVtcGVyYXR1cmU6IDAuMixcbiAgICAgICAgc2VydmVyVXJsOiB1bmRlZmluZWQsXG4gICAgICAgIGRpcmVjdG9yeTogdW5kZWZpbmVkLFxuICAgICAgICBwcm9tcHRUaW1lb3V0TXM6IDEyMDAwMCxcbiAgICB9LFxuICAgIGFudGhyb3BpYzoge1xuICAgICAgICBlbmFibGVkOiBmYWxzZSxcbiAgICAgICAgbW9kZWw6IFwiY2xhdWRlLTMtNS1zb25uZXQtbGF0ZXN0XCIsXG4gICAgfSxcbiAgICBnYXRlczoge1xuICAgICAgICBsaW50OiB7IGNvbW1hbmQ6IFwiYnVuIHJ1biBsaW50XCIgfSxcbiAgICAgICAgdHlwZWNoZWNrOiB7IGNvbW1hbmQ6IFwiYnVuIHJ1biB0eXBlY2hlY2tcIiB9LFxuICAgICAgICB0ZXN0OiB7IGNvbW1hbmQ6IFwiYnVuIHRlc3RcIiB9LFxuICAgICAgICBidWlsZDogeyBjb21tYW5kOiBcImJ1biBydW4gYnVpbGRcIiB9LFxuICAgICAgICBhY2NlcHRhbmNlOiB7IGNvbW1hbmQ6IFwiZ2l0IGRpZmYgLS1uYW1lLW9ubHlcIiB9LFxuICAgIH0sXG4gICAgbW9kZWxzOiB7XG4gICAgICAgIHJlc2VhcmNoOiBcImdpdGh1Yi1jb3BpbG90L2dwdC01LjJcIixcbiAgICAgICAgcGxhbm5pbmc6IFwiZ2l0aHViLWNvcGlsb3QvZ3B0LTUuMlwiLFxuICAgICAgICBleHBsb3JhdGlvbjogXCJnaXRodWItY29waWxvdC9ncHQtNS4yXCIsXG4gICAgICAgIGNvZGluZzogXCJnaXRodWItY29waWxvdC9ncHQtNS4yXCIsXG4gICAgICAgIGRlZmF1bHQ6IFwiZ2l0aHViLWNvcGlsb3QvZ3B0LTUuMlwiLFxuICAgIH0sXG4gICAgbm90aWZpY2F0aW9uczoge1xuICAgICAgICBkaXNjb3JkOiB7XG4gICAgICAgICAgICBlbmFibGVkOiBmYWxzZSxcbiAgICAgICAgICAgIHVzZXJuYW1lOiBcIlJhbHBoXCIsXG4gICAgICAgICAgICBhdmF0YXJVcmw6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHdlYmhvb2s6IHtcbiAgICAgICAgICAgICAgICBzb3VyY2U6IFwiZW52XCIsXG4gICAgICAgICAgICAgICAgZW52VmFyOiBcIkRJU0NPUkRfV0VCSE9PS19VUkxcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgfSxcbiAgICB1aToge1xuICAgICAgICBzaWxlbnQ6IGZhbHNlLFxuICAgIH0sXG59O1xuIgogIF0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQUVBLElBQU0sUUFBUSxPQUFPLElBQUksWUFBWTtBQUFBLEVBQ3JDLElBQU0sTUFBTSxPQUFPLElBQUksZUFBZTtBQUFBLEVBQ3RDLElBQU0sTUFBTSxPQUFPLElBQUksVUFBVTtBQUFBLEVBQ2pDLElBQU0sT0FBTyxPQUFPLElBQUksV0FBVztBQUFBLEVBQ25DLElBQU0sU0FBUyxPQUFPLElBQUksYUFBYTtBQUFBLEVBQ3ZDLElBQU0sTUFBTSxPQUFPLElBQUksVUFBVTtBQUFBLEVBQ2pDLElBQU0sWUFBWSxPQUFPLElBQUksZ0JBQWdCO0FBQUEsRUFDN0MsSUFBTSxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsUUFBUSxPQUFPLFNBQVMsWUFBWSxLQUFLLGVBQWU7QUFBQSxFQUNwRixJQUFNLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxRQUFRLE9BQU8sU0FBUyxZQUFZLEtBQUssZUFBZTtBQUFBLEVBQ3ZGLElBQU0sUUFBUSxD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QztBQUFBLEVBQ0EsSUFBSSxNQUFNLHdCQUF3QixXQUFXO0FBQUEsSUFDekMsT0FBTyxLQUFLLHNCQUFzQixNQUFNO0FBQUEsRUFDNUM7QUFBQSxFQUNBLElBQUksTUFBTSxjQUFjLFdBQVc7QUFBQSxJQUMvQixPQUFPLE9BQU8sWUFBWSxNQUFNO0FBQUEsRUFDcEM7QUFBQSxFQUNBLElBQUksTUFBTSxhQUFhLFdBQVc7QUFBQSxJQUM5QixPQUFPLE9BQU8sV0FBVyxNQUFNO0FBQUEsRUFDbkM7QUFBQSxFQUNBLElBQUksTUFBTSxTQUFTO0FBQUEsSUFDZixPQUFPLE9BQU8sV0FBVztBQUFBLEVBQzdCO0FBQUEsRUFDQSxJQUFJLE1BQU0sZUFBZSxXQUFXO0FBQUEsSUFDaEMsT0FBTyxTQUFTLFlBQVksTUFBTTtBQUFBLEVBQ3RDO0FBQUEsRUFDQSxJQUFJLE1BQU0sV0FBVyxXQUFXLENBRWhDO0FBQUEsRUFFQSxPQUFPO0FBQUE7IiwKICAiZGVidWdJZCI6ICJGQzAyOUIyREE1NjM5NTlBNjQ3NTZFMjE2NDc1NkUyMSIsCiAgIm5hbWVzIjogW10KfQ==
