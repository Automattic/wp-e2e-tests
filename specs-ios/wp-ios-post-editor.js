import test from 'selenium-webdriver/testing';

import config from 'config';
import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper.js';

import LoginFlow from '../lib/flows/login-flow-mobile.js';
import EditorPage from '../lib/pages/ios/editor-page-ios.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startAppTimeoutMS = config.get( 'startAppTimeoutMS' );

var driver;

test.before( 'Start App', function() {
	this.timeout( startAppTimeoutMS );
	return driverManager.startApp().then( function() {
		driver = global.__BROWSER__;
	} );
} );

test.describe( 'Editor: Posts (' + process.env.ORIENTATION + '):', function() {
	this.timeout( mochaTimeOut );
	test.describe( 'Public Posts:', function() {
		test.before( 'Restart app', function() {
			return driverManager.resetApp();
		} );

		test.describe( 'Preview and Publish a Public Post', function() {
			const blogPostTitle = dataHelper.randomPhrase() + ' [iOS]';
			const blogPostQuote = 'The foolish man seeks happiness in the distance. The wise grows it under his feet.\n— James Oppenheim';

			test.it( 'Can log in and open post editor', function() {
				let loginFlow = new LoginFlow( driver );
				return loginFlow.loginAndStartNewPost();
			} );

			test.it( 'Can fill out title and body', function() {
				this.editorPage = new EditorPage( driver );
				this.editorPage.enterContent( blogPostQuote );
				this.editorPage.enterTitle( blogPostTitle );
			} );
		} );
	} );
} );
