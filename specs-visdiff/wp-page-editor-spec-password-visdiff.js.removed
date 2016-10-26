import test from 'selenium-webdriver/testing';
import config from 'config';
import webdriver from 'selenium-webdriver';
import EditorPage from '../lib/pages/editor-page.js';
import ViewPagePage from '../lib/pages/view-page-page.js';
import PostEditorSidebarComponent from '../lib/components/post-editor-sidebar-component.js';
import * as driverManager from '../lib/driver-manager.js';
import * as driverHelper from '../lib/driver-helper.js';
import * as mediaHelper from '../lib/media-helper.js';
import LoginFlow from '../lib/flows/login-flow.js';
var driver, screenSize, screenSizeName;
var by = webdriver.By;

var mochaVisDiffTimeOut = config.get( 'mochaVisDiffTimeoutMS' );
var startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );

var Eyes = require( 'eyes.selenium' ).Eyes;
var eyes = new Eyes();
eyes.setApiKey( config.get( 'eyesKey' ) );

if ( process.env.CIRCLE_BUILD_NUM ) {
	eyes.setBatch( `WordPress.com CircleCI Build #${process.env.CIRCLE_BUILD_NUM}`, process.env.CIRCLE_BUILD_NUM );
}

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
	screenSize = driverManager.getSizeAsObject();
	screenSizeName = driverManager.currentScreenSize();
} );

test.describe( 'WordPress.com Visual Diff Page Editor - Password Protected', function() {
	this.timeout( mochaVisDiffTimeOut );

	let fileDetails, timeStamp;

	test.beforeEach( function() {
		driver.manage().deleteAllCookies();
		mediaHelper.createFile( true ).then( function( details ) {
			fileDetails = details;
		} );

		timeStamp = new Date().getTime().toString();
	} );

	test.it( 'VisualDiff - Adding Password Protected Pages', function() {
		this.timeout( mochaVisDiffTimeOut );

		eyes.open( driver, 'WordPress.com', 'Adding Password Protected Pages [' + screenSizeName + ']', screenSize );
		eyes.setForceFullPageScreenshot( false );

		let pageTitle = 'Password ' + timeStamp;
		let pageQuote = 'If you don’t like something, change it. If you can’t change it, change the way you think about it.\n— Mary Engelbreit\n';
		let postPassword = 'e2e' + new Date().getTime().toString();

		let loginFlow = new LoginFlow( driver, 'visualUser' );
		loginFlow.loginAndStartNewPage();

		let editorPage = new EditorPage( driver );
		editorPage.enterTitle( pageTitle );

		let postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
		postEditorSidebarComponent.ensureSaved();

		driverHelper.eyesScreenshot( driver, eyes, 'Editor Before Setting Password' );
		editorPage.setVisibilityToPasswordProtected( postPassword );
		driverHelper.eyesScreenshot( driver, eyes, 'Editor After Setting Password' );
		editorPage.enterContent( pageQuote );

		postEditorSidebarComponent.ensureSaved();
		postEditorSidebarComponent.publishAndViewContent();

		// Can view title as logged in user
		let viewPagePage = new ViewPagePage( driver );
		driverHelper.eyesScreenshot( driver, eyes, 'Logged In View Title Only', by.id( 'main' ) );

		// Enter wrong password
		viewPagePage.enterPassword( 'password' );
		driverHelper.eyesScreenshot( driver, eyes, 'Logged In Bad Password', by.id( 'main' ) );

		// Enter correct password
		viewPagePage.enterPassword( postPassword );
		driverHelper.eyesScreenshot( driver, eyes, 'Logged In Correct Password', by.id( 'main' ) );

		// After we log out, need to enter password again
		driver.manage().deleteAllCookies();
		driver.navigate().refresh();

		// Can view title as non-logged in user
		driverHelper.eyesScreenshot( driver, eyes, 'Logged Out Title Only', by.id( 'main' ) );

		// Enter wrong password
		viewPagePage.enterPassword( 'password' );
		driverHelper.eyesScreenshot( driver, eyes, 'Logged Out Bad Password', by.id( 'main' ) );

		// Enter correct password
		viewPagePage.enterPassword( postPassword );
		driverHelper.eyesScreenshot( driver, eyes, 'Logged Out Correct Password', by.id( 'main' ) );

		eyes.close();
	} );

	test.afterEach( function() {
		this.timeout( mochaVisDiffTimeOut );
		if ( fileDetails ) {
			mediaHelper.deleteFile( fileDetails ).then( function() {} );
		}
	} );
} );

test.after( function() {
	this.timeout( mochaVisDiffTimeOut );

	eyes.abortIfNotClosed();
} );
