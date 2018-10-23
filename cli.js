#!/usr/bin/env node
const program = require('commander');
const chalk = require('chalk');

class HandledError extends Error {}

program
    .version('0.1.0')
    .option('-w, --wrokdir <dir>', 'change work directory')
    .option('--config <filepath>', 'set config filepath')
    .option('-v, --verbose', 'enable verbose output');

program
    .command('create <name>')
    .description('create a new app')
    .option('--no-tslint', 'no tslint integration')
    .option('--no-prettier', 'no prettier integration')
    .option('--docs', 'add documentation generator')
    .option('--vscode', 'add vscode integration')
    .option('--convention', 'file name convention', 'spinalcase')
    .option('--no-install', 'skip npm install')
    .option('--no-init', 'skip git init')
    .option('--no-hide', 'do not hide config files in vscode')
    .action(env)
    .action(wrap(create));

const commands = program.commands.map(cmd => cmd._name);

program.parse(process.argv);

if (
    commands.indexOf(program.args[0]) < 0 &&
    !(program.args[program.args.length - 1] instanceof program.Command)
) {
    if (program.args.length > 0) {
        console.error(
            chalk.red('Unknown Command: ' + chalk.bold(program.args.join(' ')))
        );
    }
    program.help();
}

function env() {
    if (program.verbose) {
        process.env.VERBOSE = 'true';
    }
    if (program.wrokdir) {
        process.chdir(program.wrokdir);
        console.log(
            chalk.yellow(
                `workdir changed to ${chalk.bold(chalk.blue(process.cwd()))}`
            )
        );
    }

    process.on('uncaughtException', err => {
        console.error('[uncaughtException]', err);
    });

    process.on('unhandledRejection', (reason, p) => {
        console.error('[unhandledRejection]', p, reason);
    });

    process.on('warning', warning => {
        console.warn('[warning]', warning);
    });
}

function wrap(func) {
    return async (...args) => {
        try {
            await func(...args);
        } catch (error) {
            if (error instanceof HandledError) {
                console.error(chalk.red(error.message));
            } else {
                const util = require('util');
                console.error(chalk.red(util.inspect(error, false, null, true)));
            }
            process.exit(1);
        }
    };
}

/**
 * Exec command in target directory
 *
 * @param {string} dir target directory relative to cwd
 * @param {string} command command
 * @param  {...any} args command arguments
 */
function exec(dir, command, ...args) {
    const spawn = require('cross-spawn');
    const path = require('path');
    const res = spawn.sync(command, args, {
        cwd: path.resolve(process.cwd(), dir),
        stdio: 'inherit'
    });
    if (res.error) {
        throw res.error;
    }
}

/**
 * Load source file
 *
 * @param {string} src source file path relative to this file
 * @param {boolean} [json] parsed as json
 */
function load(src, json) {
    const fs = require('fs');
    const path = require('path');
    const content = fs.readFileSync(path.resolve(__dirname, src), 'utf8');

    return json ? JSON.parse(content) : content;
}

/**
 * Copy file
 *
 * @param {string} src source file path relative to this file
 * @param {string} tar target file path relative to cwd
 */
function copy(src, tar) {
    const fs = require('fs');
    const path = require('path');
    fs.copyFileSync(
        path.resolve(__dirname, src),
        path.resolve(process.cwd(), tar)
    );
}

/**
 * Write file
 *
 * @param {string} tar target file path relative to cwd
 * @param {any} content file content
 */
function write(tar, content) {
    const fs = require('fs');
    const path = require('path');
    if (typeof content !== 'string') {
        content = JSON.stringify(content, null, 2);
    }
    fs.writeFileSync(path.resolve(process.cwd(), tar), content, { encoding: 'utf8' });
}

/**
 * Format file content
 *
 * @param {string} content file content
 * @param {string} filepath file path
 * @returns {string}
 */
async function format(content, filepath) {
    const prettier = require('prettier');

    const options = await prettier.resolveConfig(process.cwd());
    options.filepath = filepath;

    return prettier.format(content, options);
}

/**
 * Lint file
 *
 * @param {string} content file content
 * @param {string} filepath file path
 * @returns {string}
 */
