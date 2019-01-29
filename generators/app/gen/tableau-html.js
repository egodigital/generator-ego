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
const sanitizeFilename = require('sanitize-filename');

/**
 * A HTML generator for Tableau.
 */
exports.run = async function() {
    const NAME_AND_TITLE = await this.tools
        .askForNameAndTitle();
    if (!NAME_AND_TITLE) {
        return;
    }

    // data property
    const DATA_PROPERTY = this.tools.toStringSafe(
        await this.tools.promptString(
            `PROPERTY of the result that contains the DATA:`
        )
    ).trim();

    // # of columns
    const NUMBER_OF_COLUMNS = parseInt(
        this.tools.toStringSafe(
            await this.tools.promptString(
                `How many COLUMNS do you need (> 0)?`, {
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
    if (isNaN(NUMBER_OF_COLUMNS)) {
        return;
    }

    // columns
    const COLS = [];
    let lastDataType = 'string';
    for (let i = 0; i < NUMBER_OF_COLUMNS; i++) {
        const COLUMN_NAME = this.tools.toStringSafe(
            await this.tools.promptString(
                `NAME of column #${ i + 1 }:`, {
                    validator: (val) => {
                        return '' !== this.tools
                            .toStringSafe(val)
                            .trim();
                    },
                }
            )
        ).trim();
        if ('' === COLUMN_NAME) {
            return;
        }

        // data type
        const COLUMN_DATA_TYPE = this.tools.toStringSafe(
            await this.tools.promptList(
                `DATA TYPE of column #${ i + 1 }`,
                [ 'bool', 'date', 'datetime', 'float', 'geometry', 'int', 'string' ],
                {
                    default: lastDataType,
                }
            )
        ).trim();
        if ('' === COLUMN_DATA_TYPE) {
            return;
        }

        const COLUMN_PROPERTY = this.tools.toStringSafe(
            await this.tools.promptString(
                `PROPERTY PATH of column #${ i + 1 }:`, {
                    validator: (val) => {
                        return '' !== this.tools
                            .toStringSafe(val)
                            .trim();
                    },
                    default: COLUMN_NAME,
                }
            )
        ).trim();
        if ('' === COLUMN_PROPERTY) {
            return;
        }

        COLS.push({
            name: COLUMN_NAME,
            property: COLUMN_PROPERTY,
            type: COLUMN_DATA_TYPE,
        });

        lastDataType = COLUMN_DATA_TYPE;
    }

    // request URL
    const REQUEST_URL = this.tools.toStringSafe(
        await this.tools.promptString(
            `Request URL:`, {
                validator: (val) => {
                    return '' !== this.tools
                        .toStringSafe(val)
                        .trim();
                },
            }
        )
    ).trim();
    if ('' === REQUEST_URL) {
        return;
    }

    // HTTP method
    const REQUEST_METHOD = this.tools.toStringSafe(
        await this.tools.promptList(
            `HTTP method for the request:`,
            [ 'GET', 'POST', 'PATCH', 'PUT' ],
            {
                default: 'GET',
            }
        )
    ).trim();
    if ('' === REQUEST_METHOD) {
        return;
    }

    const NUMBER_OF_PARAMETERS = parseInt(
        this.tools.toStringSafe(
            await this.tools.promptString(
                `How many optional URL parameters do you need?:`, {
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
    if (isNaN(NUMBER_OF_PARAMETERS)) {
        return;
    }

    // dynamic request parameters
    const PARAMETERS = [];
    for (let i = 0; i < NUMBER_OF_PARAMETERS; i++) {
        const PARAM_NAME = this.tools.toStringSafe(
            await this.tools.promptString(
                `NAME of parameter #${ i + 1 }:`, {
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

        const PARAM_DEFAULT = this.tools.toStringSafe(
            await this.tools.promptString(
                `DEFAULT VALUE of parameter #${ i + 1 }:`,
            )
        );

        PARAMETERS.push({
            default: PARAM_DEFAULT,
            name: PARAM_NAME
        });
    }

    const OUT_DIR = NAME_AND_TITLE.mkDestinationDir();

    const OPTS = {
        columns: COLS,
        dataProperty: DATA_PROPERTY,
        dir: OUT_DIR,
        method: REQUEST_METHOD,
        name: NAME_AND_TITLE.name,
        parameters: PARAMETERS,
        title: NAME_AND_TITLE.title,
        url: REQUEST_URL,
    };

    const HTML_FILENAME = `${ sanitizeFilename(OPTS.name) }WDC.html`;
    const JAVASCRIPT_FILENAME = `${ sanitizeFilename(OPTS.name) }WDC.js`;

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

    await this.tools.askForOpenVSCode(
        OUT_DIR,
    );
}

function generateJavaScript(opts) {
    let colsCode = '';
    colsCode += '        let cols = [\n';
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

        newColCode += `                        newColumn[${ JSON.stringify(COL.name) }] = data[i]${ PROPERTY_PATH.join('') };\n`;
    }

    return `function getQueryVariables() {
    let varList = {};

    let query = window.location.search.substring(1);
    let vars = query.split('&');
    for (let i = 0; i < vars.length; i++) {
        let pair = vars[i].split('=');

        varList[
            decodeURIComponent(pair[0])
        ] = decodeURIComponent(pair[1]);
    }

    return varList;
}

(function () {
    let url = ${ JSON.stringify(opts.url) };
    {
        let urlParams = [];

        let queryVars = getQueryVariables();
        for (let varName in queryVars) {
            let varValue = queryVars[varName];

            urlParams.push(
                encodeURIComponent(varName) + '=' + encodeURIComponent(varValue)
            );

            $('input[name="' + varName + '"].ego-url-param').val(
                varValue
            );
        }

        if (urlParams.length > 0) {
            url += ${ JSON.stringify(opts.url.indexOf('?') > -1 ? '&' : '?') };
            url += urlParams.join('&');
        }
    }

    let egoConnector = tableau.makeConnector();

    egoConnector.getSchema = function (schemaCallback) {
${ colsCode }

        let tableSchema = {
            id: ${ JSON.stringify(opts.name + 'Feed') },
            alias: ${ JSON.stringify("Loads '" + opts.title + "' data") },
            columns: cols
        };

        schemaCallback([
            tableSchema
        ]);
    };

    egoConnector.getData = function(table, done) {
        $.ajax({
            url: url,
            method: ${ JSON.stringify(opts.method) },
            beforeSend: function(jqXHR) {
                // set request headers, e.g.
            },
            success: function(response, textStatus, jqXHR) {
                let data = response${ getPropertyPath(opts.dataProperty).join('') };

                let tableData = [];

                if (data) {
                    for (let i = 0; i < data.length; i++) {
                        let newColumn = {};
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
    $("#ego-submit-btn").click(function () {
        tableau.connectionName = ${ JSON.stringify(opts.title + ' Feed') };
        tableau.submit();
    });
});
`;
}

function generateHtml(opts) {
    let paramListCode = '';
    if (opts.parameters.length > 0) {
        paramListCode += '                    <h1>URL parameters</h1>\n';
        paramListCode += '\n                    <table class="table table-hover table-striped" id="ego-url-param-list">\n';
        for (let i = 0; i < opts.parameters.length; i++) {
            const PARAM = opts.parameters[i];

            paramListCode += '                        <tr>\n';
            paramListCode += '                            <td>' + this.tools.encodeHtml(PARAM.name) + '</td>\n';
            paramListCode += '                            <td>\n';
            paramListCode += '                                <input class="form-control ego-url-param" type="text" value="' + this.tools.encodeHtml(PARAM.default) + '" name="' + this.tools.encodeHtml(PARAM.name) + '" readonly>\n';
            paramListCode += '                            </td>\n';
            paramListCode += '                        </tr>\n';
        }
        paramListCode += '                    </table>\n';
    }

    return `<html>
    <head>
        <title>&quot;${ this.tools.encodeHtml(opts.title) }&quot; Feed</title>
        <meta http-equiv="Cache-Control" content="no-store" />

        <link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js" type="text/javascript"></script>
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" crossorigin="anonymous"></script>

        <script src="https://connectors.tableau.com/libs/tableauwdc-2.3.latest.js" type="text/javascript"></script>
    </head>

    <body>
        <nav class="navbar navbar-default navbar-fixed-top" id="ego-navbar-top">
            <div class="container">
                <a href="https://e-go-digital.com/" target="_blank">
                    <img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gQ3JlYXRlZCB3aXRoIElua3NjYXBlIChodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy8pIC0tPgoKPHN2ZwogICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iCiAgIHhtbG5zOmNjPSJodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9ucyMiCiAgIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyIKICAgeG1sbnM6c3ZnPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogICB4bWxuczpzb2RpcG9kaT0iaHR0cDovL3NvZGlwb2RpLnNvdXJjZWZvcmdlLm5ldC9EVEQvc29kaXBvZGktMC5kdGQiCiAgIHhtbG5zOmlua3NjYXBlPSJodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy9uYW1lc3BhY2VzL2lua3NjYXBlIgogICB3aWR0aD0iMjI4Ljc0MjE2bW0iCiAgIGhlaWdodD0iNTBtbSIKICAgdmlld0JveD0iMCAwIDIyOC43NDIxNSA1MCIKICAgdmVyc2lvbj0iMS4xIgogICBpZD0ic3ZnOCIKICAgaW5rc2NhcGU6dmVyc2lvbj0iMC45Mi4yICg1YzNlODBkLCAyMDE3LTA4LTA2KSIKICAgc29kaXBvZGk6ZG9jbmFtZT0iZWdvX2RpZ2l0YWxfbGdfbWRfc20uc3ZnIj4KICA8ZGVmcwogICAgIGlkPSJkZWZzMiIgLz4KICA8c29kaXBvZGk6bmFtZWR2aWV3CiAgICAgaWQ9ImJhc2UiCiAgICAgcGFnZWNvbG9yPSIjZmZmZmZmIgogICAgIGJvcmRlcmNvbG9yPSIjNjY2NjY2IgogICAgIGJvcmRlcm9wYWNpdHk9IjEuMCIKICAgICBpbmtzY2FwZTpwYWdlb3BhY2l0eT0iMC4wIgogICAgIGlua3NjYXBlOnBhZ2VzaGFkb3c9IjIiCiAgICAgaW5rc2NhcGU6em9vbT0iMC4zNSIKICAgICBpbmtzY2FwZTpjeD0iLTU4Ni4xMDQ3OCIKICAgICBpbmtzY2FwZTpjeT0iNDYuNzg2NTAxIgogICAgIGlua3NjYXBlOmRvY3VtZW50LXVuaXRzPSJtbSIKICAgICBpbmtzY2FwZTpjdXJyZW50LWxheWVyPSJsYXllcjEiCiAgICAgc2hvd2dyaWQ9ImZhbHNlIgogICAgIGZpdC1tYXJnaW4tdG9wPSIwIgogICAgIGZpdC1tYXJnaW4tbGVmdD0iMCIKICAgICBmaXQtbWFyZ2luLXJpZ2h0PSIwIgogICAgIGZpdC1tYXJnaW4tYm90dG9tPSIwIgogICAgIGlua3NjYXBlOndpbmRvdy13aWR0aD0iMTkyMCIKICAgICBpbmtzY2FwZTp3aW5kb3ctaGVpZ2h0PSIxMDE3IgogICAgIGlua3NjYXBlOndpbmRvdy14PSItOCIKICAgICBpbmtzY2FwZTp3aW5kb3cteT0iLTgiCiAgICAgaW5rc2NhcGU6d2luZG93LW1heGltaXplZD0iMSIgLz4KICA8bWV0YWRhdGEKICAgICBpZD0ibWV0YWRhdGE1Ij4KICAgIDxyZGY6UkRGPgogICAgICA8Y2M6V29yawogICAgICAgICByZGY6YWJvdXQ9IiI+CiAgICAgICAgPGRjOmZvcm1hdD5pbWFnZS9zdmcreG1sPC9kYzpmb3JtYXQ+CiAgICAgICAgPGRjOnR5cGUKICAgICAgICAgICByZGY6cmVzb3VyY2U9Imh0dHA6Ly9wdXJsLm9yZy9kYy9kY21pdHlwZS9TdGlsbEltYWdlIiAvPgogICAgICAgIDxkYzp0aXRsZT48L2RjOnRpdGxlPgogICAgICA8L2NjOldvcms+CiAgICA8L3JkZjpSREY+CiAgPC9tZXRhZGF0YT4KICA8ZwogICAgIGlua3NjYXBlOmxhYmVsPSJFYmVuZSAxIgogICAgIGlua3NjYXBlOmdyb3VwbW9kZT0ibGF5ZXIiCiAgICAgaWQ9ImxheWVyMSIKICAgICB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjkuOTYzNDM4LC0xMTEuMjEyMjYpIj4KICAgIDxnCiAgICAgICB0cmFuc2Zvcm09Im1hdHJpeCgwLjUyMTQwOTA2LDAsMCwtMC41MjE0MDkwNiwxOS4wMTI4MDUsMTg4LjgyODE3KSIKICAgICAgIGlua3NjYXBlOmxhYmVsPSJMb2dvLWVHT2RpZ2l0YWwtMjAxNy0xMC0xNy1USEUtMDQiCiAgICAgICBpZD0iZzgyMyI+CiAgICAgIDxnCiAgICAgICAgIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE2Mi44MiwxMTEuMTY5KSIKICAgICAgICAgaWQ9Imc4MjUiPgogICAgICAgIDxwYXRoCiAgICAgICAgICAgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCIKICAgICAgICAgICBpZD0icGF0aDgyNyIKICAgICAgICAgICBzdHlsZT0iZmlsbDojMjMxZjIwO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lIgogICAgICAgICAgIGQ9Im0gMCwwIHYgLTE0LjMxNyBjIDAsLTUuODI2IC0wLjQ1OCwtMTAuNTggLTEuMzY5LC0xNC4yNjQgLTAuOTEzLC0zLjY4NiAtMi42MTYsLTYuNTY0IC01LjEwNiwtOC42MzMgLTIuNDkyLC0yLjA3IC01Ljk0OCwtMy40NzQgLTEwLjM2OSwtNC4yMSAtNC40MjIsLTAuNzM4IC0xMC4xNDMsLTEuMTA2IC0xNy4xNiwtMS4xMDYgLTYuMzE3LDAgLTExLjY4NiwwLjM2OCAtMTYuMTA3LDEuMTA2IC00LjQyMiwwLjczNiAtOC4wMDEsMi4yMSAtMTAuNzM4LDQuNDIxIC0yLjczNywyLjIxIC00LjczNyw1LjM2OCAtNi4wMDEsOS40NzQgLTEuMjYzLDQuMTA2IC0xLjg5NSw5LjQ5MiAtMS44OTUsMTYuMTYgViA2LjczOCBjIDAsNi41OTUgMC42NjcsMTEuOTEzIDIuMDAxLDE1Ljk0OSAxLjMzMiw0LjAzNSAzLjQwMyw3LjE1OCA2LjIxMSw5LjM3IDIuODA2LDIuMjEgNi40MDMsMy43IDEwLjc5LDQuNDc0IDQuMzg2LDAuNzcgOS42MzMsMS4xNTggMTUuNzM5LDEuMTU4IDMuMjI3LDAgNi4zMTcsLTAuMDE5IDkuMjY0LC0wLjA1MyAyLjk0OCwtMC4wMzYgNS42ODQsLTAuMjQ3IDguMjEyLC0wLjYzMSAyLjUyNiwtMC4zODggNC44MjQsLTEuMDU0IDYuODk1LC0yIDIuMDY5LC0wLjk0OCAzLjgyNCwtMi4zMzUgNS4yNjQsLTQuMTYgMS40MzgsLTEuODI1IDIuNTI2LC00LjE1OCAzLjI2MywtNyAwLjczNywtMi44NDIgMS4wNjksLTYuMzcgMSwtMTAuNTggSCAtMTUuMTYgYyAwLDIuODc3IC0wLjM2OSw1LjEwNiAtMS4xMDUsNi42ODQgLTAuNzM4LDEuNTggLTEuODYxLDIuNzE5IC0zLjM2OSwzLjQyMiAtMS41MSwwLjcwMiAtMy40NTgsMS4xMDYgLTUuODQzLDEuMjEgLTIuMzg3LDAuMTA2IC01LjIyOSwwLjE1OCAtOC41MjcsMC4xNTggLTQuNDIyLDAgLTcuOTE0LC0wLjIyNyAtMTAuNDc1LC0wLjY4NCAtMi41NjMsLTAuNDU2IC00LjUxLC0xLjMzMyAtNS44NDIsLTIuNjMyIC0xLjMzNSwtMS4yOTggLTIuMTk1LC0zLjEyMyAtMi41OCwtNS40NzQgLTAuMzg3LC0yLjM1MiAtMC42MTUsLTUuNDIxIC0wLjY4NCwtOS4yMTEgdiAtMTguMTA3IGMgMC4wNjksLTQuMTQyIDAuMzMyLC03LjQyMiAwLjc4OSwtOS44NDQgMC40NTYsLTIuNDIgMS4zNywtNC4yNDYgMi43MzcsLTUuNDc0IDEuMzcsLTEuMjI5IDMuMzMzLC0yLjAxNyA1Ljg5NiwtMi4zNjggMi41NjEsLTAuMzUyIDUuOTQ4LC0wLjUyNiAxMC4xNTksLTAuNTI2IDMuNTc5LDAgNi41OCwwLjA4NyA5LjAwMSwwLjI2MiAyLjQyMiwwLjE3NiA0LjM2OSwwLjc1NCA1Ljg0MywxLjczOCAxLjQ3NCwwLjk4MSAyLjUwOCwyLjUwOSAzLjEwNSw0LjU4IDAuNTk2LDIuMDY5IDAuODk1LDQuOTY0IDAuODk1LDguNjg0IHYgMi44NDMgSCAtMzUuMDU3IFYgMCBIIDAiIC8+CiAgICAgIDwvZz4KICAgICAgPGcKICAgICAgICAgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNDIuODQsOTYuNDUpIgogICAgICAgICBpZD0iZzgyOSI+CiAgICAgICAgPHBhdGgKICAgICAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIgogICAgICAgICAgIGlkPSJwYXRoODMxIgogICAgICAgICAgIHN0eWxlPSJmaWxsOiMyMzFmMjA7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiCiAgICAgICAgICAgZD0ibSAwLDAgdiA4LjQ2NyBoIDE3LjcwNCB2IDIuMDk4IGMgMCwyLjc0NSAtMC4yMjEsNC44ODEgLTAuNjYxLDYuNDA4IC0wLjQ0LDEuNTI4IC0xLjIwNCwyLjY1NiAtMi4yOTIsMy4zOCAtMS4wODcsMC43MjYgLTIuNTI0LDEuMTUzIC00LjMxMSwxLjI4MiAtMS43ODYsMC4xMjkgLTQuMDAxLDAuMTk0IC02LjY0MiwwLjE5NCAtMy4xMDcsMCAtNS42MDcsLTAuMTI5IC03LjQ5NiwtMC4zODkgLTEuODkyLC0wLjI1OSAtMy4zNDEsLTAuODQgLTQuMzUxLC0xLjc0NyAtMS4wMDksLTAuOTA2IC0xLjY4MywtMi4yNTQgLTIuMDE5LC00LjA0IC0wLjMzOCwtMS43ODcgLTAuNTMyLC00LjIwNyAtMC41ODMsLTcuMjYzIFYgLTQuOTcyIGMgMC4wNTEsLTIuNzk3IDAuMjE5LC01LjA2MiAwLjUwNSwtNi43OTggMC4yODQsLTEuNzM0IDAuOTE5LC0zLjA4MSAxLjkwMywtNC4wMzkgMC45ODMsLTAuOTU4IDIuNDIsLTEuNjA1IDQuMzEyLC0xLjk0MiAxLjg4OSwtMC4zMzcgNC40NjYsLTAuNTA1IDcuNzI5LC0wLjUwNSAyLjQzNCwwIDQuNTMxLDAuMDM5IDYuMjkyLDAuMTE3IDEuNzYxLDAuMDc3IDMuMTk4LDAuMzc1IDQuMzEyLDAuODkzIDEuMTEzLDAuNTE5IDEuOTQyLDEuMzU5IDIuNDg2LDIuNTI1IDAuNTQzLDEuMTY0IDAuODE2LDIuODA5IDAuODE2LDQuOTMyIGggMTEuMTA4IGMgMC4wNTIsLTMuMTA3IC0wLjE5NCwtNS43MSAtMC43MzgsLTcuODA3IC0wLjU0NCwtMi4wOTcgLTEuMzQ3LC0zLjgxOSAtMi40MDgsLTUuMTY1IC0xLjA2MiwtMS4zNDcgLTIuMzU3LC0yLjM3IC0zLjg4NCwtMy4wNyAtMS41MjgsLTAuNjk4IC0zLjIyNCwtMS4xOSAtNS4wODgsLTEuNDc2IC0xLjg2NSwtMC4yODMgLTMuODg1LC0wLjQzOSAtNi4wNiwtMC40NjYgLTIuMTc1LC0wLjAyNCAtNC40NTQsLTAuMDM4IC02LjgzNiwtMC4wMzggLTQuNTA1LDAgLTguMzc3LDAuMjg1IC0xMS42MTQsMC44NTQgLTMuMjM3LDAuNTcxIC01Ljg5MSwxLjY3MSAtNy45NjIsMy4zMDEgLTIuMDcyLDEuNjMzIC0zLjYwMSwzLjkzNyAtNC41ODMsNi45MTUgLTAuOTg1LDIuOTc4IC0xLjQ3Nyw2LjkwMiAtMS40NzcsMTEuNzY5IFYgOC4zOSBjIDAsNC45MiAwLjQ2Nyw4Ljg5NCAxLjM5OSwxMS45MjQgMC45MzIsMy4wMyAyLjQwOCw1LjM2IDQuNDI4LDYuOTkxIDIuMDE5LDEuNjMyIDQuNjYxLDIuNzIgNy45MjQsMy4yNjMgMy4yNjIsMC41NDQgNy4yMjQsMC44MTYgMTEuODg1LDAuODE2IDUuMTc5LDAgOS40LC0wLjI3MiAxMi42NjIsLTAuODE2IDMuMjYzLC0wLjU0MyA1LjgxMywtMS41OCA3LjY1MywtMy4xMDcgMS44MzcsLTEuNTI3IDMuMDkzLC0zLjY1MSAzLjc2NywtNi4zNyAwLjY3MiwtMi43MTkgMS4wMSwtNi4yMjcgMS4wMSwtMTAuNTI2IFYgMCBIIDAiIC8+CiAgICAgIDwvZz4KICAgICAgPGcKICAgICAgICAgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjE5LjM1MSwxNDcuOTEpIgogICAgICAgICBpZD0iZzgzMyI+CiAgICAgICAgPHBhdGgKICAgICAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIgogICAgICAgICAgIGlkPSJwYXRoODM1IgogICAgICAgICAgIHN0eWxlPSJmaWxsOiMyMzFmMjA7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiCiAgICAgICAgICAgZD0ibSAwLDAgYyA0LjIxMSwtMC42MzIgNy43MiwtMS45NDggMTAuNTI4LC0zLjk0OCAyLjgwNSwtMiA0Ljg5NSwtNC45MTMgNi4yNjQsLTguNzM4IDEuMzY4LC0zLjgyNiAyLjA1MiwtOC44OTUgMi4wNTIsLTE1LjIxMSB2IC0yMS4yNjUgYyAwLC02LjMxNiAtMC42MzIsLTExLjQ0MSAtMS44OTUsLTE1LjM3IC0xLjI2MywtMy45MzIgLTMuMjYzLC02Ljk4NCAtNiwtOS4xNiAtMi43MzgsLTIuMTc2IC02LjIzLC0zLjY0OSAtMTAuNDc1LC00LjQyMSAtNC4yNDcsLTAuNzcxIC05LjM1MywtMS4xNTggLTE1LjMxNywtMS4xNTggLTYuMTA2LDAgLTExLjI4MywwLjM1MiAtMTUuNTI5LDEuMDU0IC00LjI0NywwLjY5OSAtNy42ODUsMi4xMjEgLTEwLjMxNiw0LjI2MiAtMi42MzIsMi4xNCAtNC41NDYsNS4xOTQgLTUuNzM3LDkuMTU5IC0xLjE5NSwzLjk2NCAtMS43OSw5LjE3NiAtMS43OSwxNS42MzQgdiAyMS4yNjUgYyAwLDYuMTA2IDAuNTYxLDExLjA1MyAxLjY4NCwxNC44NDMgMS4xMjEsMy43OSAyLjk4Miw2LjcxOSA1LjU3OSw4Ljc5IDIuNTk2LDIuMDcgNi4wMzUsMy40NTcgMTAuMzE3LDQuMTU4IDQuMjgxLDAuNzAyIDkuNTQ0LDEuMDU0IDE1Ljc5MiwxLjA1NCBDIC05LjE1OCwwLjk0OCAtNC4yMTEsMC42MzIgMCwwIFogbSAtMjQuNTI5LC0xMi43MzggYyAtMi4zODYsLTAuNDkzIC00LjE5NCwtMS4zMzUgLTUuNDIyLC0yLjUyNyAtMS4yMjgsLTEuMTkzIC0yLjAzNiwtMi44MDggLTIuNDIxLC00Ljg0MiAtMC4zODYsLTIuMDM3IC0wLjYxNSwtNC42MzIgLTAuNjg0LC03Ljc5IHYgLTIxLjI2NSBjIDAsLTMuOTMyIDAuMjQ1LC03LjAzOCAwLjczNywtOS4zMTggMC40OSwtMi4yODEgMS4zODUsLTQgMi42ODQsLTUuMTU4IDEuMjk4LC0xLjE1OCAzLjE0MSwtMS44OTQgNS41MjcsLTIuMjEgMi4zODYsLTAuMzE2IDUuNDc1LC0wLjQ3NCA5LjI2NSwtMC40NzQgMy40MzcsMCA2LjMzMiwwLjE3NCA4LjY4NCwwLjUyNiAyLjM1MSwwLjM1MSA0LjI2NCwxLjEyMiA1LjczOCwyLjMxNiAxLjQ3NCwxLjE5MyAyLjUyNiwyLjkyOSAzLjE1OCw1LjIxMiAwLjYzMiwyLjI3OSAwLjk0OCw1LjMxNiAwLjk0OCw5LjEwNiB2IDIxLjI2NSBjIDAuMDY5LDMuNzE5IC0wLjIyOSw2LjYzMiAtMC44OTUsOC43MzggLTAuNjY4LDIuMTA1IC0xLjczNywzLjY4NCAtMy4yMTEsNC43MzcgLTEuNDc0LDEuMDUyIC0zLjQwNSwxLjcxOSAtNS43OTEsMiAtMi4zODYsMC4yOCAtNS4yNjMsMC40MiAtOC42MzEsMC40MiAtNC4wNzEsMCAtNy4zLC0wLjI0NiAtOS42ODYsLTAuNzM2IiAvPgogICAgICA8L2c+CiAgICAgIDxnCiAgICAgICAgIHRyYW5zZm9ybT0idHJhbnNsYXRlKDkyLjAzMyw3Ni43MzkpIgogICAgICAgICBpZD0iZzgzNyI+CiAgICAgICAgPHBhdGgKICAgICAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIgogICAgICAgICAgIGlkPSJwYXRoODM5IgogICAgICAgICAgIHN0eWxlPSJmaWxsOiMyMzFmMjA7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiCiAgICAgICAgICAgZD0ibSAwLDAgYyAwLC00LjQ1NSAtMy42MTIsLTguMDY2IC04LjA2NywtOC4wNjYgLTQuNDU1LDAgLTguMDY2LDMuNjExIC04LjA2Niw4LjA2NiAwLDQuNDU1IDMuNjExLDguMDY3IDguMDY2LDguMDY3IEMgLTMuNjEyLDguMDY3IDAsNC40NTUgMCwwIiAvPgogICAgICA8L2c+CiAgICAgIDxnCiAgICAgICAgIHRyYW5zZm9ybT0idHJhbnNsYXRlKDMwNS4zODIsMTAxLjIyNykiCiAgICAgICAgIGlkPSJnODQxIj4KICAgICAgICA8cGF0aAogICAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiCiAgICAgICAgICAgaWQ9InBhdGg4NDMiCiAgICAgICAgICAgc3R5bGU9ImZpbGw6IzIzMWYyMDtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZSIKICAgICAgICAgICBkPSJtIDAsMCBjIC0zLjgyNywyLjQ5OSAtNi40ODIsMy4xMjQgLTguOTgxLDMuMTI0IC01Ljc3OCwwIC05Ljg0LC01LjA3NiAtOS44NCwtMTUuNjk4IDAsLTEwLjg1NSA0LjYwNywtMTUuNzc1IDkuMjE2LC0xNS43NzUgMy4xMjMsMCA1LjU0NCwxLjMyOCA5LjYwNSw0Ljk5OCB6IG0gMC4zOTEsLTI3Ljg4IGMgLTQuMjk2LC00LjA2MSAtNi45NTEsLTUuMzExIC0xMC42MjEsLTUuMzExIC01LjQ2NywwIC0xMy42NjcsNS4zMTEgLTEzLjY2NywyMC42MTcgMCwxNC43NiA3LjEwNiwyMC41MzkgMTQuNjgyLDIwLjUzOSBDIC02LjE3LDcuOTY1IC0zLjY3MSw2Ljk1IDAsNC41MjkgViAyMi43MjUgSCA0Ljk5OCBWIC0zMi40MSBIIDEuMTcxIGwgLTAuNzgsNC41MyIgLz4KICAgICAgPC9nPgogICAgICA8ZwogICAgICAgICB0cmFuc2Zvcm09InRyYW5zbGF0ZSgzMjEuNTQ5LDEwOC40MTEpIgogICAgICAgICBpZD0iZzg0NSI+CiAgICAgICAgPHBhdGgKICAgICAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIgogICAgICAgICAgIGlkPSJwYXRoODQ3IgogICAgICAgICAgIHN0eWxlPSJmaWxsOiMyMzFmMjA7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiCiAgICAgICAgICAgZD0iTSAwLDAgSCA1LjA3NiBWIC0zOS41OTQgSCAwIFogTSAtMC40NjcsMTQuNTI1IEggNS41NDUgViA3LjU3NDggaCAtNi4wMTIgeiIgLz4KICAgICAgPC9nPgogICAgICA8ZwogICAgICAgICB0cmFuc2Zvcm09InRyYW5zbGF0ZSgzNTkuMDM1LDEwMy44ODIpIgogICAgICAgICBpZD0iZzg0OSI+CiAgICAgICAgPHBhdGgKICAgICAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIgogICAgICAgICAgIGlkPSJwYXRoODUxIgogICAgICAgICAgIHN0eWxlPSJmaWxsOiMyMzFmMjA7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiCiAgICAgICAgICAgZD0ibSAwLDAgYyAtMS45NTIsMC4zOTEgLTMuODI3LDAuNzAzIC02LjAxNCwwLjcwMyAtNy4wMjgsMCAtMTIuODA4LC00LjM3NCAtMTIuODA4LC0xNy4yNTkgMCwtOC42NjkgNC4wNjIsLTEzLjkwMSA5Ljg0LC0xMy45MDEgMi40OTksMCA0Ljk5OCwwLjc4MSA4Ljk4MiwzLjM1OCB6IG0gLTIwLjE0OSwtNDMuODExIGMgMy4yODEsLTEuMTcxIDYuNzk0LC0yLjI2NSAxMC43NzgsLTIuMjY1IDcuMDI4LDAgOS4zNzEsNC42MDggOS4zNzEsOS4xMzcgdiA1LjMxMSBjIC0zLjY3MSwtMi40MjEgLTYuMTcsLTMuNDM3IC05LjYwNiwtMy40MzcgLTcuMTg0LDAgLTE0LjI5Miw2LjA5MiAtMTQuMjkyLDE4LjU4NyAwLDE3LjAyNSA4Ljk4MiwyMS43ODggMTcuNzI4LDIxLjc4OCA1LjYyMywwIDExLjE2OCwtMS44NzMgMTEuMTY4LC0xLjg3MyB2IC00MC44NDQgYyAwLC03LjgxIC01LjE1NSwtMTMuNTExIC0xNC4yOTEsLTEzLjUxMSAtNC42ODcsMCAtOC40MzUsMC44NTkgLTExLjU1OSwxLjcxOSBsIDAuNzAzLDUuMzg4IiAvPgogICAgICA8L2c+CiAgICAgIDxnCiAgICAgICAgIHRyYW5zZm9ybT0idHJhbnNsYXRlKDM3My45NTIsMTA4LjQxMSkiCiAgICAgICAgIGlkPSJnODUzIj4KICAgICAgICA8cGF0aAogICAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiCiAgICAgICAgICAgaWQ9InBhdGg4NTUiCiAgICAgICAgICAgc3R5bGU9ImZpbGw6IzIzMWYyMDtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZSIKICAgICAgICAgICBkPSJNIDAsMCBIIDUuMDc2IFYgLTM5LjU5NCBIIDAgWiBNIC0wLjQ2OCwxNC41MjUgSCA1LjU0NSBWIDcuNTc0OCBoIC02LjAxMyB6IiAvPgogICAgICA8L2c+CiAgICAgIDxnCiAgICAgICAgIHRyYW5zZm9ybT0idHJhbnNsYXRlKDM5MS4xMzIsMTAzLjgwNCkiCiAgICAgICAgIGlkPSJnODU3Ij4KICAgICAgICA8cGF0aAogICAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiCiAgICAgICAgICAgaWQ9InBhdGg4NTkiCiAgICAgICAgICAgc3R5bGU9ImZpbGw6IzIzMWYyMDtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZSIKICAgICAgICAgICBkPSJtIDAsMCBoIC02LjI0OCB2IDQuNjA3IGggNi4zMjYgdiA4LjIgbCA0LjkyLDEuNzk2IFYgNC42MDcgaCA4LjIwMSBWIDAgSCA0Ljk5OCB2IC0yNC43NTYgYyAwLC0zLjU5MyAxLjcxOCwtNS45MzYgNS4yMzMsLTUuOTM2IDEuMDkzLDAgMi4yNjQsMC4yMzUgMy41MTMsMC43ODIgbCAwLjcwNCwtNS4wNzcgQyAxMi45NjQsLTM1LjM3NyAxMS40OCwtMzUuNTMzIDkuOTk2LC0zNS41MzMgNC40NTEsLTM1LjUzMyAwLC0zMS45NDEgMCwtMjUuMzgxIFYgMCIgLz4KICAgICAgPC9nPgogICAgICA8ZwogICAgICAgICB0cmFuc2Zvcm09InRyYW5zbGF0ZSg0MzEuNzQzLDg4LjI2MykiCiAgICAgICAgIGlkPSJnODYxIj4KICAgICAgICA8cGF0aAogICAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiCiAgICAgICAgICAgaWQ9InBhdGg4NjMiCiAgICAgICAgICAgc3R5bGU9ImZpbGw6IzIzMWYyMDtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZSIKICAgICAgICAgICBkPSJtIDAsMCBjIDAsMCAtMi4xODcsMC4xNTYgLTUuNTQ1LDAuMDc4IC03LjE4NSwtMC4xNTYgLTExLjYzNiwtMi45NjggLTExLjYzNiwtOC4yNzcgMCwtNC4yOTYgMy4yNzksLTcuMTg2IDcuNTc0LC03LjE4NiAzLjEyNCwwIDUuOTM2LDEuMzI4IDkuNjA3LDQuOTk4IHogbSAwLjM4OSwtMTQuOTE2IGMgLTMuOTA0LC00LjA2MSAtNy4zNCwtNS4zMTEgLTEwLjY5OCwtNS4zMTEgLTUuNDY3LDAgLTExLjk0OCwzLjk4NCAtMTEuOTQ4LDEyLjI2MSAwLDkuNTI4IDguODI0LDEyLjMzOSAxNy4wMjQsMTIuNTczIEMgLTIuMTEsNC42ODUgMCw0LjUyOSAwLDQuNTI5IHYgMy45MDUgYyAwLDQuNjA4IC0xLjc5Nyw3LjY1NCAtOC4xMjIsNy42NTQgLTQuMzczLDAgLTcuNzMyLC0xLjA5NCAtMTEuMDksLTIuMTg3IGwgLTAuNzAyLDUuMjMzIGMgMy4yMDEsMC44NTggNi43MTUsMS43OTUgMTEuNzkyLDEuNzk1IDguMjc4LDAgMTMuMTk4LC0zLjk4MyAxMy4xOTgsLTExLjU1OCBWIC0xOS40NDYgSCAxLjE3MSBsIC0wLjc4Miw0LjUzIiAvPgogICAgICA8L2c+CiAgICAgIDxnCiAgICAgICAgIHRyYW5zZm9ybT0idHJhbnNsYXRlKDQ0NS44NzksMTIzLjk1MikiCiAgICAgICAgIGlkPSJnODY1Ij4KICAgICAgICA8cGF0aAogICAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiCiAgICAgICAgICAgaWQ9InBhdGg4NjciCiAgICAgICAgICAgc3R5bGU9ImZpbGw6IzIzMWYyMDtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZSIKICAgICAgICAgICBkPSJtIDAsMCBoIDQuOTk4IHYgLTQ0LjkwNCBjIDAsLTMuNTkzIDEuNzE4LC01LjkzNiA0Ljk5OCwtNS45MzYgMS4wOTMsMCAyLjE4NywwLjMxMyAzLjEyNCwwLjYyNSBsIDAuNzAzLC00LjkyIGMgLTEuNDg0LC0wLjM5IC0yLjgxMiwtMC41NDYgLTQuMjk1LC0wLjU0NiBDIDQuNTMsLTU1LjY4MSAwLC01Mi40MDEgMCwtNDUuNTI5IFYgMCIgLz4KICAgICAgPC9nPgogICAgICA8ZwogICAgICAgICB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyNjcuNTA2LDEwOC4xNCkiCiAgICAgICAgIGlkPSJnODY5Ij4KICAgICAgICA8cGF0aAogICAgICAgICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiCiAgICAgICAgICAgaWQ9InBhdGg4NzEiCiAgICAgICAgICAgc3R5bGU9ImZpbGw6IzAwYWVlZjtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZSIKICAgICAgICAgICBkPSJtIDAsMCBjIDAsLTQuNTg2IC0zLjcxNywtOC4zMDMgLTguMzAzLC04LjMwMyAtNC41ODYsMCAtOC4zMDQsMy43MTcgLTguMzA0LDguMzAzIDAsNC41ODYgMy43MTgsOC4zMDQgOC4zMDQsOC4zMDQgQyAtMy43MTcsOC4zMDQgMCw0LjU4NiAwLDAiIC8+CiAgICAgIDwvZz4KICAgICAgPGcKICAgICAgICAgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjY3LjUwNiw3Ni4xMTkpIgogICAgICAgICBpZD0iZzg3MyI+CiAgICAgICAgPHBhdGgKICAgICAgICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIgogICAgICAgICAgIGlkPSJwYXRoODc1IgogICAgICAgICAgIHN0eWxlPSJmaWxsOiMwMGFlZWY7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiCiAgICAgICAgICAgZD0ibSAwLDAgYyAwLC00LjU4NiAtMy43MTcsLTguMzA0IC04LjMwMywtOC4zMDQgLTQuNTg2LDAgLTguMzA0LDMuNzE4IC04LjMwNCw4LjMwNCAwLDQuNTg2IDMuNzE4LDguMzAzIDguMzA0LDguMzAzIEMgLTMuNzE3LDguMzAzIDAsNC41ODYgMCwwIiAvPgogICAgICA8L2c+CiAgICA8L2c+CiAgPC9nPgo8L3N2Zz4K">
                </a>
            </div>
        </nav>

        <div class="container" id="ego-content">
            <div class="row vertical-center-row">
                <div class="text-center col-md-4 col-md-offset-4">
${ paramListCode }
                    <button type="button" id="ego-submit-btn" class="btn btn-success" style="margin: 10px;">
                        Get &quot;${ this.tools.encodeHtml(opts.title) }&quot; Data
                    </button>
                </div>
            </div>
        </div>

        <nav class="navbar navbar-default navbar-fixed-bottom" id="ego-navbar-bottom">
            <div class="container">
                Generated by <a href="https://github.com/egodigital/generator-ego" target="_blank">ego</a> generator for <a href="https://yeoman.io/" target="_blank">Yeoman</a>
            </div>
        </nav>

        <style>
        
            #ego-navbar-top {
                height: 64px;
            }

            #ego-navbar-top img {
                height: 48px;
                margin-top: 8px;
            }

            #ego-navbar-bottom {
                height: 48px;
                line-height: 48px;
                text-align: center;
            }

            #ego-content {
                padding-top: 80px;
                padding-bottom: 64px;
            }
        
        </style>

        <script src="${ opts.jsFile }" type="text/javascript"></script>
    </body>
</html>`;
}

function getPropertyPath(col) {
    if ('' === col.trim()) {
        return [];
    }

    return col.split(".")
        .map(p => `[${ JSON.stringify(p.trim()) }]`);
}
