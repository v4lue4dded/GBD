/*
 * decaffeinate suggestions:
 * DS002: Fix invalid constructor
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
// c3 Visualization Library
// XY Plots

//##################################################################
// Plot
//##################################################################

// An XY Plot is a chart with an X and a Y axis.  This chart doesn't visualize data directly itself, but
// contains a set of {c3.Plot.Layer layers} on top of each other.
// Layers provide for such charts as bar charts, area graphs, scatter plots, segment stripcharts, etc.
// The data, scales, and x/y accessors are all required, but may be provided either to the plot itself as a
// default for all layers or individually as an override on each layer or some combination.
//
// ## Styling
// * An svg:rect.background is created for styling the background of the plot content
//
// ## Extensibility
// c3 will set the following members of the `content` selection:
// * **width** - width of the content of the plot layers
// * **height** - height of the content of the plot layers
//
// @author Douglas Armstrong
// @todo Avoid negative plot height/width's when div is too small to fit margins and axes.
let Cls = (c3.Plot = class Plot extends c3.Chart {
    constructor(...args) {
        this._init = this._init.bind(this);
        this._size = this._size.bind(this);
        this._update = this._update.bind(this);
        this._draw = this._draw.bind(this);
        this._style = this._style.bind(this);
        this.scale = this.scale.bind(this);
        this.rescale = this.rescale.bind(this);
        this.min_x = this.min_x.bind(this);
        this.max_x = this.max_x.bind(this);
        this.min_y = this.min_y.bind(this);
        this.max_y = this.max_y.bind(this);
        super(...args);
    }

    static initClass() {
        this.version = 0.1;
        this.prototype.type = 'plot';
        // [Array<{c3.Plot.Layer}>] Array of {c3.Plot.Layer layers} that constitute this XY Plot
        this.prototype.layers = [];
        // [Array<{c3.Axis}>] Array of {c3.Axis axis} objects to attach to this plot.
        this.prototype.axes = [];
        // [Array] Default data array for layers in this plot.
        // _This can be set for each individual layer or a default for the entire chart._
        this.prototype.data = [];
        // [{https://github.com/mbostock/d3/wiki/Scales d3.scale}] Scale for the _horizontal_ X axis.
        // Please set the _domain()_, c3 will set the _range()_.
        // _This can be set for each individual layer or a default for the entire chart._
        this.prototype.h = undefined;
        // [{https://github.com/mbostock/d3/wiki/Scales d3.scale}] Scale for the _vertical_ Y axis.
        // Please set the _domain()_, c3 will set the _range()_.
        // _This can be set for each individual layer or a default for the entire chart._
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
        this.prototype.h_orient = 'left';
        // [String] `top` for 0 to be at the top, `bottom` for the bottom.
        this.prototype.v_orient = 'bottom';
        // [Function | Array<Number|String]] Automatic scaling for horizontal domain.  _EXPERIMENTAL_
        // Optional domain which is used to set the `h` scale at render time or with `rescale()`.
        // It may be a callback to allow for dynamic domains.
        // Either min or max values may also be a enum to automatically size the domain:
        // * `auto` will map to `min_y()` or `max_y()`.
        // * `auto10` will map to `min_y()` or `max_y()` with a 10% buffer.
        this.prototype.h_domain = undefined;
        // [Function | Array<Number|String]] Automatic scaling for vertical domain.  _EXPERIMENTAL_
        // Optional domain which is used to set the `v` scale at render time or with `rescale()`.
        // It may be a callback to allow for dynamic domains.
        // Either min or max values may also be a enum to automatically size the domain:
        // * `auto` will map to `min_y()` or `max_y()`.
        // * `auto10` will map to `min_y()` or `max_y()` with a 10% buffer.
        this.prototype.v_domain = undefined;
        // [Number, Object] Set margins around the plot in pixels.
        // Can either be a number to set all margins or an object to individually set the _top_, _bottom_, _left_, and _right_ margins.
        this.prototype.margins = undefined;
        // [Boolean] Crop the plot rendering at the edge of the plot so it doesn't overlap the axis and margins.
        // Set to true or false to enable/disable, or set to '`x`' or '`y`' to only crop in one direction.
        this.prototype.crop_margins = true;
        // [{c3.Selection.Options}] Options to apply to each layer.  For callbacks, the first argument
        // is the layer object and the second argument is the index of the layer
        this.prototype.layer_options = undefined;
        // [{c3.Selection.Options}] Options to apply to each axis.  For callbacks, the first argument
        // is the axis object and the second argument is the index of the axis
        this.prototype.axis_options = undefined;
    }

    _init() {
        // Set default scales here instead of class-level so the defaults are still per-instance
        let self;
        if (this.h == null) { this.h = d3.scale.linear(); }
        if (this.v == null) { this.v = d3.scale.linear(); }

        // Setup any Axes
        if (this.axes) {
            const axes_group = this.svg.select('g.axes',':first-child').singleton();
            this.axes_selection = axes_group.select('g.axis',null,true).options(this.axis_options).bind(this.axes, axis => axis.uid);
            self = this;
            this.axes_selection.new.each(function(axis){
                axis.anchor = this;
                if (axis.scale == null) { axis.scale = axis instanceof c3.Axis.X ? self.h : self.v; }
                return axis.init();
            });
        }

        // Setup the Layers
        this.layers_svg = this.content.select('svg.layers',null,true).singleton();
        this.layers_selection = this.layers_svg.select('g.layer')
            .bind(this.layers, layer => layer.uid)
            .options(this.layer_options, layer => layer.options);
        self = this;
        this.layers_selection.all.order();
        this.layers_selection.new.each(function(layer){ return layer.init(self, d3.select(this)); });

        // Check if we were rendered to allow render() to be used to add/remove layers and axes.
        if (!this.rendered) {
            // Setup the margins
            if (this.margins == null) { this.margins = {}; }
            if (typeof this.margins === 'number') { this.margins = { top:this.margins, bottom:this.margins, left:this.margins, right:this.margins };
            } else { c3.util.defaults(this.margins, { top:0, bottom:0, left:0, right:0 }); }
            if (this.axes != null) { for (var axis of Array.from(this.axes)) {
                this.margins[axis.orient] += axis.axis_size;
            } }

            // A background rect for styling the background or setting up events for just the content area.
            this.background = this.content.select('rect.background',':first-child').singleton()
              .options({
                styles: {visibility: 'hidden', 'pointer-events': 'all'}
              }).style();
        }
    }

    _size() {
        this.content.height = this.height - this.margins.top - this.margins.bottom;
        this.content.width = this.width - this.margins.left - this.margins.right;
        if (this.content.height <= 0) { this.content.height = 1; }
        if (this.content.width <= 0) { this.content.width = 1; }
        this.layers_svg.all.attr('height',this.content.height).attr('width',this.content.width);
        if (this.crop_margins != null) { switch (this.crop_margins) {
            case true: this.layers_svg.all.style('overflow', 'hidden'); break;
            case false: this.layers_svg.all.style('overflow', 'visible'); break;
            case 'x': this.layers_svg.all.style({ 'overflow-x':'hidden', 'overflow-y':'visible' }); break;
            case 'y': this.layers_svg.all.style({ 'overflow-x':'visible', 'overflow-y':'hidden' }); break;
        } }
        for (var layer of Array.from(this.layers)) {
            layer.size(this.content.width, this.content.height);
        }
        if (this.margins.left || this.margins.top) { this.content.all.attr('transform', `translate(${this.margins.left},${this.margins.top})`); }
        if (this.axes) {
            for (var axis of Array.from(this.axes)) {
                axis.height = this.content.height;
                axis.width = this.content.width;
                axis._size();
                axis.content.all.attr('transform', (() => { switch (axis.orient) {
                    case 'left': return `translate(${this.margins.left},${this.margins.top})`;
                    case 'right': return `translate(${this.width-this.margins.right},${this.margins.top})`;
                    case 'top': return `translate(${this.margins.left},${this.margins.top})`;
                    case 'bottom': return `translate(${this.margins.left},${this.height-this.margins.bottom})`;
                } })()
                );
            }
        }
        this.background.all.attr('width',this.content.width).attr('height',this.content.height);
    }

    _update(origin){
        this.axes_selection.update();
        this.layers_selection.update();
        for (var layer of Array.from(this.layers)) { layer.update(origin); }
        if (!this.rendered) { this.scale('render'); }  // EXPERIMENTAL
    }

    _draw(origin){
        for (var layer of Array.from(this.layers)) { layer.draw(origin); }
        if (this.axes) { for (var axis of Array.from(this.axes)) { axis.draw(); } }
    }

    _style(style_new){
        this.axes_selection.style();
        this.layers_selection.style();

        for (var layer of Array.from(this.layers)) {
            layer.style(style_new);
            layer.rendered = true;
        }
    }

    // EXPERIMENTAL RESCALE
    // Update any automatic scales
    // @note Needs to happen after update() so that stacked layers are computed
    // @return [Boolean] Returns true if any domains were changed
    scale(origin){
        let refresh = false;
        if (this.h_domain != null) {
            const h_domain = typeof this.h_domain === 'function' ? this.h_domain.call(this) : this.h_domain.slice();
            if (h_domain[0] === 'auto') { h_domain[0] = this.min_x(true); }
            if (h_domain[0] === 'auto10') { h_domain[0] = this.min_x(true) * 0.9; }
            if (h_domain[1] === 'auto') { h_domain[1] = this.max_x(true); }
            if (h_domain[1] === 'auto10') { h_domain[1] = this.max_x(true) * 1.1; }
            if ((h_domain[0]!==this.h.domain()[0]) || (h_domain[1]!==this.h.domain()[1])) {
                this.h.domain(h_domain);
                if (this.orig_h != null) {
                    this.orig_h.domain(h_domain);
                } // TODO Ugly hack; need to cleanup zoom as a mixin
                refresh = true;
            }
        }
        if (this.v_domain != null) {
            const v_domain = typeof this.v_domain === 'function' ? this.v_domain.call(this) : this.v_domain.slice();
            if (v_domain[0] === 'auto') { v_domain[0] = this.min_y(true); }
            if (v_domain[0] === 'auto10') { v_domain[0] = this.min_y(true) * 0.9; }
            if (v_domain[1] === 'auto') { v_domain[1] = this.max_y(true); }
            if (v_domain[1] === 'auto10') { v_domain[1] = this.max_y(true) * 1.1; }
            if ((v_domain[0]!==this.v.domain()[0]) || (v_domain[1]!==this.v.domain()[1])) {
                this.v.domain(v_domain);
                refresh = true;
            }
        }
        for (var layer of Array.from(this.layers)) {
            refresh = layer.scale() || refresh;
        }
        return refresh;
    }

    // EXPERIMENTAL RESCALE
    // An additional `re*` API which will adjust the scales for any domains with callbacks
    // See `h_domain` and `v_domain`.
    rescale() {
        if (this.scale()) { this.draw('rescale'); }
        return this;
    }

    // If the auto parameter is true it will only get the value for layers which
    // share the overall plot scale and don't overwrite it with its own.
    min_x(auto) {
      let l;
      return d3.min((auto ? ((() => {
          const result = [];
          for (l of Array.from(this.layers)) {               if (l.h === this.h) {
                  result.push(l);
              }
          }
          return result;
      })()) : this.layers), l => l.min_x());
  }
    max_x(auto) {
      let l;
      return d3.max((auto ? ((() => {
          const result = [];
          for (l of Array.from(this.layers)) {               if (l.h === this.h) {
                  result.push(l);
              }
          }
          return result;
      })()) : this.layers), l => l.max_x());
  }
    min_y(auto) {
      let l;
      return d3.min((auto ? ((() => {
          const result = [];
          for (l of Array.from(this.layers)) {               if (l.v === this.v) {
                  result.push(l);
              }
          }
          return result;
      })()) : this.layers), l => l.min_y());
  }
    max_y(auto) {
      let l;
      return d3.max((auto ? ((() => {
          const result = [];
          for (l of Array.from(this.layers)) {               if (l.v === this.v) {
                  result.push(l);
              }
          }
          return result;
      })()) : this.layers), l => l.max_y());
  }
});
Cls.initClass();


//##################################################################
// Selectable Plot
//##################################################################

// A type of {c3.Plot plot} that allows making selections.
// ## External Interface
// In addition to the standard {c3.base c3 interface}, this chart adds:
// * **{c3.Plot.Selectable#select select()}** - Selection a region in the chart as if the user made one.  This will not fire the `select` events to avoid infinite loops.
//
// ## Events
// * **select** - Triggered when a selection is started and being dragged.  Passed with the current selection domain.
// * **selectend** - Triggered when a selection is made.  Passed with the selected domain.
// @author Douglas Armstrong
// @todo Allow user to set events on their layers by moving brush to back?
Cls = (c3.Plot.Selectable = class Selectable extends c3.Plot {
    constructor(...args) {
        this._init = this._init.bind(this);
        this._size = this._size.bind(this);
        this.select = this.select.bind(this);
        super(...args);
    }

    static initClass() {
        this.version = 0.1;
        this.prototype.type = 'selectable';
        // [Boolean, String] Specify if plot is selectable in the `h` or `v` direction or both.
        this.prototype.selectable = 'hv';
        // [Boolean] When true, existing selections move/resize when dragged, otherwise a new selection will be made.
        this.prototype.drag_selections = true;
        // [Array<Number>] Specify an initialy selected range for rendering.
        // This is updated if the user selects a range or calls {c3.Plot.Selectable#select select()}.
        this.prototype.selection = undefined;
    }

    _init() {
        super._init(...arguments);
        if (this.selectable === true) { this.selectable = 'hv';
        } else if (this.selectable === false) { this.selectable = ''; }
        return this.svg.all
            .classed('h', Array.from(this.selectable).includes('h'))
            .classed('v', Array.from(this.selectable).includes('v'));
    }

    _size() {
        super._size(...arguments);
        // Install brush for selections
        if ((this.brush == null)) {
            this.brush = d3.svg.brush();
            if (Array.from(this.selectable).includes('h')) { this.brush.x(this.h); }
            if (Array.from(this.selectable).includes('v')) { this.brush.y(this.v); }

            // Setup handlers
            this.brush.on('brush', () => {
                const extent = !this.brush.empty() ? this.brush.extent() : null;
                // Skip redundant 'brush' events with null for both mousedown and mouseup when deselecting
                if (extent !== this.prev_extent) {
                    this.select(extent);
                    this.trigger('select', extent);
                }
                return this.prev_extent = extent;
            });
            this.brush.on('brushend', () => {
                const extent = !this.brush.empty() ? this.brush.extent() : null;
                this.select(extent);
                return this.trigger('selectend', extent);
            });

            // Draw brush
            this.brush_selection = this.content.select('g.brush').singleton();
            this.brush(this.brush_selection.all);

            // Create unbrush
            if (Array.from(this.selectable).includes('v')) {
                this.brush_selection.select('rect.n',':first-child').singleton()
                    .all.classed('unbrush',true).attr('y',0);
                this.brush_selection.select('rect.s',':first-child').singleton()
                    .all.classed('unbrush',true);
                this.brush_selection.all.selectAll('g.brush > rect').attr('width',this.content.width);
                if (!Array.from(this.selectable).includes('h')) {
                    this.brush_selection.all.selectAll('g.resize > rect').attr('width',this.content.width);
                }
            }

            if (Array.from(this.selectable).includes('h')) {
                this.brush_selection.select('rect.w',':first-child').singleton()
                    .all.classed('unbrush',true).attr('x',0);
                this.brush_selection.select('rect.e',':first-child').singleton()
                    .all.classed('unbrush',true);
                this.brush_selection.all.selectAll('g.brush > rect').attr('height',this.content.height);
                if (!Array.from(this.selectable).includes('v')) {
                    this.brush_selection.all.selectAll('g.resize > rect').attr('height',this.content.height);
                }
            }

            // Ensure D3's brush background stays behind extent, sometimes when
            // rendering a plot over an existing DOM it would get out of order.
            const extent_node = this.brush_selection.select('rect.extent').node();
            this.brush_selection.select('rect.background').all.each(function() {
                return this.parentNode.insertBefore(this, extent_node);
            });
        }

        // Move existing selection or start a new one
        this.brush_selection.all.selectAll('rect.extent, g.resize')
            .style('pointer-events', !this.drag_selections ? 'none' : '');

        return this.select(this.selection);
    }

    // Select a region in the chart.
    // @param selection [Array<Number>, Array<Array<Number>>] The extent of the region to select or null to clear selection.
    // Depending on which axes are selectable the selection is either [x0,x1], [y0,y1], or [[x0,y0],[x1,y1]]
    select(selection){
        // Set and redraw brush
        let h_selection, v_selection;
        this.selection = selection;
        if ((this.selection != null) && this.selection.length) {
            h_selection = Array.from(this.selectable).includes('v') ? [this.selection[0][0],this.selection[1][0]] : this.selection;
            v_selection = Array.from(this.selectable).includes('h') ? [this.selection[0][1],this.selection[1][1]] : this.selection;
            this.brush.extent(this.selection);
        } else {
            h_selection = this.h.domain();
            v_selection = this.v.domain();
            this.brush.extent(Array.from(this.selectable).includes('h') && Array.from(this.selectable).includes('v') ? [[0,0],[0,0]] : [0,0]);
        }
        this.brush(this.brush_selection.all);

        // Redraw unbrush
        // Use Math.abs to avoid small negative values through rounding errors
        if (Array.from(this.selectable).includes('h')) {
            this.brush_selection.all.select('.unbrush[class~=w]').attr('width',this.h(h_selection[0]));
            this.brush_selection.all.select('.unbrush[class~=e]')
                .attr('width',Math.abs(this.h(this.h.domain()[1])-this.h(h_selection[1]))).attr('x',this.h(h_selection[1]));
        }
        if (Array.from(this.selectable).includes('v')) {
            this.brush_selection.all.select('.unbrush[class~=n]').attr('height',this.v(v_selection[1]));
            this.brush_selection.all.select('.unbrush[class~=s]')
                .attr('height',Math.abs(this.v(this.v.domain()[0])-this.v(v_selection[0]))).attr('y',this.v(v_selection[0]));
            if (Array.from(this.selectable).includes('h')) {
                this.brush_selection.all.selectAll('.unbrush[class~=n], .unbrush[class~=s]')
                    .attr('x',this.h(h_selection[0])).attr('width',this.h(h_selection[1])-this.h(h_selection[0]));
            }
        }

        return delete this.prev_extent;
    }
});
Cls.initClass(); // If user adjusts selection then clear @prev_extent so we don't skip the next brush event


//##################################################################
// Zoomable Plot
//##################################################################

// A type of {c3.Plot plot} that allows panning and zooming.
//
// You cannot currently zoom with an ordinal scale.
// ## External Interface
// In addition to the standard {c3.base c3 interface}, this chart adds:
// * **{c3.Plot.Zoomable#focus focus()}** - Zoom the chart to the specified domain.  Will not fire zoom events.
//
// ## Events
// * **zoom** - Triggered when the user starts to zoom or pan.  Passed with the current focus domain.
// * **zoomend** - Triggered when the user finishes zooming or panning.  Passed with the focus domain.
//
// ## Extensibility
// The _h_ scale will adjust it's domain based on the current focus of the chart.  The original domain can be retreived using the _orig_h_ scale.
// @author Douglas Armstrong
// @todo Normalize zoom functionality better (horiz and vert) (for both plot and axis, maybe chart)
// @todo Support zooming with layers or axes that don't share the chart's horizontal scale
Cls = (c3.Plot.Zoomable = class Zoomable extends c3.Plot {
    constructor(...args) {
        this._init = this._init.bind(this);
        this._size = this._size.bind(this);
        this.focus = this.focus.bind(this);
        this.pan = this.pan.bind(this);
        this._draw = this._draw.bind(this);
        super(...args);
    }

    static initClass() {
        this.version = 0.0;
        this.prototype.type = 'zoomable';
        // [Number] A ratio threshold.  If the focus domain is within this threshold near both edges, then the chart will snap to the full domain.
        this.prototype.snap_to_all = 0.01;
        // [Number, String] The maximum zoom factor the user is allowed to zoom in
        // If set to _integer_ then allow zooming only until pixels are integer values.
        this.prototype.zoom_extent = undefined;
        // [String] Enables vertical panning. Horizontal panning is controlled by the zoomer. Values are either 'h' or 'hv'. 'h' is the default. At the moment this only works reliably on the Flamechart
        this.prototype.pannable = 'h';
    }

    _init() { if (this.rendered) { return super._init(...arguments); } else {
        super._init(...arguments);
        if (this.zoomable !== 'h') { throw "Only horizontal zooming is currently supported"; }
        if ((this.pannable !== 'hv') && (this.pannable !== 'h')) { throw "Pannable options are either 'h' or 'hv'."; }
        this.orig_h = this.h.copy();
        this.orig_v = this.v.copy();

        // Make it zoomable!
        this.zoomer = d3.behavior.zoom().on('zoom', () => {
            return this.trigger('zoom', this.focus(this.h.domain()));
        });
        // Only signal zoomend if the domain has actually changed
        this.prev_zoomend_domain = this.h.domain().slice();
        this.zoomer.on('zoomend', () => { if ((this.h.domain()[0]!==(this.prev_zoomend_domain != null ? this.prev_zoomend_domain[0] : undefined)) || (this.h.domain()[1]!==(this.prev_zoomend_domain != null ? this.prev_zoomend_domain[1] : undefined))) {
            this.trigger('zoomend', this.h.domain());
            return this.prev_zoomend_domain = this.h.domain().slice();
        } });

        // Make it pannable
        if (this.pannable==='hv') {
            this.prev_v_translate = 0;
            this.dragger = d3.behavior.drag();
            this.dragger.on('drag', () => {
                return this.trigger('verticalPan', this.pan(d3.event.dy));
            });
            this.content.all.call(this.dragger);
        }

        // Only zoom over g.content; if we cover the entire SVG, then axes cause zoom to be uncentered.
        this.zoomer(this.content.all);
        // Disable D3's double-click from zooming in
        this.content.all.on('dblclick.zoom', null);
        // Disable D3's double-touch from zooming in (http://stackoverflow.com/questions/19997351/d3-behavior-zoom-disable-double-tap-behaviour/34999401#34999401)
        let last_touch_event = undefined;
        const touchstart = function() {
            if (last_touch_event && (d3.event.touches.length === 1) &&
             ((d3.event.timeStamp - last_touch_event.timeStamp) < 500) &&
             (Math.abs(d3.event.touches[0].screenX-last_touch_event.touches[0].screenX)<10) &&
             (Math.abs(d3.event.touches[0].screenY-last_touch_event.touches[0].screenY)<10)) {
                d3.event.stopPropagation();
                last_touch_event = undefined;
            }
            return last_touch_event = d3.event;
        };
        this.layers_svg.all.on('touchstart.zoom', touchstart);
        this.background.all.on('touchstart.zoom', touchstart);

        // Set grabbing cursor while panning
        this.content.all
            .on('mousedown.zoomable', () => d3.select('html').classed('grabbing', true))
            .on('mouseup.zoomable', () => d3.select('html').classed('grabbing', false));
        return window.addEventListener('mouseup', () => d3.select('html').classed('grabbing', false));
    } }

    _size() {
        super._size(...arguments);
        c3.d3.set_range(this.orig_h, this.h_orient === 'left' ? [0, this.content.width] : [this.content.width, 0]);
        c3.d3.set_range(this.orig_v, this.v_orient === 'top' ? [this.content.height, 0] : [0, this.content.height]);
        // Update the zooming state for the new size
        const current_extent = this.h.domain();
        this.h.domain(this.orig_h.domain());
        this.zoomer.x(this.h);
        if (this.zoom_extent != null) { // Limit the maximum you can zoom in
            if (this.zoom_extent === 'integer') { this.zoomer.scaleExtent([1, 1/ (this.content.width/this.orig_h.domain()[1])]);
            } else { this.zoomer.scaleExtent([1, this.zoom_extent]); }
        } else { this.zoomer.scaleExtent([1, Infinity]); }
        // Make sure the zoomer has the scale/translate set for the current zooming domain after a resize
        return this.focus(current_extent);
    }

    // Zoom to a specified focus domain, but only if the domain actually changes
    // @param extent [Array<Number>] The domain to set the focus to.
    focus(extent){ if (this.rendered) {
        let left, left1;
        if ((extent == null) || !extent.length) { extent = this.orig_h.domain(); }
        extent = extent.slice(); // Clone array so it doesn't modify caller's values
        const domain = this.orig_h.domain();
        const domain_width = domain[1]-domain[0];

        // If the user is operating with a time scale, then convert to ms for manipulations
        extent[0] = (left = (typeof extent[0].getTime === 'function' ? extent[0].getTime() : undefined)) != null ? left : extent[0];
        extent[1] = (left1 = (typeof extent[1].getTime === 'function' ? extent[1].getTime() : undefined)) != null ? left1 : extent[1];

        // Don't allow the focus to go beyond the chart's domain
        if (extent[0]<domain[0]) { extent[1]+=domain[0]-extent[0]; extent[0]=domain[0]; }
        if (extent[1]>domain[1]) { extent[0]-=extent[1]-domain[1]; extent[1]=domain[1]; }
        if (extent[0]<domain[0]) { extent[0]=domain[0]; extent[1]=domain[1]; } // focus extents were too large

        // If we are close to the edges, then snap to zoom all (this helps deal with rounding errors)
        if (((extent[0]-domain[0])<(domain_width*this.snap_to_all)) && ((domain[1]-extent[1])<(domain_width*this.snap_to_all))) {
            extent[0] = domain[0];
            extent[1] = domain[1];
        }

        // Calculate the scale and translate factors based on our tweaked extent.
        const scale = (domain_width) / (extent[1]-extent[0]);
        const translate = (domain[0]-extent[0]) * scale * (this.content.width/domain_width);

        // Update the state of the zoomer to match any adjustments we made or to reflect a new resize()
        // This also updates the h scale which non-scaled layers can use for positioning
        this.zoomer.translate([translate,0]).scale(scale);

        // Transform scaled layers
        this.layers_svg.all.selectAll('.scaled').attr('transform','translate('+translate+' 0)scale('+scale+' 1)');

        // Perform redraws and updates for the new focus, but only if the domain actually changed
        const new_domain = this.h.domain().slice();
        if (this.prev_domain == null) { this.prev_domain = domain; }
        const threshold = (new_domain[1]-new_domain[0]) / 1000000;   // Deal with rounding errors
        const left_diff = (Math.abs(new_domain[0]-this.prev_domain[0]) / threshold) > 1;
        const right_diff = (Math.abs(new_domain[1]-this.prev_domain[1]) / threshold) > 1;
        if (left_diff || right_diff) {

            // Zoom all of the layers
            for (var layer of Array.from(this.layers)) {
                if (layer.rendered) { if (typeof layer.zoom === 'function') {
                    layer.zoom();
                } }
            }

            // Scale any attached axes and redraw
            if (this.axes) { for (var axis of Array.from(this.axes)) {
                if (axis.scale && axis instanceof c3.Axis.X) {
                    axis.scale.domain(new_domain);
                    axis._draw();
                }
            } }

            this.prev_domain = new_domain;
            this.trigger('redraw', 'focus');
            this.trigger('restyle', true);
        }
        if ((domain[0]===extent[0]) && (domain[1]===extent[1])) { return null; } else { return new_domain; }
    } }

     // Note: dx (horizontal panning) is controlled by the zoomer
    pan(dy) {
        const orig_v_domain_min = this.orig_v.domain()[0];
        const orig_v_domain_max = this.orig_v.domain()[1];
        const v = ((this.orig_v.invert(dy)) + this.prev_v_translate) - (this.v_orient === 'top' ? orig_v_domain_max : 0);
        const translate = v > orig_v_domain_max ? orig_v_domain_max : v < orig_v_domain_min ? orig_v_domain_min : v;
        this.v.domain([translate, translate+orig_v_domain_max]);
        this.prev_v_translate = translate;
        // Pan all of the layers
        for (var layer of Array.from(this.layers)) {
            if (layer.rendered) { if (typeof layer.pan === 'function') {
                layer.pan();
            } }
        }
        return this.v(translate);
    }

    _draw(origin){
        super._draw(...arguments);
        // A bit of a hack until we clean up zooming to a widget.
        // If we render a chart that adds a layer but is already zoomed in, then we need
        // to call focus again to force the newly drawn elements to get transformed.
        if ((origin === 'render') && this.rendered) {
            this.prev_domain = [0,0];
            return this.focus(this.h.domain());
        }
    }
});
Cls.initClass();


//##################################################################
// Axis
//##################################################################

// An Axis visualizes a set of tick marks and units based on the supplied **D3 scale**.
// This is an **abstract** class, please create a {c3.Axis.x} or {c3.Axis.y}.
//
// Axes may be attached to {c3.Plot XY Plots} or managed as a
// seperate DOM element for layout flexibility.
// @abstract
// @author Douglas Armstrong
// @todo Normalize the zoom/pan implementation from {c3.Plot.Zoomable}
// @todo Ability to specify tick counts for ordinal scales?
// @todo Remove dependency on d3.axis for more flexibility, cleaner implementation, and performance?
Cls = (c3.Axis = class Axis extends c3.Chart {
    static initClass() {
        this.version = 0.1;
        this.prototype.type = 'axis';
    
        // [{https://github.com/mbostock/d3/wiki/Scales d3.scale}, Boolean] Scale where the _domain()_ specifies the units to display in the axis.
        // _c3 will automatically set the range()_.
        // _If this axis is part of a {c3.Plot plot}, then the scale will default to the plot's horizontal or veritcal scale_.
        // Set to false to disable the scale from being drawn.
        this.prototype.scale = undefined;
        // [String] Axis orientation.  Use _bottom_ or _top_ for an X axis and _left_ or _right_ for a Y axis.
        this.prototype.orient = undefined;
        // [Boolean] Set to true to draw grid lines as well as the axis
        this.prototype.grid = false;
        // [String] Text label for this axis
        this.prototype.label = undefined;
        // [Boolean] Enable tick marks and labels
        this.prototype.ticks = true;
        // [Boolean, Function] Formater function for the tick label.  _Set to `true` for displaying the default tick values._
        // _See {https://github.com/mbostock/d3/wiki/Formatting#d3_format d3.format}_.
        this.prototype.tick_label = true;
        // [Array] An array of manually set tick values to use instead of the scale's automatic tick generation.
        this.prototype.tick_values = undefined;
        // [Number] Specify number of ticks to generate
        this.prototype.tick_count = undefined;
        // [Number] Size of the tick marks in pixels
        this.prototype.tick_size = 6;
        // [Number] Width of the path that forms a line along the length of the axis
        this.prototype.path_size = 2;
        // [Number] The overall width of a horizontal axis or height of a vertical axis
        this.prototype.axis_size = undefined;
    }

    constructor(opt){
        this._init = this._init.bind(this);
        this._draw = this._draw.bind(this);
        super(...arguments);
    }

    _init() {
        if (this.scale == null) { this.scale = d3.scale.linear(); }
        this.content.all.classed('axis', true);
        this.content.all.classed(this.orient, true);
        return this.axis = d3.svg.axis().orient(this.orient);
    }

    _draw() {
        // Set these axis properties here so they can be modified between calls to redraw()
        if (this.scale) {
            this.axis
                .scale(this.scale)
                .outerTickSize(this.path_size)
                .innerTickSize(this.ticks ? this.tick_size : 0)
                .tickValues(this.tick_values)
                .tickFormat((() => {
                if (!this.ticks) { return ""; } else { switch (this.tick_label) {
                    case false: return ""; // Disable tick labels
                    case true: return null; // Use default formatter
                    default: return this.tick_label;
                }
            }
            
            })()); // Custom formatter
            if (this.tick_count != null) { this.axis.ticks(this.tick_count); }
            this.content.all.call(this.axis);
        }

        // Draw axis label if requested
        if (this.label) {
            this.text_label = this.content.all.selectAll('text.label').data([this.label]);
            this.text_label.enter().append('text').attr('class','label');
            this.text_label.text(this.label)
                .text(this.label);
        }

        // Draw gridlines if requested
        if (this.grid) {
            this.content.all.selectAll('g.tick line.grid').remove();
            return this.content.all.selectAll('g.tick').append('line')
                .classed('grid', true)
                .attr('x2', (() => { switch (this.orient) {
                    case 'left': return this.width;
                    case 'right': return -this.width;
                    default: return 0;
                } })()).attr('y2', (() => { switch (this.orient) {
                    case 'bottom': return -this.height;
                    case 'top': return this.height;
                    default: return 0;
                    } })()
            );
        }
    }
});
Cls.initClass();

// Horizontal X-Axis
// @see c3.Axis
Cls = (c3.Axis.X = class X extends c3.Axis {
    constructor(...args) {
        this._init = this._init.bind(this);
        this._size = this._size.bind(this);
        this._draw = this._draw.bind(this);
        super(...args);
    }

    static initClass() {
        this.prototype.type = 'x';
        this.prototype.orient = 'bottom';
    }

    _init() {
        super._init(...arguments);
        return this.axis_size != null ? this.axis_size : (this.axis_size = (!this.ticks ? 0 : Math.max(this.tick_size, this.path_size) + (this.tick_label ? 20 : 0) ) +
            (this.label ? 24 : 0));
    }

    _size() {
        if (this.orient === 'top') { this.content.all.attr('transform', `translate(0,${this.height})`); }
        if (this.scale) { return c3.d3.set_range(this.scale, [0, this.width]); }
    }

    _draw() {
        super._draw(...arguments);
        if (this.label != null) {
            return this.text_label.attr({
                x: (this.width/2)|0,
                y: this.orient === 'bottom' ? this.axis_size : '',
                dy: '-0.5em'
            });
        }
    }
});
Cls.initClass();

// Vertical Y-Axis
// @see c3.Axis
Cls = (c3.Axis.Y = class Y extends c3.Axis {
    constructor(...args) {
        this._init = this._init.bind(this);
        this._size = this._size.bind(this);
        this._draw = this._draw.bind(this);
        super(...args);
    }

    static initClass() {
        this.prototype.type = 'y';
        this.prototype.orient = 'left';
    }

    _init() {
        super._init(...arguments);
        return this.axis_size != null ? this.axis_size : (this.axis_size = (!this.ticks ? 0 : Math.max(this.tick_size, this.path_size)) +
            (this.tick_label ? 42 : 0) +
            (this.label ? 20 : 0));
    }

    _size() {
        if (this.orient === 'left') { this.content.all.attr('transform', `translate(${this.width},0)`); }
        if (this.scale) { return c3.d3.set_range(this.scale, [this.height, 0]); }
    }

    _draw() {
        super._draw(...arguments);
        if (this.label != null) {
            return this.text_label.attr({
                x: this.orient === 'left' ? -this.axis_size : this.axis_size,
                y: (this.height/2)|0,
                dy: this.orient === 'left' ? '1em' : '-1em',
                transform: `rotate(-90,${this.orient === 'left' ? -this.axis_size : this.axis_size},${(this.height/2)|0})`
            });
        }
    }
});
Cls.initClass();
