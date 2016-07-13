/* global atom */

"use strict";

const child_process = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

module.exports = {
  activate() {
    atom.
      commands.
      add("atom-text-editor", {
        "gpp-compiler:compile": () => {
          compileFile(getFileType());
        },
        "gpp-compiler:gdb": () => {
          compileFile(getFileType(), [
            "-g"
          ], true);
        }
      });
    atom.
      commands.
      add(".tree-view .file", {
        "gpp-compiler:tree-compile": treeCompile
      });
  },
  config: {
    addCompilingErr: {
      title: "Add `compiling_error.txt`",
      type: "boolean",
      default: true,
      description: "Add a file named `compiling_error.txt` if compiling goes wrong"
    },
    runAfterCompile: {
      title: "Run After Compile",
      type: "boolean",
      default: true,
      description: "Run program after compiling is done"
    },
    fileExtension: {
      title: "File Extension",
      type: "string",
      default: "",
      description: "Extension of compiled file"
    },
    gccOptions: {
      title: "gcc Options",
      type: "string",
      default: "",
      description: "gcc command line options"
    },
    gppOptions: {
      title: "g++ Options",
      type: "string",
      default: "",
      description: "g++ command line options"
    }
  }
};

// if the user is running linux, add the option to change default terminal
if (process.platform === "linux") {
  module.
    exports.
    config.
    linuxTerminal = {
      title: "Linux terminal",
      type: "string",
      default: "XTerm",
      enum: [
        "XTerm",
        "GNOME Terminal",
        "Konsole",
        "xfce4-terminal",
        "pantheon-terminal"
      ]
    };
}

function getFileType(ext) {
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
  switch (fileType) {
    case "C":
      return "gcc";
    case "C++":
      return "g++";
  }
}

function getFilePath() {
  return atom.
    workspace.
    getActiveTextEditor().
    buffer.
    file;
}

function getArgs(files, output, fileType, extraArgs) {
  // atom throws a SyntaxError if you use ES6's default parameters
  if (!extraArgs) {
    extraArgs = [];
  }

  // array of arguments to pass to gcc or g++
  return [
    ...extraArgs,
    ...atom.
      config.
      // string of all user-defined options
      get(`gpp-compiler.g${fileType === "gcc" ? "cc" : "pp"}Options`).
      // turn that string into an array separated by spaces
      split(" ").
      // remove falsy elements
      filter(Boolean),
    ...files,
    "-o",
    output
  ];
}

function getTmp(base) {
  return path.join(os.tmpdir(), base);
}

function compileFile(fileType, extraArgs, gdb) {
  const file = getFilePath();

  if (file) {
    const filePath = file.path;
    const info = path.parse(filePath);

    compile(getCommand(fileType), info, getArgs([
      filePath
    ], getTmp(info.name), fileType, extraArgs), gdb);
  } else {
    atom.
      notifications.
      add("error", "<strong>File not found.</strong><br/>Save before compiling.");
  }
}

function treeCompile(e) {
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
  compile(getCommand(fileType), info, getArgs(files, getTmp(info.name), fileType));
}

// spawn gcc or g++ to compile files and optionally run the compiled files
function compile(command, info, args, gdb) {
  // store the current editor in the editor variable
  const editor = atom.
    workspace.
    getActiveTextEditor();

  // if the user has an editor open, save it
  if (editor) {
    editor.save();
  }

  // set custom output file extension
  if (atom.config.get("gpp-compiler.fileExtension")) {
    info.name += `.${atom.config.get("gpp-compiler.fileExtension")}`;
  }

  // spawn gcc/g++ with the working directory of info.dir
  const child = child_process.spawn(command, args, {
    cwd: info.dir
  });

  // if the compile exits with a non-zero status, alert the user the error
  let stderr = "";

  child.
    stderr.
    on("data", (data) => {
      stderr += data;
    });
  // callback when the child's stdio streams close
  child.on("close", (code) => {
    // if the exit code is a non-zero status, alert the user stderr
    if (code) {
      atom.
        notifications.
        add("error", stderr.replace(/\n/, ""));

      if (atom.config.get("gpp-compiler.addCompilingErr")) {
        fs.writeFile(path.join(info.dir, "compiling_error.txt"), stderr);
      }
    } else {
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
          const file = getTmp(info.name);

          let command = null;
          let args = null;

          switch (terminal) {
            case "GNOME Terminal":
              command = "gnome-terminal";
              args = [
                "--command"
              ];

              break;
            case "Konsole":
              command = "konsole";
              args = [
                ...(gdb ? [] : [
                  "--hold"
                ]),
                "-e"
              ];

              break;
            case "xfce4-terminal":
              command = "xfce4-terminal";
              args = [
                ...(gdb ? [] : [
                  "--hold"
                ]),
                "--command"
              ];

              break;
            case "pantheon-terminal":
              command = "pantheon-terminal";
              args = [
                "-e"
              ];

              break;
            default:
              command = "xterm";
              args = [
                ...(gdb ? [] : [
                  "-hold"
                ]),
                "-e"
              ];
          }

          child_process.spawn(command, [
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
          child_process.exec(`start "${info.name}" cmd /C "${path.join(info.dir, info.name)} & echo. & pause"`);
        } else if (process.platform === "darwin") {
          // if the platform is mac, spawn open, which does the same thing as
          // Windows' start, but is not a builtin, so we can child_process.spawn
          // it
          child_process.spawn("open", [
            info.name
          ], options);
        }
      } else {
        // if the user doesn't want the program to run after compilation, give
        // them an alert telling them it was successful
        atom.
          notifications.
          add("success", "Compiling successful");
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
