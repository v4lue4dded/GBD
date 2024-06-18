/*
 * decaffeinate suggestions:
 * DS002: Fix invalid constructor
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__, or convert again using --optional-chaining
 * DS104: Avoid inline assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
// C3 Visualization Library
// Legends

//##################################################################
// Legend
//##################################################################

// A Legend to display a list of items.
//
// It is important to set `item_options.text` or `item_options.html` to define how to
// display each element in the legend.  By default, the data elements will be converted to strings
// and displayed as raw text.  However, you will likely want to set a different accessor callback.
//
// ## Styling
// The list is created as a `ul` element.  The `hoverable` class is applied if appropriate.
// The `li` elements get the `parent` class if they have children.
// `li` elements have spans with either the `content` or `bullet` class as appropriate.
// @author Douglas Armstrong
let Cls = (c3.Legend = class Legend extends c3.Base {
    constructor(...args) {
        this._init = this._init.bind(this);
        this._update = this._update.bind(this);
        this._style = this._style.bind(this);
        super(...args);
    }

    static initClass() {
        this.version = 0.2;
        this.prototype.type = 'legend';
    
        // [Array] An array of data elements for the legend to display
        this.prototype.data = [];
        // [Function] A callback used to determine a unique identification for each data element.
        // This is useful, for example, with animations when the dataset changes.
        this.prototype.key = undefined;
        // [Function] A callback used to determine if a data element in the `data` array should be displayed.
        // It is passed with a data element as a parameter and should return `true` or `false`.
        // By default, legend items with no text or html defined will be omitted.
        this.prototype.filter = undefined;
        // [Boolean, Function] Set to false to disable nested legend items.
        // Set to a function to return an array of nested items based on a data element in `data`.
        // By default it will treat `data` elements that are arrays as nested items.
        this.prototype.nest = undefined;
        // [Function] A callback used to uniquely identify nested legend items.
        this.prototype.nest_key = undefined;
        // [Boolean] enables _hoverable_ behaviour for the legend such as highlighting when the
        // mouse hovers or with a touch event.
        this.prototype.hoverable = true;
        // [{c3.Selection.Options}] Options for the legend `ul` as a whole
        this.prototype.list_options = undefined;
        // [{c3.Selection.Options}] Options to set the **styles** and **events** for the `li` items in the list.
        this.prototype.list_item_options = undefined;
        // [{c3.Selection.Options}] Options to set the **text**, **html**, and other **styles** and
        // **events** for the content span for items in the list.
        // By default it will display data elements by converting them to a string.
        this.prototype.item_options = undefined;
        // [Function] A callback to get a {c3.Selection.Options} object for the content span
        // based on a datum as an input parameter
        this.prototype.item_option = undefined;
        // [{c3.Selection.Options}] Options for _nested_ `li` list items.
        // These will default to `list_item_options` unless specified.
        this.prototype.nested_list_item_options = undefined;
        // [{c3.Selection.Options}] Options for _nested_ content spans for list items.
        // These will default to `item_options` unless specified.
        this.prototype.nested_item_options = undefined;
        // [Boolean, {c3.Selection.Options}] Set to `false` to disable **bullets** for legend items.
        // Otherwise it is the {c3.Selection.Options options} to set the **text**, **html**, or other
        // options for the list item bullets.
        this.prototype.bullet_options = undefined;
        // [Boolean, {c3.Selection.Options}] Options for **bullets** of _nested_ list items.
        // This will default to `bullet_options` unless specified.
        this.prototype.nested_bullet_options = undefined;
    }

    _init() {
        // Default Options
        // * Legend items are the data elements converted to text
        // * Arrays represent nested items
        // * Items with no name are not displayed.
        if (this.nest == null) { this.nest = function(d){ if (Array.isArray(d)) { return d; } else { return []; } }; }
        if (this.item_options == null) { this.item_options = {}; }
        if ((this.item_option == null)) {
          if (this.item_options.text == null) { this.item_options.text = function(d){ if (Array.isArray(d)) { return `${d.length} items`; } else { return d; } }; }
          if (this.filter == null) { let left, left1, left2;
          this.filter = d=> (left = (left1 = (left2 = (typeof this.item_options.html === 'function' ? this.item_options.html(d) : undefined)) != null ? left2 : this.item_options.html) != null ? left1 : (typeof this.item_options.text === 'function' ? this.item_options.text(d) : undefined)) != null ? left : this.item_options.text; }
      }
        if (this.nested_list_item_options == null) { this.nested_list_item_options = this.list_item_options; }
        if (this.nested_item_options == null) { this.nested_item_options = this.item_options; }
        if (this.bullet_options == null) { this.bullet_options = {}; }
        if (this.bullet_options.text == null) { this.bullet_options.text = "•"; }
        if (this.nested_bullet_options == null) { this.nested_bullet_options = this.bullet_options; }

        // Create the Legend List
        return this.list = c3.select(d3.select(this.anchor),'ul').singleton();
    }

    _update() {
        // Pull the specified data from the input data array
        // NOTE: This is done before we temporarily delete the text/html options!
        this.current_data = this.filter ? ((() => {
            const result = [];
            for (let i = 0; i < this.data.length; i++) {
                var datum = this.data[i];
                if (this.filter(datum,i)) {
                    result.push(datum);
                }
            }
            return result;
        })()) : this.data;

        // Set overall list options
        this.list.options(this.list_options).update();

        // Create the Legend List Items
        this.list_items = this.list.select('ul:not(.child) > li').bind(this.current_data, this.key);
        this.list_items.options(this.list_item_options).update();
        this.items = this.list_items.inherit('span.content').options(this.item_options, this.item_option).update();

        // Create Bullets
        if (this.bullet_options) {
            this.bullets = this.list_items.inherit('ul:not(.child) > li > span.bullet',true,true);
            this.bullets.options(this.bullet_options).update();
        }

        // Handle nested legend items
        if (this.nest) {
            this.nested_items = this.list_items.inherit('ul.child').select('li').bind(this.nest, this.nest_key);
            this.nested_items.options(this.nested_list_item_options).update();
            this.nested_items.inherit('span.content').options(this.nested_item_options).update();

            // Nested Bullets
            if (this.nested_bullet_options) {
                this.nested_bullets = this.nested_items.inherit('span.bullet',true,true);
                this.nested_bullets.options(this.nested_bullet_options).update();
            }
        }

        // Give any list items that have children the class `parent`
        return this.list_items.select('ul > li').all.each(function() {
            return d3.select(this).node().parentNode.parentNode.classList.add('parent');
        });
    }

    _style(style_new){
        this.list.style().all.classed({
            'c3': true,
            'legend': true,
            'hoverable': this.hoverable
        });
        this.list_items.style(style_new);
        this.items.style(style_new);
        if (this.nested_items != null) {
            this.nested_items.style(style_new);
        }
        if (this.bullets != null) {
            this.bullets.style(style_new);
        }
        return (this.nested_bullets != null ? this.nested_bullets.style(style_new) : undefined);
    }
});
Cls.initClass();


//##################################################################
// Chart Plot Legend
//##################################################################

// A type of {c3.Legend C3 Legend} that is linked with a {c3.Plot C3 Chart Plot}.
// It will display each {c3.Plot.Layer layer} in the plot as a legend items.
// For stacked layers, each {c3.Plot.Layer.Stackable.Stack stack} will be a nested item.
// The names in the legend will be based on the `name` attribute of the layers and stacks.
// If the `name` is `false`, then the layer will not be displayed.
//
// The legend is linked with the plot, so hovering over the legend items will highlight the
// cooresponding data in the plot.  The functionality leverages the base {c3.Legend legend} and
// can be further customized or adjusted by the user.
//
// @see c3.Legend
// @see c3.Plot
// @todo Support for swimlane layer types
// @todo Create a Legend type for Pie charts
// @todo Support for decimated layers
// @author Douglas Armstrong
Cls = (c3.Legend.PlotLegend = class PlotLegend extends c3.Legend {
    constructor(...args) {
        this._init = this._init.bind(this);
        this._update = this._update.bind(this);
        this._style = this._style.bind(this);
        super(...args);
    }

    static initClass() {
        this.version = 0.1;
        this.prototype.type = 'plot_legend';
    
        // [{c3.Plot}] Plot to link with this legend
        this.prototype.plot = undefined;
        // [Boolean] Invert the order of the layers in the legend.
        // * `false` - Layers on top are at the top of the legend.
        // * `true` - Layers on top are at the bottom of the legend.
        this.prototype.invert_layers = false;
        // [Boolean] By default, the layer and stack names will display as raw text.  If you would like
        // HTML tags in the name string to render as HTML, then enable this option.  Please be careful of
        // user-provided strings and security.
        this.prototype.html_names = false;
        // [Number] When hovering over an item the other layers/stacks in the plot will fade to this
        // percentage of their original opacity.
        this.prototype.hover_fade = 0.2;
        // [Number] The duration in milliseconds that animations should take, such as stacked elements
        // floating down to the bottom of the chart.
        this.prototype.duration = 750;
    }

    _init() {
        let left, left1;
        if ((this.plot == null)) { throw Error("Plot legend must have a plot option refering to a c3.Plot."); }
        if (!(this.plot instanceof c3.Plot)) { throw Error("Plot option must reference a c3.Plot type object."); }
        if (!this.plot.rendered) { throw Error("plot_legend's linked plot should be rendered before rendering the legend."); }

        // Setup default data to refer to the layers and stacks in a C3 plot
        if (this.key == null) { this.key = layer => layer.uid; }
        if (this.nest == null) { this.nest = layer => layer.stacks != null ? layer.stacks : []; }
        if (this.list_item_options == null) { this.list_item_options = {}; }
        if (this.item_options == null) { this.item_options = {}; }
        if (this.nested_list_item_options == null) { this.nested_list_item_options = {}; }
        if (this.nested_item_options == null) { this.nested_item_options = {}; }
        if (this.nest_key == null) { this.nest_key = stack => stack.key != null ? stack.key : stack.name; }

        // Callbacks to get the layer and stack names and titles
        const layer_title = (layer,i)=> (left = (left1 = (layer.options != null ? layer.options.title : undefined) != null ? (layer.options != null ? layer.options.title : undefined) : __guardMethod__(this.plot.layer_options, 'title', o => o.title(layer,i))) != null ? left1 : (this.plot.layer_options != null ? this.plot.layer_options.title : undefined)) != null ? left : layer.name;
        const layer_name = function(layer,i){ let left;
        return (left = layer.name != null ? layer.name : layer_title(layer,i)) != null ? left : layer.type; };
        const stack_title = (stack, stack_idx, layer_idx)=> {
            let left, left1;
            const layer = this.plot.layers[layer_idx];
            return (left = (left1 = (stack.options != null ? stack.options.title : undefined) != null ? (stack.options != null ? stack.options.title : undefined) : __guardMethod__(layer != null ? layer.stack_options : undefined, 'title', o => o.title(stack))) != null ? left1 : __guard__(layer != null ? layer.stack_options : undefined, x => x.title)) != null ? left : stack.name;
        };
        const stack_name = function(stack, stack_idx, layer_idx){
            let left;
            return (left = stack.name != null ? stack.name : stack_title(stack, stack_idx, layer_idx)) != null ? left : "stack";
        };

        // Setup the legend names and titles
        if (this.html_names) {
            if (this.item_options.html == null) { this.item_options.html = layer_name; }
            if (this.nested_item_options.html == null) { this.nested_item_options.html = stack_name; }
        } else {
            if (this.item_options.text == null) { this.item_options.text = layer_name; }
            if (this.nested_item_options.text == null) { this.nested_item_options.text = stack_name; }
        }
        if (this.item_options.title == null) { this.item_options.title = layer_title; }
        if (this.nested_item_options.title == null) { this.nested_item_options.title = stack_title; }

        if (this.hoverable) {
            // Highlight the layers in the chart when hovering over the legend.
            if (this.list_item_options.events == null) { this.list_item_options.events = {}; }
            if (this.list_item_options.events.mouseenter == null) { this.list_item_options.events.mouseenter = (hover_layer, hover_layer_idx)=> {
                // Fade other layers
                const fade = this.hover_fade;
                this.plot.layers_selection.all.style('opacity', function(layer,i){
                    let left;
                    const old_opacity = (left = d3.select(this).style('opacity')) != null ? left : 1;
                    if (layer !== hover_layer) { return fade * old_opacity; } else { return old_opacity; }
                });
                return this.trigger('layer_mouseenter', hover_layer, hover_layer_idx);
            }; }
            if (this.list_item_options.events.mouseleave == null) { this.list_item_options.events.mouseleave = (hover_layer, hover_layer_idx)=> {
                // Restore all layers to their proper opacity
                this.plot.layers_selection.all.style('opacity', (layer,i)=> {
                    let left, left1, left2, left3;
                    return (left = (left1 = (left2 = (left3 = __guardMethod__(layer.options != null ? layer.options.styles : undefined, 'opacity', o => o.opacity(layer,i))) != null ? left3 : __guard__(layer.options != null ? layer.options.styles : undefined, x => x.opacity)) != null ? left2 : __guardMethod__(layer.styles, 'opacity', o1 => o1.opacity(layer,i))) != null ? left1 : (layer.styles != null ? layer.styles.opacity : undefined)) != null ? left : 1;
                });
                return this.trigger('layer_mouseleave', hover_layer, hover_layer_idx);
            }; }

            // Highlight the stacks in the chart layer when hovering over nested items
            if (this.nested_list_item_options.events == null) { this.nested_list_item_options.events = {}; }
            if (this.nested_list_item_options.events.mouseenter == null) { this.nested_list_item_options.events.mouseenter = (hover_stack, hover_stack_idx, hover_layer_idx)=> {
                const layer = this.plot.layers[hover_layer_idx];

                // Fade other stacks
                const fade = this.hover_fade;
                layer.groups.all.style('opacity', function(stack,i){
                    let left;
                    const old_opacity = (left = d3.select(this).style('opacity')) != null ? left : 1;
                    if (stack !== hover_stack) { return fade * old_opacity; } else { return old_opacity; }
                });

                // Animate stacked bar chart stacks to the baseline for comparison
                const {
                    duration
                } = this;
                if (layer.rects != null) {
                    layer.rects.all.filter((d, i, stack_idx) => stack_idx === hover_stack_idx)
                    .transition().duration(duration).attr('transform', function() {
                        const rect = d3.select(this);
                        return `translate(0,${layer.v.range()[0]-rect.attr('y')-rect.attr('height')})`;
                });
                }

                // Animate stacked line/area chart stacks to the baseline
                if (layer.path_generator != null) {
                    // Cache the current paths for the stacks in the layer
                    let cache;
                    this.layer_paths_cached = (cache = []);
                    if (layer.paths != null) {
                        layer.paths.all.each(function(path, path_idx){
                        return cache[path_idx] = d3.select(this).attr('d');
                    });
                    }
                    if (layer.paths != null) {
                        layer.paths.all.filter((stack, stack_idx) => stack_idx === hover_stack_idx)
                        .transition().duration(duration).attr('d', function(stack, stack_idx){
                            layer.path_generator
                                .x((d, i) => (layer.chart.orig_h != null ? layer.chart.orig_h : layer.h)(stack.values[i].x)) // TODO Hack, cleanup with migration to zoom as a mix-in
                                .y((d, i) => layer.v(stack.values[i].y))
                                .y0(layer.v.range()[0]);
                            return layer.path_generator(stack.current_data);
                    });
                    }
                }

                return this.trigger('stack_mouseenter', hover_stack, hover_stack_idx, hover_layer_idx);
            }; }

            if (this.nested_list_item_options.events.mouseleave == null) { this.nested_list_item_options.events.mouseleave = (hover_stack, hover_stack_idx, hover_layer_idx)=> {
                const layer = this.plot.layers[hover_layer_idx];

                // Restore all stacks to their proper opacity
                layer.groups.all.style('opacity', (stack,i)=> {
                    let left, left1;
                    return (left = (left1 = __guardMethod__(layer.stack_options != null ? layer.stack_options.styles : undefined, 'opacity', o => o.opacity(stack,i))) != null ? left1 : __guard__(layer.stack_options != null ? layer.stack_options.styles : undefined, x => x.opacity)) != null ? left : 1;
                });

                // Restore stacked bar charts that were floated to the baseline
                if (layer.rects != null) {
                    layer.rects.all.transition().duration(this.duration).attr('transform', '');
                }

                // Restore stacked line/area charts that were floated to the baseline
                if (layer.paths != null) {
                    layer.paths.all.interrupt();
                }
                if (layer.paths != null) {
                    // If we have the paths for the stacks in the layer cached, then
                    // restore them cheaply.  Otherwise, recompute the paths based on the
                    // current data.
                    if (this.layer_paths_cached != null) {
                        if (layer.paths != null) {
                            layer.paths.all.filter((stack, stack_idx) => stack_idx === hover_stack_idx)
                            .attr('d', this.layer_paths_cached[hover_stack_idx]);
                        }
                    } else {
                        layer.draw();
                    }
                }

                return this.trigger('stack_mouseleave', hover_stack, hover_stack_idx, hover_layer_idx);
            }; }
        }

        super._init(...arguments);
        this.list.all.classed('plot_legend', true);
        // When the linked plot's style is updated, update the legend styles
        return this.plot.on('restyle.legend', this.restyle);
    }

    _update() {
        // Clear any cached layer state.
        delete this.layer_paths_caches;

        // Create empty bullets to be populated with SVG glyphs.
        delete this.bullet_options.text;
        delete this.bullet_options.html;

        // Setup default data to refer to the layers in a C3 plot
        this.data = this.plot.layers;
        super._update(...arguments);
        if (this.invert_layers) {
            this.list_items.all.order();
        } else {
            this.list_items.all.sort((a,b)=> this.plot.layers.indexOf(a) < this.plot.layers.indexOf(b));
        }

        // Create an SVG glyph for each layer or stack.  Bind it to an example "node" in the
        // plot's actual layer that will represent what styles we should copy for the legend.
        const size = 16;
        const generate_glyph = function(svg, layer, stack_idx){
            // Depending on the layer type create an SVG glyph.
            // Relying on the layer type may not be the cleanest approach.  Might be better to
            // have the layer implementations themselves provide a glyph..
            let node;
            if (stack_idx == null) { stack_idx = 0; }
            if (layer instanceof c3.Layer.Line) {
                node = layer.paths.all[0][stack_idx];
                return svg.select('line').singleton(node).position({ x1:0, y1:size/2, x2:size, y2:size/2 });
            } else if (layer instanceof c3.Layer.Line.Horizontal) {
                node = layer.lines.all.node();
                return svg.select('line').singleton(node).position({ x1:0, y1:size/2, x2:size, y2:size/2 });
            } else if (layer instanceof c3.Layer.Line.Vertical) {
                node = layer.lines.all.node();
                return svg.select('line').singleton(node).position({ x1:size/2, y1:0, x2:size/2, y2:size });
            } else if (layer instanceof c3.Layer.Scatter) {
                node = layer.circles.all.node();
                return svg.select('circle').singleton(node).position({ cx:size/2, cy:size/2, r:size/4 });
            } else { // Area, Bar, Region, & default (including swimlanes for now)
                let left, left1;
                node = (left = (left1 = (layer.paths != null ? layer.paths.all[0][stack_idx] : undefined) != null ? (layer.paths != null ? layer.paths.all[0][stack_idx] : undefined) : (layer.rects != null ? layer.rects.all[stack_idx][0] : undefined)) != null ? left1 : (layer.groups != null ? layer.groups.all.node() : undefined)) != null ? left : layer.g.node();
                return svg.select('rect').singleton(node).position({
                    x: size*0.1,
                    y: size*0.1,
                    height: size*0.8,
                    width: size*0.8,
                    rx: size/5,
                    ry: size/5
                });
            }
        };

        // Create SVG glyphs for legend items
        this.bullets_svg = this.bullets.inherit('svg');
        this.bullets_svg.all.attr({
            height: size,
            width: size
        });
        this.bullets_svg.all.each(function(layer){
            if ((layer.stacks == null)) {
                return generate_glyph(c3.select(d3.select(this)), layer);
            } else { return d3.select(this.parentNode).remove(); }
        });

        // Create glyphs for nested legend items.
        this.nested_bullets_svg = this.nested_bullets.inherit('svg');
        this.nested_bullets_svg.all.attr({
            height: size,
            width: size
        });
        const {
            plot
        } = this;
        return this.nested_bullets_svg.all.each(function(stack, stack_idx, layer_idx){
            const layer = plot.layers[layer_idx];
            return generate_glyph(c3.select(d3.select(this)), layer, stack_idx);
        });
    }

    _style() {
        super._style(...arguments);
        // Style the glyphs in the legend to match the styles of their cooresponding
        // nodes in the plot.
        return this.list.all.selectAll('li > .bullet > svg > *').each(function(node){ if (node) {
            const glyph = d3.select(this);
            const src_styles = getComputedStyle(node);
            return ['stroke', 'stroke-dasharray', 'stroke-width', 'fill', 'opacity'].map((style) =>
                glyph.style(style, src_styles.getPropertyValue(style)));
        }
         });
    }
});
Cls.initClass();

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