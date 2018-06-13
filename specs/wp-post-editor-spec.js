/** @format */

import assert from 'assert';
import test from 'selenium-webdriver/testing';
import config from 'config';

import LoginFlow from '../lib/flows/login-flow.js';

import EditorPage from '../lib/pages/editor-page.js';
import TwitterFeedPage from '../lib/pages/twitter-feed-page.js';
import ViewPostPage from '../lib/pages/view-post-page.js';
import NotFoundPage from '../lib/pages/not-found-page.js';
import PostsPage from '../lib/pages/posts-page.js';
import ReaderPage from '../lib/pages/reader-page';
import StatsPage from '../lib/pages/stats-page';
import ActivityPage from '../lib/pages/stats/activity-page';
import PaypalCheckoutPage from '../lib/pages/external/paypal-checkout-page';

import SidebarComponent from '../lib/components/sidebar-component.js';
import NavBarComponent from '../lib/components/nav-bar-component.js';
import PostPreviewComponent from '../lib/components/post-preview-component.js';
import PostEditorSidebarComponent from '../lib/components/post-editor-sidebar-component.js';
import PostEditorToolbarComponent from '../lib/components/post-editor-toolbar-component';
import EditorConfirmationSidebarComponent from '../lib/components/editor-confirmation-sidebar-component';

import * as driverManager from '../lib/driver-manager';
import * as driverHelper from '../lib/driver-helper';
import * as mediaHelper from '../lib/media-helper';
import * as dataHelper from '../lib/data-helper';
import * as eyesHelper from '../lib/eyes-helper.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

let driver;

let eyes = eyesHelper.eyesSetup( true );

