/** @format */

import { By, until } from 'selenium-webdriver';
import webdriver from 'selenium-webdriver';
import BaseContainer from '../base-container.js';

import * as driverHelper from '../driver-helper.js';

export default class PeoplePage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.people-selector__infinite-list' ) );
		this.searchButtonSelector = By.css( '.section-nav__panel div.search' );
		this.searchInputSelector = By.css( '.section-nav__panel input.search__input' );
		this.searchResultsLoadingSelector = By.css( '.people-profile.is-placeholder' );
		this.peopleListItemSelector = By.css( '.people-list-item' );
		this.successNoticeSelector = By.css( '.people-notices__notice.notice.is-success' );
	}

	selectTeam() {
		driverHelper.ensureMobileMenuOpen( this.driver );
		return driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.section-nav-tabs__list a[href*=team]' )
		);
	}

	selectViewers() {
		driverHelper.ensureMobileMenuOpen( this.driver );
		driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.section-nav-tabs__list a[href*=viewers]' )
		);
		return this.waitForSearchResults();
	}

	selectEmailFollowers() {
		driverHelper.ensureMobileMenuOpen( this.driver );
		return driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.section-nav-tabs__list a[href*=email-followers]' )
		);
	}

	selectFollowers() {
		driverHelper.ensureMobileMenuOpen( this.driver );
		return driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.section-nav-tabs__list a[href*="people/followers"]' )
		);
	}

	emptyUsers() {
		var d = webdriver.promise.defer();

		driverHelper.isElementPresent(
			this.driver,
			By.css( '.people-list-section-header span.count' )
		).then( present => {
			if ( present ) {
				this.driver
					.findElement( webdriver.By.css( '.people-list-section-header span.count' ) )
					.getText()
					.then( numItems => {
						let flow = this.driver.controlFlow();
						let promiseArray = [];
						for ( let i = 0; i < parseInt( numItems.replace( /,/, '' ) ); i++ ) {
							promiseArray.push(
								flow.execute( () => this.removeUser( this ) )
							);
						}
						webdriver.promise.all( promiseArray ).then( () => d.fulfill( true ) );
					} );
			} else {
				d.fulfill( true );
			}
		} );

		return d.promise;
	}

	removeUser( self ) {
		const removeButton = By.css( 'button.people-list-item__remove-button' );
		const confirmRemove = By.css( '.dialog__action-buttons button.is-primary' );

		let d = webdriver.promise.defer();

		driverHelper.clickWhenClickable( self.driver, removeButton )
		.then( () => driverHelper.clickWhenClickable( self.driver, confirmRemove ) )
		.then( () => d.fulfill() );

		return d.promise;
	}

	viewerDisplayed( username ) {
		let viewers = this.driver.findElements(
			By.css( '.people-list-item .people-profile__username' )
		);

		return webdriver.promise
			.filter( viewers, ( viewer => viewer.getText().then( text => text === username ) ) )
			.then( filteredViewers => filteredViewers.length === 1 );
	}

	/**
	 * Removes the given user from the currently displayed list
	 * @param {string} username The username to remove
	 * @returns {Promise} Promise from the click action
	 */
	removeUserByName( username ) {
		let viewers = this.driver.findElements( By.css( '.people-list-item' ) );

		webdriver.promise
			.filter( viewers, viewer => viewer
				.findElement( By.css( '.people-profile__username' ) )
				.then( profileUsernameElement => profileUsernameElement.getText() )
				.then( text => text === username ) )
			.then( filteredViewers => {
				if ( filteredViewers.length !== 1 ) {
					throw new Error( `The username '${ username }' is not displayed as a viewer to remove` );
				}
				return filteredViewers[ 0 ]
					.findElement( By.css( '.people-list-item__remove-button' ) )
					.click();
			} );
		return driverHelper.clickWhenClickable( this.driver, By.css( '.dialog button.is-primary' ) );
	}

	searchForUser( username ) {
		// This has to be a username without the @
		this.ensureSearchOpened();
		driverHelper.setWhenSettable( this.driver, this.searchInputSelector, username );
		this.waitForSearchResults();
	}

	ensureSearchOpened() {
		this.driver
			.findElement( this.searchButtonSelector )
			.getAttribute( 'class' )
			.then( classNames => {
				if ( classNames.includes( 'is-open' ) === false ) {
					return driverHelper.clickWhenClickable( this.driver, this.searchButtonSelector );
				}
			} );
		return this.driver.wait(
			until.elementLocated( this.searchInputSelector ),
			this.explicitWaitMS,
			'Could not locate the person search input field'
		);
	}

	waitForSearchResults() {
		const searchResultsLoadingSelector = this.searchResultsLoadingSelector;
		return driverHelper.waitTillNotPresent( this.driver, searchResultsLoadingSelector );
	}

	cancelSearch() {
		const cancelSelector = By.css( 'div[aria-label="Close Search"] svg' );
		return driverHelper.clickWhenClickable( this.driver, cancelSelector );
	}

	numberSearchResults() {
		return this.driver.findElements( this.peopleListItemSelector ).then( peopleItems => {
			return peopleItems.length;
		} );
	}

	selectOnlyPersonDisplayed() {
		return driverHelper.clickWhenClickable( this.driver, this.peopleListItemSelector );
	}

	removeOnlyEmailFollowerDisplayed() {
		driverHelper.clickWhenClickable( this.driver, By.css( '.people-list-item__remove-button' ) );
		return driverHelper.clickWhenClickable( this.driver, By.css( '.dialog button.is-primary' ) );
	}

	successNoticeDisplayed() {
		return driverHelper.isElementPresent( this.driver, this.successNoticeSelector );
	}

	inviteUser() {
		return driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.people-list-section-header__add-button' )
		);
	}
}
