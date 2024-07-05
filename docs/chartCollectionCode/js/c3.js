/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__, or convert again using --optional-chaining
 * DS104: Avoid inline assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * DS208: Avoid top-level this
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
// C3 Visualization Library

// This work is license under a Creative Commons Attribution 4.0 License.
// All rights reserved.

// @note **Please refer to {c3.Base} for an overview of the c3 visualization interface.**
// ## Dependencies:
// * **D3**
// * **Crossfilter** - Optional to improve sorting performance
class c3 {
    static initClass() {
        this.version = "0.1";
    }

    // Create a new c3 selection
    // @param parent [d3.selection] Parent selection
    // @param query [String] Query string to make the selection.
    // @param before [String] An optional selector to insert nodes before.
    //   `:first-child` will insert nodes at the begining.
    // @param children_only [Boolean] Only select direct children, not all descendents.
    // @return [c3.selection]
    static select(parent, query, before, children_only){ return new c3.Selection(parent, query, before, children_only); }
}
c3.initClass();

// Export c3 to the global namespace
this.c3 = c3;

// Export NPM module
if (typeof module !== 'undefined' && module !== null) { module.exports = c3; }

// Check for dependencies
if ((typeof d3 === 'undefined' || d3 === null)) { throw Error("D3 library is required for C3"); }


//##################################################################
// Utility Functions
//##################################################################
c3.util = class util {
    // Extend an object with the properties in another
    // @param dest [Object] Destination object that will get all properties of the src object
    // @param src [Object] Source object
    // @return [Object] Returns the destination object
    static extend(dest, src){ if (src != null) { for (var k in src) { var v = src[k]; dest[k] = v; } return dest; } }

    // Fill in properties of an object based on another iff not already defined
    // @param dest [Object] Destination object that will get all properties of the src object if not defined
    // @param src [Object] Source object with default values
    // @return [Object] Returns the destination object
    static defaults(dest, src){ if (src != null) { for (var k in src) { var v = src[k]; if (dest[k] == null) { dest[k] = v; } } return dest; } }

    // Spin Wait
    // @param ms [Number] Number of milliseconds to spin
    static spin(ms){ const start=new Date(); while ((new Date()-start) < ms) { null; } }

//    # Deep clone of an object hierarchically so all nested references point to new objects.
//    # @return [Object] Returns the new object
//    @replicate: (obj)->
//        new_obj = new obj.constructor()
//        new_obj[key] = clone obj[key] for key of obj
//        return new_obj
//
//    # Shallow clone an object.  Copied references will point to their original objects.
//    # @return [Object] Returns the new object
//    @clone: (obj)->
//        new_obj = new obj.constructor()
//        new_obj[key] = value for key, value of obj
//        return new_obj

    // Test if an object is empty
    static isEmpty(obj){
        for (var property in obj) { return false; }
        return true;
    }
};


//##################################################################
// Array Helpers
//##################################################################
c3.array = class array {
    // Remove an item from an array
    static remove_item(arr, item){ return arr.splice(arr.indexOf(item), 1); }

    // Sort an array in ascending order based on the accessor.
    // @note Please include the Crossfilter library for improved performance.
    // @return [Array] Returns the sorted array
    static sort_up(arr, accessor){
        if (accessor == null) { accessor = d => d; }
        if (typeof crossfilter !== 'undefined' && crossfilter !== null) { crossfilter.quicksort.by(accessor)(arr, 0, arr.length); return arr;
        } else { return arr.sort((a, b) => accessor(a)-accessor(b)); }
    }
    // @return [Array] Returns the sorted array
    static sort_down(arr, accessor){
        if (typeof crossfilter !== 'undefined' && crossfilter !== null) { c3.array.sort_up(arr,d => -accessor(d)); return arr;
        } else { return arr.sort((a, b) => accessor(b)-accessor(a)); }
    }
};

//    @last: (arr)-> arr[arr.length-1]
//    @front: (arr, n)-> arr[..n-1]
//    @back: (arr, n)-> arr[-n..]

//    # Merge the second array into the first
//    @merge: (first, second)-> Array::push.apply first, second; first
//
//    # Returns array with duplicate elements removed.
//    # Requires that values are coercable into a string.  Does not retain original ordering.
//    @unique: (arr)->
//        map = {}
//        map[v] = v for v in arr
//        return (v for k, v of map)


//##################################################################
// HTTP Helpers
//##################################################################
c3.http = class http {
    // Parse a string to get an object of key/value pairs or get the value for a specific key
    // @param string [String] string to parse
    // @param key [String] optional key to parse to get the value
    // @return [Object, String] The value associated with the key or null if it does not exist.  If not key is specified it returns an object of all key/value pairs.
    static deparam(string, key){
        if (!string) { return (key ? null : {}); }
        const params = {};
        for (var pair of Array.from(string.split('&'))) {
            var split = pair.split('=');
            if (split[0]===key) { return ((split[1] != null) ? split[1] : ''); }
            params[split[0]] = split[1];
        }
        if (key) { return null; } else { return params; }
    }

    // Parse the "search" query part of a URL to get the value from a key/value pair
    // @param key [String] key to query
    // @return [Object, String] The value associated with the key or null if it does not exist.  If not key is specified it returns an object of all key/value pairs.
    static deparam_query(key){ return c3.http.deparam(document.location.search.slice(1), key); }
};


//##################################################################
// HTML Helpers
//##################################################################
(function() {
    let escapes = undefined;
    let tokens = undefined;
    const Clsc3 = (c3.html = class html {
        static initClass() {
            escapes = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;',
                '/': '&#x2F;',
                ',': '&#44;'
            };
            tokens = '[' + ((() => {
                const result = [];
                for (var token in escapes) {
                    result.push(token);
                }
                return result;
            })()) + ']';
        }

        // Escape text so it can be output as HTML
        // @return [String] Returns the escaped string
        static escape(string){ return String(string).replace(RegExp(tokens,'g'), d => escapes[d]); }
    });
    Clsc3.initClass();
    return Clsc3;
})();

//    # The following will floor() any numerical values in an SVG path string
//    # I measured this to improve performance for interpolations by about 1/3
//    # Unfortunatly, it's not accurate enough for scaled layers...
//    # @param [String] The SVG path string to floor
//    @floor_path = (path)=>
//        use = true
//        (char for char in path when use = (use and char!='.') or (not use and (char<'0' or char>'9'))).join ''


