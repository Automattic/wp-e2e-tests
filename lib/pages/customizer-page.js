import { By as by, until } from 'selenium-webdriver';
import BaseContainer from '../base-container';

import ViewSitePage from './view-site-page.js';

import * as driverHelper from '../driver-helper';
import * as driverManager from '../driver-manager';
import * as slackNotifier from '../slack-notifier';

const elementIsNotPresent = function( cssSelector ) {
	return new until.Condition( 'for element to not be present', function( driver ) {
		return driver.isElementPresent( by.css( cssSelector ) ).then( function( isPresent ) {
			return ! isPresent;
		} );
	} );
};

export default class CustomizerPage extends BaseContainer {
	constructor( driver ) {
		const expectedElementSelector = by.css( '.is-section-customize' );
		driverHelper.isEventuallyPresentAndDisplayed( driver, expectedElementSelector ).then( ( present ) => {
			if ( present === false ) {
				slackNotifier.warn( 'There was a problem loading the customizer - reloading it now' );
				return driver.navigate().refresh().then( () => { }, ( err ) => {
					slackNotifier.warn( `Error refreshing customizer: '${ err }'` );
				} );
			}
		} );
		super( driver, expectedElementSelector );
		this.metaiFrameElementSelector = by.css( 'iframe.is-iframe-loaded' );
		this.previewiFrameElementSelector = by.css( '#customize-preview iframe' );
		this.reloadCustomizerSelector = by.css( '.empty-content__action.button' );
		this.saveSelector = by.css( '#save' );
		this.siteTitleSelector = by.css( 'input[data-customize-setting-link=blogname]' );
		this.backSelector = by.css( '.customize-section-back[tabindex=\'0\']' );
		this.shortSleepMS = 1000;
		this.waitForCustomizer();
	}

