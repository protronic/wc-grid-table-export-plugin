const XLSX = require('xlsx');
require('./style.css');
const {saveAs} = require('file-saver');

function getTextFromHTML(html){
    if(html){
        let div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    } else {
        return html;
    }
}

function getTextFromHTMLForObject(obj){
    let newObj = {};
    Object.keys(obj).forEach(key => {
        newObj[key] = getTextFromHTML(obj[key]);
    });
    return newObj;
}

function getTextFromHTMLForObjectArray(arr){
    return arr.map(obj => getTextFromHTMLForObject(obj));
}

/**
 * defines all possible targets and implements their behaviour.
 */
const exportTargets = [
    {
        name: 'excel',
        targetFn: (table, data) => {
            const worksheet = XLSX.utils.json_to_sheet(getTextFromHTMLForObjectArray(data), {header: table.headerAll});
            worksheet["!cols"] = table.headerAll.map(header => {
                if (table.hiddenColumns.includes(header))
                    return {hidden: true}
                // wch: data.reduce((w, r) => Math.max(r, w[header].length), 10),
            });
            let workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
            // console.log(worksheet["!cols"]);
            // console.log(workbook);
            XLSX.writeFileXLSX(workbook, `${Date.now()}.xlsx`);
        }
    },
    { name: 'csv', targetFn: (table, data) => { 
        const worksheet = XLSX.utils.json_to_sheet(data, {header: table.headerAll});
        let csvString = XLSX.utils.sheet_to_csv(worksheet, {FS: ';'});
        saveAs(new Blob([csvString], {type: "text/csv;charset=utf-8"}), `${Date.now()}.csv`);
    } }, 
    { name: 'json', targetFn: (table, data) => { saveAs(new Blob([JSON.stringify(data)], {type: "application/json"}), `${Date.now()}.json`) } },
];

/**
 * defines all possible sources and implements their behaviour.
 */
const exportSources = [
    { name: 'original data', sourceFn: (table) => table.data },
    { name: 'sorted data', sourceFn: (table) => table.sortedData },
    { name: 'formatted data', sourceFn: (table) => table.formattedData },
    { name: 'filtered data', sourceFn: (table) => table.filteredData },
    { name: 'paginated data', sourceFn: (table) => table.pageinatedData },
];

/**
 * load options, that are given as attributes on the table. Mainly default behaviour.
 * @typedef {{defaultSource: string, defaultTarget: string}} DefaultExportOptions
 * @param {TableComponent} table 
 * @returns {DefaultExportOptions}
 */
function loadExportDefaultOptions(table) {
    let defaultSource = table.getAttribute('export-default-source');
    let defaultTarget = table.getAttribute('export-default-target');
    return {
        defaultSource: defaultSource ? defaultSource : 'filtered data',
        defaultTarget: defaultTarget ? defaultTarget : 'excel',
    };
}

/**
 * generate the button, which calls the export menu.
 * @this {TableComponent} 
 * @returns {HTMLButtonElement}
 */
function createExportMenuButton(table) {
    let boundOnExportMenuButtonHandler = onExportMenuButtonHandler.bind(null, table);
    let but = document.createElement('div');
    but.classList.add('wgt-footer_cell', 'wgt-cell', 'footer-button-down', 'footer-button');
    but.textContent = "export";
    but.addEventListener("click", boundOnExportMenuButtonHandler);
    return but;
}

/**
 * create a container with the menu for exporting the table data.
 * @param {TableComponent} table
 * @returns {HTMLDivElement}
 */
function createExportMenuContainer(table) {
    let { defaultSource, defaultTarget } = loadExportDefaultOptions(table);
    return createExportOuterDiv(table, defaultSource, defaultTarget);
}

