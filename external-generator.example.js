
exports.run = async function() {
    // 'this' contains the underlying Generator
    // instance based on: https://github.com/egodigital/generator-ego/blob/master/generators/app/index.js
    // 
    // s. ./index.js
    
    // create a '.generator-ego/my-template' and store all your
    // (template) file there, which should be copied to output
    const TEMPLATES_DIR = this.tools.homePath('my-template');

    const NAME_AND_TITLE = await this.tools
        .askForNameAndTitle();
    if (!NAME_AND_TITLE) {
        return;
    }

    const OUT_DIR = NAME_AND_TITLE.mkDestinationDir();

    // copy all files
    this.tools
        .copyAll(TEMPLATES_DIR, OUT_DIR);

    // .gitignore
    /*
        this.tools.createGitIgnore(OUT_DIR, [
            'node_modules/'
        ]);
    */

    // ask for (new) Git repository
    await this.tools
        .askForGitInit(OUT_DIR);

    // ask for open Visual Studio Code
    await this.tools
        .askForOpenVSCode(OUT_DIR);
};
