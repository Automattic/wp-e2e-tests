import test from 'selenium-webdriver/testing';
import config from 'config';

import LoginFlow from '../lib/flows/login-flow.js';

import EditorPage from '../lib/pages/editor-page.js';
import PostEditorSidebarComponent from '../lib/components/post-editor-sidebar-component.js';

import * as driverManager from '../lib/driver-manager.js';
import * as mediaHelper from '../lib/media-helper.js';
import * as dataHelper from '../lib/data-helper';
import * as eyesHelper from '../lib/eyes-helper.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

var driver;

let eyes = eyesHelper.eyesSetup( true );

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( `[${host}] Editor: Media Upload (${screenSize}) @parallel @jetpack`, function() {
	this.timeout( mochaTimeOut );

	test.before( function() {
		let testEnvironment = 'WordPress.com';
		let testName = `Editor Media Upload [${global.browserName}] [${screenSize}]`;
		eyesHelper.eyesOpen( driver, eyes, testEnvironment, testName );
	} );

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
					eyesHelper.eyesScreenshot( driver, eyes, 'Editor Media Modal' );
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

			test.describe( 'Can upload Featured image', () => {
				let fileDetails;
				let editorSidebar;

				test.it( 'Create image file for upload', function() {
					mediaHelper.createFile().then( function( details ) {
						fileDetails = details;
					} );
				} );

				test.it( 'Can open Featured Image upload modal', function() {
					editorSidebar = new PostEditorSidebarComponent( driver );
					editorSidebar.expandFeaturedImage();
					editorSidebar.openFeaturedImageDialog();
				} );

				test.it( 'Can set Featured Image', function() {
					editorPage.sendFile( fileDetails.file );
					editorPage.saveImage( fileDetails.imageName );
					// Will wait until image is actually shows up on editor page
					editorPage.waitUntilFeaturedImageInserted();
				} );

				test.it( 'Can remove Featured Image', function() {
					editorSidebar.removeFeaturedImage();
					editorSidebar.closeFeaturedImage();
				} );

				test.it( 'Can delete uploaded image', function() {
					editorSidebar.expandFeaturedImage();
					editorSidebar.openFeaturedImageDialog();
					editorPage.selectImageByNumber( 0 );
					editorPage.deleteMedia();
				} );

				test.after( () => {
					editorPage.dismissMediaModal();
					if ( fileDetails ) {
						mediaHelper.deleteFile( fileDetails ).then( function() {} );
					}
					editorSidebar.closeFeaturedImage();
				} );
			} );
			// FIXME: Workaround of https://github.com/Automattic/wp-calypso/issues/17701
			test.after( () => {
				editorPage.cleanDirtyState();
			} );
		} );
	} );

	test.after( function() {
		eyesHelper.eyesClose( eyes );
	} );
} );
