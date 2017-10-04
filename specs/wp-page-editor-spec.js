import assert from 'assert';
import test from 'selenium-webdriver/testing';
import config from 'config';

import LoginFlow from '../lib/flows/login-flow.js';

import EditorPage from '../lib/pages/editor-page.js';
import ViewPagePage from '../lib/pages/view-page-page.js';
import NotFoundPage from '../lib/pages/not-found-page.js';
import PagesPage from '../lib/pages/pages-page.js';

import SidebarComponent from '../lib/components/sidebar-component.js';
import NavbarComponent from '../lib/components/navbar-component.js';
import PagePreviewComponent from '../lib/components/page-preview-component.js';
import PostEditorSidebarComponent from '../lib/components/post-editor-sidebar-component.js';
import PostEditorToolbarComponent from '../lib/components/post-editor-toolbar-component.js';

import * as driverManager from '../lib/driver-manager.js';
import * as mediaHelper from '../lib/media-helper.js';
import * as dataHelper from '../lib/data-helper.js';
import * as slackNotifier from '../lib/slack-notifier';
import * as eyesHelper from '../lib/eyes-helper.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();
const httpsHost = config.get( 'httpsHosts' ).indexOf( host ) !== -1;

var driver;

let eyes = eyesHelper.eyesSetup( true );

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();

	let testEnvironment = 'WordPress.com';
	let testName = `Site Pages [${global.browserName}] [${screenSize}]`;
	eyesHelper.eyesOpen( driver, eyes, testEnvironment, testName );
} );