//##################################################################
// DOM Helpers
//##################################################################
//class c3.dom
//    # Wrap a provided `wrap_node` around the inner content of a `node`
//    # @param node [HTMLElement] node with inner content to be wrapped
//    # @param wrap_node [HTMLElement] node to wrap around inner content
//    @wrap_inner: (node, wrap_node)->
//        while node.firstChild then wrap_node.appendChild node.firstChild
//        node.appendChild wrap_node


//##################################################################
// D3 Helpers
//##################################################################
c3.d3 = class d3 {
    // Set a D3 range.  Ordinal ranges should use rangePoints() instead of range()
    static set_range(scale, interval){
        // Default minimal range to allow rendering for zero-sized charts before they are attached to the DOM
        let left;
        if ((interval[0] === 0) && (interval[1] === 0)) { interval = [0,1]; }
        return (left = __guardMethod__(scale, 'rangePoints', o => o.rangePoints(interval))) != null ? left : (scale != null ? scale.range(interval) : undefined);
    }
};


//##################################################################
// Private Utility Functions
//##################################################################

// Always returns a function.  If f is a function, just return it.
// Otherwise, return a function that returns the value f.
c3.functor = function(f){ if (typeof f === 'function') { return f; } else { return () => f; } };


//##################################################################
// Common Layouts
//##################################################################
c3.Layout = class Layout {};


//##################################################################
// Tree Layout
//##################################################################

// A tree layout to parition elements hierarchically.
c3.Layout.Tree = class Tree {
    // @param options must contain:
    // `key` - accessor to get a key from a data element
    // Either `parent_key, `children_keys`, or `children` to define the tree
    // Either `value` or `self_value` for partitioning the nodes.
    constructor(options){
        this.construct = this.construct.bind(this);
        this.revalue = this.revalue.bind(this);
        this.layout = this.layout.bind(this);
        c3.util.extend(this, options);
    }

    // Construct the tree hierarchy.
    // @param data [Array] Array of data elements
    // @return [Object] Return an object mapping element keys to nodes
    // A node is an object with the following properties:
    //  datum, children, x1, x2, y1, y2, px1, px2, py1, py2
    construct(data){
        let key, node, set_depth;
        let datum;
        const old_nodes = this.nodes;
        const nodes = {};

        if (this.parent_key != null) {
            this.root_nodes = [];
            for (datum of Array.from(data)) {
                var name;
                node = nodes[name = this.key(datum)] != null ? nodes[name] : (nodes[name] = { children: [] });
                node.datum = datum;
                var parent_key = this.parent_key(datum);
                if (parent_key != null) {
                    var parent_node = nodes[parent_key];
                    if (parent_node != null) { parent_node.children.push(node);
                    } else { parent_node = (nodes[parent_key] = { children: [node] }); }
                    node.parent = parent_node;
                } else { this.root_nodes.push(node); }
            }
            set_depth = function(node, depth){
                node.y1 = depth;
                node.y2 = depth+1;
                return Array.from(node.children).map((child) => set_depth(child, depth+1));
            };
            for (node of Array.from(this.root_nodes)) { set_depth(node, 0); }

        } else if (this.children_keys != null) {
            const roots = {};
            for (datum of Array.from(data)) {
                key = this.key(datum);
                nodes[key] = { datum, children: this.children_keys(datum) };
                roots[key] = true;
            }
            for (key in nodes) {
                node = nodes[key];
                node.children = (() => {
                    if (node.children != null) {
                    let child_key;
                    for (child_key of Array.from(node.children)) {
                        roots[child_key] = false;
                        var child_node = nodes[child_key];
                        if ((child_node == null)) { throw Error("Missing child node"); }
                        child_node.parent = node;
                    }
                    return (() => {
                        const result = [];
                        for (child_key of Array.from(node.children)) {                             result.push(nodes[child_key]);
                        }
                        return result;
                    })();
                } else { return [];
            }
                })();
            }
            this.root_nodes = ((() => {
                const result1 = [];
                for (var root in roots) {
                    if (root) {
                        result1.push(nodes[key]);
                    }
                }
                return result1;
            })());
            set_depth = function(node, depth){
                node.y1 = depth;
                node.y2 = depth+1;
                return Array.from(node.children).map((child) => set_depth(child, depth+1));
            };
            for (node of Array.from(this.root_nodes)) { set_depth(node, 0); }

        } else { // @children? or no hierarchy
            var build_nodes = (datum, depth, parent)=> {
                let left;
                return node = (nodes[this.key(datum)] = {
                    datum,
                    parent,
                    y1: depth,
                    y2: depth+1,
                    children: ((Array.from((left = (typeof this.children === 'function' ? this.children(datum) : undefined)) != null ? left : [])).map((child) => build_nodes(child, depth+1, null)))
                });
            };
            this.root_nodes = ((() => {
                const result2 = [];
                for (datum of Array.from(data)) {                     result2.push(build_nodes(datum, 0));
                }
                return result2;
            })());
            for (key in nodes) {
                node = nodes[key];
                for (var child of Array.from(node.children)) {
                    child.parent = node;
                }
            }
        }

        if (old_nodes != null) {
            for (key in nodes) {
                node = nodes[key];
                var old_node = old_nodes[key];
                if (old_node != null) {
                    node.x1 = (node.px1 = old_node.x1);
                    node.x2 = (node.px2 = old_node.x2);
                    node.py1 = old_node.y1;
                    node.py2 = old_node.y2;
                }
            }
        }
        return this.nodes = nodes;
    }

    // Compute the "total value" of each node
    // @return a callback to get the total value of a data element.
    revalue() {
        let node;
        if (this.self_value != null) {
            const {
                self_value
            } = this;
            var compute_values = function(node){
                node.value = self_value(node.datum);
                for (var child of Array.from(node.children)) { node.value += compute_values(child); }
                return node.value;
            };
            for (node of Array.from(this.root_nodes)) { compute_values(node, 0); }
            return d=> this.nodes[this.key(d)].value;
        }

        if (this.value != null) {
            for (var key in this.nodes) {
                node = this.nodes[key];
                node.value = this.value(node.datum);
            }
            return this.value;

        } else { throw Error("Tree layout must define either `value` or `self_value` option."); }
    }

    // Layout the nodes x and y values
    // @param sort [Boolean, Function] Specify if child nodes should be sorted in the layout
    //    * `true` - Sort based on the _total value_ of the child node.
    //    * `false` - Don't sort
    //    * Callback function - Function that takes a data element and returns the value to sort by.
    // @param limit_min_percent [Number] - Minimum percentage of the root_domain to
    //   actually layout an element and its children.
    // @param root_datum Only layout elements that are parents or children of this element.
    // @return [Array] Return an array of data elements that were actually laid out
    //   given the limit_min_percent and root_datum filters.
    layout(sort1, limit_min_percent, root_datum = null){
        let node;
        if (sort1 == null) { sort1 = false; }
        this.sort = sort1;
        if (limit_min_percent == null) { limit_min_percent = 0; }
        const sort = (() => { switch (this.sort) {
          case true: return node => -node.value;
          case false: case null: return null;
          default: return node=> -this.sort(node.datum);
        } })();

        // Calculate the total value for the entire hierarchy
        let total_value = 0;
        for (node of Array.from(this.root_nodes)) { total_value += node.value; }

        // Calculate the minimum value to render based on the current root.
        const root_node = (root_datum != null) ? this.nodes[this.key(root_datum)] : null;
        const limit_min = limit_min_percent * (((root_node != null ? root_node.value : undefined) / total_value) || 1);

        // Order and partition the nodes
        var partition = (nodes, domain, total)=> {
            const delta = domain[1]-domain[0];
            let angle = domain[0];

            // If the domain is inconsequential, then simplify the partitioning.
            if (!total || (delta < limit_min)) {
                for (node of Array.from(nodes)) {
                    // If the node is inconsequential and hasn't modved, then skip branch
                    if ((node.px1===angle) && (node.px2===angle) && (node.x1===angle) && (node.x2===angle)) {
                        continue;
                    }
                    node.px1 = node.x1;
                    node.px2 = node.x2;
                    node.py1 = node.y1;
                    node.py2 = node.y2;
                    node.x1 = angle;
                    node.x2 = angle;
                    if (node.children.length) {
                        partition(node.children, domain, 0);
                    }
                }
                return false;
            } else {
                if (sort) { c3.array.sort_up(nodes, sort); }
                const dx = delta / total;
                for (node of Array.from(nodes)) {
                    var start;
                    node.px1 = node.x1;
                    node.px2 = node.x2;
                    node.py1 = node.y1;
                    node.py2 = node.y2;
                    node.x1 = (start = angle);
                    node.x2 = (angle += dx * node.value);
                    if (node.children.length) {
                        partition(node.children, [start, angle], node.value);
                    }
                }
                return true;
            }
        };
        partition(this.root_nodes, [0,1], total_value);

        // Collect current set of relevant data based on the root node and limit filter
        const current_data = [];
        const root_domain = [(root_node != null ? root_node.x1 : undefined) != null ? (root_node != null ? root_node.x1 : undefined) : 0, (root_node != null ? root_node.x2 : undefined) != null ? (root_node != null ? root_node.x2 : undefined) : 1];
        var collect_nodes = function(nodes){
            for (node of Array.from(nodes)) {
                if (((node.x2-node.x1) > limit_min) && (node.x2 > root_domain[0]) && (node.x1 < root_domain[1])) {
                    current_data.push(node.datum);
                    if (node.children.length) { collect_nodes(node.children); }
                }
            }
            return null; // avoid coffee comprehension
        };
        collect_nodes(this.root_nodes);
        return current_data;
    }
};


