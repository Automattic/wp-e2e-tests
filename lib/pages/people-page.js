/** @format */

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
		this.successNoticeSelector = By.css( '.people-notices__notice.notice.is-success' );
	}

	selectTeam() {
		DriverHelper.ensureMobileMenuOpen( this.driver );
		return DriverHelper.clickWhenClickable(
			this.driver,
			By.css( '.section-nav-tabs__list a[href*=team]' )
		);
	}

	selectViewers() {
		DriverHelper.ensureMobileMenuOpen( this.driver );
		DriverHelper.clickWhenClickable(
			this.driver,
			By.css( '.section-nav-tabs__list a[href*=viewers]' )
		);
		return this.waitForSearchResults();
	}

	selectEmailFollowers() {
		DriverHelper.ensureMobileMenuOpen( this.driver );
		return DriverHelper.clickWhenClickable(
			this.driver,
			By.css( '.section-nav-tabs__list a[href*=email-followers]' )
		);
	}

	selectFollowers() {
		DriverHelper.ensureMobileMenuOpen( this.driver );
		return DriverHelper.clickWhenClickable(
			this.driver,
			By.css( '.section-nav-tabs__list a[href*="people/followers"]' )
		);
	}

	emptyUsers() {
		var d = webdriver.promise.defer();
		var self = this;

		DriverHelper.isElementPresent(
			this.driver,
			By.css( '.people-list-section-header span.count' )
		).then( function( present ) {
			if ( present ) {
				self.driver
					.findElement( webdriver.By.css( '.people-list-section-header span.count' ) )
					.getText()
					.then( function( numItems ) {
						var flow = self.driver.controlFlow();
						var promiseArray = [];
						for ( let i = 0; i < parseInt( numItems.replace( /,/, '' ) ); i++ ) {
							promiseArray.push(
								flow.execute( function() {
									self.removeUser( self );
								} )
							);
						}
						webdriver.promise.all( promiseArray ).then( function() {
							d.fulfill( true );
						} );
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

		DriverHelper.clickWhenClickable( self.driver, removeButton ).then( function() {
			DriverHelper.clickWhenClickable( self.driver, confirmRemove ).then( function() {
				d.fulfill();
			} );
		} );

		return d.promise;
	}

	viewerDisplayed( username ) {
		let viewers = this.driver.findElements(
			By.css( '.people-list-item .people-profile__username' )
		);

		return webdriver.promise
			.filter( viewers, function( viewer ) {
				return viewer.getText().then( function( text ) {
					return text === username;
				} );
			} )
			.then( function( filteredViewers ) {
				return filteredViewers.length === 1;
			} );
	}

	/**
	 * Removes the given user from the currently displayed list
	 * @param {string} username The username to remove
	 * @returns {Promise} Promise from the click action
	 */
	removeUserByName( username ) {
		let viewers = this.driver.findElements( By.css( '.people-list-item' ) );

		webdriver.promise
			.filter( viewers, function( viewer ) {
				return viewer
					.findElement( By.css( '.people-profile__username' ) )
					.then( profileUsernameElement => profileUsernameElement.getText() )
					.then( text => text === username );
			} )
			.then( function( filteredViewers ) {
				if ( filteredViewers.length !== 1 ) {
					throw new Error( `The username '${ username }' is not displayed as a viewer to remove` );
				}
				return filteredViewers[ 0 ]
					.findElement( By.css( '.people-list-item__remove-button' ) )
					.click();
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
		this.driver
			.findElement( this.searchButtonSelector )
			.getAttribute( 'class' )
			.then( classNames => {
				if ( classNames.includes( 'is-open' ) === false ) {
					return DriverHelper.clickWhenClickable( this.driver, this.searchButtonSelector );
				}
			} );
		return this.driver.wait(
			until.elementLocated( this.searchInputSelector ),
			this.explicitWaitMS,
			'Could not locate the person search input field'
		);
	}

	waitForSearchResults() {
		const driver = this.driver;
		const searchResultsLoadingSelector = this.searchResultsLoadingSelector;
		return driver.wait(
			function() {
				return DriverHelper.isElementPresent( driver, searchResultsLoadingSelector ).then(
					present => {
						return ! present;
					}
				);
			},
			this.explicitWaitMS,
			'The search results are still loading when they should have finished.'
		);
	}

	cancelSearch() {
		const cancelSelector = By.css( 'div[aria-label="Close Search"] svg' );
		return DriverHelper.clickWhenClickable( this.driver, cancelSelector );
	}

	numberSearchResults() {
		return this.driver.findElements( this.peopleListItemSelector ).then( peopleItems => {
			return peopleItems.length;
		} );
	}

	selectOnlyPersonDisplayed() {
		return DriverHelper.clickWhenClickable( this.driver, this.peopleListItemSelector );
	}

	removeOnlyEmailFollowerDisplayed() {
		DriverHelper.clickWhenClickable( this.driver, By.css( '.people-list-item__remove-button' ) );
		return DriverHelper.clickWhenClickable( this.driver, By.css( '.dialog button.is-primary' ) );
	}

	successNoticeDisplayed() {
		return DriverHelper.isElementPresent( this.driver, this.successNoticeSelector );
	}

	inviteUser() {
		return DriverHelper.clickWhenClickable(
			this.driver,
			By.css( '.people-list-section-header__add-button' )
		);
	}
}