test.before( async function() {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

test.describe( `[${ host }] Editor: Posts (${ screenSize })`, function() {
	this.bailSuite( true );
	this.timeout( mochaTimeOut );

	test.describe( 'Public Posts: @parallel @jetpack', function() {
		let fileDetails;

		test.before( async function() {
			await driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		// Create image file for upload
		test.before( async function() {
			fileDetails = await mediaHelper.createFile();
			return fileDetails;
		} );

		test.describe( 'Preview and Publish a Public Post', function() {
			const blogPostTitle = dataHelper.randomPhrase();
			const blogPostQuote =
				'The foolish man seeks happiness in the distance. The wise grows it under his feet.\n— James Oppenheim';
			const newCategoryName = 'Category ' + new Date().getTime().toString();
			const newTagName = 'Tag ' + new Date().getTime().toString();
			const publicizeMessage = dataHelper.randomPhrase();
			const publicizeTwitterAccount = config.has( 'publicizeTwitterAccount' )
				? config.get( 'publicizeTwitterAccount' )
				: '';

			test.it( 'Can log in', async function() {
				let loginFlow = new LoginFlow( driver );
				return await loginFlow.loginAndStartNewPost();
			} );

			test.describe( 'Create, Preview and Post', function() {
				test.it( 'Can enter post title, content and image', async function() {
					let editorPage = await EditorPage.Expect( driver );
					await editorPage.enterTitle( blogPostTitle );
					await editorPage.enterContent( blogPostQuote + '\n' );
					await editorPage.enterPostImage( fileDetails );
					await editorPage.waitUntilImageInserted( fileDetails );
					let errorShown = await editorPage.errorDisplayed();
					assert.equal( errorShown, false, 'There is an error shown on the editor page!' );
				} );

				test.describe( 'Categories and Tags', function() {
					test.it( 'Expand Categories and Tags', async function() {
						let postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
						await postEditorSidebarComponent.expandCategoriesAndTags();
					} );

					test.it( 'Can add a new category', async function() {
						let postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
						await postEditorSidebarComponent.addNewCategory( newCategoryName );
					} );

					test.it( 'Can add a new tag', async function() {
						let postEditorSidebarComponent = await new PostEditorSidebarComponent( driver );
						await postEditorSidebarComponent.addNewTag( newTagName );
					} );

					test.it( 'Close categories and tags', async function() {
						let postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
						await postEditorSidebarComponent.closeCategoriesAndTags();
					} );

					test.it( 'Verify categories and tags present after save', async function() {
						let postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
						const postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
						await postEditorSidebarComponent.hideComponentIfNecessary();
						await postEditorToolbarComponent.ensureSaved();
						await postEditorSidebarComponent.displayComponentIfNecessary();
						let subtitle = await postEditorSidebarComponent.getCategoriesAndTags();
						assert(
							! subtitle.match( /Uncategorized/ ),
							'Post still marked Uncategorized after adding new category AFTER SAVE'
						);
						assert( subtitle.match( `#${ newTagName }` ), `New tag #${ newTagName } not applied` );
					} );

					test.describe( 'Publicize Options', function() {
						test.it( 'Expand sharing section', async function() {
							let postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
							await postEditorSidebarComponent.expandSharingSection();
						} );

						if ( host !== 'CI' && host !== 'JN' ) {
							test.it( 'Can see the publicise to twitter account', async function() {
								let postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
								let accountDisplayed = await postEditorSidebarComponent.publicizeToTwitterAccountDisplayed();
								assert.equal(
									accountDisplayed,
									publicizeTwitterAccount,
									'Could not see see the publicize to twitter account ' +
										publicizeTwitterAccount +
										' in the editor'
								);
							} );

							test.it( 'Can see the default publicise message', async function() {
								let postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
								let messageDisplayed = await postEditorSidebarComponent.publicizeMessageDisplayed();
								assert.equal(
									messageDisplayed,
									blogPostTitle,
									"The publicize message is not defaulting to the post's title"
								);
							} );

							test.it( 'Can set a custom publicise message', async function() {
								let postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
								await postEditorSidebarComponent.setPublicizeMessage( publicizeMessage );
							} );
						}

						test.it( 'Close sharing section', async function() {
							let postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
							await postEditorSidebarComponent.closeSharingSection();
						} );

						test.describe( 'Preview (https only)', function() {
							test.it( 'Can launch post preview', async function() {
								let postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
								await postEditorSidebarComponent.hideComponentIfNecessary();

								this.postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
								await this.postEditorToolbarComponent.ensureSaved();
								await this.postEditorToolbarComponent.launchPreview();
								this.postPreviewComponent = new PostPreviewComponent( driver );
								await this.postPreviewComponent.displayed();
							} );

							test.it( 'Can see correct post title in preview', async function() {
								let postTitle = await this.postPreviewComponent.postTitle();
								assert.equal(
									postTitle.toLowerCase(),
									blogPostTitle.toLowerCase(),
									'The blog post preview title is not correct'
								);
							} );

							test.it( 'Can see correct post content in preview', async function() {
								let content = await this.postPreviewComponent.postContent();
								assert.equal(
									content.indexOf( blogPostQuote ) > -1,
									true,
									'The post preview content (' +
										content +
										') does not include the expected content (' +
										blogPostQuote +
										')'
								);
							} );

							test.it( 'Can see the post category in preview', async function() {
								let categoryDisplayed = await this.postPreviewComponent.categoryDisplayed();
								assert.equal(
									categoryDisplayed.toUpperCase(),
									newCategoryName.toUpperCase(),
									'The category: ' + newCategoryName + ' is not being displayed on the post'
								);
							} );

							test.it( 'Can see the post tag in preview', async function() {
								let tagDisplayed = await this.postPreviewComponent.tagDisplayed();
								assert.equal(
									tagDisplayed.toUpperCase(),
									newTagName.toUpperCase(),
									'The tag: ' + newTagName + ' is not being displayed on the post'
								);
							} );

							test.it( 'Can see the image in preview', async function() {
								let imageDisplayed = await this.postPreviewComponent.imageDisplayed( fileDetails );
								assert.equal( imageDisplayed, true, 'Could not see the image in the web preview' );
							} );

							test.it( 'Can close post preview', async function() {
								await this.postPreviewComponent.close();
							} );

							test.describe( 'Publish and Preview Published Content', function() {
								test.it( 'Can publish and view content', async function() {
									const postEditorToolbarComponent = await PostEditorToolbarComponent.Expect(
										driver
									);
									await postEditorToolbarComponent.publishThePost( { useConfirmStep: true } );
								} );

								test.it( 'Can see correct post title in preview', async function() {
									this.postPreviewComponent = new PostPreviewComponent( driver );
									let postTitle = await this.postPreviewComponent.postTitle();
									assert.equal(
										postTitle.toLowerCase(),
										blogPostTitle.toLowerCase(),
										'The blog post preview title is not correct'
									);
								} );

								test.it( 'Can see correct post content in preview', async function() {
									let content = await this.postPreviewComponent.postContent();
									assert.equal(
										content.indexOf( blogPostQuote ) > -1,
										true,
										'The post preview content (' +
											content +
											') does not include the expected content (' +
											blogPostQuote +
											')'
									);
								} );

								test.it( 'Can see the post category in preview', async function() {
									let categoryDisplayed = await this.postPreviewComponent.categoryDisplayed();
									assert.equal(
										categoryDisplayed.toUpperCase(),
										newCategoryName.toUpperCase(),
										'The category: ' + newCategoryName + ' is not being displayed on the post'
									);
								} );

								test.it( 'Can see the post tag in preview', async function() {
									let tagDisplayed = await this.postPreviewComponent.tagDisplayed();
									assert.equal(
										tagDisplayed.toUpperCase(),
										newTagName.toUpperCase(),
										'The tag: ' + newTagName + ' is not being displayed on the post'
									);
								} );

								test.it( 'Can see the image in preview', async function() {
									let imageDisplayed = await this.postPreviewComponent.imageDisplayed(
										fileDetails
									);
									assert.equal(
										imageDisplayed,
										true,
										'Could not see the image in the web preview'
									);
								} );

								test.it( 'Can close post preview', async function() {
									return await this.postPreviewComponent.edit();
								} );
							} );

							test.describe( 'View Published Content', function() {
								test.it( 'Can publish and view content', async function() {
									const postEditorToolbarComponent = await PostEditorToolbarComponent.Expect(
										driver
									);
									await postEditorToolbarComponent.viewPublishedPostOrPage();
								} );

								test.it( 'Can see correct post title', async function() {
									this.viewPostPage = new ViewPostPage( driver );
									let postTitle = await this.viewPostPage.postTitle();
									assert.equal(
										postTitle.toLowerCase(),
										blogPostTitle.toLowerCase(),
										'The published blog post title is not correct'
									);
								} );

								test.it( 'Can see correct post content', async function() {
									let content = await this.viewPostPage.postContent();
									assert.equal(
										content.indexOf( blogPostQuote ) > -1,
										true,
										'The post content (' +
											content +
											') does not include the expected content (' +
											blogPostQuote +
											')'
									);
								} );

								test.it( 'Can see correct post category', async function() {
									let categoryDisplayed = await this.viewPostPage.categoryDisplayed();
									assert.equal(
										categoryDisplayed.toUpperCase(),
										newCategoryName.toUpperCase(),
										'The category: ' + newCategoryName + ' is not being displayed on the post'
									);
								} );

								test.it( 'Can see correct post tag', async function() {
									let tagDisplayed = await this.viewPostPage.tagDisplayed();
									assert.equal(
										tagDisplayed.toUpperCase(),
										newTagName.toUpperCase(),
										'The tag: ' + newTagName + ' is not being displayed on the post'
									);
								} );

								test.it( 'Can see the image published', async function() {
									let imageDisplayed = await this.viewPostPage.imageDisplayed( fileDetails );
									assert.equal(
										imageDisplayed,
										true,
										'Could not see the image in the published post'
									);
								} );

								if ( host !== 'CI' && host !== 'JN' ) {
									test.describe( 'Can see post publicized on twitter', function() {
										test.it( 'Can see post message', async function() {
											let twitterFeedPage = new TwitterFeedPage(
												driver,
												publicizeTwitterAccount,
												true
											);
											await twitterFeedPage.checkLatestTweetsContain( publicizeMessage );
										} );
									} );
								}
							} );
						} );
					} );
				} );
			} );
		} );

		test.after( async function() {
			if ( fileDetails ) {
				await mediaHelper.deleteFile( fileDetails );
			}
		} );
	} );

	test.describe( 'Basic Public Post @canary @parallel @jetpack', function() {
		this.bailSuite( true );

		test.it( 'Delete Cookies and Local Storage', async function() {
			await driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.describe( 'Publish a New Post', function() {
			const blogPostTitle = dataHelper.randomPhrase();
			const blogPostQuote =
				'“Whenever you find yourself on the side of the majority, it is time to pause and reflect.”\n- Mark Twain';

			test.it( 'Can log in', async function() {
				this.loginFlow = new LoginFlow( driver );
				return await this.loginFlow.loginAndStartNewPost();
			} );

			test.it( 'Can enter post title and content', async function() {
				this.editorPage = await EditorPage.Expect( driver );
				await this.editorPage.enterTitle( blogPostTitle );
				await this.editorPage.enterContent( blogPostQuote + '\n' );

				let errorShown = await this.editorPage.errorDisplayed();
				return assert.equal( errorShown, false, 'There is an error shown on the editor page!' );
			} );

			test.it( 'Can publish and view content', async function() {
				const postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
				await postEditorToolbarComponent.ensureSaved();
				return await postEditorToolbarComponent.publishAndViewContent( { useConfirmStep: true } );
			} );

			test.it( 'Can see correct post title', async function() {
				this.viewPostPage = new ViewPostPage( driver );
				let postTitle = await this.viewPostPage.postTitle();
				assert.equal(
					postTitle.toLowerCase(),
					blogPostTitle.toLowerCase(),
					'The published blog post title is not correct'
				);
			} );
		} );
	} );

	// TODO: investigate why this doesn't show for Pressable Jetpack site
	test.describe( 'Check Activity Log for Public Post @parallel', function() {
		this.bailSuite( true );

		const blogPostTitle = dataHelper.randomPhrase();
		const blogPostQuote =
			'“We are what we pretend to be, so we must be careful about what we pretend to be.”\n- Kurt Vonnegut';

		test.it( 'Delete Cookies and Local Storage', async function() {
			await driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.it( 'Can log in', async function() {
			let loginFlow = new LoginFlow( driver );
			return await loginFlow.loginAndStartNewPost();
		} );

		test.it( 'Can enter post title and content', async function() {
			let editorPage = await EditorPage.Expect( driver );
			await editorPage.enterTitle( blogPostTitle );
			await editorPage.enterContent( blogPostQuote + '\n' );

			let errorShown = await editorPage.errorDisplayed();
			return assert.equal( errorShown, false, 'There is an error shown on the editor page!' );
		} );

		test.it( 'Can publish and view content', async function() {
			const postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
			await postEditorToolbarComponent.ensureSaved();
			await postEditorToolbarComponent.publishThePost( { useConfirmStep: true } );
			return await postEditorToolbarComponent.waitForSuccessViewPostNotice();
		} );

		test.it( 'Can see the post in the Activity log', async function() {
			await ReaderPage.Visit( driver );
			const navBarComponent = await NavBarComponent.Expect( driver );
			await navBarComponent.clickMySites();
			let sidebarComponent = new SidebarComponent( driver );
			await sidebarComponent.ensureSidebarMenuVisible();
			await sidebarComponent.selectStats();
			const statsPage = await StatsPage.Expect( driver );
			await statsPage.openActivity();
			let displayed = await new ActivityPage( driver ).postTitleDisplayed( blogPostTitle );
			return assert(
				displayed,
				`The published post title '${ blogPostTitle }' was not displayed in activity log after publishing`
			);
		} );
	} );

	test.describe( 'Schedule Basic Public Post @parallel @jetpack', function() {
		this.bailSuite( true );
		let publishDate;

		test.it( 'Delete Cookies and Local Storage', async function() {
			await driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.describe( 'Schedule a New Post', function() {
			const blogPostTitle = dataHelper.randomPhrase();
			const blogPostQuote = '“Worries shared are worries halved.”\n- Unknown';

			test.it( 'Can log in', async function() {
				this.loginFlow = new LoginFlow( driver );
				return await this.loginFlow.loginAndStartNewPost();
			} );

			test.it( 'Can enter post title and content', async function() {
				this.editorPage = await EditorPage.Expect( driver );
				await this.editorPage.enterTitle( blogPostTitle );
				await this.editorPage.enterContent( blogPostQuote + '\n' );

				let errorShown = await this.editorPage.errorDisplayed();
				return assert.equal( errorShown, false, 'There is an error shown on the editor page!' );
			} );

			test.it(
				'Can schedule content for a future date (first day of second week next month)',
				async function() {
					let postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
					await postEditorToolbarComponent.ensureSaved( { clickSave: true } );
					let postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
					await postEditorSidebarComponent.expandStatusSection();
					await postEditorSidebarComponent.chooseFutureDate();
					publishDate = await postEditorSidebarComponent.getSelectedPublishDate();
					await postEditorSidebarComponent.closeStatusSection();
					let editorPage = await EditorPage.Expect( driver );
					await editorPage.waitForPage();
					postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
					await postEditorToolbarComponent.ensureSaved( { clickSave: true } );
					return await postEditorToolbarComponent.clickPublishPost();
				}
			);

			test.it( 'Can confirm scheduling post and see correct publish date', async function() {
				let editorConfirmationSidebarComponent = new EditorConfirmationSidebarComponent( driver );
				let publishDateShown = await editorConfirmationSidebarComponent.publishDateShown();
				assert.equal(
					publishDateShown,
					publishDate,
					'The publish date shown is not the expected publish date'
				);
				await editorConfirmationSidebarComponent.confirmAndPublish();
				const postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
				await postEditorToolbarComponent.waitForPostSucessNotice();
				let postEditorPage = await EditorPage.Expect( driver );
				let isScheduled = await postEditorPage.postIsScheduled();
				assert( isScheduled, 'The newly scheduled post is not showing in the editor as scheduled' );
			} );
		} );
	} );

	test.describe( 'Private Posts: @parallel @jetpack', function() {
		test.before( async function() {
			await driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.describe( 'Publish a Private Post', function() {
			const blogPostTitle = dataHelper.randomPhrase();
			const blogPostQuote =
				'If you’re not prepared to be wrong; you’ll never come up with anything original.\n— Sir Ken Robinson\n';

			test.it( 'Can log in', async function() {
				let loginFlow = new LoginFlow( driver );
				await loginFlow.loginAndStartNewPost();
			} );

			test.it( 'Can enter post title and content', async function() {
				let editorPage = await EditorPage.Expect( driver );
				await editorPage.enterTitle( blogPostTitle );
				await editorPage.enterContent( blogPostQuote );
			} );

			test.it( 'Can disable sharing buttons', async function() {
				let postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
				await postEditorSidebarComponent.expandSharingSection();
				await postEditorSidebarComponent.setSharingButtons( false );
				await postEditorSidebarComponent.closeSharingSection();
			} );

			test.it( 'Can allow comments', async function() {
				let postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
				await postEditorSidebarComponent.expandMoreOptions();
				await postEditorSidebarComponent.setCommentsForPost( true );
			} );

			test.describe( 'Set to private which publishes it', function() {
				test.it( 'Ensure the post is saved', async function() {
					const postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
					await postEditorToolbarComponent.ensureSaved();
				} );

				test.it( 'Can set visibility to private which immediately publishes it', async function() {
					const postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
					await postEditorSidebarComponent.setVisibilityToPrivate();
					this.postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
					await this.postEditorToolbarComponent.waitForSuccessViewPostNotice();
					await this.postEditorToolbarComponent.viewPublishedPostOrPage();
				} );

				if ( host === 'WPCOM' ) {
					test.describe( 'As a logged in user ', function() {
						test.it( 'Can see correct post title', async function() {
							let viewPostPage = new ViewPostPage( driver );
							let postTitle = await viewPostPage.postTitle();
							assert.equal(
								postTitle.toLowerCase(),
								'private: ' + blogPostTitle.toLowerCase(),
								'The published blog post title is not correct'
							);
						} );

						test.it( 'Can see correct post content', async function() {
							let viewPostPage = new ViewPostPage( driver );
							let content = await viewPostPage.postContent();
							assert.equal(
								content.indexOf( blogPostQuote ) > -1,
								true,
								'The post content (' +
									content +
									') does not include the expected content (' +
									blogPostQuote +
									')'
							);
						} );

						test.it( 'Can see comments enabled', async function() {
							let viewPostPage = new ViewPostPage( driver );
							let visible = await viewPostPage.commentsVisible();
							assert.equal(
								visible,
								true,
								'Comments are not shown even though they were enabled when creating the post.'
							);
						} );

						test.it( "Can't see sharing buttons", async function() {
							let viewPostPage = new ViewPostPage( driver );
							let visible = await viewPostPage.sharingButtonsVisible();
							assert.equal(
								visible,
								false,
								'Sharing buttons are shown even though they were disabled when creating the post.'
							);
						} );

						test.describe( 'As a non-logged in user ', function() {
							test.it( 'Delete cookies (log out)', async function() {
								driverManager.clearCookiesAndDeleteLocalStorage( driver );
								await driver.navigate().refresh();
							} );

							test.it( "Can't see post at all", async function() {
								let notFoundPage = new NotFoundPage( driver );
								let displayed = await notFoundPage.displayed();
								assert.equal(
									displayed,
									true,
									'Could not see the not found (404) page. Check that it is displayed'
								);
							} );
						} );
					} );
				} else {
					// Jetpack tests
					test.describe( 'As a non-logged in user ', function() {
						test.it( "Can't see post at all", async function() {
							let notFoundPage = new NotFoundPage( driver );
							let displayed = await notFoundPage.displayed();
							assert.equal(
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

	test.describe( 'Password Protected Posts: @parallel @jetpack', function() {
		this.bailSuite( true );

		test.before( async function() {
			await driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.describe( 'Publish a Password Protected Post', function() {
			let blogPostTitle = dataHelper.randomPhrase();
			let blogPostQuote =
				'The best thing about the future is that it comes only one day at a time.\n— Abraham Lincoln\n';
			let postPassword = 'e2e' + new Date().getTime().toString();

			test.it( 'Can log in', async function() {
				let loginFlow = new LoginFlow( driver );
				await loginFlow.loginAndStartNewPost();
			} );

			test.it( 'Can enter post title and content and set to password protected', async function() {
				this.editorPage = await EditorPage.Expect( driver );
				await this.editorPage.enterTitle( blogPostTitle );
				this.postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
				await this.postEditorSidebarComponent.setVisibilityToPasswordProtected( postPassword );
				this.editorPage = await EditorPage.Expect( driver );
				await this.editorPage.enterContent( blogPostQuote );
				this.postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
				await this.postEditorToolbarComponent.ensureSaved();
			} );

			test.it( 'Can enable sharing buttons', async function() {
				let postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
				await postEditorSidebarComponent.expandSharingSection();
				await postEditorSidebarComponent.setSharingButtons( true );
				await postEditorSidebarComponent.closeSharingSection();
			} );

			test.it( 'Can disallow comments', async function() {
				let postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
				await postEditorSidebarComponent.expandMoreOptions();
				await postEditorSidebarComponent.setCommentsForPost( false );
				await postEditorSidebarComponent.closeMoreOptions();
			} );

			test.describe( 'Publish and View', function() {
				// Can publish and view content
				test.before( async function() {
					const postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
					await postEditorToolbarComponent.publishAndViewContent( { useConfirmStep: true } );
				} );

				test.describe( 'As a logged in user', function() {
					test.describe( 'With no password entered', function() {
						test.it( 'Can view post title', async function() {
							let viewPostPage = new ViewPostPage( driver );
							let postTitle = await viewPostPage.postTitle();
							assert.equal(
								postTitle.toLowerCase(),
								( 'Protected: ' + blogPostTitle ).toLowerCase()
							);
						} );

						test.it( 'Can see password field', async function() {
							let viewPostPage = new ViewPostPage( driver );
							let isPasswordProtected = await viewPostPage.isPasswordProtected();
							assert.equal(
								isPasswordProtected,
								true,
								'The blog post does not appear to be password protected'
							);
						} );

						test.it( "Can't see content when no password is entered", async function() {
							let viewPostPage = new ViewPostPage( driver );
							let content = await viewPostPage.postContent();
							assert.equal(
								content.indexOf( blogPostQuote ) === -1,
								true,
								'The post content (' +
									content +
									') displays the expected content (' +
									blogPostQuote +
									') when it should be password protected.'
							);
						} );

						test.it( "Can't see comments", async function() {
							let viewPostPage = new ViewPostPage( driver );
							let visible = await viewPostPage.commentsVisible();
							assert.equal(
								visible,
								false,
								'Comments are shown even though they were disabled when creating the post.'
							);
						} );

						test.it( 'Can see sharing buttons', async function() {
							let viewPostPage = new ViewPostPage( driver );
							let visible = await viewPostPage.sharingButtonsVisible();
							return assert.equal(
								visible,
								true,
								'Sharing buttons are not shown even though they were enabled when creating the post.'
							);
						} );
					} );

					test.describe( 'With incorrect password entered', function() {
						// Enter incorrect password
						test.before( async function() {
							let viewPostPage = new ViewPostPage( driver );
							await viewPostPage.displayed();
							await viewPostPage.enterPassword( 'password' );
						} );

						test.it( 'Can view post title', async function() {
							let viewPostPage = new ViewPostPage( driver );
							let postTitle = await viewPostPage.postTitle();
							assert.equal(
								postTitle.toLowerCase(),
								( 'Protected: ' + blogPostTitle ).toLowerCase()
							);
						} );

						test.it( 'Can see password field', async function() {
							let viewPostPage = new ViewPostPage( driver );
							let isPasswordProtected = await viewPostPage.isPasswordProtected();
							assert.equal(
								isPasswordProtected,
								true,
								'The blog post does not appear to be password protected'
							);
						} );

						test.it( "Can't see content when incorrect password is entered", async function() {
							let viewPostPage = new ViewPostPage( driver );
							let content = await viewPostPage.postContent();
							assert.equal(
								content.indexOf( blogPostQuote ) === -1,
								true,
								'The post content (' +
									content +
									') displays the expected content (' +
									blogPostQuote +
									') when it should be password protected.'
							);
						} );

						test.it( "Can't see comments", async function() {
							let viewPostPage = new ViewPostPage( driver );
							let visible = await viewPostPage.commentsVisible();
							assert.equal(
								visible,
								false,
								'Comments are shown even though they were disabled when creating the post.'
							);
						} );

						test.it( 'Can see sharing buttons', async function() {
							let viewPostPage = new ViewPostPage( driver );
							let visible = await viewPostPage.sharingButtonsVisible();
							assert.equal(
								visible,
								true,
								'Sharing buttons are not shown even though they were enabled when creating the post.'
							);
						} );
					} );

					test.describe( 'With correct password entered', function() {
						// Enter correct password
						test.before( async function() {
							let viewPostPage = new ViewPostPage( driver );
							await viewPostPage.displayed();
							await viewPostPage.enterPassword( postPassword );
						} );

						test.it( 'Can view post title', async function() {
							let viewPostPage = new ViewPostPage( driver );
							let postTitle = await viewPostPage.postTitle();
							assert.equal(
								postTitle.toLowerCase(),
								( 'Protected: ' + blogPostTitle ).toLowerCase()
							);
						} );

						test.it( "Can't see password field", async function() {
							let viewPostPage = new ViewPostPage( driver );
							let isPasswordProtected = await viewPostPage.isPasswordProtected();
							assert.equal(
								isPasswordProtected,
								false,
								'The blog post still appears to be password protected'
							);
						} );

						test.it( 'Can see page content', async function() {
							let viewPostPage = new ViewPostPage( driver );
							let content = await viewPostPage.postContent();
							assert.equal(
								content.indexOf( blogPostQuote ) > -1,
								true,
								'The post content (' +
									content +
									') does not include the expected content (' +
									blogPostQuote +
									')'
							);
						} );

						test.it( "Can't see comments", async function() {
							let viewPostPage = new ViewPostPage( driver );
							let visible = await viewPostPage.commentsVisible();
							assert.equal(
								visible,
								false,
								'Comments are shown even though they were disabled when creating the post.'
							);
						} );

						test.it( 'Can see sharing buttons', async function() {
							let viewPostPage = new ViewPostPage( driver );
							let visible = await viewPostPage.sharingButtonsVisible();
							assert.equal(
								visible,
								true,
								'Sharing buttons are not shown even though they were enabled when creating the post.'
							);
						} );
					} );
				} );
				test.describe( 'As a non-logged in user', function() {
					test.before( async function() {
						await driverManager.clearCookiesAndDeleteLocalStorage( driver );
						await driver.navigate().refresh();
					} );
					test.describe( 'With no password entered', function() {
						test.it( 'Can view post title', async function() {
							let viewPostPage = new ViewPostPage( driver );
							let postTitle = await viewPostPage.postTitle();
							assert.equal(
								postTitle.toLowerCase(),
								( 'Protected: ' + blogPostTitle ).toLowerCase()
							);
						} );

						test.it( 'Can see password field', async function() {
							let viewPostPage = new ViewPostPage( driver );
							let isPasswordProtected = await viewPostPage.isPasswordProtected();
							assert.equal(
								isPasswordProtected,
								true,
								'The blog post does not appear to be password protected'
							);
						} );

						test.it( "Can't see content when no password is entered", async function() {
							let viewPostPage = new ViewPostPage( driver );
							let content = await viewPostPage.postContent();
							assert.equal(
								content.indexOf( blogPostQuote ) === -1,
								true,
								'The post content (' +
									content +
									') displays the expected content (' +
									blogPostQuote +
									') when it should be password protected.'
							);
						} );

						test.it( "Can't see comments", async function() {
							let viewPostPage = new ViewPostPage( driver );
							let visible = await viewPostPage.commentsVisible();
							assert.equal(
								visible,
								false,
								'Comments are shown even though they were disabled when creating the post.'
							);
						} );

						test.it( 'Can see sharing buttons', async function() {
							let viewPostPage = new ViewPostPage( driver );
							let visible = await viewPostPage.sharingButtonsVisible();
							return assert.equal(
								visible,
								true,
								'Sharing buttons are not shown even though they were enabled when creating the post.'
							);
						} );
					} );

					test.describe( 'With incorrect password entered', function() {
						// Enter incorrect password
						test.before( async function() {
							let viewPostPage = new ViewPostPage( driver );
							await viewPostPage.displayed();
							await viewPostPage.enterPassword( 'password' );
						} );

						test.it( 'Can view post title', async function() {
							let viewPostPage = new ViewPostPage( driver );
							let postTitle = await viewPostPage.postTitle();
							assert.equal(
								postTitle.toLowerCase(),
								( 'Protected: ' + blogPostTitle ).toLowerCase()
							);
						} );

						test.it( 'Can see password field', async function() {
							let viewPostPage = new ViewPostPage( driver );
							let isPasswordProtected = await viewPostPage.isPasswordProtected();
							assert.equal(
								isPasswordProtected,
								true,
								'The blog post does not appear to be password protected'
							);
						} );

						test.it( "Can't see content when incorrect password is entered", async function() {
							let viewPostPage = new ViewPostPage( driver );
							let content = await viewPostPage.postContent();
							assert.equal(
								content.indexOf( blogPostQuote ) === -1,
								true,
								'The post content (' +
									content +
									') displays the expected content (' +
									blogPostQuote +
									') when it should be password protected.'
							);
						} );

						test.it( "Can't see comments", async function() {
							let viewPostPage = new ViewPostPage( driver );
							let visible = await viewPostPage.commentsVisible();
							assert.equal(
								visible,
								false,
								'Comments are shown even though they were disabled when creating the post.'
							);
						} );

						test.it( 'Can see sharing buttons', async function() {
							let viewPostPage = new ViewPostPage( driver );
							let visible = await viewPostPage.sharingButtonsVisible();
							assert.equal(
								visible,
								true,
								'Sharing buttons are not shown even though they were enabled when creating the post.'
							);
						} );
					} );

					test.describe( 'With correct password entered', function() {
						// Enter correct password
						test.before( async function() {
							let viewPostPage = new ViewPostPage( driver );
							await viewPostPage.displayed();
							await viewPostPage.enterPassword( postPassword );
						} );

						test.it( 'Can view post title', async function() {
							let viewPostPage = new ViewPostPage( driver );
							let postTitle = await viewPostPage.postTitle();
							assert.equal(
								postTitle.toLowerCase(),
								( 'Protected: ' + blogPostTitle ).toLowerCase()
							);
						} );

						test.it( "Can't see password field", async function() {
							let viewPostPage = new ViewPostPage( driver );
							let isPasswordProtected = await viewPostPage.isPasswordProtected();
							assert.equal(
								isPasswordProtected,
								false,
								'The blog post still appears to be password protected'
							);
						} );

						test.it( 'Can see page content', async function() {
							let viewPostPage = new ViewPostPage( driver );
							let content = await viewPostPage.postContent();
							assert.equal(
								content.indexOf( blogPostQuote ) > -1,
								true,
								'The post content (' +
									content +
									') does not include the expected content (' +
									blogPostQuote +
									')'
							);
						} );

						test.it( "Can't see comments", async function() {
							let viewPostPage = new ViewPostPage( driver );
							let visible = await viewPostPage.commentsVisible();
							assert.equal(
								visible,
								false,
								'Comments are shown even though they were disabled when creating the post.'
							);
						} );

						test.it( 'Can see sharing buttons', async function() {
							let viewPostPage = new ViewPostPage( driver );
							let visible = await viewPostPage.sharingButtonsVisible();
							assert.equal(
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

	test.describe( 'Trash Post: @parallel @jetpack', function() {
		this.bailSuite( true );

		test.before( async function() {
			await driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.describe( 'Trash a New Post', function() {
			const blogPostTitle = dataHelper.randomPhrase();
			const blogPostQuote =
				'The only victory that counts is the victory over yourself.\n— Jesse Owens\n';

			test.it( 'Can log in', async function() {
				const loginFlow = new LoginFlow( driver );
				return await loginFlow.loginAndStartNewPost();
			} );

			test.it( 'Can enter post title and content', async function() {
				const editorPage = await EditorPage.Expect( driver );
				await editorPage.enterTitle( blogPostTitle );
				return await editorPage.enterContent( blogPostQuote );
			} );

			test.it( 'Can trash the new post', async function() {
				const postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
				return await postEditorSidebarComponent.trashPost();
			} );

			test.it( 'Can then see the Posts page with a confirmation message', async function() {
				const postsPage = await PostsPage.Expect( driver );
				const displayed = await postsPage.successNoticeDisplayed();
				return assert.equal(
					displayed,
					true,
					'The Posts page success notice for deleting the post is not displayed'
				);
			} );
		} );
	} );

	test.describe( 'Edit a Post: @parallel @jetpack', function() {
		this.bailSuite( true );

		test.it( 'Delete Cookies and Local Storage', async function() {
			await driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.describe( 'Publish a New Post', function() {
			const originalBlogPostTitle = dataHelper.randomPhrase();
			const updatedBlogPostTitle = dataHelper.randomPhrase();
			const blogPostQuote =
				'Science is organised knowledge. Wisdom is organised life..\n~ Immanuel Kant\n';

			test.it( 'Can log in', async function() {
				this.loginFlow = new LoginFlow( driver );
				return await this.loginFlow.loginAndStartNewPost();
			} );

			test.it( 'Can enter post title and content', async function() {
				this.editorPage = await EditorPage.Expect( driver );
				await this.editorPage.enterTitle( originalBlogPostTitle );
				await this.editorPage.enterContent( blogPostQuote );
				let errorShown = await this.editorPage.errorDisplayed();
				return assert.equal( errorShown, false, 'There is an error shown on the editor page!' );
			} );

			test.it( 'Can publish the post', async function() {
				this.postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
				await this.postEditorToolbarComponent.ensureSaved();
				await this.postEditorToolbarComponent.publishThePost( { useConfirmStep: true } );
				return await this.postEditorToolbarComponent.waitForSuccessViewPostNotice();
			} );

			test.describe( 'Edit the post via posts', function() {
				test.it( 'Can view the posts list', async function() {
					this.readerPage = await ReaderPage.Visit( driver );
					this.navbarComponent = await NavBarComponent.Expect( driver );
					await this.navbarComponent.clickMySites();
					const jetpackSiteName = dataHelper.getJetpackSiteName();
					this.sidebarComponent = new SidebarComponent( driver );
					if ( host !== 'WPCOM' ) {
						await this.sidebarComponent.selectSite( jetpackSiteName );
					}
					await this.sidebarComponent.selectPosts();
					return ( this.postsPage = await PostsPage.Expect( driver ) );
				} );

				test.it( 'Can see and edit our new post', async function() {
					await this.postsPage.waitForPostTitled( originalBlogPostTitle );
					let displayed = await this.postsPage.isPostDisplayed( originalBlogPostTitle );
					assert.equal(
						displayed,
						true,
						`The blog post titled '${ originalBlogPostTitle }' is not displayed in the list of posts`
					);
					await this.postsPage.editPostWithTitle( originalBlogPostTitle );
					return ( this.editorPage = await EditorPage.Expect( driver ) );
				} );

				test.it( 'Can see the post title', async function() {
					await this.editorPage.waitForTitle();
					let titleShown = await this.editorPage.titleShown();
					assert.equal(
						titleShown,
						originalBlogPostTitle,
						'The blog post title shown was unexpected'
					);
				} );

				test.it(
					'Can set the new title and update it, and link to the updated post',
					async function() {
						await this.editorPage.enterTitle( updatedBlogPostTitle );
						let errorShown = await this.editorPage.errorDisplayed();
						assert.equal( errorShown, false, 'There is an error shown on the editor page!' );
						this.postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
						await this.postEditorToolbarComponent.publishThePost();
						return await this.postEditorToolbarComponent.waitForSuccessAndViewPost();
					}
				);

				test.describe( 'Can view the post with the new title', function() {
					test.it( 'Can view the post', function() {
						return ( this.viewPostPage = new ViewPostPage( driver ) );
					} );

					test.it( 'Can see correct post title', async function() {
						let postTitle = await this.viewPostPage.postTitle();
						return assert.equal(
							postTitle.toLowerCase(),
							updatedBlogPostTitle.toLowerCase(),
							'The published blog post title is not correct'
						);
					} );
				} );
			} );
		} );
	} );

	test.describe( 'Insert a contact form: @parallel @jetpack', function() {
		this.bailSuite( true );

		test.it( 'Delete Cookies and Local Storage', async function() {
			await driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.describe( 'Publish a New Post with a Contact Form', function() {
			const originalBlogPostTitle = 'Contact Us: ' + dataHelper.randomPhrase();

			test.it( 'Can log in', async function() {
				this.loginFlow = new LoginFlow( driver );
				return await this.loginFlow.loginAndStartNewPost();
			} );

			test.it( 'Can insert the contact form', async function() {
				this.editorPage = await EditorPage.Expect( driver );
				await this.editorPage.enterTitle( originalBlogPostTitle );
				await this.editorPage.insertContactForm();

				let errorShown = await this.editorPage.errorDisplayed();
				return assert.equal( errorShown, false, 'There is an error shown on the editor page!' );
			} );

			test.it( 'Can see the contact form inserted into the visual editor', async function() {
				this.editorPage = await EditorPage.Expect( driver );
				return await this.editorPage.ensureContactFormDisplayedInPost();
			} );

			test.it( 'Can publish and view content', async function() {
				const postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
				await postEditorToolbarComponent.ensureSaved();
				await postEditorToolbarComponent.publishAndViewContent( { useConfirmStep: true } );
			} );

			test.it( 'Can see the contact form in our published post', async function() {
				this.viewPostPage = new ViewPostPage( driver );
				let displayed = await this.viewPostPage.contactFormDisplayed();
				assert.equal( displayed, true, 'The published post does not contain the contact form' );
			} );
		} );
	} );

	test.describe( 'Insert a payment button: @parallel @jetpack @visdiff', function() {
		this.bailSuite( true );

		const paymentButtonDetails = {
			title: 'Button',
			description: 'Description',
			symbol: '$',
			price: '1.99',
			currency: 'USD',
			allowQuantity: true,
			email: 'test@wordpress.com',
		};

		test.before( async function() {
			const testEnvironment = 'WordPress.com';
			const testName = `Post Editor - Payment Button [${ global.browserName }] [${ screenSize }]`;
			eyesHelper.eyesOpen( driver, eyes, testEnvironment, testName );
		} );

		test.it( 'Delete Cookies and Local Storage', async function() {
			await driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.it( 'Can log in', async function() {
			if ( host === 'WPCOM' ) {
				return await new LoginFlow( driver ).loginAndStartNewPost();
			}
			const jetpackUrl = `jetpackpro${ host.toLowerCase() }.mystagingwebsite.com`;
			await new LoginFlow( driver, 'jetpackUserPREMIUM' ).loginAndStartNewPost( jetpackUrl );
		} );

		test.it( 'Can insert the payment button', async function() {
			const blogPostTitle = 'Payment Button: ' + dataHelper.randomPhrase();

			const editorPage = await EditorPage.Expect( driver );
			await editorPage.enterTitle( blogPostTitle );
			await editorPage.insertPaymentButton( eyes, paymentButtonDetails );

			let errorShown = await editorPage.errorDisplayed();
			return assert.equal( errorShown, false, 'There is an error shown on the editor page!' );
		} );

		test.it( 'Can see the payment button inserted into the visual editor', async function() {
			const editorPage = await EditorPage.Expect( driver );
			return await editorPage.ensurePaymentButtonDisplayedInPost();
		} );

		test.it( 'Can publish and view content', async function() {
			const postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
			await postEditorToolbarComponent.ensureSaved();
			await postEditorToolbarComponent.publishAndViewContent( { useConfirmStep: true } );
		} );

		test.it( 'Can see the payment button in our published post', async function() {
			const viewPostPage = new ViewPostPage( driver );
			let displayed = await viewPostPage.paymentButtonDisplayed();
			assert.equal( displayed, true, 'The published post does not contain the payment button' );
		} );

		test.it(
			'The payment button in our published post opens a new Paypal window for payment',
			async function() {
				let numberOfOpenBrowserWindows = await driverHelper.numberOfOpenWindows( driver );
				assert.equal(
					numberOfOpenBrowserWindows,
					1,
					'There is more than one open browser window before clicking payment button'
				);
				let viewPostPage = new ViewPostPage( driver );
				await viewPostPage.clickPaymentButton();
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
				viewPostPage = new ViewPostPage( driver );
				assert( await viewPostPage.displayed(), 'view post page is not displayed' );
			}
		);

		test.after( async function() {
			await driverHelper.ensurePopupsClosed( driver );
			await eyesHelper.eyesClose( eyes );
		} );
	} );

	test.describe( 'Revert a post to draft: @parallel @jetpack', function() {
		this.bailSuite( true );

		test.before( async function() {
			await driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.describe( 'Publish a new post', function() {
			const originalBlogPostTitle = dataHelper.randomPhrase();
			const blogPostQuote =
				'To really be of help to others we need to be guided by compassion.\n— Dalai Lama\n';

			test.it( 'Can log in', async function() {
				this.loginFlow = new LoginFlow( driver );
				return await this.loginFlow.loginAndStartNewPost();
			} );

			test.it( 'Can enter post title and content', async function() {
				this.editorPage = await EditorPage.Expect( driver );
				await this.editorPage.enterTitle( originalBlogPostTitle );
				await this.editorPage.enterContent( blogPostQuote );

				let errorShown = await this.editorPage.errorDisplayed();
				return assert.equal( errorShown, false, 'There is an error shown on the editor page!' );
			} );

			test.it( 'Can publish the post', async function() {
				this.postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
				await this.postEditorToolbarComponent.ensureSaved();
				await this.postEditorToolbarComponent.publishThePost( { useConfirmStep: true } );

				await this.postEditorToolbarComponent.waitForSuccessViewPostNotice();
				let postPreviewComponent = new PostPreviewComponent( driver );

				return await postPreviewComponent.edit();
			} );
		} );

		test.describe( 'Revert the post to draft', function() {
			test.it( 'Can revert the post to draft', async function() {
				let postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
				const postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
				await postEditorSidebarComponent.revertToDraft();
				await postEditorToolbarComponent.waitForIsDraftStatus();
				let isDraft = await postEditorToolbarComponent.statusIsDraft();
				assert.equal( isDraft, true, 'The post is not set as draft' );
			} );
		} );
	} );
} );
