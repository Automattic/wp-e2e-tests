/** @format */

import assert from 'assert';
import config from 'config';

import LoginFlow from '../lib/flows/login-flow.js';

import EditorPage from '../lib/pages/editor-page.js';
import ViewPostPage from '../lib/pages/view-post-page.js';
import NotFoundPage from '../lib/pages/not-found-page.js';
import PostsPage from '../lib/pages/posts-page.js';
import ReaderPage from '../lib/pages/reader-page';
import ActivityPage from '../lib/pages/stats/activity-page';
import PaypalCheckoutPage from '../lib/pages/external/paypal-checkout-page';

import SidebarComponent from '../lib/components/sidebar-component.js';
import NavBarComponent from '../lib/components/nav-bar-component.js';
import GutenbergPreviewComponent from '../lib/gutenberg/gutenberg-preview-component';
import PostEditorSidebarComponent from '../lib/components/post-editor-sidebar-component.js';
import PostEditorToolbarComponent from '../lib/components/post-editor-toolbar-component';
import GutenbergEditorHeaderComponent from '../lib/gutenberg/gutenberg-editor-header-component';
import GutenbergEditorComponent from '../lib/gutenberg/gutenberg-editor-component';
import WPAdminPostsPage from '../lib/pages/wp-admin/wp-admin-posts-page';
import GutenbergEditorSidebarComponent from '../lib/gutenberg/gutenberg-editor-sidebar-component';

