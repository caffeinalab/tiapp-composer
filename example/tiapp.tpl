<?xml version="1.0" encoding="UTF-8"?>
<ti:app xmlns:ti="http://ti.appcelerator.org">
	<id>${app.id}</id>
	<name>example</name>
	<version>${app.version}</version>
	<publisher>not specified</publisher>
	<url>caffeina.com</url>
	<description></description>
	<copyright>not specified</copyright>
	<icon>appicon.png</icon>
	<fullscreen>false</fullscreen>
	<navbar-hidden>false</navbar-hidden>
	<analytics>true</analytics>
	<guid>07abc8b2-86a7-4e6e-a0cd-9c585200c23b</guid>
	<property name="ti.ui.defaultunit" type="string">dp</property>
	<property name="run-on-main-thread" type="bool">true</property>
	<ios>
		<enable-launch-screen-storyboard>true</enable-launch-screen-storyboard>
		<use-app-thinning>true</use-app-thinning>
		<plist>
			<dict>
				<key>UISupportedInterfaceOrientations~iphone</key>
				<array>
					${app.ios.supportedOrientations.iphone}
				</array>
				<key>UISupportedInterfaceOrientations~ipad</key>
				<array>
					<string>UIInterfaceOrientationPortrait</string>
					<string>UIInterfaceOrientationPortraitUpsideDown</string>
					<string>UIInterfaceOrientationLandscapeLeft</string>
					<string>UIInterfaceOrientationLandscapeRight</string>
				</array>
				<key>UIRequiresPersistentWiFi</key>
				<false/>
				<key>UIPrerenderedIcon</key>
				<false/>
				<key>UIStatusBarHidden</key>
				<false/>
				<key>UIStatusBarStyle</key>
				<string>UIStatusBarStyleDefault</string>
			</dict>
		</plist>
	</ios>
	<android xmlns:android="http://schemas.android.com/apk/res/android">
	</android>
	<mobileweb>
		<precache>
		</precache>
		<splash>
			<enabled>true</enabled>
			<inline-css-images>true</inline-css-images>
		</splash>
		<theme>default</theme>
	</mobileweb>
	<modules>
	</modules>
	<deployment-targets>
		<target device="android">true</target>
		<target device="ipad">false</target>
		<target device="iphone">true</target>
		<target device="mobileweb">false</target>
	</deployment-targets>
	<sdk-version>${app.sdkVersion}</sdk-version>
</ti:app>