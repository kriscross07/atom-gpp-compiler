/* global atom */
"use strict";

const child_process = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");
// const {CompositeDisposable} = require("atom");
const CompositeDisposable = require("atom").CompositeDisposable;

module.exports = {
  activate() {
    debug("activate()");
    debug("platform", process.platform);

    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.
      commands.
      add("atom-text-editor", {
        "gpp-compiler:compile": () => {
          debug("gpp-compiler:compile");
          compileFile(getFileType());
        },
        "gpp-compiler:gdb": () => {
          debug("gpp-compiler:gdb");
          compileFile(getFileType(), true);
        }
      }));
    this.subscriptions.add(atom.
      commands.
      add(".tree-view .file", {
        "gpp-compiler:tree-compile": treeCompile,
        "gpp-compiler:tree-gdb": (e) => {
          debug("gpp-compiler:tree-gdb");
          treeCompile(e, true);
        }
      }));
  },
  config: {
    addCompilingErr: {
      default: true,
      description: "Add a file named `compiling_error.txt` if compiling goes wrong",
      title: "Add `compiling_error.txt`",
      type: "boolean"
    },
    debug: {
      default: false,
      description: "Logs function calls in console.",
      title: "Debug Mode",
      type: "boolean"
    },
    cCompilerOptions: {
      default: "",
      description: "C compiler command line options",
      title: "C Compiler Options",
      type: "string"
    },
    cppCompilerOptions: {
      default: "",
      description: "C++ compiler command line options",
      title: "C++ Compiler Options",
      type: "string"
    },
    runAfterCompile: {
      default: true,
      description: "Run program after compiling is done",
      title: "Run After Compile",
      type: "boolean"
    },
    showWarnings: {
      default: true,
      description: "Show compile warnings.",
      title: "Show Warnings",
      type: "boolean"
    },
    cCompiler: {
      default: "gcc",
      title: "C Compiler",
      type: "string"
    },
    cppCompiler: {
      default: "g++",
      title: "C++ Compiler",
      type: "string"
    },
    compileToTmpDirectory: {
      default: true,
      title: "Compile to Temporary Directory",
      type: "boolean"
    }
  },
  deactivate() {
    debug("deactivate()");
    this.subscriptions.dispose();
  },
  subscriptions: null
};

// if the user is running linux, add the option to change default terminal
if (process.platform === "linux") {
  module.
    exports.
    config.
    linuxTerminal = {
      default: "XTerm",
      enum: [
        "XTerm",
        "GNOME Terminal",
        "Konsole",
        "xfce4-terminal",
        "pantheon-terminal",
        "URxvt",
        "MATE Terminal"
      ],
      title: "Linux terminal",
      type: "string"
    };
}

function debug(...args) {
  if (atom.config.get("gpp-compiler.debug")) {
    console.info(...args);
  }
}

function getFileType(ext) {
  debug("getFileType()", ext);

  if (ext) {
    for (const grammar of atom.grammars.getGrammars()) {
      for (const fileType of grammar.fileTypes) {
        if (ext === `.${fileType}`) {
          return grammar.name;
        }
      }
    }
  } else {
    return atom.
      workspace.
      getActiveTextEditor().
      getGrammar().
      name;
  }
}

function getCommand(fileType) {
  debug("getCommand()", fileType);

  switch (fileType) {
    case "C":
      return atom.config.get("gpp-compiler.cCompiler");
    case "C++":
      return atom.config.get("gpp-compiler.cppCompiler");
  }
}

function getFilePath() {
  debug("getFilePath()");

  return atom.
    workspace.
    getActiveTextEditor().
    buffer.
    file;
}

function getArgs(files, output, fileType, extraArgs) {
  debug("getArgs()", files, output, fileType, extraArgs);

  // atom throws a SyntaxError if you use ES6's default parameters
  if (!extraArgs) {
    extraArgs = [];
  }

  // array of arguments to pass to the compiler
  const args = [
    ...extraArgs,
    ...files,
    "-o",
    output,
    ...atom.
      config.
      // string of all user-defined options
      get(`gpp-compiler.c${fileType === "C++" ? "pp" : ""}CompilerOptions`).
      // turn that string into an array separated by spaces
      split(" ").
      // remove falsy elements
      filter(Boolean)
  ];

  debug("compiler args", args);

  return args;
}

function getCompiledPath(dir, base) {
  debug("getCompiledPath()", dir, base);

  if (atom.config.get("gpp-compiler.compileToTmpDirectory")) {
    return path.join(os.tmpdir(), base);
  } else {
    return path.join(dir, base);
  }
}

function compileFile(fileType, gdb) {
  debug("compileFile()", fileType, gdb);

  const file = getFilePath();

  if (file) {
    const filePath = file.path;
    const info = path.parse(filePath);

    compile(getCommand(fileType), info, getArgs([
      filePath
    ], getCompiledPath(info.dir, info.name), fileType, gdb ? [
      "-g"
    ] : null), gdb);
  } else {
    atom.
      notifications.
      addError("<strong>File not found.</strong><br/>Save before compiling.");
  }
}

