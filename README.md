# Visual Studio Code Custom Folding Extension

This extension enhances the default code folding abilities of Visual Studio Code editor. Regions of code that you'd like to be folded can be wrapped with `#region` comments.


The precise format of the comment:

    /* #region ClientName */
    public static void Main(string args[])
    {
       //Your code goes here
    }
    /* #endregion */

The ClientName can be a list of clients (pipe | seperated) : `itv | rtv | banijay`

Region tags can be nested, however each child region must have all of its client names present in the parent region.

## Commands

The extension also installs a command to wrap a `region` comment around the current selection.

- regionfolder.wrapWithRegion (Ctrl+M Ctrl+R)


## Command Pallete

There are mulitple commands added to the command pallete. All beginning with FoldClient.

- foldClient Hide all - Will fold all region tags

- foldClient Show all - Will unfold all region tags

- foldClient Show named  - Will fold all region tags, except those listed in the client list.

- foldClient Set clients - Allows you to edit the client list in settings.json. (comma seperated string)


## Installation

In the same directory as extension package run: code --install-extension <package_name>

`code --install-extension foldclient-1.0.0.vsix`