//##################################################################
// Selection
//##################################################################
c3.Selection = class Selection {};

// c3 selection options are used to allow the **user** of a c3 visualization to define a set of
// values and accessors callbacks to set the styles, classes, event handlers, text, etc of
// specific set of DOM nodes defined in that visualization's c3 {c3.Selection selection}.
//
// For example, the user can set these options in the `circle_options` property in a scatter plot layer to describe
// how those circles should behave.  Because they are persisted in an options object, the c3
// visualization can continue to use them to update the circles based on new data, etc.
// The user can also usually dynamically change the options at a later time, and the changes
// will be reflected when the visualization redraws or restyles.
//
// _The c3 selection options class is really just a convention which described the types of properties
// users can set.  You don't actually need to instantiate this class prototype, just make sure
// that the object you use has the same property names._
let Clsc3 = (c3.Selection.Options = class Options {
    static initClass() {
        // [String, Function] A function or value to set the **CSS class** of the DOM nodes.
        // The function is called with the datum and index of the data elements as arguments.
        // The `this` context is setup to refer to the DOM node.
        this.prototype.class = undefined;
    
        // [Object] An object to set **CSS classes**.  Keys in the object represent class names
        // and values are either a boolean or a function that returns a boolean that determines
        // if that class should be added or removed from the node.  The functions are passed
        // the datum and index of the data element as arguments.  The `this` context is setup
        // to refer to the DOM node.
        this.prototype.classes = undefined;
    
        // [Object] An object to set **CSS styles**.  Keys in the object represent style names
        // and values are either a value or a function that returns the value to set the style.
        // A null value will remove the style from the node.
        // The functions are passed the datum and index of the data element as arguments.
        // The `this` context is setup to refer to the DOM node.
        this.prototype.styles = undefined;
    
        // [Object] An object to set **event handlers** for the DOM nodes.  Keys in the object
        // represent event names and values are the event handler functions that will be called.
        // The handlers are setup and called by D3 which pass the datum and index of the data
        // element as arguments.  The `this` context refers to the DOM node.  Event names may be
        // namespaced to manage multiple handlers on the same event, please see
        // {https://github.com/mbostock/d3/wiki/Selections#wiki-on d3.selection.on}.
        // _Note that the conventions used by D3 for managing multiple handlers and namespacing
        // are different from JQuery's event handling._
        this.prototype.events = undefined;
    
        // [String, Function] A string or function to set the **text** of the DOM nodes.
        // This is not applicable for all node types.
        // If this is a function, it will be called with the datum and index of the data element
        // as arguments and the `this` context setup to refer to the DOM node.
        this.prototype.text = undefined;
    
        // [String, Function] A string or function to set the child **HTML** content for the DOM nodes.
        // This is not applicable for all node types.
        // If this is a function, it will be called with the datum and index of the data element
        // as arguments and the `this` context setup to refer to the DOM node.
        //
        // Using this instead of {c3.Selection.Options.text text} can be useful in some
        // circumstances where you would like to use HTML markup for the text.
        // For example: "`This is <b>bold</b> text`".  However, if you use this for that reason
        // remember that you need to escape certain characters properly as you normally would in html.
        // Please also consider user-provided strings and security, as unsafe scripts may be included.
        // Using `html` will take precedence over setting `text` for a selection.
        this.prototype.html = undefined;
    
        // [String, Function] A string or function to set **tooltips** for the DOM nodes.
        // Setting this will cause the selection's nodes to have child `<title>` nodes created.
        // If this is a function, it will be called with the datum and index of the data element
        // as arguments and the `this` context setup to refer to the DOM node.
        this.prototype.title = undefined;
    
        // [Boolean] Request animation of the nodes when positioning their attributes.
        // New nodes will not animate, they will be immediately set to their new position.
        // However, new nodes will fade in and old nodes will fade out unless the opacity style is defined.
        this.prototype.animate = undefined;
    
        // [Number] Duration for any requested animations in ms.  Defaults to 750ms
        this.prototype.duration = undefined;
    
        // [Boolean] Animate the positioning of old elements as they are removed in addition to fading out
        this.prototype.animate_old = undefined;
    }
});
Clsc3.initClass();


