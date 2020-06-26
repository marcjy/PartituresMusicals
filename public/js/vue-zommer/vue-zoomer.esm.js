// vue-zoomer v0.3.6 - Jarvis Niu
// https://github.com/jarvisniu/vue-zoomer

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeMin = Math.min;

/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred invocation.
 */
var now = function() {
  return root.Date.now();
};

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide `options` to indicate whether `func` should be invoked on the
 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent
 * calls to the debounced function return the result of the last `func`
 * invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
function debounce(func, wait, options) {
  var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs,
        thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        result = wait - timeSinceLastCall;

    return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now());
  }

  function debounced() {
    var time = now(),
        isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

var lodash_debounce = debounce;

/**
 * Detect double tap events
 * # Deals with:
 * - Time intervals between taps
 * - Swipe will stop the taps
 * # Usage:
 * let tapDetector = new TapDetector()
 * tapDetector.attach(this.$el) // in mounted
 * tapDetector.detach(this.$el) // in destroy
 * tapDetector.onSingle(callback)
 * tapDetector.onDouble(callback)
 */

function TapDetector () {

  // Callbacks -----------------------------------------------------------------

  let singleTapCallbacks = [];
  let doubleTapCallbacks = [];

  function triggerCallbacks (cbList, arg) {
    cbList.forEach(cbItem => {
      cbItem.call(null, arg);
    });
  }

  this.onSingleTap = function (cb) {
    if (typeof cb === 'function' && !singleTapCallbacks.includes(cb)) {
      singleTapCallbacks.push(cb);
    }
  };
  this.onDoubleTap = function (cb) {
    if (typeof cb === 'function' && !doubleTapCallbacks.includes(cb)) {
      doubleTapCallbacks.push(cb);
    }
  };

  this.attach = function (dom) {
    if (!(dom instanceof Element)) {
      console.error('TapDetector.attach: arg must be an Element');
      return
    }
    dom.addEventListener('touchstart', onTouchStart);
    dom.addEventListener('touchmove', onTouchMove);
    dom.addEventListener('touchend', onTouchEnd);
    dom.addEventListener('mousedown', onMouseDown);
    dom.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('mousemove', onMouseMove);
  };

  this.detach = function (dom) {
    dom.removeEventListener('touchstart', onTouchStart);
    dom.removeEventListener('touchmove', onTouchMove);
    dom.removeEventListener('touchend', onTouchEnd);
    dom.removeEventListener('mousedown', onMouseDown);
    dom.removeEventListener('mouseup', onMouseUp);
    dom.removeEventListener('mousemove', onMouseMove);
  };

  // Main logic ----------------------------------------------------------------

  // in touch mode mouse events will be disabled. Otherwise touches will
  // trigger both touchend end mouseup, i.e. one touch triggers two onPointerUp.
  let isTouchMode = false;
  let lastTapTimestamp = 0;
  let tappedCount = 0;
  let touchMovedLength = 0;
  let lastPointerX = 0;
  let lastPointerY = 0;

  function onTouchStart (ev) {
    isTouchMode = true;
    // console.log('onTouchStart')
    if (ev.touches.length === 1) {
      onPointerDown(ev.touches[0].clientX, ev.touches[0].clientY);
    }
  }
  function onTouchEnd (ev) {
    // console.log('onTouchEnd')
    if (ev.touches.length === 0) {
      onPointerUp();
    }
  }
  function onTouchMove (ev) {
    // console.log('onTouchMove', ev)
    if (ev.touches.length === 1) {
      onPointerMove(ev.touches[0].clientX, ev.touches[0].clientY);
    }
  }

  function onMouseDown (ev) {
    if (isTouchMode) return

    // console.log('onMouseDown')
    onPointerDown(ev.clientX, ev.clientY);
  }
  function onMouseUp (ev) {
    if (isTouchMode) return

    // console.log('onMouseUp')
    onPointerUp();
  }
  function onMouseMove (ev) {
    if (isTouchMode) return

    // console.log('onMouseMove', ev)
    if (ev.button === 0) {
      onPointerMove(ev.clientX, ev.clientY);
    }
  }

  function onPointerDown (x, y) {
    lastPointerX = x;
    lastPointerY = y;
    touchMovedLength = 0;
  }
  function onPointerUp () {
    let currTimeStamp = Date.now();
    // console.log('touchMovedLength', touchMovedLength)
    if (touchMovedLength < 10) {
      // Only when no sliding two far is considered as a valid tap
      if (currTimeStamp - lastTapTimestamp < 300) {
        tappedCount += 1;
      } else {
        tappedCount = 1;
      }
      lastTapTimestamp = Date.now();
      // console.log('tappedCount', tappedCount)
      triggerCallbacks(singleTapCallbacks, {
        clientX: lastPointerX,
        clientY: lastPointerY,
      });
      if (tappedCount === 2) {
        triggerCallbacks(doubleTapCallbacks, {
          clientX: lastPointerX,
          clientY: lastPointerY,
        });
        tappedCount = 0; // clear count on maximum tap count
      }
    }
    touchMovedLength = 0;
  }
  function onPointerMove (x, y) {
    let deltaX = lastPointerX - x;
    let deltaY = lastPointerY - y;
    let length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    // console.log('onTouchMove length', length)
    touchMovedLength += length;
    lastPointerX = x;
    lastPointerY = y;
  }
}

//

var script = {
  props: {
    minScale: { type: Number, default: 1 },
    maxScale: { type: Number, default: 5 },
    zoomed: { type: Boolean, default: false },
    resetTrigger: { type: Number, default: 1e5 },
    aspectRatio: { type: Number, default: 1 },
    backgroundColor: { type: String, default: 'transparent' },
    pivot: { type: String, default: 'cursor' }, // other options: image-center
    limitTranslation: { type: Boolean, default: true },
    doubleClickToZoom: { type: Boolean, default: true },
  },
  data () {
    return {
      // Container sizes, used to determin the initial zoomer size.
      // Need to reactive to window resizing.
      containerWidth: 1,
      containerHeight: 1,
      containerLeft: 0,
      containerTop: 0,
      // Store values: Interactions will at last change these values.
      // After rotation or resize, these values will keep still.
      // These three values are all relative to the container size.
      translateX: 0,
      animTranslateX: 0,
      translateY: 0,
      animTranslateY: 0,
      scale: 1,
      animScale: 1,
      // Mouse states
      lastFullWheelTime: 0,
      lastWheelTime: 0,
      lastWheelDirection: 'y',
      isPointerDown: false,
      pointerPosX: -1,
      pointerPosY: -1,
      twoFingerInitDist: 0,
      panLocked: true,
      // Others
      raf: null,
      tapDetector: null,
    }
  },
  computed: {
    wrapperStyle () {
      let translateX = this.containerWidth * this.animTranslateX;
      let translateY = this.containerHeight * this.animTranslateY;
      return {
        transform: [
          `translate(${ translateX }px, ${ translateY }px)`,
          `scale(${ this.animScale })`,
        ].join(' ')
      }
    },
  },
  watch: {
    scale (val) {
      if (val !== 1) {
        this.$emit('update:zoomed', true);
        this.panLocked = false;
      }
    },
    resetTrigger: 'reset',
  },
  mounted () {
    this.tapDetector = new TapDetector();
    this.tapDetector.attach(this.$el);
    if (this.doubleClickToZoom) {
      this.tapDetector.onDoubleTap(this.onDoubleTap);
    }
    // console.log('container size: ', this.containerWidth, this.containerHeight)
    window.addEventListener('resize', this.onWindowResize);
    this.onWindowResize();
    this.refreshContainerPos();
    this.loop();
  },
  destroyed () {
    this.tapDetector.detach(this.$el);
    window.removeEventListener('resize', this.onWindowResize);
    window.cancelAnimationFrame(this.raf);
    // console.log('destroy')
  },
  methods: {
    // API ---------------------------------------------------------------------
    reset () {
      this.scale = 1;
      this.panLocked = true;
      this.translateX = 0;
      this.translateY = 0;
    },
    zoomIn(scale = 2) {
      this.tryToScale(scale);
      this.onInteractionEnd();
    },
    zoomOut(scale = 0.5) {
      this.tryToScale(scale);
      this.onInteractionEnd();
    },
    // Main Logic --------------------------------------------------------------
    // scale
    // Zoom the image with the point at the pointer(mouse or pinch center) pinned.
    // Simplify: This can be regard as vector pointer to old-image-center scaling.
    tryToScale (scaleDelta) {
      let newScale = this.scale * scaleDelta;
       // damping
      if (newScale < this.minScale || newScale > this.maxScale) {
        let log = Math.log2(scaleDelta);
        log *= 0.2;
        scaleDelta = Math.pow(2, log);
        newScale = this.scale * scaleDelta;
      }
      scaleDelta = newScale / this.scale;
      this.scale = newScale;
      if (this.pivot !== 'image-center') {
        let normMousePosX = (this.pointerPosX - this.containerLeft) / this.containerWidth;
        let normMousePosY = (this.pointerPosY - this.containerTop) / this.containerHeight;
        this.translateX = (0.5 + this.translateX - normMousePosX) * scaleDelta + normMousePosX - 0.5;
        this.translateY = (0.5 + this.translateY - normMousePosY) * scaleDelta + normMousePosY - 0.5;
      }
    },
    setPointerPosCenter () {
      this.pointerPosX = this.containerLeft + this.containerWidth / 2;
      this.pointerPosY = this.containerTop + this.containerHeight / 2;
    },
    // pan
    onPointerMove (newMousePosX, newMousePosY) {
      if (this.isPointerDown) {
        let pixelDeltaX = newMousePosX - this.pointerPosX;
        let pixelDeltaY = newMousePosY - this.pointerPosY;
        // console.log('pixelDeltaX, pixelDeltaY', pixelDeltaX, pixelDeltaY)
        if (!this.panLocked) {
          this.translateX += pixelDeltaX / this.containerWidth;
          this.translateY += pixelDeltaY / this.containerHeight;
        }
      }
      this.pointerPosX = newMousePosX;
      this.pointerPosY = newMousePosY;
    },
    onInteractionEnd: lodash_debounce(function ()  {
      this.limit();
      this.panLocked = this.scale === 1;
      this.$emit('update:zoomed', !this.panLocked);
    }, 100),
    // limit the scale between max and min and the translate within the viewport
    limit () {
      // scale
      if (this.scale < this.minScale) {
        this.scale = this.minScale;
        // FIXME this sometimes will not reset when pinching in
        // this.tryToScale(this.minScale / this.scale)
      } else if (this.scale > this.maxScale) {
        this.tryToScale(this.maxScale / this.scale);
      }
      // translate
      if (this.limitTranslation) {
        let translateLimit = this.calcTranslateLimit();
        if (Math.abs(this.translateX) > translateLimit.x) {
          this.translateX *= translateLimit.x / Math.abs(this.translateX);
        }
        if (Math.abs(this.translateY) > translateLimit.y) {
          this.translateY *= translateLimit.y / Math.abs(this.translateY);
        }
      }
    },
    calcTranslateLimit () {
      if (this.getMarginDirection() === 'y') {
        let imageToContainerRatio = this.containerWidth / this.aspectRatio / this.containerHeight;
        let translateLimitY = (this.scale * imageToContainerRatio - 1) / 2;
        if (translateLimitY < 0) translateLimitY = 0;
        return {
          x: (this.scale - 1) / 2,
          y: translateLimitY,
        }
      } else {
        let imageToContainerRatio = this.containerHeight * this.aspectRatio / this.containerWidth;
        let translateLimitX = (this.scale * imageToContainerRatio - 1) / 2;
        if (translateLimitX < 0) translateLimitX = 0;
        return {
          x: translateLimitX,
          y: (this.scale - 1) / 2,
        }
      }
    },
    getMarginDirection () {
      let containerRatio = this.containerWidth / this.containerHeight;
      return containerRatio > this.aspectRatio ? 'x' : 'y'
    },
    onDoubleTap (ev) {
      if (this.scale === 1) {
        if (ev.clientX > 0) {
          this.pointerPosX = ev.clientX;
          this.pointerPosY = ev.clientY;
        }
        this.tryToScale(Math.min(3, this.maxScale));
      } else {
        this.reset();
      }
      this.onInteractionEnd();
    },
    // reactive
    onWindowResize () {
      let styles = window.getComputedStyle(this.$el);
      this.containerWidth = parseFloat(styles.width);
      this.containerHeight = parseFloat(styles.height);
      this.setPointerPosCenter();
      this.limit();
    },
    refreshContainerPos () {
      let rect = this.$el.getBoundingClientRect();
      this.containerLeft = rect.left;
      this.containerTop = rect.top;
    },
    loop () {
      this.animScale = this.gainOn(this.animScale, this.scale);
      this.animTranslateX = this.gainOn(this.animTranslateX, this.translateX);
      this.animTranslateY = this.gainOn(this.animTranslateY, this.translateY);
      this.raf = window.requestAnimationFrame(this.loop);
      // console.log('loop', this.raf)
    },
    gainOn (from, to) {
      let delta = (to - from) * 0.3;
      // console.log('gainOn', from, to, from + delta)
      if (Math.abs(delta) > 1e-5) {
        return from + delta
      } else {
        return to
      }
    },
    // Mouse Events ------------------------------------------------------------
    // Mouse wheel scroll,  TrackPad pinch or TrackPad scroll
    onMouseWheel (ev) {
      if (ev.detail) ev.wheelDelta = ev.detail * -10;
      let currTime = Date.now();
      if (Math.abs(ev.wheelDelta) === 120) {
        // Throttle the TouchPad pinch on Mac, or it will be too sensitive
        if (currTime - this.lastFullWheelTime > 50) {
          this.onMouseWheelDo(ev.wheelDelta);
          this.lastFullWheelTime = currTime;
        }
      } else {
        if (currTime - this.lastWheelTime > 50 && typeof ev.deltaX === 'number') {
          this.lastWheelDirection = (ev.detail == 0 && Math.abs(ev.deltaX) > Math.abs(ev.deltaY)) ? 'x' : 'y';
          if (this.lastWheelDirection === 'x') {
            this.$emit('swipe', ev.deltaX > 0 ? 'left' : 'right');
          }
        }
        if (this.lastWheelDirection === 'y') {
          this.onMouseWheelDo(ev.wheelDelta);
        }
      }
      this.lastWheelTime = currTime;
    },
    onMouseWheelDo (wheelDelta) {
      // Value basis: One mouse wheel (wheelDelta=+-120) means 1.25/0.8 scale.
      let scaleDelta = Math.pow(1.25, wheelDelta / 120);
      this.tryToScale(scaleDelta);
      this.onInteractionEnd();
    },
    onMouseDown (ev) {
      this.refreshContainerPos();
      this.isPointerDown = true;
      // Open the context menu then click other place will skip the mousemove events.
      // This will cause the pointerPosX/Y NOT sync, then we will need to fix it on mousedown event.
      this.pointerPosX = ev.clientX;
      this.pointerPosY = ev.clientY;
      // console.log('onMouseDown', ev)
    },
    onMouseUp (ev) {
      this.isPointerDown = false;
      this.onInteractionEnd();
    },
    onMouseMove (ev) {
      this.onPointerMove(ev.clientX, ev.clientY);
      // console.log('onMouseMove client, offset', ev.clientX, ev.clientY)
    },
    // Touch Events ------------------------------------------------------------
    onTouchStart (ev) {
      if (ev.touches.length === 1) {
        this.refreshContainerPos();
        this.pointerPosX = ev.touches[0].clientX;
        this.pointerPosY = ev.touches[0].clientY;
        this.isPointerDown = true;
      } else if (ev.touches.length === 2) {
        this.isPointerDown = true;
        // pos
        this.pointerPosX = (ev.touches[0].clientX + ev.touches[1].clientX) / 2;
        this.pointerPosY = (ev.touches[0].clientY + ev.touches[1].clientY) / 2;
        // dist
        let distX = ev.touches[0].clientX - ev.touches[1].clientX;
        let distY = ev.touches[0].clientY - ev.touches[1].clientY;
        this.twoFingerInitDist = Math.sqrt(distX * distX + distY * distY);
      }
      // console.log('onTouchStart', ev.touches)
    },
    onTouchEnd (ev) {
      if (ev.touches.length === 0) {
        this.isPointerDown = false;
        // Near 1 to set 1
        if (Math.abs(this.scale - 1) < 0.1) this.scale = 1;
        this.onInteractionEnd();
      } else if (ev.touches.length === 1) {
        this.pointerPosX = ev.touches[0].clientX;
        this.pointerPosY = ev.touches[0].clientY;
      }
      // console.log('onTouchEnd', ev.touches.length)
    },
    onTouchMove (ev) {
      if (ev.touches.length === 1) {
        this.onPointerMove(ev.touches[0].clientX, ev.touches[0].clientY);
      } else if (ev.touches.length === 2) {
        // pos
        let newMousePosX = (ev.touches[0].clientX + ev.touches[1].clientX) / 2;
        let newMousePosY = (ev.touches[0].clientY + ev.touches[1].clientY) / 2;
        this.onPointerMove(newMousePosX, newMousePosY);
        this.pointerPosX = newMousePosX;
        this.pointerPosY = newMousePosY;
        // dist
        let distX = ev.touches[0].clientX - ev.touches[1].clientX;
        let distY = ev.touches[0].clientY - ev.touches[1].clientY;
        let newTwoFingerDist = Math.sqrt(distX * distX + distY * distY);
        this.tryToScale(newTwoFingerDist / this.twoFingerInitDist);
        this.twoFingerInitDist = newTwoFingerDist;
      }
      // console.log('onTouchMove', this.pointerPosX, this.pointerPosY)
    },
  },
};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier
/* server only */
, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
  if (typeof shadowMode !== 'boolean') {
    createInjectorSSR = createInjector;
    createInjector = shadowMode;
    shadowMode = false;
  } // Vue.extend constructor export interop.


  var options = typeof script === 'function' ? script.options : script; // render functions

  if (template && template.render) {
    options.render = template.render;
    options.staticRenderFns = template.staticRenderFns;
    options._compiled = true; // functional template

    if (isFunctionalTemplate) {
      options.functional = true;
    }
  } // scopedId


  if (scopeId) {
    options._scopeId = scopeId;
  }

  var hook;

  if (moduleIdentifier) {
    // server build
    hook = function hook(context) {
      // 2.3 injection
      context = context || // cached call
      this.$vnode && this.$vnode.ssrContext || // stateful
      this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext; // functional
      // 2.2 with runInNewContext: true

      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__;
      } // inject component styles


      if (style) {
        style.call(this, createInjectorSSR(context));
      } // register component module identifier for async chunk inference


      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier);
      }
    }; // used by ssr in case component is cached and beforeCreate
    // never gets called


    options._ssrRegister = hook;
  } else if (style) {
    hook = shadowMode ? function () {
      style.call(this, createInjectorShadow(this.$root.$options.shadowRoot));
    } : function (context) {
      style.call(this, createInjector(context));
    };
  }

  if (hook) {
    if (options.functional) {
      // register for functional component in vue file
      var originalRender = options.render;

      options.render = function renderWithStyleInjection(h, context) {
        hook.call(context);
        return originalRender(h, context);
      };
    } else {
      // inject component registration as beforeCreate hook
      var existing = options.beforeCreate;
      options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
    }
  }

  return script;
}