import * as driverManager from '../lib/driver-manager';
import * as driverHelper from '../lib/driver-helper';
import * as mediaHelper from '../lib/media-helper';
import * as dataHelper from '../lib/data-helper';
import * as SlackNotifier from '../lib/slack-notifier';

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

	describe( 'Public Posts: Preview and Publish a Public Post @parallel', function() {
		let fileDetails;
		const blogPostTitle = dataHelper.randomPhrase();
		const blogPostQuote =
			'The foolish man seeks happiness in the distance. The wise grows it under his feet.\n— James Oppenheim';
		const newCategoryName = 'Category ' + new Date().getTime().toString();
		const newTagName = 'Tag ' + new Date().getTime().toString();

		// Create image file for upload
		before( async function() {
			fileDetails = await mediaHelper.createFile();
			return fileDetails;
		} );

		step( 'Can log in', async function() {
			this.loginFlow = new LoginFlow( driver, 'gutenbergSimpleSiteUser' );
			return await this.loginFlow.loginAndStartNewPost( null, true );
		} );

		step( 'Can enter post title, content and image', async function() {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.removeNUXNotice();
			await gEditorComponent.enterTitle( blogPostTitle );
			await gEditorComponent.enterText( blogPostQuote );
			await gEditorComponent.addBlock( 'Image' );

			await gEditorComponent.enterImage( fileDetails );

			let errorShown = await gEditorComponent.errorDisplayed();
			return assert.strictEqual(
				errorShown,
				false,
				'There is an error shown on the Gutenberg editor page!'
			);
		} );

		step( 'Expand Categories and Tags', async function() {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.openSidebar();
			const gEditorSidebarComponent = await GutenbergEditorSidebarComponent.Expect( driver );
			await gEditorSidebarComponent.selectDocumentTab();
			await gEditorSidebarComponent.collapseStatusAndVisibility(); // Status and visibility starts opened
			await gEditorSidebarComponent.expandCategories();
			await gEditorSidebarComponent.expandTags();
		} );

		step( 'Can add a new category', async function() {
			const gEditorSidebarComponent = await GutenbergEditorSidebarComponent.Expect( driver );
			await gEditorSidebarComponent.addNewCategory( newCategoryName );
		} );

		step( 'Can add a new tag', async function() {
			const gEditorSidebarComponent = await GutenbergEditorSidebarComponent.Expect( driver );
			await gEditorSidebarComponent.addNewTag( newTagName );
		} );

		step( 'Close categories and tags', async function() {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			const gEditorSidebarComponent = await GutenbergEditorSidebarComponent.Expect( driver );
			await gEditorSidebarComponent.selectDocumentTab();
			await gEditorSidebarComponent.collapseCategories();
			await gEditorSidebarComponent.collapseTags();
			await gEditorComponent.closeSidebar();
		} );

		step( 'Can launch post preview', async function() {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.ensureSaved();
			await gEditorComponent.launchPreview();
			await driverHelper.waitForNumberOfWindows( driver, 2 );
			await driverHelper.switchToWindowByIndex( driver, 1 );
		} );

		step( 'Can see correct post title in preview', async function() {
			const gPreviewComponent = await GutenbergPreviewComponent.Expect( driver );
			let postTitle = await gPreviewComponent.postTitle();
			assert.strictEqual(
				postTitle.toLowerCase(),
				blogPostTitle.toLowerCase(),
				'The blog post preview title is not correct'
			);
		} );

		step( 'Can see correct post content in preview', async function() {
			const gPreviewComponent = await GutenbergPreviewComponent.Expect( driver );
			let content = await gPreviewComponent.postContent();
			assert.strictEqual(
				content.indexOf( blogPostQuote ) > -1,
				true,
				'The post preview content (' +
					content +
					') does not include the expected content (' +
					blogPostQuote +
					')'
			);
		} );

		step( 'Can see the post category in preview', async function() {
			const gPreviewComponent = await GutenbergPreviewComponent.Expect( driver );
			let categoryDisplayed = await gPreviewComponent.categoryDisplayed();
			assert.strictEqual(
				categoryDisplayed.toUpperCase(),
				newCategoryName.toUpperCase(),
				'The category: ' + newCategoryName + ' is not being displayed on the post'
			);
		} );

		step( 'Can see the image in preview', async function() {
			const gPreviewComponent = await GutenbergPreviewComponent.Expect( driver );
			let imageDisplayed = await gPreviewComponent.imageDisplayed( fileDetails );
			assert.strictEqual( imageDisplayed, true, 'Could not see the image in the web preview' );
		} );

		step( 'Can close preview', async function() {
			await driverHelper.closeCurrentWindow( driver );
			return await driverHelper.switchToWindowByIndex( driver, 0 );
		} );

		step( 'Can publish and view content', async function() {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.publish( { visit: true } );
		} );

		step( 'Can see correct post title', async function() {
			const viewPostPage = await ViewPostPage.Expect( driver );
			let postTitle = await viewPostPage.postTitle();
			assert.strictEqual(
				postTitle.toLowerCase(),
				blogPostTitle.toLowerCase(),
				'The published blog post title is not correct'
			);
		} );

		step( 'Can see correct post content', async function() {
			const viewPostPage = await ViewPostPage.Expect( driver );
			let content = await viewPostPage.postContent();
			assert.strictEqual(
				content.indexOf( blogPostQuote ) > -1,
				true,
				'The post content (' +
					content +
					') does not include the expected content (' +
					blogPostQuote +
					')'
			);
		} );

		step( 'Can see correct post category', async function() {
			const viewPostPage = await ViewPostPage.Expect( driver );
			let categoryDisplayed = await viewPostPage.categoryDisplayed();
			assert.strictEqual(
				categoryDisplayed.toUpperCase(),
				newCategoryName.toUpperCase(),
				'The category: ' + newCategoryName + ' is not being displayed on the post'
			);
		} );

		step( 'Can see the image published', async function() {
			const viewPostPage = await ViewPostPage.Expect( driver );
			let imageDisplayed = await viewPostPage.imageDisplayed( fileDetails );
			assert.strictEqual( imageDisplayed, true, 'Could not see the image in the published post' );
		} );

		step( 'Can see correct post tag', async function() {
			await SlackNotifier.warn(
				'The Gutenberg assertion of tagged content is disabled due to inconsistencies which need investigating',
				{ suppressDuplicateMessages: true }
			);
			return this.skip();
			// const viewPostPage = await ViewPostPage.Expect( driver );
			// let tagDisplayed = await viewPostPage.tagDisplayed();
			// assert.strictEqual(
			// 	tagDisplayed.toUpperCase(),
			// 	newTagName.toUpperCase(),
			// 	'The tag: ' + newTagName + ' is not being displayed on the post'
			// );
		} );

		after( async function() {
			if ( fileDetails ) {
				await mediaHelper.deleteFile( fileDetails );
			}
			await driverHelper.dismissAlertIfPresent();
		} );
	} );

	describe( 'Basic Public Post @canary @parallel', function() {
		describe( 'Publish a New Post', function() {
			const blogPostTitle = dataHelper.randomPhrase();
			const blogPostQuote =
				'“Whenever you find yourself on the side of the majority, it is time to pause and reflect.”\n- Mark Twain';

			step( 'Can log in', async function() {
				this.loginFlow = new LoginFlow( driver, 'gutenbergSimpleSiteUser' );
				return await this.loginFlow.loginAndStartNewPost( null, true );
			} );

			step( 'Can enter post title and text content', async function() {
				const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
				await gEditorComponent.removeNUXNotice();
				await gEditorComponent.enterTitle( blogPostTitle );
				await gEditorComponent.enterText( blogPostQuote );

				const errorShown = await gEditorComponent.errorDisplayed();
				return assert.strictEqual(
					errorShown,
					false,
					'There is an error shown on the Gutenberg editor page!'
				);
			} );

			step( 'Can publish and view content', async function() {
				const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
				await gEditorComponent.publish( { visit: true } );
			} );

			step( 'Can see correct post title', async function() {
				const viewPostPage = await ViewPostPage.Expect( driver );
				let postTitle = await viewPostPage.postTitle();
				assert.strictEqual(
					postTitle.toLowerCase(),
					blogPostTitle.toLowerCase(),
					'The published blog post title is not correct'
				);
			} );
		} );
	} );

	describe( 'Check Activity Log for Public Post @parallel', function() {
		const blogPostTitle = dataHelper.randomPhrase();
		const blogPostQuote =
			'“We are what we pretend to be, so we must be careful about what we pretend to be.”\n- Kurt Vonnegut';

		step( 'Can log in', async function() {
			let loginFlow = new LoginFlow( driver, 'gutenbergSimpleSiteUser' );
			return await loginFlow.loginAndStartNewPost( null, true );
		} );

		step( 'Can enter post title and content', async function() {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.removeNUXNotice();
			await gEditorComponent.enterTitle( blogPostTitle );
			await gEditorComponent.enterText( blogPostQuote );

			let errorShown = await gEditorComponent.errorDisplayed();
			return assert.strictEqual( errorShown, false, 'There is an error shown on the editor page!' );
		} );

		step( 'Can publish and view content', async function() {
			const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
			await gEditorComponent.publish( { visit: true } );
		} );

		step( 'Can see the post in the Activity log', async function() {
			await ReaderPage.Visit( driver );
			const navBarComponent = await NavBarComponent.Expect( driver );
			await navBarComponent.clickMySites();
			let sidebarComponent = await SidebarComponent.Expect( driver );
			await sidebarComponent.ensureSidebarMenuVisible();

			if ( host !== 'WPCOM' ) {
				await sidebarComponent.selectSite( dataHelper.getJetpackSiteName() );
			}

			await sidebarComponent.selectActivity();
			const activityPage = await ActivityPage.Expect( driver );
			let displayed = await activityPage.postTitleDisplayed( blogPostTitle );
			return assert(
				displayed,
				`The published post title '${ blogPostTitle }' was not displayed in activity log after publishing`
			);
		} );
	} );

	describe.only( 'Schedule Basic Public Post @parallel', function() {
		describe( 'Schedule (and remove) a New Post', function() {
			const blogPostTitle = dataHelper.randomPhrase();
			const blogPostQuote = '“Worries shared are worries halved.”\n- Unknown';

			step( 'Can log in', async function() {
				this.loginFlow = new LoginFlow( driver, 'gutenbergSimpleSiteUser' );
				return await this.loginFlow.loginAndStartNewPost( null, true );
			} );

			step( 'Can enter post title and content', async function() {
				const gHeaderComponent = await GutenbergEditorHeaderComponent.Expect( driver );
				await gHeaderComponent.removeNUXNotice();
				await gHeaderComponent.enterTitle( blogPostTitle );
				await gHeaderComponent.enterText( blogPostQuote );

				let errorShown = await gHeaderComponent.errorDisplayed();
				return assert.strictEqual(
					errorShown,
					false,
					'There is an error shown on the editor page!'
				);
			} );

			step(
				'Can schedule content for a future date and see correct publish date',
				async function() {
					let gSidebarComponent = await GutenbergEditorSidebarComponent.Expect( driver );
					await gSidebarComponent.displayComponentIfNecessary();
					await gSidebarComponent.chooseDocumentSetttings();
					let publishDate = await gSidebarComponent.scheduleFuturePost();

					let gHeaderComponent = await GutenbergEditorHeaderComponent.Expect( driver );
					return await gHeaderComponent.schedulePost( publishDate );
				}
			);

			step( 'Remove scheduled post', async function() {
				let gHeaderComponent = await GutenbergEditorHeaderComponent.Expect( driver );
				await gHeaderComponent.closeScheduledPanel();
				let gSidebarComponent = await GutenbergEditorSidebarComponent.Expect( driver );
				await gSidebarComponent.trashPost();

				const wpAdminPostsPage = await WPAdminPostsPage.Expect( driver );
				const displayed = await wpAdminPostsPage.trashedSuccessNoticeDisplayed();
				return assert.strictEqual(
					displayed,
					true,
					'The Posts page success notice for deleting the post is not displayed'
				);
			} );
		} );
	} );

	xdescribe( 'Private Posts: @parallel', function() {
		describe( 'Publish a Private Post', function() {
			const blogPostTitle = dataHelper.randomPhrase();
			const blogPostQuote =
				'If you’re not prepared to be wrong; you’ll never come up with anything original.\n— Sir Ken Robinson\n';

			step( 'Can log in', async function() {
				let loginFlow = new LoginFlow( driver, 'gutenbergSimpleSiteUser' );
				await loginFlow.loginAndStartNewPost();
			} );

			step( 'Can enter post title and content', async function() {
				let editorPage = await EditorPage.Expect( driver );
				await editorPage.enterTitle( blogPostTitle );
				await editorPage.enterContent( blogPostQuote );
			} );

			step( 'Can disable sharing buttons', async function() {
				let postEditorSidebarComponent = await PostEditorSidebarComponent.Expect( driver );
				await postEditorSidebarComponent.expandSharingSection();
				await postEditorSidebarComponent.setSharingButtons( false );
				await postEditorSidebarComponent.closeSharingSection();
			} );

			step( 'Can allow comments', async function() {
				let postEditorSidebarComponent = await PostEditorSidebarComponent.Expect( driver );
				await postEditorSidebarComponent.expandMoreOptions();
				await postEditorSidebarComponent.setCommentsForPost( true );
			} );

			describe( 'Set to private which publishes it', function() {
				step( 'Ensure the post is saved', async function() {
					await EditorPage.Expect( driver );
					const postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
					await postEditorToolbarComponent.ensureSaved();
				} );

				step( 'Can set visibility to private which immediately publishes it', async function() {
					const postEditorSidebarComponent = await PostEditorSidebarComponent.Expect( driver );
					await postEditorSidebarComponent.setVisibilityToPrivate();
					this.postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
					await this.postEditorToolbarComponent.waitForSuccessViewPostNotice();
					await this.postEditorToolbarComponent.viewPublishedPostOrPage();
				} );

				if ( host === 'WPCOM' ) {
					describe( 'As a logged in user ', function() {
						step( 'Can see correct post title', async function() {
							let viewPostPage = await ViewPostPage.Expect( driver );
							let postTitle = await viewPostPage.postTitle();
							assert.strictEqual(
								postTitle.toLowerCase(),
								'private: ' + blogPostTitle.toLowerCase(),
								'The published blog post title is not correct'
							);
						} );

						step( 'Can see correct post content', async function() {
							let viewPostPage = await ViewPostPage.Expect( driver );
							let content = await viewPostPage.postContent();
							assert.strictEqual(
								content.indexOf( blogPostQuote ) > -1,
								true,
								'The post content (' +
									content +
									') does not include the expected content (' +
									blogPostQuote +
									')'
							);
						} );

						step( 'Can see comments enabled', async function() {
							let viewPostPage = await ViewPostPage.Expect( driver );
							let visible = await viewPostPage.commentsVisible();
							assert.strictEqual(
								visible,
								true,
								'Comments are not shown even though they were enabled when creating the post.'
							);
						} );

						step( "Can't see sharing buttons", async function() {
							let viewPostPage = await ViewPostPage.Expect( driver );
							let visible = await viewPostPage.sharingButtonsVisible();
							assert.strictEqual(
								visible,
								false,
								'Sharing buttons are shown even though they were disabled when creating the post.'
							);
						} );

						describe( 'As a non-logged in user ', function() {
							before( async function() {
								await driverManager.clearCookiesAndDeleteLocalStorage( driver );
								await driver.navigate().refresh();
							} );

							step( "Can't see post at all", async function() {
								let notFoundPage = await NotFoundPage.Expect( driver );
								let displayed = await notFoundPage.displayed();
								assert.strictEqual(
									displayed,
									true,
									'Could not see the not found (404) page. Check that it is displayed'
								);
							} );
						} );
					} );
				} else {
					// Jetpack tests
					describe( 'As a non-logged in user ', function() {
						step( "Can't see post at all", async function() {
							let notFoundPage = await NotFoundPage.Expect( driver );
							let displayed = await notFoundPage.displayed();
							assert.strictEqual(
								displayed,
								true,
								'Could not see the not found (404) page. Check that it is displayed'
							);
						} );
					} );
					//TODO: Log in via SSO and verify content
				}
			} );
		} );
	} );

	xdescribe( 'Password Protected Posts: @parallel', function() {
		describe( 'Publish a Password Protected Post', function() {
			let blogPostTitle = dataHelper.randomPhrase();
			let blogPostQuote =
				'The best thing about the future is that it comes only one day at a time.\n— Abraham Lincoln\n';
			let postPassword = 'e2e' + new Date().getTime().toString();

			step( 'Can log in', async function() {
				let loginFlow = new LoginFlow( driver, 'gutenbergSimpleSiteUser' );
				await loginFlow.loginAndStartNewPost();
			} );

			step( 'Can enter post title and content and set to password protected', async function() {
				this.editorPage = await EditorPage.Expect( driver );
				await this.editorPage.enterTitle( blogPostTitle );
				this.postEditorSidebarComponent = await PostEditorSidebarComponent.Expect( driver );
				await this.postEditorSidebarComponent.setVisibilityToPasswordProtected( postPassword );
				this.editorPage = await EditorPage.Expect( driver );
				await this.editorPage.enterContent( blogPostQuote );
				this.postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
				await this.postEditorToolbarComponent.ensureSaved();
			} );

			step( 'Can enable sharing buttons', async function() {
				let postEditorSidebarComponent = await PostEditorSidebarComponent.Expect( driver );
				await postEditorSidebarComponent.expandSharingSection();
				await postEditorSidebarComponent.setSharingButtons( true );
				await postEditorSidebarComponent.closeSharingSection();
			} );

			step( 'Can disallow comments', async function() {
				let postEditorSidebarComponent = await PostEditorSidebarComponent.Expect( driver );
				await postEditorSidebarComponent.expandMoreOptions();
				await postEditorSidebarComponent.setCommentsForPost( false );
				await postEditorSidebarComponent.closeMoreOptions();
			} );

			describe( 'Publish and View', function() {
				// Can publish and view content
				before( async function() {
					const postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
					await postEditorToolbarComponent.publishAndViewContent( { useConfirmStep: true } );
				} );

				describe( 'As a logged in user', function() {
					describe( 'With no password entered', function() {
						step( 'Can view post title', async function() {
							let viewPostPage = await ViewPostPage.Expect( driver );
							let postTitle = await viewPostPage.postTitle();
							assert.strictEqual(
								postTitle.toLowerCase(),
								( 'Protected: ' + blogPostTitle ).toLowerCase()
							);
						} );

						step( 'Can see password field', async function() {
							let viewPostPage = await ViewPostPage.Expect( driver );
							let isPasswordProtected = await viewPostPage.isPasswordProtected();
							assert.strictEqual(
								isPasswordProtected,
								true,
								'The blog post does not appear to be password protected'
							);
						} );

						step( "Can't see content when no password is entered", async function() {
							let viewPostPage = await ViewPostPage.Expect( driver );
							let content = await viewPostPage.postContent();
							assert.strictEqual(
								content.indexOf( blogPostQuote ) === -1,
								true,
								'The post content (' +
									content +
									') displays the expected content (' +
									blogPostQuote +
									') when it should be password protected.'
							);
						} );

						step( "Can't see comments", async function() {
							let viewPostPage = await ViewPostPage.Expect( driver );
							let visible = await viewPostPage.commentsVisible();
							assert.strictEqual(
								visible,
								false,
								'Comments are shown even though they were disabled when creating the post.'
							);
						} );

						step( 'Can see sharing buttons', async function() {
							let viewPostPage = await ViewPostPage.Expect( driver );
							let visible = await viewPostPage.sharingButtonsVisible();
							return assert.strictEqual(
								visible,
								true,
								'Sharing buttons are not shown even though they were enabled when creating the post.'
							);
						} );
					} );

					describe( 'With incorrect password entered', function() {
						// Enter incorrect password
						before( async function() {
							let viewPostPage = await ViewPostPage.Expect( driver );
							await viewPostPage.displayed();
							await viewPostPage.enterPassword( 'password' );
						} );

						step( 'Can view post title', async function() {
							let viewPostPage = await ViewPostPage.Expect( driver );
							let postTitle = await viewPostPage.postTitle();
							assert.strictEqual(
								postTitle.toLowerCase(),
								( 'Protected: ' + blogPostTitle ).toLowerCase()
							);
						} );

						step( 'Can see password field', async function() {
							let viewPostPage = await ViewPostPage.Expect( driver );
							let isPasswordProtected = await viewPostPage.isPasswordProtected();
							assert.strictEqual(
								isPasswordProtected,
								true,
								'The blog post does not appear to be password protected'
							);
						} );

						step( "Can't see content when incorrect password is entered", async function() {
							let viewPostPage = await ViewPostPage.Expect( driver );
							let content = await viewPostPage.postContent();
							assert.strictEqual(
								content.indexOf( blogPostQuote ) === -1,
								true,
								'The post content (' +
									content +
									') displays the expected content (' +
									blogPostQuote +
									') when it should be password protected.'
							);
						} );

						step( "Can't see comments", async function() {
							let viewPostPage = await ViewPostPage.Expect( driver );
							let visible = await viewPostPage.commentsVisible();
							assert.strictEqual(
								visible,
								false,
								'Comments are shown even though they were disabled when creating the post.'
							);
						} );

						step( 'Can see sharing buttons', async function() {
							let viewPostPage = await ViewPostPage.Expect( driver );
							let visible = await viewPostPage.sharingButtonsVisible();
							assert.strictEqual(
								visible,
								true,
								'Sharing buttons are not shown even though they were enabled when creating the post.'
							);
						} );
					} );

					describe( 'With correct password entered', function() {
						// Enter correct password
						before( async function() {
							let viewPostPage = await ViewPostPage.Expect( driver );
							await viewPostPage.displayed();
							await viewPostPage.enterPassword( postPassword );
						} );

						step( 'Can view post title', async function() {
							let viewPostPage = await ViewPostPage.Expect( driver );
							let postTitle = await viewPostPage.postTitle();
							assert.strictEqual(
								postTitle.toLowerCase(),
								( 'Protected: ' + blogPostTitle ).toLowerCase()
							);
						} );

						step( "Can't see password field", async function() {
							let viewPostPage = await ViewPostPage.Expect( driver );
							let isPasswordProtected = await viewPostPage.isPasswordProtected();
							assert.strictEqual(
								isPasswordProtected,
								false,
								'The blog post still appears to be password protected'
							);
						} );

						step( 'Can see page content', async function() {
							let viewPostPage = await ViewPostPage.Expect( driver );
							let content = await viewPostPage.postContent();
							assert.strictEqual(
								content.indexOf( blogPostQuote ) > -1,
								true,
								'The post content (' +
									content +
									') does not include the expected content (' +
									blogPostQuote +
									')'
							);
						} );

						step( "Can't see comments", async function() {
							let viewPostPage = await ViewPostPage.Expect( driver );
							let visible = await viewPostPage.commentsVisible();
							assert.strictEqual(
								visible,
								false,
								'Comments are shown even though they were disabled when creating the post.'
							);
						} );

						step( 'Can see sharing buttons', async function() {
							let viewPostPage = await ViewPostPage.Expect( driver );
							let visible = await viewPostPage.sharingButtonsVisible();
							assert.strictEqual(
								visible,
								true,
								'Sharing buttons are not shown even though they were enabled when creating the post.'
							);
						} );
					} );
				} );
				describe( 'As a non-logged in user', function() {
					before( async function() {
						await driverManager.clearCookiesAndDeleteLocalStorage( driver );
						await driver.navigate().refresh();
					} );
					describe( 'With no password entered', function() {
						step( 'Can view post title', async function() {
							let viewPostPage = await ViewPostPage.Expect( driver );
							let postTitle = await viewPostPage.postTitle();
							assert.strictEqual(
								postTitle.toLowerCase(),
								( 'Protected: ' + blogPostTitle ).toLowerCase()
							);
						} );

						step( 'Can see password field', async function() {
							let viewPostPage = await ViewPostPage.Expect( driver );
							let isPasswordProtected = await viewPostPage.isPasswordProtected();
							assert.strictEqual(
								isPasswordProtected,
								true,
								'The blog post does not appear to be password protected'
							);
						} );

						step( "Can't see content when no password is entered", async function() {
							let viewPostPage = await ViewPostPage.Expect( driver );
							let content = await viewPostPage.postContent();
							assert.strictEqual(
								content.indexOf( blogPostQuote ) === -1,
								true,
								'The post content (' +
									content +
									') displays the expected content (' +
									blogPostQuote +
									') when it should be password protected.'
							);
						} );

						step( "Can't see comments", async function() {
							let viewPostPage = await ViewPostPage.Expect( driver );
							let visible = await viewPostPage.commentsVisible();
							assert.strictEqual(
								visible,
								false,
								'Comments are shown even though they were disabled when creating the post.'
							);
						} );

						step( 'Can see sharing buttons', async function() {
							let viewPostPage = await ViewPostPage.Expect( driver );
							let visible = await viewPostPage.sharingButtonsVisible();
							return assert.strictEqual(
								visible,
								true,
								'Sharing buttons are not shown even though they were enabled when creating the post.'
							);
						} );
					} );

					describe( 'With incorrect password entered', function() {
						// Enter incorrect password
						before( async function() {
							let viewPostPage = await ViewPostPage.Expect( driver );
							await viewPostPage.displayed();
							await viewPostPage.enterPassword( 'password' );
						} );

						step( 'Can view post title', async function() {
							let viewPostPage = await ViewPostPage.Expect( driver );
							let postTitle = await viewPostPage.postTitle();
							assert.strictEqual(
								postTitle.toLowerCase(),
								( 'Protected: ' + blogPostTitle ).toLowerCase()
							);
						} );

						step( 'Can see password field', async function() {
							let viewPostPage = await ViewPostPage.Expect( driver );
							let isPasswordProtected = await viewPostPage.isPasswordProtected();
							assert.strictEqual(
								isPasswordProtected,
								true,
								'The blog post does not appear to be password protected'
							);
						} );

						step( "Can't see content when incorrect password is entered", async function() {
							let viewPostPage = await ViewPostPage.Expect( driver );
							let content = await viewPostPage.postContent();
							assert.strictEqual(
								content.indexOf( blogPostQuote ) === -1,
								true,
								'The post content (' +
									content +
									') displays the expected content (' +
									blogPostQuote +
									') when it should be password protected.'
							);
						} );

						step( "Can't see comments", async function() {
							let viewPostPage = await ViewPostPage.Expect( driver );
							let visible = await viewPostPage.commentsVisible();
							assert.strictEqual(
								visible,
								false,
								'Comments are shown even though they were disabled when creating the post.'
							);
						} );

						step( 'Can see sharing buttons', async function() {
							let viewPostPage = await ViewPostPage.Expect( driver );
							let visible = await viewPostPage.sharingButtonsVisible();
							assert.strictEqual(
								visible,
								true,
								'Sharing buttons are not shown even though they were enabled when creating the post.'
							);
						} );
					} );

					describe( 'With correct password entered', function() {
						// Enter correct password
						before( async function() {
							let viewPostPage = await ViewPostPage.Expect( driver );
							await viewPostPage.displayed();
							await viewPostPage.enterPassword( postPassword );
						} );

						step( 'Can view post title', async function() {
							let viewPostPage = await ViewPostPage.Expect( driver );
							let postTitle = await viewPostPage.postTitle();
							assert.strictEqual(
								postTitle.toLowerCase(),
								( 'Protected: ' + blogPostTitle ).toLowerCase()
							);
						} );

						step( "Can't see password field", async function() {
							let viewPostPage = await ViewPostPage.Expect( driver );
							let isPasswordProtected = await viewPostPage.isPasswordProtected();
							assert.strictEqual(
								isPasswordProtected,
								false,
								'The blog post still appears to be password protected'
							);
						} );

						step( 'Can see page content', async function() {
							let viewPostPage = await ViewPostPage.Expect( driver );
							let content = await viewPostPage.postContent();
							assert.strictEqual(
								content.indexOf( blogPostQuote ) > -1,
								true,
								'The post content (' +
									content +
									') does not include the expected content (' +
									blogPostQuote +
									')'
							);
						} );

						step( "Can't see comments", async function() {
							let viewPostPage = await ViewPostPage.Expect( driver );
							let visible = await viewPostPage.commentsVisible();
							assert.strictEqual(
								visible,
								false,
								'Comments are shown even though they were disabled when creating the post.'
							);
						} );

						step( 'Can see sharing buttons', async function() {
							let viewPostPage = await ViewPostPage.Expect( driver );
							let visible = await viewPostPage.sharingButtonsVisible();
							assert.strictEqual(
								visible,
								true,
								'Sharing buttons are not shown even though they were enabled when creating the post.'
							);
						} );
					} );
				} );
			} );
		} );
	} );

	describe( 'Trash Post: @parallel', function() {
		describe( 'Trash a New Post', function() {
			const blogPostTitle = dataHelper.randomPhrase();
			const blogPostQuote =
				'The only victory that counts is the victory over yourself.\n— Jesse Owens\n';

			step( 'Can log in', async function() {
				const loginFlow = new LoginFlow( driver, 'gutenbergSimpleSiteUser' );
				return await loginFlow.loginAndStartNewPost( null, true );
			} );

			step( 'Can enter post title and content', async function() {
				const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
				await gEditorComponent.removeNUXNotice();
				await gEditorComponent.enterTitle( blogPostTitle );
				return await gEditorComponent.enterText( blogPostQuote );
			} );

			step( 'Can trash the new post', async function() {
				const gSidebarComponent = await GutenbergEditorSidebarComponent.Expect( driver );
				await gSidebarComponent.chooseDocumentSetttings();
				return await gSidebarComponent.trashPost();
			} );

			step( 'Can then see the Posts page with a confirmation message', async function() {
				const wpAdminPostsPage = await WPAdminPostsPage.Expect( driver );
				const displayed = await wpAdminPostsPage.trashedSuccessNoticeDisplayed();
				return assert.strictEqual(
					displayed,
					true,
					'The Posts page success notice for deleting the post is not displayed'
				);
			} );
		} );
	} );

	describe( 'Edit a Post: @parallel', function() {
		describe( 'Publish a New Post', function() {
			const originalBlogPostTitle = dataHelper.randomPhrase();
			const updatedBlogPostTitle = dataHelper.randomPhrase();
			const blogPostQuote =
				'Science is organised knowledge. Wisdom is organised life..\n~ Immanuel Kant\n';

			step( 'Can log in', async function() {
				const loginFlow = new LoginFlow( driver, 'gutenbergSimpleSiteUser' );
				return await loginFlow.loginAndStartNewPost( null, true );
			} );

			step( 'Can enter post title and content', async function() {
				const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
				await gEditorComponent.removeNUXNotice();
				await gEditorComponent.enterTitle( originalBlogPostTitle );
				await gEditorComponent.enterText( blogPostQuote );
				let errorShown = await gEditorComponent.errorDisplayed();
				return assert.strictEqual(
					errorShown,
					false,
					'There is an error shown on the editor page!'
				);
			} );

			step( 'Can publish the post', async function() {
				const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
				await gEditorComponent.publish( { visit: true } );
			} );

			describe( 'Edit the post via posts', function() {
				step( 'Can view the posts list', async function() {
					await ReaderPage.Visit( driver );
					const navbarComponent = await NavBarComponent.Expect( driver );
					await navbarComponent.clickMySites();
					const jetpackSiteName = dataHelper.getJetpackSiteName();
					const sidebarComponent = await SidebarComponent.Expect( driver );
					if ( host !== 'WPCOM' ) {
						await sidebarComponent.selectSite( jetpackSiteName );
					}
					await sidebarComponent.selectPosts();
					return await PostsPage.Expect( driver );
				} );

				step( 'Can see and edit our new post', async function() {
					const postsPage = await PostsPage.Expect( driver );
					await postsPage.waitForPostTitled( originalBlogPostTitle );
					let displayed = await postsPage.isPostDisplayed( originalBlogPostTitle );
					assert.strictEqual(
						displayed,
						true,
						`The blog post titled '${ originalBlogPostTitle }' is not displayed in the list of posts`
					);
					await postsPage.editPostWithTitle( originalBlogPostTitle );
					return await GutenbergEditorComponent.Expect( driver );
				} );

				step( 'Can see the post title', async function() {
					const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
					let titleShown = await gEditorComponent.titleShown();
					assert.strictEqual(
						titleShown,
						originalBlogPostTitle,
						'The blog post title shown was unexpected'
					);
				} );

				step(
					'Can set the new title and update it, and link to the updated post',
					async function() {
						const gEditorComponent = await GutenbergEditorComponent.Expect( driver );

						await gEditorComponent.enterTitle( updatedBlogPostTitle );
						let errorShown = await gEditorComponent.errorDisplayed();
						assert.strictEqual( errorShown, false, 'There is an error shown on the editor page!' );
						return await gEditorComponent.update( { visit: true } );
					}
				);

				describe( 'Can view the post with the new title', function() {
					step( 'Can view the post', async function() {
						return await ViewPostPage.Expect( driver );
					} );

					step( 'Can see correct post title', async function() {
						const viewPostPage = await ViewPostPage.Expect( driver );
						let postTitle = await viewPostPage.postTitle();
						return assert.strictEqual(
							postTitle.toLowerCase(),
							updatedBlogPostTitle.toLowerCase(),
							'The published blog post title is not correct'
						);
					} );
				} );
			} );
		} );
	} );

	xdescribe( 'Insert a contact form: @parallel', function() {
		describe( 'Publish a New Post with a Contact Form', function() {
			const originalBlogPostTitle = 'Contact Us: ' + dataHelper.randomPhrase();

			step( 'Can log in', async function() {
				this.loginFlow = new LoginFlow( driver, 'gutenbergSimpleSiteUser' );
				return await this.loginFlow.loginAndStartNewPost();
			} );

			step( 'Can insert the contact form', async function() {
				this.editorPage = await EditorPage.Expect( driver );
				await this.editorPage.enterTitle( originalBlogPostTitle );
				await this.editorPage.insertContactForm();

				let errorShown = await this.editorPage.errorDisplayed();
				return assert.strictEqual(
					errorShown,
					false,
					'There is an error shown on the editor page!'
				);
			} );

			step( 'Can see the contact form inserted into the visual editor', async function() {
				this.editorPage = await EditorPage.Expect( driver );
				return await this.editorPage.ensureContactFormDisplayedInPost();
			} );

			step( 'Can publish and view content', async function() {
				const postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
				await postEditorToolbarComponent.ensureSaved();
				await postEditorToolbarComponent.publishAndViewContent( { useConfirmStep: true } );
			} );

			step( 'Can see the contact form in our published post', async function() {
				this.viewPostPage = await ViewPostPage.Expect( driver );
				let displayed = await this.viewPostPage.contactFormDisplayed();
				assert.strictEqual(
					displayed,
					true,
					'The published post does not contain the contact form'
				);
			} );
		} );
	} );

	xdescribe( 'Insert a payment button: @parallel', function() {
		const paymentButtonDetails = {
			title: 'Button',
			description: 'Description',
			symbol: '$',
			price: '1.99',
			currency: 'USD',
			allowQuantity: true,
			email: 'test@wordpress.com',
		};

		step( 'Can log in', async function() {
			if ( host === 'WPCOM' ) {
				return await new LoginFlow( driver, 'gutenbergSimpleSiteUser' ).loginAndStartNewPost();
			}
			const jetpackUrl = `jetpackpro${ host.toLowerCase() }.mystagingwebsite.com`;
			await new LoginFlow( driver, 'jetpackUserPREMIUM' ).loginAndStartNewPost( jetpackUrl );
		} );

		step( 'Can insert the payment button', async function() {
			const blogPostTitle = 'Payment Button: ' + dataHelper.randomPhrase();

			const editorPage = await EditorPage.Expect( driver );
			await editorPage.enterTitle( blogPostTitle );
			await editorPage.insertPaymentButton( paymentButtonDetails );

			let errorShown = await editorPage.errorDisplayed();
			return assert.strictEqual( errorShown, false, 'There is an error shown on the editor page!' );
		} );

		step( 'Can see the payment button inserted into the visual editor', async function() {
			const editorPage = await EditorPage.Expect( driver );
			return await editorPage.ensurePaymentButtonDisplayedInPost();
		} );

		step( 'Can publish and view content', async function() {
			const postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
			await postEditorToolbarComponent.ensureSaved();
			await postEditorToolbarComponent.publishAndViewContent( { useConfirmStep: true } );
		} );

		step( 'Can see the payment button in our published post', async function() {
			const viewPostPage = await ViewPostPage.Expect( driver );
			let displayed = await viewPostPage.paymentButtonDisplayed();
			assert.strictEqual(
				displayed,
				true,
				'The published post does not contain the payment button'
			);
		} );

		step(
			'The payment button in our published post opens a new Paypal window for payment',
			async function() {
				let numberOfOpenBrowserWindows = await driverHelper.numberOfOpenWindows( driver );
				assert.strictEqual(
					numberOfOpenBrowserWindows,
					1,
					'There is more than one open browser window before clicking payment button'
				);
				let viewPostPage = await ViewPostPage.Expect( driver );
				await viewPostPage.clickPaymentButton();
				await driverHelper.waitForNumberOfWindows( driver, 2 );
				await driverHelper.switchToWindowByIndex( driver, 1 );
				const paypalCheckoutPage = await PaypalCheckoutPage.Expect( driver );
				const amountDisplayed = await paypalCheckoutPage.priceDisplayed();
				assert.strictEqual(
					amountDisplayed,
					`${ paymentButtonDetails.symbol }${ paymentButtonDetails.price } ${
						paymentButtonDetails.currency
					}`,
					"The amount displayed on Paypal isn't correct"
				);
				await driverHelper.closeCurrentWindow( driver );
				await driverHelper.switchToWindowByIndex( driver, 0 );
				viewPostPage = await ViewPostPage.Expect( driver );
				assert( await viewPostPage.displayed(), 'view post page is not displayed' );
			}
		);

		after( async function() {
			await driverHelper.ensurePopupsClosed( driver );
		} );
	} );

	describe( 'Revert a post to draft: @parallel', function() {
		describe( 'Publish a new post', function() {
			const originalBlogPostTitle = dataHelper.randomPhrase();
			const blogPostQuote =
				'To really be of help to others we need to be guided by compassion.\n— Dalai Lama\n';

			step( 'Can log in', async function() {
				const loginFlow = new LoginFlow( driver, 'gutenbergSimpleSiteUser' );
				return await loginFlow.loginAndStartNewPost( null, true );
			} );

			step( 'Can enter post title and content', async function() {
				const gHeaderComponent = await GutenbergEditorComponent.Expect( driver );
				await gHeaderComponent.removeNUXNotice();
				await gHeaderComponent.enterTitle( originalBlogPostTitle );
				await gHeaderComponent.enterText( blogPostQuote );

				const errorShown = await gHeaderComponent.errorDisplayed();
				return assert.strictEqual(
					errorShown,
					false,
					'There is an error shown on the Gutenberg editor page!'
				);
			} );

			step( 'Can publish the post', async function() {
				const gHeaderComponent = await GutenbergEditorComponent.Expect( driver );
				await gHeaderComponent.publish();
				return await gHeaderComponent.closePublishedPanel();
			} );
		} );

		describe( 'Revert the post to draft', function() {
			step( 'Can revert the post to draft', async function() {
				const gHeaderComponent = await GutenbergEditorComponent.Expect( driver );
				await gHeaderComponent.revertToDraft();
				let isDraft = await gHeaderComponent.isDraft();
				assert.strictEqual( isDraft, true, 'The post is not set as draft' );
			} );
		} );
	} );
} );