// The c3 selection object is used internally as an abstraction around D3 selections to provide
// common functionality and patterns.  It is not meant to provide a general solution or replace D3.
// The motivation behind it is to normalize design patterns and performance optimizations
// useful for c3 visualizations on top of what D3 offers.
// In particular, it is useful to allow c3 users to define options which c3 visualizations
// can then use to do the actual DOM updates.
//
// **Please refer to {c3.Selection.Options} for user-configurable options.**
//
// c3 visualizations create c3.Selection objects to in turn create and represent various DOM nodes.
// {c3.Selection.Options} objects are used to persist user options that are used in subsequent
// updates or styling of nodes.  For example, there is a `circle_options` {c3.Selection.options} used to
// describe how to setup and style circles in a scatter plot.  You can still modify the different selection option
// properties, which will then be used as appropriate when redraw() or restyle() is called.
//
// ## Variables
// * **`all`** - [{https://github.com/mbostock/d3/wiki/Selections d3.selection}] D3 selection of all nodes
// * **`new`** - [{https://github.com/mbostock/d3/wiki/Selections d3.selection}] D3 selection of newly created nodes
// * **`old`** - [{https://github.com/mbostock/d3/wiki/Selections d3.selection}] D3 selection of nodes removed due to data binding
// @author Douglas Armstrong
// @see c3.Selection.Options
// @see ~c3.select
// @see https://github.com/mbostock/d3/wiki/Selections
Clsc3 = (c3.Selection = class Selection {
    static initClass() {
        // These are documented above because codo doesn't detect variables set with a function.
        this.prototype.all = d3.select();
        this.prototype.new = d3.select();
        this.prototype.old = d3.select();
        // [{c3.Selection.Options}] User configurable options for ongoing `update()` and `style()` manipulation of nodes.
        this.prototype.opt = {};
        // [Array<{c3.Selection.Options}>] Array of user options for each node in the selection based on the index.
        this.prototype.opt_array = undefined;
    }

    // Create a new selection
    // @param d3_selection [{https://github.com/mbostock/d3/wiki/Selections d3.selection}] The parent D3 selection
    // @param query [String] Search string to query in the parent selection to make this new selection.
    //   If a class is specified, such as "tag.class", then the class will automatically be
    //   added to newly created nodes.
    // @param before [String] An optional selector to insert nodes before.
    //   `:first-child` will insert nodes at the beginning.
    // @param children_only [boolean] Only select direct children, not all descendents
    // @todo Support all possible selectors.
    constructor(d3_selection, query, before, children_only){
        this.inherit = this.inherit.bind(this);
        this.singleton = this.singleton.bind(this);
        this.bind = this.bind.bind(this);
        this.remove = this.remove.bind(this);
        this.update = this.update.bind(this);
        this.position = this.position.bind(this);
        this.position_tweens = this.position_tweens.bind(this);
        this.style = this.style.bind(this);
        this.node = this.node.bind(this);
        if (d3_selection == null) { d3_selection = d3.select(); }
        this.query = query;
        this.before = before;
        if (this.query) {
            // Parse the namespace, tag, classes, and nested selectors
            if (Array.from(this.query).includes('|')) { [this.namespace, this.query] = Array.from(this.query.split('|')); } // CSS uses '|' as a namespace seperator
            [this.tag, this._query_class] = Array.from(this.query.split(' ').slice(-1)[0].split(/\.(.+)/));
            if (this.namespace) { this.tag = this.namespace+':'+this.tag; } // D3 uses ':' as the namespace seperator
            this._query_class = this._query_class != null ? this._query_class.replace('.',' ') : undefined;
            if (d3_selection != null) {
                this.all = d3_selection.selectAll(this.query); // inherit() calls with false selection
                if (children_only) { this.all = this.all.filter(function() { return d3_selection.some(nodes=> Array.from(nodes).includes(this.parentNode)); }); }
            }
        } else {
            this.all = d3_selection;
        }
    }

    // Create a new c3 selection based on the current selection
    // @param query [String] Search string to query in the parent selection to make this new selection.
    //   If a class is specified, such as "tag.class", then the class will automatically be
    //   added to newly created nodes.
    // @param before [String] An optional selector to insert nodes before.
    //   `:first-child` will insert nodes at the beginning.
    // @param children_only [boolean] Only select direct children, not all descendents
    select(query, before, children_only){ return new c3.Selection(this.all, query, before, children_only); }

    // Create a child node for each node in the parent's selection with a 1:1 mapping to the same data.
    // For example, if the parent selection had a set of svg:g nodes, then _inheriting_ from that
    // with a `circle` query would create an svg:circle node nested in each svg:g node.
    // @param query [String] Node type to create as nested nodes in the current selection
    // @param create [Boolean, String] Create missing child nodes for new nodes
    //   or set to `restore` to ensure that child nodes are created for existing parent nodes that don't
    //   already have them.
    // @param prepend [Boolean] If true, then prepend child nodes instead of appending them.
    //   Note that this will not prepend in front of any text content, only child nodes.
    inherit(query, create, prepend){
        if (create == null) { create = true; }
        if (prepend == null) { prepend = false; }
        const child = new c3.Selection(null, query);
        if (create) {
            // First just try to create new child nodes for any new parent nodes
            child.new = this.new.insert(child.tag, (prepend ? ':first-child' : null));
            if ((create==='restore') && child.new.empty() && !this.all.empty()) {
                this.all.each(function() { // Only create child nodes if they don't already exist
                    const parent = d3.select(this);
                    const child_node = parent.selectAll(child.tag).data(parent.data()).enter().append(child.tag);
                    if (child._query_class != null) { return child_node.classed(child._query_class, true); }
                });
            }
            if (child._query_class != null) { child.new.classed(child._query_class, true); }
        }
        child.all = this.all.select(query);
        child.old = this.old.select(query);
        return child;
    }

    // Create a single DOM node based on the passed in data.  Ensure that only one node will be created
    // and will remove extra nodes that match the query if they previously existed.
    // @param datum [*] The datum to bind to the DOM node.  This may be left undefined.
    singleton(datum){ return this.bind([datum]); }

    // Update the DOM nodes based on the provided data using D3.
    // Create new nodes and remove them as necessary so there is a node for each element in
    // the data array and they are bound together.
    // The `key` function is optional and is used to uniquely identify data elements.
    // So, even if the data is reordered in subsequent calls to update, they will still be
    // bound to the same DOM nodes.
    // Animate opacity for entering or exiting nodes if `animate` is set in the options
    // unless the opacity style is defined.
    // @param data [Array] Array of data to bind to the DOM
    // @param key [Function] Accessor to uniquely identify data elements
    bind(data, key){
        this.key = key;
        if (!this.tag) { throw "Cannot bind() a selection that doesn't have a selection query set"; }
        const animate = this._animate && this.opt.duration && ((this.opt.styles != null ? this.opt.styles.opacity : undefined) == null);
        this.all = this.all.data(data, this.key);
        if (animate) { // At this point the update and enter selections have not been merged yet.
            this.all.style('opacity',1).interrupt('binding');
        }
            //@all.transition('binding').duration(@opt.duration).style('opacity',1)
        this.new = this.all.enter().insert(this.tag, this.before);
        this.old = this.all.exit();
        if (this._query_class != null) { this.new.classed(this._query_class, true); }
        if (animate) {
            this.new.style('opacity',0);
            this.new.transition('binding').duration(this.opt.duration).style('opacity',1);
            this.old.transition('binding').duration(this.opt.duration).style('opacity',0).remove();
        } else { this.old.remove(); }
        return this;
    }

    // Remove this selection
    remove() {
        if (this._animate) { return this.all.duration(this.opt.duration).style('opacity',0).remove();
        } else { return this.all.remove(); }
    }

    // Set persistent user-configurable options.  A reference to these options are stored in the
    // selection and are used for future manipulation in {c3.Selection#update `update()`}
    // and {c3.Selection#style `style()`}.
    // @param opt [c3.Selection.Options] _User-configurable_ options to define how to setup and style the
    //   selection's nodes.
    // @param opt_accessor [Function] An optional accessor to return
    // {c3.Selection.Options options} for a specific data element.
    options(opt, opt_accessor){ if (opt == null) { opt = {}; } this.opt = opt; this.opt_accessor = opt_accessor; if (this.opt.duration == null) { this.opt.duration = 750; } return this; }

    // Allow animations for this selection during binding or positioning if the user
    // requested them with `animate` in the {c3.Selection.Options}.
    // @param animate [Boolean] Allow animations
    animate(animate){
        if (animate == null) { animate = true; }
        if ((this.opt == null)) { throw "Please call options() before animate()"; }
        this._animate = animate && this.opt.animate;
        return this;
    }

    // This will setup event handlers for new nodes and update classes, tooltips,
    // text, and html for all nodes based on the current data and {c3.Selection.Options options}.
    update(){
        // Setup the static classes
        if (this.opt.class != null) { this.new.attr('class', this.opt.class); }
        if (this._query_class != null) { this.new.classed(this._query_class, true); }

        // Add text or HTML content
        if (this.opt.html != null) { this.all.html(this.opt.html);
        } else if (this.opt.text != null) { this.all.text(this.opt.text); }

        // Add tooltips
        if (this.opt.title != null) {
            const selection = (typeof this.opt.title === 'function' ? this.all : this.new);
            if (this.all.node() instanceof SVGElement) {
                //selection.html (d,i,j)=> '<title>'+c3.functor(@opt.title)(d,i,j)+'</title>' # This approach was slower in profiling on Chrome
                this.new.append('title');
                if (selection.length <= 1) {
                    selection.select('title').text(this.opt.title);
                // Preserve the i,j semantics for setting titles with grouped D3 selections
                } else {
                    const self = this;
                    selection.each(function(d,i,j){ return d3.select(this).selectAll('title').text(self.opt.title(d,i,j)); });
                }
            } else { selection.attr('title', this.opt.title); }
        }

        // Add event handlers
        if (this.opt.events != null) { this.new.on(this.opt.events); }

        // Apply any options based on opt_accessor
        if (this.opt_accessor != null) {
            const {
                opt_accessor
            } = this;
            this.all.each(function(d,i,j){ let opt;
            if (opt = opt_accessor(d,i,j)) {
                const node = d3.select(this);
                if (opt.events != null) { node.on(opt.events); }
                if (opt.title != null) {
                    let title;
                    if (this instanceof SVGElement) {
                        title = node.selectAll('title').data([d]);
                        title.enter().append('title');
                        title.text(opt.title);
                    } else { node.attr('title', opt.title); }
                }
                if (opt.html != null) { return node.html(opt.html);
                } else if (opt.text != null) { return node.text(opt.text); }
            }
             });
        }

        return this;
    }

    // Update the attribute values for the dom nodes of this selection based on the values
    // and callbacks set in attrs.
    // @param attrs [Object] A map where the keys represent DOM attribute names and the
    //   values are the corresponding values or functions to set them.  The functions are called
    //   via D3.  They are passed the bound datum and index to the data as arguments and the `this`
    //   context is set to refer to the HTML element.
    // @param old_attrs [Object] A map for the previous attributes to use for
    //   new elements if they are animated.
    position(attrs, old_attrs){
        let selection;
        if (this._animate) {
            this.new.attr(old_attrs != null ? old_attrs : attrs);
            selection = this.all.transition('position.attrs').duration(this.opt.duration);
        } else { selection = this.all; }
        selection.attr(attrs);
        if (this._animate && this.opt.animate_old) {
            this.old.transition('position.attrs').duration(this.opt.duration).attr(attrs);
        }
        return this;
    }

    // Update the attribute values for the dom nodes of this selection based on tween functions in `attrs`
    // @param tweens [Object] A map where the keys represent DOM attribute names and the
    //   values are corresponding tween functions for animating them.  The functions are called
    //   via D3.  They are passed the bound datum and index to the data as arguments and the `this`
    //   context refers to the HTML element.  They should return a "tween" function thich takes a time
    //   parameter from 0-1 as the transition animation progresses based on the easing function.  It is the
    //   tween function that should finally return the value of the attribute for that point in the transition.
    position_tweens(attrs){
        let name, tween;
        let transition = this.all.transition('position.tweens').duration(this._animate ? this.opt.duration : 0);
        for (name in attrs) { tween = attrs[name]; transition.attrTween(name,tween); }
        if (this._animate && this.opt.animate_old) {
            transition = this.old.transition('position.tweens').duration(this.opt.duration);
            for (name in attrs) { tween = attrs[name]; transition.attrTween(name,tween); }
        }
        return this;
    }

    // A method to style and setup CSS classes for the nodes in the selection based on the current {c3.Selection.options options}.
    // @param style_new [Boolean] By default all nodes will be updated.
    //   If this is set, then only new nodes will be updated.
    //   This only works if the data was bound with a key function to avoid nodes having incorrect styles
    //   when the bound data is dynamically rearranged.
    style(style_new){
        const selection = style_new && (this.key != null) ? this.new : this.all;
        if ((this.opt.class != null) && (typeof this.opt.class === 'function')) {
            selection.attr('class', this.opt.class);
            if (this._query_class != null) { selection.classed(this._query_class, true); }
        }
        if (this.opt.classes != null) { selection.classed(this.opt.classes); }
        if (this.opt.styles != null) { selection.style(this.opt.styles); }

        if (this.opt_accessor != null) {
            const {
                opt_accessor
            } = this;
            selection.each(function(d,i,j){ let opt;
            if (opt = opt_accessor(d,i,j)) {
                const node = d3.select(this);
                if (opt.class != null) { node.classed((typeof opt.class === 'function' ? opt.class(d,i,j) : opt.class), true); }
                if (opt.classes != null) { node.classed(opt.classes); }
                if (opt.styles != null) { return node.style(opt.styles); }
            }
             });
        }

        return this;
    }

    // Return a single HTML Element for this selection.  Mostly useful if you know the selection only represents a single node.
    // @return [HTMLElement] node
    node() { return this.all.node(); }
});
Clsc3.initClass();


