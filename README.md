# typolar-cli

CLI for Typolar projects

## Install

```bash
npm i -g typolar-cli
```

## Usage

```bash
typolar -h
```

Output:

```text
Usage: typolar [options] [command]

Options:
  -V, --version               output the version number
  -w, --wrokdir <dir>         change work directory
  --rc <filepath>             set typolarrc filepath
  -v, --verbose               enable verbose output
  -h, --help                  output usage information

Commands:
  new [options] <name>        create a new app
  show [options]              show app info
  make:model <name>           generate a model file
  make:route <name>           generate a route file
  make:service <name>         generate a service file
  make:test [options] <name>  generate a test file
```

Create a typolar project:

```text
Usage: typolar new [options] <name>

create a new app

Options:
  --registry <taobao|url>      set project level npm registry
  --no-tslint                  no tslint integration
  --no-prettier                no prettier integration
  --eslint                     add eslint integration
  --docs                       add documentation generator
  --vscode                     add vscode integration
  --conv <camel|pascal|kebab>  file name convention (default: "kebab")
  --no-install                 skip npm install
  --no-update                  skip npm update
  --no-hide                    do not hide config files in vscode
  --no-init                    skip git init
  --no-hook                    do not add git hook
  --no-commit                  skip auto initial commit
  --clean                      no example code
  -h, --help                   output usage information
```

e.g.

```bash
typolar new myapp --docs --vscode --eslint --registry=taobao --clean
```

Project structure:

```text
myapp/
├── .editorconfig
├── .env
├── .env.template
├── .eslintignore
├── .eslintrc.json
├── .gitattributes
├── .gitignore
├── .npmrc
├── .prettierignore
├── .prettierrc
├── .typolarrc
├── .vscode/
├── config/
│   ├── app.json
│   └── logger.json
├── docs/
├── lib/
├── package.json
├── src/
│   ├── app.ts
│   ├── index.ts
│   ├── models/
│   ├── routes/
│   └── services/
├── tests/
│   └── tslint.json
├── tsconfig.json
├── tsconfig.prod.json
├── tslint.json
└── views/
```

With example code:

```text
myapp/
├── .editorconfig
├── .env
├── .env.template
├── .eslintignore
├── .eslintrc.json
├── .gitattributes
├── .gitignore
├── .npmrc
├── .prettierignore
├── .prettierrc
├── .typolarrc
├── .vscode/
├── config/
│   ├── app.json
│   └── logger.json
├── lib/
│   ├── app.js
│   ├── app.js.map
│   ├── index.js
│   ├── index.js.map
│   ├── models/
│   │   ├── address.js
│   │   ├── address.js.map
│   │   ├── company.js
│   │   ├── company.js.map
│   │   ├── user.js
│   │   └── user.js.map
│   ├── routes/
│   │   ├── home.js
│   │   └── home.js.map
│   └── services/
│       ├── user.js
│       └── user.js.map
├── package-lock.json
├── package.json
├── src/
│   ├── app.ts
│   ├── index.ts
│   ├── models/
│   │   ├── address.ts
│   │   ├── company.ts
│   │   └── user.ts
│   ├── routes/
│   │   └── home.ts
│   └── services/
│       └── user.ts
├── tests/
│   ├── home.spec.ts
│   └── tslint.json
├── tsconfig.json
├── tsconfig.prod.json
├── tslint.json
└── views/
    └── home.ejs
```

Minimal structure(no tslint/eslint/prettier/vscode/docs)

```bash
typolar new myapp --no-tslint --no-prettier --no-init --no-install --clean
```

```text
myapp/
├── .editorconfig
├── .env
├── .env.template
├── .gitattributes
├── .gitignore
├── .typolarrc
├── config/
│   ├── app.json
│   └── logger.json
├── lib/
├── package.json
├── src/
│   ├── app.ts
│   ├── index.ts
│   ├── models/
│   ├── routes/
│   └── services/
├── tests/
├── tsconfig.json
├── tsconfig.prod.json
└── views/
```

