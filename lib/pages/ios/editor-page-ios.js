import BaseContainerMobile from '../../base-container-mobile.js';
import { By } from 'selenium-webdriver';
import * as driverHelper from '../../driver-helper.js';

export default class EditorPage extends BaseContainerMobile {
	constructor( driver ) {
		super( driver, By.xpath( '//XCUIElementTypeOther[@name="ZSSRichTextEditor"]' ) );

		this.titleId = 'zss_field_title';
		this.titleSelector = By.xpath( `//*[@id="${this.titleId}"]` );
		this.bodyId = 'zss_field_content';
		this.bodySelector = By.xpath( `//*[@id="${this.bodyId}"]` );
		this.optionsButtonSelector = By.xpath( '//XCUIElementTypeButton[@name="More"]' );
		this.postButtonSelector = By.xpath( '//XCUIElementTypeButton[@name="Post"]' );
	}

	enterTitle( blogPostTitle ) {
		return driverHelper.setWhenSettableMobile( this.driver, this.titleSelector, blogPostTitle, { richTextField: `#${this.titleId}` } );
	}

	enterContent( blogPostText ) {
		return driverHelper.setWhenSettableMobile( this.driver, this.bodySelector, blogPostText.replace( /\n/g, '&nbsp;' ), { richTextField: `#${this.bodyId}` } );
	}

	openMenu() {
		return driverHelper.clickWhenClickableMobile( this.driver, this.optionsButtonSelector );
	}

	selectOption( optionName ) {
		const buttonSelector = By.xpath( `//XCUIElementTypeButton[@name="${optionName}"]` );

		return driverHelper.clickWhenClickableMobile( this.driver, buttonSelector );
	}

	clickPost() {
		return driverHelper.clickWhenClickableMobile( this.driver, this.postButtonSelector );
	}
}
