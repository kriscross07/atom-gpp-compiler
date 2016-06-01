# gpp-compiler

This Atom package allows you to compile and run C++ and C code within the editor.

To compile C++, press F5 or right click the file in tree view and click `Compile and Run C++`.

To compile C, press F6 or right click the file in tree view and click `Compile and Run C`.

On Linux, g++ and gcc probably come with your distribution. Run `which g++ gcc && echo You have g++ and gcc. || echo You don\'t have g++ and gcc.`.

On Windows, you'll need to install [MinGW](http://www.mingw.org/) and [add it to your PATH](http://www.howtogeek.com/118594/how-to-edit-your-system-path-for-easy-command-line-access/).

On a Mac, you'll need to install [XCode](https://developer.apple.com/xcode/).

# Contributing

If you would like to contribute, please run npm test (after [installing ESLint](https://www.npmjs.com/package/eslint)), which will eslint index.js before making a pull request and fix any errors it gives you.
