import _ from 'lodash'

import faker from 'faker'

import agGrid from 'ag-grid'

const rowData = _.times(2, n => ({
    _id: Random.id(),
    name: faker.lorem.words(),
    type: faker.lorem.word(),

    todos: _.times(_.random(3, 10), n => ({
        _id: Random.id(),
        content: faker.lorem.sentence(),
    })),

    members: _.times(_.random(3, 10), n => ({
        _id: Random.id(),
        name: faker.name.findName(),
        gender: _.sample(['male', 'female']),
    })),
}))

var latestClicked = null

var masterColumnDefs = [
    { headerName: 'name', field: 'name', },

    { headerName: 'members', field: 'members', cellRenderer: 'group', cellRendererParams: {
        innerRenderer: function(params) {
            return params.data.members.length
        }
    } },

    { headerName: 'todos', field: 'todos', cellRenderer: 'group', cellRendererParams: {
        innerRenderer: function(params) {
            return params.data.todos.length
        },
    } },

    { headerName: 'type', field: 'type', },
];

function DetailPanelCellRenderer() {}

DetailPanelCellRenderer.prototype.init = function(params) {
    console.log(latestClicked)
    // console.log(params.node.parent)
    // trick to convert string of html into dom object
    var eTemp = document.createElement('div');
    eTemp.innerHTML = this.getTemplate(params);
    this.eGui = eTemp.firstElementChild;

    this.setupDetailGrid(params.data.members);
    this.consumeMouseWheelOnDetailGrid();
};

DetailPanelCellRenderer.prototype.setupDetailGrid = function(callRecords) {

    var detailColumnDefs = [
        {headerName: 'name', field: 'name', cellClass: 'call-record-cell'},
        { headerName: 'gender', field: 'gender', cellClass: 'call-record-cell' },
    ];

    this.detailGridOptions = {
        enableSorting: true,
        enableFilter: true,
        enableColResize: true,
        rowData: callRecords,
        columnDefs: detailColumnDefs,
        onGridReady: function(params) {
            setTimeout( function() { params.api.sizeColumnsToFit(); }, 0);
        }
    };

    var eDetailGrid = this.eGui.querySelector('.full-width-grid');
    new agGrid.Grid(eDetailGrid, this.detailGridOptions);
};

DetailPanelCellRenderer.prototype.getTemplate = function(params) {

    var template =
        '<div class="full-width-panel">' +
        '  <div class="full-width-grid"></div>' +
        '</div>';``

    return template;
};

DetailPanelCellRenderer.prototype.getGui = function() {
    return this.eGui;
};

DetailPanelCellRenderer.prototype.destroy = function() {
    this.detailGridOptions.api.destroy();
};

// if we don't do this, then the mouse wheel will be picked up by the main
// grid and scroll the main grid and not this component. this ensures that
// the wheel move is only picked up by the text field
DetailPanelCellRenderer.prototype.consumeMouseWheelOnDetailGrid = function() {
    var eDetailGrid = this.eGui.querySelector('.full-width-grid');

    var mouseWheelListener = function(event) {
        event.stopPropagation();
    };

    // event is 'mousewheel' for IE9, Chrome, Safari, Opera
    eDetailGrid.addEventListener('mousewheel', mouseWheelListener);
    // event is 'DOMMouseScroll' Firefox
    eDetailGrid.addEventListener('DOMMouseScroll', mouseWheelListener);
};

var masterGridOptions = {
    columnDefs: masterColumnDefs,
    rowData: rowData,
    enableSorting: true,
    enableColResize: true,
    enableFilter: true,

    onCellClicked(params) {
        latestClicked = params.colDef
    },

    onCellDoubleClicked(params) {
        latestClicked = params.colDef
    },

    onGridReady: function(params) {
        params.api.sizeColumnsToFit();
    },
    isFullWidthCell: function(rowNode) {
        return rowNode.level === 1;
    },

    // see ag-Grid docs cellRenderer for details on how to build cellRenderers

    fullWidthCellRenderer: DetailPanelCellRenderer,
    getRowHeight: function(params) {
        var rowIsDetailRow = params.node.level === 1;
        // return 100 when detail row, otherwise return 25
        return rowIsDetailRow ? 300 : 25;
    },

    doesDataFlower(data) {
        return true
    },
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#test');
    new agGrid.Grid(gridDiv, masterGridOptions);
});
