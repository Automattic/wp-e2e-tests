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

	expandSectionNamed( sectionName ) {
		const self = this;
		const sectionSelector = by.xpath( `//div[text()="${sectionName}"]/../../../..` );
		self.driver.findElement( sectionSelector ).then( ( sectionElement ) => {
			sectionElement.getAttribute( 'class' ).then( ( classes ) => {
				if ( classes.indexOf( 'is-expanded' ) === -1 ) {
					return driverHelper.clickWhenClickable( self.driver, sectionSelector );
				}
			} );
		} );
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

}
