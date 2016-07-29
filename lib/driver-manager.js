import webdriver from 'selenium-webdriver';
import firefox from 'selenium-webdriver/firefox';
import chrome from 'selenium-webdriver/chrome';
import config from 'config';
import proxy from 'selenium-webdriver/proxy';
import SauceLabs from 'saucelabs';
import _ from 'lodash';

// Mobile-specific
import wd from 'wd';
var wdBridge = require( 'wd-bridge' )( webdriver, wd );

const webDriverImplicitTimeOutMS = 2000;
const webDriverPageLoadTimeOutMS = 60000;
const browser = config.get( 'browser' );

export function currentScreenSize() {
	var screenSize = process.env.BROWSERSIZE;
	if ( screenSize === undefined || screenSize === '' ) {
		screenSize = 'desktop';
	}
	return screenSize.toLowerCase();
}

export function getSizeAsObject() {
	switch ( this.currentScreenSize() ) {
		case 'mobile':
			return { width: 400, height: 1000};
		case 'tablet':
			return { width: 1024, height: 1000};
		case 'desktop':
			return { width: 1440, height: 1000};
		case 'laptop':
			return { width: 1400, height: 790};
		default:
			throw new Error( 'Unsupported screen size specified. Supported values are desktop, tablet and mobile.' );
	}
}

export function getProxyType() {
	var proxyType = config.get( 'proxy' );
	switch ( proxyType.toLowerCase() ) {
		case 'direct':
			return proxy.direct();
		case 'system':
			return proxy.system();
		default:
			throw new Error( `Unknown proxy type specified of: '${proxyType}'. Supported values are 'direct' or 'system'` );
	}
}

export function startBrowser() {
	if ( global.__BROWSER__ ) {
		return global.__BROWSER__;
	}
	const screenSize = this.currentScreenSize();
	let driver;
	let options;
	let builder;
	let pref = new webdriver.logging.Preferences();
	pref.setLevel( 'browser', webdriver.logging.Level.SEVERE );
	if ( config.has( 'sauce' ) && config.get( 'sauce' ) ) {
		let sauceConfig = config.get( 'sauceConfig' );
		let caps = config.get( 'sauceConfigurations' )[ sauceConfig ];

		caps.username = config.get( 'sauceUsername' );
		caps.accessKey = config.get( 'sauceAccessKey' );
		caps.name = caps.browserName + ' - [' + screenSize + ']';
		if ( process.env.CIRCLE_BUILD_NUM ) {
			caps.name += ' - CircleCI Build #' + process.env.CIRCLE_BUILD_NUM;
		}

		global._sauceLabs = new SauceLabs( {
			username: caps.username,
			password: caps.accessKey
		} );

		builder = new webdriver.Builder();
		global.browserName = caps.browserName;
		global.__BROWSER__ = driver = builder.usingServer( 'http://ondemand.saucelabs.com:80/wd/hub' ).
			withCapabilities( caps ).
			build();

		driver.getSession().then( function( sessionid ) {
			driver.allPassed = true;
			driver.sessionID = sessionid.id_;
		} );
	} else {
		switch ( browser.toLowerCase() ) {
			case 'chrome':
				options = new chrome.Options();
				options.setProxy( this.getProxyType() );
				options.addArguments( '--no-sandbox' );
				builder = new webdriver.Builder();
				builder.setChromeOptions( options );
				global.__BROWSER__ = driver = builder.forBrowser( 'chrome' ).setLoggingPrefs( pref ).build();
				break;
			case 'firefox':
				let profile = new firefox.Profile();
				profile.setNativeEventsEnabled( true );
				profile.setPreference( 'browser.startup.homepage_override.mstone', 'ignore' );
				profile.setPreference( 'browser.startup.homepage', 'about:blank' );
				profile.setPreference( 'startup.homepage_welcome_url.additional', 'about:blank' );
				options = new firefox.Options().setProfile( profile );
				options.setProxy( this.getProxyType() );
				builder = new webdriver.Builder();
				builder.setFirefoxOptions( options );
				global.__BROWSER__ = driver = builder.forBrowser( 'firefox' ).setLoggingPrefs( pref ).build();
				break;
			default:
				throw new Error( `The specified browser: '${browser}' in the config is not supported. Supported browsers are 'chrome' and 'firefox'` );
		}
	}
	driver.manage().timeouts().implicitlyWait( webDriverImplicitTimeOutMS );
	driver.manage().timeouts().pageLoadTimeout( webDriverPageLoadTimeOutMS );
	this.resizeBrowser( driver, screenSize );
	return driver;
}