	waitForCustomizer() {
		const self = this;
		self.driver.wait( until.elementLocated( this.metaiFrameElementSelector ), this.explicitWaitMS * 2 ).then( function() { }, function( error ) {
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
		const self = this;
		self._ensureMetaViewOnMobile();
		self._switchToMetaiFrame();
		return self.driver.sleep( self.shortSleepMS ).then( () => {
			return driverHelper.clickWhenClickable( self.driver, self.saveSelector ).then( () => {
				return self._switchToDefaultContent();
			} );
		} );
	}

	close() {
		const self = this;
		self._ensureMetaViewOnMobile();
		self._switchToMetaiFrame();
		return self.driver.sleep( self.shortSleepMS ).then( () => {
			return driverHelper.clickWhenClickable( self.driver, by.css( '.customize-controls-close' ) ).then( () => {
				return self._switchToDefaultContent();
			} );
		} );
	}

	closeOpenSection() {
		const self = this;
		self._ensureMetaViewOnMobile();
		self._switchToMetaiFrame();
		self.driver.sleep( self.shortSleepMS ).then( () => {
			return driverHelper.clickWhenClickable( self.driver, self.backSelector );
		} );
		self.driver.isElementPresent( self.backSelector ).then( ( present ) => {
			if ( present === true ) {
				slackNotifier.warn( 'The close open section element is still present when it should have been clicked - trying to click again now' );
				return driverHelper.clickWhenClickable( self.driver, self.backSelector );
			}
		} );
		return self._switchToDefaultContent();
	}

	closeOpenPanel() {
		const self = this;
		self._ensureMetaViewOnMobile();
		self._switchToMetaiFrame();
		return self.driver.sleep( self.shortSleepMS ).then( () => {
			return driverHelper.clickWhenClickable( self.driver, by.css( '.customize-panel-back[tabindex=\'0\']' ) ).then( () => {
				return self._switchToDefaultContent();
			} );
		} );
	}

	expandSiteIdentity() {
		const self = this;
		self._ensureMetaViewOnMobile();
		self._switchToMetaiFrame();
		return self.driver.sleep( self.shortSleepMS ).then( () => {
			return driverHelper.clickWhenClickable( self.driver, by.css( 'li#accordion-section-title_tagline' ) ).then( () => {
				return self._switchToDefaultContent();
			} );
		} );
	}

	expandColorsAndBackgrounds() {
		const self = this;
		self._ensureMetaViewOnMobile();
		self._switchToMetaiFrame();
		return self.driver.sleep( self.shortSleepMS ).then( () => {
			return driverHelper.clickWhenClickable( self.driver, by.css( 'li#accordion-section-colors_manager_tool' ) ).then( () => {
				return self._switchToDefaultContent();
			} );
		} );
	}

	expandFonts() {
		const self = this;
		self._ensureMetaViewOnMobile();
		self._switchToMetaiFrame();
		return self.driver.sleep( self.shortSleepMS ).then( () => {
			return driverHelper.clickWhenClickable( self.driver, by.css( 'li#accordion-section-jetpack_fonts' ) ).then( () => {
				return self._switchToDefaultContent();
			} );
		} );
	}

	expandMenus() {
		const self = this;
		self._ensureMetaViewOnMobile();
		self._switchToMetaiFrame();
		return self.driver.sleep( self.shortSleepMS ).then( () => {
			return driverHelper.clickWhenClickable( self.driver, by.css( 'li#accordion-panel-nav_menus' ) ).then( () => {
				return self._switchToDefaultContent();
			} );
		} );
	}

	expandWidgets() {
		const self = this;
		self._ensureMetaViewOnMobile();
		self._switchToMetaiFrame();
		return self.driver.sleep( self.shortSleepMS ).then( () => {
			return driverHelper.clickWhenClickable( self.driver, by.css( 'li#accordion-panel-widgets' ) ).then( () => {
				return self._switchToDefaultContent();
			} );
		} );
	}

	expandStaticFrontPage() {
		const self = this;
		self._ensureMetaViewOnMobile();
		self._switchToMetaiFrame();
		return self.driver.sleep( self.shortSleepMS ).then( () => {
			return driverHelper.clickWhenClickable( self.driver, by.css( 'li#accordion-section-static_front_page' ) ).then( () => {
				return self._switchToDefaultContent();
			} );
		} );
	}

	expandHeaderImage() {
		const self = this;
		self._ensureMetaViewOnMobile();
		self._switchToMetaiFrame();
		return self.driver.sleep( self.shortSleepMS ).then( () => {
			return driverHelper.clickWhenClickable( self.driver, by.css( 'li#accordion-section-header_image' ) ).then( () => {
				return self._switchToDefaultContent();
			} );
		} );
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

	chooseFirstBaseFont() {
		const baseFontDropDownSelector = by.css( 'div[data-font-type=\'body-text\'] + div' );
		const firstFontSelector = by.css( 'div[data-font-type=\'body-text\'] + div #font-select .jetpack-fonts__option' );
		this._ensureMetaViewOnMobile();
		this._switchToMetaiFrame();
		driverHelper.clickWhenClickable( this.driver, baseFontDropDownSelector );
		this.driver.wait( ( ) => {
			return this.driver.findElement( firstFontSelector ).getText() !== '';
		}, this.explicitWaitMS, 'Could not locate the first font option that contains text' );
		const fontName = this.driver.findElement( firstFontSelector ).getText();
		driverHelper.clickWhenClickable( this.driver, firstFontSelector );
		this._switchToDefaultContent();
		return fontName;
	}

	setHeaderImage( fileDetails ) {
		const self = this;
		self._ensureMetaViewOnMobile();
		self._switchToMetaiFrame();
		driverHelper.clickWhenClickable( self.driver, by.css( 'button#header_image-button' ) ); // add new image
		driverHelper.clickWhenClickable( self.driver, by.css( '.media-modal .media-router .media-menu-item' ) ); //upload files tab
		self.driver.findElement( by.css( 'input[type="file"]' ) ).sendKeys( fileDetails.file );
		self.driver.wait( elementIsNotPresent( '.media-uploader-status.uploading' ), this.explicitWaitMS, 'The uploading status is still present' );
		driverHelper.clickWhenClickable( self.driver, by.css( '.media-toolbar-primary button' ) ); //select and crop
		return driverHelper.clickWhenClickable( self.driver, by.css( 'button.media-button-insert' ) ); //crop image
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

	addNewMenuAndSetAsPrimary( menuName ) {
		this._ensureMetaViewOnMobile();
		this._switchToMetaiFrame();
		driverHelper.clickWhenClickable( this.driver, by.css( '#accordion-section-add_menu button.add-new-menu-item' ) );
		driverHelper.setWhenSettable( this.driver, by.css( '#accordion-section-add_menu input.menu-name-field' ), menuName );
		driverHelper.clickWhenClickable( this.driver, by.css( '#accordion-section-add_menu button#create-new-menu-submit' ) );
		driverHelper.clickWhenClickable( this.driver, by.css( 'li.open ul.menu input[data-location-id="primary"]' ) );
		return driverHelper.clickWhenClickable( this.driver, this.backSelector );
	}

	addNewSidebarTextWidget( widgetTitle, widgetContent ) {
		const addWidgetSelector = by.css( 'li.open button.add-new-widget' );
		this._ensureMetaViewOnMobile();
		this._switchToMetaiFrame();
		this.driver.sleep( 5000 ); // for some reason this is necessary
		driverHelper.clickWhenClickable( this.driver, by.css( 'li#accordion-section-sidebar-widgets-sidebar-1' ) );
		this.driver.sleep( 2000 ); // for some reason this is necessary
		driverHelper.waitTillPresentAndDisplayed( this.driver, addWidgetSelector );
		driverHelper.clickWhenClickable( this.driver, addWidgetSelector );
		driverHelper.clickWhenClickable( this.driver, by.css( '#widget-tpl-text-1' ) );
		driverHelper.setWhenSettable( this.driver, by.css( 'li.expanded input.widefat' ), widgetTitle );
		driverHelper.setWhenSettable( this.driver, by.css( 'li.expanded textarea.widefat' ), widgetContent );
		return driverHelper.clickWhenClickable( this.driver, by.css( 'li.expanded .widget-control-close' ) );
	}

	chooseStaticFrontPage() {
		this._ensureMetaViewOnMobile();
		this._switchToMetaiFrame();
		driverHelper.clickWhenClickable( this.driver, by.css( 'input[type=\'radio\'][value=\'page\']' ) );
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
		}, () => {
			return false;
		} );
		this._switchToDefaultContent();
		return present;
	}

	menuDisplayedAsPrimary( menuName ) {
		let present = false;
		this._ensureMetaViewOnMobile();
		this._switchToMetaiFrame();

		present = this.driver.wait( until.elementLocated( by.xpath( `//h3[contains(text(), '${ menuName }')]/span[contains(text(), 'Primary')]` ) ), this.explicitWaitMS ).then( () => {
			return true;
		}, ( ) => {
			return false;
		} );
		this._switchToDefaultContent();
		return present;
	}

	frontPageOptionDisplayed() {
		let present = false;
		this._ensureMetaViewOnMobile();
		this._switchToMetaiFrame();

		present = this.driver.wait( until.elementLocated( by.css( 'select#_customize-dropdown-pages-page_on_front' ) ), this.explicitWaitMS ).then( () => {
			return true;
		}, ( ) => {
			return false;
		} );
		this._switchToDefaultContent();
		return present;
	}

	postsPageOptionDisplayed() {
		let present = false;
		this._ensureMetaViewOnMobile();
		this._switchToMetaiFrame();

		present = this.driver.wait( until.elementLocated( by.css( 'select#_customize-dropdown-pages-page_for_posts' ) ), this.explicitWaitMS ).then( () => {
			return true;
		}, ( ) => {
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

	previewShowsHeader( fileDetails ) {
		this.driver.sleep( 2000 ); //This is required to show the custom header
		this._ensurePreviewViewOnMobile();
		this._switchToPreviewiFrame();
		const visible = this.driver.wait( until.elementLocated( by.css( `div.header-image img[src$='${ fileDetails.fileName }']` ) ), this.explicitWaitMS ).then( () => {
			return true;
		}, ( ) => {
			return false;
		} );
		this._switchToDefaultContent();
		return visible;
	}

	previewShowsWidget( widgetTitle, widgetContent ) {
		this.driver.sleep( 2000 ); //This is required to show the custom header
		const selector = by.xpath( `//h2[normalize-space(text())="${widgetTitle}"]/following-sibling::div[normalize-space(text())="${widgetContent}"]` );
		this._ensurePreviewViewOnMobile();
		this._switchToPreviewiFrame();
		const visible = driverHelper.isEventuallyPresentAndDisplayed( this.driver, selector );
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

	waitForPreviewRefresh() {
		const self = this;
		self._ensurePreviewViewOnMobile();
		self._switchToPreviewiFrame();
		return self.driver.wait( ( ) => {
			return self.driver.isElementPresent( by.css( 'body.wp-customizer-unloading' ) );
		}, self.explicitWaitMS, 'The body unloading element is still present after waiting for the preview to refresh' );
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
					driverHelper.clickWhenClickable( driver, by.css( 'button.customize-controls-preview-toggle' ) );
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
					driverHelper.clickWhenClickable( driver, by.css( 'button.customize-controls-preview-toggle' ) );
				}
			} );
			return this._switchToDefaultContent();
		}
	}
}
