# Project root <span style="background-color: #FFF117; color: #222222; padding: 10px; border-radius: 100px; font-size: 19.2px; vertical-align: top;">4 <span style="font-size: 28.799999999999997px; vertical-align: middle; font-weight: 300;">/</span> 235</span>
# Overview
_____
 - Framework
     - Packages
         - Workspace root `@hurx/root`
             - The root for the official @hurx workspace
             - Config file
                 - Specify all repositories
                 - Specify build options
                     - Specify test coverage percentage requirement
             - Install
                 - Installs all the repositories that build up the framework
                     - Each repository is put in the /projects folder and will be installed
                     - All the repositories are linked with npm link
             - Commit
                 - Makes a git commit for all the repositories with changes and pushes it
             - Build
                 - Convert all linked repositories to actual dependencies in package.json
                 - Make sure everything is tested
             - Watch
                 - Watches all repositories for changes
                     - Automatically build
                 - User input
                     - Starting a project while in watch mode
         - Core functionality `@hurx/core`
             - Plugins
                 - Documentation generator `@hurx/docs`
                 - Code coverage generator `@hurx/coverage`
             - Modules
                 - Package configuration
                     - `hurx.json` file
                         - Environments
                             - Name `dev`
                             - Branch `origin/development`
                             - All other fields of `config.hurx`
                                 - Override base values when in environment
                         - Logging
                             - Files
                                 - Save logs `dist/logs`
                                 - Saves analytics `dist/logs/analytics`
                                 - Saves errors `dist/logs/errors`
                             - Level
                                 - `trace`, `debug` or `verbose`
                         - Testing
                             - Coverage directory `dist/code-coverage`
                         - Building
                             - Options
                                 - Generate source maps
                                 - Uglify
                             - Output directory for javascript source `dist/js`
                                 - Contains a modified `package.json` and `version.txt`
                                 - Contains `.d.ts` file(s)
                                 - Automatically create `index.js` files
                             - Output directory for native source `dist/native`
                                 - Generate iOS (swift) project `dist/native/swift`
                                 - Generate Android (kotlin) project `dist/native/kotlin`
                             - Bundle
                                 - One minified file `dist/bundle/[package name].min.js`
                                     - Contains all code
                                     - Main method will be called upon loading
                                     - Dependencies from `node_modules` are parsed as well
                         - Package
                             - Name
                             - Version
                                 - Automatically increment
                     - Package types
                         - Workspace
                             - Container for multiple projects
                             - Automatically links local projects to npm
                         - Command line interface (CLI)
                             - Uses `bin` as the output directory
                         - User interface
                         - Server
                         - Library
                         - Plugin
                             - A plugin to make `hurx` development more streamlined for certain contexts
                 - Regex
                     - Alpha functionality
                     - Recursive regex
                     - Finetuning
                         - Performance
                         - Readability
                         - Naming conventions
                 - Terminal
                     - Logger
                         - Analytics
                             - Saves a log in `dist/logs/analytics`
                         - Errors
                             - Saves an error log in `dist/logs/errors`
                         - Pretty printing
                         - Debug levels
                             - Trace
                             - Debug
                             - Verbose
                     - Input
                         - Prompt for user text input
                         - Prompt for a user select menu
                 - Theme
                     - Color functionality
                 - Watcher
                 - Events
                     - Transmitter
                     - Handler
                 - Loader `@hurx/loader`
                     - Load a TypeScript module into a Hurx module
                     - Load a Hurx module into a TypeScript module
                 - Transpiler `@hurx/transpiler`
                     - Transpiles everything to the latest version of `typescript`
                 - Meta `@hurx/meta`
                     - Meta programming that allows the user to generate parts of their codebase
                 - Testing `@hurx/testing`
                     - Mocking
                     - Assertions
                     - Coverage reports
                         - Generates a  web interface that displays the covered code in tests throughout the project
         - Textmate `@hurx/textmate`
             - Tokenizer
                 - Matches
                 - Begin match
                     - End match
                     - While match
                     - applyEndPatternLast = 1
                 - Capture groups
                     - Nested structures
             - Grammar builder
         - Language `@hurx/language`
         - Vscode extension `@hurx/vscode`
             - Client
             - Server
         - Debugging `@hurx/debugging`
             - Create debug server based on node.js
             - Integrate with vscode debugger
         - The command line interface (CLI) `@hurx/cli`
             - Uses the project type `cli`
             - `hurx`
                 - Prompts the user to select a command
                 - New `hurx new`
                     - `hurx new`
                         - Prompts the user to select a context
                     - Project `hurx new project`
                     - Workspace `hurx new workspace`
                 - Run `hurx run [environment name]`
                     - `hurx run`
                         - Prompts the user to select an `environment`
                         - Then runs `hurx run [environment]`
                     - Watches all files in the current hurx project
                         - Generate `tsconfig.json`
                     - Workspace
                         - Automatically build projects
                     - User input
                         - Any `cli` command except `env`
                     - Automatically launches a debug host
                     - Hot module reloading
                         - Uses `webpack` hot reload server for user interfaces
                 - Compile `hurx compile`
                     - Generates typescript codebase `dist/ts`
                         - All `.hurx` files will be converted to `.ts`
                     - Runs `tsc`
                         - Watches for file changes if there are errors
                         - Upon file change `tsc` runs again
                 - Building `hurx build`
                     - Prompts the user to select an `environment`
                         - Then runs `hurx build [environment]`
                     - `hurx build [environment]`
                         - Uses the build options in `hurx.json`
                 - Installing a project/workspace `hurx install [package name]`
                     - Clones an npm package or github repository
                         - Configurable on the website
                 - Config `hurx config`
                     - Configuration for the `hurx` command
                     - Organisation `hurx config organisation`
                         - Specify your organisation, so `hurx install`prompts the available packages
                 - Identify `hurx identify`
                     - Use your `hurx.io` account to identify yourself to the `cli`
                     - Creates a local access token, which expires based on `hurx.io`
                 - `--flags`
                     - Can be used anywhere in the args
                         - `--verbose`
                         - `--debug`
                         - `--trace`
                         - `--h`, `--help`
                             - Shows help based on the args
 - Website `hurx.io`
     - Management `manage.hurx.io`
         - Remembers the page you left off and redirects
         - Shows a dashboard page
         - Manage organisation `/[organisation id]`
             - Automatically detects whether it's a user or organisation
             - Basic information
                 - Branding
                     - Logo
             - Monetization `/monetization` or `monetization.hurx.io/[organisation id]`
                 - Freelance
                 - Marketplace
             - Analytics `/analytics` or `analytics.hurx.io/[organisation id]`
                 - Error logs per package `(Logger.error)`
                 - Analytic logs per package `(Logger.analytics)`
             - Packages  `/packages` or `packages.hurx.io/[organisation id]`
                 - An overview of all organisation packages
                 - Package `/[package id]`
                     - A dashboard page to manage a specific package
                     - Codebase `/codebase` or `codebase.hurx.io/[organisation id]/[package id]`
                         - Shows the documentation for a `hurx` project based on its `jsDoc` and `@doc` declarations
                         - Coverage  `/coverage`
                             - Shows the coverage of documentation and tests in your codebase
                     - Specify `git` repository
                     - Specify `npm`/`yarn` package
             - Users  `/users`
                 - User groups
                     - Privileges per user group
                 - An overview of all users with access to the `organisation`
         - Manage account `/account` or `account.hurx.io`
     - Forums `forums.hurx.io`
         - Topics
             - Freelance `/freelance`
                 - A place where people can post their `freelance` jobs
             - Suggestions `/suggestions`
                 - Developers can post their suggestions for the `hurx language` here
             - `[Much more]`
         - User groups
             - Forum moderator
     - Docs `docs.hurx.io/[organisation id]`
         - The documentation page for an organisation and its packages
         - `docs.hurx.io` automatically redirects to `docs.hurx.io/@hurx`
     - Packages `packages.hurx.io`
         - An overview of all packages
             - Free packages
             - Paid packages
                 - License based
             - Filters
                 - Categories
                 - Types
                 - Tags
     - Academy `academy.hurx.io`
         - A place where people can learn to program, by using the `Hurx` language
         - Users can get certificates for taking online `exams`
             - These are shown on the forums `forums.hurx.io`
______
# Todo's
______
## [Framework](./dist/0/readme.md) <span style="background-color: #FFF117; color: #222222; padding: 10px; border-radius: 100px; font-size: 14.399999999999999px; vertical-align: top;">4 <span style="font-size: 21.599999999999998px; vertical-align: middle; font-weight: 300;">/</span> 180</span>
_____
## [Website `hurx.io`](./dist/1/readme.md) <span style="background-color: #FF1744; color: #FFFFFF; padding: 10px; border-radius: 100px; font-size: 14.399999999999999px; vertical-align: top;">0 <span style="font-size: 21.599999999999998px; vertical-align: middle; font-weight: 300;">/</span> 55</span>
_____
You can support us [here](https://www.buymeacoffee.com/hurx), if you like the language!