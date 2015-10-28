var headers = ["Book", "Auther", "Language", "Published", "Sales"];

var data = [
    ["The Lord of the Rings", "J. R. R. Tolkien", "English", "1954–1955", "150 million"],
    ["Le Petit Prince (The Little Prince)", "Antoine de Saint-Exupéry", "French", "1943", "140 million"],
    ["Harry Potter and the Philosopher's Stone", "J. K. Rowling", "English", "1997", "107 million"],
    ["And Then There Were None", "Agatha Christie", "English", "1939", "100 million"],
    ["Dream of the Red Chamber", "Cao Xueqin", "Chinese", "1754–1791", "100 million"],
    ["The Hobbit", "J. R. R. Tolkien", "English", "1937", "100 million"],
    ["She: A History of Adventure", "H. Rider Haggard", "English", "1887", "100 million"]
];

var Excel = React.createClass({
    //for debugging purpose
    displayName: 'Excel',

    //keep the originall data so that user can get back the whole table after canceling searching
    _preSearchData: null,

    getInitialState: function() {
        return {
            data: this.props.initialData,
            sortBy: null,
            descending: false,
            edit: null,
            search: false
        };
    },

    propTypes: {
        headers: React.PropTypes.arrayOf(
            React.PropTypes.string
        ),
        initialData: React.PropTypes.arrayOf(
            React.PropTypes.arrayOf(
                React.PropTypes.string
            )
        )
    },

    _sort: function(e) {
        var column = e.target.cellIndex;
        var descending = (this.state.sortBy === column) && (!this.state.descending);

        //get a copy of data... Since we are using props to initiate state, then the props should be immutable ehehehe....
        var data = this.state.data.slice();

        data.sort(function(a, b) {
            return descending ? a[column] > b[column] : a[column] < b[column];
        });

        this.setState({
            data: data,
            sortBy: column,
            descending: descending
        });
    },

    _showEditor: function(e) {
        this.setState({
            edit: {
                row: parseInt(e.target.dataset.row, 10),
                cell: e.target.cellIndex
            }
        });
    },

    _save: function(e) {
        e.preventDefault();
        var input = e.target.firstChild;
        var data = this.state.data.slice();
        data[this.state.edit.row][this.state.edit.cell] = input.value;

        this.setState({
            data: data,
            edit: null
        });
    },

    _toggleSearch: function() {
        if (this.state.search === true) {
            this.setState({
                data: this._preSearchData,
                search: false
            });
            this._preSearchData = null;
        } else {
            this._preSearchData = this.state.data;
            this.setState({
                search: true
            });
        }
    },

    _search: function(e) {
        var needle = e.target.value.toLowerCase();
        if (!needle) {
            this.setState({
                data: this._preSearchData
            });
            return;
        }

        var idx = e.target.dataset.idx;
        var searchData = this._preSearchData.filter(function(row) {
            return row[idx].toString().toLowerCase().indexOf(needle) > -1;
        });
        this.setState({
            data: searchData
        });
    },


    _download: function(format, e) {
        var contents = format === 'json' ? JSON.stringify(this.state.data) : this.state.data.reduce(function(result, row) {
        	return result + row.reduce(function(rowResult, cell, idx) {
        		return rowResult += '"' + cell.replace(/"/g, '""') + '"' + (idx < row.length ? ',' : '');
        	}, '') + '\n';
        }, '');

        var URL = window.URL || window.webkitURL;
        var blob = new Blob([contents], {type: 'text/' + format});
        e.target.href = URL.createObjectURL(blob);
        e.target.download = 'data.' + format;
    },

    _renderToolbar: function() {

        return (
            <div className="toolbar">
                <button onClick={this._toggleSearch} className='toolbar'>search</button>
                <a onClick={this._download.bind(this, 'json')} href="data.json">Export JSON</a>
                <a onClick={this._download.bind(this, 'csv')} href="data.csv">Export CSV</a>
            </div>
        );
    },

    _renderSearch: function() {
        if (!this.state.search) {
            return null;
        }


        return (
            <tr onChange={this._search}>
                {
                    this.props.headers.map(function(_ignore, idx) {
                        return (
                            <td key={idx}>
                                <input type="text" data-idx={idx} />
                            </td>
                        );
                    })
                }
            </tr>
        );
    },

    _renderTable: function() {
        var self = this;

        return (
            <table>
                <thead onClick={this._sort}>
                    <tr>
                        {
                            this.props.headers.map((function(title, idx) {
                                if (this.state.sortBy === idx) {
                                    title += this.state.descending ? ' \u2191' : ' \u2193';
                                }
                                return <th key={idx}>{title}</th>;
                            }).bind(this))
                        }
                    </tr>
                </thead>
                <tbody onDoubleClick={this._showEditor}>
                    {
                        this._renderSearch(),
                        this.state.data.map(function(row, rowidx) {
                            return (
                                <tr key={rowidx}>
                                    {
                                        row.map(function(cell, idx) {
                                            var content = cell;
                                            var edit = self.state.edit;
                                            if (edit && edit.row === rowidx && edit.cell === idx) {
                                                content = <form onSubmit={self._save}>
                                                    <input type="text" defaultValue={content} />
                                                </form>;
                                            }

                                            return <td key={idx} data-row={rowidx}>{content}</td>
                                        })
                                    }
                               </tr>
                            );
                        })
                    }
                </tbody>
            </table>
        );
    },

    render: function() {
        return (
            <div>
                {this._renderToolbar(),
                this._renderTable()}
            </div>
        );
    }
});

ReactDOM.render(
    React.createElement(Excel, {
        headers: headers,
        initialData: data
    }),
    document.getElementById("app")
);
