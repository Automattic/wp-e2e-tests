import test from 'selenium-webdriver/testing';
import config from 'config';
import webdriver from 'selenium-webdriver';
import EditorPage from '../lib/pages/editor-page.js';
import NotFoundPage from '../lib/pages/not-found-page.js';
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

test.describe( 'WordPress.com Visual Diff Page Editor - Private Pages', function() {
	var fileDetails, timeStamp;
	this.timeout( mochaVisDiffTimeOut );

	test.beforeEach( function() {
		driver.manage().deleteAllCookies();
		mediaHelper.createFile( true ).then( function( details ) {
			fileDetails = details;
		} );

		timeStamp = new Date().getTime().toString();
	} );

	test.it( 'VisualDiff - Adding Private Pages', function() {
		this.timeout( mochaVisDiffTimeOut );

		eyes.open( driver, 'WordPress.com', 'Adding Private Pages [' + screenSizeName + ']', screenSize );

		let pageTitle = 'Private ' + timeStamp;
		let pageQuote = 'Few people know how to take a walk. The qualifications are endurance, plain clothes, old shoes, an eye for nature, good humor, vast curiosity, good speech, good silence and nothing too much.\n— Ralph Waldo Emerson\n';

		let loginFlow = new LoginFlow( driver, 'visualUser' );
		loginFlow.loginAndStartNewPage();

		let editorPage = new EditorPage( driver );
		editorPage.enterTitle( pageTitle );
		editorPage.enterContent( pageQuote );
		let postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
		postEditorSidebarComponent.ensureSaved();

		driverHelper.eyesScreenshot( driver, eyes, 'Editor Before Marking Private' );
		editorPage.setVisibilityToPrivate();
		driverHelper.eyesScreenshot( driver, eyes, 'Editor After Marking Private' );
		editorPage.viewPublishedPostOrPage();
		driverHelper.eyesScreenshot( driver, eyes, 'Viewing Private Page as User', by.id( 'content' ) );

		// Can't view as non-logged in user
		driver.manage().deleteAllCookies();
		driver.navigate().refresh();

		let notFoundPage = new NotFoundPage( driver );
		notFoundPage.displayed().then( function() {
			driverHelper.eyesScreenshot( driver, eyes, 'Unable to view without login ( 404 )' );
		} );

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
