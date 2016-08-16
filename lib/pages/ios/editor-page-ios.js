import BaseContainerMobile from '../../base-container-mobile.js';
import { By } from 'selenium-webdriver';
import * as driverHelper from '../../driver-helper.js';

export default class LoginPage extends BaseContainerMobile {
	constructor( driver ) {
		super( driver, By.xpath( '//UIAButton[@name="Post"]' ) );

		this.titleSelector = By.xpath( '//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIATextField[1]' );
		this.bodySelector = By.xpath( '//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIATextField[2]' );
		this.postButtonSelector = By.xpath( '//UIAButton[@name="Post"]' );
	}

	enterTitle( blogPostTitle ) {
		return driverHelper.setWhenSettableMobile( this.driver, this.titleSelector, blogPostTitle );
	}

	enterContent( blogPostText ) {
		return driverHelper.setWhenSettableMobile( this.driver, this.bodySelector, blogPostText );
	}
}
