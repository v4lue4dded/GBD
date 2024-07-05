/*
 * decaffeinate suggestions:
 * DS002: Fix invalid constructor
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS202: Simplify dynamic range loops
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
// C3 Visualization Library
// Graphs
// All Rights Reserved.

//##################################################################
// Graph
//##################################################################

// Graph
// @abstract
let Clsc3graph = (c3.Graph = class Graph extends c3.Chart {
    static initClass() {
        this.version = 0.1;
        this.prototype.type = 'graph';
    }
});
Clsc3graph.initClass();


//##################################################################
// Sankey
//##################################################################

// Directed graph [**Sankey**](https://en.wikipedia.org/wiki/Sankey_diagram) visualization.
// Provide a set of nodes and weighted links between them.  Various configuration options are available
// to adjust the layout algorithm.  Add a `node_label_options` with a `text` property to add labels to the nodes.
//
// The implementation is based on the [D3 Sankey plugin](https://bost.ocks.org/mike/sankey/).
// However, it has been extended with the following:
//
// * User can define their own data structures for nodes and links.
// * Does not modify the original dataset.
// * Cycles / Back Edges are allowed.
// * Animation of dynamic datasets.
// * Nodes may have a value larger than incoming and outgoing links
// * Configurable padding and node widths based on either pixels or percentages.
// * Configuragle curvature, minimium widths, etc.
// * Tweaked layout algorithm.
//
// @author Douglas Armstrong
// @todo Link lables
// @todo Links to missing nodes
// @todo Draggable nodes
// @todo Zoom/Pan navigation
// @todo Highlighted sub-path(s) through graph
Clsc3graph = (c3.Sankey = class Sankey extends c3.Graph {
    constructor(...args) {
        super(...args);
        this._init = this._init.bind(this);
        this._size = this._size.bind(this);
        this._update_data = this._update_data.bind(this);
        this._update = this._update.bind(this);
        this._layout = this._layout.bind(this);
        this._draw = this._draw.bind(this);
        this._style = this._style.bind(this);
    }

    static initClass() {
        this.version = 0.1;
        this.prototype.type = 'sankey';
    
        // [Array<>] Array of user-defined node objects
        this.prototype.data = [];
        // [Array<>] Array of user-defined link objects
        this.prototype.links = [];
        // [Function] Accessor function to get the key for a node object
        this.prototype.key = undefined;
        // [Function] Accessor function to get the value for a node object.
        // If not defined, then the maximum value of the input or output links of a node will be used.
        this.prototype.value = undefined;
        // [Function] Accessor function to get the key of the source node for a link.
        // This defaults to using the `source` member of the link object.
        this.prototype.link_source = undefined;
        // [Function] Accessor function to get the key of the target node for a link.
        // This defaults to using the `target` member of the link object.
        this.prototype.link_target = undefined;
        // [Function] Accessor function to get the key of a link.
        // This defaults to combining the `link_source` and `link_target` accessors
        this.prototype.link_key = undefined;
        // [Function] Accessor function to get the value of a link.
        // This defaults to using the `value` member of the link object.
        this.prototype.link_value = undefined;
        // [Boolean] Safe mode will ensure that the sum of the link values are not
        // greater than node values for each particular node
        this.prototype.safe = true;
    
        // [Number] Number of iterations to run the iterative layout algorithm.
        this.prototype.iterations = 32;
        // [Number] An alpha factor to adjust the subsequent strength of each iteration.
        // Smaller numbers will quiesce faster.
        this.prototype.alpha = 0.99;
        // [Number, String] The vertical padding between nodes.
        // This can be the number of pixels to attempt to use between each node.  If there are too many
        // nodes for the vertical space, then fewer may be used.
        // It can also be a string that represents the percentage of the vertical space to use for padding
        // divided among all of the nodes.
        this.prototype.node_padding = '20%';
        // [Number, String] The horzontal width of each node.
        // This may be a number of pixels for the node width or else a string which is the percentage of
        // the horizontal space to use for nodes.
        this.prototype.node_width = 30;
        // [String] The type of alignment to use for the nodes:
        // * **both** - Align nodes with no inputs on the left and no outputs on the right
        // * **left** - Align nodes with no inputs on the left
        this.prototype.align = 'both';
        // [String] The type of path to use for links between nodes:
        // * **curve** - A curved path
        // * **straight** - A stright line
        this.prototype.link_path = 'curve';
        // [Number] A number representing the curvature to use for curved link paths.  Ranges from 0-1.
        this.prototype.link_path_curvature = 0.5;
        // [Number] The ratio of node width that, if exceeded, will cause the layout to
        // overflow to the right size to avoid crowding the node columns too close together.
        // This is only valid if node_width is set as a width and not as a percentage.
        this.prototype.overflow_width_ratio = 0.5;
    
        // [Number] Limit the number of nodes to visualize in the graph.
        // The nodes with the top total computed values will be rendered.
        this.prototype.limit_nodes = undefined;
        // [Number] Limit the number of links to visualize in the graph.
        // This top number of links will be selected based on their link values.
        // However, the trailing links for all of the nodes connected by those top
        // links will also be rendered.
        this.prototype.limit_links = undefined;
    
        // [{c3.Selection.Options}] Options for the svg:g layer of all nodes
        this.prototype.nodes_options = undefined;
        // [{c3.Selection.Options}] Options for the svg:g node elements
        this.prototype.node_options = undefined;
        // [{c3.Selection.Options}] Options for the svg:rect node elements
        this.prototype.rect_options = undefined;
        // [{c3.Selection.Options}] Options for the svg:g layer of all links
        this.prototype.links_options = undefined;
        // [{c3.Selection.Options}] Options for the svg:g link elements
        this.prototype.link_options = undefined;
        // [{c3.Selection.Options}] Options for the svg:path link elements
        this.prototype.path_options = undefined;
        // [{c3.Selection.Options}] Options for the svg:text node labels
        this.prototype.node_label_options = undefined;
        // [{c3.Selection.Options}] Options for the svg:text link labels
        this.prototype.link_label_options = undefined;
    }

    _init() {
        this.h = d3.scale.linear();
        this.v = d3.scale.linear();

        // Default accessors
        if (this.key == null) { this.key = d=> this.data.indexOf(d); } // NOTE: This is not efficient for any decent sized dataset
        if (this.link_key == null) { this.link_key = l=> this.link_source(l)+','+this.link_target(l); }
        if (this.link_source == null) { this.link_source = l => l.source; }
        if (this.link_target == null) { this.link_target = l => l.target; }
        if (this.link_value == null) { this.link_value = l => l.value; }

        return this.background = this.content.select('rect.background').singleton().position({
            x: 0,
            y: 0
        });
    }

    _size() {
        // The horizontal scale range is set in _draw() in case the @node_width is a percentage
        this.v.range([0, this.height]);
        this.background.position({
            width: this.width,
            height: this.height
        });

        // If we are resizing, need to call _update() if:
        // @node_padding is based on a pixel size or @overflow_width_ratio is sets
        if ((!isNaN(this.node_padding)) || (!isNaN(this.node_width && this.overflow_width_ratio))) {
            return this._update();
        }
    }

    _update_data(origin){
        // The first render() calls _size() which might call us.  If so, then don't repeat the work.
        let key, link, link_key, node, node_links;
        let datum;
        if ((origin === 'render') && !isNaN(this.node_padding)) { return; }

        // Prepare the set of nodes and links, cache the link values
        this.nodes = (this.current_nodes = {});
        this.node_links = (node_links = {});
        for (link of Array.from(this.links)) {
            var name, name1;
            link_key = this.link_key(link);
            var link_value = this.link_value(link);
            if (!link_value) { continue; }
            if (node_links[link_key] != null) { throw Error("Link with duplicate source and target specified"); }
            node_links[link_key] = { value: this.link_value(link) };

            // Prepare set of nodes and their interconnected links
            node = this.nodes[name = this.link_source(link)] != null ? this.nodes[name] : (this.nodes[name] = { source_links: [], target_links: [] });
            node.target_links.push(link);
            node = this.nodes[name1 = this.link_target(link)] != null ? this.nodes[name1] : (this.nodes[name1] = { source_links: [], target_links: [] });
            node.source_links.push(link);
        }

        // Gather just the set of nodes that are linked to
        const data = ((() => {
            const result = [];
            for (datum of Array.from(this.data)) {                 if (this.key(datum) in this.nodes) {
                    result.push(datum);
                }
            }
            return result;
        })());

        // Compute the value for each node
        if ((this.value != null) && !this.safe) {
            for (datum of Array.from(data)) { this.nodes[this.key(datum)].value = this.value(datum); }
        } else {
            ({
                key
            } = this);
            for (datum of Array.from(data)) {
                node = this.nodes[key(datum)];
                node.value = Math.max(
                    d3.sum(node.source_links, l=> node_links[this.link_key(l)].value),
                    d3.sum(node.target_links, l=> node_links[this.link_key(l)].value) );
                // If in safe mode, then use @value() as long as it is less than sum of links
                if (this.value != null) { node.value = Math.max(node.value, this.value(datum)); }
            }
        }
        for (key in this.nodes) {
            node = this.nodes[key];
            if ((node.value == null)) {
                throw Error("Missing nodes are not currently supported");
            }
        }

        // Pre-compute the sums of link values
        for (key in this.nodes) {
            node = this.nodes[key];
            node.links_sum =
                d3.sum(node.source_links, l=> node_links[this.link_key(l)].value) +
                d3.sum(node.target_links, l=> node_links[this.link_key(l)].value);
        }

        // Detect back edges / cycles
        const visited = {};
        // Loop through all nodes to ensure full coverage, even for disjoint graphs
        for (key in this.nodes) {
            node = this.nodes[key];
            if (!visited[key]) {var detect_backedge;
            
                var stack = [];
                (detect_backedge = (key, node)=> {
                    visited[key] = true;
                    stack.push(node);
                    for (link of Array.from(node.target_links)) {
                        var target_key = this.link_target(link);
                        var target = this.nodes[target_key];
                        node_links[this.link_key(link)].backedge = Array.from(stack).includes(target);
                        if (!visited[target_key]) { detect_backedge(target_key, target); }
                    }
                    return stack.pop();
                }
                )(key, node);
            }
        }

        return null;
    }


    _update(origin){
        let link, node;
        let key;
        this._update_data(origin);

        if (this.limit_links != null) {
            // Determine the top links to limit
            let current_links = this.links.slice();
            c3.array.sort_up(current_links, this.link_value);
            current_links = current_links.slice(-this.limit_links, +(current_links.length-1) + 1 || undefined);

            // Collect the set of nodes connected to those top links
            this.current_nodes = {};
            for (link of Array.from(current_links)) {
                for (key of [this.link_source(link), this.link_target(link)]) {
                    this.current_nodes[key] = this.nodes[key];
                }
            }
        }

        if (this.limit_nodes != null) {
            // Sort based on the calculated node value instead of the user-provided
            // value assessor in case safe mode increased the size of a node due to its links.
            let top_keys = ((() => {
                const result = [];
                for (key in this.nodes) {
                    result.push(key);
                }
                return result;
            })());
            c3.array.sort_up(top_keys, key=> this.nodes[key].value);
            top_keys = top_keys.slice(-this.limit_nodes, +(top_keys.length-1) + 1 || undefined);
            this.current_nodes = {};
            for (key of Array.from(top_keys)) { this.current_nodes[key] = this.nodes[key]; }
        }


        // Compute the x position of each node
        let remaining_nodes = this.current_nodes;
        let x = 0;
        while (!c3.util.isEmpty(remaining_nodes)) {
            var next_nodes = {};
            for (key in remaining_nodes) {
                node = remaining_nodes[key];
                node.x = x;
                for (link of Array.from(node.target_links)) {
                    if (!this.node_links[this.link_key(link)].backedge) {
                        var target_key = this.link_target(link);
                        var target_node = this.current_nodes[target_key];
                        if (target_node != null) { next_nodes[target_key] = target_node; }
                    }
                }
            }
            remaining_nodes = next_nodes;
            x++;
        }

        // Right align nodes with no targets
        x--;
        if (this.align === 'both') {
            for (key in this.nodes) {
                node = this.nodes[key];
                if (!node.target_links.length) { node.x = x; }
            }
        }

        // Compute horizontal domain
        this.h.domain([0, x]);

        return this._layout(origin);
    }


    _layout(origin){
        let columns, node_link;
        let key, node, column, i, link;
        const {
            node_links
        } = this;

        // Prepare set of columns
        this.columns = (columns = d3.nest()
            .key(node => node.x)
            .sortKeys(d3.ascending)
            //.sortValues d3.descending
            .entries(((() => {
            const result = [];
            for (key in this.current_nodes) {
                node = this.current_nodes[key];
                result.push(node);
            }
            return result;
        })()))
            .map(g => g.values));
        c3.array.sort_up(this.columns, column => column[0].x); // d3's sortKeys didn't work?

        // Calculate node padding and the vertical domain
        // Start by determining the percentage of each column to use for padding
        if (!isNaN(this.node_padding)) {
            for (column of Array.from(columns)) {
                column.padding_percent = (this.node_padding*(column.length-1)) / this.height;
                if (column.padding_percent > 0.8) { column.padding_percent = 0.8; }
            }
        } else if ((typeof this.node_padding.charAt === 'function' ? this.node_padding.charAt(this.node_padding.length-1) : undefined) === '%') {
            for (column of Array.from(columns)) {
                column.padding_percent = column.length === 1 ? 0 : this.node_padding.slice(0, +-2 + 1 || undefined) / 100;
                if (column.padding_percent === 1) { column.padding_percent = 0.999; }
            }
        } else { throw new Error("Unsupported node_padding parameter: "+this.node_padding); }
        // Calculate the maximum vertical domain, including padding
        const v_domain = d3.max(((() => {
            const result1 = [];
            for (column of Array.from(columns)) {                 result1.push(d3.sum(column,node => node.value) / (1-column.padding_percent));
            }
            return result1;
        })()));
        this.v.domain([0, v_domain]);
        // Calculate node padding in terms of the value domain
        for (column of Array.from(columns)) {
            column.padding = column.length === 1 ? 0 :
                (v_domain * column.padding_percent) / (column.length-1);
        }

        // Detect collisions and move nodes to avoid overlap
        const collision_detection = () => {
            return (() => {
                const result2 = [];
                for (column of Array.from(columns)) {
                    var dy;
                    c3.array.sort_up(column, node => node.y);

                    // Push overlapping nodes down
                    var y = 0;
                    for (node of Array.from(column)) {
                        dy = y - node.y;
                        if (dy > 0) { node.y += dy; }
                        y = node.y + node.value + column.padding;
                    }

                    // If they extend past the bottom, then push some back up
                    if ((node.y+node.value) > this.v.domain()[1]) {
                        y = this.v.domain()[1];
                        result2.push((() => {
                            const result3 = [];
                            for (let k = column.length - 1; k >= 0; k--) {
                                node = column[k];
                                dy = (node.y + node.value) - y;
                                if (dy > 0) { node.y -= dy;
                                } else { break; }
                                result3.push(y = node.y - column.padding);
                            }
                            return result3;
                        })());
                    } else {
                        result2.push(undefined);
                    }
                }
                return result2;
            })();
        };

        // Layout the links along the nodes
        const layout_links = () => {
            const {
                link_key
            } = this;
            const {
                link_source
            } = this;
            const {
                link_target
            } = this;
            return (() => {
                const result2 = [];
                for (column of Array.from(columns)) {
                    var column_padding =
                        column.length > 1 ? column.padding
                        : column.length === 1 ? this.v.domain()[1] - column[0].value
                        : 0;
                    result2.push((() => {
                        const result3 = [];
                        for (node of Array.from(column)) {
                            var node_link;
                            c3.array.sort_up(node.source_links, link=> this.nodes[link_source(link)].y);
                            var trailing_y = node.y - (column_padding/2);
                            var trailing_padding = (column_padding) / (node.source_links.length-1);
                            var {
                                y
                            } = node;
                            for (link of Array.from(node.source_links)) {
                                node_link = node_links[link_key(link)];
                                node_link.ty = y;
                                y += node_link.value;
                                node_link.tx = node.x;
                                // Trailing link to missing node
                                if (!(link_source(link) in this.current_nodes)) {
                                    node_link.sx = node.x - 1;
                                    node_link.sy = trailing_y;
                                    // Workaround for gradients failing with horizontal paths (Chrome 5/2/16)
                                    if (this.v(node_link.sy).toFixed(3) === this.v(node_link.ty).toFixed(3)) {
                                        node_link.sy += this.v.invert(1);
                                    }
                                }
                                trailing_y += node_link.value + trailing_padding;
                            }

                            // TODO: Normalize code for layout of target and source links.
                            c3.array.sort_up(node.target_links, link=> this.nodes[link_target(link)].y);
                            ({
                                y
                            } = node);
                            trailing_y = node.y - (column_padding/2);
                            trailing_padding = (column_padding) / (node.target_links.length-1);
                            result3.push((() => {
                                const result4 = [];
                                for (link of Array.from(node.target_links)) {
                                    node_link = node_links[link_key(link)];
                                    node_link.sy = y;
                                    y += node_link.value;
                                    node_link.sx = node.x;
                                    // Trailing link to missing node
                                    if (!(link_target(link) in this.current_nodes)) {
                                        node_link.tx = node.x + 1;
                                        node_link.ty = trailing_y;
                                        // Workaround for gradients failing with horizontal paths (Chrome 5/2/16)
                                        if (this.v(node_link.sy).toFixed(3) === this.v(node_link.ty).toFixed(3)) {
                                            node_link.ty += this.v.invert(1);
                                        }
                                    }
                                    result4.push(trailing_y += node_link.value + trailing_padding);
                                }
                                return result4;
                            })());
                        }
                        return result3;
                    })());
                }
                return result2;
            })();
        };

        // Give nodes and links an initial position
        let y = 0;
        if (columns.length) {
            // Arrange the first column with larges nodes on each end in an attempt to avoid cross-over...
            let k;
            c3.array.sort_up(columns[0], node => node.value);
            const tmp = columns[0].slice();
            const iterable = d3.merge([((() => {
                const result2 = [];
                for (i = columns[0].length-1; i >= 0; i -= 2) {
                    result2.push(i);
                }
                return result2;
            })()), ((() => {
                let end;
                const result3 = [];
                for (i = columns[0].length%2, end = columns[0].length-1; i <= end; i += 2) {
                    result3.push(i);
                }
                return result3;
            })())]);
            for (k = 0, i = k; k < iterable.length; k++, i = k) {
                var r = iterable[i];
                columns[0][i] = tmp[r];
            }
            for (node of Array.from(columns[0])) {
                node.y = y;
                y += node.value + columns[0].padding;
            }
        }
        for (let j = 0; j < columns.length; j++) {
            // For each subsequent column, align the nodes to the right of their sources to attempt flatter links
            column = columns[j];
            if (j) {
                for (node of Array.from(column)) {
                    var weighted_y = 0;
                    var source_link_value = 0;
                    var total_weighted_y = 0;
                    var total_source_link_value = 0;
                    for (link of Array.from(node.source_links)) {
                        node_link = this.node_links[this.link_key(link)];
                        var source_node = this.current_nodes[this.link_source(link)];
                        if ((source_node == null) || (source_node.y == null)) { continue; }
                        total_weighted_y += source_node.y * node_link.value;
                        total_source_link_value += node_link.value;
                        if (source_node.x >= node.x) { continue; } // Only layout initially for links that flow rightward
                        weighted_y += source_node.y * node_link.value;
                        source_link_value += node_link.value;
                    }
                    if (source_link_value) {
                        node.y = weighted_y / source_link_value;
                    } else if (total_source_link_value) {
                        // If all source links come from the right, then just take the average of all of them
                        node.y = total_weighted_y / total_source_link_value;
                    } else {
                        // If there are no source links at all, then the average of the target links
                        // This can't happen with a normal Sankey, since all nodes with no sources are in the first column;
                        // but, it can happen with a butterfly.
                        var target_link_value = 0;
                        for (link of Array.from(node.target_links)) {
                            node_link = this.node_links[this.link_key(link)];
                            var target_node = this.current_nodes[this.link_target(link)];
                            if ((target_node == null) || (target_node.y == null)) { continue; }
                            weighted_y += target_node.y * node_link.value;
                            target_link_value += node_link.value;
                        }
                        node.y = weighted_y / (target_link_value || 1);
                    }
                }
            }
        }
        //# Give nodes and links an initial position
        //for column in columns
        //     node.y = i for node,i in column
        collision_detection();
        layout_links();

        // Iterate to shift nodes closer to their neighbors based on the value of their links
        let alpha = 1;
        for (let iteration = 0, end1 = this.iterations, asc = 0 <= end1; asc ? iteration < end1 : iteration > end1; asc ? iteration++ : iteration--) {
            alpha *= this.alpha;

            for (column of Array.from(columns)) {
                for (node of Array.from(column)) {
                    var delta = 0;
                    for (link of Array.from(node.source_links)) {
                        node_link = this.node_links[this.link_key(link)];
                        if (node_link.tx > node_link.sx) { // Only align rightward links
                            delta += (node_link.sy - node_link.ty) * node_link.value; //* (0.5+(1/(2*Math.abs(node.x-@nodes[@link_source link].x))))
                        }
                    }
                    for (link of Array.from(node.target_links)) {
                        node_link = this.node_links[this.link_key(link)];
                        if (node_link.tx > node_link.sx) { // Only align rightward links
                            delta += (node_link.ty - node_link.sy) * node_link.value; //* (0.5+(1/(2*Math.abs(node.x-@nodes[@link_target link].x))))
                        }
                    }
                    delta /= node.links_sum;
                    node.y += delta * alpha;
                }
            }
            collision_detection();
            layout_links();
        }

        // Bind data to the DOM
        const current_link_keys = {};
        for (key in this.current_nodes) {
            node = this.current_nodes[key];
            for (var links of [node.source_links, node.target_links]) {
                for (link of Array.from(links)) {
                    current_link_keys[this.link_key(link)] = link;
                }
            }
        }
        const current_links = ((() => {
            const result4 = [];
            for (key in current_link_keys) {
                link = current_link_keys[key];
                result4.push(link);
            }
            return result4;
        })());
        this.links_layer = this.content.select('g.links').singleton().options(this.links_options).update();
        this.link_g = this.links_layer.select('g.link').options(this.link_options).animate(origin !== 'render')
            .bind(current_links, this.link_key).update();
        this.paths = this.link_g.inherit('path').options(this.path_options).update();
        this.link_g.all.classed('backedge', link=> this.node_links[this.link_key(link)].backedge);

        const current_data = ((() => {
            const result5 = [];
            for (var datum of Array.from(this.data)) {                 if (this.key(datum) in this.current_nodes) {
                    result5.push(datum);
                }
            }
            return result5;
        })());
        this.nodes_layer = this.content.select('g.nodes').singleton().options(this.nodes_options).update();
        this.node_g = this.nodes_layer.select('g.node').options(this.node_options).animate(origin !== 'render')
            .bind(current_data, this.key).update();
        this.rects = this.node_g.inherit('rect').options(this.rect_options).update();

        // Bind optional node labels
        if (this.node_label_options != null) {
            this.node_labels_clip = this.node_g.inherit('svg.label','restore');
            this.node_labels = this.node_labels_clip.inherit('text','restore').options(this.node_label_options).update();
        } else {
            if (this.node_labels_clip != null) {
                this.node_labels_clip.all.remove();
            }
            delete this.node_labels;
            delete this.node_labels_clip;
        }

        // Style links that fade out to unrendered nodes
        this.paths.all.classed({
            fade_left: link=> !(this.link_source(link) in this.current_nodes),
            fade_right: link=> !(this.link_target(link) in this.current_nodes)
        });
        // Workaround packing/build issues for systems that don't like url() syntax in CSS files...
        return this.paths.all.attr('mask', link=> {
            if (!(this.link_source(link) in this.current_nodes)) { return 'url(#mask_fade_left)';
            } else if (!(this.link_target(link) in this.current_nodes)) { return 'url(#mask_fade_right)';
            } else { return null; }
        });
    }


    _draw(origin){
        // Calculate node_width in pixels
        let node_width;
        if (!isNaN(this.node_width)) {
            ({
                node_width
            } = this);

            // If nodes would overlap, then overflow the domain
            if (this.overflow_width_ratio) {
                if (((node_width * (this.h.domain()[1]+1)) / this.width) > this.overflow_width_ratio) {
                    this.h.domain([0, ((this.overflow_width_ratio*this.width)/node_width)-1]);
                }
            }

        } else if ((typeof this.node_width.charAt === 'function' ? this.node_width.charAt(this.node_width.length-1) : undefined) === '%') {
            const node_percent = (this.node_width.slice(0, +-2 + 1 || undefined)/100);
            node_width = (node_percent*this.width) / ((this.columns.length+node_percent)-1);

        } else { throw new Error("Unsupported node_width parameter: "+this.node_width); }

        // Set the horizontal range here in case @node_width is a percentage
        this.h.rangeRound([0, this.width-node_width]);

        // Position the nodes
        this.node_g.animate((origin !== 'render') && (origin !== 'resize')).position({
            transform: d=> { let key;
            return 'translate('+this.h(this.nodes[(key=this.key(d))].x)+','+this.v(this.nodes[key].y)+')'; }});
        this.rects.animate((origin !== 'render') && (origin !== 'resize')).position({
            width: node_width,
            height: d=> Math.max(1, this.v(this.nodes[this.key(d)].value))
        });

        // Position the links
        this.paths.animate((origin !== 'render') && (origin !== 'resize')).position({
            d: link=> {
                const node_link = this.node_links[this.link_key(link)];
                const sx = this.h(node_link.sx) + node_width;
                const tx = this.h(node_link.tx);
                switch (this.link_path) {
                    case 'straight':
                        var sy = this.v(node_link.sy);
                        var ty = this.v(node_link.ty);
                        return 'M'+sx+','+sy+
                        'L'+tx+','+ty+
                        'l0,'+this.v(node_link.value)+
                        'L'+sx+','+(sy+this.v(node_link.value))+'Z';
                    case 'curve':
                        // Curves always exit right side of the node and enter the left side
                        var curvature = tx>sx ? this.link_path_curvature : -this.link_path_curvature*4;
                        sy = this.v(node_link.sy + (node_link.value/2));
                        ty = this.v(node_link.ty + (node_link.value/2));
                        var x_interpolator = d3.interpolateRound(sx, tx);
                        return 'M'+sx+','+sy+ // Start of curve
                        'C'+x_interpolator(curvature)+','+sy+ // First control point
                        ' '+x_interpolator(1-curvature)+','+ty+ // Second control point
                        ' '+tx+','+ty;
                    default: throw Error("Unknown link_path option: "+this.link_path);
                }
            },
            'stroke-width': this.link_path === 'curve' ? link=> Math.max(1, this.v(this.node_links[this.link_key(link)].value)) : undefined
        });

        this.links_layer.all.attr('class', 'links '+this.link_path);

        // Position the node labels
        // TODO: optimize to avoid `all.style` overhead for each node.
        if (this.node_labels != null) {
            if (this.node_label_options.orientation !== 'vertical') {
                // Left alight horizontal labels on the left and right align them on the right
                this.node_labels.animate((origin !== 'render') && (origin !== 'resize')).position({
                    y: d=> this.v(this.nodes[this.key(d)].value) / 2,
                    x: d=> this.nodes[this.key(d)].x > (this.h.domain()[1]/2) ? node_width : 0,
                    dx: d=> this.nodes[this.key(d)].x > (this.h.domain()[1]/2) ? '-0.25em' : '0.25em',
                    dy: '0.4em'
                });
                this.nodes_layer.all.classed({
                    'horizontal_labels': true,
                    'vertical_labels': false
                });
                return this.node_labels.all.style({
                    'text-anchor': d=> this.nodes[this.key(d)].x > (this.h.domain()[1]/2) ? 'end' : 'start'});
            } else {
                this.node_labels.animate((origin !== 'render') && (origin !== 'resize')).position({
                    y: node_width / 2,
                    x: d=> -this.v(this.nodes[this.key(d)].value),
                    dx: '0.25em',
                    dy: '0.4em'
                });
                this.nodes_layer.all.classed({
                    'horizontal_labels': false,
                    'vertical_labels': true
                });
                return this.node_labels.all.style({
                    'text-anchor': 'start'});
            }
        }
    }


    _style(style_new){
        // Apply options here in case the user updated them between restyle()'s
        this.node_g.options(this.node_options);
        this.rects.options(this.rect_options);
        if (this.node_labels != null) {
            this.node_labels.options(this.node_label_options);
        }
        this.link_g.options(this.link_options);
        this.paths.options(this.path_options);

        this.nodes_layer.style();
        this.node_g.style(style_new);
        this.rects.style(style_new);
        if (this.node_labels != null) {
            this.node_labels.style(style_new);
        }
        this.links_layer.style();
        this.link_g.style(style_new);
        return this.paths.style(style_new);
    }
});
Clsc3graph.initClass();
        //@link_labels?.style style_new


//##################################################################
// Butterfly
//##################################################################

// Butterfly flow visualization.
//
// This represents a {c3.Sankey Sankey Flow Graph} that can have a _focal_ node.
// The focal node is rendered in the middle and the nodes following
// into it are rendered on the left and the nodes flowing out of it are rendered
// on the right.  The user can select a new node to be the _focal_ by clicking
// on it.  Only the `depth_of_field` levels of input and output nodes are
// rendered to keep the graph comprehensible for large graphs.
//
// @author Douglas Armstrong
// @todo Position nodes that are on both the right and left wings in the middle?
// @todo If nodes are called by the focal node as well as other nodes, ensure
//   that they are positioned in a column based on their depth from the focal.
Clsc3graph = (c3.Sankey.Butterfly = class Butterfly extends c3.Sankey {
    constructor(...args) {
        super(...args);
        this._init = this._init.bind(this);
        this._update = this._update.bind(this);
        this._butterfly_layout = this._butterfly_layout.bind(this);
        this._style = this._style.bind(this);
        this.focus = this.focus.bind(this);
    }

    static initClass() {
        this.version = 0.1;
        this.prototype.type = 'butterfly';
    
        // [Boolean] Enable or disable user navigation of nodes
        this.prototype.navigatable = true;
        // [Number] Number of levels of nodes to visualize to the left and right of the focus node
        this.prototype.depth_of_field = 2;
    }

    _init() {
        super._init(...arguments);
        return this.background.new.on('click', () => this.focus(null));
    }

    _update(origin){
        if (!Array.from(this.data).includes(this.focal)) { this.focal = null; }

        if (this.focal != null) {
            if (origin !== 'focus') { this._update_data(origin); }
            this._butterfly_layout();
        } else {
            super._update(...arguments);
        }

        if (this.navigatable) {
            this.rects.new.on('click', datum=> {
                d3.event.stopPropagation;
                return this.focus(datum);
            });
        }

        return this._style(true);
    }

    _butterfly_layout() {
        const focus_key = this.key(this.focal);
        const focus_node = this.nodes[focus_key];

        // Find all neighboring nodes within the depth_of_field distance and layout their x value
        // TODO: Use breadth-first instead of depth-first to get distance to focal node correct.
        this.current_nodes = {};
        var walk = (key, direction, depth)=> {
            if (this.current_nodes[key]) { return; } // If we already visited this node, then stop walking this path
            const node = this.nodes[key];
            if ((node == null)) { return; } // If this node is missing, then don't walk to it
            this.current_nodes[key] = node; // Record node as visited
            node.x = this.depth_of_field + (depth*direction);
            // If we are still in the depth of field, then continue walking in the same direction
            if (depth < this.depth_of_field) {
                return (Array.from(direction === 1 ? node.target_links : node.source_links)).map((link) =>
                    walk((direction === 1 ? this.link_target : this.link_source)(link), direction, depth+1));
            }
        };
        // First walk to the right finding nodes, then the left
        walk(focus_key, 1, 0);
        delete this.current_nodes[focus_key]; // Remove so we can start again from the focal node when walking left
        walk(focus_key, -1, 0);

        this.h.domain([-0.5, (this.depth_of_field*2) + 0.5]);

        return this._layout('focus');
    }

    _style(style_new){
        super._style(...arguments);
        this.content.all.classed('navigatable', this.navigatable);
        return this.node_g.all.classed('focal', datum=> datum === this.focal);
    }

    // Focus visualization on a specified **focus** node.
    // The graph will then fan out to the left and right of the focal node by `depth_of_field` levels.
    focus(focal){
        if (focal !== this.focal) {
            this.focal = focal;
            this.trigger('focus', this.focal);
            this._update('focus');
            this._draw('focus');
            this.trigger('focusend', this.focal);
        }
        return this;
    }
});
Clsc3graph.initClass();

c3.Butterfly = c3.Sankey.Butterfly;