//########################
// Events
//########################

// A mixin to add support for registering and triggering events
c3.Dispatch = class Dispatch {
    constructor() { 
        this.dispatcher = {};
        this.on = this.on.bind(this);
        this.trigger = this.trigger.bind(this);
    }

    // Register an event handler to catch events fired by the visualization.
    // Multiple handlers can be set by specifying a namespace for the event name like `event.namespace`
    // Remove a handler by passing `null` for the handler
    // @param event [String] The name of the event to handle.  _See the Exetensibility and Events section for {c3.Base}._
    // @param handler [Function] Callback function called with the event.  The arguments passed to the function are event-specific.
    on(event, handler){
        let namespace;
        [event, namespace] = Array.from(event.split('.'));
        if (this.dispatcher[event] == null) { this.dispatcher[event] = {}; }
        if (handler) { return this.dispatcher[event][namespace] = handler;
        } else { return delete this.dispatcher[event][namespace]; }
    }
    //on: (event, handler)-> @dispatcher[event] = handler

    // Trigger an event for this visualization.
    // Do not specify a namespace here.
    // @param event [String] Name of event to trigger.
    // @param args [arguments] Additional arguments are passed as arguments to the handler
    trigger(event, ...args){
        let handlers;
        if ((handlers = this.dispatcher[event]) != null) {
            for (var namespace in handlers) { var handler = handlers[namespace]; handler.apply(this, args); }
        }
    }
};
    //trigger: (event, args...)-> @dispatcher[event]?.apply this, args


