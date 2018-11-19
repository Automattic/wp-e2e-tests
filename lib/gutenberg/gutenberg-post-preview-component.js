/** @format */
import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../async-base-container';
import ViewPostPage from '../pages/view-post-page';

export default class GutenbergPostPreviewComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '#main.site-main' ) );
	}

	async postTitle() {
		const viewPostPage = await ViewPostPage.Expect( this.driver );
		return await viewPostPage.postTitle();
	}

	async postContent() {
		const viewPostPage = await ViewPostPage.Expect( this.driver );
		return await viewPostPage.postContent();
	}

	async categoryDisplayed() {
		const viewPostPage = await ViewPostPage.Expect( this.driver );
		return await viewPostPage.categoryDisplayed();
	}

	async imageDisplayed( fileDetails ) {
		const viewPagePage = await ViewPostPage.Expect( this.driver );
		return await viewPagePage.imageDisplayed( fileDetails );
	}
}
