/*
 * decaffeinate suggestions:
 * DS002: Fix invalid constructor
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__, or convert again using --optional-chaining
 * DS104: Avoid inline assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
// C3 Visualization Library
// Polar Charts

//##################################################################
// Polar Chart
//##################################################################

// A chart that uses a polar coordinate system.
// `r` is the radial dimension and `t` is the angular dimension.
// The top is 0 degrees and the range is expressed in radians so a full circle is 0 to 2Pi.
// A polar chart can contain multiple {c3.Polar.Layer layers}.
// @author Douglas Armstrong
let Clsc3polar = (c3.Polar = class Polar extends c3.Chart {
    constructor(...args) {
        super(...args);
        this._init = this._init.bind(this);
        this._size = this._size.bind(this);
        this._update = this._update.bind(this);
        this._draw = this._draw.bind(this);
        this._style = this._style.bind(this);
        this.toPolar = this.toPolar.bind(this);
    }

    static initClass() {
        this.version = 0.1;
        this.prototype.type = 'polar';
        // [Array<{c3.Polar.Layer}>] Array of {c3.Polar.Layer polar layers}
        this.prototype.layers = [];
        // [Array] Default data array for layers in this polar chart.
        // _This can be set for each individual layer or a default for the entire chart._
        this.prototype.data = [];
        // [{https://github.com/mbostock/d3/wiki/Scales d3.scale}] Scale for the _radial_ dimension.
        // Please set the _domain()_, c3 will set the _range()_.
        // _This can be set for each individual layer or a default for the entire chart._
        this.prototype.r = undefined;
        // [{https://github.com/mbostock/d3/wiki/Scales d3.scale}] Scale for the _angular_ dimension.
        // Please set the _domain()_, c3 will set the _range()_.
        // _This can be set for each individual layer or a default for the entire chart._
        this.prototype.t = undefined;
        // [Number] Angular range for the polar chart in radians.  0 is up and the direction is clockwise.
        // Defaults to the entire circle, which is [0, 2Pi].
        // Adjust this range to rotate the chart or use a semi-circle (e.g. [-Math.PI/2, Math.PI/2])
        this.prototype.angular_range = [0, 2*Math.PI];
        // [Boolean] Enable this polar chart to be zoomable with the mouse wheel or touch pinching gesture
        this.prototype.zoomable = false;
        // [Array<number>] Array of minimum and maximum zoom scaling if zoomable is enabled
        this.prototype.zoom_extent = undefined;
        // [{c3.Selection.Options}] Options to apply to each layer.  For callbacks, the first argument
        // is the layer object and the second argument is the index of the layer
        this.prototype.layer_options = undefined;
    }

    _init() {
        // Set the default scales here instead of class-level so the defaults are still per-instance
        if (this.r == null) { this.r = d3.scale.linear(); }
        if (this.t == null) { this.t = d3.scale.linear(); }

        // Setup the Layers
        this.layers_svg = this.content.select('svg.layers',null,true).singleton();
        this.layers_selection = this.layers_svg.select('g.layer')
            .bind(this.layers, layer=> layer.uid)
            .options(this.layer_options, layer => layer.options);
        const self = this;
        this.layers_selection.all.order();
        this.layers_selection.new.each(function(layer){
            layer.trigger('render_start');
            layer.init(self, d3.select(this));
            return layer.trigger('render');
        });

        this.background = this.content.select('rect.background',':first-child').singleton();

        if (this.zoomable) {
            this.radial_domain = this.r.domain()[1] - this.r.domain()[0];
            let prev_scale = 1;
            this.zoomer = d3.behavior.zoom().on('zoom', () => {
                const scale = this.zoomer.scale();
                if (scale !== prev_scale) {
                    let center;
                    this.r.domain([(center=this.r.domain()[0]), center+(this.radial_domain/scale)]);
                    this._draw('zoom');
                }
                return prev_scale = scale;
            });
            if (this.zoom_extent != null) { this.zoomer.scaleExtent(this.zoom_extent); }
            this.zoomer(this.content.all);
            // Disable D3's double-click from zoomin in
            this.content.all.on('dblclick.zoom', null);
            // Disable D3's double-touch from zooming in
            // http://stackoverflow.com/questions/19997351/d3-behavior-zoom-disable-double-tap-behaviour/34999401#34999401
            let last_touch_event = undefined;
            const touchstart = function() {
                if (((d3.event.timeStamp-(last_touch_event != null ? last_touch_event.timeStamp : undefined)) < 500) && (d3.event.touches.length === 1)) {
                    d3.event.stopPropagation();
                    last_touch_event = undefined;
                }
                return last_touch_event = d3.event;
            };
            this.layers_svg.all.on('touchstart.zoom', touchstart);
            return this.background.all.on('touchstart.zoom', touchstart);
        }
    }

    _size() {
        this.content.all.attr('transform', 'translate('+(this.width/2)+','+(this.height/2)+')');
        this.radius = Math.min(this.width,this.height) / 2;
        this.r.range([0, this.radius-1]);
        for (var layer of Array.from(this.layers)) {
            layer.size(this.width, this.height);
            layer.t.clamp(true).range(this.angular_range);
        }
        return this.background.position({
            x: -this.width/2,
            y: -this.height/2,
            width: this.width,
            height: this.height
        });
    }

    _update(origin){
        this.layers_selection.update();
        for (var layer of Array.from(this.layers)) { layer.update(origin); }
        return this;
    }

    _draw(origin){
        for (var layer of Array.from(this.layers)) { layer.draw(origin); }
        return this;
    }

    _style(style_new){
        this.layers_selection.style();
        for (var layer of Array.from(this.layers)) {
            layer.style(style_new);
            if (!layer.rendered) { layer.trigger('rendered'); }
            layer.rendered = true;
        }
        return this;
    }

    // Convert cartesean x,y coordinates to polar coordinates.
    // @param x [Number] x pixel value with 0 in the middle
    // @param y [Number] y pixel value with 0 in the middle
    // @return [Array<Number>] Array of theta in radians and radial distance in pixels
    static toPolar(x, y){
        // Convert coordinate to clockwise polar coordinates based on a flipped y axis with 0rad up
        return [Math.atan(y/x) + ((0.5+(x<0 ? 1 : 0))*Math.PI), Math.sqrt((x*x)+(y*y))];
    }

    // Convert cartesean x,y coordinates to polar coordinates based on this chart's scales.
    // @param x [Number] x pixel value with 0 in the middle
    // @param y [Number] y pixel value with 0 in the middle
    // @return [Array<Number>] Array of theta in this chart's `t` domain and radial distance in this chart's `r` domain.
    toPolar(x, y){
        let [theta, radius] = Array.from(c3.Polar.toPolar(x,y));
        // If user specified angular_range in terms of negative degrees, then we may need to translate.
        if ((theta > this.t.range()[1]) && (this.t.range()[0]<0) && (theta > Math.PI)) { theta -= 2*Math.PI; }
        return [this.t.invert(theta), this.r.invert(radius)];
    }
});
Clsc3polar.initClass();


//##################################################################
// Polar Layer
//##################################################################

// A layer for a {c3.Polar polar chart}.
// @abstract
// @author Douglas Armstrong
Clsc3polar = (c3.Polar.Layer = class Layer extends c3.Dispatch {
    static initClass() {
        this.version = 0.1;
        this.prototype.type = 'layer';
        this._next_uid = 0;
    
        // [Array] Data for this layer  _This can be set for each individual layer or a default for the entire chart._
        this.prototype.data = undefined;
        // [String] User name for this layer.  This is used in legends, for example.
        this.prototype.name = undefined;
        // [String] CSS class to assign to this layer for user style sheets to customize
        this.prototype.class = undefined;
        // [{https://github.com/mbostock/d3/wiki/Scales d3.scale}] Scale for the _radial_ dimension for this layer.
        // Please set the _domain()_, c3 will set the _range()_.
        // _The scale may be set for the entire chart instead of for each layer._
        this.prototype.r = undefined;
        // [{https://github.com/mbostock/d3/wiki/Scales d3.scale}] Scale for the _angular_ dimension for this layer.
        // Please set the _domain()_, c3 will set the _range()_.
        // _The scale may be set for the entire chart instead of for each layer._
        this.prototype.t = undefined;
        // [{c3.Selection.Options}] Options to set the **class**, **classes**, **styles**,
        // **events**, and **title** for this layer.
        this.prototype.options = undefined;
        // [Object] An object to setup event handlers to catch events triggered by this c3 layer.
        // The keys represent event names and the values are the cooresponding handlers.
        this.prototype.handlers = undefined;
    
        this.prototype.restyle = Layer.prototype.style;
    }

    constructor(opt){
        super();
        this.init = this.init.bind(this);
        this.size = this.size.bind(this);
        this.update = this.update.bind(this);
        this.draw = this.draw.bind(this);
        this.style = this.style.bind(this);
        this.redraw = this.redraw.bind(this);
        this.toPolar = this.toPolar.bind(this);
        c3.util.extend(this, opt);
        this.uid = c3.Polar.Layer._next_uid++;
    }

    // Internal function for the Polar Chart to prepare the layer
    init(chart, g){
        this.chart = chart;
        this.g = g;
        if (this.r == null) { this.r = this.chart.r; }
        if (this.t == null) { this.t = this.chart.t; }
        if (this.data == null) { this.data = this.chart.data; }
        if (this.class != null) { this.g.classed(this.class, true); }
        if (this.handlers != null) { for (var event in this.handlers) { var handler = this.handlers[event]; this.on(event, handler); } }
        this.content = c3.select(this.g);

        // Apply classes to layer g nodes based on the `type` of the layer object hierarchy
        let prototype = Object.getPrototypeOf(this);
        while (prototype) {
            if (prototype.type != null) { this.g.classed(prototype.type, true); }
            prototype = Object.getPrototypeOf(prototype);
        }

        return this._init();
    }
    _init() {}

    // Resize the layer, but don't update the rendering.  `resize()` handles both with `draw()`
    size(width, height){
        this.width = width;
        this.height = height;
        this.trigger('resize_start');
        this.radius = this.chart.radius;
        if (this.r !== this.chart.r) { this.r.range([0, this.chart.radius-1]); }
        this._size();
        return this.trigger('resize');
    }
    _size() {}

    // Update the DOM bindings based on the new or modified data set
    update(origin){
        if ((this.chart == null)) { throw Error("Attempt to redraw uninitialized polar layer, please use render() when adding new layers"); }
        return this._update(origin);
    }
    _update() {}

    // Position the DOM elements based on the current scales
    draw(origin){
        this.trigger('redraw_start', origin);
        this._draw(origin);
        return this.trigger('redraw', origin);
    }
    _draw() {}

    // Restyle existing items in the layer
    style(style_new){
        this.trigger('restyle', style_new);
        this._style(style_new);
        this.trigger('restyle', style_new);
        return this;
    }
    _style() {}

    redraw(origin){
        if (origin == null) { origin = 'redraw'; }
        this.update(origin);
        this.draw(origin);
        this.style(true);
        return this;
    }

    // Convert cartesean x,y coordinates to polar coordinates based on this layer's scales.
    // @param x [Number] x pixel value with 0 in the middle
    // @param y [Number] y pixel value with 0 in the middle
    // @return [Array<Number>] Array of theta in this layer's `t` domain and radial distance in this layer's `r` domain.
    toPolar(x, y){
        let [theta, radius] = Array.from(c3.Polar.toPolar(x,y));
        // If user specified angular_range in terms of negative degrees, then we may need to translate.
        if ((theta > this.t.range()[1]) && (this.t.range()[0]<0) && (theta > Math.PI)) { theta -= 2*Math.PI; }
        return [this.t.invert(theta), this.r.invert(radius)];
    }
});
Clsc3polar.initClass();


//##################################################################
// Radial
//##################################################################

// Layer of radial lines
// @todo Add arrowheads or dots at vector ends if requested.
// @todo Add text labels if requested.
// @author Douglas Armstrong
Clsc3polar = (c3.Polar.Layer.Radial = class Radial extends c3.Polar.Layer {
    constructor(...args) {
        super(...args);
        this._draw = this._draw.bind(this);
    }

    static initClass() {
        this.version = 0.1;
        this.prototype.type = 'radial';
    
        // [Function] Accessor function to define a unique key for each data element.
        this.prototype.key = undefined;
        // [Function] Accessor to get the value of the data element used for the vector angle.
        // _Defaults to the identity function._
        this.prototype.value = undefined;
        // [Function] Accessor to determine if data elements are filtered in or not.
        this.prototype.filter = undefined;
        // [Number, Function] Inner radius of the vector
        this.prototype.inner_radius = 0;
        // [Number, Function] Outer radius of the vector.  You may use the numeric value `Infinity`.
        this.prototype.outer_radius = Infinity;
        // [{c3.Selection.Options}] Options for the svg:g of the vector group nodes.
        // There is one node per data element.  Use this option for animating line movement.
        this.prototype.vector_options = undefined;
        // [{c3.Selection.Options}] Options for the svg:line lines.
        this.prototype.line_options = undefined;
    }

    _init() {
        if (this.value == null) { this.value = d => d; }

        if (this.draggable) {
            const self = this;
            let drag_value = undefined;
            this.dragger = d3.behavior.drag();
            this.dragger.on('dragstart', (d,i)=> {
                d3.event.sourceEvent.stopPropagation(); // Prevent extraneous panning events in zoomable charts
                return this.trigger('dragstart', d, i);
            });
            this.dragger.on('drag', function(d,i){
                let depth;
                [drag_value, depth] = Array.from(self.toPolar(d3.event.x, d3.event.y));
                d3.select(this).attr('transform', 'rotate('+(((self.t(drag_value)*180)/Math.PI) - 180)+')');
                return self.trigger('drag', drag_value, d, i);
            });
            return this.dragger.on('dragend', (d,i)=> {
                return this.trigger('dragend', drag_value, d, i);
            });
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

        this.vectors = this.content.select('g.vector').options(this.vector_options).animate(origin === 'redraw')
            .bind(this.current_data, this.key).update();
        return this.lines = this.vectors.inherit('line').options(this.line_options).update();
    }

    _draw(origin){
        let line_position;
        const inner_radius = c3.functor(this.inner_radius);
        const outer_radius = c3.functor(this.outer_radius);

        // Handle 'revalue' and 'rebase' in case this layer shares a chart with a sunburst so we animate properly.
        if (origin !== 'rebase') {
            this.vectors.animate((origin === 'redraw') || (origin === 'revalue')).position({
                transform: (d,i)=> 'rotate('+ ((((this.t(this.value(d,i)))*180)/Math.PI) - 180) + ')'});
        } else {
            this.vectors.animate(true).position_tweens({
                transform: (d,i)=> t=> 'rotate('+ ((((this.t(this.value(d,i)))*180)/Math.PI) - 180) + ')'});
        }

        this.lines.animate((origin === 'redraw') || (origin === 'rebase')).position(line_position = {
            y1: (d,i)=> this.r(inner_radius(d,i)),
            y2: (d,i)=> { let r;
            return this.r((r=outer_radius(d,i)) !== Infinity ? r : window.innerHeight+window.innerWidth); }
        }
        );

        if (this.draggable) {
            this.vectors.new.call(this.dragger);
            // Add extra width for grabbable line area
            return this.grab_lines = this.vectors.inherit('line.grab').animate((origin === 'redraw') || (origin === 'rebase'))
                .position(line_position);
        }
    }

    _style(style_new){
        this.g.classed('draggable', this.draggable);
        this.vectors.style(style_new);
        return this.lines.style(style_new);
    }
});
Clsc3polar.initClass();


//##################################################################
// Arc Segment Layers
//##################################################################

// The root abstract layer for various other layers such as {c3.Polar.Layer.Pie pie} and {c3.Polar.Layer.Sunburst sunburst} charts.
// Do not create a layer of this type directly, instead instantiate one of it's children types.
//
// ## Extensibility
// Each layer creates the following {c3.Selection} members:
// * **arcs** - for svg:path elements for each arc segment
//
// @abstract
// @todo Add text labels for arc segments if requested.
// @author Douglas Armstrong
Clsc3polar = (c3.Polar.Layer.Segment = class Segment extends c3.Polar.Layer {
    constructor(...args) {
        super(...args);
        this._init = this._init.bind(this);
        this._update = this._update.bind(this);
        this._draw = this._draw.bind(this);
        this._style = this._style.bind(this);
        this.get_position_from_key = this.get_position_from_key.bind(this);
    }

    static initClass() {
        this.version = 0.1;
        this.prototype.type = 'segment';
    
        // **REQUIRED** [Function] Accessor function to define a unique key for each data element.
        // _This has performance implications and is required for some layers and **animations**._
        this.prototype.key = undefined;
        // [Function] Accessor to get the value of the data element.
        // Used when limiting the number of elements
        this.prototype.value = undefined;
        // [Number] Limit the number of data elements to render based on their value.
        // _This affects the callback index parameter_
        this.prototype.limit_elements = undefined;
        // [Number, Function] Number or callback to set the angle in radians to pad between arc segments
        this.prototype.pad = undefined;
        // [{c3.Selection.Options}] Options to apply to each arc segment.
        // For callbacks, the first argument is the data element the second argument is the index
        this.prototype.arc_options = undefined;
    }

    _init() {
        if (this.arc_options != null ? this.arc_options.animate : undefined) { if (this.arc_options.animate_old == null) { this.arc_options.animate_old = true; } }

        // Prepare drawing function
        this.arc = d3.svg.arc()
            .innerRadius(d=> Math.max(0, this.r(d.y1)))
            .outerRadius(d=> Math.max(0, this.r(d.y2)))
            .startAngle(d=> this.t(d.x1))
            .endAngle(d=> this.t(d.x2))
            .padAngle(this.pad);

        this.segments = this.content.select('g.segments').singleton();
        return this.nodes = [];
    }

    _update(origin){
        // Layout the nodes for all data.
        // Even if we filter with limit_elements, we need to position everything for
        // relative layouts and animating previous values
        this.current_data = this._layout(this.data, origin);

        // Limit the number of elements to bind to the DOM
        if (this.current_data.length > this.limit_elements) {
            if (this.current_data === this.data) { this.current_data = this.data.slice(); } // Don't sort user's array
            c3.array.sort_up(this.current_data, this.value); // sort_up is more efficient than sort_down
            this.current_data = this.current_data.slice(-this.limit_elements);
        }

        // Bind data elements to arc segments in the DOM
        return this.arcs = this.segments.select('path').options(this.arc_options).animate((origin === 'redraw') || (origin === 'revalue') || (origin === 'rebase'))
            .bind(this.current_data, this.key).update();
    }

    _draw(origin){
        // Prepare to transition to the updated domain for a new root
        let r_interpolation, t_interpolation;
        if (this.tree != null) {
            let left;
            const root_node = (this.root_datum != null) ? this.nodes[this.key(this.root_datum)] : { x1:0, x2:1, y1:-1 };
            // Remember the previous domain in case the last redraw/revalue animation was interrupted.
            // But, don't do this with a rebase in case the user interrupts an ongoing rebase.
            const prev_t_domain = ((left = origin !== 'rebase' ? this.prev_t_domain : undefined)) != null ? left : this.t.domain();
            const new_t_domain = (this.prev_t_domain = [root_node.x1, root_node.x2]);
            const new_r_domain = [root_node.y1, (root_node.y1+this.r.domain()[1])-this.r.domain()[0]];
            t_interpolation = d3.interpolate(prev_t_domain, new_t_domain);
            r_interpolation = d3.interpolate(this.r.domain(), new_r_domain);
            // Set domains now for drawing things like center circle or redrawing other layers immediatly,
            // though arc animation will transition it later if we are animated.
            this.r.domain(new_r_domain);
            this.t.domain(new_t_domain);
        }

        // Animate the positioning of nodes and any transition to a new root
        // TODO optimize this
        this.arcs.animate((origin === 'redraw') || (origin === 'revalue') || (origin === 'rebase')).position_tweens({
            'd': d=> {
                const node = this.nodes[this.key(d)];
                const arc_interpolation = d3.interpolateObject(
                    { x1:node.px1 != null ? node.px1 : node.x1, x2:node.px2 != null ? node.px2 : node.x2, y1:node.py1 != null ? node.py1 : node.y1, y2:node.py2 != null ? node.py2 : node.y2 },
                    node );
                return t=> {
                    if (this.tree != null) {
                        this.t.domain(t_interpolation(t));
                        this.r.domain(r_interpolation(t));
                    }
                    return this.arc(arc_interpolation(t));
                };
            }
        });

        if (origin === 'zoom') { return this.arcs.old.remove(); }
    }

    _style(style_new){
        return this.arcs.style(style_new);
    }

    // Return the calculated position for a data element
    // @param key [Number] The key for a data element to get the position for
    // @return Returns an object with the calculated position:
    // * **x1** - start angle in `t` domain
    // * **x2** - end angle in `t` domain
    // * **y1** - inner radius in `r` domain
    // * **y2** - outer radius in `r` domain
    // * **datum** - reference to the associated datum
    get_position_from_key(key){ return (this.nodes != null ? this.nodes[key] : undefined); }
});
Clsc3polar.initClass();


//##################################################################
// Arc
//##################################################################

// A general-purpose layer of arc segments
// @author Douglas Armstrong
Clsc3polar = (c3.Polar.Layer.Arc = class Arc extends c3.Polar.Layer.Segment {
    constructor(...args) {
        super(...args);
        this._layout = this._layout.bind(this);
    }

    static initClass() {
        this.version = 0.1;
        this.prototype.type = 'arc';
    
        // [Number, Function] Inner radius of the arc segment
        this.prototype.inner_radius = 0;
        // [Number, Function] Outer radius of the arc segment
        this.prototype.outer_radius = 1;
        // [Number, Function] Start angle for the arc segment
        this.prototype.start_angle = 0;
        // [Number, Function] End angle for the arc segment
        this.prototype.end_angle = 2*Math.PI;
    }

    _layout(data){
        const start_angle = c3.functor(this.start_angle);
        const end_angle = c3.functor(this.end_angle);
        const inner_radius = c3.functor(this.inner_radius);
        const outer_radius = c3.functor(this.outer_radius);
        for (let i = 0; i < data.length; i++) {
            var d = data[i];
            var key = this.key(d,i);
            var node = this.nodes[key];
            this.nodes[key] = {
                px1: (node != null ? node.x1 : undefined),
                px2: (node != null ? node.x2 : undefined),
                py1: (node != null ? node.y1 : undefined),
                py2: (node != null ? node.y2 : undefined),
                x1: start_angle(d,i),
                x2: end_angle(d,i),
                y1: inner_radius(d,i),
                y2: outer_radius(d,i)
            };
        }
        return data;
    }
});
Clsc3polar.initClass();


//##################################################################
// Pie Chart
//##################################################################

// A Pie Chart.
// If you limit elements and sort by value then you can defined `other_options` to
// create an arc segment that represents all of the "other" values.
//
// ## Extensibility
// Each layer creates the following {c3.Selection} members:
// * **other_arc** - for svg:path elements for the "other" arc segment.
//
// @author Douglas Armstrong
Clsc3polar = (c3.Polar.Layer.Pie = class Pie extends c3.Polar.Layer.Segment {
    constructor(...args) {
        super(...args);
        this._init = this._init.bind(this);
        this._layout = this._layout.bind(this);
        this._draw = this._draw.bind(this);
        this._style = this._style.bind(this);
    }

    static initClass() {
        this.version = 0.1;
        this.prototype.type = 'pie';
    
        // [Boolean, Function] How to sort the partitioned pie chart segments.
        // `true` sorts based on value, or you can define an alternative accessor function
        // to be used for sorting.  The `other` arc only appears if sort is `true`.
        this.prototype.sort = false;
        // [Number, Function] Inner radius of the arc segment.
        // _This may be called with undefined data for the "other" arc segment._
        // The first argument is the data element the second argument is the index
        this.prototype.inner_radius = 0;
        // [Number, Function] Outer radius of the arc segment.
        // The first argument is the data element the second argument is the index
        // _This may be called with undefined data for the "other" arc segment._
        this.prototype.outer_radius = 1;
        // [{c3.Selection.Options}] Options to apply for an "other" arc segment
        // when limiting data with `limit_elements`
        // For callbacks, the first argument is the data element the second argument is the index
        this.prototype.other_options = undefined;
    }

    _init() {
        super._init(...arguments);
        if ((this.key == null)) { throw Error("key() accessor required for Pie charts"); }
    }

    _layout(data){
        let d;
        const inner_radius = c3.functor(this.inner_radius);
        const outer_radius = c3.functor(this.outer_radius);
        let total = 0;
        for (d of Array.from(data)) { total += this.value(d); }
        let angle = 0;
        const delta = 1 / (total || 1);
        if (this.sort) {
            data = data.slice();
            c3.array.sort_down(data, this.value);
        }
        for (d of Array.from(data)) {
            var key = this.key(d);
            var node = this.nodes[key];
            this.nodes[key] = {
                px1: (node != null ? node.x1 : undefined),
                px2: (node != null ? node.x2 : undefined),
                py1: (node != null ? node.y1 : undefined),
                py2: (node != null ? node.y2 : undefined),
                x1: angle,
                x2: (angle += this.value(d) * delta),
                y1: inner_radius(d),
                y2: outer_radius(d)
            };
        }
        return data;
    }

    _draw(origin){
        super._draw(...arguments);
        if (this.other_options) {
            this.other_arc = this.content.select('path.other').options(this.other_options).animate(origin === 'redraw');
            if ((this.data.length > this.limit_elements) && (this.sort === true)) {
                return this.other_arc.singleton().update().position_tweens({'d': (d,i)=> {
                    const other_node = {
                        x1: this.nodes[this.key(this.current_data[0])].x2,
                        x2: 1,
                        y1: c3.functor(this.inner_radius)(), // Call with undefined data
                        y2: c3.functor(this.outer_radius)()
                    };
                    const interpolate = d3.interpolateObject((this.prev_other_node != null ? this.prev_other_node : other_node), other_node);
                    this.prev_other_node = other_node;
                    return t=> this.arc(interpolate(t));
                }
                });
            } else { return this.other_arc.bind([]); } // Remove other arc with possible binding fade animation
        }
    }

    _style(style_new){
        super._style(...arguments);
        return (this.other_arc != null ? this.other_arc.style(style_new) : undefined);
    }
});
Clsc3polar.initClass();


//##################################################################
// Sunburst
//##################################################################

// A polar layer that is similar to a {c3.Polar.Layer.Pie pie chart} except that you
// can visualize hierarchical tree data.  It is like a polar version of the
// {c3.Plot.Layer.Swimlane.Icicle Icicle} Plot layer.
//
// A `key()` callback is required for this layer.
// Specify a callback for either `parent_key`,
// `children`, or `children_keys` to describe the hierarchy.
// If using `parent_key` or `children_keys` the `data` array shoud include all nodes,
// if using `children` it only should include the root nodes.
// Define either `value()` or `self_value()` to value the nodes in the hierarchy.
//
// For proper animation, or if you care about performance, you can pass the
// parameter `revalue` to `redraw('revalue')` if you are keeping the same dataset
// hierarchy, and only changing the element's values.
// The Sunburst layer can use a more optimized algorithm in this situation.
//
// ## Events
// * **rebase** Called with the datum of a node when it becomes the new root
//   or with `null` if reverting to the top of the hierarchy.
//
// @author Douglas Armstrong
Clsc3polar = (c3.Polar.Layer.Sunburst = class Sunburst extends c3.Polar.Layer.Segment {
    constructor(...args) {
        super(...args);
        this._init = this._init.bind(this);
        this._layout = this._layout.bind(this);
        this.rebase = this.rebase.bind(this);
        this.rebase_key = this.rebase_key.bind(this);
        this._update = this._update.bind(this);
        this._draw = this._draw.bind(this);
        this._style = this._style.bind(this);
        this.get_leaf = this.get_leaf.bind(this);
    }

    static initClass() {
        this.version = 0.1;
        this.prototype.type = 'sunburst';
    
        // [Function] Accessor to get the "_total_" value of the data element.
        // That is the total value of the element itself inclusive of all of it's children's value.
        // You can define either _value_ or _self_value_.
        this.prototype.value = undefined;
        // [Function] The `value` accessor defines the "total" value for an element, that is the value of
        // the element itself plus that of all of its children.  If you know the "self" value of an
        // element without the value of its children, then define this callback accessor instead.
        // The `value` option will then also be defined for you, which you can use to get the total value
        // of an element after the layer has been drawn.
        this.prototype.self_value = undefined;
        // [Boolean, Function] How to sort the partitioned tree segments.
        // `true` sorts based on _total_ value, or you can define an alternative
        // accessor function to be used for sorting.
        this.prototype.sort = false;
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
        // [Number] Don't bother rendering segments whose value is smaller than this
        // percentage of the current domain focus. (1==100%)
        this.prototype.limit_min_percent = 0.001;
        // Data element that represents the root of the hierarchy to render.
        // If this is specified then only this root and its subtree will be rendered
        // When {c3.Polar.Layer.Sunburst#rebase rebase()} is called or a node is clicked on
        // it will animate the transition to a new root node, if animation is enabled.
        this.prototype.root_datum = null;
    }

    _init() {
        super._init(...arguments);
        if ((this.key == null)) { throw Error("key() accessor required for Sunburst layers"); }
        if (this.arc_options == null) { this.arc_options = {}; }
        if (this.arc_options.events == null) { this.arc_options.events = {}; }
        if (this.arc_options.events.click == null) { this.arc_options.events.click = d=> {
            return this.rebase(d !== this.root_datum ? d
            : __guard__(((this.parent_key != null) ? this.nodes[this.parent_key(d)] : this.nodes[this.key(d)].parent), x => x.datum)
            );
        }; }
        this.bullseye = this.content.select('circle.bullseye');
        if (this.bullseye_options == null) { this.bullseye_options = {}; }
        if (this.bullseye_options.events == null) { this.bullseye_options.events = {}; }
        if (this.bullseye_options.events.click == null) { this.bullseye_options.events.click = () => this.rebase(null); }
        if (this.bullseye_options.title == null) { this.bullseye_options.title = "Navigate to root of tree"; }
        return this.center = this.content.select('circle.center').singleton();
    }

    _layout(data, origin){
        // Construct the tree hierarchy
        if ((origin !== 'revalue') && (origin !== 'rebase')) {
            this.tree = new c3.Layout.Tree({
                key: this.key,
                parent_key: this.parent_key, children_keys: this.children_keys, children: this.children,
                value: this.value, self_value: this.self_value
            });
            this.nodes = this.tree.construct(data);
        }

        // Compute the "total value" of each node
        if (origin !== 'rebase') {
            this.value = this.tree.revalue();
        }

        // Partition the arc segments based on the node values
        // We need to do this even for 'rebase' in case we shot-circuited previous paritioning
        return this.tree.layout(
            (origin !== 'revalue') && (origin !== 'rebase') ? this.sort : false,
            this.limit_min_percent,
            this.root_datum
        );
    }

    // Navigate to a new root node in the hierarchy representing the `datum` element
    rebase(root_datum){
        this.root_datum = root_datum;
        this.trigger('rebase_start', this.root_datum);
        this.chart.redraw('rebase'); // redraw all layers since the scales will change
        return this.trigger('rebase', this.root_datum);
    }

    // Navigate to a new root node in the hierarchy represented by `key`
    rebase_key(root_key){ return this.rebase(this.nodes[root_key] != null ? this.nodes[root_key].datum : undefined); }

    _update(origin){
        super._update(...arguments);
        this.center.options(this.center_options).update();
        return this.bullseye.options(this.bullseye_options).animate((origin === 'redraw') || (origin === 'rebase'))
            .bind((this.root_datum != null) ? [this.root_datum] : []).update();
    }

    _draw(origin){
        super._draw(...arguments);
        // Draw the center circle and bullseye
        this.bullseye.animate(origin === 'redraw').position({
            r: Math.max(0, this.r(this.r.domain()[0]+0.5))});
        // Only adjust center circle if resizing, changing the @r scale, or zooming
        if (origin !== 'rebase') {
            return this.center.animate(origin === 'redraw').position({
                r: Math.max(0, this.r((this.root_datum != null) ? this.nodes[this.key(this.root_datum)].y2 : 0))});
        }
    }

    _style(style_new){
        super._style(...arguments);
        this.center.style(style_new);
        return this.bullseye.style(style_new);
    }

    get_leaf(position){ if (this.tree != null) {
        var get_leaf = function(nodes, parent){
            for (var node of Array.from(nodes)) {
                if (node.x1 <= position && position <= node.x2) {
                    if (node.children.length) { return get_leaf(node.children, node); }
                    return node.datum;
                }
            }
            return parent.datum;
        };
        return get_leaf(this.tree.root_nodes);
    } }
});
Clsc3polar.initClass();

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}