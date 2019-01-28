// generator-ego (https://github.com/egodigital/generator-ego)
// Copyright (C) 2018  e.GO Digital GmbH, Aachen, Germany
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

const fs = require('fs-extra');
const htmlEntities = require('html-entities');

/**
 * A HTML generator for Tableau.
 */
exports.run = async function() {
    const NAME_AND_TITLE = await this.tools
        .askForNameAndTitle();
    if (!NAME_AND_TITLE) {
        return;
    }

    const AMOUNT_OF_COLS = parseInt(
        this.tools.toStringSafe(
            await this.tools.promptString(
                `Enter the # of COLUMNS:`, {
                    validator: (val) => {
                        const NR = parseInt(
                            this.tools
                                .toStringSafe(val)
                        );
                        if (!isNaN(NR)) {
                            return NR > 0;
                        }

                        return false;
                    },
                }
            )
        ).trim()
    );
    if (isNaN(AMOUNT_OF_COLS)) {
        return;
    }

    const DATA_PROPERTY = this.tools.toStringSafe(
        await this.tools.promptString(
            `Enter the root property:`
        )
    ).trim();

    const COLS = [];
    let lastDataType = 'string';
    for (let i = 0; i < AMOUNT_OF_COLS; i++) {
        const COL_NAME = this.tools.toStringSafe(
            await this.tools.promptString(
                `Enter the NAME of column #${ i + 1 }:`, {
                    validator: (val) => {
                        return '' !== this.tools
                            .toStringSafe(val)
                            .trim();
                    },
                }
            )
        ).trim();

        // data type
        const DATA_TYPE = this.tools.toStringSafe(
            await this.tools.promptList(
                `Define the data type of column #${ i + 1 }`,
                [ 'bool', 'date', 'datetime', 'float', 'geometry', 'int', 'string' ],
                {
                    default: lastDataType,
                }
            )
        ).trim();
        if ('' === DATA_TYPE) {
            return;
        }

        const PROPERTY_NAME = this.tools.toStringSafe(
            await this.tools.promptString(
                `Enter the name of the property of the column #${ i + 1 }:`, {
                    validator: (val) => {
                        return '' !== this.tools
                            .toStringSafe(val)
                            .trim();
                    },
                    default: COL_NAME,
                }
            )
        ).trim();
        if ('' === PROPERTY_NAME) {
            return;
        }

        COLS.push({
            name: COL_NAME,
            property: PROPERTY_NAME,
            type: DATA_TYPE,
        });

        lastDataType = DATA_TYPE;
    }

    const URL = this.tools.toStringSafe(
        await this.tools.promptString(
            `Enter the URL that provides the data:`, {
                validator: (val) => {
                    return '' !== this.tools
                        .toStringSafe(val)
                        .trim();
                },
            }
        )
    ).trim();

    // HTTP method
    const METHOD = this.tools.toStringSafe(
        await this.tools.promptList(
            `Select the HTTP request method:`,
            [ 'GET', 'POST', 'PATCH', 'PUT' ],
            {
                default: 'GET',
            }
        )
    ).trim();
    if ('' === METHOD) {
        return;
    }

    const AMOUNT_OF_PARAMS = parseInt(
        this.tools.toStringSafe(
            await this.tools.promptString(
                `Enter the # of URL parameters:`, {
                    validator: (val) => {
                        const NR = parseInt(
                            this.tools
                                .toStringSafe(val)
                        );
                        if (!isNaN(NR)) {
                            return NR > -1;
                        }

                        return false;
                    },
                    default: '0',
                }
            )
        ).trim()
    );
    if (isNaN(AMOUNT_OF_PARAMS)) {
        return;
    }

    const PARAMS = [];
    for (let i = 0; i < AMOUNT_OF_PARAMS; i++) {
        const PARAM_NAME = this.tools.toStringSafe(
            await this.tools.promptString(
                `Enter the NAME of parameter #${ i + 1 }:`, {
                    validator: (val) => {
                        return '' !== this.tools
                            .toStringSafe(val)
                            .trim();
                    },
                }
            )
        ).trim();
        if ('' === PARAM_NAME) {
            return;
        }

        PARAMS.push({
            name: PARAM_NAME
        });
    }

    const OUT_DIR = NAME_AND_TITLE.mkDestinationDir();

    const OPTS = {
        columns: COLS,
        dataProperty: DATA_PROPERTY,
        dir: OUT_DIR,
        method: METHOD,
        name: NAME_AND_TITLE.name,
        parameters: PARAMS,
        title: NAME_AND_TITLE.title,
        url: URL,
    };

    const HTML_FILENAME = `${ OPTS.name }WDC.html`;
    const JAVASCRIPT_FILENAME = `${ OPTS.name }WDC.js`;

    OPTS.htmlFile = HTML_FILENAME;
    OPTS.jsFile = JAVASCRIPT_FILENAME;

    const HTML = generateHtml.apply(
        this, [ OPTS ]
    );
    const JAVASCRIPT = generateJavaScript.apply(
        this, [ OPTS ]
    );
    
    const GENERATE_FILE = (file, func) => {
        return this.tools.withSpinner(
            `Generating '${ file }' ...`,
            async (spinner) => {
                try {
                    const RESULT = await Promise.resolve(
                        func(spinner)
                    );

                    spinner.succeed(`File '${ file }' generated.`);

                    return RESULT;
                } catch (e) {
                    spinner.fail(`Could not generate file '${ file }': ${ this.tools.toStringSafe(e) }`);

                    process.exit(1);
                }
            }  
        );
    };

    // HTML file
    await GENERATE_FILE(HTML_FILENAME, () => {
        fs.writeFileSync(
            OUT_DIR + '/' + HTML_FILENAME,
            HTML,
            'utf8'
        );
    });

    // JavaScript file
    await GENERATE_FILE(JAVASCRIPT_FILENAME, () => {
        fs.writeFileSync(
            OUT_DIR + '/' + JAVASCRIPT_FILENAME,
            JAVASCRIPT,
            'utf8'
        );
    });
}

