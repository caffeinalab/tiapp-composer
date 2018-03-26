{
	"global": {},
	"env:development": {
		"foo": "${app.foo}",
	},
	"env:test": {
		"foo": "${app.foo}",
	},
    "env:production": {
		"foo": "${app.foo}",
        "baz": "${app.baz}",
	},
	"os:android": {
		${app.bar}
	},
	"os:blackberry": {},
	"os:ios": {
		${app.bar}
	},
	"os:mobileweb": {},
	"os:windows": {},
	"dependencies": {}
}
