var exec=require('child_process').exec,fs=require('fs');

module.exports.activate=function(){
  atom.commands.add('atom-text-editor','gpp-compiler:compile',compile);
  atom.commands.add('.tree-view .file>.name','gpp-compiler:treeCompile',treeCompile);
};

function compile(treePath){
  var editor=atom.workspace.getActiveTextEditor();
  if(!editor)return;
  editor.save();
  var path,dir,file,ext;
  path=typeof treePath=='string'?treePath:editor.getPath();
  dir=path.split('\\');
  dir.pop();
  dir=dir.join('\\')+'\\';
  file=path.split('\\').pop().split('.');
  file.pop();
  file=file.join('.');
  ext='.'+path.split('\\').pop().split('.').pop();
  exec('g++ '+file+ext+' -o '+file,{cwd:dir},function(err,stdout,stderr){
    if(stderr){
      fs.writeFile(dir+'compiling_error.txt',stderr);
      atom.notifications.add('error',stderr.replace(/\n/g,'<br>'));
    }
    else exec('start '+file,{cwd:dir});
  });
}
function treeCompile(e){
  var path=e.target.getAttribute('data-path');
  compile(path);
}
