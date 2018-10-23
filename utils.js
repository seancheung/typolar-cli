module.exports = {
    /**
     * Exec command in target directory
     *
     * @param {string} dir target directory relative to cwd
     * @param {string} command command
     * @param  {...any} args command arguments
     */
    exec(dir, command, ...args) {
        const spawn = require('cross-spawn');
        const path = require('path');
        const res = spawn.sync(command, args, {
            cwd: path.resolve(process.cwd(), dir),
            stdio: 'inherit'
        });
        if (res.error) {
            throw res.error;
        }
    },

    /**
     * Load source file
     *
     * @param {string} src source file path relative to this file
     * @param {boolean} [json] parsed as json
     */
    load(src, json) {
        const fs = require('fs');
        const path = require('path');
        const content = fs.readFileSync(path.resolve(__dirname, src), 'utf8');

        return json ? JSON.parse(content) : content;
    },

    /**
     * Copy file
     *
     * @param {string} src source file path relative to this file
     * @param {string} tar target file path relative to cwd
     * @param {any} [vars] variables
     */
    copy(src, tar, vars) {
        if (vars !== undefined) {
            const template = this.load(src);
            const content = this.parse(template, vars);
            this.write(tar, content);
        } else {
            const fs = require('fs');
            const path = require('path');
            fs.copyFileSync(
                path.resolve(__dirname, src),
                path.resolve(process.cwd(), tar)
            );
        }
    },

    /**
     * Write file
     *
     * @param {string} tar target file path relative to cwd
     * @param {any} content file content
     */
    write(tar, content) {
        const fs = require('fs');
        const path = require('path');
        if (typeof content !== 'string') {
            content = JSON.stringify(content, null, 2);
        }
        fs.writeFileSync(path.resolve(process.cwd(), tar), content, { encoding: 'utf8' });
    },

    /**
     * Format file content
     *
     * @param {string} content file content
     * @param {string} filepath file path
     * @returns {string}
     */
    async format(content, filepath) {
        const prettier = require('prettier');

        const options = await prettier.resolveConfig(process.cwd());
        options.filepath = filepath;

        return prettier.format(content, options);
    },

    /**
     * Lint file
     *
     * @param {string} content file content
     * @param {string} filepath file path
     * @returns {string}
     */
    lint(content, filepath) {
        const path = require('path');
        const tslint = require('tslint');

        const linter = new tslint.Linter({ fix: true });
        const options = tslint.Configuration.findConfiguration(
            path.join(process.cwd(), 'tslint.json'),
            filepath
        ).results;
        linter.lint(filepath, content, options);

        return linter.applyFixes(filepath, content, linter.getResult().fixes);
    },

    /**
     * Parse template
     *
     * @param {string} template template
     * @param {any} vars variables
     * @returns {string}
     */
    parse(template, vars) {
        const resolve = require('typolar-template');

        return resolve(template, vars, { safeInterpo: true });
    },

    /**
     * Check target file's existence
     *
     * @param {string} filepath file path relative to cwd
     * @returns {boolean}
     */
    exist(filepath) {
        const fs = require('fs');
        const path = require('path');

        return fs.existsSync(path.resolve(process.cwd(), filepath));
    },

    /**
     * Read target file's content
     *
     * @param {string} filepath file path relative to cwd
     * @param {boolean} [json] parse as json
     * @returns {string|any}
     */
    read(filepath, json) {
        const fs = require('fs');
        const path = require('path');

        const content = fs.readFileSync(
            path.resolve(process.cwd(), filepath),
            'utf8'
        );

        return json ? JSON.parse(content) : content;
    }
};