//##################################################################
// Base
//##################################################################

// @abstract
// @author Douglas Armstrong
// The Base parent object that all c3 visualizations are inherited from.
//
// # Visualization Object Construction
// c3 follows the convention that users should pass an "options" object to render() or the constructor when
// creating a visualization object.  That options object is then used to "extend" the newly
// created visualization object.  Thus, any members of that options object become members of the visualization.
// With this mechanism any properties defined in the class prototype will act as a default value.
// Setting options are optional unless marked as **REQUIRED** in the documentation.
//
// @note _In the documentation, please look at the "Variables Summary" to see what properties can be set for each type of visualization._
//
// # External Interface
// This Base object defines a set of methods as the standard external interface for visualizations:
// * {c3.Base#render **render()** - Initial rendering (_usually only called once_)}
// * {c3.Base#resize **resize()** - Resize the visualization to match new div anchor size}
// * {c3.Base#redraw **redraw()** - Redraw the visualization to reflect updated data}
// * {c3.Base#restyle **restyle()** - Update the CSS styles and classes to reflect updated options}
//
// # Internal Implementation
// The following methods represent the implementation of the visualization.
// They are broken down this way to allow optimizations and reduce redundant work.
// Individual visualizations should implement virtual methods that are named the same as these
// only with a preceding underscore such as `_init()`, `_size()`, and so on.
// * {c3.Base#init **init()** - One-time initialization}
// * {c3.Base#size **size()** - Update state and scales based on new anchor div element size}
// * {c3.Base#update **update()** - Update any DOM data bindings or state based on new or modified data set}
// * {c3.Base#draw **draw(origin)** - Place the actual DOM elements based on the anchor size}
// * {c3.Base#style **style(style_new)** - Set the DOM element styles and classes}
//
// # Extensibility and Events
// To support extensibility and user customization of visualizations, all c3 visualizations will fire events
// to reflect the external API.  Clients may attach handlers to these events to perform additional actions,
// further modify the DOM, attach more handlers to DOM elements, freely leverage D3, etc.  These events are named
// to match the cooresponding external API.  Events named with an "_start" appended will also be fired before the
// coorespdoning external API action is taken to allow customizations to perform actions either before or
// after the default built-in behaviour.
//
// @method #on(event, handler)
//   Register an event handler to catch events fired by the visualization.
//   @param event [String] The name of the event to handle.  _See the Exetensibility and Events section for {c3.Base}._
//   @param handler [Function] Callback function called with the event.  The arguments passed to the function are event-specific.
//
// # Styling
// Visualizations generally have several approaches to determine the styles of various DOM elements
// with different performance and flexitility tradeoffs.
// * First, the c3 library itself sets various default styles for certain items.  These generally are
// about functionality and it tries not to specify a default look.
// * The client may set up CSS stylesheet rules to determine how various DOM elements look.  For example, the
// fill color for all area graphs may be set with "_.c3.plot layer.area path { fill: red; }_"
// * A CSS class can be assigned to a specific instance for per-chart styles.
// The {c3.Selection.Options.class `class`} and {c3.Selection.Options.classes `classes`} properties in
// {c3.Selection.Options} are useful for this.
// * {c3.Selection.Options.styles} provides a mechanism to set styles for individual elements based
// on a constant or a callback function.
// * Finally, with the aid of events, the user can attach a handler and manually modify the DOM
// with complete freedom using D3, JQuery, direct W3C DOM API, or any other mechanism.
//
// @example Creating and extending a new visualization
//   var my_table = new c3.Table({
//       anchor: '#my_div',
//       data: [ 1, 2, 3, 4 ],
//       columns: [
//           {
//               header: { text: "Number" },
//               cells: { text: (datum)=> datum },
//           }, {
//               header: { text: "Squared" },
//               cells: { text: (datum)=> datum * datum },
//           }
//       ]
//   });
//   my_table.on('redraw', function() { console.log("Table redraw was called; add customizations here."); });
Clsc3 = (c3.Base = class Base extends c3.Dispatch {
    static initClass() {
        this._next_uid = 0;
        // [String, DOM node] Optional selector string or DOM node to attach visualization to.
        // _If no anchor is provided, then a div node is created but not attached to the DOM when you render().
        // The anchor proprety refers to this node so you can attach it to the DOM later as you wish._
        //
        // Examples:
        // * `anchor: "#my_node"`
        // * `anchor: $('#my_node')[0]`
        // * `anchor: d3.select('#my_node').node()`
        // * `anchor: d3.select('#your_node').append('div').attr('id','my_node').node()`
        this.prototype.anchor = undefined;
        // [Number,String] The height of the visualization in pixels.  c3 will update this value when _{c3.Base#resize resize()}_ is called based on the anchor size.
        // _Either c3 can initially set this value based on the anchor element size or the user can set it, in which case c3 will size the anchor element accordingly._
        this.prototype.height = undefined;
        // [Number,String] The width of the visualization in pixels.  c3 will update this value when _{c3.Base#resize resize()}_ is called based on the anchor size.
        // _Either c3 can initially set this value based on the anchor element size or the user can set it, in which case c3 will size the anchor element accordingly._
        this.prototype.width = undefined;
        // [Object] Object pairs to set CSS styles.  This is only called during initial rendering.  Keys represent the style names and values are callbacks or values to set that style.
        this.prototype.anchor_styles = undefined;
        // [Object] An object to setup event handlers on the chart for user extensions with a declarative style.
        // The keys represent the event names and the values are the cooresponding handlers.
        // This is really just a shortcut for calling the `on()` method on your instantiated
        // visualization object.
        this.prototype.handlers = undefined;
    }

    constructor(opt) {
        super();
        this.render = this.render.bind(this);
        this.resize = this.resize.bind(this);
        this.redraw = this.redraw.bind(this);
        this.restyle = this.restyle.bind(this);
        initialize();
        c3.util.extend(this, opt);
        this.uid = c3.Base._next_uid++;
    }


    //###################
    // External Interface
    //###################

    // Initial rendering
    // @param opt [Object] An options object that is used to extend the c3 visualization with its provided options.
    render(opt){
        c3.util.extend(this, opt);
        this.trigger('render_start');
        this.init();
        this.trigger('render');
        this.trigger('resize_start');
        if (!this.rendered) { this.size(this.width,this.height); } else { this.size(); }
        this.trigger('resize');
        this.trigger('redraw_start', 'render');
        this.update('render');
        this.draw('render');
        this.trigger('redraw', 'render');
        this.trigger('restyle_start', false);
        this.style(true);
        this.trigger('restyle', false);
        this.rendered = true;
        this.trigger('rendered');
        return this;
    }

    // Resize the visualization explicitly or to match the size of its associated anchor div DOM element.
    // Call this if the DOM element changes size in order to properly refresh the visualization.
    // @param width [Number] Optional width to set the anchor DOM node width
    // @param height [Number] Optional height to set the anchor DOM node height
    resize(width, height){ if (this.rendered) {
        this.trigger('resize_start');
        this.size(width, height);
        this.trigger('resize');
        this.trigger('redraw_start', 'resize');
        this.draw('resize');
        this.trigger('redraw', 'resize');
        return this;
    } }

    // Update the visualization to reflect new/removed or updated data
    redraw(origin){ if (origin == null) { origin = 'redraw'; } if (this.rendered) {
        this.trigger('redraw_start', origin);
        this.update(origin);
        this.draw(origin);
        this.trigger('redraw', origin);
        this.trigger('restyle_start', true);
        this.style(true);
        this.trigger('restyle', true);
        return this;
    } }

    // Restyle the elements to reflect updated data
    restyle() { if (this.rendered) {
        this.trigger('restyle_start', false);
        this.style(false);
        this.trigger('restyle', false);
        return this;
    } }


    //########################
    // Internal Implementation
    //########################

    // Initialization
    init() {
        this._prep();
        return this._init();
    }
    _prep() {
        const anchor_selector = this.anchor; // @anchor could be node or selector or JQuery selection
        if (this.anchor == null) { this.anchor = document.createElement('div'); }
        const d3_anchor = d3.select(this.anchor);
        this.anchor = d3_anchor.node(); // Now @anchor is always a node
        if (!this.anchor) { throw "Unable to find anchor: "+anchor_selector; }
        if (this.anchor_styles != null) { d3_anchor.style(this.anchor_styles); }
        if (this.handlers != null) { return (() => {
            const result = [];
            for (var event in this.handlers) {
                var handler = this.handlers[event];
                result.push(this.on(event, handler));
            }
            return result;
        })(); }
    }
    _init() {}

    // Update state and scales based on current size of the anchor div DOM element
    // @param width [Number] Optional value to override the anchor width
    // @param height [Number] Optional value to override the anchor height
    size(width, height){
        if (width != null) { this.anchor.style.width = (typeof width === 'number' ? width+'px' : width); }
        if (height != null) { this.anchor.style.height = (typeof height === 'number' ? height+'px' : height); }
        this.width = this.anchor.offsetWidth;
        this.height = this.anchor.offsetHeight;
        return this._size();
    }
    _size() {}

    // Update DOM data bindings based on new or modified data set
    update(origin){ return this._update(origin); }
    _update() {}

    // Actually place DOM elements based on current scales.  This is separated from {c3.Base#update update()} so
    // resizing can update the DOM without needing to update data bindings.
    // @param origin [String] The origin specifies the reason for this call to draw(), such as being initiated by a
    //   user call to {c3.Base#redraw redraw()}, the initial {c3.Base#render render()}, etc.
    //   This can be used for performance optimizations.
    draw(origin){ return this._draw(origin); }
    _draw() {}

    // Set the DOM elements styles, classes, etc.  This is separated from {c3.Base#draw draw()} so that
    // users can update the styles of the visualization when the change doesn't need to rebind data
    // and they know the change won't affect DOM element placement or size.
    // @param style_new [Boolean] A hint to the implementation if only the new elements should be updated,
    // instead of all of them, as a performance optimization.  This is only a hint and is implementation specific.
    style(style_new){ return this._style(style_new); }
    _style() {}
});
Clsc3.initClass();


