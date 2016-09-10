## 3.0.7
* Added support for MATE Terminal.

## 3.0.6
* Added support for URxvt on Linux.
* Added option to compile to temporary directory.

## 3.0.5
* Show warning messages.
* Added option to change compilers.

## 3.0.4
* Adds a debug mode.

## 3.0.3
* Spawns compiled binary in the source directory.

## 3.0.2
* Uses CompositeDisposables.
* Added support for gdb on Windows.

## 3.0.1
* Fixed spawning compiled binary in Windows and Mac.

## 3.0.0
* Added support for the GNU Debugger.
* Compiled to a temporary file, rather than a binary in the current directory.
* Added `Compile and Debug` menu options.
* Removed compiled file extension option.

## 2.3.3
* Added support for pantheon-terminal on Linux.

## 2.3.2
* Fixed arguments to `start` on Windows.

## 2.3.1
* Fixed bug where compiled program wouldn't run on Windows.

## 2.3.0
* Made command prompt hold after running program.

## 2.2.3
* According to Atom's documentation, all command registers should be lowercase and separated by hypens.
* Warn user if they try to compile without saving the file ([farnabaz](https://github.com/farnabaz)).
* Hold command prompt after running program on Windows.

## 2.2.2
* Added comments to index.js.

## 2.2.1
* Edited the package's description to include information about C.

## 2.2.0
* Added support for C.

## 2.1.0
* Added support for changing linux terminal.
* Fixed a few typos.

## 2.0.2
* Fixed bug where it wouldn't launch compiled exe on Windows.

## 2.0.1
* Added this changelog.
* Fixed indentation for `index.js`.
* Fixed bug where it would not launch compiled program on a Mac.

## 2.0.0
* Now you can pass multiple files to g++ using tree view.

## 1.2.2
* Fixed bug that would fail to execute g++ on Windows.

## 1.2.1
* Now uses XTerm on Linux ([LinuxMercedes](https://github.com/LinuxMercedes)).
* Properly escape arguments on \*nix systems ([LinuxMercedes](https://github.com/LinuxMercedes)).

## 1.2.0
* Added option to toggle running after compilation ([PoVa](https://github.com/PoVa)).
* Added option to changed output extension ([PoVa](https://github.com/PoVa)).

## 1.1.0
* Added option to add g++ command line options.

## 1.0.0
* Added support for Linux.

## 0.3.6
* Fixed but where you couldn't have spaces in the file name.

## 0.3.5
* I accidentally ran `apm publish` twice, resulting in an unneccesary commit and version.

## 0.3.4
* Readded saving the file before compiling.

## 0.3.3
* Fixed bug that would cause the package to crash after a successful compile..

## 0.3.2
* Fixed bug where `compiling_error.txt` would be created in the wrong place.

## 0.3.1
* Now uses `path.parse()`.

## 0.3.0
* Added option to toggle creation of `compiling_error.txt`.

## 0.2.0
* Now deletes `compiling_error.txt` when there is a successful compile.

## 0.1.3
* Fixed bug where `compiling_error.txt` would be created in the wrong place.

## 0.1.2
* Fixed typo.

## 0.1.1
* No longer logs in console.

## 0.1.0
* First commit.
