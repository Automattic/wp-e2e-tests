/** @format */

import assert from 'assert';
import test from 'selenium-webdriver/testing';
import config from 'config';

import LoginFlow from '../lib/flows/login-flow.js';

import EditorPage from '../lib/pages/editor-page.js';
import ViewPagePage from '../lib/pages/view-page-page.js';
import NotFoundPage from '../lib/pages/not-found-page.js';

import PagePreviewComponent from '../lib/components/page-preview-component.js';
import PostEditorSidebarComponent from '../lib/components/post-editor-sidebar-component.js';
import PostEditorToolbarComponent from '../lib/components/post-editor-toolbar-component.js';

import * as driverManager from '../lib/driver-manager.js';
import * as mediaHelper from '../lib/media-helper.js';
import * as dataHelper from '../lib/data-helper.js';
import * as driverHelper from '../lib/driver-helper';
import PaypalCheckoutPage from '../lib/pages/external/paypal-checkout-page';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

let driver;

test.before( async function() {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

test.describe( `[${ host }] Editor: Pages (${ screenSize })`, function() {
	this.timeout( mochaTimeOut );

	test.describe( 'Public Pages: @parallel @jetpack', function() {
		this.bailSuite( true );
		let fileDetails;

		test.before( async function() {
			return await driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		// Create image file for upload
		test.before( async function() {
			fileDetails = await mediaHelper.createFile();
			return fileDetails;
		} );

		test.describe( 'Publish a Public Page', function() {
			let pageTitle = dataHelper.randomPhrase();
			let pageQuote =
				'If you have the same problem for a long time, maybe it’s not a problem. Maybe it’s a fact..\n— Itzhak Rabin';

			test.it( 'Can log in', async function() {
				let loginFlow = new LoginFlow( driver );
				await loginFlow.loginAndStartNewPage();
			} );

			test.it( 'Can enter page title, content and image', async function() {
				let editorPage = new EditorPage( driver );
				await editorPage.enterTitle( pageTitle );
				await editorPage.enterContent( pageQuote + '\n' );
				await editorPage.enterPostImage( fileDetails );
				await editorPage.waitUntilImageInserted( fileDetails );
				let errorShown = await editorPage.errorDisplayed();
				assert.equal( errorShown, false, 'There is an error shown on the editor page!' );
			} );

			test.it( 'Can disable sharing buttons', async function() {
				let postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
				await postEditorSidebarComponent.expandSharingSection();
				await postEditorSidebarComponent.setSharingButtons( false );
				await postEditorSidebarComponent.closeSharingSection();
			} );

			test.describe( 'Preview', function() {
				test.it( 'Can launch page preview', async function() {
					let postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
					await postEditorSidebarComponent.hideComponentIfNecessary();

					let postEditorToolbarComponent = new PostEditorToolbarComponent( driver );
					await postEditorToolbarComponent.ensureSaved();
					await postEditorToolbarComponent.launchPreview();
				} );

				test.it( 'Can see correct page title in preview', async function() {
					this.pagePreviewComponent = new PagePreviewComponent( driver );
					let actualPageTitle = await this.pagePreviewComponent.pageTitle();
					assert.equal(
						actualPageTitle.toUpperCase(),
						pageTitle.toUpperCase(),
						'The page preview title is not correct'
					);
				} );

				test.it( 'Can see correct page content in preview', async function() {
					let content = await this.pagePreviewComponent.pageContent();
					assert.equal(
						content.indexOf( pageQuote ) > -1,
						true,
						'The page preview content (' +
							content +
							') does not include the expected content (' +
							pageQuote +
							')'
					);
				} );

				test.it( 'Can see the image uploaded in the preview', async function() {
					let imageDisplayed = await this.pagePreviewComponent.imageDisplayed( fileDetails );
					return assert.equal( imageDisplayed, true, 'Could not see the image in the web preview' );
				} );

				test.it( 'Can close page preview', async function() {
					await this.pagePreviewComponent.close();
				} );
			} );

			test.describe( 'Publish and Preview Published Content', function() {
				test.it( 'Can publish and preview published content', async function() {
					this.postEditorToolbarComponent = new PostEditorToolbarComponent( driver );
					await this.postEditorToolbarComponent.publishThePost( { useConfirmStep: true } );
				} );

				test.it( 'Can see correct page title in preview', async function() {
					this.pagePreviewComponent = new PagePreviewComponent( driver );
					let actualPageTitle = await this.pagePreviewComponent.pageTitle();
					assert.equal(
						actualPageTitle.toUpperCase(),
						pageTitle.toUpperCase(),
						'The page preview title is not correct'
					);
				} );

				test.it( 'Can see correct page content in preview', async function() {
					let content = await this.pagePreviewComponent.pageContent();
					assert.equal(
						content.indexOf( pageQuote ) > -1,
						true,
						'The page preview content (' +
							content +
							') does not include the expected content (' +
							pageQuote +
							')'
					);
				} );

				test.it( 'Can see the image uploaded in the preview', async function() {
					let imageDisplayed = await this.pagePreviewComponent.imageDisplayed( fileDetails );
					assert.equal( imageDisplayed, true, 'Could not see the image in the web preview' );
				} );

				test.it( 'Can close page preview', async function() {
					return await this.pagePreviewComponent.edit();
				} );
			} );

			test.describe( 'View published content', function() {
				test.it( 'Can view content', async function() {
					this.postEditorToolbarComponent = new PostEditorToolbarComponent( driver );
					await this.postEditorToolbarComponent.viewPublishedPostOrPage();
				} );

				test.it( 'Can see correct page title', async function() {
					this.viewPagePage = new ViewPagePage( driver );
					let actualPageTitle = await this.viewPagePage.pageTitle();
					assert.equal(
						actualPageTitle.toUpperCase(),
						pageTitle.toUpperCase(),
						'The published blog page title is not correct'
					);
				} );

				test.it( 'Can see correct page content', async function() {
					let content = await this.viewPagePage.pageContent();
					assert.equal(
						content.indexOf( pageQuote ) > -1,
						true,
						'The page content (' +
							content +
							') does not include the expected content (' +
							pageQuote +
							')'
					);
				} );

				test.it( "Can't see sharing buttons", async function() {
					let visible = await this.viewPagePage.sharingButtonsVisible();
					assert.equal(
						visible,
						false,
						'Sharing buttons are shown even though they were disabled when creating the page.'
					);
				} );

				test.it( 'Can see the image uploaded displayed', async function() {
					let imageDisplayed = await this.viewPagePage.imageDisplayed( fileDetails );
					assert.equal( imageDisplayed, true, 'Could not see the image in the published page' );
				} );
			} );
		} );

		test.after( async function() {
			if ( fileDetails ) {
				await mediaHelper.deleteFile( fileDetails );
			}
		} );
	} );

	test.describe( 'Private Pages: @parallel @jetpack', function() {
		this.bailSuite( true );

		test.before( async function() {
			await driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.describe( 'Publish a Private Page', function() {
			let pageTitle = dataHelper.randomPhrase();
			let pageQuote =
				'Few people know how to take a walk. The qualifications are endurance, plain clothes, old shoes, an eye for nature, good humor, vast curiosity, good speech, good silence and nothing too much.\n— Ralph Waldo Emerson\n';

			test.it( 'Can log in', async function() {
				let loginFlow = new LoginFlow( driver );
				await loginFlow.loginAndStartNewPage();
			} );

			test.it( 'Can enter page title and content', async function() {
				let editorPage = new EditorPage( driver );
				await editorPage.enterTitle( pageTitle );
				await editorPage.enterContent( pageQuote );
				let postEditorToolbarComponent = new PostEditorToolbarComponent( driver );
				return await postEditorToolbarComponent.ensureSaved();
			} );

			test.it( 'Can set visibility to private which immediately publishes it', async function() {
				this.postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
				await this.postEditorSidebarComponent.setVisibilityToPrivate();
				this.postEditorToolbarComponent = new PostEditorToolbarComponent( driver );
				return await this.postEditorToolbarComponent.waitForSuccessViewPostNotice();
			} );

			if ( host === 'WPCOM' ) {
				test.describe( 'View content as logged in user', function() {
					test.it( 'Can view content', async function() {
						let postEditorToolbarComponent = new PostEditorToolbarComponent( driver );
						await postEditorToolbarComponent.viewPublishedPostOrPage();
					} );

					test.it( 'Can view page title as logged in user', async function() {
						let viewPagePage = new ViewPagePage( driver );
						let actualPageTitle = await viewPagePage.pageTitle();
						assert.equal(
							actualPageTitle.toUpperCase(),
							( 'Private: ' + pageTitle ).toUpperCase(),
							'The published blog page title is not correct'
						);
					} );

					test.it( 'Can view page content as logged in user', async function() {
						let viewPagePage = new ViewPagePage( driver );
						let content = await viewPagePage.pageContent();
						assert.equal(
							content.indexOf( pageQuote ) > -1,
							true,
							'The page content (' +
								content +
								') does not include the expected content (' +
								pageQuote +
								')'
						);
					} );

					test.it( "Can't view page title or content as non-logged in user", async function() {
						await driver.manage().deleteAllCookies();
						await driver.navigate().refresh();

						let notFoundPage = new NotFoundPage( driver );
						let displayed = await notFoundPage.displayed();
						assert.equal(
							displayed,
							true,
							'Could not see the not found (404) page. Check that it is displayed'
						);
					} );
				} );
			} else {
				// Jetpack tests
				test.describe( 'Cannot view content before logging in', function() {
					test.it( 'Open published page', async function() {
						let postEditorToolbarComponent = new PostEditorToolbarComponent( driver );
						await postEditorToolbarComponent.viewPublishedPostOrPage();
					} );

					test.it( "Can't view page title or content as non-logged in user", async function() {
						let notFoundPage = new NotFoundPage( driver );
						let displayed = await notFoundPage.displayed();
						assert.equal(
							displayed,
							true,
							'Could not see the not found (404) page. Check that it is displayed'
						);
					} );
				} );
				//TODO: Add Jetpack SSO and verify content actually published
			}
		} );
	} );

	test.describe( 'Password Protected Pages: @parallel @jetpack', function() {
		this.bailSuite( true );
		test.before( async function() {
			await driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.describe( 'Publish a Password Protected Page', function() {
			let pageTitle = dataHelper.randomPhrase();
			let pageQuote =
				'If you don’t like something, change it. If you can’t change it, change the way you think about it.\n— Mary Engelbreit\n';
			let postPassword = 'e2e' + new Date().getTime().toString();

			test.it( 'Can log in', async function() {
				let loginFlow = new LoginFlow( driver );
				await loginFlow.loginAndStartNewPage();
			} );

			test.it( 'Can enter page title and content and set to password protected', async function() {
				this.editorPage = new EditorPage( driver );
				await this.editorPage.enterTitle( pageTitle );
				this.postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
				await this.postEditorSidebarComponent.setVisibilityToPasswordProtected( postPassword );
				this.editorPage = new EditorPage( driver );
				await this.editorPage.enterContent( pageQuote );
				this.postEditorToolbarComponent = new PostEditorToolbarComponent( driver );
				await this.postEditorToolbarComponent.ensureSaved();
			} );

			test.describe( 'Publish and View', function() {
				test.it( 'Can publish and view content', async function() {
					let postEditorToolbarComponent = new PostEditorToolbarComponent( driver );
					await postEditorToolbarComponent.publishAndViewContent( { useConfirmStep: true } );
				} );

				test.describe( 'As a logged in user', function() {
					test.describe( 'With no password entered', function() {
						test.it( 'Can view page title', async function() {
							let viewPagePage = new ViewPagePage( driver );
							let actualPageTitle = await viewPagePage.pageTitle();
							assert.equal(
								actualPageTitle.toUpperCase(),
								( 'Protected: ' + pageTitle ).toUpperCase()
							);
						} );

						test.it( 'Can see password field', async function() {
							let viewPagePage = new ViewPagePage( driver );
							let isPasswordProtected = await viewPagePage.isPasswordProtected();
							assert.equal(
								isPasswordProtected,
								true,
								'The page does not appear to be password protected'
							);
						} );

						test.it( "Can't see content when no password is entered", async function() {
							let viewPagePage = new ViewPagePage( driver );
							let content = await viewPagePage.pageContent();
							assert.equal(
								content.indexOf( pageQuote ) === -1,
								true,
								'The page content (' +
									content +
									') displays the expected content (' +
									pageQuote +
									') when it should be password protected.'
							);
						} );
					} );

					test.describe( 'With incorrect password entered', function() {
						test.it( 'Enter incorrect password', async function() {
							let viewPagePage = new ViewPagePage( driver );
							await viewPagePage.enterPassword( 'password' );
						} );

						test.it( 'Can view page title', async function() {
							let viewPagePage = new ViewPagePage( driver );
							let actualPageTitle = await viewPagePage.pageTitle();
							assert.equal(
								actualPageTitle.toUpperCase(),
								( 'Protected: ' + pageTitle ).toUpperCase()
							);
						} );

						test.it( 'Can see password field', async function() {
							let viewPagePage = new ViewPagePage( driver );
							let isPasswordProtected = await viewPagePage.isPasswordProtected();
							assert.equal(
								isPasswordProtected,
								true,
								'The page does not appear to be password protected'
							);
						} );

						test.it( "Can't see content when incorrect password is entered", async function() {
							let viewPagePage = new ViewPagePage( driver );
							let content = await viewPagePage.pageContent();
							assert.equal(
								content.indexOf( pageQuote ) === -1,
								true,
								'The page content (' +
									content +
									') displays the expected content (' +
									pageQuote +
									') when it should be password protected.'
							);
						} );
					} );

					test.describe( 'With correct password entered', function() {
						test.it( 'Enter correct password', async function() {
							let viewPagePage = new ViewPagePage( driver );
							await viewPagePage.enterPassword( postPassword );
						} );

						test.it( 'Can view page title', async function() {
							let viewPagePage = new ViewPagePage( driver );
							let actualPageTitle = await viewPagePage.pageTitle();
							assert.equal(
								actualPageTitle.toUpperCase(),
								( 'Protected: ' + pageTitle ).toUpperCase()
							);
						} );

						test.it( "Can't see password field", async function() {
							let viewPagePage = new ViewPagePage( driver );
							let isPasswordProtected = await viewPagePage.isPasswordProtected();
							assert.equal(
								isPasswordProtected,
								false,
								'The page still seems to be password protected'
							);
						} );

						test.it( 'Can see page content', async function() {
							let viewPagePage = new ViewPagePage( driver );
							let content = await viewPagePage.pageContent();
							assert.equal(
								content.indexOf( pageQuote ) > -1,
								true,
								'The page content (' +
									content +
									') does not include the expected content (' +
									pageQuote +
									')'
							);
						} );
					} );
				} );
				test.describe( 'As a non-logged in user', function() {
					test.it( 'Clear cookies (log out)', async function() {
						await driver.manage().deleteAllCookies();
						await driver.navigate().refresh();
					} );
					test.describe( 'With no password entered', function() {
						test.it( 'Can view page title', async function() {
							let viewPagePage = new ViewPagePage( driver );
							let actualPageTitle = await viewPagePage.pageTitle();
							assert.equal(
								actualPageTitle.toUpperCase(),
								( 'Protected: ' + pageTitle ).toUpperCase()
							);
						} );

						test.it( 'Can see password field', async function() {
							let viewPagePage = new ViewPagePage( driver );
							let isPasswordProtected = await viewPagePage.isPasswordProtected();
							assert.equal(
								isPasswordProtected,
								true,
								'The page does not appear to be password protected'
							);
						} );

						test.it( "Can't see content when no password is entered", async function() {
							let viewPagePage = new ViewPagePage( driver );
							let content = await viewPagePage.pageContent();
							assert.equal(
								content.indexOf( pageQuote ) === -1,
								true,
								'The page content (' +
									content +
									') displays the expected content (' +
									pageQuote +
									') when it should be password protected.'
							);
						} );
					} );

					test.describe( 'With incorrect password entered', function() {
						test.it( 'Enter incorrect password', async function() {
							let viewPagePage = new ViewPagePage( driver );
							await viewPagePage.enterPassword( 'password' );
						} );

						test.it( 'Can view page title', async function() {
							let viewPagePage = new ViewPagePage( driver );
							let actualPageTitle = await viewPagePage.pageTitle();
							assert.equal(
								actualPageTitle.toUpperCase(),
								( 'Protected: ' + pageTitle ).toUpperCase()
							);
						} );

						test.it( 'Can see password field', async function() {
							let viewPagePage = new ViewPagePage( driver );
							let isPasswordProtected = await viewPagePage.isPasswordProtected();
							assert.equal(
								isPasswordProtected,
								true,
								'The page does not appear to be password protected'
							);
						} );

						test.it( "Can't see content when incorrect password is entered", async function() {
							let viewPagePage = new ViewPagePage( driver );
							let content = await viewPagePage.pageContent();
							assert.equal(
								content.indexOf( pageQuote ) === -1,
								true,
								'The page content (' +
									content +
									') displays the expected content (' +
									pageQuote +
									') when it should be password protected.'
							);
						} );
					} );

					test.describe( 'With correct password entered', function() {
						test.it( 'Enter correct password', async function() {
							let viewPagePage = new ViewPagePage( driver );
							await viewPagePage.enterPassword( postPassword );
						} );

						test.it( 'Can view page title', async function() {
							let viewPagePage = new ViewPagePage( driver );
							let actualPageTitle = await viewPagePage.pageTitle();
							assert.equal(
								actualPageTitle.toUpperCase(),
								( 'Protected: ' + pageTitle ).toUpperCase()
							);
						} );

						test.it( "Can't see password field", async function() {
							let viewPagePage = new ViewPagePage( driver );
							let isPasswordProtected = await viewPagePage.isPasswordProtected();
							assert.equal(
								isPasswordProtected,
								false,
								'The page still seems to be password protected'
							);
						} );

						test.it( 'Can see page content', async function() {
							let viewPagePage = new ViewPagePage( driver );
							let content = await viewPagePage.pageContent();
							assert.equal(
								content.indexOf( pageQuote ) > -1,
								true,
								'The page content (' +
									content +
									') does not include the expected content (' +
									pageQuote +
									')'
							);
						} );
					} );
				} );
			} );
		} );
	} );

	test.describe( 'Insert a payment button into a page: @parallel @jetpack', function() {
		this.bailSuite( true );

		const paymentButtonDetails = {
			title: 'Button',
			description: 'Description',
			symbol: '¥',
			price: '980',
			currency: 'JPY',
			allowQuantity: false,
			email: 'test@wordpress.com',
		};

		test.it( 'Delete Cookies and Local Storage', async function() {
			await driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.it( 'Can log in', async function() {
			if ( host === 'WPCOM' ) {
				return await new LoginFlow( driver ).loginAndStartNewPage();
			}
			const jetpackUrl = `jetpackpro${ host.toLowerCase() }.mystagingwebsite.com`;
			await new LoginFlow( driver, 'jetpackUserPREMIUM' ).loginAndStartNewPage( jetpackUrl );
		} );

		test.it( 'Can insert the payment button', async function() {
			const pageTitle = 'Payment Button Page: ' + dataHelper.randomPhrase();

			const editorPage = new EditorPage( driver );
			await editorPage.enterTitle( pageTitle );
			await editorPage.insertPaymentButton( null, paymentButtonDetails );

			let errorShown = await editorPage.errorDisplayed();
			return assert.equal( errorShown, false, 'There is an error shown on the editor page!' );
		} );

		test.it( 'Can see the payment button inserted into the visual editor', async function() {
			return await new EditorPage( driver ).ensurePaymentButtonDisplayedInPost();
		} );

		test.it( 'Can publish and view content', async function() {
			const postEditorToolbarComponent = new PostEditorToolbarComponent( driver );
			await postEditorToolbarComponent.ensureSaved();
			await postEditorToolbarComponent.publishAndViewContent( { useConfirmStep: true } );
		} );

		test.it( 'Can see the payment button in our published page', async function() {
			const viewPagePage = new ViewPagePage( driver );
			let displayed = await viewPagePage.paymentButtonDisplayed();
			assert.equal( displayed, true, 'The published page does not contain the payment button' );
		} );

		test.it(
			'The payment button in our published page opens a new Paypal window for payment',
			async function() {
				let numberOfOpenBrowserWindows = await driverHelper.numberOfOpenWindows( driver );
				assert.equal(
					numberOfOpenBrowserWindows,
					1,
					'There is more than one open browser window before clicking payment button'
				);
				let viewPagePage = new ViewPagePage( driver );
				await viewPagePage.clickPaymentButton();
				await driverHelper.waitForNumberOfWindows( driver, 2 );
				await driverHelper.switchToWindowByIndex( driver, 1 );
				const paypalCheckoutPage = new PaypalCheckoutPage( driver );
				const amountDisplayed = await paypalCheckoutPage.priceDisplayed();
				assert.equal(
					amountDisplayed,
					`${ paymentButtonDetails.symbol }${ paymentButtonDetails.price } ${
						paymentButtonDetails.currency
					}`,
					"The amount displayed on Paypal isn't correct"
				);
				await driverHelper.closeCurrentWindow( driver );
				await driverHelper.switchToWindowByIndex( driver, 0 );
				viewPagePage = new ViewPagePage( driver );
				assert( await viewPagePage.displayed(), 'view page page is not displayed' );
			}
		);

		test.after( async function() {
			await driverHelper.ensurePopupsClosed( driver );
		} );
	} );
} );
