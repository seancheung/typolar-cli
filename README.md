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

## Framework

See [typolar](https://github.com/seancheung/typolar)

## License

See [License](https://github.com/seancheung/typolar-cli/blob/master/LICENSE)
