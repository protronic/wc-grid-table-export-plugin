/**
 * defines all possible targets and implements their behaviour.
 */
const exportTargets = {
    excel: (data) => {}, //TODO: implement
    csv: (data) => {}, //TODO: implement 
    json: (data) => {}, //TODO: implement
};

/**
 * defines all possible sources and implements their behaviour.
 */
const exportSources = {
    'original data': (table) => table.data,
    'sorted data': (table) => table.sortedData,
    'formatted data': (table) => table.formattedData,
    'filtered data': (table) => table.filteredData,
    'paginated data': (table) => table.pageinatedData,
};

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
function createExportMenuButton() {
    let boundOnExportMenuButtonHandler = onExportMenuButtonHandler.bind(null, this);
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
    let outerDiv = document.createElement('div');
    outerDiv.classList.add('outer-popup', 'export-menu', 'hidden');
    outerDiv.appendChild(createExportInnerDiv(table, defaultSource, defaultTarget));
    table.elments.exportMenuOuter = outerDiv;
    return outerDiv;
}

function createExportInnerDiv(table, defaultSource, defaultTarget) {
    let innerDiv = document.createElement('div');
    innerDiv.classList.add('popup', 'export-menu');
    innerDiv.appendChild(createExportOptionsForm(table, defaultSource, defaultTarget));
    table.elments.exportMenuInner = innerDiv;
    return innerDiv;
}

function createExportOptionsForm(table, defaultSource, defaultTarget) {
    let form = document.createElement('form');
    form.appendChild(createSourceOptions(sourceSelect, defaultSource));
    form.appendChild(createTargetOptions(targetSelect, defaultTarget));
    form.appendChild(createExportButton(table));
    table.elements.exportForm = form;
    return form;
}

function createExportButton(table) {
    let boundExportButtonHandler = onExportButtonHandler.bind(null, table);
    let but = document.createElement('button');
    but.setAttribute('type', 'button');
    but.addEventListener('click', boundExportButtonHandler);
    return but;
}

function createSourceOptions(defaultSource) {
    let select = document.createElement('select');
    Reflect.ownKeys(exportSources).forEach(source => {
        let sourceOption = document.createElement('option');
        if (defaultSource == source) sourceOption.classList.add('selected');
        select.appendChild(sourceOption);
    });
    return select;
}

function createTargetOptions(defaultTarget) {
    let select = document.createElement('select');
    Reflect.ownKeys(exportTargets).forEach(target => {
        let targetOption = document.createElement('option');
        if (defaultTarget == target) targetOption.classList.add('selected');
        select.appendChild(targetOption);
    });
    return select;
}

function onExportButtonHandler(table, event) {
    //TODO: implement
}

/**
 * Handler for export menu button.
 * @param {TableComponent} table 
 * @param {MouseEvent} event 
 */
function onExportMenuButtonHandler(table, event) {
    //TODO: implement
}

function addButtonToFooter(table) {
    let menuContainer = createExportMenuContainer(table);
    table.elements.footer.appendChild(menuContainer);
}

/**
 * @typedef {{}} ExportPlugin
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