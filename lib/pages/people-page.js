import { By, until } from 'selenium-webdriver';
import webdriver from 'selenium-webdriver';
import BaseContainer from '../base-container.js';

import * as DriverHelper from '../driver-helper.js';

export default class PeoplePage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.people-selector__infinite-list' ) );
		this.searchButtonSelector = By.css( '.section-nav__panel div.search' );
		this.searchInputSelector = By.css( '.section-nav__panel input.search__input' );
		this.searchResultsLoadingSelector = By.css( '.people-profile.is-placeholder' );
		this.peopleListItemSelector = By.css( '.people-list-item' );
		this.successNoticeSelector = By.css( '.people-notice.notice.is-success' );
	}

	selectTeam() {
		this.ensureMobileMenuOpen();
		return DriverHelper.clickWhenClickable( this.driver, By.css( '.section-nav-tabs__list a[href*=team]' ) );
	}

	selectViewers() {
		this.ensureMobileMenuOpen();
		DriverHelper.clickWhenClickable( this.driver, By.css( '.section-nav-tabs__list a[href*=viewers]' ) );
		return this.waitForSearchResults();
	}

	selectEmailFollowers() {
		this.ensureMobileMenuOpen();
		return DriverHelper.clickWhenClickable( this.driver, By.css( '.section-nav-tabs__list a[href*=email-followers]' ) );
	}

	ensureMobileMenuOpen() {
		const driver = this.driver;
		const mobileHeaderSelector = By.css( '.section-nav__mobile-header' );
		driver.findElement( mobileHeaderSelector ).isDisplayed().then( ( mobileDisplayed ) => {
			if ( mobileDisplayed ) {
				driver.findElement( By.css( '.section-nav.has-pinned-items' ) ).getAttribute( 'class' ).then( ( classNames ) => {
					if ( classNames.includes( 'is-open' ) === false ) {
						DriverHelper.clickWhenClickable( driver, mobileHeaderSelector );
					}
				} );
			}
		} );
	}

	viewerDisplayed( username ) {
		let viewers = this.driver.findElements( By.css( 'a.people-list-item' ) );

		return webdriver.promise.filter( viewers, function( viewer ) {
			return viewer.getText().then( function( text ) {
				return text === `${username}\n@${username}\nREMOVE`;
			} );
		} ).then( function( filteredViewers ) {
			return (filteredViewers.length === 1);
		} );
	}

	removeViewer( username ) {
		let viewers = this.driver.findElements( By.css( 'a.people-list-item' ) );

		webdriver.promise.filter( viewers, function( viewer ) {
			return viewer.getText().then( function( text ) {
				return text === `${username}\n@${username}\nREMOVE`;
			} );
		} ).then( function( filteredViewers ) {
			if ( filteredViewers.length !== 1 ) {
				throw new Error( `The username '${username}' is not displayed as a viewer to remove` );
			}
			return filteredViewers[0].findElement( By.css( '.people-list-item__remove-button' ) ).click();
		} );
		return DriverHelper.clickWhenClickable( this.driver, By.css( '.dialog button.is-primary' ) );
	}

	searchForUser( username ) {
		// This has to be a username without the @
		this.ensureSearchOpened();
		DriverHelper.setWhenSettable( this.driver, this.searchInputSelector, username );
		this.waitForSearchResults();
	}

	ensureSearchOpened() {
		this.driver.findElement( this.searchButtonSelector ).getAttribute( 'class' ).then( ( classNames ) => {
			if ( classNames.includes( 'is-open' ) === false ) {
				return DriverHelper.clickWhenClickable( this.driver, this.searchButtonSelector );
			}
		} );
		return this.driver.wait( until.elementLocated( this.searchInputSelector ), this.explicitWaitMS, 'Could not locate the person search input field' );
	}

	waitForSearchResults() {
		const driver = this.driver;
		const searchResultsLoadingSelector = this.searchResultsLoadingSelector;
		return driver.wait( function() {
			return driver.isElementPresent( searchResultsLoadingSelector ).then( ( present ) => {
				return !present;
			} );
		}, this.explicitWaitMS, 'The search results are still loading when they should have finished.' );
	}

	numberSearchResults() {
		return this.driver.findElements( this.peopleListItemSelector ).then( ( peopleItems ) => {
			return peopleItems.length;
		} )
	}

	selectOnlyPersonDisplayed() {
		return DriverHelper.clickWhenClickable( this.driver, this.peopleListItemSelector );
	}

	removeOnlyEmailFollowerDisplayed() {
		DriverHelper.clickWhenClickable( this.driver, By.css( '.people-list-item__remove-button' ) );
		return DriverHelper.clickWhenClickable( this.driver, By.css( '.dialog button.is-primary' ) );
	}

	successNoticeDisplayed() {
		return this.driver.isElementPresent( this.successNoticeSelector );
	}

	inviteUser() {
		return DriverHelper.clickWhenClickable( this.driver, By.css( '.people-list-section-header__add-button' ) );
	}
}