test.describe( `[${host}] Editor: Pages (${screenSize})`, function() {
	this.timeout( mochaTimeOut );

	test.describe( 'Public Pages: @parallel @jetpack', function() {
		this.bailSuite( true );
		let fileDetails;

		test.before( function() {
			return driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		// Create image file for upload
		test.before( function() {
			return mediaHelper.createFile().then( function( details ) {
				fileDetails = details;
			} );
		} );

		test.describe( 'Publish a Public Page', function() {
			var pageTitle = dataHelper.randomPhrase();
			var pageQuote = 'If you have the same problem for a long time, maybe it’s not a problem. Maybe it’s a fact..\n— Itzhak Rabin';

			test.it( 'Can log in', function() {
				let loginFlow = new LoginFlow( driver );
				loginFlow.loginAndStartNewPage();
			} );

			test.it( 'Can enter page title, content and image', function() {
				let editorPage = new EditorPage( driver );
				editorPage.enterTitle( pageTitle );
				editorPage.enterContent( pageQuote + '\n' );
				editorPage.enterPostImage( fileDetails );
				return editorPage.waitUntilImageInserted( fileDetails );
			} );

			if ( process.env.VISDIFF ) {
				test.it( 'Open all sidebar sections for screenshot', function() {
					let postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
					postEditorSidebarComponent.expandStatusSection();
					postEditorSidebarComponent.expandFeaturedImage();
					postEditorSidebarComponent.expandSharingSection();
					postEditorSidebarComponent.expandMoreOptions();
					eyesHelper.eyesScreenshot( driver, eyes, 'Page Editor - New Page' );
				} );

				test.it( 'Close all sidebar sections', function() {
					let postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
					postEditorSidebarComponent.closeStatusSection();
					postEditorSidebarComponent.closeFeaturedImage();
					postEditorSidebarComponent.closeSharingSection();
					postEditorSidebarComponent.closeMoreOptions();
				} );
			}

			test.it( 'Can disable sharing buttons', function() {
				let postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
				postEditorSidebarComponent.expandSharingSection();
				postEditorSidebarComponent.setSharingButtons( false );
				postEditorSidebarComponent.closeSharingSection();
			} );

			if ( httpsHost ) {
				test.describe( 'Preview', function() {
					test.it( 'Can launch page preview', function() {
						let postEditorToolbarComponent = new PostEditorToolbarComponent( driver );
						postEditorToolbarComponent.ensureSaved();
						postEditorToolbarComponent.launchPreview();
						this.pagePreviewComponent = new PagePreviewComponent( driver );
					} );

					test.it( 'Can see correct page title in preview', function() {
						this.pagePreviewComponent.pageTitle().then( function( actualPageTitle ) {
							assert.equal( actualPageTitle.toUpperCase(), pageTitle.toUpperCase(), 'The page preview title is not correct' );
						} );
					} );

					test.it( 'Can see correct page content in preview', function() {
						this.pagePreviewComponent.pageContent().then( function( content ) {
							assert.equal( content.indexOf( pageQuote ) > -1, true, 'The page preview content (' + content + ') does not include the expected content (' + pageQuote + ')' );
						} );
					} );

					test.it( 'Can see the image uploaded in the preview', function() {
						return this.pagePreviewComponent.imageDisplayed( fileDetails ).then( ( imageDisplayed ) => {
							assert.equal( imageDisplayed, true, 'Could not see the image in the web preview' );
						} );
					} );

					test.it( 'Can close page preview', function() {
						this.pagePreviewComponent.close();
					} );
				} );

				test.describe( 'Publish and Preview Published Content', function() {
					test.it( 'Can publish and preview published content', function() {
						this.postEditorToolbarComponent = new PostEditorToolbarComponent( driver );
						if ( httpsHost ) {
							this.postEditorToolbarComponent.publishThePost( { useConfirmStep: true } );
						} else {
							this.postEditorToolbarComponent.publishAndPreviewPublished( { useConfirmStep: true } );
						}
						return this.pagePreviewComponent = new PagePreviewComponent( driver );
					} );

					test.it( 'Can see correct page title in preview', function() {
						this.pagePreviewComponent.pageTitle().then( function( actualPageTitle ) {
							assert.equal( actualPageTitle.toUpperCase(), pageTitle.toUpperCase(), 'The page preview title is not correct' );
						} );
					} );

					test.it( 'Can see correct page content in preview', function() {
						this.pagePreviewComponent.pageContent().then( function( content ) {
							assert.equal( content.indexOf( pageQuote ) > -1, true, 'The page preview content (' + content + ') does not include the expected content (' + pageQuote + ')' );
						} );
					} );

					test.it( 'Can see the image uploaded in the preview', function() {
						this.pagePreviewComponent.imageDisplayed( fileDetails ).then( ( imageDisplayed ) => {
							assert.equal( imageDisplayed, true, 'Could not see the image in the web preview' );
						} );
					} );

					test.it( 'Can close page preview', function() {
						if ( httpsHost ) {
							return this.pagePreviewComponent.edit();
						}

						// else Jetpack
						return this.pagePreviewComponent.close();
					} );
				} );
			} else { // Jetpack tests
				test.describe( 'Publish Content', function() {
					test.it( 'Can publish content', function() {
						this.postEditorToolbarComponent = new PostEditorToolbarComponent( driver );
						return this.postEditorToolbarComponent.publishThePost( { useConfirmStep: true } );
					} );
				} );
			}

			test.describe( 'View published content', function() {
				test.it( 'Can view content', function() {
					this.postEditorToolbarComponent = new PostEditorToolbarComponent( driver );
					this.postEditorToolbarComponent.viewPublishedPostOrPage();
					this.viewPagePage = new ViewPagePage( driver );
				} );

				test.it( 'Can see correct page title', function() {
					this.viewPagePage.pageTitle().then( function( actualPageTitle ) {
						assert.equal( actualPageTitle.toUpperCase(), pageTitle.toUpperCase(), 'The published blog page title is not correct' );
					} );
				} );

				test.it( 'Can see correct page content', function() {
					this.viewPagePage.pageContent().then( function( content ) {
						assert.equal( content.indexOf( pageQuote ) > -1, true, 'The page content (' + content + ') does not include the expected content (' + pageQuote + ')' );
					} );
				} );

				test.it( 'Can\'t see sharing buttons', function() {
					this.viewPagePage.sharingButtonsVisible().then( function( visible ) {
						assert.equal( visible, false, 'Sharing buttons are shown even though they were disabled when creating the page.' );
					} );
				} );

				test.it( 'Can see the image uploaded displayed', function() {
					this.viewPagePage.imageDisplayed( fileDetails ).then( ( imageDisplayed ) => {
						assert.equal( imageDisplayed, true, 'Could not see the image in the published page' );
					} );
				} );
			} );
		} );

		test.after( function() {
			if ( fileDetails ) {
				mediaHelper.deleteFile( fileDetails ).then( function() {} );
			}
		} );
	} );

	test.describe( 'Private Pages: @parallel @jetpack', function() {
		this.bailSuite( true );

		test.before( function() {
			driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.describe( 'Publish a Private Page', function() {
			var pageTitle = dataHelper.randomPhrase();
			var pageQuote = 'Few people know how to take a walk. The qualifications are endurance, plain clothes, old shoes, an eye for nature, good humor, vast curiosity, good speech, good silence and nothing too much.\n— Ralph Waldo Emerson\n';

			test.it( 'Can log in', function() {
				let loginFlow = new LoginFlow( driver );
				loginFlow.loginAndStartNewPage();
			} );

			test.it( 'Can enter page title and content', function() {
				let editorPage = new EditorPage( driver );
				editorPage.enterTitle( pageTitle );
				editorPage.enterContent( pageQuote );
				let postEditorToolbarComponent = new PostEditorToolbarComponent( driver );
				return postEditorToolbarComponent.ensureSaved();
			} );

			test.it( 'Can set visibility to private which immediately publishes it', function() {
				this.postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
				this.postEditorSidebarComponent.setVisibilityToPrivate();
				this.postEditorToolbarComponent = new PostEditorToolbarComponent( driver );
				return this.postEditorToolbarComponent.waitForSuccessViewPostNotice();
			} );

			if ( host === 'WPCOM' ) {
				test.describe( 'View content as logged in user', function() {
					test.it( 'Can view content', function() {
						let postEditorToolbarComponent = new PostEditorToolbarComponent( driver );
						postEditorToolbarComponent.viewPublishedPostOrPage();
					} );

					test.it( 'Can view page title as logged in user', function() {
						let viewPagePage = new ViewPagePage( driver );
						viewPagePage.pageTitle().then( function( actualPageTitle ) {
							assert.equal( actualPageTitle.toUpperCase(), ( 'Private: ' + pageTitle ).toUpperCase(), 'The published blog page title is not correct' );
						} );
					} );

					test.it( 'Can view page content as logged in user', function() {
						let viewPagePage = new ViewPagePage( driver );
						viewPagePage.pageContent().then( function( content ) {
							assert.equal( content.indexOf( pageQuote ) > -1, true, 'The page content (' + content + ') does not include the expected content (' + pageQuote + ')' );
						} );
					} );

					test.it( 'Can\'t view page title or content as non-logged in user', function() {
						driver.manage().deleteAllCookies();
						driver.navigate().refresh();

						let notFoundPage = new NotFoundPage( driver );
						notFoundPage.displayed().then( function( displayed ) {
							assert.equal( displayed, true, 'Could not see the not found (404) page. Check that it is displayed' );
						} );
					} );
				} );
			} else { // Jetpack tests
				test.describe( 'Cannot view content before logging in', function() {
					test.it( 'Open published page', function() {
						let postEditorToolbarComponent = new PostEditorToolbarComponent( driver );
						postEditorToolbarComponent.viewPublishedPostOrPage();
					} );

					test.it( 'Can\'t view page title or content as non-logged in user', function() {
						let notFoundPage = new NotFoundPage( driver );
						notFoundPage.displayed().then( function( displayed ) {
							assert.equal( displayed, true, 'Could not see the not found (404) page. Check that it is displayed' );
						} );
					} );
				} );
				//TODO: Add Jetpack SSO and verify content actually published
			}
		} );
	} );

	test.describe( 'Password Protected Pages: @parallel @jetpack', function() {
		this.bailSuite( true );
		test.before( function() {
			driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.describe( 'Publish a Password Protected Page', function() {
			var pageTitle = dataHelper.randomPhrase();
			var pageQuote = 'If you don’t like something, change it. If you can’t change it, change the way you think about it.\n— Mary Engelbreit\n';
			var postPassword = 'e2e' + new Date().getTime().toString();

			test.it( 'Can log in', function() {
				let loginFlow = new LoginFlow( driver );
				loginFlow.loginAndStartNewPage();
			} );

			test.it( 'Can enter page title and content and set to password protected', function() {
				this.editorPage = new EditorPage( driver );
				this.editorPage.enterTitle( pageTitle );
				this.postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
				this.postEditorSidebarComponent.setVisibilityToPasswordProtected( postPassword );
				this.editorPage = new EditorPage( driver );
				this.editorPage.enterContent( pageQuote );
				this.postEditorToolbarComponent = new PostEditorToolbarComponent( driver );
				this.postEditorToolbarComponent.ensureSaved();
			} );

			test.describe( 'Publish and View', function() {
				test.it( 'Can publish and view content', function() {
					let postEditorToolbarComponent = new PostEditorToolbarComponent( driver );
					postEditorToolbarComponent.publishAndViewContent( { useConfirmStep: true } );
				} );

				test.describe( 'As a logged in user', function() {
					test.describe( 'With no password entered', function() {
						test.it( 'Can view page title', function() {
							let viewPagePage = new ViewPagePage( driver );
							viewPagePage.pageTitle().then( function( actualPageTitle ) {
								assert.equal( actualPageTitle.toUpperCase(), ( 'Protected: ' + pageTitle ).toUpperCase() );
							} );
						} );

						test.it( 'Can see password field', function() {
							let viewPagePage = new ViewPagePage( driver );
							viewPagePage.isPasswordProtected().then( function( isPasswordProtected ) {
								assert.equal( isPasswordProtected, true, 'The page does not appear to be password protected' );
							} );
						} );

						test.it( 'Can\'t see content when no password is entered', function() {
							let viewPagePage = new ViewPagePage( driver );
							viewPagePage.pageContent().then( function( content ) {
								assert.equal( content.indexOf( pageQuote ) === -1, true, 'The page content (' + content + ') displays the expected content (' + pageQuote + ') when it should be password protected.' );
							} );
						} );
					} );

					test.describe( 'With incorrect password entered', function() {
						test.it( 'Enter incorrect password', function() {
							let viewPagePage = new ViewPagePage( driver );
							viewPagePage.enterPassword( 'password' );
						} );

						test.it( 'Can view page title', function() {
							let viewPagePage = new ViewPagePage( driver );
							viewPagePage.pageTitle().then( function( actualPageTitle ) {
								assert.equal( actualPageTitle.toUpperCase(), ( 'Protected: ' + pageTitle ).toUpperCase() );
							} );
						} );

						test.it( 'Can see password field', function() {
							let viewPagePage = new ViewPagePage( driver );
							viewPagePage.isPasswordProtected().then( function( isPasswordProtected ) {
								assert.equal( isPasswordProtected, true, 'The page does not appear to be password protected' );
							} );
						} );

						test.it( 'Can\'t see content when incorrect password is entered', function() {
							let viewPagePage = new ViewPagePage( driver );
							viewPagePage.pageContent().then( function( content ) {
								assert.equal( content.indexOf( pageQuote ) === -1, true, 'The page content (' + content + ') displays the expected content (' + pageQuote + ') when it should be password protected.' );
							} );
						} );
					} );

					test.describe( 'With correct password entered', function() {
						test.it( 'Enter correct password', function() {
							let viewPagePage = new ViewPagePage( driver );
							viewPagePage.enterPassword( postPassword );
						} );

						test.it( 'Can view page title', function() {
							let viewPagePage = new ViewPagePage( driver );
							viewPagePage.pageTitle().then( function( actualPageTitle ) {
								assert.equal( actualPageTitle.toUpperCase(), ( 'Protected: ' + pageTitle ).toUpperCase() );
							} );
						} );

						test.it( 'Can\'t see password field', function() {
							let viewPagePage = new ViewPagePage( driver );
							viewPagePage.isPasswordProtected().then( function( isPasswordProtected ) {
								assert.equal( isPasswordProtected, false, 'The page still seems to be password protected' );
							} );
						} );

						test.it( 'Can see page content', function() {
							let viewPagePage = new ViewPagePage( driver );
							viewPagePage.pageContent().then( function( content ) {
								assert.equal( content.indexOf( pageQuote ) > -1, true, 'The page content (' + content + ') does not include the expected content (' + pageQuote + ')' );
							} );
						} );
					} );
				} );
				test.describe( 'As a non-logged in user', function() {
					test.it( 'Clear cookies (log out)', function() {
						driver.manage().deleteAllCookies();
						driver.navigate().refresh();
					} );
					test.describe( 'With no password entered', function() {
						test.it( 'Can view page title', function() {
							let viewPagePage = new ViewPagePage( driver );
							viewPagePage.pageTitle().then( function( actualPageTitle ) {
								assert.equal( actualPageTitle.toUpperCase(), ( 'Protected: ' + pageTitle ).toUpperCase() );
							} );
						} );

						test.it( 'Can see password field', function() {
							let viewPagePage = new ViewPagePage( driver );
							viewPagePage.isPasswordProtected().then( function( isPasswordProtected ) {
								assert.equal( isPasswordProtected, true, 'The page does not appear to be password protected' );
							} );
						} );

						test.it( 'Can\'t see content when no password is entered', function() {
							let viewPagePage = new ViewPagePage( driver );
							viewPagePage.pageContent().then( function( content ) {
								assert.equal( content.indexOf( pageQuote ) === -1, true, 'The page content (' + content + ') displays the expected content (' + pageQuote + ') when it should be password protected.' );
							} );
						} );
					} );

					test.describe( 'With incorrect password entered', function() {
						test.it( 'Enter incorrect password', function() {
							let viewPagePage = new ViewPagePage( driver );
							viewPagePage.enterPassword( 'password' );
						} );

						test.it( 'Can view page title', function() {
							let viewPagePage = new ViewPagePage( driver );
							viewPagePage.pageTitle().then( function( actualPageTitle ) {
								assert.equal( actualPageTitle.toUpperCase(), ( 'Protected: ' + pageTitle ).toUpperCase() );
							} );
						} );

						test.it( 'Can see password field', function() {
							let viewPagePage = new ViewPagePage( driver );
							viewPagePage.isPasswordProtected().then( function( isPasswordProtected ) {
								assert.equal( isPasswordProtected, true, 'The page does not appear to be password protected' );
							} );
						} );

						test.it( 'Can\'t see content when incorrect password is entered', function() {
							let viewPagePage = new ViewPagePage( driver );
							viewPagePage.pageContent().then( function( content ) {
								assert.equal( content.indexOf( pageQuote ) === -1, true, 'The page content (' + content + ') displays the expected content (' + pageQuote + ') when it should be password protected.' );
							} );
						} );
					} );

					test.describe( 'With correct password entered', function() {
						test.it( 'Enter correct password', function() {
							let viewPagePage = new ViewPagePage( driver );
							viewPagePage.enterPassword( postPassword );
						} );

						test.it( 'Can view page title', function() {
							let viewPagePage = new ViewPagePage( driver );
							viewPagePage.pageTitle().then( function( actualPageTitle ) {
								assert.equal( actualPageTitle.toUpperCase(), ( 'Protected: ' + pageTitle ).toUpperCase() );
							} );
						} );

						test.it( 'Can\'t see password field', function() {
							let viewPagePage = new ViewPagePage( driver );
							viewPagePage.isPasswordProtected().then( function( isPasswordProtected ) {
								assert.equal( isPasswordProtected, false, 'The page still seems to be password protected' );
							} );
						} );

						test.it( 'Can see page content', function() {
							let viewPagePage = new ViewPagePage( driver );
							viewPagePage.pageContent().then( function( content ) {
								assert.equal( content.indexOf( pageQuote ) > -1, true, 'The page content (' + content + ') does not include the expected content (' + pageQuote + ')' );
							} );
						} );
					} );
				} );
			} );
		} );
	} );

	test.describe( 'Edit a Page: @parallel', function() {
		this.bailSuite( true );

		test.it( 'Delete Cookies and Local Storage', function() {
			driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.describe( 'Publish a New Page', function() {
			const originalPageTitle = dataHelper.randomPhrase();
			const updatedPageTitle = dataHelper.randomPhrase();
			const pageQuote = 'What we need today are universal values based not on faith but on scientific findings, common experience and common sense.\n— Dalai Lama\n';

			test.it( 'Can log in', function() {
				this.loginFlow = new LoginFlow( driver );
				return this.loginFlow.loginAndStartNewPage();
			} );

			test.it( 'Can enter page title and content', function() {
				this.editorPage = new EditorPage( driver );
				this.editorPage.enterTitle( originalPageTitle );
				this.editorPage.enterContent( pageQuote );
				return this.editorPage.errorDisplayed().then( ( errorShown ) => {
					return assert.equal( errorShown, false, 'There is an error shown on the editor page!' );
				} );
			} );

			test.it( 'Can publish the page', function() {
				this.postEditorToolbarComponent = new PostEditorToolbarComponent( driver );
				this.postEditorToolbarComponent.ensureSaved();
				this.postEditorToolbarComponent.publishThePost( { useConfirmStep: true } );
				return this.postEditorToolbarComponent.waitForSuccessViewPostNotice();
			} );

			test.describe( 'Edit the page via pages', function() {
				test.it( 'Can view the page list', function() {
					this.navbarComponent = new NavbarComponent( driver );
					this.navbarComponent.clickMySites();
					this.sidebarComponent = new SidebarComponent( driver );
					this.sidebarComponent.selectPages();
					this.pagesPage = new PagesPage( driver );
					this.pagesPage.waitForPages();
					eyesHelper.eyesScreenshot( driver, eyes, 'Site Pages List' );
				} );

				test.it( 'Can see and edit our new page', function() {
					this.pagesPage.isPageDisplayed( originalPageTitle ).then( ( displayed ) => {
						if ( displayed === false ) {
							slackNotifier.warn( 'Could not locate the page on site pages page, retrying the pages menu option again' );
							this.sidebarComponent = new SidebarComponent( driver );
							this.sidebarComponent.selectPages();
							this.pagesPage = new PagesPage( driver );
							return this.pagesPage.waitForPages();
						}
					} );
					this.pagesPage.isPageDisplayed( originalPageTitle ).then( ( displayed ) => {
						assert.equal( displayed, true, `The page titled '${originalPageTitle}' is not displayed in the list of pages` );
					} );
					this.pagesPage.editPageWithTitle( originalPageTitle );
					this.editorPage = new EditorPage( driver );
				} );

				test.it( 'Can see the page title', function() {
					this.editorPage.waitForTitle();
					this.editorPage.titleShown().then( ( titleShown ) => {
						assert.equal( titleShown, originalPageTitle, 'The page title shown was unexpected' );
					} );
				} );

				test.it( 'Can set the new title and save it', function() {
					this.editorPage.enterTitle( updatedPageTitle );
					this.editorPage.errorDisplayed().then( ( errorShown ) => {
						assert.equal( errorShown, false, 'There is an error shown on the editor page!' );
					} );
					this.postEditorToolbarComponent = new PostEditorToolbarComponent( driver );
					this.postEditorToolbarComponent.ensureSaved();
					this.postEditorToolbarComponent.publishAndViewContent();
				} );

				test.describe( 'Can view the page with the new title', function() {
					test.it( 'Can view the page', function() {
						return this.viewPagePage = new ViewPagePage( driver );
					} );

					test.it( 'Can see correct page title', function() {
						this.viewPagePage.pageTitle().then( function( actualPageTitle ) {
							assert.equal( actualPageTitle.toLowerCase(), updatedPageTitle.toLowerCase(), 'The published page title is not correct' );
						} );
					} );
				} );
			} );
		} );
	} );
} );

test.after( function() {
	eyesHelper.eyesClose( eyes );
} );
