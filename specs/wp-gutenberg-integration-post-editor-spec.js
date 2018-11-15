/** @format */

import assert from 'assert';
import config from 'config';

import LoginFlow from '../lib/flows/login-flow.js';

import GutenbergPage from '../lib/pages/gutenberg-page';

import GutenbergEditorHeaderComponent from '../lib/gutenberg/gutenberg-editor-header-component';

import * as driverManager from '../lib/driver-manager';
import * as dataHelper from '../lib/data-helper';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

let driver;

before( async function() {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe( `[${ host }] Gutenberg Editor: Posts (${ screenSize })`, function() {
	this.timeout( mochaTimeOut );

	describe( 'Basic Public Post @canary @parallel', function() {
		describe( 'Publish a New Post', function() {
			const blogPostTitle = dataHelper.randomPhrase();
			const blogPostQuote =
				'“Whenever you find yourself on the side of the majority, it is time to pause and reflect.”\n- Mark Twain';

			step( 'Can log in', async function() {
				this.loginFlow = new LoginFlow( driver, 'gutenbergSimpleSiteUser' );
				await this.loginFlow.login();
				await GutenbergPage.Visit( driver );
			} );

			step( 'Can enter post title and text content', async function() {
				const gHeaderComponent = await GutenbergEditorHeaderComponent.Expect( driver );
				await gHeaderComponent.removeNUXNotice();
				await gHeaderComponent.enterTitle( blogPostTitle );
				await gHeaderComponent.enterText( blogPostQuote );

				let errorShown = await gHeaderComponent.errorDisplayed();
				return assert.strictEqual(
					errorShown,
					false,
					'There is an error shown on the Gutenberg editor page!'
				);
			} );
		} );
	} );
} );