//##################################################################
// Chart
//##################################################################

// The base abstract class for c3 _Charts_.
// Charts are graphical visualizations of data attached to a div.
// They are currently based on SVG vector graphics, but may be extended
// to leverage canvas rendering for performance as well.
//
// ## Extensibility
// The following members are added that represent {https://github.com/mbostock/d3/wiki/Selections D3 selections}:
// * **g** - A root svg:g node for this chart content with the CSS class `content`
//
// The following members are added as {c3.Selection} objects:
// * **svg** - The SVG node for this chart with the CSS classes `c3`, `chart`, and a user specified class.
// * **content** - A c3 selection of the chart content
// @abstract
// @author Douglas Armstrong
Clsc3 = (c3.Chart = class Chart extends c3.Base {
    static initClass() {
        this.prototype.type = 'chart';
    
        // This class is assigned to the chart svg node to allow CSS styles to be applied.
        this.prototype.class = undefined;
        // [{c3.Selection.Options}] Options for the chart svg node.
        this.prototype.options = undefined;
        // [{c3.Selection.Options}] Options for the chart content svg:g node.
        // This may be used, for example, to set event handlers for just the content section of the chart
        // or to set styles that apply to all of the content of the chart.  If there are margins or
        // attached axes, they are not considered part of the content.
        this.prototype.content_options = undefined;
    }

    init() {
        this._prep();
        // Prepare the chart's root svg node
        this.svg = c3.select(d3.select(this.anchor),'svg',null,true).singleton().options(this.options).update();
        this.svg.all
            .attr('class','c3 '+((this.class != null) ? this.class : ''))
            .attr('height','100%').attr('width','100%')
            .on('contextmenu', () => d3.event.preventDefault());

        // Create an svg:g grouping node to host the "content" for this chart.
        this.content = this.svg.select('g.content',null,true).singleton().options(this.content_options).update();

        // Apply classes to the svg and g nodes based on the `type` of the chart object hierarchy
        let prototype = Object.getPrototypeOf(this);
        while (prototype) {
            if (prototype.type != null) {
                this.svg.all.classed(prototype.type, true);
                this.content.all.classed(prototype.type, true);
            }
            prototype = Object.getPrototypeOf(prototype);
        }
        return this._init();
    }

    style() {
        this.svg.style();
        this.content.style();
        return super.style(...arguments);
    }
});
Clsc3.initClass();