function generateJavaScript(opts) {
    let colsCode = '';
    colsCode += '        var cols = [\n';
    for (let i = 0; i < opts.columns.length; i++) {
        const COL = opts.columns[i];

        colsCode += '            {\n';
        colsCode += `                id: ${ JSON.stringify(COL.name) },\n`;
        colsCode += `                dataType: tableau.dataTypeEnum.${ COL.type }\n`;
        colsCode += '            },\n';
    }
    colsCode += '        ];';

    let newColCode = '';
    for (let i = 0; i < opts.columns.length; i++) {
        const COL = opts.columns[i];

        const PROPERTY_PATH = getPropertyPath(COL.property);

        newColCode += `                        newColumn[${ JSON.stringify(COL.name) }] = data${ PROPERTY_PATH.join('') };\n`;
    }

    return `(function () {
    var egoConnector = tableau.makeConnector();

    egoConnector.getSchema = function (schemaCallback) {
	    // tableau.log("Hello WDC!");
${ colsCode }

        var tableSchema = {
            id: ${ JSON.stringify(opts.name + 'Feed') },
            alias: ${ JSON.stringify("Loads '" + opts.title + "' data") },
            columns: cols
        };

        schemaCallback([
            tableSchema
        ]);
    };

    egoConnector.getData = function(table, done) {
        var urlParams = [];
        $('.ego-url-param').each(function() {
            var e = $(this);

            urlParams.push(
                e.attr('name') + '=' + encodeURIComponent(e.val())
            );
        });

        var url = ${ JSON.stringify(opts.url) };
        if (urlParams.length > 0) {
            url += url.indexOf('?') > -1 ? '&' : '?';
            url += urlParams.join('&');
        }

        console.log({
            url: url
        });

        $.ajax({
            url: url,
            method: ${ JSON.stringify(opts.method) },
            success: function(response) {
                var data = response${ getPropertyPath(opts.dataProperty).join('') };

                var tableData = [];

                if (data) {
                    for (var i = 0; i < data.length; i++) {
                        var newColumn = {
                        };
${ newColCode }
                        tableData.push(
                            newColumn
                        );
                    }
                }

                table.appendRows(tableData);
                done();
            }
        });
    };

    tableau.registerConnector(
        egoConnector
    );
})();

$(document).ready(function () {
    $("#egoSubmitButton").click(function () {
        tableau.connectionName = ${ JSON.stringify(opts.title + ' Feed') };
        tableau.submit();
    });
});
`;
}

function generateHtml(opts) {
    let paramListCode = '';
    if (opts.parameters.length > 0) {
        paramListCode += '\n                <table class="table table-hover table-striped">\n';
        for (let i = 0; i < opts.parameters.length; i++) {
            const PARAM = opts.parameters[i];

            paramListCode += '                <tr>\n';
            paramListCode += '                <td>' + this.tools.encodeHtml(PARAM.name) + '</td>\n';
            paramListCode += '                <td>\n';
            paramListCode += '                    <input class="ego-url-param form-control" type="text" name="' + this.tools.encodeHtml(PARAM.name) + '">\n';
            paramListCode += '                </td>\n';
            paramListCode += '                </tr>\n';
        }
        paramListCode += '                </table>\n';
    }

    return `<html>

<head>
    <title>&quot;${ this.tools.encodeHtml(opts.title) }&quot; Feed</title>
    <meta http-equiv="Cache-Control" content="no-store" />

    <link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js" type="text/javascript"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js" crossorigin="anonymous"></script>

    <script src="https://connectors.tableau.com/libs/tableauwdc-2.3.latest.js" type="text/javascript"></script>
    <script src="${ opts.jsFile }" type="text/javascript"></script>
</head>

<body>
    <div class="container container-table">
        <div class="row vertical-center-row">
            <div class="text-center col-md-4 col-md-offset-4">
                <button type="button" id="egoSubmitButton" class="btn btn-success" style="margin: 10px;">
                    Get &quot;${ this.tools.encodeHtml(opts.title) }&quot; Data
                </button>
${ paramListCode }
            </div>
        </div>
    </div>
</body>

</html>`;
}

function getPropertyPath(col) {
    return col.split(".")
        .map(p => `[${ JSON.stringify(p) }]`);
}
