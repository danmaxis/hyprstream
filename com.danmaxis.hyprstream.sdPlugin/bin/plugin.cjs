"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __knownSymbol = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __decoratorStart = (base) => [, , , __create(base?.[__knownSymbol("metadata")] ?? null)];
var __decoratorStrings = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError("Function expected") : fn;
var __decoratorContext = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError("Already initialized") : fns.push(__expectFn(fn || null)) });
var __decoratorMetadata = (array, target) => __defNormalProp(target, __knownSymbol("metadata"), array[3]);
var __runInitializers = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) flags & 1 ? fns[i].call(self) : value = fns[i].call(self, value);
  return value;
};
var __decorateElement = (array, flags, name, decorators, target, extra) => {
  var fn, it, done, ctx, access, k = flags & 7, s = !!(flags & 8), p = !!(flags & 16);
  var j = k > 3 ? array.length + 1 : k ? s ? 1 : 2 : 0, key = __decoratorStrings[k + 5];
  var initializers = k > 3 && (array[j - 1] = []), extraInitializers = array[j] || (array[j] = []);
  var desc = k && (!p && !s && (target = target.prototype), k < 5 && (k > 3 || !p) && __getOwnPropDesc(k < 4 ? target : { get [name]() {
    return __privateGet(this, extra);
  }, set [name](x) {
    return __privateSet(this, extra, x);
  } }, name));
  k ? p && k < 4 && __name(extra, (k > 2 ? "set " : k > 1 ? "get " : "") + name) : __name(target, name);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext(k, name, done = {}, array[3], extraInitializers);
    if (k) {
      ctx.static = s, ctx.private = p, access = ctx.access = { has: p ? (x) => __privateIn(target, x) : (x) => name in x };
      if (k ^ 3) access.get = p ? (x) => (k ^ 1 ? __privateGet : __privateMethod)(x, target, k ^ 4 ? extra : desc.get) : (x) => x[name];
      if (k > 2) access.set = p ? (x, y) => __privateSet(x, target, y, k ^ 4 ? extra : desc.set) : (x, y) => x[name] = y;
    }
    it = (0, decorators[i])(k ? k < 4 ? p ? extra : desc[key] : k > 4 ? void 0 : { get: desc.get, set: desc.set } : target, ctx), done._ = 1;
    if (k ^ 4 || it === void 0) __expectFn(it) && (k > 4 ? initializers.unshift(it) : k ? p ? extra = it : desc[key] = it : target = it);
    else if (typeof it !== "object" || it === null) __typeError("Object expected");
    else __expectFn(fn = it.get) && (desc.get = fn), __expectFn(fn = it.set) && (desc.set = fn), __expectFn(fn = it.init) && initializers.unshift(fn);
  }
  return k || __decoratorMetadata(array, target), desc && __defProp(target, name, desc), p ? k ^ 4 ? extra : desc : target;
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateIn = (member, obj) => Object(obj) !== obj ? __typeError('Cannot use the "in" operator on this value') : member.has(obj);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);

// node_modules/ws/lib/constants.js
var require_constants = __commonJS({
  "node_modules/ws/lib/constants.js"(exports2, module2) {
    "use strict";
    var BINARY_TYPES = ["nodebuffer", "arraybuffer", "fragments"];
    var hasBlob = typeof Blob !== "undefined";
    if (hasBlob) BINARY_TYPES.push("blob");
    module2.exports = {
      BINARY_TYPES,
      CLOSE_TIMEOUT: 3e4,
      EMPTY_BUFFER: Buffer.alloc(0),
      GUID: "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
      hasBlob,
      kForOnEventAttribute: /* @__PURE__ */ Symbol("kIsForOnEventAttribute"),
      kListener: /* @__PURE__ */ Symbol("kListener"),
      kStatusCode: /* @__PURE__ */ Symbol("status-code"),
      kWebSocket: /* @__PURE__ */ Symbol("websocket"),
      NOOP: () => {
      }
    };
  }
});

// node_modules/ws/lib/buffer-util.js
var require_buffer_util = __commonJS({
  "node_modules/ws/lib/buffer-util.js"(exports2, module2) {
    "use strict";
    var { EMPTY_BUFFER } = require_constants();
    var FastBuffer = Buffer[Symbol.species];
    function concat(list, totalLength) {
      if (list.length === 0) return EMPTY_BUFFER;
      if (list.length === 1) return list[0];
      const target = Buffer.allocUnsafe(totalLength);
      let offset = 0;
      for (let i = 0; i < list.length; i++) {
        const buf = list[i];
        target.set(buf, offset);
        offset += buf.length;
      }
      if (offset < totalLength) {
        return new FastBuffer(target.buffer, target.byteOffset, offset);
      }
      return target;
    }
    function _mask(source, mask, output, offset, length) {
      for (let i = 0; i < length; i++) {
        output[offset + i] = source[i] ^ mask[i & 3];
      }
    }
    function _unmask(buffer, mask) {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] ^= mask[i & 3];
      }
    }
    function toArrayBuffer(buf) {
      if (buf.length === buf.buffer.byteLength) {
        return buf.buffer;
      }
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
    }
    function toBuffer(data) {
      toBuffer.readOnly = true;
      if (Buffer.isBuffer(data)) return data;
      let buf;
      if (data instanceof ArrayBuffer) {
        buf = new FastBuffer(data);
      } else if (ArrayBuffer.isView(data)) {
        buf = new FastBuffer(data.buffer, data.byteOffset, data.byteLength);
      } else {
        buf = Buffer.from(data);
        toBuffer.readOnly = false;
      }
      return buf;
    }
    module2.exports = {
      concat,
      mask: _mask,
      toArrayBuffer,
      toBuffer,
      unmask: _unmask
    };
    if (!process.env.WS_NO_BUFFER_UTIL) {
      try {
        const bufferUtil = require("bufferutil");
        module2.exports.mask = function(source, mask, output, offset, length) {
          if (length < 48) _mask(source, mask, output, offset, length);
          else bufferUtil.mask(source, mask, output, offset, length);
        };
        module2.exports.unmask = function(buffer, mask) {
          if (buffer.length < 32) _unmask(buffer, mask);
          else bufferUtil.unmask(buffer, mask);
        };
      } catch (e) {
      }
    }
  }
});

// node_modules/ws/lib/limiter.js
var require_limiter = __commonJS({
  "node_modules/ws/lib/limiter.js"(exports2, module2) {
    "use strict";
    var kDone = /* @__PURE__ */ Symbol("kDone");
    var kRun = /* @__PURE__ */ Symbol("kRun");
    var Limiter = class {
      /**
       * Creates a new `Limiter`.
       *
       * @param {Number} [concurrency=Infinity] The maximum number of jobs allowed
       *     to run concurrently
       */
      constructor(concurrency) {
        this[kDone] = () => {
          this.pending--;
          this[kRun]();
        };
        this.concurrency = concurrency || Infinity;
        this.jobs = [];
        this.pending = 0;
      }
      /**
       * Adds a job to the queue.
       *
       * @param {Function} job The job to run
       * @public
       */
      add(job) {
        this.jobs.push(job);
        this[kRun]();
      }
      /**
       * Removes a job from the queue and runs it if possible.
       *
       * @private
       */
      [kRun]() {
        if (this.pending === this.concurrency) return;
        if (this.jobs.length) {
          const job = this.jobs.shift();
          this.pending++;
          job(this[kDone]);
        }
      }
    };
    module2.exports = Limiter;
  }
});

// node_modules/ws/lib/permessage-deflate.js
var require_permessage_deflate = __commonJS({
  "node_modules/ws/lib/permessage-deflate.js"(exports2, module2) {
    "use strict";
    var zlib = require("zlib");
    var bufferUtil = require_buffer_util();
    var Limiter = require_limiter();
    var { kStatusCode } = require_constants();
    var FastBuffer = Buffer[Symbol.species];
    var TRAILER = Buffer.from([0, 0, 255, 255]);
    var kPerMessageDeflate = /* @__PURE__ */ Symbol("permessage-deflate");
    var kTotalLength = /* @__PURE__ */ Symbol("total-length");
    var kCallback = /* @__PURE__ */ Symbol("callback");
    var kBuffers = /* @__PURE__ */ Symbol("buffers");
    var kError = /* @__PURE__ */ Symbol("error");
    var zlibLimiter;
    var PerMessageDeflate2 = class {
      /**
       * Creates a PerMessageDeflate instance.
       *
       * @param {Object} [options] Configuration options
       * @param {(Boolean|Number)} [options.clientMaxWindowBits] Advertise support
       *     for, or request, a custom client window size
       * @param {Boolean} [options.clientNoContextTakeover=false] Advertise/
       *     acknowledge disabling of client context takeover
       * @param {Number} [options.concurrencyLimit=10] The number of concurrent
       *     calls to zlib
       * @param {Boolean} [options.isServer=false] Create the instance in either
       *     server or client mode
       * @param {Number} [options.maxPayload=0] The maximum allowed message length
       * @param {(Boolean|Number)} [options.serverMaxWindowBits] Request/confirm the
       *     use of a custom server window size
       * @param {Boolean} [options.serverNoContextTakeover=false] Request/accept
       *     disabling of server context takeover
       * @param {Number} [options.threshold=1024] Size (in bytes) below which
       *     messages should not be compressed if context takeover is disabled
       * @param {Object} [options.zlibDeflateOptions] Options to pass to zlib on
       *     deflate
       * @param {Object} [options.zlibInflateOptions] Options to pass to zlib on
       *     inflate
       */
      constructor(options) {
        this._options = options || {};
        this._threshold = this._options.threshold !== void 0 ? this._options.threshold : 1024;
        this._maxPayload = this._options.maxPayload | 0;
        this._isServer = !!this._options.isServer;
        this._deflate = null;
        this._inflate = null;
        this.params = null;
        if (!zlibLimiter) {
          const concurrency = this._options.concurrencyLimit !== void 0 ? this._options.concurrencyLimit : 10;
          zlibLimiter = new Limiter(concurrency);
        }
      }
      /**
       * @type {String}
       */
      static get extensionName() {
        return "permessage-deflate";
      }
      /**
       * Create an extension negotiation offer.
       *
       * @return {Object} Extension parameters
       * @public
       */
      offer() {
        const params = {};
        if (this._options.serverNoContextTakeover) {
          params.server_no_context_takeover = true;
        }
        if (this._options.clientNoContextTakeover) {
          params.client_no_context_takeover = true;
        }
        if (this._options.serverMaxWindowBits) {
          params.server_max_window_bits = this._options.serverMaxWindowBits;
        }
        if (this._options.clientMaxWindowBits) {
          params.client_max_window_bits = this._options.clientMaxWindowBits;
        } else if (this._options.clientMaxWindowBits == null) {
          params.client_max_window_bits = true;
        }
        return params;
      }
      /**
       * Accept an extension negotiation offer/response.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Object} Accepted configuration
       * @public
       */
      accept(configurations) {
        configurations = this.normalizeParams(configurations);
        this.params = this._isServer ? this.acceptAsServer(configurations) : this.acceptAsClient(configurations);
        return this.params;
      }
      /**
       * Releases all resources used by the extension.
       *
       * @public
       */
      cleanup() {
        if (this._inflate) {
          this._inflate.close();
          this._inflate = null;
        }
        if (this._deflate) {
          const callback = this._deflate[kCallback];
          this._deflate.close();
          this._deflate = null;
          if (callback) {
            callback(
              new Error(
                "The deflate stream was closed while data was being processed"
              )
            );
          }
        }
      }
      /**
       *  Accept an extension negotiation offer.
       *
       * @param {Array} offers The extension negotiation offers
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsServer(offers) {
        const opts = this._options;
        const accepted = offers.find((params) => {
          if (opts.serverNoContextTakeover === false && params.server_no_context_takeover || params.server_max_window_bits && (opts.serverMaxWindowBits === false || typeof opts.serverMaxWindowBits === "number" && opts.serverMaxWindowBits > params.server_max_window_bits) || typeof opts.clientMaxWindowBits === "number" && !params.client_max_window_bits) {
            return false;
          }
          return true;
        });
        if (!accepted) {
          throw new Error("None of the extension offers can be accepted");
        }
        if (opts.serverNoContextTakeover) {
          accepted.server_no_context_takeover = true;
        }
        if (opts.clientNoContextTakeover) {
          accepted.client_no_context_takeover = true;
        }
        if (typeof opts.serverMaxWindowBits === "number") {
          accepted.server_max_window_bits = opts.serverMaxWindowBits;
        }
        if (typeof opts.clientMaxWindowBits === "number") {
          accepted.client_max_window_bits = opts.clientMaxWindowBits;
        } else if (accepted.client_max_window_bits === true || opts.clientMaxWindowBits === false) {
          delete accepted.client_max_window_bits;
        }
        return accepted;
      }
      /**
       * Accept the extension negotiation response.
       *
       * @param {Array} response The extension negotiation response
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsClient(response) {
        const params = response[0];
        if (this._options.clientNoContextTakeover === false && params.client_no_context_takeover) {
          throw new Error('Unexpected parameter "client_no_context_takeover"');
        }
        if (!params.client_max_window_bits) {
          if (typeof this._options.clientMaxWindowBits === "number") {
            params.client_max_window_bits = this._options.clientMaxWindowBits;
          }
        } else if (this._options.clientMaxWindowBits === false || typeof this._options.clientMaxWindowBits === "number" && params.client_max_window_bits > this._options.clientMaxWindowBits) {
          throw new Error(
            'Unexpected or invalid parameter "client_max_window_bits"'
          );
        }
        return params;
      }
      /**
       * Normalize parameters.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Array} The offers/response with normalized parameters
       * @private
       */
      normalizeParams(configurations) {
        configurations.forEach((params) => {
          Object.keys(params).forEach((key) => {
            let value = params[key];
            if (value.length > 1) {
              throw new Error(`Parameter "${key}" must have only a single value`);
            }
            value = value[0];
            if (key === "client_max_window_bits") {
              if (value !== true) {
                const num = +value;
                if (!Number.isInteger(num) || num < 8 || num > 15) {
                  throw new TypeError(
                    `Invalid value for parameter "${key}": ${value}`
                  );
                }
                value = num;
              } else if (!this._isServer) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else if (key === "server_max_window_bits") {
              const num = +value;
              if (!Number.isInteger(num) || num < 8 || num > 15) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
              value = num;
            } else if (key === "client_no_context_takeover" || key === "server_no_context_takeover") {
              if (value !== true) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else {
              throw new Error(`Unknown parameter "${key}"`);
            }
            params[key] = value;
          });
        });
        return configurations;
      }
      /**
       * Decompress data. Concurrency limited.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      decompress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._decompress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Compress data. Concurrency limited.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      compress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._compress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Decompress data.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _decompress(data, fin, callback) {
        const endpoint = this._isServer ? "client" : "server";
        if (!this._inflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._inflate = zlib.createInflateRaw({
            ...this._options.zlibInflateOptions,
            windowBits
          });
          this._inflate[kPerMessageDeflate] = this;
          this._inflate[kTotalLength] = 0;
          this._inflate[kBuffers] = [];
          this._inflate.on("error", inflateOnError);
          this._inflate.on("data", inflateOnData);
        }
        this._inflate[kCallback] = callback;
        this._inflate.write(data);
        if (fin) this._inflate.write(TRAILER);
        this._inflate.flush(() => {
          const err = this._inflate[kError];
          if (err) {
            this._inflate.close();
            this._inflate = null;
            callback(err);
            return;
          }
          const data2 = bufferUtil.concat(
            this._inflate[kBuffers],
            this._inflate[kTotalLength]
          );
          if (this._inflate._readableState.endEmitted) {
            this._inflate.close();
            this._inflate = null;
          } else {
            this._inflate[kTotalLength] = 0;
            this._inflate[kBuffers] = [];
            if (fin && this.params[`${endpoint}_no_context_takeover`]) {
              this._inflate.reset();
            }
          }
          callback(null, data2);
        });
      }
      /**
       * Compress data.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _compress(data, fin, callback) {
        const endpoint = this._isServer ? "server" : "client";
        if (!this._deflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._deflate = zlib.createDeflateRaw({
            ...this._options.zlibDeflateOptions,
            windowBits
          });
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          this._deflate.on("data", deflateOnData);
        }
        this._deflate[kCallback] = callback;
        this._deflate.write(data);
        this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
          if (!this._deflate) {
            return;
          }
          let data2 = bufferUtil.concat(
            this._deflate[kBuffers],
            this._deflate[kTotalLength]
          );
          if (fin) {
            data2 = new FastBuffer(data2.buffer, data2.byteOffset, data2.length - 4);
          }
          this._deflate[kCallback] = null;
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          if (fin && this.params[`${endpoint}_no_context_takeover`]) {
            this._deflate.reset();
          }
          callback(null, data2);
        });
      }
    };
    module2.exports = PerMessageDeflate2;
    function deflateOnData(chunk) {
      this[kBuffers].push(chunk);
      this[kTotalLength] += chunk.length;
    }
    function inflateOnData(chunk) {
      this[kTotalLength] += chunk.length;
      if (this[kPerMessageDeflate]._maxPayload < 1 || this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload) {
        this[kBuffers].push(chunk);
        return;
      }
      this[kError] = new RangeError("Max payload size exceeded");
      this[kError].code = "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH";
      this[kError][kStatusCode] = 1009;
      this.removeListener("data", inflateOnData);
      this.reset();
    }
    function inflateOnError(err) {
      this[kPerMessageDeflate]._inflate = null;
      if (this[kError]) {
        this[kCallback](this[kError]);
        return;
      }
      err[kStatusCode] = 1007;
      this[kCallback](err);
    }
  }
});

// node_modules/ws/lib/validation.js
var require_validation = __commonJS({
  "node_modules/ws/lib/validation.js"(exports2, module2) {
    "use strict";
    var { isUtf8 } = require("buffer");
    var { hasBlob } = require_constants();
    var tokenChars = [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 0 - 15
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 16 - 31
      0,
      1,
      0,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      1,
      1,
      0,
      1,
      1,
      0,
      // 32 - 47
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      // 48 - 63
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 64 - 79
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      1,
      1,
      // 80 - 95
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 96 - 111
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      1,
      0,
      1,
      0
      // 112 - 127
    ];
    function isValidStatusCode(code) {
      return code >= 1e3 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006 || code >= 3e3 && code <= 4999;
    }
    function _isValidUTF8(buf) {
      const len = buf.length;
      let i = 0;
      while (i < len) {
        if ((buf[i] & 128) === 0) {
          i++;
        } else if ((buf[i] & 224) === 192) {
          if (i + 1 === len || (buf[i + 1] & 192) !== 128 || (buf[i] & 254) === 192) {
            return false;
          }
          i += 2;
        } else if ((buf[i] & 240) === 224) {
          if (i + 2 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || buf[i] === 224 && (buf[i + 1] & 224) === 128 || // Overlong
          buf[i] === 237 && (buf[i + 1] & 224) === 160) {
            return false;
          }
          i += 3;
        } else if ((buf[i] & 248) === 240) {
          if (i + 3 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || (buf[i + 3] & 192) !== 128 || buf[i] === 240 && (buf[i + 1] & 240) === 128 || // Overlong
          buf[i] === 244 && buf[i + 1] > 143 || buf[i] > 244) {
            return false;
          }
          i += 4;
        } else {
          return false;
        }
      }
      return true;
    }
    function isBlob(value) {
      return hasBlob && typeof value === "object" && typeof value.arrayBuffer === "function" && typeof value.type === "string" && typeof value.stream === "function" && (value[Symbol.toStringTag] === "Blob" || value[Symbol.toStringTag] === "File");
    }
    module2.exports = {
      isBlob,
      isValidStatusCode,
      isValidUTF8: _isValidUTF8,
      tokenChars
    };
    if (isUtf8) {
      module2.exports.isValidUTF8 = function(buf) {
        return buf.length < 24 ? _isValidUTF8(buf) : isUtf8(buf);
      };
    } else if (!process.env.WS_NO_UTF_8_VALIDATE) {
      try {
        const isValidUTF8 = require("utf-8-validate");
        module2.exports.isValidUTF8 = function(buf) {
          return buf.length < 32 ? _isValidUTF8(buf) : isValidUTF8(buf);
        };
      } catch (e) {
      }
    }
  }
});

// node_modules/ws/lib/receiver.js
var require_receiver = __commonJS({
  "node_modules/ws/lib/receiver.js"(exports2, module2) {
    "use strict";
    var { Writable } = require("stream");
    var PerMessageDeflate2 = require_permessage_deflate();
    var {
      BINARY_TYPES,
      EMPTY_BUFFER,
      kStatusCode,
      kWebSocket
    } = require_constants();
    var { concat, toArrayBuffer, unmask } = require_buffer_util();
    var { isValidStatusCode, isValidUTF8 } = require_validation();
    var FastBuffer = Buffer[Symbol.species];
    var GET_INFO = 0;
    var GET_PAYLOAD_LENGTH_16 = 1;
    var GET_PAYLOAD_LENGTH_64 = 2;
    var GET_MASK = 3;
    var GET_DATA = 4;
    var INFLATING = 5;
    var DEFER_EVENT = 6;
    var Receiver2 = class extends Writable {
      /**
       * Creates a Receiver instance.
       *
       * @param {Object} [options] Options object
       * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {String} [options.binaryType=nodebuffer] The type for binary data
       * @param {Object} [options.extensions] An object containing the negotiated
       *     extensions
       * @param {Boolean} [options.isServer=false] Specifies whether to operate in
       *     client or server mode
       * @param {Number} [options.maxPayload=0] The maximum allowed message length
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       */
      constructor(options = {}) {
        super();
        this._allowSynchronousEvents = options.allowSynchronousEvents !== void 0 ? options.allowSynchronousEvents : true;
        this._binaryType = options.binaryType || BINARY_TYPES[0];
        this._extensions = options.extensions || {};
        this._isServer = !!options.isServer;
        this._maxPayload = options.maxPayload | 0;
        this._skipUTF8Validation = !!options.skipUTF8Validation;
        this[kWebSocket] = void 0;
        this._bufferedBytes = 0;
        this._buffers = [];
        this._compressed = false;
        this._payloadLength = 0;
        this._mask = void 0;
        this._fragmented = 0;
        this._masked = false;
        this._fin = false;
        this._opcode = 0;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragments = [];
        this._errored = false;
        this._loop = false;
        this._state = GET_INFO;
      }
      /**
       * Implements `Writable.prototype._write()`.
       *
       * @param {Buffer} chunk The chunk of data to write
       * @param {String} encoding The character encoding of `chunk`
       * @param {Function} cb Callback
       * @private
       */
      _write(chunk, encoding, cb) {
        if (this._opcode === 8 && this._state == GET_INFO) return cb();
        this._bufferedBytes += chunk.length;
        this._buffers.push(chunk);
        this.startLoop(cb);
      }
      /**
       * Consumes `n` bytes from the buffered data.
       *
       * @param {Number} n The number of bytes to consume
       * @return {Buffer} The consumed bytes
       * @private
       */
      consume(n) {
        this._bufferedBytes -= n;
        if (n === this._buffers[0].length) return this._buffers.shift();
        if (n < this._buffers[0].length) {
          const buf = this._buffers[0];
          this._buffers[0] = new FastBuffer(
            buf.buffer,
            buf.byteOffset + n,
            buf.length - n
          );
          return new FastBuffer(buf.buffer, buf.byteOffset, n);
        }
        const dst = Buffer.allocUnsafe(n);
        do {
          const buf = this._buffers[0];
          const offset = dst.length - n;
          if (n >= buf.length) {
            dst.set(this._buffers.shift(), offset);
          } else {
            dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
            this._buffers[0] = new FastBuffer(
              buf.buffer,
              buf.byteOffset + n,
              buf.length - n
            );
          }
          n -= buf.length;
        } while (n > 0);
        return dst;
      }
      /**
       * Starts the parsing loop.
       *
       * @param {Function} cb Callback
       * @private
       */
      startLoop(cb) {
        this._loop = true;
        do {
          switch (this._state) {
            case GET_INFO:
              this.getInfo(cb);
              break;
            case GET_PAYLOAD_LENGTH_16:
              this.getPayloadLength16(cb);
              break;
            case GET_PAYLOAD_LENGTH_64:
              this.getPayloadLength64(cb);
              break;
            case GET_MASK:
              this.getMask();
              break;
            case GET_DATA:
              this.getData(cb);
              break;
            case INFLATING:
            case DEFER_EVENT:
              this._loop = false;
              return;
          }
        } while (this._loop);
        if (!this._errored) cb();
      }
      /**
       * Reads the first two bytes of a frame.
       *
       * @param {Function} cb Callback
       * @private
       */
      getInfo(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        const buf = this.consume(2);
        if ((buf[0] & 48) !== 0) {
          const error = this.createError(
            RangeError,
            "RSV2 and RSV3 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_2_3"
          );
          cb(error);
          return;
        }
        const compressed = (buf[0] & 64) === 64;
        if (compressed && !this._extensions[PerMessageDeflate2.extensionName]) {
          const error = this.createError(
            RangeError,
            "RSV1 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_1"
          );
          cb(error);
          return;
        }
        this._fin = (buf[0] & 128) === 128;
        this._opcode = buf[0] & 15;
        this._payloadLength = buf[1] & 127;
        if (this._opcode === 0) {
          if (compressed) {
            const error = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error);
            return;
          }
          if (!this._fragmented) {
            const error = this.createError(
              RangeError,
              "invalid opcode 0",
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error);
            return;
          }
          this._opcode = this._fragmented;
        } else if (this._opcode === 1 || this._opcode === 2) {
          if (this._fragmented) {
            const error = this.createError(
              RangeError,
              `invalid opcode ${this._opcode}`,
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error);
            return;
          }
          this._compressed = compressed;
        } else if (this._opcode > 7 && this._opcode < 11) {
          if (!this._fin) {
            const error = this.createError(
              RangeError,
              "FIN must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_FIN"
            );
            cb(error);
            return;
          }
          if (compressed) {
            const error = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error);
            return;
          }
          if (this._payloadLength > 125 || this._opcode === 8 && this._payloadLength === 1) {
            const error = this.createError(
              RangeError,
              `invalid payload length ${this._payloadLength}`,
              true,
              1002,
              "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH"
            );
            cb(error);
            return;
          }
        } else {
          const error = this.createError(
            RangeError,
            `invalid opcode ${this._opcode}`,
            true,
            1002,
            "WS_ERR_INVALID_OPCODE"
          );
          cb(error);
          return;
        }
        if (!this._fin && !this._fragmented) this._fragmented = this._opcode;
        this._masked = (buf[1] & 128) === 128;
        if (this._isServer) {
          if (!this._masked) {
            const error = this.createError(
              RangeError,
              "MASK must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_MASK"
            );
            cb(error);
            return;
          }
        } else if (this._masked) {
          const error = this.createError(
            RangeError,
            "MASK must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_MASK"
          );
          cb(error);
          return;
        }
        if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
        else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;
        else this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+16).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength16(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        this._payloadLength = this.consume(2).readUInt16BE(0);
        this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+64).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength64(cb) {
        if (this._bufferedBytes < 8) {
          this._loop = false;
          return;
        }
        const buf = this.consume(8);
        const num = buf.readUInt32BE(0);
        if (num > Math.pow(2, 53 - 32) - 1) {
          const error = this.createError(
            RangeError,
            "Unsupported WebSocket frame: payload length > 2^53 - 1",
            false,
            1009,
            "WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH"
          );
          cb(error);
          return;
        }
        this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
        this.haveLength(cb);
      }
      /**
       * Payload length has been read.
       *
       * @param {Function} cb Callback
       * @private
       */
      haveLength(cb) {
        if (this._payloadLength && this._opcode < 8) {
          this._totalPayloadLength += this._payloadLength;
          if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
            const error = this.createError(
              RangeError,
              "Max payload size exceeded",
              false,
              1009,
              "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
            );
            cb(error);
            return;
          }
        }
        if (this._masked) this._state = GET_MASK;
        else this._state = GET_DATA;
      }
      /**
       * Reads mask bytes.
       *
       * @private
       */
      getMask() {
        if (this._bufferedBytes < 4) {
          this._loop = false;
          return;
        }
        this._mask = this.consume(4);
        this._state = GET_DATA;
      }
      /**
       * Reads data bytes.
       *
       * @param {Function} cb Callback
       * @private
       */
      getData(cb) {
        let data = EMPTY_BUFFER;
        if (this._payloadLength) {
          if (this._bufferedBytes < this._payloadLength) {
            this._loop = false;
            return;
          }
          data = this.consume(this._payloadLength);
          if (this._masked && (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0) {
            unmask(data, this._mask);
          }
        }
        if (this._opcode > 7) {
          this.controlMessage(data, cb);
          return;
        }
        if (this._compressed) {
          this._state = INFLATING;
          this.decompress(data, cb);
          return;
        }
        if (data.length) {
          this._messageLength = this._totalPayloadLength;
          this._fragments.push(data);
        }
        this.dataMessage(cb);
      }
      /**
       * Decompresses data.
       *
       * @param {Buffer} data Compressed data
       * @param {Function} cb Callback
       * @private
       */
      decompress(data, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        perMessageDeflate.decompress(data, this._fin, (err, buf) => {
          if (err) return cb(err);
          if (buf.length) {
            this._messageLength += buf.length;
            if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
              const error = this.createError(
                RangeError,
                "Max payload size exceeded",
                false,
                1009,
                "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
              );
              cb(error);
              return;
            }
            this._fragments.push(buf);
          }
          this.dataMessage(cb);
          if (this._state === GET_INFO) this.startLoop(cb);
        });
      }
      /**
       * Handles a data message.
       *
       * @param {Function} cb Callback
       * @private
       */
      dataMessage(cb) {
        if (!this._fin) {
          this._state = GET_INFO;
          return;
        }
        const messageLength = this._messageLength;
        const fragments = this._fragments;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragmented = 0;
        this._fragments = [];
        if (this._opcode === 2) {
          let data;
          if (this._binaryType === "nodebuffer") {
            data = concat(fragments, messageLength);
          } else if (this._binaryType === "arraybuffer") {
            data = toArrayBuffer(concat(fragments, messageLength));
          } else if (this._binaryType === "blob") {
            data = new Blob(fragments);
          } else {
            data = fragments;
          }
          if (this._allowSynchronousEvents) {
            this.emit("message", data, true);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit("message", data, true);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        } else {
          const buf = concat(fragments, messageLength);
          if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
            const error = this.createError(
              Error,
              "invalid UTF-8 sequence",
              true,
              1007,
              "WS_ERR_INVALID_UTF8"
            );
            cb(error);
            return;
          }
          if (this._state === INFLATING || this._allowSynchronousEvents) {
            this.emit("message", buf, false);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit("message", buf, false);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        }
      }
      /**
       * Handles a control message.
       *
       * @param {Buffer} data Data to handle
       * @return {(Error|RangeError|undefined)} A possible error
       * @private
       */
      controlMessage(data, cb) {
        if (this._opcode === 8) {
          if (data.length === 0) {
            this._loop = false;
            this.emit("conclude", 1005, EMPTY_BUFFER);
            this.end();
          } else {
            const code = data.readUInt16BE(0);
            if (!isValidStatusCode(code)) {
              const error = this.createError(
                RangeError,
                `invalid status code ${code}`,
                true,
                1002,
                "WS_ERR_INVALID_CLOSE_CODE"
              );
              cb(error);
              return;
            }
            const buf = new FastBuffer(
              data.buffer,
              data.byteOffset + 2,
              data.length - 2
            );
            if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
              const error = this.createError(
                Error,
                "invalid UTF-8 sequence",
                true,
                1007,
                "WS_ERR_INVALID_UTF8"
              );
              cb(error);
              return;
            }
            this._loop = false;
            this.emit("conclude", code, buf);
            this.end();
          }
          this._state = GET_INFO;
          return;
        }
        if (this._allowSynchronousEvents) {
          this.emit(this._opcode === 9 ? "ping" : "pong", data);
          this._state = GET_INFO;
        } else {
          this._state = DEFER_EVENT;
          setImmediate(() => {
            this.emit(this._opcode === 9 ? "ping" : "pong", data);
            this._state = GET_INFO;
            this.startLoop(cb);
          });
        }
      }
      /**
       * Builds an error object.
       *
       * @param {function(new:Error|RangeError)} ErrorCtor The error constructor
       * @param {String} message The error message
       * @param {Boolean} prefix Specifies whether or not to add a default prefix to
       *     `message`
       * @param {Number} statusCode The status code
       * @param {String} errorCode The exposed error code
       * @return {(Error|RangeError)} The error
       * @private
       */
      createError(ErrorCtor, message, prefix, statusCode, errorCode2) {
        this._loop = false;
        this._errored = true;
        const err = new ErrorCtor(
          prefix ? `Invalid WebSocket frame: ${message}` : message
        );
        Error.captureStackTrace(err, this.createError);
        err.code = errorCode2;
        err[kStatusCode] = statusCode;
        return err;
      }
    };
    module2.exports = Receiver2;
  }
});

// node_modules/ws/lib/sender.js
var require_sender = __commonJS({
  "node_modules/ws/lib/sender.js"(exports2, module2) {
    "use strict";
    var { Duplex } = require("stream");
    var { randomFillSync } = require("crypto");
    var PerMessageDeflate2 = require_permessage_deflate();
    var { EMPTY_BUFFER, kWebSocket, NOOP } = require_constants();
    var { isBlob, isValidStatusCode } = require_validation();
    var { mask: applyMask, toBuffer } = require_buffer_util();
    var kByteLength = /* @__PURE__ */ Symbol("kByteLength");
    var maskBuffer = Buffer.alloc(4);
    var RANDOM_POOL_SIZE = 8 * 1024;
    var randomPool;
    var randomPoolPointer = RANDOM_POOL_SIZE;
    var DEFAULT = 0;
    var DEFLATING = 1;
    var GET_BLOB_DATA = 2;
    var Sender2 = class _Sender {
      /**
       * Creates a Sender instance.
       *
       * @param {Duplex} socket The connection socket
       * @param {Object} [extensions] An object containing the negotiated extensions
       * @param {Function} [generateMask] The function used to generate the masking
       *     key
       */
      constructor(socket, extensions, generateMask) {
        this._extensions = extensions || {};
        if (generateMask) {
          this._generateMask = generateMask;
          this._maskBuffer = Buffer.alloc(4);
        }
        this._socket = socket;
        this._firstFragment = true;
        this._compress = false;
        this._bufferedBytes = 0;
        this._queue = [];
        this._state = DEFAULT;
        this.onerror = NOOP;
        this[kWebSocket] = void 0;
      }
      /**
       * Frames a piece of data according to the HyBi WebSocket protocol.
       *
       * @param {(Buffer|String)} data The data to frame
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @return {(Buffer|String)[]} The framed data
       * @public
       */
      static frame(data, options) {
        let mask;
        let merge = false;
        let offset = 2;
        let skipMasking = false;
        if (options.mask) {
          mask = options.maskBuffer || maskBuffer;
          if (options.generateMask) {
            options.generateMask(mask);
          } else {
            if (randomPoolPointer === RANDOM_POOL_SIZE) {
              if (randomPool === void 0) {
                randomPool = Buffer.alloc(RANDOM_POOL_SIZE);
              }
              randomFillSync(randomPool, 0, RANDOM_POOL_SIZE);
              randomPoolPointer = 0;
            }
            mask[0] = randomPool[randomPoolPointer++];
            mask[1] = randomPool[randomPoolPointer++];
            mask[2] = randomPool[randomPoolPointer++];
            mask[3] = randomPool[randomPoolPointer++];
          }
          skipMasking = (mask[0] | mask[1] | mask[2] | mask[3]) === 0;
          offset = 6;
        }
        let dataLength;
        if (typeof data === "string") {
          if ((!options.mask || skipMasking) && options[kByteLength] !== void 0) {
            dataLength = options[kByteLength];
          } else {
            data = Buffer.from(data);
            dataLength = data.length;
          }
        } else {
          dataLength = data.length;
          merge = options.mask && options.readOnly && !skipMasking;
        }
        let payloadLength = dataLength;
        if (dataLength >= 65536) {
          offset += 8;
          payloadLength = 127;
        } else if (dataLength > 125) {
          offset += 2;
          payloadLength = 126;
        }
        const target = Buffer.allocUnsafe(merge ? dataLength + offset : offset);
        target[0] = options.fin ? options.opcode | 128 : options.opcode;
        if (options.rsv1) target[0] |= 64;
        target[1] = payloadLength;
        if (payloadLength === 126) {
          target.writeUInt16BE(dataLength, 2);
        } else if (payloadLength === 127) {
          target[2] = target[3] = 0;
          target.writeUIntBE(dataLength, 4, 6);
        }
        if (!options.mask) return [target, data];
        target[1] |= 128;
        target[offset - 4] = mask[0];
        target[offset - 3] = mask[1];
        target[offset - 2] = mask[2];
        target[offset - 1] = mask[3];
        if (skipMasking) return [target, data];
        if (merge) {
          applyMask(data, mask, target, offset, dataLength);
          return [target];
        }
        applyMask(data, mask, data, 0, dataLength);
        return [target, data];
      }
      /**
       * Sends a close message to the other peer.
       *
       * @param {Number} [code] The status code component of the body
       * @param {(String|Buffer)} [data] The message component of the body
       * @param {Boolean} [mask=false] Specifies whether or not to mask the message
       * @param {Function} [cb] Callback
       * @public
       */
      close(code, data, mask, cb) {
        let buf;
        if (code === void 0) {
          buf = EMPTY_BUFFER;
        } else if (typeof code !== "number" || !isValidStatusCode(code)) {
          throw new TypeError("First argument must be a valid error code number");
        } else if (data === void 0 || !data.length) {
          buf = Buffer.allocUnsafe(2);
          buf.writeUInt16BE(code, 0);
        } else {
          const length = Buffer.byteLength(data);
          if (length > 123) {
            throw new RangeError("The message must not be greater than 123 bytes");
          }
          buf = Buffer.allocUnsafe(2 + length);
          buf.writeUInt16BE(code, 0);
          if (typeof data === "string") {
            buf.write(data, 2);
          } else {
            buf.set(data, 2);
          }
        }
        const options = {
          [kByteLength]: buf.length,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 8,
          readOnly: false,
          rsv1: false
        };
        if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, buf, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(buf, options), cb);
        }
      }
      /**
       * Sends a ping message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      ping(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 9,
          readOnly,
          rsv1: false
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, false, options, cb]);
          } else {
            this.getBlobData(data, false, options, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a pong message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      pong(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 10,
          readOnly,
          rsv1: false
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, false, options, cb]);
          } else {
            this.getBlobData(data, false, options, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a data message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Object} options Options object
       * @param {Boolean} [options.binary=false] Specifies whether `data` is binary
       *     or text
       * @param {Boolean} [options.compress=false] Specifies whether or not to
       *     compress `data`
       * @param {Boolean} [options.fin=false] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Function} [cb] Callback
       * @public
       */
      send(data, options, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        let opcode = options.binary ? 2 : 1;
        let rsv1 = options.compress;
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (this._firstFragment) {
          this._firstFragment = false;
          if (rsv1 && perMessageDeflate && perMessageDeflate.params[perMessageDeflate._isServer ? "server_no_context_takeover" : "client_no_context_takeover"]) {
            rsv1 = byteLength >= perMessageDeflate._threshold;
          }
          this._compress = rsv1;
        } else {
          rsv1 = false;
          opcode = 0;
        }
        if (options.fin) this._firstFragment = true;
        const opts = {
          [kByteLength]: byteLength,
          fin: options.fin,
          generateMask: this._generateMask,
          mask: options.mask,
          maskBuffer: this._maskBuffer,
          opcode,
          readOnly,
          rsv1
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, this._compress, opts, cb]);
          } else {
            this.getBlobData(data, this._compress, opts, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, this._compress, opts, cb]);
        } else {
          this.dispatch(data, this._compress, opts, cb);
        }
      }
      /**
       * Gets the contents of a blob as binary data.
       *
       * @param {Blob} blob The blob
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     the data
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      getBlobData(blob, compress, options, cb) {
        this._bufferedBytes += options[kByteLength];
        this._state = GET_BLOB_DATA;
        blob.arrayBuffer().then((arrayBuffer) => {
          if (this._socket.destroyed) {
            const err = new Error(
              "The socket was closed while the blob was being read"
            );
            process.nextTick(callCallbacks, this, err, cb);
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          const data = toBuffer(arrayBuffer);
          if (!compress) {
            this._state = DEFAULT;
            this.sendFrame(_Sender.frame(data, options), cb);
            this.dequeue();
          } else {
            this.dispatch(data, compress, options, cb);
          }
        }).catch((err) => {
          process.nextTick(onError, this, err, cb);
        });
      }
      /**
       * Dispatches a message.
       *
       * @param {(Buffer|String)} data The message to send
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     `data`
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      dispatch(data, compress, options, cb) {
        if (!compress) {
          this.sendFrame(_Sender.frame(data, options), cb);
          return;
        }
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        this._bufferedBytes += options[kByteLength];
        this._state = DEFLATING;
        perMessageDeflate.compress(data, options.fin, (_, buf) => {
          if (this._socket.destroyed) {
            const err = new Error(
              "The socket was closed while data was being compressed"
            );
            callCallbacks(this, err, cb);
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          this._state = DEFAULT;
          options.readOnly = false;
          this.sendFrame(_Sender.frame(buf, options), cb);
          this.dequeue();
        });
      }
      /**
       * Executes queued send operations.
       *
       * @private
       */
      dequeue() {
        while (this._state === DEFAULT && this._queue.length) {
          const params = this._queue.shift();
          this._bufferedBytes -= params[3][kByteLength];
          Reflect.apply(params[0], this, params.slice(1));
        }
      }
      /**
       * Enqueues a send operation.
       *
       * @param {Array} params Send operation parameters.
       * @private
       */
      enqueue(params) {
        this._bufferedBytes += params[3][kByteLength];
        this._queue.push(params);
      }
      /**
       * Sends a frame.
       *
       * @param {(Buffer | String)[]} list The frame to send
       * @param {Function} [cb] Callback
       * @private
       */
      sendFrame(list, cb) {
        if (list.length === 2) {
          this._socket.cork();
          this._socket.write(list[0]);
          this._socket.write(list[1], cb);
          this._socket.uncork();
        } else {
          this._socket.write(list[0], cb);
        }
      }
    };
    module2.exports = Sender2;
    function callCallbacks(sender, err, cb) {
      if (typeof cb === "function") cb(err);
      for (let i = 0; i < sender._queue.length; i++) {
        const params = sender._queue[i];
        const callback = params[params.length - 1];
        if (typeof callback === "function") callback(err);
      }
    }
    function onError(sender, err, cb) {
      callCallbacks(sender, err, cb);
      sender.onerror(err);
    }
  }
});

// node_modules/ws/lib/event-target.js
var require_event_target = __commonJS({
  "node_modules/ws/lib/event-target.js"(exports2, module2) {
    "use strict";
    var { kForOnEventAttribute, kListener } = require_constants();
    var kCode = /* @__PURE__ */ Symbol("kCode");
    var kData = /* @__PURE__ */ Symbol("kData");
    var kError = /* @__PURE__ */ Symbol("kError");
    var kMessage = /* @__PURE__ */ Symbol("kMessage");
    var kReason = /* @__PURE__ */ Symbol("kReason");
    var kTarget = /* @__PURE__ */ Symbol("kTarget");
    var kType = /* @__PURE__ */ Symbol("kType");
    var kWasClean = /* @__PURE__ */ Symbol("kWasClean");
    var Event2 = class {
      /**
       * Create a new `Event`.
       *
       * @param {String} type The name of the event
       * @throws {TypeError} If the `type` argument is not specified
       */
      constructor(type) {
        this[kTarget] = null;
        this[kType] = type;
      }
      /**
       * @type {*}
       */
      get target() {
        return this[kTarget];
      }
      /**
       * @type {String}
       */
      get type() {
        return this[kType];
      }
    };
    Object.defineProperty(Event2.prototype, "target", { enumerable: true });
    Object.defineProperty(Event2.prototype, "type", { enumerable: true });
    var CloseEvent = class extends Event2 {
      /**
       * Create a new `CloseEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {Number} [options.code=0] The status code explaining why the
       *     connection was closed
       * @param {String} [options.reason=''] A human-readable string explaining why
       *     the connection was closed
       * @param {Boolean} [options.wasClean=false] Indicates whether or not the
       *     connection was cleanly closed
       */
      constructor(type, options = {}) {
        super(type);
        this[kCode] = options.code === void 0 ? 0 : options.code;
        this[kReason] = options.reason === void 0 ? "" : options.reason;
        this[kWasClean] = options.wasClean === void 0 ? false : options.wasClean;
      }
      /**
       * @type {Number}
       */
      get code() {
        return this[kCode];
      }
      /**
       * @type {String}
       */
      get reason() {
        return this[kReason];
      }
      /**
       * @type {Boolean}
       */
      get wasClean() {
        return this[kWasClean];
      }
    };
    Object.defineProperty(CloseEvent.prototype, "code", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "reason", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "wasClean", { enumerable: true });
    var ErrorEvent = class extends Event2 {
      /**
       * Create a new `ErrorEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.error=null] The error that generated this event
       * @param {String} [options.message=''] The error message
       */
      constructor(type, options = {}) {
        super(type);
        this[kError] = options.error === void 0 ? null : options.error;
        this[kMessage] = options.message === void 0 ? "" : options.message;
      }
      /**
       * @type {*}
       */
      get error() {
        return this[kError];
      }
      /**
       * @type {String}
       */
      get message() {
        return this[kMessage];
      }
    };
    Object.defineProperty(ErrorEvent.prototype, "error", { enumerable: true });
    Object.defineProperty(ErrorEvent.prototype, "message", { enumerable: true });
    var MessageEvent = class extends Event2 {
      /**
       * Create a new `MessageEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.data=null] The message content
       */
      constructor(type, options = {}) {
        super(type);
        this[kData] = options.data === void 0 ? null : options.data;
      }
      /**
       * @type {*}
       */
      get data() {
        return this[kData];
      }
    };
    Object.defineProperty(MessageEvent.prototype, "data", { enumerable: true });
    var EventTarget = {
      /**
       * Register an event listener.
       *
       * @param {String} type A string representing the event type to listen for
       * @param {(Function|Object)} handler The listener to add
       * @param {Object} [options] An options object specifies characteristics about
       *     the event listener
       * @param {Boolean} [options.once=false] A `Boolean` indicating that the
       *     listener should be invoked at most once after being added. If `true`,
       *     the listener would be automatically removed when invoked.
       * @public
       */
      addEventListener(type, handler, options = {}) {
        for (const listener of this.listeners(type)) {
          if (!options[kForOnEventAttribute] && listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            return;
          }
        }
        let wrapper;
        if (type === "message") {
          wrapper = function onMessage(data, isBinary) {
            const event = new MessageEvent("message", {
              data: isBinary ? data : data.toString()
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "close") {
          wrapper = function onClose(code, message) {
            const event = new CloseEvent("close", {
              code,
              reason: message.toString(),
              wasClean: this._closeFrameReceived && this._closeFrameSent
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "error") {
          wrapper = function onError(error) {
            const event = new ErrorEvent("error", {
              error,
              message: error.message
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "open") {
          wrapper = function onOpen() {
            const event = new Event2("open");
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else {
          return;
        }
        wrapper[kForOnEventAttribute] = !!options[kForOnEventAttribute];
        wrapper[kListener] = handler;
        if (options.once) {
          this.once(type, wrapper);
        } else {
          this.on(type, wrapper);
        }
      },
      /**
       * Remove an event listener.
       *
       * @param {String} type A string representing the event type to remove
       * @param {(Function|Object)} handler The listener to remove
       * @public
       */
      removeEventListener(type, handler) {
        for (const listener of this.listeners(type)) {
          if (listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            this.removeListener(type, listener);
            break;
          }
        }
      }
    };
    module2.exports = {
      CloseEvent,
      ErrorEvent,
      Event: Event2,
      EventTarget,
      MessageEvent
    };
    function callListener(listener, thisArg, event) {
      if (typeof listener === "object" && listener.handleEvent) {
        listener.handleEvent.call(listener, event);
      } else {
        listener.call(thisArg, event);
      }
    }
  }
});

// node_modules/ws/lib/extension.js
var require_extension = __commonJS({
  "node_modules/ws/lib/extension.js"(exports2, module2) {
    "use strict";
    var { tokenChars } = require_validation();
    function push(dest, name, elem) {
      if (dest[name] === void 0) dest[name] = [elem];
      else dest[name].push(elem);
    }
    function parse(header) {
      const offers = /* @__PURE__ */ Object.create(null);
      let params = /* @__PURE__ */ Object.create(null);
      let mustUnescape = false;
      let isEscaping = false;
      let inQuotes = false;
      let extensionName;
      let paramName;
      let start = -1;
      let code = -1;
      let end = -1;
      let i = 0;
      for (; i < header.length; i++) {
        code = header.charCodeAt(i);
        if (extensionName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (i !== 0 && (code === 32 || code === 9)) {
            if (end === -1 && start !== -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            const name = header.slice(start, end);
            if (code === 44) {
              push(offers, name, params);
              params = /* @__PURE__ */ Object.create(null);
            } else {
              extensionName = name;
            }
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else if (paramName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (code === 32 || code === 9) {
            if (end === -1 && start !== -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            push(params, header.slice(start, end), true);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            start = end = -1;
          } else if (code === 61 && start !== -1 && end === -1) {
            paramName = header.slice(start, i);
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else {
          if (isEscaping) {
            if (tokenChars[code] !== 1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (start === -1) start = i;
            else if (!mustUnescape) mustUnescape = true;
            isEscaping = false;
          } else if (inQuotes) {
            if (tokenChars[code] === 1) {
              if (start === -1) start = i;
            } else if (code === 34 && start !== -1) {
              inQuotes = false;
              end = i;
            } else if (code === 92) {
              isEscaping = true;
            } else {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
          } else if (code === 34 && header.charCodeAt(i - 1) === 61) {
            inQuotes = true;
          } else if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (start !== -1 && (code === 32 || code === 9)) {
            if (end === -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            let value = header.slice(start, end);
            if (mustUnescape) {
              value = value.replace(/\\/g, "");
              mustUnescape = false;
            }
            push(params, paramName, value);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            paramName = void 0;
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        }
      }
      if (start === -1 || inQuotes || code === 32 || code === 9) {
        throw new SyntaxError("Unexpected end of input");
      }
      if (end === -1) end = i;
      const token = header.slice(start, end);
      if (extensionName === void 0) {
        push(offers, token, params);
      } else {
        if (paramName === void 0) {
          push(params, token, true);
        } else if (mustUnescape) {
          push(params, paramName, token.replace(/\\/g, ""));
        } else {
          push(params, paramName, token);
        }
        push(offers, extensionName, params);
      }
      return offers;
    }
    function format(extensions) {
      return Object.keys(extensions).map((extension2) => {
        let configurations = extensions[extension2];
        if (!Array.isArray(configurations)) configurations = [configurations];
        return configurations.map((params) => {
          return [extension2].concat(
            Object.keys(params).map((k) => {
              let values = params[k];
              if (!Array.isArray(values)) values = [values];
              return values.map((v) => v === true ? k : `${k}=${v}`).join("; ");
            })
          ).join("; ");
        }).join(", ");
      }).join(", ");
    }
    module2.exports = { format, parse };
  }
});

// node_modules/ws/lib/websocket.js
var require_websocket = __commonJS({
  "node_modules/ws/lib/websocket.js"(exports2, module2) {
    "use strict";
    var EventEmitter8 = require("events");
    var https = require("https");
    var http = require("http");
    var net = require("net");
    var tls = require("tls");
    var { randomBytes, createHash: createHash3 } = require("crypto");
    var { Duplex, Readable } = require("stream");
    var { URL: URL2 } = require("url");
    var PerMessageDeflate2 = require_permessage_deflate();
    var Receiver2 = require_receiver();
    var Sender2 = require_sender();
    var { isBlob } = require_validation();
    var {
      BINARY_TYPES,
      CLOSE_TIMEOUT,
      EMPTY_BUFFER,
      GUID,
      kForOnEventAttribute,
      kListener,
      kStatusCode,
      kWebSocket,
      NOOP
    } = require_constants();
    var {
      EventTarget: { addEventListener, removeEventListener }
    } = require_event_target();
    var { format, parse } = require_extension();
    var { toBuffer } = require_buffer_util();
    var kAborted = /* @__PURE__ */ Symbol("kAborted");
    var protocolVersions = [8, 13];
    var readyStates = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"];
    var subprotocolRegex = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;
    var WebSocket2 = class _WebSocket extends EventEmitter8 {
      /**
       * Create a new `WebSocket`.
       *
       * @param {(String|URL)} address The URL to which to connect
       * @param {(String|String[])} [protocols] The subprotocols
       * @param {Object} [options] Connection options
       */
      constructor(address, protocols, options) {
        super();
        this._binaryType = BINARY_TYPES[0];
        this._closeCode = 1006;
        this._closeFrameReceived = false;
        this._closeFrameSent = false;
        this._closeMessage = EMPTY_BUFFER;
        this._closeTimer = null;
        this._errorEmitted = false;
        this._extensions = {};
        this._paused = false;
        this._protocol = "";
        this._readyState = _WebSocket.CONNECTING;
        this._receiver = null;
        this._sender = null;
        this._socket = null;
        if (address !== null) {
          this._bufferedAmount = 0;
          this._isServer = false;
          this._redirects = 0;
          if (protocols === void 0) {
            protocols = [];
          } else if (!Array.isArray(protocols)) {
            if (typeof protocols === "object" && protocols !== null) {
              options = protocols;
              protocols = [];
            } else {
              protocols = [protocols];
            }
          }
          initAsClient(this, address, protocols, options);
        } else {
          this._autoPong = options.autoPong;
          this._closeTimeout = options.closeTimeout;
          this._isServer = true;
        }
      }
      /**
       * For historical reasons, the custom "nodebuffer" type is used by the default
       * instead of "blob".
       *
       * @type {String}
       */
      get binaryType() {
        return this._binaryType;
      }
      set binaryType(type) {
        if (!BINARY_TYPES.includes(type)) return;
        this._binaryType = type;
        if (this._receiver) this._receiver._binaryType = type;
      }
      /**
       * @type {Number}
       */
      get bufferedAmount() {
        if (!this._socket) return this._bufferedAmount;
        return this._socket._writableState.length + this._sender._bufferedBytes;
      }
      /**
       * @type {String}
       */
      get extensions() {
        return Object.keys(this._extensions).join();
      }
      /**
       * @type {Boolean}
       */
      get isPaused() {
        return this._paused;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onclose() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onerror() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onopen() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onmessage() {
        return null;
      }
      /**
       * @type {String}
       */
      get protocol() {
        return this._protocol;
      }
      /**
       * @type {Number}
       */
      get readyState() {
        return this._readyState;
      }
      /**
       * @type {String}
       */
      get url() {
        return this._url;
      }
      /**
       * Set up the socket and the internal resources.
       *
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Object} options Options object
       * @param {Boolean} [options.allowSynchronousEvents=false] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Number} [options.maxPayload=0] The maximum allowed message size
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @private
       */
      setSocket(socket, head, options) {
        const receiver = new Receiver2({
          allowSynchronousEvents: options.allowSynchronousEvents,
          binaryType: this.binaryType,
          extensions: this._extensions,
          isServer: this._isServer,
          maxPayload: options.maxPayload,
          skipUTF8Validation: options.skipUTF8Validation
        });
        const sender = new Sender2(socket, this._extensions, options.generateMask);
        this._receiver = receiver;
        this._sender = sender;
        this._socket = socket;
        receiver[kWebSocket] = this;
        sender[kWebSocket] = this;
        socket[kWebSocket] = this;
        receiver.on("conclude", receiverOnConclude);
        receiver.on("drain", receiverOnDrain);
        receiver.on("error", receiverOnError);
        receiver.on("message", receiverOnMessage);
        receiver.on("ping", receiverOnPing);
        receiver.on("pong", receiverOnPong);
        sender.onerror = senderOnError;
        if (socket.setTimeout) socket.setTimeout(0);
        if (socket.setNoDelay) socket.setNoDelay();
        if (head.length > 0) socket.unshift(head);
        socket.on("close", socketOnClose);
        socket.on("data", socketOnData);
        socket.on("end", socketOnEnd);
        socket.on("error", socketOnError);
        this._readyState = _WebSocket.OPEN;
        this.emit("open");
      }
      /**
       * Emit the `'close'` event.
       *
       * @private
       */
      emitClose() {
        if (!this._socket) {
          this._readyState = _WebSocket.CLOSED;
          this.emit("close", this._closeCode, this._closeMessage);
          return;
        }
        if (this._extensions[PerMessageDeflate2.extensionName]) {
          this._extensions[PerMessageDeflate2.extensionName].cleanup();
        }
        this._receiver.removeAllListeners();
        this._readyState = _WebSocket.CLOSED;
        this.emit("close", this._closeCode, this._closeMessage);
      }
      /**
       * Start a closing handshake.
       *
       *          +----------+   +-----------+   +----------+
       *     - - -|ws.close()|-->|close frame|-->|ws.close()|- - -
       *    |     +----------+   +-----------+   +----------+     |
       *          +----------+   +-----------+         |
       * CLOSING  |ws.close()|<--|close frame|<--+-----+       CLOSING
       *          +----------+   +-----------+   |
       *    |           |                        |   +---+        |
       *                +------------------------+-->|fin| - - - -
       *    |         +---+                      |   +---+
       *     - - - - -|fin|<---------------------+
       *              +---+
       *
       * @param {Number} [code] Status code explaining why the connection is closing
       * @param {(String|Buffer)} [data] The reason why the connection is
       *     closing
       * @public
       */
      close(code, data) {
        if (this.readyState === _WebSocket.CLOSED) return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this.readyState === _WebSocket.CLOSING) {
          if (this._closeFrameSent && (this._closeFrameReceived || this._receiver._writableState.errorEmitted)) {
            this._socket.end();
          }
          return;
        }
        this._readyState = _WebSocket.CLOSING;
        this._sender.close(code, data, !this._isServer, (err) => {
          if (err) return;
          this._closeFrameSent = true;
          if (this._closeFrameReceived || this._receiver._writableState.errorEmitted) {
            this._socket.end();
          }
        });
        setCloseTimer(this);
      }
      /**
       * Pause the socket.
       *
       * @public
       */
      pause() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = true;
        this._socket.pause();
      }
      /**
       * Send a ping.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the ping is sent
       * @public
       */
      ping(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0) mask = !this._isServer;
        this._sender.ping(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Send a pong.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the pong is sent
       * @public
       */
      pong(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0) mask = !this._isServer;
        this._sender.pong(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Resume the socket.
       *
       * @public
       */
      resume() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = false;
        if (!this._receiver._writableState.needDrain) this._socket.resume();
      }
      /**
       * Send a data message.
       *
       * @param {*} data The message to send
       * @param {Object} [options] Options object
       * @param {Boolean} [options.binary] Specifies whether `data` is binary or
       *     text
       * @param {Boolean} [options.compress] Specifies whether or not to compress
       *     `data`
       * @param {Boolean} [options.fin=true] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when data is written out
       * @public
       */
      send(data, options, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof options === "function") {
          cb = options;
          options = {};
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        const opts = {
          binary: typeof data !== "string",
          mask: !this._isServer,
          compress: true,
          fin: true,
          ...options
        };
        if (!this._extensions[PerMessageDeflate2.extensionName]) {
          opts.compress = false;
        }
        this._sender.send(data || EMPTY_BUFFER, opts, cb);
      }
      /**
       * Forcibly close the connection.
       *
       * @public
       */
      terminate() {
        if (this.readyState === _WebSocket.CLOSED) return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this._socket) {
          this._readyState = _WebSocket.CLOSING;
          this._socket.destroy();
        }
      }
    };
    Object.defineProperty(WebSocket2, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket2.prototype, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket2, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket2.prototype, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket2, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket2.prototype, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket2, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    Object.defineProperty(WebSocket2.prototype, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    [
      "binaryType",
      "bufferedAmount",
      "extensions",
      "isPaused",
      "protocol",
      "readyState",
      "url"
    ].forEach((property) => {
      Object.defineProperty(WebSocket2.prototype, property, { enumerable: true });
    });
    ["open", "error", "close", "message"].forEach((method) => {
      Object.defineProperty(WebSocket2.prototype, `on${method}`, {
        enumerable: true,
        get() {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) return listener[kListener];
          }
          return null;
        },
        set(handler) {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) {
              this.removeListener(method, listener);
              break;
            }
          }
          if (typeof handler !== "function") return;
          this.addEventListener(method, handler, {
            [kForOnEventAttribute]: true
          });
        }
      });
    });
    WebSocket2.prototype.addEventListener = addEventListener;
    WebSocket2.prototype.removeEventListener = removeEventListener;
    module2.exports = WebSocket2;
    function initAsClient(websocket, address, protocols, options) {
      const opts = {
        allowSynchronousEvents: true,
        autoPong: true,
        closeTimeout: CLOSE_TIMEOUT,
        protocolVersion: protocolVersions[1],
        maxPayload: 100 * 1024 * 1024,
        skipUTF8Validation: false,
        perMessageDeflate: true,
        followRedirects: false,
        maxRedirects: 10,
        ...options,
        socketPath: void 0,
        hostname: void 0,
        protocol: void 0,
        timeout: void 0,
        method: "GET",
        host: void 0,
        path: void 0,
        port: void 0
      };
      websocket._autoPong = opts.autoPong;
      websocket._closeTimeout = opts.closeTimeout;
      if (!protocolVersions.includes(opts.protocolVersion)) {
        throw new RangeError(
          `Unsupported protocol version: ${opts.protocolVersion} (supported versions: ${protocolVersions.join(", ")})`
        );
      }
      let parsedUrl;
      if (address instanceof URL2) {
        parsedUrl = address;
      } else {
        try {
          parsedUrl = new URL2(address);
        } catch {
          throw new SyntaxError(`Invalid URL: ${address}`);
        }
      }
      if (parsedUrl.protocol === "http:") {
        parsedUrl.protocol = "ws:";
      } else if (parsedUrl.protocol === "https:") {
        parsedUrl.protocol = "wss:";
      }
      websocket._url = parsedUrl.href;
      const isSecure = parsedUrl.protocol === "wss:";
      const isIpcUrl = parsedUrl.protocol === "ws+unix:";
      let invalidUrlMessage;
      if (parsedUrl.protocol !== "ws:" && !isSecure && !isIpcUrl) {
        invalidUrlMessage = `The URL's protocol must be one of "ws:", "wss:", "http:", "https:", or "ws+unix:"`;
      } else if (isIpcUrl && !parsedUrl.pathname) {
        invalidUrlMessage = "The URL's pathname is empty";
      } else if (parsedUrl.hash) {
        invalidUrlMessage = "The URL contains a fragment identifier";
      }
      if (invalidUrlMessage) {
        const err = new SyntaxError(invalidUrlMessage);
        if (websocket._redirects === 0) {
          throw err;
        } else {
          emitErrorAndClose(websocket, err);
          return;
        }
      }
      const defaultPort = isSecure ? 443 : 80;
      const key = randomBytes(16).toString("base64");
      const request = isSecure ? https.request : http.request;
      const protocolSet = /* @__PURE__ */ new Set();
      let perMessageDeflate;
      opts.createConnection = opts.createConnection || (isSecure ? tlsConnect : netConnect);
      opts.defaultPort = opts.defaultPort || defaultPort;
      opts.port = parsedUrl.port || defaultPort;
      opts.host = parsedUrl.hostname.startsWith("[") ? parsedUrl.hostname.slice(1, -1) : parsedUrl.hostname;
      opts.headers = {
        ...opts.headers,
        "Sec-WebSocket-Version": opts.protocolVersion,
        "Sec-WebSocket-Key": key,
        Connection: "Upgrade",
        Upgrade: "websocket"
      };
      opts.path = parsedUrl.pathname + parsedUrl.search;
      opts.timeout = opts.handshakeTimeout;
      if (opts.perMessageDeflate) {
        perMessageDeflate = new PerMessageDeflate2({
          ...opts.perMessageDeflate,
          isServer: false,
          maxPayload: opts.maxPayload
        });
        opts.headers["Sec-WebSocket-Extensions"] = format({
          [PerMessageDeflate2.extensionName]: perMessageDeflate.offer()
        });
      }
      if (protocols.length) {
        for (const protocol of protocols) {
          if (typeof protocol !== "string" || !subprotocolRegex.test(protocol) || protocolSet.has(protocol)) {
            throw new SyntaxError(
              "An invalid or duplicated subprotocol was specified"
            );
          }
          protocolSet.add(protocol);
        }
        opts.headers["Sec-WebSocket-Protocol"] = protocols.join(",");
      }
      if (opts.origin) {
        if (opts.protocolVersion < 13) {
          opts.headers["Sec-WebSocket-Origin"] = opts.origin;
        } else {
          opts.headers.Origin = opts.origin;
        }
      }
      if (parsedUrl.username || parsedUrl.password) {
        opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
      }
      if (isIpcUrl) {
        const parts = opts.path.split(":");
        opts.socketPath = parts[0];
        opts.path = parts[1];
      }
      let req;
      if (opts.followRedirects) {
        if (websocket._redirects === 0) {
          websocket._originalIpc = isIpcUrl;
          websocket._originalSecure = isSecure;
          websocket._originalHostOrSocketPath = isIpcUrl ? opts.socketPath : parsedUrl.host;
          const headers = options && options.headers;
          options = { ...options, headers: {} };
          if (headers) {
            for (const [key2, value] of Object.entries(headers)) {
              options.headers[key2.toLowerCase()] = value;
            }
          }
        } else if (websocket.listenerCount("redirect") === 0) {
          const isSameHost = isIpcUrl ? websocket._originalIpc ? opts.socketPath === websocket._originalHostOrSocketPath : false : websocket._originalIpc ? false : parsedUrl.host === websocket._originalHostOrSocketPath;
          if (!isSameHost || websocket._originalSecure && !isSecure) {
            delete opts.headers.authorization;
            delete opts.headers.cookie;
            if (!isSameHost) delete opts.headers.host;
            opts.auth = void 0;
          }
        }
        if (opts.auth && !options.headers.authorization) {
          options.headers.authorization = "Basic " + Buffer.from(opts.auth).toString("base64");
        }
        req = websocket._req = request(opts);
        if (websocket._redirects) {
          websocket.emit("redirect", websocket.url, req);
        }
      } else {
        req = websocket._req = request(opts);
      }
      if (opts.timeout) {
        req.on("timeout", () => {
          abortHandshake(websocket, req, "Opening handshake has timed out");
        });
      }
      req.on("error", (err) => {
        if (req === null || req[kAborted]) return;
        req = websocket._req = null;
        emitErrorAndClose(websocket, err);
      });
      req.on("response", (res) => {
        const location = res.headers.location;
        const statusCode = res.statusCode;
        if (location && opts.followRedirects && statusCode >= 300 && statusCode < 400) {
          if (++websocket._redirects > opts.maxRedirects) {
            abortHandshake(websocket, req, "Maximum redirects exceeded");
            return;
          }
          req.abort();
          let addr;
          try {
            addr = new URL2(location, address);
          } catch (e) {
            const err = new SyntaxError(`Invalid URL: ${location}`);
            emitErrorAndClose(websocket, err);
            return;
          }
          initAsClient(websocket, addr, protocols, options);
        } else if (!websocket.emit("unexpected-response", req, res)) {
          abortHandshake(
            websocket,
            req,
            `Unexpected server response: ${res.statusCode}`
          );
        }
      });
      req.on("upgrade", (res, socket, head) => {
        websocket.emit("upgrade", res);
        if (websocket.readyState !== WebSocket2.CONNECTING) return;
        req = websocket._req = null;
        const upgrade = res.headers.upgrade;
        if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
          abortHandshake(websocket, socket, "Invalid Upgrade header");
          return;
        }
        const digest = createHash3("sha1").update(key + GUID).digest("base64");
        if (res.headers["sec-websocket-accept"] !== digest) {
          abortHandshake(websocket, socket, "Invalid Sec-WebSocket-Accept header");
          return;
        }
        const serverProt = res.headers["sec-websocket-protocol"];
        let protError;
        if (serverProt !== void 0) {
          if (!protocolSet.size) {
            protError = "Server sent a subprotocol but none was requested";
          } else if (!protocolSet.has(serverProt)) {
            protError = "Server sent an invalid subprotocol";
          }
        } else if (protocolSet.size) {
          protError = "Server sent no subprotocol";
        }
        if (protError) {
          abortHandshake(websocket, socket, protError);
          return;
        }
        if (serverProt) websocket._protocol = serverProt;
        const secWebSocketExtensions = res.headers["sec-websocket-extensions"];
        if (secWebSocketExtensions !== void 0) {
          if (!perMessageDeflate) {
            const message = "Server sent a Sec-WebSocket-Extensions header but no extension was requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          let extensions;
          try {
            extensions = parse(secWebSocketExtensions);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          const extensionNames = Object.keys(extensions);
          if (extensionNames.length !== 1 || extensionNames[0] !== PerMessageDeflate2.extensionName) {
            const message = "Server indicated an extension that was not requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          try {
            perMessageDeflate.accept(extensions[PerMessageDeflate2.extensionName]);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          websocket._extensions[PerMessageDeflate2.extensionName] = perMessageDeflate;
        }
        websocket.setSocket(socket, head, {
          allowSynchronousEvents: opts.allowSynchronousEvents,
          generateMask: opts.generateMask,
          maxPayload: opts.maxPayload,
          skipUTF8Validation: opts.skipUTF8Validation
        });
      });
      if (opts.finishRequest) {
        opts.finishRequest(req, websocket);
      } else {
        req.end();
      }
    }
    function emitErrorAndClose(websocket, err) {
      websocket._readyState = WebSocket2.CLOSING;
      websocket._errorEmitted = true;
      websocket.emit("error", err);
      websocket.emitClose();
    }
    function netConnect(options) {
      options.path = options.socketPath;
      return net.connect(options);
    }
    function tlsConnect(options) {
      options.path = void 0;
      if (!options.servername && options.servername !== "") {
        options.servername = net.isIP(options.host) ? "" : options.host;
      }
      return tls.connect(options);
    }
    function abortHandshake(websocket, stream, message) {
      websocket._readyState = WebSocket2.CLOSING;
      const err = new Error(message);
      Error.captureStackTrace(err, abortHandshake);
      if (stream.setHeader) {
        stream[kAborted] = true;
        stream.abort();
        if (stream.socket && !stream.socket.destroyed) {
          stream.socket.destroy();
        }
        process.nextTick(emitErrorAndClose, websocket, err);
      } else {
        stream.destroy(err);
        stream.once("error", websocket.emit.bind(websocket, "error"));
        stream.once("close", websocket.emitClose.bind(websocket));
      }
    }
    function sendAfterClose(websocket, data, cb) {
      if (data) {
        const length = isBlob(data) ? data.size : toBuffer(data).length;
        if (websocket._socket) websocket._sender._bufferedBytes += length;
        else websocket._bufferedAmount += length;
      }
      if (cb) {
        const err = new Error(
          `WebSocket is not open: readyState ${websocket.readyState} (${readyStates[websocket.readyState]})`
        );
        process.nextTick(cb, err);
      }
    }
    function receiverOnConclude(code, reason) {
      const websocket = this[kWebSocket];
      websocket._closeFrameReceived = true;
      websocket._closeMessage = reason;
      websocket._closeCode = code;
      if (websocket._socket[kWebSocket] === void 0) return;
      websocket._socket.removeListener("data", socketOnData);
      process.nextTick(resume, websocket._socket);
      if (code === 1005) websocket.close();
      else websocket.close(code, reason);
    }
    function receiverOnDrain() {
      const websocket = this[kWebSocket];
      if (!websocket.isPaused) websocket._socket.resume();
    }
    function receiverOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket._socket[kWebSocket] !== void 0) {
        websocket._socket.removeListener("data", socketOnData);
        process.nextTick(resume, websocket._socket);
        websocket.close(err[kStatusCode]);
      }
      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit("error", err);
      }
    }
    function receiverOnFinish() {
      this[kWebSocket].emitClose();
    }
    function receiverOnMessage(data, isBinary) {
      this[kWebSocket].emit("message", data, isBinary);
    }
    function receiverOnPing(data) {
      const websocket = this[kWebSocket];
      if (websocket._autoPong) websocket.pong(data, !this._isServer, NOOP);
      websocket.emit("ping", data);
    }
    function receiverOnPong(data) {
      this[kWebSocket].emit("pong", data);
    }
    function resume(stream) {
      stream.resume();
    }
    function senderOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket.readyState === WebSocket2.CLOSED) return;
      if (websocket.readyState === WebSocket2.OPEN) {
        websocket._readyState = WebSocket2.CLOSING;
        setCloseTimer(websocket);
      }
      this._socket.end();
      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit("error", err);
      }
    }
    function setCloseTimer(websocket) {
      websocket._closeTimer = setTimeout(
        websocket._socket.destroy.bind(websocket._socket),
        websocket._closeTimeout
      );
    }
    function socketOnClose() {
      const websocket = this[kWebSocket];
      this.removeListener("close", socketOnClose);
      this.removeListener("data", socketOnData);
      this.removeListener("end", socketOnEnd);
      websocket._readyState = WebSocket2.CLOSING;
      if (!this._readableState.endEmitted && !websocket._closeFrameReceived && !websocket._receiver._writableState.errorEmitted && this._readableState.length !== 0) {
        const chunk = this.read(this._readableState.length);
        websocket._receiver.write(chunk);
      }
      websocket._receiver.end();
      this[kWebSocket] = void 0;
      clearTimeout(websocket._closeTimer);
      if (websocket._receiver._writableState.finished || websocket._receiver._writableState.errorEmitted) {
        websocket.emitClose();
      } else {
        websocket._receiver.on("error", receiverOnFinish);
        websocket._receiver.on("finish", receiverOnFinish);
      }
    }
    function socketOnData(chunk) {
      if (!this[kWebSocket]._receiver.write(chunk)) {
        this.pause();
      }
    }
    function socketOnEnd() {
      const websocket = this[kWebSocket];
      websocket._readyState = WebSocket2.CLOSING;
      websocket._receiver.end();
      this.end();
    }
    function socketOnError() {
      const websocket = this[kWebSocket];
      this.removeListener("error", socketOnError);
      this.on("error", NOOP);
      if (websocket) {
        websocket._readyState = WebSocket2.CLOSING;
        this.destroy();
      }
    }
  }
});

// node_modules/ws/lib/stream.js
var require_stream = __commonJS({
  "node_modules/ws/lib/stream.js"(exports2, module2) {
    "use strict";
    var WebSocket2 = require_websocket();
    var { Duplex } = require("stream");
    function emitClose(stream) {
      stream.emit("close");
    }
    function duplexOnEnd() {
      if (!this.destroyed && this._writableState.finished) {
        this.destroy();
      }
    }
    function duplexOnError(err) {
      this.removeListener("error", duplexOnError);
      this.destroy();
      if (this.listenerCount("error") === 0) {
        this.emit("error", err);
      }
    }
    function createWebSocketStream2(ws, options) {
      let terminateOnDestroy = true;
      const duplex = new Duplex({
        ...options,
        autoDestroy: false,
        emitClose: false,
        objectMode: false,
        writableObjectMode: false
      });
      ws.on("message", function message(msg, isBinary) {
        const data = !isBinary && duplex._readableState.objectMode ? msg.toString() : msg;
        if (!duplex.push(data)) ws.pause();
      });
      ws.once("error", function error(err) {
        if (duplex.destroyed) return;
        terminateOnDestroy = false;
        duplex.destroy(err);
      });
      ws.once("close", function close() {
        if (duplex.destroyed) return;
        duplex.push(null);
      });
      duplex._destroy = function(err, callback) {
        if (ws.readyState === ws.CLOSED) {
          callback(err);
          process.nextTick(emitClose, duplex);
          return;
        }
        let called = false;
        ws.once("error", function error(err2) {
          called = true;
          callback(err2);
        });
        ws.once("close", function close() {
          if (!called) callback(err);
          process.nextTick(emitClose, duplex);
        });
        if (terminateOnDestroy) ws.terminate();
      };
      duplex._final = function(callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._final(callback);
          });
          return;
        }
        if (ws._socket === null) return;
        if (ws._socket._writableState.finished) {
          callback();
          if (duplex._readableState.endEmitted) duplex.destroy();
        } else {
          ws._socket.once("finish", function finish() {
            callback();
          });
          ws.close();
        }
      };
      duplex._read = function() {
        if (ws.isPaused) ws.resume();
      };
      duplex._write = function(chunk, encoding, callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._write(chunk, encoding, callback);
          });
          return;
        }
        ws.send(chunk, callback);
      };
      duplex.on("end", duplexOnEnd);
      duplex.on("error", duplexOnError);
      return duplex;
    }
    module2.exports = createWebSocketStream2;
  }
});

// node_modules/ws/lib/subprotocol.js
var require_subprotocol = __commonJS({
  "node_modules/ws/lib/subprotocol.js"(exports2, module2) {
    "use strict";
    var { tokenChars } = require_validation();
    function parse(header) {
      const protocols = /* @__PURE__ */ new Set();
      let start = -1;
      let end = -1;
      let i = 0;
      for (i; i < header.length; i++) {
        const code = header.charCodeAt(i);
        if (end === -1 && tokenChars[code] === 1) {
          if (start === -1) start = i;
        } else if (i !== 0 && (code === 32 || code === 9)) {
          if (end === -1 && start !== -1) end = i;
        } else if (code === 44) {
          if (start === -1) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
          if (end === -1) end = i;
          const protocol2 = header.slice(start, end);
          if (protocols.has(protocol2)) {
            throw new SyntaxError(`The "${protocol2}" subprotocol is duplicated`);
          }
          protocols.add(protocol2);
          start = end = -1;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      }
      if (start === -1 || end !== -1) {
        throw new SyntaxError("Unexpected end of input");
      }
      const protocol = header.slice(start, i);
      if (protocols.has(protocol)) {
        throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
      }
      protocols.add(protocol);
      return protocols;
    }
    module2.exports = { parse };
  }
});

// node_modules/ws/lib/websocket-server.js
var require_websocket_server = __commonJS({
  "node_modules/ws/lib/websocket-server.js"(exports2, module2) {
    "use strict";
    var EventEmitter8 = require("events");
    var http = require("http");
    var { Duplex } = require("stream");
    var { createHash: createHash3 } = require("crypto");
    var extension2 = require_extension();
    var PerMessageDeflate2 = require_permessage_deflate();
    var subprotocol2 = require_subprotocol();
    var WebSocket2 = require_websocket();
    var { CLOSE_TIMEOUT, GUID, kWebSocket } = require_constants();
    var keyRegex = /^[+/0-9A-Za-z]{22}==$/;
    var RUNNING = 0;
    var CLOSING = 1;
    var CLOSED = 2;
    var WebSocketServer2 = class extends EventEmitter8 {
      /**
       * Create a `WebSocketServer` instance.
       *
       * @param {Object} options Configuration options
       * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Boolean} [options.autoPong=true] Specifies whether or not to
       *     automatically send a pong in response to a ping
       * @param {Number} [options.backlog=511] The maximum length of the queue of
       *     pending connections
       * @param {Boolean} [options.clientTracking=true] Specifies whether or not to
       *     track clients
       * @param {Number} [options.closeTimeout=30000] Duration in milliseconds to
       *     wait for the closing handshake to finish after `websocket.close()` is
       *     called
       * @param {Function} [options.handleProtocols] A hook to handle protocols
       * @param {String} [options.host] The hostname where to bind the server
       * @param {Number} [options.maxPayload=104857600] The maximum allowed message
       *     size
       * @param {Boolean} [options.noServer=false] Enable no server mode
       * @param {String} [options.path] Accept only connections matching this path
       * @param {(Boolean|Object)} [options.perMessageDeflate=false] Enable/disable
       *     permessage-deflate
       * @param {Number} [options.port] The port where to bind the server
       * @param {(http.Server|https.Server)} [options.server] A pre-created HTTP/S
       *     server to use
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @param {Function} [options.verifyClient] A hook to reject connections
       * @param {Function} [options.WebSocket=WebSocket] Specifies the `WebSocket`
       *     class to use. It must be the `WebSocket` class or class that extends it
       * @param {Function} [callback] A listener for the `listening` event
       */
      constructor(options, callback) {
        super();
        options = {
          allowSynchronousEvents: true,
          autoPong: true,
          maxPayload: 100 * 1024 * 1024,
          skipUTF8Validation: false,
          perMessageDeflate: false,
          handleProtocols: null,
          clientTracking: true,
          closeTimeout: CLOSE_TIMEOUT,
          verifyClient: null,
          noServer: false,
          backlog: null,
          // use default (511 as implemented in net.js)
          server: null,
          host: null,
          path: null,
          port: null,
          WebSocket: WebSocket2,
          ...options
        };
        if (options.port == null && !options.server && !options.noServer || options.port != null && (options.server || options.noServer) || options.server && options.noServer) {
          throw new TypeError(
            'One and only one of the "port", "server", or "noServer" options must be specified'
          );
        }
        if (options.port != null) {
          this._server = http.createServer((req, res) => {
            const body = http.STATUS_CODES[426];
            res.writeHead(426, {
              "Content-Length": body.length,
              "Content-Type": "text/plain"
            });
            res.end(body);
          });
          this._server.listen(
            options.port,
            options.host,
            options.backlog,
            callback
          );
        } else if (options.server) {
          this._server = options.server;
        }
        if (this._server) {
          const emitConnection = this.emit.bind(this, "connection");
          this._removeListeners = addListeners(this._server, {
            listening: this.emit.bind(this, "listening"),
            error: this.emit.bind(this, "error"),
            upgrade: (req, socket, head) => {
              this.handleUpgrade(req, socket, head, emitConnection);
            }
          });
        }
        if (options.perMessageDeflate === true) options.perMessageDeflate = {};
        if (options.clientTracking) {
          this.clients = /* @__PURE__ */ new Set();
          this._shouldEmitClose = false;
        }
        this.options = options;
        this._state = RUNNING;
      }
      /**
       * Returns the bound address, the address family name, and port of the server
       * as reported by the operating system if listening on an IP socket.
       * If the server is listening on a pipe or UNIX domain socket, the name is
       * returned as a string.
       *
       * @return {(Object|String|null)} The address of the server
       * @public
       */
      address() {
        if (this.options.noServer) {
          throw new Error('The server is operating in "noServer" mode');
        }
        if (!this._server) return null;
        return this._server.address();
      }
      /**
       * Stop the server from accepting new connections and emit the `'close'` event
       * when all existing connections are closed.
       *
       * @param {Function} [cb] A one-time listener for the `'close'` event
       * @public
       */
      close(cb) {
        if (this._state === CLOSED) {
          if (cb) {
            this.once("close", () => {
              cb(new Error("The server is not running"));
            });
          }
          process.nextTick(emitClose, this);
          return;
        }
        if (cb) this.once("close", cb);
        if (this._state === CLOSING) return;
        this._state = CLOSING;
        if (this.options.noServer || this.options.server) {
          if (this._server) {
            this._removeListeners();
            this._removeListeners = this._server = null;
          }
          if (this.clients) {
            if (!this.clients.size) {
              process.nextTick(emitClose, this);
            } else {
              this._shouldEmitClose = true;
            }
          } else {
            process.nextTick(emitClose, this);
          }
        } else {
          const server = this._server;
          this._removeListeners();
          this._removeListeners = this._server = null;
          server.close(() => {
            emitClose(this);
          });
        }
      }
      /**
       * See if a given request should be handled by this server instance.
       *
       * @param {http.IncomingMessage} req Request object to inspect
       * @return {Boolean} `true` if the request is valid, else `false`
       * @public
       */
      shouldHandle(req) {
        if (this.options.path) {
          const index = req.url.indexOf("?");
          const pathname = index !== -1 ? req.url.slice(0, index) : req.url;
          if (pathname !== this.options.path) return false;
        }
        return true;
      }
      /**
       * Handle a HTTP Upgrade request.
       *
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @public
       */
      handleUpgrade(req, socket, head, cb) {
        socket.on("error", socketOnError);
        const key = req.headers["sec-websocket-key"];
        const upgrade = req.headers.upgrade;
        const version = +req.headers["sec-websocket-version"];
        if (req.method !== "GET") {
          const message = "Invalid HTTP method";
          abortHandshakeOrEmitwsClientError(this, req, socket, 405, message);
          return;
        }
        if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
          const message = "Invalid Upgrade header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (key === void 0 || !keyRegex.test(key)) {
          const message = "Missing or invalid Sec-WebSocket-Key header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (version !== 13 && version !== 8) {
          const message = "Missing or invalid Sec-WebSocket-Version header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message, {
            "Sec-WebSocket-Version": "13, 8"
          });
          return;
        }
        if (!this.shouldHandle(req)) {
          abortHandshake(socket, 400);
          return;
        }
        const secWebSocketProtocol = req.headers["sec-websocket-protocol"];
        let protocols = /* @__PURE__ */ new Set();
        if (secWebSocketProtocol !== void 0) {
          try {
            protocols = subprotocol2.parse(secWebSocketProtocol);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Protocol header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        const secWebSocketExtensions = req.headers["sec-websocket-extensions"];
        const extensions = {};
        if (this.options.perMessageDeflate && secWebSocketExtensions !== void 0) {
          const perMessageDeflate = new PerMessageDeflate2({
            ...this.options.perMessageDeflate,
            isServer: true,
            maxPayload: this.options.maxPayload
          });
          try {
            const offers = extension2.parse(secWebSocketExtensions);
            if (offers[PerMessageDeflate2.extensionName]) {
              perMessageDeflate.accept(offers[PerMessageDeflate2.extensionName]);
              extensions[PerMessageDeflate2.extensionName] = perMessageDeflate;
            }
          } catch (err) {
            const message = "Invalid or unacceptable Sec-WebSocket-Extensions header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        if (this.options.verifyClient) {
          const info = {
            origin: req.headers[`${version === 8 ? "sec-websocket-origin" : "origin"}`],
            secure: !!(req.socket.authorized || req.socket.encrypted),
            req
          };
          if (this.options.verifyClient.length === 2) {
            this.options.verifyClient(info, (verified, code, message, headers) => {
              if (!verified) {
                return abortHandshake(socket, code || 401, message, headers);
              }
              this.completeUpgrade(
                extensions,
                key,
                protocols,
                req,
                socket,
                head,
                cb
              );
            });
            return;
          }
          if (!this.options.verifyClient(info)) return abortHandshake(socket, 401);
        }
        this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
      }
      /**
       * Upgrade the connection to WebSocket.
       *
       * @param {Object} extensions The accepted extensions
       * @param {String} key The value of the `Sec-WebSocket-Key` header
       * @param {Set} protocols The subprotocols
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @throws {Error} If called more than once with the same socket
       * @private
       */
      completeUpgrade(extensions, key, protocols, req, socket, head, cb) {
        if (!socket.readable || !socket.writable) return socket.destroy();
        if (socket[kWebSocket]) {
          throw new Error(
            "server.handleUpgrade() was called more than once with the same socket, possibly due to a misconfiguration"
          );
        }
        if (this._state > RUNNING) return abortHandshake(socket, 503);
        const digest = createHash3("sha1").update(key + GUID).digest("base64");
        const headers = [
          "HTTP/1.1 101 Switching Protocols",
          "Upgrade: websocket",
          "Connection: Upgrade",
          `Sec-WebSocket-Accept: ${digest}`
        ];
        const ws = new this.options.WebSocket(null, void 0, this.options);
        if (protocols.size) {
          const protocol = this.options.handleProtocols ? this.options.handleProtocols(protocols, req) : protocols.values().next().value;
          if (protocol) {
            headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
            ws._protocol = protocol;
          }
        }
        if (extensions[PerMessageDeflate2.extensionName]) {
          const params = extensions[PerMessageDeflate2.extensionName].params;
          const value = extension2.format({
            [PerMessageDeflate2.extensionName]: [params]
          });
          headers.push(`Sec-WebSocket-Extensions: ${value}`);
          ws._extensions = extensions;
        }
        this.emit("headers", headers, req);
        socket.write(headers.concat("\r\n").join("\r\n"));
        socket.removeListener("error", socketOnError);
        ws.setSocket(socket, head, {
          allowSynchronousEvents: this.options.allowSynchronousEvents,
          maxPayload: this.options.maxPayload,
          skipUTF8Validation: this.options.skipUTF8Validation
        });
        if (this.clients) {
          this.clients.add(ws);
          ws.on("close", () => {
            this.clients.delete(ws);
            if (this._shouldEmitClose && !this.clients.size) {
              process.nextTick(emitClose, this);
            }
          });
        }
        cb(ws, req);
      }
    };
    module2.exports = WebSocketServer2;
    function addListeners(server, map) {
      for (const event of Object.keys(map)) server.on(event, map[event]);
      return function removeListeners() {
        for (const event of Object.keys(map)) {
          server.removeListener(event, map[event]);
        }
      };
    }
    function emitClose(server) {
      server._state = CLOSED;
      server.emit("close");
    }
    function socketOnError() {
      this.destroy();
    }
    function abortHandshake(socket, code, message, headers) {
      message = message || http.STATUS_CODES[code];
      headers = {
        Connection: "close",
        "Content-Type": "text/html",
        "Content-Length": Buffer.byteLength(message),
        ...headers
      };
      socket.once("finish", socket.destroy);
      socket.end(
        `HTTP/1.1 ${code} ${http.STATUS_CODES[code]}\r
` + Object.keys(headers).map((h) => `${h}: ${headers[h]}`).join("\r\n") + "\r\n\r\n" + message
      );
    }
    function abortHandshakeOrEmitwsClientError(server, req, socket, code, message, headers) {
      if (server.listenerCount("wsClientError")) {
        const err = new Error(message);
        Error.captureStackTrace(err, abortHandshakeOrEmitwsClientError);
        server.emit("wsClientError", err, socket, req);
      } else {
        abortHandshake(socket, code, message, headers);
      }
    }
  }
});

// src/index.ts
var import_node_fs5 = require("fs");
var import_node_path3 = require("path");

// node_modules/@elgato/schemas/dist/streamdeck/plugins/index.mjs
var DeviceType;
(function(DeviceType2) {
  DeviceType2[DeviceType2["StreamDeck"] = 0] = "StreamDeck";
  DeviceType2[DeviceType2["StreamDeckMini"] = 1] = "StreamDeckMini";
  DeviceType2[DeviceType2["StreamDeckXL"] = 2] = "StreamDeckXL";
  DeviceType2[DeviceType2["StreamDeckMobile"] = 3] = "StreamDeckMobile";
  DeviceType2[DeviceType2["CorsairGKeys"] = 4] = "CorsairGKeys";
  DeviceType2[DeviceType2["StreamDeckPedal"] = 5] = "StreamDeckPedal";
  DeviceType2[DeviceType2["CorsairVoyager"] = 6] = "CorsairVoyager";
  DeviceType2[DeviceType2["StreamDeckPlus"] = 7] = "StreamDeckPlus";
  DeviceType2[DeviceType2["SCUFController"] = 8] = "SCUFController";
  DeviceType2[DeviceType2["StreamDeckNeo"] = 9] = "StreamDeckNeo";
  DeviceType2[DeviceType2["StreamDeckStudio"] = 10] = "StreamDeckStudio";
  DeviceType2[DeviceType2["VirtualStreamDeck"] = 11] = "VirtualStreamDeck";
  DeviceType2[DeviceType2["Galleon100SD"] = 12] = "Galleon100SD";
  DeviceType2[DeviceType2["StreamDeckPlusXL"] = 13] = "StreamDeckPlusXL";
})(DeviceType || (DeviceType = {}));
var BarSubType;
(function(BarSubType2) {
  BarSubType2[BarSubType2["Rectangle"] = 0] = "Rectangle";
  BarSubType2[BarSubType2["DoubleRectangle"] = 1] = "DoubleRectangle";
  BarSubType2[BarSubType2["Trapezoid"] = 2] = "Trapezoid";
  BarSubType2[BarSubType2["DoubleTrapezoid"] = 3] = "DoubleTrapezoid";
  BarSubType2[BarSubType2["Groove"] = 4] = "Groove";
})(BarSubType || (BarSubType = {}));

// node_modules/ws/wrapper.mjs
var import_stream = __toESM(require_stream(), 1);
var import_extension = __toESM(require_extension(), 1);
var import_permessage_deflate = __toESM(require_permessage_deflate(), 1);
var import_receiver = __toESM(require_receiver(), 1);
var import_sender = __toESM(require_sender(), 1);
var import_subprotocol = __toESM(require_subprotocol(), 1);
var import_websocket = __toESM(require_websocket(), 1);
var import_websocket_server = __toESM(require_websocket_server(), 1);
var wrapper_default = import_websocket.default;

// node_modules/@elgato/streamdeck/dist/index.js
var import_node_path = __toESM(require("path"), 1);
var import_node_process = require("process");
var import_node_fs = __toESM(require("fs"), 1);
var supportedLanguages = ["de", "en", "es", "fr", "ja", "ko", "zh_CN", "zh_TW"];
var RegistrationParameter;
(function(RegistrationParameter2) {
  RegistrationParameter2["Port"] = "-port";
  RegistrationParameter2["Info"] = "-info";
  RegistrationParameter2["PluginUUID"] = "-pluginUUID";
  RegistrationParameter2["RegisterEvent"] = "-registerEvent";
})(RegistrationParameter || (RegistrationParameter = {}));
var Target;
(function(Target2) {
  Target2[Target2["HardwareAndSoftware"] = 0] = "HardwareAndSoftware";
  Target2[Target2["Hardware"] = 1] = "Hardware";
  Target2[Target2["Software"] = 2] = "Software";
})(Target || (Target = {}));
function freeze(value) {
  if (value !== void 0 && value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach(freeze);
  }
}
function get(path2, source) {
  const props = path2.split(".");
  return props.reduce((obj, prop) => obj && obj[prop], source);
}
var I18nProvider = class _I18nProvider {
  language;
  readTranslations;
  /**
   * Default language to be used when a resource does not exist for the desired language.
   */
  static DEFAULT_LANGUAGE = "en";
  /**
   * Map of localized resources, indexed by their language.
   */
  _translations = /* @__PURE__ */ new Map();
  /**
   * Initializes a new instance of the {@link I18nProvider} class.
   * @param language The default language to be used when retrieving translations for a given key.
   * @param readTranslations Function responsible for loading translations.
   */
  constructor(language, readTranslations) {
    this.language = language;
    this.readTranslations = readTranslations;
  }
  /**
   * Translates the specified {@link key}, as defined within the resources for the {@link language}. When the key is not found, the default language is checked.
   *
   * Alias of `I18nProvider.translate(string, Language)`
   * @param key Key of the translation.
   * @param language Optional language to get the translation for; otherwise the default language.
   * @returns The translation; otherwise the key.
   */
  t(key, language = this.language) {
    return this.translate(key, language);
  }
  /**
   * Translates the specified {@link key}, as defined within the resources for the {@link language}. When the key is not found, the default language is checked.
   * @param key Key of the translation.
   * @param language Optional language to get the translation for; otherwise the default language.
   * @returns The translation; otherwise the key.
   */
  translate(key, language = this.language) {
    if (language === _I18nProvider.DEFAULT_LANGUAGE) {
      return get(key, this.getTranslations(language))?.toString() || key;
    }
    return get(key, this.getTranslations(language))?.toString() || get(key, this.getTranslations(_I18nProvider.DEFAULT_LANGUAGE))?.toString() || key;
  }
  /**
   * Gets the translations for the specified language.
   * @param language Language whose translations are being retrieved.
   * @returns The translations, otherwise `null`.
   */
  getTranslations(language) {
    let translations = this._translations.get(language);
    if (translations === void 0) {
      translations = supportedLanguages.includes(language) ? this.readTranslations(language) : null;
      freeze(translations);
      this._translations.set(language, translations);
    }
    return translations;
  }
};
function parseLocalizations(contents) {
  const json = JSON.parse(contents);
  if (json !== void 0 && json !== null && typeof json === "object" && "Localization" in json) {
    return json["Localization"];
  }
  throw new TypeError(`Translations must be a JSON object nested under a property named "Localization"`);
}
var LogLevel;
(function(LogLevel2) {
  LogLevel2[LogLevel2["ERROR"] = 0] = "ERROR";
  LogLevel2[LogLevel2["WARN"] = 1] = "WARN";
  LogLevel2[LogLevel2["INFO"] = 2] = "INFO";
  LogLevel2[LogLevel2["DEBUG"] = 3] = "DEBUG";
  LogLevel2[LogLevel2["TRACE"] = 4] = "TRACE";
})(LogLevel || (LogLevel = {}));
var ConsoleTarget = class {
  /**
   * @inheritdoc
   */
  write(entry) {
    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(...entry.data);
        break;
      case LogLevel.WARN:
        console.warn(...entry.data);
        break;
      default:
        console.log(...entry.data);
    }
  }
};
var EOL = "\n";
function stringFormatter(opts) {
  {
    return (entry) => {
      const { data, level, scope } = entry;
      let prefix = `${(/* @__PURE__ */ new Date()).toISOString()} ${LogLevel[level].padEnd(5)} `;
      if (scope) {
        prefix += `${scope}: `;
      }
      return `${prefix}${reduce(data)}`;
    };
  }
}
function reduce(data) {
  let result = "";
  let previousWasError = false;
  for (const value of data) {
    if (typeof value === "object" && value instanceof Error) {
      result += `${EOL}${value.stack}`;
      previousWasError = true;
      continue;
    }
    if (previousWasError) {
      result += EOL;
      previousWasError = false;
    }
    result += typeof value === "object" ? JSON.stringify(value) : value;
    result += " ";
  }
  return result.trimEnd();
}
var Logger = class _Logger {
  /**
   * Backing field for the {@link Logger.level}.
   */
  _level;
  /**
   * Options that define the loggers behavior.
   */
  options;
  /**
   * Scope associated with this {@link Logger}.
   */
  scope;
  /**
   * Initializes a new instance of the {@link Logger} class.
   * @param opts Options that define the loggers behavior.
   */
  constructor(opts) {
    this.options = { minimumLevel: LogLevel.TRACE, ...opts };
    this.scope = this.options.scope === void 0 || this.options.scope.trim() === "" ? "" : this.options.scope;
    if (typeof this.options.level !== "function") {
      this.setLevel(this.options.level);
    }
  }
  /**
   * Gets the {@link LogLevel}.
   * @returns The {@link LogLevel}.
   */
  get level() {
    if (this._level !== void 0) {
      return this._level;
    }
    return typeof this.options.level === "function" ? this.options.level() : this.options.level;
  }
  /**
   * Creates a scoped logger with the given {@link scope}; logs created by scoped-loggers include their scope to enable their source to be easily identified.
   * @param scope Value that represents the scope of the new logger.
   * @returns The scoped logger, or this instance when {@link scope} is not defined.
   */
  createScope(scope) {
    scope = scope.trim();
    if (scope === "") {
      return this;
    }
    return new _Logger({
      ...this.options,
      level: () => this.level,
      scope: this.options.scope ? `${this.options.scope}->${scope}` : scope
    });
  }
  /**
   * Writes the arguments as a debug log entry.
   * @param data Message or data to log.
   * @returns This instance for chaining.
   */
  debug(...data) {
    return this.write({ level: LogLevel.DEBUG, data, scope: this.scope });
  }
  /**
   * Writes the arguments as error log entry.
   * @param data Message or data to log.
   * @returns This instance for chaining.
   */
  error(...data) {
    return this.write({ level: LogLevel.ERROR, data, scope: this.scope });
  }
  /**
   * Writes the arguments as an info log entry.
   * @param data Message or data to log.
   * @returns This instance for chaining.
   */
  info(...data) {
    return this.write({ level: LogLevel.INFO, data, scope: this.scope });
  }
  /**
   * Sets the log-level that determines which logs should be written. The specified level will be inherited by all scoped loggers unless they have log-level explicitly defined.
   * @param level The log-level that determines which logs should be written; when `undefined`, the level will be inherited from the parent logger, or default to the environment level.
   * @returns This instance for chaining.
   */
  setLevel(level) {
    if (level !== void 0 && level > this.options.minimumLevel) {
      this._level = LogLevel.INFO;
      this.warn(`Log level cannot be set to ${LogLevel[level]} whilst not in debug mode.`);
    } else {
      this._level = level;
    }
    return this;
  }
  /**
   * Writes the arguments as a trace log entry.
   * @param data Message or data to log.
   * @returns This instance for chaining.
   */
  trace(...data) {
    return this.write({ level: LogLevel.TRACE, data, scope: this.scope });
  }
  /**
   * Writes the arguments as a warning log entry.
   * @param data Message or data to log.
   * @returns This instance for chaining.
   */
  warn(...data) {
    return this.write({ level: LogLevel.WARN, data, scope: this.scope });
  }
  /**
   * Writes the log entry.
   * @param entry Log entry to write.
   * @returns This instance for chaining.
   */
  write(entry) {
    if (entry.level <= this.level) {
      this.options.targets.forEach((t) => t.write(entry));
    }
    return this;
  }
};
Symbol.dispose ??= /* @__PURE__ */ Symbol("Symbol.dispose");
function deferredDisposable(dispose) {
  let isDisposed = false;
  const guardedDispose = () => {
    if (!isDisposed) {
      dispose();
      isDisposed = true;
    }
  };
  return {
    [Symbol.dispose]: guardedDispose,
    dispose: guardedDispose
  };
}
var EventEmitter = class {
  /**
   * Underlying collection of events and their listeners.
   */
  events = /* @__PURE__ */ new Map();
  /**
   * Adds the event {@link listener} for the event named {@link eventName}.
   * @param eventName Name of the event.
   * @param listener Event handler function.
   * @returns This instance with the {@link listener} added.
   */
  addListener(eventName, listener) {
    return this.on(eventName, listener);
  }
  /**
   * Adds the event {@link listener} for the event named {@link eventName}, and returns a disposable capable of removing the event listener.
   * @param eventName Name of the event.
   * @param listener Event handler function.
   * @returns A disposable that removes the listener when disposed.
   */
  disposableOn(eventName, listener) {
    this.addListener(eventName, listener);
    return deferredDisposable(() => this.removeListener(eventName, listener));
  }
  /**
   * Emits the {@link eventName}, invoking all event listeners with the specified {@link args}.
   * @param eventName Name of the event.
   * @param args Arguments supplied to each event listener.
   * @returns `true` when there was a listener associated with the event; otherwise `false`.
   */
  emit(eventName, ...args) {
    const listeners = this.events.get(eventName);
    if (listeners === void 0) {
      return false;
    }
    for (let i = 0; i < listeners.length; ) {
      const { listener, once } = listeners[i];
      if (once) {
        listeners.splice(i, 1);
      } else {
        i++;
      }
      listener(...args);
    }
    return true;
  }
  /**
   * Gets the event names with event listeners.
   * @returns Event names.
   */
  eventNames() {
    return Array.from(this.events.keys());
  }
  /**
   * Gets the number of event listeners for the event named {@link eventName}. When a {@link listener} is defined, only matching event listeners are counted.
   * @param eventName Name of the event.
   * @param listener Optional event listener to count.
   * @returns Number of event listeners.
   */
  listenerCount(eventName, listener) {
    const listeners = this.events.get(eventName);
    if (listeners === void 0 || listener == void 0) {
      return listeners?.length || 0;
    }
    let count = 0;
    listeners.forEach((ev) => {
      if (ev.listener === listener) {
        count++;
      }
    });
    return count;
  }
  /**
   * Gets the event listeners for the event named {@link eventName}.
   * @param eventName Name of the event.
   * @returns The event listeners.
   */
  listeners(eventName) {
    return Array.from(this.events.get(eventName) || []).map(({ listener }) => listener);
  }
  /**
   * Removes the event {@link listener} for the event named {@link eventName}.
   * @param eventName Name of the event.
   * @param listener Event handler function.
   * @returns This instance with the event {@link listener} removed.
   */
  off(eventName, listener) {
    const listeners = this.events.get(eventName) || [];
    for (let i = listeners.length - 1; i >= 0; i--) {
      if (listeners[i].listener === listener) {
        listeners.splice(i, 1);
      }
    }
    return this;
  }
  /**
   * Adds the event {@link listener} for the event named {@link eventName}.
   * @param eventName Name of the event.
   * @param listener Event handler function.
   * @returns This instance with the event {@link listener} added.
   */
  on(eventName, listener) {
    return this.add(eventName, (listeners) => listeners.push({ listener }));
  }
  /**
   * Adds the **one-time** event {@link listener} for the event named {@link eventName}.
   * @param eventName Name of the event.
   * @param listener Event handler function.
   * @returns This instance with the event {@link listener} added.
   */
  once(eventName, listener) {
    return this.add(eventName, (listeners) => listeners.push({ listener, once: true }));
  }
  /**
   * Adds the event {@link listener} to the beginning of the listeners for the event named {@link eventName}.
   * @param eventName Name of the event.
   * @param listener Event handler function.
   * @returns This instance with the event {@link listener} prepended.
   */
  prependListener(eventName, listener) {
    return this.add(eventName, (listeners) => listeners.splice(0, 0, { listener }));
  }
  /**
   * Adds the **one-time** event {@link listener} to the beginning of the listeners for the event named {@link eventName}.
   * @param eventName Name of the event.
   * @param listener Event handler function.
   * @returns This instance with the event {@link listener} prepended.
   */
  prependOnceListener(eventName, listener) {
    return this.add(eventName, (listeners) => listeners.splice(0, 0, { listener, once: true }));
  }
  /**
   * Removes all event listeners for the event named {@link eventName}.
   * @param eventName Name of the event.
   * @returns This instance with the event listeners removed
   */
  removeAllListeners(eventName) {
    this.events.delete(eventName);
    return this;
  }
  /**
   * Removes the event {@link listener} for the event named {@link eventName}.
   * @param eventName Name of the event.
   * @param listener Event handler function.
   * @returns This instance with the event {@link listener} removed.
   */
  removeListener(eventName, listener) {
    return this.off(eventName, listener);
  }
  /**
   * Adds the event {@link listener} for the event named {@link eventName}.
   * @param eventName Name of the event.
   * @param fn Function responsible for adding the new event handler function.
   * @returns This instance with event {@link listener} added.
   */
  add(eventName, fn) {
    let listeners = this.events.get(eventName);
    if (listeners === void 0) {
      listeners = [];
      this.events.set(eventName, listeners);
    }
    fn(listeners);
    return this;
  }
};
function isRequest(value) {
  return isMessage(value, "request") && has(value, "unidirectional", "boolean");
}
function isResponse(value) {
  return isMessage(value, "response") && has(value, "status", "number");
}
function isMessage(value, type) {
  if (value === void 0 || value === null || typeof value !== "object") {
    return false;
  }
  if (!("__type" in value) || value.__type !== type) {
    return false;
  }
  return has(value, "id", "string") && has(value, "path", "string");
}
function has(obj, key, type) {
  return key in obj && typeof obj[key] === type;
}
var MessageResponder = class {
  request;
  proxy;
  /**
   * Indicates whether a response has already been sent in relation to the response.
   */
  _responded = false;
  /**
   * Initializes a new instance of the {@link MessageResponder} class.
   * @param request The request the response is associated with.
   * @param proxy Proxy responsible for forwarding the response to the client.
   */
  constructor(request, proxy) {
    this.request = request;
    this.proxy = proxy;
  }
  /**
   * Indicates whether a response can be sent.
   * @returns `true` when a response has not yet been set.
   */
  get canRespond() {
    return !this._responded;
  }
  /**
   * Sends a failure response with a status code of `500`.
   * @param body Optional response body.
   * @returns Promise fulfilled once the response has been sent.
   */
  fail(body) {
    return this.send(500, body);
  }
  /**
   * Sends the {@link body} as a response with the {@link status}
   * @param status Response status.
   * @param body Optional response body.
   * @returns Promise fulfilled once the response has been sent.
   */
  async send(status, body) {
    if (this.canRespond) {
      await this.proxy({
        __type: "response",
        id: this.request.id,
        path: this.request.path,
        body,
        status
      });
      this._responded = true;
    }
  }
  /**
   * Sends a success response with a status code of `200`.
   * @param body Optional response body.
   * @returns Promise fulfilled once the response has been sent.
   */
  success(body) {
    return this.send(200, body);
  }
};
var DEFAULT_TIMEOUT = 5e3;
var PUBLIC_PATH_PREFIX = "public:";
var INTERNAL_PATH_PREFIX = "internal:";
var MessageGateway = class extends EventEmitter {
  proxy;
  actionProvider;
  /**
   * Requests with pending responses.
   */
  requests = /* @__PURE__ */ new Map();
  /**
   * Registered routes, and their respective handlers.
   */
  routes = new EventEmitter();
  /**
   * Initializes a new instance of the {@link MessageGateway} class.
   * @param proxy Proxy capable of sending messages to the plugin / property inspector.
   * @param actionProvider Action provider responsible for retrieving actions associated with source messages.
   */
  constructor(proxy, actionProvider) {
    super();
    this.proxy = proxy;
    this.actionProvider = actionProvider;
  }
  /**
   * Sends the {@link requestOrPath} to the server; the server should be listening on {@link MessageGateway.route}.
   * @param requestOrPath The request, or the path of the request.
   * @param bodyOrUndefined Request body, or moot when constructing the request with {@link MessageRequestOptions}.
   * @returns The response.
   */
  async fetch(requestOrPath, bodyOrUndefined) {
    const id = crypto.randomUUID();
    const { body, path: path2, timeout = DEFAULT_TIMEOUT, unidirectional = false } = typeof requestOrPath === "string" ? { body: bodyOrUndefined, path: requestOrPath } : requestOrPath;
    const response = new Promise((resolve) => {
      this.requests.set(id, (res) => {
        if (res.status !== 408) {
          clearTimeout(timeoutMonitor);
        }
        resolve(res);
      });
    });
    const timeoutMonitor = setTimeout(() => this.handleResponse({ __type: "response", id, path: path2, status: 408 }), timeout);
    const accepted = await this.proxy({
      __type: "request",
      body,
      id,
      path: path2,
      unidirectional
    });
    if (!accepted) {
      this.handleResponse({ __type: "response", id, path: path2, status: 406 });
    }
    return response;
  }
  /**
   * Attempts to process the specified {@link message}.
   * @param message Message to process.
   * @returns `true` when the {@link message} was processed by this instance; otherwise `false`.
   */
  async process(message) {
    if (isRequest(message.payload)) {
      const action2 = this.actionProvider(message);
      if (await this.handleRequest(action2, message.payload)) {
        return;
      }
      this.emit("unhandledRequest", message);
    } else if (isResponse(message.payload) && this.handleResponse(message.payload)) {
      return;
    }
    this.emit("unhandledMessage", message);
  }
  /**
   * Maps the specified {@link path} to the {@link handler}, allowing for requests from the client.
   * @param path Path used to identify the route.
   * @param handler Handler to be invoked when the request is received.
   * @param options Optional routing configuration.
   * @returns Disposable capable of removing the route handler.
   */
  route(path2, handler, options) {
    options = { filter: () => true, ...options };
    return this.routes.disposableOn(path2, async (ev) => {
      if (options?.filter && options.filter(ev.request.action)) {
        await ev.routed();
        try {
          const result = await handler(ev.request, ev.responder);
          if (result !== void 0) {
            await ev.responder.send(200, result);
          }
        } catch (err) {
          await ev.responder.send(500);
          throw err;
        }
      }
    });
  }
  /**
   * Handles inbound requests.
   * @param action Action associated with the request.
   * @param source The request.
   * @returns `true` when the request was handled; otherwise `false`.
   */
  async handleRequest(action2, source) {
    const responder = new MessageResponder(source, this.proxy);
    const request = {
      action: action2,
      path: source.path,
      unidirectional: source.unidirectional,
      body: source.body
    };
    let routed = false;
    const routes = this.routes.listeners(source.path);
    for (const route of routes) {
      await route({
        request,
        responder,
        routed: async () => {
          if (request.unidirectional) {
            await responder.send(202);
          }
          routed = true;
        }
      });
    }
    if (routed) {
      await responder.send(200);
      return true;
    }
    await responder.send(501);
    return false;
  }
  /**
   * Handles inbound response.
   * @param res The response.
   * @returns `true` when the response was handled; otherwise `false`.
   */
  handleResponse(res) {
    const handler = this.requests.get(res.id);
    this.requests.delete(res.id);
    if (handler) {
      handler(new MessageResponse(res));
      return true;
    }
    return false;
  }
};
var MessageResponse = class {
  /**
   * Body of the response.
   */
  body;
  /**
   * Status of the response.
   * - `200` the request was successful.
   * - `202` the request was unidirectional, and does not have a response.
   * - `406` the request could not be accepted by the server.
   * - `408` the request timed-out.
   * - `500` the request failed.
   * - `501` the request is not implemented by the server, and could not be fulfilled.
   */
  status;
  /**
   * Initializes a new instance of the {@link MessageResponse} class.
   * @param res The status code, or the response.
   */
  constructor(res) {
    this.body = res.body;
    this.status = res.status;
  }
  /**
   * Indicates whether the request was successful.
   * @returns `true` when the status indicates a success; otherwise `false`.
   */
  get ok() {
    return this.status >= 200 && this.status < 300;
  }
};
var LOGGER_WRITE_PATH = `${INTERNAL_PATH_PREFIX}logger.write`;
function registerCreateLogEntryRoute(router2, logger2) {
  router2.route(LOGGER_WRITE_PATH, (req, res) => {
    if (req.body === void 0) {
      return res.fail();
    }
    const { level, message, scope } = req.body;
    if (level === void 0) {
      return res.fail();
    }
    logger2.write({ level, data: [message], scope });
    return res.success();
  });
}
var Event = class {
  /**
   * Event that occurred.
   */
  type;
  /**
   * Initializes a new instance of the {@link Event} class.
   * @param source Source of the event, i.e. the original message from Stream Deck.
   */
  constructor(source) {
    this.type = source.event;
  }
};
var ActionWithoutPayloadEvent = class extends Event {
  action;
  /**
   * Initializes a new instance of the {@link ActionWithoutPayloadEvent} class.
   * @param action Action that raised the event.
   * @param source Source of the event, i.e. the original message from Stream Deck.
   */
  constructor(action2, source) {
    super(source);
    this.action = action2;
  }
};
var ActionEvent = class extends ActionWithoutPayloadEvent {
  /**
   * Provides additional information about the event that occurred, e.g. how many `ticks` the dial was rotated, the current `state` of the action, etc.
   */
  payload;
  /**
   * Initializes a new instance of the {@link ActionEvent} class.
   * @param action Action that raised the event.
   * @param source Source of the event, i.e. the original message from Stream Deck.
   */
  constructor(action2, source) {
    super(action2, source);
    this.payload = source.payload;
  }
};
var DidReceiveGlobalSettingsEvent = class extends Event {
  /**
   * Settings associated with the event.
   */
  settings;
  /**
   * Initializes a new instance of the {@link DidReceiveGlobalSettingsEvent} class.
   * @param source Source of the event, i.e. the original message from Stream Deck.
   */
  constructor(source) {
    super(source);
    this.settings = source.payload.settings;
  }
};
var Lazy = class {
  /**
   * Private backing field for {@link Lazy.value}.
   */
  #value = void 0;
  /**
   * Factory responsible for instantiating the value.
   */
  #valueFactory;
  /**
   * Initializes a new instance of the {@link Lazy} class.
   * @param valueFactory The factory responsible for instantiating the value.
   */
  constructor(valueFactory) {
    this.#valueFactory = valueFactory;
  }
  /**
   * Gets the value.
   * @returns The value.
   */
  get value() {
    if (this.#value === void 0) {
      this.#value = this.#valueFactory();
    }
    return this.#value;
  }
};
var PromiseCompletionSource = class {
  /**
   * The underlying promise that this instance is managing.
   */
  _promise;
  /**
   * Delegate used to reject the promise.
   */
  _reject;
  /**
   * Delegate used to resolve the promise.
   */
  _resolve;
  /**
   * Wraps an underlying Promise{T}, exposing the resolve and reject delegates as methods, allowing for it to be awaited, resolved, or rejected externally.
   */
  constructor() {
    this._promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }
  /**
   * Gets the underlying promise being managed by this instance.
   * @returns The promise.
   */
  get promise() {
    return this._promise;
  }
  /**
   * Rejects the promise, causing any awaited calls to throw.
   * @param reason The reason for rejecting the promise.
   */
  setException(reason) {
    if (this._reject) {
      this._reject(reason);
    }
  }
  /**
   * Sets the result of the underlying promise, allowing any awaited calls to continue invocation.
   * @param value The value to resolve the promise with.
   */
  setResult(value) {
    if (this._resolve) {
      this._resolve(value);
    }
  }
};
var Version = class {
  /**
   * Build version number.
   */
  build;
  /**
   * Major version number.
   */
  major;
  /**
   * Minor version number.
   */
  minor;
  /**
   * Patch version number.
   */
  patch;
  /**
   * Initializes a new instance of the {@link Version} class.
   * @param value Value to parse the version from.
   */
  constructor(value) {
    const result = value.match(/^(0|[1-9]\d*)(?:\.(0|[1-9]\d*))?(?:\.(0|[1-9]\d*))?(?:\.(0|[1-9]\d*))?$/);
    if (result === null) {
      throw new Error(`Invalid format; expected "{major}[.{minor}[.{patch}[.{build}]]]" but was "${value}"`);
    }
    [, this.major, this.minor, this.patch, this.build] = [...result.map((value2) => parseInt(value2) || 0)];
  }
  /**
   * Compares this instance to the {@link other} {@link Version}.
   * @param other The {@link Version} to compare to.
   * @returns `-1` when this instance is less than the {@link other}, `1` when this instance is greater than {@link other}, otherwise `0`.
   */
  compareTo(other) {
    const segments = ({ major, minor, build, patch }) => [major, minor, build, patch];
    const thisSegments = segments(this);
    const otherSegments = segments(other);
    for (let i = 0; i < 4; i++) {
      if (thisSegments[i] < otherSegments[i]) {
        return -1;
      } else if (thisSegments[i] > otherSegments[i]) {
        return 1;
      }
    }
    return 0;
  }
  /** @inheritdoc */
  toString() {
    return `${this.major}.${this.minor}`;
  }
};
var __isDebugMode = void 0;
function isDebugMode() {
  if (__isDebugMode === void 0) {
    __isDebugMode = process.execArgv.some((arg) => {
      const name = arg.split("=")[0];
      return name === "--inspect" || name === "--inspect-brk" || name === "--inspect-port";
    });
  }
  return __isDebugMode;
}
function getPluginUUID() {
  const name = import_node_path.default.basename(process.cwd());
  const suffixIndex = name.lastIndexOf(".sdPlugin");
  return suffixIndex < 0 ? name : name.substring(0, suffixIndex);
}
var FileTarget = class {
  options;
  /**
   * File path where logs will be written.
   */
  filePath;
  /**
   * Current size of the logs that have been written to the {@link FileTarget.filePath}.
   */
  size = 0;
  /**
   * Initializes a new instance of the {@link FileTarget} class.
   * @param options Options that defines how logs should be written to the local file system.
   */
  constructor(options) {
    this.options = options;
    this.filePath = this.getLogFilePath();
    this.reIndex();
  }
  /**
   * @inheritdoc
   */
  write(entry) {
    const fd = import_node_fs.default.openSync(this.filePath, "a");
    try {
      const msg = this.options.format(entry);
      import_node_fs.default.writeSync(fd, msg + "\n");
      this.size += msg.length;
    } finally {
      import_node_fs.default.closeSync(fd);
    }
    if (this.size >= this.options.maxSize) {
      this.reIndex();
      this.size = 0;
    }
  }
  /**
   * Gets the file path to an indexed log file.
   * @param index Optional index of the log file to be included as part of the file name.
   * @returns File path that represents the indexed log file.
   */
  getLogFilePath(index = 0) {
    return import_node_path.default.join(this.options.dest, `${this.options.fileName}.${index}.log`);
  }
  /**
   * Gets the log files associated with this file target, including past and present.
   * @returns Log file entries.
   */
  getLogFiles() {
    const regex = /^\.(\d+)\.log$/;
    return import_node_fs.default.readdirSync(this.options.dest, { withFileTypes: true }).reduce((prev, entry) => {
      if (entry.isDirectory() || entry.name.indexOf(this.options.fileName) < 0) {
        return prev;
      }
      const match = entry.name.substring(this.options.fileName.length).match(regex);
      if (match?.length !== 2) {
        return prev;
      }
      prev.push({
        path: import_node_path.default.join(this.options.dest, entry.name),
        index: parseInt(match[1])
      });
      return prev;
    }, []).sort(({ index: a }, { index: b }) => {
      return a < b ? -1 : a > b ? 1 : 0;
    });
  }
  /**
   * Re-indexes the existing log files associated with this file target, removing old log files whose index exceeds the {@link FileTargetOptions.maxFileCount}, and renaming the
   * remaining log files, leaving index "0" free for a new log file.
   */
  reIndex() {
    if (!import_node_fs.default.existsSync(this.options.dest)) {
      import_node_fs.default.mkdirSync(this.options.dest);
      return;
    }
    const logFiles = this.getLogFiles();
    for (let i = logFiles.length - 1; i >= 0; i--) {
      const log2 = logFiles[i];
      if (i >= this.options.maxFileCount - 1) {
        import_node_fs.default.rmSync(log2.path);
      } else {
        import_node_fs.default.renameSync(log2.path, this.getLogFilePath(i + 1));
      }
    }
  }
};
var fileTarget = new FileTarget({
  dest: import_node_path.default.join((0, import_node_process.cwd)(), "logs"),
  fileName: getPluginUUID(),
  format: stringFormatter(),
  maxFileCount: 10,
  maxSize: 50 * 1024 * 1024
});
var targets = [fileTarget];
if (isDebugMode()) {
  targets.splice(0, 0, new ConsoleTarget());
}
var logger = new Logger({
  level: isDebugMode() ? LogLevel.DEBUG : LogLevel.INFO,
  minimumLevel: isDebugMode() ? LogLevel.TRACE : LogLevel.DEBUG,
  targets
});
process.once("uncaughtException", (err) => logger.error("Process encountered uncaught exception", err));
var Connection = class extends EventEmitter {
  /**
   * Private backing field for {@link Connection.registrationParameters}.
   */
  _registrationParameters;
  /**
   * Private backing field for {@link Connection.version}.
   */
  _version;
  /**
   * Used to ensure {@link Connection.connect} is invoked as a singleton; `false` when a connection is occurring or established.
   */
  canConnect = true;
  /**
   * Underlying web socket connection.
   */
  connection = new PromiseCompletionSource();
  /**
   * Logger scoped to the connection.
   */
  logger = logger.createScope("Connection");
  /**
   * Underlying connection information provided to the plugin to establish a connection with Stream Deck.
   * @returns The registration parameters.
   */
  get registrationParameters() {
    return this._registrationParameters ??= this.getRegistrationParameters();
  }
  /**
   * Version of Stream Deck this instance is connected to.
   * @returns The version.
   */
  get version() {
    return this._version ??= new Version(this.registrationParameters.info.application.version);
  }
  /**
   * Establishes a connection with the Stream Deck, allowing for the plugin to send and receive messages.
   * @returns A promise that is resolved when a connection has been established.
   */
  async connect() {
    if (this.canConnect) {
      this.canConnect = false;
      const webSocket = new wrapper_default(`ws://127.0.0.1:${this.registrationParameters.port}`);
      webSocket.onmessage = (ev) => this.tryEmit(ev);
      webSocket.onopen = () => {
        webSocket.send(JSON.stringify({
          event: this.registrationParameters.registerEvent,
          uuid: this.registrationParameters.pluginUUID
        }));
        this.connection.setResult(webSocket);
        this.emit("connected", this.registrationParameters.info);
      };
    }
    await this.connection.promise;
  }
  /**
   * Sends the commands to the Stream Deck, once the connection has been established and registered.
   * @param command Command being sent.
   * @returns `Promise` resolved when the command is sent to Stream Deck.
   */
  async send(command) {
    const connection2 = await this.connection.promise;
    const message = JSON.stringify(command);
    this.logger.trace(message);
    connection2.send(message);
  }
  /**
   * Gets the registration parameters, provided by Stream Deck, that provide information to the plugin, including how to establish a connection.
   * @returns Parsed registration parameters.
   */
  getRegistrationParameters() {
    const params = {
      port: void 0,
      info: void 0,
      pluginUUID: void 0,
      registerEvent: void 0
    };
    const scopedLogger = logger.createScope("RegistrationParameters");
    for (let i = 0; i < process.argv.length - 1; i++) {
      const param = process.argv[i];
      const value = process.argv[++i];
      switch (param) {
        case RegistrationParameter.Port:
          scopedLogger.debug(`port=${value}`);
          params.port = value;
          break;
        case RegistrationParameter.PluginUUID:
          scopedLogger.debug(`pluginUUID=${value}`);
          params.pluginUUID = value;
          break;
        case RegistrationParameter.RegisterEvent:
          scopedLogger.debug(`registerEvent=${value}`);
          params.registerEvent = value;
          break;
        case RegistrationParameter.Info:
          scopedLogger.debug(`info=${value}`);
          params.info = JSON.parse(value);
          break;
        default:
          i--;
          break;
      }
    }
    const invalidArgs = [];
    const validate = (name, value) => {
      if (value === void 0) {
        invalidArgs.push(name);
      }
    };
    validate(RegistrationParameter.Port, params.port);
    validate(RegistrationParameter.PluginUUID, params.pluginUUID);
    validate(RegistrationParameter.RegisterEvent, params.registerEvent);
    validate(RegistrationParameter.Info, params.info);
    if (invalidArgs.length > 0) {
      throw new Error(`Unable to establish a connection with Stream Deck, missing command line arguments: ${invalidArgs.join(", ")}`);
    }
    return params;
  }
  /**
   * Attempts to emit the {@link ev} that was received from the {@link Connection.connection}.
   * @param ev Event message data received from Stream Deck.
   */
  tryEmit(ev) {
    try {
      const message = JSON.parse(ev.data.toString());
      if (message.event) {
        this.logger.trace(ev.data.toString());
        this.emit(message.event, message);
      } else {
        this.logger.warn(`Received unknown message: ${ev.data}`);
      }
    } catch (err) {
      this.logger.error(`Failed to parse message: ${ev.data}`, err);
    }
  }
};
var connection = new Connection();
var manifest$1;
var softwareMinimumVersion;
function getSoftwareMinimumVersion() {
  return softwareMinimumVersion ??= new Version(getManifest().Software.MinimumVersion);
}
function getManifest() {
  return manifest$1 ??= readManifest();
}
function readManifest() {
  const path2 = (0, import_node_path.join)(process.cwd(), "manifest.json");
  if (!(0, import_node_fs.existsSync)(path2)) {
    throw new Error("Failed to read manifest.json as the file does not exist.");
  }
  return JSON.parse((0, import_node_fs.readFileSync)(path2, {
    encoding: "utf-8",
    flag: "r"
  }).toString());
}
var Enumerable = class _Enumerable {
  /**
   * Backing function responsible for providing the iterator of items.
   */
  #items;
  /**
   * Backing function for {@link Enumerable.length}.
   */
  #length;
  /**
   * Captured iterator from the underlying iterable; used to fulfil {@link IterableIterator} methods.
   */
  #iterator;
  /**
   * Initializes a new instance of the {@link Enumerable} class.
   * @param source Source that contains the items.
   * @returns The enumerable.
   */
  constructor(source) {
    if (source instanceof _Enumerable) {
      this.#items = source.#items;
      this.#length = source.#length;
    } else if (Array.isArray(source)) {
      this.#items = () => source.values();
      this.#length = () => source.length;
    } else if (source instanceof Map || source instanceof Set) {
      this.#items = () => source.values();
      this.#length = () => source.size;
    } else {
      this.#items = source;
      this.#length = () => {
        let i = 0;
        for (const _ of this) {
          i++;
        }
        return i;
      };
    }
  }
  /**
   * Gets the number of items in the enumerable.
   * @returns The number of items.
   */
  get length() {
    return this.#length();
  }
  /**
   * Gets the iterator for the enumerable.
   * @yields The items.
   */
  *[Symbol.iterator]() {
    for (const item of this.#items()) {
      yield item;
    }
  }
  /**
   * Transforms each item within this iterator to an indexed pair, with each pair represented as an array.
   * @returns An iterator of indexed pairs.
   */
  asIndexedPairs() {
    return new _Enumerable(function* () {
      let i = 0;
      for (const item of this) {
        yield [i++, item];
      }
    }.bind(this));
  }
  /**
   * Returns an iterator with the first items dropped, up to the specified limit.
   * @param limit The number of elements to drop from the start of the iteration.
   * @returns An iterator of items after the limit.
   */
  drop(limit) {
    if (isNaN(limit) || limit < 0) {
      throw new RangeError("limit must be 0, or a positive number");
    }
    return new _Enumerable(function* () {
      let i = 0;
      for (const item of this) {
        if (i++ >= limit) {
          yield item;
        }
      }
    }.bind(this));
  }
  /**
   * Determines whether all items satisfy the specified predicate.
   * @param predicate Function that determines whether each item fulfils the predicate.
   * @returns `true` when all items satisfy the predicate; otherwise `false`.
   */
  every(predicate) {
    for (const item of this) {
      if (!predicate(item)) {
        return false;
      }
    }
    return true;
  }
  /**
   * Returns an iterator of items that meet the specified predicate..
   * @param predicate Function that determines which items to filter.
   * @returns An iterator of filtered items.
   */
  filter(predicate) {
    return new _Enumerable(function* () {
      for (const item of this) {
        if (predicate(item)) {
          yield item;
        }
      }
    }.bind(this));
  }
  /**
   * Finds the first item that satisfies the specified predicate.
   * @param predicate Predicate to match items against.
   * @returns The first item that satisfied the predicate; otherwise `undefined`.
   */
  find(predicate) {
    for (const item of this) {
      if (predicate(item)) {
        return item;
      }
    }
  }
  /**
   * Finds the last item that satisfies the specified predicate.
   * @param predicate Predicate to match items against.
   * @returns The first item that satisfied the predicate; otherwise `undefined`.
   */
  findLast(predicate) {
    let result = void 0;
    for (const item of this) {
      if (predicate(item)) {
        result = item;
      }
    }
    return result;
  }
  /**
   * Returns an iterator containing items transformed using the specified mapper function.
   * @param mapper Function responsible for transforming each item.
   * @returns An iterator of transformed items.
   */
  flatMap(mapper) {
    return new _Enumerable(function* () {
      for (const item of this) {
        for (const mapped of mapper(item)) {
          yield mapped;
        }
      }
    }.bind(this));
  }
  /**
   * Iterates over each item, and invokes the specified function.
   * @param fn Function to invoke against each item.
   */
  forEach(fn) {
    for (const item of this) {
      fn(item);
    }
  }
  /**
   * Determines whether the search item exists in the collection exists.
   * @param search Item to search for.
   * @returns `true` when the item was found; otherwise `false`.
   */
  includes(search) {
    return this.some((item) => item === search);
  }
  /**
   * Returns an iterator of mapped items using the mapper function.
   * @param mapper Function responsible for mapping the items.
   * @returns An iterator of mapped items.
   */
  map(mapper) {
    return new _Enumerable(function* () {
      for (const item of this) {
        yield mapper(item);
      }
    }.bind(this));
  }
  /**
   * Captures the underlying iterable, if it is not already captured, and gets the next item in the iterator.
   * @param args Optional values to send to the generator.
   * @returns An iterator result of the current iteration; when `done` is `false`, the current `value` is provided.
   */
  next(...args) {
    this.#iterator ??= this.#items();
    const result = this.#iterator.next(...args);
    if (result.done) {
      this.#iterator = void 0;
    }
    return result;
  }
  /**
   * Applies the accumulator function to each item, and returns the result.
   * @param accumulator Function responsible for accumulating all items within the collection.
   * @param initial Initial value supplied to the accumulator.
   * @returns Result of accumulating each value.
   */
  reduce(accumulator, initial) {
    if (this.length === 0) {
      if (initial === void 0) {
        throw new TypeError("Reduce of empty enumerable with no initial value.");
      }
      return initial;
    }
    let result = initial;
    for (const item of this) {
      if (result === void 0) {
        result = item;
      } else {
        result = accumulator(result, item);
      }
    }
    return result;
  }
  /**
   * Acts as if a `return` statement is inserted in the generator's body at the current suspended position.
   *
   * Please note, in the context of an {@link Enumerable}, calling {@link Enumerable.return} will clear the captured iterator,
   * if there is one. Subsequent calls to {@link Enumerable.next} will result in re-capturing the underlying iterable, and
   * yielding items from the beginning.
   * @param value Value to return.
   * @returns The value as an iterator result.
   */
  return(value) {
    this.#iterator = void 0;
    return { done: true, value };
  }
  /**
   * Determines whether an item in the collection exists that satisfies the specified predicate.
   * @param predicate Function used to search for an item.
   * @returns `true` when the item was found; otherwise `false`.
   */
  some(predicate) {
    for (const item of this) {
      if (predicate(item)) {
        return true;
      }
    }
    return false;
  }
  /**
   * Returns an iterator with the items, from 0, up to the specified limit.
   * @param limit Limit of items to take.
   * @returns An iterator of items from 0 to the limit.
   */
  take(limit) {
    if (isNaN(limit) || limit < 0) {
      throw new RangeError("limit must be 0, or a positive number");
    }
    return new _Enumerable(function* () {
      let i = 0;
      for (const item of this) {
        if (i++ < limit) {
          yield item;
        }
      }
    }.bind(this));
  }
  /**
   * Acts as if a `throw` statement is inserted in the generator's body at the current suspended position.
   * @param e Error to throw.
   */
  throw(e) {
    throw e;
  }
  /**
   * Converts this iterator to an array.
   * @returns The array of items from this iterator.
   */
  toArray() {
    return Array.from(this);
  }
  /**
   * Converts this iterator to serializable collection.
   * @returns The serializable collection of items.
   */
  toJSON() {
    return this.toArray();
  }
  /**
   * Converts this iterator to a string.
   * @returns The string.
   */
  toString() {
    return `${this.toArray()}`;
  }
};
var __items$1 = /* @__PURE__ */ new Map();
var ReadOnlyActionStore = class extends Enumerable {
  /**
   * Initializes a new instance of the {@link ReadOnlyActionStore}.
   */
  constructor() {
    super(__items$1);
  }
  /**
   * Gets the action with the specified identifier.
   * @param id Identifier of action to search for.
   * @returns The action, when present; otherwise `undefined`.
   */
  getActionById(id) {
    return __items$1.get(id);
  }
};
var ActionStore = class extends ReadOnlyActionStore {
  /**
   * Deletes the action from the store.
   * @param id The action's identifier.
   */
  delete(id) {
    __items$1.delete(id);
  }
  /**
   * Adds the action to the store.
   * @param action The action.
   */
  set(action2) {
    __items$1.set(action2.id, action2);
  }
};
var actionStore = new ActionStore();
var ApplicationEvent = class extends Event {
  /**
   * Monitored application that was launched/terminated.
   */
  application;
  /**
   * Initializes a new instance of the {@link ApplicationEvent} class.
   * @param source Source of the event, i.e. the original message from Stream Deck.
   */
  constructor(source) {
    super(source);
    this.application = source.payload.application;
  }
};
var DeviceEvent = class extends Event {
  device;
  /**
   * Initializes a new instance of the {@link DeviceEvent} class.
   * @param source Source of the event, i.e. the original message from Stream Deck.
   * @param device Device that event is associated with.
   */
  constructor(source, device) {
    super(source);
    this.device = device;
  }
};
var DidReceiveDeepLinkEvent = class extends Event {
  /**
   * Deep-link URL routed from Stream Deck.
   */
  url;
  /**
   * Initializes a new instance of the {@link DidReceiveDeepLinkEvent} class.
   * @param source Source of the event, i.e. the original message from Stream Deck.
   */
  constructor(source) {
    super(source);
    this.url = new DeepLinkURL(source.payload.url);
  }
};
var PREFIX = "streamdeck://";
var DeepLinkURL = class _DeepLinkURL {
  /**
   * Fragment of the URL, with the number sign (#) omitted. For example, a URL of "/test#heading" would result in a {@link DeepLinkURL.fragment} of "heading".
   */
  fragment;
  /**
   * Original URL. For example, a URL of "/test?one=two#heading" would result in a {@link DeepLinkURL.href} of "/test?one=two#heading".
   */
  href;
  /**
   * Path of the URL; the full URL with the query and fragment omitted. For example, a URL of "/test?one=two#heading" would result in a {@link DeepLinkURL.path} of "/test".
   */
  path;
  /**
   * Query of the URL, with the question mark (?) omitted. For example, a URL of "/test?name=elgato&key=123" would result in a {@link DeepLinkURL.query} of "name=elgato&key=123".
   * See also {@link DeepLinkURL.queryParameters}.
   */
  query;
  /**
   * Query string parameters parsed from the URL. See also {@link DeepLinkURL.query}.
   */
  queryParameters;
  /**
   * Initializes a new instance of the {@link DeepLinkURL} class.
   * @param url URL of the deep-link, with the schema and authority omitted.
   */
  constructor(url) {
    const refUrl = new URL(`${PREFIX}${url}`);
    this.fragment = refUrl.hash.substring(1);
    this.href = refUrl.href.substring(PREFIX.length);
    this.path = _DeepLinkURL.parsePath(this.href);
    this.query = refUrl.search.substring(1);
    this.queryParameters = refUrl.searchParams;
  }
  /**
   * Parses the {@link DeepLinkURL.path} from the specified {@link href}.
   * @param href Partial URL that contains the path to parse.
   * @returns The path of the URL.
   */
  static parsePath(href) {
    const indexOf = (char) => {
      const index = href.indexOf(char);
      return index >= 0 ? index : href.length;
    };
    return href.substring(0, Math.min(indexOf("?"), indexOf("#")));
  }
};
var SendToPluginEvent = class extends Event {
  action;
  /**
   * Payload sent from the property inspector.
   */
  payload;
  /**
   * Initializes a new instance of the {@link SendToPluginEvent} class.
   * @param action Action that raised the event.
   * @param source Source of the event, i.e. the original message from Stream Deck.
   */
  constructor(action2, source) {
    super(source);
    this.action = action2;
    this.payload = source.payload;
  }
};
function getGlobalSettings() {
  return new Promise((resolve) => {
    connection.once("didReceiveGlobalSettings", (ev) => resolve(ev.payload.settings));
    connection.send({
      event: "getGlobalSettings",
      context: connection.registrationParameters.pluginUUID
    });
  });
}
function onDidReceiveGlobalSettings(listener) {
  return connection.disposableOn("didReceiveGlobalSettings", (ev) => listener(new DidReceiveGlobalSettingsEvent(ev)));
}
function onDidReceiveSettings(listener) {
  return connection.disposableOn("didReceiveSettings", (ev) => {
    const action2 = actionStore.getActionById(ev.context);
    if (action2) {
      listener(new ActionEvent(action2, ev));
    }
  });
}
function setGlobalSettings(settings2) {
  return connection.send({
    event: "setGlobalSettings",
    context: connection.registrationParameters.pluginUUID,
    payload: settings2
  });
}
var settings = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  getGlobalSettings,
  onDidReceiveGlobalSettings,
  onDidReceiveSettings,
  setGlobalSettings
});
var PropertyInspector = class {
  router;
  /**
   * Action associated with the property inspector
   */
  action;
  /**
   * Initializes a new instance of the {@link PropertyInspector} class.
   * @param router Router responsible for fetching requests.
   * @param source Source the property inspector is associated with.
   */
  constructor(router2, source) {
    this.router = router2;
    this.action = actionStore.getActionById(source.context);
  }
  /**
   * Sends a fetch request to the property inspector; the property inspector can listen for requests by registering routes.
   * @template T The type of the response body.
   * @param requestOrPath The request, or the path of the request.
   * @param bodyOrUndefined Request body, or moot when constructing the request with {@link MessageRequestOptions}.
   * @returns The response.
   */
  async fetch(requestOrPath, bodyOrUndefined) {
    if (typeof requestOrPath === "string") {
      return this.router.fetch(`${PUBLIC_PATH_PREFIX}${requestOrPath}`, bodyOrUndefined);
    } else {
      return this.router.fetch({
        ...requestOrPath,
        path: `${PUBLIC_PATH_PREFIX}${requestOrPath.path}`
      });
    }
  }
  /**
   * Sends the {@link payload} to the property inspector. The plugin can also receive information from the property inspector via {@link streamDeck.ui.onSendToPlugin} and {@link SingletonAction.onSendToPlugin}
   * allowing for bi-directional communication.
   * @template T The type of the payload received from the property inspector.
   * @param payload Payload to send to the property inspector.
   * @returns `Promise` resolved when {@link payload} has been sent to the property inspector.
   */
  sendToPropertyInspector(payload) {
    return connection.send({
      event: "sendToPropertyInspector",
      context: this.action.id,
      payload
    });
  }
};
var current;
var debounceCount = 0;
function getCurrentUI() {
  return current;
}
var router = new MessageGateway(async (payload) => {
  const current2 = getCurrentUI();
  if (current2) {
    await connection.send({
      event: "sendToPropertyInspector",
      context: current2.action.id,
      payload
    });
    return true;
  }
  return false;
}, (source) => actionStore.getActionById(source.context));
function isCurrent(ev) {
  return current?.action?.id === ev.context && current?.action?.manifestId === ev.action && current?.action?.device?.id === ev.device;
}
connection.on("propertyInspectorDidAppear", (ev) => {
  if (isCurrent(ev)) {
    debounceCount++;
  } else {
    debounceCount = 1;
    current = new PropertyInspector(router, ev);
  }
});
connection.on("propertyInspectorDidDisappear", (ev) => {
  if (isCurrent(ev)) {
    debounceCount--;
    if (debounceCount <= 0) {
      current = void 0;
    }
  }
});
connection.on("sendToPlugin", (ev) => router.process(ev));
var UIController = class {
  /**
   * Gets the current property inspector.
   * @returns The property inspector; otherwise `undefined`.
   */
  get current() {
    return getCurrentUI();
  }
  /**
   * Occurs when the property inspector associated with the action becomes visible, i.e. the user selected an action in the Stream Deck application. See also {@link UIController.onDidDisappear}.
   * @template T The type of settings associated with the action.
   * @param listener Function to be invoked when the event occurs.
   * @returns A disposable that, when disposed, removes the listener.
   */
  onDidAppear(listener) {
    return connection.disposableOn("propertyInspectorDidAppear", (ev) => {
      const action2 = actionStore.getActionById(ev.context);
      if (action2) {
        listener(new ActionWithoutPayloadEvent(action2, ev));
      }
    });
  }
  /**
   * Occurs when the property inspector associated with the action becomes destroyed, i.e. the user unselected the action in the Stream Deck application. See also {@link UIController.onDidAppear}.
   * @template T The type of settings associated with the action.
   * @param listener Function to be invoked when the event occurs.
   * @returns A disposable that, when disposed, removes the listener.
   */
  onDidDisappear(listener) {
    return connection.disposableOn("propertyInspectorDidDisappear", (ev) => {
      const action2 = actionStore.getActionById(ev.context);
      if (action2) {
        listener(new ActionWithoutPayloadEvent(action2, ev));
      }
    });
  }
  /**
   * Occurs when a message was sent to the plugin _from_ the property inspector. The plugin can also send messages _to_ the property inspector using {@link UIController.current.sendMessage}
   * or {@link Action.sendToPropertyInspector}.
   * @template TPayload The type of the payload received from the property inspector.
   * @template TSettings The type of settings associated with the action.
   * @param listener Function to be invoked when the event occurs.
   * @returns A disposable that, when disposed, removes the listener.
   */
  onSendToPlugin(listener) {
    return router.disposableOn("unhandledMessage", (ev) => {
      const action2 = actionStore.getActionById(ev.context);
      if (action2) {
        listener(new SendToPluginEvent(action2, ev));
      }
    });
  }
  /**
   * Registers the function as a route, exposing it to the property inspector via `streamDeck.plugin.fetch(path)`.
   * @template TBody The type of the request body.
   * @template TSettings The type of the action's settings.
   * @param path Path that identifies the route.
   * @param handler Handler to be invoked when a matching request is received.
   * @param options Optional routing configuration.
   * @returns Disposable capable of removing the route handler.
   * @example
   * streamDeck.ui.registerRoute("/toggle-light", async (req, res) => {
   *   await lightService.toggle(req.body.lightId);
   *   res.success();
   * });
   */
  registerRoute(path2, handler, options) {
    return router.route(`${PUBLIC_PATH_PREFIX}${path2}`, handler, options);
  }
};
var ui = new UIController();
var __items = /* @__PURE__ */ new Map();
var ReadOnlyDeviceStore = class extends Enumerable {
  /**
   * Initializes a new instance of the {@link ReadOnlyDeviceStore}.
   */
  constructor() {
    super(__items);
  }
  /**
   * Gets the Stream Deck {@link Device} associated with the specified {@link deviceId}.
   * @param deviceId Identifier of the Stream Deck device.
   * @returns The Stream Deck device information; otherwise `undefined` if a device with the {@link deviceId} does not exist.
   */
  getDeviceById(deviceId) {
    return __items.get(deviceId);
  }
};
var DeviceStore = class extends ReadOnlyDeviceStore {
  /**
   * Adds the device to the store.
   * @param device The device.
   */
  set(device) {
    __items.set(device.id, device);
  }
};
var deviceStore = new DeviceStore();
var ActionContext = class {
  /**
   * Device the action is associated with.
   */
  #device;
  /**
   * Source of the action.
   */
  #source;
  /**
   * Initializes a new instance of the {@link ActionContext} class.
   * @param source Source of the action.
   */
  constructor(source) {
    this.#source = source;
    const device = deviceStore.getDeviceById(source.device);
    if (!device) {
      throw new Error(`Failed to initialize action; device ${source.device} not found`);
    }
    this.#device = device;
  }
  /**
   * Type of the action.
   * - `Keypad` is a key.
   * - `Encoder` is a dial and portion of the touch strip.
   * @returns Controller type.
   */
  get controllerType() {
    return this.#source.payload.controller;
  }
  /**
   * Stream Deck device the action is positioned on.
   * @returns Stream Deck device.
   */
  get device() {
    return this.#device;
  }
  /**
   * Action instance identifier.
   * @returns Identifier.
   */
  get id() {
    return this.#source.context;
  }
  /**
   * Manifest identifier (UUID) for this action type.
   * @returns Manifest identifier.
   */
  get manifestId() {
    return this.#source.action;
  }
  /**
   * Converts this instance to a serializable object.
   * @returns The serializable object.
   */
  toJSON() {
    return {
      controllerType: this.controllerType,
      device: this.device,
      id: this.id,
      manifestId: this.manifestId
    };
  }
};
var Action = class extends ActionContext {
  /**
   * Gets the settings associated this action instance.
   * @template U The type of settings associated with the action.
   * @returns Promise containing the action instance's settings.
   */
  getSettings() {
    return new Promise((resolve) => {
      const callback = (ev) => {
        if (ev.context == this.id) {
          resolve(ev.payload.settings);
          connection.removeListener("didReceiveSettings", callback);
        }
      };
      connection.on("didReceiveSettings", callback);
      connection.send({
        event: "getSettings",
        context: this.id
      });
    });
  }
  /**
   * Determines whether this instance is a dial.
   * @returns `true` when this instance is a dial; otherwise `false`.
   */
  isDial() {
    return this.controllerType === "Encoder";
  }
  /**
   * Determines whether this instance is a key.
   * @returns `true` when this instance is a key; otherwise `false`.
   */
  isKey() {
    return this.controllerType === "Keypad";
  }
  /**
   * Sets the {@link settings} associated with this action instance. Use in conjunction with {@link Action.getSettings}.
   * @param settings Settings to persist.
   * @returns `Promise` resolved when the {@link settings} are sent to Stream Deck.
   */
  setSettings(settings2) {
    return connection.send({
      event: "setSettings",
      context: this.id,
      payload: settings2
    });
  }
  /**
   * Temporarily shows an alert (i.e. warning), in the form of an exclamation mark in a yellow triangle, on this action instance. Used to provide visual feedback when an action failed.
   * @returns `Promise` resolved when the request to show an alert has been sent to Stream Deck.
   */
  showAlert() {
    return connection.send({
      event: "showAlert",
      context: this.id
    });
  }
};
var DialAction = class extends Action {
  /**
   * Private backing field for {@link DialAction.coordinates}.
   */
  #coordinates;
  /**
   * Initializes a new instance of the {@see DialAction} class.
   * @param source Source of the action.
   */
  constructor(source) {
    super(source);
    if (source.payload.controller !== "Encoder") {
      throw new Error("Unable to create DialAction; source event is not a Encoder");
    }
    this.#coordinates = Object.freeze(source.payload.coordinates);
  }
  /**
   * Coordinates of the dial.
   * @returns The coordinates.
   */
  get coordinates() {
    return this.#coordinates;
  }
  /**
   * Sets the feedback for the current layout associated with this action instance, allowing for the visual items to be updated. Layouts are a powerful way to provide dynamic information
   * to users, and can be assigned in the manifest, or dynamically via {@link Action.setFeedbackLayout}.
   *
   * The {@link feedback} payload defines which items within the layout will be updated, and are identified by their property name (defined as the `key` in the layout's definition).
   * The values can either by a complete new definition, a `string` for layout item types of `text` and `pixmap`, or a `number` for layout item types of `bar` and `gbar`.
   * @param feedback Object containing information about the layout items to be updated.
   * @returns `Promise` resolved when the request to set the {@link feedback} has been sent to Stream Deck.
   */
  setFeedback(feedback) {
    return connection.send({
      event: "setFeedback",
      context: this.id,
      payload: feedback
    });
  }
  /**
   * Sets the layout associated with this action instance. The layout must be either a built-in layout identifier, or path to a local layout JSON file within the plugin's folder.
   * Use in conjunction with {@link Action.setFeedback} to update the layout's current items' settings.
   * @param layout Name of a pre-defined layout, or relative path to a custom one.
   * @returns `Promise` resolved when the new layout has been sent to Stream Deck.
   */
  setFeedbackLayout(layout) {
    return connection.send({
      event: "setFeedbackLayout",
      context: this.id,
      payload: {
        layout
      }
    });
  }
  /**
   * Sets the {@link image} to be display for this action instance within Stream Deck app.
   *
   * NB: The image can only be set by the plugin when the the user has not specified a custom image.
   * @param image Image to display; this can be either a path to a local file within the plugin's folder, a base64 encoded `string` with the mime type declared (e.g. PNG, JPEG, etc.),
   * or an SVG `string`. When `undefined`, the image from the manifest will be used.
   * @returns `Promise` resolved when the request to set the {@link image} has been sent to Stream Deck.
   */
  setImage(image) {
    return connection.send({
      event: "setImage",
      context: this.id,
      payload: {
        image
      }
    });
  }
  /**
   * Sets the {@link title} displayed for this action instance.
   *
   * NB: The title can only be set by the plugin when the the user has not specified a custom title.
   * @param title Title to display.
   * @returns `Promise` resolved when the request to set the {@link title} has been sent to Stream Deck.
   */
  setTitle(title) {
    return this.setFeedback({ title });
  }
  /**
   * Sets the trigger (interaction) {@link descriptions} associated with this action instance. Descriptions are shown within the Stream Deck application, and informs the user what
   * will happen when they interact with the action, e.g. rotate, touch, etc. When {@link descriptions} is `undefined`, the descriptions will be reset to the values provided as part
   * of the manifest.
   *
   * NB: Applies to encoders (dials / touchscreens) found on Stream Deck + devices.
   * @param descriptions Descriptions that detail the action's interaction.
   * @returns `Promise` resolved when the request to set the {@link descriptions} has been sent to Stream Deck.
   */
  setTriggerDescription(descriptions) {
    return connection.send({
      event: "setTriggerDescription",
      context: this.id,
      payload: descriptions || {}
    });
  }
  /**
   * @inheritdoc
   */
  toJSON() {
    return {
      ...super.toJSON(),
      coordinates: this.coordinates
    };
  }
};
var KeyAction = class extends Action {
  /**
   * Private backing field for {@link KeyAction.coordinates}.
   */
  #coordinates;
  /**
   * Source of the action.
   */
  #source;
  /**
   * Initializes a new instance of the {@see KeyAction} class.
   * @param source Source of the action.
   */
  constructor(source) {
    super(source);
    if (source.payload.controller !== "Keypad") {
      throw new Error("Unable to create KeyAction; source event is not a Keypad");
    }
    this.#coordinates = !source.payload.isInMultiAction ? Object.freeze(source.payload.coordinates) : void 0;
    this.#source = source;
  }
  /**
   * Coordinates of the key; otherwise `undefined` when the action is part of a multi-action.
   * @returns The coordinates.
   */
  get coordinates() {
    return this.#coordinates;
  }
  /**
   * Determines whether the key is part of a multi-action.
   * @returns `true` when in a multi-action; otherwise `false`.
   */
  isInMultiAction() {
    return this.#source.payload.isInMultiAction;
  }
  /**
   * Sets the {@link image} to be display for this action instance.
   *
   * NB: The image can only be set by the plugin when the the user has not specified a custom image.
   * @param image Image to display; this can be either a path to a local file within the plugin's folder, a base64 encoded `string` with the mime type declared (e.g. PNG, JPEG, etc.),
   * or an SVG `string`. When `undefined`, the image from the manifest will be used.
   * @param options Additional options that define where and how the image should be rendered.
   * @returns `Promise` resolved when the request to set the {@link image} has been sent to Stream Deck.
   */
  setImage(image, options) {
    return connection.send({
      event: "setImage",
      context: this.id,
      payload: {
        image,
        ...options
      }
    });
  }
  /**
   * Sets the current {@link state} of this action instance; only applies to actions that have multiple states defined within the manifest.
   * @param state State to set; this be either 0, or 1.
   * @returns `Promise` resolved when the request to set the state of an action instance has been sent to Stream Deck.
   */
  setState(state) {
    return connection.send({
      event: "setState",
      context: this.id,
      payload: {
        state
      }
    });
  }
  /**
   * Sets the {@link title} displayed for this action instance.
   *
   * NB: The title can only be set by the plugin when the the user has not specified a custom title.
   * @param title Title to display; when `undefined` the title within the manifest will be used.
   * @param options Additional options that define where and how the title should be rendered.
   * @returns `Promise` resolved when the request to set the {@link title} has been sent to Stream Deck.
   */
  setTitle(title, options) {
    return connection.send({
      event: "setTitle",
      context: this.id,
      payload: {
        title,
        ...options
      }
    });
  }
  /**
   * Temporarily shows an "OK" (i.e. success), in the form of a check-mark in a green circle, on this action instance. Used to provide visual feedback when an action successfully
   * executed.
   * @returns `Promise` resolved when the request to show an "OK" has been sent to Stream Deck.
   */
  showOk() {
    return connection.send({
      event: "showOk",
      context: this.id
    });
  }
  /**
   * @inheritdoc
   */
  toJSON() {
    return {
      ...super.toJSON(),
      coordinates: this.coordinates,
      isInMultiAction: this.isInMultiAction()
    };
  }
};
var manifest = new Lazy(() => getManifest());
var ActionService = class extends ReadOnlyActionStore {
  /**
   * Initializes a new instance of the {@link ActionService} class.
   */
  constructor() {
    super();
    connection.prependListener("willAppear", (ev) => {
      const action2 = ev.payload.controller === "Encoder" ? new DialAction(ev) : new KeyAction(ev);
      actionStore.set(action2);
    });
    connection.prependListener("willDisappear", (ev) => actionStore.delete(ev.context));
  }
  /**
   * Occurs when the user presses a dial (Stream Deck +).
   * @template T The type of settings associated with the action.
   * @param listener Function to be invoked when the event occurs.
   * @returns A disposable that, when disposed, removes the listener.
   */
  onDialDown(listener) {
    return connection.disposableOn("dialDown", (ev) => {
      const action2 = actionStore.getActionById(ev.context);
      if (action2?.isDial()) {
        listener(new ActionEvent(action2, ev));
      }
    });
  }
  /**
   * Occurs when the user rotates a dial (Stream Deck +).
   * @template T The type of settings associated with the action.
   * @param listener Function to be invoked when the event occurs.
   * @returns A disposable that, when disposed, removes the listener.
   */
  onDialRotate(listener) {
    return connection.disposableOn("dialRotate", (ev) => {
      const action2 = actionStore.getActionById(ev.context);
      if (action2?.isDial()) {
        listener(new ActionEvent(action2, ev));
      }
    });
  }
  /**
   * Occurs when the user releases a pressed dial (Stream Deck +).
   * @template T The type of settings associated with the action.
   * @param listener Function to be invoked when the event occurs.
   * @returns A disposable that, when disposed, removes the listener.
   */
  onDialUp(listener) {
    return connection.disposableOn("dialUp", (ev) => {
      const action2 = actionStore.getActionById(ev.context);
      if (action2?.isDial()) {
        listener(new ActionEvent(action2, ev));
      }
    });
  }
  /**
   * Occurs when the user presses a action down.
   * @template T The type of settings associated with the action.
   * @param listener Function to be invoked when the event occurs.
   * @returns A disposable that, when disposed, removes the listener.
   */
  onKeyDown(listener) {
    return connection.disposableOn("keyDown", (ev) => {
      const action2 = actionStore.getActionById(ev.context);
      if (action2?.isKey()) {
        listener(new ActionEvent(action2, ev));
      }
    });
  }
  /**
   * Occurs when the user releases a pressed action.
   * @template T The type of settings associated with the action.
   * @param listener Function to be invoked when the event occurs.
   * @returns A disposable that, when disposed, removes the listener.
   */
  onKeyUp(listener) {
    return connection.disposableOn("keyUp", (ev) => {
      const action2 = actionStore.getActionById(ev.context);
      if (action2?.isKey()) {
        listener(new ActionEvent(action2, ev));
      }
    });
  }
  /**
   * Occurs when the user updates an action's title settings in the Stream Deck application. See also {@link Action.setTitle}.
   * @template T The type of settings associated with the action.
   * @param listener Function to be invoked when the event occurs.
   * @returns A disposable that, when disposed, removes the listener.
   */
  onTitleParametersDidChange(listener) {
    return connection.disposableOn("titleParametersDidChange", (ev) => {
      const action2 = actionStore.getActionById(ev.context);
      if (action2) {
        listener(new ActionEvent(action2, ev));
      }
    });
  }
  /**
   * Occurs when the user taps the touchscreen (Stream Deck +).
   * @template T The type of settings associated with the action.
   * @param listener Function to be invoked when the event occurs.
   * @returns A disposable that, when disposed, removes the listener.
   */
  onTouchTap(listener) {
    return connection.disposableOn("touchTap", (ev) => {
      const action2 = actionStore.getActionById(ev.context);
      if (action2?.isDial()) {
        listener(new ActionEvent(action2, ev));
      }
    });
  }
  /**
   * Occurs when an action appears on the Stream Deck due to the user navigating to another page, profile, folder, etc. This also occurs during startup if the action is on the "front
   * page". An action refers to _all_ types of actions, e.g. keys, dials,
   * @template T The type of settings associated with the action.
   * @param listener Function to be invoked when the event occurs.
   * @returns A disposable that, when disposed, removes the listener.
   */
  onWillAppear(listener) {
    return connection.disposableOn("willAppear", (ev) => {
      const action2 = actionStore.getActionById(ev.context);
      if (action2) {
        listener(new ActionEvent(action2, ev));
      }
    });
  }
  /**
   * Occurs when an action disappears from the Stream Deck due to the user navigating to another page, profile, folder, etc. An action refers to _all_ types of actions, e.g. keys,
   * dials, touchscreens, pedals, etc.
   * @template T The type of settings associated with the action.
   * @param listener Function to be invoked when the event occurs.
   * @returns A disposable that, when disposed, removes the listener.
   */
  onWillDisappear(listener) {
    return connection.disposableOn("willDisappear", (ev) => listener(new ActionEvent(new ActionContext(ev), ev)));
  }
  /**
   * Registers the action with the Stream Deck, routing all events associated with the {@link SingletonAction.manifestId} to the specified {@link action}.
   * @param action The action to register.
   * @example
   * ＠action({ UUID: "com.elgato.test.action" })
   * class MyCustomAction extends SingletonAction {
   *     export function onKeyDown(ev: KeyDownEvent) {
   *         // Do some awesome thing.
   *     }
   * }
   *
   * streamDeck.actions.registerAction(new MyCustomAction());
   */
  registerAction(action2) {
    if (action2.manifestId === void 0) {
      throw new Error("The action's manifestId cannot be undefined.");
    }
    if (!manifest.value.Actions.some((a) => a.UUID === action2.manifestId)) {
      throw new Error(`The action's manifestId was not found within the manifest: ${action2.manifestId}`);
    }
    const { manifestId } = action2;
    const route = (fn, listener) => {
      const boundedListener = listener?.bind(action2);
      if (boundedListener === void 0) {
        return;
      }
      fn.bind(action2)(async (ev) => {
        if (ev.action.manifestId == manifestId) {
          await boundedListener(ev);
        }
      });
    };
    route(this.onDialDown, action2.onDialDown);
    route(this.onDialUp, action2.onDialUp);
    route(this.onDialRotate, action2.onDialRotate);
    route(ui.onSendToPlugin, action2.onSendToPlugin);
    route(onDidReceiveSettings, action2.onDidReceiveSettings);
    route(this.onKeyDown, action2.onKeyDown);
    route(this.onKeyUp, action2.onKeyUp);
    route(ui.onDidAppear, action2.onPropertyInspectorDidAppear);
    route(ui.onDidDisappear, action2.onPropertyInspectorDidDisappear);
    route(this.onTitleParametersDidChange, action2.onTitleParametersDidChange);
    route(this.onTouchTap, action2.onTouchTap);
    route(this.onWillAppear, action2.onWillAppear);
    route(this.onWillDisappear, action2.onWillDisappear);
  }
};
var actionService = new ActionService();
function requiresVersion(minimumVersion, streamDeckVersion, feature) {
  const required = {
    major: Math.floor(minimumVersion),
    minor: Number(minimumVersion.toString().split(".").at(1) ?? 0),
    // Account for JavaScript's floating point precision.
    patch: 0,
    build: 0
  };
  if (streamDeckVersion.compareTo(required) === -1) {
    throw new Error(`[ERR_NOT_SUPPORTED]: ${feature} requires Stream Deck version ${required.major}.${required.minor} or higher, but current version is ${streamDeckVersion.major}.${streamDeckVersion.minor}; please update Stream Deck and the "Software.MinimumVersion" in the plugin's manifest to "${required.major}.${required.minor}" or higher.`);
  } else if (getSoftwareMinimumVersion().compareTo(required) === -1) {
    throw new Error(`[ERR_NOT_SUPPORTED]: ${feature} requires Stream Deck version ${required.major}.${required.minor} or higher; please update the "Software.MinimumVersion" in the plugin's manifest to "${required.major}.${required.minor}" or higher.`);
  }
}
var Device = class {
  /**
   * Private backing field for {@link Device.isConnected}.
   */
  #isConnected = false;
  /**
   * Private backing field for the device's information.
   */
  #info;
  /**
   * Unique identifier of the device.
   */
  id;
  /**
   * Initializes a new instance of the {@link Device} class.
   * @param id Device identifier.
   * @param info Information about the device.
   * @param isConnected Determines whether the device is connected.
   */
  constructor(id, info, isConnected) {
    this.id = id;
    this.#info = info;
    this.#isConnected = isConnected;
    connection.prependListener("deviceDidConnect", (ev) => {
      if (ev.device === this.id) {
        this.#info = ev.deviceInfo;
        this.#isConnected = true;
      }
    });
    connection.prependListener("deviceDidChange", (ev) => {
      if (ev.device === this.id) {
        this.#info = ev.deviceInfo;
      }
    });
    connection.prependListener("deviceDidDisconnect", (ev) => {
      if (ev.device === this.id) {
        this.#isConnected = false;
      }
    });
  }
  /**
   * Actions currently visible on the device.
   * @returns Collection of visible actions.
   */
  get actions() {
    return actionStore.filter((a) => a.device.id === this.id);
  }
  /**
   * Determines whether the device is currently connected.
   * @returns `true` when the device is connected; otherwise `false`.
   */
  get isConnected() {
    return this.#isConnected;
  }
  /**
   * Name of the device, as specified by the user in the Stream Deck application.
   * @returns Name of the device.
   */
  get name() {
    return this.#info.name;
  }
  /**
   * Number of action slots, excluding dials / touchscreens, available to the device.
   * @returns Size of the device.
   */
  get size() {
    return this.#info.size;
  }
  /**
   * Type of the device that was connected, e.g. Stream Deck +, Stream Deck Pedal, etc. See {@link DeviceType}.
   * @returns Type of the device.
   */
  get type() {
    return this.#info.type;
  }
};
var DeviceService = class extends ReadOnlyDeviceStore {
  /**
   * Initializes a new instance of the {@link DeviceService}.
   */
  constructor() {
    super();
    connection.once("connected", (info) => {
      info.devices.forEach((dev) => deviceStore.set(new Device(dev.id, dev, false)));
    });
    connection.on("deviceDidConnect", ({ device: id, deviceInfo }) => {
      if (!deviceStore.getDeviceById(id)) {
        deviceStore.set(new Device(id, deviceInfo, true));
      }
    });
    connection.on("deviceDidChange", ({ device: id, deviceInfo }) => {
      if (!deviceStore.getDeviceById(id)) {
        deviceStore.set(new Device(id, deviceInfo, false));
      }
    });
  }
  /**
   * Occurs when a Stream Deck device changed, for example its name or size.
   *
   * Available from Stream Deck 7.0.
   * @param listener Function to be invoked when the event occurs.
   * @returns A disposable that, when disposed, removes the listener.
   */
  onDeviceDidChange(listener) {
    requiresVersion(7, connection.version, "onDeviceDidChange");
    return connection.disposableOn("deviceDidChange", (ev) => listener(new DeviceEvent(ev, this.getDeviceById(ev.device))));
  }
  /**
   * Occurs when a Stream Deck device is connected. See also {@link DeviceService.onDeviceDidConnect}.
   * @param listener Function to be invoked when the event occurs.
   * @returns A disposable that, when disposed, removes the listener.
   */
  onDeviceDidConnect(listener) {
    return connection.disposableOn("deviceDidConnect", (ev) => listener(new DeviceEvent(ev, this.getDeviceById(ev.device))));
  }
  /**
   * Occurs when a Stream Deck device is disconnected. See also {@link DeviceService.onDeviceDidDisconnect}.
   * @param listener Function to be invoked when the event occurs.
   * @returns A disposable that, when disposed, removes the listener.
   */
  onDeviceDidDisconnect(listener) {
    return connection.disposableOn("deviceDidDisconnect", (ev) => listener(new DeviceEvent(ev, this.getDeviceById(ev.device))));
  }
};
var deviceService = new DeviceService();
function fileSystemLocaleProvider(language) {
  const filePath = import_node_path.default.join(process.cwd(), `${language}.json`);
  if (!import_node_fs.default.existsSync(filePath)) {
    return null;
  }
  try {
    const contents = import_node_fs.default.readFileSync(filePath, { flag: "r" })?.toString();
    return parseLocalizations(contents);
  } catch (err) {
    logger.error(`Failed to load translations from ${filePath}`, err);
    return null;
  }
}
var errorCode = {
  /**
   * Indicates the current Node.js SDK is not compatible with the SDK Version specified within the manifest.
   */
  incompatibleSdkVersion: 652025
};
function switchToProfile(deviceId, profile, page) {
  if (page !== void 0) {
    requiresVersion(6.5, connection.version, "Switching to a profile page");
  }
  return connection.send({
    event: "switchToProfile",
    context: connection.registrationParameters.pluginUUID,
    device: deviceId,
    payload: {
      page,
      profile
    }
  });
}
var profiles = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  switchToProfile
});
function onApplicationDidLaunch(listener) {
  return connection.disposableOn("applicationDidLaunch", (ev) => listener(new ApplicationEvent(ev)));
}
function onApplicationDidTerminate(listener) {
  return connection.disposableOn("applicationDidTerminate", (ev) => listener(new ApplicationEvent(ev)));
}
function onDidReceiveDeepLink(listener) {
  requiresVersion(6.5, connection.version, "Receiving deep-link messages");
  return connection.disposableOn("didReceiveDeepLink", (ev) => listener(new DidReceiveDeepLinkEvent(ev)));
}
function onSystemDidWakeUp(listener) {
  return connection.disposableOn("systemDidWakeUp", (ev) => listener(new Event(ev)));
}
function openUrl(url) {
  return connection.send({
    event: "openUrl",
    payload: {
      url
    }
  });
}
var system = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  onApplicationDidLaunch,
  onApplicationDidTerminate,
  onDidReceiveDeepLink,
  onSystemDidWakeUp,
  openUrl
});
function action(definition) {
  const manifestId = definition.UUID;
  return function(target, context) {
    return class extends target {
      /**
       * The universally-unique value that identifies the action within the manifest.
       */
      manifestId = manifestId;
    };
  };
}
var SingletonAction = class {
  /**
   * The universally-unique value that identifies the action within the manifest.
   */
  manifestId;
  /**
   * Gets the visible actions with the `manifestId` that match this instance's.
   * @returns The visible actions.
   */
  get actions() {
    return actionStore.filter((a) => a.manifestId === this.manifestId);
  }
};
var i18n;
var streamDeck = {
  /**
   * Namespace for event listeners and functionality relating to Stream Deck actions.
   * @returns Actions namespace.
   */
  get actions() {
    return actionService;
  },
  /**
   * Namespace for interacting with Stream Deck devices.
   * @returns Devices namespace.
   */
  get devices() {
    return deviceService;
  },
  /**
   * Internalization provider, responsible for managing localizations and translating resources.
   * @returns Internalization provider.
   */
  get i18n() {
    return i18n ??= new I18nProvider(this.info.application.language, fileSystemLocaleProvider);
  },
  /**
   * Registration and application information provided by Stream Deck during initialization.
   * @returns Registration information.
   */
  get info() {
    return connection.registrationParameters.info;
  },
  /**
   * Logger responsible for capturing log messages.
   * @returns The logger.
   */
  get logger() {
    return logger;
  },
  /**
   * Manifest associated with the plugin, as defined within the `manifest.json` file.
   * @returns The manifest.
   */
  get manifest() {
    return getManifest();
  },
  /**
   * Namespace for Stream Deck profiles.
   * @returns Profiles namespace.
   */
  get profiles() {
    return profiles;
  },
  /**
   * Namespace for persisting settings within Stream Deck.
   * @returns Settings namespace.
   */
  get settings() {
    return settings;
  },
  /**
   * Namespace for interacting with, and receiving events from, the system the plugin is running on.
   * @returns System namespace.
   */
  get system() {
    return system;
  },
  /**
   * Namespace for interacting with UI (property inspector) associated with the plugin.
   * @returns UI namespace.
   */
  get ui() {
    return ui;
  },
  /**
   * Connects the plugin to the Stream Deck.
   * @returns A promise resolved when a connection has been established.
   */
  connect() {
    return connection.connect();
  }
};
registerCreateLogEntryRoute(router, logger);
if (streamDeck.manifest.SDKVersion >= 3) {
  logger.error("[ERR_NOT_SUPPORTED]: Manifest SDKVersion 3 requires @elgato/streamdeck 2.0 or higher.");
  process.exit(errorCode.incompatibleSdkVersion);
}

// src/hyprland/state.ts
var import_node_events2 = require("events");

// src/hyprland/env.ts
var import_node_fs2 = require("fs");
var DEFAULT_FS = { existsSync: import_node_fs2.existsSync, readdirSync: import_node_fs2.readdirSync, statSync: import_node_fs2.statSync };
function resolveUid(opts) {
  if (opts.getuid) return opts.getuid();
  if (typeof process.getuid === "function") return process.getuid();
  return 1e3;
}
function resolveRuntimeDir(opts = {}) {
  const env = opts.env ?? process.env;
  if (opts.runtimeDir) return opts.runtimeDir;
  if (env.XDG_RUNTIME_DIR) return env.XDG_RUNTIME_DIR;
  return `/run/user/${resolveUid(opts)}`;
}
function resolveHyprEnv(opts = {}) {
  if (opts.instanceSignature) {
    const rd = resolveRuntimeDir(opts);
    return {
      runtimeDir: rd,
      instanceSignature: opts.instanceSignature,
      via: "env",
      socketPath: `${rd}/hypr/${opts.instanceSignature}/.socket2.sock`
    };
  }
  const env = opts.env ?? process.env;
  const fs2 = opts.fs ?? DEFAULT_FS;
  const runtimeDir = resolveRuntimeDir(opts);
  const discovered = discoverNewestInstance(runtimeDir, fs2);
  const envHis = env.HYPRLAND_INSTANCE_SIGNATURE;
  if (envHis && discovered && discovered.sig === envHis) {
    return {
      runtimeDir,
      instanceSignature: envHis,
      via: "env",
      socketPath: `${runtimeDir}/hypr/${envHis}/.socket2.sock`
    };
  }
  if (discovered) {
    return {
      runtimeDir,
      instanceSignature: discovered.sig,
      via: "discovery",
      socketPath: `${runtimeDir}/hypr/${discovered.sig}/.socket2.sock`
    };
  }
  if (envHis) {
    return {
      runtimeDir,
      instanceSignature: envHis,
      via: "env",
      socketPath: `${runtimeDir}/hypr/${envHis}/.socket2.sock`
    };
  }
  return { runtimeDir, instanceSignature: null, via: "missing", socketPath: null };
}
function discoverNewestInstance(runtimeDir, fs2) {
  const hyprDir = `${runtimeDir}/hypr`;
  if (!fs2.existsSync(hyprDir)) return null;
  let entries;
  try {
    entries = fs2.readdirSync(hyprDir);
  } catch {
    return null;
  }
  let best = null;
  for (const sig of entries) {
    const sockPath = `${hyprDir}/${sig}/.socket2.sock`;
    if (!fs2.existsSync(sockPath)) continue;
    try {
      const stat = fs2.statSync(sockPath);
      if (!best || stat.mtimeMs > best.mtime) best = { sig, mtime: stat.mtimeMs };
    } catch {
    }
  }
  return best;
}

// src/hyprland/ipc.ts
var import_node_net = require("net");
var HyprctlSocket = class {
  resolveEnv;
  timeoutMs;
  connector;
  logRequest;
  /**
   * Serial in-flight chain. Every request() chains onto the previous so we
   * never have multiple concurrent `.socket.sock` opens — observed in the
   * wild that 6+ concurrent opens trigger ECONNREFUSED/EAGAIN under load
   * (display polling + button bursts hitting the queue at once). Per-call
   * cost is sub-millisecond and Hyprland responds in low single-digit ms,
   * so serialization adds essentially no user-visible latency.
   */
  chain = Promise.resolve();
  constructor(opts = {}) {
    this.resolveEnv = opts.resolveEnv ?? (() => resolveHyprEnv());
    this.timeoutMs = opts.timeoutMs ?? 5e3;
    this.connector = opts.connector ?? import_node_net.createConnection;
    this.logRequest = opts.logRequest;
  }
  /**
   * Send a raw payload to `.socket.sock` and return the full response.
   *
   * Resolves the socket path fresh on every call so a Hyprland restart
   * (new instance signature) is picked up automatically. Requests are
   * serialized — see the `chain` field for the rationale.
   */
  request(payload) {
    const next = this.chain.then(() => this.requestImmediate(payload));
    this.chain = next.catch(() => void 0);
    return next;
  }
  requestImmediate(payload) {
    const resolved = this.resolveEnv();
    if (!resolved.socketPath) {
      throw new Error(
        "Hyprland request socket not resolvable \u2014 no instance found under $XDG_RUNTIME_DIR/hypr"
      );
    }
    const writeSocketPath = resolved.socketPath.replace(/\.socket2\.sock$/, ".socket.sock");
    this.logRequest?.(writeSocketPath, payload);
    return new Promise((resolve, reject) => {
      const chunks = [];
      let settled = false;
      const sock = this.connector(writeSocketPath);
      sock.setEncoding("utf8");
      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        sock.destroy();
        reject(new Error(`hyprctl request timed out after ${this.timeoutMs}ms: ${payload}`));
      }, this.timeoutMs);
      sock.on("connect", () => {
        sock.write(payload);
        sock.end();
      });
      sock.on("data", (chunk) => chunks.push(typeof chunk === "string" ? chunk : chunk.toString("utf8")));
      sock.on("close", () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve({ body: chunks.join(""), socketPath: writeSocketPath });
      });
      sock.on("error", (err) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        reject(err);
      });
    });
  }
  /** Convenience: send a request and return only the body. */
  async send(payload) {
    return (await this.request(payload)).body;
  }
};
function jsonQueryPayload(command, ...args) {
  return args.length > 0 ? `j/${command} ${args.join(" ")}` : `j/${command}`;
}

// src/hyprland/types.ts
function parseFullscreenState(raw) {
  if (raw == null) return "none";
  if (typeof raw === "boolean") return raw ? "fullscreen" : "none";
  if (typeof raw === "number") {
    if (raw === 1) return "maximize";
    if (raw >= 2) return "fullscreen";
    return "none";
  }
  if (typeof raw === "string") {
    const s = raw.toLowerCase();
    if (s === "maximize" || s === "maximized") return "maximize";
    if (s === "full" || s === "fullscreen") return "fullscreen";
    return "none";
  }
  if (typeof raw === "object") {
    const obj = raw;
    if (typeof obj.mode === "string") return parseFullscreenState(obj.mode);
    if (typeof obj.client === "string") return parseFullscreenState(obj.client);
    if (typeof obj.internal === "string") return parseFullscreenState(obj.internal);
    if (typeof obj.state === "string") return parseFullscreenState(obj.state);
    if (typeof obj.mode === "number") return parseFullscreenState(obj.mode);
  }
  return "none";
}

// src/hyprland/workspace-selector.ts
function luaStr(s) {
  return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}
var RELATIVE_TOKENS = [
  "r+1",
  "r-1",
  "m+1",
  "m-1",
  "e+1",
  "e-1",
  "previous"
];
function parseSettings(raw) {
  const s = raw ?? {};
  if (s.selector && typeof s.selector === "object") {
    const parsed = parseSelector(s.selector);
    if (parsed) return parsed;
  }
  if (s.index !== void 0) {
    return { kind: "numeric", index: clampNumericIndex(s.index) };
  }
  return { kind: "numeric", index: 1 };
}
function parseSelector(raw) {
  if (!raw || typeof raw !== "object") return null;
  const o = raw;
  switch (o.kind) {
    case "numeric":
      return { kind: "numeric", index: clampNumericIndex(o.index) };
    case "named": {
      const name = typeof o.name === "string" ? o.name.trim() : "";
      if (!name) return null;
      return { kind: "named", name };
    }
    case "special": {
      const raw2 = typeof o.name === "string" ? o.name.trim() : "";
      const name = raw2.startsWith("special:") ? raw2.slice("special:".length) : raw2;
      return { kind: "special", name };
    }
    case "scratchpad":
      return { kind: "scratchpad" };
    case "relative": {
      const token = typeof o.token === "string" ? o.token : "";
      if (RELATIVE_TOKENS.includes(token)) {
        return { kind: "relative", token };
      }
      return null;
    }
  }
  return null;
}
function clampNumericIndex(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return 1;
  return Math.min(10, Math.max(1, Math.trunc(v)));
}
function toFocusWorkspaceArg(sel) {
  switch (sel.kind) {
    case "numeric":
      return String(sel.index);
    case "named":
      return luaStr(sel.name);
    case "special":
      return luaStr(sel.name ? `special:${sel.name}` : "special");
    case "scratchpad":
      return luaStr("special:scratchpad");
    case "relative":
      return luaStr(sel.token);
  }
}
function toToggleSpecialName(sel) {
  if (sel.kind === "special") return sel.name;
  if (sel.kind === "scratchpad") return "scratchpad";
  return null;
}
function toDisplayLabel(sel) {
  switch (sel.kind) {
    case "numeric":
      return { text: String(sel.index) };
    case "named":
      return { glyph: "#", text: truncate(sel.name, 6) };
    case "special":
      return { glyph: "\u2605", text: sel.name ? truncate(sel.name, 6) : "SP" };
    case "scratchpad":
      return { glyph: "\u2605", text: "SCR" };
    case "relative":
      return { glyph: relativeGlyph(sel.token), text: sel.token === "previous" ? "PRV" : sel.token };
  }
}
function relativeGlyph(token) {
  switch (token) {
    case "previous":
      return "\u27F2";
    case "r+1":
    case "m+1":
    case "e+1":
      return "\u2192";
    case "r-1":
    case "m-1":
    case "e-1":
      return "\u2190";
  }
}
function truncate(s, max) {
  return s.length <= max ? s : s.slice(0, max - 1) + "\u2026";
}

// src/hyprland/dispatch.ts
var Hyprctl = class {
  resolveEnv;
  socket;
  logResponse;
  lastError = null;
  constructor(opts = {}) {
    this.resolveEnv = opts.resolveEnv ?? (() => resolveHyprEnv());
    this.logResponse = opts.logResponse;
    this.socket = opts.socket ?? new HyprctlSocket({
      resolveEnv: this.resolveEnv,
      logRequest: opts.logSpawn
    });
  }
  get lastFailure() {
    return this.lastError;
  }
  // ---- Queries (JSON) ----
  workspaces() {
    return this.query("workspaces");
  }
  activeWorkspace() {
    return this.query("activeworkspace");
  }
  async clients() {
    const raw = await this.query("clients");
    return raw.map(normalizeClient);
  }
  monitors() {
    return this.query("monitors");
  }
  async activeWindow() {
    const result = await this.query("activewindow");
    if (!result || typeof result !== "object" || !("address" in result)) return null;
    return normalizeClient(result);
  }
  async version() {
    return this.send("/version");
  }
  /**
   * Hyprland 0.55+ Lua eval. Compiles and runs the expression server-side
   * via `return <expr>` and returns the stringified result.
   *
   * Note: there is no `hl.config.get(...)` API in 0.55 — `hl.config` is a
   * function, not a table. Use {@link getOption} for config reads.
   */
  async eval(luaExpression) {
    return this.send(`/eval ${luaExpression}`);
  }
  /**
   * Read a config option by name (e.g. "general:gaps_in"). Returns the
   * parsed JSON object from Hyprland's `j/getoption` query. Typical fields:
   *   { option, css, set, int?, float?, str? }
   * Caller picks the appropriate scalar field (int / float / str). Returns
   * null if Hyprland doesn't know the option or the response wasn't JSON.
   */
  async getOption(name) {
    const raw = await this.send(`j/getoption ${name}`);
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  /**
   * Hyprland 0.55+ live config set. The legacy `/keyword` socket command
   * was deprecated when the Lua parser took over — it now responds with
   * "keyword can't work with non-legacy parsers. Use eval." This helper
   * builds the equivalent `/eval hl.config({ section = { key = V } })`
   * expression and sends it, so callers don't have to think about the
   * Lua-table shape.
   *
   * Examples:
   *   setConfigValue("general:gaps_in", 12)
   *     → /eval hl.config({ general = { gaps_in = 12 } })
   *   setConfigValue("decoration:blur:enabled", true)
   *     → /eval hl.config({ decoration = { blur = { enabled = true } } })
   */
  async setConfigValue(name, value) {
    return this.send(`/eval hl.config(${luaTableForKeyword(name, value)})`);
  }
  /** @deprecated `/keyword` is broken on Hyprland 0.55 (Lua parser). Use
   *  {@link setConfigValue} instead — the wire layer here just redirects. */
  async keyword(name, value) {
    return this.setConfigValue(name, value);
  }
  /**
   * Set an environment variable for Hyprland's child processes (e.g.
   * `XCURSOR_SIZE`, `HYPRCURSOR_SIZE`, `XCURSOR_THEME`). Required for
   * cursor sizing on 0.55+ — `general:cursor_size` was removed in favor
   * of the standard XDG cursor env vars.
   *
   * Wire: `/eval hl.env("NAME", "VALUE")`. Lua's hl.env is write-only;
   * there is no read path through Hyprland's IPC. Callers needing the
   * current value should read `process.env.<NAME>` instead.
   */
  async setEnv(name, value) {
    return this.send(`/eval hl.env(${luaStr2(name)}, ${luaStr2(String(value))})`);
  }
  async query(name, ...args) {
    const body = await this.send(jsonQueryPayload(name, ...args));
    return JSON.parse(body);
  }
  // ---- Low-level send ----
  async send(payload) {
    try {
      const res = await this.socket.request(payload);
      const trimmed = res.body.trim();
      this.logResponse?.(res.socketPath, payload, trimmed);
      return trimmed;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.lastError = { payload, message, at: Date.now() };
      throw err;
    }
  }
  /**
   * Generic dispatcher escape hatch (for advanced/test use).
   * Sends `/dispatch <verb> <args...>` literally. NOTE: this is the legacy
   * pre-0.55 format and almost certainly won't work on Hyprland 0.55+ for
   * any real dispatcher — use the typed methods below instead.
   */
  async dispatch(...args) {
    return this.send(`/dispatch ${args.join(" ")}`);
  }
  // ---- High-level dispatchers (Hyprland 0.55 Lua API) ----
  /**
   * Focus a workspace. Accepts a numeric ID (legacy) or a full
   * `WorkspaceSelector`. Special / scratchpad selectors are routed through
   * `toggle_special` so a second tap hides the overlay — that matches the
   * UX users expect from scratchpad keybinds.
   */
  focusWorkspace(target) {
    const sel = normalizeWorkspaceArg(target);
    const togName = toToggleSpecialName(sel);
    if (togName !== null) {
      return this.toggleScratchpad(togName);
    }
    return this.send(`/dispatch hl.dsp.focus({ workspace = ${toFocusWorkspaceArg(sel)} })`);
  }
  /**
   * Move active window to workspace. `silent=true` means don't follow focus.
   * String-selector support for `hl.dsp.window.move` (special / named /
   * relative tokens) is not yet documented in LUA_SCRIPTS.md for 0.55 — it
   * works in our testing, but if Hyprland rejects it for some token the
   * dispatch will surface as a Lua parse error in the response body.
   */
  moveActiveToWorkspace(target, silent = true) {
    const sel = normalizeWorkspaceArg(target);
    const follow = silent ? "false" : "true";
    return this.send(
      `/dispatch hl.dsp.window.move({ workspace = ${toFocusWorkspaceArg(sel)}, follow = ${follow} })`
    );
  }
  toggleScratchpad(name = "scratchpad") {
    return this.send(`/dispatch hl.dsp.workspace.toggle_special(${luaStr2(name)})`);
  }
  focusDirection(dir) {
    return this.send(`/dispatch hl.dsp.focus({ direction = ${luaStr2(dir)} })`);
  }
  toggleFloating() {
    return this.send(`/dispatch hl.dsp.window.float({ action = "toggle" })`);
  }
  /** mode 0 = fullscreen, mode 1 = maximized (matches the old hyprctl semantics). */
  toggleFullscreen(mode = 0) {
    const luaMode = mode === 1 ? "maximized" : "fullscreen";
    return this.send(`/dispatch hl.dsp.window.fullscreen({ mode = ${luaStr2(luaMode)}, action = "toggle" })`);
  }
  toggleFakeFullscreen() {
    return this.send(
      `/dispatch hl.dsp.window.fullscreen({ mode = "fullscreen", action = "toggle", fakefullscreen = true })`
    );
  }
  pin() {
    return this.send(`/dispatch hl.dsp.window.pin()`);
  }
  closeWindow() {
    return this.send(`/dispatch hl.dsp.window.close()`);
  }
  closeWindowByAddress(address) {
    const a = address.startsWith("0x") ? address : `0x${address}`;
    return this.send(`/dispatch hl.dsp.window.close({ window = ${luaStr2(`address:${a}`)} })`);
  }
  /**
   * Swap the workspaces of two monitors.
   *
   * Hyprland 0.55 requires literal connector names — the legacy "current"
   * sentinel and direction sentinels ("l"/"r"/"u"/"d") aren't accepted on
   * the wire anymore. We resolve them client-side by querying the monitor
   * list and picking the focused / nearest-neighbor monitor.
   */
  async swapActiveWorkspaces(mon1, mon2) {
    const needCurrent = mon1 === "current" || mon2 === "current";
    const needNeighbor = isDirection(mon2);
    if (needCurrent || needNeighbor) {
      const monitors = await this.monitors();
      if (needCurrent) {
        const focused = monitors.find((m) => m.focused);
        if (!focused) throw new Error("swapActiveWorkspaces: no focused monitor");
        if (mon1 === "current") mon1 = focused.name;
        if (mon2 === "current") mon2 = focused.name;
      }
      if (isDirection(mon2)) {
        const start = monitors.find((m) => m.name === mon1);
        if (!start) throw new Error(`swapActiveWorkspaces: monitor "${mon1}" not found`);
        const neighbor = findNeighborMonitor(monitors, start, mon2);
        if (!neighbor) {
          throw new Error(`swapActiveWorkspaces: no monitor ${mon2} of ${start.name}`);
        }
        mon2 = neighbor.name;
      }
    }
    return this.send(
      `/dispatch hl.dsp.workspace.swap_monitors({ monitor1 = ${luaStr2(mon1)}, monitor2 = ${luaStr2(mon2)} })`
    );
  }
  /** Resize the active window by signed pixel deltas on each axis. */
  resizeActive(dx, dy) {
    const x = Math.trunc(dx);
    const y = Math.trunc(dy);
    return this.send(`/dispatch hl.dsp.window.resize({ x = ${x}, y = ${y}, relative = true })`);
  }
  swapWindow(dir) {
    return this.send(`/dispatch hl.dsp.window.swap({ direction = ${luaStr2(dir)} })`);
  }
  exec(cmd) {
    return this.send(`/dispatch hl.dsp.exec_cmd(${luaStr2(cmd)})`);
  }
  /**
   * Close every window on the given workspace in a single batched request.
   * Each command is a fully-formed `dispatch hl.dsp.window.close(...)` Lua
   * call; the `[[BATCH]]` prefix tells Hyprland to evaluate each in turn.
   */
  async closeWorkspaceWindows(workspaceId) {
    const clients = await this.clients();
    const targets2 = clients.filter((c) => c.workspace?.id === workspaceId);
    if (targets2.length === 0) return 0;
    const cmds = targets2.map((c) => {
      const addr = c.address.startsWith("0x") ? c.address : `0x${c.address}`;
      return `dispatch hl.dsp.window.close({ window = ${luaStr2(`address:${addr}`)} })`;
    });
    try {
      await this.send(`[[BATCH]]${cmds.join(" ; ")}`);
      return targets2.length;
    } catch {
      let closed = 0;
      for (const c of targets2) {
        try {
          await this.closeWindowByAddress(c.address);
          closed++;
        } catch {
        }
      }
      return closed;
    }
  }
};
function luaStr2(s) {
  return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}
function normalizeWorkspaceArg(t) {
  if (typeof t === "number") return { kind: "numeric", index: clampNumericIndex(t) };
  return t;
}
function luaTableForKeyword(keyword, value) {
  const parts = keyword.split(":").filter((p) => p.length > 0);
  if (parts.length === 0) throw new Error(`empty keyword: ${JSON.stringify(keyword)}`);
  let inner = formatLuaScalar(value);
  for (let i = parts.length - 1; i >= 0; i--) {
    inner = `{ ${parts[i]} = ${inner} }`;
  }
  return inner;
}
function formatLuaScalar(v) {
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "0";
  if (typeof v === "boolean") return v ? "true" : "false";
  const s = String(v).trim();
  if (s === "true" || s === "false") return s;
  if (s !== "" && /^-?\d+(\.\d+)?$/.test(s)) return s;
  return luaStr2(s);
}
function isDirection(s) {
  return s === "l" || s === "r" || s === "u" || s === "d";
}
function findNeighborMonitor(monitors, start, dir) {
  const others = monitors.filter((m) => m.id !== start.id);
  let candidates;
  switch (dir) {
    case "r":
      candidates = others.filter((m) => m.x > start.x).sort((a, b) => a.x - b.x);
      return candidates[0] ?? null;
    case "l":
      candidates = others.filter((m) => m.x < start.x).sort((a, b) => b.x - a.x);
      return candidates[0] ?? null;
    case "d":
      candidates = others.filter((m) => m.y > start.y).sort((a, b) => a.y - b.y);
      return candidates[0] ?? null;
    case "u":
      candidates = others.filter((m) => m.y < start.y).sort((a, b) => b.y - a.y);
      return candidates[0] ?? null;
  }
}
function normalizeClient(raw) {
  const fullscreenRaw = raw.fullscreen;
  return {
    address: String(raw.address ?? ""),
    workspace: raw.workspace ?? { id: -1, name: "" },
    class: String(raw.class ?? ""),
    title: String(raw.title ?? ""),
    pid: Number(raw.pid ?? 0),
    floating: Boolean(raw.floating),
    fullscreen: parseFullscreenState(fullscreenRaw),
    fullscreenRaw,
    monitor: Number(raw.monitor ?? 0),
    pinned: Boolean(raw.pinned)
  };
}

// src/hyprland/socket.ts
var import_node_events = require("events");
var import_node_net2 = require("net");
var HyprSocket = class _HyprSocket extends import_node_events.EventEmitter {
  socket = null;
  buffer = "";
  closed = false;
  reconnectTimer = null;
  reconnectDelayMs;
  opts;
  lastResolved = null;
  constructor(opts = {}) {
    super();
    this.opts = opts;
    this.reconnectDelayMs = opts.reconnectDelayMs ?? 1e3;
  }
  /** Resolve the current socket path, running discovery if env is missing or stale. */
  resolveCurrentPath() {
    const resolved = resolveHyprEnv({
      runtimeDir: this.opts.runtimeDir,
      instanceSignature: this.opts.instanceSignature
    });
    this.lastResolved = resolved;
    return resolved;
  }
  /** Most recently resolved env, or null before the first `connect()`. */
  get resolved() {
    return this.lastResolved;
  }
  /** Parse a single Hyprland event line of form `NAME>>DATA`. */
  static parseLine(line) {
    const idx = line.indexOf(">>");
    if (idx < 0) return null;
    return { name: line.slice(0, idx), data: line.slice(idx + 2) };
  }
  /** Parse a buffer that may contain multiple newline-separated event lines. */
  static parseBuffer(buf) {
    const events = [];
    let start = 0;
    let nl = buf.indexOf("\n");
    while (nl >= 0) {
      const line = buf.slice(start, nl);
      const evt = _HyprSocket.parseLine(line);
      if (evt) events.push(evt);
      start = nl + 1;
      nl = buf.indexOf("\n", start);
    }
    return { events, remainder: buf.slice(start) };
  }
  connect() {
    if (this.closed) return;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    const resolved = this.resolveCurrentPath();
    if (!resolved.socketPath) {
      this.emit(
        "error",
        new Error(
          "Hyprland instance not found \u2014 set HYPRLAND_INSTANCE_SIGNATURE / XDG_RUNTIME_DIR, or start Hyprland so the .socket2.sock under $XDG_RUNTIME_DIR/hypr/ becomes discoverable"
        )
      );
      this.scheduleReconnect();
      return;
    }
    const sock = (0, import_node_net2.createConnection)(resolved.socketPath);
    this.socket = sock;
    sock.setEncoding("utf8");
    sock.on("connect", () => this.emit("connect", resolved));
    sock.on("data", (chunk) => this.onData(chunk));
    sock.on("error", (err) => this.emit("error", err));
    sock.on("close", () => {
      this.socket = null;
      this.emit("disconnect");
      if (!this.closed) this.scheduleReconnect();
    });
  }
  close() {
    this.closed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    this.socket?.destroy();
    this.socket = null;
  }
  onData(chunk) {
    this.buffer += chunk;
    const { events, remainder } = _HyprSocket.parseBuffer(this.buffer);
    this.buffer = remainder;
    for (const evt of events) {
      this.emit("event", evt);
      this.emit(evt.name, evt.data);
    }
  }
  scheduleReconnect() {
    if (this.closed) return;
    this.reconnectTimer = setTimeout(() => this.connect(), this.reconnectDelayMs);
  }
};

// src/hyprland/state.ts
var HyprState = class extends import_node_events2.EventEmitter {
  socket;
  hyprctl;
  workspaces = /* @__PURE__ */ new Map();
  activeWsId = 1;
  activeSpecial_ = null;
  active = null;
  started = false;
  refreshDebounceMs;
  degradeAfter;
  degradeQuietMs;
  debounceTimer = null;
  consecutiveErrors = 0;
  degraded = false;
  quietUntil = 0;
  lastError = null;
  constructor(socket, hyprctl2, opts = {}) {
    super();
    this.socket = socket ?? new HyprSocket();
    this.hyprctl = hyprctl2 ?? new Hyprctl();
    this.refreshDebounceMs = opts.refreshDebounceMs ?? 30;
    this.degradeAfter = opts.degradeAfter ?? 3;
    this.degradeQuietMs = opts.degradeQuietMs ?? 5e3;
  }
  start() {
    if (this.started) return;
    this.started = true;
    this.socket.on("event", () => this.scheduleRefresh());
    this.socket.on("connect", () => this.scheduleRefresh());
    this.socket.connect();
    void this.refresh();
  }
  stop() {
    this.socket.close();
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.started = false;
  }
  /**
   * Coalesce bursts of socket events (a workspace switch fires ~5 in a row)
   * into a single refresh on the trailing edge of the debounce window.
   */
  scheduleRefresh() {
    if (this.debounceTimer) return;
    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = null;
      void this.refresh();
    }, this.refreshDebounceMs);
  }
  get activeWorkspaceId() {
    return this.activeWsId;
  }
  /**
   * Currently overlaid special workspace, or null when no special is
   * showing on any monitor. Used by Workspace Focus to render the "active"
   * state for `kind: "special"` and `kind: "scratchpad"` buttons.
   */
  get activeSpecial() {
    return this.activeSpecial_;
  }
  get activeClient() {
    return this.active;
  }
  /** True once consecutive refresh failures crossed `degradeAfter`. */
  get isDegraded() {
    return this.degraded;
  }
  get lastRefreshError() {
    return this.lastError;
  }
  getWorkspace(id) {
    return this.workspaces.get(id) ?? { id, windows: 0, hasFullscreen: false };
  }
  /** Refresh the full snapshot from hyprctl. Emits "change". */
  async refresh() {
    if (this.degraded && Date.now() < this.quietUntil) return;
    try {
      const [wsList, activeWs, activeWin, monitors] = await Promise.all([
        this.hyprctl.workspaces(),
        this.hyprctl.activeWorkspace(),
        this.hyprctl.activeWindow(),
        this.hyprctl.monitors()
      ]);
      const next = /* @__PURE__ */ new Map();
      for (const ws of wsList) {
        next.set(ws.id, {
          id: ws.id,
          windows: ws.windows,
          hasFullscreen: ws.hasfullscreen
        });
      }
      this.workspaces = next;
      this.activeWsId = activeWs.id;
      this.active = activeWin;
      let special = null;
      for (const m of monitors) {
        const sw = m.specialWorkspace;
        if (sw && sw.name) {
          const bare = sw.name.startsWith("special:") ? sw.name.slice("special:".length) : sw.name;
          if (special === null || m.focused) {
            special = { name: bare, monitor: m.name };
          }
        }
      }
      this.activeSpecial_ = special;
      this.consecutiveErrors = 0;
      this.lastError = null;
      if (this.degraded) {
        this.degraded = false;
        this.emit("recovered");
      }
      this.emit("change");
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.lastError = error;
      this.consecutiveErrors++;
      if (!this.degraded && this.consecutiveErrors >= this.degradeAfter) {
        this.degraded = true;
        this.quietUntil = Date.now() + this.degradeQuietMs;
        this.emit("degraded", error);
      }
      this.emit("error", error);
    }
  }
};

// src/audio/state.ts
var import_node_events3 = require("events");

// src/audio/pipewire.ts
var import_node_child_process = require("child_process");
var defaultRunner = (bin, args) => new Promise((resolve, reject) => {
  (0, import_node_child_process.execFile)(bin, args, (err, stdout) => {
    if (err) reject(err);
    else resolve(stdout);
  });
});
var TARGETS = {
  sink: "@DEFAULT_AUDIO_SINK@",
  source: "@DEFAULT_AUDIO_SOURCE@"
};
var Pipewire = class _Pipewire {
  bin;
  runner;
  constructor(opts = {}) {
    this.bin = opts.bin ?? "wpctl";
    this.runner = opts.runner ?? defaultRunner;
  }
  async getStatus(target) {
    const out = await this.runner(this.bin, ["get-volume", TARGETS[target]]);
    return _Pipewire.parseVolumeOutput(out);
  }
  async setMute(target, mode) {
    await this.runner(this.bin, ["set-mute", TARGETS[target], mode]);
  }
  async stepVolume(target, deltaPercent) {
    const sign = deltaPercent >= 0 ? "+" : "-";
    const abs = Math.abs(deltaPercent);
    await this.runner(this.bin, ["set-volume", TARGETS[target], `${abs}%${sign}`]);
  }
  /** Parse `Volume: 0.50` or `Volume: 0.50 [MUTED]`. */
  static parseVolumeOutput(s) {
    const m = s.match(/Volume:\s*([\d.]+)\s*(\[MUTED\])?/i);
    if (!m) return { volume: 0, muted: false };
    return { volume: Number(m[1]), muted: m[2] !== void 0 };
  }
};

// src/audio/state.ts
var AudioState = class extends import_node_events3.EventEmitter {
  pw;
  statuses = /* @__PURE__ */ new Map();
  timer = null;
  refcount = 0;
  intervalMs;
  constructor(pw, intervalMs = 800) {
    super();
    this.pw = pw ?? new Pipewire();
    this.intervalMs = intervalMs;
  }
  acquire() {
    this.refcount++;
    if (this.refcount === 1) {
      void this.poll();
      this.timer = setInterval(() => void this.poll(), this.intervalMs);
    }
  }
  release() {
    this.refcount = Math.max(0, this.refcount - 1);
    if (this.refcount === 0 && this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
  get(target) {
    return this.statuses.get(target) ?? { volume: 0, muted: false };
  }
  /** Manually trigger an immediate poll (e.g. right after issuing a change). */
  async refresh() {
    await this.poll();
  }
  get pipewire() {
    return this.pw;
  }
  async poll() {
    const targets2 = ["sink", "source"];
    const results = await Promise.allSettled(targets2.map((t) => this.pw.getStatus(t)));
    let changed = false;
    for (let i = 0; i < targets2.length; i++) {
      const t = targets2[i];
      const r = results[i];
      if (r.status === "rejected") {
        this.emit("error", r.reason);
        continue;
      }
      const next = r.value;
      const prev = this.statuses.get(t);
      if (!prev || prev.volume !== next.volume || prev.muted !== next.muted) {
        this.statuses.set(t, next);
        changed = true;
      }
    }
    if (changed) this.emit("change");
  }
};

// src/system/recorder.ts
var import_node_child_process2 = require("child_process");
var import_node_events4 = require("events");
var import_node_fs3 = require("fs");
var import_node_os = require("os");
var import_node_path2 = require("path");
var Recorder = class extends import_node_events4.EventEmitter {
  bin;
  outputDir;
  pidFile;
  timer = null;
  refcount = 0;
  lastActive = false;
  constructor(opts = {}) {
    super();
    this.bin = opts.bin ?? "wf-recorder";
    this.outputDir = opts.outputDir ?? (0, import_node_path2.join)((0, import_node_os.homedir)(), "Videos");
    const runtime = process.env.XDG_RUNTIME_DIR ?? "/tmp";
    this.pidFile = opts.pidFile ?? (0, import_node_path2.join)(runtime, "hyprstream", "record.pid");
  }
  acquire() {
    this.refcount++;
    if (this.refcount === 1) {
      this.lastActive = this.isActive();
      this.timer = setInterval(() => this.poll(), 700);
      this.emit("change");
    }
  }
  release() {
    this.refcount = Math.max(0, this.refcount - 1);
    if (this.refcount === 0 && this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
  isActive() {
    if (!(0, import_node_fs3.existsSync)(this.pidFile)) return false;
    const pidStr = (0, import_node_fs3.readFileSync)(this.pidFile, "utf8").trim();
    const pid = Number(pidStr);
    if (!Number.isFinite(pid) || pid <= 0) return false;
    try {
      process.kill(pid, 0);
      return true;
    } catch {
      try {
        (0, import_node_fs3.unlinkSync)(this.pidFile);
      } catch {
      }
      return false;
    }
  }
  async start(mode) {
    if (this.isActive()) {
      throw new Error("recording already in progress");
    }
    (0, import_node_fs3.mkdirSync)(this.outputDir, { recursive: true });
    (0, import_node_fs3.mkdirSync)((0, import_node_path2.dirname)(this.pidFile), { recursive: true });
    const ts = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-").replace("T", "_").slice(0, 19);
    const out = (0, import_node_path2.join)(this.outputDir, `screencast-${ts}.mp4`);
    const cmd = buildRecorderCommand(this.bin, mode, out);
    const child = (0, import_node_child_process2.spawn)("sh", ["-c", cmd], {
      detached: true,
      stdio: "ignore"
    });
    child.unref();
    if (typeof child.pid !== "number") {
      throw new Error("failed to spawn wf-recorder (no pid)");
    }
    (0, import_node_fs3.writeFileSync)(this.pidFile, String(child.pid), { encoding: "utf8" });
    setTimeout(() => this.poll(), 200);
  }
  async stop() {
    if (!this.isActive()) return;
    const pid = Number((0, import_node_fs3.readFileSync)(this.pidFile, "utf8").trim());
    try {
      process.kill(pid, "SIGINT");
    } catch {
    }
    try {
      (0, import_node_fs3.unlinkSync)(this.pidFile);
    } catch {
    }
    setTimeout(() => this.poll(), 200);
  }
  async toggle(mode) {
    if (this.isActive()) await this.stop();
    else await this.start(mode);
  }
  poll() {
    const active = this.isActive();
    const transition = active !== this.lastActive;
    this.lastActive = active;
    if (active || transition) this.emit("change");
  }
};
function buildRecorderCommand(bin, mode, outPath) {
  const out = JSON.stringify(outPath);
  switch (mode) {
    case "region":
      return `exec ${bin} -g "$(slurp)" -f ${out}`;
    case "full":
      return `exec ${bin} -f ${out}`;
    case "full-audio":
      return `exec ${bin} -a -f ${out}`;
  }
}

// src/system/notifications.ts
var import_node_events5 = require("events");

// src/system/runner.ts
var import_node_child_process3 = require("child_process");
var defaultRunner2 = (bin, args) => new Promise((resolve, reject) => {
  (0, import_node_child_process3.execFile)(bin, args, (err, stdout) => {
    if (err) reject(err);
    else resolve(stdout);
  });
});

// src/system/notifications.ts
var NotificationsControl = class extends import_node_events5.EventEmitter {
  runner;
  daemon;
  paused = false;
  timer = null;
  refcount = 0;
  constructor(opts = {}) {
    super();
    this.runner = opts.runner ?? defaultRunner2;
    this.daemon = opts.daemon;
  }
  async detect() {
    if (this.daemon !== void 0) return this.daemon;
    const checks = [
      { d: "mako", cmd: ["makoctl", "mode"] },
      { d: "dunst", cmd: ["dunstctl", "is-paused"] }
    ];
    for (const { d, cmd } of checks) {
      try {
        await this.runner(cmd[0], cmd.slice(1));
        this.daemon = d;
        return d;
      } catch {
      }
    }
    this.daemon = null;
    return null;
  }
  async isPaused() {
    const d = await this.detect();
    if (!d) return false;
    if (d === "mako") {
      const out2 = await this.runner("makoctl", ["mode"]);
      return /(?:^|\n)\s*do-not-disturb\b/m.test(out2);
    }
    const out = await this.runner("dunstctl", ["is-paused"]);
    return out.trim() === "true";
  }
  async toggle() {
    const d = await this.detect();
    if (!d) throw new Error("no notification daemon detected (mako or dunst)");
    if (d === "mako") {
      await this.runner("makoctl", ["mode", "-t", "do-not-disturb"]);
    } else {
      await this.runner("dunstctl", ["set-paused", "toggle"]);
    }
    void this.poll();
  }
  acquire() {
    this.refcount++;
    if (this.refcount === 1) {
      void this.poll();
      this.timer = setInterval(() => void this.poll(), 1e3);
    }
  }
  release() {
    this.refcount = Math.max(0, this.refcount - 1);
    if (this.refcount === 0 && this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
  get currentlyPaused() {
    return this.paused;
  }
  get currentDaemon() {
    return this.daemon;
  }
  async poll() {
    try {
      const next = await this.isPaused();
      if (next !== this.paused) {
        this.paused = next;
        this.emit("change");
      }
    } catch (err) {
      this.emit("error", err);
    }
  }
};

// src/system/mpris.ts
var import_node_events6 = require("events");
var import_node_child_process4 = require("child_process");
var FIELD_SEP = "";
var FOLLOW_FORMAT = "{{status}}{{xesam:title}}{{xesam:artist}}{{mpris:artUrl}}{{mpris:trackid}}";
var NULL_TOKENS = /* @__PURE__ */ new Set(["", "null", "(null)"]);
function cleanField(s) {
  const t = s.trim();
  if (NULL_TOKENS.has(t.toLowerCase())) return null;
  return t;
}
var Mpris = class extends import_node_events6.EventEmitter {
  runner;
  bin;
  spawn;
  reconnectMs;
  status = "None";
  artUrl = null;
  trackId = null;
  title = null;
  artist = null;
  follow = null;
  followBuffer = "";
  reconnectTimer = null;
  closed = false;
  refcount = 0;
  constructor(opts = {}) {
    super();
    this.runner = opts.runner ?? defaultRunner2;
    this.bin = opts.bin ?? "playerctl";
    this.spawn = opts.spawn ?? import_node_child_process4.spawn;
    this.reconnectMs = opts.reconnectMs ?? 1e3;
  }
  async getStatus() {
    try {
      const out = (await this.runner(this.bin, ["status"])).trim();
      if (out === "Playing" || out === "Paused" || out === "Stopped") return out;
      return "None";
    } catch {
      return "None";
    }
  }
  async getArtUrl() {
    try {
      const out = (await this.runner(this.bin, ["metadata", "--format", "{{mpris:artUrl}}"])).trim();
      return cleanField(out);
    } catch {
      return null;
    }
  }
  playPause() {
    return this.runner(this.bin, ["play-pause"]).then(() => "ok");
  }
  next() {
    return this.runner(this.bin, ["next"]).then(() => "ok");
  }
  prev() {
    return this.runner(this.bin, ["previous"]).then(() => "ok");
  }
  acquire() {
    this.refcount++;
    if (this.refcount === 1) {
      this.closed = false;
      this.startFollow();
    }
  }
  release() {
    this.refcount = Math.max(0, this.refcount - 1);
    if (this.refcount === 0) {
      this.closed = true;
      this.stopFollow();
    }
  }
  get currentStatus() {
    return this.status;
  }
  get currentArtUrl() {
    return this.artUrl;
  }
  get currentTrackId() {
    return this.trackId;
  }
  get currentTitle() {
    return this.title;
  }
  get currentArtist() {
    return this.artist;
  }
  startFollow() {
    if (this.closed) return;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    try {
      this.follow = this.spawn(this.bin, [
        "--follow",
        "metadata",
        "--format",
        FOLLOW_FORMAT
      ]);
    } catch {
      this.scheduleReconnect();
      return;
    }
    this.followBuffer = "";
    this.follow.stdout?.setEncoding("utf8");
    this.follow.stdout?.on("data", (chunk) => this.onFollowChunk(chunk));
    this.follow.stderr?.on("data", () => {
    });
    this.follow.on("exit", () => {
      this.follow = null;
      this.applyState(null);
      this.scheduleReconnect();
    });
    this.follow.on("error", () => {
      this.follow = null;
      this.scheduleReconnect();
    });
  }
  stopFollow() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    const f = this.follow;
    this.follow = null;
    if (f) {
      try {
        f.kill("SIGTERM");
      } catch {
      }
    }
  }
  scheduleReconnect() {
    if (this.closed) return;
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.startFollow();
    }, this.reconnectMs);
  }
  onFollowChunk(chunk) {
    this.followBuffer += chunk;
    let nl = this.followBuffer.indexOf("\n");
    while (nl >= 0) {
      const line = this.followBuffer.slice(0, nl);
      this.followBuffer = this.followBuffer.slice(nl + 1);
      this.onFollowLine(line);
      nl = this.followBuffer.indexOf("\n");
    }
  }
  onFollowLine(line) {
    if (!line || line.trim().length === 0) {
      return;
    }
    const parts = line.split(FIELD_SEP);
    if (parts.length < 5) return;
    const [rawStatus, rawTitle, rawArtist, rawArt, rawTrackId] = parts;
    const status = parsePlaybackStatus(rawStatus);
    const title = cleanField(rawTitle);
    const artist = cleanField(rawArtist);
    const art = cleanField(rawArt);
    const trackId = cleanField(rawTrackId);
    this.applyState({ status, title, artist, artUrl: art, trackId });
  }
  /**
   * Update internal state from a parsed snapshot. Emits 'change' on any
   * meaningful delta.
   *
   * **artUrl is monotone-non-null.** A `null` artUrl in an incoming
   * playerctl line never clears the cached URL — only a new non-null URL
   * overwrites it. This matches illogical-impulse's `PlayerControl.qml` and
   * waybar's MPRIS module: players (Spotify, Clementine, Spotifyd) routinely
   * emit transient `null` artUrl during track changes — either a brief
   * `PlaybackStatus=Stopped` line between tracks, or a metadata burst where
   * the first PropertiesChanged signal carries the new trackId but no art
   * yet. Treating those as "clear" produces blank frames and triggers
   * spurious epoch invalidations in the action repaint pipeline.
   *
   * The only path that *does* clear `artUrl` is `applyState(null)` — the
   * follow subprocess exited, which is a hard "no player here" signal.
   *
   * Tradeoff: a track that genuinely has no MPRIS art (podcast, local
   * stream, custom file) will keep showing the *previous* track's cover
   * until the user moves to one with art. Acceptable for the Spotify-heavy
   * workflows this plugin targets; matches the canonical pattern.
   */
  applyState(next) {
    let changed = false;
    if (next === null) {
      if (this.status !== "None") {
        this.status = "None";
        changed = true;
      }
      if (this.artUrl !== null) {
        this.artUrl = null;
        changed = true;
      }
      if (this.trackId !== null) {
        this.trackId = null;
        changed = true;
      }
      if (this.title !== null) {
        this.title = null;
        changed = true;
      }
      if (this.artist !== null) {
        this.artist = null;
        changed = true;
      }
      if (changed) this.emit("change");
      return;
    }
    if (next.status !== this.status) {
      this.status = next.status;
      changed = true;
    }
    if (next.title !== this.title) {
      this.title = next.title;
      changed = true;
    }
    if (next.artist !== this.artist) {
      this.artist = next.artist;
      changed = true;
    }
    if (next.trackId !== this.trackId) {
      this.trackId = next.trackId;
      changed = true;
    }
    if (next.artUrl !== null && next.artUrl !== this.artUrl) {
      this.artUrl = next.artUrl;
      changed = true;
    }
    if (changed) this.emit("change");
  }
};
function parsePlaybackStatus(raw) {
  const t = raw.trim();
  if (t === "Playing" || t === "Paused" || t === "Stopped") return t;
  return "None";
}

// src/render/icon.ts
var import_node_crypto = require("crypto");
function svgToDataUri(svg) {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
var DEFAULT_ACTIVE = "#7aa2f7";
var BUSY_FG = "#c0caf5";
var EMPTY_FG = "#565f89";
var BG_ACTIVE = "#1f1f28";
var BG_INACTIVE = "#16161e";
var ACCENT_OK = "#3ec06b";
var ACCENT_BAD = "#e93545";
var FONT = "Inter, sans-serif";
function workspaceIconSvg(params) {
  const { index, state, windowCount = 0, label } = params;
  const accent = params.activeColor ?? DEFAULT_ACTIVE;
  const display = params.countDisplay ?? "badge";
  const bg = state === "active" ? accent : BG_INACTIVE;
  const fg = state === "active" ? "#ffffff" : state === "busy" ? BUSY_FG : EMPTY_FG;
  const accentBorder = state === "active" ? "#ffffff33" : `${accent}66`;
  if (label) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${bg}" stroke="${accentBorder}" stroke-width="2"/>
  ${renderLabel(label, fg)}
</svg>`;
  }
  const indicator = state === "busy" && windowCount > 0 ? renderCountIndicator(display, windowCount, accent) : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${bg}" stroke="${accentBorder}" stroke-width="2"/>
  <text x="72" y="100" font-family="${FONT}" font-size="92" font-weight="700"
        fill="${fg}" text-anchor="middle">${index}</text>
  ${indicator}
</svg>`;
}
function renderLabel(label, fg) {
  const glyph = label.glyph ?? "";
  const text = label.text ?? "";
  if (!glyph) {
    const fontSize = text.length <= 2 ? 92 : text.length <= 4 ? 64 : 44;
    return `<text x="72" y="100" font-family="${FONT}" font-size="${fontSize}" font-weight="700"
          fill="${fg}" text-anchor="middle">${escapeXml(text)}</text>`;
  }
  return `
    <text x="72" y="78" font-family="${FONT}" font-size="56" font-weight="700"
          fill="${fg}" text-anchor="middle">${escapeXml(glyph)}</text>
    <text x="72" y="118" font-family="${FONT}" font-size="22" font-weight="700"
          fill="${fg}" text-anchor="middle" letter-spacing="1">${escapeXml(text)}</text>
  `;
}
function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function renderCountIndicator(display, count, accent) {
  switch (display) {
    case "none":
      return "";
    case "badge":
      return `<g>
        <circle cx="118" cy="26" r="18" fill="${accent}" />
        <text x="118" y="33" font-family="${FONT}" font-size="20" font-weight="700"
              fill="${BG_ACTIVE}" text-anchor="middle">${count}</text>
      </g>`;
    case "dots": {
      const max = 5;
      const visible = Math.min(count, max);
      const dotR = 4;
      const gap = 14;
      const totalW = visible * gap - (gap - dotR * 2);
      const startX = 72 - totalW / 2 + dotR;
      const overflow = count > max ? `<text x="${startX + visible * gap + 2}" y="135" font-family="${FONT}" font-size="14"
                font-weight="700" fill="${accent}" text-anchor="start">+</text>` : "";
      const dots = Array.from(
        { length: visible },
        (_, i) => `<circle cx="${startX + i * gap}" cy="131" r="${dotR}" fill="${accent}"/>`
      ).join("");
      return `<g>${dots}${overflow}</g>`;
    }
    case "bar": {
      const max = 5;
      const ratio = Math.min(count, max) / max;
      const fullW = 110;
      const w = Math.max(8, Math.round(fullW * ratio));
      const x = 72 - fullW / 2;
      return `<g>
        <rect x="${x}" y="126" width="${fullW}" height="6" rx="3" fill="${accent}33"/>
        <rect x="${x}" y="126" width="${w}" height="6" rx="3" fill="${accent}"/>
      </g>`;
    }
  }
}
function moveWindowIconSvg({ index, accentColor, label }) {
  const accent = accentColor ?? "#bb9af7";
  const arrowBadge = `
  <g transform="translate(108,108)" fill="${accent}">
    <circle cx="0" cy="0" r="16" fill="${accent}" opacity="0.95"/>
    <path d="M-7,-1 L3,-1 L3,-6 L9,0 L3,6 L3,1 L-7,1 Z" fill="${BG_INACTIVE}"/>
  </g>
  <text x="72" y="128" font-family="${FONT}" font-size="14" font-weight="600"
        fill="${EMPTY_FG}" text-anchor="middle">SEND \u2192</text>`;
  const center = label ? renderMoveLabel(label, BUSY_FG) : `<text x="72" y="92" font-family="${FONT}" font-size="76" font-weight="700"
        fill="${BUSY_FG}" text-anchor="middle">${index}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${BG_INACTIVE}" stroke="${accent}66" stroke-width="2"/>
  ${center}
  ${arrowBadge}
</svg>`;
}
function renderMoveLabel(label, fg) {
  const glyph = label.glyph ?? "";
  const text = label.text ?? "";
  if (!glyph) {
    const fontSize = text.length <= 2 ? 76 : text.length <= 4 ? 54 : 38;
    return `<text x="72" y="92" font-family="${FONT}" font-size="${fontSize}" font-weight="700"
          fill="${fg}" text-anchor="middle">${escapeXml(text)}</text>`;
  }
  return `
    <text x="72" y="70" font-family="${FONT}" font-size="48" font-weight="700"
          fill="${fg}" text-anchor="middle">${escapeXml(glyph)}</text>
    <text x="72" y="104" font-family="${FONT}" font-size="20" font-weight="700"
          fill="${fg}" text-anchor="middle" letter-spacing="1">${escapeXml(text)}</text>
  `;
}
function muteIconSvg({ kind, muted, volume }) {
  const accent = muted ? ACCENT_BAD : ACCENT_OK;
  const label = volume !== void 0 ? `${Math.round(Math.min(1, Math.max(0, volume)) * 100)}%` : muted ? "MUTE" : "ON";
  const glyph = kind === "mic" ? micGlyph(muted, accent) : speakerGlyph(muted, accent);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${BG_INACTIVE}" stroke="${accent}66" stroke-width="2"/>
  <g transform="translate(72,62)">${glyph}</g>
  <text x="72" y="128" font-family="${FONT}" font-size="22" font-weight="700"
        fill="${accent}" text-anchor="middle">${label}</text>
</svg>`;
}
function micGlyph(muted, color) {
  const slash = muted ? `<line x1="-32" y1="-32" x2="32" y2="32" stroke="${color}" stroke-width="6" stroke-linecap="round"/>` : "";
  return `
    <g fill="${color}" stroke="${color}">
      <rect x="-12" y="-30" width="24" height="40" rx="12" stroke="none"/>
      <path d="M-22,5 a22,22 0 0 0 44,0" fill="none" stroke-width="5"/>
      <line x1="0" y1="27" x2="0" y2="38" stroke-width="5"/>
      <line x1="-12" y1="38" x2="12" y2="38" stroke-width="5"/>
    </g>
    ${slash}
  `;
}
function speakerGlyph(muted, color) {
  const slash = muted ? `<line x1="-30" y1="-30" x2="30" y2="30" stroke="${color}" stroke-width="6" stroke-linecap="round"/>` : "";
  const waves = muted ? "" : `
    <path d="M16,-15 a18,18 0 0 1 0,30" fill="none" stroke="${color}" stroke-width="4"/>
    <path d="M22,-22 a26,26 0 0 1 0,44" fill="none" stroke="${color}" stroke-width="4"/>
  `;
  return `
    <path d="M-25,-12 L-10,-12 L8,-25 L8,25 L-10,12 L-25,12 Z" fill="${color}"/>
    ${waves}
    ${slash}
  `;
}
function volumeStepIconSvg({ delta, volume, muted }) {
  const up = delta >= 0;
  const accent = muted ? ACCENT_BAD : up ? "#7aa2f7" : "#bb9af7";
  const arrow = up ? `<polygon points="-30,15 30,15 0,-25" fill="${accent}"/>` : `<polygon points="-30,-15 30,-15 0,25" fill="${accent}"/>`;
  const sign = up ? "+" : "\u2212";
  const label = volume !== void 0 ? `${Math.round(Math.min(1, Math.max(0, volume)) * 100)}%` : "VOL";
  const stepLabel = `${sign}${Math.abs(delta)}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${BG_INACTIVE}" stroke="${accent}66" stroke-width="2"/>
  <g transform="translate(72,55)">${arrow}</g>
  <text x="72" y="100" font-family="${FONT}" font-size="22" font-weight="700"
        fill="${accent}" text-anchor="middle">${stepLabel}</text>
  <text x="72" y="128" font-family="${FONT}" font-size="18" font-weight="600"
        fill="${BUSY_FG}" text-anchor="middle">${label}</text>
</svg>`;
}
function directionIconSvg({ direction }) {
  const rot = { l: 180, r: 0, u: -90, d: 90 }[direction];
  const accent = "#7aa2f7";
  const label = { l: "LEFT", r: "RIGHT", u: "UP", d: "DOWN" }[direction];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${BG_INACTIVE}" stroke="${accent}66" stroke-width="2"/>
  <g transform="translate(72,62) rotate(${rot})">
    <path d="M-25,-15 L10,-15 L10,-32 L40,0 L10,32 L10,15 L-25,15 Z" fill="${accent}"/>
  </g>
  <text x="72" y="128" font-family="${FONT}" font-size="20" font-weight="700"
        fill="${accent}" text-anchor="middle">${label}</text>
</svg>`;
}
function closeIconSvg({
  mode = "active",
  armedRemaining = 0
} = {}) {
  const accent = ACCENT_BAD;
  const label = mode === "workspace" ? "CLOSE WS" : "CLOSE";
  const badge = mode === "workspace" ? `<g>
           <circle cx="118" cy="26" r="18" fill="${accent}"/>
           <text x="118" y="33" font-family="${FONT}" font-size="16" font-weight="800"
                 fill="${BG_INACTIVE}" text-anchor="middle">ALL</text>
         </g>` : "";
  const ring = armedRemaining > 0 ? confirmRingArc(armedRemaining, accent) : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${BG_INACTIVE}" stroke="${accent}66" stroke-width="2"/>
  ${ring}
  <g transform="translate(72,62)" stroke="${accent}" stroke-width="9" stroke-linecap="round">
    <line x1="-22" y1="-22" x2="22" y2="22"/>
    <line x1="-22" y1="22" x2="22" y2="-22"/>
  </g>
  ${badge}
  <text x="72" y="128" font-family="${FONT}" font-size="${mode === "workspace" ? 18 : 20}" font-weight="700"
        fill="${accent}" text-anchor="middle">${label}</text>
</svg>`;
}
function confirmRingArc(remaining, color) {
  const p = Math.max(0, Math.min(1, remaining));
  const cx = 72;
  const cy = 62;
  const r = 48;
  if (p >= 1) {
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="8"/>`;
  }
  const angle = p * 2 * Math.PI;
  const sx = cx;
  const sy = cy - r;
  const ex = cx + r * Math.sin(angle);
  const ey = cy - r * Math.cos(angle);
  const largeArc = p > 0.5 ? 1 : 0;
  return `<path d="M ${sx} ${sy} A ${r} ${r} 0 ${largeArc} 1 ${ex.toFixed(2)} ${ey.toFixed(2)}"
    fill="none" stroke="${color}" stroke-width="8" stroke-linecap="round"/>`;
}
function monitorSwapIconSvg({ direction }) {
  const accent = "#bb9af7";
  const horizontal = direction === "l" || direction === "r";
  const label = { l: "\u2190 SWAP", r: "SWAP \u2192", u: "\u2191 SWAP", d: "\u2193 SWAP" }[direction];
  const monitors = horizontal ? `
      <rect x="-58" y="-22" width="48" height="32" rx="3" fill="${accent}" opacity="0.9"/>
      <rect x="10"  y="-22" width="48" height="32" rx="3" fill="${accent}" opacity="0.4"/>
    ` : `
      <rect x="-22" y="-44" width="44" height="32" rx="3" fill="${accent}" opacity="0.9"/>
      <rect x="-22" y="12"  width="44" height="32" rx="3" fill="${accent}" opacity="0.4"/>
    `;
  const arrows = horizontal ? `
      <path d="M-12,-6 C-6,-22 6,-22 12,-6" fill="none" stroke="${accent}" stroke-width="3"/>
      <polygon points="-12,-6 -18,-2 -10,2" fill="${accent}"/>
      <path d="M12,6 C6,22 -6,22 -12,6" fill="none" stroke="${accent}" stroke-width="3"/>
      <polygon points="12,6 18,2 10,-2" fill="${accent}"/>
    ` : `
      <path d="M-6,-12 C-22,-6 -22,6 -6,12" fill="none" stroke="${accent}" stroke-width="3"/>
      <polygon points="-6,-12 -2,-18 2,-10" fill="${accent}"/>
      <path d="M6,12 C22,6 22,-6 6,-12" fill="none" stroke="${accent}" stroke-width="3"/>
      <polygon points="6,12 2,18 -2,10" fill="${accent}"/>
    `;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${BG_INACTIVE}" stroke="${accent}66" stroke-width="2"/>
  <g transform="translate(72,60)">
    ${monitors}
    ${arrows}
  </g>
  <text x="72" y="128" font-family="${FONT}" font-size="20" font-weight="700"
        fill="${accent}" text-anchor="middle">${label}</text>
</svg>`;
}
function resizeIconSvg({ direction, pixels = 80 }) {
  const accent = "#f7768e";
  const grow = direction === "r" || direction === "d";
  const horizontal = direction === "l" || direction === "r";
  const label = grow ? "GROW" : "SHRINK";
  const axisLabel = horizontal ? "H" : "V";
  const w = 56;
  const h = 40;
  const box = `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="3" fill="none" stroke="${accent}66" stroke-width="2.5"/>`;
  let activeEdge = "";
  let chevrons = "";
  if (direction === "r") {
    activeEdge = `<line x1="${w / 2}" y1="${-h / 2}" x2="${w / 2}" y2="${h / 2}" stroke="${accent}" stroke-width="5" stroke-linecap="round"/>`;
    chevrons = `
      <polyline points="${w / 2 + 8},-10 ${w / 2 + 18},0 ${w / 2 + 8},10" fill="none" stroke="${accent}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <polyline points="${w / 2 + 18},-10 ${w / 2 + 28},0 ${w / 2 + 18},10" fill="none" stroke="${accent}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    `;
  } else if (direction === "l") {
    activeEdge = `<line x1="${-w / 2}" y1="${-h / 2}" x2="${-w / 2}" y2="${h / 2}" stroke="${accent}" stroke-width="5" stroke-linecap="round"/>`;
    chevrons = `
      <polyline points="${-w / 2 - 8},-10 ${-w / 2 - 18},0 ${-w / 2 - 8},10" fill="none" stroke="${accent}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <polyline points="${-w / 2 - 18},-10 ${-w / 2 - 28},0 ${-w / 2 - 18},10" fill="none" stroke="${accent}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    `;
  } else if (direction === "d") {
    activeEdge = `<line x1="${-w / 2}" y1="${h / 2}" x2="${w / 2}" y2="${h / 2}" stroke="${accent}" stroke-width="5" stroke-linecap="round"/>`;
    chevrons = `
      <polyline points="-12,${h / 2 + 8} 0,${h / 2 + 18} 12,${h / 2 + 8}" fill="none" stroke="${accent}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <polyline points="-12,${h / 2 + 18} 0,${h / 2 + 28} 12,${h / 2 + 18}" fill="none" stroke="${accent}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    `;
  } else {
    activeEdge = `<line x1="${-w / 2}" y1="${-h / 2}" x2="${w / 2}" y2="${-h / 2}" stroke="${accent}" stroke-width="5" stroke-linecap="round"/>`;
    chevrons = `
      <polyline points="-12,${-h / 2 - 8} 0,${-h / 2 - 18} 12,${-h / 2 - 8}" fill="none" stroke="${accent}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <polyline points="-12,${-h / 2 - 18} 0,${-h / 2 - 28} 12,${-h / 2 - 18}" fill="none" stroke="${accent}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    `;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${BG_INACTIVE}" stroke="${accent}66" stroke-width="2"/>
  <g transform="translate(72,60)">
    ${box}
    ${activeEdge}
    ${chevrons}
  </g>
  <text x="72" y="118" font-family="${FONT}" font-size="18" font-weight="800"
        fill="${accent}" text-anchor="middle">${label}</text>
  <text x="72" y="134" font-family="${FONT}" font-size="12" font-weight="600"
        fill="${accent}" opacity="0.8" text-anchor="middle">${axisLabel} \xB7 ${pixels}px</text>
</svg>`;
}
function swapWindowIconSvg({ direction }) {
  const accent = "#7dcfff";
  const horizontal = direction === "l" || direction === "r";
  const label = { l: "SWAP \u2190", r: "SWAP \u2192", u: "SWAP \u2191", d: "SWAP \u2193" }[direction];
  const frame = `<rect x="-58" y="-32" width="116" height="64" rx="6" fill="none" stroke="${accent}66" stroke-width="2.5" stroke-dasharray="6 3"/>`;
  const tiles = horizontal ? `
      <rect x="-50" y="-24" width="44" height="48" rx="3" fill="${accent}" opacity="0.9"/>
      <text x="-28" y="6" font-family="${FONT}" font-size="22" font-weight="800" fill="${BG_INACTIVE}" text-anchor="middle">A</text>
      <rect x="6" y="-24" width="44" height="48" rx="3" fill="${accent}" opacity="0.45"/>
      <text x="28" y="6" font-family="${FONT}" font-size="22" font-weight="800" fill="${BG_INACTIVE}" text-anchor="middle">B</text>
    ` : `
      <rect x="-54" y="-28" width="108" height="22" rx="3" fill="${accent}" opacity="0.9"/>
      <text x="0" y="-9" font-family="${FONT}" font-size="14" font-weight="800" fill="${BG_INACTIVE}" text-anchor="middle">A</text>
      <rect x="-54" y="4" width="108" height="22" rx="3" fill="${accent}" opacity="0.45"/>
      <text x="0" y="22" font-family="${FONT}" font-size="14" font-weight="800" fill="${BG_INACTIVE}" text-anchor="middle">B</text>
    `;
  const arrowGlyph = (() => {
    switch (direction) {
      case "r":
        return `<g transform="translate(-2,0)"><polyline points="-10,-8 4,0 -10,8" fill="none" stroke="${BG_INACTIVE}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></g>`;
      case "l":
        return `<g transform="translate(2,0)"><polyline points="10,-8 -4,0 10,8" fill="none" stroke="${BG_INACTIVE}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></g>`;
      case "d":
        return `<g transform="translate(0,-2)"><polyline points="-8,-6 0,6 8,-6" fill="none" stroke="${BG_INACTIVE}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></g>`;
      case "u":
        return `<g transform="translate(0,2)"><polyline points="-8,6 0,-6 8,6" fill="none" stroke="${BG_INACTIVE}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></g>`;
    }
  })();
  const arrow = horizontal ? `<g transform="translate(0,0)">${arrowGlyph}</g>` : `<g transform="translate(0,0)">${arrowGlyph}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${BG_INACTIVE}" stroke="${accent}66" stroke-width="2"/>
  <g transform="translate(72,60)">
    ${frame}
    ${tiles}
    <circle cx="0" cy="0" r="13" fill="${accent}"/>
    ${arrow}
  </g>
  <text x="72" y="128" font-family="${FONT}" font-size="18" font-weight="800"
        fill="${accent}" text-anchor="middle">${label}</text>
</svg>`;
}
function diagnosticsIconSvg({ env, socket, hyprctl: hyprctl2, via }) {
  const overall = worstStatus([env, socket, hyprctl2]);
  const accent = overall === "ok" ? "#9ece6a" : overall === "degraded" ? "#ffaa55" : ACCENT_BAD;
  const labelTop = overall === "ok" ? "HYPR" : overall === "degraded" ? "WARN" : "DOWN";
  const labelBottom = via === "missing" ? "no env" : "";
  const dot = (s, x) => {
    const c = s === "ok" ? "#9ece6a" : s === "degraded" ? "#ffaa55" : ACCENT_BAD;
    return `<circle cx="${x}" cy="0" r="9" fill="${c}"/>`;
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${BG_INACTIVE}" stroke="${accent}66" stroke-width="2"/>
  <text x="72" y="44" font-family="${FONT}" font-size="18" font-weight="800"
        fill="${accent}" text-anchor="middle">${labelTop}</text>
  <g transform="translate(72,72)">
    ${dot(env, -28)}
    ${dot(socket, 0)}
    ${dot(hyprctl2, 28)}
  </g>
  <g font-family="${FONT}" font-size="9" font-weight="600" fill="${accent}" text-anchor="middle" opacity="0.7">
    <text x="44" y="98">env</text>
    <text x="72" y="98">sock</text>
    <text x="100" y="98">ctl</text>
  </g>
  <text x="72" y="128" font-family="${FONT}" font-size="13" font-weight="700"
        fill="${accent}" text-anchor="middle" opacity="0.85">${labelBottom}</text>
</svg>`;
}
function worstStatus(s) {
  if (s.includes("down")) return "down";
  if (s.includes("degraded")) return "degraded";
  return "ok";
}
function configTweakIconSvg({ label, value, error }) {
  const accent = error ? ACCENT_BAD : "#a6e3a1";
  const valueText = (value ?? "").toString().slice(0, 6);
  const valueSize = valueText.length > 3 ? 32 : 44;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${BG_INACTIVE}" stroke="${accent}66" stroke-width="2"/>
  <text x="72" y="38" font-family="${FONT}" font-size="16" font-weight="800"
        fill="${accent}" text-anchor="middle" letter-spacing="2">${label}</text>
  <rect x="14" y="56" width="116" height="56" rx="10" fill="${accent}22" stroke="${accent}88" stroke-width="2"/>
  <text x="72" y="${56 + 56 / 2 + valueSize / 3}" font-family="${FONT}" font-size="${valueSize}" font-weight="800"
        fill="${accent}" text-anchor="middle">${valueText}</text>
  <text x="72" y="130" font-family="${FONT}" font-size="11" font-weight="600"
        fill="${accent}" opacity="0.65" text-anchor="middle" letter-spacing="1">TAP TO TOGGLE</text>
</svg>`;
}
function presentationIconSvg({ on }) {
  const accent = on ? ACCENT_BAD : "#7aa2f7";
  const label = on ? "PRESENT" : "PRESENT";
  const stateLabel = on ? "ON AIR" : "OFF";
  const dot = on ? `<circle cx="118" cy="26" r="9" fill="${ACCENT_BAD}"/>
       <circle cx="118" cy="26" r="14" fill="none" stroke="${ACCENT_BAD}" stroke-width="2" opacity="0.5"/>` : `<circle cx="118" cy="26" r="7" fill="${accent}" opacity="0.3"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${BG_INACTIVE}" stroke="${accent}66" stroke-width="2"/>
  <g transform="translate(72,56)">
    <!-- screen frame -->
    <rect x="-44" y="-26" width="88" height="52" rx="4" fill="${on ? `${accent}22` : "none"}" stroke="${accent}" stroke-width="3"/>
    <!-- stand -->
    <line x1="-12" y1="26" x2="-22" y2="38" stroke="${accent}" stroke-width="3" stroke-linecap="round"/>
    <line x1="12" y1="26" x2="22" y2="38" stroke="${accent}" stroke-width="3" stroke-linecap="round"/>
    <!-- bullet points inside the screen -->
    <circle cx="-26" cy="-12" r="3" fill="${accent}"/>
    <line x1="-18" y1="-12" x2="28" y2="-12" stroke="${accent}" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="-26" cy="2" r="3" fill="${accent}" opacity="0.7"/>
    <line x1="-18" y1="2" x2="20" y2="2" stroke="${accent}" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>
    <circle cx="-26" cy="16" r="3" fill="${accent}" opacity="0.4"/>
    <line x1="-18" y1="16" x2="10" y2="16" stroke="${accent}" stroke-width="2.5" stroke-linecap="round" opacity="0.4"/>
  </g>
  ${dot}
  <text x="72" y="116" font-family="${FONT}" font-size="18" font-weight="800"
        fill="${accent}" text-anchor="middle" letter-spacing="2">${label}</text>
  <text x="72" y="134" font-family="${FONT}" font-size="13" font-weight="700"
        fill="${accent}" opacity="0.85" text-anchor="middle">${stateLabel}</text>
</svg>`;
}
function windowToggleIconSvg({ mode, on = false }) {
  const accent = on ? "#9ece6a" : "#565f89";
  const label = {
    float: "FLOAT",
    maximize: "MAX",
    fullscreen: "FULL",
    fakefullscreen: "FAKE",
    pin: "PIN"
  }[mode];
  const stateLabel = on ? "ON" : "OFF";
  const glyph = windowGlyph(mode, accent, on);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${BG_INACTIVE}" stroke="${accent}66" stroke-width="2"/>
  <g transform="translate(72,56)">${glyph}</g>
  <text x="72" y="112" font-family="${FONT}" font-size="20" font-weight="700"
        fill="${accent}" text-anchor="middle">${label}</text>
  <text x="72" y="132" font-family="${FONT}" font-size="14" font-weight="600"
        fill="${accent}" opacity="0.8" text-anchor="middle">${stateLabel}</text>
</svg>`;
}
function windowGlyph(mode, color, on) {
  const fill = on ? color : "none";
  const stroke = color;
  switch (mode) {
    case "float":
      return `
        <rect x="-30" y="-22" width="44" height="32" rx="3" fill="none" stroke="${stroke}" stroke-width="3"/>
        <rect x="-12" y="-8" width="44" height="32" rx="3" fill="${color}" opacity="${on ? 0.9 : 0.4}"/>
      `;
    case "maximize":
      return `<rect x="-30" y="-22" width="60" height="44" rx="3" fill="${fill}" stroke="${stroke}" stroke-width="3"/>`;
    case "fullscreen":
      return `
        <rect x="-32" y="-24" width="64" height="48" rx="2" fill="${on ? `${color}33` : "none"}" stroke="${stroke}" stroke-width="3"/>
        <path d="M-22,-14 L-10,-14 L-22,-2 Z M22,-14 L10,-14 L22,-2 Z M-22,14 L-10,14 L-22,2 Z M22,14 L10,14 L22,2 Z" fill="${color}"/>
      `;
    case "fakefullscreen":
      return `
        <rect x="-32" y="-24" width="64" height="48" rx="2" fill="${on ? `${color}33` : "none"}" stroke="${stroke}" stroke-width="3" stroke-dasharray="4 3"/>
        <text x="0" y="8" font-family="${FONT}" font-size="22" font-weight="800" fill="${color}" text-anchor="middle">~</text>
      `;
    case "pin":
      return `
        <g fill="${color}" opacity="${on ? 1 : 0.6}">
          <circle cx="0" cy="-12" r="10"/>
          <rect x="-3" y="-2" width="6" height="22"/>
          <polygon points="-12,16 12,16 0,28"/>
        </g>
      `;
  }
}
function recordIconSvg({ recording, pulse = 0, mode = "region" }) {
  const accent = recording ? ACCENT_BAD : "#9ece6a";
  const dotOpacity = recording ? 0.6 + 0.4 * Math.sin(pulse * Math.PI * 2) : 0.95;
  const dotR = recording ? 22 + 2 * Math.sin(pulse * Math.PI * 2) : 22;
  const label = recording ? "REC" : "READY";
  const modeLabel = { region: "RGN", full: "FULL", "full-audio": "AUD" }[mode];
  const ring = recording ? `<circle cx="0" cy="0" r="32" fill="none" stroke="${accent}" stroke-width="3" opacity="0.4"/>` : `<circle cx="0" cy="0" r="32" fill="none" stroke="${accent}" stroke-width="3" stroke-dasharray="3 3"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${BG_INACTIVE}" stroke="${accent}66" stroke-width="2"/>
  <g transform="translate(72,58)">
    ${ring}
    <circle cx="0" cy="0" r="${dotR}" fill="${accent}" opacity="${dotOpacity}"/>
  </g>
  <text x="72" y="112" font-family="${FONT}" font-size="22" font-weight="800"
        fill="${accent}" text-anchor="middle">${label}</text>
  <text x="72" y="132" font-family="${FONT}" font-size="14" font-weight="600"
        fill="${accent}" opacity="0.7" text-anchor="middle">${modeLabel}</text>
</svg>`;
}
function screenshotIconSvg({ mode }) {
  const accent = "#7dcfff";
  const label = { region: "REGION", full: "FULL", "full-file": "FULL+SAVE" }[mode];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${BG_INACTIVE}" stroke="${accent}66" stroke-width="2"/>
  <g transform="translate(72,60)" fill="${accent}">
    <rect x="-36" y="-20" width="72" height="44" rx="6"/>
    <circle cx="0" cy="2" r="14" fill="${BG_INACTIVE}"/>
    <circle cx="0" cy="2" r="10" fill="${accent}"/>
    <rect x="-32" y="-28" width="20" height="8" rx="2"/>
  </g>
  <text x="72" y="128" font-family="${FONT}" font-size="${mode === "full-file" ? 16 : 20}" font-weight="700"
        fill="${accent}" text-anchor="middle">${label}</text>
</svg>`;
}
function dndIconSvg({ paused }) {
  const accent = paused ? ACCENT_BAD : ACCENT_OK;
  const label = paused ? "DND ON" : "ALERTS";
  const slash = paused ? `<line x1="-30" y1="-30" x2="30" y2="30" stroke="${accent}" stroke-width="6" stroke-linecap="round"/>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${BG_INACTIVE}" stroke="${accent}66" stroke-width="2"/>
  <g transform="translate(72,62)" fill="${accent}">
    <path d="M0,-32 C-15,-32 -22,-22 -22,-6 L-22,8 L-28,16 L28,16 L22,8 L22,-6 C22,-22 15,-32 0,-32 Z"/>
    <circle cx="0" cy="22" r="6"/>
  </g>
  ${slash ? `<g transform="translate(72,62)">${slash}</g>` : ""}
  <text x="72" y="128" font-family="${FONT}" font-size="20" font-weight="700"
        fill="${accent}" text-anchor="middle">${label}</text>
</svg>`;
}
function mediaIconSvg({ op, status = "None" }) {
  const playing = status === "Playing";
  const accent = op === "play-pause" ? playing ? ACCENT_OK : "#7aa2f7" : "#7aa2f7";
  const label = op === "next" ? "NEXT" : op === "prev" ? "PREV" : playing ? "PAUSE" : "PLAY";
  const glyph = mediaGlyph(op, status, accent);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${BG_INACTIVE}" stroke="${accent}66" stroke-width="2"/>
  <g transform="translate(72,60)">${glyph}</g>
  <text x="72" y="128" font-family="${FONT}" font-size="20" font-weight="700"
        fill="${accent}" text-anchor="middle">${label}</text>
</svg>`;
}
function mediaGlyph(op, status, color) {
  if (op === "play-pause") {
    if (status === "Playing") {
      return `<g fill="${color}">
        <rect x="-18" y="-22" width="10" height="44" rx="2"/>
        <rect x="8" y="-22" width="10" height="44" rx="2"/>
      </g>`;
    }
    return `<polygon points="-15,-22 -15,22 22,0" fill="${color}"/>`;
  }
  if (op === "next") {
    return `<g fill="${color}">
      <polygon points="-22,-22 -22,22 8,0"/>
      <rect x="12" y="-22" width="8" height="44" rx="1"/>
    </g>`;
  }
  return `<g fill="${color}">
    <rect x="-20" y="-22" width="8" height="44" rx="1"/>
    <polygon points="-8,0 22,-22 22,22"/>
  </g>`;
}
function sniffImageMime(buf) {
  if (buf.length >= 8 && buf[0] === 137 && buf[1] === 80 && buf[2] === 78 && buf[3] === 71) {
    return "image/png";
  }
  if (buf.length >= 3 && buf[0] === 255 && buf[1] === 216 && buf[2] === 255) {
    return "image/jpeg";
  }
  if (buf.length >= 12 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
    return "image/webp";
  }
  if (buf.length >= 6 && buf.toString("ascii", 0, 6).startsWith("GIF8")) {
    return "image/gif";
  }
  return "image/jpeg";
}
var renderCache = /* @__PURE__ */ new Map();
var RENDER_CACHE_MAX = 256;
async function cachedRender(ns, params, build) {
  const key = ns + ":" + JSON.stringify(params);
  const cached = renderCache.get(key);
  if (cached) {
    renderCache.delete(key);
    renderCache.set(key, cached);
    return cached;
  }
  const svg = build(params);
  const entry = { svg, dataUri: svgToDataUri(svg) };
  if (renderCache.size >= RENDER_CACHE_MAX) {
    const oldest = renderCache.keys().next().value;
    if (oldest !== void 0) renderCache.delete(oldest);
  }
  renderCache.set(key, entry);
  return entry;
}
var renderWorkspaceIcon = (p) => cachedRender("ws", p, workspaceIconSvg);
var renderMoveWindowIcon = (p) => cachedRender("movewin", p, moveWindowIconSvg);
var renderMuteIcon = (p) => cachedRender("mute", p, muteIconSvg);
var renderVolumeStepIcon = (p) => cachedRender("vol", p, volumeStepIconSvg);
var renderDirectionIcon = (p) => cachedRender("dir", p, directionIconSvg);
var renderCloseIcon = (p = {}) => cachedRender("close", p, closeIconSvg);
var renderWindowToggleIcon = (p) => cachedRender("wintoggle", p, windowToggleIconSvg);
var renderMonitorSwapIcon = (p) => cachedRender("monswap", p, monitorSwapIconSvg);
var renderResizeIcon = (p) => cachedRender("resize", p, resizeIconSvg);
var renderSwapWindowIcon = (p) => cachedRender("swapwin", p, swapWindowIconSvg);
var renderDiagnosticsIcon = (p) => cachedRender("diag", p, diagnosticsIconSvg);
var renderConfigTweakIcon = (p) => cachedRender("config-tweak", p, configTweakIconSvg);
var renderPresentationIcon = (p) => cachedRender("presentation", p, presentationIconSvg);
var renderRecordIcon = (p) => cachedRender("record", p, recordIconSvg);
var renderScreenshotIcon = (p) => cachedRender("screenshot", p, screenshotIconSvg);
var renderDndIcon = (p) => cachedRender("dnd", p, dndIconSvg);
var renderMediaIcon = (p) => cachedRender("media", p, mediaIconSvg);
var DISPLAY_ACCENT = "#7dcfff";
var DISPLAY_WARN = "#ffaa55";
var DISPLAY_CRIT = "#e93545";
var DISPLAY_OK = "#9ece6a";
function thresholdColor(value, warn, crit) {
  if (value >= crit) return DISPLAY_CRIT;
  if (value >= warn) return DISPLAY_WARN;
  return DISPLAY_ACCENT;
}
function displayShell(value, label, accent, indicator = "") {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${BG_INACTIVE}" stroke="${accent}66" stroke-width="2"/>
  <text x="72" y="76" font-family="${FONT}" font-size="44" font-weight="800"
        fill="${accent}" text-anchor="middle">${value}</text>
  <text x="72" y="104" font-family="${FONT}" font-size="18" font-weight="700"
        fill="${BUSY_FG}" text-anchor="middle">${label}</text>
  ${indicator}
</svg>`;
}
function progressBar(percent, color) {
  const ratio = Math.max(0, Math.min(1, percent / 100));
  const fullW = 110;
  const w = Math.max(4, Math.round(fullW * ratio));
  const x = 72 - fullW / 2;
  return `<g>
    <rect x="${x}" y="120" width="${fullW}" height="6" rx="3" fill="${color}33"/>
    <rect x="${x}" y="120" width="${w}" height="6" rx="3" fill="${color}"/>
  </g>`;
}
function clockIconSvg(p) {
  let h = p.now.getHours();
  const m = p.now.getMinutes();
  const s = p.now.getSeconds();
  let suffix = "";
  if (p.format === "12h") {
    suffix = h >= 12 ? " PM" : " AM";
    h = h % 12 || 12;
  }
  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  const time = p.showSeconds ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`;
  const fontSize = time.length > 5 ? 32 : 40;
  const date = p.showDate ? p.now.toLocaleDateString(void 0, { month: "short", day: "numeric" }) : "";
  const accent = DISPLAY_ACCENT;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${BG_INACTIVE}" stroke="${accent}66" stroke-width="2"/>
  <text x="72" y="78" font-family="${FONT}" font-size="${fontSize}" font-weight="800"
        fill="${accent}" text-anchor="middle">${time}${suffix}</text>
  <text x="72" y="108" font-family="${FONT}" font-size="14" font-weight="600"
        fill="${EMPTY_FG}" text-anchor="middle">${date || "CLOCK"}</text>
</svg>`;
}
async function renderClockIconImpl(p) {
  const display = {
    h: p.now.getHours(),
    m: p.now.getMinutes(),
    s: p.showSeconds ? p.now.getSeconds() : 0,
    f: p.format,
    sec: p.showSeconds,
    d: p.showDate ? p.now.toDateString() : ""
  };
  const key = `clock:${JSON.stringify(display)}`;
  const cached = renderCache.get(key);
  if (cached) {
    renderCache.delete(key);
    renderCache.set(key, cached);
    return cached;
  }
  const svg = clockIconSvg(p);
  const entry = { svg, dataUri: svgToDataUri(svg) };
  if (renderCache.size >= RENDER_CACHE_MAX) {
    const oldest = renderCache.keys().next().value;
    if (oldest !== void 0) renderCache.delete(oldest);
  }
  renderCache.set(key, entry);
  return entry;
}
var renderClockIcon = renderClockIconImpl;
function cpuIconSvg(p) {
  const color = thresholdColor(p.percent, p.warnPct, p.critPct);
  return displayShell(`${p.percent}%`, "CPU", color, progressBar(p.percent, color));
}
var renderCpuIcon = (p) => cachedRender("cpu-disp", p, cpuIconSvg);
function ramIconSvg(p) {
  const color = thresholdColor(p.percent, p.warnPct, p.critPct);
  const label = p.totalGb > 0 ? `RAM ${p.totalGb}G` : "RAM";
  return displayShell(`${p.percent}%`, label, color, progressBar(p.percent, color));
}
var renderRamIcon = (p) => cachedRender("ram-disp", p, ramIconSvg);
function batteryIconSvg(p) {
  const accent = DISPLAY_ACCENT;
  if (p.percent === null) {
    return displayShell("\u2014", "NO BAT", EMPTY_FG, "");
  }
  const color = p.charging ? DISPLAY_OK : p.percent <= p.warnPct ? DISPLAY_CRIT : p.percent <= p.warnPct + 15 ? DISPLAY_WARN : accent;
  const bolt = p.charging ? `<g transform="translate(118,26)" fill="${DISPLAY_OK}">
         <polygon points="-2,-12 -8,2 -2,2 -4,12 8,-2 2,-2 4,-12"/>
       </g>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${BG_INACTIVE}" stroke="${color}66" stroke-width="2"/>
  <text x="72" y="76" font-family="${FONT}" font-size="44" font-weight="800"
        fill="${color}" text-anchor="middle">${p.percent}%</text>
  <text x="72" y="104" font-family="${FONT}" font-size="18" font-weight="700"
        fill="${BUSY_FG}" text-anchor="middle">${p.charging ? "CHARGING" : "BATTERY"}</text>
  ${progressBar(p.percent, color)}
  ${bolt}
</svg>`;
}
var renderBatteryIcon = (p) => cachedRender("battery-disp", p, batteryIconSvg);
function temperatureIconSvg(p) {
  if (p.celsius === null) return displayShell("\u2014", "NO TEMP", EMPTY_FG, "");
  const color = thresholdColor(p.celsius, p.warnC, p.critC);
  const barPercent = Math.max(0, Math.min(100, p.celsius));
  return displayShell(`${p.celsius}\xB0`, "TEMP", color, progressBar(barPercent, color));
}
var renderTemperatureIcon = (p) => cachedRender("temp-disp", p, temperatureIconSvg);
function uptimeIconSvg(p) {
  const fontSize = p.label.length > 6 ? 30 : 38;
  const accent = DISPLAY_ACCENT;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="20" fill="${BG_INACTIVE}" stroke="${accent}66" stroke-width="2"/>
  <text x="72" y="80" font-family="${FONT}" font-size="${fontSize}" font-weight="800"
        fill="${accent}" text-anchor="middle">${p.label}</text>
  <text x="72" y="108" font-family="${FONT}" font-size="18" font-weight="700"
        fill="${BUSY_FG}" text-anchor="middle">UPTIME</text>
</svg>`;
}
var renderUptimeIcon = (p) => cachedRender("uptime-disp", p, uptimeIconSvg);
async function renderMediaIconWithArt(p) {
  const fp = p.artUrl ?? (0, import_node_crypto.createHash)("sha256").update(p.art).digest("hex");
  const key = `media-art:${fp}:${p.op}:${p.status ?? "None"}`;
  const cached = renderCache.get(key);
  if (cached) {
    renderCache.delete(key);
    renderCache.set(key, cached);
    return cached;
  }
  const svg = mediaIconWithArtSvg(p);
  const entry = { svg, dataUri: svgToDataUri(svg) };
  if (renderCache.size >= RENDER_CACHE_MAX) {
    const oldest = renderCache.keys().next().value;
    if (oldest !== void 0) renderCache.delete(oldest);
  }
  renderCache.set(key, entry);
  return entry;
}
function mediaIconWithArtSvg({ op, art, status = "None" }) {
  const accent = "#ffffff";
  const label = op === "next" ? "NEXT" : op === "prev" ? "PREV" : status === "Playing" ? "PAUSE" : "PLAY";
  const glyph = mediaGlyph(op, status, accent);
  const mime = sniffImageMime(art);
  const artUri = `data:${mime};base64,${art.toString("base64")}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 144 144">
  <defs>
    <clipPath id="rounded"><rect width="144" height="144" rx="20"/></clipPath>
  </defs>
  <g clip-path="url(#rounded)">
    <image href="${artUri}" xlink:href="${artUri}" x="0" y="0" width="144" height="144" preserveAspectRatio="xMidYMid slice"/>
    <rect width="144" height="144" fill="#000000" opacity="0.5"/>
  </g>
  <g transform="translate(72,60)">${glyph}</g>
  <rect x="6" y="112" width="132" height="26" rx="6" fill="#000000" opacity="0.55"/>
  <text x="72" y="130" font-family="${FONT}" font-size="18" font-weight="800"
        fill="${accent}" text-anchor="middle">${label}</text>
</svg>`;
}

// src/actions/workspace.ts
var _WorkspaceFocusAction_decorators, _init, _a;
_WorkspaceFocusAction_decorators = [action({ UUID: "com.danmaxis.hyprstream.workspace.focus" })];
var WorkspaceFocusAction = class extends (_a = SingletonAction) {
  contexts = /* @__PURE__ */ new Map();
  state;
  constructor(state) {
    super();
    this.state = state;
    this.state.on("change", () => void this.repaintAll());
  }
  async onWillAppear(ev) {
    this.contexts.set(ev.action.id, ev.payload.settings);
    console.error(
      `[hyprstream] onWillAppear id=${ev.action.id} settings=${JSON.stringify(ev.payload.settings)}`
    );
    if (ev.action.isKey()) await this.repaint(ev.action, ev.payload.settings);
  }
  onWillDisappear(ev) {
    this.contexts.delete(ev.action.id);
  }
  async onDidReceiveSettings(ev) {
    this.contexts.set(ev.action.id, ev.payload.settings);
    if (ev.action.isKey()) await this.repaint(ev.action, ev.payload.settings);
  }
  async onKeyDown(ev) {
    const sel = parseSettings(ev.payload.settings);
    console.error(
      `[hyprstream] onKeyDown sel=${JSON.stringify(sel)} settings=${JSON.stringify(ev.payload.settings)}`
    );
    try {
      const out = await this.state.hyprctl.focusWorkspace(sel);
      console.error(`[hyprstream] dispatch ok: ${out}`);
    } catch (err) {
      const msg = stringify(err);
      console.error(`[hyprstream] dispatch FAILED: ${msg}`);
      streamDeck.logger.error(`workspace.focus dispatch failed: ${msg}`);
      await ev.action.showAlert();
    }
  }
  async repaintAll() {
    const tasks = [];
    for (const a of this.actions) {
      if (!a.isKey()) continue;
      const settings2 = this.contexts.get(a.id);
      if (settings2 === void 0) continue;
      tasks.push(this.repaint(a, settings2));
    }
    await Promise.all(tasks);
  }
  async repaint(action2, settings2) {
    const sel = parseSettings(settings2);
    const countDisplay = clampCountDisplay(settings2.countDisplay);
    if (sel.kind === "numeric") {
      const ws = this.state.getWorkspace(sel.index);
      const isActive2 = this.state.activeWorkspaceId === sel.index;
      const icon2 = await renderWorkspaceIcon({
        index: sel.index,
        state: stateOf(isActive2, ws),
        windowCount: ws.windows,
        activeColor: settings2.color,
        countDisplay
      });
      await action2.setImage(icon2.dataUri);
      return;
    }
    const label = toDisplayLabel(sel);
    const isActive = isSelectorActive(sel, this.state);
    const icon = await renderWorkspaceIcon({
      index: 0,
      // unused when label is present
      state: isActive ? "active" : "empty",
      activeColor: settings2.color,
      countDisplay,
      label
    });
    await action2.setImage(icon.dataUri);
  }
};
_init = __decoratorStart(_a);
WorkspaceFocusAction = __decorateElement(_init, 0, "WorkspaceFocusAction", _WorkspaceFocusAction_decorators, WorkspaceFocusAction);
__runInitializers(_init, 1, WorkspaceFocusAction);
var _WorkspaceMoveWindowAction_decorators, _init2, _a2;
_WorkspaceMoveWindowAction_decorators = [action({ UUID: "com.danmaxis.hyprstream.workspace.move-window" })];
var WorkspaceMoveWindowAction = class extends (_a2 = SingletonAction) {
  contexts = /* @__PURE__ */ new Set();
  state;
  constructor(state) {
    super();
    this.state = state;
  }
  async onWillAppear(ev) {
    this.contexts.add(ev.action.id);
    if (ev.action.isKey()) await this.repaint(ev.action, ev.payload.settings);
  }
  onWillDisappear(ev) {
    this.contexts.delete(ev.action.id);
  }
  async onDidReceiveSettings(ev) {
    if (ev.action.isKey()) await this.repaint(ev.action, ev.payload.settings);
  }
  async onKeyDown(ev) {
    const sel = parseSettings(ev.payload.settings);
    const follow = ev.payload.settings.followFocus === true;
    console.error(`[hyprstream] move-window sel=${JSON.stringify(sel)} follow=${follow}`);
    try {
      await this.state.hyprctl.moveActiveToWorkspace(sel, !follow);
      console.error(`[hyprstream] move-window dispatch ok`);
    } catch (err) {
      const msg = stringify(err);
      console.error(`[hyprstream] move-window FAILED: ${msg}`);
      streamDeck.logger.error(`workspace.move-window failed: ${msg}`);
      await ev.action.showAlert();
    }
  }
  async repaint(action2, settings2) {
    const sel = parseSettings(settings2);
    const label = sel.kind === "numeric" ? void 0 : toDisplayLabel(sel);
    const icon = await renderMoveWindowIcon({
      index: sel.kind === "numeric" ? sel.index : 0,
      accentColor: settings2.color,
      label
    });
    await action2.setImage(icon.dataUri);
  }
};
_init2 = __decoratorStart(_a2);
WorkspaceMoveWindowAction = __decorateElement(_init2, 0, "WorkspaceMoveWindowAction", _WorkspaceMoveWindowAction_decorators, WorkspaceMoveWindowAction);
__runInitializers(_init2, 1, WorkspaceMoveWindowAction);
function isSelectorActive(sel, state) {
  if (sel.kind === "scratchpad") {
    return state.activeSpecial?.name === "scratchpad";
  }
  if (sel.kind === "special") {
    return state.activeSpecial?.name === sel.name;
  }
  return false;
}
function clampCountDisplay(d) {
  return d === "badge" || d === "dots" || d === "bar" || d === "none" ? d : "badge";
}
function stateOf(active, ws) {
  if (active) return "active";
  if (ws.windows > 0) return "busy";
  return "empty";
}
function stringify(err) {
  if (err instanceof Error) return err.message;
  return String(err);
}

// src/actions/audio.ts
var AudioAction = class extends SingletonAction {
  contexts = /* @__PURE__ */ new Map();
  state;
  constructor(state) {
    super();
    this.state = state;
    this.state.on("change", () => void this.repaintAll());
  }
  async onWillAppear(ev) {
    if (this.contexts.size === 0) this.state.acquire();
    this.contexts.set(ev.action.id, ev.payload.settings);
    console.error(`[hyprstream] ${this.constructor.name}.onWillAppear id=${ev.action.id}`);
    if (ev.action.isKey()) await this.repaint(ev.action, ev.payload.settings);
  }
  onWillDisappear(ev) {
    if (this.contexts.delete(ev.action.id) && this.contexts.size === 0) this.state.release();
  }
  async onDidReceiveSettings(ev) {
    this.contexts.set(ev.action.id, ev.payload.settings);
    if (ev.action.isKey()) await this.repaint(ev.action, ev.payload.settings);
  }
  /**
   * Repaint every visible action in parallel using the settings cached at
   * willAppear/didReceiveSettings time — no SDK getSettings() round-trips.
   */
  async repaintAll() {
    const tasks = [];
    for (const a of this.actions) {
      if (!a.isKey()) continue;
      const settings2 = this.contexts.get(a.id);
      if (settings2 === void 0) continue;
      tasks.push(this.repaint(a, settings2));
    }
    await Promise.all(tasks);
  }
};
var _MuteMicAction_decorators, _init3, _a3;
_MuteMicAction_decorators = [action({ UUID: "com.danmaxis.hyprstream.audio.mute-mic" })];
var MuteMicAction = class extends (_a3 = AudioAction) {
  async onKeyDown(ev) {
    console.error(`[hyprstream] mute-mic press`);
    await this.toggle(ev, "source");
  }
  async repaint(action2) {
    const status = this.state.get("source");
    const icon = await renderMuteIcon({ kind: "mic", muted: status.muted });
    await action2.setImage(icon.dataUri);
  }
  async toggle(ev, target) {
    try {
      await this.state.pipewire.setMute(target, "toggle");
      await this.state.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[hyprstream] mute-${target} FAILED: ${msg}`);
      streamDeck.logger.error(`audio.mute-${target} failed: ${msg}`);
      await ev.action.showAlert();
    }
  }
};
_init3 = __decoratorStart(_a3);
MuteMicAction = __decorateElement(_init3, 0, "MuteMicAction", _MuteMicAction_decorators, MuteMicAction);
__runInitializers(_init3, 1, MuteMicAction);
var _MuteSinkAction_decorators, _init4, _a4;
_MuteSinkAction_decorators = [action({ UUID: "com.danmaxis.hyprstream.audio.mute-sink" })];
var MuteSinkAction = class extends (_a4 = AudioAction) {
  async onKeyDown(ev) {
    console.error(`[hyprstream] mute-sink press`);
    try {
      await this.state.pipewire.setMute("sink", "toggle");
      await this.state.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[hyprstream] mute-sink FAILED: ${msg}`);
      streamDeck.logger.error(`audio.mute-sink failed: ${msg}`);
      await ev.action.showAlert();
    }
  }
  async repaint(action2) {
    const status = this.state.get("sink");
    const icon = await renderMuteIcon({
      kind: "sink",
      muted: status.muted,
      volume: status.volume
    });
    await action2.setImage(icon.dataUri);
  }
};
_init4 = __decoratorStart(_a4);
MuteSinkAction = __decorateElement(_init4, 0, "MuteSinkAction", _MuteSinkAction_decorators, MuteSinkAction);
__runInitializers(_init4, 1, MuteSinkAction);
var _VolumeStepAction_decorators, _init5, _a5;
_VolumeStepAction_decorators = [action({ UUID: "com.danmaxis.hyprstream.audio.volume-step" })];
var VolumeStepAction = class extends (_a5 = AudioAction) {
  async onKeyDown(ev) {
    const delta = clampDelta(ev.payload.settings.delta);
    console.error(`[hyprstream] volume-step delta=${delta}`);
    try {
      await this.state.pipewire.stepVolume("sink", delta);
      await this.state.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[hyprstream] volume-step FAILED: ${msg}`);
      streamDeck.logger.error(`audio.volume-step failed: ${msg}`);
      await ev.action.showAlert();
    }
  }
  async repaint(action2, settings2) {
    const status = this.state.get("sink");
    const icon = await renderVolumeStepIcon({
      delta: clampDelta(settings2.delta),
      volume: status.volume,
      muted: status.muted
    });
    await action2.setImage(icon.dataUri);
  }
};
_init5 = __decoratorStart(_a5);
VolumeStepAction = __decorateElement(_init5, 0, "VolumeStepAction", _VolumeStepAction_decorators, VolumeStepAction);
__runInitializers(_init5, 1, VolumeStepAction);
function clampDelta(d) {
  const n = Number(d);
  if (!Number.isFinite(n) || n === 0) return 5;
  return Math.max(-100, Math.min(100, Math.trunc(n)));
}

// src/actions/confirm.ts
function computeConfirmFrame(start, confirmMs, now) {
  if (confirmMs <= 0) return { remaining: 0, expired: true };
  const elapsed = now - start;
  const raw = 1 - elapsed / confirmMs;
  const clamped = Math.max(0, Math.min(1, raw));
  const remaining = Math.round(clamped * 10) / 10;
  return { remaining, expired: elapsed >= confirmMs };
}
function isWithinConfirmWindow(start, confirmMs, now) {
  if (confirmMs <= 0) return false;
  return now - start < confirmMs;
}

// src/actions/window.ts
var StaticIconAction = class extends SingletonAction {
  contexts = /* @__PURE__ */ new Set();
  hyprctl;
  constructor(hyprctl2) {
    super();
    this.hyprctl = hyprctl2;
  }
  async onWillAppear(ev) {
    this.contexts.add(ev.action.id);
    if (ev.action.isKey()) await this.repaint(ev.action, ev.payload.settings);
  }
  onWillDisappear(ev) {
    this.contexts.delete(ev.action.id);
  }
  async onDidReceiveSettings(ev) {
    if (ev.action.isKey()) await this.repaint(ev.action, ev.payload.settings);
  }
  async setKeyImage(action2, dataUri) {
    await action2.setImage(dataUri);
  }
  async run(ev, op, fn) {
    try {
      await fn();
      console.error(`[hyprstream] ${op} ok`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[hyprstream] ${op} FAILED: ${msg}`);
      streamDeck.logger.error(`${op} failed: ${msg}`);
      await ev.action.showAlert();
    }
  }
};
var _WindowFocusDirectionAction_decorators, _init6, _a6;
_WindowFocusDirectionAction_decorators = [action({ UUID: "com.danmaxis.hyprstream.window.focus-direction" })];
var WindowFocusDirectionAction = class extends (_a6 = StaticIconAction) {
  async onKeyDown(ev) {
    const dir = clampDirection(ev.payload.settings.direction);
    console.error(`[hyprstream] focus-direction ${dir}`);
    await this.run(ev, `window.focus-${dir}`, () => this.hyprctl.focusDirection(dir));
  }
  async repaint(action2, settings2) {
    const icon = await renderDirectionIcon({ direction: clampDirection(settings2.direction) });
    await this.setKeyImage(action2, icon.dataUri);
  }
};
_init6 = __decoratorStart(_a6);
WindowFocusDirectionAction = __decorateElement(_init6, 0, "WindowFocusDirectionAction", _WindowFocusDirectionAction_decorators, WindowFocusDirectionAction);
__runInitializers(_init6, 1, WindowFocusDirectionAction);
var _WindowCloseAction_decorators, _init7, _a7;
_WindowCloseAction_decorators = [action({ UUID: "com.danmaxis.hyprstream.window.close" })];
var WindowCloseAction = class extends (_a7 = StaticIconAction) {
  confirmState = /* @__PURE__ */ new Map();
  async onKeyDown(ev) {
    const mode = clampCloseMode(ev.payload.settings.mode);
    const confirm = resolveConfirmMode(ev.payload.settings.confirmMode, mode);
    if (confirm === "none") {
      console.error(`[hyprstream] window.close mode=${mode} (instant)`);
      await this.dispatchClose(ev, mode);
      return;
    }
    if (!ev.action.isKey()) return;
    const confirmMs = clampConfirmMs(ev.payload.settings.confirmMs);
    const existing = this.confirmState.get(ev.action.id);
    if (existing && isWithinConfirmWindow(existing.start, confirmMs, Date.now())) {
      clearInterval(existing.timer);
      this.confirmState.delete(ev.action.id);
      console.error(`[hyprstream] window.close mode=${mode} (second tap \u2192 fire)`);
      await this.paintFrame(ev.action, ev.payload.settings, 0);
      await this.dispatchClose(ev, mode);
      return;
    }
    console.error(`[hyprstream] window.close mode=${mode} (armed, window=${confirmMs}ms)`);
    this.arm(ev.action, ev.payload.settings, confirmMs);
  }
  onWillDisappear(ev) {
    const state = this.confirmState.get(ev.action.id);
    if (state) {
      clearInterval(state.timer);
      this.confirmState.delete(ev.action.id);
    }
    super.onWillDisappear(ev);
  }
  async repaint(action2, settings2) {
    await this.paintFrame(action2, settings2, 0);
  }
  async paintFrame(action2, settings2, remaining) {
    const icon = await renderCloseIcon({
      mode: clampCloseMode(settings2.mode),
      armedRemaining: remaining
    });
    await this.setKeyImage(action2, icon.dataUri);
  }
  arm(action2, settings2, confirmMs) {
    const prior = this.confirmState.get(action2.id);
    if (prior) clearInterval(prior.timer);
    const start = Date.now();
    let lastRemaining = -1;
    const tick = async () => {
      const frame = computeConfirmFrame(start, confirmMs, Date.now());
      if (frame.remaining !== lastRemaining) {
        lastRemaining = frame.remaining;
        await this.paintFrame(action2, settings2, frame.remaining);
      }
      if (frame.expired) {
        const s = this.confirmState.get(action2.id);
        if (s) clearInterval(s.timer);
        this.confirmState.delete(action2.id);
        await this.paintFrame(action2, settings2, 0);
        console.error(`[hyprstream] window.close confirm window elapsed (disarmed)`);
      }
    };
    const timer = setInterval(() => void tick(), 60);
    this.confirmState.set(action2.id, { start, timer });
    void tick();
  }
  async dispatchClose(ev, mode) {
    if (mode === "active") {
      await this.run(ev, "window.close", () => this.hyprctl.closeWindow());
    } else {
      await this.run(ev, "window.close-workspace", async () => {
        const ws = await this.hyprctl.activeWorkspace();
        const closed = await this.hyprctl.closeWorkspaceWindows(ws.id);
        console.error(`[hyprstream] closed ${closed} windows on ws=${ws.id}`);
      });
    }
  }
};
_init7 = __decoratorStart(_a7);
WindowCloseAction = __decorateElement(_init7, 0, "WindowCloseAction", _WindowCloseAction_decorators, WindowCloseAction);
__runInitializers(_init7, 1, WindowCloseAction);
var _WindowToggleAction_decorators, _init8, _a8;
_WindowToggleAction_decorators = [action({ UUID: "com.danmaxis.hyprstream.window.toggle" })];
var WindowToggleAction = class extends (_a8 = SingletonAction) {
  contexts = /* @__PURE__ */ new Map();
  state;
  constructor(state) {
    super();
    this.state = state;
    this.state.on("change", () => void this.repaintAll());
  }
  async onWillAppear(ev) {
    this.contexts.set(ev.action.id, ev.payload.settings);
    if (ev.action.isKey()) await this.repaint(ev.action, ev.payload.settings);
  }
  onWillDisappear(ev) {
    this.contexts.delete(ev.action.id);
  }
  async onDidReceiveSettings(ev) {
    this.contexts.set(ev.action.id, ev.payload.settings);
    if (ev.action.isKey()) await this.repaint(ev.action, ev.payload.settings);
  }
  async onKeyDown(ev) {
    const mode = clampMode(ev.payload.settings.mode);
    console.error(`[hyprstream] window.toggle ${mode}`);
    try {
      await this.dispatchToggle(mode);
      await this.state.refresh();
      console.error(`[hyprstream] window.toggle ok`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[hyprstream] window.toggle FAILED: ${msg}`);
      streamDeck.logger.error(`window.toggle failed: ${msg}`);
      await ev.action.showAlert();
    }
  }
  async repaintAll() {
    const tasks = [];
    for (const a of this.actions) {
      if (!a.isKey()) continue;
      const settings2 = this.contexts.get(a.id);
      if (settings2 === void 0) continue;
      tasks.push(this.repaint(a, settings2));
    }
    await Promise.all(tasks);
  }
  async repaint(action2, settings2) {
    const mode = clampMode(settings2.mode);
    const on = isToggleOn(mode, this.state.activeClient);
    const icon = await renderWindowToggleIcon({ mode, on });
    await action2.setImage(icon.dataUri);
  }
  dispatchToggle(mode) {
    switch (mode) {
      case "float":
        return this.hyprctl.toggleFloating();
      case "maximize":
        return this.hyprctl.toggleFullscreen(1);
      case "fullscreen":
        return this.hyprctl.toggleFullscreen(0);
      case "fakefullscreen":
        return this.hyprctl.toggleFakeFullscreen();
      case "pin":
        return this.hyprctl.pin();
    }
  }
  get hyprctl() {
    return this.state.hyprctl;
  }
};
_init8 = __decoratorStart(_a8);
WindowToggleAction = __decorateElement(_init8, 0, "WindowToggleAction", _WindowToggleAction_decorators, WindowToggleAction);
__runInitializers(_init8, 1, WindowToggleAction);
var _MonitorSwapAction_decorators, _init9, _a9;
_MonitorSwapAction_decorators = [action({ UUID: "com.danmaxis.hyprstream.window.swap-monitors" })];
var MonitorSwapAction = class extends (_a9 = StaticIconAction) {
  async onKeyDown(ev) {
    const dir = clampDirection(ev.payload.settings.direction);
    console.error(`[hyprstream] swap-monitors current<->${dir}`);
    await this.run(
      ev,
      `window.swap-monitors-${dir}`,
      () => this.hyprctl.swapActiveWorkspaces("current", dir)
    );
  }
  async repaint(action2, settings2) {
    const icon = await renderMonitorSwapIcon({ direction: clampDirection(settings2.direction) });
    await this.setKeyImage(action2, icon.dataUri);
  }
};
_init9 = __decoratorStart(_a9);
MonitorSwapAction = __decorateElement(_init9, 0, "MonitorSwapAction", _MonitorSwapAction_decorators, MonitorSwapAction);
__runInitializers(_init9, 1, MonitorSwapAction);
function clampDirection(d) {
  return d === "l" || d === "r" || d === "u" || d === "d" ? d : "l";
}
function clampCloseMode(m) {
  return m === "workspace" ? "workspace" : "active";
}
function clampConfirmMs(n) {
  const v = Number(n);
  if (!Number.isFinite(v) || v <= 0) return 3e3;
  return Math.max(500, Math.min(1e4, Math.trunc(v)));
}
function resolveConfirmMode(c, mode) {
  if (c === "tap" || c === "hold") return "tap";
  if (c === "none") return "none";
  return mode === "workspace" ? "tap" : "none";
}
var TOGGLE_MODES = [
  "float",
  "maximize",
  "fullscreen",
  "fakefullscreen",
  "pin"
];
function clampMode(m) {
  return TOGGLE_MODES.includes(m) ? m : "fullscreen";
}
function isToggleOn(mode, client) {
  if (!client) return false;
  switch (mode) {
    case "float":
      return client.floating === true;
    case "maximize":
      return client.fullscreen === "maximize";
    case "fullscreen":
      return client.fullscreen === "fullscreen";
    case "pin":
      return client.pinned === true;
    case "fakefullscreen":
      return false;
  }
}
var _WindowResizeActiveAction_decorators, _init10, _a10;
_WindowResizeActiveAction_decorators = [action({ UUID: "com.danmaxis.hyprstream.window.resize-active" })];
var WindowResizeActiveAction = class extends (_a10 = StaticIconAction) {
  async onKeyDown(ev) {
    const dir = clampDirection(ev.payload.settings.direction);
    const pixels = clampPixels(ev.payload.settings.pixels);
    const [dx, dy] = resizeDeltas(dir, pixels);
    console.error(`[hyprstream] resize-active ${dir} ${pixels}px -> ${dx},${dy}`);
    await this.run(
      ev,
      `window.resize-active-${dir}-${pixels}`,
      () => this.hyprctl.resizeActive(dx, dy)
    );
  }
  async repaint(action2, settings2) {
    const icon = await renderResizeIcon({
      direction: clampDirection(settings2.direction),
      pixels: clampPixels(settings2.pixels)
    });
    await this.setKeyImage(action2, icon.dataUri);
  }
};
_init10 = __decoratorStart(_a10);
WindowResizeActiveAction = __decorateElement(_init10, 0, "WindowResizeActiveAction", _WindowResizeActiveAction_decorators, WindowResizeActiveAction);
__runInitializers(_init10, 1, WindowResizeActiveAction);
var _WindowSwapNeighborAction_decorators, _init11, _a11;
_WindowSwapNeighborAction_decorators = [action({ UUID: "com.danmaxis.hyprstream.window.swap-neighbor" })];
var WindowSwapNeighborAction = class extends (_a11 = StaticIconAction) {
  async onKeyDown(ev) {
    const dir = clampDirection(ev.payload.settings.direction);
    console.error(`[hyprstream] swap-neighbor ${dir}`);
    await this.run(ev, `window.swap-neighbor-${dir}`, () => this.hyprctl.swapWindow(dir));
  }
  async repaint(action2, settings2) {
    const icon = await renderSwapWindowIcon({ direction: clampDirection(settings2.direction) });
    await this.setKeyImage(action2, icon.dataUri);
  }
};
_init11 = __decoratorStart(_a11);
WindowSwapNeighborAction = __decorateElement(_init11, 0, "WindowSwapNeighborAction", _WindowSwapNeighborAction_decorators, WindowSwapNeighborAction);
__runInitializers(_init11, 1, WindowSwapNeighborAction);
function clampPixels(n) {
  const v = Number(n);
  if (!Number.isFinite(v) || v === 0) return 80;
  const abs = Math.min(2e3, Math.max(1, Math.abs(Math.trunc(v))));
  return abs;
}
function resizeDeltas(dir, pixels) {
  switch (dir) {
    case "l":
      return [-pixels, 0];
    case "r":
      return [pixels, 0];
    case "u":
      return [0, -pixels];
    case "d":
      return [0, pixels];
  }
}

// src/actions/diagnostics.ts
var _HyprstreamDiagnosticsAction_decorators, _init12, _a12;
_HyprstreamDiagnosticsAction_decorators = [action({ UUID: "com.danmaxis.hyprstream.diagnostics" })];
var HyprstreamDiagnosticsAction = class extends (_a12 = SingletonAction) {
  state;
  contexts = /* @__PURE__ */ new Set();
  socketConnected = false;
  constructor(state) {
    super();
    this.state = state;
    this.state.socket.on("connect", () => {
      this.socketConnected = true;
      void this.repaintAll();
    });
    this.state.socket.on("disconnect", () => {
      this.socketConnected = false;
      void this.repaintAll();
    });
    this.state.on("change", () => void this.repaintAll());
    this.state.on("degraded", () => void this.repaintAll());
    this.state.on("recovered", () => void this.repaintAll());
    this.state.on("error", () => void this.repaintAll());
  }
  async onWillAppear(ev) {
    this.contexts.add(ev.action.id);
    if (ev.action.isKey()) await this.repaint(ev.action);
  }
  onWillDisappear(ev) {
    this.contexts.delete(ev.action.id);
  }
  async onKeyDown(ev) {
    const snapshot = this.snapshot();
    const lines = [
      `[hyprstream] === diagnostics ===`,
      `  resolved: ${JSON.stringify(snapshot.resolved)}`,
      `  socket connected: ${this.socketConnected}`,
      `  degraded: ${this.state.isDegraded}`,
      `  last refresh error: ${this.state.lastRefreshError?.message ?? "<none>"}`,
      `  last hyprctl failure: ${snapshot.lastFailure ? JSON.stringify(snapshot.lastFailure) : "<none>"}`
    ];
    for (const line of lines) console.error(line);
    try {
      const version = await this.state.hyprctl.version();
      console.error(`[hyprstream]   hyprctl version:
${version}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[hyprstream]   hyprctl version: FAILED (${msg})`);
      await ev.action.showAlert();
      return;
    }
    streamDeck.logger.info("hyprstream diagnostics dumped to stderr");
  }
  snapshot() {
    return {
      resolved: this.state.socket.resolved,
      lastFailure: this.state.hyprctl.lastFailure
    };
  }
  currentParams() {
    const resolved = this.state.socket.resolved;
    const lastFailure = this.state.hyprctl.lastFailure;
    const envStatus = !resolved || resolved.via === "missing" ? "down" : "ok";
    const socketStatus = this.socketConnected ? "ok" : "down";
    const hyprctlStatus = this.state.isDegraded ? "degraded" : lastFailure && Date.now() - lastFailure.at < 5e3 ? "degraded" : "ok";
    return {
      env: envStatus,
      socket: socketStatus,
      hyprctl: hyprctlStatus,
      via: resolved?.via
    };
  }
  async repaintAll() {
    const tasks = [];
    for (const a of this.actions) {
      if (!a.isKey()) continue;
      tasks.push(this.repaint(a));
    }
    await Promise.all(tasks);
  }
  async repaint(action2) {
    const icon = await renderDiagnosticsIcon(this.currentParams());
    await action2.setImage(icon.dataUri);
  }
};
_init12 = __decoratorStart(_a12);
HyprstreamDiagnosticsAction = __decorateElement(_init12, 0, "HyprstreamDiagnosticsAction", _HyprstreamDiagnosticsAction_decorators, HyprstreamDiagnosticsAction);
__runInitializers(_init12, 1, HyprstreamDiagnosticsAction);

// src/actions/config-tweak.ts
var CONFIG_PRESETS = {
  gaps: {
    label: "GAPS",
    keyword: "general:gaps_in",
    values: ["0", "12"],
    parse: parseNumber
  },
  border: {
    label: "BORDER",
    keyword: "general:border_size",
    values: ["1", "4"],
    parse: parseNumber
  },
  rounding: {
    label: "ROUND",
    keyword: "decoration:rounding",
    values: ["0", "12"],
    parse: parseNumber
  },
  blur: {
    label: "BLUR",
    keyword: "decoration:blur:enabled",
    values: ["false", "true"],
    parse: parseBoolish
  },
  glow: {
    label: "GLOW",
    keyword: "decoration:glow:enabled",
    values: ["false", "true"],
    parse: parseBoolish
  },
  animations: {
    label: "ANIM",
    keyword: "animations:enabled",
    values: ["false", "true"],
    parse: parseBoolish
  },
  // NOTE: `general:cursor_size` was removed in Hyprland 0.55 — the official
  // way is now the standard XDG cursor env vars (XCURSOR_SIZE +
  // HYPRCURSOR_SIZE). The keyword string here is a sentinel; the action's
  // onKeyDown detects `preset === "cursor-size"` and routes to hl.env
  // writes instead of the standard read+keyword path. There's no read
  // path (hl.env is write-only on the IPC), so we track the toggle index
  // locally per-action — the icon shows the value we most recently set.
  "cursor-size": {
    label: "CURSOR",
    keyword: "(env-only)",
    values: ["24", "48"],
    parse: parseNumber
  },
  "cursor-zoom": {
    label: "ZOOM",
    keyword: "cursor:zoom_factor",
    values: ["1.0", "1.6"],
    parse: parseNumber
  },
  "dim-inactive": {
    label: "DIM",
    keyword: "decoration:dim_inactive",
    values: ["false", "true"],
    parse: parseBoolish
  }
};
var CONFIG_PRESET_KEYS = Object.keys(CONFIG_PRESETS);
function resolveTweak(s) {
  const preset = s.preset ?? "gaps";
  if (preset === "custom") {
    const values = (s.values ?? "").split(",").map((v) => v.trim()).filter((v) => v.length > 0);
    return {
      label: s.label?.trim() || "TWEAK",
      keyword: s.keyword?.trim() || "",
      values: values.length >= 2 ? values : ["0", "1"]
    };
  }
  const p = CONFIG_PRESETS[preset] ?? CONFIG_PRESETS.gaps;
  return { label: p.label, keyword: p.keyword, values: [...p.values] };
}
function parseNumber(raw) {
  const num = Number(raw);
  if (!Number.isFinite(num)) return raw.trim();
  return Number.isInteger(num) ? String(num) : num.toFixed(2).replace(/\.?0+$/, "");
}
function parseBoolish(raw) {
  const t = raw.trim().toLowerCase();
  if (t === "true" || t === "1" || t === "yes" || t === "on") return "ON";
  if (t === "false" || t === "0" || t === "no" || t === "off" || t === "") return "OFF";
  return raw.trim();
}
function pickNextValue(current2, values) {
  if (values.length === 0) return current2;
  const norm = (v) => v.trim().toLowerCase();
  const cur = norm(current2);
  for (let i = 0; i < values.length; i++) {
    const candidate = norm(values[i]);
    if (cur === candidate || // numeric equality (so "12" matches "12.0")
    isFiniteNumber(cur) && isFiniteNumber(candidate) && Number(cur) === Number(candidate) || // boolean equality (true/1 and false/0 interchangeable)
    asBool(cur) !== null && asBool(cur) === asBool(candidate)) {
      return values[(i + 1) % values.length];
    }
  }
  return values[0];
}
function isFiniteNumber(s) {
  return s !== "" && Number.isFinite(Number(s));
}
function asBool(s) {
  if (s === "true" || s === "1" || s === "yes" || s === "on") return true;
  if (s === "false" || s === "0" || s === "no" || s === "off") return false;
  return null;
}
var _ConfigTweakAction_decorators, _init13, _a13;
_ConfigTweakAction_decorators = [action({ UUID: "com.danmaxis.hyprstream.config.tweak" })];
var ConfigTweakAction = class extends (_a13 = SingletonAction) {
  hyprctl;
  contexts = /* @__PURE__ */ new Map();
  /** Last value we wrote for the env-only cursor-size preset, per action.
   *  Initial seed comes from `process.env.XCURSOR_SIZE` (read once at first
   *  press). After that this is the source of truth for the toggle. */
  envCursorState = /* @__PURE__ */ new Map();
  constructor(hyprctl2) {
    super();
    this.hyprctl = hyprctl2;
  }
  isCursorSizePreset(settings2) {
    return (settings2.preset ?? "gaps") === "cursor-size";
  }
  async onWillAppear(ev) {
    this.contexts.set(ev.action.id, ev.payload.settings);
    if (ev.action.isKey()) await this.repaint(ev.action, ev.payload.settings);
  }
  onWillDisappear(ev) {
    this.contexts.delete(ev.action.id);
  }
  async onDidReceiveSettings(ev) {
    this.contexts.set(ev.action.id, ev.payload.settings);
    if (ev.action.isKey()) await this.repaint(ev.action, ev.payload.settings);
  }
  async onKeyDown(ev) {
    const tweak = resolveTweak(ev.payload.settings);
    try {
      if (this.isCursorSizePreset(ev.payload.settings)) {
        const current3 = this.envCursorState.get(ev.action.id) ?? this.seedCursorSize(tweak.values);
        const next2 = pickNextValue(current3, tweak.values);
        console.error(`[hyprstream] config.tweak cursor-size ${current3} -> ${next2}`);
        await this.hyprctl.setEnv("XCURSOR_SIZE", next2);
        await this.hyprctl.setEnv("HYPRCURSOR_SIZE", next2);
        this.envCursorState.set(ev.action.id, next2);
        if (ev.action.isKey()) await this.repaintFromValue(ev.action, tweak, next2);
        return;
      }
      if (!tweak.keyword) {
        console.error(`[hyprstream] config.tweak: empty keyword`);
        await ev.action.showAlert();
        return;
      }
      const current2 = await this.readCurrent(tweak.keyword);
      const next = pickNextValue(current2, tweak.values);
      console.error(`[hyprstream] config.tweak ${tweak.keyword} ${current2} -> ${next}`);
      await this.hyprctl.setConfigValue(tweak.keyword, next);
      if (ev.action.isKey()) await this.repaintFromValue(ev.action, tweak, next);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[hyprstream] config.tweak FAILED: ${msg}`);
      streamDeck.logger.error(`config.tweak failed: ${msg}`);
      await ev.action.showAlert();
    }
  }
  /** Seed the local cursor-size toggle from process.env (best-effort).
   *  Used only the first time the user taps the key after plugin start. */
  seedCursorSize(values) {
    const fromEnv = process.env.XCURSOR_SIZE?.trim();
    if (fromEnv && values.some((v) => v === fromEnv)) return fromEnv;
    return values[0] ?? "24";
  }
  /**
   * Read the current value via `j/getoption`. `hl.config` is a *function*
   * (not a table) in Hyprland 0.55, so there is no `hl.config.get(...)` —
   * the JSON option query is the right way in.
   *
   * Returns a string regardless of the underlying type (Hyprland reports
   * it as `int`, `float`, or `str` depending on the option; we pick the
   * first one that's present and stringify).
   */
  async readCurrent(keyword) {
    const opt = await this.hyprctl.getOption(keyword);
    if (opt) {
      if (typeof opt.int === "number") return String(opt.int);
      if (typeof opt.float === "number") return String(opt.float);
      if (typeof opt.bool === "boolean") return String(opt.bool);
      if (typeof opt.str === "string") return opt.str;
    }
    return "";
  }
  async repaint(action2, settings2) {
    const tweak = resolveTweak(settings2);
    if (this.isCursorSizePreset(settings2)) {
      const current2 = this.envCursorState.get(action2.id) ?? this.seedCursorSize(tweak.values);
      this.envCursorState.set(action2.id, current2);
      await this.repaintFromValue(action2, tweak, current2);
      return;
    }
    if (!tweak.keyword) {
      const icon = await renderConfigTweakIcon({ label: tweak.label, value: "?", error: true });
      await action2.setImage(icon.dataUri);
      return;
    }
    try {
      const current2 = await this.readCurrent(tweak.keyword);
      await this.repaintFromValue(action2, tweak, current2);
    } catch {
      const icon = await renderConfigTweakIcon({ label: tweak.label, value: "\u2014", error: true });
      await action2.setImage(icon.dataUri);
    }
  }
  async repaintFromValue(action2, tweak, rawValue) {
    const preset = this.contexts.get(action2.id)?.preset ?? "gaps";
    const parser = preset !== "custom" ? CONFIG_PRESETS[preset].parse : guessParser(rawValue);
    const value = parser(rawValue);
    const icon = await renderConfigTweakIcon({ label: tweak.label, value });
    await action2.setImage(icon.dataUri);
  }
};
_init13 = __decoratorStart(_a13);
ConfigTweakAction = __decorateElement(_init13, 0, "ConfigTweakAction", _ConfigTweakAction_decorators, ConfigTweakAction);
__runInitializers(_init13, 1, ConfigTweakAction);
function guessParser(raw) {
  return asBool(raw.trim().toLowerCase()) !== null ? parseBoolish : parseNumber;
}

// src/actions/presentation.ts
var _PresentationModeAction_decorators, _init14, _a14;
_PresentationModeAction_decorators = [action({ UUID: "com.danmaxis.hyprstream.presentation" })];
var PresentationModeAction = class extends (_a14 = SingletonAction) {
  hyprctl;
  contexts = /* @__PURE__ */ new Map();
  saved = null;
  active = false;
  constructor(hyprctl2) {
    super();
    this.hyprctl = hyprctl2;
  }
  async onWillAppear(ev) {
    this.contexts.set(ev.action.id, ev.payload.settings);
    if (ev.action.isKey()) await this.repaint(ev.action);
  }
  onWillDisappear(ev) {
    this.contexts.delete(ev.action.id);
  }
  async onDidReceiveSettings(ev) {
    this.contexts.set(ev.action.id, ev.payload.settings);
    if (ev.action.isKey()) await this.repaint(ev.action);
  }
  async onKeyDown(ev) {
    const s = ev.payload.settings;
    try {
      if (this.active && this.saved) {
        await this.restore(this.saved);
        this.saved = null;
        this.active = false;
        console.error(`[hyprstream] presentation: OFF`);
      } else {
        const saved = await this.snapshot();
        await this.apply(s);
        this.saved = saved;
        this.active = true;
        console.error(`[hyprstream] presentation: ON`);
      }
      await this.repaintAll();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[hyprstream] presentation FAILED: ${msg}`);
      streamDeck.logger.error(`presentation failed: ${msg}`);
      await ev.action.showAlert();
    }
  }
  async snapshot() {
    const cursorSize = (process.env.XCURSOR_SIZE ?? "24").trim() || "24";
    const cursorZoom = await this.read("cursor:zoom_factor");
    const dimInactive = await this.read("decoration:dim_inactive");
    const dimStrength = await this.read("decoration:dim_strength");
    const animationsEnabled = await this.read("animations:enabled");
    return { cursorSize, cursorZoom, dimInactive, dimStrength, animationsEnabled };
  }
  async apply(s) {
    const cursorSize = clampInt(s.presentCursorSize, 48, 8, 128);
    const cursorZoom = clampFloat(s.presentCursorZoom, 1.6, 1, 4);
    const dimStrength = clampFloat(s.presentDimStrength, 0.5, 0, 1);
    const enableDim = s.enableDim !== false;
    const disableAnimations = s.disableAnimations === true;
    await this.hyprctl.setEnv("XCURSOR_SIZE", cursorSize);
    await this.hyprctl.setEnv("HYPRCURSOR_SIZE", cursorSize);
    await this.hyprctl.setConfigValue("cursor:zoom_factor", cursorZoom);
    if (enableDim) {
      await this.hyprctl.setConfigValue("decoration:dim_inactive", true);
      await this.hyprctl.setConfigValue("decoration:dim_strength", dimStrength);
    }
    if (disableAnimations) {
      await this.hyprctl.setConfigValue("animations:enabled", false);
    }
  }
  async restore(saved) {
    await this.hyprctl.setEnv("XCURSOR_SIZE", saved.cursorSize);
    await this.hyprctl.setEnv("HYPRCURSOR_SIZE", saved.cursorSize);
    await this.hyprctl.setConfigValue("cursor:zoom_factor", saved.cursorZoom);
    await this.hyprctl.setConfigValue("decoration:dim_inactive", saved.dimInactive);
    await this.hyprctl.setConfigValue("decoration:dim_strength", saved.dimStrength);
    await this.hyprctl.setConfigValue("animations:enabled", saved.animationsEnabled);
  }
  /**
   * Read a config option via `j/getoption`. Returns the first scalar field
   * present (int → float → str). Empty string when Hyprland doesn't know
   * the key — keeps SavedState a plain string map without nullable churn.
   */
  async read(keyword) {
    const opt = await this.hyprctl.getOption(keyword);
    if (!opt) return "";
    if (typeof opt.int === "number") return String(opt.int);
    if (typeof opt.float === "number") return String(opt.float);
    if (typeof opt.bool === "boolean") return String(opt.bool);
    if (typeof opt.str === "string") return opt.str;
    return "";
  }
  async repaintAll() {
    const tasks = [];
    for (const a of this.actions) {
      if (!a.isKey()) continue;
      tasks.push(this.repaint(a));
    }
    await Promise.all(tasks);
  }
  async repaint(action2) {
    const icon = await renderPresentationIcon({ on: this.active });
    await action2.setImage(icon.dataUri);
  }
};
_init14 = __decoratorStart(_a14);
PresentationModeAction = __decorateElement(_init14, 0, "PresentationModeAction", _PresentationModeAction_decorators, PresentationModeAction);
__runInitializers(_init14, 1, PresentationModeAction);
function clampInt(v, fallback, lo, hi) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(lo, Math.min(hi, Math.trunc(n)));
}
function clampFloat(v, fallback, lo, hi) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(lo, Math.min(hi, n));
}

// src/actions/capture.ts
var import_node_child_process5 = require("child_process");

// src/system/screenshot.ts
function buildScreenshotCommand(mode) {
  switch (mode) {
    case "region":
      return `grim -g "$(slurp)" - | wl-copy`;
    case "full":
      return `grim - | wl-copy`;
    case "full-file": {
      const dir = "$HOME/Pictures/Screenshots";
      return `mkdir -p ${dir} && f=${dir}/screenshot-$(date +%Y%m%d-%H%M%S).png && grim "$f" && wl-copy < "$f"`;
    }
  }
}

// src/actions/capture.ts
var _RecordToggleAction_decorators, _init15, _a15;
_RecordToggleAction_decorators = [action({ UUID: "com.danmaxis.hyprstream.capture.record-toggle" })];
var RecordToggleAction = class extends (_a15 = SingletonAction) {
  contexts = /* @__PURE__ */ new Map();
  recorder;
  pulseStart = Date.now();
  constructor(recorder2) {
    super();
    this.recorder = recorder2;
    this.recorder.on("change", () => void this.repaintAll());
  }
  async onWillAppear(ev) {
    if (this.contexts.size === 0) this.recorder.acquire();
    this.contexts.set(ev.action.id, ev.payload.settings);
    if (ev.action.isKey()) await this.repaint(ev.action, ev.payload.settings);
  }
  onWillDisappear(ev) {
    if (this.contexts.delete(ev.action.id) && this.contexts.size === 0) this.recorder.release();
  }
  async onDidReceiveSettings(ev) {
    this.contexts.set(ev.action.id, ev.payload.settings);
    if (ev.action.isKey()) await this.repaint(ev.action, ev.payload.settings);
  }
  async onKeyDown(ev) {
    const mode = clampRecordMode(ev.payload.settings.mode);
    console.error(`[hyprstream] record-toggle mode=${mode} active=${this.recorder.isActive()}`);
    try {
      await this.recorder.toggle(mode);
      console.error(`[hyprstream] record-toggle ok`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[hyprstream] record-toggle FAILED: ${msg}`);
      streamDeck.logger.error(`capture.record-toggle failed: ${msg}`);
      await ev.action.showAlert();
    }
  }
  async repaintAll() {
    const tasks = [];
    for (const a of this.actions) {
      if (!a.isKey()) continue;
      const settings2 = this.contexts.get(a.id);
      if (settings2 === void 0) continue;
      tasks.push(this.repaint(a, settings2));
    }
    await Promise.all(tasks);
  }
  async repaint(action2, settings2) {
    const recording = this.recorder.isActive();
    const pulse = recording ? (Date.now() - this.pulseStart) % 1400 / 1400 : 0;
    const icon = await renderRecordIcon({
      recording,
      pulse,
      mode: clampRecordMode(settings2.mode)
    });
    await action2.setImage(icon.dataUri);
  }
};
_init15 = __decoratorStart(_a15);
RecordToggleAction = __decorateElement(_init15, 0, "RecordToggleAction", _RecordToggleAction_decorators, RecordToggleAction);
__runInitializers(_init15, 1, RecordToggleAction);
var _ScreenshotAction_decorators, _init16, _a16;
_ScreenshotAction_decorators = [action({ UUID: "com.danmaxis.hyprstream.capture.screenshot" })];
var ScreenshotAction = class extends (_a16 = SingletonAction) {
  contexts = /* @__PURE__ */ new Set();
  async onWillAppear(ev) {
    this.contexts.add(ev.action.id);
    if (ev.action.isKey()) await this.repaint(ev.action, ev.payload.settings);
  }
  onWillDisappear(ev) {
    this.contexts.delete(ev.action.id);
  }
  async onDidReceiveSettings(ev) {
    if (ev.action.isKey()) await this.repaint(ev.action, ev.payload.settings);
  }
  async onKeyDown(ev) {
    const mode = clampScreenshotMode(ev.payload.settings.mode);
    console.error(`[hyprstream] screenshot mode=${mode}`);
    try {
      const cmd = buildScreenshotCommand(mode);
      const child = (0, import_node_child_process5.spawn)("sh", ["-c", cmd], { detached: true, stdio: "ignore" });
      child.unref();
      console.error(`[hyprstream] screenshot dispatched`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[hyprstream] screenshot FAILED: ${msg}`);
      streamDeck.logger.error(`capture.screenshot failed: ${msg}`);
      await ev.action.showAlert();
    }
  }
  async repaint(action2, settings2) {
    const icon = await renderScreenshotIcon({ mode: clampScreenshotMode(settings2.mode) });
    await action2.setImage(icon.dataUri);
  }
};
_init16 = __decoratorStart(_a16);
ScreenshotAction = __decorateElement(_init16, 0, "ScreenshotAction", _ScreenshotAction_decorators, ScreenshotAction);
__runInitializers(_init16, 1, ScreenshotAction);
function clampRecordMode(m) {
  return m === "region" || m === "full" || m === "full-audio" ? m : "region";
}
function clampScreenshotMode(m) {
  return m === "region" || m === "full" || m === "full-file" ? m : "region";
}

// src/system/albumart.ts
var import_node_crypto2 = require("crypto");
var import_node_fs4 = require("fs");
var import_promises = require("fs/promises");
var import_node_url = require("url");
var DEFAULT_MAX_BYTES = 2 * 1024 * 1024;
var DEFAULT_TIMEOUT_MS = 2e3;
var LRU_MAX = 32;
var memCache = /* @__PURE__ */ new Map();
var defaultCacheDir;
function resolveDefaultCacheDir() {
  if (defaultCacheDir !== void 0) return defaultCacheDir;
  const runtime = process.env.XDG_RUNTIME_DIR;
  if (!runtime) {
    defaultCacheDir = null;
    return null;
  }
  const dir = `${runtime}/hyprstream-deck/art`;
  try {
    (0, import_node_fs4.mkdirSync)(dir, { recursive: true });
    defaultCacheDir = dir;
  } catch {
    defaultCacheDir = null;
  }
  return defaultCacheDir;
}
function diskCachePath(cacheDir, url) {
  const hash = (0, import_node_crypto2.createHash)("sha256").update(url).digest("hex").slice(0, 32);
  return `${cacheDir}/${hash}.bin`;
}
async function fetchArt(url, opts) {
  const memHit = memCache.get(url);
  if (memHit !== void 0) {
    memCache.delete(url);
    memCache.set(url, memHit);
    return memHit;
  }
  const cacheDir = opts.cacheDir === void 0 ? resolveDefaultCacheDir() : opts.cacheDir;
  const remoteScheme = url.startsWith("https://") || url.startsWith("http://");
  if (remoteScheme && cacheDir) {
    try {
      const path2 = diskCachePath(cacheDir, url);
      const bytes = await (0, import_promises.readFile)(path2);
      promoteToMem(url, bytes);
      return bytes;
    } catch {
    }
  }
  const value = await loadArt(url, opts);
  if (value !== null) {
    promoteToMem(url, value);
    if (remoteScheme && cacheDir) {
      void (0, import_promises.writeFile)(diskCachePath(cacheDir, url), value).catch(() => {
      });
    }
  }
  return value;
}
function promoteToMem(url, value) {
  if (memCache.size >= LRU_MAX) {
    const oldest = memCache.keys().next().value;
    if (oldest !== void 0) memCache.delete(oldest);
  }
  memCache.set(url, value);
}
async function loadArt(url, opts) {
  if (url.startsWith("file://")) {
    try {
      const path2 = (0, import_node_url.fileURLToPath)(url);
      return await (0, import_promises.readFile)(path2);
    } catch {
      return null;
    }
  }
  if (url.startsWith("http://") || url.startsWith("https://")) {
    if (!opts.allowRemote) return null;
    const cap = opts.maxBytes ?? DEFAULT_MAX_BYTES;
    try {
      const fetcher = opts.remoteFetcher ?? ((u) => defaultRemoteFetcher(u, cap));
      const buf = await fetcher(url);
      if (buf.length > cap) return null;
      return buf;
    } catch {
      return null;
    }
  }
  return null;
}
async function defaultRemoteFetcher(url, maxBytes) {
  const isHttps = url.startsWith("https://");
  const mod = isHttps ? await import("https") : await import("http");
  return new Promise((resolve, reject) => {
    const req = mod.request(url, { method: "GET" }, (res) => {
      if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
        res.resume();
        reject(new Error(`http ${res.statusCode}`));
        return;
      }
      const chunks = [];
      let total = 0;
      res.on("data", (c) => {
        total += c.length;
        if (total > maxBytes) {
          req.destroy(new Error("response too large"));
          return;
        }
        chunks.push(c);
      });
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    });
    req.setTimeout(DEFAULT_TIMEOUT_MS, () => req.destroy(new Error("timeout")));
    req.on("error", reject);
    req.end();
  });
}

// src/actions/system.ts
var _DndToggleAction_decorators, _init17, _a17;
_DndToggleAction_decorators = [action({ UUID: "com.danmaxis.hyprstream.system.dnd-toggle" })];
var DndToggleAction = class extends (_a17 = SingletonAction) {
  // DnD has no settings — track only the live action ids.
  contexts = /* @__PURE__ */ new Set();
  notifications;
  constructor(notifications2) {
    super();
    this.notifications = notifications2;
    this.notifications.on("change", () => void this.repaintAll());
  }
  async onWillAppear(ev) {
    if (this.contexts.size === 0) this.notifications.acquire();
    this.contexts.add(ev.action.id);
    if (ev.action.isKey()) await this.repaint(ev.action);
  }
  onWillDisappear(ev) {
    if (this.contexts.delete(ev.action.id) && this.contexts.size === 0)
      this.notifications.release();
  }
  async onKeyDown(ev) {
    console.error(`[hyprstream] dnd-toggle press`);
    try {
      await this.notifications.toggle();
      console.error(`[hyprstream] dnd-toggle ok`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[hyprstream] dnd-toggle FAILED: ${msg}`);
      streamDeck.logger.error(`system.dnd-toggle failed: ${msg}`);
      await ev.action.showAlert();
    }
  }
  async repaintAll() {
    const tasks = [];
    for (const a of this.actions) {
      if (!a.isKey() || !this.contexts.has(a.id)) continue;
      tasks.push(this.repaint(a));
    }
    await Promise.all(tasks);
  }
  async repaint(action2) {
    const icon = await renderDndIcon({ paused: this.notifications.currentlyPaused });
    await action2.setImage(icon.dataUri);
  }
};
_init17 = __decoratorStart(_a17);
DndToggleAction = __decorateElement(_init17, 0, "DndToggleAction", _DndToggleAction_decorators, DndToggleAction);
__runInitializers(_init17, 1, DndToggleAction);
var _MediaControlAction_decorators, _init18, _a18;
_MediaControlAction_decorators = [action({ UUID: "com.danmaxis.hyprstream.media.control" })];
var MediaControlAction = class extends (_a18 = SingletonAction) {
  contexts = /* @__PURE__ */ new Map();
  mpris;
  /**
   * Per-action repaint epoch. Bumped at the start of every repaint() so
   * that an older invocation — still mid-`fetchArt` — can detect that a
   * newer one started and bail before calling `setImage`. Without this,
   * fast track skips on a cache-mixed (disk-hit then network-fetch) art
   * set can race such that the older fetch resolves last and overwrites
   * the newer track's icon. See bug report 0.4.9 #1.
   */
  repaintEpoch = /* @__PURE__ */ new Map();
  constructor(mpris2) {
    super();
    this.mpris = mpris2;
    this.mpris.on("change", () => void this.repaintAll());
  }
  async onWillAppear(ev) {
    if (this.contexts.size === 0) this.mpris.acquire();
    this.contexts.set(ev.action.id, ev.payload.settings);
    if (ev.action.isKey()) await this.repaint(ev.action, ev.payload.settings);
  }
  onWillDisappear(ev) {
    if (this.contexts.delete(ev.action.id) && this.contexts.size === 0) this.mpris.release();
    this.repaintEpoch.delete(ev.action.id);
  }
  async onDidReceiveSettings(ev) {
    this.contexts.set(ev.action.id, ev.payload.settings);
    if (ev.action.isKey()) await this.repaint(ev.action, ev.payload.settings);
  }
  async onKeyDown(ev) {
    const op = clampOp(ev.payload.settings.op);
    console.error(`[hyprstream] media.${op} press`);
    try {
      if (op === "play-pause") await this.mpris.playPause();
      else if (op === "next") await this.mpris.next();
      else await this.mpris.prev();
      console.error(`[hyprstream] media.${op} ok`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[hyprstream] media.${op} FAILED: ${msg}`);
      streamDeck.logger.error(`media.${op} failed: ${msg}`);
      await ev.action.showAlert();
    }
  }
  async repaintAll() {
    const tasks = [];
    for (const a of this.actions) {
      if (!a.isKey()) continue;
      const settings2 = this.contexts.get(a.id);
      if (settings2 === void 0) continue;
      tasks.push(this.repaint(a, settings2));
    }
    await Promise.all(tasks);
  }
  async repaint(action2, settings2) {
    const epoch = (this.repaintEpoch.get(action2.id) ?? 0) + 1;
    this.repaintEpoch.set(action2.id, epoch);
    const isCurrent2 = () => this.repaintEpoch.get(action2.id) === epoch;
    const op = clampOp(settings2.op);
    const status = this.mpris.currentStatus;
    const showArt = settings2.showArt !== false;
    const artUrl = this.mpris.currentArtUrl;
    if (showArt && op === "play-pause" && artUrl) {
      const art = await fetchArt(artUrl, {
        allowRemote: settings2.allowRemoteFetch !== false
      });
      if (!isCurrent2()) return;
      if (art) {
        const icon2 = await renderMediaIconWithArt({ op, status, art, artUrl });
        if (!isCurrent2()) return;
        await action2.setImage(icon2.dataUri);
        return;
      }
    }
    if (!isCurrent2()) return;
    const icon = await renderMediaIcon({ op, status });
    await action2.setImage(icon.dataUri);
  }
};
_init18 = __decoratorStart(_a18);
MediaControlAction = __decorateElement(_init18, 0, "MediaControlAction", _MediaControlAction_decorators, MediaControlAction);
__runInitializers(_init18, 1, MediaControlAction);
function clampOp(o) {
  return o === "next" || o === "prev" || o === "play-pause" ? o : "play-pause";
}

// src/system/sysinfo.ts
var import_promises2 = require("fs/promises");
var defaultReadFile = async (p) => (await (0, import_promises2.readFile)(p, "utf8")).toString();
var defaultReaddir = async (p) => await (0, import_promises2.readdir)(p);
async function readCpuStat(readFn = defaultReadFile) {
  const text = await readFn("/proc/stat");
  const first = text.split("\n", 1)[0];
  const parts = first.split(/\s+/).slice(1).map(Number);
  const total = parts.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);
  const idle = (parts[3] ?? 0) + (parts[4] ?? 0);
  return { total, idle };
}
function cpuUsage(prev, next) {
  const dTotal = next.total - prev.total;
  const dIdle = next.idle - prev.idle;
  if (dTotal <= 0) return 0;
  return Math.max(0, Math.min(1, 1 - dIdle / dTotal));
}
async function readMemInfo(readFn = defaultReadFile) {
  const text = await readFn("/proc/meminfo");
  const fields = /* @__PURE__ */ new Map();
  for (const line of text.split("\n")) {
    const m = line.match(/^(\w+):\s+(\d+)/);
    if (m) fields.set(m[1], Number(m[2]));
  }
  const total = fields.get("MemTotal") ?? 0;
  const available = fields.get("MemAvailable") ?? (fields.get("MemFree") ?? 0) + (fields.get("Buffers") ?? 0) + (fields.get("Cached") ?? 0);
  return { totalKb: total, usedKb: Math.max(0, total - available) };
}
async function readUptime(readFn = defaultReadFile) {
  const text = await readFn("/proc/uptime");
  const first = Number(text.trim().split(/\s+/, 1)[0]);
  return { seconds: Number.isFinite(first) ? first : 0 };
}
async function readBattery(name, readFn = defaultReadFile, readdirFn = defaultReaddir) {
  let target = name;
  if (!target) {
    try {
      const entries = await readdirFn("/sys/class/power_supply");
      target = entries.find((e) => /^BAT\d+$/i.test(e));
    } catch {
      return null;
    }
  }
  if (!target) return null;
  try {
    const base = `/sys/class/power_supply/${target}`;
    const [cap, status] = await Promise.all([
      readFn(`${base}/capacity`),
      readFn(`${base}/status`)
    ]);
    const percent = Math.max(0, Math.min(100, Number(cap.trim())));
    const s = status.trim();
    const charging = s === "Charging" || s === "Full";
    return { percent, charging, name: target };
  } catch {
    return null;
  }
}
async function readThermal(zone = "thermal_zone0", readFn = defaultReadFile) {
  try {
    const text = await readFn(`/sys/class/thermal/${zone}/temp`);
    const milli = Number(text.trim());
    if (!Number.isFinite(milli)) return null;
    return { celsius: Math.round(milli / 1e3), zone };
  } catch {
    return null;
  }
}
function formatUptime(seconds, mode = "short") {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor(seconds % 86400 / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  if (mode === "human") {
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }
  if (d > 0) return `${d}d${h}h`;
  if (h > 0) return `${h}h${m}m`;
  return `${m}m`;
}

// src/actions/display.ts
var DisplayPollAction = class extends SingletonAction {
  contexts = /* @__PURE__ */ new Map();
  timer = null;
  async onWillAppear(ev) {
    if (this.contexts.size === 0) this.startTimer();
    this.contexts.set(ev.action.id, ev.payload.settings);
    if (ev.action.isKey()) await this.repaint(ev.action, ev.payload.settings);
  }
  onWillDisappear(ev) {
    if (this.contexts.delete(ev.action.id) && this.contexts.size === 0) this.stopTimer();
  }
  async onDidReceiveSettings(ev) {
    this.contexts.set(ev.action.id, ev.payload.settings);
    if (ev.action.isKey()) await this.repaint(ev.action, ev.payload.settings);
  }
  async onKeyDown(ev) {
    await ev.action.showOk();
  }
  async repaintAll() {
    const tasks = [];
    for (const a of this.actions) {
      if (!a.isKey()) continue;
      const settings2 = this.contexts.get(a.id);
      if (settings2 === void 0) continue;
      tasks.push(this.repaint(a, settings2));
    }
    await Promise.all(tasks);
  }
  startTimer() {
    if (this.timer) return;
    void this.tick();
    this.timer = setInterval(() => void this.tick(), this.intervalMs);
  }
  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
  async tick() {
    try {
      await this.sample();
      await this.repaintAll();
    } catch (err) {
      streamDeck.logger.error(
        `display sample/repaint failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }
  /** Test hook: force a single tick synchronously (async). */
  async _tickForTest() {
    await this.tick();
  }
  /** Test hook: inspect timer state. */
  get _timerActive() {
    return this.timer !== null;
  }
};
var _ClockAction_decorators, _init19, _a19;
_ClockAction_decorators = [action({ UUID: "com.danmaxis.hyprstream.display.clock" })];
var ClockAction = class extends (_a19 = DisplayPollAction) {
  intervalMs = 1e3;
  async sample() {
  }
  async repaint(action2, settings2) {
    const icon = await renderClockIcon({
      now: /* @__PURE__ */ new Date(),
      format: settings2.format ?? "24h",
      showSeconds: settings2.showSeconds ?? false,
      showDate: settings2.showDate ?? false
    });
    await action2.setImage(icon.dataUri);
  }
};
_init19 = __decoratorStart(_a19);
ClockAction = __decorateElement(_init19, 0, "ClockAction", _ClockAction_decorators, ClockAction);
__runInitializers(_init19, 1, ClockAction);
var _CpuAction_decorators, _init20, _a20;
_CpuAction_decorators = [action({ UUID: "com.danmaxis.hyprstream.display.cpu" })];
var CpuAction = class extends (_a20 = DisplayPollAction) {
  intervalMs = 1500;
  last = null;
  usage = 0;
  async sample() {
    const next = await readCpuStat();
    if (this.last) this.usage = cpuUsage(this.last, next);
    this.last = next;
  }
  async repaint(action2, settings2) {
    const icon = await renderCpuIcon({
      percent: Math.round(this.usage * 100),
      warnPct: settings2.warnPct ?? 70,
      critPct: settings2.critPct ?? 90
    });
    await action2.setImage(icon.dataUri);
  }
};
_init20 = __decoratorStart(_a20);
CpuAction = __decorateElement(_init20, 0, "CpuAction", _CpuAction_decorators, CpuAction);
__runInitializers(_init20, 1, CpuAction);
var _RamAction_decorators, _init21, _a21;
_RamAction_decorators = [action({ UUID: "com.danmaxis.hyprstream.display.ram" })];
var RamAction = class extends (_a21 = DisplayPollAction) {
  intervalMs = 2e3;
  percent = 0;
  totalGb = 0;
  async sample() {
    const m = await readMemInfo();
    if (m.totalKb > 0) {
      this.percent = m.usedKb / m.totalKb * 100;
      this.totalGb = m.totalKb / (1024 * 1024);
    }
  }
  async repaint(action2, settings2) {
    const icon = await renderRamIcon({
      percent: Math.round(this.percent),
      totalGb: Math.round(this.totalGb),
      warnPct: settings2.warnPct ?? 75,
      critPct: settings2.critPct ?? 90
    });
    await action2.setImage(icon.dataUri);
  }
};
_init21 = __decoratorStart(_a21);
RamAction = __decorateElement(_init21, 0, "RamAction", _RamAction_decorators, RamAction);
__runInitializers(_init21, 1, RamAction);
var _BatteryAction_decorators, _init22, _a22;
_BatteryAction_decorators = [action({ UUID: "com.danmaxis.hyprstream.display.battery" })];
var BatteryAction = class extends (_a22 = DisplayPollAction) {
  intervalMs = 3e4;
  percent = null;
  charging = false;
  async sample() {
    const first = this.contexts.values().next().value;
    const b = await readBattery(first?.batteryName);
    if (b) {
      this.percent = b.percent;
      this.charging = b.charging;
    } else {
      this.percent = null;
    }
  }
  async repaint(action2, settings2) {
    const icon = await renderBatteryIcon({
      percent: this.percent,
      charging: this.charging,
      warnPct: settings2.warnPct ?? 20
    });
    await action2.setImage(icon.dataUri);
  }
};
_init22 = __decoratorStart(_a22);
BatteryAction = __decorateElement(_init22, 0, "BatteryAction", _BatteryAction_decorators, BatteryAction);
__runInitializers(_init22, 1, BatteryAction);
var _TemperatureAction_decorators, _init23, _a23;
_TemperatureAction_decorators = [action({ UUID: "com.danmaxis.hyprstream.display.temperature" })];
var TemperatureAction = class extends (_a23 = DisplayPollAction) {
  intervalMs = 2e3;
  celsius = null;
  async sample() {
    const first = this.contexts.values().next().value;
    const t = await readThermal(first?.zone ?? "thermal_zone0");
    this.celsius = t ? t.celsius : null;
  }
  async repaint(action2, settings2) {
    const icon = await renderTemperatureIcon({
      celsius: this.celsius,
      warnC: settings2.warnC ?? 75,
      critC: settings2.critC ?? 90
    });
    await action2.setImage(icon.dataUri);
  }
};
_init23 = __decoratorStart(_a23);
TemperatureAction = __decorateElement(_init23, 0, "TemperatureAction", _TemperatureAction_decorators, TemperatureAction);
__runInitializers(_init23, 1, TemperatureAction);
var _UptimeAction_decorators, _init24, _a24;
_UptimeAction_decorators = [action({ UUID: "com.danmaxis.hyprstream.display.uptime" })];
var UptimeAction = class extends (_a24 = DisplayPollAction) {
  intervalMs = 6e4;
  seconds = 0;
  async sample() {
    const u = await readUptime();
    this.seconds = u.seconds;
  }
  async repaint(action2, settings2) {
    const icon = await renderUptimeIcon({
      label: formatUptime(this.seconds, settings2.format ?? "short")
    });
    await action2.setImage(icon.dataUri);
  }
};
_init24 = __decoratorStart(_a24);
UptimeAction = __decorateElement(_init24, 0, "UptimeAction", _UptimeAction_decorators, UptimeAction);
__runInitializers(_init24, 1, UptimeAction);

// src/index.ts
streamDeck.logger.setLevel(LogLevel.DEBUG);
var logFile = (() => {
  try {
    const pluginRoot = process.argv[1] ? (0, import_node_path3.dirname)((0, import_node_path3.dirname)(process.argv[1])) : process.cwd();
    const dir = (0, import_node_path3.join)(pluginRoot, "logs");
    (0, import_node_fs5.mkdirSync)(dir, { recursive: true });
    return (0, import_node_path3.join)(dir, "hyprstream.log");
  } catch {
    return null;
  }
})();
function log(line) {
  console.error(line);
  if (logFile) {
    try {
      (0, import_node_fs5.appendFileSync)(logFile, `${(/* @__PURE__ */ new Date()).toISOString()} ${line}
`);
    } catch {
    }
  }
}
log(`[hyprstream] starting v0.4.12. node=${process.version} pid=${process.pid} cwd=${process.cwd()}`);
log(`[hyprstream] HYPRLAND_INSTANCE_SIGNATURE=${process.env.HYPRLAND_INSTANCE_SIGNATURE ?? "<unset>"} XDG_RUNTIME_DIR=${process.env.XDG_RUNTIME_DIR ?? "<unset>"}`);
var resolvedEnv = resolveHyprEnv();
log(
  `[hyprstream] hypr resolved: socket=${resolvedEnv.socketPath ?? "<none>"} instance=${resolvedEnv.instanceSignature ?? "<none>"} via=${resolvedEnv.via}`
);
if (resolvedEnv.via === "missing") {
  log(
    `[hyprstream] WARNING: Hyprland not yet discoverable under ${resolvedEnv.runtimeDir}/hypr; will retry on socket reconnect.`
  );
}
var hyprctlInst = new Hyprctl({
  logSpawn: (socketPath, payload) => log(`[hyprstream] ipc-send: ${socketPath} <- ${payload}`),
  logResponse: (socketPath, payload, body) => {
    const display = body.length > 200 ? `${body.slice(0, 200)}\u2026` : body;
    log(`[hyprstream] ipc-recv: ${socketPath} -> ${display.replace(/\n/g, "\\n")}`);
  }
});
var hyprSocket = new HyprSocket();
var hyprState = new HyprState(hyprSocket, hyprctlInst);
hyprState.on("error", (err) => {
  log(`[hyprstream] HyprState error: ${err instanceof Error ? err.message : String(err)}`);
});
hyprState.on("degraded", (err) => {
  log(
    `[hyprstream] HyprState degraded after ${err instanceof Error ? err.message : String(err)}; suppressing refreshes briefly`
  );
});
hyprState.on("recovered", () => {
  log(`[hyprstream] HyprState recovered`);
});
hyprSocket.on("error", (err) => {
  log(`[hyprstream] socket error: ${err instanceof Error ? err.message : String(err)}`);
});
hyprSocket.on("connect", (resolved) => {
  log(`[hyprstream] socket connected: ${resolved?.socketPath ?? "<?>"}`);
});
try {
  hyprState.start();
  log("[hyprstream] HyprState.start() ok");
} catch (err) {
  log(`[hyprstream] HyprState.start() FAILED: ${err instanceof Error ? err.message : String(err)}`);
}
var audioState = new AudioState();
audioState.on("error", (err) => {
  log(`[hyprstream] AudioState error: ${err instanceof Error ? err.message : String(err)}`);
});
var recorder = new Recorder();
var notifications = new NotificationsControl();
notifications.on("error", (err) => {
  log(`[hyprstream] Notifications error: ${err instanceof Error ? err.message : String(err)}`);
});
var mpris = new Mpris();
var hyprctl = hyprState.hyprctl;
streamDeck.actions.registerAction(new WorkspaceFocusAction(hyprState));
streamDeck.actions.registerAction(new WorkspaceMoveWindowAction(hyprState));
streamDeck.actions.registerAction(new MuteMicAction(audioState));
streamDeck.actions.registerAction(new MuteSinkAction(audioState));
streamDeck.actions.registerAction(new VolumeStepAction(audioState));
streamDeck.actions.registerAction(new WindowFocusDirectionAction(hyprctl));
streamDeck.actions.registerAction(new WindowCloseAction(hyprctl));
streamDeck.actions.registerAction(new WindowToggleAction(hyprState));
streamDeck.actions.registerAction(new MonitorSwapAction(hyprctl));
streamDeck.actions.registerAction(new WindowResizeActiveAction(hyprctl));
streamDeck.actions.registerAction(new WindowSwapNeighborAction(hyprctl));
streamDeck.actions.registerAction(new HyprstreamDiagnosticsAction(hyprState));
streamDeck.actions.registerAction(new ConfigTweakAction(hyprctl));
streamDeck.actions.registerAction(new PresentationModeAction(hyprctl));
streamDeck.actions.registerAction(new RecordToggleAction(recorder));
streamDeck.actions.registerAction(new ScreenshotAction());
streamDeck.actions.registerAction(new DndToggleAction(notifications));
streamDeck.actions.registerAction(new MediaControlAction(mpris));
streamDeck.actions.registerAction(new ClockAction());
streamDeck.actions.registerAction(new CpuAction());
streamDeck.actions.registerAction(new RamAction());
streamDeck.actions.registerAction(new BatteryAction());
streamDeck.actions.registerAction(new TemperatureAction());
streamDeck.actions.registerAction(new UptimeAction());
log("[hyprstream] 24 actions registered, connecting to OpenDeck WS\u2026");
void streamDeck.connect().then(
  () => log("[hyprstream] streamDeck.connect() resolved"),
  (err) => log(
    `[hyprstream] streamDeck.connect() FAILED: ${err instanceof Error ? err.message : String(err)}`
  )
);
process.on("uncaughtException", (err) => {
  log(`[hyprstream] uncaughtException: ${err instanceof Error ? err.stack ?? err.message : String(err)}`);
});
process.on("unhandledRejection", (reason) => {
  log(`[hyprstream] unhandledRejection: ${reason instanceof Error ? reason.stack ?? reason.message : String(reason)}`);
});
/*! Bundled license information:

@elgato/schemas/dist/streamdeck/plugins/index.mjs:
@elgato/streamdeck/dist/index.js:
  (**!
   * @author Elgato
   * @module elgato/streamdeck
   * @license MIT
   * @copyright Copyright (c) Corsair Memory Inc.
   *)
*/
//# sourceMappingURL=plugin.cjs.map