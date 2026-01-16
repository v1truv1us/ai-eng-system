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

//# debugId=EFDC84BF057E62A764756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9ub2Rlcy9pZGVudGl0eS5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3Zpc2l0LmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3QvZG9jL2RpcmVjdGl2ZXMuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9kb2MvYW5jaG9ycy5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L2RvYy9hcHBseVJldml2ZXIuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9ub2Rlcy90b0pTLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3Qvbm9kZXMvTm9kZS5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L25vZGVzL0FsaWFzLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3Qvbm9kZXMvU2NhbGFyLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3QvZG9jL2NyZWF0ZU5vZGUuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9ub2Rlcy9Db2xsZWN0aW9uLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3Qvc3RyaW5naWZ5L3N0cmluZ2lmeUNvbW1lbnQuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9zdHJpbmdpZnkvZm9sZEZsb3dMaW5lcy5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3N0cmluZ2lmeS9zdHJpbmdpZnlTdHJpbmcuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9zdHJpbmdpZnkvc3RyaW5naWZ5LmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3Qvc3RyaW5naWZ5L3N0cmluZ2lmeVBhaXIuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9sb2cuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9zY2hlbWEveWFtbC0xLjEvbWVyZ2UuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9ub2Rlcy9hZGRQYWlyVG9KU01hcC5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L25vZGVzL1BhaXIuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9zdHJpbmdpZnkvc3RyaW5naWZ5Q29sbGVjdGlvbi5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L25vZGVzL1lBTUxNYXAuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9zY2hlbWEvY29tbW9uL21hcC5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L25vZGVzL1lBTUxTZXEuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9zY2hlbWEvY29tbW9uL3NlcS5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3NjaGVtYS9jb21tb24vc3RyaW5nLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3Qvc2NoZW1hL2NvbW1vbi9udWxsLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3Qvc2NoZW1hL2NvcmUvYm9vbC5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3N0cmluZ2lmeS9zdHJpbmdpZnlOdW1iZXIuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9zY2hlbWEvY29yZS9mbG9hdC5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3NjaGVtYS9jb3JlL2ludC5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3NjaGVtYS9jb3JlL3NjaGVtYS5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3NjaGVtYS9qc29uL3NjaGVtYS5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3NjaGVtYS95YW1sLTEuMS9iaW5hcnkuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9zY2hlbWEveWFtbC0xLjEvcGFpcnMuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9zY2hlbWEveWFtbC0xLjEvb21hcC5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3NjaGVtYS95YW1sLTEuMS9ib29sLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3Qvc2NoZW1hL3lhbWwtMS4xL2Zsb2F0LmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3Qvc2NoZW1hL3lhbWwtMS4xL2ludC5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3NjaGVtYS95YW1sLTEuMS9zZXQuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9zY2hlbWEveWFtbC0xLjEvdGltZXN0YW1wLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3Qvc2NoZW1hL3lhbWwtMS4xL3NjaGVtYS5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3NjaGVtYS90YWdzLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3Qvc2NoZW1hL1NjaGVtYS5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3N0cmluZ2lmeS9zdHJpbmdpZnlEb2N1bWVudC5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L2RvYy9Eb2N1bWVudC5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L2Vycm9ycy5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L2NvbXBvc2UvcmVzb2x2ZS1wcm9wcy5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L2NvbXBvc2UvdXRpbC1jb250YWlucy1uZXdsaW5lLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3QvY29tcG9zZS91dGlsLWZsb3ctaW5kZW50LWNoZWNrLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3QvY29tcG9zZS91dGlsLW1hcC1pbmNsdWRlcy5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L2NvbXBvc2UvcmVzb2x2ZS1ibG9jay1tYXAuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9jb21wb3NlL3Jlc29sdmUtYmxvY2stc2VxLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3QvY29tcG9zZS9yZXNvbHZlLWVuZC5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L2NvbXBvc2UvcmVzb2x2ZS1mbG93LWNvbGxlY3Rpb24uanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9jb21wb3NlL2NvbXBvc2UtY29sbGVjdGlvbi5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L2NvbXBvc2UvcmVzb2x2ZS1ibG9jay1zY2FsYXIuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9jb21wb3NlL3Jlc29sdmUtZmxvdy1zY2FsYXIuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9jb21wb3NlL2NvbXBvc2Utc2NhbGFyLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3QvY29tcG9zZS91dGlsLWVtcHR5LXNjYWxhci1wb3NpdGlvbi5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L2NvbXBvc2UvY29tcG9zZS1ub2RlLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3QvY29tcG9zZS9jb21wb3NlLWRvYy5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L2NvbXBvc2UvY29tcG9zZXIuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3lhbWwvZGlzdC9wYXJzZS9jc3Qtc2NhbGFyLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3QvcGFyc2UvY3N0LXN0cmluZ2lmeS5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3BhcnNlL2NzdC12aXNpdC5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3BhcnNlL2NzdC5qcyIsICIuLi9ub2RlX21vZHVsZXMveWFtbC9kaXN0L3BhcnNlL2xleGVyLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3QvcGFyc2UvbGluZS1jb3VudGVyLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3QvcGFyc2UvcGFyc2VyLmpzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3QvcHVibGljLWFwaS5qcyIsICIuLi9zcmMvZXhlY3V0aW9uL3BsYW4tcGFyc2VyLnRzIiwgIi4uL25vZGVfbW9kdWxlcy95YW1sL2Rpc3QvaW5kZXguanMiLCAiLi4vc3JjL2FnZW50cy90eXBlcy50cyIsICIuLi9zcmMvZXhlY3V0aW9uL3R5cGVzLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWwogICAgIid1c2Ugc3RyaWN0JztcblxuY29uc3QgQUxJQVMgPSBTeW1ib2wuZm9yKCd5YW1sLmFsaWFzJyk7XG5jb25zdCBET0MgPSBTeW1ib2wuZm9yKCd5YW1sLmRvY3VtZW50Jyk7XG5jb25zdCBNQVAgPSBTeW1ib2wuZm9yKCd5YW1sLm1hcCcpO1xuY29uc3QgUEFJUiA9IFN5bWJvbC5mb3IoJ3lhbWwucGFpcicpO1xuY29uc3QgU0NBTEFSID0gU3ltYm9sLmZvcigneWFtbC5zY2FsYXInKTtcbmNvbnN0IFNFUSA9IFN5bWJvbC5mb3IoJ3lhbWwuc2VxJyk7XG5jb25zdCBOT0RFX1RZUEUgPSBTeW1ib2wuZm9yKCd5YW1sLm5vZGUudHlwZScpO1xuY29uc3QgaXNBbGlhcyA9IChub2RlKSA9PiAhIW5vZGUgJiYgdHlwZW9mIG5vZGUgPT09ICdvYmplY3QnICYmIG5vZGVbTk9ERV9UWVBFXSA9PT0gQUxJQVM7XG5jb25zdCBpc0RvY3VtZW50ID0gKG5vZGUpID0+ICEhbm9kZSAmJiB0eXBlb2Ygbm9kZSA9PT0gJ29iamVjdCcgJiYgbm9kZVtOT0RFX1RZUEVdID09PSBET0M7XG5jb25zdCBpc01hcCA9IChub2RlKSA9PiAhIW5vZGUgJiYgdHlwZW9mIG5vZGUgPT09ICdvYmplY3QnICYmIG5vZGVbTk9ERV9UWVBFXSA9PT0gTUFQO1xuY29uc3QgaXNQYWlyID0gKG5vZGUpID0+ICEhbm9kZSAmJiB0eXBlb2Ygbm9kZSA9PT0gJ29iamVjdCcgJiYgbm9kZVtOT0RFX1RZUEVdID09PSBQQUlSO1xuY29uc3QgaXNTY2FsYXIgPSAobm9kZSkgPT4gISFub2RlICYmIHR5cGVvZiBub2RlID09PSAnb2JqZWN0JyAmJiBub2RlW05PREVfVFlQRV0gPT09IFNDQUxBUjtcbmNvbnN0IGlzU2VxID0gKG5vZGUpID0+ICEhbm9kZSAmJiB0eXBlb2Ygbm9kZSA9PT0gJ29iamVjdCcgJiYgbm9kZVtOT0RFX1RZUEVdID09PSBTRVE7XG5mdW5jdGlvbiBpc0NvbGxlY3Rpb24obm9kZSkge1xuICAgIGlmIChub2RlICYmIHR5cGVvZiBub2RlID09PSAnb2JqZWN0JylcbiAgICAgICAgc3dpdGNoIChub2RlW05PREVfVFlQRV0pIHtcbiAgICAgICAgICAgIGNhc2UgTUFQOlxuICAgICAgICAgICAgY2FzZSBTRVE6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5mdW5jdGlvbiBpc05vZGUobm9kZSkge1xuICAgIGlmIChub2RlICYmIHR5cGVvZiBub2RlID09PSAnb2JqZWN0JylcbiAgICAgICAgc3dpdGNoIChub2RlW05PREVfVFlQRV0pIHtcbiAgICAgICAgICAgIGNhc2UgQUxJQVM6XG4gICAgICAgICAgICBjYXNlIE1BUDpcbiAgICAgICAgICAgIGNhc2UgU0NBTEFSOlxuICAgICAgICAgICAgY2FzZSBTRVE6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5jb25zdCBoYXNBbmNob3IgPSAobm9kZSkgPT4gKGlzU2NhbGFyKG5vZGUpIHx8IGlzQ29sbGVjdGlvbihub2RlKSkgJiYgISFub2RlLmFuY2hvcjtcblxuZXhwb3J0cy5BTElBUyA9IEFMSUFTO1xuZXhwb3J0cy5ET0MgPSBET0M7XG5leHBvcnRzLk1BUCA9IE1BUDtcbmV4cG9ydHMuTk9ERV9UWVBFID0gTk9ERV9UWVBFO1xuZXhwb3J0cy5QQUlSID0gUEFJUjtcbmV4cG9ydHMuU0NBTEFSID0gU0NBTEFSO1xuZXhwb3J0cy5TRVEgPSBTRVE7XG5leHBvcnRzLmhhc0FuY2hvciA9IGhhc0FuY2hvcjtcbmV4cG9ydHMuaXNBbGlhcyA9IGlzQWxpYXM7XG5leHBvcnRzLmlzQ29sbGVjdGlvbiA9IGlzQ29sbGVjdGlvbjtcbmV4cG9ydHMuaXNEb2N1bWVudCA9IGlzRG9jdW1lbnQ7XG5leHBvcnRzLmlzTWFwID0gaXNNYXA7XG5leHBvcnRzLmlzTm9kZSA9IGlzTm9kZTtcbmV4cG9ydHMuaXNQYWlyID0gaXNQYWlyO1xuZXhwb3J0cy5pc1NjYWxhciA9IGlzU2NhbGFyO1xuZXhwb3J0cy5pc1NlcSA9IGlzU2VxO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBpZGVudGl0eSA9IHJlcXVpcmUoJy4vbm9kZXMvaWRlbnRpdHkuanMnKTtcblxuY29uc3QgQlJFQUsgPSBTeW1ib2woJ2JyZWFrIHZpc2l0Jyk7XG5jb25zdCBTS0lQID0gU3ltYm9sKCdza2lwIGNoaWxkcmVuJyk7XG5jb25zdCBSRU1PVkUgPSBTeW1ib2woJ3JlbW92ZSBub2RlJyk7XG4vKipcbiAqIEFwcGx5IGEgdmlzaXRvciB0byBhbiBBU1Qgbm9kZSBvciBkb2N1bWVudC5cbiAqXG4gKiBXYWxrcyB0aHJvdWdoIHRoZSB0cmVlIChkZXB0aC1maXJzdCkgc3RhcnRpbmcgZnJvbSBgbm9kZWAsIGNhbGxpbmcgYVxuICogYHZpc2l0b3JgIGZ1bmN0aW9uIHdpdGggdGhyZWUgYXJndW1lbnRzOlxuICogICAtIGBrZXlgOiBGb3Igc2VxdWVuY2UgdmFsdWVzIGFuZCBtYXAgYFBhaXJgLCB0aGUgbm9kZSdzIGluZGV4IGluIHRoZVxuICogICAgIGNvbGxlY3Rpb24uIFdpdGhpbiBhIGBQYWlyYCwgYCdrZXknYCBvciBgJ3ZhbHVlJ2AsIGNvcnJlc3BvbmRpbmdseS5cbiAqICAgICBgbnVsbGAgZm9yIHRoZSByb290IG5vZGUuXG4gKiAgIC0gYG5vZGVgOiBUaGUgY3VycmVudCBub2RlLlxuICogICAtIGBwYXRoYDogVGhlIGFuY2VzdHJ5IG9mIHRoZSBjdXJyZW50IG5vZGUuXG4gKlxuICogVGhlIHJldHVybiB2YWx1ZSBvZiB0aGUgdmlzaXRvciBtYXkgYmUgdXNlZCB0byBjb250cm9sIHRoZSB0cmF2ZXJzYWw6XG4gKiAgIC0gYHVuZGVmaW5lZGAgKGRlZmF1bHQpOiBEbyBub3RoaW5nIGFuZCBjb250aW51ZVxuICogICAtIGB2aXNpdC5TS0lQYDogRG8gbm90IHZpc2l0IHRoZSBjaGlsZHJlbiBvZiB0aGlzIG5vZGUsIGNvbnRpbnVlIHdpdGggbmV4dFxuICogICAgIHNpYmxpbmdcbiAqICAgLSBgdmlzaXQuQlJFQUtgOiBUZXJtaW5hdGUgdHJhdmVyc2FsIGNvbXBsZXRlbHlcbiAqICAgLSBgdmlzaXQuUkVNT1ZFYDogUmVtb3ZlIHRoZSBjdXJyZW50IG5vZGUsIHRoZW4gY29udGludWUgd2l0aCB0aGUgbmV4dCBvbmVcbiAqICAgLSBgTm9kZWA6IFJlcGxhY2UgdGhlIGN1cnJlbnQgbm9kZSwgdGhlbiBjb250aW51ZSBieSB2aXNpdGluZyBpdFxuICogICAtIGBudW1iZXJgOiBXaGlsZSBpdGVyYXRpbmcgdGhlIGl0ZW1zIG9mIGEgc2VxdWVuY2Ugb3IgbWFwLCBzZXQgdGhlIGluZGV4XG4gKiAgICAgb2YgdGhlIG5leHQgc3RlcC4gVGhpcyBpcyB1c2VmdWwgZXNwZWNpYWxseSBpZiB0aGUgaW5kZXggb2YgdGhlIGN1cnJlbnRcbiAqICAgICBub2RlIGhhcyBjaGFuZ2VkLlxuICpcbiAqIElmIGB2aXNpdG9yYCBpcyBhIHNpbmdsZSBmdW5jdGlvbiwgaXQgd2lsbCBiZSBjYWxsZWQgd2l0aCBhbGwgdmFsdWVzXG4gKiBlbmNvdW50ZXJlZCBpbiB0aGUgdHJlZSwgaW5jbHVkaW5nIGUuZy4gYG51bGxgIHZhbHVlcy4gQWx0ZXJuYXRpdmVseSxcbiAqIHNlcGFyYXRlIHZpc2l0b3IgZnVuY3Rpb25zIG1heSBiZSBkZWZpbmVkIGZvciBlYWNoIGBNYXBgLCBgUGFpcmAsIGBTZXFgLFxuICogYEFsaWFzYCBhbmQgYFNjYWxhcmAgbm9kZS4gVG8gZGVmaW5lIHRoZSBzYW1lIHZpc2l0b3IgZnVuY3Rpb24gZm9yIG1vcmUgdGhhblxuICogb25lIG5vZGUgdHlwZSwgdXNlIHRoZSBgQ29sbGVjdGlvbmAgKG1hcCBhbmQgc2VxKSwgYFZhbHVlYCAobWFwLCBzZXEgJiBzY2FsYXIpXG4gKiBhbmQgYE5vZGVgIChhbGlhcywgbWFwLCBzZXEgJiBzY2FsYXIpIHRhcmdldHMuIE9mIGFsbCB0aGVzZSwgb25seSB0aGUgbW9zdFxuICogc3BlY2lmaWMgZGVmaW5lZCBvbmUgd2lsbCBiZSB1c2VkIGZvciBlYWNoIG5vZGUuXG4gKi9cbmZ1bmN0aW9uIHZpc2l0KG5vZGUsIHZpc2l0b3IpIHtcbiAgICBjb25zdCB2aXNpdG9yXyA9IGluaXRWaXNpdG9yKHZpc2l0b3IpO1xuICAgIGlmIChpZGVudGl0eS5pc0RvY3VtZW50KG5vZGUpKSB7XG4gICAgICAgIGNvbnN0IGNkID0gdmlzaXRfKG51bGwsIG5vZGUuY29udGVudHMsIHZpc2l0b3JfLCBPYmplY3QuZnJlZXplKFtub2RlXSkpO1xuICAgICAgICBpZiAoY2QgPT09IFJFTU9WRSlcbiAgICAgICAgICAgIG5vZGUuY29udGVudHMgPSBudWxsO1xuICAgIH1cbiAgICBlbHNlXG4gICAgICAgIHZpc2l0XyhudWxsLCBub2RlLCB2aXNpdG9yXywgT2JqZWN0LmZyZWV6ZShbXSkpO1xufVxuLy8gV2l0aG91dCB0aGUgYGFzIHN5bWJvbGAgY2FzdHMsIFRTIGRlY2xhcmVzIHRoZXNlIGluIHRoZSBgdmlzaXRgXG4vLyBuYW1lc3BhY2UgdXNpbmcgYHZhcmAsIGJ1dCB0aGVuIGNvbXBsYWlucyBhYm91dCB0aGF0IGJlY2F1c2Vcbi8vIGB1bmlxdWUgc3ltYm9sYCBtdXN0IGJlIGBjb25zdGAuXG4vKiogVGVybWluYXRlIHZpc2l0IHRyYXZlcnNhbCBjb21wbGV0ZWx5ICovXG52aXNpdC5CUkVBSyA9IEJSRUFLO1xuLyoqIERvIG5vdCB2aXNpdCB0aGUgY2hpbGRyZW4gb2YgdGhlIGN1cnJlbnQgbm9kZSAqL1xudmlzaXQuU0tJUCA9IFNLSVA7XG4vKiogUmVtb3ZlIHRoZSBjdXJyZW50IG5vZGUgKi9cbnZpc2l0LlJFTU9WRSA9IFJFTU9WRTtcbmZ1bmN0aW9uIHZpc2l0XyhrZXksIG5vZGUsIHZpc2l0b3IsIHBhdGgpIHtcbiAgICBjb25zdCBjdHJsID0gY2FsbFZpc2l0b3Ioa2V5LCBub2RlLCB2aXNpdG9yLCBwYXRoKTtcbiAgICBpZiAoaWRlbnRpdHkuaXNOb2RlKGN0cmwpIHx8IGlkZW50aXR5LmlzUGFpcihjdHJsKSkge1xuICAgICAgICByZXBsYWNlTm9kZShrZXksIHBhdGgsIGN0cmwpO1xuICAgICAgICByZXR1cm4gdmlzaXRfKGtleSwgY3RybCwgdmlzaXRvciwgcGF0aCk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgY3RybCAhPT0gJ3N5bWJvbCcpIHtcbiAgICAgICAgaWYgKGlkZW50aXR5LmlzQ29sbGVjdGlvbihub2RlKSkge1xuICAgICAgICAgICAgcGF0aCA9IE9iamVjdC5mcmVlemUocGF0aC5jb25jYXQobm9kZSkpO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2RlLml0ZW1zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2kgPSB2aXNpdF8oaSwgbm9kZS5pdGVtc1tpXSwgdmlzaXRvciwgcGF0aCk7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjaSA9PT0gJ251bWJlcicpXG4gICAgICAgICAgICAgICAgICAgIGkgPSBjaSAtIDE7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoY2kgPT09IEJSRUFLKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQlJFQUs7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoY2kgPT09IFJFTU9WRSkge1xuICAgICAgICAgICAgICAgICAgICBub2RlLml0ZW1zLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgaSAtPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpZGVudGl0eS5pc1BhaXIobm9kZSkpIHtcbiAgICAgICAgICAgIHBhdGggPSBPYmplY3QuZnJlZXplKHBhdGguY29uY2F0KG5vZGUpKTtcbiAgICAgICAgICAgIGNvbnN0IGNrID0gdmlzaXRfKCdrZXknLCBub2RlLmtleSwgdmlzaXRvciwgcGF0aCk7XG4gICAgICAgICAgICBpZiAoY2sgPT09IEJSRUFLKVxuICAgICAgICAgICAgICAgIHJldHVybiBCUkVBSztcbiAgICAgICAgICAgIGVsc2UgaWYgKGNrID09PSBSRU1PVkUpXG4gICAgICAgICAgICAgICAgbm9kZS5rZXkgPSBudWxsO1xuICAgICAgICAgICAgY29uc3QgY3YgPSB2aXNpdF8oJ3ZhbHVlJywgbm9kZS52YWx1ZSwgdmlzaXRvciwgcGF0aCk7XG4gICAgICAgICAgICBpZiAoY3YgPT09IEJSRUFLKVxuICAgICAgICAgICAgICAgIHJldHVybiBCUkVBSztcbiAgICAgICAgICAgIGVsc2UgaWYgKGN2ID09PSBSRU1PVkUpXG4gICAgICAgICAgICAgICAgbm9kZS52YWx1ZSA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGN0cmw7XG59XG4vKipcbiAqIEFwcGx5IGFuIGFzeW5jIHZpc2l0b3IgdG8gYW4gQVNUIG5vZGUgb3IgZG9jdW1lbnQuXG4gKlxuICogV2Fsa3MgdGhyb3VnaCB0aGUgdHJlZSAoZGVwdGgtZmlyc3QpIHN0YXJ0aW5nIGZyb20gYG5vZGVgLCBjYWxsaW5nIGFcbiAqIGB2aXNpdG9yYCBmdW5jdGlvbiB3aXRoIHRocmVlIGFyZ3VtZW50czpcbiAqICAgLSBga2V5YDogRm9yIHNlcXVlbmNlIHZhbHVlcyBhbmQgbWFwIGBQYWlyYCwgdGhlIG5vZGUncyBpbmRleCBpbiB0aGVcbiAqICAgICBjb2xsZWN0aW9uLiBXaXRoaW4gYSBgUGFpcmAsIGAna2V5J2Agb3IgYCd2YWx1ZSdgLCBjb3JyZXNwb25kaW5nbHkuXG4gKiAgICAgYG51bGxgIGZvciB0aGUgcm9vdCBub2RlLlxuICogICAtIGBub2RlYDogVGhlIGN1cnJlbnQgbm9kZS5cbiAqICAgLSBgcGF0aGA6IFRoZSBhbmNlc3RyeSBvZiB0aGUgY3VycmVudCBub2RlLlxuICpcbiAqIFRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIHZpc2l0b3IgbWF5IGJlIHVzZWQgdG8gY29udHJvbCB0aGUgdHJhdmVyc2FsOlxuICogICAtIGBQcm9taXNlYDogTXVzdCByZXNvbHZlIHRvIG9uZSBvZiB0aGUgZm9sbG93aW5nIHZhbHVlc1xuICogICAtIGB1bmRlZmluZWRgIChkZWZhdWx0KTogRG8gbm90aGluZyBhbmQgY29udGludWVcbiAqICAgLSBgdmlzaXQuU0tJUGA6IERvIG5vdCB2aXNpdCB0aGUgY2hpbGRyZW4gb2YgdGhpcyBub2RlLCBjb250aW51ZSB3aXRoIG5leHRcbiAqICAgICBzaWJsaW5nXG4gKiAgIC0gYHZpc2l0LkJSRUFLYDogVGVybWluYXRlIHRyYXZlcnNhbCBjb21wbGV0ZWx5XG4gKiAgIC0gYHZpc2l0LlJFTU9WRWA6IFJlbW92ZSB0aGUgY3VycmVudCBub2RlLCB0aGVuIGNvbnRpbnVlIHdpdGggdGhlIG5leHQgb25lXG4gKiAgIC0gYE5vZGVgOiBSZXBsYWNlIHRoZSBjdXJyZW50IG5vZGUsIHRoZW4gY29udGludWUgYnkgdmlzaXRpbmcgaXRcbiAqICAgLSBgbnVtYmVyYDogV2hpbGUgaXRlcmF0aW5nIHRoZSBpdGVtcyBvZiBhIHNlcXVlbmNlIG9yIG1hcCwgc2V0IHRoZSBpbmRleFxuICogICAgIG9mIHRoZSBuZXh0IHN0ZXAuIFRoaXMgaXMgdXNlZnVsIGVzcGVjaWFsbHkgaWYgdGhlIGluZGV4IG9mIHRoZSBjdXJyZW50XG4gKiAgICAgbm9kZSBoYXMgY2hhbmdlZC5cbiAqXG4gKiBJZiBgdmlzaXRvcmAgaXMgYSBzaW5nbGUgZnVuY3Rpb24sIGl0IHdpbGwgYmUgY2FsbGVkIHdpdGggYWxsIHZhbHVlc1xuICogZW5jb3VudGVyZWQgaW4gdGhlIHRyZWUsIGluY2x1ZGluZyBlLmcuIGBudWxsYCB2YWx1ZXMuIEFsdGVybmF0aXZlbHksXG4gKiBzZXBhcmF0ZSB2aXNpdG9yIGZ1bmN0aW9ucyBtYXkgYmUgZGVmaW5lZCBmb3IgZWFjaCBgTWFwYCwgYFBhaXJgLCBgU2VxYCxcbiAqIGBBbGlhc2AgYW5kIGBTY2FsYXJgIG5vZGUuIFRvIGRlZmluZSB0aGUgc2FtZSB2aXNpdG9yIGZ1bmN0aW9uIGZvciBtb3JlIHRoYW5cbiAqIG9uZSBub2RlIHR5cGUsIHVzZSB0aGUgYENvbGxlY3Rpb25gIChtYXAgYW5kIHNlcSksIGBWYWx1ZWAgKG1hcCwgc2VxICYgc2NhbGFyKVxuICogYW5kIGBOb2RlYCAoYWxpYXMsIG1hcCwgc2VxICYgc2NhbGFyKSB0YXJnZXRzLiBPZiBhbGwgdGhlc2UsIG9ubHkgdGhlIG1vc3RcbiAqIHNwZWNpZmljIGRlZmluZWQgb25lIHdpbGwgYmUgdXNlZCBmb3IgZWFjaCBub2RlLlxuICovXG5hc3luYyBmdW5jdGlvbiB2aXNpdEFzeW5jKG5vZGUsIHZpc2l0b3IpIHtcbiAgICBjb25zdCB2aXNpdG9yXyA9IGluaXRWaXNpdG9yKHZpc2l0b3IpO1xuICAgIGlmIChpZGVudGl0eS5pc0RvY3VtZW50KG5vZGUpKSB7XG4gICAgICAgIGNvbnN0IGNkID0gYXdhaXQgdmlzaXRBc3luY18obnVsbCwgbm9kZS5jb250ZW50cywgdmlzaXRvcl8sIE9iamVjdC5mcmVlemUoW25vZGVdKSk7XG4gICAgICAgIGlmIChjZCA9PT0gUkVNT1ZFKVxuICAgICAgICAgICAgbm9kZS5jb250ZW50cyA9IG51bGw7XG4gICAgfVxuICAgIGVsc2VcbiAgICAgICAgYXdhaXQgdmlzaXRBc3luY18obnVsbCwgbm9kZSwgdmlzaXRvcl8sIE9iamVjdC5mcmVlemUoW10pKTtcbn1cbi8vIFdpdGhvdXQgdGhlIGBhcyBzeW1ib2xgIGNhc3RzLCBUUyBkZWNsYXJlcyB0aGVzZSBpbiB0aGUgYHZpc2l0YFxuLy8gbmFtZXNwYWNlIHVzaW5nIGB2YXJgLCBidXQgdGhlbiBjb21wbGFpbnMgYWJvdXQgdGhhdCBiZWNhdXNlXG4vLyBgdW5pcXVlIHN5bWJvbGAgbXVzdCBiZSBgY29uc3RgLlxuLyoqIFRlcm1pbmF0ZSB2aXNpdCB0cmF2ZXJzYWwgY29tcGxldGVseSAqL1xudmlzaXRBc3luYy5CUkVBSyA9IEJSRUFLO1xuLyoqIERvIG5vdCB2aXNpdCB0aGUgY2hpbGRyZW4gb2YgdGhlIGN1cnJlbnQgbm9kZSAqL1xudmlzaXRBc3luYy5TS0lQID0gU0tJUDtcbi8qKiBSZW1vdmUgdGhlIGN1cnJlbnQgbm9kZSAqL1xudmlzaXRBc3luYy5SRU1PVkUgPSBSRU1PVkU7XG5hc3luYyBmdW5jdGlvbiB2aXNpdEFzeW5jXyhrZXksIG5vZGUsIHZpc2l0b3IsIHBhdGgpIHtcbiAgICBjb25zdCBjdHJsID0gYXdhaXQgY2FsbFZpc2l0b3Ioa2V5LCBub2RlLCB2aXNpdG9yLCBwYXRoKTtcbiAgICBpZiAoaWRlbnRpdHkuaXNOb2RlKGN0cmwpIHx8IGlkZW50aXR5LmlzUGFpcihjdHJsKSkge1xuICAgICAgICByZXBsYWNlTm9kZShrZXksIHBhdGgsIGN0cmwpO1xuICAgICAgICByZXR1cm4gdmlzaXRBc3luY18oa2V5LCBjdHJsLCB2aXNpdG9yLCBwYXRoKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBjdHJsICE9PSAnc3ltYm9sJykge1xuICAgICAgICBpZiAoaWRlbnRpdHkuaXNDb2xsZWN0aW9uKG5vZGUpKSB7XG4gICAgICAgICAgICBwYXRoID0gT2JqZWN0LmZyZWV6ZShwYXRoLmNvbmNhdChub2RlKSk7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGUuaXRlbXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjaSA9IGF3YWl0IHZpc2l0QXN5bmNfKGksIG5vZGUuaXRlbXNbaV0sIHZpc2l0b3IsIHBhdGgpO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY2kgPT09ICdudW1iZXInKVxuICAgICAgICAgICAgICAgICAgICBpID0gY2kgLSAxO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNpID09PSBCUkVBSylcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEJSRUFLO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNpID09PSBSRU1PVkUpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5pdGVtcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGkgLT0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaWRlbnRpdHkuaXNQYWlyKG5vZGUpKSB7XG4gICAgICAgICAgICBwYXRoID0gT2JqZWN0LmZyZWV6ZShwYXRoLmNvbmNhdChub2RlKSk7XG4gICAgICAgICAgICBjb25zdCBjayA9IGF3YWl0IHZpc2l0QXN5bmNfKCdrZXknLCBub2RlLmtleSwgdmlzaXRvciwgcGF0aCk7XG4gICAgICAgICAgICBpZiAoY2sgPT09IEJSRUFLKVxuICAgICAgICAgICAgICAgIHJldHVybiBCUkVBSztcbiAgICAgICAgICAgIGVsc2UgaWYgKGNrID09PSBSRU1PVkUpXG4gICAgICAgICAgICAgICAgbm9kZS5rZXkgPSBudWxsO1xuICAgICAgICAgICAgY29uc3QgY3YgPSBhd2FpdCB2aXNpdEFzeW5jXygndmFsdWUnLCBub2RlLnZhbHVlLCB2aXNpdG9yLCBwYXRoKTtcbiAgICAgICAgICAgIGlmIChjdiA9PT0gQlJFQUspXG4gICAgICAgICAgICAgICAgcmV0dXJuIEJSRUFLO1xuICAgICAgICAgICAgZWxzZSBpZiAoY3YgPT09IFJFTU9WRSlcbiAgICAgICAgICAgICAgICBub2RlLnZhbHVlID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY3RybDtcbn1cbmZ1bmN0aW9uIGluaXRWaXNpdG9yKHZpc2l0b3IpIHtcbiAgICBpZiAodHlwZW9mIHZpc2l0b3IgPT09ICdvYmplY3QnICYmXG4gICAgICAgICh2aXNpdG9yLkNvbGxlY3Rpb24gfHwgdmlzaXRvci5Ob2RlIHx8IHZpc2l0b3IuVmFsdWUpKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgIEFsaWFzOiB2aXNpdG9yLk5vZGUsXG4gICAgICAgICAgICBNYXA6IHZpc2l0b3IuTm9kZSxcbiAgICAgICAgICAgIFNjYWxhcjogdmlzaXRvci5Ob2RlLFxuICAgICAgICAgICAgU2VxOiB2aXNpdG9yLk5vZGVcbiAgICAgICAgfSwgdmlzaXRvci5WYWx1ZSAmJiB7XG4gICAgICAgICAgICBNYXA6IHZpc2l0b3IuVmFsdWUsXG4gICAgICAgICAgICBTY2FsYXI6IHZpc2l0b3IuVmFsdWUsXG4gICAgICAgICAgICBTZXE6IHZpc2l0b3IuVmFsdWVcbiAgICAgICAgfSwgdmlzaXRvci5Db2xsZWN0aW9uICYmIHtcbiAgICAgICAgICAgIE1hcDogdmlzaXRvci5Db2xsZWN0aW9uLFxuICAgICAgICAgICAgU2VxOiB2aXNpdG9yLkNvbGxlY3Rpb25cbiAgICAgICAgfSwgdmlzaXRvcik7XG4gICAgfVxuICAgIHJldHVybiB2aXNpdG9yO1xufVxuZnVuY3Rpb24gY2FsbFZpc2l0b3Ioa2V5LCBub2RlLCB2aXNpdG9yLCBwYXRoKSB7XG4gICAgaWYgKHR5cGVvZiB2aXNpdG9yID09PSAnZnVuY3Rpb24nKVxuICAgICAgICByZXR1cm4gdmlzaXRvcihrZXksIG5vZGUsIHBhdGgpO1xuICAgIGlmIChpZGVudGl0eS5pc01hcChub2RlKSlcbiAgICAgICAgcmV0dXJuIHZpc2l0b3IuTWFwPy4oa2V5LCBub2RlLCBwYXRoKTtcbiAgICBpZiAoaWRlbnRpdHkuaXNTZXEobm9kZSkpXG4gICAgICAgIHJldHVybiB2aXNpdG9yLlNlcT8uKGtleSwgbm9kZSwgcGF0aCk7XG4gICAgaWYgKGlkZW50aXR5LmlzUGFpcihub2RlKSlcbiAgICAgICAgcmV0dXJuIHZpc2l0b3IuUGFpcj8uKGtleSwgbm9kZSwgcGF0aCk7XG4gICAgaWYgKGlkZW50aXR5LmlzU2NhbGFyKG5vZGUpKVxuICAgICAgICByZXR1cm4gdmlzaXRvci5TY2FsYXI/LihrZXksIG5vZGUsIHBhdGgpO1xuICAgIGlmIChpZGVudGl0eS5pc0FsaWFzKG5vZGUpKVxuICAgICAgICByZXR1cm4gdmlzaXRvci5BbGlhcz8uKGtleSwgbm9kZSwgcGF0aCk7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cbmZ1bmN0aW9uIHJlcGxhY2VOb2RlKGtleSwgcGF0aCwgbm9kZSkge1xuICAgIGNvbnN0IHBhcmVudCA9IHBhdGhbcGF0aC5sZW5ndGggLSAxXTtcbiAgICBpZiAoaWRlbnRpdHkuaXNDb2xsZWN0aW9uKHBhcmVudCkpIHtcbiAgICAgICAgcGFyZW50Lml0ZW1zW2tleV0gPSBub2RlO1xuICAgIH1cbiAgICBlbHNlIGlmIChpZGVudGl0eS5pc1BhaXIocGFyZW50KSkge1xuICAgICAgICBpZiAoa2V5ID09PSAna2V5JylcbiAgICAgICAgICAgIHBhcmVudC5rZXkgPSBub2RlO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBwYXJlbnQudmFsdWUgPSBub2RlO1xuICAgIH1cbiAgICBlbHNlIGlmIChpZGVudGl0eS5pc0RvY3VtZW50KHBhcmVudCkpIHtcbiAgICAgICAgcGFyZW50LmNvbnRlbnRzID0gbm9kZTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNvbnN0IHB0ID0gaWRlbnRpdHkuaXNBbGlhcyhwYXJlbnQpID8gJ2FsaWFzJyA6ICdzY2FsYXInO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCByZXBsYWNlIG5vZGUgd2l0aCAke3B0fSBwYXJlbnRgKTtcbiAgICB9XG59XG5cbmV4cG9ydHMudmlzaXQgPSB2aXNpdDtcbmV4cG9ydHMudmlzaXRBc3luYyA9IHZpc2l0QXN5bmM7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIGlkZW50aXR5ID0gcmVxdWlyZSgnLi4vbm9kZXMvaWRlbnRpdHkuanMnKTtcbnZhciB2aXNpdCA9IHJlcXVpcmUoJy4uL3Zpc2l0LmpzJyk7XG5cbmNvbnN0IGVzY2FwZUNoYXJzID0ge1xuICAgICchJzogJyUyMScsXG4gICAgJywnOiAnJTJDJyxcbiAgICAnWyc6ICclNUInLFxuICAgICddJzogJyU1RCcsXG4gICAgJ3snOiAnJTdCJyxcbiAgICAnfSc6ICclN0QnXG59O1xuY29uc3QgZXNjYXBlVGFnTmFtZSA9ICh0bikgPT4gdG4ucmVwbGFjZSgvWyEsW1xcXXt9XS9nLCBjaCA9PiBlc2NhcGVDaGFyc1tjaF0pO1xuY2xhc3MgRGlyZWN0aXZlcyB7XG4gICAgY29uc3RydWN0b3IoeWFtbCwgdGFncykge1xuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIGRpcmVjdGl2ZXMtZW5kL2RvYy1zdGFydCBtYXJrZXIgYC0tLWAuIElmIGBudWxsYCwgYSBtYXJrZXIgbWF5IHN0aWxsIGJlXG4gICAgICAgICAqIGluY2x1ZGVkIGluIHRoZSBkb2N1bWVudCdzIHN0cmluZ2lmaWVkIHJlcHJlc2VudGF0aW9uLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5kb2NTdGFydCA9IG51bGw7XG4gICAgICAgIC8qKiBUaGUgZG9jLWVuZCBtYXJrZXIgYC4uLmAuICAqL1xuICAgICAgICB0aGlzLmRvY0VuZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnlhbWwgPSBPYmplY3QuYXNzaWduKHt9LCBEaXJlY3RpdmVzLmRlZmF1bHRZYW1sLCB5YW1sKTtcbiAgICAgICAgdGhpcy50YWdzID0gT2JqZWN0LmFzc2lnbih7fSwgRGlyZWN0aXZlcy5kZWZhdWx0VGFncywgdGFncyk7XG4gICAgfVxuICAgIGNsb25lKCkge1xuICAgICAgICBjb25zdCBjb3B5ID0gbmV3IERpcmVjdGl2ZXModGhpcy55YW1sLCB0aGlzLnRhZ3MpO1xuICAgICAgICBjb3B5LmRvY1N0YXJ0ID0gdGhpcy5kb2NTdGFydDtcbiAgICAgICAgcmV0dXJuIGNvcHk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIER1cmluZyBwYXJzaW5nLCBnZXQgYSBEaXJlY3RpdmVzIGluc3RhbmNlIGZvciB0aGUgY3VycmVudCBkb2N1bWVudCBhbmRcbiAgICAgKiB1cGRhdGUgdGhlIHN0cmVhbSBzdGF0ZSBhY2NvcmRpbmcgdG8gdGhlIGN1cnJlbnQgdmVyc2lvbidzIHNwZWMuXG4gICAgICovXG4gICAgYXREb2N1bWVudCgpIHtcbiAgICAgICAgY29uc3QgcmVzID0gbmV3IERpcmVjdGl2ZXModGhpcy55YW1sLCB0aGlzLnRhZ3MpO1xuICAgICAgICBzd2l0Y2ggKHRoaXMueWFtbC52ZXJzaW9uKSB7XG4gICAgICAgICAgICBjYXNlICcxLjEnOlxuICAgICAgICAgICAgICAgIHRoaXMuYXROZXh0RG9jdW1lbnQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnMS4yJzpcbiAgICAgICAgICAgICAgICB0aGlzLmF0TmV4dERvY3VtZW50ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy55YW1sID0ge1xuICAgICAgICAgICAgICAgICAgICBleHBsaWNpdDogRGlyZWN0aXZlcy5kZWZhdWx0WWFtbC5leHBsaWNpdCxcbiAgICAgICAgICAgICAgICAgICAgdmVyc2lvbjogJzEuMidcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMudGFncyA9IE9iamVjdC5hc3NpZ24oe30sIERpcmVjdGl2ZXMuZGVmYXVsdFRhZ3MpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEBwYXJhbSBvbkVycm9yIC0gTWF5IGJlIGNhbGxlZCBldmVuIGlmIHRoZSBhY3Rpb24gd2FzIHN1Y2Nlc3NmdWxcbiAgICAgKiBAcmV0dXJucyBgdHJ1ZWAgb24gc3VjY2Vzc1xuICAgICAqL1xuICAgIGFkZChsaW5lLCBvbkVycm9yKSB7XG4gICAgICAgIGlmICh0aGlzLmF0TmV4dERvY3VtZW50KSB7XG4gICAgICAgICAgICB0aGlzLnlhbWwgPSB7IGV4cGxpY2l0OiBEaXJlY3RpdmVzLmRlZmF1bHRZYW1sLmV4cGxpY2l0LCB2ZXJzaW9uOiAnMS4xJyB9O1xuICAgICAgICAgICAgdGhpcy50YWdzID0gT2JqZWN0LmFzc2lnbih7fSwgRGlyZWN0aXZlcy5kZWZhdWx0VGFncyk7XG4gICAgICAgICAgICB0aGlzLmF0TmV4dERvY3VtZW50ID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcGFydHMgPSBsaW5lLnRyaW0oKS5zcGxpdCgvWyBcXHRdKy8pO1xuICAgICAgICBjb25zdCBuYW1lID0gcGFydHMuc2hpZnQoKTtcbiAgICAgICAgc3dpdGNoIChuYW1lKSB7XG4gICAgICAgICAgICBjYXNlICclVEFHJzoge1xuICAgICAgICAgICAgICAgIGlmIChwYXJ0cy5sZW5ndGggIT09IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcigwLCAnJVRBRyBkaXJlY3RpdmUgc2hvdWxkIGNvbnRhaW4gZXhhY3RseSB0d28gcGFydHMnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA8IDIpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IFtoYW5kbGUsIHByZWZpeF0gPSBwYXJ0cztcbiAgICAgICAgICAgICAgICB0aGlzLnRhZ3NbaGFuZGxlXSA9IHByZWZpeDtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgJyVZQU1MJzoge1xuICAgICAgICAgICAgICAgIHRoaXMueWFtbC5leHBsaWNpdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCAhPT0gMSkge1xuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKDAsICclWUFNTCBkaXJlY3RpdmUgc2hvdWxkIGNvbnRhaW4gZXhhY3RseSBvbmUgcGFydCcpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IFt2ZXJzaW9uXSA9IHBhcnRzO1xuICAgICAgICAgICAgICAgIGlmICh2ZXJzaW9uID09PSAnMS4xJyB8fCB2ZXJzaW9uID09PSAnMS4yJykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnlhbWwudmVyc2lvbiA9IHZlcnNpb247XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaXNWYWxpZCA9IC9eXFxkK1xcLlxcZCskLy50ZXN0KHZlcnNpb24pO1xuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKDYsIGBVbnN1cHBvcnRlZCBZQU1MIHZlcnNpb24gJHt2ZXJzaW9ufWAsIGlzVmFsaWQpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBvbkVycm9yKDAsIGBVbmtub3duIGRpcmVjdGl2ZSAke25hbWV9YCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlc29sdmVzIGEgdGFnLCBtYXRjaGluZyBoYW5kbGVzIHRvIHRob3NlIGRlZmluZWQgaW4gJVRBRyBkaXJlY3RpdmVzLlxuICAgICAqXG4gICAgICogQHJldHVybnMgUmVzb2x2ZWQgdGFnLCB3aGljaCBtYXkgYWxzbyBiZSB0aGUgbm9uLXNwZWNpZmljIHRhZyBgJyEnYCBvciBhXG4gICAgICogICBgJyFsb2NhbCdgIHRhZywgb3IgYG51bGxgIGlmIHVucmVzb2x2YWJsZS5cbiAgICAgKi9cbiAgICB0YWdOYW1lKHNvdXJjZSwgb25FcnJvcikge1xuICAgICAgICBpZiAoc291cmNlID09PSAnIScpXG4gICAgICAgICAgICByZXR1cm4gJyEnOyAvLyBub24tc3BlY2lmaWMgdGFnXG4gICAgICAgIGlmIChzb3VyY2VbMF0gIT09ICchJykge1xuICAgICAgICAgICAgb25FcnJvcihgTm90IGEgdmFsaWQgdGFnOiAke3NvdXJjZX1gKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzb3VyY2VbMV0gPT09ICc8Jykge1xuICAgICAgICAgICAgY29uc3QgdmVyYmF0aW0gPSBzb3VyY2Uuc2xpY2UoMiwgLTEpO1xuICAgICAgICAgICAgaWYgKHZlcmJhdGltID09PSAnIScgfHwgdmVyYmF0aW0gPT09ICchIScpIHtcbiAgICAgICAgICAgICAgICBvbkVycm9yKGBWZXJiYXRpbSB0YWdzIGFyZW4ndCByZXNvbHZlZCwgc28gJHtzb3VyY2V9IGlzIGludmFsaWQuYCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc291cmNlW3NvdXJjZS5sZW5ndGggLSAxXSAhPT0gJz4nKVxuICAgICAgICAgICAgICAgIG9uRXJyb3IoJ1ZlcmJhdGltIHRhZ3MgbXVzdCBlbmQgd2l0aCBhID4nKTtcbiAgICAgICAgICAgIHJldHVybiB2ZXJiYXRpbTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBbLCBoYW5kbGUsIHN1ZmZpeF0gPSBzb3VyY2UubWF0Y2goL14oLiohKShbXiFdKikkL3MpO1xuICAgICAgICBpZiAoIXN1ZmZpeClcbiAgICAgICAgICAgIG9uRXJyb3IoYFRoZSAke3NvdXJjZX0gdGFnIGhhcyBubyBzdWZmaXhgKTtcbiAgICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy50YWdzW2hhbmRsZV07XG4gICAgICAgIGlmIChwcmVmaXgpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByZWZpeCArIGRlY29kZVVSSUNvbXBvbmVudChzdWZmaXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgb25FcnJvcihTdHJpbmcoZXJyb3IpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoaGFuZGxlID09PSAnIScpXG4gICAgICAgICAgICByZXR1cm4gc291cmNlOyAvLyBsb2NhbCB0YWdcbiAgICAgICAgb25FcnJvcihgQ291bGQgbm90IHJlc29sdmUgdGFnOiAke3NvdXJjZX1gKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdpdmVuIGEgZnVsbHkgcmVzb2x2ZWQgdGFnLCByZXR1cm5zIGl0cyBwcmludGFibGUgc3RyaW5nIGZvcm0sXG4gICAgICogdGFraW5nIGludG8gYWNjb3VudCBjdXJyZW50IHRhZyBwcmVmaXhlcyBhbmQgZGVmYXVsdHMuXG4gICAgICovXG4gICAgdGFnU3RyaW5nKHRhZykge1xuICAgICAgICBmb3IgKGNvbnN0IFtoYW5kbGUsIHByZWZpeF0gb2YgT2JqZWN0LmVudHJpZXModGhpcy50YWdzKSkge1xuICAgICAgICAgICAgaWYgKHRhZy5zdGFydHNXaXRoKHByZWZpeCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZSArIGVzY2FwZVRhZ05hbWUodGFnLnN1YnN0cmluZyhwcmVmaXgubGVuZ3RoKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRhZ1swXSA9PT0gJyEnID8gdGFnIDogYCE8JHt0YWd9PmA7XG4gICAgfVxuICAgIHRvU3RyaW5nKGRvYykge1xuICAgICAgICBjb25zdCBsaW5lcyA9IHRoaXMueWFtbC5leHBsaWNpdFxuICAgICAgICAgICAgPyBbYCVZQU1MICR7dGhpcy55YW1sLnZlcnNpb24gfHwgJzEuMid9YF1cbiAgICAgICAgICAgIDogW107XG4gICAgICAgIGNvbnN0IHRhZ0VudHJpZXMgPSBPYmplY3QuZW50cmllcyh0aGlzLnRhZ3MpO1xuICAgICAgICBsZXQgdGFnTmFtZXM7XG4gICAgICAgIGlmIChkb2MgJiYgdGFnRW50cmllcy5sZW5ndGggPiAwICYmIGlkZW50aXR5LmlzTm9kZShkb2MuY29udGVudHMpKSB7XG4gICAgICAgICAgICBjb25zdCB0YWdzID0ge307XG4gICAgICAgICAgICB2aXNpdC52aXNpdChkb2MuY29udGVudHMsIChfa2V5LCBub2RlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGlkZW50aXR5LmlzTm9kZShub2RlKSAmJiBub2RlLnRhZylcbiAgICAgICAgICAgICAgICAgICAgdGFnc1tub2RlLnRhZ10gPSB0cnVlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0YWdOYW1lcyA9IE9iamVjdC5rZXlzKHRhZ3MpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRhZ05hbWVzID0gW107XG4gICAgICAgIGZvciAoY29uc3QgW2hhbmRsZSwgcHJlZml4XSBvZiB0YWdFbnRyaWVzKSB7XG4gICAgICAgICAgICBpZiAoaGFuZGxlID09PSAnISEnICYmIHByZWZpeCA9PT0gJ3RhZzp5YW1sLm9yZywyMDAyOicpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICBpZiAoIWRvYyB8fCB0YWdOYW1lcy5zb21lKHRuID0+IHRuLnN0YXJ0c1dpdGgocHJlZml4KSkpXG4gICAgICAgICAgICAgICAgbGluZXMucHVzaChgJVRBRyAke2hhbmRsZX0gJHtwcmVmaXh9YCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpO1xuICAgIH1cbn1cbkRpcmVjdGl2ZXMuZGVmYXVsdFlhbWwgPSB7IGV4cGxpY2l0OiBmYWxzZSwgdmVyc2lvbjogJzEuMicgfTtcbkRpcmVjdGl2ZXMuZGVmYXVsdFRhZ3MgPSB7ICchISc6ICd0YWc6eWFtbC5vcmcsMjAwMjonIH07XG5cbmV4cG9ydHMuRGlyZWN0aXZlcyA9IERpcmVjdGl2ZXM7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIGlkZW50aXR5ID0gcmVxdWlyZSgnLi4vbm9kZXMvaWRlbnRpdHkuanMnKTtcbnZhciB2aXNpdCA9IHJlcXVpcmUoJy4uL3Zpc2l0LmpzJyk7XG5cbi8qKlxuICogVmVyaWZ5IHRoYXQgdGhlIGlucHV0IHN0cmluZyBpcyBhIHZhbGlkIGFuY2hvci5cbiAqXG4gKiBXaWxsIHRocm93IG9uIGVycm9ycy5cbiAqL1xuZnVuY3Rpb24gYW5jaG9ySXNWYWxpZChhbmNob3IpIHtcbiAgICBpZiAoL1tcXHgwMC1cXHgxOVxccyxbXFxde31dLy50ZXN0KGFuY2hvcikpIHtcbiAgICAgICAgY29uc3Qgc2EgPSBKU09OLnN0cmluZ2lmeShhbmNob3IpO1xuICAgICAgICBjb25zdCBtc2cgPSBgQW5jaG9yIG11c3Qgbm90IGNvbnRhaW4gd2hpdGVzcGFjZSBvciBjb250cm9sIGNoYXJhY3RlcnM6ICR7c2F9YDtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZyk7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufVxuZnVuY3Rpb24gYW5jaG9yTmFtZXMocm9vdCkge1xuICAgIGNvbnN0IGFuY2hvcnMgPSBuZXcgU2V0KCk7XG4gICAgdmlzaXQudmlzaXQocm9vdCwge1xuICAgICAgICBWYWx1ZShfa2V5LCBub2RlKSB7XG4gICAgICAgICAgICBpZiAobm9kZS5hbmNob3IpXG4gICAgICAgICAgICAgICAgYW5jaG9ycy5hZGQobm9kZS5hbmNob3IpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGFuY2hvcnM7XG59XG4vKiogRmluZCBhIG5ldyBhbmNob3IgbmFtZSB3aXRoIHRoZSBnaXZlbiBgcHJlZml4YCBhbmQgYSBvbmUtaW5kZXhlZCBzdWZmaXguICovXG5mdW5jdGlvbiBmaW5kTmV3QW5jaG9yKHByZWZpeCwgZXhjbHVkZSkge1xuICAgIGZvciAobGV0IGkgPSAxOyB0cnVlOyArK2kpIHtcbiAgICAgICAgY29uc3QgbmFtZSA9IGAke3ByZWZpeH0ke2l9YDtcbiAgICAgICAgaWYgKCFleGNsdWRlLmhhcyhuYW1lKSlcbiAgICAgICAgICAgIHJldHVybiBuYW1lO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGNyZWF0ZU5vZGVBbmNob3JzKGRvYywgcHJlZml4KSB7XG4gICAgY29uc3QgYWxpYXNPYmplY3RzID0gW107XG4gICAgY29uc3Qgc291cmNlT2JqZWN0cyA9IG5ldyBNYXAoKTtcbiAgICBsZXQgcHJldkFuY2hvcnMgPSBudWxsO1xuICAgIHJldHVybiB7XG4gICAgICAgIG9uQW5jaG9yOiAoc291cmNlKSA9PiB7XG4gICAgICAgICAgICBhbGlhc09iamVjdHMucHVzaChzb3VyY2UpO1xuICAgICAgICAgICAgcHJldkFuY2hvcnMgPz8gKHByZXZBbmNob3JzID0gYW5jaG9yTmFtZXMoZG9jKSk7XG4gICAgICAgICAgICBjb25zdCBhbmNob3IgPSBmaW5kTmV3QW5jaG9yKHByZWZpeCwgcHJldkFuY2hvcnMpO1xuICAgICAgICAgICAgcHJldkFuY2hvcnMuYWRkKGFuY2hvcik7XG4gICAgICAgICAgICByZXR1cm4gYW5jaG9yO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogV2l0aCBjaXJjdWxhciByZWZlcmVuY2VzLCB0aGUgc291cmNlIG5vZGUgaXMgb25seSByZXNvbHZlZCBhZnRlciBhbGxcbiAgICAgICAgICogb2YgaXRzIGNoaWxkIG5vZGVzIGFyZS4gVGhpcyBpcyB3aHkgYW5jaG9ycyBhcmUgc2V0IG9ubHkgYWZ0ZXIgYWxsIG9mXG4gICAgICAgICAqIHRoZSBub2RlcyBoYXZlIGJlZW4gY3JlYXRlZC5cbiAgICAgICAgICovXG4gICAgICAgIHNldEFuY2hvcnM6ICgpID0+IHtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgc291cmNlIG9mIGFsaWFzT2JqZWN0cykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlZiA9IHNvdXJjZU9iamVjdHMuZ2V0KHNvdXJjZSk7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiByZWYgPT09ICdvYmplY3QnICYmXG4gICAgICAgICAgICAgICAgICAgIHJlZi5hbmNob3IgJiZcbiAgICAgICAgICAgICAgICAgICAgKGlkZW50aXR5LmlzU2NhbGFyKHJlZi5ub2RlKSB8fCBpZGVudGl0eS5pc0NvbGxlY3Rpb24ocmVmLm5vZGUpKSkge1xuICAgICAgICAgICAgICAgICAgICByZWYubm9kZS5hbmNob3IgPSByZWYuYW5jaG9yO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBuZXcgRXJyb3IoJ0ZhaWxlZCB0byByZXNvbHZlIHJlcGVhdGVkIG9iamVjdCAodGhpcyBzaG91bGQgbm90IGhhcHBlbiknKTtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3Iuc291cmNlID0gc291cmNlO1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHNvdXJjZU9iamVjdHNcbiAgICB9O1xufVxuXG5leHBvcnRzLmFuY2hvcklzVmFsaWQgPSBhbmNob3JJc1ZhbGlkO1xuZXhwb3J0cy5hbmNob3JOYW1lcyA9IGFuY2hvck5hbWVzO1xuZXhwb3J0cy5jcmVhdGVOb2RlQW5jaG9ycyA9IGNyZWF0ZU5vZGVBbmNob3JzO1xuZXhwb3J0cy5maW5kTmV3QW5jaG9yID0gZmluZE5ld0FuY2hvcjtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEFwcGxpZXMgdGhlIEpTT04ucGFyc2UgcmV2aXZlciBhbGdvcml0aG0gYXMgZGVmaW5lZCBpbiB0aGUgRUNNQS0yNjIgc3BlYyxcbiAqIGluIHNlY3Rpb24gMjQuNS4xLjEgXCJSdW50aW1lIFNlbWFudGljczogSW50ZXJuYWxpemVKU09OUHJvcGVydHlcIiBvZiB0aGVcbiAqIDIwMjEgZWRpdGlvbjogaHR0cHM6Ly90YzM5LmVzL2VjbWEyNjIvI3NlYy1qc29uLnBhcnNlXG4gKlxuICogSW5jbHVkZXMgZXh0ZW5zaW9ucyBmb3IgaGFuZGxpbmcgTWFwIGFuZCBTZXQgb2JqZWN0cy5cbiAqL1xuZnVuY3Rpb24gYXBwbHlSZXZpdmVyKHJldml2ZXIsIG9iaiwga2V5LCB2YWwpIHtcbiAgICBpZiAodmFsICYmIHR5cGVvZiB2YWwgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbCkpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSB2YWwubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2MCA9IHZhbFtpXTtcbiAgICAgICAgICAgICAgICBjb25zdCB2MSA9IGFwcGx5UmV2aXZlcihyZXZpdmVyLCB2YWwsIFN0cmluZyhpKSwgdjApO1xuICAgICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tYXJyYXktZGVsZXRlXG4gICAgICAgICAgICAgICAgaWYgKHYxID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB2YWxbaV07XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodjEgIT09IHYwKVxuICAgICAgICAgICAgICAgICAgICB2YWxbaV0gPSB2MTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh2YWwgaW5zdGFuY2VvZiBNYXApIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgayBvZiBBcnJheS5mcm9tKHZhbC5rZXlzKCkpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdjAgPSB2YWwuZ2V0KGspO1xuICAgICAgICAgICAgICAgIGNvbnN0IHYxID0gYXBwbHlSZXZpdmVyKHJldml2ZXIsIHZhbCwgaywgdjApO1xuICAgICAgICAgICAgICAgIGlmICh2MSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgICB2YWwuZGVsZXRlKGspO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHYxICE9PSB2MClcbiAgICAgICAgICAgICAgICAgICAgdmFsLnNldChrLCB2MSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodmFsIGluc3RhbmNlb2YgU2V0KSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHYwIG9mIEFycmF5LmZyb20odmFsKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHYxID0gYXBwbHlSZXZpdmVyKHJldml2ZXIsIHZhbCwgdjAsIHYwKTtcbiAgICAgICAgICAgICAgICBpZiAodjEgPT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICAgICAgdmFsLmRlbGV0ZSh2MCk7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodjEgIT09IHYwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbC5kZWxldGUodjApO1xuICAgICAgICAgICAgICAgICAgICB2YWwuYWRkKHYxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IFtrLCB2MF0gb2YgT2JqZWN0LmVudHJpZXModmFsKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHYxID0gYXBwbHlSZXZpdmVyKHJldml2ZXIsIHZhbCwgaywgdjApO1xuICAgICAgICAgICAgICAgIGlmICh2MSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgdmFsW2tdO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHYxICE9PSB2MClcbiAgICAgICAgICAgICAgICAgICAgdmFsW2tdID0gdjE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJldml2ZXIuY2FsbChvYmosIGtleSwgdmFsKTtcbn1cblxuZXhwb3J0cy5hcHBseVJldml2ZXIgPSBhcHBseVJldml2ZXI7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIGlkZW50aXR5ID0gcmVxdWlyZSgnLi9pZGVudGl0eS5qcycpO1xuXG4vKipcbiAqIFJlY3Vyc2l2ZWx5IGNvbnZlcnQgYW55IG5vZGUgb3IgaXRzIGNvbnRlbnRzIHRvIG5hdGl2ZSBKYXZhU2NyaXB0XG4gKlxuICogQHBhcmFtIHZhbHVlIC0gVGhlIGlucHV0IHZhbHVlXG4gKiBAcGFyYW0gYXJnIC0gSWYgYHZhbHVlYCBkZWZpbmVzIGEgYHRvSlNPTigpYCBtZXRob2QsIHVzZSB0aGlzXG4gKiAgIGFzIGl0cyBmaXJzdCBhcmd1bWVudFxuICogQHBhcmFtIGN0eCAtIENvbnZlcnNpb24gY29udGV4dCwgb3JpZ2luYWxseSBzZXQgaW4gRG9jdW1lbnQjdG9KUygpLiBJZlxuICogICBgeyBrZWVwOiB0cnVlIH1gIGlzIG5vdCBzZXQsIG91dHB1dCBzaG91bGQgYmUgc3VpdGFibGUgZm9yIEpTT05cbiAqICAgc3RyaW5naWZpY2F0aW9uLlxuICovXG5mdW5jdGlvbiB0b0pTKHZhbHVlLCBhcmcsIGN0eCkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW5zYWZlLXJldHVyblxuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSlcbiAgICAgICAgcmV0dXJuIHZhbHVlLm1hcCgodiwgaSkgPT4gdG9KUyh2LCBTdHJpbmcoaSksIGN0eCkpO1xuICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUudG9KU09OID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW5zYWZlLWNhbGxcbiAgICAgICAgaWYgKCFjdHggfHwgIWlkZW50aXR5Lmhhc0FuY2hvcih2YWx1ZSkpXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUudG9KU09OKGFyZywgY3R4KTtcbiAgICAgICAgY29uc3QgZGF0YSA9IHsgYWxpYXNDb3VudDogMCwgY291bnQ6IDEsIHJlczogdW5kZWZpbmVkIH07XG4gICAgICAgIGN0eC5hbmNob3JzLnNldCh2YWx1ZSwgZGF0YSk7XG4gICAgICAgIGN0eC5vbkNyZWF0ZSA9IHJlcyA9PiB7XG4gICAgICAgICAgICBkYXRhLnJlcyA9IHJlcztcbiAgICAgICAgICAgIGRlbGV0ZSBjdHgub25DcmVhdGU7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHJlcyA9IHZhbHVlLnRvSlNPTihhcmcsIGN0eCk7XG4gICAgICAgIGlmIChjdHgub25DcmVhdGUpXG4gICAgICAgICAgICBjdHgub25DcmVhdGUocmVzKTtcbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2JpZ2ludCcgJiYgIWN0eD8ua2VlcClcbiAgICAgICAgcmV0dXJuIE51bWJlcih2YWx1ZSk7XG4gICAgcmV0dXJuIHZhbHVlO1xufVxuXG5leHBvcnRzLnRvSlMgPSB0b0pTO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBhcHBseVJldml2ZXIgPSByZXF1aXJlKCcuLi9kb2MvYXBwbHlSZXZpdmVyLmpzJyk7XG52YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuL2lkZW50aXR5LmpzJyk7XG52YXIgdG9KUyA9IHJlcXVpcmUoJy4vdG9KUy5qcycpO1xuXG5jbGFzcyBOb2RlQmFzZSB7XG4gICAgY29uc3RydWN0b3IodHlwZSkge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgaWRlbnRpdHkuTk9ERV9UWVBFLCB7IHZhbHVlOiB0eXBlIH0pO1xuICAgIH1cbiAgICAvKiogQ3JlYXRlIGEgY29weSBvZiB0aGlzIG5vZGUuICAqL1xuICAgIGNsb25lKCkge1xuICAgICAgICBjb25zdCBjb3B5ID0gT2JqZWN0LmNyZWF0ZShPYmplY3QuZ2V0UHJvdG90eXBlT2YodGhpcyksIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHRoaXMpKTtcbiAgICAgICAgaWYgKHRoaXMucmFuZ2UpXG4gICAgICAgICAgICBjb3B5LnJhbmdlID0gdGhpcy5yYW5nZS5zbGljZSgpO1xuICAgICAgICByZXR1cm4gY29weTtcbiAgICB9XG4gICAgLyoqIEEgcGxhaW4gSmF2YVNjcmlwdCByZXByZXNlbnRhdGlvbiBvZiB0aGlzIG5vZGUuICovXG4gICAgdG9KUyhkb2MsIHsgbWFwQXNNYXAsIG1heEFsaWFzQ291bnQsIG9uQW5jaG9yLCByZXZpdmVyIH0gPSB7fSkge1xuICAgICAgICBpZiAoIWlkZW50aXR5LmlzRG9jdW1lbnQoZG9jKSlcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0EgZG9jdW1lbnQgYXJndW1lbnQgaXMgcmVxdWlyZWQnKTtcbiAgICAgICAgY29uc3QgY3R4ID0ge1xuICAgICAgICAgICAgYW5jaG9yczogbmV3IE1hcCgpLFxuICAgICAgICAgICAgZG9jLFxuICAgICAgICAgICAga2VlcDogdHJ1ZSxcbiAgICAgICAgICAgIG1hcEFzTWFwOiBtYXBBc01hcCA9PT0gdHJ1ZSxcbiAgICAgICAgICAgIG1hcEtleVdhcm5lZDogZmFsc2UsXG4gICAgICAgICAgICBtYXhBbGlhc0NvdW50OiB0eXBlb2YgbWF4QWxpYXNDb3VudCA9PT0gJ251bWJlcicgPyBtYXhBbGlhc0NvdW50IDogMTAwXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHJlcyA9IHRvSlMudG9KUyh0aGlzLCAnJywgY3R4KTtcbiAgICAgICAgaWYgKHR5cGVvZiBvbkFuY2hvciA9PT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgICAgIGZvciAoY29uc3QgeyBjb3VudCwgcmVzIH0gb2YgY3R4LmFuY2hvcnMudmFsdWVzKCkpXG4gICAgICAgICAgICAgICAgb25BbmNob3IocmVzLCBjb3VudCk7XG4gICAgICAgIHJldHVybiB0eXBlb2YgcmV2aXZlciA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgPyBhcHBseVJldml2ZXIuYXBwbHlSZXZpdmVyKHJldml2ZXIsIHsgJyc6IHJlcyB9LCAnJywgcmVzKVxuICAgICAgICAgICAgOiByZXM7XG4gICAgfVxufVxuXG5leHBvcnRzLk5vZGVCYXNlID0gTm9kZUJhc2U7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIGFuY2hvcnMgPSByZXF1aXJlKCcuLi9kb2MvYW5jaG9ycy5qcycpO1xudmFyIHZpc2l0ID0gcmVxdWlyZSgnLi4vdmlzaXQuanMnKTtcbnZhciBpZGVudGl0eSA9IHJlcXVpcmUoJy4vaWRlbnRpdHkuanMnKTtcbnZhciBOb2RlID0gcmVxdWlyZSgnLi9Ob2RlLmpzJyk7XG52YXIgdG9KUyA9IHJlcXVpcmUoJy4vdG9KUy5qcycpO1xuXG5jbGFzcyBBbGlhcyBleHRlbmRzIE5vZGUuTm9kZUJhc2Uge1xuICAgIGNvbnN0cnVjdG9yKHNvdXJjZSkge1xuICAgICAgICBzdXBlcihpZGVudGl0eS5BTElBUyk7XG4gICAgICAgIHRoaXMuc291cmNlID0gc291cmNlO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3RhZycsIHtcbiAgICAgICAgICAgIHNldCgpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0FsaWFzIG5vZGVzIGNhbm5vdCBoYXZlIHRhZ3MnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlc29sdmUgdGhlIHZhbHVlIG9mIHRoaXMgYWxpYXMgd2l0aGluIGBkb2NgLCBmaW5kaW5nIHRoZSBsYXN0XG4gICAgICogaW5zdGFuY2Ugb2YgdGhlIGBzb3VyY2VgIGFuY2hvciBiZWZvcmUgdGhpcyBub2RlLlxuICAgICAqL1xuICAgIHJlc29sdmUoZG9jLCBjdHgpIHtcbiAgICAgICAgbGV0IG5vZGVzO1xuICAgICAgICBpZiAoY3R4Py5hbGlhc1Jlc29sdmVDYWNoZSkge1xuICAgICAgICAgICAgbm9kZXMgPSBjdHguYWxpYXNSZXNvbHZlQ2FjaGU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBub2RlcyA9IFtdO1xuICAgICAgICAgICAgdmlzaXQudmlzaXQoZG9jLCB7XG4gICAgICAgICAgICAgICAgTm9kZTogKF9rZXksIG5vZGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlkZW50aXR5LmlzQWxpYXMobm9kZSkgfHwgaWRlbnRpdHkuaGFzQW5jaG9yKG5vZGUpKVxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXMucHVzaChub2RlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChjdHgpXG4gICAgICAgICAgICAgICAgY3R4LmFsaWFzUmVzb2x2ZUNhY2hlID0gbm9kZXM7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGZvdW5kID0gdW5kZWZpbmVkO1xuICAgICAgICBmb3IgKGNvbnN0IG5vZGUgb2Ygbm9kZXMpIHtcbiAgICAgICAgICAgIGlmIChub2RlID09PSB0aGlzKVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgaWYgKG5vZGUuYW5jaG9yID09PSB0aGlzLnNvdXJjZSlcbiAgICAgICAgICAgICAgICBmb3VuZCA9IG5vZGU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZvdW5kO1xuICAgIH1cbiAgICB0b0pTT04oX2FyZywgY3R4KSB7XG4gICAgICAgIGlmICghY3R4KVxuICAgICAgICAgICAgcmV0dXJuIHsgc291cmNlOiB0aGlzLnNvdXJjZSB9O1xuICAgICAgICBjb25zdCB7IGFuY2hvcnMsIGRvYywgbWF4QWxpYXNDb3VudCB9ID0gY3R4O1xuICAgICAgICBjb25zdCBzb3VyY2UgPSB0aGlzLnJlc29sdmUoZG9jLCBjdHgpO1xuICAgICAgICBpZiAoIXNvdXJjZSkge1xuICAgICAgICAgICAgY29uc3QgbXNnID0gYFVucmVzb2x2ZWQgYWxpYXMgKHRoZSBhbmNob3IgbXVzdCBiZSBzZXQgYmVmb3JlIHRoZSBhbGlhcyk6ICR7dGhpcy5zb3VyY2V9YDtcbiAgICAgICAgICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihtc2cpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBkYXRhID0gYW5jaG9ycy5nZXQoc291cmNlKTtcbiAgICAgICAgaWYgKCFkYXRhKSB7XG4gICAgICAgICAgICAvLyBSZXNvbHZlIGFuY2hvcnMgZm9yIE5vZGUucHJvdG90eXBlLnRvSlMoKVxuICAgICAgICAgICAgdG9KUy50b0pTKHNvdXJjZSwgbnVsbCwgY3R4KTtcbiAgICAgICAgICAgIGRhdGEgPSBhbmNob3JzLmdldChzb3VyY2UpO1xuICAgICAgICB9XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICBpZiAoZGF0YT8ucmVzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNvbnN0IG1zZyA9ICdUaGlzIHNob3VsZCBub3QgaGFwcGVuOiBBbGlhcyBhbmNob3Igd2FzIG5vdCByZXNvbHZlZD8nO1xuICAgICAgICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKG1zZyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1heEFsaWFzQ291bnQgPj0gMCkge1xuICAgICAgICAgICAgZGF0YS5jb3VudCArPSAxO1xuICAgICAgICAgICAgaWYgKGRhdGEuYWxpYXNDb3VudCA9PT0gMClcbiAgICAgICAgICAgICAgICBkYXRhLmFsaWFzQ291bnQgPSBnZXRBbGlhc0NvdW50KGRvYywgc291cmNlLCBhbmNob3JzKTtcbiAgICAgICAgICAgIGlmIChkYXRhLmNvdW50ICogZGF0YS5hbGlhc0NvdW50ID4gbWF4QWxpYXNDb3VudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1zZyA9ICdFeGNlc3NpdmUgYWxpYXMgY291bnQgaW5kaWNhdGVzIGEgcmVzb3VyY2UgZXhoYXVzdGlvbiBhdHRhY2snO1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihtc2cpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkYXRhLnJlcztcbiAgICB9XG4gICAgdG9TdHJpbmcoY3R4LCBfb25Db21tZW50LCBfb25DaG9tcEtlZXApIHtcbiAgICAgICAgY29uc3Qgc3JjID0gYCoke3RoaXMuc291cmNlfWA7XG4gICAgICAgIGlmIChjdHgpIHtcbiAgICAgICAgICAgIGFuY2hvcnMuYW5jaG9ySXNWYWxpZCh0aGlzLnNvdXJjZSk7XG4gICAgICAgICAgICBpZiAoY3R4Lm9wdGlvbnMudmVyaWZ5QWxpYXNPcmRlciAmJiAhY3R4LmFuY2hvcnMuaGFzKHRoaXMuc291cmNlKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1zZyA9IGBVbnJlc29sdmVkIGFsaWFzICh0aGUgYW5jaG9yIG11c3QgYmUgc2V0IGJlZm9yZSB0aGUgYWxpYXMpOiAke3RoaXMuc291cmNlfWA7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY3R4LmltcGxpY2l0S2V5KVxuICAgICAgICAgICAgICAgIHJldHVybiBgJHtzcmN9IGA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNyYztcbiAgICB9XG59XG5mdW5jdGlvbiBnZXRBbGlhc0NvdW50KGRvYywgbm9kZSwgYW5jaG9ycykge1xuICAgIGlmIChpZGVudGl0eS5pc0FsaWFzKG5vZGUpKSB7XG4gICAgICAgIGNvbnN0IHNvdXJjZSA9IG5vZGUucmVzb2x2ZShkb2MpO1xuICAgICAgICBjb25zdCBhbmNob3IgPSBhbmNob3JzICYmIHNvdXJjZSAmJiBhbmNob3JzLmdldChzb3VyY2UpO1xuICAgICAgICByZXR1cm4gYW5jaG9yID8gYW5jaG9yLmNvdW50ICogYW5jaG9yLmFsaWFzQ291bnQgOiAwO1xuICAgIH1cbiAgICBlbHNlIGlmIChpZGVudGl0eS5pc0NvbGxlY3Rpb24obm9kZSkpIHtcbiAgICAgICAgbGV0IGNvdW50ID0gMDtcbiAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIG5vZGUuaXRlbXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGMgPSBnZXRBbGlhc0NvdW50KGRvYywgaXRlbSwgYW5jaG9ycyk7XG4gICAgICAgICAgICBpZiAoYyA+IGNvdW50KVxuICAgICAgICAgICAgICAgIGNvdW50ID0gYztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY291bnQ7XG4gICAgfVxuICAgIGVsc2UgaWYgKGlkZW50aXR5LmlzUGFpcihub2RlKSkge1xuICAgICAgICBjb25zdCBrYyA9IGdldEFsaWFzQ291bnQoZG9jLCBub2RlLmtleSwgYW5jaG9ycyk7XG4gICAgICAgIGNvbnN0IHZjID0gZ2V0QWxpYXNDb3VudChkb2MsIG5vZGUudmFsdWUsIGFuY2hvcnMpO1xuICAgICAgICByZXR1cm4gTWF0aC5tYXgoa2MsIHZjKTtcbiAgICB9XG4gICAgcmV0dXJuIDE7XG59XG5cbmV4cG9ydHMuQWxpYXMgPSBBbGlhcztcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuL2lkZW50aXR5LmpzJyk7XG52YXIgTm9kZSA9IHJlcXVpcmUoJy4vTm9kZS5qcycpO1xudmFyIHRvSlMgPSByZXF1aXJlKCcuL3RvSlMuanMnKTtcblxuY29uc3QgaXNTY2FsYXJWYWx1ZSA9ICh2YWx1ZSkgPT4gIXZhbHVlIHx8ICh0eXBlb2YgdmFsdWUgIT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIHZhbHVlICE9PSAnb2JqZWN0Jyk7XG5jbGFzcyBTY2FsYXIgZXh0ZW5kcyBOb2RlLk5vZGVCYXNlIHtcbiAgICBjb25zdHJ1Y3Rvcih2YWx1ZSkge1xuICAgICAgICBzdXBlcihpZGVudGl0eS5TQ0FMQVIpO1xuICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgfVxuICAgIHRvSlNPTihhcmcsIGN0eCkge1xuICAgICAgICByZXR1cm4gY3R4Py5rZWVwID8gdGhpcy52YWx1ZSA6IHRvSlMudG9KUyh0aGlzLnZhbHVlLCBhcmcsIGN0eCk7XG4gICAgfVxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gU3RyaW5nKHRoaXMudmFsdWUpO1xuICAgIH1cbn1cblNjYWxhci5CTE9DS19GT0xERUQgPSAnQkxPQ0tfRk9MREVEJztcblNjYWxhci5CTE9DS19MSVRFUkFMID0gJ0JMT0NLX0xJVEVSQUwnO1xuU2NhbGFyLlBMQUlOID0gJ1BMQUlOJztcblNjYWxhci5RVU9URV9ET1VCTEUgPSAnUVVPVEVfRE9VQkxFJztcblNjYWxhci5RVU9URV9TSU5HTEUgPSAnUVVPVEVfU0lOR0xFJztcblxuZXhwb3J0cy5TY2FsYXIgPSBTY2FsYXI7XG5leHBvcnRzLmlzU2NhbGFyVmFsdWUgPSBpc1NjYWxhclZhbHVlO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBBbGlhcyA9IHJlcXVpcmUoJy4uL25vZGVzL0FsaWFzLmpzJyk7XG52YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuLi9ub2Rlcy9pZGVudGl0eS5qcycpO1xudmFyIFNjYWxhciA9IHJlcXVpcmUoJy4uL25vZGVzL1NjYWxhci5qcycpO1xuXG5jb25zdCBkZWZhdWx0VGFnUHJlZml4ID0gJ3RhZzp5YW1sLm9yZywyMDAyOic7XG5mdW5jdGlvbiBmaW5kVGFnT2JqZWN0KHZhbHVlLCB0YWdOYW1lLCB0YWdzKSB7XG4gICAgaWYgKHRhZ05hbWUpIHtcbiAgICAgICAgY29uc3QgbWF0Y2ggPSB0YWdzLmZpbHRlcih0ID0+IHQudGFnID09PSB0YWdOYW1lKTtcbiAgICAgICAgY29uc3QgdGFnT2JqID0gbWF0Y2guZmluZCh0ID0+ICF0LmZvcm1hdCkgPz8gbWF0Y2hbMF07XG4gICAgICAgIGlmICghdGFnT2JqKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUYWcgJHt0YWdOYW1lfSBub3QgZm91bmRgKTtcbiAgICAgICAgcmV0dXJuIHRhZ09iajtcbiAgICB9XG4gICAgcmV0dXJuIHRhZ3MuZmluZCh0ID0+IHQuaWRlbnRpZnk/Lih2YWx1ZSkgJiYgIXQuZm9ybWF0KTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZU5vZGUodmFsdWUsIHRhZ05hbWUsIGN0eCkge1xuICAgIGlmIChpZGVudGl0eS5pc0RvY3VtZW50KHZhbHVlKSlcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5jb250ZW50cztcbiAgICBpZiAoaWRlbnRpdHkuaXNOb2RlKHZhbHVlKSlcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIGlmIChpZGVudGl0eS5pc1BhaXIodmFsdWUpKSB7XG4gICAgICAgIGNvbnN0IG1hcCA9IGN0eC5zY2hlbWFbaWRlbnRpdHkuTUFQXS5jcmVhdGVOb2RlPy4oY3R4LnNjaGVtYSwgbnVsbCwgY3R4KTtcbiAgICAgICAgbWFwLml0ZW1zLnB1c2godmFsdWUpO1xuICAgICAgICByZXR1cm4gbWFwO1xuICAgIH1cbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBTdHJpbmcgfHxcbiAgICAgICAgdmFsdWUgaW5zdGFuY2VvZiBOdW1iZXIgfHxcbiAgICAgICAgdmFsdWUgaW5zdGFuY2VvZiBCb29sZWFuIHx8XG4gICAgICAgICh0eXBlb2YgQmlnSW50ICE9PSAndW5kZWZpbmVkJyAmJiB2YWx1ZSBpbnN0YW5jZW9mIEJpZ0ludCkgLy8gbm90IHN1cHBvcnRlZCBldmVyeXdoZXJlXG4gICAgKSB7XG4gICAgICAgIC8vIGh0dHBzOi8vdGMzOS5lcy9lY21hMjYyLyNzZWMtc2VyaWFsaXplanNvbnByb3BlcnR5XG4gICAgICAgIHZhbHVlID0gdmFsdWUudmFsdWVPZigpO1xuICAgIH1cbiAgICBjb25zdCB7IGFsaWFzRHVwbGljYXRlT2JqZWN0cywgb25BbmNob3IsIG9uVGFnT2JqLCBzY2hlbWEsIHNvdXJjZU9iamVjdHMgfSA9IGN0eDtcbiAgICAvLyBEZXRlY3QgZHVwbGljYXRlIHJlZmVyZW5jZXMgdG8gdGhlIHNhbWUgb2JqZWN0ICYgdXNlIEFsaWFzIG5vZGVzIGZvciBhbGxcbiAgICAvLyBhZnRlciBmaXJzdC4gVGhlIGByZWZgIHdyYXBwZXIgYWxsb3dzIGZvciBjaXJjdWxhciByZWZlcmVuY2VzIHRvIHJlc29sdmUuXG4gICAgbGV0IHJlZiA9IHVuZGVmaW5lZDtcbiAgICBpZiAoYWxpYXNEdXBsaWNhdGVPYmplY3RzICYmIHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgcmVmID0gc291cmNlT2JqZWN0cy5nZXQodmFsdWUpO1xuICAgICAgICBpZiAocmVmKSB7XG4gICAgICAgICAgICByZWYuYW5jaG9yID8/IChyZWYuYW5jaG9yID0gb25BbmNob3IodmFsdWUpKTtcbiAgICAgICAgICAgIHJldHVybiBuZXcgQWxpYXMuQWxpYXMocmVmLmFuY2hvcik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZWYgPSB7IGFuY2hvcjogbnVsbCwgbm9kZTogbnVsbCB9O1xuICAgICAgICAgICAgc291cmNlT2JqZWN0cy5zZXQodmFsdWUsIHJlZik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRhZ05hbWU/LnN0YXJ0c1dpdGgoJyEhJykpXG4gICAgICAgIHRhZ05hbWUgPSBkZWZhdWx0VGFnUHJlZml4ICsgdGFnTmFtZS5zbGljZSgyKTtcbiAgICBsZXQgdGFnT2JqID0gZmluZFRhZ09iamVjdCh2YWx1ZSwgdGFnTmFtZSwgc2NoZW1hLnRhZ3MpO1xuICAgIGlmICghdGFnT2JqKSB7XG4gICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUudG9KU09OID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVuc2FmZS1jYWxsXG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnRvSlNPTigpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdmFsdWUgfHwgdHlwZW9mIHZhbHVlICE9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgY29uc3Qgbm9kZSA9IG5ldyBTY2FsYXIuU2NhbGFyKHZhbHVlKTtcbiAgICAgICAgICAgIGlmIChyZWYpXG4gICAgICAgICAgICAgICAgcmVmLm5vZGUgPSBub2RlO1xuICAgICAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICAgIH1cbiAgICAgICAgdGFnT2JqID1cbiAgICAgICAgICAgIHZhbHVlIGluc3RhbmNlb2YgTWFwXG4gICAgICAgICAgICAgICAgPyBzY2hlbWFbaWRlbnRpdHkuTUFQXVxuICAgICAgICAgICAgICAgIDogU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdCh2YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgPyBzY2hlbWFbaWRlbnRpdHkuU0VRXVxuICAgICAgICAgICAgICAgICAgICA6IHNjaGVtYVtpZGVudGl0eS5NQVBdO1xuICAgIH1cbiAgICBpZiAob25UYWdPYmopIHtcbiAgICAgICAgb25UYWdPYmoodGFnT2JqKTtcbiAgICAgICAgZGVsZXRlIGN0eC5vblRhZ09iajtcbiAgICB9XG4gICAgY29uc3Qgbm9kZSA9IHRhZ09iaj8uY3JlYXRlTm9kZVxuICAgICAgICA/IHRhZ09iai5jcmVhdGVOb2RlKGN0eC5zY2hlbWEsIHZhbHVlLCBjdHgpXG4gICAgICAgIDogdHlwZW9mIHRhZ09iaj8ubm9kZUNsYXNzPy5mcm9tID09PSAnZnVuY3Rpb24nXG4gICAgICAgICAgICA/IHRhZ09iai5ub2RlQ2xhc3MuZnJvbShjdHguc2NoZW1hLCB2YWx1ZSwgY3R4KVxuICAgICAgICAgICAgOiBuZXcgU2NhbGFyLlNjYWxhcih2YWx1ZSk7XG4gICAgaWYgKHRhZ05hbWUpXG4gICAgICAgIG5vZGUudGFnID0gdGFnTmFtZTtcbiAgICBlbHNlIGlmICghdGFnT2JqLmRlZmF1bHQpXG4gICAgICAgIG5vZGUudGFnID0gdGFnT2JqLnRhZztcbiAgICBpZiAocmVmKVxuICAgICAgICByZWYubm9kZSA9IG5vZGU7XG4gICAgcmV0dXJuIG5vZGU7XG59XG5cbmV4cG9ydHMuY3JlYXRlTm9kZSA9IGNyZWF0ZU5vZGU7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIGNyZWF0ZU5vZGUgPSByZXF1aXJlKCcuLi9kb2MvY3JlYXRlTm9kZS5qcycpO1xudmFyIGlkZW50aXR5ID0gcmVxdWlyZSgnLi9pZGVudGl0eS5qcycpO1xudmFyIE5vZGUgPSByZXF1aXJlKCcuL05vZGUuanMnKTtcblxuZnVuY3Rpb24gY29sbGVjdGlvbkZyb21QYXRoKHNjaGVtYSwgcGF0aCwgdmFsdWUpIHtcbiAgICBsZXQgdiA9IHZhbHVlO1xuICAgIGZvciAobGV0IGkgPSBwYXRoLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIGNvbnN0IGsgPSBwYXRoW2ldO1xuICAgICAgICBpZiAodHlwZW9mIGsgPT09ICdudW1iZXInICYmIE51bWJlci5pc0ludGVnZXIoaykgJiYgayA+PSAwKSB7XG4gICAgICAgICAgICBjb25zdCBhID0gW107XG4gICAgICAgICAgICBhW2tdID0gdjtcbiAgICAgICAgICAgIHYgPSBhO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdiA9IG5ldyBNYXAoW1trLCB2XV0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjcmVhdGVOb2RlLmNyZWF0ZU5vZGUodiwgdW5kZWZpbmVkLCB7XG4gICAgICAgIGFsaWFzRHVwbGljYXRlT2JqZWN0czogZmFsc2UsXG4gICAgICAgIGtlZXBVbmRlZmluZWQ6IGZhbHNlLFxuICAgICAgICBvbkFuY2hvcjogKCkgPT4ge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGlzIHNob3VsZCBub3QgaGFwcGVuLCBwbGVhc2UgcmVwb3J0IGEgYnVnLicpO1xuICAgICAgICB9LFxuICAgICAgICBzY2hlbWEsXG4gICAgICAgIHNvdXJjZU9iamVjdHM6IG5ldyBNYXAoKVxuICAgIH0pO1xufVxuLy8gVHlwZSBndWFyZCBpcyBpbnRlbnRpb25hbGx5IGEgbGl0dGxlIHdyb25nIHNvIGFzIHRvIGJlIG1vcmUgdXNlZnVsLFxuLy8gYXMgaXQgZG9lcyBub3QgY292ZXIgdW50eXBhYmxlIGVtcHR5IG5vbi1zdHJpbmcgaXRlcmFibGVzIChlLmcuIFtdKS5cbmNvbnN0IGlzRW1wdHlQYXRoID0gKHBhdGgpID0+IHBhdGggPT0gbnVsbCB8fFxuICAgICh0eXBlb2YgcGF0aCA9PT0gJ29iamVjdCcgJiYgISFwYXRoW1N5bWJvbC5pdGVyYXRvcl0oKS5uZXh0KCkuZG9uZSk7XG5jbGFzcyBDb2xsZWN0aW9uIGV4dGVuZHMgTm9kZS5Ob2RlQmFzZSB7XG4gICAgY29uc3RydWN0b3IodHlwZSwgc2NoZW1hKSB7XG4gICAgICAgIHN1cGVyKHR5cGUpO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3NjaGVtYScsIHtcbiAgICAgICAgICAgIHZhbHVlOiBzY2hlbWEsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBjb3B5IG9mIHRoaXMgY29sbGVjdGlvbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBzY2hlbWEgLSBJZiBkZWZpbmVkLCBvdmVyd3JpdGVzIHRoZSBvcmlnaW5hbCdzIHNjaGVtYVxuICAgICAqL1xuICAgIGNsb25lKHNjaGVtYSkge1xuICAgICAgICBjb25zdCBjb3B5ID0gT2JqZWN0LmNyZWF0ZShPYmplY3QuZ2V0UHJvdG90eXBlT2YodGhpcyksIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHRoaXMpKTtcbiAgICAgICAgaWYgKHNjaGVtYSlcbiAgICAgICAgICAgIGNvcHkuc2NoZW1hID0gc2NoZW1hO1xuICAgICAgICBjb3B5Lml0ZW1zID0gY29weS5pdGVtcy5tYXAoaXQgPT4gaWRlbnRpdHkuaXNOb2RlKGl0KSB8fCBpZGVudGl0eS5pc1BhaXIoaXQpID8gaXQuY2xvbmUoc2NoZW1hKSA6IGl0KTtcbiAgICAgICAgaWYgKHRoaXMucmFuZ2UpXG4gICAgICAgICAgICBjb3B5LnJhbmdlID0gdGhpcy5yYW5nZS5zbGljZSgpO1xuICAgICAgICByZXR1cm4gY29weTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQWRkcyBhIHZhbHVlIHRvIHRoZSBjb2xsZWN0aW9uLiBGb3IgYCEhbWFwYCBhbmQgYCEhb21hcGAgdGhlIHZhbHVlIG11c3RcbiAgICAgKiBiZSBhIFBhaXIgaW5zdGFuY2Ugb3IgYSBgeyBrZXksIHZhbHVlIH1gIG9iamVjdCwgd2hpY2ggbWF5IG5vdCBoYXZlIGEga2V5XG4gICAgICogdGhhdCBhbHJlYWR5IGV4aXN0cyBpbiB0aGUgbWFwLlxuICAgICAqL1xuICAgIGFkZEluKHBhdGgsIHZhbHVlKSB7XG4gICAgICAgIGlmIChpc0VtcHR5UGF0aChwYXRoKSlcbiAgICAgICAgICAgIHRoaXMuYWRkKHZhbHVlKTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBba2V5LCAuLi5yZXN0XSA9IHBhdGg7XG4gICAgICAgICAgICBjb25zdCBub2RlID0gdGhpcy5nZXQoa2V5LCB0cnVlKTtcbiAgICAgICAgICAgIGlmIChpZGVudGl0eS5pc0NvbGxlY3Rpb24obm9kZSkpXG4gICAgICAgICAgICAgICAgbm9kZS5hZGRJbihyZXN0LCB2YWx1ZSk7XG4gICAgICAgICAgICBlbHNlIGlmIChub2RlID09PSB1bmRlZmluZWQgJiYgdGhpcy5zY2hlbWEpXG4gICAgICAgICAgICAgICAgdGhpcy5zZXQoa2V5LCBjb2xsZWN0aW9uRnJvbVBhdGgodGhpcy5zY2hlbWEsIHJlc3QsIHZhbHVlKSk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCBZQU1MIGNvbGxlY3Rpb24gYXQgJHtrZXl9LiBSZW1haW5pbmcgcGF0aDogJHtyZXN0fWApO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYSB2YWx1ZSBmcm9tIHRoZSBjb2xsZWN0aW9uLlxuICAgICAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgaXRlbSB3YXMgZm91bmQgYW5kIHJlbW92ZWQuXG4gICAgICovXG4gICAgZGVsZXRlSW4ocGF0aCkge1xuICAgICAgICBjb25zdCBba2V5LCAuLi5yZXN0XSA9IHBhdGg7XG4gICAgICAgIGlmIChyZXN0Lmxlbmd0aCA9PT0gMClcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRlbGV0ZShrZXkpO1xuICAgICAgICBjb25zdCBub2RlID0gdGhpcy5nZXQoa2V5LCB0cnVlKTtcbiAgICAgICAgaWYgKGlkZW50aXR5LmlzQ29sbGVjdGlvbihub2RlKSlcbiAgICAgICAgICAgIHJldHVybiBub2RlLmRlbGV0ZUluKHJlc3QpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIFlBTUwgY29sbGVjdGlvbiBhdCAke2tleX0uIFJlbWFpbmluZyBwYXRoOiAke3Jlc3R9YCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJldHVybnMgaXRlbSBhdCBga2V5YCwgb3IgYHVuZGVmaW5lZGAgaWYgbm90IGZvdW5kLiBCeSBkZWZhdWx0IHVud3JhcHNcbiAgICAgKiBzY2FsYXIgdmFsdWVzIGZyb20gdGhlaXIgc3Vycm91bmRpbmcgbm9kZTsgdG8gZGlzYWJsZSBzZXQgYGtlZXBTY2FsYXJgIHRvXG4gICAgICogYHRydWVgIChjb2xsZWN0aW9ucyBhcmUgYWx3YXlzIHJldHVybmVkIGludGFjdCkuXG4gICAgICovXG4gICAgZ2V0SW4ocGF0aCwga2VlcFNjYWxhcikge1xuICAgICAgICBjb25zdCBba2V5LCAuLi5yZXN0XSA9IHBhdGg7XG4gICAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLmdldChrZXksIHRydWUpO1xuICAgICAgICBpZiAocmVzdC5sZW5ndGggPT09IDApXG4gICAgICAgICAgICByZXR1cm4gIWtlZXBTY2FsYXIgJiYgaWRlbnRpdHkuaXNTY2FsYXIobm9kZSkgPyBub2RlLnZhbHVlIDogbm9kZTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIGlkZW50aXR5LmlzQ29sbGVjdGlvbihub2RlKSA/IG5vZGUuZ2V0SW4ocmVzdCwga2VlcFNjYWxhcikgOiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGhhc0FsbE51bGxWYWx1ZXMoYWxsb3dTY2FsYXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXRlbXMuZXZlcnkobm9kZSA9PiB7XG4gICAgICAgICAgICBpZiAoIWlkZW50aXR5LmlzUGFpcihub2RlKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICBjb25zdCBuID0gbm9kZS52YWx1ZTtcbiAgICAgICAgICAgIHJldHVybiAobiA9PSBudWxsIHx8XG4gICAgICAgICAgICAgICAgKGFsbG93U2NhbGFyICYmXG4gICAgICAgICAgICAgICAgICAgIGlkZW50aXR5LmlzU2NhbGFyKG4pICYmXG4gICAgICAgICAgICAgICAgICAgIG4udmFsdWUgPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgICAgICAhbi5jb21tZW50QmVmb3JlICYmXG4gICAgICAgICAgICAgICAgICAgICFuLmNvbW1lbnQgJiZcbiAgICAgICAgICAgICAgICAgICAgIW4udGFnKSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgdGhlIGNvbGxlY3Rpb24gaW5jbHVkZXMgYSB2YWx1ZSB3aXRoIHRoZSBrZXkgYGtleWAuXG4gICAgICovXG4gICAgaGFzSW4ocGF0aCkge1xuICAgICAgICBjb25zdCBba2V5LCAuLi5yZXN0XSA9IHBhdGg7XG4gICAgICAgIGlmIChyZXN0Lmxlbmd0aCA9PT0gMClcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmhhcyhrZXkpO1xuICAgICAgICBjb25zdCBub2RlID0gdGhpcy5nZXQoa2V5LCB0cnVlKTtcbiAgICAgICAgcmV0dXJuIGlkZW50aXR5LmlzQ29sbGVjdGlvbihub2RlKSA/IG5vZGUuaGFzSW4ocmVzdCkgOiBmYWxzZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0cyBhIHZhbHVlIGluIHRoaXMgY29sbGVjdGlvbi4gRm9yIGAhIXNldGAsIGB2YWx1ZWAgbmVlZHMgdG8gYmUgYVxuICAgICAqIGJvb2xlYW4gdG8gYWRkL3JlbW92ZSB0aGUgaXRlbSBmcm9tIHRoZSBzZXQuXG4gICAgICovXG4gICAgc2V0SW4ocGF0aCwgdmFsdWUpIHtcbiAgICAgICAgY29uc3QgW2tleSwgLi4ucmVzdF0gPSBwYXRoO1xuICAgICAgICBpZiAocmVzdC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KGtleSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3Qgbm9kZSA9IHRoaXMuZ2V0KGtleSwgdHJ1ZSk7XG4gICAgICAgICAgICBpZiAoaWRlbnRpdHkuaXNDb2xsZWN0aW9uKG5vZGUpKVxuICAgICAgICAgICAgICAgIG5vZGUuc2V0SW4ocmVzdCwgdmFsdWUpO1xuICAgICAgICAgICAgZWxzZSBpZiAobm9kZSA9PT0gdW5kZWZpbmVkICYmIHRoaXMuc2NoZW1hKVxuICAgICAgICAgICAgICAgIHRoaXMuc2V0KGtleSwgY29sbGVjdGlvbkZyb21QYXRoKHRoaXMuc2NoZW1hLCByZXN0LCB2YWx1ZSkpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgWUFNTCBjb2xsZWN0aW9uIGF0ICR7a2V5fS4gUmVtYWluaW5nIHBhdGg6ICR7cmVzdH1gKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0cy5Db2xsZWN0aW9uID0gQ29sbGVjdGlvbjtcbmV4cG9ydHMuY29sbGVjdGlvbkZyb21QYXRoID0gY29sbGVjdGlvbkZyb21QYXRoO1xuZXhwb3J0cy5pc0VtcHR5UGF0aCA9IGlzRW1wdHlQYXRoO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogU3RyaW5naWZpZXMgYSBjb21tZW50LlxuICpcbiAqIEVtcHR5IGNvbW1lbnQgbGluZXMgYXJlIGxlZnQgZW1wdHksXG4gKiBsaW5lcyBjb25zaXN0aW5nIG9mIGEgc2luZ2xlIHNwYWNlIGFyZSByZXBsYWNlZCBieSBgI2AsXG4gKiBhbmQgYWxsIG90aGVyIGxpbmVzIGFyZSBwcmVmaXhlZCB3aXRoIGEgYCNgLlxuICovXG5jb25zdCBzdHJpbmdpZnlDb21tZW50ID0gKHN0cikgPT4gc3RyLnJlcGxhY2UoL14oPyEkKSg/OiAkKT8vZ20sICcjJyk7XG5mdW5jdGlvbiBpbmRlbnRDb21tZW50KGNvbW1lbnQsIGluZGVudCkge1xuICAgIGlmICgvXlxcbiskLy50ZXN0KGNvbW1lbnQpKVxuICAgICAgICByZXR1cm4gY29tbWVudC5zdWJzdHJpbmcoMSk7XG4gICAgcmV0dXJuIGluZGVudCA/IGNvbW1lbnQucmVwbGFjZSgvXig/ISAqJCkvZ20sIGluZGVudCkgOiBjb21tZW50O1xufVxuY29uc3QgbGluZUNvbW1lbnQgPSAoc3RyLCBpbmRlbnQsIGNvbW1lbnQpID0+IHN0ci5lbmRzV2l0aCgnXFxuJylcbiAgICA/IGluZGVudENvbW1lbnQoY29tbWVudCwgaW5kZW50KVxuICAgIDogY29tbWVudC5pbmNsdWRlcygnXFxuJylcbiAgICAgICAgPyAnXFxuJyArIGluZGVudENvbW1lbnQoY29tbWVudCwgaW5kZW50KVxuICAgICAgICA6IChzdHIuZW5kc1dpdGgoJyAnKSA/ICcnIDogJyAnKSArIGNvbW1lbnQ7XG5cbmV4cG9ydHMuaW5kZW50Q29tbWVudCA9IGluZGVudENvbW1lbnQ7XG5leHBvcnRzLmxpbmVDb21tZW50ID0gbGluZUNvbW1lbnQ7XG5leHBvcnRzLnN0cmluZ2lmeUNvbW1lbnQgPSBzdHJpbmdpZnlDb21tZW50O1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbmNvbnN0IEZPTERfRkxPVyA9ICdmbG93JztcbmNvbnN0IEZPTERfQkxPQ0sgPSAnYmxvY2snO1xuY29uc3QgRk9MRF9RVU9URUQgPSAncXVvdGVkJztcbi8qKlxuICogVHJpZXMgdG8ga2VlcCBpbnB1dCBhdCB1cCB0byBgbGluZVdpZHRoYCBjaGFyYWN0ZXJzLCBzcGxpdHRpbmcgb25seSBvbiBzcGFjZXNcbiAqIG5vdCBmb2xsb3dlZCBieSBuZXdsaW5lcyBvciBzcGFjZXMgdW5sZXNzIGBtb2RlYCBpcyBgJ3F1b3RlZCdgLiBMaW5lcyBhcmVcbiAqIHRlcm1pbmF0ZWQgd2l0aCBgXFxuYCBhbmQgc3RhcnRlZCB3aXRoIGBpbmRlbnRgLlxuICovXG5mdW5jdGlvbiBmb2xkRmxvd0xpbmVzKHRleHQsIGluZGVudCwgbW9kZSA9ICdmbG93JywgeyBpbmRlbnRBdFN0YXJ0LCBsaW5lV2lkdGggPSA4MCwgbWluQ29udGVudFdpZHRoID0gMjAsIG9uRm9sZCwgb25PdmVyZmxvdyB9ID0ge30pIHtcbiAgICBpZiAoIWxpbmVXaWR0aCB8fCBsaW5lV2lkdGggPCAwKVxuICAgICAgICByZXR1cm4gdGV4dDtcbiAgICBpZiAobGluZVdpZHRoIDwgbWluQ29udGVudFdpZHRoKVxuICAgICAgICBtaW5Db250ZW50V2lkdGggPSAwO1xuICAgIGNvbnN0IGVuZFN0ZXAgPSBNYXRoLm1heCgxICsgbWluQ29udGVudFdpZHRoLCAxICsgbGluZVdpZHRoIC0gaW5kZW50Lmxlbmd0aCk7XG4gICAgaWYgKHRleHQubGVuZ3RoIDw9IGVuZFN0ZXApXG4gICAgICAgIHJldHVybiB0ZXh0O1xuICAgIGNvbnN0IGZvbGRzID0gW107XG4gICAgY29uc3QgZXNjYXBlZEZvbGRzID0ge307XG4gICAgbGV0IGVuZCA9IGxpbmVXaWR0aCAtIGluZGVudC5sZW5ndGg7XG4gICAgaWYgKHR5cGVvZiBpbmRlbnRBdFN0YXJ0ID09PSAnbnVtYmVyJykge1xuICAgICAgICBpZiAoaW5kZW50QXRTdGFydCA+IGxpbmVXaWR0aCAtIE1hdGgubWF4KDIsIG1pbkNvbnRlbnRXaWR0aCkpXG4gICAgICAgICAgICBmb2xkcy5wdXNoKDApO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBlbmQgPSBsaW5lV2lkdGggLSBpbmRlbnRBdFN0YXJ0O1xuICAgIH1cbiAgICBsZXQgc3BsaXQgPSB1bmRlZmluZWQ7XG4gICAgbGV0IHByZXYgPSB1bmRlZmluZWQ7XG4gICAgbGV0IG92ZXJmbG93ID0gZmFsc2U7XG4gICAgbGV0IGkgPSAtMTtcbiAgICBsZXQgZXNjU3RhcnQgPSAtMTtcbiAgICBsZXQgZXNjRW5kID0gLTE7XG4gICAgaWYgKG1vZGUgPT09IEZPTERfQkxPQ0spIHtcbiAgICAgICAgaSA9IGNvbnN1bWVNb3JlSW5kZW50ZWRMaW5lcyh0ZXh0LCBpLCBpbmRlbnQubGVuZ3RoKTtcbiAgICAgICAgaWYgKGkgIT09IC0xKVxuICAgICAgICAgICAgZW5kID0gaSArIGVuZFN0ZXA7XG4gICAgfVxuICAgIGZvciAobGV0IGNoOyAoY2ggPSB0ZXh0WyhpICs9IDEpXSk7KSB7XG4gICAgICAgIGlmIChtb2RlID09PSBGT0xEX1FVT1RFRCAmJiBjaCA9PT0gJ1xcXFwnKSB7XG4gICAgICAgICAgICBlc2NTdGFydCA9IGk7XG4gICAgICAgICAgICBzd2l0Y2ggKHRleHRbaSArIDFdKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAneCc6XG4gICAgICAgICAgICAgICAgICAgIGkgKz0gMztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAndSc6XG4gICAgICAgICAgICAgICAgICAgIGkgKz0gNTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnVSc6XG4gICAgICAgICAgICAgICAgICAgIGkgKz0gOTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgaSArPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZXNjRW5kID0gaTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2ggPT09ICdcXG4nKSB7XG4gICAgICAgICAgICBpZiAobW9kZSA9PT0gRk9MRF9CTE9DSylcbiAgICAgICAgICAgICAgICBpID0gY29uc3VtZU1vcmVJbmRlbnRlZExpbmVzKHRleHQsIGksIGluZGVudC5sZW5ndGgpO1xuICAgICAgICAgICAgZW5kID0gaSArIGluZGVudC5sZW5ndGggKyBlbmRTdGVwO1xuICAgICAgICAgICAgc3BsaXQgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoY2ggPT09ICcgJyAmJlxuICAgICAgICAgICAgICAgIHByZXYgJiZcbiAgICAgICAgICAgICAgICBwcmV2ICE9PSAnICcgJiZcbiAgICAgICAgICAgICAgICBwcmV2ICE9PSAnXFxuJyAmJlxuICAgICAgICAgICAgICAgIHByZXYgIT09ICdcXHQnKSB7XG4gICAgICAgICAgICAgICAgLy8gc3BhY2Ugc3Vycm91bmRlZCBieSBub24tc3BhY2UgY2FuIGJlIHJlcGxhY2VkIHdpdGggbmV3bGluZSArIGluZGVudFxuICAgICAgICAgICAgICAgIGNvbnN0IG5leHQgPSB0ZXh0W2kgKyAxXTtcbiAgICAgICAgICAgICAgICBpZiAobmV4dCAmJiBuZXh0ICE9PSAnICcgJiYgbmV4dCAhPT0gJ1xcbicgJiYgbmV4dCAhPT0gJ1xcdCcpXG4gICAgICAgICAgICAgICAgICAgIHNwbGl0ID0gaTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpID49IGVuZCkge1xuICAgICAgICAgICAgICAgIGlmIChzcGxpdCkge1xuICAgICAgICAgICAgICAgICAgICBmb2xkcy5wdXNoKHNwbGl0KTtcbiAgICAgICAgICAgICAgICAgICAgZW5kID0gc3BsaXQgKyBlbmRTdGVwO1xuICAgICAgICAgICAgICAgICAgICBzcGxpdCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAobW9kZSA9PT0gRk9MRF9RVU9URUQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gd2hpdGUtc3BhY2UgY29sbGVjdGVkIGF0IGVuZCBtYXkgc3RyZXRjaCBwYXN0IGxpbmVXaWR0aFxuICAgICAgICAgICAgICAgICAgICB3aGlsZSAocHJldiA9PT0gJyAnIHx8IHByZXYgPT09ICdcXHQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2ID0gY2g7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaCA9IHRleHRbKGkgKz0gMSldO1xuICAgICAgICAgICAgICAgICAgICAgICAgb3ZlcmZsb3cgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIEFjY291bnQgZm9yIG5ld2xpbmUgZXNjYXBlLCBidXQgZG9uJ3QgYnJlYWsgcHJlY2VkaW5nIGVzY2FwZVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBqID0gaSA+IGVzY0VuZCArIDEgPyBpIC0gMiA6IGVzY1N0YXJ0IC0gMTtcbiAgICAgICAgICAgICAgICAgICAgLy8gQmFpbCBvdXQgaWYgbGluZVdpZHRoICYgbWluQ29udGVudFdpZHRoIGFyZSBzaG9ydGVyIHRoYW4gYW4gZXNjYXBlIHN0cmluZ1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXNjYXBlZEZvbGRzW2pdKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgICAgICAgICAgICAgICAgIGZvbGRzLnB1c2goaik7XG4gICAgICAgICAgICAgICAgICAgIGVzY2FwZWRGb2xkc1tqXSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGVuZCA9IGogKyBlbmRTdGVwO1xuICAgICAgICAgICAgICAgICAgICBzcGxpdCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG92ZXJmbG93ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcHJldiA9IGNoO1xuICAgIH1cbiAgICBpZiAob3ZlcmZsb3cgJiYgb25PdmVyZmxvdylcbiAgICAgICAgb25PdmVyZmxvdygpO1xuICAgIGlmIChmb2xkcy5sZW5ndGggPT09IDApXG4gICAgICAgIHJldHVybiB0ZXh0O1xuICAgIGlmIChvbkZvbGQpXG4gICAgICAgIG9uRm9sZCgpO1xuICAgIGxldCByZXMgPSB0ZXh0LnNsaWNlKDAsIGZvbGRzWzBdKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZvbGRzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGNvbnN0IGZvbGQgPSBmb2xkc1tpXTtcbiAgICAgICAgY29uc3QgZW5kID0gZm9sZHNbaSArIDFdIHx8IHRleHQubGVuZ3RoO1xuICAgICAgICBpZiAoZm9sZCA9PT0gMClcbiAgICAgICAgICAgIHJlcyA9IGBcXG4ke2luZGVudH0ke3RleHQuc2xpY2UoMCwgZW5kKX1gO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChtb2RlID09PSBGT0xEX1FVT1RFRCAmJiBlc2NhcGVkRm9sZHNbZm9sZF0pXG4gICAgICAgICAgICAgICAgcmVzICs9IGAke3RleHRbZm9sZF19XFxcXGA7XG4gICAgICAgICAgICByZXMgKz0gYFxcbiR7aW5kZW50fSR7dGV4dC5zbGljZShmb2xkICsgMSwgZW5kKX1gO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXM7XG59XG4vKipcbiAqIFByZXN1bWVzIGBpICsgMWAgaXMgYXQgdGhlIHN0YXJ0IG9mIGEgbGluZVxuICogQHJldHVybnMgaW5kZXggb2YgbGFzdCBuZXdsaW5lIGluIG1vcmUtaW5kZW50ZWQgYmxvY2tcbiAqL1xuZnVuY3Rpb24gY29uc3VtZU1vcmVJbmRlbnRlZExpbmVzKHRleHQsIGksIGluZGVudCkge1xuICAgIGxldCBlbmQgPSBpO1xuICAgIGxldCBzdGFydCA9IGkgKyAxO1xuICAgIGxldCBjaCA9IHRleHRbc3RhcnRdO1xuICAgIHdoaWxlIChjaCA9PT0gJyAnIHx8IGNoID09PSAnXFx0Jykge1xuICAgICAgICBpZiAoaSA8IHN0YXJ0ICsgaW5kZW50KSB7XG4gICAgICAgICAgICBjaCA9IHRleHRbKytpXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICBjaCA9IHRleHRbKytpXTtcbiAgICAgICAgICAgIH0gd2hpbGUgKGNoICYmIGNoICE9PSAnXFxuJyk7XG4gICAgICAgICAgICBlbmQgPSBpO1xuICAgICAgICAgICAgc3RhcnQgPSBpICsgMTtcbiAgICAgICAgICAgIGNoID0gdGV4dFtzdGFydF07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGVuZDtcbn1cblxuZXhwb3J0cy5GT0xEX0JMT0NLID0gRk9MRF9CTE9DSztcbmV4cG9ydHMuRk9MRF9GTE9XID0gRk9MRF9GTE9XO1xuZXhwb3J0cy5GT0xEX1FVT1RFRCA9IEZPTERfUVVPVEVEO1xuZXhwb3J0cy5mb2xkRmxvd0xpbmVzID0gZm9sZEZsb3dMaW5lcztcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgU2NhbGFyID0gcmVxdWlyZSgnLi4vbm9kZXMvU2NhbGFyLmpzJyk7XG52YXIgZm9sZEZsb3dMaW5lcyA9IHJlcXVpcmUoJy4vZm9sZEZsb3dMaW5lcy5qcycpO1xuXG5jb25zdCBnZXRGb2xkT3B0aW9ucyA9IChjdHgsIGlzQmxvY2spID0+ICh7XG4gICAgaW5kZW50QXRTdGFydDogaXNCbG9jayA/IGN0eC5pbmRlbnQubGVuZ3RoIDogY3R4LmluZGVudEF0U3RhcnQsXG4gICAgbGluZVdpZHRoOiBjdHgub3B0aW9ucy5saW5lV2lkdGgsXG4gICAgbWluQ29udGVudFdpZHRoOiBjdHgub3B0aW9ucy5taW5Db250ZW50V2lkdGhcbn0pO1xuLy8gQWxzbyBjaGVja3MgZm9yIGxpbmVzIHN0YXJ0aW5nIHdpdGggJSwgYXMgcGFyc2luZyB0aGUgb3V0cHV0IGFzIFlBTUwgMS4xIHdpbGxcbi8vIHByZXN1bWUgdGhhdCdzIHN0YXJ0aW5nIGEgbmV3IGRvY3VtZW50LlxuY29uc3QgY29udGFpbnNEb2N1bWVudE1hcmtlciA9IChzdHIpID0+IC9eKCV8LS0tfFxcLlxcLlxcLikvbS50ZXN0KHN0cik7XG5mdW5jdGlvbiBsaW5lTGVuZ3RoT3ZlckxpbWl0KHN0ciwgbGluZVdpZHRoLCBpbmRlbnRMZW5ndGgpIHtcbiAgICBpZiAoIWxpbmVXaWR0aCB8fCBsaW5lV2lkdGggPCAwKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgY29uc3QgbGltaXQgPSBsaW5lV2lkdGggLSBpbmRlbnRMZW5ndGg7XG4gICAgY29uc3Qgc3RyTGVuID0gc3RyLmxlbmd0aDtcbiAgICBpZiAoc3RyTGVuIDw9IGxpbWl0KVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgZm9yIChsZXQgaSA9IDAsIHN0YXJ0ID0gMDsgaSA8IHN0ckxlbjsgKytpKSB7XG4gICAgICAgIGlmIChzdHJbaV0gPT09ICdcXG4nKSB7XG4gICAgICAgICAgICBpZiAoaSAtIHN0YXJ0ID4gbGltaXQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICBzdGFydCA9IGkgKyAxO1xuICAgICAgICAgICAgaWYgKHN0ckxlbiAtIHN0YXJ0IDw9IGxpbWl0KVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn1cbmZ1bmN0aW9uIGRvdWJsZVF1b3RlZFN0cmluZyh2YWx1ZSwgY3R4KSB7XG4gICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcbiAgICBpZiAoY3R4Lm9wdGlvbnMuZG91YmxlUXVvdGVkQXNKU09OKVxuICAgICAgICByZXR1cm4ganNvbjtcbiAgICBjb25zdCB7IGltcGxpY2l0S2V5IH0gPSBjdHg7XG4gICAgY29uc3QgbWluTXVsdGlMaW5lTGVuZ3RoID0gY3R4Lm9wdGlvbnMuZG91YmxlUXVvdGVkTWluTXVsdGlMaW5lTGVuZ3RoO1xuICAgIGNvbnN0IGluZGVudCA9IGN0eC5pbmRlbnQgfHwgKGNvbnRhaW5zRG9jdW1lbnRNYXJrZXIodmFsdWUpID8gJyAgJyA6ICcnKTtcbiAgICBsZXQgc3RyID0gJyc7XG4gICAgbGV0IHN0YXJ0ID0gMDtcbiAgICBmb3IgKGxldCBpID0gMCwgY2ggPSBqc29uW2ldOyBjaDsgY2ggPSBqc29uWysraV0pIHtcbiAgICAgICAgaWYgKGNoID09PSAnICcgJiYganNvbltpICsgMV0gPT09ICdcXFxcJyAmJiBqc29uW2kgKyAyXSA9PT0gJ24nKSB7XG4gICAgICAgICAgICAvLyBzcGFjZSBiZWZvcmUgbmV3bGluZSBuZWVkcyB0byBiZSBlc2NhcGVkIHRvIG5vdCBiZSBmb2xkZWRcbiAgICAgICAgICAgIHN0ciArPSBqc29uLnNsaWNlKHN0YXJ0LCBpKSArICdcXFxcICc7XG4gICAgICAgICAgICBpICs9IDE7XG4gICAgICAgICAgICBzdGFydCA9IGk7XG4gICAgICAgICAgICBjaCA9ICdcXFxcJztcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2ggPT09ICdcXFxcJylcbiAgICAgICAgICAgIHN3aXRjaCAoanNvbltpICsgMV0pIHtcbiAgICAgICAgICAgICAgICBjYXNlICd1JzpcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9IGpzb24uc2xpY2Uoc3RhcnQsIGkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29kZSA9IGpzb24uc3Vic3RyKGkgKyAyLCA0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoY29kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJzAwMDAnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0gJ1xcXFwwJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnMDAwNyc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ciArPSAnXFxcXGEnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICcwMDBiJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9ICdcXFxcdic7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJzAwMWInOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0gJ1xcXFxlJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnMDA4NSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ciArPSAnXFxcXE4nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICcwMGEwJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9ICdcXFxcXyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJzIwMjgnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0gJ1xcXFxMJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnMjAyOSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ciArPSAnXFxcXFAnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29kZS5zdWJzdHIoMCwgMikgPT09ICcwMCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0gJ1xcXFx4JyArIGNvZGUuc3Vic3RyKDIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0ganNvbi5zdWJzdHIoaSwgNik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpICs9IDU7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydCA9IGkgKyAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ24nOlxuICAgICAgICAgICAgICAgICAgICBpZiAoaW1wbGljaXRLZXkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIGpzb25baSArIDJdID09PSAnXCInIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICBqc29uLmxlbmd0aCA8IG1pbk11bHRpTGluZUxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaSArPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZm9sZGluZyB3aWxsIGVhdCBmaXJzdCBuZXdsaW5lXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHIgKz0ganNvbi5zbGljZShzdGFydCwgaSkgKyAnXFxuXFxuJztcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIChqc29uW2kgKyAyXSA9PT0gJ1xcXFwnICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAganNvbltpICsgM10gPT09ICduJyAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGpzb25baSArIDRdICE9PSAnXCInKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9ICdcXG4nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkgKz0gMjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHN0ciArPSBpbmRlbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzcGFjZSBhZnRlciBuZXdsaW5lIG5lZWRzIHRvIGJlIGVzY2FwZWQgdG8gbm90IGJlIGZvbGRlZFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGpzb25baSArIDJdID09PSAnICcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9ICdcXFxcJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGkgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0ID0gaSArIDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgaSArPSAxO1xuICAgICAgICAgICAgfVxuICAgIH1cbiAgICBzdHIgPSBzdGFydCA/IHN0ciArIGpzb24uc2xpY2Uoc3RhcnQpIDoganNvbjtcbiAgICByZXR1cm4gaW1wbGljaXRLZXlcbiAgICAgICAgPyBzdHJcbiAgICAgICAgOiBmb2xkRmxvd0xpbmVzLmZvbGRGbG93TGluZXMoc3RyLCBpbmRlbnQsIGZvbGRGbG93TGluZXMuRk9MRF9RVU9URUQsIGdldEZvbGRPcHRpb25zKGN0eCwgZmFsc2UpKTtcbn1cbmZ1bmN0aW9uIHNpbmdsZVF1b3RlZFN0cmluZyh2YWx1ZSwgY3R4KSB7XG4gICAgaWYgKGN0eC5vcHRpb25zLnNpbmdsZVF1b3RlID09PSBmYWxzZSB8fFxuICAgICAgICAoY3R4LmltcGxpY2l0S2V5ICYmIHZhbHVlLmluY2x1ZGVzKCdcXG4nKSkgfHxcbiAgICAgICAgL1sgXFx0XVxcbnxcXG5bIFxcdF0vLnRlc3QodmFsdWUpIC8vIHNpbmdsZSBxdW90ZWQgc3RyaW5nIGNhbid0IGhhdmUgbGVhZGluZyBvciB0cmFpbGluZyB3aGl0ZXNwYWNlIGFyb3VuZCBuZXdsaW5lXG4gICAgKVxuICAgICAgICByZXR1cm4gZG91YmxlUXVvdGVkU3RyaW5nKHZhbHVlLCBjdHgpO1xuICAgIGNvbnN0IGluZGVudCA9IGN0eC5pbmRlbnQgfHwgKGNvbnRhaW5zRG9jdW1lbnRNYXJrZXIodmFsdWUpID8gJyAgJyA6ICcnKTtcbiAgICBjb25zdCByZXMgPSBcIidcIiArIHZhbHVlLnJlcGxhY2UoLycvZywgXCInJ1wiKS5yZXBsYWNlKC9cXG4rL2csIGAkJlxcbiR7aW5kZW50fWApICsgXCInXCI7XG4gICAgcmV0dXJuIGN0eC5pbXBsaWNpdEtleVxuICAgICAgICA/IHJlc1xuICAgICAgICA6IGZvbGRGbG93TGluZXMuZm9sZEZsb3dMaW5lcyhyZXMsIGluZGVudCwgZm9sZEZsb3dMaW5lcy5GT0xEX0ZMT1csIGdldEZvbGRPcHRpb25zKGN0eCwgZmFsc2UpKTtcbn1cbmZ1bmN0aW9uIHF1b3RlZFN0cmluZyh2YWx1ZSwgY3R4KSB7XG4gICAgY29uc3QgeyBzaW5nbGVRdW90ZSB9ID0gY3R4Lm9wdGlvbnM7XG4gICAgbGV0IHFzO1xuICAgIGlmIChzaW5nbGVRdW90ZSA9PT0gZmFsc2UpXG4gICAgICAgIHFzID0gZG91YmxlUXVvdGVkU3RyaW5nO1xuICAgIGVsc2Uge1xuICAgICAgICBjb25zdCBoYXNEb3VibGUgPSB2YWx1ZS5pbmNsdWRlcygnXCInKTtcbiAgICAgICAgY29uc3QgaGFzU2luZ2xlID0gdmFsdWUuaW5jbHVkZXMoXCInXCIpO1xuICAgICAgICBpZiAoaGFzRG91YmxlICYmICFoYXNTaW5nbGUpXG4gICAgICAgICAgICBxcyA9IHNpbmdsZVF1b3RlZFN0cmluZztcbiAgICAgICAgZWxzZSBpZiAoaGFzU2luZ2xlICYmICFoYXNEb3VibGUpXG4gICAgICAgICAgICBxcyA9IGRvdWJsZVF1b3RlZFN0cmluZztcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcXMgPSBzaW5nbGVRdW90ZSA/IHNpbmdsZVF1b3RlZFN0cmluZyA6IGRvdWJsZVF1b3RlZFN0cmluZztcbiAgICB9XG4gICAgcmV0dXJuIHFzKHZhbHVlLCBjdHgpO1xufVxuLy8gVGhlIG5lZ2F0aXZlIGxvb2tiZWhpbmQgYXZvaWRzIGEgcG9seW5vbWlhbCBzZWFyY2gsXG4vLyBidXQgaXNuJ3Qgc3VwcG9ydGVkIHlldCBvbiBTYWZhcmk6IGh0dHBzOi8vY2FuaXVzZS5jb20vanMtcmVnZXhwLWxvb2tiZWhpbmRcbmxldCBibG9ja0VuZE5ld2xpbmVzO1xudHJ5IHtcbiAgICBibG9ja0VuZE5ld2xpbmVzID0gbmV3IFJlZ0V4cCgnKF58KD88IVxcbikpXFxuKyg/IVxcbnwkKScsICdnJyk7XG59XG5jYXRjaCB7XG4gICAgYmxvY2tFbmROZXdsaW5lcyA9IC9cXG4rKD8hXFxufCQpL2c7XG59XG5mdW5jdGlvbiBibG9ja1N0cmluZyh7IGNvbW1lbnQsIHR5cGUsIHZhbHVlIH0sIGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCkge1xuICAgIGNvbnN0IHsgYmxvY2tRdW90ZSwgY29tbWVudFN0cmluZywgbGluZVdpZHRoIH0gPSBjdHgub3B0aW9ucztcbiAgICAvLyAxLiBCbG9jayBjYW4ndCBlbmQgaW4gd2hpdGVzcGFjZSB1bmxlc3MgdGhlIGxhc3QgbGluZSBpcyBub24tZW1wdHkuXG4gICAgLy8gMi4gU3RyaW5ncyBjb25zaXN0aW5nIG9mIG9ubHkgd2hpdGVzcGFjZSBhcmUgYmVzdCByZW5kZXJlZCBleHBsaWNpdGx5LlxuICAgIGlmICghYmxvY2tRdW90ZSB8fCAvXFxuW1xcdCBdKyQvLnRlc3QodmFsdWUpKSB7XG4gICAgICAgIHJldHVybiBxdW90ZWRTdHJpbmcodmFsdWUsIGN0eCk7XG4gICAgfVxuICAgIGNvbnN0IGluZGVudCA9IGN0eC5pbmRlbnQgfHxcbiAgICAgICAgKGN0eC5mb3JjZUJsb2NrSW5kZW50IHx8IGNvbnRhaW5zRG9jdW1lbnRNYXJrZXIodmFsdWUpID8gJyAgJyA6ICcnKTtcbiAgICBjb25zdCBsaXRlcmFsID0gYmxvY2tRdW90ZSA9PT0gJ2xpdGVyYWwnXG4gICAgICAgID8gdHJ1ZVxuICAgICAgICA6IGJsb2NrUXVvdGUgPT09ICdmb2xkZWQnIHx8IHR5cGUgPT09IFNjYWxhci5TY2FsYXIuQkxPQ0tfRk9MREVEXG4gICAgICAgICAgICA/IGZhbHNlXG4gICAgICAgICAgICA6IHR5cGUgPT09IFNjYWxhci5TY2FsYXIuQkxPQ0tfTElURVJBTFxuICAgICAgICAgICAgICAgID8gdHJ1ZVxuICAgICAgICAgICAgICAgIDogIWxpbmVMZW5ndGhPdmVyTGltaXQodmFsdWUsIGxpbmVXaWR0aCwgaW5kZW50Lmxlbmd0aCk7XG4gICAgaWYgKCF2YWx1ZSlcbiAgICAgICAgcmV0dXJuIGxpdGVyYWwgPyAnfFxcbicgOiAnPlxcbic7XG4gICAgLy8gZGV0ZXJtaW5lIGNob21waW5nIGZyb20gd2hpdGVzcGFjZSBhdCB2YWx1ZSBlbmRcbiAgICBsZXQgY2hvbXA7XG4gICAgbGV0IGVuZFN0YXJ0O1xuICAgIGZvciAoZW5kU3RhcnQgPSB2YWx1ZS5sZW5ndGg7IGVuZFN0YXJ0ID4gMDsgLS1lbmRTdGFydCkge1xuICAgICAgICBjb25zdCBjaCA9IHZhbHVlW2VuZFN0YXJ0IC0gMV07XG4gICAgICAgIGlmIChjaCAhPT0gJ1xcbicgJiYgY2ggIT09ICdcXHQnICYmIGNoICE9PSAnICcpXG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG4gICAgbGV0IGVuZCA9IHZhbHVlLnN1YnN0cmluZyhlbmRTdGFydCk7XG4gICAgY29uc3QgZW5kTmxQb3MgPSBlbmQuaW5kZXhPZignXFxuJyk7XG4gICAgaWYgKGVuZE5sUG9zID09PSAtMSkge1xuICAgICAgICBjaG9tcCA9ICctJzsgLy8gc3RyaXBcbiAgICB9XG4gICAgZWxzZSBpZiAodmFsdWUgPT09IGVuZCB8fCBlbmRObFBvcyAhPT0gZW5kLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgY2hvbXAgPSAnKyc7IC8vIGtlZXBcbiAgICAgICAgaWYgKG9uQ2hvbXBLZWVwKVxuICAgICAgICAgICAgb25DaG9tcEtlZXAoKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNob21wID0gJyc7IC8vIGNsaXBcbiAgICB9XG4gICAgaWYgKGVuZCkge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlLnNsaWNlKDAsIC1lbmQubGVuZ3RoKTtcbiAgICAgICAgaWYgKGVuZFtlbmQubGVuZ3RoIC0gMV0gPT09ICdcXG4nKVxuICAgICAgICAgICAgZW5kID0gZW5kLnNsaWNlKDAsIC0xKTtcbiAgICAgICAgZW5kID0gZW5kLnJlcGxhY2UoYmxvY2tFbmROZXdsaW5lcywgYCQmJHtpbmRlbnR9YCk7XG4gICAgfVxuICAgIC8vIGRldGVybWluZSBpbmRlbnQgaW5kaWNhdG9yIGZyb20gd2hpdGVzcGFjZSBhdCB2YWx1ZSBzdGFydFxuICAgIGxldCBzdGFydFdpdGhTcGFjZSA9IGZhbHNlO1xuICAgIGxldCBzdGFydEVuZDtcbiAgICBsZXQgc3RhcnRObFBvcyA9IC0xO1xuICAgIGZvciAoc3RhcnRFbmQgPSAwOyBzdGFydEVuZCA8IHZhbHVlLmxlbmd0aDsgKytzdGFydEVuZCkge1xuICAgICAgICBjb25zdCBjaCA9IHZhbHVlW3N0YXJ0RW5kXTtcbiAgICAgICAgaWYgKGNoID09PSAnICcpXG4gICAgICAgICAgICBzdGFydFdpdGhTcGFjZSA9IHRydWU7XG4gICAgICAgIGVsc2UgaWYgKGNoID09PSAnXFxuJylcbiAgICAgICAgICAgIHN0YXJ0TmxQb3MgPSBzdGFydEVuZDtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGxldCBzdGFydCA9IHZhbHVlLnN1YnN0cmluZygwLCBzdGFydE5sUG9zIDwgc3RhcnRFbmQgPyBzdGFydE5sUG9zICsgMSA6IHN0YXJ0RW5kKTtcbiAgICBpZiAoc3RhcnQpIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5zdWJzdHJpbmcoc3RhcnQubGVuZ3RoKTtcbiAgICAgICAgc3RhcnQgPSBzdGFydC5yZXBsYWNlKC9cXG4rL2csIGAkJiR7aW5kZW50fWApO1xuICAgIH1cbiAgICBjb25zdCBpbmRlbnRTaXplID0gaW5kZW50ID8gJzInIDogJzEnOyAvLyByb290IGlzIGF0IC0xXG4gICAgLy8gTGVhZGluZyB8IG9yID4gaXMgYWRkZWQgbGF0ZXJcbiAgICBsZXQgaGVhZGVyID0gKHN0YXJ0V2l0aFNwYWNlID8gaW5kZW50U2l6ZSA6ICcnKSArIGNob21wO1xuICAgIGlmIChjb21tZW50KSB7XG4gICAgICAgIGhlYWRlciArPSAnICcgKyBjb21tZW50U3RyaW5nKGNvbW1lbnQucmVwbGFjZSgvID9bXFxyXFxuXSsvZywgJyAnKSk7XG4gICAgICAgIGlmIChvbkNvbW1lbnQpXG4gICAgICAgICAgICBvbkNvbW1lbnQoKTtcbiAgICB9XG4gICAgaWYgKCFsaXRlcmFsKSB7XG4gICAgICAgIGNvbnN0IGZvbGRlZFZhbHVlID0gdmFsdWVcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cXG4rL2csICdcXG4kJicpXG4gICAgICAgICAgICAucmVwbGFjZSgvKD86XnxcXG4pKFtcXHQgXS4qKSg/OihbXFxuXFx0IF0qKVxcbig/IVtcXG5cXHQgXSkpPy9nLCAnJDEkMicpIC8vIG1vcmUtaW5kZW50ZWQgbGluZXMgYXJlbid0IGZvbGRlZFxuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgXiBtb3JlLWluZC4gXiBlbXB0eSAgICAgXiBjYXB0dXJlIG5leHQgZW1wdHkgbGluZXMgb25seSBhdCBlbmQgb2YgaW5kZW50XG4gICAgICAgICAgICAucmVwbGFjZSgvXFxuKy9nLCBgJCYke2luZGVudH1gKTtcbiAgICAgICAgbGV0IGxpdGVyYWxGYWxsYmFjayA9IGZhbHNlO1xuICAgICAgICBjb25zdCBmb2xkT3B0aW9ucyA9IGdldEZvbGRPcHRpb25zKGN0eCwgdHJ1ZSk7XG4gICAgICAgIGlmIChibG9ja1F1b3RlICE9PSAnZm9sZGVkJyAmJiB0eXBlICE9PSBTY2FsYXIuU2NhbGFyLkJMT0NLX0ZPTERFRCkge1xuICAgICAgICAgICAgZm9sZE9wdGlvbnMub25PdmVyZmxvdyA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBsaXRlcmFsRmFsbGJhY2sgPSB0cnVlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBib2R5ID0gZm9sZEZsb3dMaW5lcy5mb2xkRmxvd0xpbmVzKGAke3N0YXJ0fSR7Zm9sZGVkVmFsdWV9JHtlbmR9YCwgaW5kZW50LCBmb2xkRmxvd0xpbmVzLkZPTERfQkxPQ0ssIGZvbGRPcHRpb25zKTtcbiAgICAgICAgaWYgKCFsaXRlcmFsRmFsbGJhY2spXG4gICAgICAgICAgICByZXR1cm4gYD4ke2hlYWRlcn1cXG4ke2luZGVudH0ke2JvZHl9YDtcbiAgICB9XG4gICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC9cXG4rL2csIGAkJiR7aW5kZW50fWApO1xuICAgIHJldHVybiBgfCR7aGVhZGVyfVxcbiR7aW5kZW50fSR7c3RhcnR9JHt2YWx1ZX0ke2VuZH1gO1xufVxuZnVuY3Rpb24gcGxhaW5TdHJpbmcoaXRlbSwgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKSB7XG4gICAgY29uc3QgeyB0eXBlLCB2YWx1ZSB9ID0gaXRlbTtcbiAgICBjb25zdCB7IGFjdHVhbFN0cmluZywgaW1wbGljaXRLZXksIGluZGVudCwgaW5kZW50U3RlcCwgaW5GbG93IH0gPSBjdHg7XG4gICAgaWYgKChpbXBsaWNpdEtleSAmJiB2YWx1ZS5pbmNsdWRlcygnXFxuJykpIHx8XG4gICAgICAgIChpbkZsb3cgJiYgL1tbXFxde30sXS8udGVzdCh2YWx1ZSkpKSB7XG4gICAgICAgIHJldHVybiBxdW90ZWRTdHJpbmcodmFsdWUsIGN0eCk7XG4gICAgfVxuICAgIGlmICgvXltcXG5cXHQgLFtcXF17fSMmKiF8PidcIiVAYF18Xls/LV0kfF5bPy1dWyBcXHRdfFtcXG46XVsgXFx0XXxbIFxcdF1cXG58W1xcblxcdCBdI3xbXFxuXFx0IDpdJC8udGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgLy8gbm90IGFsbG93ZWQ6XG4gICAgICAgIC8vIC0gJy0nIG9yICc/J1xuICAgICAgICAvLyAtIHN0YXJ0IHdpdGggYW4gaW5kaWNhdG9yIGNoYXJhY3RlciAoZXhjZXB0IFs/Oi1dKSBvciAvWz8tXSAvXG4gICAgICAgIC8vIC0gJ1xcbiAnLCAnOiAnIG9yICcgXFxuJyBhbnl3aGVyZVxuICAgICAgICAvLyAtICcjJyBub3QgcHJlY2VkZWQgYnkgYSBub24tc3BhY2UgY2hhclxuICAgICAgICAvLyAtIGVuZCB3aXRoICcgJyBvciAnOidcbiAgICAgICAgcmV0dXJuIGltcGxpY2l0S2V5IHx8IGluRmxvdyB8fCAhdmFsdWUuaW5jbHVkZXMoJ1xcbicpXG4gICAgICAgICAgICA/IHF1b3RlZFN0cmluZyh2YWx1ZSwgY3R4KVxuICAgICAgICAgICAgOiBibG9ja1N0cmluZyhpdGVtLCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApO1xuICAgIH1cbiAgICBpZiAoIWltcGxpY2l0S2V5ICYmXG4gICAgICAgICFpbkZsb3cgJiZcbiAgICAgICAgdHlwZSAhPT0gU2NhbGFyLlNjYWxhci5QTEFJTiAmJlxuICAgICAgICB2YWx1ZS5pbmNsdWRlcygnXFxuJykpIHtcbiAgICAgICAgLy8gV2hlcmUgYWxsb3dlZCAmIHR5cGUgbm90IHNldCBleHBsaWNpdGx5LCBwcmVmZXIgYmxvY2sgc3R5bGUgZm9yIG11bHRpbGluZSBzdHJpbmdzXG4gICAgICAgIHJldHVybiBibG9ja1N0cmluZyhpdGVtLCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApO1xuICAgIH1cbiAgICBpZiAoY29udGFpbnNEb2N1bWVudE1hcmtlcih2YWx1ZSkpIHtcbiAgICAgICAgaWYgKGluZGVudCA9PT0gJycpIHtcbiAgICAgICAgICAgIGN0eC5mb3JjZUJsb2NrSW5kZW50ID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybiBibG9ja1N0cmluZyhpdGVtLCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGltcGxpY2l0S2V5ICYmIGluZGVudCA9PT0gaW5kZW50U3RlcCkge1xuICAgICAgICAgICAgcmV0dXJuIHF1b3RlZFN0cmluZyh2YWx1ZSwgY3R4KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBzdHIgPSB2YWx1ZS5yZXBsYWNlKC9cXG4rL2csIGAkJlxcbiR7aW5kZW50fWApO1xuICAgIC8vIFZlcmlmeSB0aGF0IG91dHB1dCB3aWxsIGJlIHBhcnNlZCBhcyBhIHN0cmluZywgYXMgZS5nLiBwbGFpbiBudW1iZXJzIGFuZFxuICAgIC8vIGJvb2xlYW5zIGdldCBwYXJzZWQgd2l0aCB0aG9zZSB0eXBlcyBpbiB2MS4yIChlLmcuICc0MicsICd0cnVlJyAmICcwLjllLTMnKSxcbiAgICAvLyBhbmQgb3RoZXJzIGluIHYxLjEuXG4gICAgaWYgKGFjdHVhbFN0cmluZykge1xuICAgICAgICBjb25zdCB0ZXN0ID0gKHRhZykgPT4gdGFnLmRlZmF1bHQgJiYgdGFnLnRhZyAhPT0gJ3RhZzp5YW1sLm9yZywyMDAyOnN0cicgJiYgdGFnLnRlc3Q/LnRlc3Qoc3RyKTtcbiAgICAgICAgY29uc3QgeyBjb21wYXQsIHRhZ3MgfSA9IGN0eC5kb2Muc2NoZW1hO1xuICAgICAgICBpZiAodGFncy5zb21lKHRlc3QpIHx8IGNvbXBhdD8uc29tZSh0ZXN0KSlcbiAgICAgICAgICAgIHJldHVybiBxdW90ZWRTdHJpbmcodmFsdWUsIGN0eCk7XG4gICAgfVxuICAgIHJldHVybiBpbXBsaWNpdEtleVxuICAgICAgICA/IHN0clxuICAgICAgICA6IGZvbGRGbG93TGluZXMuZm9sZEZsb3dMaW5lcyhzdHIsIGluZGVudCwgZm9sZEZsb3dMaW5lcy5GT0xEX0ZMT1csIGdldEZvbGRPcHRpb25zKGN0eCwgZmFsc2UpKTtcbn1cbmZ1bmN0aW9uIHN0cmluZ2lmeVN0cmluZyhpdGVtLCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApIHtcbiAgICBjb25zdCB7IGltcGxpY2l0S2V5LCBpbkZsb3cgfSA9IGN0eDtcbiAgICBjb25zdCBzcyA9IHR5cGVvZiBpdGVtLnZhbHVlID09PSAnc3RyaW5nJ1xuICAgICAgICA/IGl0ZW1cbiAgICAgICAgOiBPYmplY3QuYXNzaWduKHt9LCBpdGVtLCB7IHZhbHVlOiBTdHJpbmcoaXRlbS52YWx1ZSkgfSk7XG4gICAgbGV0IHsgdHlwZSB9ID0gaXRlbTtcbiAgICBpZiAodHlwZSAhPT0gU2NhbGFyLlNjYWxhci5RVU9URV9ET1VCTEUpIHtcbiAgICAgICAgLy8gZm9yY2UgZG91YmxlIHF1b3RlcyBvbiBjb250cm9sIGNoYXJhY3RlcnMgJiB1bnBhaXJlZCBzdXJyb2dhdGVzXG4gICAgICAgIGlmICgvW1xceDAwLVxceDA4XFx4MGItXFx4MWZcXHg3Zi1cXHg5ZlxcdXtEODAwfS1cXHV7REZGRn1dL3UudGVzdChzcy52YWx1ZSkpXG4gICAgICAgICAgICB0eXBlID0gU2NhbGFyLlNjYWxhci5RVU9URV9ET1VCTEU7XG4gICAgfVxuICAgIGNvbnN0IF9zdHJpbmdpZnkgPSAoX3R5cGUpID0+IHtcbiAgICAgICAgc3dpdGNoIChfdHlwZSkge1xuICAgICAgICAgICAgY2FzZSBTY2FsYXIuU2NhbGFyLkJMT0NLX0ZPTERFRDpcbiAgICAgICAgICAgIGNhc2UgU2NhbGFyLlNjYWxhci5CTE9DS19MSVRFUkFMOlxuICAgICAgICAgICAgICAgIHJldHVybiBpbXBsaWNpdEtleSB8fCBpbkZsb3dcbiAgICAgICAgICAgICAgICAgICAgPyBxdW90ZWRTdHJpbmcoc3MudmFsdWUsIGN0eCkgLy8gYmxvY2tzIGFyZSBub3QgdmFsaWQgaW5zaWRlIGZsb3cgY29udGFpbmVyc1xuICAgICAgICAgICAgICAgICAgICA6IGJsb2NrU3RyaW5nKHNzLCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApO1xuICAgICAgICAgICAgY2FzZSBTY2FsYXIuU2NhbGFyLlFVT1RFX0RPVUJMRTpcbiAgICAgICAgICAgICAgICByZXR1cm4gZG91YmxlUXVvdGVkU3RyaW5nKHNzLnZhbHVlLCBjdHgpO1xuICAgICAgICAgICAgY2FzZSBTY2FsYXIuU2NhbGFyLlFVT1RFX1NJTkdMRTpcbiAgICAgICAgICAgICAgICByZXR1cm4gc2luZ2xlUXVvdGVkU3RyaW5nKHNzLnZhbHVlLCBjdHgpO1xuICAgICAgICAgICAgY2FzZSBTY2FsYXIuU2NhbGFyLlBMQUlOOlxuICAgICAgICAgICAgICAgIHJldHVybiBwbGFpblN0cmluZyhzcywgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKTtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGxldCByZXMgPSBfc3RyaW5naWZ5KHR5cGUpO1xuICAgIGlmIChyZXMgPT09IG51bGwpIHtcbiAgICAgICAgY29uc3QgeyBkZWZhdWx0S2V5VHlwZSwgZGVmYXVsdFN0cmluZ1R5cGUgfSA9IGN0eC5vcHRpb25zO1xuICAgICAgICBjb25zdCB0ID0gKGltcGxpY2l0S2V5ICYmIGRlZmF1bHRLZXlUeXBlKSB8fCBkZWZhdWx0U3RyaW5nVHlwZTtcbiAgICAgICAgcmVzID0gX3N0cmluZ2lmeSh0KTtcbiAgICAgICAgaWYgKHJlcyA9PT0gbnVsbClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5zdXBwb3J0ZWQgZGVmYXVsdCBzdHJpbmcgdHlwZSAke3R9YCk7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG59XG5cbmV4cG9ydHMuc3RyaW5naWZ5U3RyaW5nID0gc3RyaW5naWZ5U3RyaW5nO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBhbmNob3JzID0gcmVxdWlyZSgnLi4vZG9jL2FuY2hvcnMuanMnKTtcbnZhciBpZGVudGl0eSA9IHJlcXVpcmUoJy4uL25vZGVzL2lkZW50aXR5LmpzJyk7XG52YXIgc3RyaW5naWZ5Q29tbWVudCA9IHJlcXVpcmUoJy4vc3RyaW5naWZ5Q29tbWVudC5qcycpO1xudmFyIHN0cmluZ2lmeVN0cmluZyA9IHJlcXVpcmUoJy4vc3RyaW5naWZ5U3RyaW5nLmpzJyk7XG5cbmZ1bmN0aW9uIGNyZWF0ZVN0cmluZ2lmeUNvbnRleHQoZG9jLCBvcHRpb25zKSB7XG4gICAgY29uc3Qgb3B0ID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgIGJsb2NrUXVvdGU6IHRydWUsXG4gICAgICAgIGNvbW1lbnRTdHJpbmc6IHN0cmluZ2lmeUNvbW1lbnQuc3RyaW5naWZ5Q29tbWVudCxcbiAgICAgICAgZGVmYXVsdEtleVR5cGU6IG51bGwsXG4gICAgICAgIGRlZmF1bHRTdHJpbmdUeXBlOiAnUExBSU4nLFxuICAgICAgICBkaXJlY3RpdmVzOiBudWxsLFxuICAgICAgICBkb3VibGVRdW90ZWRBc0pTT046IGZhbHNlLFxuICAgICAgICBkb3VibGVRdW90ZWRNaW5NdWx0aUxpbmVMZW5ndGg6IDQwLFxuICAgICAgICBmYWxzZVN0cjogJ2ZhbHNlJyxcbiAgICAgICAgZmxvd0NvbGxlY3Rpb25QYWRkaW5nOiB0cnVlLFxuICAgICAgICBpbmRlbnRTZXE6IHRydWUsXG4gICAgICAgIGxpbmVXaWR0aDogODAsXG4gICAgICAgIG1pbkNvbnRlbnRXaWR0aDogMjAsXG4gICAgICAgIG51bGxTdHI6ICdudWxsJyxcbiAgICAgICAgc2ltcGxlS2V5czogZmFsc2UsXG4gICAgICAgIHNpbmdsZVF1b3RlOiBudWxsLFxuICAgICAgICB0cnVlU3RyOiAndHJ1ZScsXG4gICAgICAgIHZlcmlmeUFsaWFzT3JkZXI6IHRydWVcbiAgICB9LCBkb2Muc2NoZW1hLnRvU3RyaW5nT3B0aW9ucywgb3B0aW9ucyk7XG4gICAgbGV0IGluRmxvdztcbiAgICBzd2l0Y2ggKG9wdC5jb2xsZWN0aW9uU3R5bGUpIHtcbiAgICAgICAgY2FzZSAnYmxvY2snOlxuICAgICAgICAgICAgaW5GbG93ID0gZmFsc2U7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZmxvdyc6XG4gICAgICAgICAgICBpbkZsb3cgPSB0cnVlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBpbkZsb3cgPSBudWxsO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBhbmNob3JzOiBuZXcgU2V0KCksXG4gICAgICAgIGRvYyxcbiAgICAgICAgZmxvd0NvbGxlY3Rpb25QYWRkaW5nOiBvcHQuZmxvd0NvbGxlY3Rpb25QYWRkaW5nID8gJyAnIDogJycsXG4gICAgICAgIGluZGVudDogJycsXG4gICAgICAgIGluZGVudFN0ZXA6IHR5cGVvZiBvcHQuaW5kZW50ID09PSAnbnVtYmVyJyA/ICcgJy5yZXBlYXQob3B0LmluZGVudCkgOiAnICAnLFxuICAgICAgICBpbkZsb3csXG4gICAgICAgIG9wdGlvbnM6IG9wdFxuICAgIH07XG59XG5mdW5jdGlvbiBnZXRUYWdPYmplY3QodGFncywgaXRlbSkge1xuICAgIGlmIChpdGVtLnRhZykge1xuICAgICAgICBjb25zdCBtYXRjaCA9IHRhZ3MuZmlsdGVyKHQgPT4gdC50YWcgPT09IGl0ZW0udGFnKTtcbiAgICAgICAgaWYgKG1hdGNoLmxlbmd0aCA+IDApXG4gICAgICAgICAgICByZXR1cm4gbWF0Y2guZmluZCh0ID0+IHQuZm9ybWF0ID09PSBpdGVtLmZvcm1hdCkgPz8gbWF0Y2hbMF07XG4gICAgfVxuICAgIGxldCB0YWdPYmogPSB1bmRlZmluZWQ7XG4gICAgbGV0IG9iajtcbiAgICBpZiAoaWRlbnRpdHkuaXNTY2FsYXIoaXRlbSkpIHtcbiAgICAgICAgb2JqID0gaXRlbS52YWx1ZTtcbiAgICAgICAgbGV0IG1hdGNoID0gdGFncy5maWx0ZXIodCA9PiB0LmlkZW50aWZ5Py4ob2JqKSk7XG4gICAgICAgIGlmIChtYXRjaC5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICBjb25zdCB0ZXN0TWF0Y2ggPSBtYXRjaC5maWx0ZXIodCA9PiB0LnRlc3QpO1xuICAgICAgICAgICAgaWYgKHRlc3RNYXRjaC5sZW5ndGggPiAwKVxuICAgICAgICAgICAgICAgIG1hdGNoID0gdGVzdE1hdGNoO1xuICAgICAgICB9XG4gICAgICAgIHRhZ09iaiA9XG4gICAgICAgICAgICBtYXRjaC5maW5kKHQgPT4gdC5mb3JtYXQgPT09IGl0ZW0uZm9ybWF0KSA/PyBtYXRjaC5maW5kKHQgPT4gIXQuZm9ybWF0KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIG9iaiA9IGl0ZW07XG4gICAgICAgIHRhZ09iaiA9IHRhZ3MuZmluZCh0ID0+IHQubm9kZUNsYXNzICYmIG9iaiBpbnN0YW5jZW9mIHQubm9kZUNsYXNzKTtcbiAgICB9XG4gICAgaWYgKCF0YWdPYmopIHtcbiAgICAgICAgY29uc3QgbmFtZSA9IG9iaj8uY29uc3RydWN0b3I/Lm5hbWUgPz8gKG9iaiA9PT0gbnVsbCA/ICdudWxsJyA6IHR5cGVvZiBvYmopO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRhZyBub3QgcmVzb2x2ZWQgZm9yICR7bmFtZX0gdmFsdWVgKTtcbiAgICB9XG4gICAgcmV0dXJuIHRhZ09iajtcbn1cbi8vIG5lZWRzIHRvIGJlIGNhbGxlZCBiZWZvcmUgdmFsdWUgc3RyaW5naWZpZXIgdG8gYWxsb3cgZm9yIGNpcmN1bGFyIGFuY2hvciByZWZzXG5mdW5jdGlvbiBzdHJpbmdpZnlQcm9wcyhub2RlLCB0YWdPYmosIHsgYW5jaG9yczogYW5jaG9ycyQxLCBkb2MgfSkge1xuICAgIGlmICghZG9jLmRpcmVjdGl2ZXMpXG4gICAgICAgIHJldHVybiAnJztcbiAgICBjb25zdCBwcm9wcyA9IFtdO1xuICAgIGNvbnN0IGFuY2hvciA9IChpZGVudGl0eS5pc1NjYWxhcihub2RlKSB8fCBpZGVudGl0eS5pc0NvbGxlY3Rpb24obm9kZSkpICYmIG5vZGUuYW5jaG9yO1xuICAgIGlmIChhbmNob3IgJiYgYW5jaG9ycy5hbmNob3JJc1ZhbGlkKGFuY2hvcikpIHtcbiAgICAgICAgYW5jaG9ycyQxLmFkZChhbmNob3IpO1xuICAgICAgICBwcm9wcy5wdXNoKGAmJHthbmNob3J9YCk7XG4gICAgfVxuICAgIGNvbnN0IHRhZyA9IG5vZGUudGFnID8/ICh0YWdPYmouZGVmYXVsdCA/IG51bGwgOiB0YWdPYmoudGFnKTtcbiAgICBpZiAodGFnKVxuICAgICAgICBwcm9wcy5wdXNoKGRvYy5kaXJlY3RpdmVzLnRhZ1N0cmluZyh0YWcpKTtcbiAgICByZXR1cm4gcHJvcHMuam9pbignICcpO1xufVxuZnVuY3Rpb24gc3RyaW5naWZ5KGl0ZW0sIGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCkge1xuICAgIGlmIChpZGVudGl0eS5pc1BhaXIoaXRlbSkpXG4gICAgICAgIHJldHVybiBpdGVtLnRvU3RyaW5nKGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCk7XG4gICAgaWYgKGlkZW50aXR5LmlzQWxpYXMoaXRlbSkpIHtcbiAgICAgICAgaWYgKGN0eC5kb2MuZGlyZWN0aXZlcylcbiAgICAgICAgICAgIHJldHVybiBpdGVtLnRvU3RyaW5nKGN0eCk7XG4gICAgICAgIGlmIChjdHgucmVzb2x2ZWRBbGlhc2VzPy5oYXMoaXRlbSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYENhbm5vdCBzdHJpbmdpZnkgY2lyY3VsYXIgc3RydWN0dXJlIHdpdGhvdXQgYWxpYXMgbm9kZXNgKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChjdHgucmVzb2x2ZWRBbGlhc2VzKVxuICAgICAgICAgICAgICAgIGN0eC5yZXNvbHZlZEFsaWFzZXMuYWRkKGl0ZW0pO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGN0eC5yZXNvbHZlZEFsaWFzZXMgPSBuZXcgU2V0KFtpdGVtXSk7XG4gICAgICAgICAgICBpdGVtID0gaXRlbS5yZXNvbHZlKGN0eC5kb2MpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGxldCB0YWdPYmogPSB1bmRlZmluZWQ7XG4gICAgY29uc3Qgbm9kZSA9IGlkZW50aXR5LmlzTm9kZShpdGVtKVxuICAgICAgICA/IGl0ZW1cbiAgICAgICAgOiBjdHguZG9jLmNyZWF0ZU5vZGUoaXRlbSwgeyBvblRhZ09iajogbyA9PiAodGFnT2JqID0gbykgfSk7XG4gICAgdGFnT2JqID8/ICh0YWdPYmogPSBnZXRUYWdPYmplY3QoY3R4LmRvYy5zY2hlbWEudGFncywgbm9kZSkpO1xuICAgIGNvbnN0IHByb3BzID0gc3RyaW5naWZ5UHJvcHMobm9kZSwgdGFnT2JqLCBjdHgpO1xuICAgIGlmIChwcm9wcy5sZW5ndGggPiAwKVxuICAgICAgICBjdHguaW5kZW50QXRTdGFydCA9IChjdHguaW5kZW50QXRTdGFydCA/PyAwKSArIHByb3BzLmxlbmd0aCArIDE7XG4gICAgY29uc3Qgc3RyID0gdHlwZW9mIHRhZ09iai5zdHJpbmdpZnkgPT09ICdmdW5jdGlvbidcbiAgICAgICAgPyB0YWdPYmouc3RyaW5naWZ5KG5vZGUsIGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcClcbiAgICAgICAgOiBpZGVudGl0eS5pc1NjYWxhcihub2RlKVxuICAgICAgICAgICAgPyBzdHJpbmdpZnlTdHJpbmcuc3RyaW5naWZ5U3RyaW5nKG5vZGUsIGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcClcbiAgICAgICAgICAgIDogbm9kZS50b1N0cmluZyhjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApO1xuICAgIGlmICghcHJvcHMpXG4gICAgICAgIHJldHVybiBzdHI7XG4gICAgcmV0dXJuIGlkZW50aXR5LmlzU2NhbGFyKG5vZGUpIHx8IHN0clswXSA9PT0gJ3snIHx8IHN0clswXSA9PT0gJ1snXG4gICAgICAgID8gYCR7cHJvcHN9ICR7c3RyfWBcbiAgICAgICAgOiBgJHtwcm9wc31cXG4ke2N0eC5pbmRlbnR9JHtzdHJ9YDtcbn1cblxuZXhwb3J0cy5jcmVhdGVTdHJpbmdpZnlDb250ZXh0ID0gY3JlYXRlU3RyaW5naWZ5Q29udGV4dDtcbmV4cG9ydHMuc3RyaW5naWZ5ID0gc3RyaW5naWZ5O1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBpZGVudGl0eSA9IHJlcXVpcmUoJy4uL25vZGVzL2lkZW50aXR5LmpzJyk7XG52YXIgU2NhbGFyID0gcmVxdWlyZSgnLi4vbm9kZXMvU2NhbGFyLmpzJyk7XG52YXIgc3RyaW5naWZ5ID0gcmVxdWlyZSgnLi9zdHJpbmdpZnkuanMnKTtcbnZhciBzdHJpbmdpZnlDb21tZW50ID0gcmVxdWlyZSgnLi9zdHJpbmdpZnlDb21tZW50LmpzJyk7XG5cbmZ1bmN0aW9uIHN0cmluZ2lmeVBhaXIoeyBrZXksIHZhbHVlIH0sIGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCkge1xuICAgIGNvbnN0IHsgYWxsTnVsbFZhbHVlcywgZG9jLCBpbmRlbnQsIGluZGVudFN0ZXAsIG9wdGlvbnM6IHsgY29tbWVudFN0cmluZywgaW5kZW50U2VxLCBzaW1wbGVLZXlzIH0gfSA9IGN0eDtcbiAgICBsZXQga2V5Q29tbWVudCA9IChpZGVudGl0eS5pc05vZGUoa2V5KSAmJiBrZXkuY29tbWVudCkgfHwgbnVsbDtcbiAgICBpZiAoc2ltcGxlS2V5cykge1xuICAgICAgICBpZiAoa2V5Q29tbWVudCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdXaXRoIHNpbXBsZSBrZXlzLCBrZXkgbm9kZXMgY2Fubm90IGhhdmUgY29tbWVudHMnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaWRlbnRpdHkuaXNDb2xsZWN0aW9uKGtleSkgfHwgKCFpZGVudGl0eS5pc05vZGUoa2V5KSAmJiB0eXBlb2Yga2V5ID09PSAnb2JqZWN0JykpIHtcbiAgICAgICAgICAgIGNvbnN0IG1zZyA9ICdXaXRoIHNpbXBsZSBrZXlzLCBjb2xsZWN0aW9uIGNhbm5vdCBiZSB1c2VkIGFzIGEga2V5IHZhbHVlJztcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGxldCBleHBsaWNpdEtleSA9ICFzaW1wbGVLZXlzICYmXG4gICAgICAgICgha2V5IHx8XG4gICAgICAgICAgICAoa2V5Q29tbWVudCAmJiB2YWx1ZSA9PSBudWxsICYmICFjdHguaW5GbG93KSB8fFxuICAgICAgICAgICAgaWRlbnRpdHkuaXNDb2xsZWN0aW9uKGtleSkgfHxcbiAgICAgICAgICAgIChpZGVudGl0eS5pc1NjYWxhcihrZXkpXG4gICAgICAgICAgICAgICAgPyBrZXkudHlwZSA9PT0gU2NhbGFyLlNjYWxhci5CTE9DS19GT0xERUQgfHwga2V5LnR5cGUgPT09IFNjYWxhci5TY2FsYXIuQkxPQ0tfTElURVJBTFxuICAgICAgICAgICAgICAgIDogdHlwZW9mIGtleSA9PT0gJ29iamVjdCcpKTtcbiAgICBjdHggPSBPYmplY3QuYXNzaWduKHt9LCBjdHgsIHtcbiAgICAgICAgYWxsTnVsbFZhbHVlczogZmFsc2UsXG4gICAgICAgIGltcGxpY2l0S2V5OiAhZXhwbGljaXRLZXkgJiYgKHNpbXBsZUtleXMgfHwgIWFsbE51bGxWYWx1ZXMpLFxuICAgICAgICBpbmRlbnQ6IGluZGVudCArIGluZGVudFN0ZXBcbiAgICB9KTtcbiAgICBsZXQga2V5Q29tbWVudERvbmUgPSBmYWxzZTtcbiAgICBsZXQgY2hvbXBLZWVwID0gZmFsc2U7XG4gICAgbGV0IHN0ciA9IHN0cmluZ2lmeS5zdHJpbmdpZnkoa2V5LCBjdHgsICgpID0+IChrZXlDb21tZW50RG9uZSA9IHRydWUpLCAoKSA9PiAoY2hvbXBLZWVwID0gdHJ1ZSkpO1xuICAgIGlmICghZXhwbGljaXRLZXkgJiYgIWN0eC5pbkZsb3cgJiYgc3RyLmxlbmd0aCA+IDEwMjQpIHtcbiAgICAgICAgaWYgKHNpbXBsZUtleXMpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1dpdGggc2ltcGxlIGtleXMsIHNpbmdsZSBsaW5lIHNjYWxhciBtdXN0IG5vdCBzcGFuIG1vcmUgdGhhbiAxMDI0IGNoYXJhY3RlcnMnKTtcbiAgICAgICAgZXhwbGljaXRLZXkgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAoY3R4LmluRmxvdykge1xuICAgICAgICBpZiAoYWxsTnVsbFZhbHVlcyB8fCB2YWx1ZSA9PSBudWxsKSB7XG4gICAgICAgICAgICBpZiAoa2V5Q29tbWVudERvbmUgJiYgb25Db21tZW50KVxuICAgICAgICAgICAgICAgIG9uQ29tbWVudCgpO1xuICAgICAgICAgICAgcmV0dXJuIHN0ciA9PT0gJycgPyAnPycgOiBleHBsaWNpdEtleSA/IGA/ICR7c3RyfWAgOiBzdHI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoKGFsbE51bGxWYWx1ZXMgJiYgIXNpbXBsZUtleXMpIHx8ICh2YWx1ZSA9PSBudWxsICYmIGV4cGxpY2l0S2V5KSkge1xuICAgICAgICBzdHIgPSBgPyAke3N0cn1gO1xuICAgICAgICBpZiAoa2V5Q29tbWVudCAmJiAha2V5Q29tbWVudERvbmUpIHtcbiAgICAgICAgICAgIHN0ciArPSBzdHJpbmdpZnlDb21tZW50LmxpbmVDb21tZW50KHN0ciwgY3R4LmluZGVudCwgY29tbWVudFN0cmluZyhrZXlDb21tZW50KSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoY2hvbXBLZWVwICYmIG9uQ2hvbXBLZWVwKVxuICAgICAgICAgICAgb25DaG9tcEtlZXAoKTtcbiAgICAgICAgcmV0dXJuIHN0cjtcbiAgICB9XG4gICAgaWYgKGtleUNvbW1lbnREb25lKVxuICAgICAgICBrZXlDb21tZW50ID0gbnVsbDtcbiAgICBpZiAoZXhwbGljaXRLZXkpIHtcbiAgICAgICAgaWYgKGtleUNvbW1lbnQpXG4gICAgICAgICAgICBzdHIgKz0gc3RyaW5naWZ5Q29tbWVudC5saW5lQ29tbWVudChzdHIsIGN0eC5pbmRlbnQsIGNvbW1lbnRTdHJpbmcoa2V5Q29tbWVudCkpO1xuICAgICAgICBzdHIgPSBgPyAke3N0cn1cXG4ke2luZGVudH06YDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHN0ciA9IGAke3N0cn06YDtcbiAgICAgICAgaWYgKGtleUNvbW1lbnQpXG4gICAgICAgICAgICBzdHIgKz0gc3RyaW5naWZ5Q29tbWVudC5saW5lQ29tbWVudChzdHIsIGN0eC5pbmRlbnQsIGNvbW1lbnRTdHJpbmcoa2V5Q29tbWVudCkpO1xuICAgIH1cbiAgICBsZXQgdnNiLCB2Y2IsIHZhbHVlQ29tbWVudDtcbiAgICBpZiAoaWRlbnRpdHkuaXNOb2RlKHZhbHVlKSkge1xuICAgICAgICB2c2IgPSAhIXZhbHVlLnNwYWNlQmVmb3JlO1xuICAgICAgICB2Y2IgPSB2YWx1ZS5jb21tZW50QmVmb3JlO1xuICAgICAgICB2YWx1ZUNvbW1lbnQgPSB2YWx1ZS5jb21tZW50O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdnNiID0gZmFsc2U7XG4gICAgICAgIHZjYiA9IG51bGw7XG4gICAgICAgIHZhbHVlQ29tbWVudCA9IG51bGw7XG4gICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKVxuICAgICAgICAgICAgdmFsdWUgPSBkb2MuY3JlYXRlTm9kZSh2YWx1ZSk7XG4gICAgfVxuICAgIGN0eC5pbXBsaWNpdEtleSA9IGZhbHNlO1xuICAgIGlmICghZXhwbGljaXRLZXkgJiYgIWtleUNvbW1lbnQgJiYgaWRlbnRpdHkuaXNTY2FsYXIodmFsdWUpKVxuICAgICAgICBjdHguaW5kZW50QXRTdGFydCA9IHN0ci5sZW5ndGggKyAxO1xuICAgIGNob21wS2VlcCA9IGZhbHNlO1xuICAgIGlmICghaW5kZW50U2VxICYmXG4gICAgICAgIGluZGVudFN0ZXAubGVuZ3RoID49IDIgJiZcbiAgICAgICAgIWN0eC5pbkZsb3cgJiZcbiAgICAgICAgIWV4cGxpY2l0S2V5ICYmXG4gICAgICAgIGlkZW50aXR5LmlzU2VxKHZhbHVlKSAmJlxuICAgICAgICAhdmFsdWUuZmxvdyAmJlxuICAgICAgICAhdmFsdWUudGFnICYmXG4gICAgICAgICF2YWx1ZS5hbmNob3IpIHtcbiAgICAgICAgLy8gSWYgaW5kZW50U2VxID09PSBmYWxzZSwgY29uc2lkZXIgJy0gJyBhcyBwYXJ0IG9mIGluZGVudGF0aW9uIHdoZXJlIHBvc3NpYmxlXG4gICAgICAgIGN0eC5pbmRlbnQgPSBjdHguaW5kZW50LnN1YnN0cmluZygyKTtcbiAgICB9XG4gICAgbGV0IHZhbHVlQ29tbWVudERvbmUgPSBmYWxzZTtcbiAgICBjb25zdCB2YWx1ZVN0ciA9IHN0cmluZ2lmeS5zdHJpbmdpZnkodmFsdWUsIGN0eCwgKCkgPT4gKHZhbHVlQ29tbWVudERvbmUgPSB0cnVlKSwgKCkgPT4gKGNob21wS2VlcCA9IHRydWUpKTtcbiAgICBsZXQgd3MgPSAnICc7XG4gICAgaWYgKGtleUNvbW1lbnQgfHwgdnNiIHx8IHZjYikge1xuICAgICAgICB3cyA9IHZzYiA/ICdcXG4nIDogJyc7XG4gICAgICAgIGlmICh2Y2IpIHtcbiAgICAgICAgICAgIGNvbnN0IGNzID0gY29tbWVudFN0cmluZyh2Y2IpO1xuICAgICAgICAgICAgd3MgKz0gYFxcbiR7c3RyaW5naWZ5Q29tbWVudC5pbmRlbnRDb21tZW50KGNzLCBjdHguaW5kZW50KX1gO1xuICAgICAgICB9XG4gICAgICAgIGlmICh2YWx1ZVN0ciA9PT0gJycgJiYgIWN0eC5pbkZsb3cpIHtcbiAgICAgICAgICAgIGlmICh3cyA9PT0gJ1xcbicgJiYgdmFsdWVDb21tZW50KVxuICAgICAgICAgICAgICAgIHdzID0gJ1xcblxcbic7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB3cyArPSBgXFxuJHtjdHguaW5kZW50fWA7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoIWV4cGxpY2l0S2V5ICYmIGlkZW50aXR5LmlzQ29sbGVjdGlvbih2YWx1ZSkpIHtcbiAgICAgICAgY29uc3QgdnMwID0gdmFsdWVTdHJbMF07XG4gICAgICAgIGNvbnN0IG5sMCA9IHZhbHVlU3RyLmluZGV4T2YoJ1xcbicpO1xuICAgICAgICBjb25zdCBoYXNOZXdsaW5lID0gbmwwICE9PSAtMTtcbiAgICAgICAgY29uc3QgZmxvdyA9IGN0eC5pbkZsb3cgPz8gdmFsdWUuZmxvdyA/PyB2YWx1ZS5pdGVtcy5sZW5ndGggPT09IDA7XG4gICAgICAgIGlmIChoYXNOZXdsaW5lIHx8ICFmbG93KSB7XG4gICAgICAgICAgICBsZXQgaGFzUHJvcHNMaW5lID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAoaGFzTmV3bGluZSAmJiAodnMwID09PSAnJicgfHwgdnMwID09PSAnIScpKSB7XG4gICAgICAgICAgICAgICAgbGV0IHNwMCA9IHZhbHVlU3RyLmluZGV4T2YoJyAnKTtcbiAgICAgICAgICAgICAgICBpZiAodnMwID09PSAnJicgJiZcbiAgICAgICAgICAgICAgICAgICAgc3AwICE9PSAtMSAmJlxuICAgICAgICAgICAgICAgICAgICBzcDAgPCBubDAgJiZcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVTdHJbc3AwICsgMV0gPT09ICchJykge1xuICAgICAgICAgICAgICAgICAgICBzcDAgPSB2YWx1ZVN0ci5pbmRleE9mKCcgJywgc3AwICsgMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChzcDAgPT09IC0xIHx8IG5sMCA8IHNwMClcbiAgICAgICAgICAgICAgICAgICAgaGFzUHJvcHNMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaGFzUHJvcHNMaW5lKVxuICAgICAgICAgICAgICAgIHdzID0gYFxcbiR7Y3R4LmluZGVudH1gO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKHZhbHVlU3RyID09PSAnJyB8fCB2YWx1ZVN0clswXSA9PT0gJ1xcbicpIHtcbiAgICAgICAgd3MgPSAnJztcbiAgICB9XG4gICAgc3RyICs9IHdzICsgdmFsdWVTdHI7XG4gICAgaWYgKGN0eC5pbkZsb3cpIHtcbiAgICAgICAgaWYgKHZhbHVlQ29tbWVudERvbmUgJiYgb25Db21tZW50KVxuICAgICAgICAgICAgb25Db21tZW50KCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHZhbHVlQ29tbWVudCAmJiAhdmFsdWVDb21tZW50RG9uZSkge1xuICAgICAgICBzdHIgKz0gc3RyaW5naWZ5Q29tbWVudC5saW5lQ29tbWVudChzdHIsIGN0eC5pbmRlbnQsIGNvbW1lbnRTdHJpbmcodmFsdWVDb21tZW50KSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGNob21wS2VlcCAmJiBvbkNob21wS2VlcCkge1xuICAgICAgICBvbkNob21wS2VlcCgpO1xuICAgIH1cbiAgICByZXR1cm4gc3RyO1xufVxuXG5leHBvcnRzLnN0cmluZ2lmeVBhaXIgPSBzdHJpbmdpZnlQYWlyO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBub2RlX3Byb2Nlc3MgPSByZXF1aXJlKCdwcm9jZXNzJyk7XG5cbmZ1bmN0aW9uIGRlYnVnKGxvZ0xldmVsLCAuLi5tZXNzYWdlcykge1xuICAgIGlmIChsb2dMZXZlbCA9PT0gJ2RlYnVnJylcbiAgICAgICAgY29uc29sZS5sb2coLi4ubWVzc2FnZXMpO1xufVxuZnVuY3Rpb24gd2Fybihsb2dMZXZlbCwgd2FybmluZykge1xuICAgIGlmIChsb2dMZXZlbCA9PT0gJ2RlYnVnJyB8fCBsb2dMZXZlbCA9PT0gJ3dhcm4nKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygbm9kZV9wcm9jZXNzLmVtaXRXYXJuaW5nID09PSAnZnVuY3Rpb24nKVxuICAgICAgICAgICAgbm9kZV9wcm9jZXNzLmVtaXRXYXJuaW5nKHdhcm5pbmcpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjb25zb2xlLndhcm4od2FybmluZyk7XG4gICAgfVxufVxuXG5leHBvcnRzLmRlYnVnID0gZGVidWc7XG5leHBvcnRzLndhcm4gPSB3YXJuO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBpZGVudGl0eSA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL2lkZW50aXR5LmpzJyk7XG52YXIgU2NhbGFyID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvU2NhbGFyLmpzJyk7XG5cbi8vIElmIHRoZSB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggYSBtZXJnZSBrZXkgaXMgYSBzaW5nbGUgbWFwcGluZyBub2RlLCBlYWNoIG9mXG4vLyBpdHMga2V5L3ZhbHVlIHBhaXJzIGlzIGluc2VydGVkIGludG8gdGhlIGN1cnJlbnQgbWFwcGluZywgdW5sZXNzIHRoZSBrZXlcbi8vIGFscmVhZHkgZXhpc3RzIGluIGl0LiBJZiB0aGUgdmFsdWUgYXNzb2NpYXRlZCB3aXRoIHRoZSBtZXJnZSBrZXkgaXMgYVxuLy8gc2VxdWVuY2UsIHRoZW4gdGhpcyBzZXF1ZW5jZSBpcyBleHBlY3RlZCB0byBjb250YWluIG1hcHBpbmcgbm9kZXMgYW5kIGVhY2hcbi8vIG9mIHRoZXNlIG5vZGVzIGlzIG1lcmdlZCBpbiB0dXJuIGFjY29yZGluZyB0byBpdHMgb3JkZXIgaW4gdGhlIHNlcXVlbmNlLlxuLy8gS2V5cyBpbiBtYXBwaW5nIG5vZGVzIGVhcmxpZXIgaW4gdGhlIHNlcXVlbmNlIG92ZXJyaWRlIGtleXMgc3BlY2lmaWVkIGluXG4vLyBsYXRlciBtYXBwaW5nIG5vZGVzLiAtLSBodHRwOi8veWFtbC5vcmcvdHlwZS9tZXJnZS5odG1sXG5jb25zdCBNRVJHRV9LRVkgPSAnPDwnO1xuY29uc3QgbWVyZ2UgPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHZhbHVlID09PSBNRVJHRV9LRVkgfHxcbiAgICAgICAgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N5bWJvbCcgJiYgdmFsdWUuZGVzY3JpcHRpb24gPT09IE1FUkdFX0tFWSksXG4gICAgZGVmYXVsdDogJ2tleScsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6bWVyZ2UnLFxuICAgIHRlc3Q6IC9ePDwkLyxcbiAgICByZXNvbHZlOiAoKSA9PiBPYmplY3QuYXNzaWduKG5ldyBTY2FsYXIuU2NhbGFyKFN5bWJvbChNRVJHRV9LRVkpKSwge1xuICAgICAgICBhZGRUb0pTTWFwOiBhZGRNZXJnZVRvSlNNYXBcbiAgICB9KSxcbiAgICBzdHJpbmdpZnk6ICgpID0+IE1FUkdFX0tFWVxufTtcbmNvbnN0IGlzTWVyZ2VLZXkgPSAoY3R4LCBrZXkpID0+IChtZXJnZS5pZGVudGlmeShrZXkpIHx8XG4gICAgKGlkZW50aXR5LmlzU2NhbGFyKGtleSkgJiZcbiAgICAgICAgKCFrZXkudHlwZSB8fCBrZXkudHlwZSA9PT0gU2NhbGFyLlNjYWxhci5QTEFJTikgJiZcbiAgICAgICAgbWVyZ2UuaWRlbnRpZnkoa2V5LnZhbHVlKSkpICYmXG4gICAgY3R4Py5kb2Muc2NoZW1hLnRhZ3Muc29tZSh0YWcgPT4gdGFnLnRhZyA9PT0gbWVyZ2UudGFnICYmIHRhZy5kZWZhdWx0KTtcbmZ1bmN0aW9uIGFkZE1lcmdlVG9KU01hcChjdHgsIG1hcCwgdmFsdWUpIHtcbiAgICB2YWx1ZSA9IGN0eCAmJiBpZGVudGl0eS5pc0FsaWFzKHZhbHVlKSA/IHZhbHVlLnJlc29sdmUoY3R4LmRvYykgOiB2YWx1ZTtcbiAgICBpZiAoaWRlbnRpdHkuaXNTZXEodmFsdWUpKVxuICAgICAgICBmb3IgKGNvbnN0IGl0IG9mIHZhbHVlLml0ZW1zKVxuICAgICAgICAgICAgbWVyZ2VWYWx1ZShjdHgsIG1hcCwgaXQpO1xuICAgIGVsc2UgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKVxuICAgICAgICBmb3IgKGNvbnN0IGl0IG9mIHZhbHVlKVxuICAgICAgICAgICAgbWVyZ2VWYWx1ZShjdHgsIG1hcCwgaXQpO1xuICAgIGVsc2VcbiAgICAgICAgbWVyZ2VWYWx1ZShjdHgsIG1hcCwgdmFsdWUpO1xufVxuZnVuY3Rpb24gbWVyZ2VWYWx1ZShjdHgsIG1hcCwgdmFsdWUpIHtcbiAgICBjb25zdCBzb3VyY2UgPSBjdHggJiYgaWRlbnRpdHkuaXNBbGlhcyh2YWx1ZSkgPyB2YWx1ZS5yZXNvbHZlKGN0eC5kb2MpIDogdmFsdWU7XG4gICAgaWYgKCFpZGVudGl0eS5pc01hcChzb3VyY2UpKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ01lcmdlIHNvdXJjZXMgbXVzdCBiZSBtYXBzIG9yIG1hcCBhbGlhc2VzJyk7XG4gICAgY29uc3Qgc3JjTWFwID0gc291cmNlLnRvSlNPTihudWxsLCBjdHgsIE1hcCk7XG4gICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2Ygc3JjTWFwKSB7XG4gICAgICAgIGlmIChtYXAgaW5zdGFuY2VvZiBNYXApIHtcbiAgICAgICAgICAgIGlmICghbWFwLmhhcyhrZXkpKVxuICAgICAgICAgICAgICAgIG1hcC5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobWFwIGluc3RhbmNlb2YgU2V0KSB7XG4gICAgICAgICAgICBtYXAuYWRkKGtleSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChtYXAsIGtleSkpIHtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShtYXAsIGtleSwge1xuICAgICAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWFwO1xufVxuXG5leHBvcnRzLmFkZE1lcmdlVG9KU01hcCA9IGFkZE1lcmdlVG9KU01hcDtcbmV4cG9ydHMuaXNNZXJnZUtleSA9IGlzTWVyZ2VLZXk7XG5leHBvcnRzLm1lcmdlID0gbWVyZ2U7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIGxvZyA9IHJlcXVpcmUoJy4uL2xvZy5qcycpO1xudmFyIG1lcmdlID0gcmVxdWlyZSgnLi4vc2NoZW1hL3lhbWwtMS4xL21lcmdlLmpzJyk7XG52YXIgc3RyaW5naWZ5ID0gcmVxdWlyZSgnLi4vc3RyaW5naWZ5L3N0cmluZ2lmeS5qcycpO1xudmFyIGlkZW50aXR5ID0gcmVxdWlyZSgnLi9pZGVudGl0eS5qcycpO1xudmFyIHRvSlMgPSByZXF1aXJlKCcuL3RvSlMuanMnKTtcblxuZnVuY3Rpb24gYWRkUGFpclRvSlNNYXAoY3R4LCBtYXAsIHsga2V5LCB2YWx1ZSB9KSB7XG4gICAgaWYgKGlkZW50aXR5LmlzTm9kZShrZXkpICYmIGtleS5hZGRUb0pTTWFwKVxuICAgICAgICBrZXkuYWRkVG9KU01hcChjdHgsIG1hcCwgdmFsdWUpO1xuICAgIC8vIFRPRE86IFNob3VsZCBkcm9wIHRoaXMgc3BlY2lhbCBjYXNlIGZvciBiYXJlIDw8IGhhbmRsaW5nXG4gICAgZWxzZSBpZiAobWVyZ2UuaXNNZXJnZUtleShjdHgsIGtleSkpXG4gICAgICAgIG1lcmdlLmFkZE1lcmdlVG9KU01hcChjdHgsIG1hcCwgdmFsdWUpO1xuICAgIGVsc2Uge1xuICAgICAgICBjb25zdCBqc0tleSA9IHRvSlMudG9KUyhrZXksICcnLCBjdHgpO1xuICAgICAgICBpZiAobWFwIGluc3RhbmNlb2YgTWFwKSB7XG4gICAgICAgICAgICBtYXAuc2V0KGpzS2V5LCB0b0pTLnRvSlModmFsdWUsIGpzS2V5LCBjdHgpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChtYXAgaW5zdGFuY2VvZiBTZXQpIHtcbiAgICAgICAgICAgIG1hcC5hZGQoanNLZXkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3Qgc3RyaW5nS2V5ID0gc3RyaW5naWZ5S2V5KGtleSwganNLZXksIGN0eCk7XG4gICAgICAgICAgICBjb25zdCBqc1ZhbHVlID0gdG9KUy50b0pTKHZhbHVlLCBzdHJpbmdLZXksIGN0eCk7XG4gICAgICAgICAgICBpZiAoc3RyaW5nS2V5IGluIG1hcClcbiAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobWFwLCBzdHJpbmdLZXksIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGpzVmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBtYXBbc3RyaW5nS2V5XSA9IGpzVmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG1hcDtcbn1cbmZ1bmN0aW9uIHN0cmluZ2lmeUtleShrZXksIGpzS2V5LCBjdHgpIHtcbiAgICBpZiAoanNLZXkgPT09IG51bGwpXG4gICAgICAgIHJldHVybiAnJztcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWJhc2UtdG8tc3RyaW5nXG4gICAgaWYgKHR5cGVvZiBqc0tleSAhPT0gJ29iamVjdCcpXG4gICAgICAgIHJldHVybiBTdHJpbmcoanNLZXkpO1xuICAgIGlmIChpZGVudGl0eS5pc05vZGUoa2V5KSAmJiBjdHg/LmRvYykge1xuICAgICAgICBjb25zdCBzdHJDdHggPSBzdHJpbmdpZnkuY3JlYXRlU3RyaW5naWZ5Q29udGV4dChjdHguZG9jLCB7fSk7XG4gICAgICAgIHN0ckN0eC5hbmNob3JzID0gbmV3IFNldCgpO1xuICAgICAgICBmb3IgKGNvbnN0IG5vZGUgb2YgY3R4LmFuY2hvcnMua2V5cygpKVxuICAgICAgICAgICAgc3RyQ3R4LmFuY2hvcnMuYWRkKG5vZGUuYW5jaG9yKTtcbiAgICAgICAgc3RyQ3R4LmluRmxvdyA9IHRydWU7XG4gICAgICAgIHN0ckN0eC5pblN0cmluZ2lmeUtleSA9IHRydWU7XG4gICAgICAgIGNvbnN0IHN0cktleSA9IGtleS50b1N0cmluZyhzdHJDdHgpO1xuICAgICAgICBpZiAoIWN0eC5tYXBLZXlXYXJuZWQpIHtcbiAgICAgICAgICAgIGxldCBqc29uU3RyID0gSlNPTi5zdHJpbmdpZnkoc3RyS2V5KTtcbiAgICAgICAgICAgIGlmIChqc29uU3RyLmxlbmd0aCA+IDQwKVxuICAgICAgICAgICAgICAgIGpzb25TdHIgPSBqc29uU3RyLnN1YnN0cmluZygwLCAzNikgKyAnLi4uXCInO1xuICAgICAgICAgICAgbG9nLndhcm4oY3R4LmRvYy5vcHRpb25zLmxvZ0xldmVsLCBgS2V5cyB3aXRoIGNvbGxlY3Rpb24gdmFsdWVzIHdpbGwgYmUgc3RyaW5naWZpZWQgZHVlIHRvIEpTIE9iamVjdCByZXN0cmljdGlvbnM6ICR7anNvblN0cn0uIFNldCBtYXBBc01hcDogdHJ1ZSB0byB1c2Ugb2JqZWN0IGtleXMuYCk7XG4gICAgICAgICAgICBjdHgubWFwS2V5V2FybmVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3RyS2V5O1xuICAgIH1cbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoanNLZXkpO1xufVxuXG5leHBvcnRzLmFkZFBhaXJUb0pTTWFwID0gYWRkUGFpclRvSlNNYXA7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIGNyZWF0ZU5vZGUgPSByZXF1aXJlKCcuLi9kb2MvY3JlYXRlTm9kZS5qcycpO1xudmFyIHN0cmluZ2lmeVBhaXIgPSByZXF1aXJlKCcuLi9zdHJpbmdpZnkvc3RyaW5naWZ5UGFpci5qcycpO1xudmFyIGFkZFBhaXJUb0pTTWFwID0gcmVxdWlyZSgnLi9hZGRQYWlyVG9KU01hcC5qcycpO1xudmFyIGlkZW50aXR5ID0gcmVxdWlyZSgnLi9pZGVudGl0eS5qcycpO1xuXG5mdW5jdGlvbiBjcmVhdGVQYWlyKGtleSwgdmFsdWUsIGN0eCkge1xuICAgIGNvbnN0IGsgPSBjcmVhdGVOb2RlLmNyZWF0ZU5vZGUoa2V5LCB1bmRlZmluZWQsIGN0eCk7XG4gICAgY29uc3QgdiA9IGNyZWF0ZU5vZGUuY3JlYXRlTm9kZSh2YWx1ZSwgdW5kZWZpbmVkLCBjdHgpO1xuICAgIHJldHVybiBuZXcgUGFpcihrLCB2KTtcbn1cbmNsYXNzIFBhaXIge1xuICAgIGNvbnN0cnVjdG9yKGtleSwgdmFsdWUgPSBudWxsKSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBpZGVudGl0eS5OT0RFX1RZUEUsIHsgdmFsdWU6IGlkZW50aXR5LlBBSVIgfSk7XG4gICAgICAgIHRoaXMua2V5ID0ga2V5O1xuICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgfVxuICAgIGNsb25lKHNjaGVtYSkge1xuICAgICAgICBsZXQgeyBrZXksIHZhbHVlIH0gPSB0aGlzO1xuICAgICAgICBpZiAoaWRlbnRpdHkuaXNOb2RlKGtleSkpXG4gICAgICAgICAgICBrZXkgPSBrZXkuY2xvbmUoc2NoZW1hKTtcbiAgICAgICAgaWYgKGlkZW50aXR5LmlzTm9kZSh2YWx1ZSkpXG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLmNsb25lKHNjaGVtYSk7XG4gICAgICAgIHJldHVybiBuZXcgUGFpcihrZXksIHZhbHVlKTtcbiAgICB9XG4gICAgdG9KU09OKF8sIGN0eCkge1xuICAgICAgICBjb25zdCBwYWlyID0gY3R4Py5tYXBBc01hcCA/IG5ldyBNYXAoKSA6IHt9O1xuICAgICAgICByZXR1cm4gYWRkUGFpclRvSlNNYXAuYWRkUGFpclRvSlNNYXAoY3R4LCBwYWlyLCB0aGlzKTtcbiAgICB9XG4gICAgdG9TdHJpbmcoY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKSB7XG4gICAgICAgIHJldHVybiBjdHg/LmRvY1xuICAgICAgICAgICAgPyBzdHJpbmdpZnlQYWlyLnN0cmluZ2lmeVBhaXIodGhpcywgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKVxuICAgICAgICAgICAgOiBKU09OLnN0cmluZ2lmeSh0aGlzKTtcbiAgICB9XG59XG5cbmV4cG9ydHMuUGFpciA9IFBhaXI7XG5leHBvcnRzLmNyZWF0ZVBhaXIgPSBjcmVhdGVQYWlyO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBpZGVudGl0eSA9IHJlcXVpcmUoJy4uL25vZGVzL2lkZW50aXR5LmpzJyk7XG52YXIgc3RyaW5naWZ5ID0gcmVxdWlyZSgnLi9zdHJpbmdpZnkuanMnKTtcbnZhciBzdHJpbmdpZnlDb21tZW50ID0gcmVxdWlyZSgnLi9zdHJpbmdpZnlDb21tZW50LmpzJyk7XG5cbmZ1bmN0aW9uIHN0cmluZ2lmeUNvbGxlY3Rpb24oY29sbGVjdGlvbiwgY3R4LCBvcHRpb25zKSB7XG4gICAgY29uc3QgZmxvdyA9IGN0eC5pbkZsb3cgPz8gY29sbGVjdGlvbi5mbG93O1xuICAgIGNvbnN0IHN0cmluZ2lmeSA9IGZsb3cgPyBzdHJpbmdpZnlGbG93Q29sbGVjdGlvbiA6IHN0cmluZ2lmeUJsb2NrQ29sbGVjdGlvbjtcbiAgICByZXR1cm4gc3RyaW5naWZ5KGNvbGxlY3Rpb24sIGN0eCwgb3B0aW9ucyk7XG59XG5mdW5jdGlvbiBzdHJpbmdpZnlCbG9ja0NvbGxlY3Rpb24oeyBjb21tZW50LCBpdGVtcyB9LCBjdHgsIHsgYmxvY2tJdGVtUHJlZml4LCBmbG93Q2hhcnMsIGl0ZW1JbmRlbnQsIG9uQ2hvbXBLZWVwLCBvbkNvbW1lbnQgfSkge1xuICAgIGNvbnN0IHsgaW5kZW50LCBvcHRpb25zOiB7IGNvbW1lbnRTdHJpbmcgfSB9ID0gY3R4O1xuICAgIGNvbnN0IGl0ZW1DdHggPSBPYmplY3QuYXNzaWduKHt9LCBjdHgsIHsgaW5kZW50OiBpdGVtSW5kZW50LCB0eXBlOiBudWxsIH0pO1xuICAgIGxldCBjaG9tcEtlZXAgPSBmYWxzZTsgLy8gZmxhZyBmb3IgdGhlIHByZWNlZGluZyBub2RlJ3Mgc3RhdHVzXG4gICAgY29uc3QgbGluZXMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSBpdGVtc1tpXTtcbiAgICAgICAgbGV0IGNvbW1lbnQgPSBudWxsO1xuICAgICAgICBpZiAoaWRlbnRpdHkuaXNOb2RlKGl0ZW0pKSB7XG4gICAgICAgICAgICBpZiAoIWNob21wS2VlcCAmJiBpdGVtLnNwYWNlQmVmb3JlKVxuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goJycpO1xuICAgICAgICAgICAgYWRkQ29tbWVudEJlZm9yZShjdHgsIGxpbmVzLCBpdGVtLmNvbW1lbnRCZWZvcmUsIGNob21wS2VlcCk7XG4gICAgICAgICAgICBpZiAoaXRlbS5jb21tZW50KVxuICAgICAgICAgICAgICAgIGNvbW1lbnQgPSBpdGVtLmNvbW1lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaWRlbnRpdHkuaXNQYWlyKGl0ZW0pKSB7XG4gICAgICAgICAgICBjb25zdCBpayA9IGlkZW50aXR5LmlzTm9kZShpdGVtLmtleSkgPyBpdGVtLmtleSA6IG51bGw7XG4gICAgICAgICAgICBpZiAoaWspIHtcbiAgICAgICAgICAgICAgICBpZiAoIWNob21wS2VlcCAmJiBpay5zcGFjZUJlZm9yZSlcbiAgICAgICAgICAgICAgICAgICAgbGluZXMucHVzaCgnJyk7XG4gICAgICAgICAgICAgICAgYWRkQ29tbWVudEJlZm9yZShjdHgsIGxpbmVzLCBpay5jb21tZW50QmVmb3JlLCBjaG9tcEtlZXApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNob21wS2VlcCA9IGZhbHNlO1xuICAgICAgICBsZXQgc3RyID0gc3RyaW5naWZ5LnN0cmluZ2lmeShpdGVtLCBpdGVtQ3R4LCAoKSA9PiAoY29tbWVudCA9IG51bGwpLCAoKSA9PiAoY2hvbXBLZWVwID0gdHJ1ZSkpO1xuICAgICAgICBpZiAoY29tbWVudClcbiAgICAgICAgICAgIHN0ciArPSBzdHJpbmdpZnlDb21tZW50LmxpbmVDb21tZW50KHN0ciwgaXRlbUluZGVudCwgY29tbWVudFN0cmluZyhjb21tZW50KSk7XG4gICAgICAgIGlmIChjaG9tcEtlZXAgJiYgY29tbWVudClcbiAgICAgICAgICAgIGNob21wS2VlcCA9IGZhbHNlO1xuICAgICAgICBsaW5lcy5wdXNoKGJsb2NrSXRlbVByZWZpeCArIHN0cik7XG4gICAgfVxuICAgIGxldCBzdHI7XG4gICAgaWYgKGxpbmVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBzdHIgPSBmbG93Q2hhcnMuc3RhcnQgKyBmbG93Q2hhcnMuZW5kO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgc3RyID0gbGluZXNbMF07XG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgbGluZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGNvbnN0IGxpbmUgPSBsaW5lc1tpXTtcbiAgICAgICAgICAgIHN0ciArPSBsaW5lID8gYFxcbiR7aW5kZW50fSR7bGluZX1gIDogJ1xcbic7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGNvbW1lbnQpIHtcbiAgICAgICAgc3RyICs9ICdcXG4nICsgc3RyaW5naWZ5Q29tbWVudC5pbmRlbnRDb21tZW50KGNvbW1lbnRTdHJpbmcoY29tbWVudCksIGluZGVudCk7XG4gICAgICAgIGlmIChvbkNvbW1lbnQpXG4gICAgICAgICAgICBvbkNvbW1lbnQoKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoY2hvbXBLZWVwICYmIG9uQ2hvbXBLZWVwKVxuICAgICAgICBvbkNob21wS2VlcCgpO1xuICAgIHJldHVybiBzdHI7XG59XG5mdW5jdGlvbiBzdHJpbmdpZnlGbG93Q29sbGVjdGlvbih7IGl0ZW1zIH0sIGN0eCwgeyBmbG93Q2hhcnMsIGl0ZW1JbmRlbnQgfSkge1xuICAgIGNvbnN0IHsgaW5kZW50LCBpbmRlbnRTdGVwLCBmbG93Q29sbGVjdGlvblBhZGRpbmc6IGZjUGFkZGluZywgb3B0aW9uczogeyBjb21tZW50U3RyaW5nIH0gfSA9IGN0eDtcbiAgICBpdGVtSW5kZW50ICs9IGluZGVudFN0ZXA7XG4gICAgY29uc3QgaXRlbUN0eCA9IE9iamVjdC5hc3NpZ24oe30sIGN0eCwge1xuICAgICAgICBpbmRlbnQ6IGl0ZW1JbmRlbnQsXG4gICAgICAgIGluRmxvdzogdHJ1ZSxcbiAgICAgICAgdHlwZTogbnVsbFxuICAgIH0pO1xuICAgIGxldCByZXFOZXdsaW5lID0gZmFsc2U7XG4gICAgbGV0IGxpbmVzQXRWYWx1ZSA9IDA7XG4gICAgY29uc3QgbGluZXMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSBpdGVtc1tpXTtcbiAgICAgICAgbGV0IGNvbW1lbnQgPSBudWxsO1xuICAgICAgICBpZiAoaWRlbnRpdHkuaXNOb2RlKGl0ZW0pKSB7XG4gICAgICAgICAgICBpZiAoaXRlbS5zcGFjZUJlZm9yZSlcbiAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKCcnKTtcbiAgICAgICAgICAgIGFkZENvbW1lbnRCZWZvcmUoY3R4LCBsaW5lcywgaXRlbS5jb21tZW50QmVmb3JlLCBmYWxzZSk7XG4gICAgICAgICAgICBpZiAoaXRlbS5jb21tZW50KVxuICAgICAgICAgICAgICAgIGNvbW1lbnQgPSBpdGVtLmNvbW1lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaWRlbnRpdHkuaXNQYWlyKGl0ZW0pKSB7XG4gICAgICAgICAgICBjb25zdCBpayA9IGlkZW50aXR5LmlzTm9kZShpdGVtLmtleSkgPyBpdGVtLmtleSA6IG51bGw7XG4gICAgICAgICAgICBpZiAoaWspIHtcbiAgICAgICAgICAgICAgICBpZiAoaWsuc3BhY2VCZWZvcmUpXG4gICAgICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goJycpO1xuICAgICAgICAgICAgICAgIGFkZENvbW1lbnRCZWZvcmUoY3R4LCBsaW5lcywgaWsuY29tbWVudEJlZm9yZSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIGlmIChpay5jb21tZW50KVxuICAgICAgICAgICAgICAgICAgICByZXFOZXdsaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGl2ID0gaWRlbnRpdHkuaXNOb2RlKGl0ZW0udmFsdWUpID8gaXRlbS52YWx1ZSA6IG51bGw7XG4gICAgICAgICAgICBpZiAoaXYpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXYuY29tbWVudClcbiAgICAgICAgICAgICAgICAgICAgY29tbWVudCA9IGl2LmNvbW1lbnQ7XG4gICAgICAgICAgICAgICAgaWYgKGl2LmNvbW1lbnRCZWZvcmUpXG4gICAgICAgICAgICAgICAgICAgIHJlcU5ld2xpbmUgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoaXRlbS52YWx1ZSA9PSBudWxsICYmIGlrPy5jb21tZW50KSB7XG4gICAgICAgICAgICAgICAgY29tbWVudCA9IGlrLmNvbW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbW1lbnQpXG4gICAgICAgICAgICByZXFOZXdsaW5lID0gdHJ1ZTtcbiAgICAgICAgbGV0IHN0ciA9IHN0cmluZ2lmeS5zdHJpbmdpZnkoaXRlbSwgaXRlbUN0eCwgKCkgPT4gKGNvbW1lbnQgPSBudWxsKSk7XG4gICAgICAgIGlmIChpIDwgaXRlbXMubGVuZ3RoIC0gMSlcbiAgICAgICAgICAgIHN0ciArPSAnLCc7XG4gICAgICAgIGlmIChjb21tZW50KVxuICAgICAgICAgICAgc3RyICs9IHN0cmluZ2lmeUNvbW1lbnQubGluZUNvbW1lbnQoc3RyLCBpdGVtSW5kZW50LCBjb21tZW50U3RyaW5nKGNvbW1lbnQpKTtcbiAgICAgICAgaWYgKCFyZXFOZXdsaW5lICYmIChsaW5lcy5sZW5ndGggPiBsaW5lc0F0VmFsdWUgfHwgc3RyLmluY2x1ZGVzKCdcXG4nKSkpXG4gICAgICAgICAgICByZXFOZXdsaW5lID0gdHJ1ZTtcbiAgICAgICAgbGluZXMucHVzaChzdHIpO1xuICAgICAgICBsaW5lc0F0VmFsdWUgPSBsaW5lcy5sZW5ndGg7XG4gICAgfVxuICAgIGNvbnN0IHsgc3RhcnQsIGVuZCB9ID0gZmxvd0NoYXJzO1xuICAgIGlmIChsaW5lcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHN0YXJ0ICsgZW5kO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaWYgKCFyZXFOZXdsaW5lKSB7XG4gICAgICAgICAgICBjb25zdCBsZW4gPSBsaW5lcy5yZWR1Y2UoKHN1bSwgbGluZSkgPT4gc3VtICsgbGluZS5sZW5ndGggKyAyLCAyKTtcbiAgICAgICAgICAgIHJlcU5ld2xpbmUgPSBjdHgub3B0aW9ucy5saW5lV2lkdGggPiAwICYmIGxlbiA+IGN0eC5vcHRpb25zLmxpbmVXaWR0aDtcbiAgICAgICAgfVxuICAgICAgICBpZiAocmVxTmV3bGluZSkge1xuICAgICAgICAgICAgbGV0IHN0ciA9IHN0YXJ0O1xuICAgICAgICAgICAgZm9yIChjb25zdCBsaW5lIG9mIGxpbmVzKVxuICAgICAgICAgICAgICAgIHN0ciArPSBsaW5lID8gYFxcbiR7aW5kZW50U3RlcH0ke2luZGVudH0ke2xpbmV9YCA6ICdcXG4nO1xuICAgICAgICAgICAgcmV0dXJuIGAke3N0cn1cXG4ke2luZGVudH0ke2VuZH1gO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGAke3N0YXJ0fSR7ZmNQYWRkaW5nfSR7bGluZXMuam9pbignICcpfSR7ZmNQYWRkaW5nfSR7ZW5kfWA7XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBhZGRDb21tZW50QmVmb3JlKHsgaW5kZW50LCBvcHRpb25zOiB7IGNvbW1lbnRTdHJpbmcgfSB9LCBsaW5lcywgY29tbWVudCwgY2hvbXBLZWVwKSB7XG4gICAgaWYgKGNvbW1lbnQgJiYgY2hvbXBLZWVwKVxuICAgICAgICBjb21tZW50ID0gY29tbWVudC5yZXBsYWNlKC9eXFxuKy8sICcnKTtcbiAgICBpZiAoY29tbWVudCkge1xuICAgICAgICBjb25zdCBpYyA9IHN0cmluZ2lmeUNvbW1lbnQuaW5kZW50Q29tbWVudChjb21tZW50U3RyaW5nKGNvbW1lbnQpLCBpbmRlbnQpO1xuICAgICAgICBsaW5lcy5wdXNoKGljLnRyaW1TdGFydCgpKTsgLy8gQXZvaWQgZG91YmxlIGluZGVudCBvbiBmaXJzdCBsaW5lXG4gICAgfVxufVxuXG5leHBvcnRzLnN0cmluZ2lmeUNvbGxlY3Rpb24gPSBzdHJpbmdpZnlDb2xsZWN0aW9uO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBzdHJpbmdpZnlDb2xsZWN0aW9uID0gcmVxdWlyZSgnLi4vc3RyaW5naWZ5L3N0cmluZ2lmeUNvbGxlY3Rpb24uanMnKTtcbnZhciBhZGRQYWlyVG9KU01hcCA9IHJlcXVpcmUoJy4vYWRkUGFpclRvSlNNYXAuanMnKTtcbnZhciBDb2xsZWN0aW9uID0gcmVxdWlyZSgnLi9Db2xsZWN0aW9uLmpzJyk7XG52YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuL2lkZW50aXR5LmpzJyk7XG52YXIgUGFpciA9IHJlcXVpcmUoJy4vUGFpci5qcycpO1xudmFyIFNjYWxhciA9IHJlcXVpcmUoJy4vU2NhbGFyLmpzJyk7XG5cbmZ1bmN0aW9uIGZpbmRQYWlyKGl0ZW1zLCBrZXkpIHtcbiAgICBjb25zdCBrID0gaWRlbnRpdHkuaXNTY2FsYXIoa2V5KSA/IGtleS52YWx1ZSA6IGtleTtcbiAgICBmb3IgKGNvbnN0IGl0IG9mIGl0ZW1zKSB7XG4gICAgICAgIGlmIChpZGVudGl0eS5pc1BhaXIoaXQpKSB7XG4gICAgICAgICAgICBpZiAoaXQua2V5ID09PSBrZXkgfHwgaXQua2V5ID09PSBrKVxuICAgICAgICAgICAgICAgIHJldHVybiBpdDtcbiAgICAgICAgICAgIGlmIChpZGVudGl0eS5pc1NjYWxhcihpdC5rZXkpICYmIGl0LmtleS52YWx1ZSA9PT0gaylcbiAgICAgICAgICAgICAgICByZXR1cm4gaXQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cbmNsYXNzIFlBTUxNYXAgZXh0ZW5kcyBDb2xsZWN0aW9uLkNvbGxlY3Rpb24ge1xuICAgIHN0YXRpYyBnZXQgdGFnTmFtZSgpIHtcbiAgICAgICAgcmV0dXJuICd0YWc6eWFtbC5vcmcsMjAwMjptYXAnO1xuICAgIH1cbiAgICBjb25zdHJ1Y3RvcihzY2hlbWEpIHtcbiAgICAgICAgc3VwZXIoaWRlbnRpdHkuTUFQLCBzY2hlbWEpO1xuICAgICAgICB0aGlzLml0ZW1zID0gW107XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEEgZ2VuZXJpYyBjb2xsZWN0aW9uIHBhcnNpbmcgbWV0aG9kIHRoYXQgY2FuIGJlIGV4dGVuZGVkXG4gICAgICogdG8gb3RoZXIgbm9kZSBjbGFzc2VzIHRoYXQgaW5oZXJpdCBmcm9tIFlBTUxNYXBcbiAgICAgKi9cbiAgICBzdGF0aWMgZnJvbShzY2hlbWEsIG9iaiwgY3R4KSB7XG4gICAgICAgIGNvbnN0IHsga2VlcFVuZGVmaW5lZCwgcmVwbGFjZXIgfSA9IGN0eDtcbiAgICAgICAgY29uc3QgbWFwID0gbmV3IHRoaXMoc2NoZW1hKTtcbiAgICAgICAgY29uc3QgYWRkID0gKGtleSwgdmFsdWUpID0+IHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcmVwbGFjZXIgPT09ICdmdW5jdGlvbicpXG4gICAgICAgICAgICAgICAgdmFsdWUgPSByZXBsYWNlci5jYWxsKG9iaiwga2V5LCB2YWx1ZSk7XG4gICAgICAgICAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5KHJlcGxhY2VyKSAmJiAhcmVwbGFjZXIuaW5jbHVkZXMoa2V5KSlcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCB8fCBrZWVwVW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgIG1hcC5pdGVtcy5wdXNoKFBhaXIuY3JlYXRlUGFpcihrZXksIHZhbHVlLCBjdHgpKTtcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIE1hcCkge1xuICAgICAgICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2Ygb2JqKVxuICAgICAgICAgICAgICAgIGFkZChrZXksIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChvYmogJiYgdHlwZW9mIG9iaiA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKG9iaikpXG4gICAgICAgICAgICAgICAgYWRkKGtleSwgb2JqW2tleV0pO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2Ygc2NoZW1hLnNvcnRNYXBFbnRyaWVzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBtYXAuaXRlbXMuc29ydChzY2hlbWEuc29ydE1hcEVudHJpZXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXA7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFkZHMgYSB2YWx1ZSB0byB0aGUgY29sbGVjdGlvbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBvdmVyd3JpdGUgLSBJZiBub3Qgc2V0IGB0cnVlYCwgdXNpbmcgYSBrZXkgdGhhdCBpcyBhbHJlYWR5IGluIHRoZVxuICAgICAqICAgY29sbGVjdGlvbiB3aWxsIHRocm93LiBPdGhlcndpc2UsIG92ZXJ3cml0ZXMgdGhlIHByZXZpb3VzIHZhbHVlLlxuICAgICAqL1xuICAgIGFkZChwYWlyLCBvdmVyd3JpdGUpIHtcbiAgICAgICAgbGV0IF9wYWlyO1xuICAgICAgICBpZiAoaWRlbnRpdHkuaXNQYWlyKHBhaXIpKVxuICAgICAgICAgICAgX3BhaXIgPSBwYWlyO1xuICAgICAgICBlbHNlIGlmICghcGFpciB8fCB0eXBlb2YgcGFpciAhPT0gJ29iamVjdCcgfHwgISgna2V5JyBpbiBwYWlyKSkge1xuICAgICAgICAgICAgLy8gSW4gVHlwZVNjcmlwdCwgdGhpcyBuZXZlciBoYXBwZW5zLlxuICAgICAgICAgICAgX3BhaXIgPSBuZXcgUGFpci5QYWlyKHBhaXIsIHBhaXI/LnZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBfcGFpciA9IG5ldyBQYWlyLlBhaXIocGFpci5rZXksIHBhaXIudmFsdWUpO1xuICAgICAgICBjb25zdCBwcmV2ID0gZmluZFBhaXIodGhpcy5pdGVtcywgX3BhaXIua2V5KTtcbiAgICAgICAgY29uc3Qgc29ydEVudHJpZXMgPSB0aGlzLnNjaGVtYT8uc29ydE1hcEVudHJpZXM7XG4gICAgICAgIGlmIChwcmV2KSB7XG4gICAgICAgICAgICBpZiAoIW92ZXJ3cml0ZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEtleSAke19wYWlyLmtleX0gYWxyZWFkeSBzZXRgKTtcbiAgICAgICAgICAgIC8vIEZvciBzY2FsYXJzLCBrZWVwIHRoZSBvbGQgbm9kZSAmIGl0cyBjb21tZW50cyBhbmQgYW5jaG9yc1xuICAgICAgICAgICAgaWYgKGlkZW50aXR5LmlzU2NhbGFyKHByZXYudmFsdWUpICYmIFNjYWxhci5pc1NjYWxhclZhbHVlKF9wYWlyLnZhbHVlKSlcbiAgICAgICAgICAgICAgICBwcmV2LnZhbHVlLnZhbHVlID0gX3BhaXIudmFsdWU7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcHJldi52YWx1ZSA9IF9wYWlyLnZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHNvcnRFbnRyaWVzKSB7XG4gICAgICAgICAgICBjb25zdCBpID0gdGhpcy5pdGVtcy5maW5kSW5kZXgoaXRlbSA9PiBzb3J0RW50cmllcyhfcGFpciwgaXRlbSkgPCAwKTtcbiAgICAgICAgICAgIGlmIChpID09PSAtMSlcbiAgICAgICAgICAgICAgICB0aGlzLml0ZW1zLnB1c2goX3BhaXIpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRoaXMuaXRlbXMuc3BsaWNlKGksIDAsIF9wYWlyKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuaXRlbXMucHVzaChfcGFpcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZGVsZXRlKGtleSkge1xuICAgICAgICBjb25zdCBpdCA9IGZpbmRQYWlyKHRoaXMuaXRlbXMsIGtleSk7XG4gICAgICAgIGlmICghaXQpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGNvbnN0IGRlbCA9IHRoaXMuaXRlbXMuc3BsaWNlKHRoaXMuaXRlbXMuaW5kZXhPZihpdCksIDEpO1xuICAgICAgICByZXR1cm4gZGVsLmxlbmd0aCA+IDA7XG4gICAgfVxuICAgIGdldChrZXksIGtlZXBTY2FsYXIpIHtcbiAgICAgICAgY29uc3QgaXQgPSBmaW5kUGFpcih0aGlzLml0ZW1zLCBrZXkpO1xuICAgICAgICBjb25zdCBub2RlID0gaXQ/LnZhbHVlO1xuICAgICAgICByZXR1cm4gKCFrZWVwU2NhbGFyICYmIGlkZW50aXR5LmlzU2NhbGFyKG5vZGUpID8gbm9kZS52YWx1ZSA6IG5vZGUpID8/IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgaGFzKGtleSkge1xuICAgICAgICByZXR1cm4gISFmaW5kUGFpcih0aGlzLml0ZW1zLCBrZXkpO1xuICAgIH1cbiAgICBzZXQoa2V5LCB2YWx1ZSkge1xuICAgICAgICB0aGlzLmFkZChuZXcgUGFpci5QYWlyKGtleSwgdmFsdWUpLCB0cnVlKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQHBhcmFtIGN0eCAtIENvbnZlcnNpb24gY29udGV4dCwgb3JpZ2luYWxseSBzZXQgaW4gRG9jdW1lbnQjdG9KUygpXG4gICAgICogQHBhcmFtIHtDbGFzc30gVHlwZSAtIElmIHNldCwgZm9yY2VzIHRoZSByZXR1cm5lZCBjb2xsZWN0aW9uIHR5cGVcbiAgICAgKiBAcmV0dXJucyBJbnN0YW5jZSBvZiBUeXBlLCBNYXAsIG9yIE9iamVjdFxuICAgICAqL1xuICAgIHRvSlNPTihfLCBjdHgsIFR5cGUpIHtcbiAgICAgICAgY29uc3QgbWFwID0gVHlwZSA/IG5ldyBUeXBlKCkgOiBjdHg/Lm1hcEFzTWFwID8gbmV3IE1hcCgpIDoge307XG4gICAgICAgIGlmIChjdHg/Lm9uQ3JlYXRlKVxuICAgICAgICAgICAgY3R4Lm9uQ3JlYXRlKG1hcCk7XG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiB0aGlzLml0ZW1zKVxuICAgICAgICAgICAgYWRkUGFpclRvSlNNYXAuYWRkUGFpclRvSlNNYXAoY3R4LCBtYXAsIGl0ZW0pO1xuICAgICAgICByZXR1cm4gbWFwO1xuICAgIH1cbiAgICB0b1N0cmluZyhjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApIHtcbiAgICAgICAgaWYgKCFjdHgpXG4gICAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcyk7XG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiB0aGlzLml0ZW1zKSB7XG4gICAgICAgICAgICBpZiAoIWlkZW50aXR5LmlzUGFpcihpdGVtKSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE1hcCBpdGVtcyBtdXN0IGFsbCBiZSBwYWlyczsgZm91bmQgJHtKU09OLnN0cmluZ2lmeShpdGVtKX0gaW5zdGVhZGApO1xuICAgICAgICB9XG4gICAgICAgIGlmICghY3R4LmFsbE51bGxWYWx1ZXMgJiYgdGhpcy5oYXNBbGxOdWxsVmFsdWVzKGZhbHNlKSlcbiAgICAgICAgICAgIGN0eCA9IE9iamVjdC5hc3NpZ24oe30sIGN0eCwgeyBhbGxOdWxsVmFsdWVzOiB0cnVlIH0pO1xuICAgICAgICByZXR1cm4gc3RyaW5naWZ5Q29sbGVjdGlvbi5zdHJpbmdpZnlDb2xsZWN0aW9uKHRoaXMsIGN0eCwge1xuICAgICAgICAgICAgYmxvY2tJdGVtUHJlZml4OiAnJyxcbiAgICAgICAgICAgIGZsb3dDaGFyczogeyBzdGFydDogJ3snLCBlbmQ6ICd9JyB9LFxuICAgICAgICAgICAgaXRlbUluZGVudDogY3R4LmluZGVudCB8fCAnJyxcbiAgICAgICAgICAgIG9uQ2hvbXBLZWVwLFxuICAgICAgICAgICAgb25Db21tZW50XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuZXhwb3J0cy5ZQU1MTWFwID0gWUFNTE1hcDtcbmV4cG9ydHMuZmluZFBhaXIgPSBmaW5kUGFpcjtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9pZGVudGl0eS5qcycpO1xudmFyIFlBTUxNYXAgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9ZQU1MTWFwLmpzJyk7XG5cbmNvbnN0IG1hcCA9IHtcbiAgICBjb2xsZWN0aW9uOiAnbWFwJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIG5vZGVDbGFzczogWUFNTE1hcC5ZQU1MTWFwLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOm1hcCcsXG4gICAgcmVzb2x2ZShtYXAsIG9uRXJyb3IpIHtcbiAgICAgICAgaWYgKCFpZGVudGl0eS5pc01hcChtYXApKVxuICAgICAgICAgICAgb25FcnJvcignRXhwZWN0ZWQgYSBtYXBwaW5nIGZvciB0aGlzIHRhZycpO1xuICAgICAgICByZXR1cm4gbWFwO1xuICAgIH0sXG4gICAgY3JlYXRlTm9kZTogKHNjaGVtYSwgb2JqLCBjdHgpID0+IFlBTUxNYXAuWUFNTE1hcC5mcm9tKHNjaGVtYSwgb2JqLCBjdHgpXG59O1xuXG5leHBvcnRzLm1hcCA9IG1hcDtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY3JlYXRlTm9kZSA9IHJlcXVpcmUoJy4uL2RvYy9jcmVhdGVOb2RlLmpzJyk7XG52YXIgc3RyaW5naWZ5Q29sbGVjdGlvbiA9IHJlcXVpcmUoJy4uL3N0cmluZ2lmeS9zdHJpbmdpZnlDb2xsZWN0aW9uLmpzJyk7XG52YXIgQ29sbGVjdGlvbiA9IHJlcXVpcmUoJy4vQ29sbGVjdGlvbi5qcycpO1xudmFyIGlkZW50aXR5ID0gcmVxdWlyZSgnLi9pZGVudGl0eS5qcycpO1xudmFyIFNjYWxhciA9IHJlcXVpcmUoJy4vU2NhbGFyLmpzJyk7XG52YXIgdG9KUyA9IHJlcXVpcmUoJy4vdG9KUy5qcycpO1xuXG5jbGFzcyBZQU1MU2VxIGV4dGVuZHMgQ29sbGVjdGlvbi5Db2xsZWN0aW9uIHtcbiAgICBzdGF0aWMgZ2V0IHRhZ05hbWUoKSB7XG4gICAgICAgIHJldHVybiAndGFnOnlhbWwub3JnLDIwMDI6c2VxJztcbiAgICB9XG4gICAgY29uc3RydWN0b3Ioc2NoZW1hKSB7XG4gICAgICAgIHN1cGVyKGlkZW50aXR5LlNFUSwgc2NoZW1hKTtcbiAgICAgICAgdGhpcy5pdGVtcyA9IFtdO1xuICAgIH1cbiAgICBhZGQodmFsdWUpIHtcbiAgICAgICAgdGhpcy5pdGVtcy5wdXNoKHZhbHVlKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhIHZhbHVlIGZyb20gdGhlIGNvbGxlY3Rpb24uXG4gICAgICpcbiAgICAgKiBga2V5YCBtdXN0IGNvbnRhaW4gYSByZXByZXNlbnRhdGlvbiBvZiBhbiBpbnRlZ2VyIGZvciB0aGlzIHRvIHN1Y2NlZWQuXG4gICAgICogSXQgbWF5IGJlIHdyYXBwZWQgaW4gYSBgU2NhbGFyYC5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgaXRlbSB3YXMgZm91bmQgYW5kIHJlbW92ZWQuXG4gICAgICovXG4gICAgZGVsZXRlKGtleSkge1xuICAgICAgICBjb25zdCBpZHggPSBhc0l0ZW1JbmRleChrZXkpO1xuICAgICAgICBpZiAodHlwZW9mIGlkeCAhPT0gJ251bWJlcicpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGNvbnN0IGRlbCA9IHRoaXMuaXRlbXMuc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgIHJldHVybiBkZWwubGVuZ3RoID4gMDtcbiAgICB9XG4gICAgZ2V0KGtleSwga2VlcFNjYWxhcikge1xuICAgICAgICBjb25zdCBpZHggPSBhc0l0ZW1JbmRleChrZXkpO1xuICAgICAgICBpZiAodHlwZW9mIGlkeCAhPT0gJ251bWJlcicpXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICBjb25zdCBpdCA9IHRoaXMuaXRlbXNbaWR4XTtcbiAgICAgICAgcmV0dXJuICFrZWVwU2NhbGFyICYmIGlkZW50aXR5LmlzU2NhbGFyKGl0KSA/IGl0LnZhbHVlIDogaXQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiB0aGUgY29sbGVjdGlvbiBpbmNsdWRlcyBhIHZhbHVlIHdpdGggdGhlIGtleSBga2V5YC5cbiAgICAgKlxuICAgICAqIGBrZXlgIG11c3QgY29udGFpbiBhIHJlcHJlc2VudGF0aW9uIG9mIGFuIGludGVnZXIgZm9yIHRoaXMgdG8gc3VjY2VlZC5cbiAgICAgKiBJdCBtYXkgYmUgd3JhcHBlZCBpbiBhIGBTY2FsYXJgLlxuICAgICAqL1xuICAgIGhhcyhrZXkpIHtcbiAgICAgICAgY29uc3QgaWR4ID0gYXNJdGVtSW5kZXgoa2V5KTtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBpZHggPT09ICdudW1iZXInICYmIGlkeCA8IHRoaXMuaXRlbXMubGVuZ3RoO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXRzIGEgdmFsdWUgaW4gdGhpcyBjb2xsZWN0aW9uLiBGb3IgYCEhc2V0YCwgYHZhbHVlYCBuZWVkcyB0byBiZSBhXG4gICAgICogYm9vbGVhbiB0byBhZGQvcmVtb3ZlIHRoZSBpdGVtIGZyb20gdGhlIHNldC5cbiAgICAgKlxuICAgICAqIElmIGBrZXlgIGRvZXMgbm90IGNvbnRhaW4gYSByZXByZXNlbnRhdGlvbiBvZiBhbiBpbnRlZ2VyLCB0aGlzIHdpbGwgdGhyb3cuXG4gICAgICogSXQgbWF5IGJlIHdyYXBwZWQgaW4gYSBgU2NhbGFyYC5cbiAgICAgKi9cbiAgICBzZXQoa2V5LCB2YWx1ZSkge1xuICAgICAgICBjb25zdCBpZHggPSBhc0l0ZW1JbmRleChrZXkpO1xuICAgICAgICBpZiAodHlwZW9mIGlkeCAhPT0gJ251bWJlcicpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIGEgdmFsaWQgaW5kZXgsIG5vdCAke2tleX0uYCk7XG4gICAgICAgIGNvbnN0IHByZXYgPSB0aGlzLml0ZW1zW2lkeF07XG4gICAgICAgIGlmIChpZGVudGl0eS5pc1NjYWxhcihwcmV2KSAmJiBTY2FsYXIuaXNTY2FsYXJWYWx1ZSh2YWx1ZSkpXG4gICAgICAgICAgICBwcmV2LnZhbHVlID0gdmFsdWU7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMuaXRlbXNbaWR4XSA9IHZhbHVlO1xuICAgIH1cbiAgICB0b0pTT04oXywgY3R4KSB7XG4gICAgICAgIGNvbnN0IHNlcSA9IFtdO1xuICAgICAgICBpZiAoY3R4Py5vbkNyZWF0ZSlcbiAgICAgICAgICAgIGN0eC5vbkNyZWF0ZShzZXEpO1xuICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiB0aGlzLml0ZW1zKVxuICAgICAgICAgICAgc2VxLnB1c2godG9KUy50b0pTKGl0ZW0sIFN0cmluZyhpKyspLCBjdHgpKTtcbiAgICAgICAgcmV0dXJuIHNlcTtcbiAgICB9XG4gICAgdG9TdHJpbmcoY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKSB7XG4gICAgICAgIGlmICghY3R4KVxuICAgICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHRoaXMpO1xuICAgICAgICByZXR1cm4gc3RyaW5naWZ5Q29sbGVjdGlvbi5zdHJpbmdpZnlDb2xsZWN0aW9uKHRoaXMsIGN0eCwge1xuICAgICAgICAgICAgYmxvY2tJdGVtUHJlZml4OiAnLSAnLFxuICAgICAgICAgICAgZmxvd0NoYXJzOiB7IHN0YXJ0OiAnWycsIGVuZDogJ10nIH0sXG4gICAgICAgICAgICBpdGVtSW5kZW50OiAoY3R4LmluZGVudCB8fCAnJykgKyAnICAnLFxuICAgICAgICAgICAgb25DaG9tcEtlZXAsXG4gICAgICAgICAgICBvbkNvbW1lbnRcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHN0YXRpYyBmcm9tKHNjaGVtYSwgb2JqLCBjdHgpIHtcbiAgICAgICAgY29uc3QgeyByZXBsYWNlciB9ID0gY3R4O1xuICAgICAgICBjb25zdCBzZXEgPSBuZXcgdGhpcyhzY2hlbWEpO1xuICAgICAgICBpZiAob2JqICYmIFN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3Qob2JqKSkge1xuICAgICAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICAgICAgZm9yIChsZXQgaXQgb2Ygb2JqKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiByZXBsYWNlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBrZXkgPSBvYmogaW5zdGFuY2VvZiBTZXQgPyBpdCA6IFN0cmluZyhpKyspO1xuICAgICAgICAgICAgICAgICAgICBpdCA9IHJlcGxhY2VyLmNhbGwob2JqLCBrZXksIGl0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2VxLml0ZW1zLnB1c2goY3JlYXRlTm9kZS5jcmVhdGVOb2RlKGl0LCB1bmRlZmluZWQsIGN0eCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzZXE7XG4gICAgfVxufVxuZnVuY3Rpb24gYXNJdGVtSW5kZXgoa2V5KSB7XG4gICAgbGV0IGlkeCA9IGlkZW50aXR5LmlzU2NhbGFyKGtleSkgPyBrZXkudmFsdWUgOiBrZXk7XG4gICAgaWYgKGlkeCAmJiB0eXBlb2YgaWR4ID09PSAnc3RyaW5nJylcbiAgICAgICAgaWR4ID0gTnVtYmVyKGlkeCk7XG4gICAgcmV0dXJuIHR5cGVvZiBpZHggPT09ICdudW1iZXInICYmIE51bWJlci5pc0ludGVnZXIoaWR4KSAmJiBpZHggPj0gMFxuICAgICAgICA/IGlkeFxuICAgICAgICA6IG51bGw7XG59XG5cbmV4cG9ydHMuWUFNTFNlcSA9IFlBTUxTZXE7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIGlkZW50aXR5ID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvaWRlbnRpdHkuanMnKTtcbnZhciBZQU1MU2VxID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvWUFNTFNlcS5qcycpO1xuXG5jb25zdCBzZXEgPSB7XG4gICAgY29sbGVjdGlvbjogJ3NlcScsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICBub2RlQ2xhc3M6IFlBTUxTZXEuWUFNTFNlcSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpzZXEnLFxuICAgIHJlc29sdmUoc2VxLCBvbkVycm9yKSB7XG4gICAgICAgIGlmICghaWRlbnRpdHkuaXNTZXEoc2VxKSlcbiAgICAgICAgICAgIG9uRXJyb3IoJ0V4cGVjdGVkIGEgc2VxdWVuY2UgZm9yIHRoaXMgdGFnJyk7XG4gICAgICAgIHJldHVybiBzZXE7XG4gICAgfSxcbiAgICBjcmVhdGVOb2RlOiAoc2NoZW1hLCBvYmosIGN0eCkgPT4gWUFNTFNlcS5ZQU1MU2VxLmZyb20oc2NoZW1hLCBvYmosIGN0eClcbn07XG5cbmV4cG9ydHMuc2VxID0gc2VxO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBzdHJpbmdpZnlTdHJpbmcgPSByZXF1aXJlKCcuLi8uLi9zdHJpbmdpZnkvc3RyaW5naWZ5U3RyaW5nLmpzJyk7XG5cbmNvbnN0IHN0cmluZyA9IHtcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOnN0cicsXG4gICAgcmVzb2x2ZTogc3RyID0+IHN0cixcbiAgICBzdHJpbmdpZnkoaXRlbSwgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKSB7XG4gICAgICAgIGN0eCA9IE9iamVjdC5hc3NpZ24oeyBhY3R1YWxTdHJpbmc6IHRydWUgfSwgY3R4KTtcbiAgICAgICAgcmV0dXJuIHN0cmluZ2lmeVN0cmluZy5zdHJpbmdpZnlTdHJpbmcoaXRlbSwgY3R4LCBvbkNvbW1lbnQsIG9uQ2hvbXBLZWVwKTtcbiAgICB9XG59O1xuXG5leHBvcnRzLnN0cmluZyA9IHN0cmluZztcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgU2NhbGFyID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvU2NhbGFyLmpzJyk7XG5cbmNvbnN0IG51bGxUYWcgPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHZhbHVlID09IG51bGwsXG4gICAgY3JlYXRlTm9kZTogKCkgPT4gbmV3IFNjYWxhci5TY2FsYXIobnVsbCksXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpudWxsJyxcbiAgICB0ZXN0OiAvXig/On58W05uXXVsbHxOVUxMKT8kLyxcbiAgICByZXNvbHZlOiAoKSA9PiBuZXcgU2NhbGFyLlNjYWxhcihudWxsKSxcbiAgICBzdHJpbmdpZnk6ICh7IHNvdXJjZSB9LCBjdHgpID0+IHR5cGVvZiBzb3VyY2UgPT09ICdzdHJpbmcnICYmIG51bGxUYWcudGVzdC50ZXN0KHNvdXJjZSlcbiAgICAgICAgPyBzb3VyY2VcbiAgICAgICAgOiBjdHgub3B0aW9ucy5udWxsU3RyXG59O1xuXG5leHBvcnRzLm51bGxUYWcgPSBudWxsVGFnO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBTY2FsYXIgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9TY2FsYXIuanMnKTtcblxuY29uc3QgYm9vbFRhZyA9IHtcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpib29sJyxcbiAgICB0ZXN0OiAvXig/OltUdF1ydWV8VFJVRXxbRmZdYWxzZXxGQUxTRSkkLyxcbiAgICByZXNvbHZlOiBzdHIgPT4gbmV3IFNjYWxhci5TY2FsYXIoc3RyWzBdID09PSAndCcgfHwgc3RyWzBdID09PSAnVCcpLFxuICAgIHN0cmluZ2lmeSh7IHNvdXJjZSwgdmFsdWUgfSwgY3R4KSB7XG4gICAgICAgIGlmIChzb3VyY2UgJiYgYm9vbFRhZy50ZXN0LnRlc3Qoc291cmNlKSkge1xuICAgICAgICAgICAgY29uc3Qgc3YgPSBzb3VyY2VbMF0gPT09ICd0JyB8fCBzb3VyY2VbMF0gPT09ICdUJztcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gc3YpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNvdXJjZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWUgPyBjdHgub3B0aW9ucy50cnVlU3RyIDogY3R4Lm9wdGlvbnMuZmFsc2VTdHI7XG4gICAgfVxufTtcblxuZXhwb3J0cy5ib29sVGFnID0gYm9vbFRhZztcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBzdHJpbmdpZnlOdW1iZXIoeyBmb3JtYXQsIG1pbkZyYWN0aW9uRGlnaXRzLCB0YWcsIHZhbHVlIH0pIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnYmlnaW50JylcbiAgICAgICAgcmV0dXJuIFN0cmluZyh2YWx1ZSk7XG4gICAgY29uc3QgbnVtID0gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyA/IHZhbHVlIDogTnVtYmVyKHZhbHVlKTtcbiAgICBpZiAoIWlzRmluaXRlKG51bSkpXG4gICAgICAgIHJldHVybiBpc05hTihudW0pID8gJy5uYW4nIDogbnVtIDwgMCA/ICctLmluZicgOiAnLmluZic7XG4gICAgbGV0IG4gPSBPYmplY3QuaXModmFsdWUsIC0wKSA/ICctMCcgOiBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgaWYgKCFmb3JtYXQgJiZcbiAgICAgICAgbWluRnJhY3Rpb25EaWdpdHMgJiZcbiAgICAgICAgKCF0YWcgfHwgdGFnID09PSAndGFnOnlhbWwub3JnLDIwMDI6ZmxvYXQnKSAmJlxuICAgICAgICAvXlxcZC8udGVzdChuKSkge1xuICAgICAgICBsZXQgaSA9IG4uaW5kZXhPZignLicpO1xuICAgICAgICBpZiAoaSA8IDApIHtcbiAgICAgICAgICAgIGkgPSBuLmxlbmd0aDtcbiAgICAgICAgICAgIG4gKz0gJy4nO1xuICAgICAgICB9XG4gICAgICAgIGxldCBkID0gbWluRnJhY3Rpb25EaWdpdHMgLSAobi5sZW5ndGggLSBpIC0gMSk7XG4gICAgICAgIHdoaWxlIChkLS0gPiAwKVxuICAgICAgICAgICAgbiArPSAnMCc7XG4gICAgfVxuICAgIHJldHVybiBuO1xufVxuXG5leHBvcnRzLnN0cmluZ2lmeU51bWJlciA9IHN0cmluZ2lmeU51bWJlcjtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgU2NhbGFyID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvU2NhbGFyLmpzJyk7XG52YXIgc3RyaW5naWZ5TnVtYmVyID0gcmVxdWlyZSgnLi4vLi4vc3RyaW5naWZ5L3N0cmluZ2lmeU51bWJlci5qcycpO1xuXG5jb25zdCBmbG9hdE5hTiA9IHtcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmZsb2F0JyxcbiAgICB0ZXN0OiAvXig/OlstK10/XFwuKD86aW5mfEluZnxJTkYpfFxcLm5hbnxcXC5OYU58XFwuTkFOKSQvLFxuICAgIHJlc29sdmU6IHN0ciA9PiBzdHIuc2xpY2UoLTMpLnRvTG93ZXJDYXNlKCkgPT09ICduYW4nXG4gICAgICAgID8gTmFOXG4gICAgICAgIDogc3RyWzBdID09PSAnLSdcbiAgICAgICAgICAgID8gTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZXG4gICAgICAgICAgICA6IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSxcbiAgICBzdHJpbmdpZnk6IHN0cmluZ2lmeU51bWJlci5zdHJpbmdpZnlOdW1iZXJcbn07XG5jb25zdCBmbG9hdEV4cCA9IHtcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmZsb2F0JyxcbiAgICBmb3JtYXQ6ICdFWFAnLFxuICAgIHRlc3Q6IC9eWy0rXT8oPzpcXC5bMC05XSt8WzAtOV0rKD86XFwuWzAtOV0qKT8pW2VFXVstK10/WzAtOV0rJC8sXG4gICAgcmVzb2x2ZTogc3RyID0+IHBhcnNlRmxvYXQoc3RyKSxcbiAgICBzdHJpbmdpZnkobm9kZSkge1xuICAgICAgICBjb25zdCBudW0gPSBOdW1iZXIobm9kZS52YWx1ZSk7XG4gICAgICAgIHJldHVybiBpc0Zpbml0ZShudW0pID8gbnVtLnRvRXhwb25lbnRpYWwoKSA6IHN0cmluZ2lmeU51bWJlci5zdHJpbmdpZnlOdW1iZXIobm9kZSk7XG4gICAgfVxufTtcbmNvbnN0IGZsb2F0ID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6ZmxvYXQnLFxuICAgIHRlc3Q6IC9eWy0rXT8oPzpcXC5bMC05XSt8WzAtOV0rXFwuWzAtOV0qKSQvLFxuICAgIHJlc29sdmUoc3RyKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBuZXcgU2NhbGFyLlNjYWxhcihwYXJzZUZsb2F0KHN0cikpO1xuICAgICAgICBjb25zdCBkb3QgPSBzdHIuaW5kZXhPZignLicpO1xuICAgICAgICBpZiAoZG90ICE9PSAtMSAmJiBzdHJbc3RyLmxlbmd0aCAtIDFdID09PSAnMCcpXG4gICAgICAgICAgICBub2RlLm1pbkZyYWN0aW9uRGlnaXRzID0gc3RyLmxlbmd0aCAtIGRvdCAtIDE7XG4gICAgICAgIHJldHVybiBub2RlO1xuICAgIH0sXG4gICAgc3RyaW5naWZ5OiBzdHJpbmdpZnlOdW1iZXIuc3RyaW5naWZ5TnVtYmVyXG59O1xuXG5leHBvcnRzLmZsb2F0ID0gZmxvYXQ7XG5leHBvcnRzLmZsb2F0RXhwID0gZmxvYXRFeHA7XG5leHBvcnRzLmZsb2F0TmFOID0gZmxvYXROYU47XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIHN0cmluZ2lmeU51bWJlciA9IHJlcXVpcmUoJy4uLy4uL3N0cmluZ2lmeS9zdHJpbmdpZnlOdW1iZXIuanMnKTtcblxuY29uc3QgaW50SWRlbnRpZnkgPSAodmFsdWUpID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ2JpZ2ludCcgfHwgTnVtYmVyLmlzSW50ZWdlcih2YWx1ZSk7XG5jb25zdCBpbnRSZXNvbHZlID0gKHN0ciwgb2Zmc2V0LCByYWRpeCwgeyBpbnRBc0JpZ0ludCB9KSA9PiAoaW50QXNCaWdJbnQgPyBCaWdJbnQoc3RyKSA6IHBhcnNlSW50KHN0ci5zdWJzdHJpbmcob2Zmc2V0KSwgcmFkaXgpKTtcbmZ1bmN0aW9uIGludFN0cmluZ2lmeShub2RlLCByYWRpeCwgcHJlZml4KSB7XG4gICAgY29uc3QgeyB2YWx1ZSB9ID0gbm9kZTtcbiAgICBpZiAoaW50SWRlbnRpZnkodmFsdWUpICYmIHZhbHVlID49IDApXG4gICAgICAgIHJldHVybiBwcmVmaXggKyB2YWx1ZS50b1N0cmluZyhyYWRpeCk7XG4gICAgcmV0dXJuIHN0cmluZ2lmeU51bWJlci5zdHJpbmdpZnlOdW1iZXIobm9kZSk7XG59XG5jb25zdCBpbnRPY3QgPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IGludElkZW50aWZ5KHZhbHVlKSAmJiB2YWx1ZSA+PSAwLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6aW50JyxcbiAgICBmb3JtYXQ6ICdPQ1QnLFxuICAgIHRlc3Q6IC9eMG9bMC03XSskLyxcbiAgICByZXNvbHZlOiAoc3RyLCBfb25FcnJvciwgb3B0KSA9PiBpbnRSZXNvbHZlKHN0ciwgMiwgOCwgb3B0KSxcbiAgICBzdHJpbmdpZnk6IG5vZGUgPT4gaW50U3RyaW5naWZ5KG5vZGUsIDgsICcwbycpXG59O1xuY29uc3QgaW50ID0ge1xuICAgIGlkZW50aWZ5OiBpbnRJZGVudGlmeSxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmludCcsXG4gICAgdGVzdDogL15bLStdP1swLTldKyQvLFxuICAgIHJlc29sdmU6IChzdHIsIF9vbkVycm9yLCBvcHQpID0+IGludFJlc29sdmUoc3RyLCAwLCAxMCwgb3B0KSxcbiAgICBzdHJpbmdpZnk6IHN0cmluZ2lmeU51bWJlci5zdHJpbmdpZnlOdW1iZXJcbn07XG5jb25zdCBpbnRIZXggPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IGludElkZW50aWZ5KHZhbHVlKSAmJiB2YWx1ZSA+PSAwLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6aW50JyxcbiAgICBmb3JtYXQ6ICdIRVgnLFxuICAgIHRlc3Q6IC9eMHhbMC05YS1mQS1GXSskLyxcbiAgICByZXNvbHZlOiAoc3RyLCBfb25FcnJvciwgb3B0KSA9PiBpbnRSZXNvbHZlKHN0ciwgMiwgMTYsIG9wdCksXG4gICAgc3RyaW5naWZ5OiBub2RlID0+IGludFN0cmluZ2lmeShub2RlLCAxNiwgJzB4Jylcbn07XG5cbmV4cG9ydHMuaW50ID0gaW50O1xuZXhwb3J0cy5pbnRIZXggPSBpbnRIZXg7XG5leHBvcnRzLmludE9jdCA9IGludE9jdDtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbWFwID0gcmVxdWlyZSgnLi4vY29tbW9uL21hcC5qcycpO1xudmFyIF9udWxsID0gcmVxdWlyZSgnLi4vY29tbW9uL251bGwuanMnKTtcbnZhciBzZXEgPSByZXF1aXJlKCcuLi9jb21tb24vc2VxLmpzJyk7XG52YXIgc3RyaW5nID0gcmVxdWlyZSgnLi4vY29tbW9uL3N0cmluZy5qcycpO1xudmFyIGJvb2wgPSByZXF1aXJlKCcuL2Jvb2wuanMnKTtcbnZhciBmbG9hdCA9IHJlcXVpcmUoJy4vZmxvYXQuanMnKTtcbnZhciBpbnQgPSByZXF1aXJlKCcuL2ludC5qcycpO1xuXG5jb25zdCBzY2hlbWEgPSBbXG4gICAgbWFwLm1hcCxcbiAgICBzZXEuc2VxLFxuICAgIHN0cmluZy5zdHJpbmcsXG4gICAgX251bGwubnVsbFRhZyxcbiAgICBib29sLmJvb2xUYWcsXG4gICAgaW50LmludE9jdCxcbiAgICBpbnQuaW50LFxuICAgIGludC5pbnRIZXgsXG4gICAgZmxvYXQuZmxvYXROYU4sXG4gICAgZmxvYXQuZmxvYXRFeHAsXG4gICAgZmxvYXQuZmxvYXRcbl07XG5cbmV4cG9ydHMuc2NoZW1hID0gc2NoZW1hO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBTY2FsYXIgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9TY2FsYXIuanMnKTtcbnZhciBtYXAgPSByZXF1aXJlKCcuLi9jb21tb24vbWFwLmpzJyk7XG52YXIgc2VxID0gcmVxdWlyZSgnLi4vY29tbW9uL3NlcS5qcycpO1xuXG5mdW5jdGlvbiBpbnRJZGVudGlmeSh2YWx1ZSkge1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdiaWdpbnQnIHx8IE51bWJlci5pc0ludGVnZXIodmFsdWUpO1xufVxuY29uc3Qgc3RyaW5naWZ5SlNPTiA9ICh7IHZhbHVlIH0pID0+IEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcbmNvbnN0IGpzb25TY2FsYXJzID0gW1xuICAgIHtcbiAgICAgICAgaWRlbnRpZnk6IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycsXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOnN0cicsXG4gICAgICAgIHJlc29sdmU6IHN0ciA9PiBzdHIsXG4gICAgICAgIHN0cmluZ2lmeTogc3RyaW5naWZ5SlNPTlxuICAgIH0sXG4gICAge1xuICAgICAgICBpZGVudGlmeTogdmFsdWUgPT4gdmFsdWUgPT0gbnVsbCxcbiAgICAgICAgY3JlYXRlTm9kZTogKCkgPT4gbmV3IFNjYWxhci5TY2FsYXIobnVsbCksXG4gICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOm51bGwnLFxuICAgICAgICB0ZXN0OiAvXm51bGwkLyxcbiAgICAgICAgcmVzb2x2ZTogKCkgPT4gbnVsbCxcbiAgICAgICAgc3RyaW5naWZ5OiBzdHJpbmdpZnlKU09OXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6Ym9vbCcsXG4gICAgICAgIHRlc3Q6IC9edHJ1ZSR8XmZhbHNlJC8sXG4gICAgICAgIHJlc29sdmU6IHN0ciA9PiBzdHIgPT09ICd0cnVlJyxcbiAgICAgICAgc3RyaW5naWZ5OiBzdHJpbmdpZnlKU09OXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGlkZW50aWZ5OiBpbnRJZGVudGlmeSxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6aW50JyxcbiAgICAgICAgdGVzdDogL14tPyg/OjB8WzEtOV1bMC05XSopJC8sXG4gICAgICAgIHJlc29sdmU6IChzdHIsIF9vbkVycm9yLCB7IGludEFzQmlnSW50IH0pID0+IGludEFzQmlnSW50ID8gQmlnSW50KHN0cikgOiBwYXJzZUludChzdHIsIDEwKSxcbiAgICAgICAgc3RyaW5naWZ5OiAoeyB2YWx1ZSB9KSA9PiBpbnRJZGVudGlmeSh2YWx1ZSkgPyB2YWx1ZS50b1N0cmluZygpIDogSlNPTi5zdHJpbmdpZnkodmFsdWUpXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpmbG9hdCcsXG4gICAgICAgIHRlc3Q6IC9eLT8oPzowfFsxLTldWzAtOV0qKSg/OlxcLlswLTldKik/KD86W2VFXVstK10/WzAtOV0rKT8kLyxcbiAgICAgICAgcmVzb2x2ZTogc3RyID0+IHBhcnNlRmxvYXQoc3RyKSxcbiAgICAgICAgc3RyaW5naWZ5OiBzdHJpbmdpZnlKU09OXG4gICAgfVxuXTtcbmNvbnN0IGpzb25FcnJvciA9IHtcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJycsXG4gICAgdGVzdDogL14vLFxuICAgIHJlc29sdmUoc3RyLCBvbkVycm9yKSB7XG4gICAgICAgIG9uRXJyb3IoYFVucmVzb2x2ZWQgcGxhaW4gc2NhbGFyICR7SlNPTi5zdHJpbmdpZnkoc3RyKX1gKTtcbiAgICAgICAgcmV0dXJuIHN0cjtcbiAgICB9XG59O1xuY29uc3Qgc2NoZW1hID0gW21hcC5tYXAsIHNlcS5zZXFdLmNvbmNhdChqc29uU2NhbGFycywganNvbkVycm9yKTtcblxuZXhwb3J0cy5zY2hlbWEgPSBzY2hlbWE7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIG5vZGVfYnVmZmVyID0gcmVxdWlyZSgnYnVmZmVyJyk7XG52YXIgU2NhbGFyID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvU2NhbGFyLmpzJyk7XG52YXIgc3RyaW5naWZ5U3RyaW5nID0gcmVxdWlyZSgnLi4vLi4vc3RyaW5naWZ5L3N0cmluZ2lmeVN0cmluZy5qcycpO1xuXG5jb25zdCBiaW5hcnkgPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHZhbHVlIGluc3RhbmNlb2YgVWludDhBcnJheSwgLy8gQnVmZmVyIGluaGVyaXRzIGZyb20gVWludDhBcnJheVxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmJpbmFyeScsXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIEJ1ZmZlciBpbiBub2RlIGFuZCBhbiBVaW50OEFycmF5IGluIGJyb3dzZXJzXG4gICAgICpcbiAgICAgKiBUbyB1c2UgdGhlIHJlc3VsdGluZyBidWZmZXIgYXMgYW4gaW1hZ2UsIHlvdSdsbCB3YW50IHRvIGRvIHNvbWV0aGluZyBsaWtlOlxuICAgICAqXG4gICAgICogICBjb25zdCBibG9iID0gbmV3IEJsb2IoW2J1ZmZlcl0sIHsgdHlwZTogJ2ltYWdlL2pwZWcnIH0pXG4gICAgICogICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcGhvdG8nKS5zcmMgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpXG4gICAgICovXG4gICAgcmVzb2x2ZShzcmMsIG9uRXJyb3IpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBub2RlX2J1ZmZlci5CdWZmZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHJldHVybiBub2RlX2J1ZmZlci5CdWZmZXIuZnJvbShzcmMsICdiYXNlNjQnKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0eXBlb2YgYXRvYiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgLy8gT24gSUUgMTEsIGF0b2IoKSBjYW4ndCBoYW5kbGUgbmV3bGluZXNcbiAgICAgICAgICAgIGNvbnN0IHN0ciA9IGF0b2Ioc3JjLnJlcGxhY2UoL1tcXG5cXHJdL2csICcnKSk7XG4gICAgICAgICAgICBjb25zdCBidWZmZXIgPSBuZXcgVWludDhBcnJheShzdHIubGVuZ3RoKTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgICAgIGJ1ZmZlcltpXSA9IHN0ci5jaGFyQ29kZUF0KGkpO1xuICAgICAgICAgICAgcmV0dXJuIGJ1ZmZlcjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIG9uRXJyb3IoJ1RoaXMgZW52aXJvbm1lbnQgZG9lcyBub3Qgc3VwcG9ydCByZWFkaW5nIGJpbmFyeSB0YWdzOyBlaXRoZXIgQnVmZmVyIG9yIGF0b2IgaXMgcmVxdWlyZWQnKTtcbiAgICAgICAgICAgIHJldHVybiBzcmM7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHN0cmluZ2lmeSh7IGNvbW1lbnQsIHR5cGUsIHZhbHVlIH0sIGN0eCwgb25Db21tZW50LCBvbkNob21wS2VlcCkge1xuICAgICAgICBpZiAoIXZhbHVlKVxuICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICBjb25zdCBidWYgPSB2YWx1ZTsgLy8gY2hlY2tlZCBlYXJsaWVyIGJ5IGJpbmFyeS5pZGVudGlmeSgpXG4gICAgICAgIGxldCBzdHI7XG4gICAgICAgIGlmICh0eXBlb2Ygbm9kZV9idWZmZXIuQnVmZmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBzdHIgPVxuICAgICAgICAgICAgICAgIGJ1ZiBpbnN0YW5jZW9mIG5vZGVfYnVmZmVyLkJ1ZmZlclxuICAgICAgICAgICAgICAgICAgICA/IGJ1Zi50b1N0cmluZygnYmFzZTY0JylcbiAgICAgICAgICAgICAgICAgICAgOiBub2RlX2J1ZmZlci5CdWZmZXIuZnJvbShidWYuYnVmZmVyKS50b1N0cmluZygnYmFzZTY0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIGJ0b2EgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGxldCBzID0gJyc7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJ1Zi5sZW5ndGg7ICsraSlcbiAgICAgICAgICAgICAgICBzICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKTtcbiAgICAgICAgICAgIHN0ciA9IGJ0b2Eocyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoaXMgZW52aXJvbm1lbnQgZG9lcyBub3Qgc3VwcG9ydCB3cml0aW5nIGJpbmFyeSB0YWdzOyBlaXRoZXIgQnVmZmVyIG9yIGJ0b2EgaXMgcmVxdWlyZWQnKTtcbiAgICAgICAgfVxuICAgICAgICB0eXBlID8/ICh0eXBlID0gU2NhbGFyLlNjYWxhci5CTE9DS19MSVRFUkFMKTtcbiAgICAgICAgaWYgKHR5cGUgIT09IFNjYWxhci5TY2FsYXIuUVVPVEVfRE9VQkxFKSB7XG4gICAgICAgICAgICBjb25zdCBsaW5lV2lkdGggPSBNYXRoLm1heChjdHgub3B0aW9ucy5saW5lV2lkdGggLSBjdHguaW5kZW50Lmxlbmd0aCwgY3R4Lm9wdGlvbnMubWluQ29udGVudFdpZHRoKTtcbiAgICAgICAgICAgIGNvbnN0IG4gPSBNYXRoLmNlaWwoc3RyLmxlbmd0aCAvIGxpbmVXaWR0aCk7XG4gICAgICAgICAgICBjb25zdCBsaW5lcyA9IG5ldyBBcnJheShuKTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBvID0gMDsgaSA8IG47ICsraSwgbyArPSBsaW5lV2lkdGgpIHtcbiAgICAgICAgICAgICAgICBsaW5lc1tpXSA9IHN0ci5zdWJzdHIobywgbGluZVdpZHRoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN0ciA9IGxpbmVzLmpvaW4odHlwZSA9PT0gU2NhbGFyLlNjYWxhci5CTE9DS19MSVRFUkFMID8gJ1xcbicgOiAnICcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdHJpbmdpZnlTdHJpbmcuc3RyaW5naWZ5U3RyaW5nKHsgY29tbWVudCwgdHlwZSwgdmFsdWU6IHN0ciB9LCBjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApO1xuICAgIH1cbn07XG5cbmV4cG9ydHMuYmluYXJ5ID0gYmluYXJ5O1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBpZGVudGl0eSA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL2lkZW50aXR5LmpzJyk7XG52YXIgUGFpciA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL1BhaXIuanMnKTtcbnZhciBTY2FsYXIgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9TY2FsYXIuanMnKTtcbnZhciBZQU1MU2VxID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvWUFNTFNlcS5qcycpO1xuXG5mdW5jdGlvbiByZXNvbHZlUGFpcnMoc2VxLCBvbkVycm9yKSB7XG4gICAgaWYgKGlkZW50aXR5LmlzU2VxKHNlcSkpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZXEuaXRlbXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGxldCBpdGVtID0gc2VxLml0ZW1zW2ldO1xuICAgICAgICAgICAgaWYgKGlkZW50aXR5LmlzUGFpcihpdGVtKSlcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIGVsc2UgaWYgKGlkZW50aXR5LmlzTWFwKGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0uaXRlbXMubGVuZ3RoID4gMSlcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcignRWFjaCBwYWlyIG11c3QgaGF2ZSBpdHMgb3duIHNlcXVlbmNlIGluZGljYXRvcicpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhaXIgPSBpdGVtLml0ZW1zWzBdIHx8IG5ldyBQYWlyLlBhaXIobmV3IFNjYWxhci5TY2FsYXIobnVsbCkpO1xuICAgICAgICAgICAgICAgIGlmIChpdGVtLmNvbW1lbnRCZWZvcmUpXG4gICAgICAgICAgICAgICAgICAgIHBhaXIua2V5LmNvbW1lbnRCZWZvcmUgPSBwYWlyLmtleS5jb21tZW50QmVmb3JlXG4gICAgICAgICAgICAgICAgICAgICAgICA/IGAke2l0ZW0uY29tbWVudEJlZm9yZX1cXG4ke3BhaXIua2V5LmNvbW1lbnRCZWZvcmV9YFxuICAgICAgICAgICAgICAgICAgICAgICAgOiBpdGVtLmNvbW1lbnRCZWZvcmU7XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0uY29tbWVudCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjbiA9IHBhaXIudmFsdWUgPz8gcGFpci5rZXk7XG4gICAgICAgICAgICAgICAgICAgIGNuLmNvbW1lbnQgPSBjbi5jb21tZW50XG4gICAgICAgICAgICAgICAgICAgICAgICA/IGAke2l0ZW0uY29tbWVudH1cXG4ke2NuLmNvbW1lbnR9YFxuICAgICAgICAgICAgICAgICAgICAgICAgOiBpdGVtLmNvbW1lbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGl0ZW0gPSBwYWlyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VxLml0ZW1zW2ldID0gaWRlbnRpdHkuaXNQYWlyKGl0ZW0pID8gaXRlbSA6IG5ldyBQYWlyLlBhaXIoaXRlbSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZVxuICAgICAgICBvbkVycm9yKCdFeHBlY3RlZCBhIHNlcXVlbmNlIGZvciB0aGlzIHRhZycpO1xuICAgIHJldHVybiBzZXE7XG59XG5mdW5jdGlvbiBjcmVhdGVQYWlycyhzY2hlbWEsIGl0ZXJhYmxlLCBjdHgpIHtcbiAgICBjb25zdCB7IHJlcGxhY2VyIH0gPSBjdHg7XG4gICAgY29uc3QgcGFpcnMgPSBuZXcgWUFNTFNlcS5ZQU1MU2VxKHNjaGVtYSk7XG4gICAgcGFpcnMudGFnID0gJ3RhZzp5YW1sLm9yZywyMDAyOnBhaXJzJztcbiAgICBsZXQgaSA9IDA7XG4gICAgaWYgKGl0ZXJhYmxlICYmIFN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QoaXRlcmFibGUpKVxuICAgICAgICBmb3IgKGxldCBpdCBvZiBpdGVyYWJsZSkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiByZXBsYWNlciA9PT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgICAgICAgICBpdCA9IHJlcGxhY2VyLmNhbGwoaXRlcmFibGUsIFN0cmluZyhpKyspLCBpdCk7XG4gICAgICAgICAgICBsZXQga2V5LCB2YWx1ZTtcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGl0KSkge1xuICAgICAgICAgICAgICAgIGlmIChpdC5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAgICAgICAgICAga2V5ID0gaXRbMF07XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gaXRbMV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgW2tleSwgdmFsdWVdIHR1cGxlOiAke2l0fWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoaXQgJiYgaXQgaW5zdGFuY2VvZiBPYmplY3QpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMoaXQpO1xuICAgICAgICAgICAgICAgIGlmIChrZXlzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgICAgICAgICBrZXkgPSBrZXlzWzBdO1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IGl0W2tleV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCB0dXBsZSB3aXRoIG9uZSBrZXksIG5vdCAke2tleXMubGVuZ3RofSBrZXlzYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAga2V5ID0gaXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYWlycy5pdGVtcy5wdXNoKFBhaXIuY3JlYXRlUGFpcihrZXksIHZhbHVlLCBjdHgpKTtcbiAgICAgICAgfVxuICAgIHJldHVybiBwYWlycztcbn1cbmNvbnN0IHBhaXJzID0ge1xuICAgIGNvbGxlY3Rpb246ICdzZXEnLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOnBhaXJzJyxcbiAgICByZXNvbHZlOiByZXNvbHZlUGFpcnMsXG4gICAgY3JlYXRlTm9kZTogY3JlYXRlUGFpcnNcbn07XG5cbmV4cG9ydHMuY3JlYXRlUGFpcnMgPSBjcmVhdGVQYWlycztcbmV4cG9ydHMucGFpcnMgPSBwYWlycztcbmV4cG9ydHMucmVzb2x2ZVBhaXJzID0gcmVzb2x2ZVBhaXJzO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBpZGVudGl0eSA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL2lkZW50aXR5LmpzJyk7XG52YXIgdG9KUyA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL3RvSlMuanMnKTtcbnZhciBZQU1MTWFwID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvWUFNTE1hcC5qcycpO1xudmFyIFlBTUxTZXEgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9ZQU1MU2VxLmpzJyk7XG52YXIgcGFpcnMgPSByZXF1aXJlKCcuL3BhaXJzLmpzJyk7XG5cbmNsYXNzIFlBTUxPTWFwIGV4dGVuZHMgWUFNTFNlcS5ZQU1MU2VxIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5hZGQgPSBZQU1MTWFwLllBTUxNYXAucHJvdG90eXBlLmFkZC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmRlbGV0ZSA9IFlBTUxNYXAuWUFNTE1hcC5wcm90b3R5cGUuZGVsZXRlLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuZ2V0ID0gWUFNTE1hcC5ZQU1MTWFwLnByb3RvdHlwZS5nZXQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5oYXMgPSBZQU1MTWFwLllBTUxNYXAucHJvdG90eXBlLmhhcy5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnNldCA9IFlBTUxNYXAuWUFNTE1hcC5wcm90b3R5cGUuc2V0LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMudGFnID0gWUFNTE9NYXAudGFnO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBJZiBgY3R4YCBpcyBnaXZlbiwgdGhlIHJldHVybiB0eXBlIGlzIGFjdHVhbGx5IGBNYXA8dW5rbm93biwgdW5rbm93bj5gLFxuICAgICAqIGJ1dCBUeXBlU2NyaXB0IHdvbid0IGFsbG93IHdpZGVuaW5nIHRoZSBzaWduYXR1cmUgb2YgYSBjaGlsZCBtZXRob2QuXG4gICAgICovXG4gICAgdG9KU09OKF8sIGN0eCkge1xuICAgICAgICBpZiAoIWN0eClcbiAgICAgICAgICAgIHJldHVybiBzdXBlci50b0pTT04oXyk7XG4gICAgICAgIGNvbnN0IG1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgaWYgKGN0eD8ub25DcmVhdGUpXG4gICAgICAgICAgICBjdHgub25DcmVhdGUobWFwKTtcbiAgICAgICAgZm9yIChjb25zdCBwYWlyIG9mIHRoaXMuaXRlbXMpIHtcbiAgICAgICAgICAgIGxldCBrZXksIHZhbHVlO1xuICAgICAgICAgICAgaWYgKGlkZW50aXR5LmlzUGFpcihwYWlyKSkge1xuICAgICAgICAgICAgICAgIGtleSA9IHRvSlMudG9KUyhwYWlyLmtleSwgJycsIGN0eCk7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSB0b0pTLnRvSlMocGFpci52YWx1ZSwga2V5LCBjdHgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAga2V5ID0gdG9KUy50b0pTKHBhaXIsICcnLCBjdHgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG1hcC5oYXMoa2V5KSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ09yZGVyZWQgbWFwcyBtdXN0IG5vdCBpbmNsdWRlIGR1cGxpY2F0ZSBrZXlzJyk7XG4gICAgICAgICAgICBtYXAuc2V0KGtleSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXA7XG4gICAgfVxuICAgIHN0YXRpYyBmcm9tKHNjaGVtYSwgaXRlcmFibGUsIGN0eCkge1xuICAgICAgICBjb25zdCBwYWlycyQxID0gcGFpcnMuY3JlYXRlUGFpcnMoc2NoZW1hLCBpdGVyYWJsZSwgY3R4KTtcbiAgICAgICAgY29uc3Qgb21hcCA9IG5ldyB0aGlzKCk7XG4gICAgICAgIG9tYXAuaXRlbXMgPSBwYWlycyQxLml0ZW1zO1xuICAgICAgICByZXR1cm4gb21hcDtcbiAgICB9XG59XG5ZQU1MT01hcC50YWcgPSAndGFnOnlhbWwub3JnLDIwMDI6b21hcCc7XG5jb25zdCBvbWFwID0ge1xuICAgIGNvbGxlY3Rpb246ICdzZXEnLFxuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB2YWx1ZSBpbnN0YW5jZW9mIE1hcCxcbiAgICBub2RlQ2xhc3M6IFlBTUxPTWFwLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOm9tYXAnLFxuICAgIHJlc29sdmUoc2VxLCBvbkVycm9yKSB7XG4gICAgICAgIGNvbnN0IHBhaXJzJDEgPSBwYWlycy5yZXNvbHZlUGFpcnMoc2VxLCBvbkVycm9yKTtcbiAgICAgICAgY29uc3Qgc2VlbktleXMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCB7IGtleSB9IG9mIHBhaXJzJDEuaXRlbXMpIHtcbiAgICAgICAgICAgIGlmIChpZGVudGl0eS5pc1NjYWxhcihrZXkpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNlZW5LZXlzLmluY2x1ZGVzKGtleS52YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcihgT3JkZXJlZCBtYXBzIG11c3Qgbm90IGluY2x1ZGUgZHVwbGljYXRlIGtleXM6ICR7a2V5LnZhbHVlfWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc2VlbktleXMucHVzaChrZXkudmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihuZXcgWUFNTE9NYXAoKSwgcGFpcnMkMSk7XG4gICAgfSxcbiAgICBjcmVhdGVOb2RlOiAoc2NoZW1hLCBpdGVyYWJsZSwgY3R4KSA9PiBZQU1MT01hcC5mcm9tKHNjaGVtYSwgaXRlcmFibGUsIGN0eClcbn07XG5cbmV4cG9ydHMuWUFNTE9NYXAgPSBZQU1MT01hcDtcbmV4cG9ydHMub21hcCA9IG9tYXA7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIFNjYWxhciA9IHJlcXVpcmUoJy4uLy4uL25vZGVzL1NjYWxhci5qcycpO1xuXG5mdW5jdGlvbiBib29sU3RyaW5naWZ5KHsgdmFsdWUsIHNvdXJjZSB9LCBjdHgpIHtcbiAgICBjb25zdCBib29sT2JqID0gdmFsdWUgPyB0cnVlVGFnIDogZmFsc2VUYWc7XG4gICAgaWYgKHNvdXJjZSAmJiBib29sT2JqLnRlc3QudGVzdChzb3VyY2UpKVxuICAgICAgICByZXR1cm4gc291cmNlO1xuICAgIHJldHVybiB2YWx1ZSA/IGN0eC5vcHRpb25zLnRydWVTdHIgOiBjdHgub3B0aW9ucy5mYWxzZVN0cjtcbn1cbmNvbnN0IHRydWVUYWcgPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHZhbHVlID09PSB0cnVlLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6Ym9vbCcsXG4gICAgdGVzdDogL14oPzpZfHl8W1l5XWVzfFlFU3xbVHRdcnVlfFRSVUV8W09vXW58T04pJC8sXG4gICAgcmVzb2x2ZTogKCkgPT4gbmV3IFNjYWxhci5TY2FsYXIodHJ1ZSksXG4gICAgc3RyaW5naWZ5OiBib29sU3RyaW5naWZ5XG59O1xuY29uc3QgZmFsc2VUYWcgPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHZhbHVlID09PSBmYWxzZSxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmJvb2wnLFxuICAgIHRlc3Q6IC9eKD86TnxufFtObl1vfE5PfFtGZl1hbHNlfEZBTFNFfFtPb11mZnxPRkYpJC8sXG4gICAgcmVzb2x2ZTogKCkgPT4gbmV3IFNjYWxhci5TY2FsYXIoZmFsc2UpLFxuICAgIHN0cmluZ2lmeTogYm9vbFN0cmluZ2lmeVxufTtcblxuZXhwb3J0cy5mYWxzZVRhZyA9IGZhbHNlVGFnO1xuZXhwb3J0cy50cnVlVGFnID0gdHJ1ZVRhZztcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgU2NhbGFyID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvU2NhbGFyLmpzJyk7XG52YXIgc3RyaW5naWZ5TnVtYmVyID0gcmVxdWlyZSgnLi4vLi4vc3RyaW5naWZ5L3N0cmluZ2lmeU51bWJlci5qcycpO1xuXG5jb25zdCBmbG9hdE5hTiA9IHtcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmZsb2F0JyxcbiAgICB0ZXN0OiAvXig/OlstK10/XFwuKD86aW5mfEluZnxJTkYpfFxcLm5hbnxcXC5OYU58XFwuTkFOKSQvLFxuICAgIHJlc29sdmU6IChzdHIpID0+IHN0ci5zbGljZSgtMykudG9Mb3dlckNhc2UoKSA9PT0gJ25hbidcbiAgICAgICAgPyBOYU5cbiAgICAgICAgOiBzdHJbMF0gPT09ICctJ1xuICAgICAgICAgICAgPyBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFlcbiAgICAgICAgICAgIDogTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZLFxuICAgIHN0cmluZ2lmeTogc3RyaW5naWZ5TnVtYmVyLnN0cmluZ2lmeU51bWJlclxufTtcbmNvbnN0IGZsb2F0RXhwID0ge1xuICAgIGlkZW50aWZ5OiB2YWx1ZSA9PiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6ZmxvYXQnLFxuICAgIGZvcm1hdDogJ0VYUCcsXG4gICAgdGVzdDogL15bLStdPyg/OlswLTldWzAtOV9dKik/KD86XFwuWzAtOV9dKik/W2VFXVstK10/WzAtOV0rJC8sXG4gICAgcmVzb2x2ZTogKHN0cikgPT4gcGFyc2VGbG9hdChzdHIucmVwbGFjZSgvXy9nLCAnJykpLFxuICAgIHN0cmluZ2lmeShub2RlKSB7XG4gICAgICAgIGNvbnN0IG51bSA9IE51bWJlcihub2RlLnZhbHVlKTtcbiAgICAgICAgcmV0dXJuIGlzRmluaXRlKG51bSkgPyBudW0udG9FeHBvbmVudGlhbCgpIDogc3RyaW5naWZ5TnVtYmVyLnN0cmluZ2lmeU51bWJlcihub2RlKTtcbiAgICB9XG59O1xuY29uc3QgZmxvYXQgPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjpmbG9hdCcsXG4gICAgdGVzdDogL15bLStdPyg/OlswLTldWzAtOV9dKik/XFwuWzAtOV9dKiQvLFxuICAgIHJlc29sdmUoc3RyKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBuZXcgU2NhbGFyLlNjYWxhcihwYXJzZUZsb2F0KHN0ci5yZXBsYWNlKC9fL2csICcnKSkpO1xuICAgICAgICBjb25zdCBkb3QgPSBzdHIuaW5kZXhPZignLicpO1xuICAgICAgICBpZiAoZG90ICE9PSAtMSkge1xuICAgICAgICAgICAgY29uc3QgZiA9IHN0ci5zdWJzdHJpbmcoZG90ICsgMSkucmVwbGFjZSgvXy9nLCAnJyk7XG4gICAgICAgICAgICBpZiAoZltmLmxlbmd0aCAtIDFdID09PSAnMCcpXG4gICAgICAgICAgICAgICAgbm9kZS5taW5GcmFjdGlvbkRpZ2l0cyA9IGYubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBub2RlO1xuICAgIH0sXG4gICAgc3RyaW5naWZ5OiBzdHJpbmdpZnlOdW1iZXIuc3RyaW5naWZ5TnVtYmVyXG59O1xuXG5leHBvcnRzLmZsb2F0ID0gZmxvYXQ7XG5leHBvcnRzLmZsb2F0RXhwID0gZmxvYXRFeHA7XG5leHBvcnRzLmZsb2F0TmFOID0gZmxvYXROYU47XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIHN0cmluZ2lmeU51bWJlciA9IHJlcXVpcmUoJy4uLy4uL3N0cmluZ2lmeS9zdHJpbmdpZnlOdW1iZXIuanMnKTtcblxuY29uc3QgaW50SWRlbnRpZnkgPSAodmFsdWUpID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ2JpZ2ludCcgfHwgTnVtYmVyLmlzSW50ZWdlcih2YWx1ZSk7XG5mdW5jdGlvbiBpbnRSZXNvbHZlKHN0ciwgb2Zmc2V0LCByYWRpeCwgeyBpbnRBc0JpZ0ludCB9KSB7XG4gICAgY29uc3Qgc2lnbiA9IHN0clswXTtcbiAgICBpZiAoc2lnbiA9PT0gJy0nIHx8IHNpZ24gPT09ICcrJylcbiAgICAgICAgb2Zmc2V0ICs9IDE7XG4gICAgc3RyID0gc3RyLnN1YnN0cmluZyhvZmZzZXQpLnJlcGxhY2UoL18vZywgJycpO1xuICAgIGlmIChpbnRBc0JpZ0ludCkge1xuICAgICAgICBzd2l0Y2ggKHJhZGl4KSB7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgc3RyID0gYDBiJHtzdHJ9YDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgODpcbiAgICAgICAgICAgICAgICBzdHIgPSBgMG8ke3N0cn1gO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAxNjpcbiAgICAgICAgICAgICAgICBzdHIgPSBgMHgke3N0cn1gO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG4gPSBCaWdJbnQoc3RyKTtcbiAgICAgICAgcmV0dXJuIHNpZ24gPT09ICctJyA/IEJpZ0ludCgtMSkgKiBuIDogbjtcbiAgICB9XG4gICAgY29uc3QgbiA9IHBhcnNlSW50KHN0ciwgcmFkaXgpO1xuICAgIHJldHVybiBzaWduID09PSAnLScgPyAtMSAqIG4gOiBuO1xufVxuZnVuY3Rpb24gaW50U3RyaW5naWZ5KG5vZGUsIHJhZGl4LCBwcmVmaXgpIHtcbiAgICBjb25zdCB7IHZhbHVlIH0gPSBub2RlO1xuICAgIGlmIChpbnRJZGVudGlmeSh2YWx1ZSkpIHtcbiAgICAgICAgY29uc3Qgc3RyID0gdmFsdWUudG9TdHJpbmcocmFkaXgpO1xuICAgICAgICByZXR1cm4gdmFsdWUgPCAwID8gJy0nICsgcHJlZml4ICsgc3RyLnN1YnN0cigxKSA6IHByZWZpeCArIHN0cjtcbiAgICB9XG4gICAgcmV0dXJuIHN0cmluZ2lmeU51bWJlci5zdHJpbmdpZnlOdW1iZXIobm9kZSk7XG59XG5jb25zdCBpbnRCaW4gPSB7XG4gICAgaWRlbnRpZnk6IGludElkZW50aWZ5LFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6aW50JyxcbiAgICBmb3JtYXQ6ICdCSU4nLFxuICAgIHRlc3Q6IC9eWy0rXT8wYlswLTFfXSskLyxcbiAgICByZXNvbHZlOiAoc3RyLCBfb25FcnJvciwgb3B0KSA9PiBpbnRSZXNvbHZlKHN0ciwgMiwgMiwgb3B0KSxcbiAgICBzdHJpbmdpZnk6IG5vZGUgPT4gaW50U3RyaW5naWZ5KG5vZGUsIDIsICcwYicpXG59O1xuY29uc3QgaW50T2N0ID0ge1xuICAgIGlkZW50aWZ5OiBpbnRJZGVudGlmeSxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmludCcsXG4gICAgZm9ybWF0OiAnT0NUJyxcbiAgICB0ZXN0OiAvXlstK10/MFswLTdfXSskLyxcbiAgICByZXNvbHZlOiAoc3RyLCBfb25FcnJvciwgb3B0KSA9PiBpbnRSZXNvbHZlKHN0ciwgMSwgOCwgb3B0KSxcbiAgICBzdHJpbmdpZnk6IG5vZGUgPT4gaW50U3RyaW5naWZ5KG5vZGUsIDgsICcwJylcbn07XG5jb25zdCBpbnQgPSB7XG4gICAgaWRlbnRpZnk6IGludElkZW50aWZ5LFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6aW50JyxcbiAgICB0ZXN0OiAvXlstK10/WzAtOV1bMC05X10qJC8sXG4gICAgcmVzb2x2ZTogKHN0ciwgX29uRXJyb3IsIG9wdCkgPT4gaW50UmVzb2x2ZShzdHIsIDAsIDEwLCBvcHQpLFxuICAgIHN0cmluZ2lmeTogc3RyaW5naWZ5TnVtYmVyLnN0cmluZ2lmeU51bWJlclxufTtcbmNvbnN0IGludEhleCA9IHtcbiAgICBpZGVudGlmeTogaW50SWRlbnRpZnksXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjppbnQnLFxuICAgIGZvcm1hdDogJ0hFWCcsXG4gICAgdGVzdDogL15bLStdPzB4WzAtOWEtZkEtRl9dKyQvLFxuICAgIHJlc29sdmU6IChzdHIsIF9vbkVycm9yLCBvcHQpID0+IGludFJlc29sdmUoc3RyLCAyLCAxNiwgb3B0KSxcbiAgICBzdHJpbmdpZnk6IG5vZGUgPT4gaW50U3RyaW5naWZ5KG5vZGUsIDE2LCAnMHgnKVxufTtcblxuZXhwb3J0cy5pbnQgPSBpbnQ7XG5leHBvcnRzLmludEJpbiA9IGludEJpbjtcbmV4cG9ydHMuaW50SGV4ID0gaW50SGV4O1xuZXhwb3J0cy5pbnRPY3QgPSBpbnRPY3Q7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIGlkZW50aXR5ID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvaWRlbnRpdHkuanMnKTtcbnZhciBQYWlyID0gcmVxdWlyZSgnLi4vLi4vbm9kZXMvUGFpci5qcycpO1xudmFyIFlBTUxNYXAgPSByZXF1aXJlKCcuLi8uLi9ub2Rlcy9ZQU1MTWFwLmpzJyk7XG5cbmNsYXNzIFlBTUxTZXQgZXh0ZW5kcyBZQU1MTWFwLllBTUxNYXAge1xuICAgIGNvbnN0cnVjdG9yKHNjaGVtYSkge1xuICAgICAgICBzdXBlcihzY2hlbWEpO1xuICAgICAgICB0aGlzLnRhZyA9IFlBTUxTZXQudGFnO1xuICAgIH1cbiAgICBhZGQoa2V5KSB7XG4gICAgICAgIGxldCBwYWlyO1xuICAgICAgICBpZiAoaWRlbnRpdHkuaXNQYWlyKGtleSkpXG4gICAgICAgICAgICBwYWlyID0ga2V5O1xuICAgICAgICBlbHNlIGlmIChrZXkgJiZcbiAgICAgICAgICAgIHR5cGVvZiBrZXkgPT09ICdvYmplY3QnICYmXG4gICAgICAgICAgICAna2V5JyBpbiBrZXkgJiZcbiAgICAgICAgICAgICd2YWx1ZScgaW4ga2V5ICYmXG4gICAgICAgICAgICBrZXkudmFsdWUgPT09IG51bGwpXG4gICAgICAgICAgICBwYWlyID0gbmV3IFBhaXIuUGFpcihrZXkua2V5LCBudWxsKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcGFpciA9IG5ldyBQYWlyLlBhaXIoa2V5LCBudWxsKTtcbiAgICAgICAgY29uc3QgcHJldiA9IFlBTUxNYXAuZmluZFBhaXIodGhpcy5pdGVtcywgcGFpci5rZXkpO1xuICAgICAgICBpZiAoIXByZXYpXG4gICAgICAgICAgICB0aGlzLml0ZW1zLnB1c2gocGFpcik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIElmIGBrZWVwUGFpcmAgaXMgYHRydWVgLCByZXR1cm5zIHRoZSBQYWlyIG1hdGNoaW5nIGBrZXlgLlxuICAgICAqIE90aGVyd2lzZSwgcmV0dXJucyB0aGUgdmFsdWUgb2YgdGhhdCBQYWlyJ3Mga2V5LlxuICAgICAqL1xuICAgIGdldChrZXksIGtlZXBQYWlyKSB7XG4gICAgICAgIGNvbnN0IHBhaXIgPSBZQU1MTWFwLmZpbmRQYWlyKHRoaXMuaXRlbXMsIGtleSk7XG4gICAgICAgIHJldHVybiAha2VlcFBhaXIgJiYgaWRlbnRpdHkuaXNQYWlyKHBhaXIpXG4gICAgICAgICAgICA/IGlkZW50aXR5LmlzU2NhbGFyKHBhaXIua2V5KVxuICAgICAgICAgICAgICAgID8gcGFpci5rZXkudmFsdWVcbiAgICAgICAgICAgICAgICA6IHBhaXIua2V5XG4gICAgICAgICAgICA6IHBhaXI7XG4gICAgfVxuICAgIHNldChrZXksIHZhbHVlKSB7XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdib29sZWFuJylcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgYm9vbGVhbiB2YWx1ZSBmb3Igc2V0KGtleSwgdmFsdWUpIGluIGEgWUFNTCBzZXQsIG5vdCAke3R5cGVvZiB2YWx1ZX1gKTtcbiAgICAgICAgY29uc3QgcHJldiA9IFlBTUxNYXAuZmluZFBhaXIodGhpcy5pdGVtcywga2V5KTtcbiAgICAgICAgaWYgKHByZXYgJiYgIXZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLml0ZW1zLnNwbGljZSh0aGlzLml0ZW1zLmluZGV4T2YocHJldiksIDEpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCFwcmV2ICYmIHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLml0ZW1zLnB1c2gobmV3IFBhaXIuUGFpcihrZXkpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0b0pTT04oXywgY3R4KSB7XG4gICAgICAgIHJldHVybiBzdXBlci50b0pTT04oXywgY3R4LCBTZXQpO1xuICAgIH1cbiAgICB0b1N0cmluZyhjdHgsIG9uQ29tbWVudCwgb25DaG9tcEtlZXApIHtcbiAgICAgICAgaWYgKCFjdHgpXG4gICAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcyk7XG4gICAgICAgIGlmICh0aGlzLmhhc0FsbE51bGxWYWx1ZXModHJ1ZSkpXG4gICAgICAgICAgICByZXR1cm4gc3VwZXIudG9TdHJpbmcoT2JqZWN0LmFzc2lnbih7fSwgY3R4LCB7IGFsbE51bGxWYWx1ZXM6IHRydWUgfSksIG9uQ29tbWVudCwgb25DaG9tcEtlZXApO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NldCBpdGVtcyBtdXN0IGFsbCBoYXZlIG51bGwgdmFsdWVzJyk7XG4gICAgfVxuICAgIHN0YXRpYyBmcm9tKHNjaGVtYSwgaXRlcmFibGUsIGN0eCkge1xuICAgICAgICBjb25zdCB7IHJlcGxhY2VyIH0gPSBjdHg7XG4gICAgICAgIGNvbnN0IHNldCA9IG5ldyB0aGlzKHNjaGVtYSk7XG4gICAgICAgIGlmIChpdGVyYWJsZSAmJiBTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KGl0ZXJhYmxlKSlcbiAgICAgICAgICAgIGZvciAobGV0IHZhbHVlIG9mIGl0ZXJhYmxlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiByZXBsYWNlciA9PT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSByZXBsYWNlci5jYWxsKGl0ZXJhYmxlLCB2YWx1ZSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIHNldC5pdGVtcy5wdXNoKFBhaXIuY3JlYXRlUGFpcih2YWx1ZSwgbnVsbCwgY3R4KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIHJldHVybiBzZXQ7XG4gICAgfVxufVxuWUFNTFNldC50YWcgPSAndGFnOnlhbWwub3JnLDIwMDI6c2V0JztcbmNvbnN0IHNldCA9IHtcbiAgICBjb2xsZWN0aW9uOiAnbWFwJyxcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gdmFsdWUgaW5zdGFuY2VvZiBTZXQsXG4gICAgbm9kZUNsYXNzOiBZQU1MU2V0LFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOnNldCcsXG4gICAgY3JlYXRlTm9kZTogKHNjaGVtYSwgaXRlcmFibGUsIGN0eCkgPT4gWUFNTFNldC5mcm9tKHNjaGVtYSwgaXRlcmFibGUsIGN0eCksXG4gICAgcmVzb2x2ZShtYXAsIG9uRXJyb3IpIHtcbiAgICAgICAgaWYgKGlkZW50aXR5LmlzTWFwKG1hcCkpIHtcbiAgICAgICAgICAgIGlmIChtYXAuaGFzQWxsTnVsbFZhbHVlcyh0cnVlKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihuZXcgWUFNTFNldCgpLCBtYXApO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG9uRXJyb3IoJ1NldCBpdGVtcyBtdXN0IGFsbCBoYXZlIG51bGwgdmFsdWVzJyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgb25FcnJvcignRXhwZWN0ZWQgYSBtYXBwaW5nIGZvciB0aGlzIHRhZycpO1xuICAgICAgICByZXR1cm4gbWFwO1xuICAgIH1cbn07XG5cbmV4cG9ydHMuWUFNTFNldCA9IFlBTUxTZXQ7XG5leHBvcnRzLnNldCA9IHNldDtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgc3RyaW5naWZ5TnVtYmVyID0gcmVxdWlyZSgnLi4vLi4vc3RyaW5naWZ5L3N0cmluZ2lmeU51bWJlci5qcycpO1xuXG4vKiogSW50ZXJuYWwgdHlwZXMgaGFuZGxlIGJpZ2ludCBhcyBudW1iZXIsIGJlY2F1c2UgVFMgY2FuJ3QgZmlndXJlIGl0IG91dC4gKi9cbmZ1bmN0aW9uIHBhcnNlU2V4YWdlc2ltYWwoc3RyLCBhc0JpZ0ludCkge1xuICAgIGNvbnN0IHNpZ24gPSBzdHJbMF07XG4gICAgY29uc3QgcGFydHMgPSBzaWduID09PSAnLScgfHwgc2lnbiA9PT0gJysnID8gc3RyLnN1YnN0cmluZygxKSA6IHN0cjtcbiAgICBjb25zdCBudW0gPSAobikgPT4gYXNCaWdJbnQgPyBCaWdJbnQobikgOiBOdW1iZXIobik7XG4gICAgY29uc3QgcmVzID0gcGFydHNcbiAgICAgICAgLnJlcGxhY2UoL18vZywgJycpXG4gICAgICAgIC5zcGxpdCgnOicpXG4gICAgICAgIC5yZWR1Y2UoKHJlcywgcCkgPT4gcmVzICogbnVtKDYwKSArIG51bShwKSwgbnVtKDApKTtcbiAgICByZXR1cm4gKHNpZ24gPT09ICctJyA/IG51bSgtMSkgKiByZXMgOiByZXMpO1xufVxuLyoqXG4gKiBoaGhoOm1tOnNzLnNzc1xuICpcbiAqIEludGVybmFsIHR5cGVzIGhhbmRsZSBiaWdpbnQgYXMgbnVtYmVyLCBiZWNhdXNlIFRTIGNhbid0IGZpZ3VyZSBpdCBvdXQuXG4gKi9cbmZ1bmN0aW9uIHN0cmluZ2lmeVNleGFnZXNpbWFsKG5vZGUpIHtcbiAgICBsZXQgeyB2YWx1ZSB9ID0gbm9kZTtcbiAgICBsZXQgbnVtID0gKG4pID0+IG47XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2JpZ2ludCcpXG4gICAgICAgIG51bSA9IG4gPT4gQmlnSW50KG4pO1xuICAgIGVsc2UgaWYgKGlzTmFOKHZhbHVlKSB8fCAhaXNGaW5pdGUodmFsdWUpKVxuICAgICAgICByZXR1cm4gc3RyaW5naWZ5TnVtYmVyLnN0cmluZ2lmeU51bWJlcihub2RlKTtcbiAgICBsZXQgc2lnbiA9ICcnO1xuICAgIGlmICh2YWx1ZSA8IDApIHtcbiAgICAgICAgc2lnbiA9ICctJztcbiAgICAgICAgdmFsdWUgKj0gbnVtKC0xKTtcbiAgICB9XG4gICAgY29uc3QgXzYwID0gbnVtKDYwKTtcbiAgICBjb25zdCBwYXJ0cyA9IFt2YWx1ZSAlIF82MF07IC8vIHNlY29uZHMsIGluY2x1ZGluZyBtc1xuICAgIGlmICh2YWx1ZSA8IDYwKSB7XG4gICAgICAgIHBhcnRzLnVuc2hpZnQoMCk7IC8vIGF0IGxlYXN0IG9uZSA6IGlzIHJlcXVpcmVkXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB2YWx1ZSA9ICh2YWx1ZSAtIHBhcnRzWzBdKSAvIF82MDtcbiAgICAgICAgcGFydHMudW5zaGlmdCh2YWx1ZSAlIF82MCk7IC8vIG1pbnV0ZXNcbiAgICAgICAgaWYgKHZhbHVlID49IDYwKSB7XG4gICAgICAgICAgICB2YWx1ZSA9ICh2YWx1ZSAtIHBhcnRzWzBdKSAvIF82MDtcbiAgICAgICAgICAgIHBhcnRzLnVuc2hpZnQodmFsdWUpOyAvLyBob3Vyc1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiAoc2lnbiArXG4gICAgICAgIHBhcnRzXG4gICAgICAgICAgICAubWFwKG4gPT4gU3RyaW5nKG4pLnBhZFN0YXJ0KDIsICcwJykpXG4gICAgICAgICAgICAuam9pbignOicpXG4gICAgICAgICAgICAucmVwbGFjZSgvMDAwMDAwXFxkKiQvLCAnJykgLy8gJSA2MCBtYXkgaW50cm9kdWNlIGVycm9yXG4gICAgKTtcbn1cbmNvbnN0IGludFRpbWUgPSB7XG4gICAgaWRlbnRpZnk6IHZhbHVlID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ2JpZ2ludCcgfHwgTnVtYmVyLmlzSW50ZWdlcih2YWx1ZSksXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB0YWc6ICd0YWc6eWFtbC5vcmcsMjAwMjppbnQnLFxuICAgIGZvcm1hdDogJ1RJTUUnLFxuICAgIHRlc3Q6IC9eWy0rXT9bMC05XVswLTlfXSooPzo6WzAtNV0/WzAtOV0pKyQvLFxuICAgIHJlc29sdmU6IChzdHIsIF9vbkVycm9yLCB7IGludEFzQmlnSW50IH0pID0+IHBhcnNlU2V4YWdlc2ltYWwoc3RyLCBpbnRBc0JpZ0ludCksXG4gICAgc3RyaW5naWZ5OiBzdHJpbmdpZnlTZXhhZ2VzaW1hbFxufTtcbmNvbnN0IGZsb2F0VGltZSA9IHtcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIHRhZzogJ3RhZzp5YW1sLm9yZywyMDAyOmZsb2F0JyxcbiAgICBmb3JtYXQ6ICdUSU1FJyxcbiAgICB0ZXN0OiAvXlstK10/WzAtOV1bMC05X10qKD86OlswLTVdP1swLTldKStcXC5bMC05X10qJC8sXG4gICAgcmVzb2x2ZTogc3RyID0+IHBhcnNlU2V4YWdlc2ltYWwoc3RyLCBmYWxzZSksXG4gICAgc3RyaW5naWZ5OiBzdHJpbmdpZnlTZXhhZ2VzaW1hbFxufTtcbmNvbnN0IHRpbWVzdGFtcCA9IHtcbiAgICBpZGVudGlmeTogdmFsdWUgPT4gdmFsdWUgaW5zdGFuY2VvZiBEYXRlLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgdGFnOiAndGFnOnlhbWwub3JnLDIwMDI6dGltZXN0YW1wJyxcbiAgICAvLyBJZiB0aGUgdGltZSB6b25lIGlzIG9taXR0ZWQsIHRoZSB0aW1lc3RhbXAgaXMgYXNzdW1lZCB0byBiZSBzcGVjaWZpZWQgaW4gVVRDLiBUaGUgdGltZSBwYXJ0XG4gICAgLy8gbWF5IGJlIG9taXR0ZWQgYWx0b2dldGhlciwgcmVzdWx0aW5nIGluIGEgZGF0ZSBmb3JtYXQuIEluIHN1Y2ggYSBjYXNlLCB0aGUgdGltZSBwYXJ0IGlzXG4gICAgLy8gYXNzdW1lZCB0byBiZSAwMDowMDowMFogKHN0YXJ0IG9mIGRheSwgVVRDKS5cbiAgICB0ZXN0OiBSZWdFeHAoJ14oWzAtOV17NH0pLShbMC05XXsxLDJ9KS0oWzAtOV17MSwyfSknICsgLy8gWVlZWS1NbS1EZFxuICAgICAgICAnKD86JyArIC8vIHRpbWUgaXMgb3B0aW9uYWxcbiAgICAgICAgJyg/OnR8VHxbIFxcXFx0XSspJyArIC8vIHQgfCBUIHwgd2hpdGVzcGFjZVxuICAgICAgICAnKFswLTldezEsMn0pOihbMC05XXsxLDJ9KTooWzAtOV17MSwyfShcXFxcLlswLTldKyk/KScgKyAvLyBIaDpNbTpTcyguc3MpP1xuICAgICAgICAnKD86WyBcXFxcdF0qKFp8Wy0rXVswMTJdP1swLTldKD86OlswLTldezJ9KT8pKT8nICsgLy8gWiB8ICs1IHwgLTAzOjMwXG4gICAgICAgICcpPyQnKSxcbiAgICByZXNvbHZlKHN0cikge1xuICAgICAgICBjb25zdCBtYXRjaCA9IHN0ci5tYXRjaCh0aW1lc3RhbXAudGVzdCk7XG4gICAgICAgIGlmICghbWF0Y2gpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJyEhdGltZXN0YW1wIGV4cGVjdHMgYSBkYXRlLCBzdGFydGluZyB3aXRoIHl5eXktbW0tZGQnKTtcbiAgICAgICAgY29uc3QgWywgeWVhciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmRdID0gbWF0Y2gubWFwKE51bWJlcik7XG4gICAgICAgIGNvbnN0IG1pbGxpc2VjID0gbWF0Y2hbN10gPyBOdW1iZXIoKG1hdGNoWzddICsgJzAwJykuc3Vic3RyKDEsIDMpKSA6IDA7XG4gICAgICAgIGxldCBkYXRlID0gRGF0ZS5VVEMoeWVhciwgbW9udGggLSAxLCBkYXksIGhvdXIgfHwgMCwgbWludXRlIHx8IDAsIHNlY29uZCB8fCAwLCBtaWxsaXNlYyk7XG4gICAgICAgIGNvbnN0IHR6ID0gbWF0Y2hbOF07XG4gICAgICAgIGlmICh0eiAmJiB0eiAhPT0gJ1onKSB7XG4gICAgICAgICAgICBsZXQgZCA9IHBhcnNlU2V4YWdlc2ltYWwodHosIGZhbHNlKTtcbiAgICAgICAgICAgIGlmIChNYXRoLmFicyhkKSA8IDMwKVxuICAgICAgICAgICAgICAgIGQgKj0gNjA7XG4gICAgICAgICAgICBkYXRlIC09IDYwMDAwICogZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IERhdGUoZGF0ZSk7XG4gICAgfSxcbiAgICBzdHJpbmdpZnk6ICh7IHZhbHVlIH0pID0+IHZhbHVlPy50b0lTT1N0cmluZygpLnJlcGxhY2UoLyhUMDA6MDA6MDApP1xcLjAwMFokLywgJycpID8/ICcnXG59O1xuXG5leHBvcnRzLmZsb2F0VGltZSA9IGZsb2F0VGltZTtcbmV4cG9ydHMuaW50VGltZSA9IGludFRpbWU7XG5leHBvcnRzLnRpbWVzdGFtcCA9IHRpbWVzdGFtcDtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbWFwID0gcmVxdWlyZSgnLi4vY29tbW9uL21hcC5qcycpO1xudmFyIF9udWxsID0gcmVxdWlyZSgnLi4vY29tbW9uL251bGwuanMnKTtcbnZhciBzZXEgPSByZXF1aXJlKCcuLi9jb21tb24vc2VxLmpzJyk7XG52YXIgc3RyaW5nID0gcmVxdWlyZSgnLi4vY29tbW9uL3N0cmluZy5qcycpO1xudmFyIGJpbmFyeSA9IHJlcXVpcmUoJy4vYmluYXJ5LmpzJyk7XG52YXIgYm9vbCA9IHJlcXVpcmUoJy4vYm9vbC5qcycpO1xudmFyIGZsb2F0ID0gcmVxdWlyZSgnLi9mbG9hdC5qcycpO1xudmFyIGludCA9IHJlcXVpcmUoJy4vaW50LmpzJyk7XG52YXIgbWVyZ2UgPSByZXF1aXJlKCcuL21lcmdlLmpzJyk7XG52YXIgb21hcCA9IHJlcXVpcmUoJy4vb21hcC5qcycpO1xudmFyIHBhaXJzID0gcmVxdWlyZSgnLi9wYWlycy5qcycpO1xudmFyIHNldCA9IHJlcXVpcmUoJy4vc2V0LmpzJyk7XG52YXIgdGltZXN0YW1wID0gcmVxdWlyZSgnLi90aW1lc3RhbXAuanMnKTtcblxuY29uc3Qgc2NoZW1hID0gW1xuICAgIG1hcC5tYXAsXG4gICAgc2VxLnNlcSxcbiAgICBzdHJpbmcuc3RyaW5nLFxuICAgIF9udWxsLm51bGxUYWcsXG4gICAgYm9vbC50cnVlVGFnLFxuICAgIGJvb2wuZmFsc2VUYWcsXG4gICAgaW50LmludEJpbixcbiAgICBpbnQuaW50T2N0LFxuICAgIGludC5pbnQsXG4gICAgaW50LmludEhleCxcbiAgICBmbG9hdC5mbG9hdE5hTixcbiAgICBmbG9hdC5mbG9hdEV4cCxcbiAgICBmbG9hdC5mbG9hdCxcbiAgICBiaW5hcnkuYmluYXJ5LFxuICAgIG1lcmdlLm1lcmdlLFxuICAgIG9tYXAub21hcCxcbiAgICBwYWlycy5wYWlycyxcbiAgICBzZXQuc2V0LFxuICAgIHRpbWVzdGFtcC5pbnRUaW1lLFxuICAgIHRpbWVzdGFtcC5mbG9hdFRpbWUsXG4gICAgdGltZXN0YW1wLnRpbWVzdGFtcFxuXTtcblxuZXhwb3J0cy5zY2hlbWEgPSBzY2hlbWE7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIG1hcCA9IHJlcXVpcmUoJy4vY29tbW9uL21hcC5qcycpO1xudmFyIF9udWxsID0gcmVxdWlyZSgnLi9jb21tb24vbnVsbC5qcycpO1xudmFyIHNlcSA9IHJlcXVpcmUoJy4vY29tbW9uL3NlcS5qcycpO1xudmFyIHN0cmluZyA9IHJlcXVpcmUoJy4vY29tbW9uL3N0cmluZy5qcycpO1xudmFyIGJvb2wgPSByZXF1aXJlKCcuL2NvcmUvYm9vbC5qcycpO1xudmFyIGZsb2F0ID0gcmVxdWlyZSgnLi9jb3JlL2Zsb2F0LmpzJyk7XG52YXIgaW50ID0gcmVxdWlyZSgnLi9jb3JlL2ludC5qcycpO1xudmFyIHNjaGVtYSA9IHJlcXVpcmUoJy4vY29yZS9zY2hlbWEuanMnKTtcbnZhciBzY2hlbWEkMSA9IHJlcXVpcmUoJy4vanNvbi9zY2hlbWEuanMnKTtcbnZhciBiaW5hcnkgPSByZXF1aXJlKCcuL3lhbWwtMS4xL2JpbmFyeS5qcycpO1xudmFyIG1lcmdlID0gcmVxdWlyZSgnLi95YW1sLTEuMS9tZXJnZS5qcycpO1xudmFyIG9tYXAgPSByZXF1aXJlKCcuL3lhbWwtMS4xL29tYXAuanMnKTtcbnZhciBwYWlycyA9IHJlcXVpcmUoJy4veWFtbC0xLjEvcGFpcnMuanMnKTtcbnZhciBzY2hlbWEkMiA9IHJlcXVpcmUoJy4veWFtbC0xLjEvc2NoZW1hLmpzJyk7XG52YXIgc2V0ID0gcmVxdWlyZSgnLi95YW1sLTEuMS9zZXQuanMnKTtcbnZhciB0aW1lc3RhbXAgPSByZXF1aXJlKCcuL3lhbWwtMS4xL3RpbWVzdGFtcC5qcycpO1xuXG5jb25zdCBzY2hlbWFzID0gbmV3IE1hcChbXG4gICAgWydjb3JlJywgc2NoZW1hLnNjaGVtYV0sXG4gICAgWydmYWlsc2FmZScsIFttYXAubWFwLCBzZXEuc2VxLCBzdHJpbmcuc3RyaW5nXV0sXG4gICAgWydqc29uJywgc2NoZW1hJDEuc2NoZW1hXSxcbiAgICBbJ3lhbWwxMScsIHNjaGVtYSQyLnNjaGVtYV0sXG4gICAgWyd5YW1sLTEuMScsIHNjaGVtYSQyLnNjaGVtYV1cbl0pO1xuY29uc3QgdGFnc0J5TmFtZSA9IHtcbiAgICBiaW5hcnk6IGJpbmFyeS5iaW5hcnksXG4gICAgYm9vbDogYm9vbC5ib29sVGFnLFxuICAgIGZsb2F0OiBmbG9hdC5mbG9hdCxcbiAgICBmbG9hdEV4cDogZmxvYXQuZmxvYXRFeHAsXG4gICAgZmxvYXROYU46IGZsb2F0LmZsb2F0TmFOLFxuICAgIGZsb2F0VGltZTogdGltZXN0YW1wLmZsb2F0VGltZSxcbiAgICBpbnQ6IGludC5pbnQsXG4gICAgaW50SGV4OiBpbnQuaW50SGV4LFxuICAgIGludE9jdDogaW50LmludE9jdCxcbiAgICBpbnRUaW1lOiB0aW1lc3RhbXAuaW50VGltZSxcbiAgICBtYXA6IG1hcC5tYXAsXG4gICAgbWVyZ2U6IG1lcmdlLm1lcmdlLFxuICAgIG51bGw6IF9udWxsLm51bGxUYWcsXG4gICAgb21hcDogb21hcC5vbWFwLFxuICAgIHBhaXJzOiBwYWlycy5wYWlycyxcbiAgICBzZXE6IHNlcS5zZXEsXG4gICAgc2V0OiBzZXQuc2V0LFxuICAgIHRpbWVzdGFtcDogdGltZXN0YW1wLnRpbWVzdGFtcFxufTtcbmNvbnN0IGNvcmVLbm93blRhZ3MgPSB7XG4gICAgJ3RhZzp5YW1sLm9yZywyMDAyOmJpbmFyeSc6IGJpbmFyeS5iaW5hcnksXG4gICAgJ3RhZzp5YW1sLm9yZywyMDAyOm1lcmdlJzogbWVyZ2UubWVyZ2UsXG4gICAgJ3RhZzp5YW1sLm9yZywyMDAyOm9tYXAnOiBvbWFwLm9tYXAsXG4gICAgJ3RhZzp5YW1sLm9yZywyMDAyOnBhaXJzJzogcGFpcnMucGFpcnMsXG4gICAgJ3RhZzp5YW1sLm9yZywyMDAyOnNldCc6IHNldC5zZXQsXG4gICAgJ3RhZzp5YW1sLm9yZywyMDAyOnRpbWVzdGFtcCc6IHRpbWVzdGFtcC50aW1lc3RhbXBcbn07XG5mdW5jdGlvbiBnZXRUYWdzKGN1c3RvbVRhZ3MsIHNjaGVtYU5hbWUsIGFkZE1lcmdlVGFnKSB7XG4gICAgY29uc3Qgc2NoZW1hVGFncyA9IHNjaGVtYXMuZ2V0KHNjaGVtYU5hbWUpO1xuICAgIGlmIChzY2hlbWFUYWdzICYmICFjdXN0b21UYWdzKSB7XG4gICAgICAgIHJldHVybiBhZGRNZXJnZVRhZyAmJiAhc2NoZW1hVGFncy5pbmNsdWRlcyhtZXJnZS5tZXJnZSlcbiAgICAgICAgICAgID8gc2NoZW1hVGFncy5jb25jYXQobWVyZ2UubWVyZ2UpXG4gICAgICAgICAgICA6IHNjaGVtYVRhZ3Muc2xpY2UoKTtcbiAgICB9XG4gICAgbGV0IHRhZ3MgPSBzY2hlbWFUYWdzO1xuICAgIGlmICghdGFncykge1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShjdXN0b21UYWdzKSlcbiAgICAgICAgICAgIHRhZ3MgPSBbXTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBrZXlzID0gQXJyYXkuZnJvbShzY2hlbWFzLmtleXMoKSlcbiAgICAgICAgICAgICAgICAuZmlsdGVyKGtleSA9PiBrZXkgIT09ICd5YW1sMTEnKVxuICAgICAgICAgICAgICAgIC5tYXAoa2V5ID0+IEpTT04uc3RyaW5naWZ5KGtleSkpXG4gICAgICAgICAgICAgICAgLmpvaW4oJywgJyk7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gc2NoZW1hIFwiJHtzY2hlbWFOYW1lfVwiOyB1c2Ugb25lIG9mICR7a2V5c30gb3IgZGVmaW5lIGN1c3RvbVRhZ3MgYXJyYXlgKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoQXJyYXkuaXNBcnJheShjdXN0b21UYWdzKSkge1xuICAgICAgICBmb3IgKGNvbnN0IHRhZyBvZiBjdXN0b21UYWdzKVxuICAgICAgICAgICAgdGFncyA9IHRhZ3MuY29uY2F0KHRhZyk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBjdXN0b21UYWdzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRhZ3MgPSBjdXN0b21UYWdzKHRhZ3Muc2xpY2UoKSk7XG4gICAgfVxuICAgIGlmIChhZGRNZXJnZVRhZylcbiAgICAgICAgdGFncyA9IHRhZ3MuY29uY2F0KG1lcmdlLm1lcmdlKTtcbiAgICByZXR1cm4gdGFncy5yZWR1Y2UoKHRhZ3MsIHRhZykgPT4ge1xuICAgICAgICBjb25zdCB0YWdPYmogPSB0eXBlb2YgdGFnID09PSAnc3RyaW5nJyA/IHRhZ3NCeU5hbWVbdGFnXSA6IHRhZztcbiAgICAgICAgaWYgKCF0YWdPYmopIHtcbiAgICAgICAgICAgIGNvbnN0IHRhZ05hbWUgPSBKU09OLnN0cmluZ2lmeSh0YWcpO1xuICAgICAgICAgICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKHRhZ3NCeU5hbWUpXG4gICAgICAgICAgICAgICAgLm1hcChrZXkgPT4gSlNPTi5zdHJpbmdpZnkoa2V5KSlcbiAgICAgICAgICAgICAgICAuam9pbignLCAnKTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBjdXN0b20gdGFnICR7dGFnTmFtZX07IHVzZSBvbmUgb2YgJHtrZXlzfWApO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGFncy5pbmNsdWRlcyh0YWdPYmopKVxuICAgICAgICAgICAgdGFncy5wdXNoKHRhZ09iaik7XG4gICAgICAgIHJldHVybiB0YWdzO1xuICAgIH0sIFtdKTtcbn1cblxuZXhwb3J0cy5jb3JlS25vd25UYWdzID0gY29yZUtub3duVGFncztcbmV4cG9ydHMuZ2V0VGFncyA9IGdldFRhZ3M7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIGlkZW50aXR5ID0gcmVxdWlyZSgnLi4vbm9kZXMvaWRlbnRpdHkuanMnKTtcbnZhciBtYXAgPSByZXF1aXJlKCcuL2NvbW1vbi9tYXAuanMnKTtcbnZhciBzZXEgPSByZXF1aXJlKCcuL2NvbW1vbi9zZXEuanMnKTtcbnZhciBzdHJpbmcgPSByZXF1aXJlKCcuL2NvbW1vbi9zdHJpbmcuanMnKTtcbnZhciB0YWdzID0gcmVxdWlyZSgnLi90YWdzLmpzJyk7XG5cbmNvbnN0IHNvcnRNYXBFbnRyaWVzQnlLZXkgPSAoYSwgYikgPT4gYS5rZXkgPCBiLmtleSA/IC0xIDogYS5rZXkgPiBiLmtleSA/IDEgOiAwO1xuY2xhc3MgU2NoZW1hIHtcbiAgICBjb25zdHJ1Y3Rvcih7IGNvbXBhdCwgY3VzdG9tVGFncywgbWVyZ2UsIHJlc29sdmVLbm93blRhZ3MsIHNjaGVtYSwgc29ydE1hcEVudHJpZXMsIHRvU3RyaW5nRGVmYXVsdHMgfSkge1xuICAgICAgICB0aGlzLmNvbXBhdCA9IEFycmF5LmlzQXJyYXkoY29tcGF0KVxuICAgICAgICAgICAgPyB0YWdzLmdldFRhZ3MoY29tcGF0LCAnY29tcGF0JylcbiAgICAgICAgICAgIDogY29tcGF0XG4gICAgICAgICAgICAgICAgPyB0YWdzLmdldFRhZ3MobnVsbCwgY29tcGF0KVxuICAgICAgICAgICAgICAgIDogbnVsbDtcbiAgICAgICAgdGhpcy5uYW1lID0gKHR5cGVvZiBzY2hlbWEgPT09ICdzdHJpbmcnICYmIHNjaGVtYSkgfHwgJ2NvcmUnO1xuICAgICAgICB0aGlzLmtub3duVGFncyA9IHJlc29sdmVLbm93blRhZ3MgPyB0YWdzLmNvcmVLbm93blRhZ3MgOiB7fTtcbiAgICAgICAgdGhpcy50YWdzID0gdGFncy5nZXRUYWdzKGN1c3RvbVRhZ3MsIHRoaXMubmFtZSwgbWVyZ2UpO1xuICAgICAgICB0aGlzLnRvU3RyaW5nT3B0aW9ucyA9IHRvU3RyaW5nRGVmYXVsdHMgPz8gbnVsbDtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIGlkZW50aXR5Lk1BUCwgeyB2YWx1ZTogbWFwLm1hcCB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIGlkZW50aXR5LlNDQUxBUiwgeyB2YWx1ZTogc3RyaW5nLnN0cmluZyB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIGlkZW50aXR5LlNFUSwgeyB2YWx1ZTogc2VxLnNlcSB9KTtcbiAgICAgICAgLy8gVXNlZCBieSBjcmVhdGVNYXAoKVxuICAgICAgICB0aGlzLnNvcnRNYXBFbnRyaWVzID1cbiAgICAgICAgICAgIHR5cGVvZiBzb3J0TWFwRW50cmllcyA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgICAgID8gc29ydE1hcEVudHJpZXNcbiAgICAgICAgICAgICAgICA6IHNvcnRNYXBFbnRyaWVzID09PSB0cnVlXG4gICAgICAgICAgICAgICAgICAgID8gc29ydE1hcEVudHJpZXNCeUtleVxuICAgICAgICAgICAgICAgICAgICA6IG51bGw7XG4gICAgfVxuICAgIGNsb25lKCkge1xuICAgICAgICBjb25zdCBjb3B5ID0gT2JqZWN0LmNyZWF0ZShTY2hlbWEucHJvdG90eXBlLCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyh0aGlzKSk7XG4gICAgICAgIGNvcHkudGFncyA9IHRoaXMudGFncy5zbGljZSgpO1xuICAgICAgICByZXR1cm4gY29weTtcbiAgICB9XG59XG5cbmV4cG9ydHMuU2NoZW1hID0gU2NoZW1hO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBpZGVudGl0eSA9IHJlcXVpcmUoJy4uL25vZGVzL2lkZW50aXR5LmpzJyk7XG52YXIgc3RyaW5naWZ5ID0gcmVxdWlyZSgnLi9zdHJpbmdpZnkuanMnKTtcbnZhciBzdHJpbmdpZnlDb21tZW50ID0gcmVxdWlyZSgnLi9zdHJpbmdpZnlDb21tZW50LmpzJyk7XG5cbmZ1bmN0aW9uIHN0cmluZ2lmeURvY3VtZW50KGRvYywgb3B0aW9ucykge1xuICAgIGNvbnN0IGxpbmVzID0gW107XG4gICAgbGV0IGhhc0RpcmVjdGl2ZXMgPSBvcHRpb25zLmRpcmVjdGl2ZXMgPT09IHRydWU7XG4gICAgaWYgKG9wdGlvbnMuZGlyZWN0aXZlcyAhPT0gZmFsc2UgJiYgZG9jLmRpcmVjdGl2ZXMpIHtcbiAgICAgICAgY29uc3QgZGlyID0gZG9jLmRpcmVjdGl2ZXMudG9TdHJpbmcoZG9jKTtcbiAgICAgICAgaWYgKGRpcikge1xuICAgICAgICAgICAgbGluZXMucHVzaChkaXIpO1xuICAgICAgICAgICAgaGFzRGlyZWN0aXZlcyA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZG9jLmRpcmVjdGl2ZXMuZG9jU3RhcnQpXG4gICAgICAgICAgICBoYXNEaXJlY3RpdmVzID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGhhc0RpcmVjdGl2ZXMpXG4gICAgICAgIGxpbmVzLnB1c2goJy0tLScpO1xuICAgIGNvbnN0IGN0eCA9IHN0cmluZ2lmeS5jcmVhdGVTdHJpbmdpZnlDb250ZXh0KGRvYywgb3B0aW9ucyk7XG4gICAgY29uc3QgeyBjb21tZW50U3RyaW5nIH0gPSBjdHgub3B0aW9ucztcbiAgICBpZiAoZG9jLmNvbW1lbnRCZWZvcmUpIHtcbiAgICAgICAgaWYgKGxpbmVzLmxlbmd0aCAhPT0gMSlcbiAgICAgICAgICAgIGxpbmVzLnVuc2hpZnQoJycpO1xuICAgICAgICBjb25zdCBjcyA9IGNvbW1lbnRTdHJpbmcoZG9jLmNvbW1lbnRCZWZvcmUpO1xuICAgICAgICBsaW5lcy51bnNoaWZ0KHN0cmluZ2lmeUNvbW1lbnQuaW5kZW50Q29tbWVudChjcywgJycpKTtcbiAgICB9XG4gICAgbGV0IGNob21wS2VlcCA9IGZhbHNlO1xuICAgIGxldCBjb250ZW50Q29tbWVudCA9IG51bGw7XG4gICAgaWYgKGRvYy5jb250ZW50cykge1xuICAgICAgICBpZiAoaWRlbnRpdHkuaXNOb2RlKGRvYy5jb250ZW50cykpIHtcbiAgICAgICAgICAgIGlmIChkb2MuY29udGVudHMuc3BhY2VCZWZvcmUgJiYgaGFzRGlyZWN0aXZlcylcbiAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKCcnKTtcbiAgICAgICAgICAgIGlmIChkb2MuY29udGVudHMuY29tbWVudEJlZm9yZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNzID0gY29tbWVudFN0cmluZyhkb2MuY29udGVudHMuY29tbWVudEJlZm9yZSk7XG4gICAgICAgICAgICAgICAgbGluZXMucHVzaChzdHJpbmdpZnlDb21tZW50LmluZGVudENvbW1lbnQoY3MsICcnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyB0b3AtbGV2ZWwgYmxvY2sgc2NhbGFycyBuZWVkIHRvIGJlIGluZGVudGVkIGlmIGZvbGxvd2VkIGJ5IGEgY29tbWVudFxuICAgICAgICAgICAgY3R4LmZvcmNlQmxvY2tJbmRlbnQgPSAhIWRvYy5jb21tZW50O1xuICAgICAgICAgICAgY29udGVudENvbW1lbnQgPSBkb2MuY29udGVudHMuY29tbWVudDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBvbkNob21wS2VlcCA9IGNvbnRlbnRDb21tZW50ID8gdW5kZWZpbmVkIDogKCkgPT4gKGNob21wS2VlcCA9IHRydWUpO1xuICAgICAgICBsZXQgYm9keSA9IHN0cmluZ2lmeS5zdHJpbmdpZnkoZG9jLmNvbnRlbnRzLCBjdHgsICgpID0+IChjb250ZW50Q29tbWVudCA9IG51bGwpLCBvbkNob21wS2VlcCk7XG4gICAgICAgIGlmIChjb250ZW50Q29tbWVudClcbiAgICAgICAgICAgIGJvZHkgKz0gc3RyaW5naWZ5Q29tbWVudC5saW5lQ29tbWVudChib2R5LCAnJywgY29tbWVudFN0cmluZyhjb250ZW50Q29tbWVudCkpO1xuICAgICAgICBpZiAoKGJvZHlbMF0gPT09ICd8JyB8fCBib2R5WzBdID09PSAnPicpICYmXG4gICAgICAgICAgICBsaW5lc1tsaW5lcy5sZW5ndGggLSAxXSA9PT0gJy0tLScpIHtcbiAgICAgICAgICAgIC8vIFRvcC1sZXZlbCBibG9jayBzY2FsYXJzIHdpdGggYSBwcmVjZWRpbmcgZG9jIG1hcmtlciBvdWdodCB0byB1c2UgdGhlXG4gICAgICAgICAgICAvLyBzYW1lIGxpbmUgZm9yIHRoZWlyIGhlYWRlci5cbiAgICAgICAgICAgIGxpbmVzW2xpbmVzLmxlbmd0aCAtIDFdID0gYC0tLSAke2JvZHl9YDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBsaW5lcy5wdXNoKGJvZHkpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgbGluZXMucHVzaChzdHJpbmdpZnkuc3RyaW5naWZ5KGRvYy5jb250ZW50cywgY3R4KSk7XG4gICAgfVxuICAgIGlmIChkb2MuZGlyZWN0aXZlcz8uZG9jRW5kKSB7XG4gICAgICAgIGlmIChkb2MuY29tbWVudCkge1xuICAgICAgICAgICAgY29uc3QgY3MgPSBjb21tZW50U3RyaW5nKGRvYy5jb21tZW50KTtcbiAgICAgICAgICAgIGlmIChjcy5pbmNsdWRlcygnXFxuJykpIHtcbiAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKCcuLi4nKTtcbiAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKHN0cmluZ2lmeUNvbW1lbnQuaW5kZW50Q29tbWVudChjcywgJycpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goYC4uLiAke2NzfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbGluZXMucHVzaCgnLi4uJyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGxldCBkYyA9IGRvYy5jb21tZW50O1xuICAgICAgICBpZiAoZGMgJiYgY2hvbXBLZWVwKVxuICAgICAgICAgICAgZGMgPSBkYy5yZXBsYWNlKC9eXFxuKy8sICcnKTtcbiAgICAgICAgaWYgKGRjKSB7XG4gICAgICAgICAgICBpZiAoKCFjaG9tcEtlZXAgfHwgY29udGVudENvbW1lbnQpICYmIGxpbmVzW2xpbmVzLmxlbmd0aCAtIDFdICE9PSAnJylcbiAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKCcnKTtcbiAgICAgICAgICAgIGxpbmVzLnB1c2goc3RyaW5naWZ5Q29tbWVudC5pbmRlbnRDb21tZW50KGNvbW1lbnRTdHJpbmcoZGMpLCAnJykpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBsaW5lcy5qb2luKCdcXG4nKSArICdcXG4nO1xufVxuXG5leHBvcnRzLnN0cmluZ2lmeURvY3VtZW50ID0gc3RyaW5naWZ5RG9jdW1lbnQ7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIEFsaWFzID0gcmVxdWlyZSgnLi4vbm9kZXMvQWxpYXMuanMnKTtcbnZhciBDb2xsZWN0aW9uID0gcmVxdWlyZSgnLi4vbm9kZXMvQ29sbGVjdGlvbi5qcycpO1xudmFyIGlkZW50aXR5ID0gcmVxdWlyZSgnLi4vbm9kZXMvaWRlbnRpdHkuanMnKTtcbnZhciBQYWlyID0gcmVxdWlyZSgnLi4vbm9kZXMvUGFpci5qcycpO1xudmFyIHRvSlMgPSByZXF1aXJlKCcuLi9ub2Rlcy90b0pTLmpzJyk7XG52YXIgU2NoZW1hID0gcmVxdWlyZSgnLi4vc2NoZW1hL1NjaGVtYS5qcycpO1xudmFyIHN0cmluZ2lmeURvY3VtZW50ID0gcmVxdWlyZSgnLi4vc3RyaW5naWZ5L3N0cmluZ2lmeURvY3VtZW50LmpzJyk7XG52YXIgYW5jaG9ycyA9IHJlcXVpcmUoJy4vYW5jaG9ycy5qcycpO1xudmFyIGFwcGx5UmV2aXZlciA9IHJlcXVpcmUoJy4vYXBwbHlSZXZpdmVyLmpzJyk7XG52YXIgY3JlYXRlTm9kZSA9IHJlcXVpcmUoJy4vY3JlYXRlTm9kZS5qcycpO1xudmFyIGRpcmVjdGl2ZXMgPSByZXF1aXJlKCcuL2RpcmVjdGl2ZXMuanMnKTtcblxuY2xhc3MgRG9jdW1lbnQge1xuICAgIGNvbnN0cnVjdG9yKHZhbHVlLCByZXBsYWNlciwgb3B0aW9ucykge1xuICAgICAgICAvKiogQSBjb21tZW50IGJlZm9yZSB0aGlzIERvY3VtZW50ICovXG4gICAgICAgIHRoaXMuY29tbWVudEJlZm9yZSA9IG51bGw7XG4gICAgICAgIC8qKiBBIGNvbW1lbnQgaW1tZWRpYXRlbHkgYWZ0ZXIgdGhpcyBEb2N1bWVudCAqL1xuICAgICAgICB0aGlzLmNvbW1lbnQgPSBudWxsO1xuICAgICAgICAvKiogRXJyb3JzIGVuY291bnRlcmVkIGR1cmluZyBwYXJzaW5nLiAqL1xuICAgICAgICB0aGlzLmVycm9ycyA9IFtdO1xuICAgICAgICAvKiogV2FybmluZ3MgZW5jb3VudGVyZWQgZHVyaW5nIHBhcnNpbmcuICovXG4gICAgICAgIHRoaXMud2FybmluZ3MgPSBbXTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIGlkZW50aXR5Lk5PREVfVFlQRSwgeyB2YWx1ZTogaWRlbnRpdHkuRE9DIH0pO1xuICAgICAgICBsZXQgX3JlcGxhY2VyID0gbnVsbDtcbiAgICAgICAgaWYgKHR5cGVvZiByZXBsYWNlciA9PT0gJ2Z1bmN0aW9uJyB8fCBBcnJheS5pc0FycmF5KHJlcGxhY2VyKSkge1xuICAgICAgICAgICAgX3JlcGxhY2VyID0gcmVwbGFjZXI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAob3B0aW9ucyA9PT0gdW5kZWZpbmVkICYmIHJlcGxhY2VyKSB7XG4gICAgICAgICAgICBvcHRpb25zID0gcmVwbGFjZXI7XG4gICAgICAgICAgICByZXBsYWNlciA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBvcHQgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgIGludEFzQmlnSW50OiBmYWxzZSxcbiAgICAgICAgICAgIGtlZXBTb3VyY2VUb2tlbnM6IGZhbHNlLFxuICAgICAgICAgICAgbG9nTGV2ZWw6ICd3YXJuJyxcbiAgICAgICAgICAgIHByZXR0eUVycm9yczogdHJ1ZSxcbiAgICAgICAgICAgIHN0cmljdDogdHJ1ZSxcbiAgICAgICAgICAgIHN0cmluZ0tleXM6IGZhbHNlLFxuICAgICAgICAgICAgdW5pcXVlS2V5czogdHJ1ZSxcbiAgICAgICAgICAgIHZlcnNpb246ICcxLjInXG4gICAgICAgIH0sIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHQ7XG4gICAgICAgIGxldCB7IHZlcnNpb24gfSA9IG9wdDtcbiAgICAgICAgaWYgKG9wdGlvbnM/Ll9kaXJlY3RpdmVzKSB7XG4gICAgICAgICAgICB0aGlzLmRpcmVjdGl2ZXMgPSBvcHRpb25zLl9kaXJlY3RpdmVzLmF0RG9jdW1lbnQoKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmRpcmVjdGl2ZXMueWFtbC5leHBsaWNpdClcbiAgICAgICAgICAgICAgICB2ZXJzaW9uID0gdGhpcy5kaXJlY3RpdmVzLnlhbWwudmVyc2lvbjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aGlzLmRpcmVjdGl2ZXMgPSBuZXcgZGlyZWN0aXZlcy5EaXJlY3RpdmVzKHsgdmVyc2lvbiB9KTtcbiAgICAgICAgdGhpcy5zZXRTY2hlbWEodmVyc2lvbiwgb3B0aW9ucyk7XG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgV2UgY2FuJ3QgcmVhbGx5IGtub3cgdGhhdCB0aGlzIG1hdGNoZXMgQ29udGVudHMuXG4gICAgICAgIHRoaXMuY29udGVudHMgPVxuICAgICAgICAgICAgdmFsdWUgPT09IHVuZGVmaW5lZCA/IG51bGwgOiB0aGlzLmNyZWF0ZU5vZGUodmFsdWUsIF9yZXBsYWNlciwgb3B0aW9ucyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIGRlZXAgY29weSBvZiB0aGlzIERvY3VtZW50IGFuZCBpdHMgY29udGVudHMuXG4gICAgICpcbiAgICAgKiBDdXN0b20gTm9kZSB2YWx1ZXMgdGhhdCBpbmhlcml0IGZyb20gYE9iamVjdGAgc3RpbGwgcmVmZXIgdG8gdGhlaXIgb3JpZ2luYWwgaW5zdGFuY2VzLlxuICAgICAqL1xuICAgIGNsb25lKCkge1xuICAgICAgICBjb25zdCBjb3B5ID0gT2JqZWN0LmNyZWF0ZShEb2N1bWVudC5wcm90b3R5cGUsIHtcbiAgICAgICAgICAgIFtpZGVudGl0eS5OT0RFX1RZUEVdOiB7IHZhbHVlOiBpZGVudGl0eS5ET0MgfVxuICAgICAgICB9KTtcbiAgICAgICAgY29weS5jb21tZW50QmVmb3JlID0gdGhpcy5jb21tZW50QmVmb3JlO1xuICAgICAgICBjb3B5LmNvbW1lbnQgPSB0aGlzLmNvbW1lbnQ7XG4gICAgICAgIGNvcHkuZXJyb3JzID0gdGhpcy5lcnJvcnMuc2xpY2UoKTtcbiAgICAgICAgY29weS53YXJuaW5ncyA9IHRoaXMud2FybmluZ3Muc2xpY2UoKTtcbiAgICAgICAgY29weS5vcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5vcHRpb25zKTtcbiAgICAgICAgaWYgKHRoaXMuZGlyZWN0aXZlcylcbiAgICAgICAgICAgIGNvcHkuZGlyZWN0aXZlcyA9IHRoaXMuZGlyZWN0aXZlcy5jbG9uZSgpO1xuICAgICAgICBjb3B5LnNjaGVtYSA9IHRoaXMuc2NoZW1hLmNsb25lKCk7XG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgV2UgY2FuJ3QgcmVhbGx5IGtub3cgdGhhdCB0aGlzIG1hdGNoZXMgQ29udGVudHMuXG4gICAgICAgIGNvcHkuY29udGVudHMgPSBpZGVudGl0eS5pc05vZGUodGhpcy5jb250ZW50cylcbiAgICAgICAgICAgID8gdGhpcy5jb250ZW50cy5jbG9uZShjb3B5LnNjaGVtYSlcbiAgICAgICAgICAgIDogdGhpcy5jb250ZW50cztcbiAgICAgICAgaWYgKHRoaXMucmFuZ2UpXG4gICAgICAgICAgICBjb3B5LnJhbmdlID0gdGhpcy5yYW5nZS5zbGljZSgpO1xuICAgICAgICByZXR1cm4gY29weTtcbiAgICB9XG4gICAgLyoqIEFkZHMgYSB2YWx1ZSB0byB0aGUgZG9jdW1lbnQuICovXG4gICAgYWRkKHZhbHVlKSB7XG4gICAgICAgIGlmIChhc3NlcnRDb2xsZWN0aW9uKHRoaXMuY29udGVudHMpKVxuICAgICAgICAgICAgdGhpcy5jb250ZW50cy5hZGQodmFsdWUpO1xuICAgIH1cbiAgICAvKiogQWRkcyBhIHZhbHVlIHRvIHRoZSBkb2N1bWVudC4gKi9cbiAgICBhZGRJbihwYXRoLCB2YWx1ZSkge1xuICAgICAgICBpZiAoYXNzZXJ0Q29sbGVjdGlvbih0aGlzLmNvbnRlbnRzKSlcbiAgICAgICAgICAgIHRoaXMuY29udGVudHMuYWRkSW4ocGF0aCwgdmFsdWUpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgYEFsaWFzYCBub2RlLCBlbnN1cmluZyB0aGF0IHRoZSB0YXJnZXQgYG5vZGVgIGhhcyB0aGUgcmVxdWlyZWQgYW5jaG9yLlxuICAgICAqXG4gICAgICogSWYgYG5vZGVgIGFscmVhZHkgaGFzIGFuIGFuY2hvciwgYG5hbWVgIGlzIGlnbm9yZWQuXG4gICAgICogT3RoZXJ3aXNlLCB0aGUgYG5vZGUuYW5jaG9yYCB2YWx1ZSB3aWxsIGJlIHNldCB0byBgbmFtZWAsXG4gICAgICogb3IgaWYgYW4gYW5jaG9yIHdpdGggdGhhdCBuYW1lIGlzIGFscmVhZHkgcHJlc2VudCBpbiB0aGUgZG9jdW1lbnQsXG4gICAgICogYG5hbWVgIHdpbGwgYmUgdXNlZCBhcyBhIHByZWZpeCBmb3IgYSBuZXcgdW5pcXVlIGFuY2hvci5cbiAgICAgKiBJZiBgbmFtZWAgaXMgdW5kZWZpbmVkLCB0aGUgZ2VuZXJhdGVkIGFuY2hvciB3aWxsIHVzZSAnYScgYXMgYSBwcmVmaXguXG4gICAgICovXG4gICAgY3JlYXRlQWxpYXMobm9kZSwgbmFtZSkge1xuICAgICAgICBpZiAoIW5vZGUuYW5jaG9yKSB7XG4gICAgICAgICAgICBjb25zdCBwcmV2ID0gYW5jaG9ycy5hbmNob3JOYW1lcyh0aGlzKTtcbiAgICAgICAgICAgIG5vZGUuYW5jaG9yID1cbiAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L3ByZWZlci1udWxsaXNoLWNvYWxlc2NpbmdcbiAgICAgICAgICAgICAgICAhbmFtZSB8fCBwcmV2LmhhcyhuYW1lKSA/IGFuY2hvcnMuZmluZE5ld0FuY2hvcihuYW1lIHx8ICdhJywgcHJldikgOiBuYW1lO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgQWxpYXMuQWxpYXMobm9kZS5hbmNob3IpO1xuICAgIH1cbiAgICBjcmVhdGVOb2RlKHZhbHVlLCByZXBsYWNlciwgb3B0aW9ucykge1xuICAgICAgICBsZXQgX3JlcGxhY2VyID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAodHlwZW9mIHJlcGxhY2VyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHJlcGxhY2VyLmNhbGwoeyAnJzogdmFsdWUgfSwgJycsIHZhbHVlKTtcbiAgICAgICAgICAgIF9yZXBsYWNlciA9IHJlcGxhY2VyO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKEFycmF5LmlzQXJyYXkocmVwbGFjZXIpKSB7XG4gICAgICAgICAgICBjb25zdCBrZXlUb1N0ciA9ICh2KSA9PiB0eXBlb2YgdiA9PT0gJ251bWJlcicgfHwgdiBpbnN0YW5jZW9mIFN0cmluZyB8fCB2IGluc3RhbmNlb2YgTnVtYmVyO1xuICAgICAgICAgICAgY29uc3QgYXNTdHIgPSByZXBsYWNlci5maWx0ZXIoa2V5VG9TdHIpLm1hcChTdHJpbmcpO1xuICAgICAgICAgICAgaWYgKGFzU3RyLmxlbmd0aCA+IDApXG4gICAgICAgICAgICAgICAgcmVwbGFjZXIgPSByZXBsYWNlci5jb25jYXQoYXNTdHIpO1xuICAgICAgICAgICAgX3JlcGxhY2VyID0gcmVwbGFjZXI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAob3B0aW9ucyA9PT0gdW5kZWZpbmVkICYmIHJlcGxhY2VyKSB7XG4gICAgICAgICAgICBvcHRpb25zID0gcmVwbGFjZXI7XG4gICAgICAgICAgICByZXBsYWNlciA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB7IGFsaWFzRHVwbGljYXRlT2JqZWN0cywgYW5jaG9yUHJlZml4LCBmbG93LCBrZWVwVW5kZWZpbmVkLCBvblRhZ09iaiwgdGFnIH0gPSBvcHRpb25zID8/IHt9O1xuICAgICAgICBjb25zdCB7IG9uQW5jaG9yLCBzZXRBbmNob3JzLCBzb3VyY2VPYmplY3RzIH0gPSBhbmNob3JzLmNyZWF0ZU5vZGVBbmNob3JzKHRoaXMsIFxuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L3ByZWZlci1udWxsaXNoLWNvYWxlc2NpbmdcbiAgICAgICAgYW5jaG9yUHJlZml4IHx8ICdhJyk7XG4gICAgICAgIGNvbnN0IGN0eCA9IHtcbiAgICAgICAgICAgIGFsaWFzRHVwbGljYXRlT2JqZWN0czogYWxpYXNEdXBsaWNhdGVPYmplY3RzID8/IHRydWUsXG4gICAgICAgICAgICBrZWVwVW5kZWZpbmVkOiBrZWVwVW5kZWZpbmVkID8/IGZhbHNlLFxuICAgICAgICAgICAgb25BbmNob3IsXG4gICAgICAgICAgICBvblRhZ09iaixcbiAgICAgICAgICAgIHJlcGxhY2VyOiBfcmVwbGFjZXIsXG4gICAgICAgICAgICBzY2hlbWE6IHRoaXMuc2NoZW1hLFxuICAgICAgICAgICAgc291cmNlT2JqZWN0c1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBub2RlID0gY3JlYXRlTm9kZS5jcmVhdGVOb2RlKHZhbHVlLCB0YWcsIGN0eCk7XG4gICAgICAgIGlmIChmbG93ICYmIGlkZW50aXR5LmlzQ29sbGVjdGlvbihub2RlKSlcbiAgICAgICAgICAgIG5vZGUuZmxvdyA9IHRydWU7XG4gICAgICAgIHNldEFuY2hvcnMoKTtcbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENvbnZlcnQgYSBrZXkgYW5kIGEgdmFsdWUgaW50byBhIGBQYWlyYCB1c2luZyB0aGUgY3VycmVudCBzY2hlbWEsXG4gICAgICogcmVjdXJzaXZlbHkgd3JhcHBpbmcgYWxsIHZhbHVlcyBhcyBgU2NhbGFyYCBvciBgQ29sbGVjdGlvbmAgbm9kZXMuXG4gICAgICovXG4gICAgY3JlYXRlUGFpcihrZXksIHZhbHVlLCBvcHRpb25zID0ge30pIHtcbiAgICAgICAgY29uc3QgayA9IHRoaXMuY3JlYXRlTm9kZShrZXksIG51bGwsIG9wdGlvbnMpO1xuICAgICAgICBjb25zdCB2ID0gdGhpcy5jcmVhdGVOb2RlKHZhbHVlLCBudWxsLCBvcHRpb25zKTtcbiAgICAgICAgcmV0dXJuIG5ldyBQYWlyLlBhaXIoaywgdik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYSB2YWx1ZSBmcm9tIHRoZSBkb2N1bWVudC5cbiAgICAgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGl0ZW0gd2FzIGZvdW5kIGFuZCByZW1vdmVkLlxuICAgICAqL1xuICAgIGRlbGV0ZShrZXkpIHtcbiAgICAgICAgcmV0dXJuIGFzc2VydENvbGxlY3Rpb24odGhpcy5jb250ZW50cykgPyB0aGlzLmNvbnRlbnRzLmRlbGV0ZShrZXkpIDogZmFsc2U7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYSB2YWx1ZSBmcm9tIHRoZSBkb2N1bWVudC5cbiAgICAgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGl0ZW0gd2FzIGZvdW5kIGFuZCByZW1vdmVkLlxuICAgICAqL1xuICAgIGRlbGV0ZUluKHBhdGgpIHtcbiAgICAgICAgaWYgKENvbGxlY3Rpb24uaXNFbXB0eVBhdGgocGF0aCkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbnRlbnRzID09IG51bGwpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBQcmVzdW1lZCBpbXBvc3NpYmxlIGlmIFN0cmljdCBleHRlbmRzIGZhbHNlXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRzID0gbnVsbDtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhc3NlcnRDb2xsZWN0aW9uKHRoaXMuY29udGVudHMpXG4gICAgICAgICAgICA/IHRoaXMuY29udGVudHMuZGVsZXRlSW4ocGF0aClcbiAgICAgICAgICAgIDogZmFsc2U7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJldHVybnMgaXRlbSBhdCBga2V5YCwgb3IgYHVuZGVmaW5lZGAgaWYgbm90IGZvdW5kLiBCeSBkZWZhdWx0IHVud3JhcHNcbiAgICAgKiBzY2FsYXIgdmFsdWVzIGZyb20gdGhlaXIgc3Vycm91bmRpbmcgbm9kZTsgdG8gZGlzYWJsZSBzZXQgYGtlZXBTY2FsYXJgIHRvXG4gICAgICogYHRydWVgIChjb2xsZWN0aW9ucyBhcmUgYWx3YXlzIHJldHVybmVkIGludGFjdCkuXG4gICAgICovXG4gICAgZ2V0KGtleSwga2VlcFNjYWxhcikge1xuICAgICAgICByZXR1cm4gaWRlbnRpdHkuaXNDb2xsZWN0aW9uKHRoaXMuY29udGVudHMpXG4gICAgICAgICAgICA/IHRoaXMuY29udGVudHMuZ2V0KGtleSwga2VlcFNjYWxhcilcbiAgICAgICAgICAgIDogdW5kZWZpbmVkO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGl0ZW0gYXQgYHBhdGhgLCBvciBgdW5kZWZpbmVkYCBpZiBub3QgZm91bmQuIEJ5IGRlZmF1bHQgdW53cmFwc1xuICAgICAqIHNjYWxhciB2YWx1ZXMgZnJvbSB0aGVpciBzdXJyb3VuZGluZyBub2RlOyB0byBkaXNhYmxlIHNldCBga2VlcFNjYWxhcmAgdG9cbiAgICAgKiBgdHJ1ZWAgKGNvbGxlY3Rpb25zIGFyZSBhbHdheXMgcmV0dXJuZWQgaW50YWN0KS5cbiAgICAgKi9cbiAgICBnZXRJbihwYXRoLCBrZWVwU2NhbGFyKSB7XG4gICAgICAgIGlmIChDb2xsZWN0aW9uLmlzRW1wdHlQYXRoKHBhdGgpKVxuICAgICAgICAgICAgcmV0dXJuICFrZWVwU2NhbGFyICYmIGlkZW50aXR5LmlzU2NhbGFyKHRoaXMuY29udGVudHMpXG4gICAgICAgICAgICAgICAgPyB0aGlzLmNvbnRlbnRzLnZhbHVlXG4gICAgICAgICAgICAgICAgOiB0aGlzLmNvbnRlbnRzO1xuICAgICAgICByZXR1cm4gaWRlbnRpdHkuaXNDb2xsZWN0aW9uKHRoaXMuY29udGVudHMpXG4gICAgICAgICAgICA/IHRoaXMuY29udGVudHMuZ2V0SW4ocGF0aCwga2VlcFNjYWxhcilcbiAgICAgICAgICAgIDogdW5kZWZpbmVkO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgdGhlIGRvY3VtZW50IGluY2x1ZGVzIGEgdmFsdWUgd2l0aCB0aGUga2V5IGBrZXlgLlxuICAgICAqL1xuICAgIGhhcyhrZXkpIHtcbiAgICAgICAgcmV0dXJuIGlkZW50aXR5LmlzQ29sbGVjdGlvbih0aGlzLmNvbnRlbnRzKSA/IHRoaXMuY29udGVudHMuaGFzKGtleSkgOiBmYWxzZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIHRoZSBkb2N1bWVudCBpbmNsdWRlcyBhIHZhbHVlIGF0IGBwYXRoYC5cbiAgICAgKi9cbiAgICBoYXNJbihwYXRoKSB7XG4gICAgICAgIGlmIChDb2xsZWN0aW9uLmlzRW1wdHlQYXRoKHBhdGgpKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29udGVudHMgIT09IHVuZGVmaW5lZDtcbiAgICAgICAgcmV0dXJuIGlkZW50aXR5LmlzQ29sbGVjdGlvbih0aGlzLmNvbnRlbnRzKSA/IHRoaXMuY29udGVudHMuaGFzSW4ocGF0aCkgOiBmYWxzZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0cyBhIHZhbHVlIGluIHRoaXMgZG9jdW1lbnQuIEZvciBgISFzZXRgLCBgdmFsdWVgIG5lZWRzIHRvIGJlIGFcbiAgICAgKiBib29sZWFuIHRvIGFkZC9yZW1vdmUgdGhlIGl0ZW0gZnJvbSB0aGUgc2V0LlxuICAgICAqL1xuICAgIHNldChrZXksIHZhbHVlKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbnRlbnRzID09IG51bGwpIHtcbiAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgV2UgY2FuJ3QgcmVhbGx5IGtub3cgdGhhdCB0aGlzIG1hdGNoZXMgQ29udGVudHMuXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRzID0gQ29sbGVjdGlvbi5jb2xsZWN0aW9uRnJvbVBhdGgodGhpcy5zY2hlbWEsIFtrZXldLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYXNzZXJ0Q29sbGVjdGlvbih0aGlzLmNvbnRlbnRzKSkge1xuICAgICAgICAgICAgdGhpcy5jb250ZW50cy5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0cyBhIHZhbHVlIGluIHRoaXMgZG9jdW1lbnQuIEZvciBgISFzZXRgLCBgdmFsdWVgIG5lZWRzIHRvIGJlIGFcbiAgICAgKiBib29sZWFuIHRvIGFkZC9yZW1vdmUgdGhlIGl0ZW0gZnJvbSB0aGUgc2V0LlxuICAgICAqL1xuICAgIHNldEluKHBhdGgsIHZhbHVlKSB7XG4gICAgICAgIGlmIChDb2xsZWN0aW9uLmlzRW1wdHlQYXRoKHBhdGgpKSB7XG4gICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFdlIGNhbid0IHJlYWxseSBrbm93IHRoYXQgdGhpcyBtYXRjaGVzIENvbnRlbnRzLlxuICAgICAgICAgICAgdGhpcy5jb250ZW50cyA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMuY29udGVudHMgPT0gbnVsbCkge1xuICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBXZSBjYW4ndCByZWFsbHkga25vdyB0aGF0IHRoaXMgbWF0Y2hlcyBDb250ZW50cy5cbiAgICAgICAgICAgIHRoaXMuY29udGVudHMgPSBDb2xsZWN0aW9uLmNvbGxlY3Rpb25Gcm9tUGF0aCh0aGlzLnNjaGVtYSwgQXJyYXkuZnJvbShwYXRoKSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGFzc2VydENvbGxlY3Rpb24odGhpcy5jb250ZW50cykpIHtcbiAgICAgICAgICAgIHRoaXMuY29udGVudHMuc2V0SW4ocGF0aCwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENoYW5nZSB0aGUgWUFNTCB2ZXJzaW9uIGFuZCBzY2hlbWEgdXNlZCBieSB0aGUgZG9jdW1lbnQuXG4gICAgICogQSBgbnVsbGAgdmVyc2lvbiBkaXNhYmxlcyBzdXBwb3J0IGZvciBkaXJlY3RpdmVzLCBleHBsaWNpdCB0YWdzLCBhbmNob3JzLCBhbmQgYWxpYXNlcy5cbiAgICAgKiBJdCBhbHNvIHJlcXVpcmVzIHRoZSBgc2NoZW1hYCBvcHRpb24gdG8gYmUgZ2l2ZW4gYXMgYSBgU2NoZW1hYCBpbnN0YW5jZSB2YWx1ZS5cbiAgICAgKlxuICAgICAqIE92ZXJyaWRlcyBhbGwgcHJldmlvdXNseSBzZXQgc2NoZW1hIG9wdGlvbnMuXG4gICAgICovXG4gICAgc2V0U2NoZW1hKHZlcnNpb24sIG9wdGlvbnMgPSB7fSkge1xuICAgICAgICBpZiAodHlwZW9mIHZlcnNpb24gPT09ICdudW1iZXInKVxuICAgICAgICAgICAgdmVyc2lvbiA9IFN0cmluZyh2ZXJzaW9uKTtcbiAgICAgICAgbGV0IG9wdDtcbiAgICAgICAgc3dpdGNoICh2ZXJzaW9uKSB7XG4gICAgICAgICAgICBjYXNlICcxLjEnOlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmRpcmVjdGl2ZXMpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGlyZWN0aXZlcy55YW1sLnZlcnNpb24gPSAnMS4xJztcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGlyZWN0aXZlcyA9IG5ldyBkaXJlY3RpdmVzLkRpcmVjdGl2ZXMoeyB2ZXJzaW9uOiAnMS4xJyB9KTtcbiAgICAgICAgICAgICAgICBvcHQgPSB7IHJlc29sdmVLbm93blRhZ3M6IGZhbHNlLCBzY2hlbWE6ICd5YW1sLTEuMScgfTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJzEuMic6XG4gICAgICAgICAgICBjYXNlICduZXh0JzpcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5kaXJlY3RpdmVzKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpcmVjdGl2ZXMueWFtbC52ZXJzaW9uID0gdmVyc2lvbjtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGlyZWN0aXZlcyA9IG5ldyBkaXJlY3RpdmVzLkRpcmVjdGl2ZXMoeyB2ZXJzaW9uIH0pO1xuICAgICAgICAgICAgICAgIG9wdCA9IHsgcmVzb2x2ZUtub3duVGFnczogdHJ1ZSwgc2NoZW1hOiAnY29yZScgfTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgbnVsbDpcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5kaXJlY3RpdmVzKVxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5kaXJlY3RpdmVzO1xuICAgICAgICAgICAgICAgIG9wdCA9IG51bGw7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3YgPSBKU09OLnN0cmluZ2lmeSh2ZXJzaW9uKTtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkICcxLjEnLCAnMS4yJyBvciBudWxsIGFzIGZpcnN0IGFyZ3VtZW50LCBidXQgZm91bmQ6ICR7c3Z9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gTm90IHVzaW5nIGBpbnN0YW5jZW9mIFNjaGVtYWAgdG8gYWxsb3cgZm9yIGR1Y2sgdHlwaW5nXG4gICAgICAgIGlmIChvcHRpb25zLnNjaGVtYSBpbnN0YW5jZW9mIE9iamVjdClcbiAgICAgICAgICAgIHRoaXMuc2NoZW1hID0gb3B0aW9ucy5zY2hlbWE7XG4gICAgICAgIGVsc2UgaWYgKG9wdClcbiAgICAgICAgICAgIHRoaXMuc2NoZW1hID0gbmV3IFNjaGVtYS5TY2hlbWEoT2JqZWN0LmFzc2lnbihvcHQsIG9wdGlvbnMpKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBXaXRoIGEgbnVsbCBZQU1MIHZlcnNpb24sIHRoZSB7IHNjaGVtYTogU2NoZW1hIH0gb3B0aW9uIGlzIHJlcXVpcmVkYCk7XG4gICAgfVxuICAgIC8vIGpzb24gJiBqc29uQXJnIGFyZSBvbmx5IHVzZWQgZnJvbSB0b0pTT04oKVxuICAgIHRvSlMoeyBqc29uLCBqc29uQXJnLCBtYXBBc01hcCwgbWF4QWxpYXNDb3VudCwgb25BbmNob3IsIHJldml2ZXIgfSA9IHt9KSB7XG4gICAgICAgIGNvbnN0IGN0eCA9IHtcbiAgICAgICAgICAgIGFuY2hvcnM6IG5ldyBNYXAoKSxcbiAgICAgICAgICAgIGRvYzogdGhpcyxcbiAgICAgICAgICAgIGtlZXA6ICFqc29uLFxuICAgICAgICAgICAgbWFwQXNNYXA6IG1hcEFzTWFwID09PSB0cnVlLFxuICAgICAgICAgICAgbWFwS2V5V2FybmVkOiBmYWxzZSxcbiAgICAgICAgICAgIG1heEFsaWFzQ291bnQ6IHR5cGVvZiBtYXhBbGlhc0NvdW50ID09PSAnbnVtYmVyJyA/IG1heEFsaWFzQ291bnQgOiAxMDBcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgcmVzID0gdG9KUy50b0pTKHRoaXMuY29udGVudHMsIGpzb25BcmcgPz8gJycsIGN0eCk7XG4gICAgICAgIGlmICh0eXBlb2Ygb25BbmNob3IgPT09ICdmdW5jdGlvbicpXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHsgY291bnQsIHJlcyB9IG9mIGN0eC5hbmNob3JzLnZhbHVlcygpKVxuICAgICAgICAgICAgICAgIG9uQW5jaG9yKHJlcywgY291bnQpO1xuICAgICAgICByZXR1cm4gdHlwZW9mIHJldml2ZXIgPT09ICdmdW5jdGlvbidcbiAgICAgICAgICAgID8gYXBwbHlSZXZpdmVyLmFwcGx5UmV2aXZlcihyZXZpdmVyLCB7ICcnOiByZXMgfSwgJycsIHJlcylcbiAgICAgICAgICAgIDogcmVzO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIGRvY3VtZW50IGBjb250ZW50c2AuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ganNvbkFyZyBVc2VkIGJ5IGBKU09OLnN0cmluZ2lmeWAgdG8gaW5kaWNhdGUgdGhlIGFycmF5IGluZGV4IG9yXG4gICAgICogICBwcm9wZXJ0eSBuYW1lLlxuICAgICAqL1xuICAgIHRvSlNPTihqc29uQXJnLCBvbkFuY2hvcikge1xuICAgICAgICByZXR1cm4gdGhpcy50b0pTKHsganNvbjogdHJ1ZSwganNvbkFyZywgbWFwQXNNYXA6IGZhbHNlLCBvbkFuY2hvciB9KTtcbiAgICB9XG4gICAgLyoqIEEgWUFNTCByZXByZXNlbnRhdGlvbiBvZiB0aGUgZG9jdW1lbnQuICovXG4gICAgdG9TdHJpbmcob3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIGlmICh0aGlzLmVycm9ycy5sZW5ndGggPiAwKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdEb2N1bWVudCB3aXRoIGVycm9ycyBjYW5ub3QgYmUgc3RyaW5naWZpZWQnKTtcbiAgICAgICAgaWYgKCdpbmRlbnQnIGluIG9wdGlvbnMgJiZcbiAgICAgICAgICAgICghTnVtYmVyLmlzSW50ZWdlcihvcHRpb25zLmluZGVudCkgfHwgTnVtYmVyKG9wdGlvbnMuaW5kZW50KSA8PSAwKSkge1xuICAgICAgICAgICAgY29uc3QgcyA9IEpTT04uc3RyaW5naWZ5KG9wdGlvbnMuaW5kZW50KTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgXCJpbmRlbnRcIiBvcHRpb24gbXVzdCBiZSBhIHBvc2l0aXZlIGludGVnZXIsIG5vdCAke3N9YCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0cmluZ2lmeURvY3VtZW50LnN0cmluZ2lmeURvY3VtZW50KHRoaXMsIG9wdGlvbnMpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGFzc2VydENvbGxlY3Rpb24oY29udGVudHMpIHtcbiAgICBpZiAoaWRlbnRpdHkuaXNDb2xsZWN0aW9uKGNvbnRlbnRzKSlcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdFeHBlY3RlZCBhIFlBTUwgY29sbGVjdGlvbiBhcyBkb2N1bWVudCBjb250ZW50cycpO1xufVxuXG5leHBvcnRzLkRvY3VtZW50ID0gRG9jdW1lbnQ7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxuY2xhc3MgWUFNTEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICAgIGNvbnN0cnVjdG9yKG5hbWUsIHBvcywgY29kZSwgbWVzc2FnZSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgICAgICB0aGlzLmNvZGUgPSBjb2RlO1xuICAgICAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgICAgICB0aGlzLnBvcyA9IHBvcztcbiAgICB9XG59XG5jbGFzcyBZQU1MUGFyc2VFcnJvciBleHRlbmRzIFlBTUxFcnJvciB7XG4gICAgY29uc3RydWN0b3IocG9zLCBjb2RlLCBtZXNzYWdlKSB7XG4gICAgICAgIHN1cGVyKCdZQU1MUGFyc2VFcnJvcicsIHBvcywgY29kZSwgbWVzc2FnZSk7XG4gICAgfVxufVxuY2xhc3MgWUFNTFdhcm5pbmcgZXh0ZW5kcyBZQU1MRXJyb3Ige1xuICAgIGNvbnN0cnVjdG9yKHBvcywgY29kZSwgbWVzc2FnZSkge1xuICAgICAgICBzdXBlcignWUFNTFdhcm5pbmcnLCBwb3MsIGNvZGUsIG1lc3NhZ2UpO1xuICAgIH1cbn1cbmNvbnN0IHByZXR0aWZ5RXJyb3IgPSAoc3JjLCBsYykgPT4gKGVycm9yKSA9PiB7XG4gICAgaWYgKGVycm9yLnBvc1swXSA9PT0gLTEpXG4gICAgICAgIHJldHVybjtcbiAgICBlcnJvci5saW5lUG9zID0gZXJyb3IucG9zLm1hcChwb3MgPT4gbGMubGluZVBvcyhwb3MpKTtcbiAgICBjb25zdCB7IGxpbmUsIGNvbCB9ID0gZXJyb3IubGluZVBvc1swXTtcbiAgICBlcnJvci5tZXNzYWdlICs9IGAgYXQgbGluZSAke2xpbmV9LCBjb2x1bW4gJHtjb2x9YDtcbiAgICBsZXQgY2kgPSBjb2wgLSAxO1xuICAgIGxldCBsaW5lU3RyID0gc3JjXG4gICAgICAgIC5zdWJzdHJpbmcobGMubGluZVN0YXJ0c1tsaW5lIC0gMV0sIGxjLmxpbmVTdGFydHNbbGluZV0pXG4gICAgICAgIC5yZXBsYWNlKC9bXFxuXFxyXSskLywgJycpO1xuICAgIC8vIFRyaW0gdG8gbWF4IDgwIGNoYXJzLCBrZWVwaW5nIGNvbCBwb3NpdGlvbiBuZWFyIHRoZSBtaWRkbGVcbiAgICBpZiAoY2kgPj0gNjAgJiYgbGluZVN0ci5sZW5ndGggPiA4MCkge1xuICAgICAgICBjb25zdCB0cmltU3RhcnQgPSBNYXRoLm1pbihjaSAtIDM5LCBsaW5lU3RyLmxlbmd0aCAtIDc5KTtcbiAgICAgICAgbGluZVN0ciA9ICfigKYnICsgbGluZVN0ci5zdWJzdHJpbmcodHJpbVN0YXJ0KTtcbiAgICAgICAgY2kgLT0gdHJpbVN0YXJ0IC0gMTtcbiAgICB9XG4gICAgaWYgKGxpbmVTdHIubGVuZ3RoID4gODApXG4gICAgICAgIGxpbmVTdHIgPSBsaW5lU3RyLnN1YnN0cmluZygwLCA3OSkgKyAn4oCmJztcbiAgICAvLyBJbmNsdWRlIHByZXZpb3VzIGxpbmUgaW4gY29udGV4dCBpZiBwb2ludGluZyBhdCBsaW5lIHN0YXJ0XG4gICAgaWYgKGxpbmUgPiAxICYmIC9eICokLy50ZXN0KGxpbmVTdHIuc3Vic3RyaW5nKDAsIGNpKSkpIHtcbiAgICAgICAgLy8gUmVnZXhwIHdvbid0IG1hdGNoIGlmIHN0YXJ0IGlzIHRyaW1tZWRcbiAgICAgICAgbGV0IHByZXYgPSBzcmMuc3Vic3RyaW5nKGxjLmxpbmVTdGFydHNbbGluZSAtIDJdLCBsYy5saW5lU3RhcnRzW2xpbmUgLSAxXSk7XG4gICAgICAgIGlmIChwcmV2Lmxlbmd0aCA+IDgwKVxuICAgICAgICAgICAgcHJldiA9IHByZXYuc3Vic3RyaW5nKDAsIDc5KSArICfigKZcXG4nO1xuICAgICAgICBsaW5lU3RyID0gcHJldiArIGxpbmVTdHI7XG4gICAgfVxuICAgIGlmICgvW14gXS8udGVzdChsaW5lU3RyKSkge1xuICAgICAgICBsZXQgY291bnQgPSAxO1xuICAgICAgICBjb25zdCBlbmQgPSBlcnJvci5saW5lUG9zWzFdO1xuICAgICAgICBpZiAoZW5kPy5saW5lID09PSBsaW5lICYmIGVuZC5jb2wgPiBjb2wpIHtcbiAgICAgICAgICAgIGNvdW50ID0gTWF0aC5tYXgoMSwgTWF0aC5taW4oZW5kLmNvbCAtIGNvbCwgODAgLSBjaSkpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBvaW50ZXIgPSAnICcucmVwZWF0KGNpKSArICdeJy5yZXBlYXQoY291bnQpO1xuICAgICAgICBlcnJvci5tZXNzYWdlICs9IGA6XFxuXFxuJHtsaW5lU3RyfVxcbiR7cG9pbnRlcn1cXG5gO1xuICAgIH1cbn07XG5cbmV4cG9ydHMuWUFNTEVycm9yID0gWUFNTEVycm9yO1xuZXhwb3J0cy5ZQU1MUGFyc2VFcnJvciA9IFlBTUxQYXJzZUVycm9yO1xuZXhwb3J0cy5ZQU1MV2FybmluZyA9IFlBTUxXYXJuaW5nO1xuZXhwb3J0cy5wcmV0dGlmeUVycm9yID0gcHJldHRpZnlFcnJvcjtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiByZXNvbHZlUHJvcHModG9rZW5zLCB7IGZsb3csIGluZGljYXRvciwgbmV4dCwgb2Zmc2V0LCBvbkVycm9yLCBwYXJlbnRJbmRlbnQsIHN0YXJ0T25OZXdsaW5lIH0pIHtcbiAgICBsZXQgc3BhY2VCZWZvcmUgPSBmYWxzZTtcbiAgICBsZXQgYXROZXdsaW5lID0gc3RhcnRPbk5ld2xpbmU7XG4gICAgbGV0IGhhc1NwYWNlID0gc3RhcnRPbk5ld2xpbmU7XG4gICAgbGV0IGNvbW1lbnQgPSAnJztcbiAgICBsZXQgY29tbWVudFNlcCA9ICcnO1xuICAgIGxldCBoYXNOZXdsaW5lID0gZmFsc2U7XG4gICAgbGV0IHJlcVNwYWNlID0gZmFsc2U7XG4gICAgbGV0IHRhYiA9IG51bGw7XG4gICAgbGV0IGFuY2hvciA9IG51bGw7XG4gICAgbGV0IHRhZyA9IG51bGw7XG4gICAgbGV0IG5ld2xpbmVBZnRlclByb3AgPSBudWxsO1xuICAgIGxldCBjb21tYSA9IG51bGw7XG4gICAgbGV0IGZvdW5kID0gbnVsbDtcbiAgICBsZXQgc3RhcnQgPSBudWxsO1xuICAgIGZvciAoY29uc3QgdG9rZW4gb2YgdG9rZW5zKSB7XG4gICAgICAgIGlmIChyZXFTcGFjZSkge1xuICAgICAgICAgICAgaWYgKHRva2VuLnR5cGUgIT09ICdzcGFjZScgJiZcbiAgICAgICAgICAgICAgICB0b2tlbi50eXBlICE9PSAnbmV3bGluZScgJiZcbiAgICAgICAgICAgICAgICB0b2tlbi50eXBlICE9PSAnY29tbWEnKVxuICAgICAgICAgICAgICAgIG9uRXJyb3IodG9rZW4ub2Zmc2V0LCAnTUlTU0lOR19DSEFSJywgJ1RhZ3MgYW5kIGFuY2hvcnMgbXVzdCBiZSBzZXBhcmF0ZWQgZnJvbSB0aGUgbmV4dCB0b2tlbiBieSB3aGl0ZSBzcGFjZScpO1xuICAgICAgICAgICAgcmVxU3BhY2UgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGFiKSB7XG4gICAgICAgICAgICBpZiAoYXROZXdsaW5lICYmIHRva2VuLnR5cGUgIT09ICdjb21tZW50JyAmJiB0b2tlbi50eXBlICE9PSAnbmV3bGluZScpIHtcbiAgICAgICAgICAgICAgICBvbkVycm9yKHRhYiwgJ1RBQl9BU19JTkRFTlQnLCAnVGFicyBhcmUgbm90IGFsbG93ZWQgYXMgaW5kZW50YXRpb24nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRhYiA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgc3dpdGNoICh0b2tlbi50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICAgICAgLy8gQXQgdGhlIGRvYyBsZXZlbCwgdGFicyBhdCBsaW5lIHN0YXJ0IG1heSBiZSBwYXJzZWRcbiAgICAgICAgICAgICAgICAvLyBhcyBsZWFkaW5nIHdoaXRlIHNwYWNlIHJhdGhlciB0aGFuIGluZGVudGF0aW9uLlxuICAgICAgICAgICAgICAgIC8vIEluIGEgZmxvdyBjb2xsZWN0aW9uLCBvbmx5IHRoZSBwYXJzZXIgaGFuZGxlcyBpbmRlbnQuXG4gICAgICAgICAgICAgICAgaWYgKCFmbG93ICYmXG4gICAgICAgICAgICAgICAgICAgIChpbmRpY2F0b3IgIT09ICdkb2Mtc3RhcnQnIHx8IG5leHQ/LnR5cGUgIT09ICdmbG93LWNvbGxlY3Rpb24nKSAmJlxuICAgICAgICAgICAgICAgICAgICB0b2tlbi5zb3VyY2UuaW5jbHVkZXMoJ1xcdCcpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhYiA9IHRva2VuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBoYXNTcGFjZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdjb21tZW50Jzoge1xuICAgICAgICAgICAgICAgIGlmICghaGFzU3BhY2UpXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdNSVNTSU5HX0NIQVInLCAnQ29tbWVudHMgbXVzdCBiZSBzZXBhcmF0ZWQgZnJvbSBvdGhlciB0b2tlbnMgYnkgd2hpdGUgc3BhY2UgY2hhcmFjdGVycycpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNiID0gdG9rZW4uc291cmNlLnN1YnN0cmluZygxKSB8fCAnICc7XG4gICAgICAgICAgICAgICAgaWYgKCFjb21tZW50KVxuICAgICAgICAgICAgICAgICAgICBjb21tZW50ID0gY2I7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBjb21tZW50ICs9IGNvbW1lbnRTZXAgKyBjYjtcbiAgICAgICAgICAgICAgICBjb21tZW50U2VwID0gJyc7XG4gICAgICAgICAgICAgICAgYXROZXdsaW5lID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICBpZiAoYXROZXdsaW5lKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb21tZW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgY29tbWVudCArPSB0b2tlbi5zb3VyY2U7XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKCFmb3VuZCB8fCBpbmRpY2F0b3IgIT09ICdzZXEtaXRlbS1pbmQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgc3BhY2VCZWZvcmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGNvbW1lbnRTZXAgKz0gdG9rZW4uc291cmNlO1xuICAgICAgICAgICAgICAgIGF0TmV3bGluZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgaGFzTmV3bGluZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgaWYgKGFuY2hvciB8fCB0YWcpXG4gICAgICAgICAgICAgICAgICAgIG5ld2xpbmVBZnRlclByb3AgPSB0b2tlbjtcbiAgICAgICAgICAgICAgICBoYXNTcGFjZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdhbmNob3InOlxuICAgICAgICAgICAgICAgIGlmIChhbmNob3IpXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdNVUxUSVBMRV9BTkNIT1JTJywgJ0Egbm9kZSBjYW4gaGF2ZSBhdCBtb3N0IG9uZSBhbmNob3InKTtcbiAgICAgICAgICAgICAgICBpZiAodG9rZW4uc291cmNlLmVuZHNXaXRoKCc6JykpXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IodG9rZW4ub2Zmc2V0ICsgdG9rZW4uc291cmNlLmxlbmd0aCAtIDEsICdCQURfQUxJQVMnLCAnQW5jaG9yIGVuZGluZyBpbiA6IGlzIGFtYmlndW91cycsIHRydWUpO1xuICAgICAgICAgICAgICAgIGFuY2hvciA9IHRva2VuO1xuICAgICAgICAgICAgICAgIHN0YXJ0ID8/IChzdGFydCA9IHRva2VuLm9mZnNldCk7XG4gICAgICAgICAgICAgICAgYXROZXdsaW5lID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaGFzU3BhY2UgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICByZXFTcGFjZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd0YWcnOiB7XG4gICAgICAgICAgICAgICAgaWYgKHRhZylcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcih0b2tlbiwgJ01VTFRJUExFX1RBR1MnLCAnQSBub2RlIGNhbiBoYXZlIGF0IG1vc3Qgb25lIHRhZycpO1xuICAgICAgICAgICAgICAgIHRhZyA9IHRva2VuO1xuICAgICAgICAgICAgICAgIHN0YXJ0ID8/IChzdGFydCA9IHRva2VuLm9mZnNldCk7XG4gICAgICAgICAgICAgICAgYXROZXdsaW5lID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaGFzU3BhY2UgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICByZXFTcGFjZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIGluZGljYXRvcjpcbiAgICAgICAgICAgICAgICAvLyBDb3VsZCBoZXJlIGhhbmRsZSBwcmVjZWRpbmcgY29tbWVudHMgZGlmZmVyZW50bHlcbiAgICAgICAgICAgICAgICBpZiAoYW5jaG9yIHx8IHRhZylcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcih0b2tlbiwgJ0JBRF9QUk9QX09SREVSJywgYEFuY2hvcnMgYW5kIHRhZ3MgbXVzdCBiZSBhZnRlciB0aGUgJHt0b2tlbi5zb3VyY2V9IGluZGljYXRvcmApO1xuICAgICAgICAgICAgICAgIGlmIChmb3VuZClcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcih0b2tlbiwgJ1VORVhQRUNURURfVE9LRU4nLCBgVW5leHBlY3RlZCAke3Rva2VuLnNvdXJjZX0gaW4gJHtmbG93ID8/ICdjb2xsZWN0aW9uJ31gKTtcbiAgICAgICAgICAgICAgICBmb3VuZCA9IHRva2VuO1xuICAgICAgICAgICAgICAgIGF0TmV3bGluZSA9XG4gICAgICAgICAgICAgICAgICAgIGluZGljYXRvciA9PT0gJ3NlcS1pdGVtLWluZCcgfHwgaW5kaWNhdG9yID09PSAnZXhwbGljaXQta2V5LWluZCc7XG4gICAgICAgICAgICAgICAgaGFzU3BhY2UgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2NvbW1hJzpcbiAgICAgICAgICAgICAgICBpZiAoZmxvdykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29tbWEpXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnVU5FWFBFQ1RFRF9UT0tFTicsIGBVbmV4cGVjdGVkICwgaW4gJHtmbG93fWApO1xuICAgICAgICAgICAgICAgICAgICBjb21tYSA9IHRva2VuO1xuICAgICAgICAgICAgICAgICAgICBhdE5ld2xpbmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgaGFzU3BhY2UgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gZWxzZSBmYWxsdGhyb3VnaFxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnVU5FWFBFQ1RFRF9UT0tFTicsIGBVbmV4cGVjdGVkICR7dG9rZW4udHlwZX0gdG9rZW5gKTtcbiAgICAgICAgICAgICAgICBhdE5ld2xpbmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBoYXNTcGFjZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGxhc3QgPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuICAgIGNvbnN0IGVuZCA9IGxhc3QgPyBsYXN0Lm9mZnNldCArIGxhc3Quc291cmNlLmxlbmd0aCA6IG9mZnNldDtcbiAgICBpZiAocmVxU3BhY2UgJiZcbiAgICAgICAgbmV4dCAmJlxuICAgICAgICBuZXh0LnR5cGUgIT09ICdzcGFjZScgJiZcbiAgICAgICAgbmV4dC50eXBlICE9PSAnbmV3bGluZScgJiZcbiAgICAgICAgbmV4dC50eXBlICE9PSAnY29tbWEnICYmXG4gICAgICAgIChuZXh0LnR5cGUgIT09ICdzY2FsYXInIHx8IG5leHQuc291cmNlICE9PSAnJykpIHtcbiAgICAgICAgb25FcnJvcihuZXh0Lm9mZnNldCwgJ01JU1NJTkdfQ0hBUicsICdUYWdzIGFuZCBhbmNob3JzIG11c3QgYmUgc2VwYXJhdGVkIGZyb20gdGhlIG5leHQgdG9rZW4gYnkgd2hpdGUgc3BhY2UnKTtcbiAgICB9XG4gICAgaWYgKHRhYiAmJlxuICAgICAgICAoKGF0TmV3bGluZSAmJiB0YWIuaW5kZW50IDw9IHBhcmVudEluZGVudCkgfHxcbiAgICAgICAgICAgIG5leHQ/LnR5cGUgPT09ICdibG9jay1tYXAnIHx8XG4gICAgICAgICAgICBuZXh0Py50eXBlID09PSAnYmxvY2stc2VxJykpXG4gICAgICAgIG9uRXJyb3IodGFiLCAnVEFCX0FTX0lOREVOVCcsICdUYWJzIGFyZSBub3QgYWxsb3dlZCBhcyBpbmRlbnRhdGlvbicpO1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbW1hLFxuICAgICAgICBmb3VuZCxcbiAgICAgICAgc3BhY2VCZWZvcmUsXG4gICAgICAgIGNvbW1lbnQsXG4gICAgICAgIGhhc05ld2xpbmUsXG4gICAgICAgIGFuY2hvcixcbiAgICAgICAgdGFnLFxuICAgICAgICBuZXdsaW5lQWZ0ZXJQcm9wLFxuICAgICAgICBlbmQsXG4gICAgICAgIHN0YXJ0OiBzdGFydCA/PyBlbmRcbiAgICB9O1xufVxuXG5leHBvcnRzLnJlc29sdmVQcm9wcyA9IHJlc29sdmVQcm9wcztcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBjb250YWluc05ld2xpbmUoa2V5KSB7XG4gICAgaWYgKCFrZXkpXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIHN3aXRjaCAoa2V5LnR5cGUpIHtcbiAgICAgICAgY2FzZSAnYWxpYXMnOlxuICAgICAgICBjYXNlICdzY2FsYXInOlxuICAgICAgICBjYXNlICdkb3VibGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgIGNhc2UgJ3NpbmdsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgICAgIGlmIChrZXkuc291cmNlLmluY2x1ZGVzKCdcXG4nKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChrZXkuZW5kKVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgc3Qgb2Yga2V5LmVuZClcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0LnR5cGUgPT09ICduZXdsaW5lJylcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBjYXNlICdmbG93LWNvbGxlY3Rpb24nOlxuICAgICAgICAgICAgZm9yIChjb25zdCBpdCBvZiBrZXkuaXRlbXMpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHN0IG9mIGl0LnN0YXJ0KVxuICAgICAgICAgICAgICAgICAgICBpZiAoc3QudHlwZSA9PT0gJ25ld2xpbmUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgaWYgKGl0LnNlcClcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBzdCBvZiBpdC5zZXApXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3QudHlwZSA9PT0gJ25ld2xpbmUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIGlmIChjb250YWluc05ld2xpbmUoaXQua2V5KSB8fCBjb250YWluc05ld2xpbmUoaXQudmFsdWUpKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbn1cblxuZXhwb3J0cy5jb250YWluc05ld2xpbmUgPSBjb250YWluc05ld2xpbmU7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxDb250YWluc05ld2xpbmUgPSByZXF1aXJlKCcuL3V0aWwtY29udGFpbnMtbmV3bGluZS5qcycpO1xuXG5mdW5jdGlvbiBmbG93SW5kZW50Q2hlY2soaW5kZW50LCBmYywgb25FcnJvcikge1xuICAgIGlmIChmYz8udHlwZSA9PT0gJ2Zsb3ctY29sbGVjdGlvbicpIHtcbiAgICAgICAgY29uc3QgZW5kID0gZmMuZW5kWzBdO1xuICAgICAgICBpZiAoZW5kLmluZGVudCA9PT0gaW5kZW50ICYmXG4gICAgICAgICAgICAoZW5kLnNvdXJjZSA9PT0gJ10nIHx8IGVuZC5zb3VyY2UgPT09ICd9JykgJiZcbiAgICAgICAgICAgIHV0aWxDb250YWluc05ld2xpbmUuY29udGFpbnNOZXdsaW5lKGZjKSkge1xuICAgICAgICAgICAgY29uc3QgbXNnID0gJ0Zsb3cgZW5kIGluZGljYXRvciBzaG91bGQgYmUgbW9yZSBpbmRlbnRlZCB0aGFuIHBhcmVudCc7XG4gICAgICAgICAgICBvbkVycm9yKGVuZCwgJ0JBRF9JTkRFTlQnLCBtc2csIHRydWUpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnRzLmZsb3dJbmRlbnRDaGVjayA9IGZsb3dJbmRlbnRDaGVjaztcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuLi9ub2Rlcy9pZGVudGl0eS5qcycpO1xuXG5mdW5jdGlvbiBtYXBJbmNsdWRlcyhjdHgsIGl0ZW1zLCBzZWFyY2gpIHtcbiAgICBjb25zdCB7IHVuaXF1ZUtleXMgfSA9IGN0eC5vcHRpb25zO1xuICAgIGlmICh1bmlxdWVLZXlzID09PSBmYWxzZSlcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIGNvbnN0IGlzRXF1YWwgPSB0eXBlb2YgdW5pcXVlS2V5cyA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICA/IHVuaXF1ZUtleXNcbiAgICAgICAgOiAoYSwgYikgPT4gYSA9PT0gYiB8fCAoaWRlbnRpdHkuaXNTY2FsYXIoYSkgJiYgaWRlbnRpdHkuaXNTY2FsYXIoYikgJiYgYS52YWx1ZSA9PT0gYi52YWx1ZSk7XG4gICAgcmV0dXJuIGl0ZW1zLnNvbWUocGFpciA9PiBpc0VxdWFsKHBhaXIua2V5LCBzZWFyY2gpKTtcbn1cblxuZXhwb3J0cy5tYXBJbmNsdWRlcyA9IG1hcEluY2x1ZGVzO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBQYWlyID0gcmVxdWlyZSgnLi4vbm9kZXMvUGFpci5qcycpO1xudmFyIFlBTUxNYXAgPSByZXF1aXJlKCcuLi9ub2Rlcy9ZQU1MTWFwLmpzJyk7XG52YXIgcmVzb2x2ZVByb3BzID0gcmVxdWlyZSgnLi9yZXNvbHZlLXByb3BzLmpzJyk7XG52YXIgdXRpbENvbnRhaW5zTmV3bGluZSA9IHJlcXVpcmUoJy4vdXRpbC1jb250YWlucy1uZXdsaW5lLmpzJyk7XG52YXIgdXRpbEZsb3dJbmRlbnRDaGVjayA9IHJlcXVpcmUoJy4vdXRpbC1mbG93LWluZGVudC1jaGVjay5qcycpO1xudmFyIHV0aWxNYXBJbmNsdWRlcyA9IHJlcXVpcmUoJy4vdXRpbC1tYXAtaW5jbHVkZXMuanMnKTtcblxuY29uc3Qgc3RhcnRDb2xNc2cgPSAnQWxsIG1hcHBpbmcgaXRlbXMgbXVzdCBzdGFydCBhdCB0aGUgc2FtZSBjb2x1bW4nO1xuZnVuY3Rpb24gcmVzb2x2ZUJsb2NrTWFwKHsgY29tcG9zZU5vZGUsIGNvbXBvc2VFbXB0eU5vZGUgfSwgY3R4LCBibSwgb25FcnJvciwgdGFnKSB7XG4gICAgY29uc3QgTm9kZUNsYXNzID0gdGFnPy5ub2RlQ2xhc3MgPz8gWUFNTE1hcC5ZQU1MTWFwO1xuICAgIGNvbnN0IG1hcCA9IG5ldyBOb2RlQ2xhc3MoY3R4LnNjaGVtYSk7XG4gICAgaWYgKGN0eC5hdFJvb3QpXG4gICAgICAgIGN0eC5hdFJvb3QgPSBmYWxzZTtcbiAgICBsZXQgb2Zmc2V0ID0gYm0ub2Zmc2V0O1xuICAgIGxldCBjb21tZW50RW5kID0gbnVsbDtcbiAgICBmb3IgKGNvbnN0IGNvbGxJdGVtIG9mIGJtLml0ZW1zKSB7XG4gICAgICAgIGNvbnN0IHsgc3RhcnQsIGtleSwgc2VwLCB2YWx1ZSB9ID0gY29sbEl0ZW07XG4gICAgICAgIC8vIGtleSBwcm9wZXJ0aWVzXG4gICAgICAgIGNvbnN0IGtleVByb3BzID0gcmVzb2x2ZVByb3BzLnJlc29sdmVQcm9wcyhzdGFydCwge1xuICAgICAgICAgICAgaW5kaWNhdG9yOiAnZXhwbGljaXQta2V5LWluZCcsXG4gICAgICAgICAgICBuZXh0OiBrZXkgPz8gc2VwPy5bMF0sXG4gICAgICAgICAgICBvZmZzZXQsXG4gICAgICAgICAgICBvbkVycm9yLFxuICAgICAgICAgICAgcGFyZW50SW5kZW50OiBibS5pbmRlbnQsXG4gICAgICAgICAgICBzdGFydE9uTmV3bGluZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgaW1wbGljaXRLZXkgPSAha2V5UHJvcHMuZm91bmQ7XG4gICAgICAgIGlmIChpbXBsaWNpdEtleSkge1xuICAgICAgICAgICAgaWYgKGtleSkge1xuICAgICAgICAgICAgICAgIGlmIChrZXkudHlwZSA9PT0gJ2Jsb2NrLXNlcScpXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3Iob2Zmc2V0LCAnQkxPQ0tfQVNfSU1QTElDSVRfS0VZJywgJ0EgYmxvY2sgc2VxdWVuY2UgbWF5IG5vdCBiZSB1c2VkIGFzIGFuIGltcGxpY2l0IG1hcCBrZXknKTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmICgnaW5kZW50JyBpbiBrZXkgJiYga2V5LmluZGVudCAhPT0gYm0uaW5kZW50KVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKG9mZnNldCwgJ0JBRF9JTkRFTlQnLCBzdGFydENvbE1zZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWtleVByb3BzLmFuY2hvciAmJiAha2V5UHJvcHMudGFnICYmICFzZXApIHtcbiAgICAgICAgICAgICAgICBjb21tZW50RW5kID0ga2V5UHJvcHMuZW5kO1xuICAgICAgICAgICAgICAgIGlmIChrZXlQcm9wcy5jb21tZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtYXAuY29tbWVudClcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5jb21tZW50ICs9ICdcXG4nICsga2V5UHJvcHMuY29tbWVudDtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwLmNvbW1lbnQgPSBrZXlQcm9wcy5jb21tZW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChrZXlQcm9wcy5uZXdsaW5lQWZ0ZXJQcm9wIHx8IHV0aWxDb250YWluc05ld2xpbmUuY29udGFpbnNOZXdsaW5lKGtleSkpIHtcbiAgICAgICAgICAgICAgICBvbkVycm9yKGtleSA/PyBzdGFydFtzdGFydC5sZW5ndGggLSAxXSwgJ01VTFRJTElORV9JTVBMSUNJVF9LRVknLCAnSW1wbGljaXQga2V5cyBuZWVkIHRvIGJlIG9uIGEgc2luZ2xlIGxpbmUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChrZXlQcm9wcy5mb3VuZD8uaW5kZW50ICE9PSBibS5pbmRlbnQpIHtcbiAgICAgICAgICAgIG9uRXJyb3Iob2Zmc2V0LCAnQkFEX0lOREVOVCcsIHN0YXJ0Q29sTXNnKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBrZXkgdmFsdWVcbiAgICAgICAgY3R4LmF0S2V5ID0gdHJ1ZTtcbiAgICAgICAgY29uc3Qga2V5U3RhcnQgPSBrZXlQcm9wcy5lbmQ7XG4gICAgICAgIGNvbnN0IGtleU5vZGUgPSBrZXlcbiAgICAgICAgICAgID8gY29tcG9zZU5vZGUoY3R4LCBrZXksIGtleVByb3BzLCBvbkVycm9yKVxuICAgICAgICAgICAgOiBjb21wb3NlRW1wdHlOb2RlKGN0eCwga2V5U3RhcnQsIHN0YXJ0LCBudWxsLCBrZXlQcm9wcywgb25FcnJvcik7XG4gICAgICAgIGlmIChjdHguc2NoZW1hLmNvbXBhdClcbiAgICAgICAgICAgIHV0aWxGbG93SW5kZW50Q2hlY2suZmxvd0luZGVudENoZWNrKGJtLmluZGVudCwga2V5LCBvbkVycm9yKTtcbiAgICAgICAgY3R4LmF0S2V5ID0gZmFsc2U7XG4gICAgICAgIGlmICh1dGlsTWFwSW5jbHVkZXMubWFwSW5jbHVkZXMoY3R4LCBtYXAuaXRlbXMsIGtleU5vZGUpKVxuICAgICAgICAgICAgb25FcnJvcihrZXlTdGFydCwgJ0RVUExJQ0FURV9LRVknLCAnTWFwIGtleXMgbXVzdCBiZSB1bmlxdWUnKTtcbiAgICAgICAgLy8gdmFsdWUgcHJvcGVydGllc1xuICAgICAgICBjb25zdCB2YWx1ZVByb3BzID0gcmVzb2x2ZVByb3BzLnJlc29sdmVQcm9wcyhzZXAgPz8gW10sIHtcbiAgICAgICAgICAgIGluZGljYXRvcjogJ21hcC12YWx1ZS1pbmQnLFxuICAgICAgICAgICAgbmV4dDogdmFsdWUsXG4gICAgICAgICAgICBvZmZzZXQ6IGtleU5vZGUucmFuZ2VbMl0sXG4gICAgICAgICAgICBvbkVycm9yLFxuICAgICAgICAgICAgcGFyZW50SW5kZW50OiBibS5pbmRlbnQsXG4gICAgICAgICAgICBzdGFydE9uTmV3bGluZTogIWtleSB8fCBrZXkudHlwZSA9PT0gJ2Jsb2NrLXNjYWxhcidcbiAgICAgICAgfSk7XG4gICAgICAgIG9mZnNldCA9IHZhbHVlUHJvcHMuZW5kO1xuICAgICAgICBpZiAodmFsdWVQcm9wcy5mb3VuZCkge1xuICAgICAgICAgICAgaWYgKGltcGxpY2l0S2V5KSB7XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlPy50eXBlID09PSAnYmxvY2stbWFwJyAmJiAhdmFsdWVQcm9wcy5oYXNOZXdsaW5lKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKG9mZnNldCwgJ0JMT0NLX0FTX0lNUExJQ0lUX0tFWScsICdOZXN0ZWQgbWFwcGluZ3MgYXJlIG5vdCBhbGxvd2VkIGluIGNvbXBhY3QgbWFwcGluZ3MnKTtcbiAgICAgICAgICAgICAgICBpZiAoY3R4Lm9wdGlvbnMuc3RyaWN0ICYmXG4gICAgICAgICAgICAgICAgICAgIGtleVByb3BzLnN0YXJ0IDwgdmFsdWVQcm9wcy5mb3VuZC5vZmZzZXQgLSAxMDI0KVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKGtleU5vZGUucmFuZ2UsICdLRVlfT1ZFUl8xMDI0X0NIQVJTJywgJ1RoZSA6IGluZGljYXRvciBtdXN0IGJlIGF0IG1vc3QgMTAyNCBjaGFycyBhZnRlciB0aGUgc3RhcnQgb2YgYW4gaW1wbGljaXQgYmxvY2sgbWFwcGluZyBrZXknKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHZhbHVlIHZhbHVlXG4gICAgICAgICAgICBjb25zdCB2YWx1ZU5vZGUgPSB2YWx1ZVxuICAgICAgICAgICAgICAgID8gY29tcG9zZU5vZGUoY3R4LCB2YWx1ZSwgdmFsdWVQcm9wcywgb25FcnJvcilcbiAgICAgICAgICAgICAgICA6IGNvbXBvc2VFbXB0eU5vZGUoY3R4LCBvZmZzZXQsIHNlcCwgbnVsbCwgdmFsdWVQcm9wcywgb25FcnJvcik7XG4gICAgICAgICAgICBpZiAoY3R4LnNjaGVtYS5jb21wYXQpXG4gICAgICAgICAgICAgICAgdXRpbEZsb3dJbmRlbnRDaGVjay5mbG93SW5kZW50Q2hlY2soYm0uaW5kZW50LCB2YWx1ZSwgb25FcnJvcik7XG4gICAgICAgICAgICBvZmZzZXQgPSB2YWx1ZU5vZGUucmFuZ2VbMl07XG4gICAgICAgICAgICBjb25zdCBwYWlyID0gbmV3IFBhaXIuUGFpcihrZXlOb2RlLCB2YWx1ZU5vZGUpO1xuICAgICAgICAgICAgaWYgKGN0eC5vcHRpb25zLmtlZXBTb3VyY2VUb2tlbnMpXG4gICAgICAgICAgICAgICAgcGFpci5zcmNUb2tlbiA9IGNvbGxJdGVtO1xuICAgICAgICAgICAgbWFwLml0ZW1zLnB1c2gocGFpcik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBrZXkgd2l0aCBubyB2YWx1ZVxuICAgICAgICAgICAgaWYgKGltcGxpY2l0S2V5KVxuICAgICAgICAgICAgICAgIG9uRXJyb3Ioa2V5Tm9kZS5yYW5nZSwgJ01JU1NJTkdfQ0hBUicsICdJbXBsaWNpdCBtYXAga2V5cyBuZWVkIHRvIGJlIGZvbGxvd2VkIGJ5IG1hcCB2YWx1ZXMnKTtcbiAgICAgICAgICAgIGlmICh2YWx1ZVByb3BzLmNvbW1lbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoa2V5Tm9kZS5jb21tZW50KVxuICAgICAgICAgICAgICAgICAgICBrZXlOb2RlLmNvbW1lbnQgKz0gJ1xcbicgKyB2YWx1ZVByb3BzLmNvbW1lbnQ7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBrZXlOb2RlLmNvbW1lbnQgPSB2YWx1ZVByb3BzLmNvbW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBwYWlyID0gbmV3IFBhaXIuUGFpcihrZXlOb2RlKTtcbiAgICAgICAgICAgIGlmIChjdHgub3B0aW9ucy5rZWVwU291cmNlVG9rZW5zKVxuICAgICAgICAgICAgICAgIHBhaXIuc3JjVG9rZW4gPSBjb2xsSXRlbTtcbiAgICAgICAgICAgIG1hcC5pdGVtcy5wdXNoKHBhaXIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChjb21tZW50RW5kICYmIGNvbW1lbnRFbmQgPCBvZmZzZXQpXG4gICAgICAgIG9uRXJyb3IoY29tbWVudEVuZCwgJ0lNUE9TU0lCTEUnLCAnTWFwIGNvbW1lbnQgd2l0aCB0cmFpbGluZyBjb250ZW50Jyk7XG4gICAgbWFwLnJhbmdlID0gW2JtLm9mZnNldCwgb2Zmc2V0LCBjb21tZW50RW5kID8/IG9mZnNldF07XG4gICAgcmV0dXJuIG1hcDtcbn1cblxuZXhwb3J0cy5yZXNvbHZlQmxvY2tNYXAgPSByZXNvbHZlQmxvY2tNYXA7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIFlBTUxTZXEgPSByZXF1aXJlKCcuLi9ub2Rlcy9ZQU1MU2VxLmpzJyk7XG52YXIgcmVzb2x2ZVByb3BzID0gcmVxdWlyZSgnLi9yZXNvbHZlLXByb3BzLmpzJyk7XG52YXIgdXRpbEZsb3dJbmRlbnRDaGVjayA9IHJlcXVpcmUoJy4vdXRpbC1mbG93LWluZGVudC1jaGVjay5qcycpO1xuXG5mdW5jdGlvbiByZXNvbHZlQmxvY2tTZXEoeyBjb21wb3NlTm9kZSwgY29tcG9zZUVtcHR5Tm9kZSB9LCBjdHgsIGJzLCBvbkVycm9yLCB0YWcpIHtcbiAgICBjb25zdCBOb2RlQ2xhc3MgPSB0YWc/Lm5vZGVDbGFzcyA/PyBZQU1MU2VxLllBTUxTZXE7XG4gICAgY29uc3Qgc2VxID0gbmV3IE5vZGVDbGFzcyhjdHguc2NoZW1hKTtcbiAgICBpZiAoY3R4LmF0Um9vdClcbiAgICAgICAgY3R4LmF0Um9vdCA9IGZhbHNlO1xuICAgIGlmIChjdHguYXRLZXkpXG4gICAgICAgIGN0eC5hdEtleSA9IGZhbHNlO1xuICAgIGxldCBvZmZzZXQgPSBicy5vZmZzZXQ7XG4gICAgbGV0IGNvbW1lbnRFbmQgPSBudWxsO1xuICAgIGZvciAoY29uc3QgeyBzdGFydCwgdmFsdWUgfSBvZiBicy5pdGVtcykge1xuICAgICAgICBjb25zdCBwcm9wcyA9IHJlc29sdmVQcm9wcy5yZXNvbHZlUHJvcHMoc3RhcnQsIHtcbiAgICAgICAgICAgIGluZGljYXRvcjogJ3NlcS1pdGVtLWluZCcsXG4gICAgICAgICAgICBuZXh0OiB2YWx1ZSxcbiAgICAgICAgICAgIG9mZnNldCxcbiAgICAgICAgICAgIG9uRXJyb3IsXG4gICAgICAgICAgICBwYXJlbnRJbmRlbnQ6IGJzLmluZGVudCxcbiAgICAgICAgICAgIHN0YXJ0T25OZXdsaW5lOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIXByb3BzLmZvdW5kKSB7XG4gICAgICAgICAgICBpZiAocHJvcHMuYW5jaG9yIHx8IHByb3BzLnRhZyB8fCB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZT8udHlwZSA9PT0gJ2Jsb2NrLXNlcScpXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IocHJvcHMuZW5kLCAnQkFEX0lOREVOVCcsICdBbGwgc2VxdWVuY2UgaXRlbXMgbXVzdCBzdGFydCBhdCB0aGUgc2FtZSBjb2x1bW4nKTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3Iob2Zmc2V0LCAnTUlTU0lOR19DSEFSJywgJ1NlcXVlbmNlIGl0ZW0gd2l0aG91dCAtIGluZGljYXRvcicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29tbWVudEVuZCA9IHByb3BzLmVuZDtcbiAgICAgICAgICAgICAgICBpZiAocHJvcHMuY29tbWVudClcbiAgICAgICAgICAgICAgICAgICAgc2VxLmNvbW1lbnQgPSBwcm9wcy5jb21tZW50O1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5vZGUgPSB2YWx1ZVxuICAgICAgICAgICAgPyBjb21wb3NlTm9kZShjdHgsIHZhbHVlLCBwcm9wcywgb25FcnJvcilcbiAgICAgICAgICAgIDogY29tcG9zZUVtcHR5Tm9kZShjdHgsIHByb3BzLmVuZCwgc3RhcnQsIG51bGwsIHByb3BzLCBvbkVycm9yKTtcbiAgICAgICAgaWYgKGN0eC5zY2hlbWEuY29tcGF0KVxuICAgICAgICAgICAgdXRpbEZsb3dJbmRlbnRDaGVjay5mbG93SW5kZW50Q2hlY2soYnMuaW5kZW50LCB2YWx1ZSwgb25FcnJvcik7XG4gICAgICAgIG9mZnNldCA9IG5vZGUucmFuZ2VbMl07XG4gICAgICAgIHNlcS5pdGVtcy5wdXNoKG5vZGUpO1xuICAgIH1cbiAgICBzZXEucmFuZ2UgPSBbYnMub2Zmc2V0LCBvZmZzZXQsIGNvbW1lbnRFbmQgPz8gb2Zmc2V0XTtcbiAgICByZXR1cm4gc2VxO1xufVxuXG5leHBvcnRzLnJlc29sdmVCbG9ja1NlcSA9IHJlc29sdmVCbG9ja1NlcTtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiByZXNvbHZlRW5kKGVuZCwgb2Zmc2V0LCByZXFTcGFjZSwgb25FcnJvcikge1xuICAgIGxldCBjb21tZW50ID0gJyc7XG4gICAgaWYgKGVuZCkge1xuICAgICAgICBsZXQgaGFzU3BhY2UgPSBmYWxzZTtcbiAgICAgICAgbGV0IHNlcCA9ICcnO1xuICAgICAgICBmb3IgKGNvbnN0IHRva2VuIG9mIGVuZCkge1xuICAgICAgICAgICAgY29uc3QgeyBzb3VyY2UsIHR5cGUgfSA9IHRva2VuO1xuICAgICAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgICAgICAgICBoYXNTcGFjZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2NvbW1lbnQnOiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXFTcGFjZSAmJiAhaGFzU3BhY2UpXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnTUlTU0lOR19DSEFSJywgJ0NvbW1lbnRzIG11c3QgYmUgc2VwYXJhdGVkIGZyb20gb3RoZXIgdG9rZW5zIGJ5IHdoaXRlIHNwYWNlIGNoYXJhY3RlcnMnKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2IgPSBzb3VyY2Uuc3Vic3RyaW5nKDEpIHx8ICcgJztcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjb21tZW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgY29tbWVudCA9IGNiO1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21tZW50ICs9IHNlcCArIGNiO1xuICAgICAgICAgICAgICAgICAgICBzZXAgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgICAgICBpZiAoY29tbWVudClcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlcCArPSBzb3VyY2U7XG4gICAgICAgICAgICAgICAgICAgIGhhc1NwYWNlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcih0b2tlbiwgJ1VORVhQRUNURURfVE9LRU4nLCBgVW5leHBlY3RlZCAke3R5cGV9IGF0IG5vZGUgZW5kYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvZmZzZXQgKz0gc291cmNlLmxlbmd0aDtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4geyBjb21tZW50LCBvZmZzZXQgfTtcbn1cblxuZXhwb3J0cy5yZXNvbHZlRW5kID0gcmVzb2x2ZUVuZDtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuLi9ub2Rlcy9pZGVudGl0eS5qcycpO1xudmFyIFBhaXIgPSByZXF1aXJlKCcuLi9ub2Rlcy9QYWlyLmpzJyk7XG52YXIgWUFNTE1hcCA9IHJlcXVpcmUoJy4uL25vZGVzL1lBTUxNYXAuanMnKTtcbnZhciBZQU1MU2VxID0gcmVxdWlyZSgnLi4vbm9kZXMvWUFNTFNlcS5qcycpO1xudmFyIHJlc29sdmVFbmQgPSByZXF1aXJlKCcuL3Jlc29sdmUtZW5kLmpzJyk7XG52YXIgcmVzb2x2ZVByb3BzID0gcmVxdWlyZSgnLi9yZXNvbHZlLXByb3BzLmpzJyk7XG52YXIgdXRpbENvbnRhaW5zTmV3bGluZSA9IHJlcXVpcmUoJy4vdXRpbC1jb250YWlucy1uZXdsaW5lLmpzJyk7XG52YXIgdXRpbE1hcEluY2x1ZGVzID0gcmVxdWlyZSgnLi91dGlsLW1hcC1pbmNsdWRlcy5qcycpO1xuXG5jb25zdCBibG9ja01zZyA9ICdCbG9jayBjb2xsZWN0aW9ucyBhcmUgbm90IGFsbG93ZWQgd2l0aGluIGZsb3cgY29sbGVjdGlvbnMnO1xuY29uc3QgaXNCbG9jayA9ICh0b2tlbikgPT4gdG9rZW4gJiYgKHRva2VuLnR5cGUgPT09ICdibG9jay1tYXAnIHx8IHRva2VuLnR5cGUgPT09ICdibG9jay1zZXEnKTtcbmZ1bmN0aW9uIHJlc29sdmVGbG93Q29sbGVjdGlvbih7IGNvbXBvc2VOb2RlLCBjb21wb3NlRW1wdHlOb2RlIH0sIGN0eCwgZmMsIG9uRXJyb3IsIHRhZykge1xuICAgIGNvbnN0IGlzTWFwID0gZmMuc3RhcnQuc291cmNlID09PSAneyc7XG4gICAgY29uc3QgZmNOYW1lID0gaXNNYXAgPyAnZmxvdyBtYXAnIDogJ2Zsb3cgc2VxdWVuY2UnO1xuICAgIGNvbnN0IE5vZGVDbGFzcyA9ICh0YWc/Lm5vZGVDbGFzcyA/PyAoaXNNYXAgPyBZQU1MTWFwLllBTUxNYXAgOiBZQU1MU2VxLllBTUxTZXEpKTtcbiAgICBjb25zdCBjb2xsID0gbmV3IE5vZGVDbGFzcyhjdHguc2NoZW1hKTtcbiAgICBjb2xsLmZsb3cgPSB0cnVlO1xuICAgIGNvbnN0IGF0Um9vdCA9IGN0eC5hdFJvb3Q7XG4gICAgaWYgKGF0Um9vdClcbiAgICAgICAgY3R4LmF0Um9vdCA9IGZhbHNlO1xuICAgIGlmIChjdHguYXRLZXkpXG4gICAgICAgIGN0eC5hdEtleSA9IGZhbHNlO1xuICAgIGxldCBvZmZzZXQgPSBmYy5vZmZzZXQgKyBmYy5zdGFydC5zb3VyY2UubGVuZ3RoO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZmMuaXRlbXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgY29uc3QgY29sbEl0ZW0gPSBmYy5pdGVtc1tpXTtcbiAgICAgICAgY29uc3QgeyBzdGFydCwga2V5LCBzZXAsIHZhbHVlIH0gPSBjb2xsSXRlbTtcbiAgICAgICAgY29uc3QgcHJvcHMgPSByZXNvbHZlUHJvcHMucmVzb2x2ZVByb3BzKHN0YXJ0LCB7XG4gICAgICAgICAgICBmbG93OiBmY05hbWUsXG4gICAgICAgICAgICBpbmRpY2F0b3I6ICdleHBsaWNpdC1rZXktaW5kJyxcbiAgICAgICAgICAgIG5leHQ6IGtleSA/PyBzZXA/LlswXSxcbiAgICAgICAgICAgIG9mZnNldCxcbiAgICAgICAgICAgIG9uRXJyb3IsXG4gICAgICAgICAgICBwYXJlbnRJbmRlbnQ6IGZjLmluZGVudCxcbiAgICAgICAgICAgIHN0YXJ0T25OZXdsaW5lOiBmYWxzZVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCFwcm9wcy5mb3VuZCkge1xuICAgICAgICAgICAgaWYgKCFwcm9wcy5hbmNob3IgJiYgIXByb3BzLnRhZyAmJiAhc2VwICYmICF2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmIChpID09PSAwICYmIHByb3BzLmNvbW1hKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHByb3BzLmNvbW1hLCAnVU5FWFBFQ1RFRF9UT0tFTicsIGBVbmV4cGVjdGVkICwgaW4gJHtmY05hbWV9YCk7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaSA8IGZjLml0ZW1zLmxlbmd0aCAtIDEpXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IocHJvcHMuc3RhcnQsICdVTkVYUEVDVEVEX1RPS0VOJywgYFVuZXhwZWN0ZWQgZW1wdHkgaXRlbSBpbiAke2ZjTmFtZX1gKTtcbiAgICAgICAgICAgICAgICBpZiAocHJvcHMuY29tbWVudCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29sbC5jb21tZW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgY29sbC5jb21tZW50ICs9ICdcXG4nICsgcHJvcHMuY29tbWVudDtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgY29sbC5jb21tZW50ID0gcHJvcHMuY29tbWVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgb2Zmc2V0ID0gcHJvcHMuZW5kO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFpc01hcCAmJiBjdHgub3B0aW9ucy5zdHJpY3QgJiYgdXRpbENvbnRhaW5zTmV3bGluZS5jb250YWluc05ld2xpbmUoa2V5KSlcbiAgICAgICAgICAgICAgICBvbkVycm9yKGtleSwgLy8gY2hlY2tlZCBieSBjb250YWluc05ld2xpbmUoKVxuICAgICAgICAgICAgICAgICdNVUxUSUxJTkVfSU1QTElDSVRfS0VZJywgJ0ltcGxpY2l0IGtleXMgb2YgZmxvdyBzZXF1ZW5jZSBwYWlycyBuZWVkIHRvIGJlIG9uIGEgc2luZ2xlIGxpbmUnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaSA9PT0gMCkge1xuICAgICAgICAgICAgaWYgKHByb3BzLmNvbW1hKVxuICAgICAgICAgICAgICAgIG9uRXJyb3IocHJvcHMuY29tbWEsICdVTkVYUEVDVEVEX1RPS0VOJywgYFVuZXhwZWN0ZWQgLCBpbiAke2ZjTmFtZX1gKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmICghcHJvcHMuY29tbWEpXG4gICAgICAgICAgICAgICAgb25FcnJvcihwcm9wcy5zdGFydCwgJ01JU1NJTkdfQ0hBUicsIGBNaXNzaW5nICwgYmV0d2VlbiAke2ZjTmFtZX0gaXRlbXNgKTtcbiAgICAgICAgICAgIGlmIChwcm9wcy5jb21tZW50KSB7XG4gICAgICAgICAgICAgICAgbGV0IHByZXZJdGVtQ29tbWVudCA9ICcnO1xuICAgICAgICAgICAgICAgIGxvb3A6IGZvciAoY29uc3Qgc3Qgb2Ygc3RhcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChzdC50eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdjb21tYSc6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmV2SXRlbUNvbW1lbnQgPSBzdC5zb3VyY2Uuc3Vic3RyaW5nKDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrIGxvb3A7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrIGxvb3A7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHByZXZJdGVtQ29tbWVudCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcHJldiA9IGNvbGwuaXRlbXNbY29sbC5pdGVtcy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlkZW50aXR5LmlzUGFpcihwcmV2KSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXYgPSBwcmV2LnZhbHVlID8/IHByZXYua2V5O1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJldi5jb21tZW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldi5jb21tZW50ICs9ICdcXG4nICsgcHJldkl0ZW1Db21tZW50O1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2LmNvbW1lbnQgPSBwcmV2SXRlbUNvbW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgIHByb3BzLmNvbW1lbnQgPSBwcm9wcy5jb21tZW50LnN1YnN0cmluZyhwcmV2SXRlbUNvbW1lbnQubGVuZ3RoICsgMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghaXNNYXAgJiYgIXNlcCAmJiAhcHJvcHMuZm91bmQpIHtcbiAgICAgICAgICAgIC8vIGl0ZW0gaXMgYSB2YWx1ZSBpbiBhIHNlcVxuICAgICAgICAgICAgLy8g4oaSIGtleSAmIHNlcCBhcmUgZW1wdHksIHN0YXJ0IGRvZXMgbm90IGluY2x1ZGUgPyBvciA6XG4gICAgICAgICAgICBjb25zdCB2YWx1ZU5vZGUgPSB2YWx1ZVxuICAgICAgICAgICAgICAgID8gY29tcG9zZU5vZGUoY3R4LCB2YWx1ZSwgcHJvcHMsIG9uRXJyb3IpXG4gICAgICAgICAgICAgICAgOiBjb21wb3NlRW1wdHlOb2RlKGN0eCwgcHJvcHMuZW5kLCBzZXAsIG51bGwsIHByb3BzLCBvbkVycm9yKTtcbiAgICAgICAgICAgIGNvbGwuaXRlbXMucHVzaCh2YWx1ZU5vZGUpO1xuICAgICAgICAgICAgb2Zmc2V0ID0gdmFsdWVOb2RlLnJhbmdlWzJdO1xuICAgICAgICAgICAgaWYgKGlzQmxvY2sodmFsdWUpKVxuICAgICAgICAgICAgICAgIG9uRXJyb3IodmFsdWVOb2RlLnJhbmdlLCAnQkxPQ0tfSU5fRkxPVycsIGJsb2NrTXNnKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIGl0ZW0gaXMgYSBrZXkrdmFsdWUgcGFpclxuICAgICAgICAgICAgLy8ga2V5IHZhbHVlXG4gICAgICAgICAgICBjdHguYXRLZXkgPSB0cnVlO1xuICAgICAgICAgICAgY29uc3Qga2V5U3RhcnQgPSBwcm9wcy5lbmQ7XG4gICAgICAgICAgICBjb25zdCBrZXlOb2RlID0ga2V5XG4gICAgICAgICAgICAgICAgPyBjb21wb3NlTm9kZShjdHgsIGtleSwgcHJvcHMsIG9uRXJyb3IpXG4gICAgICAgICAgICAgICAgOiBjb21wb3NlRW1wdHlOb2RlKGN0eCwga2V5U3RhcnQsIHN0YXJ0LCBudWxsLCBwcm9wcywgb25FcnJvcik7XG4gICAgICAgICAgICBpZiAoaXNCbG9jayhrZXkpKVxuICAgICAgICAgICAgICAgIG9uRXJyb3Ioa2V5Tm9kZS5yYW5nZSwgJ0JMT0NLX0lOX0ZMT1cnLCBibG9ja01zZyk7XG4gICAgICAgICAgICBjdHguYXRLZXkgPSBmYWxzZTtcbiAgICAgICAgICAgIC8vIHZhbHVlIHByb3BlcnRpZXNcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlUHJvcHMgPSByZXNvbHZlUHJvcHMucmVzb2x2ZVByb3BzKHNlcCA/PyBbXSwge1xuICAgICAgICAgICAgICAgIGZsb3c6IGZjTmFtZSxcbiAgICAgICAgICAgICAgICBpbmRpY2F0b3I6ICdtYXAtdmFsdWUtaW5kJyxcbiAgICAgICAgICAgICAgICBuZXh0OiB2YWx1ZSxcbiAgICAgICAgICAgICAgICBvZmZzZXQ6IGtleU5vZGUucmFuZ2VbMl0sXG4gICAgICAgICAgICAgICAgb25FcnJvcixcbiAgICAgICAgICAgICAgICBwYXJlbnRJbmRlbnQ6IGZjLmluZGVudCxcbiAgICAgICAgICAgICAgICBzdGFydE9uTmV3bGluZTogZmFsc2VcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHZhbHVlUHJvcHMuZm91bmQpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWlzTWFwICYmICFwcm9wcy5mb3VuZCAmJiBjdHgub3B0aW9ucy5zdHJpY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlcClcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgc3Qgb2Ygc2VwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0ID09PSB2YWx1ZVByb3BzLmZvdW5kKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3QudHlwZSA9PT0gJ25ld2xpbmUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uRXJyb3Ioc3QsICdNVUxUSUxJTkVfSU1QTElDSVRfS0VZJywgJ0ltcGxpY2l0IGtleXMgb2YgZmxvdyBzZXF1ZW5jZSBwYWlycyBuZWVkIHRvIGJlIG9uIGEgc2luZ2xlIGxpbmUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAocHJvcHMuc3RhcnQgPCB2YWx1ZVByb3BzLmZvdW5kLm9mZnNldCAtIDEwMjQpXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHZhbHVlUHJvcHMuZm91bmQsICdLRVlfT1ZFUl8xMDI0X0NIQVJTJywgJ1RoZSA6IGluZGljYXRvciBtdXN0IGJlIGF0IG1vc3QgMTAyNCBjaGFycyBhZnRlciB0aGUgc3RhcnQgb2YgYW4gaW1wbGljaXQgZmxvdyBzZXF1ZW5jZSBrZXknKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmICgnc291cmNlJyBpbiB2YWx1ZSAmJiB2YWx1ZS5zb3VyY2U/LlswXSA9PT0gJzonKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHZhbHVlLCAnTUlTU0lOR19DSEFSJywgYE1pc3Npbmcgc3BhY2UgYWZ0ZXIgOiBpbiAke2ZjTmFtZX1gKTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IodmFsdWVQcm9wcy5zdGFydCwgJ01JU1NJTkdfQ0hBUicsIGBNaXNzaW5nICwgb3IgOiBiZXR3ZWVuICR7ZmNOYW1lfSBpdGVtc2ApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gdmFsdWUgdmFsdWVcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlTm9kZSA9IHZhbHVlXG4gICAgICAgICAgICAgICAgPyBjb21wb3NlTm9kZShjdHgsIHZhbHVlLCB2YWx1ZVByb3BzLCBvbkVycm9yKVxuICAgICAgICAgICAgICAgIDogdmFsdWVQcm9wcy5mb3VuZFxuICAgICAgICAgICAgICAgICAgICA/IGNvbXBvc2VFbXB0eU5vZGUoY3R4LCB2YWx1ZVByb3BzLmVuZCwgc2VwLCBudWxsLCB2YWx1ZVByb3BzLCBvbkVycm9yKVxuICAgICAgICAgICAgICAgICAgICA6IG51bGw7XG4gICAgICAgICAgICBpZiAodmFsdWVOb2RlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzQmxvY2sodmFsdWUpKVxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKHZhbHVlTm9kZS5yYW5nZSwgJ0JMT0NLX0lOX0ZMT1cnLCBibG9ja01zZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh2YWx1ZVByb3BzLmNvbW1lbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoa2V5Tm9kZS5jb21tZW50KVxuICAgICAgICAgICAgICAgICAgICBrZXlOb2RlLmNvbW1lbnQgKz0gJ1xcbicgKyB2YWx1ZVByb3BzLmNvbW1lbnQ7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBrZXlOb2RlLmNvbW1lbnQgPSB2YWx1ZVByb3BzLmNvbW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBwYWlyID0gbmV3IFBhaXIuUGFpcihrZXlOb2RlLCB2YWx1ZU5vZGUpO1xuICAgICAgICAgICAgaWYgKGN0eC5vcHRpb25zLmtlZXBTb3VyY2VUb2tlbnMpXG4gICAgICAgICAgICAgICAgcGFpci5zcmNUb2tlbiA9IGNvbGxJdGVtO1xuICAgICAgICAgICAgaWYgKGlzTWFwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWFwID0gY29sbDtcbiAgICAgICAgICAgICAgICBpZiAodXRpbE1hcEluY2x1ZGVzLm1hcEluY2x1ZGVzKGN0eCwgbWFwLml0ZW1zLCBrZXlOb2RlKSlcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcihrZXlTdGFydCwgJ0RVUExJQ0FURV9LRVknLCAnTWFwIGtleXMgbXVzdCBiZSB1bmlxdWUnKTtcbiAgICAgICAgICAgICAgICBtYXAuaXRlbXMucHVzaChwYWlyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1hcCA9IG5ldyBZQU1MTWFwLllBTUxNYXAoY3R4LnNjaGVtYSk7XG4gICAgICAgICAgICAgICAgbWFwLmZsb3cgPSB0cnVlO1xuICAgICAgICAgICAgICAgIG1hcC5pdGVtcy5wdXNoKHBhaXIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGVuZFJhbmdlID0gKHZhbHVlTm9kZSA/PyBrZXlOb2RlKS5yYW5nZTtcbiAgICAgICAgICAgICAgICBtYXAucmFuZ2UgPSBba2V5Tm9kZS5yYW5nZVswXSwgZW5kUmFuZ2VbMV0sIGVuZFJhbmdlWzJdXTtcbiAgICAgICAgICAgICAgICBjb2xsLml0ZW1zLnB1c2gobWFwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9mZnNldCA9IHZhbHVlTm9kZSA/IHZhbHVlTm9kZS5yYW5nZVsyXSA6IHZhbHVlUHJvcHMuZW5kO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGV4cGVjdGVkRW5kID0gaXNNYXAgPyAnfScgOiAnXSc7XG4gICAgY29uc3QgW2NlLCAuLi5lZV0gPSBmYy5lbmQ7XG4gICAgbGV0IGNlUG9zID0gb2Zmc2V0O1xuICAgIGlmIChjZT8uc291cmNlID09PSBleHBlY3RlZEVuZClcbiAgICAgICAgY2VQb3MgPSBjZS5vZmZzZXQgKyBjZS5zb3VyY2UubGVuZ3RoO1xuICAgIGVsc2Uge1xuICAgICAgICBjb25zdCBuYW1lID0gZmNOYW1lWzBdLnRvVXBwZXJDYXNlKCkgKyBmY05hbWUuc3Vic3RyaW5nKDEpO1xuICAgICAgICBjb25zdCBtc2cgPSBhdFJvb3RcbiAgICAgICAgICAgID8gYCR7bmFtZX0gbXVzdCBlbmQgd2l0aCBhICR7ZXhwZWN0ZWRFbmR9YFxuICAgICAgICAgICAgOiBgJHtuYW1lfSBpbiBibG9jayBjb2xsZWN0aW9uIG11c3QgYmUgc3VmZmljaWVudGx5IGluZGVudGVkIGFuZCBlbmQgd2l0aCBhICR7ZXhwZWN0ZWRFbmR9YDtcbiAgICAgICAgb25FcnJvcihvZmZzZXQsIGF0Um9vdCA/ICdNSVNTSU5HX0NIQVInIDogJ0JBRF9JTkRFTlQnLCBtc2cpO1xuICAgICAgICBpZiAoY2UgJiYgY2Uuc291cmNlLmxlbmd0aCAhPT0gMSlcbiAgICAgICAgICAgIGVlLnVuc2hpZnQoY2UpO1xuICAgIH1cbiAgICBpZiAoZWUubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBlbmQgPSByZXNvbHZlRW5kLnJlc29sdmVFbmQoZWUsIGNlUG9zLCBjdHgub3B0aW9ucy5zdHJpY3QsIG9uRXJyb3IpO1xuICAgICAgICBpZiAoZW5kLmNvbW1lbnQpIHtcbiAgICAgICAgICAgIGlmIChjb2xsLmNvbW1lbnQpXG4gICAgICAgICAgICAgICAgY29sbC5jb21tZW50ICs9ICdcXG4nICsgZW5kLmNvbW1lbnQ7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgY29sbC5jb21tZW50ID0gZW5kLmNvbW1lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgY29sbC5yYW5nZSA9IFtmYy5vZmZzZXQsIGNlUG9zLCBlbmQub2Zmc2V0XTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNvbGwucmFuZ2UgPSBbZmMub2Zmc2V0LCBjZVBvcywgY2VQb3NdO1xuICAgIH1cbiAgICByZXR1cm4gY29sbDtcbn1cblxuZXhwb3J0cy5yZXNvbHZlRmxvd0NvbGxlY3Rpb24gPSByZXNvbHZlRmxvd0NvbGxlY3Rpb247XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIGlkZW50aXR5ID0gcmVxdWlyZSgnLi4vbm9kZXMvaWRlbnRpdHkuanMnKTtcbnZhciBTY2FsYXIgPSByZXF1aXJlKCcuLi9ub2Rlcy9TY2FsYXIuanMnKTtcbnZhciBZQU1MTWFwID0gcmVxdWlyZSgnLi4vbm9kZXMvWUFNTE1hcC5qcycpO1xudmFyIFlBTUxTZXEgPSByZXF1aXJlKCcuLi9ub2Rlcy9ZQU1MU2VxLmpzJyk7XG52YXIgcmVzb2x2ZUJsb2NrTWFwID0gcmVxdWlyZSgnLi9yZXNvbHZlLWJsb2NrLW1hcC5qcycpO1xudmFyIHJlc29sdmVCbG9ja1NlcSA9IHJlcXVpcmUoJy4vcmVzb2x2ZS1ibG9jay1zZXEuanMnKTtcbnZhciByZXNvbHZlRmxvd0NvbGxlY3Rpb24gPSByZXF1aXJlKCcuL3Jlc29sdmUtZmxvdy1jb2xsZWN0aW9uLmpzJyk7XG5cbmZ1bmN0aW9uIHJlc29sdmVDb2xsZWN0aW9uKENOLCBjdHgsIHRva2VuLCBvbkVycm9yLCB0YWdOYW1lLCB0YWcpIHtcbiAgICBjb25zdCBjb2xsID0gdG9rZW4udHlwZSA9PT0gJ2Jsb2NrLW1hcCdcbiAgICAgICAgPyByZXNvbHZlQmxvY2tNYXAucmVzb2x2ZUJsb2NrTWFwKENOLCBjdHgsIHRva2VuLCBvbkVycm9yLCB0YWcpXG4gICAgICAgIDogdG9rZW4udHlwZSA9PT0gJ2Jsb2NrLXNlcSdcbiAgICAgICAgICAgID8gcmVzb2x2ZUJsb2NrU2VxLnJlc29sdmVCbG9ja1NlcShDTiwgY3R4LCB0b2tlbiwgb25FcnJvciwgdGFnKVxuICAgICAgICAgICAgOiByZXNvbHZlRmxvd0NvbGxlY3Rpb24ucmVzb2x2ZUZsb3dDb2xsZWN0aW9uKENOLCBjdHgsIHRva2VuLCBvbkVycm9yLCB0YWcpO1xuICAgIGNvbnN0IENvbGwgPSBjb2xsLmNvbnN0cnVjdG9yO1xuICAgIC8vIElmIHdlIGdvdCBhIHRhZ05hbWUgbWF0Y2hpbmcgdGhlIGNsYXNzLCBvciB0aGUgdGFnIG5hbWUgaXMgJyEnLFxuICAgIC8vIHRoZW4gdXNlIHRoZSB0YWdOYW1lIGZyb20gdGhlIG5vZGUgY2xhc3MgdXNlZCB0byBjcmVhdGUgaXQuXG4gICAgaWYgKHRhZ05hbWUgPT09ICchJyB8fCB0YWdOYW1lID09PSBDb2xsLnRhZ05hbWUpIHtcbiAgICAgICAgY29sbC50YWcgPSBDb2xsLnRhZ05hbWU7XG4gICAgICAgIHJldHVybiBjb2xsO1xuICAgIH1cbiAgICBpZiAodGFnTmFtZSlcbiAgICAgICAgY29sbC50YWcgPSB0YWdOYW1lO1xuICAgIHJldHVybiBjb2xsO1xufVxuZnVuY3Rpb24gY29tcG9zZUNvbGxlY3Rpb24oQ04sIGN0eCwgdG9rZW4sIHByb3BzLCBvbkVycm9yKSB7XG4gICAgY29uc3QgdGFnVG9rZW4gPSBwcm9wcy50YWc7XG4gICAgY29uc3QgdGFnTmFtZSA9ICF0YWdUb2tlblxuICAgICAgICA/IG51bGxcbiAgICAgICAgOiBjdHguZGlyZWN0aXZlcy50YWdOYW1lKHRhZ1Rva2VuLnNvdXJjZSwgbXNnID0+IG9uRXJyb3IodGFnVG9rZW4sICdUQUdfUkVTT0xWRV9GQUlMRUQnLCBtc2cpKTtcbiAgICBpZiAodG9rZW4udHlwZSA9PT0gJ2Jsb2NrLXNlcScpIHtcbiAgICAgICAgY29uc3QgeyBhbmNob3IsIG5ld2xpbmVBZnRlclByb3A6IG5sIH0gPSBwcm9wcztcbiAgICAgICAgY29uc3QgbGFzdFByb3AgPSBhbmNob3IgJiYgdGFnVG9rZW5cbiAgICAgICAgICAgID8gYW5jaG9yLm9mZnNldCA+IHRhZ1Rva2VuLm9mZnNldFxuICAgICAgICAgICAgICAgID8gYW5jaG9yXG4gICAgICAgICAgICAgICAgOiB0YWdUb2tlblxuICAgICAgICAgICAgOiAoYW5jaG9yID8/IHRhZ1Rva2VuKTtcbiAgICAgICAgaWYgKGxhc3RQcm9wICYmICghbmwgfHwgbmwub2Zmc2V0IDwgbGFzdFByb3Aub2Zmc2V0KSkge1xuICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9ICdNaXNzaW5nIG5ld2xpbmUgYWZ0ZXIgYmxvY2sgc2VxdWVuY2UgcHJvcHMnO1xuICAgICAgICAgICAgb25FcnJvcihsYXN0UHJvcCwgJ01JU1NJTkdfQ0hBUicsIG1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGV4cFR5cGUgPSB0b2tlbi50eXBlID09PSAnYmxvY2stbWFwJ1xuICAgICAgICA/ICdtYXAnXG4gICAgICAgIDogdG9rZW4udHlwZSA9PT0gJ2Jsb2NrLXNlcSdcbiAgICAgICAgICAgID8gJ3NlcSdcbiAgICAgICAgICAgIDogdG9rZW4uc3RhcnQuc291cmNlID09PSAneydcbiAgICAgICAgICAgICAgICA/ICdtYXAnXG4gICAgICAgICAgICAgICAgOiAnc2VxJztcbiAgICAvLyBzaG9ydGN1dDogY2hlY2sgaWYgaXQncyBhIGdlbmVyaWMgWUFNTE1hcCBvciBZQU1MU2VxXG4gICAgLy8gYmVmb3JlIGp1bXBpbmcgaW50byB0aGUgY3VzdG9tIHRhZyBsb2dpYy5cbiAgICBpZiAoIXRhZ1Rva2VuIHx8XG4gICAgICAgICF0YWdOYW1lIHx8XG4gICAgICAgIHRhZ05hbWUgPT09ICchJyB8fFxuICAgICAgICAodGFnTmFtZSA9PT0gWUFNTE1hcC5ZQU1MTWFwLnRhZ05hbWUgJiYgZXhwVHlwZSA9PT0gJ21hcCcpIHx8XG4gICAgICAgICh0YWdOYW1lID09PSBZQU1MU2VxLllBTUxTZXEudGFnTmFtZSAmJiBleHBUeXBlID09PSAnc2VxJykpIHtcbiAgICAgICAgcmV0dXJuIHJlc29sdmVDb2xsZWN0aW9uKENOLCBjdHgsIHRva2VuLCBvbkVycm9yLCB0YWdOYW1lKTtcbiAgICB9XG4gICAgbGV0IHRhZyA9IGN0eC5zY2hlbWEudGFncy5maW5kKHQgPT4gdC50YWcgPT09IHRhZ05hbWUgJiYgdC5jb2xsZWN0aW9uID09PSBleHBUeXBlKTtcbiAgICBpZiAoIXRhZykge1xuICAgICAgICBjb25zdCBrdCA9IGN0eC5zY2hlbWEua25vd25UYWdzW3RhZ05hbWVdO1xuICAgICAgICBpZiAoa3Q/LmNvbGxlY3Rpb24gPT09IGV4cFR5cGUpIHtcbiAgICAgICAgICAgIGN0eC5zY2hlbWEudGFncy5wdXNoKE9iamVjdC5hc3NpZ24oe30sIGt0LCB7IGRlZmF1bHQ6IGZhbHNlIH0pKTtcbiAgICAgICAgICAgIHRhZyA9IGt0O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKGt0KSB7XG4gICAgICAgICAgICAgICAgb25FcnJvcih0YWdUb2tlbiwgJ0JBRF9DT0xMRUNUSU9OX1RZUEUnLCBgJHtrdC50YWd9IHVzZWQgZm9yICR7ZXhwVHlwZX0gY29sbGVjdGlvbiwgYnV0IGV4cGVjdHMgJHtrdC5jb2xsZWN0aW9uID8/ICdzY2FsYXInfWAsIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgb25FcnJvcih0YWdUb2tlbiwgJ1RBR19SRVNPTFZFX0ZBSUxFRCcsIGBVbnJlc29sdmVkIHRhZzogJHt0YWdOYW1lfWAsIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmVDb2xsZWN0aW9uKENOLCBjdHgsIHRva2VuLCBvbkVycm9yLCB0YWdOYW1lKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBjb2xsID0gcmVzb2x2ZUNvbGxlY3Rpb24oQ04sIGN0eCwgdG9rZW4sIG9uRXJyb3IsIHRhZ05hbWUsIHRhZyk7XG4gICAgY29uc3QgcmVzID0gdGFnLnJlc29sdmU/Lihjb2xsLCBtc2cgPT4gb25FcnJvcih0YWdUb2tlbiwgJ1RBR19SRVNPTFZFX0ZBSUxFRCcsIG1zZyksIGN0eC5vcHRpb25zKSA/PyBjb2xsO1xuICAgIGNvbnN0IG5vZGUgPSBpZGVudGl0eS5pc05vZGUocmVzKVxuICAgICAgICA/IHJlc1xuICAgICAgICA6IG5ldyBTY2FsYXIuU2NhbGFyKHJlcyk7XG4gICAgbm9kZS5yYW5nZSA9IGNvbGwucmFuZ2U7XG4gICAgbm9kZS50YWcgPSB0YWdOYW1lO1xuICAgIGlmICh0YWc/LmZvcm1hdClcbiAgICAgICAgbm9kZS5mb3JtYXQgPSB0YWcuZm9ybWF0O1xuICAgIHJldHVybiBub2RlO1xufVxuXG5leHBvcnRzLmNvbXBvc2VDb2xsZWN0aW9uID0gY29tcG9zZUNvbGxlY3Rpb247XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIFNjYWxhciA9IHJlcXVpcmUoJy4uL25vZGVzL1NjYWxhci5qcycpO1xuXG5mdW5jdGlvbiByZXNvbHZlQmxvY2tTY2FsYXIoY3R4LCBzY2FsYXIsIG9uRXJyb3IpIHtcbiAgICBjb25zdCBzdGFydCA9IHNjYWxhci5vZmZzZXQ7XG4gICAgY29uc3QgaGVhZGVyID0gcGFyc2VCbG9ja1NjYWxhckhlYWRlcihzY2FsYXIsIGN0eC5vcHRpb25zLnN0cmljdCwgb25FcnJvcik7XG4gICAgaWYgKCFoZWFkZXIpXG4gICAgICAgIHJldHVybiB7IHZhbHVlOiAnJywgdHlwZTogbnVsbCwgY29tbWVudDogJycsIHJhbmdlOiBbc3RhcnQsIHN0YXJ0LCBzdGFydF0gfTtcbiAgICBjb25zdCB0eXBlID0gaGVhZGVyLm1vZGUgPT09ICc+JyA/IFNjYWxhci5TY2FsYXIuQkxPQ0tfRk9MREVEIDogU2NhbGFyLlNjYWxhci5CTE9DS19MSVRFUkFMO1xuICAgIGNvbnN0IGxpbmVzID0gc2NhbGFyLnNvdXJjZSA/IHNwbGl0TGluZXMoc2NhbGFyLnNvdXJjZSkgOiBbXTtcbiAgICAvLyBkZXRlcm1pbmUgdGhlIGVuZCBvZiBjb250ZW50ICYgc3RhcnQgb2YgY2hvbXBpbmdcbiAgICBsZXQgY2hvbXBTdGFydCA9IGxpbmVzLmxlbmd0aDtcbiAgICBmb3IgKGxldCBpID0gbGluZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgY29uc3QgY29udGVudCA9IGxpbmVzW2ldWzFdO1xuICAgICAgICBpZiAoY29udGVudCA9PT0gJycgfHwgY29udGVudCA9PT0gJ1xccicpXG4gICAgICAgICAgICBjaG9tcFN0YXJ0ID0gaTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIC8vIHNob3J0Y3V0IGZvciBlbXB0eSBjb250ZW50c1xuICAgIGlmIChjaG9tcFN0YXJ0ID09PSAwKSB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gaGVhZGVyLmNob21wID09PSAnKycgJiYgbGluZXMubGVuZ3RoID4gMFxuICAgICAgICAgICAgPyAnXFxuJy5yZXBlYXQoTWF0aC5tYXgoMSwgbGluZXMubGVuZ3RoIC0gMSkpXG4gICAgICAgICAgICA6ICcnO1xuICAgICAgICBsZXQgZW5kID0gc3RhcnQgKyBoZWFkZXIubGVuZ3RoO1xuICAgICAgICBpZiAoc2NhbGFyLnNvdXJjZSlcbiAgICAgICAgICAgIGVuZCArPSBzY2FsYXIuc291cmNlLmxlbmd0aDtcbiAgICAgICAgcmV0dXJuIHsgdmFsdWUsIHR5cGUsIGNvbW1lbnQ6IGhlYWRlci5jb21tZW50LCByYW5nZTogW3N0YXJ0LCBlbmQsIGVuZF0gfTtcbiAgICB9XG4gICAgLy8gZmluZCB0aGUgaW5kZW50YXRpb24gbGV2ZWwgdG8gdHJpbSBmcm9tIHN0YXJ0XG4gICAgbGV0IHRyaW1JbmRlbnQgPSBzY2FsYXIuaW5kZW50ICsgaGVhZGVyLmluZGVudDtcbiAgICBsZXQgb2Zmc2V0ID0gc2NhbGFyLm9mZnNldCArIGhlYWRlci5sZW5ndGg7XG4gICAgbGV0IGNvbnRlbnRTdGFydCA9IDA7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaG9tcFN0YXJ0OyArK2kpIHtcbiAgICAgICAgY29uc3QgW2luZGVudCwgY29udGVudF0gPSBsaW5lc1tpXTtcbiAgICAgICAgaWYgKGNvbnRlbnQgPT09ICcnIHx8IGNvbnRlbnQgPT09ICdcXHInKSB7XG4gICAgICAgICAgICBpZiAoaGVhZGVyLmluZGVudCA9PT0gMCAmJiBpbmRlbnQubGVuZ3RoID4gdHJpbUluZGVudClcbiAgICAgICAgICAgICAgICB0cmltSW5kZW50ID0gaW5kZW50Lmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChpbmRlbnQubGVuZ3RoIDwgdHJpbUluZGVudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSAnQmxvY2sgc2NhbGFycyB3aXRoIG1vcmUtaW5kZW50ZWQgbGVhZGluZyBlbXB0eSBsaW5lcyBtdXN0IHVzZSBhbiBleHBsaWNpdCBpbmRlbnRhdGlvbiBpbmRpY2F0b3InO1xuICAgICAgICAgICAgICAgIG9uRXJyb3Iob2Zmc2V0ICsgaW5kZW50Lmxlbmd0aCwgJ01JU1NJTkdfQ0hBUicsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGhlYWRlci5pbmRlbnQgPT09IDApXG4gICAgICAgICAgICAgICAgdHJpbUluZGVudCA9IGluZGVudC5sZW5ndGg7XG4gICAgICAgICAgICBjb250ZW50U3RhcnQgPSBpO1xuICAgICAgICAgICAgaWYgKHRyaW1JbmRlbnQgPT09IDAgJiYgIWN0eC5hdFJvb3QpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gJ0Jsb2NrIHNjYWxhciB2YWx1ZXMgaW4gY29sbGVjdGlvbnMgbXVzdCBiZSBpbmRlbnRlZCc7XG4gICAgICAgICAgICAgICAgb25FcnJvcihvZmZzZXQsICdCQURfSU5ERU5UJywgbWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBvZmZzZXQgKz0gaW5kZW50Lmxlbmd0aCArIGNvbnRlbnQubGVuZ3RoICsgMTtcbiAgICB9XG4gICAgLy8gaW5jbHVkZSB0cmFpbGluZyBtb3JlLWluZGVudGVkIGVtcHR5IGxpbmVzIGluIGNvbnRlbnRcbiAgICBmb3IgKGxldCBpID0gbGluZXMubGVuZ3RoIC0gMTsgaSA+PSBjaG9tcFN0YXJ0OyAtLWkpIHtcbiAgICAgICAgaWYgKGxpbmVzW2ldWzBdLmxlbmd0aCA+IHRyaW1JbmRlbnQpXG4gICAgICAgICAgICBjaG9tcFN0YXJ0ID0gaSArIDE7XG4gICAgfVxuICAgIGxldCB2YWx1ZSA9ICcnO1xuICAgIGxldCBzZXAgPSAnJztcbiAgICBsZXQgcHJldk1vcmVJbmRlbnRlZCA9IGZhbHNlO1xuICAgIC8vIGxlYWRpbmcgd2hpdGVzcGFjZSBpcyBrZXB0IGludGFjdFxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29udGVudFN0YXJ0OyArK2kpXG4gICAgICAgIHZhbHVlICs9IGxpbmVzW2ldWzBdLnNsaWNlKHRyaW1JbmRlbnQpICsgJ1xcbic7XG4gICAgZm9yIChsZXQgaSA9IGNvbnRlbnRTdGFydDsgaSA8IGNob21wU3RhcnQ7ICsraSkge1xuICAgICAgICBsZXQgW2luZGVudCwgY29udGVudF0gPSBsaW5lc1tpXTtcbiAgICAgICAgb2Zmc2V0ICs9IGluZGVudC5sZW5ndGggKyBjb250ZW50Lmxlbmd0aCArIDE7XG4gICAgICAgIGNvbnN0IGNybGYgPSBjb250ZW50W2NvbnRlbnQubGVuZ3RoIC0gMV0gPT09ICdcXHInO1xuICAgICAgICBpZiAoY3JsZilcbiAgICAgICAgICAgIGNvbnRlbnQgPSBjb250ZW50LnNsaWNlKDAsIC0xKTtcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmIGFscmVhZHkgY2F1Z2h0IGluIGxleGVyICovXG4gICAgICAgIGlmIChjb250ZW50ICYmIGluZGVudC5sZW5ndGggPCB0cmltSW5kZW50KSB7XG4gICAgICAgICAgICBjb25zdCBzcmMgPSBoZWFkZXIuaW5kZW50XG4gICAgICAgICAgICAgICAgPyAnZXhwbGljaXQgaW5kZW50YXRpb24gaW5kaWNhdG9yJ1xuICAgICAgICAgICAgICAgIDogJ2ZpcnN0IGxpbmUnO1xuICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9IGBCbG9jayBzY2FsYXIgbGluZXMgbXVzdCBub3QgYmUgbGVzcyBpbmRlbnRlZCB0aGFuIHRoZWlyICR7c3JjfWA7XG4gICAgICAgICAgICBvbkVycm9yKG9mZnNldCAtIGNvbnRlbnQubGVuZ3RoIC0gKGNybGYgPyAyIDogMSksICdCQURfSU5ERU5UJywgbWVzc2FnZSk7XG4gICAgICAgICAgICBpbmRlbnQgPSAnJztcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZSA9PT0gU2NhbGFyLlNjYWxhci5CTE9DS19MSVRFUkFMKSB7XG4gICAgICAgICAgICB2YWx1ZSArPSBzZXAgKyBpbmRlbnQuc2xpY2UodHJpbUluZGVudCkgKyBjb250ZW50O1xuICAgICAgICAgICAgc2VwID0gJ1xcbic7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaW5kZW50Lmxlbmd0aCA+IHRyaW1JbmRlbnQgfHwgY29udGVudFswXSA9PT0gJ1xcdCcpIHtcbiAgICAgICAgICAgIC8vIG1vcmUtaW5kZW50ZWQgY29udGVudCB3aXRoaW4gYSBmb2xkZWQgYmxvY2tcbiAgICAgICAgICAgIGlmIChzZXAgPT09ICcgJylcbiAgICAgICAgICAgICAgICBzZXAgPSAnXFxuJztcbiAgICAgICAgICAgIGVsc2UgaWYgKCFwcmV2TW9yZUluZGVudGVkICYmIHNlcCA9PT0gJ1xcbicpXG4gICAgICAgICAgICAgICAgc2VwID0gJ1xcblxcbic7XG4gICAgICAgICAgICB2YWx1ZSArPSBzZXAgKyBpbmRlbnQuc2xpY2UodHJpbUluZGVudCkgKyBjb250ZW50O1xuICAgICAgICAgICAgc2VwID0gJ1xcbic7XG4gICAgICAgICAgICBwcmV2TW9yZUluZGVudGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjb250ZW50ID09PSAnJykge1xuICAgICAgICAgICAgLy8gZW1wdHkgbGluZVxuICAgICAgICAgICAgaWYgKHNlcCA9PT0gJ1xcbicpXG4gICAgICAgICAgICAgICAgdmFsdWUgKz0gJ1xcbic7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgc2VwID0gJ1xcbic7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2YWx1ZSArPSBzZXAgKyBjb250ZW50O1xuICAgICAgICAgICAgc2VwID0gJyAnO1xuICAgICAgICAgICAgcHJldk1vcmVJbmRlbnRlZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHN3aXRjaCAoaGVhZGVyLmNob21wKSB7XG4gICAgICAgIGNhc2UgJy0nOlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJysnOlxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IGNob21wU3RhcnQ7IGkgPCBsaW5lcy5sZW5ndGg7ICsraSlcbiAgICAgICAgICAgICAgICB2YWx1ZSArPSAnXFxuJyArIGxpbmVzW2ldWzBdLnNsaWNlKHRyaW1JbmRlbnQpO1xuICAgICAgICAgICAgaWYgKHZhbHVlW3ZhbHVlLmxlbmd0aCAtIDFdICE9PSAnXFxuJylcbiAgICAgICAgICAgICAgICB2YWx1ZSArPSAnXFxuJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdmFsdWUgKz0gJ1xcbic7XG4gICAgfVxuICAgIGNvbnN0IGVuZCA9IHN0YXJ0ICsgaGVhZGVyLmxlbmd0aCArIHNjYWxhci5zb3VyY2UubGVuZ3RoO1xuICAgIHJldHVybiB7IHZhbHVlLCB0eXBlLCBjb21tZW50OiBoZWFkZXIuY29tbWVudCwgcmFuZ2U6IFtzdGFydCwgZW5kLCBlbmRdIH07XG59XG5mdW5jdGlvbiBwYXJzZUJsb2NrU2NhbGFySGVhZGVyKHsgb2Zmc2V0LCBwcm9wcyB9LCBzdHJpY3QsIG9uRXJyb3IpIHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgc2hvdWxkIG5vdCBoYXBwZW4gKi9cbiAgICBpZiAocHJvcHNbMF0udHlwZSAhPT0gJ2Jsb2NrLXNjYWxhci1oZWFkZXInKSB7XG4gICAgICAgIG9uRXJyb3IocHJvcHNbMF0sICdJTVBPU1NJQkxFJywgJ0Jsb2NrIHNjYWxhciBoZWFkZXIgbm90IGZvdW5kJyk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCB7IHNvdXJjZSB9ID0gcHJvcHNbMF07XG4gICAgY29uc3QgbW9kZSA9IHNvdXJjZVswXTtcbiAgICBsZXQgaW5kZW50ID0gMDtcbiAgICBsZXQgY2hvbXAgPSAnJztcbiAgICBsZXQgZXJyb3IgPSAtMTtcbiAgICBmb3IgKGxldCBpID0gMTsgaSA8IHNvdXJjZS5sZW5ndGg7ICsraSkge1xuICAgICAgICBjb25zdCBjaCA9IHNvdXJjZVtpXTtcbiAgICAgICAgaWYgKCFjaG9tcCAmJiAoY2ggPT09ICctJyB8fCBjaCA9PT0gJysnKSlcbiAgICAgICAgICAgIGNob21wID0gY2g7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgbiA9IE51bWJlcihjaCk7XG4gICAgICAgICAgICBpZiAoIWluZGVudCAmJiBuKVxuICAgICAgICAgICAgICAgIGluZGVudCA9IG47XG4gICAgICAgICAgICBlbHNlIGlmIChlcnJvciA9PT0gLTEpXG4gICAgICAgICAgICAgICAgZXJyb3IgPSBvZmZzZXQgKyBpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChlcnJvciAhPT0gLTEpXG4gICAgICAgIG9uRXJyb3IoZXJyb3IsICdVTkVYUEVDVEVEX1RPS0VOJywgYEJsb2NrIHNjYWxhciBoZWFkZXIgaW5jbHVkZXMgZXh0cmEgY2hhcmFjdGVyczogJHtzb3VyY2V9YCk7XG4gICAgbGV0IGhhc1NwYWNlID0gZmFsc2U7XG4gICAgbGV0IGNvbW1lbnQgPSAnJztcbiAgICBsZXQgbGVuZ3RoID0gc291cmNlLmxlbmd0aDtcbiAgICBmb3IgKGxldCBpID0gMTsgaSA8IHByb3BzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGNvbnN0IHRva2VuID0gcHJvcHNbaV07XG4gICAgICAgIHN3aXRjaCAodG9rZW4udHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgICAgIGhhc1NwYWNlID0gdHJ1ZTtcbiAgICAgICAgICAgIC8vIGZhbGx0aHJvdWdoXG4gICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICBsZW5ndGggKz0gdG9rZW4uc291cmNlLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2NvbW1lbnQnOlxuICAgICAgICAgICAgICAgIGlmIChzdHJpY3QgJiYgIWhhc1NwYWNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSAnQ29tbWVudHMgbXVzdCBiZSBzZXBhcmF0ZWQgZnJvbSBvdGhlciB0b2tlbnMgYnkgd2hpdGUgc3BhY2UgY2hhcmFjdGVycyc7XG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdNSVNTSU5HX0NIQVInLCBtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbGVuZ3RoICs9IHRva2VuLnNvdXJjZS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgY29tbWVudCA9IHRva2VuLnNvdXJjZS5zdWJzdHJpbmcoMSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdlcnJvcic6XG4gICAgICAgICAgICAgICAgb25FcnJvcih0b2tlbiwgJ1VORVhQRUNURURfVE9LRU4nLCB0b2tlbi5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICBsZW5ndGggKz0gdG9rZW4uc291cmNlLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0IHNob3VsZCBub3QgaGFwcGVuICovXG4gICAgICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9IGBVbmV4cGVjdGVkIHRva2VuIGluIGJsb2NrIHNjYWxhciBoZWFkZXI6ICR7dG9rZW4udHlwZX1gO1xuICAgICAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdVTkVYUEVDVEVEX1RPS0VOJywgbWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgY29uc3QgdHMgPSB0b2tlbi5zb3VyY2U7XG4gICAgICAgICAgICAgICAgaWYgKHRzICYmIHR5cGVvZiB0cyA9PT0gJ3N0cmluZycpXG4gICAgICAgICAgICAgICAgICAgIGxlbmd0aCArPSB0cy5sZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHsgbW9kZSwgaW5kZW50LCBjaG9tcCwgY29tbWVudCwgbGVuZ3RoIH07XG59XG4vKiogQHJldHVybnMgQXJyYXkgb2YgbGluZXMgc3BsaXQgdXAgYXMgYFtpbmRlbnQsIGNvbnRlbnRdYCAqL1xuZnVuY3Rpb24gc3BsaXRMaW5lcyhzb3VyY2UpIHtcbiAgICBjb25zdCBzcGxpdCA9IHNvdXJjZS5zcGxpdCgvXFxuKCAqKS8pO1xuICAgIGNvbnN0IGZpcnN0ID0gc3BsaXRbMF07XG4gICAgY29uc3QgbSA9IGZpcnN0Lm1hdGNoKC9eKCAqKS8pO1xuICAgIGNvbnN0IGxpbmUwID0gbT8uWzFdXG4gICAgICAgID8gW21bMV0sIGZpcnN0LnNsaWNlKG1bMV0ubGVuZ3RoKV1cbiAgICAgICAgOiBbJycsIGZpcnN0XTtcbiAgICBjb25zdCBsaW5lcyA9IFtsaW5lMF07XG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPCBzcGxpdC5sZW5ndGg7IGkgKz0gMilcbiAgICAgICAgbGluZXMucHVzaChbc3BsaXRbaV0sIHNwbGl0W2kgKyAxXV0pO1xuICAgIHJldHVybiBsaW5lcztcbn1cblxuZXhwb3J0cy5yZXNvbHZlQmxvY2tTY2FsYXIgPSByZXNvbHZlQmxvY2tTY2FsYXI7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIFNjYWxhciA9IHJlcXVpcmUoJy4uL25vZGVzL1NjYWxhci5qcycpO1xudmFyIHJlc29sdmVFbmQgPSByZXF1aXJlKCcuL3Jlc29sdmUtZW5kLmpzJyk7XG5cbmZ1bmN0aW9uIHJlc29sdmVGbG93U2NhbGFyKHNjYWxhciwgc3RyaWN0LCBvbkVycm9yKSB7XG4gICAgY29uc3QgeyBvZmZzZXQsIHR5cGUsIHNvdXJjZSwgZW5kIH0gPSBzY2FsYXI7XG4gICAgbGV0IF90eXBlO1xuICAgIGxldCB2YWx1ZTtcbiAgICBjb25zdCBfb25FcnJvciA9IChyZWwsIGNvZGUsIG1zZykgPT4gb25FcnJvcihvZmZzZXQgKyByZWwsIGNvZGUsIG1zZyk7XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgIGNhc2UgJ3NjYWxhcic6XG4gICAgICAgICAgICBfdHlwZSA9IFNjYWxhci5TY2FsYXIuUExBSU47XG4gICAgICAgICAgICB2YWx1ZSA9IHBsYWluVmFsdWUoc291cmNlLCBfb25FcnJvcik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnc2luZ2xlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICAgICAgX3R5cGUgPSBTY2FsYXIuU2NhbGFyLlFVT1RFX1NJTkdMRTtcbiAgICAgICAgICAgIHZhbHVlID0gc2luZ2xlUXVvdGVkVmFsdWUoc291cmNlLCBfb25FcnJvcik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZG91YmxlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICAgICAgX3R5cGUgPSBTY2FsYXIuU2NhbGFyLlFVT1RFX0RPVUJMRTtcbiAgICAgICAgICAgIHZhbHVlID0gZG91YmxlUXVvdGVkVmFsdWUoc291cmNlLCBfb25FcnJvcik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgc2hvdWxkIG5vdCBoYXBwZW4gKi9cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIG9uRXJyb3Ioc2NhbGFyLCAnVU5FWFBFQ1RFRF9UT0tFTicsIGBFeHBlY3RlZCBhIGZsb3cgc2NhbGFyIHZhbHVlLCBidXQgZm91bmQ6ICR7dHlwZX1gKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdmFsdWU6ICcnLFxuICAgICAgICAgICAgICAgIHR5cGU6IG51bGwsXG4gICAgICAgICAgICAgICAgY29tbWVudDogJycsXG4gICAgICAgICAgICAgICAgcmFuZ2U6IFtvZmZzZXQsIG9mZnNldCArIHNvdXJjZS5sZW5ndGgsIG9mZnNldCArIHNvdXJjZS5sZW5ndGhdXG4gICAgICAgICAgICB9O1xuICAgIH1cbiAgICBjb25zdCB2YWx1ZUVuZCA9IG9mZnNldCArIHNvdXJjZS5sZW5ndGg7XG4gICAgY29uc3QgcmUgPSByZXNvbHZlRW5kLnJlc29sdmVFbmQoZW5kLCB2YWx1ZUVuZCwgc3RyaWN0LCBvbkVycm9yKTtcbiAgICByZXR1cm4ge1xuICAgICAgICB2YWx1ZSxcbiAgICAgICAgdHlwZTogX3R5cGUsXG4gICAgICAgIGNvbW1lbnQ6IHJlLmNvbW1lbnQsXG4gICAgICAgIHJhbmdlOiBbb2Zmc2V0LCB2YWx1ZUVuZCwgcmUub2Zmc2V0XVxuICAgIH07XG59XG5mdW5jdGlvbiBwbGFpblZhbHVlKHNvdXJjZSwgb25FcnJvcikge1xuICAgIGxldCBiYWRDaGFyID0gJyc7XG4gICAgc3dpdGNoIChzb3VyY2VbMF0pIHtcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgc2hvdWxkIG5vdCBoYXBwZW4gKi9cbiAgICAgICAgY2FzZSAnXFx0JzpcbiAgICAgICAgICAgIGJhZENoYXIgPSAnYSB0YWIgY2hhcmFjdGVyJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICcsJzpcbiAgICAgICAgICAgIGJhZENoYXIgPSAnZmxvdyBpbmRpY2F0b3IgY2hhcmFjdGVyICwnO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJyUnOlxuICAgICAgICAgICAgYmFkQ2hhciA9ICdkaXJlY3RpdmUgaW5kaWNhdG9yIGNoYXJhY3RlciAlJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICd8JzpcbiAgICAgICAgY2FzZSAnPic6IHtcbiAgICAgICAgICAgIGJhZENoYXIgPSBgYmxvY2sgc2NhbGFyIGluZGljYXRvciAke3NvdXJjZVswXX1gO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnQCc6XG4gICAgICAgIGNhc2UgJ2AnOiB7XG4gICAgICAgICAgICBiYWRDaGFyID0gYHJlc2VydmVkIGNoYXJhY3RlciAke3NvdXJjZVswXX1gO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGJhZENoYXIpXG4gICAgICAgIG9uRXJyb3IoMCwgJ0JBRF9TQ0FMQVJfU1RBUlQnLCBgUGxhaW4gdmFsdWUgY2Fubm90IHN0YXJ0IHdpdGggJHtiYWRDaGFyfWApO1xuICAgIHJldHVybiBmb2xkTGluZXMoc291cmNlKTtcbn1cbmZ1bmN0aW9uIHNpbmdsZVF1b3RlZFZhbHVlKHNvdXJjZSwgb25FcnJvcikge1xuICAgIGlmIChzb3VyY2Vbc291cmNlLmxlbmd0aCAtIDFdICE9PSBcIidcIiB8fCBzb3VyY2UubGVuZ3RoID09PSAxKVxuICAgICAgICBvbkVycm9yKHNvdXJjZS5sZW5ndGgsICdNSVNTSU5HX0NIQVInLCBcIk1pc3NpbmcgY2xvc2luZyAncXVvdGVcIik7XG4gICAgcmV0dXJuIGZvbGRMaW5lcyhzb3VyY2Uuc2xpY2UoMSwgLTEpKS5yZXBsYWNlKC8nJy9nLCBcIidcIik7XG59XG5mdW5jdGlvbiBmb2xkTGluZXMoc291cmNlKSB7XG4gICAgLyoqXG4gICAgICogVGhlIG5lZ2F0aXZlIGxvb2tiZWhpbmQgaGVyZSBhbmQgaW4gdGhlIGByZWAgUmVnRXhwIGlzIHRvXG4gICAgICogcHJldmVudCBjYXVzaW5nIGEgcG9seW5vbWlhbCBzZWFyY2ggdGltZSBpbiBjZXJ0YWluIGNhc2VzLlxuICAgICAqXG4gICAgICogVGhlIHRyeS1jYXRjaCBpcyBmb3IgU2FmYXJpLCB3aGljaCBkb2Vzbid0IHN1cHBvcnQgdGhpcyB5ZXQ6XG4gICAgICogaHR0cHM6Ly9jYW5pdXNlLmNvbS9qcy1yZWdleHAtbG9va2JlaGluZFxuICAgICAqL1xuICAgIGxldCBmaXJzdCwgbGluZTtcbiAgICB0cnkge1xuICAgICAgICBmaXJzdCA9IG5ldyBSZWdFeHAoJyguKj8pKD88IVsgXFx0XSlbIFxcdF0qXFxyP1xcbicsICdzeScpO1xuICAgICAgICBsaW5lID0gbmV3IFJlZ0V4cCgnWyBcXHRdKiguKj8pKD86KD88IVsgXFx0XSlbIFxcdF0qKT9cXHI/XFxuJywgJ3N5Jyk7XG4gICAgfVxuICAgIGNhdGNoIHtcbiAgICAgICAgZmlyc3QgPSAvKC4qPylbIFxcdF0qXFxyP1xcbi9zeTtcbiAgICAgICAgbGluZSA9IC9bIFxcdF0qKC4qPylbIFxcdF0qXFxyP1xcbi9zeTtcbiAgICB9XG4gICAgbGV0IG1hdGNoID0gZmlyc3QuZXhlYyhzb3VyY2UpO1xuICAgIGlmICghbWF0Y2gpXG4gICAgICAgIHJldHVybiBzb3VyY2U7XG4gICAgbGV0IHJlcyA9IG1hdGNoWzFdO1xuICAgIGxldCBzZXAgPSAnICc7XG4gICAgbGV0IHBvcyA9IGZpcnN0Lmxhc3RJbmRleDtcbiAgICBsaW5lLmxhc3RJbmRleCA9IHBvcztcbiAgICB3aGlsZSAoKG1hdGNoID0gbGluZS5leGVjKHNvdXJjZSkpKSB7XG4gICAgICAgIGlmIChtYXRjaFsxXSA9PT0gJycpIHtcbiAgICAgICAgICAgIGlmIChzZXAgPT09ICdcXG4nKVxuICAgICAgICAgICAgICAgIHJlcyArPSBzZXA7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgc2VwID0gJ1xcbic7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXMgKz0gc2VwICsgbWF0Y2hbMV07XG4gICAgICAgICAgICBzZXAgPSAnICc7XG4gICAgICAgIH1cbiAgICAgICAgcG9zID0gbGluZS5sYXN0SW5kZXg7XG4gICAgfVxuICAgIGNvbnN0IGxhc3QgPSAvWyBcXHRdKiguKikvc3k7XG4gICAgbGFzdC5sYXN0SW5kZXggPSBwb3M7XG4gICAgbWF0Y2ggPSBsYXN0LmV4ZWMoc291cmNlKTtcbiAgICByZXR1cm4gcmVzICsgc2VwICsgKG1hdGNoPy5bMV0gPz8gJycpO1xufVxuZnVuY3Rpb24gZG91YmxlUXVvdGVkVmFsdWUoc291cmNlLCBvbkVycm9yKSB7XG4gICAgbGV0IHJlcyA9ICcnO1xuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgc291cmNlLmxlbmd0aCAtIDE7ICsraSkge1xuICAgICAgICBjb25zdCBjaCA9IHNvdXJjZVtpXTtcbiAgICAgICAgaWYgKGNoID09PSAnXFxyJyAmJiBzb3VyY2VbaSArIDFdID09PSAnXFxuJylcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICBpZiAoY2ggPT09ICdcXG4nKSB7XG4gICAgICAgICAgICBjb25zdCB7IGZvbGQsIG9mZnNldCB9ID0gZm9sZE5ld2xpbmUoc291cmNlLCBpKTtcbiAgICAgICAgICAgIHJlcyArPSBmb2xkO1xuICAgICAgICAgICAgaSA9IG9mZnNldDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjaCA9PT0gJ1xcXFwnKSB7XG4gICAgICAgICAgICBsZXQgbmV4dCA9IHNvdXJjZVsrK2ldO1xuICAgICAgICAgICAgY29uc3QgY2MgPSBlc2NhcGVDb2Rlc1tuZXh0XTtcbiAgICAgICAgICAgIGlmIChjYylcbiAgICAgICAgICAgICAgICByZXMgKz0gY2M7XG4gICAgICAgICAgICBlbHNlIGlmIChuZXh0ID09PSAnXFxuJykge1xuICAgICAgICAgICAgICAgIC8vIHNraXAgZXNjYXBlZCBuZXdsaW5lcywgYnV0IHN0aWxsIHRyaW0gdGhlIGZvbGxvd2luZyBsaW5lXG4gICAgICAgICAgICAgICAgbmV4dCA9IHNvdXJjZVtpICsgMV07XG4gICAgICAgICAgICAgICAgd2hpbGUgKG5leHQgPT09ICcgJyB8fCBuZXh0ID09PSAnXFx0JylcbiAgICAgICAgICAgICAgICAgICAgbmV4dCA9IHNvdXJjZVsrK2kgKyAxXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG5leHQgPT09ICdcXHInICYmIHNvdXJjZVtpICsgMV0gPT09ICdcXG4nKSB7XG4gICAgICAgICAgICAgICAgLy8gc2tpcCBlc2NhcGVkIENSTEYgbmV3bGluZXMsIGJ1dCBzdGlsbCB0cmltIHRoZSBmb2xsb3dpbmcgbGluZVxuICAgICAgICAgICAgICAgIG5leHQgPSBzb3VyY2VbKytpICsgMV07XG4gICAgICAgICAgICAgICAgd2hpbGUgKG5leHQgPT09ICcgJyB8fCBuZXh0ID09PSAnXFx0JylcbiAgICAgICAgICAgICAgICAgICAgbmV4dCA9IHNvdXJjZVsrK2kgKyAxXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG5leHQgPT09ICd4JyB8fCBuZXh0ID09PSAndScgfHwgbmV4dCA9PT0gJ1UnKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbGVuZ3RoID0geyB4OiAyLCB1OiA0LCBVOiA4IH1bbmV4dF07XG4gICAgICAgICAgICAgICAgcmVzICs9IHBhcnNlQ2hhckNvZGUoc291cmNlLCBpICsgMSwgbGVuZ3RoLCBvbkVycm9yKTtcbiAgICAgICAgICAgICAgICBpICs9IGxlbmd0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJhdyA9IHNvdXJjZS5zdWJzdHIoaSAtIDEsIDIpO1xuICAgICAgICAgICAgICAgIG9uRXJyb3IoaSAtIDEsICdCQURfRFFfRVNDQVBFJywgYEludmFsaWQgZXNjYXBlIHNlcXVlbmNlICR7cmF3fWApO1xuICAgICAgICAgICAgICAgIHJlcyArPSByYXc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoY2ggPT09ICcgJyB8fCBjaCA9PT0gJ1xcdCcpIHtcbiAgICAgICAgICAgIC8vIHRyaW0gdHJhaWxpbmcgd2hpdGVzcGFjZVxuICAgICAgICAgICAgY29uc3Qgd3NTdGFydCA9IGk7XG4gICAgICAgICAgICBsZXQgbmV4dCA9IHNvdXJjZVtpICsgMV07XG4gICAgICAgICAgICB3aGlsZSAobmV4dCA9PT0gJyAnIHx8IG5leHQgPT09ICdcXHQnKVxuICAgICAgICAgICAgICAgIG5leHQgPSBzb3VyY2VbKytpICsgMV07XG4gICAgICAgICAgICBpZiAobmV4dCAhPT0gJ1xcbicgJiYgIShuZXh0ID09PSAnXFxyJyAmJiBzb3VyY2VbaSArIDJdID09PSAnXFxuJykpXG4gICAgICAgICAgICAgICAgcmVzICs9IGkgPiB3c1N0YXJ0ID8gc291cmNlLnNsaWNlKHdzU3RhcnQsIGkgKyAxKSA6IGNoO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmVzICs9IGNoO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChzb3VyY2Vbc291cmNlLmxlbmd0aCAtIDFdICE9PSAnXCInIHx8IHNvdXJjZS5sZW5ndGggPT09IDEpXG4gICAgICAgIG9uRXJyb3Ioc291cmNlLmxlbmd0aCwgJ01JU1NJTkdfQ0hBUicsICdNaXNzaW5nIGNsb3NpbmcgXCJxdW90ZScpO1xuICAgIHJldHVybiByZXM7XG59XG4vKipcbiAqIEZvbGQgYSBzaW5nbGUgbmV3bGluZSBpbnRvIGEgc3BhY2UsIG11bHRpcGxlIG5ld2xpbmVzIHRvIE4gLSAxIG5ld2xpbmVzLlxuICogUHJlc3VtZXMgYHNvdXJjZVtvZmZzZXRdID09PSAnXFxuJ2BcbiAqL1xuZnVuY3Rpb24gZm9sZE5ld2xpbmUoc291cmNlLCBvZmZzZXQpIHtcbiAgICBsZXQgZm9sZCA9ICcnO1xuICAgIGxldCBjaCA9IHNvdXJjZVtvZmZzZXQgKyAxXTtcbiAgICB3aGlsZSAoY2ggPT09ICcgJyB8fCBjaCA9PT0gJ1xcdCcgfHwgY2ggPT09ICdcXG4nIHx8IGNoID09PSAnXFxyJykge1xuICAgICAgICBpZiAoY2ggPT09ICdcXHInICYmIHNvdXJjZVtvZmZzZXQgKyAyXSAhPT0gJ1xcbicpXG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgaWYgKGNoID09PSAnXFxuJylcbiAgICAgICAgICAgIGZvbGQgKz0gJ1xcbic7XG4gICAgICAgIG9mZnNldCArPSAxO1xuICAgICAgICBjaCA9IHNvdXJjZVtvZmZzZXQgKyAxXTtcbiAgICB9XG4gICAgaWYgKCFmb2xkKVxuICAgICAgICBmb2xkID0gJyAnO1xuICAgIHJldHVybiB7IGZvbGQsIG9mZnNldCB9O1xufVxuY29uc3QgZXNjYXBlQ29kZXMgPSB7XG4gICAgJzAnOiAnXFwwJywgLy8gbnVsbCBjaGFyYWN0ZXJcbiAgICBhOiAnXFx4MDcnLCAvLyBiZWxsIGNoYXJhY3RlclxuICAgIGI6ICdcXGInLCAvLyBiYWNrc3BhY2VcbiAgICBlOiAnXFx4MWInLCAvLyBlc2NhcGUgY2hhcmFjdGVyXG4gICAgZjogJ1xcZicsIC8vIGZvcm0gZmVlZFxuICAgIG46ICdcXG4nLCAvLyBsaW5lIGZlZWRcbiAgICByOiAnXFxyJywgLy8gY2FycmlhZ2UgcmV0dXJuXG4gICAgdDogJ1xcdCcsIC8vIGhvcml6b250YWwgdGFiXG4gICAgdjogJ1xcdicsIC8vIHZlcnRpY2FsIHRhYlxuICAgIE46ICdcXHUwMDg1JywgLy8gVW5pY29kZSBuZXh0IGxpbmVcbiAgICBfOiAnXFx1MDBhMCcsIC8vIFVuaWNvZGUgbm9uLWJyZWFraW5nIHNwYWNlXG4gICAgTDogJ1xcdTIwMjgnLCAvLyBVbmljb2RlIGxpbmUgc2VwYXJhdG9yXG4gICAgUDogJ1xcdTIwMjknLCAvLyBVbmljb2RlIHBhcmFncmFwaCBzZXBhcmF0b3JcbiAgICAnICc6ICcgJyxcbiAgICAnXCInOiAnXCInLFxuICAgICcvJzogJy8nLFxuICAgICdcXFxcJzogJ1xcXFwnLFxuICAgICdcXHQnOiAnXFx0J1xufTtcbmZ1bmN0aW9uIHBhcnNlQ2hhckNvZGUoc291cmNlLCBvZmZzZXQsIGxlbmd0aCwgb25FcnJvcikge1xuICAgIGNvbnN0IGNjID0gc291cmNlLnN1YnN0cihvZmZzZXQsIGxlbmd0aCk7XG4gICAgY29uc3Qgb2sgPSBjYy5sZW5ndGggPT09IGxlbmd0aCAmJiAvXlswLTlhLWZBLUZdKyQvLnRlc3QoY2MpO1xuICAgIGNvbnN0IGNvZGUgPSBvayA/IHBhcnNlSW50KGNjLCAxNikgOiBOYU47XG4gICAgaWYgKGlzTmFOKGNvZGUpKSB7XG4gICAgICAgIGNvbnN0IHJhdyA9IHNvdXJjZS5zdWJzdHIob2Zmc2V0IC0gMiwgbGVuZ3RoICsgMik7XG4gICAgICAgIG9uRXJyb3Iob2Zmc2V0IC0gMiwgJ0JBRF9EUV9FU0NBUEUnLCBgSW52YWxpZCBlc2NhcGUgc2VxdWVuY2UgJHtyYXd9YCk7XG4gICAgICAgIHJldHVybiByYXc7XG4gICAgfVxuICAgIHJldHVybiBTdHJpbmcuZnJvbUNvZGVQb2ludChjb2RlKTtcbn1cblxuZXhwb3J0cy5yZXNvbHZlRmxvd1NjYWxhciA9IHJlc29sdmVGbG93U2NhbGFyO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBpZGVudGl0eSA9IHJlcXVpcmUoJy4uL25vZGVzL2lkZW50aXR5LmpzJyk7XG52YXIgU2NhbGFyID0gcmVxdWlyZSgnLi4vbm9kZXMvU2NhbGFyLmpzJyk7XG52YXIgcmVzb2x2ZUJsb2NrU2NhbGFyID0gcmVxdWlyZSgnLi9yZXNvbHZlLWJsb2NrLXNjYWxhci5qcycpO1xudmFyIHJlc29sdmVGbG93U2NhbGFyID0gcmVxdWlyZSgnLi9yZXNvbHZlLWZsb3ctc2NhbGFyLmpzJyk7XG5cbmZ1bmN0aW9uIGNvbXBvc2VTY2FsYXIoY3R4LCB0b2tlbiwgdGFnVG9rZW4sIG9uRXJyb3IpIHtcbiAgICBjb25zdCB7IHZhbHVlLCB0eXBlLCBjb21tZW50LCByYW5nZSB9ID0gdG9rZW4udHlwZSA9PT0gJ2Jsb2NrLXNjYWxhcidcbiAgICAgICAgPyByZXNvbHZlQmxvY2tTY2FsYXIucmVzb2x2ZUJsb2NrU2NhbGFyKGN0eCwgdG9rZW4sIG9uRXJyb3IpXG4gICAgICAgIDogcmVzb2x2ZUZsb3dTY2FsYXIucmVzb2x2ZUZsb3dTY2FsYXIodG9rZW4sIGN0eC5vcHRpb25zLnN0cmljdCwgb25FcnJvcik7XG4gICAgY29uc3QgdGFnTmFtZSA9IHRhZ1Rva2VuXG4gICAgICAgID8gY3R4LmRpcmVjdGl2ZXMudGFnTmFtZSh0YWdUb2tlbi5zb3VyY2UsIG1zZyA9PiBvbkVycm9yKHRhZ1Rva2VuLCAnVEFHX1JFU09MVkVfRkFJTEVEJywgbXNnKSlcbiAgICAgICAgOiBudWxsO1xuICAgIGxldCB0YWc7XG4gICAgaWYgKGN0eC5vcHRpb25zLnN0cmluZ0tleXMgJiYgY3R4LmF0S2V5KSB7XG4gICAgICAgIHRhZyA9IGN0eC5zY2hlbWFbaWRlbnRpdHkuU0NBTEFSXTtcbiAgICB9XG4gICAgZWxzZSBpZiAodGFnTmFtZSlcbiAgICAgICAgdGFnID0gZmluZFNjYWxhclRhZ0J5TmFtZShjdHguc2NoZW1hLCB2YWx1ZSwgdGFnTmFtZSwgdGFnVG9rZW4sIG9uRXJyb3IpO1xuICAgIGVsc2UgaWYgKHRva2VuLnR5cGUgPT09ICdzY2FsYXInKVxuICAgICAgICB0YWcgPSBmaW5kU2NhbGFyVGFnQnlUZXN0KGN0eCwgdmFsdWUsIHRva2VuLCBvbkVycm9yKTtcbiAgICBlbHNlXG4gICAgICAgIHRhZyA9IGN0eC5zY2hlbWFbaWRlbnRpdHkuU0NBTEFSXTtcbiAgICBsZXQgc2NhbGFyO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlcyA9IHRhZy5yZXNvbHZlKHZhbHVlLCBtc2cgPT4gb25FcnJvcih0YWdUb2tlbiA/PyB0b2tlbiwgJ1RBR19SRVNPTFZFX0ZBSUxFRCcsIG1zZyksIGN0eC5vcHRpb25zKTtcbiAgICAgICAgc2NhbGFyID0gaWRlbnRpdHkuaXNTY2FsYXIocmVzKSA/IHJlcyA6IG5ldyBTY2FsYXIuU2NhbGFyKHJlcyk7XG4gICAgfVxuICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtc2cgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIG9uRXJyb3IodGFnVG9rZW4gPz8gdG9rZW4sICdUQUdfUkVTT0xWRV9GQUlMRUQnLCBtc2cpO1xuICAgICAgICBzY2FsYXIgPSBuZXcgU2NhbGFyLlNjYWxhcih2YWx1ZSk7XG4gICAgfVxuICAgIHNjYWxhci5yYW5nZSA9IHJhbmdlO1xuICAgIHNjYWxhci5zb3VyY2UgPSB2YWx1ZTtcbiAgICBpZiAodHlwZSlcbiAgICAgICAgc2NhbGFyLnR5cGUgPSB0eXBlO1xuICAgIGlmICh0YWdOYW1lKVxuICAgICAgICBzY2FsYXIudGFnID0gdGFnTmFtZTtcbiAgICBpZiAodGFnLmZvcm1hdClcbiAgICAgICAgc2NhbGFyLmZvcm1hdCA9IHRhZy5mb3JtYXQ7XG4gICAgaWYgKGNvbW1lbnQpXG4gICAgICAgIHNjYWxhci5jb21tZW50ID0gY29tbWVudDtcbiAgICByZXR1cm4gc2NhbGFyO1xufVxuZnVuY3Rpb24gZmluZFNjYWxhclRhZ0J5TmFtZShzY2hlbWEsIHZhbHVlLCB0YWdOYW1lLCB0YWdUb2tlbiwgb25FcnJvcikge1xuICAgIGlmICh0YWdOYW1lID09PSAnIScpXG4gICAgICAgIHJldHVybiBzY2hlbWFbaWRlbnRpdHkuU0NBTEFSXTsgLy8gbm9uLXNwZWNpZmljIHRhZ1xuICAgIGNvbnN0IG1hdGNoV2l0aFRlc3QgPSBbXTtcbiAgICBmb3IgKGNvbnN0IHRhZyBvZiBzY2hlbWEudGFncykge1xuICAgICAgICBpZiAoIXRhZy5jb2xsZWN0aW9uICYmIHRhZy50YWcgPT09IHRhZ05hbWUpIHtcbiAgICAgICAgICAgIGlmICh0YWcuZGVmYXVsdCAmJiB0YWcudGVzdClcbiAgICAgICAgICAgICAgICBtYXRjaFdpdGhUZXN0LnB1c2godGFnKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFnO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZvciAoY29uc3QgdGFnIG9mIG1hdGNoV2l0aFRlc3QpXG4gICAgICAgIGlmICh0YWcudGVzdD8udGVzdCh2YWx1ZSkpXG4gICAgICAgICAgICByZXR1cm4gdGFnO1xuICAgIGNvbnN0IGt0ID0gc2NoZW1hLmtub3duVGFnc1t0YWdOYW1lXTtcbiAgICBpZiAoa3QgJiYgIWt0LmNvbGxlY3Rpb24pIHtcbiAgICAgICAgLy8gRW5zdXJlIHRoYXQgdGhlIGtub3duIHRhZyBpcyBhdmFpbGFibGUgZm9yIHN0cmluZ2lmeWluZyxcbiAgICAgICAgLy8gYnV0IGRvZXMgbm90IGdldCB1c2VkIGJ5IGRlZmF1bHQuXG4gICAgICAgIHNjaGVtYS50YWdzLnB1c2goT2JqZWN0LmFzc2lnbih7fSwga3QsIHsgZGVmYXVsdDogZmFsc2UsIHRlc3Q6IHVuZGVmaW5lZCB9KSk7XG4gICAgICAgIHJldHVybiBrdDtcbiAgICB9XG4gICAgb25FcnJvcih0YWdUb2tlbiwgJ1RBR19SRVNPTFZFX0ZBSUxFRCcsIGBVbnJlc29sdmVkIHRhZzogJHt0YWdOYW1lfWAsIHRhZ05hbWUgIT09ICd0YWc6eWFtbC5vcmcsMjAwMjpzdHInKTtcbiAgICByZXR1cm4gc2NoZW1hW2lkZW50aXR5LlNDQUxBUl07XG59XG5mdW5jdGlvbiBmaW5kU2NhbGFyVGFnQnlUZXN0KHsgYXRLZXksIGRpcmVjdGl2ZXMsIHNjaGVtYSB9LCB2YWx1ZSwgdG9rZW4sIG9uRXJyb3IpIHtcbiAgICBjb25zdCB0YWcgPSBzY2hlbWEudGFncy5maW5kKHRhZyA9PiAodGFnLmRlZmF1bHQgPT09IHRydWUgfHwgKGF0S2V5ICYmIHRhZy5kZWZhdWx0ID09PSAna2V5JykpICYmXG4gICAgICAgIHRhZy50ZXN0Py50ZXN0KHZhbHVlKSkgfHwgc2NoZW1hW2lkZW50aXR5LlNDQUxBUl07XG4gICAgaWYgKHNjaGVtYS5jb21wYXQpIHtcbiAgICAgICAgY29uc3QgY29tcGF0ID0gc2NoZW1hLmNvbXBhdC5maW5kKHRhZyA9PiB0YWcuZGVmYXVsdCAmJiB0YWcudGVzdD8udGVzdCh2YWx1ZSkpID8/XG4gICAgICAgICAgICBzY2hlbWFbaWRlbnRpdHkuU0NBTEFSXTtcbiAgICAgICAgaWYgKHRhZy50YWcgIT09IGNvbXBhdC50YWcpIHtcbiAgICAgICAgICAgIGNvbnN0IHRzID0gZGlyZWN0aXZlcy50YWdTdHJpbmcodGFnLnRhZyk7XG4gICAgICAgICAgICBjb25zdCBjcyA9IGRpcmVjdGl2ZXMudGFnU3RyaW5nKGNvbXBhdC50YWcpO1xuICAgICAgICAgICAgY29uc3QgbXNnID0gYFZhbHVlIG1heSBiZSBwYXJzZWQgYXMgZWl0aGVyICR7dHN9IG9yICR7Y3N9YDtcbiAgICAgICAgICAgIG9uRXJyb3IodG9rZW4sICdUQUdfUkVTT0xWRV9GQUlMRUQnLCBtc2csIHRydWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0YWc7XG59XG5cbmV4cG9ydHMuY29tcG9zZVNjYWxhciA9IGNvbXBvc2VTY2FsYXI7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gZW1wdHlTY2FsYXJQb3NpdGlvbihvZmZzZXQsIGJlZm9yZSwgcG9zKSB7XG4gICAgaWYgKGJlZm9yZSkge1xuICAgICAgICBwb3MgPz8gKHBvcyA9IGJlZm9yZS5sZW5ndGgpO1xuICAgICAgICBmb3IgKGxldCBpID0gcG9zIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgICAgIGxldCBzdCA9IGJlZm9yZVtpXTtcbiAgICAgICAgICAgIHN3aXRjaCAoc3QudHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcbiAgICAgICAgICAgICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0IC09IHN0LnNvdXJjZS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gVGVjaG5pY2FsbHksIGFuIGVtcHR5IHNjYWxhciBpcyBpbW1lZGlhdGVseSBhZnRlciB0aGUgbGFzdCBub24tZW1wdHlcbiAgICAgICAgICAgIC8vIG5vZGUsIGJ1dCBpdCdzIG1vcmUgdXNlZnVsIHRvIHBsYWNlIGl0IGFmdGVyIGFueSB3aGl0ZXNwYWNlLlxuICAgICAgICAgICAgc3QgPSBiZWZvcmVbKytpXTtcbiAgICAgICAgICAgIHdoaWxlIChzdD8udHlwZSA9PT0gJ3NwYWNlJykge1xuICAgICAgICAgICAgICAgIG9mZnNldCArPSBzdC5zb3VyY2UubGVuZ3RoO1xuICAgICAgICAgICAgICAgIHN0ID0gYmVmb3JlWysraV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb2Zmc2V0O1xufVxuXG5leHBvcnRzLmVtcHR5U2NhbGFyUG9zaXRpb24gPSBlbXB0eVNjYWxhclBvc2l0aW9uO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBBbGlhcyA9IHJlcXVpcmUoJy4uL25vZGVzL0FsaWFzLmpzJyk7XG52YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuLi9ub2Rlcy9pZGVudGl0eS5qcycpO1xudmFyIGNvbXBvc2VDb2xsZWN0aW9uID0gcmVxdWlyZSgnLi9jb21wb3NlLWNvbGxlY3Rpb24uanMnKTtcbnZhciBjb21wb3NlU2NhbGFyID0gcmVxdWlyZSgnLi9jb21wb3NlLXNjYWxhci5qcycpO1xudmFyIHJlc29sdmVFbmQgPSByZXF1aXJlKCcuL3Jlc29sdmUtZW5kLmpzJyk7XG52YXIgdXRpbEVtcHR5U2NhbGFyUG9zaXRpb24gPSByZXF1aXJlKCcuL3V0aWwtZW1wdHktc2NhbGFyLXBvc2l0aW9uLmpzJyk7XG5cbmNvbnN0IENOID0geyBjb21wb3NlTm9kZSwgY29tcG9zZUVtcHR5Tm9kZSB9O1xuZnVuY3Rpb24gY29tcG9zZU5vZGUoY3R4LCB0b2tlbiwgcHJvcHMsIG9uRXJyb3IpIHtcbiAgICBjb25zdCBhdEtleSA9IGN0eC5hdEtleTtcbiAgICBjb25zdCB7IHNwYWNlQmVmb3JlLCBjb21tZW50LCBhbmNob3IsIHRhZyB9ID0gcHJvcHM7XG4gICAgbGV0IG5vZGU7XG4gICAgbGV0IGlzU3JjVG9rZW4gPSB0cnVlO1xuICAgIHN3aXRjaCAodG9rZW4udHlwZSkge1xuICAgICAgICBjYXNlICdhbGlhcyc6XG4gICAgICAgICAgICBub2RlID0gY29tcG9zZUFsaWFzKGN0eCwgdG9rZW4sIG9uRXJyb3IpO1xuICAgICAgICAgICAgaWYgKGFuY2hvciB8fCB0YWcpXG4gICAgICAgICAgICAgICAgb25FcnJvcih0b2tlbiwgJ0FMSUFTX1BST1BTJywgJ0FuIGFsaWFzIG5vZGUgbXVzdCBub3Qgc3BlY2lmeSBhbnkgcHJvcGVydGllcycpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3NjYWxhcic6XG4gICAgICAgIGNhc2UgJ3NpbmdsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgY2FzZSAnZG91YmxlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICBjYXNlICdibG9jay1zY2FsYXInOlxuICAgICAgICAgICAgbm9kZSA9IGNvbXBvc2VTY2FsYXIuY29tcG9zZVNjYWxhcihjdHgsIHRva2VuLCB0YWcsIG9uRXJyb3IpO1xuICAgICAgICAgICAgaWYgKGFuY2hvcilcbiAgICAgICAgICAgICAgICBub2RlLmFuY2hvciA9IGFuY2hvci5zb3VyY2Uuc3Vic3RyaW5nKDEpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2Jsb2NrLW1hcCc6XG4gICAgICAgIGNhc2UgJ2Jsb2NrLXNlcSc6XG4gICAgICAgIGNhc2UgJ2Zsb3ctY29sbGVjdGlvbic6XG4gICAgICAgICAgICBub2RlID0gY29tcG9zZUNvbGxlY3Rpb24uY29tcG9zZUNvbGxlY3Rpb24oQ04sIGN0eCwgdG9rZW4sIHByb3BzLCBvbkVycm9yKTtcbiAgICAgICAgICAgIGlmIChhbmNob3IpXG4gICAgICAgICAgICAgICAgbm9kZS5hbmNob3IgPSBhbmNob3Iuc291cmNlLnN1YnN0cmluZygxKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gdG9rZW4udHlwZSA9PT0gJ2Vycm9yJ1xuICAgICAgICAgICAgICAgID8gdG9rZW4ubWVzc2FnZVxuICAgICAgICAgICAgICAgIDogYFVuc3VwcG9ydGVkIHRva2VuICh0eXBlOiAke3Rva2VuLnR5cGV9KWA7XG4gICAgICAgICAgICBvbkVycm9yKHRva2VuLCAnVU5FWFBFQ1RFRF9UT0tFTicsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgbm9kZSA9IGNvbXBvc2VFbXB0eU5vZGUoY3R4LCB0b2tlbi5vZmZzZXQsIHVuZGVmaW5lZCwgbnVsbCwgcHJvcHMsIG9uRXJyb3IpO1xuICAgICAgICAgICAgaXNTcmNUb2tlbiA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChhbmNob3IgJiYgbm9kZS5hbmNob3IgPT09ICcnKVxuICAgICAgICBvbkVycm9yKGFuY2hvciwgJ0JBRF9BTElBUycsICdBbmNob3IgY2Fubm90IGJlIGFuIGVtcHR5IHN0cmluZycpO1xuICAgIGlmIChhdEtleSAmJlxuICAgICAgICBjdHgub3B0aW9ucy5zdHJpbmdLZXlzICYmXG4gICAgICAgICghaWRlbnRpdHkuaXNTY2FsYXIobm9kZSkgfHxcbiAgICAgICAgICAgIHR5cGVvZiBub2RlLnZhbHVlICE9PSAnc3RyaW5nJyB8fFxuICAgICAgICAgICAgKG5vZGUudGFnICYmIG5vZGUudGFnICE9PSAndGFnOnlhbWwub3JnLDIwMDI6c3RyJykpKSB7XG4gICAgICAgIGNvbnN0IG1zZyA9ICdXaXRoIHN0cmluZ0tleXMsIGFsbCBrZXlzIG11c3QgYmUgc3RyaW5ncyc7XG4gICAgICAgIG9uRXJyb3IodGFnID8/IHRva2VuLCAnTk9OX1NUUklOR19LRVknLCBtc2cpO1xuICAgIH1cbiAgICBpZiAoc3BhY2VCZWZvcmUpXG4gICAgICAgIG5vZGUuc3BhY2VCZWZvcmUgPSB0cnVlO1xuICAgIGlmIChjb21tZW50KSB7XG4gICAgICAgIGlmICh0b2tlbi50eXBlID09PSAnc2NhbGFyJyAmJiB0b2tlbi5zb3VyY2UgPT09ICcnKVxuICAgICAgICAgICAgbm9kZS5jb21tZW50ID0gY29tbWVudDtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbm9kZS5jb21tZW50QmVmb3JlID0gY29tbWVudDtcbiAgICB9XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciBUeXBlIGNoZWNraW5nIG1pc3NlcyBtZWFuaW5nIG9mIGlzU3JjVG9rZW5cbiAgICBpZiAoY3R4Lm9wdGlvbnMua2VlcFNvdXJjZVRva2VucyAmJiBpc1NyY1Rva2VuKVxuICAgICAgICBub2RlLnNyY1Rva2VuID0gdG9rZW47XG4gICAgcmV0dXJuIG5vZGU7XG59XG5mdW5jdGlvbiBjb21wb3NlRW1wdHlOb2RlKGN0eCwgb2Zmc2V0LCBiZWZvcmUsIHBvcywgeyBzcGFjZUJlZm9yZSwgY29tbWVudCwgYW5jaG9yLCB0YWcsIGVuZCB9LCBvbkVycm9yKSB7XG4gICAgY29uc3QgdG9rZW4gPSB7XG4gICAgICAgIHR5cGU6ICdzY2FsYXInLFxuICAgICAgICBvZmZzZXQ6IHV0aWxFbXB0eVNjYWxhclBvc2l0aW9uLmVtcHR5U2NhbGFyUG9zaXRpb24ob2Zmc2V0LCBiZWZvcmUsIHBvcyksXG4gICAgICAgIGluZGVudDogLTEsXG4gICAgICAgIHNvdXJjZTogJydcbiAgICB9O1xuICAgIGNvbnN0IG5vZGUgPSBjb21wb3NlU2NhbGFyLmNvbXBvc2VTY2FsYXIoY3R4LCB0b2tlbiwgdGFnLCBvbkVycm9yKTtcbiAgICBpZiAoYW5jaG9yKSB7XG4gICAgICAgIG5vZGUuYW5jaG9yID0gYW5jaG9yLnNvdXJjZS5zdWJzdHJpbmcoMSk7XG4gICAgICAgIGlmIChub2RlLmFuY2hvciA9PT0gJycpXG4gICAgICAgICAgICBvbkVycm9yKGFuY2hvciwgJ0JBRF9BTElBUycsICdBbmNob3IgY2Fubm90IGJlIGFuIGVtcHR5IHN0cmluZycpO1xuICAgIH1cbiAgICBpZiAoc3BhY2VCZWZvcmUpXG4gICAgICAgIG5vZGUuc3BhY2VCZWZvcmUgPSB0cnVlO1xuICAgIGlmIChjb21tZW50KSB7XG4gICAgICAgIG5vZGUuY29tbWVudCA9IGNvbW1lbnQ7XG4gICAgICAgIG5vZGUucmFuZ2VbMl0gPSBlbmQ7XG4gICAgfVxuICAgIHJldHVybiBub2RlO1xufVxuZnVuY3Rpb24gY29tcG9zZUFsaWFzKHsgb3B0aW9ucyB9LCB7IG9mZnNldCwgc291cmNlLCBlbmQgfSwgb25FcnJvcikge1xuICAgIGNvbnN0IGFsaWFzID0gbmV3IEFsaWFzLkFsaWFzKHNvdXJjZS5zdWJzdHJpbmcoMSkpO1xuICAgIGlmIChhbGlhcy5zb3VyY2UgPT09ICcnKVxuICAgICAgICBvbkVycm9yKG9mZnNldCwgJ0JBRF9BTElBUycsICdBbGlhcyBjYW5ub3QgYmUgYW4gZW1wdHkgc3RyaW5nJyk7XG4gICAgaWYgKGFsaWFzLnNvdXJjZS5lbmRzV2l0aCgnOicpKVxuICAgICAgICBvbkVycm9yKG9mZnNldCArIHNvdXJjZS5sZW5ndGggLSAxLCAnQkFEX0FMSUFTJywgJ0FsaWFzIGVuZGluZyBpbiA6IGlzIGFtYmlndW91cycsIHRydWUpO1xuICAgIGNvbnN0IHZhbHVlRW5kID0gb2Zmc2V0ICsgc291cmNlLmxlbmd0aDtcbiAgICBjb25zdCByZSA9IHJlc29sdmVFbmQucmVzb2x2ZUVuZChlbmQsIHZhbHVlRW5kLCBvcHRpb25zLnN0cmljdCwgb25FcnJvcik7XG4gICAgYWxpYXMucmFuZ2UgPSBbb2Zmc2V0LCB2YWx1ZUVuZCwgcmUub2Zmc2V0XTtcbiAgICBpZiAocmUuY29tbWVudClcbiAgICAgICAgYWxpYXMuY29tbWVudCA9IHJlLmNvbW1lbnQ7XG4gICAgcmV0dXJuIGFsaWFzO1xufVxuXG5leHBvcnRzLmNvbXBvc2VFbXB0eU5vZGUgPSBjb21wb3NlRW1wdHlOb2RlO1xuZXhwb3J0cy5jb21wb3NlTm9kZSA9IGNvbXBvc2VOb2RlO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBEb2N1bWVudCA9IHJlcXVpcmUoJy4uL2RvYy9Eb2N1bWVudC5qcycpO1xudmFyIGNvbXBvc2VOb2RlID0gcmVxdWlyZSgnLi9jb21wb3NlLW5vZGUuanMnKTtcbnZhciByZXNvbHZlRW5kID0gcmVxdWlyZSgnLi9yZXNvbHZlLWVuZC5qcycpO1xudmFyIHJlc29sdmVQcm9wcyA9IHJlcXVpcmUoJy4vcmVzb2x2ZS1wcm9wcy5qcycpO1xuXG5mdW5jdGlvbiBjb21wb3NlRG9jKG9wdGlvbnMsIGRpcmVjdGl2ZXMsIHsgb2Zmc2V0LCBzdGFydCwgdmFsdWUsIGVuZCB9LCBvbkVycm9yKSB7XG4gICAgY29uc3Qgb3B0cyA9IE9iamVjdC5hc3NpZ24oeyBfZGlyZWN0aXZlczogZGlyZWN0aXZlcyB9LCBvcHRpb25zKTtcbiAgICBjb25zdCBkb2MgPSBuZXcgRG9jdW1lbnQuRG9jdW1lbnQodW5kZWZpbmVkLCBvcHRzKTtcbiAgICBjb25zdCBjdHggPSB7XG4gICAgICAgIGF0S2V5OiBmYWxzZSxcbiAgICAgICAgYXRSb290OiB0cnVlLFxuICAgICAgICBkaXJlY3RpdmVzOiBkb2MuZGlyZWN0aXZlcyxcbiAgICAgICAgb3B0aW9uczogZG9jLm9wdGlvbnMsXG4gICAgICAgIHNjaGVtYTogZG9jLnNjaGVtYVxuICAgIH07XG4gICAgY29uc3QgcHJvcHMgPSByZXNvbHZlUHJvcHMucmVzb2x2ZVByb3BzKHN0YXJ0LCB7XG4gICAgICAgIGluZGljYXRvcjogJ2RvYy1zdGFydCcsXG4gICAgICAgIG5leHQ6IHZhbHVlID8/IGVuZD8uWzBdLFxuICAgICAgICBvZmZzZXQsXG4gICAgICAgIG9uRXJyb3IsXG4gICAgICAgIHBhcmVudEluZGVudDogMCxcbiAgICAgICAgc3RhcnRPbk5ld2xpbmU6IHRydWVcbiAgICB9KTtcbiAgICBpZiAocHJvcHMuZm91bmQpIHtcbiAgICAgICAgZG9jLmRpcmVjdGl2ZXMuZG9jU3RhcnQgPSB0cnVlO1xuICAgICAgICBpZiAodmFsdWUgJiZcbiAgICAgICAgICAgICh2YWx1ZS50eXBlID09PSAnYmxvY2stbWFwJyB8fCB2YWx1ZS50eXBlID09PSAnYmxvY2stc2VxJykgJiZcbiAgICAgICAgICAgICFwcm9wcy5oYXNOZXdsaW5lKVxuICAgICAgICAgICAgb25FcnJvcihwcm9wcy5lbmQsICdNSVNTSU5HX0NIQVInLCAnQmxvY2sgY29sbGVjdGlvbiBjYW5ub3Qgc3RhcnQgb24gc2FtZSBsaW5lIHdpdGggZGlyZWN0aXZlcy1lbmQgbWFya2VyJyk7XG4gICAgfVxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgSWYgQ29udGVudHMgaXMgc2V0LCBsZXQncyB0cnVzdCB0aGUgdXNlclxuICAgIGRvYy5jb250ZW50cyA9IHZhbHVlXG4gICAgICAgID8gY29tcG9zZU5vZGUuY29tcG9zZU5vZGUoY3R4LCB2YWx1ZSwgcHJvcHMsIG9uRXJyb3IpXG4gICAgICAgIDogY29tcG9zZU5vZGUuY29tcG9zZUVtcHR5Tm9kZShjdHgsIHByb3BzLmVuZCwgc3RhcnQsIG51bGwsIHByb3BzLCBvbkVycm9yKTtcbiAgICBjb25zdCBjb250ZW50RW5kID0gZG9jLmNvbnRlbnRzLnJhbmdlWzJdO1xuICAgIGNvbnN0IHJlID0gcmVzb2x2ZUVuZC5yZXNvbHZlRW5kKGVuZCwgY29udGVudEVuZCwgZmFsc2UsIG9uRXJyb3IpO1xuICAgIGlmIChyZS5jb21tZW50KVxuICAgICAgICBkb2MuY29tbWVudCA9IHJlLmNvbW1lbnQ7XG4gICAgZG9jLnJhbmdlID0gW29mZnNldCwgY29udGVudEVuZCwgcmUub2Zmc2V0XTtcbiAgICByZXR1cm4gZG9jO1xufVxuXG5leHBvcnRzLmNvbXBvc2VEb2MgPSBjb21wb3NlRG9jO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBub2RlX3Byb2Nlc3MgPSByZXF1aXJlKCdwcm9jZXNzJyk7XG52YXIgZGlyZWN0aXZlcyA9IHJlcXVpcmUoJy4uL2RvYy9kaXJlY3RpdmVzLmpzJyk7XG52YXIgRG9jdW1lbnQgPSByZXF1aXJlKCcuLi9kb2MvRG9jdW1lbnQuanMnKTtcbnZhciBlcnJvcnMgPSByZXF1aXJlKCcuLi9lcnJvcnMuanMnKTtcbnZhciBpZGVudGl0eSA9IHJlcXVpcmUoJy4uL25vZGVzL2lkZW50aXR5LmpzJyk7XG52YXIgY29tcG9zZURvYyA9IHJlcXVpcmUoJy4vY29tcG9zZS1kb2MuanMnKTtcbnZhciByZXNvbHZlRW5kID0gcmVxdWlyZSgnLi9yZXNvbHZlLWVuZC5qcycpO1xuXG5mdW5jdGlvbiBnZXRFcnJvclBvcyhzcmMpIHtcbiAgICBpZiAodHlwZW9mIHNyYyA9PT0gJ251bWJlcicpXG4gICAgICAgIHJldHVybiBbc3JjLCBzcmMgKyAxXTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShzcmMpKVxuICAgICAgICByZXR1cm4gc3JjLmxlbmd0aCA9PT0gMiA/IHNyYyA6IFtzcmNbMF0sIHNyY1sxXV07XG4gICAgY29uc3QgeyBvZmZzZXQsIHNvdXJjZSB9ID0gc3JjO1xuICAgIHJldHVybiBbb2Zmc2V0LCBvZmZzZXQgKyAodHlwZW9mIHNvdXJjZSA9PT0gJ3N0cmluZycgPyBzb3VyY2UubGVuZ3RoIDogMSldO1xufVxuZnVuY3Rpb24gcGFyc2VQcmVsdWRlKHByZWx1ZGUpIHtcbiAgICBsZXQgY29tbWVudCA9ICcnO1xuICAgIGxldCBhdENvbW1lbnQgPSBmYWxzZTtcbiAgICBsZXQgYWZ0ZXJFbXB0eUxpbmUgPSBmYWxzZTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByZWx1ZGUubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgY29uc3Qgc291cmNlID0gcHJlbHVkZVtpXTtcbiAgICAgICAgc3dpdGNoIChzb3VyY2VbMF0pIHtcbiAgICAgICAgICAgIGNhc2UgJyMnOlxuICAgICAgICAgICAgICAgIGNvbW1lbnQgKz1cbiAgICAgICAgICAgICAgICAgICAgKGNvbW1lbnQgPT09ICcnID8gJycgOiBhZnRlckVtcHR5TGluZSA/ICdcXG5cXG4nIDogJ1xcbicpICtcbiAgICAgICAgICAgICAgICAgICAgICAgIChzb3VyY2Uuc3Vic3RyaW5nKDEpIHx8ICcgJyk7XG4gICAgICAgICAgICAgICAgYXRDb21tZW50ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBhZnRlckVtcHR5TGluZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnJSc6XG4gICAgICAgICAgICAgICAgaWYgKHByZWx1ZGVbaSArIDFdPy5bMF0gIT09ICcjJylcbiAgICAgICAgICAgICAgICAgICAgaSArPSAxO1xuICAgICAgICAgICAgICAgIGF0Q29tbWVudCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAvLyBUaGlzIG1heSBiZSB3cm9uZyBhZnRlciBkb2MtZW5kLCBidXQgaW4gdGhhdCBjYXNlIGl0IGRvZXNuJ3QgbWF0dGVyXG4gICAgICAgICAgICAgICAgaWYgKCFhdENvbW1lbnQpXG4gICAgICAgICAgICAgICAgICAgIGFmdGVyRW1wdHlMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBhdENvbW1lbnQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4geyBjb21tZW50LCBhZnRlckVtcHR5TGluZSB9O1xufVxuLyoqXG4gKiBDb21wb3NlIGEgc3RyZWFtIG9mIENTVCBub2RlcyBpbnRvIGEgc3RyZWFtIG9mIFlBTUwgRG9jdW1lbnRzLlxuICpcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBDb21wb3NlciwgUGFyc2VyIH0gZnJvbSAneWFtbCdcbiAqXG4gKiBjb25zdCBzcmM6IHN0cmluZyA9IC4uLlxuICogY29uc3QgdG9rZW5zID0gbmV3IFBhcnNlcigpLnBhcnNlKHNyYylcbiAqIGNvbnN0IGRvY3MgPSBuZXcgQ29tcG9zZXIoKS5jb21wb3NlKHRva2VucylcbiAqIGBgYFxuICovXG5jbGFzcyBDb21wb3NlciB7XG4gICAgY29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIHRoaXMuZG9jID0gbnVsbDtcbiAgICAgICAgdGhpcy5hdERpcmVjdGl2ZXMgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5wcmVsdWRlID0gW107XG4gICAgICAgIHRoaXMuZXJyb3JzID0gW107XG4gICAgICAgIHRoaXMud2FybmluZ3MgPSBbXTtcbiAgICAgICAgdGhpcy5vbkVycm9yID0gKHNvdXJjZSwgY29kZSwgbWVzc2FnZSwgd2FybmluZykgPT4ge1xuICAgICAgICAgICAgY29uc3QgcG9zID0gZ2V0RXJyb3JQb3Moc291cmNlKTtcbiAgICAgICAgICAgIGlmICh3YXJuaW5nKVxuICAgICAgICAgICAgICAgIHRoaXMud2FybmluZ3MucHVzaChuZXcgZXJyb3JzLllBTUxXYXJuaW5nKHBvcywgY29kZSwgbWVzc2FnZSkpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRoaXMuZXJyb3JzLnB1c2gobmV3IGVycm9ycy5ZQU1MUGFyc2VFcnJvcihwb3MsIGNvZGUsIG1lc3NhZ2UpKTtcbiAgICAgICAgfTtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9wcmVmZXItbnVsbGlzaC1jb2FsZXNjaW5nXG4gICAgICAgIHRoaXMuZGlyZWN0aXZlcyA9IG5ldyBkaXJlY3RpdmVzLkRpcmVjdGl2ZXMoeyB2ZXJzaW9uOiBvcHRpb25zLnZlcnNpb24gfHwgJzEuMicgfSk7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgfVxuICAgIGRlY29yYXRlKGRvYywgYWZ0ZXJEb2MpIHtcbiAgICAgICAgY29uc3QgeyBjb21tZW50LCBhZnRlckVtcHR5TGluZSB9ID0gcGFyc2VQcmVsdWRlKHRoaXMucHJlbHVkZSk7XG4gICAgICAgIC8vY29uc29sZS5sb2coeyBkYzogZG9jLmNvbW1lbnQsIHByZWx1ZGUsIGNvbW1lbnQgfSlcbiAgICAgICAgaWYgKGNvbW1lbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IGRjID0gZG9jLmNvbnRlbnRzO1xuICAgICAgICAgICAgaWYgKGFmdGVyRG9jKSB7XG4gICAgICAgICAgICAgICAgZG9jLmNvbW1lbnQgPSBkb2MuY29tbWVudCA/IGAke2RvYy5jb21tZW50fVxcbiR7Y29tbWVudH1gIDogY29tbWVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGFmdGVyRW1wdHlMaW5lIHx8IGRvYy5kaXJlY3RpdmVzLmRvY1N0YXJ0IHx8ICFkYykge1xuICAgICAgICAgICAgICAgIGRvYy5jb21tZW50QmVmb3JlID0gY29tbWVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGlkZW50aXR5LmlzQ29sbGVjdGlvbihkYykgJiYgIWRjLmZsb3cgJiYgZGMuaXRlbXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGxldCBpdCA9IGRjLml0ZW1zWzBdO1xuICAgICAgICAgICAgICAgIGlmIChpZGVudGl0eS5pc1BhaXIoaXQpKVxuICAgICAgICAgICAgICAgICAgICBpdCA9IGl0LmtleTtcbiAgICAgICAgICAgICAgICBjb25zdCBjYiA9IGl0LmNvbW1lbnRCZWZvcmU7XG4gICAgICAgICAgICAgICAgaXQuY29tbWVudEJlZm9yZSA9IGNiID8gYCR7Y29tbWVudH1cXG4ke2NifWAgOiBjb21tZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2IgPSBkYy5jb21tZW50QmVmb3JlO1xuICAgICAgICAgICAgICAgIGRjLmNvbW1lbnRCZWZvcmUgPSBjYiA/IGAke2NvbW1lbnR9XFxuJHtjYn1gIDogY29tbWVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoYWZ0ZXJEb2MpIHtcbiAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KGRvYy5lcnJvcnMsIHRoaXMuZXJyb3JzKTtcbiAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KGRvYy53YXJuaW5ncywgdGhpcy53YXJuaW5ncyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBkb2MuZXJyb3JzID0gdGhpcy5lcnJvcnM7XG4gICAgICAgICAgICBkb2Mud2FybmluZ3MgPSB0aGlzLndhcm5pbmdzO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucHJlbHVkZSA9IFtdO1xuICAgICAgICB0aGlzLmVycm9ycyA9IFtdO1xuICAgICAgICB0aGlzLndhcm5pbmdzID0gW107XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEN1cnJlbnQgc3RyZWFtIHN0YXR1cyBpbmZvcm1hdGlvbi5cbiAgICAgKlxuICAgICAqIE1vc3RseSB1c2VmdWwgYXQgdGhlIGVuZCBvZiBpbnB1dCBmb3IgYW4gZW1wdHkgc3RyZWFtLlxuICAgICAqL1xuICAgIHN0cmVhbUluZm8oKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjb21tZW50OiBwYXJzZVByZWx1ZGUodGhpcy5wcmVsdWRlKS5jb21tZW50LFxuICAgICAgICAgICAgZGlyZWN0aXZlczogdGhpcy5kaXJlY3RpdmVzLFxuICAgICAgICAgICAgZXJyb3JzOiB0aGlzLmVycm9ycyxcbiAgICAgICAgICAgIHdhcm5pbmdzOiB0aGlzLndhcm5pbmdzXG4gICAgICAgIH07XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENvbXBvc2UgdG9rZW5zIGludG8gZG9jdW1lbnRzLlxuICAgICAqXG4gICAgICogQHBhcmFtIGZvcmNlRG9jIC0gSWYgdGhlIHN0cmVhbSBjb250YWlucyBubyBkb2N1bWVudCwgc3RpbGwgZW1pdCBhIGZpbmFsIGRvY3VtZW50IGluY2x1ZGluZyBhbnkgY29tbWVudHMgYW5kIGRpcmVjdGl2ZXMgdGhhdCB3b3VsZCBiZSBhcHBsaWVkIHRvIGEgc3Vic2VxdWVudCBkb2N1bWVudC5cbiAgICAgKiBAcGFyYW0gZW5kT2Zmc2V0IC0gU2hvdWxkIGJlIHNldCBpZiBgZm9yY2VEb2NgIGlzIGFsc28gc2V0LCB0byBzZXQgdGhlIGRvY3VtZW50IHJhbmdlIGVuZCBhbmQgdG8gaW5kaWNhdGUgZXJyb3JzIGNvcnJlY3RseS5cbiAgICAgKi9cbiAgICAqY29tcG9zZSh0b2tlbnMsIGZvcmNlRG9jID0gZmFsc2UsIGVuZE9mZnNldCA9IC0xKSB7XG4gICAgICAgIGZvciAoY29uc3QgdG9rZW4gb2YgdG9rZW5zKVxuICAgICAgICAgICAgeWllbGQqIHRoaXMubmV4dCh0b2tlbik7XG4gICAgICAgIHlpZWxkKiB0aGlzLmVuZChmb3JjZURvYywgZW5kT2Zmc2V0KTtcbiAgICB9XG4gICAgLyoqIEFkdmFuY2UgdGhlIGNvbXBvc2VyIGJ5IG9uZSBDU1QgdG9rZW4uICovXG4gICAgKm5leHQodG9rZW4pIHtcbiAgICAgICAgaWYgKG5vZGVfcHJvY2Vzcy5lbnYuTE9HX1NUUkVBTSlcbiAgICAgICAgICAgIGNvbnNvbGUuZGlyKHRva2VuLCB7IGRlcHRoOiBudWxsIH0pO1xuICAgICAgICBzd2l0Y2ggKHRva2VuLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2RpcmVjdGl2ZSc6XG4gICAgICAgICAgICAgICAgdGhpcy5kaXJlY3RpdmVzLmFkZCh0b2tlbi5zb3VyY2UsIChvZmZzZXQsIG1lc3NhZ2UsIHdhcm5pbmcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcG9zID0gZ2V0RXJyb3JQb3ModG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICBwb3NbMF0gKz0gb2Zmc2V0O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uRXJyb3IocG9zLCAnQkFEX0RJUkVDVElWRScsIG1lc3NhZ2UsIHdhcm5pbmcpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMucHJlbHVkZS5wdXNoKHRva2VuLnNvdXJjZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5hdERpcmVjdGl2ZXMgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZG9jdW1lbnQnOiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZG9jID0gY29tcG9zZURvYy5jb21wb3NlRG9jKHRoaXMub3B0aW9ucywgdGhpcy5kaXJlY3RpdmVzLCB0b2tlbiwgdGhpcy5vbkVycm9yKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5hdERpcmVjdGl2ZXMgJiYgIWRvYy5kaXJlY3RpdmVzLmRvY1N0YXJ0KVxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uRXJyb3IodG9rZW4sICdNSVNTSU5HX0NIQVInLCAnTWlzc2luZyBkaXJlY3RpdmVzLWVuZC9kb2Mtc3RhcnQgaW5kaWNhdG9yIGxpbmUnKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRlY29yYXRlKGRvYywgZmFsc2UpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmRvYylcbiAgICAgICAgICAgICAgICAgICAgeWllbGQgdGhpcy5kb2M7XG4gICAgICAgICAgICAgICAgdGhpcy5kb2MgPSBkb2M7XG4gICAgICAgICAgICAgICAgdGhpcy5hdERpcmVjdGl2ZXMgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgJ2J5dGUtb3JkZXItbWFyayc6XG4gICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgIHRoaXMucHJlbHVkZS5wdXNoKHRva2VuLnNvdXJjZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdlcnJvcic6IHtcbiAgICAgICAgICAgICAgICBjb25zdCBtc2cgPSB0b2tlbi5zb3VyY2VcbiAgICAgICAgICAgICAgICAgICAgPyBgJHt0b2tlbi5tZXNzYWdlfTogJHtKU09OLnN0cmluZ2lmeSh0b2tlbi5zb3VyY2UpfWBcbiAgICAgICAgICAgICAgICAgICAgOiB0b2tlbi5tZXNzYWdlO1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yID0gbmV3IGVycm9ycy5ZQU1MUGFyc2VFcnJvcihnZXRFcnJvclBvcyh0b2tlbiksICdVTkVYUEVDVEVEX1RPS0VOJywgbXNnKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5hdERpcmVjdGl2ZXMgfHwgIXRoaXMuZG9jKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVycm9ycy5wdXNoKGVycm9yKTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZG9jLmVycm9ycy5wdXNoKGVycm9yKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgJ2RvYy1lbmQnOiB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmRvYykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBtc2cgPSAnVW5leHBlY3RlZCBkb2MtZW5kIHdpdGhvdXQgcHJlY2VkaW5nIGRvY3VtZW50JztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lcnJvcnMucHVzaChuZXcgZXJyb3JzLllBTUxQYXJzZUVycm9yKGdldEVycm9yUG9zKHRva2VuKSwgJ1VORVhQRUNURURfVE9LRU4nLCBtc2cpKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuZG9jLmRpcmVjdGl2ZXMuZG9jRW5kID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBjb25zdCBlbmQgPSByZXNvbHZlRW5kLnJlc29sdmVFbmQodG9rZW4uZW5kLCB0b2tlbi5vZmZzZXQgKyB0b2tlbi5zb3VyY2UubGVuZ3RoLCB0aGlzLmRvYy5vcHRpb25zLnN0cmljdCwgdGhpcy5vbkVycm9yKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRlY29yYXRlKHRoaXMuZG9jLCB0cnVlKTtcbiAgICAgICAgICAgICAgICBpZiAoZW5kLmNvbW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGMgPSB0aGlzLmRvYy5jb21tZW50O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRvYy5jb21tZW50ID0gZGMgPyBgJHtkY31cXG4ke2VuZC5jb21tZW50fWAgOiBlbmQuY29tbWVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5kb2MucmFuZ2VbMl0gPSBlbmQub2Zmc2V0O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aGlzLmVycm9ycy5wdXNoKG5ldyBlcnJvcnMuWUFNTFBhcnNlRXJyb3IoZ2V0RXJyb3JQb3ModG9rZW4pLCAnVU5FWFBFQ1RFRF9UT0tFTicsIGBVbnN1cHBvcnRlZCB0b2tlbiAke3Rva2VuLnR5cGV9YCkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENhbGwgYXQgZW5kIG9mIGlucHV0IHRvIHlpZWxkIGFueSByZW1haW5pbmcgZG9jdW1lbnQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZm9yY2VEb2MgLSBJZiB0aGUgc3RyZWFtIGNvbnRhaW5zIG5vIGRvY3VtZW50LCBzdGlsbCBlbWl0IGEgZmluYWwgZG9jdW1lbnQgaW5jbHVkaW5nIGFueSBjb21tZW50cyBhbmQgZGlyZWN0aXZlcyB0aGF0IHdvdWxkIGJlIGFwcGxpZWQgdG8gYSBzdWJzZXF1ZW50IGRvY3VtZW50LlxuICAgICAqIEBwYXJhbSBlbmRPZmZzZXQgLSBTaG91bGQgYmUgc2V0IGlmIGBmb3JjZURvY2AgaXMgYWxzbyBzZXQsIHRvIHNldCB0aGUgZG9jdW1lbnQgcmFuZ2UgZW5kIGFuZCB0byBpbmRpY2F0ZSBlcnJvcnMgY29ycmVjdGx5LlxuICAgICAqL1xuICAgICplbmQoZm9yY2VEb2MgPSBmYWxzZSwgZW5kT2Zmc2V0ID0gLTEpIHtcbiAgICAgICAgaWYgKHRoaXMuZG9jKSB7XG4gICAgICAgICAgICB0aGlzLmRlY29yYXRlKHRoaXMuZG9jLCB0cnVlKTtcbiAgICAgICAgICAgIHlpZWxkIHRoaXMuZG9jO1xuICAgICAgICAgICAgdGhpcy5kb2MgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGZvcmNlRG9jKSB7XG4gICAgICAgICAgICBjb25zdCBvcHRzID0gT2JqZWN0LmFzc2lnbih7IF9kaXJlY3RpdmVzOiB0aGlzLmRpcmVjdGl2ZXMgfSwgdGhpcy5vcHRpb25zKTtcbiAgICAgICAgICAgIGNvbnN0IGRvYyA9IG5ldyBEb2N1bWVudC5Eb2N1bWVudCh1bmRlZmluZWQsIG9wdHMpO1xuICAgICAgICAgICAgaWYgKHRoaXMuYXREaXJlY3RpdmVzKVxuICAgICAgICAgICAgICAgIHRoaXMub25FcnJvcihlbmRPZmZzZXQsICdNSVNTSU5HX0NIQVInLCAnTWlzc2luZyBkaXJlY3RpdmVzLWVuZCBpbmRpY2F0b3IgbGluZScpO1xuICAgICAgICAgICAgZG9jLnJhbmdlID0gWzAsIGVuZE9mZnNldCwgZW5kT2Zmc2V0XTtcbiAgICAgICAgICAgIHRoaXMuZGVjb3JhdGUoZG9jLCBmYWxzZSk7XG4gICAgICAgICAgICB5aWVsZCBkb2M7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydHMuQ29tcG9zZXIgPSBDb21wb3NlcjtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgcmVzb2x2ZUJsb2NrU2NhbGFyID0gcmVxdWlyZSgnLi4vY29tcG9zZS9yZXNvbHZlLWJsb2NrLXNjYWxhci5qcycpO1xudmFyIHJlc29sdmVGbG93U2NhbGFyID0gcmVxdWlyZSgnLi4vY29tcG9zZS9yZXNvbHZlLWZsb3ctc2NhbGFyLmpzJyk7XG52YXIgZXJyb3JzID0gcmVxdWlyZSgnLi4vZXJyb3JzLmpzJyk7XG52YXIgc3RyaW5naWZ5U3RyaW5nID0gcmVxdWlyZSgnLi4vc3RyaW5naWZ5L3N0cmluZ2lmeVN0cmluZy5qcycpO1xuXG5mdW5jdGlvbiByZXNvbHZlQXNTY2FsYXIodG9rZW4sIHN0cmljdCA9IHRydWUsIG9uRXJyb3IpIHtcbiAgICBpZiAodG9rZW4pIHtcbiAgICAgICAgY29uc3QgX29uRXJyb3IgPSAocG9zLCBjb2RlLCBtZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBvZmZzZXQgPSB0eXBlb2YgcG9zID09PSAnbnVtYmVyJyA/IHBvcyA6IEFycmF5LmlzQXJyYXkocG9zKSA/IHBvc1swXSA6IHBvcy5vZmZzZXQ7XG4gICAgICAgICAgICBpZiAob25FcnJvcilcbiAgICAgICAgICAgICAgICBvbkVycm9yKG9mZnNldCwgY29kZSwgbWVzc2FnZSk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IGVycm9ycy5ZQU1MUGFyc2VFcnJvcihbb2Zmc2V0LCBvZmZzZXQgKyAxXSwgY29kZSwgbWVzc2FnZSk7XG4gICAgICAgIH07XG4gICAgICAgIHN3aXRjaCAodG9rZW4udHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnc2NhbGFyJzpcbiAgICAgICAgICAgIGNhc2UgJ3NpbmdsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgICAgIGNhc2UgJ2RvdWJsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZUZsb3dTY2FsYXIucmVzb2x2ZUZsb3dTY2FsYXIodG9rZW4sIHN0cmljdCwgX29uRXJyb3IpO1xuICAgICAgICAgICAgY2FzZSAnYmxvY2stc2NhbGFyJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZUJsb2NrU2NhbGFyLnJlc29sdmVCbG9ja1NjYWxhcih7IG9wdGlvbnM6IHsgc3RyaWN0IH0gfSwgdG9rZW4sIF9vbkVycm9yKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn1cbi8qKlxuICogQ3JlYXRlIGEgbmV3IHNjYWxhciB0b2tlbiB3aXRoIGB2YWx1ZWBcbiAqXG4gKiBWYWx1ZXMgdGhhdCByZXByZXNlbnQgYW4gYWN0dWFsIHN0cmluZyBidXQgbWF5IGJlIHBhcnNlZCBhcyBhIGRpZmZlcmVudCB0eXBlIHNob3VsZCB1c2UgYSBgdHlwZWAgb3RoZXIgdGhhbiBgJ1BMQUlOJ2AsXG4gKiBhcyB0aGlzIGZ1bmN0aW9uIGRvZXMgbm90IHN1cHBvcnQgYW55IHNjaGVtYSBvcGVyYXRpb25zIGFuZCB3b24ndCBjaGVjayBmb3Igc3VjaCBjb25mbGljdHMuXG4gKlxuICogQHBhcmFtIHZhbHVlIFRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZhbHVlLCB3aGljaCB3aWxsIGhhdmUgaXRzIGNvbnRlbnQgcHJvcGVybHkgaW5kZW50ZWQuXG4gKiBAcGFyYW0gY29udGV4dC5lbmQgQ29tbWVudHMgYW5kIHdoaXRlc3BhY2UgYWZ0ZXIgdGhlIGVuZCBvZiB0aGUgdmFsdWUsIG9yIGFmdGVyIHRoZSBibG9jayBzY2FsYXIgaGVhZGVyLiBJZiB1bmRlZmluZWQsIGEgbmV3bGluZSB3aWxsIGJlIGFkZGVkLlxuICogQHBhcmFtIGNvbnRleHQuaW1wbGljaXRLZXkgQmVpbmcgd2l0aGluIGFuIGltcGxpY2l0IGtleSBtYXkgYWZmZWN0IHRoZSByZXNvbHZlZCB0eXBlIG9mIHRoZSB0b2tlbidzIHZhbHVlLlxuICogQHBhcmFtIGNvbnRleHQuaW5kZW50IFRoZSBpbmRlbnQgbGV2ZWwgb2YgdGhlIHRva2VuLlxuICogQHBhcmFtIGNvbnRleHQuaW5GbG93IElzIHRoaXMgc2NhbGFyIHdpdGhpbiBhIGZsb3cgY29sbGVjdGlvbj8gVGhpcyBtYXkgYWZmZWN0IHRoZSByZXNvbHZlZCB0eXBlIG9mIHRoZSB0b2tlbidzIHZhbHVlLlxuICogQHBhcmFtIGNvbnRleHQub2Zmc2V0IFRoZSBvZmZzZXQgcG9zaXRpb24gb2YgdGhlIHRva2VuLlxuICogQHBhcmFtIGNvbnRleHQudHlwZSBUaGUgcHJlZmVycmVkIHR5cGUgb2YgdGhlIHNjYWxhciB0b2tlbi4gSWYgdW5kZWZpbmVkLCB0aGUgcHJldmlvdXMgdHlwZSBvZiB0aGUgYHRva2VuYCB3aWxsIGJlIHVzZWQsIGRlZmF1bHRpbmcgdG8gYCdQTEFJTidgLlxuICovXG5mdW5jdGlvbiBjcmVhdGVTY2FsYXJUb2tlbih2YWx1ZSwgY29udGV4dCkge1xuICAgIGNvbnN0IHsgaW1wbGljaXRLZXkgPSBmYWxzZSwgaW5kZW50LCBpbkZsb3cgPSBmYWxzZSwgb2Zmc2V0ID0gLTEsIHR5cGUgPSAnUExBSU4nIH0gPSBjb250ZXh0O1xuICAgIGNvbnN0IHNvdXJjZSA9IHN0cmluZ2lmeVN0cmluZy5zdHJpbmdpZnlTdHJpbmcoeyB0eXBlLCB2YWx1ZSB9LCB7XG4gICAgICAgIGltcGxpY2l0S2V5LFxuICAgICAgICBpbmRlbnQ6IGluZGVudCA+IDAgPyAnICcucmVwZWF0KGluZGVudCkgOiAnJyxcbiAgICAgICAgaW5GbG93LFxuICAgICAgICBvcHRpb25zOiB7IGJsb2NrUXVvdGU6IHRydWUsIGxpbmVXaWR0aDogLTEgfVxuICAgIH0pO1xuICAgIGNvbnN0IGVuZCA9IGNvbnRleHQuZW5kID8/IFtcbiAgICAgICAgeyB0eXBlOiAnbmV3bGluZScsIG9mZnNldDogLTEsIGluZGVudCwgc291cmNlOiAnXFxuJyB9XG4gICAgXTtcbiAgICBzd2l0Y2ggKHNvdXJjZVswXSkge1xuICAgICAgICBjYXNlICd8JzpcbiAgICAgICAgY2FzZSAnPic6IHtcbiAgICAgICAgICAgIGNvbnN0IGhlID0gc291cmNlLmluZGV4T2YoJ1xcbicpO1xuICAgICAgICAgICAgY29uc3QgaGVhZCA9IHNvdXJjZS5zdWJzdHJpbmcoMCwgaGUpO1xuICAgICAgICAgICAgY29uc3QgYm9keSA9IHNvdXJjZS5zdWJzdHJpbmcoaGUgKyAxKSArICdcXG4nO1xuICAgICAgICAgICAgY29uc3QgcHJvcHMgPSBbXG4gICAgICAgICAgICAgICAgeyB0eXBlOiAnYmxvY2stc2NhbGFyLWhlYWRlcicsIG9mZnNldCwgaW5kZW50LCBzb3VyY2U6IGhlYWQgfVxuICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIGlmICghYWRkRW5kdG9CbG9ja1Byb3BzKHByb3BzLCBlbmQpKVxuICAgICAgICAgICAgICAgIHByb3BzLnB1c2goeyB0eXBlOiAnbmV3bGluZScsIG9mZnNldDogLTEsIGluZGVudCwgc291cmNlOiAnXFxuJyB9KTtcbiAgICAgICAgICAgIHJldHVybiB7IHR5cGU6ICdibG9jay1zY2FsYXInLCBvZmZzZXQsIGluZGVudCwgcHJvcHMsIHNvdXJjZTogYm9keSB9O1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ1wiJzpcbiAgICAgICAgICAgIHJldHVybiB7IHR5cGU6ICdkb3VibGUtcXVvdGVkLXNjYWxhcicsIG9mZnNldCwgaW5kZW50LCBzb3VyY2UsIGVuZCB9O1xuICAgICAgICBjYXNlIFwiJ1wiOlxuICAgICAgICAgICAgcmV0dXJuIHsgdHlwZTogJ3NpbmdsZS1xdW90ZWQtc2NhbGFyJywgb2Zmc2V0LCBpbmRlbnQsIHNvdXJjZSwgZW5kIH07XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4geyB0eXBlOiAnc2NhbGFyJywgb2Zmc2V0LCBpbmRlbnQsIHNvdXJjZSwgZW5kIH07XG4gICAgfVxufVxuLyoqXG4gKiBTZXQgdGhlIHZhbHVlIG9mIGB0b2tlbmAgdG8gdGhlIGdpdmVuIHN0cmluZyBgdmFsdWVgLCBvdmVyd3JpdGluZyBhbnkgcHJldmlvdXMgY29udGVudHMgYW5kIHR5cGUgdGhhdCBpdCBtYXkgaGF2ZS5cbiAqXG4gKiBCZXN0IGVmZm9ydHMgYXJlIG1hZGUgdG8gcmV0YWluIGFueSBjb21tZW50cyBwcmV2aW91c2x5IGFzc29jaWF0ZWQgd2l0aCB0aGUgYHRva2VuYCxcbiAqIHRob3VnaCBhbGwgY29udGVudHMgd2l0aGluIGEgY29sbGVjdGlvbidzIGBpdGVtc2Agd2lsbCBiZSBvdmVyd3JpdHRlbi5cbiAqXG4gKiBWYWx1ZXMgdGhhdCByZXByZXNlbnQgYW4gYWN0dWFsIHN0cmluZyBidXQgbWF5IGJlIHBhcnNlZCBhcyBhIGRpZmZlcmVudCB0eXBlIHNob3VsZCB1c2UgYSBgdHlwZWAgb3RoZXIgdGhhbiBgJ1BMQUlOJ2AsXG4gKiBhcyB0aGlzIGZ1bmN0aW9uIGRvZXMgbm90IHN1cHBvcnQgYW55IHNjaGVtYSBvcGVyYXRpb25zIGFuZCB3b24ndCBjaGVjayBmb3Igc3VjaCBjb25mbGljdHMuXG4gKlxuICogQHBhcmFtIHRva2VuIEFueSB0b2tlbi4gSWYgaXQgZG9lcyBub3QgaW5jbHVkZSBhbiBgaW5kZW50YCB2YWx1ZSwgdGhlIHZhbHVlIHdpbGwgYmUgc3RyaW5naWZpZWQgYXMgaWYgaXQgd2VyZSBhbiBpbXBsaWNpdCBrZXkuXG4gKiBAcGFyYW0gdmFsdWUgVGhlIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmFsdWUsIHdoaWNoIHdpbGwgaGF2ZSBpdHMgY29udGVudCBwcm9wZXJseSBpbmRlbnRlZC5cbiAqIEBwYXJhbSBjb250ZXh0LmFmdGVyS2V5IEluIG1vc3QgY2FzZXMsIHZhbHVlcyBhZnRlciBhIGtleSBzaG91bGQgaGF2ZSBhbiBhZGRpdGlvbmFsIGxldmVsIG9mIGluZGVudGF0aW9uLlxuICogQHBhcmFtIGNvbnRleHQuaW1wbGljaXRLZXkgQmVpbmcgd2l0aGluIGFuIGltcGxpY2l0IGtleSBtYXkgYWZmZWN0IHRoZSByZXNvbHZlZCB0eXBlIG9mIHRoZSB0b2tlbidzIHZhbHVlLlxuICogQHBhcmFtIGNvbnRleHQuaW5GbG93IEJlaW5nIHdpdGhpbiBhIGZsb3cgY29sbGVjdGlvbiBtYXkgYWZmZWN0IHRoZSByZXNvbHZlZCB0eXBlIG9mIHRoZSB0b2tlbidzIHZhbHVlLlxuICogQHBhcmFtIGNvbnRleHQudHlwZSBUaGUgcHJlZmVycmVkIHR5cGUgb2YgdGhlIHNjYWxhciB0b2tlbi4gSWYgdW5kZWZpbmVkLCB0aGUgcHJldmlvdXMgdHlwZSBvZiB0aGUgYHRva2VuYCB3aWxsIGJlIHVzZWQsIGRlZmF1bHRpbmcgdG8gYCdQTEFJTidgLlxuICovXG5mdW5jdGlvbiBzZXRTY2FsYXJWYWx1ZSh0b2tlbiwgdmFsdWUsIGNvbnRleHQgPSB7fSkge1xuICAgIGxldCB7IGFmdGVyS2V5ID0gZmFsc2UsIGltcGxpY2l0S2V5ID0gZmFsc2UsIGluRmxvdyA9IGZhbHNlLCB0eXBlIH0gPSBjb250ZXh0O1xuICAgIGxldCBpbmRlbnQgPSAnaW5kZW50JyBpbiB0b2tlbiA/IHRva2VuLmluZGVudCA6IG51bGw7XG4gICAgaWYgKGFmdGVyS2V5ICYmIHR5cGVvZiBpbmRlbnQgPT09ICdudW1iZXInKVxuICAgICAgICBpbmRlbnQgKz0gMjtcbiAgICBpZiAoIXR5cGUpXG4gICAgICAgIHN3aXRjaCAodG9rZW4udHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnc2luZ2xlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICAgICAgICAgIHR5cGUgPSAnUVVPVEVfU0lOR0xFJztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2RvdWJsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgICAgICAgICB0eXBlID0gJ1FVT1RFX0RPVUJMRSc7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdibG9jay1zY2FsYXInOiB7XG4gICAgICAgICAgICAgICAgY29uc3QgaGVhZGVyID0gdG9rZW4ucHJvcHNbMF07XG4gICAgICAgICAgICAgICAgaWYgKGhlYWRlci50eXBlICE9PSAnYmxvY2stc2NhbGFyLWhlYWRlcicpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBibG9jayBzY2FsYXIgaGVhZGVyJyk7XG4gICAgICAgICAgICAgICAgdHlwZSA9IGhlYWRlci5zb3VyY2VbMF0gPT09ICc+JyA/ICdCTE9DS19GT0xERUQnIDogJ0JMT0NLX0xJVEVSQUwnO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0eXBlID0gJ1BMQUlOJztcbiAgICAgICAgfVxuICAgIGNvbnN0IHNvdXJjZSA9IHN0cmluZ2lmeVN0cmluZy5zdHJpbmdpZnlTdHJpbmcoeyB0eXBlLCB2YWx1ZSB9LCB7XG4gICAgICAgIGltcGxpY2l0S2V5OiBpbXBsaWNpdEtleSB8fCBpbmRlbnQgPT09IG51bGwsXG4gICAgICAgIGluZGVudDogaW5kZW50ICE9PSBudWxsICYmIGluZGVudCA+IDAgPyAnICcucmVwZWF0KGluZGVudCkgOiAnJyxcbiAgICAgICAgaW5GbG93LFxuICAgICAgICBvcHRpb25zOiB7IGJsb2NrUXVvdGU6IHRydWUsIGxpbmVXaWR0aDogLTEgfVxuICAgIH0pO1xuICAgIHN3aXRjaCAoc291cmNlWzBdKSB7XG4gICAgICAgIGNhc2UgJ3wnOlxuICAgICAgICBjYXNlICc+JzpcbiAgICAgICAgICAgIHNldEJsb2NrU2NhbGFyVmFsdWUodG9rZW4sIHNvdXJjZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnXCInOlxuICAgICAgICAgICAgc2V0Rmxvd1NjYWxhclZhbHVlKHRva2VuLCBzb3VyY2UsICdkb3VibGUtcXVvdGVkLXNjYWxhcicpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCInXCI6XG4gICAgICAgICAgICBzZXRGbG93U2NhbGFyVmFsdWUodG9rZW4sIHNvdXJjZSwgJ3NpbmdsZS1xdW90ZWQtc2NhbGFyJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHNldEZsb3dTY2FsYXJWYWx1ZSh0b2tlbiwgc291cmNlLCAnc2NhbGFyJyk7XG4gICAgfVxufVxuZnVuY3Rpb24gc2V0QmxvY2tTY2FsYXJWYWx1ZSh0b2tlbiwgc291cmNlKSB7XG4gICAgY29uc3QgaGUgPSBzb3VyY2UuaW5kZXhPZignXFxuJyk7XG4gICAgY29uc3QgaGVhZCA9IHNvdXJjZS5zdWJzdHJpbmcoMCwgaGUpO1xuICAgIGNvbnN0IGJvZHkgPSBzb3VyY2Uuc3Vic3RyaW5nKGhlICsgMSkgKyAnXFxuJztcbiAgICBpZiAodG9rZW4udHlwZSA9PT0gJ2Jsb2NrLXNjYWxhcicpIHtcbiAgICAgICAgY29uc3QgaGVhZGVyID0gdG9rZW4ucHJvcHNbMF07XG4gICAgICAgIGlmIChoZWFkZXIudHlwZSAhPT0gJ2Jsb2NrLXNjYWxhci1oZWFkZXInKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGJsb2NrIHNjYWxhciBoZWFkZXInKTtcbiAgICAgICAgaGVhZGVyLnNvdXJjZSA9IGhlYWQ7XG4gICAgICAgIHRva2VuLnNvdXJjZSA9IGJvZHk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjb25zdCB7IG9mZnNldCB9ID0gdG9rZW47XG4gICAgICAgIGNvbnN0IGluZGVudCA9ICdpbmRlbnQnIGluIHRva2VuID8gdG9rZW4uaW5kZW50IDogLTE7XG4gICAgICAgIGNvbnN0IHByb3BzID0gW1xuICAgICAgICAgICAgeyB0eXBlOiAnYmxvY2stc2NhbGFyLWhlYWRlcicsIG9mZnNldCwgaW5kZW50LCBzb3VyY2U6IGhlYWQgfVxuICAgICAgICBdO1xuICAgICAgICBpZiAoIWFkZEVuZHRvQmxvY2tQcm9wcyhwcm9wcywgJ2VuZCcgaW4gdG9rZW4gPyB0b2tlbi5lbmQgOiB1bmRlZmluZWQpKVxuICAgICAgICAgICAgcHJvcHMucHVzaCh7IHR5cGU6ICduZXdsaW5lJywgb2Zmc2V0OiAtMSwgaW5kZW50LCBzb3VyY2U6ICdcXG4nIH0pO1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyh0b2tlbikpXG4gICAgICAgICAgICBpZiAoa2V5ICE9PSAndHlwZScgJiYga2V5ICE9PSAnb2Zmc2V0JylcbiAgICAgICAgICAgICAgICBkZWxldGUgdG9rZW5ba2V5XTtcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0b2tlbiwgeyB0eXBlOiAnYmxvY2stc2NhbGFyJywgaW5kZW50LCBwcm9wcywgc291cmNlOiBib2R5IH0pO1xuICAgIH1cbn1cbi8qKiBAcmV0dXJucyBgdHJ1ZWAgaWYgbGFzdCB0b2tlbiBpcyBhIG5ld2xpbmUgKi9cbmZ1bmN0aW9uIGFkZEVuZHRvQmxvY2tQcm9wcyhwcm9wcywgZW5kKSB7XG4gICAgaWYgKGVuZClcbiAgICAgICAgZm9yIChjb25zdCBzdCBvZiBlbmQpXG4gICAgICAgICAgICBzd2l0Y2ggKHN0LnR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgICAgICAgICAgICAgIHByb3BzLnB1c2goc3QpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICAgICAgcHJvcHMucHVzaChzdCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cbmZ1bmN0aW9uIHNldEZsb3dTY2FsYXJWYWx1ZSh0b2tlbiwgc291cmNlLCB0eXBlKSB7XG4gICAgc3dpdGNoICh0b2tlbi50eXBlKSB7XG4gICAgICAgIGNhc2UgJ3NjYWxhcic6XG4gICAgICAgIGNhc2UgJ2RvdWJsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgY2FzZSAnc2luZ2xlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICAgICAgdG9rZW4udHlwZSA9IHR5cGU7XG4gICAgICAgICAgICB0b2tlbi5zb3VyY2UgPSBzb3VyY2U7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnYmxvY2stc2NhbGFyJzoge1xuICAgICAgICAgICAgY29uc3QgZW5kID0gdG9rZW4ucHJvcHMuc2xpY2UoMSk7XG4gICAgICAgICAgICBsZXQgb2EgPSBzb3VyY2UubGVuZ3RoO1xuICAgICAgICAgICAgaWYgKHRva2VuLnByb3BzWzBdLnR5cGUgPT09ICdibG9jay1zY2FsYXItaGVhZGVyJylcbiAgICAgICAgICAgICAgICBvYSAtPSB0b2tlbi5wcm9wc1swXS5zb3VyY2UubGVuZ3RoO1xuICAgICAgICAgICAgZm9yIChjb25zdCB0b2sgb2YgZW5kKVxuICAgICAgICAgICAgICAgIHRvay5vZmZzZXQgKz0gb2E7XG4gICAgICAgICAgICBkZWxldGUgdG9rZW4ucHJvcHM7XG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKHRva2VuLCB7IHR5cGUsIHNvdXJjZSwgZW5kIH0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnYmxvY2stbWFwJzpcbiAgICAgICAgY2FzZSAnYmxvY2stc2VxJzoge1xuICAgICAgICAgICAgY29uc3Qgb2Zmc2V0ID0gdG9rZW4ub2Zmc2V0ICsgc291cmNlLmxlbmd0aDtcbiAgICAgICAgICAgIGNvbnN0IG5sID0geyB0eXBlOiAnbmV3bGluZScsIG9mZnNldCwgaW5kZW50OiB0b2tlbi5pbmRlbnQsIHNvdXJjZTogJ1xcbicgfTtcbiAgICAgICAgICAgIGRlbGV0ZSB0b2tlbi5pdGVtcztcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odG9rZW4sIHsgdHlwZSwgc291cmNlLCBlbmQ6IFtubF0gfSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICBjb25zdCBpbmRlbnQgPSAnaW5kZW50JyBpbiB0b2tlbiA/IHRva2VuLmluZGVudCA6IC0xO1xuICAgICAgICAgICAgY29uc3QgZW5kID0gJ2VuZCcgaW4gdG9rZW4gJiYgQXJyYXkuaXNBcnJheSh0b2tlbi5lbmQpXG4gICAgICAgICAgICAgICAgPyB0b2tlbi5lbmQuZmlsdGVyKHN0ID0+IHN0LnR5cGUgPT09ICdzcGFjZScgfHxcbiAgICAgICAgICAgICAgICAgICAgc3QudHlwZSA9PT0gJ2NvbW1lbnQnIHx8XG4gICAgICAgICAgICAgICAgICAgIHN0LnR5cGUgPT09ICduZXdsaW5lJylcbiAgICAgICAgICAgICAgICA6IFtdO1xuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXModG9rZW4pKVxuICAgICAgICAgICAgICAgIGlmIChrZXkgIT09ICd0eXBlJyAmJiBrZXkgIT09ICdvZmZzZXQnKVxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgdG9rZW5ba2V5XTtcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odG9rZW4sIHsgdHlwZSwgaW5kZW50LCBzb3VyY2UsIGVuZCB9KTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0cy5jcmVhdGVTY2FsYXJUb2tlbiA9IGNyZWF0ZVNjYWxhclRva2VuO1xuZXhwb3J0cy5yZXNvbHZlQXNTY2FsYXIgPSByZXNvbHZlQXNTY2FsYXI7XG5leHBvcnRzLnNldFNjYWxhclZhbHVlID0gc2V0U2NhbGFyVmFsdWU7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBTdHJpbmdpZnkgYSBDU1QgZG9jdW1lbnQsIHRva2VuLCBvciBjb2xsZWN0aW9uIGl0ZW1cbiAqXG4gKiBGYWlyIHdhcm5pbmc6IFRoaXMgYXBwbGllcyBubyB2YWxpZGF0aW9uIHdoYXRzb2V2ZXIsIGFuZFxuICogc2ltcGx5IGNvbmNhdGVuYXRlcyB0aGUgc291cmNlcyBpbiB0aGVpciBsb2dpY2FsIG9yZGVyLlxuICovXG5jb25zdCBzdHJpbmdpZnkgPSAoY3N0KSA9PiAndHlwZScgaW4gY3N0ID8gc3RyaW5naWZ5VG9rZW4oY3N0KSA6IHN0cmluZ2lmeUl0ZW0oY3N0KTtcbmZ1bmN0aW9uIHN0cmluZ2lmeVRva2VuKHRva2VuKSB7XG4gICAgc3dpdGNoICh0b2tlbi50eXBlKSB7XG4gICAgICAgIGNhc2UgJ2Jsb2NrLXNjYWxhcic6IHtcbiAgICAgICAgICAgIGxldCByZXMgPSAnJztcbiAgICAgICAgICAgIGZvciAoY29uc3QgdG9rIG9mIHRva2VuLnByb3BzKVxuICAgICAgICAgICAgICAgIHJlcyArPSBzdHJpbmdpZnlUb2tlbih0b2spO1xuICAgICAgICAgICAgcmV0dXJuIHJlcyArIHRva2VuLnNvdXJjZTtcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdibG9jay1tYXAnOlxuICAgICAgICBjYXNlICdibG9jay1zZXEnOiB7XG4gICAgICAgICAgICBsZXQgcmVzID0gJyc7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgdG9rZW4uaXRlbXMpXG4gICAgICAgICAgICAgICAgcmVzICs9IHN0cmluZ2lmeUl0ZW0oaXRlbSk7XG4gICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ2Zsb3ctY29sbGVjdGlvbic6IHtcbiAgICAgICAgICAgIGxldCByZXMgPSB0b2tlbi5zdGFydC5zb3VyY2U7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgdG9rZW4uaXRlbXMpXG4gICAgICAgICAgICAgICAgcmVzICs9IHN0cmluZ2lmeUl0ZW0oaXRlbSk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHN0IG9mIHRva2VuLmVuZClcbiAgICAgICAgICAgICAgICByZXMgKz0gc3Quc291cmNlO1xuICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdkb2N1bWVudCc6IHtcbiAgICAgICAgICAgIGxldCByZXMgPSBzdHJpbmdpZnlJdGVtKHRva2VuKTtcbiAgICAgICAgICAgIGlmICh0b2tlbi5lbmQpXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBzdCBvZiB0b2tlbi5lbmQpXG4gICAgICAgICAgICAgICAgICAgIHJlcyArPSBzdC5zb3VyY2U7XG4gICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICB9XG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgIGxldCByZXMgPSB0b2tlbi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoJ2VuZCcgaW4gdG9rZW4gJiYgdG9rZW4uZW5kKVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgc3Qgb2YgdG9rZW4uZW5kKVxuICAgICAgICAgICAgICAgICAgICByZXMgKz0gc3Quc291cmNlO1xuICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIHN0cmluZ2lmeUl0ZW0oeyBzdGFydCwga2V5LCBzZXAsIHZhbHVlIH0pIHtcbiAgICBsZXQgcmVzID0gJyc7XG4gICAgZm9yIChjb25zdCBzdCBvZiBzdGFydClcbiAgICAgICAgcmVzICs9IHN0LnNvdXJjZTtcbiAgICBpZiAoa2V5KVxuICAgICAgICByZXMgKz0gc3RyaW5naWZ5VG9rZW4oa2V5KTtcbiAgICBpZiAoc2VwKVxuICAgICAgICBmb3IgKGNvbnN0IHN0IG9mIHNlcClcbiAgICAgICAgICAgIHJlcyArPSBzdC5zb3VyY2U7XG4gICAgaWYgKHZhbHVlKVxuICAgICAgICByZXMgKz0gc3RyaW5naWZ5VG9rZW4odmFsdWUpO1xuICAgIHJldHVybiByZXM7XG59XG5cbmV4cG9ydHMuc3RyaW5naWZ5ID0gc3RyaW5naWZ5O1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbmNvbnN0IEJSRUFLID0gU3ltYm9sKCdicmVhayB2aXNpdCcpO1xuY29uc3QgU0tJUCA9IFN5bWJvbCgnc2tpcCBjaGlsZHJlbicpO1xuY29uc3QgUkVNT1ZFID0gU3ltYm9sKCdyZW1vdmUgaXRlbScpO1xuLyoqXG4gKiBBcHBseSBhIHZpc2l0b3IgdG8gYSBDU1QgZG9jdW1lbnQgb3IgaXRlbS5cbiAqXG4gKiBXYWxrcyB0aHJvdWdoIHRoZSB0cmVlIChkZXB0aC1maXJzdCkgc3RhcnRpbmcgZnJvbSB0aGUgcm9vdCwgY2FsbGluZyBhXG4gKiBgdmlzaXRvcmAgZnVuY3Rpb24gd2l0aCB0d28gYXJndW1lbnRzIHdoZW4gZW50ZXJpbmcgZWFjaCBpdGVtOlxuICogICAtIGBpdGVtYDogVGhlIGN1cnJlbnQgaXRlbSwgd2hpY2ggaW5jbHVkZWQgdGhlIGZvbGxvd2luZyBtZW1iZXJzOlxuICogICAgIC0gYHN0YXJ0OiBTb3VyY2VUb2tlbltdYCDigJMgU291cmNlIHRva2VucyBiZWZvcmUgdGhlIGtleSBvciB2YWx1ZSxcbiAqICAgICAgIHBvc3NpYmx5IGluY2x1ZGluZyBpdHMgYW5jaG9yIG9yIHRhZy5cbiAqICAgICAtIGBrZXk/OiBUb2tlbiB8IG51bGxgIOKAkyBTZXQgZm9yIHBhaXIgdmFsdWVzLiBNYXkgdGhlbiBiZSBgbnVsbGAsIGlmXG4gKiAgICAgICB0aGUga2V5IGJlZm9yZSB0aGUgYDpgIHNlcGFyYXRvciBpcyBlbXB0eS5cbiAqICAgICAtIGBzZXA/OiBTb3VyY2VUb2tlbltdYCDigJMgU291cmNlIHRva2VucyBiZXR3ZWVuIHRoZSBrZXkgYW5kIHRoZSB2YWx1ZSxcbiAqICAgICAgIHdoaWNoIHNob3VsZCBpbmNsdWRlIHRoZSBgOmAgbWFwIHZhbHVlIGluZGljYXRvciBpZiBgdmFsdWVgIGlzIHNldC5cbiAqICAgICAtIGB2YWx1ZT86IFRva2VuYCDigJMgVGhlIHZhbHVlIG9mIGEgc2VxdWVuY2UgaXRlbSwgb3Igb2YgYSBtYXAgcGFpci5cbiAqICAgLSBgcGF0aGA6IFRoZSBzdGVwcyBmcm9tIHRoZSByb290IHRvIHRoZSBjdXJyZW50IG5vZGUsIGFzIGFuIGFycmF5IG9mXG4gKiAgICAgYFsna2V5JyB8ICd2YWx1ZScsIG51bWJlcl1gIHR1cGxlcy5cbiAqXG4gKiBUaGUgcmV0dXJuIHZhbHVlIG9mIHRoZSB2aXNpdG9yIG1heSBiZSB1c2VkIHRvIGNvbnRyb2wgdGhlIHRyYXZlcnNhbDpcbiAqICAgLSBgdW5kZWZpbmVkYCAoZGVmYXVsdCk6IERvIG5vdGhpbmcgYW5kIGNvbnRpbnVlXG4gKiAgIC0gYHZpc2l0LlNLSVBgOiBEbyBub3QgdmlzaXQgdGhlIGNoaWxkcmVuIG9mIHRoaXMgdG9rZW4sIGNvbnRpbnVlIHdpdGhcbiAqICAgICAgbmV4dCBzaWJsaW5nXG4gKiAgIC0gYHZpc2l0LkJSRUFLYDogVGVybWluYXRlIHRyYXZlcnNhbCBjb21wbGV0ZWx5XG4gKiAgIC0gYHZpc2l0LlJFTU9WRWA6IFJlbW92ZSB0aGUgY3VycmVudCBpdGVtLCB0aGVuIGNvbnRpbnVlIHdpdGggdGhlIG5leHQgb25lXG4gKiAgIC0gYG51bWJlcmA6IFNldCB0aGUgaW5kZXggb2YgdGhlIG5leHQgc3RlcC4gVGhpcyBpcyB1c2VmdWwgZXNwZWNpYWxseSBpZlxuICogICAgIHRoZSBpbmRleCBvZiB0aGUgY3VycmVudCB0b2tlbiBoYXMgY2hhbmdlZC5cbiAqICAgLSBgZnVuY3Rpb25gOiBEZWZpbmUgdGhlIG5leHQgdmlzaXRvciBmb3IgdGhpcyBpdGVtLiBBZnRlciB0aGUgb3JpZ2luYWxcbiAqICAgICB2aXNpdG9yIGlzIGNhbGxlZCBvbiBpdGVtIGVudHJ5LCBuZXh0IHZpc2l0b3JzIGFyZSBjYWxsZWQgYWZ0ZXIgaGFuZGxpbmdcbiAqICAgICBhIG5vbi1lbXB0eSBga2V5YCBhbmQgd2hlbiBleGl0aW5nIHRoZSBpdGVtLlxuICovXG5mdW5jdGlvbiB2aXNpdChjc3QsIHZpc2l0b3IpIHtcbiAgICBpZiAoJ3R5cGUnIGluIGNzdCAmJiBjc3QudHlwZSA9PT0gJ2RvY3VtZW50JylcbiAgICAgICAgY3N0ID0geyBzdGFydDogY3N0LnN0YXJ0LCB2YWx1ZTogY3N0LnZhbHVlIH07XG4gICAgX3Zpc2l0KE9iamVjdC5mcmVlemUoW10pLCBjc3QsIHZpc2l0b3IpO1xufVxuLy8gV2l0aG91dCB0aGUgYGFzIHN5bWJvbGAgY2FzdHMsIFRTIGRlY2xhcmVzIHRoZXNlIGluIHRoZSBgdmlzaXRgXG4vLyBuYW1lc3BhY2UgdXNpbmcgYHZhcmAsIGJ1dCB0aGVuIGNvbXBsYWlucyBhYm91dCB0aGF0IGJlY2F1c2Vcbi8vIGB1bmlxdWUgc3ltYm9sYCBtdXN0IGJlIGBjb25zdGAuXG4vKiogVGVybWluYXRlIHZpc2l0IHRyYXZlcnNhbCBjb21wbGV0ZWx5ICovXG52aXNpdC5CUkVBSyA9IEJSRUFLO1xuLyoqIERvIG5vdCB2aXNpdCB0aGUgY2hpbGRyZW4gb2YgdGhlIGN1cnJlbnQgaXRlbSAqL1xudmlzaXQuU0tJUCA9IFNLSVA7XG4vKiogUmVtb3ZlIHRoZSBjdXJyZW50IGl0ZW0gKi9cbnZpc2l0LlJFTU9WRSA9IFJFTU9WRTtcbi8qKiBGaW5kIHRoZSBpdGVtIGF0IGBwYXRoYCBmcm9tIGBjc3RgIGFzIHRoZSByb290ICovXG52aXNpdC5pdGVtQXRQYXRoID0gKGNzdCwgcGF0aCkgPT4ge1xuICAgIGxldCBpdGVtID0gY3N0O1xuICAgIGZvciAoY29uc3QgW2ZpZWxkLCBpbmRleF0gb2YgcGF0aCkge1xuICAgICAgICBjb25zdCB0b2sgPSBpdGVtPy5bZmllbGRdO1xuICAgICAgICBpZiAodG9rICYmICdpdGVtcycgaW4gdG9rKSB7XG4gICAgICAgICAgICBpdGVtID0gdG9rLml0ZW1zW2luZGV4XTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICByZXR1cm4gaXRlbTtcbn07XG4vKipcbiAqIEdldCB0aGUgaW1tZWRpYXRlIHBhcmVudCBjb2xsZWN0aW9uIG9mIHRoZSBpdGVtIGF0IGBwYXRoYCBmcm9tIGBjc3RgIGFzIHRoZSByb290LlxuICpcbiAqIFRocm93cyBhbiBlcnJvciBpZiB0aGUgY29sbGVjdGlvbiBpcyBub3QgZm91bmQsIHdoaWNoIHNob3VsZCBuZXZlciBoYXBwZW4gaWYgdGhlIGl0ZW0gaXRzZWxmIGV4aXN0cy5cbiAqL1xudmlzaXQucGFyZW50Q29sbGVjdGlvbiA9IChjc3QsIHBhdGgpID0+IHtcbiAgICBjb25zdCBwYXJlbnQgPSB2aXNpdC5pdGVtQXRQYXRoKGNzdCwgcGF0aC5zbGljZSgwLCAtMSkpO1xuICAgIGNvbnN0IGZpZWxkID0gcGF0aFtwYXRoLmxlbmd0aCAtIDFdWzBdO1xuICAgIGNvbnN0IGNvbGwgPSBwYXJlbnQ/LltmaWVsZF07XG4gICAgaWYgKGNvbGwgJiYgJ2l0ZW1zJyBpbiBjb2xsKVxuICAgICAgICByZXR1cm4gY29sbDtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1BhcmVudCBjb2xsZWN0aW9uIG5vdCBmb3VuZCcpO1xufTtcbmZ1bmN0aW9uIF92aXNpdChwYXRoLCBpdGVtLCB2aXNpdG9yKSB7XG4gICAgbGV0IGN0cmwgPSB2aXNpdG9yKGl0ZW0sIHBhdGgpO1xuICAgIGlmICh0eXBlb2YgY3RybCA9PT0gJ3N5bWJvbCcpXG4gICAgICAgIHJldHVybiBjdHJsO1xuICAgIGZvciAoY29uc3QgZmllbGQgb2YgWydrZXknLCAndmFsdWUnXSkge1xuICAgICAgICBjb25zdCB0b2tlbiA9IGl0ZW1bZmllbGRdO1xuICAgICAgICBpZiAodG9rZW4gJiYgJ2l0ZW1zJyBpbiB0b2tlbikge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0b2tlbi5pdGVtcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNpID0gX3Zpc2l0KE9iamVjdC5mcmVlemUocGF0aC5jb25jYXQoW1tmaWVsZCwgaV1dKSksIHRva2VuLml0ZW1zW2ldLCB2aXNpdG9yKTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNpID09PSAnbnVtYmVyJylcbiAgICAgICAgICAgICAgICAgICAgaSA9IGNpIC0gMTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChjaSA9PT0gQlJFQUspXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBCUkVBSztcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChjaSA9PT0gUkVNT1ZFKSB7XG4gICAgICAgICAgICAgICAgICAgIHRva2VuLml0ZW1zLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgaSAtPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2YgY3RybCA9PT0gJ2Z1bmN0aW9uJyAmJiBmaWVsZCA9PT0gJ2tleScpXG4gICAgICAgICAgICAgICAgY3RybCA9IGN0cmwoaXRlbSwgcGF0aCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHR5cGVvZiBjdHJsID09PSAnZnVuY3Rpb24nID8gY3RybChpdGVtLCBwYXRoKSA6IGN0cmw7XG59XG5cbmV4cG9ydHMudmlzaXQgPSB2aXNpdDtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY3N0U2NhbGFyID0gcmVxdWlyZSgnLi9jc3Qtc2NhbGFyLmpzJyk7XG52YXIgY3N0U3RyaW5naWZ5ID0gcmVxdWlyZSgnLi9jc3Qtc3RyaW5naWZ5LmpzJyk7XG52YXIgY3N0VmlzaXQgPSByZXF1aXJlKCcuL2NzdC12aXNpdC5qcycpO1xuXG4vKiogVGhlIGJ5dGUgb3JkZXIgbWFyayAqL1xuY29uc3QgQk9NID0gJ1xcdXtGRUZGfSc7XG4vKiogU3RhcnQgb2YgZG9jLW1vZGUgKi9cbmNvbnN0IERPQ1VNRU5UID0gJ1xceDAyJzsgLy8gQzA6IFN0YXJ0IG9mIFRleHRcbi8qKiBVbmV4cGVjdGVkIGVuZCBvZiBmbG93LW1vZGUgKi9cbmNvbnN0IEZMT1dfRU5EID0gJ1xceDE4JzsgLy8gQzA6IENhbmNlbFxuLyoqIE5leHQgdG9rZW4gaXMgYSBzY2FsYXIgdmFsdWUgKi9cbmNvbnN0IFNDQUxBUiA9ICdcXHgxZic7IC8vIEMwOiBVbml0IFNlcGFyYXRvclxuLyoqIEByZXR1cm5zIGB0cnVlYCBpZiBgdG9rZW5gIGlzIGEgZmxvdyBvciBibG9jayBjb2xsZWN0aW9uICovXG5jb25zdCBpc0NvbGxlY3Rpb24gPSAodG9rZW4pID0+ICEhdG9rZW4gJiYgJ2l0ZW1zJyBpbiB0b2tlbjtcbi8qKiBAcmV0dXJucyBgdHJ1ZWAgaWYgYHRva2VuYCBpcyBhIGZsb3cgb3IgYmxvY2sgc2NhbGFyOyBub3QgYW4gYWxpYXMgKi9cbmNvbnN0IGlzU2NhbGFyID0gKHRva2VuKSA9PiAhIXRva2VuICYmXG4gICAgKHRva2VuLnR5cGUgPT09ICdzY2FsYXInIHx8XG4gICAgICAgIHRva2VuLnR5cGUgPT09ICdzaW5nbGUtcXVvdGVkLXNjYWxhcicgfHxcbiAgICAgICAgdG9rZW4udHlwZSA9PT0gJ2RvdWJsZS1xdW90ZWQtc2NhbGFyJyB8fFxuICAgICAgICB0b2tlbi50eXBlID09PSAnYmxvY2stc2NhbGFyJyk7XG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuLyoqIEdldCBhIHByaW50YWJsZSByZXByZXNlbnRhdGlvbiBvZiBhIGxleGVyIHRva2VuICovXG5mdW5jdGlvbiBwcmV0dHlUb2tlbih0b2tlbikge1xuICAgIHN3aXRjaCAodG9rZW4pIHtcbiAgICAgICAgY2FzZSBCT006XG4gICAgICAgICAgICByZXR1cm4gJzxCT00+JztcbiAgICAgICAgY2FzZSBET0NVTUVOVDpcbiAgICAgICAgICAgIHJldHVybiAnPERPQz4nO1xuICAgICAgICBjYXNlIEZMT1dfRU5EOlxuICAgICAgICAgICAgcmV0dXJuICc8RkxPV19FTkQ+JztcbiAgICAgICAgY2FzZSBTQ0FMQVI6XG4gICAgICAgICAgICByZXR1cm4gJzxTQ0FMQVI+JztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh0b2tlbik7XG4gICAgfVxufVxuLyoqIElkZW50aWZ5IHRoZSB0eXBlIG9mIGEgbGV4ZXIgdG9rZW4uIE1heSByZXR1cm4gYG51bGxgIGZvciB1bmtub3duIHRva2Vucy4gKi9cbmZ1bmN0aW9uIHRva2VuVHlwZShzb3VyY2UpIHtcbiAgICBzd2l0Y2ggKHNvdXJjZSkge1xuICAgICAgICBjYXNlIEJPTTpcbiAgICAgICAgICAgIHJldHVybiAnYnl0ZS1vcmRlci1tYXJrJztcbiAgICAgICAgY2FzZSBET0NVTUVOVDpcbiAgICAgICAgICAgIHJldHVybiAnZG9jLW1vZGUnO1xuICAgICAgICBjYXNlIEZMT1dfRU5EOlxuICAgICAgICAgICAgcmV0dXJuICdmbG93LWVycm9yLWVuZCc7XG4gICAgICAgIGNhc2UgU0NBTEFSOlxuICAgICAgICAgICAgcmV0dXJuICdzY2FsYXInO1xuICAgICAgICBjYXNlICctLS0nOlxuICAgICAgICAgICAgcmV0dXJuICdkb2Mtc3RhcnQnO1xuICAgICAgICBjYXNlICcuLi4nOlxuICAgICAgICAgICAgcmV0dXJuICdkb2MtZW5kJztcbiAgICAgICAgY2FzZSAnJzpcbiAgICAgICAgY2FzZSAnXFxuJzpcbiAgICAgICAgY2FzZSAnXFxyXFxuJzpcbiAgICAgICAgICAgIHJldHVybiAnbmV3bGluZSc7XG4gICAgICAgIGNhc2UgJy0nOlxuICAgICAgICAgICAgcmV0dXJuICdzZXEtaXRlbS1pbmQnO1xuICAgICAgICBjYXNlICc/JzpcbiAgICAgICAgICAgIHJldHVybiAnZXhwbGljaXQta2V5LWluZCc7XG4gICAgICAgIGNhc2UgJzonOlxuICAgICAgICAgICAgcmV0dXJuICdtYXAtdmFsdWUtaW5kJztcbiAgICAgICAgY2FzZSAneyc6XG4gICAgICAgICAgICByZXR1cm4gJ2Zsb3ctbWFwLXN0YXJ0JztcbiAgICAgICAgY2FzZSAnfSc6XG4gICAgICAgICAgICByZXR1cm4gJ2Zsb3ctbWFwLWVuZCc7XG4gICAgICAgIGNhc2UgJ1snOlxuICAgICAgICAgICAgcmV0dXJuICdmbG93LXNlcS1zdGFydCc7XG4gICAgICAgIGNhc2UgJ10nOlxuICAgICAgICAgICAgcmV0dXJuICdmbG93LXNlcS1lbmQnO1xuICAgICAgICBjYXNlICcsJzpcbiAgICAgICAgICAgIHJldHVybiAnY29tbWEnO1xuICAgIH1cbiAgICBzd2l0Y2ggKHNvdXJjZVswXSkge1xuICAgICAgICBjYXNlICcgJzpcbiAgICAgICAgY2FzZSAnXFx0JzpcbiAgICAgICAgICAgIHJldHVybiAnc3BhY2UnO1xuICAgICAgICBjYXNlICcjJzpcbiAgICAgICAgICAgIHJldHVybiAnY29tbWVudCc7XG4gICAgICAgIGNhc2UgJyUnOlxuICAgICAgICAgICAgcmV0dXJuICdkaXJlY3RpdmUtbGluZSc7XG4gICAgICAgIGNhc2UgJyonOlxuICAgICAgICAgICAgcmV0dXJuICdhbGlhcyc7XG4gICAgICAgIGNhc2UgJyYnOlxuICAgICAgICAgICAgcmV0dXJuICdhbmNob3InO1xuICAgICAgICBjYXNlICchJzpcbiAgICAgICAgICAgIHJldHVybiAndGFnJztcbiAgICAgICAgY2FzZSBcIidcIjpcbiAgICAgICAgICAgIHJldHVybiAnc2luZ2xlLXF1b3RlZC1zY2FsYXInO1xuICAgICAgICBjYXNlICdcIic6XG4gICAgICAgICAgICByZXR1cm4gJ2RvdWJsZS1xdW90ZWQtc2NhbGFyJztcbiAgICAgICAgY2FzZSAnfCc6XG4gICAgICAgIGNhc2UgJz4nOlxuICAgICAgICAgICAgcmV0dXJuICdibG9jay1zY2FsYXItaGVhZGVyJztcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59XG5cbmV4cG9ydHMuY3JlYXRlU2NhbGFyVG9rZW4gPSBjc3RTY2FsYXIuY3JlYXRlU2NhbGFyVG9rZW47XG5leHBvcnRzLnJlc29sdmVBc1NjYWxhciA9IGNzdFNjYWxhci5yZXNvbHZlQXNTY2FsYXI7XG5leHBvcnRzLnNldFNjYWxhclZhbHVlID0gY3N0U2NhbGFyLnNldFNjYWxhclZhbHVlO1xuZXhwb3J0cy5zdHJpbmdpZnkgPSBjc3RTdHJpbmdpZnkuc3RyaW5naWZ5O1xuZXhwb3J0cy52aXNpdCA9IGNzdFZpc2l0LnZpc2l0O1xuZXhwb3J0cy5CT00gPSBCT007XG5leHBvcnRzLkRPQ1VNRU5UID0gRE9DVU1FTlQ7XG5leHBvcnRzLkZMT1dfRU5EID0gRkxPV19FTkQ7XG5leHBvcnRzLlNDQUxBUiA9IFNDQUxBUjtcbmV4cG9ydHMuaXNDb2xsZWN0aW9uID0gaXNDb2xsZWN0aW9uO1xuZXhwb3J0cy5pc1NjYWxhciA9IGlzU2NhbGFyO1xuZXhwb3J0cy5wcmV0dHlUb2tlbiA9IHByZXR0eVRva2VuO1xuZXhwb3J0cy50b2tlblR5cGUgPSB0b2tlblR5cGU7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIGNzdCA9IHJlcXVpcmUoJy4vY3N0LmpzJyk7XG5cbi8qXG5TVEFSVCAtPiBzdHJlYW1cblxuc3RyZWFtXG4gIGRpcmVjdGl2ZSAtPiBsaW5lLWVuZCAtPiBzdHJlYW1cbiAgaW5kZW50ICsgbGluZS1lbmQgLT4gc3RyZWFtXG4gIFtlbHNlXSAtPiBsaW5lLXN0YXJ0XG5cbmxpbmUtZW5kXG4gIGNvbW1lbnQgLT4gbGluZS1lbmRcbiAgbmV3bGluZSAtPiAuXG4gIGlucHV0LWVuZCAtPiBFTkRcblxubGluZS1zdGFydFxuICBkb2Mtc3RhcnQgLT4gZG9jXG4gIGRvYy1lbmQgLT4gc3RyZWFtXG4gIFtlbHNlXSAtPiBpbmRlbnQgLT4gYmxvY2stc3RhcnRcblxuYmxvY2stc3RhcnRcbiAgc2VxLWl0ZW0tc3RhcnQgLT4gYmxvY2stc3RhcnRcbiAgZXhwbGljaXQta2V5LXN0YXJ0IC0+IGJsb2NrLXN0YXJ0XG4gIG1hcC12YWx1ZS1zdGFydCAtPiBibG9jay1zdGFydFxuICBbZWxzZV0gLT4gZG9jXG5cbmRvY1xuICBsaW5lLWVuZCAtPiBsaW5lLXN0YXJ0XG4gIHNwYWNlcyAtPiBkb2NcbiAgYW5jaG9yIC0+IGRvY1xuICB0YWcgLT4gZG9jXG4gIGZsb3ctc3RhcnQgLT4gZmxvdyAtPiBkb2NcbiAgZmxvdy1lbmQgLT4gZXJyb3IgLT4gZG9jXG4gIHNlcS1pdGVtLXN0YXJ0IC0+IGVycm9yIC0+IGRvY1xuICBleHBsaWNpdC1rZXktc3RhcnQgLT4gZXJyb3IgLT4gZG9jXG4gIG1hcC12YWx1ZS1zdGFydCAtPiBkb2NcbiAgYWxpYXMgLT4gZG9jXG4gIHF1b3RlLXN0YXJ0IC0+IHF1b3RlZC1zY2FsYXIgLT4gZG9jXG4gIGJsb2NrLXNjYWxhci1oZWFkZXIgLT4gbGluZS1lbmQgLT4gYmxvY2stc2NhbGFyKG1pbikgLT4gbGluZS1zdGFydFxuICBbZWxzZV0gLT4gcGxhaW4tc2NhbGFyKGZhbHNlLCBtaW4pIC0+IGRvY1xuXG5mbG93XG4gIGxpbmUtZW5kIC0+IGZsb3dcbiAgc3BhY2VzIC0+IGZsb3dcbiAgYW5jaG9yIC0+IGZsb3dcbiAgdGFnIC0+IGZsb3dcbiAgZmxvdy1zdGFydCAtPiBmbG93IC0+IGZsb3dcbiAgZmxvdy1lbmQgLT4gLlxuICBzZXEtaXRlbS1zdGFydCAtPiBlcnJvciAtPiBmbG93XG4gIGV4cGxpY2l0LWtleS1zdGFydCAtPiBmbG93XG4gIG1hcC12YWx1ZS1zdGFydCAtPiBmbG93XG4gIGFsaWFzIC0+IGZsb3dcbiAgcXVvdGUtc3RhcnQgLT4gcXVvdGVkLXNjYWxhciAtPiBmbG93XG4gIGNvbW1hIC0+IGZsb3dcbiAgW2Vsc2VdIC0+IHBsYWluLXNjYWxhcih0cnVlLCAwKSAtPiBmbG93XG5cbnF1b3RlZC1zY2FsYXJcbiAgcXVvdGUtZW5kIC0+IC5cbiAgW2Vsc2VdIC0+IHF1b3RlZC1zY2FsYXJcblxuYmxvY2stc2NhbGFyKG1pbilcbiAgbmV3bGluZSArIHBlZWsoaW5kZW50IDwgbWluKSAtPiAuXG4gIFtlbHNlXSAtPiBibG9jay1zY2FsYXIobWluKVxuXG5wbGFpbi1zY2FsYXIoaXMtZmxvdywgbWluKVxuICBzY2FsYXItZW5kKGlzLWZsb3cpIC0+IC5cbiAgcGVlayhuZXdsaW5lICsgKGluZGVudCA8IG1pbikpIC0+IC5cbiAgW2Vsc2VdIC0+IHBsYWluLXNjYWxhcihtaW4pXG4qL1xuZnVuY3Rpb24gaXNFbXB0eShjaCkge1xuICAgIHN3aXRjaCAoY2gpIHtcbiAgICAgICAgY2FzZSB1bmRlZmluZWQ6XG4gICAgICAgIGNhc2UgJyAnOlxuICAgICAgICBjYXNlICdcXG4nOlxuICAgICAgICBjYXNlICdcXHInOlxuICAgICAgICBjYXNlICdcXHQnOlxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuY29uc3QgaGV4RGlnaXRzID0gbmV3IFNldCgnMDEyMzQ1Njc4OUFCQ0RFRmFiY2RlZicpO1xuY29uc3QgdGFnQ2hhcnMgPSBuZXcgU2V0KFwiMDEyMzQ1Njc4OUFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXotIzsvPzpAJj0rJF8uIX4qJygpXCIpO1xuY29uc3QgZmxvd0luZGljYXRvckNoYXJzID0gbmV3IFNldCgnLFtde30nKTtcbmNvbnN0IGludmFsaWRBbmNob3JDaGFycyA9IG5ldyBTZXQoJyAsW117fVxcblxcclxcdCcpO1xuY29uc3QgaXNOb3RBbmNob3JDaGFyID0gKGNoKSA9PiAhY2ggfHwgaW52YWxpZEFuY2hvckNoYXJzLmhhcyhjaCk7XG4vKipcbiAqIFNwbGl0cyBhbiBpbnB1dCBzdHJpbmcgaW50byBsZXhpY2FsIHRva2VucywgaS5lLiBzbWFsbGVyIHN0cmluZ3MgdGhhdCBhcmVcbiAqIGVhc2lseSBpZGVudGlmaWFibGUgYnkgYHRva2Vucy50b2tlblR5cGUoKWAuXG4gKlxuICogTGV4aW5nIHN0YXJ0cyBhbHdheXMgaW4gYSBcInN0cmVhbVwiIGNvbnRleHQuIEluY29tcGxldGUgaW5wdXQgbWF5IGJlIGJ1ZmZlcmVkXG4gKiB1bnRpbCBhIGNvbXBsZXRlIHRva2VuIGNhbiBiZSBlbWl0dGVkLlxuICpcbiAqIEluIGFkZGl0aW9uIHRvIHNsaWNlcyBvZiB0aGUgb3JpZ2luYWwgaW5wdXQsIHRoZSBmb2xsb3dpbmcgY29udHJvbCBjaGFyYWN0ZXJzXG4gKiBtYXkgYWxzbyBiZSBlbWl0dGVkOlxuICpcbiAqIC0gYFxceDAyYCAoU3RhcnQgb2YgVGV4dCk6IEEgZG9jdW1lbnQgc3RhcnRzIHdpdGggdGhlIG5leHQgdG9rZW5cbiAqIC0gYFxceDE4YCAoQ2FuY2VsKTogVW5leHBlY3RlZCBlbmQgb2YgZmxvdy1tb2RlIChpbmRpY2F0ZXMgYW4gZXJyb3IpXG4gKiAtIGBcXHgxZmAgKFVuaXQgU2VwYXJhdG9yKTogTmV4dCB0b2tlbiBpcyBhIHNjYWxhciB2YWx1ZVxuICogLSBgXFx1e0ZFRkZ9YCAoQnl0ZSBvcmRlciBtYXJrKTogRW1pdHRlZCBzZXBhcmF0ZWx5IG91dHNpZGUgZG9jdW1lbnRzXG4gKi9cbmNsYXNzIExleGVyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZsYWcgaW5kaWNhdGluZyB3aGV0aGVyIHRoZSBlbmQgb2YgdGhlIGN1cnJlbnQgYnVmZmVyIG1hcmtzIHRoZSBlbmQgb2ZcbiAgICAgICAgICogYWxsIGlucHV0XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmF0RW5kID0gZmFsc2U7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBFeHBsaWNpdCBpbmRlbnQgc2V0IGluIGJsb2NrIHNjYWxhciBoZWFkZXIsIGFzIGFuIG9mZnNldCBmcm9tIHRoZSBjdXJyZW50XG4gICAgICAgICAqIG1pbmltdW0gaW5kZW50LCBzbyBlLmcuIHNldCB0byAxIGZyb20gYSBoZWFkZXIgYHwyK2AuIFNldCB0byAtMSBpZiBub3RcbiAgICAgICAgICogZXhwbGljaXRseSBzZXQuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmJsb2NrU2NhbGFySW5kZW50ID0gLTE7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBCbG9jayBzY2FsYXJzIHRoYXQgaW5jbHVkZSBhICsgKGtlZXApIGNob21waW5nIGluZGljYXRvciBpbiB0aGVpciBoZWFkZXJcbiAgICAgICAgICogaW5jbHVkZSB0cmFpbGluZyBlbXB0eSBsaW5lcywgd2hpY2ggYXJlIG90aGVyd2lzZSBleGNsdWRlZCBmcm9tIHRoZVxuICAgICAgICAgKiBzY2FsYXIncyBjb250ZW50cy5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuYmxvY2tTY2FsYXJLZWVwID0gZmFsc2U7XG4gICAgICAgIC8qKiBDdXJyZW50IGlucHV0ICovXG4gICAgICAgIHRoaXMuYnVmZmVyID0gJyc7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGbGFnIG5vdGluZyB3aGV0aGVyIHRoZSBtYXAgdmFsdWUgaW5kaWNhdG9yIDogY2FuIGltbWVkaWF0ZWx5IGZvbGxvdyB0aGlzXG4gICAgICAgICAqIG5vZGUgd2l0aGluIGEgZmxvdyBjb250ZXh0LlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5mbG93S2V5ID0gZmFsc2U7XG4gICAgICAgIC8qKiBDb3VudCBvZiBzdXJyb3VuZGluZyBmbG93IGNvbGxlY3Rpb24gbGV2ZWxzLiAqL1xuICAgICAgICB0aGlzLmZsb3dMZXZlbCA9IDA7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBNaW5pbXVtIGxldmVsIG9mIGluZGVudGF0aW9uIHJlcXVpcmVkIGZvciBuZXh0IGxpbmVzIHRvIGJlIHBhcnNlZCBhcyBhXG4gICAgICAgICAqIHBhcnQgb2YgdGhlIGN1cnJlbnQgc2NhbGFyIHZhbHVlLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5pbmRlbnROZXh0ID0gMDtcbiAgICAgICAgLyoqIEluZGVudGF0aW9uIGxldmVsIG9mIHRoZSBjdXJyZW50IGxpbmUuICovXG4gICAgICAgIHRoaXMuaW5kZW50VmFsdWUgPSAwO1xuICAgICAgICAvKiogUG9zaXRpb24gb2YgdGhlIG5leHQgXFxuIGNoYXJhY3Rlci4gKi9cbiAgICAgICAgdGhpcy5saW5lRW5kUG9zID0gbnVsbDtcbiAgICAgICAgLyoqIFN0b3JlcyB0aGUgc3RhdGUgb2YgdGhlIGxleGVyIGlmIHJlYWNoaW5nIHRoZSBlbmQgb2YgaW5jcG9tcGxldGUgaW5wdXQgKi9cbiAgICAgICAgdGhpcy5uZXh0ID0gbnVsbDtcbiAgICAgICAgLyoqIEEgcG9pbnRlciB0byBgYnVmZmVyYDsgdGhlIGN1cnJlbnQgcG9zaXRpb24gb2YgdGhlIGxleGVyLiAqL1xuICAgICAgICB0aGlzLnBvcyA9IDA7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlIFlBTUwgdG9rZW5zIGZyb20gdGhlIGBzb3VyY2VgIHN0cmluZy4gSWYgYGluY29tcGxldGVgLFxuICAgICAqIGEgcGFydCBvZiB0aGUgbGFzdCBsaW5lIG1heSBiZSBsZWZ0IGFzIGEgYnVmZmVyIGZvciB0aGUgbmV4dCBjYWxsLlxuICAgICAqXG4gICAgICogQHJldHVybnMgQSBnZW5lcmF0b3Igb2YgbGV4aWNhbCB0b2tlbnNcbiAgICAgKi9cbiAgICAqbGV4KHNvdXJjZSwgaW5jb21wbGV0ZSA9IGZhbHNlKSB7XG4gICAgICAgIGlmIChzb3VyY2UpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc291cmNlICE9PSAnc3RyaW5nJylcbiAgICAgICAgICAgICAgICB0aHJvdyBUeXBlRXJyb3IoJ3NvdXJjZSBpcyBub3QgYSBzdHJpbmcnKTtcbiAgICAgICAgICAgIHRoaXMuYnVmZmVyID0gdGhpcy5idWZmZXIgPyB0aGlzLmJ1ZmZlciArIHNvdXJjZSA6IHNvdXJjZTtcbiAgICAgICAgICAgIHRoaXMubGluZUVuZFBvcyA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5hdEVuZCA9ICFpbmNvbXBsZXRlO1xuICAgICAgICBsZXQgbmV4dCA9IHRoaXMubmV4dCA/PyAnc3RyZWFtJztcbiAgICAgICAgd2hpbGUgKG5leHQgJiYgKGluY29tcGxldGUgfHwgdGhpcy5oYXNDaGFycygxKSkpXG4gICAgICAgICAgICBuZXh0ID0geWllbGQqIHRoaXMucGFyc2VOZXh0KG5leHQpO1xuICAgIH1cbiAgICBhdExpbmVFbmQoKSB7XG4gICAgICAgIGxldCBpID0gdGhpcy5wb3M7XG4gICAgICAgIGxldCBjaCA9IHRoaXMuYnVmZmVyW2ldO1xuICAgICAgICB3aGlsZSAoY2ggPT09ICcgJyB8fCBjaCA9PT0gJ1xcdCcpXG4gICAgICAgICAgICBjaCA9IHRoaXMuYnVmZmVyWysraV07XG4gICAgICAgIGlmICghY2ggfHwgY2ggPT09ICcjJyB8fCBjaCA9PT0gJ1xcbicpXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgaWYgKGNoID09PSAnXFxyJylcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmJ1ZmZlcltpICsgMV0gPT09ICdcXG4nO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNoYXJBdChuKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJ1ZmZlclt0aGlzLnBvcyArIG5dO1xuICAgIH1cbiAgICBjb250aW51ZVNjYWxhcihvZmZzZXQpIHtcbiAgICAgICAgbGV0IGNoID0gdGhpcy5idWZmZXJbb2Zmc2V0XTtcbiAgICAgICAgaWYgKHRoaXMuaW5kZW50TmV4dCA+IDApIHtcbiAgICAgICAgICAgIGxldCBpbmRlbnQgPSAwO1xuICAgICAgICAgICAgd2hpbGUgKGNoID09PSAnICcpXG4gICAgICAgICAgICAgICAgY2ggPSB0aGlzLmJ1ZmZlclsrK2luZGVudCArIG9mZnNldF07XG4gICAgICAgICAgICBpZiAoY2ggPT09ICdcXHInKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV4dCA9IHRoaXMuYnVmZmVyW2luZGVudCArIG9mZnNldCArIDFdO1xuICAgICAgICAgICAgICAgIGlmIChuZXh0ID09PSAnXFxuJyB8fCAoIW5leHQgJiYgIXRoaXMuYXRFbmQpKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2Zmc2V0ICsgaW5kZW50ICsgMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjaCA9PT0gJ1xcbicgfHwgaW5kZW50ID49IHRoaXMuaW5kZW50TmV4dCB8fCAoIWNoICYmICF0aGlzLmF0RW5kKVxuICAgICAgICAgICAgICAgID8gb2Zmc2V0ICsgaW5kZW50XG4gICAgICAgICAgICAgICAgOiAtMTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2ggPT09ICctJyB8fCBjaCA9PT0gJy4nKSB7XG4gICAgICAgICAgICBjb25zdCBkdCA9IHRoaXMuYnVmZmVyLnN1YnN0cihvZmZzZXQsIDMpO1xuICAgICAgICAgICAgaWYgKChkdCA9PT0gJy0tLScgfHwgZHQgPT09ICcuLi4nKSAmJiBpc0VtcHR5KHRoaXMuYnVmZmVyW29mZnNldCArIDNdKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9mZnNldDtcbiAgICB9XG4gICAgZ2V0TGluZSgpIHtcbiAgICAgICAgbGV0IGVuZCA9IHRoaXMubGluZUVuZFBvcztcbiAgICAgICAgaWYgKHR5cGVvZiBlbmQgIT09ICdudW1iZXInIHx8IChlbmQgIT09IC0xICYmIGVuZCA8IHRoaXMucG9zKSkge1xuICAgICAgICAgICAgZW5kID0gdGhpcy5idWZmZXIuaW5kZXhPZignXFxuJywgdGhpcy5wb3MpO1xuICAgICAgICAgICAgdGhpcy5saW5lRW5kUG9zID0gZW5kO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlbmQgPT09IC0xKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXRFbmQgPyB0aGlzLmJ1ZmZlci5zdWJzdHJpbmcodGhpcy5wb3MpIDogbnVsbDtcbiAgICAgICAgaWYgKHRoaXMuYnVmZmVyW2VuZCAtIDFdID09PSAnXFxyJylcbiAgICAgICAgICAgIGVuZCAtPSAxO1xuICAgICAgICByZXR1cm4gdGhpcy5idWZmZXIuc3Vic3RyaW5nKHRoaXMucG9zLCBlbmQpO1xuICAgIH1cbiAgICBoYXNDaGFycyhuKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBvcyArIG4gPD0gdGhpcy5idWZmZXIubGVuZ3RoO1xuICAgIH1cbiAgICBzZXROZXh0KHN0YXRlKSB7XG4gICAgICAgIHRoaXMuYnVmZmVyID0gdGhpcy5idWZmZXIuc3Vic3RyaW5nKHRoaXMucG9zKTtcbiAgICAgICAgdGhpcy5wb3MgPSAwO1xuICAgICAgICB0aGlzLmxpbmVFbmRQb3MgPSBudWxsO1xuICAgICAgICB0aGlzLm5leHQgPSBzdGF0ZTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHBlZWsobikge1xuICAgICAgICByZXR1cm4gdGhpcy5idWZmZXIuc3Vic3RyKHRoaXMucG9zLCBuKTtcbiAgICB9XG4gICAgKnBhcnNlTmV4dChuZXh0KSB7XG4gICAgICAgIHN3aXRjaCAobmV4dCkge1xuICAgICAgICAgICAgY2FzZSAnc3RyZWFtJzpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VTdHJlYW0oKTtcbiAgICAgICAgICAgIGNhc2UgJ2xpbmUtc3RhcnQnOlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZUxpbmVTdGFydCgpO1xuICAgICAgICAgICAgY2FzZSAnYmxvY2stc3RhcnQnOlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZUJsb2NrU3RhcnQoKTtcbiAgICAgICAgICAgIGNhc2UgJ2RvYyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlRG9jdW1lbnQoKTtcbiAgICAgICAgICAgIGNhc2UgJ2Zsb3cnOlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZUZsb3dDb2xsZWN0aW9uKCk7XG4gICAgICAgICAgICBjYXNlICdxdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VRdW90ZWRTY2FsYXIoKTtcbiAgICAgICAgICAgIGNhc2UgJ2Jsb2NrLXNjYWxhcic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlQmxvY2tTY2FsYXIoKTtcbiAgICAgICAgICAgIGNhc2UgJ3BsYWluLXNjYWxhcic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlUGxhaW5TY2FsYXIoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAqcGFyc2VTdHJlYW0oKSB7XG4gICAgICAgIGxldCBsaW5lID0gdGhpcy5nZXRMaW5lKCk7XG4gICAgICAgIGlmIChsaW5lID09PSBudWxsKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0TmV4dCgnc3RyZWFtJyk7XG4gICAgICAgIGlmIChsaW5lWzBdID09PSBjc3QuQk9NKSB7XG4gICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoQ291bnQoMSk7XG4gICAgICAgICAgICBsaW5lID0gbGluZS5zdWJzdHJpbmcoMSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxpbmVbMF0gPT09ICclJykge1xuICAgICAgICAgICAgbGV0IGRpckVuZCA9IGxpbmUubGVuZ3RoO1xuICAgICAgICAgICAgbGV0IGNzID0gbGluZS5pbmRleE9mKCcjJyk7XG4gICAgICAgICAgICB3aGlsZSAoY3MgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2ggPSBsaW5lW2NzIC0gMV07XG4gICAgICAgICAgICAgICAgaWYgKGNoID09PSAnICcgfHwgY2ggPT09ICdcXHQnKSB7XG4gICAgICAgICAgICAgICAgICAgIGRpckVuZCA9IGNzIC0gMTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjcyA9IGxpbmUuaW5kZXhPZignIycsIGNzICsgMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjaCA9IGxpbmVbZGlyRW5kIC0gMV07XG4gICAgICAgICAgICAgICAgaWYgKGNoID09PSAnICcgfHwgY2ggPT09ICdcXHQnKVxuICAgICAgICAgICAgICAgICAgICBkaXJFbmQgLT0gMTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgbiA9ICh5aWVsZCogdGhpcy5wdXNoQ291bnQoZGlyRW5kKSkgKyAoeWllbGQqIHRoaXMucHVzaFNwYWNlcyh0cnVlKSk7XG4gICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoQ291bnQobGluZS5sZW5ndGggLSBuKTsgLy8gcG9zc2libGUgY29tbWVudFxuICAgICAgICAgICAgdGhpcy5wdXNoTmV3bGluZSgpO1xuICAgICAgICAgICAgcmV0dXJuICdzdHJlYW0nO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmF0TGluZUVuZCgpKSB7XG4gICAgICAgICAgICBjb25zdCBzcCA9IHlpZWxkKiB0aGlzLnB1c2hTcGFjZXModHJ1ZSk7XG4gICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoQ291bnQobGluZS5sZW5ndGggLSBzcCk7XG4gICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoTmV3bGluZSgpO1xuICAgICAgICAgICAgcmV0dXJuICdzdHJlYW0nO1xuICAgICAgICB9XG4gICAgICAgIHlpZWxkIGNzdC5ET0NVTUVOVDtcbiAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlTGluZVN0YXJ0KCk7XG4gICAgfVxuICAgICpwYXJzZUxpbmVTdGFydCgpIHtcbiAgICAgICAgY29uc3QgY2ggPSB0aGlzLmNoYXJBdCgwKTtcbiAgICAgICAgaWYgKCFjaCAmJiAhdGhpcy5hdEVuZClcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldE5leHQoJ2xpbmUtc3RhcnQnKTtcbiAgICAgICAgaWYgKGNoID09PSAnLScgfHwgY2ggPT09ICcuJykge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmF0RW5kICYmICF0aGlzLmhhc0NoYXJzKDQpKVxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldE5leHQoJ2xpbmUtc3RhcnQnKTtcbiAgICAgICAgICAgIGNvbnN0IHMgPSB0aGlzLnBlZWsoMyk7XG4gICAgICAgICAgICBpZiAoKHMgPT09ICctLS0nIHx8IHMgPT09ICcuLi4nKSAmJiBpc0VtcHR5KHRoaXMuY2hhckF0KDMpKSkge1xuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnB1c2hDb3VudCgzKTtcbiAgICAgICAgICAgICAgICB0aGlzLmluZGVudFZhbHVlID0gMDtcbiAgICAgICAgICAgICAgICB0aGlzLmluZGVudE5leHQgPSAwO1xuICAgICAgICAgICAgICAgIHJldHVybiBzID09PSAnLS0tJyA/ICdkb2MnIDogJ3N0cmVhbSc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pbmRlbnRWYWx1ZSA9IHlpZWxkKiB0aGlzLnB1c2hTcGFjZXMoZmFsc2UpO1xuICAgICAgICBpZiAodGhpcy5pbmRlbnROZXh0ID4gdGhpcy5pbmRlbnRWYWx1ZSAmJiAhaXNFbXB0eSh0aGlzLmNoYXJBdCgxKSkpXG4gICAgICAgICAgICB0aGlzLmluZGVudE5leHQgPSB0aGlzLmluZGVudFZhbHVlO1xuICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VCbG9ja1N0YXJ0KCk7XG4gICAgfVxuICAgICpwYXJzZUJsb2NrU3RhcnQoKSB7XG4gICAgICAgIGNvbnN0IFtjaDAsIGNoMV0gPSB0aGlzLnBlZWsoMik7XG4gICAgICAgIGlmICghY2gxICYmICF0aGlzLmF0RW5kKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0TmV4dCgnYmxvY2stc3RhcnQnKTtcbiAgICAgICAgaWYgKChjaDAgPT09ICctJyB8fCBjaDAgPT09ICc/JyB8fCBjaDAgPT09ICc6JykgJiYgaXNFbXB0eShjaDEpKSB7XG4gICAgICAgICAgICBjb25zdCBuID0gKHlpZWxkKiB0aGlzLnB1c2hDb3VudCgxKSkgKyAoeWllbGQqIHRoaXMucHVzaFNwYWNlcyh0cnVlKSk7XG4gICAgICAgICAgICB0aGlzLmluZGVudE5leHQgPSB0aGlzLmluZGVudFZhbHVlICsgMTtcbiAgICAgICAgICAgIHRoaXMuaW5kZW50VmFsdWUgKz0gbjtcbiAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZUJsb2NrU3RhcnQoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gJ2RvYyc7XG4gICAgfVxuICAgICpwYXJzZURvY3VtZW50KCkge1xuICAgICAgICB5aWVsZCogdGhpcy5wdXNoU3BhY2VzKHRydWUpO1xuICAgICAgICBjb25zdCBsaW5lID0gdGhpcy5nZXRMaW5lKCk7XG4gICAgICAgIGlmIChsaW5lID09PSBudWxsKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0TmV4dCgnZG9jJyk7XG4gICAgICAgIGxldCBuID0geWllbGQqIHRoaXMucHVzaEluZGljYXRvcnMoKTtcbiAgICAgICAgc3dpdGNoIChsaW5lW25dKSB7XG4gICAgICAgICAgICBjYXNlICcjJzpcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoQ291bnQobGluZS5sZW5ndGggLSBuKTtcbiAgICAgICAgICAgIC8vIGZhbGx0aHJvdWdoXG4gICAgICAgICAgICBjYXNlIHVuZGVmaW5lZDpcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoTmV3bGluZSgpO1xuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZUxpbmVTdGFydCgpO1xuICAgICAgICAgICAgY2FzZSAneyc6XG4gICAgICAgICAgICBjYXNlICdbJzpcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoQ291bnQoMSk7XG4gICAgICAgICAgICAgICAgdGhpcy5mbG93S2V5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5mbG93TGV2ZWwgPSAxO1xuICAgICAgICAgICAgICAgIHJldHVybiAnZmxvdyc7XG4gICAgICAgICAgICBjYXNlICd9JzpcbiAgICAgICAgICAgIGNhc2UgJ10nOlxuICAgICAgICAgICAgICAgIC8vIHRoaXMgaXMgYW4gZXJyb3JcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoQ291bnQoMSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuICdkb2MnO1xuICAgICAgICAgICAgY2FzZSAnKic6XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaFVudGlsKGlzTm90QW5jaG9yQ2hhcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuICdkb2MnO1xuICAgICAgICAgICAgY2FzZSAnXCInOlxuICAgICAgICAgICAgY2FzZSBcIidcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucGFyc2VRdW90ZWRTY2FsYXIoKTtcbiAgICAgICAgICAgIGNhc2UgJ3wnOlxuICAgICAgICAgICAgY2FzZSAnPic6XG4gICAgICAgICAgICAgICAgbiArPSB5aWVsZCogdGhpcy5wYXJzZUJsb2NrU2NhbGFySGVhZGVyKCk7XG4gICAgICAgICAgICAgICAgbiArPSB5aWVsZCogdGhpcy5wdXNoU3BhY2VzKHRydWUpO1xuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnB1c2hDb3VudChsaW5lLmxlbmd0aCAtIG4pO1xuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnB1c2hOZXdsaW5lKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlQmxvY2tTY2FsYXIoKTtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnBhcnNlUGxhaW5TY2FsYXIoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAqcGFyc2VGbG93Q29sbGVjdGlvbigpIHtcbiAgICAgICAgbGV0IG5sLCBzcDtcbiAgICAgICAgbGV0IGluZGVudCA9IC0xO1xuICAgICAgICBkbyB7XG4gICAgICAgICAgICBubCA9IHlpZWxkKiB0aGlzLnB1c2hOZXdsaW5lKCk7XG4gICAgICAgICAgICBpZiAobmwgPiAwKSB7XG4gICAgICAgICAgICAgICAgc3AgPSB5aWVsZCogdGhpcy5wdXNoU3BhY2VzKGZhbHNlKTtcbiAgICAgICAgICAgICAgICB0aGlzLmluZGVudFZhbHVlID0gaW5kZW50ID0gc3A7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBzcCA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzcCArPSB5aWVsZCogdGhpcy5wdXNoU3BhY2VzKHRydWUpO1xuICAgICAgICB9IHdoaWxlIChubCArIHNwID4gMCk7XG4gICAgICAgIGNvbnN0IGxpbmUgPSB0aGlzLmdldExpbmUoKTtcbiAgICAgICAgaWYgKGxpbmUgPT09IG51bGwpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXROZXh0KCdmbG93Jyk7XG4gICAgICAgIGlmICgoaW5kZW50ICE9PSAtMSAmJiBpbmRlbnQgPCB0aGlzLmluZGVudE5leHQgJiYgbGluZVswXSAhPT0gJyMnKSB8fFxuICAgICAgICAgICAgKGluZGVudCA9PT0gMCAmJlxuICAgICAgICAgICAgICAgIChsaW5lLnN0YXJ0c1dpdGgoJy0tLScpIHx8IGxpbmUuc3RhcnRzV2l0aCgnLi4uJykpICYmXG4gICAgICAgICAgICAgICAgaXNFbXB0eShsaW5lWzNdKSkpIHtcbiAgICAgICAgICAgIC8vIEFsbG93aW5nIGZvciB0aGUgdGVybWluYWwgXSBvciB9IGF0IHRoZSBzYW1lIChyYXRoZXIgdGhhbiBncmVhdGVyKVxuICAgICAgICAgICAgLy8gaW5kZW50IGxldmVsIGFzIHRoZSBpbml0aWFsIFsgb3IgeyBpcyB0ZWNobmljYWxseSBpbnZhbGlkLCBidXRcbiAgICAgICAgICAgIC8vIGZhaWxpbmcgaGVyZSB3b3VsZCBiZSBzdXJwcmlzaW5nIHRvIHVzZXJzLlxuICAgICAgICAgICAgY29uc3QgYXRGbG93RW5kTWFya2VyID0gaW5kZW50ID09PSB0aGlzLmluZGVudE5leHQgLSAxICYmXG4gICAgICAgICAgICAgICAgdGhpcy5mbG93TGV2ZWwgPT09IDEgJiZcbiAgICAgICAgICAgICAgICAobGluZVswXSA9PT0gJ10nIHx8IGxpbmVbMF0gPT09ICd9Jyk7XG4gICAgICAgICAgICBpZiAoIWF0Rmxvd0VuZE1hcmtlcikge1xuICAgICAgICAgICAgICAgIC8vIHRoaXMgaXMgYW4gZXJyb3JcbiAgICAgICAgICAgICAgICB0aGlzLmZsb3dMZXZlbCA9IDA7XG4gICAgICAgICAgICAgICAgeWllbGQgY3N0LkZMT1dfRU5EO1xuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZUxpbmVTdGFydCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGxldCBuID0gMDtcbiAgICAgICAgd2hpbGUgKGxpbmVbbl0gPT09ICcsJykge1xuICAgICAgICAgICAgbiArPSB5aWVsZCogdGhpcy5wdXNoQ291bnQoMSk7XG4gICAgICAgICAgICBuICs9IHlpZWxkKiB0aGlzLnB1c2hTcGFjZXModHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLmZsb3dLZXkgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBuICs9IHlpZWxkKiB0aGlzLnB1c2hJbmRpY2F0b3JzKCk7XG4gICAgICAgIHN3aXRjaCAobGluZVtuXSkge1xuICAgICAgICAgICAgY2FzZSB1bmRlZmluZWQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuICdmbG93JztcbiAgICAgICAgICAgIGNhc2UgJyMnOlxuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnB1c2hDb3VudChsaW5lLmxlbmd0aCAtIG4pO1xuICAgICAgICAgICAgICAgIHJldHVybiAnZmxvdyc7XG4gICAgICAgICAgICBjYXNlICd7JzpcbiAgICAgICAgICAgIGNhc2UgJ1snOlxuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnB1c2hDb3VudCgxKTtcbiAgICAgICAgICAgICAgICB0aGlzLmZsb3dLZXkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLmZsb3dMZXZlbCArPSAxO1xuICAgICAgICAgICAgICAgIHJldHVybiAnZmxvdyc7XG4gICAgICAgICAgICBjYXNlICd9JzpcbiAgICAgICAgICAgIGNhc2UgJ10nOlxuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnB1c2hDb3VudCgxKTtcbiAgICAgICAgICAgICAgICB0aGlzLmZsb3dLZXkgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuZmxvd0xldmVsIC09IDE7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmxvd0xldmVsID8gJ2Zsb3cnIDogJ2RvYyc7XG4gICAgICAgICAgICBjYXNlICcqJzpcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoVW50aWwoaXNOb3RBbmNob3JDaGFyKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2Zsb3cnO1xuICAgICAgICAgICAgY2FzZSAnXCInOlxuICAgICAgICAgICAgY2FzZSBcIidcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmZsb3dLZXkgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZVF1b3RlZFNjYWxhcigpO1xuICAgICAgICAgICAgY2FzZSAnOic6IHtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXh0ID0gdGhpcy5jaGFyQXQoMSk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZmxvd0tleSB8fCBpc0VtcHR5KG5leHQpIHx8IG5leHQgPT09ICcsJykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmZsb3dLZXkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucHVzaENvdW50KDEpO1xuICAgICAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wdXNoU3BhY2VzKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ2Zsb3cnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGZhbGx0aHJvdWdoXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRoaXMuZmxvd0tleSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZVBsYWluU2NhbGFyKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgKnBhcnNlUXVvdGVkU2NhbGFyKCkge1xuICAgICAgICBjb25zdCBxdW90ZSA9IHRoaXMuY2hhckF0KDApO1xuICAgICAgICBsZXQgZW5kID0gdGhpcy5idWZmZXIuaW5kZXhPZihxdW90ZSwgdGhpcy5wb3MgKyAxKTtcbiAgICAgICAgaWYgKHF1b3RlID09PSBcIidcIikge1xuICAgICAgICAgICAgd2hpbGUgKGVuZCAhPT0gLTEgJiYgdGhpcy5idWZmZXJbZW5kICsgMV0gPT09IFwiJ1wiKVxuICAgICAgICAgICAgICAgIGVuZCA9IHRoaXMuYnVmZmVyLmluZGV4T2YoXCInXCIsIGVuZCArIDIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gZG91YmxlLXF1b3RlXG4gICAgICAgICAgICB3aGlsZSAoZW5kICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIGxldCBuID0gMDtcbiAgICAgICAgICAgICAgICB3aGlsZSAodGhpcy5idWZmZXJbZW5kIC0gMSAtIG5dID09PSAnXFxcXCcpXG4gICAgICAgICAgICAgICAgICAgIG4gKz0gMTtcbiAgICAgICAgICAgICAgICBpZiAobiAlIDIgPT09IDApXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGVuZCA9IHRoaXMuYnVmZmVyLmluZGV4T2YoJ1wiJywgZW5kICsgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gT25seSBsb29raW5nIGZvciBuZXdsaW5lcyB3aXRoaW4gdGhlIHF1b3Rlc1xuICAgICAgICBjb25zdCBxYiA9IHRoaXMuYnVmZmVyLnN1YnN0cmluZygwLCBlbmQpO1xuICAgICAgICBsZXQgbmwgPSBxYi5pbmRleE9mKCdcXG4nLCB0aGlzLnBvcyk7XG4gICAgICAgIGlmIChubCAhPT0gLTEpIHtcbiAgICAgICAgICAgIHdoaWxlIChubCAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjcyA9IHRoaXMuY29udGludWVTY2FsYXIobmwgKyAxKTtcbiAgICAgICAgICAgICAgICBpZiAoY3MgPT09IC0xKVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBubCA9IHFiLmluZGV4T2YoJ1xcbicsIGNzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChubCAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAvLyB0aGlzIGlzIGFuIGVycm9yIGNhdXNlZCBieSBhbiB1bmV4cGVjdGVkIHVuaW5kZW50XG4gICAgICAgICAgICAgICAgZW5kID0gbmwgLSAocWJbbmwgLSAxXSA9PT0gJ1xccicgPyAyIDogMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVuZCA9PT0gLTEpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5hdEVuZClcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXROZXh0KCdxdW90ZWQtc2NhbGFyJyk7XG4gICAgICAgICAgICBlbmQgPSB0aGlzLmJ1ZmZlci5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgeWllbGQqIHRoaXMucHVzaFRvSW5kZXgoZW5kICsgMSwgZmFsc2UpO1xuICAgICAgICByZXR1cm4gdGhpcy5mbG93TGV2ZWwgPyAnZmxvdycgOiAnZG9jJztcbiAgICB9XG4gICAgKnBhcnNlQmxvY2tTY2FsYXJIZWFkZXIoKSB7XG4gICAgICAgIHRoaXMuYmxvY2tTY2FsYXJJbmRlbnQgPSAtMTtcbiAgICAgICAgdGhpcy5ibG9ja1NjYWxhcktlZXAgPSBmYWxzZTtcbiAgICAgICAgbGV0IGkgPSB0aGlzLnBvcztcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgIGNvbnN0IGNoID0gdGhpcy5idWZmZXJbKytpXTtcbiAgICAgICAgICAgIGlmIChjaCA9PT0gJysnKVxuICAgICAgICAgICAgICAgIHRoaXMuYmxvY2tTY2FsYXJLZWVwID0gdHJ1ZTtcbiAgICAgICAgICAgIGVsc2UgaWYgKGNoID4gJzAnICYmIGNoIDw9ICc5JylcbiAgICAgICAgICAgICAgICB0aGlzLmJsb2NrU2NhbGFySW5kZW50ID0gTnVtYmVyKGNoKSAtIDE7XG4gICAgICAgICAgICBlbHNlIGlmIChjaCAhPT0gJy0nKVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wdXNoVW50aWwoY2ggPT4gaXNFbXB0eShjaCkgfHwgY2ggPT09ICcjJyk7XG4gICAgfVxuICAgICpwYXJzZUJsb2NrU2NhbGFyKCkge1xuICAgICAgICBsZXQgbmwgPSB0aGlzLnBvcyAtIDE7IC8vIG1heSBiZSAtMSBpZiB0aGlzLnBvcyA9PT0gMFxuICAgICAgICBsZXQgaW5kZW50ID0gMDtcbiAgICAgICAgbGV0IGNoO1xuICAgICAgICBsb29wOiBmb3IgKGxldCBpID0gdGhpcy5wb3M7IChjaCA9IHRoaXMuYnVmZmVyW2ldKTsgKytpKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKGNoKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnICc6XG4gICAgICAgICAgICAgICAgICAgIGluZGVudCArPSAxO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdcXG4nOlxuICAgICAgICAgICAgICAgICAgICBubCA9IGk7XG4gICAgICAgICAgICAgICAgICAgIGluZGVudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ1xccic6IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV4dCA9IHRoaXMuYnVmZmVyW2kgKyAxXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFuZXh0ICYmICF0aGlzLmF0RW5kKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0TmV4dCgnYmxvY2stc2NhbGFyJyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXh0ID09PSAnXFxuJylcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH0gLy8gZmFsbHRocm91Z2hcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBicmVhayBsb29wO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghY2ggJiYgIXRoaXMuYXRFbmQpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXROZXh0KCdibG9jay1zY2FsYXInKTtcbiAgICAgICAgaWYgKGluZGVudCA+PSB0aGlzLmluZGVudE5leHQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmJsb2NrU2NhbGFySW5kZW50ID09PSAtMSlcbiAgICAgICAgICAgICAgICB0aGlzLmluZGVudE5leHQgPSBpbmRlbnQ7XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmluZGVudE5leHQgPVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmJsb2NrU2NhbGFySW5kZW50ICsgKHRoaXMuaW5kZW50TmV4dCA9PT0gMCA/IDEgOiB0aGlzLmluZGVudE5leHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNzID0gdGhpcy5jb250aW51ZVNjYWxhcihubCArIDEpO1xuICAgICAgICAgICAgICAgIGlmIChjcyA9PT0gLTEpXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIG5sID0gdGhpcy5idWZmZXIuaW5kZXhPZignXFxuJywgY3MpO1xuICAgICAgICAgICAgfSB3aGlsZSAobmwgIT09IC0xKTtcbiAgICAgICAgICAgIGlmIChubCA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuYXRFbmQpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldE5leHQoJ2Jsb2NrLXNjYWxhcicpO1xuICAgICAgICAgICAgICAgIG5sID0gdGhpcy5idWZmZXIubGVuZ3RoO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIFRyYWlsaW5nIGluc3VmZmljaWVudGx5IGluZGVudGVkIHRhYnMgYXJlIGludmFsaWQuXG4gICAgICAgIC8vIFRvIGNhdGNoIHRoYXQgZHVyaW5nIHBhcnNpbmcsIHdlIGluY2x1ZGUgdGhlbSBpbiB0aGUgYmxvY2sgc2NhbGFyIHZhbHVlLlxuICAgICAgICBsZXQgaSA9IG5sICsgMTtcbiAgICAgICAgY2ggPSB0aGlzLmJ1ZmZlcltpXTtcbiAgICAgICAgd2hpbGUgKGNoID09PSAnICcpXG4gICAgICAgICAgICBjaCA9IHRoaXMuYnVmZmVyWysraV07XG4gICAgICAgIGlmIChjaCA9PT0gJ1xcdCcpIHtcbiAgICAgICAgICAgIHdoaWxlIChjaCA9PT0gJ1xcdCcgfHwgY2ggPT09ICcgJyB8fCBjaCA9PT0gJ1xccicgfHwgY2ggPT09ICdcXG4nKVxuICAgICAgICAgICAgICAgIGNoID0gdGhpcy5idWZmZXJbKytpXTtcbiAgICAgICAgICAgIG5sID0gaSAtIDE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIXRoaXMuYmxvY2tTY2FsYXJLZWVwKSB7XG4gICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgbGV0IGkgPSBubCAtIDE7XG4gICAgICAgICAgICAgICAgbGV0IGNoID0gdGhpcy5idWZmZXJbaV07XG4gICAgICAgICAgICAgICAgaWYgKGNoID09PSAnXFxyJylcbiAgICAgICAgICAgICAgICAgICAgY2ggPSB0aGlzLmJ1ZmZlclstLWldO1xuICAgICAgICAgICAgICAgIGNvbnN0IGxhc3RDaGFyID0gaTsgLy8gRHJvcCB0aGUgbGluZSBpZiBsYXN0IGNoYXIgbm90IG1vcmUgaW5kZW50ZWRcbiAgICAgICAgICAgICAgICB3aGlsZSAoY2ggPT09ICcgJylcbiAgICAgICAgICAgICAgICAgICAgY2ggPSB0aGlzLmJ1ZmZlclstLWldO1xuICAgICAgICAgICAgICAgIGlmIChjaCA9PT0gJ1xcbicgJiYgaSA+PSB0aGlzLnBvcyAmJiBpICsgMSArIGluZGVudCA+IGxhc3RDaGFyKVxuICAgICAgICAgICAgICAgICAgICBubCA9IGk7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH0gd2hpbGUgKHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIHlpZWxkIGNzdC5TQ0FMQVI7XG4gICAgICAgIHlpZWxkKiB0aGlzLnB1c2hUb0luZGV4KG5sICsgMSwgdHJ1ZSk7XG4gICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wYXJzZUxpbmVTdGFydCgpO1xuICAgIH1cbiAgICAqcGFyc2VQbGFpblNjYWxhcigpIHtcbiAgICAgICAgY29uc3QgaW5GbG93ID0gdGhpcy5mbG93TGV2ZWwgPiAwO1xuICAgICAgICBsZXQgZW5kID0gdGhpcy5wb3MgLSAxO1xuICAgICAgICBsZXQgaSA9IHRoaXMucG9zIC0gMTtcbiAgICAgICAgbGV0IGNoO1xuICAgICAgICB3aGlsZSAoKGNoID0gdGhpcy5idWZmZXJbKytpXSkpIHtcbiAgICAgICAgICAgIGlmIChjaCA9PT0gJzonKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV4dCA9IHRoaXMuYnVmZmVyW2kgKyAxXTtcbiAgICAgICAgICAgICAgICBpZiAoaXNFbXB0eShuZXh0KSB8fCAoaW5GbG93ICYmIGZsb3dJbmRpY2F0b3JDaGFycy5oYXMobmV4dCkpKVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBlbmQgPSBpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoaXNFbXB0eShjaCkpIHtcbiAgICAgICAgICAgICAgICBsZXQgbmV4dCA9IHRoaXMuYnVmZmVyW2kgKyAxXTtcbiAgICAgICAgICAgICAgICBpZiAoY2ggPT09ICdcXHInKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXh0ID09PSAnXFxuJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaSArPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2ggPSAnXFxuJztcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHQgPSB0aGlzLmJ1ZmZlcltpICsgMV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kID0gaTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5leHQgPT09ICcjJyB8fCAoaW5GbG93ICYmIGZsb3dJbmRpY2F0b3JDaGFycy5oYXMobmV4dCkpKVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBpZiAoY2ggPT09ICdcXG4nKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNzID0gdGhpcy5jb250aW51ZVNjYWxhcihpICsgMSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjcyA9PT0gLTEpXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgaSA9IE1hdGgubWF4KGksIGNzIC0gMik7IC8vIHRvIGFkdmFuY2UsIGJ1dCBzdGlsbCBhY2NvdW50IGZvciAnICMnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKGluRmxvdyAmJiBmbG93SW5kaWNhdG9yQ2hhcnMuaGFzKGNoKSlcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZW5kID0gaTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIWNoICYmICF0aGlzLmF0RW5kKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0TmV4dCgncGxhaW4tc2NhbGFyJyk7XG4gICAgICAgIHlpZWxkIGNzdC5TQ0FMQVI7XG4gICAgICAgIHlpZWxkKiB0aGlzLnB1c2hUb0luZGV4KGVuZCArIDEsIHRydWUpO1xuICAgICAgICByZXR1cm4gaW5GbG93ID8gJ2Zsb3cnIDogJ2RvYyc7XG4gICAgfVxuICAgICpwdXNoQ291bnQobikge1xuICAgICAgICBpZiAobiA+IDApIHtcbiAgICAgICAgICAgIHlpZWxkIHRoaXMuYnVmZmVyLnN1YnN0cih0aGlzLnBvcywgbik7XG4gICAgICAgICAgICB0aGlzLnBvcyArPSBuO1xuICAgICAgICAgICAgcmV0dXJuIG47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgICpwdXNoVG9JbmRleChpLCBhbGxvd0VtcHR5KSB7XG4gICAgICAgIGNvbnN0IHMgPSB0aGlzLmJ1ZmZlci5zbGljZSh0aGlzLnBvcywgaSk7XG4gICAgICAgIGlmIChzKSB7XG4gICAgICAgICAgICB5aWVsZCBzO1xuICAgICAgICAgICAgdGhpcy5wb3MgKz0gcy5sZW5ndGg7XG4gICAgICAgICAgICByZXR1cm4gcy5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYWxsb3dFbXB0eSlcbiAgICAgICAgICAgIHlpZWxkICcnO1xuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG4gICAgKnB1c2hJbmRpY2F0b3JzKCkge1xuICAgICAgICBzd2l0Y2ggKHRoaXMuY2hhckF0KDApKSB7XG4gICAgICAgICAgICBjYXNlICchJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gKCh5aWVsZCogdGhpcy5wdXNoVGFnKCkpICtcbiAgICAgICAgICAgICAgICAgICAgKHlpZWxkKiB0aGlzLnB1c2hTcGFjZXModHJ1ZSkpICtcbiAgICAgICAgICAgICAgICAgICAgKHlpZWxkKiB0aGlzLnB1c2hJbmRpY2F0b3JzKCkpKTtcbiAgICAgICAgICAgIGNhc2UgJyYnOlxuICAgICAgICAgICAgICAgIHJldHVybiAoKHlpZWxkKiB0aGlzLnB1c2hVbnRpbChpc05vdEFuY2hvckNoYXIpKSArXG4gICAgICAgICAgICAgICAgICAgICh5aWVsZCogdGhpcy5wdXNoU3BhY2VzKHRydWUpKSArXG4gICAgICAgICAgICAgICAgICAgICh5aWVsZCogdGhpcy5wdXNoSW5kaWNhdG9ycygpKSk7XG4gICAgICAgICAgICBjYXNlICctJzogLy8gdGhpcyBpcyBhbiBlcnJvclxuICAgICAgICAgICAgY2FzZSAnPyc6IC8vIHRoaXMgaXMgYW4gZXJyb3Igb3V0c2lkZSBmbG93IGNvbGxlY3Rpb25zXG4gICAgICAgICAgICBjYXNlICc6Jzoge1xuICAgICAgICAgICAgICAgIGNvbnN0IGluRmxvdyA9IHRoaXMuZmxvd0xldmVsID4gMDtcbiAgICAgICAgICAgICAgICBjb25zdCBjaDEgPSB0aGlzLmNoYXJBdCgxKTtcbiAgICAgICAgICAgICAgICBpZiAoaXNFbXB0eShjaDEpIHx8IChpbkZsb3cgJiYgZmxvd0luZGljYXRvckNoYXJzLmhhcyhjaDEpKSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWluRmxvdylcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW5kZW50TmV4dCA9IHRoaXMuaW5kZW50VmFsdWUgKyAxO1xuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh0aGlzLmZsb3dLZXkpXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZsb3dLZXkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgoeWllbGQqIHRoaXMucHVzaENvdW50KDEpKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAoeWllbGQqIHRoaXMucHVzaFNwYWNlcyh0cnVlKSkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgKHlpZWxkKiB0aGlzLnB1c2hJbmRpY2F0b3JzKCkpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgICpwdXNoVGFnKCkge1xuICAgICAgICBpZiAodGhpcy5jaGFyQXQoMSkgPT09ICc8Jykge1xuICAgICAgICAgICAgbGV0IGkgPSB0aGlzLnBvcyArIDI7XG4gICAgICAgICAgICBsZXQgY2ggPSB0aGlzLmJ1ZmZlcltpXTtcbiAgICAgICAgICAgIHdoaWxlICghaXNFbXB0eShjaCkgJiYgY2ggIT09ICc+JylcbiAgICAgICAgICAgICAgICBjaCA9IHRoaXMuYnVmZmVyWysraV07XG4gICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucHVzaFRvSW5kZXgoY2ggPT09ICc+JyA/IGkgKyAxIDogaSwgZmFsc2UpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbGV0IGkgPSB0aGlzLnBvcyArIDE7XG4gICAgICAgICAgICBsZXQgY2ggPSB0aGlzLmJ1ZmZlcltpXTtcbiAgICAgICAgICAgIHdoaWxlIChjaCkge1xuICAgICAgICAgICAgICAgIGlmICh0YWdDaGFycy5oYXMoY2gpKVxuICAgICAgICAgICAgICAgICAgICBjaCA9IHRoaXMuYnVmZmVyWysraV07XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoY2ggPT09ICclJyAmJlxuICAgICAgICAgICAgICAgICAgICBoZXhEaWdpdHMuaGFzKHRoaXMuYnVmZmVyW2kgKyAxXSkgJiZcbiAgICAgICAgICAgICAgICAgICAgaGV4RGlnaXRzLmhhcyh0aGlzLmJ1ZmZlcltpICsgMl0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNoID0gdGhpcy5idWZmZXJbKGkgKz0gMyldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnB1c2hUb0luZGV4KGksIGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAqcHVzaE5ld2xpbmUoKSB7XG4gICAgICAgIGNvbnN0IGNoID0gdGhpcy5idWZmZXJbdGhpcy5wb3NdO1xuICAgICAgICBpZiAoY2ggPT09ICdcXG4nKVxuICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLnB1c2hDb3VudCgxKTtcbiAgICAgICAgZWxzZSBpZiAoY2ggPT09ICdcXHInICYmIHRoaXMuY2hhckF0KDEpID09PSAnXFxuJylcbiAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5wdXNoQ291bnQoMik7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICAqcHVzaFNwYWNlcyhhbGxvd1RhYnMpIHtcbiAgICAgICAgbGV0IGkgPSB0aGlzLnBvcyAtIDE7XG4gICAgICAgIGxldCBjaDtcbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgY2ggPSB0aGlzLmJ1ZmZlclsrK2ldO1xuICAgICAgICB9IHdoaWxlIChjaCA9PT0gJyAnIHx8IChhbGxvd1RhYnMgJiYgY2ggPT09ICdcXHQnKSk7XG4gICAgICAgIGNvbnN0IG4gPSBpIC0gdGhpcy5wb3M7XG4gICAgICAgIGlmIChuID4gMCkge1xuICAgICAgICAgICAgeWllbGQgdGhpcy5idWZmZXIuc3Vic3RyKHRoaXMucG9zLCBuKTtcbiAgICAgICAgICAgIHRoaXMucG9zID0gaTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbjtcbiAgICB9XG4gICAgKnB1c2hVbnRpbCh0ZXN0KSB7XG4gICAgICAgIGxldCBpID0gdGhpcy5wb3M7XG4gICAgICAgIGxldCBjaCA9IHRoaXMuYnVmZmVyW2ldO1xuICAgICAgICB3aGlsZSAoIXRlc3QoY2gpKVxuICAgICAgICAgICAgY2ggPSB0aGlzLmJ1ZmZlclsrK2ldO1xuICAgICAgICByZXR1cm4geWllbGQqIHRoaXMucHVzaFRvSW5kZXgoaSwgZmFsc2UpO1xuICAgIH1cbn1cblxuZXhwb3J0cy5MZXhlciA9IExleGVyO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVHJhY2tzIG5ld2xpbmVzIGR1cmluZyBwYXJzaW5nIGluIG9yZGVyIHRvIHByb3ZpZGUgYW4gZWZmaWNpZW50IEFQSSBmb3JcbiAqIGRldGVybWluaW5nIHRoZSBvbmUtaW5kZXhlZCBgeyBsaW5lLCBjb2wgfWAgcG9zaXRpb24gZm9yIGFueSBvZmZzZXRcbiAqIHdpdGhpbiB0aGUgaW5wdXQuXG4gKi9cbmNsYXNzIExpbmVDb3VudGVyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5saW5lU3RhcnRzID0gW107XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTaG91bGQgYmUgY2FsbGVkIGluIGFzY2VuZGluZyBvcmRlci4gT3RoZXJ3aXNlLCBjYWxsXG4gICAgICAgICAqIGBsaW5lQ291bnRlci5saW5lU3RhcnRzLnNvcnQoKWAgYmVmb3JlIGNhbGxpbmcgYGxpbmVQb3MoKWAuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmFkZE5ld0xpbmUgPSAob2Zmc2V0KSA9PiB0aGlzLmxpbmVTdGFydHMucHVzaChvZmZzZXQpO1xuICAgICAgICAvKipcbiAgICAgICAgICogUGVyZm9ybXMgYSBiaW5hcnkgc2VhcmNoIGFuZCByZXR1cm5zIHRoZSAxLWluZGV4ZWQgeyBsaW5lLCBjb2wgfVxuICAgICAgICAgKiBwb3NpdGlvbiBvZiBgb2Zmc2V0YC4gSWYgYGxpbmUgPT09IDBgLCBgYWRkTmV3TGluZWAgaGFzIG5ldmVyIGJlZW5cbiAgICAgICAgICogY2FsbGVkIG9yIGBvZmZzZXRgIGlzIGJlZm9yZSB0aGUgZmlyc3Qga25vd24gbmV3bGluZS5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMubGluZVBvcyA9IChvZmZzZXQpID0+IHtcbiAgICAgICAgICAgIGxldCBsb3cgPSAwO1xuICAgICAgICAgICAgbGV0IGhpZ2ggPSB0aGlzLmxpbmVTdGFydHMubGVuZ3RoO1xuICAgICAgICAgICAgd2hpbGUgKGxvdyA8IGhpZ2gpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtaWQgPSAobG93ICsgaGlnaCkgPj4gMTsgLy8gTWF0aC5mbG9vcigobG93ICsgaGlnaCkgLyAyKVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmxpbmVTdGFydHNbbWlkXSA8IG9mZnNldClcbiAgICAgICAgICAgICAgICAgICAgbG93ID0gbWlkICsgMTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGhpZ2ggPSBtaWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5saW5lU3RhcnRzW2xvd10gPT09IG9mZnNldClcbiAgICAgICAgICAgICAgICByZXR1cm4geyBsaW5lOiBsb3cgKyAxLCBjb2w6IDEgfTtcbiAgICAgICAgICAgIGlmIChsb3cgPT09IDApXG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgbGluZTogMCwgY29sOiBvZmZzZXQgfTtcbiAgICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy5saW5lU3RhcnRzW2xvdyAtIDFdO1xuICAgICAgICAgICAgcmV0dXJuIHsgbGluZTogbG93LCBjb2w6IG9mZnNldCAtIHN0YXJ0ICsgMSB9O1xuICAgICAgICB9O1xuICAgIH1cbn1cblxuZXhwb3J0cy5MaW5lQ291bnRlciA9IExpbmVDb3VudGVyO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBub2RlX3Byb2Nlc3MgPSByZXF1aXJlKCdwcm9jZXNzJyk7XG52YXIgY3N0ID0gcmVxdWlyZSgnLi9jc3QuanMnKTtcbnZhciBsZXhlciA9IHJlcXVpcmUoJy4vbGV4ZXIuanMnKTtcblxuZnVuY3Rpb24gaW5jbHVkZXNUb2tlbihsaXN0LCB0eXBlKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgKytpKVxuICAgICAgICBpZiAobGlzdFtpXS50eXBlID09PSB0eXBlKVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuZnVuY3Rpb24gZmluZE5vbkVtcHR5SW5kZXgobGlzdCkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7ICsraSkge1xuICAgICAgICBzd2l0Y2ggKGxpc3RbaV0udHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIC0xO1xufVxuZnVuY3Rpb24gaXNGbG93VG9rZW4odG9rZW4pIHtcbiAgICBzd2l0Y2ggKHRva2VuPy50eXBlKSB7XG4gICAgICAgIGNhc2UgJ2FsaWFzJzpcbiAgICAgICAgY2FzZSAnc2NhbGFyJzpcbiAgICAgICAgY2FzZSAnc2luZ2xlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICBjYXNlICdkb3VibGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgIGNhc2UgJ2Zsb3ctY29sbGVjdGlvbic6XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5mdW5jdGlvbiBnZXRQcmV2UHJvcHMocGFyZW50KSB7XG4gICAgc3dpdGNoIChwYXJlbnQudHlwZSkge1xuICAgICAgICBjYXNlICdkb2N1bWVudCc6XG4gICAgICAgICAgICByZXR1cm4gcGFyZW50LnN0YXJ0O1xuICAgICAgICBjYXNlICdibG9jay1tYXAnOiB7XG4gICAgICAgICAgICBjb25zdCBpdCA9IHBhcmVudC5pdGVtc1twYXJlbnQuaXRlbXMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICByZXR1cm4gaXQuc2VwID8/IGl0LnN0YXJ0O1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ2Jsb2NrLXNlcSc6XG4gICAgICAgICAgICByZXR1cm4gcGFyZW50Lml0ZW1zW3BhcmVudC5pdGVtcy5sZW5ndGggLSAxXS5zdGFydDtcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgc2hvdWxkIG5vdCBoYXBwZW4gKi9cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICB9XG59XG4vKiogTm90ZTogTWF5IG1vZGlmeSBpbnB1dCBhcnJheSAqL1xuZnVuY3Rpb24gZ2V0Rmlyc3RLZXlTdGFydFByb3BzKHByZXYpIHtcbiAgICBpZiAocHJldi5sZW5ndGggPT09IDApXG4gICAgICAgIHJldHVybiBbXTtcbiAgICBsZXQgaSA9IHByZXYubGVuZ3RoO1xuICAgIGxvb3A6IHdoaWxlICgtLWkgPj0gMCkge1xuICAgICAgICBzd2l0Y2ggKHByZXZbaV0udHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnZG9jLXN0YXJ0JzpcbiAgICAgICAgICAgIGNhc2UgJ2V4cGxpY2l0LWtleS1pbmQnOlxuICAgICAgICAgICAgY2FzZSAnbWFwLXZhbHVlLWluZCc6XG4gICAgICAgICAgICBjYXNlICdzZXEtaXRlbS1pbmQnOlxuICAgICAgICAgICAgY2FzZSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgICAgYnJlYWsgbG9vcDtcbiAgICAgICAgfVxuICAgIH1cbiAgICB3aGlsZSAocHJldlsrK2ldPy50eXBlID09PSAnc3BhY2UnKSB7XG4gICAgICAgIC8qIGxvb3AgKi9cbiAgICB9XG4gICAgcmV0dXJuIHByZXYuc3BsaWNlKGksIHByZXYubGVuZ3RoKTtcbn1cbmZ1bmN0aW9uIGZpeEZsb3dTZXFJdGVtcyhmYykge1xuICAgIGlmIChmYy5zdGFydC50eXBlID09PSAnZmxvdy1zZXEtc3RhcnQnKSB7XG4gICAgICAgIGZvciAoY29uc3QgaXQgb2YgZmMuaXRlbXMpIHtcbiAgICAgICAgICAgIGlmIChpdC5zZXAgJiZcbiAgICAgICAgICAgICAgICAhaXQudmFsdWUgJiZcbiAgICAgICAgICAgICAgICAhaW5jbHVkZXNUb2tlbihpdC5zdGFydCwgJ2V4cGxpY2l0LWtleS1pbmQnKSAmJlxuICAgICAgICAgICAgICAgICFpbmNsdWRlc1Rva2VuKGl0LnNlcCwgJ21hcC12YWx1ZS1pbmQnKSkge1xuICAgICAgICAgICAgICAgIGlmIChpdC5rZXkpXG4gICAgICAgICAgICAgICAgICAgIGl0LnZhbHVlID0gaXQua2V5O1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBpdC5rZXk7XG4gICAgICAgICAgICAgICAgaWYgKGlzRmxvd1Rva2VuKGl0LnZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXQudmFsdWUuZW5kKVxuICAgICAgICAgICAgICAgICAgICAgICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkoaXQudmFsdWUuZW5kLCBpdC5zZXApO1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBpdC52YWx1ZS5lbmQgPSBpdC5zZXA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkoaXQuc3RhcnQsIGl0LnNlcCk7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGl0LnNlcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbi8qKlxuICogQSBZQU1MIGNvbmNyZXRlIHN5bnRheCB0cmVlIChDU1QpIHBhcnNlclxuICpcbiAqIGBgYHRzXG4gKiBjb25zdCBzcmM6IHN0cmluZyA9IC4uLlxuICogZm9yIChjb25zdCB0b2tlbiBvZiBuZXcgUGFyc2VyKCkucGFyc2Uoc3JjKSkge1xuICogICAvLyB0b2tlbjogVG9rZW5cbiAqIH1cbiAqIGBgYFxuICpcbiAqIFRvIHVzZSB0aGUgcGFyc2VyIHdpdGggYSB1c2VyLXByb3ZpZGVkIGxleGVyOlxuICpcbiAqIGBgYHRzXG4gKiBmdW5jdGlvbiogcGFyc2Uoc291cmNlOiBzdHJpbmcsIGxleGVyOiBMZXhlcikge1xuICogICBjb25zdCBwYXJzZXIgPSBuZXcgUGFyc2VyKClcbiAqICAgZm9yIChjb25zdCBsZXhlbWUgb2YgbGV4ZXIubGV4KHNvdXJjZSkpXG4gKiAgICAgeWllbGQqIHBhcnNlci5uZXh0KGxleGVtZSlcbiAqICAgeWllbGQqIHBhcnNlci5lbmQoKVxuICogfVxuICpcbiAqIGNvbnN0IHNyYzogc3RyaW5nID0gLi4uXG4gKiBjb25zdCBsZXhlciA9IG5ldyBMZXhlcigpXG4gKiBmb3IgKGNvbnN0IHRva2VuIG9mIHBhcnNlKHNyYywgbGV4ZXIpKSB7XG4gKiAgIC8vIHRva2VuOiBUb2tlblxuICogfVxuICogYGBgXG4gKi9cbmNsYXNzIFBhcnNlciB7XG4gICAgLyoqXG4gICAgICogQHBhcmFtIG9uTmV3TGluZSAtIElmIGRlZmluZWQsIGNhbGxlZCBzZXBhcmF0ZWx5IHdpdGggdGhlIHN0YXJ0IHBvc2l0aW9uIG9mXG4gICAgICogICBlYWNoIG5ldyBsaW5lIChpbiBgcGFyc2UoKWAsIGluY2x1ZGluZyB0aGUgc3RhcnQgb2YgaW5wdXQpLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKG9uTmV3TGluZSkge1xuICAgICAgICAvKiogSWYgdHJ1ZSwgc3BhY2UgYW5kIHNlcXVlbmNlIGluZGljYXRvcnMgY291bnQgYXMgaW5kZW50YXRpb24gKi9cbiAgICAgICAgdGhpcy5hdE5ld0xpbmUgPSB0cnVlO1xuICAgICAgICAvKiogSWYgdHJ1ZSwgbmV4dCB0b2tlbiBpcyBhIHNjYWxhciB2YWx1ZSAqL1xuICAgICAgICB0aGlzLmF0U2NhbGFyID0gZmFsc2U7XG4gICAgICAgIC8qKiBDdXJyZW50IGluZGVudGF0aW9uIGxldmVsICovXG4gICAgICAgIHRoaXMuaW5kZW50ID0gMDtcbiAgICAgICAgLyoqIEN1cnJlbnQgb2Zmc2V0IHNpbmNlIHRoZSBzdGFydCBvZiBwYXJzaW5nICovXG4gICAgICAgIHRoaXMub2Zmc2V0ID0gMDtcbiAgICAgICAgLyoqIE9uIHRoZSBzYW1lIGxpbmUgd2l0aCBhIGJsb2NrIG1hcCBrZXkgKi9cbiAgICAgICAgdGhpcy5vbktleUxpbmUgPSBmYWxzZTtcbiAgICAgICAgLyoqIFRvcCBpbmRpY2F0ZXMgdGhlIG5vZGUgdGhhdCdzIGN1cnJlbnRseSBiZWluZyBidWlsdCAqL1xuICAgICAgICB0aGlzLnN0YWNrID0gW107XG4gICAgICAgIC8qKiBUaGUgc291cmNlIG9mIHRoZSBjdXJyZW50IHRva2VuLCBzZXQgaW4gcGFyc2UoKSAqL1xuICAgICAgICB0aGlzLnNvdXJjZSA9ICcnO1xuICAgICAgICAvKiogVGhlIHR5cGUgb2YgdGhlIGN1cnJlbnQgdG9rZW4sIHNldCBpbiBwYXJzZSgpICovXG4gICAgICAgIHRoaXMudHlwZSA9ICcnO1xuICAgICAgICAvLyBNdXN0IGJlIGRlZmluZWQgYWZ0ZXIgYG5leHQoKWBcbiAgICAgICAgdGhpcy5sZXhlciA9IG5ldyBsZXhlci5MZXhlcigpO1xuICAgICAgICB0aGlzLm9uTmV3TGluZSA9IG9uTmV3TGluZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUGFyc2UgYHNvdXJjZWAgYXMgYSBZQU1MIHN0cmVhbS5cbiAgICAgKiBJZiBgaW5jb21wbGV0ZWAsIGEgcGFydCBvZiB0aGUgbGFzdCBsaW5lIG1heSBiZSBsZWZ0IGFzIGEgYnVmZmVyIGZvciB0aGUgbmV4dCBjYWxsLlxuICAgICAqXG4gICAgICogRXJyb3JzIGFyZSBub3QgdGhyb3duLCBidXQgeWllbGRlZCBhcyBgeyB0eXBlOiAnZXJyb3InLCBtZXNzYWdlIH1gIHRva2Vucy5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIEEgZ2VuZXJhdG9yIG9mIHRva2VucyByZXByZXNlbnRpbmcgZWFjaCBkaXJlY3RpdmUsIGRvY3VtZW50LCBhbmQgb3RoZXIgc3RydWN0dXJlLlxuICAgICAqL1xuICAgICpwYXJzZShzb3VyY2UsIGluY29tcGxldGUgPSBmYWxzZSkge1xuICAgICAgICBpZiAodGhpcy5vbk5ld0xpbmUgJiYgdGhpcy5vZmZzZXQgPT09IDApXG4gICAgICAgICAgICB0aGlzLm9uTmV3TGluZSgwKTtcbiAgICAgICAgZm9yIChjb25zdCBsZXhlbWUgb2YgdGhpcy5sZXhlci5sZXgoc291cmNlLCBpbmNvbXBsZXRlKSlcbiAgICAgICAgICAgIHlpZWxkKiB0aGlzLm5leHQobGV4ZW1lKTtcbiAgICAgICAgaWYgKCFpbmNvbXBsZXRlKVxuICAgICAgICAgICAgeWllbGQqIHRoaXMuZW5kKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFkdmFuY2UgdGhlIHBhcnNlciBieSB0aGUgYHNvdXJjZWAgb2Ygb25lIGxleGljYWwgdG9rZW4uXG4gICAgICovXG4gICAgKm5leHQoc291cmNlKSB7XG4gICAgICAgIHRoaXMuc291cmNlID0gc291cmNlO1xuICAgICAgICBpZiAobm9kZV9wcm9jZXNzLmVudi5MT0dfVE9LRU5TKVxuICAgICAgICAgICAgY29uc29sZS5sb2coJ3wnLCBjc3QucHJldHR5VG9rZW4oc291cmNlKSk7XG4gICAgICAgIGlmICh0aGlzLmF0U2NhbGFyKSB7XG4gICAgICAgICAgICB0aGlzLmF0U2NhbGFyID0gZmFsc2U7XG4gICAgICAgICAgICB5aWVsZCogdGhpcy5zdGVwKCk7XG4gICAgICAgICAgICB0aGlzLm9mZnNldCArPSBzb3VyY2UubGVuZ3RoO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHR5cGUgPSBjc3QudG9rZW5UeXBlKHNvdXJjZSk7XG4gICAgICAgIGlmICghdHlwZSkge1xuICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9IGBOb3QgYSBZQU1MIHRva2VuOiAke3NvdXJjZX1gO1xuICAgICAgICAgICAgeWllbGQqIHRoaXMucG9wKHsgdHlwZTogJ2Vycm9yJywgb2Zmc2V0OiB0aGlzLm9mZnNldCwgbWVzc2FnZSwgc291cmNlIH0pO1xuICAgICAgICAgICAgdGhpcy5vZmZzZXQgKz0gc291cmNlLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0eXBlID09PSAnc2NhbGFyJykge1xuICAgICAgICAgICAgdGhpcy5hdE5ld0xpbmUgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuYXRTY2FsYXIgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy50eXBlID0gJ3NjYWxhcic7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgICAgICAgICAgeWllbGQqIHRoaXMuc3RlcCgpO1xuICAgICAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXROZXdMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmRlbnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5vbk5ld0xpbmUpXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uTmV3TGluZSh0aGlzLm9mZnNldCArIHNvdXJjZS5sZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmF0TmV3TGluZSAmJiBzb3VyY2VbMF0gPT09ICcgJylcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW5kZW50ICs9IHNvdXJjZS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2V4cGxpY2l0LWtleS1pbmQnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ21hcC12YWx1ZS1pbmQnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ3NlcS1pdGVtLWluZCc6XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmF0TmV3TGluZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW5kZW50ICs9IHNvdXJjZS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2RvYy1tb2RlJzpcbiAgICAgICAgICAgICAgICBjYXNlICdmbG93LWVycm9yLWVuZCc6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmF0TmV3TGluZSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5vZmZzZXQgKz0gc291cmNlLmxlbmd0aDtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKiogQ2FsbCBhdCBlbmQgb2YgaW5wdXQgdG8gcHVzaCBvdXQgYW55IHJlbWFpbmluZyBjb25zdHJ1Y3Rpb25zICovXG4gICAgKmVuZCgpIHtcbiAgICAgICAgd2hpbGUgKHRoaXMuc3RhY2subGVuZ3RoID4gMClcbiAgICAgICAgICAgIHlpZWxkKiB0aGlzLnBvcCgpO1xuICAgIH1cbiAgICBnZXQgc291cmNlVG9rZW4oKSB7XG4gICAgICAgIGNvbnN0IHN0ID0ge1xuICAgICAgICAgICAgdHlwZTogdGhpcy50eXBlLFxuICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgIGluZGVudDogdGhpcy5pbmRlbnQsXG4gICAgICAgICAgICBzb3VyY2U6IHRoaXMuc291cmNlXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBzdDtcbiAgICB9XG4gICAgKnN0ZXAoKSB7XG4gICAgICAgIGNvbnN0IHRvcCA9IHRoaXMucGVlaygxKTtcbiAgICAgICAgaWYgKHRoaXMudHlwZSA9PT0gJ2RvYy1lbmQnICYmIHRvcD8udHlwZSAhPT0gJ2RvYy1lbmQnKSB7XG4gICAgICAgICAgICB3aGlsZSAodGhpcy5zdGFjay5sZW5ndGggPiAwKVxuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnBvcCgpO1xuICAgICAgICAgICAgdGhpcy5zdGFjay5wdXNoKHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnZG9jLWVuZCcsXG4gICAgICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgICAgICBzb3VyY2U6IHRoaXMuc291cmNlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRvcClcbiAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5zdHJlYW0oKTtcbiAgICAgICAgc3dpdGNoICh0b3AudHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnZG9jdW1lbnQnOlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5kb2N1bWVudCh0b3ApO1xuICAgICAgICAgICAgY2FzZSAnYWxpYXMnOlxuICAgICAgICAgICAgY2FzZSAnc2NhbGFyJzpcbiAgICAgICAgICAgIGNhc2UgJ3NpbmdsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgICAgIGNhc2UgJ2RvdWJsZS1xdW90ZWQtc2NhbGFyJzpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMuc2NhbGFyKHRvcCk7XG4gICAgICAgICAgICBjYXNlICdibG9jay1zY2FsYXInOlxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCogdGhpcy5ibG9ja1NjYWxhcih0b3ApO1xuICAgICAgICAgICAgY2FzZSAnYmxvY2stbWFwJzpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMuYmxvY2tNYXAodG9wKTtcbiAgICAgICAgICAgIGNhc2UgJ2Jsb2NrLXNlcSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLmJsb2NrU2VxdWVuY2UodG9wKTtcbiAgICAgICAgICAgIGNhc2UgJ2Zsb3ctY29sbGVjdGlvbic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLmZsb3dDb2xsZWN0aW9uKHRvcCk7XG4gICAgICAgICAgICBjYXNlICdkb2MtZW5kJzpcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQqIHRoaXMuZG9jdW1lbnRFbmQodG9wKTtcbiAgICAgICAgfVxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCBzaG91bGQgbm90IGhhcHBlbiAqL1xuICAgICAgICB5aWVsZCogdGhpcy5wb3AoKTtcbiAgICB9XG4gICAgcGVlayhuKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YWNrW3RoaXMuc3RhY2subGVuZ3RoIC0gbl07XG4gICAgfVxuICAgICpwb3AoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgdG9rZW4gPSBlcnJvciA/PyB0aGlzLnN0YWNrLnBvcCgpO1xuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgc2hvdWxkIG5vdCBoYXBwZW4gKi9cbiAgICAgICAgaWYgKCF0b2tlbikge1xuICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9ICdUcmllZCB0byBwb3AgYW4gZW1wdHkgc3RhY2snO1xuICAgICAgICAgICAgeWllbGQgeyB0eXBlOiAnZXJyb3InLCBvZmZzZXQ6IHRoaXMub2Zmc2V0LCBzb3VyY2U6ICcnLCBtZXNzYWdlIH07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGhpcy5zdGFjay5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHlpZWxkIHRva2VuO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgdG9wID0gdGhpcy5wZWVrKDEpO1xuICAgICAgICAgICAgaWYgKHRva2VuLnR5cGUgPT09ICdibG9jay1zY2FsYXInKSB7XG4gICAgICAgICAgICAgICAgLy8gQmxvY2sgc2NhbGFycyB1c2UgdGhlaXIgcGFyZW50IHJhdGhlciB0aGFuIGhlYWRlciBpbmRlbnRcbiAgICAgICAgICAgICAgICB0b2tlbi5pbmRlbnQgPSAnaW5kZW50JyBpbiB0b3AgPyB0b3AuaW5kZW50IDogMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHRva2VuLnR5cGUgPT09ICdmbG93LWNvbGxlY3Rpb24nICYmIHRvcC50eXBlID09PSAnZG9jdW1lbnQnKSB7XG4gICAgICAgICAgICAgICAgLy8gSWdub3JlIGFsbCBpbmRlbnQgZm9yIHRvcC1sZXZlbCBmbG93IGNvbGxlY3Rpb25zXG4gICAgICAgICAgICAgICAgdG9rZW4uaW5kZW50ID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0b2tlbi50eXBlID09PSAnZmxvdy1jb2xsZWN0aW9uJylcbiAgICAgICAgICAgICAgICBmaXhGbG93U2VxSXRlbXModG9rZW4pO1xuICAgICAgICAgICAgc3dpdGNoICh0b3AudHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2RvY3VtZW50JzpcbiAgICAgICAgICAgICAgICAgICAgdG9wLnZhbHVlID0gdG9rZW47XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2Jsb2NrLXNjYWxhcic6XG4gICAgICAgICAgICAgICAgICAgIHRvcC5wcm9wcy5wdXNoKHRva2VuKTsgLy8gZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnYmxvY2stbWFwJzoge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpdCA9IHRvcC5pdGVtc1t0b3AuaXRlbXMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChpdC52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9wLml0ZW1zLnB1c2goeyBzdGFydDogW10sIGtleTogdG9rZW4sIHNlcDogW10gfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uS2V5TGluZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaXQuc2VwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdC52YWx1ZSA9IHRva2VuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihpdCwgeyBrZXk6IHRva2VuLCBzZXA6IFtdIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbktleUxpbmUgPSAhaXQuZXhwbGljaXRLZXk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgJ2Jsb2NrLXNlcSc6IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaXQgPSB0b3AuaXRlbXNbdG9wLml0ZW1zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXQudmFsdWUpXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3AuaXRlbXMucHVzaCh7IHN0YXJ0OiBbXSwgdmFsdWU6IHRva2VuIH0pO1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBpdC52YWx1ZSA9IHRva2VuO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FzZSAnZmxvdy1jb2xsZWN0aW9uJzoge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpdCA9IHRvcC5pdGVtc1t0b3AuaXRlbXMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXQgfHwgaXQudmFsdWUpXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3AuaXRlbXMucHVzaCh7IHN0YXJ0OiBbXSwga2V5OiB0b2tlbiwgc2VwOiBbXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaXQuc2VwKVxuICAgICAgICAgICAgICAgICAgICAgICAgaXQudmFsdWUgPSB0b2tlbjtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihpdCwgeyBrZXk6IHRva2VuLCBzZXA6IFtdIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0IHNob3VsZCBub3QgaGFwcGVuICovXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnBvcCh0b2tlbik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoKHRvcC50eXBlID09PSAnZG9jdW1lbnQnIHx8XG4gICAgICAgICAgICAgICAgdG9wLnR5cGUgPT09ICdibG9jay1tYXAnIHx8XG4gICAgICAgICAgICAgICAgdG9wLnR5cGUgPT09ICdibG9jay1zZXEnKSAmJlxuICAgICAgICAgICAgICAgICh0b2tlbi50eXBlID09PSAnYmxvY2stbWFwJyB8fCB0b2tlbi50eXBlID09PSAnYmxvY2stc2VxJykpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsYXN0ID0gdG9rZW4uaXRlbXNbdG9rZW4uaXRlbXMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgaWYgKGxhc3QgJiZcbiAgICAgICAgICAgICAgICAgICAgIWxhc3Quc2VwICYmXG4gICAgICAgICAgICAgICAgICAgICFsYXN0LnZhbHVlICYmXG4gICAgICAgICAgICAgICAgICAgIGxhc3Quc3RhcnQubGVuZ3RoID4gMCAmJlxuICAgICAgICAgICAgICAgICAgICBmaW5kTm9uRW1wdHlJbmRleChsYXN0LnN0YXJ0KSA9PT0gLTEgJiZcbiAgICAgICAgICAgICAgICAgICAgKHRva2VuLmluZGVudCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdC5zdGFydC5ldmVyeShzdCA9PiBzdC50eXBlICE9PSAnY29tbWVudCcgfHwgc3QuaW5kZW50IDwgdG9rZW4uaW5kZW50KSkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRvcC50eXBlID09PSAnZG9jdW1lbnQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgdG9wLmVuZCA9IGxhc3Quc3RhcnQ7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcC5pdGVtcy5wdXNoKHsgc3RhcnQ6IGxhc3Quc3RhcnQgfSk7XG4gICAgICAgICAgICAgICAgICAgIHRva2VuLml0ZW1zLnNwbGljZSgtMSwgMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgICpzdHJlYW0oKSB7XG4gICAgICAgIHN3aXRjaCAodGhpcy50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdkaXJlY3RpdmUtbGluZSc6XG4gICAgICAgICAgICAgICAgeWllbGQgeyB0eXBlOiAnZGlyZWN0aXZlJywgb2Zmc2V0OiB0aGlzLm9mZnNldCwgc291cmNlOiB0aGlzLnNvdXJjZSB9O1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIGNhc2UgJ2J5dGUtb3JkZXItbWFyayc6XG4gICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgIHlpZWxkIHRoaXMuc291cmNlVG9rZW47XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgY2FzZSAnZG9jLW1vZGUnOlxuICAgICAgICAgICAgY2FzZSAnZG9jLXN0YXJ0Jzoge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRvYyA9IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2RvY3VtZW50JyxcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IFtdXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy50eXBlID09PSAnZG9jLXN0YXJ0JylcbiAgICAgICAgICAgICAgICAgICAgZG9jLnN0YXJ0LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGFjay5wdXNoKGRvYyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHlpZWxkIHtcbiAgICAgICAgICAgIHR5cGU6ICdlcnJvcicsXG4gICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgbWVzc2FnZTogYFVuZXhwZWN0ZWQgJHt0aGlzLnR5cGV9IHRva2VuIGluIFlBTUwgc3RyZWFtYCxcbiAgICAgICAgICAgIHNvdXJjZTogdGhpcy5zb3VyY2VcbiAgICAgICAgfTtcbiAgICB9XG4gICAgKmRvY3VtZW50KGRvYykge1xuICAgICAgICBpZiAoZG9jLnZhbHVlKVxuICAgICAgICAgICAgcmV0dXJuIHlpZWxkKiB0aGlzLmxpbmVFbmQoZG9jKTtcbiAgICAgICAgc3dpdGNoICh0aGlzLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2RvYy1zdGFydCc6IHtcbiAgICAgICAgICAgICAgICBpZiAoZmluZE5vbkVtcHR5SW5kZXgoZG9jLnN0YXJ0KSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnN0ZXAoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBkb2Muc3RhcnQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlICdhbmNob3InOlxuICAgICAgICAgICAgY2FzZSAndGFnJzpcbiAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcbiAgICAgICAgICAgIGNhc2UgJ2NvbW1lbnQnOlxuICAgICAgICAgICAgY2FzZSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgICAgZG9jLnN0YXJ0LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGJ2ID0gdGhpcy5zdGFydEJsb2NrVmFsdWUoZG9jKTtcbiAgICAgICAgaWYgKGJ2KVxuICAgICAgICAgICAgdGhpcy5zdGFjay5wdXNoKGJ2KTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB5aWVsZCB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2Vycm9yJyxcbiAgICAgICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBVbmV4cGVjdGVkICR7dGhpcy50eXBlfSB0b2tlbiBpbiBZQU1MIGRvY3VtZW50YCxcbiAgICAgICAgICAgICAgICBzb3VyY2U6IHRoaXMuc291cmNlXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuICAgICpzY2FsYXIoc2NhbGFyKSB7XG4gICAgICAgIGlmICh0aGlzLnR5cGUgPT09ICdtYXAtdmFsdWUtaW5kJykge1xuICAgICAgICAgICAgY29uc3QgcHJldiA9IGdldFByZXZQcm9wcyh0aGlzLnBlZWsoMikpO1xuICAgICAgICAgICAgY29uc3Qgc3RhcnQgPSBnZXRGaXJzdEtleVN0YXJ0UHJvcHMocHJldik7XG4gICAgICAgICAgICBsZXQgc2VwO1xuICAgICAgICAgICAgaWYgKHNjYWxhci5lbmQpIHtcbiAgICAgICAgICAgICAgICBzZXAgPSBzY2FsYXIuZW5kO1xuICAgICAgICAgICAgICAgIHNlcC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBzY2FsYXIuZW5kO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHNlcCA9IFt0aGlzLnNvdXJjZVRva2VuXTtcbiAgICAgICAgICAgIGNvbnN0IG1hcCA9IHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnYmxvY2stbWFwJyxcbiAgICAgICAgICAgICAgICBvZmZzZXQ6IHNjYWxhci5vZmZzZXQsXG4gICAgICAgICAgICAgICAgaW5kZW50OiBzY2FsYXIuaW5kZW50LFxuICAgICAgICAgICAgICAgIGl0ZW1zOiBbeyBzdGFydCwga2V5OiBzY2FsYXIsIHNlcCB9XVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMub25LZXlMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuc3RhY2tbdGhpcy5zdGFjay5sZW5ndGggLSAxXSA9IG1hcDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB5aWVsZCogdGhpcy5saW5lRW5kKHNjYWxhcik7XG4gICAgfVxuICAgICpibG9ja1NjYWxhcihzY2FsYXIpIHtcbiAgICAgICAgc3dpdGNoICh0aGlzLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcbiAgICAgICAgICAgIGNhc2UgJ2NvbW1lbnQnOlxuICAgICAgICAgICAgY2FzZSAnbmV3bGluZSc6XG4gICAgICAgICAgICAgICAgc2NhbGFyLnByb3BzLnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgY2FzZSAnc2NhbGFyJzpcbiAgICAgICAgICAgICAgICBzY2FsYXIuc291cmNlID0gdGhpcy5zb3VyY2U7XG4gICAgICAgICAgICAgICAgLy8gYmxvY2stc2NhbGFyIHNvdXJjZSBpbmNsdWRlcyB0cmFpbGluZyBuZXdsaW5lXG4gICAgICAgICAgICAgICAgdGhpcy5hdE5ld0xpbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5kZW50ID0gMDtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vbk5ld0xpbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5sID0gdGhpcy5zb3VyY2UuaW5kZXhPZignXFxuJykgKyAxO1xuICAgICAgICAgICAgICAgICAgICB3aGlsZSAobmwgIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25OZXdMaW5lKHRoaXMub2Zmc2V0ICsgbmwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbmwgPSB0aGlzLnNvdXJjZS5pbmRleE9mKCdcXG4nLCBubCkgKyAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnBvcCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgc2hvdWxkIG5vdCBoYXBwZW4gKi9cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucG9wKCk7XG4gICAgICAgICAgICAgICAgeWllbGQqIHRoaXMuc3RlcCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgICpibG9ja01hcChtYXApIHtcbiAgICAgICAgY29uc3QgaXQgPSBtYXAuaXRlbXNbbWFwLml0ZW1zLmxlbmd0aCAtIDFdO1xuICAgICAgICAvLyBpdC5zZXAgaXMgdHJ1ZS1pc2ggaWYgcGFpciBhbHJlYWR5IGhhcyBrZXkgb3IgOiBzZXBhcmF0b3JcbiAgICAgICAgc3dpdGNoICh0aGlzLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgIHRoaXMub25LZXlMaW5lID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKGl0LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVuZCA9ICdlbmQnIGluIGl0LnZhbHVlID8gaXQudmFsdWUuZW5kIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsYXN0ID0gQXJyYXkuaXNBcnJheShlbmQpID8gZW5kW2VuZC5sZW5ndGggLSAxXSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxhc3Q/LnR5cGUgPT09ICdjb21tZW50JylcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZD8ucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwLml0ZW1zLnB1c2goeyBzdGFydDogW3RoaXMuc291cmNlVG9rZW5dIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChpdC5zZXApIHtcbiAgICAgICAgICAgICAgICAgICAgaXQuc2VwLnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpdC5zdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgICAgICAgICBpZiAoaXQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgbWFwLml0ZW1zLnB1c2goeyBzdGFydDogW3RoaXMuc291cmNlVG9rZW5dIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChpdC5zZXApIHtcbiAgICAgICAgICAgICAgICAgICAgaXQuc2VwLnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5hdEluZGVudGVkQ29tbWVudChpdC5zdGFydCwgbWFwLmluZGVudCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHByZXYgPSBtYXAuaXRlbXNbbWFwLml0ZW1zLmxlbmd0aCAtIDJdO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZW5kID0gcHJldj8udmFsdWU/LmVuZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGVuZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShlbmQsIGl0LnN0YXJ0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXAuaXRlbXMucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGl0LnN0YXJ0LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5pbmRlbnQgPj0gbWFwLmluZGVudCkge1xuICAgICAgICAgICAgY29uc3QgYXRNYXBJbmRlbnQgPSAhdGhpcy5vbktleUxpbmUgJiYgdGhpcy5pbmRlbnQgPT09IG1hcC5pbmRlbnQ7XG4gICAgICAgICAgICBjb25zdCBhdE5leHRJdGVtID0gYXRNYXBJbmRlbnQgJiZcbiAgICAgICAgICAgICAgICAoaXQuc2VwIHx8IGl0LmV4cGxpY2l0S2V5KSAmJlxuICAgICAgICAgICAgICAgIHRoaXMudHlwZSAhPT0gJ3NlcS1pdGVtLWluZCc7XG4gICAgICAgICAgICAvLyBGb3IgZW1wdHkgbm9kZXMsIGFzc2lnbiBuZXdsaW5lLXNlcGFyYXRlZCBub3QgaW5kZW50ZWQgZW1wdHkgdG9rZW5zIHRvIGZvbGxvd2luZyBub2RlXG4gICAgICAgICAgICBsZXQgc3RhcnQgPSBbXTtcbiAgICAgICAgICAgIGlmIChhdE5leHRJdGVtICYmIGl0LnNlcCAmJiAhaXQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBubCA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXQuc2VwLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0ID0gaXQuc2VwW2ldO1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHN0LnR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5sLnB1c2goaSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdzcGFjZSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3QuaW5kZW50ID4gbWFwLmluZGVudClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmwubGVuZ3RoID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmwubGVuZ3RoID0gMDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobmwubGVuZ3RoID49IDIpXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0ID0gaXQuc2VwLnNwbGljZShubFsxXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzd2l0Y2ggKHRoaXMudHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2FuY2hvcic6XG4gICAgICAgICAgICAgICAgY2FzZSAndGFnJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKGF0TmV4dEl0ZW0gfHwgaXQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXAuaXRlbXMucHVzaCh7IHN0YXJ0IH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbktleUxpbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGl0LnNlcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXQuc2VwLnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdC5zdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICBjYXNlICdleHBsaWNpdC1rZXktaW5kJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpdC5zZXAgJiYgIWl0LmV4cGxpY2l0S2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdC5zdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaXQuZXhwbGljaXRLZXkgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGF0TmV4dEl0ZW0gfHwgaXQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXAuaXRlbXMucHVzaCh7IHN0YXJ0LCBleHBsaWNpdEtleTogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhY2sucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Jsb2NrLW1hcCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRlbnQ6IHRoaXMuaW5kZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbeyBzdGFydDogW3RoaXMuc291cmNlVG9rZW5dLCBleHBsaWNpdEtleTogdHJ1ZSB9XVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbktleUxpbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgY2FzZSAnbWFwLXZhbHVlLWluZCc6XG4gICAgICAgICAgICAgICAgICAgIGlmIChpdC5leHBsaWNpdEtleSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpdC5zZXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5jbHVkZXNUb2tlbihpdC5zdGFydCwgJ25ld2xpbmUnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKGl0LCB7IGtleTogbnVsbCwgc2VwOiBbdGhpcy5zb3VyY2VUb2tlbl0gfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzdGFydCA9IGdldEZpcnN0S2V5U3RhcnRQcm9wcyhpdC5zdGFydCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhY2sucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYmxvY2stbWFwJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRlbnQ6IHRoaXMuaW5kZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFt7IHN0YXJ0LCBrZXk6IG51bGwsIHNlcDogW3RoaXMuc291cmNlVG9rZW5dIH1dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGl0LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwLml0ZW1zLnB1c2goeyBzdGFydDogW10sIGtleTogbnVsbCwgc2VwOiBbdGhpcy5zb3VyY2VUb2tlbl0gfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpbmNsdWRlc1Rva2VuKGl0LnNlcCwgJ21hcC12YWx1ZS1pbmQnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhY2sucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdibG9jay1tYXAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRlbnQ6IHRoaXMuaW5kZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogW3sgc3RhcnQsIGtleTogbnVsbCwgc2VwOiBbdGhpcy5zb3VyY2VUb2tlbl0gfV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGlzRmxvd1Rva2VuKGl0LmtleSkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAhaW5jbHVkZXNUb2tlbihpdC5zZXAsICduZXdsaW5lJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzdGFydCA9IGdldEZpcnN0S2V5U3RhcnRQcm9wcyhpdC5zdGFydCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qga2V5ID0gaXQua2V5O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlcCA9IGl0LnNlcDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXAucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHR5cGUgZ3VhcmQgaXMgd3JvbmcgaGVyZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBpdC5rZXk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0eXBlIGd1YXJkIGlzIHdyb25nIGhlcmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgaXQuc2VwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhY2sucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdibG9jay1tYXAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRlbnQ6IHRoaXMuaW5kZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogW3sgc3RhcnQsIGtleSwgc2VwIH1dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChzdGFydC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTm90IGFjdHVhbGx5IGF0IG5leHQgaXRlbVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0LnNlcCA9IGl0LnNlcC5jb25jYXQoc3RhcnQsIHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXQuc2VwLnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWl0LnNlcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oaXQsIHsga2V5OiBudWxsLCBzZXA6IFt0aGlzLnNvdXJjZVRva2VuXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGl0LnZhbHVlIHx8IGF0TmV4dEl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXAuaXRlbXMucHVzaCh7IHN0YXJ0LCBrZXk6IG51bGwsIHNlcDogW3RoaXMuc291cmNlVG9rZW5dIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaW5jbHVkZXNUb2tlbihpdC5zZXAsICdtYXAtdmFsdWUtaW5kJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YWNrLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYmxvY2stbWFwJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZW50OiB0aGlzLmluZGVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFt7IHN0YXJ0OiBbXSwga2V5OiBudWxsLCBzZXA6IFt0aGlzLnNvdXJjZVRva2VuXSB9XVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXQuc2VwLnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbktleUxpbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgY2FzZSAnYWxpYXMnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ3NjYWxhcic6XG4gICAgICAgICAgICAgICAgY2FzZSAnc2luZ2xlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICAgICAgICAgIGNhc2UgJ2RvdWJsZS1xdW90ZWQtc2NhbGFyJzoge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmcyA9IHRoaXMuZmxvd1NjYWxhcih0aGlzLnR5cGUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYXROZXh0SXRlbSB8fCBpdC52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFwLml0ZW1zLnB1c2goeyBzdGFydCwga2V5OiBmcywgc2VwOiBbXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25LZXlMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpdC5zZXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhY2sucHVzaChmcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKGl0LCB7IGtleTogZnMsIHNlcDogW10gfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uS2V5TGluZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGJ2ID0gdGhpcy5zdGFydEJsb2NrVmFsdWUobWFwKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJ2KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYnYudHlwZSA9PT0gJ2Jsb2NrLXNlcScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWl0LmV4cGxpY2l0S2V5ICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0LnNlcCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAhaW5jbHVkZXNUb2tlbihpdC5zZXAsICduZXdsaW5lJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucG9wKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdlcnJvcicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ1VuZXhwZWN0ZWQgYmxvY2stc2VxLWluZCBvbiBzYW1lIGxpbmUgd2l0aCBrZXknLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiB0aGlzLnNvdXJjZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGF0TWFwSW5kZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwLml0ZW1zLnB1c2goeyBzdGFydCB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhY2sucHVzaChidik7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgeWllbGQqIHRoaXMucG9wKCk7XG4gICAgICAgIHlpZWxkKiB0aGlzLnN0ZXAoKTtcbiAgICB9XG4gICAgKmJsb2NrU2VxdWVuY2Uoc2VxKSB7XG4gICAgICAgIGNvbnN0IGl0ID0gc2VxLml0ZW1zW3NlcS5pdGVtcy5sZW5ndGggLSAxXTtcbiAgICAgICAgc3dpdGNoICh0aGlzLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgIGlmIChpdC52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlbmQgPSAnZW5kJyBpbiBpdC52YWx1ZSA/IGl0LnZhbHVlLmVuZCA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbGFzdCA9IEFycmF5LmlzQXJyYXkoZW5kKSA/IGVuZFtlbmQubGVuZ3RoIC0gMV0gOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsYXN0Py50eXBlID09PSAnY29tbWVudCcpXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmQ/LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlcS5pdGVtcy5wdXNoKHsgc3RhcnQ6IFt0aGlzLnNvdXJjZVRva2VuXSB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBpdC5zdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcbiAgICAgICAgICAgIGNhc2UgJ2NvbW1lbnQnOlxuICAgICAgICAgICAgICAgIGlmIChpdC52YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgc2VxLml0ZW1zLnB1c2goeyBzdGFydDogW3RoaXMuc291cmNlVG9rZW5dIH0pO1xuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5hdEluZGVudGVkQ29tbWVudChpdC5zdGFydCwgc2VxLmluZGVudCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHByZXYgPSBzZXEuaXRlbXNbc2VxLml0ZW1zLmxlbmd0aCAtIDJdO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZW5kID0gcHJldj8udmFsdWU/LmVuZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGVuZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShlbmQsIGl0LnN0YXJ0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXEuaXRlbXMucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGl0LnN0YXJ0LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIGNhc2UgJ2FuY2hvcic6XG4gICAgICAgICAgICBjYXNlICd0YWcnOlxuICAgICAgICAgICAgICAgIGlmIChpdC52YWx1ZSB8fCB0aGlzLmluZGVudCA8PSBzZXEuaW5kZW50KVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBpdC5zdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIGNhc2UgJ3NlcS1pdGVtLWluZCc6XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaW5kZW50ICE9PSBzZXEuaW5kZW50KVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBpZiAoaXQudmFsdWUgfHwgaW5jbHVkZXNUb2tlbihpdC5zdGFydCwgJ3NlcS1pdGVtLWluZCcpKVxuICAgICAgICAgICAgICAgICAgICBzZXEuaXRlbXMucHVzaCh7IHN0YXJ0OiBbdGhpcy5zb3VyY2VUb2tlbl0gfSk7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBpdC5zdGFydC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5pbmRlbnQgPiBzZXEuaW5kZW50KSB7XG4gICAgICAgICAgICBjb25zdCBidiA9IHRoaXMuc3RhcnRCbG9ja1ZhbHVlKHNlcSk7XG4gICAgICAgICAgICBpZiAoYnYpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YWNrLnB1c2goYnYpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB5aWVsZCogdGhpcy5wb3AoKTtcbiAgICAgICAgeWllbGQqIHRoaXMuc3RlcCgpO1xuICAgIH1cbiAgICAqZmxvd0NvbGxlY3Rpb24oZmMpIHtcbiAgICAgICAgY29uc3QgaXQgPSBmYy5pdGVtc1tmYy5pdGVtcy5sZW5ndGggLSAxXTtcbiAgICAgICAgaWYgKHRoaXMudHlwZSA9PT0gJ2Zsb3ctZXJyb3ItZW5kJykge1xuICAgICAgICAgICAgbGV0IHRvcDtcbiAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wb3AoKTtcbiAgICAgICAgICAgICAgICB0b3AgPSB0aGlzLnBlZWsoMSk7XG4gICAgICAgICAgICB9IHdoaWxlICh0b3A/LnR5cGUgPT09ICdmbG93LWNvbGxlY3Rpb24nKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChmYy5lbmQubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKHRoaXMudHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2NvbW1hJzpcbiAgICAgICAgICAgICAgICBjYXNlICdleHBsaWNpdC1rZXktaW5kJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpdCB8fCBpdC5zZXApXG4gICAgICAgICAgICAgICAgICAgICAgICBmYy5pdGVtcy5wdXNoKHsgc3RhcnQ6IFt0aGlzLnNvdXJjZVRva2VuXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgaXQuc3RhcnQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGNhc2UgJ21hcC12YWx1ZS1pbmQnOlxuICAgICAgICAgICAgICAgICAgICBpZiAoIWl0IHx8IGl0LnZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgZmMuaXRlbXMucHVzaCh7IHN0YXJ0OiBbXSwga2V5OiBudWxsLCBzZXA6IFt0aGlzLnNvdXJjZVRva2VuXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaXQuc2VwKVxuICAgICAgICAgICAgICAgICAgICAgICAgaXQuc2VwLnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oaXQsIHsga2V5OiBudWxsLCBzZXA6IFt0aGlzLnNvdXJjZVRva2VuXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcbiAgICAgICAgICAgICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgICAgICAgICBjYXNlICduZXdsaW5lJzpcbiAgICAgICAgICAgICAgICBjYXNlICdhbmNob3InOlxuICAgICAgICAgICAgICAgIGNhc2UgJ3RhZyc6XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXQgfHwgaXQudmFsdWUpXG4gICAgICAgICAgICAgICAgICAgICAgICBmYy5pdGVtcy5wdXNoKHsgc3RhcnQ6IFt0aGlzLnNvdXJjZVRva2VuXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaXQuc2VwKVxuICAgICAgICAgICAgICAgICAgICAgICAgaXQuc2VwLnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0LnN0YXJ0LnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICBjYXNlICdhbGlhcyc6XG4gICAgICAgICAgICAgICAgY2FzZSAnc2NhbGFyJzpcbiAgICAgICAgICAgICAgICBjYXNlICdzaW5nbGUtcXVvdGVkLXNjYWxhcic6XG4gICAgICAgICAgICAgICAgY2FzZSAnZG91YmxlLXF1b3RlZC1zY2FsYXInOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZzID0gdGhpcy5mbG93U2NhbGFyKHRoaXMudHlwZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXQgfHwgaXQudmFsdWUpXG4gICAgICAgICAgICAgICAgICAgICAgICBmYy5pdGVtcy5wdXNoKHsgc3RhcnQ6IFtdLCBrZXk6IGZzLCBzZXA6IFtdIH0pO1xuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpdC5zZXApXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YWNrLnB1c2goZnMpO1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKGl0LCB7IGtleTogZnMsIHNlcDogW10gfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FzZSAnZmxvdy1tYXAtZW5kJzpcbiAgICAgICAgICAgICAgICBjYXNlICdmbG93LXNlcS1lbmQnOlxuICAgICAgICAgICAgICAgICAgICBmYy5lbmQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgYnYgPSB0aGlzLnN0YXJ0QmxvY2tWYWx1ZShmYyk7XG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSBzaG91bGQgbm90IGhhcHBlbiAqL1xuICAgICAgICAgICAgaWYgKGJ2KVxuICAgICAgICAgICAgICAgIHRoaXMuc3RhY2sucHVzaChidik7XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wb3AoKTtcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5zdGVwKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBwYXJlbnQgPSB0aGlzLnBlZWsoMik7XG4gICAgICAgICAgICBpZiAocGFyZW50LnR5cGUgPT09ICdibG9jay1tYXAnICYmXG4gICAgICAgICAgICAgICAgKCh0aGlzLnR5cGUgPT09ICdtYXAtdmFsdWUtaW5kJyAmJiBwYXJlbnQuaW5kZW50ID09PSBmYy5pbmRlbnQpIHx8XG4gICAgICAgICAgICAgICAgICAgICh0aGlzLnR5cGUgPT09ICduZXdsaW5lJyAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgIXBhcmVudC5pdGVtc1twYXJlbnQuaXRlbXMubGVuZ3RoIC0gMV0uc2VwKSkpIHtcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5wb3AoKTtcbiAgICAgICAgICAgICAgICB5aWVsZCogdGhpcy5zdGVwKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh0aGlzLnR5cGUgPT09ICdtYXAtdmFsdWUtaW5kJyAmJlxuICAgICAgICAgICAgICAgIHBhcmVudC50eXBlICE9PSAnZmxvdy1jb2xsZWN0aW9uJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHByZXYgPSBnZXRQcmV2UHJvcHMocGFyZW50KTtcbiAgICAgICAgICAgICAgICBjb25zdCBzdGFydCA9IGdldEZpcnN0S2V5U3RhcnRQcm9wcyhwcmV2KTtcbiAgICAgICAgICAgICAgICBmaXhGbG93U2VxSXRlbXMoZmMpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHNlcCA9IGZjLmVuZC5zcGxpY2UoMSwgZmMuZW5kLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgc2VwLnB1c2godGhpcy5zb3VyY2VUb2tlbik7XG4gICAgICAgICAgICAgICAgY29uc3QgbWFwID0ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYmxvY2stbWFwJyxcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiBmYy5vZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgIGluZGVudDogZmMuaW5kZW50LFxuICAgICAgICAgICAgICAgICAgICBpdGVtczogW3sgc3RhcnQsIGtleTogZmMsIHNlcCB9XVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy5vbktleUxpbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhY2tbdGhpcy5zdGFjay5sZW5ndGggLSAxXSA9IG1hcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLmxpbmVFbmQoZmMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGZsb3dTY2FsYXIodHlwZSkge1xuICAgICAgICBpZiAodGhpcy5vbk5ld0xpbmUpIHtcbiAgICAgICAgICAgIGxldCBubCA9IHRoaXMuc291cmNlLmluZGV4T2YoJ1xcbicpICsgMTtcbiAgICAgICAgICAgIHdoaWxlIChubCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMub25OZXdMaW5lKHRoaXMub2Zmc2V0ICsgbmwpO1xuICAgICAgICAgICAgICAgIG5sID0gdGhpcy5zb3VyY2UuaW5kZXhPZignXFxuJywgbmwpICsgMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdHlwZSxcbiAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICBpbmRlbnQ6IHRoaXMuaW5kZW50LFxuICAgICAgICAgICAgc291cmNlOiB0aGlzLnNvdXJjZVxuICAgICAgICB9O1xuICAgIH1cbiAgICBzdGFydEJsb2NrVmFsdWUocGFyZW50KSB7XG4gICAgICAgIHN3aXRjaCAodGhpcy50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdhbGlhcyc6XG4gICAgICAgICAgICBjYXNlICdzY2FsYXInOlxuICAgICAgICAgICAgY2FzZSAnc2luZ2xlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICAgICAgY2FzZSAnZG91YmxlLXF1b3RlZC1zY2FsYXInOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmZsb3dTY2FsYXIodGhpcy50eXBlKTtcbiAgICAgICAgICAgIGNhc2UgJ2Jsb2NrLXNjYWxhci1oZWFkZXInOlxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdibG9jay1zY2FsYXInLFxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICBpbmRlbnQ6IHRoaXMuaW5kZW50LFxuICAgICAgICAgICAgICAgICAgICBwcm9wczogW3RoaXMuc291cmNlVG9rZW5dLFxuICAgICAgICAgICAgICAgICAgICBzb3VyY2U6ICcnXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNhc2UgJ2Zsb3ctbWFwLXN0YXJ0JzpcbiAgICAgICAgICAgIGNhc2UgJ2Zsb3ctc2VxLXN0YXJ0JzpcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnZmxvdy1jb2xsZWN0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgaW5kZW50OiB0aGlzLmluZGVudCxcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IHRoaXMuc291cmNlVG9rZW4sXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgZW5kOiBbXVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjYXNlICdzZXEtaXRlbS1pbmQnOlxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdibG9jay1zZXEnLFxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICBpbmRlbnQ6IHRoaXMuaW5kZW50LFxuICAgICAgICAgICAgICAgICAgICBpdGVtczogW3sgc3RhcnQ6IFt0aGlzLnNvdXJjZVRva2VuXSB9XVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjYXNlICdleHBsaWNpdC1rZXktaW5kJzoge1xuICAgICAgICAgICAgICAgIHRoaXMub25LZXlMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBjb25zdCBwcmV2ID0gZ2V0UHJldlByb3BzKHBhcmVudCk7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhcnQgPSBnZXRGaXJzdEtleVN0YXJ0UHJvcHMocHJldik7XG4gICAgICAgICAgICAgICAgc3RhcnQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYmxvY2stbWFwJyxcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgaW5kZW50OiB0aGlzLmluZGVudCxcbiAgICAgICAgICAgICAgICAgICAgaXRlbXM6IFt7IHN0YXJ0LCBleHBsaWNpdEtleTogdHJ1ZSB9XVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlICdtYXAtdmFsdWUtaW5kJzoge1xuICAgICAgICAgICAgICAgIHRoaXMub25LZXlMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBjb25zdCBwcmV2ID0gZ2V0UHJldlByb3BzKHBhcmVudCk7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhcnQgPSBnZXRGaXJzdEtleVN0YXJ0UHJvcHMocHJldik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Jsb2NrLW1hcCcsXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgIGluZGVudDogdGhpcy5pbmRlbnQsXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbeyBzdGFydCwga2V5OiBudWxsLCBzZXA6IFt0aGlzLnNvdXJjZVRva2VuXSB9XVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGF0SW5kZW50ZWRDb21tZW50KHN0YXJ0LCBpbmRlbnQpIHtcbiAgICAgICAgaWYgKHRoaXMudHlwZSAhPT0gJ2NvbW1lbnQnKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZiAodGhpcy5pbmRlbnQgPD0gaW5kZW50KVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICByZXR1cm4gc3RhcnQuZXZlcnkoc3QgPT4gc3QudHlwZSA9PT0gJ25ld2xpbmUnIHx8IHN0LnR5cGUgPT09ICdzcGFjZScpO1xuICAgIH1cbiAgICAqZG9jdW1lbnRFbmQoZG9jRW5kKSB7XG4gICAgICAgIGlmICh0aGlzLnR5cGUgIT09ICdkb2MtbW9kZScpIHtcbiAgICAgICAgICAgIGlmIChkb2NFbmQuZW5kKVxuICAgICAgICAgICAgICAgIGRvY0VuZC5lbmQucHVzaCh0aGlzLnNvdXJjZVRva2VuKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBkb2NFbmQuZW5kID0gW3RoaXMuc291cmNlVG9rZW5dO1xuICAgICAgICAgICAgaWYgKHRoaXMudHlwZSA9PT0gJ25ld2xpbmUnKVxuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnBvcCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgICpsaW5lRW5kKHRva2VuKSB7XG4gICAgICAgIHN3aXRjaCAodGhpcy50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdjb21tYSc6XG4gICAgICAgICAgICBjYXNlICdkb2Mtc3RhcnQnOlxuICAgICAgICAgICAgY2FzZSAnZG9jLWVuZCc6XG4gICAgICAgICAgICBjYXNlICdmbG93LXNlcS1lbmQnOlxuICAgICAgICAgICAgY2FzZSAnZmxvdy1tYXAtZW5kJzpcbiAgICAgICAgICAgIGNhc2UgJ21hcC12YWx1ZS1pbmQnOlxuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnBvcCgpO1xuICAgICAgICAgICAgICAgIHlpZWxkKiB0aGlzLnN0ZXAoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ25ld2xpbmUnOlxuICAgICAgICAgICAgICAgIHRoaXMub25LZXlMaW5lID0gZmFsc2U7XG4gICAgICAgICAgICAvLyBmYWxsdGhyb3VnaFxuICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxuICAgICAgICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIC8vIGFsbCBvdGhlciB2YWx1ZXMgYXJlIGVycm9yc1xuICAgICAgICAgICAgICAgIGlmICh0b2tlbi5lbmQpXG4gICAgICAgICAgICAgICAgICAgIHRva2VuLmVuZC5wdXNoKHRoaXMuc291cmNlVG9rZW4pO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdG9rZW4uZW5kID0gW3RoaXMuc291cmNlVG9rZW5dO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnR5cGUgPT09ICduZXdsaW5lJylcbiAgICAgICAgICAgICAgICAgICAgeWllbGQqIHRoaXMucG9wKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydHMuUGFyc2VyID0gUGFyc2VyO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBjb21wb3NlciA9IHJlcXVpcmUoJy4vY29tcG9zZS9jb21wb3Nlci5qcycpO1xudmFyIERvY3VtZW50ID0gcmVxdWlyZSgnLi9kb2MvRG9jdW1lbnQuanMnKTtcbnZhciBlcnJvcnMgPSByZXF1aXJlKCcuL2Vycm9ycy5qcycpO1xudmFyIGxvZyA9IHJlcXVpcmUoJy4vbG9nLmpzJyk7XG52YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuL25vZGVzL2lkZW50aXR5LmpzJyk7XG52YXIgbGluZUNvdW50ZXIgPSByZXF1aXJlKCcuL3BhcnNlL2xpbmUtY291bnRlci5qcycpO1xudmFyIHBhcnNlciA9IHJlcXVpcmUoJy4vcGFyc2UvcGFyc2VyLmpzJyk7XG5cbmZ1bmN0aW9uIHBhcnNlT3B0aW9ucyhvcHRpb25zKSB7XG4gICAgY29uc3QgcHJldHR5RXJyb3JzID0gb3B0aW9ucy5wcmV0dHlFcnJvcnMgIT09IGZhbHNlO1xuICAgIGNvbnN0IGxpbmVDb3VudGVyJDEgPSBvcHRpb25zLmxpbmVDb3VudGVyIHx8IChwcmV0dHlFcnJvcnMgJiYgbmV3IGxpbmVDb3VudGVyLkxpbmVDb3VudGVyKCkpIHx8IG51bGw7XG4gICAgcmV0dXJuIHsgbGluZUNvdW50ZXI6IGxpbmVDb3VudGVyJDEsIHByZXR0eUVycm9ycyB9O1xufVxuLyoqXG4gKiBQYXJzZSB0aGUgaW5wdXQgYXMgYSBzdHJlYW0gb2YgWUFNTCBkb2N1bWVudHMuXG4gKlxuICogRG9jdW1lbnRzIHNob3VsZCBiZSBzZXBhcmF0ZWQgZnJvbSBlYWNoIG90aGVyIGJ5IGAuLi5gIG9yIGAtLS1gIG1hcmtlciBsaW5lcy5cbiAqXG4gKiBAcmV0dXJucyBJZiBhbiBlbXB0eSBgZG9jc2AgYXJyYXkgaXMgcmV0dXJuZWQsIGl0IHdpbGwgYmUgb2YgdHlwZVxuICogICBFbXB0eVN0cmVhbSBhbmQgY29udGFpbiBhZGRpdGlvbmFsIHN0cmVhbSBpbmZvcm1hdGlvbi4gSW5cbiAqICAgVHlwZVNjcmlwdCwgeW91IHNob3VsZCB1c2UgYCdlbXB0eScgaW4gZG9jc2AgYXMgYSB0eXBlIGd1YXJkIGZvciBpdC5cbiAqL1xuZnVuY3Rpb24gcGFyc2VBbGxEb2N1bWVudHMoc291cmNlLCBvcHRpb25zID0ge30pIHtcbiAgICBjb25zdCB7IGxpbmVDb3VudGVyLCBwcmV0dHlFcnJvcnMgfSA9IHBhcnNlT3B0aW9ucyhvcHRpb25zKTtcbiAgICBjb25zdCBwYXJzZXIkMSA9IG5ldyBwYXJzZXIuUGFyc2VyKGxpbmVDb3VudGVyPy5hZGROZXdMaW5lKTtcbiAgICBjb25zdCBjb21wb3NlciQxID0gbmV3IGNvbXBvc2VyLkNvbXBvc2VyKG9wdGlvbnMpO1xuICAgIGNvbnN0IGRvY3MgPSBBcnJheS5mcm9tKGNvbXBvc2VyJDEuY29tcG9zZShwYXJzZXIkMS5wYXJzZShzb3VyY2UpKSk7XG4gICAgaWYgKHByZXR0eUVycm9ycyAmJiBsaW5lQ291bnRlcilcbiAgICAgICAgZm9yIChjb25zdCBkb2Mgb2YgZG9jcykge1xuICAgICAgICAgICAgZG9jLmVycm9ycy5mb3JFYWNoKGVycm9ycy5wcmV0dGlmeUVycm9yKHNvdXJjZSwgbGluZUNvdW50ZXIpKTtcbiAgICAgICAgICAgIGRvYy53YXJuaW5ncy5mb3JFYWNoKGVycm9ycy5wcmV0dGlmeUVycm9yKHNvdXJjZSwgbGluZUNvdW50ZXIpKTtcbiAgICAgICAgfVxuICAgIGlmIChkb2NzLmxlbmd0aCA+IDApXG4gICAgICAgIHJldHVybiBkb2NzO1xuICAgIHJldHVybiBPYmplY3QuYXNzaWduKFtdLCB7IGVtcHR5OiB0cnVlIH0sIGNvbXBvc2VyJDEuc3RyZWFtSW5mbygpKTtcbn1cbi8qKiBQYXJzZSBhbiBpbnB1dCBzdHJpbmcgaW50byBhIHNpbmdsZSBZQU1MLkRvY3VtZW50ICovXG5mdW5jdGlvbiBwYXJzZURvY3VtZW50KHNvdXJjZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgY29uc3QgeyBsaW5lQ291bnRlciwgcHJldHR5RXJyb3JzIH0gPSBwYXJzZU9wdGlvbnMob3B0aW9ucyk7XG4gICAgY29uc3QgcGFyc2VyJDEgPSBuZXcgcGFyc2VyLlBhcnNlcihsaW5lQ291bnRlcj8uYWRkTmV3TGluZSk7XG4gICAgY29uc3QgY29tcG9zZXIkMSA9IG5ldyBjb21wb3Nlci5Db21wb3NlcihvcHRpb25zKTtcbiAgICAvLyBgZG9jYCBpcyBhbHdheXMgc2V0IGJ5IGNvbXBvc2UuZW5kKHRydWUpIGF0IHRoZSB2ZXJ5IGxhdGVzdFxuICAgIGxldCBkb2MgPSBudWxsO1xuICAgIGZvciAoY29uc3QgX2RvYyBvZiBjb21wb3NlciQxLmNvbXBvc2UocGFyc2VyJDEucGFyc2Uoc291cmNlKSwgdHJ1ZSwgc291cmNlLmxlbmd0aCkpIHtcbiAgICAgICAgaWYgKCFkb2MpXG4gICAgICAgICAgICBkb2MgPSBfZG9jO1xuICAgICAgICBlbHNlIGlmIChkb2Mub3B0aW9ucy5sb2dMZXZlbCAhPT0gJ3NpbGVudCcpIHtcbiAgICAgICAgICAgIGRvYy5lcnJvcnMucHVzaChuZXcgZXJyb3JzLllBTUxQYXJzZUVycm9yKF9kb2MucmFuZ2Uuc2xpY2UoMCwgMiksICdNVUxUSVBMRV9ET0NTJywgJ1NvdXJjZSBjb250YWlucyBtdWx0aXBsZSBkb2N1bWVudHM7IHBsZWFzZSB1c2UgWUFNTC5wYXJzZUFsbERvY3VtZW50cygpJykpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHByZXR0eUVycm9ycyAmJiBsaW5lQ291bnRlcikge1xuICAgICAgICBkb2MuZXJyb3JzLmZvckVhY2goZXJyb3JzLnByZXR0aWZ5RXJyb3Ioc291cmNlLCBsaW5lQ291bnRlcikpO1xuICAgICAgICBkb2Mud2FybmluZ3MuZm9yRWFjaChlcnJvcnMucHJldHRpZnlFcnJvcihzb3VyY2UsIGxpbmVDb3VudGVyKSk7XG4gICAgfVxuICAgIHJldHVybiBkb2M7XG59XG5mdW5jdGlvbiBwYXJzZShzcmMsIHJldml2ZXIsIG9wdGlvbnMpIHtcbiAgICBsZXQgX3Jldml2ZXIgPSB1bmRlZmluZWQ7XG4gICAgaWYgKHR5cGVvZiByZXZpdmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIF9yZXZpdmVyID0gcmV2aXZlcjtcbiAgICB9XG4gICAgZWxzZSBpZiAob3B0aW9ucyA9PT0gdW5kZWZpbmVkICYmIHJldml2ZXIgJiYgdHlwZW9mIHJldml2ZXIgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG9wdGlvbnMgPSByZXZpdmVyO1xuICAgIH1cbiAgICBjb25zdCBkb2MgPSBwYXJzZURvY3VtZW50KHNyYywgb3B0aW9ucyk7XG4gICAgaWYgKCFkb2MpXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIGRvYy53YXJuaW5ncy5mb3JFYWNoKHdhcm5pbmcgPT4gbG9nLndhcm4oZG9jLm9wdGlvbnMubG9nTGV2ZWwsIHdhcm5pbmcpKTtcbiAgICBpZiAoZG9jLmVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGlmIChkb2Mub3B0aW9ucy5sb2dMZXZlbCAhPT0gJ3NpbGVudCcpXG4gICAgICAgICAgICB0aHJvdyBkb2MuZXJyb3JzWzBdO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBkb2MuZXJyb3JzID0gW107XG4gICAgfVxuICAgIHJldHVybiBkb2MudG9KUyhPYmplY3QuYXNzaWduKHsgcmV2aXZlcjogX3Jldml2ZXIgfSwgb3B0aW9ucykpO1xufVxuZnVuY3Rpb24gc3RyaW5naWZ5KHZhbHVlLCByZXBsYWNlciwgb3B0aW9ucykge1xuICAgIGxldCBfcmVwbGFjZXIgPSBudWxsO1xuICAgIGlmICh0eXBlb2YgcmVwbGFjZXIgPT09ICdmdW5jdGlvbicgfHwgQXJyYXkuaXNBcnJheShyZXBsYWNlcikpIHtcbiAgICAgICAgX3JlcGxhY2VyID0gcmVwbGFjZXI7XG4gICAgfVxuICAgIGVsc2UgaWYgKG9wdGlvbnMgPT09IHVuZGVmaW5lZCAmJiByZXBsYWNlcikge1xuICAgICAgICBvcHRpb25zID0gcmVwbGFjZXI7XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ3N0cmluZycpXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zLmxlbmd0aDtcbiAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdudW1iZXInKSB7XG4gICAgICAgIGNvbnN0IGluZGVudCA9IE1hdGgucm91bmQob3B0aW9ucyk7XG4gICAgICAgIG9wdGlvbnMgPSBpbmRlbnQgPCAxID8gdW5kZWZpbmVkIDogaW5kZW50ID4gOCA/IHsgaW5kZW50OiA4IH0gOiB7IGluZGVudCB9O1xuICAgIH1cbiAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjb25zdCB7IGtlZXBVbmRlZmluZWQgfSA9IG9wdGlvbnMgPz8gcmVwbGFjZXIgPz8ge307XG4gICAgICAgIGlmICgha2VlcFVuZGVmaW5lZClcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGlmIChpZGVudGl0eS5pc0RvY3VtZW50KHZhbHVlKSAmJiAhX3JlcGxhY2VyKVxuICAgICAgICByZXR1cm4gdmFsdWUudG9TdHJpbmcob3B0aW9ucyk7XG4gICAgcmV0dXJuIG5ldyBEb2N1bWVudC5Eb2N1bWVudCh2YWx1ZSwgX3JlcGxhY2VyLCBvcHRpb25zKS50b1N0cmluZyhvcHRpb25zKTtcbn1cblxuZXhwb3J0cy5wYXJzZSA9IHBhcnNlO1xuZXhwb3J0cy5wYXJzZUFsbERvY3VtZW50cyA9IHBhcnNlQWxsRG9jdW1lbnRzO1xuZXhwb3J0cy5wYXJzZURvY3VtZW50ID0gcGFyc2VEb2N1bWVudDtcbmV4cG9ydHMuc3RyaW5naWZ5ID0gc3RyaW5naWZ5O1xuIiwKICAgICIvKipcbiAqIFBsYW4gcGFyc2VyIGZvciB0aGUgRmVyZyBFbmdpbmVlcmluZyBTeXN0ZW0uXG4gKiBIYW5kbGVzIFlBTUwgcGFyc2luZywgdmFsaWRhdGlvbiwgYW5kIGRlcGVuZGVuY3kgcmVzb2x1dGlvbiBmb3IgZXhlY3V0aW9uIHBsYW5zLlxuICovXG5cbmltcG9ydCB7IHJlYWRGaWxlU3luYyB9IGZyb20gXCJub2RlOmZzXCI7XG5pbXBvcnQgeyBEb2N1bWVudCwgcGFyc2UgYXMgcGFyc2VZYW1sIH0gZnJvbSBcInlhbWxcIjtcbmltcG9ydCB7XG4gICAgdHlwZSBBZ2VudFRhc2ssXG4gICAgQWdlbnRUeXBlIGFzIEFnZW50VGFza1R5cGUsXG4gICAgQ29uZmlkZW5jZUxldmVsLFxuICAgIEV4ZWN1dGlvblN0cmF0ZWd5LFxufSBmcm9tIFwiLi4vYWdlbnRzL3R5cGVzXCI7XG5pbXBvcnQge1xuICAgIHR5cGUgRXhlY3V0YWJsZVRhc2ssXG4gICAgdHlwZSBQbGFuLFxuICAgIHR5cGUgUGxhbk1ldGFkYXRhLFxuICAgIHR5cGUgUXVhbGl0eUdhdGVDb25maWcsXG4gICAgUXVhbGl0eUdhdGVUeXBlLFxuICAgIHR5cGUgVGFzayxcbiAgICBUYXNrVHlwZSxcbiAgICB0eXBlIFZhbGlkYXRpb25FcnJvcixcbiAgICBWYWxpZGF0aW9uRXJyb3JUeXBlLFxufSBmcm9tIFwiLi90eXBlc1wiO1xuXG5leHBvcnQgY2xhc3MgUGxhblBhcnNlciB7XG4gICAgcHJpdmF0ZSBlcnJvcnM6IFZhbGlkYXRpb25FcnJvcltdID0gW107XG4gICAgcHJpdmF0ZSB3YXJuaW5nczogc3RyaW5nW10gPSBbXTtcblxuICAgIC8qKlxuICAgICAqIFBhcnNlIGEgcGxhbiBmaWxlIGZyb20gdGhlIGZpbGVzeXN0ZW1cbiAgICAgKi9cbiAgICBwdWJsaWMgcGFyc2VGaWxlKGZpbGVQYXRoOiBzdHJpbmcpOiBQbGFuIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSByZWFkRmlsZVN5bmMoZmlsZVBhdGgsIFwidXRmOFwiKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlQ29udGVudChjb250ZW50LCBmaWxlUGF0aCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgYEZhaWxlZCB0byByZWFkIHBsYW4gZmlsZTogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFwiVW5rbm93biBlcnJvclwifWAsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUGFyc2UgcGxhbiBjb250ZW50IGZyb20gc3RyaW5nXG4gICAgICovXG4gICAgcHVibGljIHBhcnNlQ29udGVudChjb250ZW50OiBzdHJpbmcsIHNvdXJjZT86IHN0cmluZyk6IFBsYW4ge1xuICAgICAgICB0aGlzLmVycm9ycyA9IFtdO1xuICAgICAgICB0aGlzLndhcm5pbmdzID0gW107XG5cbiAgICAgICAgbGV0IHJhd1BsYW46IGFueTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJhd1BsYW4gPSBwYXJzZVlhbWwoY29udGVudCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgYEludmFsaWQgWUFNTCBzeW50YXg6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBcIlVua25vd24gZXJyb3JcIn1gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFZhbGlkYXRlIHRvcC1sZXZlbCBzdHJ1Y3R1cmVcbiAgICAgICAgdGhpcy52YWxpZGF0ZVRvcExldmVsU3RydWN0dXJlKHJhd1BsYW4pO1xuXG4gICAgICAgIGlmICh0aGlzLmVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgYFBsYW4gdmFsaWRhdGlvbiBmYWlsZWQ6XFxuJHt0aGlzLmVycm9ycy5tYXAoKGUpID0+IGAgIC0gJHtlLm1lc3NhZ2V9YCkuam9pbihcIlxcblwiKX1gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFBhcnNlIGFuZCB2YWxpZGF0ZSBtZXRhZGF0YVxuICAgICAgICBjb25zdCBtZXRhZGF0YSA9IHRoaXMucGFyc2VNZXRhZGF0YShyYXdQbGFuLm1ldGFkYXRhKTtcblxuICAgICAgICAvLyBQYXJzZSBhbmQgdmFsaWRhdGUgdGFza3NcbiAgICAgICAgY29uc3QgdGFza3MgPSB0aGlzLnBhcnNlVGFza3MocmF3UGxhbi50YXNrcyB8fCBbXSk7XG5cbiAgICAgICAgLy8gUGFyc2UgYW5kIHZhbGlkYXRlIHF1YWxpdHkgZ2F0ZXNcbiAgICAgICAgY29uc3QgcXVhbGl0eUdhdGVzID0gdGhpcy5wYXJzZVF1YWxpdHlHYXRlcyhyYXdQbGFuLnF1YWxpdHlHYXRlcyB8fCBbXSk7XG5cbiAgICAgICAgLy8gVmFsaWRhdGUgdGFzayBkZXBlbmRlbmNpZXNcbiAgICAgICAgdGhpcy52YWxpZGF0ZVRhc2tEZXBlbmRlbmNpZXModGFza3MpO1xuXG4gICAgICAgIGlmICh0aGlzLmVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgYFBsYW4gdmFsaWRhdGlvbiBmYWlsZWQ6XFxuJHt0aGlzLmVycm9ycy5tYXAoKGUpID0+IGAgIC0gJHtlLm1lc3NhZ2V9YCkuam9pbihcIlxcblwiKX1gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBtZXRhZGF0YSxcbiAgICAgICAgICAgIHRhc2tzLFxuICAgICAgICAgICAgcXVhbGl0eUdhdGVzLFxuICAgICAgICAgICAgZXJyb3JzOiB0aGlzLmVycm9ycyxcbiAgICAgICAgICAgIHdhcm5pbmdzOiB0aGlzLndhcm5pbmdzLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB2YWxpZGF0aW9uIGVycm9ycyBmcm9tIHRoZSBsYXN0IHBhcnNlXG4gICAgICovXG4gICAgcHVibGljIGdldEVycm9ycygpOiBWYWxpZGF0aW9uRXJyb3JbXSB7XG4gICAgICAgIHJldHVybiBbLi4udGhpcy5lcnJvcnNdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB2YWxpZGF0aW9uIHdhcm5pbmdzIGZyb20gdGhlIGxhc3QgcGFyc2VcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0V2FybmluZ3MoKTogc3RyaW5nW10ge1xuICAgICAgICByZXR1cm4gWy4uLnRoaXMud2FybmluZ3NdO1xuICAgIH1cblxuICAgIHByaXZhdGUgdmFsaWRhdGVUb3BMZXZlbFN0cnVjdHVyZShwbGFuOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgaWYgKCFwbGFuIHx8IHR5cGVvZiBwbGFuICE9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICB0aGlzLmVycm9ycy5wdXNoKHtcbiAgICAgICAgICAgICAgICB0eXBlOiBWYWxpZGF0aW9uRXJyb3JUeXBlLlRZUEUsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogXCJQbGFuIG11c3QgYmUgYW4gb2JqZWN0XCIsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHBsYW4sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghcGxhbi5tZXRhZGF0YSkge1xuICAgICAgICAgICAgdGhpcy5lcnJvcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgdHlwZTogVmFsaWRhdGlvbkVycm9yVHlwZS5SRVFVSVJFRCxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBcIm1ldGFkYXRhIHNlY3Rpb24gaXMgcmVxdWlyZWRcIixcbiAgICAgICAgICAgICAgICBwYXRoOiBcIm1ldGFkYXRhXCIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwbGFuLnRhc2tzICYmICFBcnJheS5pc0FycmF5KHBsYW4udGFza3MpKSB7XG4gICAgICAgICAgICB0aGlzLmVycm9ycy5wdXNoKHtcbiAgICAgICAgICAgICAgICB0eXBlOiBWYWxpZGF0aW9uRXJyb3JUeXBlLlRZUEUsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogXCJ0YXNrcyBtdXN0IGJlIGFuIGFycmF5XCIsXG4gICAgICAgICAgICAgICAgcGF0aDogXCJ0YXNrc1wiLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBwbGFuLnRhc2tzLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGxhbi5xdWFsaXR5R2F0ZXMgJiYgIUFycmF5LmlzQXJyYXkocGxhbi5xdWFsaXR5R2F0ZXMpKSB7XG4gICAgICAgICAgICB0aGlzLmVycm9ycy5wdXNoKHtcbiAgICAgICAgICAgICAgICB0eXBlOiBWYWxpZGF0aW9uRXJyb3JUeXBlLlRZUEUsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogXCJxdWFsaXR5R2F0ZXMgbXVzdCBiZSBhbiBhcnJheVwiLFxuICAgICAgICAgICAgICAgIHBhdGg6IFwicXVhbGl0eUdhdGVzXCIsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHBsYW4ucXVhbGl0eUdhdGVzLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHBhcnNlTWV0YWRhdGEobWV0YWRhdGE6IGFueSk6IFBsYW5NZXRhZGF0YSB7XG4gICAgICAgIGlmICghbWV0YWRhdGEgfHwgdHlwZW9mIG1ldGFkYXRhICE9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICB0aGlzLmVycm9ycy5wdXNoKHtcbiAgICAgICAgICAgICAgICB0eXBlOiBWYWxpZGF0aW9uRXJyb3JUeXBlLlJFUVVJUkVELFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwibWV0YWRhdGEgaXMgcmVxdWlyZWQgYW5kIG11c3QgYmUgYW4gb2JqZWN0XCIsXG4gICAgICAgICAgICAgICAgcGF0aDogXCJtZXRhZGF0YVwiLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIG1ldGFkYXRhXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVxdWlyZWQgZmllbGRzXG4gICAgICAgIGlmICghbWV0YWRhdGEuaWQgfHwgdHlwZW9mIG1ldGFkYXRhLmlkICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICB0aGlzLmVycm9ycy5wdXNoKHtcbiAgICAgICAgICAgICAgICB0eXBlOiBWYWxpZGF0aW9uRXJyb3JUeXBlLlJFUVVJUkVELFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwibWV0YWRhdGEuaWQgaXMgcmVxdWlyZWQgYW5kIG11c3QgYmUgYSBzdHJpbmdcIixcbiAgICAgICAgICAgICAgICBwYXRoOiBcIm1ldGFkYXRhLmlkXCIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghbWV0YWRhdGEubmFtZSB8fCB0eXBlb2YgbWV0YWRhdGEubmFtZSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgdGhpcy5lcnJvcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgdHlwZTogVmFsaWRhdGlvbkVycm9yVHlwZS5SRVFVSVJFRCxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBcIm1ldGFkYXRhLm5hbWUgaXMgcmVxdWlyZWQgYW5kIG11c3QgYmUgYSBzdHJpbmdcIixcbiAgICAgICAgICAgICAgICBwYXRoOiBcIm1ldGFkYXRhLm5hbWVcIixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFtZXRhZGF0YS52ZXJzaW9uIHx8IHR5cGVvZiBtZXRhZGF0YS52ZXJzaW9uICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICB0aGlzLmVycm9ycy5wdXNoKHtcbiAgICAgICAgICAgICAgICB0eXBlOiBWYWxpZGF0aW9uRXJyb3JUeXBlLlJFUVVJUkVELFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwibWV0YWRhdGEudmVyc2lvbiBpcyByZXF1aXJlZCBhbmQgbXVzdCBiZSBhIHN0cmluZ1wiLFxuICAgICAgICAgICAgICAgIHBhdGg6IFwibWV0YWRhdGEudmVyc2lvblwiLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBWYWxpZGF0ZSB2ZXJzaW9uIGZvcm1hdCAoc2VtdmVyLWxpa2UpXG4gICAgICAgIGlmIChtZXRhZGF0YS52ZXJzaW9uICYmICEvXlxcZCtcXC5cXGQrXFwuXFxkKy8udGVzdChtZXRhZGF0YS52ZXJzaW9uKSkge1xuICAgICAgICAgICAgdGhpcy53YXJuaW5ncy5wdXNoKFxuICAgICAgICAgICAgICAgIGBtZXRhZGF0YS52ZXJzaW9uIFwiJHttZXRhZGF0YS52ZXJzaW9ufVwiIHNob3VsZCBmb2xsb3cgc2VtYW50aWMgdmVyc2lvbmluZyAoeC55LnopYCxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaWQ6IG1ldGFkYXRhLmlkIHx8IFwiXCIsXG4gICAgICAgICAgICBuYW1lOiBtZXRhZGF0YS5uYW1lIHx8IFwiXCIsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogbWV0YWRhdGEuZGVzY3JpcHRpb24sXG4gICAgICAgICAgICB2ZXJzaW9uOiBtZXRhZGF0YS52ZXJzaW9uIHx8IFwiMS4wLjBcIixcbiAgICAgICAgICAgIGF1dGhvcjogbWV0YWRhdGEuYXV0aG9yLFxuICAgICAgICAgICAgY3JlYXRlZDogbWV0YWRhdGEuY3JlYXRlZCxcbiAgICAgICAgICAgIG1vZGlmaWVkOiBtZXRhZGF0YS5tb2RpZmllZCxcbiAgICAgICAgICAgIHRhZ3M6IEFycmF5LmlzQXJyYXkobWV0YWRhdGEudGFncykgPyBtZXRhZGF0YS50YWdzIDogW10sXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBwYXJzZVRhc2tzKHRhc2tzOiBhbnlbXSk6IEV4ZWN1dGFibGVUYXNrW10ge1xuICAgICAgICBjb25zdCBwYXJzZWRUYXNrczogRXhlY3V0YWJsZVRhc2tbXSA9IFtdO1xuICAgICAgICBjb25zdCB0YXNrSWRzID0gbmV3IFNldDxzdHJpbmc+KCk7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0YXNrcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgdGFza0RhdGEgPSB0YXNrc1tpXTtcblxuICAgICAgICAgICAgaWYgKCF0YXNrRGF0YSB8fCB0eXBlb2YgdGFza0RhdGEgIT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVycm9ycy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogVmFsaWRhdGlvbkVycm9yVHlwZS5UWVBFLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBgVGFzayBhdCBpbmRleCAke2l9IG11c3QgYmUgYW4gb2JqZWN0YCxcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogYHRhc2tzWyR7aX1dYCxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHRhc2tEYXRhLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCB0YXNrID0gdGhpcy5wYXJzZVRhc2sodGFza0RhdGEsIGkpO1xuXG4gICAgICAgICAgICBpZiAodGFzaykge1xuICAgICAgICAgICAgICAgIC8vIENoZWNrIGZvciBkdXBsaWNhdGUgSURzXG4gICAgICAgICAgICAgICAgaWYgKHRhc2tJZHMuaGFzKHRhc2suaWQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXJyb3JzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogVmFsaWRhdGlvbkVycm9yVHlwZS5EVVBMSUNBVEVfSUQsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBgRHVwbGljYXRlIHRhc2sgSUQ6ICR7dGFzay5pZH1gLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogYHRhc2tzWyR7aX1dLmlkYCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB0YXNrLmlkLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0YXNrSWRzLmFkZCh0YXNrLmlkKTtcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VkVGFza3MucHVzaCh0YXNrKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGFyc2VkVGFza3M7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBwYXJzZVRhc2sodGFza0RhdGE6IGFueSwgaW5kZXg6IG51bWJlcik6IEV4ZWN1dGFibGVUYXNrIHwgbnVsbCB7XG4gICAgICAgIC8vIFJlcXVpcmVkIGZpZWxkc1xuICAgICAgICBpZiAoIXRhc2tEYXRhLmlkIHx8IHR5cGVvZiB0YXNrRGF0YS5pZCAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgdGhpcy5lcnJvcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgdHlwZTogVmFsaWRhdGlvbkVycm9yVHlwZS5SRVFVSVJFRCxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBgVGFzayBhdCBpbmRleCAke2luZGV4fSByZXF1aXJlcyBhIHZhbGlkIGlkYCxcbiAgICAgICAgICAgICAgICBwYXRoOiBgdGFza3NbJHtpbmRleH1dLmlkYCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRhc2tEYXRhLm5hbWUgfHwgdHlwZW9mIHRhc2tEYXRhLm5hbWUgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHRoaXMuZXJyb3JzLnB1c2goe1xuICAgICAgICAgICAgICAgIHR5cGU6IFZhbGlkYXRpb25FcnJvclR5cGUuUkVRVUlSRUQsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogYFRhc2sgXCIke3Rhc2tEYXRhLmlkfVwiIHJlcXVpcmVzIGEgdmFsaWQgbmFtZWAsXG4gICAgICAgICAgICAgICAgcGF0aDogYHRhc2tzWyR7aW5kZXh9XS5uYW1lYCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBZ2VudCB0YXNrcyBkb24ndCByZXF1aXJlIGNvbW1hbmRzXG4gICAgICAgIGlmICghdGhpcy5pc0FnZW50VGFza1R5cGUodGFza0RhdGEudHlwZSkpIHtcbiAgICAgICAgICAgIGlmICghdGFza0RhdGEuY29tbWFuZCB8fCB0eXBlb2YgdGFza0RhdGEuY29tbWFuZCAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgIHRoaXMuZXJyb3JzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBWYWxpZGF0aW9uRXJyb3JUeXBlLlJFUVVJUkVELFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBgVGFzayBcIiR7dGFza0RhdGEuaWR9XCIgcmVxdWlyZXMgYSB2YWxpZCBjb21tYW5kYCxcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogYHRhc2tzWyR7aW5kZXh9XS5jb21tYW5kYCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFBhcnNlIHRhc2sgdHlwZVxuICAgICAgICBsZXQgdGFza1R5cGU6IFRhc2tUeXBlID0gVGFza1R5cGUuU0hFTEw7XG4gICAgICAgIGlmICh0YXNrRGF0YS50eXBlKSB7XG4gICAgICAgICAgICBpZiAoIU9iamVjdC52YWx1ZXMoVGFza1R5cGUpLmluY2x1ZGVzKHRhc2tEYXRhLnR5cGUpKSB7XG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgaWYgaXQncyBhbiBhZ2VudCB0YXNrIHR5cGVcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pc0FnZW50VGFza1R5cGUodGFza0RhdGEudHlwZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VBZ2VudFRhc2sodGFza0RhdGEsIGluZGV4KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLmVycm9ycy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogVmFsaWRhdGlvbkVycm9yVHlwZS5UWVBFLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBgSW52YWxpZCB0YXNrIHR5cGUgXCIke3Rhc2tEYXRhLnR5cGV9XCIgZm9yIHRhc2sgXCIke3Rhc2tEYXRhLmlkfVwiYCxcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogYHRhc2tzWyR7aW5kZXh9XS50eXBlYCxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHRhc2tEYXRhLnR5cGUsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0YXNrVHlwZSA9IHRhc2tEYXRhLnR5cGUgYXMgVGFza1R5cGU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBWYWxpZGF0ZSB0aW1lb3V0XG4gICAgICAgIGlmICh0YXNrRGF0YS50aW1lb3V0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdGFza0RhdGEudGltZW91dCAhPT0gXCJudW1iZXJcIiB8fCB0YXNrRGF0YS50aW1lb3V0IDw9IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVycm9ycy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogVmFsaWRhdGlvbkVycm9yVHlwZS5SQU5HRSxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogYFRhc2sgXCIke3Rhc2tEYXRhLmlkfVwiIHRpbWVvdXQgbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcmAsXG4gICAgICAgICAgICAgICAgICAgIHBhdGg6IGB0YXNrc1ske2luZGV4fV0udGltZW91dGAsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiB0YXNrRGF0YS50aW1lb3V0LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gVmFsaWRhdGUgcmV0cnkgY29uZmlndXJhdGlvblxuICAgICAgICBpZiAodGFza0RhdGEucmV0cnkpIHtcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAhdGFza0RhdGEucmV0cnkubWF4QXR0ZW1wdHMgfHxcbiAgICAgICAgICAgICAgICB0eXBlb2YgdGFza0RhdGEucmV0cnkubWF4QXR0ZW1wdHMgIT09IFwibnVtYmVyXCIgfHxcbiAgICAgICAgICAgICAgICB0YXNrRGF0YS5yZXRyeS5tYXhBdHRlbXB0cyA8IDFcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHRoaXMuZXJyb3JzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBWYWxpZGF0aW9uRXJyb3JUeXBlLlJBTkdFLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBgVGFzayBcIiR7dGFza0RhdGEuaWR9XCIgcmV0cnkubWF4QXR0ZW1wdHMgbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcmAsXG4gICAgICAgICAgICAgICAgICAgIHBhdGg6IGB0YXNrc1ske2luZGV4fV0ucmV0cnkubWF4QXR0ZW1wdHNgLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdGFza0RhdGEucmV0cnk/Lm1heEF0dGVtcHRzLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgIXRhc2tEYXRhLnJldHJ5LmRlbGF5IHx8XG4gICAgICAgICAgICAgICAgdHlwZW9mIHRhc2tEYXRhLnJldHJ5LmRlbGF5ICE9PSBcIm51bWJlclwiIHx8XG4gICAgICAgICAgICAgICAgdGFza0RhdGEucmV0cnkuZGVsYXkgPCAwXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVycm9ycy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogVmFsaWRhdGlvbkVycm9yVHlwZS5SQU5HRSxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogYFRhc2sgXCIke3Rhc2tEYXRhLmlkfVwiIHJldHJ5LmRlbGF5IG11c3QgYmUgYSBub24tbmVnYXRpdmUgbnVtYmVyYCxcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogYHRhc2tzWyR7aW5kZXh9XS5yZXRyeS5kZWxheWAsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiB0YXNrRGF0YS5yZXRyeT8uZGVsYXksXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaWQ6IHRhc2tEYXRhLmlkLFxuICAgICAgICAgICAgbmFtZTogdGFza0RhdGEubmFtZSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB0YXNrRGF0YS5kZXNjcmlwdGlvbixcbiAgICAgICAgICAgIHR5cGU6IHRhc2tUeXBlLFxuICAgICAgICAgICAgY29tbWFuZDogdGFza0RhdGEuY29tbWFuZCwgLy8gV2lsbCBiZSB1bmRlZmluZWQgZm9yIGFnZW50IHRhc2tzXG4gICAgICAgICAgICB3b3JraW5nRGlyZWN0b3J5OiB0YXNrRGF0YS53b3JraW5nRGlyZWN0b3J5LFxuICAgICAgICAgICAgZW52aXJvbm1lbnQ6IHRhc2tEYXRhLmVudmlyb25tZW50IHx8IHt9LFxuICAgICAgICAgICAgZGVwZW5kc09uOiBBcnJheS5pc0FycmF5KHRhc2tEYXRhLmRlcGVuZHNPbilcbiAgICAgICAgICAgICAgICA/IHRhc2tEYXRhLmRlcGVuZHNPblxuICAgICAgICAgICAgICAgIDogW10sXG4gICAgICAgICAgICB0aW1lb3V0OiB0YXNrRGF0YS50aW1lb3V0LFxuICAgICAgICAgICAgcmV0cnk6IHRhc2tEYXRhLnJldHJ5LFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgcGFyc2VRdWFsaXR5R2F0ZXMoZ2F0ZXM6IGFueVtdKTogUXVhbGl0eUdhdGVDb25maWdbXSB7XG4gICAgICAgIGNvbnN0IHBhcnNlZEdhdGVzOiBRdWFsaXR5R2F0ZUNvbmZpZ1tdID0gW107XG4gICAgICAgIGNvbnN0IGdhdGVJZHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGdhdGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBnYXRlRGF0YSA9IGdhdGVzW2ldO1xuXG4gICAgICAgICAgICBpZiAoIWdhdGVEYXRhIHx8IHR5cGVvZiBnYXRlRGF0YSAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgICAgIHRoaXMuZXJyb3JzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBWYWxpZGF0aW9uRXJyb3JUeXBlLlRZUEUsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBRdWFsaXR5IGdhdGUgYXQgaW5kZXggJHtpfSBtdXN0IGJlIGFuIG9iamVjdGAsXG4gICAgICAgICAgICAgICAgICAgIHBhdGg6IGBxdWFsaXR5R2F0ZXNbJHtpfV1gLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogZ2F0ZURhdGEsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGdhdGUgPSB0aGlzLnBhcnNlUXVhbGl0eUdhdGUoZ2F0ZURhdGEsIGkpO1xuXG4gICAgICAgICAgICBpZiAoZ2F0ZSkge1xuICAgICAgICAgICAgICAgIC8vIENoZWNrIGZvciBkdXBsaWNhdGUgSURzXG4gICAgICAgICAgICAgICAgaWYgKGdhdGVJZHMuaGFzKGdhdGUuaWQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXJyb3JzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogVmFsaWRhdGlvbkVycm9yVHlwZS5EVVBMSUNBVEVfSUQsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBgRHVwbGljYXRlIHF1YWxpdHkgZ2F0ZSBJRDogJHtnYXRlLmlkfWAsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiBgcXVhbGl0eUdhdGVzWyR7aX1dLmlkYCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBnYXRlLmlkLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBnYXRlSWRzLmFkZChnYXRlLmlkKTtcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VkR2F0ZXMucHVzaChnYXRlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGFyc2VkR2F0ZXM7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBwYXJzZVF1YWxpdHlHYXRlKFxuICAgICAgICBnYXRlRGF0YTogYW55LFxuICAgICAgICBpbmRleDogbnVtYmVyLFxuICAgICk6IFF1YWxpdHlHYXRlQ29uZmlnIHwgbnVsbCB7XG4gICAgICAgIC8vIFJlcXVpcmVkIGZpZWxkc1xuICAgICAgICBpZiAoIWdhdGVEYXRhLmlkIHx8IHR5cGVvZiBnYXRlRGF0YS5pZCAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgdGhpcy5lcnJvcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgdHlwZTogVmFsaWRhdGlvbkVycm9yVHlwZS5SRVFVSVJFRCxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBgUXVhbGl0eSBnYXRlIGF0IGluZGV4ICR7aW5kZXh9IHJlcXVpcmVzIGEgdmFsaWQgaWRgLFxuICAgICAgICAgICAgICAgIHBhdGg6IGBxdWFsaXR5R2F0ZXNbJHtpbmRleH1dLmlkYCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWdhdGVEYXRhLm5hbWUgfHwgdHlwZW9mIGdhdGVEYXRhLm5hbWUgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHRoaXMuZXJyb3JzLnB1c2goe1xuICAgICAgICAgICAgICAgIHR5cGU6IFZhbGlkYXRpb25FcnJvclR5cGUuUkVRVUlSRUQsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogYFF1YWxpdHkgZ2F0ZSBcIiR7Z2F0ZURhdGEuaWR9XCIgcmVxdWlyZXMgYSB2YWxpZCBuYW1lYCxcbiAgICAgICAgICAgICAgICBwYXRoOiBgcXVhbGl0eUdhdGVzWyR7aW5kZXh9XS5uYW1lYCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBQYXJzZSBnYXRlIHR5cGVcbiAgICAgICAgbGV0IGdhdGVUeXBlOiBRdWFsaXR5R2F0ZVR5cGUgPSBRdWFsaXR5R2F0ZVR5cGUuTElOVDtcbiAgICAgICAgaWYgKGdhdGVEYXRhLnR5cGUpIHtcbiAgICAgICAgICAgIGlmICghT2JqZWN0LnZhbHVlcyhRdWFsaXR5R2F0ZVR5cGUpLmluY2x1ZGVzKGdhdGVEYXRhLnR5cGUpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lcnJvcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFZhbGlkYXRpb25FcnJvclR5cGUuVFlQRSxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogYEludmFsaWQgcXVhbGl0eSBnYXRlIHR5cGUgXCIke2dhdGVEYXRhLnR5cGV9XCIgZm9yIGdhdGUgXCIke2dhdGVEYXRhLmlkfVwiYCxcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogYHF1YWxpdHlHYXRlc1ske2luZGV4fV0udHlwZWAsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBnYXRlRGF0YS50eXBlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZ2F0ZVR5cGUgPSBnYXRlRGF0YS50eXBlIGFzIFF1YWxpdHlHYXRlVHlwZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpZDogZ2F0ZURhdGEuaWQsXG4gICAgICAgICAgICBuYW1lOiBnYXRlRGF0YS5uYW1lLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IGdhdGVEYXRhLmRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgdHlwZTogZ2F0ZVR5cGUsXG4gICAgICAgICAgICByZXF1aXJlZDogZ2F0ZURhdGEucmVxdWlyZWQgIT09IGZhbHNlLCAvLyBEZWZhdWx0IHRvIHRydWVcbiAgICAgICAgICAgIGNvbmZpZzogZ2F0ZURhdGEuY29uZmlnIHx8IHt9LFxuICAgICAgICAgICAgdGFza0lkOiBnYXRlRGF0YS50YXNrSWQsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2YWxpZGF0ZVRhc2tEZXBlbmRlbmNpZXModGFza3M6IEV4ZWN1dGFibGVUYXNrW10pOiB2b2lkIHtcbiAgICAgICAgY29uc3QgdGFza0lkcyA9IG5ldyBTZXQodGFza3MubWFwKCh0KSA9PiB0LmlkKSk7XG5cbiAgICAgICAgZm9yIChjb25zdCB0YXNrIG9mIHRhc2tzKSB7XG4gICAgICAgICAgICBpZiAodGFzay5kZXBlbmRzT24pIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGRlcElkIG9mIHRhc2suZGVwZW5kc09uKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghdGFza0lkcy5oYXMoZGVwSWQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVycm9ycy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBWYWxpZGF0aW9uRXJyb3JUeXBlLlVOS05PV05fREVQRU5ERU5DWSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBgVGFzayBcIiR7dGFzay5pZH1cIiBkZXBlbmRzIG9uIHVua25vd24gdGFzayBcIiR7ZGVwSWR9XCJgLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IGB0YXNrcy4ke3Rhc2suaWR9LmRlcGVuZHNPbmAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGRlcElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDaGVjayBmb3IgY2lyY3VsYXIgZGVwZW5kZW5jaWVzXG4gICAgICAgIHRoaXMuZGV0ZWN0Q2lyY3VsYXJEZXBlbmRlbmNpZXModGFza3MpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZGV0ZWN0Q2lyY3VsYXJEZXBlbmRlbmNpZXModGFza3M6IEV4ZWN1dGFibGVUYXNrW10pOiB2b2lkIHtcbiAgICAgICAgY29uc3QgdmlzaXRlZCA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgICBjb25zdCByZWN1cnNpb25TdGFjayA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgICBjb25zdCB0YXNrTWFwID0gbmV3IE1hcCh0YXNrcy5tYXAoKHQpID0+IFt0LmlkLCB0XSkpO1xuXG4gICAgICAgIGNvbnN0IHZpc2l0ID0gKHRhc2tJZDogc3RyaW5nKTogYm9vbGVhbiA9PiB7XG4gICAgICAgICAgICBpZiAocmVjdXJzaW9uU3RhY2suaGFzKHRhc2tJZCkpIHtcbiAgICAgICAgICAgICAgICAvLyBGb3VuZCBhIGN5Y2xlXG4gICAgICAgICAgICAgICAgY29uc3QgY3ljbGUgPSBBcnJheS5mcm9tKHJlY3Vyc2lvblN0YWNrKVxuICAgICAgICAgICAgICAgICAgICAuY29uY2F0KHRhc2tJZClcbiAgICAgICAgICAgICAgICAgICAgLmpvaW4oXCIgLT4gXCIpO1xuICAgICAgICAgICAgICAgIHRoaXMuZXJyb3JzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBWYWxpZGF0aW9uRXJyb3JUeXBlLkNJUkNVTEFSX0RFUEVOREVOQ1ksXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBDaXJjdWxhciBkZXBlbmRlbmN5IGRldGVjdGVkOiAke2N5Y2xlfWAsXG4gICAgICAgICAgICAgICAgICAgIHBhdGg6IFwidGFza3NcIixcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHZpc2l0ZWQuaGFzKHRhc2tJZCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZpc2l0ZWQuYWRkKHRhc2tJZCk7XG4gICAgICAgICAgICByZWN1cnNpb25TdGFjay5hZGQodGFza0lkKTtcblxuICAgICAgICAgICAgY29uc3QgdGFzayA9IHRhc2tNYXAuZ2V0KHRhc2tJZCk7XG4gICAgICAgICAgICBpZiAodGFzaz8uZGVwZW5kc09uKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBkZXBJZCBvZiB0YXNrLmRlcGVuZHNPbikge1xuICAgICAgICAgICAgICAgICAgICBpZiAodmlzaXQoZGVwSWQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmVjdXJzaW9uU3RhY2suZGVsZXRlKHRhc2tJZCk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgZm9yIChjb25zdCB0YXNrIG9mIHRhc2tzKSB7XG4gICAgICAgICAgICBpZiAoIXZpc2l0ZWQuaGFzKHRhc2suaWQpKSB7XG4gICAgICAgICAgICAgICAgdmlzaXQodGFzay5pZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBhIHRhc2sgdHlwZSBpcyBhbiBhZ2VudCB0YXNrIHR5cGVcbiAgICAgKi9cbiAgICBwcml2YXRlIGlzQWdlbnRUYXNrVHlwZSh0eXBlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC52YWx1ZXMoQWdlbnRUYXNrVHlwZSkuaW5jbHVkZXModHlwZSBhcyBBZ2VudFRhc2tUeXBlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQYXJzZSBhbmQgdmFsaWRhdGUgYW4gYWdlbnQgdGFza1xuICAgICAqL1xuICAgIHByaXZhdGUgcGFyc2VBZ2VudFRhc2sodGFza0RhdGE6IGFueSwgaW5kZXg6IG51bWJlcik6IEFnZW50VGFzayB8IG51bGwge1xuICAgICAgICAvLyBWYWxpZGF0ZSBhZ2VudCB0eXBlXG4gICAgICAgIGlmIChcbiAgICAgICAgICAgICF0YXNrRGF0YS50eXBlIHx8XG4gICAgICAgICAgICAhT2JqZWN0LnZhbHVlcyhBZ2VudFRhc2tUeXBlKS5pbmNsdWRlcyh0YXNrRGF0YS50eXBlKVxuICAgICAgICApIHtcbiAgICAgICAgICAgIHRoaXMuZXJyb3JzLnB1c2goe1xuICAgICAgICAgICAgICAgIHR5cGU6IFZhbGlkYXRpb25FcnJvclR5cGUuVFlQRSxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBgSW52YWxpZCBhZ2VudCB0eXBlIFwiJHt0YXNrRGF0YS50eXBlfVwiIGZvciB0YXNrIFwiJHt0YXNrRGF0YS5pZH1cImAsXG4gICAgICAgICAgICAgICAgcGF0aDogYHRhc2tzWyR7aW5kZXh9XS50eXBlYCxcbiAgICAgICAgICAgICAgICB2YWx1ZTogdGFza0RhdGEudHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBWYWxpZGF0ZSBhZ2VudCBpbnB1dFxuICAgICAgICBpZiAoIXRhc2tEYXRhLmlucHV0IHx8IHR5cGVvZiB0YXNrRGF0YS5pbnB1dCAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgdGhpcy5lcnJvcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgdHlwZTogVmFsaWRhdGlvbkVycm9yVHlwZS5SRVFVSVJFRCxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBgQWdlbnQgdGFzayBcIiR7dGFza0RhdGEuaWR9XCIgcmVxdWlyZXMgdmFsaWQgaW5wdXRgLFxuICAgICAgICAgICAgICAgIHBhdGg6IGB0YXNrc1ske2luZGV4fV0uaW5wdXRgLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFZhbGlkYXRlIGV4ZWN1dGlvbiBzdHJhdGVneVxuICAgICAgICBpZiAoXG4gICAgICAgICAgICAhdGFza0RhdGEuc3RyYXRlZ3kgfHxcbiAgICAgICAgICAgICFPYmplY3QudmFsdWVzKEV4ZWN1dGlvblN0cmF0ZWd5KS5pbmNsdWRlcyh0YXNrRGF0YS5zdHJhdGVneSlcbiAgICAgICAgKSB7XG4gICAgICAgICAgICB0aGlzLmVycm9ycy5wdXNoKHtcbiAgICAgICAgICAgICAgICB0eXBlOiBWYWxpZGF0aW9uRXJyb3JUeXBlLlJFUVVJUkVELFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBBZ2VudCB0YXNrIFwiJHt0YXNrRGF0YS5pZH1cIiByZXF1aXJlcyB2YWxpZCBleGVjdXRpb24gc3RyYXRlZ3lgLFxuICAgICAgICAgICAgICAgIHBhdGg6IGB0YXNrc1ske2luZGV4fV0uc3RyYXRlZ3lgLFxuICAgICAgICAgICAgICAgIHZhbHVlOiB0YXNrRGF0YS5zdHJhdGVneSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBWYWxpZGF0ZSBhZ2VudCBpbnB1dCBzdHJ1Y3R1cmVcbiAgICAgICAgY29uc3QgYWdlbnRJbnB1dCA9IHRhc2tEYXRhLmlucHV0O1xuICAgICAgICBpZiAoXG4gICAgICAgICAgICAhYWdlbnRJbnB1dC50eXBlIHx8XG4gICAgICAgICAgICAhT2JqZWN0LnZhbHVlcyhBZ2VudFRhc2tUeXBlKS5pbmNsdWRlcyhhZ2VudElucHV0LnR5cGUpXG4gICAgICAgICkge1xuICAgICAgICAgICAgdGhpcy5lcnJvcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgdHlwZTogVmFsaWRhdGlvbkVycm9yVHlwZS5SRVFVSVJFRCxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBgQWdlbnQgdGFzayBcIiR7dGFza0RhdGEuaWR9XCIgaW5wdXQgcmVxdWlyZXMgdmFsaWQgdHlwZWAsXG4gICAgICAgICAgICAgICAgcGF0aDogYHRhc2tzWyR7aW5kZXh9XS5pbnB1dC50eXBlYCxcbiAgICAgICAgICAgICAgICB2YWx1ZTogYWdlbnRJbnB1dC50eXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghYWdlbnRJbnB1dC5jb250ZXh0IHx8IHR5cGVvZiBhZ2VudElucHV0LmNvbnRleHQgIT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIHRoaXMuZXJyb3JzLnB1c2goe1xuICAgICAgICAgICAgICAgIHR5cGU6IFZhbGlkYXRpb25FcnJvclR5cGUuUkVRVUlSRUQsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogYEFnZW50IHRhc2sgXCIke3Rhc2tEYXRhLmlkfVwiIGlucHV0IHJlcXVpcmVzIHZhbGlkIGNvbnRleHRgLFxuICAgICAgICAgICAgICAgIHBhdGg6IGB0YXNrc1ske2luZGV4fV0uaW5wdXQuY29udGV4dGAsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVmFsaWRhdGUgdGltZW91dCBmb3IgYWdlbnQgdGFza3NcbiAgICAgICAgaWYgKHRhc2tEYXRhLnRpbWVvdXQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB0YXNrRGF0YS50aW1lb3V0ICE9PSBcIm51bWJlclwiIHx8IHRhc2tEYXRhLnRpbWVvdXQgPD0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZXJyb3JzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBWYWxpZGF0aW9uRXJyb3JUeXBlLlJBTkdFLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBgQWdlbnQgdGFzayBcIiR7dGFza0RhdGEuaWR9XCIgdGltZW91dCBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyYCxcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogYHRhc2tzWyR7aW5kZXh9XS50aW1lb3V0YCxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHRhc2tEYXRhLnRpbWVvdXQsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBTZXQgZGVmYXVsdCB0aW1lb3V0IGZvciBhZ2VudCB0YXNrc1xuICAgICAgICAgICAgdGFza0RhdGEudGltZW91dCA9IDMwMDAwOyAvLyAzMCBzZWNvbmRzIGRlZmF1bHRcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFZhbGlkYXRlIHJldHJ5IGNvbmZpZ3VyYXRpb24gZm9yIGFnZW50IHRhc2tzXG4gICAgICAgIGlmICh0YXNrRGF0YS5yZXRyeSkge1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICF0YXNrRGF0YS5yZXRyeS5tYXhBdHRlbXB0cyB8fFxuICAgICAgICAgICAgICAgIHR5cGVvZiB0YXNrRGF0YS5yZXRyeS5tYXhBdHRlbXB0cyAhPT0gXCJudW1iZXJcIiB8fFxuICAgICAgICAgICAgICAgIHRhc2tEYXRhLnJldHJ5Lm1heEF0dGVtcHRzIDwgMVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lcnJvcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFZhbGlkYXRpb25FcnJvclR5cGUuUkFOR0UsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBBZ2VudCB0YXNrIFwiJHt0YXNrRGF0YS5pZH1cIiByZXRyeS5tYXhBdHRlbXB0cyBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyYCxcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogYHRhc2tzWyR7aW5kZXh9XS5yZXRyeS5tYXhBdHRlbXB0c2AsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiB0YXNrRGF0YS5yZXRyeT8ubWF4QXR0ZW1wdHMsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAhdGFza0RhdGEucmV0cnkuZGVsYXkgfHxcbiAgICAgICAgICAgICAgICB0eXBlb2YgdGFza0RhdGEucmV0cnkuZGVsYXkgIT09IFwibnVtYmVyXCIgfHxcbiAgICAgICAgICAgICAgICB0YXNrRGF0YS5yZXRyeS5kZWxheSA8IDBcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHRoaXMuZXJyb3JzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBWYWxpZGF0aW9uRXJyb3JUeXBlLlJBTkdFLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBgQWdlbnQgdGFzayBcIiR7dGFza0RhdGEuaWR9XCIgcmV0cnkuZGVsYXkgbXVzdCBiZSBhIG5vbi1uZWdhdGl2ZSBudW1iZXJgLFxuICAgICAgICAgICAgICAgICAgICBwYXRoOiBgdGFza3NbJHtpbmRleH1dLnJldHJ5LmRlbGF5YCxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHRhc2tEYXRhLnJldHJ5Py5kZWxheSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpZDogdGFza0RhdGEuaWQsXG4gICAgICAgICAgICB0eXBlOiB0YXNrRGF0YS50eXBlIGFzIEFnZW50VGFza1R5cGUsXG4gICAgICAgICAgICBuYW1lOiB0YXNrRGF0YS5uYW1lLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IHRhc2tEYXRhLmRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgaW5wdXQ6IHtcbiAgICAgICAgICAgICAgICB0eXBlOiBhZ2VudElucHV0LnR5cGUgYXMgQWdlbnRUYXNrVHlwZSxcbiAgICAgICAgICAgICAgICBjb250ZXh0OiBhZ2VudElucHV0LmNvbnRleHQgfHwge30sXG4gICAgICAgICAgICAgICAgcGFyYW1ldGVyczogYWdlbnRJbnB1dC5wYXJhbWV0ZXJzIHx8IHt9LFxuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IGFnZW50SW5wdXQudGltZW91dCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdHJhdGVneTogdGFza0RhdGEuc3RyYXRlZ3kgYXMgRXhlY3V0aW9uU3RyYXRlZ3ksXG4gICAgICAgICAgICBkZXBlbmRzT246IEFycmF5LmlzQXJyYXkodGFza0RhdGEuZGVwZW5kc09uKVxuICAgICAgICAgICAgICAgID8gdGFza0RhdGEuZGVwZW5kc09uXG4gICAgICAgICAgICAgICAgOiBbXSxcbiAgICAgICAgICAgIHRpbWVvdXQ6IHRhc2tEYXRhLnRpbWVvdXQsXG4gICAgICAgICAgICByZXRyeTogdGFza0RhdGEucmV0cnksXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVmFsaWRhdGUgYWdlbnQgdGFzayBkZXBlbmRlbmNpZXNcbiAgICAgKi9cbiAgICBwcml2YXRlIHZhbGlkYXRlQWdlbnRUYXNrRGVwZW5kZW5jaWVzKHRhc2tzOiAoVGFzayB8IEFnZW50VGFzaylbXSk6IHZvaWQge1xuICAgICAgICBjb25zdCB0YXNrSWRzID0gbmV3IFNldCh0YXNrcy5tYXAoKHQpID0+IHQuaWQpKTtcbiAgICAgICAgY29uc3QgYWdlbnRUYXNrSWRzID0gbmV3IFNldChcbiAgICAgICAgICAgIHRhc2tzLmZpbHRlcigodCkgPT4gdGhpcy5pc0FnZW50VGFzayh0KSkubWFwKCh0KSA9PiB0LmlkKSxcbiAgICAgICAgKTtcblxuICAgICAgICBmb3IgKGNvbnN0IHRhc2sgb2YgdGFza3MpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmlzQWdlbnRUYXNrKHRhc2spICYmIHRhc2suZGVwZW5kc09uKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBkZXBJZCBvZiB0YXNrLmRlcGVuZHNPbikge1xuICAgICAgICAgICAgICAgICAgICAvLyBDaGVjayBpZiBkZXBlbmRlbmN5IGV4aXN0c1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXRhc2tJZHMuaGFzKGRlcElkKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lcnJvcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogVmFsaWRhdGlvbkVycm9yVHlwZS5VTktOT1dOX0RFUEVOREVOQ1ksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogYEFnZW50IHRhc2sgXCIke3Rhc2suaWR9XCIgZGVwZW5kcyBvbiB1bmtub3duIHRhc2sgXCIke2RlcElkfVwiYCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiBgdGFza3MuJHt0YXNrLmlkfS5kZXBlbmRzT25gLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBkZXBJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIGFnZW50IHRhc2sgZGVwZW5kZW5jaWVzIG9uIHNoZWxsIHRhc2tzICh3YXJuaW5nKVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBkZXBUYXNrID0gdGFza3MuZmluZCgodCkgPT4gdC5pZCA9PT0gZGVwSWQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGVwVGFzayAmJiAhdGhpcy5pc0FnZW50VGFzayhkZXBUYXNrKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy53YXJuaW5ncy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBBZ2VudCB0YXNrIFwiJHt0YXNrLmlkfVwiIGRlcGVuZHMgb24gc2hlbGwgdGFzayBcIiR7ZGVwSWR9XCIuIENvbnNpZGVyIHVzaW5nIGFnZW50IHRhc2tzIGZvciBjb25zaXN0ZW5jeS5gLFxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENoZWNrIGZvciBjaXJjdWxhciBkZXBlbmRlbmNpZXMgaW5jbHVkaW5nIGFnZW50IHRhc2tzXG4gICAgICAgIHRoaXMuZGV0ZWN0Q2lyY3VsYXJEZXBlbmRlbmNpZXModGFza3MpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGEgdGFzayBpcyBhbiBhZ2VudCB0YXNrXG4gICAgICovXG4gICAgcHJpdmF0ZSBpc0FnZW50VGFzayh0YXNrOiBUYXNrIHwgQWdlbnRUYXNrKTogdGFzayBpcyBBZ2VudFRhc2sge1xuICAgICAgICByZXR1cm4gXCJ0eXBlXCIgaW4gdGFzayAmJiBcImlucHV0XCIgaW4gdGFzayAmJiBcInN0cmF0ZWd5XCIgaW4gdGFzaztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgYWxsIGFnZW50IHRhc2tzIGZyb20gYSBwbGFuXG4gICAgICovXG4gICAgcHVibGljIGdldEFnZW50VGFza3MocGxhbjogUGxhbik6IEFnZW50VGFza1tdIHtcbiAgICAgICAgcmV0dXJuIHBsYW4udGFza3MuZmlsdGVyKCh0YXNrKSA9PlxuICAgICAgICAgICAgdGhpcy5pc0FnZW50VGFzayh0YXNrKSxcbiAgICAgICAgKSBhcyBBZ2VudFRhc2tbXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgYWxsIHNoZWxsIHRhc2tzIGZyb20gYSBwbGFuXG4gICAgICovXG4gICAgcHVibGljIGdldFNoZWxsVGFza3MocGxhbjogUGxhbik6IFRhc2tbXSB7XG4gICAgICAgIHJldHVybiBwbGFuLnRhc2tzLmZpbHRlcigodGFzaykgPT4gIXRoaXMuaXNBZ2VudFRhc2sodGFzaykpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFZhbGlkYXRlIGFnZW50IHRhc2sgY29uZmlndXJhdGlvblxuICAgICAqL1xuICAgIHB1YmxpYyB2YWxpZGF0ZUFnZW50VGFza0NvbmZpZ3VyYXRpb24ocGxhbjogUGxhbik6IHtcbiAgICAgICAgaXNWYWxpZDogYm9vbGVhbjtcbiAgICAgICAgZXJyb3JzOiBWYWxpZGF0aW9uRXJyb3JbXTtcbiAgICAgICAgd2FybmluZ3M6IHN0cmluZ1tdO1xuICAgIH0ge1xuICAgICAgICBjb25zdCBhZ2VudFRhc2tzID0gdGhpcy5nZXRBZ2VudFRhc2tzKHBsYW4pO1xuICAgICAgICBjb25zdCBlcnJvcnM6IFZhbGlkYXRpb25FcnJvcltdID0gW107XG4gICAgICAgIGNvbnN0IHdhcm5pbmdzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgICAgIC8vIENoZWNrIGlmIGFnZW50IGNvb3JkaW5hdG9yIHdvdWxkIGJlIG5lZWRlZFxuICAgICAgICBpZiAoYWdlbnRUYXNrcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB3YXJuaW5ncy5wdXNoKFxuICAgICAgICAgICAgICAgIGBQbGFuIGNvbnRhaW5zICR7YWdlbnRUYXNrcy5sZW5ndGh9IGFnZW50IHRhc2socykuIEFnZW50IGNvb3JkaW5hdG9yIG11c3QgYmUgY29uZmlndXJlZC5gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENoZWNrIGZvciBhZ2VudCB0YXNrIHRpbWVvdXRzXG4gICAgICAgIGZvciAoY29uc3QgdGFzayBvZiBhZ2VudFRhc2tzKSB7XG4gICAgICAgICAgICBpZiAoIXRhc2sudGltZW91dCB8fCB0YXNrLnRpbWVvdXQgPCA1MDAwKSB7XG4gICAgICAgICAgICAgICAgd2FybmluZ3MucHVzaChcbiAgICAgICAgICAgICAgICAgICAgYEFnZW50IHRhc2sgXCIke3Rhc2suaWR9XCIgaGFzIHNob3J0IG9yIG1pc3NpbmcgdGltZW91dC4gQ29uc2lkZXIgc2V0dGluZyBhdCBsZWFzdCA1IHNlY29uZHMuYCxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2hlY2sgZm9yIGFnZW50IHRhc2sgcmV0cnkgY29uZmlndXJhdGlvblxuICAgICAgICBmb3IgKGNvbnN0IHRhc2sgb2YgYWdlbnRUYXNrcykge1xuICAgICAgICAgICAgaWYgKCF0YXNrLnJldHJ5KSB7XG4gICAgICAgICAgICAgICAgd2FybmluZ3MucHVzaChcbiAgICAgICAgICAgICAgICAgICAgYEFnZW50IHRhc2sgXCIke3Rhc2suaWR9XCIgaGFzIG5vIHJldHJ5IGNvbmZpZ3VyYXRpb24uIENvbnNpZGVyIGFkZGluZyByZXRyeSBsb2dpYyBmb3IgcmVsaWFiaWxpdHkuYCxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGlzVmFsaWQ6IGVycm9ycy5sZW5ndGggPT09IDAsXG4gICAgICAgICAgICBlcnJvcnMsXG4gICAgICAgICAgICB3YXJuaW5ncyxcbiAgICAgICAgfTtcbiAgICB9XG59XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIGNvbXBvc2VyID0gcmVxdWlyZSgnLi9jb21wb3NlL2NvbXBvc2VyLmpzJyk7XG52YXIgRG9jdW1lbnQgPSByZXF1aXJlKCcuL2RvYy9Eb2N1bWVudC5qcycpO1xudmFyIFNjaGVtYSA9IHJlcXVpcmUoJy4vc2NoZW1hL1NjaGVtYS5qcycpO1xudmFyIGVycm9ycyA9IHJlcXVpcmUoJy4vZXJyb3JzLmpzJyk7XG52YXIgQWxpYXMgPSByZXF1aXJlKCcuL25vZGVzL0FsaWFzLmpzJyk7XG52YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuL25vZGVzL2lkZW50aXR5LmpzJyk7XG52YXIgUGFpciA9IHJlcXVpcmUoJy4vbm9kZXMvUGFpci5qcycpO1xudmFyIFNjYWxhciA9IHJlcXVpcmUoJy4vbm9kZXMvU2NhbGFyLmpzJyk7XG52YXIgWUFNTE1hcCA9IHJlcXVpcmUoJy4vbm9kZXMvWUFNTE1hcC5qcycpO1xudmFyIFlBTUxTZXEgPSByZXF1aXJlKCcuL25vZGVzL1lBTUxTZXEuanMnKTtcbnZhciBjc3QgPSByZXF1aXJlKCcuL3BhcnNlL2NzdC5qcycpO1xudmFyIGxleGVyID0gcmVxdWlyZSgnLi9wYXJzZS9sZXhlci5qcycpO1xudmFyIGxpbmVDb3VudGVyID0gcmVxdWlyZSgnLi9wYXJzZS9saW5lLWNvdW50ZXIuanMnKTtcbnZhciBwYXJzZXIgPSByZXF1aXJlKCcuL3BhcnNlL3BhcnNlci5qcycpO1xudmFyIHB1YmxpY0FwaSA9IHJlcXVpcmUoJy4vcHVibGljLWFwaS5qcycpO1xudmFyIHZpc2l0ID0gcmVxdWlyZSgnLi92aXNpdC5qcycpO1xuXG5cblxuZXhwb3J0cy5Db21wb3NlciA9IGNvbXBvc2VyLkNvbXBvc2VyO1xuZXhwb3J0cy5Eb2N1bWVudCA9IERvY3VtZW50LkRvY3VtZW50O1xuZXhwb3J0cy5TY2hlbWEgPSBTY2hlbWEuU2NoZW1hO1xuZXhwb3J0cy5ZQU1MRXJyb3IgPSBlcnJvcnMuWUFNTEVycm9yO1xuZXhwb3J0cy5ZQU1MUGFyc2VFcnJvciA9IGVycm9ycy5ZQU1MUGFyc2VFcnJvcjtcbmV4cG9ydHMuWUFNTFdhcm5pbmcgPSBlcnJvcnMuWUFNTFdhcm5pbmc7XG5leHBvcnRzLkFsaWFzID0gQWxpYXMuQWxpYXM7XG5leHBvcnRzLmlzQWxpYXMgPSBpZGVudGl0eS5pc0FsaWFzO1xuZXhwb3J0cy5pc0NvbGxlY3Rpb24gPSBpZGVudGl0eS5pc0NvbGxlY3Rpb247XG5leHBvcnRzLmlzRG9jdW1lbnQgPSBpZGVudGl0eS5pc0RvY3VtZW50O1xuZXhwb3J0cy5pc01hcCA9IGlkZW50aXR5LmlzTWFwO1xuZXhwb3J0cy5pc05vZGUgPSBpZGVudGl0eS5pc05vZGU7XG5leHBvcnRzLmlzUGFpciA9IGlkZW50aXR5LmlzUGFpcjtcbmV4cG9ydHMuaXNTY2FsYXIgPSBpZGVudGl0eS5pc1NjYWxhcjtcbmV4cG9ydHMuaXNTZXEgPSBpZGVudGl0eS5pc1NlcTtcbmV4cG9ydHMuUGFpciA9IFBhaXIuUGFpcjtcbmV4cG9ydHMuU2NhbGFyID0gU2NhbGFyLlNjYWxhcjtcbmV4cG9ydHMuWUFNTE1hcCA9IFlBTUxNYXAuWUFNTE1hcDtcbmV4cG9ydHMuWUFNTFNlcSA9IFlBTUxTZXEuWUFNTFNlcTtcbmV4cG9ydHMuQ1NUID0gY3N0O1xuZXhwb3J0cy5MZXhlciA9IGxleGVyLkxleGVyO1xuZXhwb3J0cy5MaW5lQ291bnRlciA9IGxpbmVDb3VudGVyLkxpbmVDb3VudGVyO1xuZXhwb3J0cy5QYXJzZXIgPSBwYXJzZXIuUGFyc2VyO1xuZXhwb3J0cy5wYXJzZSA9IHB1YmxpY0FwaS5wYXJzZTtcbmV4cG9ydHMucGFyc2VBbGxEb2N1bWVudHMgPSBwdWJsaWNBcGkucGFyc2VBbGxEb2N1bWVudHM7XG5leHBvcnRzLnBhcnNlRG9jdW1lbnQgPSBwdWJsaWNBcGkucGFyc2VEb2N1bWVudDtcbmV4cG9ydHMuc3RyaW5naWZ5ID0gcHVibGljQXBpLnN0cmluZ2lmeTtcbmV4cG9ydHMudmlzaXQgPSB2aXNpdC52aXNpdDtcbmV4cG9ydHMudmlzaXRBc3luYyA9IHZpc2l0LnZpc2l0QXN5bmM7XG4iLAogICAgIi8qKlxuICogQWdlbnQgb3JjaGVzdHJhdGlvbiB0eXBlcyBhbmQgaW50ZXJmYWNlcyBmb3IgdGhlIEZlcmcgRW5naW5lZXJpbmcgU3lzdGVtLlxuICogRGVmaW5lcyB0aGUgY29yZSBhYnN0cmFjdGlvbnMgZm9yIGFnZW50IGNvb3JkaW5hdGlvbiBhbmQgZXhlY3V0aW9uLlxuICovXG5cbmltcG9ydCB0eXBlIHsgRGVjaXNpb24sIFRhc2sgfSBmcm9tIFwiLi4vY29udGV4dC90eXBlc1wiO1xuXG4vKipcbiAqIFJlcHJlc2VudHMgZGlmZmVyZW50IHR5cGVzIG9mIGFnZW50cyBhdmFpbGFibGUgaW4gdGhlIHN5c3RlbVxuICovXG5leHBvcnQgZW51bSBBZ2VudFR5cGUge1xuICAgIC8vIEFyY2hpdGVjdHVyZSAmIFBsYW5uaW5nXG4gICAgQVJDSElURUNUX0FEVklTT1IgPSBcImFyY2hpdGVjdC1hZHZpc29yXCIsXG4gICAgQkFDS0VORF9BUkNISVRFQ1QgPSBcImJhY2tlbmQtYXJjaGl0ZWN0XCIsXG4gICAgSU5GUkFTVFJVQ1RVUkVfQlVJTERFUiA9IFwiaW5mcmFzdHJ1Y3R1cmUtYnVpbGRlclwiLFxuXG4gICAgLy8gRGV2ZWxvcG1lbnQgJiBDb2RpbmdcbiAgICBGUk9OVEVORF9SRVZJRVdFUiA9IFwiZnJvbnRlbmQtcmV2aWV3ZXJcIixcbiAgICBGVUxMX1NUQUNLX0RFVkVMT1BFUiA9IFwiZnVsbC1zdGFjay1kZXZlbG9wZXJcIixcbiAgICBBUElfQlVJTERFUl9FTkhBTkNFRCA9IFwiYXBpLWJ1aWxkZXItZW5oYW5jZWRcIixcbiAgICBEQVRBQkFTRV9PUFRJTUlaRVIgPSBcImRhdGFiYXNlLW9wdGltaXplclwiLFxuICAgIEpBVkFfUFJPID0gXCJqYXZhLXByb1wiLFxuXG4gICAgLy8gUXVhbGl0eSAmIFRlc3RpbmdcbiAgICBDT0RFX1JFVklFV0VSID0gXCJjb2RlLXJldmlld2VyXCIsXG4gICAgVEVTVF9HRU5FUkFUT1IgPSBcInRlc3QtZ2VuZXJhdG9yXCIsXG4gICAgU0VDVVJJVFlfU0NBTk5FUiA9IFwic2VjdXJpdHktc2Nhbm5lclwiLFxuICAgIFBFUkZPUk1BTkNFX0VOR0lORUVSID0gXCJwZXJmb3JtYW5jZS1lbmdpbmVlclwiLFxuXG4gICAgLy8gRGV2T3BzICYgRGVwbG95bWVudFxuICAgIERFUExPWU1FTlRfRU5HSU5FRVIgPSBcImRlcGxveW1lbnQtZW5naW5lZXJcIixcbiAgICBNT05JVE9SSU5HX0VYUEVSVCA9IFwibW9uaXRvcmluZy1leHBlcnRcIixcbiAgICBDT1NUX09QVElNSVpFUiA9IFwiY29zdC1vcHRpbWl6ZXJcIixcblxuICAgIC8vIEFJICYgTWFjaGluZSBMZWFybmluZ1xuICAgIEFJX0VOR0lORUVSID0gXCJhaS1lbmdpbmVlclwiLFxuICAgIE1MX0VOR0lORUVSID0gXCJtbC1lbmdpbmVlclwiLFxuXG4gICAgLy8gQ29udGVudCAmIFNFT1xuICAgIFNFT19TUEVDSUFMSVNUID0gXCJzZW8tc3BlY2lhbGlzdFwiLFxuICAgIFBST01QVF9PUFRJTUlaRVIgPSBcInByb21wdC1vcHRpbWl6ZXJcIixcblxuICAgIC8vIFBsdWdpbiBEZXZlbG9wbWVudFxuICAgIEFHRU5UX0NSRUFUT1IgPSBcImFnZW50LWNyZWF0b3JcIixcbiAgICBDT01NQU5EX0NSRUFUT1IgPSBcImNvbW1hbmQtY3JlYXRvclwiLFxuICAgIFNLSUxMX0NSRUFUT1IgPSBcInNraWxsLWNyZWF0b3JcIixcbiAgICBUT09MX0NSRUFUT1IgPSBcInRvb2wtY3JlYXRvclwiLFxuICAgIFBMVUdJTl9WQUxJREFUT1IgPSBcInBsdWdpbi12YWxpZGF0b3JcIixcbn1cblxuLyoqXG4gKiBFeGVjdXRpb24gc3RyYXRlZ2llcyBmb3IgYWdlbnQgY29vcmRpbmF0aW9uXG4gKi9cbmV4cG9ydCBlbnVtIEV4ZWN1dGlvblN0cmF0ZWd5IHtcbiAgICBQQVJBTExFTCA9IFwicGFyYWxsZWxcIixcbiAgICBTRVFVRU5USUFMID0gXCJzZXF1ZW50aWFsXCIsXG4gICAgQ09ORElUSU9OQUwgPSBcImNvbmRpdGlvbmFsXCIsXG59XG5cbi8qKlxuICogQ29uZmlkZW5jZSBsZXZlbCBmb3IgYWdlbnQgcmVzdWx0c1xuICovXG5leHBvcnQgZW51bSBDb25maWRlbmNlTGV2ZWwge1xuICAgIExPVyA9IFwibG93XCIsXG4gICAgTUVESVVNID0gXCJtZWRpdW1cIixcbiAgICBISUdIID0gXCJoaWdoXCIsXG4gICAgVkVSWV9ISUdIID0gXCJ2ZXJ5X2hpZ2hcIixcbn1cblxuLyoqXG4gKiBCYXNlIGludGVyZmFjZSBmb3IgYWxsIGFnZW50IGlucHV0c1xuICovXG5leHBvcnQgaW50ZXJmYWNlIEFnZW50SW5wdXQge1xuICAgIHR5cGU6IEFnZW50VHlwZTtcbiAgICBjb250ZXh0OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICBwYXJhbWV0ZXJzPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgdGltZW91dD86IG51bWJlcjtcbn1cblxuLyoqXG4gKiBCYXNlIGludGVyZmFjZSBmb3IgYWxsIGFnZW50IG91dHB1dHNcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBZ2VudE91dHB1dCB7XG4gICAgdHlwZTogQWdlbnRUeXBlO1xuICAgIHN1Y2Nlc3M6IGJvb2xlYW47XG4gICAgcmVzdWx0OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICBjb25maWRlbmNlOiBDb25maWRlbmNlTGV2ZWw7XG4gICAgcmVhc29uaW5nPzogc3RyaW5nO1xuICAgIGV4ZWN1dGlvblRpbWU6IG51bWJlcjtcbiAgICBlcnJvcj86IHN0cmluZztcbn1cblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgc2luZ2xlIGFnZW50IHRhc2sgaW4gYW4gZXhlY3V0aW9uIHBsYW5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBZ2VudFRhc2sge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgdHlwZTogQWdlbnRUeXBlO1xuICAgIG5hbWU6IHN0cmluZztcbiAgICBkZXNjcmlwdGlvbjogc3RyaW5nO1xuICAgIGlucHV0OiBBZ2VudElucHV0O1xuICAgIHN0cmF0ZWd5OiBFeGVjdXRpb25TdHJhdGVneTtcbiAgICAvKiogT3B0aW9uYWwgY29tbWFuZCBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIFRhc2sgaW50ZXJmYWNlICovXG4gICAgY29tbWFuZD86IHN0cmluZztcbiAgICBkZXBlbmRzT24/OiBzdHJpbmdbXTtcbiAgICB0aW1lb3V0PzogbnVtYmVyO1xuICAgIHJldHJ5Pzoge1xuICAgICAgICBtYXhBdHRlbXB0czogbnVtYmVyO1xuICAgICAgICBkZWxheTogbnVtYmVyO1xuICAgICAgICBiYWNrb2ZmTXVsdGlwbGllcjogbnVtYmVyO1xuICAgIH07XG59XG5cbi8qKlxuICogUmVzdWx0IG9mIGV4ZWN1dGluZyBhbiBhZ2VudCB0YXNrXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQWdlbnRUYXNrUmVzdWx0IHtcbiAgICBpZDogc3RyaW5nO1xuICAgIHR5cGU6IEFnZW50VHlwZTtcbiAgICBzdGF0dXM6IEFnZW50VGFza1N0YXR1cztcbiAgICBvdXRwdXQ/OiBBZ2VudE91dHB1dDtcbiAgICBleGVjdXRpb25UaW1lOiBudW1iZXI7XG4gICAgc3RhcnRUaW1lOiBEYXRlO1xuICAgIGVuZFRpbWU6IERhdGU7XG4gICAgZXJyb3I/OiBzdHJpbmc7XG59XG5cbi8qKlxuICogU3RhdHVzIG9mIGFuIGFnZW50IHRhc2tcbiAqL1xuZXhwb3J0IGVudW0gQWdlbnRUYXNrU3RhdHVzIHtcbiAgICBQRU5ESU5HID0gXCJwZW5kaW5nXCIsXG4gICAgUlVOTklORyA9IFwicnVubmluZ1wiLFxuICAgIENPTVBMRVRFRCA9IFwiY29tcGxldGVkXCIsXG4gICAgRkFJTEVEID0gXCJmYWlsZWRcIixcbiAgICBUSU1FT1VUID0gXCJ0aW1lb3V0XCIsXG4gICAgU0tJUFBFRCA9IFwic2tpcHBlZFwiLFxufVxuXG4vKipcbiAqIENvbmZpZ3VyYXRpb24gZm9yIGFnZW50IGNvb3JkaW5hdGlvblxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFnZW50Q29vcmRpbmF0b3JDb25maWcge1xuICAgIG1heENvbmN1cnJlbmN5OiBudW1iZXI7XG4gICAgZGVmYXVsdFRpbWVvdXQ6IG51bWJlcjtcbiAgICByZXRyeUF0dGVtcHRzOiBudW1iZXI7XG4gICAgcmV0cnlEZWxheTogbnVtYmVyO1xuICAgIGVuYWJsZUNhY2hpbmc6IGJvb2xlYW47XG4gICAgbG9nTGV2ZWw6IFwiZGVidWdcIiB8IFwiaW5mb1wiIHwgXCJ3YXJuXCIgfCBcImVycm9yXCI7XG59XG5cbi8qKlxuICogUmVzdWx0IGFnZ3JlZ2F0aW9uIHN0cmF0ZWd5XG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQWdncmVnYXRpb25TdHJhdGVneSB7XG4gICAgdHlwZTpcbiAgICAgICAgfCBcIm1lcmdlXCJcbiAgICAgICAgfCBcInZvdGVcIlxuICAgICAgICB8IFwid2VpZ2h0ZWRcIlxuICAgICAgICB8IFwicHJpb3JpdHlcIlxuICAgICAgICB8IFwicGFyYWxsZWxcIlxuICAgICAgICB8IFwic2VxdWVudGlhbFwiO1xuICAgIHdlaWdodHM/OiBQYXJ0aWFsPFJlY29yZDxBZ2VudFR5cGUsIG51bWJlcj4+O1xuICAgIHByaW9yaXR5PzogQWdlbnRUeXBlW107XG4gICAgY29uZmxpY3RSZXNvbHV0aW9uPzogXCJoaWdoZXN0X2NvbmZpZGVuY2VcIiB8IFwibW9zdF9yZWNlbnRcIiB8IFwibWFudWFsXCI7XG59XG5cbi8qKlxuICogUGxhbiBnZW5lcmF0aW9uIHNwZWNpZmljIHR5cGVzXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUGxhbkdlbmVyYXRpb25JbnB1dCB7XG4gICAgZGVzY3JpcHRpb246IHN0cmluZztcbiAgICBzY29wZT86IHN0cmluZztcbiAgICByZXF1aXJlbWVudHM/OiBzdHJpbmdbXTtcbiAgICBjb25zdHJhaW50cz86IHN0cmluZ1tdO1xuICAgIGNvbnRleHQ/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQbGFuR2VuZXJhdGlvbk91dHB1dCB7XG4gICAgcGxhbjoge1xuICAgICAgICBuYW1lOiBzdHJpbmc7XG4gICAgICAgIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gICAgICAgIHRhc2tzOiBBZ2VudFRhc2tbXTtcbiAgICAgICAgZGVwZW5kZW5jaWVzOiBzdHJpbmdbXVtdO1xuICAgIH07XG4gICAgY29uZmlkZW5jZTogQ29uZmlkZW5jZUxldmVsO1xuICAgIHJlYXNvbmluZzogc3RyaW5nO1xuICAgIHN1Z2dlc3Rpb25zOiBzdHJpbmdbXTtcbn1cblxuLyoqXG4gKiBDb2RlIHJldmlldyBzcGVjaWZpYyB0eXBlc1xuICovXG5leHBvcnQgaW50ZXJmYWNlIENvZGVSZXZpZXdJbnB1dCB7XG4gICAgZmlsZXM6IHN0cmluZ1tdO1xuICAgIHJldmlld1R5cGU6IFwiZnVsbFwiIHwgXCJpbmNyZW1lbnRhbFwiIHwgXCJzZWN1cml0eVwiIHwgXCJwZXJmb3JtYW5jZVwiO1xuICAgIHNldmVyaXR5OiBcImxvd1wiIHwgXCJtZWRpdW1cIiB8IFwiaGlnaFwiIHwgXCJjcml0aWNhbFwiO1xuICAgIGNvbnRleHQ/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb2RlUmV2aWV3RmluZGluZyB7XG4gICAgZmlsZTogc3RyaW5nO1xuICAgIGxpbmU6IG51bWJlcjtcbiAgICBzZXZlcml0eTogXCJsb3dcIiB8IFwibWVkaXVtXCIgfCBcImhpZ2hcIiB8IFwiY3JpdGljYWxcIjtcbiAgICBjYXRlZ29yeTogc3RyaW5nO1xuICAgIG1lc3NhZ2U6IHN0cmluZztcbiAgICBzdWdnZXN0aW9uPzogc3RyaW5nO1xuICAgIGNvbmZpZGVuY2U6IENvbmZpZGVuY2VMZXZlbDtcbiAgICBhZ2VudD86IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb2RlUmV2aWV3T3V0cHV0IHtcbiAgICBmaW5kaW5nczogQ29kZVJldmlld0ZpbmRpbmdbXTtcbiAgICBzdW1tYXJ5OiB7XG4gICAgICAgIHRvdGFsOiBudW1iZXI7XG4gICAgICAgIGJ5U2V2ZXJpdHk6IFJlY29yZDxzdHJpbmcsIG51bWJlcj47XG4gICAgICAgIGJ5Q2F0ZWdvcnk6IFJlY29yZDxzdHJpbmcsIG51bWJlcj47XG4gICAgfTtcbiAgICByZWNvbW1lbmRhdGlvbnM6IHN0cmluZ1tdO1xuICAgIG92ZXJhbGxTY29yZTogbnVtYmVyOyAvLyAwLTEwMFxufVxuXG4vKipcbiAqIEFnZW50IGV4ZWN1dGlvbiBjb250ZXh0XG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQWdlbnRFeGVjdXRpb25Db250ZXh0IHtcbiAgICBwbGFuSWQ6IHN0cmluZztcbiAgICB0YXNrSWQ6IHN0cmluZztcbiAgICB3b3JraW5nRGlyZWN0b3J5OiBzdHJpbmc7XG4gICAgZW52aXJvbm1lbnQ6IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG4gICAgbWV0YWRhdGE6IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xufVxuXG4vKipcbiAqIEV2ZW50IHR5cGVzIGZvciBhZ2VudCBjb29yZGluYXRpb25cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBZ2VudEV2ZW50IHtcbiAgICB0eXBlOlxuICAgICAgICB8IFwidGFza19zdGFydGVkXCJcbiAgICAgICAgfCBcInRhc2tfY29tcGxldGVkXCJcbiAgICAgICAgfCBcInRhc2tfZmFpbGVkXCJcbiAgICAgICAgfCBcInRhc2tfdGltZW91dFwiXG4gICAgICAgIHwgXCJhZ2dyZWdhdGlvbl9zdGFydGVkXCJcbiAgICAgICAgfCBcImFnZ3JlZ2F0aW9uX2NvbXBsZXRlZFwiO1xuICAgIHRhc2tJZDogc3RyaW5nO1xuICAgIGFnZW50VHlwZTogQWdlbnRUeXBlO1xuICAgIHRpbWVzdGFtcDogRGF0ZTtcbiAgICBkYXRhPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG59XG5cbi8qKlxuICogUHJvZ3Jlc3MgdHJhY2tpbmcgZm9yIGFnZW50IG9yY2hlc3RyYXRpb25cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBZ2VudFByb2dyZXNzIHtcbiAgICB0b3RhbFRhc2tzOiBudW1iZXI7XG4gICAgY29tcGxldGVkVGFza3M6IG51bWJlcjtcbiAgICBmYWlsZWRUYXNrczogbnVtYmVyO1xuICAgIHJ1bm5pbmdUYXNrczogbnVtYmVyO1xuICAgIGN1cnJlbnRUYXNrPzogc3RyaW5nO1xuICAgIGVzdGltYXRlZFRpbWVSZW1haW5pbmc/OiBudW1iZXI7XG4gICAgcGVyY2VudGFnZUNvbXBsZXRlOiBudW1iZXI7XG59XG5cbi8qKlxuICogRXJyb3IgaGFuZGxpbmcgdHlwZXNcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBZ2VudEVycm9yIHtcbiAgICB0YXNrSWQ6IHN0cmluZztcbiAgICBhZ2VudFR5cGU6IEFnZW50VHlwZTtcbiAgICBlcnJvcjogc3RyaW5nO1xuICAgIHJlY292ZXJhYmxlOiBib29sZWFuO1xuICAgIHN1Z2dlc3RlZEFjdGlvbj86IHN0cmluZztcbiAgICB0aW1lc3RhbXA6IERhdGU7XG59XG5cbi8qKlxuICogUGVyZm9ybWFuY2UgbWV0cmljcyBmb3IgYWdlbnQgZXhlY3V0aW9uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQWdlbnRNZXRyaWNzIHtcbiAgICBhZ2VudFR5cGU6IEFnZW50VHlwZTtcbiAgICBleGVjdXRpb25Db3VudDogbnVtYmVyO1xuICAgIGF2ZXJhZ2VFeGVjdXRpb25UaW1lOiBudW1iZXI7XG4gICAgc3VjY2Vzc1JhdGU6IG51bWJlcjtcbiAgICBhdmVyYWdlQ29uZmlkZW5jZTogbnVtYmVyO1xuICAgIGxhc3RFeGVjdXRpb25UaW1lOiBEYXRlO1xufVxuXG4vKipcbiAqIEFnZW50IGRlZmluaXRpb24gbG9hZGVkIGZyb20gLmNsYXVkZS1wbHVnaW4vYWdlbnRzL1xuICovXG5leHBvcnQgaW50ZXJmYWNlIEFnZW50RGVmaW5pdGlvbiB7XG4gICAgdHlwZTogQWdlbnRUeXBlO1xuICAgIG5hbWU6IHN0cmluZztcbiAgICBkZXNjcmlwdGlvbjogc3RyaW5nO1xuICAgIG1vZGU6IFwic3ViYWdlbnRcIiB8IFwidG9vbFwiO1xuICAgIHRlbXBlcmF0dXJlOiBudW1iZXI7XG4gICAgY2FwYWJpbGl0aWVzOiBzdHJpbmdbXTtcbiAgICBoYW5kb2ZmczogQWdlbnRUeXBlW107XG4gICAgdGFnczogc3RyaW5nW107XG4gICAgY2F0ZWdvcnk6IHN0cmluZztcbiAgICB0b29sczoge1xuICAgICAgICByZWFkOiBib29sZWFuO1xuICAgICAgICBncmVwOiBib29sZWFuO1xuICAgICAgICBnbG9iOiBib29sZWFuO1xuICAgICAgICBsaXN0OiBib29sZWFuO1xuICAgICAgICBiYXNoOiBib29sZWFuO1xuICAgICAgICBlZGl0OiBib29sZWFuO1xuICAgICAgICB3cml0ZTogYm9vbGVhbjtcbiAgICAgICAgcGF0Y2g6IGJvb2xlYW47XG4gICAgfTtcbiAgICBwcm9tcHRQYXRoOiBzdHJpbmc7XG4gICAgcHJvbXB0OiBzdHJpbmc7XG59XG5cbi8qKlxuICogQWdlbnQgZXhlY3V0aW9uIHJlY29yZCBmb3IgcGVyc2lzdGVuY2VcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBZ2VudEV4ZWN1dGlvbiB7XG4gICAgdGFza0lkOiBzdHJpbmc7XG4gICAgYWdlbnRUeXBlOiBBZ2VudFR5cGU7XG4gICAgaW5wdXQ/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICBvdXRwdXQ/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICBzdWNjZXNzOiBib29sZWFuO1xuICAgIGNvbmZpZGVuY2U/OiBDb25maWRlbmNlTGV2ZWw7XG4gICAgZXhlY3V0aW9uVGltZTogbnVtYmVyO1xuICAgIHRpbWVzdGFtcDogRGF0ZTtcbiAgICBlcnJvcj86IHN0cmluZztcbn1cblxuLyoqXG4gKiBJbXByb3ZlbWVudCByZWNvcmQgZm9yIHNlbGYtaW1wcm92ZW1lbnQgc3lzdGVtXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSW1wcm92ZW1lbnRSZWNvcmQge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgdHlwZTogXCJhZ2VudF9wcm9tcHRcIiB8IFwiY2FwYWJpbGl0eVwiIHwgXCJoYW5kb2ZmXCIgfCBcIndvcmtmbG93XCI7XG4gICAgdGFyZ2V0OiBBZ2VudFR5cGUgfCBzdHJpbmc7XG4gICAgZGVzY3JpcHRpb246IHN0cmluZztcbiAgICBldmlkZW5jZTogc3RyaW5nW107XG4gICAgc3VnZ2VzdGVkQXQ6IERhdGU7XG4gICAgaW1wbGVtZW50ZWRBdD86IERhdGU7XG4gICAgZWZmZWN0aXZlbmVzc1Njb3JlPzogbnVtYmVyO1xufVxuXG4vKipcbiAqIEhhbmRvZmYgcmVjb3JkIGZvciBpbnRlci1hZ2VudCBjb21tdW5pY2F0aW9uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSGFuZG9mZlJlY29yZCB7XG4gICAgaWQ6IHN0cmluZztcbiAgICBmcm9tQWdlbnQ6IEFnZW50VHlwZTtcbiAgICB0b0FnZW50OiBBZ2VudFR5cGU7XG4gICAgcmVhc29uOiBzdHJpbmc7XG4gICAgY29udGV4dD86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgIHN1Y2Nlc3M6IGJvb2xlYW47XG4gICAgdGltZXN0YW1wOiBEYXRlO1xufVxuXG4vKipcbiAqIEV4ZWN1dGlvbiBtb2RlIGZvciBoeWJyaWQgVGFzayB0b29sICsgbG9jYWwgZXhlY3V0aW9uXG4gKi9cbmV4cG9ydCB0eXBlIEV4ZWN1dGlvbk1vZGUgPSBcInRhc2stdG9vbFwiIHwgXCJsb2NhbFwiIHwgXCJoeWJyaWRcIjtcblxuLyoqXG4gKiBSb3V0aW5nIGRlY2lzaW9uIGZvciBjYXBhYmlsaXR5LWJhc2VkIGFnZW50IHNlbGVjdGlvblxuICovXG5leHBvcnQgaW50ZXJmYWNlIFJvdXRpbmdEZWNpc2lvbiB7XG4gICAgcHJpbWFyeUFnZW50OiBBZ2VudFR5cGU7XG4gICAgc3VwcG9ydGluZ0FnZW50czogQWdlbnRUeXBlW107XG4gICAgZXhlY3V0aW9uU3RyYXRlZ3k6IFwicGFyYWxsZWxcIiB8IFwic2VxdWVudGlhbFwiIHwgXCJjb25kaXRpb25hbFwiO1xuICAgIGV4ZWN1dGlvbk1vZGU6IEV4ZWN1dGlvbk1vZGU7XG4gICAgaGFuZG9mZlBsYW46IEhhbmRvZmZQbGFuW107XG59XG5cbi8qKlxuICogSGFuZG9mZiBwbGFuIGZvciBpbnRlci1hZ2VudCBkZWxlZ2F0aW9uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSGFuZG9mZlBsYW4ge1xuICAgIGZyb21BZ2VudDogQWdlbnRUeXBlO1xuICAgIHRvQWdlbnQ6IEFnZW50VHlwZTtcbiAgICBjb25kaXRpb246IHN0cmluZztcbiAgICBjb250ZXh0VHJhbnNmZXI6IHN0cmluZ1tdO1xufVxuXG4vKipcbiAqIFJldmlldyByZXN1bHQgZnJvbSBxdWFsaXR5IGZlZWRiYWNrIGxvb3BcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZXZpZXdSZXN1bHQge1xuICAgIGFwcHJvdmVkOiBib29sZWFuO1xuICAgIGZlZWRiYWNrOiBzdHJpbmc7XG4gICAgc3VnZ2VzdGVkSW1wcm92ZW1lbnRzOiBzdHJpbmdbXTtcbiAgICBjb25maWRlbmNlOiBDb25maWRlbmNlTGV2ZWw7XG59XG5cbi8qKlxuICogTWVtb3J5IGVudHJ5IGZvciBjb250ZXh0IGVudmVsb3BlXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTWVtb3J5RW50cnkge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgdHlwZTogXCJkZWNsYXJhdGl2ZVwiIHwgXCJwcm9jZWR1cmFsXCIgfCBcImVwaXNvZGljXCI7XG4gICAgY29udGVudDogc3RyaW5nO1xuICAgIHByb3ZlbmFuY2U6IHtcbiAgICAgICAgc291cmNlOiBcInVzZXJcIiB8IFwiYWdlbnRcIiB8IFwiaW5mZXJyZWRcIjtcbiAgICAgICAgdGltZXN0YW1wOiBzdHJpbmc7XG4gICAgICAgIGNvbmZpZGVuY2U6IG51bWJlcjtcbiAgICAgICAgY29udGV4dDogc3RyaW5nO1xuICAgICAgICBzZXNzaW9uSWQ/OiBzdHJpbmc7XG4gICAgfTtcbiAgICB0YWdzOiBzdHJpbmdbXTtcbiAgICBsYXN0QWNjZXNzZWQ6IHN0cmluZztcbiAgICBhY2Nlc3NDb3VudDogbnVtYmVyO1xufVxuXG4vKipcbiAqIENvbnRleHQgZW52ZWxvcGUgZm9yIHBhc3Npbmcgc3RhdGUgYmV0d2VlbiBhZ2VudHNcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb250ZXh0RW52ZWxvcGUge1xuICAgIC8vIFNlc3Npb24gc3RhdGVcbiAgICBzZXNzaW9uOiB7XG4gICAgICAgIGlkOiBzdHJpbmc7XG4gICAgICAgIHBhcmVudElEPzogc3RyaW5nOyAvLyBQYXJlbnQgc2Vzc2lvbiBJRCBmb3IgbmVzdGVkIHN1YmFnZW50IGNhbGxzXG4gICAgICAgIGFjdGl2ZUZpbGVzOiBzdHJpbmdbXTtcbiAgICAgICAgcGVuZGluZ1Rhc2tzOiBUYXNrW107IC8vIFRhc2sgb2JqZWN0cyBmcm9tIGNvbnRleHQvdHlwZXNcbiAgICAgICAgZGVjaXNpb25zOiBEZWNpc2lvbltdOyAvLyBEZWNpc2lvbiBvYmplY3RzIGZyb20gY29udGV4dC90eXBlc1xuICAgIH07XG5cbiAgICAvLyBSZWxldmFudCBtZW1vcmllc1xuICAgIG1lbW9yaWVzOiB7XG4gICAgICAgIGRlY2xhcmF0aXZlOiBNZW1vcnlFbnRyeVtdOyAvLyBGYWN0cywgcGF0dGVybnNcbiAgICAgICAgcHJvY2VkdXJhbDogTWVtb3J5RW50cnlbXTsgLy8gV29ya2Zsb3dzLCBwcm9jZWR1cmVzXG4gICAgICAgIGVwaXNvZGljOiBNZW1vcnlFbnRyeVtdOyAvLyBQYXN0IGV2ZW50c1xuICAgIH07XG5cbiAgICAvLyBQcmV2aW91cyBhZ2VudCByZXN1bHRzIChmb3IgaGFuZG9mZnMpXG4gICAgcHJldmlvdXNSZXN1bHRzOiB7XG4gICAgICAgIGFnZW50VHlwZTogQWdlbnRUeXBlIHwgc3RyaW5nO1xuICAgICAgICBvdXRwdXQ6IHVua25vd247XG4gICAgICAgIGNvbmZpZGVuY2U6IENvbmZpZGVuY2VMZXZlbCB8IHN0cmluZztcbiAgICB9W107XG5cbiAgICAvLyBUYXNrLXNwZWNpZmljIGNvbnRleHRcbiAgICB0YXNrQ29udGV4dDogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG5cbiAgICAvLyBNZXRhZGF0YVxuICAgIG1ldGE6IHtcbiAgICAgICAgcmVxdWVzdElkOiBzdHJpbmc7XG4gICAgICAgIHRpbWVzdGFtcDogRGF0ZTtcbiAgICAgICAgZGVwdGg6IG51bWJlcjsgLy8gSG93IG1hbnkgaGFuZG9mZnMgZGVlcFxuICAgICAgICBtZXJnZWRGcm9tPzogbnVtYmVyOyAvLyBOdW1iZXIgb2YgZW52ZWxvcGVzIG1lcmdlZFxuICAgICAgICBtZXJnZVN0cmF0ZWd5Pzogc3RyaW5nOyAvLyBTdHJhdGVneSB1c2VkIGZvciBtZXJnaW5nXG4gICAgfTtcbn1cblxuLyoqXG4gKiBMb2NhbCBvcGVyYXRpb24gZm9yIGZpbGUtYmFzZWQgdGFza3NcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBMb2NhbE9wZXJhdGlvbiB7XG4gICAgb3BlcmF0aW9uOiBcImdsb2JcIiB8IFwiZ3JlcFwiIHwgXCJyZWFkXCIgfCBcInN0YXRcIjtcbiAgICBwYXR0ZXJuPzogc3RyaW5nO1xuICAgIGluY2x1ZGU/OiBzdHJpbmc7XG4gICAgY3dkPzogc3RyaW5nO1xuICAgIG9wdGlvbnM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbn1cblxuLyoqXG4gKiBSZXN1bHQgb2YgbG9jYWwgb3BlcmF0aW9uIGV4ZWN1dGlvblxuICovXG5leHBvcnQgaW50ZXJmYWNlIExvY2FsUmVzdWx0IHtcbiAgICBzdWNjZXNzOiBib29sZWFuO1xuICAgIGRhdGE/OiB1bmtub3duO1xuICAgIGVycm9yPzogc3RyaW5nO1xuICAgIGV4ZWN1dGlvblRpbWU6IG51bWJlcjtcbn1cbiIsCiAgICAiLyoqXG4gKiBUeXBlIGRlZmluaXRpb25zIGZvciB0aGUgRmVyZyBFbmdpbmVlcmluZyBTeXN0ZW0gZXhlY3V0aW9uIGVuZ2luZS5cbiAqIFByb3ZpZGVzIGNvbXByZWhlbnNpdmUgdHlwZSBzYWZldHkgZm9yIHBsYW4gcGFyc2luZywgdGFzayBleGVjdXRpb24sIGFuZCBxdWFsaXR5IGdhdGVzLlxuICovXG5cbmltcG9ydCB0eXBlIHsgQWdlbnRUYXNrIH0gZnJvbSBcIi4uL2FnZW50cy90eXBlc1wiO1xuXG4vKiogVW5pb24gdHlwZSBmb3IgYm90aCByZWd1bGFyIHRhc2tzIGFuZCBhZ2VudCB0YXNrcyAqL1xuZXhwb3J0IHR5cGUgRXhlY3V0YWJsZVRhc2sgPSBUYXNrIHwgQWdlbnRUYXNrO1xuXG5leHBvcnQgaW50ZXJmYWNlIFBsYW4ge1xuICAgIC8qKiBQbGFuIG1ldGFkYXRhIGFuZCBjb25maWd1cmF0aW9uICovXG4gICAgbWV0YWRhdGE6IFBsYW5NZXRhZGF0YTtcbiAgICAvKiogQXJyYXkgb2YgdGFza3MgdG8gYmUgZXhlY3V0ZWQgKi9cbiAgICB0YXNrczogRXhlY3V0YWJsZVRhc2tbXTtcbiAgICAvKiogUXVhbGl0eSBnYXRlIGNvbmZpZ3VyYXRpb25zICovXG4gICAgcXVhbGl0eUdhdGVzPzogUXVhbGl0eUdhdGVDb25maWdbXTtcbiAgICAvKiogVmFsaWRhdGlvbiBlcnJvcnMgaWYgYW55ICovXG4gICAgZXJyb3JzPzogVmFsaWRhdGlvbkVycm9yW107XG4gICAgLyoqIFZhbGlkYXRpb24gd2FybmluZ3MgaWYgYW55ICovXG4gICAgd2FybmluZ3M/OiBzdHJpbmdbXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQbGFuTWV0YWRhdGEge1xuICAgIC8qKiBVbmlxdWUgcGxhbiBpZGVudGlmaWVyICovXG4gICAgaWQ6IHN0cmluZztcbiAgICAvKiogSHVtYW4tcmVhZGFibGUgcGxhbiBuYW1lICovXG4gICAgbmFtZTogc3RyaW5nO1xuICAgIC8qKiBQbGFuIGRlc2NyaXB0aW9uICovXG4gICAgZGVzY3JpcHRpb24/OiBzdHJpbmc7XG4gICAgLyoqIFBsYW4gdmVyc2lvbiAqL1xuICAgIHZlcnNpb246IHN0cmluZztcbiAgICAvKiogQXV0aG9yIGluZm9ybWF0aW9uICovXG4gICAgYXV0aG9yPzogc3RyaW5nO1xuICAgIC8qKiBDcmVhdGlvbiB0aW1lc3RhbXAgKi9cbiAgICBjcmVhdGVkPzogc3RyaW5nO1xuICAgIC8qKiBMYXN0IG1vZGlmaWVkIHRpbWVzdGFtcCAqL1xuICAgIG1vZGlmaWVkPzogc3RyaW5nO1xuICAgIC8qKiBQbGFuIHRhZ3MgKi9cbiAgICB0YWdzPzogc3RyaW5nW107XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGFzayB7XG4gICAgLyoqIFVuaXF1ZSB0YXNrIGlkZW50aWZpZXIgKi9cbiAgICBpZDogc3RyaW5nO1xuICAgIC8qKiBIdW1hbi1yZWFkYWJsZSB0YXNrIG5hbWUgKi9cbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgLyoqIFRhc2sgZGVzY3JpcHRpb24gKi9cbiAgICBkZXNjcmlwdGlvbj86IHN0cmluZztcbiAgICAvKiogVGFzayB0eXBlIGRldGVybWluZXMgZXhlY3V0aW9uIGJlaGF2aW9yICovXG4gICAgdHlwZTogVGFza1R5cGU7XG4gICAgLyoqIENvbW1hbmQgdG8gZXhlY3V0ZSAqL1xuICAgIGNvbW1hbmQ6IHN0cmluZztcbiAgICAvKiogV29ya2luZyBkaXJlY3RvcnkgZm9yIGNvbW1hbmQgZXhlY3V0aW9uICovXG4gICAgd29ya2luZ0RpcmVjdG9yeT86IHN0cmluZztcbiAgICAvKiogRW52aXJvbm1lbnQgdmFyaWFibGVzIGZvciB0aGUgdGFzayAqL1xuICAgIGVudmlyb25tZW50PzogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbiAgICAvKiogVGFzayBkZXBlbmRlbmNpZXMgdGhhdCBtdXN0IGNvbXBsZXRlIGZpcnN0ICovXG4gICAgZGVwZW5kc09uPzogc3RyaW5nW107XG4gICAgLyoqIFRpbWVvdXQgaW4gc2Vjb25kcyAqL1xuICAgIHRpbWVvdXQ/OiBudW1iZXI7XG4gICAgLyoqIFJldHJ5IGNvbmZpZ3VyYXRpb24gKi9cbiAgICByZXRyeT86IFJldHJ5Q29uZmlnO1xuICAgIC8qKiBUYXNrIHN0YXR1cyBkdXJpbmcgZXhlY3V0aW9uICovXG4gICAgc3RhdHVzPzogVGFza1N0YXR1cztcbiAgICAvKiogRXhlY3V0aW9uIHJlc3VsdHMgKi9cbiAgICByZXN1bHQ/OiBUYXNrUmVzdWx0O1xufVxuXG5leHBvcnQgZW51bSBUYXNrVHlwZSB7XG4gICAgLyoqIEV4ZWN1dGUgc2hlbGwgY29tbWFuZCAqL1xuICAgIFNIRUxMID0gXCJzaGVsbFwiLFxuICAgIC8qKiBSdW4gbGludGluZyBjaGVja3MgKi9cbiAgICBMSU5UID0gXCJsaW50XCIsXG4gICAgLyoqIFR5cGUgY2hlY2tpbmcgKi9cbiAgICBUWVBFUyA9IFwidHlwZXNcIixcbiAgICAvKiogUnVuIHRlc3RzICovXG4gICAgVEVTVFMgPSBcInRlc3RzXCIsXG4gICAgLyoqIEJ1aWxkIHByb2plY3QgKi9cbiAgICBCVUlMRCA9IFwiYnVpbGRcIixcbiAgICAvKiogSW50ZWdyYXRpb24gdGVzdHMgKi9cbiAgICBJTlRFR1JBVElPTiA9IFwiaW50ZWdyYXRpb25cIixcbiAgICAvKiogRGVwbG95bWVudCAqL1xuICAgIERFUExPWSA9IFwiZGVwbG95XCIsXG59XG5cbmV4cG9ydCBlbnVtIFRhc2tTdGF0dXMge1xuICAgIC8qKiBUYXNrIG5vdCB5ZXQgc3RhcnRlZCAqL1xuICAgIFBFTkRJTkcgPSBcInBlbmRpbmdcIixcbiAgICAvKiogVGFzayBjdXJyZW50bHkgcnVubmluZyAqL1xuICAgIFJVTk5JTkcgPSBcInJ1bm5pbmdcIixcbiAgICAvKiogVGFzayBjb21wbGV0ZWQgc3VjY2Vzc2Z1bGx5ICovXG4gICAgQ09NUExFVEVEID0gXCJjb21wbGV0ZWRcIixcbiAgICAvKiogVGFzayBmYWlsZWQgKi9cbiAgICBGQUlMRUQgPSBcImZhaWxlZFwiLFxuICAgIC8qKiBUYXNrIHNraXBwZWQgZHVlIHRvIGRlcGVuZGVuY3kgZmFpbHVyZSAqL1xuICAgIFNLSVBQRUQgPSBcInNraXBwZWRcIixcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSZXRyeUNvbmZpZyB7XG4gICAgLyoqIE1heGltdW0gbnVtYmVyIG9mIHJldHJ5IGF0dGVtcHRzICovXG4gICAgbWF4QXR0ZW1wdHM6IG51bWJlcjtcbiAgICAvKiogRGVsYXkgYmV0d2VlbiByZXRyaWVzIGluIHNlY29uZHMgKi9cbiAgICBkZWxheTogbnVtYmVyO1xuICAgIC8qKiBCYWNrb2ZmIG11bHRpcGxpZXIgZm9yIGV4cG9uZW50aWFsIGJhY2tvZmYgKi9cbiAgICBiYWNrb2ZmTXVsdGlwbGllcj86IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBUYXNrUmVzdWx0IHtcbiAgICAvKiogVGFzayBpZGVudGlmaWVyICovXG4gICAgaWQ6IHN0cmluZztcbiAgICAvKiogVGFzayBleGVjdXRpb24gc3RhdHVzICovXG4gICAgc3RhdHVzOiBUYXNrU3RhdHVzO1xuICAgIC8qKiBFeGl0IGNvZGUgZnJvbSBjb21tYW5kIGV4ZWN1dGlvbiAqL1xuICAgIGV4aXRDb2RlOiBudW1iZXI7XG4gICAgLyoqIFN0YW5kYXJkIG91dHB1dCAqL1xuICAgIHN0ZG91dDogc3RyaW5nO1xuICAgIC8qKiBTdGFuZGFyZCBlcnJvciAqL1xuICAgIHN0ZGVycjogc3RyaW5nO1xuICAgIC8qKiBFeGVjdXRpb24gZHVyYXRpb24gaW4gbWlsbGlzZWNvbmRzICovXG4gICAgZHVyYXRpb246IG51bWJlcjtcbiAgICAvKiogU3RhcnQgdGltZXN0YW1wICovXG4gICAgc3RhcnRUaW1lOiBEYXRlO1xuICAgIC8qKiBFbmQgdGltZXN0YW1wICovXG4gICAgZW5kVGltZTogRGF0ZTtcbiAgICAvKiogRXJyb3IgbWVzc2FnZSBpZiBmYWlsZWQgKi9cbiAgICBlcnJvcj86IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBRdWFsaXR5R2F0ZUNvbmZpZyB7XG4gICAgLyoqIFF1YWxpdHkgZ2F0ZSBpZGVudGlmaWVyICovXG4gICAgaWQ6IHN0cmluZztcbiAgICAvKiogR2F0ZSBuYW1lICovXG4gICAgbmFtZTogc3RyaW5nO1xuICAgIC8qKiBHYXRlIGRlc2NyaXB0aW9uICovXG4gICAgZGVzY3JpcHRpb24/OiBzdHJpbmc7XG4gICAgLyoqIEdhdGUgdHlwZSBkZXRlcm1pbmVzIHZhbGlkYXRpb24gYmVoYXZpb3IgKi9cbiAgICB0eXBlOiBRdWFsaXR5R2F0ZVR5cGU7XG4gICAgLyoqIFdoZXRoZXIgdGhpcyBnYXRlIGlzIHJlcXVpcmVkICovXG4gICAgcmVxdWlyZWQ6IGJvb2xlYW47XG4gICAgLyoqIEdhdGUtc3BlY2lmaWMgY29uZmlndXJhdGlvbiAqL1xuICAgIGNvbmZpZz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgIC8qKiBUYXNrIElEIGFzc29jaWF0ZWQgd2l0aCB0aGlzIGdhdGUgKi9cbiAgICB0YXNrSWQ/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBlbnVtIFF1YWxpdHlHYXRlVHlwZSB7XG4gICAgLyoqIENvZGUgbGludGluZyBhbmQgZm9ybWF0dGluZyAqL1xuICAgIExJTlQgPSBcImxpbnRcIixcbiAgICAvKiogVHlwZVNjcmlwdCBjb21waWxhdGlvbiAqL1xuICAgIFRZUEVTID0gXCJ0eXBlc1wiLFxuICAgIC8qKiBVbml0IHRlc3QgZXhlY3V0aW9uICovXG4gICAgVEVTVFMgPSBcInRlc3RzXCIsXG4gICAgLyoqIEJ1aWxkIHByb2Nlc3MgKi9cbiAgICBCVUlMRCA9IFwiYnVpbGRcIixcbiAgICAvKiogSW50ZWdyYXRpb24gdGVzdGluZyAqL1xuICAgIElOVEVHUkFUSU9OID0gXCJpbnRlZ3JhdGlvblwiLFxuICAgIC8qKiBEZXBsb3ltZW50IHZhbGlkYXRpb24gKi9cbiAgICBERVBMT1kgPSBcImRlcGxveVwiLFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFF1YWxpdHlHYXRlUmVzdWx0IHtcbiAgICAvKiogUXVhbGl0eSBnYXRlIGlkZW50aWZpZXIgKi9cbiAgICBnYXRlSWQ6IHN0cmluZztcbiAgICAvKiogR2F0ZSBleGVjdXRpb24gc3RhdHVzICovXG4gICAgc3RhdHVzOiBUYXNrU3RhdHVzO1xuICAgIC8qKiBQYXNzL2ZhaWwgcmVzdWx0ICovXG4gICAgcGFzc2VkOiBib29sZWFuO1xuICAgIC8qKiBFeGVjdXRpb24gZHVyYXRpb24gaW4gbWlsbGlzZWNvbmRzICovXG4gICAgZHVyYXRpb246IG51bWJlcjtcbiAgICAvKiogUmVzdWx0IG1lc3NhZ2UgKi9cbiAgICBtZXNzYWdlOiBzdHJpbmc7XG4gICAgLyoqIERldGFpbGVkIHJlc3VsdHMgKi9cbiAgICBkZXRhaWxzPzogdW5rbm93bjtcbiAgICAvKiogRXhlY3V0aW9uIHRpbWVzdGFtcCAqL1xuICAgIHRpbWVzdGFtcDogRGF0ZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBFeGVjdXRpb25SZXBvcnQge1xuICAgIC8qKiBQbGFuIGlkZW50aWZpZXIgKi9cbiAgICBwbGFuSWQ6IHN0cmluZztcbiAgICAvKiogT3ZlcmFsbCBleGVjdXRpb24gc3RhdHVzICovXG4gICAgc3RhdHVzOiBUYXNrU3RhdHVzO1xuICAgIC8qKiBFeGVjdXRpb24gc3RhcnQgdGltZSAqL1xuICAgIHN0YXJ0VGltZTogRGF0ZTtcbiAgICAvKiogRXhlY3V0aW9uIGVuZCB0aW1lICovXG4gICAgZW5kVGltZTogRGF0ZTtcbiAgICAvKiogVG90YWwgZXhlY3V0aW9uIGR1cmF0aW9uIGluIG1pbGxpc2Vjb25kcyAqL1xuICAgIHRvdGFsRHVyYXRpb246IG51bWJlcjtcbiAgICAvKiogVGFzayBleGVjdXRpb24gcmVzdWx0cyAqL1xuICAgIHRhc2tSZXN1bHRzOiBUYXNrUmVzdWx0W107XG4gICAgLyoqIFF1YWxpdHkgZ2F0ZSByZXN1bHRzICovXG4gICAgcXVhbGl0eUdhdGVSZXN1bHRzOiBRdWFsaXR5R2F0ZVJlc3VsdFtdO1xuICAgIC8qKiBTdW1tYXJ5IHN0YXRpc3RpY3MgKi9cbiAgICBzdW1tYXJ5OiBFeGVjdXRpb25TdW1tYXJ5O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEV4ZWN1dGlvblN1bW1hcnkge1xuICAgIC8qKiBUb3RhbCBudW1iZXIgb2YgdGFza3MgKi9cbiAgICB0b3RhbFRhc2tzOiBudW1iZXI7XG4gICAgLyoqIE51bWJlciBvZiBjb21wbGV0ZWQgdGFza3MgKi9cbiAgICBjb21wbGV0ZWRUYXNrczogbnVtYmVyO1xuICAgIC8qKiBOdW1iZXIgb2YgZmFpbGVkIHRhc2tzICovXG4gICAgZmFpbGVkVGFza3M6IG51bWJlcjtcbiAgICAvKiogTnVtYmVyIG9mIHNraXBwZWQgdGFza3MgKi9cbiAgICBza2lwcGVkVGFza3M6IG51bWJlcjtcbiAgICAvKiogVG90YWwgbnVtYmVyIG9mIHF1YWxpdHkgZ2F0ZXMgKi9cbiAgICB0b3RhbEdhdGVzOiBudW1iZXI7XG4gICAgLyoqIE51bWJlciBvZiBwYXNzZWQgcXVhbGl0eSBnYXRlcyAqL1xuICAgIHBhc3NlZEdhdGVzOiBudW1iZXI7XG4gICAgLyoqIE51bWJlciBvZiBmYWlsZWQgcXVhbGl0eSBnYXRlcyAqL1xuICAgIGZhaWxlZEdhdGVzOiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRXhlY3V0aW9uT3B0aW9ucyB7XG4gICAgLyoqIEVuYWJsZSBkcnkgcnVuIG1vZGUgKG5vIGFjdHVhbCBleGVjdXRpb24pICovXG4gICAgZHJ5UnVuPzogYm9vbGVhbjtcbiAgICAvKiogQ29udGludWUgZXhlY3V0aW9uIG9uIHRhc2sgZmFpbHVyZXMgKi9cbiAgICBjb250aW51ZU9uRXJyb3I/OiBib29sZWFuO1xuICAgIC8qKiBNYXhpbXVtIGNvbmN1cnJlbnQgdGFza3MgKi9cbiAgICBtYXhDb25jdXJyZW5jeT86IG51bWJlcjtcbiAgICAvKiogVmVyYm9zZSBvdXRwdXQgKi9cbiAgICB2ZXJib3NlPzogYm9vbGVhbjtcbiAgICAvKiogQ3VzdG9tIHdvcmtpbmcgZGlyZWN0b3J5ICovXG4gICAgd29ya2luZ0RpcmVjdG9yeT86IHN0cmluZztcbiAgICAvKiogQ3VzdG9tIGVudmlyb25tZW50IHZhcmlhYmxlcyAqL1xuICAgIGVudmlyb25tZW50PzogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBWYWxpZGF0aW9uRXJyb3Ige1xuICAgIC8qKiBFcnJvciB0eXBlICovXG4gICAgdHlwZTogVmFsaWRhdGlvbkVycm9yVHlwZTtcbiAgICAvKiogRXJyb3IgbWVzc2FnZSAqL1xuICAgIG1lc3NhZ2U6IHN0cmluZztcbiAgICAvKiogUGF0aCB0byB0aGUgcHJvYmxlbWF0aWMgZmllbGQgKi9cbiAgICBwYXRoPzogc3RyaW5nO1xuICAgIC8qKiBJbnZhbGlkIHZhbHVlICovXG4gICAgdmFsdWU/OiB1bmtub3duO1xufVxuXG5leHBvcnQgZW51bSBWYWxpZGF0aW9uRXJyb3JUeXBlIHtcbiAgICAvKiogUmVxdWlyZWQgZmllbGQgbWlzc2luZyAqL1xuICAgIFJFUVVJUkVEID0gXCJyZXF1aXJlZFwiLFxuICAgIC8qKiBJbnZhbGlkIHZhbHVlIHR5cGUgKi9cbiAgICBUWVBFID0gXCJ0eXBlXCIsXG4gICAgLyoqIFZhbHVlIG91dHNpZGUgYWxsb3dlZCByYW5nZSAqL1xuICAgIFJBTkdFID0gXCJyYW5nZVwiLFxuICAgIC8qKiBJbnZhbGlkIGZvcm1hdCAqL1xuICAgIEZPUk1BVCA9IFwiZm9ybWF0XCIsXG4gICAgLyoqIENpcmN1bGFyIGRlcGVuZGVuY3kgZGV0ZWN0ZWQgKi9cbiAgICBDSVJDVUxBUl9ERVBFTkRFTkNZID0gXCJjaXJjdWxhcl9kZXBlbmRlbmN5XCIsXG4gICAgLyoqIER1cGxpY2F0ZSBpZGVudGlmaWVyICovXG4gICAgRFVQTElDQVRFX0lEID0gXCJkdXBsaWNhdGVfaWRcIixcbiAgICAvKiogVW5rbm93biBkZXBlbmRlbmN5ICovXG4gICAgVU5LTk9XTl9ERVBFTkRFTkNZID0gXCJ1bmtub3duX2RlcGVuZGVuY3lcIixcbn1cbiIKICBdLAogICJtYXBwaW5n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
