/* jshint node: true, browser: true */
/* globals atom */
"use strict";

var child_process = require("child_process");
var fs = require("fs");
var path = require("path");

module.exports = {
  activate: () => {
    atom.commands.add("atom-text-editor", "gpp-compiler:f5Compile", f5Compile);
    atom.commands.add(
      ".tree-view .file",
      "gpp-compiler:treeCompile",
      treeCompile
    );
  },
  config: {
    addCompilingErr: {
      title: "Add compiling_error.txt",
      type: "boolean",
      default: true,
      description: "Add a file named \"compiling_error.txt\" if compiling" +
                   " goes wrong"
    },
    runAfterCompile: {
      title: "Run after compile",
      type: "boolean",
      default: true,
      description: "Run program after compiling is done"
    },
    fileExtension: {
      title: "File extension",
      type: "string",
      default: "",
      description: "Extension of compiled file"
    },
    gppOptions: {
      title: "g++ options",
      type: "string",
      default: "",
      description: "g++ command line options"
    }
  }
};

if (process.platform == "linux") {
  module.exports.config.linuxTerminal = {
    title: "Linux terminal",
    type: "string",
    default: "XTerm",
    enum: ["XTerm", "GNOME Terminal", "Konsole", "xfce4-terminal"]
  };
}

function compile(e, files, info) {
  var editor = atom.workspace.getActiveTextEditor();
  var args = [];
  if (editor) {
    editor.save();
  }
  if (atom.config.get("gpp-compiler.fileExtension")) {
    info.name += "." + atom.config.get("gpp-compiler.fileExtension");
  }
  for (let i in files) {
    args.push(files[i]);
  }
  args.push("-o");
  args.push(info.name);
  var userArgs = atom.config.get("gpp-compiler.gppOptions").split(" ");
  for (let i in userArgs) {
    if (userArgs[i]) {
      args.push(userArgs[i]);
    }
  }
  var child = child_process.spawn("g++", args, {
    cwd: info.dir
  });
  var stderr = "";
  child.stderr.on("data", (data) => {
    stderr += data;
  });
  child.on("close", (code) => {
    if (code) {
      atom.notifications.add("error", stderr.replace(/\n/, ""));
      if (atom.config.get("gpp-compiler.addCompilingErr")) {
        fs.writeFile(path.join(info.dir, "compiling_error.txt"), stderr);
      }
    } else {
      if (atom.config.get("gpp-compiler.runAfterCompile")) {
        if (process.platform == "win32") {
          child_process.exec("start " +
                             escapeArg(info.name) +
                             " " +
                             escapeArg(info.name), {
            cwd: info.dir
          });
        } else if (process.platform == "linux") {
          var terminal = atom.config.get("gpp-compiler.linuxTerminal");
          if (terminal == "GNOME Terminal") {
            child_process.spawn("gnome-terminal", ["--command", path.join(
              info.dir,
              info.name
            )]);
          } else if (terminal == "Konsole") {
            child_process.spawn("konsole", ["--hold", "-e", path.join(
              info.dir,
              info.name
            )]);
          } else if (terminal == "xfce4-terminal") {
            child_process.spawn("xfce4-terminal", [
              "--hold",
              "--command",
              path.join(info.dir, info.name),
            ]);
          } else {
            child_process.spawn("xterm", ["-hold", "-e", path.join(
              info.dir,
              info.name
            )]);
          }
        } else if (process.platform == "darwin") {
          child_process.spawn("open", [info.name], {
            cwd: info.dir
          });
        }
      } else {
        atom.notifications.add("success", "Compiling successful");
      }
      fs.readLine(path.join(info.dir, "compiling_error.txt"), function(err) {
        if (!err) {
          fs.unlink(path.join(info.dir, "compiling_error.txt"));
        }
      });
    }
  });
}

function treeCompile(e) {
  var names = document.querySelectorAll(".tree-view .file.selected > .name");
  var files = [];
  var element = e.target;
  if (element.classList.contains("file")) {
    element = element.firstChild;
  }
  for (let i in names) {
    if (names[i] instanceof HTMLElement) {
      files.push(names[i].getAttribute("data-path"));
    }
  }
  compile(null, files, path.parse(element.getAttribute("data-path")));
}

function f5Compile() {
  var file = atom.workspace.getActiveTextEditor().buffer.file.path;
  compile(null, [file], path.parse(file));
}

function escapeArg(arg){
  return "\"" + arg + "\"";
}
