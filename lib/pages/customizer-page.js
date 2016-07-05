import { By as by, until } from 'selenium-webdriver';
import BaseContainer from '../base-container';

import ViewSitePage from './view-site-page.js';

import * as driverHelper from '../driver-helper';
import * as driverManager from '../driver-manager';
import * as slackNotifier from '../slack-notifier';

export default class CustomizerPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '#content' ) );
		this.metaiFrameElementSelector = by.css( 'iframe.is-iframe-loaded' );
		this.previewiFrameElementSelector = by.css( '#customize-preview iframe' );
		this.reloadCustomizerSelector = by.css( '.empty-content__action.button' );
		this.saveSelector = by.css( '#save' );
		this.siteTitleSelector = by.css( 'input[data-customize-setting-link=blogname]' );
		this.waitForCustomizer();
	}

	waitForCustomizer() {
		const self = this;
		self.driver.wait( until.elementLocated( this.metaiFrameElementSelector ), this.explicitWaitMS * 2 ).then( function() { }, function(error ) {
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
		this._switchToMetaiFrame();
		return self.driver.switchTo().defaultContent();
	}

	saveNewTheme() {
		this._ensureMetaViewOnMobile();
		this._switchToMetaiFrame();
		driverHelper.clickWhenClickable( this.driver, this.saveSelector );
		return this._switchToDefaultContent();
	}

	close() {
		this._switchToMetaiFrame();
		driverHelper.clickWhenClickable( this.driver, by.css( '.customize-controls-close' ) );
		return this._switchToDefaultContent();
	}

	expandSiteIdentity() {
		this._ensureMetaViewOnMobile();
		this._switchToMetaiFrame();
		driverHelper.clickWhenClickable( this.driver, by.css( 'li#accordion-section-title_tagline' ) );
		return this._switchToDefaultContent();
	}

	setTitle( newTitle ) {
		this._ensureMetaViewOnMobile();
		this._switchToMetaiFrame();
		driverHelper.setWhenSettable( this.driver, this.siteTitleSelector, newTitle );
		return this._switchToDefaultContent();
	}

	setTagline( newTagline ) {
		this._ensureMetaViewOnMobile();
		this._switchToMetaiFrame();
		driverHelper.setWhenSettable( this.driver, by.css( 'input[data-customize-setting-link=blogdescription]' ), newTagline );
		return this._switchToDefaultContent();
	}

	clickSiteTitleIconInPreview() {
		this._ensurePreviewViewOnMobile();
		this._switchToPreviewiFrame();
		driverHelper.clickWhenClickable( this.driver, by.css( 'div.cdm-icon__blogname' ) );
		return this._switchToDefaultContent();
	}

	waitForTitleFieldDisplayed() {
		let present = false;
		this._ensureMetaViewOnMobile();
		this._switchToMetaiFrame();
		present = this.driver.wait( until.elementLocated( this.siteTitleSelector ), this.explicitWaitMS ).then( () => {
			return true;
		}, ( err ) => {
			return false;
		} );
		this._switchToDefaultContent();
		return present;
	}

	previewTitle() {
		this._ensurePreviewViewOnMobile();
		this._switchToPreviewiFrame();
		const viewSitePage = new ViewSitePage( this.driver );
		const siteTitle = viewSitePage.siteTitle();
		this._switchToDefaultContent();
		return siteTitle;
	}

	previewTagline() {
		this._ensurePreviewViewOnMobile();
		this._switchToPreviewiFrame();
		const viewSitePage = new ViewSitePage( this.driver );
		const siteTitle = viewSitePage.siteTagline();
		this._switchToDefaultContent();
		return siteTitle;
	}

	_switchToMetaiFrame() {
		this._switchToDefaultContent();
		this.driver.wait( until.ableToSwitchToFrame( this.metaiFrameElementSelector ), this.explicitWaitMS, 'Can not switch to the meta iFrame on customizer' );
		return this.driver.wait( until.elementLocated( this.saveSelector ), this.explicitWaitMS, 'Could not locate the save option on customizer' );
	}

	_switchToPreviewiFrame() {
		this._switchToMetaiFrame();
		this.driver.wait( until.ableToSwitchToFrame( this.previewiFrameElementSelector ), this.explicitWaitMS, 'Can not switch to the preview iFrame on customizer' );
		return this.driver.wait( until.elementLocated( by.css( 'body.logged-in' ) ), this.explicitWaitMS, 'Could not locate the preview in the customizer' );
	}

	_switchToDefaultContent() {
		return this.driver.switchTo().defaultContent();
	}

	_ensureMetaViewOnMobile() {
		const driver = this.driver;
		if ( driverManager.currentScreenSize() === 'mobile' ) {
			this._switchToMetaiFrame();
			driver.isElementPresent( by.css( 'div.preview-desktop.preview-only' ) ).then( ( previewDisplayed ) => {
				if ( previewDisplayed === true ) {
					driverHelper.clickWhenClickable( driver, by.css( 'a.customize-controls-preview-toggle' ) );
				}
			} );
			return this._switchToDefaultContent();
		}
	}

	_ensurePreviewViewOnMobile() {
		const driver = this.driver;
		if ( driverManager.currentScreenSize() === 'mobile' ) {
			this._switchToMetaiFrame();
			driver.isElementPresent( by.css( 'div.preview-desktop.preview-only' ) ).then( ( previewDisplayed ) => {
				if ( previewDisplayed === false ) {
					driverHelper.clickWhenClickable( driver, by.css( 'a.customize-controls-preview-toggle' ) );
				}
			} );
			return this._switchToDefaultContent();
		}
	}
}