export function startApp() {
	var deviceConfig = require( '../lib/mobile-capabilities' );

	if ( global.__BROWSER__ ) {
		return global.__BROWSER__;
	}
	global.__MOBILE__ = true;
	let driver, wdDriver;

	//TODO: device name?	const screenSize = this.currentScreenSize();

	let caps = new webdriver.Capabilities();

	let device = deviceConfig[ process.env.DEVICE ];
	_.each( device, function( val, key ) {
		caps.set( key, val );
	} );

	let builder;
	if ( config.has( 'sauce' ) && config.get( 'sauce' ) ) {
		caps.set( 'username', config.get( 'sauceUsernameIOS' ) );
		caps.set( 'accessKey', config.get( 'sauceAccessKeyIOS' ) );
		caps.set( 'name', `WordPress iOS - ${process.env.ORIENTATION} - #${process.env.CIRCLE_BUILD_NUM}` );
		builder = new webdriver.Builder()
			.usingServer( 'http://ondemand.saucelabs.com:80/wd/hub' )
			.withCapabilities( caps );
	} else {
		caps.set( 'app', config.get( 'iOSLocalApp' ) );
		builder = new webdriver.Builder()
			.usingServer( 'http://localhost:4723/wd/hub' )
			.withCapabilities( caps );
	}

	global.__BROWSER__ = driver = builder.build();
	return wdBridge.initFromSeleniumWebdriver( builder, driver )
		.then( function( _wdDriver ) {
			global.__WDDRIVER__ = wdDriver = _wdDriver;
			wdDriver.getWindowSize().then( function( _screenSize ) {
				global.__originalScreenSize__ = _screenSize.height + 'x' + _screenSize.width;
			} );
			return wdDriver.setOrientation( process.env.ORIENTATION || 'PORTRAIT' );
		} );
}

export function resizeBrowser( driver, screenSize ) {
	if ( typeof ( screenSize ) === 'string' ) {
		switch ( screenSize.toLowerCase() ) {
			case 'mobile':
				driver.manage().window().setSize( 400, 1000 );
				break;
			case 'tablet':
				driver.manage().window().setSize( 1024, 1000 );
				break;
			case 'desktop':
				driver.manage().window().setSize( 1440, 1000 );
				break;
			case 'laptop':
				driver.manage().window().setSize( 1400, 790 );
				break;
			default:
				throw new Error( 'Unsupported screen size specified (' + screenSize + '). Supported values are desktop, tablet and mobile.' );
		}
	} else {
		throw new Error( 'Unsupported screen size specified (' + screenSize + '). Supported values are desktop, tablet and mobile.' );
	}
}

export function clearCookiesAndDeleteLocalStorage( driver ) {
	driver.manage().deleteAllCookies();
	return this.deleteLocalStorage( driver );
}

export function deleteLocalStorage( driver ) {
	driver.getCurrentUrl().then( ( url ) => {
		if ( url.startsWith( 'data:' ) === false ) {
			return driver.executeScript( 'window.localStorage.clear();' );
		}
	} );
}

export function ensureNotLoggedIn( driver ) {
	// This makes sure neither auth domain or local domain has any cookies or local storage
	driver.get( config.get( 'authURL' ) );
	this.clearCookiesAndDeleteLocalStorage( driver );
	driver.get( config.get( 'calypsoBaseURL' ) );
	return this.clearCookiesAndDeleteLocalStorage( driver );
}

export function quitBrowser( driver ) {
	// Sleep for 3 seconds before closing the browser to make sure all JS console errors are captured
	return driver.sleep( 3000 ).then( function() {
		return driver.quit();
	} );
}
