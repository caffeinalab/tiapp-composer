# tiapp-composer-plugin

A Titanium plugin that enables the definition of a template file for the `tiapp.xml` of your project.

**NOTE:** this script works only as a global plugin, since it has to modify the `tiapp.xml` _before_ the Titanium CLI parses it.

## Installation

```
npm i -g tiapp-composer
```

Done!

## Usage

The plugin will search for a config (`tiapp-cfg.json`) and a template file (`tiapp.tpl`) in your current working directory whenever you launch the `titanium build` and `titanium clean` commands.
If it doesn't find the config file, it will give a warning and skip to the rest of the command. Once you define the config, however, you *have* to write a template, or the plugin will simply write an empty `tiapp.xml`.

### tiapp.tpl and tiapp-cfg.json
The `tiapp.tpl` is an exact copy of a `tiapp.xml`. The only difference is that it will be treated as an ES6 **template literal**, so you can define custom variables:
```
<?xml version="1.0" encoding="UTF-8"?><ti:app xmlns:ti="http://ti.appcelerator.org">
	<id>${app.id}</id>
	<name>Tiapp Composer Test</name>
	<version>{$app.version}</version>
	<publisher>not specified</publisher>
	<url>caffeina.com</url>

	[...]

	<ios>
		<enable-launch-screen-storyboard>true</enable-launch-screen-storyboard>
		<use-app-thinning>true</use-app-thinning>
		<plist>
			<dict>

				[...]

				<key>LSApplicationQueriesSchemes</key>
				<array>
					${app.ios.querySchemes}
				</array>
				<key>NSAppTransportSecurity</key>
				<dict>
				<key>NSAllowsArbitraryLoads</key>
				<${app.ios.allowArbitraryLoads}/>

				[...]

			</dict>
		</plist>
	</ios>
	<android xmlns:android="http://schemas.android.com/apk/res/android">
	</android>

	[...]

	<sdk-version>${app.sdkVersion}</sdk-version>
<plugins><plugin version="1.0">ti.alloy</plugin>
</plugins>
</ti:app>
```

and the corresponding `tiapp-cfg.json` would be:
```
{
	"development": {
		"app": {
			"id": "com.myapp.title.test",
			"version": "6.6.6",
			"sdkVersion": "7.0.0.CUSTOMBUILD",
			"ios": {
				"querySchemes": "
				<string>testscheme</string>
				",
				"allowArbitraryLoads": "true"
			}
		}
	},
	"production": {
		"app": {
			"id": "com.myapp.title",
			"version": "6.6.0",
			"sdkVersion": "7.0.0.GA",
			"ios": {
				"querySchemes": "
				<string>twitter</string>
				<string>fb</string>
				",
				"allowArbitraryLoads": "false"
			}
		}
	}
}
```

As you can see, you can replace entire sections of the tiapp with a custom string. Hell, you could even put *the whole* `tiapp.xml` in the config as an attribute. I'm not judging you.

### --tiappenv
You can use the `--tiappenv` flag in your `titanium build` or `titanium clean` command, with one of the top-level attribute names you defined:
```
ti build --platform android --target device --device-id all --tiappenv development

Running tiapp-composer-plugin...
[INFO]  tiapp-composer-plugin: Successfully wrote tiapp.xml
```

If you use a name you haven't defined in your config, the plugin will **not** write the `tiapp.xml` file:
```
ti build --platform android --target device --device-id all --tiappenv ayylmao

Running tiapp-composer-plugin...
[WARN]  tiapp-composer-plugin: Couldn't find the environment "ayylmao" in the tiapp-cfg.json file.
[WARN]  tiapp-composer-plugin Skipping tiapp.xml composing.
```

If you don't add the `--tiappenv` flag to your command, the plugin will default to the name `development`:
```
ti build --platform android --target device --device-id all

Running tiapp-composer-plugin...
[WARN]  tiapp-composer-plugin: --tiappenv flag not set, defaulting to "development"
[INFO]  tiapp-composer-plugin: Successfully wrote tiapp.xml
```

## Tips
- If you use [TiNy](https://github.com/jasonkneen/tn) (and you should, it's a real time saver), you can write a custom `tn.json` file and add some recipes with different `--tiappenv` flags:
```
tn project save testdroid --platform android --target device --device-id all --tiappenv mytestenv
tn project save proddroid --platform android --target device --device-id all --tiappenv myprodenv
```

- If you use Git in your project (and if you are reading this, that's probably the case), you should append `/tiapp.xml` to your `.gitignore` file, since it will be overwritten at each build command. The plugin will even give you a warning if you don't do so.

## But why, though?
The reason behind this contraption is that I had to switch between different tiapp settings in one of my projects, depending on the type of build i had deploy (test, enterprise, production...).
Initially I would keep several branches with different tiapp files, but that approach was time and space consuming, and prone to errors.
After trying other solutions, and with the pressing need to adopt CI in my projects, I decided to write my own plugin.
