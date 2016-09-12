import { By as by } from 'selenium-webdriver';
import BaseContainer from '../../base-container';

import * as driverHelper from '../../driver-helper';
import * as driverManager from '../../driver-manager';

export default class WPAdminJetpackSettingsPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '#jp-plugin-container' ) );
	}

	chooseTabNamed( tabName ) {
		const self = this;
		if ( driverManager.currentScreenSize() === 'mobile' ) {
			const dropDownSelector = by.css( '.dops-section-nav' );
			const tabSelector = by.xpath( `//span[text()="${tabName}"]` );
			self.driver.findElement( dropDownSelector ).then( ( headerElement ) => {
				headerElement.getAttribute( 'class' ).then( ( classes ) => {
					if ( classes.indexOf( 'is-open' ) === -1 ) {
						driverHelper.clickWhenClickable( self.driver, dropDownSelector );
					}
				} );
			} );
			return driverHelper.clickWhenClickable( self.driver, tabSelector );
		} else {
			const tabSelector = by.css( `a[href="#${tabName.toLowerCase()}"]` );
			return driverHelper.clickWhenClickable( self.driver, tabSelector );
		}
	}

	expandFeatureNamed( featureName ) {
		const self = this;
		const sectionSelector = by.xpath( `//div[text()="${featureName}"]/../../../..` );
		const sectionExpandSelector = by.xpath( `//div[text()="${featureName}"]/../../../..//button` );
		self.driver.findElement( sectionSelector ).then( ( sectionElement ) => {
			sectionElement.getAttribute( 'class' ).then( ( classes ) => {
				if ( classes.indexOf( 'is-expanded' ) === -1 ) {
					return driverHelper.clickWhenClickable( self.driver, sectionExpandSelector );
				}
			} );
		} );
	}

	disableFeatureNamed( featureName ) {
		const self = this;
		const featureToggleSelector = WPAdminJetpackSettingsPage._getFeatureToggleSelector( featureName );

		return self.driver.findElement( featureToggleSelector ).then( ( toggleElement ) => {
			return toggleElement.getAttribute( 'aria-checked' ).then( ( checked ) => {
				if ( checked === 'true' ) {
					driverHelper.clickWhenClickable( self.driver, featureToggleSelector );
					return self._waitAndDismissSuccessNotice();
				}
			} );
		} );
	}

	enableFeatureNamed( featureName ) {
		const self = this;
		const featureToggleSelector = WPAdminJetpackSettingsPage._getFeatureToggleSelector( featureName );
		return self.driver.findElement( featureToggleSelector ).then( ( toggleElement ) => {
			return toggleElement.getAttribute( 'aria-checked' ).then( ( checked ) => {
				if ( checked === 'false' ) {
					driverHelper.clickWhenClickable( self.driver, featureToggleSelector );
					return self._waitAndDismissSuccessNotice();
				}
			} );
		} );
	}

	followSettingsLink( featureName ) {
		const selector = by.xpath( `//div[text()="${featureName}"]/../../../..//a[@rel="external"]` );
		return driverHelper.clickWhenClickable( this.driver, selector );
	}

	saveFeatureSettings( featureName ) {
		const selector = by.xpath( `//div[text()="${featureName}"]/../../../..//button[@type="submit"]` );
		driverHelper.clickWhenClickable( this.driver, selector );
		return driverHelper.waitTillPresentAndDisplayed( this.driver, by.css( '.global-notices .is-success' ) );
	}

	linkToEmailsFollowersDisplayed( jetpackSite ) {
		const selector = by.css( `a[href="https://wordpress.com/people/email-followers/${jetpackSite}"]` );
		return driverHelper.isEventuallyPresentAndDisplayed( this.driver, selector );
	}

	disconnectJetpack() {
		const self = this;
		const disconnectSelector = by.xpath( '//button[text()="Disconnect Jetpack"]' );
		self.driver.isElementPresent( disconnectSelector ).then( ( present ) => {
			if ( present === true ) {
				driverHelper.clickWhenClickable( self.driver, disconnectSelector );
				return self.driver.switchTo().alert().then( function( alert ) {
					return alert.accept();
				} );
			}
		} );
	}

	setRelatedPostsHeader() {
		const selector = by.css( 'input[name="show_headline"]' );
		return driverHelper.setCheckbox( this.driver, selector );
	}

	unsetRelatedPostsHeader() {
		const selector = by.css( 'input[name="show_headline"]' );
		return driverHelper.unsetCheckbox( this.driver, selector );
	}

	setRelatedPostsLarge() {
		const selector = by.css( 'input[name="show_thumbnails"]' );
		return driverHelper.setCheckbox( this.driver, selector );
	}

	unsetRelatedPostsLarge() {
		const selector = by.css( 'input[name="show_thumbnails"]' );
		return driverHelper.unsetCheckbox( this.driver, selector );
	}

	chooseLikesPerPost() {
		const selector = by.xpath( '//span[text()="Turned on per post"]/..//input[@type="radio"]' );
		return driverHelper.clickWhenClickable( this.driver, selector );
	}

	chooseLikesForAllPosts() {
		const selector = by.xpath( '//span[text()="On for all posts"]/..//input[@type="radio"]' );
		return driverHelper.clickWhenClickable( this.driver, selector );
	}

	followLikeSettingsLink() {
		const self = this;
		const selector = by.xpath( '//div[text()="Likes"]/../../../..//p/a' );
		return self.driver.findElement( selector ).then( ( element ) => {
			return element.getAttribute( 'href' ).then( ( href ) => {
				return self.driver.get( href );
			} );
		} );
	}

	showAFollowBlogOptionInComments() {
		const selector = by.css( 'input[name="stb_enabled"]' );
		driverHelper.unsetCheckbox( this.driver, selector );
		return driverHelper.setCheckbox( this.driver, selector );
	}

	showAFollowCommentsOptionInComments() {
		const selector = by.css( 'input[name="stc_enabled"]' );
		driverHelper.unsetCheckbox( this.driver, selector );
		return driverHelper.setCheckbox( this.driver, selector );
	}

	static _getFeatureToggleSelector( featureName ) {
		return by.xpath( `//div[text()="${featureName}"]/../../../..//span[@class="dops-foldable-card__summary"]//span[@class="form-toggle__switch"]` );
	}

	_waitAndDismissSuccessNotice() {
		const dismissSuccessNoticeSelector = by.css( '.global-notices .is-success .dops-notice__dismiss' );
		return driverHelper.clickWhenClickable( this.driver, dismissSuccessNoticeSelector );
	}

}