function treeCompile(e, gdb) {
  debug("treeCompile()", gdb);

  // array of all selected tree view files
  const names = Array.from(document.querySelectorAll(".tree-view .file.selected > .name"));
  // array of files to compile
  const files = names.
    // remove elements that are not of instance HTMLElement
    filter((name) => name instanceof HTMLElement).
    // replace all elements with their attribute `data-path`
    map((element) => element.getAttribute("data-path"));

  // file right clicked on
  let element = e.target;

  if (element.classList.contains("file")) {
    element = element.firstChild;
  }

  const info = path.parse(element.getAttribute("data-path"));
  const fileType = getFileType(info.ext);

  // call compile, telling it to compile either C++ or C
  compile(getCommand(fileType), info, getArgs(files, getCompiledPath(info.dir, info.name), fileType, gdb ? [
    "-g"
  ] : null), gdb);
}

// spawn the compiler to compile files and optionally run the compiled files
function compile(command, info, args, gdb) {
  debug("compile()", command, info, args, gdb);
  debug("config", atom.config.get("gpp-compiler"));

  const editor = atom.
    workspace.
    getActiveTextEditor();

  // if the user has a text editor open, save it
  if (editor) {
    debug("saving...");
    editor.save();
  } else {
    debug("no editor");
  }

  // spawn the compiler with the working directory of info.dir
  const child = child_process.spawn(command, args, {
    cwd: info.dir
  });

  // if the compile exits with a non-zero status, alert the user the error
  let stderr = "";

  child.
    stderr.
    on("data", (data) => {
      stderr += data;

      debug("stderr", data.toString());
    });
  // callback when the child's stdio streams close
  child.on("close", (code) => {
    debug("exit code", code);

    // if the exit code is a non-zero status, alert the user stderr
    if (code) {
      atom.
        notifications.
        addError(stderr.replace(/\n/g, "<br/>"));

      if (atom.config.get("gpp-compiler.addCompilingErr")) {
        fs.writeFile(path.join(info.dir, "compiling_error.txt"), stderr);
      }
    } else {
      // compilation was successful, but there still may be warnings
      if (stderr && atom.config.get("gpp-compiler.showWarnings")) {
        atom.notifications.addWarning(stderr.replace(/\n/g, "<br/>"));
      }

      // if the user wants the program to run after compilation, run it in their
      // favorite terminal
      if (atom.config.get("gpp-compiler.runAfterCompile")) {
        // options to tell child_process.spawn() to run in the directory of the
        // program
        const options = {
          cwd: info.dir
        };

        if (process.platform === "linux") {
          // if the platform is linux, spawn the program in the user set
          // terminal
          const terminal = atom.
            config.
            get("gpp-compiler.linuxTerminal");
          const file = getCompiledPath(info.dir, info.name);

          let terminalCommand = null;
          let args = null;

          switch (terminal) {
            case "GNOME Terminal":
              terminalCommand = "gnome-terminal";
              args = [
                "--command"
              ];

              break;
            case "Konsole":
              terminalCommand = "konsole";
              args = [
                ...(gdb ? [] : [
                  "--hold"
                ]),
                "-e"
              ];

              break;
            case "xfce4-terminal":
              terminalCommand = "xfce4-terminal";
              args = [
                ...(gdb ? [] : [
                  "--hold"
                ]),
                "--command"
              ];

              break;
            case "pantheon-terminal":
              terminalCommand = "pantheon-terminal";
              args = [
                "-e"
              ];

              break;
            case "URxvt":
              terminalCommand = "urxvt";
              args = [
                ...(gdb ? [] : [
                  "-hold"
                ]),
                "-e"
              ];

              break;
            case "MATE Terminal":
              terminalCommand = "mate-terminal";
              args = [
                "--command"
              ];

              break;
            default:
              terminalCommand = "xterm";
              args = [
                ...(gdb ? [] : [
                  "-hold"
                ]),
                "-e"
              ];
          }

          debug("command", terminalCommand, args, gdb, file, options);
          child_process.spawn(terminalCommand, [
            ...args,
            // is there a better one-liner than this?
            ...(gdb ? [
              "gdb"
            ] : []),
            file
          ], options);
        } else if (process.platform === "win32") {
          // if the platform is Windows, run start (which is a shell builtin, so
          // we can't use child_process.spawn), which spawns a new instance of
          // cmd to run the program
          const file = getCompiledPath(info.dir, info.name);
          const command = `start "${info.name}" cmd /C "${gdb ? "gdb" : ""} ${file} ${gdb ? "" : "& echo. & pause"}`;

          debug("command", command);
          child_process.exec(command, options);
        } else if (process.platform === "darwin") {
          // if the platform is mac, spawn open, which does the same thing as
          // Windows' start, but is not a builtin, so we can child_process.spawn
          // it
          child_process.spawn("open", [
            getCompiledPath(info.dir, info.name)
          ], options);
        }
      } else {
        // if the user doesn't want the program to run after compilation, give
        // them an alert telling them it was successful
        atom.
          notifications.
          addSuccess("Compilation Successful");
      }

      // since the compilation was successful, remove `compiling_error.txt` if
      // it exists
      fs.stat(path.join(info.dir, "compiling_error.txt"), (err) => {
        if (!err) {
          fs.unlink(path.join(info.dir, "compiling_error.txt"));
        }
      });
    }
  });
}