var normalizeComponent_1 = normalizeComponent;

var isOldIE = typeof navigator !== 'undefined' && /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
function createInjector(context) {
  return function (id, style) {
    return addStyle(id, style);
  };
}
var HEAD;
var styles = {};

function addStyle(id, css) {
  var group = isOldIE ? css.media || 'default' : id;
  var style = styles[group] || (styles[group] = {
    ids: new Set(),
    styles: []
  });

  if (!style.ids.has(id)) {
    style.ids.add(id);
    var code = css.source;

    if (css.map) {
      // https://developer.chrome.com/devtools/docs/javascript-debugging
      // this makes source maps inside style tags work properly in Chrome
      code += '\n/*# sourceURL=' + css.map.sources[0] + ' */'; // http://stackoverflow.com/a/26603875

      code += '\n/*# sourceMappingURL=data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) + ' */';
    }

    if (!style.element) {
      style.element = document.createElement('style');
      style.element.type = 'text/css';
      if (css.media) style.element.setAttribute('media', css.media);

      if (HEAD === undefined) {
        HEAD = document.head || document.getElementsByTagName('head')[0];
      }

      HEAD.appendChild(style.element);
    }

    if ('styleSheet' in style.element) {
      style.styles.push(code);
      style.element.styleSheet.cssText = style.styles.filter(Boolean).join('\n');
    } else {
      var index = style.ids.size - 1;
      var textNode = document.createTextNode(code);
      var nodes = style.element.childNodes;
      if (nodes[index]) style.element.removeChild(nodes[index]);
      if (nodes.length) style.element.insertBefore(textNode, nodes[index]);else style.element.appendChild(textNode);
    }
  }
}

