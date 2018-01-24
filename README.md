# tiapp-composer-plugin

A Titanium plugin that enables the definition of a template file for the `tiapp.xml` of your project.

*NOTE:* this script works only as a global plugin, since it has to modify the `tiapp.xml` _before_ the Titanium CLI parses it.

## Installation

Clone this repository in a path of your choice:
```
git clone git@github.com:caffeinalab/tiapp-composer-plugin.git /path/to/this/plugin
```

Set the `hooks` directory as a global plugin:
```
ti config -a paths.hooks /path/to/this/plugin/hooks
```

Done!

## Usage

The plugin will search for a `tiapp-cfg.json` and a `tiapp.tpl` file in your current working directory whenever you launch the "ti build" command.

// TODO
