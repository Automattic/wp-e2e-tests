import assert from 'assert';
import test from 'selenium-webdriver/testing';
import config from 'config';

import LoginFlow from '../lib/flows/login-flow.js';

import EditorPage from '../lib/pages/editor-page.js';
import TwitterFeedPage from '../lib/pages/twitter-feed-page.js';
import ViewPostPage from '../lib/pages/view-post-page.js';
import NotFoundPage from '../lib/pages/not-found-page.js';
import PostsPage from '../lib/pages/posts-page.js';

import SidebarComponent from '../lib/components/sidebar-component.js';
import NavbarComponent from '../lib/components/navbar-component.js';
import PostPreviewComponent from '../lib/components/post-preview-component.js';
import PostEditorSidebarComponent from '../lib/components/post-editor-sidebar-component.js';
import PostEditorToolbarComponent from '../lib/components/post-editor-toolbar-component';

import * as driverManager from '../lib/driver-manager';
import * as mediaHelper from '../lib/media-helper';
import * as dataHelper from '../lib/data-helper';
import * as slackNotifier from '../lib/slack-notifier';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();
const httpsHost = config.get( 'httpsHosts' ).indexOf( host ) !== -1;

var driver;

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( `[${host}] Editor: Posts (${screenSize})`, function() {
	this.bailSuite( true );
	this.timeout( mochaTimeOut );
	const usePublishConfirmation = config.get( 'usePublishConfirmation' );

	test.describe( 'Public Posts: @parallel @jetpack', function() {
		let fileDetails;

		test.before( function() {
			driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		// Create image file for upload
		test.before( function() {
			return mediaHelper.createFile().then( function( details ) {
				fileDetails = details;
			} );
		} );

		test.describe( 'Preview and Publish a Public Post', function() {
			const blogPostTitle = dataHelper.randomPhrase();
			const blogPostQuote = 'The foolish man seeks happiness in the distance. The wise grows it under his feet.\n— James Oppenheim';
			const newCategoryName = 'Category ' + new Date().getTime().toString();
			const newTagName = 'Tag ' + new Date().getTime().toString();
			const publicizeMessage = dataHelper.randomPhrase();
			const publicizeTwitterAccount = config.has( 'publicizeTwitterAccount' ) ? config.get( 'publicizeTwitterAccount' ) : '';

			test.it( 'Can log in', function() {
				let loginFlow = new LoginFlow( driver );
				return loginFlow.loginAndStartNewPost();
			} );

			test.describe( 'Create, Preview and Post', function() {
				test.it( 'Can enter post title, content and image', function() {
					let editorPage = new EditorPage( driver );
					editorPage.enterTitle( blogPostTitle );
					editorPage.enterContent( blogPostQuote + '\n' );
					editorPage.enterPostImage( fileDetails );
					editorPage.waitUntilImageInserted( fileDetails );
					editorPage.errorDisplayed().then( ( errorShown ) => {
						assert.equal( errorShown, false, 'There is an error shown on the editor page!' );
					} );
				} );

				test.describe( 'Categories and Tags', function() {
					test.it( 'Expand Categories and Tags', function() {
						let postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
						postEditorSidebarComponent.expandCategoriesAndTags();
					} );

					test.it( 'Can add a new category', function() {
						let postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
						let postEditorToolbarComponent = new PostEditorToolbarComponent( driver );
						postEditorSidebarComponent.addNewCategory( newCategoryName );
						postEditorSidebarComponent.getCategoriesAndTags().then( function( subtitle ) {
							assert( ! subtitle.match( /Uncategorized/ ), 'Post still marked Uncategorized after adding new category BEFORE SAVE' );
						} );
						postEditorToolbarComponent.ensureSaved();
						postEditorSidebarComponent.getCategoriesAndTags().then( function( subtitle ) {
							assert( ! subtitle.match( /Uncategorized/ ), 'Post still marked Uncategorized after adding new category AFTER SAVE' );
						} );
					} );

					test.it( 'Can add a new tag', function() {
						let postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
						let postEditorToolbarComponent = new PostEditorToolbarComponent( driver );
						postEditorSidebarComponent.addNewTag( newTagName );
						postEditorToolbarComponent.ensureSaved();
						postEditorSidebarComponent.getCategoriesAndTags().then( function( subtitle ) {
							assert( subtitle.match( `#${newTagName}` ), `New tag #${newTagName} not applied` );
						} );
					} );

					test.it( 'Close categories and tags', function() {
						let postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
						postEditorSidebarComponent.closeCategoriesAndTags();
					} );

					test.describe( 'Publicize Options', function() {
						test.it( 'Expand sharing section', function() {
							let postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
							postEditorSidebarComponent.expandSharingSection();
						} );

						if ( host !== 'CI' ) {
							test.it( 'Can see the publicise to twitter account', function() {
								let postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
								postEditorSidebarComponent.publicizeToTwitterAccountDisplayed().then( function( accountDisplayed ) {
									assert.equal( accountDisplayed, publicizeTwitterAccount, 'Could not see see the publicize to twitter account ' + publicizeTwitterAccount + ' in the editor' );
								} );
							} );

							test.it( 'Can see the default publicise message', function() {
								let postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
								postEditorSidebarComponent.publicizeMessageDisplayed().then( function( messageDisplayed ) {
									assert.equal( messageDisplayed, '', 'The publicize message is not defaulting to empty' );
								} );
							} );

							test.it( 'Can set a custom publicise message', function() {
								let postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
								postEditorSidebarComponent.setPublicizeMessage( publicizeMessage );
							} );
						}

						test.it( 'Close sharing section', function() {
							let postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
							postEditorSidebarComponent.closeSharingSection();
						} );

						test.describe( 'Preview (https only)', function() {
							if ( httpsHost ) {
								test.it( 'Can launch post preview', function() {
									this.postEditorToolbarComponent = new PostEditorToolbarComponent( driver );
									this.postEditorToolbarComponent.ensureSaved();
									this.postEditorToolbarComponent.launchPreview();
									this.postPreviewComponent = new PostPreviewComponent( driver );
								} );

								test.it( 'Can see correct post title in preview', function() {
									this.postPreviewComponent.postTitle().then( function( postTitle ) {
										assert.equal( postTitle.toLowerCase(), blogPostTitle.toLowerCase(), 'The blog post preview title is not correct' );
									} );
								} );

								test.it( 'Can see correct post content in preview', function() {
									this.postPreviewComponent.postContent().then( function( content ) {
										assert.equal( content.indexOf( blogPostQuote ) > -1, true, 'The post preview content (' + content + ') does not include the expected content (' + blogPostQuote + ')' );
									} );
								} );

								test.it( 'Can see the post category in preview', function() {
									this.postPreviewComponent.categoryDisplayed().then( function( categoryDisplayed ) {
										assert.equal( categoryDisplayed.toUpperCase(), newCategoryName.toUpperCase(), 'The category: ' + newCategoryName + ' is not being displayed on the post' );
									} );
								} );

								test.it( 'Can see the post tag in preview', function() {
									this.postPreviewComponent.tagDisplayed().then( function( tagDisplayed ) {
										assert.equal( tagDisplayed.toUpperCase(), newTagName.toUpperCase(), 'The tag: ' + newTagName + ' is not being displayed on the post' );
									} );
								} );

								test.it( 'Can see the image in preview', function() {
									this.postPreviewComponent.imageDisplayed( fileDetails ).then( ( imageDisplayed ) => {
										assert.equal( imageDisplayed, true, 'Could not see the image in the web preview' );
									} );
								} );

								test.it( 'Can close post preview', function() {
									this.postPreviewComponent.close();
								} );

								test.describe( 'Publish and Preview Published Content', function() {
									test.it( 'Can publish and view content', function() {
										let postEditorToolbarComponent = new PostEditorToolbarComponent( driver );
										if ( httpsHost ) {
											postEditorToolbarComponent.publishThePost( { useConfirmStep: usePublishConfirmation } );
										} else {
											postEditorToolbarComponent.publishAndPreviewPublished( { useConfirmStep: usePublishConfirmation } );
										}
										this.postPreviewComponent = new PostPreviewComponent( driver );
									} );

									test.it( 'Can see correct post title in preview', function() {
										this.postPreviewComponent.postTitle().then( function( postTitle ) {
											assert.equal( postTitle.toLowerCase(), blogPostTitle.toLowerCase(), 'The blog post preview title is not correct' );
										} );
									} );

									test.it( 'Can see correct post content in preview', function() {
										this.postPreviewComponent.postContent().then( function( content ) {
											assert.equal( content.indexOf( blogPostQuote ) > -1, true, 'The post preview content (' + content + ') does not include the expected content (' + blogPostQuote + ')' );
										} );
									} );

									test.it( 'Can see the post category in preview', function() {
										this.postPreviewComponent.categoryDisplayed().then( function( categoryDisplayed ) {
											assert.equal( categoryDisplayed.toUpperCase(), newCategoryName.toUpperCase(), 'The category: ' + newCategoryName + ' is not being displayed on the post' );
										} );
									} );

									test.it( 'Can see the post tag in preview', function() {
										this.postPreviewComponent.tagDisplayed().then( function( tagDisplayed ) {
											assert.equal( tagDisplayed.toUpperCase(), newTagName.toUpperCase(), 'The tag: ' + newTagName + ' is not being displayed on the post' );
										} );
									} );

									test.it( 'Can see the image in preview', function() {
										this.postPreviewComponent.imageDisplayed( fileDetails ).then( ( imageDisplayed ) => {
											assert.equal( imageDisplayed, true, 'Could not see the image in the web preview' );
										} );
									} );

									test.it( 'Can close post preview', function() {
										if ( httpsHost ) {
											return this.postPreviewComponent.edit();
										}

										// else Jetpack
										return this.postPreviewComponent.close();
									} );
								} );
							} else { // Jetpack tests
								test.it( 'Can publish content', function() {
									let postEditorToolbarComponent = new PostEditorToolbarComponent( driver );
									postEditorToolbarComponent.publishThePost(  { useConfirmStep: usePublishConfirmation } );
								} );
							}

							test.describe( 'View Published Content', function() {
								test.it( 'Can publish and view content', function() {
									let postEditorToolbarComponent = new PostEditorToolbarComponent( driver );
									postEditorToolbarComponent.viewPublishedPostOrPage();
									this.viewPostPage = new ViewPostPage( driver );
								} );

								test.it( 'Can see correct post title', function() {
									this.viewPostPage.postTitle().then( function( postTitle ) {
										assert.equal( postTitle.toLowerCase(), blogPostTitle.toLowerCase(), 'The published blog post title is not correct' );
									} );
								} );

								test.it( 'Can see correct post content', function() {
									this.viewPostPage.postContent().then( function( content ) {
										assert.equal( content.indexOf( blogPostQuote ) > -1, true, 'The post content (' + content + ') does not include the expected content (' + blogPostQuote + ')' );
									} );
								} );

								test.it( 'Can see correct post category', function() {
									this.viewPostPage.categoryDisplayed().then( function( categoryDisplayed ) {
										assert.equal( categoryDisplayed.toUpperCase(), newCategoryName.toUpperCase(), 'The category: ' + newCategoryName + ' is not being displayed on the post' );
									} );
								} );

								test.it( 'Can see correct post tag', function() {
									this.viewPostPage.tagDisplayed().then( function( tagDisplayed ) {
										assert.equal( tagDisplayed.toUpperCase(), newTagName.toUpperCase(), 'The tag: ' + newTagName + ' is not being displayed on the post' );
									} );
								} );

								test.it( 'Can see the image published', function() {
									this.viewPostPage.imageDisplayed( fileDetails ).then( ( imageDisplayed ) => {
										assert.equal( imageDisplayed, true, 'Could not see the image in the published post' );
									} );
								} );

								if ( host !== 'CI' ) {
									test.describe( 'Can see post publicized on twitter', function() {
										test.it( 'Can see post message', function() {
											let twitterFeedPage = new TwitterFeedPage( driver, publicizeTwitterAccount, true );
											twitterFeedPage.checkLatestTweetsContain( publicizeMessage );
										} );
									} );
								}
							} );
						} );
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

	test.describe( 'Basic Public Post @canary @parallel @jetpack', function() {
		this.bailSuite( true );

		test.it( 'Delete Cookies and Local Storage', function() {
			driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.describe( 'Publish a New Post', function() {
			const blogPostTitle = dataHelper.randomPhrase();
			const blogPostQuote = '“Whenever you find yourself on the side of the majority, it is time to pause and reflect.”\n- Mark Twain';

			test.it( 'Can log in', function() {
				this.loginFlow = new LoginFlow( driver );
				return this.loginFlow.loginAndStartNewPost();
			} );

			test.it( 'Can enter post title and content', function() {
				this.editorPage = new EditorPage( driver );
				this.editorPage.enterTitle( blogPostTitle );
				this.editorPage.enterContent( blogPostQuote + '\n' );

				return this.editorPage.errorDisplayed().then( ( errorShown ) => {
					return assert.equal( errorShown, false, 'There is an error shown on the editor page!' );
				} );
			} );

			test.it( 'Can publish and view content', function() {
				const postEditorToolbarComponent = new PostEditorToolbarComponent( driver );
				postEditorToolbarComponent.ensureSaved();
				return postEditorToolbarComponent.publishAndViewContent( { useConfirmStep: usePublishConfirmation } );
			} );

			test.it( 'Can see correct post title', function() {
				this.viewPostPage = new ViewPostPage( driver );
				this.viewPostPage.postTitle().then( function( postTitle ) {
					assert.equal( postTitle.toLowerCase(), blogPostTitle.toLowerCase(), 'The published blog post title is not correct' );
				} );
			} );
		} );
	} );

	test.describe( 'Private Posts: @parallel @jetpack', function() {
		test.before( function() {
			driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.describe( 'Publish a Private Post', function() {
			const blogPostTitle = dataHelper.randomPhrase();
			const blogPostQuote = 'If you’re not prepared to be wrong; you’ll never come up with anything original.\n— Sir Ken Robinson\n';

			test.it( 'Can log in', function() {
				let loginFlow = new LoginFlow( driver );
				loginFlow.loginAndStartNewPost();
			} );

			test.it( 'Can enter post title and content', function() {
				let editorPage = new EditorPage( driver );
				editorPage.enterTitle( blogPostTitle );
				editorPage.enterContent( blogPostQuote );
			} );

			test.it( 'Can disable sharing buttons', function() {
				let postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
				postEditorSidebarComponent.expandSharingSection();
				postEditorSidebarComponent.setSharingButtons( false );
				postEditorSidebarComponent.closeSharingSection();
			} );

			test.it( 'Can allow comments', function() {
				let postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
				postEditorSidebarComponent.expandMoreOptions();
				postEditorSidebarComponent.setCommentsForPost( true );
			} );

			test.describe( 'Set to private which publishes it', function() {
				test.it( 'Ensure the post is saved', function() {
					let postEditorToolbarComponent = new PostEditorToolbarComponent( driver );
					postEditorToolbarComponent.ensureSaved();
				} );

				test.it( 'Can set visibility to private which immediately publishes it', function() {
					const postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
					postEditorSidebarComponent.setVisibilityToPrivate();
					this.postEditorToolbarComponent = new PostEditorToolbarComponent( driver );
					this.postEditorToolbarComponent.waitForSuccessViewPostNotice();
					this.postEditorToolbarComponent.viewPublishedPostOrPage();
				} );

				if ( host === 'WPCOM' ) {
					test.describe( 'As a logged in user ', function() {
						test.it( 'Can see correct post title', function() {
							let viewPostPage = new ViewPostPage( driver );
							viewPostPage.postTitle().then( function( postTitle ) {
								assert.equal( postTitle.toLowerCase(), 'private: ' + blogPostTitle.toLowerCase(), 'The published blog post title is not correct' );
							} );
						} );

						test.it( 'Can see correct post content', function() {
							let viewPostPage = new ViewPostPage( driver );
							viewPostPage.postContent().then( function( content ) {
								assert.equal( content.indexOf( blogPostQuote ) > -1, true, 'The post content (' + content + ') does not include the expected content (' + blogPostQuote + ')' );
							} );
						} );

						test.it( 'Can see comments enabled', function() {
							let viewPostPage = new ViewPostPage( driver );
							viewPostPage.commentsVisible().then( function( visible ) {
								assert.equal( visible, true, 'Comments are not shown even though they were enabled when creating the post.' );
							} );
						} );

						test.it( 'Can\'t see sharing buttons', function() {
							let viewPostPage = new ViewPostPage( driver );
							viewPostPage.sharingButtonsVisible().then( function( visible ) {
								assert.equal( visible, false, 'Sharing buttons are shown even though they were disabled when creating the post.' );
							} );
						} );

						test.describe( 'As a non-logged in user ', function() {
							test.it( 'Delete cookies (log out)', function() {
								driverManager.clearCookiesAndDeleteLocalStorage( driver );
								driver.navigate().refresh();
							} );

							test.it( 'Can\'t see post at all', function() {
								let notFoundPage = new NotFoundPage( driver );
								notFoundPage.displayed().then( function( displayed ) {
									assert.equal( displayed, true, 'Could not see the not found (404) page. Check that it is displayed' );
								} );
							} );
						} );
					} );
				} else { // Jetpack tests
					test.describe( 'As a non-logged in user ', function() {
						test.it( 'Can\'t see post at all', function() {
							let notFoundPage = new NotFoundPage( driver );
							notFoundPage.displayed().then( function( displayed ) {
								assert.equal( displayed, true, 'Could not see the not found (404) page. Check that it is displayed' );
							} );
						} );
					} );
					//TODO: Log in via SSO and verify content
				}
			} );
		} );
	} );

	test.describe( 'Password Protected Posts: @parallel @jetpack', function() {
		this.bailSuite( true );

		test.before( function() {
			driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.describe( 'Publish a Password Protected Post', function() {
			var blogPostTitle = dataHelper.randomPhrase();
			var blogPostQuote = 'The best thing about the future is that it comes only one day at a time.\n— Abraham Lincoln\n';
			var postPassword = 'e2e' + new Date().getTime().toString();

			test.it( 'Can log in', function() {
				let loginFlow = new LoginFlow( driver );
				loginFlow.loginAndStartNewPost();
			} );

			test.it( 'Can enter post title and content and set to password protected', function() {
				this.editorPage = new EditorPage( driver );
				this.editorPage.enterTitle( blogPostTitle );
				this.postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
				this.postEditorSidebarComponent.setVisibilityToPasswordProtected( postPassword );
				this.editorPage = new EditorPage( driver );
				this.editorPage.enterContent( blogPostQuote );
				this.postEditorToolbarComponent = new PostEditorToolbarComponent( driver );
				this.postEditorToolbarComponent.ensureSaved();
			} );

			test.it( 'Can enable sharing buttons', function() {
				let postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
				postEditorSidebarComponent.expandSharingSection();
				postEditorSidebarComponent.setSharingButtons( true );
				postEditorSidebarComponent.closeSharingSection();
			} );

			test.it( 'Can disallow comments', function() {
				let postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
				postEditorSidebarComponent.expandMoreOptions();
				postEditorSidebarComponent.setCommentsForPost( false );
				postEditorSidebarComponent.closeMoreOptions();
			} );

			test.describe( 'Publish and View', function() {
				// Can publish and view content
				test.before( function() {
					let postEditorToolbarComponent = new PostEditorToolbarComponent( driver );
					postEditorToolbarComponent.publishAndViewContent( { useConfirmStep: usePublishConfirmation } );
				} );

				test.describe( 'As a logged in user', function() {
					test.describe( 'With no password entered', function() {
						test.it( 'Can view post title', function() {
							let viewPostPage = new ViewPostPage( driver );
							viewPostPage.postTitle().then( function( postTitle ) {
								assert.equal( postTitle.toLowerCase(), ( 'Protected: ' + blogPostTitle ).toLowerCase() );
							} );
						} );

						test.it( 'Can see password field', function() {
							let viewPostPage = new ViewPostPage( driver );
							viewPostPage.isPasswordProtected().then( function( isPasswordProtected ) {
								assert.equal( isPasswordProtected, true, 'The blog post does not appear to be password protected' );
							} );
						} );

						test.it( 'Can\'t see content when no password is entered', function() {
							let viewPostPage = new ViewPostPage( driver );
							viewPostPage.postContent().then( function( content ) {
								assert.equal( content.indexOf( blogPostQuote ) === -1, true, 'The post content (' + content + ') displays the expected content (' + blogPostQuote + ') when it should be password protected.' );
							} );
						} );

						test.it( 'Can\'t see comments', function() {
							let viewPostPage = new ViewPostPage( driver );
							viewPostPage.commentsVisible().then( function( visible ) {
								assert.equal( visible, false, 'Comments are shown even though they were disabled when creating the post.' );
							} );
						} );

						test.it( 'Can see sharing buttons', function() {
							let viewPostPage = new ViewPostPage( driver );
							viewPostPage.sharingButtonsVisible().then( function( visible ) {
								assert.equal( visible, true, 'Sharing buttons are not shown even though they were enabled when creating the post.' );
							} );
						} );
					} );

					test.describe( 'With incorrect password entered', function() {
						// Enter incorrect password
						test.before( function() {
							let viewPostPage = new ViewPostPage( driver );
							viewPostPage.enterPassword( 'password' );
						} );

						test.it( 'Can view post title', function() {
							let viewPostPage = new ViewPostPage( driver );
							viewPostPage.postTitle().then( function( postTitle ) {
								assert.equal( postTitle.toLowerCase(), ( 'Protected: ' + blogPostTitle ).toLowerCase() );
							} );
						} );

						test.it( 'Can see password field', function() {
							let viewPostPage = new ViewPostPage( driver );
							viewPostPage.isPasswordProtected().then( function( isPasswordProtected ) {
								assert.equal( isPasswordProtected, true, 'The blog post does not appear to be password protected' );
							} );
						} );

						test.it( 'Can\'t see content when incorrect password is entered', function() {
							let viewPostPage = new ViewPostPage( driver );
							viewPostPage.postContent().then( function( content ) {
								assert.equal( content.indexOf( blogPostQuote ) === -1, true, 'The post content (' + content + ') displays the expected content (' + blogPostQuote + ') when it should be password protected.' );
							} );
						} );

						test.it( 'Can\'t see comments', function() {
							let viewPostPage = new ViewPostPage( driver );
							viewPostPage.commentsVisible().then( function( visible ) {
								assert.equal( visible, false, 'Comments are shown even though they were disabled when creating the post.' );
							} );
						} );

						test.it( 'Can see sharing buttons', function() {
							let viewPostPage = new ViewPostPage( driver );
							viewPostPage.sharingButtonsVisible().then( function( visible ) {
								assert.equal( visible, true, 'Sharing buttons are not shown even though they were enabled when creating the post.' );
							} );
						} );
					} );

					test.describe( 'With correct password entered', function() {
						// Enter correct password
						test.before( function() {
							let viewPostPage = new ViewPostPage( driver );
							viewPostPage.enterPassword( postPassword );
						} );

						test.it( 'Can view post title', function() {
							let viewPostPage = new ViewPostPage( driver );
							viewPostPage.postTitle().then( function( postTitle ) {
								assert.equal( postTitle.toLowerCase(), ( 'Protected: ' + blogPostTitle ).toLowerCase() );
							} );
						} );

						test.it( 'Can\'t see password field', function() {
							let viewPostPage = new ViewPostPage( driver );
							viewPostPage.isPasswordProtected().then( function( isPasswordProtected ) {
								assert.equal( isPasswordProtected, false, 'The blog post still appears to be password protected' );
							} );
						} );

						test.it( 'Can see page content', function() {
							let viewPostPage = new ViewPostPage( driver );
							viewPostPage.postContent().then( function( content ) {
								assert.equal( content.indexOf( blogPostQuote ) > -1, true, 'The post content (' + content + ') does not include the expected content (' + blogPostQuote + ')' );
							} );
						} );

						test.it( 'Can\'t see comments', function() {
							let viewPostPage = new ViewPostPage( driver );
							viewPostPage.commentsVisible().then( function( visible ) {
								assert.equal( visible, false, 'Comments are shown even though they were disabled when creating the post.' );
							} );
						} );

						test.it( 'Can see sharing buttons', function() {
							let viewPostPage = new ViewPostPage( driver );
							viewPostPage.sharingButtonsVisible().then( function( visible ) {
								assert.equal( visible, true, 'Sharing buttons are not shown even though they were enabled when creating the post.' );
							} );
						} );
					} );
				} );
				test.describe( 'As a non-logged in user', function() {
					test.before( function() {
						driverManager.clearCookiesAndDeleteLocalStorage( driver );
						driver.navigate().refresh();
					} );
					test.describe( 'With no password entered', function() {
						test.it( 'Can view post title', function() {
							let viewPostPage = new ViewPostPage( driver );
							viewPostPage.postTitle().then( function( postTitle ) {
								assert.equal( postTitle.toLowerCase(), ( 'Protected: ' + blogPostTitle ).toLowerCase() );
							} );
						} );

						test.it( 'Can see password field', function() {
							let viewPostPage = new ViewPostPage( driver );
							viewPostPage.isPasswordProtected().then( function( isPasswordProtected ) {
								assert.equal( isPasswordProtected, true, 'The blog post does not appear to be password protected' );
							} );
						} );

						test.it( 'Can\'t see content when no password is entered', function() {
							let viewPostPage = new ViewPostPage( driver );
							viewPostPage.postContent().then( function( content ) {
								assert.equal( content.indexOf( blogPostQuote ) === -1, true, 'The post content (' + content + ') displays the expected content (' + blogPostQuote + ') when it should be password protected.' );
							} );
						} );

						test.it( 'Can\'t see comments', function() {
							let viewPostPage = new ViewPostPage( driver );
							viewPostPage.commentsVisible().then( function( visible ) {
								assert.equal( visible, false, 'Comments are shown even though they were disabled when creating the post.' );
							} );
						} );

						test.it( 'Can see sharing buttons', function() {
							let viewPostPage = new ViewPostPage( driver );
							viewPostPage.sharingButtonsVisible().then( function( visible ) {
								assert.equal( visible, true, 'Sharing buttons are not shown even though they were enabled when creating the post.' );
							} );
						} );
					} );

					test.describe( 'With incorrect password entered', function() {
						// Enter incorrect password
						test.before( function() {
							let viewPostPage = new ViewPostPage( driver );
							viewPostPage.enterPassword( 'password' );
						} );

						test.it( 'Can view post title', function() {
							let viewPostPage = new ViewPostPage( driver );
							viewPostPage.postTitle().then( function( postTitle ) {
								assert.equal( postTitle.toLowerCase(), ( 'Protected: ' + blogPostTitle ).toLowerCase() );
							} );
						} );

						test.it( 'Can see password field', function() {
							let viewPostPage = new ViewPostPage( driver );
							viewPostPage.isPasswordProtected().then( function( isPasswordProtected ) {
								assert.equal( isPasswordProtected, true, 'The blog post does not appear to be password protected' );
							} );
						} );

						test.it( 'Can\'t see content when incorrect password is entered', function() {
							let viewPostPage = new ViewPostPage( driver );
							viewPostPage.postContent().then( function( content ) {
								assert.equal( content.indexOf( blogPostQuote ) === -1, true, 'The post content (' + content + ') displays the expected content (' + blogPostQuote + ') when it should be password protected.' );
							} );
						} );

						test.it( 'Can\'t see comments', function() {
							let viewPostPage = new ViewPostPage( driver );
							viewPostPage.commentsVisible().then( function( visible ) {
								assert.equal( visible, false, 'Comments are shown even though they were disabled when creating the post.' );
							} );
						} );

						test.it( 'Can see sharing buttons', function() {
							let viewPostPage = new ViewPostPage( driver );
							viewPostPage.sharingButtonsVisible().then( function( visible ) {
								assert.equal( visible, true, 'Sharing buttons are not shown even though they were enabled when creating the post.' );
							} );
						} );
					} );

					test.describe( 'With correct password entered', function() {
						// Enter correct password
						test.before( function() {
							let viewPostPage = new ViewPostPage( driver );
							viewPostPage.enterPassword( postPassword );
						} );

						test.it( 'Can view post title', function() {
							let viewPostPage = new ViewPostPage( driver );
							viewPostPage.postTitle().then( function( postTitle ) {
								assert.equal( postTitle.toLowerCase(), ( 'Protected: ' + blogPostTitle ).toLowerCase() );
							} );
						} );

						test.it( 'Can\'t see password field', function() {
							let viewPostPage = new ViewPostPage( driver );
							viewPostPage.isPasswordProtected().then( function( isPasswordProtected ) {
								assert.equal( isPasswordProtected, false, 'The blog post still appears to be password protected' );
							} );
						} );

						test.it( 'Can see page content', function() {
							let viewPostPage = new ViewPostPage( driver );
							viewPostPage.postContent().then( function( content ) {
								assert.equal( content.indexOf( blogPostQuote ) > -1, true, 'The post content (' + content + ') does not include the expected content (' + blogPostQuote + ')' );
							} );
						} );

						test.it( 'Can\'t see comments', function() {
							let viewPostPage = new ViewPostPage( driver );
							viewPostPage.commentsVisible().then( function( visible ) {
								assert.equal( visible, false, 'Comments are shown even though they were disabled when creating the post.' );
							} );
						} );

						test.it( 'Can see sharing buttons', function() {
							let viewPostPage = new ViewPostPage( driver );
							viewPostPage.sharingButtonsVisible().then( function( visible ) {
								assert.equal( visible, true, 'Sharing buttons are not shown even though they were enabled when creating the post.' );
							} );
						} );
					} );
				} );
			} );
		} );
	} );

	test.describe( 'Trash Post: @parallel @jetpack', function() {
		this.bailSuite( true );

		test.before( function() {
			driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.describe( 'Trash a New Post', function() {
			const blogPostTitle = dataHelper.randomPhrase();
			const blogPostQuote = 'The only victory that counts is the victory over yourself.\n— Jesse Owens\n';

			test.it( 'Can log in', function() {
				const loginFlow = new LoginFlow( driver );
				return loginFlow.loginAndStartNewPost();
			} );

			test.it( 'Can enter post title and content', function() {
				const editorPage = new EditorPage( driver );
				editorPage.enterTitle( blogPostTitle );
				return editorPage.enterContent( blogPostQuote );
			} );

			test.it( 'Can trash the new post', function() {
				const postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
				return postEditorSidebarComponent.trashPost();
			} );

			test.it( 'Can then see the Posts page (new)', function() {
				const postsPage = new PostsPage( driver );
				return postsPage.displayed().then( ( displayed ) => {
					return assert.equal( displayed, true, 'The posts page is not displayed' );
				} );
			} );
		} );
	} );

	test.describe( 'Edit a Post: @parallel @jetpack', function() {
		this.bailSuite( true );

		test.it( 'Delete Cookies and Local Storage', function() {
			driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.describe( 'Publish a New Post', function() {
			const originalBlogPostTitle = dataHelper.randomPhrase();
			const updatedBlogPostTitle = dataHelper.randomPhrase();
			const blogPostQuote = 'Science is organised knowledge. Wisdom is organised life..\n~ Immanuel Kant\n';

			test.it( 'Can log in', function() {
				this.loginFlow = new LoginFlow( driver );
				return this.loginFlow.loginAndStartNewPost();
			} );

			test.it( 'Can enter post title and content', function() {
				this.editorPage = new EditorPage( driver );
				this.editorPage.enterTitle( originalBlogPostTitle );
				this.editorPage.enterContent( blogPostQuote );
				return this.editorPage.errorDisplayed().then( ( errorShown ) => {
					return assert.equal( errorShown, false, 'There is an error shown on the editor page!' );
				} );
			} );

			test.it( 'Can publish the post', function() {
				this.postEditorToolbarComponent = new PostEditorToolbarComponent( driver );
				this.postEditorToolbarComponent.ensureSaved();
				this.postEditorToolbarComponent.publishThePost( { useConfirmStep: usePublishConfirmation } );
				return this.postEditorToolbarComponent.waitForSuccessViewPostNotice();
			} );

			test.describe( 'Edit the post via posts', function() {
				test.it( 'Can view the posts list', function() {
					this.navbarComponent = new NavbarComponent( driver );
					this.navbarComponent.clickMySites();
					this.sidebarComponent = new SidebarComponent( driver );
					this.sidebarComponent.selectPosts();
					this.postsPage = new PostsPage( driver );
					this.postsPage.waitForPosts();
				} );

				test.it( 'Can see and edit our new post', function() {
					this.postsPage.isPostDisplayed( originalBlogPostTitle ).then( ( displayed ) => {
						if ( displayed === false ) {
							slackNotifier.warn( 'Could not locate the post on posts page, retrying the posts menu option again' );
							this.sidebarComponent = new SidebarComponent( driver );
							this.sidebarComponent.selectPosts();
							this.postsPage = new PostsPage( driver );
							return this.postsPage.waitForPosts();
						}
					} );
					this.postsPage.isPostDisplayed( originalBlogPostTitle ).then( ( displayed ) => {
						assert.equal( displayed, true, `The blog post titled '${originalBlogPostTitle}' is not displayed in the list of posts` );
					} );
					this.postsPage.editPostWithTitle( originalBlogPostTitle );
					this.editorPage = new EditorPage( driver );
				} );

				test.it( 'Can see the post title', function() {
					this.editorPage.waitForTitle();
					this.editorPage.titleShown().then( ( titleShown ) => {
						assert.equal( titleShown, originalBlogPostTitle, 'The blog post title shown was unexpected' );
					} );
				} );

				test.it( 'Can set the new title and save it', function() {
					this.editorPage.enterTitle( updatedBlogPostTitle );
					this.editorPage.errorDisplayed().then( ( errorShown ) => {
						assert.equal( errorShown, false, 'There is an error shown on the editor page!' );
					} );
					this.postEditorToolbarComponent = new PostEditorToolbarComponent( driver );
					this.postEditorToolbarComponent.ensureSaved();
					this.postEditorToolbarComponent.publishAndViewContent();
				} );

				test.describe( 'Can view the post with the new title', function() {
					test.it( 'Can view the post', function() {
						return this.viewPostPage = new ViewPostPage( driver );
					} );

					test.it( 'Can see correct post title', function() {
						this.viewPostPage.postTitle().then( function( postTitle ) {
							assert.equal( postTitle.toLowerCase(), updatedBlogPostTitle.toLowerCase(), 'The published blog post title is not correct' );
						} );
					} );
				} );
			} );
		} );
	} );

	test.describe( 'Insert a contact form: @parallel @jetpack', function() {
		this.bailSuite( true );

		test.it( 'Delete Cookies and Local Storage', function() {
			driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.describe( 'Publish a New Post with a Contact Form', function() {
			const originalBlogPostTitle = 'Contact Us: ' + dataHelper.randomPhrase();

			test.it( 'Can log in', function() {
				this.loginFlow = new LoginFlow( driver );
				return this.loginFlow.loginAndStartNewPost();
			} );

			test.it( 'Can insert the contact form', function() {
				this.editorPage = new EditorPage( driver );
				this.editorPage.enterTitle( originalBlogPostTitle );
				this.editorPage.insertContactForm( );

				return this.editorPage.errorDisplayed().then( ( errorShown ) => {
					return assert.equal( errorShown, false, 'There is an error shown on the editor page!' );
				} );
			} );

			test.it( 'Can see the contact form inserted into the visual editor', function() {
				this.editorPage = new EditorPage( driver );
				return this.editorPage.ensureContactFormDisplayedInPost();
			} );

			test.it( 'Can publish and view content', function() {
				let postEditorToolbarComponent = new PostEditorToolbarComponent( driver );
				postEditorToolbarComponent.ensureSaved();
				postEditorToolbarComponent.publishAndViewContent( { useConfirmStep: usePublishConfirmation } );
				this.viewPostPage = new ViewPostPage( driver );
			} );

			test.it( 'Can see the contact form in our published post', function() {
				this.viewPostPage.contactFormDisplayed().then( function( displayed ) {
					assert.equal( displayed, true, 'The published post does not contain the contact form' );
				} );
			} );
		} );
	} );

	test.describe( 'Insert a payment button: @parallel', function() {
		this.bailSuite( true );

		test.it( 'Delete Cookies and Local Storage', function() {
			driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.describe( 'Publish a New Post with a Payment Button', function() {
			const originalBlogPostTitle = 'Payment Button: ' + dataHelper.randomPhrase();

			test.it( 'Can log in', function() {
				this.loginFlow = new LoginFlow( driver );
				return this.loginFlow.loginAndStartNewPost();
			} );

			test.it( 'Can insert the payment button', function() {
				this.editorPage = new EditorPage( driver );
				this.editorPage.enterTitle( originalBlogPostTitle );
				this.editorPage.insertPaymentButton();

				return this.editorPage.errorDisplayed().then( ( errorShown ) => {
					return assert.equal( errorShown, false, 'There is an error shown on the editor page!' );
				} );
			} );

			test.it( 'Can see the payment button inserted into the visual editor', function() {
				this.editorPage = new EditorPage( driver );
				return this.editorPage.ensurePaymentButtonDisplayedInPost();
			} );

			test.it( 'Can publish and view content', function() {
				let postEditorToolbarComponent = new PostEditorToolbarComponent( driver );
				postEditorToolbarComponent.ensureSaved();
				postEditorToolbarComponent.publishAndViewContent( { useConfirmStep: usePublishConfirmation } );
				this.viewPostPage = new ViewPostPage( driver );
			} );

			test.it( 'Can see the payment button in our published post', function() {
				this.viewPostPage.paymentButtonDisplayed().then( function( displayed ) {
					assert.equal( displayed, true, 'The published post does not contain the payment button' );
				} );
			} );
		} );
	} );

	test.describe( 'Revert a post to draft: @parallel @jetpack', function() {
		this.bailSuite( true );

		test.before( function() {
			driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.describe( 'Publish a new post', function() {
			const originalBlogPostTitle = dataHelper.randomPhrase();
			const blogPostQuote = 'To really be of help to others we need to be guided by compassion.\n— Dalai Lama\n';

			test.it( 'Can log in', function() {
				this.loginFlow = new LoginFlow( driver );
				return this.loginFlow.loginAndStartNewPost();
			} );

			test.it( 'Can enter post title and content', function() {
				this.editorPage = new EditorPage( driver );
				this.editorPage.enterTitle( originalBlogPostTitle );
				this.editorPage.enterContent( blogPostQuote );

				return this.editorPage.errorDisplayed().then( ( errorShown ) => {
					return assert.equal( errorShown, false, 'There is an error shown on the editor page!' );
				} );
			} );

			test.it( 'Can publish the post', function() {
				this.postEditorToolbarComponent = new PostEditorToolbarComponent( driver );
				this.postEditorToolbarComponent.ensureSaved();
				this.postEditorToolbarComponent.publishThePost( { useConfirmStep: usePublishConfirmation } );

				if ( httpsHost ) {
					this.postEditorToolbarComponent.waitForSuccessViewPostNotice();
					let postPreviewComponent = new PostPreviewComponent( driver );

					return postPreviewComponent.edit();
				}

				// else Jetpack
				return this.postEditorToolbarComponent.waitForSuccessViewPostNotice();
			} );
		} );

		test.describe( 'Revert the post to draft', function() {
			test.it( 'Can revert the post to draft', function() {
				let postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
				let postEditorToolbarComponent = new PostEditorToolbarComponent( driver );
				postEditorSidebarComponent.revertToDraft();
				postEditorToolbarComponent.waitForIsDraftStatus();
				postEditorToolbarComponent.statusIsDraft().then( ( isDraft ) => {
					assert.equal( isDraft, true, 'The post is not set as draft' );
				} );
			} );
		} );
	} );
} );