var browser = createInjector;

/* script */
const __vue_script__ = script;

/* template */
var __vue_render__ = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      staticClass: "vue-zoomer",
      style: { backgroundColor: _vm.backgroundColor },
      on: {
        mousewheel: function($event) {
          $event.preventDefault();
          return _vm.onMouseWheel($event)
        },
        DOMMouseScroll: _vm.onMouseWheel,
        mousedown: _vm.onMouseDown,
        mouseup: _vm.onMouseUp,
        mousemove: _vm.onMouseMove,
        mouseout: _vm.setPointerPosCenter,
        touchstart: _vm.onTouchStart,
        touchend: _vm.onTouchEnd,
        touchmove: _vm.onTouchMove
      }
    },
    [
      _c(
        "div",
        { staticClass: "zoomer", style: _vm.wrapperStyle },
        [_vm._t("default")],
        2
      )
    ]
  )
};
var __vue_staticRenderFns__ = [];
__vue_render__._withStripped = true;

  /* style */
  const __vue_inject_styles__ = function (inject) {
    if (!inject) return
    inject("data-v-3cd05a06_0", { source: ".vue-zoomer[data-v-3cd05a06] {\n  overflow: hidden;\n  transition: background-color 0.5s;\n}\n.zoomer[data-v-3cd05a06] {\n  transform-origin: 50% 50%;\n  width: 100%;\n  height: 100%;\n}\n.zoomer > img[data-v-3cd05a06] {\n  vertical-align: top;\n  user-drag: none;\n  -webkit-user-drag: none;\n  -moz-user-drag: none;\n}\n", map: undefined, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__ = "data-v-3cd05a06";
  /* module identifier */
  const __vue_module_identifier__ = undefined;
  /* functional template */
  const __vue_is_functional_template__ = false;
  /* style inject SSR */
  

  
  var VueZoomer = normalizeComponent_1(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    browser,
    undefined
  );

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


const SLIDE_WIDTH_THRESH = 50; // in px

var script$1 = {
  props: {
    value: { type: Number, required: true },
    list: { type: Array, required: true },
    backgroundColor: { type: String, default: '#333' },
    pivot: { type: String, default: 'cursor' },
    limitTranslation: { type: Boolean, default: true },
    doubleClickToZoom: { type: Boolean, default: true },
  },
  data () {
    return {
      // env states
      containerWidth: 1,
      containerHeight: 1,
      // main states
      selIndex: this.value,
      animSelIndex: this.value,
      currentZoomed: false,
      autoSliding: false,
      imageAspectRatios: [], // aspect ratio (width / height) of images
      // interaction states
      isPointerDown: false,
      lastPointerX: 0,
      slideOffsetX: 0,
    }
  },
  computed: {
    middleStyle () {
      return {
        left: `${ 0 + this.slideOffsetX }px`,
      }
    },
    leftStyle () {
      return {
        left: `${ -this.containerWidth + this.slideOffsetX }px`,
      }
    },
    rightStyle () {
      return {
        left: `${ this.containerWidth + this.slideOffsetX }px`,
      }
    },
    slideThresh () {
      return Math.max(SLIDE_WIDTH_THRESH, this.containerWidth * 0.1)
    },
  },
  watch: {
    value (val) {
      if (val !== this.animSelIndex) {
        this.selIndex = val;
        this.animSelIndex = val;
      }
    },
    selIndex() {
      this.$nextTick(() => {
        this.$refs.zoomers.forEach(zoomer => {
          zoomer.refreshContainerPos();
        });
      });
    },
  },
  mounted () {
    window.addEventListener('resize', this.onWindowResize);
    this.onWindowResize();
  },
  destroyed () {
    window.removeEventListener('resize', this.onWindowResize);
  },
  methods: {
    // api ---------------------------------------------------------------------
    reset () {
      this.$refs.zoomers.forEach(zoomer => {
        zoomer.reset();
      });
    },
    zoomIn (scale) {
      if (this.$refs.zoomers[1]) this.$refs.zoomers[1].zoomIn(scale);
    },
    zoomOut (scale) {
      if (this.$refs.zoomers[1]) this.$refs.zoomers[1].zoomOut(scale);
    },
    // events ------------------------------------------------------------------
    onWindowResize () {
      let styles = window.getComputedStyle(this.$el);
      this.containerWidth = parseFloat(styles.width);
      this.containerHeight = parseFloat(styles.height);
    },
    onPointerMove (deltaX) {
      if (this.isPointerDown && !this.currentZoomed) {
        let factor = (
          (this.selIndex === 0 && deltaX > 0 && this.slideOffsetX + deltaX > 0) ||
          (this.selIndex === this.list.length - 1 && deltaX < 0 && this.slideOffsetX + deltaX < 0)
        ) ? 0.3 : 1;
        this.slideOffsetX += deltaX * factor;
      }
    },
    onPointerUp () {
      if (this.slideOffsetX < -this.slideThresh) {
        // next page
        this.paginate(1);
      } else if (this.slideOffsetX > this.slideThresh) {
        // prev page
        this.paginate(-1);
      } else {
        // only apply the animation
        this.paginate(0);
      }
    },
    // Stop Firefox dragging the image
    onImageDragStart(ev) {
      ev.preventDefault();
      return false
    },
    paginate (deltaIndex) {
      let targetIndex = this.selIndex + deltaIndex;
      if (targetIndex < 0 || targetIndex >= this.list.length) {
        this.slideOffsetX = 0;
        return
      }

      this.slideOffsetX = this.containerWidth * -deltaIndex;
      this.autoSliding = true;
      // update the selIndex before the animation to remove the delay feeling
      this.$emit('input', targetIndex);
      this.animSelIndex = targetIndex;
      setTimeout(() => {
        this.selIndex = targetIndex;
        this.slideOffsetX = 0;
        this.autoSliding = false;
      }, 400);
    },
    onMouseDown (ev) {
      this.isPointerDown = true;
      this.lastPointerX = ev.clientX;
    },
    onMouseUp (ev) {
      this.isPointerDown = false;
      this.onPointerUp();
    },
    onMouseMove (ev) {
      if (this.isPointerDown) {
        this.onPointerMove(ev.clientX - this.lastPointerX);
        this.lastPointerX = ev.clientX;
      }
    },
    onTouchStart (ev) {
      if (ev.touches.length === 1) {
        this.isPointerDown = true;
        this.lastPointerX = ev.touches[0].clientX;
      }
    },
    onTouchEnd (ev) {
      if (ev.touches.length === 0) {
        this.isPointerDown = false;
        this.onPointerUp();
      }
    },
    onTouchMove (ev) {
      if (ev.touches.length === 1) {
        this.onPointerMove(ev.touches[0].clientX - this.lastPointerX);
        this.lastPointerX = ev.touches[0].clientX;
      }
    },
    onImageLoad (index, ev) {
      let aspectRatio = ev.target.naturalWidth / ev.target.naturalHeight;
      this.$set(this.imageAspectRatios, index, aspectRatio);
    },
    onImageSwipe (direction) {
      this.paginate(direction == 'right' ? -1 : 1);
    },
  },
};

/* script */
const __vue_script__$1 = script$1;

/* template */
var __vue_render__$1 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      staticClass: "vue-zoomer-gallery",
      class: {
        anim: _vm.autoSliding && !_vm.isPointerDown
      },
      style: {
        "background-color": _vm.backgroundColor
      },
      on: {
        mousemove: _vm.onMouseMove,
        mousedown: _vm.onMouseDown,
        mouseout: _vm.onMouseUp,
        mouseup: _vm.onMouseUp,
        touchstart: _vm.onTouchStart,
        touchend: _vm.onTouchEnd,
        touchmove: function($event) {
          $event.preventDefault();
          return _vm.onTouchMove($event)
        }
      }
    },
    _vm._l(3, function(n, i) {
      return _c(
        "v-zoomer",
        {
          key: i + _vm.selIndex,
          ref: "zoomers",
          refInFor: true,
          staticClass: "slide",
          class: ["left", "middle", "right"][i],
          style: [_vm.leftStyle, _vm.middleStyle, _vm.rightStyle][i],
          attrs: {
            "max-scale": 10,
            zoomed: _vm.currentZoomed,
            "reset-trigger": i,
            "aspect-ratio": _vm.imageAspectRatios[_vm.selIndex + i - 1] || 1,
            pivot: _vm.pivot,
            "limit-translation": _vm.limitTranslation,
            "double-click-to-zoom": _vm.doubleClickToZoom
          },
          on: {
            "update:zoomed": function($event) {
              _vm.currentZoomed = $event;
            },
            swipe: _vm.onImageSwipe
          }
        },
        [
          _vm.selIndex + i - 1 > -1 && _vm.selIndex + i - 1 < _vm.list.length
            ? _c("img", {
                staticStyle: {
                  "object-fit": "contain",
                  width: "100%",
                  height: "100%"
                },
                attrs: {
                  src: _vm.list[_vm.selIndex + i - 1],
                  draggable: "false"
                },
                on: {
                  load: function($event) {
                    return _vm.onImageLoad(_vm.selIndex + i - 1, $event)
                  },
                  dragstart: _vm.onImageDragStart
                }
              })
            : _vm._e()
        ]
      )
    }),
    1
  )
};
var __vue_staticRenderFns__$1 = [];
__vue_render__$1._withStripped = true;

  /* style */
  const __vue_inject_styles__$1 = function (inject) {
    if (!inject) return
    inject("data-v-8a416128_0", { source: ".vue-zoomer-gallery[data-v-8a416128] {\n  position: relative;\n  overflow: hidden;\n  user-select: none;\n  min-width: 100px;\n  min-height: 100px;\n}\n.vue-zoomer-gallery > *[data-v-8a416128] {\n  display: inline-block;\n}\n.vue-zoomer-gallery.anim .slide[data-v-8a416128] {\n  transition: left 0.4s;\n}\n.slide[data-v-8a416128] {\n  position: absolute;\n  top: 0;\n  object-fit: contain;\n  width: 100%;\n  height: 100%;\n  user-drag: none;\n  -webkit-user-drag: none;\n  -moz-user-drag: none;\n  -ms-user-drag: none;\n}\n", map: undefined, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$1 = "data-v-8a416128";
  /* module identifier */
  const __vue_module_identifier__$1 = undefined;
  /* functional template */
  const __vue_is_functional_template__$1 = false;
  /* style inject SSR */
  

  
  var VueZoomerGallery = normalizeComponent_1(
    { render: __vue_render__$1, staticRenderFns: __vue_staticRenderFns__$1 },
    __vue_inject_styles__$1,
    __vue_script__$1,
    __vue_scope_id__$1,
    __vue_is_functional_template__$1,
    __vue_module_identifier__$1,
    browser,
    undefined
  );

var index = {
  install (Vue) {
    Vue.component('VZoomer', VueZoomer);
    Vue.component('VZoomerGallery', VueZoomerGallery);
  },
};

export default index;
