/* jshint node: true, browser: true, esnext: true */
/* globals atom */
"use strict";
var child_process = require("child_process");
var fs = require("fs");
var path = require("path");

module.exports = {
  activate: () => {
    atom.commands.add("atom-text-editor", "gpp-compiler:f5Compile", f5Compile);
    atom.commands.add(".tree-view .file", "gpp-compiler:treeCompile", treeCompile);
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

function compile(e, files, info) {
  var editor = atom.workspace.getActiveTextEditor();
	var args = [];
	var i;
  if (editor) {
    editor.save();
  }
	if (atom.config.get("gpp-compiler.fileExtension")) {
		info.name += "." + atom.config.get("gpp-compiler.fileExtension");
	}
	for (i in files) {
		args.push(files[i]);
	}
	args.push("-o");
	args.push(info.name);
	var userArgs = atom.config.get("gpp-compiler.gppOptions").split(" ");
	for (i in userArgs) {
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
				fs.writeFile(info.dir + "/compiling_error.txt", stderr);
			}
		} else {
			if (atom.config.get("gpp-compiler.runAfterCompile")) {
				if (process.platform == "win32") {
					child_process.spawn("start", [info.name, info.name], {
						cwd: info.dir
					});
				} else if (process.platform == "linux") {
					child_process.spawn("xterm", ["-hold", "-e", "./" + info.name], {
						cwd: info.dir
					});
				} else if (process.platform == "darwin") {
					child_process.spawn("open", info.name, {
						cwd: info.dir
					});
				}
			} else {
				atom.notifications.add("success", "Compiling successful");
			}
      fs.readFile(info.dir + "/compiling_error.txt", function(err) {
        if (!err) {
          fs.unlink(info.dir + "/compiling_error.txt");
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
	for (var i in names) {
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
