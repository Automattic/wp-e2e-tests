import test from 'selenium-webdriver/testing';
import config from 'config';

import LoginFlow from '../lib/flows/login-flow.js';

import EditorPage from '../lib/pages/editor-page.js';

import * as driverManager from '../lib/driver-manager.js';
import * as mediaHelper from '../lib/media-helper.js';
import * as dataHelper from '../lib/data-helper';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

var driver;

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( `[${host}] Editor: Media Upload (${screenSize}) @parallel @jetpack`, function() {
	this.timeout( mochaTimeOut );

	test.describe( 'Image Upload:', function() {
		this.bailSuite( true );
		let editorPage;

		test.before( function() {
			driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.describe( 'Can upload many media types', () => {
			test.it( 'Can log in and navigate to Editor page', () => {
				const loginFlow = new LoginFlow( driver );
				loginFlow.loginAndStartNewPage();
				editorPage = new EditorPage( driver );
			} );

			test.describe( 'Can upload a normal image', function() {
				let fileDetails;

				test.it( 'Create image file for upload', function() {
					mediaHelper.createFileWithFilename( 'normal.jpg' ).then( function( details ) {
						fileDetails = details;
					} );
				} );

				test.it( 'Can upload an image', function() {
					editorPage.uploadMedia( fileDetails );
				} );

				test.it( 'Can delete image', function() {
					editorPage.deleteMedia();
				} );

				test.after( function() {
					editorPage.dismissMediaModal();
					if ( fileDetails ) {
						mediaHelper.deleteFile( fileDetails ).then( function() {} );
					}
				} );
			} );

			test.describe( 'Can upload an image with reserved url chars in the filename', function() {
				let fileDetails;

				test.it( 'Create image file for upload', function() {
					mediaHelper.createFileWithFilename( 'filewith#?#?reservedurlchars.jpg', true ).then( function( details ) {
						fileDetails = details;
					} );
				} );

				test.it( 'Can upload an image', function() {
					editorPage.uploadMedia( fileDetails );
				} );

				test.it( 'Can delete image', function() {
					editorPage.deleteMedia();
				} );

				test.after( function() {
					editorPage.dismissMediaModal();
					if ( fileDetails ) {
						mediaHelper.deleteFile( fileDetails ).then( function() {} );
					}
				} );
			} );

			test.describe( 'Can upload an mp3', function() {
				let fileDetails;
				// Skip this test on Jetpack sites due to https://github.com/Automattic/jetpack/issues/7159
				if ( config.has( 'jetpackTests' ) && config.get( 'jetpackTests' ) ) {
					return true;
				}

				test.it( 'Create mp3 for upload', function() {
					mediaHelper.getMP3FileWithFilename( 'new.mp3' ).then( function( details ) {
						fileDetails = details;
					} );
				} );

				test.it( 'Can upload an mp3', function() {
					editorPage.uploadMedia( fileDetails );
				} );

				test.it( 'Can delete mp3', function() {
					editorPage.deleteMedia();
				} );

				test.after( function() {
					editorPage.dismissMediaModal();
					if ( fileDetails ) {
						mediaHelper.deleteFile( fileDetails ).then( function() {} );
					}
				} );
			} );
		} );
	} );
} );
