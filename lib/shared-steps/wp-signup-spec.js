/** @format */
import assert from 'assert';
import SitePreviewComponent from '../components/site-preview-component.js';

export const canSeeTheSitePreview = {
	name: 'Can then see the site preview',
	body: driver =>
		async function() {
			const sitePreviewComponent = await SitePreviewComponent.Expect( driver );

			const toolbar = await sitePreviewComponent.toolbar();
			const placeholder = await sitePreviewComponent.contentPlaceholder();

			assert( toolbar, 'The preview toolbar does not exist.' );
			assert( placeholder, 'The preview content placeholder does not exist.' );
			await sitePreviewComponent.enterSitePreview();

			const siteBody = await sitePreviewComponent.siteBody();

			assert( siteBody, 'The site body does not appear in the iframe.' );

			return sitePreviewComponent.leaveSitePreview();
		},
};
