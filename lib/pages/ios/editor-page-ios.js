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
		this.optionsButtonSelector = By.xpath( '//XCUIElementTypeNavigationBar[1]/XCUIElementTypeButton[4]' );
		this.postButtonSelector = By.xpath( '//XCUIElementTypeButton[@name="Post"]' );
	}

	enterTitle( blogPostTitle ) {
		console.log( 'enterTitle' );
		const driver = this.driver;
		const wdDriver = global.__WDDRIVER__;
		const titleSelector = this.titleSelector;

		return wdDriver.contexts().then( ( contexts ) => {
			console.log( 'There are contexts - ' + contexts.length );
			return wdDriver.context( contexts[1] ); // choose the webview context
		} ).then( () => {
			console.log( 'SETTING TITLE' );

			return driverHelper.setWhenSettableMobile( driver, titleSelector, blogPostTitle, { richTextField: `#${this.titleId}` } );
		} ).finally( () => {
			console.log( 'Returning to native context' );
			return wdDriver.context( 'NATIVE_APP' ); // choose the native_app context
		} );
	}

	enterContent( blogPostText ) {
		console.log( 'enterContent' );
		const driver = this.driver;
		const wdDriver = global.__WDDRIVER__;
		const bodySelector = this.bodySelector;

		return wdDriver.contexts().then( ( contexts ) => {
			console.log( 'There are contexts - ' + contexts.length );
			return wdDriver.context( contexts[1] ); // choose the webview context
		} ).then( () => {
			console.log( 'SETTING CONTENT' );

			return driverHelper.setWhenSettableMobile( driver, bodySelector, blogPostText.replace( /\n/g, '&nbsp;' ), { richTextField: `#${this.bodyId}` } );
		} ).finally( () => {
			console.log( 'Returning to native context' );
			return wdDriver.context( 'NATIVE_APP' ); // choose the native_app context
		} );
	}

	openOptions() {
		return driverHelper.clickWhenClickableMobile( this.driver, this.optionsButtonSelector );
	}

	clickPost() {
		console.log( 'clickPost' );
		return driverHelper.clickWhenClickableMobile( this.driver, this.postButtonSelector );
	}
}
//XCUIElementTypeApplication[1]/XCUIElementTypeWindow[1]/XCUIElementTypeOther[3]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[1]/XCUIElementTypeTextView[1]
