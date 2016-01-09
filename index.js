/* jshint node: true */
/* globals atom */
"use strict";
var exec = require("child_process").exec;
var esc = require("shell-escape");
var fs = require("fs");
var parse = require("path").parse;

module.exports = {
  activate: function() {
    atom.commands.add("atom-text-editor", "gpp-compiler:compile", compile);
    atom.commands.add(".tree-view .file > .name", "gpp-compiler:treeCompile", treeCompile);
  },
  config: {
    addCompilingErr: {
      type: "boolean",
      default: true,
      title: "Add compiling_error.txt",
      description: "Add a file named \"compiling_error.txt\" if compiling goes wrong."
    },
    runAfterCompile: {
      type: "boolean",
      default: true,
      title: "Run after compile",
      description: "Run program after compiling is done"
    },
    fileExtension: {
      type: "string",
      default: "",
      title: "File extension",
      description: "Extension of compiled file"
    },
    gppOptions: {
      type: "string",
      default: "",
      title: "g++ options",
      description: "g++ command line options"
    }
  }
};

function compile(treePath) {
  var editor = atom.workspace.getActiveTextEditor();
  if (editor) {
    editor.save();
  }
  var info = parse(typeof treePath == "string" ? treePath : editor.getPath());
  if (atom.config.get("gpp-compiler.fileExtension")) {
    info.name += "." + atom.config.get("gpp-compiler.fileExtension");
  }
  if (process.platform == "win32") {
    exec("g++ \"" + info.base + "\" -o \"" + info.name + "\" " + atom.config.get("gpp-compiler.gppOptions"), {cwd: info.dir}, function(err, stdout, stderr) {
      onCompile(err, stdout, stderr, info);
    });
  } else {
    exec(esc(["g++", info.base, "-o", info.name]) + " " + atom.config.get("gpp-compiler.gppOptions"), {cwd: info.dir}, function(err, stdout, stderr) {
      onCompile(err, stdout, stderr, info);
    });
  }
}

function onCompile(err, stdout, stderr, info) {
  if (stderr) {
    atom.notifications.add("error", stderr.replace(/\n/g, "<br>"));
    if (atom.config.get("gpp-compiler.addCompilingErr")) {
      fs.writeFile(info.dir + "/compiling_error.txt", stderr);
    }
  } else {
    if (atom.config.get("gpp-compiler.runAfterCompile")) {
      if (process.platform == "win32") {
        exec("start \"" + info.name + "\" \"" + info.name + "\"", {
          cwd: info.dir
        });
      } else if (process.platform == "linux") {
        exec(esc(["xterm", "-hold", "-e", "./" + info.name]), {cwd: info.dir});
      } else if (process.platform == "darwin") {
        exec("open \"" + info.name.replace(/ /g, "\\ ") + "\"");
      }
      fs.readFile(info.dir + "/compiling_error.txt", function(err) {
        if (!err) {
          fs.unlink(info.dir + "/compiling_error.txt");
        }
      });
    }
    else {
      atom.notifications.addSuccess("Compiling succesful");
    }
  }
}

function treeCompile(e) {
  compile(e.target.getAttribute("data-path"));
}
