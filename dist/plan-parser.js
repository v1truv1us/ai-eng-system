import { createRequire } from "node:module";
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

// src/execution/plan-parser.ts
import { readFileSync } from "node:fs";

// node_modules/yaml/dist/index.js
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
var $Composer = composer.Composer;
var $Document = Document.Document;
var $Schema = Schema.Schema;
var $YAMLError = errors.YAMLError;
var $YAMLParseError = errors.YAMLParseError;
var $YAMLWarning = errors.YAMLWarning;
var $Alias = Alias.Alias;
var $isAlias = identity.isAlias;
var $isCollection = identity.isCollection;
var $isDocument = identity.isDocument;
var $isMap = identity.isMap;
var $isNode = identity.isNode;
var $isPair = identity.isPair;
var $isScalar = identity.isScalar;
var $isSeq = identity.isSeq;
var $Pair = Pair.Pair;
var $Scalar = Scalar.Scalar;
var $YAMLMap = YAMLMap.YAMLMap;
var $YAMLSeq = YAMLSeq.YAMLSeq;
var $Lexer = lexer.Lexer;
var $LineCounter = lineCounter.LineCounter;
var $Parser = parser.Parser;
var $parse = publicApi.parse;
var $parseAllDocuments = publicApi.parseAllDocuments;
var $parseDocument = publicApi.parseDocument;
var $stringify = publicApi.stringify;
var $visit = visit.visit;
var $visitAsync = visit.visitAsync;

// src/agents/types.ts
var AgentType;
((AgentType2) => {
  AgentType2["ARCHITECT_ADVISOR"] = "architect-advisor";
  AgentType2["BACKEND_ARCHITECT"] = "backend-architect";
  AgentType2["INFRASTRUCTURE_BUILDER"] = "infrastructure-builder";
  AgentType2["FRONTEND_REVIEWER"] = "frontend-reviewer";
  AgentType2["FULL_STACK_DEVELOPER"] = "full-stack-developer";
  AgentType2["API_BUILDER_ENHANCED"] = "api-builder-enhanced";
  AgentType2["DATABASE_OPTIMIZER"] = "database-optimizer";
  AgentType2["JAVA_PRO"] = "java-pro";
  AgentType2["CODE_REVIEWER"] = "code-reviewer";
  AgentType2["TEST_GENERATOR"] = "test-generator";
  AgentType2["SECURITY_SCANNER"] = "security-scanner";
  AgentType2["PERFORMANCE_ENGINEER"] = "performance-engineer";
  AgentType2["DEPLOYMENT_ENGINEER"] = "deployment-engineer";
  AgentType2["MONITORING_EXPERT"] = "monitoring-expert";
  AgentType2["COST_OPTIMIZER"] = "cost-optimizer";
  AgentType2["AI_ENGINEER"] = "ai-engineer";
  AgentType2["ML_ENGINEER"] = "ml-engineer";
  AgentType2["SEO_SPECIALIST"] = "seo-specialist";
  AgentType2["PROMPT_OPTIMIZER"] = "prompt-optimizer";
  AgentType2["AGENT_CREATOR"] = "agent-creator";
  AgentType2["COMMAND_CREATOR"] = "command-creator";
  AgentType2["SKILL_CREATOR"] = "skill-creator";
  AgentType2["TOOL_CREATOR"] = "tool-creator";
  AgentType2["PLUGIN_VALIDATOR"] = "plugin-validator";
})(AgentType ||= {});
var ExecutionStrategy;
((ExecutionStrategy2) => {
  ExecutionStrategy2["PARALLEL"] = "parallel";
  ExecutionStrategy2["SEQUENTIAL"] = "sequential";
  ExecutionStrategy2["CONDITIONAL"] = "conditional";
})(ExecutionStrategy ||= {});

// src/execution/types.ts
var TaskType;
((TaskType2) => {
  TaskType2["SHELL"] = "shell";
  TaskType2["LINT"] = "lint";
  TaskType2["TYPES"] = "types";
  TaskType2["TESTS"] = "tests";
  TaskType2["BUILD"] = "build";
  TaskType2["INTEGRATION"] = "integration";
  TaskType2["DEPLOY"] = "deploy";
})(TaskType ||= {});
var QualityGateType;
((QualityGateType2) => {
  QualityGateType2["LINT"] = "lint";
  QualityGateType2["TYPES"] = "types";
  QualityGateType2["TESTS"] = "tests";
  QualityGateType2["BUILD"] = "build";
  QualityGateType2["INTEGRATION"] = "integration";
  QualityGateType2["DEPLOY"] = "deploy";
})(QualityGateType ||= {});

// src/execution/plan-parser.ts
class PlanParser {
  errors = [];
  warnings = [];
  parseFile(filePath) {
    try {
      const content = readFileSync(filePath, "utf8");
      return this.parseContent(content, filePath);
    } catch (error) {
      throw new Error(`Failed to read plan file: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  parseContent(content, source) {
    this.errors = [];
    this.warnings = [];
    let rawPlan;
    try {
      rawPlan = $parse(content);
    } catch (error) {
      throw new Error(`Invalid YAML syntax: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
    this.validateTopLevelStructure(rawPlan);
    if (this.errors.length > 0) {
      throw new Error(`Plan validation failed:
${this.errors.map((e) => `  - ${e.message}`).join(`
`)}`);
    }
    const metadata = this.parseMetadata(rawPlan.metadata);
    const tasks = this.parseTasks(rawPlan.tasks || []);
    const qualityGates = this.parseQualityGates(rawPlan.qualityGates || []);
    this.validateTaskDependencies(tasks);
    if (this.errors.length > 0) {
      throw new Error(`Plan validation failed:
${this.errors.map((e) => `  - ${e.message}`).join(`
`)}`);
    }
    return {
      metadata,
      tasks,
      qualityGates,
      errors: this.errors,
      warnings: this.warnings
    };
  }
  getErrors() {
    return [...this.errors];
  }
  getWarnings() {
    return [...this.warnings];
  }
  validateTopLevelStructure(plan) {
    if (!plan || typeof plan !== "object") {
      this.errors.push({
        type: "type" /* TYPE */,
        message: "Plan must be an object",
        value: plan
      });
      return;
    }
    if (!plan.metadata) {
      this.errors.push({
        type: "required" /* REQUIRED */,
        message: "metadata section is required",
        path: "metadata"
      });
    }
    if (plan.tasks && !Array.isArray(plan.tasks)) {
      this.errors.push({
        type: "type" /* TYPE */,
        message: "tasks must be an array",
        path: "tasks",
        value: plan.tasks
      });
    }
    if (plan.qualityGates && !Array.isArray(plan.qualityGates)) {
      this.errors.push({
        type: "type" /* TYPE */,
        message: "qualityGates must be an array",
        path: "qualityGates",
        value: plan.qualityGates
      });
    }
  }
  parseMetadata(metadata) {
    if (!metadata || typeof metadata !== "object") {
      this.errors.push({
        type: "required" /* REQUIRED */,
        message: "metadata is required and must be an object",
        path: "metadata"
      });
      throw new Error("Invalid metadata");
    }
    if (!metadata.id || typeof metadata.id !== "string") {
      this.errors.push({
        type: "required" /* REQUIRED */,
        message: "metadata.id is required and must be a string",
        path: "metadata.id"
      });
    }
    if (!metadata.name || typeof metadata.name !== "string") {
      this.errors.push({
        type: "required" /* REQUIRED */,
        message: "metadata.name is required and must be a string",
        path: "metadata.name"
      });
    }
    if (!metadata.version || typeof metadata.version !== "string") {
      this.errors.push({
        type: "required" /* REQUIRED */,
        message: "metadata.version is required and must be a string",
        path: "metadata.version"
      });
    }
    if (metadata.version && !/^\d+\.\d+\.\d+/.test(metadata.version)) {
      this.warnings.push(`metadata.version "${metadata.version}" should follow semantic versioning (x.y.z)`);
    }
    return {
      id: metadata.id || "",
      name: metadata.name || "",
      description: metadata.description,
      version: metadata.version || "1.0.0",
      author: metadata.author,
      created: metadata.created,
      modified: metadata.modified,
      tags: Array.isArray(metadata.tags) ? metadata.tags : []
    };
  }
  parseTasks(tasks) {
    const parsedTasks = [];
    const taskIds = new Set;
    for (let i = 0;i < tasks.length; i++) {
      const taskData = tasks[i];
      if (!taskData || typeof taskData !== "object") {
        this.errors.push({
          type: "type" /* TYPE */,
          message: `Task at index ${i} must be an object`,
          path: `tasks[${i}]`,
          value: taskData
        });
        continue;
      }
      const task = this.parseTask(taskData, i);
      if (task) {
        if (taskIds.has(task.id)) {
          this.errors.push({
            type: "duplicate_id" /* DUPLICATE_ID */,
            message: `Duplicate task ID: ${task.id}`,
            path: `tasks[${i}].id`,
            value: task.id
          });
        } else {
          taskIds.add(task.id);
          parsedTasks.push(task);
        }
      }
    }
    return parsedTasks;
  }
  parseTask(taskData, index) {
    if (!taskData.id || typeof taskData.id !== "string") {
      this.errors.push({
        type: "required" /* REQUIRED */,
        message: `Task at index ${index} requires a valid id`,
        path: `tasks[${index}].id`
      });
      return null;
    }
    if (!taskData.name || typeof taskData.name !== "string") {
      this.errors.push({
        type: "required" /* REQUIRED */,
        message: `Task "${taskData.id}" requires a valid name`,
        path: `tasks[${index}].name`
      });
      return null;
    }
    if (!this.isAgentTaskType(taskData.type)) {
      if (!taskData.command || typeof taskData.command !== "string") {
        this.errors.push({
          type: "required" /* REQUIRED */,
          message: `Task "${taskData.id}" requires a valid command`,
          path: `tasks[${index}].command`
        });
        return null;
      }
    }
    let taskType = "shell" /* SHELL */;
    if (taskData.type) {
      if (!Object.values(TaskType).includes(taskData.type)) {
        if (this.isAgentTaskType(taskData.type)) {
          return this.parseAgentTask(taskData, index);
        }
        this.errors.push({
          type: "type" /* TYPE */,
          message: `Invalid task type "${taskData.type}" for task "${taskData.id}"`,
          path: `tasks[${index}].type`,
          value: taskData.type
        });
        return null;
      }
      taskType = taskData.type;
    }
    if (taskData.timeout !== undefined) {
      if (typeof taskData.timeout !== "number" || taskData.timeout <= 0) {
        this.errors.push({
          type: "range" /* RANGE */,
          message: `Task "${taskData.id}" timeout must be a positive number`,
          path: `tasks[${index}].timeout`,
          value: taskData.timeout
        });
      }
    }
    if (taskData.retry) {
      if (!taskData.retry.maxAttempts || typeof taskData.retry.maxAttempts !== "number" || taskData.retry.maxAttempts < 1) {
        this.errors.push({
          type: "range" /* RANGE */,
          message: `Task "${taskData.id}" retry.maxAttempts must be a positive number`,
          path: `tasks[${index}].retry.maxAttempts`,
          value: taskData.retry?.maxAttempts
        });
      }
      if (!taskData.retry.delay || typeof taskData.retry.delay !== "number" || taskData.retry.delay < 0) {
        this.errors.push({
          type: "range" /* RANGE */,
          message: `Task "${taskData.id}" retry.delay must be a non-negative number`,
          path: `tasks[${index}].retry.delay`,
          value: taskData.retry?.delay
        });
      }
    }
    return {
      id: taskData.id,
      name: taskData.name,
      description: taskData.description,
      type: taskType,
      command: taskData.command,
      workingDirectory: taskData.workingDirectory,
      environment: taskData.environment || {},
      dependsOn: Array.isArray(taskData.dependsOn) ? taskData.dependsOn : [],
      timeout: taskData.timeout,
      retry: taskData.retry
    };
  }
  parseQualityGates(gates) {
    const parsedGates = [];
    const gateIds = new Set;
    for (let i = 0;i < gates.length; i++) {
      const gateData = gates[i];
      if (!gateData || typeof gateData !== "object") {
        this.errors.push({
          type: "type" /* TYPE */,
          message: `Quality gate at index ${i} must be an object`,
          path: `qualityGates[${i}]`,
          value: gateData
        });
        continue;
      }
      const gate = this.parseQualityGate(gateData, i);
      if (gate) {
        if (gateIds.has(gate.id)) {
          this.errors.push({
            type: "duplicate_id" /* DUPLICATE_ID */,
            message: `Duplicate quality gate ID: ${gate.id}`,
            path: `qualityGates[${i}].id`,
            value: gate.id
          });
        } else {
          gateIds.add(gate.id);
          parsedGates.push(gate);
        }
      }
    }
    return parsedGates;
  }
  parseQualityGate(gateData, index) {
    if (!gateData.id || typeof gateData.id !== "string") {
      this.errors.push({
        type: "required" /* REQUIRED */,
        message: `Quality gate at index ${index} requires a valid id`,
        path: `qualityGates[${index}].id`
      });
      return null;
    }
    if (!gateData.name || typeof gateData.name !== "string") {
      this.errors.push({
        type: "required" /* REQUIRED */,
        message: `Quality gate "${gateData.id}" requires a valid name`,
        path: `qualityGates[${index}].name`
      });
      return null;
    }
    let gateType = "lint" /* LINT */;
    if (gateData.type) {
      if (!Object.values(QualityGateType).includes(gateData.type)) {
        this.errors.push({
          type: "type" /* TYPE */,
          message: `Invalid quality gate type "${gateData.type}" for gate "${gateData.id}"`,
          path: `qualityGates[${index}].type`,
          value: gateData.type
        });
        return null;
      }
      gateType = gateData.type;
    }
    return {
      id: gateData.id,
      name: gateData.name,
      description: gateData.description,
      type: gateType,
      required: gateData.required !== false,
      config: gateData.config || {},
      taskId: gateData.taskId
    };
  }
  validateTaskDependencies(tasks) {
    const taskIds = new Set(tasks.map((t) => t.id));
    for (const task of tasks) {
      if (task.dependsOn) {
        for (const depId of task.dependsOn) {
          if (!taskIds.has(depId)) {
            this.errors.push({
              type: "unknown_dependency" /* UNKNOWN_DEPENDENCY */,
              message: `Task "${task.id}" depends on unknown task "${depId}"`,
              path: `tasks.${task.id}.dependsOn`,
              value: depId
            });
          }
        }
      }
    }
    this.detectCircularDependencies(tasks);
  }
  detectCircularDependencies(tasks) {
    const visited = new Set;
    const recursionStack = new Set;
    const taskMap = new Map(tasks.map((t) => [t.id, t]));
    const visit2 = (taskId) => {
      if (recursionStack.has(taskId)) {
        const cycle = Array.from(recursionStack).concat(taskId).join(" -> ");
        this.errors.push({
          type: "circular_dependency" /* CIRCULAR_DEPENDENCY */,
          message: `Circular dependency detected: ${cycle}`,
          path: "tasks"
        });
        return true;
      }
      if (visited.has(taskId)) {
        return false;
      }
      visited.add(taskId);
      recursionStack.add(taskId);
      const task = taskMap.get(taskId);
      if (task?.dependsOn) {
        for (const depId of task.dependsOn) {
          if (visit2(depId)) {
            return true;
          }
        }
      }
      recursionStack.delete(taskId);
      return false;
    };
    for (const task of tasks) {
      if (!visited.has(task.id)) {
        visit2(task.id);
      }
    }
  }
  isAgentTaskType(type) {
    return Object.values(AgentType).includes(type);
  }
  parseAgentTask(taskData, index) {
    if (!taskData.type || !Object.values(AgentType).includes(taskData.type)) {
      this.errors.push({
        type: "type" /* TYPE */,
        message: `Invalid agent type "${taskData.type}" for task "${taskData.id}"`,
        path: `tasks[${index}].type`,
        value: taskData.type
      });
      return null;
    }
    if (!taskData.input || typeof taskData.input !== "object") {
      this.errors.push({
        type: "required" /* REQUIRED */,
        message: `Agent task "${taskData.id}" requires valid input`,
        path: `tasks[${index}].input`
      });
      return null;
    }
    if (!taskData.strategy || !Object.values(ExecutionStrategy).includes(taskData.strategy)) {
      this.errors.push({
        type: "required" /* REQUIRED */,
        message: `Agent task "${taskData.id}" requires valid execution strategy`,
        path: `tasks[${index}].strategy`,
        value: taskData.strategy
      });
      return null;
    }
    const agentInput = taskData.input;
    if (!agentInput.type || !Object.values(AgentType).includes(agentInput.type)) {
      this.errors.push({
        type: "required" /* REQUIRED */,
        message: `Agent task "${taskData.id}" input requires valid type`,
        path: `tasks[${index}].input.type`,
        value: agentInput.type
      });
      return null;
    }
    if (!agentInput.context || typeof agentInput.context !== "object") {
      this.errors.push({
        type: "required" /* REQUIRED */,
        message: `Agent task "${taskData.id}" input requires valid context`,
        path: `tasks[${index}].input.context`
      });
      return null;
    }
    if (taskData.timeout !== undefined) {
      if (typeof taskData.timeout !== "number" || taskData.timeout <= 0) {
        this.errors.push({
          type: "range" /* RANGE */,
          message: `Agent task "${taskData.id}" timeout must be a positive number`,
          path: `tasks[${index}].timeout`,
          value: taskData.timeout
        });
      }
    } else {
      taskData.timeout = 30000;
    }
    if (taskData.retry) {
      if (!taskData.retry.maxAttempts || typeof taskData.retry.maxAttempts !== "number" || taskData.retry.maxAttempts < 1) {
        this.errors.push({
          type: "range" /* RANGE */,
          message: `Agent task "${taskData.id}" retry.maxAttempts must be a positive number`,
          path: `tasks[${index}].retry.maxAttempts`,
          value: taskData.retry?.maxAttempts
        });
      }
      if (!taskData.retry.delay || typeof taskData.retry.delay !== "number" || taskData.retry.delay < 0) {
        this.errors.push({
          type: "range" /* RANGE */,
          message: `Agent task "${taskData.id}" retry.delay must be a non-negative number`,
          path: `tasks[${index}].retry.delay`,
          value: taskData.retry?.delay
        });
      }
    }
    return {
      id: taskData.id,
      type: taskData.type,
      name: taskData.name,
      description: taskData.description,
      input: {
        type: agentInput.type,
        context: agentInput.context || {},
        parameters: agentInput.parameters || {},
        timeout: agentInput.timeout
      },
      strategy: taskData.strategy,
      dependsOn: Array.isArray(taskData.dependsOn) ? taskData.dependsOn : [],
      timeout: taskData.timeout,
      retry: taskData.retry
    };
  }
  validateAgentTaskDependencies(tasks) {
    const taskIds = new Set(tasks.map((t) => t.id));
    const agentTaskIds = new Set(tasks.filter((t) => this.isAgentTask(t)).map((t) => t.id));
    for (const task of tasks) {
      if (this.isAgentTask(task) && task.dependsOn) {
        for (const depId of task.dependsOn) {
          if (!taskIds.has(depId)) {
            this.errors.push({
              type: "unknown_dependency" /* UNKNOWN_DEPENDENCY */,
              message: `Agent task "${task.id}" depends on unknown task "${depId}"`,
              path: `tasks.${task.id}.dependsOn`,
              value: depId
            });
          }
          const depTask = tasks.find((t) => t.id === depId);
          if (depTask && !this.isAgentTask(depTask)) {
            this.warnings.push(`Agent task "${task.id}" depends on shell task "${depId}". Consider using agent tasks for consistency.`);
          }
        }
      }
    }
    this.detectCircularDependencies(tasks);
  }
  isAgentTask(task) {
    return "type" in task && "input" in task && "strategy" in task;
  }
  getAgentTasks(plan) {
    return plan.tasks.filter((task) => this.isAgentTask(task));
  }
  getShellTasks(plan) {
    return plan.tasks.filter((task) => !this.isAgentTask(task));
  }
  validateAgentTaskConfiguration(plan) {
    const agentTasks = this.getAgentTasks(plan);
    const errors2 = [];
    const warnings = [];
    if (agentTasks.length > 0) {
      warnings.push(`Plan contains ${agentTasks.length} agent task(s). Agent coordinator must be configured.`);
    }
    for (const task of agentTasks) {
      if (!task.timeout || task.timeout < 5000) {
        warnings.push(`Agent task "${task.id}" has short or missing timeout. Consider setting at least 5 seconds.`);
      }
    }
    for (const task of agentTasks) {
      if (!task.retry) {
        warnings.push(`Agent task "${task.id}" has no retry configuration. Consider adding retry logic for reliability.`);
      }
    }
    return {
      isValid: errors2.length === 0,
      errors: errors2,
      warnings
    };
  }
}
export {
  PlanParser
};

//# debugId=23462C34279848D464756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9ub2Rlcy9pZGVudGl0eS5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3Zpc2l0LmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3QvZG9jL2RpcmVjdGl2ZXMuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9kb2MvYW5jaG9ycy5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L2RvYy9hcHBseVJldml2ZXIuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9ub2Rlcy90b0pTLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3Qvbm9kZXMvTm9kZS5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L25vZGVzL0FsaWFzLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3Qvbm9kZXMvU2NhbGFyLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3QvZG9jL2NyZWF0ZU5vZGUuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9ub2Rlcy9Db2xsZWN0aW9uLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3Qvc3RyaW5naWZ5L3N0cmluZ2lmeUNvbW1lbnQuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9zdHJpbmdpZnkvZm9sZEZsb3dMaW5lcy5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3N0cmluZ2lmeS9zdHJpbmdpZnlTdHJpbmcuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9zdHJpbmdpZnkvc3RyaW5naWZ5LmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3Qvc3RyaW5naWZ5L3N0cmluZ2lmeVBhaXIuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9sb2cuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9zY2hlbWEveWFtbC0xLjEvbWVyZ2UuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9ub2Rlcy9hZGRQYWlyVG9KU01hcC5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L25vZGVzL1BhaXIuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9zdHJpbmdpZnkvc3RyaW5naWZ5Q29sbGVjdGlvbi5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L25vZGVzL1lBTUxNYXAuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9zY2hlbWEvY29tbW9uL21hcC5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L25vZGVzL1lBTUxTZXEuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9zY2hlbWEvY29tbW9uL3NlcS5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3NjaGVtYS9jb21tb24vc3RyaW5nLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3Qvc2NoZW1hL2NvbW1vbi9udWxsLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3Qvc2NoZW1hL2NvcmUvYm9vbC5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3N0cmluZ2lmeS9zdHJpbmdpZnlOdW1iZXIuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9zY2hlbWEvY29yZS9mbG9hdC5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3NjaGVtYS9jb3JlL2ludC5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3NjaGVtYS9jb3JlL3NjaGVtYS5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3NjaGVtYS9qc29uL3NjaGVtYS5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3NjaGVtYS95YW1sLTEuMS9iaW5hcnkuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9zY2hlbWEveWFtbC0xLjEvcGFpcnMuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9zY2hlbWEveWFtbC0xLjEvb21hcC5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3NjaGVtYS95YW1sLTEuMS9ib29sLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3Qvc2NoZW1hL3lhbWwtMS4xL2Zsb2F0LmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3Qvc2NoZW1hL3lhbWwtMS4xL2ludC5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3NjaGVtYS95YW1sLTEuMS9zZXQuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9zY2hlbWEveWFtbC0xLjEvdGltZXN0YW1wLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3Qvc2NoZW1hL3lhbWwtMS4xL3NjaGVtYS5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3NjaGVtYS90YWdzLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3Qvc2NoZW1hL1NjaGVtYS5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3N0cmluZ2lmeS9zdHJpbmdpZnlEb2N1bWVudC5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L2RvYy9Eb2N1bWVudC5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L2Vycm9ycy5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L2NvbXBvc2UvcmVzb2x2ZS1wcm9wcy5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L2NvbXBvc2UvdXRpbC1jb250YWlucy1uZXdsaW5lLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3QvY29tcG9zZS91dGlsLWZsb3ctaW5kZW50LWNoZWNrLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3QvY29tcG9zZS91dGlsLW1hcC1pbmNsdWRlcy5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L2NvbXBvc2UvcmVzb2x2ZS1ibG9jay1tYXAuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9jb21wb3NlL3Jlc29sdmUtYmxvY2stc2VxLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3QvY29tcG9zZS9yZXNvbHZlLWVuZC5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L2NvbXBvc2UvcmVzb2x2ZS1mbG93LWNvbGxlY3Rpb24uanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9jb21wb3NlL2NvbXBvc2UtY29sbGVjdGlvbi5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L2NvbXBvc2UvcmVzb2x2ZS1ibG9jay1zY2FsYXIuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9jb21wb3NlL3Jlc29sdmUtZmxvdy1zY2FsYXIuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9jb21wb3NlL2NvbXBvc2Utc2NhbGFyLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3QvY29tcG9zZS91dGlsLWVtcHR5LXNjYWxhci1wb3NpdGlvbi5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L2NvbXBvc2UvY29tcG9zZS1ub2RlLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3QvY29tcG9zZS9jb21wb3NlLWRvYy5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L2NvbXBvc2UvY29tcG9zZXIuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9wYXJzZS9jc3Qtc2NhbGFyLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3QvcGFyc2UvY3N0LXN0cmluZ2lmeS5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3BhcnNlL2NzdC12aXNpdC5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3BhcnNlL2NzdC5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3BhcnNlL2xleGVyLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3QvcGFyc2UvbGluZS1jb3VudGVyLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3QvcGFyc2UvcGFyc2VyLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3QvcHVibGljLWFwaS5qcyIsICIuLi9zcmMvZXhlY3V0aW9uL3BsYW4tcGFyc2VyLnRzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3QvaW5kZXguanMiLCAiLi4vc3JjL2FnZW50cy90eXBlcy50cyIsICIuLi9zcmMvZXhlY3V0aW9uL3R5cGVzLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWwogICAgIid1c2Ugc3RyaWN0JztcblxuY29uc3QgQUxJQVMgPSBTeW1ib2wuZm9yKCd5YW1sLmFsaWFzJyk7XG5jb25zdCBET0MgPSBTeW1ib2wuZm9yKCd5YW1sLmRvY3VtZW50Jyk7XG5jb25zdCBNQVAgPSBTeW1ib2wuZm9yKCd5YW1sLm1hcCcpO1xuY29uc3QgUEFJUiA9IFN5bWJvbC5mb3IoJ3lhbWwucGFpcicpO1xuY29uc3QgU0NBTEFSID0gU3ltYm9sLmZvcigneWFtbC5zY2FsYXInKTtcbmNvbnN0IFNFUSA9IFN5bWJvbC5mb3IoJ3lhbWwuc2VxJyk7XG5jb25zdCBOT0RFX1RZUEUgPSBTeW1ib2wuZm9yKCd5YW1sLm5vZGUudHlwZScpO1xuY29uc3QgaXNBbGlhcyA9IChub2RlKSA9PiAhIW5vZGUgJiYgdHlwZW9mIG5vZGUgPT09ICdvYmplY3QnICYmIG5vZGVbTk9ERV9UWVBFXSA9PT0gQUxJQVM7XG5jb25zdCBpc0RvY3VtZW50ID0gKG5vZGUpID0+ICEhbm9kZSAmJiB0eXBlb2Ygbm9kZSA9PT0gJ29iamVjdCcgJiYgbm9kZVtOT0RFX1RZUEVdID09PSBET0M7XG5jb25zdCBpc01hcCA9IChub2RlKSA9PiAhIW5vZGUgJiYgdHlwZW9mIG5vZGUgPT09ICdvYmplY3QnICYmIG5vZGVbTk9ERV9UWVBFXSA9PT0gTUFQO1xuY29uc3QgaXNQYWlyID0gKG5vZGUpID0+ICEhbm9kZSAmJiB0eXBlb2Ygbm9kZSA9PT0gJ29iamVjdCcgJiYgbm9kZVtOT0RFX1RZUEVdID09PSBQQUlSO1xuY29uc3QgaXNTY2FsYXIgPSAobm9kZSkgPT4gISFub2RlICYmIHR5cGVvZiBub2RlID09PSAnb2JqZWN0JyAmJiBub2RlW05PREVfVFlQRV0gPT09IFNDQUxBUjtcbmNvbnN0IGlzU2VxID0gKG5vZGUpID0+ICEhbm9kZSAmJiB0eXBlb2Ygbm9kZSA9PT0gJ29iamVjdCcgJiYgbm9kZVtOT0RFX1RZUEVdID09PSBTRVE7XG5mdW5jdGlvbiBpc0NvbGxlY3Rpb24obm9kZSkge1xuICAgIGlmIChub2RlICYmIHR5cGVvZiBub2RlID09PSAnb2JqZWN0JylcbiAgICAgICAgc3dpdGNoIChub2RlW05PREVfVFlQRV0pIHtcbiAgICAgICAgICAgIGNhc2UgTUFQOlxuICAgICAgICAgICAgY2FzZSBTRVE6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5mdW5jdGlvbiBpc05vZGUobm9kZSkge1xuICAgIGlmIChub2RlICYmIHR5cGVvZiBub2RlID09PSAnb2JqZWN0JylcbiAgICAgICAgc3dpdGNoIChub2RlW05PREVfVFlQRV0pIHtcbiAgICAgICAgICAgIGNhc2UgQUxJQVM6XG4gICAgICAgICAgICBjYXNlIE1BUDpcbiAgICAgICAgICAgIGNhc2UgU0NBTEFSOlxuICAgICAgICAgICAgY2FzZSBTRVE6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5jb25zdCBoYXNBbmNob3IgPSAobm9kZSkgPT4gKGlzU2NhbGFyKG5vZGUpIHx8IGlzQ29sbGVjdGlvbihub2RlKSkgJiYgISFub2RlLmFuY2hvcjtcblxuZXhwb3J0cy5BTElBUyA9IEFMSUFTO1xuZXhwb3J0cy5ET0MgPSBET0M7XG5leHBvcnRzLk1BUCA9IE1BUDtcbmV4cG9ydHMuTk9ERV9UWVBFID0gTk9ERV9UWVBFO1xuZXhwb3J0cy5QQUlSID0gUEFJUjtcbmV4cG9ydHMuU0NBTEFSID0gU0NBTEFSO1xuZXhwb3J0cy5TRVEgPSBTRVE7XG5leHBvcnRzLmhhc0FuY2hvciA9IGhhc0FuY2hvcjtcbmV4cG9ydHMuaXNBbGlhcyA9IGlzQWxpYXM7XG5leHBvcnRzLmlzQ29sbGVjdGlvbiA9IGlzQ29sbGVjdGlvbjtcbmV4cG9ydHMuaXNEb2N1bWVudCA9IGlzRG9jdW1lbnQ7XG5leHBvcnRzLmlzTWFwID0gaXNNYXA7XG5leHBvcnRzLmlzTm9kZSA9IGlzTm9kZTtcbmV4cG9ydHMuaXNQYWlyID0gaXNQYWlyO1xuZXhwb3J0cy5pc1NjYWxhciA9IGlzU2NhbGFyO1xuZXhwb3J0cy5pc1NlcSA9IGlzU2VxO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBpZGVudGl0eSA9IHJlcXVpcmUoJy4vbm9kZXMvaWRlbnRpdHkuanMnKTtcblxuY29uc3QgQlJFQUsgPSBTeW1ib2woJ2JyZWFrIHZpc2l0Jyk7XG5jb25zdCBTS0lQID0gU3ltYm9sKCdza2lwIGNoaWxkcmVuJyk7XG5jb25zdCBSRU1PVkUgPSBTeW1ib2woJ3JlbW92ZSBub2RlJyk7XG4vKipcbiAqIEFwcGx5IGEgdmlzaXRvciB0byBhbiBBU1Qgbm9kZSBvciBkb2N1bWVudC5cbiAqXG4gKiBXYWxrcyB0aHJvdWdoIHRoZSB0cmVlIChkZXB0aC1maXJzdCkgc3RhcnRpbmcgZnJvbSBgbm9kZWAsIGNhbGxpbmcgYVxuICogYHZpc2l0b3JgIGZ1bmN0aW9uIHdpdGggdGhyZWUgYXJndW1lbnRzOlxuICogICAtIGBrZXlgOiBGb3Igc2VxdWVuY2UgdmFsdWVzIGFuZCBtYXAgYFBhaXJgLCB0aGUgbm9kZSdzIGluZGV4IGluIHRoZVxuICogICAgIGNvbGxlY3Rpb24uIFdpdGhpbiBhIGBQYWlyYCwgYCdrZXknYCBvciBgJ3ZhbHVlJ2AsIGNvcnJlc3BvbmRpbmdseS5cbiAqICAgICBgbnVsbGAgZm9yIHRoZSByb290IG5vZGUuXG4gKiAgIC0gYG5vZGVgOiBUaGUgY3VycmVudCBub2RlLlxuICogICAtIGBwYXRoYDogVGhlIGFuY2VzdHJ5IG9mIHRoZSBjdXJyZW50IG5vZGUuXG4gKlxuICogVGhlIHJldHVybiB2YWx1ZSBvZiB0aGUgdmlzaXRvciBtYXkgYmUgdXNlZCB0byBjb250cm9sIHRoZSB0cmF2ZXJzYWw6XG4gKiAgIC0gYHVuZGVmaW5lZGAgKGRlZmF1bHQpOiBEbyBub3RoaW5nIGFuZCBjb250aW51ZVxuICogICAtIGB2aXNpdC5TS0lQYDogRG8gbm90IHZpc2l0IHRoZSBjaGlsZHJlbiBvZiB0aGlzIG5vZGUsIGNvbnRpbnVlIHdpdGggbmV4dFxuICogICAgIHNpYmxpbmdcbiAqICAgLSBgdmlzaXQuQlJFQUtgOiBUZXJtaW5hdGUgdHJhdmVyc2FsIGNvbXBsZXRlbHlcbiAqICAgLSBgdmlzaXQuUkVNT1ZFYDogUmVtb3ZlIHRoZSBjdXJyZW50IG5vZGUsIHRoZW4gY29udGludWUgd2l0aCB0aGUgbmV4dCBvbmVcbiAqICAgLSBgTm9kZWA6IFJlcGxhY2UgdGhlIGN1cnJlbnQgbm9kZSwgdGhlbiBjb250aW51ZSBieSB2aXNpdGluZyBpdFxuICogICAtIGBudW1iZXJgOiBXaGlsZSBpdGVyYXRpbmcgdGhlIGl0ZW1zIG9mIGEgc2VxdWVuY2Ugb3IgbWFwLCBzZXQgdGhlIGluZGV4XG4gKiAgICAgb2YgdGhlIG5leHQgc3RlcC4gVGhpcyBpcyB1c2VmdWwgZXNwZWNpYWxseSBpZiB0aGUgaW5kZXggb2YgdGhlIGN1cnJlbnRcbiAqICAgICBub2RlIGhhcyBjaGFuZ2VkLlxuICpcbiAqIElmIGB2aXNpdG9yYCBpcyBhIHNpbmdsZSBmdW5jdGlvbiwgaXQgd2lsbCBiZSBjYWxsZWQgd2l0aCBhbGwgdmFsdWVzXG4gKiBlbmNvdW50ZXJlZCBpbiB0aGUgdHJlZSwgaW5jbHVkaW5nIGUuZy4gYG51bGxgIHZhbHVlcy4gQWx0ZXJuYXRpdmVseSxcbiAqIHNlcGFyYXRlIHZpc2l0b3IgZnVuY3Rpb25zIG1heSBiZSBkZWZpbmVkIGZvciBlYWNoIGBNYXBgLCBgUGFpcmAsIGBTZXFgLFxuICogYEFsaWFzYCBhbmQgYFNjYWxhcmAgbm9kZS4gVG8gZGVmaW5lIHRoZSBzYW1lIHZpc2l0b3IgZnVuY3Rpb24gZm9yIG1vcmUgdGhhblxuICogb25lIG5vZGUgdHlwZSwgdXNlIHRoZSBgQ29sbGVjdGlvbmAgKG1hcCBhbmQgc2VxKSwgYFZhbHVlYCAobWFwLCBzZXEgJiBzY2FsYXIpXG4gKiBhbmQgYE5vZGVgIChhbGlhcywgbWFwLCBzZXEgJiBzY2FsYXIpIHRhcmdldHMuIE9mIGFsbCB0aGVzZSwgb25seSB0aGUgbW9zdFxuICogc3BlY2lmaWMgZGVmaW5lZCBvbmUgd2lsbCBiZSB1c2VkIGZvciBlYWNoIG5vZGUuXG4gKi9cbmZ1bmN0aW9uIHZpc2l0KG5vZGUsIHZpc2l0b3IpIHtcbiAgICBjb25zdCB2aXNpdG9yXyA9IGluaXRWaXNpdG9yKHZpc2l0b3IpO1xuICAgIGlmIChpZGVudGl0eS5pc0RvY3VtZW50KG5vZGUpKSB7XG4gICAgICAgIGNvbnN0IGNkID0gdmlzaXRfKG51bGwsIG5vZGUuY29udGVudHMsIHZpc2l0b3JfLCBPYmplY3QuZnJlZXplKFtub2RlXSkpO1xuICAgICAgICBpZiAoY2QgPT09IFJFTU9WRSlcbiAgICAgICAgICAgIG5vZGUuY29udGVudHMgPSBudWxsO1xuICAgIH1cbiAgICBlbHNlXG4gICAgICAgIHZpc2l0XyhudWxsLCBub2RlLCB2aXNpdG9yXywgT2JqZWN0LmZyZWV6ZShbXSkpO1xufVxuLy8gV2l0aG91dCB0aGUgYGFzIHN5bWJvbGAgY2FzdHMsIFRTIGRlY2xhcmVzIHRoZXNlIGluIHRoZSBgdmlzaXRgXG4vLyBuYW1lc3BhY2UgdXNpbmcgYHZhcmAsIGJ1dCB0aGVuIGNvbXBsYWlucyBhYm91dCB0aGF0IGJlY2F1c2Vcbi8vIGB1bmlxdWUgc3ltYm9sYCBtdXN0IGJlIGBjb25zdGAuXG4vKiogVGVybWluYXRlIHZpc2l0IHRyYXZlcnNhbCBjb21wbGV0ZWx5ICovXG52aXNpdC5CUkVBSyA9IEJSRUFLO1xuLyoqIERvIG5vdCB2aXNpdCB0aGUgY2hpbGRyZW4gb2YgdGhlIGN1cnJlbnQgbm9kZSAqL1xudmlzaXQuU0tJUCA9IFNLSVA7XG4vKiogUmVtb3ZlIHRoZSBjdXJyZW50IG5vZGUgKi9cbnZpc2l0LlJFTU9WRSA9IFJFTU9WRTtcbmZ1bmN0aW9uIHZpc2l0XyhrZXksIG5vZGUsIHZpc2l0b3IsIHBhdGgpIHtcbiAgICBjb25zdCBjdHJsID0gY2FsbFZpc2l0b3Ioa2V5LCBub2RlLCB2aXNpdG9yLCBwYXRoKTtcbiAgICBpZiAoaWRlbnRpdHkuaXNOb2RlKGN0cmwpIHx8IGlkZW50aXR5LmlzUGFpcihjdHJsKSkge1xuICAgICAgICByZXBsYWNlTm9kZShrZXksIHBhdGgsIGN0cmwpO1xuICAgICAgICByZXR1cm4gdmlzaXRfKGtleSwgY3RybCwgdmlzaXRvciwgcGF0aCk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgY3RybCAhPT0gJ3N5bWJvbCcpIHtcbiAgICAgICAgaWYgKGlkZW50aXR5LmlzQ29sbGVjdGlvbihub2RlKSkge1xuICAgICAgICAgICAgcGF0aCA9IE9iamVjdC5mcmVlemUocGF0aC5jb25jYXQobm9kZSkpO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2RlLml0ZW1zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2kgPSB2aXNpdF8oaSwgbm9kZS5pdGVtc1tpXSwgdmlzaXRvciwgcGF0aCk7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjaSA9PT0gJ251bWJlcicpXG4gICAgICAgICAgICAgICAgICAgIGkgPSBjaSAtIDE7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoY2kgPT09IEJSRUFLKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQlJFQUs7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoY2kgPT09IFJFTU9WRSkge1xuICAgICAgICAgICAgICAgICAgICBub2RlLml0ZW1zLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgaSAtPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpZGVudGl0eS5pc1BhaXIobm9kZSkpIHtcbiAgICAgICAgICAgIHBhdGggPSBPYmplY3QuZnJlZXplKHBhdGguY29uY2F0KG5vZGUpKTtcbiAgICAgICAgICAgIGNvbnN0IGNrID0gdmlzaXRfKCdrZXknLCBub2RlLmtleSwgdmlzaXRvciwgcGF0aCk7XG4gICAgICAgICAgICBpZiAoY2sgPT09IEJSRUFLKVxuICAgICAgICAgICAgICAgIHJldHVybiBCUkVBSztcbiAgICAgICAgICAgIGVsc2UgaWYgKGNrID09PSBSRU1PVkUpXG4gICAgICAgICAgICAgICAgbm9kZS5rZXkgPSBudWxsO1xuICAgICAgICAgICAgY29uc3QgY3YgPSB2aXNpdF8oJ3ZhbHVlJywgbm9kZS52YWx1ZSwgdmlzaXRvciwgcGF0aCk7XG4gICAgICAgICAgICBpZiAoY3YgPT09IEJSRUFLKVxuICAgICAgICAgICAgICAgIHJldHVybiBCUkVBSztcbiAgICAgICAgICAgIGVsc2UgaWYgKGN2ID09PSBSRU1PVkUpXG4gICAgICAgICAgICAgICAgbm9kZS52YWx1ZSA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGN0cmw7XG59XG4vKipcbiAqIEFwcGx5IGFuIGFzeW5jIHZpc2l0b3IgdG8gYW4gQVNUIG5vZGUgb3IgZG9jdW1lbnQuXG4gKlxuICogV2Fsa3MgdGhyb3VnaCB0aGUgdHJlZSAoZGVwdGgtZmlyc3QpIHN0YXJ0aW5nIGZyb20gYG5vZGVgLCBjYWxsaW5nIGFcbiAqIGB2aXNpdG9yYCBmdW5jdGlvbiB3aXRoIHRocmVlIGFyZ3VtZW50czpcbiAqICAgLSBga2V5YDogRm9yIHNlcXVlbmNlIHZhbHVlcyBhbmQgbWFwIGBQYWlyYCwgdGhlIG5vZGUncyBpbmRleCBpbiB0aGVcbiAqICAgICBjb2xsZWN0aW9uLiBXaXRoaW4gYSBgUGFpcmAsIGAna2V5J2Agb3IgYCd2YWx1ZSdgLCBjb3JyZXNwb25kaW5nbHkuXG4gKiAgICAgYG51bGxgIGZvciB0aGUgcm9vdCBub2RlLlxuICogICAtIGBub2RlYDogVGhlIGN1cnJlbnQgbm9kZS5cbiAqICAgLSBgcGF0aGA6IFRoZSBhbmNlc3RyeSBvZiB0aGUgY3VycmVudCBub2RlLlxuICpcbiAqIFRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIHZpc2l0b3IgbWF5IGJlIHVzZWQgdG8gY29udHJvbCB0aGUgdHJhdmVyc2FsOlxuICogICAtIGBQcm9taXNlYDogTXVzdCByZXNvbHZlIHRvIG9uZSBvZiB0aGUgZm9sbG93aW5nIHZhbHVlc1xuICogICAtIGB1bmRlZmluZWRgIChkZWZhdWx0KTogRG8gbm90aGluZyBhbmQgY29udGludWVcbiAqICAgLSBgdmlzaXQuU0tJUGA6IERvIG5vdCB2aXNpdCB0aGUgY2hpbGRyZW4gb2YgdGhpcyBub2RlLCBjb250aW51ZSB3aXRoIG5leHRcbiAqICAgICBzaWJsaW5nXG4gKiAgIC0gYHZpc2l0LkJSRUFLYDogVGVybWluYXRlIHRyYXZlcnNhbCBjb21wbGV0ZWx5XG4gKiAgIC0gYHZpc2l0LlJFTU9WRWA6IFJlbW92ZSB0aGUgY3VycmVudCBub2RlLCB0aGVuIGNvbnRpbnVlIHdpdGggdGhlIG5leHQgb25lXG4gKiAgIC0gYE5vZGVgOiBSZXBsYWNlIHRoZSBjdXJyZW50IG5vZGUsIHRoZW4gY29udGludWUgYnkgdmlzaXRpbmcgaXRcbiAqICAgLSBgbnVtYmVyYDogV2hpbGUgaXRlcmF0aW5nIHRoZSBpdGVtcyBvZiBhIHNlcXVlbmNlIG9yIG1hcCwgc2V0IHRoZSBpbmRleFxuICogICAgIG9mIHRoZSBuZXh0IHN0ZXAuIFRoaXMgaXMgdXNlZnVsIGVzcGVjaWFsbHkgaWYgdGhlIGluZGV4IG9mIHRoZSBjdXJyZW50XG4gKiAgICAgbm9kZSBoYXMgY2hhbmdlZC5cbiAqXG4gKiBJZiBgdmlzaXRvcmAgaXMgYSBzaW5nbGUgZnVuY3Rpb24sIGl0IHdpbGwgYmUgY2FsbGVkIHdpdGggYWxsIHZhbHVlc1xuICogZW5jb3VudGVyZWQgaW4gdGhlIHRyZWUsIGluY2x1ZGluZyBlLmcuIGBudWxsYCB2YWx1ZXMuIEFsdGVybmF0aXZlbHksXG4gKiBzZXBhcmF0ZSB2aXNpdG9yIGZ1bmN0aW9ucyBtYXkgYmUgZGVmaW5lZCBmb3IgZWFjaCBgTWFwYCwgYFBhaXJgLCBgU2VxYCxcbiAqIGBBbGlhc2AgYW5kIGBTY2FsYXJgIG5vZGUuIFRvIGRlZmluZSB0aGUgc2FtZSB2aXNpdG9yIGZ1bmN0aW9uIGZvciBtb3JlIHRoYW5cbiAqIG9uZSBub2RlIHR5cGUsIHVzZSB0aGUgYENvbGxlY3Rpb25gIChtYXAgYW5kIHNlcSksIGBWYWx1ZWAgKG1hcCwgc2VxICYgc2NhbGFyKVxuICogYW5kIGBOb2RlYCAoYWxpYXMsIG1hcCwgc2VxICYgc2NhbGFyKSB0YXJnZXRzLiBPZiBhbGwgdGhlc2UsIG9ubHkgdGhlIG1vc3RcbiAqIHNwZWNpZmljIGRlZmluZWQgb25lIHdpbGwgYmUgdXNlZCBmb3IgZWFjaCBub2RlLlxuICovXG5hc3luYyBmdW5jdGlvbiB2aXNpdEFzeW5jKG5vZGUsIHZpc2l0b3IpIHtcbiAgICBjb25zdCB2aXNpdG9yXyA9IGluaXRWaXNpdG9yKHZpc2l0b3IpO1xuICAgIGlmIChpZGVudGl0eS5pc0RvY3VtZW50KG5vZGUpKSB7XG4gICAgICAgIGNvbnN0IGNkID0gYXdhaXQgdmlzaXRBc3luY18obnVsbCwgbm9kZS5jb250ZW50cywgdmlzaXRvcl8sIE9iamVjdC5mcmVlemUoW25vZGVdKSk7XG4gICAgICAgIGlmIChjZCA9PT0gUkVNT1ZFKVxuICAgICAgICAgICAgbm9kZS5jb250ZW50cyA9IG51bGw7XG4gICAgfVxuICAgIGVsc2VcbiAgICAgICAgYXdhaXQgdmlzaXRBc3luY18obnVsbCwgbm9kZSwgdmlzaXRvcl8sIE9iamVjdC5mcmVlemUoW10pKTtcbn1cbi8vIFdpdGhvdXQgdGhlIGBhcyBzeW1ib2xgIGNhc3RzLCBUUyBkZWNsYXJlcyB0aGVzZSBpbiB0aGUgYHZpc2l0YFxuLy8gbmFtZXNwYWNlIHVzaW5nIGB2YXJgLCBidXQgdGhlbiBjb21wbGFpbnMgYWJvdXQgdGhhdCBiZWNhdXNlXG4vLyBgdW5pcXVlIHN5bWJvbGAgbXVzdCBiZSBgY29uc3RgLlxuLyoqIFRlcm1pbmF0ZSB2aXNpdCB0cmF2ZXJzYWwgY29tcGxldGVseSAqL1xudmlzaXRBc3luYy5CUkVBSyA9IEJSRUFLO1xuLyoqIERvIG5vdCB2aXNpdCB0aGUgY2hpbGRyZW4gb2YgdGhlIGN1cnJlbnQgbm9kZSAqL1xudmlzaXRBc3luYy5TS0lQID0gU0tJUDtcbi8qKiBSZW1vdmUgdGhlIGN1cnJlbnQgbm9kZSAqL1xudmlzaXRBc3luYy5SRU1PVkUgPSBSRU1PVkU7XG5hc3luYyBmdW5jdGlvbiB2aXNpdEFzeW5jXyhrZXksIG5vZGUsIHZpc2l0b3IsIHBhdGgpIHtcbiAgICBjb25zdCBjdHJsID0gYXdhaXQgY2FsbFZpc2l0b3Ioa2V5LCBub2RlLCB2aXNpdG9yLCBwYXRoKTtcbiAgICBpZiAoaWRlbnRpdHkuaXNOb2RlKGN0cmwpIHx8IGlkZW50aXR5LmlzUGFpcihjdHJsKSkge1xuICAgICAgICByZXBsYWNlTm9kZShrZXksIHBhdGgsIGN0cmwpO1xuICAgICAgICByZXR1cm4gdmlzaXRBc3luY18oa2V5LCBjdHJsLCB2aXNpdG9yLCBwYXRoKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBjdHJsICE9PSAnc3ltYm9sJykge1xuICAgICAgICBpZiAoaWRlbnRpdHkuaXNDb2xsZWN0aW9uKG5vZGUpKSB7XG4gICAgICAgICAgICBwYXRoID0gT2JqZWN0LmZyZWV6ZShwYXRoLmNvbmNhdChub2RlKSk7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGUuaXRlbXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjaSA9IGF3YWl0IHZpc2l0QXN5bmNfKGksIG5vZGUuaXRlbXNbaV0sIHZpc2l0b3IsIHBhdGgpO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY2kgPT09ICdudW1iZXInKVxuICAgICAgICAgICAgICAgICAgICBpID0gY2kgLSAxO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNpID09PSBCUkVBSylcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEJSRUFLO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNpID09PSBSRU1PVkUpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5pdGVtcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGkgLT0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaWRlbnRpdHkuaXNQYWlyKG5vZGUpKSB7XG4gICAgICAgICAgICBwYXRoID0gT2JqZWN0LmZyZWV6ZShwYXRoLmNvbmNhdChub2RlKSk7XG4gICAgICAgICAgICBjb25zdCBjayA9IGF3YWl0IHZpc2l0QXN5bmNfKCdrZXknLCBub2RlLmtleSwgdmlzaXRvciwgcGF0aCk7XG4gICAgICAgICAgICBpZiAoY2sgPT09IEJSRUFLKVxuICAgICAgICAgICAgICAgIHJldHVybiBCUkVBSztcbiAgICAgICAgICAgIGVsc2UgaWYgKGNrID09PSBSRU1PVkUpXG4gICAgICAgICAgICAgICAgbm9kZS5rZXkgPSBudWxsO1xuICAgICAgICAgICAgY29uc3QgY3YgPSBhd2FpdCB2aXNpdEFzeW5jXygndmFsdWUnLCBub2RlLnZhbHVlLCB2aXNpdG9yLCBwYXRoKTtcbiAgICAgICAgICAgIGlmIChjdiA9PT0gQlJFQUspXG4gICAgICAgICAgICAgICAgcmV0dXJuIEJSRUFLO1xuICAgICAgICAgICAgZWxzZSBpZiAoY3YgPT09IFJFTU9WRSlcbiAgICAgICAgICAgICAgICBub2RlLnZhbHVlID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY3RybDtcbn1cbmZ1bmN0aW9uIGluaXRWaXNpdG9yKHZpc2l0b3IpIHtcbiAgICBpZiAodHlwZW9mIHZpc2l0b3IgPT09ICdvYmplY3QnICYmXG4gICAgICAgICh2aXNpdG9yLkNvbGxlY3Rpb24gfHwgdmlzaXRvci5Ob2RlIHx8IHZpc2l0b3IuVmFsdWUpKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgIEFsaWFzOiB2aXNpdG9yLk5vZGUsXG4gICAgICAgICAgICBNYXA6IHZpc2l0b3IuTm9kZSxcbiAgICAgICAgICAgIFNjYWxhcjogdmlzaXRvci5Ob2RlLFxuICAgICAgICAgICAgU2VxOiB2aXNpdG9yLk5vZGVcbiAgICAgICAgfSwgdmlzaXRvci5WYWx1ZSAmJiB7XG4gICAgICAgICAgICBNYXA6IHZpc2l0b3IuVmFsdWUsXG4gICAgICAgICAgICBTY2FsYXI6IHZpc2l0b3IuVmFsdWUsXG4gICAgICAgICAgICBTZXE6IHZpc2l0b3IuVmFsdWVcbiAgICAgICAgfSwgdmlzaXRvci5Db2xsZWN0aW9uICYmIHtcbiAgICAgICAgICAgIE1hcDogdmlzaXRvci5Db2xsZWN0aW9uLFxuICAgICAgICAgICAgU2VxOiB2aXNpdG9yLkNvbGxlY3Rpb25cbiAgICAgICAgfSwgdmlzaXRvcik7XG4gICAgfVxuICAgIHJldHVybiB2aXNpdG9yO1xufVxuZnVuY3Rpb24gY2FsbFZpc2l0b3Ioa2V5LCBub2RlLCB2aXNpdG9yLCBwYXRoKSB7XG4gICAgaWYgKHR5cGVvZiB2aXNpdG9yID09PSAnZnVuY3Rpb24nKVxuICAgICAgICByZXR1cm4gdmlzaXRvcihrZXksIG5vZGUsIHBhdGgpO1xuICAgIGlmIChpZGVudGl0eS5pc01hcChub2RlKSlcbiAgICAgICAgcmV0dXJuIHZpc2l0b3IuTWFwPy4oa2V5LCBub2RlLCBwYXRoKTtcbiAgICBpZiAoaWRlbnRpdHkuaXNTZXEobm9kZSkpXG4gICAgICAgIHJldHVybiB2aXNpdG9yLlNlcT8uKGtleSwgbm9kZSwgcGF0aCk7XG4gICAgaWYgKGlkZW50aXR5LmlzUGFpcihub2RlKSlcbiAgICAgICAgcmV0dXJuIHZpc2l0b3IuUGFpcj8uKGtleSwgbm9kZSwgcGF0aCk7XG4gICAgaWYgKGlkZW50aXR5LmlzU2NhbGFyKG5vZGUpKVxuICAgICAgICByZXR1cm4gdmlzaXRvci5TY2FsYXI/LihrZXksIG5vZGUsIHBhdGgpO1xuICAgIGlmIChpZGVudGl0eS5pc0FsaWFzKG5vZGUpKVxuICAgICAgICByZXR1cm4gdmlzaXRvci5BbGlhcz8uKGtleSwgbm9kZSwgcGF0aCk7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cbmZ1bmN0aW9uIHJlcGxhY2VOb2RlKGtleSwgcGF0aCwgbm9kZSkge1xuICAgIGNvbnN0IHBhcmVudCA9IHBhdGhbcGF0aC5sZW5ndGggLSAxXTtcbiAgICBpZiAoaWRlbnRpdHkuaXNDb2xsZWN0aW9uKHBhcmVudCkpIHtcbiAgICAgICAgcGFyZW50Lml0ZW1zW2tleV0gPSBub2RlO1xuICAgIH1cbiAgICBlbHNlIGlmIChpZGVudGl0eS5pc1BhaXIocGFyZW50KSkge1xuICAgICAgICBpZiAoa2V5ID09PSAna2V5JylcbiAgICAgICAgICAgIHBhcmVudC5rZXkgPSBub2RlO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBwYXJlbnQudmFsdWUgPSBub2RlO1xuICAgIH1cbiAgICBlbHNlIGlmIChpZGVudGl0eS5pc0RvY3VtZW50KHBhcmVudCkpIHtcbiAgICAgICAgcGFyZW50LmNvbnRlbnRzID0gbm9kZTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNvbnN0IHB0ID0gaWRlbnRpdHkuaXNBbGlhcyhwYXJlbnQpID8gJ2FsaWFzJyA6ICdzY2FsYXInO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCByZXBsYWNlIG5vZGUgd2l0aCAke3B0fSBwYXJlbnRgKTtcbiAgICB9XG59XG5cbmV4cG9ydHMudmlzaXQgPSB2aXNpdDtcbmV4cG9ydHMudmlzaXRBc3luYyA9IHZpc2l0QXN5bmM7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIGlkZW50aXR5ID0gcmVxdWlyZSgnLi4vbm9kZXMvaWRlbnRpdHkuanMnKTtcbnZhciB2aXNpdCA9IHJlcXVpcmUoJy4uL3Zpc2l0LmpzJyk7XG5cbmNvbnN0IGVzY2FwZUNoYXJzID0ge1xuICAgICchJzogJyUyMScsXG4gICAgJywnOiAnJTJDJyxcbiAgICAnWyc6ICclNUInLFxuICAgICddJzogJyU1RCcsXG4gICAgJ3snOiAnJTdCJyxcbiAgICAnfSc6ICclN0QnXG59O1xuY29uc3QgZXNjYXBlVGFnTmFtZSA9ICh0bikgPT4gdG4ucmVwbGFjZSgvWyEsW1xcXXt9XS9nLCBjaCA9PiBlc2NhcGVDaGFyc1tjaF0pO1xuY2xhc3MgRGlyZWN0aXZlcyB7XG4gICAgY29uc3RydWN0b3IoeWFtbCwgdGFncykge1xuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIGRpcmVjdGl2ZXMtZW5kL2RvYy1zdGFydCBtYXJrZXIgYC0tLWAuIElmIGBudWxsYCwgYSBtYXJrZXIgbWF5IHN0aWxsIGJlXG4gICAgICAgICAqIGluY2x1ZGVkIGluIHRoZSBkb2N1bWVudCdzIHN0cmluZ2lmaWVkIHJlcHJlc2VudGF0aW9uLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5kb2NTdGFydCA9IG51bGw7XG4gICAgICAgIC8qKiBUaGUgZG9jLWVuZCBtYXJrZXIgYC4uLmAuICAqL1xuICAgICAgICB0aGlzLmRvY0VuZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnlhbWwgPSBPYmplY3QuYXNzaWduKHt9LCBEaXJlY3RpdmVzLmRlZmF1bHRZYW1sLCB5YW1sKTtcbiAgICAgICAgdGhpcy50YWdzID0gT2JqZWN0LmFzc2lnbih7fSwgRGlyZWN0aXZlcy5kZWZhdWx0VGFncywgdGFncyk7XG4gICAgfVxuICAgIGNsb25lKCkge1xuICAgICAgICBjb25zdCBjb3B5ID0gbmV3IERpcmVjdGl2ZXModGhpcy55YW1sLCB0aGlzLnRhZ3MpO1xuICAgICAgICBjb3B5LmRvY1N0YXJ0ID0gdGhpcy5kb2NTdGFydDtcbiAgICAgICAgcmV0dXJuIGNvcHk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIER1cmluZyBwYXJzaW5nLCBnZXQgYSBEaXJlY3RpdmVzIGluc3RhbmNlIGZvciB0aGUgY3VycmVudCBkb2N1bWVudCBhbmRcbiAgICAgKiB1cGRhdGUgdGhlIHN0cmVhbSBzdGF0ZSBhY2NvcmRpbmcgdG8gdGhlIGN1cnJlbnQgdmVyc2lvbidzIHNwZWMuXG4gICAgICovXG4gICAgYXREb2N1bWVudCgpIHtcbiAgICAgICAgY29uc3QgcmVzID0gbmV3IERpcmVjdGl2ZXModGhpcy55YW1sLCB0aGlzLnRhZ3MpO1xuICAgICAgICBzd2l0Y2ggKHRoaXMueWFtbC52ZXJzaW9uKSB7XG4gICAgICAgICAgICBjYXNlICcxLjEnOlxuICAgICAgICAgICAgICAgIHRoaXMuYXROZXh0RG9jdW1lbnQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnMS4yJzpcbiAgICAgICAgICAgICAgICB0aGlzLmF0TmV4dERvY3VtZW50ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy55YW1sID0ge1xuICAgICAgICAgICAgICAgICAgICBleHBsaWNpdDogRGlyZWN0aXZlcy5kZWZhdWx0WWFtbC5leHBsaWNpdCxcbiAgICAgICAgICAgICAgICAgICAgdmVyc2lvbjogJzEuMidcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMudGFncyA9IE9iamVjdC5hc3NpZ24oe30sIERpcmVjdGl2ZXMuZGVmYXVsdFRhZ3MpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEBwYXJhbSBvbkVycm9yIC0gTWF5IGJlIGNhbGxlZCBldmVuIGlmIHRoZSBhY3Rpb24gd2FzIHN1Y2Nlc3NmdWxcbiAgICAgKiBAcmV0dXJucyBgdHJ1ZWAgb24gc3VjY2Vzc1xuICAgICAqL1xuICAgIGFkZChsaW5lLCBvbkVycm9yKSB7XG4gICAgICAgIGlmICh0aGlzLmF0TmV4dERvY3VtZW50KSB7XG4gICAgICAgICAgICB0aGlzLnlhbWwgPSB7IGV4cGxpY2l0OiBEaXJlY3RpdmVzLmRlZmF1bHRZYW1sLmV4cGxpY2l0LCB2ZXJzaW9uOiAnMS4xJyB9O1xuICAgICAgICAgICAgdGhpcy50YWdzID0gT2JqZWN0LmFzc2lnbih7fSwgRGlyZWN0aXZlcy5kZWZhdWx0VGFncyk7XG4gICAgICAgICAgICB0aGlzLmF0TmV4dERvY3VtZW50ID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcGFydHMgPSBsaW5lLnRyaW0oKS5zcGxpdCgvWyBcXHRdKy8pO1xuICAgICAgICBjb25zdCBuYW1lID0gcGFydHMuc2hpZnQoKTtcbiAgICAgICAgc3dpdGNoIChuYW1lKSB7XG4gICAgICAgICAgICBjYXNlICclVEFHJzoge1xuICAgICAgICAgICAgICAgIGlmIChwYXJ0cy5sZW5ndGggIT09IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcigwLCAnJVRBRyBkaXJlY3RpdmUgc2hvdWxkIGNvbnRhaW4gZXhhY3RseSB0d28gcGFydHMnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA8IDIpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IFtoYW5kbGUsIHByZWZpeF0gPSBwYXJ0cztcbiAgICAgICAgICAgICAgICB0aGlzLnRhZ3NbaGFuZGxlXSA9IHByZWZpeDtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgJyVZQU1MJzoge1xuICAgICAgICAgICAgICAgIHRoaXMueWFtbC5leHBsaWNpdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCAhPT0gMSkge1xuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKDAsICclWUFNTCBkaXJlY3RpdmUgc2hvdWxkIGNvbnRhaW4gZXhhY3RseSBvbmUgcGFydCcpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IFt2ZXJzaW9uXSA9IHBhcnRzO1xuICAgICAgICAgICAgICAgIGlmICh2ZXJzaW9uID09PSAnMS4xJyB8fCB2ZXJzaW9uID09PSAnMS4yJykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnlhbWwudmVyc2lvbiA9IHZlcnNpb247XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaXNWYWxpZCA9IC9eXFxkK1xcLlxcZCskLy50ZXN0KHZlcnNpb24pO1xuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKDYsIGBVbnN1cHBvcnRlZCBZQU1MIHZlcnNpb24gJHt2ZXJzaW9ufWAsIGlzVmFsaWQpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBvbkVycm9yKDAsIGBVbmtub3duIGRpcmVjdGl2ZSAke25hbWV9YCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlc29sdmVzIGEgdGFnLCBtYXRjaGluZyBoYW5kbGVzIHRvIHRob3NlIGRlZmluZWQgaW4gJVRBRyBkaXJlY3RpdmVzLlxuICAgICAqXG4gICAgICogQHJldHVybnMgUmVzb2x2ZWQgdGFnLCB3aGljaCBtYXkgYWxzbyBiZSB0aGUgbm9uLXNwZWNpZmljIHRhZyBgJyEnYCBvciBhXG4gICAgICogICBgJyFsb2NhbCdgIHRhZywgb3IgYG51bGxgIGlmIHVucmVzb2x2YWJsZS5cbiAgICAgKi9cbiAgICB0YWdOYW1lKHNvdXJjZSwgb25FcnJvcikge1xuICAgICAgICBpZiAoc291cmNlID09PSAnIScpXG4gICAgICAgICAgICByZXR1cm4gJyEnOyAvLyBub24tc3BlY2lmaWMgdGFnXG4gICAgICAgIGlmIChzb3VyY2VbMF0gIT09ICchJykge1xuICAgICAgICAgICAgb25FcnJvcihgTm90IGEgdmFsaWQgdGFnOiAke3NvdXJjZX1gKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzb3VyY2VbMV0gPT09ICc8Jykge1xuICAgICAgICAgICAgY29uc3QgdmVyYmF0aW0gPSBzb3VyY2Uuc2xpY2UoMiwgLTEpO1xuICAgICAgICAgICAgaWYgKHZlcmJhdGltID09PSAnIScgfHwgdmVyYmF0aW0gPT09ICchIScpIHtcbiAgICAgICAgICAgICAgICBvbkVycm9yKGBWZXJiYXRpbSB0YWdzIGFyZW4ndCByZXNvbHZlZCwgc28gJHtzb3VyY2V9IGlzIGludmFsaWQuYCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc291cmNlW3NvdXJjZS5sZW5ndGggLSAxXSAhPT0gJz4nKVxuICAgICAgICAgICAgICAgIG9uRXJyb3IoJ1ZlcmJhdGltIHRhZ3MgbXVzdCBlbmQgd2l0aCBhID4nKTtcbiAgICAgICAgICAgIHJldHVybiB2ZXJiYXRpbTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBbLCBoYW5kbGUsIHN1ZmZpeF0gPSBzb3VyY2UubWF0Y2goL14oLiohKShbXiFdKikkL3MpO1xuICAgICAgICBpZiAoIXN1ZmZpeClcbiAgICAgICAgICAgIG9uRXJyb3IoYFRoZSAke3NvdXJjZX0gdGFnIGhhcyBubyBzdWZmaXhgKTtcbiAgICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy50YWdzW2hhbmRsZV07XG4gICAgICAgIGlmIChwcmVmaXgpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByZWZpeCArIGRlY29kZVVSSUNvbXBvbmVudChzdWZmaXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgb25FcnJvcihTdHJpbmcoZXJyb3IpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoaGFuZGxlID09PSAnIScpXG4gICAgICAgICAgICByZXR1cm4gc291cmNlOyAvLyBsb2NhbCB0YWdcbiAgICAgICAgb25FcnJvcihgQ291bGQgbm90IHJlc29sdmUgdGFnOiAke3NvdXJjZX1gKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdpdmVuIGEgZnVsbHkgcmVzb2x2ZWQgdGFnLCByZXR1cm5zIGl0cyBwcmludGFibGUgc3RyaW5nIGZvcm0sXG4gICAgICogdGFraW5nIGludG8gYWNjb3VudCBjdXJyZW50IHRhZyBwcmVmaXhlcyBhbmQgZGVmYXVsdHMuXG4gICAgICovXG4gICAgdGFnU3RyaW5nKHRhZykge1xuICAgICAgICBmb3IgKGNvbnN0IFtoYW5kbGUsIHByZWZpeF0gb2YgT2JqZWN0LmVudHJpZXModGhpcy50YWdzKSkge1xuICAgICAgICAgICAgaWYgKHRhZy5zdGFydHNXaXRoKHByZWZpeCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZSArIGVzY2FwZVRhZ05hbWUodGFnLnN1YnN0cmluZyhwcmVmaXgubGVuZ3RoKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRhZ1swXSA9PT0gJyEnID8gdGFnIDogYCE8JHt0YWd9PmA7XG4gICAgfVxuICAgIHRvU3RyaW5nKGRvYykge1xuICAgICAgICBjb25zdCBsaW5lcyA9IHRoaXMueWFtbC5leHBsaWNpdFxuICAgICAgICAgICAgPyBbYCVZQU1MICR7dGhpcy55YW1sLnZlcnNpb24gfHwgJzEuMid9YF1cbiAgICAgICAgICAgIDogW107XG4gICAgICAgIGNvbnN0IHRhZ0VudHJpZXMgPSBPYmplY3QuZW50cmllcyh0aGlzLnRhZ3MpO1xuICAgICAgICBsZXQgdGFnTmFtZXM7XG4gICAgICAgIGlmIChkb2MgJiYgdGFnRW50cmllcy5sZW5ndGggPiAwICYmIGlkZW50aXR5LmlzTm9kZShkb2MuY29udGVudHMpKSB7XG4gICAgICAgICAgICBjb25zdCB0YWdzID0ge307XG4gICAgICAgICAgICB2aXNpdC52aXNpdChkb2MuY29udGVudHMsIChfa2V5LCBub2RlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGlkZW50aXR5LmlzTm9kZShub2RlKSAmJiBub2RlLnRhZylcbiAgICAgICAgICAgICAgICAgICAgdGFnc1tub2RlLnRhZ10gPSB0cnVlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0YWdOYW1lcyA9IE9iamVjdC5rZXlzKHRhZ3MpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRhZ05hbWVzID0gW107XG4gICAgICAgIGZvciAoY29uc3QgW2hhbmRsZSwgcHJlZml4XSBvZiB0YWdFbnRyaWVzKSB7XG4gICAgICAgICAgICBpZiAoaGFuZGxlID09PSAnISEnICYmIHByZWZpeCA9PT0gJ3RhZzp5YW1sLm9yZywyMDAyOicpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICBpZiAoIWRvYyB8fCB0YWdOYW1lcy5zb21lKHRuID0+IHRuLnN0YXJ0c1dpdGgocHJlZml4KSkpXG4gICAgICAgICAgICAgICAgbGluZXMucHVzaChgJVRBRyAke2hhbmRsZX0gJHtwcmVmaXh9YCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpO1xuICAgIH1cbn1cbkRpcmVjdGl2ZXMuZGVmYXVsdFlhbWwgPSB7IGV4cGxpY2l0OiBmYWxzZSwgdmVyc2lvbjogJzEuMicgfTtcbkRpcmVjdGl2ZXMuZGVmYXVsdFRhZ3MgPSB7ICchISc6ICd0YWc6eWFtbC5vcmcsMjAwMjonIH07XG5cbmV4cG9ydHMuRGlyZWN0aXZlcyA9IERpcmVjdGl2ZXM7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIGlkZW50aXR5ID0gcmVxdWlyZSgnLi4vbm9kZXMvaWRlbnRpdHkuanMnKTtcbnZhciB2aXNpdCA9IHJlcXVpcmUoJy4uL3Zpc2l0LmpzJyk7XG5cbi8qKlxuICogVmVyaWZ5IHRoYXQgdGhlIGlucHV0IHN0cmluZyBpcyBhIHZhbGlkIGFuY2hvci5cbiAqXG4gKiBXaWxsIHRocm93IG9uIGVycm9ycy5cbiAqL1xuZnVuY3Rpb24gYW5jaG9ySXNWYWxpZChhbmNob3IpIHtcbiAgICBpZiAoL1tcXHgwMC1cXHgxOVxccyxbXFxde31dLy50ZXN0KGFuY2hvcikpIHtcbiAgICAgICAgY29uc3Qgc2EgPSBKU09OLnN0cmluZ2lmeShhbmNob3IpO1xuICAgICAgICBjb25zdCBtc2cgPSBgQW5jaG9yIG11c3Qgbm90IGNvbnRhaW4gd2hpdGVzcGFjZSBvciBjb250cm9sIGNoYXJhY3RlcnM6ICR7c2F9YDtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZyk7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufVxuZnVuY3Rpb24gYW5jaG9yTmFtZXMocm9vdCkge1xuICAgIGNvbnN0IGFuY2hvcnMgPSBuZXcgU2V0KCk7XG4gICAgdmlzaXQudmlzaXQocm9vdCwge1xuICAgICAgICBWYWx1ZShfa2V5LCBub2RlKSB7XG4gICAgICAgICAgICBpZiAobm9kZS5hbmNob3IpXG4gICAgICAgICAgICAgICAgYW5jaG9ycy5hZGQobm9kZS5hbmNob3IpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGFuY2hvcnM7XG59XG4vKiogRmluZCBhIG5ldyBhbmNob3IgbmFtZSB3aXRoIHRoZSBnaXZlbiBgcHJlZml4YCBhbmQgYSBvbmUtaW5kZXhlZCBzdWZmaXguICovXG5mdW5jdGlvbiBmaW5kTmV3QW5jaG9yKHByZWZpeCwgZXhjbHVkZSkge1xuICAgIGZvciAobGV0IGkgPSAxOyB0cnVlOyArK2kpIHtcbiAgICAgICAgY29uc3QgbmFtZSA9IGAke3ByZWZpeH0ke2l9YDtcbiAgICAgICAgaWYgKCFleGNsdWRlLmhhcyhuYW1lKSlcbiAgICAgICAgICAgIHJldHVybiBuYW1lO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGNyZWF0ZU5vZGVBbmNob3JzKGRvYywgcHJlZml4KSB7XG4gICAgY29uc3QgYWxpYXNPYmplY3RzID0gW107XG4gICAgY29uc3Qgc291cmNlT2JqZWN0cyA9IG5ldyBNYXAoKTtcbiAgICBsZXQgcHJldkFuY2hvcnMgPSBudWxsO1xuICAgIHJldHVybiB7XG4gICAgICAgIG9uQW5jaG9yOiAoc291cmNlKSA9PiB7XG4gICAgICAgICAgICBhbGlhc09iamVjdHMucHVzaChzb3VyY2UpO1xuICAgICAgICAgICAgcHJldkFuY2hvcnMgPz8gKHByZXZBbmNob3JzID0gYW5jaG9yTmFtZXMoZG9jKSk7XG4gICAgICAgICAgICBjb25zdCBhbmNob3IgPSBmaW5kTmV3QW5jaG9yKHByZWZpeCwgcHJldkFuY2hvcnMpO1xuICAgICAgICAgICAgcHJldkFuY2hvcnMuYWRkKGFuY2hvcik7XG4gICAgICAgICAgICByZXR1cm4gYW5jaG9yO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogV2l0aCBjaXJjdWxhciByZWZlcmVuY2VzLCB0aGUgc291cmNlIG5vZGUgaXMgb25seSByZXNvbHZlZCBhZnRlciBhbGxcbiAgICAgICAgICogb2YgaXRzIGNoaWxkIG5vZGVzIGFyZS4gVGhpcyBpcyB3aHkgYW5jaG9ycyBhcmUgc2V0IG9ubHkgYWZ0ZXIgYWxsIG9mXG4gICAgICAgICAqIHRoZSBub2RlcyBoYXZlIGJlZW4gY3JlYXRlZC5cbiAgICAgICAgICovXG4gICAgICAgIHNldEFuY2hvcnM6ICgpID0+IHtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgc291cmNlIG9mIGFsaWFzT2JqZWN0cykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlZiA9IHNvdXJjZU9iamVjdHMuZ2V0KHNvdXJjZSk7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiByZWYgPT09ICdvYmplY3QnICYmXG4gICAgICAgICAgICAgICAgICAgIHJlZi5hbmNob3IgJiZcbiAgICAgICAgICAgICAgICAgICAgKGlkZW50aXR5LmlzU2NhbGFyKHJlZi5ub2RlKSB8fCBpZGVudGl0eS5pc0NvbGxlY3Rpb24ocmVmLm5vZGUpKSkge1xuICAgICAgICAgICAgICAgICAgICByZWYubm9kZS5hbmNob3IgPSByZWYuYW5jaG9yO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBuZXcgRXJyb3IoJ0ZhaWxlZCB0byByZXNvbHZlIHJlcGVhdGVkIG9iamVjdCAodGhpcyBzaG91bGQgbm90IGhhcHBlbiknKTtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3Iuc291cmNlID0gc291cmNlO1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHNvdXJjZU9iamVjdHNcbiAgICB9O1xufVxuXG5leHBvcnRzLmFuY2hvcklzVmFsaWQgPSBhbmNob3JJc1ZhbGlkO1xuZXhwb3J0cy5hbmNob3JOYW1lcyA9IGFuY2hvck5hbWVzO1xuZXhwb3J0cy5jcmVhdGVOb2RlQW5jaG9ycyA9IGNyZWF0ZU5vZGVBbmNob3JzO1xuZXhwb3J0cy5maW5kTmV3QW5jaG9yID0gZmluZE5ld0FuY2hvcjtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEFwcGxpZXMgdGhlIEpTT04ucGFyc2UgcmV2aXZlciBhbGdvcml0aG0gYXMgZGVmaW5lZCBpbiB0aGUgRUNNQS0yNjIgc3BlYyxcbiAqIGluIHNlY3Rpb24gMjQuNS4xLjEgXCJSdW50aW1lIFNlbWFudGljczogSW50ZXJuYWxpemVKU09OUHJvcGVydHlcIiBvZiB0aGVcbiAqIDIwMjEgZWRpdGlvbjogaHR0cHM6Ly90YzM5LmVzL2VjbWEyNjIvI3NlYy1qc29uLnBhcnNlXG4gKlxuICogSW5jbHVkZXMgZXh0ZW5zaW9ucyBmb3IgaGFuZGxpbmcgTWFwIGFuZCBTZXQgb2JqZWN0cy5cbiAqL1xuZnVuY3Rpb24gYXBwbHlSZXZpdmVyKHJldml2ZXIsIG9iaiwga2V5LCB2YWwpIHtcbiAgICBpZiAodmFsICYmIHR5cGVvZiB2YWwgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbCkpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSB2YWwubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2MCA9IHZhbFtpXTtcbiAgICAgICAgICAgICAgICBjb25zdCB2MSA9IGFwcGx5UmV2aXZlcihyZXZpdmVyLCB2YWwsIFN0cmluZyhpKSwgdjApO1xuICAgICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tYXJyYXktZGVsZXRlXG4gICAgICAgICAgICAgICAgaWYgKHYxID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB2YWxbaV07XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodjEgIT09IHYwKVxuICAgICAgICAgICAgICAgICAgICB2YWxbaV0gPSB2MTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh2YWwgaW5zdGFuY2VvZiBNYXApIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgayBvZiBBcnJheS5mcm9tKHZhbC5rZXlzKCkpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdjAgPSB2YWwuZ2V0KGspO1xuICAgICAgICAgICAgICAgIGNvbnN0IHYxID0gYXBwbHlSZXZpdmVyKHJldml2ZXIsIHZhbCwgaywgdjApO1xuICAgICAgICAgICAgICAgIGlmICh2MSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgICB2YWwuZGVsZXRlKGspO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHYxICE9PSB2MClcbiAgICAgICAgICAgICAgICAgICAgdmFsLnNldChrLCB2MSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodmFsIGluc3RhbmNlb2YgU2V0KSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHYwIG9mIEFycmF5LmZyb20odmFsKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHYxID0gYXBwbHlSZXZpdmVyKHJldml2ZXIsIHZhbCwgdjAsIHYwKTtcbiAgICAgICAgICAgICAgICBpZiAodjEgPT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICAgICAgdmFsLmRlbGV0ZSh2MCk7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodjEgIT09IHYwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbC5kZWxldGUodjApO1xuICAgICAgICAgICAgICAgICAgICB2YWwuYWRkKHYxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IFtrLCB2MF0gb2YgT2JqZWN0LmVudHJpZXModmFsKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHYxID0gYXBwbHlSZXZpdmVyKHJldml2ZXIsIHZhbCwgaywgdjApO1xuICAgICAgICAgICAgICAgIGlmICh2MSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgdmFsW2tdO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHYxICE9PSB2MClcbiAgICAgICAgICAgICAgICAgICAgdmFsW2tdID0gdjE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJldml2ZXIuY2FsbChvYmosIGtleSwgdmFsKTtcbn1cblxuZXhwb3J0cy5hcHBseVJldml2ZXIgPSBhcHBseVJldml2ZXI7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIGlkZW50aXR5ID0gcmVxdWlyZSgnLi9pZGVudGl0eS5qcycpO1xuXG4vKipcbiAqIFJlY3Vyc2l2ZWx5IGNvbnZlcnQgYW55IG5vZGUgb3IgaXRzIGNvbnRlbnRzIHRvIG5hdGl2ZSBKYXZhU2NyaXB0XG4gKlxuICogQHBhcmFtIHZhbHVlIC0gVGhlIGlucHV0IHZhbHVlXG4gKiBAcGFyYW0gYXJnIC0gSWYgYHZhbHVlYCBkZWZpbmVzIGEgYHRvSlNPTigpYCBtZXRob2QsIHVzZSB0aGlzXG4gKiAgIGFzIGl0cyBmaXJzdCBhcmd1bWVudFxuICogQHBhcmFtIGN0eCAtIENvbnZlcnNpb24gY29udGV4dCwgb3JpZ2luYWxseSBzZXQgaW4gRG9jdW1lbnQjdG9KUygpLiBJZlxuICogICBgeyBrZWVwOiB0cnVlIH1gIGlzIG5vdCBzZXQsIG91dHB1dCBzaG91bGQgYmUgc3VpdGFibGUgZm9yIEpTT05cbiAqICAgc3RyaW5naWZpY2F0aW9uLlxuICovXG5mdW5jdGlvbiB0b0pTKHZhbHVlLCBhcmcsIGN0eCkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW5zYWZlLXJldHVyblxuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSlcbiAgICAgICAgcmV0dXJuIHZhbHVlLm1hcCgodiwgaSkgPT4gdG9KUyh2LCBTdHJpbmcoaSksIGN0eCkpO1xuICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUudG9KU09OID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW5zYWZlLWNhbGxcbiAgICAgICAgaWYgKCFjdHggfHwgIWlkZW50aXR5Lmhhc0FuY2hvcih2YWx1ZSkpXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUudG9KU09OKGFyZywgY3R4KTtcbiAgICAgICAgY29uc3QgZGF0YSA9IHsgYWxpYXNDb3VudDogMCwgY291bnQ6IDEsIHJlczogdW5kZWZpbmVkIH07XG4gICAgICAgIGN0eC5hbmNob3JzLnNldCh2YWx1ZSwgZGF0YSk7XG4gICAgICAgIGN0eC5vbkNyZWF0ZSA9IHJlcyA9PiB7XG4gICAgICAgICAgICBkYXRhLnJlcyA9IHJlcztcbiAgICAgICAgICAgIGRlbGV0ZSBjdHgub25DcmVhdGU7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHJlcyA9IHZhbHVlLnRvSlNPTihhcmcsIGN0eCk7XG4gICAgICAgIGlmIChjdHgub25DcmVhdGUpXG4gICAgICAgICAgICBjdHgub25DcmVhdGUocmVzKTtcbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2JpZ2ludCcgJiYgIWN0eD8ua2VlcClcbiAgICAgICAgcmV0dXJuIE51bWJlcih2YWx1ZSk7XG4gICAgcmV0dXJuIHZhbHVlO1xufVxuXG5leHBvcnRzLnRvSlMgPSB0b0pTO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBhcHBseVJldml2ZXIgPSByZXF1aXJlKCcuLi9kb2MvYXBwbHlSZXZpdmVyLmpzJyk7XG52YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuL2lkZW50aXR5LmpzJyk7XG52YXIgdG9KUyA9IHJlcXVpcmUoJy4vdG9KUy5qcycpO1xuXG5jbGFzcyBOb2RlQmFzZSB7XG4gICAgY29uc3RydWN0b3IodHlwZSkge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgaWRlbnRpdHkuTk9ERV9UWVBFLCB7IHZhbHVlOiB0eXBlIH0pO1xuICAgIH1cbiAgICAvKiogQ3JlYXRlIGEgY29weSBvZiB0aGlzIG5vZGUuICAqL1xuICAgIGNsb25lKCkge1xuICAgICAgICBjb25zdCBjb3B5ID0gT2JqZWN0LmNyZWF0ZShPYmplY3QuZ2V0UHJvdG90eXBlT2YodGhpcyksIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHRoaXMpKTtcbiAgICAgICAgaWYgKHRoaXMucmFuZ2UpXG4gICAgICAgICAgICBjb3B5LnJhbmdlID0gdGhpcy5yYW5nZS5zbGljZSgpO1xuICAgICAgICByZXR1cm4gY29weTtcbiAgICB9XG4gICAgLyoqIEEgcGxhaW4gSmF2YVNjcmlwdCByZXByZXNlbnRhdGlvbiBvZiB0aGlzIG5vZGUuICovXG4gICAgdG9KUyhkb2MsIHsgbWFwQXNNYXAsIG1heEFsaWFzQ291bnQsIG9uQW5jaG9yLCByZXZpdmVyIH0gPSB7fSkge1xuICAgICAgICBpZiAoIWlkZW50aXR5LmlzRG9jdW1lbnQoZG9jKSlcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0EgZG9jdW1lbnQgYXJndW1lbnQgaXMgcmVxdWlyZWQnKTtcbiAgICAgICAgY29uc3QgY3R4ID0ge1xuICAgICAgICAgICAgYW5jaG9yczogbmV3IE1hcCgpLFxuICAgICAgICAgICAgZG9jLFxuICAgICAgICAgICAga2VlcDogdHJ1ZSxcbiAgICAgICAgICAgIG1hcEFzTWFwOiBtYXBBc01hcCA9PT0gdHJ1ZSxcbiAgICAgICAgICAgIG1hcEtleVdhcm5lZDogZmFsc2UsXG4gICAgICAgICAgICBtYXhBbGlhc0NvdW50OiB0eXBlb2YgbWF4QWxpYXNDb3VudCA9PT0gJ251bWJlcicgPyBtYXhBbGlhc0NvdW50IDogMTAwXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHJlcyA9IHRvSlMudG9KUyh0aGlzLCAnJywgY3R4KTtcbiAgICAgICAgaWYgKHR5cGVvZiBvbkFuY2hvciA9PT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgICAgIGZvciAoY29uc3QgeyBjb3VudCwgcmVzIH0gb2YgY3R4LmFuY2hvcnMudmFsdWVzKCkpXG4gICAgICAgICAgICAgICAgb25BbmNob3IocmVzLCBjb3VudCk7XG4gICAgICAgIHJldHVybiB0eXBlb2YgcmV2aXZlciA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgPyBhcHBseVJldml2ZXIuYXBwbHlSZXZpdmVyKHJldml2ZXIsIHsgJyc6IHJlcyB9LCAnJywgcmVzKVxuICAgICAgICAgICAgOiByZXM7XG4gICAgfVxufVxuXG5leHBvcnRzLk5vZGVCYXNlID0gTm9kZUJhc2U7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIGFuY2hvcnMgPSByZXF1aXJlKCcuLi9kb2MvYW5jaG9ycy5qcycpO1xudmFyIHZpc2l0ID0gcmVxdWlyZSgnLi4vdmlzaXQuanMnKTtcbnZhciBpZGVudGl0eSA9IHJlcXVpcmUoJy4vaWRlbnRpdHkuanMnKTtcbnZhciBOb2RlID0gcmVxdWlyZSgnLi9Ob2RlLmpzJyk7XG52YXIgdG9KUyA9IHJlcXVpcmUoJy4vdG9KUy5qcycpO1xuXG5jbGFzcyBBbGlhcyBleHRlbmRzIE5vZGUuTm9kZUJhc2Uge1xuICAgIGNvbnN0cnVjdG9yKHNvdXJjZSkge1xuICAgICAgICBzdXBlcihpZGVudGl0eS5BTElBUyk7XG4gICAgICAgIHRoaXMuc291cmNlID0gc291cmNlO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3RhZycsIHtcbiAgICAgICAgICAgIHNldCgpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0FsaWFzIG5vZGVzIGNhbm5vdCBoYXZlIHRhZ3MnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlc29sdmUgdGhlIHZhbHVlIG9mIHRoaXMgYWxpYXMgd2l0aGluIGBkb2NgLCBmaW5kaW5nIHRoZSBsYXN0XG4gICAgICogaW5zdGFuY2Ugb2YgdGhlIGBzb3VyY2VgIGFuY2hvciBiZWZvcmUgdGhpcyBub2RlLlxuICAgICAqL1xuICAgIHJlc29sdmUoZG9jLCBjdHgpIHtcbiAgICAgICAgbGV0IG5vZGVzO1xuICAgICAgICBpZiAoY3R4Py5hbGlhc1Jlc29sdmVDYWNoZSkge1xuICAgICAgICAgICAgbm9kZXMgPSBjdHguYWxpYXNSZXNvbHZlQ2FjaGU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBub2RlcyA9IFtdO1xuICAgICAgICAgICAgdmlzaXQudmlzaXQoZG9jLCB7XG4gICAgICAgICAgICAgICAgTm9kZTogKF9rZXksIG5vZGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlkZW50aXR5LmlzQWxpYXMobm9kZSkgfHwgaWRlbnRpdHkuaGFzQW5jaG9yKG5vZGUpKVxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXMucHVzaChub2RlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChjdHgpXG4gICAgICAgICAgICAgICAgY3R4LmFsaWFzUmVzb2x2ZUNhY2hlID0gbm9kZXM7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGZvdW5kID0gdW5kZWZpbmVkO1xuICAgICAgICBmb3IgKGNvbnN0IG5vZGUgb2Ygbm9kZXMpIHtcbiAgICAgICAgICAgIGlmIChub2RlID09PSB0aGlzKVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgaWYgKG5vZGUuYW5jaG9yID09PSB0aGlzLnNvdXJjZSlcbiAgICAgICAgICAgICAgICBmb3VuZCA9IG5vZGU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZvdW5kO1xuICAgIH1cbiAgICB0b0pTT04oX2FyZywgY3R4KSB7XG4gICAgICAgIGlmICghY3R4KVxuICAgICAgICAgICAgcmV0dXJuIHsgc291cmNlOiB0aGlzLnNvdXJjZSB9O1xuICAgICAgICBjb25zdCB7IGFuY2hvcnMsIGRvYywgbWF4QWxpYXNDb3VudCB9ID0gY3R4O1xuICAgICAgICBjb25zdCBzb3VyY2UgPSB0aGlzLnJlc29sdmUoZG9jLCBjdHgpO1xuICAgICAgICBpZiAoIXNvdXJjZSkge1xuICAgICAgICAgICAgY29uc3QgbXNnID0gYFVucmVzb2x2ZWQgYWxpYXMgKHRoZSBhbmNob3IgbXVzdCBiZSBzZXQgYmVmb3JlIHRoZSBhbGlhcyk6ICR7dGhpcy5zb3VyY2V9YDtcbiAgICAgICAgICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihtc2cpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBkYXRhID0gYW5jaG9ycy5nZXQoc291cmNlKTtcbiAgICAgICAgaWYgKCFkYXRhKSB7XG4gICAgICAgICAgICAvLyBSZXNvbHZlIGFuY2hvcnMgZm9yIE5vZGUucHJvdG90eXBlLnRvSlMoKVxuICAgICAgICAgICAgdG9KUy50b0pTKHNvdXJjZSwgbnVsbCwgY3R4KTtcbiAgICAgICAgICAgIGRhdGEgPSBhbmNob3JzLmdldChzb3VyY2UpO1xuICAgICAgICB9XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICBpZiAoZGF0YT8ucmVzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNvbnN0IG1zZyA9ICdUaGlzIHNob3VsZCBub3QgaGFwcGVuOiBBbGlhcyBhbmNob3Igd2FzIG5vdCByZXNvbHZlZD8nO1xuICAgICAgICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKG1zZyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1heEFsaWFzQ291bnQgPj0gMCkge1xuICAgICAgICAgICAgZGF0YS5jb3VudCArPSAxO1xuICAgICAgICAgICAgaWYgKGRhdGEuYWxpYXNDb3VudCA9PT0gMClcbiAgICAgICAgICAgICAgICBkYXRhLmFsaWFzQ291bnQgPSBnZXRBbGlhc0NvdW50KGRvYywgc291cmNlLCBhbmNob3JzKTtcbiAgICAgICAgICAgIGlmIChkYXRhLmNvdW50ICogZGF0YS5hbGlhc0NvdW50ID4gbWF4QWxpYXNDb3VudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1zZyA9ICdFeGNlc3NpdmUgYWxpYXMgY291bnQgaW5kaWNhdGVzIGEgcmVzb3VyY2UgZXhoYXVzdGlvbiBhdHRhY2snO1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihtc2cpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkYXRhLnJlcztcbiAgICB9XG4gICAgdG9TdHJpbmcoY3R4LCBfb25Db21tZW50LCBfb25DaG9tcEtlZXApIHtcbiAgICAgICAgY29uc3Qgc3JjID0gYCoke3RoaXMuc291cmNlfWA7XG4gICAgICAgIGlmIChjdHgpIHtcbiAgICAgICAgICAgIGFuY2hvcnMuYW5jaG9ySXNWYWxpZCh0aGlzLnNvdXJjZSk7XG4gICAgICAgICAgICBpZiAoY3R4Lm9wdGlvbnMudmVyaWZ5QWxpYXNPcmRlciAmJiAhY3R4LmFuY2hvcnMuaGFzKHRoaXMuc291cmNlKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1zZyA9IGBVbnJlc29sdmVkIGFsaWFzICh0aGUgYW5jaG9yIG11c3QgYmUgc2V0IGJlZm9yZSB0aGUgYWxpYXMpOiAke3RoaXMuc291cmNlfWA7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY3R4LmltcGxpY2l0S2V5KVxuICAgICAgICAgICAgICAgIHJldHVybiBgJHtzcmN9IGA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNyYztcbiAgICB9XG59XG5mdW5jdGlvbiBnZXRBbGlhc0NvdW50KGRvYywgbm9kZSwgYW5jaG9ycykge1xuICAgIGlmIChpZGVudGl0eS5pc0FsaWFzKG5vZGUpKSB7XG4gICAgICAgIGNvbnN0IHNvdXJjZSA9IG5vZGUucmVzb2x2ZShkb2MpO1xuICAgICAgICBjb25zdCBhbmNob3IgPSBhbmNob3JzICYmIHNvdXJjZSAmJiBhbmNob3JzLmdldChzb3VyY2UpO1xuICAgICAgICByZXR1cm4gYW5jaG9yID8gYW5jaG9yLmNvdW50ICogYW5jaG9yLmFsaWFzQ291bnQgOiAwO1xuICAgIH1cbiAgICBlbHNlIGlmIChpZGVudGl0eS5pc0NvbGxlY3Rpb24obm9kZSkpIHtcbiAgICAgICAgbGV0IGNvdW50ID0gMDtcbiAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIG5vZGUuaXRlbXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGMgPSBnZXRBbGlhc0NvdW50KGRvYywgaXRlbSwgYW5jaG9ycyk7XG4gICAgICAgICAgICBpZiAoYyA+IGNvdW50KVxuICAgICAgICAgICAgICAgIGNvdW50ID0gYztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY291bnQ7XG4gICAgfVxuICAgIGVsc2UgaWYgKGlkZW50aXR5LmlzUGFpcihub2RlKSkge1xuICAgICAgICBjb25zdCBrYyA9IGdldEFsaWFzQ291bnQoZG9jLCBub2RlLmtleSwgYW5jaG9ycyk7XG4gICAgICAgIGNvbnN0IHZjID0gZ2V0QWxpYXNDb3VudChkb2MsIG5vZGUudmFsdWUsIGFuY2hvcnMpO1xuICAgICAgICByZXR1cm4gTWF0aC5tYXgoa2MsIHZjKTtcbiAgICB9XG4gICAgcmV0dXJuIDE7XG59XG5cbmV4cG9ydHMuQWxpYXMgPSBBbGlhcztcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuL2lkZW50aXR5LmpzJyk7XG52YXIgTm9kZSA9IHJlcXVpcmUoJy4vTm9kZS5qcycpO1xudmFyIHRvSlMgPSByZXF1aXJlKCcuL3RvSlMuanMnKTtcblxuY29uc3QgaXNTY2FsYXJWYWx1ZSA9ICh2YWx1ZSkgPT4gIXZhbHVlIHx8ICh0eXBlb2YgdmFsdWUgIT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIHZhbHVlICE9PSAnb2JqZWN0Jyk7XG5jbGFzcyBTY2FsYXIgZXh0ZW5kcyBOb2RlLk5vZGVCYXNlIHtcbiAgICBjb25zdHJ1Y3Rvcih2YWx1ZSkge1xuICAgICAgICBzdXBlcihpZGVudGl0eS5TQ0FMQVIpO1xuICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgfVxuICAgIHRvSlNPTihhcmcsIGN0eCkge1xuICAgICAgICByZXR1cm4gY3R4Py5rZWVwID8gdGhpcy52YWx1ZSA6IHRvSlMudG9KUyh0aGlzLnZhbHVlLCBhcmcsIGN0eCk7XG4gICAgfVxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gU3RyaW5nKHRoaXMudmFsdWUpO1xuICAgIH1cbn1cblNjYWxhci5CTE9DS19GT0xERUQgPSAnQkxPQ0tfRk9MREVEJztcblNjYWxhci5CTE9DS19MSVRFUkFMID0gJ0JMT0NLX0xJVEVSQUwnO1xuU2NhbGFyLlBMQUlOID0gJ1BMQUlOJztcblNjYWxhci5RVU9URV9ET1VCTEUgPSAnUVVPVEVfRE9VQkxFJztcblNjYWxhci5RVU9URV9TSU5HTEUgPSAnUVVPVEVfU0lOR0xFJztcblxuZXhwb3J0cy5TY2FsYXIgPSBTY2FsYXI7XG5leHBvcnRzLmlzU2NhbGFyVmFsdWUgPSBpc1NjYWxhclZhbHVlO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBBbGlhcyA9IHJlcXVpcmUoJy4uL25vZGVzL0FsaWFzLmpzJyk7XG52YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuLi9ub2Rlcy9pZGVudGl0eS5qcycpO1xudmFyIFNjYWxhciA9IHJlcXVpcmUoJy4uL25vZGVzL1NjYWxhci5qcycpO1xuXG5jb25zdCBkZWZhdWx0VGFnUHJlZml4ID0gJ3RhZzp5YW1sLm9yZywyMDAyOic7XG5mdW5jdGlvbiBmaW5kVGFnT2JqZWN0KHZhbHVlLCB0YWdOYW1lLCB0YWdzKSB7XG4gICAgaWYgKHRhZ05hbWUpIHtcbiAgICAgICAgY29uc3QgbWF0Y2ggPSB0YWdzLmZpbHRlcih0ID0+IHQudGFnID09PSB0YWdOYW1lKTtcbiAgICAgICAgY29uc3QgdGFnT2JqID0gbWF0Y2guZmluZCh0ID0+ICF0LmZvcm1hdCkgPz8gbWF0Y2hbMF07XG4gICAgICAgIGlmICghdGFnT2JqKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUYWcgJHt0YWdOYW1lfSBub3QgZm91bmRgKTtcbiAgICAgICAgcmV0dXJuIHRhZ09iajtcbiAgICB9XG4gICAgcmV0dXJuIHRhZ3MuZmluZCh0ID0+IHQuaWRlbnRpZnk/Lih2YWx1ZSkgJiYgIXQuZm9ybWF0KTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZU5vZGUodmFsdWUsIHRhZ05hbWUsIGN0eCkge1xuICAgIGlmIChpZGVudGl0eS5pc0RvY3VtZW50KHZhbHVlKSlcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5jb250ZW50cztcbiAgICBpZiAoaWRlbnRpdHkuaXNOb2RlKHZhbHVlKSlcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIGlmIChpZGVudGl0eS5pc1BhaXIodmFsdWUpKSB7XG4gICAgICAgIGNvbnN0IG1hcCA9IGN0eC5zY2hlbWFbaWRlbnRpdHkuTUFQXS5jcmVhdGVOb2RlPy4oY3R4LnNjaGVtYSwgbnVsbCwgY3R4KTtcbiAgICAgICAgbWFwLml0ZW1zLnB1c2godmFsdWUpO1xuICAgICAgICByZXR1cm4gbWFwO1xuICAgIH1cbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBTdHJpbmcgfHxcbiAgICAgICAgdmFsdWUgaW5zdGFuY2VvZiBOdW1iZXIgfHxcbiAgICAgICAgdmFsdWUgaW5zdGFuY2VvZiBCb29sZWFuIHx8XG4gICAgICAgICh0eXBlb2YgQmlnSW50ICE9PSAndW5kZWZpbmVkJyAmJiB2YWx1ZSBpbnN0YW5jZW9mIEJpZ0ludCkgLy8gbm90IHN1cHBvcnRlZCBldmVyeXdoZXJlXG4gICAgKSB7XG4gICAgICAgIC8vIGh0dHBzOi8vdGMzOS5lcy9lY21hMjYyLyNzZWMtc2VyaWFsaXplanNvbnByb3BlcnR5XG4gICAgICAgIHZhbHVlID0gdmFsdWUudmFsdWVPZigpO1xuICAgIH1cbiAgICBjb25zdCB7IGFsaWFzRHVwbGljYXRlT2JqZWN0cywgb25BbmNob3IsIG9uVGFnT2JqLCBzY2hlbWEsIHNvdXJjZU9iamVjdHMgfSA9IGN0eDtcbiAgICAvLyBEZXRlY3QgZHVwbGljYXRlIHJlZmVyZW5jZXMgdG8gdGhlIHNhbWUgb2JqZWN0ICYgdXNlIEFsaWFzIG5vZGVzIGZvciBhbGxcbiAgICAvLyBhZnRlciBmaXJzdC4gVGhlIGByZWZgIHdyYXBwZXIgYWxsb3dzIGZvciBjaXJjdWxhciByZWZlcmVuY2VzIHRvIHJlc29sdmUuXG4gICAgbGV0IHJlZiA9IHVuZGVmaW5lZDtcbiAgICBpZiAoYWxpYXNEdXBsaWNhdGVPYmplY3RzICYmIHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgcmVmID0gc291cmNlT2JqZWN0cy5nZXQodmFsdWUpO1xuICAgICAgICBpZiAocmVmKSB7XG4gICAgICAgICAgICByZWYuYW5jaG9yID8/IChyZWYuYW5jaG9yID0gb25BbmNob3IodmFsdWUpKTtcbiAgICAgICAgICAgIHJldHVybiBuZXcgQWxpYXMuQWxpYXMocmVmLmFuY2hvcik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZWYgPSB7IGFuY2hvcjogbnVsbCwgbm9kZTogbnVsbCB9O1xuICAgICAgICAgICAgc291cmNlT2JqZWN0cy5zZXQodmFsdWUsIHJlZik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRhZ05hbWU/LnN0YXJ0c1dpdGgoJyEhJykpXG4gICAgICAgIHRhZ05hbWUgPSBkZWZhdWx0VGFnUHJlZml4ICsgdGFnTmFtZS5zbGljZSgyKTtcbiAgICBsZXQgdGFnT2JqID0gZmluZFRhZ09iamVjdCh2YWx1ZSwgdGFnTmFtZSwgc2NoZW1hLnRhZ3MpO1xuICAgIGlmICghdGFnT2JqKSB7XG4gICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUudG9KU09OID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVuc2FmZS1jYWxsXG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnRvSlNPTigpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdmFsdWUgfHwgdHlwZW9mIHZhbHVlICE9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgY29uc3Qgbm9kZSA9IG5ldyBTY2FsYXIuU2NhbGFyKHZhbHVlKTtcbiAgICAgICAgICAgIGlmIChyZWYpXG4gICAgICAgICAgICAgICAgcmVmLm5vZGUgPSBub2RlO1xuICAgICAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICAgIH1cbiAgICAgICAgdGFnT2JqID1cbiAgICAgICAgICAgIHZhbHVlIGluc3RhbmNlb2YgTWFwXG4gICAgICAgICAgICAgICAgPyBzY2hlbWFbaWRlbnRpdHkuTUFQXVxuICAgICAgICAgICAgICAgIDogU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdCh2YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgPyBzY2hlbWFbaWRlbnRpdHkuU0VRXVxuICAgICAgICAgICAgICAgICAgICA6IHNjaGVtYVtpZGVudGl0eS5NQVBdO1xuICAgIH1cbiAgICBpZiAob25UYWdPYmopIHtcbiAgICAgICAgb25UYWdPYmoodGFnT2JqKTtcbiAgICAgICAgZGVsZXRlIGN0eC5vblRhZ09iajtcbiAgICB9XG4gICAgY29uc3Qgbm9kZSA9IHRhZ09iaj8uY3JlYXRlTm9kZVxuICAgICAgICA/IHRhZ09iai5jcmVhdGVOb2RlKGN0eC5zY2hlbWEsIHZhbHVlLCBjdHgpXG4gICAgICAgIDogdHlwZW9mIHRhZ09iaj8ubm9kZUNsYXNzPy5mcm9tID09PSAnZnVuY3Rpb24nXG4gICAgICAgICAgICA/IHRhZ09iai5ub2RlQ2xhc3MuZnJvbShjdHguc2NoZW1hLCB2YWx1ZSwgY3R4KVxuICAgICAgICAgICAgOiBuZXcgU2NhbGFyLlNjYWxhcih2YWx1ZSk7XG4gICAgaWYgKHRhZ05hbWUpXG4gICAgICAgIG5vZGUudGFnID0gdGFnTmFtZTtcbiAgICBlbHNlIGlmICghdGFnT2JqLmRlZmF1bHQpXG4gICAgICAgIG5vZGUudGFnID0gdGFnT2JqLnRhZztcbiAgICBpZiAocmVmKVxuICAgICAgICByZWYubm9kZSA9IG5vZGU7XG4gICAgcmV0dXJuIG5vZGU7XG59XG5cbmV4cG9ydHMuY3JlYXRlTm9kZSA9IGNyZWF0ZU5vZGU7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIGNyZWF0ZU5vZGUgPSByZXF1aXJlKCcuLi9kb2MvY3JlYXRlTm9kZS5qcycpO1xudmFyIGlkZW50aXR5ID0gcmVxdWlyZSgnLi9pZGVudGl0eS5qcycpO1xudmFyIE5vZGUgPSByZXF1aXJlKCcuL05vZGUuanMnKTtcblxuZnVuY3Rpb24gY29sbGVjdGlvbkZyb21QYXRoKHNjaGVtYSwgcGF0aCwgdmFsdWUpIHtcbiAgICBsZXQgdiA9IHZhbHVlO1xuICAgIGZvciAobGV0IGkgPSBwYXRoLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIGNvbnN0IGsgPSBwYXRoW2ldO1xuICAgICAgICBpZiAodHlwZW9mIGsgPT09ICdudW1iZXInICYmIE51bWJlci5pc0ludGVnZXIoaykgJiYgayA+PSAwKSB7XG4gICAgICAgICAgICBjb25zdCBhID0gW107XG4gICAgICAgICAgICBhW2tdID0gdjtcbiAgICAgICAgICAgIHYgPSBhO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdiA9IG5ldyBNYXAoW1trLCB2XV0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjcmVhdGVOb2RlLmNyZWF0ZU5vZGUodiwgdW5kZWZpbmVkLCB7XG4gICAgICAgIGFsaWFzRHVwbGljYXRlT2JqZWN0czogZmFsc2UsXG4gICAgICAgIGtlZXBVbmRlZmluZWQ6IGZhbHNlLFxuICAgICAgICBvbkFuY2hvcjogKCkgPT4ge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGlzIHNob3VsZCBub3QgaGFwcGVuLCBwbGVhc2UgcmVwb3J0IGEgYnVnLicpO1xuICAgICAgICB9LFxuICAgICAgICBzY2hlbWEsXG4gICAgICAgIHNvdXJjZU9iamVjdHM6IG5ldyBNYXAoKVxuICAgIH0pO1xufVxuLy8gVHlwZSBndWFyZCBpcyBpbnRlbnRpb25hbGx5IGEgbGl0dGxlIHdyb25nIHNvIGFzIHRvIGJlIG1vcmUgdXNlZnVsLFxuLy8gYXMgaXQgZG9lcyBub3QgY292ZXIgdW50eXBhYmxlIGVtcHR5IG5vbi1zdHJpbmcgaXRlcmFibGVzIChlLmcuIFtdKS5cbmNvbnN0IGlzRW1wdHlQYXRoID0gKHBhdGgpID0+IHBhdGggPT0gbnVsbCB8fFxuICAgICh0eXBlb2YgcGF0aCA9PT0gJ29iamVjdCcgJiYgISFwYXRoW1N5bWJvbC5pdGVyYXRvcl0oKS5uZXh0KCkuZG9uZSk7XG5jbGFzcyBDb2xsZWN0aW9uIGV4dGVuZHMgTm9kZS5Ob2RlQmFzZSB7XG4gICAgY29uc3RydWN0b3IodHlwZSwgc2NoZW1hKSB7XG4gICAgICAgIHN1cGVyKHR5cGUpO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3NjaGVtYScsIHtcbiAgICAgICAgICAgIHZhbHVlOiBzY2hlbWEsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBjb3B5IG9mIHRoaXMgY29sbGVjdGlvbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBzY2hlbWEgLSBJZiBkZWZpbmVkLCBvdmVyd3JpdGVzIHRoZSBvcmlnaW5hbCdzIHNjaGVtYVxuICAgICAqL1xuICAgIGNsb25lKHNjaGVtYSkge1xuICAgICAgICBjb25zdCBjb3B5ID0gT2JqZWN0LmNyZWF0ZShPYmplY3QuZ2V0UHJvdG90eXBlT2YodGhpcyksIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHRoaXMpKTtcbiAgICAgICAgaWYgKHNjaGVtYSlcbiAgICAgICAgICAgIGNvcHkuc2NoZW1hID0gc2NoZW1hO1xuICAgICAgICBjb3B5Lml0ZW1zID0gY29weS5pdGVtcy5tYXAoaXQgPT4gaWRlbnRpdHkuaXNOb2RlKGl0KSB8fCBpZGVudGl0eS5pc1BhaXIoaXQpID8gaXQuY2xvbmUoc2NoZW1hKSA6IGl0KTtcbiAgICAgICAgaWYgKHRoaXMucmFuZ2UpXG4gICAgICAgICAgICBjb3B5LnJhbmdlID0gdGhpcy5yYW5nZS5zbGljZSgpO1xuICAgICAgICByZXR1cm4gY29weTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQWRkcyBhIHZhbHVlIHRvIHRoZSBjb2xsZWN0aW9uLiBGb3IgYCEhbWFwYCBhbmQgYCEhb21hcGAgdGhlIHZhbHVlIG11c3RcbiAgICAgKiBiZSBhIFBhaXIgaW5zdGFuY2Ugb3IgYSBgeyBrZXksIHZhbHVlIH1gIG9iamVjdCwgd2hpY2ggbWF5IG5vdCBoYXZlIGEga2V5XG4gICAgICogdGhhdCBhbHJlYWR5IGV4aXN0cyBpbiB0aGUgbWFwLlxuICAgICAqL1xuICAgIGFkZEluKHBhdGgsIHZhbHVlKSB7XG4gICAgICAgIGlmIChpc0VtcHR5UGF0aChwYXRoKSlcbiAgICAgICAgICAgIHRoaXMuYWRkKHZhbHVlKTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBba2V5LCAuLi5yZXN0XSA9IHBhdGg7XG4gICAgICAgICAgICBjb25zdCBub2RlID0gdGhpcy5nZXQoa2V5LCB0cnVlKTtcbiAgICAgICAgICAgIGlmIChpZGVudGl0eS5pc0NvbGxlY3Rpb24obm9kZSkpXG4gICAgICAgICAgICAgICAgbm9kZS5hZGRJbihyZXN0LCB2YWx1ZSk7XG4gICAgICAgICAgICBlbHNlIGlmIChub2RlID09PSB1bmRlZmluZWQgJiYgdGhpcy5zY2hlbWEpXG4gICAgICAgICAgICAgICAgdGhpcy5zZXQoa2V5LCBjb2xsZWN0aW9uRnJvbVBhdGgodGhpcy5zY2hlbWEsIHJlc3QsIHZhbHVlKSk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCBZQU1MIGNvbGxlY3Rpb24gYXQgJHtrZXl9LiBSZW1haW5pbmcgcGF0aDogJHtyZXN0fWApO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYSB2YWx1ZSBmcm9tIHRoZSBjb2xsZWN0aW9uLlxuICAgICAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgaXRlbSB3YXMgZm91bmQgYW5kIHJlbW92ZWQuXG4gICAgICovXG4gICAgZGVsZXRlSW4ocGF0aCkge1xuICAgICAgICBjb25zdCBba2V5LCAuLi5yZXN0XSA9IHBhdGg7XG4gICAgICAgIGlmIChyZXN0Lmxlbmd0aCA9PT0gMClcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRlbGV0ZShrZXkpO1xuICAgICAgICBjb25zdCBub2RlID0gdGhpcy5nZXQoa2V5LCB0cnVlKTtcbiAgICAgICAgaWYgKGlkZW50aXR5LmlzQ29sbGVjdGlvbihub2RlKSlcbiAgICAgICAgICAgIHJldHVybiBub2RlLmRlbGV0ZUluKHJlc3QpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIFlBTUwgY29sbGVjdGlvbiBhdCAke2tleX0uIFJlbWFpbmluZyBwYXRoOiAke3Jlc3R9YCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJldHVybnMgaXRlbSBhdCBga2V5YCwgb3IgYHVuZGVmaW5lZGAgaWYgbm90IGZvdW5kLiBCeSBkZWZhdWx0IHVud3JhcHNcbiAgICAgKiBzY2FsYXIgdmFsdWVzIGZyb20gdGhlaXIgc3Vycm91bmRpbmcgbm9kZTsgdG8gZGlzYWJsZSBzZXQgYGtlZXBTY2FsYXJgIHRvXG4gICAgICogYHRydWVgIChjb2xsZWN0aW9ucyBhcmUgYWx3YXlzIHJldHVybmVkIGludGFjdCkuXG4gICAgICovXG4gICAgZ2V0SW4ocGF0aCwga2VlcFNjYWxhcikge1xuICAgICAgICBjb25zdCBba2V5LCAuLi5yZXN0XSA9IHBhdGg7XG4gICAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLmdldChrZXksIHRydWUpO1xuICAgICAgICBpZiAocmVzdC5sZW5ndGggPT09IDApXG4gICAgICAgICAgICByZXR1cm4gIWtlZXBTY2FsYXIgJiYgaWRlbnRpdHkuaXNTY2FsYXIobm9kZSkgPyBub2RlLnZhbHVlIDogbm9kZTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIGlkZW50aXR5LmlzQ29sbGVjdGlvbihub2RlKSA/IG5vZGUuZ2V0SW4ocmVzdCwga2VlcFNjYWxhcikgOiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGhhc0FsbE51bGxWYWx1ZXMoYWxsb3dTY2FsYXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXRlbXMuZXZlcnkobm9kZSA9PiB7XG4gICAgICAgICAgICBpZiAoIWlkZW50aXR5LmlzUGFpcihub2RlKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICBjb25zdCBuID0gbm9kZS52YWx1ZTtcbiAgICAgICAgICAgIHJldHVybiAobiA9PSBudWxsIHx8XG4gICAgICAgICAgICAgICAgKGFsbG93U2NhbGFyICYmXG4gICAgICAgICAgICAgICAgICAgIGlkZW50aXR5LmlzU2NhbGFyKG4pICYmXG4gICAgICAgICAgICAgICAgICAgIG4udmFsdWUgPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgICAgICAhbi5jb21tZW50QmVmb3JlICYmXG4gICAgICAgICAgICAgICAgICAgICFuLmNvbW1lbnQgJiZcbiAgICAgICAgICAgICAgICAgICAgIW4udGFnKSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgdGhlIGNvbGxlY3Rpb24gaW5jbHVkZXMgYSB2YWx1ZSB3aXRoIHRoZSBrZXkgYGtleWAuXG4gICAgICovXG4gICAgaGFzSW4ocGF0aCkge1xuICAgICAgICBjb25zdCBba2V5LCAuLi5yZXN0XSA9IHBhdGg7XG4gICAgICAgIGlmIChyZXN0Lmxlbmd0aCA9PT0gMClcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmhhcyhrZXkpO1xuICAgICAgICBjb25zdCBub2RlID0gdGhpcy5nZXQoa2V5LCB0cnVlKTtcbiAgICAgICAgcmV0dXJuIGlkZW50aXR5LmlzQ29sbGVjdGlvbihub2RlKSA/IG5vZGUuaGFzSW4ocmVzdCkgOiBmYWxzZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0cyBhIHZhbHVlIGluIHRoaXMgY29sbGVjdGlvbi4gRm9yIGAhIXNldGAsIGB2YWx1ZWAgbmVlZHMgdG8gYmUgYVxuICAgICAqIGJvb2xlYW4gdG8gYWRkL3JlbW92ZSB0aGUgaXRlbSBmcm9tIHRoZSBzZXQuXG4gICAgICovXG4gICAgc2V0SW4ocGF0aCwgdmFsdWUpIHtcbiAgICAgICAgY29uc3QgW2tleSwgLi4ucmVzdF0gPSBwYXRoO1xuICAgICAgICBpZiAocmVzdC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KGtleSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3Qgbm9kZSA9IHRoaXMuZ2V0KGtleSwgdHJ1ZSk7XG4gICAgICAgICAgICBpZiAoaWRlbnRpdHkuaXNDb2xsZWN0aW9uKG5vZGUpKVxuICAgICAgICAgICAgICAgIG5vZGUuc2V0SW4ocmVzdCwgdmFsdWUpO1xuICAgICAgICAgICAgZWxzZSBpZiAobm9kZSA9PT0gdW5kZWZpbmVkICYmIHRoaXMuc2NoZW1hKVxuICAgICAgICAgICAgICAgIHRoaXMuc2V0KGtleSwgY29sbGVjdGlvbkZyb21QYXRoKHRoaXMuc2NoZW1hLCByZXN0LCB2YWx1ZSkpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgWUFNTCBjb2xsZWN0aW9uIGF0ICR7a2V5fS4gUmVtYWluaW5nIHBhdGg6ICR7cmVzdH1gKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0cy5Db2xsZWN0aW9uID0gQ29sbGVjdGlvbjtcbmV4cG9ydHMuY29sbGVjdGlvbkZyb21QYXRoID0gY29sbGVjdGlvbkZyb21QYXRoO1xuZXhwb3J0cy5pc0VtcHR5UGF0aCA9IGlzRW1wdHlQYXRoO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogU3RyaW5naWZpZXMgYSBjb21tZW50LlxuICpcbiAqIEVtcHR5IGNvbW1lbnQgbGluZXMgYXJlIGxlZnQgZW1wdHksXG4gKiBsaW5lcyBjb25zaXN0aW5nIG9mIGEgc2luZ2xlIHNwYWNlIGFyZSByZXBsYWNlZCBieSBgI2AsXG4gKiBhbmQgYWxsIG90aGVyIGxpbmVzIGFyZSBwcmVmaXhlZCB3aXRoIGEgYCNgLlxuICovXG5jb25zdCBzdHJpbmdpZnlDb21tZW50ID0gKHN0cikgPT4gc3RyLnJlcGxhY2UoL14oPyEkKSg/OiAkKT8vZ20sICcjJyk7XG5mdW5jdGlvbiBpbmRlbnRDb21tZW50KGNvbW1lbnQsIGluZGVudCkge1xuICAgIGlmICgvXlxcbiskLy50ZXN0KGNvbW1lbnQpKVxuICAgICAgICByZXR1cm4gY29tbWVudC5zdWJzdHJpbmcoMSk7XG4gICAgcmV0dXJuIGluZGVudCA/IGNvbW1lbnQucmVwbGFjZSgvXig/ISAqJCkvZ20sIGluZGVudCkgOiBjb21tZW50O1xufVxuY29uc3QgbGluZUNvbW1lbnQgPSAoc3RyLCBpbmRlbnQsIGNvbW1lbnQpID0+IHN0ci5lbmRzV2l0aCgnXFxuJylcbiAgICA/IGluZGVudENvbW1lbnQoY29tbWVudCwgaW5kZW50KVxuICAgIDogY29tbWVudC5pbmNsdWRlcygnXFxuJylcbiAgICAgICAgPyAnXFxuJyArIGluZGVudENvbW1lbnQoY29tbWVudCwgaW5kZW50KVxuICAgICAgICA6IChzdHIuZW5kc1dpdGgoJyAnKSA/ICcnIDogJyAnKSArIGNvbW1lbnQ7XG5cbmV4cG9ydHMuaW5kZW50Q29tbWVudCA9IGluZGVudENvbW1lbnQ7XG5leHBvcnRzLmxpbmVDb21tZW50ID0gbGluZUNvbW1lbnQ7XG5leHBvcnRzLnN0cmluZ2lmeUNvbW1lbnQgPSBzdHJpbmdpZnlDb21tZW50O1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbmNvbnN0IEZPTERfRkxPVyA9ICdmbG93JztcbmNvbnN0IEZPTERfQkxPQ0sgPSAnYmxvY2snO1xuY29uc3QgRk9MRF9RVU9URUQgPSAncXVvdGVkJztcbi8qKlxuICogVHJpZXMgdG8ga2VlcCBpbnB1dCBhdCB1cCB0byBgbGluZVdpZHRoYCBjaGFyYWN0ZXJzLCBzcGxpdHRpbmcgb25seSBvbiBzcGFjZXNcbiAqIG5vdCBmb2xsb3dlZCBieSBuZXdsaW5lcyBvciBzcGFjZXMgdW5sZXNzIGBtb2RlYCBpcyBgJ3F1b3RlZCdgLiBMaW5lcyBhcmVcbiAqIHRlcm1pbmF0ZWQgd2l0aCBgXFxuYCBhbmQgc3RhcnRlZCB3aXRoIGBpbmRlbnRgLlxuICovXG5mdW5jdGlvbiBmb2xkRmxvd0xpbmVzKHRleHQsIGluZGVudCwgbW9kZSA9ICdmbG93JywgeyBpbmRlbnRBdFN0YXJ0LCBsaW5lV2lkdGggPSA4MCwgbWluQ29udGVudFdpZHRoID0gMjAsIG9uRm9sZCwgb25PdmVyZmxvdyB9ID0ge30pIHtcbiAgICBpZiAoIWxpbmVXaWR0aCB8fCBsaW5lV2lkdGggPCAwKVxuICAgICAgICByZXR1cm4gdGV4dDtcbiAgICBpZiAobGluZVdpZHRoIDwgbWluQ29udGVudFdpZHRoKVxuICAgICAgICBtaW5Db250ZW50V2lkdGggPSAwO1xuICAgIGNvbnN0IGVuZFN0ZXAgPSBNYXRoLm1heCgxICsgbWluQ29udGVudFdpZHRoLCAxICsgbGluZVdpZHRoIC0gaW5kZW50Lmxlbmd0aCk7XG4gICAgaWYgKHRleHQubGVuZ3RoIDw9IGVuZFN0ZXApXG4gICAgICAgIHJldHVybiB0ZXh0O1xuICAgIGNvbnN0IGZvbGRzID0gW107XG4gICAgY29uc3QgZXNjYXBlZEZvbGRzID0ge307XG4gICAgbGV0IGVuZCA9IGxpbmVXaWR0aCAtIGluZGVudC5sZW5ndGg7XG4gICAgaWYgKHR5cGVvZiBpbmRlbnRBdFN0YXJ0ID09PSAnbnVtYmVyJykge1xuICAgICAgICBpZiAoaW5kZW50QXRTdGFydCA+IGxpbmVXaWR0aCAtIE1hdGgubWF4KDIsIG1pbkNvbnRlbnRXaWR0aCkpXG4gICAgICAgICAgICBmb2xkcy5wdXNoKDApO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBlbmQgPSBsaW5lV2lkdGggLSBpbmRlbnRBdFN0YXJ0O1xuICAgIH1cbiAgICBsZXQgc3BsaXQgPSB1bmRlZmluZWQ7XG4gICAgbGV0IHByZXYgPSB1bmRlZmluZWQ7XG4gICAgbGV0IG92ZXJmbG93ID0gZmFsc2U7XG4gICAgbGV0IGkgPSAtMTtcbiAgICBsZXQgZXNjU3RhcnQgPSAtMTtcbiAgICBsZXQgZXNjRW5kID0gLTE7XG4gICAgaWYgKG1vZGUgPT09IEZPTERfQkxPQ0spIHtcbiAgICAgICAgaSA9IGNvbnN1bWVNb3JlSW5kZW50ZWRMaW5lcyh0ZXh0LCBpLCBpbmRlbnQubGVuZ3RoKTtcbiAgICAgICAgaWYgKGkgIT09IC0xKVxuICAgICAgICAgICAgZW5kID0gaSArIGVuZFN0ZXA7XG4gICAgfVxuICAgIGZvciAobGV0IGNoOyAoY2ggPSB0ZXh0WyhpICs9IDEpXSk7KSB7XG4gICAgICAgIGlmIChtb2RlID09PSBGT0xEX1FVT1RFRCAmJiBjaCA9PT0gJ1xcXFwnKSB7XG4gICAgICAgICAgICBlc2NTdGFydCA9IGk7XG4gICAgICAgICAgICBzd2l0Y2ggKHRleHRbaSArIDFdKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAneCc6XG4gICAgICAgICAgICAgICAgICAgIGkgKz0gMztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAndSc6XG4gICAgICAgICAgICAgICAgICAgIGkgKz0gNTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnVSc6XG4gICAgICAgICAgICAgICAgICAgIGkgKz0gOTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgaSArPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZXNjRW5kID0gaTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2ggPT09ICdcXG4nKSB7XG4gICAgICAgICAgICBpZiAobW9kZSA9PT0gRk9MRF9CTE9DSylcbiAgICAgICAgICAgICAgICBpID0gY29uc3VtZU1vcmVJbmRlbnRlZExpbmVzKHRleHQsIGksIGluZGVudC5sZW5ndGgpO1xuICAgICAgICAgICAgZW5kID0gaSArIGluZGVudC5sZW5ndGggKyBlbmRTdGVwO1xuICAgICAgICAgICAgc3BsaXQgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoY2ggPT09ICcgJyAmJlxuICAgICAgICAgICAgICAgIHByZXYgJiZcbiAgICAgICAgICAgICAgICBwcmV2ICE9PSAnICcgJiZcbiAgICAgICAgICAgICAgICBwcmV2ICE9PSAnXFxuJyAmJlxuICAgICAgICAgICAgICAgIHByZXYgIT09ICdcXHQnKSB7XG4gICAgICAgICAgICAgICAgLy8gc3BhY2Ugc3Vycm91bmRlZCBieSBub24tc3BhY2UgY2FuIGJlIHJlcGxhY2VkIHdpdGggbmV3bGluZSArIGluZGVudFxuICAgICAgICAgICAgICAgIGNvbnN0IG5leHQgPSB0ZXh0W2kgKyAxXTtcbiAgICAgICAgICAgICAgICBpZiAobmV4dCAmJiBuZXh0ICE9PSAnICcgJiYgbmV4dCAhPT0gJ1xcbicgJiYgbmV4dCAhPT0gJ1xcdCcpXG4gICAgICAgICAgICAgICAgICAgIHNwbGl0ID0gaTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpID49IGVuZCkge1xuICAgICAgICAgICAgICAgIGlmIChzcGxpdCkge1xuICAgICAgICAgICAgICAgICAgICBmb2xkcy5wdXNoKHNwbGl0KTtcbiAgICAgICAgICAgICAgICAgICAgZW5kID0gc3BsaXQgKyBlbmRTdGVwO1xuICAgICAgICAgICAgICAgICAgICBzcGxpdCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAobW9kZSA9PT0gRk9MRF9RVU9URUQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gd2hpdGUtc3BhY2UgY29sbGVjdGVkIGF0IGVuZCBtYXkgc3RyZXRjaCBwYXN0IGxpbmVXaWR0aFxuICAgICAgICAgICAgICAgICAgICB3aGlsZSAocHJldiA9PT0gJyAnIHx8IHByZXYgPT09ICdcXHQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2ID0gY2g7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaCA9IHRleHRbKGkgKz0gMSldO1xuICAgICAgICAgICAgICAgICAgICAgICAgb3ZlcmZsb3cgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIEFjY291bnQgZm9yIG5ld2xpbmUgZXNjYXBlLCBidXQgZG9uJ3QgYnJlYWsgcHJlY2VkaW5nIGVzY2FwZVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBqID0gaSA+IGVzY0VuZCArIDEgPyBpIC0gMiA6IGVzY1N0YXJ0IC0gMTtcbiAgICAgICAgICAgICAgICAgICAgLy8gQmFpbCBvdXQgaWYgbGluZVdpZHRoICYgbWluQ29udGVudFdpZHRoIGFyZSBzaG9ydGVyIHRoYW4gYW4gZXNjYXBlIHN0cmluZ1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXNjYXBlZEZvbGRzW2pdKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgICAgICAgICAgICAgICAgIGZvbGRzLnB1c2goaik7XG4gICAgICAgICAgICAgICAgICAgIGVzY2FwZWRGb2xkc1tqXSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGVuZCA9IGogKyBlbmRTdGVwO1xuICAgICAgICAgICAgICAgICAgICBzcGxpdCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG92ZXJmbG93ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcHJldiA9IGNoO1xuICAgIH1cbiAgICBpZiAob3ZlcmZsb3cgJiYgb25PdmVyZmxvdylcbiAgICAgICAgb25PdmVyZmxvdygpO1xuICAgIGlmIChmb2xkcy5sZW5ndGggPT09IDApXG4gICAgICAgIHJldHVybiB0ZXh0O1xuICAgIGlmIChvbkZvbGQpXG4gICAgICAgIG9uRm9sZCgpO1xuICAgIGxldCByZXMgPSB0ZXh0LnNsaWNlKDAsIGZvbGRzWzBdKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZvbGRzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGNvbnN0IGZvbGQgPSBmb2xkc1tpXTtcbiAgICAgICAgY29uc3QgZW5kID0gZm9sZHNbaSArIDFdIHx8IHRleHQubGVuZ3RoO1xuICAgICAgICBpZiAoZm9sZCA9PT0gMClcbiAgICAgICAgICAgIHJlcyA9IGBcXG4ke2luZGVudH0ke3RleHQuc2xpY2UoMCwgZW5kKX1gO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChtb2RlID09PSBGT0xEX1FVT1RFRCAmJiBlc2NhcGVkRm9sZHNbZm9sZF0pXG4gICAgICAgICAgICAgICAgcmVzICs9IGAke3RleHRbZm9sZF19XFxcXGA7XG4gICAgICAgICAgICByZXMgKz0gYFxcbiR7aW5kZW50fSR7dGV4dC5zbGljZShmb2xkICsgMSwgZW5kKX1gO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXM7XG59XG4vKipcbiAqIFByZXN1bWVzIGBpICsgMWAgaXMgYXQgdGhlIHN0YXJ0IG9mIGEgbGluZVxuICogQHJldHVybnMgaW5kZXggb2YgbGFzdCBuZXdsaW5lIGluIG1vcmUtaW5kZW50ZWQgYmxvY2tcbiAqL1xuZnVuY3Rpb24gY29uc3VtZU1vcmVJbmRlbnRlZExpbmVzKHRleHQsIGksIGluZGVudCkge1xuICAgIGxldCBlbmQgPSBpO1xuICAgIGxldCBzdGFydCA9IGkgKyAxO1xuICAgIGxldCBjaCA9IHRleHRbc3RhcnRdO1xuICAgIHdoaWxlIChjaCA9PT0gJyAnIHx8IGNoID09PSAnXFx0Jykge1xuICAgICAgICBpZiAoaSA8IHN0YXJ0ICsgaW5kZW50KSB7XG4gICAgICAgICAgICBjaCA9IHRleHRbKytpXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICBjaCA9IHRleHRbKytpXTtcbiAgICAgICAgICAgIH0gd2hpbGUgKGNoICYmIGNoICE9PSAnXFxuJyk7XG4gICAgICAgICAgICBlbmQgPSBpO1xuICAgICAgICAgICAgc3RhcnQgPSBpICsgMTtcbiAgICAgICAgICAgIGNoID0gdGV4dFtzdGFydF07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGVuZDtcbn1cblxuZXhwb3J0cy5GT0xEX0JMT0NLID0gRk9MRF9CTE9DSztcbmV4cG9ydHMuRk9MRF9GTE9XID0gRk9MRF9GTE9XO1xuZXhwb3J0cy5GT0xEX1FVT1RFRCA9IEZPTERfUVVPVEVEO1xuZXhwb3J0cy5mb2xkRmxvd0xpbmVzID0gZm9sZEZsb3dMaW5lcztcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgU2NhbGFyID0gcmVxdWlyZSgnLi4vbm9kZXMvU2NhbGFyLmpzJyk7XG52YXIgZm9sZEZsb3dMaW5lcyA9IHJlcXVpcmUoJy4vZm9sZEZsb3dMaW5lcy5qcycpO1xuXG5jb25zdCBnZXRGb2xkT3B0aW9ucyA9IChjdHgsIGlzQmxvY2spID0+ICh7XG4gICAgaW5kZW50QXRTdGFydDogaXNCbG9jayA/IGN0eC5pbmRlbnQubGVuZ3RoIDogY3R4LmluZGVudEF0U3RhcnQsXG4gICAgbGluZVdpZHRoOiBjdHgub3B0aW9ucy5saW5lV2lkdGgsXG4gICAgbWluQ29udGVudFdpZHRoOiBjdHgub3B0aW9ucy5taW5Db250ZW50V2lkdGhcbn0pO1xuLy8gQWxzbyBjaGVja3MgZm9yIGxpbmVzIHN0YXJ0aW5nIHdpdGggJSwgYXMgcGFyc2luZyB0aGUgb3V0cHV0IGFzIFlBTUwgMS4xIHdpbGxcbi8vIHByZXN1bWUgdGhhdCdzIHN0YXJ0aW5nIGEgbmV3IGRvY3VtZW50LlxuY29uc3QgY29udGFpbnNEb2N1bWVudE1hcmtlciA9IChzdHIpID0+IC9eKCV8LS0tfFxcLlxcLlxcLikvbS50ZXN0KHN0cik7XG5mdW5jdGlvbiBsaW5lTGVuZ3RoT3ZlckxpbWl0KHN0ciwgbGluZVdpZHRoLCBpbmRlbnRMZW5ndGgpIHtcbiAgICBpZiAoIWxpbmVXaWR0aCB8fCBsaW5lV2lkdGggPCAwKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgY29uc3QgbGltaXQgPSBsaW5lV2lkdGggLSBpbmRlbnRMZW5ndGg7XG4gICAgY29uc3Qgc3RyTGVuID0gc3RyLmxlbmd0aDtcbiAgICBpZiAoc3RyTGVuIDw9IGxpbWl0KVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgZm9yIChsZXQgaSA9IDAsIHN0YXJ0ID0gMDsgaSA8IHN0ckxlbjsgKytpKSB7XG4gICAgICAgIGlmIChzdHJbaV0gPT09ICdcXG4nKSB7XG4gICAgICAgICAgICBpZiAoaSAtIHN0YXJ0ID4gbGltaXQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICBzdGFydCA9IGkgKyAxO1xuICAgICAgICAgICAgaWYgKHN0ckxlbiAtIHN0YXJ0IDw9IGxpbWl0KVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn1cbmZ1bmN0aW9uIGRvdWJsZVF1b3RlZFN0cmluZyh2YWx1ZSwgY3R4KSB7XG4gICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcbiAgICBpZiAoY3R4Lm9wdGlvbnMuZG91YmxlUXVvdGVkQXNKU09OKVxuICAgICAgICByZXR1cm4ganNvbjtcbiAgICBjb25zdCB7IGltcGxpY2l0S2V5IH0gPSBjdHg7XG4gICAgY29uc3QgbWluTXVsdGlMaW5lTGVuZ3RoID0gY3R4Lm9wdGlvbnMuZG91YmxlUXVvdGVkTWluTXVsdGlMaW5lTGVuZ3RoO1xuICAgIGNvbnN0IGluZGVudCA9IGN0eC5pbmRlbnQgfHwgKGNvbnRhaW5zRG9jdW1lbnRNYXJrZXIodmFsdWUpID8gJyAgJyA6ICcnKTtcbiAgICBsZXQgc3RyID0gJyc7XG4gICAgbGV0IHN0YXJ0ID0gMDtcbiAgICBmb3IgKGxldCBpID0gMCwgY2ggPSBqc29uW2ldOyBjaDsgY2ggPSBqc29uWysraV0pIHtcbiAgICAgICAgaWYgKGNoID09PSAnICcgJiYganNvbltpICsgMV0gPT09ICdcXFxcJyAmJiBqc29uW2kgKyAyXSA9PT0gJ24nKSB7XG4gICAgICAgICAgICAvLyBzcGFjZSBiZWZvcmUgbmV3bGluZSBuZWVkcyB0byBiZSBlc2NhcGVkIHRvIG5vdCBiZSBmb2xkZWRcbiAgICAgICAgICAgIHN0ciArPSBqc29uLnNsaWNlKHN0YXJ0LCBpKSArICdcXFxcICc7XG4gICAgICAgICAgICBpICs9IDE7XG4gICAgICAgICAgICBzdGFydCA9IGk7XG4gICAgICAgICAgICBjaCA9ICdcXFxcJztcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2ggPT09ICdcXFxcJylcbiAgICAgICAgICAgIHN3aXRjaCAoanNvbltpICsgMV0pIHtcbiAgICAgICAgICAgICAgICBjYXNlICd1JzpcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9IGpzb24uc2xpY2Uoc3RhcnQsIGkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29kZSA9IGpzb24uc3Vic3RyKGkgKyAyLCA0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoY29kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJzAwMDAnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0gJ1xcXFwwJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnMDAwNyc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ciArPSAnXFxcXGEnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICcwMDBiJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9ICdcXFxcdic7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJzAwMWInOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0gJ1xcXFxlJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnMDA4NSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ciArPSAnXFxcXE4nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICcwMGEwJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9ICdcXFxcXyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJzIwMjgnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0gJ1xcXFxMJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnMjAyOSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ciArPSAnXFxcXFAnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29kZS5zdWJzdHIoMCwgMikgPT09ICcwMCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0gJ1xcXFx4JyArIGNvZGUuc3Vic3RyKDIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0ganNvbi5zdWJzdHIoaSwgNik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpICs9IDU7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydCA9IGkgKyAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ24nOlxuICAgICAgICAgICAgICAgICAgICBpZiAoaW1wbGljaXRLZXkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIGpzb25baSArIDJdID09PSAnXCInIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICBqc29uLmxlbmd0aCA8IG1pbk11bHRpTGluZUxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaSArPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZm9sZGluZyB3aWxsIGVhdCBmaXJzdCBuZXdsaW5lXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0ganNvbi5zbGljZShzdGFydCwgaSkgKyAnXFxuXFxuJztcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIChqc29uW2kgKyAyXSA9PT0gJ1xcXFwnICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAganNvbltpICsgM10gPT09ICduJyAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGpzb25baSArIDRdICE9PSAnXCInKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9ICdcXG4nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkgKz0gMjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHN0ciArPSBpbmRlbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzcGFjZSBhZnRlciBuZXdsaW5lIG5lZWRzIHRvIGJlIGVzY2FwZWQgdG8gbm90IGJlIGZvbGRlZFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGpzb25baSArIDJdID09PSAnICcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9ICdcXFxcJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGkgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0ID0gaSArIDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgaSArPSAxO1xuICAgICAgICAgICAgfVxuICAgIH1cbiAgICBzdHIgPSBzdGFydCA/IHN0ciArIGpzb24uc2xpY2Uoc3RhcnQpIDoganNvbjtcbiAgICByZXR1cm4gaW1wbGljaXRLZXlcbiAgICAgICAgPyBzdHJcbiAgICAgICAgOiBmb2xkRmxvd0xpbmVzLmZvbGRGbG93TGluZXMoc3RyLCBpbmRlbnQsIGZvbGRGbG93TGluZXMuRk9MRF9RVU9URUQsIGdldEZvbGRPcHRpb25zKGN0eCwgZmFsc2UpKTtcbn1cbmZ1bmN0aW9uIHNpbmdsZVF1b3RlZFN0cmluZyh2YWx1ZSwgY3R4KSB7XG4gICAgaWYgKGN0eC5vcHRpb25zLnNpbmdsZVF1b3RlID09PSBmYWxzZSB8fFxuICAgICAgICAoY3R4LmltcGxpY2l0S2V5ICYmIHZhbHVlLmluY2x1ZGVzKCdcXG4nKSkgfHxcbiAgICAgICAgL1sgXFx0XVxcbnxcXG5bIFxcdF0vLnRlc3QodmFsdWUpIC8vIHNpbmdsZSBxdW90ZWQgc3RyaW5nIGNhbid0IGhhdmUgbGVhZGluZyBvciB0cmFpbGluZyB3aGl0ZXNwYWNlIGFyb3VuZCBuZXdsaW5lXG4gICAgKVxuICAgICAgICByZXR1cm4gZG91YmxlUXVvdGVkU3RyaW5nKHZhbHVlLCBjdHgpO1xuICAgIGNvbnN0IGluZGVudCA9IGN0eC5pbmRlbnQgfHwgKGNvbnRhaW5zRG9jdW1lbnRNYXJrZXIodmFsdWUpID8gJyAgJyA6ICcnKTtcbiAgICBjb25zdCByZXMgPSBcIidcIiArIHZhbHVlLnJlcGxhY2UoLycvZywgXCInJ1wiKS5yZXBsYWNlKC9cXG4rL2csIGAkJlxcbiR7aW5kZW50fWApICsgXCInXCI7XG4gICAgcmV0dXJuIGN0eC5pbXBsaWNpdEtleVxuICAgICAgICA/IHJlc1xuICAgICAgICA6IGZvbGRGbG93TGluZXMuZm9sZEZsb3dMaW5lcyhyZXMsIGluZGVudCwgZm9sZEZsb3dMaW5lcy5GT0xEX0ZMT1csIGdldEZvbGRPcHRpb25zKGN0eCwgZmFsc2UpKTtcbn1cbmZ1bmN0aW9uIHF1b3RlZFN0cmluZyh2YWx1ZSwgY3R4KSB7XG4gICAgY29uc3QgeyBzaW5nbGVRdW90ZSB9ID0gY3R4Lm9wdGlvbnM7XG4gICAgbGV0IHFzO1xuICAgIGlmIChzaW5nbGVRdW90ZSA9PT0gZmFsc2UpXG4gICAgICAgIHFzID0gZG91YmxlUXVvdGVkU3RyaW5nO1xuICAgIGVsc2Uge1xuICAgICAgICBjb25zdCBoYXNEb3VibGUgPSB2YWx1ZS5pbmNsdWRlcygnXCInKTtcbiAgICAgICAgY29uc3QgaGFzU2luZ2xlID0gdmFsdWUuaW5jbHVkZXMoXCInXCIpO1xuICAgICAgICBpZiAoaGFzRG91YmxlICYmICFoYXNTaW5nbGUpXG4gICAgICAgICAgICBxcyA9IHNpbmdsZVF1b3RlZFN0cmluZztcbiAgICAgICAgZWxzZSBpZiAoaGFzU2luZ2xlICYmICFoYXNEb3VibGUpXG4gICAgICAgICAgICBxcyA9IGRvdWJsZVF1b3RlZFN0cmluZztcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcXMgPSBzaW5nbGVRdW90ZSA/IHNpbmdsZVF1b3RlZFN0cmluZyA6IGRvdWJsZVF1b3RlZFN0cmluZztcbiAgICB9XG4gICAgcmV0dXJuIHFzKHZhbHVlLCBjdHgpO1xufVxuLy8gVGhlIG5lZ2F0aXZlIGxvb2tiZWhpbmQgYXZvaWRzIGEgcG9seW5vbWlhbCBzZWFyY2gsXG4vLyBidXQgaXNuJ3Qgc3VwcG9ydGVkIHlldCBvbiBTYWZhcmk6IGh0dHBzOi8vY2FuaXVzZS5jb20vanMtcmVnZXhwLWxvb2tiZWhpbmRcbmxldCBibG9ja0VuZE5ld2xpbmVzO1xudHJ5IHtcbiAgICBibG9ja0VuZE5ld2xpbmVzID0gbmV3IFJlZ0V4cCgnKF58KD88IVxcbikpXFxuKyg/IVxcbnwkKScsICdnJyk7XG59XG5jYXRjaCB7XG4gICAgYmxvY2tFbmROZXdsaW5lcyA9IC9cXG4rKD8hXFxufCQpL2c7XG59XG5mdW5jdGlvbiBibG9ja1N0cmluZyh7IGNvbW1lbnQsIHR5cGUsIHZhbHVlIH0sIGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCkge1xuICAgIGNvbnN0IHsgYmxvY2tRdW90ZSwgY29tbWVudFN0cmluZywgbGluZVdpZHRoIH0gPSBjdHgub3B0aW9ucztcbiAgICAvLyAxLiBCbG9jayBjYW4ndCBlbmQgaW4gd2hpdGVzcGFjZSB1bmxlc3MgdGhlIGxhc3QgbGluZSBpcyBub24tZW1wdHkuXG4gICAgLy8gMi4gU3RyaW5ncyBjb25zaXN0aW5nIG9mIG9ubHkgd2hpdGVzcGFjZSBhcmUgYmVzdCByZW5kZXJlZCBleHBsaWNpdGx5LlxuICAgIGlmICghYmxvY2tRdW90ZSB8fCAvXFxuW1xcdCBdKyQvLnRlc3QodmFsdWUpKSB7XG4gICAgICAgIHJldHVybiBxdW90ZWRTdHJpbmcodmFsdWUsIGN0eCk7XG4gICAgfVxuICAgIGNvbnN0IGluZGVudCA9IGN0eC5pbmRlbnQgfHxcbiAgICAgICAgKGN0eC5mb3JjZUJsb2NrSW5kZW50IHx8IGNvbnRhaW5zRG9jdW1lbnRNYXJrZXIodmFsdWUpID8gJyAgJyA6ICcnKTtcbiAgICBjb25zdCBsaXRlcmFsID0gYmxvY2tRdW90ZSA9PT0gJ2xpdGVyYWwnXG4gICAgICAgID8gdHJ1ZVxuICAgICAgICA6IGJsb2NrUXVvdGUgPT09ICdmb2xkZWQnIHx8IHR5cGUgPT09IFNjYWxhci5TY2FsYXIuQkxPQ0tfRk9MREVEXG4gICAgICAgICAgICA/IGZhbHNlXG4gICAgICAgICAgICA6IHR5cGUgPT09IFNjYWxhci5TY2FsYXIuQkxPQ0tfTElURVJBTFxuICAgICAgICAgICAgICAgID8gdHJ1ZVxuICAgICAgICAgICAgICAgIDogIWxpbmVMZW5ndGhPdmVyTGltaXQodmFsdWUsIGxpbmVXaWR0aCwgaW5kZW50Lmxlbmd0aCk7XG4gICAgaWYgKCF2YWx1ZSlcbiAgICAgICAgcmV0dXJuIGxpdGVyYWwgPyAnfFxcbicgOiAnPlxcbic7XG4gICAgLy8gZGV0ZXJtaW5lIGNob21waW5nIGZyb20gd2hpdGVzcGFjZSBhdCB2YWx1ZSBlbmRcbiAgICBsZXQgY2hvbXA7XG4gICAgbGV0IGVuZFN0YXJ0O1xuICAgIGZvciAoZW5kU3RhcnQgPSB2YWx1ZS5sZW5ndGg7IGVuZFN0YXJ0ID4gMDsgLS1lbmRTdGFydCkge1xuICAgICAgICBjb25zdCBjaCA9IHZhbHVlW2VuZFN0YXJ0IC0gMV07XG4gICAgICAgIGlmIChjaCAhPT0gJ1xcbicgJiYgY2ggIT09ICdcXHQnICYmIGNoICE9PSAnICcpXG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG4gICAgbGV0IGVuZCA9IHZhbHVlLnN1YnN0cmluZyhlbmRTdGFydCk7XG4gICAgY29uc3QgZW5kTmxQb3MgPSBlbmQuaW5kZXhPZignXFxuJyk7XG4gICAgaWYgKGVuZE5sUG9zID09PSAtMSkge1xuICAgICAgICBjaG9tcCA9ICctJzsgLy8gc3RyaXBcbiAgICB9XG4gICAgZWxzZSBpZiAodmFsdWUgPT09IGVuZCB8fCBlbmRObFBvcyAhPT0gZW5kLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgY2hvbXAgPSAnKyc7IC8vIGtlZXBcbiAgICAgICAgaWYgKG9uQ2hvbXBLZWVwKVxuICAgICAgICAgICAgb25DaG9tcEtlZXAoKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNob21wID0gJyc7IC8vIGNsaXBcbiAgICB9XG4gICAgaWYgKGVuZCkge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlLnNsaWNlKDAsIC1lbmQubGVuZ3RoKTtcbiAgICAgICAgaWYgKGVuZFtlbmQubGVuZ3RoIC0gMV0gPT09ICdcXG4nKVxuICAgICAgICAgICAgZW5kID0gZW5kLnNsaWNlKDAsIC0xKTtcbiAgICAgICAgZW5kID0gZW5kLnJlcGxhY2UoYmxvY2tFbmROZXdsaW5lcywgYCQmJHtpbmRlbnR9YCk7XG4gICAgfVxuICAgIC8vIGRldGVybWluZSBpbmRlbnQgaW5kaWNhdG9yIGZyb20gd2hpdGVzcGFjZSBhdCB2YWx1ZSBzdGFydFxuICAgIGxldCBzdGFydFdpdGhTcGFjZSA9IGZhbHNlO1xuICAgIGxldCBzdGFydEVuZDtcbiAgICBsZXQgc3RhcnRObFBvcyA9IC0xO1xuICAgIGZvciAoc3RhcnRFbmQgPSAwOyBzdGFydEVuZCA8IHZhbHVlLmxlbmd0aDsgKytzdGFydEVuZCkge1xuICAgICAgICBjb25zdCBjaCA9IHZhbHVlW3N0YXJ0RW5kXTtcbiAgICAgICAgaWYgKGNoID09PSAnICcpXG4gICAgICAgICAgICBzdGFydFdpdGhTcGFjZSA9IHRydWU7XG4gICAgICAgIGVsc2UgaWYgKGNoID09PSAnXFxuJylcbiAgICAgICAgICAgIHN0YXJ0TmxQb3MgPSBzdGFydEVuZDtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGxldCBzdGFydCA9IHZhbHVlLnN1YnN0cmluZygwLCBzdGFydE5sUG9zIDwgc3RhcnRFbmQgPyBzdGFydE5sUG9zICsgMSA6IHN0YXJ0RW5kKTtcbiAgICBpZiAoc3RhcnQpIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5zdWJzdHJpbmcoc3RhcnQubGVuZ3RoKTtcbiAgICAgICAgc3RhcnQgPSBzdGFydC5yZXBsYWNlKC9cXG4rL2csIGAkJiR7aW5kZW50fWApO1xuICAgIH1cbiAgICBjb25zdCBpbmRlbnRTaXplID0gaW5kZW50ID8gJzInIDogJzEnOyAvLyByb290IGlzIGF0IC0xXG4gICAgLy8gTGVhZGluZyB8IG9yID4gaXMgYWRkZWQgbGF0ZXJcbiAgICBsZXQgaGVhZGVyID0gKHN0YXJ0V2l0aFNwYWNlID8gaW5kZW50U2l6ZSA6ICcnKSArIGNob21wO1xuICAgIGlmIChjb21tZW50KSB7XG4gICAgICAgIGhlYWRlciArPSAnICcgKyBjb21tZW50U3RyaW5nKGNvbW1lbnQucmVwbGFjZSgvID9bXFxyXFxuXSsvZywgJyAnKSk7XG4gICAgICAgIGlmIChvbkNvbW1lbnQpXG4gICAgICAgICAgICBvbkNvbW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKCFsaXRlcmFsKSB7XG4gICAgICAgIGNvbnN0IGZvbGRlZFZhbHVlID0gdmFsdWVcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cXG4rL2csICdcXG4kJicpXG4gICAgICAgICAgICAucmVwbGFjZSgvKD86XnxcXG4pKFtcXHQgXS4qKSg/OihbXFxuXFx0IF0qKVxcbig/IVtcXG5cXHQgXSkpPy9nLCAnJDEkMicpIC8vIG1vcmUtaW5kZW50ZWQgbGluZXMgYXJlbid0IGZvbGRlZFxuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgXiBtb3JlLWluZC4gXiBlbXB0eSAgICAgXiBjYXB0dXJlIG5leHQgZW1wdHkgbGluZXMgb25seSBhdCBlbmQgb2YgaW5kZW50XG4gICAgICAgICAgICAucmVwbGFjZSgvXFxuKy9nLCBgJCYke2luZGVudH1gKTtcbiAgICAgICAgbGV0IGxpdGVyYWxGYWxsYmFjayA9IGZhbHNlO1xuICAgICAgICBjb25zdCBmb2xkT3B0aW9ucyA9IGdldEZvbGRPcHRpb25zKGN0eCwgdHJ1ZSk7XG4gICAgICAgIGlmIChibG9ja1F1b3RlICE9PSAnZm9sZGVkJyAmJiB0eXBlICE9PSBTY2FsYXIuU2NhbGFyLkJMT0NLX0ZPTERFRCkge1xuICAgICAgICAgICAgZm9sZE9wdGlvbnMub25PdmVyZmxvdyA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBsaXRlcmFsRmFsbGJhY2sgPSB0cnVlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBib2R5ID0gZm9sZEZsb3dMaW5lcy5mb2xkRmxvd0xpbmVzKGAke3N0YXJ0fSR7Zm9sZGVkVmFsdWV9JHtlbmR9YCwgaW5kZW50LCBmb2xkRmxvd0xpbmVzLkZPTERfQkxPQ0ssIGZvbGRPcHRpb25zKTtcbiAgICAgICAgaWYgKCFsaXRlcmFsRmFsbGJhY2spXG4gICAgICAgICAgICByZXR1cm4gYD4ke2hlYWRlcn1cXG4ke2luZGVudH0ke2JvZHl9YDtcbiAgICB9XG4gICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC9cXG4rL2csIGAkJiR7aW5kZW50fWApO1xuICAgIHJldHVybiBgfCR7aGVhZGVyfVxcbiR7aW5kZW50fSR7c3RhcnR9JHt2YWx1ZX0ke2VuZH1gO1xufVxuZnVuY3Rpb24gcGxhaW5TdHJpbmcoaXRlbSwgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKSB7XG4gICAgY29uc3QgeyB0eXBlLCB2YWx1ZSB9ID0gaXRlbTtcbiAgICBjb25zdCB7IGFjdHVhbFN0cmluZywgaW1wbGljaXRLZXksIGluZGVudCwgaW5kZW50U3RlcCwgaW5GbG93IH0gPSBjdHg7XG4gICAgaWYgKChpbXBsaWNpdEtleSAmJiB2YWx1ZS5pbmNsdWRlcygnXFxuJykpIHx8XG4gICAgICAgIChpbkZsb3cgJiYgL1tbXFxde30sXS8udGVzdCh2YWx1ZSkpKSB7XG4gICAgICAgIHJldHVybiBxdW90ZWRTdHJpbmcodmFsdWUsIGN0eCk7XG4gICAgfVxuICAgIGlmICgvXltcXG5cXHQgLFtcXF17fSMmKiF8PidcIiVAYF18Xls/LV0kfF5bPy1dWyBcXHRdfFtcXG46XVsgXFx0XXxbIFxcdF1cXG58W1xcblxcdCBdI3xbXFxuXFx0IDpdJC8udGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgLy8gbm90IGFsbG93ZWQ6XG4gICAgICAgIC8vIC0gJy0nIG9yICc/J1xuICAgICAgICAvLyAtIHN0YXJ0IHdpdGggYW4gaW5kaWNhdG9yIGNoYXJhY3RlciAoZXhjZXB0IFs/Oi1dKSBvciAvWz8tXSAvXG4gICAgICAgIC8vIC0gJ1xcbiAnLCAnOiAnIG9yICcgXFxuJyBhbnl3aGVyZVxuICAgICAgICAvLyAtICcjJyBub3QgcHJlY2VkZWQgYnkgYSBub24tc3BhY2UgY2hhclxuICAgICAgICAvLyAtIGVuZCB3aXRoICcgJyBvciAnOidcbiAgICAgICAgcmV0dXJuIGltcGxpY2l0S2V5IHx8IGluRmxvdyB8fCAhdmFsdWUuaW5jbHVkZXMoJ1xcbicpXG4gICAgICAgICAgICA/IHF1b3RlZFN0cmluZyh2YWx1ZSwgY3R4KVxuICAgICAgICAgICAgOiBibG9ja1N0cmluZyhpdGVtLCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApO1xuICAgIH1cbiAgICBpZiAoIWltcGxpY2l0S2V5ICYmXG4gICAgICAgICFpbkZsb3cgJiZcbiAgICAgICAgdHlwZSAhPT0gU2NhbGFyLlNjYWxhci5QTEFJTiAmJlxuICAgICAgICB2YWx1ZS5pbmNsdWRlcygnXFxuJykpIHtcbiAgICAgICAgLy8gV2hlcmUgYWxsb3dlZCAmIHR5cGUgbm90IHNldCBleHBsaWNpdGx5LCBwcmVmZXIgYmxvY2sgc3R5bGUgZm9yIG11bHRpbGluZSBzdHJpbmdzXG4gICAgICAgIHJldHVybiBibG9ja1N0cmluZyhpdGVtLCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApO1xuICAgIH1cbiAgICBpZiAoY29udGFpbnNEb2N1bWVudE1hcmtlcih2YWx1ZSkpIHtcbiAgICAgICAgaWYgKGluZGVudCA9PT0gJycpIHtcbiAgICAgICAgICAgIGN0eC5mb3JjZUJsb2NrSW5kZW50ID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybiBibG9ja1N0cmluZyhpdGVtLCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGltcGxpY2l0S2V5ICYmIGluZGVudCA9PT0gaW5kZW50U3RlcCkge1xuICAgICAgICAgICAgcmV0dXJuIHF1b3RlZFN0cmluZyh2YWx1ZSwgY3R4KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBzdHIgPSB2YWx1ZS5yZXBsYWNlKC9cXG4rL2csIGAkJlxcbiR7aW5kZW50fWApO1xuICAgIC8vIFZlcmlmeSB0aGF0IG91dHB1dCB3aWxsIGJlIHBhcnNlZCBhcyBhIHN0cmluZywgYXMgZS5nLiBwbGFpbiBudW1iZXJzIGFuZFxuICAgIC8vIGJvb2xlYW5zIGdldCBwYXJzZWQgd2l0aCB0aG9zZSB0eXBlcyBpbiB2MS4yIChlLmcuICc0MicsICd0cnVlJyAmICcwLjllLTMnKSxcbiAgICAvLyBhbmQgb3RoZXJzIGluIHYxLjEuXG4gICAgaWYgKGFjdHVhbFN0cmluZykge1xuICAgICAgICBjb25zdCB0ZXN0ID0gKHRhZykgPT4gdGFnLmRlZmF1bHQgJiYgdGFnLnRhZyAhPT0gJ3RhZzp5YW1sLm9yZywyMDAyOnN0cicgJiYgdGFnLnRlc3Q/LnRlc3Qoc3RyKTtcbiAgICAgICAgY29uc3QgeyBjb21wYXQsIHRhZ3MgfSA9IGN0eC5kb2Muc2NoZW1hO1xuICAgICAgICBpZiAodGFncy5zb21lKHRlc3QpIHx8IGNvbXBhdD8uc29tZSh0ZXN0KSlcbiAgICAgICAgICAgIHJldHVybiBxdW90ZWRTdHJpbmcodmFsdWUsIGN0eCk7XG4gICAgfVxuICAgIHJldHVybiBpbXBsaWNpdEtleVxuICAgICAgICA/IHN0clxuICAgICAgICA6IGZvbGRGbG93TGluZXMuZm9sZEZsb3dMaW5lcyhzdHIsIGluZGVudCwgZm9sZEZsb3dMaW5lcy5GT0xEX0ZMT1csIGdldEZvbGRPcHRpb25zKGN0eCwgZmFsc2UpKTtcbn1cbmZ1bmN0aW9uIHN0cmluZ2lmeVN0cmluZyhpdGVtLCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApIHtcbiAgICBjb25zdCB7IGltcGxpY2l0S2V5LCBpbkZsb3cgfSA9IGN0eDtcbiAgICBjb25zdCBzcyA9IHR5cGVvZiBpdGVtLnZhbHVlID09PSAnc3RyaW5nJ1xuICAgICAgICA/IGl0ZW1cbiAgICAgICAgOiBPYmplY3QuYXNzaWduKHt9LCBpdGVtLCB7IHZhbHVlOiBTdHJpbmcoaXRlbS52YWx1ZSkgfSk7XG4gICAgbGV0IHsgdHlwZSB9ID0gaXRlbTtcbiAgICBpZiAodHlwZSAhPT0gU2NhbGFyLlNjYWxhci5RVU9URV9ET1VCTEUpIHtcbiAgICAgICAgLy8gZm9yY2UgZG91YmxlIHF1b3RlcyBvbiBjb250cm9sIGNoYXJhY3RlcnMgJiB1bnBhaXJlZCBzdXJyb2dhdGVzXG4gICAgICAgIGlmICgvW1xceDAwLVxceDA4XFx4MGItXFx4MWZcXHg3Zi1cXHg5ZlxcdXtEODAwfS1cXHV7REZGRn1dL3UudGVzdChzcy52YWx1ZSkpXG4gICAgICAgICAgICB0eXBlID0gU2NhbGFyLlNjYWxhci5RVU9URV9ET1VCTEU7XG4gICAgfVxuICAgIGNvbnN0IF9zdHJpbmdpZnkgPSAoX3R5cGUpID0+IHtcbiAgICAgICAgc3dpdGNoIChfdHlwZSkge1xuICAgICAgICAgICAgY2FzZSBTY2FsYXIuU2NhbGFyLkJMT0NLX0ZPTERFRDpcbiAgICAgICAgICAgIGNhc2UgU2NhbGFyLlNjYWxhci5CTE9DS19MSVRFUkFMOlxuICAgICAgICAgICAgICAgIHJldHVybiBpbXBsaWNpdEtleSB8fCBpbkZsb3dcbiAgICAgICAgICAgICAgICAgICAgPyBxdW90ZWRTdHJpbmcoc3MudmFsdWUsIGN0eCkgLy8gYmxvY2tzIGFyZSBub3QgdmFsaWQgaW5zaWRlIGZsb3cgY29udGFpbmVyc1xuICAgICAgICAgICAgICAgICAgICA6IGJsb2NrU3RyaW5nKHNzLCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApO1xuICAgICAgICAgICAgY2FzZSBTY2FsYXIuU2NhbGFyLlFVT1RFX0RPVUJMRTpcbiAgICAgICAgICAgICAgICByZXR1cm4gZG91YmxlUXVvdGVkU3RyaW5nKHNzLnZhbHVlLCBjdHgpO1xuICAgICAgICAgICAgY2FzZSBTY2FsYXIuU2NhbGFyLlFVT1RFX1NJTkdMRTpcbiAgICAgICAgICAgICAgICByZXR1cm4gc2luZ2xlUXVvdGVkU3RyaW5nKHNzLnZhbHVlLCBjdHgpO1xuICAgICAgICAgICAgY2FzZSBTY2FsYXIuU2NhbGFyLlBMQUlOOlxuICAgICAgICAgICAgICAgIHJldHVybiBwbGFpblN0cmluZyhzcywgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKTtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGxldCByZXMgPSBfc3RyaW5naWZ5KHR5cGUpO1xuICAgIGlmIChyZXMgPT09IG51bGwpIHtcbiAgICAgICAgY29uc3QgeyBkZWZhdWx0S2V5VHlwZSwgZGVmYXVsdFN0cmluZ1R5cGUgfSA9IGN0eC5vcHRpb25zO1xuICAgICAgICBjb25zdCB0ID0gKGltcGxpY2l0S2V5ICYmIGRlZmF1bHRLZXlUeXBlKSB8fCBkZWZhdWx0U3RyaW5nVHlwZTtcbiAgICAgICAgcmVzID0gX3N0cmluZ2lmeSh0KTtcbiAgICAgICAgaWYgKHJlcyA9PT0gbnVsbClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5zdXBwb3J0ZWQgZGVmYXVsdCBzdHJpbmcgdHlwZSAke3R9YCk7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG59XG5cbmV4cG9ydHMuc3RyaW5naWZ5U3RyaW5nID0gc3RyaW5naWZ5U3RyaW5nO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBhbmNob3JzID0gcmVxdWlyZSgnLi4vZG9jL2FuY2hvcnMuanMnKTtcbnZhciBpZGVudGl0eSA9IHJlcXVpcmUoJy4uL25vZGVzL2lkZW50aXR5LmpzJyk7XG52YXIgc3RyaW5naWZ5Q29tbWVudCA9IHJlcXVpcmUoJy4vc3RyaW5naWZ5Q29tbWVudC5qcycpO1xudmFyIHN0cmluZ2lmeVN0cmluZyA9IHJlcXVpcmUoJy4vc3RyaW5naWZ5U3RyaW5nLmpzJyk7XG5cbmZ1bmN0aW9uIGNyZWF0ZVN0cmluZ2lmeUNvbnRleHQoZG9jLCBvcHRpb25zKSB7XG4gICAgY29uc3Qgb3B0ID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgIGJsb2NrUXVvdGU6IHRydWUsXG4gICAgICAgIGNvbW1lbnRTdHJpbmc6IHN0cmluZ2lmeUNvbW1lbnQuc3RyaW5naWZ5Q29tbWVudCxcbiAgICAgICAgZGVmYXVsdEtleVR5cGU6IG51bGwsXG4gICAgICAgIGRlZmF1bHRTdHJpbmdUeXBlOiAnUExBSU4nLFxuICAgICAgICBkaXJlY3RpdmVzOiBudWxsLFxuICAgICAgICBkb3VibGVRdW90ZWRBc0pTT046IGZhbHNlLFxuICAgICAgICBkb3VibGVRdW90ZWRNaW5NdWx0aUxpbmVMZW5ndGg6IDQwLFxuICAgICAgICBmYWxzZVN0cjogJ2ZhbHNlJyxcbiAgICAgICAgZmxvd0NvbGxlY3Rpb25QYWRkaW5nOiB0cnVlLFxuICAgICAgICBpbmRlbnRTZXE6IHRydWUsXG4gICAgICAgIGxpbmVXaWR0aDogODAsXG4gICAgICAgIG1pbkNvbnRlbnRXaWR0aDogMjAsXG4gICAgICAgIG51bGxTdHI6ICdudWxsJyxcbiAgICAgICAgc2ltcGxlS2V5czogZmFsc2UsXG4gICAgICAgIHNpbmdsZVF1b3RlOiBudWxsLFxuICAgICAgICB0cmFpbGluZ0NvbW1hOiBmYWxzZSxcbiAgICAgICAgdHJ1ZVN0cjogJ3RydWUnLFxuICAgICAgICB2ZXJpZnlBbGlhc09yZGVyOiB0cnVlXG4gICAgfSwgZG9jLnNjaGVtYS50b1N0cmluZ09wdGlvbnMsIG9wdGlvbnMpO1xuICAgIGxldCBpbkZsb3c7XG4gICAgc3dpdGNoIChvcHQuY29sbGVjdGlvblN0eWxlKSB7XG4gICAgICAgIGNhc2UgJ2Jsb2NrJzpcbiAgICAgICAgICAgIGluRmxvdyA9IGZhbHNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2Zsb3cnOlxuICAgICAgICAgICAgaW5GbG93ID0gdHJ1ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgaW5GbG93ID0gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgYW5jaG9yczogbmV3IFNldCgpLFxuICAgICAgICBkb2MsXG4gICAgICAgIGZsb3dDb2xsZWN0aW9uUGFkZGluZzogb3B0LmZsb3dDb2xsZWN0aW9uUGFkZGluZyA/ICcgJyA6ICcnLFxuICAgICAgICBpbmRlbnQ6ICcnLFxuICAgICAgICBpbmRlbnRTdGVwOiB0eXBlb2Ygb3B0LmluZGVudCA9PT0gJ251bWJlcicgPyAnICcucmVwZWF0KG9wdC5pbmRlbnQpIDogJyAgJyxcbiAgICAgICAgaW5GbG93LFxuICAgICAgICBvcHRpb25zOiBvcHRcbiAgICB9O1xufVxuZnVuY3Rpb24gZ2V0VGFnT2JqZWN0KHRhZ3MsIGl0ZW0pIHtcbiAgICBpZiAoaXRlbS50YWcpIHtcbiAgICAgICAgY29uc3QgbWF0Y2ggPSB0YWdzLmZpbHRlcih0ID0+IHQudGFnID09PSBpdGVtLnRhZyk7XG4gICAgICAgIGlmIChtYXRjaC5sZW5ndGggPiAwKVxuICAgICAgICAgICAgcmV0dXJuIG1hdGNoLmZpbmQodCA9PiB0LmZvcm1hdCA9PT0gaXRlbS5mb3JtYXQpID8/IG1hdGNoWzBdO1xuICAgIH1cbiAgICBsZXQgdGFnT2JqID0gdW5kZWZpbmVkO1xuICAgIGxldCBvYmo7XG4gICAgaWYgKGlkZW50aXR5LmlzU2NhbGFyKGl0ZW0pKSB7XG4gICAgICAgIG9iaiA9IGl0ZW0udmFsdWU7XG4gICAgICAgIGxldCBtYXRjaCA9IHRhZ3MuZmlsdGVyKHQgPT4gdC5pZGVudGlmeT8uKG9iaikpO1xuICAgICAgICBpZiAobWF0Y2gubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgY29uc3QgdGVzdE1hdGNoID0gbWF0Y2guZmlsdGVyKHQgPT4gdC50ZXN0KTtcbiAgICAgICAgICAgIGlmICh0ZXN0TWF0Y2gubGVuZ3RoID4gMClcbiAgICAgICAgICAgICAgICBtYXRjaCA9IHRlc3RNYXRjaDtcbiAgICAgICAgfVxuICAgICAgICB0YWdPYmogPVxuICAgICAgICAgICAgbWF0Y2guZmluZCh0ID0+IHQuZm9ybWF0ID09PSBpdGVtLmZvcm1hdCkgPz8gbWF0Y2guZmluZCh0ID0+ICF0LmZvcm1hdCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBvYmogPSBpdGVtO1xuICAgICAgICB0YWdPYmogPSB0YWdzLmZpbmQodCA9PiB0Lm5vZGVDbGFzcyAmJiBvYmogaW5zdGFuY2VvZiB0Lm5vZGVDbGFzcyk7XG4gICAgfVxuICAgIGlmICghdGFnT2JqKSB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBvYmo/LmNvbnN0cnVjdG9yPy5uYW1lID8/IChvYmogPT09IG51bGwgPyAnbnVsbCcgOiB0eXBlb2Ygb2JqKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUYWcgbm90IHJlc29sdmVkIGZvciAke25hbWV9IHZhbHVlYCk7XG4gICAgfVxuICAgIHJldHVybiB0YWdPYmo7XG59XG4vLyBuZWVkcyB0byBiZSBjYWxsZWQgYmVmb3JlIHZhbHVlIHN0cmluZ2lmaWVyIHRvIGFsbG93IGZvciBjaXJjdWxhciBhbmNob3IgcmVmc1xuZnVuY3Rpb24gc3RyaW5naWZ5UHJvcHMobm9kZSwgdGFnT2JqLCB7IGFuY2hvcnM6IGFuY2hvcnMkMSwgZG9jIH0pIHtcbiAgICBpZiAoIWRvYy5kaXJlY3RpdmVzKVxuICAgICAgICByZXR1cm4gJyc7XG4gICAgY29uc3QgcHJvcHMgPSBbXTtcbiAgICBjb25zdCBhbmNob3IgPSAoaWRlbnRpdHkuaXNTY2FsYXIobm9kZSkgfHwgaWRlbnRpdHkuaXNDb2xsZWN0aW9uKG5vZGUpKSAmJiBub2RlLmFuY2hvcjtcbiAgICBpZiAoYW5jaG9yICYmIGFuY2hvcnMuYW5jaG9ySXNWYWxpZChhbmNob3IpKSB7XG4gICAgICAgIGFuY2hvcnMkMS5hZGQoYW5jaG9yKTtcbiAgICAgICAgcHJvcHMucHVzaChgJiR7YW5jaG9yfWApO1xuICAgIH1cbiAgICBjb25zdCB0YWcgPSBub2RlLnRhZyA/PyAodGFnT2JqLmRlZmF1bHQgPyBudWxsIDogdGFnT2JqLnRhZyk7XG4gICAgaWYgKHRhZylcbiAgICAgICAgcHJvcHMucHVzaChkb2MuZGlyZWN0aXZlcy50YWdTdHJpbmcodGFnKSk7XG4gICAgcmV0dXJuIHByb3BzLmpvaW4oJyAnKTtcbn1cbmZ1bmN0aW9uIHN0cmluZ2lmeShpdGVtLCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApIHtcbiAgICBpZiAoaWRlbnRpdHkuaXNQYWlyKGl0ZW0pKVxuICAgICAgICByZXR1cm4gaXRlbS50b1N0cmluZyhjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApO1xuICAgIGlmIChpZGVudGl0eS5pc0FsaWFzKGl0ZW0pKSB7XG4gICAgICAgIGlmIChjdHguZG9jLmRpcmVjdGl2ZXMpXG4gICAgICAgICAgICByZXR1cm4gaXRlbS50b1N0cmluZyhjdHgpO1xuICAgICAgICBpZiAoY3R4LnJlc29sdmVkQWxpYXNlcz8uaGFzKGl0ZW0pKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBDYW5ub3Qgc3RyaW5naWZ5IGNpcmN1bGFyIHN0cnVjdHVyZSB3aXRob3V0IGFsaWFzIG5vZGVzYCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoY3R4LnJlc29sdmVkQWxpYXNlcylcbiAgICAgICAgICAgICAgICBjdHgucmVzb2x2ZWRBbGlhc2VzLmFkZChpdGVtKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBjdHgucmVzb2x2ZWRBbGlhc2VzID0gbmV3IFNldChbaXRlbV0pO1xuICAgICAgICAgICAgaXRlbSA9IGl0ZW0ucmVzb2x2ZShjdHguZG9jKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBsZXQgdGFnT2JqID0gdW5kZWZpbmVkO1xuICAgIGNvbnN0IG5vZGUgPSBpZGVudGl0eS5pc05vZGUoaXRlbSlcbiAgICAgICAgPyBpdGVtXG4gICAgICAgIDogY3R4LmRvYy5jcmVhdGVOb2RlKGl0ZW0sIHsgb25UYWdPYmo6IG8gPT4gKHRhZ09iaiA9IG8pIH0pO1xuICAgIHRhZ09iaiA/PyAodGFnT2JqID0gZ2V0VGFnT2JqZWN0KGN0eC5kb2Muc2NoZW1hLnRhZ3MsIG5vZGUpKTtcbiAgICBjb25zdCBwcm9wcyA9IHN0cmluZ2lmeVByb3BzKG5vZGUsIHRhZ09iaiwgY3R4KTtcbiAgICBpZiAocHJvcHMubGVuZ3RoID4gMClcbiAgICAgICAgY3R4LmluZGVudEF0U3RhcnQgPSAoY3R4LmluZGVudEF0U3RhcnQgPz8gMCkgKyBwcm9wcy5sZW5ndGggKyAxO1xuICAgIGNvbnN0IHN0ciA9IHR5cGVvZiB0YWdPYmouc3RyaW5naWZ5ID09PSAnZnVuY3Rpb24nXG4gICAgICAgID8gdGFnT2JqLnN0cmluZ2lmeShub2RlLCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApXG4gICAgICAgIDogaWRlbnRpdHkuaXNTY2FsYXIobm9kZSlcbiAgICAgICAgICAgID8gc3RyaW5naWZ5U3RyaW5nLnN0cmluZ2lmeVN0cmluZyhub2RlLCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApXG4gICAgICAgICAgICA6IG5vZGUudG9TdHJpbmcoY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKTtcbiAgICBpZiAoIXByb3BzKVxuICAgICAgICByZXR1cm4gc3RyO1xuICAgIHJldHVybiBpZGVudGl0eS5pc1NjYWxhcihub2RlKSB8fCBzdHJbMF0gPT09ICd7JyB8fCBzdHJbMF0gPT09ICdbJ1xuICAgICAgICA/IGAke3Byb3BzfSAke3N0cn1gXG4gICAgICAgIDogYCR7cHJvcHN9XFxuJHtjdHguaW5kZW50fSR7c3RyfWA7XG59XG5cbmV4cG9ydHMuY3JlYXRlU3RyaW5naWZ5Q29udGV4dCA9IGNyZWF0ZVN0cmluZ2lmeUNvbnRleHQ7XG5leHBvcnRzLnN0cmluZ2lmeSA9IHN0cmluZ2lmeTtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuLi9ub2Rlcy9pZGVudGl0eS5qcycpO1xudmFyIFNjYWxhciA9IHJlcXVpcmUoJy4uL25vZGVzL1NjYWxhci5qcycpO1xudmFyIHN0cmluZ2lmeSA9IHJlcXVpcmUoJy4vc3RyaW5naWZ5LmpzJyk7XG52YXIgc3RyaW5naWZ5Q29tbWVudCA9IHJlcXVpcmUoJy4vc3RyaW5naWZ5Q29tbWVudC5qcycpO1xuXG5mdW5jdGlvbiBzdHJpbmdpZnlQYWlyKHsga2V5LCB2YWx1ZSB9LCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApIHtcbiAgICBjb25zdCB7IGFsbE51bGxWYWx1ZXMsIGRvYywgaW5kZW50LCBpbmRlbnRTdGVwLCBvcHRpb25zOiB7IGNvbW1lbnRTdHJpbmcsIGluZGVudFNlcSwgc2ltcGxlS2V5cyB9IH0gPSBjdHg7XG4gICAgbGV0IGtleUNvbW1lbnQgPSAoaWRlbnRpdHkuaXNOb2RlKGtleSkgJiYga2V5LmNvbW1lbnQpIHx8IG51bGw7XG4gICAgaWYgKHNpbXBsZUtleXMpIHtcbiAgICAgICAgaWYgKGtleUNvbW1lbnQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignV2l0aCBzaW1wbGUga2V5cywga2V5IG5vZGVzIGNhbm5vdCBoYXZlIGNvbW1lbnRzJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlkZW50aXR5LmlzQ29sbGVjdGlvbihrZXkpIHx8ICghaWRlbnRpdHkuaXNOb2RlKGtleSkgJiYgdHlwZW9mIGtleSA9PT0gJ29iamVjdCcpKSB7XG4gICAgICAgICAgICBjb25zdCBtc2cgPSAnV2l0aCBzaW1wbGUga2V5cywgY29sbGVjdGlvbiBjYW5ub3QgYmUgdXNlZCBhcyBhIGtleSB2YWx1ZSc7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IobXNnKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBsZXQgZXhwbGljaXRLZXkgPSAhc2ltcGxlS2V5cyAmJlxuICAgICAgICAoIWtleSB8fFxuICAgICAgICAgICAgKGtleUNvbW1lbnQgJiYgdmFsdWUgPT0gbnVsbCAmJiAhY3R4LmluRmxvdykgfHxcbiAgICAgICAgICAgIGlkZW50aXR5LmlzQ29sbGVjdGlvbihrZXkpIHx8XG4gICAgICAgICAgICAoaWRlbnRpdHkuaXNTY2FsYXIoa2V5KVxuICAgICAgICAgICAgICAgID8ga2V5LnR5cGUgPT09IFNjYWxhci5TY2FsYXIuQkxPQ0tfRk9MREVEIHx8IGtleS50eXBlID09PSBTY2FsYXIuU2NhbGFyLkJMT0NLX0xJVEVSQUxcbiAgICAgICAgICAgICAgICA6IHR5cGVvZiBrZXkgPT09ICdvYmplY3QnKSk7XG4gICAgY3R4ID0gT2JqZWN0LmFzc2lnbih7fSwgY3R4LCB7XG4gICAgICAgIGFsbE51bGxWYWx1ZXM6IGZhbHNlLFxuICAgICAgICBpbXBsaWNpdEtleTogIWV4cGxpY2l0S2V5ICYmIChzaW1wbGVLZXlzIHx8ICFhbGxOdWxsVmFsdWVzKSxcbiAgICAgICAgaW5kZW50OiBpbmRlbnQgKyBpbmRlbnRTdGVwXG4gICAgfSk7XG4gICAgbGV0IGtleUNvbW1lbnREb25lID0gZmFsc2U7XG4gICAgbGV0IGNob21wS2VlcCA9IGZhbHNlO1xuICAgIGxldCBzdHIgPSBzdHJpbmdpZnkuc3RyaW5naWZ5KGtleSwgY3R4LCAoKSA9PiAoa2V5Q29tbWVudERvbmUgPSB0cnVlKSwgKCkgPT4gKGNob21wS2VlcCA9IHRydWUpKTtcbiAgICBpZiAoIWV4cGxpY2l0S2V5ICYmICFjdHguaW5GbG93ICYmIHN0ci5sZW5ndGggPiAxMDI0KSB7XG4gICAgICAgIGlmIChzaW1wbGVLZXlzKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdXaXRoIHNpbXBsZSBrZXlzLCBzaW5nbGUgbGluZSBzY2FsYXIgbXVzdCBub3Qgc3BhbiBtb3JlIHRoYW4gMTAyNCBjaGFyYWN0ZXJzJyk7XG4gICAgICAgIGV4cGxpY2l0S2V5ID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGN0eC5pbkZsb3cpIHtcbiAgICAgICAgaWYgKGFsbE51bGxWYWx1ZXMgfHwgdmFsdWUgPT0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKGtleUNvbW1lbnREb25lICYmIG9uQ29tbWVudClcbiAgICAgICAgICAgICAgICBvbkNvbW1lbnQoKTtcbiAgICAgICAgICAgIHJldHVybiBzdHIgPT09ICcnID8gJz8nIDogZXhwbGljaXRLZXkgPyBgPyAke3N0cn1gIDogc3RyO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKChhbGxOdWxsVmFsdWVzICYmICFzaW1wbGVLZXlzKSB8fCAodmFsdWUgPT0gbnVsbCAmJiBleHBsaWNpdEtleSkpIHtcbiAgICAgICAgc3RyID0gYD8gJHtzdHJ9YDtcbiAgICAgICAgaWYgKGtleUNvbW1lbnQgJiYgIWtleUNvbW1lbnREb25lKSB7XG4gICAgICAgICAgICBzdHIgKz0gc3RyaW5naWZ5Q29tbWVudC5saW5lQ29tbWVudChzdHIsIGN0eC5pbmRlbnQsIGNvbW1lbnRTdHJpbmcoa2V5Q29tbWVudCkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGNob21wS2VlcCAmJiBvbkNob21wS2VlcClcbiAgICAgICAgICAgIG9uQ2hvbXBLZWVwKCk7XG4gICAgICAgIHJldHVybiBzdHI7XG4gICAgfVxuICAgIGlmIChrZXlDb21tZW50RG9uZSlcbiAgICAgICAga2V5Q29tbWVudCA9IG51bGw7XG4gICAgaWYgKGV4cGxpY2l0S2V5KSB7XG4gICAgICAgIGlmIChrZXlDb21tZW50KVxuICAgICAgICAgICAgc3RyICs9IHN0cmluZ2lmeUNvbW1lbnQubGluZUNvbW1lbnQoc3RyLCBjdHguaW5kZW50LCBjb21tZW50U3RyaW5nKGtleUNvbW1lbnQpKTtcbiAgICAgICAgc3RyID0gYD8gJHtzdHJ9XFxuJHtpbmRlbnR9OmA7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBzdHIgPSBgJHtzdHJ9OmA7XG4gICAgICAgIGlmIChrZXlDb21tZW50KVxuICAgICAgICAgICAgc3RyICs9IHN0cmluZ2lmeUNvbW1lbnQubGluZUNvbW1lbnQoc3RyLCBjdHguaW5kZW50LCBjb21tZW50U3RyaW5nKGtleUNvbW1lbnQpKTtcbiAgICB9XG4gICAgbGV0IHZzYiwgdmNiLCB2YWx1ZUNvbW1lbnQ7XG4gICAgaWYgKGlkZW50aXR5LmlzTm9kZSh2YWx1ZSkpIHtcbiAgICAgICAgdnNiID0gISF2YWx1ZS5zcGFjZUJlZm9yZTtcbiAgICAgICAgdmNiID0gdmFsdWUuY29tbWVudEJlZm9yZTtcbiAgICAgICAgdmFsdWVDb21tZW50ID0gdmFsdWUuY29tbWVudDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHZzYiA9IGZhbHNlO1xuICAgICAgICB2Y2IgPSBudWxsO1xuICAgICAgICB2YWx1ZUNvbW1lbnQgPSBudWxsO1xuICAgICAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JylcbiAgICAgICAgICAgIHZhbHVlID0gZG9jLmNyZWF0ZU5vZGUodmFsdWUpO1xuICAgIH1cbiAgICBjdHguaW1wbGljaXRLZXkgPSBmYWxzZTtcbiAgICBpZiAoIWV4cGxpY2l0S2V5ICYmICFrZXlDb21tZW50ICYmIGlkZW50aXR5LmlzU2NhbGFyKHZhbHVlKSlcbiAgICAgICAgY3R4LmluZGVudEF0U3RhcnQgPSBzdHIubGVuZ3RoICsgMTtcbiAgICBjaG9tcEtlZXAgPSBmYWxzZTtcbiAgICBpZiAoIWluZGVudFNlcSAmJlxuICAgICAgICBpbmRlbnRTdGVwLmxlbmd0aCA+PSAyICYmXG4gICAgICAgICFjdHguaW5GbG93ICYmXG4gICAgICAgICFleHBsaWNpdEtleSAmJlxuICAgICAgICBpZGVudGl0eS5pc1NlcSh2YWx1ZSkgJiZcbiAgICAgICAgIXZhbHVlLmZsb3cgJiZcbiAgICAgICAgIXZhbHVlLnRhZyAmJlxuICAgICAgICAhdmFsdWUuYW5jaG9yKSB7XG4gICAgICAgIC8vIElmIGluZGVudFNlcSA9PT0gZmFsc2UsIGNvbnNpZGVyICctICcgYXMgcGFydCBvZiBpbmRlbnRhdGlvbiB3aGVyZSBwb3NzaWJsZVxuICAgICAgICBjdHguaW5kZW50ID0gY3R4LmluZGVudC5zdWJzdHJpbmcoMik7XG4gICAgfVxuICAgIGxldCB2YWx1ZUNvbW1lbnREb25lID0gZmFsc2U7XG4gICAgY29uc3QgdmFsdWVTdHIgPSBzdHJpbmdpZnkuc3RyaW5naWZ5KHZhbHVlLCBjdHgsICgpID0+ICh2YWx1ZUNvbW1lbnREb25lID0gdHJ1ZSksICgpID0+IChjaG9tcEtlZXAgPSB0cnVlKSk7XG4gICAgbGV0IHdzID0gJyAnO1xuICAgIGlmIChrZXlDb21tZW50IHx8IHZzYiB8fCB2Y2IpIHtcbiAgICAgICAgd3MgPSB2c2IgPyAnXFxuJyA6ICcnO1xuICAgICAgICBpZiAodmNiKSB7XG4gICAgICAgICAgICBjb25zdCBjcyA9IGNvbW1lbnRTdHJpbmcodmNiKTtcbiAgICAgICAgICAgIHdzICs9IGBcXG4ke3N0cmluZ2lmeUNvbW1lbnQuaW5kZW50Q29tbWVudChjcywgY3R4LmluZGVudCl9YDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodmFsdWVTdHIgPT09ICcnICYmICFjdHguaW5GbG93KSB7XG4gICAgICAgICAgICBpZiAod3MgPT09ICdcXG4nICYmIHZhbHVlQ29tbWVudClcbiAgICAgICAgICAgICAgICB3cyA9ICdcXG5cXG4nO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgd3MgKz0gYFxcbiR7Y3R4LmluZGVudH1gO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKCFleHBsaWNpdEtleSAmJiBpZGVudGl0eS5pc0NvbGxlY3Rpb24odmFsdWUpKSB7XG4gICAgICAgIGNvbnN0IHZzMCA9IHZhbHVlU3RyWzBdO1xuICAgICAgICBjb25zdCBubDAgPSB2YWx1ZVN0ci5pbmRleE9mKCdcXG4nKTtcbiAgICAgICAgY29uc3QgaGFzTmV3bGluZSA9IG5sMCAhPT0gLTE7XG4gICAgICAgIGNvbnN0IGZsb3cgPSBjdHguaW5GbG93ID8/IHZhbHVlLmZsb3cgPz8gdmFsdWUuaXRlbXMubGVuZ3RoID09PSAwO1xuICAgICAgICBpZiAoaGFzTmV3bGluZSB8fCAhZmxvdykge1xuICAgICAgICAgICAgbGV0IGhhc1Byb3BzTGluZSA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKGhhc05ld2xpbmUgJiYgKHZzMCA9PT0gJyYnIHx8IHZzMCA9PT0gJyEnKSkge1xuICAgICAgICAgICAgICAgIGxldCBzcDAgPSB2YWx1ZVN0ci5pbmRleE9mKCcgJyk7XG4gICAgICAgICAgICAgICAgaWYgKHZzMCA9PT0gJyYnICYmXG4gICAgICAgICAgICAgICAgICAgIHNwMCAhPT0gLTEgJiZcbiAgICAgICAgICAgICAgICAgICAgc3AwIDwgbmwwICYmXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlU3RyW3NwMCArIDFdID09PSAnIScpIHtcbiAgICAgICAgICAgICAgICAgICAgc3AwID0gdmFsdWVTdHIuaW5kZXhPZignICcsIHNwMCArIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoc3AwID09PSAtMSB8fCBubDAgPCBzcDApXG4gICAgICAgICAgICAgICAgICAgIGhhc1Byb3BzTGluZSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWhhc1Byb3BzTGluZSlcbiAgICAgICAgICAgICAgICB3cyA9IGBcXG4ke2N0eC5pbmRlbnR9YDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICh2YWx1ZVN0ciA9PT0gJycgfHwgdmFsdWVTdHJbMF0gPT09ICdcXG4nKSB7XG4gICAgICAgIHdzID0gJyc7XG4gICAgfVxuICAgIHN0ciArPSB3cyArIHZhbHVlU3RyO1xuICAgIGlmIChjdHguaW5GbG93KSB7XG4gICAgICAgIGlmICh2YWx1ZUNvbW1lbnREb25lICYmIG9uQ29tbWVudClcbiAgICAgICAgICAgIG9uQ29tbWVudCgpO1xuICAgIH1cbiAgICBlbHNlIGlmICh2YWx1ZUNvbW1lbnQgJiYgIXZhbHVlQ29tbWVudERvbmUpIHtcbiAgICAgICAgc3RyICs9IHN0cmluZ2lmeUNvbW1lbnQubGluZUNvbW1lbnQoc3RyLCBjdHguaW5kZW50LCBjb21tZW50U3RyaW5nKHZhbHVlQ29tbWVudCkpO1xuICAgIH1cbiAgICBlbHNlIGlmIChjaG9tcEtlZXAgJiYgb25DaG9tcEtlZXApIHtcbiAgICAgICAgb25DaG9tcEtlZXAoKTtcbiAgICB9XG4gICAgcmV0dXJuIHN0cjtcbn1cblxuZXhwb3J0cy5zdHJpbmdpZnlQYWlyID0gc3RyaW5naWZ5UGFpcjtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbm9kZV9wcm9jZXNzID0gcmVxdWlyZSgncHJvY2VzcycpO1xuXG5mdW5jdGlvbiBkZWJ1Zyhsb2dMZXZlbCwgLi4ubWVzc2FnZXMpIHtcbiAgICBpZiAobG9nTGV2ZWwgPT09ICdkZWJ1ZycpXG4gICAgICAgIGNvbnNvbGUubG9nKC4uLm1lc3NhZ2VzKTtcbn1cbmZ1bmN0aW9uIHdhcm4obG9nTGV2ZWwsIHdhcm5pbmcpIHtcbiAgICBpZiAobG9nTGV2ZWwgPT09ICdkZWJ1ZycgfHwgbG9nTGV2ZWwgPT09ICd3YXJuJykge1xuICAgICAgICBpZiAodHlwZW9mIG5vZGVfcHJvY2Vzcy5lbWl0V2FybmluZyA9PT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgICAgIG5vZGVfcHJvY2Vzcy5lbWl0V2FybmluZyh3YXJuaW5nKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgY29uc29sZS53YXJuKHdhcm5pbmcpO1xuICAgIH1cbn1cblxuZXhwb3J0cy5kZWJ1ZyA9IGRlYnVnO1xuZXhwb3J0cy53YXJuID0gd2FybjtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9pZGVudGl0eS5qcycpO1xudmFyIFNjYWxhciA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL1NjYWxhci5qcycpO1xuXG4vLyBJZiB0aGUgdmFsdWUgYXNzb2NpYXRlZCB3aXRoIGEgbWVyZ2Uga2V5IGlzIGEgc2luZ2xlIG1hcHBpbmcgbm9kZSwgZWFjaCBvZlxuLy8gaXRzIGtleS92YWx1ZSBwYWlycyBpcyBpbnNlcnRlZCBpbnRvIHRoZSBjdXJyZW50IG1hcHBpbmcsIHVubGVzcyB0aGUga2V5XG4vLyBhbHJlYWR5IGV4aXN0cyBpbiBpdC4gSWYgdGhlIHZhbHVlIGFzc29jaWF0ZWQgd2l0aCB0aGUgbWVyZ2Uga2V5IGlzIGFcbi8vIHNlcXVlbmNlLCB0aGVuIHRoaXMgc2VxdWVuY2UgaXMgZXhwZWN0ZWQgdG8gY29udGFpbiBtYXBwaW5nIG5vZGVzIGFuZCBlYWNoXG4vLyBvZiB0aGVzZSBub2RlcyBpcyBtZXJnZWQgaW4gdHVybiBhY2NvcmRpbmcgdG8gaXRzIG9yZGVyIGluIHRoZSBzZXF1ZW5jZS5cbi8vIEtleXMgaW4gbWFwcGluZyBub2RlcyBlYXJsaWVyIGluIHRoZSBzZXF1ZW5jZSBvdmVycmlkZSBrZXlzIHNwZWNpZmllZCBpblxuLy8gbGF0ZXIgbWFwcGluZyBub2Rlcy4gLS0gaHR0cDovL3lhbWwub3JnL3R5cGUvbWVyZ2UuaHRtbFxuY29uc3QgTUVSR0VfS0VZID0gJzw8JztcbmNvbnN0IG1lcmdlID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB2YWx1ZSA9PT0gTUVSR0VfS0VZIHx8XG4gICAgICAgICh0eXBlb2YgdmFsdWUgPT09ICdzeW1ib2wnICYmIHZhbHVlLmRlc2NyaXB0aW9uID09PSBNRVJHRV9LRVkpLFxuICAgIGRlZmF1bHQ6ICdrZXknLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOm1lcmdlJyxcbiAgICB0ZXN0OiAvXjw8JC8sXG4gICAgcmVzb2x2ZTogKCkgPT4gT2JqZWN0LmFzc2lnbihuZXcgU2NhbGFyLlNjYWxhcihTeW1ib2woTUVSR0VfS0VZKSksIHtcbiAgICAgICAgYWRkVG9KU01hcDogYWRkTWVyZ2VUb0pTTWFwXG4gICAgfSksXG4gICAgc3RyaW5naWZ5OiAoKSA9PiBNRVJHRV9LRVlcbn07XG5jb25zdCBpc01lcmdlS2V5ID0gKGN0eCwga2V5KSA9PiAobWVyZ2UuaWRlbnRpZnkoa2V5KSB8fFxuICAgIChpZGVudGl0eS5pc1NjYWxhcihrZXkpICYmXG4gICAgICAgICgha2V5LnR5cGUgfHwga2V5LnR5cGUgPT09IFNjYWxhci5TY2FsYXIuUExBSU4pICYmXG4gICAgICAgIG1lcmdlLmlkZW50aWZ5KGtleS52YWx1ZSkpKSAmJlxuICAgIGN0eD8uZG9jLnNjaGVtYS50YWdzLnNvbWUodGFnID0+IHRhZy50YWcgPT09IG1lcmdlLnRhZyAmJiB0YWcuZGVmYXVsdCk7XG5mdW5jdGlvbiBhZGRNZXJnZVRvSlNNYXAoY3R4LCBtYXAsIHZhbHVlKSB7XG4gICAgdmFsdWUgPSBjdHggJiYgaWRlbnRpdHkuaXNBbGlhcyh2YWx1ZSkgPyB2YWx1ZS5yZXNvbHZlKGN0eC5kb2MpIDogdmFsdWU7XG4gICAgaWYgKGlkZW50aXR5LmlzU2VxKHZhbHVlKSlcbiAgICAgICAgZm9yIChjb25zdCBpdCBvZiB2YWx1ZS5pdGVtcylcbiAgICAgICAgICAgIG1lcmdlVmFsdWUoY3R4LCBtYXAsIGl0KTtcbiAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSlcbiAgICAgICAgZm9yIChjb25zdCBpdCBvZiB2YWx1ZSlcbiAgICAgICAgICAgIG1lcmdlVmFsdWUoY3R4LCBtYXAsIGl0KTtcbiAgICBlbHNlXG4gICAgICAgIG1lcmdlVmFsdWUoY3R4LCBtYXAsIHZhbHVlKTtcbn1cbmZ1bmN0aW9uIG1lcmdlVmFsdWUoY3R4LCBtYXAsIHZhbHVlKSB7XG4gICAgY29uc3Qgc291cmNlID0gY3R4ICYmIGlkZW50aXR5LmlzQWxpYXModmFsdWUpID8gdmFsdWUucmVzb2x2ZShjdHguZG9jKSA6IHZhbHVlO1xuICAgIGlmICghaWRlbnRpdHkuaXNNYXAoc291cmNlKSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNZXJnZSBzb3VyY2VzIG11c3QgYmUgbWFwcyBvciBtYXAgYWxpYXNlcycpO1xuICAgIGNvbnN0IHNyY01hcCA9IHNvdXJjZS50b0pTT04obnVsbCwgY3R4LCBNYXApO1xuICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIHNyY01hcCkge1xuICAgICAgICBpZiAobWFwIGluc3RhbmNlb2YgTWFwKSB7XG4gICAgICAgICAgICBpZiAoIW1hcC5oYXMoa2V5KSlcbiAgICAgICAgICAgICAgICBtYXAuc2V0KGtleSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG1hcCBpbnN0YW5jZW9mIFNldCkge1xuICAgICAgICAgICAgbWFwLmFkZChrZXkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobWFwLCBrZXkpKSB7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobWFwLCBrZXksIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG1hcDtcbn1cblxuZXhwb3J0cy5hZGRNZXJnZVRvSlNNYXAgPSBhZGRNZXJnZVRvSlNNYXA7XG5leHBvcnRzLmlzTWVyZ2VLZXkgPSBpc01lcmdlS2V5O1xuZXhwb3J0cy5tZXJnZSA9IG1lcmdlO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBsb2cgPSByZXF1aXJlKCcuLi9sb2cuanMnKTtcbnZhciBtZXJnZSA9IHJlcXVpcmUoJy4uL3NjaGVtYS95YW1sLTEuMS9tZXJnZS5qcycpO1xudmFyIHN0cmluZ2lmeSA9IHJlcXVpcmUoJy4uL3N0cmluZ2lmeS9zdHJpbmdpZnkuanMnKTtcbnZhciBpZGVudGl0eSA9IHJlcXVpcmUoJy4vaWRlbnRpdHkuanMnKTtcbnZhciB0b0pTID0gcmVxdWlyZSgnLi90b0pTLmpzJyk7XG5cbmZ1bmN0aW9uIGFkZFBhaXJUb0pTTWFwKGN0eCwgbWFwLCB7IGtleSwgdmFsdWUgfSkge1xuICAgIGlmIChpZGVudGl0eS5pc05vZGUoa2V5KSAmJiBrZXkuYWRkVG9KU01hcClcbiAgICAgICAga2V5LmFkZFRvSlNNYXAoY3R4LCBtYXAsIHZhbHVlKTtcbiAgICAvLyBUT0RPOiBTaG91bGQgZHJvcCB0aGlzIHNwZWNpYWwgY2FzZSBmb3IgYmFyZSA8PCBoYW5kbGluZ1xuICAgIGVsc2UgaWYgKG1lcmdlLmlzTWVyZ2VLZXkoY3R4LCBrZXkpKVxuICAgICAgICBtZXJnZS5hZGRNZXJnZVRvSlNNYXAoY3R4LCBtYXAsIHZhbHVlKTtcbiAgICBlbHNlIHtcbiAgICAgICAgY29uc3QganNLZXkgPSB0b0pTLnRvSlMoa2V5LCAnJywgY3R4KTtcbiAgICAgICAgaWYgKG1hcCBpbnN0YW5jZW9mIE1hcCkge1xuICAgICAgICAgICAgbWFwLnNldChqc0tleSwgdG9KUy50b0pTKHZhbHVlLCBqc0tleSwgY3R4KSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobWFwIGluc3RhbmNlb2YgU2V0KSB7XG4gICAgICAgICAgICBtYXAuYWRkKGpzS2V5KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHN0cmluZ0tleSA9IHN0cmluZ2lmeUtleShrZXksIGpzS2V5LCBjdHgpO1xuICAgICAgICAgICAgY29uc3QganNWYWx1ZSA9IHRvSlMudG9KUyh2YWx1ZSwgc3RyaW5nS2V5LCBjdHgpO1xuICAgICAgICAgICAgaWYgKHN0cmluZ0tleSBpbiBtYXApXG4gICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG1hcCwgc3RyaW5nS2V5LCB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBqc1ZhbHVlLFxuICAgICAgICAgICAgICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbWFwW3N0cmluZ0tleV0gPSBqc1ZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBtYXA7XG59XG5mdW5jdGlvbiBzdHJpbmdpZnlLZXkoa2V5LCBqc0tleSwgY3R4KSB7XG4gICAgaWYgKGpzS2V5ID09PSBudWxsKVxuICAgICAgICByZXR1cm4gJyc7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1iYXNlLXRvLXN0cmluZ1xuICAgIGlmICh0eXBlb2YganNLZXkgIT09ICdvYmplY3QnKVxuICAgICAgICByZXR1cm4gU3RyaW5nKGpzS2V5KTtcbiAgICBpZiAoaWRlbnRpdHkuaXNOb2RlKGtleSkgJiYgY3R4Py5kb2MpIHtcbiAgICAgICAgY29uc3Qgc3RyQ3R4ID0gc3RyaW5naWZ5LmNyZWF0ZVN0cmluZ2lmeUNvbnRleHQoY3R4LmRvYywge30pO1xuICAgICAgICBzdHJDdHguYW5jaG9ycyA9IG5ldyBTZXQoKTtcbiAgICAgICAgZm9yIChjb25zdCBub2RlIG9mIGN0eC5hbmNob3JzLmtleXMoKSlcbiAgICAgICAgICAgIHN0ckN0eC5hbmNob3JzLmFkZChub2RlLmFuY2hvcik7XG4gICAgICAgIHN0ckN0eC5pbkZsb3cgPSB0cnVlO1xuICAgICAgICBzdHJDdHguaW5TdHJpbmdpZnlLZXkgPSB0cnVlO1xuICAgICAgICBjb25zdCBzdHJLZXkgPSBrZXkudG9TdHJpbmcoc3RyQ3R4KTtcbiAgICAgICAgaWYgKCFjdHgubWFwS2V5V2FybmVkKSB7XG4gICAgICAgICAgICBsZXQganNvblN0ciA9IEpTT04uc3RyaW5naWZ5KHN0cktleSk7XG4gICAgICAgICAgICBpZiAoanNvblN0ci5sZW5ndGggPiA0MClcbiAgICAgICAgICAgICAgICBqc29uU3RyID0ganNvblN0ci5zdWJzdHJpbmcoMCwgMzYpICsgJy4uLlwiJztcbiAgICAgICAgICAgIGxvZy53YXJuKGN0eC5kb2Mub3B0aW9ucy5sb2dMZXZlbCwgYEtleXMgd2l0aCBjb2xsZWN0aW9uIHZhbHVlcyB3aWxsIGJlIHN0cmluZ2lmaWVkIGR1ZSB0byBKUyBPYmplY3QgcmVzdHJpY3Rpb25zOiAke2pzb25TdHJ9LiBTZXQgbWFwQXNNYXA6IHRydWUgdG8gdXNlIG9iamVjdCBrZXlzLmApO1xuICAgICAgICAgICAgY3R4Lm1hcEtleVdhcm5lZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0cktleTtcbiAgICB9XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGpzS2V5KTtcbn1cblxuZXhwb3J0cy5hZGRQYWlyVG9KU01hcCA9IGFkZFBhaXJUb0pTTWFwO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBjcmVhdGVOb2RlID0gcmVxdWlyZSgnLi4vZG9jL2NyZWF0ZU5vZGUuanMnKTtcbnZhciBzdHJpbmdpZnlQYWlyID0gcmVxdWlyZSgnLi4vc3RyaW5naWZ5L3N0cmluZ2lmeVBhaXIuanMnKTtcbnZhciBhZGRQYWlyVG9KU01hcCA9IHJlcXVpcmUoJy4vYWRkUGFpclRvSlNNYXAuanMnKTtcbnZhciBpZGVudGl0eSA9IHJlcXVpcmUoJy4vaWRlbnRpdHkuanMnKTtcblxuZnVuY3Rpb24gY3JlYXRlUGFpcihrZXksIHZhbHVlLCBjdHgpIHtcbiAgICBjb25zdCBrID0gY3JlYXRlTm9kZS5jcmVhdGVOb2RlKGtleSwgdW5kZWZpbmVkLCBjdHgpO1xuICAgIGNvbnN0IHYgPSBjcmVhdGVOb2RlLmNyZWF0ZU5vZGUodmFsdWUsIHVuZGVmaW5lZCwgY3R4KTtcbiAgICByZXR1cm4gbmV3IFBhaXIoaywgdik7XG59XG5jbGFzcyBQYWlyIHtcbiAgICBjb25zdHJ1Y3RvcihrZXksIHZhbHVlID0gbnVsbCkge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgaWRlbnRpdHkuTk9ERV9UWVBFLCB7IHZhbHVlOiBpZGVudGl0eS5QQUlSIH0pO1xuICAgICAgICB0aGlzLmtleSA9IGtleTtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgICBjbG9uZShzY2hlbWEpIHtcbiAgICAgICAgbGV0IHsga2V5LCB2YWx1ZSB9ID0gdGhpcztcbiAgICAgICAgaWYgKGlkZW50aXR5LmlzTm9kZShrZXkpKVxuICAgICAgICAgICAga2V5ID0ga2V5LmNsb25lKHNjaGVtYSk7XG4gICAgICAgIGlmIChpZGVudGl0eS5pc05vZGUodmFsdWUpKVxuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5jbG9uZShzY2hlbWEpO1xuICAgICAgICByZXR1cm4gbmV3IFBhaXIoa2V5LCB2YWx1ZSk7XG4gICAgfVxuICAgIHRvSlNPTihfLCBjdHgpIHtcbiAgICAgICAgY29uc3QgcGFpciA9IGN0eD8ubWFwQXNNYXAgPyBuZXcgTWFwKCkgOiB7fTtcbiAgICAgICAgcmV0dXJuIGFkZFBhaXJUb0pTTWFwLmFkZFBhaXJUb0pTTWFwKGN0eCwgcGFpciwgdGhpcyk7XG4gICAgfVxuICAgIHRvU3RyaW5nKGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCkge1xuICAgICAgICByZXR1cm4gY3R4Py5kb2NcbiAgICAgICAgICAgID8gc3RyaW5naWZ5UGFpci5zdHJpbmdpZnlQYWlyKHRoaXMsIGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcClcbiAgICAgICAgICAgIDogSlNPTi5zdHJpbmdpZnkodGhpcyk7XG4gICAgfVxufVxuXG5leHBvcnRzLlBhaXIgPSBQYWlyO1xuZXhwb3J0cy5jcmVhdGVQYWlyID0gY3JlYXRlUGFpcjtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuLi9ub2Rlcy9pZGVudGl0eS5qcycpO1xudmFyIHN0cmluZ2lmeSA9IHJlcXVpcmUoJy4vc3RyaW5naWZ5LmpzJyk7XG52YXIgc3RyaW5naWZ5Q29tbWVudCA9IHJlcXVpcmUoJy4vc3RyaW5naWZ5Q29tbWVudC5qcycpO1xuXG5mdW5jdGlvbiBzdHJpbmdpZnlDb2xsZWN0aW9uKGNvbGxlY3Rpb24sIGN0eCwgb3B0aW9ucykge1xuICAgIGNvbnN0IGZsb3cgPSBjdHguaW5GbG93ID8/IGNvbGxlY3Rpb24uZmxvdztcbiAgICBjb25zdCBzdHJpbmdpZnkgPSBmbG93ID8gc3RyaW5naWZ5Rmxvd0NvbGxlY3Rpb24gOiBzdHJpbmdpZnlCbG9ja0NvbGxlY3Rpb247XG4gICAgcmV0dXJuIHN0cmluZ2lmeShjb2xsZWN0aW9uLCBjdHgsIG9wdGlvbnMpO1xufVxuZnVuY3Rpb24gc3RyaW5naWZ5QmxvY2tDb2xsZWN0aW9uKHsgY29tbWVudCwgaXRlbXMgfSwgY3R4LCB7IGJsb2NrSXRlbVByZWZpeCwgZmxvd0NoYXJzLCBpdGVtSW5kZW50LCBvbkNob21wS2VlcCwgb25Db21tZW50IH0pIHtcbiAgICBjb25zdCB7IGluZGVudCwgb3B0aW9uczogeyBjb21tZW50U3RyaW5nIH0gfSA9IGN0eDtcbiAgICBjb25zdCBpdGVtQ3R4ID0gT2JqZWN0LmFzc2lnbih7fSwgY3R4LCB7IGluZGVudDogaXRlbUluZGVudCwgdHlwZTogbnVsbCB9KTtcbiAgICBsZXQgY2hvbXBLZWVwID0gZmFsc2U7IC8vIGZsYWcgZm9yIHRoZSBwcmVjZWRpbmcgbm9kZSdzIHN0YXR1c1xuICAgIGNvbnN0IGxpbmVzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7ICsraSkge1xuICAgICAgICBjb25zdCBpdGVtID0gaXRlbXNbaV07XG4gICAgICAgIGxldCBjb21tZW50ID0gbnVsbDtcbiAgICAgICAgaWYgKGlkZW50aXR5LmlzTm9kZShpdGVtKSkge1xuICAgICAgICAgICAgaWYgKCFjaG9tcEtlZXAgJiYgaXRlbS5zcGFjZUJlZm9yZSlcbiAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKCcnKTtcbiAgICAgICAgICAgIGFkZENvbW1lbnRCZWZvcmUoY3R4LCBsaW5lcywgaXRlbS5jb21tZW50QmVmb3JlLCBjaG9tcEtlZXApO1xuICAgICAgICAgICAgaWYgKGl0ZW0uY29tbWVudClcbiAgICAgICAgICAgICAgICBjb21tZW50ID0gaXRlbS5jb21tZW50O1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGlkZW50aXR5LmlzUGFpcihpdGVtKSkge1xuICAgICAgICAgICAgY29uc3QgaWsgPSBpZGVudGl0eS5pc05vZGUoaXRlbS5rZXkpID8gaXRlbS5rZXkgOiBudWxsO1xuICAgICAgICAgICAgaWYgKGlrKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFjaG9tcEtlZXAgJiYgaWsuc3BhY2VCZWZvcmUpXG4gICAgICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goJycpO1xuICAgICAgICAgICAgICAgIGFkZENvbW1lbnRCZWZvcmUoY3R4LCBsaW5lcywgaWsuY29tbWVudEJlZm9yZSwgY2hvbXBLZWVwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjaG9tcEtlZXAgPSBmYWxzZTtcbiAgICAgICAgbGV0IHN0ciA9IHN0cmluZ2lmeS5zdHJpbmdpZnkoaXRlbSwgaXRlbUN0eCwgKCkgPT4gKGNvbW1lbnQgPSBudWxsKSwgKCkgPT4gKGNob21wS2VlcCA9IHRydWUpKTtcbiAgICAgICAgaWYgKGNvbW1lbnQpXG4gICAgICAgICAgICBzdHIgKz0gc3RyaW5naWZ5Q29tbWVudC5saW5lQ29tbWVudChzdHIsIGl0ZW1JbmRlbnQsIGNvbW1lbnRTdHJpbmcoY29tbWVudCkpO1xuICAgICAgICBpZiAoY2hvbXBLZWVwICYmIGNvbW1lbnQpXG4gICAgICAgICAgICBjaG9tcEtlZXAgPSBmYWxzZTtcbiAgICAgICAgbGluZXMucHVzaChibG9ja0l0ZW1QcmVmaXggKyBzdHIpO1xuICAgIH1cbiAgICBsZXQgc3RyO1xuICAgIGlmIChsaW5lcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgc3RyID0gZmxvd0NoYXJzLnN0YXJ0ICsgZmxvd0NoYXJzLmVuZDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHN0ciA9IGxpbmVzWzBdO1xuICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8IGxpbmVzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBjb25zdCBsaW5lID0gbGluZXNbaV07XG4gICAgICAgICAgICBzdHIgKz0gbGluZSA/IGBcXG4ke2luZGVudH0ke2xpbmV9YCA6ICdcXG4nO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChjb21tZW50KSB7XG4gICAgICAgIHN0ciArPSAnXFxuJyArIHN0cmluZ2lmeUNvbW1lbnQuaW5kZW50Q29tbWVudChjb21tZW50U3RyaW5nKGNvbW1lbnQpLCBpbmRlbnQpO1xuICAgICAgICBpZiAob25Db21tZW50KVxuICAgICAgICAgICAgb25Db21tZW50KCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGNob21wS2VlcCAmJiBvbkNob21wS2VlcClcbiAgICAgICAgb25DaG9tcEtlZXAoKTtcbiAgICByZXR1cm4gc3RyO1xufVxuZnVuY3Rpb24gc3RyaW5naWZ5Rmxvd0NvbGxlY3Rpb24oeyBpdGVtcyB9LCBjdHgsIHsgZmxvd0NoYXJzLCBpdGVtSW5kZW50IH0pIHtcbiAgICBjb25zdCB7IGluZGVudCwgaW5kZW50U3RlcCwgZmxvd0NvbGxlY3Rpb25QYWRkaW5nOiBmY1BhZGRpbmcsIG9wdGlvbnM6IHsgY29tbWVudFN0cmluZyB9IH0gPSBjdHg7XG4gICAgaXRlbUluZGVudCArPSBpbmRlbnRTdGVwO1xuICAgIGNvbnN0IGl0ZW1DdHggPSBPYmplY3QuYXNzaWduKHt9LCBjdHgsIHtcbiAgICAgICAgaW5kZW50OiBpdGVtSW5kZW50LFxuICAgICAgICBpbkZsb3c6IHRydWUsXG4gICAgICAgIHR5cGU6IG51bGxcbiAgICB9KTtcbiAgICBsZXQgcmVxTmV3bGluZSA9IGZhbHNlO1xuICAgIGxldCBsaW5lc0F0VmFsdWUgPSAwO1xuICAgIGNvbnN0IGxpbmVzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7ICsraSkge1xuICAgICAgICBjb25zdCBpdGVtID0gaXRlbXNbaV07XG4gICAgICAgIGxldCBjb21tZW50ID0gbnVsbDtcbiAgICAgICAgaWYgKGlkZW50aXR5LmlzTm9kZShpdGVtKSkge1xuICAgICAgICAgICAgaWYgKGl0ZW0uc3BhY2VCZWZvcmUpXG4gICAgICAgICAgICAgICAgbGluZXMucHVzaCgnJyk7XG4gICAgICAgICAgICBhZGRDb21tZW50QmVmb3JlKGN0eCwgbGluZXMsIGl0ZW0uY29tbWVudEJlZm9yZSwgZmFsc2UpO1xuICAgICAgICAgICAgaWYgKGl0ZW0uY29tbWVudClcbiAgICAgICAgICAgICAgICBjb21tZW50ID0gaXRlbS5jb21tZW50O1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGlkZW50aXR5LmlzUGFpcihpdGVtKSkge1xuICAgICAgICAgICAgY29uc3QgaWsgPSBpZGVudGl0eS5pc05vZGUoaXRlbS5rZXkpID8gaXRlbS5rZXkgOiBudWxsO1xuICAgICAgICAgICAgaWYgKGlrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlrLnNwYWNlQmVmb3JlKVxuICAgICAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKCcnKTtcbiAgICAgICAgICAgICAgICBhZGRDb21tZW50QmVmb3JlKGN0eCwgbGluZXMsIGlrLmNvbW1lbnRCZWZvcmUsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICBpZiAoaWsuY29tbWVudClcbiAgICAgICAgICAgICAgICAgICAgcmVxTmV3bGluZSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBpdiA9IGlkZW50aXR5LmlzTm9kZShpdGVtLnZhbHVlKSA/IGl0ZW0udmFsdWUgOiBudWxsO1xuICAgICAgICAgICAgaWYgKGl2KSB7XG4gICAgICAgICAgICAgICAgaWYgKGl2LmNvbW1lbnQpXG4gICAgICAgICAgICAgICAgICAgIGNvbW1lbnQgPSBpdi5jb21tZW50O1xuICAgICAgICAgICAgICAgIGlmIChpdi5jb21tZW50QmVmb3JlKVxuICAgICAgICAgICAgICAgICAgICByZXFOZXdsaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGl0ZW0udmFsdWUgPT0gbnVsbCAmJiBpaz8uY29tbWVudCkge1xuICAgICAgICAgICAgICAgIGNvbW1lbnQgPSBpay5jb21tZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChjb21tZW50KVxuICAgICAgICAgICAgcmVxTmV3bGluZSA9IHRydWU7XG4gICAgICAgIGxldCBzdHIgPSBzdHJpbmdpZnkuc3RyaW5naWZ5KGl0ZW0sIGl0ZW1DdHgsICgpID0+IChjb21tZW50ID0gbnVsbCkpO1xuICAgICAgICByZXFOZXdsaW5lIHx8IChyZXFOZXdsaW5lID0gbGluZXMubGVuZ3RoID4gbGluZXNBdFZhbHVlIHx8IHN0ci5pbmNsdWRlcygnXFxuJykpO1xuICAgICAgICBpZiAoaSA8IGl0ZW1zLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgIHN0ciArPSAnLCc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoY3R4Lm9wdGlvbnMudHJhaWxpbmdDb21tYSkge1xuICAgICAgICAgICAgaWYgKGN0eC5vcHRpb25zLmxpbmVXaWR0aCA+IDApIHtcbiAgICAgICAgICAgICAgICByZXFOZXdsaW5lIHx8IChyZXFOZXdsaW5lID0gbGluZXMucmVkdWNlKChzdW0sIGxpbmUpID0+IHN1bSArIGxpbmUubGVuZ3RoICsgMiwgMikgK1xuICAgICAgICAgICAgICAgICAgICAoc3RyLmxlbmd0aCArIDIpID5cbiAgICAgICAgICAgICAgICAgICAgY3R4Lm9wdGlvbnMubGluZVdpZHRoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyZXFOZXdsaW5lKSB7XG4gICAgICAgICAgICAgICAgc3RyICs9ICcsJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoY29tbWVudClcbiAgICAgICAgICAgIHN0ciArPSBzdHJpbmdpZnlDb21tZW50LmxpbmVDb21tZW50KHN0ciwgaXRlbUluZGVudCwgY29tbWVudFN0cmluZyhjb21tZW50KSk7XG4gICAgICAgIGxpbmVzLnB1c2goc3RyKTtcbiAgICAgICAgbGluZXNBdFZhbHVlID0gbGluZXMubGVuZ3RoO1xuICAgIH1cbiAgICBjb25zdCB7IHN0YXJ0LCBlbmQgfSA9IGZsb3dDaGFycztcbiAgICBpZiAobGluZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBzdGFydCArIGVuZDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGlmICghcmVxTmV3bGluZSkge1xuICAgICAgICAgICAgY29uc3QgbGVuID0gbGluZXMucmVkdWNlKChzdW0sIGxpbmUpID0+IHN1bSArIGxpbmUubGVuZ3RoICsgMiwgMik7XG4gICAgICAgICAgICByZXFOZXdsaW5lID0gY3R4Lm9wdGlvbnMubGluZVdpZHRoID4gMCAmJiBsZW4gPiBjdHgub3B0aW9ucy5saW5lV2lkdGg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJlcU5ld2xpbmUpIHtcbiAgICAgICAgICAgIGxldCBzdHIgPSBzdGFydDtcbiAgICAgICAgICAgIGZvciAoY29uc3QgbGluZSBvZiBsaW5lcylcbiAgICAgICAgICAgICAgICBzdHIgKz0gbGluZSA/IGBcXG4ke2luZGVudFN0ZXB9JHtpbmRlbnR9JHtsaW5lfWAgOiAnXFxuJztcbiAgICAgICAgICAgIHJldHVybiBgJHtzdHJ9XFxuJHtpbmRlbnR9JHtlbmR9YDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBgJHtzdGFydH0ke2ZjUGFkZGluZ30ke2xpbmVzLmpvaW4oJyAnKX0ke2ZjUGFkZGluZ30ke2VuZH1gO1xuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gYWRkQ29tbWVudEJlZm9yZSh7IGluZGVudCwgb3B0aW9uczogeyBjb21tZW50U3RyaW5nIH0gfSwgbGluZXMsIGNvbW1lbnQsIGNob21wS2VlcCkge1xuICAgIGlmIChjb21tZW50ICYmIGNob21wS2VlcClcbiAgICAgICAgY29tbWVudCA9IGNvbW1lbnQucmVwbGFjZSgvXlxcbisvLCAnJyk7XG4gICAgaWYgKGNvbW1lbnQpIHtcbiAgICAgICAgY29uc3QgaWMgPSBzdHJpbmdpZnlDb21tZW50LmluZGVudENvbW1lbnQoY29tbWVudFN0cmluZyhjb21tZW50KSwgaW5kZW50KTtcbiAgICAgICAgbGluZXMucHVzaChpYy50cmltU3RhcnQoKSk7IC8vIEF2b2lkIGRvdWJsZSBpbmRlbnQgb24gZmlyc3QgbGluZVxuICAgIH1cbn1cblxuZXhwb3J0cy5zdHJpbmdpZnlDb2xsZWN0aW9uID0gc3RyaW5naWZ5Q29sbGVjdGlvbjtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgc3RyaW5naWZ5Q29sbGVjdGlvbiA9IHJlcXVpcmUoJy4uL3N0cmluZ2lmeS9zdHJpbmdpZnlDb2xsZWN0aW9uLmpzJyk7XG52YXIgYWRkUGFpclRvSlNNYXAgPSByZXF1aXJlKCcuL2FkZFBhaXJUb0pTTWFwLmpzJyk7XG52YXIgQ29sbGVjdGlvbiA9IHJlcXVpcmUoJy4vQ29sbGVjdGlvbi5qcycpO1xudmFyIGlkZW50aXR5ID0gcmVxdWlyZSgnLi9pZGVudGl0eS5qcycpO1xudmFyIFBhaXIgPSByZXF1aXJlKCcuL1BhaXIuanMnKTtcbnZhciBTY2FsYXIgPSByZXF1aXJlKCcuL1NjYWxhci5qcycpO1xuXG5mdW5jdGlvbiBmaW5kUGFpcihpdGVtcywga2V5KSB7XG4gICAgY29uc3QgayA9IGlkZW50aXR5LmlzU2NhbGFyKGtleSkgPyBrZXkudmFsdWUgOiBrZXk7XG4gICAgZm9yIChjb25zdCBpdCBvZiBpdGVtcykge1xuICAgICAgICBpZiAoaWRlbnRpdHkuaXNQYWlyKGl0KSkge1xuICAgICAgICAgICAgaWYgKGl0LmtleSA9PT0ga2V5IHx8IGl0LmtleSA9PT0gaylcbiAgICAgICAgICAgICAgICByZXR1cm4gaXQ7XG4gICAgICAgICAgICBpZiAoaWRlbnRpdHkuaXNTY2FsYXIoaXQua2V5KSAmJiBpdC5rZXkudmFsdWUgPT09IGspXG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0O1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG59XG5jbGFzcyBZQU1MTWFwIGV4dGVuZHMgQ29sbGVjdGlvbi5Db2xsZWN0aW9uIHtcbiAgICBzdGF0aWMgZ2V0IHRhZ05hbWUoKSB7XG4gICAgICAgIHJldHVybiAndGFnOnlhbWwub3JnLDIwMDI6bWFwJztcbiAgICB9XG4gICAgY29uc3RydWN0b3Ioc2NoZW1hKSB7XG4gICAgICAgIHN1cGVyKGlkZW50aXR5Lk1BUCwgc2NoZW1hKTtcbiAgICAgICAgdGhpcy5pdGVtcyA9IFtdO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBIGdlbmVyaWMgY29sbGVjdGlvbiBwYXJzaW5nIG1ldGhvZCB0aGF0IGNhbiBiZSBleHRlbmRlZFxuICAgICAqIHRvIG90aGVyIG5vZGUgY2xhc3NlcyB0aGF0IGluaGVyaXQgZnJvbSBZQU1MTWFwXG4gICAgICovXG4gICAgc3RhdGljIGZyb20oc2NoZW1hLCBvYmosIGN0eCkge1xuICAgICAgICBjb25zdCB7IGtlZXBVbmRlZmluZWQsIHJlcGxhY2VyIH0gPSBjdHg7XG4gICAgICAgIGNvbnN0IG1hcCA9IG5ldyB0aGlzKHNjaGVtYSk7XG4gICAgICAgIGNvbnN0IGFkZCA9IChrZXksIHZhbHVlKSA9PiB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHJlcGxhY2VyID09PSAnZnVuY3Rpb24nKVxuICAgICAgICAgICAgICAgIHZhbHVlID0gcmVwbGFjZXIuY2FsbChvYmosIGtleSwgdmFsdWUpO1xuICAgICAgICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheShyZXBsYWNlcikgJiYgIXJlcGxhY2VyLmluY2x1ZGVzKGtleSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQgfHwga2VlcFVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICBtYXAuaXRlbXMucHVzaChQYWlyLmNyZWF0ZVBhaXIoa2V5LCB2YWx1ZSwgY3R4KSk7XG4gICAgICAgIH07XG4gICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBNYXApIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIG9iailcbiAgICAgICAgICAgICAgICBhZGQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAob2JqICYmIHR5cGVvZiBvYmogPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhvYmopKVxuICAgICAgICAgICAgICAgIGFkZChrZXksIG9ialtrZXldKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHNjaGVtYS5zb3J0TWFwRW50cmllcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgbWFwLml0ZW1zLnNvcnQoc2NoZW1hLnNvcnRNYXBFbnRyaWVzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWFwO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgdmFsdWUgdG8gdGhlIGNvbGxlY3Rpb24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gb3ZlcndyaXRlIC0gSWYgbm90IHNldCBgdHJ1ZWAsIHVzaW5nIGEga2V5IHRoYXQgaXMgYWxyZWFkeSBpbiB0aGVcbiAgICAgKiAgIGNvbGxlY3Rpb24gd2lsbCB0aHJvdy4gT3RoZXJ3aXNlLCBvdmVyd3JpdGVzIHRoZSBwcmV2aW91cyB2YWx1ZS5cbiAgICAgKi9cbiAgICBhZGQocGFpciwgb3ZlcndyaXRlKSB7XG4gICAgICAgIGxldCBfcGFpcjtcbiAgICAgICAgaWYgKGlkZW50aXR5LmlzUGFpcihwYWlyKSlcbiAgICAgICAgICAgIF9wYWlyID0gcGFpcjtcbiAgICAgICAgZWxzZSBpZiAoIXBhaXIgfHwgdHlwZW9mIHBhaXIgIT09ICdvYmplY3QnIHx8ICEoJ2tleScgaW4gcGFpcikpIHtcbiAgICAgICAgICAgIC8vIEluIFR5cGVTY3JpcHQsIHRoaXMgbmV2ZXIgaGFwcGVucy5cbiAgICAgICAgICAgIF9wYWlyID0gbmV3IFBhaXIuUGFpcihwYWlyLCBwYWlyPy52YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgX3BhaXIgPSBuZXcgUGFpci5QYWlyKHBhaXIua2V5LCBwYWlyLnZhbHVlKTtcbiAgICAgICAgY29uc3QgcHJldiA9IGZpbmRQYWlyKHRoaXMuaXRlbXMsIF9wYWlyLmtleSk7XG4gICAgICAgIGNvbnN0IHNvcnRFbnRyaWVzID0gdGhpcy5zY2hlbWE/LnNvcnRNYXBFbnRyaWVzO1xuICAgICAgICBpZiAocHJldikge1xuICAgICAgICAgICAgaWYgKCFvdmVyd3JpdGUpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBLZXkgJHtfcGFpci5rZXl9IGFscmVhZHkgc2V0YCk7XG4gICAgICAgICAgICAvLyBGb3Igc2NhbGFycywga2VlcCB0aGUgb2xkIG5vZGUgJiBpdHMgY29tbWVudHMgYW5kIGFuY2hvcnNcbiAgICAgICAgICAgIGlmIChpZGVudGl0eS5pc1NjYWxhcihwcmV2LnZhbHVlKSAmJiBTY2FsYXIuaXNTY2FsYXJWYWx1ZShfcGFpci52YWx1ZSkpXG4gICAgICAgICAgICAgICAgcHJldi52YWx1ZS52YWx1ZSA9IF9wYWlyLnZhbHVlO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHByZXYudmFsdWUgPSBfcGFpci52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChzb3J0RW50cmllcykge1xuICAgICAgICAgICAgY29uc3QgaSA9IHRoaXMuaXRlbXMuZmluZEluZGV4KGl0ZW0gPT4gc29ydEVudHJpZXMoX3BhaXIsIGl0ZW0pIDwgMCk7XG4gICAgICAgICAgICBpZiAoaSA9PT0gLTEpXG4gICAgICAgICAgICAgICAgdGhpcy5pdGVtcy5wdXNoKF9wYWlyKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0aGlzLml0ZW1zLnNwbGljZShpLCAwLCBfcGFpcik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLml0ZW1zLnB1c2goX3BhaXIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGRlbGV0ZShrZXkpIHtcbiAgICAgICAgY29uc3QgaXQgPSBmaW5kUGFpcih0aGlzLml0ZW1zLCBrZXkpO1xuICAgICAgICBpZiAoIWl0KVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBjb25zdCBkZWwgPSB0aGlzLml0ZW1zLnNwbGljZSh0aGlzLml0ZW1zLmluZGV4T2YoaXQpLCAxKTtcbiAgICAgICAgcmV0dXJuIGRlbC5sZW5ndGggPiAwO1xuICAgIH1cbiAgICBnZXQoa2V5LCBrZWVwU2NhbGFyKSB7XG4gICAgICAgIGNvbnN0IGl0ID0gZmluZFBhaXIodGhpcy5pdGVtcywga2V5KTtcbiAgICAgICAgY29uc3Qgbm9kZSA9IGl0Py52YWx1ZTtcbiAgICAgICAgcmV0dXJuICgha2VlcFNjYWxhciAmJiBpZGVudGl0eS5pc1NjYWxhcihub2RlKSA/IG5vZGUudmFsdWUgOiBub2RlKSA/PyB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGhhcyhrZXkpIHtcbiAgICAgICAgcmV0dXJuICEhZmluZFBhaXIodGhpcy5pdGVtcywga2V5KTtcbiAgICB9XG4gICAgc2V0KGtleSwgdmFsdWUpIHtcbiAgICAgICAgdGhpcy5hZGQobmV3IFBhaXIuUGFpcihrZXksIHZhbHVlKSwgdHJ1ZSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEBwYXJhbSBjdHggLSBDb252ZXJzaW9uIGNvbnRleHQsIG9yaWdpbmFsbHkgc2V0IGluIERvY3VtZW50I3RvSlMoKVxuICAgICAqIEBwYXJhbSB7Q2xhc3N9IFR5cGUgLSBJZiBzZXQsIGZvcmNlcyB0aGUgcmV0dXJuZWQgY29sbGVjdGlvbiB0eXBlXG4gICAgICogQHJldHVybnMgSW5zdGFuY2Ugb2YgVHlwZSwgTWFwLCBvciBPYmplY3RcbiAgICAgKi9cbiAgICB0b0pTT04oXywgY3R4LCBUeXBlKSB7XG4gICAgICAgIGNvbnN0IG1hcCA9IFR5cGUgPyBuZXcgVHlwZSgpIDogY3R4Py5tYXBBc01hcCA/IG5ldyBNYXAoKSA6IHt9O1xuICAgICAgICBpZiAoY3R4Py5vbkNyZWF0ZSlcbiAgICAgICAgICAgIGN0eC5vbkNyZWF0ZShtYXApO1xuICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgdGhpcy5pdGVtcylcbiAgICAgICAgICAgIGFkZFBhaXJUb0pTTWFwLmFkZFBhaXJUb0pTTWFwKGN0eCwgbWFwLCBpdGVtKTtcbiAgICAgICAgcmV0dXJuIG1hcDtcbiAgICB9XG4gICAgdG9TdHJpbmcoY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKSB7XG4gICAgICAgIGlmICghY3R4KVxuICAgICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHRoaXMpO1xuICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgdGhpcy5pdGVtcykge1xuICAgICAgICAgICAgaWYgKCFpZGVudGl0eS5pc1BhaXIoaXRlbSkpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBNYXAgaXRlbXMgbXVzdCBhbGwgYmUgcGFpcnM7IGZvdW5kICR7SlNPTi5zdHJpbmdpZnkoaXRlbSl9IGluc3RlYWRgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWN0eC5hbGxOdWxsVmFsdWVzICYmIHRoaXMuaGFzQWxsTnVsbFZhbHVlcyhmYWxzZSkpXG4gICAgICAgICAgICBjdHggPSBPYmplY3QuYXNzaWduKHt9LCBjdHgsIHsgYWxsTnVsbFZhbHVlczogdHJ1ZSB9KTtcbiAgICAgICAgcmV0dXJuIHN0cmluZ2lmeUNvbGxlY3Rpb24uc3RyaW5naWZ5Q29sbGVjdGlvbih0aGlzLCBjdHgsIHtcbiAgICAgICAgICAgIGJsb2NrSXRlbVByZWZpeDogJycsXG4gICAgICAgICAgICBmbG93Q2hhcnM6IHsgc3RhcnQ6ICd7JywgZW5kOiAnfScgfSxcbiAgICAgICAgICAgIGl0ZW1JbmRlbnQ6IGN0eC5pbmRlbnQgfHwgJycsXG4gICAgICAgICAgICBvbkNob21wS2VlcCxcbiAgICAgICAgICAgIG9uQ29tbWVudFxuICAgICAgICB9KTtcbiAgICB9XG59XG5cbmV4cG9ydHMuWUFNTE1hcCA9IFlBTUxNYXA7XG5leHBvcnRzLmZpbmRQYWlyID0gZmluZFBhaXI7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIGlkZW50aXR5ID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvaWRlbnRpdHkuanMnKTtcbnZhciBZQU1MTWFwID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvWUFNTE1hcC5qcycpO1xuXG5jb25zdCBtYXAgPSB7XG4gICAgY29sbGVjdGlvbjogJ21hcCcsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICBub2RlQ2xhc3M6IFlBTUxNYXAuWUFNTE1hcCxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjptYXAnLFxuICAgIHJlc29sdmUobWFwLCBvbkVycm9yKSB7XG4gICAgICAgIGlmICghaWRlbnRpdHkuaXNNYXAobWFwKSlcbiAgICAgICAgICAgIG9uRXJyb3IoJ0V4cGVjdGVkIGEgbWFwcGluZyBmb3IgdGhpcyB0YWcnKTtcbiAgICAgICAgcmV0dXJuIG1hcDtcbiAgICB9LFxuICAgIGNyZWF0ZU5vZGU6IChzY2hlbWEsIG9iaiwgY3R4KSA9PiBZQU1MTWFwLllBTUxNYXAuZnJvbShzY2hlbWEsIG9iaiwgY3R4KVxufTtcblxuZXhwb3J0cy5tYXAgPSBtYXA7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIGNyZWF0ZU5vZGUgPSByZXF1aXJlKCcuLi9kb2MvY3JlYXRlTm9kZS5qcycpO1xudmFyIHN0cmluZ2lmeUNvbGxlY3Rpb24gPSByZXF1aXJlKCcuLi9zdHJpbmdpZnkvc3RyaW5naWZ5Q29sbGVjdGlvbi5qcycpO1xudmFyIENvbGxlY3Rpb24gPSByZXF1aXJlKCcuL0NvbGxlY3Rpb24uanMnKTtcbnZhciBpZGVudGl0eSA9IHJlcXVpcmUoJy4vaWRlbnRpdHkuanMnKTtcbnZhciBTY2FsYXIgPSByZXF1aXJlKCcuL1NjYWxhci5qcycpO1xudmFyIHRvSlMgPSByZXF1aXJlKCcuL3RvSlMuanMnKTtcblxuY2xhc3MgWUFNTFNlcSBleHRlbmRzIENvbGxlY3Rpb24uQ29sbGVjdGlvbiB7XG4gICAgc3RhdGljIGdldCB0YWdOYW1lKCkge1xuICAgICAgICByZXR1cm4gJ3RhZzp5YW1sLm9yZywyMDAyOnNlcSc7XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKHNjaGVtYSkge1xuICAgICAgICBzdXBlcihpZGVudGl0eS5TRVEsIHNjaGVtYSk7XG4gICAgICAgIHRoaXMuaXRlbXMgPSBbXTtcbiAgICB9XG4gICAgYWRkKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuaXRlbXMucHVzaCh2YWx1ZSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYSB2YWx1ZSBmcm9tIHRoZSBjb2xsZWN0aW9uLlxuICAgICAqXG4gICAgICogYGtleWAgbXVzdCBjb250YWluIGEgcmVwcmVzZW50YXRpb24gb2YgYW4gaW50ZWdlciBmb3IgdGhpcyB0byBzdWNjZWVkLlxuICAgICAqIEl0IG1heSBiZSB3cmFwcGVkIGluIGEgYFNjYWxhcmAuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGl0ZW0gd2FzIGZvdW5kIGFuZCByZW1vdmVkLlxuICAgICAqL1xuICAgIGRlbGV0ZShrZXkpIHtcbiAgICAgICAgY29uc3QgaWR4ID0gYXNJdGVtSW5kZXgoa2V5KTtcbiAgICAgICAgaWYgKHR5cGVvZiBpZHggIT09ICdudW1iZXInKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBjb25zdCBkZWwgPSB0aGlzLml0ZW1zLnNwbGljZShpZHgsIDEpO1xuICAgICAgICByZXR1cm4gZGVsLmxlbmd0aCA+IDA7XG4gICAgfVxuICAgIGdldChrZXksIGtlZXBTY2FsYXIpIHtcbiAgICAgICAgY29uc3QgaWR4ID0gYXNJdGVtSW5kZXgoa2V5KTtcbiAgICAgICAgaWYgKHR5cGVvZiBpZHggIT09ICdudW1iZXInKVxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgY29uc3QgaXQgPSB0aGlzLml0ZW1zW2lkeF07XG4gICAgICAgIHJldHVybiAha2VlcFNjYWxhciAmJiBpZGVudGl0eS5pc1NjYWxhcihpdCkgPyBpdC52YWx1ZSA6IGl0O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgdGhlIGNvbGxlY3Rpb24gaW5jbHVkZXMgYSB2YWx1ZSB3aXRoIHRoZSBrZXkgYGtleWAuXG4gICAgICpcbiAgICAgKiBga2V5YCBtdXN0IGNvbnRhaW4gYSByZXByZXNlbnRhdGlvbiBvZiBhbiBpbnRlZ2VyIGZvciB0aGlzIHRvIHN1Y2NlZWQuXG4gICAgICogSXQgbWF5IGJlIHdyYXBwZWQgaW4gYSBgU2NhbGFyYC5cbiAgICAgKi9cbiAgICBoYXMoa2V5KSB7XG4gICAgICAgIGNvbnN0IGlkeCA9IGFzSXRlbUluZGV4KGtleSk7XG4gICAgICAgIHJldHVybiB0eXBlb2YgaWR4ID09PSAnbnVtYmVyJyAmJiBpZHggPCB0aGlzLml0ZW1zLmxlbmd0aDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0cyBhIHZhbHVlIGluIHRoaXMgY29sbGVjdGlvbi4gRm9yIGAhIXNldGAsIGB2YWx1ZWAgbmVlZHMgdG8gYmUgYVxuICAgICAqIGJvb2xlYW4gdG8gYWRkL3JlbW92ZSB0aGUgaXRlbSBmcm9tIHRoZSBzZXQuXG4gICAgICpcbiAgICAgKiBJZiBga2V5YCBkb2VzIG5vdCBjb250YWluIGEgcmVwcmVzZW50YXRpb24gb2YgYW4gaW50ZWdlciwgdGhpcyB3aWxsIHRocm93LlxuICAgICAqIEl0IG1heSBiZSB3cmFwcGVkIGluIGEgYFNjYWxhcmAuXG4gICAgICovXG4gICAgc2V0KGtleSwgdmFsdWUpIHtcbiAgICAgICAgY29uc3QgaWR4ID0gYXNJdGVtSW5kZXgoa2V5KTtcbiAgICAgICAgaWYgKHR5cGVvZiBpZHggIT09ICdudW1iZXInKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCBhIHZhbGlkIGluZGV4LCBub3QgJHtrZXl9LmApO1xuICAgICAgICBjb25zdCBwcmV2ID0gdGhpcy5pdGVtc1tpZHhdO1xuICAgICAgICBpZiAoaWRlbnRpdHkuaXNTY2FsYXIocHJldikgJiYgU2NhbGFyLmlzU2NhbGFyVmFsdWUodmFsdWUpKVxuICAgICAgICAgICAgcHJldi52YWx1ZSA9IHZhbHVlO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aGlzLml0ZW1zW2lkeF0gPSB2YWx1ZTtcbiAgICB9XG4gICAgdG9KU09OKF8sIGN0eCkge1xuICAgICAgICBjb25zdCBzZXEgPSBbXTtcbiAgICAgICAgaWYgKGN0eD8ub25DcmVhdGUpXG4gICAgICAgICAgICBjdHgub25DcmVhdGUoc2VxKTtcbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgdGhpcy5pdGVtcylcbiAgICAgICAgICAgIHNlcS5wdXNoKHRvSlMudG9KUyhpdGVtLCBTdHJpbmcoaSsrKSwgY3R4KSk7XG4gICAgICAgIHJldHVybiBzZXE7XG4gICAgfVxuICAgIHRvU3RyaW5nKGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCkge1xuICAgICAgICBpZiAoIWN0eClcbiAgICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzKTtcbiAgICAgICAgcmV0dXJuIHN0cmluZ2lmeUNvbGxlY3Rpb24uc3RyaW5naWZ5Q29sbGVjdGlvbih0aGlzLCBjdHgsIHtcbiAgICAgICAgICAgIGJsb2NrSXRlbVByZWZpeDogJy0gJyxcbiAgICAgICAgICAgIGZsb3dDaGFyczogeyBzdGFydDogJ1snLCBlbmQ6ICddJyB9LFxuICAgICAgICAgICAgaXRlbUluZGVudDogKGN0eC5pbmRlbnQgfHwgJycpICsgJyAgJyxcbiAgICAgICAgICAgIG9uQ2hvbXBLZWVwLFxuICAgICAgICAgICAgb25Db21tZW50XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBzdGF0aWMgZnJvbShzY2hlbWEsIG9iaiwgY3R4KSB7XG4gICAgICAgIGNvbnN0IHsgcmVwbGFjZXIgfSA9IGN0eDtcbiAgICAgICAgY29uc3Qgc2VxID0gbmV3IHRoaXMoc2NoZW1hKTtcbiAgICAgICAgaWYgKG9iaiAmJiBTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KG9iaikpIHtcbiAgICAgICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgICAgIGZvciAobGV0IGl0IG9mIG9iaikge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcmVwbGFjZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qga2V5ID0gb2JqIGluc3RhbmNlb2YgU2V0ID8gaXQgOiBTdHJpbmcoaSsrKTtcbiAgICAgICAgICAgICAgICAgICAgaXQgPSByZXBsYWNlci5jYWxsKG9iaiwga2V5LCBpdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNlcS5pdGVtcy5wdXNoKGNyZWF0ZU5vZGUuY3JlYXRlTm9kZShpdCwgdW5kZWZpbmVkLCBjdHgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2VxO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGFzSXRlbUluZGV4KGtleSkge1xuICAgIGxldCBpZHggPSBpZGVudGl0eS5pc1NjYWxhcihrZXkpID8ga2V5LnZhbHVlIDoga2V5O1xuICAgIGlmIChpZHggJiYgdHlwZW9mIGlkeCA9PT0gJ3N0cmluZycpXG4gICAgICAgIGlkeCA9IE51bWJlcihpZHgpO1xuICAgIHJldHVybiB0eXBlb2YgaWR4ID09PSAnbnVtYmVyJyAmJiBOdW1iZXIuaXNJbnRlZ2VyKGlkeCkgJiYgaWR4ID49IDBcbiAgICAgICAgPyBpZHhcbiAgICAgICAgOiBudWxsO1xufVxuXG5leHBvcnRzLllBTUxTZXEgPSBZQU1MU2VxO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBpZGVudGl0eSA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL2lkZW50aXR5LmpzJyk7XG52YXIgWUFNTFNlcSA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL1lBTUxTZXEuanMnKTtcblxuY29uc3Qgc2VxID0ge1xuICAgIGNvbGxlY3Rpb246ICdzZXEnLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgbm9kZUNsYXNzOiBZQU1MU2VxLllBTUxTZXEsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6c2VxJyxcbiAgICByZXNvbHZlKHNlcSwgb25FcnJvcikge1xuICAgICAgICBpZiAoIWlkZW50aXR5LmlzU2VxKHNlcSkpXG4gICAgICAgICAgICBvbkVycm9yKCdFeHBlY3RlZCBhIHNlcXVlbmNlIGZvciB0aGlzIHRhZycpO1xuICAgICAgICByZXR1cm4gc2VxO1xuICAgIH0sXG4gICAgY3JlYXRlTm9kZTogKHNjaGVtYSwgb2JqLCBjdHgpID0+IFlBTUxTZXEuWUFNTFNlcS5mcm9tKHNjaGVtYSwgb2JqLCBjdHgpXG59O1xuXG5leHBvcnRzLnNlcSA9IHNlcTtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgc3RyaW5naWZ5U3RyaW5nID0gcmVxdWlyZSgnLi4vLi4vc3RyaW5naWZ5L3N0cmluZ2lmeVN0cmluZy5qcycpO1xuXG5jb25zdCBzdHJpbmcgPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpzdHInLFxuICAgIHJlc29sdmU6IHN0ciA9PiBzdHIsXG4gICAgc3RyaW5naWZ5KGl0ZW0sIGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCkge1xuICAgICAgICBjdHggPSBPYmplY3QuYXNzaWduKHsgYWN0dWFsU3RyaW5nOiB0cnVlIH0sIGN0eCk7XG4gICAgICAgIHJldHVybiBzdHJpbmdpZnlTdHJpbmcuc3RyaW5naWZ5U3RyaW5nKGl0ZW0sIGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCk7XG4gICAgfVxufTtcblxuZXhwb3J0cy5zdHJpbmcgPSBzdHJpbmc7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIFNjYWxhciA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL1NjYWxhci5qcycpO1xuXG5jb25zdCBudWxsVGFnID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB2YWx1ZSA9PSBudWxsLFxuICAgIGNyZWF0ZU5vZGU6ICgpID0+IG5ldyBTY2FsYXIuU2NhbGFyKG51bGwpLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6bnVsbCcsXG4gICAgdGVzdDogL14oPzp+fFtObl11bGx8TlVMTCk/JC8sXG4gICAgcmVzb2x2ZTogKCkgPT4gbmV3IFNjYWxhci5TY2FsYXIobnVsbCksXG4gICAgc3RyaW5naWZ5OiAoeyBzb3VyY2UgfSwgY3R4KSA9PiB0eXBlb2Ygc291cmNlID09PSAnc3RyaW5nJyAmJiBudWxsVGFnLnRlc3QudGVzdChzb3VyY2UpXG4gICAgICAgID8gc291cmNlXG4gICAgICAgIDogY3R4Lm9wdGlvbnMubnVsbFN0clxufTtcblxuZXhwb3J0cy5udWxsVGFnID0gbnVsbFRhZztcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgU2NhbGFyID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvU2NhbGFyLmpzJyk7XG5cbmNvbnN0IGJvb2xUYWcgPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6Ym9vbCcsXG4gICAgdGVzdDogL14oPzpbVHRdcnVlfFRSVUV8W0ZmXWFsc2V8RkFMU0UpJC8sXG4gICAgcmVzb2x2ZTogc3RyID0+IG5ldyBTY2FsYXIuU2NhbGFyKHN0clswXSA9PT0gJ3QnIHx8IHN0clswXSA9PT0gJ1QnKSxcbiAgICBzdHJpbmdpZnkoeyBzb3VyY2UsIHZhbHVlIH0sIGN0eCkge1xuICAgICAgICBpZiAoc291cmNlICYmIGJvb2xUYWcudGVzdC50ZXN0KHNvdXJjZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IHN2ID0gc291cmNlWzBdID09PSAndCcgfHwgc291cmNlWzBdID09PSAnVCc7XG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IHN2KVxuICAgICAgICAgICAgICAgIHJldHVybiBzb3VyY2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbHVlID8gY3R4Lm9wdGlvbnMudHJ1ZVN0ciA6IGN0eC5vcHRpb25zLmZhbHNlU3RyO1xuICAgIH1cbn07XG5cbmV4cG9ydHMuYm9vbFRhZyA9IGJvb2xUYWc7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gc3RyaW5naWZ5TnVtYmVyKHsgZm9ybWF0LCBtaW5GcmFjdGlvbkRpZ2l0cywgdGFnLCB2YWx1ZSB9KSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2JpZ2ludCcpXG4gICAgICAgIHJldHVybiBTdHJpbmcodmFsdWUpO1xuICAgIGNvbnN0IG51bSA9IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgPyB2YWx1ZSA6IE51bWJlcih2YWx1ZSk7XG4gICAgaWYgKCFpc0Zpbml0ZShudW0pKVxuICAgICAgICByZXR1cm4gaXNOYU4obnVtKSA/ICcubmFuJyA6IG51bSA8IDAgPyAnLS5pbmYnIDogJy5pbmYnO1xuICAgIGxldCBuID0gT2JqZWN0LmlzKHZhbHVlLCAtMCkgPyAnLTAnIDogSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgIGlmICghZm9ybWF0ICYmXG4gICAgICAgIG1pbkZyYWN0aW9uRGlnaXRzICYmXG4gICAgICAgICghdGFnIHx8IHRhZyA9PT0gJ3RhZzp5YW1sLm9yZywyMDAyOmZsb2F0JykgJiZcbiAgICAgICAgL15cXGQvLnRlc3QobikpIHtcbiAgICAgICAgbGV0IGkgPSBuLmluZGV4T2YoJy4nKTtcbiAgICAgICAgaWYgKGkgPCAwKSB7XG4gICAgICAgICAgICBpID0gbi5sZW5ndGg7XG4gICAgICAgICAgICBuICs9ICcuJztcbiAgICAgICAgfVxuICAgICAgICBsZXQgZCA9IG1pbkZyYWN0aW9uRGlnaXRzIC0gKG4ubGVuZ3RoIC0gaSAtIDEpO1xuICAgICAgICB3aGlsZSAoZC0tID4gMClcbiAgICAgICAgICAgIG4gKz0gJzAnO1xuICAgIH1cbiAgICByZXR1cm4gbjtcbn1cblxuZXhwb3J0cy5zdHJpbmdpZnlOdW1iZXIgPSBzdHJpbmdpZnlOdW1iZXI7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIFNjYWxhciA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL1NjYWxhci5qcycpO1xudmFyIHN0cmluZ2lmeU51bWJlciA9IHJlcXVpcmUoJy4uLy4uL3N0cmluZ2lmeS9zdHJpbmdpZnlOdW1iZXIuanMnKTtcblxuY29uc3QgZmxvYXROYU4gPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpmbG9hdCcsXG4gICAgdGVzdDogL14oPzpbLStdP1xcLig/OmluZnxJbmZ8SU5GKXxcXC5uYW58XFwuTmFOfFxcLk5BTikkLyxcbiAgICByZXNvbHZlOiBzdHIgPT4gc3RyLnNsaWNlKC0zKS50b0xvd2VyQ2FzZSgpID09PSAnbmFuJ1xuICAgICAgICA/IE5hTlxuICAgICAgICA6IHN0clswXSA9PT0gJy0nXG4gICAgICAgICAgICA/IE51bWJlci5ORUdBVElWRV9JTkZJTklUWVxuICAgICAgICAgICAgOiBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFksXG4gICAgc3RyaW5naWZ5OiBzdHJpbmdpZnlOdW1iZXIuc3RyaW5naWZ5TnVtYmVyXG59O1xuY29uc3QgZmxvYXRFeHAgPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpmbG9hdCcsXG4gICAgZm9ybWF0OiAnRVhQJyxcbiAgICB0ZXN0OiAvXlstK10/KD86XFwuWzAtOV0rfFswLTldKyg/OlxcLlswLTldKik/KVtlRV1bLStdP1swLTldKyQvLFxuICAgIHJlc29sdmU6IHN0ciA9PiBwYXJzZUZsb2F0KHN0ciksXG4gICAgc3RyaW5naWZ5KG5vZGUpIHtcbiAgICAgICAgY29uc3QgbnVtID0gTnVtYmVyKG5vZGUudmFsdWUpO1xuICAgICAgICByZXR1cm4gaXNGaW5pdGUobnVtKSA/IG51bS50b0V4cG9uZW50aWFsKCkgOiBzdHJpbmdpZnlOdW1iZXIuc3RyaW5naWZ5TnVtYmVyKG5vZGUpO1xuICAgIH1cbn07XG5jb25zdCBmbG9hdCA9IHtcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmZsb2F0JyxcbiAgICB0ZXN0OiAvXlstK10/KD86XFwuWzAtOV0rfFswLTldK1xcLlswLTldKikkLyxcbiAgICByZXNvbHZlKHN0cikge1xuICAgICAgICBjb25zdCBub2RlID0gbmV3IFNjYWxhci5TY2FsYXIocGFyc2VGbG9hdChzdHIpKTtcbiAgICAgICAgY29uc3QgZG90ID0gc3RyLmluZGV4T2YoJy4nKTtcbiAgICAgICAgaWYgKGRvdCAhPT0gLTEgJiYgc3RyW3N0ci5sZW5ndGggLSAxXSA9PT0gJzAnKVxuICAgICAgICAgICAgbm9kZS5taW5GcmFjdGlvbkRpZ2l0cyA9IHN0ci5sZW5ndGggLSBkb3QgLSAxO1xuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICB9LFxuICAgIHN0cmluZ2lmeTogc3RyaW5naWZ5TnVtYmVyLnN0cmluZ2lmeU51bWJlclxufTtcblxuZXhwb3J0cy5mbG9hdCA9IGZsb2F0O1xuZXhwb3J0cy5mbG9hdEV4cCA9IGZsb2F0RXhwO1xuZXhwb3J0cy5mbG9hdE5hTiA9IGZsb2F0TmFOO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBzdHJpbmdpZnlOdW1iZXIgPSByZXF1aXJlKCcuLi8uLi9zdHJpbmdpZnkvc3RyaW5naWZ5TnVtYmVyLmpzJyk7XG5cbmNvbnN0IGludElkZW50aWZ5ID0gKHZhbHVlKSA9PiB0eXBlb2YgdmFsdWUgPT09ICdiaWdpbnQnIHx8IE51bWJlci5pc0ludGVnZXIodmFsdWUpO1xuY29uc3QgaW50UmVzb2x2ZSA9IChzdHIsIG9mZnNldCwgcmFkaXgsIHsgaW50QXNCaWdJbnQgfSkgPT4gKGludEFzQmlnSW50ID8gQmlnSW50KHN0cikgOiBwYXJzZUludChzdHIuc3Vic3RyaW5nKG9mZnNldCksIHJhZGl4KSk7XG5mdW5jdGlvbiBpbnRTdHJpbmdpZnkobm9kZSwgcmFkaXgsIHByZWZpeCkge1xuICAgIGNvbnN0IHsgdmFsdWUgfSA9IG5vZGU7XG4gICAgaWYgKGludElkZW50aWZ5KHZhbHVlKSAmJiB2YWx1ZSA+PSAwKVxuICAgICAgICByZXR1cm4gcHJlZml4ICsgdmFsdWUudG9TdHJpbmcocmFkaXgpO1xuICAgIHJldHVybiBzdHJpbmdpZnlOdW1iZXIuc3RyaW5naWZ5TnVtYmVyKG5vZGUpO1xufVxuY29uc3QgaW50T2N0ID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiBpbnRJZGVudGlmeSh2YWx1ZSkgJiYgdmFsdWUgPj0gMCxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmludCcsXG4gICAgZm9ybWF0OiAnT0NUJyxcbiAgICB0ZXN0OiAvXjBvWzAtN10rJC8sXG4gICAgcmVzb2x2ZTogKHN0ciwgX29uRXJyb3IsIG9wdCkgPT4gaW50UmVzb2x2ZShzdHIsIDIsIDgsIG9wdCksXG4gICAgc3RyaW5naWZ5OiBub2RlID0+IGludFN0cmluZ2lmeShub2RlLCA4LCAnMG8nKVxufTtcbmNvbnN0IGludCA9IHtcbiAgICBpZGVudGlmeTogaW50SWRlbnRpZnksXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjppbnQnLFxuICAgIHRlc3Q6IC9eWy0rXT9bMC05XSskLyxcbiAgICByZXNvbHZlOiAoc3RyLCBfb25FcnJvciwgb3B0KSA9PiBpbnRSZXNvbHZlKHN0ciwgMCwgMTAsIG9wdCksXG4gICAgc3RyaW5naWZ5OiBzdHJpbmdpZnlOdW1iZXIuc3RyaW5naWZ5TnVtYmVyXG59O1xuY29uc3QgaW50SGV4ID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiBpbnRJZGVudGlmeSh2YWx1ZSkgJiYgdmFsdWUgPj0gMCxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmludCcsXG4gICAgZm9ybWF0OiAnSEVYJyxcbiAgICB0ZXN0OiAvXjB4WzAtOWEtZkEtRl0rJC8sXG4gICAgcmVzb2x2ZTogKHN0ciwgX29uRXJyb3IsIG9wdCkgPT4gaW50UmVzb2x2ZShzdHIsIDIsIDE2LCBvcHQpLFxuICAgIHN0cmluZ2lmeTogbm9kZSA9PiBpbnRTdHJpbmdpZnkobm9kZSwgMTYsICcweCcpXG59O1xuXG5leHBvcnRzLmludCA9IGludDtcbmV4cG9ydHMuaW50SGV4ID0gaW50SGV4O1xuZXhwb3J0cy5pbnRPY3QgPSBpbnRPY3Q7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIG1hcCA9IHJlcXVpcmUoJy4uL2NvbW1vbi9tYXAuanMnKTtcbnZhciBfbnVsbCA9IHJlcXVpcmUoJy4uL2NvbW1vbi9udWxsLmpzJyk7XG52YXIgc2VxID0gcmVxdWlyZSgnLi4vY29tbW9uL3NlcS5qcycpO1xudmFyIHN0cmluZyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9zdHJpbmcuanMnKTtcbnZhciBib29sID0gcmVxdWlyZSgnLi9ib29sLmpzJyk7XG52YXIgZmxvYXQgPSByZXF1aXJlKCcuL2Zsb2F0LmpzJyk7XG52YXIgaW50ID0gcmVxdWlyZSgnLi9pbnQuanMnKTtcblxuY29uc3Qgc2NoZW1hID0gW1xuICAgIG1hcC5tYXAsXG4gICAgc2VxLnNlcSxcbiAgICBzdHJpbmcuc3RyaW5nLFxuICAgIF9udWxsLm51bGxUYWcsXG4gICAgYm9vbC5ib29sVGFnLFxuICAgIGludC5pbnRPY3QsXG4gICAgaW50LmludCxcbiAgICBpbnQuaW50SGV4LFxuICAgIGZsb2F0LmZsb2F0TmFOLFxuICAgIGZsb2F0LmZsb2F0RXhwLFxuICAgIGZsb2F0LmZsb2F0XG5dO1xuXG5leHBvcnRzLnNjaGVtYSA9IHNjaGVtYTtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgU2NhbGFyID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvU2NhbGFyLmpzJyk7XG52YXIgbWFwID0gcmVxdWlyZSgnLi4vY29tbW9uL21hcC5qcycpO1xudmFyIHNlcSA9IHJlcXVpcmUoJy4uL2NvbW1vbi9zZXEuanMnKTtcblxuZnVuY3Rpb24gaW50SWRlbnRpZnkodmFsdWUpIHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnYmlnaW50JyB8fCBOdW1iZXIuaXNJbnRlZ2VyKHZhbHVlKTtcbn1cbmNvbnN0IHN0cmluZ2lmeUpTT04gPSAoeyB2YWx1ZSB9KSA9PiBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG5jb25zdCBqc29uU2NhbGFycyA9IFtcbiAgICB7XG4gICAgICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpzdHInLFxuICAgICAgICByZXNvbHZlOiBzdHIgPT4gc3RyLFxuICAgICAgICBzdHJpbmdpZnk6IHN0cmluZ2lmeUpTT05cbiAgICB9LFxuICAgIHtcbiAgICAgICAgaWRlbnRpZnk6IHZhbHVlID0+IHZhbHVlID09IG51bGwsXG4gICAgICAgIGNyZWF0ZU5vZGU6ICgpID0+IG5ldyBTY2FsYXIuU2NhbGFyKG51bGwpLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpudWxsJyxcbiAgICAgICAgdGVzdDogL15udWxsJC8sXG4gICAgICAgIHJlc29sdmU6ICgpID0+IG51bGwsXG4gICAgICAgIHN0cmluZ2lmeTogc3RyaW5naWZ5SlNPTlxuICAgIH0sXG4gICAge1xuICAgICAgICBpZGVudGlmeTogdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmJvb2wnLFxuICAgICAgICB0ZXN0OiAvXnRydWUkfF5mYWxzZSQvLFxuICAgICAgICByZXNvbHZlOiBzdHIgPT4gc3RyID09PSAndHJ1ZScsXG4gICAgICAgIHN0cmluZ2lmeTogc3RyaW5naWZ5SlNPTlxuICAgIH0sXG4gICAge1xuICAgICAgICBpZGVudGlmeTogaW50SWRlbnRpZnksXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmludCcsXG4gICAgICAgIHRlc3Q6IC9eLT8oPzowfFsxLTldWzAtOV0qKSQvLFxuICAgICAgICByZXNvbHZlOiAoc3RyLCBfb25FcnJvciwgeyBpbnRBc0JpZ0ludCB9KSA9PiBpbnRBc0JpZ0ludCA/IEJpZ0ludChzdHIpIDogcGFyc2VJbnQoc3RyLCAxMCksXG4gICAgICAgIHN0cmluZ2lmeTogKHsgdmFsdWUgfSkgPT4gaW50SWRlbnRpZnkodmFsdWUpID8gdmFsdWUudG9TdHJpbmcoKSA6IEpTT04uc3RyaW5naWZ5KHZhbHVlKVxuICAgIH0sXG4gICAge1xuICAgICAgICBpZGVudGlmeTogdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6ZmxvYXQnLFxuICAgICAgICB0ZXN0OiAvXi0/KD86MHxbMS05XVswLTldKikoPzpcXC5bMC05XSopPyg/OltlRV1bLStdP1swLTldKyk/JC8sXG4gICAgICAgIHJlc29sdmU6IHN0ciA9PiBwYXJzZUZsb2F0KHN0ciksXG4gICAgICAgIHN0cmluZ2lmeTogc3RyaW5naWZ5SlNPTlxuICAgIH1cbl07XG5jb25zdCBqc29uRXJyb3IgPSB7XG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICcnLFxuICAgIHRlc3Q6IC9eLyxcbiAgICByZXNvbHZlKHN0ciwgb25FcnJvcikge1xuICAgICAgICBvbkVycm9yKGBVbnJlc29sdmVkIHBsYWluIHNjYWxhciAke0pTT04uc3RyaW5naWZ5KHN0cil9YCk7XG4gICAgICAgIHJldHVybiBzdHI7XG4gICAgfVxufTtcbmNvbnN0IHNjaGVtYSA9IFttYXAubWFwLCBzZXEuc2VxXS5jb25jYXQoanNvblNjYWxhcnMsIGpzb25FcnJvcik7XG5cbmV4cG9ydHMuc2NoZW1hID0gc2NoZW1hO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBub2RlX2J1ZmZlciA9IHJlcXVpcmUoJ2J1ZmZlcicpO1xudmFyIFNjYWxhciA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL1NjYWxhci5qcycpO1xudmFyIHN0cmluZ2lmeVN0cmluZyA9IHJlcXVpcmUoJy4uLy4uL3N0cmluZ2lmeS9zdHJpbmdpZnlTdHJpbmcuanMnKTtcblxuY29uc3QgYmluYXJ5ID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB2YWx1ZSBpbnN0YW5jZW9mIFVpbnQ4QXJyYXksIC8vIEJ1ZmZlciBpbmhlcml0cyBmcm9tIFVpbnQ4QXJyYXlcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpiaW5hcnknLFxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBCdWZmZXIgaW4gbm9kZSBhbmQgYW4gVWludDhBcnJheSBpbiBicm93c2Vyc1xuICAgICAqXG4gICAgICogVG8gdXNlIHRoZSByZXN1bHRpbmcgYnVmZmVyIGFzIGFuIGltYWdlLCB5b3UnbGwgd2FudCB0byBkbyBzb21ldGhpbmcgbGlrZTpcbiAgICAgKlxuICAgICAqICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFtidWZmZXJdLCB7IHR5cGU6ICdpbWFnZS9qcGVnJyB9KVxuICAgICAqICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3Bob3RvJykuc3JjID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKVxuICAgICAqL1xuICAgIHJlc29sdmUoc3JjLCBvbkVycm9yKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygbm9kZV9idWZmZXIuQnVmZmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICByZXR1cm4gbm9kZV9idWZmZXIuQnVmZmVyLmZyb20oc3JjLCAnYmFzZTY0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIGF0b2IgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIC8vIE9uIElFIDExLCBhdG9iKCkgY2FuJ3QgaGFuZGxlIG5ld2xpbmVzXG4gICAgICAgICAgICBjb25zdCBzdHIgPSBhdG9iKHNyYy5yZXBsYWNlKC9bXFxuXFxyXS9nLCAnJykpO1xuICAgICAgICAgICAgY29uc3QgYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoc3RyLmxlbmd0aCk7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0ci5sZW5ndGg7ICsraSlcbiAgICAgICAgICAgICAgICBidWZmZXJbaV0gPSBzdHIuY2hhckNvZGVBdChpKTtcbiAgICAgICAgICAgIHJldHVybiBidWZmZXI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBvbkVycm9yKCdUaGlzIGVudmlyb25tZW50IGRvZXMgbm90IHN1cHBvcnQgcmVhZGluZyBiaW5hcnkgdGFnczsgZWl0aGVyIEJ1ZmZlciBvciBhdG9iIGlzIHJlcXVpcmVkJyk7XG4gICAgICAgICAgICByZXR1cm4gc3JjO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBzdHJpbmdpZnkoeyBjb21tZW50LCB0eXBlLCB2YWx1ZSB9LCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApIHtcbiAgICAgICAgaWYgKCF2YWx1ZSlcbiAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgY29uc3QgYnVmID0gdmFsdWU7IC8vIGNoZWNrZWQgZWFybGllciBieSBiaW5hcnkuaWRlbnRpZnkoKVxuICAgICAgICBsZXQgc3RyO1xuICAgICAgICBpZiAodHlwZW9mIG5vZGVfYnVmZmVyLkJ1ZmZlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgc3RyID1cbiAgICAgICAgICAgICAgICBidWYgaW5zdGFuY2VvZiBub2RlX2J1ZmZlci5CdWZmZXJcbiAgICAgICAgICAgICAgICAgICAgPyBidWYudG9TdHJpbmcoJ2Jhc2U2NCcpXG4gICAgICAgICAgICAgICAgICAgIDogbm9kZV9idWZmZXIuQnVmZmVyLmZyb20oYnVmLmJ1ZmZlcikudG9TdHJpbmcoJ2Jhc2U2NCcpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiBidG9hID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBsZXQgcyA9ICcnO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBidWYubGVuZ3RoOyArK2kpXG4gICAgICAgICAgICAgICAgcyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSk7XG4gICAgICAgICAgICBzdHIgPSBidG9hKHMpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGlzIGVudmlyb25tZW50IGRvZXMgbm90IHN1cHBvcnQgd3JpdGluZyBiaW5hcnkgdGFnczsgZWl0aGVyIEJ1ZmZlciBvciBidG9hIGlzIHJlcXVpcmVkJyk7XG4gICAgICAgIH1cbiAgICAgICAgdHlwZSA/PyAodHlwZSA9IFNjYWxhci5TY2FsYXIuQkxPQ0tfTElURVJBTCk7XG4gICAgICAgIGlmICh0eXBlICE9PSBTY2FsYXIuU2NhbGFyLlFVT1RFX0RPVUJMRSkge1xuICAgICAgICAgICAgY29uc3QgbGluZVdpZHRoID0gTWF0aC5tYXgoY3R4Lm9wdGlvbnMubGluZVdpZHRoIC0gY3R4LmluZGVudC5sZW5ndGgsIGN0eC5vcHRpb25zLm1pbkNvbnRlbnRXaWR0aCk7XG4gICAgICAgICAgICBjb25zdCBuID0gTWF0aC5jZWlsKHN0ci5sZW5ndGggLyBsaW5lV2lkdGgpO1xuICAgICAgICAgICAgY29uc3QgbGluZXMgPSBuZXcgQXJyYXkobik7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgbyA9IDA7IGkgPCBuOyArK2ksIG8gKz0gbGluZVdpZHRoKSB7XG4gICAgICAgICAgICAgICAgbGluZXNbaV0gPSBzdHIuc3Vic3RyKG8sIGxpbmVXaWR0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdHIgPSBsaW5lcy5qb2luKHR5cGUgPT09IFNjYWxhci5TY2FsYXIuQkxPQ0tfTElURVJBTCA/ICdcXG4nIDogJyAnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3RyaW5naWZ5U3RyaW5nLnN0cmluZ2lmeVN0cmluZyh7IGNvbW1lbnQsIHR5cGUsIHZhbHVlOiBzdHIgfSwgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKTtcbiAgICB9XG59O1xuXG5leHBvcnRzLmJpbmFyeSA9IGJpbmFyeTtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9pZGVudGl0eS5qcycpO1xudmFyIFBhaXIgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9QYWlyLmpzJyk7XG52YXIgU2NhbGFyID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvU2NhbGFyLmpzJyk7XG52YXIgWUFNTFNlcSA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL1lBTUxTZXEuanMnKTtcblxuZnVuY3Rpb24gcmVzb2x2ZVBhaXJzKHNlcSwgb25FcnJvcikge1xuICAgIGlmIChpZGVudGl0eS5pc1NlcShzZXEpKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2VxLml0ZW1zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBsZXQgaXRlbSA9IHNlcS5pdGVtc1tpXTtcbiAgICAgICAgICAgIGlmIChpZGVudGl0eS5pc1BhaXIoaXRlbSkpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICBlbHNlIGlmIChpZGVudGl0eS5pc01hcChpdGVtKSkge1xuICAgICAgICAgICAgICAgIGlmIChpdGVtLml0ZW1zLmxlbmd0aCA+IDEpXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IoJ0VhY2ggcGFpciBtdXN0IGhhdmUgaXRzIG93biBzZXF1ZW5jZSBpbmRpY2F0b3InKTtcbiAgICAgICAgICAgICAgICBjb25zdCBwYWlyID0gaXRlbS5pdGVtc1swXSB8fCBuZXcgUGFpci5QYWlyKG5ldyBTY2FsYXIuU2NhbGFyKG51bGwpKTtcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS5jb21tZW50QmVmb3JlKVxuICAgICAgICAgICAgICAgICAgICBwYWlyLmtleS5jb21tZW50QmVmb3JlID0gcGFpci5rZXkuY29tbWVudEJlZm9yZVxuICAgICAgICAgICAgICAgICAgICAgICAgPyBgJHtpdGVtLmNvbW1lbnRCZWZvcmV9XFxuJHtwYWlyLmtleS5jb21tZW50QmVmb3JlfWBcbiAgICAgICAgICAgICAgICAgICAgICAgIDogaXRlbS5jb21tZW50QmVmb3JlO1xuICAgICAgICAgICAgICAgIGlmIChpdGVtLmNvbW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY24gPSBwYWlyLnZhbHVlID8/IHBhaXIua2V5O1xuICAgICAgICAgICAgICAgICAgICBjbi5jb21tZW50ID0gY24uY29tbWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgPyBgJHtpdGVtLmNvbW1lbnR9XFxuJHtjbi5jb21tZW50fWBcbiAgICAgICAgICAgICAgICAgICAgICAgIDogaXRlbS5jb21tZW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpdGVtID0gcGFpcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlcS5pdGVtc1tpXSA9IGlkZW50aXR5LmlzUGFpcihpdGVtKSA/IGl0ZW0gOiBuZXcgUGFpci5QYWlyKGl0ZW0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2VcbiAgICAgICAgb25FcnJvcignRXhwZWN0ZWQgYSBzZXF1ZW5jZSBmb3IgdGhpcyB0YWcnKTtcbiAgICByZXR1cm4gc2VxO1xufVxuZnVuY3Rpb24gY3JlYXRlUGFpcnMoc2NoZW1hLCBpdGVyYWJsZSwgY3R4KSB7XG4gICAgY29uc3QgeyByZXBsYWNlciB9ID0gY3R4O1xuICAgIGNvbnN0IHBhaXJzID0gbmV3IFlBTUxTZXEuWUFNTFNlcShzY2hlbWEpO1xuICAgIHBhaXJzLnRhZyA9ICd0YWc6eWFtbC5vcmcsMjAwMjpwYWlycyc7XG4gICAgbGV0IGkgPSAwO1xuICAgIGlmIChpdGVyYWJsZSAmJiBTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KGl0ZXJhYmxlKSlcbiAgICAgICAgZm9yIChsZXQgaXQgb2YgaXRlcmFibGUpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcmVwbGFjZXIgPT09ICdmdW5jdGlvbicpXG4gICAgICAgICAgICAgICAgaXQgPSByZXBsYWNlci5jYWxsKGl0ZXJhYmxlLCBTdHJpbmcoaSsrKSwgaXQpO1xuICAgICAgICAgICAgbGV0IGtleSwgdmFsdWU7XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShpdCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXQubGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgIGtleSA9IGl0WzBdO1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IGl0WzFdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEV4cGVjdGVkIFtrZXksIHZhbHVlXSB0dXBsZTogJHtpdH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGl0ICYmIGl0IGluc3RhbmNlb2YgT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKGl0KTtcbiAgICAgICAgICAgICAgICBpZiAoa2V5cy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAga2V5ID0ga2V5c1swXTtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBpdFtrZXldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgdHVwbGUgd2l0aCBvbmUga2V5LCBub3QgJHtrZXlzLmxlbmd0aH0ga2V5c2ApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGtleSA9IGl0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGFpcnMuaXRlbXMucHVzaChQYWlyLmNyZWF0ZVBhaXIoa2V5LCB2YWx1ZSwgY3R4KSk7XG4gICAgICAgIH1cbiAgICByZXR1cm4gcGFpcnM7XG59XG5jb25zdCBwYWlycyA9IHtcbiAgICBjb2xsZWN0aW9uOiAnc2VxJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpwYWlycycsXG4gICAgcmVzb2x2ZTogcmVzb2x2ZVBhaXJzLFxuICAgIGNyZWF0ZU5vZGU6IGNyZWF0ZVBhaXJzXG59O1xuXG5leHBvcnRzLmNyZWF0ZVBhaXJzID0gY3JlYXRlUGFpcnM7XG5leHBvcnRzLnBhaXJzID0gcGFpcnM7XG5leHBvcnRzLnJlc29sdmVQYWlycyA9IHJlc29sdmVQYWlycztcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9pZGVudGl0eS5qcycpO1xudmFyIHRvSlMgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy90b0pTLmpzJyk7XG52YXIgWUFNTE1hcCA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL1lBTUxNYXAuanMnKTtcbnZhciBZQU1MU2VxID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvWUFNTFNlcS5qcycpO1xudmFyIHBhaXJzID0gcmVxdWlyZSgnLi9wYWlycy5qcycpO1xuXG5jbGFzcyBZQU1MT01hcCBleHRlbmRzIFlBTUxTZXEuWUFNTFNlcSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuYWRkID0gWUFNTE1hcC5ZQU1MTWFwLnByb3RvdHlwZS5hZGQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5kZWxldGUgPSBZQU1MTWFwLllBTUxNYXAucHJvdG90eXBlLmRlbGV0ZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmdldCA9IFlBTUxNYXAuWUFNTE1hcC5wcm90b3R5cGUuZ2V0LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuaGFzID0gWUFNTE1hcC5ZQU1MTWFwLnByb3RvdHlwZS5oYXMuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5zZXQgPSBZQU1MTWFwLllBTUxNYXAucHJvdG90eXBlLnNldC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnRhZyA9IFlBTUxPTWFwLnRhZztcbiAgICB9XG4gICAgLyoqXG4gICAgICogSWYgYGN0eGAgaXMgZ2l2ZW4sIHRoZSByZXR1cm4gdHlwZSBpcyBhY3R1YWxseSBgTWFwPHVua25vd24sIHVua25vd24+YCxcbiAgICAgKiBidXQgVHlwZVNjcmlwdCB3b24ndCBhbGxvdyB3aWRlbmluZyB0aGUgc2lnbmF0dXJlIG9mIGEgY2hpbGQgbWV0aG9kLlxuICAgICAqL1xuICAgIHRvSlNPTihfLCBjdHgpIHtcbiAgICAgICAgaWYgKCFjdHgpXG4gICAgICAgICAgICByZXR1cm4gc3VwZXIudG9KU09OKF8pO1xuICAgICAgICBjb25zdCBtYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgIGlmIChjdHg/Lm9uQ3JlYXRlKVxuICAgICAgICAgICAgY3R4Lm9uQ3JlYXRlKG1hcCk7XG4gICAgICAgIGZvciAoY29uc3QgcGFpciBvZiB0aGlzLml0ZW1zKSB7XG4gICAgICAgICAgICBsZXQga2V5LCB2YWx1ZTtcbiAgICAgICAgICAgIGlmIChpZGVudGl0eS5pc1BhaXIocGFpcikpIHtcbiAgICAgICAgICAgICAgICBrZXkgPSB0b0pTLnRvSlMocGFpci5rZXksICcnLCBjdHgpO1xuICAgICAgICAgICAgICAgIHZhbHVlID0gdG9KUy50b0pTKHBhaXIudmFsdWUsIGtleSwgY3R4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGtleSA9IHRvSlMudG9KUyhwYWlyLCAnJywgY3R4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChtYXAuaGFzKGtleSkpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdPcmRlcmVkIG1hcHMgbXVzdCBub3QgaW5jbHVkZSBkdXBsaWNhdGUga2V5cycpO1xuICAgICAgICAgICAgbWFwLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWFwO1xuICAgIH1cbiAgICBzdGF0aWMgZnJvbShzY2hlbWEsIGl0ZXJhYmxlLCBjdHgpIHtcbiAgICAgICAgY29uc3QgcGFpcnMkMSA9IHBhaXJzLmNyZWF0ZVBhaXJzKHNjaGVtYSwgaXRlcmFibGUsIGN0eCk7XG4gICAgICAgIGNvbnN0IG9tYXAgPSBuZXcgdGhpcygpO1xuICAgICAgICBvbWFwLml0ZW1zID0gcGFpcnMkMS5pdGVtcztcbiAgICAgICAgcmV0dXJuIG9tYXA7XG4gICAgfVxufVxuWUFNTE9NYXAudGFnID0gJ3RhZzp5YW1sLm9yZywyMDAyOm9tYXAnO1xuY29uc3Qgb21hcCA9IHtcbiAgICBjb2xsZWN0aW9uOiAnc2VxJyxcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gdmFsdWUgaW5zdGFuY2VvZiBNYXAsXG4gICAgbm9kZUNsYXNzOiBZQU1MT01hcCxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpvbWFwJyxcbiAgICByZXNvbHZlKHNlcSwgb25FcnJvcikge1xuICAgICAgICBjb25zdCBwYWlycyQxID0gcGFpcnMucmVzb2x2ZVBhaXJzKHNlcSwgb25FcnJvcik7XG4gICAgICAgIGNvbnN0IHNlZW5LZXlzID0gW107XG4gICAgICAgIGZvciAoY29uc3QgeyBrZXkgfSBvZiBwYWlycyQxLml0ZW1zKSB7XG4gICAgICAgICAgICBpZiAoaWRlbnRpdHkuaXNTY2FsYXIoa2V5KSkge1xuICAgICAgICAgICAgICAgIGlmIChzZWVuS2V5cy5pbmNsdWRlcyhrZXkudmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IoYE9yZGVyZWQgbWFwcyBtdXN0IG5vdCBpbmNsdWRlIGR1cGxpY2F0ZSBrZXlzOiAke2tleS52YWx1ZX1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHNlZW5LZXlzLnB1c2goa2V5LnZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24obmV3IFlBTUxPTWFwKCksIHBhaXJzJDEpO1xuICAgIH0sXG4gICAgY3JlYXRlTm9kZTogKHNjaGVtYSwgaXRlcmFibGUsIGN0eCkgPT4gWUFNTE9NYXAuZnJvbShzY2hlbWEsIGl0ZXJhYmxlLCBjdHgpXG59O1xuXG5leHBvcnRzLllBTUxPTWFwID0gWUFNTE9NYXA7XG5leHBvcnRzLm9tYXAgPSBvbWFwO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBTY2FsYXIgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9TY2FsYXIuanMnKTtcblxuZnVuY3Rpb24gYm9vbFN0cmluZ2lmeSh7IHZhbHVlLCBzb3VyY2UgfSwgY3R4KSB7XG4gICAgY29uc3QgYm9vbE9iaiA9IHZhbHVlID8gdHJ1ZVRhZyA6IGZhbHNlVGFnO1xuICAgIGlmIChzb3VyY2UgJiYgYm9vbE9iai50ZXN0LnRlc3Qoc291cmNlKSlcbiAgICAgICAgcmV0dXJuIHNvdXJjZTtcbiAgICByZXR1cm4gdmFsdWUgPyBjdHgub3B0aW9ucy50cnVlU3RyIDogY3R4Lm9wdGlvbnMuZmFsc2VTdHI7XG59XG5jb25zdCB0cnVlVGFnID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB2YWx1ZSA9PT0gdHJ1ZSxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmJvb2wnLFxuICAgIHRlc3Q6IC9eKD86WXx5fFtZeV1lc3xZRVN8W1R0XXJ1ZXxUUlVFfFtPb11ufE9OKSQvLFxuICAgIHJlc29sdmU6ICgpID0+IG5ldyBTY2FsYXIuU2NhbGFyKHRydWUpLFxuICAgIHN0cmluZ2lmeTogYm9vbFN0cmluZ2lmeVxufTtcbmNvbnN0IGZhbHNlVGFnID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB2YWx1ZSA9PT0gZmFsc2UsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpib29sJyxcbiAgICB0ZXN0OiAvXig/Ok58bnxbTm5db3xOT3xbRmZdYWxzZXxGQUxTRXxbT29dZmZ8T0ZGKSQvLFxuICAgIHJlc29sdmU6ICgpID0+IG5ldyBTY2FsYXIuU2NhbGFyKGZhbHNlKSxcbiAgICBzdHJpbmdpZnk6IGJvb2xTdHJpbmdpZnlcbn07XG5cbmV4cG9ydHMuZmFsc2VUYWcgPSBmYWxzZVRhZztcbmV4cG9ydHMudHJ1ZVRhZyA9IHRydWVUYWc7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIFNjYWxhciA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL1NjYWxhci5qcycpO1xudmFyIHN0cmluZ2lmeU51bWJlciA9IHJlcXVpcmUoJy4uLy4uL3N0cmluZ2lmeS9zdHJpbmdpZnlOdW1iZXIuanMnKTtcblxuY29uc3QgZmxvYXROYU4gPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpmbG9hdCcsXG4gICAgdGVzdDogL14oPzpbLStdP1xcLig/OmluZnxJbmZ8SU5GKXxcXC5uYW58XFwuTmFOfFxcLk5BTikkLyxcbiAgICByZXNvbHZlOiAoc3RyKSA9PiBzdHIuc2xpY2UoLTMpLnRvTG93ZXJDYXNlKCkgPT09ICduYW4nXG4gICAgICAgID8gTmFOXG4gICAgICAgIDogc3RyWzBdID09PSAnLSdcbiAgICAgICAgICAgID8gTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZXG4gICAgICAgICAgICA6IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSxcbiAgICBzdHJpbmdpZnk6IHN0cmluZ2lmeU51bWJlci5zdHJpbmdpZnlOdW1iZXJcbn07XG5jb25zdCBmbG9hdEV4cCA9IHtcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmZsb2F0JyxcbiAgICBmb3JtYXQ6ICdFWFAnLFxuICAgIHRlc3Q6IC9eWy0rXT8oPzpbMC05XVswLTlfXSopPyg/OlxcLlswLTlfXSopP1tlRV1bLStdP1swLTldKyQvLFxuICAgIHJlc29sdmU6IChzdHIpID0+IHBhcnNlRmxvYXQoc3RyLnJlcGxhY2UoL18vZywgJycpKSxcbiAgICBzdHJpbmdpZnkobm9kZSkge1xuICAgICAgICBjb25zdCBudW0gPSBOdW1iZXIobm9kZS52YWx1ZSk7XG4gICAgICAgIHJldHVybiBpc0Zpbml0ZShudW0pID8gbnVtLnRvRXhwb25lbnRpYWwoKSA6IHN0cmluZ2lmeU51bWJlci5zdHJpbmdpZnlOdW1iZXIobm9kZSk7XG4gICAgfVxufTtcbmNvbnN0IGZsb2F0ID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6ZmxvYXQnLFxuICAgIHRlc3Q6IC9eWy0rXT8oPzpbMC05XVswLTlfXSopP1xcLlswLTlfXSokLyxcbiAgICByZXNvbHZlKHN0cikge1xuICAgICAgICBjb25zdCBub2RlID0gbmV3IFNjYWxhci5TY2FsYXIocGFyc2VGbG9hdChzdHIucmVwbGFjZSgvXy9nLCAnJykpKTtcbiAgICAgICAgY29uc3QgZG90ID0gc3RyLmluZGV4T2YoJy4nKTtcbiAgICAgICAgaWYgKGRvdCAhPT0gLTEpIHtcbiAgICAgICAgICAgIGNvbnN0IGYgPSBzdHIuc3Vic3RyaW5nKGRvdCArIDEpLnJlcGxhY2UoL18vZywgJycpO1xuICAgICAgICAgICAgaWYgKGZbZi5sZW5ndGggLSAxXSA9PT0gJzAnKVxuICAgICAgICAgICAgICAgIG5vZGUubWluRnJhY3Rpb25EaWdpdHMgPSBmLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICB9LFxuICAgIHN0cmluZ2lmeTogc3RyaW5naWZ5TnVtYmVyLnN0cmluZ2lmeU51bWJlclxufTtcblxuZXhwb3J0cy5mbG9hdCA9IGZsb2F0O1xuZXhwb3J0cy5mbG9hdEV4cCA9IGZsb2F0RXhwO1xuZXhwb3J0cy5mbG9hdE5hTiA9IGZsb2F0TmFOO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBzdHJpbmdpZnlOdW1iZXIgPSByZXF1aXJlKCcuLi8uLi9zdHJpbmdpZnkvc3RyaW5naWZ5TnVtYmVyLmpzJyk7XG5cbmNvbnN0IGludElkZW50aWZ5ID0gKHZhbHVlKSA9PiB0eXBlb2YgdmFsdWUgPT09ICdiaWdpbnQnIHx8IE51bWJlci5pc0ludGVnZXIodmFsdWUpO1xuZnVuY3Rpb24gaW50UmVzb2x2ZShzdHIsIG9mZnNldCwgcmFkaXgsIHsgaW50QXNCaWdJbnQgfSkge1xuICAgIGNvbnN0IHNpZ24gPSBzdHJbMF07XG4gICAgaWYgKHNpZ24gPT09ICctJyB8fCBzaWduID09PSAnKycpXG4gICAgICAgIG9mZnNldCArPSAxO1xuICAgIHN0ciA9IHN0ci5zdWJzdHJpbmcob2Zmc2V0KS5yZXBsYWNlKC9fL2csICcnKTtcbiAgICBpZiAoaW50QXNCaWdJbnQpIHtcbiAgICAgICAgc3dpdGNoIChyYWRpeCkge1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIHN0ciA9IGAwYiR7c3RyfWA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDg6XG4gICAgICAgICAgICAgICAgc3RyID0gYDBvJHtzdHJ9YDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMTY6XG4gICAgICAgICAgICAgICAgc3RyID0gYDB4JHtzdHJ9YDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBuID0gQmlnSW50KHN0cik7XG4gICAgICAgIHJldHVybiBzaWduID09PSAnLScgPyBCaWdJbnQoLTEpICogbiA6IG47XG4gICAgfVxuICAgIGNvbnN0IG4gPSBwYXJzZUludChzdHIsIHJhZGl4KTtcbiAgICByZXR1cm4gc2lnbiA9PT0gJy0nID8gLTEgKiBuIDogbjtcbn1cbmZ1bmN0aW9uIGludFN0cmluZ2lmeShub2RlLCByYWRpeCwgcHJlZml4KSB7XG4gICAgY29uc3QgeyB2YWx1ZSB9ID0gbm9kZTtcbiAgICBpZiAoaW50SWRlbnRpZnkodmFsdWUpKSB7XG4gICAgICAgIGNvbnN0IHN0ciA9IHZhbHVlLnRvU3RyaW5nKHJhZGl4KTtcbiAgICAgICAgcmV0dXJuIHZhbHVlIDwgMCA/ICctJyArIHByZWZpeCArIHN0ci5zdWJzdHIoMSkgOiBwcmVmaXggKyBzdHI7XG4gICAgfVxuICAgIHJldHVybiBzdHJpbmdpZnlOdW1iZXIuc3RyaW5naWZ5TnVtYmVyKG5vZGUpO1xufVxuY29uc3QgaW50QmluID0ge1xuICAgIGlkZW50aWZ5OiBpbnRJZGVudGlmeSxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmludCcsXG4gICAgZm9ybWF0OiAnQklOJyxcbiAgICB0ZXN0OiAvXlstK10/MGJbMC0xX10rJC8sXG4gICAgcmVzb2x2ZTogKHN0ciwgX29uRXJyb3IsIG9wdCkgPT4gaW50UmVzb2x2ZShzdHIsIDIsIDIsIG9wdCksXG4gICAgc3RyaW5naWZ5OiBub2RlID0+IGludFN0cmluZ2lmeShub2RlLCAyLCAnMGInKVxufTtcbmNvbnN0IGludE9jdCA9IHtcbiAgICBpZGVudGlmeTogaW50SWRlbnRpZnksXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjppbnQnLFxuICAgIGZvcm1hdDogJ09DVCcsXG4gICAgdGVzdDogL15bLStdPzBbMC03X10rJC8sXG4gICAgcmVzb2x2ZTogKHN0ciwgX29uRXJyb3IsIG9wdCkgPT4gaW50UmVzb2x2ZShzdHIsIDEsIDgsIG9wdCksXG4gICAgc3RyaW5naWZ5OiBub2RlID0+IGludFN0cmluZ2lmeShub2RlLCA4LCAnMCcpXG59O1xuY29uc3QgaW50ID0ge1xuICAgIGlkZW50aWZ5OiBpbnRJZGVudGlmeSxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmludCcsXG4gICAgdGVzdDogL15bLStdP1swLTldWzAtOV9dKiQvLFxuICAgIHJlc29sdmU6IChzdHIsIF9vbkVycm9yLCBvcHQpID0+IGludFJlc29sdmUoc3RyLCAwLCAxMCwgb3B0KSxcbiAgICBzdHJpbmdpZnk6IHN0cmluZ2lmeU51bWJlci5zdHJpbmdpZnlOdW1iZXJcbn07XG5jb25zdCBpbnRIZXggPSB7XG4gICAgaWRlbnRpZnk6IGludElkZW50aWZ5LFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6aW50JyxcbiAgICBmb3JtYXQ6ICdIRVgnLFxuICAgIHRlc3Q6IC9eWy0rXT8weFswLTlhLWZBLUZfXSskLyxcbiAgICByZXNvbHZlOiAoc3RyLCBfb25FcnJvciwgb3B0KSA9PiBpbnRSZXNvbHZlKHN0ciwgMiwgMTYsIG9wdCksXG4gICAgc3RyaW5naWZ5OiBub2RlID0+IGludFN0cmluZ2lmeShub2RlLCAxNiwgJzB4Jylcbn07XG5cbmV4cG9ydHMuaW50ID0gaW50O1xuZXhwb3J0cy5pbnRCaW4gPSBpbnRCaW47XG5leHBvcnRzLmludEhleCA9IGludEhleDtcbmV4cG9ydHMuaW50T2N0ID0gaW50T2N0O1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBpZGVudGl0eSA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL2lkZW50aXR5LmpzJyk7XG52YXIgUGFpciA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL1BhaXIuanMnKTtcbnZhciBZQU1MTWFwID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvWUFNTE1hcC5qcycpO1xuXG5jbGFzcyBZQU1MU2V0IGV4dGVuZHMgWUFNTE1hcC5ZQU1MTWFwIHtcbiAgICBjb25zdHJ1Y3RvcihzY2hlbWEpIHtcbiAgICAgICAgc3VwZXIoc2NoZW1hKTtcbiAgICAgICAgdGhpcy50YWcgPSBZQU1MU2V0LnRhZztcbiAgICB9XG4gICAgYWRkKGtleSkge1xuICAgICAgICBsZXQgcGFpcjtcbiAgICAgICAgaWYgKGlkZW50aXR5LmlzUGFpcihrZXkpKVxuICAgICAgICAgICAgcGFpciA9IGtleTtcbiAgICAgICAgZWxzZSBpZiAoa2V5ICYmXG4gICAgICAgICAgICB0eXBlb2Yga2V5ID09PSAnb2JqZWN0JyAmJlxuICAgICAgICAgICAgJ2tleScgaW4ga2V5ICYmXG4gICAgICAgICAgICAndmFsdWUnIGluIGtleSAmJlxuICAgICAgICAgICAga2V5LnZhbHVlID09PSBudWxsKVxuICAgICAgICAgICAgcGFpciA9IG5ldyBQYWlyLlBhaXIoa2V5LmtleSwgbnVsbCk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHBhaXIgPSBuZXcgUGFpci5QYWlyKGtleSwgbnVsbCk7XG4gICAgICAgIGNvbnN0IHByZXYgPSBZQU1MTWFwLmZpbmRQYWlyKHRoaXMuaXRlbXMsIHBhaXIua2V5KTtcbiAgICAgICAgaWYgKCFwcmV2KVxuICAgICAgICAgICAgdGhpcy5pdGVtcy5wdXNoKHBhaXIpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBJZiBga2VlcFBhaXJgIGlzIGB0cnVlYCwgcmV0dXJucyB0aGUgUGFpciBtYXRjaGluZyBga2V5YC5cbiAgICAgKiBPdGhlcndpc2UsIHJldHVybnMgdGhlIHZhbHVlIG9mIHRoYXQgUGFpcidzIGtleS5cbiAgICAgKi9cbiAgICBnZXQoa2V5LCBrZWVwUGFpcikge1xuICAgICAgICBjb25zdCBwYWlyID0gWUFNTE1hcC5maW5kUGFpcih0aGlzLml0ZW1zLCBrZXkpO1xuICAgICAgICByZXR1cm4gIWtlZXBQYWlyICYmIGlkZW50aXR5LmlzUGFpcihwYWlyKVxuICAgICAgICAgICAgPyBpZGVudGl0eS5pc1NjYWxhcihwYWlyLmtleSlcbiAgICAgICAgICAgICAgICA/IHBhaXIua2V5LnZhbHVlXG4gICAgICAgICAgICAgICAgOiBwYWlyLmtleVxuICAgICAgICAgICAgOiBwYWlyO1xuICAgIH1cbiAgICBzZXQoa2V5LCB2YWx1ZSkge1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnYm9vbGVhbicpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIGJvb2xlYW4gdmFsdWUgZm9yIHNldChrZXksIHZhbHVlKSBpbiBhIFlBTUwgc2V0LCBub3QgJHt0eXBlb2YgdmFsdWV9YCk7XG4gICAgICAgIGNvbnN0IHByZXYgPSBZQU1MTWFwLmZpbmRQYWlyKHRoaXMuaXRlbXMsIGtleSk7XG4gICAgICAgIGlmIChwcmV2ICYmICF2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5pdGVtcy5zcGxpY2UodGhpcy5pdGVtcy5pbmRleE9mKHByZXYpLCAxKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICghcHJldiAmJiB2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5pdGVtcy5wdXNoKG5ldyBQYWlyLlBhaXIoa2V5KSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdG9KU09OKF8sIGN0eCkge1xuICAgICAgICByZXR1cm4gc3VwZXIudG9KU09OKF8sIGN0eCwgU2V0KTtcbiAgICB9XG4gICAgdG9TdHJpbmcoY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKSB7XG4gICAgICAgIGlmICghY3R4KVxuICAgICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHRoaXMpO1xuICAgICAgICBpZiAodGhpcy5oYXNBbGxOdWxsVmFsdWVzKHRydWUpKVxuICAgICAgICAgICAgcmV0dXJuIHN1cGVyLnRvU3RyaW5nKE9iamVjdC5hc3NpZ24oe30sIGN0eCwgeyBhbGxOdWxsVmFsdWVzOiB0cnVlIH0pLCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTZXQgaXRlbXMgbXVzdCBhbGwgaGF2ZSBudWxsIHZhbHVlcycpO1xuICAgIH1cbiAgICBzdGF0aWMgZnJvbShzY2hlbWEsIGl0ZXJhYmxlLCBjdHgpIHtcbiAgICAgICAgY29uc3QgeyByZXBsYWNlciB9ID0gY3R4O1xuICAgICAgICBjb25zdCBzZXQgPSBuZXcgdGhpcyhzY2hlbWEpO1xuICAgICAgICBpZiAoaXRlcmFibGUgJiYgU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdChpdGVyYWJsZSkpXG4gICAgICAgICAgICBmb3IgKGxldCB2YWx1ZSBvZiBpdGVyYWJsZSkge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcmVwbGFjZXIgPT09ICdmdW5jdGlvbicpXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gcmVwbGFjZXIuY2FsbChpdGVyYWJsZSwgdmFsdWUsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICBzZXQuaXRlbXMucHVzaChQYWlyLmNyZWF0ZVBhaXIodmFsdWUsIG51bGwsIGN0eCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2V0O1xuICAgIH1cbn1cbllBTUxTZXQudGFnID0gJ3RhZzp5YW1sLm9yZywyMDAyOnNldCc7XG5jb25zdCBzZXQgPSB7XG4gICAgY29sbGVjdGlvbjogJ21hcCcsXG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHZhbHVlIGluc3RhbmNlb2YgU2V0LFxuICAgIG5vZGVDbGFzczogWUFNTFNldCxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpzZXQnLFxuICAgIGNyZWF0ZU5vZGU6IChzY2hlbWEsIGl0ZXJhYmxlLCBjdHgpID0+IFlBTUxTZXQuZnJvbShzY2hlbWEsIGl0ZXJhYmxlLCBjdHgpLFxuICAgIHJlc29sdmUobWFwLCBvbkVycm9yKSB7XG4gICAgICAgIGlmIChpZGVudGl0eS5pc01hcChtYXApKSB7XG4gICAgICAgICAgICBpZiAobWFwLmhhc0FsbE51bGxWYWx1ZXModHJ1ZSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24obmV3IFlBTUxTZXQoKSwgbWFwKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBvbkVycm9yKCdTZXQgaXRlbXMgbXVzdCBhbGwgaGF2ZSBudWxsIHZhbHVlcycpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG9uRXJyb3IoJ0V4cGVjdGVkIGEgbWFwcGluZyBmb3IgdGhpcyB0YWcnKTtcbiAgICAgICAgcmV0dXJuIG1hcDtcbiAgICB9XG59O1xuXG5leHBvcnRzLllBTUxTZXQgPSBZQU1MU2V0O1xuZXhwb3J0cy5zZXQgPSBzZXQ7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIHN0cmluZ2lmeU51bWJlciA9IHJlcXVpcmUoJy4uLy4uL3N0cmluZ2lmeS9zdHJpbmdpZnlOdW1iZXIuanMnKTtcblxuLyoqIEludGVybmFsIHR5cGVzIGhhbmRsZSBiaWdpbnQgYXMgbnVtYmVyLCBiZWNhdXNlIFRTIGNhbid0IGZpZ3VyZSBpdCBvdXQuICovXG5mdW5jdGlvbiBwYXJzZVNleGFnZXNpbWFsKHN0ciwgYXNCaWdJbnQpIHtcbiAgICBjb25zdCBzaWduID0gc3RyWzBdO1xuICAgIGNvbnN0IHBhcnRzID0gc2lnbiA9PT0gJy0nIHx8IHNpZ24gPT09ICcrJyA/IHN0ci5zdWJzdHJpbmcoMSkgOiBzdHI7XG4gICAgY29uc3QgbnVtID0gKG4pID0+IGFzQmlnSW50ID8gQmlnSW50KG4pIDogTnVtYmVyKG4pO1xuICAgIGNvbnN0IHJlcyA9IHBhcnRzXG4gICAgICAgIC5yZXBsYWNlKC9fL2csICcnKVxuICAgICAgICAuc3BsaXQoJzonKVxuICAgICAgICAucmVkdWNlKChyZXMsIHApID0+IHJlcyAqIG51bSg2MCkgKyBudW0ocCksIG51bSgwKSk7XG4gICAgcmV0dXJuIChzaWduID09PSAnLScgPyBudW0oLTEpICogcmVzIDogcmVzKTtcbn1cbi8qKlxuICogaGhoaDptbTpzcy5zc3NcbiAqXG4gKiBJbnRlcm5hbCB0eXBlcyBoYW5kbGUgYmlnaW50IGFzIG51bWJlciwgYmVjYXVzZSBUUyBjYW4ndCBmaWd1cmUgaXQgb3V0LlxuICovXG5mdW5jdGlvbiBzdHJpbmdpZnlTZXhhZ2VzaW1hbChub2RlKSB7XG4gICAgbGV0IHsgdmFsdWUgfSA9IG5vZGU7XG4gICAgbGV0IG51bSA9IChuKSA9PiBuO1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdiaWdpbnQnKVxuICAgICAgICBudW0gPSBuID0+IEJpZ0ludChuKTtcbiAgICBlbHNlIGlmIChpc05hTih2YWx1ZSkgfHwgIWlzRmluaXRlKHZhbHVlKSlcbiAgICAgICAgcmV0dXJuIHN0cmluZ2lmeU51bWJlci5zdHJpbmdpZnlOdW1iZXIobm9kZSk7XG4gICAgbGV0IHNpZ24gPSAnJztcbiAgICBpZiAodmFsdWUgPCAwKSB7XG4gICAgICAgIHNpZ24gPSAnLSc7XG4gICAgICAgIHZhbHVlICo9IG51bSgtMSk7XG4gICAgfVxuICAgIGNvbnN0IF82MCA9IG51bSg2MCk7XG4gICAgY29uc3QgcGFydHMgPSBbdmFsdWUgJSBfNjBdOyAvLyBzZWNvbmRzLCBpbmNsdWRpbmcgbXNcbiAgICBpZiAodmFsdWUgPCA2MCkge1xuICAgICAgICBwYXJ0cy51bnNoaWZ0KDApOyAvLyBhdCBsZWFzdCBvbmUgOiBpcyByZXF1aXJlZFxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdmFsdWUgPSAodmFsdWUgLSBwYXJ0c1swXSkgLyBfNjA7XG4gICAgICAgIHBhcnRzLnVuc2hpZnQodmFsdWUgJSBfNjApOyAvLyBtaW51dGVzXG4gICAgICAgIGlmICh2YWx1ZSA+PSA2MCkge1xuICAgICAgICAgICAgdmFsdWUgPSAodmFsdWUgLSBwYXJ0c1swXSkgLyBfNjA7XG4gICAgICAgICAgICBwYXJ0cy51bnNoaWZ0KHZhbHVlKTsgLy8gaG91cnNcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gKHNpZ24gK1xuICAgICAgICBwYXJ0c1xuICAgICAgICAgICAgLm1hcChuID0+IFN0cmluZyhuKS5wYWRTdGFydCgyLCAnMCcpKVxuICAgICAgICAgICAgLmpvaW4oJzonKVxuICAgICAgICAgICAgLnJlcGxhY2UoLzAwMDAwMFxcZCokLywgJycpIC8vICUgNjAgbWF5IGludHJvZHVjZSBlcnJvclxuICAgICk7XG59XG5jb25zdCBpbnRUaW1lID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdiaWdpbnQnIHx8IE51bWJlci5pc0ludGVnZXIodmFsdWUpLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6aW50JyxcbiAgICBmb3JtYXQ6ICdUSU1FJyxcbiAgICB0ZXN0OiAvXlstK10/WzAtOV1bMC05X10qKD86OlswLTVdP1swLTldKSskLyxcbiAgICByZXNvbHZlOiAoc3RyLCBfb25FcnJvciwgeyBpbnRBc0JpZ0ludCB9KSA9PiBwYXJzZVNleGFnZXNpbWFsKHN0ciwgaW50QXNCaWdJbnQpLFxuICAgIHN0cmluZ2lmeTogc3RyaW5naWZ5U2V4YWdlc2ltYWxcbn07XG5jb25zdCBmbG9hdFRpbWUgPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpmbG9hdCcsXG4gICAgZm9ybWF0OiAnVElNRScsXG4gICAgdGVzdDogL15bLStdP1swLTldWzAtOV9dKig/OjpbMC01XT9bMC05XSkrXFwuWzAtOV9dKiQvLFxuICAgIHJlc29sdmU6IHN0ciA9PiBwYXJzZVNleGFnZXNpbWFsKHN0ciwgZmFsc2UpLFxuICAgIHN0cmluZ2lmeTogc3RyaW5naWZ5U2V4YWdlc2ltYWxcbn07XG5jb25zdCB0aW1lc3RhbXAgPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHZhbHVlIGluc3RhbmNlb2YgRGF0ZSxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOnRpbWVzdGFtcCcsXG4gICAgLy8gSWYgdGhlIHRpbWUgem9uZSBpcyBvbWl0dGVkLCB0aGUgdGltZXN0YW1wIGlzIGFzc3VtZWQgdG8gYmUgc3BlY2lmaWVkIGluIFVUQy4gVGhlIHRpbWUgcGFydFxuICAgIC8vIG1heSBiZSBvbWl0dGVkIGFsdG9nZXRoZXIsIHJlc3VsdGluZyBpbiBhIGRhdGUgZm9ybWF0LiBJbiBzdWNoIGEgY2FzZSwgdGhlIHRpbWUgcGFydCBpc1xuICAgIC8vIGFzc3VtZWQgdG8gYmUgMDA6MDA6MDBaIChzdGFydCBvZiBkYXksIFVUQykuXG4gICAgdGVzdDogUmVnRXhwKCdeKFswLTldezR9KS0oWzAtOV17MSwyfSktKFswLTldezEsMn0pJyArIC8vIFlZWVktTW0tRGRcbiAgICAgICAgJyg/OicgKyAvLyB0aW1lIGlzIG9wdGlvbmFsXG4gICAgICAgICcoPzp0fFR8WyBcXFxcdF0rKScgKyAvLyB0IHwgVCB8IHdoaXRlc3BhY2VcbiAgICAgICAgJyhbMC05XXsxLDJ9KTooWzAtOV17MSwyfSk6KFswLTldezEsMn0oXFxcXC5bMC05XSspPyknICsgLy8gSGg6TW06U3MoLnNzKT9cbiAgICAgICAgJyg/OlsgXFxcXHRdKihafFstK11bMDEyXT9bMC05XSg/OjpbMC05XXsyfSk/KSk/JyArIC8vIFogfCArNSB8IC0wMzozMFxuICAgICAgICAnKT8kJyksXG4gICAgcmVzb2x2ZShzdHIpIHtcbiAgICAgICAgY29uc3QgbWF0Y2ggPSBzdHIubWF0Y2godGltZXN0YW1wLnRlc3QpO1xuICAgICAgICBpZiAoIW1hdGNoKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCchIXRpbWVzdGFtcCBleHBlY3RzIGEgZGF0ZSwgc3RhcnRpbmcgd2l0aCB5eXl5LW1tLWRkJyk7XG4gICAgICAgIGNvbnN0IFssIHllYXIsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kXSA9IG1hdGNoLm1hcChOdW1iZXIpO1xuICAgICAgICBjb25zdCBtaWxsaXNlYyA9IG1hdGNoWzddID8gTnVtYmVyKChtYXRjaFs3XSArICcwMCcpLnN1YnN0cigxLCAzKSkgOiAwO1xuICAgICAgICBsZXQgZGF0ZSA9IERhdGUuVVRDKHllYXIsIG1vbnRoIC0gMSwgZGF5LCBob3VyIHx8IDAsIG1pbnV0ZSB8fCAwLCBzZWNvbmQgfHwgMCwgbWlsbGlzZWMpO1xuICAgICAgICBjb25zdCB0eiA9IG1hdGNoWzhdO1xuICAgICAgICBpZiAodHogJiYgdHogIT09ICdaJykge1xuICAgICAgICAgICAgbGV0IGQgPSBwYXJzZVNleGFnZXNpbWFsKHR6LCBmYWxzZSk7XG4gICAgICAgICAgICBpZiAoTWF0aC5hYnMoZCkgPCAzMClcbiAgICAgICAgICAgICAgICBkICo9IDYwO1xuICAgICAgICAgICAgZGF0ZSAtPSA2MDAwMCAqIGQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKGRhdGUpO1xuICAgIH0sXG4gICAgc3RyaW5naWZ5OiAoeyB2YWx1ZSB9KSA9PiB2YWx1ZT8udG9JU09TdHJpbmcoKS5yZXBsYWNlKC8oVDAwOjAwOjAwKT9cXC4wMDBaJC8sICcnKSA/PyAnJ1xufTtcblxuZXhwb3J0cy5mbG9hdFRpbWUgPSBmbG9hdFRpbWU7XG5leHBvcnRzLmludFRpbWUgPSBpbnRUaW1lO1xuZXhwb3J0cy50aW1lc3RhbXAgPSB0aW1lc3RhbXA7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIG1hcCA9IHJlcXVpcmUoJy4uL2NvbW1vbi9tYXAuanMnKTtcbnZhciBfbnVsbCA9IHJlcXVpcmUoJy4uL2NvbW1vbi9udWxsLmpzJyk7XG52YXIgc2VxID0gcmVxdWlyZSgnLi4vY29tbW9uL3NlcS5qcycpO1xudmFyIHN0cmluZyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9zdHJpbmcuanMnKTtcbnZhciBiaW5hcnkgPSByZXF1aXJlKCcuL2JpbmFyeS5qcycpO1xudmFyIGJvb2wgPSByZXF1aXJlKCcuL2Jvb2wuanMnKTtcbnZhciBmbG9hdCA9IHJlcXVpcmUoJy4vZmxvYXQuanMnKTtcbnZhciBpbnQgPSByZXF1aXJlKCcuL2ludC5qcycpO1xudmFyIG1lcmdlID0gcmVxdWlyZSgnLi9tZXJnZS5qcycpO1xudmFyIG9tYXAgPSByZXF1aXJlKCcuL29tYXAuanMnKTtcbnZhciBwYWlycyA9IHJlcXVpcmUoJy4vcGFpcnMuanMnKTtcbnZhciBzZXQgPSByZXF1aXJlKCcuL3NldC5qcycpO1xudmFyIHRpbWVzdGFtcCA9IHJlcXVpcmUoJy4vdGltZXN0YW1wLmpzJyk7XG5cbmNvbnN0IHNjaGVtYSA9IFtcbiAgICBtYXAubWFwLFxuICAgIHNlcS5zZXEsXG4gICAgc3RyaW5nLnN0cmluZyxcbiAgICBfbnVsbC5udWxsVGFnLFxuICAgIGJvb2wudHJ1ZVRhZyxcbiAgICBib29sLmZhbHNlVGFnLFxuICAgIGludC5pbnRCaW4sXG4gICAgaW50LmludE9jdCxcbiAgICBpbnQuaW50LFxuICAgIGludC5pbnRIZXgsXG4gICAgZmxvYXQuZmxvYXROYU4sXG4gICAgZmxvYXQuZmxvYXRFeHAsXG4gICAgZmxvYXQuZmxvYXQsXG4gICAgYmluYXJ5LmJpbmFyeSxcbiAgICBtZXJnZS5tZXJnZSxcbiAgICBvbWFwLm9tYXAsXG4gICAgcGFpcnMucGFpcnMsXG4gICAgc2V0LnNldCxcbiAgICB0aW1lc3RhbXAuaW50VGltZSxcbiAgICB0aW1lc3RhbXAuZmxvYXRUaW1lLFxuICAgIHRpbWVzdGFtcC50aW1lc3RhbXBcbl07XG5cbmV4cG9ydHMuc2NoZW1hID0gc2NoZW1hO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBtYXAgPSByZXF1aXJlKCcuL2NvbW1vbi9tYXAuanMnKTtcbnZhciBfbnVsbCA9IHJlcXVpcmUoJy4vY29tbW9uL251bGwuanMnKTtcbnZhciBzZXEgPSByZXF1aXJlKCcuL2NvbW1vbi9zZXEuanMnKTtcbnZhciBzdHJpbmcgPSByZXF1aXJlKCcuL2NvbW1vbi9zdHJpbmcuanMnKTtcbnZhciBib29sID0gcmVxdWlyZSgnLi9jb3JlL2Jvb2wuanMnKTtcbnZhciBmbG9hdCA9IHJlcXVpcmUoJy4vY29yZS9mbG9hdC5qcycpO1xudmFyIGludCA9IHJlcXVpcmUoJy4vY29yZS9pbnQuanMnKTtcbnZhciBzY2hlbWEgPSByZXF1aXJlKCcuL2NvcmUvc2NoZW1hLmpzJyk7XG52YXIgc2NoZW1hJDEgPSByZXF1aXJlKCcuL2pzb24vc2NoZW1hLmpzJyk7XG52YXIgYmluYXJ5ID0gcmVxdWlyZSgnLi95YW1sLTEuMS9iaW5hcnkuanMnKTtcbnZhciBtZXJnZSA9IHJlcXVpcmUoJy4veWFtbC0xLjEvbWVyZ2UuanMnKTtcbnZhciBvbWFwID0gcmVxdWlyZSgnLi95YW1sLTEuMS9vbWFwLmpzJyk7XG52YXIgcGFpcnMgPSByZXF1aXJlKCcuL3lhbWwtMS4xL3BhaXJzLmpzJyk7XG52YXIgc2NoZW1hJDIgPSByZXF1aXJlKCcuL3lhbWwtMS4xL3NjaGVtYS5qcycpO1xudmFyIHNldCA9IHJlcXVpcmUoJy4veWFtbC0xLjEvc2V0LmpzJyk7XG52YXIgdGltZXN0YW1wID0gcmVxdWlyZSgnLi95YW1sLTEuMS90aW1lc3RhbXAuanMnKTtcblxuY29uc3Qgc2NoZW1hcyA9IG5ldyBNYXAoW1xuICAgIFsnY29yZScsIHNjaGVtYS5zY2hlbWFdLFxuICAgIFsnZmFpbHNhZmUnLCBbbWFwLm1hcCwgc2VxLnNlcSwgc3RyaW5nLnN0cmluZ11dLFxuICAgIFsnanNvbicsIHNjaGVtYSQxLnNjaGVtYV0sXG4gICAgWyd5YW1sMTEnLCBzY2hlbWEkMi5zY2hlbWFdLFxuICAgIFsneWFtbC0xLjEnLCBzY2hlbWEkMi5zY2hlbWFdXG5dKTtcbmNvbnN0IHRhZ3NCeU5hbWUgPSB7XG4gICAgYmluYXJ5OiBiaW5hcnkuYmluYXJ5LFxuICAgIGJvb2w6IGJvb2wuYm9vbFRhZyxcbiAgICBmbG9hdDogZmxvYXQuZmxvYXQsXG4gICAgZmxvYXRFeHA6IGZsb2F0LmZsb2F0RXhwLFxuICAgIGZsb2F0TmFOOiBmbG9hdC5mbG9hdE5hTixcbiAgICBmbG9hdFRpbWU6IHRpbWVzdGFtcC5mbG9hdFRpbWUsXG4gICAgaW50OiBpbnQuaW50LFxuICAgIGludEhleDogaW50LmludEhleCxcbiAgICBpbnRPY3Q6IGludC5pbnRPY3QsXG4gICAgaW50VGltZTogdGltZXN0YW1wLmludFRpbWUsXG4gICAgbWFwOiBtYXAubWFwLFxuICAgIG1lcmdlOiBtZXJnZS5tZXJnZSxcbiAgICBudWxsOiBfbnVsbC5udWxsVGFnLFxuICAgIG9tYXA6IG9tYXAub21hcCxcbiAgICBwYWlyczogcGFpcnMucGFpcnMsXG4gICAgc2VxOiBzZXEuc2VxLFxuICAgIHNldDogc2V0LnNldCxcbiAgICB0aW1lc3RhbXA6IHRpbWVzdGFtcC50aW1lc3RhbXBcbn07XG5jb25zdCBjb3JlS25vd25UYWdzID0ge1xuICAgICd0YWc6eWFtbC5vcmcsMjAwMjpiaW5hcnknOiBiaW5hcnkuYmluYXJ5LFxuICAgICd0YWc6eWFtbC5vcmcsMjAwMjptZXJnZSc6IG1lcmdlLm1lcmdlLFxuICAgICd0YWc6eWFtbC5vcmcsMjAwMjpvbWFwJzogb21hcC5vbWFwLFxuICAgICd0YWc6eWFtbC5vcmcsMjAwMjpwYWlycyc6IHBhaXJzLnBhaXJzLFxuICAgICd0YWc6eWFtbC5vcmcsMjAwMjpzZXQnOiBzZXQuc2V0LFxuICAgICd0YWc6eWFtbC5vcmcsMjAwMjp0aW1lc3RhbXAnOiB0aW1lc3RhbXAudGltZXN0YW1wXG59O1xuZnVuY3Rpb24gZ2V0VGFncyhjdXN0b21UYWdzLCBzY2hlbWFOYW1lLCBhZGRNZXJnZVRhZykge1xuICAgIGNvbnN0IHNjaGVtYVRhZ3MgPSBzY2hlbWFzLmdldChzY2hlbWFOYW1lKTtcbiAgICBpZiAoc2NoZW1hVGFncyAmJiAhY3VzdG9tVGFncykge1xuICAgICAgICByZXR1cm4gYWRkTWVyZ2VUYWcgJiYgIXNjaGVtYVRhZ3MuaW5jbHVkZXMobWVyZ2UubWVyZ2UpXG4gICAgICAgICAgICA/IHNjaGVtYVRhZ3MuY29uY2F0KG1lcmdlLm1lcmdlKVxuICAgICAgICAgICAgOiBzY2hlbWFUYWdzLnNsaWNlKCk7XG4gICAgfVxuICAgIGxldCB0YWdzID0gc2NoZW1hVGFncztcbiAgICBpZiAoIXRhZ3MpIHtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoY3VzdG9tVGFncykpXG4gICAgICAgICAgICB0YWdzID0gW107XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3Qga2V5cyA9IEFycmF5LmZyb20oc2NoZW1hcy5rZXlzKCkpXG4gICAgICAgICAgICAgICAgLmZpbHRlcihrZXkgPT4ga2V5ICE9PSAneWFtbDExJylcbiAgICAgICAgICAgICAgICAubWFwKGtleSA9PiBKU09OLnN0cmluZ2lmeShrZXkpKVxuICAgICAgICAgICAgICAgIC5qb2luKCcsICcpO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHNjaGVtYSBcIiR7c2NoZW1hTmFtZX1cIjsgdXNlIG9uZSBvZiAke2tleXN9IG9yIGRlZmluZSBjdXN0b21UYWdzIGFycmF5YCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoY3VzdG9tVGFncykpIHtcbiAgICAgICAgZm9yIChjb25zdCB0YWcgb2YgY3VzdG9tVGFncylcbiAgICAgICAgICAgIHRhZ3MgPSB0YWdzLmNvbmNhdCh0YWcpO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgY3VzdG9tVGFncyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0YWdzID0gY3VzdG9tVGFncyh0YWdzLnNsaWNlKCkpO1xuICAgIH1cbiAgICBpZiAoYWRkTWVyZ2VUYWcpXG4gICAgICAgIHRhZ3MgPSB0YWdzLmNvbmNhdChtZXJnZS5tZXJnZSk7XG4gICAgcmV0dXJuIHRhZ3MucmVkdWNlKCh0YWdzLCB0YWcpID0+IHtcbiAgICAgICAgY29uc3QgdGFnT2JqID0gdHlwZW9mIHRhZyA9PT0gJ3N0cmluZycgPyB0YWdzQnlOYW1lW3RhZ10gOiB0YWc7XG4gICAgICAgIGlmICghdGFnT2JqKSB7XG4gICAgICAgICAgICBjb25zdCB0YWdOYW1lID0gSlNPTi5zdHJpbmdpZnkodGFnKTtcbiAgICAgICAgICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyh0YWdzQnlOYW1lKVxuICAgICAgICAgICAgICAgIC5tYXAoa2V5ID0+IEpTT04uc3RyaW5naWZ5KGtleSkpXG4gICAgICAgICAgICAgICAgLmpvaW4oJywgJyk7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gY3VzdG9tIHRhZyAke3RhZ05hbWV9OyB1c2Ugb25lIG9mICR7a2V5c31gKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRhZ3MuaW5jbHVkZXModGFnT2JqKSlcbiAgICAgICAgICAgIHRhZ3MucHVzaCh0YWdPYmopO1xuICAgICAgICByZXR1cm4gdGFncztcbiAgICB9LCBbXSk7XG59XG5cbmV4cG9ydHMuY29yZUtub3duVGFncyA9IGNvcmVLbm93blRhZ3M7XG5leHBvcnRzLmdldFRhZ3MgPSBnZXRUYWdzO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBpZGVudGl0eSA9IHJlcXVpcmUoJy4uL25vZGVzL2lkZW50aXR5LmpzJyk7XG52YXIgbWFwID0gcmVxdWlyZSgnLi9jb21tb24vbWFwLmpzJyk7XG52YXIgc2VxID0gcmVxdWlyZSgnLi9jb21tb24vc2VxLmpzJyk7XG52YXIgc3RyaW5nID0gcmVxdWlyZSgnLi9jb21tb24vc3RyaW5nLmpzJyk7XG52YXIgdGFncyA9IHJlcXVpcmUoJy4vdGFncy5qcycpO1xuXG5jb25zdCBzb3J0TWFwRW50cmllc0J5S2V5ID0gKGEsIGIpID0+IGEua2V5IDwgYi5rZXkgPyAtMSA6IGEua2V5ID4gYi5rZXkgPyAxIDogMDtcbmNsYXNzIFNjaGVtYSB7XG4gICAgY29uc3RydWN0b3IoeyBjb21wYXQsIGN1c3RvbVRhZ3MsIG1lcmdlLCByZXNvbHZlS25vd25UYWdzLCBzY2hlbWEsIHNvcnRNYXBFbnRyaWVzLCB0b1N0cmluZ0RlZmF1bHRzIH0pIHtcbiAgICAgICAgdGhpcy5jb21wYXQgPSBBcnJheS5pc0FycmF5KGNvbXBhdClcbiAgICAgICAgICAgID8gdGFncy5nZXRUYWdzKGNvbXBhdCwgJ2NvbXBhdCcpXG4gICAgICAgICAgICA6IGNvbXBhdFxuICAgICAgICAgICAgICAgID8gdGFncy5nZXRUYWdzKG51bGwsIGNvbXBhdClcbiAgICAgICAgICAgICAgICA6IG51bGw7XG4gICAgICAgIHRoaXMubmFtZSA9ICh0eXBlb2Ygc2NoZW1hID09PSAnc3RyaW5nJyAmJiBzY2hlbWEpIHx8ICdjb3JlJztcbiAgICAgICAgdGhpcy5rbm93blRhZ3MgPSByZXNvbHZlS25vd25UYWdzID8gdGFncy5jb3JlS25vd25UYWdzIDoge307XG4gICAgICAgIHRoaXMudGFncyA9IHRhZ3MuZ2V0VGFncyhjdXN0b21UYWdzLCB0aGlzLm5hbWUsIG1lcmdlKTtcbiAgICAgICAgdGhpcy50b1N0cmluZ09wdGlvbnMgPSB0b1N0cmluZ0RlZmF1bHRzID8/IG51bGw7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBpZGVudGl0eS5NQVAsIHsgdmFsdWU6IG1hcC5tYXAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBpZGVudGl0eS5TQ0FMQVIsIHsgdmFsdWU6IHN0cmluZy5zdHJpbmcgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBpZGVudGl0eS5TRVEsIHsgdmFsdWU6IHNlcS5zZXEgfSk7XG4gICAgICAgIC8vIFVzZWQgYnkgY3JlYXRlTWFwKClcbiAgICAgICAgdGhpcy5zb3J0TWFwRW50cmllcyA9XG4gICAgICAgICAgICB0eXBlb2Ygc29ydE1hcEVudHJpZXMgPT09ICdmdW5jdGlvbidcbiAgICAgICAgICAgICAgICA/IHNvcnRNYXBFbnRyaWVzXG4gICAgICAgICAgICAgICAgOiBzb3J0TWFwRW50cmllcyA9PT0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICA/IHNvcnRNYXBFbnRyaWVzQnlLZXlcbiAgICAgICAgICAgICAgICAgICAgOiBudWxsO1xuICAgIH1cbiAgICBjbG9uZSgpIHtcbiAgICAgICAgY29uc3QgY29weSA9IE9iamVjdC5jcmVhdGUoU2NoZW1hLnByb3RvdHlwZSwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnModGhpcykpO1xuICAgICAgICBjb3B5LnRhZ3MgPSB0aGlzLnRhZ3Muc2xpY2UoKTtcbiAgICAgICAgcmV0dXJuIGNvcHk7XG4gICAgfVxufVxuXG5leHBvcnRzLlNjaGVtYSA9IFNjaGVtYTtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuLi9ub2Rlcy9pZGVudGl0eS5qcycpO1xudmFyIHN0cmluZ2lmeSA9IHJlcXVpcmUoJy4vc3RyaW5naWZ5LmpzJyk7XG52YXIgc3RyaW5naWZ5Q29tbWVudCA9IHJlcXVpcmUoJy4vc3RyaW5naWZ5Q29tbWVudC5qcycpO1xuXG5mdW5jdGlvbiBzdHJpbmdpZnlEb2N1bWVudChkb2MsIG9wdGlvbnMpIHtcbiAgICBjb25zdCBsaW5lcyA9IFtdO1xuICAgIGxldCBoYXNEaXJlY3RpdmVzID0gb3B0aW9ucy5kaXJlY3RpdmVzID09PSB0cnVlO1xuICAgIGlmIChvcHRpb25zLmRpcmVjdGl2ZXMgIT09IGZhbHNlICYmIGRvYy5kaXJlY3RpdmVzKSB7XG4gICAgICAgIGNvbnN0IGRpciA9IGRvYy5kaXJlY3RpdmVzLnRvU3RyaW5nKGRvYyk7XG4gICAgICAgIGlmIChkaXIpIHtcbiAgICAgICAgICAgIGxpbmVzLnB1c2goZGlyKTtcbiAgICAgICAgICAgIGhhc0RpcmVjdGl2ZXMgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGRvYy5kaXJlY3RpdmVzLmRvY1N0YXJ0KVxuICAgICAgICAgICAgaGFzRGlyZWN0aXZlcyA9IHRydWU7XG4gICAgfVxuICAgIGlmIChoYXNEaXJlY3RpdmVzKVxuICAgICAgICBsaW5lcy5wdXNoKCctLS0nKTtcbiAgICBjb25zdCBjdHggPSBzdHJpbmdpZnkuY3JlYXRlU3RyaW5naWZ5Q29udGV4dChkb2MsIG9wdGlvbnMpO1xuICAgIGNvbnN0IHsgY29tbWVudFN0cmluZyB9ID0gY3R4Lm9wdGlvbnM7XG4gICAgaWYgKGRvYy5jb21tZW50QmVmb3JlKSB7XG4gICAgICAgIGlmIChsaW5lcy5sZW5ndGggIT09IDEpXG4gICAgICAgICAgICBsaW5lcy51bnNoaWZ0KCcnKTtcbiAgICAgICAgY29uc3QgY3MgPSBjb21tZW50U3RyaW5nKGRvYy5jb21tZW50QmVmb3JlKTtcbiAgICAgICAgbGluZXMudW5zaGlmdChzdHJpbmdpZnlDb21tZW50LmluZGVudENvbW1lbnQoY3MsICcnKSk7XG4gICAgfVxuICAgIGxldCBjaG9tcEtlZXAgPSBmYWxzZTtcbiAgICBsZXQgY29udGVudENvbW1lbnQgPSBudWxsO1xuICAgIGlmIChkb2MuY29udGVudHMpIHtcbiAgICAgICAgaWYgKGlkZW50aXR5LmlzTm9kZShkb2MuY29udGVudHMpKSB7XG4gICAgICAgICAgICBpZiAoZG9jLmNvbnRlbnRzLnNwYWNlQmVmb3JlICYmIGhhc0RpcmVjdGl2ZXMpXG4gICAgICAgICAgICAgICAgbGluZXMucHVzaCgnJyk7XG4gICAgICAgICAgICBpZiAoZG9jLmNvbnRlbnRzLmNvbW1lbnRCZWZvcmUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjcyA9IGNvbW1lbnRTdHJpbmcoZG9jLmNvbnRlbnRzLmNvbW1lbnRCZWZvcmUpO1xuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goc3RyaW5naWZ5Q29tbWVudC5pbmRlbnRDb21tZW50KGNzLCAnJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gdG9wLWxldmVsIGJsb2NrIHNjYWxhcnMgbmVlZCB0byBiZSBpbmRlbnRlZCBpZiBmb2xsb3dlZCBieSBhIGNvbW1lbnRcbiAgICAgICAgICAgIGN0eC5mb3JjZUJsb2NrSW5kZW50ID0gISFkb2MuY29tbWVudDtcbiAgICAgICAgICAgIGNvbnRlbnRDb21tZW50ID0gZG9jLmNvbnRlbnRzLmNvbW1lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgb25DaG9tcEtlZXAgPSBjb250ZW50Q29tbWVudCA/IHVuZGVmaW5lZCA6ICgpID0+IChjaG9tcEtlZXAgPSB0cnVlKTtcbiAgICAgICAgbGV0IGJvZHkgPSBzdHJpbmdpZnkuc3RyaW5naWZ5KGRvYy5jb250ZW50cywgY3R4LCAoKSA9PiAoY29udGVudENvbW1lbnQgPSBudWxsKSwgb25DaG9tcEtlZXApO1xuICAgICAgICBpZiAoY29udGVudENvbW1lbnQpXG4gICAgICAgICAgICBib2R5ICs9IHN0cmluZ2lmeUNvbW1lbnQubGluZUNvbW1lbnQoYm9keSwgJycsIGNvbW1lbnRTdHJpbmcoY29udGVudENvbW1lbnQpKTtcbiAgICAgICAgaWYgKChib2R5WzBdID09PSAnfCcgfHwgYm9keVswXSA9PT0gJz4nKSAmJlxuICAgICAgICAgICAgbGluZXNbbGluZXMubGVuZ3RoIC0gMV0gPT09ICctLS0nKSB7XG4gICAgICAgICAgICAvLyBUb3AtbGV2ZWwgYmxvY2sgc2NhbGFycyB3aXRoIGEgcHJlY2VkaW5nIGRvYyBtYXJrZXIgb3VnaHQgdG8gdXNlIHRoZVxuICAgICAgICAgICAgLy8gc2FtZSBsaW5lIGZvciB0aGVpciBoZWFkZXIuXG4gICAgICAgICAgICBsaW5lc1tsaW5lcy5sZW5ndGggLSAxXSA9IGAtLS0gJHtib2R5fWA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbGluZXMucHVzaChib2R5KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGxpbmVzLnB1c2goc3RyaW5naWZ5LnN0cmluZ2lmeShkb2MuY29udGVudHMsIGN0eCkpO1xuICAgIH1cbiAgICBpZiAoZG9jLmRpcmVjdGl2ZXM/LmRvY0VuZCkge1xuICAgICAgICBpZiAoZG9jLmNvbW1lbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IGNzID0gY29tbWVudFN0cmluZyhkb2MuY29tbWVudCk7XG4gICAgICAgICAgICBpZiAoY3MuaW5jbHVkZXMoJ1xcbicpKSB7XG4gICAgICAgICAgICAgICAgbGluZXMucHVzaCgnLi4uJyk7XG4gICAgICAgICAgICAgICAgbGluZXMucHVzaChzdHJpbmdpZnlDb21tZW50LmluZGVudENvbW1lbnQoY3MsICcnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKGAuLi4gJHtjc31gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGxpbmVzLnB1c2goJy4uLicpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBsZXQgZGMgPSBkb2MuY29tbWVudDtcbiAgICAgICAgaWYgKGRjICYmIGNob21wS2VlcClcbiAgICAgICAgICAgIGRjID0gZGMucmVwbGFjZSgvXlxcbisvLCAnJyk7XG4gICAgICAgIGlmIChkYykge1xuICAgICAgICAgICAgaWYgKCghY2hvbXBLZWVwIHx8IGNvbnRlbnRDb21tZW50KSAmJiBsaW5lc1tsaW5lcy5sZW5ndGggLSAxXSAhPT0gJycpXG4gICAgICAgICAgICAgICAgbGluZXMucHVzaCgnJyk7XG4gICAgICAgICAgICBsaW5lcy5wdXNoKHN0cmluZ2lmeUNvbW1lbnQuaW5kZW50Q29tbWVudChjb21tZW50U3RyaW5nKGRjKSwgJycpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbGluZXMuam9pbignXFxuJykgKyAnXFxuJztcbn1cblxuZXhwb3J0cy5zdHJpbmdpZnlEb2N1bWVudCA9IHN0cmluZ2lmeURvY3VtZW50O1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBBbGlhcyA9IHJlcXVpcmUoJy4uL25vZGVzL0FsaWFzLmpzJyk7XG52YXIgQ29sbGVjdGlvbiA9IHJlcXVpcmUoJy4uL25vZGVzL0NvbGxlY3Rpb24uanMnKTtcbnZhciBpZGVudGl0eSA9IHJlcXVpcmUoJy4uL25vZGVzL2lkZW50aXR5LmpzJyk7XG52YXIgUGFpciA9IHJlcXVpcmUoJy4uL25vZGVzL1BhaXIuanMnKTtcbnZhciB0b0pTID0gcmVxdWlyZSgnLi4vbm9kZXMvdG9KUy5qcycpO1xudmFyIFNjaGVtYSA9IHJlcXVpcmUoJy4uL3NjaGVtYS9TY2hlbWEuanMnKTtcbnZhciBzdHJpbmdpZnlEb2N1bWVudCA9IHJlcXVpcmUoJy4uL3N0cmluZ2lmeS9zdHJpbmdpZnlEb2N1bWVudC5qcycpO1xudmFyIGFuY2hvcnMgPSByZXF1aXJlKCcuL2FuY2hvcnMuanMnKTtcbnZhciBhcHBseVJldml2ZXIgPSByZXF1aXJlKCcuL2FwcGx5UmV2aXZlci5qcycpO1xudmFyIGNyZWF0ZU5vZGUgPSByZXF1aXJlKCcuL2NyZWF0ZU5vZGUuanMnKTtcbnZhciBkaXJlY3RpdmVzID0gcmVxdWlyZSgnLi9kaXJlY3RpdmVzLmpzJyk7XG5cbmNsYXNzIERvY3VtZW50IHtcbiAgICBjb25zdHJ1Y3Rvcih2YWx1ZSwgcmVwbGFjZXIsIG9wdGlvbnMpIHtcbiAgICAgICAgLyoqIEEgY29tbWVudCBiZWZvcmUgdGhpcyBEb2N1bWVudCAqL1xuICAgICAgICB0aGlzLmNvbW1lbnRCZWZvcmUgPSBudWxsO1xuICAgICAgICAvKiogQSBjb21tZW50IGltbWVkaWF0ZWx5IGFmdGVyIHRoaXMgRG9jdW1lbnQgKi9cbiAgICAgICAgdGhpcy5jb21tZW50ID0gbnVsbDtcbiAgICAgICAgLyoqIEVycm9ycyBlbmNvdW50ZXJlZCBkdXJpbmcgcGFyc2luZy4gKi9cbiAgICAgICAgdGhpcy5lcnJvcnMgPSBbXTtcbiAgICAgICAgLyoqIFdhcm5pbmdzIGVuY291bnRlcmVkIGR1cmluZyBwYXJzaW5nLiAqL1xuICAgICAgICB0aGlzLndhcm5pbmdzID0gW107XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBpZGVudGl0eS5OT0RFX1RZUEUsIHsgdmFsdWU6IGlkZW50aXR5LkRPQyB9KTtcbiAgICAgICAgbGV0IF9yZXBsYWNlciA9IG51bGw7XG4gICAgICAgIGlmICh0eXBlb2YgcmVwbGFjZXIgPT09ICdmdW5jdGlvbicgfHwgQXJyYXkuaXNBcnJheShyZXBsYWNlcikpIHtcbiAgICAgICAgICAgIF9yZXBsYWNlciA9IHJlcGxhY2VyO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG9wdGlvbnMgPT09IHVuZGVmaW5lZCAmJiByZXBsYWNlcikge1xuICAgICAgICAgICAgb3B0aW9ucyA9IHJlcGxhY2VyO1xuICAgICAgICAgICAgcmVwbGFjZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgb3B0ID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICBpbnRBc0JpZ0ludDogZmFsc2UsXG4gICAgICAgICAgICBrZWVwU291cmNlVG9rZW5zOiBmYWxzZSxcbiAgICAgICAgICAgIGxvZ0xldmVsOiAnd2FybicsXG4gICAgICAgICAgICBwcmV0dHlFcnJvcnM6IHRydWUsXG4gICAgICAgICAgICBzdHJpY3Q6IHRydWUsXG4gICAgICAgICAgICBzdHJpbmdLZXlzOiBmYWxzZSxcbiAgICAgICAgICAgIHVuaXF1ZUtleXM6IHRydWUsXG4gICAgICAgICAgICB2ZXJzaW9uOiAnMS4yJ1xuICAgICAgICB9LCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0O1xuICAgICAgICBsZXQgeyB2ZXJzaW9uIH0gPSBvcHQ7XG4gICAgICAgIGlmIChvcHRpb25zPy5fZGlyZWN0aXZlcykge1xuICAgICAgICAgICAgdGhpcy5kaXJlY3RpdmVzID0gb3B0aW9ucy5fZGlyZWN0aXZlcy5hdERvY3VtZW50KCk7XG4gICAgICAgICAgICBpZiAodGhpcy5kaXJlY3RpdmVzLnlhbWwuZXhwbGljaXQpXG4gICAgICAgICAgICAgICAgdmVyc2lvbiA9IHRoaXMuZGlyZWN0aXZlcy55YW1sLnZlcnNpb247XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5kaXJlY3RpdmVzID0gbmV3IGRpcmVjdGl2ZXMuRGlyZWN0aXZlcyh7IHZlcnNpb24gfSk7XG4gICAgICAgIHRoaXMuc2V0U2NoZW1hKHZlcnNpb24sIG9wdGlvbnMpO1xuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFdlIGNhbid0IHJlYWxseSBrbm93IHRoYXQgdGhpcyBtYXRjaGVzIENvbnRlbnRzLlxuICAgICAgICB0aGlzLmNvbnRlbnRzID1cbiAgICAgICAgICAgIHZhbHVlID09PSB1bmRlZmluZWQgPyBudWxsIDogdGhpcy5jcmVhdGVOb2RlKHZhbHVlLCBfcmVwbGFjZXIsIG9wdGlvbnMpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBkZWVwIGNvcHkgb2YgdGhpcyBEb2N1bWVudCBhbmQgaXRzIGNvbnRlbnRzLlxuICAgICAqXG4gICAgICogQ3VzdG9tIE5vZGUgdmFsdWVzIHRoYXQgaW5oZXJpdCBmcm9tIGBPYmplY3RgIHN0aWxsIHJlZmVyIHRvIHRoZWlyIG9yaWdpbmFsIGluc3RhbmNlcy5cbiAgICAgKi9cbiAgICBjbG9uZSgpIHtcbiAgICAgICAgY29uc3QgY29weSA9IE9iamVjdC5jcmVhdGUoRG9jdW1lbnQucHJvdG90eXBlLCB7XG4gICAgICAgICAgICBbaWRlbnRpdHkuTk9ERV9UWVBFXTogeyB2YWx1ZTogaWRlbnRpdHkuRE9DIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGNvcHkuY29tbWVudEJlZm9yZSA9IHRoaXMuY29tbWVudEJlZm9yZTtcbiAgICAgICAgY29weS5jb21tZW50ID0gdGhpcy5jb21tZW50O1xuICAgICAgICBjb3B5LmVycm9ycyA9IHRoaXMuZXJyb3JzLnNsaWNlKCk7XG4gICAgICAgIGNvcHkud2FybmluZ3MgPSB0aGlzLndhcm5pbmdzLnNsaWNlKCk7XG4gICAgICAgIGNvcHkub3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMub3B0aW9ucyk7XG4gICAgICAgIGlmICh0aGlzLmRpcmVjdGl2ZXMpXG4gICAgICAgICAgICBjb3B5LmRpcmVjdGl2ZXMgPSB0aGlzLmRpcmVjdGl2ZXMuY2xvbmUoKTtcbiAgICAgICAgY29weS5zY2hlbWEgPSB0aGlzLnNjaGVtYS5jbG9uZSgpO1xuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFdlIGNhbid0IHJlYWxseSBrbm93IHRoYXQgdGhpcyBtYXRjaGVzIENvbnRlbnRzLlxuICAgICAgICBjb3B5LmNvbnRlbnRzID0gaWRlbnRpdHkuaXNOb2RlKHRoaXMuY29udGVudHMpXG4gICAgICAgICAgICA/IHRoaXMuY29udGVudHMuY2xvbmUoY29weS5zY2hlbWEpXG4gICAgICAgICAgICA6IHRoaXMuY29udGVudHM7XG4gICAgICAgIGlmICh0aGlzLnJhbmdlKVxuICAgICAgICAgICAgY29weS5yYW5nZSA9IHRoaXMucmFuZ2Uuc2xpY2UoKTtcbiAgICAgICAgcmV0dXJuIGNvcHk7XG4gICAgfVxuICAgIC8qKiBBZGRzIGEgdmFsdWUgdG8gdGhlIGRvY3VtZW50LiAqL1xuICAgIGFkZCh2YWx1ZSkge1xuICAgICAgICBpZiAoYXNzZXJ0Q29sbGVjdGlvbih0aGlzLmNvbnRlbnRzKSlcbiAgICAgICAgICAgIHRoaXMuY29udGVudHMuYWRkKHZhbHVlKTtcbiAgICB9XG4gICAgLyoqIEFkZHMgYSB2YWx1ZSB0byB0aGUgZG9jdW1lbnQuICovXG4gICAgYWRkSW4ocGF0aCwgdmFsdWUpIHtcbiAgICAgICAgaWYgKGFzc2VydENvbGxlY3Rpb24odGhpcy5jb250ZW50cykpXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRzLmFkZEluKHBhdGgsIHZhbHVlKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IGBBbGlhc2Agbm9kZSwgZW5zdXJpbmcgdGhhdCB0aGUgdGFyZ2V0IGBub2RlYCBoYXMgdGhlIHJlcXVpcmVkIGFuY2hvci5cbiAgICAgKlxuICAgICAqIElmIGBub2RlYCBhbHJlYWR5IGhhcyBhbiBhbmNob3IsIGBuYW1lYCBpcyBpZ25vcmVkLlxuICAgICAqIE90aGVyd2lzZSwgdGhlIGBub2RlLmFuY2hvcmAgdmFsdWUgd2lsbCBiZSBzZXQgdG8gYG5hbWVgLFxuICAgICAqIG9yIGlmIGFuIGFuY2hvciB3aXRoIHRoYXQgbmFtZSBpcyBhbHJlYWR5IHByZXNlbnQgaW4gdGhlIGRvY3VtZW50LFxuICAgICAqIGBuYW1lYCB3aWxsIGJlIHVzZWQgYXMgYSBwcmVmaXggZm9yIGEgbmV3IHVuaXF1ZSBhbmNob3IuXG4gICAgICogSWYgYG5hbWVgIGlzIHVuZGVmaW5lZCwgdGhlIGdlbmVyYXRlZCBhbmNob3Igd2lsbCB1c2UgJ2EnIGFzIGEgcHJlZml4LlxuICAgICAqL1xuICAgIGNyZWF0ZUFsaWFzKG5vZGUsIG5hbWUpIHtcbiAgICAgICAgaWYgKCFub2RlLmFuY2hvcikge1xuICAgICAgICAgICAgY29uc3QgcHJldiA9IGFuY2hvcnMuYW5jaG9yTmFtZXModGhpcyk7XG4gICAgICAgICAgICBub2RlLmFuY2hvciA9XG4gICAgICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9wcmVmZXItbnVsbGlzaC1jb2FsZXNjaW5nXG4gICAgICAgICAgICAgICAgIW5hbWUgfHwgcHJldi5oYXMobmFtZSkgPyBhbmNob3JzLmZpbmROZXdBbmNob3IobmFtZSB8fCAnYScsIHByZXYpIDogbmFtZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IEFsaWFzLkFsaWFzKG5vZGUuYW5jaG9yKTtcbiAgICB9XG4gICAgY3JlYXRlTm9kZSh2YWx1ZSwgcmVwbGFjZXIsIG9wdGlvbnMpIHtcbiAgICAgICAgbGV0IF9yZXBsYWNlciA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHR5cGVvZiByZXBsYWNlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgdmFsdWUgPSByZXBsYWNlci5jYWxsKHsgJyc6IHZhbHVlIH0sICcnLCB2YWx1ZSk7XG4gICAgICAgICAgICBfcmVwbGFjZXIgPSByZXBsYWNlcjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5KHJlcGxhY2VyKSkge1xuICAgICAgICAgICAgY29uc3Qga2V5VG9TdHIgPSAodikgPT4gdHlwZW9mIHYgPT09ICdudW1iZXInIHx8IHYgaW5zdGFuY2VvZiBTdHJpbmcgfHwgdiBpbnN0YW5jZW9mIE51bWJlcjtcbiAgICAgICAgICAgIGNvbnN0IGFzU3RyID0gcmVwbGFjZXIuZmlsdGVyKGtleVRvU3RyKS5tYXAoU3RyaW5nKTtcbiAgICAgICAgICAgIGlmIChhc1N0ci5sZW5ndGggPiAwKVxuICAgICAgICAgICAgICAgIHJlcGxhY2VyID0gcmVwbGFjZXIuY29uY2F0KGFzU3RyKTtcbiAgICAgICAgICAgIF9yZXBsYWNlciA9IHJlcGxhY2VyO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG9wdGlvbnMgPT09IHVuZGVmaW5lZCAmJiByZXBsYWNlcikge1xuICAgICAgICAgICAgb3B0aW9ucyA9IHJlcGxhY2VyO1xuICAgICAgICAgICAgcmVwbGFjZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgeyBhbGlhc0R1cGxpY2F0ZU9iamVjdHMsIGFuY2hvclByZWZpeCwgZmxvdywga2VlcFVuZGVmaW5lZCwgb25UYWdPYmosIHRhZyB9ID0gb3B0aW9ucyA/PyB7fTtcbiAgICAgICAgY29uc3QgeyBvbkFuY2hvciwgc2V0QW5jaG9ycywgc291cmNlT2JqZWN0cyB9ID0gYW5jaG9ycy5jcmVhdGVOb2RlQW5jaG9ycyh0aGlzLCBcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9wcmVmZXItbnVsbGlzaC1jb2FsZXNjaW5nXG4gICAgICAgIGFuY2hvclByZWZpeCB8fCAnYScpO1xuICAgICAgICBjb25zdCBjdHggPSB7XG4gICAgICAgICAgICBhbGlhc0R1cGxpY2F0ZU9iamVjdHM6IGFsaWFzRHVwbGljYXRlT2JqZWN0cyA/PyB0cnVlLFxuICAgICAgICAgICAga2VlcFVuZGVmaW5lZDoga2VlcFVuZGVmaW5lZCA/PyBmYWxzZSxcbiAgICAgICAgICAgIG9uQW5jaG9yLFxuICAgICAgICAgICAgb25UYWdPYmosXG4gICAgICAgICAgICByZXBsYWNlcjogX3JlcGxhY2VyLFxuICAgICAgICAgICAgc2NoZW1hOiB0aGlzLnNjaGVtYSxcbiAgICAgICAgICAgIHNvdXJjZU9iamVjdHNcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3Qgbm9kZSA9IGNyZWF0ZU5vZGUuY3JlYXRlTm9kZSh2YWx1ZSwgdGFnLCBjdHgpO1xuICAgICAgICBpZiAoZmxvdyAmJiBpZGVudGl0eS5pc0NvbGxlY3Rpb24obm9kZSkpXG4gICAgICAgICAgICBub2RlLmZsb3cgPSB0cnVlO1xuICAgICAgICBzZXRBbmNob3JzKCk7XG4gICAgICAgIHJldHVybiBub2RlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0IGEga2V5IGFuZCBhIHZhbHVlIGludG8gYSBgUGFpcmAgdXNpbmcgdGhlIGN1cnJlbnQgc2NoZW1hLFxuICAgICAqIHJlY3Vyc2l2ZWx5IHdyYXBwaW5nIGFsbCB2YWx1ZXMgYXMgYFNjYWxhcmAgb3IgYENvbGxlY3Rpb25gIG5vZGVzLlxuICAgICAqL1xuICAgIGNyZWF0ZVBhaXIoa2V5LCB2YWx1ZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIGNvbnN0IGsgPSB0aGlzLmNyZWF0ZU5vZGUoa2V5LCBudWxsLCBvcHRpb25zKTtcbiAgICAgICAgY29uc3QgdiA9IHRoaXMuY3JlYXRlTm9kZSh2YWx1ZSwgbnVsbCwgb3B0aW9ucyk7XG4gICAgICAgIHJldHVybiBuZXcgUGFpci5QYWlyKGssIHYpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGEgdmFsdWUgZnJvbSB0aGUgZG9jdW1lbnQuXG4gICAgICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBpdGVtIHdhcyBmb3VuZCBhbmQgcmVtb3ZlZC5cbiAgICAgKi9cbiAgICBkZWxldGUoa2V5KSB7XG4gICAgICAgIHJldHVybiBhc3NlcnRDb2xsZWN0aW9uKHRoaXMuY29udGVudHMpID8gdGhpcy5jb250ZW50cy5kZWxldGUoa2V5KSA6IGZhbHNlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGEgdmFsdWUgZnJvbSB0aGUgZG9jdW1lbnQuXG4gICAgICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBpdGVtIHdhcyBmb3VuZCBhbmQgcmVtb3ZlZC5cbiAgICAgKi9cbiAgICBkZWxldGVJbihwYXRoKSB7XG4gICAgICAgIGlmIChDb2xsZWN0aW9uLmlzRW1wdHlQYXRoKHBhdGgpKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5jb250ZW50cyA9PSBudWxsKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgUHJlc3VtZWQgaW1wb3NzaWJsZSBpZiBTdHJpY3QgZXh0ZW5kcyBmYWxzZVxuICAgICAgICAgICAgdGhpcy5jb250ZW50cyA9IG51bGw7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYXNzZXJ0Q29sbGVjdGlvbih0aGlzLmNvbnRlbnRzKVxuICAgICAgICAgICAgPyB0aGlzLmNvbnRlbnRzLmRlbGV0ZUluKHBhdGgpXG4gICAgICAgICAgICA6IGZhbHNlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGl0ZW0gYXQgYGtleWAsIG9yIGB1bmRlZmluZWRgIGlmIG5vdCBmb3VuZC4gQnkgZGVmYXVsdCB1bndyYXBzXG4gICAgICogc2NhbGFyIHZhbHVlcyBmcm9tIHRoZWlyIHN1cnJvdW5kaW5nIG5vZGU7IHRvIGRpc2FibGUgc2V0IGBrZWVwU2NhbGFyYCB0b1xuICAgICAqIGB0cnVlYCAoY29sbGVjdGlvbnMgYXJlIGFsd2F5cyByZXR1cm5lZCBpbnRhY3QpLlxuICAgICAqL1xuICAgIGdldChrZXksIGtlZXBTY2FsYXIpIHtcbiAgICAgICAgcmV0dXJuIGlkZW50aXR5LmlzQ29sbGVjdGlvbih0aGlzLmNvbnRlbnRzKVxuICAgICAgICAgICAgPyB0aGlzLmNvbnRlbnRzLmdldChrZXksIGtlZXBTY2FsYXIpXG4gICAgICAgICAgICA6IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmV0dXJucyBpdGVtIGF0IGBwYXRoYCwgb3IgYHVuZGVmaW5lZGAgaWYgbm90IGZvdW5kLiBCeSBkZWZhdWx0IHVud3JhcHNcbiAgICAgKiBzY2FsYXIgdmFsdWVzIGZyb20gdGhlaXIgc3Vycm91bmRpbmcgbm9kZTsgdG8gZGlzYWJsZSBzZXQgYGtlZXBTY2FsYXJgIHRvXG4gICAgICogYHRydWVgIChjb2xsZWN0aW9ucyBhcmUgYWx3YXlzIHJldHVybmVkIGludGFjdCkuXG4gICAgICovXG4gICAgZ2V0SW4ocGF0aCwga2VlcFNjYWxhcikge1xuICAgICAgICBpZiAoQ29sbGVjdGlvbi5pc0VtcHR5UGF0aChwYXRoKSlcbiAgICAgICAgICAgIHJldHVybiAha2VlcFNjYWxhciAmJiBpZGVudGl0eS5pc1NjYWxhcih0aGlzLmNvbnRlbnRzKVxuICAgICAgICAgICAgICAgID8gdGhpcy5jb250ZW50cy52YWx1ZVxuICAgICAgICAgICAgICAgIDogdGhpcy5jb250ZW50cztcbiAgICAgICAgcmV0dXJuIGlkZW50aXR5LmlzQ29sbGVjdGlvbih0aGlzLmNvbnRlbnRzKVxuICAgICAgICAgICAgPyB0aGlzLmNvbnRlbnRzLmdldEluKHBhdGgsIGtlZXBTY2FsYXIpXG4gICAgICAgICAgICA6IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIHRoZSBkb2N1bWVudCBpbmNsdWRlcyBhIHZhbHVlIHdpdGggdGhlIGtleSBga2V5YC5cbiAgICAgKi9cbiAgICBoYXMoa2V5KSB7XG4gICAgICAgIHJldHVybiBpZGVudGl0eS5pc0NvbGxlY3Rpb24odGhpcy5jb250ZW50cykgPyB0aGlzLmNvbnRlbnRzLmhhcyhrZXkpIDogZmFsc2U7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiB0aGUgZG9jdW1lbnQgaW5jbHVkZXMgYSB2YWx1ZSBhdCBgcGF0aGAuXG4gICAgICovXG4gICAgaGFzSW4ocGF0aCkge1xuICAgICAgICBpZiAoQ29sbGVjdGlvbi5pc0VtcHR5UGF0aChwYXRoKSlcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbnRlbnRzICE9PSB1bmRlZmluZWQ7XG4gICAgICAgIHJldHVybiBpZGVudGl0eS5pc0NvbGxlY3Rpb24odGhpcy5jb250ZW50cykgPyB0aGlzLmNvbnRlbnRzLmhhc0luKHBhdGgpIDogZmFsc2U7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldHMgYSB2YWx1ZSBpbiB0aGlzIGRvY3VtZW50LiBGb3IgYCEhc2V0YCwgYHZhbHVlYCBuZWVkcyB0byBiZSBhXG4gICAgICogYm9vbGVhbiB0byBhZGQvcmVtb3ZlIHRoZSBpdGVtIGZyb20gdGhlIHNldC5cbiAgICAgKi9cbiAgICBzZXQoa2V5LCB2YWx1ZSkge1xuICAgICAgICBpZiAodGhpcy5jb250ZW50cyA9PSBudWxsKSB7XG4gICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFdlIGNhbid0IHJlYWxseSBrbm93IHRoYXQgdGhpcyBtYXRjaGVzIENvbnRlbnRzLlxuICAgICAgICAgICAgdGhpcy5jb250ZW50cyA9IENvbGxlY3Rpb24uY29sbGVjdGlvbkZyb21QYXRoKHRoaXMuc2NoZW1hLCBba2V5XSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGFzc2VydENvbGxlY3Rpb24odGhpcy5jb250ZW50cykpIHtcbiAgICAgICAgICAgIHRoaXMuY29udGVudHMuc2V0KGtleSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldHMgYSB2YWx1ZSBpbiB0aGlzIGRvY3VtZW50LiBGb3IgYCEhc2V0YCwgYHZhbHVlYCBuZWVkcyB0byBiZSBhXG4gICAgICogYm9vbGVhbiB0byBhZGQvcmVtb3ZlIHRoZSBpdGVtIGZyb20gdGhlIHNldC5cbiAgICAgKi9cbiAgICBzZXRJbihwYXRoLCB2YWx1ZSkge1xuICAgICAgICBpZiAoQ29sbGVjdGlvbi5pc0VtcHR5UGF0aChwYXRoKSkge1xuICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBXZSBjYW4ndCByZWFsbHkga25vdyB0aGF0IHRoaXMgbWF0Y2hlcyBDb250ZW50cy5cbiAgICAgICAgICAgIHRoaXMuY29udGVudHMgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzLmNvbnRlbnRzID09IG51bGwpIHtcbiAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgV2UgY2FuJ3QgcmVhbGx5IGtub3cgdGhhdCB0aGlzIG1hdGNoZXMgQ29udGVudHMuXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRzID0gQ29sbGVjdGlvbi5jb2xsZWN0aW9uRnJvbVBhdGgodGhpcy5zY2hlbWEsIEFycmF5LmZyb20ocGF0aCksIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChhc3NlcnRDb2xsZWN0aW9uKHRoaXMuY29udGVudHMpKSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRzLnNldEluKHBhdGgsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGFuZ2UgdGhlIFlBTUwgdmVyc2lvbiBhbmQgc2NoZW1hIHVzZWQgYnkgdGhlIGRvY3VtZW50LlxuICAgICAqIEEgYG51bGxgIHZlcnNpb24gZGlzYWJsZXMgc3VwcG9ydCBmb3IgZGlyZWN0aXZlcywgZXhwbGljaXQgdGFncywgYW5jaG9ycywgYW5kIGFsaWFzZXMuXG4gICAgICogSXQgYWxzbyByZXF1aXJlcyB0aGUgYHNjaGVtYWAgb3B0aW9uIHRvIGJlIGdpdmVuIGFzIGEgYFNjaGVtYWAgaW5zdGFuY2UgdmFsdWUuXG4gICAgICpcbiAgICAgKiBPdmVycmlkZXMgYWxsIHByZXZpb3VzbHkgc2V0IHNjaGVtYSBvcHRpb25zLlxuICAgICAqL1xuICAgIHNldFNjaGVtYSh2ZXJzaW9uLCBvcHRpb25zID0ge30pIHtcbiAgICAgICAgaWYgKHR5cGVvZiB2ZXJzaW9uID09PSAnbnVtYmVyJylcbiAgICAgICAgICAgIHZlcnNpb24gPSBTdHJpbmcodmVyc2lvbik7XG4gICAgICAgIGxldCBvcHQ7XG4gICAgICAgIHN3aXRjaCAodmVyc2lvbikge1xuICAgICAgICAgICAgY2FzZSAnMS4xJzpcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5kaXJlY3RpdmVzKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpcmVjdGl2ZXMueWFtbC52ZXJzaW9uID0gJzEuMSc7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpcmVjdGl2ZXMgPSBuZXcgZGlyZWN0aXZlcy5EaXJlY3RpdmVzKHsgdmVyc2lvbjogJzEuMScgfSk7XG4gICAgICAgICAgICAgICAgb3B0ID0geyByZXNvbHZlS25vd25UYWdzOiBmYWxzZSwgc2NoZW1hOiAneWFtbC0xLjEnIH07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICcxLjInOlxuICAgICAgICAgICAgY2FzZSAnbmV4dCc6XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZGlyZWN0aXZlcylcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXJlY3RpdmVzLnlhbWwudmVyc2lvbiA9IHZlcnNpb247XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpcmVjdGl2ZXMgPSBuZXcgZGlyZWN0aXZlcy5EaXJlY3RpdmVzKHsgdmVyc2lvbiB9KTtcbiAgICAgICAgICAgICAgICBvcHQgPSB7IHJlc29sdmVLbm93blRhZ3M6IHRydWUsIHNjaGVtYTogJ2NvcmUnIH07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIG51bGw6XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZGlyZWN0aXZlcylcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuZGlyZWN0aXZlcztcbiAgICAgICAgICAgICAgICBvcHQgPSBudWxsO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN2ID0gSlNPTi5zdHJpbmdpZnkodmVyc2lvbik7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCAnMS4xJywgJzEuMicgb3IgbnVsbCBhcyBmaXJzdCBhcmd1bWVudCwgYnV0IGZvdW5kOiAke3N2fWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIE5vdCB1c2luZyBgaW5zdGFuY2VvZiBTY2hlbWFgIHRvIGFsbG93IGZvciBkdWNrIHR5cGluZ1xuICAgICAgICBpZiAob3B0aW9ucy5zY2hlbWEgaW5zdGFuY2VvZiBPYmplY3QpXG4gICAgICAgICAgICB0aGlzLnNjaGVtYSA9IG9wdGlvbnMuc2NoZW1hO1xuICAgICAgICBlbHNlIGlmIChvcHQpXG4gICAgICAgICAgICB0aGlzLnNjaGVtYSA9IG5ldyBTY2hlbWEuU2NoZW1hKE9iamVjdC5hc3NpZ24ob3B0LCBvcHRpb25zKSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgV2l0aCBhIG51bGwgWUFNTCB2ZXJzaW9uLCB0aGUgeyBzY2hlbWE6IFNjaGVtYSB9IG9wdGlvbiBpcyByZXF1aXJlZGApO1xuICAgIH1cbiAgICAvLyBqc29uICYganNvbkFyZyBhcmUgb25seSB1c2VkIGZyb20gdG9KU09OKClcbiAgICB0b0pTKHsganNvbiwganNvbkFyZywgbWFwQXNNYXAsIG1heEFsaWFzQ291bnQsIG9uQW5jaG9yLCByZXZpdmVyIH0gPSB7fSkge1xuICAgICAgICBjb25zdCBjdHggPSB7XG4gICAgICAgICAgICBhbmNob3JzOiBuZXcgTWFwKCksXG4gICAgICAgICAgICBkb2M6IHRoaXMsXG4gICAgICAgICAgICBrZWVwOiAhanNvbixcbiAgICAgICAgICAgIG1hcEFzTWFwOiBtYXBBc01hcCA9PT0gdHJ1ZSxcbiAgICAgICAgICAgIG1hcEtleVdhcm5lZDogZmFsc2UsXG4gICAgICAgICAgICBtYXhBbGlhc0NvdW50OiB0eXBlb2YgbWF4QWxpYXNDb3VudCA9PT0gJ251bWJlcicgPyBtYXhBbGlhc0NvdW50IDogMTAwXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHJlcyA9IHRvSlMudG9KUyh0aGlzLmNvbnRlbnRzLCBqc29uQXJnID8/ICcnLCBjdHgpO1xuICAgICAgICBpZiAodHlwZW9mIG9uQW5jaG9yID09PSAnZnVuY3Rpb24nKVxuICAgICAgICAgICAgZm9yIChjb25zdCB7IGNvdW50LCByZXMgfSBvZiBjdHguYW5jaG9ycy52YWx1ZXMoKSlcbiAgICAgICAgICAgICAgICBvbkFuY2hvcihyZXMsIGNvdW50KTtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiByZXZpdmVyID09PSAnZnVuY3Rpb24nXG4gICAgICAgICAgICA/IGFwcGx5UmV2aXZlci5hcHBseVJldml2ZXIocmV2aXZlciwgeyAnJzogcmVzIH0sICcnLCByZXMpXG4gICAgICAgICAgICA6IHJlcztcbiAgICB9XG4gICAgLyoqXG4gICAgICogQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBkb2N1bWVudCBgY29udGVudHNgLlxuICAgICAqXG4gICAgICogQHBhcmFtIGpzb25BcmcgVXNlZCBieSBgSlNPTi5zdHJpbmdpZnlgIHRvIGluZGljYXRlIHRoZSBhcnJheSBpbmRleCBvclxuICAgICAqICAgcHJvcGVydHkgbmFtZS5cbiAgICAgKi9cbiAgICB0b0pTT04oanNvbkFyZywgb25BbmNob3IpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudG9KUyh7IGpzb246IHRydWUsIGpzb25BcmcsIG1hcEFzTWFwOiBmYWxzZSwgb25BbmNob3IgfSk7XG4gICAgfVxuICAgIC8qKiBBIFlBTUwgcmVwcmVzZW50YXRpb24gb2YgdGhlIGRvY3VtZW50LiAqL1xuICAgIHRvU3RyaW5nKG9wdGlvbnMgPSB7fSkge1xuICAgICAgICBpZiAodGhpcy5lcnJvcnMubGVuZ3RoID4gMClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRG9jdW1lbnQgd2l0aCBlcnJvcnMgY2Fubm90IGJlIHN0cmluZ2lmaWVkJyk7XG4gICAgICAgIGlmICgnaW5kZW50JyBpbiBvcHRpb25zICYmXG4gICAgICAgICAgICAoIU51bWJlci5pc0ludGVnZXIob3B0aW9ucy5pbmRlbnQpIHx8IE51bWJlcihvcHRpb25zLmluZGVudCkgPD0gMCkpIHtcbiAgICAgICAgICAgIGNvbnN0IHMgPSBKU09OLnN0cmluZ2lmeShvcHRpb25zLmluZGVudCk7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFwiaW5kZW50XCIgb3B0aW9uIG11c3QgYmUgYSBwb3NpdGl2ZSBpbnRlZ2VyLCBub3QgJHtzfWApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdHJpbmdpZnlEb2N1bWVudC5zdHJpbmdpZnlEb2N1bWVudCh0aGlzLCBvcHRpb25zKTtcbiAgICB9XG59XG5mdW5jdGlvbiBhc3NlcnRDb2xsZWN0aW9uKGNvbnRlbnRzKSB7XG4gICAgaWYgKGlkZW50aXR5LmlzQ29sbGVjdGlvbihjb250ZW50cykpXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIHRocm93IG5ldyBFcnJvcignRXhwZWN0ZWQgYSBZQU1MIGNvbGxlY3Rpb24gYXMgZG9jdW1lbnQgY29udGVudHMnKTtcbn1cblxuZXhwb3J0cy5Eb2N1bWVudCA9IERvY3VtZW50O1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbmNsYXNzIFlBTUxFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBwb3MsIGNvZGUsIG1lc3NhZ2UpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgdGhpcy5jb2RlID0gY29kZTtcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICAgICAgdGhpcy5wb3MgPSBwb3M7XG4gICAgfVxufVxuY2xhc3MgWUFNTFBhcnNlRXJyb3IgZXh0ZW5kcyBZQU1MRXJyb3Ige1xuICAgIGNvbnN0cnVjdG9yKHBvcywgY29kZSwgbWVzc2FnZSkge1xuICAgICAgICBzdXBlcignWUFNTFBhcnNlRXJyb3InLCBwb3MsIGNvZGUsIG1lc3NhZ2UpO1xuICAgIH1cbn1cbmNsYXNzIFlBTUxXYXJuaW5nIGV4dGVuZHMgWUFNTEVycm9yIHtcbiAgICBjb25zdHJ1Y3Rvcihwb3MsIGNvZGUsIG1lc3NhZ2UpIHtcbiAgICAgICAgc3VwZXIoJ1lBTUxXYXJuaW5nJywgcG9zLCBjb2RlLCBtZXNzYWdlKTtcbiAgICB9XG59XG5jb25zdCBwcmV0dGlmeUVycm9yID0gKHNyYywgbGMpID0+IChlcnJvcikgPT4ge1xuICAgIGlmIChlcnJvci5wb3NbMF0gPT09IC0xKVxuICAgICAgICByZXR1cm47XG4gICAgZXJyb3IubGluZVBvcyA9IGVycm9yLnBvcy5tYXAocG9zID0+IGxjLmxpbmVQb3MocG9zKSk7XG4gICAgY29uc3QgeyBsaW5lLCBjb2wgfSA9IGVycm9yLmxpbmVQb3NbMF07XG4gICAgZXJyb3IubWVzc2FnZSArPSBgIGF0IGxpbmUgJHtsaW5lfSwgY29sdW1uICR7Y29sfWA7XG4gICAgbGV0IGNpID0gY29sIC0gMTtcbiAgICBsZXQgbGluZVN0ciA9IHNyY1xuICAgICAgICAuc3Vic3RyaW5nKGxjLmxpbmVTdGFydHNbbGluZSAtIDFdLCBsYy5saW5lU3RhcnRzW2xpbmVdKVxuICAgICAgICAucmVwbGFjZSgvW1xcblxccl0rJC8sICcnKTtcbiAgICAvLyBUcmltIHRvIG1heCA4MCBjaGFycywga2VlcGluZyBjb2wgcG9zaXRpb24gbmVhciB0aGUgbWlkZGxlXG4gICAgaWYgKGNpID49IDYwICYmIGxpbmVTdHIubGVuZ3RoID4gODApIHtcbiAgICAgICAgY29uc3QgdHJpbVN0YXJ0ID0gTWF0aC5taW4oY2kgLSAzOSwgbGluZVN0ci5sZW5ndGggLSA3OSk7XG4gICAgICAgIGxpbmVTdHIgPSAn4oCmJyArIGxpbmVTdHIuc3Vic3RyaW5nKHRyaW1TdGFydCk7XG4gICAgICAgIGNpIC09IHRyaW1TdGFydCAtIDE7XG4gICAgfVxuICAgIGlmIChsaW5lU3RyLmxlbmd0aCA+IDgwKVxuICAgICAgICBsaW5lU3RyID0gbGluZVN0ci5zdWJzdHJpbmcoMCwgNzkpICsgJ+KApic7XG4gICAgLy8gSW5jbHVkZSBwcmV2aW91cyBsaW5lIGluIGNvbnRleHQgaWYgcG9pbnRpbmcgYXQgbGluZSBzdGFydFxuICAgIGlmIChsaW5lID4gMSAmJiAvXiAqJC8udGVzdChsaW5lU3RyLnN1YnN0cmluZygwLCBjaSkpKSB7XG4gICAgICAgIC8vIFJlZ2V4cCB3b24ndCBtYXRjaCBpZiBzdGFydCBpcyB0cmltbWVkXG4gICAgICAgIGxldCBwcmV2ID0gc3JjLnN1YnN0cmluZyhsYy5saW5lU3RhcnRzW2xpbmUgLSAyXSwgbGMubGluZVN0YXJ0c1tsaW5lIC0gMV0pO1xuICAgICAgICBpZiAocHJldi5sZW5ndGggPiA4MClcbiAgICAgICAgICAgIHByZXYgPSBwcmV2LnN1YnN0cmluZygwLCA3OSkgKyAn4oCmXFxuJztcbiAgICAgICAgbGluZVN0ciA9IHByZXYgKyBsaW5lU3RyO1xuICAgIH1cbiAgICBpZiAoL1teIF0vLnRlc3QobGluZVN0cikpIHtcbiAgICAgICAgbGV0IGNvdW50ID0gMTtcbiAgICAgICAgY29uc3QgZW5kID0gZXJyb3IubGluZVBvc1sxXTtcbiAgICAgICAgaWYgKGVuZD8ubGluZSA9PT0gbGluZSAmJiBlbmQuY29sID4gY29sKSB7XG4gICAgICAgICAgICBjb3VudCA9IE1hdGgubWF4KDEsIE1hdGgubWluKGVuZC5jb2wgLSBjb2wsIDgwIC0gY2kpKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwb2ludGVyID0gJyAnLnJlcGVhdChjaSkgKyAnXicucmVwZWF0KGNvdW50KTtcbiAgICAgICAgZXJyb3IubWVzc2FnZSArPSBgOlxcblxcbiR7bGluZVN0cn1cXG4ke3BvaW50ZXJ9XFxuYDtcbiAgICB9XG59O1xuXG5leHBvcnRzLllBTUxFcnJvciA9IFlBTUxFcnJvcjtcbmV4cG9ydHMuWUFNTFBhcnNlRXJyb3IgPSBZQU1MUGFyc2VFcnJvcjtcbmV4cG9ydHMuWUFNTFdhcm5pbmcgPSBZQU1MV2FybmluZztcbmV4cG9ydHMucHJldHRpZnlFcnJvciA9IHByZXR0aWZ5RXJyb3I7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gcmVzb2x2ZVByb3BzKHRva2VucywgeyBmbG93LCBpbmRpY2F0b3IsIG5leHQsIG9mZnNldCwgb25FcnJvciwgcGFyZW50SW5kZW50LCBzdGFydE9uTmV3bGluZSB9KSB7XG4gICAgbGV0IHNwYWNlQmVmb3JlID0gZmFsc2U7XG4gICAgbGV0IGF0TmV3bGluZSA9IHN0YXJ0T25OZXdsaW5lO1xuICAgIGxldCBoYXNTcGFjZSA9IHN0YXJ0T25OZXdsaW5lO1xuICAgIGxldCBjb21tZW50ID0gJyc7XG4gICAgbGV0IGNvbW1lbnRTZXAgPSAnJztcbiAgICBsZXQgaGFzTmV3bGluZSA9IGZhbHNlO1xuICAgIGxldCByZXFTcGFjZSA9IGZhbHNlO1xuICAgIGxldCB0YWIgPSBudWxsO1xuICAgIGxldCBhbmNob3IgPSBudWxsO1xuICAgIGxldCB0YWcgPSBudWxsO1xuICAgIGxldCBuZXdsaW5lQWZ0ZXJQcm9wID0gbnVsbDtcbiAgICBsZXQgY29tbWEgPSBudWxsO1xuICAgIGxldCBmb3VuZCA9IG51bGw7XG4gICAgbGV0IHN0YXJ0ID0gbnVsbDtcbiAgICBmb3IgKGNvbnN0IHRva2VuIG9mIHRva2Vucykge1xuICAgICAgICBpZiAocmVxU3BhY2UpIHtcbiAgICAgICAgICAgIGlmICh0b2tlbi50eXBlICE9PSAnc3BhY2UnICYmXG4gICAgICAgICAgICAgICAgdG9rZW4udHlwZSAhPT0gJ25ld2xpbmUnICYmXG4gICAgICAgICAgICAgICAgdG9rZW4udHlwZSAhPT0gJ2NvbW1hJylcbiAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLm9mZnNldCwgJ01JU1NJTkdfQ0hBUicsICdUYWdzIGFuZCBhbmNob3JzIG11c3QgYmUgc2VwYXJhdGVkIGZyb20gdGhlIG5leHQgdG9rZW4gYnkgd2hpdGUgc3BhY2UnKTtcbiAgICAgICAgICAgIHJlcVNwYWNlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRhYikge1xuICAgICAgICAgICAgaWYgKGF0TmV3bGluZSAmJiB0b2tlbi50eXBlICE9PSAnY29tbWVudCcgJiYgdG9rZW4udHlwZSAhPT0gJ25ld2xpbmUnKSB7XG4gICAgICAgICAgICAgICAgb25FcnJvcih0YWIsICdUQUJfQVNfSU5ERU5UJywgJ1RhYnMgYXJlIG5vdCBhbGxvd2VkIGFzIGluZGVudGF0aW9uJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0YWIgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHN3aXRjaCAodG9rZW4udHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgICAgIC8vIEF0IHRoZSBkb2MgbGV2ZWwsIHRhYnMgYXQgbGluZSBzdGFydCBtYXkgYmUgcGFyc2VkXG4gICAgICAgICAgICAgICAgLy8gYXMgbGVhZGluZyB3aGl0ZSBzcGFjZSByYXRoZXIgdGhhbiBpbmRlbnRhdGlvbi5cbiAgICAgICAgICAgICAgICAvLyBJbiBhIGZsb3cgY29sbGVjdGlvbiwgb25seSB0aGUgcGFyc2VyIGhhbmRsZXMgaW5kZW50LlxuICAgICAgICAgICAgICAgIGlmICghZmxvdyAmJlxuICAgICAgICAgICAgICAgICAgICAoaW5kaWNhdG9yICE9PSAnZG9jLXN0YXJ0JyB8fCBuZXh0Py50eXBlICE9PSAnZmxvdy1jb2xsZWN0aW9uJykgJiZcbiAgICAgICAgICAgICAgICAgICAgdG9rZW4uc291cmNlLmluY2x1ZGVzKCdcXHQnKSkge1xuICAgICAgICAgICAgICAgICAgICB0YWIgPSB0b2tlbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaGFzU3BhY2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6IHtcbiAgICAgICAgICAgICAgICBpZiAoIWhhc1NwYWNlKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnTUlTU0lOR19DSEFSJywgJ0NvbW1lbnRzIG11c3QgYmUgc2VwYXJhdGVkIGZyb20gb3RoZXIgdG9rZW5zIGJ5IHdoaXRlIHNwYWNlIGNoYXJhY3RlcnMnKTtcbiAgICAgICAgICAgICAgICBjb25zdCBjYiA9IHRva2VuLnNvdXJjZS5zdWJzdHJpbmcoMSkgfHwgJyAnO1xuICAgICAgICAgICAgICAgIGlmICghY29tbWVudClcbiAgICAgICAgICAgICAgICAgICAgY29tbWVudCA9IGNiO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgY29tbWVudCArPSBjb21tZW50U2VwICsgY2I7XG4gICAgICAgICAgICAgICAgY29tbWVudFNlcCA9ICcnO1xuICAgICAgICAgICAgICAgIGF0TmV3bGluZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgICAgaWYgKGF0TmV3bGluZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29tbWVudClcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1lbnQgKz0gdG9rZW4uc291cmNlO1xuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICghZm91bmQgfHwgaW5kaWNhdG9yICE9PSAnc2VxLWl0ZW0taW5kJylcbiAgICAgICAgICAgICAgICAgICAgICAgIHNwYWNlQmVmb3JlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBjb21tZW50U2VwICs9IHRva2VuLnNvdXJjZTtcbiAgICAgICAgICAgICAgICBhdE5ld2xpbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGhhc05ld2xpbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGlmIChhbmNob3IgfHwgdGFnKVxuICAgICAgICAgICAgICAgICAgICBuZXdsaW5lQWZ0ZXJQcm9wID0gdG9rZW47XG4gICAgICAgICAgICAgICAgaGFzU3BhY2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYW5jaG9yJzpcbiAgICAgICAgICAgICAgICBpZiAoYW5jaG9yKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnTVVMVElQTEVfQU5DSE9SUycsICdBIG5vZGUgY2FuIGhhdmUgYXQgbW9zdCBvbmUgYW5jaG9yJyk7XG4gICAgICAgICAgICAgICAgaWYgKHRva2VuLnNvdXJjZS5lbmRzV2l0aCgnOicpKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLm9mZnNldCArIHRva2VuLnNvdXJjZS5sZW5ndGggLSAxLCAnQkFEX0FMSUFTJywgJ0FuY2hvciBlbmRpbmcgaW4gOiBpcyBhbWJpZ3VvdXMnLCB0cnVlKTtcbiAgICAgICAgICAgICAgICBhbmNob3IgPSB0b2tlbjtcbiAgICAgICAgICAgICAgICBzdGFydCA/PyAoc3RhcnQgPSB0b2tlbi5vZmZzZXQpO1xuICAgICAgICAgICAgICAgIGF0TmV3bGluZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGhhc1NwYWNlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgcmVxU3BhY2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAndGFnJzoge1xuICAgICAgICAgICAgICAgIGlmICh0YWcpXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdNVUxUSVBMRV9UQUdTJywgJ0Egbm9kZSBjYW4gaGF2ZSBhdCBtb3N0IG9uZSB0YWcnKTtcbiAgICAgICAgICAgICAgICB0YWcgPSB0b2tlbjtcbiAgICAgICAgICAgICAgICBzdGFydCA/PyAoc3RhcnQgPSB0b2tlbi5vZmZzZXQpO1xuICAgICAgICAgICAgICAgIGF0TmV3bGluZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGhhc1NwYWNlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgcmVxU3BhY2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBpbmRpY2F0b3I6XG4gICAgICAgICAgICAgICAgLy8gQ291bGQgaGVyZSBoYW5kbGUgcHJlY2VkaW5nIGNvbW1lbnRzIGRpZmZlcmVudGx5XG4gICAgICAgICAgICAgICAgaWYgKGFuY2hvciB8fCB0YWcpXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdCQURfUFJPUF9PUkRFUicsIGBBbmNob3JzIGFuZCB0YWdzIG11c3QgYmUgYWZ0ZXIgdGhlICR7dG9rZW4uc291cmNlfSBpbmRpY2F0b3JgKTtcbiAgICAgICAgICAgICAgICBpZiAoZm91bmQpXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdVTkVYUEVDVEVEX1RPS0VOJywgYFVuZXhwZWN0ZWQgJHt0b2tlbi5zb3VyY2V9IGluICR7ZmxvdyA/PyAnY29sbGVjdGlvbid9YCk7XG4gICAgICAgICAgICAgICAgZm91bmQgPSB0b2tlbjtcbiAgICAgICAgICAgICAgICBhdE5ld2xpbmUgPVxuICAgICAgICAgICAgICAgICAgICBpbmRpY2F0b3IgPT09ICdzZXEtaXRlbS1pbmQnIHx8IGluZGljYXRvciA9PT0gJ2V4cGxpY2l0LWtleS1pbmQnO1xuICAgICAgICAgICAgICAgIGhhc1NwYWNlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdjb21tYSc6XG4gICAgICAgICAgICAgICAgaWYgKGZsb3cpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbW1hKVxuICAgICAgICAgICAgICAgICAgICAgICAgb25FcnJvcih0b2tlbiwgJ1VORVhQRUNURURfVE9LRU4nLCBgVW5leHBlY3RlZCAsIGluICR7Zmxvd31gKTtcbiAgICAgICAgICAgICAgICAgICAgY29tbWEgPSB0b2tlbjtcbiAgICAgICAgICAgICAgICAgICAgYXROZXdsaW5lID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGhhc1NwYWNlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGVsc2UgZmFsbHRocm91Z2hcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgb25FcnJvcih0b2tlbiwgJ1VORVhQRUNURURfVE9LRU4nLCBgVW5leHBlY3RlZCAke3Rva2VuLnR5cGV9IHRva2VuYCk7XG4gICAgICAgICAgICAgICAgYXROZXdsaW5lID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaGFzU3BhY2UgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBsYXN0ID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXTtcbiAgICBjb25zdCBlbmQgPSBsYXN0ID8gbGFzdC5vZmZzZXQgKyBsYXN0LnNvdXJjZS5sZW5ndGggOiBvZmZzZXQ7XG4gICAgaWYgKHJlcVNwYWNlICYmXG4gICAgICAgIG5leHQgJiZcbiAgICAgICAgbmV4dC50eXBlICE9PSAnc3BhY2UnICYmXG4gICAgICAgIG5leHQudHlwZSAhPT0gJ25ld2xpbmUnICYmXG4gICAgICAgIG5leHQudHlwZSAhPT0gJ2NvbW1hJyAmJlxuICAgICAgICAobmV4dC50eXBlICE9PSAnc2NhbGFyJyB8fCBuZXh0LnNvdXJjZSAhPT0gJycpKSB7XG4gICAgICAgIG9uRXJyb3IobmV4dC5vZmZzZXQsICdNSVNTSU5HX0NIQVInLCAnVGFncyBhbmQgYW5jaG9ycyBtdXN0IGJlIHNlcGFyYXRlZCBmcm9tIHRoZSBuZXh0IHRva2VuIGJ5IHdoaXRlIHNwYWNlJyk7XG4gICAgfVxuICAgIGlmICh0YWIgJiZcbiAgICAgICAgKChhdE5ld2xpbmUgJiYgdGFiLmluZGVudCA8PSBwYXJlbnRJbmRlbnQpIHx8XG4gICAgICAgICAgICBuZXh0Py50eXBlID09PSAnYmxvY2stbWFwJyB8fFxuICAgICAgICAgICAgbmV4dD8udHlwZSA9PT0gJ2Jsb2NrLXNlcScpKVxuICAgICAgICBvbkVycm9yKHRhYiwgJ1RBQl9BU19JTkRFTlQnLCAnVGFicyBhcmUgbm90IGFsbG93ZWQgYXMgaW5kZW50YXRpb24nKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb21tYSxcbiAgICAgICAgZm91bmQsXG4gICAgICAgIHNwYWNlQmVmb3JlLFxuICAgICAgICBjb21tZW50LFxuICAgICAgICBoYXNOZXdsaW5lLFxuICAgICAgICBhbmNob3IsXG4gICAgICAgIHRhZyxcbiAgICAgICAgbmV3bGluZUFmdGVyUHJvcCxcbiAgICAgICAgZW5kLFxuICAgICAgICBzdGFydDogc3RhcnQgPz8gZW5kXG4gICAgfTtcbn1cblxuZXhwb3J0cy5yZXNvbHZlUHJvcHMgPSByZXNvbHZlUHJvcHM7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gY29udGFpbnNOZXdsaW5lKGtleSkge1xuICAgIGlmICgha2V5KVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICBzd2l0Y2ggKGtleS50eXBlKSB7XG4gICAgICAgIGNhc2UgJ2FsaWFzJzpcbiAgICAgICAgY2FzZSAnc2NhbGFyJzpcbiAgICAgICAgY2FzZSAnZG91YmxlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICBjYXNlICdzaW5nbGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgICAgICBpZiAoa2V5LnNvdXJjZS5pbmNsdWRlcygnXFxuJykpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICBpZiAoa2V5LmVuZClcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHN0IG9mIGtleS5lbmQpXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdC50eXBlID09PSAnbmV3bGluZScpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgY2FzZSAnZmxvdy1jb2xsZWN0aW9uJzpcbiAgICAgICAgICAgIGZvciAoY29uc3QgaXQgb2Yga2V5Lml0ZW1zKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBzdCBvZiBpdC5zdGFydClcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0LnR5cGUgPT09ICduZXdsaW5lJylcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIGlmIChpdC5zZXApXG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgc3Qgb2YgaXQuc2VwKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0LnR5cGUgPT09ICduZXdsaW5lJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpZiAoY29udGFpbnNOZXdsaW5lKGl0LmtleSkgfHwgY29udGFpbnNOZXdsaW5lKGl0LnZhbHVlKSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG59XG5cbmV4cG9ydHMuY29udGFpbnNOZXdsaW5lID0gY29udGFpbnNOZXdsaW5lO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlsQ29udGFpbnNOZXdsaW5lID0gcmVxdWlyZSgnLi91dGlsLWNvbnRhaW5zLW5ld2xpbmUuanMnKTtcblxuZnVuY3Rpb24gZmxvd0luZGVudENoZWNrKGluZGVudCwgZmMsIG9uRXJyb3IpIHtcbiAgICBpZiAoZmM/LnR5cGUgPT09ICdmbG93LWNvbGxlY3Rpb24nKSB7XG4gICAgICAgIGNvbnN0IGVuZCA9IGZjLmVuZFswXTtcbiAgICAgICAgaWYgKGVuZC5pbmRlbnQgPT09IGluZGVudCAmJlxuICAgICAgICAgICAgKGVuZC5zb3VyY2UgPT09ICddJyB8fCBlbmQuc291cmNlID09PSAnfScpICYmXG4gICAgICAgICAgICB1dGlsQ29udGFpbnNOZXdsaW5lLmNvbnRhaW5zTmV3bGluZShmYykpIHtcbiAgICAgICAgICAgIGNvbnN0IG1zZyA9ICdGbG93IGVuZCBpbmRpY2F0b3Igc2hvdWxkIGJlIG1vcmUgaW5kZW50ZWQgdGhhbiBwYXJlbnQnO1xuICAgICAgICAgICAgb25FcnJvcihlbmQsICdCQURfSU5ERU5UJywgbXNnLCB0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0cy5mbG93SW5kZW50Q2hlY2sgPSBmbG93SW5kZW50Q2hlY2s7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIGlkZW50aXR5ID0gcmVxdWlyZSgnLi4vbm9kZXMvaWRlbnRpdHkuanMnKTtcblxuZnVuY3Rpb24gbWFwSW5jbHVkZXMoY3R4LCBpdGVtcywgc2VhcmNoKSB7XG4gICAgY29uc3QgeyB1bmlxdWVLZXlzIH0gPSBjdHgub3B0aW9ucztcbiAgICBpZiAodW5pcXVlS2V5cyA9PT0gZmFsc2UpXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICBjb25zdCBpc0VxdWFsID0gdHlwZW9mIHVuaXF1ZUtleXMgPT09ICdmdW5jdGlvbidcbiAgICAgICAgPyB1bmlxdWVLZXlzXG4gICAgICAgIDogKGEsIGIpID0+IGEgPT09IGIgfHwgKGlkZW50aXR5LmlzU2NhbGFyKGEpICYmIGlkZW50aXR5LmlzU2NhbGFyKGIpICYmIGEudmFsdWUgPT09IGIudmFsdWUpO1xuICAgIHJldHVybiBpdGVtcy5zb21lKHBhaXIgPT4gaXNFcXVhbChwYWlyLmtleSwgc2VhcmNoKSk7XG59XG5cbmV4cG9ydHMubWFwSW5jbHVkZXMgPSBtYXBJbmNsdWRlcztcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgUGFpciA9IHJlcXVpcmUoJy4uL25vZGVzL1BhaXIuanMnKTtcbnZhciBZQU1MTWFwID0gcmVxdWlyZSgnLi4vbm9kZXMvWUFNTE1hcC5qcycpO1xudmFyIHJlc29sdmVQcm9wcyA9IHJlcXVpcmUoJy4vcmVzb2x2ZS1wcm9wcy5qcycpO1xudmFyIHV0aWxDb250YWluc05ld2xpbmUgPSByZXF1aXJlKCcuL3V0aWwtY29udGFpbnMtbmV3bGluZS5qcycpO1xudmFyIHV0aWxGbG93SW5kZW50Q2hlY2sgPSByZXF1aXJlKCcuL3V0aWwtZmxvdy1pbmRlbnQtY2hlY2suanMnKTtcbnZhciB1dGlsTWFwSW5jbHVkZXMgPSByZXF1aXJlKCcuL3V0aWwtbWFwLWluY2x1ZGVzLmpzJyk7XG5cbmNvbnN0IHN0YXJ0Q29sTXNnID0gJ0FsbCBtYXBwaW5nIGl0ZW1zIG11c3Qgc3RhcnQgYXQgdGhlIHNhbWUgY29sdW1uJztcbmZ1bmN0aW9uIHJlc29sdmVCbG9ja01hcCh7IGNvbXBvc2VOb2RlLCBjb21wb3NlRW1wdHlOb2RlIH0sIGN0eCwgYm0sIG9uRXJyb3IsIHRhZykge1xuICAgIGNvbnN0IE5vZGVDbGFzcyA9IHRhZz8ubm9kZUNsYXNzID8/IFlBTUxNYXAuWUFNTE1hcDtcbiAgICBjb25zdCBtYXAgPSBuZXcgTm9kZUNsYXNzKGN0eC5zY2hlbWEpO1xuICAgIGlmIChjdHguYXRSb290KVxuICAgICAgICBjdHguYXRSb290ID0gZmFsc2U7XG4gICAgbGV0IG9mZnNldCA9IGJtLm9mZnNldDtcbiAgICBsZXQgY29tbWVudEVuZCA9IG51bGw7XG4gICAgZm9yIChjb25zdCBjb2xsSXRlbSBvZiBibS5pdGVtcykge1xuICAgICAgICBjb25zdCB7IHN0YXJ0LCBrZXksIHNlcCwgdmFsdWUgfSA9IGNvbGxJdGVtO1xuICAgICAgICAvLyBrZXkgcHJvcGVydGllc1xuICAgICAgICBjb25zdCBrZXlQcm9wcyA9IHJlc29sdmVQcm9wcy5yZXNvbHZlUHJvcHMoc3RhcnQsIHtcbiAgICAgICAgICAgIGluZGljYXRvcjogJ2V4cGxpY2l0LWtleS1pbmQnLFxuICAgICAgICAgICAgbmV4dDoga2V5ID8/IHNlcD8uWzBdLFxuICAgICAgICAgICAgb2Zmc2V0LFxuICAgICAgICAgICAgb25FcnJvcixcbiAgICAgICAgICAgIHBhcmVudEluZGVudDogYm0uaW5kZW50LFxuICAgICAgICAgICAgc3RhcnRPbk5ld2xpbmU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGltcGxpY2l0S2V5ID0gIWtleVByb3BzLmZvdW5kO1xuICAgICAgICBpZiAoaW1wbGljaXRLZXkpIHtcbiAgICAgICAgICAgIGlmIChrZXkpIHtcbiAgICAgICAgICAgICAgICBpZiAoa2V5LnR5cGUgPT09ICdibG9jay1zZXEnKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKG9mZnNldCwgJ0JMT0NLX0FTX0lNUExJQ0lUX0tFWScsICdBIGJsb2NrIHNlcXVlbmNlIG1heSBub3QgYmUgdXNlZCBhcyBhbiBpbXBsaWNpdCBtYXAga2V5Jyk7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoJ2luZGVudCcgaW4ga2V5ICYmIGtleS5pbmRlbnQgIT09IGJtLmluZGVudClcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcihvZmZzZXQsICdCQURfSU5ERU5UJywgc3RhcnRDb2xNc2cpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFrZXlQcm9wcy5hbmNob3IgJiYgIWtleVByb3BzLnRhZyAmJiAhc2VwKSB7XG4gICAgICAgICAgICAgICAgY29tbWVudEVuZCA9IGtleVByb3BzLmVuZDtcbiAgICAgICAgICAgICAgICBpZiAoa2V5UHJvcHMuY29tbWVudCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobWFwLmNvbW1lbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXAuY29tbWVudCArPSAnXFxuJyArIGtleVByb3BzLmNvbW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5jb21tZW50ID0ga2V5UHJvcHMuY29tbWVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoa2V5UHJvcHMubmV3bGluZUFmdGVyUHJvcCB8fCB1dGlsQ29udGFpbnNOZXdsaW5lLmNvbnRhaW5zTmV3bGluZShrZXkpKSB7XG4gICAgICAgICAgICAgICAgb25FcnJvcihrZXkgPz8gc3RhcnRbc3RhcnQubGVuZ3RoIC0gMV0sICdNVUxUSUxJTkVfSU1QTElDSVRfS0VZJywgJ0ltcGxpY2l0IGtleXMgbmVlZCB0byBiZSBvbiBhIHNpbmdsZSBsaW5lJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoa2V5UHJvcHMuZm91bmQ/LmluZGVudCAhPT0gYm0uaW5kZW50KSB7XG4gICAgICAgICAgICBvbkVycm9yKG9mZnNldCwgJ0JBRF9JTkRFTlQnLCBzdGFydENvbE1zZyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8ga2V5IHZhbHVlXG4gICAgICAgIGN0eC5hdEtleSA9IHRydWU7XG4gICAgICAgIGNvbnN0IGtleVN0YXJ0ID0ga2V5UHJvcHMuZW5kO1xuICAgICAgICBjb25zdCBrZXlOb2RlID0ga2V5XG4gICAgICAgICAgICA/IGNvbXBvc2VOb2RlKGN0eCwga2V5LCBrZXlQcm9wcywgb25FcnJvcilcbiAgICAgICAgICAgIDogY29tcG9zZUVtcHR5Tm9kZShjdHgsIGtleVN0YXJ0LCBzdGFydCwgbnVsbCwga2V5UHJvcHMsIG9uRXJyb3IpO1xuICAgICAgICBpZiAoY3R4LnNjaGVtYS5jb21wYXQpXG4gICAgICAgICAgICB1dGlsRmxvd0luZGVudENoZWNrLmZsb3dJbmRlbnRDaGVjayhibS5pbmRlbnQsIGtleSwgb25FcnJvcik7XG4gICAgICAgIGN0eC5hdEtleSA9IGZhbHNlO1xuICAgICAgICBpZiAodXRpbE1hcEluY2x1ZGVzLm1hcEluY2x1ZGVzKGN0eCwgbWFwLml0ZW1zLCBrZXlOb2RlKSlcbiAgICAgICAgICAgIG9uRXJyb3Ioa2V5U3RhcnQsICdEVVBMSUNBVEVfS0VZJywgJ01hcCBrZXlzIG11c3QgYmUgdW5pcXVlJyk7XG4gICAgICAgIC8vIHZhbHVlIHByb3BlcnRpZXNcbiAgICAgICAgY29uc3QgdmFsdWVQcm9wcyA9IHJlc29sdmVQcm9wcy5yZXNvbHZlUHJvcHMoc2VwID8/IFtdLCB7XG4gICAgICAgICAgICBpbmRpY2F0b3I6ICdtYXAtdmFsdWUtaW5kJyxcbiAgICAgICAgICAgIG5leHQ6IHZhbHVlLFxuICAgICAgICAgICAgb2Zmc2V0OiBrZXlOb2RlLnJhbmdlWzJdLFxuICAgICAgICAgICAgb25FcnJvcixcbiAgICAgICAgICAgIHBhcmVudEluZGVudDogYm0uaW5kZW50LFxuICAgICAgICAgICAgc3RhcnRPbk5ld2xpbmU6ICFrZXkgfHwga2V5LnR5cGUgPT09ICdibG9jay1zY2FsYXInXG4gICAgICAgIH0pO1xuICAgICAgICBvZmZzZXQgPSB2YWx1ZVByb3BzLmVuZDtcbiAgICAgICAgaWYgKHZhbHVlUHJvcHMuZm91bmQpIHtcbiAgICAgICAgICAgIGlmIChpbXBsaWNpdEtleSkge1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZT8udHlwZSA9PT0gJ2Jsb2NrLW1hcCcgJiYgIXZhbHVlUHJvcHMuaGFzTmV3bGluZSlcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcihvZmZzZXQsICdCTE9DS19BU19JTVBMSUNJVF9LRVknLCAnTmVzdGVkIG1hcHBpbmdzIGFyZSBub3QgYWxsb3dlZCBpbiBjb21wYWN0IG1hcHBpbmdzJyk7XG4gICAgICAgICAgICAgICAgaWYgKGN0eC5vcHRpb25zLnN0cmljdCAmJlxuICAgICAgICAgICAgICAgICAgICBrZXlQcm9wcy5zdGFydCA8IHZhbHVlUHJvcHMuZm91bmQub2Zmc2V0IC0gMTAyNClcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcihrZXlOb2RlLnJhbmdlLCAnS0VZX09WRVJfMTAyNF9DSEFSUycsICdUaGUgOiBpbmRpY2F0b3IgbXVzdCBiZSBhdCBtb3N0IDEwMjQgY2hhcnMgYWZ0ZXIgdGhlIHN0YXJ0IG9mIGFuIGltcGxpY2l0IGJsb2NrIG1hcHBpbmcga2V5Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyB2YWx1ZSB2YWx1ZVxuICAgICAgICAgICAgY29uc3QgdmFsdWVOb2RlID0gdmFsdWVcbiAgICAgICAgICAgICAgICA/IGNvbXBvc2VOb2RlKGN0eCwgdmFsdWUsIHZhbHVlUHJvcHMsIG9uRXJyb3IpXG4gICAgICAgICAgICAgICAgOiBjb21wb3NlRW1wdHlOb2RlKGN0eCwgb2Zmc2V0LCBzZXAsIG51bGwsIHZhbHVlUHJvcHMsIG9uRXJyb3IpO1xuICAgICAgICAgICAgaWYgKGN0eC5zY2hlbWEuY29tcGF0KVxuICAgICAgICAgICAgICAgIHV0aWxGbG93SW5kZW50Q2hlY2suZmxvd0luZGVudENoZWNrKGJtLmluZGVudCwgdmFsdWUsIG9uRXJyb3IpO1xuICAgICAgICAgICAgb2Zmc2V0ID0gdmFsdWVOb2RlLnJhbmdlWzJdO1xuICAgICAgICAgICAgY29uc3QgcGFpciA9IG5ldyBQYWlyLlBhaXIoa2V5Tm9kZSwgdmFsdWVOb2RlKTtcbiAgICAgICAgICAgIGlmIChjdHgub3B0aW9ucy5rZWVwU291cmNlVG9rZW5zKVxuICAgICAgICAgICAgICAgIHBhaXIuc3JjVG9rZW4gPSBjb2xsSXRlbTtcbiAgICAgICAgICAgIG1hcC5pdGVtcy5wdXNoKHBhaXIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8ga2V5IHdpdGggbm8gdmFsdWVcbiAgICAgICAgICAgIGlmIChpbXBsaWNpdEtleSlcbiAgICAgICAgICAgICAgICBvbkVycm9yKGtleU5vZGUucmFuZ2UsICdNSVNTSU5HX0NIQVInLCAnSW1wbGljaXQgbWFwIGtleXMgbmVlZCB0byBiZSBmb2xsb3dlZCBieSBtYXAgdmFsdWVzJyk7XG4gICAgICAgICAgICBpZiAodmFsdWVQcm9wcy5jb21tZW50KSB7XG4gICAgICAgICAgICAgICAgaWYgKGtleU5vZGUuY29tbWVudClcbiAgICAgICAgICAgICAgICAgICAga2V5Tm9kZS5jb21tZW50ICs9ICdcXG4nICsgdmFsdWVQcm9wcy5jb21tZW50O1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAga2V5Tm9kZS5jb21tZW50ID0gdmFsdWVQcm9wcy5jb21tZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcGFpciA9IG5ldyBQYWlyLlBhaXIoa2V5Tm9kZSk7XG4gICAgICAgICAgICBpZiAoY3R4Lm9wdGlvbnMua2VlcFNvdXJjZVRva2VucylcbiAgICAgICAgICAgICAgICBwYWlyLnNyY1Rva2VuID0gY29sbEl0ZW07XG4gICAgICAgICAgICBtYXAuaXRlbXMucHVzaChwYWlyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoY29tbWVudEVuZCAmJiBjb21tZW50RW5kIDwgb2Zmc2V0KVxuICAgICAgICBvbkVycm9yKGNvbW1lbnRFbmQsICdJTVBPU1NJQkxFJywgJ01hcCBjb21tZW50IHdpdGggdHJhaWxpbmcgY29udGVudCcpO1xuICAgIG1hcC5yYW5nZSA9IFtibS5vZmZzZXQsIG9mZnNldCwgY29tbWVudEVuZCA/PyBvZmZzZXRdO1xuICAgIHJldHVybiBtYXA7XG59XG5cbmV4cG9ydHMucmVzb2x2ZUJsb2NrTWFwID0gcmVzb2x2ZUJsb2NrTWFwO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBZQU1MU2VxID0gcmVxdWlyZSgnLi4vbm9kZXMvWUFNTFNlcS5qcycpO1xudmFyIHJlc29sdmVQcm9wcyA9IHJlcXVpcmUoJy4vcmVzb2x2ZS1wcm9wcy5qcycpO1xudmFyIHV0aWxGbG93SW5kZW50Q2hlY2sgPSByZXF1aXJlKCcuL3V0aWwtZmxvdy1pbmRlbnQtY2hlY2suanMnKTtcblxuZnVuY3Rpb24gcmVzb2x2ZUJsb2NrU2VxKHsgY29tcG9zZU5vZGUsIGNvbXBvc2VFbXB0eU5vZGUgfSwgY3R4LCBicywgb25FcnJvciwgdGFnKSB7XG4gICAgY29uc3QgTm9kZUNsYXNzID0gdGFnPy5ub2RlQ2xhc3MgPz8gWUFNTFNlcS5ZQU1MU2VxO1xuICAgIGNvbnN0IHNlcSA9IG5ldyBOb2RlQ2xhc3MoY3R4LnNjaGVtYSk7XG4gICAgaWYgKGN0eC5hdFJvb3QpXG4gICAgICAgIGN0eC5hdFJvb3QgPSBmYWxzZTtcbiAgICBpZiAoY3R4LmF0S2V5KVxuICAgICAgICBjdHguYXRLZXkgPSBmYWxzZTtcbiAgICBsZXQgb2Zmc2V0ID0gYnMub2Zmc2V0O1xuICAgIGxldCBjb21tZW50RW5kID0gbnVsbDtcbiAgICBmb3IgKGNvbnN0IHsgc3RhcnQsIHZhbHVlIH0gb2YgYnMuaXRlbXMpIHtcbiAgICAgICAgY29uc3QgcHJvcHMgPSByZXNvbHZlUHJvcHMucmVzb2x2ZVByb3BzKHN0YXJ0LCB7XG4gICAgICAgICAgICBpbmRpY2F0b3I6ICdzZXEtaXRlbS1pbmQnLFxuICAgICAgICAgICAgbmV4dDogdmFsdWUsXG4gICAgICAgICAgICBvZmZzZXQsXG4gICAgICAgICAgICBvbkVycm9yLFxuICAgICAgICAgICAgcGFyZW50SW5kZW50OiBicy5pbmRlbnQsXG4gICAgICAgICAgICBzdGFydE9uTmV3bGluZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCFwcm9wcy5mb3VuZCkge1xuICAgICAgICAgICAgaWYgKHByb3BzLmFuY2hvciB8fCBwcm9wcy50YWcgfHwgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZiAodmFsdWU/LnR5cGUgPT09ICdibG9jay1zZXEnKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHByb3BzLmVuZCwgJ0JBRF9JTkRFTlQnLCAnQWxsIHNlcXVlbmNlIGl0ZW1zIG11c3Qgc3RhcnQgYXQgdGhlIHNhbWUgY29sdW1uJyk7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKG9mZnNldCwgJ01JU1NJTkdfQ0hBUicsICdTZXF1ZW5jZSBpdGVtIHdpdGhvdXQgLSBpbmRpY2F0b3InKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbW1lbnRFbmQgPSBwcm9wcy5lbmQ7XG4gICAgICAgICAgICAgICAgaWYgKHByb3BzLmNvbW1lbnQpXG4gICAgICAgICAgICAgICAgICAgIHNlcS5jb21tZW50ID0gcHJvcHMuY29tbWVudDtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBub2RlID0gdmFsdWVcbiAgICAgICAgICAgID8gY29tcG9zZU5vZGUoY3R4LCB2YWx1ZSwgcHJvcHMsIG9uRXJyb3IpXG4gICAgICAgICAgICA6IGNvbXBvc2VFbXB0eU5vZGUoY3R4LCBwcm9wcy5lbmQsIHN0YXJ0LCBudWxsLCBwcm9wcywgb25FcnJvcik7XG4gICAgICAgIGlmIChjdHguc2NoZW1hLmNvbXBhdClcbiAgICAgICAgICAgIHV0aWxGbG93SW5kZW50Q2hlY2suZmxvd0luZGVudENoZWNrKGJzLmluZGVudCwgdmFsdWUsIG9uRXJyb3IpO1xuICAgICAgICBvZmZzZXQgPSBub2RlLnJhbmdlWzJdO1xuICAgICAgICBzZXEuaXRlbXMucHVzaChub2RlKTtcbiAgICB9XG4gICAgc2VxLnJhbmdlID0gW2JzLm9mZnNldCwgb2Zmc2V0LCBjb21tZW50RW5kID8/IG9mZnNldF07XG4gICAgcmV0dXJuIHNlcTtcbn1cblxuZXhwb3J0cy5yZXNvbHZlQmxvY2tTZXEgPSByZXNvbHZlQmxvY2tTZXE7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gcmVzb2x2ZUVuZChlbmQsIG9mZnNldCwgcmVxU3BhY2UsIG9uRXJyb3IpIHtcbiAgICBsZXQgY29tbWVudCA9ICcnO1xuICAgIGlmIChlbmQpIHtcbiAgICAgICAgbGV0IGhhc1NwYWNlID0gZmFsc2U7XG4gICAgICAgIGxldCBzZXAgPSAnJztcbiAgICAgICAgZm9yIChjb25zdCB0b2tlbiBvZiBlbmQpIHtcbiAgICAgICAgICAgIGNvbnN0IHsgc291cmNlLCB0eXBlIH0gPSB0b2tlbjtcbiAgICAgICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcbiAgICAgICAgICAgICAgICAgICAgaGFzU3BhY2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdjb21tZW50Jzoge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVxU3BhY2UgJiYgIWhhc1NwYWNlKVxuICAgICAgICAgICAgICAgICAgICAgICAgb25FcnJvcih0b2tlbiwgJ01JU1NJTkdfQ0hBUicsICdDb21tZW50cyBtdXN0IGJlIHNlcGFyYXRlZCBmcm9tIG90aGVyIHRva2VucyBieSB3aGl0ZSBzcGFjZSBjaGFyYWN0ZXJzJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNiID0gc291cmNlLnN1YnN0cmluZygxKSB8fCAnICc7XG4gICAgICAgICAgICAgICAgICAgIGlmICghY29tbWVudClcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1lbnQgPSBjYjtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgY29tbWVudCArPSBzZXAgKyBjYjtcbiAgICAgICAgICAgICAgICAgICAgc2VwID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbW1lbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXAgKz0gc291cmNlO1xuICAgICAgICAgICAgICAgICAgICBoYXNTcGFjZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdVTkVYUEVDVEVEX1RPS0VOJywgYFVuZXhwZWN0ZWQgJHt0eXBlfSBhdCBub2RlIGVuZGApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb2Zmc2V0ICs9IHNvdXJjZS5sZW5ndGg7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHsgY29tbWVudCwgb2Zmc2V0IH07XG59XG5cbmV4cG9ydHMucmVzb2x2ZUVuZCA9IHJlc29sdmVFbmQ7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIGlkZW50aXR5ID0gcmVxdWlyZSgnLi4vbm9kZXMvaWRlbnRpdHkuanMnKTtcbnZhciBQYWlyID0gcmVxdWlyZSgnLi4vbm9kZXMvUGFpci5qcycpO1xudmFyIFlBTUxNYXAgPSByZXF1aXJlKCcuLi9ub2Rlcy9ZQU1MTWFwLmpzJyk7XG52YXIgWUFNTFNlcSA9IHJlcXVpcmUoJy4uL25vZGVzL1lBTUxTZXEuanMnKTtcbnZhciByZXNvbHZlRW5kID0gcmVxdWlyZSgnLi9yZXNvbHZlLWVuZC5qcycpO1xudmFyIHJlc29sdmVQcm9wcyA9IHJlcXVpcmUoJy4vcmVzb2x2ZS1wcm9wcy5qcycpO1xudmFyIHV0aWxDb250YWluc05ld2xpbmUgPSByZXF1aXJlKCcuL3V0aWwtY29udGFpbnMtbmV3bGluZS5qcycpO1xudmFyIHV0aWxNYXBJbmNsdWRlcyA9IHJlcXVpcmUoJy4vdXRpbC1tYXAtaW5jbHVkZXMuanMnKTtcblxuY29uc3QgYmxvY2tNc2cgPSAnQmxvY2sgY29sbGVjdGlvbnMgYXJlIG5vdCBhbGxvd2VkIHdpdGhpbiBmbG93IGNvbGxlY3Rpb25zJztcbmNvbnN0IGlzQmxvY2sgPSAodG9rZW4pID0+IHRva2VuICYmICh0b2tlbi50eXBlID09PSAnYmxvY2stbWFwJyB8fCB0b2tlbi50eXBlID09PSAnYmxvY2stc2VxJyk7XG5mdW5jdGlvbiByZXNvbHZlRmxvd0NvbGxlY3Rpb24oeyBjb21wb3NlTm9kZSwgY29tcG9zZUVtcHR5Tm9kZSB9LCBjdHgsIGZjLCBvbkVycm9yLCB0YWcpIHtcbiAgICBjb25zdCBpc01hcCA9IGZjLnN0YXJ0LnNvdXJjZSA9PT0gJ3snO1xuICAgIGNvbnN0IGZjTmFtZSA9IGlzTWFwID8gJ2Zsb3cgbWFwJyA6ICdmbG93IHNlcXVlbmNlJztcbiAgICBjb25zdCBOb2RlQ2xhc3MgPSAodGFnPy5ub2RlQ2xhc3MgPz8gKGlzTWFwID8gWUFNTE1hcC5ZQU1MTWFwIDogWUFNTFNlcS5ZQU1MU2VxKSk7XG4gICAgY29uc3QgY29sbCA9IG5ldyBOb2RlQ2xhc3MoY3R4LnNjaGVtYSk7XG4gICAgY29sbC5mbG93ID0gdHJ1ZTtcbiAgICBjb25zdCBhdFJvb3QgPSBjdHguYXRSb290O1xuICAgIGlmIChhdFJvb3QpXG4gICAgICAgIGN0eC5hdFJvb3QgPSBmYWxzZTtcbiAgICBpZiAoY3R4LmF0S2V5KVxuICAgICAgICBjdHguYXRLZXkgPSBmYWxzZTtcbiAgICBsZXQgb2Zmc2V0ID0gZmMub2Zmc2V0ICsgZmMuc3RhcnQuc291cmNlLmxlbmd0aDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZjLml0ZW1zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGNvbnN0IGNvbGxJdGVtID0gZmMuaXRlbXNbaV07XG4gICAgICAgIGNvbnN0IHsgc3RhcnQsIGtleSwgc2VwLCB2YWx1ZSB9ID0gY29sbEl0ZW07XG4gICAgICAgIGNvbnN0IHByb3BzID0gcmVzb2x2ZVByb3BzLnJlc29sdmVQcm9wcyhzdGFydCwge1xuICAgICAgICAgICAgZmxvdzogZmNOYW1lLFxuICAgICAgICAgICAgaW5kaWNhdG9yOiAnZXhwbGljaXQta2V5LWluZCcsXG4gICAgICAgICAgICBuZXh0OiBrZXkgPz8gc2VwPy5bMF0sXG4gICAgICAgICAgICBvZmZzZXQsXG4gICAgICAgICAgICBvbkVycm9yLFxuICAgICAgICAgICAgcGFyZW50SW5kZW50OiBmYy5pbmRlbnQsXG4gICAgICAgICAgICBzdGFydE9uTmV3bGluZTogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICghcHJvcHMuZm91bmQpIHtcbiAgICAgICAgICAgIGlmICghcHJvcHMuYW5jaG9yICYmICFwcm9wcy50YWcgJiYgIXNlcCAmJiAhdmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoaSA9PT0gMCAmJiBwcm9wcy5jb21tYSlcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcihwcm9wcy5jb21tYSwgJ1VORVhQRUNURURfVE9LRU4nLCBgVW5leHBlY3RlZCAsIGluICR7ZmNOYW1lfWApO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGkgPCBmYy5pdGVtcy5sZW5ndGggLSAxKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHByb3BzLnN0YXJ0LCAnVU5FWFBFQ1RFRF9UT0tFTicsIGBVbmV4cGVjdGVkIGVtcHR5IGl0ZW0gaW4gJHtmY05hbWV9YCk7XG4gICAgICAgICAgICAgICAgaWYgKHByb3BzLmNvbW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbGwuY29tbWVudClcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbGwuY29tbWVudCArPSAnXFxuJyArIHByb3BzLmNvbW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbGwuY29tbWVudCA9IHByb3BzLmNvbW1lbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG9mZnNldCA9IHByb3BzLmVuZDtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaXNNYXAgJiYgY3R4Lm9wdGlvbnMuc3RyaWN0ICYmIHV0aWxDb250YWluc05ld2xpbmUuY29udGFpbnNOZXdsaW5lKGtleSkpXG4gICAgICAgICAgICAgICAgb25FcnJvcihrZXksIC8vIGNoZWNrZWQgYnkgY29udGFpbnNOZXdsaW5lKClcbiAgICAgICAgICAgICAgICAnTVVMVElMSU5FX0lNUExJQ0lUX0tFWScsICdJbXBsaWNpdCBrZXlzIG9mIGZsb3cgc2VxdWVuY2UgcGFpcnMgbmVlZCB0byBiZSBvbiBhIHNpbmdsZSBsaW5lJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGkgPT09IDApIHtcbiAgICAgICAgICAgIGlmIChwcm9wcy5jb21tYSlcbiAgICAgICAgICAgICAgICBvbkVycm9yKHByb3BzLmNvbW1hLCAnVU5FWFBFQ1RFRF9UT0tFTicsIGBVbmV4cGVjdGVkICwgaW4gJHtmY05hbWV9YCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoIXByb3BzLmNvbW1hKVxuICAgICAgICAgICAgICAgIG9uRXJyb3IocHJvcHMuc3RhcnQsICdNSVNTSU5HX0NIQVInLCBgTWlzc2luZyAsIGJldHdlZW4gJHtmY05hbWV9IGl0ZW1zYCk7XG4gICAgICAgICAgICBpZiAocHJvcHMuY29tbWVudCkge1xuICAgICAgICAgICAgICAgIGxldCBwcmV2SXRlbUNvbW1lbnQgPSAnJztcbiAgICAgICAgICAgICAgICBsb29wOiBmb3IgKGNvbnN0IHN0IG9mIHN0YXJ0KSB7XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoc3QudHlwZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnY29tbWEnOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJldkl0ZW1Db21tZW50ID0gc3Quc291cmNlLnN1YnN0cmluZygxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhayBsb29wO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhayBsb29wO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChwcmV2SXRlbUNvbW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHByZXYgPSBjb2xsLml0ZW1zW2NvbGwuaXRlbXMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChpZGVudGl0eS5pc1BhaXIocHJldikpXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2ID0gcHJldi52YWx1ZSA/PyBwcmV2LmtleTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByZXYuY29tbWVudClcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXYuY29tbWVudCArPSAnXFxuJyArIHByZXZJdGVtQ29tbWVudDtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldi5jb21tZW50ID0gcHJldkl0ZW1Db21tZW50O1xuICAgICAgICAgICAgICAgICAgICBwcm9wcy5jb21tZW50ID0gcHJvcHMuY29tbWVudC5zdWJzdHJpbmcocHJldkl0ZW1Db21tZW50Lmxlbmd0aCArIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIWlzTWFwICYmICFzZXAgJiYgIXByb3BzLmZvdW5kKSB7XG4gICAgICAgICAgICAvLyBpdGVtIGlzIGEgdmFsdWUgaW4gYSBzZXFcbiAgICAgICAgICAgIC8vIOKGkiBrZXkgJiBzZXAgYXJlIGVtcHR5LCBzdGFydCBkb2VzIG5vdCBpbmNsdWRlID8gb3IgOlxuICAgICAgICAgICAgY29uc3QgdmFsdWVOb2RlID0gdmFsdWVcbiAgICAgICAgICAgICAgICA/IGNvbXBvc2VOb2RlKGN0eCwgdmFsdWUsIHByb3BzLCBvbkVycm9yKVxuICAgICAgICAgICAgICAgIDogY29tcG9zZUVtcHR5Tm9kZShjdHgsIHByb3BzLmVuZCwgc2VwLCBudWxsLCBwcm9wcywgb25FcnJvcik7XG4gICAgICAgICAgICBjb2xsLml0ZW1zLnB1c2godmFsdWVOb2RlKTtcbiAgICAgICAgICAgIG9mZnNldCA9IHZhbHVlTm9kZS5yYW5nZVsyXTtcbiAgICAgICAgICAgIGlmIChpc0Jsb2NrKHZhbHVlKSlcbiAgICAgICAgICAgICAgICBvbkVycm9yKHZhbHVlTm9kZS5yYW5nZSwgJ0JMT0NLX0lOX0ZMT1cnLCBibG9ja01zZyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBpdGVtIGlzIGEga2V5K3ZhbHVlIHBhaXJcbiAgICAgICAgICAgIC8vIGtleSB2YWx1ZVxuICAgICAgICAgICAgY3R4LmF0S2V5ID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbnN0IGtleVN0YXJ0ID0gcHJvcHMuZW5kO1xuICAgICAgICAgICAgY29uc3Qga2V5Tm9kZSA9IGtleVxuICAgICAgICAgICAgICAgID8gY29tcG9zZU5vZGUoY3R4LCBrZXksIHByb3BzLCBvbkVycm9yKVxuICAgICAgICAgICAgICAgIDogY29tcG9zZUVtcHR5Tm9kZShjdHgsIGtleVN0YXJ0LCBzdGFydCwgbnVsbCwgcHJvcHMsIG9uRXJyb3IpO1xuICAgICAgICAgICAgaWYgKGlzQmxvY2soa2V5KSlcbiAgICAgICAgICAgICAgICBvbkVycm9yKGtleU5vZGUucmFuZ2UsICdCTE9DS19JTl9GTE9XJywgYmxvY2tNc2cpO1xuICAgICAgICAgICAgY3R4LmF0S2V5ID0gZmFsc2U7XG4gICAgICAgICAgICAvLyB2YWx1ZSBwcm9wZXJ0aWVzXG4gICAgICAgICAgICBjb25zdCB2YWx1ZVByb3BzID0gcmVzb2x2ZVByb3BzLnJlc29sdmVQcm9wcyhzZXAgPz8gW10sIHtcbiAgICAgICAgICAgICAgICBmbG93OiBmY05hbWUsXG4gICAgICAgICAgICAgICAgaW5kaWNhdG9yOiAnbWFwLXZhbHVlLWluZCcsXG4gICAgICAgICAgICAgICAgbmV4dDogdmFsdWUsXG4gICAgICAgICAgICAgICAgb2Zmc2V0OiBrZXlOb2RlLnJhbmdlWzJdLFxuICAgICAgICAgICAgICAgIG9uRXJyb3IsXG4gICAgICAgICAgICAgICAgcGFyZW50SW5kZW50OiBmYy5pbmRlbnQsXG4gICAgICAgICAgICAgICAgc3RhcnRPbk5ld2xpbmU6IGZhbHNlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmICh2YWx1ZVByb3BzLmZvdW5kKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc01hcCAmJiAhcHJvcHMuZm91bmQgJiYgY3R4Lm9wdGlvbnMuc3RyaWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzZXApXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHN0IG9mIHNlcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdCA9PT0gdmFsdWVQcm9wcy5mb3VuZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0LnR5cGUgPT09ICduZXdsaW5lJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHN0LCAnTVVMVElMSU5FX0lNUExJQ0lUX0tFWScsICdJbXBsaWNpdCBrZXlzIG9mIGZsb3cgc2VxdWVuY2UgcGFpcnMgbmVlZCB0byBiZSBvbiBhIHNpbmdsZSBsaW5lJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHByb3BzLnN0YXJ0IDwgdmFsdWVQcm9wcy5mb3VuZC5vZmZzZXQgLSAxMDI0KVxuICAgICAgICAgICAgICAgICAgICAgICAgb25FcnJvcih2YWx1ZVByb3BzLmZvdW5kLCAnS0VZX09WRVJfMTAyNF9DSEFSUycsICdUaGUgOiBpbmRpY2F0b3IgbXVzdCBiZSBhdCBtb3N0IDEwMjQgY2hhcnMgYWZ0ZXIgdGhlIHN0YXJ0IG9mIGFuIGltcGxpY2l0IGZsb3cgc2VxdWVuY2Uga2V5Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoJ3NvdXJjZScgaW4gdmFsdWUgJiYgdmFsdWUuc291cmNlPy5bMF0gPT09ICc6JylcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcih2YWx1ZSwgJ01JU1NJTkdfQ0hBUicsIGBNaXNzaW5nIHNwYWNlIGFmdGVyIDogaW4gJHtmY05hbWV9YCk7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHZhbHVlUHJvcHMuc3RhcnQsICdNSVNTSU5HX0NIQVInLCBgTWlzc2luZyAsIG9yIDogYmV0d2VlbiAke2ZjTmFtZX0gaXRlbXNgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHZhbHVlIHZhbHVlXG4gICAgICAgICAgICBjb25zdCB2YWx1ZU5vZGUgPSB2YWx1ZVxuICAgICAgICAgICAgICAgID8gY29tcG9zZU5vZGUoY3R4LCB2YWx1ZSwgdmFsdWVQcm9wcywgb25FcnJvcilcbiAgICAgICAgICAgICAgICA6IHZhbHVlUHJvcHMuZm91bmRcbiAgICAgICAgICAgICAgICAgICAgPyBjb21wb3NlRW1wdHlOb2RlKGN0eCwgdmFsdWVQcm9wcy5lbmQsIHNlcCwgbnVsbCwgdmFsdWVQcm9wcywgb25FcnJvcilcbiAgICAgICAgICAgICAgICAgICAgOiBudWxsO1xuICAgICAgICAgICAgaWYgKHZhbHVlTm9kZSkge1xuICAgICAgICAgICAgICAgIGlmIChpc0Jsb2NrKHZhbHVlKSlcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcih2YWx1ZU5vZGUucmFuZ2UsICdCTE9DS19JTl9GTE9XJywgYmxvY2tNc2cpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodmFsdWVQcm9wcy5jb21tZW50KSB7XG4gICAgICAgICAgICAgICAgaWYgKGtleU5vZGUuY29tbWVudClcbiAgICAgICAgICAgICAgICAgICAga2V5Tm9kZS5jb21tZW50ICs9ICdcXG4nICsgdmFsdWVQcm9wcy5jb21tZW50O1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAga2V5Tm9kZS5jb21tZW50ID0gdmFsdWVQcm9wcy5jb21tZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcGFpciA9IG5ldyBQYWlyLlBhaXIoa2V5Tm9kZSwgdmFsdWVOb2RlKTtcbiAgICAgICAgICAgIGlmIChjdHgub3B0aW9ucy5rZWVwU291cmNlVG9rZW5zKVxuICAgICAgICAgICAgICAgIHBhaXIuc3JjVG9rZW4gPSBjb2xsSXRlbTtcbiAgICAgICAgICAgIGlmIChpc01hcCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1hcCA9IGNvbGw7XG4gICAgICAgICAgICAgICAgaWYgKHV0aWxNYXBJbmNsdWRlcy5tYXBJbmNsdWRlcyhjdHgsIG1hcC5pdGVtcywga2V5Tm9kZSkpXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3Ioa2V5U3RhcnQsICdEVVBMSUNBVEVfS0VZJywgJ01hcCBrZXlzIG11c3QgYmUgdW5pcXVlJyk7XG4gICAgICAgICAgICAgICAgbWFwLml0ZW1zLnB1c2gocGFpcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXAgPSBuZXcgWUFNTE1hcC5ZQU1MTWFwKGN0eC5zY2hlbWEpO1xuICAgICAgICAgICAgICAgIG1hcC5mbG93ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBtYXAuaXRlbXMucHVzaChwYWlyKTtcbiAgICAgICAgICAgICAgICBjb25zdCBlbmRSYW5nZSA9ICh2YWx1ZU5vZGUgPz8ga2V5Tm9kZSkucmFuZ2U7XG4gICAgICAgICAgICAgICAgbWFwLnJhbmdlID0gW2tleU5vZGUucmFuZ2VbMF0sIGVuZFJhbmdlWzFdLCBlbmRSYW5nZVsyXV07XG4gICAgICAgICAgICAgICAgY29sbC5pdGVtcy5wdXNoKG1hcCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvZmZzZXQgPSB2YWx1ZU5vZGUgPyB2YWx1ZU5vZGUucmFuZ2VbMl0gOiB2YWx1ZVByb3BzLmVuZDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBleHBlY3RlZEVuZCA9IGlzTWFwID8gJ30nIDogJ10nO1xuICAgIGNvbnN0IFtjZSwgLi4uZWVdID0gZmMuZW5kO1xuICAgIGxldCBjZVBvcyA9IG9mZnNldDtcbiAgICBpZiAoY2U/LnNvdXJjZSA9PT0gZXhwZWN0ZWRFbmQpXG4gICAgICAgIGNlUG9zID0gY2Uub2Zmc2V0ICsgY2Uuc291cmNlLmxlbmd0aDtcbiAgICBlbHNlIHtcbiAgICAgICAgY29uc3QgbmFtZSA9IGZjTmFtZVswXS50b1VwcGVyQ2FzZSgpICsgZmNOYW1lLnN1YnN0cmluZygxKTtcbiAgICAgICAgY29uc3QgbXNnID0gYXRSb290XG4gICAgICAgICAgICA/IGAke25hbWV9IG11c3QgZW5kIHdpdGggYSAke2V4cGVjdGVkRW5kfWBcbiAgICAgICAgICAgIDogYCR7bmFtZX0gaW4gYmxvY2sgY29sbGVjdGlvbiBtdXN0IGJlIHN1ZmZpY2llbnRseSBpbmRlbnRlZCBhbmQgZW5kIHdpdGggYSAke2V4cGVjdGVkRW5kfWA7XG4gICAgICAgIG9uRXJyb3Iob2Zmc2V0LCBhdFJvb3QgPyAnTUlTU0lOR19DSEFSJyA6ICdCQURfSU5ERU5UJywgbXNnKTtcbiAgICAgICAgaWYgKGNlICYmIGNlLnNvdXJjZS5sZW5ndGggIT09IDEpXG4gICAgICAgICAgICBlZS51bnNoaWZ0KGNlKTtcbiAgICB9XG4gICAgaWYgKGVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgZW5kID0gcmVzb2x2ZUVuZC5yZXNvbHZlRW5kKGVlLCBjZVBvcywgY3R4Lm9wdGlvbnMuc3RyaWN0LCBvbkVycm9yKTtcbiAgICAgICAgaWYgKGVuZC5jb21tZW50KSB7XG4gICAgICAgICAgICBpZiAoY29sbC5jb21tZW50KVxuICAgICAgICAgICAgICAgIGNvbGwuY29tbWVudCArPSAnXFxuJyArIGVuZC5jb21tZW50O1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGNvbGwuY29tbWVudCA9IGVuZC5jb21tZW50O1xuICAgICAgICB9XG4gICAgICAgIGNvbGwucmFuZ2UgPSBbZmMub2Zmc2V0LCBjZVBvcywgZW5kLm9mZnNldF07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjb2xsLnJhbmdlID0gW2ZjLm9mZnNldCwgY2VQb3MsIGNlUG9zXTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbGw7XG59XG5cbmV4cG9ydHMucmVzb2x2ZUZsb3dDb2xsZWN0aW9uID0gcmVzb2x2ZUZsb3dDb2xsZWN0aW9uO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBpZGVudGl0eSA9IHJlcXVpcmUoJy4uL25vZGVzL2lkZW50aXR5LmpzJyk7XG52YXIgU2NhbGFyID0gcmVxdWlyZSgnLi4vbm9kZXMvU2NhbGFyLmpzJyk7XG52YXIgWUFNTE1hcCA9IHJlcXVpcmUoJy4uL25vZGVzL1lBTUxNYXAuanMnKTtcbnZhciBZQU1MU2VxID0gcmVxdWlyZSgnLi4vbm9kZXMvWUFNTFNlcS5qcycpO1xudmFyIHJlc29sdmVCbG9ja01hcCA9IHJlcXVpcmUoJy4vcmVzb2x2ZS1ibG9jay1tYXAuanMnKTtcbnZhciByZXNvbHZlQmxvY2tTZXEgPSByZXF1aXJlKCcuL3Jlc29sdmUtYmxvY2stc2VxLmpzJyk7XG52YXIgcmVzb2x2ZUZsb3dDb2xsZWN0aW9uID0gcmVxdWlyZSgnLi9yZXNvbHZlLWZsb3ctY29sbGVjdGlvbi5qcycpO1xuXG5mdW5jdGlvbiByZXNvbHZlQ29sbGVjdGlvbihDTiwgY3R4LCB0b2tlbiwgb25FcnJvciwgdGFnTmFtZSwgdGFnKSB7XG4gICAgY29uc3QgY29sbCA9IHRva2VuLnR5cGUgPT09ICdibG9jay1tYXAnXG4gICAgICAgID8gcmVzb2x2ZUJsb2NrTWFwLnJlc29sdmVCbG9ja01hcChDTiwgY3R4LCB0b2tlbiwgb25FcnJvciwgdGFnKVxuICAgICAgICA6IHRva2VuLnR5cGUgPT09ICdibG9jay1zZXEnXG4gICAgICAgICAgICA/IHJlc29sdmVCbG9ja1NlcS5yZXNvbHZlQmxvY2tTZXEoQ04sIGN0eCwgdG9rZW4sIG9uRXJyb3IsIHRhZylcbiAgICAgICAgICAgIDogcmVzb2x2ZUZsb3dDb2xsZWN0aW9uLnJlc29sdmVGbG93Q29sbGVjdGlvbihDTiwgY3R4LCB0b2tlbiwgb25FcnJvciwgdGFnKTtcbiAgICBjb25zdCBDb2xsID0gY29sbC5jb25zdHJ1Y3RvcjtcbiAgICAvLyBJZiB3ZSBnb3QgYSB0YWdOYW1lIG1hdGNoaW5nIHRoZSBjbGFzcywgb3IgdGhlIHRhZyBuYW1lIGlzICchJyxcbiAgICAvLyB0aGVuIHVzZSB0aGUgdGFnTmFtZSBmcm9tIHRoZSBub2RlIGNsYXNzIHVzZWQgdG8gY3JlYXRlIGl0LlxuICAgIGlmICh0YWdOYW1lID09PSAnIScgfHwgdGFnTmFtZSA9PT0gQ29sbC50YWdOYW1lKSB7XG4gICAgICAgIGNvbGwudGFnID0gQ29sbC50YWdOYW1lO1xuICAgICAgICByZXR1cm4gY29sbDtcbiAgICB9XG4gICAgaWYgKHRhZ05hbWUpXG4gICAgICAgIGNvbGwudGFnID0gdGFnTmFtZTtcbiAgICByZXR1cm4gY29sbDtcbn1cbmZ1bmN0aW9uIGNvbXBvc2VDb2xsZWN0aW9uKENOLCBjdHgsIHRva2VuLCBwcm9wcywgb25FcnJvcikge1xuICAgIGNvbnN0IHRhZ1Rva2VuID0gcHJvcHMudGFnO1xuICAgIGNvbnN0IHRhZ05hbWUgPSAhdGFnVG9rZW5cbiAgICAgICAgPyBudWxsXG4gICAgICAgIDogY3R4LmRpcmVjdGl2ZXMudGFnTmFtZSh0YWdUb2tlbi5zb3VyY2UsIG1zZyA9PiBvbkVycm9yKHRhZ1Rva2VuLCAnVEFHX1JFU09MVkVfRkFJTEVEJywgbXNnKSk7XG4gICAgaWYgKHRva2VuLnR5cGUgPT09ICdibG9jay1zZXEnKSB7XG4gICAgICAgIGNvbnN0IHsgYW5jaG9yLCBuZXdsaW5lQWZ0ZXJQcm9wOiBubCB9ID0gcHJvcHM7XG4gICAgICAgIGNvbnN0IGxhc3RQcm9wID0gYW5jaG9yICYmIHRhZ1Rva2VuXG4gICAgICAgICAgICA/IGFuY2hvci5vZmZzZXQgPiB0YWdUb2tlbi5vZmZzZXRcbiAgICAgICAgICAgICAgICA/IGFuY2hvclxuICAgICAgICAgICAgICAgIDogdGFnVG9rZW5cbiAgICAgICAgICAgIDogKGFuY2hvciA/PyB0YWdUb2tlbik7XG4gICAgICAgIGlmIChsYXN0UHJvcCAmJiAoIW5sIHx8IG5sLm9mZnNldCA8IGxhc3RQcm9wLm9mZnNldCkpIHtcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSAnTWlzc2luZyBuZXdsaW5lIGFmdGVyIGJsb2NrIHNlcXVlbmNlIHByb3BzJztcbiAgICAgICAgICAgIG9uRXJyb3IobGFzdFByb3AsICdNSVNTSU5HX0NIQVInLCBtZXNzYWdlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBleHBUeXBlID0gdG9rZW4udHlwZSA9PT0gJ2Jsb2NrLW1hcCdcbiAgICAgICAgPyAnbWFwJ1xuICAgICAgICA6IHRva2VuLnR5cGUgPT09ICdibG9jay1zZXEnXG4gICAgICAgICAgICA/ICdzZXEnXG4gICAgICAgICAgICA6IHRva2VuLnN0YXJ0LnNvdXJjZSA9PT0gJ3snXG4gICAgICAgICAgICAgICAgPyAnbWFwJ1xuICAgICAgICAgICAgICAgIDogJ3NlcSc7XG4gICAgLy8gc2hvcnRjdXQ6IGNoZWNrIGlmIGl0J3MgYSBnZW5lcmljIFlBTUxNYXAgb3IgWUFNTFNlcVxuICAgIC8vIGJlZm9yZSBqdW1waW5nIGludG8gdGhlIGN1c3RvbSB0YWcgbG9naWMuXG4gICAgaWYgKCF0YWdUb2tlbiB8fFxuICAgICAgICAhdGFnTmFtZSB8fFxuICAgICAgICB0YWdOYW1lID09PSAnIScgfHxcbiAgICAgICAgKHRhZ05hbWUgPT09IFlBTUxNYXAuWUFNTE1hcC50YWdOYW1lICYmIGV4cFR5cGUgPT09ICdtYXAnKSB8fFxuICAgICAgICAodGFnTmFtZSA9PT0gWUFNTFNlcS5ZQU1MU2VxLnRhZ05hbWUgJiYgZXhwVHlwZSA9PT0gJ3NlcScpKSB7XG4gICAgICAgIHJldHVybiByZXNvbHZlQ29sbGVjdGlvbihDTiwgY3R4LCB0b2tlbiwgb25FcnJvciwgdGFnTmFtZSk7XG4gICAgfVxuICAgIGxldCB0YWcgPSBjdHguc2NoZW1hLnRhZ3MuZmluZCh0ID0+IHQudGFnID09PSB0YWdOYW1lICYmIHQuY29sbGVjdGlvbiA9PT0gZXhwVHlwZSk7XG4gICAgaWYgKCF0YWcpIHtcbiAgICAgICAgY29uc3Qga3QgPSBjdHguc2NoZW1hLmtub3duVGFnc1t0YWdOYW1lXTtcbiAgICAgICAgaWYgKGt0Py5jb2xsZWN0aW9uID09PSBleHBUeXBlKSB7XG4gICAgICAgICAgICBjdHguc2NoZW1hLnRhZ3MucHVzaChPYmplY3QuYXNzaWduKHt9LCBrdCwgeyBkZWZhdWx0OiBmYWxzZSB9KSk7XG4gICAgICAgICAgICB0YWcgPSBrdDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChrdCkge1xuICAgICAgICAgICAgICAgIG9uRXJyb3IodGFnVG9rZW4sICdCQURfQ09MTEVDVElPTl9UWVBFJywgYCR7a3QudGFnfSB1c2VkIGZvciAke2V4cFR5cGV9IGNvbGxlY3Rpb24sIGJ1dCBleHBlY3RzICR7a3QuY29sbGVjdGlvbiA/PyAnc2NhbGFyJ31gLCB0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIG9uRXJyb3IodGFnVG9rZW4sICdUQUdfUkVTT0xWRV9GQUlMRUQnLCBgVW5yZXNvbHZlZCB0YWc6ICR7dGFnTmFtZX1gLCB0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlQ29sbGVjdGlvbihDTiwgY3R4LCB0b2tlbiwgb25FcnJvciwgdGFnTmFtZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgY29sbCA9IHJlc29sdmVDb2xsZWN0aW9uKENOLCBjdHgsIHRva2VuLCBvbkVycm9yLCB0YWdOYW1lLCB0YWcpO1xuICAgIGNvbnN0IHJlcyA9IHRhZy5yZXNvbHZlPy4oY29sbCwgbXNnID0+IG9uRXJyb3IodGFnVG9rZW4sICdUQUdfUkVTT0xWRV9GQUlMRUQnLCBtc2cpLCBjdHgub3B0aW9ucykgPz8gY29sbDtcbiAgICBjb25zdCBub2RlID0gaWRlbnRpdHkuaXNOb2RlKHJlcylcbiAgICAgICAgPyByZXNcbiAgICAgICAgOiBuZXcgU2NhbGFyLlNjYWxhcihyZXMpO1xuICAgIG5vZGUucmFuZ2UgPSBjb2xsLnJhbmdlO1xuICAgIG5vZGUudGFnID0gdGFnTmFtZTtcbiAgICBpZiAodGFnPy5mb3JtYXQpXG4gICAgICAgIG5vZGUuZm9ybWF0ID0gdGFnLmZvcm1hdDtcbiAgICByZXR1cm4gbm9kZTtcbn1cblxuZXhwb3J0cy5jb21wb3NlQ29sbGVjdGlvbiA9IGNvbXBvc2VDb2xsZWN0aW9uO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBTY2FsYXIgPSByZXF1aXJlKCcuLi9ub2Rlcy9TY2FsYXIuanMnKTtcblxuZnVuY3Rpb24gcmVzb2x2ZUJsb2NrU2NhbGFyKGN0eCwgc2NhbGFyLCBvbkVycm9yKSB7XG4gICAgY29uc3Qgc3RhcnQgPSBzY2FsYXIub2Zmc2V0O1xuICAgIGNvbnN0IGhlYWRlciA9IHBhcnNlQmxvY2tTY2FsYXJIZWFkZXIoc2NhbGFyLCBjdHgub3B0aW9ucy5zdHJpY3QsIG9uRXJyb3IpO1xuICAgIGlmICghaGVhZGVyKVxuICAgICAgICByZXR1cm4geyB2YWx1ZTogJycsIHR5cGU6IG51bGwsIGNvbW1lbnQ6ICcnLCByYW5nZTogW3N0YXJ0LCBzdGFydCwgc3RhcnRdIH07XG4gICAgY29uc3QgdHlwZSA9IGhlYWRlci5tb2RlID09PSAnPicgPyBTY2FsYXIuU2NhbGFyLkJMT0NLX0ZPTERFRCA6IFNjYWxhci5TY2FsYXIuQkxPQ0tfTElURVJBTDtcbiAgICBjb25zdCBsaW5lcyA9IHNjYWxhci5zb3VyY2UgPyBzcGxpdExpbmVzKHNjYWxhci5zb3VyY2UpIDogW107XG4gICAgLy8gZGV0ZXJtaW5lIHRoZSBlbmQgb2YgY29udGVudCAmIHN0YXJ0IG9mIGNob21waW5nXG4gICAgbGV0IGNob21wU3RhcnQgPSBsaW5lcy5sZW5ndGg7XG4gICAgZm9yIChsZXQgaSA9IGxpbmVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBsaW5lc1tpXVsxXTtcbiAgICAgICAgaWYgKGNvbnRlbnQgPT09ICcnIHx8IGNvbnRlbnQgPT09ICdcXHInKVxuICAgICAgICAgICAgY2hvbXBTdGFydCA9IGk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICAvLyBzaG9ydGN1dCBmb3IgZW1wdHkgY29udGVudHNcbiAgICBpZiAoY2hvbXBTdGFydCA9PT0gMCkge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGhlYWRlci5jaG9tcCA9PT0gJysnICYmIGxpbmVzLmxlbmd0aCA+IDBcbiAgICAgICAgICAgID8gJ1xcbicucmVwZWF0KE1hdGgubWF4KDEsIGxpbmVzLmxlbmd0aCAtIDEpKVxuICAgICAgICAgICAgOiAnJztcbiAgICAgICAgbGV0IGVuZCA9IHN0YXJ0ICsgaGVhZGVyLmxlbmd0aDtcbiAgICAgICAgaWYgKHNjYWxhci5zb3VyY2UpXG4gICAgICAgICAgICBlbmQgKz0gc2NhbGFyLnNvdXJjZS5sZW5ndGg7XG4gICAgICAgIHJldHVybiB7IHZhbHVlLCB0eXBlLCBjb21tZW50OiBoZWFkZXIuY29tbWVudCwgcmFuZ2U6IFtzdGFydCwgZW5kLCBlbmRdIH07XG4gICAgfVxuICAgIC8vIGZpbmQgdGhlIGluZGVudGF0aW9uIGxldmVsIHRvIHRyaW0gZnJvbSBzdGFydFxuICAgIGxldCB0cmltSW5kZW50ID0gc2NhbGFyLmluZGVudCArIGhlYWRlci5pbmRlbnQ7XG4gICAgbGV0IG9mZnNldCA9IHNjYWxhci5vZmZzZXQgKyBoZWFkZXIubGVuZ3RoO1xuICAgIGxldCBjb250ZW50U3RhcnQgPSAwO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hvbXBTdGFydDsgKytpKSB7XG4gICAgICAgIGNvbnN0IFtpbmRlbnQsIGNvbnRlbnRdID0gbGluZXNbaV07XG4gICAgICAgIGlmIChjb250ZW50ID09PSAnJyB8fCBjb250ZW50ID09PSAnXFxyJykge1xuICAgICAgICAgICAgaWYgKGhlYWRlci5pbmRlbnQgPT09IDAgJiYgaW5kZW50Lmxlbmd0aCA+IHRyaW1JbmRlbnQpXG4gICAgICAgICAgICAgICAgdHJpbUluZGVudCA9IGluZGVudC5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoaW5kZW50Lmxlbmd0aCA8IHRyaW1JbmRlbnQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gJ0Jsb2NrIHNjYWxhcnMgd2l0aCBtb3JlLWluZGVudGVkIGxlYWRpbmcgZW1wdHkgbGluZXMgbXVzdCB1c2UgYW4gZXhwbGljaXQgaW5kZW50YXRpb24gaW5kaWNhdG9yJztcbiAgICAgICAgICAgICAgICBvbkVycm9yKG9mZnNldCArIGluZGVudC5sZW5ndGgsICdNSVNTSU5HX0NIQVInLCBtZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChoZWFkZXIuaW5kZW50ID09PSAwKVxuICAgICAgICAgICAgICAgIHRyaW1JbmRlbnQgPSBpbmRlbnQubGVuZ3RoO1xuICAgICAgICAgICAgY29udGVudFN0YXJ0ID0gaTtcbiAgICAgICAgICAgIGlmICh0cmltSW5kZW50ID09PSAwICYmICFjdHguYXRSb290KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9ICdCbG9jayBzY2FsYXIgdmFsdWVzIGluIGNvbGxlY3Rpb25zIG11c3QgYmUgaW5kZW50ZWQnO1xuICAgICAgICAgICAgICAgIG9uRXJyb3Iob2Zmc2V0LCAnQkFEX0lOREVOVCcsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgb2Zmc2V0ICs9IGluZGVudC5sZW5ndGggKyBjb250ZW50Lmxlbmd0aCArIDE7XG4gICAgfVxuICAgIC8vIGluY2x1ZGUgdHJhaWxpbmcgbW9yZS1pbmRlbnRlZCBlbXB0eSBsaW5lcyBpbiBjb250ZW50XG4gICAgZm9yIChsZXQgaSA9IGxpbmVzLmxlbmd0aCAtIDE7IGkgPj0gY2hvbXBTdGFydDsgLS1pKSB7XG4gICAgICAgIGlmIChsaW5lc1tpXVswXS5sZW5ndGggPiB0cmltSW5kZW50KVxuICAgICAgICAgICAgY2hvbXBTdGFydCA9IGkgKyAxO1xuICAgIH1cbiAgICBsZXQgdmFsdWUgPSAnJztcbiAgICBsZXQgc2VwID0gJyc7XG4gICAgbGV0IHByZXZNb3JlSW5kZW50ZWQgPSBmYWxzZTtcbiAgICAvLyBsZWFkaW5nIHdoaXRlc3BhY2UgaXMga2VwdCBpbnRhY3RcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbnRlbnRTdGFydDsgKytpKVxuICAgICAgICB2YWx1ZSArPSBsaW5lc1tpXVswXS5zbGljZSh0cmltSW5kZW50KSArICdcXG4nO1xuICAgIGZvciAobGV0IGkgPSBjb250ZW50U3RhcnQ7IGkgPCBjaG9tcFN0YXJ0OyArK2kpIHtcbiAgICAgICAgbGV0IFtpbmRlbnQsIGNvbnRlbnRdID0gbGluZXNbaV07XG4gICAgICAgIG9mZnNldCArPSBpbmRlbnQubGVuZ3RoICsgY29udGVudC5sZW5ndGggKyAxO1xuICAgICAgICBjb25zdCBjcmxmID0gY29udGVudFtjb250ZW50Lmxlbmd0aCAtIDFdID09PSAnXFxyJztcbiAgICAgICAgaWYgKGNybGYpXG4gICAgICAgICAgICBjb250ZW50ID0gY29udGVudC5zbGljZSgwLCAtMSk7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiBhbHJlYWR5IGNhdWdodCBpbiBsZXhlciAqL1xuICAgICAgICBpZiAoY29udGVudCAmJiBpbmRlbnQubGVuZ3RoIDwgdHJpbUluZGVudCkge1xuICAgICAgICAgICAgY29uc3Qgc3JjID0gaGVhZGVyLmluZGVudFxuICAgICAgICAgICAgICAgID8gJ2V4cGxpY2l0IGluZGVudGF0aW9uIGluZGljYXRvcidcbiAgICAgICAgICAgICAgICA6ICdmaXJzdCBsaW5lJztcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBgQmxvY2sgc2NhbGFyIGxpbmVzIG11c3Qgbm90IGJlIGxlc3MgaW5kZW50ZWQgdGhhbiB0aGVpciAke3NyY31gO1xuICAgICAgICAgICAgb25FcnJvcihvZmZzZXQgLSBjb250ZW50Lmxlbmd0aCAtIChjcmxmID8gMiA6IDEpLCAnQkFEX0lOREVOVCcsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgaW5kZW50ID0gJyc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGUgPT09IFNjYWxhci5TY2FsYXIuQkxPQ0tfTElURVJBTCkge1xuICAgICAgICAgICAgdmFsdWUgKz0gc2VwICsgaW5kZW50LnNsaWNlKHRyaW1JbmRlbnQpICsgY29udGVudDtcbiAgICAgICAgICAgIHNlcCA9ICdcXG4nO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGluZGVudC5sZW5ndGggPiB0cmltSW5kZW50IHx8IGNvbnRlbnRbMF0gPT09ICdcXHQnKSB7XG4gICAgICAgICAgICAvLyBtb3JlLWluZGVudGVkIGNvbnRlbnQgd2l0aGluIGEgZm9sZGVkIGJsb2NrXG4gICAgICAgICAgICBpZiAoc2VwID09PSAnICcpXG4gICAgICAgICAgICAgICAgc2VwID0gJ1xcbic7XG4gICAgICAgICAgICBlbHNlIGlmICghcHJldk1vcmVJbmRlbnRlZCAmJiBzZXAgPT09ICdcXG4nKVxuICAgICAgICAgICAgICAgIHNlcCA9ICdcXG5cXG4nO1xuICAgICAgICAgICAgdmFsdWUgKz0gc2VwICsgaW5kZW50LnNsaWNlKHRyaW1JbmRlbnQpICsgY29udGVudDtcbiAgICAgICAgICAgIHNlcCA9ICdcXG4nO1xuICAgICAgICAgICAgcHJldk1vcmVJbmRlbnRlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoY29udGVudCA9PT0gJycpIHtcbiAgICAgICAgICAgIC8vIGVtcHR5IGxpbmVcbiAgICAgICAgICAgIGlmIChzZXAgPT09ICdcXG4nKVxuICAgICAgICAgICAgICAgIHZhbHVlICs9ICdcXG4nO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHNlcCA9ICdcXG4nO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFsdWUgKz0gc2VwICsgY29udGVudDtcbiAgICAgICAgICAgIHNlcCA9ICcgJztcbiAgICAgICAgICAgIHByZXZNb3JlSW5kZW50ZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzd2l0Y2ggKGhlYWRlci5jaG9tcCkge1xuICAgICAgICBjYXNlICctJzpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICcrJzpcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBjaG9tcFN0YXJ0OyBpIDwgbGluZXMubGVuZ3RoOyArK2kpXG4gICAgICAgICAgICAgICAgdmFsdWUgKz0gJ1xcbicgKyBsaW5lc1tpXVswXS5zbGljZSh0cmltSW5kZW50KTtcbiAgICAgICAgICAgIGlmICh2YWx1ZVt2YWx1ZS5sZW5ndGggLSAxXSAhPT0gJ1xcbicpXG4gICAgICAgICAgICAgICAgdmFsdWUgKz0gJ1xcbic7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHZhbHVlICs9ICdcXG4nO1xuICAgIH1cbiAgICBjb25zdCBlbmQgPSBzdGFydCArIGhlYWRlci5sZW5ndGggKyBzY2FsYXIuc291cmNlLmxlbmd0aDtcbiAgICByZXR1cm4geyB2YWx1ZSwgdHlwZSwgY29tbWVudDogaGVhZGVyLmNvbW1lbnQsIHJhbmdlOiBbc3RhcnQsIGVuZCwgZW5kXSB9O1xufVxuZnVuY3Rpb24gcGFyc2VCbG9ja1NjYWxhckhlYWRlcih7IG9mZnNldCwgcHJvcHMgfSwgc3RyaWN0LCBvbkVycm9yKSB7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmIHNob3VsZCBub3QgaGFwcGVuICovXG4gICAgaWYgKHByb3BzWzBdLnR5cGUgIT09ICdibG9jay1zY2FsYXItaGVhZGVyJykge1xuICAgICAgICBvbkVycm9yKHByb3BzWzBdLCAnSU1QT1NTSUJMRScsICdCbG9jayBzY2FsYXIgaGVhZGVyIG5vdCBmb3VuZCcpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgeyBzb3VyY2UgfSA9IHByb3BzWzBdO1xuICAgIGNvbnN0IG1vZGUgPSBzb3VyY2VbMF07XG4gICAgbGV0IGluZGVudCA9IDA7XG4gICAgbGV0IGNob21wID0gJyc7XG4gICAgbGV0IGVycm9yID0gLTE7XG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPCBzb3VyY2UubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgY29uc3QgY2ggPSBzb3VyY2VbaV07XG4gICAgICAgIGlmICghY2hvbXAgJiYgKGNoID09PSAnLScgfHwgY2ggPT09ICcrJykpXG4gICAgICAgICAgICBjaG9tcCA9IGNoO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IG4gPSBOdW1iZXIoY2gpO1xuICAgICAgICAgICAgaWYgKCFpbmRlbnQgJiYgbilcbiAgICAgICAgICAgICAgICBpbmRlbnQgPSBuO1xuICAgICAgICAgICAgZWxzZSBpZiAoZXJyb3IgPT09IC0xKVxuICAgICAgICAgICAgICAgIGVycm9yID0gb2Zmc2V0ICsgaTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoZXJyb3IgIT09IC0xKVxuICAgICAgICBvbkVycm9yKGVycm9yLCAnVU5FWFBFQ1RFRF9UT0tFTicsIGBCbG9jayBzY2FsYXIgaGVhZGVyIGluY2x1ZGVzIGV4dHJhIGNoYXJhY3RlcnM6ICR7c291cmNlfWApO1xuICAgIGxldCBoYXNTcGFjZSA9IGZhbHNlO1xuICAgIGxldCBjb21tZW50ID0gJyc7XG4gICAgbGV0IGxlbmd0aCA9IHNvdXJjZS5sZW5ndGg7XG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPCBwcm9wcy5sZW5ndGg7ICsraSkge1xuICAgICAgICBjb25zdCB0b2tlbiA9IHByb3BzW2ldO1xuICAgICAgICBzd2l0Y2ggKHRva2VuLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcbiAgICAgICAgICAgICAgICBoYXNTcGFjZSA9IHRydWU7XG4gICAgICAgICAgICAvLyBmYWxsdGhyb3VnaFxuICAgICAgICAgICAgY2FzZSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgICAgbGVuZ3RoICs9IHRva2VuLnNvdXJjZS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgICAgICAgICBpZiAoc3RyaWN0ICYmICFoYXNTcGFjZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gJ0NvbW1lbnRzIG11c3QgYmUgc2VwYXJhdGVkIGZyb20gb3RoZXIgdG9rZW5zIGJ5IHdoaXRlIHNwYWNlIGNoYXJhY3RlcnMnO1xuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnTUlTU0lOR19DSEFSJywgbWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxlbmd0aCArPSB0b2tlbi5zb3VyY2UubGVuZ3RoO1xuICAgICAgICAgICAgICAgIGNvbW1lbnQgPSB0b2tlbi5zb3VyY2Uuc3Vic3RyaW5nKDEpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZXJyb3InOlxuICAgICAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdVTkVYUEVDVEVEX1RPS0VOJywgdG9rZW4ubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgbGVuZ3RoICs9IHRva2VuLnNvdXJjZS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCBzaG91bGQgbm90IGhhcHBlbiAqL1xuICAgICAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBgVW5leHBlY3RlZCB0b2tlbiBpbiBibG9jayBzY2FsYXIgaGVhZGVyOiAke3Rva2VuLnR5cGV9YDtcbiAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnVU5FWFBFQ1RFRF9UT0tFTicsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRzID0gdG9rZW4uc291cmNlO1xuICAgICAgICAgICAgICAgIGlmICh0cyAmJiB0eXBlb2YgdHMgPT09ICdzdHJpbmcnKVxuICAgICAgICAgICAgICAgICAgICBsZW5ndGggKz0gdHMubGVuZ3RoO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7IG1vZGUsIGluZGVudCwgY2hvbXAsIGNvbW1lbnQsIGxlbmd0aCB9O1xufVxuLyoqIEByZXR1cm5zIEFycmF5IG9mIGxpbmVzIHNwbGl0IHVwIGFzIGBbaW5kZW50LCBjb250ZW50XWAgKi9cbmZ1bmN0aW9uIHNwbGl0TGluZXMoc291cmNlKSB7XG4gICAgY29uc3Qgc3BsaXQgPSBzb3VyY2Uuc3BsaXQoL1xcbiggKikvKTtcbiAgICBjb25zdCBmaXJzdCA9IHNwbGl0WzBdO1xuICAgIGNvbnN0IG0gPSBmaXJzdC5tYXRjaCgvXiggKikvKTtcbiAgICBjb25zdCBsaW5lMCA9IG0/LlsxXVxuICAgICAgICA/IFttWzFdLCBmaXJzdC5zbGljZShtWzFdLmxlbmd0aCldXG4gICAgICAgIDogWycnLCBmaXJzdF07XG4gICAgY29uc3QgbGluZXMgPSBbbGluZTBdO1xuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgc3BsaXQubGVuZ3RoOyBpICs9IDIpXG4gICAgICAgIGxpbmVzLnB1c2goW3NwbGl0W2ldLCBzcGxpdFtpICsgMV1dKTtcbiAgICByZXR1cm4gbGluZXM7XG59XG5cbmV4cG9ydHMucmVzb2x2ZUJsb2NrU2NhbGFyID0gcmVzb2x2ZUJsb2NrU2NhbGFyO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBTY2FsYXIgPSByZXF1aXJlKCcuLi9ub2Rlcy9TY2FsYXIuanMnKTtcbnZhciByZXNvbHZlRW5kID0gcmVxdWlyZSgnLi9yZXNvbHZlLWVuZC5qcycpO1xuXG5mdW5jdGlvbiByZXNvbHZlRmxvd1NjYWxhcihzY2FsYXIsIHN0cmljdCwgb25FcnJvcikge1xuICAgIGNvbnN0IHsgb2Zmc2V0LCB0eXBlLCBzb3VyY2UsIGVuZCB9ID0gc2NhbGFyO1xuICAgIGxldCBfdHlwZTtcbiAgICBsZXQgdmFsdWU7XG4gICAgY29uc3QgX29uRXJyb3IgPSAocmVsLCBjb2RlLCBtc2cpID0+IG9uRXJyb3Iob2Zmc2V0ICsgcmVsLCBjb2RlLCBtc2cpO1xuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICBjYXNlICdzY2FsYXInOlxuICAgICAgICAgICAgX3R5cGUgPSBTY2FsYXIuU2NhbGFyLlBMQUlOO1xuICAgICAgICAgICAgdmFsdWUgPSBwbGFpblZhbHVlKHNvdXJjZSwgX29uRXJyb3IpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3NpbmdsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgICAgIF90eXBlID0gU2NhbGFyLlNjYWxhci5RVU9URV9TSU5HTEU7XG4gICAgICAgICAgICB2YWx1ZSA9IHNpbmdsZVF1b3RlZFZhbHVlKHNvdXJjZSwgX29uRXJyb3IpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2RvdWJsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgICAgIF90eXBlID0gU2NhbGFyLlNjYWxhci5RVU9URV9ET1VCTEU7XG4gICAgICAgICAgICB2YWx1ZSA9IGRvdWJsZVF1b3RlZFZhbHVlKHNvdXJjZSwgX29uRXJyb3IpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0IHNob3VsZCBub3QgaGFwcGVuICovXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBvbkVycm9yKHNjYWxhciwgJ1VORVhQRUNURURfVE9LRU4nLCBgRXhwZWN0ZWQgYSBmbG93IHNjYWxhciB2YWx1ZSwgYnV0IGZvdW5kOiAke3R5cGV9YCk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHZhbHVlOiAnJyxcbiAgICAgICAgICAgICAgICB0eXBlOiBudWxsLFxuICAgICAgICAgICAgICAgIGNvbW1lbnQ6ICcnLFxuICAgICAgICAgICAgICAgIHJhbmdlOiBbb2Zmc2V0LCBvZmZzZXQgKyBzb3VyY2UubGVuZ3RoLCBvZmZzZXQgKyBzb3VyY2UubGVuZ3RoXVxuICAgICAgICAgICAgfTtcbiAgICB9XG4gICAgY29uc3QgdmFsdWVFbmQgPSBvZmZzZXQgKyBzb3VyY2UubGVuZ3RoO1xuICAgIGNvbnN0IHJlID0gcmVzb2x2ZUVuZC5yZXNvbHZlRW5kKGVuZCwgdmFsdWVFbmQsIHN0cmljdCwgb25FcnJvcik7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmFsdWUsXG4gICAgICAgIHR5cGU6IF90eXBlLFxuICAgICAgICBjb21tZW50OiByZS5jb21tZW50LFxuICAgICAgICByYW5nZTogW29mZnNldCwgdmFsdWVFbmQsIHJlLm9mZnNldF1cbiAgICB9O1xufVxuZnVuY3Rpb24gcGxhaW5WYWx1ZShzb3VyY2UsIG9uRXJyb3IpIHtcbiAgICBsZXQgYmFkQ2hhciA9ICcnO1xuICAgIHN3aXRjaCAoc291cmNlWzBdKSB7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0IHNob3VsZCBub3QgaGFwcGVuICovXG4gICAgICAgIGNhc2UgJ1xcdCc6XG4gICAgICAgICAgICBiYWRDaGFyID0gJ2EgdGFiIGNoYXJhY3Rlcic7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnLCc6XG4gICAgICAgICAgICBiYWRDaGFyID0gJ2Zsb3cgaW5kaWNhdG9yIGNoYXJhY3RlciAsJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICclJzpcbiAgICAgICAgICAgIGJhZENoYXIgPSAnZGlyZWN0aXZlIGluZGljYXRvciBjaGFyYWN0ZXIgJSc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnfCc6XG4gICAgICAgIGNhc2UgJz4nOiB7XG4gICAgICAgICAgICBiYWRDaGFyID0gYGJsb2NrIHNjYWxhciBpbmRpY2F0b3IgJHtzb3VyY2VbMF19YDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ0AnOlxuICAgICAgICBjYXNlICdgJzoge1xuICAgICAgICAgICAgYmFkQ2hhciA9IGByZXNlcnZlZCBjaGFyYWN0ZXIgJHtzb3VyY2VbMF19YDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChiYWRDaGFyKVxuICAgICAgICBvbkVycm9yKDAsICdCQURfU0NBTEFSX1NUQVJUJywgYFBsYWluIHZhbHVlIGNhbm5vdCBzdGFydCB3aXRoICR7YmFkQ2hhcn1gKTtcbiAgICByZXR1cm4gZm9sZExpbmVzKHNvdXJjZSk7XG59XG5mdW5jdGlvbiBzaW5nbGVRdW90ZWRWYWx1ZShzb3VyY2UsIG9uRXJyb3IpIHtcbiAgICBpZiAoc291cmNlW3NvdXJjZS5sZW5ndGggLSAxXSAhPT0gXCInXCIgfHwgc291cmNlLmxlbmd0aCA9PT0gMSlcbiAgICAgICAgb25FcnJvcihzb3VyY2UubGVuZ3RoLCAnTUlTU0lOR19DSEFSJywgXCJNaXNzaW5nIGNsb3NpbmcgJ3F1b3RlXCIpO1xuICAgIHJldHVybiBmb2xkTGluZXMoc291cmNlLnNsaWNlKDEsIC0xKSkucmVwbGFjZSgvJycvZywgXCInXCIpO1xufVxuZnVuY3Rpb24gZm9sZExpbmVzKHNvdXJjZSkge1xuICAgIC8qKlxuICAgICAqIFRoZSBuZWdhdGl2ZSBsb29rYmVoaW5kIGhlcmUgYW5kIGluIHRoZSBgcmVgIFJlZ0V4cCBpcyB0b1xuICAgICAqIHByZXZlbnQgY2F1c2luZyBhIHBvbHlub21pYWwgc2VhcmNoIHRpbWUgaW4gY2VydGFpbiBjYXNlcy5cbiAgICAgKlxuICAgICAqIFRoZSB0cnktY2F0Y2ggaXMgZm9yIFNhZmFyaSwgd2hpY2ggZG9lc24ndCBzdXBwb3J0IHRoaXMgeWV0OlxuICAgICAqIGh0dHBzOi8vY2FuaXVzZS5jb20vanMtcmVnZXhwLWxvb2tiZWhpbmRcbiAgICAgKi9cbiAgICBsZXQgZmlyc3QsIGxpbmU7XG4gICAgdHJ5IHtcbiAgICAgICAgZmlyc3QgPSBuZXcgUmVnRXhwKCcoLio/KSg/PCFbIFxcdF0pWyBcXHRdKlxccj9cXG4nLCAnc3knKTtcbiAgICAgICAgbGluZSA9IG5ldyBSZWdFeHAoJ1sgXFx0XSooLio/KSg/Oig/PCFbIFxcdF0pWyBcXHRdKik/XFxyP1xcbicsICdzeScpO1xuICAgIH1cbiAgICBjYXRjaCB7XG4gICAgICAgIGZpcnN0ID0gLyguKj8pWyBcXHRdKlxccj9cXG4vc3k7XG4gICAgICAgIGxpbmUgPSAvWyBcXHRdKiguKj8pWyBcXHRdKlxccj9cXG4vc3k7XG4gICAgfVxuICAgIGxldCBtYXRjaCA9IGZpcnN0LmV4ZWMoc291cmNlKTtcbiAgICBpZiAoIW1hdGNoKVxuICAgICAgICByZXR1cm4gc291cmNlO1xuICAgIGxldCByZXMgPSBtYXRjaFsxXTtcbiAgICBsZXQgc2VwID0gJyAnO1xuICAgIGxldCBwb3MgPSBmaXJzdC5sYXN0SW5kZXg7XG4gICAgbGluZS5sYXN0SW5kZXggPSBwb3M7XG4gICAgd2hpbGUgKChtYXRjaCA9IGxpbmUuZXhlYyhzb3VyY2UpKSkge1xuICAgICAgICBpZiAobWF0Y2hbMV0gPT09ICcnKSB7XG4gICAgICAgICAgICBpZiAoc2VwID09PSAnXFxuJylcbiAgICAgICAgICAgICAgICByZXMgKz0gc2VwO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHNlcCA9ICdcXG4nO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmVzICs9IHNlcCArIG1hdGNoWzFdO1xuICAgICAgICAgICAgc2VwID0gJyAnO1xuICAgICAgICB9XG4gICAgICAgIHBvcyA9IGxpbmUubGFzdEluZGV4O1xuICAgIH1cbiAgICBjb25zdCBsYXN0ID0gL1sgXFx0XSooLiopL3N5O1xuICAgIGxhc3QubGFzdEluZGV4ID0gcG9zO1xuICAgIG1hdGNoID0gbGFzdC5leGVjKHNvdXJjZSk7XG4gICAgcmV0dXJuIHJlcyArIHNlcCArIChtYXRjaD8uWzFdID8/ICcnKTtcbn1cbmZ1bmN0aW9uIGRvdWJsZVF1b3RlZFZhbHVlKHNvdXJjZSwgb25FcnJvcikge1xuICAgIGxldCByZXMgPSAnJztcbiAgICBmb3IgKGxldCBpID0gMTsgaSA8IHNvdXJjZS5sZW5ndGggLSAxOyArK2kpIHtcbiAgICAgICAgY29uc3QgY2ggPSBzb3VyY2VbaV07XG4gICAgICAgIGlmIChjaCA9PT0gJ1xccicgJiYgc291cmNlW2kgKyAxXSA9PT0gJ1xcbicpXG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgaWYgKGNoID09PSAnXFxuJykge1xuICAgICAgICAgICAgY29uc3QgeyBmb2xkLCBvZmZzZXQgfSA9IGZvbGROZXdsaW5lKHNvdXJjZSwgaSk7XG4gICAgICAgICAgICByZXMgKz0gZm9sZDtcbiAgICAgICAgICAgIGkgPSBvZmZzZXQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoY2ggPT09ICdcXFxcJykge1xuICAgICAgICAgICAgbGV0IG5leHQgPSBzb3VyY2VbKytpXTtcbiAgICAgICAgICAgIGNvbnN0IGNjID0gZXNjYXBlQ29kZXNbbmV4dF07XG4gICAgICAgICAgICBpZiAoY2MpXG4gICAgICAgICAgICAgICAgcmVzICs9IGNjO1xuICAgICAgICAgICAgZWxzZSBpZiAobmV4dCA9PT0gJ1xcbicpIHtcbiAgICAgICAgICAgICAgICAvLyBza2lwIGVzY2FwZWQgbmV3bGluZXMsIGJ1dCBzdGlsbCB0cmltIHRoZSBmb2xsb3dpbmcgbGluZVxuICAgICAgICAgICAgICAgIG5leHQgPSBzb3VyY2VbaSArIDFdO1xuICAgICAgICAgICAgICAgIHdoaWxlIChuZXh0ID09PSAnICcgfHwgbmV4dCA9PT0gJ1xcdCcpXG4gICAgICAgICAgICAgICAgICAgIG5leHQgPSBzb3VyY2VbKytpICsgMV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChuZXh0ID09PSAnXFxyJyAmJiBzb3VyY2VbaSArIDFdID09PSAnXFxuJykge1xuICAgICAgICAgICAgICAgIC8vIHNraXAgZXNjYXBlZCBDUkxGIG5ld2xpbmVzLCBidXQgc3RpbGwgdHJpbSB0aGUgZm9sbG93aW5nIGxpbmVcbiAgICAgICAgICAgICAgICBuZXh0ID0gc291cmNlWysraSArIDFdO1xuICAgICAgICAgICAgICAgIHdoaWxlIChuZXh0ID09PSAnICcgfHwgbmV4dCA9PT0gJ1xcdCcpXG4gICAgICAgICAgICAgICAgICAgIG5leHQgPSBzb3VyY2VbKytpICsgMV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChuZXh0ID09PSAneCcgfHwgbmV4dCA9PT0gJ3UnIHx8IG5leHQgPT09ICdVJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxlbmd0aCA9IHsgeDogMiwgdTogNCwgVTogOCB9W25leHRdO1xuICAgICAgICAgICAgICAgIHJlcyArPSBwYXJzZUNoYXJDb2RlKHNvdXJjZSwgaSArIDEsIGxlbmd0aCwgb25FcnJvcik7XG4gICAgICAgICAgICAgICAgaSArPSBsZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCByYXcgPSBzb3VyY2Uuc3Vic3RyKGkgLSAxLCAyKTtcbiAgICAgICAgICAgICAgICBvbkVycm9yKGkgLSAxLCAnQkFEX0RRX0VTQ0FQRScsIGBJbnZhbGlkIGVzY2FwZSBzZXF1ZW5jZSAke3Jhd31gKTtcbiAgICAgICAgICAgICAgICByZXMgKz0gcmF3O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGNoID09PSAnICcgfHwgY2ggPT09ICdcXHQnKSB7XG4gICAgICAgICAgICAvLyB0cmltIHRyYWlsaW5nIHdoaXRlc3BhY2VcbiAgICAgICAgICAgIGNvbnN0IHdzU3RhcnQgPSBpO1xuICAgICAgICAgICAgbGV0IG5leHQgPSBzb3VyY2VbaSArIDFdO1xuICAgICAgICAgICAgd2hpbGUgKG5leHQgPT09ICcgJyB8fCBuZXh0ID09PSAnXFx0JylcbiAgICAgICAgICAgICAgICBuZXh0ID0gc291cmNlWysraSArIDFdO1xuICAgICAgICAgICAgaWYgKG5leHQgIT09ICdcXG4nICYmICEobmV4dCA9PT0gJ1xccicgJiYgc291cmNlW2kgKyAyXSA9PT0gJ1xcbicpKVxuICAgICAgICAgICAgICAgIHJlcyArPSBpID4gd3NTdGFydCA/IHNvdXJjZS5zbGljZSh3c1N0YXJ0LCBpICsgMSkgOiBjaDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJlcyArPSBjaDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoc291cmNlW3NvdXJjZS5sZW5ndGggLSAxXSAhPT0gJ1wiJyB8fCBzb3VyY2UubGVuZ3RoID09PSAxKVxuICAgICAgICBvbkVycm9yKHNvdXJjZS5sZW5ndGgsICdNSVNTSU5HX0NIQVInLCAnTWlzc2luZyBjbG9zaW5nIFwicXVvdGUnKTtcbiAgICByZXR1cm4gcmVzO1xufVxuLyoqXG4gKiBGb2xkIGEgc2luZ2xlIG5ld2xpbmUgaW50byBhIHNwYWNlLCBtdWx0aXBsZSBuZXdsaW5lcyB0byBOIC0gMSBuZXdsaW5lcy5cbiAqIFByZXN1bWVzIGBzb3VyY2Vbb2Zmc2V0XSA9PT0gJ1xcbidgXG4gKi9cbmZ1bmN0aW9uIGZvbGROZXdsaW5lKHNvdXJjZSwgb2Zmc2V0KSB7XG4gICAgbGV0IGZvbGQgPSAnJztcbiAgICBsZXQgY2ggPSBzb3VyY2Vbb2Zmc2V0ICsgMV07XG4gICAgd2hpbGUgKGNoID09PSAnICcgfHwgY2ggPT09ICdcXHQnIHx8IGNoID09PSAnXFxuJyB8fCBjaCA9PT0gJ1xccicpIHtcbiAgICAgICAgaWYgKGNoID09PSAnXFxyJyAmJiBzb3VyY2Vbb2Zmc2V0ICsgMl0gIT09ICdcXG4nKVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGlmIChjaCA9PT0gJ1xcbicpXG4gICAgICAgICAgICBmb2xkICs9ICdcXG4nO1xuICAgICAgICBvZmZzZXQgKz0gMTtcbiAgICAgICAgY2ggPSBzb3VyY2Vbb2Zmc2V0ICsgMV07XG4gICAgfVxuICAgIGlmICghZm9sZClcbiAgICAgICAgZm9sZCA9ICcgJztcbiAgICByZXR1cm4geyBmb2xkLCBvZmZzZXQgfTtcbn1cbmNvbnN0IGVzY2FwZUNvZGVzID0ge1xuICAgICcwJzogJ1xcMCcsIC8vIG51bGwgY2hhcmFjdGVyXG4gICAgYTogJ1xceDA3JywgLy8gYmVsbCBjaGFyYWN0ZXJcbiAgICBiOiAnXFxiJywgLy8gYmFja3NwYWNlXG4gICAgZTogJ1xceDFiJywgLy8gZXNjYXBlIGNoYXJhY3RlclxuICAgIGY6ICdcXGYnLCAvLyBmb3JtIGZlZWRcbiAgICBuOiAnXFxuJywgLy8gbGluZSBmZWVkXG4gICAgcjogJ1xccicsIC8vIGNhcnJpYWdlIHJldHVyblxuICAgIHQ6ICdcXHQnLCAvLyBob3Jpem9udGFsIHRhYlxuICAgIHY6ICdcXHYnLCAvLyB2ZXJ0aWNhbCB0YWJcbiAgICBOOiAnXFx1MDA4NScsIC8vIFVuaWNvZGUgbmV4dCBsaW5lXG4gICAgXzogJ1xcdTAwYTAnLCAvLyBVbmljb2RlIG5vbi1icmVha2luZyBzcGFjZVxuICAgIEw6ICdcXHUyMDI4JywgLy8gVW5pY29kZSBsaW5lIHNlcGFyYXRvclxuICAgIFA6ICdcXHUyMDI5JywgLy8gVW5pY29kZSBwYXJhZ3JhcGggc2VwYXJhdG9yXG4gICAgJyAnOiAnICcsXG4gICAgJ1wiJzogJ1wiJyxcbiAgICAnLyc6ICcvJyxcbiAgICAnXFxcXCc6ICdcXFxcJyxcbiAgICAnXFx0JzogJ1xcdCdcbn07XG5mdW5jdGlvbiBwYXJzZUNoYXJDb2RlKHNvdXJjZSwgb2Zmc2V0LCBsZW5ndGgsIG9uRXJyb3IpIHtcbiAgICBjb25zdCBjYyA9IHNvdXJjZS5zdWJzdHIob2Zmc2V0LCBsZW5ndGgpO1xuICAgIGNvbnN0IG9rID0gY2MubGVuZ3RoID09PSBsZW5ndGggJiYgL15bMC05YS1mQS1GXSskLy50ZXN0KGNjKTtcbiAgICBjb25zdCBjb2RlID0gb2sgPyBwYXJzZUludChjYywgMTYpIDogTmFOO1xuICAgIGlmIChpc05hTihjb2RlKSkge1xuICAgICAgICBjb25zdCByYXcgPSBzb3VyY2Uuc3Vic3RyKG9mZnNldCAtIDIsIGxlbmd0aCArIDIpO1xuICAgICAgICBvbkVycm9yKG9mZnNldCAtIDIsICdCQURfRFFfRVNDQVBFJywgYEludmFsaWQgZXNjYXBlIHNlcXVlbmNlICR7cmF3fWApO1xuICAgICAgICByZXR1cm4gcmF3O1xuICAgIH1cbiAgICByZXR1cm4gU3RyaW5nLmZyb21Db2RlUG9pbnQoY29kZSk7XG59XG5cbmV4cG9ydHMucmVzb2x2ZUZsb3dTY2FsYXIgPSByZXNvbHZlRmxvd1NjYWxhcjtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuLi9ub2Rlcy9pZGVudGl0eS5qcycpO1xudmFyIFNjYWxhciA9IHJlcXVpcmUoJy4uL25vZGVzL1NjYWxhci5qcycpO1xudmFyIHJlc29sdmVCbG9ja1NjYWxhciA9IHJlcXVpcmUoJy4vcmVzb2x2ZS1ibG9jay1zY2FsYXIuanMnKTtcbnZhciByZXNvbHZlRmxvd1NjYWxhciA9IHJlcXVpcmUoJy4vcmVzb2x2ZS1mbG93LXNjYWxhci5qcycpO1xuXG5mdW5jdGlvbiBjb21wb3NlU2NhbGFyKGN0eCwgdG9rZW4sIHRhZ1Rva2VuLCBvbkVycm9yKSB7XG4gICAgY29uc3QgeyB2YWx1ZSwgdHlwZSwgY29tbWVudCwgcmFuZ2UgfSA9IHRva2VuLnR5cGUgPT09ICdibG9jay1zY2FsYXInXG4gICAgICAgID8gcmVzb2x2ZUJsb2NrU2NhbGFyLnJlc29sdmVCbG9ja1NjYWxhcihjdHgsIHRva2VuLCBvbkVycm9yKVxuICAgICAgICA6IHJlc29sdmVGbG93U2NhbGFyLnJlc29sdmVGbG93U2NhbGFyKHRva2VuLCBjdHgub3B0aW9ucy5zdHJpY3QsIG9uRXJyb3IpO1xuICAgIGNvbnN0IHRhZ05hbWUgPSB0YWdUb2tlblxuICAgICAgICA/IGN0eC5kaXJlY3RpdmVzLnRhZ05hbWUodGFnVG9rZW4uc291cmNlLCBtc2cgPT4gb25FcnJvcih0YWdUb2tlbiwgJ1RBR19SRVNPTFZFX0ZBSUxFRCcsIG1zZykpXG4gICAgICAgIDogbnVsbDtcbiAgICBsZXQgdGFnO1xuICAgIGlmIChjdHgub3B0aW9ucy5zdHJpbmdLZXlzICYmIGN0eC5hdEtleSkge1xuICAgICAgICB0YWcgPSBjdHguc2NoZW1hW2lkZW50aXR5LlNDQUxBUl07XG4gICAgfVxuICAgIGVsc2UgaWYgKHRhZ05hbWUpXG4gICAgICAgIHRhZyA9IGZpbmRTY2FsYXJUYWdCeU5hbWUoY3R4LnNjaGVtYSwgdmFsdWUsIHRhZ05hbWUsIHRhZ1Rva2VuLCBvbkVycm9yKTtcbiAgICBlbHNlIGlmICh0b2tlbi50eXBlID09PSAnc2NhbGFyJylcbiAgICAgICAgdGFnID0gZmluZFNjYWxhclRhZ0J5VGVzdChjdHgsIHZhbHVlLCB0b2tlbiwgb25FcnJvcik7XG4gICAgZWxzZVxuICAgICAgICB0YWcgPSBjdHguc2NoZW1hW2lkZW50aXR5LlNDQUxBUl07XG4gICAgbGV0IHNjYWxhcjtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZXMgPSB0YWcucmVzb2x2ZSh2YWx1ZSwgbXNnID0+IG9uRXJyb3IodGFnVG9rZW4gPz8gdG9rZW4sICdUQUdfUkVTT0xWRV9GQUlMRUQnLCBtc2cpLCBjdHgub3B0aW9ucyk7XG4gICAgICAgIHNjYWxhciA9IGlkZW50aXR5LmlzU2NhbGFyKHJlcykgPyByZXMgOiBuZXcgU2NhbGFyLlNjYWxhcihyZXMpO1xuICAgIH1cbiAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbXNnID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICBvbkVycm9yKHRhZ1Rva2VuID8/IHRva2VuLCAnVEFHX1JFU09MVkVfRkFJTEVEJywgbXNnKTtcbiAgICAgICAgc2NhbGFyID0gbmV3IFNjYWxhci5TY2FsYXIodmFsdWUpO1xuICAgIH1cbiAgICBzY2FsYXIucmFuZ2UgPSByYW5nZTtcbiAgICBzY2FsYXIuc291cmNlID0gdmFsdWU7XG4gICAgaWYgKHR5cGUpXG4gICAgICAgIHNjYWxhci50eXBlID0gdHlwZTtcbiAgICBpZiAodGFnTmFtZSlcbiAgICAgICAgc2NhbGFyLnRhZyA9IHRhZ05hbWU7XG4gICAgaWYgKHRhZy5mb3JtYXQpXG4gICAgICAgIHNjYWxhci5mb3JtYXQgPSB0YWcuZm9ybWF0O1xuICAgIGlmIChjb21tZW50KVxuICAgICAgICBzY2FsYXIuY29tbWVudCA9IGNvbW1lbnQ7XG4gICAgcmV0dXJuIHNjYWxhcjtcbn1cbmZ1bmN0aW9uIGZpbmRTY2FsYXJUYWdCeU5hbWUoc2NoZW1hLCB2YWx1ZSwgdGFnTmFtZSwgdGFnVG9rZW4sIG9uRXJyb3IpIHtcbiAgICBpZiAodGFnTmFtZSA9PT0gJyEnKVxuICAgICAgICByZXR1cm4gc2NoZW1hW2lkZW50aXR5LlNDQUxBUl07IC8vIG5vbi1zcGVjaWZpYyB0YWdcbiAgICBjb25zdCBtYXRjaFdpdGhUZXN0ID0gW107XG4gICAgZm9yIChjb25zdCB0YWcgb2Ygc2NoZW1hLnRhZ3MpIHtcbiAgICAgICAgaWYgKCF0YWcuY29sbGVjdGlvbiAmJiB0YWcudGFnID09PSB0YWdOYW1lKSB7XG4gICAgICAgICAgICBpZiAodGFnLmRlZmF1bHQgJiYgdGFnLnRlc3QpXG4gICAgICAgICAgICAgICAgbWF0Y2hXaXRoVGVzdC5wdXNoKHRhZyk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhZztcbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGNvbnN0IHRhZyBvZiBtYXRjaFdpdGhUZXN0KVxuICAgICAgICBpZiAodGFnLnRlc3Q/LnRlc3QodmFsdWUpKVxuICAgICAgICAgICAgcmV0dXJuIHRhZztcbiAgICBjb25zdCBrdCA9IHNjaGVtYS5rbm93blRhZ3NbdGFnTmFtZV07XG4gICAgaWYgKGt0ICYmICFrdC5jb2xsZWN0aW9uKSB7XG4gICAgICAgIC8vIEVuc3VyZSB0aGF0IHRoZSBrbm93biB0YWcgaXMgYXZhaWxhYmxlIGZvciBzdHJpbmdpZnlpbmcsXG4gICAgICAgIC8vIGJ1dCBkb2VzIG5vdCBnZXQgdXNlZCBieSBkZWZhdWx0LlxuICAgICAgICBzY2hlbWEudGFncy5wdXNoKE9iamVjdC5hc3NpZ24oe30sIGt0LCB7IGRlZmF1bHQ6IGZhbHNlLCB0ZXN0OiB1bmRlZmluZWQgfSkpO1xuICAgICAgICByZXR1cm4ga3Q7XG4gICAgfVxuICAgIG9uRXJyb3IodGFnVG9rZW4sICdUQUdfUkVTT0xWRV9GQUlMRUQnLCBgVW5yZXNvbHZlZCB0YWc6ICR7dGFnTmFtZX1gLCB0YWdOYW1lICE9PSAndGFnOnlhbWwub3JnLDIwMDI6c3RyJyk7XG4gICAgcmV0dXJuIHNjaGVtYVtpZGVudGl0eS5TQ0FMQVJdO1xufVxuZnVuY3Rpb24gZmluZFNjYWxhclRhZ0J5VGVzdCh7IGF0S2V5LCBkaXJlY3RpdmVzLCBzY2hlbWEgfSwgdmFsdWUsIHRva2VuLCBvbkVycm9yKSB7XG4gICAgY29uc3QgdGFnID0gc2NoZW1hLnRhZ3MuZmluZCh0YWcgPT4gKHRhZy5kZWZhdWx0ID09PSB0cnVlIHx8IChhdEtleSAmJiB0YWcuZGVmYXVsdCA9PT0gJ2tleScpKSAmJlxuICAgICAgICB0YWcudGVzdD8udGVzdCh2YWx1ZSkpIHx8IHNjaGVtYVtpZGVudGl0eS5TQ0FMQVJdO1xuICAgIGlmIChzY2hlbWEuY29tcGF0KSB7XG4gICAgICAgIGNvbnN0IGNvbXBhdCA9IHNjaGVtYS5jb21wYXQuZmluZCh0YWcgPT4gdGFnLmRlZmF1bHQgJiYgdGFnLnRlc3Q/LnRlc3QodmFsdWUpKSA/P1xuICAgICAgICAgICAgc2NoZW1hW2lkZW50aXR5LlNDQUxBUl07XG4gICAgICAgIGlmICh0YWcudGFnICE9PSBjb21wYXQudGFnKSB7XG4gICAgICAgICAgICBjb25zdCB0cyA9IGRpcmVjdGl2ZXMudGFnU3RyaW5nKHRhZy50YWcpO1xuICAgICAgICAgICAgY29uc3QgY3MgPSBkaXJlY3RpdmVzLnRhZ1N0cmluZyhjb21wYXQudGFnKTtcbiAgICAgICAgICAgIGNvbnN0IG1zZyA9IGBWYWx1ZSBtYXkgYmUgcGFyc2VkIGFzIGVpdGhlciAke3RzfSBvciAke2NzfWA7XG4gICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnVEFHX1JFU09MVkVfRkFJTEVEJywgbXNnLCB0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGFnO1xufVxuXG5leHBvcnRzLmNvbXBvc2VTY2FsYXIgPSBjb21wb3NlU2NhbGFyO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIGVtcHR5U2NhbGFyUG9zaXRpb24ob2Zmc2V0LCBiZWZvcmUsIHBvcykge1xuICAgIGlmIChiZWZvcmUpIHtcbiAgICAgICAgcG9zID8/IChwb3MgPSBiZWZvcmUubGVuZ3RoKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IHBvcyAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgICAgICBsZXQgc3QgPSBiZWZvcmVbaV07XG4gICAgICAgICAgICBzd2l0Y2ggKHN0LnR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgICAgICAgICAgY2FzZSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgICAgICAgIG9mZnNldCAtPSBzdC5zb3VyY2UubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFRlY2huaWNhbGx5LCBhbiBlbXB0eSBzY2FsYXIgaXMgaW1tZWRpYXRlbHkgYWZ0ZXIgdGhlIGxhc3Qgbm9uLWVtcHR5XG4gICAgICAgICAgICAvLyBub2RlLCBidXQgaXQncyBtb3JlIHVzZWZ1bCB0byBwbGFjZSBpdCBhZnRlciBhbnkgd2hpdGVzcGFjZS5cbiAgICAgICAgICAgIHN0ID0gYmVmb3JlWysraV07XG4gICAgICAgICAgICB3aGlsZSAoc3Q/LnR5cGUgPT09ICdzcGFjZScpIHtcbiAgICAgICAgICAgICAgICBvZmZzZXQgKz0gc3Quc291cmNlLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBzdCA9IGJlZm9yZVsrK2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9mZnNldDtcbn1cblxuZXhwb3J0cy5lbXB0eVNjYWxhclBvc2l0aW9uID0gZW1wdHlTY2FsYXJQb3NpdGlvbjtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQWxpYXMgPSByZXF1aXJlKCcuLi9ub2Rlcy9BbGlhcy5qcycpO1xudmFyIGlkZW50aXR5ID0gcmVxdWlyZSgnLi4vbm9kZXMvaWRlbnRpdHkuanMnKTtcbnZhciBjb21wb3NlQ29sbGVjdGlvbiA9IHJlcXVpcmUoJy4vY29tcG9zZS1jb2xsZWN0aW9uLmpzJyk7XG52YXIgY29tcG9zZVNjYWxhciA9IHJlcXVpcmUoJy4vY29tcG9zZS1zY2FsYXIuanMnKTtcbnZhciByZXNvbHZlRW5kID0gcmVxdWlyZSgnLi9yZXNvbHZlLWVuZC5qcycpO1xudmFyIHV0aWxFbXB0eVNjYWxhclBvc2l0aW9uID0gcmVxdWlyZSgnLi91dGlsLWVtcHR5LXNjYWxhci1wb3NpdGlvbi5qcycpO1xuXG5jb25zdCBDTiA9IHsgY29tcG9zZU5vZGUsIGNvbXBvc2VFbXB0eU5vZGUgfTtcbmZ1bmN0aW9uIGNvbXBvc2VOb2RlKGN0eCwgdG9rZW4sIHByb3BzLCBvbkVycm9yKSB7XG4gICAgY29uc3QgYXRLZXkgPSBjdHguYXRLZXk7XG4gICAgY29uc3QgeyBzcGFjZUJlZm9yZSwgY29tbWVudCwgYW5jaG9yLCB0YWcgfSA9IHByb3BzO1xuICAgIGxldCBub2RlO1xuICAgIGxldCBpc1NyY1Rva2VuID0gdHJ1ZTtcbiAgICBzd2l0Y2ggKHRva2VuLnR5cGUpIHtcbiAgICAgICAgY2FzZSAnYWxpYXMnOlxuICAgICAgICAgICAgbm9kZSA9IGNvbXBvc2VBbGlhcyhjdHgsIHRva2VuLCBvbkVycm9yKTtcbiAgICAgICAgICAgIGlmIChhbmNob3IgfHwgdGFnKVxuICAgICAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdBTElBU19QUk9QUycsICdBbiBhbGlhcyBub2RlIG11c3Qgbm90IHNwZWNpZnkgYW55IHByb3BlcnRpZXMnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdzY2FsYXInOlxuICAgICAgICBjYXNlICdzaW5nbGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgIGNhc2UgJ2RvdWJsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgY2FzZSAnYmxvY2stc2NhbGFyJzpcbiAgICAgICAgICAgIG5vZGUgPSBjb21wb3NlU2NhbGFyLmNvbXBvc2VTY2FsYXIoY3R4LCB0b2tlbiwgdGFnLCBvbkVycm9yKTtcbiAgICAgICAgICAgIGlmIChhbmNob3IpXG4gICAgICAgICAgICAgICAgbm9kZS5hbmNob3IgPSBhbmNob3Iuc291cmNlLnN1YnN0cmluZygxKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdibG9jay1tYXAnOlxuICAgICAgICBjYXNlICdibG9jay1zZXEnOlxuICAgICAgICBjYXNlICdmbG93LWNvbGxlY3Rpb24nOlxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBub2RlID0gY29tcG9zZUNvbGxlY3Rpb24uY29tcG9zZUNvbGxlY3Rpb24oQ04sIGN0eCwgdG9rZW4sIHByb3BzLCBvbkVycm9yKTtcbiAgICAgICAgICAgICAgICBpZiAoYW5jaG9yKVxuICAgICAgICAgICAgICAgICAgICBub2RlLmFuY2hvciA9IGFuY2hvci5zb3VyY2Uuc3Vic3RyaW5nKDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgLy8gQWxtb3N0IGNlcnRhaW5seSBoZXJlIGR1ZSB0byBhIHN0YWNrIG92ZXJmbG93XG4gICAgICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnUkVTT1VSQ0VfRVhIQVVTVElPTicsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSB0b2tlbi50eXBlID09PSAnZXJyb3InXG4gICAgICAgICAgICAgICAgPyB0b2tlbi5tZXNzYWdlXG4gICAgICAgICAgICAgICAgOiBgVW5zdXBwb3J0ZWQgdG9rZW4gKHR5cGU6ICR7dG9rZW4udHlwZX0pYDtcbiAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdVTkVYUEVDVEVEX1RPS0VOJywgbWVzc2FnZSk7XG4gICAgICAgICAgICBpc1NyY1Rva2VuID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgbm9kZSA/PyAobm9kZSA9IGNvbXBvc2VFbXB0eU5vZGUoY3R4LCB0b2tlbi5vZmZzZXQsIHVuZGVmaW5lZCwgbnVsbCwgcHJvcHMsIG9uRXJyb3IpKTtcbiAgICBpZiAoYW5jaG9yICYmIG5vZGUuYW5jaG9yID09PSAnJylcbiAgICAgICAgb25FcnJvcihhbmNob3IsICdCQURfQUxJQVMnLCAnQW5jaG9yIGNhbm5vdCBiZSBhbiBlbXB0eSBzdHJpbmcnKTtcbiAgICBpZiAoYXRLZXkgJiZcbiAgICAgICAgY3R4Lm9wdGlvbnMuc3RyaW5nS2V5cyAmJlxuICAgICAgICAoIWlkZW50aXR5LmlzU2NhbGFyKG5vZGUpIHx8XG4gICAgICAgICAgICB0eXBlb2Ygbm9kZS52YWx1ZSAhPT0gJ3N0cmluZycgfHxcbiAgICAgICAgICAgIChub2RlLnRhZyAmJiBub2RlLnRhZyAhPT0gJ3RhZzp5YW1sLm9yZywyMDAyOnN0cicpKSkge1xuICAgICAgICBjb25zdCBtc2cgPSAnV2l0aCBzdHJpbmdLZXlzLCBhbGwga2V5cyBtdXN0IGJlIHN0cmluZ3MnO1xuICAgICAgICBvbkVycm9yKHRhZyA/PyB0b2tlbiwgJ05PTl9TVFJJTkdfS0VZJywgbXNnKTtcbiAgICB9XG4gICAgaWYgKHNwYWNlQmVmb3JlKVxuICAgICAgICBub2RlLnNwYWNlQmVmb3JlID0gdHJ1ZTtcbiAgICBpZiAoY29tbWVudCkge1xuICAgICAgICBpZiAodG9rZW4udHlwZSA9PT0gJ3NjYWxhcicgJiYgdG9rZW4uc291cmNlID09PSAnJylcbiAgICAgICAgICAgIG5vZGUuY29tbWVudCA9IGNvbW1lbnQ7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG5vZGUuY29tbWVudEJlZm9yZSA9IGNvbW1lbnQ7XG4gICAgfVxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgVHlwZSBjaGVja2luZyBtaXNzZXMgbWVhbmluZyBvZiBpc1NyY1Rva2VuXG4gICAgaWYgKGN0eC5vcHRpb25zLmtlZXBTb3VyY2VUb2tlbnMgJiYgaXNTcmNUb2tlbilcbiAgICAgICAgbm9kZS5zcmNUb2tlbiA9IHRva2VuO1xuICAgIHJldHVybiBub2RlO1xufVxuZnVuY3Rpb24gY29tcG9zZUVtcHR5Tm9kZShjdHgsIG9mZnNldCwgYmVmb3JlLCBwb3MsIHsgc3BhY2VCZWZvcmUsIGNvbW1lbnQsIGFuY2hvciwgdGFnLCBlbmQgfSwgb25FcnJvcikge1xuICAgIGNvbnN0IHRva2VuID0ge1xuICAgICAgICB0eXBlOiAnc2NhbGFyJyxcbiAgICAgICAgb2Zmc2V0OiB1dGlsRW1wdHlTY2FsYXJQb3NpdGlvbi5lbXB0eVNjYWxhclBvc2l0aW9uKG9mZnNldCwgYmVmb3JlLCBwb3MpLFxuICAgICAgICBpbmRlbnQ6IC0xLFxuICAgICAgICBzb3VyY2U6ICcnXG4gICAgfTtcbiAgICBjb25zdCBub2RlID0gY29tcG9zZVNjYWxhci5jb21wb3NlU2NhbGFyKGN0eCwgdG9rZW4sIHRhZywgb25FcnJvcik7XG4gICAgaWYgKGFuY2hvcikge1xuICAgICAgICBub2RlLmFuY2hvciA9IGFuY2hvci5zb3VyY2Uuc3Vic3RyaW5nKDEpO1xuICAgICAgICBpZiAobm9kZS5hbmNob3IgPT09ICcnKVxuICAgICAgICAgICAgb25FcnJvcihhbmNob3IsICdCQURfQUxJQVMnLCAnQW5jaG9yIGNhbm5vdCBiZSBhbiBlbXB0eSBzdHJpbmcnKTtcbiAgICB9XG4gICAgaWYgKHNwYWNlQmVmb3JlKVxuICAgICAgICBub2RlLnNwYWNlQmVmb3JlID0gdHJ1ZTtcbiAgICBpZiAoY29tbWVudCkge1xuICAgICAgICBub2RlLmNvbW1lbnQgPSBjb21tZW50O1xuICAgICAgICBub2RlLnJhbmdlWzJdID0gZW5kO1xuICAgIH1cbiAgICByZXR1cm4gbm9kZTtcbn1cbmZ1bmN0aW9uIGNvbXBvc2VBbGlhcyh7IG9wdGlvbnMgfSwgeyBvZmZzZXQsIHNvdXJjZSwgZW5kIH0sIG9uRXJyb3IpIHtcbiAgICBjb25zdCBhbGlhcyA9IG5ldyBBbGlhcy5BbGlhcyhzb3VyY2Uuc3Vic3RyaW5nKDEpKTtcbiAgICBpZiAoYWxpYXMuc291cmNlID09PSAnJylcbiAgICAgICAgb25FcnJvcihvZmZzZXQsICdCQURfQUxJQVMnLCAnQWxpYXMgY2Fubm90IGJlIGFuIGVtcHR5IHN0cmluZycpO1xuICAgIGlmIChhbGlhcy5zb3VyY2UuZW5kc1dpdGgoJzonKSlcbiAgICAgICAgb25FcnJvcihvZmZzZXQgKyBzb3VyY2UubGVuZ3RoIC0gMSwgJ0JBRF9BTElBUycsICdBbGlhcyBlbmRpbmcgaW4gOiBpcyBhbWJpZ3VvdXMnLCB0cnVlKTtcbiAgICBjb25zdCB2YWx1ZUVuZCA9IG9mZnNldCArIHNvdXJjZS5sZW5ndGg7XG4gICAgY29uc3QgcmUgPSByZXNvbHZlRW5kLnJlc29sdmVFbmQoZW5kLCB2YWx1ZUVuZCwgb3B0aW9ucy5zdHJpY3QsIG9uRXJyb3IpO1xuICAgIGFsaWFzLnJhbmdlID0gW29mZnNldCwgdmFsdWVFbmQsIHJlLm9mZnNldF07XG4gICAgaWYgKHJlLmNvbW1lbnQpXG4gICAgICAgIGFsaWFzLmNvbW1lbnQgPSByZS5jb21tZW50O1xuICAgIHJldHVybiBhbGlhcztcbn1cblxuZXhwb3J0cy5jb21wb3NlRW1wdHlOb2RlID0gY29tcG9zZUVtcHR5Tm9kZTtcbmV4cG9ydHMuY29tcG9zZU5vZGUgPSBjb21wb3NlTm9kZTtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgRG9jdW1lbnQgPSByZXF1aXJlKCcuLi9kb2MvRG9jdW1lbnQuanMnKTtcbnZhciBjb21wb3NlTm9kZSA9IHJlcXVpcmUoJy4vY29tcG9zZS1ub2RlLmpzJyk7XG52YXIgcmVzb2x2ZUVuZCA9IHJlcXVpcmUoJy4vcmVzb2x2ZS1lbmQuanMnKTtcbnZhciByZXNvbHZlUHJvcHMgPSByZXF1aXJlKCcuL3Jlc29sdmUtcHJvcHMuanMnKTtcblxuZnVuY3Rpb24gY29tcG9zZURvYyhvcHRpb25zLCBkaXJlY3RpdmVzLCB7IG9mZnNldCwgc3RhcnQsIHZhbHVlLCBlbmQgfSwgb25FcnJvcikge1xuICAgIGNvbnN0IG9wdHMgPSBPYmplY3QuYXNzaWduKHsgX2RpcmVjdGl2ZXM6IGRpcmVjdGl2ZXMgfSwgb3B0aW9ucyk7XG4gICAgY29uc3QgZG9jID0gbmV3IERvY3VtZW50LkRvY3VtZW50KHVuZGVmaW5lZCwgb3B0cyk7XG4gICAgY29uc3QgY3R4ID0ge1xuICAgICAgICBhdEtleTogZmFsc2UsXG4gICAgICAgIGF0Um9vdDogdHJ1ZSxcbiAgICAgICAgZGlyZWN0aXZlczogZG9jLmRpcmVjdGl2ZXMsXG4gICAgICAgIG9wdGlvbnM6IGRvYy5vcHRpb25zLFxuICAgICAgICBzY2hlbWE6IGRvYy5zY2hlbWFcbiAgICB9O1xuICAgIGNvbnN0IHByb3BzID0gcmVzb2x2ZVByb3BzLnJlc29sdmVQcm9wcyhzdGFydCwge1xuICAgICAgICBpbmRpY2F0b3I6ICdkb2Mtc3RhcnQnLFxuICAgICAgICBuZXh0OiB2YWx1ZSA/PyBlbmQ/LlswXSxcbiAgICAgICAgb2Zmc2V0LFxuICAgICAgICBvbkVycm9yLFxuICAgICAgICBwYXJlbnRJbmRlbnQ6IDAsXG4gICAgICAgIHN0YXJ0T25OZXdsaW5lOiB0cnVlXG4gICAgfSk7XG4gICAgaWYgKHByb3BzLmZvdW5kKSB7XG4gICAgICAgIGRvYy5kaXJlY3RpdmVzLmRvY1N0YXJ0ID0gdHJ1ZTtcbiAgICAgICAgaWYgKHZhbHVlICYmXG4gICAgICAgICAgICAodmFsdWUudHlwZSA9PT0gJ2Jsb2NrLW1hcCcgfHwgdmFsdWUudHlwZSA9PT0gJ2Jsb2NrLXNlcScpICYmXG4gICAgICAgICAgICAhcHJvcHMuaGFzTmV3bGluZSlcbiAgICAgICAgICAgIG9uRXJyb3IocHJvcHMuZW5kLCAnTUlTU0lOR19DSEFSJywgJ0Jsb2NrIGNvbGxlY3Rpb24gY2Fubm90IHN0YXJ0IG9uIHNhbWUgbGluZSB3aXRoIGRpcmVjdGl2ZXMtZW5kIG1hcmtlcicpO1xuICAgIH1cbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIElmIENvbnRlbnRzIGlzIHNldCwgbGV0J3MgdHJ1c3QgdGhlIHVzZXJcbiAgICBkb2MuY29udGVudHMgPSB2YWx1ZVxuICAgICAgICA/IGNvbXBvc2VOb2RlLmNvbXBvc2VOb2RlKGN0eCwgdmFsdWUsIHByb3BzLCBvbkVycm9yKVxuICAgICAgICA6IGNvbXBvc2VOb2RlLmNvbXBvc2VFbXB0eU5vZGUoY3R4LCBwcm9wcy5lbmQsIHN0YXJ0LCBudWxsLCBwcm9wcywgb25FcnJvcik7XG4gICAgY29uc3QgY29udGVudEVuZCA9IGRvYy5jb250ZW50cy5yYW5nZVsyXTtcbiAgICBjb25zdCByZSA9IHJlc29sdmVFbmQucmVzb2x2ZUVuZChlbmQsIGNvbnRlbnRFbmQsIGZhbHNlLCBvbkVycm9yKTtcbiAgICBpZiAocmUuY29tbWVudClcbiAgICAgICAgZG9jLmNvbW1lbnQgPSByZS5jb21tZW50O1xuICAgIGRvYy5yYW5nZSA9IFtvZmZzZXQsIGNvbnRlbnRFbmQsIHJlLm9mZnNldF07XG4gICAgcmV0dXJuIGRvYztcbn1cblxuZXhwb3J0cy5jb21wb3NlRG9jID0gY29tcG9zZURvYztcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbm9kZV9wcm9jZXNzID0gcmVxdWlyZSgncHJvY2VzcycpO1xudmFyIGRpcmVjdGl2ZXMgPSByZXF1aXJlKCcuLi9kb2MvZGlyZWN0aXZlcy5qcycpO1xudmFyIERvY3VtZW50ID0gcmVxdWlyZSgnLi4vZG9jL0RvY3VtZW50LmpzJyk7XG52YXIgZXJyb3JzID0gcmVxdWlyZSgnLi4vZXJyb3JzLmpzJyk7XG52YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuLi9ub2Rlcy9pZGVudGl0eS5qcycpO1xudmFyIGNvbXBvc2VEb2MgPSByZXF1aXJlKCcuL2NvbXBvc2UtZG9jLmpzJyk7XG52YXIgcmVzb2x2ZUVuZCA9IHJlcXVpcmUoJy4vcmVzb2x2ZS1lbmQuanMnKTtcblxuZnVuY3Rpb24gZ2V0RXJyb3JQb3Moc3JjKSB7XG4gICAgaWYgKHR5cGVvZiBzcmMgPT09ICdudW1iZXInKVxuICAgICAgICByZXR1cm4gW3NyYywgc3JjICsgMV07XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoc3JjKSlcbiAgICAgICAgcmV0dXJuIHNyYy5sZW5ndGggPT09IDIgPyBzcmMgOiBbc3JjWzBdLCBzcmNbMV1dO1xuICAgIGNvbnN0IHsgb2Zmc2V0LCBzb3VyY2UgfSA9IHNyYztcbiAgICByZXR1cm4gW29mZnNldCwgb2Zmc2V0ICsgKHR5cGVvZiBzb3VyY2UgPT09ICdzdHJpbmcnID8gc291cmNlLmxlbmd0aCA6IDEpXTtcbn1cbmZ1bmN0aW9uIHBhcnNlUHJlbHVkZShwcmVsdWRlKSB7XG4gICAgbGV0IGNvbW1lbnQgPSAnJztcbiAgICBsZXQgYXRDb21tZW50ID0gZmFsc2U7XG4gICAgbGV0IGFmdGVyRW1wdHlMaW5lID0gZmFsc2U7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcmVsdWRlLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGNvbnN0IHNvdXJjZSA9IHByZWx1ZGVbaV07XG4gICAgICAgIHN3aXRjaCAoc291cmNlWzBdKSB7XG4gICAgICAgICAgICBjYXNlICcjJzpcbiAgICAgICAgICAgICAgICBjb21tZW50ICs9XG4gICAgICAgICAgICAgICAgICAgIChjb21tZW50ID09PSAnJyA/ICcnIDogYWZ0ZXJFbXB0eUxpbmUgPyAnXFxuXFxuJyA6ICdcXG4nKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAoc291cmNlLnN1YnN0cmluZygxKSB8fCAnICcpO1xuICAgICAgICAgICAgICAgIGF0Q29tbWVudCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYWZ0ZXJFbXB0eUxpbmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJyUnOlxuICAgICAgICAgICAgICAgIGlmIChwcmVsdWRlW2kgKyAxXT8uWzBdICE9PSAnIycpXG4gICAgICAgICAgICAgICAgICAgIGkgKz0gMTtcbiAgICAgICAgICAgICAgICBhdENvbW1lbnQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgLy8gVGhpcyBtYXkgYmUgd3JvbmcgYWZ0ZXIgZG9jLWVuZCwgYnV0IGluIHRoYXQgY2FzZSBpdCBkb2Vzbid0IG1hdHRlclxuICAgICAgICAgICAgICAgIGlmICghYXRDb21tZW50KVxuICAgICAgICAgICAgICAgICAgICBhZnRlckVtcHR5TGluZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgYXRDb21tZW50ID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHsgY29tbWVudCwgYWZ0ZXJFbXB0eUxpbmUgfTtcbn1cbi8qKlxuICogQ29tcG9zZSBhIHN0cmVhbSBvZiBDU1Qgbm9kZXMgaW50byBhIHN0cmVhbSBvZiBZQU1MIERvY3VtZW50cy5cbiAqXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgQ29tcG9zZXIsIFBhcnNlciB9IGZyb20gJ3lhbWwnXG4gKlxuICogY29uc3Qgc3JjOiBzdHJpbmcgPSAuLi5cbiAqIGNvbnN0IHRva2VucyA9IG5ldyBQYXJzZXIoKS5wYXJzZShzcmMpXG4gKiBjb25zdCBkb2NzID0gbmV3IENvbXBvc2VyKCkuY29tcG9zZSh0b2tlbnMpXG4gKiBgYGBcbiAqL1xuY2xhc3MgQ29tcG9zZXIge1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgICAgICB0aGlzLmRvYyA9IG51bGw7XG4gICAgICAgIHRoaXMuYXREaXJlY3RpdmVzID0gZmFsc2U7XG4gICAgICAgIHRoaXMucHJlbHVkZSA9IFtdO1xuICAgICAgICB0aGlzLmVycm9ycyA9IFtdO1xuICAgICAgICB0aGlzLndhcm5pbmdzID0gW107XG4gICAgICAgIHRoaXMub25FcnJvciA9IChzb3VyY2UsIGNvZGUsIG1lc3NhZ2UsIHdhcm5pbmcpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHBvcyA9IGdldEVycm9yUG9zKHNvdXJjZSk7XG4gICAgICAgICAgICBpZiAod2FybmluZylcbiAgICAgICAgICAgICAgICB0aGlzLndhcm5pbmdzLnB1c2gobmV3IGVycm9ycy5ZQU1MV2FybmluZyhwb3MsIGNvZGUsIG1lc3NhZ2UpKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0aGlzLmVycm9ycy5wdXNoKG5ldyBlcnJvcnMuWUFNTFBhcnNlRXJyb3IocG9zLCBjb2RlLCBtZXNzYWdlKSk7XG4gICAgICAgIH07XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvcHJlZmVyLW51bGxpc2gtY29hbGVzY2luZ1xuICAgICAgICB0aGlzLmRpcmVjdGl2ZXMgPSBuZXcgZGlyZWN0aXZlcy5EaXJlY3RpdmVzKHsgdmVyc2lvbjogb3B0aW9ucy52ZXJzaW9uIHx8ICcxLjInIH0pO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIH1cbiAgICBkZWNvcmF0ZShkb2MsIGFmdGVyRG9jKSB7XG4gICAgICAgIGNvbnN0IHsgY29tbWVudCwgYWZ0ZXJFbXB0eUxpbmUgfSA9IHBhcnNlUHJlbHVkZSh0aGlzLnByZWx1ZGUpO1xuICAgICAgICAvL2NvbnNvbGUubG9nKHsgZGM6IGRvYy5jb21tZW50LCBwcmVsdWRlLCBjb21tZW50IH0pXG4gICAgICAgIGlmIChjb21tZW50KSB7XG4gICAgICAgICAgICBjb25zdCBkYyA9IGRvYy5jb250ZW50cztcbiAgICAgICAgICAgIGlmIChhZnRlckRvYykge1xuICAgICAgICAgICAgICAgIGRvYy5jb21tZW50ID0gZG9jLmNvbW1lbnQgPyBgJHtkb2MuY29tbWVudH1cXG4ke2NvbW1lbnR9YCA6IGNvbW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChhZnRlckVtcHR5TGluZSB8fCBkb2MuZGlyZWN0aXZlcy5kb2NTdGFydCB8fCAhZGMpIHtcbiAgICAgICAgICAgICAgICBkb2MuY29tbWVudEJlZm9yZSA9IGNvbW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpZGVudGl0eS5pc0NvbGxlY3Rpb24oZGMpICYmICFkYy5mbG93ICYmIGRjLml0ZW1zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBsZXQgaXQgPSBkYy5pdGVtc1swXTtcbiAgICAgICAgICAgICAgICBpZiAoaWRlbnRpdHkuaXNQYWlyKGl0KSlcbiAgICAgICAgICAgICAgICAgICAgaXQgPSBpdC5rZXk7XG4gICAgICAgICAgICAgICAgY29uc3QgY2IgPSBpdC5jb21tZW50QmVmb3JlO1xuICAgICAgICAgICAgICAgIGl0LmNvbW1lbnRCZWZvcmUgPSBjYiA/IGAke2NvbW1lbnR9XFxuJHtjYn1gIDogY29tbWVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNiID0gZGMuY29tbWVudEJlZm9yZTtcbiAgICAgICAgICAgICAgICBkYy5jb21tZW50QmVmb3JlID0gY2IgPyBgJHtjb21tZW50fVxcbiR7Y2J9YCA6IGNvbW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFmdGVyRG9jKSB7XG4gICAgICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShkb2MuZXJyb3JzLCB0aGlzLmVycm9ycyk7XG4gICAgICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShkb2Mud2FybmluZ3MsIHRoaXMud2FybmluZ3MpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZG9jLmVycm9ycyA9IHRoaXMuZXJyb3JzO1xuICAgICAgICAgICAgZG9jLndhcm5pbmdzID0gdGhpcy53YXJuaW5ncztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnByZWx1ZGUgPSBbXTtcbiAgICAgICAgdGhpcy5lcnJvcnMgPSBbXTtcbiAgICAgICAgdGhpcy53YXJuaW5ncyA9IFtdO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDdXJyZW50IHN0cmVhbSBzdGF0dXMgaW5mb3JtYXRpb24uXG4gICAgICpcbiAgICAgKiBNb3N0bHkgdXNlZnVsIGF0IHRoZSBlbmQgb2YgaW5wdXQgZm9yIGFuIGVtcHR5IHN0cmVhbS5cbiAgICAgKi9cbiAgICBzdHJlYW1JbmZvKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY29tbWVudDogcGFyc2VQcmVsdWRlKHRoaXMucHJlbHVkZSkuY29tbWVudCxcbiAgICAgICAgICAgIGRpcmVjdGl2ZXM6IHRoaXMuZGlyZWN0aXZlcyxcbiAgICAgICAgICAgIGVycm9yczogdGhpcy5lcnJvcnMsXG4gICAgICAgICAgICB3YXJuaW5nczogdGhpcy53YXJuaW5nc1xuICAgICAgICB9O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDb21wb3NlIHRva2VucyBpbnRvIGRvY3VtZW50cy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBmb3JjZURvYyAtIElmIHRoZSBzdHJlYW0gY29udGFpbnMgbm8gZG9jdW1lbnQsIHN0aWxsIGVtaXQgYSBmaW5hbCBkb2N1bWVudCBpbmNsdWRpbmcgYW55IGNvbW1lbnRzIGFuZCBkaXJlY3RpdmVzIHRoYXQgd291bGQgYmUgYXBwbGllZCB0byBhIHN1YnNlcXVlbnQgZG9jdW1lbnQuXG4gICAgICogQHBhcmFtIGVuZE9mZnNldCAtIFNob3VsZCBiZSBzZXQgaWYgYGZvcmNlRG9jYCBpcyBhbHNvIHNldCwgdG8gc2V0IHRoZSBkb2N1bWVudCByYW5nZSBlbmQgYW5kIHRvIGluZGljYXRlIGVycm9ycyBjb3JyZWN0bHkuXG4gICAgICovXG4gICAgKmNvbXBvc2UodG9rZW5zLCBmb3JjZURvYyA9IGZhbHNlLCBlbmRPZmZzZXQgPSAtMSkge1xuICAgICAgICBmb3IgKGNvbnN0IHRva2VuIG9mIHRva2VucylcbiAgICAgICAgICAgIHlpZWxkKiB0aGlzLm5leHQodG9rZW4pO1xuICAgICAgICB5aWVsZCogdGhpcy5lbmQoZm9yY2VEb2MsIGVuZE9mZnNldCk7XG4gICAgfVxuICAgIC8qKiBBZHZhbmNlIHRoZSBjb21wb3NlciBieSBvbmUgQ1NUIHRva2VuLiAqL1xuICAgICpuZXh0KHRva2VuKSB7XG4gICAgICAgIGlmIChub2RlX3Byb2Nlc3MuZW52LkxPR19TVFJFQU0pXG4gICAgICAgICAgICBjb25zb2xlLmRpcih0b2tlbiwgeyBkZXB0aDogbnVsbCB9KTtcbiAgICAgICAgc3dpdGNoICh0b2tlbi50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdkaXJlY3RpdmUnOlxuICAgICAgICAgICAgICAgIHRoaXMuZGlyZWN0aXZlcy5hZGQodG9rZW4uc291cmNlLCAob2Zmc2V0LCBtZXNzYWdlLCB3YXJuaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBvcyA9IGdldEVycm9yUG9zKHRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgcG9zWzBdICs9IG9mZnNldDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkVycm9yKHBvcywgJ0JBRF9ESVJFQ1RJVkUnLCBtZXNzYWdlLCB3YXJuaW5nKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLnByZWx1ZGUucHVzaCh0b2tlbi5zb3VyY2UpO1xuICAgICAgICAgICAgICAgIHRoaXMuYXREaXJlY3RpdmVzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2RvY3VtZW50Jzoge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRvYyA9IGNvbXBvc2VEb2MuY29tcG9zZURvYyh0aGlzLm9wdGlvbnMsIHRoaXMuZGlyZWN0aXZlcywgdG9rZW4sIHRoaXMub25FcnJvcik7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYXREaXJlY3RpdmVzICYmICFkb2MuZGlyZWN0aXZlcy5kb2NTdGFydClcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkVycm9yKHRva2VuLCAnTUlTU0lOR19DSEFSJywgJ01pc3NpbmcgZGlyZWN0aXZlcy1lbmQvZG9jLXN0YXJ0IGluZGljYXRvciBsaW5lJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5kZWNvcmF0ZShkb2MsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5kb2MpXG4gICAgICAgICAgICAgICAgICAgIHlpZWxkIHRoaXMuZG9jO1xuICAgICAgICAgICAgICAgIHRoaXMuZG9jID0gZG9jO1xuICAgICAgICAgICAgICAgIHRoaXMuYXREaXJlY3RpdmVzID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlICdieXRlLW9yZGVyLW1hcmsnOlxuICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICB0aGlzLnByZWx1ZGUucHVzaCh0b2tlbi5zb3VyY2UpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZXJyb3InOiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbXNnID0gdG9rZW4uc291cmNlXG4gICAgICAgICAgICAgICAgICAgID8gYCR7dG9rZW4ubWVzc2FnZX06ICR7SlNPTi5zdHJpbmdpZnkodG9rZW4uc291cmNlKX1gXG4gICAgICAgICAgICAgICAgICAgIDogdG9rZW4ubWVzc2FnZTtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvciA9IG5ldyBlcnJvcnMuWUFNTFBhcnNlRXJyb3IoZ2V0RXJyb3JQb3ModG9rZW4pLCAnVU5FWFBFQ1RFRF9UT0tFTicsIG1zZyk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYXREaXJlY3RpdmVzIHx8ICF0aGlzLmRvYylcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lcnJvcnMucHVzaChlcnJvcik7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRvYy5lcnJvcnMucHVzaChlcnJvcik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlICdkb2MtZW5kJzoge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5kb2MpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbXNnID0gJ1VuZXhwZWN0ZWQgZG9jLWVuZCB3aXRob3V0IHByZWNlZGluZyBkb2N1bWVudCc7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXJyb3JzLnB1c2gobmV3IGVycm9ycy5ZQU1MUGFyc2VFcnJvcihnZXRFcnJvclBvcyh0b2tlbiksICdVTkVYUEVDVEVEX1RPS0VOJywgbXNnKSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmRvYy5kaXJlY3RpdmVzLmRvY0VuZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgY29uc3QgZW5kID0gcmVzb2x2ZUVuZC5yZXNvbHZlRW5kKHRva2VuLmVuZCwgdG9rZW4ub2Zmc2V0ICsgdG9rZW4uc291cmNlLmxlbmd0aCwgdGhpcy5kb2Mub3B0aW9ucy5zdHJpY3QsIHRoaXMub25FcnJvcik7XG4gICAgICAgICAgICAgICAgdGhpcy5kZWNvcmF0ZSh0aGlzLmRvYywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgaWYgKGVuZC5jb21tZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRjID0gdGhpcy5kb2MuY29tbWVudDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kb2MuY29tbWVudCA9IGRjID8gYCR7ZGN9XFxuJHtlbmQuY29tbWVudH1gIDogZW5kLmNvbW1lbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuZG9jLnJhbmdlWzJdID0gZW5kLm9mZnNldDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhpcy5lcnJvcnMucHVzaChuZXcgZXJyb3JzLllBTUxQYXJzZUVycm9yKGdldEVycm9yUG9zKHRva2VuKSwgJ1VORVhQRUNURURfVE9LRU4nLCBgVW5zdXBwb3J0ZWQgdG9rZW4gJHt0b2tlbi50eXBlfWApKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBDYWxsIGF0IGVuZCBvZiBpbnB1dCB0byB5aWVsZCBhbnkgcmVtYWluaW5nIGRvY3VtZW50LlxuICAgICAqXG4gICAgICogQHBhcmFtIGZvcmNlRG9jIC0gSWYgdGhlIHN0cmVhbSBjb250YWlucyBubyBkb2N1bWVudCwgc3RpbGwgZW1pdCBhIGZpbmFsIGRvY3VtZW50IGluY2x1ZGluZyBhbnkgY29tbWVudHMgYW5kIGRpcmVjdGl2ZXMgdGhhdCB3b3VsZCBiZSBhcHBsaWVkIHRvIGEgc3Vic2VxdWVudCBkb2N1bWVudC5cbiAgICAgKiBAcGFyYW0gZW5kT2Zmc2V0IC0gU2hvdWxkIGJlIHNldCBpZiBgZm9yY2VEb2NgIGlzIGFsc28gc2V0LCB0byBzZXQgdGhlIGRvY3VtZW50IHJhbmdlIGVuZCBhbmQgdG8gaW5kaWNhdGUgZXJyb3JzIGNvcnJlY3RseS5cbiAgICAgKi9cbiAgICAqZW5kKGZvcmNlRG9jID0gZmFsc2UsIGVuZE9mZnNldCA9IC0xKSB7XG4gICAgICAgIGlmICh0aGlzLmRvYykge1xuICAgICAgICAgICAgdGhpcy5kZWNvcmF0ZSh0aGlzLmRvYywgdHJ1ZSk7XG4gICAgICAgICAgICB5aWVsZCB0aGlzLmRvYztcbiAgICAgICAgICAgIHRoaXMuZG9jID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChmb3JjZURvYykge1xuICAgICAgICAgICAgY29uc3Qgb3B0cyA9IE9iamVjdC5hc3NpZ24oeyBfZGlyZWN0aXZlczogdGhpcy5kaXJlY3RpdmVzIH0sIHRoaXMub3B0aW9ucyk7XG4gICAgICAgICAgICBjb25zdCBkb2MgPSBuZXcgRG9jdW1lbnQuRG9jdW1lbnQodW5kZWZpbmVkLCBvcHRzKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmF0RGlyZWN0aXZlcylcbiAgICAgICAgICAgICAgICB0aGlzLm9uRXJyb3IoZW5kT2Zmc2V0LCAnTUlTU0lOR19DSEFSJywgJ01pc3NpbmcgZGlyZWN0aXZlcy1lbmQgaW5kaWNhdG9yIGxpbmUnKTtcbiAgICAgICAgICAgIGRvYy5yYW5nZSA9IFswLCBlbmRPZmZzZXQsIGVuZE9mZnNldF07XG4gICAgICAgICAgICB0aGlzLmRlY29yYXRlKGRvYywgZmFsc2UpO1xuICAgICAgICAgICAgeWllbGQgZG9jO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnRzLkNvbXBvc2VyID0gQ29tcG9zZXI7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIHJlc29sdmVCbG9ja1NjYWxhciA9IHJlcXVpcmUoJy4uL2NvbXBvc2UvcmVzb2x2ZS1ibG9jay1zY2FsYXIuanMnKTtcbnZhciByZXNvbHZlRmxvd1NjYWxhciA9IHJlcXVpcmUoJy4uL2NvbXBvc2UvcmVzb2x2ZS1mbG93LXNjYWxhci5qcycpO1xudmFyIGVycm9ycyA9IHJlcXVpcmUoJy4uL2Vycm9ycy5qcycpO1xudmFyIHN0cmluZ2lmeVN0cmluZyA9IHJlcXVpcmUoJy4uL3N0cmluZ2lmeS9zdHJpbmdpZnlTdHJpbmcuanMnKTtcblxuZnVuY3Rpb24gcmVzb2x2ZUFzU2NhbGFyKHRva2VuLCBzdHJpY3QgPSB0cnVlLCBvbkVycm9yKSB7XG4gICAgaWYgKHRva2VuKSB7XG4gICAgICAgIGNvbnN0IF9vbkVycm9yID0gKHBvcywgY29kZSwgbWVzc2FnZSkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgb2Zmc2V0ID0gdHlwZW9mIHBvcyA9PT0gJ251bWJlcicgPyBwb3MgOiBBcnJheS5pc0FycmF5KHBvcykgPyBwb3NbMF0gOiBwb3Mub2Zmc2V0O1xuICAgICAgICAgICAgaWYgKG9uRXJyb3IpXG4gICAgICAgICAgICAgICAgb25FcnJvcihvZmZzZXQsIGNvZGUsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBlcnJvcnMuWUFNTFBhcnNlRXJyb3IoW29mZnNldCwgb2Zmc2V0ICsgMV0sIGNvZGUsIG1lc3NhZ2UpO1xuICAgICAgICB9O1xuICAgICAgICBzd2l0Y2ggKHRva2VuLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ3NjYWxhcic6XG4gICAgICAgICAgICBjYXNlICdzaW5nbGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgICAgICBjYXNlICdkb3VibGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmVGbG93U2NhbGFyLnJlc29sdmVGbG93U2NhbGFyKHRva2VuLCBzdHJpY3QsIF9vbkVycm9yKTtcbiAgICAgICAgICAgIGNhc2UgJ2Jsb2NrLXNjYWxhcic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmVCbG9ja1NjYWxhci5yZXNvbHZlQmxvY2tTY2FsYXIoeyBvcHRpb25zOiB7IHN0cmljdCB9IH0sIHRva2VuLCBfb25FcnJvcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59XG4vKipcbiAqIENyZWF0ZSBhIG5ldyBzY2FsYXIgdG9rZW4gd2l0aCBgdmFsdWVgXG4gKlxuICogVmFsdWVzIHRoYXQgcmVwcmVzZW50IGFuIGFjdHVhbCBzdHJpbmcgYnV0IG1heSBiZSBwYXJzZWQgYXMgYSBkaWZmZXJlbnQgdHlwZSBzaG91bGQgdXNlIGEgYHR5cGVgIG90aGVyIHRoYW4gYCdQTEFJTidgLFxuICogYXMgdGhpcyBmdW5jdGlvbiBkb2VzIG5vdCBzdXBwb3J0IGFueSBzY2hlbWEgb3BlcmF0aW9ucyBhbmQgd29uJ3QgY2hlY2sgZm9yIHN1Y2ggY29uZmxpY3RzLlxuICpcbiAqIEBwYXJhbSB2YWx1ZSBUaGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB2YWx1ZSwgd2hpY2ggd2lsbCBoYXZlIGl0cyBjb250ZW50IHByb3Blcmx5IGluZGVudGVkLlxuICogQHBhcmFtIGNvbnRleHQuZW5kIENvbW1lbnRzIGFuZCB3aGl0ZXNwYWNlIGFmdGVyIHRoZSBlbmQgb2YgdGhlIHZhbHVlLCBvciBhZnRlciB0aGUgYmxvY2sgc2NhbGFyIGhlYWRlci4gSWYgdW5kZWZpbmVkLCBhIG5ld2xpbmUgd2lsbCBiZSBhZGRlZC5cbiAqIEBwYXJhbSBjb250ZXh0LmltcGxpY2l0S2V5IEJlaW5nIHdpdGhpbiBhbiBpbXBsaWNpdCBrZXkgbWF5IGFmZmVjdCB0aGUgcmVzb2x2ZWQgdHlwZSBvZiB0aGUgdG9rZW4ncyB2YWx1ZS5cbiAqIEBwYXJhbSBjb250ZXh0LmluZGVudCBUaGUgaW5kZW50IGxldmVsIG9mIHRoZSB0b2tlbi5cbiAqIEBwYXJhbSBjb250ZXh0LmluRmxvdyBJcyB0aGlzIHNjYWxhciB3aXRoaW4gYSBmbG93IGNvbGxlY3Rpb24/IFRoaXMgbWF5IGFmZmVjdCB0aGUgcmVzb2x2ZWQgdHlwZSBvZiB0aGUgdG9rZW4ncyB2YWx1ZS5cbiAqIEBwYXJhbSBjb250ZXh0Lm9mZnNldCBUaGUgb2Zmc2V0IHBvc2l0aW9uIG9mIHRoZSB0b2tlbi5cbiAqIEBwYXJhbSBjb250ZXh0LnR5cGUgVGhlIHByZWZlcnJlZCB0eXBlIG9mIHRoZSBzY2FsYXIgdG9rZW4uIElmIHVuZGVmaW5lZCwgdGhlIHByZXZpb3VzIHR5cGUgb2YgdGhlIGB0b2tlbmAgd2lsbCBiZSB1c2VkLCBkZWZhdWx0aW5nIHRvIGAnUExBSU4nYC5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlU2NhbGFyVG9rZW4odmFsdWUsIGNvbnRleHQpIHtcbiAgICBjb25zdCB7IGltcGxpY2l0S2V5ID0gZmFsc2UsIGluZGVudCwgaW5GbG93ID0gZmFsc2UsIG9mZnNldCA9IC0xLCB0eXBlID0gJ1BMQUlOJyB9ID0gY29udGV4dDtcbiAgICBjb25zdCBzb3VyY2UgPSBzdHJpbmdpZnlTdHJpbmcuc3RyaW5naWZ5U3RyaW5nKHsgdHlwZSwgdmFsdWUgfSwge1xuICAgICAgICBpbXBsaWNpdEtleSxcbiAgICAgICAgaW5kZW50OiBpbmRlbnQgPiAwID8gJyAnLnJlcGVhdChpbmRlbnQpIDogJycsXG4gICAgICAgIGluRmxvdyxcbiAgICAgICAgb3B0aW9uczogeyBibG9ja1F1b3RlOiB0cnVlLCBsaW5lV2lkdGg6IC0xIH1cbiAgICB9KTtcbiAgICBjb25zdCBlbmQgPSBjb250ZXh0LmVuZCA/PyBbXG4gICAgICAgIHsgdHlwZTogJ25ld2xpbmUnLCBvZmZzZXQ6IC0xLCBpbmRlbnQsIHNvdXJjZTogJ1xcbicgfVxuICAgIF07XG4gICAgc3dpdGNoIChzb3VyY2VbMF0pIHtcbiAgICAgICAgY2FzZSAnfCc6XG4gICAgICAgIGNhc2UgJz4nOiB7XG4gICAgICAgICAgICBjb25zdCBoZSA9IHNvdXJjZS5pbmRleE9mKCdcXG4nKTtcbiAgICAgICAgICAgIGNvbnN0IGhlYWQgPSBzb3VyY2Uuc3Vic3RyaW5nKDAsIGhlKTtcbiAgICAgICAgICAgIGNvbnN0IGJvZHkgPSBzb3VyY2Uuc3Vic3RyaW5nKGhlICsgMSkgKyAnXFxuJztcbiAgICAgICAgICAgIGNvbnN0IHByb3BzID0gW1xuICAgICAgICAgICAgICAgIHsgdHlwZTogJ2Jsb2NrLXNjYWxhci1oZWFkZXInLCBvZmZzZXQsIGluZGVudCwgc291cmNlOiBoZWFkIH1cbiAgICAgICAgICAgIF07XG4gICAgICAgICAgICBpZiAoIWFkZEVuZHRvQmxvY2tQcm9wcyhwcm9wcywgZW5kKSlcbiAgICAgICAgICAgICAgICBwcm9wcy5wdXNoKHsgdHlwZTogJ25ld2xpbmUnLCBvZmZzZXQ6IC0xLCBpbmRlbnQsIHNvdXJjZTogJ1xcbicgfSk7XG4gICAgICAgICAgICByZXR1cm4geyB0eXBlOiAnYmxvY2stc2NhbGFyJywgb2Zmc2V0LCBpbmRlbnQsIHByb3BzLCBzb3VyY2U6IGJvZHkgfTtcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdcIic6XG4gICAgICAgICAgICByZXR1cm4geyB0eXBlOiAnZG91YmxlLXF1b3RlZC1zY2FsYXInLCBvZmZzZXQsIGluZGVudCwgc291cmNlLCBlbmQgfTtcbiAgICAgICAgY2FzZSBcIidcIjpcbiAgICAgICAgICAgIHJldHVybiB7IHR5cGU6ICdzaW5nbGUtcXVvdGVkLXNjYWxhcicsIG9mZnNldCwgaW5kZW50LCBzb3VyY2UsIGVuZCB9O1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3NjYWxhcicsIG9mZnNldCwgaW5kZW50LCBzb3VyY2UsIGVuZCB9O1xuICAgIH1cbn1cbi8qKlxuICogU2V0IHRoZSB2YWx1ZSBvZiBgdG9rZW5gIHRvIHRoZSBnaXZlbiBzdHJpbmcgYHZhbHVlYCwgb3ZlcndyaXRpbmcgYW55IHByZXZpb3VzIGNvbnRlbnRzIGFuZCB0eXBlIHRoYXQgaXQgbWF5IGhhdmUuXG4gKlxuICogQmVzdCBlZmZvcnRzIGFyZSBtYWRlIHRvIHJldGFpbiBhbnkgY29tbWVudHMgcHJldmlvdXNseSBhc3NvY2lhdGVkIHdpdGggdGhlIGB0b2tlbmAsXG4gKiB0aG91Z2ggYWxsIGNvbnRlbnRzIHdpdGhpbiBhIGNvbGxlY3Rpb24ncyBgaXRlbXNgIHdpbGwgYmUgb3ZlcndyaXR0ZW4uXG4gKlxuICogVmFsdWVzIHRoYXQgcmVwcmVzZW50IGFuIGFjdHVhbCBzdHJpbmcgYnV0IG1heSBiZSBwYXJzZWQgYXMgYSBkaWZmZXJlbnQgdHlwZSBzaG91bGQgdXNlIGEgYHR5cGVgIG90aGVyIHRoYW4gYCdQTEFJTidgLFxuICogYXMgdGhpcyBmdW5jdGlvbiBkb2VzIG5vdCBzdXBwb3J0IGFueSBzY2hlbWEgb3BlcmF0aW9ucyBhbmQgd29uJ3QgY2hlY2sgZm9yIHN1Y2ggY29uZmxpY3RzLlxuICpcbiAqIEBwYXJhbSB0b2tlbiBBbnkgdG9rZW4uIElmIGl0IGRvZXMgbm90IGluY2x1ZGUgYW4gYGluZGVudGAgdmFsdWUsIHRoZSB2YWx1ZSB3aWxsIGJlIHN0cmluZ2lmaWVkIGFzIGlmIGl0IHdlcmUgYW4gaW1wbGljaXQga2V5LlxuICogQHBhcmFtIHZhbHVlIFRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZhbHVlLCB3aGljaCB3aWxsIGhhdmUgaXRzIGNvbnRlbnQgcHJvcGVybHkgaW5kZW50ZWQuXG4gKiBAcGFyYW0gY29udGV4dC5hZnRlcktleSBJbiBtb3N0IGNhc2VzLCB2YWx1ZXMgYWZ0ZXIgYSBrZXkgc2hvdWxkIGhhdmUgYW4gYWRkaXRpb25hbCBsZXZlbCBvZiBpbmRlbnRhdGlvbi5cbiAqIEBwYXJhbSBjb250ZXh0LmltcGxpY2l0S2V5IEJlaW5nIHdpdGhpbiBhbiBpbXBsaWNpdCBrZXkgbWF5IGFmZmVjdCB0aGUgcmVzb2x2ZWQgdHlwZSBvZiB0aGUgdG9rZW4ncyB2YWx1ZS5cbiAqIEBwYXJhbSBjb250ZXh0LmluRmxvdyBCZWluZyB3aXRoaW4gYSBmbG93IGNvbGxlY3Rpb24gbWF5IGFmZmVjdCB0aGUgcmVzb2x2ZWQgdHlwZSBvZiB0aGUgdG9rZW4ncyB2YWx1ZS5cbiAqIEBwYXJhbSBjb250ZXh0LnR5cGUgVGhlIHByZWZlcnJlZCB0eXBlIG9mIHRoZSBzY2FsYXIgdG9rZW4uIElmIHVuZGVmaW5lZCwgdGhlIHByZXZpb3VzIHR5cGUgb2YgdGhlIGB0b2tlbmAgd2lsbCBiZSB1c2VkLCBkZWZhdWx0aW5nIHRvIGAnUExBSU4nYC5cbiAqL1xuZnVuY3Rpb24gc2V0U2NhbGFyVmFsdWUodG9rZW4sIHZhbHVlLCBjb250ZXh0ID0ge30pIHtcbiAgICBsZXQgeyBhZnRlcktleSA9IGZhbHNlLCBpbXBsaWNpdEtleSA9IGZhbHNlLCBpbkZsb3cgPSBmYWxzZSwgdHlwZSB9ID0gY29udGV4dDtcbiAgICBsZXQgaW5kZW50ID0gJ2luZGVudCcgaW4gdG9rZW4gPyB0b2tlbi5pbmRlbnQgOiBudWxsO1xuICAgIGlmIChhZnRlcktleSAmJiB0eXBlb2YgaW5kZW50ID09PSAnbnVtYmVyJylcbiAgICAgICAgaW5kZW50ICs9IDI7XG4gICAgaWYgKCF0eXBlKVxuICAgICAgICBzd2l0Y2ggKHRva2VuLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ3NpbmdsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgICAgICAgICB0eXBlID0gJ1FVT1RFX1NJTkdMRSc7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdkb3VibGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgICAgICAgICAgdHlwZSA9ICdRVU9URV9ET1VCTEUnO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYmxvY2stc2NhbGFyJzoge1xuICAgICAgICAgICAgICAgIGNvbnN0IGhlYWRlciA9IHRva2VuLnByb3BzWzBdO1xuICAgICAgICAgICAgICAgIGlmIChoZWFkZXIudHlwZSAhPT0gJ2Jsb2NrLXNjYWxhci1oZWFkZXInKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgYmxvY2sgc2NhbGFyIGhlYWRlcicpO1xuICAgICAgICAgICAgICAgIHR5cGUgPSBoZWFkZXIuc291cmNlWzBdID09PSAnPicgPyAnQkxPQ0tfRk9MREVEJyA6ICdCTE9DS19MSVRFUkFMJztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdHlwZSA9ICdQTEFJTic7XG4gICAgICAgIH1cbiAgICBjb25zdCBzb3VyY2UgPSBzdHJpbmdpZnlTdHJpbmcuc3RyaW5naWZ5U3RyaW5nKHsgdHlwZSwgdmFsdWUgfSwge1xuICAgICAgICBpbXBsaWNpdEtleTogaW1wbGljaXRLZXkgfHwgaW5kZW50ID09PSBudWxsLFxuICAgICAgICBpbmRlbnQ6IGluZGVudCAhPT0gbnVsbCAmJiBpbmRlbnQgPiAwID8gJyAnLnJlcGVhdChpbmRlbnQpIDogJycsXG4gICAgICAgIGluRmxvdyxcbiAgICAgICAgb3B0aW9uczogeyBibG9ja1F1b3RlOiB0cnVlLCBsaW5lV2lkdGg6IC0xIH1cbiAgICB9KTtcbiAgICBzd2l0Y2ggKHNvdXJjZVswXSkge1xuICAgICAgICBjYXNlICd8JzpcbiAgICAgICAgY2FzZSAnPic6XG4gICAgICAgICAgICBzZXRCbG9ja1NjYWxhclZhbHVlKHRva2VuLCBzb3VyY2UpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ1wiJzpcbiAgICAgICAgICAgIHNldEZsb3dTY2FsYXJWYWx1ZSh0b2tlbiwgc291cmNlLCAnZG91YmxlLXF1b3RlZC1zY2FsYXInKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiJ1wiOlxuICAgICAgICAgICAgc2V0Rmxvd1NjYWxhclZhbHVlKHRva2VuLCBzb3VyY2UsICdzaW5nbGUtcXVvdGVkLXNjYWxhcicpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBzZXRGbG93U2NhbGFyVmFsdWUodG9rZW4sIHNvdXJjZSwgJ3NjYWxhcicpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHNldEJsb2NrU2NhbGFyVmFsdWUodG9rZW4sIHNvdXJjZSkge1xuICAgIGNvbnN0IGhlID0gc291cmNlLmluZGV4T2YoJ1xcbicpO1xuICAgIGNvbnN0IGhlYWQgPSBzb3VyY2Uuc3Vic3RyaW5nKDAsIGhlKTtcbiAgICBjb25zdCBib2R5ID0gc291cmNlLnN1YnN0cmluZyhoZSArIDEpICsgJ1xcbic7XG4gICAgaWYgKHRva2VuLnR5cGUgPT09ICdibG9jay1zY2FsYXInKSB7XG4gICAgICAgIGNvbnN0IGhlYWRlciA9IHRva2VuLnByb3BzWzBdO1xuICAgICAgICBpZiAoaGVhZGVyLnR5cGUgIT09ICdibG9jay1zY2FsYXItaGVhZGVyJylcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBibG9jayBzY2FsYXIgaGVhZGVyJyk7XG4gICAgICAgIGhlYWRlci5zb3VyY2UgPSBoZWFkO1xuICAgICAgICB0b2tlbi5zb3VyY2UgPSBib2R5O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgY29uc3QgeyBvZmZzZXQgfSA9IHRva2VuO1xuICAgICAgICBjb25zdCBpbmRlbnQgPSAnaW5kZW50JyBpbiB0b2tlbiA/IHRva2VuLmluZGVudCA6IC0xO1xuICAgICAgICBjb25zdCBwcm9wcyA9IFtcbiAgICAgICAgICAgIHsgdHlwZTogJ2Jsb2NrLXNjYWxhci1oZWFkZXInLCBvZmZzZXQsIGluZGVudCwgc291cmNlOiBoZWFkIH1cbiAgICAgICAgXTtcbiAgICAgICAgaWYgKCFhZGRFbmR0b0Jsb2NrUHJvcHMocHJvcHMsICdlbmQnIGluIHRva2VuID8gdG9rZW4uZW5kIDogdW5kZWZpbmVkKSlcbiAgICAgICAgICAgIHByb3BzLnB1c2goeyB0eXBlOiAnbmV3bGluZScsIG9mZnNldDogLTEsIGluZGVudCwgc291cmNlOiAnXFxuJyB9KTtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXModG9rZW4pKVxuICAgICAgICAgICAgaWYgKGtleSAhPT0gJ3R5cGUnICYmIGtleSAhPT0gJ29mZnNldCcpXG4gICAgICAgICAgICAgICAgZGVsZXRlIHRva2VuW2tleV07XG4gICAgICAgIE9iamVjdC5hc3NpZ24odG9rZW4sIHsgdHlwZTogJ2Jsb2NrLXNjYWxhcicsIGluZGVudCwgcHJvcHMsIHNvdXJjZTogYm9keSB9KTtcbiAgICB9XG59XG4vKiogQHJldHVybnMgYHRydWVgIGlmIGxhc3QgdG9rZW4gaXMgYSBuZXdsaW5lICovXG5mdW5jdGlvbiBhZGRFbmR0b0Jsb2NrUHJvcHMocHJvcHMsIGVuZCkge1xuICAgIGlmIChlbmQpXG4gICAgICAgIGZvciAoY29uc3Qgc3Qgb2YgZW5kKVxuICAgICAgICAgICAgc3dpdGNoIChzdC50eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ2NvbW1lbnQnOlxuICAgICAgICAgICAgICAgICAgICBwcm9wcy5wdXNoKHN0KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgICAgICAgIHByb3BzLnB1c2goc3QpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5mdW5jdGlvbiBzZXRGbG93U2NhbGFyVmFsdWUodG9rZW4sIHNvdXJjZSwgdHlwZSkge1xuICAgIHN3aXRjaCAodG9rZW4udHlwZSkge1xuICAgICAgICBjYXNlICdzY2FsYXInOlxuICAgICAgICBjYXNlICdkb3VibGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgIGNhc2UgJ3NpbmdsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgICAgIHRva2VuLnR5cGUgPSB0eXBlO1xuICAgICAgICAgICAgdG9rZW4uc291cmNlID0gc291cmNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2Jsb2NrLXNjYWxhcic6IHtcbiAgICAgICAgICAgIGNvbnN0IGVuZCA9IHRva2VuLnByb3BzLnNsaWNlKDEpO1xuICAgICAgICAgICAgbGV0IG9hID0gc291cmNlLmxlbmd0aDtcbiAgICAgICAgICAgIGlmICh0b2tlbi5wcm9wc1swXS50eXBlID09PSAnYmxvY2stc2NhbGFyLWhlYWRlcicpXG4gICAgICAgICAgICAgICAgb2EgLT0gdG9rZW4ucHJvcHNbMF0uc291cmNlLmxlbmd0aDtcbiAgICAgICAgICAgIGZvciAoY29uc3QgdG9rIG9mIGVuZClcbiAgICAgICAgICAgICAgICB0b2sub2Zmc2V0ICs9IG9hO1xuICAgICAgICAgICAgZGVsZXRlIHRva2VuLnByb3BzO1xuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih0b2tlbiwgeyB0eXBlLCBzb3VyY2UsIGVuZCB9KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ2Jsb2NrLW1hcCc6XG4gICAgICAgIGNhc2UgJ2Jsb2NrLXNlcSc6IHtcbiAgICAgICAgICAgIGNvbnN0IG9mZnNldCA9IHRva2VuLm9mZnNldCArIHNvdXJjZS5sZW5ndGg7XG4gICAgICAgICAgICBjb25zdCBubCA9IHsgdHlwZTogJ25ld2xpbmUnLCBvZmZzZXQsIGluZGVudDogdG9rZW4uaW5kZW50LCBzb3VyY2U6ICdcXG4nIH07XG4gICAgICAgICAgICBkZWxldGUgdG9rZW4uaXRlbXM7XG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKHRva2VuLCB7IHR5cGUsIHNvdXJjZSwgZW5kOiBbbmxdIH0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgY29uc3QgaW5kZW50ID0gJ2luZGVudCcgaW4gdG9rZW4gPyB0b2tlbi5pbmRlbnQgOiAtMTtcbiAgICAgICAgICAgIGNvbnN0IGVuZCA9ICdlbmQnIGluIHRva2VuICYmIEFycmF5LmlzQXJyYXkodG9rZW4uZW5kKVxuICAgICAgICAgICAgICAgID8gdG9rZW4uZW5kLmZpbHRlcihzdCA9PiBzdC50eXBlID09PSAnc3BhY2UnIHx8XG4gICAgICAgICAgICAgICAgICAgIHN0LnR5cGUgPT09ICdjb21tZW50JyB8fFxuICAgICAgICAgICAgICAgICAgICBzdC50eXBlID09PSAnbmV3bGluZScpXG4gICAgICAgICAgICAgICAgOiBbXTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHRva2VuKSlcbiAgICAgICAgICAgICAgICBpZiAoa2V5ICE9PSAndHlwZScgJiYga2V5ICE9PSAnb2Zmc2V0JylcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHRva2VuW2tleV07XG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKHRva2VuLCB7IHR5cGUsIGluZGVudCwgc291cmNlLCBlbmQgfSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydHMuY3JlYXRlU2NhbGFyVG9rZW4gPSBjcmVhdGVTY2FsYXJUb2tlbjtcbmV4cG9ydHMucmVzb2x2ZUFzU2NhbGFyID0gcmVzb2x2ZUFzU2NhbGFyO1xuZXhwb3J0cy5zZXRTY2FsYXJWYWx1ZSA9IHNldFNjYWxhclZhbHVlO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogU3RyaW5naWZ5IGEgQ1NUIGRvY3VtZW50LCB0b2tlbiwgb3IgY29sbGVjdGlvbiBpdGVtXG4gKlxuICogRmFpciB3YXJuaW5nOiBUaGlzIGFwcGxpZXMgbm8gdmFsaWRhdGlvbiB3aGF0c29ldmVyLCBhbmRcbiAqIHNpbXBseSBjb25jYXRlbmF0ZXMgdGhlIHNvdXJjZXMgaW4gdGhlaXIgbG9naWNhbCBvcmRlci5cbiAqL1xuY29uc3Qgc3RyaW5naWZ5ID0gKGNzdCkgPT4gJ3R5cGUnIGluIGNzdCA/IHN0cmluZ2lmeVRva2VuKGNzdCkgOiBzdHJpbmdpZnlJdGVtKGNzdCk7XG5mdW5jdGlvbiBzdHJpbmdpZnlUb2tlbih0b2tlbikge1xuICAgIHN3aXRjaCAodG9rZW4udHlwZSkge1xuICAgICAgICBjYXNlICdibG9jay1zY2FsYXInOiB7XG4gICAgICAgICAgICBsZXQgcmVzID0gJyc7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHRvayBvZiB0b2tlbi5wcm9wcylcbiAgICAgICAgICAgICAgICByZXMgKz0gc3RyaW5naWZ5VG9rZW4odG9rKTtcbiAgICAgICAgICAgIHJldHVybiByZXMgKyB0b2tlbi5zb3VyY2U7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnYmxvY2stbWFwJzpcbiAgICAgICAgY2FzZSAnYmxvY2stc2VxJzoge1xuICAgICAgICAgICAgbGV0IHJlcyA9ICcnO1xuICAgICAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIHRva2VuLml0ZW1zKVxuICAgICAgICAgICAgICAgIHJlcyArPSBzdHJpbmdpZnlJdGVtKGl0ZW0pO1xuICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdmbG93LWNvbGxlY3Rpb24nOiB7XG4gICAgICAgICAgICBsZXQgcmVzID0gdG9rZW4uc3RhcnQuc291cmNlO1xuICAgICAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIHRva2VuLml0ZW1zKVxuICAgICAgICAgICAgICAgIHJlcyArPSBzdHJpbmdpZnlJdGVtKGl0ZW0pO1xuICAgICAgICAgICAgZm9yIChjb25zdCBzdCBvZiB0b2tlbi5lbmQpXG4gICAgICAgICAgICAgICAgcmVzICs9IHN0LnNvdXJjZTtcbiAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnZG9jdW1lbnQnOiB7XG4gICAgICAgICAgICBsZXQgcmVzID0gc3RyaW5naWZ5SXRlbSh0b2tlbik7XG4gICAgICAgICAgICBpZiAodG9rZW4uZW5kKVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgc3Qgb2YgdG9rZW4uZW5kKVxuICAgICAgICAgICAgICAgICAgICByZXMgKz0gc3Quc291cmNlO1xuICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgfVxuICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICBsZXQgcmVzID0gdG9rZW4uc291cmNlO1xuICAgICAgICAgICAgaWYgKCdlbmQnIGluIHRva2VuICYmIHRva2VuLmVuZClcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHN0IG9mIHRva2VuLmVuZClcbiAgICAgICAgICAgICAgICAgICAgcmVzICs9IHN0LnNvdXJjZTtcbiAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBzdHJpbmdpZnlJdGVtKHsgc3RhcnQsIGtleSwgc2VwLCB2YWx1ZSB9KSB7XG4gICAgbGV0IHJlcyA9ICcnO1xuICAgIGZvciAoY29uc3Qgc3Qgb2Ygc3RhcnQpXG4gICAgICAgIHJlcyArPSBzdC5zb3VyY2U7XG4gICAgaWYgKGtleSlcbiAgICAgICAgcmVzICs9IHN0cmluZ2lmeVRva2VuKGtleSk7XG4gICAgaWYgKHNlcClcbiAgICAgICAgZm9yIChjb25zdCBzdCBvZiBzZXApXG4gICAgICAgICAgICByZXMgKz0gc3Quc291cmNlO1xuICAgIGlmICh2YWx1ZSlcbiAgICAgICAgcmVzICs9IHN0cmluZ2lmeVRva2VuKHZhbHVlKTtcbiAgICByZXR1cm4gcmVzO1xufVxuXG5leHBvcnRzLnN0cmluZ2lmeSA9IHN0cmluZ2lmeTtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBCUkVBSyA9IFN5bWJvbCgnYnJlYWsgdmlzaXQnKTtcbmNvbnN0IFNLSVAgPSBTeW1ib2woJ3NraXAgY2hpbGRyZW4nKTtcbmNvbnN0IFJFTU9WRSA9IFN5bWJvbCgncmVtb3ZlIGl0ZW0nKTtcbi8qKlxuICogQXBwbHkgYSB2aXNpdG9yIHRvIGEgQ1NUIGRvY3VtZW50IG9yIGl0ZW0uXG4gKlxuICogV2Fsa3MgdGhyb3VnaCB0aGUgdHJlZSAoZGVwdGgtZmlyc3QpIHN0YXJ0aW5nIGZyb20gdGhlIHJvb3QsIGNhbGxpbmcgYVxuICogYHZpc2l0b3JgIGZ1bmN0aW9uIHdpdGggdHdvIGFyZ3VtZW50cyB3aGVuIGVudGVyaW5nIGVhY2ggaXRlbTpcbiAqICAgLSBgaXRlbWA6IFRoZSBjdXJyZW50IGl0ZW0sIHdoaWNoIGluY2x1ZGVkIHRoZSBmb2xsb3dpbmcgbWVtYmVyczpcbiAqICAgICAtIGBzdGFydDogU291cmNlVG9rZW5bXWAg4oCTIFNvdXJjZSB0b2tlbnMgYmVmb3JlIHRoZSBrZXkgb3IgdmFsdWUsXG4gKiAgICAgICBwb3NzaWJseSBpbmNsdWRpbmcgaXRzIGFuY2hvciBvciB0YWcuXG4gKiAgICAgLSBga2V5PzogVG9rZW4gfCBudWxsYCDigJMgU2V0IGZvciBwYWlyIHZhbHVlcy4gTWF5IHRoZW4gYmUgYG51bGxgLCBpZlxuICogICAgICAgdGhlIGtleSBiZWZvcmUgdGhlIGA6YCBzZXBhcmF0b3IgaXMgZW1wdHkuXG4gKiAgICAgLSBgc2VwPzogU291cmNlVG9rZW5bXWAg4oCTIFNvdXJjZSB0b2tlbnMgYmV0d2VlbiB0aGUga2V5IGFuZCB0aGUgdmFsdWUsXG4gKiAgICAgICB3aGljaCBzaG91bGQgaW5jbHVkZSB0aGUgYDpgIG1hcCB2YWx1ZSBpbmRpY2F0b3IgaWYgYHZhbHVlYCBpcyBzZXQuXG4gKiAgICAgLSBgdmFsdWU/OiBUb2tlbmAg4oCTIFRoZSB2YWx1ZSBvZiBhIHNlcXVlbmNlIGl0ZW0sIG9yIG9mIGEgbWFwIHBhaXIuXG4gKiAgIC0gYHBhdGhgOiBUaGUgc3RlcHMgZnJvbSB0aGUgcm9vdCB0byB0aGUgY3VycmVudCBub2RlLCBhcyBhbiBhcnJheSBvZlxuICogICAgIGBbJ2tleScgfCAndmFsdWUnLCBudW1iZXJdYCB0dXBsZXMuXG4gKlxuICogVGhlIHJldHVybiB2YWx1ZSBvZiB0aGUgdmlzaXRvciBtYXkgYmUgdXNlZCB0byBjb250cm9sIHRoZSB0cmF2ZXJzYWw6XG4gKiAgIC0gYHVuZGVmaW5lZGAgKGRlZmF1bHQpOiBEbyBub3RoaW5nIGFuZCBjb250aW51ZVxuICogICAtIGB2aXNpdC5TS0lQYDogRG8gbm90IHZpc2l0IHRoZSBjaGlsZHJlbiBvZiB0aGlzIHRva2VuLCBjb250aW51ZSB3aXRoXG4gKiAgICAgIG5leHQgc2libGluZ1xuICogICAtIGB2aXNpdC5CUkVBS2A6IFRlcm1pbmF0ZSB0cmF2ZXJzYWwgY29tcGxldGVseVxuICogICAtIGB2aXNpdC5SRU1PVkVgOiBSZW1vdmUgdGhlIGN1cnJlbnQgaXRlbSwgdGhlbiBjb250aW51ZSB3aXRoIHRoZSBuZXh0IG9uZVxuICogICAtIGBudW1iZXJgOiBTZXQgdGhlIGluZGV4IG9mIHRoZSBuZXh0IHN0ZXAuIFRoaXMgaXMgdXNlZnVsIGVzcGVjaWFsbHkgaWZcbiAqICAgICB0aGUgaW5kZXggb2YgdGhlIGN1cnJlbnQgdG9rZW4gaGFzIGNoYW5nZWQuXG4gKiAgIC0gYGZ1bmN0aW9uYDogRGVmaW5lIHRoZSBuZXh0IHZpc2l0b3IgZm9yIHRoaXMgaXRlbS4gQWZ0ZXIgdGhlIG9yaWdpbmFsXG4gKiAgICAgdmlzaXRvciBpcyBjYWxsZWQgb24gaXRlbSBlbnRyeSwgbmV4dCB2aXNpdG9ycyBhcmUgY2FsbGVkIGFmdGVyIGhhbmRsaW5nXG4gKiAgICAgYSBub24tZW1wdHkgYGtleWAgYW5kIHdoZW4gZXhpdGluZyB0aGUgaXRlbS5cbiAqL1xuZnVuY3Rpb24gdmlzaXQoY3N0LCB2aXNpdG9yKSB7XG4gICAgaWYgKCd0eXBlJyBpbiBjc3QgJiYgY3N0LnR5cGUgPT09ICdkb2N1bWVudCcpXG4gICAgICAgIGNzdCA9IHsgc3RhcnQ6IGNzdC5zdGFydCwgdmFsdWU6IGNzdC52YWx1ZSB9O1xuICAgIF92aXNpdChPYmplY3QuZnJlZXplKFtdKSwgY3N0LCB2aXNpdG9yKTtcbn1cbi8vIFdpdGhvdXQgdGhlIGBhcyBzeW1ib2xgIGNhc3RzLCBUUyBkZWNsYXJlcyB0aGVzZSBpbiB0aGUgYHZpc2l0YFxuLy8gbmFtZXNwYWNlIHVzaW5nIGB2YXJgLCBidXQgdGhlbiBjb21wbGFpbnMgYWJvdXQgdGhhdCBiZWNhdXNlXG4vLyBgdW5pcXVlIHN5bWJvbGAgbXVzdCBiZSBgY29uc3RgLlxuLyoqIFRlcm1pbmF0ZSB2aXNpdCB0cmF2ZXJzYWwgY29tcGxldGVseSAqL1xudmlzaXQuQlJFQUsgPSBCUkVBSztcbi8qKiBEbyBub3QgdmlzaXQgdGhlIGNoaWxkcmVuIG9mIHRoZSBjdXJyZW50IGl0ZW0gKi9cbnZpc2l0LlNLSVAgPSBTS0lQO1xuLyoqIFJlbW92ZSB0aGUgY3VycmVudCBpdGVtICovXG52aXNpdC5SRU1PVkUgPSBSRU1PVkU7XG4vKiogRmluZCB0aGUgaXRlbSBhdCBgcGF0aGAgZnJvbSBgY3N0YCBhcyB0aGUgcm9vdCAqL1xudmlzaXQuaXRlbUF0UGF0aCA9IChjc3QsIHBhdGgpID0+IHtcbiAgICBsZXQgaXRlbSA9IGNzdDtcbiAgICBmb3IgKGNvbnN0IFtmaWVsZCwgaW5kZXhdIG9mIHBhdGgpIHtcbiAgICAgICAgY29uc3QgdG9rID0gaXRlbT8uW2ZpZWxkXTtcbiAgICAgICAgaWYgKHRvayAmJiAnaXRlbXMnIGluIHRvaykge1xuICAgICAgICAgICAgaXRlbSA9IHRvay5pdGVtc1tpbmRleF07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgcmV0dXJuIGl0ZW07XG59O1xuLyoqXG4gKiBHZXQgdGhlIGltbWVkaWF0ZSBwYXJlbnQgY29sbGVjdGlvbiBvZiB0aGUgaXRlbSBhdCBgcGF0aGAgZnJvbSBgY3N0YCBhcyB0aGUgcm9vdC5cbiAqXG4gKiBUaHJvd3MgYW4gZXJyb3IgaWYgdGhlIGNvbGxlY3Rpb24gaXMgbm90IGZvdW5kLCB3aGljaCBzaG91bGQgbmV2ZXIgaGFwcGVuIGlmIHRoZSBpdGVtIGl0c2VsZiBleGlzdHMuXG4gKi9cbnZpc2l0LnBhcmVudENvbGxlY3Rpb24gPSAoY3N0LCBwYXRoKSA9PiB7XG4gICAgY29uc3QgcGFyZW50ID0gdmlzaXQuaXRlbUF0UGF0aChjc3QsIHBhdGguc2xpY2UoMCwgLTEpKTtcbiAgICBjb25zdCBmaWVsZCA9IHBhdGhbcGF0aC5sZW5ndGggLSAxXVswXTtcbiAgICBjb25zdCBjb2xsID0gcGFyZW50Py5bZmllbGRdO1xuICAgIGlmIChjb2xsICYmICdpdGVtcycgaW4gY29sbClcbiAgICAgICAgcmV0dXJuIGNvbGw7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdQYXJlbnQgY29sbGVjdGlvbiBub3QgZm91bmQnKTtcbn07XG5mdW5jdGlvbiBfdmlzaXQocGF0aCwgaXRlbSwgdmlzaXRvcikge1xuICAgIGxldCBjdHJsID0gdmlzaXRvcihpdGVtLCBwYXRoKTtcbiAgICBpZiAodHlwZW9mIGN0cmwgPT09ICdzeW1ib2wnKVxuICAgICAgICByZXR1cm4gY3RybDtcbiAgICBmb3IgKGNvbnN0IGZpZWxkIG9mIFsna2V5JywgJ3ZhbHVlJ10pIHtcbiAgICAgICAgY29uc3QgdG9rZW4gPSBpdGVtW2ZpZWxkXTtcbiAgICAgICAgaWYgKHRva2VuICYmICdpdGVtcycgaW4gdG9rZW4pIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdG9rZW4uaXRlbXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjaSA9IF92aXNpdChPYmplY3QuZnJlZXplKHBhdGguY29uY2F0KFtbZmllbGQsIGldXSkpLCB0b2tlbi5pdGVtc1tpXSwgdmlzaXRvcik7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjaSA9PT0gJ251bWJlcicpXG4gICAgICAgICAgICAgICAgICAgIGkgPSBjaSAtIDE7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoY2kgPT09IEJSRUFLKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQlJFQUs7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoY2kgPT09IFJFTU9WRSkge1xuICAgICAgICAgICAgICAgICAgICB0b2tlbi5pdGVtcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGkgLT0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZW9mIGN0cmwgPT09ICdmdW5jdGlvbicgJiYgZmllbGQgPT09ICdrZXknKVxuICAgICAgICAgICAgICAgIGN0cmwgPSBjdHJsKGl0ZW0sIHBhdGgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0eXBlb2YgY3RybCA9PT0gJ2Z1bmN0aW9uJyA/IGN0cmwoaXRlbSwgcGF0aCkgOiBjdHJsO1xufVxuXG5leHBvcnRzLnZpc2l0ID0gdmlzaXQ7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIGNzdFNjYWxhciA9IHJlcXVpcmUoJy4vY3N0LXNjYWxhci5qcycpO1xudmFyIGNzdFN0cmluZ2lmeSA9IHJlcXVpcmUoJy4vY3N0LXN0cmluZ2lmeS5qcycpO1xudmFyIGNzdFZpc2l0ID0gcmVxdWlyZSgnLi9jc3QtdmlzaXQuanMnKTtcblxuLyoqIFRoZSBieXRlIG9yZGVyIG1hcmsgKi9cbmNvbnN0IEJPTSA9ICdcXHV7RkVGRn0nO1xuLyoqIFN0YXJ0IG9mIGRvYy1tb2RlICovXG5jb25zdCBET0NVTUVOVCA9ICdcXHgwMic7IC8vIEMwOiBTdGFydCBvZiBUZXh0XG4vKiogVW5leHBlY3RlZCBlbmQgb2YgZmxvdy1tb2RlICovXG5jb25zdCBGTE9XX0VORCA9ICdcXHgxOCc7IC8vIEMwOiBDYW5jZWxcbi8qKiBOZXh0IHRva2VuIGlzIGEgc2NhbGFyIHZhbHVlICovXG5jb25zdCBTQ0FMQVIgPSAnXFx4MWYnOyAvLyBDMDogVW5pdCBTZXBhcmF0b3Jcbi8qKiBAcmV0dXJucyBgdHJ1ZWAgaWYgYHRva2VuYCBpcyBhIGZsb3cgb3IgYmxvY2sgY29sbGVjdGlvbiAqL1xuY29uc3QgaXNDb2xsZWN0aW9uID0gKHRva2VuKSA9PiAhIXRva2VuICYmICdpdGVtcycgaW4gdG9rZW47XG4vKiogQHJldHVybnMgYHRydWVgIGlmIGB0b2tlbmAgaXMgYSBmbG93IG9yIGJsb2NrIHNjYWxhcjsgbm90IGFuIGFsaWFzICovXG5jb25zdCBpc1NjYWxhciA9ICh0b2tlbikgPT4gISF0b2tlbiAmJlxuICAgICh0b2tlbi50eXBlID09PSAnc2NhbGFyJyB8fFxuICAgICAgICB0b2tlbi50eXBlID09PSAnc2luZ2xlLXF1b3RlZC1zY2FsYXInIHx8XG4gICAgICAgIHRva2VuLnR5cGUgPT09ICdkb3VibGUtcXVvdGVkLXNjYWxhcicgfHxcbiAgICAgICAgdG9rZW4udHlwZSA9PT0gJ2Jsb2NrLXNjYWxhcicpO1xuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbi8qKiBHZXQgYSBwcmludGFibGUgcmVwcmVzZW50YXRpb24gb2YgYSBsZXhlciB0b2tlbiAqL1xuZnVuY3Rpb24gcHJldHR5VG9rZW4odG9rZW4pIHtcbiAgICBzd2l0Y2ggKHRva2VuKSB7XG4gICAgICAgIGNhc2UgQk9NOlxuICAgICAgICAgICAgcmV0dXJuICc8Qk9NPic7XG4gICAgICAgIGNhc2UgRE9DVU1FTlQ6XG4gICAgICAgICAgICByZXR1cm4gJzxET0M+JztcbiAgICAgICAgY2FzZSBGTE9XX0VORDpcbiAgICAgICAgICAgIHJldHVybiAnPEZMT1dfRU5EPic7XG4gICAgICAgIGNhc2UgU0NBTEFSOlxuICAgICAgICAgICAgcmV0dXJuICc8U0NBTEFSPic7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodG9rZW4pO1xuICAgIH1cbn1cbi8qKiBJZGVudGlmeSB0aGUgdHlwZSBvZiBhIGxleGVyIHRva2VuLiBNYXkgcmV0dXJuIGBudWxsYCBmb3IgdW5rbm93biB0b2tlbnMuICovXG5mdW5jdGlvbiB0b2tlblR5cGUoc291cmNlKSB7XG4gICAgc3dpdGNoIChzb3VyY2UpIHtcbiAgICAgICAgY2FzZSBCT006XG4gICAgICAgICAgICByZXR1cm4gJ2J5dGUtb3JkZXItbWFyayc7XG4gICAgICAgIGNhc2UgRE9DVU1FTlQ6XG4gICAgICAgICAgICByZXR1cm4gJ2RvYy1tb2RlJztcbiAgICAgICAgY2FzZSBGTE9XX0VORDpcbiAgICAgICAgICAgIHJldHVybiAnZmxvdy1lcnJvci1lbmQnO1xuICAgICAgICBjYXNlIFNDQUxBUjpcbiAgICAgICAgICAgIHJldHVybiAnc2NhbGFyJztcbiAgICAgICAgY2FzZSAnLS0tJzpcbiAgICAgICAgICAgIHJldHVybiAnZG9jLXN0YXJ0JztcbiAgICAgICAgY2FzZSAnLi4uJzpcbiAgICAgICAgICAgIHJldHVybiAnZG9jLWVuZCc7XG4gICAgICAgIGNhc2UgJyc6XG4gICAgICAgIGNhc2UgJ1xcbic6XG4gICAgICAgIGNhc2UgJ1xcclxcbic6XG4gICAgICAgICAgICByZXR1cm4gJ25ld2xpbmUnO1xuICAgICAgICBjYXNlICctJzpcbiAgICAgICAgICAgIHJldHVybiAnc2VxLWl0ZW0taW5kJztcbiAgICAgICAgY2FzZSAnPyc6XG4gICAgICAgICAgICByZXR1cm4gJ2V4cGxpY2l0LWtleS1pbmQnO1xuICAgICAgICBjYXNlICc6JzpcbiAgICAgICAgICAgIHJldHVybiAnbWFwLXZhbHVlLWluZCc7XG4gICAgICAgIGNhc2UgJ3snOlxuICAgICAgICAgICAgcmV0dXJuICdmbG93LW1hcC1zdGFydCc7XG4gICAgICAgIGNhc2UgJ30nOlxuICAgICAgICAgICAgcmV0dXJuICdmbG93LW1hcC1lbmQnO1xuICAgICAgICBjYXNlICdbJzpcbiAgICAgICAgICAgIHJldHVybiAnZmxvdy1zZXEtc3RhcnQnO1xuICAgICAgICBjYXNlICddJzpcbiAgICAgICAgICAgIHJldHVybiAnZmxvdy1zZXEtZW5kJztcbiAgICAgICAgY2FzZSAnLCc6XG4gICAgICAgICAgICByZXR1cm4gJ2NvbW1hJztcbiAgICB9XG4gICAgc3dpdGNoIChzb3VyY2VbMF0pIHtcbiAgICAgICAgY2FzZSAnICc6XG4gICAgICAgIGNhc2UgJ1xcdCc6XG4gICAgICAgICAgICByZXR1cm4gJ3NwYWNlJztcbiAgICAgICAgY2FzZSAnIyc6XG4gICAgICAgICAgICByZXR1cm4gJ2NvbW1lbnQnO1xuICAgICAgICBjYXNlICclJzpcbiAgICAgICAgICAgIHJldHVybiAnZGlyZWN0aXZlLWxpbmUnO1xuICAgICAgICBjYXNlICcqJzpcbiAgICAgICAgICAgIHJldHVybiAnYWxpYXMnO1xuICAgICAgICBjYXNlICcmJzpcbiAgICAgICAgICAgIHJldHVybiAnYW5jaG9yJztcbiAgICAgICAgY2FzZSAnISc6XG4gICAgICAgICAgICByZXR1cm4gJ3RhZyc7XG4gICAgICAgIGNhc2UgXCInXCI6XG4gICAgICAgICAgICByZXR1cm4gJ3NpbmdsZS1xdW90ZWQtc2NhbGFyJztcbiAgICAgICAgY2FzZSAnXCInOlxuICAgICAgICAgICAgcmV0dXJuICdkb3VibGUtcXVvdGVkLXNjYWxhcic7XG4gICAgICAgIGNhc2UgJ3wnOlxuICAgICAgICBjYXNlICc+JzpcbiAgICAgICAgICAgIHJldHVybiAnYmxvY2stc2NhbGFyLWhlYWRlcic7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufVxuXG5leHBvcnRzLmNyZWF0ZVNjYWxhclRva2VuID0gY3N0U2NhbGFyLmNyZWF0ZVNjYWxhclRva2VuO1xuZXhwb3J0cy5yZXNvbHZlQXNTY2FsYXIgPSBjc3RTY2FsYXIucmVzb2x2ZUFzU2NhbGFyO1xuZXhwb3J0cy5zZXRTY2FsYXJWYWx1ZSA9IGNzdFNjYWxhci5zZXRTY2FsYXJWYWx1ZTtcbmV4cG9ydHMuc3RyaW5naWZ5ID0gY3N0U3RyaW5naWZ5LnN0cmluZ2lmeTtcbmV4cG9ydHMudmlzaXQgPSBjc3RWaXNpdC52aXNpdDtcbmV4cG9ydHMuQk9NID0gQk9NO1xuZXhwb3J0cy5ET0NVTUVOVCA9IERPQ1VNRU5UO1xuZXhwb3J0cy5GTE9XX0VORCA9IEZMT1dfRU5EO1xuZXhwb3J0cy5TQ0FMQVIgPSBTQ0FMQVI7XG5leHBvcnRzLmlzQ29sbGVjdGlvbiA9IGlzQ29sbGVjdGlvbjtcbmV4cG9ydHMuaXNTY2FsYXIgPSBpc1NjYWxhcjtcbmV4cG9ydHMucHJldHR5VG9rZW4gPSBwcmV0dHlUb2tlbjtcbmV4cG9ydHMudG9rZW5UeXBlID0gdG9rZW5UeXBlO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBjc3QgPSByZXF1aXJlKCcuL2NzdC5qcycpO1xuXG4vKlxuU1RBUlQgLT4gc3RyZWFtXG5cbnN0cmVhbVxuICBkaXJlY3RpdmUgLT4gbGluZS1lbmQgLT4gc3RyZWFtXG4gIGluZGVudCArIGxpbmUtZW5kIC0+IHN0cmVhbVxuICBbZWxzZV0gLT4gbGluZS1zdGFydFxuXG5saW5lLWVuZFxuICBjb21tZW50IC0+IGxpbmUtZW5kXG4gIG5ld2xpbmUgLT4gLlxuICBpbnB1dC1lbmQgLT4gRU5EXG5cbmxpbmUtc3RhcnRcbiAgZG9jLXN0YXJ0IC0+IGRvY1xuICBkb2MtZW5kIC0+IHN0cmVhbVxuICBbZWxzZV0gLT4gaW5kZW50IC0+IGJsb2NrLXN0YXJ0XG5cbmJsb2NrLXN0YXJ0XG4gIHNlcS1pdGVtLXN0YXJ0IC0+IGJsb2NrLXN0YXJ0XG4gIGV4cGxpY2l0LWtleS1zdGFydCAtPiBibG9jay1zdGFydFxuICBtYXAtdmFsdWUtc3RhcnQgLT4gYmxvY2stc3RhcnRcbiAgW2Vsc2VdIC0+IGRvY1xuXG5kb2NcbiAgbGluZS1lbmQgLT4gbGluZS1zdGFydFxuICBzcGFjZXMgLT4gZG9jXG4gIGFuY2hvciAtPiBkb2NcbiAgdGFnIC0+IGRvY1xuICBmbG93LXN0YXJ0IC0+IGZsb3cgLT4gZG9jXG4gIGZsb3ctZW5kIC0+IGVycm9yIC0+IGRvY1xuICBzZXEtaXRlbS1zdGFydCAtPiBlcnJvciAtPiBkb2NcbiAgZXhwbGljaXQta2V5LXN0YXJ0IC0+IGVycm9yIC0+IGRvY1xuICBtYXAtdmFsdWUtc3RhcnQgLT4gZG9jXG4gIGFsaWFzIC0+IGRvY1xuICBxdW90ZS1zdGFydCAtPiBxdW90ZWQtc2NhbGFyIC0+IGRvY1xuICBibG9jay1zY2FsYXItaGVhZGVyIC0+IGxpbmUtZW5kIC0+IGJsb2NrLXNjYWxhcihtaW4pIC0+IGxpbmUtc3RhcnRcbiAgW2Vsc2VdIC0+IHBsYWluLXNjYWxhcihmYWxzZSwgbWluKSAtPiBkb2NcblxuZmxvd1xuICBsaW5lLWVuZCAtPiBmbG93XG4gIHNwYWNlcyAtPiBmbG93XG4gIGFuY2hvciAtPiBmbG93XG4gIHRhZyAtPiBmbG93XG4gIGZsb3ctc3RhcnQgLT4gZmxvdyAtPiBmbG93XG4gIGZsb3ctZW5kIC0+IC5cbiAgc2VxLWl0ZW0tc3RhcnQgLT4gZXJyb3IgLT4gZmxvd1xuICBleHBsaWNpdC1rZXktc3RhcnQgLT4gZmxvd1xuICBtYXAtdmFsdWUtc3RhcnQgLT4gZmxvd1xuICBhbGlhcyAtPiBmbG93XG4gIHF1b3RlLXN0YXJ0IC0+IHF1b3RlZC1zY2FsYXIgLT4gZmxvd1xuICBjb21tYSAtPiBmbG93XG4gIFtlbHNlXSAtPiBwbGFpbi1zY2FsYXIodHJ1ZSwgMCkgLT4gZmxvd1xuXG5xdW90ZWQtc2NhbGFyXG4gIHF1b3RlLWVuZCAtPiAuXG4gIFtlbHNlXSAtPiBxdW90ZWQtc2NhbGFyXG5cbmJsb2NrLXNjYWxhcihtaW4pXG4gIG5ld2xpbmUgKyBwZWVrKGluZGVudCA8IG1pbikgLT4gLlxuICBbZWxzZV0gLT4gYmxvY2stc2NhbGFyKG1pbilcblxucGxhaW4tc2NhbGFyKGlzLWZsb3csIG1pbilcbiAgc2NhbGFyLWVuZChpcy1mbG93KSAtPiAuXG4gIHBlZWsobmV3bGluZSArIChpbmRlbnQgPCBtaW4pKSAtPiAuXG4gIFtlbHNlXSAtPiBwbGFpbi1zY2FsYXIobWluKVxuKi9cbmZ1bmN0aW9uIGlzRW1wdHkoY2gpIHtcbiAgICBzd2l0Y2ggKGNoKSB7XG4gICAgICAgIGNhc2UgdW5kZWZpbmVkOlxuICAgICAgICBjYXNlICcgJzpcbiAgICAgICAgY2FzZSAnXFxuJzpcbiAgICAgICAgY2FzZSAnXFxyJzpcbiAgICAgICAgY2FzZSAnXFx0JzpcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cbmNvbnN0IGhleERpZ2l0cyA9IG5ldyBTZXQoJzAxMjM0NTY3ODlBQkNERUZhYmNkZWYnKTtcbmNvbnN0IHRhZ0NoYXJzID0gbmV3IFNldChcIjAxMjM0NTY3ODlBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6LSM7Lz86QCY9KyRfLiF+KicoKVwiKTtcbmNvbnN0IGZsb3dJbmRpY2F0b3JDaGFycyA9IG5ldyBTZXQoJyxbXXt9Jyk7XG5jb25zdCBpbnZhbGlkQW5jaG9yQ2hhcnMgPSBuZXcgU2V0KCcgLFtde31cXG5cXHJcXHQnKTtcbmNvbnN0IGlzTm90QW5jaG9yQ2hhciA9IChjaCkgPT4gIWNoIHx8IGludmFsaWRBbmNob3JDaGFycy5oYXMoY2gpO1xuLyoqXG4gKiBTcGxpdHMgYW4gaW5wdXQgc3RyaW5nIGludG8gbGV4aWNhbCB0b2tlbnMsIGkuZS4gc21hbGxlciBzdHJpbmdzIHRoYXQgYXJlXG4gKiBlYXNpbHkgaWRlbnRpZmlhYmxlIGJ5IGB0b2tlbnMudG9rZW5UeXBlKClgLlxuICpcbiAqIExleGluZyBzdGFydHMgYWx3YXlzIGluIGEgXCJzdHJlYW1cIiBjb250ZXh0LiBJbmNvbXBsZXRlIGlucHV0IG1heSBiZSBidWZmZXJlZFxuICogdW50aWwgYSBjb21wbGV0ZSB0b2tlbiBjYW4gYmUgZW1pdHRlZC5cbiAqXG4gKiBJbiBhZGRpdGlvbiB0byBzbGljZXMgb2YgdGhlIG9yaWdpbmFsIGlucHV0LCB0aGUgZm9sbG93aW5nIGNvbnRyb2wgY2hhcmFjdGVyc1xuICogbWF5IGFsc28gYmUgZW1pdHRlZDpcbiAqXG4gKiAtIGBcXHgwMmAgKFN0YXJ0IG9mIFRleHQpOiBBIGRvY3VtZW50IHN0YXJ0cyB3aXRoIHRoZSBuZXh0IHRva2VuXG4gKiAtIGBcXHgxOGAgKENhbmNlbCk6IFVuZXhwZWN0ZWQgZW5kIG9mIGZsb3ctbW9kZSAoaW5kaWNhdGVzIGFuIGVycm9yKVxuICogLSBgXFx4MWZgIChVbml0IFNlcGFyYXRvcik6IE5leHQgdG9rZW4gaXMgYSBzY2FsYXIgdmFsdWVcbiAqIC0gYFxcdXtGRUZGfWAgKEJ5dGUgb3JkZXIgbWFyayk6IEVtaXR0ZWQgc2VwYXJhdGVseSBvdXRzaWRlIGRvY3VtZW50c1xuICovXG5jbGFzcyBMZXhlciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGbGFnIGluZGljYXRpbmcgd2hldGhlciB0aGUgZW5kIG9mIHRoZSBjdXJyZW50IGJ1ZmZlciBtYXJrcyB0aGUgZW5kIG9mXG4gICAgICAgICAqIGFsbCBpbnB1dFxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5hdEVuZCA9IGZhbHNlO1xuICAgICAgICAvKipcbiAgICAgICAgICogRXhwbGljaXQgaW5kZW50IHNldCBpbiBibG9jayBzY2FsYXIgaGVhZGVyLCBhcyBhbiBvZmZzZXQgZnJvbSB0aGUgY3VycmVudFxuICAgICAgICAgKiBtaW5pbXVtIGluZGVudCwgc28gZS5nLiBzZXQgdG8gMSBmcm9tIGEgaGVhZGVyIGB8MitgLiBTZXQgdG8gLTEgaWYgbm90XG4gICAgICAgICAqIGV4cGxpY2l0bHkgc2V0LlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5ibG9ja1NjYWxhckluZGVudCA9IC0xO1xuICAgICAgICAvKipcbiAgICAgICAgICogQmxvY2sgc2NhbGFycyB0aGF0IGluY2x1ZGUgYSArIChrZWVwKSBjaG9tcGluZyBpbmRpY2F0b3IgaW4gdGhlaXIgaGVhZGVyXG4gICAgICAgICAqIGluY2x1ZGUgdHJhaWxpbmcgZW1wdHkgbGluZXMsIHdoaWNoIGFyZSBvdGhlcndpc2UgZXhjbHVkZWQgZnJvbSB0aGVcbiAgICAgICAgICogc2NhbGFyJ3MgY29udGVudHMuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmJsb2NrU2NhbGFyS2VlcCA9IGZhbHNlO1xuICAgICAgICAvKiogQ3VycmVudCBpbnB1dCAqL1xuICAgICAgICB0aGlzLmJ1ZmZlciA9ICcnO1xuICAgICAgICAvKipcbiAgICAgICAgICogRmxhZyBub3Rpbmcgd2hldGhlciB0aGUgbWFwIHZhbHVlIGluZGljYXRvciA6IGNhbiBpbW1lZGlhdGVseSBmb2xsb3cgdGhpc1xuICAgICAgICAgKiBub2RlIHdpdGhpbiBhIGZsb3cgY29udGV4dC5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZmxvd0tleSA9IGZhbHNlO1xuICAgICAgICAvKiogQ291bnQgb2Ygc3Vycm91bmRpbmcgZmxvdyBjb2xsZWN0aW9uIGxldmVscy4gKi9cbiAgICAgICAgdGhpcy5mbG93TGV2ZWwgPSAwO1xuICAgICAgICAvKipcbiAgICAgICAgICogTWluaW11bSBsZXZlbCBvZiBpbmRlbnRhdGlvbiByZXF1aXJlZCBmb3IgbmV4dCBsaW5lcyB0byBiZSBwYXJzZWQgYXMgYVxuICAgICAgICAgKiBwYXJ0IG9mIHRoZSBjdXJyZW50IHNjYWxhciB2YWx1ZS5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaW5kZW50TmV4dCA9IDA7XG4gICAgICAgIC8qKiBJbmRlbnRhdGlvbiBsZXZlbCBvZiB0aGUgY3VycmVudCBsaW5lLiAqL1xuICAgICAgICB0aGlzLmluZGVudFZhbHVlID0gMDtcbiAgICAgICAgLyoqIFBvc2l0aW9uIG9mIHRoZSBuZXh0IFxcbiBjaGFyYWN0ZXIuICovXG4gICAgICAgIHRoaXMubGluZUVuZFBvcyA9IG51bGw7XG4gICAgICAgIC8qKiBTdG9yZXMgdGhlIHN0YXRlIG9mIHRoZSBsZXhlciBpZiByZWFjaGluZyB0aGUgZW5kIG9mIGluY3BvbXBsZXRlIGlucHV0ICovXG4gICAgICAgIHRoaXMubmV4dCA9IG51bGw7XG4gICAgICAgIC8qKiBBIHBvaW50ZXIgdG8gYGJ1ZmZlcmA7IHRoZSBjdXJyZW50IHBvc2l0aW9uIG9mIHRoZSBsZXhlci4gKi9cbiAgICAgICAgdGhpcy5wb3MgPSAwO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZSBZQU1MIHRva2VucyBmcm9tIHRoZSBgc291cmNlYCBzdHJpbmcuIElmIGBpbmNvbXBsZXRlYCxcbiAgICAgKiBhIHBhcnQgb2YgdGhlIGxhc3QgbGluZSBtYXkgYmUgbGVmdCBhcyBhIGJ1ZmZlciBmb3IgdGhlIG5leHQgY2FsbC5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIEEgZ2VuZXJhdG9yIG9mIGxleGljYWwgdG9rZW5zXG4gICAgICovXG4gICAgKmxleChzb3VyY2UsIGluY29tcGxldGUgPSBmYWxzZSkge1xuICAgICAgICBpZiAoc291cmNlKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHNvdXJjZSAhPT0gJ3N0cmluZycpXG4gICAgICAgICAgICAgICAgdGhyb3cgVHlwZUVycm9yKCdzb3VyY2UgaXMgbm90IGEgc3RyaW5nJyk7XG4gICAgICAgICAgICB0aGlzLmJ1ZmZlciA9IHRoaXMuYnVmZmVyID8gdGhpcy5idWZmZXIgKyBzb3VyY2UgOiBzb3VyY2U7XG4gICAgICAgICAgICB0aGlzLmxpbmVFbmRQb3MgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYXRFbmQgPSAhaW5jb21wbGV0ZTtcbiAgICAgICAgbGV0IG5leHQgPSB0aGlzLm5leHQgPz8gJ3N0cmVhbSc7XG4gICAgICAgIHdoaWxlIChuZXh0ICYmIChpbmNvbXBsZXRlIHx8IHRoaXMuaGFzQ2hhcnMoMSkpKVxuICAgICAgICAgICAgbmV4dCA9IHlpZWxkKiB0aGlzLnBhcnNlTmV4dChuZXh0KTtcbiAgICB9XG4gICAgYXRMaW5lRW5kKCkge1xuICAgICAgICBsZXQgaSA9IHRoaXMucG9zO1xuICAgICAgICBsZXQgY2ggPSB0aGlzLmJ1ZmZlcltpXTtcbiAgICAgICAgd2hpbGUgKGNoID09PSAnICcgfHwgY2ggPT09ICdcXHQnKVxuICAgICAgICAgICAgY2ggPSB0aGlzLmJ1ZmZlclsrK2ldO1xuICAgICAgICBpZiAoIWNoIHx8IGNoID09PSAnIycgfHwgY2ggPT09ICdcXG4nKVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIGlmIChjaCA9PT0gJ1xccicpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5idWZmZXJbaSArIDFdID09PSAnXFxuJztcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjaGFyQXQobikge1xuICAgICAgICByZXR1cm4gdGhpcy5idWZmZXJbdGhpcy5wb3MgKyBuXTtcbiAgICB9XG4gICAgY29udGludWVTY2FsYXIob2Zmc2V0KSB7XG4gICAgICAgIGxldCBjaCA9IHRoaXMuYnVmZmVyW29mZnNldF07XG4gICAgICAgIGlmICh0aGlzLmluZGVudE5leHQgPiAwKSB7XG4gICAgICAgICAgICBsZXQgaW5kZW50ID0gMDtcbiAgICAgICAgICAgIHdoaWxlIChjaCA9PT0gJyAnKVxuICAgICAgICAgICAgICAgIGNoID0gdGhpcy5idWZmZXJbKytpbmRlbnQgKyBvZmZzZXRdO1xuICAgICAgICAgICAgaWYgKGNoID09PSAnXFxyJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5leHQgPSB0aGlzLmJ1ZmZlcltpbmRlbnQgKyBvZmZzZXQgKyAxXTtcbiAgICAgICAgICAgICAgICBpZiAobmV4dCA9PT0gJ1xcbicgfHwgKCFuZXh0ICYmICF0aGlzLmF0RW5kKSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9mZnNldCArIGluZGVudCArIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY2ggPT09ICdcXG4nIHx8IGluZGVudCA+PSB0aGlzLmluZGVudE5leHQgfHwgKCFjaCAmJiAhdGhpcy5hdEVuZClcbiAgICAgICAgICAgICAgICA/IG9mZnNldCArIGluZGVudFxuICAgICAgICAgICAgICAgIDogLTE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoID09PSAnLScgfHwgY2ggPT09ICcuJykge1xuICAgICAgICAgICAgY29uc3QgZHQgPSB0aGlzLmJ1ZmZlci5zdWJzdHIob2Zmc2V0LCAzKTtcbiAgICAgICAgICAgIGlmICgoZHQgPT09ICctLS0nIHx8IGR0ID09PSAnLi4uJykgJiYgaXNFbXB0eSh0aGlzLmJ1ZmZlcltvZmZzZXQgKyAzXSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvZmZzZXQ7XG4gICAgfVxuICAgIGdldExpbmUoKSB7XG4gICAgICAgIGxldCBlbmQgPSB0aGlzLmxpbmVFbmRQb3M7XG4gICAgICAgIGlmICh0eXBlb2YgZW5kICE9PSAnbnVtYmVyJyB8fCAoZW5kICE9PSAtMSAmJiBlbmQgPCB0aGlzLnBvcykpIHtcbiAgICAgICAgICAgIGVuZCA9IHRoaXMuYnVmZmVyLmluZGV4T2YoJ1xcbicsIHRoaXMucG9zKTtcbiAgICAgICAgICAgIHRoaXMubGluZUVuZFBvcyA9IGVuZDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZW5kID09PSAtMSlcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmF0RW5kID8gdGhpcy5idWZmZXIuc3Vic3RyaW5nKHRoaXMucG9zKSA6IG51bGw7XG4gICAgICAgIGlmICh0aGlzLmJ1ZmZlcltlbmQgLSAxXSA9PT0gJ1xccicpXG4gICAgICAgICAgICBlbmQgLT0gMTtcbiAgICAgICAgcmV0dXJuIHRoaXMuYnVmZmVyLnN1YnN0cmluZyh0aGlzLnBvcywgZW5kKTtcbiAgICB9XG4gICAgaGFzQ2hhcnMobikge1xuICAgICAgICByZXR1cm4gdGhpcy5wb3MgKyBuIDw9IHRoaXMuYnVmZmVyLmxlbmd0aDtcbiAgICB9XG4gICAgc2V0TmV4dChzdGF0ZSkge1xuICAgICAgICB0aGlzLmJ1ZmZlciA9IHRoaXMuYnVmZmVyLnN1YnN0cmluZyh0aGlzLnBvcyk7XG4gICAgICAgIHRoaXMucG9zID0gMDtcbiAgICAgICAgdGhpcy5saW5lRW5kUG9zID0gbnVsbDtcbiAgICAgICAgdGhpcy5uZXh0ID0gc3RhdGU7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBwZWVrKG4pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYnVmZmVyLnN1YnN0cih0aGlzLnBvcywgbik7XG4gICAgfVxuICAgICpwYXJzZU5leHQobmV4dCkge1xuICAgICAgICBzd2l0Y2ggKG5leHQpIHtcbiAgICAgICAgICAgIGNhc2UgJ3N0cmVhbSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlU3RyZWFtKCk7XG4gICAgICAgICAgICBjYXNlICdsaW5lLXN0YXJ0JzpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VMaW5lU3RhcnQoKTtcbiAgICAgICAgICAgIGNhc2UgJ2Jsb2NrLXN0YXJ0JzpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VCbG9ja1N0YXJ0KCk7XG4gICAgICAgICAgICBjYXNlICdkb2MnOlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZURvY3VtZW50KCk7XG4gICAgICAgICAgICBjYXNlICdmbG93JzpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VGbG93Q29sbGVjdGlvbigpO1xuICAgICAgICAgICAgY2FzZSAncXVvdGVkLXNjYWxhcic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlUXVvdGVkU2NhbGFyKCk7XG4gICAgICAgICAgICBjYXNlICdibG9jay1zY2FsYXInOlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZUJsb2NrU2NhbGFyKCk7XG4gICAgICAgICAgICBjYXNlICdwbGFpbi1zY2FsYXInOlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZVBsYWluU2NhbGFyKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgKnBhcnNlU3RyZWFtKCkge1xuICAgICAgICBsZXQgbGluZSA9IHRoaXMuZ2V0TGluZSgpO1xuICAgICAgICBpZiAobGluZSA9PT0gbnVsbClcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldE5leHQoJ3N0cmVhbScpO1xuICAgICAgICBpZiAobGluZVswXSA9PT0gY3N0LkJPTSkge1xuICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaENvdW50KDEpO1xuICAgICAgICAgICAgbGluZSA9IGxpbmUuc3Vic3RyaW5nKDEpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsaW5lWzBdID09PSAnJScpIHtcbiAgICAgICAgICAgIGxldCBkaXJFbmQgPSBsaW5lLmxlbmd0aDtcbiAgICAgICAgICAgIGxldCBjcyA9IGxpbmUuaW5kZXhPZignIycpO1xuICAgICAgICAgICAgd2hpbGUgKGNzICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoID0gbGluZVtjcyAtIDFdO1xuICAgICAgICAgICAgICAgIGlmIChjaCA9PT0gJyAnIHx8IGNoID09PSAnXFx0Jykge1xuICAgICAgICAgICAgICAgICAgICBkaXJFbmQgPSBjcyAtIDE7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY3MgPSBsaW5lLmluZGV4T2YoJyMnLCBjcyArIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2ggPSBsaW5lW2RpckVuZCAtIDFdO1xuICAgICAgICAgICAgICAgIGlmIChjaCA9PT0gJyAnIHx8IGNoID09PSAnXFx0JylcbiAgICAgICAgICAgICAgICAgICAgZGlyRW5kIC09IDE7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IG4gPSAoeWllbGQqIHRoaXMucHVzaENvdW50KGRpckVuZCkpICsgKHlpZWxkKiB0aGlzLnB1c2hTcGFjZXModHJ1ZSkpO1xuICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaENvdW50KGxpbmUubGVuZ3RoIC0gbik7IC8vIHBvc3NpYmxlIGNvbW1lbnRcbiAgICAgICAgICAgIHRoaXMucHVzaE5ld2xpbmUoKTtcbiAgICAgICAgICAgIHJldHVybiAnc3RyZWFtJztcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5hdExpbmVFbmQoKSkge1xuICAgICAgICAgICAgY29uc3Qgc3AgPSB5aWVsZCogdGhpcy5wdXNoU3BhY2VzKHRydWUpO1xuICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaENvdW50KGxpbmUubGVuZ3RoIC0gc3ApO1xuICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaE5ld2xpbmUoKTtcbiAgICAgICAgICAgIHJldHVybiAnc3RyZWFtJztcbiAgICAgICAgfVxuICAgICAgICB5aWVsZCBjc3QuRE9DVU1FTlQ7XG4gICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZUxpbmVTdGFydCgpO1xuICAgIH1cbiAgICAqcGFyc2VMaW5lU3RhcnQoKSB7XG4gICAgICAgIGNvbnN0IGNoID0gdGhpcy5jaGFyQXQoMCk7XG4gICAgICAgIGlmICghY2ggJiYgIXRoaXMuYXRFbmQpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXROZXh0KCdsaW5lLXN0YXJ0Jyk7XG4gICAgICAgIGlmIChjaCA9PT0gJy0nIHx8IGNoID09PSAnLicpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5hdEVuZCAmJiAhdGhpcy5oYXNDaGFycyg0KSlcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXROZXh0KCdsaW5lLXN0YXJ0Jyk7XG4gICAgICAgICAgICBjb25zdCBzID0gdGhpcy5wZWVrKDMpO1xuICAgICAgICAgICAgaWYgKChzID09PSAnLS0tJyB8fCBzID09PSAnLi4uJykgJiYgaXNFbXB0eSh0aGlzLmNoYXJBdCgzKSkpIHtcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoQ291bnQoMyk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbmRlbnRWYWx1ZSA9IDA7XG4gICAgICAgICAgICAgICAgdGhpcy5pbmRlbnROZXh0ID0gMDtcbiAgICAgICAgICAgICAgICByZXR1cm4gcyA9PT0gJy0tLScgPyAnZG9jJyA6ICdzdHJlYW0nO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuaW5kZW50VmFsdWUgPSB5aWVsZCogdGhpcy5wdXNoU3BhY2VzKGZhbHNlKTtcbiAgICAgICAgaWYgKHRoaXMuaW5kZW50TmV4dCA+IHRoaXMuaW5kZW50VmFsdWUgJiYgIWlzRW1wdHkodGhpcy5jaGFyQXQoMSkpKVxuICAgICAgICAgICAgdGhpcy5pbmRlbnROZXh0ID0gdGhpcy5pbmRlbnRWYWx1ZTtcbiAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlQmxvY2tTdGFydCgpO1xuICAgIH1cbiAgICAqcGFyc2VCbG9ja1N0YXJ0KCkge1xuICAgICAgICBjb25zdCBbY2gwLCBjaDFdID0gdGhpcy5wZWVrKDIpO1xuICAgICAgICBpZiAoIWNoMSAmJiAhdGhpcy5hdEVuZClcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldE5leHQoJ2Jsb2NrLXN0YXJ0Jyk7XG4gICAgICAgIGlmICgoY2gwID09PSAnLScgfHwgY2gwID09PSAnPycgfHwgY2gwID09PSAnOicpICYmIGlzRW1wdHkoY2gxKSkge1xuICAgICAgICAgICAgY29uc3QgbiA9ICh5aWVsZCogdGhpcy5wdXNoQ291bnQoMSkpICsgKHlpZWxkKiB0aGlzLnB1c2hTcGFjZXModHJ1ZSkpO1xuICAgICAgICAgICAgdGhpcy5pbmRlbnROZXh0ID0gdGhpcy5pbmRlbnRWYWx1ZSArIDE7XG4gICAgICAgICAgICB0aGlzLmluZGVudFZhbHVlICs9IG47XG4gICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VCbG9ja1N0YXJ0KCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICdkb2MnO1xuICAgIH1cbiAgICAqcGFyc2VEb2N1bWVudCgpIHtcbiAgICAgICAgeWllbGQqIHRoaXMucHVzaFNwYWNlcyh0cnVlKTtcbiAgICAgICAgY29uc3QgbGluZSA9IHRoaXMuZ2V0TGluZSgpO1xuICAgICAgICBpZiAobGluZSA9PT0gbnVsbClcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldE5leHQoJ2RvYycpO1xuICAgICAgICBsZXQgbiA9IHlpZWxkKiB0aGlzLnB1c2hJbmRpY2F0b3JzKCk7XG4gICAgICAgIHN3aXRjaCAobGluZVtuXSkge1xuICAgICAgICAgICAgY2FzZSAnIyc6XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaENvdW50KGxpbmUubGVuZ3RoIC0gbik7XG4gICAgICAgICAgICAvLyBmYWxsdGhyb3VnaFxuICAgICAgICAgICAgY2FzZSB1bmRlZmluZWQ6XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaE5ld2xpbmUoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VMaW5lU3RhcnQoKTtcbiAgICAgICAgICAgIGNhc2UgJ3snOlxuICAgICAgICAgICAgY2FzZSAnWyc6XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaENvdW50KDEpO1xuICAgICAgICAgICAgICAgIHRoaXMuZmxvd0tleSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMuZmxvd0xldmVsID0gMTtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2Zsb3cnO1xuICAgICAgICAgICAgY2FzZSAnfSc6XG4gICAgICAgICAgICBjYXNlICddJzpcbiAgICAgICAgICAgICAgICAvLyB0aGlzIGlzIGFuIGVycm9yXG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaENvdW50KDEpO1xuICAgICAgICAgICAgICAgIHJldHVybiAnZG9jJztcbiAgICAgICAgICAgIGNhc2UgJyonOlxuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnB1c2hVbnRpbChpc05vdEFuY2hvckNoYXIpO1xuICAgICAgICAgICAgICAgIHJldHVybiAnZG9jJztcbiAgICAgICAgICAgIGNhc2UgJ1wiJzpcbiAgICAgICAgICAgIGNhc2UgXCInXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlUXVvdGVkU2NhbGFyKCk7XG4gICAgICAgICAgICBjYXNlICd8JzpcbiAgICAgICAgICAgIGNhc2UgJz4nOlxuICAgICAgICAgICAgICAgIG4gKz0geWllbGQqIHRoaXMucGFyc2VCbG9ja1NjYWxhckhlYWRlcigpO1xuICAgICAgICAgICAgICAgIG4gKz0geWllbGQqIHRoaXMucHVzaFNwYWNlcyh0cnVlKTtcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoQ291bnQobGluZS5sZW5ndGggLSBuKTtcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoTmV3bGluZSgpO1xuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZUJsb2NrU2NhbGFyKCk7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZVBsYWluU2NhbGFyKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgKnBhcnNlRmxvd0NvbGxlY3Rpb24oKSB7XG4gICAgICAgIGxldCBubCwgc3A7XG4gICAgICAgIGxldCBpbmRlbnQgPSAtMTtcbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgbmwgPSB5aWVsZCogdGhpcy5wdXNoTmV3bGluZSgpO1xuICAgICAgICAgICAgaWYgKG5sID4gMCkge1xuICAgICAgICAgICAgICAgIHNwID0geWllbGQqIHRoaXMucHVzaFNwYWNlcyhmYWxzZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbmRlbnRWYWx1ZSA9IGluZGVudCA9IHNwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgc3AgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3AgKz0geWllbGQqIHRoaXMucHVzaFNwYWNlcyh0cnVlKTtcbiAgICAgICAgfSB3aGlsZSAobmwgKyBzcCA+IDApO1xuICAgICAgICBjb25zdCBsaW5lID0gdGhpcy5nZXRMaW5lKCk7XG4gICAgICAgIGlmIChsaW5lID09PSBudWxsKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0TmV4dCgnZmxvdycpO1xuICAgICAgICBpZiAoKGluZGVudCAhPT0gLTEgJiYgaW5kZW50IDwgdGhpcy5pbmRlbnROZXh0ICYmIGxpbmVbMF0gIT09ICcjJykgfHxcbiAgICAgICAgICAgIChpbmRlbnQgPT09IDAgJiZcbiAgICAgICAgICAgICAgICAobGluZS5zdGFydHNXaXRoKCctLS0nKSB8fCBsaW5lLnN0YXJ0c1dpdGgoJy4uLicpKSAmJlxuICAgICAgICAgICAgICAgIGlzRW1wdHkobGluZVszXSkpKSB7XG4gICAgICAgICAgICAvLyBBbGxvd2luZyBmb3IgdGhlIHRlcm1pbmFsIF0gb3IgfSBhdCB0aGUgc2FtZSAocmF0aGVyIHRoYW4gZ3JlYXRlcilcbiAgICAgICAgICAgIC8vIGluZGVudCBsZXZlbCBhcyB0aGUgaW5pdGlhbCBbIG9yIHsgaXMgdGVjaG5pY2FsbHkgaW52YWxpZCwgYnV0XG4gICAgICAgICAgICAvLyBmYWlsaW5nIGhlcmUgd291bGQgYmUgc3VycHJpc2luZyB0byB1c2Vycy5cbiAgICAgICAgICAgIGNvbnN0IGF0Rmxvd0VuZE1hcmtlciA9IGluZGVudCA9PT0gdGhpcy5pbmRlbnROZXh0IC0gMSAmJlxuICAgICAgICAgICAgICAgIHRoaXMuZmxvd0xldmVsID09PSAxICYmXG4gICAgICAgICAgICAgICAgKGxpbmVbMF0gPT09ICddJyB8fCBsaW5lWzBdID09PSAnfScpO1xuICAgICAgICAgICAgaWYgKCFhdEZsb3dFbmRNYXJrZXIpIHtcbiAgICAgICAgICAgICAgICAvLyB0aGlzIGlzIGFuIGVycm9yXG4gICAgICAgICAgICAgICAgdGhpcy5mbG93TGV2ZWwgPSAwO1xuICAgICAgICAgICAgICAgIHlpZWxkIGNzdC5GTE9XX0VORDtcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VMaW5lU3RhcnQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBsZXQgbiA9IDA7XG4gICAgICAgIHdoaWxlIChsaW5lW25dID09PSAnLCcpIHtcbiAgICAgICAgICAgIG4gKz0geWllbGQqIHRoaXMucHVzaENvdW50KDEpO1xuICAgICAgICAgICAgbiArPSB5aWVsZCogdGhpcy5wdXNoU3BhY2VzKHRydWUpO1xuICAgICAgICAgICAgdGhpcy5mbG93S2V5ID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgbiArPSB5aWVsZCogdGhpcy5wdXNoSW5kaWNhdG9ycygpO1xuICAgICAgICBzd2l0Y2ggKGxpbmVbbl0pIHtcbiAgICAgICAgICAgIGNhc2UgdW5kZWZpbmVkOlxuICAgICAgICAgICAgICAgIHJldHVybiAnZmxvdyc7XG4gICAgICAgICAgICBjYXNlICcjJzpcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoQ291bnQobGluZS5sZW5ndGggLSBuKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2Zsb3cnO1xuICAgICAgICAgICAgY2FzZSAneyc6XG4gICAgICAgICAgICBjYXNlICdbJzpcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoQ291bnQoMSk7XG4gICAgICAgICAgICAgICAgdGhpcy5mbG93S2V5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5mbG93TGV2ZWwgKz0gMTtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2Zsb3cnO1xuICAgICAgICAgICAgY2FzZSAnfSc6XG4gICAgICAgICAgICBjYXNlICddJzpcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoQ291bnQoMSk7XG4gICAgICAgICAgICAgICAgdGhpcy5mbG93S2V5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmZsb3dMZXZlbCAtPSAxO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmZsb3dMZXZlbCA/ICdmbG93JyA6ICdkb2MnO1xuICAgICAgICAgICAgY2FzZSAnKic6XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaFVudGlsKGlzTm90QW5jaG9yQ2hhcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuICdmbG93JztcbiAgICAgICAgICAgIGNhc2UgJ1wiJzpcbiAgICAgICAgICAgIGNhc2UgXCInXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5mbG93S2V5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VRdW90ZWRTY2FsYXIoKTtcbiAgICAgICAgICAgIGNhc2UgJzonOiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV4dCA9IHRoaXMuY2hhckF0KDEpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmZsb3dLZXkgfHwgaXNFbXB0eShuZXh0KSB8fCBuZXh0ID09PSAnLCcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5mbG93S2V5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnB1c2hDb3VudCgxKTtcbiAgICAgICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaFNwYWNlcyh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdmbG93JztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBmYWxsdGhyb3VnaFxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aGlzLmZsb3dLZXkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VQbGFpblNjYWxhcigpO1xuICAgICAgICB9XG4gICAgfVxuICAgICpwYXJzZVF1b3RlZFNjYWxhcigpIHtcbiAgICAgICAgY29uc3QgcXVvdGUgPSB0aGlzLmNoYXJBdCgwKTtcbiAgICAgICAgbGV0IGVuZCA9IHRoaXMuYnVmZmVyLmluZGV4T2YocXVvdGUsIHRoaXMucG9zICsgMSk7XG4gICAgICAgIGlmIChxdW90ZSA9PT0gXCInXCIpIHtcbiAgICAgICAgICAgIHdoaWxlIChlbmQgIT09IC0xICYmIHRoaXMuYnVmZmVyW2VuZCArIDFdID09PSBcIidcIilcbiAgICAgICAgICAgICAgICBlbmQgPSB0aGlzLmJ1ZmZlci5pbmRleE9mKFwiJ1wiLCBlbmQgKyAyKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIGRvdWJsZS1xdW90ZVxuICAgICAgICAgICAgd2hpbGUgKGVuZCAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBsZXQgbiA9IDA7XG4gICAgICAgICAgICAgICAgd2hpbGUgKHRoaXMuYnVmZmVyW2VuZCAtIDEgLSBuXSA9PT0gJ1xcXFwnKVxuICAgICAgICAgICAgICAgICAgICBuICs9IDE7XG4gICAgICAgICAgICAgICAgaWYgKG4gJSAyID09PSAwKVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBlbmQgPSB0aGlzLmJ1ZmZlci5pbmRleE9mKCdcIicsIGVuZCArIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIE9ubHkgbG9va2luZyBmb3IgbmV3bGluZXMgd2l0aGluIHRoZSBxdW90ZXNcbiAgICAgICAgY29uc3QgcWIgPSB0aGlzLmJ1ZmZlci5zdWJzdHJpbmcoMCwgZW5kKTtcbiAgICAgICAgbGV0IG5sID0gcWIuaW5kZXhPZignXFxuJywgdGhpcy5wb3MpO1xuICAgICAgICBpZiAobmwgIT09IC0xKSB7XG4gICAgICAgICAgICB3aGlsZSAobmwgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY3MgPSB0aGlzLmNvbnRpbnVlU2NhbGFyKG5sICsgMSk7XG4gICAgICAgICAgICAgICAgaWYgKGNzID09PSAtMSlcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgbmwgPSBxYi5pbmRleE9mKCdcXG4nLCBjcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobmwgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgLy8gdGhpcyBpcyBhbiBlcnJvciBjYXVzZWQgYnkgYW4gdW5leHBlY3RlZCB1bmluZGVudFxuICAgICAgICAgICAgICAgIGVuZCA9IG5sIC0gKHFiW25sIC0gMV0gPT09ICdcXHInID8gMiA6IDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChlbmQgPT09IC0xKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuYXRFbmQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0TmV4dCgncXVvdGVkLXNjYWxhcicpO1xuICAgICAgICAgICAgZW5kID0gdGhpcy5idWZmZXIubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIHlpZWxkKiB0aGlzLnB1c2hUb0luZGV4KGVuZCArIDEsIGZhbHNlKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmxvd0xldmVsID8gJ2Zsb3cnIDogJ2RvYyc7XG4gICAgfVxuICAgICpwYXJzZUJsb2NrU2NhbGFySGVhZGVyKCkge1xuICAgICAgICB0aGlzLmJsb2NrU2NhbGFySW5kZW50ID0gLTE7XG4gICAgICAgIHRoaXMuYmxvY2tTY2FsYXJLZWVwID0gZmFsc2U7XG4gICAgICAgIGxldCBpID0gdGhpcy5wb3M7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICBjb25zdCBjaCA9IHRoaXMuYnVmZmVyWysraV07XG4gICAgICAgICAgICBpZiAoY2ggPT09ICcrJylcbiAgICAgICAgICAgICAgICB0aGlzLmJsb2NrU2NhbGFyS2VlcCA9IHRydWU7XG4gICAgICAgICAgICBlbHNlIGlmIChjaCA+ICcwJyAmJiBjaCA8PSAnOScpXG4gICAgICAgICAgICAgICAgdGhpcy5ibG9ja1NjYWxhckluZGVudCA9IE51bWJlcihjaCkgLSAxO1xuICAgICAgICAgICAgZWxzZSBpZiAoY2ggIT09ICctJylcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucHVzaFVudGlsKGNoID0+IGlzRW1wdHkoY2gpIHx8IGNoID09PSAnIycpO1xuICAgIH1cbiAgICAqcGFyc2VCbG9ja1NjYWxhcigpIHtcbiAgICAgICAgbGV0IG5sID0gdGhpcy5wb3MgLSAxOyAvLyBtYXkgYmUgLTEgaWYgdGhpcy5wb3MgPT09IDBcbiAgICAgICAgbGV0IGluZGVudCA9IDA7XG4gICAgICAgIGxldCBjaDtcbiAgICAgICAgbG9vcDogZm9yIChsZXQgaSA9IHRoaXMucG9zOyAoY2ggPSB0aGlzLmJ1ZmZlcltpXSk7ICsraSkge1xuICAgICAgICAgICAgc3dpdGNoIChjaCkge1xuICAgICAgICAgICAgICAgIGNhc2UgJyAnOlxuICAgICAgICAgICAgICAgICAgICBpbmRlbnQgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnXFxuJzpcbiAgICAgICAgICAgICAgICAgICAgbmwgPSBpO1xuICAgICAgICAgICAgICAgICAgICBpbmRlbnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdcXHInOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5leHQgPSB0aGlzLmJ1ZmZlcltpICsgMV07XG4gICAgICAgICAgICAgICAgICAgIGlmICghbmV4dCAmJiAhdGhpcy5hdEVuZClcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldE5leHQoJ2Jsb2NrLXNjYWxhcicpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobmV4dCA9PT0gJ1xcbicpXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9IC8vIGZhbGx0aHJvdWdoXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgYnJlYWsgbG9vcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIWNoICYmICF0aGlzLmF0RW5kKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0TmV4dCgnYmxvY2stc2NhbGFyJyk7XG4gICAgICAgIGlmIChpbmRlbnQgPj0gdGhpcy5pbmRlbnROZXh0KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5ibG9ja1NjYWxhckluZGVudCA9PT0gLTEpXG4gICAgICAgICAgICAgICAgdGhpcy5pbmRlbnROZXh0ID0gaW5kZW50O1xuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbmRlbnROZXh0ID1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ibG9ja1NjYWxhckluZGVudCArICh0aGlzLmluZGVudE5leHQgPT09IDAgPyAxIDogdGhpcy5pbmRlbnROZXh0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjcyA9IHRoaXMuY29udGludWVTY2FsYXIobmwgKyAxKTtcbiAgICAgICAgICAgICAgICBpZiAoY3MgPT09IC0xKVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBubCA9IHRoaXMuYnVmZmVyLmluZGV4T2YoJ1xcbicsIGNzKTtcbiAgICAgICAgICAgIH0gd2hpbGUgKG5sICE9PSAtMSk7XG4gICAgICAgICAgICBpZiAobmwgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmF0RW5kKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXROZXh0KCdibG9jay1zY2FsYXInKTtcbiAgICAgICAgICAgICAgICBubCA9IHRoaXMuYnVmZmVyLmxlbmd0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBUcmFpbGluZyBpbnN1ZmZpY2llbnRseSBpbmRlbnRlZCB0YWJzIGFyZSBpbnZhbGlkLlxuICAgICAgICAvLyBUbyBjYXRjaCB0aGF0IGR1cmluZyBwYXJzaW5nLCB3ZSBpbmNsdWRlIHRoZW0gaW4gdGhlIGJsb2NrIHNjYWxhciB2YWx1ZS5cbiAgICAgICAgbGV0IGkgPSBubCArIDE7XG4gICAgICAgIGNoID0gdGhpcy5idWZmZXJbaV07XG4gICAgICAgIHdoaWxlIChjaCA9PT0gJyAnKVxuICAgICAgICAgICAgY2ggPSB0aGlzLmJ1ZmZlclsrK2ldO1xuICAgICAgICBpZiAoY2ggPT09ICdcXHQnKSB7XG4gICAgICAgICAgICB3aGlsZSAoY2ggPT09ICdcXHQnIHx8IGNoID09PSAnICcgfHwgY2ggPT09ICdcXHInIHx8IGNoID09PSAnXFxuJylcbiAgICAgICAgICAgICAgICBjaCA9IHRoaXMuYnVmZmVyWysraV07XG4gICAgICAgICAgICBubCA9IGkgLSAxO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCF0aGlzLmJsb2NrU2NhbGFyS2VlcCkge1xuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIGxldCBpID0gbmwgLSAxO1xuICAgICAgICAgICAgICAgIGxldCBjaCA9IHRoaXMuYnVmZmVyW2ldO1xuICAgICAgICAgICAgICAgIGlmIChjaCA9PT0gJ1xccicpXG4gICAgICAgICAgICAgICAgICAgIGNoID0gdGhpcy5idWZmZXJbLS1pXTtcbiAgICAgICAgICAgICAgICBjb25zdCBsYXN0Q2hhciA9IGk7IC8vIERyb3AgdGhlIGxpbmUgaWYgbGFzdCBjaGFyIG5vdCBtb3JlIGluZGVudGVkXG4gICAgICAgICAgICAgICAgd2hpbGUgKGNoID09PSAnICcpXG4gICAgICAgICAgICAgICAgICAgIGNoID0gdGhpcy5idWZmZXJbLS1pXTtcbiAgICAgICAgICAgICAgICBpZiAoY2ggPT09ICdcXG4nICYmIGkgPj0gdGhpcy5wb3MgJiYgaSArIDEgKyBpbmRlbnQgPiBsYXN0Q2hhcilcbiAgICAgICAgICAgICAgICAgICAgbmwgPSBpO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9IHdoaWxlICh0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICB5aWVsZCBjc3QuU0NBTEFSO1xuICAgICAgICB5aWVsZCogdGhpcy5wdXNoVG9JbmRleChubCArIDEsIHRydWUpO1xuICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VMaW5lU3RhcnQoKTtcbiAgICB9XG4gICAgKnBhcnNlUGxhaW5TY2FsYXIoKSB7XG4gICAgICAgIGNvbnN0IGluRmxvdyA9IHRoaXMuZmxvd0xldmVsID4gMDtcbiAgICAgICAgbGV0IGVuZCA9IHRoaXMucG9zIC0gMTtcbiAgICAgICAgbGV0IGkgPSB0aGlzLnBvcyAtIDE7XG4gICAgICAgIGxldCBjaDtcbiAgICAgICAgd2hpbGUgKChjaCA9IHRoaXMuYnVmZmVyWysraV0pKSB7XG4gICAgICAgICAgICBpZiAoY2ggPT09ICc6Jykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5leHQgPSB0aGlzLmJ1ZmZlcltpICsgMV07XG4gICAgICAgICAgICAgICAgaWYgKGlzRW1wdHkobmV4dCkgfHwgKGluRmxvdyAmJiBmbG93SW5kaWNhdG9yQ2hhcnMuaGFzKG5leHQpKSlcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZW5kID0gaTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGlzRW1wdHkoY2gpKSB7XG4gICAgICAgICAgICAgICAgbGV0IG5leHQgPSB0aGlzLmJ1ZmZlcltpICsgMV07XG4gICAgICAgICAgICAgICAgaWYgKGNoID09PSAnXFxyJykge1xuICAgICAgICAgICAgICAgICAgICBpZiAobmV4dCA9PT0gJ1xcbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGkgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoID0gJ1xcbic7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0ID0gdGhpcy5idWZmZXJbaSArIDFdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZCA9IGk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChuZXh0ID09PSAnIycgfHwgKGluRmxvdyAmJiBmbG93SW5kaWNhdG9yQ2hhcnMuaGFzKG5leHQpKSlcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgaWYgKGNoID09PSAnXFxuJykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjcyA9IHRoaXMuY29udGludWVTY2FsYXIoaSArIDEpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3MgPT09IC0xKVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGkgPSBNYXRoLm1heChpLCBjcyAtIDIpOyAvLyB0byBhZHZhbmNlLCBidXQgc3RpbGwgYWNjb3VudCBmb3IgJyAjJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChpbkZsb3cgJiYgZmxvd0luZGljYXRvckNoYXJzLmhhcyhjaCkpXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGVuZCA9IGk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFjaCAmJiAhdGhpcy5hdEVuZClcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldE5leHQoJ3BsYWluLXNjYWxhcicpO1xuICAgICAgICB5aWVsZCBjc3QuU0NBTEFSO1xuICAgICAgICB5aWVsZCogdGhpcy5wdXNoVG9JbmRleChlbmQgKyAxLCB0cnVlKTtcbiAgICAgICAgcmV0dXJuIGluRmxvdyA/ICdmbG93JyA6ICdkb2MnO1xuICAgIH1cbiAgICAqcHVzaENvdW50KG4pIHtcbiAgICAgICAgaWYgKG4gPiAwKSB7XG4gICAgICAgICAgICB5aWVsZCB0aGlzLmJ1ZmZlci5zdWJzdHIodGhpcy5wb3MsIG4pO1xuICAgICAgICAgICAgdGhpcy5wb3MgKz0gbjtcbiAgICAgICAgICAgIHJldHVybiBuO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICAqcHVzaFRvSW5kZXgoaSwgYWxsb3dFbXB0eSkge1xuICAgICAgICBjb25zdCBzID0gdGhpcy5idWZmZXIuc2xpY2UodGhpcy5wb3MsIGkpO1xuICAgICAgICBpZiAocykge1xuICAgICAgICAgICAgeWllbGQgcztcbiAgICAgICAgICAgIHRoaXMucG9zICs9IHMubGVuZ3RoO1xuICAgICAgICAgICAgcmV0dXJuIHMubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGFsbG93RW1wdHkpXG4gICAgICAgICAgICB5aWVsZCAnJztcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgICpwdXNoSW5kaWNhdG9ycygpIHtcbiAgICAgICAgc3dpdGNoICh0aGlzLmNoYXJBdCgwKSkge1xuICAgICAgICAgICAgY2FzZSAnISc6XG4gICAgICAgICAgICAgICAgcmV0dXJuICgoeWllbGQqIHRoaXMucHVzaFRhZygpKSArXG4gICAgICAgICAgICAgICAgICAgICh5aWVsZCogdGhpcy5wdXNoU3BhY2VzKHRydWUpKSArXG4gICAgICAgICAgICAgICAgICAgICh5aWVsZCogdGhpcy5wdXNoSW5kaWNhdG9ycygpKSk7XG4gICAgICAgICAgICBjYXNlICcmJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gKCh5aWVsZCogdGhpcy5wdXNoVW50aWwoaXNOb3RBbmNob3JDaGFyKSkgK1xuICAgICAgICAgICAgICAgICAgICAoeWllbGQqIHRoaXMucHVzaFNwYWNlcyh0cnVlKSkgK1xuICAgICAgICAgICAgICAgICAgICAoeWllbGQqIHRoaXMucHVzaEluZGljYXRvcnMoKSkpO1xuICAgICAgICAgICAgY2FzZSAnLSc6IC8vIHRoaXMgaXMgYW4gZXJyb3JcbiAgICAgICAgICAgIGNhc2UgJz8nOiAvLyB0aGlzIGlzIGFuIGVycm9yIG91dHNpZGUgZmxvdyBjb2xsZWN0aW9uc1xuICAgICAgICAgICAgY2FzZSAnOic6IHtcbiAgICAgICAgICAgICAgICBjb25zdCBpbkZsb3cgPSB0aGlzLmZsb3dMZXZlbCA+IDA7XG4gICAgICAgICAgICAgICAgY29uc3QgY2gxID0gdGhpcy5jaGFyQXQoMSk7XG4gICAgICAgICAgICAgICAgaWYgKGlzRW1wdHkoY2gxKSB8fCAoaW5GbG93ICYmIGZsb3dJbmRpY2F0b3JDaGFycy5oYXMoY2gxKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpbkZsb3cpXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluZGVudE5leHQgPSB0aGlzLmluZGVudFZhbHVlICsgMTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5mbG93S2V5KVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mbG93S2V5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoKHlpZWxkKiB0aGlzLnB1c2hDb3VudCgxKSkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgKHlpZWxkKiB0aGlzLnB1c2hTcGFjZXModHJ1ZSkpICtcbiAgICAgICAgICAgICAgICAgICAgICAgICh5aWVsZCogdGhpcy5wdXNoSW5kaWNhdG9ycygpKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICAqcHVzaFRhZygpIHtcbiAgICAgICAgaWYgKHRoaXMuY2hhckF0KDEpID09PSAnPCcpIHtcbiAgICAgICAgICAgIGxldCBpID0gdGhpcy5wb3MgKyAyO1xuICAgICAgICAgICAgbGV0IGNoID0gdGhpcy5idWZmZXJbaV07XG4gICAgICAgICAgICB3aGlsZSAoIWlzRW1wdHkoY2gpICYmIGNoICE9PSAnPicpXG4gICAgICAgICAgICAgICAgY2ggPSB0aGlzLmJ1ZmZlclsrK2ldO1xuICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnB1c2hUb0luZGV4KGNoID09PSAnPicgPyBpICsgMSA6IGksIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGxldCBpID0gdGhpcy5wb3MgKyAxO1xuICAgICAgICAgICAgbGV0IGNoID0gdGhpcy5idWZmZXJbaV07XG4gICAgICAgICAgICB3aGlsZSAoY2gpIHtcbiAgICAgICAgICAgICAgICBpZiAodGFnQ2hhcnMuaGFzKGNoKSlcbiAgICAgICAgICAgICAgICAgICAgY2ggPSB0aGlzLmJ1ZmZlclsrK2ldO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNoID09PSAnJScgJiZcbiAgICAgICAgICAgICAgICAgICAgaGV4RGlnaXRzLmhhcyh0aGlzLmJ1ZmZlcltpICsgMV0pICYmXG4gICAgICAgICAgICAgICAgICAgIGhleERpZ2l0cy5oYXModGhpcy5idWZmZXJbaSArIDJdKSkge1xuICAgICAgICAgICAgICAgICAgICBjaCA9IHRoaXMuYnVmZmVyWyhpICs9IDMpXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wdXNoVG9JbmRleChpLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgKnB1c2hOZXdsaW5lKCkge1xuICAgICAgICBjb25zdCBjaCA9IHRoaXMuYnVmZmVyW3RoaXMucG9zXTtcbiAgICAgICAgaWYgKGNoID09PSAnXFxuJylcbiAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wdXNoQ291bnQoMSk7XG4gICAgICAgIGVsc2UgaWYgKGNoID09PSAnXFxyJyAmJiB0aGlzLmNoYXJBdCgxKSA9PT0gJ1xcbicpXG4gICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucHVzaENvdW50KDIpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICB9XG4gICAgKnB1c2hTcGFjZXMoYWxsb3dUYWJzKSB7XG4gICAgICAgIGxldCBpID0gdGhpcy5wb3MgLSAxO1xuICAgICAgICBsZXQgY2g7XG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIGNoID0gdGhpcy5idWZmZXJbKytpXTtcbiAgICAgICAgfSB3aGlsZSAoY2ggPT09ICcgJyB8fCAoYWxsb3dUYWJzICYmIGNoID09PSAnXFx0JykpO1xuICAgICAgICBjb25zdCBuID0gaSAtIHRoaXMucG9zO1xuICAgICAgICBpZiAobiA+IDApIHtcbiAgICAgICAgICAgIHlpZWxkIHRoaXMuYnVmZmVyLnN1YnN0cih0aGlzLnBvcywgbik7XG4gICAgICAgICAgICB0aGlzLnBvcyA9IGk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG47XG4gICAgfVxuICAgICpwdXNoVW50aWwodGVzdCkge1xuICAgICAgICBsZXQgaSA9IHRoaXMucG9zO1xuICAgICAgICBsZXQgY2ggPSB0aGlzLmJ1ZmZlcltpXTtcbiAgICAgICAgd2hpbGUgKCF0ZXN0KGNoKSlcbiAgICAgICAgICAgIGNoID0gdGhpcy5idWZmZXJbKytpXTtcbiAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnB1c2hUb0luZGV4KGksIGZhbHNlKTtcbiAgICB9XG59XG5cbmV4cG9ydHMuTGV4ZXIgPSBMZXhlcjtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFRyYWNrcyBuZXdsaW5lcyBkdXJpbmcgcGFyc2luZyBpbiBvcmRlciB0byBwcm92aWRlIGFuIGVmZmljaWVudCBBUEkgZm9yXG4gKiBkZXRlcm1pbmluZyB0aGUgb25lLWluZGV4ZWQgYHsgbGluZSwgY29sIH1gIHBvc2l0aW9uIGZvciBhbnkgb2Zmc2V0XG4gKiB3aXRoaW4gdGhlIGlucHV0LlxuICovXG5jbGFzcyBMaW5lQ291bnRlciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMubGluZVN0YXJ0cyA9IFtdO1xuICAgICAgICAvKipcbiAgICAgICAgICogU2hvdWxkIGJlIGNhbGxlZCBpbiBhc2NlbmRpbmcgb3JkZXIuIE90aGVyd2lzZSwgY2FsbFxuICAgICAgICAgKiBgbGluZUNvdW50ZXIubGluZVN0YXJ0cy5zb3J0KClgIGJlZm9yZSBjYWxsaW5nIGBsaW5lUG9zKClgLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5hZGROZXdMaW5lID0gKG9mZnNldCkgPT4gdGhpcy5saW5lU3RhcnRzLnB1c2gob2Zmc2V0KTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFBlcmZvcm1zIGEgYmluYXJ5IHNlYXJjaCBhbmQgcmV0dXJucyB0aGUgMS1pbmRleGVkIHsgbGluZSwgY29sIH1cbiAgICAgICAgICogcG9zaXRpb24gb2YgYG9mZnNldGAuIElmIGBsaW5lID09PSAwYCwgYGFkZE5ld0xpbmVgIGhhcyBuZXZlciBiZWVuXG4gICAgICAgICAqIGNhbGxlZCBvciBgb2Zmc2V0YCBpcyBiZWZvcmUgdGhlIGZpcnN0IGtub3duIG5ld2xpbmUuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmxpbmVQb3MgPSAob2Zmc2V0KSA9PiB7XG4gICAgICAgICAgICBsZXQgbG93ID0gMDtcbiAgICAgICAgICAgIGxldCBoaWdoID0gdGhpcy5saW5lU3RhcnRzLmxlbmd0aDtcbiAgICAgICAgICAgIHdoaWxlIChsb3cgPCBoaWdoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWlkID0gKGxvdyArIGhpZ2gpID4+IDE7IC8vIE1hdGguZmxvb3IoKGxvdyArIGhpZ2gpIC8gMilcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5saW5lU3RhcnRzW21pZF0gPCBvZmZzZXQpXG4gICAgICAgICAgICAgICAgICAgIGxvdyA9IG1pZCArIDE7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBoaWdoID0gbWlkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMubGluZVN0YXJ0c1tsb3ddID09PSBvZmZzZXQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgbGluZTogbG93ICsgMSwgY29sOiAxIH07XG4gICAgICAgICAgICBpZiAobG93ID09PSAwKVxuICAgICAgICAgICAgICAgIHJldHVybiB7IGxpbmU6IDAsIGNvbDogb2Zmc2V0IH07XG4gICAgICAgICAgICBjb25zdCBzdGFydCA9IHRoaXMubGluZVN0YXJ0c1tsb3cgLSAxXTtcbiAgICAgICAgICAgIHJldHVybiB7IGxpbmU6IGxvdywgY29sOiBvZmZzZXQgLSBzdGFydCArIDEgfTtcbiAgICAgICAgfTtcbiAgICB9XG59XG5cbmV4cG9ydHMuTGluZUNvdW50ZXIgPSBMaW5lQ291bnRlcjtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbm9kZV9wcm9jZXNzID0gcmVxdWlyZSgncHJvY2VzcycpO1xudmFyIGNzdCA9IHJlcXVpcmUoJy4vY3N0LmpzJyk7XG52YXIgbGV4ZXIgPSByZXF1aXJlKCcuL2xleGVyLmpzJyk7XG5cbmZ1bmN0aW9uIGluY2x1ZGVzVG9rZW4obGlzdCwgdHlwZSkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7ICsraSlcbiAgICAgICAgaWYgKGxpc3RbaV0udHlwZSA9PT0gdHlwZSlcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgIHJldHVybiBmYWxzZTtcbn1cbmZ1bmN0aW9uIGZpbmROb25FbXB0eUluZGV4KGxpc3QpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgc3dpdGNoIChsaXN0W2ldLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcbiAgICAgICAgICAgIGNhc2UgJ2NvbW1lbnQnOlxuICAgICAgICAgICAgY2FzZSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiAtMTtcbn1cbmZ1bmN0aW9uIGlzRmxvd1Rva2VuKHRva2VuKSB7XG4gICAgc3dpdGNoICh0b2tlbj8udHlwZSkge1xuICAgICAgICBjYXNlICdhbGlhcyc6XG4gICAgICAgIGNhc2UgJ3NjYWxhcic6XG4gICAgICAgIGNhc2UgJ3NpbmdsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgY2FzZSAnZG91YmxlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICBjYXNlICdmbG93LWNvbGxlY3Rpb24nOlxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuZnVuY3Rpb24gZ2V0UHJldlByb3BzKHBhcmVudCkge1xuICAgIHN3aXRjaCAocGFyZW50LnR5cGUpIHtcbiAgICAgICAgY2FzZSAnZG9jdW1lbnQnOlxuICAgICAgICAgICAgcmV0dXJuIHBhcmVudC5zdGFydDtcbiAgICAgICAgY2FzZSAnYmxvY2stbWFwJzoge1xuICAgICAgICAgICAgY29uc3QgaXQgPSBwYXJlbnQuaXRlbXNbcGFyZW50Lml0ZW1zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgcmV0dXJuIGl0LnNlcCA/PyBpdC5zdGFydDtcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdibG9jay1zZXEnOlxuICAgICAgICAgICAgcmV0dXJuIHBhcmVudC5pdGVtc1twYXJlbnQuaXRlbXMubGVuZ3RoIC0gMV0uc3RhcnQ7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0IHNob3VsZCBub3QgaGFwcGVuICovXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgfVxufVxuLyoqIE5vdGU6IE1heSBtb2RpZnkgaW5wdXQgYXJyYXkgKi9cbmZ1bmN0aW9uIGdldEZpcnN0S2V5U3RhcnRQcm9wcyhwcmV2KSB7XG4gICAgaWYgKHByZXYubGVuZ3RoID09PSAwKVxuICAgICAgICByZXR1cm4gW107XG4gICAgbGV0IGkgPSBwcmV2Lmxlbmd0aDtcbiAgICBsb29wOiB3aGlsZSAoLS1pID49IDApIHtcbiAgICAgICAgc3dpdGNoIChwcmV2W2ldLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2RvYy1zdGFydCc6XG4gICAgICAgICAgICBjYXNlICdleHBsaWNpdC1rZXktaW5kJzpcbiAgICAgICAgICAgIGNhc2UgJ21hcC12YWx1ZS1pbmQnOlxuICAgICAgICAgICAgY2FzZSAnc2VxLWl0ZW0taW5kJzpcbiAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgIGJyZWFrIGxvb3A7XG4gICAgICAgIH1cbiAgICB9XG4gICAgd2hpbGUgKHByZXZbKytpXT8udHlwZSA9PT0gJ3NwYWNlJykge1xuICAgICAgICAvKiBsb29wICovXG4gICAgfVxuICAgIHJldHVybiBwcmV2LnNwbGljZShpLCBwcmV2Lmxlbmd0aCk7XG59XG5mdW5jdGlvbiBmaXhGbG93U2VxSXRlbXMoZmMpIHtcbiAgICBpZiAoZmMuc3RhcnQudHlwZSA9PT0gJ2Zsb3ctc2VxLXN0YXJ0Jykge1xuICAgICAgICBmb3IgKGNvbnN0IGl0IG9mIGZjLml0ZW1zKSB7XG4gICAgICAgICAgICBpZiAoaXQuc2VwICYmXG4gICAgICAgICAgICAgICAgIWl0LnZhbHVlICYmXG4gICAgICAgICAgICAgICAgIWluY2x1ZGVzVG9rZW4oaXQuc3RhcnQsICdleHBsaWNpdC1rZXktaW5kJykgJiZcbiAgICAgICAgICAgICAgICAhaW5jbHVkZXNUb2tlbihpdC5zZXAsICdtYXAtdmFsdWUtaW5kJykpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXQua2V5KVxuICAgICAgICAgICAgICAgICAgICBpdC52YWx1ZSA9IGl0LmtleTtcbiAgICAgICAgICAgICAgICBkZWxldGUgaXQua2V5O1xuICAgICAgICAgICAgICAgIGlmIChpc0Zsb3dUb2tlbihpdC52YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0LnZhbHVlLmVuZClcbiAgICAgICAgICAgICAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KGl0LnZhbHVlLmVuZCwgaXQuc2VwKTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgaXQudmFsdWUuZW5kID0gaXQuc2VwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KGl0LnN0YXJ0LCBpdC5zZXApO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBpdC5zZXA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4vKipcbiAqIEEgWUFNTCBjb25jcmV0ZSBzeW50YXggdHJlZSAoQ1NUKSBwYXJzZXJcbiAqXG4gKiBgYGB0c1xuICogY29uc3Qgc3JjOiBzdHJpbmcgPSAuLi5cbiAqIGZvciAoY29uc3QgdG9rZW4gb2YgbmV3IFBhcnNlcigpLnBhcnNlKHNyYykpIHtcbiAqICAgLy8gdG9rZW46IFRva2VuXG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBUbyB1c2UgdGhlIHBhcnNlciB3aXRoIGEgdXNlci1wcm92aWRlZCBsZXhlcjpcbiAqXG4gKiBgYGB0c1xuICogZnVuY3Rpb24qIHBhcnNlKHNvdXJjZTogc3RyaW5nLCBsZXhlcjogTGV4ZXIpIHtcbiAqICAgY29uc3QgcGFyc2VyID0gbmV3IFBhcnNlcigpXG4gKiAgIGZvciAoY29uc3QgbGV4ZW1lIG9mIGxleGVyLmxleChzb3VyY2UpKVxuICogICAgIHlpZWxkKiBwYXJzZXIubmV4dChsZXhlbWUpXG4gKiAgIHlpZWxkKiBwYXJzZXIuZW5kKClcbiAqIH1cbiAqXG4gKiBjb25zdCBzcmM6IHN0cmluZyA9IC4uLlxuICogY29uc3QgbGV4ZXIgPSBuZXcgTGV4ZXIoKVxuICogZm9yIChjb25zdCB0b2tlbiBvZiBwYXJzZShzcmMsIGxleGVyKSkge1xuICogICAvLyB0b2tlbjogVG9rZW5cbiAqIH1cbiAqIGBgYFxuICovXG5jbGFzcyBQYXJzZXIge1xuICAgIC8qKlxuICAgICAqIEBwYXJhbSBvbk5ld0xpbmUgLSBJZiBkZWZpbmVkLCBjYWxsZWQgc2VwYXJhdGVseSB3aXRoIHRoZSBzdGFydCBwb3NpdGlvbiBvZlxuICAgICAqICAgZWFjaCBuZXcgbGluZSAoaW4gYHBhcnNlKClgLCBpbmNsdWRpbmcgdGhlIHN0YXJ0IG9mIGlucHV0KS5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcihvbk5ld0xpbmUpIHtcbiAgICAgICAgLyoqIElmIHRydWUsIHNwYWNlIGFuZCBzZXF1ZW5jZSBpbmRpY2F0b3JzIGNvdW50IGFzIGluZGVudGF0aW9uICovXG4gICAgICAgIHRoaXMuYXROZXdMaW5lID0gdHJ1ZTtcbiAgICAgICAgLyoqIElmIHRydWUsIG5leHQgdG9rZW4gaXMgYSBzY2FsYXIgdmFsdWUgKi9cbiAgICAgICAgdGhpcy5hdFNjYWxhciA9IGZhbHNlO1xuICAgICAgICAvKiogQ3VycmVudCBpbmRlbnRhdGlvbiBsZXZlbCAqL1xuICAgICAgICB0aGlzLmluZGVudCA9IDA7XG4gICAgICAgIC8qKiBDdXJyZW50IG9mZnNldCBzaW5jZSB0aGUgc3RhcnQgb2YgcGFyc2luZyAqL1xuICAgICAgICB0aGlzLm9mZnNldCA9IDA7XG4gICAgICAgIC8qKiBPbiB0aGUgc2FtZSBsaW5lIHdpdGggYSBibG9jayBtYXAga2V5ICovXG4gICAgICAgIHRoaXMub25LZXlMaW5lID0gZmFsc2U7XG4gICAgICAgIC8qKiBUb3AgaW5kaWNhdGVzIHRoZSBub2RlIHRoYXQncyBjdXJyZW50bHkgYmVpbmcgYnVpbHQgKi9cbiAgICAgICAgdGhpcy5zdGFjayA9IFtdO1xuICAgICAgICAvKiogVGhlIHNvdXJjZSBvZiB0aGUgY3VycmVudCB0b2tlbiwgc2V0IGluIHBhcnNlKCkgKi9cbiAgICAgICAgdGhpcy5zb3VyY2UgPSAnJztcbiAgICAgICAgLyoqIFRoZSB0eXBlIG9mIHRoZSBjdXJyZW50IHRva2VuLCBzZXQgaW4gcGFyc2UoKSAqL1xuICAgICAgICB0aGlzLnR5cGUgPSAnJztcbiAgICAgICAgLy8gTXVzdCBiZSBkZWZpbmVkIGFmdGVyIGBuZXh0KClgXG4gICAgICAgIHRoaXMubGV4ZXIgPSBuZXcgbGV4ZXIuTGV4ZXIoKTtcbiAgICAgICAgdGhpcy5vbk5ld0xpbmUgPSBvbk5ld0xpbmU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFBhcnNlIGBzb3VyY2VgIGFzIGEgWUFNTCBzdHJlYW0uXG4gICAgICogSWYgYGluY29tcGxldGVgLCBhIHBhcnQgb2YgdGhlIGxhc3QgbGluZSBtYXkgYmUgbGVmdCBhcyBhIGJ1ZmZlciBmb3IgdGhlIG5leHQgY2FsbC5cbiAgICAgKlxuICAgICAqIEVycm9ycyBhcmUgbm90IHRocm93biwgYnV0IHlpZWxkZWQgYXMgYHsgdHlwZTogJ2Vycm9yJywgbWVzc2FnZSB9YCB0b2tlbnMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBBIGdlbmVyYXRvciBvZiB0b2tlbnMgcmVwcmVzZW50aW5nIGVhY2ggZGlyZWN0aXZlLCBkb2N1bWVudCwgYW5kIG90aGVyIHN0cnVjdHVyZS5cbiAgICAgKi9cbiAgICAqcGFyc2Uoc291cmNlLCBpbmNvbXBsZXRlID0gZmFsc2UpIHtcbiAgICAgICAgaWYgKHRoaXMub25OZXdMaW5lICYmIHRoaXMub2Zmc2V0ID09PSAwKVxuICAgICAgICAgICAgdGhpcy5vbk5ld0xpbmUoMCk7XG4gICAgICAgIGZvciAoY29uc3QgbGV4ZW1lIG9mIHRoaXMubGV4ZXIubGV4KHNvdXJjZSwgaW5jb21wbGV0ZSkpXG4gICAgICAgICAgICB5aWVsZCogdGhpcy5uZXh0KGxleGVtZSk7XG4gICAgICAgIGlmICghaW5jb21wbGV0ZSlcbiAgICAgICAgICAgIHlpZWxkKiB0aGlzLmVuZCgpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBZHZhbmNlIHRoZSBwYXJzZXIgYnkgdGhlIGBzb3VyY2VgIG9mIG9uZSBsZXhpY2FsIHRva2VuLlxuICAgICAqL1xuICAgICpuZXh0KHNvdXJjZSkge1xuICAgICAgICB0aGlzLnNvdXJjZSA9IHNvdXJjZTtcbiAgICAgICAgaWYgKG5vZGVfcHJvY2Vzcy5lbnYuTE9HX1RPS0VOUylcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCd8JywgY3N0LnByZXR0eVRva2VuKHNvdXJjZSkpO1xuICAgICAgICBpZiAodGhpcy5hdFNjYWxhcikge1xuICAgICAgICAgICAgdGhpcy5hdFNjYWxhciA9IGZhbHNlO1xuICAgICAgICAgICAgeWllbGQqIHRoaXMuc3RlcCgpO1xuICAgICAgICAgICAgdGhpcy5vZmZzZXQgKz0gc291cmNlLmxlbmd0aDtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0eXBlID0gY3N0LnRva2VuVHlwZShzb3VyY2UpO1xuICAgICAgICBpZiAoIXR5cGUpIHtcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBgTm90IGEgWUFNTCB0b2tlbjogJHtzb3VyY2V9YDtcbiAgICAgICAgICAgIHlpZWxkKiB0aGlzLnBvcCh7IHR5cGU6ICdlcnJvcicsIG9mZnNldDogdGhpcy5vZmZzZXQsIG1lc3NhZ2UsIHNvdXJjZSB9KTtcbiAgICAgICAgICAgIHRoaXMub2Zmc2V0ICs9IHNvdXJjZS5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZSA9PT0gJ3NjYWxhcicpIHtcbiAgICAgICAgICAgIHRoaXMuYXROZXdMaW5lID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmF0U2NhbGFyID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMudHlwZSA9ICdzY2FsYXInO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICAgICAgICAgIHlpZWxkKiB0aGlzLnN0ZXAoKTtcbiAgICAgICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmF0TmV3TGluZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5kZW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMub25OZXdMaW5lKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbk5ld0xpbmUodGhpcy5vZmZzZXQgKyBzb3VyY2UubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5hdE5ld0xpbmUgJiYgc291cmNlWzBdID09PSAnICcpXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluZGVudCArPSBzb3VyY2UubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdleHBsaWNpdC1rZXktaW5kJzpcbiAgICAgICAgICAgICAgICBjYXNlICdtYXAtdmFsdWUtaW5kJzpcbiAgICAgICAgICAgICAgICBjYXNlICdzZXEtaXRlbS1pbmQnOlxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5hdE5ld0xpbmUpXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluZGVudCArPSBzb3VyY2UubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdkb2MtbW9kZSc6XG4gICAgICAgICAgICAgICAgY2FzZSAnZmxvdy1lcnJvci1lbmQnOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hdE5ld0xpbmUgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMub2Zmc2V0ICs9IHNvdXJjZS5sZW5ndGg7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqIENhbGwgYXQgZW5kIG9mIGlucHV0IHRvIHB1c2ggb3V0IGFueSByZW1haW5pbmcgY29uc3RydWN0aW9ucyAqL1xuICAgICplbmQoKSB7XG4gICAgICAgIHdoaWxlICh0aGlzLnN0YWNrLmxlbmd0aCA+IDApXG4gICAgICAgICAgICB5aWVsZCogdGhpcy5wb3AoKTtcbiAgICB9XG4gICAgZ2V0IHNvdXJjZVRva2VuKCkge1xuICAgICAgICBjb25zdCBzdCA9IHtcbiAgICAgICAgICAgIHR5cGU6IHRoaXMudHlwZSxcbiAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICBpbmRlbnQ6IHRoaXMuaW5kZW50LFxuICAgICAgICAgICAgc291cmNlOiB0aGlzLnNvdXJjZVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gc3Q7XG4gICAgfVxuICAgICpzdGVwKCkge1xuICAgICAgICBjb25zdCB0b3AgPSB0aGlzLnBlZWsoMSk7XG4gICAgICAgIGlmICh0aGlzLnR5cGUgPT09ICdkb2MtZW5kJyAmJiB0b3A/LnR5cGUgIT09ICdkb2MtZW5kJykge1xuICAgICAgICAgICAgd2hpbGUgKHRoaXMuc3RhY2subGVuZ3RoID4gMClcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wb3AoKTtcbiAgICAgICAgICAgIHRoaXMuc3RhY2sucHVzaCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2RvYy1lbmQnLFxuICAgICAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICAgICAgc291cmNlOiB0aGlzLnNvdXJjZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0b3ApXG4gICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMuc3RyZWFtKCk7XG4gICAgICAgIHN3aXRjaCAodG9wLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2RvY3VtZW50JzpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMuZG9jdW1lbnQodG9wKTtcbiAgICAgICAgICAgIGNhc2UgJ2FsaWFzJzpcbiAgICAgICAgICAgIGNhc2UgJ3NjYWxhcic6XG4gICAgICAgICAgICBjYXNlICdzaW5nbGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgICAgICBjYXNlICdkb3VibGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnNjYWxhcih0b3ApO1xuICAgICAgICAgICAgY2FzZSAnYmxvY2stc2NhbGFyJzpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMuYmxvY2tTY2FsYXIodG9wKTtcbiAgICAgICAgICAgIGNhc2UgJ2Jsb2NrLW1hcCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLmJsb2NrTWFwKHRvcCk7XG4gICAgICAgICAgICBjYXNlICdibG9jay1zZXEnOlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5ibG9ja1NlcXVlbmNlKHRvcCk7XG4gICAgICAgICAgICBjYXNlICdmbG93LWNvbGxlY3Rpb24nOlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5mbG93Q29sbGVjdGlvbih0b3ApO1xuICAgICAgICAgICAgY2FzZSAnZG9jLWVuZCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLmRvY3VtZW50RW5kKHRvcCk7XG4gICAgICAgIH1cbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgc2hvdWxkIG5vdCBoYXBwZW4gKi9cbiAgICAgICAgeWllbGQqIHRoaXMucG9wKCk7XG4gICAgfVxuICAgIHBlZWsobikge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGFja1t0aGlzLnN0YWNrLmxlbmd0aCAtIG5dO1xuICAgIH1cbiAgICAqcG9wKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IHRva2VuID0gZXJyb3IgPz8gdGhpcy5zdGFjay5wb3AoKTtcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmIHNob3VsZCBub3QgaGFwcGVuICovXG4gICAgICAgIGlmICghdG9rZW4pIHtcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSAnVHJpZWQgdG8gcG9wIGFuIGVtcHR5IHN0YWNrJztcbiAgICAgICAgICAgIHlpZWxkIHsgdHlwZTogJ2Vycm9yJywgb2Zmc2V0OiB0aGlzLm9mZnNldCwgc291cmNlOiAnJywgbWVzc2FnZSB9O1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMuc3RhY2subGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB5aWVsZCB0b2tlbjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHRvcCA9IHRoaXMucGVlaygxKTtcbiAgICAgICAgICAgIGlmICh0b2tlbi50eXBlID09PSAnYmxvY2stc2NhbGFyJykge1xuICAgICAgICAgICAgICAgIC8vIEJsb2NrIHNjYWxhcnMgdXNlIHRoZWlyIHBhcmVudCByYXRoZXIgdGhhbiBoZWFkZXIgaW5kZW50XG4gICAgICAgICAgICAgICAgdG9rZW4uaW5kZW50ID0gJ2luZGVudCcgaW4gdG9wID8gdG9wLmluZGVudCA6IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh0b2tlbi50eXBlID09PSAnZmxvdy1jb2xsZWN0aW9uJyAmJiB0b3AudHlwZSA9PT0gJ2RvY3VtZW50Jykge1xuICAgICAgICAgICAgICAgIC8vIElnbm9yZSBhbGwgaW5kZW50IGZvciB0b3AtbGV2ZWwgZmxvdyBjb2xsZWN0aW9uc1xuICAgICAgICAgICAgICAgIHRva2VuLmluZGVudCA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodG9rZW4udHlwZSA9PT0gJ2Zsb3ctY29sbGVjdGlvbicpXG4gICAgICAgICAgICAgICAgZml4Rmxvd1NlcUl0ZW1zKHRva2VuKTtcbiAgICAgICAgICAgIHN3aXRjaCAodG9wLnR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdkb2N1bWVudCc6XG4gICAgICAgICAgICAgICAgICAgIHRvcC52YWx1ZSA9IHRva2VuO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdibG9jay1zY2FsYXInOlxuICAgICAgICAgICAgICAgICAgICB0b3AucHJvcHMucHVzaCh0b2tlbik7IC8vIGVycm9yXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2Jsb2NrLW1hcCc6IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaXQgPSB0b3AuaXRlbXNbdG9wLml0ZW1zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcC5pdGVtcy5wdXNoKHsgc3RhcnQ6IFtdLCBrZXk6IHRva2VuLCBzZXA6IFtdIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbktleUxpbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGl0LnNlcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXQudmFsdWUgPSB0b2tlbjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oaXQsIHsga2V5OiB0b2tlbiwgc2VwOiBbXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25LZXlMaW5lID0gIWl0LmV4cGxpY2l0S2V5O1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXNlICdibG9jay1zZXEnOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGl0ID0gdG9wLml0ZW1zW3RvcC5pdGVtcy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0LnZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgdG9wLml0ZW1zLnB1c2goeyBzdGFydDogW10sIHZhbHVlOiB0b2tlbiB9KTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgaXQudmFsdWUgPSB0b2tlbjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgJ2Zsb3ctY29sbGVjdGlvbic6IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaXQgPSB0b3AuaXRlbXNbdG9wLml0ZW1zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWl0IHx8IGl0LnZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgdG9wLml0ZW1zLnB1c2goeyBzdGFydDogW10sIGtleTogdG9rZW4sIHNlcDogW10gfSk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGl0LnNlcClcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0LnZhbHVlID0gdG9rZW47XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oaXQsIHsga2V5OiB0b2tlbiwgc2VwOiBbXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCBzaG91bGQgbm90IGhhcHBlbiAqL1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wb3AodG9rZW4pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCh0b3AudHlwZSA9PT0gJ2RvY3VtZW50JyB8fFxuICAgICAgICAgICAgICAgIHRvcC50eXBlID09PSAnYmxvY2stbWFwJyB8fFxuICAgICAgICAgICAgICAgIHRvcC50eXBlID09PSAnYmxvY2stc2VxJykgJiZcbiAgICAgICAgICAgICAgICAodG9rZW4udHlwZSA9PT0gJ2Jsb2NrLW1hcCcgfHwgdG9rZW4udHlwZSA9PT0gJ2Jsb2NrLXNlcScpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbGFzdCA9IHRva2VuLml0ZW1zW3Rva2VuLml0ZW1zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgIGlmIChsYXN0ICYmXG4gICAgICAgICAgICAgICAgICAgICFsYXN0LnNlcCAmJlxuICAgICAgICAgICAgICAgICAgICAhbGFzdC52YWx1ZSAmJlxuICAgICAgICAgICAgICAgICAgICBsYXN0LnN0YXJ0Lmxlbmd0aCA+IDAgJiZcbiAgICAgICAgICAgICAgICAgICAgZmluZE5vbkVtcHR5SW5kZXgobGFzdC5zdGFydCkgPT09IC0xICYmXG4gICAgICAgICAgICAgICAgICAgICh0b2tlbi5pbmRlbnQgPT09IDAgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3Quc3RhcnQuZXZlcnkoc3QgPT4gc3QudHlwZSAhPT0gJ2NvbW1lbnQnIHx8IHN0LmluZGVudCA8IHRva2VuLmluZGVudCkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0b3AudHlwZSA9PT0gJ2RvY3VtZW50JylcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcC5lbmQgPSBsYXN0LnN0YXJ0O1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3AuaXRlbXMucHVzaCh7IHN0YXJ0OiBsYXN0LnN0YXJ0IH0pO1xuICAgICAgICAgICAgICAgICAgICB0b2tlbi5pdGVtcy5zcGxpY2UoLTEsIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAqc3RyZWFtKCkge1xuICAgICAgICBzd2l0Y2ggKHRoaXMudHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnZGlyZWN0aXZlLWxpbmUnOlxuICAgICAgICAgICAgICAgIHlpZWxkIHsgdHlwZTogJ2RpcmVjdGl2ZScsIG9mZnNldDogdGhpcy5vZmZzZXQsIHNvdXJjZTogdGhpcy5zb3VyY2UgfTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBjYXNlICdieXRlLW9yZGVyLW1hcmsnOlxuICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICB5aWVsZCB0aGlzLnNvdXJjZVRva2VuO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIGNhc2UgJ2RvYy1tb2RlJzpcbiAgICAgICAgICAgIGNhc2UgJ2RvYy1zdGFydCc6IHtcbiAgICAgICAgICAgICAgICBjb25zdCBkb2MgPSB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdkb2N1bWVudCcsXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0OiBbXVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudHlwZSA9PT0gJ2RvYy1zdGFydCcpXG4gICAgICAgICAgICAgICAgICAgIGRvYy5zdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhY2sucHVzaChkb2MpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB5aWVsZCB7XG4gICAgICAgICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGBVbmV4cGVjdGVkICR7dGhpcy50eXBlfSB0b2tlbiBpbiBZQU1MIHN0cmVhbWAsXG4gICAgICAgICAgICBzb3VyY2U6IHRoaXMuc291cmNlXG4gICAgICAgIH07XG4gICAgfVxuICAgICpkb2N1bWVudChkb2MpIHtcbiAgICAgICAgaWYgKGRvYy52YWx1ZSlcbiAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5saW5lRW5kKGRvYyk7XG4gICAgICAgIHN3aXRjaCAodGhpcy50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdkb2Mtc3RhcnQnOiB7XG4gICAgICAgICAgICAgICAgaWYgKGZpbmROb25FbXB0eUluZGV4KGRvYy5zdGFydCkgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5zdGVwKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgZG9jLnN0YXJ0LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSAnYW5jaG9yJzpcbiAgICAgICAgICAgIGNhc2UgJ3RhZyc6XG4gICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgIGRvYy5zdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBidiA9IHRoaXMuc3RhcnRCbG9ja1ZhbHVlKGRvYyk7XG4gICAgICAgIGlmIChidilcbiAgICAgICAgICAgIHRoaXMuc3RhY2sucHVzaChidik7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgeWllbGQge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdlcnJvcicsXG4gICAgICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBgVW5leHBlY3RlZCAke3RoaXMudHlwZX0gdG9rZW4gaW4gWUFNTCBkb2N1bWVudGAsXG4gICAgICAgICAgICAgICAgc291cmNlOiB0aGlzLnNvdXJjZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAqc2NhbGFyKHNjYWxhcikge1xuICAgICAgICBpZiAodGhpcy50eXBlID09PSAnbWFwLXZhbHVlLWluZCcpIHtcbiAgICAgICAgICAgIGNvbnN0IHByZXYgPSBnZXRQcmV2UHJvcHModGhpcy5wZWVrKDIpKTtcbiAgICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gZ2V0Rmlyc3RLZXlTdGFydFByb3BzKHByZXYpO1xuICAgICAgICAgICAgbGV0IHNlcDtcbiAgICAgICAgICAgIGlmIChzY2FsYXIuZW5kKSB7XG4gICAgICAgICAgICAgICAgc2VwID0gc2NhbGFyLmVuZDtcbiAgICAgICAgICAgICAgICBzZXAucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgc2NhbGFyLmVuZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBzZXAgPSBbdGhpcy5zb3VyY2VUb2tlbl07XG4gICAgICAgICAgICBjb25zdCBtYXAgPSB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2Jsb2NrLW1hcCcsXG4gICAgICAgICAgICAgICAgb2Zmc2V0OiBzY2FsYXIub2Zmc2V0LFxuICAgICAgICAgICAgICAgIGluZGVudDogc2NhbGFyLmluZGVudCxcbiAgICAgICAgICAgICAgICBpdGVtczogW3sgc3RhcnQsIGtleTogc2NhbGFyLCBzZXAgfV1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLm9uS2V5TGluZSA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLnN0YWNrW3RoaXMuc3RhY2subGVuZ3RoIC0gMV0gPSBtYXA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgeWllbGQqIHRoaXMubGluZUVuZChzY2FsYXIpO1xuICAgIH1cbiAgICAqYmxvY2tTY2FsYXIoc2NhbGFyKSB7XG4gICAgICAgIHN3aXRjaCAodGhpcy50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgIHNjYWxhci5wcm9wcy5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIGNhc2UgJ3NjYWxhcic6XG4gICAgICAgICAgICAgICAgc2NhbGFyLnNvdXJjZSA9IHRoaXMuc291cmNlO1xuICAgICAgICAgICAgICAgIC8vIGJsb2NrLXNjYWxhciBzb3VyY2UgaW5jbHVkZXMgdHJhaWxpbmcgbmV3bGluZVxuICAgICAgICAgICAgICAgIHRoaXMuYXROZXdMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmluZGVudCA9IDA7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub25OZXdMaW5lKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBubCA9IHRoaXMuc291cmNlLmluZGV4T2YoJ1xcbicpICsgMTtcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKG5sICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uTmV3TGluZSh0aGlzLm9mZnNldCArIG5sKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5sID0gdGhpcy5zb3VyY2UuaW5kZXhPZignXFxuJywgbmwpICsgMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wb3AoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0IHNob3VsZCBub3QgaGFwcGVuICovXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnBvcCgpO1xuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnN0ZXAoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAqYmxvY2tNYXAobWFwKSB7XG4gICAgICAgIGNvbnN0IGl0ID0gbWFwLml0ZW1zW21hcC5pdGVtcy5sZW5ndGggLSAxXTtcbiAgICAgICAgLy8gaXQuc2VwIGlzIHRydWUtaXNoIGlmIHBhaXIgYWxyZWFkeSBoYXMga2V5IG9yIDogc2VwYXJhdG9yXG4gICAgICAgIHN3aXRjaCAodGhpcy50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICB0aGlzLm9uS2V5TGluZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmIChpdC52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlbmQgPSAnZW5kJyBpbiBpdC52YWx1ZSA/IGl0LnZhbHVlLmVuZCA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbGFzdCA9IEFycmF5LmlzQXJyYXkoZW5kKSA/IGVuZFtlbmQubGVuZ3RoIC0gMV0gOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsYXN0Py50eXBlID09PSAnY29tbWVudCcpXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmQ/LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5pdGVtcy5wdXNoKHsgc3RhcnQ6IFt0aGlzLnNvdXJjZVRva2VuXSB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaXQuc2VwKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0LnNlcC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaXQuc3RhcnQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgICAgICAgICAgaWYgKGl0LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIG1hcC5pdGVtcy5wdXNoKHsgc3RhcnQ6IFt0aGlzLnNvdXJjZVRva2VuXSB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaXQuc2VwKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0LnNlcC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuYXRJbmRlbnRlZENvbW1lbnQoaXQuc3RhcnQsIG1hcC5pbmRlbnQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwcmV2ID0gbWFwLml0ZW1zW21hcC5pdGVtcy5sZW5ndGggLSAyXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVuZCA9IHByZXY/LnZhbHVlPy5lbmQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShlbmQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkoZW5kLCBpdC5zdGFydCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5kLnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwLml0ZW1zLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpdC5zdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuaW5kZW50ID49IG1hcC5pbmRlbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IGF0TWFwSW5kZW50ID0gIXRoaXMub25LZXlMaW5lICYmIHRoaXMuaW5kZW50ID09PSBtYXAuaW5kZW50O1xuICAgICAgICAgICAgY29uc3QgYXROZXh0SXRlbSA9IGF0TWFwSW5kZW50ICYmXG4gICAgICAgICAgICAgICAgKGl0LnNlcCB8fCBpdC5leHBsaWNpdEtleSkgJiZcbiAgICAgICAgICAgICAgICB0aGlzLnR5cGUgIT09ICdzZXEtaXRlbS1pbmQnO1xuICAgICAgICAgICAgLy8gRm9yIGVtcHR5IG5vZGVzLCBhc3NpZ24gbmV3bGluZS1zZXBhcmF0ZWQgbm90IGluZGVudGVkIGVtcHR5IHRva2VucyB0byBmb2xsb3dpbmcgbm9kZVxuICAgICAgICAgICAgbGV0IHN0YXJ0ID0gW107XG4gICAgICAgICAgICBpZiAoYXROZXh0SXRlbSAmJiBpdC5zZXAgJiYgIWl0LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmwgPSBbXTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0LnNlcC5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdCA9IGl0LnNlcFtpXTtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChzdC50eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBubC5wdXNoKGkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0LmluZGVudCA+IG1hcC5pbmRlbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5sLmxlbmd0aCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5sLmxlbmd0aCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5sLmxlbmd0aCA+PSAyKVxuICAgICAgICAgICAgICAgICAgICBzdGFydCA9IGl0LnNlcC5zcGxpY2UobmxbMV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3dpdGNoICh0aGlzLnR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdhbmNob3InOlxuICAgICAgICAgICAgICAgIGNhc2UgJ3RhZyc6XG4gICAgICAgICAgICAgICAgICAgIGlmIChhdE5leHRJdGVtIHx8IGl0LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFwLml0ZW1zLnB1c2goeyBzdGFydCB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25LZXlMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpdC5zZXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0LnNlcC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXQuc3RhcnQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgY2FzZSAnZXhwbGljaXQta2V5LWluZCc6XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXQuc2VwICYmICFpdC5leHBsaWNpdEtleSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXQuc3RhcnQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0LmV4cGxpY2l0S2V5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChhdE5leHRJdGVtIHx8IGl0LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFwLml0ZW1zLnB1c2goeyBzdGFydCwgZXhwbGljaXRLZXk6IHRydWUgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YWNrLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdibG9jay1tYXAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZW50OiB0aGlzLmluZGVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogW3sgc3RhcnQ6IFt0aGlzLnNvdXJjZVRva2VuXSwgZXhwbGljaXRLZXk6IHRydWUgfV1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25LZXlMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGNhc2UgJ21hcC12YWx1ZS1pbmQnOlxuICAgICAgICAgICAgICAgICAgICBpZiAoaXQuZXhwbGljaXRLZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXQuc2VwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluY2x1ZGVzVG9rZW4oaXQuc3RhcnQsICduZXdsaW5lJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihpdCwgeyBrZXk6IG51bGwsIHNlcDogW3RoaXMuc291cmNlVG9rZW5dIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RhcnQgPSBnZXRGaXJzdEtleVN0YXJ0UHJvcHMoaXQuc3RhcnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YWNrLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Jsb2NrLW1hcCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZW50OiB0aGlzLmluZGVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbeyBzdGFydCwga2V5OiBudWxsLCBzZXA6IFt0aGlzLnNvdXJjZVRva2VuXSB9XVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpdC52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5pdGVtcy5wdXNoKHsgc3RhcnQ6IFtdLCBrZXk6IG51bGwsIHNlcDogW3RoaXMuc291cmNlVG9rZW5dIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaW5jbHVkZXNUb2tlbihpdC5zZXAsICdtYXAtdmFsdWUtaW5kJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YWNrLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYmxvY2stbWFwJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZW50OiB0aGlzLmluZGVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFt7IHN0YXJ0LCBrZXk6IG51bGwsIHNlcDogW3RoaXMuc291cmNlVG9rZW5dIH1dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpc0Zsb3dUb2tlbihpdC5rZXkpICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIWluY2x1ZGVzVG9rZW4oaXQuc2VwLCAnbmV3bGluZScpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RhcnQgPSBnZXRGaXJzdEtleVN0YXJ0UHJvcHMoaXQuc3RhcnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGtleSA9IGl0LmtleTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzZXAgPSBpdC5zZXA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VwLnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0eXBlIGd1YXJkIGlzIHdyb25nIGhlcmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgaXQua2V5O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHlwZSBndWFyZCBpcyB3cm9uZyBoZXJlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGl0LnNlcDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YWNrLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYmxvY2stbWFwJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZW50OiB0aGlzLmluZGVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFt7IHN0YXJ0LCBrZXksIHNlcCB9XVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoc3RhcnQubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5vdCBhY3R1YWxseSBhdCBuZXh0IGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdC5zZXAgPSBpdC5zZXAuY29uY2F0KHN0YXJ0LCB0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0LnNlcC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpdC5zZXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKGl0LCB7IGtleTogbnVsbCwgc2VwOiBbdGhpcy5zb3VyY2VUb2tlbl0gfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpdC52YWx1ZSB8fCBhdE5leHRJdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwLml0ZW1zLnB1c2goeyBzdGFydCwga2V5OiBudWxsLCBzZXA6IFt0aGlzLnNvdXJjZVRva2VuXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGluY2x1ZGVzVG9rZW4oaXQuc2VwLCAnbWFwLXZhbHVlLWluZCcpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGFjay5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Jsb2NrLW1hcCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZGVudDogdGhpcy5pbmRlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbeyBzdGFydDogW10sIGtleTogbnVsbCwgc2VwOiBbdGhpcy5zb3VyY2VUb2tlbl0gfV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0LnNlcC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25LZXlMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2FsaWFzJzpcbiAgICAgICAgICAgICAgICBjYXNlICdzY2FsYXInOlxuICAgICAgICAgICAgICAgIGNhc2UgJ3NpbmdsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgICAgICAgICBjYXNlICdkb3VibGUtcXVvdGVkLXNjYWxhcic6IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZnMgPSB0aGlzLmZsb3dTY2FsYXIodGhpcy50eXBlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGF0TmV4dEl0ZW0gfHwgaXQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5pdGVtcy5wdXNoKHsgc3RhcnQsIGtleTogZnMsIHNlcDogW10gfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uS2V5TGluZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaXQuc2VwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YWNrLnB1c2goZnMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihpdCwgeyBrZXk6IGZzLCBzZXA6IFtdIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbktleUxpbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBidiA9IHRoaXMuc3RhcnRCbG9ja1ZhbHVlKG1hcCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChidikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJ2LnR5cGUgPT09ICdibG9jay1zZXEnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpdC5leHBsaWNpdEtleSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdC5zZXAgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIWluY2x1ZGVzVG9rZW4oaXQuc2VwLCAnbmV3bGluZScpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnBvcCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnZXJyb3InLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdVbmV4cGVjdGVkIGJsb2NrLXNlcS1pbmQgb24gc2FtZSBsaW5lIHdpdGgga2V5JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogdGhpcy5zb3VyY2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChhdE1hcEluZGVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5pdGVtcy5wdXNoKHsgc3RhcnQgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YWNrLnB1c2goYnYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHlpZWxkKiB0aGlzLnBvcCgpO1xuICAgICAgICB5aWVsZCogdGhpcy5zdGVwKCk7XG4gICAgfVxuICAgICpibG9ja1NlcXVlbmNlKHNlcSkge1xuICAgICAgICBjb25zdCBpdCA9IHNlcS5pdGVtc1tzZXEuaXRlbXMubGVuZ3RoIC0gMV07XG4gICAgICAgIHN3aXRjaCAodGhpcy50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICBpZiAoaXQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZW5kID0gJ2VuZCcgaW4gaXQudmFsdWUgPyBpdC52YWx1ZS5lbmQgOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGxhc3QgPSBBcnJheS5pc0FycmF5KGVuZCkgPyBlbmRbZW5kLmxlbmd0aCAtIDFdIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICBpZiAobGFzdD8udHlwZSA9PT0gJ2NvbW1lbnQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kPy5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXEuaXRlbXMucHVzaCh7IHN0YXJ0OiBbdGhpcy5zb3VyY2VUb2tlbl0gfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgaXQuc3RhcnQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgICAgICAgICBpZiAoaXQudmFsdWUpXG4gICAgICAgICAgICAgICAgICAgIHNlcS5pdGVtcy5wdXNoKHsgc3RhcnQ6IFt0aGlzLnNvdXJjZVRva2VuXSB9KTtcbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuYXRJbmRlbnRlZENvbW1lbnQoaXQuc3RhcnQsIHNlcS5pbmRlbnQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwcmV2ID0gc2VxLml0ZW1zW3NlcS5pdGVtcy5sZW5ndGggLSAyXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVuZCA9IHByZXY/LnZhbHVlPy5lbmQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShlbmQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkoZW5kLCBpdC5zdGFydCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5kLnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VxLml0ZW1zLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpdC5zdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBjYXNlICdhbmNob3InOlxuICAgICAgICAgICAgY2FzZSAndGFnJzpcbiAgICAgICAgICAgICAgICBpZiAoaXQudmFsdWUgfHwgdGhpcy5pbmRlbnQgPD0gc2VxLmluZGVudClcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgaXQuc3RhcnQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBjYXNlICdzZXEtaXRlbS1pbmQnOlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmluZGVudCAhPT0gc2VxLmluZGVudClcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgaWYgKGl0LnZhbHVlIHx8IGluY2x1ZGVzVG9rZW4oaXQuc3RhcnQsICdzZXEtaXRlbS1pbmQnKSlcbiAgICAgICAgICAgICAgICAgICAgc2VxLml0ZW1zLnB1c2goeyBzdGFydDogW3RoaXMuc291cmNlVG9rZW5dIH0pO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgaXQuc3RhcnQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuaW5kZW50ID4gc2VxLmluZGVudCkge1xuICAgICAgICAgICAgY29uc3QgYnYgPSB0aGlzLnN0YXJ0QmxvY2tWYWx1ZShzZXEpO1xuICAgICAgICAgICAgaWYgKGJ2KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGFjay5wdXNoKGJ2KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgeWllbGQqIHRoaXMucG9wKCk7XG4gICAgICAgIHlpZWxkKiB0aGlzLnN0ZXAoKTtcbiAgICB9XG4gICAgKmZsb3dDb2xsZWN0aW9uKGZjKSB7XG4gICAgICAgIGNvbnN0IGl0ID0gZmMuaXRlbXNbZmMuaXRlbXMubGVuZ3RoIC0gMV07XG4gICAgICAgIGlmICh0aGlzLnR5cGUgPT09ICdmbG93LWVycm9yLWVuZCcpIHtcbiAgICAgICAgICAgIGxldCB0b3A7XG4gICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucG9wKCk7XG4gICAgICAgICAgICAgICAgdG9wID0gdGhpcy5wZWVrKDEpO1xuICAgICAgICAgICAgfSB3aGlsZSAodG9wPy50eXBlID09PSAnZmxvdy1jb2xsZWN0aW9uJyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZmMuZW5kLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgc3dpdGNoICh0aGlzLnR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdjb21tYSc6XG4gICAgICAgICAgICAgICAgY2FzZSAnZXhwbGljaXQta2V5LWluZCc6XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXQgfHwgaXQuc2VwKVxuICAgICAgICAgICAgICAgICAgICAgICAgZmMuaXRlbXMucHVzaCh7IHN0YXJ0OiBbdGhpcy5zb3VyY2VUb2tlbl0gfSk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0LnN0YXJ0LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICBjYXNlICdtYXAtdmFsdWUtaW5kJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpdCB8fCBpdC52YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGZjLml0ZW1zLnB1c2goeyBzdGFydDogW10sIGtleTogbnVsbCwgc2VwOiBbdGhpcy5zb3VyY2VUb2tlbl0gfSk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGl0LnNlcClcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0LnNlcC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKGl0LCB7IGtleTogbnVsbCwgc2VwOiBbdGhpcy5zb3VyY2VUb2tlbl0gfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgICAgICAgICAgY2FzZSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgICAgY2FzZSAnYW5jaG9yJzpcbiAgICAgICAgICAgICAgICBjYXNlICd0YWcnOlxuICAgICAgICAgICAgICAgICAgICBpZiAoIWl0IHx8IGl0LnZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgZmMuaXRlbXMucHVzaCh7IHN0YXJ0OiBbdGhpcy5zb3VyY2VUb2tlbl0gfSk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGl0LnNlcClcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0LnNlcC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBpdC5zdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgY2FzZSAnYWxpYXMnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ3NjYWxhcic6XG4gICAgICAgICAgICAgICAgY2FzZSAnc2luZ2xlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICAgICAgICAgIGNhc2UgJ2RvdWJsZS1xdW90ZWQtc2NhbGFyJzoge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmcyA9IHRoaXMuZmxvd1NjYWxhcih0aGlzLnR5cGUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWl0IHx8IGl0LnZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgZmMuaXRlbXMucHVzaCh7IHN0YXJ0OiBbXSwga2V5OiBmcywgc2VwOiBbXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaXQuc2VwKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGFjay5wdXNoKGZzKTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihpdCwgeyBrZXk6IGZzLCBzZXA6IFtdIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgJ2Zsb3ctbWFwLWVuZCc6XG4gICAgICAgICAgICAgICAgY2FzZSAnZmxvdy1zZXEtZW5kJzpcbiAgICAgICAgICAgICAgICAgICAgZmMuZW5kLnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGJ2ID0gdGhpcy5zdGFydEJsb2NrVmFsdWUoZmMpO1xuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2Ugc2hvdWxkIG5vdCBoYXBwZW4gKi9cbiAgICAgICAgICAgIGlmIChidilcbiAgICAgICAgICAgICAgICB0aGlzLnN0YWNrLnB1c2goYnYpO1xuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucG9wKCk7XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMuc3RlcCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgcGFyZW50ID0gdGhpcy5wZWVrKDIpO1xuICAgICAgICAgICAgaWYgKHBhcmVudC50eXBlID09PSAnYmxvY2stbWFwJyAmJlxuICAgICAgICAgICAgICAgICgodGhpcy50eXBlID09PSAnbWFwLXZhbHVlLWluZCcgJiYgcGFyZW50LmluZGVudCA9PT0gZmMuaW5kZW50KSB8fFxuICAgICAgICAgICAgICAgICAgICAodGhpcy50eXBlID09PSAnbmV3bGluZScgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICFwYXJlbnQuaXRlbXNbcGFyZW50Lml0ZW1zLmxlbmd0aCAtIDFdLnNlcCkpKSB7XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucG9wKCk7XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMuc3RlcCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy50eXBlID09PSAnbWFwLXZhbHVlLWluZCcgJiZcbiAgICAgICAgICAgICAgICBwYXJlbnQudHlwZSAhPT0gJ2Zsb3ctY29sbGVjdGlvbicpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwcmV2ID0gZ2V0UHJldlByb3BzKHBhcmVudCk7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhcnQgPSBnZXRGaXJzdEtleVN0YXJ0UHJvcHMocHJldik7XG4gICAgICAgICAgICAgICAgZml4Rmxvd1NlcUl0ZW1zKGZjKTtcbiAgICAgICAgICAgICAgICBjb25zdCBzZXAgPSBmYy5lbmQuc3BsaWNlKDEsIGZjLmVuZC5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIHNlcC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1hcCA9IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Jsb2NrLW1hcCcsXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldDogZmMub2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICBpbmRlbnQ6IGZjLmluZGVudCxcbiAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFt7IHN0YXJ0LCBrZXk6IGZjLCBzZXAgfV1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMub25LZXlMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YWNrW3RoaXMuc3RhY2subGVuZ3RoIC0gMV0gPSBtYXA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5saW5lRW5kKGZjKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBmbG93U2NhbGFyKHR5cGUpIHtcbiAgICAgICAgaWYgKHRoaXMub25OZXdMaW5lKSB7XG4gICAgICAgICAgICBsZXQgbmwgPSB0aGlzLnNvdXJjZS5pbmRleE9mKCdcXG4nKSArIDE7XG4gICAgICAgICAgICB3aGlsZSAobmwgIT09IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uTmV3TGluZSh0aGlzLm9mZnNldCArIG5sKTtcbiAgICAgICAgICAgICAgICBubCA9IHRoaXMuc291cmNlLmluZGV4T2YoJ1xcbicsIG5sKSArIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgaW5kZW50OiB0aGlzLmluZGVudCxcbiAgICAgICAgICAgIHNvdXJjZTogdGhpcy5zb3VyY2VcbiAgICAgICAgfTtcbiAgICB9XG4gICAgc3RhcnRCbG9ja1ZhbHVlKHBhcmVudCkge1xuICAgICAgICBzd2l0Y2ggKHRoaXMudHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnYWxpYXMnOlxuICAgICAgICAgICAgY2FzZSAnc2NhbGFyJzpcbiAgICAgICAgICAgIGNhc2UgJ3NpbmdsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgICAgIGNhc2UgJ2RvdWJsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5mbG93U2NhbGFyKHRoaXMudHlwZSk7XG4gICAgICAgICAgICBjYXNlICdibG9jay1zY2FsYXItaGVhZGVyJzpcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYmxvY2stc2NhbGFyJyxcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgaW5kZW50OiB0aGlzLmluZGVudCxcbiAgICAgICAgICAgICAgICAgICAgcHJvcHM6IFt0aGlzLnNvdXJjZVRva2VuXSxcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiAnJ1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjYXNlICdmbG93LW1hcC1zdGFydCc6XG4gICAgICAgICAgICBjYXNlICdmbG93LXNlcS1zdGFydCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Zsb3ctY29sbGVjdGlvbicsXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgIGluZGVudDogdGhpcy5pbmRlbnQsXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0OiB0aGlzLnNvdXJjZVRva2VuLFxuICAgICAgICAgICAgICAgICAgICBpdGVtczogW10sXG4gICAgICAgICAgICAgICAgICAgIGVuZDogW11cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgY2FzZSAnc2VxLWl0ZW0taW5kJzpcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYmxvY2stc2VxJyxcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgaW5kZW50OiB0aGlzLmluZGVudCxcbiAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFt7IHN0YXJ0OiBbdGhpcy5zb3VyY2VUb2tlbl0gfV1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgY2FzZSAnZXhwbGljaXQta2V5LWluZCc6IHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uS2V5TGluZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJldiA9IGdldFByZXZQcm9wcyhwYXJlbnQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gZ2V0Rmlyc3RLZXlTdGFydFByb3BzKHByZXYpO1xuICAgICAgICAgICAgICAgIHN0YXJ0LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Jsb2NrLW1hcCcsXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgIGluZGVudDogdGhpcy5pbmRlbnQsXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbeyBzdGFydCwgZXhwbGljaXRLZXk6IHRydWUgfV1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSAnbWFwLXZhbHVlLWluZCc6IHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uS2V5TGluZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJldiA9IGdldFByZXZQcm9wcyhwYXJlbnQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gZ2V0Rmlyc3RLZXlTdGFydFByb3BzKHByZXYpO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdibG9jay1tYXAnLFxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICBpbmRlbnQ6IHRoaXMuaW5kZW50LFxuICAgICAgICAgICAgICAgICAgICBpdGVtczogW3sgc3RhcnQsIGtleTogbnVsbCwgc2VwOiBbdGhpcy5zb3VyY2VUb2tlbl0gfV1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBhdEluZGVudGVkQ29tbWVudChzdGFydCwgaW5kZW50KSB7XG4gICAgICAgIGlmICh0aGlzLnR5cGUgIT09ICdjb21tZW50JylcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYgKHRoaXMuaW5kZW50IDw9IGluZGVudClcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHN0YXJ0LmV2ZXJ5KHN0ID0+IHN0LnR5cGUgPT09ICduZXdsaW5lJyB8fCBzdC50eXBlID09PSAnc3BhY2UnKTtcbiAgICB9XG4gICAgKmRvY3VtZW50RW5kKGRvY0VuZCkge1xuICAgICAgICBpZiAodGhpcy50eXBlICE9PSAnZG9jLW1vZGUnKSB7XG4gICAgICAgICAgICBpZiAoZG9jRW5kLmVuZClcbiAgICAgICAgICAgICAgICBkb2NFbmQuZW5kLnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgZG9jRW5kLmVuZCA9IFt0aGlzLnNvdXJjZVRva2VuXTtcbiAgICAgICAgICAgIGlmICh0aGlzLnR5cGUgPT09ICduZXdsaW5lJylcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wb3AoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAqbGluZUVuZCh0b2tlbikge1xuICAgICAgICBzd2l0Y2ggKHRoaXMudHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnY29tbWEnOlxuICAgICAgICAgICAgY2FzZSAnZG9jLXN0YXJ0JzpcbiAgICAgICAgICAgIGNhc2UgJ2RvYy1lbmQnOlxuICAgICAgICAgICAgY2FzZSAnZmxvdy1zZXEtZW5kJzpcbiAgICAgICAgICAgIGNhc2UgJ2Zsb3ctbWFwLWVuZCc6XG4gICAgICAgICAgICBjYXNlICdtYXAtdmFsdWUtaW5kJzpcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wb3AoKTtcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5zdGVwKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICB0aGlzLm9uS2V5TGluZSA9IGZhbHNlO1xuICAgICAgICAgICAgLy8gZmFsbHRocm91Z2hcbiAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcbiAgICAgICAgICAgIGNhc2UgJ2NvbW1lbnQnOlxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAvLyBhbGwgb3RoZXIgdmFsdWVzIGFyZSBlcnJvcnNcbiAgICAgICAgICAgICAgICBpZiAodG9rZW4uZW5kKVxuICAgICAgICAgICAgICAgICAgICB0b2tlbi5lbmQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHRva2VuLmVuZCA9IFt0aGlzLnNvdXJjZVRva2VuXTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy50eXBlID09PSAnbmV3bGluZScpXG4gICAgICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnBvcCgpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnRzLlBhcnNlciA9IFBhcnNlcjtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY29tcG9zZXIgPSByZXF1aXJlKCcuL2NvbXBvc2UvY29tcG9zZXIuanMnKTtcbnZhciBEb2N1bWVudCA9IHJlcXVpcmUoJy4vZG9jL0RvY3VtZW50LmpzJyk7XG52YXIgZXJyb3JzID0gcmVxdWlyZSgnLi9lcnJvcnMuanMnKTtcbnZhciBsb2cgPSByZXF1aXJlKCcuL2xvZy5qcycpO1xudmFyIGlkZW50aXR5ID0gcmVxdWlyZSgnLi9ub2Rlcy9pZGVudGl0eS5qcycpO1xudmFyIGxpbmVDb3VudGVyID0gcmVxdWlyZSgnLi9wYXJzZS9saW5lLWNvdW50ZXIuanMnKTtcbnZhciBwYXJzZXIgPSByZXF1aXJlKCcuL3BhcnNlL3BhcnNlci5qcycpO1xuXG5mdW5jdGlvbiBwYXJzZU9wdGlvbnMob3B0aW9ucykge1xuICAgIGNvbnN0IHByZXR0eUVycm9ycyA9IG9wdGlvbnMucHJldHR5RXJyb3JzICE9PSBmYWxzZTtcbiAgICBjb25zdCBsaW5lQ291bnRlciQxID0gb3B0aW9ucy5saW5lQ291bnRlciB8fCAocHJldHR5RXJyb3JzICYmIG5ldyBsaW5lQ291bnRlci5MaW5lQ291bnRlcigpKSB8fCBudWxsO1xuICAgIHJldHVybiB7IGxpbmVDb3VudGVyOiBsaW5lQ291bnRlciQxLCBwcmV0dHlFcnJvcnMgfTtcbn1cbi8qKlxuICogUGFyc2UgdGhlIGlucHV0IGFzIGEgc3RyZWFtIG9mIFlBTUwgZG9jdW1lbnRzLlxuICpcbiAqIERvY3VtZW50cyBzaG91bGQgYmUgc2VwYXJhdGVkIGZyb20gZWFjaCBvdGhlciBieSBgLi4uYCBvciBgLS0tYCBtYXJrZXIgbGluZXMuXG4gKlxuICogQHJldHVybnMgSWYgYW4gZW1wdHkgYGRvY3NgIGFycmF5IGlzIHJldHVybmVkLCBpdCB3aWxsIGJlIG9mIHR5cGVcbiAqICAgRW1wdHlTdHJlYW0gYW5kIGNvbnRhaW4gYWRkaXRpb25hbCBzdHJlYW0gaW5mb3JtYXRpb24uIEluXG4gKiAgIFR5cGVTY3JpcHQsIHlvdSBzaG91bGQgdXNlIGAnZW1wdHknIGluIGRvY3NgIGFzIGEgdHlwZSBndWFyZCBmb3IgaXQuXG4gKi9cbmZ1bmN0aW9uIHBhcnNlQWxsRG9jdW1lbnRzKHNvdXJjZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgY29uc3QgeyBsaW5lQ291bnRlciwgcHJldHR5RXJyb3JzIH0gPSBwYXJzZU9wdGlvbnMob3B0aW9ucyk7XG4gICAgY29uc3QgcGFyc2VyJDEgPSBuZXcgcGFyc2VyLlBhcnNlcihsaW5lQ291bnRlcj8uYWRkTmV3TGluZSk7XG4gICAgY29uc3QgY29tcG9zZXIkMSA9IG5ldyBjb21wb3Nlci5Db21wb3NlcihvcHRpb25zKTtcbiAgICBjb25zdCBkb2NzID0gQXJyYXkuZnJvbShjb21wb3NlciQxLmNvbXBvc2UocGFyc2VyJDEucGFyc2Uoc291cmNlKSkpO1xuICAgIGlmIChwcmV0dHlFcnJvcnMgJiYgbGluZUNvdW50ZXIpXG4gICAgICAgIGZvciAoY29uc3QgZG9jIG9mIGRvY3MpIHtcbiAgICAgICAgICAgIGRvYy5lcnJvcnMuZm9yRWFjaChlcnJvcnMucHJldHRpZnlFcnJvcihzb3VyY2UsIGxpbmVDb3VudGVyKSk7XG4gICAgICAgICAgICBkb2Mud2FybmluZ3MuZm9yRWFjaChlcnJvcnMucHJldHRpZnlFcnJvcihzb3VyY2UsIGxpbmVDb3VudGVyKSk7XG4gICAgICAgIH1cbiAgICBpZiAoZG9jcy5sZW5ndGggPiAwKVxuICAgICAgICByZXR1cm4gZG9jcztcbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihbXSwgeyBlbXB0eTogdHJ1ZSB9LCBjb21wb3NlciQxLnN0cmVhbUluZm8oKSk7XG59XG4vKiogUGFyc2UgYW4gaW5wdXQgc3RyaW5nIGludG8gYSBzaW5nbGUgWUFNTC5Eb2N1bWVudCAqL1xuZnVuY3Rpb24gcGFyc2VEb2N1bWVudChzb3VyY2UsIG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IHsgbGluZUNvdW50ZXIsIHByZXR0eUVycm9ycyB9ID0gcGFyc2VPcHRpb25zKG9wdGlvbnMpO1xuICAgIGNvbnN0IHBhcnNlciQxID0gbmV3IHBhcnNlci5QYXJzZXIobGluZUNvdW50ZXI/LmFkZE5ld0xpbmUpO1xuICAgIGNvbnN0IGNvbXBvc2VyJDEgPSBuZXcgY29tcG9zZXIuQ29tcG9zZXIob3B0aW9ucyk7XG4gICAgLy8gYGRvY2AgaXMgYWx3YXlzIHNldCBieSBjb21wb3NlLmVuZCh0cnVlKSBhdCB0aGUgdmVyeSBsYXRlc3RcbiAgICBsZXQgZG9jID0gbnVsbDtcbiAgICBmb3IgKGNvbnN0IF9kb2Mgb2YgY29tcG9zZXIkMS5jb21wb3NlKHBhcnNlciQxLnBhcnNlKHNvdXJjZSksIHRydWUsIHNvdXJjZS5sZW5ndGgpKSB7XG4gICAgICAgIGlmICghZG9jKVxuICAgICAgICAgICAgZG9jID0gX2RvYztcbiAgICAgICAgZWxzZSBpZiAoZG9jLm9wdGlvbnMubG9nTGV2ZWwgIT09ICdzaWxlbnQnKSB7XG4gICAgICAgICAgICBkb2MuZXJyb3JzLnB1c2gobmV3IGVycm9ycy5ZQU1MUGFyc2VFcnJvcihfZG9jLnJhbmdlLnNsaWNlKDAsIDIpLCAnTVVMVElQTEVfRE9DUycsICdTb3VyY2UgY29udGFpbnMgbXVsdGlwbGUgZG9jdW1lbnRzOyBwbGVhc2UgdXNlIFlBTUwucGFyc2VBbGxEb2N1bWVudHMoKScpKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChwcmV0dHlFcnJvcnMgJiYgbGluZUNvdW50ZXIpIHtcbiAgICAgICAgZG9jLmVycm9ycy5mb3JFYWNoKGVycm9ycy5wcmV0dGlmeUVycm9yKHNvdXJjZSwgbGluZUNvdW50ZXIpKTtcbiAgICAgICAgZG9jLndhcm5pbmdzLmZvckVhY2goZXJyb3JzLnByZXR0aWZ5RXJyb3Ioc291cmNlLCBsaW5lQ291bnRlcikpO1xuICAgIH1cbiAgICByZXR1cm4gZG9jO1xufVxuZnVuY3Rpb24gcGFyc2Uoc3JjLCByZXZpdmVyLCBvcHRpb25zKSB7XG4gICAgbGV0IF9yZXZpdmVyID0gdW5kZWZpbmVkO1xuICAgIGlmICh0eXBlb2YgcmV2aXZlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBfcmV2aXZlciA9IHJldml2ZXI7XG4gICAgfVxuICAgIGVsc2UgaWYgKG9wdGlvbnMgPT09IHVuZGVmaW5lZCAmJiByZXZpdmVyICYmIHR5cGVvZiByZXZpdmVyID09PSAnb2JqZWN0Jykge1xuICAgICAgICBvcHRpb25zID0gcmV2aXZlcjtcbiAgICB9XG4gICAgY29uc3QgZG9jID0gcGFyc2VEb2N1bWVudChzcmMsIG9wdGlvbnMpO1xuICAgIGlmICghZG9jKVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICBkb2Mud2FybmluZ3MuZm9yRWFjaCh3YXJuaW5nID0+IGxvZy53YXJuKGRvYy5vcHRpb25zLmxvZ0xldmVsLCB3YXJuaW5nKSk7XG4gICAgaWYgKGRvYy5lcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgICBpZiAoZG9jLm9wdGlvbnMubG9nTGV2ZWwgIT09ICdzaWxlbnQnKVxuICAgICAgICAgICAgdGhyb3cgZG9jLmVycm9yc1swXTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZG9jLmVycm9ycyA9IFtdO1xuICAgIH1cbiAgICByZXR1cm4gZG9jLnRvSlMoT2JqZWN0LmFzc2lnbih7IHJldml2ZXI6IF9yZXZpdmVyIH0sIG9wdGlvbnMpKTtcbn1cbmZ1bmN0aW9uIHN0cmluZ2lmeSh2YWx1ZSwgcmVwbGFjZXIsIG9wdGlvbnMpIHtcbiAgICBsZXQgX3JlcGxhY2VyID0gbnVsbDtcbiAgICBpZiAodHlwZW9mIHJlcGxhY2VyID09PSAnZnVuY3Rpb24nIHx8IEFycmF5LmlzQXJyYXkocmVwbGFjZXIpKSB7XG4gICAgICAgIF9yZXBsYWNlciA9IHJlcGxhY2VyO1xuICAgIH1cbiAgICBlbHNlIGlmIChvcHRpb25zID09PSB1bmRlZmluZWQgJiYgcmVwbGFjZXIpIHtcbiAgICAgICAgb3B0aW9ucyA9IHJlcGxhY2VyO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdzdHJpbmcnKVxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucy5sZW5ndGg7XG4gICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnbnVtYmVyJykge1xuICAgICAgICBjb25zdCBpbmRlbnQgPSBNYXRoLnJvdW5kKG9wdGlvbnMpO1xuICAgICAgICBvcHRpb25zID0gaW5kZW50IDwgMSA/IHVuZGVmaW5lZCA6IGluZGVudCA+IDggPyB7IGluZGVudDogOCB9IDogeyBpbmRlbnQgfTtcbiAgICB9XG4gICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29uc3QgeyBrZWVwVW5kZWZpbmVkIH0gPSBvcHRpb25zID8/IHJlcGxhY2VyID8/IHt9O1xuICAgICAgICBpZiAoIWtlZXBVbmRlZmluZWQpXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBpZiAoaWRlbnRpdHkuaXNEb2N1bWVudCh2YWx1ZSkgJiYgIV9yZXBsYWNlcilcbiAgICAgICAgcmV0dXJuIHZhbHVlLnRvU3RyaW5nKG9wdGlvbnMpO1xuICAgIHJldHVybiBuZXcgRG9jdW1lbnQuRG9jdW1lbnQodmFsdWUsIF9yZXBsYWNlciwgb3B0aW9ucykudG9TdHJpbmcob3B0aW9ucyk7XG59XG5cbmV4cG9ydHMucGFyc2UgPSBwYXJzZTtcbmV4cG9ydHMucGFyc2VBbGxEb2N1bWVudHMgPSBwYXJzZUFsbERvY3VtZW50cztcbmV4cG9ydHMucGFyc2VEb2N1bWVudCA9IHBhcnNlRG9jdW1lbnQ7XG5leHBvcnRzLnN0cmluZ2lmeSA9IHN0cmluZ2lmeTtcbiIsCiAgICAiLyoqXG4gKiBQbGFuIHBhcnNlciBmb3IgdGhlIEFJIEVuZ2luZWVyaW5nIFN5c3RlbS5cbiAqIEhhbmRsZXMgWUFNTCBwYXJzaW5nLCB2YWxpZGF0aW9uLCBhbmQgZGVwZW5kZW5jeSByZXNvbHV0aW9uIGZvciBleGVjdXRpb24gcGxhbnMuXG4gKi9cblxuaW1wb3J0IHsgcmVhZEZpbGVTeW5jIH0gZnJvbSBcIm5vZGU6ZnNcIjtcbmltcG9ydCB7IERvY3VtZW50LCBwYXJzZSBhcyBwYXJzZVlhbWwgfSBmcm9tIFwieWFtbFwiO1xuaW1wb3J0IHtcbiAgICB0eXBlIEFnZW50VGFzayxcbiAgICBBZ2VudFR5cGUgYXMgQWdlbnRUYXNrVHlwZSxcbiAgICBDb25maWRlbmNlTGV2ZWwsXG4gICAgRXhlY3V0aW9uU3RyYXRlZ3ksXG59IGZyb20gXCIuLi9hZ2VudHMvdHlwZXNcIjtcbmltcG9ydCB7XG4gICAgdHlwZSBFeGVjdXRhYmxlVGFzayxcbiAgICB0eXBlIFBsYW4sXG4gICAgdHlwZSBQbGFuTWV0YWRhdGEsXG4gICAgdHlwZSBRdWFsaXR5R2F0ZUNvbmZpZyxcbiAgICBRdWFsaXR5R2F0ZVR5cGUsXG4gICAgdHlwZSBUYXNrLFxuICAgIFRhc2tUeXBlLFxuICAgIHR5cGUgVmFsaWRhdGlvbkVycm9yLFxuICAgIFZhbGlkYXRpb25FcnJvclR5cGUsXG59IGZyb20gXCIuL3R5cGVzXCI7XG5cbmV4cG9ydCBjbGFzcyBQbGFuUGFyc2VyIHtcbiAgICBwcml2YXRlIGVycm9yczogVmFsaWRhdGlvbkVycm9yW10gPSBbXTtcbiAgICBwcml2YXRlIHdhcm5pbmdzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgLyoqXG4gICAgICogUGFyc2UgYSBwbGFuIGZpbGUgZnJvbSB0aGUgZmlsZXN5c3RlbVxuICAgICAqL1xuICAgIHB1YmxpYyBwYXJzZUZpbGUoZmlsZVBhdGg6IHN0cmluZyk6IFBsYW4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgY29udGVudCA9IHJlYWRGaWxlU3luYyhmaWxlUGF0aCwgXCJ1dGY4XCIpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VDb250ZW50KGNvbnRlbnQsIGZpbGVQYXRoKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICBgRmFpbGVkIHRvIHJlYWQgcGxhbiBmaWxlOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogXCJVbmtub3duIGVycm9yXCJ9YCxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQYXJzZSBwbGFuIGNvbnRlbnQgZnJvbSBzdHJpbmdcbiAgICAgKi9cbiAgICBwdWJsaWMgcGFyc2VDb250ZW50KGNvbnRlbnQ6IHN0cmluZywgc291cmNlPzogc3RyaW5nKTogUGxhbiB7XG4gICAgICAgIHRoaXMuZXJyb3JzID0gW107XG4gICAgICAgIHRoaXMud2FybmluZ3MgPSBbXTtcblxuICAgICAgICBsZXQgcmF3UGxhbjogYW55O1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmF3UGxhbiA9IHBhcnNlWWFtbChjb250ZW50KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICBgSW52YWxpZCBZQU1MIHN5bnRheDogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFwiVW5rbm93biBlcnJvclwifWAsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVmFsaWRhdGUgdG9wLWxldmVsIHN0cnVjdHVyZVxuICAgICAgICB0aGlzLnZhbGlkYXRlVG9wTGV2ZWxTdHJ1Y3R1cmUocmF3UGxhbik7XG5cbiAgICAgICAgaWYgKHRoaXMuZXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICBgUGxhbiB2YWxpZGF0aW9uIGZhaWxlZDpcXG4ke3RoaXMuZXJyb3JzLm1hcCgoZSkgPT4gYCAgLSAke2UubWVzc2FnZX1gKS5qb2luKFwiXFxuXCIpfWAsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUGFyc2UgYW5kIHZhbGlkYXRlIG1ldGFkYXRhXG4gICAgICAgIGNvbnN0IG1ldGFkYXRhID0gdGhpcy5wYXJzZU1ldGFkYXRhKHJhd1BsYW4ubWV0YWRhdGEpO1xuXG4gICAgICAgIC8vIFBhcnNlIGFuZCB2YWxpZGF0ZSB0YXNrc1xuICAgICAgICBjb25zdCB0YXNrcyA9IHRoaXMucGFyc2VUYXNrcyhyYXdQbGFuLnRhc2tzIHx8IFtdKTtcblxuICAgICAgICAvLyBQYXJzZSBhbmQgdmFsaWRhdGUgcXVhbGl0eSBnYXRlc1xuICAgICAgICBjb25zdCBxdWFsaXR5R2F0ZXMgPSB0aGlzLnBhcnNlUXVhbGl0eUdhdGVzKHJhd1BsYW4ucXVhbGl0eUdhdGVzIHx8IFtdKTtcblxuICAgICAgICAvLyBWYWxpZGF0ZSB0YXNrIGRlcGVuZGVuY2llc1xuICAgICAgICB0aGlzLnZhbGlkYXRlVGFza0RlcGVuZGVuY2llcyh0YXNrcyk7XG5cbiAgICAgICAgaWYgKHRoaXMuZXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICBgUGxhbiB2YWxpZGF0aW9uIGZhaWxlZDpcXG4ke3RoaXMuZXJyb3JzLm1hcCgoZSkgPT4gYCAgLSAke2UubWVzc2FnZX1gKS5qb2luKFwiXFxuXCIpfWAsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG1ldGFkYXRhLFxuICAgICAgICAgICAgdGFza3MsXG4gICAgICAgICAgICBxdWFsaXR5R2F0ZXMsXG4gICAgICAgICAgICBlcnJvcnM6IHRoaXMuZXJyb3JzLFxuICAgICAgICAgICAgd2FybmluZ3M6IHRoaXMud2FybmluZ3MsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHZhbGlkYXRpb24gZXJyb3JzIGZyb20gdGhlIGxhc3QgcGFyc2VcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0RXJyb3JzKCk6IFZhbGlkYXRpb25FcnJvcltdIHtcbiAgICAgICAgcmV0dXJuIFsuLi50aGlzLmVycm9yc107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHZhbGlkYXRpb24gd2FybmluZ3MgZnJvbSB0aGUgbGFzdCBwYXJzZVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRXYXJuaW5ncygpOiBzdHJpbmdbXSB7XG4gICAgICAgIHJldHVybiBbLi4udGhpcy53YXJuaW5nc107XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2YWxpZGF0ZVRvcExldmVsU3RydWN0dXJlKHBsYW46IGFueSk6IHZvaWQge1xuICAgICAgICBpZiAoIXBsYW4gfHwgdHlwZW9mIHBsYW4gIT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIHRoaXMuZXJyb3JzLnB1c2goe1xuICAgICAgICAgICAgICAgIHR5cGU6IFZhbGlkYXRpb25FcnJvclR5cGUuVFlQRSxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBcIlBsYW4gbXVzdCBiZSBhbiBvYmplY3RcIixcbiAgICAgICAgICAgICAgICB2YWx1ZTogcGxhbixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFwbGFuLm1ldGFkYXRhKSB7XG4gICAgICAgICAgICB0aGlzLmVycm9ycy5wdXNoKHtcbiAgICAgICAgICAgICAgICB0eXBlOiBWYWxpZGF0aW9uRXJyb3JUeXBlLlJFUVVJUkVELFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwibWV0YWRhdGEgc2VjdGlvbiBpcyByZXF1aXJlZFwiLFxuICAgICAgICAgICAgICAgIHBhdGg6IFwibWV0YWRhdGFcIixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBsYW4udGFza3MgJiYgIUFycmF5LmlzQXJyYXkocGxhbi50YXNrcykpIHtcbiAgICAgICAgICAgIHRoaXMuZXJyb3JzLnB1c2goe1xuICAgICAgICAgICAgICAgIHR5cGU6IFZhbGlkYXRpb25FcnJvclR5cGUuVFlQRSxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBcInRhc2tzIG11c3QgYmUgYW4gYXJyYXlcIixcbiAgICAgICAgICAgICAgICBwYXRoOiBcInRhc2tzXCIsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHBsYW4udGFza3MsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwbGFuLnF1YWxpdHlHYXRlcyAmJiAhQXJyYXkuaXNBcnJheShwbGFuLnF1YWxpdHlHYXRlcykpIHtcbiAgICAgICAgICAgIHRoaXMuZXJyb3JzLnB1c2goe1xuICAgICAgICAgICAgICAgIHR5cGU6IFZhbGlkYXRpb25FcnJvclR5cGUuVFlQRSxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBcInF1YWxpdHlHYXRlcyBtdXN0IGJlIGFuIGFycmF5XCIsXG4gICAgICAgICAgICAgICAgcGF0aDogXCJxdWFsaXR5R2F0ZXNcIixcbiAgICAgICAgICAgICAgICB2YWx1ZTogcGxhbi5xdWFsaXR5R2F0ZXMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgcGFyc2VNZXRhZGF0YShtZXRhZGF0YTogYW55KTogUGxhbk1ldGFkYXRhIHtcbiAgICAgICAgaWYgKCFtZXRhZGF0YSB8fCB0eXBlb2YgbWV0YWRhdGEgIT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIHRoaXMuZXJyb3JzLnB1c2goe1xuICAgICAgICAgICAgICAgIHR5cGU6IFZhbGlkYXRpb25FcnJvclR5cGUuUkVRVUlSRUQsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogXCJtZXRhZGF0YSBpcyByZXF1aXJlZCBhbmQgbXVzdCBiZSBhbiBvYmplY3RcIixcbiAgICAgICAgICAgICAgICBwYXRoOiBcIm1ldGFkYXRhXCIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgbWV0YWRhdGFcIik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZXF1aXJlZCBmaWVsZHNcbiAgICAgICAgaWYgKCFtZXRhZGF0YS5pZCB8fCB0eXBlb2YgbWV0YWRhdGEuaWQgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHRoaXMuZXJyb3JzLnB1c2goe1xuICAgICAgICAgICAgICAgIHR5cGU6IFZhbGlkYXRpb25FcnJvclR5cGUuUkVRVUlSRUQsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogXCJtZXRhZGF0YS5pZCBpcyByZXF1aXJlZCBhbmQgbXVzdCBiZSBhIHN0cmluZ1wiLFxuICAgICAgICAgICAgICAgIHBhdGg6IFwibWV0YWRhdGEuaWRcIixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFtZXRhZGF0YS5uYW1lIHx8IHR5cGVvZiBtZXRhZGF0YS5uYW1lICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICB0aGlzLmVycm9ycy5wdXNoKHtcbiAgICAgICAgICAgICAgICB0eXBlOiBWYWxpZGF0aW9uRXJyb3JUeXBlLlJFUVVJUkVELFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwibWV0YWRhdGEubmFtZSBpcyByZXF1aXJlZCBhbmQgbXVzdCBiZSBhIHN0cmluZ1wiLFxuICAgICAgICAgICAgICAgIHBhdGg6IFwibWV0YWRhdGEubmFtZVwiLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIW1ldGFkYXRhLnZlcnNpb24gfHwgdHlwZW9mIG1ldGFkYXRhLnZlcnNpb24gIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHRoaXMuZXJyb3JzLnB1c2goe1xuICAgICAgICAgICAgICAgIHR5cGU6IFZhbGlkYXRpb25FcnJvclR5cGUuUkVRVUlSRUQsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogXCJtZXRhZGF0YS52ZXJzaW9uIGlzIHJlcXVpcmVkIGFuZCBtdXN0IGJlIGEgc3RyaW5nXCIsXG4gICAgICAgICAgICAgICAgcGF0aDogXCJtZXRhZGF0YS52ZXJzaW9uXCIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFZhbGlkYXRlIHZlcnNpb24gZm9ybWF0IChzZW12ZXItbGlrZSlcbiAgICAgICAgaWYgKG1ldGFkYXRhLnZlcnNpb24gJiYgIS9eXFxkK1xcLlxcZCtcXC5cXGQrLy50ZXN0KG1ldGFkYXRhLnZlcnNpb24pKSB7XG4gICAgICAgICAgICB0aGlzLndhcm5pbmdzLnB1c2goXG4gICAgICAgICAgICAgICAgYG1ldGFkYXRhLnZlcnNpb24gXCIke21ldGFkYXRhLnZlcnNpb259XCIgc2hvdWxkIGZvbGxvdyBzZW1hbnRpYyB2ZXJzaW9uaW5nICh4LnkueilgLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpZDogbWV0YWRhdGEuaWQgfHwgXCJcIixcbiAgICAgICAgICAgIG5hbWU6IG1ldGFkYXRhLm5hbWUgfHwgXCJcIixcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBtZXRhZGF0YS5kZXNjcmlwdGlvbixcbiAgICAgICAgICAgIHZlcnNpb246IG1ldGFkYXRhLnZlcnNpb24gfHwgXCIxLjAuMFwiLFxuICAgICAgICAgICAgYXV0aG9yOiBtZXRhZGF0YS5hdXRob3IsXG4gICAgICAgICAgICBjcmVhdGVkOiBtZXRhZGF0YS5jcmVhdGVkLFxuICAgICAgICAgICAgbW9kaWZpZWQ6IG1ldGFkYXRhLm1vZGlmaWVkLFxuICAgICAgICAgICAgdGFnczogQXJyYXkuaXNBcnJheShtZXRhZGF0YS50YWdzKSA/IG1ldGFkYXRhLnRhZ3MgOiBbXSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHBhcnNlVGFza3ModGFza3M6IGFueVtdKTogRXhlY3V0YWJsZVRhc2tbXSB7XG4gICAgICAgIGNvbnN0IHBhcnNlZFRhc2tzOiBFeGVjdXRhYmxlVGFza1tdID0gW107XG4gICAgICAgIGNvbnN0IHRhc2tJZHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRhc2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCB0YXNrRGF0YSA9IHRhc2tzW2ldO1xuXG4gICAgICAgICAgICBpZiAoIXRhc2tEYXRhIHx8IHR5cGVvZiB0YXNrRGF0YSAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgICAgIHRoaXMuZXJyb3JzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBWYWxpZGF0aW9uRXJyb3JUeXBlLlRZUEUsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBUYXNrIGF0IGluZGV4ICR7aX0gbXVzdCBiZSBhbiBvYmplY3RgLFxuICAgICAgICAgICAgICAgICAgICBwYXRoOiBgdGFza3NbJHtpfV1gLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdGFza0RhdGEsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHRhc2sgPSB0aGlzLnBhcnNlVGFzayh0YXNrRGF0YSwgaSk7XG5cbiAgICAgICAgICAgIGlmICh0YXNrKSB7XG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIGR1cGxpY2F0ZSBJRHNcbiAgICAgICAgICAgICAgICBpZiAodGFza0lkcy5oYXModGFzay5pZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lcnJvcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBWYWxpZGF0aW9uRXJyb3JUeXBlLkRVUExJQ0FURV9JRCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBEdXBsaWNhdGUgdGFzayBJRDogJHt0YXNrLmlkfWAsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiBgdGFza3NbJHtpfV0uaWRgLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHRhc2suaWQsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRhc2tJZHMuYWRkKHRhc2suaWQpO1xuICAgICAgICAgICAgICAgICAgICBwYXJzZWRUYXNrcy5wdXNoKHRhc2spO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXJzZWRUYXNrcztcbiAgICB9XG5cbiAgICBwcml2YXRlIHBhcnNlVGFzayh0YXNrRGF0YTogYW55LCBpbmRleDogbnVtYmVyKTogRXhlY3V0YWJsZVRhc2sgfCBudWxsIHtcbiAgICAgICAgLy8gUmVxdWlyZWQgZmllbGRzXG4gICAgICAgIGlmICghdGFza0RhdGEuaWQgfHwgdHlwZW9mIHRhc2tEYXRhLmlkICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICB0aGlzLmVycm9ycy5wdXNoKHtcbiAgICAgICAgICAgICAgICB0eXBlOiBWYWxpZGF0aW9uRXJyb3JUeXBlLlJFUVVJUkVELFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBUYXNrIGF0IGluZGV4ICR7aW5kZXh9IHJlcXVpcmVzIGEgdmFsaWQgaWRgLFxuICAgICAgICAgICAgICAgIHBhdGg6IGB0YXNrc1ske2luZGV4fV0uaWRgLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGFza0RhdGEubmFtZSB8fCB0eXBlb2YgdGFza0RhdGEubmFtZSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgdGhpcy5lcnJvcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgdHlwZTogVmFsaWRhdGlvbkVycm9yVHlwZS5SRVFVSVJFRCxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBgVGFzayBcIiR7dGFza0RhdGEuaWR9XCIgcmVxdWlyZXMgYSB2YWxpZCBuYW1lYCxcbiAgICAgICAgICAgICAgICBwYXRoOiBgdGFza3NbJHtpbmRleH1dLm5hbWVgLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFnZW50IHRhc2tzIGRvbid0IHJlcXVpcmUgY29tbWFuZHNcbiAgICAgICAgaWYgKCF0aGlzLmlzQWdlbnRUYXNrVHlwZSh0YXNrRGF0YS50eXBlKSkge1xuICAgICAgICAgICAgaWYgKCF0YXNrRGF0YS5jb21tYW5kIHx8IHR5cGVvZiB0YXNrRGF0YS5jb21tYW5kICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lcnJvcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFZhbGlkYXRpb25FcnJvclR5cGUuUkVRVUlSRUQsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBUYXNrIFwiJHt0YXNrRGF0YS5pZH1cIiByZXF1aXJlcyBhIHZhbGlkIGNvbW1hbmRgLFxuICAgICAgICAgICAgICAgICAgICBwYXRoOiBgdGFza3NbJHtpbmRleH1dLmNvbW1hbmRgLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gUGFyc2UgdGFzayB0eXBlXG4gICAgICAgIGxldCB0YXNrVHlwZTogVGFza1R5cGUgPSBUYXNrVHlwZS5TSEVMTDtcbiAgICAgICAgaWYgKHRhc2tEYXRhLnR5cGUpIHtcbiAgICAgICAgICAgIGlmICghT2JqZWN0LnZhbHVlcyhUYXNrVHlwZSkuaW5jbHVkZXModGFza0RhdGEudHlwZSkpIHtcbiAgICAgICAgICAgICAgICAvLyBDaGVjayBpZiBpdCdzIGFuIGFnZW50IHRhc2sgdHlwZVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzQWdlbnRUYXNrVHlwZSh0YXNrRGF0YS50eXBlKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5wYXJzZUFnZW50VGFzayh0YXNrRGF0YSwgaW5kZXgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMuZXJyb3JzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBWYWxpZGF0aW9uRXJyb3JUeXBlLlRZUEUsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBJbnZhbGlkIHRhc2sgdHlwZSBcIiR7dGFza0RhdGEudHlwZX1cIiBmb3IgdGFzayBcIiR7dGFza0RhdGEuaWR9XCJgLFxuICAgICAgICAgICAgICAgICAgICBwYXRoOiBgdGFza3NbJHtpbmRleH1dLnR5cGVgLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdGFza0RhdGEudHlwZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRhc2tUeXBlID0gdGFza0RhdGEudHlwZSBhcyBUYXNrVHlwZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFZhbGlkYXRlIHRpbWVvdXRcbiAgICAgICAgaWYgKHRhc2tEYXRhLnRpbWVvdXQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB0YXNrRGF0YS50aW1lb3V0ICE9PSBcIm51bWJlclwiIHx8IHRhc2tEYXRhLnRpbWVvdXQgPD0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZXJyb3JzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBWYWxpZGF0aW9uRXJyb3JUeXBlLlJBTkdFLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBgVGFzayBcIiR7dGFza0RhdGEuaWR9XCIgdGltZW91dCBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyYCxcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogYHRhc2tzWyR7aW5kZXh9XS50aW1lb3V0YCxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHRhc2tEYXRhLnRpbWVvdXQsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBWYWxpZGF0ZSByZXRyeSBjb25maWd1cmF0aW9uXG4gICAgICAgIGlmICh0YXNrRGF0YS5yZXRyeSkge1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICF0YXNrRGF0YS5yZXRyeS5tYXhBdHRlbXB0cyB8fFxuICAgICAgICAgICAgICAgIHR5cGVvZiB0YXNrRGF0YS5yZXRyeS5tYXhBdHRlbXB0cyAhPT0gXCJudW1iZXJcIiB8fFxuICAgICAgICAgICAgICAgIHRhc2tEYXRhLnJldHJ5Lm1heEF0dGVtcHRzIDwgMVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lcnJvcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFZhbGlkYXRpb25FcnJvclR5cGUuUkFOR0UsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBUYXNrIFwiJHt0YXNrRGF0YS5pZH1cIiByZXRyeS5tYXhBdHRlbXB0cyBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyYCxcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogYHRhc2tzWyR7aW5kZXh9XS5yZXRyeS5tYXhBdHRlbXB0c2AsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiB0YXNrRGF0YS5yZXRyeT8ubWF4QXR0ZW1wdHMsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAhdGFza0RhdGEucmV0cnkuZGVsYXkgfHxcbiAgICAgICAgICAgICAgICB0eXBlb2YgdGFza0RhdGEucmV0cnkuZGVsYXkgIT09IFwibnVtYmVyXCIgfHxcbiAgICAgICAgICAgICAgICB0YXNrRGF0YS5yZXRyeS5kZWxheSA8IDBcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHRoaXMuZXJyb3JzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBWYWxpZGF0aW9uRXJyb3JUeXBlLlJBTkdFLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBgVGFzayBcIiR7dGFza0RhdGEuaWR9XCIgcmV0cnkuZGVsYXkgbXVzdCBiZSBhIG5vbi1uZWdhdGl2ZSBudW1iZXJgLFxuICAgICAgICAgICAgICAgICAgICBwYXRoOiBgdGFza3NbJHtpbmRleH1dLnJldHJ5LmRlbGF5YCxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHRhc2tEYXRhLnJldHJ5Py5kZWxheSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpZDogdGFza0RhdGEuaWQsXG4gICAgICAgICAgICBuYW1lOiB0YXNrRGF0YS5uYW1lLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IHRhc2tEYXRhLmRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgdHlwZTogdGFza1R5cGUsXG4gICAgICAgICAgICBjb21tYW5kOiB0YXNrRGF0YS5jb21tYW5kLCAvLyBXaWxsIGJlIHVuZGVmaW5lZCBmb3IgYWdlbnQgdGFza3NcbiAgICAgICAgICAgIHdvcmtpbmdEaXJlY3Rvcnk6IHRhc2tEYXRhLndvcmtpbmdEaXJlY3RvcnksXG4gICAgICAgICAgICBlbnZpcm9ubWVudDogdGFza0RhdGEuZW52aXJvbm1lbnQgfHwge30sXG4gICAgICAgICAgICBkZXBlbmRzT246IEFycmF5LmlzQXJyYXkodGFza0RhdGEuZGVwZW5kc09uKVxuICAgICAgICAgICAgICAgID8gdGFza0RhdGEuZGVwZW5kc09uXG4gICAgICAgICAgICAgICAgOiBbXSxcbiAgICAgICAgICAgIHRpbWVvdXQ6IHRhc2tEYXRhLnRpbWVvdXQsXG4gICAgICAgICAgICByZXRyeTogdGFza0RhdGEucmV0cnksXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBwYXJzZVF1YWxpdHlHYXRlcyhnYXRlczogYW55W10pOiBRdWFsaXR5R2F0ZUNvbmZpZ1tdIHtcbiAgICAgICAgY29uc3QgcGFyc2VkR2F0ZXM6IFF1YWxpdHlHYXRlQ29uZmlnW10gPSBbXTtcbiAgICAgICAgY29uc3QgZ2F0ZUlkcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZ2F0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGdhdGVEYXRhID0gZ2F0ZXNbaV07XG5cbiAgICAgICAgICAgIGlmICghZ2F0ZURhdGEgfHwgdHlwZW9mIGdhdGVEYXRhICE9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lcnJvcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFZhbGlkYXRpb25FcnJvclR5cGUuVFlQRSxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogYFF1YWxpdHkgZ2F0ZSBhdCBpbmRleCAke2l9IG11c3QgYmUgYW4gb2JqZWN0YCxcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogYHF1YWxpdHlHYXRlc1ske2l9XWAsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBnYXRlRGF0YSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgZ2F0ZSA9IHRoaXMucGFyc2VRdWFsaXR5R2F0ZShnYXRlRGF0YSwgaSk7XG5cbiAgICAgICAgICAgIGlmIChnYXRlKSB7XG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIGR1cGxpY2F0ZSBJRHNcbiAgICAgICAgICAgICAgICBpZiAoZ2F0ZUlkcy5oYXMoZ2F0ZS5pZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lcnJvcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBWYWxpZGF0aW9uRXJyb3JUeXBlLkRVUExJQ0FURV9JRCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBEdXBsaWNhdGUgcXVhbGl0eSBnYXRlIElEOiAke2dhdGUuaWR9YCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IGBxdWFsaXR5R2F0ZXNbJHtpfV0uaWRgLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGdhdGUuaWQsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGdhdGVJZHMuYWRkKGdhdGUuaWQpO1xuICAgICAgICAgICAgICAgICAgICBwYXJzZWRHYXRlcy5wdXNoKGdhdGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXJzZWRHYXRlcztcbiAgICB9XG5cbiAgICBwcml2YXRlIHBhcnNlUXVhbGl0eUdhdGUoXG4gICAgICAgIGdhdGVEYXRhOiBhbnksXG4gICAgICAgIGluZGV4OiBudW1iZXIsXG4gICAgKTogUXVhbGl0eUdhdGVDb25maWcgfCBudWxsIHtcbiAgICAgICAgLy8gUmVxdWlyZWQgZmllbGRzXG4gICAgICAgIGlmICghZ2F0ZURhdGEuaWQgfHwgdHlwZW9mIGdhdGVEYXRhLmlkICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICB0aGlzLmVycm9ycy5wdXNoKHtcbiAgICAgICAgICAgICAgICB0eXBlOiBWYWxpZGF0aW9uRXJyb3JUeXBlLlJFUVVJUkVELFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBRdWFsaXR5IGdhdGUgYXQgaW5kZXggJHtpbmRleH0gcmVxdWlyZXMgYSB2YWxpZCBpZGAsXG4gICAgICAgICAgICAgICAgcGF0aDogYHF1YWxpdHlHYXRlc1ske2luZGV4fV0uaWRgLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghZ2F0ZURhdGEubmFtZSB8fCB0eXBlb2YgZ2F0ZURhdGEubmFtZSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgdGhpcy5lcnJvcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgdHlwZTogVmFsaWRhdGlvbkVycm9yVHlwZS5SRVFVSVJFRCxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBgUXVhbGl0eSBnYXRlIFwiJHtnYXRlRGF0YS5pZH1cIiByZXF1aXJlcyBhIHZhbGlkIG5hbWVgLFxuICAgICAgICAgICAgICAgIHBhdGg6IGBxdWFsaXR5R2F0ZXNbJHtpbmRleH1dLm5hbWVgLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFBhcnNlIGdhdGUgdHlwZVxuICAgICAgICBsZXQgZ2F0ZVR5cGU6IFF1YWxpdHlHYXRlVHlwZSA9IFF1YWxpdHlHYXRlVHlwZS5MSU5UO1xuICAgICAgICBpZiAoZ2F0ZURhdGEudHlwZSkge1xuICAgICAgICAgICAgaWYgKCFPYmplY3QudmFsdWVzKFF1YWxpdHlHYXRlVHlwZSkuaW5jbHVkZXMoZ2F0ZURhdGEudHlwZSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVycm9ycy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogVmFsaWRhdGlvbkVycm9yVHlwZS5UWVBFLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBgSW52YWxpZCBxdWFsaXR5IGdhdGUgdHlwZSBcIiR7Z2F0ZURhdGEudHlwZX1cIiBmb3IgZ2F0ZSBcIiR7Z2F0ZURhdGEuaWR9XCJgLFxuICAgICAgICAgICAgICAgICAgICBwYXRoOiBgcXVhbGl0eUdhdGVzWyR7aW5kZXh9XS50eXBlYCxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGdhdGVEYXRhLnR5cGUsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBnYXRlVHlwZSA9IGdhdGVEYXRhLnR5cGUgYXMgUXVhbGl0eUdhdGVUeXBlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGlkOiBnYXRlRGF0YS5pZCxcbiAgICAgICAgICAgIG5hbWU6IGdhdGVEYXRhLm5hbWUsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogZ2F0ZURhdGEuZGVzY3JpcHRpb24sXG4gICAgICAgICAgICB0eXBlOiBnYXRlVHlwZSxcbiAgICAgICAgICAgIHJlcXVpcmVkOiBnYXRlRGF0YS5yZXF1aXJlZCAhPT0gZmFsc2UsIC8vIERlZmF1bHQgdG8gdHJ1ZVxuICAgICAgICAgICAgY29uZmlnOiBnYXRlRGF0YS5jb25maWcgfHwge30sXG4gICAgICAgICAgICB0YXNrSWQ6IGdhdGVEYXRhLnRhc2tJZCxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHZhbGlkYXRlVGFza0RlcGVuZGVuY2llcyh0YXNrczogRXhlY3V0YWJsZVRhc2tbXSk6IHZvaWQge1xuICAgICAgICBjb25zdCB0YXNrSWRzID0gbmV3IFNldCh0YXNrcy5tYXAoKHQpID0+IHQuaWQpKTtcblxuICAgICAgICBmb3IgKGNvbnN0IHRhc2sgb2YgdGFza3MpIHtcbiAgICAgICAgICAgIGlmICh0YXNrLmRlcGVuZHNPbikge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgZGVwSWQgb2YgdGFzay5kZXBlbmRzT24pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0YXNrSWRzLmhhcyhkZXBJZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZXJyb3JzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFZhbGlkYXRpb25FcnJvclR5cGUuVU5LTk9XTl9ERVBFTkRFTkNZLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBUYXNrIFwiJHt0YXNrLmlkfVwiIGRlcGVuZHMgb24gdW5rbm93biB0YXNrIFwiJHtkZXBJZH1cImAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogYHRhc2tzLiR7dGFzay5pZH0uZGVwZW5kc09uYCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogZGVwSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENoZWNrIGZvciBjaXJjdWxhciBkZXBlbmRlbmNpZXNcbiAgICAgICAgdGhpcy5kZXRlY3RDaXJjdWxhckRlcGVuZGVuY2llcyh0YXNrcyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkZXRlY3RDaXJjdWxhckRlcGVuZGVuY2llcyh0YXNrczogRXhlY3V0YWJsZVRhc2tbXSk6IHZvaWQge1xuICAgICAgICBjb25zdCB2aXNpdGVkID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgICAgIGNvbnN0IHJlY3Vyc2lvblN0YWNrID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgICAgIGNvbnN0IHRhc2tNYXAgPSBuZXcgTWFwKHRhc2tzLm1hcCgodCkgPT4gW3QuaWQsIHRdKSk7XG5cbiAgICAgICAgY29uc3QgdmlzaXQgPSAodGFza0lkOiBzdHJpbmcpOiBib29sZWFuID0+IHtcbiAgICAgICAgICAgIGlmIChyZWN1cnNpb25TdGFjay5oYXModGFza0lkKSkge1xuICAgICAgICAgICAgICAgIC8vIEZvdW5kIGEgY3ljbGVcbiAgICAgICAgICAgICAgICBjb25zdCBjeWNsZSA9IEFycmF5LmZyb20ocmVjdXJzaW9uU3RhY2spXG4gICAgICAgICAgICAgICAgICAgIC5jb25jYXQodGFza0lkKVxuICAgICAgICAgICAgICAgICAgICAuam9pbihcIiAtPiBcIik7XG4gICAgICAgICAgICAgICAgdGhpcy5lcnJvcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFZhbGlkYXRpb25FcnJvclR5cGUuQ0lSQ1VMQVJfREVQRU5ERU5DWSxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogYENpcmN1bGFyIGRlcGVuZGVuY3kgZGV0ZWN0ZWQ6ICR7Y3ljbGV9YCxcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogXCJ0YXNrc1wiLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodmlzaXRlZC5oYXModGFza0lkKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmlzaXRlZC5hZGQodGFza0lkKTtcbiAgICAgICAgICAgIHJlY3Vyc2lvblN0YWNrLmFkZCh0YXNrSWQpO1xuXG4gICAgICAgICAgICBjb25zdCB0YXNrID0gdGFza01hcC5nZXQodGFza0lkKTtcbiAgICAgICAgICAgIGlmICh0YXNrPy5kZXBlbmRzT24pIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGRlcElkIG9mIHRhc2suZGVwZW5kc09uKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2aXNpdChkZXBJZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZWN1cnNpb25TdGFjay5kZWxldGUodGFza0lkKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfTtcblxuICAgICAgICBmb3IgKGNvbnN0IHRhc2sgb2YgdGFza3MpIHtcbiAgICAgICAgICAgIGlmICghdmlzaXRlZC5oYXModGFzay5pZCkpIHtcbiAgICAgICAgICAgICAgICB2aXNpdCh0YXNrLmlkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGEgdGFzayB0eXBlIGlzIGFuIGFnZW50IHRhc2sgdHlwZVxuICAgICAqL1xuICAgIHByaXZhdGUgaXNBZ2VudFRhc2tUeXBlKHR5cGU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gT2JqZWN0LnZhbHVlcyhBZ2VudFRhc2tUeXBlKS5pbmNsdWRlcyh0eXBlIGFzIEFnZW50VGFza1R5cGUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFBhcnNlIGFuZCB2YWxpZGF0ZSBhbiBhZ2VudCB0YXNrXG4gICAgICovXG4gICAgcHJpdmF0ZSBwYXJzZUFnZW50VGFzayh0YXNrRGF0YTogYW55LCBpbmRleDogbnVtYmVyKTogQWdlbnRUYXNrIHwgbnVsbCB7XG4gICAgICAgIC8vIFZhbGlkYXRlIGFnZW50IHR5cGVcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgIXRhc2tEYXRhLnR5cGUgfHxcbiAgICAgICAgICAgICFPYmplY3QudmFsdWVzKEFnZW50VGFza1R5cGUpLmluY2x1ZGVzKHRhc2tEYXRhLnR5cGUpXG4gICAgICAgICkge1xuICAgICAgICAgICAgdGhpcy5lcnJvcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgdHlwZTogVmFsaWRhdGlvbkVycm9yVHlwZS5UWVBFLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBJbnZhbGlkIGFnZW50IHR5cGUgXCIke3Rhc2tEYXRhLnR5cGV9XCIgZm9yIHRhc2sgXCIke3Rhc2tEYXRhLmlkfVwiYCxcbiAgICAgICAgICAgICAgICBwYXRoOiBgdGFza3NbJHtpbmRleH1dLnR5cGVgLFxuICAgICAgICAgICAgICAgIHZhbHVlOiB0YXNrRGF0YS50eXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFZhbGlkYXRlIGFnZW50IGlucHV0XG4gICAgICAgIGlmICghdGFza0RhdGEuaW5wdXQgfHwgdHlwZW9mIHRhc2tEYXRhLmlucHV0ICE9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICB0aGlzLmVycm9ycy5wdXNoKHtcbiAgICAgICAgICAgICAgICB0eXBlOiBWYWxpZGF0aW9uRXJyb3JUeXBlLlJFUVVJUkVELFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBBZ2VudCB0YXNrIFwiJHt0YXNrRGF0YS5pZH1cIiByZXF1aXJlcyB2YWxpZCBpbnB1dGAsXG4gICAgICAgICAgICAgICAgcGF0aDogYHRhc2tzWyR7aW5kZXh9XS5pbnB1dGAsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVmFsaWRhdGUgZXhlY3V0aW9uIHN0cmF0ZWd5XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgICF0YXNrRGF0YS5zdHJhdGVneSB8fFxuICAgICAgICAgICAgIU9iamVjdC52YWx1ZXMoRXhlY3V0aW9uU3RyYXRlZ3kpLmluY2x1ZGVzKHRhc2tEYXRhLnN0cmF0ZWd5KVxuICAgICAgICApIHtcbiAgICAgICAgICAgIHRoaXMuZXJyb3JzLnB1c2goe1xuICAgICAgICAgICAgICAgIHR5cGU6IFZhbGlkYXRpb25FcnJvclR5cGUuUkVRVUlSRUQsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogYEFnZW50IHRhc2sgXCIke3Rhc2tEYXRhLmlkfVwiIHJlcXVpcmVzIHZhbGlkIGV4ZWN1dGlvbiBzdHJhdGVneWAsXG4gICAgICAgICAgICAgICAgcGF0aDogYHRhc2tzWyR7aW5kZXh9XS5zdHJhdGVneWAsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHRhc2tEYXRhLnN0cmF0ZWd5LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFZhbGlkYXRlIGFnZW50IGlucHV0IHN0cnVjdHVyZVxuICAgICAgICBjb25zdCBhZ2VudElucHV0ID0gdGFza0RhdGEuaW5wdXQ7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgICFhZ2VudElucHV0LnR5cGUgfHxcbiAgICAgICAgICAgICFPYmplY3QudmFsdWVzKEFnZW50VGFza1R5cGUpLmluY2x1ZGVzKGFnZW50SW5wdXQudHlwZSlcbiAgICAgICAgKSB7XG4gICAgICAgICAgICB0aGlzLmVycm9ycy5wdXNoKHtcbiAgICAgICAgICAgICAgICB0eXBlOiBWYWxpZGF0aW9uRXJyb3JUeXBlLlJFUVVJUkVELFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBBZ2VudCB0YXNrIFwiJHt0YXNrRGF0YS5pZH1cIiBpbnB1dCByZXF1aXJlcyB2YWxpZCB0eXBlYCxcbiAgICAgICAgICAgICAgICBwYXRoOiBgdGFza3NbJHtpbmRleH1dLmlucHV0LnR5cGVgLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBhZ2VudElucHV0LnR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFhZ2VudElucHV0LmNvbnRleHQgfHwgdHlwZW9mIGFnZW50SW5wdXQuY29udGV4dCAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgdGhpcy5lcnJvcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgdHlwZTogVmFsaWRhdGlvbkVycm9yVHlwZS5SRVFVSVJFRCxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBgQWdlbnQgdGFzayBcIiR7dGFza0RhdGEuaWR9XCIgaW5wdXQgcmVxdWlyZXMgdmFsaWQgY29udGV4dGAsXG4gICAgICAgICAgICAgICAgcGF0aDogYHRhc2tzWyR7aW5kZXh9XS5pbnB1dC5jb250ZXh0YCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBWYWxpZGF0ZSB0aW1lb3V0IGZvciBhZ2VudCB0YXNrc1xuICAgICAgICBpZiAodGFza0RhdGEudGltZW91dCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHRhc2tEYXRhLnRpbWVvdXQgIT09IFwibnVtYmVyXCIgfHwgdGFza0RhdGEudGltZW91dCA8PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lcnJvcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFZhbGlkYXRpb25FcnJvclR5cGUuUkFOR0UsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBBZ2VudCB0YXNrIFwiJHt0YXNrRGF0YS5pZH1cIiB0aW1lb3V0IG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXJgLFxuICAgICAgICAgICAgICAgICAgICBwYXRoOiBgdGFza3NbJHtpbmRleH1dLnRpbWVvdXRgLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdGFza0RhdGEudGltZW91dCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFNldCBkZWZhdWx0IHRpbWVvdXQgZm9yIGFnZW50IHRhc2tzXG4gICAgICAgICAgICB0YXNrRGF0YS50aW1lb3V0ID0gMzAwMDA7IC8vIDMwIHNlY29uZHMgZGVmYXVsdFxuICAgICAgICB9XG5cbiAgICAgICAgLy8gVmFsaWRhdGUgcmV0cnkgY29uZmlndXJhdGlvbiBmb3IgYWdlbnQgdGFza3NcbiAgICAgICAgaWYgKHRhc2tEYXRhLnJldHJ5KSB7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgIXRhc2tEYXRhLnJldHJ5Lm1heEF0dGVtcHRzIHx8XG4gICAgICAgICAgICAgICAgdHlwZW9mIHRhc2tEYXRhLnJldHJ5Lm1heEF0dGVtcHRzICE9PSBcIm51bWJlclwiIHx8XG4gICAgICAgICAgICAgICAgdGFza0RhdGEucmV0cnkubWF4QXR0ZW1wdHMgPCAxXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVycm9ycy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogVmFsaWRhdGlvbkVycm9yVHlwZS5SQU5HRSxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogYEFnZW50IHRhc2sgXCIke3Rhc2tEYXRhLmlkfVwiIHJldHJ5Lm1heEF0dGVtcHRzIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXJgLFxuICAgICAgICAgICAgICAgICAgICBwYXRoOiBgdGFza3NbJHtpbmRleH1dLnJldHJ5Lm1heEF0dGVtcHRzYCxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHRhc2tEYXRhLnJldHJ5Py5tYXhBdHRlbXB0cyxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICF0YXNrRGF0YS5yZXRyeS5kZWxheSB8fFxuICAgICAgICAgICAgICAgIHR5cGVvZiB0YXNrRGF0YS5yZXRyeS5kZWxheSAhPT0gXCJudW1iZXJcIiB8fFxuICAgICAgICAgICAgICAgIHRhc2tEYXRhLnJldHJ5LmRlbGF5IDwgMFxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lcnJvcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFZhbGlkYXRpb25FcnJvclR5cGUuUkFOR0UsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBBZ2VudCB0YXNrIFwiJHt0YXNrRGF0YS5pZH1cIiByZXRyeS5kZWxheSBtdXN0IGJlIGEgbm9uLW5lZ2F0aXZlIG51bWJlcmAsXG4gICAgICAgICAgICAgICAgICAgIHBhdGg6IGB0YXNrc1ske2luZGV4fV0ucmV0cnkuZGVsYXlgLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdGFza0RhdGEucmV0cnk/LmRlbGF5LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGlkOiB0YXNrRGF0YS5pZCxcbiAgICAgICAgICAgIHR5cGU6IHRhc2tEYXRhLnR5cGUgYXMgQWdlbnRUYXNrVHlwZSxcbiAgICAgICAgICAgIG5hbWU6IHRhc2tEYXRhLm5hbWUsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogdGFza0RhdGEuZGVzY3JpcHRpb24sXG4gICAgICAgICAgICBpbnB1dDoge1xuICAgICAgICAgICAgICAgIHR5cGU6IGFnZW50SW5wdXQudHlwZSBhcyBBZ2VudFRhc2tUeXBlLFxuICAgICAgICAgICAgICAgIGNvbnRleHQ6IGFnZW50SW5wdXQuY29udGV4dCB8fCB7fSxcbiAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzOiBhZ2VudElucHV0LnBhcmFtZXRlcnMgfHwge30sXG4gICAgICAgICAgICAgICAgdGltZW91dDogYWdlbnRJbnB1dC50aW1lb3V0LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN0cmF0ZWd5OiB0YXNrRGF0YS5zdHJhdGVneSBhcyBFeGVjdXRpb25TdHJhdGVneSxcbiAgICAgICAgICAgIGRlcGVuZHNPbjogQXJyYXkuaXNBcnJheSh0YXNrRGF0YS5kZXBlbmRzT24pXG4gICAgICAgICAgICAgICAgPyB0YXNrRGF0YS5kZXBlbmRzT25cbiAgICAgICAgICAgICAgICA6IFtdLFxuICAgICAgICAgICAgdGltZW91dDogdGFza0RhdGEudGltZW91dCxcbiAgICAgICAgICAgIHJldHJ5OiB0YXNrRGF0YS5yZXRyeSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBWYWxpZGF0ZSBhZ2VudCB0YXNrIGRlcGVuZGVuY2llc1xuICAgICAqL1xuICAgIHByaXZhdGUgdmFsaWRhdGVBZ2VudFRhc2tEZXBlbmRlbmNpZXModGFza3M6IChUYXNrIHwgQWdlbnRUYXNrKVtdKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHRhc2tJZHMgPSBuZXcgU2V0KHRhc2tzLm1hcCgodCkgPT4gdC5pZCkpO1xuICAgICAgICBjb25zdCBhZ2VudFRhc2tJZHMgPSBuZXcgU2V0KFxuICAgICAgICAgICAgdGFza3MuZmlsdGVyKCh0KSA9PiB0aGlzLmlzQWdlbnRUYXNrKHQpKS5tYXAoKHQpID0+IHQuaWQpLFxuICAgICAgICApO1xuXG4gICAgICAgIGZvciAoY29uc3QgdGFzayBvZiB0YXNrcykge1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNBZ2VudFRhc2sodGFzaykgJiYgdGFzay5kZXBlbmRzT24pIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGRlcElkIG9mIHRhc2suZGVwZW5kc09uKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIGRlcGVuZGVuY3kgZXhpc3RzXG4gICAgICAgICAgICAgICAgICAgIGlmICghdGFza0lkcy5oYXMoZGVwSWQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVycm9ycy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBWYWxpZGF0aW9uRXJyb3JUeXBlLlVOS05PV05fREVQRU5ERU5DWSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBgQWdlbnQgdGFzayBcIiR7dGFzay5pZH1cIiBkZXBlbmRzIG9uIHVua25vd24gdGFzayBcIiR7ZGVwSWR9XCJgLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IGB0YXNrcy4ke3Rhc2suaWR9LmRlcGVuZHNPbmAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGRlcElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyBDaGVjayBmb3IgYWdlbnQgdGFzayBkZXBlbmRlbmNpZXMgb24gc2hlbGwgdGFza3MgKHdhcm5pbmcpXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRlcFRhc2sgPSB0YXNrcy5maW5kKCh0KSA9PiB0LmlkID09PSBkZXBJZCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkZXBUYXNrICYmICF0aGlzLmlzQWdlbnRUYXNrKGRlcFRhc2spKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLndhcm5pbmdzLnB1c2goXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYEFnZW50IHRhc2sgXCIke3Rhc2suaWR9XCIgZGVwZW5kcyBvbiBzaGVsbCB0YXNrIFwiJHtkZXBJZH1cIi4gQ29uc2lkZXIgdXNpbmcgYWdlbnQgdGFza3MgZm9yIGNvbnNpc3RlbmN5LmAsXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2hlY2sgZm9yIGNpcmN1bGFyIGRlcGVuZGVuY2llcyBpbmNsdWRpbmcgYWdlbnQgdGFza3NcbiAgICAgICAgdGhpcy5kZXRlY3RDaXJjdWxhckRlcGVuZGVuY2llcyh0YXNrcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgYSB0YXNrIGlzIGFuIGFnZW50IHRhc2tcbiAgICAgKi9cbiAgICBwcml2YXRlIGlzQWdlbnRUYXNrKHRhc2s6IFRhc2sgfCBBZ2VudFRhc2spOiB0YXNrIGlzIEFnZW50VGFzayB7XG4gICAgICAgIHJldHVybiBcInR5cGVcIiBpbiB0YXNrICYmIFwiaW5wdXRcIiBpbiB0YXNrICYmIFwic3RyYXRlZ3lcIiBpbiB0YXNrO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBhbGwgYWdlbnQgdGFza3MgZnJvbSBhIHBsYW5cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0QWdlbnRUYXNrcyhwbGFuOiBQbGFuKTogQWdlbnRUYXNrW10ge1xuICAgICAgICByZXR1cm4gcGxhbi50YXNrcy5maWx0ZXIoKHRhc2spID0+XG4gICAgICAgICAgICB0aGlzLmlzQWdlbnRUYXNrKHRhc2spLFxuICAgICAgICApIGFzIEFnZW50VGFza1tdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBhbGwgc2hlbGwgdGFza3MgZnJvbSBhIHBsYW5cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0U2hlbGxUYXNrcyhwbGFuOiBQbGFuKTogVGFza1tdIHtcbiAgICAgICAgcmV0dXJuIHBsYW4udGFza3MuZmlsdGVyKCh0YXNrKSA9PiAhdGhpcy5pc0FnZW50VGFzayh0YXNrKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVmFsaWRhdGUgYWdlbnQgdGFzayBjb25maWd1cmF0aW9uXG4gICAgICovXG4gICAgcHVibGljIHZhbGlkYXRlQWdlbnRUYXNrQ29uZmlndXJhdGlvbihwbGFuOiBQbGFuKToge1xuICAgICAgICBpc1ZhbGlkOiBib29sZWFuO1xuICAgICAgICBlcnJvcnM6IFZhbGlkYXRpb25FcnJvcltdO1xuICAgICAgICB3YXJuaW5nczogc3RyaW5nW107XG4gICAgfSB7XG4gICAgICAgIGNvbnN0IGFnZW50VGFza3MgPSB0aGlzLmdldEFnZW50VGFza3MocGxhbik7XG4gICAgICAgIGNvbnN0IGVycm9yczogVmFsaWRhdGlvbkVycm9yW10gPSBbXTtcbiAgICAgICAgY29uc3Qgd2FybmluZ3M6IHN0cmluZ1tdID0gW107XG5cbiAgICAgICAgLy8gQ2hlY2sgaWYgYWdlbnQgY29vcmRpbmF0b3Igd291bGQgYmUgbmVlZGVkXG4gICAgICAgIGlmIChhZ2VudFRhc2tzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHdhcm5pbmdzLnB1c2goXG4gICAgICAgICAgICAgICAgYFBsYW4gY29udGFpbnMgJHthZ2VudFRhc2tzLmxlbmd0aH0gYWdlbnQgdGFzayhzKS4gQWdlbnQgY29vcmRpbmF0b3IgbXVzdCBiZSBjb25maWd1cmVkLmAsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2hlY2sgZm9yIGFnZW50IHRhc2sgdGltZW91dHNcbiAgICAgICAgZm9yIChjb25zdCB0YXNrIG9mIGFnZW50VGFza3MpIHtcbiAgICAgICAgICAgIGlmICghdGFzay50aW1lb3V0IHx8IHRhc2sudGltZW91dCA8IDUwMDApIHtcbiAgICAgICAgICAgICAgICB3YXJuaW5ncy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICBgQWdlbnQgdGFzayBcIiR7dGFzay5pZH1cIiBoYXMgc2hvcnQgb3IgbWlzc2luZyB0aW1lb3V0LiBDb25zaWRlciBzZXR0aW5nIGF0IGxlYXN0IDUgc2Vjb25kcy5gLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDaGVjayBmb3IgYWdlbnQgdGFzayByZXRyeSBjb25maWd1cmF0aW9uXG4gICAgICAgIGZvciAoY29uc3QgdGFzayBvZiBhZ2VudFRhc2tzKSB7XG4gICAgICAgICAgICBpZiAoIXRhc2sucmV0cnkpIHtcbiAgICAgICAgICAgICAgICB3YXJuaW5ncy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICBgQWdlbnQgdGFzayBcIiR7dGFzay5pZH1cIiBoYXMgbm8gcmV0cnkgY29uZmlndXJhdGlvbi4gQ29uc2lkZXIgYWRkaW5nIHJldHJ5IGxvZ2ljIGZvciByZWxpYWJpbGl0eS5gLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaXNWYWxpZDogZXJyb3JzLmxlbmd0aCA9PT0gMCxcbiAgICAgICAgICAgIGVycm9ycyxcbiAgICAgICAgICAgIHdhcm5pbmdzLFxuICAgICAgICB9O1xuICAgIH1cbn1cbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY29tcG9zZXIgPSByZXF1aXJlKCcuL2NvbXBvc2UvY29tcG9zZXIuanMnKTtcbnZhciBEb2N1bWVudCA9IHJlcXVpcmUoJy4vZG9jL0RvY3VtZW50LmpzJyk7XG52YXIgU2NoZW1hID0gcmVxdWlyZSgnLi9zY2hlbWEvU2NoZW1hLmpzJyk7XG52YXIgZXJyb3JzID0gcmVxdWlyZSgnLi9lcnJvcnMuanMnKTtcbnZhciBBbGlhcyA9IHJlcXVpcmUoJy4vbm9kZXMvQWxpYXMuanMnKTtcbnZhciBpZGVudGl0eSA9IHJlcXVpcmUoJy4vbm9kZXMvaWRlbnRpdHkuanMnKTtcbnZhciBQYWlyID0gcmVxdWlyZSgnLi9ub2Rlcy9QYWlyLmpzJyk7XG52YXIgU2NhbGFyID0gcmVxdWlyZSgnLi9ub2Rlcy9TY2FsYXIuanMnKTtcbnZhciBZQU1MTWFwID0gcmVxdWlyZSgnLi9ub2Rlcy9ZQU1MTWFwLmpzJyk7XG52YXIgWUFNTFNlcSA9IHJlcXVpcmUoJy4vbm9kZXMvWUFNTFNlcS5qcycpO1xudmFyIGNzdCA9IHJlcXVpcmUoJy4vcGFyc2UvY3N0LmpzJyk7XG52YXIgbGV4ZXIgPSByZXF1aXJlKCcuL3BhcnNlL2xleGVyLmpzJyk7XG52YXIgbGluZUNvdW50ZXIgPSByZXF1aXJlKCcuL3BhcnNlL2xpbmUtY291bnRlci5qcycpO1xudmFyIHBhcnNlciA9IHJlcXVpcmUoJy4vcGFyc2UvcGFyc2VyLmpzJyk7XG52YXIgcHVibGljQXBpID0gcmVxdWlyZSgnLi9wdWJsaWMtYXBpLmpzJyk7XG52YXIgdmlzaXQgPSByZXF1aXJlKCcuL3Zpc2l0LmpzJyk7XG5cblxuXG5leHBvcnRzLkNvbXBvc2VyID0gY29tcG9zZXIuQ29tcG9zZXI7XG5leHBvcnRzLkRvY3VtZW50ID0gRG9jdW1lbnQuRG9jdW1lbnQ7XG5leHBvcnRzLlNjaGVtYSA9IFNjaGVtYS5TY2hlbWE7XG5leHBvcnRzLllBTUxFcnJvciA9IGVycm9ycy5ZQU1MRXJyb3I7XG5leHBvcnRzLllBTUxQYXJzZUVycm9yID0gZXJyb3JzLllBTUxQYXJzZUVycm9yO1xuZXhwb3J0cy5ZQU1MV2FybmluZyA9IGVycm9ycy5ZQU1MV2FybmluZztcbmV4cG9ydHMuQWxpYXMgPSBBbGlhcy5BbGlhcztcbmV4cG9ydHMuaXNBbGlhcyA9IGlkZW50aXR5LmlzQWxpYXM7XG5leHBvcnRzLmlzQ29sbGVjdGlvbiA9IGlkZW50aXR5LmlzQ29sbGVjdGlvbjtcbmV4cG9ydHMuaXNEb2N1bWVudCA9IGlkZW50aXR5LmlzRG9jdW1lbnQ7XG5leHBvcnRzLmlzTWFwID0gaWRlbnRpdHkuaXNNYXA7XG5leHBvcnRzLmlzTm9kZSA9IGlkZW50aXR5LmlzTm9kZTtcbmV4cG9ydHMuaXNQYWlyID0gaWRlbnRpdHkuaXNQYWlyO1xuZXhwb3J0cy5pc1NjYWxhciA9IGlkZW50aXR5LmlzU2NhbGFyO1xuZXhwb3J0cy5pc1NlcSA9IGlkZW50aXR5LmlzU2VxO1xuZXhwb3J0cy5QYWlyID0gUGFpci5QYWlyO1xuZXhwb3J0cy5TY2FsYXIgPSBTY2FsYXIuU2NhbGFyO1xuZXhwb3J0cy5ZQU1MTWFwID0gWUFNTE1hcC5ZQU1MTWFwO1xuZXhwb3J0cy5ZQU1MU2VxID0gWUFNTFNlcS5ZQU1MU2VxO1xuZXhwb3J0cy5DU1QgPSBjc3Q7XG5leHBvcnRzLkxleGVyID0gbGV4ZXIuTGV4ZXI7XG5leHBvcnRzLkxpbmVDb3VudGVyID0gbGluZUNvdW50ZXIuTGluZUNvdW50ZXI7XG5leHBvcnRzLlBhcnNlciA9IHBhcnNlci5QYXJzZXI7XG5leHBvcnRzLnBhcnNlID0gcHVibGljQXBpLnBhcnNlO1xuZXhwb3J0cy5wYXJzZUFsbERvY3VtZW50cyA9IHB1YmxpY0FwaS5wYXJzZUFsbERvY3VtZW50cztcbmV4cG9ydHMucGFyc2VEb2N1bWVudCA9IHB1YmxpY0FwaS5wYXJzZURvY3VtZW50O1xuZXhwb3J0cy5zdHJpbmdpZnkgPSBwdWJsaWNBcGkuc3RyaW5naWZ5O1xuZXhwb3J0cy52aXNpdCA9IHZpc2l0LnZpc2l0O1xuZXhwb3J0cy52aXNpdEFzeW5jID0gdmlzaXQudmlzaXRBc3luYztcbiIsCiAgICAiLyoqXG4gKiBBZ2VudCBvcmNoZXN0cmF0aW9uIHR5cGVzIGFuZCBpbnRlcmZhY2VzIGZvciB0aGUgQUkgRW5naW5lZXJpbmcgU3lzdGVtLlxuICogRGVmaW5lcyB0aGUgY29yZSBhYnN0cmFjdGlvbnMgZm9yIGFnZW50IGNvb3JkaW5hdGlvbiBhbmQgZXhlY3V0aW9uLlxuICovXG5cbmltcG9ydCB0eXBlIHsgRGVjaXNpb24sIFRhc2sgfSBmcm9tIFwiLi4vY29udGV4dC90eXBlc1wiO1xuXG4vKipcbiAqIFJlcHJlc2VudHMgZGlmZmVyZW50IHR5cGVzIG9mIGFnZW50cyBhdmFpbGFibGUgaW4gdGhlIHN5c3RlbVxuICovXG5leHBvcnQgZW51bSBBZ2VudFR5cGUge1xuICAgIC8vIEFyY2hpdGVjdHVyZSAmIFBsYW5uaW5nXG4gICAgQVJDSElURUNUX0FEVklTT1IgPSBcImFyY2hpdGVjdC1hZHZpc29yXCIsXG4gICAgQkFDS0VORF9BUkNISVRFQ1QgPSBcImJhY2tlbmQtYXJjaGl0ZWN0XCIsXG4gICAgSU5GUkFTVFJVQ1RVUkVfQlVJTERFUiA9IFwiaW5mcmFzdHJ1Y3R1cmUtYnVpbGRlclwiLFxuXG4gICAgLy8gRGV2ZWxvcG1lbnQgJiBDb2RpbmdcbiAgICBGUk9OVEVORF9SRVZJRVdFUiA9IFwiZnJvbnRlbmQtcmV2aWV3ZXJcIixcbiAgICBGVUxMX1NUQUNLX0RFVkVMT1BFUiA9IFwiZnVsbC1zdGFjay1kZXZlbG9wZXJcIixcbiAgICBBUElfQlVJTERFUl9FTkhBTkNFRCA9IFwiYXBpLWJ1aWxkZXItZW5oYW5jZWRcIixcbiAgICBEQVRBQkFTRV9PUFRJTUlaRVIgPSBcImRhdGFiYXNlLW9wdGltaXplclwiLFxuICAgIEpBVkFfUFJPID0gXCJqYXZhLXByb1wiLFxuXG4gICAgLy8gUXVhbGl0eSAmIFRlc3RpbmdcbiAgICBDT0RFX1JFVklFV0VSID0gXCJjb2RlLXJldmlld2VyXCIsXG4gICAgVEVTVF9HRU5FUkFUT1IgPSBcInRlc3QtZ2VuZXJhdG9yXCIsXG4gICAgU0VDVVJJVFlfU0NBTk5FUiA9IFwic2VjdXJpdHktc2Nhbm5lclwiLFxuICAgIFBFUkZPUk1BTkNFX0VOR0lORUVSID0gXCJwZXJmb3JtYW5jZS1lbmdpbmVlclwiLFxuXG4gICAgLy8gRGV2T3BzICYgRGVwbG95bWVudFxuICAgIERFUExPWU1FTlRfRU5HSU5FRVIgPSBcImRlcGxveW1lbnQtZW5naW5lZXJcIixcbiAgICBNT05JVE9SSU5HX0VYUEVSVCA9IFwibW9uaXRvcmluZy1leHBlcnRcIixcbiAgICBDT1NUX09QVElNSVpFUiA9IFwiY29zdC1vcHRpbWl6ZXJcIixcblxuICAgIC8vIEFJICYgTWFjaGluZSBMZWFybmluZ1xuICAgIEFJX0VOR0lORUVSID0gXCJhaS1lbmdpbmVlclwiLFxuICAgIE1MX0VOR0lORUVSID0gXCJtbC1lbmdpbmVlclwiLFxuXG4gICAgLy8gQ29udGVudCAmIFNFT1xuICAgIFNFT19TUEVDSUFMSVNUID0gXCJzZW8tc3BlY2lhbGlzdFwiLFxuICAgIFBST01QVF9PUFRJTUlaRVIgPSBcInByb21wdC1vcHRpbWl6ZXJcIixcblxuICAgIC8vIFBsdWdpbiBEZXZlbG9wbWVudFxuICAgIEFHRU5UX0NSRUFUT1IgPSBcImFnZW50LWNyZWF0b3JcIixcbiAgICBDT01NQU5EX0NSRUFUT1IgPSBcImNvbW1hbmQtY3JlYXRvclwiLFxuICAgIFNLSUxMX0NSRUFUT1IgPSBcInNraWxsLWNyZWF0b3JcIixcbiAgICBUT09MX0NSRUFUT1IgPSBcInRvb2wtY3JlYXRvclwiLFxuICAgIFBMVUdJTl9WQUxJREFUT1IgPSBcInBsdWdpbi12YWxpZGF0b3JcIixcbn1cblxuLyoqXG4gKiBFeGVjdXRpb24gc3RyYXRlZ2llcyBmb3IgYWdlbnQgY29vcmRpbmF0aW9uXG4gKi9cbmV4cG9ydCBlbnVtIEV4ZWN1dGlvblN0cmF0ZWd5IHtcbiAgICBQQVJBTExFTCA9IFwicGFyYWxsZWxcIixcbiAgICBTRVFVRU5USUFMID0gXCJzZXF1ZW50aWFsXCIsXG4gICAgQ09ORElUSU9OQUwgPSBcImNvbmRpdGlvbmFsXCIsXG59XG5cbi8qKlxuICogQ29uZmlkZW5jZSBsZXZlbCBmb3IgYWdlbnQgcmVzdWx0c1xuICovXG5leHBvcnQgZW51bSBDb25maWRlbmNlTGV2ZWwge1xuICAgIExPVyA9IFwibG93XCIsXG4gICAgTUVESVVNID0gXCJtZWRpdW1cIixcbiAgICBISUdIID0gXCJoaWdoXCIsXG4gICAgVkVSWV9ISUdIID0gXCJ2ZXJ5X2hpZ2hcIixcbn1cblxuLyoqXG4gKiBCYXNlIGludGVyZmFjZSBmb3IgYWxsIGFnZW50IGlucHV0c1xuICovXG5leHBvcnQgaW50ZXJmYWNlIEFnZW50SW5wdXQge1xuICAgIHR5cGU6IEFnZW50VHlwZTtcbiAgICBjb250ZXh0OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICBwYXJhbWV0ZXJzPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgdGltZW91dD86IG51bWJlcjtcbn1cblxuLyoqXG4gKiBCYXNlIGludGVyZmFjZSBmb3IgYWxsIGFnZW50IG91dHB1dHNcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBZ2VudE91dHB1dCB7XG4gICAgdHlwZTogQWdlbnRUeXBlO1xuICAgIHN1Y2Nlc3M6IGJvb2xlYW47XG4gICAgcmVzdWx0OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICBjb25maWRlbmNlOiBDb25maWRlbmNlTGV2ZWw7XG4gICAgcmVhc29uaW5nPzogc3RyaW5nO1xuICAgIGV4ZWN1dGlvblRpbWU6IG51bWJlcjtcbiAgICBlcnJvcj86IHN0cmluZztcbn1cblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgc2luZ2xlIGFnZW50IHRhc2sgaW4gYW4gZXhlY3V0aW9uIHBsYW5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBZ2VudFRhc2sge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgdHlwZTogQWdlbnRUeXBlO1xuICAgIG5hbWU6IHN0cmluZztcbiAgICBkZXNjcmlwdGlvbjogc3RyaW5nO1xuICAgIGlucHV0OiBBZ2VudElucHV0O1xuICAgIHN0cmF0ZWd5OiBFeGVjdXRpb25TdHJhdGVneTtcbiAgICAvKiogT3B0aW9uYWwgY29tbWFuZCBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIFRhc2sgaW50ZXJmYWNlICovXG4gICAgY29tbWFuZD86IHN0cmluZztcbiAgICBkZXBlbmRzT24/OiBzdHJpbmdbXTtcbiAgICB0aW1lb3V0PzogbnVtYmVyO1xuICAgIHJldHJ5Pzoge1xuICAgICAgICBtYXhBdHRlbXB0czogbnVtYmVyO1xuICAgICAgICBkZWxheTogbnVtYmVyO1xuICAgICAgICBiYWNrb2ZmTXVsdGlwbGllcjogbnVtYmVyO1xuICAgIH07XG59XG5cbi8qKlxuICogUmVzdWx0IG9mIGV4ZWN1dGluZyBhbiBhZ2VudCB0YXNrXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQWdlbnRUYXNrUmVzdWx0IHtcbiAgICBpZDogc3RyaW5nO1xuICAgIHR5cGU6IEFnZW50VHlwZTtcbiAgICBzdGF0dXM6IEFnZW50VGFza1N0YXR1cztcbiAgICBvdXRwdXQ/OiBBZ2VudE91dHB1dDtcbiAgICBleGVjdXRpb25UaW1lOiBudW1iZXI7XG4gICAgc3RhcnRUaW1lOiBEYXRlO1xuICAgIGVuZFRpbWU6IERhdGU7XG4gICAgZXJyb3I/OiBzdHJpbmc7XG59XG5cbi8qKlxuICogU3RhdHVzIG9mIGFuIGFnZW50IHRhc2tcbiAqL1xuZXhwb3J0IGVudW0gQWdlbnRUYXNrU3RhdHVzIHtcbiAgICBQRU5ESU5HID0gXCJwZW5kaW5nXCIsXG4gICAgUlVOTklORyA9IFwicnVubmluZ1wiLFxuICAgIENPTVBMRVRFRCA9IFwiY29tcGxldGVkXCIsXG4gICAgRkFJTEVEID0gXCJmYWlsZWRcIixcbiAgICBUSU1FT1VUID0gXCJ0aW1lb3V0XCIsXG4gICAgU0tJUFBFRCA9IFwic2tpcHBlZFwiLFxufVxuXG4vKipcbiAqIENvbmZpZ3VyYXRpb24gZm9yIGFnZW50IGNvb3JkaW5hdGlvblxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFnZW50Q29vcmRpbmF0b3JDb25maWcge1xuICAgIG1heENvbmN1cnJlbmN5OiBudW1iZXI7XG4gICAgZGVmYXVsdFRpbWVvdXQ6IG51bWJlcjtcbiAgICByZXRyeUF0dGVtcHRzOiBudW1iZXI7XG4gICAgcmV0cnlEZWxheTogbnVtYmVyO1xuICAgIGVuYWJsZUNhY2hpbmc6IGJvb2xlYW47XG4gICAgbG9nTGV2ZWw6IFwiZGVidWdcIiB8IFwiaW5mb1wiIHwgXCJ3YXJuXCIgfCBcImVycm9yXCI7XG59XG5cbi8qKlxuICogUmVzdWx0IGFnZ3JlZ2F0aW9uIHN0cmF0ZWd5XG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQWdncmVnYXRpb25TdHJhdGVneSB7XG4gICAgdHlwZTpcbiAgICAgICAgfCBcIm1lcmdlXCJcbiAgICAgICAgfCBcInZvdGVcIlxuICAgICAgICB8IFwid2VpZ2h0ZWRcIlxuICAgICAgICB8IFwicHJpb3JpdHlcIlxuICAgICAgICB8IFwicGFyYWxsZWxcIlxuICAgICAgICB8IFwic2VxdWVudGlhbFwiO1xuICAgIHdlaWdodHM/OiBQYXJ0aWFsPFJlY29yZDxBZ2VudFR5cGUsIG51bWJlcj4+O1xuICAgIHByaW9yaXR5PzogQWdlbnRUeXBlW107XG4gICAgY29uZmxpY3RSZXNvbHV0aW9uPzogXCJoaWdoZXN0X2NvbmZpZGVuY2VcIiB8IFwibW9zdF9yZWNlbnRcIiB8IFwibWFudWFsXCI7XG59XG5cbi8qKlxuICogUGxhbiBnZW5lcmF0aW9uIHNwZWNpZmljIHR5cGVzXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUGxhbkdlbmVyYXRpb25JbnB1dCB7XG4gICAgZGVzY3JpcHRpb246IHN0cmluZztcbiAgICBzY29wZT86IHN0cmluZztcbiAgICByZXF1aXJlbWVudHM/OiBzdHJpbmdbXTtcbiAgICBjb25zdHJhaW50cz86IHN0cmluZ1tdO1xuICAgIGNvbnRleHQ/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQbGFuR2VuZXJhdGlvbk91dHB1dCB7XG4gICAgcGxhbjoge1xuICAgICAgICBuYW1lOiBzdHJpbmc7XG4gICAgICAgIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gICAgICAgIHRhc2tzOiBBZ2VudFRhc2tbXTtcbiAgICAgICAgZGVwZW5kZW5jaWVzOiBzdHJpbmdbXVtdO1xuICAgIH07XG4gICAgY29uZmlkZW5jZTogQ29uZmlkZW5jZUxldmVsO1xuICAgIHJlYXNvbmluZzogc3RyaW5nO1xuICAgIHN1Z2dlc3Rpb25zOiBzdHJpbmdbXTtcbn1cblxuLyoqXG4gKiBDb2RlIHJldmlldyBzcGVjaWZpYyB0eXBlc1xuICovXG5leHBvcnQgaW50ZXJmYWNlIENvZGVSZXZpZXdJbnB1dCB7XG4gICAgZmlsZXM6IHN0cmluZ1tdO1xuICAgIHJldmlld1R5cGU6IFwiZnVsbFwiIHwgXCJpbmNyZW1lbnRhbFwiIHwgXCJzZWN1cml0eVwiIHwgXCJwZXJmb3JtYW5jZVwiO1xuICAgIHNldmVyaXR5OiBcImxvd1wiIHwgXCJtZWRpdW1cIiB8IFwiaGlnaFwiIHwgXCJjcml0aWNhbFwiO1xuICAgIGNvbnRleHQ/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb2RlUmV2aWV3RmluZGluZyB7XG4gICAgZmlsZTogc3RyaW5nO1xuICAgIGxpbmU6IG51bWJlcjtcbiAgICBzZXZlcml0eTogXCJsb3dcIiB8IFwibWVkaXVtXCIgfCBcImhpZ2hcIiB8IFwiY3JpdGljYWxcIjtcbiAgICBjYXRlZ29yeTogc3RyaW5nO1xuICAgIG1lc3NhZ2U6IHN0cmluZztcbiAgICBzdWdnZXN0aW9uPzogc3RyaW5nO1xuICAgIGNvbmZpZGVuY2U6IENvbmZpZGVuY2VMZXZlbDtcbiAgICBhZ2VudD86IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb2RlUmV2aWV3T3V0cHV0IHtcbiAgICBmaW5kaW5nczogQ29kZVJldmlld0ZpbmRpbmdbXTtcbiAgICBzdW1tYXJ5OiB7XG4gICAgICAgIHRvdGFsOiBudW1iZXI7XG4gICAgICAgIGJ5U2V2ZXJpdHk6IFJlY29yZDxzdHJpbmcsIG51bWJlcj47XG4gICAgICAgIGJ5Q2F0ZWdvcnk6IFJlY29yZDxzdHJpbmcsIG51bWJlcj47XG4gICAgfTtcbiAgICByZWNvbW1lbmRhdGlvbnM6IHN0cmluZ1tdO1xuICAgIG92ZXJhbGxTY29yZTogbnVtYmVyOyAvLyAwLTEwMFxufVxuXG4vKipcbiAqIEFnZW50IGV4ZWN1dGlvbiBjb250ZXh0XG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQWdlbnRFeGVjdXRpb25Db250ZXh0IHtcbiAgICBwbGFuSWQ6IHN0cmluZztcbiAgICB0YXNrSWQ6IHN0cmluZztcbiAgICB3b3JraW5nRGlyZWN0b3J5OiBzdHJpbmc7XG4gICAgZW52aXJvbm1lbnQ6IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG4gICAgbWV0YWRhdGE6IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xufVxuXG4vKipcbiAqIEV2ZW50IHR5cGVzIGZvciBhZ2VudCBjb29yZGluYXRpb25cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBZ2VudEV2ZW50IHtcbiAgICB0eXBlOlxuICAgICAgICB8IFwidGFza19zdGFydGVkXCJcbiAgICAgICAgfCBcInRhc2tfY29tcGxldGVkXCJcbiAgICAgICAgfCBcInRhc2tfZmFpbGVkXCJcbiAgICAgICAgfCBcInRhc2tfdGltZW91dFwiXG4gICAgICAgIHwgXCJhZ2dyZWdhdGlvbl9zdGFydGVkXCJcbiAgICAgICAgfCBcImFnZ3JlZ2F0aW9uX2NvbXBsZXRlZFwiO1xuICAgIHRhc2tJZDogc3RyaW5nO1xuICAgIGFnZW50VHlwZTogQWdlbnRUeXBlO1xuICAgIHRpbWVzdGFtcDogRGF0ZTtcbiAgICBkYXRhPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG59XG5cbi8qKlxuICogUHJvZ3Jlc3MgdHJhY2tpbmcgZm9yIGFnZW50IG9yY2hlc3RyYXRpb25cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBZ2VudFByb2dyZXNzIHtcbiAgICB0b3RhbFRhc2tzOiBudW1iZXI7XG4gICAgY29tcGxldGVkVGFza3M6IG51bWJlcjtcbiAgICBmYWlsZWRUYXNrczogbnVtYmVyO1xuICAgIHJ1bm5pbmdUYXNrczogbnVtYmVyO1xuICAgIGN1cnJlbnRUYXNrPzogc3RyaW5nO1xuICAgIGVzdGltYXRlZFRpbWVSZW1haW5pbmc/OiBudW1iZXI7XG4gICAgcGVyY2VudGFnZUNvbXBsZXRlOiBudW1iZXI7XG59XG5cbi8qKlxuICogRXJyb3IgaGFuZGxpbmcgdHlwZXNcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBZ2VudEVycm9yIHtcbiAgICB0YXNrSWQ6IHN0cmluZztcbiAgICBhZ2VudFR5cGU6IEFnZW50VHlwZTtcbiAgICBlcnJvcjogc3RyaW5nO1xuICAgIHJlY292ZXJhYmxlOiBib29sZWFuO1xuICAgIHN1Z2dlc3RlZEFjdGlvbj86IHN0cmluZztcbiAgICB0aW1lc3RhbXA6IERhdGU7XG59XG5cbi8qKlxuICogUGVyZm9ybWFuY2UgbWV0cmljcyBmb3IgYWdlbnQgZXhlY3V0aW9uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQWdlbnRNZXRyaWNzIHtcbiAgICBhZ2VudFR5cGU6IEFnZW50VHlwZTtcbiAgICBleGVjdXRpb25Db3VudDogbnVtYmVyO1xuICAgIGF2ZXJhZ2VFeGVjdXRpb25UaW1lOiBudW1iZXI7XG4gICAgc3VjY2Vzc1JhdGU6IG51bWJlcjtcbiAgICBhdmVyYWdlQ29uZmlkZW5jZTogbnVtYmVyO1xuICAgIGxhc3RFeGVjdXRpb25UaW1lOiBEYXRlO1xufVxuXG4vKipcbiAqIEFnZW50IGRlZmluaXRpb24gbG9hZGVkIGZyb20gLmNsYXVkZS1wbHVnaW4vYWdlbnRzL1xuICovXG5leHBvcnQgaW50ZXJmYWNlIEFnZW50RGVmaW5pdGlvbiB7XG4gICAgdHlwZTogQWdlbnRUeXBlO1xuICAgIG5hbWU6IHN0cmluZztcbiAgICBkZXNjcmlwdGlvbjogc3RyaW5nO1xuICAgIG1vZGU6IFwic3ViYWdlbnRcIiB8IFwidG9vbFwiO1xuICAgIHRlbXBlcmF0dXJlOiBudW1iZXI7XG4gICAgY2FwYWJpbGl0aWVzOiBzdHJpbmdbXTtcbiAgICBoYW5kb2ZmczogQWdlbnRUeXBlW107XG4gICAgdGFnczogc3RyaW5nW107XG4gICAgY2F0ZWdvcnk6IHN0cmluZztcbiAgICB0b29sczoge1xuICAgICAgICByZWFkOiBib29sZWFuO1xuICAgICAgICBncmVwOiBib29sZWFuO1xuICAgICAgICBnbG9iOiBib29sZWFuO1xuICAgICAgICBsaXN0OiBib29sZWFuO1xuICAgICAgICBiYXNoOiBib29sZWFuO1xuICAgICAgICBlZGl0OiBib29sZWFuO1xuICAgICAgICB3cml0ZTogYm9vbGVhbjtcbiAgICAgICAgcGF0Y2g6IGJvb2xlYW47XG4gICAgfTtcbiAgICBwcm9tcHRQYXRoOiBzdHJpbmc7XG4gICAgcHJvbXB0OiBzdHJpbmc7XG59XG5cbi8qKlxuICogQWdlbnQgZXhlY3V0aW9uIHJlY29yZCBmb3IgcGVyc2lzdGVuY2VcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBZ2VudEV4ZWN1dGlvbiB7XG4gICAgdGFza0lkOiBzdHJpbmc7XG4gICAgYWdlbnRUeXBlOiBBZ2VudFR5cGU7XG4gICAgaW5wdXQ/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICBvdXRwdXQ/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICBzdWNjZXNzOiBib29sZWFuO1xuICAgIGNvbmZpZGVuY2U/OiBDb25maWRlbmNlTGV2ZWw7XG4gICAgZXhlY3V0aW9uVGltZTogbnVtYmVyO1xuICAgIHRpbWVzdGFtcDogRGF0ZTtcbiAgICBlcnJvcj86IHN0cmluZztcbn1cblxuLyoqXG4gKiBJbXByb3ZlbWVudCByZWNvcmQgZm9yIHNlbGYtaW1wcm92ZW1lbnQgc3lzdGVtXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSW1wcm92ZW1lbnRSZWNvcmQge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgdHlwZTogXCJhZ2VudF9wcm9tcHRcIiB8IFwiY2FwYWJpbGl0eVwiIHwgXCJoYW5kb2ZmXCIgfCBcIndvcmtmbG93XCI7XG4gICAgdGFyZ2V0OiBBZ2VudFR5cGUgfCBzdHJpbmc7XG4gICAgZGVzY3JpcHRpb246IHN0cmluZztcbiAgICBldmlkZW5jZTogc3RyaW5nW107XG4gICAgc3VnZ2VzdGVkQXQ6IERhdGU7XG4gICAgaW1wbGVtZW50ZWRBdD86IERhdGU7XG4gICAgZWZmZWN0aXZlbmVzc1Njb3JlPzogbnVtYmVyO1xufVxuXG4vKipcbiAqIEhhbmRvZmYgcmVjb3JkIGZvciBpbnRlci1hZ2VudCBjb21tdW5pY2F0aW9uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSGFuZG9mZlJlY29yZCB7XG4gICAgaWQ6IHN0cmluZztcbiAgICBmcm9tQWdlbnQ6IEFnZW50VHlwZTtcbiAgICB0b0FnZW50OiBBZ2VudFR5cGU7XG4gICAgcmVhc29uOiBzdHJpbmc7XG4gICAgY29udGV4dD86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgIHN1Y2Nlc3M6IGJvb2xlYW47XG4gICAgdGltZXN0YW1wOiBEYXRlO1xufVxuXG4vKipcbiAqIEV4ZWN1dGlvbiBtb2RlIGZvciBoeWJyaWQgVGFzayB0b29sICsgbG9jYWwgZXhlY3V0aW9uXG4gKi9cbmV4cG9ydCB0eXBlIEV4ZWN1dGlvbk1vZGUgPSBcInRhc2stdG9vbFwiIHwgXCJsb2NhbFwiIHwgXCJoeWJyaWRcIjtcblxuLyoqXG4gKiBSb3V0aW5nIGRlY2lzaW9uIGZvciBjYXBhYmlsaXR5LWJhc2VkIGFnZW50IHNlbGVjdGlvblxuICovXG5leHBvcnQgaW50ZXJmYWNlIFJvdXRpbmdEZWNpc2lvbiB7XG4gICAgcHJpbWFyeUFnZW50OiBBZ2VudFR5cGU7XG4gICAgc3VwcG9ydGluZ0FnZW50czogQWdlbnRUeXBlW107XG4gICAgZXhlY3V0aW9uU3RyYXRlZ3k6IFwicGFyYWxsZWxcIiB8IFwic2VxdWVudGlhbFwiIHwgXCJjb25kaXRpb25hbFwiO1xuICAgIGV4ZWN1dGlvbk1vZGU6IEV4ZWN1dGlvbk1vZGU7XG4gICAgaGFuZG9mZlBsYW46IEhhbmRvZmZQbGFuW107XG59XG5cbi8qKlxuICogSGFuZG9mZiBwbGFuIGZvciBpbnRlci1hZ2VudCBkZWxlZ2F0aW9uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSGFuZG9mZlBsYW4ge1xuICAgIGZyb21BZ2VudDogQWdlbnRUeXBlO1xuICAgIHRvQWdlbnQ6IEFnZW50VHlwZTtcbiAgICBjb25kaXRpb246IHN0cmluZztcbiAgICBjb250ZXh0VHJhbnNmZXI6IHN0cmluZ1tdO1xufVxuXG4vKipcbiAqIFJldmlldyByZXN1bHQgZnJvbSBxdWFsaXR5IGZlZWRiYWNrIGxvb3BcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZXZpZXdSZXN1bHQge1xuICAgIGFwcHJvdmVkOiBib29sZWFuO1xuICAgIGZlZWRiYWNrOiBzdHJpbmc7XG4gICAgc3VnZ2VzdGVkSW1wcm92ZW1lbnRzOiBzdHJpbmdbXTtcbiAgICBjb25maWRlbmNlOiBDb25maWRlbmNlTGV2ZWw7XG59XG5cbi8qKlxuICogTWVtb3J5IGVudHJ5IGZvciBjb250ZXh0IGVudmVsb3BlXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTWVtb3J5RW50cnkge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgdHlwZTogXCJkZWNsYXJhdGl2ZVwiIHwgXCJwcm9jZWR1cmFsXCIgfCBcImVwaXNvZGljXCI7XG4gICAgY29udGVudDogc3RyaW5nO1xuICAgIHByb3ZlbmFuY2U6IHtcbiAgICAgICAgc291cmNlOiBcInVzZXJcIiB8IFwiYWdlbnRcIiB8IFwiaW5mZXJyZWRcIjtcbiAgICAgICAgdGltZXN0YW1wOiBzdHJpbmc7XG4gICAgICAgIGNvbmZpZGVuY2U6IG51bWJlcjtcbiAgICAgICAgY29udGV4dDogc3RyaW5nO1xuICAgICAgICBzZXNzaW9uSWQ/OiBzdHJpbmc7XG4gICAgfTtcbiAgICB0YWdzOiBzdHJpbmdbXTtcbiAgICBsYXN0QWNjZXNzZWQ6IHN0cmluZztcbiAgICBhY2Nlc3NDb3VudDogbnVtYmVyO1xufVxuXG4vKipcbiAqIENvbnRleHQgZW52ZWxvcGUgZm9yIHBhc3Npbmcgc3RhdGUgYmV0d2VlbiBhZ2VudHNcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb250ZXh0RW52ZWxvcGUge1xuICAgIC8vIFNlc3Npb24gc3RhdGVcbiAgICBzZXNzaW9uOiB7XG4gICAgICAgIGlkOiBzdHJpbmc7XG4gICAgICAgIHBhcmVudElEPzogc3RyaW5nOyAvLyBQYXJlbnQgc2Vzc2lvbiBJRCBmb3IgbmVzdGVkIHN1YmFnZW50IGNhbGxzXG4gICAgICAgIGFjdGl2ZUZpbGVzOiBzdHJpbmdbXTtcbiAgICAgICAgcGVuZGluZ1Rhc2tzOiBUYXNrW107IC8vIFRhc2sgb2JqZWN0cyBmcm9tIGNvbnRleHQvdHlwZXNcbiAgICAgICAgZGVjaXNpb25zOiBEZWNpc2lvbltdOyAvLyBEZWNpc2lvbiBvYmplY3RzIGZyb20gY29udGV4dC90eXBlc1xuICAgIH07XG5cbiAgICAvLyBSZWxldmFudCBtZW1vcmllc1xuICAgIG1lbW9yaWVzOiB7XG4gICAgICAgIGRlY2xhcmF0aXZlOiBNZW1vcnlFbnRyeVtdOyAvLyBGYWN0cywgcGF0dGVybnNcbiAgICAgICAgcHJvY2VkdXJhbDogTWVtb3J5RW50cnlbXTsgLy8gV29ya2Zsb3dzLCBwcm9jZWR1cmVzXG4gICAgICAgIGVwaXNvZGljOiBNZW1vcnlFbnRyeVtdOyAvLyBQYXN0IGV2ZW50c1xuICAgIH07XG5cbiAgICAvLyBQcmV2aW91cyBhZ2VudCByZXN1bHRzIChmb3IgaGFuZG9mZnMpXG4gICAgcHJldmlvdXNSZXN1bHRzOiB7XG4gICAgICAgIGFnZW50VHlwZTogQWdlbnRUeXBlIHwgc3RyaW5nO1xuICAgICAgICBvdXRwdXQ6IHVua25vd247XG4gICAgICAgIGNvbmZpZGVuY2U6IENvbmZpZGVuY2VMZXZlbCB8IHN0cmluZztcbiAgICB9W107XG5cbiAgICAvLyBUYXNrLXNwZWNpZmljIGNvbnRleHRcbiAgICB0YXNrQ29udGV4dDogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG5cbiAgICAvLyBNZXRhZGF0YVxuICAgIG1ldGE6IHtcbiAgICAgICAgcmVxdWVzdElkOiBzdHJpbmc7XG4gICAgICAgIHRpbWVzdGFtcDogRGF0ZTtcbiAgICAgICAgZGVwdGg6IG51bWJlcjsgLy8gSG93IG1hbnkgaGFuZG9mZnMgZGVlcFxuICAgICAgICBtZXJnZWRGcm9tPzogbnVtYmVyOyAvLyBOdW1iZXIgb2YgZW52ZWxvcGVzIG1lcmdlZFxuICAgICAgICBtZXJnZVN0cmF0ZWd5Pzogc3RyaW5nOyAvLyBTdHJhdGVneSB1c2VkIGZvciBtZXJnaW5nXG4gICAgfTtcbn1cblxuLyoqXG4gKiBMb2NhbCBvcGVyYXRpb24gZm9yIGZpbGUtYmFzZWQgdGFza3NcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBMb2NhbE9wZXJhdGlvbiB7XG4gICAgb3BlcmF0aW9uOiBcImdsb2JcIiB8IFwiZ3JlcFwiIHwgXCJyZWFkXCIgfCBcInN0YXRcIjtcbiAgICBwYXR0ZXJuPzogc3RyaW5nO1xuICAgIGluY2x1ZGU/OiBzdHJpbmc7XG4gICAgY3dkPzogc3RyaW5nO1xuICAgIG9wdGlvbnM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbn1cblxuLyoqXG4gKiBSZXN1bHQgb2YgbG9jYWwgb3BlcmF0aW9uIGV4ZWN1dGlvblxuICovXG5leHBvcnQgaW50ZXJmYWNlIExvY2FsUmVzdWx0IHtcbiAgICBzdWNjZXNzOiBib29sZWFuO1xuICAgIGRhdGE/OiB1bmtub3duO1xuICAgIGVycm9yPzogc3RyaW5nO1xuICAgIGV4ZWN1dGlvblRpbWU6IG51bWJlcjtcbn1cbiIsCiAgICAiLyoqXG4gKiBUeXBlIGRlZmluaXRpb25zIGZvciB0aGUgQUkgRW5naW5lZXJpbmcgU3lzdGVtIGV4ZWN1dGlvbiBlbmdpbmUuXG4gKiBQcm92aWRlcyBjb21wcmVoZW5zaXZlIHR5cGUgc2FmZXR5IGZvciBwbGFuIHBhcnNpbmcsIHRhc2sgZXhlY3V0aW9uLCBhbmQgcXVhbGl0eSBnYXRlcy5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7IEFnZW50VGFzayB9IGZyb20gXCIuLi9hZ2VudHMvdHlwZXNcIjtcblxuLyoqIFVuaW9uIHR5cGUgZm9yIGJvdGggcmVndWxhciB0YXNrcyBhbmQgYWdlbnQgdGFza3MgKi9cbmV4cG9ydCB0eXBlIEV4ZWN1dGFibGVUYXNrID0gVGFzayB8IEFnZW50VGFzaztcblxuZXhwb3J0IGludGVyZmFjZSBQbGFuIHtcbiAgICAvKiogUGxhbiBtZXRhZGF0YSBhbmQgY29uZmlndXJhdGlvbiAqL1xuICAgIG1ldGFkYXRhOiBQbGFuTWV0YWRhdGE7XG4gICAgLyoqIEFycmF5IG9mIHRhc2tzIHRvIGJlIGV4ZWN1dGVkICovXG4gICAgdGFza3M6IEV4ZWN1dGFibGVUYXNrW107XG4gICAgLyoqIFF1YWxpdHkgZ2F0ZSBjb25maWd1cmF0aW9ucyAqL1xuICAgIHF1YWxpdHlHYXRlcz86IFF1YWxpdHlHYXRlQ29uZmlnW107XG4gICAgLyoqIFZhbGlkYXRpb24gZXJyb3JzIGlmIGFueSAqL1xuICAgIGVycm9ycz86IFZhbGlkYXRpb25FcnJvcltdO1xuICAgIC8qKiBWYWxpZGF0aW9uIHdhcm5pbmdzIGlmIGFueSAqL1xuICAgIHdhcm5pbmdzPzogc3RyaW5nW107XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGxhbk1ldGFkYXRhIHtcbiAgICAvKiogVW5pcXVlIHBsYW4gaWRlbnRpZmllciAqL1xuICAgIGlkOiBzdHJpbmc7XG4gICAgLyoqIEh1bWFuLXJlYWRhYmxlIHBsYW4gbmFtZSAqL1xuICAgIG5hbWU6IHN0cmluZztcbiAgICAvKiogUGxhbiBkZXNjcmlwdGlvbiAqL1xuICAgIGRlc2NyaXB0aW9uPzogc3RyaW5nO1xuICAgIC8qKiBQbGFuIHZlcnNpb24gKi9cbiAgICB2ZXJzaW9uOiBzdHJpbmc7XG4gICAgLyoqIEF1dGhvciBpbmZvcm1hdGlvbiAqL1xuICAgIGF1dGhvcj86IHN0cmluZztcbiAgICAvKiogQ3JlYXRpb24gdGltZXN0YW1wICovXG4gICAgY3JlYXRlZD86IHN0cmluZztcbiAgICAvKiogTGFzdCBtb2RpZmllZCB0aW1lc3RhbXAgKi9cbiAgICBtb2RpZmllZD86IHN0cmluZztcbiAgICAvKiogUGxhbiB0YWdzICovXG4gICAgdGFncz86IHN0cmluZ1tdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFRhc2sge1xuICAgIC8qKiBVbmlxdWUgdGFzayBpZGVudGlmaWVyICovXG4gICAgaWQ6IHN0cmluZztcbiAgICAvKiogSHVtYW4tcmVhZGFibGUgdGFzayBuYW1lICovXG4gICAgbmFtZTogc3RyaW5nO1xuICAgIC8qKiBUYXNrIGRlc2NyaXB0aW9uICovXG4gICAgZGVzY3JpcHRpb24/OiBzdHJpbmc7XG4gICAgLyoqIFRhc2sgdHlwZSBkZXRlcm1pbmVzIGV4ZWN1dGlvbiBiZWhhdmlvciAqL1xuICAgIHR5cGU6IFRhc2tUeXBlO1xuICAgIC8qKiBDb21tYW5kIHRvIGV4ZWN1dGUgKi9cbiAgICBjb21tYW5kOiBzdHJpbmc7XG4gICAgLyoqIFdvcmtpbmcgZGlyZWN0b3J5IGZvciBjb21tYW5kIGV4ZWN1dGlvbiAqL1xuICAgIHdvcmtpbmdEaXJlY3Rvcnk/OiBzdHJpbmc7XG4gICAgLyoqIEVudmlyb25tZW50IHZhcmlhYmxlcyBmb3IgdGhlIHRhc2sgKi9cbiAgICBlbnZpcm9ubWVudD86IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG4gICAgLyoqIFRhc2sgZGVwZW5kZW5jaWVzIHRoYXQgbXVzdCBjb21wbGV0ZSBmaXJzdCAqL1xuICAgIGRlcGVuZHNPbj86IHN0cmluZ1tdO1xuICAgIC8qKiBUaW1lb3V0IGluIHNlY29uZHMgKi9cbiAgICB0aW1lb3V0PzogbnVtYmVyO1xuICAgIC8qKiBSZXRyeSBjb25maWd1cmF0aW9uICovXG4gICAgcmV0cnk/OiBSZXRyeUNvbmZpZztcbiAgICAvKiogVGFzayBzdGF0dXMgZHVyaW5nIGV4ZWN1dGlvbiAqL1xuICAgIHN0YXR1cz86IFRhc2tTdGF0dXM7XG4gICAgLyoqIEV4ZWN1dGlvbiByZXN1bHRzICovXG4gICAgcmVzdWx0PzogVGFza1Jlc3VsdDtcbn1cblxuZXhwb3J0IGVudW0gVGFza1R5cGUge1xuICAgIC8qKiBFeGVjdXRlIHNoZWxsIGNvbW1hbmQgKi9cbiAgICBTSEVMTCA9IFwic2hlbGxcIixcbiAgICAvKiogUnVuIGxpbnRpbmcgY2hlY2tzICovXG4gICAgTElOVCA9IFwibGludFwiLFxuICAgIC8qKiBUeXBlIGNoZWNraW5nICovXG4gICAgVFlQRVMgPSBcInR5cGVzXCIsXG4gICAgLyoqIFJ1biB0ZXN0cyAqL1xuICAgIFRFU1RTID0gXCJ0ZXN0c1wiLFxuICAgIC8qKiBCdWlsZCBwcm9qZWN0ICovXG4gICAgQlVJTEQgPSBcImJ1aWxkXCIsXG4gICAgLyoqIEludGVncmF0aW9uIHRlc3RzICovXG4gICAgSU5URUdSQVRJT04gPSBcImludGVncmF0aW9uXCIsXG4gICAgLyoqIERlcGxveW1lbnQgKi9cbiAgICBERVBMT1kgPSBcImRlcGxveVwiLFxufVxuXG5leHBvcnQgZW51bSBUYXNrU3RhdHVzIHtcbiAgICAvKiogVGFzayBub3QgeWV0IHN0YXJ0ZWQgKi9cbiAgICBQRU5ESU5HID0gXCJwZW5kaW5nXCIsXG4gICAgLyoqIFRhc2sgY3VycmVudGx5IHJ1bm5pbmcgKi9cbiAgICBSVU5OSU5HID0gXCJydW5uaW5nXCIsXG4gICAgLyoqIFRhc2sgY29tcGxldGVkIHN1Y2Nlc3NmdWxseSAqL1xuICAgIENPTVBMRVRFRCA9IFwiY29tcGxldGVkXCIsXG4gICAgLyoqIFRhc2sgZmFpbGVkICovXG4gICAgRkFJTEVEID0gXCJmYWlsZWRcIixcbiAgICAvKiogVGFzayBza2lwcGVkIGR1ZSB0byBkZXBlbmRlbmN5IGZhaWx1cmUgKi9cbiAgICBTS0lQUEVEID0gXCJza2lwcGVkXCIsXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmV0cnlDb25maWcge1xuICAgIC8qKiBNYXhpbXVtIG51bWJlciBvZiByZXRyeSBhdHRlbXB0cyAqL1xuICAgIG1heEF0dGVtcHRzOiBudW1iZXI7XG4gICAgLyoqIERlbGF5IGJldHdlZW4gcmV0cmllcyBpbiBzZWNvbmRzICovXG4gICAgZGVsYXk6IG51bWJlcjtcbiAgICAvKiogQmFja29mZiBtdWx0aXBsaWVyIGZvciBleHBvbmVudGlhbCBiYWNrb2ZmICovXG4gICAgYmFja29mZk11bHRpcGxpZXI/OiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGFza1Jlc3VsdCB7XG4gICAgLyoqIFRhc2sgaWRlbnRpZmllciAqL1xuICAgIGlkOiBzdHJpbmc7XG4gICAgLyoqIFRhc2sgZXhlY3V0aW9uIHN0YXR1cyAqL1xuICAgIHN0YXR1czogVGFza1N0YXR1cztcbiAgICAvKiogRXhpdCBjb2RlIGZyb20gY29tbWFuZCBleGVjdXRpb24gKi9cbiAgICBleGl0Q29kZTogbnVtYmVyO1xuICAgIC8qKiBTdGFuZGFyZCBvdXRwdXQgKi9cbiAgICBzdGRvdXQ6IHN0cmluZztcbiAgICAvKiogU3RhbmRhcmQgZXJyb3IgKi9cbiAgICBzdGRlcnI6IHN0cmluZztcbiAgICAvKiogRXhlY3V0aW9uIGR1cmF0aW9uIGluIG1pbGxpc2Vjb25kcyAqL1xuICAgIGR1cmF0aW9uOiBudW1iZXI7XG4gICAgLyoqIFN0YXJ0IHRpbWVzdGFtcCAqL1xuICAgIHN0YXJ0VGltZTogRGF0ZTtcbiAgICAvKiogRW5kIHRpbWVzdGFtcCAqL1xuICAgIGVuZFRpbWU6IERhdGU7XG4gICAgLyoqIEVycm9yIG1lc3NhZ2UgaWYgZmFpbGVkICovXG4gICAgZXJyb3I/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUXVhbGl0eUdhdGVDb25maWcge1xuICAgIC8qKiBRdWFsaXR5IGdhdGUgaWRlbnRpZmllciAqL1xuICAgIGlkOiBzdHJpbmc7XG4gICAgLyoqIEdhdGUgbmFtZSAqL1xuICAgIG5hbWU6IHN0cmluZztcbiAgICAvKiogR2F0ZSBkZXNjcmlwdGlvbiAqL1xuICAgIGRlc2NyaXB0aW9uPzogc3RyaW5nO1xuICAgIC8qKiBHYXRlIHR5cGUgZGV0ZXJtaW5lcyB2YWxpZGF0aW9uIGJlaGF2aW9yICovXG4gICAgdHlwZTogUXVhbGl0eUdhdGVUeXBlO1xuICAgIC8qKiBXaGV0aGVyIHRoaXMgZ2F0ZSBpcyByZXF1aXJlZCAqL1xuICAgIHJlcXVpcmVkOiBib29sZWFuO1xuICAgIC8qKiBHYXRlLXNwZWNpZmljIGNvbmZpZ3VyYXRpb24gKi9cbiAgICBjb25maWc/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICAvKiogVGFzayBJRCBhc3NvY2lhdGVkIHdpdGggdGhpcyBnYXRlICovXG4gICAgdGFza0lkPzogc3RyaW5nO1xufVxuXG5leHBvcnQgZW51bSBRdWFsaXR5R2F0ZVR5cGUge1xuICAgIC8qKiBDb2RlIGxpbnRpbmcgYW5kIGZvcm1hdHRpbmcgKi9cbiAgICBMSU5UID0gXCJsaW50XCIsXG4gICAgLyoqIFR5cGVTY3JpcHQgY29tcGlsYXRpb24gKi9cbiAgICBUWVBFUyA9IFwidHlwZXNcIixcbiAgICAvKiogVW5pdCB0ZXN0IGV4ZWN1dGlvbiAqL1xuICAgIFRFU1RTID0gXCJ0ZXN0c1wiLFxuICAgIC8qKiBCdWlsZCBwcm9jZXNzICovXG4gICAgQlVJTEQgPSBcImJ1aWxkXCIsXG4gICAgLyoqIEludGVncmF0aW9uIHRlc3RpbmcgKi9cbiAgICBJTlRFR1JBVElPTiA9IFwiaW50ZWdyYXRpb25cIixcbiAgICAvKiogRGVwbG95bWVudCB2YWxpZGF0aW9uICovXG4gICAgREVQTE9ZID0gXCJkZXBsb3lcIixcbn1cblxuZXhwb3J0IGludGVyZmFjZSBRdWFsaXR5R2F0ZVJlc3VsdCB7XG4gICAgLyoqIFF1YWxpdHkgZ2F0ZSBpZGVudGlmaWVyICovXG4gICAgZ2F0ZUlkOiBzdHJpbmc7XG4gICAgLyoqIEdhdGUgZXhlY3V0aW9uIHN0YXR1cyAqL1xuICAgIHN0YXR1czogVGFza1N0YXR1cztcbiAgICAvKiogUGFzcy9mYWlsIHJlc3VsdCAqL1xuICAgIHBhc3NlZDogYm9vbGVhbjtcbiAgICAvKiogRXhlY3V0aW9uIGR1cmF0aW9uIGluIG1pbGxpc2Vjb25kcyAqL1xuICAgIGR1cmF0aW9uOiBudW1iZXI7XG4gICAgLyoqIFJlc3VsdCBtZXNzYWdlICovXG4gICAgbWVzc2FnZTogc3RyaW5nO1xuICAgIC8qKiBEZXRhaWxlZCByZXN1bHRzICovXG4gICAgZGV0YWlscz86IHVua25vd247XG4gICAgLyoqIEV4ZWN1dGlvbiB0aW1lc3RhbXAgKi9cbiAgICB0aW1lc3RhbXA6IERhdGU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRXhlY3V0aW9uUmVwb3J0IHtcbiAgICAvKiogUGxhbiBpZGVudGlmaWVyICovXG4gICAgcGxhbklkOiBzdHJpbmc7XG4gICAgLyoqIE92ZXJhbGwgZXhlY3V0aW9uIHN0YXR1cyAqL1xuICAgIHN0YXR1czogVGFza1N0YXR1cztcbiAgICAvKiogRXhlY3V0aW9uIHN0YXJ0IHRpbWUgKi9cbiAgICBzdGFydFRpbWU6IERhdGU7XG4gICAgLyoqIEV4ZWN1dGlvbiBlbmQgdGltZSAqL1xuICAgIGVuZFRpbWU6IERhdGU7XG4gICAgLyoqIFRvdGFsIGV4ZWN1dGlvbiBkdXJhdGlvbiBpbiBtaWxsaXNlY29uZHMgKi9cbiAgICB0b3RhbER1cmF0aW9uOiBudW1iZXI7XG4gICAgLyoqIFRhc2sgZXhlY3V0aW9uIHJlc3VsdHMgKi9cbiAgICB0YXNrUmVzdWx0czogVGFza1Jlc3VsdFtdO1xuICAgIC8qKiBRdWFsaXR5IGdhdGUgcmVzdWx0cyAqL1xuICAgIHF1YWxpdHlHYXRlUmVzdWx0czogUXVhbGl0eUdhdGVSZXN1bHRbXTtcbiAgICAvKiogU3VtbWFyeSBzdGF0aXN0aWNzICovXG4gICAgc3VtbWFyeTogRXhlY3V0aW9uU3VtbWFyeTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBFeGVjdXRpb25TdW1tYXJ5IHtcbiAgICAvKiogVG90YWwgbnVtYmVyIG9mIHRhc2tzICovXG4gICAgdG90YWxUYXNrczogbnVtYmVyO1xuICAgIC8qKiBOdW1iZXIgb2YgY29tcGxldGVkIHRhc2tzICovXG4gICAgY29tcGxldGVkVGFza3M6IG51bWJlcjtcbiAgICAvKiogTnVtYmVyIG9mIGZhaWxlZCB0YXNrcyAqL1xuICAgIGZhaWxlZFRhc2tzOiBudW1iZXI7XG4gICAgLyoqIE51bWJlciBvZiBza2lwcGVkIHRhc2tzICovXG4gICAgc2tpcHBlZFRhc2tzOiBudW1iZXI7XG4gICAgLyoqIFRvdGFsIG51bWJlciBvZiBxdWFsaXR5IGdhdGVzICovXG4gICAgdG90YWxHYXRlczogbnVtYmVyO1xuICAgIC8qKiBOdW1iZXIgb2YgcGFzc2VkIHF1YWxpdHkgZ2F0ZXMgKi9cbiAgICBwYXNzZWRHYXRlczogbnVtYmVyO1xuICAgIC8qKiBOdW1iZXIgb2YgZmFpbGVkIHF1YWxpdHkgZ2F0ZXMgKi9cbiAgICBmYWlsZWRHYXRlczogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEV4ZWN1dGlvbk9wdGlvbnMge1xuICAgIC8qKiBFbmFibGUgZHJ5IHJ1biBtb2RlIChubyBhY3R1YWwgZXhlY3V0aW9uKSAqL1xuICAgIGRyeVJ1bj86IGJvb2xlYW47XG4gICAgLyoqIENvbnRpbnVlIGV4ZWN1dGlvbiBvbiB0YXNrIGZhaWx1cmVzICovXG4gICAgY29udGludWVPbkVycm9yPzogYm9vbGVhbjtcbiAgICAvKiogTWF4aW11bSBjb25jdXJyZW50IHRhc2tzICovXG4gICAgbWF4Q29uY3VycmVuY3k/OiBudW1iZXI7XG4gICAgLyoqIFZlcmJvc2Ugb3V0cHV0ICovXG4gICAgdmVyYm9zZT86IGJvb2xlYW47XG4gICAgLyoqIEN1c3RvbSB3b3JraW5nIGRpcmVjdG9yeSAqL1xuICAgIHdvcmtpbmdEaXJlY3Rvcnk/OiBzdHJpbmc7XG4gICAgLyoqIEN1c3RvbSBlbnZpcm9ubWVudCB2YXJpYWJsZXMgKi9cbiAgICBlbnZpcm9ubWVudD86IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVmFsaWRhdGlvbkVycm9yIHtcbiAgICAvKiogRXJyb3IgdHlwZSAqL1xuICAgIHR5cGU6IFZhbGlkYXRpb25FcnJvclR5cGU7XG4gICAgLyoqIEVycm9yIG1lc3NhZ2UgKi9cbiAgICBtZXNzYWdlOiBzdHJpbmc7XG4gICAgLyoqIFBhdGggdG8gdGhlIHByb2JsZW1hdGljIGZpZWxkICovXG4gICAgcGF0aD86IHN0cmluZztcbiAgICAvKiogSW52YWxpZCB2YWx1ZSAqL1xuICAgIHZhbHVlPzogdW5rbm93bjtcbn1cblxuZXhwb3J0IGVudW0gVmFsaWRhdGlvbkVycm9yVHlwZSB7XG4gICAgLyoqIFJlcXVpcmVkIGZpZWxkIG1pc3NpbmcgKi9cbiAgICBSRVFVSVJFRCA9IFwicmVxdWlyZWRcIixcbiAgICAvKiogSW52YWxpZCB2YWx1ZSB0eXBlICovXG4gICAgVFlQRSA9IFwidHlwZVwiLFxuICAgIC8qKiBWYWx1ZSBvdXRzaWRlIGFsbG93ZWQgcmFuZ2UgKi9cbiAgICBSQU5HRSA9IFwicmFuZ2VcIixcbiAgICAvKiogSW52YWxpZCBmb3JtYXQgKi9cbiAgICBGT1JNQVQgPSBcImZvcm1hdFwiLFxuICAgIC8qKiBDaXJjdWxhciBkZXBlbmRlbmN5IGRldGVjdGVkICovXG4gICAgQ0lSQ1VMQVJfREVQRU5ERU5DWSA9IFwiY2lyY3VsYXJfZGVwZW5kZW5jeVwiLFxuICAgIC8qKiBEdXBsaWNhdGUgaWRlbnRpZmllciAqL1xuICAgIERVUExJQ0FURV9JRCA9IFwiZHVwbGljYXRlX2lkXCIsXG4gICAgLyoqIFVua25vd24gZGVwZW5kZW5jeSAqL1xuICAgIFVOS05PV05fREVQRU5ERU5DWSA9IFwidW5rbm93bl9kZXBlbmRlbmN5XCIsXG59XG4iCiAgXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7RUFFQSxJQUFNLFFBQVEsT0FBTyxJQUFJLFlBQVk7QUFBQSxFQUNyQyxJQUFNLE1BQU0sT0FBTyxJQUFJLGVBQWU7QUFBQSxFQUN0QyxJQUFNLE1BQU0sT0FBTyxJQUFJLFVBQVU7QUFBQSxFQUNqQyxJQUFNLE9BQU8sT0FBTyxJQUFJLFdBQVc7QUFBQSxFQUNuQyxJQUFNLFNBQVMsT0FBTyxJQUFJLGFBQWE7QUFBQSxFQUN2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QUFBQSxjQUNBLFNBQVMsZUFBZSxLQUFLLGdDQUFnQztBQUFBLGNBQzdELE1BQU0sU0FBUyxLQUFLO0FBQUEsY0FDcEIsT0FBTztBQUFBLFlBQ1gsQ0FBQztBQUFBLFVBQ0w7QUFBQSxVQUdBLE1BQU0sVUFBVSxNQUFNLEtBQUssQ0FBQyxNQUFNLEVBQUUsT0FBTyxLQUFLO0FBQUEsVUFDaEQsSUFBSSxXQUFXLENBQUMsS0FBSyxZQUFZLE9BQU8sR0FBRztBQUFBLFlBQ3ZDLEtBQUssU0FBUyxLQUNWLGVBQWUsS0FBSyw4QkFBOEIscURBQ3REO0FBQUEsVUFDSjtBQUFBLFFBQ0o7QUFBQSxNQUNKO0FBQUEsSUFDSjtBQUFBLElBR0EsS0FBSywyQkFBMkIsS0FBSztBQUFBO0FBQUEsRUFNakMsV0FBVyxDQUFDLE1BQTJDO0FBQUEsSUFDM0QsT0FBTyxVQUFVLFFBQVEsV0FBVyxRQUFRLGNBQWM7QUFBQTtBQUFBLEVBTXZELGFBQWEsQ0FBQyxNQUF5QjtBQUFBLElBQzFDLE9BQU8sS0FBSyxNQUFNLE9BQU8sQ0FBQyxTQUN0QixLQUFLLFlBQVksSUFBSSxDQUN6QjtBQUFBO0FBQUEsRUFNRyxhQUFhLENBQUMsTUFBb0I7QUFBQSxJQUNyQyxPQUFPLEtBQUssTUFBTSxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssWUFBWSxJQUFJLENBQUM7QUFBQTtBQUFBLEVBTXZELDhCQUE4QixDQUFDLE1BSXBDO0FBQUEsSUFDRSxNQUFNLGFBQWEsS0FBSyxjQUFjLElBQUk7QUFBQSxJQUMxQyxNQUFNLFVBQTRCLENBQUM7QUFBQSxJQUNuQyxNQUFNLFdBQXFCLENBQUM7QUFBQSxJQUc1QixJQUFJLFdBQVcsU0FBUyxHQUFHO0FBQUEsTUFDdkIsU0FBUyxLQUNMLGlCQUFpQixXQUFXLDZEQUNoQztBQUFBLElBQ0o7QUFBQSxJQUdBLFdBQVcsUUFBUSxZQUFZO0FBQUEsTUFDM0IsSUFBSSxDQUFDLEtBQUssV0FBVyxLQUFLLFVBQVUsTUFBTTtBQUFBLFFBQ3RDLFNBQVMsS0FDTCxlQUFlLEtBQUssd0VBQ3hCO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFBQSxJQUdBLFdBQVcsUUFBUSxZQUFZO0FBQUEsTUFDM0IsSUFBSSxDQUFDLEtBQUssT0FBTztBQUFBLFFBQ2IsU0FBUyxLQUNMLGVBQWUsS0FBSyw4RUFDeEI7QUFBQSxNQUNKO0FBQUEsSUFDSjtBQUFBLElBRUEsT0FBTztBQUFBLE1BQ0gsU0FBUyxRQUFPLFdBQVc7QUFBQSxNQUMzQjtBQUFBLE1BQ0E7QUFBQSxJQUNKO0FBQUE7QUFFUjsiLAogICJkZWJ1Z0lkIjogIjIzNDYyQzM0Mjc5ODQ4RDQ2NDc1NkUyMTY0NzU2RTIxIiwKICAibmFtZXMiOiBbXQp9
