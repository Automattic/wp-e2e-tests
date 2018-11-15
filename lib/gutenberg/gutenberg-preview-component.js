/** @format */
import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../async-base-container';
import ViewPostPage from '../pages/view-post-page';

export default class GutenbergPreviewComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '#main.site-main' ) );
	}

	static async switchToPreview( driver ) {
		const tabs = await driver.getAllWindowHandles();
		return await driver.switchTo().window( tabs[ 1 ] ); // Will crash if preview tab wasn't opened
	}

	async postTitle() {
		await GutenbergPreviewComponent.switchToPreview( this.driver );
		this.viewPostPage = await ViewPostPage.Expect( this.driver );
		return await this.viewPostPage.postTitle();
	}

	async postContent() {
		await GutenbergPreviewComponent.switchToPreview( this.driver );
		this.viewPostPage = await ViewPostPage.Expect( this.driver );
		return await this.viewPostPage.postContent();
	}

	async categoryDisplayed() {
		await GutenbergPreviewComponent.switchToPreview( this.driver );
		this.viewPostPage = await ViewPostPage.Expect( this.driver );
		return await this.viewPostPage.categoryDisplayed();
	}
}
