#!/usr/bin/env node
const program = require('commander');
const chalk = require('chalk');
const utils = require('./utils');

program
    .version('0.1.0')
    .option('-w, --wrokdir <dir>', 'change work directory')
    .option('--rc <filepath>', 'set typolarrc filepath')
    .option('-v, --verbose', 'enable verbose output');

program
    .command('new <name>')
    .description('create a new app')
    .option('--template <type>', 'create from a template')
    .option('--no-tslint', 'no tslint integration')
    .option('--no-prettier', 'no prettier integration')
    .option('--docs', 'add documentation generator')
    .option('--vscode', 'add vscode integration')
    .option('--convention <type>', 'file name convention', 'spinalcase')
    .option('--no-install', 'skip npm install')
    .option('--no-update', 'skip npm update')
    .option('--no-init', 'skip git init')
    .option('--no-hide', 'do not hide config files in vscode')
    .option('--no-hook', 'do not install pre-commit hook')
    .action(setup)
    .action(wrap(create));

program
    .command('show')
    .description('show app info')
    .option('-e, --env <environment>', 'set environment', 'development')
    .action(setup)
    .action(env)
    .action(wrap(scope))
    .action(wrap(show));

program
    .command('make:model <name>')
    .description('generate a model file')
    .action(setup)
    .action(wrap(scope))
    .action(wrap(makeModel));

program
    .command('make:route <name>')
    .description('generate a route file')
    .action(setup)
    .action(wrap(scope))
    .action(wrap(makeRoute));

program
    .command('make:service <name>')
    .description('generate a service file')
    .action(setup)
    .action(wrap(scope))
    .action(wrap(makeService));

program
    .command('make:test <name>')
    .description('generate a test file')
    .action(setup)
    .action(wrap(scope))
    .action(wrap(makeTest));

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

