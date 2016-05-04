import test from 'selenium-webdriver/testing';
import config from 'config';
import webdriver from 'selenium-webdriver';
import EditorPage from '../lib/pages/editor-page.js';
import ViewPagePage from '../lib/pages/view-page-page.js';
import PagePreviewComponent from '../lib/components/page-preview-component.js';
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

test.describe( 'WordPress.com Visual Diff Page Editor - Public Pages', function() {
	var fileDetails, timeStamp;
	this.timeout( mochaVisDiffTimeOut );

	test.beforeEach( function() {
		driver.manage().deleteAllCookies();
		mediaHelper.createFile( true ).then( function( details ) {
			fileDetails = details;
		} );

		timeStamp = new Date().getTime().toString();
	} );

	test.it( 'VisualDiff - Preview/Publish Public Page with Image, Disable Sharing Buttons', function() {
		this.timeout( mochaVisDiffTimeOut );

		eyes.open( driver, 'WordPress.com', 'Preview/Publish Public Page with Image, Disable Sharing Buttons [' + screenSizeName + ']', screenSize );

		let pageTitle = 'Public ' + timeStamp;
		let pageQuote = 'If you have the same problem for a long time, maybe it’s not a problem. Maybe it’s a fact..\n— I. Rabin';

		let loginFlow = new LoginFlow( driver, 'visualUser' );
		loginFlow.loginAndStartNewPage();

		let editorPage = new EditorPage( driver );
		driverHelper.eyesScreenshot( driver, eyes, 'Editor - Empty' );
		editorPage.enterTitle( pageTitle );
		editorPage.enterContent( pageQuote + '\n' );
		editorPage.enterPostImage( fileDetails );
		editorPage.waitUntilImageInserted( fileDetails );

		let postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
		postEditorSidebarComponent.ensureSaved();

		driverHelper.eyesScreenshot( driver, eyes, 'Editor - Full' );

		postEditorSidebarComponent.expandSharingSection();
		driverHelper.eyesScreenshot( driver, eyes, 'Sidebar Sharing - Open' );
		postEditorSidebarComponent.setSharingButtons( false );
		driverHelper.eyesScreenshot( driver, eyes, 'Sidebar Sharing - Disabled' );
		postEditorSidebarComponent.closeSharingSection();
		driverHelper.eyesScreenshot( driver, eyes, 'Sidebar Sharing - Closed' );

		postEditorSidebarComponent.ensureSaved();
		postEditorSidebarComponent.launchPreview();
		driverHelper.eyesScreenshot( driver, eyes, 'Page Preview - Open' );

		let pagePreviewComponent = new PagePreviewComponent( driver );
		pagePreviewComponent.close();

		postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
		postEditorSidebarComponent.publishAndViewContent();

		let viewPagePage = new ViewPagePage( driver );
		driverHelper.eyesScreenshot( driver, eyes, 'Post Published', by.id( 'content' ) );

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
