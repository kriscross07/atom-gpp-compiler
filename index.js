var exec = require("child_process").exec, fs = require("fs");

module.exports = {
  activate: function() {
    atom.commands.add("atom-text-editor", "gpp-compiler:compile", compile);
    atom.commands.add(".tree-view .file>.name", "gpp-compiler:treeCompile", treeCompile);
  },
  config: {
    addCompilingErr: {
      type: "boolean",
      default: true,
      title: "Add compiling_error.txt",
      description: "Add a file named \"compiling_error.txt\" if compiling goes wrong."
    }
  }
};

function compile(treePath) {
  var editor = atom.workspace.getActiveTextEditor();
  if(!editor)return;
  editor.save();
  var path, dir, file, ext;
  path = typeof(treePath) == "string" ? treePath : editor.getPath();
  dir = path.split("\\");
  dir.pop();
  dir = dir.join("\\") + "\\";
  file = path.split("\\").pop().split(".");
  file.pop();
  file = file.join(".");
  ext = "." + path.split("\\").pop().split(".").pop();
  exec("g++ " + file + ext + " -o " + file,{cwd: dir},function(err,stdout,stderr) {
    if(stderr) {
      atom.notifications.add("error", stderr.replace(/\n/g,"<br>"));
      if(atom.config.get("gpp-compiler.addCompilingErr"))fs.writeFile(dir+"compiling_error.txt",stderr);
    }
    else {
      exec("start " + file, {cwd:dir});
      fs.readFile(dir + "compiling_error.txt", function(err) {
        if(!err)fs.unlink(dir + "compiling_error.txt");
      });
    }
  });
}
function treeCompile(e) {
  compile(e.target.getAttribute("data-path"));
}
