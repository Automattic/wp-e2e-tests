/** @format */

import config from 'config';
import assert from 'assert';

import WPAdminSidebar from '../lib/pages/wp-admin/wp-admin-sidebar.js';
import JetpackConnectFlow from '../lib/flows/jetpack-connect-flow';
import MarkdownBlockComponent from '../lib/gutenberg/blocks/markdown-block-component.js';
// import WPAdminLogonPage from '../lib/pages/wp-admin/wp-admin-logon-page.js';
import PostAreaComponent from '../lib/pages/frontend/post-area-component.js';
import * as driverManager from '../lib/driver-manager';
import GutenbergEditorHeaderComponent from '../lib/gutenberg/gutenberg-editor-header-component.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();

let driver;

before( async function() {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe( `Gutenberg blocks: (${ screenSize })`, function() {
	this.timeout( mochaTimeOut );

	describe( 'Create a post with Markdown block', function() {
		const expectedHTML = `<h3>Header</h3>
<p>Some <strong>list</strong>:</p>
<ul>
<li>item a</li>
<li>item b</li>
<li>item c</li>
</ul>
`;
		// Easy way to run/develop tests against local WP instance
		// step( 'Can login to WPORG site', async function() {
		// 	const loginPage = await WPAdminLogonPage.Visit( driver, 'http://wpdev.localhost/' );
		// 	await loginPage.login( 'wordpress', 'wordpress' );
		// } );

		step( 'Can create wporg site', async function() {
			this.timeout( mochaTimeOut * 12 );

			this.jnFlow = new JetpackConnectFlow( driver, null, 'gutenpack' );
			return await this.jnFlow.createJNSite();
		} );

		step( 'Can start new post', async function() {
			await WPAdminSidebar.refreshIfJNError( driver );
			this.wpAdminSidebar = await WPAdminSidebar.Expect( driver );
			return await this.wpAdminSidebar.selectNewPost();
		} );

		step( 'Can insert a markdown block', async function() {
			const gHeaderComponent = await GutenbergEditorHeaderComponent.Expect( driver );
			gHeaderComponent.removeNUXNotice();
			this.markdownBlockID = await gHeaderComponent.addBlock( 'Markdown' );
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
			const gHeaderComponent = await GutenbergEditorHeaderComponent.Expect( driver );
			await gHeaderComponent.publish( { visit: true } );
			const postFrontend = await PostAreaComponent.Expect( driver );
			const html = await postFrontend.getPostHTML();
			assert( html.includes( expectedHTML ) );
		} );
	} );
} );
