import BaseContainerMobile from '../../base-container-mobile.js';
import { By } from 'selenium-webdriver';
import * as driverHelper from '../../driver-helper.js';

export default class EditorPage extends BaseContainerMobile {
	constructor( driver ) {
		super( driver, By.xpath( '//XCUIElementTypeButton[@name="Post"]' ) );

		this.titleSelector = By.xpath( '//XCUIElementTypeOther[@name="ZSSRichTextEditor"]/XCUIElementTypeTextView[1]' );
		this.bodySelector = By.xpath( '//XCUIElementTypeApplication[1]/XCUIElementTypeWindow[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeTextView[2]' );
		this.optionsButtonSelector = By.xpath( '//XCUIElementTypeNavigationBar[1]/XCUIElementTypeButton[4]' );
		this.postButtonSelector = By.xpath( '//XCUIElementTypeButton[@name="Post"]' );
	}

	enterTitle( blogPostTitle ) {
		return driverHelper.setWhenSettableMobile( this.driver, this.titleSelector, blogPostTitle );
	}

	enterContent( blogPostText ) {
		return driverHelper.setWhenSettableMobile( this.driver, this.bodySelector, blogPostText );
	}

	openOptions() {
		return driverHelper.clickWhenClickableMobile( this.driver, this.optionsButtonSelector );
	}

	clickPost() {
		return driverHelper.clickWhenClickableMobile( this.driver, this.postButtonSelector );
	}
}
