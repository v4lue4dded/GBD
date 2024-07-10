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
// c3 Visualization Library
// HTML Table Generation

//##################################################################
// Table
//##################################################################

// A visualization of data using HTML tables.
//
// Like other c3 visualizations, call `redraw()` to update the table when the `data`
// array is changed and call `restyle()` to update the table when styles or classes
// in the various {c3.Selection.Options options} are changed.  If the set of `columns`
// is changed, then please call `render()` to update the table; this flow has not been
// tested yet, but I can fix any issues that come up if this is needed.
//
// ## Events
// * **select** - Triggered when a row is selected/unselected.  The event is called with an argument
//   that is an array of the selections.  Items are references to selected data elements.
//   _single_ select tables are passed with their selection while _multi_ select tables are passed with an array of the selections.
//   Selections are references to items in the data array.
// * **found** - Triggered when a search is performed.  The event is called with the search string,
//   the datum for the row, and the row index.
//   If there was no match, the datum and index will be `null`.  The `match` event is deprecated.
//
// ## Extensibility
// The following members are created which represent {c3.Selection}'s:
// * **table** - The HTML `table`
// * **header** - The HTML table `thead` header
// * **headers** - The individual `th` headers in the header row
// * **body** - The HTML table `tbody` body
// * **rows** - The HTML table `tr` rows
// * **cells** - The HTML table `td` cells
//
// The following additional members are also created:
// * **selections** - [Array] The current table selections.  Items point to entries in the table's `data` array.
//
// @author Douglas Armstrong
(function() {
    let last_search = undefined;
    let last_found = undefined;
    const Clsc3table = (c3.Table = class Table extends c3.Base {
        static initClass() {
            this.version = 0.1;
            this.prototype.type = 'table';
    
            // [Array] Array of data for the table to visualize.
            //   Each element that is defined would be a seperate row in the table.
            this.prototype.data = [];
            // [Function] An optional callback to describe a unique key for each data element.
            //   These may be used to affect performance when updating the dataset and for animations.
            this.prototype.key = undefined;
            // [Function] A callback to define if data elements should be included in the table or not.  For example,
            //   this could be set to a function that returns true for data elements with some non-zero value to cause
            //   elements with a zero value to not be included in the table.
            this.prototype.filter = undefined;
            // [Array<c3.Table.Column>] An array of column objects which describe how to construct the table.
            // Column objects can contain the following members:
            // * **header** [{c3.Selection.Options}] Options to describe the header contents, styles, events, etc.
            //   Use `text` or `html` to define the content for the header.
            //   Column headers are optional.
            // * **cells** [{c3.Selection.Options}] Options to describe the cell contents, styles, events, etc.
            //   Use `text` or `html` to define the cell contents.
            // * **sortable** [Boolean] - Boolean to define if the counter should be user-sortable by clicking on the header.
            // * **value** [Function] - A callback to get the _value_ of the cell for sorting or visualization.
            // * **sort** [Function] - A callback to get the value for sorting, if different then `value`; also sets `sortable` to true.
            // * **sort_ascending** [Boolean] - Sort the rows based on ascending value instead of descending.
            // * **vis** [String] Optional type of visualization for the _value_ of the cells in this column.  Options include:
            //    * _bar_ - The value is represented as a horizontal bar across the cell underlying the content html.
            //      The bars may be styled using _vis_options.styles_.
            // * **total_value** [Number, Function] - Some visualizations, such as _bar_, show their values relative to
            //   some total value.  This number or callback provides for that value.
            //   If not set, the default is to use the sum of values for all the cells in the column.
            // * **vis_options** [{c3.Selection.Options}] Options that may be used by value visualizations.
            //   Using the Table-level vis_options should perform better than column-specific options.
            this.prototype.columns = [];
            // [Boolean, String] Enable the table rows to be selectable based on the value:
            // * `true` - Click to select a single row or ctrl-click on Windows and command-click on OSX to select multiple rows.
            // * "**single**" - A single row can be selected.
            // * "**multi**" - Multiple rows can be selected.
            this.prototype.selectable = false;
            // [Array] Specify any initial row selections as an array of rows.
            this.prototype.selections = undefined;
            // [Boolean] Enable the table rows to be user-sortable.
            // Define the `sortable` property of the column object to enable sorting by that column.
            // The `value` column property should then define a callback to specify the value
            // to be used for sorting.  If you would like a different value for sorting purposes
            // then the `sort` property of the column object can be used.
            // The table can still be sorted with `sort_column` even if the user is not allowed
            // to change how it is sorted with `sortable`.
            this.prototype.sortable = false;
            // [{c3.Table.Column}, String] Specify the initial column to sort the table by.
            // The column object should have the `sort` property set to define a value to sort on.
            // The `sort_column` may be specified either as the column object directly or
            // as a string to lookup the header text or html at render-time.
            // This property will be updated to refer to the current column object being sorted on.
            // `sort_column` can be set to sort the table even if the table and/or column is not
            // `sortable` to allow user-configurable sorting.
            this.prototype.sort_column = undefined;
            // [Number] Limit the number of table rows to the top N
            this.prototype.limit_rows = undefined;
            // [Boolean] Enable control for user paging between multiple pages
            // when the table size is limited with `limit_rows`.
            // The pagination footer will only render if there is more than one page.
            this.prototype.pagination = false;
            // [Number] The curernt page of a paginated table
            this.prototype.page = undefined;
            // [Number] Maximum number of pages to show at a time in the footer pagination selection.
            //   Minimum value is `3`.
            this.prototype.max_pages_in_paginator = 9;
            // [Boolean, Function] Set to enable searching in the footer.
            //   If set to `true`, then the content of all columns will be searched.
            //   Otherwise, it can be set to an accessor function that will be called with the row data and index.
            //   This function should return the string content of the row to be used for searching.
            //   If a match is found the current page is changed so the found row is visible.
            //   The `found` event will be triggered with the search string used.
            //   If a match was found the second and third arguments will be the row data and index of the match,
            //   otherwise they will be `null`.
            //   If a table is both searchable and selectable the event `found` event handler
            //   will default to selecting the row; this may be overriden.
            //   The user may use regular expressions in their search string.
            this.prototype.searchable = false;
            // [Boolean] Allow table to be searchable even if it isn't paginated
            this.prototype.searchable_if_not_paginated = true;
            // [{c3.Selection.Options}] Options for the `table` node.
            this.prototype.table_options = undefined;
            // [{c3.Selection.Options}] Options for the table `thead` header.
            this.prototype.table_header_options = undefined;
            // [{c3.Selection.Options}] Options for the table `th` headers.  Callbacks are called with two arguments:
            // The first is the column object and the second is the column index.
            this.prototype.header_options = undefined;
            // [{c3.Selection.Options}] Options for the table `caption` footer used for pagination.
            this.prototype.footer_options = undefined;
            // [{c3.Selection.Options}] Options for the table `tbody`.
            this.prototype.table_body_options = undefined;
            // [{c3.Selection.Options}] Options for the table `tr` rows.  Callbacks are called with two arguments.
            // The first is the data element, the second is the row index.
            //
            // A `column_options` options could be created using `col` to specify options for each column instead
            // of manually specifying in each column object in `columns`.
            // If this is needed, just let me know.
            this.prototype.row_options = undefined;
            // [{c3.Selection.Options}] Options for the table `td` cells.  Callbacks are called with three arguments.
            // The first is the data element, the second is the column index, and the third is the row index.
            this.prototype.cell_options = undefined;
            // [{c3.Selection.Options}] Options for any `vis` visualizations, such as inline bar charts.
            // Callbacks are called with the first argument as the data element, the second as
            // the column index, and the third as the row index.
            this.prototype.vis_options = undefined;
    
            // API for searching the table
            last_search = "";
            last_found = -1;
        }

        constructor() {
            super(...arguments);
            this._init = this._init.bind(this);
            this._update_headers = this._update_headers.bind(this);
            this._update = this._update.bind(this);
            this._style = this._style.bind(this);
            this.sort = this.sort.bind(this);
            this.highlight = this.highlight.bind(this);
            this.select = this.select.bind(this);
            this.search = this.search.bind(this);
            this.find = this.find.bind(this);
        }

        _init() {
            // Create the table node
            this.table = c3.select(d3.select(this.anchor),'table').singleton();
            if (this.table_options == null) { this.table_options = {}; }
            if (this.table_options.styles == null) { this.table_options.styles = {}; }
            if (this.table_options.styles.width == null) { this.table_options.styles.width = '100%'; }
            this.table.options(this.table_options).update();

            // Create the Header
            this.header = this.table.inherit('thead').inherit('tr');
            this.header.options(this.table_header_options).update();

            // Create the Body
            this.body = this.table.inherit('tbody');
            this.body.options(this.table_body_options).update();

            // Prepare the Columns
            if (this.next_column_key == null) { this.next_column_key = 0; }
            for (var column of Array.from(this.columns)) {
                if (column.key == null) { column.key = this.next_column_key++; }
                // Default text to "" so contents are cleared so we don't append duplicate arrows and div.vis nodes.
                if (column.cells == null) { column.cells = {}; } if (column.cells.text == null) { column.cells.text = ""; }
                if (column.sortable == null) { column.sortable = (column.sort != null); }
                if (column.value == null) { column.value = column.sort; }
                if (column.sort == null) { column.sort = column.value; }
                if (column.sortable && (column.sort == null)) {
                    throw "column.sort() or column.value() not defined for a sortable column";
                }
                if (column.vis && (column.value == null)) {
                    throw "column.value() not defined for a column with a column.vis visualization";
                }
            }

            // Find the initial column for sorting if specified as a string
            if ((this.sort_column != null) && (typeof this.sort_column === 'string')) {
                this.sort_column = this.columns.find(column=> {
                    return (this.sort_column === __guard__(column != null ? column.header : undefined, x => x.text)) || (this.sort_column === __guard__(column != null ? column.header : undefined, x1 => x1.html));
                });
                if ((this.sort_column == null)) {
                    throw "sort_column string name specified, but no column with that header text/html was found.";
                }
            }

            // Searchable and Selectable tables default to selecting matches
            if (this.searchable && this.selectable && !(this.handlers != null ? this.handlers.found : undefined) && !(this.handlers != null ? this.handlers.match : undefined)) { // `match` is Deprecated
                this.on('found', (str, data, i) => this.select((data != null) ? [data] : []));
            }

            this._update_headers();

            // Create the default set of selections here instead of the default
            // prototype so that we can mutate it on a per-instance basis.
            return this.selections != null ? this.selections : (this.selections = []);
        }


        _update_headers() {
            const self = this;
            // Update the headers
            this.headers = this.header.select('th').bind(
                this.columns.some(column => column.header != null) ? this.columns : [],
                column => column.key).options(this.header_options, (column => column.header != null ? column.header : {})).update();
            this.headers.all.on('click.sort', column=> { if (this.sortable && column.sortable) { return this.sort(column); } });
            if (this.sortable) { return this.headers.all.each(function(column){ if (column === self.sort_column) {
                const title = d3.select(this);
                return title.html(title.html()+`<span class='arrow' style='float:right'>${column.sort_ascending ? '▲' : '▼'}</span>`);
            }
             }); }
        }


        _update(origin){
            let cell_contents, column;
            let i, d;
            const self = this;
            // Prepare the column totals
            for (column of Array.from(this.columns)) {
                if (column.vis) {var left;
                
                    column.value_total = (left = (typeof column.total_value === 'function' ? column.total_value() : undefined)) != null ? left : column.total_value;
                    if ((column.value_total == null)) { // Default total_value is the sum of all values
                        column.value_total = 0;
                        for (var datum of Array.from(this.data)) { column.value_total += column.value(datum); }
                    }
                }
            }

            // Filter data
            this.current_data = (this.filter != null) ? ((() => {
                const result = [];
                for (i = 0; i < this.data.length; i++) {
                    d = this.data[i];
                    if (this.filter(d,i)) {
                        result.push(d);
                    }
                }
                return result;
            })()) : this.data;

            // Re-sort the data
            if (this.sort_column != null) {
                // Copy array so our sorting doesn't corrupt the user's copy
                if ((this.filter == null)) { this.current_data = this.current_data.slice(); }
                c3.array.sort_up(this.current_data, this.sort_column.sort);
                if (!this.sort_column.sort_ascending) { this.current_data.reverse(); }
            }

            // Update the rows
            const data = (() => {
                if (!this.limit_rows) { return this.current_data; } else {
                this.limit_rows = Math.floor(this.limit_rows);
                if (isNaN(this.limit_rows)) { throw Error("limit_rows set to non-numeric value: "+this.limit_rows); }
                this.page = Math.max(1, Math.min(Math.ceil(this.current_data.length/this.limit_rows), this.page != null ? this.page : 1));
                return this.current_data.slice(this.limit_rows*(this.page-1), +((this.limit_rows*this.page)-1) + 1 || undefined);
            }
            })();
            this.rows = this.body.select('tr').bind(data, this.key);
            this.rows.options(this.row_options).update();
            if (this.key != null) { this.rows.all.order(); }

            // Update the cells
            this.cells = this.rows.select('td').bind((d=> ((() => {
                const result1 = [];
                for (column of Array.from(this.columns)) {                     result1.push(d);
                }
                return result1;
            })())), (d,i)=> (this.columns[i] != null ? this.columns[i].key : undefined));
            if (!this.columns.some(column => column.vis != null)) {
                cell_contents = this.cells;
            } else {
                // Cells user options are actually applied to a nested span for proper div.vis rendering
                this.vis = this.cells.inherit('div.vis');
                this.vis.options(this.vis_options, ((d,i)=> this.columns[i].vis_options)).update();
                cell_contents = this.vis.inherit('span');

                this.vis.all.each(function(d,i){
                    column = self.columns[i % self.columns.length];
                    switch (column.vis) {
                        case 'bar':
                            return d3.select(this)
                                .classed('bar', true)
                                .style('width', ((column.value(d)/column.value_total)*100)+'%');
                        case 'color':
                            // Retrieve domain and range from column.vis_options
                            var domain = column.vis_options.styles.domain;
                            var range = column.vis_options.styles.range;
                            
                            // Create color scale using the retrieved domain and range
                            var colorScale = d3.scale.linear()
                                               .domain(domain)
                                               .range(range);
                            
                            // Apply color based on data value
                            return d3.select(this).style('background-color', colorScale(column.value(d)));                      
                        default:
                            return d3.select(this).attr({
                                class: 'vis',
                                style: ''
                            });
                    }
                });
            }

            cell_contents.options(this.cell_options, ((d,i)=> this.columns[i].cells)).update();
            this.cells.options(this.cell_options, ((d,i)=> this.columns[i].cells)); // For use in _style()

            // Selectable
            if (this.selectable) {
                (origin === 'render' ? this.rows.all : this.rows.new).on('click.select', item=> {
                    return this.select(c3.Table.set_select(this.selections, item,
                        (this.selectable === 'multi') || ((this.selectable === true) && (d3.event.ctrlKey || d3.event.metaKey)))
                    );
                });
                this.highlight();
            } else if (origin === 'render') { this.rows.all.on('click.select', null); }

            // Footer
            this.footer = this.table.select('caption');
            const rows_limited = !!this.limit_rows && (this.current_data.length > this.limit_rows);
            const paginate = this.pagination && rows_limited;
            const searchable = this.searchable && (this.searchable_if_not_paginated || rows_limited);
            if (searchable || paginate) {
                this.footer.singleton().options(this.footer_options).update();

                // Pagination
                const paginator = this.footer.select('span.pagination', ':first-child');
                if (paginate) {
                    paginator.singleton();
                    const num_pages = Math.ceil(this.current_data.length / this.limit_rows);
                    this.max_pages_in_paginator = Math.floor(Math.max(this.max_pages_in_paginator, 3));
                    const left_pages = Math.ceil((this.max_pages_in_paginator-3) / 2);
                    const right_pages = Math.floor((this.max_pages_in_paginator-3) / 2);

                    // Previous page button
                    const prev_button = paginator.select('span.prev.button').singleton();
                    prev_button.all
                        .text('◀')
                        .classed('disabled', this.page <= 1)
                        .on('click', () => { this.page--; return this.redraw(); });

                    // Prepare the set of pages to show in the paginator
                    const pages = [
                        1,
                        ...Array.from((num_pages > 2 ? 
                         __range__(Math.max(2, Math.min(this.page-left_pages, num_pages-1-left_pages-right_pages)), Math.min(num_pages-1, Math.max(this.page+right_pages, 2+left_pages+right_pages)), true) 
                         : [])),
                        num_pages
                    ];
                    // Add ellipses if there are too many page options to show
                    if ((pages[1]-pages[0]) > 1) { pages.splice(1,0,'…'); }
                    if ((pages[pages.length-1]-pages[pages.length-2]) > 1) { pages.splice(pages.length-1,0,'…'); }

                    // Render the pages
                    const page_buttons = paginator.select('ul').singleton().select('li').bind(pages);
                    page_buttons.all
                        .text((p, i) => p)
                        .classed('active', p=> p === this.page)
                        .classed('disabled', p=> p === '…')
                        .on('click', p=> { this.page=p; return this.redraw(); });

                    // Next page button
                    const next_button = paginator.select('span.next.button').singleton();
                    next_button.all
                        .text('▶')
                        .classed('disabled', this.page >= (this.current_data.length / this.limit_rows))
                        .on('click', () => { this.page++; return this.redraw(); });
                } else { paginator.remove(); }

                // Searchable
                const search_control = this.footer.select('span.search');
                if (searchable) {
                    let search_input;
                    search_control.singleton();
                    search_control.inherit('span.button').new
                        .text('🔎')
                        .on('click', () => {
                            search_input.node().classList.remove('notfound');
                            if (!this.find(search_input.node().value)) {
                                return search_input.node().classList.add('notfound');
                            }
                    });
                    return search_input = search_control.inherit('input').new
                        .attr('type', 'text')
                        .on('keydown', function() {
                            this.classList.remove('notfound');
                            if (this.value && (d3.event.keyCode === 13)) { // When user presses ENTER
                                return search_control.select('.button').node().click();
                            }
                    });
                } else { return search_control.remove(); }
            } else { return this.footer.remove(); }
        }


        _style(style_new){
            const self = this;
            this.table.style().all.classed({
                'c3': true,
                'table': true,
                'sortable': this.sortable,
                'selectable': this.selectable,
                'sorted': (this.sort_column != null),
                'single_select': this.selectable === 'single',
                'multi_select': this.selectable === 'multi',
                'paginated': this.pagination && this.limit_rows && (this.current_data.length > this.limit_rows),
                'searchable': !!this.searchable
            });
            if (this.class != null) {
                for (var klass of Array.from(this.class.split(' '))) { this.table.all.classed(klass, true); }
            }

            this.header.style();
            this.headers.style(style_new).all.classed({
                'sortable': !this.sortable ? false : column => column.sort != null,
                'sorted': d=> d===this.sort_column
            });

            this.body.style();
            this.rows.style(style_new);
            const sort_column_i = this.columns.indexOf(this.sort_column);
            this.cells.style(style_new && (this.key != null)).all.classed({
                'sorted'(d,i){ return i === sort_column_i; }});
            return (this.vis != null ? this.vis.style(style_new && (this.key != null)) : undefined);
        }

        // Sort the table
        // @param column [column] A reference to the column object to sort on
        // @param ascending [Boolean] True to sort top to bottom based on ascending values,
        //   otherwise alternate on subsequent calls to sorting on the same column.
        sort(column, ascending) { if (column.sort) {
            if (ascending != null) { column.sort_ascending = ascending;
            } else if (this.sort_column===column) { column.sort_ascending = !column.sort_ascending; }
            this.sort_column = column;
            this.page = 1;
            this._update_headers();
            return this.redraw('sort');
        } }

        // Update the visual selection in the table without triggering selection event
        // @param selections [Array] An array of items to select referencing items in the data array
        highlight(selections){
            if (selections == null) { ({
                selections
            } = this); }
            this.selections = selections;
            this.rows.all.classed('selected', !this.selections.length ? false : d=> (Array.from(this.selections).includes(d)));
            return this.rows.all.classed('deselected', !this.selections.length ? false : d=> !(Array.from(this.selections).includes(d)));
        }

        // Select items in the table and trigger the selection event
        // @param selections [Array] An array of items to select referencing items in the data array
        select(selections){
            if (selections == null) { ({
                selections
            } = this); }
            this.selections = selections;
            this.highlight();
            return this.trigger('select', this.selections);
        }
        // Find will find the specified string value in the table and set the current page for it to be visible
        // This method will not trigger any events, unlike {c3.Table#find find()}.
        // @param value [String] string to search for
        // @return An array of the data element found and its index in the data array or null if not found
        search(value){
            let d, i;
            if (!value) { return; }
            const re = RegExp(value, 'i'); // Case insensitive regular expression
            if (value !== last_search) { // if already found, find the next one
                last_found = -1;
                last_search = value;
            }
            // If @searchable doesn't specify an accessor, then search all column contents
            const content = (() => {
                if (typeof this.searchable === 'function') { return this.searchable; } else {
                let left, left1;
                const column_contents = (Array.from(this.columns).map((column) => c3.functor((left = (left1 = column.cells.html != null ? column.cells.html : column.cells.text) != null ? left1 : this.cell_options.html) != null ? left : this.cell_options.text)));
                return (d, i) => (Array.from(column_contents).map((column_content, j) => column_content(d,i,j))).join(' ');
            }
            })();
            for (i = 0; i < this.current_data.length; i++) {
                d = this.current_data[i];
                if (i>last_found) {
                    if (re.test(content(d,i))) {
                        last_found = i;
                        var new_page = Math.ceil((i+1)/this.limit_rows);
                        if (new_page !== this.page) { this.page=new_page; this.redraw(); }
                        return [d, i];
                    }
                }
            }
            last_found = -1;
            return null;
        }

        // Search will find a string in the table, same as {c3.Table#search search()} except
        // that it will also trigger the `found` event
        // @param value [String] string to search for
        // @return An array of the data element found and its index in the data array
        find(value){
          const ret = this.search(value);
          this.trigger('found', value, ...Array.from(((ret != null) ? ret : [null, null])));
          this.trigger('match', value, ...Array.from(((ret != null) ? ret : [null, null]))); // Deprecated
          return ret;
      }

        // Helper logic for selecting an item in a multiple-select list with a click or ctrl-click
        // @param set [Array] An array of items that represents the current selection
        // @param item [Object] A new item to add or remove from the current selection
        // @param multi_select [Boolean] Indicate if multiple selections are allowed
        // @return [Array] This returns the new set, but also modifys the set passed in, so old references are still valid
        static set_select(set, item, multi_select){
            if ((set == null)) { return [item];
            } else if (multi_select) {
                if (Array.from(set).includes(item)) { c3.array.remove_item(set, item);
                } else { set.push(item); }
            } else { switch (set.length) {
                case 0: set.push(item); break;
                case 1:
                    if (Array.from(set).includes(item)) { set.length=0;
                    } else { set.length=0; set.push(item); }
                    break;
                default: set.length=0; set.push(item);
            } }
            return set;
        }
    });
    Clsc3table.initClass();
    return Clsc3table;
})();

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