function lint(content, filepath) {
    const path = require('path');
    const tslint = require('tslint');

    const linter = new tslint.Linter({ fix: true });
    const options = tslint.Configuration.findConfiguration(
        path.join(process.cwd(), 'tslint.json'),
        filepath
    ).results;
    linter.lint(filepath, content, options);

    return linter.applyFixes(filepath, content, linter.getResult().fixes);
}

/**
 * Parse template
 *
 * @param {string} template template
 * @param {any} vars variables
 * @returns {string}
 */
function parse(template, vars) {
    const resolve = require('typolar-template');

    return resolve(template, vars, { safeInterpo: true });
}

/**
 * Parse and copy file
 *
 * @param {string} src source file path relative to this file
 * @param {string} tar target file path relative to cwd
 * @param {string} vars variables
 */
function parseCopy(src, tar, vars) {
    const template = load(src);
    const content = parse(template, vars);
    write(tar, content);
}

function create(dir, options) {
    const fs = require('fs');
    const path = require('path');
    if (fs.existsSync(dir)) {
        if (fs.readdirSync(dir).length > 0) {
            throw new HandledError(
                `directory ${chalk.yellow(dir)} is not empty`
            );
        }
    } else {
        fs.mkdirSync(dir);
    }
    const rc = {
        name: path.basename(dir),
        tslint: !!options.tslint,
        prettier: !!options.prettier,
        convention: 'spinalcase',
        vscode: !!options.vscode,
        docs: !!options.docs,
        hide: !!options.hide
    };
    write(path.join(dir, '.typolarrc'), rc);
    const dirs = {
        src: 'src',
        models: 'src/models',
        routes: 'src/routes',
        services: 'src/services',
        config: 'config',
        views: 'views',
        tests: 'tests',
        build: 'lib'
    };
    if (rc.docs) {
        Object.assign(dirs, { docs: 'docs' });
    }
    for (const key in dirs) {
        fs.mkdirSync(path.join(dir, dirs[key]));
    }
    const vars = Object.assign({}, rc, dirs);
    // package.json
    parseCopy(
        'templates/package.json.typo',
        path.join(dir, 'package.json'),
        vars
    );
    if (rc.tslint) {
        // tslint.json
        parseCopy(
            'templates/tslint.json.typo',
            path.join(dir, 'tslint.json'),
            vars
        );
    }
    if (rc.prettier) {
        // .prettierrc
        parseCopy(
            'templates/.prettierrc.typo',
            path.join(dir, '.prettierrc'),
            vars
        );
        // .prettierignore
        parseCopy(
            'templates/.prettierignore.typo',
            path.join(dir, '.prettierignore'),
            vars
        );
    }
    if (rc.tslint) {
        // tsconfig
        parseCopy(
            'templates/tsconfig.json.typo',
            path.join(dir, 'tsconfig.json'),
            vars
        );
        // tsconfig.prod
        parseCopy(
            'templates/tsconfig.prod.json.typo',
            path.join(dir, 'tsconfig.prod.json'),
            vars
        );
    }
    // .gitignore
    parseCopy('templates/.gitignore.typo', path.join(dir, '.gitignore'), vars);
    // env
    copy('templates/.env.template.typo', path.join(dir, '.env'));
    copy('templates/.env.template.typo', path.join(dir, '.env.template'));
    // config/app.json
    parseCopy(
        'templates/config/app.json.typo',
        path.join(dir, dirs.config, 'app.json'),
        vars
    );
    // config/logger.json
    parseCopy(
        'templates/config/logger.json.typo',
        path.join(dir, dirs.config, 'logger.json'),
        vars
    );
    if (rc.vscode) {
        const vscode = path.join(dir, '.vscode');
        fs.mkdirSync(vscode);
        parseCopy(
            'templates/.vscode/extensions.json.typo',
            path.join(vscode, 'extensions.json'),
            vars
        );
        parseCopy(
            'templates/.vscode/tasks.json.typo',
            path.join(vscode, 'tasks.json'),
            vars
        );
        parseCopy(
            'templates/.vscode/settings.json.typo',
            path.join(vscode, 'settings.json'),
            vars
        );
        parseCopy(
            'templates/.vscode/launch.json.typo',
            path.join(vscode, 'launch.json'),
            vars
        );
    }

    if (options.install) {
        exec(dir, 'npm', 'i');
    }
    if (options.init) {
        exec(dir, 'git', 'init');
    }
}
