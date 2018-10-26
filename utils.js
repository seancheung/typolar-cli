class HandledError extends Error {}

module.exports = {
    HandledError,
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
     * Require module from working directory
     *
     * @param {string} id module id
     */
    require(id) {
        const path = require('path');

        return require(require.resolve(id, {
            paths: [path.join(process.cwd(), 'node_modules')]
        }));
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
            fs.copyFileSync(path.resolve(__dirname, src), path.resolve(process.cwd(), tar));
        }
    },

    /**
     * set file mode
     *
     * @param {string} tar target file path relative to cwd
     * @param {string} mode file mode
     */
    chmod(tar, mode) {
        const fs = require('fs');
        const path = require('path');
        fs.chmodSync(path.resolve(process.cwd(), tar), mode);
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
        fs.writeFileSync(path.resolve(process.cwd(), tar), content, {
            encoding: 'utf8'
        });
    },

    /**
     * Format file content
     *
     * @param {string} content file content
     * @param {string} filepath file path
     * @returns {Promise<string>}
     */
    async prettier(content, filepath) {
        const { resolveConfig, format } = this.require('prettier');

        const options = await resolveConfig(process.cwd());
        options.filepath = filepath;

        return format(content, options);
    },

    /**
     * Lint file with tslint
     *
     * @param {string} content file content
     * @param {string} filepath file path
     * @returns {string}
     */
    tslint(content, filepath) {
        const path = require('path');
        const { Linter, Configuration } = this.require('tslint');

        const linter = new Linter({ fix: true });
        const options = Configuration.findConfiguration(
            path.join(process.cwd(), 'tslint.json'),
            filepath
        ).results;
        linter.lint(filepath, content, options);

        return linter.applyFixes(filepath, content, linter.getResult().fixes);
    },

    /**
     * Lint file with eslint
     *
     * @param {string} content file content
     * @param {string} filepath file path
     * @returns {string}
     */
    eslint(content, filepath) {
        const { CLIEngine, Linter } = this.require('eslint');

        const engine = new CLIEngine();
        const config = engine.getConfigForFile(filepath);
        const linter = new Linter();
        const report = linter.verifyAndFix(content, config, filepath);

        return report.output;
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

        const content = fs.readFileSync(path.resolve(process.cwd(), filepath), 'utf8');

        return json ? JSON.parse(content) : content;
    },

    /**
     * Format convention type
     *
     * @param {string} type convention type
     */
    convention(type) {
        switch (type) {
        case 'camel':
        case 'camelcase':
        case 'camel-case':
            return 'camelcase';
        case 'pascal':
        case 'pascalcase':
        case 'pascal-case':
            return 'pascalcase';
        case 'kebab':
        case 'spinal':
        case 'kebabcase':
        case 'spinalcase':
        case 'kebab-case':
        case 'spinal-case':
            return 'spinalcase';
        }

        return type;
    },

    /**
     * Get preferences
     */
    prefs() {
        return this.read('.typolarrc', true);
    },

    /**
     * Write a module
     *
     * @param {any} prefs preferences
     * @param {string} name module name
     * @param {string|string[]} dir target directory
     * @param {string} src template filepath relative to this file
     * @param {any} vars variables
     * @param {string} [postfix] file name postfix
     * @returns {Promise<string>}
     */
    async compose(prefs, name, dir, src, vars, postfix) {
        const fs = require('fs');
        const path = require('path');
        const stringcase = require('stringcase');

        const conv = this.convention(prefs.convention);
        let filename = stringcase[conv](name);
        if (postfix) {
            filename += `.${postfix}`;
        }
        filename += '.ts';

        if (Array.isArray(dir)) {
            dir = dir.reduce((o, t) => path.join(o, t));
        }
        dir = path.resolve(process.cwd(), dir);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        const filepath = path.join(dir, filename);
        if (fs.existsSync(filepath)) {
            throw new HandledError(`file ${filepath} already exists`);
        }

        let content = this.load(src);
        content = this.parse(content, Object.assign({ name }, stringcase, vars));
        if (prefs.tslint) {
            content = this.tslint(content, filepath);
        }
        if (prefs.eslint) {
            content = this.eslint(content, filepath);
        }
        if (prefs.prettier) {
            content = await this.prettier(content, filepath);
        }
        this.write(filepath, content);

        return filepath;
    }
};
