/** @format */

import config from 'config';
import assert from 'assert';

import WPAdminSidebar from '../lib/pages/wp-admin/wp-admin-sidebar.js';
import JetpackConnectFlow from '../lib/flows/jetpack-connect-flow.js';
import MarkdownBlockComponent from '../lib/gutenberg/blocks/markdown-block-component.js';
import PostAreaComponent from '../lib/pages/frontend/post-area-component.js';
import GutenbergEditorComponent from '../lib/gutenberg/gutenberg-editor-component.js';
import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper.js';
import WPAdminJetpackModulesPage from '../lib/pages/wp-admin/wp-admin-jetpack-modules-page.js';
import WPAdminJetpackPage from '../lib/pages/wp-admin/wp-admin-jetpack-page.js';
import WPAdminDashboardPage from '../lib/pages/wp-admin/wp-admin-dashboard-page.js';
import LoginFlow from '../lib/flows/login-flow.js';
import WPAdminLogonPage from '../lib/pages/wp-admin/wp-admin-logon-page.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

let driver;
let jnFlow;
const expectedHTML = `<h3>Header</h3>
<p>Some <strong>list</strong>:</p>
<ul>
<li>item a</li>
<li>item b</li>
<li>item c</li>
</ul>
`;

// FIXME: Skip mobile tests for now. https://github.com/Automattic/wp-e2e-tests/issues/1509
if ( screenSize !== 'mobile' ) {
	before( async function() {
		this.timeout( startBrowserTimeoutMS );
		driver = await driverManager.startBrowser();
	} );

	describe( `[${ host }] Gutenberg Markdown block: (${ screenSize })`, function() {
		this.timeout( mochaTimeOut );

		before( 'Prepare Site for testing', async function() {
			if ( host !== 'WPCOM' ) {
				// Can create wporg site and connect Jetpack
				this.timeout( mochaTimeOut * 12 );
				jnFlow = new JetpackConnectFlow( driver, 'jetpackConnectUser', 'gutenpack' );
				await jnFlow.connectFromWPAdmin();

				// Can activate Markdown module and log out
				await WPAdminSidebar.refreshIfJNError( driver );
				const jetpackModulesPage = await WPAdminJetpackModulesPage.Visit(
					driver,
					WPAdminJetpackModulesPage.getPageURL( jnFlow.url )
				);
				await jetpackModulesPage.activateMarkdown();
				await WPAdminJetpackPage.Expect( driver );
				const dashboardPage = await WPAdminDashboardPage.Visit(
					driver,
					WPAdminDashboardPage.getUrl( jnFlow.url )
				);
				await dashboardPage.logout();
			}
		} );

		describe( '[WP-Admin] Publish a simple post with Markdown block  @parallel @jetpack', function() {
			step( 'Can login to WPORG site', async function() {
				const loginPage = await WPAdminLogonPage.Visit( driver, jnFlow.url );
				await loginPage.login( jnFlow.username, jnFlow.password );
			} );

			step( 'Can start new post', async function() {
				await WPAdminSidebar.refreshIfJNError( driver );
				const wpAdminSidebar = await WPAdminSidebar.Expect( driver );
				return await wpAdminSidebar.selectNewPost();
			} );

			markdownTestSteps();
		} );

		describe( '[Calypso] Publish a simple post with Markdown block  @parallel @jetpack', function() {
			step( 'Can login to WPCOM and start new post', async function() {
				const loginFlow = new LoginFlow( driver, 'jetpackConnectUser' );
				await loginFlow.login();
				const siteSlug = dataHelper.getSiteSlug( jnFlow.url );
				const url = `https://wpcalypso.wordpress.com/gutenberg/post/${ siteSlug }`;
				driver.get( url );
			} );

			markdownTestSteps();
		} );
	} );
}

function markdownTestSteps() {
	step( 'Can insert a markdown block', async function() {
		const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
		await gEditorComponent.removeNUXNotice();
		this.markdownBlockID = await gEditorComponent.addBlock( 'Markdown' );
	} );

	step( 'Can fill markdown block with content', async function() {
		this.markdownBlock = await MarkdownBlockComponent.Expect( driver, this.markdownBlockID );
		return await this.markdownBlock.setContent(
			'### Header\nSome **list**:\n\n- item a\n- item b\n- item c\n'
		);
	} );

	step( 'Can see rendered content in preview', async function() {
		await this.markdownBlock.switchPreview();
		const html = await this.markdownBlock.getPreviewHTML();
		assert.equal( html, expectedHTML );
		await this.markdownBlock.switchMarkdown();
	} );

	step( 'Can publish the post and see its content', async function() {
		const gEditorComponent = await GutenbergEditorComponent.Expect( driver );
		await gEditorComponent.publish( { visit: true } );
		const postFrontend = await PostAreaComponent.Expect( driver );
		const html = await postFrontend.getPostHTML();
		assert( html.includes( expectedHTML ) );
	} );
}