function createExportOuterDiv(table, defaultSource, defaultTarget) {
    console.log(table);
    let outerDiv = document.createElement('div');
    outerDiv.id = `export_menu_${table.id}`;
    outerDiv.classList.add('outer-popup', 'export-menu', 'hidden');
    outerDiv.appendChild(createExportInnerDiv(table, defaultSource, defaultTarget));
    outerDiv.addEventListener('click', (e) => (console.log('outer click'), outerDiv.classList.add('hidden')));
    table.elements.exportMenuOuter = outerDiv;
    return outerDiv;
}

function createExportInnerDiv(table, defaultSource, defaultTarget) {
    let innerDiv = document.createElement('div');
    innerDiv.classList.add('table-popup', 'export-menu');
    innerDiv.appendChild(createExportOptionsForm(table, defaultSource, defaultTarget));
    innerDiv.addEventListener('click', (e) => e.stopPropagation());
    table.elements.exportMenuInner = innerDiv;
    return innerDiv;
}

function createExportOptionsForm(table, defaultSource, defaultTarget) {
    let form = document.createElement('form');
    form.appendChild(createSourceOptions(defaultSource));
    form.appendChild(createTargetOptions(defaultTarget));
    form.appendChild(createExportButton(table));
    table.elements.exportForm = form;
    return form;
}

function createExportButton(table) {
    let boundExportButtonHandler = onExportButtonHandler.bind(null, table);
    let but = document.createElement('button');
    but.textContent = 'export';
    but.setAttribute('type', 'button');
    but.addEventListener('click', boundExportButtonHandler);
    return but;
}

function createSourceOptions(defaultSource) {
    let div = document.createElement('div');
    let label = document.createElement('label');
    let select = document.createElement('select');
    label.textContent = 'Source:';
    select.classList.add('source-select');
    exportSources.forEach((index, i) => {
        let source = exportSources[index];
        let sourceOption = document.createElement('option');
        if (defaultSource == source) sourceOption.classList.add('selected');
        sourceOption.textContent = index.name;
        sourceOption.value = i;
        select.appendChild(sourceOption);
    });
    div.appendChild(label);
    div.appendChild(select);
    return div;
}

function createTargetOptions(defaultTarget) {
    let div = document.createElement('div');
    let label = document.createElement('label');
    let select = document.createElement('select');
    label.textContent = 'Target:';
    select.classList.add('target-select');
    exportTargets.forEach((index, i) => {
        let target = exportSources[index];
        let targetOption = document.createElement('option');
        if (defaultTarget == target) targetOption.classList.add('selected');
        targetOption.textContent = index.name;
        targetOption.value = i;
        select.appendChild(targetOption);
    });
    div.appendChild(label);
    div.appendChild(select);
    return div;
}

function onExportButtonHandler(table, event) {
    let selectedTargetIndex = table.elements.exportForm.querySelector('select.target-select').value;
    let currentTarget = exportTargets[selectedTargetIndex];

    let selectedSourcceIndex = table.elements.exportForm.querySelector('select.source-select').value;
    let currentSource = exportSources[selectedSourcceIndex];

    let data = currentSource.sourceFn(table);
    console.log({ source: currentSource.name, target: currentTarget.name });
    currentTarget.targetFn(table, data);
}

/**
 * Handler for export menu button.
 * @param {TableComponent} table 
 * @param {MouseEvent} event 
 */
function onExportMenuButtonHandler(table, event) {
    table.elements.exportMenuOuter.classList.toggle('hidden');
    //TODO: implement
}

function addButtonToFooter(table) {
    // let menuContainer = createExportMenuContainer(table);
    table.appendChild(createExportMenuContainer(table));
    let exportMenuButton = createExportMenuButton(table);
    console.log(exportMenuButton);
    table.elements.footer.appendChild(exportMenuButton);
}

/**
 * //TODO: declare type: @typedef {{}} ExportPlugin
 * 
 * 
 */
const ExportPlugin = {
    name: "ExportPlugin",
    exec: function(table) {
        addButtonToFooter(table);
    },
    type: "ui",
    tableExtensions: {},
    addFooterButton: addButtonToFooter,
}

module.exports = {
    ExportPlugin
}