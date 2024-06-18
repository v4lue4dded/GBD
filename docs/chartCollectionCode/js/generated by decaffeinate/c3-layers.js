/*
 * decaffeinate suggestions:
 * DS002: Fix invalid constructor
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__, or convert again using --optional-chaining
 * DS104: Avoid inline assignments
 * DS202: Simplify dynamic range loops
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
// c3 Visualization Library
// Layers for XY Plots

//##################################################################
// XY Plot Chart Layers
//##################################################################

// The root abstract class of layers for the {c3.Plot c3 XY Plot Chart}
//
// ## Internal Interface
// The internal interface that plot layers can implement essentially match the {c3.Base} internal abstract interface:
// * **{c3.base#init init()}**
// * **{c3.base#size size()}**
// * **{c3.base#update update()}**
// * **{c3.base#draw draw()}**
// * **{c3.base#style style()}**
//
// An additional method is added:
// * **zoom()** - Called when the chart is zoomed or panned.
//
// ## Extensibility
// Each layer has the following members added:
// * **chart** - Reference to the {c3.Plot XY Plot Chart} this layer belongs to
// * **content** - A {c3.Selection selection} of the layer content
// * **g** - A {https://github.com/mbostock/d3/wiki/Selections D3 selection} for the SVG g node for this layer
// * **width** - width of the layer
// * **height** - height of the layer
//
// @method #on(event, handler)
//   Register an event handler to catch events fired by the visualization.
//   @param event [String] The name of the event to handle.  _See the Exetensibility and Events section for {c3.base}._
//   @param handler [Function] Callback function called with the event.  The arguments passed to the function are event-specific.
//
// Items should be positioned on the the layer using the layer's `h` and `v` scales.
// As a performance optimization some layers may create a g node with the `scaled` class.
// When the plot is zoomed then this group will have a transform applied to reflect the zoom so
// individual elements do not need to be adjusted.  Please use the `chart.orig_h` scale in this case.
// Not that this approach does not work for many circumstances as it affects text aspect ratio,
// stroke widths, rounding errors, etc.
// @abstract
// @author Douglas Armstrong
let Cls = (c3.Plot.Layer = class Layer {
    static initClass() {
        this.version = 0.2;
        c3.Layer = this; // Shortcut for accessing plot layers.
        this.prototype.type = 'layer';
        this._next_uid = 0;
    
        // [Array] Data for this layer  _This can be set for each individual layer or a default for the entire chart._
        this.prototype.data = undefined;
        // [String] User name for this layer.  This is used in legends, for example.
        this.prototype.name = undefined;
        // [String] CSS class to assign to this layer for user style sheets to customize
        this.prototype.class = undefined;
        // [Boolean] If true this layer is considered to have "static" data and will not update when {c3.Base#redraw redraw()} is called.
        this.prototype.static_data = false;
        // [{https://github.com/mbostock/d3/wiki/Scales d3.scale}] Scale for the _vertical_ Y axis for this layer.
        // Please set the _domain()_, c3 will set the _range()_.
        // _The vertical scale may be set for the entire chart instead of for each layer._
        this.prototype.h = undefined;
        // [{https://github.com/mbostock/d3/wiki/Scales d3.scale}] Scale for the _vertical_ Y axis for this layer.
        // Please set the _domain()_, c3 will set the _range()_.
        // _The vertical scale may be set for the entire chart instead of for each layer._
        this.prototype.v = undefined;
        // [Function] An accessor function to get the X value from a data item.
        // _This can be set for each individual layer or a default for the entire chart._
        // Some plots support calling this accessor with the index of the data as well as the datum itself.
        this.prototype.x = undefined;
        // [Function] An accessor function to get the Y value from a data item.
        // _This can be set for each individual layer or a default for the entire chart._
        // Some plots support calling this accessor with the index of the data as well as the datum itself.
        this.prototype.y = undefined;
        // [String] `left` for 0 to be at the left, `right` for the right.
        this.prototype.h_orient = undefined;
        // [String] `top` for 0 to be at the top, `bottom` for the bottom.
        this.prototype.v_orient = undefined;
        // [{c3.Selection.Options}] Options to set the **class**, **classes**, **styles**,
        // **events**, and **title** for this layer.
        this.prototype.options = undefined;
        // [Object] An object to setup event handlers to catch events triggered by this c3 layer.
        // The keys represent event names and the values are the cooresponding handlers.
        this.prototype.handlers = undefined;
    
        // Method to restyle this layer
        this.prototype.restyle = Layer.prototype.style;
    }

    constructor(opt){
        this.init = this.init.bind(this);
        this.size = this.size.bind(this);
        this.update = this.update.bind(this);
        this.draw = this.draw.bind(this);
        this.style = this.style.bind(this);
        this.zoom = this.zoom.bind(this);
        this.pan = this.pan.bind(this);
        this.redraw = this.redraw.bind(this);
        this.scale = this.scale.bind(this);
        this.min_x = this.min_x.bind(this);
        this.max_x = this.max_x.bind(this);
        this.min_y = this.min_y.bind(this);
        this.max_y = this.max_y.bind(this);
        c3.util.extend(this, new c3.Dispatch);
        c3.util.extend(this, opt);
        this.uid = c3.Plot.Layer._next_uid++;
    }

    // Internal function for the Plot to prepare the layer.
    init(chart, g){
        this.chart = chart;
        this.g = g;
        this.trigger('render_start');
        if (this.data == null) { this.data = this.chart.data; }
        if (this.h == null) { this.h = this.chart.h; }
        if (this.v == null) { this.v = this.chart.v; }
        if (this.x == null) { this.x = this.chart.x; }
        if (this.y == null) { this.y = this.chart.y; }
        if (this.h_orient == null) { this.h_orient = this.chart.h_orient; }
        if (this.v_orient == null) { this.v_orient = this.chart.v_orient; }
        if (this.class != null) { this.g.classed(this.class, true); }
        if (this.handlers != null) { for (var event in this.handlers) { var handler = this.handlers[event]; this.on(event, handler); } }
        this.content = c3.select(this.g);

        // Apply classes to layer g nodes based on the `type` of the layer object hierarchy
        let prototype = Object.getPrototypeOf(this);
        while (prototype) {
            if (prototype.type != null) { this.g.classed(prototype.type, true); }
            prototype = Object.getPrototypeOf(prototype);
        }

        if (typeof this._init === 'function') {
            this._init();
        }
        return this.trigger('render');
    }

    // Resize the layer, but _doesn't_ update the rendering, `resize()` should be used for that.
    size(width, height){
        this.width = width;
        this.height = height;
        this.trigger('resize_start');
        if ((this.h_orient !== this.chart.h_orient) && (this.h === this.chart.h)) { this.h = this.h.copy(); }
        c3.d3.set_range(this.h, this.h_orient === 'left' ? [0, this.width] : [this.width, 0]);
        if ((this.v_orient !== this.chart.v_orient) && (this.v === this.chart.v)) { this.v = this.v.copy(); }
        c3.d3.set_range(this.v, this.v_orient === 'bottom' ? [this.height, 0] : [0, this.height]);
        if (typeof this._size === 'function') {
            this._size();
        }
        return this.trigger('resize');
    }

    // Update the DOM bindings based on the new or modified data set
    update(origin){
        if ((this.chart == null)) { throw Error("Attempt to redraw uninitialized plot layer, please use render() when modifying set of layers."); }
        this.trigger('redraw_start', origin);
        return (typeof this._update === 'function' ? this._update(origin) : undefined);
    }

    // Position the DOM elements based on current scales.
    draw(origin){
        if (!(this.static_data && (origin === 'redraw'))) {
            if (origin === 'resize') { this.trigger('redraw_start', origin); }
            if (typeof this._draw === 'function') {
                this._draw(origin);
            }
            return this.trigger('redraw', origin);
        }
    }

    // Restyle existing items in the layer
    style(style_new){
        this.trigger('restyle_start', style_new);
        if (typeof this._style === 'function') {
            this._style(style_new);
        }
        this.trigger('restyle', style_new);
        if (!this.rendered) { this.trigger('rendered'); }
        return this;
    }

    // Called when a layer needs to update from a zoom, decimated layers overload this
    zoom() {
        if (typeof this.draw === 'function') {
            this.draw('zoom');
        }
        return (typeof this.style === 'function' ? this.style(true) : undefined);
    }

    // Called when a layer needs to update from vertical panning
    pan() {
        if (typeof this.draw === 'function') {
            this.draw('pan');
        }
        return (typeof this.style === 'function' ? this.style(true) : undefined);
    }

    // Redraw just this layer
    redraw(origin){
        if (origin == null) { origin = 'redraw'; }
        this.update(origin);
        this.draw(origin);
        this.style(true);
        return this;
    }

    // Adjust domains for layer scales for any automatic domains.
    // For layer-specific automatic domains the layer needs its own scale defined,
    // it cannot update the chart's shared scale.
    // @note Needs to happen after update() so that stacked layers are computed
    scale() {
        let refresh = false;
        if (this.h_domain != null) {
            if (this.h===this.chart.h) { throw Error("Layer cannot scale shared h scale, please define just h or both h and h_domain for layers"); }
            const h_domain = typeof this.h_domain === 'function' ? this.h_domain.call(this) : this.h_domain;
            if (h_domain[0] === 'auto') { h_domain[0] = this.min_x(); }
            if (h_domain[1] === 'auto') { h_domain[1] = this.max_x(); }
            if ((h_domain[0]!==this.h.domain()[0]) || (h_domain[1]!==this.h.domain()[1])) {
                this.h.domain(h_domain);
                refresh = true;
            }
        }
        if (this.v_domain != null) {
            if (this.v===this.chart.v) { throw Error("Layer cannot scale shared v scale, please define just v or both v and v_domain for layers"); }
            const v_domain = typeof this.v_domain === 'function' ? this.v_domain.call(this) : this.v_domain;
            if (v_domain[0] === 'auto') { v_domain[0] = this.min_y(); }
            if (v_domain[1] === 'auto') { v_domain[1] = this.max_y(); }
            if ((v_domain[0]!==this.v.domain()[0]) || (v_domain[1]!==this.v.domain()[1])) {
                this.v.domain(v_domain);
                refresh = true;
            }
        }
        return refresh;
    }

    min_x() { if (this.x != null) { return d3.min(this.data, this.x); } }
    max_x() { if (this.x != null) { return d3.max(this.data, this.x); } }
    min_y() { if (this.y != null) { return d3.min(this.data, this.y); } }
    max_y() { if (this.y != null) { return d3.max(this.data, this.y); } }
});
Cls.initClass();


//##################################################################
// XY Plot Stackable Layers
//##################################################################

// An **abstract** class for layers that support stacking
// such as {c3.Plot.Layer.Path} and {c3.Plot.Layer.Bar}.
//
// **Stacking** allows the user to group their data into different _stacks_, which are stacked
// on top of each other in the chart.  Stacking is enabled when you define _either_ `stack_options.key`, `stacks`,
// or both options.  `stack_options` allows you to configure how stacking is performed from the layer's data,
// while `stacks` allows you to manually configure the exact set of stacks.
//
// This layer stacking is flexible to support several different ways of organizing the dataset into stacks:
// * For normalized datasets you can define a `stack_options.key()` accessor to provide a key that uniquely
//   identifies which stack an element belongs to.
// * Otherwise, you can manually define the set of `stacks` and the layer's `data` is copied into each.
// * * The layer `y` accessor will be called with the arguments (_datum_,_index_,_stack_)
//   for you to provide the value for that element for that stack.
// * * Or, you can define a `y` accessor for each stack to get the value for that element for that stack.
// * You can also directly define `data` in each stack specified in `stacks`.
//
// Please view the examples for more explanation on how to stack data.
// Remember, the set and order or stacks can always be programmatically constructed and dynamically updated.
//
// ## Extensibility
// The following {c3.Selection} members are made available if appropriate:
// * **groups** - An entry will exist for an svg:g node for each stack in the layer
//
// @see ../../../examples/doc/stack_example.html
// @abstract
// @author Douglas Armstrong
// @note If stacked, the input datasets may not have duplicate values in the same stack for the same X value.  There are other resitrictions if `safe` mode is not used.
// @note If you do not provide data elements for all stacks at all x values, then be prepared for your accessor callbacks to be called with _null_ objects.
Cls = (c3.Plot.Layer.Stackable = class Stackable extends c3.Plot.Layer {
    constructor(...args) {
        this._stack = this._stack.bind(this);
        this._update = this._update.bind(this);
        this._style = this._style.bind(this);
        this.min_x = this.min_x.bind(this);
        this.max_x = this.max_x.bind(this);
        this.min_y = this.min_y.bind(this);
        this.max_y = this.max_y.bind(this);
        super(...args);
    }

    static initClass() {
        this.version = 0.2;
        this.prototype.type = 'stackable';
    
        // [{c3.Selection.Options}] Enable stacking and specify stacking options for this layer.
        // This provides the normal {c3.Selection.Options} applied to each stack in the layer.  For callbacks,
        // the first argument is the stack object and the second argument is the index to the stack
        // In addition, the following options control stacking behaviour:
        // * **key** [Function] An accessor you can define to return a key that uniquely identifies which stack
        //   a data element belongs to.  If this is specified, then this callback is used to determine which stack
        //   each data element is assigned to.  Otherwise, the layer data array is used in full for each stack.
        // * **name** [Function] A callback you define to set the name of a stack that is passed the stack key as an argument.
        // * **offset** [String, Function] The name or a function for the stacking algorithm used to place the data.
        //   See {https://github.com/mbostock/d3/wiki/Stack-Layout#wiki-offset d3.stack.offset()} for details.
        // * * `none` - Do not stack the groups.  Useful for grouped line charts.
        // * * `zero` - The default for a zero baseline.
        // * * `expand` - Normalize all points to range from 0-1.
        // * **order** [String] Specify the mechanism to order the stacks.
        //   See {https://github.com/mbostock/d3/wiki/Stack-Layout#wiki-order d3.stack.order()} for details.
        this.prototype.stack_options = undefined;
    
        // [Array<{c3.Plot.Layer.Stackable.Stack}>] An array of {c3.Plot.Layer.Stackable.Stack stack}
        // objects that can be used to manually specify the set of stacks.
        // Stack objects may contain:
        // * **key** [String] The key for this stack
        // * **y** [Function] A y accessor to use for this stack overriding the one provided by the chart or layer.
        // * **data** [Array] Manually specified dataset for this stack instead of using the layer's `data`.
        // * **name** [String] Name for the stack
        // * **options** [{c3.Selection.Options}] Options to manually set the **class**, **classes**,
        //   **styles**, **events**, and **title** of just this stack.
        this.prototype.stacks = undefined;
    
        // [Boolean] Safe Mode.
        // Preform additional checks and fix up the data for situations such as:
        // * Data not sorted along X axis
        // * Remove data elements where X or Y values are undefined
        // * Pad missing values where stacks are not defined for all X values.
        // Note that this mode may cause the indexes passed to the accessors to match the
        // corrected data instead of the original data array.
        this.prototype.safe = true;
    }

    // Restack the data based on the **stack** and **stacks** options.
    _stack() { let v;     if (this.stack_options || (this.stacks != null)) {
        let datum, i, j, stack;
        if (this.stacks == null) { this.stacks = []; }
        const x_values_set = {};

        // Helper function to setup the current stack data and populate a shadow structure
        // to hold the x, y, and y0 positioning so we avoid modifying the user's data.
        const add_value = (stack, datum, i, j)=> {
            let left;
            const x = this.x(datum,i); x_values_set[x] = x;
            stack.y = (left = stack.y != null ? stack.y : this.y) != null ? left : (() => { throw Error("Y accessor must be defined in stack, layer, or chart"); })();
            const y = stack.y(datum, i, j, stack);
            return stack.values.push({ x, y, datum });
        };

        for (j = 0; j < this.stacks.length; j++) {
            stack = this.stacks[j];
            if (stack.name == null) { stack.name = __guardMethod__(this.stack_options, 'name', o => o.name(stack.key)); }

            // Clear any previous stacking
            stack.values = []; // Shadow array to hold stack positioning

            // Data was provided manually in the stack definition
            if (stack.data != null) { for (i = 0; i < stack.data.length; i++) {
                datum = stack.data[i];
                add_value(stack, datum, i, j);
            } }
        }

        // Data has been provided in @current_data that we need to assign it to a stack
        if (this.current_data.length) {
            // Use stack_options.key() to assign data to stacks
            if ((this.stack_options != null ? this.stack_options.key : undefined) != null) {
                const stack_map = {};
                const stack_index = {};
                for (j = 0; j < this.stacks.length; j++) { // Refer to hard-coded stacks if defined
                    stack = this.stacks[j];
                    if (stack_map[stack.key] != null) { throw Error("Stacks provided with duplicate keys: "+stack.key); }
                    stack_map[stack.key] = stack;
                    stack_index[stack.key] = j;
                }
                for (i = 0; i < this.current_data.length; i++) {
                    datum = this.current_data[i];
                    var key = this.stack_options.key(datum);
                    if (stack_map[key] != null) {
                        stack = stack_map[key];
                        j = stack_index[key];
                    } else {
                        this.stacks.push(stack = (stack_map[key] = {
                            key, name:(typeof this.stack_options.name === 'function' ? this.stack_options.name(key) : undefined), current_data:[], values:[] }));
                        j = this.stacks.length;
                    }
                    add_value(stack, datum, i, j);
                }

            // Otherwise, assign all data to all stacks using each stack's y() accessor
            } else if (this.stacks != null) { for (j = 0; j < this.stacks.length; j++) {
                stack = this.stacks[j];
                for (i = 0; i < this.current_data.length; i++) {
                    datum = this.current_data[i];
                    add_value(stack, datum, i, j);
                }
            }

            } else { throw Error("Either stacks or stack_options.key must be defined to create the set of stacks."); }
        }

        if (this.safe) {
            // Ensure everything is sorted
            // NOTE: We sort based on the @h scale in case of ordinal or other odd scales
            if (this.h.range()[0] === this.h.range()[1]) { this.h.range([0,1]); }
            const x_values = c3.array.sort_up(((() => {
                const result = [];
                for (var k in x_values_set) {
                    v = x_values_set[k];
                    result.push(v);
                }
                return result;
            })()), this.h);
            for (stack of Array.from(this.stacks)) {
                c3.array.sort_up(stack.values, v=> this.h(v.x));
            }

            // Splice in missing data and remove undefined data (Important for D3's stack layout)
            i=0; while (i<x_values.length) {
                var undef = 0;
                for (stack of Array.from(this.stacks)) {
                    // Check for missing values
                    // Compare using h scale to tolerate values such as Dates
                    var stack_h = this.h(stack.values[i] != null ? stack.values[i].x : undefined);
                    var layer_h = this.h(x_values[i]);
                    if (stack_h !== layer_h) {
                        if (stack_h < layer_h) { // Check for duplicate X values
                            if (this.h.domain()[0] === this.h.domain()[1]) {
                                throw Error("Did you intend for an h scale with 0 domain?  Duplicate X values, invalid stacking, or bad h scale");
                            } else { throw Error("Multiple data elements with the same x value in the same stack, or invalid stacking"); }
                        }
                        stack.values.splice(i, 0, { x:x_values[i], y:0, datum:null });
                        undef++;
                    // Check for undefined y values
                    } else if ((stack.values[i].y == null)) {
                        stack.values[i].y = 0;
                        undef++;
                    }
                }
                // If item is undefined for all stacks, then remove it completely
                if (undef === this.stacks.length) {
                    for (stack of Array.from(this.stacks)) { stack.values.splice(i,1); }
                    x_values.splice(i,1);
                    i--;
                }
                i++;
            }
        }

        // Prepare array of current data for each stack in case it is needed for binding (used by bar chart)
        for (stack of Array.from(this.stacks)) {
            stack.current_data = stack.values.map(v => v.datum);
        }

        // Configure and run the D3 stack layout to generate y0 and y layout data for the elements.
        if ((this.stack_options != null ? this.stack_options.offset : undefined) === 'none') {
            return (() => {
                const result1 = [];
                for (stack of Array.from(this.stacks)) {
                    result1.push(Array.from(stack.values).map((value) =>
                        (value.y0 = 0)));
                }
                return result1;
            })();
        } else {
            const stacker = d3.layout.stack().values(stack => stack.values);
            if ((this.stack_options != null ? this.stack_options.offset : undefined) != null) { stacker.offset(this.stack_options.offset); }
            if ((this.stack_options != null ? this.stack_options.order : undefined) != null) { stacker.order(this.stack_options.order); }
            return stacker(this.stacks);
        }
    } }

    _update() {
        // Ensure data is sorted and skip elements that do not have a defined x or y value
        let i, d;
        this.current_data = (() => {
            if (!this.safe) { return this.data; } else if (this.data != null) {
            // TODO: we could try to use this values array later as an optimization and for more
            // stable i parameters passed to user accessors.  However, it will complicate the code.
            let values;
            if ((this.y != null) && (this.stacks == null) && (this.stack_options == null)) {
                values = ((() => {
                    const result = [];
                    for (i = 0; i < this.data.length; i++) {
                        d = this.data[i];
                        result.push({x:this.x(d,i), y:this.y(d,i), datum:d});
                    }
                    return result;
                })());
                c3.array.sort_up(values, v=> this.h(v.x)); // Use @h to accomodate date types
                return (() => {
                    const result1 = [];
                    for (var v of Array.from(values)) {                         if ((v.x != null) && (v.y != null)) {
                            result1.push(v.datum);
                        }
                    }
                    return result1;
                })();
            } else {
                values = ((() => {
                    const result2 = [];
                    for (i = 0; i < this.data.length; i++) {
                        d = this.data[i];
                        result2.push({x:this.x(d,i), datum:d});
                    }
                    return result2;
                })());
                if ((this.stacks != null) || (this.stack_options != null)) { // Sorting handled by _stack()
                    c3.array.sort_up(values, v=> this.h(v.x));
                }
                return (() => {
                    const result3 = [];
                    for (var v of Array.from(values)) {                         if (v.x != null) {
                            result3.push(v.datum);
                        }
                    }
                    return result3;
                })();
            }
        }
        })();
        if (this.current_data == null) { this.current_data = []; }

        this._stack();
        return this.groups = this.content.select('g.stack')
            .bind((this.stacks != null ? this.stacks : [null]), (__guard__(this.stacks != null ? this.stacks[0] : undefined, x => x.key) == null) ? null : stack => stack.key)
            .options(this.stack_options, ((this.stacks != null ? this.stacks.some(stack => stack.options != null) : undefined) ? stack => stack.options : undefined))
            .update();
    }

    _style(style_new){ return (this.groups != null ? this.groups.style(style_new) : undefined); }

    min_x() { if ((this.stacks == null)) { return super.min_x(...arguments); } else { return d3.min(this.stacks[0] != null ? this.stacks[0].values : undefined, v => v.x); } }
    max_x() { if ((this.stacks == null)) { return super.max_x(...arguments); } else { return d3.max(this.stacks[0] != null ? this.stacks[0].values : undefined, v => v.x); } }
    min_y() { if ((this.stacks == null)) { return super.min_y(...arguments); } else {
        return d3.min(this.stacks, stack => d3.min(stack.values, v => v.y0 + v.y));
    } }
    max_y() { if ((this.stacks == null)) { return super.max_y(...arguments); } else {
        return d3.max(this.stacks, stack => d3.max(stack.values, v => v.y0 + v.y));
    } }
});
Cls.initClass();

// A _struct-type_ convention class to describe a stack when manually specifying the set of stacks
// to use for a stackable chart layer.
Cls = (c3.Plot.Layer.Stackable.Stack = class Stack {
    static initClass() {
        this.version = 0.1;
    
        // [String] The key for this stack
        this.prototype.key = undefined;
        // [Function] A _y accessor_ to use for this stack, overriding the one provided by the chart or layer.
        this.prototype.y = undefined;
        // [Array] An array of data elements to use for this stack instead of the layer or chart's `data`.
        this.prototype.data = undefined;
        // [String] Name for the stack
        this.prototype.name = undefined;
        // [{c3.Selection.Options}] Options to manually set the **class**, **classes**,
        // **styles**, **events**, and **title** of just this stack.
        this.prototype.options = undefined;
    }

    constructor(opt){ c3.util.extend(this, opt); }
});
Cls.initClass();


//##################################################################
// XY Plot Line and Area Layers
//##################################################################

// Abstract chart layer for the {c3.Plot XY Plot Chart}.
// Please instantiate a {c3.Plot.Layer.Line} or {c3.Plot.Layer.Area}
// @see c3.Plot.Layer.Line
// @see c3.Plot.Layer.Area
//
// Define an `r` or `a` to create circles at the various data points along the path
// with that associated radius or area.
//
// ## Extensibility
// The following {c3.Selection} members are made available if appropriate:
// * **paths** - There will be an element in paths for each stack in the layer
// * **circles** - Circles for each datapoint
// * **labels** - Labels for each datapoint
//
// @abstract
// @author Douglas Armstrong
Cls = (c3.Plot.Layer.Path = class Path extends c3.Plot.Layer.Stackable {
    constructor(...args) {
        this._init = this._init.bind(this);
        this._update = this._update.bind(this);
        this._draw = this._draw.bind(this);
        this._style = this._style.bind(this);
        this.min_x = this.min_x.bind(this);
        this.max_x = this.max_x.bind(this);
        super(...args);
    }

    static initClass() {
        this.version = 0.2;
        this.prototype.type = 'path';
    
        // [Function] Factory to generate an SVG path string generator function.  _See {https://github.com/mbostock/d3/wiki/SVG-Shapes#path-data-generators} for details.
        this.prototype.path_generator_factory = undefined;
        // [String] The type of D3 line interpolation to use.  _See {https://github.com/mbostock/d3/wiki/SVG-Shapes#area_interpolate d3.svg.area.interpolate} for options._  Some useful examples:
        // * _linear_ - Straight lines between data points
        // * _basis_ - Smooth curve based on a B-spline, the curve may not touch the data points
        // * _cardinal_ - Smooth curve that intersects all data points.
        // * _step-before_ - A step function where the horizontal segments are to the left of the data points
        // * _step-after_ - A step function where the horizontal segments are to the right of the data points
        this.prototype.interpolate = undefined;
        // [Number] The tension value [0,1] for cardinal interpolation.  _See {https://github.com/mbostock/d3/wiki/SVG-Shapes#area_tension d3.svg.area.tension}._
        this.prototype.tension = undefined;
        // [Function] Accessor function you can return true or false if the data point in data[] is defined or should be skipped.  _See {https://github.com/mbostock/d3/wiki/SVG-Shapes#wiki-area_defined d3.svg.area.defined}._
        // Note that this will cause disjoint paths on either side of the missing element,
        // it will not render a continuous path that skips the undefined element.  For that
        // behaviour simply enable `safe` mode and have the x or y accessor return undefined.
        this.prototype.defined = undefined;
        // [Number, Function] Define to create circles at the data points along the path with this radius.
        this.prototype.r = undefined;
        // [Number, Function] Define to create circles at the data points along the path with this area.
        // Takes precedence over r.
        this.prototype.a = undefined;
        // [{c3.Selection.Options}] Options for the svg:path.  For example, to enable animations.
        this.prototype.path_options = undefined;
        // [{c3.Selection.Options}] If circles are created at the data points via `r` or `a`, then this
        // defines options used to style or extend them.
        this.prototype.circle_options = undefined;
        // [{c3.Selection.Options}] Create labels for each datapoint with these options
        this.prototype.label_options = undefined;
    }

    _init() {
        if ((this.path_generator_factory == null)) { throw Error("path_generator_factory must be defined for a path layer"); }
        return this.path_generator = this.path_generator_factory();
    }

    _update(origin){ if (origin !== 'zoom') {
        super._update(...arguments);

        this.paths = this.groups.inherit('path.scaled').options(this.path_options);

        // Bind the datapoint circles and labels
        if ((this.r != null) || (this.a != null)) {
            this.circles = this.groups.select('circle').options(this.circle_options).animate(origin === 'redraw')
                .bind((this.stacks != null) ? stack => stack.current_data : this.current_data).update();
        }
        if (this.label_options != null) {
            return this.labels = this.groups.select('text').options(this.label_options).animate(origin === 'redraw')
                .bind((this.stacks != null) ? stack => stack.current_data : this.current_data).update();
        }
    } }

    _draw(origin){
        // Only need to update the paths if the data has changed
        if (origin !== 'zoom') {
            // Update the path generator based on the current settings
            if (this.interpolate != null) { this.path_generator.interpolate(this.interpolate); }
            if (this.tension != null) { this.path_generator.tension(this.tension); }
            if (this.defined != null) { this.path_generator.defined(this.defined); }

            // Generate and render the paths.
            const orig_h = this.chart.orig_h != null ? this.chart.orig_h : this.h; // For rendering on the scaled layer
            this.paths.animate(origin === 'redraw').position({
                d: (this.stacks != null) ? (stack, stack_idx)=> {
                        __guardMethod__(this.path_generator
                            .x((d,i)=> orig_h(stack.values[i].x))
                            .y((d,i)=> this.v((stack.values[i].y0 + stack.values[i].y))), 'y0', o => o.y0((this.baseline != null) && !stack_idx ? (d,i)=> this.v(c3.functor(this.baseline)(d,i)) :
                                (d,i)=> this.v(stack.values[i].y0)
                        ));
                        return this.path_generator(stack.current_data); // Call the generator with this particular stack's data
                    }
                    : () => {
                        __guardMethod__(this.path_generator
                            .x((d,i)=> orig_h(this.x(d,i)))
                            .y((d,i)=> this.v(this.y(d,i))), 'y0', o => o.y0((this.baseline != null) ? (d,i)=> this.v(c3.functor(this.baseline)(d,i)) : this.height));
                        return this.path_generator(this.current_data);
                    }
            });
        }

        // Position the circles
        if (this.circles != null) {
            this.circles.animate(origin === 'redraw').position({
            cx: (d,i,s)=> this.h(this.x(d,i,s)),
            cy:
                (this.stacks != null) ? (d,i,s)=> { const values = this.stacks[s].values[i]; return this.v(values.y+values.y0); }
                : (d,i)=> this.v(this.y(d,i)),
            r: (this.a == null) ? this.r :
                typeof this.a === 'function' ? (d,i,s)=> Math.sqrt( this.a(d,i,s) / Math.PI )
                : Math.sqrt( this.a / Math.PI )
        });
        }

        // Set the labels
        return (this.labels != null ? this.labels.animate(origin === 'redraw').position({
            transform: (d,i,s)=> 'translate('+(this.h(this.x(d,i,s)))+','+(this.v(this.y(d,i,s)))+')'}) : undefined);
    }

    _style(style_new){
        super._style(...arguments);
        this.paths.style(style_new);
        if (this.circles != null) {
            this.circles.style(style_new);
        }
        return (this.labels != null ? this.labels.style(style_new) : undefined);
    }

    min_x() { if ((this.stacks == null)) { if (this.data.length) { return this.x(this.data[0]); } } else { return __guard__(this.stacks[0] != null ? this.stacks[0].values[0] : undefined, x => x.x); } }
    max_x() { if ((this.stacks == null)) { if (this.data.length) { return this.x(this.data.slice(-1)[0]); } } else { return __guard__(this.stacks[0] != null ? this.stacks[0].values.slice(-1)[0] : undefined, x => x.x); } }
});
Cls.initClass();

// Line graph layer for the {c3.Plot XY Plot Chart}.  Please refer to {c3.Plot.Layer.Path} for documentation.
// @see c3.Plot.Layer.Path
// @author Douglas Armstrong
Cls = (c3.Plot.Layer.Line = class Line extends c3.Plot.Layer.Path {
    static initClass() {
        this.prototype.type = 'line';
        this.prototype.path_generator_factory = d3.svg.line;
    }
});
Cls.initClass();


// Area graph layer for the {c3.Plot XY Plot Chart}.  Please refer to {c3.Plot.Layer.Path} for documentation.
// @see c3.Plot.Layer.Path
// @author Douglas Armstrong
// @note The input data array should be sorted along the x axis.
Cls = (c3.Plot.Layer.Area = class Area extends c3.Plot.Layer.Path {
    static initClass() {
        this.prototype.type = 'area';
        this.prototype.path_generator_factory = d3.svg.area;
        // [Number, Function] Base value or accessor for the bottom of the area chart.
        // _Defaults to the bottom of the chart._
        this.prototype.baseline = undefined;
    }
});
Cls.initClass();


//##################################################################
// XY Plot Bar Layer
//##################################################################

// Bar chart layer for the {c3.Plot XY Plot Chart}
//
// Bar charts may have positive or negative values unless they are stacked,
// then they must be positive.
//
// When an orinal scale is used this layer will adjust it so that it provides padding
// so the full bar on the left and right ends are fully visible.  With other types of scales
// the bars may have arbitrary x values from the user and may overlap.  In this case, it is up
// to the user to set the domain so bars are fully visible.
//
// ## Extensibility
// The following {c3.Selection} members are made available if appropriate:
// * **rects**
//
// @todo Support negative y values for bar layers
// @author Douglas Armstrong
Cls = (c3.Plot.Layer.Bar = class Bar extends c3.Plot.Layer.Stackable {
    constructor(...args) {
        this._update = this._update.bind(this);
        this._draw = this._draw.bind(this);
        this._style = this._style.bind(this);
        super(...args);
    }

    static initClass() {
        this.version = 0.2;
        this.prototype.type = 'bar';
    
        // [Function] A callback to describe a unique key for each data element.
        // This is useful for animations during a redraw when updating the dataset.
        this.prototype.key = undefined;
        // [Number, String, Function] Specify the width of the bars.
        // If this is a number it specifies the bar width in pixels.
        // If this is a string, such as `50%`, then it can specify the width of the bars as a
        // percentage of the available space for each bar based on proximity to each neighbor.
        // If this is a function it can set the width dynamically for each bar.
        this.prototype.bar_width = "50%";
        // [{c3.Selection.Options}] Options for the svg:rect's.
        // The callbacks are called with the user data for the rect as the first argument, the index of that
        // datum as the second argument, and the index of the stack for this rect as the third argument.
        // `stack.options` can be used instead to apply the same options to an entire stack.
        this.prototype.rect_options = undefined;
    }

    _update() {
        super._update(...arguments);
        return this.rects = this.groups.select('rect').options(this.rect_options).animate('origin is redraw')
            .bind(((this.stacks != null) ? (stack => stack.current_data) : this.current_data), this.key).update();
    }

    _draw(origin){
        let bar_shift, bar_width, height, x, y;
        const baseline = this.v(0);

        // Set bar_width and bar_shift
        if (typeof this.bar_width === 'function') {
            ({
                bar_width
            } = this);
            bar_shift = function() { return bar_width(...arguments) / 2; };
        } else {
            bar_width = +this.bar_width;
            if (!isNaN(bar_width)) { // The user provided a simple number of pixels
                if (typeof this.h.rangeBands === 'function') {
                    this.h.rangeBands(this.h.rangeExtent(), 1, 0.5);
                } // Provide padding for an ordinal D3 scale
                bar_shift = bar_width/2;
            } else { // The user provided a percentage
                if ((typeof this.bar_width.charAt === 'function' ? this.bar_width.charAt(this.bar_width.length-1) : undefined) === '%') { // Use charAt to confirm this is a string
                    const bar_ratio = +this.bar_width.slice(0, +-2 + 1 || undefined) / 100;
                    if (isNaN(bar_ratio)) { throw "Invalid bar_width percentage "+this.bar_width.slice(0, +-2 + 1 || undefined); }
                    if (this.h.rangeBands != null) { // Setup padding for an ordinal D3 scale
                        this.h.rangeBands(this.h.rangeExtent(), 1-bar_ratio, 1-bar_ratio);
                        bar_width = this.h.rangeBand();
                        bar_shift = 0;
                    } else { // Dynamically compute widths based on proximity to neighbors
                        bar_width = (this.stacks != null) ? (d,i,j)=> {
                                const {
                                    values
                                } = this.stacks[j];
                                const mid = this.h(values[i].x);
                                const left = this.h(!i ? (this.chart.orig_h != null ? this.chart.orig_h : this.h).domain()[0] : values[i-1].x);
                                const right = this.h(i===(values.length-1) ? (this.chart.orig_h != null ? this.chart.orig_h : this.h).domain()[1] : values[i+1].x);
                                const width = Math.min((mid-left), (right-mid)) * bar_ratio;
                                if (width >= 0) { return width; } else { return 0; }
                            }
                        : (d,i)=> {
                                const mid = this.h(this.x(d,i));
                                const left = this.h(!i ? (this.chart.orig_h != null ? this.chart.orig_h : this.h).domain()[0] : this.x(this.current_data[i-1],i-1));
                                const right = this.h(i===(this.current_data.length-1) ? (this.chart.orig_h != null ? this.chart.orig_h : this.h).domain()[1] : this.x(this.current_data[i+1],i+1));
                                const width = Math.min((mid-left), (right-mid)) * bar_ratio;
                                if (width >= 0) { return width; } else { return 0; }
                            };
                        bar_shift = function() { return bar_width(...arguments) / 2; };
                    }
                } else { throw "Invalid bar_width "+this.bar_width; }
            }
        }

        if (this.stacks != null) {
            x = (d,i,j)=> this.h( this.stacks[j].values[i].x );
            y = (d,i,j)=> this.v( this.stacks[j].values[i].y0 + this.stacks[j].values[i].y );
            height = (d,i,j)=> baseline - (this.v(this.stacks[j].values[i].y));
        } else {
            x = (d,i)=> this.h(this.x(d,i));
            y = (d,i)=> { y=this.y(d,i); if (y>0) { return this.v(y); } else { return baseline; } };
            height = (d,i)=> Math.abs( baseline - (this.v(this.y(d,i))) );
        }

        return this.rects.animate(origin === 'redraw').position({
            x: !bar_shift ? x
            : typeof bar_shift !== 'function' ? function() { return x(...arguments) - bar_shift; }
            : function() { return x(...arguments) - bar_shift(...arguments); },
            y,
            height,
            width: bar_width
        });
    }

    _style(style_new){
        super._style(...arguments);
        return this.rects.style(style_new);
    }
});
Cls.initClass();


//##################################################################
// XY Plot Straight Line Layers
//##################################################################

// Straight **horizontal** or **vertical** line layer for the
// {c3.Plot XY Plot Chart}.  This is an **abstract** layer, please instantiate a
// {c3.Plot.Layer.Line.Horizontal} or {c3.Plot.Layer.Line.Vertical}
// directly.
//
// A seperate line is drawn for each data element in the `data` array.
// _Set `label_options.text` to define a **label** for each line._
// Straight line layers are not _{c3.Plot.Layer.Stackable stackable}_.
//
// ## Extensibility
// The following {c3.Selection} members are made available if appropriate:
// * **vectors**
// * **lines**
// * **labels**
//
// ## Events
// * **dragstart**
// * **drag**
// * **dragend**
//
// @abstract
// @author Douglas Armstrong
Cls = (c3.Plot.Layer.Line.Straight = class Straight extends c3.Plot.Layer {
    constructor(...args) {
        this._init = this._init.bind(this);
        this._size = this._size.bind(this);
        this._update = this._update.bind(this);
        this._draw = this._draw.bind(this);
        this._style = this._style.bind(this);
        super(...args);
    }

    static initClass() {
        this.version = 0.1;
        this.prototype.type = 'straight';
    
        // [Function] Optional accessor to identify data elements when changing the dataset
        this.prototype.key = undefined;
        // [Function] Accessor to get the value for each data element.
        // _Defaults to the identity function._
        this.prototype.value = undefined;
        // [Function] Accessor to determine if data elements are filtered in or not.
        this.prototype.filter = undefined;
        // [Boolean] Enable lines to be draggable.
        // The drag event callbacks can be used to adjust the original data values
        this.prototype.draggable = false;
        // [{c3.Selection.Options}] Options for the svg:g of the vector group nodes.
        // There is one node per data element.  Use this option for animating line movement.
        this.prototype.vector_options = undefined;
        // [{c3.Selection.Options}] Options for the svg:line lines.
        this.prototype.line_options = undefined;
        // [{c3.Selection.Options}] Options for the svg:line lines for hidden lines
        // behind each line that is wider and easier for users to interact with
        // e.g. for click or drag events.
        this.prototype.grab_line_options = undefined;
        // [{c3.Selection.Options}] Define this to render labels.  Options for the svg:text labels.
        // This option also takes the following additional properties:
        // * **alignment** - [String] Alignment of label.
        // * * `left` or `right` for horizontal lines
        // * * `top` or `bottom` for vertical lines
        // * **dx** - [String] Relative placement for the label
        // * **dy** - [String] Relative placement for the label
        this.prototype.label_options = undefined;
    }

    _init() {
        if (this.value == null) { this.value = d => d; }

        // Draggable lines
        if (this.draggable) {
            // NOTE: Because vertical lines are rotated, we are always dragging `y`
            const self = this;
            this.dragger = d3.behavior.drag();
            let drag_value = undefined;
            //drag.origin (d,i)=> { y: @scale @value(d,i) }
            this.dragger.on('dragstart', (d,i)=> {
                d3.event.sourceEvent.stopPropagation(); // Prevent panning in zoomable charts
                return this.trigger('dragstart', d, i);
            });
            this.dragger.on('drag', function(d,i){
                const domain = (self.chart.orig_h != null ? self.chart.orig_h : self.scale).domain();
                drag_value = Math.min(Math.max(self.scale.invert(d3.event.y), domain[0]), domain[1]);
                d3.select(this).attr('transform', 'translate(0,'+self.scale(drag_value)+')');
                return self.trigger('drag', drag_value, d, i);
            });
            return this.dragger.on('dragend', (d,i)=> {
                return this.trigger('dragend', drag_value, d, i);
            });
        }
    }

    _size() {
        __guard__(this.lines != null ? this.lines.all : undefined, x => x.attr('x2', this.line_length));
        __guard__(this.grab_lines != null ? this.grab_lines.all : undefined, x1 => x1.attr('x2', this.line_length));
        return __guard__(this.labels != null ? this.labels.all : undefined, x2 => x2.attr('x', (this.label_options.alignment === 'right') || (this.label_options.alignment === 'top') ? this.width : 0));
    }

    _update(origin){
        this.current_data = (this.filter != null) ? ((() => {
            const result = [];
            for (let i = 0; i < this.data.length; i++) {
                var d = this.data[i];
                if (this.filter(d,i)) {
                    result.push(d);
                }
            }
            return result;
        })()) : this.data;

        this.vectors = this.content.select('g.vector').options(this.vector_options).animate(origin === 'redraw')
            .bind(this.current_data, this.key).update();
        this.lines = this.vectors.inherit('line').options(this.line_options).update();

        if (this.label_options != null) {
            if (this.label_options.dx == null) { this.label_options.dx = '0.25em'; }
            if (this.label_options.dy == null) { this.label_options.dy = '-0.25em'; }
            this.labels = this.vectors.inherit('text').options(this.label_options).update();
        }

        // Add extra width for grabbable line area
        if (this.draggable || this.grab_line_options) {
            this.grab_lines = this.vectors.inherit('line.grab');
            if (this.grab_line_options) { this.grab_lines.options(this.grab_line_options).update(); }
        }

        if (this.draggable) {
            return this.vectors.new.call(this.dragger);
        }
    }

    _draw(origin){
        this.vectors.animate(origin === 'redraw').position({
            transform: (d,i)=> 'translate(0,' + (this.scale(this.value(d,i))) + ')'});

        this.lines.new.attr('x2', this.line_length);
        if (this.grab_lines != null) {
            this.grab_lines.new.attr('x2', this.line_length);
        }

        if (this.labels != null) {
            const far_labels = (this.label_options.alignment === 'right') || (this.label_options.alignment === 'top');
            this.g.style('text-anchor', far_labels ? 'end' : 'start');
            return this.labels.position({
                dx: far_labels ? '-'+this.label_options.dx : this.label_options.dx,
                dy: this.label_options.dy,
                x: far_labels ? this.line_length : 0
            });
        }
    }

    _style(style_new){
        this.g.classed('draggable', this.draggable);
        this.vectors.style(style_new);
        this.lines.style(style_new);
        __guardMethod__(this.grab_lines, 'style', o => o.style(style_new));
        return __guardMethod__(this.labels, 'style', o1 => o1.style(style_new));
    }
});
Cls.initClass();

// Horizontal line layer.  Please refer to {c3.Plot.Layer.Line.Straight} for documentation.
// @see c3.Plot.Layer.Line.Straight
Cls = (c3.Plot.Layer.Line.Horizontal = class Horizontal extends c3.Plot.Layer.Line.Straight {
    constructor(...args) {
        this._init = this._init.bind(this);
        this._size = this._size.bind(this);
        super(...args);
    }

    static initClass() {
        this.prototype.type = 'horizontal';
    }

    _init() {
        if (typeof label_options !== 'undefined' && label_options !== null) {
            label_options.alignment != null ? label_options.alignment : (label_options.alignment = 'left');
        }
        super._init(...arguments);
        return this.scale = this.v;
    }

    _size() {
        this.line_length = this.width;
        return super._size(...arguments);
    }
});
Cls.initClass();

// Vertical line layer.  Please refer to {c3.Plot.Layer.Line.Straight} for documentation.
// @see c3.Plot.Layer.Line.Straight
Cls = (c3.Plot.Layer.Line.Vertical = class Vertical extends c3.Plot.Layer.Line.Straight {
    constructor(...args) {
        this._init = this._init.bind(this);
        this._size = this._size.bind(this);
        super(...args);
    }

    static initClass() {
        this.prototype.type = 'vertical';
    }

    _init() {
        if (typeof label_options !== 'undefined' && label_options !== null) {
            label_options.alignment != null ? label_options.alignment : (label_options.alignment = 'top');
        }
        super._init(...arguments);
        return this.scale = this.h;
    }

    _size() {
        this.g.attr({
            transform: 'rotate(-90) translate('+-this.height+',0)'});
        this.line_length = this.height;
        return super._size(...arguments);
    }
});
Cls.initClass();


//##################################################################
// XY Plot Region Layers
//##################################################################

// Render a rectangular region in an {c3.Plot XY Plot Chart}.
//
// Define `x` and `x2` options for vertical regions,
// `y` and `y2` for horizontal regions, or all four for rectangular regions.
//
// The regions may be enabled to be `draggable` and/or `resizable`.
// The chart will move or resize the region interactively, however it is up to
// the user code to modify the data elements based on the `drag` or `dragend`
// events.  These callbacks are called with a structure of the new values and
// the data element as parameters.  The structure of new values is an object
// with `x`, `x2` and `y`, `y2` members.
//
// ## Extensibility
// The following {c3.Selection} members are made available if appropriate:
// * **regions**
// * **rects**
//
// ## Events
// * **dragstart** - called with the data element.
// * **drag** - called with the new position and the data element.
// * **dragend** - called with the new position and the data element.
//
// @author Douglas Armstrong
Cls = (c3.Plot.Layer.Region = class Region extends c3.Plot.Layer {
    constructor(...args) {
        this._init = this._init.bind(this);
        this._size = this._size.bind(this);
        this._update = this._update.bind(this);
        this._draw = this._draw.bind(this);
        this._style = this._style.bind(this);
        super(...args);
    }

    static initClass() {
        this.prototype.type = 'region';
    }

    _init() {
        if (((this.x != null) && (this.x2 == null)) || ((this.x == null) && (this.x2 != null)) || ((this.y != null) && (this.y2 == null)) || ((this.y == null) && (this.y2 != null))) {
            throw Error("x and x2 options or y and y2 options must either be both defined or undefined");
        }

        // Draggable lines
        if (this.draggable || this.resizable) {
            let drag_value = undefined;
            const origin = undefined;
            const self = this;
            this.dragger = d3.behavior.drag()
                .origin((d,i)=> {
                    return {
                        x: (this.x != null) ? this.h(this.x(d,i)) : 0,
                        y: (this.y != null) ? this.v(this.y(d,i)) : 0
                    };
            }).on('drag', function(d,i){
                    let height, width, x, y;
                    const h_domain = (self.orig_h != null ? self.orig_h : self.h).domain();
                    const v_domain = self.v.domain();
                    if (self.x != null) {
                        width = self.x2(d) - self.x(d);
                        x = Math.min(Math.max(self.h.invert(d3.event.x), h_domain[0]), h_domain[1]-width);
                    }
                    if (self.y != null) {
                        height = self.y2(d) - self.y(d);
                        y = Math.min(Math.max(self.v.invert(d3.event.y), v_domain[0]), v_domain[1]-height);
                    }
                    // Run values through scale round-trip in case it is a time scale.
                    drag_value = {
                        x: (x != null) ? self.h.invert(self.h(x)) : undefined,
                        x2: (x != null) ? self.h.invert(self.h(x + width)) : undefined,
                        y: (y != null) ? self.v.invert(self.v(y)) : undefined,
                        y2: (y != null) ? self.v.invert(self.v(y + height)) : undefined
                    };
                    if (self.x != null) { d3.select(this).attr('x', self.h(drag_value.x)); }
                    if (self.y != null) { d3.select(this).attr('y', self.v(drag_value.y2)); }
                    return self.trigger('drag', drag_value, d, i);
            });

            this.left_resizer = d3.behavior.drag()
                .origin((d,i)=> {
                    return {x: this.h(this.x(d, i))};
            }).on('drag', function(d,i){
                    const h_domain = (self.orig_h != null ? self.orig_h : self.h).domain();
                    const x = Math.min(Math.max(self.h.invert(d3.event.x), h_domain[0]), h_domain[1]);
                    const x2 = self.x2(d);
                    drag_value = {
                        x: self.h.invert(self.h(Math.min(x, x2))),
                        x2: self.h.invert(self.h(Math.max(x, x2))),
                        y: (self.y != null) ? self.y(d) : undefined,
                        y2: (self.y2 != null) ? self.y2(d) : undefined
                    };
                    d3.select(this.parentNode).select('rect').attr({
                        x: self.h(drag_value.x),
                        width: self.h(drag_value.x2) - self.h(drag_value.x)
                    });
                    return self.trigger('drag', drag_value, d, i);
            });

            this.right_resizer = d3.behavior.drag()
                .origin((d,i)=> {
                    return {x: this.h(this.x2(d, i))};
            }).on('drag', function(d,i){
                    const h_domain = (self.orig_h != null ? self.orig_h : self.h).domain();
                    const x = Math.min(Math.max(self.h.invert(d3.event.x), h_domain[0]), h_domain[1]);
                    const x2 = self.x(d);
                    drag_value = {
                        x: self.h.invert(self.h(Math.min(x, x2))),
                        x2: self.h.invert(self.h(Math.max(x, x2))),
                        y: (self.y != null) ? self.y(d) : undefined,
                        y2: (self.y2 != null) ? self.y2(d) : undefined
                    };
                    d3.select(this.parentNode).select('rect').attr({
                        x: self.h(drag_value.x),
                        width: self.h(drag_value.x2) - self.h(drag_value.x)
                    });
                    return self.trigger('drag', drag_value, d, i);
            });

            this.top_resizer = d3.behavior.drag()
                .origin((d,i)=> {
                    return {y: this.v(this.y2(d, i))};
            }).on('drag', function(d,i){
                    const v_domain = self.v.domain();
                    const y = Math.min(Math.max(self.v.invert(d3.event.y), v_domain[0]), v_domain[1]);
                    const y2 = self.y(d);
                    drag_value = {
                        x: (self.x != null) ? self.x(d) : undefined,
                        x2: (self.x2 != null) ? self.x2(d) : undefined,
                        y: self.v.invert(self.v(Math.min(y, y2))),
                        y2: self.v.invert(self.v(Math.max(y, y2)))
                    };
                    d3.select(this.parentNode).select('rect').attr({
                        y: self.v(drag_value.y2),
                        height: self.v(drag_value.y) - self.v(drag_value.y2)
                    });
                    return self.trigger('drag', drag_value, d, i);
            });

            this.bottom_resizer = d3.behavior.drag()
                .origin((d,i)=> {
                    return {y: this.v(this.y(d, i))};
            }).on('drag', function(d,i){
                    const v_domain = self.v.domain();
                    const y = Math.min(Math.max(self.v.invert(d3.event.y), v_domain[0]), v_domain[1]);
                    const y2 = self.y2(d);
                    drag_value = {
                        x: (self.x != null) ? self.x(d) : undefined,
                        x2: (self.x2 != null) ? self.x2(d) : undefined,
                        y: self.v.invert(self.v(Math.min(y, y2))),
                        y2: self.v.invert(self.v(Math.max(y, y2)))
                    };
                    d3.select(this.parentNode).select('rect').attr({
                        y: self.v(drag_value.y2),
                        height: self.v(drag_value.y) - self.v(drag_value.y2)
                    });
                    return self.trigger('drag', drag_value, d, i);
            });

            return [this.dragger, this.left_resizer, this.right_resizer, this.top_resizer, this.bottom_resizer].map((dragger) =>
                dragger
                    .on('dragstart', (d,i)=> {
                        d3.event.sourceEvent.stopPropagation(); // Prevent panning in zoomable charts
                        return this.trigger('dragstart', d, i);
                }).on('dragend', (d,i)=> {
                        this.trigger('dragend', drag_value, d, i);
                        return this._draw();
                })); // reposition the grab lines for the moved region
        }
    }

    _size() {
        if ((this.x == null)) {
            if (this.rects != null) {
                this.rects.all.attr('width', this.width);
            }
            if (this.left_grab_lines != null) {
                this.left_grab_lines.all.attr('width', this.width);
            }
            if (this.right_grab_lines != null) {
                this.right_grab_lines.all.attr('width', this.width);
            }
        }
        if ((this.y == null)) {
            if (this.rects != null) {
                this.rects.all.attr('height', this.height);
            }
            if (this.top_grab_lines != null) {
                this.top_grab_lines.all.attr('height', this.height);
            }
            return (this.bottom_grab_lines != null ? this.bottom_grab_lines.all.attr('height', this.height) : undefined);
        }
    }

    _update(origin){
        this.current_data = (this.filter != null) ? ((() => {
            const result = [];
            for (let i = 0; i < this.data.length; i++) {
                var d = this.data[i];
                if (this.filter(d,i)) {
                    result.push(d);
                }
            }
            return result;
        })()) : this.data;

        this.regions = this.content.select('g.region').options(this.region_options).animate(origin === 'redraw')
            .bind(this.current_data, this.key).update();
        this.rects = this.regions.inherit('rect').options(this.rect_options).update();

        if (this.draggable) {
            this.rects.new.call(this.dragger);
        }

        // Add extra lines for resizing regions
        if (this.resizable) {
            if (this.x != null) {
                this.left_grab_lines = this.regions.inherit('line.grab.left');
                this.left_grab_lines.new.call(this.left_resizer);
            }
            if (this.x2 != null) {
                this.right_grab_lines = this.regions.inherit('line.grab.right');
                this.right_grab_lines.new.call(this.right_resizer);
            }
            if (this.y != null) {
                this.top_grab_lines = this.regions.inherit('line.grab.top');
                this.top_grab_lines.new.call(this.top_resizer);
            }
            if (this.y2 != null) {
                this.bottom_grab_lines = this.regions.inherit('line.grab.bottom');
                return this.bottom_grab_lines.new.call(this.bottom_resizer);
            }
        }
    }

    _draw(origin){
        this.rects.animate(origin === 'redraw').position({
            x: d=> (this.x != null) ? this.h(this.x(d)) : 0,
            width: d=> (this.x2 != null) ? this.h(this.x2(d))-this.h(this.x(d)) : this.width,
            y: d=> (this.y2 != null) ? this.v(this.y2(d)) : 0,
            height: d=> (this.y != null) ? this.v(this.y(d))-this.v(this.y2(d)) : this.height
        });

        if (this.resizable) {
            if (this.left_grab_lines != null) {
                this.left_grab_lines.animate(origin === 'redraw').position({
                x1: d=> this.h(this.x(d)),
                x2: d=> this.h(this.x(d)),
                y1: d=> (this.y != null) ? this.v(this.y(d)) : 0,
                y2: d=> (this.y2 != null) ? this.v(this.y2(d)) : this.height
            });
            }
            if (this.right_grab_lines != null) {
                this.right_grab_lines.animate(origin === 'redraw').position({
                x1: d=> this.h(this.x2(d)),
                x2: d=> this.h(this.x2(d)),
                y1: d=> (this.y != null) ? this.v(this.y(d)) : 0,
                y2: d=> (this.y2 != null) ? this.v(this.y2(d)) : this.height
            });
            }
            if (this.top_grab_lines != null) {
                this.top_grab_lines.animate(origin === 'redraw').position({
                x1: d=> (this.x != null) ? this.h(this.x(d)) : 0,
                x2: d=> (this.x2 != null) ? this.h(this.x2(d)) : this.width,
                y1: d=> this.v(this.y2(d)),
                y2: d=> this.v(this.y2(d))
            });
            }
            return (this.bottom_grab_lines != null ? this.bottom_grab_lines.animate(origin === 'redraw').position({
                x1: d=> (this.x != null) ? this.h(this.x(d)) : 0,
                x2: d=> (this.x2 != null) ? this.h(this.x2(d)) : this.width,
                y1: d=> this.v(this.y(d)),
                y2: d=> this.v(this.y(d))
            }) : undefined);
        }
    }

    _style(style_new){
        this.g.classed({
            'draggable': this.draggable,
            'horizontal': (this.x == null),
            'vertical': (this.y == null)
        });
        this.regions.style(style_new);
        return this.rects.style(style_new);
    }
});
Cls.initClass();


//##################################################################
// XY Plot Scatter Layer
//##################################################################

// Scatter plot layer for the {c3.Plot XY Plot Chart}
//
// Datapoints include a circle and an optional label.
// _Set `label_options.text` to define the label for each point._
//
// ## Extensibility
// The following {c3.Selection} members are made available if appropriate:
// * **points** - Representing svg:g nodes for each datapoint
// * **circles** - Representing svg:circle nodes for each datapoint
// * **labels** - Representing svg:text labels for each datapoint
// @author Douglas Armstrong
// @todo Only render datapoints within the current zoomed domain.
Cls = (c3.Plot.Layer.Scatter = class Scatter extends c3.Plot.Layer {
    constructor(...args) {
        this._init = this._init.bind(this);
        this._update = this._update.bind(this);
        this._draw = this._draw.bind(this);
        this._style = this._style.bind(this);
        super(...args);
    }

    static initClass() {
        this.version = 0.1;
        this.prototype.type = 'scatter';
    
        // [Function] Accessor function to define a unique key to each data point.  This has performance implications.
        // _This is required to enable **animations**._
        this.prototype.key = undefined;
        // [Function, Number] Accessor or value to set the value for each data point.
        //   This is used when limiting the number of elements.
        this.prototype.value = undefined;
        // [Function, Number] Accessor or value to set the circle radius
        this.prototype.r = 1;
        // [Function, Number] Accessor or value to set the circle area. _Takes precedence over r._
        this.prototype.a = undefined;
        // [Boolean] Safe mode will not render data where a positioning accessor returns undefined.
        // _This may cause the index passed to accessors to not match the original data array._
        this.prototype.safe = true;
        // [Function] Accessor to determine if the data point should be drawn or not
        // _This may cause the index passed to accessors to not match the original data array._
        this.prototype.filter = undefined;
        // [Number] Limit the number of data points.
        // _This may cause the index passed to accessors to not match the original data array._
        this.prototype.limit_elements = undefined;
        // [{c3.Selection.Options}] Options for svg:g nodes for each datapoint.
        this.prototype.point_options = undefined;
        // [{c3.Selection.Options}] Options for the svg:circle of each datapoint
        this.prototype.circle_options = undefined;
        // [{c3.Selection.Options}] Options for the svg:text lables of each datapoint.
        this.prototype.label_options = undefined;
    }

    _init() {
        if ((this.x == null)) { throw Error("x must be defined for a scatter plot layer"); }
        if ((this.y == null)) { throw Error("y must be defined for a scatter plot layer"); }
        if ((this.h == null)) { throw Error("h must be defined for a scatter plot layer"); }
        if ((this.v == null)) { throw Error("v must be defined for a scatter plot layer"); }
    }

    _update(origin){
        let i, d;
        if (!this.data) { throw Error("Data must be defined for scatter layer."); }

        // Filter the data for safety
        this.current_data = (this.filter != null) && (this.key != null) ? ((() => {
            const result = [];
            for (i = 0; i < this.data.length; i++) {
                d = this.data[i];
                if (this.filter(d,i)) {
                    result.push(d);
                }
            }
            return result;
        })()) : this.data;
        if (this.safe) { this.current_data = ((() => {
            const result1 = [];
            for (d of Array.from(this.current_data)) {                 if ((this.x(d) != null) && (this.y(d) != null) && ((this.a == null) || (typeof this.a!=='function') || (this.a(d) != null)) && ((typeof this.r!=='function') || (this.r(d) != null))) {
                    result1.push(d);
                }
            }
            return result1;
        })()); }

        // Limit the number of elements?
        if (this.limit_elements != null) {
            if (this.value != null) {
                this.current_data = this.current_data.slice(); // Copy the array to avoid messing up the user's order
                c3.array.sort_up(this.current_data, d=> -this.value(d)); // Sort by negative to avoid reversing array
                this.current_data = this.current_data.slice(0, +this.limit_elements + 1 || undefined);
            } else { this.current_data = this.current_data.slice(0, +this.limit_elements + 1 || undefined); }
        }

        // Bind and create the elements
        this.points = this.content.select('g.point').options(this.point_options).animate(origin === 'redraw')
            .bind(this.current_data, this.key).update();

        // If there is no key, then hide the elements that are filtered
        if ((this.filter != null) && (this.key == null)) {
            this.points.all.attr('display', (d,i)=> { if (!this.filter(d,i)) { return 'none'; } });
        }

        // Add circles to the data points
        this.circles = this.points.inherit('circle').options(this.circle_options).animate(origin === 'redraw').update();

        // Add labels to the data points
        if (this.label_options != null) {
            return this.labels = this.points.inherit('text').options(this.label_options).update();
        }
    }

    _draw(origin){
        this.points.animate(origin === 'redraw').position({
            transform: (d,i)=> 'translate('+(this.h(this.x(d,i)))+','+(this.v(this.y(d,i)))+')'});

        return this.circles.animate(origin === 'redraw').position({
            r: (this.a == null) ? this.r :
                typeof this.a === 'function' ? (d,i)=> Math.sqrt( this.a(d,i) / Math.PI )
                : Math.sqrt( this.a / Math.PI )
        });
    }

    _style(style_new){
        this.points.style(style_new);
        this.circles.style(style_new);
        return (this.labels != null ? this.labels.style(style_new) : undefined);
    }
});
Cls.initClass();


//##################################################################
// XY Plot Swimlane Layers
//##################################################################

// Base abstract class for {c3.Plot XY Plot} {c3.Plot.Layer layers} with horizontal swim lanes.
// Swimlanes are numbered based on the vertical scale domain for the layer.
// The first entry in the domain is the top swimlane and the last entry is the bottom swimlane plus 1.
// If the first and last domain values are equal, then there are no swimlanes rendered.
//
// ## Extensibility
// The following {c3.Selection} members are made available if appropriate:
// * **lanes** - svg:rect's for each swimlane
// * **tip** - HTML hover content
// @abstract
// @author Douglas Armstrong
Cls = (c3.Plot.Layer.Swimlane = class Swimlane extends c3.Plot.Layer {
    constructor(...args) {
        this._init = this._init.bind(this);
        this._size = this._size.bind(this);
        this._update = this._update.bind(this);
        this._draw = this._draw.bind(this);
        this._style = this._style.bind(this);
        super(...args);
    }

    static initClass() {
        this.prototype.type = 'swimlane';
    
        // [String] `top` for 0 to be at the top, `bottom` for the bottom.
        // Swimlanes default to 0 at the top.
        this.prototype.v_orient = 'top';
        // [Number] Height of a swimlane in pixels.
        // Chart height will be adjusted if number of swimlanes changes in a redraw()
        this.prototype.dy = undefined;
        // [Function] Provide HTML content for a hover div when mousing over the layer
        // This callback will be called with the datum and index of the item being hovered over.
        // It will be called with null when hovering over the layer but not any data items.
        this.prototype.hover = undefined;
        // [{c3.Selection.Options}] Options for the lane svg:rect nodes for swimlanes
        this.prototype.lane_options = undefined;
    }

    _init() {
        if (this.lane_options != null) { this.lanes = this.content.select('rect.lane',':first-child').options(this.lane_options); }

        // Support html hover tooltips
        if (this.hover != null) {
            const anchor = d3.select(this.chart.anchor);
            this.tip = c3.select( anchor, 'div.c3.hover' ).singleton();
            const layer = this;
            const mousemove = function() {
                const [layerX,layerY] = Array.from(d3.mouse(this));
                // Get swimlane and ensure it is properly in range (mouse may be over last pixel)
                let swimlane = Math.floor(layer.v.invert(layerY));
                swimlane = Math.min(swimlane, Math.max(layer.v.domain()[0], layer.v.domain()[1]-1));
                let x = layer.h.invert(layerX);

                const hover_datum = layer._hover_datum(x, swimlane);
                const hover_html = (c3.functor(layer.hover))(
                  hover_datum,
                  (hover_datum ? layer.data.indexOf(hover_datum) : null),
                  swimlane
                );
                if (!hover_html) {
                    return layer.tip.all.style('display', 'none');
                } else {
                    layer.tip.all.html(hover_html);
                    const elt = layer.tip.all.node();
                    x = d3.event.clientX;
                    const y = d3.event.clientY;

                    if ((x + elt.clientWidth) > document.body.clientWidth) {
                        x = document.body.clientWidth - elt.clientWidth;
                    }

                    return layer.tip.all.style({
                        display: 'block',
                        left: x+'px',
                        top: y+'px'
                    });
                }
            };

            // Set for vertical panning
            this.chart.v_orient = this.v_orient;

            // Manage tooltip event handlers, disable while zooming/panning
            this.chart.content.all.on('mouseleave.hover', () => layer.tip.all.style('display', 'none'));
            this.chart.content.all.on('mousedown.hover', () => {
                layer.tip.all.style('display', 'none');
                return this.chart.content.all.on('mousemove.hover', null);
            });
            this.chart.content.all.on('mouseup.hover', () => this.chart.content.all.on('mousemove.hover', mousemove));
            this.chart.content.all.on('mouseenter.hover', () => { if (!d3.event.buttons) { return this.chart.content.all.on('mousemove.hover', mousemove); } });
            return this.chart.content.all.on('mousemove.hover', mousemove);
        }
    }

    _size() {
        // If @dy is not defined, we determine it based on the chart height
        if ((this.y == null)) { this.dy = this.height;
        } else { if (this.dy == null) { this.dy = Math.round(this.height / (Math.abs(this.v.domain()[1]-this.v.domain()[0]))); } }

        // If a swimlane starts at the bottom, then shift up by dy because SVG always
        // renders the height of element downward.
        return this.g.attr('transform', this.v_orient === 'bottom' ? 'translate(0,-'+this.dy+')' : '');
    }

    _update() {
        // Support constant values and accessors
        this.x = c3.functor(this.x);
        this.dx = c3.functor(this.dx);

        if (this.lanes != null) {
            this.lanes.bind(__range__(this.v.domain()[0], this.v.domain()[1], false)).update();
        }

        // Update chart height to fit current number of swimlanes based on current v domain
        if (this.y != null) { return this.chart.size(null, (this.dy*(Math.abs(this.v.domain()[1]-this.v.domain()[0]))) + this.chart.margins.top + this.chart.margins.bottom); }
    }

    _draw(origin){
        if ((origin === 'resize') || (origin === 'render')) {
            return (this.lanes != null ? this.lanes.position({
                y: lane=> this.v(lane),
                width: this.chart.orig_h.range()[1],
                height: this.dy
            }) : undefined);
        }
    }

    _style() {
        return (this.lanes != null ? this.lanes.style() : undefined);
    }
});
Cls.initClass();


//##################################################################
// XY Plot Segment Swimlane Layer
//##################################################################

// A {c3.Plot.Layer.Swimlane swimlane layer} for drawing horizontal segments in each swimlane.
//
// _Set `label_options.text` to define labels for the segments._
// The following {c3.Selection} members are made available if appropriate:
// ## Extensibility
// The following {c3.Selection} members are made available if appropriate:
// * **rects** - svg:rect for each segment
// @todo Better threshold for determining which segments get labels.  _Currently it is any segment > 50 pixels wide._
// @author Douglas Armstrong
(function() {
    let scaled = undefined;
    Cls = (c3.Plot.Layer.Swimlane.Segment = class Segment extends c3.Plot.Layer.Swimlane {
        constructor(...args) {
            this._init = this._init.bind(this);
            this._hover_datum = this._hover_datum.bind(this);
            this._update = this._update.bind(this);
            this._draw = this._draw.bind(this);
            this._style = this._style.bind(this);
            super(...args);
        }

        static initClass() {
            this.version = 0.1;
            this.prototype.type = 'segment';
    
            // **REQUIRED** [Function] Accessor to get the width of the segment
            this.prototype.dx = null;
            // [Function] Key accessor to uniquely identify the segment.
            //   Defining this improves performance for redraws.
            this.prototype.key = undefined;
            // [Function] Accessor to determine if an element should be rendered
            this.prototype.filter = undefined;
            // [Function] Value accessor for each segment.  Used when limiting the number of elements.  _Defaults to dx._
            this.prototype.value = undefined;
            // [Number] Specifies the maximum number of segments this layer will draw.  Smaller segments are elided first.
            this.prototype.limit_elements = undefined;
            // [{c3.Selection.Options}] Options for the svg:rect nodes for each segment
            this.prototype.rect_options = undefined;
            // [{c3.Selection.Options}] Options for the label svg:text nodes for each segment
            this.prototype.label_options = undefined;
    
            // IE10/11 doesn't support vector-effects: non-scaling-stroke, so avoid using scaled SVG.
            // This is a performance hit, because then we have to adjust the position of all rects for each redraw
            // TODO: Investigate if they added support for this in Edge.
            //scaled = !window.navigator.userAgent.match(/MSIE|Trident/) # MSIE==IE10, Trident==IE11, Edge==Edge
            // [3/18/2016] Disable the SVG scaled layer optimization completely for now.
            // If there are very large domains (e.g. a billion) then there is a floating-point precision problem
            // relying on SVG transformations to do the scaling/translation.
            // This doesn't seem to be a problem if we do the scaling ourselves in JavaScript.
            scaled = false;
        }

        _init() {
            super._init(...arguments);
            this.g.classed('segment', true); // Manually do this so inherited types also have this class
            if (scaled) { this.scaled_g = this.g.append('g').attr('class','scaled'); }
            this.rects_group = c3.select((this.scaled_g != null ? this.scaled_g : this.g),'g.segments').singleton();
            if (this.label_options != null) { return this.labels_clip = c3.select(this.g,'g.labels').singleton().select('svg'); }
        }

        _hover_datum(x, swimlane){
            let datum, idx;
            const right = this.h.invert(this.h(x)+1); // Get the pixel width
            for (idx = 0; idx < this.current_data.length; idx++) {
                var _x;
                datum = this.current_data[idx];
                if (((this.y == null) || (this.y(datum)===swimlane)) && ((_x=this.x(datum)) <= right) && (x <= (_x+this.dx(datum)))) { break; }
            }
            if (idx===this.current_data.length) { return null; } else { return datum; }
        }

        _update() {
            super._update(...arguments);
            // Pull filtered data elements
            this.current_data = (this.filter == null) ? this.data : ((() => {
                const result = [];
                for (let i = 0; i < this.data.length; i++) {
                    var d = this.data[i];
                    if (this.filter(d,i)) {
                        result.push(d);
                    }
                }
                return result;
            })());

            // Pre-sort data by "value" for limiting to the most important elements
            if (this.limit_elements != null) {
                if ((this.filter == null)) { this.current_data = this.current_data.slice(); }
                return c3.array.sort_down(this.current_data, (this.value != null ? this.value : this.dx));
            }
        }

        _draw(origin){
            let dx, x;
            let datum;
            super._draw(...arguments);

            // Gather data for the current viewport domain
            const [left_edge, right_edge] = Array.from(this.h.domain());
            const half_pixel_width = (right_edge-left_edge) / ((this.h.range()[1]-this.h.range()[0]) || 1) / 2;
            const data = [];
            for (datum of Array.from(this.current_data)) {
                if (((x=this.x(datum)) < right_edge) && ((x+(dx=this.dx(datum))) > left_edge)) {
                    if (dx < half_pixel_width) {
                        if (this.limit_elements != null) { break; } else { continue; }
                    }
                    data.push(datum);
                    if (data.length === this.limit_elements) { break; }
                }
            }

            // Bind here because the current data set is dynamic based on zooming
            this.rects = this.rects_group.select('rect.segment').options(this.rect_options).bind(data, this.key).update();

            // Get the vertical scale based on any possible vertical panning from a zoomable chart
            if (origin==='pan') {
                const translate = (this.chart.v.domain()[0] - this.chart.orig_v.domain()[0]) * this.max_depth; // Assume V scale is 0-1
                this.v.domain([translate, translate+this.max_depth]);
            }

            // Position the rects
            const h = (this.scaled_g != null) ? (this.chart.orig_h != null ? this.chart.orig_h : this.h) : this.h;
            let zero_pos = h(0);
            (origin === 'resize' ? this.rects.all : this.rects.new).attr('height', this.dy);
            (!scaled || (this.key == null) || (origin==='resize') || (origin==='pan') || ((origin==='redraw') && this instanceof c3.Plot.Layer.Swimlane.Flamechart)
            ? this.rects.all : this.rects.new).attr({
                x: d=> h(this.x(d)),
                width: d=> (h(this.dx(d))) - zero_pos,
                y: (this.y == null) ? 0 : d=> this.v(this.y(d))
            });

            // Bind and render lables here (not in _update() since the set is dynamic based on zooming and resizing)
            if (this.label_options != null) {
                // Create labels in a nested SVG node so we can crop them based on the segment size.
                zero_pos = this.h(0);
                const current_labels = ((() => {
                    const result = [];
                    for (datum of Array.from(data)) {                         if (((this.h(this.dx(datum)))-zero_pos)>50) {
                            result.push(datum);
                        }
                    }
                    return result;
                })());
                this.labels_clip.bind(current_labels, this.key);
                this.labels = this.labels_clip.inherit('text').options(this.label_options).update();

                (origin === 'resize' ? this.labels_clip.all : this.labels_clip.new).attr('height', this.dy);
                this.labels_clip.position({
                    x: d=> this.h(this.x(d)),
                    y: (this.y == null) ? 0 : (d,i)=> this.v(this.y(d,i)),
                    width: d=> (this.h(this.dx(d))) - zero_pos
                });
                const self = this;
                (origin === 'resize' ? this.labels.all : this.labels.new).attr('y', self.dy/2);
                this.labels.position({
                    x(d){
                        x = self.x(d);
                        dx = self.dx(d);
                        const left = Math.max(x, self.h.domain()[0]);
                        const right = Math.min(x+dx, self.h.domain()[1]);
                        return self.h( ((right-left)/2) + (left-x) ) - zero_pos;
                    }
                });
    //                x: (d)->
    //                    x = self.x(d)
    //                    dx = self.dx(d)
    //                    left = Math.max x, self.h.domain()[0]
    //                    right = Math.min x+dx, self.h.domain()[1]
    //                    # NOTE: This is expensive.  Chrome was faster with offsetWidth, but Firefox and IE11 didn't support it
    //                    text_width = this.offsetWidth ? this.getBBox().width
    //                    if self.h(right-left)-zero_pos > text_width
    //                        return self.h( (right-left)/2 + (left-x) ) - zero_pos - (text_width/2)
    //                    else
    //                        return if x < left then self.h(left-x)-zero_pos+1 else 1
            } else {
                c3.select(this.g,'g.labels').all.remove();
                delete this.labels;
            }

            // Style any new elements we added by resizing larger that allowed new relevant elements to be drawn
            if ((origin === 'resize') && (!this.rects.new.empty() || ((this.labels != null) && !this.labels.new.empty()))) {
                return this._style(true);
            }
        }

        _style(style_new){
            super._style(...arguments);
            this.rects.style(style_new);
            return (this.labels != null ? this.labels.style(style_new) : undefined);
        }
    });
    Cls.initClass();
    return Cls;
})();


//##################################################################
// Flamechart
//##################################################################

// A {c3.Plot.Layer.Swimlane swimlane layer} for rendering _flamecharts_ or _flamegraphs_.
//
// In C3, both a {c3.Plot.Layer.Swimlane.Flamechart Flamechart} and an
// {c3.Plot.Layer.Swimlane.Icicle Icicle} can actually grow either up or down
// depending if you set `v_orient` as `top` or `bottom`.
// A _Flamechart_ defaults to growing up and an _Icicle_ defaults to growing down.
// In C3, a {c3.Plot.Layer.Swimlane.Flamechart Flamechart} visualizes a timeline
// of instances of nested events over time, while an {c3.Plot.Layer.Swimlane.Icicle Icicle}
// visualizes an aggregated tree hierarchy of nodes.  The {c3.Polar.Layer.Sunburst Sunburst}
// is the equivalent of an _Icicle_ rendered on a polar axis.
//
// A `key()` is required for this layer.
// You should not define `y`, but you must define a `x`, `dx`, and `dy`.
//
// @author Douglas Armstrong
Cls = (c3.Plot.Layer.Swimlane.Flamechart = class Flamechart extends c3.Plot.Layer.Swimlane.Segment {
    constructor(...args) {
        this._init = this._init.bind(this);
        this._update = this._update.bind(this);
        super(...args);
    }

    static initClass() {
        this.version = 0.1;
        this.prototype.type = 'flamechart';
    
        // [String] `top` for 0 to be at the top, `bottom` for the bottom.
        // Flamechart defaults to bottom-up.
        this.prototype.v_orient = 'bottom';
    }

    _init() {
        super._init(...arguments);
        if ((this.key == null)) { throw Error("`key()` accessor function is required for Flamechart layers"); }
        if ((this.dy == null)) { throw Error("`dy` option is required for Flamechart layers"); }
        if (this.y != null) { throw Error("`y` option cannot be defined for Flamechart layers"); }
        this.y = d=> this.depths[this.key(d)];
        return this.depths = {};
    }

    _update(origin){
        super._update(...arguments);

        // Compute depths for each data element
        const data = this.current_data.slice();
        c3.array.sort_up(data, this.x);
        let max_depth = 0;
        const stack = [];
        for (var datum of Array.from(data)) {
            var _frame;
            var frame = {
                x: this.x(datum),
                dx: this.dx(datum)
            };
            while (stack.length && (frame.x >= ((_frame=stack[stack.length-1]).x + _frame.dx))) {
                stack.length--;
            }
            stack.push(frame);
            max_depth = Math.max(max_depth, stack.length); // stack.length is starting from 0, so don't reduce by one.
            this.depths[this.key(datum)] = stack.length - 1;
        }

        // Set the vertical domain and resize chart based on maximum flamechart depth
        this.v.domain([0, max_depth]);
        // Set max depth here because at some point the v.domain gets reset to something incorrect in the initialization
        // and we need this value for panning
        this.max_depth = max_depth;
        return c3.Plot.Layer.Swimlane.prototype._update.call(this, origin);
    }
});
Cls.initClass();


//##################################################################
// Icicle
//##################################################################

// A {c3.Plot.Layer.Swimlane swimlane layer} for rendering _icicle_ charts.
//
// In C3, both a {c3.Plot.Layer.Swimlane.Flamechart Flamechart} and an
// {c3.Plot.Layer.Swimlane.Icicle Icicle} can actually grow either up or down
// depending if you set `v_orient` as `top` or `bottom`.
// A _Flamechart_ defaults to growing up and an _Icicle_ defaults to growing down.
// In C3, a {c3.Plot.Layer.Swimlane.Flamechart Flamechart} visualizes a timeline
// of instances of nested events over time, while an {c3.Plot.Layer.Swimlane.Icicle Icicle}
// visualizes an aggregated tree hierarchy of nodes.  The {c3.Polar.Layer.Sunburst Sunburst}
// is the equivalent of an _Icicle_ rendered on a polar axis.
//
// A `key()` is required for this layer.
// You should not define `x` or `y`, but you must define `dy`.
// Specify a callback for either `parent_key`,
// `children`, or `children_keys` to describe the hierarchy.
// If using `parent_key` or `children_keys` the `data` array shoud include all nodes,
// if using `children` it only should include the root nodes.
// Define either `value()` or `self_value()` to value the nodes in the hierarchy.
//
// If you care about performance, you can pass the
// parameter `revalue` to `redraw('revalue')` if you are keeping the same dataset
// hierarchy, and only changing the element's values.
// The Icicle layer can use a more optimized algorithm in this situation.
//
// ## Events
// * **rebase** Called with the datum of a node when it becomes the new root
//   or with `null` if reverting to the top of the hierarchy.
//
// @author Douglas Armstrong
Cls = (c3.Plot.Layer.Swimlane.Icicle = class Icicle extends c3.Plot.Layer.Swimlane {
    constructor(...args) {
        this._init = this._init.bind(this);
        this._hover_datum = this._hover_datum.bind(this);
        this._update = this._update.bind(this);
        this._draw = this._draw.bind(this);
        this._style = this._style.bind(this);
        this.rebase = this.rebase.bind(this);
        this.rebase_key = this.rebase_key.bind(this);
        super(...args);
    }

    static initClass() {
        this.version = 0.1;
        this.prototype.type = 'icicle';
    
        // **REQUIRED** [Function] Accessor function to define a unique key for each data element.
        // _This has performance implications and is required for some layers and **animations**._
        this.prototype.key = undefined;
    
        // [Function] Accessor to get the "_total_" value of the data element.
        // That is the total value of the element itself inclusive of all of it's children's value.
        // You can define either _value_ or _self_value_.
        this.prototype.value = undefined;
        // [Function] The `value` accessor defines the "_total_" value for an element, that is the value of
        // the element itself plus that of all of its children.  If you know the "self" value of an
        // element without the value of its children, then define this callback accessor instead.
        // The `value` option will then also be defined for you, which you can use to get the total value
        // of an element after the layer has been drawn.
        this.prototype.self_value = undefined;
    
        // [Function] A callback that should return the key of the parent of an element.
        // It is called with a data element as the first parameter.
        this.prototype.parent_key = undefined;
        // [Function] A callback that should return an array of child keys of an element.
        // The returned array may be empty or null.
        // It is called with a data element as the first parameter.
        this.prototype.children_keys = undefined;
        // [Function] A callback that should return an array of children elements of an element.
        // The returned array may be empty or null.
        // It is called with a data element as the first parameter.
        this.prototype.children = undefined;
    
        // [Boolean, Function] How to sort the partitioned tree segments.
        // `true` sorts based on _total_ value, or you can define an alternative
        // accessor function to be used for sorting.
        this.prototype.sort = false;
    
        // [Number] Limit the number of data elements to render based on their value.
        // _This affects the callback index parameter_
        this.prototype.limit_elements = undefined;
        // [Number] Don't bother rendering segments whose value is smaller than this
        // percentage of the current domain focus. (1==100%)
        this.prototype.limit_min_percent = 0.001;
    
        // Data element that represents the root of the hierarchy to render.
        // If this is specified, then only this root and its parents and children will be rendered
        // When {c3.Plot.Layer.Icicle#rebase rebase()} is called or a node is clicked on
        // it will animate the transition to a new root node, if animation is enabled.
        this.prototype.root_datum = null;
    
        // [Boolean] Set the root_datum on node click.
        // This will also zoom the Icicle to that root.
        this.prototype.set_root_on_click = true;
    
        // [{c3.Selection.Options}] Options for the svg:rect nodes for each segment
        this.prototype.rect_options = undefined;
        // [{c3.Selection.Options}] Options for the label svg:text nodes for each segment
        this.prototype.label_options = undefined;
    }

    _init() {
        super._init(...arguments);
        if ((this.key == null)) { throw Error("`key()` accessor function is required for Icicle layers"); }
        if ((this.dy == null)) { throw Error("`dy` option is required for Icicle layers"); }
        if (this.x != null) { throw Error("`x` option cannot be defined for Icicle layers"); }
        if (this.y != null) { throw Error("`y` option cannot be defined for Icicle layers"); }
        this.y = datum=> this.nodes[this.key(datum)].y1;

        this.segments_g = c3.select(this.g, 'g.segments').singleton();

        this.segment_options = { events: { click: d=> {
            if (this.set_root_on_click) {
                return this.rebase(d !== this.root_datum ? d
                : __guard__(((this.parent_key != null) ? this.nodes[this.parent_key(d)] : this.nodes[this.key(d)].parent), x => x.datum)
                );
            }
        }
        } };
        this.label_clip_options = {};
        if (this.label_options != null) {
            if (this.label_options.animate == null) { this.label_options.animate = this.rect_options.animate; }
            if (this.label_options.duration == null) { this.label_options.duration = this.rect_options.duration; }
            if (this.label_clip_options.animate == null) { this.label_clip_options.animate = this.rect_options.animate; }
            return this.label_clip_options.duration != null ? this.label_clip_options.duration : (this.label_clip_options.duration = this.rect_options.duration);
        }
    }

    _hover_datum(x, swimlane){
        const right = this.h.invert(this.h(x)+1); // Get the pixel width
        for (var key in this.nodes) {
            var node = this.nodes[key];
            if ((node.y1 === swimlane) && (node.x1 <= right) && (x <= node.x2)) {
                return node.datum;
            }
        }
        return null;
    }

    _update(origin){
        super._update(...arguments);

        // Construct the tree hierarchy
        if ((origin !== 'revalue') && (origin !== 'rebase')) {
            this.tree = new c3.Layout.Tree({
                key: this.key,
                parent_key: this.parent_key, children_keys: this.children_keys, children: this.children,
                value: this.value, self_value: this.self_value
            });
            this.nodes = this.tree.construct(this.data);

            // Set the vertical domain and resize chart based on maximum flamechart depth
            this.v.domain([0, d3.max(Object.keys(this.nodes), key=> this.nodes[key].y2)]);
            c3.Plot.Layer.Swimlane.prototype._update.call(this, origin);
        }

        // Compute the "total value" of each node
        if (origin !== 'rebase') {
            this.value = this.tree.revalue();
        }

        // Partition the arc segments based on the node values
        // We need to do this even for 'rebase' in case we shot-circuited previous paritioning
        this.current_data = this.tree.layout(
            (origin !== 'revalue') && (origin !== 'rebase') ? this.sort : false,
            this.limit_min_percent,
            this.root_datum
        );

        // Limit the number of elements to bind to the DOM
        if (this.current_data.length > this.limit_elements) {
            c3.array.sort_up(this.current_data, this.value); // sort_up is more efficient than sort_down
            this.current_data = this.current_data.slice(-this.limit_elements);
        }

        // Bind data elements to the DOM
        this.segment_options.animate = this.rect_options != null ? this.rect_options.animate : undefined;
        this.segment_options.animate_old = this.rect_options != null ? this.rect_options.animate : undefined;
        this.segment_options.duration = this.rect_options != null ? this.rect_options.duration : undefined;
        this.segments = this.segments_g.select('g.segment').options(this.segment_options)
            .animate((origin === 'redraw') || (origin === 'revalue') || (origin === 'rebase'))
            .bind(this.current_data, this.key).update();
        if (this.rect_options != null) {
            this.rect_options.animate_old != null ? this.rect_options.animate_old : (this.rect_options.animate_old = this.rect_options != null ? this.rect_options.animate : undefined);
        }
        this.rects = this.segments.inherit('rect').options(this.rect_options).update();
        if (this.label_options != null) {
            this.label_clip_options.animate_old = this.label_options != null ? this.label_options.animate : undefined;
            return this.label_clips = this.segments.inherit('svg.label').options(this.label_clip_options);
        }
    }

    _draw(origin){
        let root_node;
        super._draw(...arguments);

        // Set the horizontal domain based on the root node.
        const prev_h = this.h.copy();
        const prev_zero_pos = prev_h(0);
        if (this.root_datum != null) { root_node = this.nodes[this.key(this.root_datum)]; }
        this.h.domain([(root_node != null ? root_node.x1 : undefined) != null ? (root_node != null ? root_node.x1 : undefined) : 0, (root_node != null ? root_node.x2 : undefined) != null ? (root_node != null ? root_node.x2 : undefined) : 1]);
        const zero_pos = this.h(0);

        // Position the segments.
        // Place any new segments where they would have been if not decimated.
        (origin === 'resize' ? this.rects.all : this.rects.new).attr('height', this.dy);
        this.rects.animate((origin === 'redraw') || (origin === 'revalue') || (origin === 'rebase')).position({
            x: d=> this.h(this.nodes[this.key(d)].x1),
            y: d=> this.v(this.nodes[this.key(d)].y1),
            width: d=> { let node;
            return this.h((node=this.nodes[this.key(d)]).x2 - node.x1) - zero_pos; }
          }, {
            x: d=> prev_h(this.nodes[this.key(d)].px1),
            y: d=> this.v(this.nodes[this.key(d)].py1),
            width: d=> { let node;
            return prev_h((node=this.nodes[this.key(d)]).px2 - node.px1) - prev_zero_pos; }
          });

        if (this.label_options != null) {
            (origin === 'resize' ? this.rects.all : this.rects.new).attr('height', this.dy);
            this.label_clips.animate((origin === 'redraw') || (origin === 'revalue') || (origin === 'rebase')).position({
                x: d=> this.h(this.nodes[this.key(d)].x1),
                y: d=> this.v(this.nodes[this.key(d)].y1),
                width: d=> { let node;
                return this.h((node=this.nodes[this.key(d)]).x2 - node.x1) - zero_pos; }
              }, {
                x: d=> prev_h(this.nodes[this.key(d)].px1),
                y: d=> this.v(this.nodes[this.key(d)].py1),
                width: d=> { let node;
                return prev_h((node=this.nodes[this.key(d)]).px2 - node.px1) - prev_zero_pos; }
              });

            // Bind and position labels for larger segments.
            this.labels = c3.select(
                this.label_clips.all.filter(d=> { let node;
                return (this.h((node=this.nodes[this.key(d)]).x2 - node.x1) - zero_pos) >= 50; })
            ).inherit('text', 'restore')
              .options(this.label_options).update()
              .animate((origin === 'redraw') || (origin === 'revalue') || (origin === 'rebase')).position({
                y: this.dy / 2,
                x: d=> {
                    const node = this.nodes[this.key(d)];
                    const left = Math.max(node.x1, this.h.domain()[0]);
                    const right = Math.min(node.x2, this.h.domain()[1]);
                    return this.h( ((right-left)/2) + (left-node.x1) ) - zero_pos;
                }
            });

            // Remove any stale labels from segments that are now too small
            this.segments.all
                .filter(d=> { let node;
                return (this.h((node=this.nodes[this.key(d)]).x2 - node.x1) - zero_pos) < 50; })
                .selectAll('text')
                .transition('fade').duration(this.label_options.duration).style('opacity',0)
                .remove();
        } else {
            this.segments.all.selectAll('text').remove();
            delete this.labels;
        }

        // Style any new elements we added by resizing larger that allowed new relevant elements to be drawn
        if ((origin === 'resize') && (!this.rects.new.empty() || ((this.labels != null) && !this.labels.new.empty()))) {
            return this._style(true);
        }
    }

    _style(style_new){
        super._style(...arguments);
        this.rects.style(style_new);
        return (this.labels != null ? this.labels.style(style_new) : undefined);
    }

    // Navigate to a new root node in the hierarchy representing the `datum` element
    rebase(root_datum){
        this.root_datum = root_datum;
        this.trigger('rebase_start', this.root_datum);
        this.chart.redraw('rebase'); // redraw all layers, since the scales will change
        return this.trigger('rebase', this.root_datum);
    }

    // Navigate to a new root node in the hierarchy represented by `key`
    rebase_key(root_key){ return this.rebase(this.nodes[root_key] != null ? this.nodes[root_key].datum : undefined); }
});
Cls.initClass();


//##################################################################
// XY Plot Sampled Swimlane Layers
//##################################################################

// A {c3.Plot.Layer.Swimlane swimlane layer} that will sample for each pixel in each swimlane.
// @abstract
// @author Douglas Armstrong
Cls = (c3.Plot.Layer.Swimlane.Sampled = class Sampled extends c3.Plot.Layer.Swimlane {
    constructor(...args) {
        this._hover_datum = this._hover_datum.bind(this);
        this._update = this._update.bind(this);
        this._sample = this._sample.bind(this);
        super(...args);
    }

    static initClass() {
        this.version = 0.0;
        this.prototype.type = 'sampled';
    
        // **REQUIRED** [Function] Accessor to get the width of the segment
        this.prototype.dx = null;
        // [Function] Callback to determine if the data element should be rendered or not
        this.prototype.filter = undefined;
        // [Boolean] If safe mode is off then it is assumed the data is sorted by the x-axis
        this.prototype.safe = true;
    }

    _hover_datum(x, swimlane){
        let datum;
        const data = this.swimlane_data[swimlane];
        const right = this.h.invert(this.h(x)+1); // Get the pixel width
        let idx = d3.bisector(this.x).right(data, x) - 1;
        if (idx<0) { return null;
        } else if (x < (this.x(datum=data[idx])+this.dx(datum))) { return datum;
        } else if ((++idx<data.length) && (this.x(datum=data[idx]) <= right)) { return datum;
        } else { return null; }
    }

    _update() {
        let asc, end, start;
        let swimlane;
        super._update(...arguments);
        // Arrange data by swimlane and remove filtered items
        this.swimlane_data = [];
        for (start = this.v.domain()[0], swimlane = start, end = this.v.domain()[1], asc = start <= end; asc ? swimlane < end : swimlane > end; asc ? swimlane++ : swimlane--) { this.swimlane_data[swimlane] = []; }
        const [top_edge, bottom_edge] = Array.from(this.v.domain());
        for (let i = 0; i < this.data.length; i++) {
            var datum = this.data[i];
            if ((this.filter == null) || this.filter(datum,i)) {
                swimlane = this.y(datum, i);
                if (top_edge <= swimlane && swimlane < bottom_edge) { this.swimlane_data[swimlane].push(datum); }
            }
        }

        // Sort data in safe mode
        if (this.safe) {
            return Array.from(this.swimlane_data).map((data) => c3.array.sort_up(data,this.x));
        }
    }

    _sample(sample){
        // Sample data points for each pixel in each swimlane
        const bisector = d3.bisector(this.x).right;
        for (let start = this.v.domain()[0], swimlane = start, end = this.v.domain()[1], asc = start <= end; asc ? swimlane < end : swimlane > end; asc ? swimlane++ : swimlane--) {
            var pixel;
            var v = this.v(swimlane);
            var data = this.swimlane_data[swimlane];
            if (!data.length) { continue; }

            // Optimized to find the left starting point
            var prev_idx = bisector(data, this.h.domain()[0]);
            if (!prev_idx) {
                pixel = Math.round(this.h(this.x(this.data[prev_idx])));
            } else {
                prev_idx--;
                pixel = this.h(this.x(this.data[prev_idx])+this.dx(this.data[prev_idx])) > 0 ? 0 :
                    Math.round(this.h(this.x(data[prev_idx])));
            }

            // Iterate through each pixel in this swimlane
            while (pixel < this.width) {
                var datum;
                var x = this.h.invert(pixel);

                // Find the next data element for this pixel, or skip to the next pixel if there is a gap
                var idx = prev_idx;
                while (idx < data.length) {
                    var datum_x;
                    datum = data[idx];
                    prev_idx = idx;
                    if ((datum_x=this.x(datum)) > x) {
                        pixel = Math.round(this.h(datum_x));
                        break;
                    }
                    if (x <= (datum_x+this.dx(datum))) { break; }
                    idx++;
                }
                if (idx===data.length) { break; }

                sample(pixel, v, datum);
                pixel++;
            }
        }
    }
});
Cls.initClass(); // avoid returning a comprehension


// A {c3.Plot.Layer.Swimlane.Sampled sampled swimlane layer} implemented via SVG lines
// ## Extensibility
// The following {c3.Selection} members are made available if appropriate:
// * **lines** - svg:rect's for each swimlane
// @todo Optimize by generating pixel data array once in _size() and reusing it in _draw()
Cls = (c3.Plot.Layer.Swimlane.Sampled.SVG = class SVG extends c3.Plot.Layer.Swimlane.Sampled {
    constructor(...args) {
        this._draw = this._draw.bind(this);
        this._style = this._style.bind(this);
        super(...args);
    }

    static initClass() {
        this.version = 0.0;
        this.prototype.type = 'svg';
    
        // [{c3.Selection.Options}] Options for the svg:line's in each swimlane
        this.prototype.line_options = undefined;
    }

    _draw(origin){
        super._draw(...arguments);

        // Gather sampled pixels to bind to SVG linex
        const current_data = [];
        const pixels = [];
        this._sample(function(x,y,datum){
            current_data.push(datum);
            return pixels.push({ x, y });});

        // Bind data in _draw without a key because it is based on pixel sampling
        this.lines = c3.select(this.g,'line').options(this.line_options).bind(current_data).update();
        return this.lines.position({
            x1(d,i){ return pixels[i].x + 0.5; }, // Center line on pixels to avoid anti-aliasing
            x2(d,i){ return pixels[i].x + 0.5; },
            y1: (this.y == null) ? 0 : (d, i) => pixels[i].y - 0.5,
            y2: (this.y == null) ? this.height : (d,i)=> (pixels[i].y + this.dy) - 0.5
        });
    }

    _style() {
        super._style(...arguments);
        return this.lines.style();
    }
});
Cls.initClass();


// A {c3.Plot.Layer.Swimlane.Sampled sampled swimlane layer} implemented via HTML5 Canvas
// This layer supports `line_options.styles.stroke` and HTML `hover` "tooltips".
Cls = (c3.Plot.Layer.Swimlane.Sampled.Canvas = class Canvas extends c3.Plot.Layer.Swimlane.Sampled {
    constructor(...args) {
        this._init = this._init.bind(this);
        this._size = this._size.bind(this);
        this.__draw = this.__draw.bind(this);
        this._draw = this._draw.bind(this);
        this._style = this._style.bind(this);
        this.zoom = this.zoom.bind(this);
        super(...args);
    }

    static initClass() {
        this.version = 0.0;
        this.prototype.type = 'canvas';
    
        // [{c3.Selection.Options}] Options for the svg:line's in each swimlane
        this.prototype.line_options = undefined;
    }

    _init() {
        super._init(...arguments);
        const foreignObject = c3.select(this.g,'foreignObject').singleton().position({height:'100%',width:'100%'});
        return this.canvas = foreignObject.select('xhtml|canvas').singleton();
    }
        //@canvas = document.createElement('canvas')
        //@image = c3.select(@g,'svg|image').singleton()

    _size() {
        super._size(...arguments);
        return this.canvas.position({
            height: this.height,
            width: this.width
        });
    }

    __draw() {
        const context = this.canvas.node().getContext('2d');
        context.clearRect(0,0, this.width,this.height);

        // Translate by 0.5 so lines are centered on pixels to avoid anti-aliasing which causes transparency
        context.translate(0.5, 0.5);

        // Sample pixels to render onto canvas
        const stroke = c3.functor(__guard__(this.line_options != null ? this.line_options.styles : undefined, x => x.stroke));
        this._sample((x,y,datum)=> {
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(x, y+this.dy);
            context.strokeStyle = stroke(datum);
            return context.stroke();
        });

        return context.translate(-0.5, -0.5);
    }

        //@image.all.attr('href',@canvas.toDataURL('image/png'))
        //@image.all.node().setAttributeNS('http://www.w3.org/1999/xlink','xlink:href',@canvas.toDataURL('image/png'))

    _draw(origin){ super._draw(...arguments); return this.__draw(origin); }

    _style(style_new){ super._style(...arguments); if (!style_new) { return this.__draw('restyle'); } }

    // For the sampled layer, draw and style are the same.  By default zoom does both, so just do one.
    zoom() { return this.__draw('zoom'); }
});
Cls.initClass();


//###################################################################
//# XY Plot Decimated Layer
//###################################################################
//
//# A decimated layer may be created to assist certain layer types to manage large datasets.
//# When using a decimated layer pass into the constructor an array of the data at different
//# detail granularities as well as a layer object instance that will be used as a "prototype" to
//# construct a different layer for each detail level of data.  This layer will only show one
//# of the levels at a time and will automatically transition between them as the user zooms in and out.
//#
//# _When using a decimated layer, the **data** option does not need to be set for the layer prototype._
//# @example Creating a decimated layer
//#    mychart = new c3.Plot.horiz_zoom {
//#       anchor: '#chart_div'
//#       h: d3.scale.linear().domain [0, 1]
//#       v: d3.scale.linear().domain [0, 100]
//#       x: (d)-> d.x
//#       layers: [
//#           new c3.Layer.decimated mylevels, new c3.Layer.area {
//#               y: (d)-> d.y
//#               interpolate: 'basis'
//#           }
//#       ]
//#    }
//#    mychart.render()
//# @todo Should this be implemented as a mix-in instead?
//# @todo A built-in helper for users to construct decimated groups using CrossFilter
//# @author Douglas Armstrong
//class c3.Plot.Layer.Decimated extends c3.Plot.Layer
//    @version: 0.1
//    type: 'decimated'
//
//    # [Number] The maximum number of data elements to render at a given time when preparing sections for smooth panning.
//    renderport_elements: 8000
//    # [Number] If a decimated element spans more than this number of pixels after zooming then switch to the next level of detail.
//    pixels_per_bucket_limit: 2
//
//    # @param levels [Array] An Array of detail levels.  Each entry in the array should be an array of data elements.
//    # Each level should also add a **granulairty** property which specified how many X domain units are combined into a single element for this level of detail.
//    # @param proto_layer [c3.Plot.Layer] A layer instance to use as a prototype to make layers for each level of detail.
//    constructor: (@levels, @proto_layer)->
//#        @type += ' '+@proto_layer.type
//        for level, i in @levels
//            level.index = i
//            level.renderport = [0,0]
//
//    _init: =>
//        for level, i in @levels
//            level.layer = new @proto_layer.constructor()
//            c3.util.defaults level.layer, @proto_layer
//            level.layer.data = level
//            level.layer.g = @g.append('g').attr('class', 'level _'+i+' layer')
//            level.layer.init @chart
//
//    _size: =>
//        for level in @levels
//            level.layer.size @width, @height
//
//    _update: =>
//        # Invalidate the non-visible levels
//        for level in @levels when level isnt @current_level
//            level.renderport = [0,0]
//        @current_level?.layer.update()
//
//    _draw: =>
//        if not @current_level? then @zoom()
//        else @current_level.layer.draw()
//
//    zoom: =>
//        # Find the optimal decimation level for this viewport
//        view_width = @chart.h.domain()[1] - @chart.h.domain()[0]
//        for level in @levels
//            visible_buckets = view_width / level.granularity
//            if visible_buckets*@pixels_per_bucket_limit > @width
//                new_level = level
//                break
//        if !new_level? then new_level = @levels[@levels.length-1]
//
//        # Did we change decimation levels?
//        if @current_level != new_level
//            @current_level = new_level
//            @g.selectAll('g.level').style('display','none')
//            @g.select('g.level[class~=_'+@current_level.index+']').style('display',null)
//
//        # Determine if current viewport is outside current renderport and we need to redraw
//        if @chart.h.domain()[0] < @current_level.renderport[0] or
//           @chart.h.domain()[1] > @current_level.renderport[1]
//
//            # Limit number of elements to render, centered on the current viewport
//            center = (@chart.h.domain()[0]+@chart.h.domain()[1]) / 2
//            bisector = d3.bisector (d)->d.key
//            center_element = bisector.left @current_level, center
//            element_domain = []
//            element_domain[0] = center_element - @renderport_elements/2 - 1
//            element_domain[1] = center_element + @renderport_elements/2
//            if element_domain[0]<0 then element_domain[0] = 0
//            if element_domain[1]>@current_level.length-1 then element_domain[1] = @current_level.length-1
//
//            @current_level.renderport = (@current_level[i].key for i in element_domain)
//
//            # Swap data for the new renderport and redraw
//            @current_level.layer.data = @current_level[element_domain[0]..element_domain[1]]
//            @current_level.layer.redraw()

function __guardMethod__(obj, methodName, transform) {
  if (typeof obj !== 'undefined' && obj !== null && typeof obj[methodName] === 'function') {
    return transform(obj, methodName);
  } else {
    return undefined;
  }
}
function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}
function __range__(left, right, inclusive) {
  let range = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}