//##################################################################
// Initialization
//##################################################################
let initialized = false;
var initialize = function() { if (!initialized) {
    // Create Global SVG defs for filters, gradients, and masks
    if (!c3.global_svg) {
        c3.global_svg = d3.select('body').append('svg').attr('class','c3 global');
        c3.global_defs = c3.global_svg.append('defs');

//        # Add filter for lighting effects to highligh elements
//        shadow_filter = c3.global_defs.append('filter')
//            .attr('id','shadow_filter')
//            #.attr('filterUnits','userSpaceOnUse').attr('x',0).attr('y',0).attr('width',400).attr('height',400)
//        shadow_filter.append('feGaussianBlur')
//            .attr('in','SourceAlpha').attr('stdDeviation',4)
//        shadow_filter.append('feSpecularLighting')
//            .attr('specularExponent',100).attr('lighting-color','wheat')
//            .append('feSpotLight').attr('x',0).attr('y',0).attr('z',200)
//        shadow_filter.append('feComposite')
//            .attr('in2','SourceGraphic')
//            .attr('operator','in')
//        shadow_filter.append('feComposite')
//            .attr('in2','SourceGraphic').attr('operator','arithmetic')
//            .attr('k1',0).attr('k2',1).attr('k3',1).attr('k4',0)

        // Masks to fade to transparent to the left or right.
        // Note that the object bounding box for a path is defined from the start and end points.
        // So, curves with a stroke width extend outside of this box.  That is why the mask size is
        // larger and the gradient stop positions are adjusted to align with the path endpoints.
        const fade_right = c3.global_defs.append('linearGradient')
            .attr('id','gradient_for_mask_fade_right');
        fade_right.append('stop')
            .attr('offset',0.5).attr('stop-color','white').attr('stop-opacity',1);
        fade_right.append('stop')
            .attr('offset',0.9).attr('stop-color','white').attr('stop-opacity',0);
        const fade_left = c3.global_defs.append('linearGradient')
            .attr('id','gradient_for_mask_fade_left');
        fade_left.append('stop')
            .attr('offset',0.1).attr('stop-color','white').attr('stop-opacity',0);
        fade_left.append('stop')
            .attr('offset',0.5).attr('stop-color','white').attr('stop-opacity',1);
        const mask_fade_right = c3.global_defs.append('mask').attr('id','mask_fade_right')
            .attr('maskContentUnits','objectBoundingBox')
            .attr('x',-1).attr('y','-500000%').attr('height','1000000%').attr('width',2)
            .append('rect')
                .attr('x',-1).attr('y',-500000).attr('height',1000000).attr('width',2)
                .attr('fill',`url(#${fade_right.attr('id')})`);
        const mask_fade_left = c3.global_defs.append('mask').attr('id','mask_fade_left')
            .attr('maskContentUnits','objectBoundingBox')
            .attr('y','-500000%').attr('height','1000000%').attr('width',2)
            .append('rect')
                .attr('y',-500000).attr('height',1000000).attr('width',2)
                .attr('fill',`url(#${fade_left.attr('id')})`);
    }

    return initialized = true;
} };

function __guardMethod__(obj, methodName, transform) {
  if (typeof obj !== 'undefined' && obj !== null && typeof obj[methodName] === 'function') {
    return transform(obj, methodName);
  } else {
    return undefined;
  }
}