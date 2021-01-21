
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function claim_element(nodes, name, attributes, svg) {
        for (let i = 0; i < nodes.length; i += 1) {
            const node = nodes[i];
            if (node.nodeName === name) {
                let j = 0;
                const remove = [];
                while (j < node.attributes.length) {
                    const attribute = node.attributes[j++];
                    if (!attributes[attribute.name]) {
                        remove.push(attribute.name);
                    }
                }
                for (let k = 0; k < remove.length; k++) {
                    node.removeAttribute(remove[k]);
                }
                return nodes.splice(i, 1)[0];
            }
        }
        return svg ? svg_element(name) : element(name);
    }
    function claim_text(nodes, data) {
        for (let i = 0; i < nodes.length; i += 1) {
            const node = nodes[i];
            if (node.nodeType === 3) {
                node.data = '' + data;
                return nodes.splice(i, 1)[0];
            }
        }
        return text(data);
    }
    function claim_space(nodes) {
        return claim_text(nodes, ' ');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function claim_component(block, parent_nodes) {
        block && block.l(parent_nodes);
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.31.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCFoundation = /** @class */ (function () {
        function MDCFoundation(adapter) {
            if (adapter === void 0) { adapter = {}; }
            this.adapter_ = adapter;
        }
        Object.defineProperty(MDCFoundation, "cssClasses", {
            get: function () {
                // Classes extending MDCFoundation should implement this method to return an object which exports every
                // CSS class the foundation class needs as a property. e.g. {ACTIVE: 'mdc-component--active'}
                return {};
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCFoundation, "strings", {
            get: function () {
                // Classes extending MDCFoundation should implement this method to return an object which exports all
                // semantic strings as constants. e.g. {ARIA_ROLE: 'tablist'}
                return {};
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCFoundation, "numbers", {
            get: function () {
                // Classes extending MDCFoundation should implement this method to return an object which exports all
                // of its semantic numbers as constants. e.g. {ANIMATION_DELAY_MS: 350}
                return {};
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCFoundation, "defaultAdapter", {
            get: function () {
                // Classes extending MDCFoundation may choose to implement this getter in order to provide a convenient
                // way of viewing the necessary methods of an adapter. In the future, this could also be used for adapter
                // validation.
                return {};
            },
            enumerable: true,
            configurable: true
        });
        MDCFoundation.prototype.init = function () {
            // Subclasses should override this method to perform initialization routines (registering events, etc.)
        };
        MDCFoundation.prototype.destroy = function () {
            // Subclasses should override this method to perform de-initialization routines (de-registering events, etc.)
        };
        return MDCFoundation;
    }());

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCComponent = /** @class */ (function () {
        function MDCComponent(root, foundation) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            this.root_ = root;
            this.initialize.apply(this, __spread(args));
            // Note that we initialize foundation here and not within the constructor's default param so that
            // this.root_ is defined and can be used within the foundation class.
            this.foundation_ = foundation === undefined ? this.getDefaultFoundation() : foundation;
            this.foundation_.init();
            this.initialSyncWithDOM();
        }
        MDCComponent.attachTo = function (root) {
            // Subclasses which extend MDCBase should provide an attachTo() method that takes a root element and
            // returns an instantiated component with its root set to that element. Also note that in the cases of
            // subclasses, an explicit foundation class will not have to be passed in; it will simply be initialized
            // from getDefaultFoundation().
            return new MDCComponent(root, new MDCFoundation({}));
        };
        /* istanbul ignore next: method param only exists for typing purposes; it does not need to be unit tested */
        MDCComponent.prototype.initialize = function () {
            var _args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _args[_i] = arguments[_i];
            }
            // Subclasses can override this to do any additional setup work that would be considered part of a
            // "constructor". Essentially, it is a hook into the parent constructor before the foundation is
            // initialized. Any additional arguments besides root and foundation will be passed in here.
        };
        MDCComponent.prototype.getDefaultFoundation = function () {
            // Subclasses must override this method to return a properly configured foundation class for the
            // component.
            throw new Error('Subclasses must override getDefaultFoundation to return a properly configured ' +
                'foundation class');
        };
        MDCComponent.prototype.initialSyncWithDOM = function () {
            // Subclasses should override this method if they need to perform work to synchronize with a host DOM
            // object. An example of this would be a form control wrapper that needs to synchronize its internal state
            // to some property or attribute of the host DOM. Please note: this is *not* the place to perform DOM
            // reads/writes that would cause layout / paint, as this is called synchronously from within the constructor.
        };
        MDCComponent.prototype.destroy = function () {
            // Subclasses may implement this method to release any resources / deregister any listeners they have
            // attached. An example of this might be deregistering a resize event from the window object.
            this.foundation_.destroy();
        };
        MDCComponent.prototype.listen = function (evtType, handler, options) {
            this.root_.addEventListener(evtType, handler, options);
        };
        MDCComponent.prototype.unlisten = function (evtType, handler, options) {
            this.root_.removeEventListener(evtType, handler, options);
        };
        /**
         * Fires a cross-browser-compatible custom event from the component root of the given type, with the given data.
         */
        MDCComponent.prototype.emit = function (evtType, evtData, shouldBubble) {
            if (shouldBubble === void 0) { shouldBubble = false; }
            var evt;
            if (typeof CustomEvent === 'function') {
                evt = new CustomEvent(evtType, {
                    bubbles: shouldBubble,
                    detail: evtData,
                });
            }
            else {
                evt = document.createEvent('CustomEvent');
                evt.initCustomEvent(evtType, shouldBubble, false, evtData);
            }
            this.root_.dispatchEvent(evt);
        };
        return MDCComponent;
    }());

    /**
     * @license
     * Copyright 2019 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    /**
     * Stores result from applyPassive to avoid redundant processing to detect
     * passive event listener support.
     */
    var supportsPassive_;
    /**
     * Determine whether the current browser supports passive event listeners, and
     * if so, use them.
     */
    function applyPassive(globalObj, forceRefresh) {
        if (globalObj === void 0) { globalObj = window; }
        if (forceRefresh === void 0) { forceRefresh = false; }
        if (supportsPassive_ === undefined || forceRefresh) {
            var isSupported_1 = false;
            try {
                globalObj.document.addEventListener('test', function () { return undefined; }, {
                    get passive() {
                        isSupported_1 = true;
                        return isSupported_1;
                    },
                });
            }
            catch (e) {
            } // tslint:disable-line:no-empty cannot throw error due to tests. tslint also disables console.log.
            supportsPassive_ = isSupported_1;
        }
        return supportsPassive_ ? { passive: true } : false;
    }

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    function matches(element, selector) {
        var nativeMatches = element.matches
            || element.webkitMatchesSelector
            || element.msMatchesSelector;
        return nativeMatches.call(element, selector);
    }

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssClasses = {
        // Ripple is a special case where the "root" component is really a "mixin" of sorts,
        // given that it's an 'upgrade' to an existing component. That being said it is the root
        // CSS class that all other CSS classes derive from.
        BG_FOCUSED: 'mdc-ripple-upgraded--background-focused',
        FG_ACTIVATION: 'mdc-ripple-upgraded--foreground-activation',
        FG_DEACTIVATION: 'mdc-ripple-upgraded--foreground-deactivation',
        ROOT: 'mdc-ripple-upgraded',
        UNBOUNDED: 'mdc-ripple-upgraded--unbounded',
    };
    var strings = {
        VAR_FG_SCALE: '--mdc-ripple-fg-scale',
        VAR_FG_SIZE: '--mdc-ripple-fg-size',
        VAR_FG_TRANSLATE_END: '--mdc-ripple-fg-translate-end',
        VAR_FG_TRANSLATE_START: '--mdc-ripple-fg-translate-start',
        VAR_LEFT: '--mdc-ripple-left',
        VAR_TOP: '--mdc-ripple-top',
    };
    var numbers = {
        DEACTIVATION_TIMEOUT_MS: 225,
        FG_DEACTIVATION_MS: 150,
        INITIAL_ORIGIN_SCALE: 0.6,
        PADDING: 10,
        TAP_DELAY_MS: 300,
    };

    /**
     * Stores result from supportsCssVariables to avoid redundant processing to
     * detect CSS custom variable support.
     */
    var supportsCssVariables_;
    function detectEdgePseudoVarBug(windowObj) {
        // Detect versions of Edge with buggy var() support
        // See: https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/11495448/
        var document = windowObj.document;
        var node = document.createElement('div');
        node.className = 'mdc-ripple-surface--test-edge-var-bug';
        // Append to head instead of body because this script might be invoked in the
        // head, in which case the body doesn't exist yet. The probe works either way.
        document.head.appendChild(node);
        // The bug exists if ::before style ends up propagating to the parent element.
        // Additionally, getComputedStyle returns null in iframes with display: "none" in Firefox,
        // but Firefox is known to support CSS custom properties correctly.
        // See: https://bugzilla.mozilla.org/show_bug.cgi?id=548397
        var computedStyle = windowObj.getComputedStyle(node);
        var hasPseudoVarBug = computedStyle !== null && computedStyle.borderTopStyle === 'solid';
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
        return hasPseudoVarBug;
    }
    function supportsCssVariables(windowObj, forceRefresh) {
        if (forceRefresh === void 0) { forceRefresh = false; }
        var CSS = windowObj.CSS;
        var supportsCssVars = supportsCssVariables_;
        if (typeof supportsCssVariables_ === 'boolean' && !forceRefresh) {
            return supportsCssVariables_;
        }
        var supportsFunctionPresent = CSS && typeof CSS.supports === 'function';
        if (!supportsFunctionPresent) {
            return false;
        }
        var explicitlySupportsCssVars = CSS.supports('--css-vars', 'yes');
        // See: https://bugs.webkit.org/show_bug.cgi?id=154669
        // See: README section on Safari
        var weAreFeatureDetectingSafari10plus = (CSS.supports('(--css-vars: yes)') &&
            CSS.supports('color', '#00000000'));
        if (explicitlySupportsCssVars || weAreFeatureDetectingSafari10plus) {
            supportsCssVars = !detectEdgePseudoVarBug(windowObj);
        }
        else {
            supportsCssVars = false;
        }
        if (!forceRefresh) {
            supportsCssVariables_ = supportsCssVars;
        }
        return supportsCssVars;
    }
    function getNormalizedEventCoords(evt, pageOffset, clientRect) {
        if (!evt) {
            return { x: 0, y: 0 };
        }
        var x = pageOffset.x, y = pageOffset.y;
        var documentX = x + clientRect.left;
        var documentY = y + clientRect.top;
        var normalizedX;
        var normalizedY;
        // Determine touch point relative to the ripple container.
        if (evt.type === 'touchstart') {
            var touchEvent = evt;
            normalizedX = touchEvent.changedTouches[0].pageX - documentX;
            normalizedY = touchEvent.changedTouches[0].pageY - documentY;
        }
        else {
            var mouseEvent = evt;
            normalizedX = mouseEvent.pageX - documentX;
            normalizedY = mouseEvent.pageY - documentY;
        }
        return { x: normalizedX, y: normalizedY };
    }

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    // Activation events registered on the root element of each instance for activation
    var ACTIVATION_EVENT_TYPES = [
        'touchstart', 'pointerdown', 'mousedown', 'keydown',
    ];
    // Deactivation events registered on documentElement when a pointer-related down event occurs
    var POINTER_DEACTIVATION_EVENT_TYPES = [
        'touchend', 'pointerup', 'mouseup', 'contextmenu',
    ];
    // simultaneous nested activations
    var activatedTargets = [];
    var MDCRippleFoundation = /** @class */ (function (_super) {
        __extends(MDCRippleFoundation, _super);
        function MDCRippleFoundation(adapter) {
            var _this = _super.call(this, __assign({}, MDCRippleFoundation.defaultAdapter, adapter)) || this;
            _this.activationAnimationHasEnded_ = false;
            _this.activationTimer_ = 0;
            _this.fgDeactivationRemovalTimer_ = 0;
            _this.fgScale_ = '0';
            _this.frame_ = { width: 0, height: 0 };
            _this.initialSize_ = 0;
            _this.layoutFrame_ = 0;
            _this.maxRadius_ = 0;
            _this.unboundedCoords_ = { left: 0, top: 0 };
            _this.activationState_ = _this.defaultActivationState_();
            _this.activationTimerCallback_ = function () {
                _this.activationAnimationHasEnded_ = true;
                _this.runDeactivationUXLogicIfReady_();
            };
            _this.activateHandler_ = function (e) { return _this.activate_(e); };
            _this.deactivateHandler_ = function () { return _this.deactivate_(); };
            _this.focusHandler_ = function () { return _this.handleFocus(); };
            _this.blurHandler_ = function () { return _this.handleBlur(); };
            _this.resizeHandler_ = function () { return _this.layout(); };
            return _this;
        }
        Object.defineProperty(MDCRippleFoundation, "cssClasses", {
            get: function () {
                return cssClasses;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCRippleFoundation, "strings", {
            get: function () {
                return strings;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCRippleFoundation, "numbers", {
            get: function () {
                return numbers;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCRippleFoundation, "defaultAdapter", {
            get: function () {
                return {
                    addClass: function () { return undefined; },
                    browserSupportsCssVars: function () { return true; },
                    computeBoundingRect: function () { return ({ top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0 }); },
                    containsEventTarget: function () { return true; },
                    deregisterDocumentInteractionHandler: function () { return undefined; },
                    deregisterInteractionHandler: function () { return undefined; },
                    deregisterResizeHandler: function () { return undefined; },
                    getWindowPageOffset: function () { return ({ x: 0, y: 0 }); },
                    isSurfaceActive: function () { return true; },
                    isSurfaceDisabled: function () { return true; },
                    isUnbounded: function () { return true; },
                    registerDocumentInteractionHandler: function () { return undefined; },
                    registerInteractionHandler: function () { return undefined; },
                    registerResizeHandler: function () { return undefined; },
                    removeClass: function () { return undefined; },
                    updateCssVariable: function () { return undefined; },
                };
            },
            enumerable: true,
            configurable: true
        });
        MDCRippleFoundation.prototype.init = function () {
            var _this = this;
            var supportsPressRipple = this.supportsPressRipple_();
            this.registerRootHandlers_(supportsPressRipple);
            if (supportsPressRipple) {
                var _a = MDCRippleFoundation.cssClasses, ROOT_1 = _a.ROOT, UNBOUNDED_1 = _a.UNBOUNDED;
                requestAnimationFrame(function () {
                    _this.adapter_.addClass(ROOT_1);
                    if (_this.adapter_.isUnbounded()) {
                        _this.adapter_.addClass(UNBOUNDED_1);
                        // Unbounded ripples need layout logic applied immediately to set coordinates for both shade and ripple
                        _this.layoutInternal_();
                    }
                });
            }
        };
        MDCRippleFoundation.prototype.destroy = function () {
            var _this = this;
            if (this.supportsPressRipple_()) {
                if (this.activationTimer_) {
                    clearTimeout(this.activationTimer_);
                    this.activationTimer_ = 0;
                    this.adapter_.removeClass(MDCRippleFoundation.cssClasses.FG_ACTIVATION);
                }
                if (this.fgDeactivationRemovalTimer_) {
                    clearTimeout(this.fgDeactivationRemovalTimer_);
                    this.fgDeactivationRemovalTimer_ = 0;
                    this.adapter_.removeClass(MDCRippleFoundation.cssClasses.FG_DEACTIVATION);
                }
                var _a = MDCRippleFoundation.cssClasses, ROOT_2 = _a.ROOT, UNBOUNDED_2 = _a.UNBOUNDED;
                requestAnimationFrame(function () {
                    _this.adapter_.removeClass(ROOT_2);
                    _this.adapter_.removeClass(UNBOUNDED_2);
                    _this.removeCssVars_();
                });
            }
            this.deregisterRootHandlers_();
            this.deregisterDeactivationHandlers_();
        };
        /**
         * @param evt Optional event containing position information.
         */
        MDCRippleFoundation.prototype.activate = function (evt) {
            this.activate_(evt);
        };
        MDCRippleFoundation.prototype.deactivate = function () {
            this.deactivate_();
        };
        MDCRippleFoundation.prototype.layout = function () {
            var _this = this;
            if (this.layoutFrame_) {
                cancelAnimationFrame(this.layoutFrame_);
            }
            this.layoutFrame_ = requestAnimationFrame(function () {
                _this.layoutInternal_();
                _this.layoutFrame_ = 0;
            });
        };
        MDCRippleFoundation.prototype.setUnbounded = function (unbounded) {
            var UNBOUNDED = MDCRippleFoundation.cssClasses.UNBOUNDED;
            if (unbounded) {
                this.adapter_.addClass(UNBOUNDED);
            }
            else {
                this.adapter_.removeClass(UNBOUNDED);
            }
        };
        MDCRippleFoundation.prototype.handleFocus = function () {
            var _this = this;
            requestAnimationFrame(function () {
                return _this.adapter_.addClass(MDCRippleFoundation.cssClasses.BG_FOCUSED);
            });
        };
        MDCRippleFoundation.prototype.handleBlur = function () {
            var _this = this;
            requestAnimationFrame(function () {
                return _this.adapter_.removeClass(MDCRippleFoundation.cssClasses.BG_FOCUSED);
            });
        };
        /**
         * We compute this property so that we are not querying information about the client
         * until the point in time where the foundation requests it. This prevents scenarios where
         * client-side feature-detection may happen too early, such as when components are rendered on the server
         * and then initialized at mount time on the client.
         */
        MDCRippleFoundation.prototype.supportsPressRipple_ = function () {
            return this.adapter_.browserSupportsCssVars();
        };
        MDCRippleFoundation.prototype.defaultActivationState_ = function () {
            return {
                activationEvent: undefined,
                hasDeactivationUXRun: false,
                isActivated: false,
                isProgrammatic: false,
                wasActivatedByPointer: false,
                wasElementMadeActive: false,
            };
        };
        /**
         * supportsPressRipple Passed from init to save a redundant function call
         */
        MDCRippleFoundation.prototype.registerRootHandlers_ = function (supportsPressRipple) {
            var _this = this;
            if (supportsPressRipple) {
                ACTIVATION_EVENT_TYPES.forEach(function (evtType) {
                    _this.adapter_.registerInteractionHandler(evtType, _this.activateHandler_);
                });
                if (this.adapter_.isUnbounded()) {
                    this.adapter_.registerResizeHandler(this.resizeHandler_);
                }
            }
            this.adapter_.registerInteractionHandler('focus', this.focusHandler_);
            this.adapter_.registerInteractionHandler('blur', this.blurHandler_);
        };
        MDCRippleFoundation.prototype.registerDeactivationHandlers_ = function (evt) {
            var _this = this;
            if (evt.type === 'keydown') {
                this.adapter_.registerInteractionHandler('keyup', this.deactivateHandler_);
            }
            else {
                POINTER_DEACTIVATION_EVENT_TYPES.forEach(function (evtType) {
                    _this.adapter_.registerDocumentInteractionHandler(evtType, _this.deactivateHandler_);
                });
            }
        };
        MDCRippleFoundation.prototype.deregisterRootHandlers_ = function () {
            var _this = this;
            ACTIVATION_EVENT_TYPES.forEach(function (evtType) {
                _this.adapter_.deregisterInteractionHandler(evtType, _this.activateHandler_);
            });
            this.adapter_.deregisterInteractionHandler('focus', this.focusHandler_);
            this.adapter_.deregisterInteractionHandler('blur', this.blurHandler_);
            if (this.adapter_.isUnbounded()) {
                this.adapter_.deregisterResizeHandler(this.resizeHandler_);
            }
        };
        MDCRippleFoundation.prototype.deregisterDeactivationHandlers_ = function () {
            var _this = this;
            this.adapter_.deregisterInteractionHandler('keyup', this.deactivateHandler_);
            POINTER_DEACTIVATION_EVENT_TYPES.forEach(function (evtType) {
                _this.adapter_.deregisterDocumentInteractionHandler(evtType, _this.deactivateHandler_);
            });
        };
        MDCRippleFoundation.prototype.removeCssVars_ = function () {
            var _this = this;
            var rippleStrings = MDCRippleFoundation.strings;
            var keys = Object.keys(rippleStrings);
            keys.forEach(function (key) {
                if (key.indexOf('VAR_') === 0) {
                    _this.adapter_.updateCssVariable(rippleStrings[key], null);
                }
            });
        };
        MDCRippleFoundation.prototype.activate_ = function (evt) {
            var _this = this;
            if (this.adapter_.isSurfaceDisabled()) {
                return;
            }
            var activationState = this.activationState_;
            if (activationState.isActivated) {
                return;
            }
            // Avoid reacting to follow-on events fired by touch device after an already-processed user interaction
            var previousActivationEvent = this.previousActivationEvent_;
            var isSameInteraction = previousActivationEvent && evt !== undefined && previousActivationEvent.type !== evt.type;
            if (isSameInteraction) {
                return;
            }
            activationState.isActivated = true;
            activationState.isProgrammatic = evt === undefined;
            activationState.activationEvent = evt;
            activationState.wasActivatedByPointer = activationState.isProgrammatic ? false : evt !== undefined && (evt.type === 'mousedown' || evt.type === 'touchstart' || evt.type === 'pointerdown');
            var hasActivatedChild = evt !== undefined && activatedTargets.length > 0 && activatedTargets.some(function (target) { return _this.adapter_.containsEventTarget(target); });
            if (hasActivatedChild) {
                // Immediately reset activation state, while preserving logic that prevents touch follow-on events
                this.resetActivationState_();
                return;
            }
            if (evt !== undefined) {
                activatedTargets.push(evt.target);
                this.registerDeactivationHandlers_(evt);
            }
            activationState.wasElementMadeActive = this.checkElementMadeActive_(evt);
            if (activationState.wasElementMadeActive) {
                this.animateActivation_();
            }
            requestAnimationFrame(function () {
                // Reset array on next frame after the current event has had a chance to bubble to prevent ancestor ripples
                activatedTargets = [];
                if (!activationState.wasElementMadeActive
                    && evt !== undefined
                    && (evt.key === ' ' || evt.keyCode === 32)) {
                    // If space was pressed, try again within an rAF call to detect :active, because different UAs report
                    // active states inconsistently when they're called within event handling code:
                    // - https://bugs.chromium.org/p/chromium/issues/detail?id=635971
                    // - https://bugzilla.mozilla.org/show_bug.cgi?id=1293741
                    // We try first outside rAF to support Edge, which does not exhibit this problem, but will crash if a CSS
                    // variable is set within a rAF callback for a submit button interaction (#2241).
                    activationState.wasElementMadeActive = _this.checkElementMadeActive_(evt);
                    if (activationState.wasElementMadeActive) {
                        _this.animateActivation_();
                    }
                }
                if (!activationState.wasElementMadeActive) {
                    // Reset activation state immediately if element was not made active.
                    _this.activationState_ = _this.defaultActivationState_();
                }
            });
        };
        MDCRippleFoundation.prototype.checkElementMadeActive_ = function (evt) {
            return (evt !== undefined && evt.type === 'keydown') ? this.adapter_.isSurfaceActive() : true;
        };
        MDCRippleFoundation.prototype.animateActivation_ = function () {
            var _this = this;
            var _a = MDCRippleFoundation.strings, VAR_FG_TRANSLATE_START = _a.VAR_FG_TRANSLATE_START, VAR_FG_TRANSLATE_END = _a.VAR_FG_TRANSLATE_END;
            var _b = MDCRippleFoundation.cssClasses, FG_DEACTIVATION = _b.FG_DEACTIVATION, FG_ACTIVATION = _b.FG_ACTIVATION;
            var DEACTIVATION_TIMEOUT_MS = MDCRippleFoundation.numbers.DEACTIVATION_TIMEOUT_MS;
            this.layoutInternal_();
            var translateStart = '';
            var translateEnd = '';
            if (!this.adapter_.isUnbounded()) {
                var _c = this.getFgTranslationCoordinates_(), startPoint = _c.startPoint, endPoint = _c.endPoint;
                translateStart = startPoint.x + "px, " + startPoint.y + "px";
                translateEnd = endPoint.x + "px, " + endPoint.y + "px";
            }
            this.adapter_.updateCssVariable(VAR_FG_TRANSLATE_START, translateStart);
            this.adapter_.updateCssVariable(VAR_FG_TRANSLATE_END, translateEnd);
            // Cancel any ongoing activation/deactivation animations
            clearTimeout(this.activationTimer_);
            clearTimeout(this.fgDeactivationRemovalTimer_);
            this.rmBoundedActivationClasses_();
            this.adapter_.removeClass(FG_DEACTIVATION);
            // Force layout in order to re-trigger the animation.
            this.adapter_.computeBoundingRect();
            this.adapter_.addClass(FG_ACTIVATION);
            this.activationTimer_ = setTimeout(function () { return _this.activationTimerCallback_(); }, DEACTIVATION_TIMEOUT_MS);
        };
        MDCRippleFoundation.prototype.getFgTranslationCoordinates_ = function () {
            var _a = this.activationState_, activationEvent = _a.activationEvent, wasActivatedByPointer = _a.wasActivatedByPointer;
            var startPoint;
            if (wasActivatedByPointer) {
                startPoint = getNormalizedEventCoords(activationEvent, this.adapter_.getWindowPageOffset(), this.adapter_.computeBoundingRect());
            }
            else {
                startPoint = {
                    x: this.frame_.width / 2,
                    y: this.frame_.height / 2,
                };
            }
            // Center the element around the start point.
            startPoint = {
                x: startPoint.x - (this.initialSize_ / 2),
                y: startPoint.y - (this.initialSize_ / 2),
            };
            var endPoint = {
                x: (this.frame_.width / 2) - (this.initialSize_ / 2),
                y: (this.frame_.height / 2) - (this.initialSize_ / 2),
            };
            return { startPoint: startPoint, endPoint: endPoint };
        };
        MDCRippleFoundation.prototype.runDeactivationUXLogicIfReady_ = function () {
            var _this = this;
            // This method is called both when a pointing device is released, and when the activation animation ends.
            // The deactivation animation should only run after both of those occur.
            var FG_DEACTIVATION = MDCRippleFoundation.cssClasses.FG_DEACTIVATION;
            var _a = this.activationState_, hasDeactivationUXRun = _a.hasDeactivationUXRun, isActivated = _a.isActivated;
            var activationHasEnded = hasDeactivationUXRun || !isActivated;
            if (activationHasEnded && this.activationAnimationHasEnded_) {
                this.rmBoundedActivationClasses_();
                this.adapter_.addClass(FG_DEACTIVATION);
                this.fgDeactivationRemovalTimer_ = setTimeout(function () {
                    _this.adapter_.removeClass(FG_DEACTIVATION);
                }, numbers.FG_DEACTIVATION_MS);
            }
        };
        MDCRippleFoundation.prototype.rmBoundedActivationClasses_ = function () {
            var FG_ACTIVATION = MDCRippleFoundation.cssClasses.FG_ACTIVATION;
            this.adapter_.removeClass(FG_ACTIVATION);
            this.activationAnimationHasEnded_ = false;
            this.adapter_.computeBoundingRect();
        };
        MDCRippleFoundation.prototype.resetActivationState_ = function () {
            var _this = this;
            this.previousActivationEvent_ = this.activationState_.activationEvent;
            this.activationState_ = this.defaultActivationState_();
            // Touch devices may fire additional events for the same interaction within a short time.
            // Store the previous event until it's safe to assume that subsequent events are for new interactions.
            setTimeout(function () { return _this.previousActivationEvent_ = undefined; }, MDCRippleFoundation.numbers.TAP_DELAY_MS);
        };
        MDCRippleFoundation.prototype.deactivate_ = function () {
            var _this = this;
            var activationState = this.activationState_;
            // This can happen in scenarios such as when you have a keyup event that blurs the element.
            if (!activationState.isActivated) {
                return;
            }
            var state = __assign({}, activationState);
            if (activationState.isProgrammatic) {
                requestAnimationFrame(function () { return _this.animateDeactivation_(state); });
                this.resetActivationState_();
            }
            else {
                this.deregisterDeactivationHandlers_();
                requestAnimationFrame(function () {
                    _this.activationState_.hasDeactivationUXRun = true;
                    _this.animateDeactivation_(state);
                    _this.resetActivationState_();
                });
            }
        };
        MDCRippleFoundation.prototype.animateDeactivation_ = function (_a) {
            var wasActivatedByPointer = _a.wasActivatedByPointer, wasElementMadeActive = _a.wasElementMadeActive;
            if (wasActivatedByPointer || wasElementMadeActive) {
                this.runDeactivationUXLogicIfReady_();
            }
        };
        MDCRippleFoundation.prototype.layoutInternal_ = function () {
            var _this = this;
            this.frame_ = this.adapter_.computeBoundingRect();
            var maxDim = Math.max(this.frame_.height, this.frame_.width);
            // Surface diameter is treated differently for unbounded vs. bounded ripples.
            // Unbounded ripple diameter is calculated smaller since the surface is expected to already be padded appropriately
            // to extend the hitbox, and the ripple is expected to meet the edges of the padded hitbox (which is typically
            // square). Bounded ripples, on the other hand, are fully expected to expand beyond the surface's longest diameter
            // (calculated based on the diagonal plus a constant padding), and are clipped at the surface's border via
            // `overflow: hidden`.
            var getBoundedRadius = function () {
                var hypotenuse = Math.sqrt(Math.pow(_this.frame_.width, 2) + Math.pow(_this.frame_.height, 2));
                return hypotenuse + MDCRippleFoundation.numbers.PADDING;
            };
            this.maxRadius_ = this.adapter_.isUnbounded() ? maxDim : getBoundedRadius();
            // Ripple is sized as a fraction of the largest dimension of the surface, then scales up using a CSS scale transform
            this.initialSize_ = Math.floor(maxDim * MDCRippleFoundation.numbers.INITIAL_ORIGIN_SCALE);
            this.fgScale_ = "" + this.maxRadius_ / this.initialSize_;
            this.updateLayoutCssVars_();
        };
        MDCRippleFoundation.prototype.updateLayoutCssVars_ = function () {
            var _a = MDCRippleFoundation.strings, VAR_FG_SIZE = _a.VAR_FG_SIZE, VAR_LEFT = _a.VAR_LEFT, VAR_TOP = _a.VAR_TOP, VAR_FG_SCALE = _a.VAR_FG_SCALE;
            this.adapter_.updateCssVariable(VAR_FG_SIZE, this.initialSize_ + "px");
            this.adapter_.updateCssVariable(VAR_FG_SCALE, this.fgScale_);
            if (this.adapter_.isUnbounded()) {
                this.unboundedCoords_ = {
                    left: Math.round((this.frame_.width / 2) - (this.initialSize_ / 2)),
                    top: Math.round((this.frame_.height / 2) - (this.initialSize_ / 2)),
                };
                this.adapter_.updateCssVariable(VAR_LEFT, this.unboundedCoords_.left + "px");
                this.adapter_.updateCssVariable(VAR_TOP, this.unboundedCoords_.top + "px");
            }
        };
        return MDCRippleFoundation;
    }(MDCFoundation));

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCRipple = /** @class */ (function (_super) {
        __extends(MDCRipple, _super);
        function MDCRipple() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.disabled = false;
            return _this;
        }
        MDCRipple.attachTo = function (root, opts) {
            if (opts === void 0) { opts = { isUnbounded: undefined }; }
            var ripple = new MDCRipple(root);
            // Only override unbounded behavior if option is explicitly specified
            if (opts.isUnbounded !== undefined) {
                ripple.unbounded = opts.isUnbounded;
            }
            return ripple;
        };
        MDCRipple.createAdapter = function (instance) {
            return {
                addClass: function (className) { return instance.root_.classList.add(className); },
                browserSupportsCssVars: function () { return supportsCssVariables(window); },
                computeBoundingRect: function () { return instance.root_.getBoundingClientRect(); },
                containsEventTarget: function (target) { return instance.root_.contains(target); },
                deregisterDocumentInteractionHandler: function (evtType, handler) {
                    return document.documentElement.removeEventListener(evtType, handler, applyPassive());
                },
                deregisterInteractionHandler: function (evtType, handler) {
                    return instance.root_.removeEventListener(evtType, handler, applyPassive());
                },
                deregisterResizeHandler: function (handler) { return window.removeEventListener('resize', handler); },
                getWindowPageOffset: function () { return ({ x: window.pageXOffset, y: window.pageYOffset }); },
                isSurfaceActive: function () { return matches(instance.root_, ':active'); },
                isSurfaceDisabled: function () { return Boolean(instance.disabled); },
                isUnbounded: function () { return Boolean(instance.unbounded); },
                registerDocumentInteractionHandler: function (evtType, handler) {
                    return document.documentElement.addEventListener(evtType, handler, applyPassive());
                },
                registerInteractionHandler: function (evtType, handler) {
                    return instance.root_.addEventListener(evtType, handler, applyPassive());
                },
                registerResizeHandler: function (handler) { return window.addEventListener('resize', handler); },
                removeClass: function (className) { return instance.root_.classList.remove(className); },
                updateCssVariable: function (varName, value) { return instance.root_.style.setProperty(varName, value); },
            };
        };
        Object.defineProperty(MDCRipple.prototype, "unbounded", {
            get: function () {
                return Boolean(this.unbounded_);
            },
            set: function (unbounded) {
                this.unbounded_ = Boolean(unbounded);
                this.setUnbounded_();
            },
            enumerable: true,
            configurable: true
        });
        MDCRipple.prototype.activate = function () {
            this.foundation_.activate();
        };
        MDCRipple.prototype.deactivate = function () {
            this.foundation_.deactivate();
        };
        MDCRipple.prototype.layout = function () {
            this.foundation_.layout();
        };
        MDCRipple.prototype.getDefaultFoundation = function () {
            return new MDCRippleFoundation(MDCRipple.createAdapter(this));
        };
        MDCRipple.prototype.initialSyncWithDOM = function () {
            var root = this.root_;
            this.unbounded = 'mdcRippleIsUnbounded' in root.dataset;
        };
        /**
         * Closure Compiler throws an access control error when directly accessing a
         * protected or private property inside a getter/setter, like unbounded above.
         * By accessing the protected property inside a method, we solve that problem.
         * That's why this function exists.
         */
        MDCRipple.prototype.setUnbounded_ = function () {
            this.foundation_.setUnbounded(Boolean(this.unbounded_));
        };
        return MDCRipple;
    }(MDCComponent));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssClasses$1 = {
        ACTIVE: 'mdc-tab-indicator--active',
        FADE: 'mdc-tab-indicator--fade',
        NO_TRANSITION: 'mdc-tab-indicator--no-transition',
    };
    var strings$1 = {
        CONTENT_SELECTOR: '.mdc-tab-indicator__content',
    };

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCTabIndicatorFoundation = /** @class */ (function (_super) {
        __extends(MDCTabIndicatorFoundation, _super);
        function MDCTabIndicatorFoundation(adapter) {
            return _super.call(this, __assign({}, MDCTabIndicatorFoundation.defaultAdapter, adapter)) || this;
        }
        Object.defineProperty(MDCTabIndicatorFoundation, "cssClasses", {
            get: function () {
                return cssClasses$1;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTabIndicatorFoundation, "strings", {
            get: function () {
                return strings$1;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTabIndicatorFoundation, "defaultAdapter", {
            get: function () {
                // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
                return {
                    addClass: function () { return undefined; },
                    removeClass: function () { return undefined; },
                    computeContentClientRect: function () { return ({ top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0 }); },
                    setContentStyleProperty: function () { return undefined; },
                };
                // tslint:enable:object-literal-sort-keys
            },
            enumerable: true,
            configurable: true
        });
        MDCTabIndicatorFoundation.prototype.computeContentClientRect = function () {
            return this.adapter_.computeContentClientRect();
        };
        return MDCTabIndicatorFoundation;
    }(MDCFoundation));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    /* istanbul ignore next: subclass is not a branch statement */
    var MDCFadingTabIndicatorFoundation = /** @class */ (function (_super) {
        __extends(MDCFadingTabIndicatorFoundation, _super);
        function MDCFadingTabIndicatorFoundation() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MDCFadingTabIndicatorFoundation.prototype.activate = function () {
            this.adapter_.addClass(MDCTabIndicatorFoundation.cssClasses.ACTIVE);
        };
        MDCFadingTabIndicatorFoundation.prototype.deactivate = function () {
            this.adapter_.removeClass(MDCTabIndicatorFoundation.cssClasses.ACTIVE);
        };
        return MDCFadingTabIndicatorFoundation;
    }(MDCTabIndicatorFoundation));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    /* istanbul ignore next: subclass is not a branch statement */
    var MDCSlidingTabIndicatorFoundation = /** @class */ (function (_super) {
        __extends(MDCSlidingTabIndicatorFoundation, _super);
        function MDCSlidingTabIndicatorFoundation() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MDCSlidingTabIndicatorFoundation.prototype.activate = function (previousIndicatorClientRect) {
            // Early exit if no indicator is present to handle cases where an indicator
            // may be activated without a prior indicator state
            if (!previousIndicatorClientRect) {
                this.adapter_.addClass(MDCTabIndicatorFoundation.cssClasses.ACTIVE);
                return;
            }
            // This animation uses the FLIP approach. You can read more about it at the link below:
            // https://aerotwist.com/blog/flip-your-animations/
            // Calculate the dimensions based on the dimensions of the previous indicator
            var currentClientRect = this.computeContentClientRect();
            var widthDelta = previousIndicatorClientRect.width / currentClientRect.width;
            var xPosition = previousIndicatorClientRect.left - currentClientRect.left;
            this.adapter_.addClass(MDCTabIndicatorFoundation.cssClasses.NO_TRANSITION);
            this.adapter_.setContentStyleProperty('transform', "translateX(" + xPosition + "px) scaleX(" + widthDelta + ")");
            // Force repaint before updating classes and transform to ensure the transform properly takes effect
            this.computeContentClientRect();
            this.adapter_.removeClass(MDCTabIndicatorFoundation.cssClasses.NO_TRANSITION);
            this.adapter_.addClass(MDCTabIndicatorFoundation.cssClasses.ACTIVE);
            this.adapter_.setContentStyleProperty('transform', '');
        };
        MDCSlidingTabIndicatorFoundation.prototype.deactivate = function () {
            this.adapter_.removeClass(MDCTabIndicatorFoundation.cssClasses.ACTIVE);
        };
        return MDCSlidingTabIndicatorFoundation;
    }(MDCTabIndicatorFoundation));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCTabIndicator = /** @class */ (function (_super) {
        __extends(MDCTabIndicator, _super);
        function MDCTabIndicator() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MDCTabIndicator.attachTo = function (root) {
            return new MDCTabIndicator(root);
        };
        MDCTabIndicator.prototype.initialize = function () {
            this.content_ = this.root_.querySelector(MDCTabIndicatorFoundation.strings.CONTENT_SELECTOR);
        };
        MDCTabIndicator.prototype.computeContentClientRect = function () {
            return this.foundation_.computeContentClientRect();
        };
        MDCTabIndicator.prototype.getDefaultFoundation = function () {
            var _this = this;
            // DO NOT INLINE this variable. For backward compatibility, foundations take a Partial<MDCFooAdapter>.
            // To ensure we don't accidentally omit any methods, we need a separate, strongly typed adapter variable.
            // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
            var adapter = {
                addClass: function (className) { return _this.root_.classList.add(className); },
                removeClass: function (className) { return _this.root_.classList.remove(className); },
                computeContentClientRect: function () { return _this.content_.getBoundingClientRect(); },
                setContentStyleProperty: function (prop, value) { return _this.content_.style.setProperty(prop, value); },
            };
            // tslint:enable:object-literal-sort-keys
            if (this.root_.classList.contains(MDCTabIndicatorFoundation.cssClasses.FADE)) {
                return new MDCFadingTabIndicatorFoundation(adapter);
            }
            // Default to the sliding indicator
            return new MDCSlidingTabIndicatorFoundation(adapter);
        };
        MDCTabIndicator.prototype.activate = function (previousIndicatorClientRect) {
            this.foundation_.activate(previousIndicatorClientRect);
        };
        MDCTabIndicator.prototype.deactivate = function () {
            this.foundation_.deactivate();
        };
        return MDCTabIndicator;
    }(MDCComponent));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssClasses$2 = {
        ACTIVE: 'mdc-tab--active',
    };
    var strings$2 = {
        ARIA_SELECTED: 'aria-selected',
        CONTENT_SELECTOR: '.mdc-tab__content',
        INTERACTED_EVENT: 'MDCTab:interacted',
        RIPPLE_SELECTOR: '.mdc-tab__ripple',
        TABINDEX: 'tabIndex',
        TAB_INDICATOR_SELECTOR: '.mdc-tab-indicator',
    };

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCTabFoundation = /** @class */ (function (_super) {
        __extends(MDCTabFoundation, _super);
        function MDCTabFoundation(adapter) {
            var _this = _super.call(this, __assign({}, MDCTabFoundation.defaultAdapter, adapter)) || this;
            _this.focusOnActivate_ = true;
            return _this;
        }
        Object.defineProperty(MDCTabFoundation, "cssClasses", {
            get: function () {
                return cssClasses$2;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTabFoundation, "strings", {
            get: function () {
                return strings$2;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTabFoundation, "defaultAdapter", {
            get: function () {
                // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
                return {
                    addClass: function () { return undefined; },
                    removeClass: function () { return undefined; },
                    hasClass: function () { return false; },
                    setAttr: function () { return undefined; },
                    activateIndicator: function () { return undefined; },
                    deactivateIndicator: function () { return undefined; },
                    notifyInteracted: function () { return undefined; },
                    getOffsetLeft: function () { return 0; },
                    getOffsetWidth: function () { return 0; },
                    getContentOffsetLeft: function () { return 0; },
                    getContentOffsetWidth: function () { return 0; },
                    focus: function () { return undefined; },
                };
                // tslint:enable:object-literal-sort-keys
            },
            enumerable: true,
            configurable: true
        });
        MDCTabFoundation.prototype.handleClick = function () {
            // It's up to the parent component to keep track of the active Tab and
            // ensure we don't activate a Tab that's already active.
            this.adapter_.notifyInteracted();
        };
        MDCTabFoundation.prototype.isActive = function () {
            return this.adapter_.hasClass(cssClasses$2.ACTIVE);
        };
        /**
         * Sets whether the tab should focus itself when activated
         */
        MDCTabFoundation.prototype.setFocusOnActivate = function (focusOnActivate) {
            this.focusOnActivate_ = focusOnActivate;
        };
        /**
         * Activates the Tab
         */
        MDCTabFoundation.prototype.activate = function (previousIndicatorClientRect) {
            this.adapter_.addClass(cssClasses$2.ACTIVE);
            this.adapter_.setAttr(strings$2.ARIA_SELECTED, 'true');
            this.adapter_.setAttr(strings$2.TABINDEX, '0');
            this.adapter_.activateIndicator(previousIndicatorClientRect);
            if (this.focusOnActivate_) {
                this.adapter_.focus();
            }
        };
        /**
         * Deactivates the Tab
         */
        MDCTabFoundation.prototype.deactivate = function () {
            // Early exit
            if (!this.isActive()) {
                return;
            }
            this.adapter_.removeClass(cssClasses$2.ACTIVE);
            this.adapter_.setAttr(strings$2.ARIA_SELECTED, 'false');
            this.adapter_.setAttr(strings$2.TABINDEX, '-1');
            this.adapter_.deactivateIndicator();
        };
        /**
         * Returns the dimensions of the Tab
         */
        MDCTabFoundation.prototype.computeDimensions = function () {
            var rootWidth = this.adapter_.getOffsetWidth();
            var rootLeft = this.adapter_.getOffsetLeft();
            var contentWidth = this.adapter_.getContentOffsetWidth();
            var contentLeft = this.adapter_.getContentOffsetLeft();
            return {
                contentLeft: rootLeft + contentLeft,
                contentRight: rootLeft + contentLeft + contentWidth,
                rootLeft: rootLeft,
                rootRight: rootLeft + rootWidth,
            };
        };
        return MDCTabFoundation;
    }(MDCFoundation));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCTab = /** @class */ (function (_super) {
        __extends(MDCTab, _super);
        function MDCTab() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MDCTab.attachTo = function (root) {
            return new MDCTab(root);
        };
        MDCTab.prototype.initialize = function (rippleFactory, tabIndicatorFactory) {
            if (rippleFactory === void 0) { rippleFactory = function (el, foundation) { return new MDCRipple(el, foundation); }; }
            if (tabIndicatorFactory === void 0) { tabIndicatorFactory = function (el) { return new MDCTabIndicator(el); }; }
            this.id = this.root_.id;
            var rippleSurface = this.root_.querySelector(MDCTabFoundation.strings.RIPPLE_SELECTOR);
            var rippleAdapter = __assign({}, MDCRipple.createAdapter(this), { addClass: function (className) { return rippleSurface.classList.add(className); }, removeClass: function (className) { return rippleSurface.classList.remove(className); }, updateCssVariable: function (varName, value) { return rippleSurface.style.setProperty(varName, value); } });
            var rippleFoundation = new MDCRippleFoundation(rippleAdapter);
            this.ripple_ = rippleFactory(this.root_, rippleFoundation);
            var tabIndicatorElement = this.root_.querySelector(MDCTabFoundation.strings.TAB_INDICATOR_SELECTOR);
            this.tabIndicator_ = tabIndicatorFactory(tabIndicatorElement);
            this.content_ = this.root_.querySelector(MDCTabFoundation.strings.CONTENT_SELECTOR);
        };
        MDCTab.prototype.initialSyncWithDOM = function () {
            var _this = this;
            this.handleClick_ = function () { return _this.foundation_.handleClick(); };
            this.listen('click', this.handleClick_);
        };
        MDCTab.prototype.destroy = function () {
            this.unlisten('click', this.handleClick_);
            this.ripple_.destroy();
            _super.prototype.destroy.call(this);
        };
        MDCTab.prototype.getDefaultFoundation = function () {
            var _this = this;
            // DO NOT INLINE this variable. For backward compatibility, foundations take a Partial<MDCFooAdapter>.
            // To ensure we don't accidentally omit any methods, we need a separate, strongly typed adapter variable.
            // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
            var adapter = {
                setAttr: function (attr, value) { return _this.root_.setAttribute(attr, value); },
                addClass: function (className) { return _this.root_.classList.add(className); },
                removeClass: function (className) { return _this.root_.classList.remove(className); },
                hasClass: function (className) { return _this.root_.classList.contains(className); },
                activateIndicator: function (previousIndicatorClientRect) { return _this.tabIndicator_.activate(previousIndicatorClientRect); },
                deactivateIndicator: function () { return _this.tabIndicator_.deactivate(); },
                notifyInteracted: function () { return _this.emit(MDCTabFoundation.strings.INTERACTED_EVENT, { tabId: _this.id }, true /* bubble */); },
                getOffsetLeft: function () { return _this.root_.offsetLeft; },
                getOffsetWidth: function () { return _this.root_.offsetWidth; },
                getContentOffsetLeft: function () { return _this.content_.offsetLeft; },
                getContentOffsetWidth: function () { return _this.content_.offsetWidth; },
                focus: function () { return _this.root_.focus(); },
            };
            // tslint:enable:object-literal-sort-keys
            return new MDCTabFoundation(adapter);
        };
        Object.defineProperty(MDCTab.prototype, "active", {
            /**
             * Getter for the active state of the tab
             */
            get: function () {
                return this.foundation_.isActive();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTab.prototype, "focusOnActivate", {
            set: function (focusOnActivate) {
                this.foundation_.setFocusOnActivate(focusOnActivate);
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Activates the tab
         */
        MDCTab.prototype.activate = function (computeIndicatorClientRect) {
            this.foundation_.activate(computeIndicatorClientRect);
        };
        /**
         * Deactivates the tab
         */
        MDCTab.prototype.deactivate = function () {
            this.foundation_.deactivate();
        };
        /**
         * Returns the indicator's client rect
         */
        MDCTab.prototype.computeIndicatorClientRect = function () {
            return this.tabIndicator_.computeContentClientRect();
        };
        MDCTab.prototype.computeDimensions = function () {
            return this.foundation_.computeDimensions();
        };
        /**
         * Focuses the tab
         */
        MDCTab.prototype.focus = function () {
            this.root_.focus();
        };
        return MDCTab;
    }(MDCComponent));

    function forwardEventsBuilder(component, additionalEvents = []) {
      const events = [
        'focus', 'blur',
        'fullscreenchange', 'fullscreenerror', 'scroll',
        'cut', 'copy', 'paste',
        'keydown', 'keypress', 'keyup',
        'auxclick', 'click', 'contextmenu', 'dblclick', 'mousedown', 'mouseenter', 'mouseleave', 'mousemove', 'mouseover', 'mouseout', 'mouseup', 'pointerlockchange', 'pointerlockerror', 'select', 'wheel',
        'drag', 'dragend', 'dragenter', 'dragstart', 'dragleave', 'dragover', 'drop',
        'touchcancel', 'touchend', 'touchmove', 'touchstart',
        'pointerover', 'pointerenter', 'pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'pointerout', 'pointerleave', 'gotpointercapture', 'lostpointercapture',
        ...additionalEvents
      ];

      function forward(e) {
        bubble(component, e);
      }

      return node => {
        const destructors = [];

        for (let i = 0; i < events.length; i++) {
          destructors.push(listen(node, events[i], forward));
        }

        return {
          destroy: () => {
            for (let i = 0; i < destructors.length; i++) {
              destructors[i]();
            }
          }
        }
      };
    }

    function exclude(obj, keys) {
      let names = Object.getOwnPropertyNames(obj);
      const newObj = {};

      for (let i = 0; i < names.length; i++) {
        const name = names[i];
        const cashIndex = name.indexOf('$');
        if (cashIndex !== -1 && keys.indexOf(name.substring(0, cashIndex + 1)) !== -1) {
          continue;
        }
        if (keys.indexOf(name) !== -1) {
          continue;
        }
        newObj[name] = obj[name];
      }

      return newObj;
    }

    function prefixFilter(obj, prefix) {
      let names = Object.getOwnPropertyNames(obj);
      const newObj = {};

      for (let i = 0; i < names.length; i++) {
        const name = names[i];
        if (name.substring(0, prefix.length) === prefix) {
          newObj[name.substring(prefix.length)] = obj[name];
        }
      }

      return newObj;
    }

    function useActions(node, actions) {
      let objects = [];

      if (actions) {
        for (let i = 0; i < actions.length; i++) {
          const isArray = Array.isArray(actions[i]);
          const action = isArray ? actions[i][0] : actions[i];
          if (isArray && actions[i].length > 1) {
            objects.push(action(node, actions[i][1]));
          } else {
            objects.push(action(node));
          }
        }
      }

      return {
        update(actions) {
          if ((actions && actions.length || 0) != objects.length) {
            throw new Error('You must not change the length of an actions array.');
          }

          if (actions) {
            for (let i = 0; i < actions.length; i++) {
              if (objects[i] && 'update' in objects[i]) {
                const isArray = Array.isArray(actions[i]);
                if (isArray && actions[i].length > 1) {
                  objects[i].update(actions[i][1]);
                } else {
                  objects[i].update();
                }
              }
            }
          }
        },

        destroy() {
          for (let i = 0; i < objects.length; i++) {
            if (objects[i] && 'destroy' in objects[i]) {
              objects[i].destroy();
            }
          }
        }
      }
    }

    /* node_modules/@smui/tab-indicator/TabIndicator.svelte generated by Svelte v3.31.0 */
    const file = "node_modules/@smui/tab-indicator/TabIndicator.svelte";

    function create_fragment(ctx) {
    	let span1;
    	let span0;
    	let span0_class_value;
    	let span0_aria_hidden_value;
    	let useActions_action;
    	let span1_class_value;
    	let useActions_action_1;
    	let forwardEvents_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[14].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[13], null);

    	let span0_levels = [
    		{
    			class: span0_class_value = "\n      mdc-tab-indicator__content\n      " + /*content$class*/ ctx[6] + "\n      " + (/*type*/ ctx[3] === "underline"
    			? "mdc-tab-indicator__content--underline"
    			: "") + "\n      " + (/*type*/ ctx[3] === "icon"
    			? "mdc-tab-indicator__content--icon"
    			: "") + "\n    "
    		},
    		{
    			"aria-hidden": span0_aria_hidden_value = /*type*/ ctx[3] === "icon" ? "true" : "false"
    		},
    		exclude(prefixFilter(/*$$props*/ ctx[9], "content$"), ["use", "class"])
    	];

    	let span0_data = {};

    	for (let i = 0; i < span0_levels.length; i += 1) {
    		span0_data = assign(span0_data, span0_levels[i]);
    	}

    	let span1_levels = [
    		{
    			class: span1_class_value = "\n    mdc-tab-indicator\n    " + /*className*/ ctx[1] + "\n    " + (/*active*/ ctx[2] ? "mdc-tab-indicator--active" : "") + "\n    " + (/*transition*/ ctx[4] === "fade"
    			? "mdc-tab-indicator--fade"
    			: "") + "\n  "
    		},
    		exclude(/*$$props*/ ctx[9], ["use", "class", "active", "type", "transition", "content$"])
    	];

    	let span1_data = {};

    	for (let i = 0; i < span1_levels.length; i += 1) {
    		span1_data = assign(span1_data, span1_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			span1 = element("span");
    			span0 = element("span");
    			if (default_slot) default_slot.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			span1 = claim_element(nodes, "SPAN", { class: true });
    			var span1_nodes = children(span1);
    			span0 = claim_element(span1_nodes, "SPAN", { class: true, "aria-hidden": true });
    			var span0_nodes = children(span0);
    			if (default_slot) default_slot.l(span0_nodes);
    			span0_nodes.forEach(detach_dev);
    			span1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			set_attributes(span0, span0_data);
    			add_location(span0, file, 12, 2, 322);
    			set_attributes(span1, span1_data);
    			add_location(span1, file, 0, 0, 0);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span1, anchor);
    			append_dev(span1, span0);

    			if (default_slot) {
    				default_slot.m(span0, null);
    			}

    			/*span1_binding*/ ctx[15](span1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, span0, /*content$use*/ ctx[5])),
    					action_destroyer(useActions_action_1 = useActions.call(null, span1, /*use*/ ctx[0])),
    					action_destroyer(forwardEvents_action = /*forwardEvents*/ ctx[8].call(null, span1))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8192) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[13], dirty, null, null);
    				}
    			}

    			set_attributes(span0, span0_data = get_spread_update(span0_levels, [
    				(!current || dirty & /*content$class, type*/ 72 && span0_class_value !== (span0_class_value = "\n      mdc-tab-indicator__content\n      " + /*content$class*/ ctx[6] + "\n      " + (/*type*/ ctx[3] === "underline"
    				? "mdc-tab-indicator__content--underline"
    				: "") + "\n      " + (/*type*/ ctx[3] === "icon"
    				? "mdc-tab-indicator__content--icon"
    				: "") + "\n    ")) && { class: span0_class_value },
    				(!current || dirty & /*type*/ 8 && span0_aria_hidden_value !== (span0_aria_hidden_value = /*type*/ ctx[3] === "icon" ? "true" : "false")) && { "aria-hidden": span0_aria_hidden_value },
    				dirty & /*$$props*/ 512 && exclude(prefixFilter(/*$$props*/ ctx[9], "content$"), ["use", "class"])
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*content$use*/ 32) useActions_action.update.call(null, /*content$use*/ ctx[5]);

    			set_attributes(span1, span1_data = get_spread_update(span1_levels, [
    				(!current || dirty & /*className, active, transition*/ 22 && span1_class_value !== (span1_class_value = "\n    mdc-tab-indicator\n    " + /*className*/ ctx[1] + "\n    " + (/*active*/ ctx[2] ? "mdc-tab-indicator--active" : "") + "\n    " + (/*transition*/ ctx[4] === "fade"
    				? "mdc-tab-indicator--fade"
    				: "") + "\n  ")) && { class: span1_class_value },
    				dirty & /*$$props*/ 512 && exclude(/*$$props*/ ctx[9], ["use", "class", "active", "type", "transition", "content$"])
    			]));

    			if (useActions_action_1 && is_function(useActions_action_1.update) && dirty & /*use*/ 1) useActions_action_1.update.call(null, /*use*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span1);
    			if (default_slot) default_slot.d(detaching);
    			/*span1_binding*/ ctx[15](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TabIndicator", slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;
    	let { class: className = "" } = $$props;
    	let { active = false } = $$props;
    	let { type = "underline" } = $$props;
    	let { transition = "slide" } = $$props;
    	let { content$use = [] } = $$props;
    	let { content$class = "" } = $$props;
    	let element;
    	let tabIndicator;
    	let instantiate = getContext("SMUI:tab-indicator:instantiate");
    	let getInstance = getContext("SMUI:tab-indicator:getInstance");

    	onMount(async () => {
    		if (instantiate !== false) {
    			tabIndicator = new MDCTabIndicator(element);
    		} else {
    			tabIndicator = await getInstance();
    		}
    	});

    	onDestroy(() => {
    		tabIndicator && tabIndicator.destroy();
    	});

    	function activate(...args) {
    		return tabIndicator.activate(...args);
    	}

    	function deactivate(...args) {
    		return tabIndicator.deactivate(...args);
    	}

    	function computeContentClientRect(...args) {
    		return tabIndicator.computeContentClientRect(...args);
    	}

    	function span1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(7, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(9, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("use" in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ("class" in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ("active" in $$new_props) $$invalidate(2, active = $$new_props.active);
    		if ("type" in $$new_props) $$invalidate(3, type = $$new_props.type);
    		if ("transition" in $$new_props) $$invalidate(4, transition = $$new_props.transition);
    		if ("content$use" in $$new_props) $$invalidate(5, content$use = $$new_props.content$use);
    		if ("content$class" in $$new_props) $$invalidate(6, content$class = $$new_props.content$class);
    		if ("$$scope" in $$new_props) $$invalidate(13, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		MDCTabIndicator,
    		onMount,
    		onDestroy,
    		getContext,
    		get_current_component,
    		forwardEventsBuilder,
    		exclude,
    		prefixFilter,
    		useActions,
    		forwardEvents,
    		use,
    		className,
    		active,
    		type,
    		transition,
    		content$use,
    		content$class,
    		element,
    		tabIndicator,
    		instantiate,
    		getInstance,
    		activate,
    		deactivate,
    		computeContentClientRect
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(9, $$props = assign(assign({}, $$props), $$new_props));
    		if ("use" in $$props) $$invalidate(0, use = $$new_props.use);
    		if ("className" in $$props) $$invalidate(1, className = $$new_props.className);
    		if ("active" in $$props) $$invalidate(2, active = $$new_props.active);
    		if ("type" in $$props) $$invalidate(3, type = $$new_props.type);
    		if ("transition" in $$props) $$invalidate(4, transition = $$new_props.transition);
    		if ("content$use" in $$props) $$invalidate(5, content$use = $$new_props.content$use);
    		if ("content$class" in $$props) $$invalidate(6, content$class = $$new_props.content$class);
    		if ("element" in $$props) $$invalidate(7, element = $$new_props.element);
    		if ("tabIndicator" in $$props) tabIndicator = $$new_props.tabIndicator;
    		if ("instantiate" in $$props) instantiate = $$new_props.instantiate;
    		if ("getInstance" in $$props) getInstance = $$new_props.getInstance;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);

    	return [
    		use,
    		className,
    		active,
    		type,
    		transition,
    		content$use,
    		content$class,
    		element,
    		forwardEvents,
    		$$props,
    		activate,
    		deactivate,
    		computeContentClientRect,
    		$$scope,
    		slots,
    		span1_binding
    	];
    }

    class TabIndicator extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			use: 0,
    			class: 1,
    			active: 2,
    			type: 3,
    			transition: 4,
    			content$use: 5,
    			content$class: 6,
    			activate: 10,
    			deactivate: 11,
    			computeContentClientRect: 12
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TabIndicator",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get use() {
    		throw new Error("<TabIndicator>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<TabIndicator>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<TabIndicator>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<TabIndicator>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<TabIndicator>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<TabIndicator>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<TabIndicator>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<TabIndicator>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transition() {
    		throw new Error("<TabIndicator>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transition(value) {
    		throw new Error("<TabIndicator>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get content$use() {
    		throw new Error("<TabIndicator>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set content$use(value) {
    		throw new Error("<TabIndicator>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get content$class() {
    		throw new Error("<TabIndicator>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set content$class(value) {
    		throw new Error("<TabIndicator>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activate() {
    		return this.$$.ctx[10];
    	}

    	set activate(value) {
    		throw new Error("<TabIndicator>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get deactivate() {
    		return this.$$.ctx[11];
    	}

    	set deactivate(value) {
    		throw new Error("<TabIndicator>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get computeContentClientRect() {
    		return this.$$.ctx[12];
    	}

    	set computeContentClientRect(value) {
    		throw new Error("<TabIndicator>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@smui/tab/Tab.svelte generated by Svelte v3.31.0 */

    const { Error: Error_1 } = globals;
    const file$1 = "node_modules/@smui/tab/Tab.svelte";
    const get_tab_indicator_slot_changes_1 = dirty => ({});
    const get_tab_indicator_slot_context_1 = ctx => ({});
    const get_tab_indicator_slot_changes = dirty => ({});
    const get_tab_indicator_slot_context = ctx => ({});

    // (24:4) {#if indicatorSpanOnlyContent}
    function create_if_block_2(ctx) {
    	let tabindicator;
    	let current;

    	const tabindicator_spread_levels = [
    		{ active: /*active*/ ctx[0] },
    		prefixFilter(/*$$props*/ ctx[12], "tabIndicator$")
    	];

    	let tabindicator_props = {
    		$$slots: { default: [create_default_slot_1] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < tabindicator_spread_levels.length; i += 1) {
    		tabindicator_props = assign(tabindicator_props, tabindicator_spread_levels[i]);
    	}

    	tabindicator = new TabIndicator({
    			props: tabindicator_props,
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tabindicator.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(tabindicator.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tabindicator, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tabindicator_changes = (dirty & /*active, prefixFilter, $$props*/ 4097)
    			? get_spread_update(tabindicator_spread_levels, [
    					dirty & /*active*/ 1 && { active: /*active*/ ctx[0] },
    					dirty & /*prefixFilter, $$props*/ 4096 && get_spread_object(prefixFilter(/*$$props*/ ctx[12], "tabIndicator$"))
    				])
    			: {};

    			if (dirty & /*$$scope*/ 8388608) {
    				tabindicator_changes.$$scope = { dirty, ctx };
    			}

    			tabindicator.$set(tabindicator_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabindicator.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabindicator.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tabindicator, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(24:4) {#if indicatorSpanOnlyContent}",
    		ctx
    	});

    	return block;
    }

    // (25:6) <TabIndicator         {active}         {...prefixFilter($$props, 'tabIndicator$')}       >
    function create_default_slot_1(ctx) {
    	let current;
    	const tab_indicator_slot_template = /*#slots*/ ctx[21]["tab-indicator"];
    	const tab_indicator_slot = create_slot(tab_indicator_slot_template, ctx, /*$$scope*/ ctx[23], get_tab_indicator_slot_context);

    	const block = {
    		c: function create() {
    			if (tab_indicator_slot) tab_indicator_slot.c();
    		},
    		l: function claim(nodes) {
    			if (tab_indicator_slot) tab_indicator_slot.l(nodes);
    		},
    		m: function mount(target, anchor) {
    			if (tab_indicator_slot) {
    				tab_indicator_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (tab_indicator_slot) {
    				if (tab_indicator_slot.p && dirty & /*$$scope*/ 8388608) {
    					update_slot(tab_indicator_slot, tab_indicator_slot_template, ctx, /*$$scope*/ ctx[23], dirty, get_tab_indicator_slot_changes, get_tab_indicator_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tab_indicator_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tab_indicator_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (tab_indicator_slot) tab_indicator_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(25:6) <TabIndicator         {active}         {...prefixFilter($$props, 'tabIndicator$')}       >",
    		ctx
    	});

    	return block;
    }

    // (31:2) {#if !indicatorSpanOnlyContent}
    function create_if_block_1(ctx) {
    	let tabindicator;
    	let current;

    	const tabindicator_spread_levels = [
    		{ active: /*active*/ ctx[0] },
    		prefixFilter(/*$$props*/ ctx[12], "tabIndicator$")
    	];

    	let tabindicator_props = {
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < tabindicator_spread_levels.length; i += 1) {
    		tabindicator_props = assign(tabindicator_props, tabindicator_spread_levels[i]);
    	}

    	tabindicator = new TabIndicator({
    			props: tabindicator_props,
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tabindicator.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(tabindicator.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tabindicator, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tabindicator_changes = (dirty & /*active, prefixFilter, $$props*/ 4097)
    			? get_spread_update(tabindicator_spread_levels, [
    					dirty & /*active*/ 1 && { active: /*active*/ ctx[0] },
    					dirty & /*prefixFilter, $$props*/ 4096 && get_spread_object(prefixFilter(/*$$props*/ ctx[12], "tabIndicator$"))
    				])
    			: {};

    			if (dirty & /*$$scope*/ 8388608) {
    				tabindicator_changes.$$scope = { dirty, ctx };
    			}

    			tabindicator.$set(tabindicator_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabindicator.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabindicator.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tabindicator, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(31:2) {#if !indicatorSpanOnlyContent}",
    		ctx
    	});

    	return block;
    }

    // (32:4) <TabIndicator       {active}       {...prefixFilter($$props, 'tabIndicator$')}     >
    function create_default_slot(ctx) {
    	let current;
    	const tab_indicator_slot_template = /*#slots*/ ctx[21]["tab-indicator"];
    	const tab_indicator_slot = create_slot(tab_indicator_slot_template, ctx, /*$$scope*/ ctx[23], get_tab_indicator_slot_context_1);

    	const block = {
    		c: function create() {
    			if (tab_indicator_slot) tab_indicator_slot.c();
    		},
    		l: function claim(nodes) {
    			if (tab_indicator_slot) tab_indicator_slot.l(nodes);
    		},
    		m: function mount(target, anchor) {
    			if (tab_indicator_slot) {
    				tab_indicator_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (tab_indicator_slot) {
    				if (tab_indicator_slot.p && dirty & /*$$scope*/ 8388608) {
    					update_slot(tab_indicator_slot, tab_indicator_slot_template, ctx, /*$$scope*/ ctx[23], dirty, get_tab_indicator_slot_changes_1, get_tab_indicator_slot_context_1);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tab_indicator_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tab_indicator_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (tab_indicator_slot) tab_indicator_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(32:4) <TabIndicator       {active}       {...prefixFilter($$props, 'tabIndicator$')}     >",
    		ctx
    	});

    	return block;
    }

    // (37:2) {#if ripple}
    function create_if_block(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			this.h();
    		},
    		l: function claim(nodes) {
    			span = claim_element(nodes, "SPAN", { class: true });
    			children(span).forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(span, "class", "mdc-tab__ripple");
    			add_location(span, file$1, 37, 4, 1093);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(37:2) {#if ripple}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let button;
    	let span;
    	let t0;
    	let span_class_value;
    	let useActions_action;
    	let t1;
    	let t2;
    	let button_class_value;
    	let button_tabindex_value;
    	let useActions_action_1;
    	let forwardEvents_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[21].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[23], null);
    	let if_block0 = /*indicatorSpanOnlyContent*/ ctx[6] && create_if_block_2(ctx);

    	let span_levels = [
    		{
    			class: span_class_value = "mdc-tab__content " + /*content$class*/ ctx[8]
    		},
    		exclude(prefixFilter(/*$$props*/ ctx[12], "content$"), ["use", "class"])
    	];

    	let span_data = {};

    	for (let i = 0; i < span_levels.length; i += 1) {
    		span_data = assign(span_data, span_levels[i]);
    	}

    	let if_block1 = !/*indicatorSpanOnlyContent*/ ctx[6] && create_if_block_1(ctx);
    	let if_block2 = /*ripple*/ ctx[3] && create_if_block(ctx);

    	let button_levels = [
    		{
    			class: button_class_value = "\n    mdc-tab\n    " + /*className*/ ctx[2] + "\n    " + (/*active*/ ctx[0] ? "mdc-tab--active" : "") + "\n    " + (/*stacked*/ ctx[4] ? "mdc-tab--stacked" : "") + "\n    " + (/*minWidth*/ ctx[5] ? "mdc-tab--min-width" : "") + "\n  "
    		},
    		{ role: "tab" },
    		{ "aria-selected": /*active*/ ctx[0] },
    		{
    			tabindex: button_tabindex_value = /*active*/ ctx[0] ? "0" : "-1"
    		},
    		exclude(/*$$props*/ ctx[12], [
    			"use",
    			"class",
    			"ripple",
    			"active",
    			"stacked",
    			"minWidth",
    			"indicatorSpanOnlyContent",
    			"focusOnActivate",
    			"content$",
    			"tabIndicator$"
    		])
    	];

    	let button_data = {};

    	for (let i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			span = element("span");
    			if (default_slot) default_slot.c();
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			if (if_block2) if_block2.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			button = claim_element(nodes, "BUTTON", {
    				class: true,
    				role: true,
    				"aria-selected": true,
    				tabindex: true
    			});

    			var button_nodes = children(button);
    			span = claim_element(button_nodes, "SPAN", { class: true });
    			var span_nodes = children(span);
    			if (default_slot) default_slot.l(span_nodes);
    			t0 = claim_space(span_nodes);
    			if (if_block0) if_block0.l(span_nodes);
    			span_nodes.forEach(detach_dev);
    			t1 = claim_space(button_nodes);
    			if (if_block1) if_block1.l(button_nodes);
    			t2 = claim_space(button_nodes);
    			if (if_block2) if_block2.l(button_nodes);
    			button_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			set_attributes(span, span_data);
    			add_location(span, file$1, 17, 2, 517);
    			set_attributes(button, button_data);
    			add_location(button, file$1, 0, 0, 0);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, span);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			append_dev(span, t0);
    			if (if_block0) if_block0.m(span, null);
    			append_dev(button, t1);
    			if (if_block1) if_block1.m(button, null);
    			append_dev(button, t2);
    			if (if_block2) if_block2.m(button, null);
    			/*button_binding*/ ctx[22](button);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, span, /*content$use*/ ctx[7])),
    					action_destroyer(useActions_action_1 = useActions.call(null, button, /*use*/ ctx[1])),
    					action_destroyer(forwardEvents_action = /*forwardEvents*/ ctx[10].call(null, button)),
    					listen_dev(button, "MDCTab:interacted", /*interactedHandler*/ ctx[11], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8388608) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[23], dirty, null, null);
    				}
    			}

    			if (/*indicatorSpanOnlyContent*/ ctx[6]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*indicatorSpanOnlyContent*/ 64) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(span, null);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			set_attributes(span, span_data = get_spread_update(span_levels, [
    				(!current || dirty & /*content$class*/ 256 && span_class_value !== (span_class_value = "mdc-tab__content " + /*content$class*/ ctx[8])) && { class: span_class_value },
    				dirty & /*$$props*/ 4096 && exclude(prefixFilter(/*$$props*/ ctx[12], "content$"), ["use", "class"])
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*content$use*/ 128) useActions_action.update.call(null, /*content$use*/ ctx[7]);

    			if (!/*indicatorSpanOnlyContent*/ ctx[6]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*indicatorSpanOnlyContent*/ 64) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(button, t2);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*ripple*/ ctx[3]) {
    				if (if_block2) ; else {
    					if_block2 = create_if_block(ctx);
    					if_block2.c();
    					if_block2.m(button, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			set_attributes(button, button_data = get_spread_update(button_levels, [
    				(!current || dirty & /*className, active, stacked, minWidth*/ 53 && button_class_value !== (button_class_value = "\n    mdc-tab\n    " + /*className*/ ctx[2] + "\n    " + (/*active*/ ctx[0] ? "mdc-tab--active" : "") + "\n    " + (/*stacked*/ ctx[4] ? "mdc-tab--stacked" : "") + "\n    " + (/*minWidth*/ ctx[5] ? "mdc-tab--min-width" : "") + "\n  ")) && { class: button_class_value },
    				{ role: "tab" },
    				(!current || dirty & /*active*/ 1) && { "aria-selected": /*active*/ ctx[0] },
    				(!current || dirty & /*active*/ 1 && button_tabindex_value !== (button_tabindex_value = /*active*/ ctx[0] ? "0" : "-1")) && { tabindex: button_tabindex_value },
    				dirty & /*$$props*/ 4096 && exclude(/*$$props*/ ctx[12], [
    					"use",
    					"class",
    					"ripple",
    					"active",
    					"stacked",
    					"minWidth",
    					"indicatorSpanOnlyContent",
    					"focusOnActivate",
    					"content$",
    					"tabIndicator$"
    				])
    			]));

    			if (useActions_action_1 && is_function(useActions_action_1.update) && dirty & /*use*/ 2) useActions_action_1.update.call(null, /*use*/ ctx[1]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			/*button_binding*/ ctx[22](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Tab", slots, ['default','tab-indicator']);
    	const forwardEvents = forwardEventsBuilder(get_current_component(), ["MDCTab:interacted"]);
    	let activeEntry = getContext("SMUI:tab:active");
    	let { use = [] } = $$props;
    	let { class: className = "" } = $$props;
    	let { tab: tabEntry } = $$props;
    	let { ripple = true } = $$props;
    	let { active = tabEntry === activeEntry } = $$props;
    	let { stacked = false } = $$props;
    	let { minWidth = false } = $$props;
    	let { indicatorSpanOnlyContent = false } = $$props;
    	let { focusOnActivate = true } = $$props;
    	let { content$use = [] } = $$props;
    	let { content$class = "" } = $$props;
    	let element;
    	let tab;
    	let instantiate = getContext("SMUI:tab:instantiate");
    	let getInstance = getContext("SMUI:tab:getInstance");
    	let tabIndicatorPromiseResolve;
    	let tabIndicatorPromise = new Promise(resolve => tabIndicatorPromiseResolve = resolve);
    	setContext("SMUI:tab-indicator:instantiate", false);
    	setContext("SMUI:tab-indicator:getInstance", getTabIndicatorInstancePromise);
    	setContext("SMUI:label:context", "tab");
    	setContext("SMUI:icon:context", "tab");

    	if (!tabEntry) {
    		throw new Error("The tab property is required! It should be passed down from the TabBar to the Tab.");
    	}

    	onMount(async () => {
    		if (instantiate !== false) {
    			$$invalidate(20, tab = new MDCTab(element));
    		} else {
    			$$invalidate(20, tab = await getInstance(tabEntry));
    		}

    		tabIndicatorPromiseResolve(tab.tabIndicator_);

    		if (!ripple) {
    			tab.ripple_ && tab.ripple_.destroy();
    		}
    	});

    	onDestroy(() => {
    		tab && tab.destroy();
    	});

    	function getTabIndicatorInstancePromise() {
    		return tabIndicatorPromise;
    	}

    	function interactedHandler() {
    		$$invalidate(0, active = tab.active);
    	}

    	function activate(...args) {
    		$$invalidate(0, active = true);
    		return tab.activate(...args);
    	}

    	function deactivate(...args) {
    		$$invalidate(0, active = false);
    		return tab.deactivate(...args);
    	}

    	function focus(...args) {
    		return tab.focus(...args);
    	}

    	function computeIndicatorClientRect(...args) {
    		return tab.computeIndicatorClientRect(...args);
    	}

    	function computeDimensions(...args) {
    		return tab.computeDimensions(...args);
    	}

    	function button_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(9, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(12, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("use" in $$new_props) $$invalidate(1, use = $$new_props.use);
    		if ("class" in $$new_props) $$invalidate(2, className = $$new_props.class);
    		if ("tab" in $$new_props) $$invalidate(13, tabEntry = $$new_props.tab);
    		if ("ripple" in $$new_props) $$invalidate(3, ripple = $$new_props.ripple);
    		if ("active" in $$new_props) $$invalidate(0, active = $$new_props.active);
    		if ("stacked" in $$new_props) $$invalidate(4, stacked = $$new_props.stacked);
    		if ("minWidth" in $$new_props) $$invalidate(5, minWidth = $$new_props.minWidth);
    		if ("indicatorSpanOnlyContent" in $$new_props) $$invalidate(6, indicatorSpanOnlyContent = $$new_props.indicatorSpanOnlyContent);
    		if ("focusOnActivate" in $$new_props) $$invalidate(14, focusOnActivate = $$new_props.focusOnActivate);
    		if ("content$use" in $$new_props) $$invalidate(7, content$use = $$new_props.content$use);
    		if ("content$class" in $$new_props) $$invalidate(8, content$class = $$new_props.content$class);
    		if ("$$scope" in $$new_props) $$invalidate(23, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		MDCTab,
    		onMount,
    		onDestroy,
    		setContext,
    		getContext,
    		get_current_component,
    		forwardEventsBuilder,
    		exclude,
    		prefixFilter,
    		useActions,
    		TabIndicator,
    		forwardEvents,
    		activeEntry,
    		use,
    		className,
    		tabEntry,
    		ripple,
    		active,
    		stacked,
    		minWidth,
    		indicatorSpanOnlyContent,
    		focusOnActivate,
    		content$use,
    		content$class,
    		element,
    		tab,
    		instantiate,
    		getInstance,
    		tabIndicatorPromiseResolve,
    		tabIndicatorPromise,
    		getTabIndicatorInstancePromise,
    		interactedHandler,
    		activate,
    		deactivate,
    		focus,
    		computeIndicatorClientRect,
    		computeDimensions
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(12, $$props = assign(assign({}, $$props), $$new_props));
    		if ("activeEntry" in $$props) activeEntry = $$new_props.activeEntry;
    		if ("use" in $$props) $$invalidate(1, use = $$new_props.use);
    		if ("className" in $$props) $$invalidate(2, className = $$new_props.className);
    		if ("tabEntry" in $$props) $$invalidate(13, tabEntry = $$new_props.tabEntry);
    		if ("ripple" in $$props) $$invalidate(3, ripple = $$new_props.ripple);
    		if ("active" in $$props) $$invalidate(0, active = $$new_props.active);
    		if ("stacked" in $$props) $$invalidate(4, stacked = $$new_props.stacked);
    		if ("minWidth" in $$props) $$invalidate(5, minWidth = $$new_props.minWidth);
    		if ("indicatorSpanOnlyContent" in $$props) $$invalidate(6, indicatorSpanOnlyContent = $$new_props.indicatorSpanOnlyContent);
    		if ("focusOnActivate" in $$props) $$invalidate(14, focusOnActivate = $$new_props.focusOnActivate);
    		if ("content$use" in $$props) $$invalidate(7, content$use = $$new_props.content$use);
    		if ("content$class" in $$props) $$invalidate(8, content$class = $$new_props.content$class);
    		if ("element" in $$props) $$invalidate(9, element = $$new_props.element);
    		if ("tab" in $$props) $$invalidate(20, tab = $$new_props.tab);
    		if ("instantiate" in $$props) instantiate = $$new_props.instantiate;
    		if ("getInstance" in $$props) getInstance = $$new_props.getInstance;
    		if ("tabIndicatorPromiseResolve" in $$props) tabIndicatorPromiseResolve = $$new_props.tabIndicatorPromiseResolve;
    		if ("tabIndicatorPromise" in $$props) tabIndicatorPromise = $$new_props.tabIndicatorPromise;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*tab, focusOnActivate*/ 1064960) {
    			 if (tab) {
    				$$invalidate(20, tab.focusOnActivate = focusOnActivate, tab);
    			}
    		}

    		if ($$self.$$.dirty & /*tab, active*/ 1048577) {
    			 if (tab && tab.active !== active) {
    				$$invalidate(0, active = tab.active);
    			}
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		active,
    		use,
    		className,
    		ripple,
    		stacked,
    		minWidth,
    		indicatorSpanOnlyContent,
    		content$use,
    		content$class,
    		element,
    		forwardEvents,
    		interactedHandler,
    		$$props,
    		tabEntry,
    		focusOnActivate,
    		activate,
    		deactivate,
    		focus,
    		computeIndicatorClientRect,
    		computeDimensions,
    		tab,
    		slots,
    		button_binding,
    		$$scope
    	];
    }

    class Tab extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			use: 1,
    			class: 2,
    			tab: 13,
    			ripple: 3,
    			active: 0,
    			stacked: 4,
    			minWidth: 5,
    			indicatorSpanOnlyContent: 6,
    			focusOnActivate: 14,
    			content$use: 7,
    			content$class: 8,
    			activate: 15,
    			deactivate: 16,
    			focus: 17,
    			computeIndicatorClientRect: 18,
    			computeDimensions: 19
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tab",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*tabEntry*/ ctx[13] === undefined && !("tab" in props)) {
    			console.warn("<Tab> was created without expected prop 'tab'");
    		}
    	}

    	get use() {
    		throw new Error_1("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error_1("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error_1("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error_1("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tab() {
    		throw new Error_1("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tab(value) {
    		throw new Error_1("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ripple() {
    		throw new Error_1("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ripple(value) {
    		throw new Error_1("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error_1("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error_1("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get stacked() {
    		throw new Error_1("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set stacked(value) {
    		throw new Error_1("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get minWidth() {
    		throw new Error_1("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set minWidth(value) {
    		throw new Error_1("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get indicatorSpanOnlyContent() {
    		throw new Error_1("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set indicatorSpanOnlyContent(value) {
    		throw new Error_1("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focusOnActivate() {
    		throw new Error_1("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focusOnActivate(value) {
    		throw new Error_1("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get content$use() {
    		throw new Error_1("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set content$use(value) {
    		throw new Error_1("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get content$class() {
    		throw new Error_1("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set content$class(value) {
    		throw new Error_1("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activate() {
    		return this.$$.ctx[15];
    	}

    	set activate(value) {
    		throw new Error_1("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get deactivate() {
    		return this.$$.ctx[16];
    	}

    	set deactivate(value) {
    		throw new Error_1("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focus() {
    		return this.$$.ctx[17];
    	}

    	set focus(value) {
    		throw new Error_1("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get computeIndicatorClientRect() {
    		return this.$$.ctx[18];
    	}

    	set computeIndicatorClientRect(value) {
    		throw new Error_1("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get computeDimensions() {
    		return this.$$.ctx[19];
    	}

    	set computeDimensions(value) {
    		throw new Error_1("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@smui/common/Label.svelte generated by Svelte v3.31.0 */
    const file$2 = "node_modules/@smui/common/Label.svelte";

    function create_fragment$2(ctx) {
    	let span;
    	let span_class_value;
    	let useActions_action;
    	let forwardEvents_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	let span_levels = [
    		{
    			class: span_class_value = "\n    " + /*className*/ ctx[1] + "\n    " + (/*context*/ ctx[3] === "button"
    			? "mdc-button__label"
    			: "") + "\n    " + (/*context*/ ctx[3] === "fab" ? "mdc-fab__label" : "") + "\n    " + (/*context*/ ctx[3] === "chip" ? "mdc-chip__text" : "") + "\n    " + (/*context*/ ctx[3] === "tab"
    			? "mdc-tab__text-label"
    			: "") + "\n    " + (/*context*/ ctx[3] === "image-list"
    			? "mdc-image-list__label"
    			: "") + "\n    " + (/*context*/ ctx[3] === "snackbar"
    			? "mdc-snackbar__label"
    			: "") + "\n  "
    		},
    		/*context*/ ctx[3] === "snackbar"
    		? { role: "status", "aria-live": "polite" }
    		: {},
    		exclude(/*$$props*/ ctx[4], ["use", "class"])
    	];

    	let span_data = {};

    	for (let i = 0; i < span_levels.length; i += 1) {
    		span_data = assign(span_data, span_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			if (default_slot) default_slot.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			span = claim_element(nodes, "SPAN", { class: true });
    			var span_nodes = children(span);
    			if (default_slot) default_slot.l(span_nodes);
    			span_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			set_attributes(span, span_data);
    			add_location(span, file$2, 0, 0, 0);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, span, /*use*/ ctx[0])),
    					action_destroyer(forwardEvents_action = /*forwardEvents*/ ctx[2].call(null, span))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 32) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[5], dirty, null, null);
    				}
    			}

    			set_attributes(span, span_data = get_spread_update(span_levels, [
    				(!current || dirty & /*className*/ 2 && span_class_value !== (span_class_value = "\n    " + /*className*/ ctx[1] + "\n    " + (/*context*/ ctx[3] === "button"
    				? "mdc-button__label"
    				: "") + "\n    " + (/*context*/ ctx[3] === "fab" ? "mdc-fab__label" : "") + "\n    " + (/*context*/ ctx[3] === "chip" ? "mdc-chip__text" : "") + "\n    " + (/*context*/ ctx[3] === "tab"
    				? "mdc-tab__text-label"
    				: "") + "\n    " + (/*context*/ ctx[3] === "image-list"
    				? "mdc-image-list__label"
    				: "") + "\n    " + (/*context*/ ctx[3] === "snackbar"
    				? "mdc-snackbar__label"
    				: "") + "\n  ")) && { class: span_class_value },
    				/*context*/ ctx[3] === "snackbar"
    				? { role: "status", "aria-live": "polite" }
    				: {},
    				dirty & /*$$props*/ 16 && exclude(/*$$props*/ ctx[4], ["use", "class"])
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Label", slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;
    	let { class: className = "" } = $$props;
    	const context = getContext("SMUI:label:context");

    	$$self.$$set = $$new_props => {
    		$$invalidate(4, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("use" in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ("class" in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ("$$scope" in $$new_props) $$invalidate(5, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		get_current_component,
    		forwardEventsBuilder,
    		exclude,
    		useActions,
    		forwardEvents,
    		use,
    		className,
    		context
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(4, $$props = assign(assign({}, $$props), $$new_props));
    		if ("use" in $$props) $$invalidate(0, use = $$new_props.use);
    		if ("className" in $$props) $$invalidate(1, className = $$new_props.className);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [use, className, forwardEvents, context, $$props, $$scope, slots];
    }

    class Label extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { use: 0, class: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Label",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get use() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssClasses$3 = {
        ANIMATING: 'mdc-tab-scroller--animating',
        SCROLL_AREA_SCROLL: 'mdc-tab-scroller__scroll-area--scroll',
        SCROLL_TEST: 'mdc-tab-scroller__test',
    };
    var strings$3 = {
        AREA_SELECTOR: '.mdc-tab-scroller__scroll-area',
        CONTENT_SELECTOR: '.mdc-tab-scroller__scroll-content',
    };

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCTabScrollerRTL = /** @class */ (function () {
        function MDCTabScrollerRTL(adapter) {
            this.adapter_ = adapter;
        }
        return MDCTabScrollerRTL;
    }());

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCTabScrollerRTLDefault = /** @class */ (function (_super) {
        __extends(MDCTabScrollerRTLDefault, _super);
        function MDCTabScrollerRTLDefault() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MDCTabScrollerRTLDefault.prototype.getScrollPositionRTL = function () {
            var currentScrollLeft = this.adapter_.getScrollAreaScrollLeft();
            var right = this.calculateScrollEdges_().right;
            // Scroll values on most browsers are ints instead of floats so we round
            return Math.round(right - currentScrollLeft);
        };
        MDCTabScrollerRTLDefault.prototype.scrollToRTL = function (scrollX) {
            var edges = this.calculateScrollEdges_();
            var currentScrollLeft = this.adapter_.getScrollAreaScrollLeft();
            var clampedScrollLeft = this.clampScrollValue_(edges.right - scrollX);
            return {
                finalScrollPosition: clampedScrollLeft,
                scrollDelta: clampedScrollLeft - currentScrollLeft,
            };
        };
        MDCTabScrollerRTLDefault.prototype.incrementScrollRTL = function (scrollX) {
            var currentScrollLeft = this.adapter_.getScrollAreaScrollLeft();
            var clampedScrollLeft = this.clampScrollValue_(currentScrollLeft - scrollX);
            return {
                finalScrollPosition: clampedScrollLeft,
                scrollDelta: clampedScrollLeft - currentScrollLeft,
            };
        };
        MDCTabScrollerRTLDefault.prototype.getAnimatingScrollPosition = function (scrollX) {
            return scrollX;
        };
        MDCTabScrollerRTLDefault.prototype.calculateScrollEdges_ = function () {
            var contentWidth = this.adapter_.getScrollContentOffsetWidth();
            var rootWidth = this.adapter_.getScrollAreaOffsetWidth();
            return {
                left: 0,
                right: contentWidth - rootWidth,
            };
        };
        MDCTabScrollerRTLDefault.prototype.clampScrollValue_ = function (scrollX) {
            var edges = this.calculateScrollEdges_();
            return Math.min(Math.max(edges.left, scrollX), edges.right);
        };
        return MDCTabScrollerRTLDefault;
    }(MDCTabScrollerRTL));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCTabScrollerRTLNegative = /** @class */ (function (_super) {
        __extends(MDCTabScrollerRTLNegative, _super);
        function MDCTabScrollerRTLNegative() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MDCTabScrollerRTLNegative.prototype.getScrollPositionRTL = function (translateX) {
            var currentScrollLeft = this.adapter_.getScrollAreaScrollLeft();
            return Math.round(translateX - currentScrollLeft);
        };
        MDCTabScrollerRTLNegative.prototype.scrollToRTL = function (scrollX) {
            var currentScrollLeft = this.adapter_.getScrollAreaScrollLeft();
            var clampedScrollLeft = this.clampScrollValue_(-scrollX);
            return {
                finalScrollPosition: clampedScrollLeft,
                scrollDelta: clampedScrollLeft - currentScrollLeft,
            };
        };
        MDCTabScrollerRTLNegative.prototype.incrementScrollRTL = function (scrollX) {
            var currentScrollLeft = this.adapter_.getScrollAreaScrollLeft();
            var clampedScrollLeft = this.clampScrollValue_(currentScrollLeft - scrollX);
            return {
                finalScrollPosition: clampedScrollLeft,
                scrollDelta: clampedScrollLeft - currentScrollLeft,
            };
        };
        MDCTabScrollerRTLNegative.prototype.getAnimatingScrollPosition = function (scrollX, translateX) {
            return scrollX - translateX;
        };
        MDCTabScrollerRTLNegative.prototype.calculateScrollEdges_ = function () {
            var contentWidth = this.adapter_.getScrollContentOffsetWidth();
            var rootWidth = this.adapter_.getScrollAreaOffsetWidth();
            return {
                left: rootWidth - contentWidth,
                right: 0,
            };
        };
        MDCTabScrollerRTLNegative.prototype.clampScrollValue_ = function (scrollX) {
            var edges = this.calculateScrollEdges_();
            return Math.max(Math.min(edges.right, scrollX), edges.left);
        };
        return MDCTabScrollerRTLNegative;
    }(MDCTabScrollerRTL));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCTabScrollerRTLReverse = /** @class */ (function (_super) {
        __extends(MDCTabScrollerRTLReverse, _super);
        function MDCTabScrollerRTLReverse() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MDCTabScrollerRTLReverse.prototype.getScrollPositionRTL = function (translateX) {
            var currentScrollLeft = this.adapter_.getScrollAreaScrollLeft();
            // Scroll values on most browsers are ints instead of floats so we round
            return Math.round(currentScrollLeft - translateX);
        };
        MDCTabScrollerRTLReverse.prototype.scrollToRTL = function (scrollX) {
            var currentScrollLeft = this.adapter_.getScrollAreaScrollLeft();
            var clampedScrollLeft = this.clampScrollValue_(scrollX);
            return {
                finalScrollPosition: clampedScrollLeft,
                scrollDelta: currentScrollLeft - clampedScrollLeft,
            };
        };
        MDCTabScrollerRTLReverse.prototype.incrementScrollRTL = function (scrollX) {
            var currentScrollLeft = this.adapter_.getScrollAreaScrollLeft();
            var clampedScrollLeft = this.clampScrollValue_(currentScrollLeft + scrollX);
            return {
                finalScrollPosition: clampedScrollLeft,
                scrollDelta: currentScrollLeft - clampedScrollLeft,
            };
        };
        MDCTabScrollerRTLReverse.prototype.getAnimatingScrollPosition = function (scrollX, translateX) {
            return scrollX + translateX;
        };
        MDCTabScrollerRTLReverse.prototype.calculateScrollEdges_ = function () {
            var contentWidth = this.adapter_.getScrollContentOffsetWidth();
            var rootWidth = this.adapter_.getScrollAreaOffsetWidth();
            return {
                left: contentWidth - rootWidth,
                right: 0,
            };
        };
        MDCTabScrollerRTLReverse.prototype.clampScrollValue_ = function (scrollX) {
            var edges = this.calculateScrollEdges_();
            return Math.min(Math.max(edges.right, scrollX), edges.left);
        };
        return MDCTabScrollerRTLReverse;
    }(MDCTabScrollerRTL));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCTabScrollerFoundation = /** @class */ (function (_super) {
        __extends(MDCTabScrollerFoundation, _super);
        function MDCTabScrollerFoundation(adapter) {
            var _this = _super.call(this, __assign({}, MDCTabScrollerFoundation.defaultAdapter, adapter)) || this;
            /**
             * Controls whether we should handle the transitionend and interaction events during the animation.
             */
            _this.isAnimating_ = false;
            return _this;
        }
        Object.defineProperty(MDCTabScrollerFoundation, "cssClasses", {
            get: function () {
                return cssClasses$3;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTabScrollerFoundation, "strings", {
            get: function () {
                return strings$3;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTabScrollerFoundation, "defaultAdapter", {
            get: function () {
                // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
                return {
                    eventTargetMatchesSelector: function () { return false; },
                    addClass: function () { return undefined; },
                    removeClass: function () { return undefined; },
                    addScrollAreaClass: function () { return undefined; },
                    setScrollAreaStyleProperty: function () { return undefined; },
                    setScrollContentStyleProperty: function () { return undefined; },
                    getScrollContentStyleValue: function () { return ''; },
                    setScrollAreaScrollLeft: function () { return undefined; },
                    getScrollAreaScrollLeft: function () { return 0; },
                    getScrollContentOffsetWidth: function () { return 0; },
                    getScrollAreaOffsetWidth: function () { return 0; },
                    computeScrollAreaClientRect: function () { return ({ top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0 }); },
                    computeScrollContentClientRect: function () { return ({ top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0 }); },
                    computeHorizontalScrollbarHeight: function () { return 0; },
                };
                // tslint:enable:object-literal-sort-keys
            },
            enumerable: true,
            configurable: true
        });
        MDCTabScrollerFoundation.prototype.init = function () {
            // Compute horizontal scrollbar height on scroller with overflow initially hidden, then update overflow to scroll
            // and immediately adjust bottom margin to avoid the scrollbar initially appearing before JS runs.
            var horizontalScrollbarHeight = this.adapter_.computeHorizontalScrollbarHeight();
            this.adapter_.setScrollAreaStyleProperty('margin-bottom', -horizontalScrollbarHeight + 'px');
            this.adapter_.addScrollAreaClass(MDCTabScrollerFoundation.cssClasses.SCROLL_AREA_SCROLL);
        };
        /**
         * Computes the current visual scroll position
         */
        MDCTabScrollerFoundation.prototype.getScrollPosition = function () {
            if (this.isRTL_()) {
                return this.computeCurrentScrollPositionRTL_();
            }
            var currentTranslateX = this.calculateCurrentTranslateX_();
            var scrollLeft = this.adapter_.getScrollAreaScrollLeft();
            return scrollLeft - currentTranslateX;
        };
        /**
         * Handles interaction events that occur during transition
         */
        MDCTabScrollerFoundation.prototype.handleInteraction = function () {
            // Early exit if we aren't animating
            if (!this.isAnimating_) {
                return;
            }
            // Prevent other event listeners from handling this event
            this.stopScrollAnimation_();
        };
        /**
         * Handles the transitionend event
         */
        MDCTabScrollerFoundation.prototype.handleTransitionEnd = function (evt) {
            // Early exit if we aren't animating or the event was triggered by a different element.
            var evtTarget = evt.target;
            if (!this.isAnimating_ ||
                !this.adapter_.eventTargetMatchesSelector(evtTarget, MDCTabScrollerFoundation.strings.CONTENT_SELECTOR)) {
                return;
            }
            this.isAnimating_ = false;
            this.adapter_.removeClass(MDCTabScrollerFoundation.cssClasses.ANIMATING);
        };
        /**
         * Increment the scroll value by the scrollXIncrement
         * @param scrollXIncrement The value by which to increment the scroll position
         */
        MDCTabScrollerFoundation.prototype.incrementScroll = function (scrollXIncrement) {
            // Early exit for non-operational increment values
            if (scrollXIncrement === 0) {
                return;
            }
            if (this.isRTL_()) {
                return this.incrementScrollRTL_(scrollXIncrement);
            }
            this.incrementScroll_(scrollXIncrement);
        };
        /**
         * Scrolls to the given scrollX value
         */
        MDCTabScrollerFoundation.prototype.scrollTo = function (scrollX) {
            if (this.isRTL_()) {
                return this.scrollToRTL_(scrollX);
            }
            this.scrollTo_(scrollX);
        };
        /**
         * @return Browser-specific {@link MDCTabScrollerRTL} instance.
         */
        MDCTabScrollerFoundation.prototype.getRTLScroller = function () {
            if (!this.rtlScrollerInstance_) {
                this.rtlScrollerInstance_ = this.rtlScrollerFactory_();
            }
            return this.rtlScrollerInstance_;
        };
        /**
         * @return translateX value from a CSS matrix transform function string.
         */
        MDCTabScrollerFoundation.prototype.calculateCurrentTranslateX_ = function () {
            var transformValue = this.adapter_.getScrollContentStyleValue('transform');
            // Early exit if no transform is present
            if (transformValue === 'none') {
                return 0;
            }
            // The transform value comes back as a matrix transformation in the form
            // of `matrix(a, b, c, d, tx, ty)`. We only care about tx (translateX) so
            // we're going to grab all the parenthesized values, strip out tx, and
            // parse it.
            var match = /\((.+?)\)/.exec(transformValue);
            if (!match) {
                return 0;
            }
            var matrixParams = match[1];
            // tslint:disable-next-line:ban-ts-ignore "Unused vars" should be a linter warning, not a compiler error.
            // @ts-ignore These unused variables should retain their semantic names for clarity.
            var _a = __read(matrixParams.split(','), 6), a = _a[0], b = _a[1], c = _a[2], d = _a[3], tx = _a[4], ty = _a[5];
            return parseFloat(tx); // tslint:disable-line:ban
        };
        /**
         * Calculates a safe scroll value that is > 0 and < the max scroll value
         * @param scrollX The distance to scroll
         */
        MDCTabScrollerFoundation.prototype.clampScrollValue_ = function (scrollX) {
            var edges = this.calculateScrollEdges_();
            return Math.min(Math.max(edges.left, scrollX), edges.right);
        };
        MDCTabScrollerFoundation.prototype.computeCurrentScrollPositionRTL_ = function () {
            var translateX = this.calculateCurrentTranslateX_();
            return this.getRTLScroller().getScrollPositionRTL(translateX);
        };
        MDCTabScrollerFoundation.prototype.calculateScrollEdges_ = function () {
            var contentWidth = this.adapter_.getScrollContentOffsetWidth();
            var rootWidth = this.adapter_.getScrollAreaOffsetWidth();
            return {
                left: 0,
                right: contentWidth - rootWidth,
            };
        };
        /**
         * Internal scroll method
         * @param scrollX The new scroll position
         */
        MDCTabScrollerFoundation.prototype.scrollTo_ = function (scrollX) {
            var currentScrollX = this.getScrollPosition();
            var safeScrollX = this.clampScrollValue_(scrollX);
            var scrollDelta = safeScrollX - currentScrollX;
            this.animate_({
                finalScrollPosition: safeScrollX,
                scrollDelta: scrollDelta,
            });
        };
        /**
         * Internal RTL scroll method
         * @param scrollX The new scroll position
         */
        MDCTabScrollerFoundation.prototype.scrollToRTL_ = function (scrollX) {
            var animation = this.getRTLScroller().scrollToRTL(scrollX);
            this.animate_(animation);
        };
        /**
         * Internal increment scroll method
         * @param scrollX The new scroll position increment
         */
        MDCTabScrollerFoundation.prototype.incrementScroll_ = function (scrollX) {
            var currentScrollX = this.getScrollPosition();
            var targetScrollX = scrollX + currentScrollX;
            var safeScrollX = this.clampScrollValue_(targetScrollX);
            var scrollDelta = safeScrollX - currentScrollX;
            this.animate_({
                finalScrollPosition: safeScrollX,
                scrollDelta: scrollDelta,
            });
        };
        /**
         * Internal increment scroll RTL method
         * @param scrollX The new scroll position RTL increment
         */
        MDCTabScrollerFoundation.prototype.incrementScrollRTL_ = function (scrollX) {
            var animation = this.getRTLScroller().incrementScrollRTL(scrollX);
            this.animate_(animation);
        };
        /**
         * Animates the tab scrolling
         * @param animation The animation to apply
         */
        MDCTabScrollerFoundation.prototype.animate_ = function (animation) {
            var _this = this;
            // Early exit if translateX is 0, which means there's no animation to perform
            if (animation.scrollDelta === 0) {
                return;
            }
            this.stopScrollAnimation_();
            // This animation uses the FLIP approach.
            // Read more here: https://aerotwist.com/blog/flip-your-animations/
            this.adapter_.setScrollAreaScrollLeft(animation.finalScrollPosition);
            this.adapter_.setScrollContentStyleProperty('transform', "translateX(" + animation.scrollDelta + "px)");
            // Force repaint
            this.adapter_.computeScrollAreaClientRect();
            requestAnimationFrame(function () {
                _this.adapter_.addClass(MDCTabScrollerFoundation.cssClasses.ANIMATING);
                _this.adapter_.setScrollContentStyleProperty('transform', 'none');
            });
            this.isAnimating_ = true;
        };
        /**
         * Stops scroll animation
         */
        MDCTabScrollerFoundation.prototype.stopScrollAnimation_ = function () {
            this.isAnimating_ = false;
            var currentScrollPosition = this.getAnimatingScrollPosition_();
            this.adapter_.removeClass(MDCTabScrollerFoundation.cssClasses.ANIMATING);
            this.adapter_.setScrollContentStyleProperty('transform', 'translateX(0px)');
            this.adapter_.setScrollAreaScrollLeft(currentScrollPosition);
        };
        /**
         * Gets the current scroll position during animation
         */
        MDCTabScrollerFoundation.prototype.getAnimatingScrollPosition_ = function () {
            var currentTranslateX = this.calculateCurrentTranslateX_();
            var scrollLeft = this.adapter_.getScrollAreaScrollLeft();
            if (this.isRTL_()) {
                return this.getRTLScroller().getAnimatingScrollPosition(scrollLeft, currentTranslateX);
            }
            return scrollLeft - currentTranslateX;
        };
        /**
         * Determines the RTL Scroller to use
         */
        MDCTabScrollerFoundation.prototype.rtlScrollerFactory_ = function () {
            // Browsers have three different implementations of scrollLeft in RTL mode,
            // dependent on the browser. The behavior is based off the max LTR
            // scrollLeft value and 0.
            //
            // * Default scrolling in RTL *
            //    - Left-most value: 0
            //    - Right-most value: Max LTR scrollLeft value
            //
            // * Negative scrolling in RTL *
            //    - Left-most value: Negated max LTR scrollLeft value
            //    - Right-most value: 0
            //
            // * Reverse scrolling in RTL *
            //    - Left-most value: Max LTR scrollLeft value
            //    - Right-most value: 0
            //
            // We use those principles below to determine which RTL scrollLeft
            // behavior is implemented in the current browser.
            var initialScrollLeft = this.adapter_.getScrollAreaScrollLeft();
            this.adapter_.setScrollAreaScrollLeft(initialScrollLeft - 1);
            var newScrollLeft = this.adapter_.getScrollAreaScrollLeft();
            // If the newScrollLeft value is negative,then we know that the browser has
            // implemented negative RTL scrolling, since all other implementations have
            // only positive values.
            if (newScrollLeft < 0) {
                // Undo the scrollLeft test check
                this.adapter_.setScrollAreaScrollLeft(initialScrollLeft);
                return new MDCTabScrollerRTLNegative(this.adapter_);
            }
            var rootClientRect = this.adapter_.computeScrollAreaClientRect();
            var contentClientRect = this.adapter_.computeScrollContentClientRect();
            var rightEdgeDelta = Math.round(contentClientRect.right - rootClientRect.right);
            // Undo the scrollLeft test check
            this.adapter_.setScrollAreaScrollLeft(initialScrollLeft);
            // By calculating the clientRect of the root element and the clientRect of
            // the content element, we can determine how much the scroll value changed
            // when we performed the scrollLeft subtraction above.
            if (rightEdgeDelta === newScrollLeft) {
                return new MDCTabScrollerRTLReverse(this.adapter_);
            }
            return new MDCTabScrollerRTLDefault(this.adapter_);
        };
        MDCTabScrollerFoundation.prototype.isRTL_ = function () {
            return this.adapter_.getScrollContentStyleValue('direction') === 'rtl';
        };
        return MDCTabScrollerFoundation;
    }(MDCFoundation));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    /**
     * Stores result from computeHorizontalScrollbarHeight to avoid redundant processing.
     */
    var horizontalScrollbarHeight_;
    /**
     * Computes the height of browser-rendered horizontal scrollbars using a self-created test element.
     * May return 0 (e.g. on OS X browsers under default configuration).
     */
    function computeHorizontalScrollbarHeight(documentObj, shouldCacheResult) {
        if (shouldCacheResult === void 0) { shouldCacheResult = true; }
        if (shouldCacheResult && typeof horizontalScrollbarHeight_ !== 'undefined') {
            return horizontalScrollbarHeight_;
        }
        var el = documentObj.createElement('div');
        el.classList.add(cssClasses$3.SCROLL_TEST);
        documentObj.body.appendChild(el);
        var horizontalScrollbarHeight = el.offsetHeight - el.clientHeight;
        documentObj.body.removeChild(el);
        if (shouldCacheResult) {
            horizontalScrollbarHeight_ = horizontalScrollbarHeight;
        }
        return horizontalScrollbarHeight;
    }

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCTabScroller = /** @class */ (function (_super) {
        __extends(MDCTabScroller, _super);
        function MDCTabScroller() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MDCTabScroller.attachTo = function (root) {
            return new MDCTabScroller(root);
        };
        MDCTabScroller.prototype.initialize = function () {
            this.area_ = this.root_.querySelector(MDCTabScrollerFoundation.strings.AREA_SELECTOR);
            this.content_ = this.root_.querySelector(MDCTabScrollerFoundation.strings.CONTENT_SELECTOR);
        };
        MDCTabScroller.prototype.initialSyncWithDOM = function () {
            var _this = this;
            this.handleInteraction_ = function () { return _this.foundation_.handleInteraction(); };
            this.handleTransitionEnd_ = function (evt) { return _this.foundation_.handleTransitionEnd(evt); };
            this.area_.addEventListener('wheel', this.handleInteraction_, applyPassive());
            this.area_.addEventListener('touchstart', this.handleInteraction_, applyPassive());
            this.area_.addEventListener('pointerdown', this.handleInteraction_, applyPassive());
            this.area_.addEventListener('mousedown', this.handleInteraction_, applyPassive());
            this.area_.addEventListener('keydown', this.handleInteraction_, applyPassive());
            this.content_.addEventListener('transitionend', this.handleTransitionEnd_);
        };
        MDCTabScroller.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.area_.removeEventListener('wheel', this.handleInteraction_, applyPassive());
            this.area_.removeEventListener('touchstart', this.handleInteraction_, applyPassive());
            this.area_.removeEventListener('pointerdown', this.handleInteraction_, applyPassive());
            this.area_.removeEventListener('mousedown', this.handleInteraction_, applyPassive());
            this.area_.removeEventListener('keydown', this.handleInteraction_, applyPassive());
            this.content_.removeEventListener('transitionend', this.handleTransitionEnd_);
        };
        MDCTabScroller.prototype.getDefaultFoundation = function () {
            var _this = this;
            // DO NOT INLINE this variable. For backward compatibility, foundations take a Partial<MDCFooAdapter>.
            // To ensure we don't accidentally omit any methods, we need a separate, strongly typed adapter variable.
            // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
            var adapter = {
                eventTargetMatchesSelector: function (evtTarget, selector) { return matches(evtTarget, selector); },
                addClass: function (className) { return _this.root_.classList.add(className); },
                removeClass: function (className) { return _this.root_.classList.remove(className); },
                addScrollAreaClass: function (className) { return _this.area_.classList.add(className); },
                setScrollAreaStyleProperty: function (prop, value) { return _this.area_.style.setProperty(prop, value); },
                setScrollContentStyleProperty: function (prop, value) { return _this.content_.style.setProperty(prop, value); },
                getScrollContentStyleValue: function (propName) { return window.getComputedStyle(_this.content_).getPropertyValue(propName); },
                setScrollAreaScrollLeft: function (scrollX) { return _this.area_.scrollLeft = scrollX; },
                getScrollAreaScrollLeft: function () { return _this.area_.scrollLeft; },
                getScrollContentOffsetWidth: function () { return _this.content_.offsetWidth; },
                getScrollAreaOffsetWidth: function () { return _this.area_.offsetWidth; },
                computeScrollAreaClientRect: function () { return _this.area_.getBoundingClientRect(); },
                computeScrollContentClientRect: function () { return _this.content_.getBoundingClientRect(); },
                computeHorizontalScrollbarHeight: function () { return computeHorizontalScrollbarHeight(document); },
            };
            // tslint:enable:object-literal-sort-keys
            return new MDCTabScrollerFoundation(adapter);
        };
        /**
         * Returns the current visual scroll position
         */
        MDCTabScroller.prototype.getScrollPosition = function () {
            return this.foundation_.getScrollPosition();
        };
        /**
         * Returns the width of the scroll content
         */
        MDCTabScroller.prototype.getScrollContentWidth = function () {
            return this.content_.offsetWidth;
        };
        /**
         * Increments the scroll value by the given amount
         * @param scrollXIncrement The pixel value by which to increment the scroll value
         */
        MDCTabScroller.prototype.incrementScroll = function (scrollXIncrement) {
            this.foundation_.incrementScroll(scrollXIncrement);
        };
        /**
         * Scrolls to the given pixel position
         * @param scrollX The pixel value to scroll to
         */
        MDCTabScroller.prototype.scrollTo = function (scrollX) {
            this.foundation_.scrollTo(scrollX);
        };
        return MDCTabScroller;
    }(MDCComponent));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var strings$4 = {
        ARROW_LEFT_KEY: 'ArrowLeft',
        ARROW_RIGHT_KEY: 'ArrowRight',
        END_KEY: 'End',
        ENTER_KEY: 'Enter',
        HOME_KEY: 'Home',
        SPACE_KEY: 'Space',
        TAB_ACTIVATED_EVENT: 'MDCTabBar:activated',
        TAB_SCROLLER_SELECTOR: '.mdc-tab-scroller',
        TAB_SELECTOR: '.mdc-tab',
    };
    var numbers$1 = {
        ARROW_LEFT_KEYCODE: 37,
        ARROW_RIGHT_KEYCODE: 39,
        END_KEYCODE: 35,
        ENTER_KEYCODE: 13,
        EXTRA_SCROLL_AMOUNT: 20,
        HOME_KEYCODE: 36,
        SPACE_KEYCODE: 32,
    };

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var ACCEPTABLE_KEYS = new Set();
    // IE11 has no support for new Set with iterable so we need to initialize this by hand
    ACCEPTABLE_KEYS.add(strings$4.ARROW_LEFT_KEY);
    ACCEPTABLE_KEYS.add(strings$4.ARROW_RIGHT_KEY);
    ACCEPTABLE_KEYS.add(strings$4.END_KEY);
    ACCEPTABLE_KEYS.add(strings$4.HOME_KEY);
    ACCEPTABLE_KEYS.add(strings$4.ENTER_KEY);
    ACCEPTABLE_KEYS.add(strings$4.SPACE_KEY);
    var KEYCODE_MAP = new Map();
    // IE11 has no support for new Map with iterable so we need to initialize this by hand
    KEYCODE_MAP.set(numbers$1.ARROW_LEFT_KEYCODE, strings$4.ARROW_LEFT_KEY);
    KEYCODE_MAP.set(numbers$1.ARROW_RIGHT_KEYCODE, strings$4.ARROW_RIGHT_KEY);
    KEYCODE_MAP.set(numbers$1.END_KEYCODE, strings$4.END_KEY);
    KEYCODE_MAP.set(numbers$1.HOME_KEYCODE, strings$4.HOME_KEY);
    KEYCODE_MAP.set(numbers$1.ENTER_KEYCODE, strings$4.ENTER_KEY);
    KEYCODE_MAP.set(numbers$1.SPACE_KEYCODE, strings$4.SPACE_KEY);
    var MDCTabBarFoundation = /** @class */ (function (_super) {
        __extends(MDCTabBarFoundation, _super);
        function MDCTabBarFoundation(adapter) {
            var _this = _super.call(this, __assign({}, MDCTabBarFoundation.defaultAdapter, adapter)) || this;
            _this.useAutomaticActivation_ = false;
            return _this;
        }
        Object.defineProperty(MDCTabBarFoundation, "strings", {
            get: function () {
                return strings$4;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTabBarFoundation, "numbers", {
            get: function () {
                return numbers$1;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTabBarFoundation, "defaultAdapter", {
            get: function () {
                // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
                return {
                    scrollTo: function () { return undefined; },
                    incrementScroll: function () { return undefined; },
                    getScrollPosition: function () { return 0; },
                    getScrollContentWidth: function () { return 0; },
                    getOffsetWidth: function () { return 0; },
                    isRTL: function () { return false; },
                    setActiveTab: function () { return undefined; },
                    activateTabAtIndex: function () { return undefined; },
                    deactivateTabAtIndex: function () { return undefined; },
                    focusTabAtIndex: function () { return undefined; },
                    getTabIndicatorClientRectAtIndex: function () { return ({ top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0 }); },
                    getTabDimensionsAtIndex: function () { return ({ rootLeft: 0, rootRight: 0, contentLeft: 0, contentRight: 0 }); },
                    getPreviousActiveTabIndex: function () { return -1; },
                    getFocusedTabIndex: function () { return -1; },
                    getIndexOfTabById: function () { return -1; },
                    getTabListLength: function () { return 0; },
                    notifyTabActivated: function () { return undefined; },
                };
                // tslint:enable:object-literal-sort-keys
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Switches between automatic and manual activation modes.
         * See https://www.w3.org/TR/wai-aria-practices/#tabpanel for examples.
         */
        MDCTabBarFoundation.prototype.setUseAutomaticActivation = function (useAutomaticActivation) {
            this.useAutomaticActivation_ = useAutomaticActivation;
        };
        MDCTabBarFoundation.prototype.activateTab = function (index) {
            var previousActiveIndex = this.adapter_.getPreviousActiveTabIndex();
            if (!this.indexIsInRange_(index) || index === previousActiveIndex) {
                return;
            }
            var previousClientRect;
            if (previousActiveIndex !== -1) {
                this.adapter_.deactivateTabAtIndex(previousActiveIndex);
                previousClientRect = this.adapter_.getTabIndicatorClientRectAtIndex(previousActiveIndex);
            }
            this.adapter_.activateTabAtIndex(index, previousClientRect);
            this.scrollIntoView(index);
            this.adapter_.notifyTabActivated(index);
        };
        MDCTabBarFoundation.prototype.handleKeyDown = function (evt) {
            // Get the key from the event
            var key = this.getKeyFromEvent_(evt);
            // Early exit if the event key isn't one of the keyboard navigation keys
            if (key === undefined) {
                return;
            }
            // Prevent default behavior for movement keys, but not for activation keys, since :active is used to apply ripple
            if (!this.isActivationKey_(key)) {
                evt.preventDefault();
            }
            if (this.useAutomaticActivation_) {
                if (this.isActivationKey_(key)) {
                    return;
                }
                var index = this.determineTargetFromKey_(this.adapter_.getPreviousActiveTabIndex(), key);
                this.adapter_.setActiveTab(index);
                this.scrollIntoView(index);
            }
            else {
                var focusedTabIndex = this.adapter_.getFocusedTabIndex();
                if (this.isActivationKey_(key)) {
                    this.adapter_.setActiveTab(focusedTabIndex);
                }
                else {
                    var index = this.determineTargetFromKey_(focusedTabIndex, key);
                    this.adapter_.focusTabAtIndex(index);
                    this.scrollIntoView(index);
                }
            }
        };
        /**
         * Handles the MDCTab:interacted event
         */
        MDCTabBarFoundation.prototype.handleTabInteraction = function (evt) {
            this.adapter_.setActiveTab(this.adapter_.getIndexOfTabById(evt.detail.tabId));
        };
        /**
         * Scrolls the tab at the given index into view
         * @param index The tab index to make visible
         */
        MDCTabBarFoundation.prototype.scrollIntoView = function (index) {
            // Early exit if the index is out of range
            if (!this.indexIsInRange_(index)) {
                return;
            }
            // Always scroll to 0 if scrolling to the 0th index
            if (index === 0) {
                return this.adapter_.scrollTo(0);
            }
            // Always scroll to the max value if scrolling to the Nth index
            // MDCTabScroller.scrollTo() will never scroll past the max possible value
            if (index === this.adapter_.getTabListLength() - 1) {
                return this.adapter_.scrollTo(this.adapter_.getScrollContentWidth());
            }
            if (this.isRTL_()) {
                return this.scrollIntoViewRTL_(index);
            }
            this.scrollIntoView_(index);
        };
        /**
         * Private method for determining the index of the destination tab based on what key was pressed
         * @param origin The original index from which to determine the destination
         * @param key The name of the key
         */
        MDCTabBarFoundation.prototype.determineTargetFromKey_ = function (origin, key) {
            var isRTL = this.isRTL_();
            var maxIndex = this.adapter_.getTabListLength() - 1;
            var shouldGoToEnd = key === strings$4.END_KEY;
            var shouldDecrement = key === strings$4.ARROW_LEFT_KEY && !isRTL || key === strings$4.ARROW_RIGHT_KEY && isRTL;
            var shouldIncrement = key === strings$4.ARROW_RIGHT_KEY && !isRTL || key === strings$4.ARROW_LEFT_KEY && isRTL;
            var index = origin;
            if (shouldGoToEnd) {
                index = maxIndex;
            }
            else if (shouldDecrement) {
                index -= 1;
            }
            else if (shouldIncrement) {
                index += 1;
            }
            else {
                index = 0;
            }
            if (index < 0) {
                index = maxIndex;
            }
            else if (index > maxIndex) {
                index = 0;
            }
            return index;
        };
        /**
         * Calculates the scroll increment that will make the tab at the given index visible
         * @param index The index of the tab
         * @param nextIndex The index of the next tab
         * @param scrollPosition The current scroll position
         * @param barWidth The width of the Tab Bar
         */
        MDCTabBarFoundation.prototype.calculateScrollIncrement_ = function (index, nextIndex, scrollPosition, barWidth) {
            var nextTabDimensions = this.adapter_.getTabDimensionsAtIndex(nextIndex);
            var relativeContentLeft = nextTabDimensions.contentLeft - scrollPosition - barWidth;
            var relativeContentRight = nextTabDimensions.contentRight - scrollPosition;
            var leftIncrement = relativeContentRight - numbers$1.EXTRA_SCROLL_AMOUNT;
            var rightIncrement = relativeContentLeft + numbers$1.EXTRA_SCROLL_AMOUNT;
            if (nextIndex < index) {
                return Math.min(leftIncrement, 0);
            }
            return Math.max(rightIncrement, 0);
        };
        /**
         * Calculates the scroll increment that will make the tab at the given index visible in RTL
         * @param index The index of the tab
         * @param nextIndex The index of the next tab
         * @param scrollPosition The current scroll position
         * @param barWidth The width of the Tab Bar
         * @param scrollContentWidth The width of the scroll content
         */
        MDCTabBarFoundation.prototype.calculateScrollIncrementRTL_ = function (index, nextIndex, scrollPosition, barWidth, scrollContentWidth) {
            var nextTabDimensions = this.adapter_.getTabDimensionsAtIndex(nextIndex);
            var relativeContentLeft = scrollContentWidth - nextTabDimensions.contentLeft - scrollPosition;
            var relativeContentRight = scrollContentWidth - nextTabDimensions.contentRight - scrollPosition - barWidth;
            var leftIncrement = relativeContentRight + numbers$1.EXTRA_SCROLL_AMOUNT;
            var rightIncrement = relativeContentLeft - numbers$1.EXTRA_SCROLL_AMOUNT;
            if (nextIndex > index) {
                return Math.max(leftIncrement, 0);
            }
            return Math.min(rightIncrement, 0);
        };
        /**
         * Determines the index of the adjacent tab closest to either edge of the Tab Bar
         * @param index The index of the tab
         * @param tabDimensions The dimensions of the tab
         * @param scrollPosition The current scroll position
         * @param barWidth The width of the tab bar
         */
        MDCTabBarFoundation.prototype.findAdjacentTabIndexClosestToEdge_ = function (index, tabDimensions, scrollPosition, barWidth) {
            /**
             * Tabs are laid out in the Tab Scroller like this:
             *
             *    Scroll Position
             *    +---+
             *    |   |   Bar Width
             *    |   +-----------------------------------+
             *    |   |                                   |
             *    |   V                                   V
             *    |   +-----------------------------------+
             *    V   |             Tab Scroller          |
             *    +------------+--------------+-------------------+
             *    |    Tab     |      Tab     |        Tab        |
             *    +------------+--------------+-------------------+
             *        |                                   |
             *        +-----------------------------------+
             *
             * To determine the next adjacent index, we look at the Tab root left and
             * Tab root right, both relative to the scroll position. If the Tab root
             * left is less than 0, then we know it's out of view to the left. If the
             * Tab root right minus the bar width is greater than 0, we know the Tab is
             * out of view to the right. From there, we either increment or decrement
             * the index.
             */
            var relativeRootLeft = tabDimensions.rootLeft - scrollPosition;
            var relativeRootRight = tabDimensions.rootRight - scrollPosition - barWidth;
            var relativeRootDelta = relativeRootLeft + relativeRootRight;
            var leftEdgeIsCloser = relativeRootLeft < 0 || relativeRootDelta < 0;
            var rightEdgeIsCloser = relativeRootRight > 0 || relativeRootDelta > 0;
            if (leftEdgeIsCloser) {
                return index - 1;
            }
            if (rightEdgeIsCloser) {
                return index + 1;
            }
            return -1;
        };
        /**
         * Determines the index of the adjacent tab closest to either edge of the Tab Bar in RTL
         * @param index The index of the tab
         * @param tabDimensions The dimensions of the tab
         * @param scrollPosition The current scroll position
         * @param barWidth The width of the tab bar
         * @param scrollContentWidth The width of the scroller content
         */
        MDCTabBarFoundation.prototype.findAdjacentTabIndexClosestToEdgeRTL_ = function (index, tabDimensions, scrollPosition, barWidth, scrollContentWidth) {
            var rootLeft = scrollContentWidth - tabDimensions.rootLeft - barWidth - scrollPosition;
            var rootRight = scrollContentWidth - tabDimensions.rootRight - scrollPosition;
            var rootDelta = rootLeft + rootRight;
            var leftEdgeIsCloser = rootLeft > 0 || rootDelta > 0;
            var rightEdgeIsCloser = rootRight < 0 || rootDelta < 0;
            if (leftEdgeIsCloser) {
                return index + 1;
            }
            if (rightEdgeIsCloser) {
                return index - 1;
            }
            return -1;
        };
        /**
         * Returns the key associated with a keydown event
         * @param evt The keydown event
         */
        MDCTabBarFoundation.prototype.getKeyFromEvent_ = function (evt) {
            if (ACCEPTABLE_KEYS.has(evt.key)) {
                return evt.key;
            }
            return KEYCODE_MAP.get(evt.keyCode);
        };
        MDCTabBarFoundation.prototype.isActivationKey_ = function (key) {
            return key === strings$4.SPACE_KEY || key === strings$4.ENTER_KEY;
        };
        /**
         * Returns whether a given index is inclusively between the ends
         * @param index The index to test
         */
        MDCTabBarFoundation.prototype.indexIsInRange_ = function (index) {
            return index >= 0 && index < this.adapter_.getTabListLength();
        };
        /**
         * Returns the view's RTL property
         */
        MDCTabBarFoundation.prototype.isRTL_ = function () {
            return this.adapter_.isRTL();
        };
        /**
         * Scrolls the tab at the given index into view for left-to-right user agents.
         * @param index The index of the tab to scroll into view
         */
        MDCTabBarFoundation.prototype.scrollIntoView_ = function (index) {
            var scrollPosition = this.adapter_.getScrollPosition();
            var barWidth = this.adapter_.getOffsetWidth();
            var tabDimensions = this.adapter_.getTabDimensionsAtIndex(index);
            var nextIndex = this.findAdjacentTabIndexClosestToEdge_(index, tabDimensions, scrollPosition, barWidth);
            if (!this.indexIsInRange_(nextIndex)) {
                return;
            }
            var scrollIncrement = this.calculateScrollIncrement_(index, nextIndex, scrollPosition, barWidth);
            this.adapter_.incrementScroll(scrollIncrement);
        };
        /**
         * Scrolls the tab at the given index into view in RTL
         * @param index The tab index to make visible
         */
        MDCTabBarFoundation.prototype.scrollIntoViewRTL_ = function (index) {
            var scrollPosition = this.adapter_.getScrollPosition();
            var barWidth = this.adapter_.getOffsetWidth();
            var tabDimensions = this.adapter_.getTabDimensionsAtIndex(index);
            var scrollWidth = this.adapter_.getScrollContentWidth();
            var nextIndex = this.findAdjacentTabIndexClosestToEdgeRTL_(index, tabDimensions, scrollPosition, barWidth, scrollWidth);
            if (!this.indexIsInRange_(nextIndex)) {
                return;
            }
            var scrollIncrement = this.calculateScrollIncrementRTL_(index, nextIndex, scrollPosition, barWidth, scrollWidth);
            this.adapter_.incrementScroll(scrollIncrement);
        };
        return MDCTabBarFoundation;
    }(MDCFoundation));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var strings$5 = MDCTabBarFoundation.strings;
    var tabIdCounter = 0;
    var MDCTabBar = /** @class */ (function (_super) {
        __extends(MDCTabBar, _super);
        function MDCTabBar() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MDCTabBar.attachTo = function (root) {
            return new MDCTabBar(root);
        };
        Object.defineProperty(MDCTabBar.prototype, "focusOnActivate", {
            set: function (focusOnActivate) {
                this.tabList_.forEach(function (tab) { return tab.focusOnActivate = focusOnActivate; });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTabBar.prototype, "useAutomaticActivation", {
            set: function (useAutomaticActivation) {
                this.foundation_.setUseAutomaticActivation(useAutomaticActivation);
            },
            enumerable: true,
            configurable: true
        });
        MDCTabBar.prototype.initialize = function (tabFactory, tabScrollerFactory) {
            if (tabFactory === void 0) { tabFactory = function (el) { return new MDCTab(el); }; }
            if (tabScrollerFactory === void 0) { tabScrollerFactory = function (el) { return new MDCTabScroller(el); }; }
            this.tabList_ = this.instantiateTabs_(tabFactory);
            this.tabScroller_ = this.instantiateTabScroller_(tabScrollerFactory);
        };
        MDCTabBar.prototype.initialSyncWithDOM = function () {
            var _this = this;
            this.handleTabInteraction_ = function (evt) { return _this.foundation_.handleTabInteraction(evt); };
            this.handleKeyDown_ = function (evt) { return _this.foundation_.handleKeyDown(evt); };
            this.listen(MDCTabFoundation.strings.INTERACTED_EVENT, this.handleTabInteraction_);
            this.listen('keydown', this.handleKeyDown_);
            for (var i = 0; i < this.tabList_.length; i++) {
                if (this.tabList_[i].active) {
                    this.scrollIntoView(i);
                    break;
                }
            }
        };
        MDCTabBar.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.unlisten(MDCTabFoundation.strings.INTERACTED_EVENT, this.handleTabInteraction_);
            this.unlisten('keydown', this.handleKeyDown_);
            this.tabList_.forEach(function (tab) { return tab.destroy(); });
            if (this.tabScroller_) {
                this.tabScroller_.destroy();
            }
        };
        MDCTabBar.prototype.getDefaultFoundation = function () {
            var _this = this;
            // DO NOT INLINE this variable. For backward compatibility, foundations take a Partial<MDCFooAdapter>.
            // To ensure we don't accidentally omit any methods, we need a separate, strongly typed adapter variable.
            // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
            var adapter = {
                scrollTo: function (scrollX) { return _this.tabScroller_.scrollTo(scrollX); },
                incrementScroll: function (scrollXIncrement) { return _this.tabScroller_.incrementScroll(scrollXIncrement); },
                getScrollPosition: function () { return _this.tabScroller_.getScrollPosition(); },
                getScrollContentWidth: function () { return _this.tabScroller_.getScrollContentWidth(); },
                getOffsetWidth: function () { return _this.root_.offsetWidth; },
                isRTL: function () { return window.getComputedStyle(_this.root_).getPropertyValue('direction') === 'rtl'; },
                setActiveTab: function (index) { return _this.foundation_.activateTab(index); },
                activateTabAtIndex: function (index, clientRect) { return _this.tabList_[index].activate(clientRect); },
                deactivateTabAtIndex: function (index) { return _this.tabList_[index].deactivate(); },
                focusTabAtIndex: function (index) { return _this.tabList_[index].focus(); },
                getTabIndicatorClientRectAtIndex: function (index) { return _this.tabList_[index].computeIndicatorClientRect(); },
                getTabDimensionsAtIndex: function (index) { return _this.tabList_[index].computeDimensions(); },
                getPreviousActiveTabIndex: function () {
                    for (var i = 0; i < _this.tabList_.length; i++) {
                        if (_this.tabList_[i].active) {
                            return i;
                        }
                    }
                    return -1;
                },
                getFocusedTabIndex: function () {
                    var tabElements = _this.getTabElements_();
                    var activeElement = document.activeElement;
                    return tabElements.indexOf(activeElement);
                },
                getIndexOfTabById: function (id) {
                    for (var i = 0; i < _this.tabList_.length; i++) {
                        if (_this.tabList_[i].id === id) {
                            return i;
                        }
                    }
                    return -1;
                },
                getTabListLength: function () { return _this.tabList_.length; },
                notifyTabActivated: function (index) {
                    return _this.emit(strings$5.TAB_ACTIVATED_EVENT, { index: index }, true);
                },
            };
            // tslint:enable:object-literal-sort-keys
            return new MDCTabBarFoundation(adapter);
        };
        /**
         * Activates the tab at the given index
         * @param index The index of the tab
         */
        MDCTabBar.prototype.activateTab = function (index) {
            this.foundation_.activateTab(index);
        };
        /**
         * Scrolls the tab at the given index into view
         * @param index THe index of the tab
         */
        MDCTabBar.prototype.scrollIntoView = function (index) {
            this.foundation_.scrollIntoView(index);
        };
        /**
         * Returns all the tab elements in a nice clean array
         */
        MDCTabBar.prototype.getTabElements_ = function () {
            return [].slice.call(this.root_.querySelectorAll(strings$5.TAB_SELECTOR));
        };
        /**
         * Instantiates tab components on all child tab elements
         */
        MDCTabBar.prototype.instantiateTabs_ = function (tabFactory) {
            return this.getTabElements_().map(function (el) {
                el.id = el.id || "mdc-tab-" + ++tabIdCounter;
                return tabFactory(el);
            });
        };
        /**
         * Instantiates tab scroller component on the child tab scroller element
         */
        MDCTabBar.prototype.instantiateTabScroller_ = function (tabScrollerFactory) {
            var tabScrollerElement = this.root_.querySelector(strings$5.TAB_SCROLLER_SELECTOR);
            if (tabScrollerElement) {
                return tabScrollerFactory(tabScrollerElement);
            }
            return null;
        };
        return MDCTabBar;
    }(MDCComponent));

    /* node_modules/@smui/tab-scroller/TabScroller.svelte generated by Svelte v3.31.0 */
    const file$3 = "node_modules/@smui/tab-scroller/TabScroller.svelte";

    function create_fragment$3(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let div0_class_value;
    	let useActions_action;
    	let div1_class_value;
    	let useActions_action_1;
    	let div2_class_value;
    	let useActions_action_2;
    	let forwardEvents_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[14].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[13], null);

    	let div0_levels = [
    		{
    			class: div0_class_value = "mdc-tab-scroller__scroll-content " + /*scrollContent$class*/ ctx[5]
    		},
    		exclude(prefixFilter(/*$$props*/ ctx[8], "scrollContent$"), ["use", "class"])
    	];

    	let div0_data = {};

    	for (let i = 0; i < div0_levels.length; i += 1) {
    		div0_data = assign(div0_data, div0_levels[i]);
    	}

    	let div1_levels = [
    		{
    			class: div1_class_value = "mdc-tab-scroller__scroll-area " + /*scrollArea$class*/ ctx[3]
    		},
    		exclude(prefixFilter(/*$$props*/ ctx[8], "scrollArea$"), ["use", "class"])
    	];

    	let div1_data = {};

    	for (let i = 0; i < div1_levels.length; i += 1) {
    		div1_data = assign(div1_data, div1_levels[i]);
    	}

    	let div2_levels = [
    		{
    			class: div2_class_value = "mdc-tab-scroller " + /*className*/ ctx[1]
    		},
    		exclude(/*$$props*/ ctx[8], ["use", "class", "scrollArea$", "scrollContent$"])
    	];

    	let div2_data = {};

    	for (let i = 0; i < div2_levels.length; i += 1) {
    		div2_data = assign(div2_data, div2_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div2 = claim_element(nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);
    			div1 = claim_element(div2_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			if (default_slot) default_slot.l(div0_nodes);
    			div0_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			div2_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			set_attributes(div0, div0_data);
    			add_location(div0, file$3, 12, 4, 371);
    			set_attributes(div1, div1_data);
    			add_location(div1, file$3, 7, 2, 188);
    			set_attributes(div2, div2_data);
    			add_location(div2, file$3, 0, 0, 0);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			/*div2_binding*/ ctx[15](div2);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, div0, /*scrollContent$use*/ ctx[4])),
    					action_destroyer(useActions_action_1 = useActions.call(null, div1, /*scrollArea$use*/ ctx[2])),
    					action_destroyer(useActions_action_2 = useActions.call(null, div2, /*use*/ ctx[0])),
    					action_destroyer(forwardEvents_action = /*forwardEvents*/ ctx[7].call(null, div2))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8192) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[13], dirty, null, null);
    				}
    			}

    			set_attributes(div0, div0_data = get_spread_update(div0_levels, [
    				(!current || dirty & /*scrollContent$class*/ 32 && div0_class_value !== (div0_class_value = "mdc-tab-scroller__scroll-content " + /*scrollContent$class*/ ctx[5])) && { class: div0_class_value },
    				dirty & /*$$props*/ 256 && exclude(prefixFilter(/*$$props*/ ctx[8], "scrollContent$"), ["use", "class"])
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*scrollContent$use*/ 16) useActions_action.update.call(null, /*scrollContent$use*/ ctx[4]);

    			set_attributes(div1, div1_data = get_spread_update(div1_levels, [
    				(!current || dirty & /*scrollArea$class*/ 8 && div1_class_value !== (div1_class_value = "mdc-tab-scroller__scroll-area " + /*scrollArea$class*/ ctx[3])) && { class: div1_class_value },
    				dirty & /*$$props*/ 256 && exclude(prefixFilter(/*$$props*/ ctx[8], "scrollArea$"), ["use", "class"])
    			]));

    			if (useActions_action_1 && is_function(useActions_action_1.update) && dirty & /*scrollArea$use*/ 4) useActions_action_1.update.call(null, /*scrollArea$use*/ ctx[2]);

    			set_attributes(div2, div2_data = get_spread_update(div2_levels, [
    				(!current || dirty & /*className*/ 2 && div2_class_value !== (div2_class_value = "mdc-tab-scroller " + /*className*/ ctx[1])) && { class: div2_class_value },
    				dirty & /*$$props*/ 256 && exclude(/*$$props*/ ctx[8], ["use", "class", "scrollArea$", "scrollContent$"])
    			]));

    			if (useActions_action_2 && is_function(useActions_action_2.update) && dirty & /*use*/ 1) useActions_action_2.update.call(null, /*use*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (default_slot) default_slot.d(detaching);
    			/*div2_binding*/ ctx[15](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TabScroller", slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;
    	let { class: className = "" } = $$props;
    	let { scrollArea$use = [] } = $$props;
    	let { scrollArea$class = "" } = $$props;
    	let { scrollContent$use = [] } = $$props;
    	let { scrollContent$class = "" } = $$props;
    	let element;
    	let tabScroller;
    	let instantiate = getContext("SMUI:tab-scroller:instantiate");
    	let getInstance = getContext("SMUI:tab-scroller:getInstance");

    	onMount(async () => {
    		if (instantiate !== false) {
    			tabScroller = new MDCTabScroller(element);
    		} else {
    			tabScroller = await getInstance();
    		}
    	});

    	onDestroy(() => {
    		tabScroller && tabScroller.destroy();
    	});

    	function scrollTo(...args) {
    		return tabScroller.scrollTo(...args);
    	}

    	function incrementScroll(...args) {
    		return tabScroller.incrementScroll(...args);
    	}

    	function getScrollPosition(...args) {
    		return tabScroller.getScrollPosition(...args);
    	}

    	function getScrollContentWidth(...args) {
    		return tabScroller.getScrollContentWidth(...args);
    	}

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(6, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(8, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("use" in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ("class" in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ("scrollArea$use" in $$new_props) $$invalidate(2, scrollArea$use = $$new_props.scrollArea$use);
    		if ("scrollArea$class" in $$new_props) $$invalidate(3, scrollArea$class = $$new_props.scrollArea$class);
    		if ("scrollContent$use" in $$new_props) $$invalidate(4, scrollContent$use = $$new_props.scrollContent$use);
    		if ("scrollContent$class" in $$new_props) $$invalidate(5, scrollContent$class = $$new_props.scrollContent$class);
    		if ("$$scope" in $$new_props) $$invalidate(13, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		MDCTabScroller,
    		onMount,
    		onDestroy,
    		getContext,
    		get_current_component,
    		forwardEventsBuilder,
    		exclude,
    		prefixFilter,
    		useActions,
    		forwardEvents,
    		use,
    		className,
    		scrollArea$use,
    		scrollArea$class,
    		scrollContent$use,
    		scrollContent$class,
    		element,
    		tabScroller,
    		instantiate,
    		getInstance,
    		scrollTo,
    		incrementScroll,
    		getScrollPosition,
    		getScrollContentWidth
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(8, $$props = assign(assign({}, $$props), $$new_props));
    		if ("use" in $$props) $$invalidate(0, use = $$new_props.use);
    		if ("className" in $$props) $$invalidate(1, className = $$new_props.className);
    		if ("scrollArea$use" in $$props) $$invalidate(2, scrollArea$use = $$new_props.scrollArea$use);
    		if ("scrollArea$class" in $$props) $$invalidate(3, scrollArea$class = $$new_props.scrollArea$class);
    		if ("scrollContent$use" in $$props) $$invalidate(4, scrollContent$use = $$new_props.scrollContent$use);
    		if ("scrollContent$class" in $$props) $$invalidate(5, scrollContent$class = $$new_props.scrollContent$class);
    		if ("element" in $$props) $$invalidate(6, element = $$new_props.element);
    		if ("tabScroller" in $$props) tabScroller = $$new_props.tabScroller;
    		if ("instantiate" in $$props) instantiate = $$new_props.instantiate;
    		if ("getInstance" in $$props) getInstance = $$new_props.getInstance;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);

    	return [
    		use,
    		className,
    		scrollArea$use,
    		scrollArea$class,
    		scrollContent$use,
    		scrollContent$class,
    		element,
    		forwardEvents,
    		$$props,
    		scrollTo,
    		incrementScroll,
    		getScrollPosition,
    		getScrollContentWidth,
    		$$scope,
    		slots,
    		div2_binding
    	];
    }

    class TabScroller extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			use: 0,
    			class: 1,
    			scrollArea$use: 2,
    			scrollArea$class: 3,
    			scrollContent$use: 4,
    			scrollContent$class: 5,
    			scrollTo: 9,
    			incrementScroll: 10,
    			getScrollPosition: 11,
    			getScrollContentWidth: 12
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TabScroller",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get use() {
    		throw new Error("<TabScroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<TabScroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<TabScroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<TabScroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scrollArea$use() {
    		throw new Error("<TabScroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scrollArea$use(value) {
    		throw new Error("<TabScroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scrollArea$class() {
    		throw new Error("<TabScroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scrollArea$class(value) {
    		throw new Error("<TabScroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scrollContent$use() {
    		throw new Error("<TabScroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scrollContent$use(value) {
    		throw new Error("<TabScroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scrollContent$class() {
    		throw new Error("<TabScroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scrollContent$class(value) {
    		throw new Error("<TabScroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scrollTo() {
    		return this.$$.ctx[9];
    	}

    	set scrollTo(value) {
    		throw new Error("<TabScroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get incrementScroll() {
    		return this.$$.ctx[10];
    	}

    	set incrementScroll(value) {
    		throw new Error("<TabScroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getScrollPosition() {
    		return this.$$.ctx[11];
    	}

    	set getScrollPosition(value) {
    		throw new Error("<TabScroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getScrollContentWidth() {
    		return this.$$.ctx[12];
    	}

    	set getScrollContentWidth(value) {
    		throw new Error("<TabScroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@smui/tab-bar/TabBar.svelte generated by Svelte v3.31.0 */
    const file$4 = "node_modules/@smui/tab-bar/TabBar.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	child_ctx[30] = i;
    	return child_ctx;
    }

    const get_default_slot_changes = dirty => ({ tab: dirty & /*tabs*/ 4 });
    const get_default_slot_context = ctx => ({ tab: /*tab*/ ctx[28] });

    // (13:4) {#each tabs as tab, i (key(tab))}
    function create_each_block(key_2, ctx) {
    	let first;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[17].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[19], get_default_slot_context);

    	const block = {
    		key: key_2,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (default_slot) default_slot.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			first = empty();
    			if (default_slot) default_slot.l(nodes);
    			this.h();
    		},
    		h: function hydrate() {
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, tabs*/ 524292) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[19], dirty, get_default_slot_changes, get_default_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(13:4) {#each tabs as tab, i (key(tab))}",
    		ctx
    	});

    	return block;
    }

    // (10:2) <TabScroller     {...prefixFilter($$props, 'tabScroller$')}   >
    function create_default_slot$1(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = /*tabs*/ ctx[2];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*key*/ ctx[3](/*tab*/ ctx[28]);
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(nodes);
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$$scope, tabs, key*/ 524300) {
    				const each_value = /*tabs*/ ctx[2];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block, each_1_anchor, get_each_context);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(10:2) <TabScroller     {...prefixFilter($$props, 'tabScroller$')}   >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div;
    	let tabscroller;
    	let div_class_value;
    	let useActions_action;
    	let forwardEvents_action;
    	let current;
    	let mounted;
    	let dispose;
    	const tabscroller_spread_levels = [prefixFilter(/*$$props*/ ctx[7], "tabScroller$")];

    	let tabscroller_props = {
    		$$slots: { default: [create_default_slot$1] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < tabscroller_spread_levels.length; i += 1) {
    		tabscroller_props = assign(tabscroller_props, tabscroller_spread_levels[i]);
    	}

    	tabscroller = new TabScroller({ props: tabscroller_props, $$inline: true });

    	let div_levels = [
    		{
    			class: div_class_value = "mdc-tab-bar " + /*className*/ ctx[1]
    		},
    		{ role: "tablist" },
    		exclude(/*$$props*/ ctx[7], [
    			"use",
    			"class",
    			"tabs",
    			"key",
    			"focusOnActivate",
    			"useAutomaticActivation",
    			"activeIndex",
    			"tabScroller$"
    		])
    	];

    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(tabscroller.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true, role: true });
    			var div_nodes = children(div);
    			claim_component(tabscroller.$$.fragment, div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			set_attributes(div, div_data);
    			add_location(div, file$4, 0, 0, 0);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(tabscroller, div, null);
    			/*div_binding*/ ctx[18](div);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, div, /*use*/ ctx[0])),
    					action_destroyer(forwardEvents_action = /*forwardEvents*/ ctx[5].call(null, div)),
    					listen_dev(div, "MDCTabBar:activated", /*activatedHandler*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const tabscroller_changes = (dirty & /*prefixFilter, $$props*/ 128)
    			? get_spread_update(tabscroller_spread_levels, [get_spread_object(prefixFilter(/*$$props*/ ctx[7], "tabScroller$"))])
    			: {};

    			if (dirty & /*$$scope, tabs*/ 524292) {
    				tabscroller_changes.$$scope = { dirty, ctx };
    			}

    			tabscroller.$set(tabscroller_changes);

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				(!current || dirty & /*className*/ 2 && div_class_value !== (div_class_value = "mdc-tab-bar " + /*className*/ ctx[1])) && { class: div_class_value },
    				{ role: "tablist" },
    				dirty & /*$$props*/ 128 && exclude(/*$$props*/ ctx[7], [
    					"use",
    					"class",
    					"tabs",
    					"key",
    					"focusOnActivate",
    					"useAutomaticActivation",
    					"activeIndex",
    					"tabScroller$"
    				])
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabscroller.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabscroller.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(tabscroller);
    			/*div_binding*/ ctx[18](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TabBar", slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(get_current_component(), ["MDCTabBar:activated"]);

    	let uninitializedValue = () => {
    		
    	};

    	let { use = [] } = $$props;
    	let { class: className = "" } = $$props;
    	let { tabs = [] } = $$props;
    	let { key = tab => tab } = $$props;
    	let { focusOnActivate = true } = $$props;
    	let { useAutomaticActivation = true } = $$props;
    	let { activeIndex = uninitializedValue } = $$props;
    	let { active = uninitializedValue } = $$props;

    	if (activeIndex === uninitializedValue && active === uninitializedValue) {
    		activeIndex = 0;
    		active = tabs[0];
    	} else if (activeIndex === uninitializedValue) {
    		activeIndex = tabs.indexOf(active);
    	} else if (active === uninitializedValue) {
    		active = tabs[activeIndex];
    	}

    	let element;
    	let tabBar;
    	let tabScrollerPromiseResolve;
    	let tabScrollerPromise = new Promise(resolve => tabScrollerPromiseResolve = resolve);
    	let tabPromiseResolve = [];
    	let tabPromise = tabs.map((tab, i) => new Promise(resolve => tabPromiseResolve[i] = resolve));
    	setContext("SMUI:tab-scroller:instantiate", false);
    	setContext("SMUI:tab-scroller:getInstance", getTabScrollerInstancePromise);
    	setContext("SMUI:tab:instantiate", false);
    	setContext("SMUI:tab:getInstance", getTabInstancePromise);
    	setContext("SMUI:tab:active", active);
    	let previousActiveIndex = activeIndex;
    	let previousActive = active;

    	onMount(() => {
    		$$invalidate(14, tabBar = new MDCTabBar(element));
    		tabScrollerPromiseResolve(tabBar.tabScroller_);

    		for (let i = 0; i < tabs.length; i++) {
    			tabPromiseResolve[i](tabBar.tabList_[i]);
    		}
    	});

    	onDestroy(() => {
    		tabBar && tabBar.destroy();
    	});

    	function getTabScrollerInstancePromise() {
    		return tabScrollerPromise;
    	}

    	function getTabInstancePromise(tabEntry) {
    		return tabPromise[tabs.indexOf(tabEntry)];
    	}

    	function updateIndexAfterActivate(index) {
    		$$invalidate(8, activeIndex = index);
    		$$invalidate(15, previousActiveIndex = index);
    		$$invalidate(9, active = tabs[index]);
    		$$invalidate(16, previousActive = tabs[index]);
    	}

    	function activatedHandler(e) {
    		updateIndexAfterActivate(e.detail.index);
    	}

    	function activateTab(index, ...args) {
    		updateIndexAfterActivate(index);
    		return tabBar.activateTab(index, ...args);
    	}

    	function scrollIntoView(...args) {
    		return tabBar.scrollIntoView(...args);
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(4, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(7, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("use" in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ("class" in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ("tabs" in $$new_props) $$invalidate(2, tabs = $$new_props.tabs);
    		if ("key" in $$new_props) $$invalidate(3, key = $$new_props.key);
    		if ("focusOnActivate" in $$new_props) $$invalidate(10, focusOnActivate = $$new_props.focusOnActivate);
    		if ("useAutomaticActivation" in $$new_props) $$invalidate(11, useAutomaticActivation = $$new_props.useAutomaticActivation);
    		if ("activeIndex" in $$new_props) $$invalidate(8, activeIndex = $$new_props.activeIndex);
    		if ("active" in $$new_props) $$invalidate(9, active = $$new_props.active);
    		if ("$$scope" in $$new_props) $$invalidate(19, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		MDCTabBar,
    		onMount,
    		onDestroy,
    		setContext,
    		get_current_component,
    		forwardEventsBuilder,
    		exclude,
    		prefixFilter,
    		useActions,
    		TabScroller,
    		forwardEvents,
    		uninitializedValue,
    		use,
    		className,
    		tabs,
    		key,
    		focusOnActivate,
    		useAutomaticActivation,
    		activeIndex,
    		active,
    		element,
    		tabBar,
    		tabScrollerPromiseResolve,
    		tabScrollerPromise,
    		tabPromiseResolve,
    		tabPromise,
    		previousActiveIndex,
    		previousActive,
    		getTabScrollerInstancePromise,
    		getTabInstancePromise,
    		updateIndexAfterActivate,
    		activatedHandler,
    		activateTab,
    		scrollIntoView
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(7, $$props = assign(assign({}, $$props), $$new_props));
    		if ("uninitializedValue" in $$props) uninitializedValue = $$new_props.uninitializedValue;
    		if ("use" in $$props) $$invalidate(0, use = $$new_props.use);
    		if ("className" in $$props) $$invalidate(1, className = $$new_props.className);
    		if ("tabs" in $$props) $$invalidate(2, tabs = $$new_props.tabs);
    		if ("key" in $$props) $$invalidate(3, key = $$new_props.key);
    		if ("focusOnActivate" in $$props) $$invalidate(10, focusOnActivate = $$new_props.focusOnActivate);
    		if ("useAutomaticActivation" in $$props) $$invalidate(11, useAutomaticActivation = $$new_props.useAutomaticActivation);
    		if ("activeIndex" in $$props) $$invalidate(8, activeIndex = $$new_props.activeIndex);
    		if ("active" in $$props) $$invalidate(9, active = $$new_props.active);
    		if ("element" in $$props) $$invalidate(4, element = $$new_props.element);
    		if ("tabBar" in $$props) $$invalidate(14, tabBar = $$new_props.tabBar);
    		if ("tabScrollerPromiseResolve" in $$props) tabScrollerPromiseResolve = $$new_props.tabScrollerPromiseResolve;
    		if ("tabScrollerPromise" in $$props) tabScrollerPromise = $$new_props.tabScrollerPromise;
    		if ("tabPromiseResolve" in $$props) tabPromiseResolve = $$new_props.tabPromiseResolve;
    		if ("tabPromise" in $$props) tabPromise = $$new_props.tabPromise;
    		if ("previousActiveIndex" in $$props) $$invalidate(15, previousActiveIndex = $$new_props.previousActiveIndex);
    		if ("previousActive" in $$props) $$invalidate(16, previousActive = $$new_props.previousActive);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*tabBar, focusOnActivate*/ 17408) {
    			 if (tabBar) {
    				$$invalidate(14, tabBar.focusOnActivate = focusOnActivate, tabBar);
    			}
    		}

    		if ($$self.$$.dirty & /*tabBar, useAutomaticActivation*/ 18432) {
    			 if (tabBar) {
    				$$invalidate(14, tabBar.useAutomaticActivation = useAutomaticActivation, tabBar);
    			}
    		}

    		if ($$self.$$.dirty & /*tabBar, tabs, activeIndex*/ 16644) {
    			 if (tabBar) {
    				$$invalidate(9, active = tabs[activeIndex]);
    			}
    		}

    		if ($$self.$$.dirty & /*tabBar, previousActiveIndex, activeIndex*/ 49408) {
    			 if (tabBar && previousActiveIndex !== activeIndex) {
    				activateTab(activeIndex);
    			}
    		}

    		if ($$self.$$.dirty & /*tabBar, previousActive, active, tabs*/ 82436) {
    			 if (tabBar && previousActive !== active) {
    				activateTab(tabs.indexOf(active));
    			}
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		use,
    		className,
    		tabs,
    		key,
    		element,
    		forwardEvents,
    		activatedHandler,
    		$$props,
    		activeIndex,
    		active,
    		focusOnActivate,
    		useAutomaticActivation,
    		activateTab,
    		scrollIntoView,
    		tabBar,
    		previousActiveIndex,
    		previousActive,
    		slots,
    		div_binding,
    		$$scope
    	];
    }

    class TabBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			use: 0,
    			class: 1,
    			tabs: 2,
    			key: 3,
    			focusOnActivate: 10,
    			useAutomaticActivation: 11,
    			activeIndex: 8,
    			active: 9,
    			activateTab: 12,
    			scrollIntoView: 13
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TabBar",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get use() {
    		throw new Error("<TabBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<TabBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<TabBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<TabBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tabs() {
    		throw new Error("<TabBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tabs(value) {
    		throw new Error("<TabBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get key() {
    		throw new Error("<TabBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<TabBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focusOnActivate() {
    		throw new Error("<TabBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focusOnActivate(value) {
    		throw new Error("<TabBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get useAutomaticActivation() {
    		throw new Error("<TabBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set useAutomaticActivation(value) {
    		throw new Error("<TabBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeIndex() {
    		throw new Error("<TabBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeIndex(value) {
    		throw new Error("<TabBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<TabBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<TabBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activateTab() {
    		return this.$$.ctx[12];
    	}

    	set activateTab(value) {
    		throw new Error("<TabBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scrollIntoView() {
    		return this.$$.ctx[13];
    	}

    	set scrollIntoView(value) {
    		throw new Error("<TabBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function cubicInOut(t) {
        return t < 0.5 ? 4.0 * t * t * t : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;
    }
    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function blur(node, { delay = 0, duration = 400, easing = cubicInOut, amount = 5, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const f = style.filter === 'none' ? '' : style.filter;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `opacity: ${target_opacity - (od * u)}; filter: ${f} blur(${u * amount}px);`
        };
    }
    function slide(node, { delay = 0, duration = 400, easing = cubicOut }) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => 'overflow: hidden;' +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }

    /* src/components/Introduction.svelte generated by Svelte v3.31.0 */
    const file$5 = "src/components/Introduction.svelte";

    function add_css() {
    	var style = element("style");
    	style.id = "svelte-33s6pk-style";
    	style.textContent = ".headshot.svelte-33s6pk{max-width:600px;filter:grayscale(70%)}.headshot-container.svelte-33s6pk{text-align:center;margin:3em 0}h3.svelte-33s6pk{font-size:3em;font-weight:400;text-align:right;margin:0}p.svelte-33s6pk{font-size:2em;text-align:justify;hyphens:auto;-webkit-hyphens:auto;-ms-hyphens:auto}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW50cm9kdWN0aW9uLnN2ZWx0ZSIsInNvdXJjZXMiOlsiSW50cm9kdWN0aW9uLnN2ZWx0ZSJdLCJzb3VyY2VzQ29udGVudCI6WyI8c2NyaXB0PlxuICAgIGltcG9ydCB7Ymx1cn0gZnJvbSAnc3ZlbHRlL3RyYW5zaXRpb24nXG4gICAgZXhwb3J0IGxldCBzZXRBY3RpdmU7XG48L3NjcmlwdD5cblxuPHN0eWxlPlxuICAgIC5oZWFkc2hvdCB7XG4gICAgICAgIG1heC13aWR0aDogNjAwcHg7XG4gICAgICAgIGZpbHRlcjogZ3JheXNjYWxlKDcwJSk7XG4gICAgfVxuICAgIC5oZWFkc2hvdC1jb250YWluZXIge1xuICAgICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgICAgIG1hcmdpbjogM2VtIDA7XG4gICAgfVxuXG4gICAgaDMge1xuICAgICAgICBmb250LXNpemU6IDNlbTtcbiAgICAgICAgZm9udC13ZWlnaHQ6IDQwMDtcbiAgICAgICAgdGV4dC1hbGlnbjogcmlnaHQ7XG4gICAgICAgIG1hcmdpbjogMDtcbiAgICB9XG5cbiAgICBwIHtcbiAgICAgICAgZm9udC1zaXplOiAyZW07XG4gICAgICAgIHRleHQtYWxpZ246IGp1c3RpZnk7XG4gICAgICAgIGh5cGhlbnM6IGF1dG87XG4gICAgICAgIC13ZWJraXQtaHlwaGVuczogYXV0bztcbiAgICAgICAgLW1zLWh5cGhlbnM6IGF1dG87XG4gICAgfVxuPC9zdHlsZT5cblxuPGRpdiB0cmFuc2l0aW9uOmJsdXI9e3tkdXJhdGlvbjogNzAwLCBhbW91bnQ6IDIwfX0gb246b3V0cm9lbmQ9e3NldEFjdGl2ZX0+XG4gICAgPGgzPlxuICAgIGhpLCBpJ20gYnJ5c29uXG4gICAgPC9oMz5cblxuICAgIDxkaXYgY2xhc3M9e1wiaGVhZHNob3QtY29udGFpbmVyXCJ9PlxuICAgICAgICA8aW1nIFxuICAgICAgICAgICAgY2xhc3M9e1wiaGVhZHNob3RcIn1cbiAgICAgICAgICAgIHN0eWxlPXtcImJvcmRlci1yYWRpdXM6IDUwJTtcIn1cbiAgICAgICAgICAgIHNyYz17XCJpbWFnZXMvbWVfcHJvZmVzc2lvbmFsLmpwZ1wifSBcbiAgICAgICAgICAgIGFsdD17J2EgbmljZSBwaWMgb2YgbWUnfSBcbiAgICAgICAgICAgIHdpZHRoPXtcIjEwMCVcIn1cbiAgICAgICAgPlxuICAgIDwvZGl2PlxuXG4gICAgPHA+XG4gICAgICAgIGkgYW0gYSBzb2Z0JnNoeTt3YXJlIGRldmUmc2h5O2xvcGVyIGJhc2VkIGluIDxlbT5icm9va2x5biwgbmV3IHlvcms8L2VtPiB3aXRoIGEgcHJpbWFyeSBiYWNrJnNoeTtncm91bmQgaW4gdmlkZW8mc2h5O2dhbWUgZGV2ZWxvcCZzaHk7bWVudCwgYnV0IGkgYW0gbm8gc3RyYW5nZXIgdG8gZnJvbnQtIGFuZCBiYWNrLWVuZCB3ZWIgYW5kIGFwcGxpY2Emc2h5O3Rpb24gZGV2ZWxvcCZzaHk7bWVudC4gXG4gICAgICAgIG15IDxlbT5jb21wdXRlciBzY2llbmNlPC9lbT4gY291cnNlJnNoeTt3b3JrIGF0IDxlbT53ZXNsZXlhbiB1bml2ZXJzaXR5PC9lbT4gcHJvdmlkZWQgbWUgd2l0aCBhIHN0cm9uZyB0aGVvcmUmc2h5O3RpY2FsIGJhY2smc2h5O2dyb3VuZCB3aGlsZSBpIGhhdmUgbGVhcm5lZCBob3cgdG8gcXVpY2tseSBncmFzcCBhbmQgYWRhcHQgbmV3IHRlY2hubyZzaHk7bG9naWVzIGluIG15IHZhcmlvdXMgcHJvamVjdHMgYWxvbmcgdGhlIHdheS4gXG4gICAgICAgIGkgaGF2ZSBiZWVuIHVzaW5nIDxlbT51bml0eTwvZW0+IGZvciBnYW1lIGFuZCBhcHAgZGV2ZWxvcCZzaHk7bWVudCBmb3IgdGhyZWUgeWVhcnMgbm93LCB3aGlsZVxuICAgICAgICBpbiB0aGUgcmVhbG0gb2Ygd2ViIGRldmVsb3Amc2h5O21lbnQsIGkgd29yayBpbiB0aGUgPGVtPm5vZGUuanM8L2VtPiBlY28mc2h5O3N5c3RlbSB3aXRoIDxlbT5yZWFjdDwvZW0+IGFuZCwgcmVjZW50bHksIDxlbT5zdmVsdGU8L2VtPiBhcyBteSBmcm9udC1lbmQgdG9vbHMgb2YgY2hvaWNlLlxuICAgICAgICB0ZWNobm8mc2h5O2xvZ2llcyB0aGF0IGV4Y2l0ZSBtZSB0aGUgbW9zdCBhcmUgdGhvc2UgdGhhdCBpbnRlciZzaHk7c2VjdCB3aXRoIGFuZCBzdGltdWxhdGUgY3JlYSZzaHk7dGl2aXR5IGluIG5vdmVsIGFuZCBpbnNwaSZzaHk7cmluZyB3YXlzLFxuICAgICAgICBhbmQgaSBhbSBhbHdheXMgb24gdGhlIGxvb2smc2h5O291dCBmb3IgZW1lcmdpbmcgdG9vbHMgdG8gYWNjb20mc2h5O3BsaXNoIG5ldyB0YXNrcy5cbiAgICA8L3A+XG5cbiAgICA8cD5cbiAgICAgICAgaW4gbXkgbGlmZSBvdXQmc2h5O3NpZGUgb2Ygc29mdCZzaHk7d2FyZSBkZXZlbG9wJnNoeTttZW50LCBpIGZpbmQgZnVsZmlsbCZzaHk7bWVudCBpbiBtYW55IGNyZWEmc2h5O3RpdmUgcHVyJnNoeTtzdWl0cy4gbXVzaWMgcHJvZCZzaHk7dWN0aW9uLCBwaG90byZzaHk7Z3JhcGh5LCBncmFwaGljIGRlc2lnbiBhcmUganVzdCBhIGZldyBvZiBteSBtYW55IGhvYmJpZXMgdGhhdCBrZWVwIG1lIGJ1c3kuIFxuICAgICAgICBib3RoIGluIG15IGNhcmVlciBhbmQgaW4gbXkgbGlmZSwgaSBtb3N0IHZhbHVlIGNyZWEmc2h5O3Rpdml0eSwgY2xhciZzaHk7aXR5LCBkZXBlbmQmc2h5O2FiaWxpdHksIGFuZCBhdXRoZW4mc2h5O3RpY2l0eSwgYW5kIGkgaG9wZSB3aXRoIGV2ZXJ5IGRlJnNoeTtjaXNpb24gaSBtYWtlIHRvIGxlYXZlIHRoZSB3b3JsZCBhbmQgdGhlIHdlYiBhIG1vcmUgYmVhdSZzaHk7dGlmdWwgcGxhY2UuXG4gICAgPC9wPlxuPC9kaXY+Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU1JLFNBQVMsY0FBQyxDQUFDLEFBQ1AsU0FBUyxDQUFFLEtBQUssQ0FDaEIsTUFBTSxDQUFFLFVBQVUsR0FBRyxDQUFDLEFBQzFCLENBQUMsQUFDRCxtQkFBbUIsY0FBQyxDQUFDLEFBQ2pCLFVBQVUsQ0FBRSxNQUFNLENBQ2xCLE1BQU0sQ0FBRSxHQUFHLENBQUMsQ0FBQyxBQUNqQixDQUFDLEFBRUQsRUFBRSxjQUFDLENBQUMsQUFDQSxTQUFTLENBQUUsR0FBRyxDQUNkLFdBQVcsQ0FBRSxHQUFHLENBQ2hCLFVBQVUsQ0FBRSxLQUFLLENBQ2pCLE1BQU0sQ0FBRSxDQUFDLEFBQ2IsQ0FBQyxBQUVELENBQUMsY0FBQyxDQUFDLEFBQ0MsU0FBUyxDQUFFLEdBQUcsQ0FDZCxVQUFVLENBQUUsT0FBTyxDQUNuQixPQUFPLENBQUUsSUFBSSxDQUNiLGVBQWUsQ0FBRSxJQUFJLENBQ3JCLFdBQVcsQ0FBRSxJQUFJLEFBQ3JCLENBQUMifQ== */";
    	append_dev(document.head, style);
    }

    function create_fragment$5(ctx) {
    	let div1;
    	let h3;
    	let t0;
    	let t1;
    	let div0;
    	let img;
    	let img_class_value;
    	let img_style_value;
    	let img_src_value;
    	let img_alt_value;
    	let img_width_value;
    	let div0_class_value;
    	let t2;
    	let p0;
    	let t3;
    	let em0;
    	let t4;
    	let t5;
    	let em1;
    	let t6;
    	let t7;
    	let em2;
    	let t8;
    	let t9;
    	let em3;
    	let t10;
    	let t11;
    	let em4;
    	let t12;
    	let t13;
    	let em5;
    	let t14;
    	let t15;
    	let em6;
    	let t16;
    	let t17;
    	let t18;
    	let p1;
    	let t19;
    	let div1_transition;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h3 = element("h3");
    			t0 = text("hi, i'm bryson");
    			t1 = space();
    			div0 = element("div");
    			img = element("img");
    			t2 = space();
    			p0 = element("p");
    			t3 = text("i am a soft­ware deve­loper based in ");
    			em0 = element("em");
    			t4 = text("brooklyn, new york");
    			t5 = text(" with a primary back­ground in video­game develop­ment, but i am no stranger to front- and back-end web and applica­tion develop­ment. \n        my ");
    			em1 = element("em");
    			t6 = text("computer science");
    			t7 = text(" course­work at ");
    			em2 = element("em");
    			t8 = text("wesleyan university");
    			t9 = text(" provided me with a strong theore­tical back­ground while i have learned how to quickly grasp and adapt new techno­logies in my various projects along the way. \n        i have been using ");
    			em3 = element("em");
    			t10 = text("unity");
    			t11 = text(" for game and app develop­ment for three years now, while\n        in the realm of web develop­ment, i work in the ");
    			em4 = element("em");
    			t12 = text("node.js");
    			t13 = text(" eco­system with ");
    			em5 = element("em");
    			t14 = text("react");
    			t15 = text(" and, recently, ");
    			em6 = element("em");
    			t16 = text("svelte");
    			t17 = text(" as my front-end tools of choice.\n        techno­logies that excite me the most are those that inter­sect with and stimulate crea­tivity in novel and inspi­ring ways,\n        and i am always on the look­out for emerging tools to accom­plish new tasks.");
    			t18 = space();
    			p1 = element("p");
    			t19 = text("in my life out­side of soft­ware develop­ment, i find fulfill­ment in many crea­tive pur­suits. music prod­uction, photo­graphy, graphic design are just a few of my many hobbies that keep me busy. \n        both in my career and in my life, i most value crea­tivity, clar­ity, depend­ability, and authen­ticity, and i hope with every de­cision i make to leave the world and the web a more beau­tiful place.");
    			this.h();
    		},
    		l: function claim(nodes) {
    			div1 = claim_element(nodes, "DIV", {});
    			var div1_nodes = children(div1);
    			h3 = claim_element(div1_nodes, "H3", { class: true });
    			var h3_nodes = children(h3);
    			t0 = claim_text(h3_nodes, "hi, i'm bryson");
    			h3_nodes.forEach(detach_dev);
    			t1 = claim_space(div1_nodes);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);

    			img = claim_element(div0_nodes, "IMG", {
    				class: true,
    				style: true,
    				src: true,
    				alt: true,
    				width: true
    			});

    			div0_nodes.forEach(detach_dev);
    			t2 = claim_space(div1_nodes);
    			p0 = claim_element(div1_nodes, "P", { class: true });
    			var p0_nodes = children(p0);
    			t3 = claim_text(p0_nodes, "i am a soft­ware deve­loper based in ");
    			em0 = claim_element(p0_nodes, "EM", {});
    			var em0_nodes = children(em0);
    			t4 = claim_text(em0_nodes, "brooklyn, new york");
    			em0_nodes.forEach(detach_dev);
    			t5 = claim_text(p0_nodes, " with a primary back­ground in video­game develop­ment, but i am no stranger to front- and back-end web and applica­tion develop­ment. \n        my ");
    			em1 = claim_element(p0_nodes, "EM", {});
    			var em1_nodes = children(em1);
    			t6 = claim_text(em1_nodes, "computer science");
    			em1_nodes.forEach(detach_dev);
    			t7 = claim_text(p0_nodes, " course­work at ");
    			em2 = claim_element(p0_nodes, "EM", {});
    			var em2_nodes = children(em2);
    			t8 = claim_text(em2_nodes, "wesleyan university");
    			em2_nodes.forEach(detach_dev);
    			t9 = claim_text(p0_nodes, " provided me with a strong theore­tical back­ground while i have learned how to quickly grasp and adapt new techno­logies in my various projects along the way. \n        i have been using ");
    			em3 = claim_element(p0_nodes, "EM", {});
    			var em3_nodes = children(em3);
    			t10 = claim_text(em3_nodes, "unity");
    			em3_nodes.forEach(detach_dev);
    			t11 = claim_text(p0_nodes, " for game and app develop­ment for three years now, while\n        in the realm of web develop­ment, i work in the ");
    			em4 = claim_element(p0_nodes, "EM", {});
    			var em4_nodes = children(em4);
    			t12 = claim_text(em4_nodes, "node.js");
    			em4_nodes.forEach(detach_dev);
    			t13 = claim_text(p0_nodes, " eco­system with ");
    			em5 = claim_element(p0_nodes, "EM", {});
    			var em5_nodes = children(em5);
    			t14 = claim_text(em5_nodes, "react");
    			em5_nodes.forEach(detach_dev);
    			t15 = claim_text(p0_nodes, " and, recently, ");
    			em6 = claim_element(p0_nodes, "EM", {});
    			var em6_nodes = children(em6);
    			t16 = claim_text(em6_nodes, "svelte");
    			em6_nodes.forEach(detach_dev);
    			t17 = claim_text(p0_nodes, " as my front-end tools of choice.\n        techno­logies that excite me the most are those that inter­sect with and stimulate crea­tivity in novel and inspi­ring ways,\n        and i am always on the look­out for emerging tools to accom­plish new tasks.");
    			p0_nodes.forEach(detach_dev);
    			t18 = claim_space(div1_nodes);
    			p1 = claim_element(div1_nodes, "P", { class: true });
    			var p1_nodes = children(p1);
    			t19 = claim_text(p1_nodes, "in my life out­side of soft­ware develop­ment, i find fulfill­ment in many crea­tive pur­suits. music prod­uction, photo­graphy, graphic design are just a few of my many hobbies that keep me busy. \n        both in my career and in my life, i most value crea­tivity, clar­ity, depend­ability, and authen­ticity, and i hope with every de­cision i make to leave the world and the web a more beau­tiful place.");
    			p1_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h3, "class", "svelte-33s6pk");
    			add_location(h3, file$5, 32, 4, 611);
    			attr_dev(img, "class", img_class_value = "" + (null_to_empty("headshot") + " svelte-33s6pk"));
    			attr_dev(img, "style", img_style_value = "border-radius: 50%;");
    			if (img.src !== (img_src_value = "images/me_professional.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = "a nice pic of me");
    			attr_dev(img, "width", img_width_value = "100%");
    			add_location(img, file$5, 37, 8, 693);
    			attr_dev(div0, "class", div0_class_value = "" + (null_to_empty("headshot-container") + " svelte-33s6pk"));
    			add_location(div0, file$5, 36, 4, 650);
    			add_location(em0, file$5, 47, 53, 968);
    			add_location(em1, file$5, 48, 11, 1162);
    			add_location(em2, file$5, 48, 56, 1207);
    			add_location(em3, file$5, 49, 26, 1434);
    			add_location(em4, file$5, 50, 60, 1570);
    			add_location(em5, file$5, 50, 97, 1607);
    			add_location(em6, file$5, 50, 127, 1637);
    			attr_dev(p0, "class", "svelte-33s6pk");
    			add_location(p0, file$5, 46, 4, 911);
    			attr_dev(p1, "class", "svelte-33s6pk");
    			add_location(p1, file$5, 55, 4, 1942);
    			add_location(div1, file$5, 31, 0, 531);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h3);
    			append_dev(h3, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			append_dev(div1, t2);
    			append_dev(div1, p0);
    			append_dev(p0, t3);
    			append_dev(p0, em0);
    			append_dev(em0, t4);
    			append_dev(p0, t5);
    			append_dev(p0, em1);
    			append_dev(em1, t6);
    			append_dev(p0, t7);
    			append_dev(p0, em2);
    			append_dev(em2, t8);
    			append_dev(p0, t9);
    			append_dev(p0, em3);
    			append_dev(em3, t10);
    			append_dev(p0, t11);
    			append_dev(p0, em4);
    			append_dev(em4, t12);
    			append_dev(p0, t13);
    			append_dev(p0, em5);
    			append_dev(em5, t14);
    			append_dev(p0, t15);
    			append_dev(p0, em6);
    			append_dev(em6, t16);
    			append_dev(p0, t17);
    			append_dev(div1, t18);
    			append_dev(div1, p1);
    			append_dev(p1, t19);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(
    					div1,
    					"outroend",
    					function () {
    						if (is_function(/*setActive*/ ctx[0])) /*setActive*/ ctx[0].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, blur, { duration: 700, amount: 20 }, true);
    				div1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, blur, { duration: 700, amount: 20 }, false);
    			div1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching && div1_transition) div1_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Introduction", slots, []);
    	let { setActive } = $$props;
    	const writable_props = ["setActive"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Introduction> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("setActive" in $$props) $$invalidate(0, setActive = $$props.setActive);
    	};

    	$$self.$capture_state = () => ({ blur, setActive });

    	$$self.$inject_state = $$props => {
    		if ("setActive" in $$props) $$invalidate(0, setActive = $$props.setActive);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [setActive];
    }

    class Introduction extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-33s6pk-style")) add_css();
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { setActive: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Introduction",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*setActive*/ ctx[0] === undefined && !("setActive" in props)) {
    			console.warn("<Introduction> was created without expected prop 'setActive'");
    		}
    	}

    	get setActive() {
    		throw new Error("<Introduction>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set setActive(value) {
    		throw new Error("<Introduction>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Resume.svelte generated by Svelte v3.31.0 */
    const file$6 = "src/components/Resume.svelte";

    function add_css$1() {
    	var style = element("style");
    	style.id = "svelte-ev62fq-style";
    	style.textContent = "h3.svelte-ev62fq{font-size:3rem;font-weight:400;text-align:right;margin:0;margin-bottom:1em}p.svelte-ev62fq{font-size:2em}.resume-container.svelte-ev62fq{width:100%;text-align:center}.resume-img.svelte-ev62fq{max-width:100%;margin-left:auto;margin-right:auto;box-shadow:0.25em 0.25em 0.5em #6300ee}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzdW1lLnN2ZWx0ZSIsInNvdXJjZXMiOlsiUmVzdW1lLnN2ZWx0ZSJdLCJzb3VyY2VzQ29udGVudCI6WyI8c2NyaXB0PlxuICAgIGltcG9ydCB7Ymx1cn0gZnJvbSAnc3ZlbHRlL3RyYW5zaXRpb24nXG4gICAgZXhwb3J0IGxldCBzZXRBY3RpdmU7XG48L3NjcmlwdD5cblxuPHN0eWxlPlxuICAgIGgzIHtcbiAgICAgICAgZm9udC1zaXplOiAzcmVtO1xuICAgICAgICBmb250LXdlaWdodDogNDAwO1xuICAgICAgICB0ZXh0LWFsaWduOiByaWdodDtcbiAgICAgICAgbWFyZ2luOiAwO1xuICAgICAgICBtYXJnaW4tYm90dG9tOiAxZW07XG4gICAgfVxuICAgIHAge1xuICAgICAgICBmb250LXNpemU6IDJlbTtcbiAgICB9XG4gICAgLnJlc3VtZS1jb250YWluZXIge1xuICAgICAgICB3aWR0aDogMTAwJTtcbiAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgIH1cbiAgICAucmVzdW1lLWltZyB7XG4gICAgICAgIG1heC13aWR0aDogMTAwJTtcbiAgICAgICAgLyogbWluLXdpZHRoOiA0MDBweDsgKi9cbiAgICAgICAgbWFyZ2luLWxlZnQ6IGF1dG87XG4gICAgICAgIG1hcmdpbi1yaWdodDogYXV0bztcbiAgICAgICAgYm94LXNoYWRvdzogMC4yNWVtIDAuMjVlbSAwLjVlbSAjNjMwMGVlO1xuICAgIH1cbjwvc3R5bGU+XG5cbjxkaXYgdHJhbnNpdGlvbjpibHVyPXt7ZHVyYXRpb246IDcwMCwgYW1vdW50OiAyMH19IG9uOm91dHJvZW5kPXtzZXRBY3RpdmV9PlxuICAgIDxoMz5cbiAgICAgICAgaGF2ZSBhIGxvb2sgYXQgbXkgcmVzdW1lXG4gICAgPC9oMz5cblxuICAgIDxkaXYgY2xhc3M9e1wicmVzdW1lLWNvbnRhaW5lclwifT5cbiAgICAgICAgPGltZyBjbGFzcz17XCJyZXN1bWUtaW1nXCJ9IHNyYz17XCJpbWFnZXMvcmVzdW1lLnBuZ1wifSBhbHQ9e1wibXkgcmVzdW1lXCJ9PlxuICAgICAgICA8cD5cbiAgICAgICAgICAgIDxhIGRvd25sb2FkPVwiYnJ5c29uLWRhdmlzLXJlc3VtZS5wbmdcIiBocmVmPVwiaW1hZ2VzL3Jlc3VtZS5wbmdcIj5cbiAgICAgICAgICAgICAgICBkb3dubG9hZFxuICAgICAgICAgICAgPC9hPlxuICAgICAgICA8L3A+ICAgIFxuICAgIDwvZGl2PlxuXG48L2Rpdj4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBTUksRUFBRSxjQUFDLENBQUMsQUFDQSxTQUFTLENBQUUsSUFBSSxDQUNmLFdBQVcsQ0FBRSxHQUFHLENBQ2hCLFVBQVUsQ0FBRSxLQUFLLENBQ2pCLE1BQU0sQ0FBRSxDQUFDLENBQ1QsYUFBYSxDQUFFLEdBQUcsQUFDdEIsQ0FBQyxBQUNELENBQUMsY0FBQyxDQUFDLEFBQ0MsU0FBUyxDQUFFLEdBQUcsQUFDbEIsQ0FBQyxBQUNELGlCQUFpQixjQUFDLENBQUMsQUFDZixLQUFLLENBQUUsSUFBSSxDQUNYLFVBQVUsQ0FBRSxNQUFNLEFBQ3RCLENBQUMsQUFDRCxXQUFXLGNBQUMsQ0FBQyxBQUNULFNBQVMsQ0FBRSxJQUFJLENBRWYsV0FBVyxDQUFFLElBQUksQ0FDakIsWUFBWSxDQUFFLElBQUksQ0FDbEIsVUFBVSxDQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQUFDM0MsQ0FBQyJ9 */";
    	append_dev(document.head, style);
    }

    function create_fragment$6(ctx) {
    	let div1;
    	let h3;
    	let t0;
    	let t1;
    	let div0;
    	let img;
    	let img_class_value;
    	let img_src_value;
    	let img_alt_value;
    	let t2;
    	let p;
    	let a;
    	let t3;
    	let div0_class_value;
    	let div1_transition;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h3 = element("h3");
    			t0 = text("have a look at my resume");
    			t1 = space();
    			div0 = element("div");
    			img = element("img");
    			t2 = space();
    			p = element("p");
    			a = element("a");
    			t3 = text("download");
    			this.h();
    		},
    		l: function claim(nodes) {
    			div1 = claim_element(nodes, "DIV", {});
    			var div1_nodes = children(div1);
    			h3 = claim_element(div1_nodes, "H3", { class: true });
    			var h3_nodes = children(h3);
    			t0 = claim_text(h3_nodes, "have a look at my resume");
    			h3_nodes.forEach(detach_dev);
    			t1 = claim_space(div1_nodes);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			img = claim_element(div0_nodes, "IMG", { class: true, src: true, alt: true });
    			t2 = claim_space(div0_nodes);
    			p = claim_element(div0_nodes, "P", { class: true });
    			var p_nodes = children(p);
    			a = claim_element(p_nodes, "A", { download: true, href: true });
    			var a_nodes = children(a);
    			t3 = claim_text(a_nodes, "download");
    			a_nodes.forEach(detach_dev);
    			p_nodes.forEach(detach_dev);
    			div0_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h3, "class", "svelte-ev62fq");
    			add_location(h3, file$6, 30, 4, 629);
    			attr_dev(img, "class", img_class_value = "" + (null_to_empty("resume-img") + " svelte-ev62fq"));
    			if (img.src !== (img_src_value = "images/resume.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = "my resume");
    			add_location(img, file$6, 35, 8, 723);
    			attr_dev(a, "download", "bryson-davis-resume.png");
    			attr_dev(a, "href", "images/resume.png");
    			add_location(a, file$6, 37, 12, 818);
    			attr_dev(p, "class", "svelte-ev62fq");
    			add_location(p, file$6, 36, 8, 802);
    			attr_dev(div0, "class", div0_class_value = "" + (null_to_empty("resume-container") + " svelte-ev62fq"));
    			add_location(div0, file$6, 34, 4, 682);
    			add_location(div1, file$6, 29, 0, 549);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h3);
    			append_dev(h3, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			append_dev(div0, t2);
    			append_dev(div0, p);
    			append_dev(p, a);
    			append_dev(a, t3);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(
    					div1,
    					"outroend",
    					function () {
    						if (is_function(/*setActive*/ ctx[0])) /*setActive*/ ctx[0].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, blur, { duration: 700, amount: 20 }, true);
    				div1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, blur, { duration: 700, amount: 20 }, false);
    			div1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching && div1_transition) div1_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Resume", slots, []);
    	let { setActive } = $$props;
    	const writable_props = ["setActive"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Resume> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("setActive" in $$props) $$invalidate(0, setActive = $$props.setActive);
    	};

    	$$self.$capture_state = () => ({ blur, setActive });

    	$$self.$inject_state = $$props => {
    		if ("setActive" in $$props) $$invalidate(0, setActive = $$props.setActive);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [setActive];
    }

    class Resume extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-ev62fq-style")) add_css$1();
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { setActive: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Resume",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*setActive*/ ctx[0] === undefined && !("setActive" in props)) {
    			console.warn("<Resume> was created without expected prop 'setActive'");
    		}
    	}

    	get setActive() {
    		throw new Error("<Resume>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set setActive(value) {
    		throw new Error("<Resume>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Hide.svelte generated by Svelte v3.31.0 */
    const file$7 = "src/components/Hide.svelte";

    function add_css$2() {
    	var style = element("style");
    	style.id = "svelte-1e94rx5-style";
    	style.textContent = "button.svelte-1e94rx5{font-family:arrows;border-radius:0%;font-size:1.5em;box-shadow:4px 4px 3px #6300ee}.button-container.svelte-1e94rx5{margin-top:2em;text-align:center;width:100%}.slide.svelte-1e94rx5{padding:0.1px\n    }.rotate.svelte-1e94rx5{transform:rotate(180deg)}.t.svelte-1e94rx5{transition-property:transform;transition-duration:400ms}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSGlkZS5zdmVsdGUiLCJzb3VyY2VzIjpbIkhpZGUuc3ZlbHRlIl0sInNvdXJjZXNDb250ZW50IjpbIjxzY3JpcHQ+XG4gICAgaW1wb3J0IHtzbGlkZX0gZnJvbSAnc3ZlbHRlL3RyYW5zaXRpb24nXG4gICAgbGV0IGhpZGRlbiA9IHRydWU7XG48L3NjcmlwdD5cbjxzdHlsZT5cbiAgICBidXR0b24ge1xuICAgICAgICBmb250LWZhbWlseTogYXJyb3dzO1xuICAgICAgICBib3JkZXItcmFkaXVzOiAwJTtcbiAgICAgICAgZm9udC1zaXplOiAxLjVlbTtcbiAgICAgICAgYm94LXNoYWRvdzogNHB4IDRweCAzcHggIzYzMDBlZTtcbiAgICB9XG5cbiAgICAuYnV0dG9uLWNvbnRhaW5lciB7XG4gICAgICAgIG1hcmdpbi10b3A6IDJlbTtcbiAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgICAgICB3aWR0aDogMTAwJTtcbiAgICB9XG5cbiAgICAuc2xpZGUge1xuICAgICAgICBwYWRkaW5nOiAwLjFweFxuICAgIH1cbiAgICAucm90YXRlIHtcbiAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoMTgwZGVnKTtcblxuICAgIH1cbiAgICAudCB7XG4gICAgICAgIHRyYW5zaXRpb24tcHJvcGVydHk6IHRyYW5zZm9ybTtcbiAgICAgICAgdHJhbnNpdGlvbi1kdXJhdGlvbjogNDAwbXM7XG4gICAgfVxuPC9zdHlsZT5cbnsjaWYgIWhpZGRlbn1cbiAgICA8ZGl2IGNsYXNzPXtcInNsaWRlXCJ9IHRyYW5zaXRpb246c2xpZGU+XG4gICAgICAgIDxzbG90PlxuXG4gICAgICAgIDwvc2xvdD5cbiAgICA8L2Rpdj5cbnsvaWZ9XG48ZGl2IGNsYXNzPVwiYnV0dG9uLWNvbnRhaW5lclwiPlxuICAgIDxidXR0b24gb246Y2xpY2s9eygpID0+IGhpZGRlbiA9ICFoaWRkZW59PjxkaXYgY2xhc3M9eyd0J30gY2xhc3M6cm90YXRlPXtoaWRkZW59PiYjeDIxOTE8L2Rpdj48L2J1dHRvbj5cbjwvZGl2PlxuXG5cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFLSSxNQUFNLGVBQUMsQ0FBQyxBQUNKLFdBQVcsQ0FBRSxNQUFNLENBQ25CLGFBQWEsQ0FBRSxFQUFFLENBQ2pCLFNBQVMsQ0FBRSxLQUFLLENBQ2hCLFVBQVUsQ0FBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEFBQ25DLENBQUMsQUFFRCxpQkFBaUIsZUFBQyxDQUFDLEFBQ2YsVUFBVSxDQUFFLEdBQUcsQ0FDZixVQUFVLENBQUUsTUFBTSxDQUNsQixLQUFLLENBQUUsSUFBSSxBQUNmLENBQUMsQUFFRCxNQUFNLGVBQUMsQ0FBQyxBQUNKLE9BQU8sQ0FBRSxLQUFLO0lBQ2xCLENBQUMsQUFDRCxPQUFPLGVBQUMsQ0FBQyxBQUNMLFNBQVMsQ0FBRSxPQUFPLE1BQU0sQ0FBQyxBQUU3QixDQUFDLEFBQ0QsRUFBRSxlQUFDLENBQUMsQUFDQSxtQkFBbUIsQ0FBRSxTQUFTLENBQzlCLG1CQUFtQixDQUFFLEtBQUssQUFDOUIsQ0FBQyJ9 */";
    	append_dev(document.head, style);
    }

    // (31:0) {#if !hidden}
    function create_if_block$1(ctx) {
    	let div;
    	let div_class_value;
    	let div_transition;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			if (default_slot) default_slot.l(div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty("slide") + " svelte-1e94rx5"));
    			add_location(div, file$7, 31, 4, 558);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(31:0) {#if !hidden}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let t0;
    	let div1;
    	let button;
    	let div0;
    	let t1;
    	let div0_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = !/*hidden*/ ctx[0] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			div1 = element("div");
    			button = element("button");
    			div0 = element("div");
    			t1 = text("↑");
    			this.h();
    		},
    		l: function claim(nodes) {
    			if (if_block) if_block.l(nodes);
    			t0 = claim_space(nodes);
    			div1 = claim_element(nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			button = claim_element(div1_nodes, "BUTTON", { class: true });
    			var button_nodes = children(button);
    			div0 = claim_element(button_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			t1 = claim_text(div0_nodes, "↑");
    			div0_nodes.forEach(detach_dev);
    			button_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div0, "class", div0_class_value = "" + (null_to_empty("t") + " svelte-1e94rx5"));
    			toggle_class(div0, "rotate", /*hidden*/ ctx[0]);
    			add_location(div0, file$7, 38, 46, 723);
    			attr_dev(button, "class", "svelte-1e94rx5");
    			add_location(button, file$7, 38, 4, 681);
    			attr_dev(div1, "class", "button-container svelte-1e94rx5");
    			add_location(div1, file$7, 37, 0, 646);
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, button);
    			append_dev(button, div0);
    			append_dev(div0, t1);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!/*hidden*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*hidden*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t0.parentNode, t0);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*hidden*/ 1) {
    				toggle_class(div0, "rotate", /*hidden*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Hide", slots, ['default']);
    	let hidden = true;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Hide> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, hidden = !hidden);

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ slide, hidden });

    	$$self.$inject_state = $$props => {
    		if ("hidden" in $$props) $$invalidate(0, hidden = $$props.hidden);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [hidden, $$scope, slots, click_handler];
    }

    class Hide extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-1e94rx5-style")) add_css$2();
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Hide",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/components/ProjectInstance.svelte generated by Svelte v3.31.0 */

    const file$8 = "src/components/ProjectInstance.svelte";

    function add_css$3() {
    	var style = element("style");
    	style.id = "svelte-1ja5t3h-style";
    	style.textContent = "h4.svelte-1ja5t3h{font-size:2em;font-weight:400;text-align:left;margin:0}.project-img-container.svelte-1ja5t3h{text-align:center;margin:3em 0}.project-img.svelte-1ja5t3h{width:100%;filter:grayscale(70%)}.project-container.svelte-1ja5t3h{margin:2em 0}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvamVjdEluc3RhbmNlLnN2ZWx0ZSIsInNvdXJjZXMiOlsiUHJvamVjdEluc3RhbmNlLnN2ZWx0ZSJdLCJzb3VyY2VzQ29udGVudCI6WyI8c2NyaXB0PlxuICAgIGV4cG9ydCBsZXQgbmFtZVxuICAgIGV4cG9ydCBsZXQgdXJsXG4gICAgZXhwb3J0IGxldCBpbWdTcmNcbiAgICBleHBvcnQgbGV0IGltZ0FsdFxuPC9zY3JpcHQ+XG5cbjxzdHlsZT5cbiAgICBoNCB7XG4gICAgICAgIGZvbnQtc2l6ZTogMmVtO1xuICAgICAgICBmb250LXdlaWdodDogNDAwO1xuICAgICAgICB0ZXh0LWFsaWduOiBsZWZ0O1xuICAgICAgICBtYXJnaW46IDA7XG4gICAgfVxuXG4gICAgLnByb2plY3QtaW1nLWNvbnRhaW5lciB7XG4gICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICAgICAgbWFyZ2luOiAzZW0gMDtcbiAgICB9XG5cbiAgICAucHJvamVjdC1pbWcge1xuICAgICAgICB3aWR0aDogMTAwJTtcbiAgICAgICAgZmlsdGVyOiBncmF5c2NhbGUoNzAlKTtcbiAgICB9XG4gICAgXG4gICAgLnByb2plY3QtY29udGFpbmVyIHtcbiAgICAgICAgbWFyZ2luOiAyZW0gMDtcbiAgICB9XG5cbjwvc3R5bGU+XG5cbjxkaXYgY2xhc3M9eydwcm9qZWN0LWNvbnRhaW5lcid9PlxuICAgIDxoND5cbiAgICAgICAgPGEgaHJlZj17dXJsfT57bmFtZX08L2E+XG4gICAgPC9oND5cblxuICAgIDxkaXYgY2xhc3M9e1wicHJvamVjdC1pbWctY29udGFpbmVyXCJ9PlxuICAgICAgICA8aW1nIGNsYXNzPXtcInByb2plY3QtaW1nXCJ9IHNyYz17aW1nU3JjfSBhbHQ9e2ltZ0FsdH0+XG4gICAgPC9kaXY+XG4gICAgPHNsb3Q+XG5cbiAgICA8L3Nsb3Q+XG48L2Rpdj4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBUUksRUFBRSxlQUFDLENBQUMsQUFDQSxTQUFTLENBQUUsR0FBRyxDQUNkLFdBQVcsQ0FBRSxHQUFHLENBQ2hCLFVBQVUsQ0FBRSxJQUFJLENBQ2hCLE1BQU0sQ0FBRSxDQUFDLEFBQ2IsQ0FBQyxBQUVELHNCQUFzQixlQUFDLENBQUMsQUFDcEIsVUFBVSxDQUFFLE1BQU0sQ0FDbEIsTUFBTSxDQUFFLEdBQUcsQ0FBQyxDQUFDLEFBQ2pCLENBQUMsQUFFRCxZQUFZLGVBQUMsQ0FBQyxBQUNWLEtBQUssQ0FBRSxJQUFJLENBQ1gsTUFBTSxDQUFFLFVBQVUsR0FBRyxDQUFDLEFBQzFCLENBQUMsQUFFRCxrQkFBa0IsZUFBQyxDQUFDLEFBQ2hCLE1BQU0sQ0FBRSxHQUFHLENBQUMsQ0FBQyxBQUNqQixDQUFDIn0= */";
    	append_dev(document.head, style);
    }

    function create_fragment$8(ctx) {
    	let div1;
    	let h4;
    	let a;
    	let t0;
    	let t1;
    	let div0;
    	let img;
    	let img_class_value;
    	let img_src_value;
    	let div0_class_value;
    	let t2;
    	let div1_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h4 = element("h4");
    			a = element("a");
    			t0 = text(/*name*/ ctx[0]);
    			t1 = space();
    			div0 = element("div");
    			img = element("img");
    			t2 = space();
    			if (default_slot) default_slot.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div1 = claim_element(nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			h4 = claim_element(div1_nodes, "H4", { class: true });
    			var h4_nodes = children(h4);
    			a = claim_element(h4_nodes, "A", { href: true });
    			var a_nodes = children(a);
    			t0 = claim_text(a_nodes, /*name*/ ctx[0]);
    			a_nodes.forEach(detach_dev);
    			h4_nodes.forEach(detach_dev);
    			t1 = claim_space(div1_nodes);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			img = claim_element(div0_nodes, "IMG", { class: true, src: true, alt: true });
    			div0_nodes.forEach(detach_dev);
    			t2 = claim_space(div1_nodes);
    			if (default_slot) default_slot.l(div1_nodes);
    			div1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(a, "href", /*url*/ ctx[1]);
    			add_location(a, file$8, 33, 8, 508);
    			attr_dev(h4, "class", "svelte-1ja5t3h");
    			add_location(h4, file$8, 32, 4, 495);
    			attr_dev(img, "class", img_class_value = "" + (null_to_empty("project-img") + " svelte-1ja5t3h"));
    			if (img.src !== (img_src_value = /*imgSrc*/ ctx[2])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*imgAlt*/ ctx[3]);
    			add_location(img, file$8, 37, 8, 594);
    			attr_dev(div0, "class", div0_class_value = "" + (null_to_empty("project-img-container") + " svelte-1ja5t3h"));
    			add_location(div0, file$8, 36, 4, 548);
    			attr_dev(div1, "class", div1_class_value = "" + (null_to_empty("project-container") + " svelte-1ja5t3h"));
    			add_location(div1, file$8, 31, 0, 457);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h4);
    			append_dev(h4, a);
    			append_dev(a, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			append_dev(div1, t2);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*name*/ 1) set_data_dev(t0, /*name*/ ctx[0]);

    			if (!current || dirty & /*url*/ 2) {
    				attr_dev(a, "href", /*url*/ ctx[1]);
    			}

    			if (!current || dirty & /*imgSrc*/ 4 && img.src !== (img_src_value = /*imgSrc*/ ctx[2])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (!current || dirty & /*imgAlt*/ 8) {
    				attr_dev(img, "alt", /*imgAlt*/ ctx[3]);
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 16) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[4], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ProjectInstance", slots, ['default']);
    	let { name } = $$props;
    	let { url } = $$props;
    	let { imgSrc } = $$props;
    	let { imgAlt } = $$props;
    	const writable_props = ["name", "url", "imgSrc", "imgAlt"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ProjectInstance> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("url" in $$props) $$invalidate(1, url = $$props.url);
    		if ("imgSrc" in $$props) $$invalidate(2, imgSrc = $$props.imgSrc);
    		if ("imgAlt" in $$props) $$invalidate(3, imgAlt = $$props.imgAlt);
    		if ("$$scope" in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ name, url, imgSrc, imgAlt });

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("url" in $$props) $$invalidate(1, url = $$props.url);
    		if ("imgSrc" in $$props) $$invalidate(2, imgSrc = $$props.imgSrc);
    		if ("imgAlt" in $$props) $$invalidate(3, imgAlt = $$props.imgAlt);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, url, imgSrc, imgAlt, $$scope, slots];
    }

    class ProjectInstance extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-1ja5t3h-style")) add_css$3();
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { name: 0, url: 1, imgSrc: 2, imgAlt: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ProjectInstance",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
    			console.warn("<ProjectInstance> was created without expected prop 'name'");
    		}

    		if (/*url*/ ctx[1] === undefined && !("url" in props)) {
    			console.warn("<ProjectInstance> was created without expected prop 'url'");
    		}

    		if (/*imgSrc*/ ctx[2] === undefined && !("imgSrc" in props)) {
    			console.warn("<ProjectInstance> was created without expected prop 'imgSrc'");
    		}

    		if (/*imgAlt*/ ctx[3] === undefined && !("imgAlt" in props)) {
    			console.warn("<ProjectInstance> was created without expected prop 'imgAlt'");
    		}
    	}

    	get name() {
    		throw new Error("<ProjectInstance>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<ProjectInstance>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<ProjectInstance>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<ProjectInstance>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get imgSrc() {
    		throw new Error("<ProjectInstance>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set imgSrc(value) {
    		throw new Error("<ProjectInstance>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get imgAlt() {
    		throw new Error("<ProjectInstance>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set imgAlt(value) {
    		throw new Error("<ProjectInstance>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Projects.svelte generated by Svelte v3.31.0 */
    const file$9 = "src/components/Projects.svelte";

    function add_css$4() {
    	var style = element("style");
    	style.id = "svelte-11ksyz4-style";
    	style.textContent = "h3.svelte-11ksyz4{font-size:3em;font-weight:400;text-align:right;margin:0;margin-bottom:1em}p.svelte-11ksyz4{font-size:2em;text-align:justify;hyphens:auto;-webkit-hyphens:auto;-ms-hyphens:auto;margin-block-end:0}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvamVjdHMuc3ZlbHRlIiwic291cmNlcyI6WyJQcm9qZWN0cy5zdmVsdGUiXSwic291cmNlc0NvbnRlbnQiOlsiPHNjcmlwdD5cbiAgICBpbXBvcnQge2JsdXJ9IGZyb20gJ3N2ZWx0ZS90cmFuc2l0aW9uJ1xuICAgIGltcG9ydCBIaWRlIGZyb20gJy4vSGlkZS5zdmVsdGUnO1xuICAgIGltcG9ydCBQcm9qZWN0SW5zdGFuY2UgZnJvbSAnLi9Qcm9qZWN0SW5zdGFuY2Uuc3ZlbHRlJztcbiAgICBleHBvcnQgbGV0IHNldEFjdGl2ZTtcbjwvc2NyaXB0PlxuXG48c3R5bGU+XG4gICAgaDMge1xuICAgICAgICBmb250LXNpemU6IDNlbTtcbiAgICAgICAgZm9udC13ZWlnaHQ6IDQwMDtcbiAgICAgICAgdGV4dC1hbGlnbjogcmlnaHQ7XG4gICAgICAgIG1hcmdpbjogMDtcbiAgICAgICAgbWFyZ2luLWJvdHRvbTogMWVtO1xuICAgIH1cblxuICAgIGg0IHtcbiAgICAgICAgZm9udC1zaXplOiAyZW07XG4gICAgICAgIGZvbnQtd2VpZ2h0OiA0MDA7XG4gICAgICAgIHRleHQtYWxpZ246IGxlZnQ7XG4gICAgICAgIG1hcmdpbjogMDtcbiAgICB9XG5cbiAgICBwIHtcbiAgICAgICAgZm9udC1zaXplOiAyZW07XG4gICAgICAgIHRleHQtYWxpZ246IGp1c3RpZnk7XG4gICAgICAgIGh5cGhlbnM6IGF1dG87XG4gICAgICAgIC13ZWJraXQtaHlwaGVuczogYXV0bztcbiAgICAgICAgLW1zLWh5cGhlbnM6IGF1dG87XG4gICAgICAgIG1hcmdpbi1ibG9jay1lbmQ6IDA7IFxuICAgIH1cblxuPC9zdHlsZT5cblxuPGRpdiB0cmFuc2l0aW9uOmJsdXI9e3tkdXJhdGlvbjogNzAwLCBhbW91bnQ6IDIwfX0gb246b3V0cm9lbmQ9e3NldEFjdGl2ZX0+XG4gICAgPGgzPlxuICAgICAgICBhIGZldyBvZiBteSBmYXYgcHJvamVjdHNcbiAgICA8L2gzPlxuICAgIDxQcm9qZWN0SW5zdGFuY2VcbiAgICAgICAgbmFtZT17J2dyYWluc3RlbXMnfVxuICAgICAgICB1cmw9eydodHRwczovL3d3dy5ncmFpbnN0ZW1zLm5ldCd9XG4gICAgICAgIGltZ1NyYz17J2ltYWdlcy9ncmFpbnN0ZW1zLnBuZyd9XG4gICAgICAgIGltZ0FsdD17J2dyYWluc3RlbXMgaW50ZXJmYWNlJ31cbiAgICA+XG4gICAgICAgIDxwPlxuICAgICAgICAgICAgc3RhcnRlZCBpbiBsYXRlIDIwMjAgYW5kIHN0aWxsIGluIGRldmVsb3Amc2h5O21lbnQsIDxhIGhyZWY9XCJodHRwczovL3d3dy5ncmFpbnN0ZW1zLm5ldFwiPmdyYWluc3RlbXM8L2E+IGlzIGEgPGVtPmdyYW4mc2h5O3VsYXIgc3ludGhlJnNoeTtzaXplciBhbmQgc2FtcGxlIG1hbmlwdSZzaHk7bGF0aW9uIHdlYmFwcDwvZW0+IGNyZWF0ZWQgYW5kIGRldmVsb3BlZCBzb2xlbHkgYnkgbXlzZWxmLiBcbiAgICAgICAgICAgIHRoZSBhcHAgYWxsb3dzIHVzZXJzIHRvIGNob29zZSBmcm9tIGEgZGF0YSZzaHk7YmFzZSBvZiBzYW1wbGVzIHdoaWNoIHRoZXkgY2FuIHRoZW4gcmVwaXRjaCwgZmlsdGVyLCBhbmQgYWRqdXN0IHRlbXBvL3NwZWVkIHRvIGNyZWF0ZSBuZXcsIGludGVyJnNoeTtlc3Rpbmcgc291bmRzLFxuICAgICAgICAgICAgYXMgd2VsbCBhcyB0aGUgYWJpbGl0eSBmb3IgdXNlcnMgdG8gdXBsb2FkIHRoZWlyIG93biBzYW1wbGVzIGZvciB0aGVtJnNoeTtzZWx2ZXMgYW5kIG90aGVyIHVzZXJzIHRvIGdyYW51bCZzaHk7YXJpemUuXG4gICAgICAgIDwvcD5cbiAgICAgICAgPEhpZGU+XG4gICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICB0aGUgbW90aSZzaHk7dmF0aW9uIGJlaGluZCB0aGlzIGFwcCB3YXMgdG8gaW50cm8mc2h5O2R1Y2UgdXNlcnMgdG8gYSBuZXcgZm9ybSBvZiBzb3VuZCBzeW50aGUmc2h5O3NpcyB3aXRoIGFuIGF0dHJhY3Qmc2h5O2l2ZSBhbmQgaW5mb3JtJnNoeTthdGl2ZSBpbnRlciZzaHk7ZmFjZSBcbiAgICAgICAgICAgICAgICBpbiBhbiBhdHRlbXB0IHRvIG1ha2UgdGhlIGNvbXBsZXggcmVhbG0gb2YgZ3JhbiZzaHk7dWxhciBzeW50aCZzaHk7ZXNpcyBtb3JlIGFwcHJvYWNoJnNoeTthYmxlIHdoaWxlIGludHJvJnNoeTtkdWNpbmcgYSBjb2xsYWJvciZzaHk7YXRpdmUgZWxlbWVudCBpbiB0aGUgYWJpbGl0eSB0byBzaGFyZSBzYW1wbGVzLlxuICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgPHA+XG4gICAgICAgICAgICAgICAgdGhlIGFwcCBtYWtlcyBleHRlbiZzaHk7c2l2ZSB1c2Ugb2YgPGVtPnRvbmUuanM8L2VtPiwgYSBub2RlIGxpYnJhcnkgdGhhdCBzdHJlYW0mc2h5O2xpbmVzLCBhYnN0ciZzaHk7YWN0cywgYW5kIGJ1aWxkcyB1cG9uIFxuICAgICAgICAgICAgICAgIGZlYXQmc2h5O3VyZXMgb2YgdGhlIG5hdGl2ZSB3ZWIgYXVkaW8gYXBpIGFuZCBwcm92aWRlcyB0aGUgZ3JhbnUmc2h5O2xhciBlbmdpbmUgYXQgdGhlIGhlYXJ0IG9mIGdyYWluc3RlbXMuIFxuICAgICAgICAgICAgICAgIGhvc3RlZCBvbiA8ZW0+bmV0bGlmeTwvZW0+IGFuZCBidWlsdCBvbiBhIDxlbT5qYW1zdGFjayBhcmNoaXRlY3R1cmU8L2VtPiwgdGhlIHByb2plY3QgdXRpbGl6ZXMgPGVtPnJlYWN0PC9lbT4gZm9yIHRoZSBmcm9udC1lbmQgZnJhbWUmc2h5O3dvcmssIFxuICAgICAgICAgICAgICAgIGluIGFkZGkmc2h5O3Rpb24gdG8gPGVtPnNlcnZlcmxlc3MgZnVuY3Rpb25zPC9lbT4sIGFuIDxlbT5hd3MgczM8L2VtPiBidWNrZXQsIGFuZCBhIDxlbT5ncmFwaHFsPC9lbT4gaW50ZXImc2h5O2ZhY2UgZm9yIHF1ZXJ5JnNoeTtpbmcgYW5kIG11dGF0JnNoeTtpbmcgYSA8ZW0+ZmF1bmFkYjwvZW0+IGRhdGEmc2h5O2Jhc2UuXG4gICAgICAgICAgICAgICAgeW91IGNhbiBjaGVjayBvdXQgdGhlIHdvcmsgaW4gcHJvZyZzaHk7cmVzcyBhdCA8YSBocmVmPVwiaHR0cHM6Ly93d3cuZ3JhaW5zdGVtcy5uZXRcIj5ncmFpbnN0ZW1zLm5ldDwvYT4uXG4gICAgICAgICAgICA8L3A+XG4gICAgICAgIDwvSGlkZT5cbiAgICA8L1Byb2plY3RJbnN0YW5jZT5cbiAgICA8UHJvamVjdEluc3RhbmNlXG4gICAgICAgIG5hbWU9eydjcm9zc2hhdGNoJ31cbiAgICAgICAgdXJsPXsnaHR0cDovL3d3dy5jcm9zc2hhdGNoLnNwYWNlJ31cbiAgICAgICAgaW1nU3JjPXsnaW1hZ2VzL2Nyb3NzaGF0Y2gtaGVhZGVyLnBuZyd9XG4gICAgICAgIGltZ0FsdD17J2Nyb3NzaGF0Y2ggc2NlbmUgd2l0aCBsb2dvJ31cbiAgICA+XG4gICAgICAgIDxwPlxuICAgICAgICAgICAgbXkgbG9uZ2VzdC1ydW5uaW5nIGFuZCBtb3N0IHN1Y2Nlc3Mmc2h5O2Z1bCBwcm9qZWN0IHRodXMgZmFyLCA8ZW0+Y3Jvc3NoYXRjaDwvZW0+IHdhcyBhbiBpbmRlcGVuJnNoeTtkZW50IHZpZGVvJnNoeTtnYW1lIHByb2plY3QgZGVzaWduZWQgYW5kIGRldmVsJnNoeTtvcGVkIGJ5IGEgZ3JvdXAgb2YgZm91ciBmcmllbmRzLCBpbmNsdWQmc2h5O2luZyBteXNlbGYsIGZyb20gd2VzbGV5YW4uIFxuICAgICAgICAgICAgdGhlIGdhbWUgd2FzIGRldmVsJnNoeTtvcGVkIGluIDxlbT51bml0eTwvZW0+IGFuZCBmZWF0JnNoeTt1cmVzIGEgY29yZSBtZWNoYW5pYyBvZiB0d28gPGVtPm92ZXImc2h5O2xhcHBpbmcgZGltZW4mc2h5O3Npb25zPC9lbT4gdGhhdCB0aGUgcGxheWVyIGNhbiB0cmF2ZWwgYW5kIGNhcnJ5IG9iamVjdHMgYmV0d2VlbiB0byBzb2x2ZSBzcGF0aWFsIGFuZCBsb2dpY2FsIHB1enpsZXMgaW4gYSB3aGltJnNoeTtzaWNhbCBhbmQgY29sb3Imc2h5O2Z1bCBhbGllbiBsYW5kJnNoeTtzY2FwZS4gXG4gICAgICAgIDwvcD5cblxuICAgICAgICA8SGlkZT4gICAgXG4gICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICB3ZSBiZWdhbiBwYXJ0LXRpbWUgd29yayBvbiB0aGUgZ2FtZSBpbiB0aGUgc3VtbWVyIG9mIDIwMTgsIGRldmVsJnNoeTtvcGluZyBtZWNoJnNoeTthbmljcyBhbmQgcHJvdG8mc2h5O3R5cGUgbGV2ZWxzIHVudGlsIHdlIGJyb3VnaHQgYSBkZW1vIHRvIDxlbT5wYXggZWFzdDwvZW0+IGluIG1hcmNoIG9mIDIwMTkuIHNvb24gYWZ0ZXIsIHRoZSBwcm9qZWN0IHdhcyBhZG1pdHRlZCBpbnRvIHRoZSBcbiAgICAgICAgICAgICAgICA8ZW0+bnl1IGdhbWUgY2VudGVyIGluY3Umc2h5O2JhdG9yPC9lbT4gcHJvZ3JhbSwgd2hpY2ggd2UgYXR0ZW5kZWQgbGF0ZXIgdGhhdCB5ZWFyIGZyb20ganVuZSB0byBzZXAmc2h5O3RlbWJlciwgYWZmb3JkaW5nIHVzIHRoZSBvcHBvciZzaHk7dHVuaXR5IHRvIHdvcmsgb24gdGhlIHByb2plY3QgZnVsbCB0aW1lIHdpdGggZnVuZGluZyBhbmQgZ3VpZCZzaHk7YW5jZSBmcm9tIG55dSBzdGFmZiBhbmQgaW5kJnNoeTt1c3RyeSBmaWd1cmVzLlxuICAgICAgICAgICAgICAgIGluIG91ciB0aW1lIGF0IHRoZSBpbmN1JnNoeTtiYXRvciwgd2UgcmVmaW5lZCB0aGUgaWRlYXMgYmVoaW5kIGNyb3NzJnNoeTtoYXRjaCBhbmQgZGV2ZWwmc2h5O29wZWQgYSA8ZW0+cG9saXNoZWQgZGVtbzwvZW0+IHdoaWxlIGxlYXJuaW5nIGVmZmVjJnNoeTt0aXZlIHN0cmF0JnNoeTtlZ2llcyBmb3IgPGVtPnByb2plY3QgbWFuYWdlJnNoeTttZW50PC9lbT4gYW5kIDxlbT5tYXJrZXQmc2h5O2luZzwvZW0+LlxuICAgICAgICAgICAgPC9wPlxuXG4gICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICBhcyB0aGUgPGVtPmxlYWQgcHJvJnNoeTtncmFtbWVyPC9lbT4gb24gdGhlIHByb2plY3QsIG15IHJlc3BvbnMmc2h5O2liaWxpdGllcyBpbmNsdWRlZCBpbXBsZSZzaHk7bWVudGluZyBjb3JlIGdhbWUgbWVjaGFuaWNzIHdoaWxlIG1haW4mc2h5O3RhaW5pbmcgZ29vZCBwZXImc2h5O2Zvcm1hbmNlOyBkZWJ1Z2cmc2h5O2luZyBhbmQgb3B0aW1peiZzaHk7aW5nIHRoZSBleGlzdGluZyBjb2RlYmFzZTsgXG4gICAgICAgICAgICAgICAgc2V0dGluZyB1cCBhbmQgbWFpbiZzaHk7dGFpbmluZyBhIHZlcnNpb24gY29udHJvbCBzeXN0ZW0gd2l0aCBnaXQ7IGFkdmlzaW5nIHRoZSByZXN0IG9mIHRoZSB0ZWFtIG9uIHRoZSBmZWFzJnNoeTtpYmlsaXR5IGFuZCBzY29wZSBvZiBuZXcgbWVjaGFuaWNzIG9yIGZlYSZzaHk7dHVyZXM7XG4gICAgICAgICAgICAgICAgY3JlYXRpbmcgZWZmaWMmc2h5O2llbmN5LW1pbmRlZCBkZXZlbCZzaHk7b3BlciB0b29scyBmb3Igb3RoZXIgdGVhbSBtZW1iZXJzOyBhbmQgZGV2ZWwmc2h5O29waW5nIGFuIG9yaWdpbmFsIHByb21vJnNoeTt0aW9uYWwgPGEgaHJlZj17J2h0dHA6Ly93d3cuY3Jvc3NoYXRjaC5zcGFjZSd9PndlYnNpdGU8L2E+IGZvciB0aGUgZ2FtZS5cbiAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgIGFzIGEgY29yZSBtZW1iZXIgb2YgdGhpcyBzbWFsbCB0ZWFtLCBpIGxlYXJuZWQgYXMgbXVjaCBhYm91dCB0aGUgZHluYW1pY3Mgb2Ygc21hbGwgdGVhbSByYXBpZCBkZXZlbCZzaHk7b3BtZW50IGFzIGkgZGlkIHRoZSBpbXBvciZzaHk7dGFuY2Ugb2YgYSB3ZWxsLXN0cnVjdHVyZWQgYW5kIG9wdGltaXplZCBjb2RlYmFzZS5cbiAgICAgICAgICAgIDwvcD5cbiAgICAgICAgPC9IaWRlPlxuICAgIDwvUHJvamVjdEluc3RhbmNlPlxuXG4gICAgPFByb2plY3RJbnN0YW5jZVxuICAgICAgICBuYW1lPXsnZmx1eCd9XG4gICAgICAgIHVybD17J2h0dHBzOi8veW91dHUuYmUvMjRCd0E2U01rTGcnfVxuICAgICAgICBpbWdTcmM9eydpbWFnZXMvZmx1eC10ZWFtLmpwZyd9XG4gICAgICAgIGltZ0FsdD17J3RoZSBmbHV4IHRlYW0nfVxuICAgID5cbiAgICAgICAgPHA+XG4gICAgICAgICAgICA8YSBocmVmPXsnaHR0cHM6Ly95b3V0dS5iZS8yNEJ3QTZTTWtMZyd9PmZsdXg8L2E+IHdhcyBhIHNlbWVzdGVyLWxvbmcgY2xhc3MgcHJvamVjdCBmcm9tIG15IHZpZGVvJnNoeTtnYW1lIGRldmVsJnNoeTtvcG1lbnQgY291cnNlIGF0IHdlc2xleWFuIHVuaXZlcnNpdHkuIFxuICAgICAgICAgICAgdGhlIGdhbWUsIGEgY29sb3Imc2h5O2Z1bCBwdXp6bGUtcGxhdCZzaHk7Zm9ybWVyIGRldmVsJnNoeTtvcGVkIGluIDxlbT51bml0eTwvZW0+IGJ5IGEgZml2ZS1wZXJzb24gZGV2IHRlYW0sIHdoZXJlIGkgZnVsJnNoeTtmaWxsZWQgdGhlIHJvbGUgb2YgbGVhZCBwcm8mc2h5O2dyYW1tZXIuXG4gICAgICAgICAgICBpdCB3YXMgdGFyJnNoeTtnZXRlZCBhdCAybmQgdGhyb3VnaCA1dGggZ3JhZGUgc3R1ZGVudHMsIHdpdGggdGhlIGdvYWwgb2YgdGVhY2gmc2h5O2luZyB5b3VuZyBwbGF5ZXJzIHRoZSBiYXNpYyBwaHlzaWNzIG9mIG1hZ25ldGlzbS5cbiAgICAgICAgPC9wPlxuICAgICAgICA8SGlkZT5cbiAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgIHRvIHRoaXMgZW5kLCB3ZSBpbXBsZSZzaHk7bWVudGVkIGluc3RyJnNoeTt1Y3RpdmUsIDxlbT5pbnR1aSZzaHk7dGl2ZSBtZWNoYW5pY3M8L2VtPiByb290ZWQgaW4gcmVhbCBwaHlzaWNzIGNvbmNlcHRzIGJ1dCA8ZW0+c2ltcGxpJnNoeTtmaWVkPC9lbT4gZm9yIGEgeW91bmcgYXVkaWVuY2UuXG4gICAgICAgICAgICAgICAgYW4gaW1wb3J0YW50IGFzcGVjdCBvZiB0aGUgZGV2ZWwmc2h5O29wbWVudCBvZiBmbHV4IHdhcyBvdXIgPGVtPml0ZXJhJnNoeTt0aXZlIGRldmVsJnNoeTtvcG1lbnQgY3ljbGU8L2VtPi4gXG4gICAgICAgICAgICAgICAgdG8gZW5zdXJlIHRoYXQgb3VyIG1lY2hhbmljcyB3ZXJlIGRpZ2VzJnNoeTt0aWJsZSwgZnVuLCBhbmQgYWRlcXVhJnNoeTt0ZWx5IGluc3RydWMmc2h5O3RpdmUsIFxuICAgICAgICAgICAgICAgIHdlIGJyb3VnaHQgcHJvdG8mc2h5O3R5cGVzIHRvIGEgbmVhcmJ5IGVsZW1lbiZzaHk7dGFyeSBzY2hvb2wgZm9yIHRhcmdldCBhdWRpZW5jZSB0ZXN0aW5nLCBhbmQgaW5jb3JwJnNoeTtvcmF0ZWQgcmVzdWx0cyBpbnRvIGZvbGxvdyZzaHk7aW5nIGl0ZXJhdGlvbnMuXG4gICAgICAgICAgICA8L3A+ICAgIFxuICAgICAgICAgICAgPHA+XG4gICAgICAgICAgICAgICAgaW4gdGhlIGVuZCwgd2Ugd2VyZSBsZWZ0IHdpdGggYSBnYW1lIHRoYXQgdGhlIHlvdW5nIHN0dWRlbnRzIGhhZCBhIGJsYXN0IHBsYXlpbmcsIGFuZCBhbG9uZyB0aGUgd2F5LCBvdXIgdGVhbSBsZWFybmVkIGltcG9ydGFudCBsZXNzb25zIGFib3V0IGRldmVsb3Bpbmcgd2l0aCB0YXJnZXQgYXVkaWVuY2UsIHNjb3BlLCBhbmQgdGltZWxpbmUgaW4gbWluZCBpbiBhZGRpdGlvbiB0byB0ZWNoJnNoeTtuaWNhbCBzdHJhdCZzaHk7ZWdpZXMgZm9yIGRldmVsJnNoeTtvcGluZyBpbiB1bml0eS5cbiAgICAgICAgICAgICAgICB5b3UgY2FuIHRha2UgYSBsb29rIGF0IDxhIGhyZWY9eydodHRwczovL3lvdXR1LmJlLzI0QndBNlNNa0xnJ30+dGhpcyB2aWRlbzwvYT4gaSBlZGl0ZWQgd2hpY2ggaW5jbHVkZXMgZ2FtZXBsYXkgZm9vdGFnZSwgYW5kIGNvbW1lbnRzIGZyb20gY2hpbGRyZW4gd2hvIHBsYXllZCB0aGUgZmluaXNoZWQgZ2FtZS5cbiAgICAgICAgICAgIDwvcD5cbiAgICAgICAgPC9IaWRlPlxuICAgIDwvUHJvamVjdEluc3RhbmNlPlxuPC9kaXY+Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVFJLEVBQUUsZUFBQyxDQUFDLEFBQ0EsU0FBUyxDQUFFLEdBQUcsQ0FDZCxXQUFXLENBQUUsR0FBRyxDQUNoQixVQUFVLENBQUUsS0FBSyxDQUNqQixNQUFNLENBQUUsQ0FBQyxDQUNULGFBQWEsQ0FBRSxHQUFHLEFBQ3RCLENBQUMsQUFTRCxDQUFDLGVBQUMsQ0FBQyxBQUNDLFNBQVMsQ0FBRSxHQUFHLENBQ2QsVUFBVSxDQUFFLE9BQU8sQ0FDbkIsT0FBTyxDQUFFLElBQUksQ0FDYixlQUFlLENBQUUsSUFBSSxDQUNyQixXQUFXLENBQUUsSUFBSSxDQUNqQixnQkFBZ0IsQ0FBRSxDQUFDLEFBQ3ZCLENBQUMifQ== */";
    	append_dev(document.head, style);
    }

    // (50:8) <Hide>
    function create_default_slot_5(ctx) {
    	let p0;
    	let t0;
    	let t1;
    	let p1;
    	let t2;
    	let em0;
    	let t3;
    	let t4;
    	let em1;
    	let t5;
    	let t6;
    	let em2;
    	let t7;
    	let t8;
    	let em3;
    	let t9;
    	let t10;
    	let em4;
    	let t11;
    	let t12;
    	let em5;
    	let t13;
    	let t14;
    	let em6;
    	let t15;
    	let t16;
    	let em7;
    	let t17;
    	let t18;
    	let a;
    	let t19;
    	let t20;

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			t0 = text("the moti­vation behind this app was to intro­duce users to a new form of sound synthe­sis with an attract­ive and inform­ative inter­face \n                in an attempt to make the complex realm of gran­ular synth­esis more approach­able while intro­ducing a collabor­ative element in the ability to share samples.");
    			t1 = space();
    			p1 = element("p");
    			t2 = text("the app makes exten­sive use of ");
    			em0 = element("em");
    			t3 = text("tone.js");
    			t4 = text(", a node library that stream­lines, abstr­acts, and builds upon \n                feat­ures of the native web audio api and provides the granu­lar engine at the heart of grainstems. \n                hosted on ");
    			em1 = element("em");
    			t5 = text("netlify");
    			t6 = text(" and built on a ");
    			em2 = element("em");
    			t7 = text("jamstack architecture");
    			t8 = text(", the project utilizes ");
    			em3 = element("em");
    			t9 = text("react");
    			t10 = text(" for the front-end frame­work, \n                in addi­tion to ");
    			em4 = element("em");
    			t11 = text("serverless functions");
    			t12 = text(", an ");
    			em5 = element("em");
    			t13 = text("aws s3");
    			t14 = text(" bucket, and a ");
    			em6 = element("em");
    			t15 = text("graphql");
    			t16 = text(" inter­face for query­ing and mutat­ing a ");
    			em7 = element("em");
    			t17 = text("faunadb");
    			t18 = text(" data­base.\n                you can check out the work in prog­ress at ");
    			a = element("a");
    			t19 = text("grainstems.net");
    			t20 = text(".");
    			this.h();
    		},
    		l: function claim(nodes) {
    			p0 = claim_element(nodes, "P", { class: true });
    			var p0_nodes = children(p0);
    			t0 = claim_text(p0_nodes, "the moti­vation behind this app was to intro­duce users to a new form of sound synthe­sis with an attract­ive and inform­ative inter­face \n                in an attempt to make the complex realm of gran­ular synth­esis more approach­able while intro­ducing a collabor­ative element in the ability to share samples.");
    			p0_nodes.forEach(detach_dev);
    			t1 = claim_space(nodes);
    			p1 = claim_element(nodes, "P", { class: true });
    			var p1_nodes = children(p1);
    			t2 = claim_text(p1_nodes, "the app makes exten­sive use of ");
    			em0 = claim_element(p1_nodes, "EM", {});
    			var em0_nodes = children(em0);
    			t3 = claim_text(em0_nodes, "tone.js");
    			em0_nodes.forEach(detach_dev);
    			t4 = claim_text(p1_nodes, ", a node library that stream­lines, abstr­acts, and builds upon \n                feat­ures of the native web audio api and provides the granu­lar engine at the heart of grainstems. \n                hosted on ");
    			em1 = claim_element(p1_nodes, "EM", {});
    			var em1_nodes = children(em1);
    			t5 = claim_text(em1_nodes, "netlify");
    			em1_nodes.forEach(detach_dev);
    			t6 = claim_text(p1_nodes, " and built on a ");
    			em2 = claim_element(p1_nodes, "EM", {});
    			var em2_nodes = children(em2);
    			t7 = claim_text(em2_nodes, "jamstack architecture");
    			em2_nodes.forEach(detach_dev);
    			t8 = claim_text(p1_nodes, ", the project utilizes ");
    			em3 = claim_element(p1_nodes, "EM", {});
    			var em3_nodes = children(em3);
    			t9 = claim_text(em3_nodes, "react");
    			em3_nodes.forEach(detach_dev);
    			t10 = claim_text(p1_nodes, " for the front-end frame­work, \n                in addi­tion to ");
    			em4 = claim_element(p1_nodes, "EM", {});
    			var em4_nodes = children(em4);
    			t11 = claim_text(em4_nodes, "serverless functions");
    			em4_nodes.forEach(detach_dev);
    			t12 = claim_text(p1_nodes, ", an ");
    			em5 = claim_element(p1_nodes, "EM", {});
    			var em5_nodes = children(em5);
    			t13 = claim_text(em5_nodes, "aws s3");
    			em5_nodes.forEach(detach_dev);
    			t14 = claim_text(p1_nodes, " bucket, and a ");
    			em6 = claim_element(p1_nodes, "EM", {});
    			var em6_nodes = children(em6);
    			t15 = claim_text(em6_nodes, "graphql");
    			em6_nodes.forEach(detach_dev);
    			t16 = claim_text(p1_nodes, " inter­face for query­ing and mutat­ing a ");
    			em7 = claim_element(p1_nodes, "EM", {});
    			var em7_nodes = children(em7);
    			t17 = claim_text(em7_nodes, "faunadb");
    			em7_nodes.forEach(detach_dev);
    			t18 = claim_text(p1_nodes, " data­base.\n                you can check out the work in prog­ress at ");
    			a = claim_element(p1_nodes, "A", { href: true });
    			var a_nodes = children(a);
    			t19 = claim_text(a_nodes, "grainstems.net");
    			a_nodes.forEach(detach_dev);
    			t20 = claim_text(p1_nodes, ".");
    			p1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(p0, "class", "svelte-11ksyz4");
    			add_location(p0, file$9, 50, 12, 1537);
    			add_location(em0, file$9, 55, 52, 2001);
    			add_location(em1, file$9, 57, 26, 2241);
    			add_location(em2, file$9, 57, 58, 2273);
    			add_location(em3, file$9, 57, 111, 2326);
    			add_location(em4, file$9, 58, 36, 2412);
    			add_location(em5, file$9, 58, 70, 2446);
    			add_location(em6, file$9, 58, 100, 2476);
    			add_location(em7, file$9, 58, 170, 2546);
    			attr_dev(a, "href", "https://www.grainstems.net");
    			add_location(a, file$9, 59, 63, 2641);
    			attr_dev(p1, "class", "svelte-11ksyz4");
    			add_location(p1, file$9, 54, 12, 1945);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			append_dev(p0, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, t2);
    			append_dev(p1, em0);
    			append_dev(em0, t3);
    			append_dev(p1, t4);
    			append_dev(p1, em1);
    			append_dev(em1, t5);
    			append_dev(p1, t6);
    			append_dev(p1, em2);
    			append_dev(em2, t7);
    			append_dev(p1, t8);
    			append_dev(p1, em3);
    			append_dev(em3, t9);
    			append_dev(p1, t10);
    			append_dev(p1, em4);
    			append_dev(em4, t11);
    			append_dev(p1, t12);
    			append_dev(p1, em5);
    			append_dev(em5, t13);
    			append_dev(p1, t14);
    			append_dev(p1, em6);
    			append_dev(em6, t15);
    			append_dev(p1, t16);
    			append_dev(p1, em7);
    			append_dev(em7, t17);
    			append_dev(p1, t18);
    			append_dev(p1, a);
    			append_dev(a, t19);
    			append_dev(p1, t20);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(50:8) <Hide>",
    		ctx
    	});

    	return block;
    }

    // (39:4) <ProjectInstance         name={'grainstems'}         url={'https://www.grainstems.net'}         imgSrc={'images/grainstems.png'}         imgAlt={'grainstems interface'}     >
    function create_default_slot_4(ctx) {
    	let p;
    	let t0;
    	let a;
    	let t1;
    	let t2;
    	let em;
    	let t3;
    	let t4;
    	let t5;
    	let hide;
    	let current;

    	hide = new Hide({
    			props: {
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("started in late 2020 and still in develop­ment, ");
    			a = element("a");
    			t1 = text("grainstems");
    			t2 = text(" is a ");
    			em = element("em");
    			t3 = text("gran­ular synthe­sizer and sample manipu­lation webapp");
    			t4 = text(" created and developed solely by myself. \n            the app allows users to choose from a data­base of samples which they can then repitch, filter, and adjust tempo/speed to create new, inter­esting sounds,\n            as well as the ability for users to upload their own samples for them­selves and other users to granul­arize.");
    			t5 = space();
    			create_component(hide.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			p = claim_element(nodes, "P", { class: true });
    			var p_nodes = children(p);
    			t0 = claim_text(p_nodes, "started in late 2020 and still in develop­ment, ");
    			a = claim_element(p_nodes, "A", { href: true });
    			var a_nodes = children(a);
    			t1 = claim_text(a_nodes, "grainstems");
    			a_nodes.forEach(detach_dev);
    			t2 = claim_text(p_nodes, " is a ");
    			em = claim_element(p_nodes, "EM", {});
    			var em_nodes = children(em);
    			t3 = claim_text(em_nodes, "gran­ular synthe­sizer and sample manipu­lation webapp");
    			em_nodes.forEach(detach_dev);
    			t4 = claim_text(p_nodes, " created and developed solely by myself. \n            the app allows users to choose from a data­base of samples which they can then repitch, filter, and adjust tempo/speed to create new, inter­esting sounds,\n            as well as the ability for users to upload their own samples for them­selves and other users to granul­arize.");
    			p_nodes.forEach(detach_dev);
    			t5 = claim_space(nodes);
    			claim_component(hide.$$.fragment, nodes);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(a, "href", "https://www.grainstems.net");
    			add_location(a, file$9, 45, 64, 1018);
    			add_location(em, file$9, 45, 121, 1075);
    			attr_dev(p, "class", "svelte-11ksyz4");
    			add_location(p, file$9, 44, 8, 950);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, a);
    			append_dev(a, t1);
    			append_dev(p, t2);
    			append_dev(p, em);
    			append_dev(em, t3);
    			append_dev(p, t4);
    			insert_dev(target, t5, anchor);
    			mount_component(hide, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const hide_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				hide_changes.$$scope = { dirty, ctx };
    			}

    			hide.$set(hide_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(hide.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(hide.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t5);
    			destroy_component(hide, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(39:4) <ProjectInstance         name={'grainstems'}         url={'https://www.grainstems.net'}         imgSrc={'images/grainstems.png'}         imgAlt={'grainstems interface'}     >",
    		ctx
    	});

    	return block;
    }

    // (75:8) <Hide>
    function create_default_slot_3(ctx) {
    	let p0;
    	let t0;
    	let em0;
    	let t1;
    	let t2;
    	let em1;
    	let t3;
    	let t4;
    	let em2;
    	let t5;
    	let t6;
    	let em3;
    	let t7;
    	let t8;
    	let em4;
    	let t9;
    	let t10;
    	let t11;
    	let p1;
    	let t12;
    	let em5;
    	let t13;
    	let t14;
    	let a;
    	let t15;
    	let a_href_value;
    	let t16;
    	let t17;
    	let p2;
    	let t18;

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			t0 = text("we began part-time work on the game in the summer of 2018, devel­oping mech­anics and proto­type levels until we brought a demo to ");
    			em0 = element("em");
    			t1 = text("pax east");
    			t2 = text(" in march of 2019. soon after, the project was admitted into the \n                ");
    			em1 = element("em");
    			t3 = text("nyu game center incu­bator");
    			t4 = text(" program, which we attended later that year from june to sep­tember, affording us the oppor­tunity to work on the project full time with funding and guid­ance from nyu staff and ind­ustry figures.\n                in our time at the incu­bator, we refined the ideas behind cross­hatch and devel­oped a ");
    			em2 = element("em");
    			t5 = text("polished demo");
    			t6 = text(" while learning effec­tive strat­egies for ");
    			em3 = element("em");
    			t7 = text("project manage­ment");
    			t8 = text(" and ");
    			em4 = element("em");
    			t9 = text("market­ing");
    			t10 = text(".");
    			t11 = space();
    			p1 = element("p");
    			t12 = text("as the ");
    			em5 = element("em");
    			t13 = text("lead pro­grammer");
    			t14 = text(" on the project, my respons­ibilities included imple­menting core game mechanics while main­taining good per­formance; debugg­ing and optimiz­ing the existing codebase; \n                setting up and main­taining a version control system with git; advising the rest of the team on the feas­ibility and scope of new mechanics or fea­tures;\n                creating effic­iency-minded devel­oper tools for other team members; and devel­oping an original promo­tional ");
    			a = element("a");
    			t15 = text("website");
    			t16 = text(" for the game.");
    			t17 = space();
    			p2 = element("p");
    			t18 = text("as a core member of this small team, i learned as much about the dynamics of small team rapid devel­opment as i did the impor­tance of a well-structured and optimized codebase.");
    			this.h();
    		},
    		l: function claim(nodes) {
    			p0 = claim_element(nodes, "P", { class: true });
    			var p0_nodes = children(p0);
    			t0 = claim_text(p0_nodes, "we began part-time work on the game in the summer of 2018, devel­oping mech­anics and proto­type levels until we brought a demo to ");
    			em0 = claim_element(p0_nodes, "EM", {});
    			var em0_nodes = children(em0);
    			t1 = claim_text(em0_nodes, "pax east");
    			em0_nodes.forEach(detach_dev);
    			t2 = claim_text(p0_nodes, " in march of 2019. soon after, the project was admitted into the \n                ");
    			em1 = claim_element(p0_nodes, "EM", {});
    			var em1_nodes = children(em1);
    			t3 = claim_text(em1_nodes, "nyu game center incu­bator");
    			em1_nodes.forEach(detach_dev);
    			t4 = claim_text(p0_nodes, " program, which we attended later that year from june to sep­tember, affording us the oppor­tunity to work on the project full time with funding and guid­ance from nyu staff and ind­ustry figures.\n                in our time at the incu­bator, we refined the ideas behind cross­hatch and devel­oped a ");
    			em2 = claim_element(p0_nodes, "EM", {});
    			var em2_nodes = children(em2);
    			t5 = claim_text(em2_nodes, "polished demo");
    			em2_nodes.forEach(detach_dev);
    			t6 = claim_text(p0_nodes, " while learning effec­tive strat­egies for ");
    			em3 = claim_element(p0_nodes, "EM", {});
    			var em3_nodes = children(em3);
    			t7 = claim_text(em3_nodes, "project manage­ment");
    			em3_nodes.forEach(detach_dev);
    			t8 = claim_text(p0_nodes, " and ");
    			em4 = claim_element(p0_nodes, "EM", {});
    			var em4_nodes = children(em4);
    			t9 = claim_text(em4_nodes, "market­ing");
    			em4_nodes.forEach(detach_dev);
    			t10 = claim_text(p0_nodes, ".");
    			p0_nodes.forEach(detach_dev);
    			t11 = claim_space(nodes);
    			p1 = claim_element(nodes, "P", { class: true });
    			var p1_nodes = children(p1);
    			t12 = claim_text(p1_nodes, "as the ");
    			em5 = claim_element(p1_nodes, "EM", {});
    			var em5_nodes = children(em5);
    			t13 = claim_text(em5_nodes, "lead pro­grammer");
    			em5_nodes.forEach(detach_dev);
    			t14 = claim_text(p1_nodes, " on the project, my respons­ibilities included imple­menting core game mechanics while main­taining good per­formance; debugg­ing and optimiz­ing the existing codebase; \n                setting up and main­taining a version control system with git; advising the rest of the team on the feas­ibility and scope of new mechanics or fea­tures;\n                creating effic­iency-minded devel­oper tools for other team members; and devel­oping an original promo­tional ");
    			a = claim_element(p1_nodes, "A", { href: true });
    			var a_nodes = children(a);
    			t15 = claim_text(a_nodes, "website");
    			a_nodes.forEach(detach_dev);
    			t16 = claim_text(p1_nodes, " for the game.");
    			p1_nodes.forEach(detach_dev);
    			t17 = claim_space(nodes);
    			p2 = claim_element(nodes, "P", { class: true });
    			var p2_nodes = children(p2);
    			t18 = claim_text(p2_nodes, "as a core member of this small team, i learned as much about the dynamics of small team rapid devel­opment as i did the impor­tance of a well-structured and optimized codebase.");
    			p2_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(em0, file$9, 76, 159, 3695);
    			add_location(em1, file$9, 77, 16, 3794);
    			add_location(em2, file$9, 78, 116, 4162);
    			add_location(em3, file$9, 78, 189, 4235);
    			add_location(em4, file$9, 78, 226, 4272);
    			attr_dev(p0, "class", "svelte-11ksyz4");
    			add_location(p0, file$9, 75, 12, 3532);
    			add_location(em5, file$9, 82, 23, 4354);
    			attr_dev(a, "href", a_href_value = "http://www.crosshatch.space");
    			add_location(a, file$9, 84, 142, 4901);
    			attr_dev(p1, "class", "svelte-11ksyz4");
    			add_location(p1, file$9, 81, 12, 4327);
    			attr_dev(p2, "class", "svelte-11ksyz4");
    			add_location(p2, file$9, 86, 12, 4996);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			append_dev(p0, t0);
    			append_dev(p0, em0);
    			append_dev(em0, t1);
    			append_dev(p0, t2);
    			append_dev(p0, em1);
    			append_dev(em1, t3);
    			append_dev(p0, t4);
    			append_dev(p0, em2);
    			append_dev(em2, t5);
    			append_dev(p0, t6);
    			append_dev(p0, em3);
    			append_dev(em3, t7);
    			append_dev(p0, t8);
    			append_dev(p0, em4);
    			append_dev(em4, t9);
    			append_dev(p0, t10);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, t12);
    			append_dev(p1, em5);
    			append_dev(em5, t13);
    			append_dev(p1, t14);
    			append_dev(p1, a);
    			append_dev(a, t15);
    			append_dev(p1, t16);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, p2, anchor);
    			append_dev(p2, t18);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(p2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(75:8) <Hide>",
    		ctx
    	});

    	return block;
    }

    // (64:4) <ProjectInstance         name={'crosshatch'}         url={'http://www.crosshatch.space'}         imgSrc={'images/crosshatch-header.png'}         imgAlt={'crosshatch scene with logo'}     >
    function create_default_slot_2(ctx) {
    	let p;
    	let t0;
    	let em0;
    	let t1;
    	let t2;
    	let em1;
    	let t3;
    	let t4;
    	let em2;
    	let t5;
    	let t6;
    	let t7;
    	let hide;
    	let current;

    	hide = new Hide({
    			props: {
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("my longest-running and most success­ful project thus far, ");
    			em0 = element("em");
    			t1 = text("crosshatch");
    			t2 = text(" was an indepen­dent video­game project designed and devel­oped by a group of four friends, includ­ing myself, from wesleyan. \n            the game was devel­oped in ");
    			em1 = element("em");
    			t3 = text("unity");
    			t4 = text(" and feat­ures a core mechanic of two ");
    			em2 = element("em");
    			t5 = text("over­lapping dimen­sions");
    			t6 = text(" that the player can travel and carry objects between to solve spatial and logical puzzles in a whim­sical and color­ful alien land­scape.");
    			t7 = space();
    			create_component(hide.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			p = claim_element(nodes, "P", { class: true });
    			var p_nodes = children(p);
    			t0 = claim_text(p_nodes, "my longest-running and most success­ful project thus far, ");
    			em0 = claim_element(p_nodes, "EM", {});
    			var em0_nodes = children(em0);
    			t1 = claim_text(em0_nodes, "crosshatch");
    			em0_nodes.forEach(detach_dev);
    			t2 = claim_text(p_nodes, " was an indepen­dent video­game project designed and devel­oped by a group of four friends, includ­ing myself, from wesleyan. \n            the game was devel­oped in ");
    			em1 = claim_element(p_nodes, "EM", {});
    			var em1_nodes = children(em1);
    			t3 = claim_text(em1_nodes, "unity");
    			em1_nodes.forEach(detach_dev);
    			t4 = claim_text(p_nodes, " and feat­ures a core mechanic of two ");
    			em2 = claim_element(p_nodes, "EM", {});
    			var em2_nodes = children(em2);
    			t5 = claim_text(em2_nodes, "over­lapping dimen­sions");
    			em2_nodes.forEach(detach_dev);
    			t6 = claim_text(p_nodes, " that the player can travel and carry objects between to solve spatial and logical puzzles in a whim­sical and color­ful alien land­scape.");
    			p_nodes.forEach(detach_dev);
    			t7 = claim_space(nodes);
    			claim_component(hide.$$.fragment, nodes);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(em0, file$9, 70, 74, 3033);
    			add_location(em1, file$9, 71, 43, 3238);
    			add_location(em2, file$9, 71, 99, 3294);
    			attr_dev(p, "class", "svelte-11ksyz4");
    			add_location(p, file$9, 69, 8, 2955);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, em0);
    			append_dev(em0, t1);
    			append_dev(p, t2);
    			append_dev(p, em1);
    			append_dev(em1, t3);
    			append_dev(p, t4);
    			append_dev(p, em2);
    			append_dev(em2, t5);
    			append_dev(p, t6);
    			insert_dev(target, t7, anchor);
    			mount_component(hide, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const hide_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				hide_changes.$$scope = { dirty, ctx };
    			}

    			hide.$set(hide_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(hide.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(hide.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t7);
    			destroy_component(hide, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(64:4) <ProjectInstance         name={'crosshatch'}         url={'http://www.crosshatch.space'}         imgSrc={'images/crosshatch-header.png'}         imgAlt={'crosshatch scene with logo'}     >",
    		ctx
    	});

    	return block;
    }

    // (104:8) <Hide>
    function create_default_slot_1$1(ctx) {
    	let p0;
    	let t0;
    	let em0;
    	let t1;
    	let t2;
    	let em1;
    	let t3;
    	let t4;
    	let em2;
    	let t5;
    	let t6;
    	let t7;
    	let p1;
    	let t8;
    	let a;
    	let t9;
    	let a_href_value;
    	let t10;

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			t0 = text("to this end, we imple­mented instr­uctive, ");
    			em0 = element("em");
    			t1 = text("intui­tive mechanics");
    			t2 = text(" rooted in real physics concepts but ");
    			em1 = element("em");
    			t3 = text("simpli­fied");
    			t4 = text(" for a young audience.\n                an important aspect of the devel­opment of flux was our ");
    			em2 = element("em");
    			t5 = text("itera­tive devel­opment cycle");
    			t6 = text(". \n                to ensure that our mechanics were diges­tible, fun, and adequa­tely instruc­tive, \n                we brought proto­types to a nearby elemen­tary school for target audience testing, and incorp­orated results into follow­ing iterations.");
    			t7 = space();
    			p1 = element("p");
    			t8 = text("in the end, we were left with a game that the young students had a blast playing, and along the way, our team learned important lessons about developing with target audience, scope, and timeline in mind in addition to tech­nical strat­egies for devel­oping in unity.\n                you can take a look at ");
    			a = element("a");
    			t9 = text("this video");
    			t10 = text(" i edited which includes gameplay footage, and comments from children who played the finished game.");
    			this.h();
    		},
    		l: function claim(nodes) {
    			p0 = claim_element(nodes, "P", { class: true });
    			var p0_nodes = children(p0);
    			t0 = claim_text(p0_nodes, "to this end, we imple­mented instr­uctive, ");
    			em0 = claim_element(p0_nodes, "EM", {});
    			var em0_nodes = children(em0);
    			t1 = claim_text(em0_nodes, "intui­tive mechanics");
    			em0_nodes.forEach(detach_dev);
    			t2 = claim_text(p0_nodes, " rooted in real physics concepts but ");
    			em1 = claim_element(p0_nodes, "EM", {});
    			var em1_nodes = children(em1);
    			t3 = claim_text(em1_nodes, "simpli­fied");
    			em1_nodes.forEach(detach_dev);
    			t4 = claim_text(p0_nodes, " for a young audience.\n                an important aspect of the devel­opment of flux was our ");
    			em2 = claim_element(p0_nodes, "EM", {});
    			var em2_nodes = children(em2);
    			t5 = claim_text(em2_nodes, "itera­tive devel­opment cycle");
    			em2_nodes.forEach(detach_dev);
    			t6 = claim_text(p0_nodes, ". \n                to ensure that our mechanics were diges­tible, fun, and adequa­tely instruc­tive, \n                we brought proto­types to a nearby elemen­tary school for target audience testing, and incorp­orated results into follow­ing iterations.");
    			p0_nodes.forEach(detach_dev);
    			t7 = claim_space(nodes);
    			p1 = claim_element(nodes, "P", { class: true });
    			var p1_nodes = children(p1);
    			t8 = claim_text(p1_nodes, "in the end, we were left with a game that the young students had a blast playing, and along the way, our team learned important lessons about developing with target audience, scope, and timeline in mind in addition to tech­nical strat­egies for devel­oping in unity.\n                you can take a look at ");
    			a = claim_element(p1_nodes, "A", { href: true });
    			var a_nodes = children(a);
    			t9 = claim_text(a_nodes, "this video");
    			a_nodes.forEach(detach_dev);
    			t10 = claim_text(p1_nodes, " i edited which includes gameplay footage, and comments from children who played the finished game.");
    			p1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(em0, file$9, 105, 67, 6039);
    			add_location(em1, file$9, 105, 137, 6109);
    			add_location(em2, file$9, 106, 76, 6232);
    			attr_dev(p0, "class", "svelte-11ksyz4");
    			add_location(p0, file$9, 104, 12, 5968);
    			attr_dev(a, "href", a_href_value = "https://youtu.be/24BwA6SMkLg");
    			add_location(a, file$9, 112, 39, 6932);
    			attr_dev(p1, "class", "svelte-11ksyz4");
    			add_location(p1, file$9, 110, 12, 6594);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			append_dev(p0, t0);
    			append_dev(p0, em0);
    			append_dev(em0, t1);
    			append_dev(p0, t2);
    			append_dev(p0, em1);
    			append_dev(em1, t3);
    			append_dev(p0, t4);
    			append_dev(p0, em2);
    			append_dev(em2, t5);
    			append_dev(p0, t6);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, t8);
    			append_dev(p1, a);
    			append_dev(a, t9);
    			append_dev(p1, t10);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(p1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(104:8) <Hide>",
    		ctx
    	});

    	return block;
    }

    // (93:4) <ProjectInstance         name={'flux'}         url={'https://youtu.be/24BwA6SMkLg'}         imgSrc={'images/flux-team.jpg'}         imgAlt={'the flux team'}     >
    function create_default_slot$2(ctx) {
    	let p;
    	let a;
    	let t0;
    	let a_href_value;
    	let t1;
    	let em;
    	let t2;
    	let t3;
    	let t4;
    	let hide;
    	let current;

    	hide = new Hide({
    			props: {
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			p = element("p");
    			a = element("a");
    			t0 = text("flux");
    			t1 = text(" was a semester-long class project from my video­game devel­opment course at wesleyan university. \n            the game, a color­ful puzzle-plat­former devel­oped in ");
    			em = element("em");
    			t2 = text("unity");
    			t3 = text(" by a five-person dev team, where i ful­filled the role of lead pro­grammer.\n            it was tar­geted at 2nd through 5th grade students, with the goal of teach­ing young players the basic physics of magnetism.");
    			t4 = space();
    			create_component(hide.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			p = claim_element(nodes, "P", { class: true });
    			var p_nodes = children(p);
    			a = claim_element(p_nodes, "A", { href: true });
    			var a_nodes = children(a);
    			t0 = claim_text(a_nodes, "flux");
    			a_nodes.forEach(detach_dev);
    			t1 = claim_text(p_nodes, " was a semester-long class project from my video­game devel­opment course at wesleyan university. \n            the game, a color­ful puzzle-plat­former devel­oped in ");
    			em = claim_element(p_nodes, "EM", {});
    			var em_nodes = children(em);
    			t2 = claim_text(em_nodes, "unity");
    			em_nodes.forEach(detach_dev);
    			t3 = claim_text(p_nodes, " by a five-person dev team, where i ful­filled the role of lead pro­grammer.\n            it was tar­geted at 2nd through 5th grade students, with the goal of teach­ing young players the basic physics of magnetism.");
    			p_nodes.forEach(detach_dev);
    			t4 = claim_space(nodes);
    			claim_component(hide.$$.fragment, nodes);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(a, "href", a_href_value = "https://youtu.be/24BwA6SMkLg");
    			add_location(a, file$9, 99, 12, 5449);
    			add_location(em, file$9, 100, 79, 5684);
    			attr_dev(p, "class", "svelte-11ksyz4");
    			add_location(p, file$9, 98, 8, 5433);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, a);
    			append_dev(a, t0);
    			append_dev(p, t1);
    			append_dev(p, em);
    			append_dev(em, t2);
    			append_dev(p, t3);
    			insert_dev(target, t4, anchor);
    			mount_component(hide, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const hide_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				hide_changes.$$scope = { dirty, ctx };
    			}

    			hide.$set(hide_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(hide.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(hide.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t4);
    			destroy_component(hide, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(93:4) <ProjectInstance         name={'flux'}         url={'https://youtu.be/24BwA6SMkLg'}         imgSrc={'images/flux-team.jpg'}         imgAlt={'the flux team'}     >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div;
    	let h3;
    	let t0;
    	let t1;
    	let projectinstance0;
    	let t2;
    	let projectinstance1;
    	let t3;
    	let projectinstance2;
    	let div_transition;
    	let current;
    	let mounted;
    	let dispose;

    	projectinstance0 = new ProjectInstance({
    			props: {
    				name: "grainstems",
    				url: "https://www.grainstems.net",
    				imgSrc: "images/grainstems.png",
    				imgAlt: "grainstems interface",
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	projectinstance1 = new ProjectInstance({
    			props: {
    				name: "crosshatch",
    				url: "http://www.crosshatch.space",
    				imgSrc: "images/crosshatch-header.png",
    				imgAlt: "crosshatch scene with logo",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	projectinstance2 = new ProjectInstance({
    			props: {
    				name: "flux",
    				url: "https://youtu.be/24BwA6SMkLg",
    				imgSrc: "images/flux-team.jpg",
    				imgAlt: "the flux team",
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			t0 = text("a few of my fav projects");
    			t1 = space();
    			create_component(projectinstance0.$$.fragment);
    			t2 = space();
    			create_component(projectinstance1.$$.fragment);
    			t3 = space();
    			create_component(projectinstance2.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", {});
    			var div_nodes = children(div);
    			h3 = claim_element(div_nodes, "H3", { class: true });
    			var h3_nodes = children(h3);
    			t0 = claim_text(h3_nodes, "a few of my fav projects");
    			h3_nodes.forEach(detach_dev);
    			t1 = claim_space(div_nodes);
    			claim_component(projectinstance0.$$.fragment, div_nodes);
    			t2 = claim_space(div_nodes);
    			claim_component(projectinstance1.$$.fragment, div_nodes);
    			t3 = claim_space(div_nodes);
    			claim_component(projectinstance2.$$.fragment, div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h3, "class", "svelte-11ksyz4");
    			add_location(h3, file$9, 35, 4, 715);
    			add_location(div, file$9, 34, 0, 635);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);
    			append_dev(h3, t0);
    			append_dev(div, t1);
    			mount_component(projectinstance0, div, null);
    			append_dev(div, t2);
    			mount_component(projectinstance1, div, null);
    			append_dev(div, t3);
    			mount_component(projectinstance2, div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(
    					div,
    					"outroend",
    					function () {
    						if (is_function(/*setActive*/ ctx[0])) /*setActive*/ ctx[0].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			const projectinstance0_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				projectinstance0_changes.$$scope = { dirty, ctx };
    			}

    			projectinstance0.$set(projectinstance0_changes);
    			const projectinstance1_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				projectinstance1_changes.$$scope = { dirty, ctx };
    			}

    			projectinstance1.$set(projectinstance1_changes);
    			const projectinstance2_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				projectinstance2_changes.$$scope = { dirty, ctx };
    			}

    			projectinstance2.$set(projectinstance2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(projectinstance0.$$.fragment, local);
    			transition_in(projectinstance1.$$.fragment, local);
    			transition_in(projectinstance2.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, blur, { duration: 700, amount: 20 }, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(projectinstance0.$$.fragment, local);
    			transition_out(projectinstance1.$$.fragment, local);
    			transition_out(projectinstance2.$$.fragment, local);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, blur, { duration: 700, amount: 20 }, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(projectinstance0);
    			destroy_component(projectinstance1);
    			destroy_component(projectinstance2);
    			if (detaching && div_transition) div_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Projects", slots, []);
    	let { setActive } = $$props;
    	const writable_props = ["setActive"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Projects> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("setActive" in $$props) $$invalidate(0, setActive = $$props.setActive);
    	};

    	$$self.$capture_state = () => ({ blur, Hide, ProjectInstance, setActive });

    	$$self.$inject_state = $$props => {
    		if ("setActive" in $$props) $$invalidate(0, setActive = $$props.setActive);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [setActive];
    }

    class Projects extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-11ksyz4-style")) add_css$4();
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { setActive: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Projects",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*setActive*/ ctx[0] === undefined && !("setActive" in props)) {
    			console.warn("<Projects> was created without expected prop 'setActive'");
    		}
    	}

    	get setActive() {
    		throw new Error("<Projects>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set setActive(value) {
    		throw new Error("<Projects>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Contact.svelte generated by Svelte v3.31.0 */
    const file$a = "src/components/Contact.svelte";

    function add_css$5() {
    	var style = element("style");
    	style.id = "svelte-136wtil-style";
    	style.textContent = "h3.svelte-136wtil{font-size:3em;font-weight:400;text-align:right;margin:0;margin-bottom:1em}p.svelte-136wtil{font-size:2em}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udGFjdC5zdmVsdGUiLCJzb3VyY2VzIjpbIkNvbnRhY3Quc3ZlbHRlIl0sInNvdXJjZXNDb250ZW50IjpbIjxzY3JpcHQ+XG4gICAgaW1wb3J0IHtibHVyfSBmcm9tICdzdmVsdGUvdHJhbnNpdGlvbidcbiAgICBleHBvcnQgbGV0IHNldEFjdGl2ZTtcbjwvc2NyaXB0PlxuPHN0eWxlPlxuICAgIGgzIHtcbiAgICAgICAgZm9udC1zaXplOiAzZW07XG4gICAgICAgIGZvbnQtd2VpZ2h0OiA0MDA7XG4gICAgICAgIHRleHQtYWxpZ246IHJpZ2h0O1xuICAgICAgICBtYXJnaW46IDA7XG4gICAgICAgIG1hcmdpbi1ib3R0b206IDFlbTtcbiAgICB9XG4gICAgcCB7XG4gICAgICAgIGZvbnQtc2l6ZTogMmVtO1xuICAgIH1cbjwvc3R5bGU+XG5cbjxkaXYgdHJhbnNpdGlvbjpibHVyPXt7ZHVyYXRpb246IDcwMCwgYW1vdW50OiAyMH19IG9uOm91dHJvZW5kPXtzZXRBY3RpdmV9PlxuICAgIDxoMz5cbiAgICAgICAgZmVlbCBmcmVlIHRvIGNvbnRhY3QgbWVcbiAgICA8L2gzPlxuICAgIDxwPmknbSBjdXJyZW50bHkgbG9va2luZyBmb3IgYSBwZXJtYW5lbnQgZnVsbC10aW1lIGRldmVsb3BlciBwb3NpdGlvbiBhbmQgYW0gYXZhaWxhYmxlIGZvciBmcmVlbGFuY2Ugd29yay48L3A+XG4gICAgPHA+YnJ5c29ucGRAZ21haWwuY29tPC9wPlxuICAgIDxwPjxhIGhyZWY9e1wibWFpbHRvOiBicnlzb25wZEBnbWFpbC5jb21cIn0+ZW1haWw8L2E+PC9wPlxuICAgIDxwPjxhIGhyZWY9e1wiaHR0cHM6Ly9naXRodWIuY29tL2JyeXNvbnBkYXZpcy9cIn0+Z2l0aHViPC9hPjwvcD5cbiAgICA8cD48YSBocmVmPXtcImh0dHBzOi8vbGlua2VkaW4uY29tL2luL2JyeXNvbi1kYXZpcy03Njg1NTIxNGEvXCJ9PmxpbmtlZGluPC9hPjwvcD5cbjwvZGl2PlxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUtJLEVBQUUsZUFBQyxDQUFDLEFBQ0EsU0FBUyxDQUFFLEdBQUcsQ0FDZCxXQUFXLENBQUUsR0FBRyxDQUNoQixVQUFVLENBQUUsS0FBSyxDQUNqQixNQUFNLENBQUUsQ0FBQyxDQUNULGFBQWEsQ0FBRSxHQUFHLEFBQ3RCLENBQUMsQUFDRCxDQUFDLGVBQUMsQ0FBQyxBQUNDLFNBQVMsQ0FBRSxHQUFHLEFBQ2xCLENBQUMifQ== */";
    	append_dev(document.head, style);
    }

    function create_fragment$a(ctx) {
    	let div;
    	let h3;
    	let t0;
    	let t1;
    	let p0;
    	let t2;
    	let t3;
    	let p1;
    	let t4;
    	let t5;
    	let p2;
    	let a0;
    	let t6;
    	let a0_href_value;
    	let t7;
    	let p3;
    	let a1;
    	let t8;
    	let a1_href_value;
    	let t9;
    	let p4;
    	let a2;
    	let t10;
    	let a2_href_value;
    	let div_transition;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			t0 = text("feel free to contact me");
    			t1 = space();
    			p0 = element("p");
    			t2 = text("i'm currently looking for a permanent full-time developer position and am available for freelance work.");
    			t3 = space();
    			p1 = element("p");
    			t4 = text("brysonpd@gmail.com");
    			t5 = space();
    			p2 = element("p");
    			a0 = element("a");
    			t6 = text("email");
    			t7 = space();
    			p3 = element("p");
    			a1 = element("a");
    			t8 = text("github");
    			t9 = space();
    			p4 = element("p");
    			a2 = element("a");
    			t10 = text("linkedin");
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", {});
    			var div_nodes = children(div);
    			h3 = claim_element(div_nodes, "H3", { class: true });
    			var h3_nodes = children(h3);
    			t0 = claim_text(h3_nodes, "feel free to contact me");
    			h3_nodes.forEach(detach_dev);
    			t1 = claim_space(div_nodes);
    			p0 = claim_element(div_nodes, "P", { class: true });
    			var p0_nodes = children(p0);
    			t2 = claim_text(p0_nodes, "i'm currently looking for a permanent full-time developer position and am available for freelance work.");
    			p0_nodes.forEach(detach_dev);
    			t3 = claim_space(div_nodes);
    			p1 = claim_element(div_nodes, "P", { class: true });
    			var p1_nodes = children(p1);
    			t4 = claim_text(p1_nodes, "brysonpd@gmail.com");
    			p1_nodes.forEach(detach_dev);
    			t5 = claim_space(div_nodes);
    			p2 = claim_element(div_nodes, "P", { class: true });
    			var p2_nodes = children(p2);
    			a0 = claim_element(p2_nodes, "A", { href: true });
    			var a0_nodes = children(a0);
    			t6 = claim_text(a0_nodes, "email");
    			a0_nodes.forEach(detach_dev);
    			p2_nodes.forEach(detach_dev);
    			t7 = claim_space(div_nodes);
    			p3 = claim_element(div_nodes, "P", { class: true });
    			var p3_nodes = children(p3);
    			a1 = claim_element(p3_nodes, "A", { href: true });
    			var a1_nodes = children(a1);
    			t8 = claim_text(a1_nodes, "github");
    			a1_nodes.forEach(detach_dev);
    			p3_nodes.forEach(detach_dev);
    			t9 = claim_space(div_nodes);
    			p4 = claim_element(div_nodes, "P", { class: true });
    			var p4_nodes = children(p4);
    			a2 = claim_element(p4_nodes, "A", { href: true });
    			var a2_nodes = children(a2);
    			t10 = claim_text(a2_nodes, "linkedin");
    			a2_nodes.forEach(detach_dev);
    			p4_nodes.forEach(detach_dev);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h3, "class", "svelte-136wtil");
    			add_location(h3, file$a, 18, 4, 363);
    			attr_dev(p0, "class", "svelte-136wtil");
    			add_location(p0, file$a, 21, 4, 414);
    			attr_dev(p1, "class", "svelte-136wtil");
    			add_location(p1, file$a, 22, 4, 529);
    			attr_dev(a0, "href", a0_href_value = "mailto: brysonpd@gmail.com");
    			add_location(a0, file$a, 23, 7, 562);
    			attr_dev(p2, "class", "svelte-136wtil");
    			add_location(p2, file$a, 23, 4, 559);
    			attr_dev(a1, "href", a1_href_value = "https://github.com/brysonpdavis/");
    			add_location(a1, file$a, 24, 7, 622);
    			attr_dev(p3, "class", "svelte-136wtil");
    			add_location(p3, file$a, 24, 4, 619);
    			attr_dev(a2, "href", a2_href_value = "https://linkedin.com/in/bryson-davis-76855214a/");
    			add_location(a2, file$a, 25, 7, 689);
    			attr_dev(p4, "class", "svelte-136wtil");
    			add_location(p4, file$a, 25, 4, 686);
    			add_location(div, file$a, 17, 0, 283);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);
    			append_dev(h3, t0);
    			append_dev(div, t1);
    			append_dev(div, p0);
    			append_dev(p0, t2);
    			append_dev(div, t3);
    			append_dev(div, p1);
    			append_dev(p1, t4);
    			append_dev(div, t5);
    			append_dev(div, p2);
    			append_dev(p2, a0);
    			append_dev(a0, t6);
    			append_dev(div, t7);
    			append_dev(div, p3);
    			append_dev(p3, a1);
    			append_dev(a1, t8);
    			append_dev(div, t9);
    			append_dev(div, p4);
    			append_dev(p4, a2);
    			append_dev(a2, t10);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(
    					div,
    					"outroend",
    					function () {
    						if (is_function(/*setActive*/ ctx[0])) /*setActive*/ ctx[0].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, blur, { duration: 700, amount: 20 }, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, blur, { duration: 700, amount: 20 }, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Contact", slots, []);
    	let { setActive } = $$props;
    	const writable_props = ["setActive"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Contact> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("setActive" in $$props) $$invalidate(0, setActive = $$props.setActive);
    	};

    	$$self.$capture_state = () => ({ blur, setActive });

    	$$self.$inject_state = $$props => {
    		if ("setActive" in $$props) $$invalidate(0, setActive = $$props.setActive);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [setActive];
    }

    class Contact extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-136wtil-style")) add_css$5();
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { setActive: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Contact",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*setActive*/ ctx[0] === undefined && !("setActive" in props)) {
    			console.warn("<Contact> was created without expected prop 'setActive'");
    		}
    	}

    	get setActive() {
    		throw new Error("<Contact>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set setActive(value) {
    		throw new Error("<Contact>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Content.svelte generated by Svelte v3.31.0 */

    const file$b = "src/components/Content.svelte";

    function add_css$6() {
    	var style = element("style");
    	style.id = "svelte-9pkxy3-style";
    	style.textContent = ".content.svelte-9pkxy3{background-color:#000000aa;padding:3em}.container.svelte-9pkxy3{width:100%;min-height:calc(100vh - 9em);max-width:1000px;margin-left:auto;margin-right:auto}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udGVudC5zdmVsdGUiLCJzb3VyY2VzIjpbIkNvbnRlbnQuc3ZlbHRlIl0sInNvdXJjZXNDb250ZW50IjpbIjxzdHlsZT5cbiAgICAuY29udGVudCB7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6ICMwMDAwMDBhYTtcbiAgICAgICAgcGFkZGluZzogM2VtO1xuICAgIH1cblxuICAgIC5jb250YWluZXIge1xuICAgICAgICB3aWR0aDogMTAwJTtcbiAgICAgICAgbWluLWhlaWdodDogY2FsYygxMDB2aCAtIDllbSk7XG4gICAgICAgIG1heC13aWR0aDogMTAwMHB4O1xuICAgICAgICBtYXJnaW4tbGVmdDogYXV0bztcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiBhdXRvO1xuICAgIH1cbjwvc3R5bGU+XG5cbjxkaXYgY2xhc3M9XCJjb250ZW50XCI+XG4gICAgPGRpdiBjbGFzcz1cImNvbnRhaW5lclwiPlxuICAgICAgICA8c2xvdD48L3Nsb3Q+XG4gICAgPC9kaXY+XG48L2Rpdj4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0ksUUFBUSxjQUFDLENBQUMsQUFDTixnQkFBZ0IsQ0FBRSxTQUFTLENBQzNCLE9BQU8sQ0FBRSxHQUFHLEFBQ2hCLENBQUMsQUFFRCxVQUFVLGNBQUMsQ0FBQyxBQUNSLEtBQUssQ0FBRSxJQUFJLENBQ1gsVUFBVSxDQUFFLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FDN0IsU0FBUyxDQUFFLE1BQU0sQ0FDakIsV0FBVyxDQUFFLElBQUksQ0FDakIsWUFBWSxDQUFFLElBQUksQUFDdEIsQ0FBQyJ9 */";
    	append_dev(document.head, style);
    }

    function create_fragment$b(ctx) {
    	let div1;
    	let div0;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div1 = claim_element(nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			if (default_slot) default_slot.l(div0_nodes);
    			div0_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div0, "class", "container svelte-9pkxy3");
    			add_location(div0, file$b, 16, 4, 290);
    			attr_dev(div1, "class", "content svelte-9pkxy3");
    			add_location(div1, file$b, 15, 0, 264);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Content", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Content> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class Content extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-9pkxy3-style")) add_css$6();
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Content",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/components/Empty.svelte generated by Svelte v3.31.0 */

    function create_fragment$c(ctx) {
    	const block = {
    		c: noop,
    		l: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Empty", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Empty> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Empty extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Empty",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src/components/App.svelte generated by Svelte v3.31.0 */

    const { document: document_1 } = globals;
    const file$c = "src/components/App.svelte";

    function add_css$7() {
    	var style = element("style");
    	style.id = "svelte-1j89oix-style";
    	style.textContent = ".hero-text-container.svelte-1j89oix{height:calc(100vh - 3em);display:flex;align-items:center;justify-content:center}.hero-text.svelte-1j89oix{margin:0;background-color:#000000;padding:5vw;text-shadow:3px 3px #6300ee}.hero-subtext.svelte-1j89oix{text-align:right}.tab-bar-background.svelte-1j89oix{background-color:white;position:sticky;top:0px;bottom:0px;z-index:2}h1.svelte-1j89oix{font-family:futura-pt, sans-serif;font-weight:300;color:white;font-size:9vw;text-transform:lowercase;letter-spacing:4px;line-height:0}h2.svelte-1j89oix{color:white;font-family:futura-pt;font-weight:300;font-size:3vw}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXBwLnN2ZWx0ZSIsInNvdXJjZXMiOlsiQXBwLnN2ZWx0ZSJdLCJzb3VyY2VzQ29udGVudCI6WyI8c2NyaXB0PlxuXHRpbXBvcnQgVGFiLCB7TGFiZWx9IGZyb20gJ0BzbXVpL3RhYidcblx0aW1wb3J0IFRhYkJhciBmcm9tICdAc211aS90YWItYmFyJ1xuXHRpbXBvcnQgSW50cm9kdWN0aW9uIGZyb20gJy4vSW50cm9kdWN0aW9uLnN2ZWx0ZSdcblx0aW1wb3J0IFJlc3VtZSBmcm9tICcuL1Jlc3VtZS5zdmVsdGUnXG5cdGltcG9ydCBQcm9qZWN0cyBmcm9tICcuL1Byb2plY3RzLnN2ZWx0ZSdcblx0aW1wb3J0IENvbnRhY3QgZnJvbSAnLi9Db250YWN0LnN2ZWx0ZSdcblx0aW1wb3J0IENvbnRlbnQgZnJvbSAnLi9Db250ZW50LnN2ZWx0ZSdcblx0aW1wb3J0IEVtcHR5IGZyb20gJy4vRW1wdHkuc3ZlbHRlJ1xuXG5cdGxldCBhY3RpdmUgPSAnSW50cm9kdWN0aW9uJ1xuXHRsZXQgYWN0aXZlUHJveHkgPSAnSW50cm9kdWN0aW9uJ1xuXHRjb25zdCBzZXRBY3RpdmUgPSAoKSA9PiBhY3RpdmVQcm94eSA9IGFjdGl2ZVxuPC9zY3JpcHQ+XG5cbjxzdHlsZT5cblxuXG5cblx0Lmhlcm8tdGV4dC1jb250YWluZXIge1xuXHRcdGhlaWdodDogY2FsYygxMDB2aCAtIDNlbSk7XG5cdFx0ZGlzcGxheTogZmxleDtcblx0XHRhbGlnbi1pdGVtczogY2VudGVyO1xuXHRcdGp1c3RpZnktY29udGVudDogY2VudGVyO1xuXHR9XG5cblx0Lmhlcm8tdGV4dCB7XG5cdFx0bWFyZ2luOiAwO1xuXHRcdGJhY2tncm91bmQtY29sb3I6ICMwMDAwMDA7XG5cdFx0cGFkZGluZzogNXZ3O1xuXHRcdHRleHQtc2hhZG93OiAzcHggM3B4ICM2MzAwZWU7XG5cdH1cblxuXHQuaGVyby1zdWJ0ZXh0IHtcblx0XHR0ZXh0LWFsaWduOiByaWdodDtcblx0fVxuXG5cdC50YWItYmFyLWJhY2tncm91bmQge1xuXHRcdGJhY2tncm91bmQtY29sb3I6IHdoaXRlO1xuXHRcdHBvc2l0aW9uOiBzdGlja3k7XG5cdFx0dG9wOiAwcHg7XG5cdFx0Ym90dG9tOiAwcHg7XG5cdFx0ei1pbmRleDogMjtcblx0fVxuXG5cdGgxIHtcblx0XHRmb250LWZhbWlseTogZnV0dXJhLXB0LCBzYW5zLXNlcmlmO1xuXHRcdGZvbnQtd2VpZ2h0OiAzMDA7XG5cdFx0Y29sb3I6IHdoaXRlO1xuXHRcdGZvbnQtc2l6ZTogOXZ3O1xuXHRcdHRleHQtdHJhbnNmb3JtOiBsb3dlcmNhc2U7XG5cdFx0bGV0dGVyLXNwYWNpbmc6IDRweDtcblx0XHRsaW5lLWhlaWdodDogMDtcblx0fVxuXG5cdGgyIHtcblx0XHRjb2xvcjogd2hpdGU7XG5cdFx0Zm9udC1mYW1pbHk6IGZ1dHVyYS1wdDtcblx0XHRmb250LXdlaWdodDogMzAwO1xuXHRcdGZvbnQtc2l6ZTogM3Z3O1xuXHR9XG48L3N0eWxlPlxuXG48bWFpbj5cblx0PGRpdiBjbGFzcz1cImhlcm8tdGV4dC1jb250YWluZXJcIj5cblx0XHQ8c3BhbiBjbGFzcyA9IFwiaGVyby10ZXh0XCI+XG5cdFx0XHQ8aDE+QnJ5c29uIERhdmlzPC9oMT5cblx0XHRcdDxoMiBjbGFzcyA9IFwiaGVyby1zdWJ0ZXh0XCI+XG5cdFx0XHRcdDwhLS0gZGV2ZWxvcGVyIGZvciBpbnRlcmFjdGl2ZSBtZWRpYSAtLT5cblx0XHRcdFx0aW50ZXJhY3RpdmUgbWVkaWEgKyB3ZWIgZGV2ZWxvcGVyXHRcblx0XHRcdDwvaDI+XG5cdFx0PC9zcGFuPlxuXHQ8L2Rpdj5cblx0PGRpdiBpZD1cInRhYi1iYXJcIiBjbGFzcz1cInRhYi1iYXItYmFja2dyb3VuZFwiPlxuXHRcdDxUYWJCYXIgdGFicz17WydJbnRyb2R1Y3Rpb24nLCAnUHJvamVjdHMnLCAnUmVzdW1lJywgJ0NvbnRhY3QnXX0gbGV0OnRhYiBiaW5kOmFjdGl2ZSA+IFxuXHRcdFx0PFRhYiBvbjpjbGljaz17KCkgPT4ge2RvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0YWItYmFyJykuc2Nyb2xsSW50b1ZpZXcodHJ1ZSk7IGFjdGl2ZVByb3h5PScnfX0ge3RhYn0+XG5cdFx0XHRcdDxMYWJlbD57dGFifTwvTGFiZWw+XG5cdFx0XHQ8L1RhYj5cblx0XHQ8L1RhYkJhcj5cblx0PC9kaXY+XG5cdDxDb250ZW50PlxuXHRcdHsjaWYgYWN0aXZlUHJveHkgPT09ICcnfVxuXHRcdFx0PEVtcHR5IC8+XG5cdFx0ezplbHNlIGlmIGFjdGl2ZVByb3h5ID09PSAnSW50cm9kdWN0aW9uJ31cblx0XHRcdDxJbnRyb2R1Y3Rpb24ge3NldEFjdGl2ZX0gLz5cblx0XHR7OmVsc2UgaWYgYWN0aXZlUHJveHkgPT09ICdQcm9qZWN0cyd9XG5cdFx0XHQ8UHJvamVjdHMge3NldEFjdGl2ZX0gLz5cblx0XHR7OmVsc2UgaWYgYWN0aXZlUHJveHkgPT09ICdSZXN1bWUnfVxuXHRcdFx0PFJlc3VtZSB7c2V0QWN0aXZlfSAvPlxuXHRcdHs6ZWxzZX1cblx0XHRcdDxDb250YWN0IHtzZXRBY3RpdmV9IC8+XG5cdFx0ey9pZn1cblx0PC9Db250ZW50PlxuPC9tYWluPiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFtQkMsb0JBQW9CLGVBQUMsQ0FBQyxBQUNyQixNQUFNLENBQUUsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUN6QixPQUFPLENBQUUsSUFBSSxDQUNiLFdBQVcsQ0FBRSxNQUFNLENBQ25CLGVBQWUsQ0FBRSxNQUFNLEFBQ3hCLENBQUMsQUFFRCxVQUFVLGVBQUMsQ0FBQyxBQUNYLE1BQU0sQ0FBRSxDQUFDLENBQ1QsZ0JBQWdCLENBQUUsT0FBTyxDQUN6QixPQUFPLENBQUUsR0FBRyxDQUNaLFdBQVcsQ0FBRSxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sQUFDN0IsQ0FBQyxBQUVELGFBQWEsZUFBQyxDQUFDLEFBQ2QsVUFBVSxDQUFFLEtBQUssQUFDbEIsQ0FBQyxBQUVELG1CQUFtQixlQUFDLENBQUMsQUFDcEIsZ0JBQWdCLENBQUUsS0FBSyxDQUN2QixRQUFRLENBQUUsTUFBTSxDQUNoQixHQUFHLENBQUUsR0FBRyxDQUNSLE1BQU0sQ0FBRSxHQUFHLENBQ1gsT0FBTyxDQUFFLENBQUMsQUFDWCxDQUFDLEFBRUQsRUFBRSxlQUFDLENBQUMsQUFDSCxXQUFXLENBQUUsU0FBUyxDQUFDLENBQUMsVUFBVSxDQUNsQyxXQUFXLENBQUUsR0FBRyxDQUNoQixLQUFLLENBQUUsS0FBSyxDQUNaLFNBQVMsQ0FBRSxHQUFHLENBQ2QsY0FBYyxDQUFFLFNBQVMsQ0FDekIsY0FBYyxDQUFFLEdBQUcsQ0FDbkIsV0FBVyxDQUFFLENBQUMsQUFDZixDQUFDLEFBRUQsRUFBRSxlQUFDLENBQUMsQUFDSCxLQUFLLENBQUUsS0FBSyxDQUNaLFdBQVcsQ0FBRSxTQUFTLENBQ3RCLFdBQVcsQ0FBRSxHQUFHLENBQ2hCLFNBQVMsQ0FBRSxHQUFHLEFBQ2YsQ0FBQyJ9 */";
    	append_dev(document_1.head, style);
    }

    // (77:4) <Label>
    function create_default_slot_3$1(ctx) {
    	let t_value = /*tab*/ ctx[5] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		l: function claim(nodes) {
    			t = claim_text(nodes, t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*tab*/ 32 && t_value !== (t_value = /*tab*/ ctx[5] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$1.name,
    		type: "slot",
    		source: "(77:4) <Label>",
    		ctx
    	});

    	return block;
    }

    // (76:3) <Tab on:click={() => {document.getElementById('tab-bar').scrollIntoView(true); activeProxy=''}} {tab}>
    function create_default_slot_2$1(ctx) {
    	let label;
    	let current;

    	label = new Label({
    			props: {
    				$$slots: { default: [create_default_slot_3$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(label.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(label.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(label, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const label_changes = {};

    			if (dirty & /*$$scope, tab*/ 96) {
    				label_changes.$$scope = { dirty, ctx };
    			}

    			label.$set(label_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(label.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(label.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(label, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(76:3) <Tab on:click={() => {document.getElementById('tab-bar').scrollIntoView(true); activeProxy=''}} {tab}>",
    		ctx
    	});

    	return block;
    }

    // (75:2) <TabBar tabs={['Introduction', 'Projects', 'Resume', 'Contact']} let:tab bind:active >
    function create_default_slot_1$2(ctx) {
    	let tab;
    	let current;

    	tab = new Tab({
    			props: {
    				tab: /*tab*/ ctx[5],
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tab.$on("click", /*click_handler*/ ctx[3]);

    	const block = {
    		c: function create() {
    			create_component(tab.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(tab.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tab, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tab_changes = {};
    			if (dirty & /*tab*/ 32) tab_changes.tab = /*tab*/ ctx[5];

    			if (dirty & /*$$scope, tab*/ 96) {
    				tab_changes.$$scope = { dirty, ctx };
    			}

    			tab.$set(tab_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tab.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tab.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tab, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(75:2) <TabBar tabs={['Introduction', 'Projects', 'Resume', 'Contact']} let:tab bind:active >",
    		ctx
    	});

    	return block;
    }

    // (90:2) {:else}
    function create_else_block(ctx) {
    	let contact;
    	let current;

    	contact = new Contact({
    			props: { setActive: /*setActive*/ ctx[2] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(contact.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(contact.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(contact, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(contact.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(contact.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(contact, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(90:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (88:37) 
    function create_if_block_3(ctx) {
    	let resume;
    	let current;

    	resume = new Resume({
    			props: { setActive: /*setActive*/ ctx[2] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(resume.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(resume.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(resume, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(resume.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(resume.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(resume, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(88:37) ",
    		ctx
    	});

    	return block;
    }

    // (86:39) 
    function create_if_block_2$1(ctx) {
    	let projects;
    	let current;

    	projects = new Projects({
    			props: { setActive: /*setActive*/ ctx[2] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(projects.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(projects.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(projects, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(projects.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(projects.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(projects, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(86:39) ",
    		ctx
    	});

    	return block;
    }

    // (84:43) 
    function create_if_block_1$1(ctx) {
    	let introduction;
    	let current;

    	introduction = new Introduction({
    			props: { setActive: /*setActive*/ ctx[2] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(introduction.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(introduction.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(introduction, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(introduction.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(introduction.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(introduction, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(84:43) ",
    		ctx
    	});

    	return block;
    }

    // (82:2) {#if activeProxy === ''}
    function create_if_block$2(ctx) {
    	let empty_1;
    	let current;
    	empty_1 = new Empty({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(empty_1.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(empty_1.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(empty_1, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(empty_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(empty_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(empty_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(82:2) {#if activeProxy === ''}",
    		ctx
    	});

    	return block;
    }

    // (81:1) <Content>
    function create_default_slot$3(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;

    	const if_block_creators = [
    		create_if_block$2,
    		create_if_block_1$1,
    		create_if_block_2$1,
    		create_if_block_3,
    		create_else_block
    	];

    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*activeProxy*/ ctx[1] === "") return 0;
    		if (/*activeProxy*/ ctx[1] === "Introduction") return 1;
    		if (/*activeProxy*/ ctx[1] === "Projects") return 2;
    		if (/*activeProxy*/ ctx[1] === "Resume") return 3;
    		return 4;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if_block.l(nodes);
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(81:1) <Content>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let main;
    	let div0;
    	let span;
    	let h1;
    	let t0;
    	let t1;
    	let h2;
    	let t2;
    	let t3;
    	let div1;
    	let tabbar;
    	let updating_active;
    	let t4;
    	let content;
    	let current;

    	function tabbar_active_binding(value) {
    		/*tabbar_active_binding*/ ctx[4].call(null, value);
    	}

    	let tabbar_props = {
    		tabs: ["Introduction", "Projects", "Resume", "Contact"],
    		$$slots: {
    			default: [
    				create_default_slot_1$2,
    				({ tab }) => ({ 5: tab }),
    				({ tab }) => tab ? 32 : 0
    			]
    		},
    		$$scope: { ctx }
    	};

    	if (/*active*/ ctx[0] !== void 0) {
    		tabbar_props.active = /*active*/ ctx[0];
    	}

    	tabbar = new TabBar({ props: tabbar_props, $$inline: true });
    	binding_callbacks.push(() => bind(tabbar, "active", tabbar_active_binding));

    	content = new Content({
    			props: {
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			span = element("span");
    			h1 = element("h1");
    			t0 = text("Bryson Davis");
    			t1 = space();
    			h2 = element("h2");
    			t2 = text("interactive media + web developer");
    			t3 = space();
    			div1 = element("div");
    			create_component(tabbar.$$.fragment);
    			t4 = space();
    			create_component(content.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			main = claim_element(nodes, "MAIN", {});
    			var main_nodes = children(main);
    			div0 = claim_element(main_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			span = claim_element(div0_nodes, "SPAN", { class: true });
    			var span_nodes = children(span);
    			h1 = claim_element(span_nodes, "H1", { class: true });
    			var h1_nodes = children(h1);
    			t0 = claim_text(h1_nodes, "Bryson Davis");
    			h1_nodes.forEach(detach_dev);
    			t1 = claim_space(span_nodes);
    			h2 = claim_element(span_nodes, "H2", { class: true });
    			var h2_nodes = children(h2);
    			t2 = claim_text(h2_nodes, "interactive media + web developer");
    			h2_nodes.forEach(detach_dev);
    			span_nodes.forEach(detach_dev);
    			div0_nodes.forEach(detach_dev);
    			t3 = claim_space(main_nodes);
    			div1 = claim_element(main_nodes, "DIV", { id: true, class: true });
    			var div1_nodes = children(div1);
    			claim_component(tabbar.$$.fragment, div1_nodes);
    			div1_nodes.forEach(detach_dev);
    			t4 = claim_space(main_nodes);
    			claim_component(content.$$.fragment, main_nodes);
    			main_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h1, "class", "svelte-1j89oix");
    			add_location(h1, file$c, 66, 3, 1195);
    			attr_dev(h2, "class", "hero-subtext svelte-1j89oix");
    			add_location(h2, file$c, 67, 3, 1220);
    			attr_dev(span, "class", "hero-text svelte-1j89oix");
    			add_location(span, file$c, 65, 2, 1165);
    			attr_dev(div0, "class", "hero-text-container svelte-1j89oix");
    			add_location(div0, file$c, 64, 1, 1129);
    			attr_dev(div1, "id", "tab-bar");
    			attr_dev(div1, "class", "tab-bar-background svelte-1j89oix");
    			add_location(div1, file$c, 73, 1, 1360);
    			add_location(main, file$c, 63, 0, 1121);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			append_dev(div0, span);
    			append_dev(span, h1);
    			append_dev(h1, t0);
    			append_dev(span, t1);
    			append_dev(span, h2);
    			append_dev(h2, t2);
    			append_dev(main, t3);
    			append_dev(main, div1);
    			mount_component(tabbar, div1, null);
    			append_dev(main, t4);
    			mount_component(content, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const tabbar_changes = {};

    			if (dirty & /*$$scope, tab, activeProxy*/ 98) {
    				tabbar_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_active && dirty & /*active*/ 1) {
    				updating_active = true;
    				tabbar_changes.active = /*active*/ ctx[0];
    				add_flush_callback(() => updating_active = false);
    			}

    			tabbar.$set(tabbar_changes);
    			const content_changes = {};

    			if (dirty & /*$$scope, activeProxy*/ 66) {
    				content_changes.$$scope = { dirty, ctx };
    			}

    			content.$set(content_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabbar.$$.fragment, local);
    			transition_in(content.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabbar.$$.fragment, local);
    			transition_out(content.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(tabbar);
    			destroy_component(content);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let active = "Introduction";
    	let activeProxy = "Introduction";
    	const setActive = () => $$invalidate(1, activeProxy = active);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		document.getElementById("tab-bar").scrollIntoView(true);
    		$$invalidate(1, activeProxy = "");
    	};

    	function tabbar_active_binding(value) {
    		active = value;
    		$$invalidate(0, active);
    	}

    	$$self.$capture_state = () => ({
    		Tab,
    		Label,
    		TabBar,
    		Introduction,
    		Resume,
    		Projects,
    		Contact,
    		Content,
    		Empty,
    		active,
    		activeProxy,
    		setActive
    	});

    	$$self.$inject_state = $$props => {
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("activeProxy" in $$props) $$invalidate(1, activeProxy = $$props.activeProxy);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [active, activeProxy, setActive, click_handler, tabbar_active_binding];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document_1.getElementById("svelte-1j89oix-style")) add_css$7();
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