function setup() {
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

function env(options) {
    if (options.env) {
        process.env.NODE_ENV = options.env;
    }
    console.log(
        chalk.yellow(
            `running in ${chalk.bold(chalk.blue(process.env.NODE_ENV))} mode`
        )
    );
}

function scope() {
    if (!utils.exist('.typolarrc')) {
        throw new utils.HandledError('not in a valid app directory');
    }
}

function wrap(func) {
    return async (...args) => {
        try {
            await func(...args);
        } catch (error) {
            if (error instanceof utils.HandledError) {
                console.error(chalk.red(error.message));
            } else {
                const util = require('util');
                console.error(chalk.red(util.inspect(error, false, null, true)));
            }
            process.exit(1);
        }
    };
}

function create(dir, options) {
    const fs = require('fs');
    const path = require('path');
    if (fs.existsSync(dir)) {
        if (fs.readdirSync(dir).length > 0) {
            throw new utils.HandledError(
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
        convention: options.convention,
        docs: !!options.docs,
        hide: !!options.hide
    };
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
    if (options.docs) {
        Object.assign(dirs, { docs: 'docs' });
    }
    utils.write(
        path.join(dir, '.typolarrc'),
        Object.assign({}, rc, { paths: dirs })
    );
    for (const key in dirs) {
        fs.mkdirSync(path.join(dir, dirs[key]));
    }
    const vars = Object.assign({}, rc, dirs);
    // package.json
    utils.copy(
        'templates/package.json.typo',
        path.join(dir, 'package.json'),
        vars
    );
    // tsconfig
    utils.copy(
        'templates/tsconfig.json.typo',
        path.join(dir, 'tsconfig.json'),
        vars
    );
    // tsconfig.prod
    utils.copy(
        'templates/tsconfig.prod.json.typo',
        path.join(dir, 'tsconfig.prod.json'),
        vars
    );
    // .gitignore
    utils.copy('templates/.gitignore.typo', path.join(dir, '.gitignore'), vars);
    // env
    utils.copy('templates/.env.template.typo', path.join(dir, '.env'));
    utils.copy('templates/.env.template.typo', path.join(dir, '.env.template'));
    // config/app.json
    utils.copy(
        'templates/config/app.json.typo',
        path.join(dir, dirs.config, 'app.json'),
        vars
    );
    // config/logger.json
    utils.copy(
        'templates/config/logger.json.typo',
        path.join(dir, dirs.config, 'logger.json'),
        vars
    );
    // index.ts
    utils.copy(
        'templates/index.ts.typo',
        path.join(dir, dirs.src, 'index.ts'),
        vars
    );
    if (options.tslint) {
        // tslint.json
        utils.copy(
            'templates/tslint.json.typo',
            path.join(dir, 'tslint.json'),
            vars
        );
        // tests/tslint.json
        utils.copy(
            'templates/tslint.tests.json.typo',
            path.join(dir, dirs.tests, 'tslint.json'),
            vars
        );
    }
    if (options.prettier) {
        // .prettierrc
        utils.copy(
            'templates/.prettierrc.typo',
            path.join(dir, '.prettierrc'),
            vars
        );
        // .prettierignore
        utils.copy(
            'templates/.prettierignore.typo',
            path.join(dir, '.prettierignore'),
            vars
        );
    }
    // .vscode
    if (options.vscode) {
        const vscode = path.join(dir, '.vscode');
        fs.mkdirSync(vscode);
        utils.copy(
            'templates/.vscode/extensions.json.typo',
            path.join(vscode, 'extensions.json'),
            vars
        );
        utils.copy(
            'templates/.vscode/tasks.json.typo',
            path.join(vscode, 'tasks.json'),
            vars
        );
        utils.copy(
            'templates/.vscode/settings.json.typo',
            path.join(vscode, 'settings.json'),
            vars
        );
        utils.copy(
            'templates/.vscode/launch.json.typo',
            path.join(vscode, 'launch.json'),
            vars
        );
    }

    if (options.install) {
        if (options.update) {
            utils.exec(dir, 'npm', 'up');
        }
        utils.exec(dir, 'npm', 'i');
    }
    if (options.init) {
        utils.exec(dir, 'git', 'init');
        if (options.tslint && options.hook) {
            const hookfile = path.join(dir, '.git', 'hooks', 'pre-commit');
            utils.copy('templates/pre-commit.typo', hookfile, vars);
            utils.chmod(hookfile, '0755');
        }
    }
}

function show() {
    const rc = utils.read('.typolarrc', true);
    const config = require('kuconfig');
    const util = require('util');
    delete config.__;
    console.log(
        chalk.blue('preference:\n'),
        util.inspect(rc, false, null, true)
    );
    console.log(
        chalk.blue('config:\n'),
        util.inspect(config, false, null, true)
    );
}

async function makeModel(name) {
    const prefs = utils.prefs();
    name = name.replace(/[-_]?model$/i, '');
    const filepath = await utils.writeModule(
        prefs,
        name,
        prefs.paths.models,
        'templates/model.ts.typo',
        {}
    );
    console.log(`created file at ${chalk.blue(filepath)}`);
}

async function makeRoute(name) {
    const prefs = utils.prefs();
    name = name.replace(/[-_]?route$/i, '');
    const filepath = await utils.writeModule(
        prefs,
        name,
        prefs.paths.routes,
        'templates/route.ts.typo',
        {}
    );
    console.log(`created file at ${chalk.blue(filepath)}`);
}

async function makeService(name) {
    const prefs = utils.prefs();
    name = name.replace(/[-_]?service$/i, '');
    const filepath = await utils.writeModule(
        prefs,
        name,
        prefs.paths.services,
        'templates/service.ts.typo',
        {}
    );
    console.log(`created file at ${chalk.blue(filepath)}`);
}

async function makeTest(name) {
    const prefs = utils.prefs();
    name = name.replace(/[-_]?test$/i, '');
    const filepath = await utils.writeModule(
        prefs,
        name,
        prefs.paths.tests,
        'templates/test.ts.typo',
        {},
        'spec'
    );
    console.log(`created file at ${chalk.blue(filepath)}`);
}
