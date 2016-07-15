import test from 'selenium-webdriver/testing';
import config from 'config';
import assert from 'assert';

import * as driverManager from '../lib/driver-manager';
import * as dataHelper from '../lib/data-helper';
import * as mediaHelper from '../lib/media-helper';
import LoginFlow from '../lib/flows/login-flow';
import CustomizerPage from '../lib/pages/customizer-page';
import SidebarComponent from '../lib/components/sidebar-component';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();

var driver;

test.before( 'Start Browser', function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( 'Post-NUX Flows (' + screenSize + ')', function() {
	this.timeout( mochaTimeOut );

	test.describe( 'Sign in as a post NUX user and load the customizer', function() {
		this.bailSuite( true );

		test.it( 'Ensure we are not logged in as anyone', function() {
			return driverManager.ensureNotLoggedIn( driver );
		} );

		test.it( 'Sign in as a post NUX user and choose customize theme', function() {
			this.loginFlow = new LoginFlow( driver, 'postNUXUser' );
			this.loginFlow.loginAndSelectMySite();
			this.sidebarComponent = new SidebarComponent( driver );
			return this.sidebarComponent.customizeTheme();
		} );

		test.it( 'Can see the customizer', function() {
			const customizerPage = new CustomizerPage( driver );
			customizerPage.displayed().then( ( displayed ) => {
				assert( displayed, 'The customizer page was not displayed' );
			} );
		} );

		test.describe( 'Customize and Preview site', function() {
			test.describe( 'Can customize the site identity ', function() {
				test.it( 'Can expand site identity', function() {
					const customizerPage = new CustomizerPage( driver );
					return customizerPage.expandSiteIdentity();
				} );

				test.it( 'Can update and view site title', function() {
					const newSiteTitle = dataHelper.randomPhrase();
					const customizerPage = new CustomizerPage( driver );
					customizerPage.setTitle( newSiteTitle );
					customizerPage.previewTitle().then( ( titleShown ) => {
						assert.equal( titleShown.toUpperCase(), newSiteTitle.toUpperCase(), 'The customizer preview title shown does not reflect the title input' );
					} );
				} );

				test.it( 'Can update and view site tagline', function() {
					if ( screenSize !== 'desktop' ) {
						console.log( 'Preview of Taglines not supported on mobile & tablet - skipping test' );
						return true;
					}
					const newTagline = dataHelper.randomPhrase();
					const customizerPage = new CustomizerPage( driver );
					customizerPage.setTagline( newTagline );
					customizerPage.previewTagline().then( ( taglineShown ) => {
						assert.equal( taglineShown.toUpperCase(), newTagline.toUpperCase(), 'The customizer preview tagline shown does not reflect the tagline input' );
					} );
				} );

				test.it( 'Direct Manipulation: clicking the icon on title jumps to site title field', function() {
					const customizerPage = new CustomizerPage( driver );
					customizerPage.clickSiteTitleIconInPreview();
					assert( customizerPage.waitForTitleFieldDisplayed(), 'The title field is not displayed' );
				} );

				test.it( 'Close site identity', function() {
					const customizerPage = new CustomizerPage( driver );
					return customizerPage.closeOpenSection();
				} );

				test.it( 'Can update and see the site\'s colors', function() {
					const customizerPage = new CustomizerPage( driver );
					customizerPage.expandColorsAndBackgrounds();
					customizerPage.chooseBackgroundColor();
					customizerPage.previewShowsCustomBackgroundColor().then( ( displayed ) => {
						assert( displayed, 'The customizer preview is not showing the custom background color' );
					} );
				} );

				test.it( 'Close custom colors', function() {
					const customizerPage = new CustomizerPage( driver );
					return customizerPage.closeOpenSection();
				} );

				test.describe( 'Customize Heading Font', function() {
					let headingFontName = '';

					test.it( 'Expand fonts', function() {
						const customizerPage = new CustomizerPage( driver );
						customizerPage.expandFonts();
					} );

					test.it( 'Can set the site\'s heading font', function() {
						const customizerPage = new CustomizerPage( driver );
						return customizerPage.chooseFirstHeadingsFont().then( ( font ) => {
							headingFontName = font.toLowerCase().replace( /\s/g, '' );
						} );
					} );

					test.it( 'Can see the site\'s heading font in preview', function() {
						const customizerPage = new CustomizerPage( driver );
						assert( headingFontName !== '', 'The heading font was not retrieved from the customizer' );
						customizerPage.previewUsesFont( headingFontName ).then( ( fontUsed ) => {
							assert( fontUsed, `The font '${headingFontName}' does not appear to be used in the customizer preview` );
						} );
					} );

					test.it( 'Close custom fonts', function() {
						const customizerPage = new CustomizerPage( driver );
						return customizerPage.closeOpenSection();
					} );
				} );

				test.describe( 'Customize Base Font', function() {
					let baseFontName = '';

					test.it( 'Expand fonts', function() {
						const customizerPage = new CustomizerPage( driver );
						customizerPage.expandFonts();
					} );

					test.it( 'Can set the site\'s base font', function() {
						const customizerPage = new CustomizerPage( driver );
						return customizerPage.chooseFirstBaseFont().then( ( font ) => {
							baseFontName = font.toLowerCase().replace( /\s/g, '' );
						} );
					} );

					test.it( 'Can see the site\'s heading font in preview', function() {
						const customizerPage = new CustomizerPage( driver );
						assert( baseFontName !== '', 'The heading font was not retrieved from the customizer' );
						customizerPage.previewUsesFont( baseFontName ).then( ( fontUsed ) => {
							assert( fontUsed, `The font '${baseFontName}' does not appear to be used in the customizer preview` );
						} );
					} );

					test.it( 'Close custom fonts', function() {
						const customizerPage = new CustomizerPage( driver );
						return customizerPage.closeOpenSection();
					} );
				} );

				if ( screenSize !== 'mobile' ) { // header images broken on mobile https://github.com/Automattic/wp-calypso/issues/2380
					test.describe( 'Custom Header Image', function() {
						let fileDetails = null;

						test.before( 'Create header image file for upload', function() {
							this.customizerPage = new CustomizerPage( driver );
							return mediaHelper.createFile().then( function( details ) {
								fileDetails = details;
							} );
						} );

						test.it( 'Expand header image', function() {
							this.customizerPage.expandHeaderImage();
						} );

						test.it( 'Can set a custom header image', function() {
							this.customizerPage.setHeaderImage( fileDetails );
							this.customizerPage.waitForPreviewRefresh();
						} );

						test.it( 'Can see the custom header image in preview', function() {
							this.customizerPage.previewShowsHeader( fileDetails ).then( ( showsHeader ) => {
								assert( showsHeader, 'The preview is not showing the recently uploaded header image' );
							} );
						} );

						test.it( 'Close custom header', function() {
							const customizerPage = new CustomizerPage( driver );
							return customizerPage.closeOpenSection();
						} );

						test.after( function() {
							if ( fileDetails ) {
								mediaHelper.deleteFile( fileDetails ).then( function() {} );
							}
						} );
					} );
				}

				test.describe( 'Closing the customizer', function() {
					test.it( 'Close the customizer', function() {
						const customizerPage = new CustomizerPage( driver );
						return customizerPage.close();
					} );
				} );
			} );
		} );
	} );
} );
