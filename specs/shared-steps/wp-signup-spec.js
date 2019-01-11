/** @format */
import assert from 'assert';
import { getBrowserSingleton } from '../../lib/driver-manager';
import SitePreviewComponent from '../../lib/components/site-preview-component.js';

export const stepWrapper = ( { name, body } ) => {
	step( name, async () => {
		const driver = await getBrowserSingleton();

		return await body( driver );
	} );
};

export const canSeeTheSitePreview = {
	name: 'Can then see the site preview',
	body: driver => async () => {
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
