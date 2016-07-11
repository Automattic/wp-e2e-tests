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
		this._ensureMetaViewOnMobile();
		this._switchToMetaiFrame();
		driverHelper.clickWhenClickable( this.driver, by.css( '.customize-controls-close' ) );
		return this._switchToDefaultContent();
	}

	closeOpenSection() {
		this._ensureMetaViewOnMobile();
		this._switchToMetaiFrame();
		driverHelper.clickWhenClickable( this.driver, by.css( '.customize-section-back[tabindex=\'0\']' ) );
		return this._switchToDefaultContent();
	}

	expandSiteIdentity() {
		this._ensureMetaViewOnMobile();
		this._switchToMetaiFrame();
		driverHelper.clickWhenClickable( this.driver, by.css( 'li#accordion-section-title_tagline' ) );
		return this._switchToDefaultContent();
	}

	expandColorsAndBackgrounds() {
		this._ensureMetaViewOnMobile();
		this._switchToMetaiFrame();
		driverHelper.clickWhenClickable( this.driver, by.css( 'li#accordion-section-colors_manager_tool' ) );
		return this._switchToDefaultContent();
	}

	expandFonts() {
		this._ensureMetaViewOnMobile();
		this._switchToMetaiFrame();
		driverHelper.clickWhenClickable( this.driver, by.css( 'li#accordion-section-jetpack_fonts' ) );
		return this._switchToDefaultContent();
	}

	chooseFirstHeadingsFont() {
		const headingsFontDropDownSelector = by.css( 'div[data-font-type=\'headings\'] + div' );
		const firstFontSelector = by.css( 'div[data-font-type=\'headings\'] + div #font-select .jetpack-fonts__option' );
		this._ensureMetaViewOnMobile();
		this._switchToMetaiFrame();
		driverHelper.clickWhenClickable( this.driver, headingsFontDropDownSelector );
		this.driver.wait( ( ) => {
			return this.driver.findElement( firstFontSelector ).getText() !== '';
		}, this.explicitWaitMS, 'Could not locate the first font option that contains text' );
		const fontName = this.driver.findElement( firstFontSelector ).getText();
		driverHelper.clickWhenClickable( this.driver, firstFontSelector );
		this._switchToDefaultContent();
		return fontName;
	}

	chooseBackgroundColor() {
		this._ensureMetaViewOnMobile();
		this._switchToMetaiFrame();
		driverHelper.clickWhenClickable( this.driver, by.css( 'li[data-role=\'bg\'][data-title=\'Background\']' ) );
		this.driver.sleep( 1000 ); // for some reason the color picker takes a bit to load and I can't work out how to deterministically wait for it
		const colorSuggestionsSelector = by.css( '.the-picker ul.color-suggestions li' );
		this.driver.wait( until.elementLocated( colorSuggestionsSelector ), this.explicitWaitMS, 'Could not locate the color suggestions element' );
		const colorSuggestionsElement = this.driver.findElement( colorSuggestionsSelector );
		this.driver.wait( until.elementIsVisible( colorSuggestionsElement ), this.explicitWaitMS, 'Could not see the color suggestions element displayed, check it is visible' );
		driverHelper.clickWhenClickable( this.driver, colorSuggestionsSelector );
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
		const siteTitle = viewSitePage.siteTitle().then( ( title ) => {
			return title;
		} );
		this._switchToDefaultContent();
		return siteTitle;
	}

	previewUsesFont( fontName ) {
		const expectedFontSelector = by.css( `.wf-${fontName}-n1-active` );
		this._ensurePreviewViewOnMobile();
		this._switchToPreviewiFrame();
		const present = this.driver.isElementPresent( expectedFontSelector );
		this._switchToDefaultContent();
		return present;
	}

	previewShowsCustomBackgroundColor() {
		this._ensurePreviewViewOnMobile();
		this._switchToPreviewiFrame();
		const visible = this.driver.wait( until.elementLocated( by.css( 'body.custom-background' ) ), this.explicitWaitMS ).then( () => {
			return true;
		}, ( ) => {
			return false;
		} );
		this._switchToDefaultContent();
		return visible;
	}

	previewTagline() {
		this._ensurePreviewViewOnMobile();
		this._switchToPreviewiFrame();
		const viewSitePage = new ViewSitePage( this.driver );
		const siteTagLine = viewSitePage.siteTagline().then( ( tagLine ) => {
			return tagLine;
		} );
		this._switchToDefaultContent();
		return siteTagLine;
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
