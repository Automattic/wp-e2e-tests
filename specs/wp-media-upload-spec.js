/** @format */

import test from 'selenium-webdriver/testing';
import config from 'config';

import LoginFlow from '../lib/flows/login-flow.js';

import EditorPage from '../lib/pages/editor-page.js';
import PostEditorSidebarComponent from '../lib/components/post-editor-sidebar-component.js';

import * as driverManager from '../lib/driver-manager.js';
import * as mediaHelper from '../lib/media-helper.js';
import * as dataHelper from '../lib/data-helper';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

let driver;

test.before( async function() {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

test.describe( `[${ host }] Editor: Media Upload (${ screenSize }) @parallel @jetpack`, function() {
	this.timeout( mochaTimeOut );

	test.describe( 'Image Upload:', function() {
		this.bailSuite( true );
		let editorPage;

		test.before( async function() {
			await driverManager.clearCookiesAndDeleteLocalStorage( driver );
			const loginFlow = new LoginFlow( driver );
			await loginFlow.loginAndStartNewPage();
			editorPage = await EditorPage.Expect( driver );
			await editorPage.displayed();
		} );

		test.describe( 'Can upload many media types', function() {
			test.describe( 'Can upload a normal image', function() {
				let fileDetails;

				test.it( 'Navigate to Editor page and create image file for upload', async function() {
					fileDetails = await mediaHelper.createFileWithFilename( 'normal.jpg' );
				} );

				test.it( 'Can upload an image', async function() {
					await editorPage.uploadMedia( fileDetails );
				} );

				test.it( 'Can delete image', async function() {
					await editorPage.deleteMedia();
				} );

				test.after( async function() {
					await editorPage.dismissMediaModal();
					if ( fileDetails ) {
						await mediaHelper.deleteFile( fileDetails );
					}
				} );
			} );

			test.describe( 'Can upload an image with reserved url chars in the filename', function() {
				let fileDetails;

				test.it( 'Create image file for upload', async function() {
					fileDetails = await mediaHelper.createFileWithFilename(
						'filewith#?#?reservedurlchars.jpg',
						true
					);
				} );

				test.it( 'Can upload an image', async function() {
					await editorPage.uploadMedia( fileDetails );
				} );

				test.it( 'Can delete image', async function() {
					await editorPage.deleteMedia();
				} );

				test.after( async function() {
					await editorPage.dismissMediaModal();
					if ( fileDetails ) {
						await mediaHelper.deleteFile( fileDetails );
					}
				} );
			} );

			test.describe( 'Can upload an mp3', function() {
				let fileDetails;

				test.it( 'Create mp3 for upload', async function() {
					fileDetails = await mediaHelper.getMP3FileWithFilename( 'new.mp3' );
				} );

				test.it( 'Can upload an mp3', async function() {
					await editorPage.uploadMedia( fileDetails );
				} );

				test.it( 'Can delete mp3', async function() {
					await editorPage.deleteMedia();
				} );

				test.after( async function() {
					await editorPage.dismissMediaModal();
					if ( fileDetails ) {
						await mediaHelper.deleteFile( fileDetails );
					}
				} );
			} );

			test.describe( 'Can upload Featured image', () => {
				let fileDetails;
				let editorSidebar;

				test.it( 'Create image file for upload', async function() {
					fileDetails = await mediaHelper.createFile();
				} );

				test.it( 'Can open Featured Image upload modal', async function() {
					editorSidebar = new PostEditorSidebarComponent( driver );
					await editorSidebar.displayed();
					await editorSidebar.expandFeaturedImage();
					await editorSidebar.openFeaturedImageDialog();
				} );

				test.it( 'Can set Featured Image', async function() {
					await editorPage.sendFile( fileDetails.file );
					await editorPage.saveImage( fileDetails.imageName );
					// Will wait until image is actually shows up on editor page
					await editorPage.waitUntilFeaturedImageInserted();
				} );

				test.it( 'Can remove Featured Image', async function() {
					await editorSidebar.removeFeaturedImage();
					await editorSidebar.closeFeaturedImage();
				} );

				test.it( 'Can delete uploaded image', async function() {
					await editorSidebar.expandFeaturedImage();
					await editorSidebar.openFeaturedImageDialog();
					await editorPage.selectImageByNumber( 0 );
					await editorPage.deleteMedia();
				} );

				test.after( async function() {
					await editorPage.dismissMediaModal();
					if ( fileDetails ) {
						await mediaHelper.deleteFile( fileDetails );
					}
					await editorSidebar.closeFeaturedImage();
				} );
			} );
		} );
	} );
} );