## NPM Commands

Start app in dev mode

```bash
npm run dev
```

Start app in dev mode and watch source files change for restarting

```bash
npm run watch
```

Start app in dev mode and watch source files change for restarting

```bash
npm run watch
```

Run tests

```bash
npm test
```

Build sources

```bash
npm run build
```

Start app in production mode(requires a successful build)

```bash
npm start
```

Optional:

Build docs(requires `--docs` option set)

```bash
npm run docs
```

Format all soruce files(requires `--no-prettier` omitted)

```bash
npm run format
```

Lint all soruce files(requires `--no-tslint` omitted)

```bash
npm run lint
```

## Git hooks

By default a pre-commit git hook is installed. It will lint your staged files before commit. To disable it, pass `--no-hook` option

> If you set `--no-init` which tells the cli to skip git init for your project, hooks will also be skipped. Same for `--no-tslint` which skips tslint integration

## VSCode

Requires `--vscode` option set

> By default, a couple of files are pre-configured to be excluded from vscode's explorer view to make your workspace neat. Set `--no-hide` option if you think it unneccessary

### Debug

Three launch configs:

-   Launch Program (run in test mode)
-   Watch Debug (run in test mode and watch source files change)
-   Mocha Tests (debug test cases)

## Extensions

Open extensions panel, type in `@recommended`, see **Workspace Recommendations**

> All extensions are pre-configured in your workspace

Highly recommended

-   [Mocha Test Explorer](https://marketplace.visualstudio.com/items?itemName=hbenl.vscode-mocha-test-adapter)
-   [TSLint](https://marketplace.visualstudio.com/items?itemName=eg2.tslint)
-   [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
-   [Apache Conf](https://marketplace.visualstudio.com/items?itemName=mrmlnc.vscode-apache)

Recommended

-   [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
-   [vscode-icons](https://marketplace.visualstudio.com/items?itemName=robertohuertasm.vscode-icons)
-   [GitLens — Git supercharged](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens)
-   [Bracket Pair Colorizer](https://marketplace.visualstudio.com/items?itemName=CoenraadS.bracket-pair-colorizer)
-   [Path Intellisense](https://marketplace.visualstudio.com/items?itemName=christian-kohler.path-intellisense)
-   [Bookmarks](https://marketplace.visualstudio.com/items?itemName=alefragnani.Bookmarks)

### Tasks

-   run:dev
-   run:watch
-   build:lib (default build task)
-   build:docs
-   test:all (default test task)
-   test:current
-   lint:all
-   format:all
-   format:dirty
-   clean:docs
-   clean:build
-   view:docs

## Config

All config files are in _config_ folder(in your project root directory). You can override almost all files with env vars.

e.g.

```bash
APP_PORT=8080 npm run dev
```

Alternatively you may set envs in the _.env_ file(in your project root directory). Available vars are listed in _.env.template_

```conf
[global]
# ENV_FILE
# CONFIG_FILE

[app]
# APP_HOST
# APP_PORT
[app.router]
# APP_ROUTER_STYLE
# APP_ROUTER_BASEURL
# APP_ROUTER_MOCK
# APP_ROUTER_PATH
[app.service]
# APP_SERVICE_BASEURL
# APP_SERVICE_REVIVER
# APP_SERVICE_REPLACER
[app.view]
# APP_VIEW_ENGINE
# APP_VIEW_PATH

[logger]
# LOG_HTTP_STYLE
# LOG_APPENDERS
# LOG_LEVEL
# LOG_STACK_PRETTY
```

You can extend existing configs or add new configs. See [kuconfig](https://github.com/seancheung/kuconfig)

## Framework

See [typolar](https://github.com/seancheung/typolar)

## License

See [License](https://github.com/seancheung/typolar-cli/blob/master/LICENSE)
