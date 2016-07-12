import { By as by, until } from 'selenium-webdriver';
import BaseContainer from '../base-container';
import * as driverHelper from '../driver-helper';
import * as slackNotifier from '../slack-notifier';

export default class CustomizerPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '#content' ) );
		this.iframeElementSelector = by.css( 'iframe.is-iframe-loaded' );
		this.reloadCustomizerSelector = by.css( '.empty-content__action.button' );
		this.saveSelector = by.css( '#save' );
		this.waitForCustomizer();
	}

	waitForCustomizer() {
		const self = this;
		self.driver.wait( until.elementLocated( this.iframeElementSelector ), this.explicitWaitMS * 2 ).then( function() { }, function( error ) {
			const message = `Found issue on customizer page: '${error}' - Clicking try again button now.`;
			slackNotifier.warn( message );
			self.driver.wait( function() {
				return self.driver.isElementPresent( self.reloadCustomizerSelector );
			}, self.explicitWaitMS ).then( function() {
				driverHelper.clickWhenClickable( self.driver, self.reloadCustomizerSelector, self.explicitWaitMS );
			}, function( err ) {
				console.log( `Could not locate reload button to click in the customizer: '${err}'` );
			} );
		} );
		this._switchToiFrame();
		return self.driver.switchTo().defaultContent();
	}

	saveNewTheme() {
		this._switchToiFrame();
		driverHelper.clickWhenClickable( this.driver, this.saveSelector );
		return this.driver.switchTo().defaultContent();
	}

	close() {
		this._switchToiFrame();
		driverHelper.clickWhenClickable( this.driver, by.css( '.customize-controls-close' ) );
		return this.driver.switchTo().defaultContent();
	}

	_switchToiFrame() {
		this.driver.wait( until.ableToSwitchToFrame( this.iframeElementSelector ), this.explicitWaitMS, 'Can not switch to iFrame on customizer' );
		return this.driver.wait( until.elementLocated( this.saveSelector ), this.explicitWaitMS, 'Could not locate save option on customizer' );
	}
}
