/* jshint node: true, browser: true */
/* globals atom */
"use strict";

const child_process = require("child_process");
const fs = require("fs");
const path = require("path");

module.exports = {
  // function that gets called on package activate
  activate: () => {
    // make gpp-compiler:compileGpp (bound to F5) call compileGpp()
    atom.commands.add("atom-text-editor", "gpp-compiler:compile-gpp", compileGpp);
    // make clicking "Compile and Run C++" in tree view call treeCompileGpp()
    atom.commands.add(".tree-view .file", "gpp-compiler:tree-compile-gpp", treeCompileGpp);
    // make gpp-compiler:compileGcc (bound to F5) call compileGcc()
    atom.commands.add("atom-text-editor", "gpp-compiler:compile-gcc", compileGcc);
    // make clicking "Compile and Run C" in tree view call treeCompileGcc()
    atom.commands.add(".tree-view .file", "gpp-compiler:tree-compile-gcc", treeCompileGcc);
  },
  // options
  config: {
    addCompilingErr: {
      title: "Add compiling_error.txt",
      type: "boolean",
      default: true,
      description: "Add a file named \"compiling_error.txt\" if compiling goes wrong"
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
    gppOptions: {
      title: "gcc/g++ Options",
      type: "string",
      default: "",
      description: "g++ command line options"
    }
  }
};

// if the user is running linux, add the option to change default terminal
if (process.platform == "linux") {
  module.exports.config.linuxTerminal = {
    title: "Linux terminal",
    type: "string",
    default: "XTerm",
    enum: ["XTerm", "GNOME Terminal", "Konsole", "xfce4-terminal"]
  };
}

// wrapper for compile()
function compileGpp() {
  const file = atom.workspace.getActiveTextEditor().buffer.file;
  if (file) {
    const filePath = file.path;
    compile("g++", [filePath], path.parse(filePath));
  } else {
    atom.notifications.add("error", "<strong>Compiling error</strong>: File not found.<br/>Save before compiling.");
  }
}

// wrapper for treeCompile() to compile C++
function treeCompileGpp(e) {
  treeCompile(e, "g++");
}

// wrapper for compile() to compile C
function compileGcc() {
  const file = atom.workspace.getActiveTextEditor().buffer.file;
  if (file) {
    const filePath = file.path;
    compile("gcc", [filePath], path.parse(filePath));
  } else {
    atom.notifications.add("error", "<strong>Compiling error</strong>: File not found.<br/>Save before compiling.");
  }
}

// wrapper for treeCompile() to compile C
function treeCompileGcc(e) {
  treeCompile(e, "gcc");
}

// wrapper compile() to compile C or C++
function treeCompile(e, command) {
  // array of all selected tree view files
  const names = document.querySelectorAll(".tree-view .file.selected > .name");
  // array of files to compile
  const files = [];
  // file right clicked on
  let element = e.target;
  if (element.classList.contains("file")) {
    element = element.firstChild;
  }
  // loop through every selected file and push them to files if they are an HTML element
  for (const i in names) {
    if (names[i] instanceof HTMLElement) {
      files.push(names[i].getAttribute("data-path"));
    }
  }
  // call compile, telling it to compile either C++ or C
  compile(command, files, path.parse(element.getAttribute("data-path")));
}

// spawn gcc or g++ to compile files and possibly run the compiled files
function compile(command, files, info) {
  // store the current editor in the editor variable
  const editor = atom.workspace.getActiveTextEditor();
  // array of arguments to pass to gcc or g++
  const args = [];
  // if the user has an editor open, save it
  if (editor) {
    editor.save();
  }
  // set custom output file extension
  if (atom.config.get("gpp-compiler.fileExtension")) {
    // info.name += "." + atom.config.get("gpp-compiler.fileExtension");
    info.name += `.${atom.config.get("gpp-compiler.fileExtension")}`;
  }
  // extend arguments and files
  // TODO: test if `args = [args, ...files];` works
  for (const i in files) {
    args.push(files[i]);
  }
  // set output filename
  args.push("-o");
  args.push(info.name);
  // add custom gcc/g++ arguments
  const userArgs = atom.config.get("gpp-compiler.gppOptions").split(" ");
  for (const i in userArgs) {
    if (userArgs[i]) {
      args.push(userArgs[i]);
    }
  }
  // spawn gcc/g++ with the working directory of info.dir
  const child = child_process.spawn(command, args, {
    cwd: info.dir
  });
  // if the compile exits with a non-zero status, alert the user the error
  let stderr = "";
  child.stderr.on("data", (data) => {
    stderr += data;
  });
  // callback when the child's stdio streams close
  child.on("close", (code) => {
    // if the exit code is a non-zero status, alert the user stderr
    if (code) {
      atom.notifications.add("error", stderr.replace(/\n/, ""));
      if (atom.config.get("gpp-compiler.addCompilingErr")) {
        fs.writeFile(path.join(info.dir, "compiling_error.txt"), stderr);
      }
    } else {
      // if the user wants the program to run after compilation, run it in their favorite terminal
      if (atom.config.get("gpp-compiler.runAfterCompile")) {
        // options to tell child_process.spawn() to run in the directory of the program
        const options = {
          cwd: info.dir
        };
        // if the platform is Windows, run execute start (which is a shell builtin, so we can't
        // use child_process.spawn), which simulates double clicking the program
        if (process.platform == "linux") {
          // if the platform is linux, spawn the program in the user set terminal
          const terminal = atom.config.get("gpp-compiler.linuxTerminal");
          if (terminal == "GNOME Terminal") {
            child_process.spawn("gnome-terminal", ["--command", path.join(info.dir, info.name)], options);
          } else if (terminal == "Konsole") {
            child_process.spawn("konsole", ["--hold", "-e", path.join(info.dir, info.name)], options);
          } else if (terminal == "xfce4-terminal") {
            child_process.spawn("xfce4-terminal", ["--hold", "--command", path.join(info.dir, info.name)], options);
          } else {
            child_process.spawn("xterm", ["-hold", "-e", path.join(info.dir, info.name)], options);
          }
        } else if (process.platform == "win32") {
          console.log(`start "${info.name}" cmd /C "${info.name} & echo. & pause"`, options);
          child_process.exec(`start "${info.name}" cmd /C "${info.name} & echo. & pause"`, options);
          child_process.exec(`start "${info.name}" "${info.name}"`);
        } else if (process.platform == "darwin") {
          // if the platform is mac, spawn open, which does the same thing as Windows' start, but
          // is not a builtin, so we can child_process.spawn it
          child_process.spawn("open", [info.name], options);
        }
      } else {
        // if the user doesn't want the program to run after compilation, give them an alert
        // telling them it was successful
        atom.notifications.add("success", "Compiling successful");
      }
      // since the compilation was successful, remove compiling_error.txt if it exists
      fs.stat(path.join(info.dir, "compiling_error.txt"), (err) => {
        if (!err) {
          fs.unlink(path.join(info.dir, "compiling_error.txt"));
        }
      });
    }
  });
}
