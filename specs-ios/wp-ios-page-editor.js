import test from 'selenium-webdriver/testing';

import config from 'config';
import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper.js';

import LoginFlow from '../lib/flows/login-flow-mobile.js';
import EditorPage from '../lib/pages/ios/editor-page-ios.js';
import PagesListPage from '../lib/pages/ios/pages-list-ios.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startAppTimeoutMS = config.get( 'startAppTimeoutMS' );

var driver;

test.before( 'Start App', function() {
	this.timeout( startAppTimeoutMS );
	return driverManager.startApp().then( function() {
		driver = global.__BROWSER__;
	} );
} );

test.describe( 'Editor: Pages (' + process.env.ORIENTATION + '):', function() {
	this.timeout( mochaTimeOut );
	test.describe( 'Public Pages:', function() {
		test.before( 'Restart app', function() {
			return driverManager.resetApp();
		} );

		test.describe( 'Publish a Public Page', function() {
			const pageTitle = dataHelper.randomPhrase();
			const pageQuote = 'The foolish man seeks happiness in the distance. The wise grows it under his feet.\n— James Oppenheim';

			test.it( 'Can log in and open page editor', function() {
				let loginFlow = new LoginFlow( driver );
				return loginFlow.loginAndStartNewPage();
			} );

			test.it( 'Can fill out title', function() {
				this.editorPage = new EditorPage( driver );
				return this.editorPage.enterTitle( pageTitle );
			} );

			test.xit( 'Can fill out body', function() { // Temporarily not adding a body to the page pending further troubleshooting
				return this.editorPage.enterContent( pageQuote );
			} );

			test.it( 'Can Publish', function() {
				return this.editorPage.clickPost();
			} );

			test.it( 'Page exists', function() {
				this.pagesList = new PagesListPage( driver );
				return this.pagesList.findPage( pageTitle );
			} );
		} );
	} );
} );
