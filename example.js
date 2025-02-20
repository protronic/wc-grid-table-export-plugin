const {ExportPlugin} = require("./index.js");
const { defineCustomElement } = require('wc-grid-table');

defineCustomElement();

let table = document.createElement('wc-grid-table');

// table.setAttribute('marker-identifierfield', 'Unternehmen');
// table.setAttribute('marker-databasetable', 'Example2Test');

table.registerPlugin(ExportPlugin);

fetch('../data.json')
    .then(response => response.json())
    .then(data => (console.log(data), data))
    .then(data => setTimeout(() => table.setData(data.map(row => row)), 0));

document.addEventListener("DOMContentLoaded", function(event) {
    document.querySelector("#con").append(table);
});