/** @format */

import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../async-base-container';

import * as DriverHelper from '../driver-helper.js';

export default class PeoplePage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.people-selector__infinite-list' ) );
		this.searchButtonSelector = By.css( '.section-nav__panel div.search' );
		this.searchInputSelector = By.css( '.section-nav__panel input.search__input' );
		this.searchResultsLoadingSelector = By.css( '.people-profile.is-placeholder' );
		this.peopleListItemSelector = By.css( '.people-list-item' );
		this.successNoticeSelector = By.css( '.people-notices__notice.notice.is-success' );
	}

	async selectTeam() {
		await DriverHelper.ensureMobileMenuOpen( this.driver );
		return await DriverHelper.clickWhenClickable(
			this.driver,
			By.css( '.section-nav-tabs__list a[href*=team]' )
		);
	}

	async selectViewers() {
		await DriverHelper.ensureMobileMenuOpen( this.driver );
		await DriverHelper.clickWhenClickable(
			this.driver,
			By.css( '.section-nav-tabs__list a[href*=viewers]' )
		);
		return this.waitForSearchResults();
	}

	async selectEmailFollowers() {
		await DriverHelper.ensureMobileMenuOpen( this.driver );
		return await DriverHelper.clickWhenClickable(
			this.driver,
			By.css( '.section-nav-tabs__list a[href*=email-followers]' )
		);
	}

	async selectFollowers() {
		await DriverHelper.ensureMobileMenuOpen( this.driver );
		return await DriverHelper.clickWhenClickable(
			this.driver,
			By.css( '.section-nav-tabs__list a[href*="people/followers"]' )
		);
	}

	async selectInvites() {
		await DriverHelper.ensureMobileMenuOpen( this.driver );
		return await DriverHelper.clickWhenClickable(
			this.driver,
			By.css( '.section-nav-tabs__list a[href*="people/invites"]' )
		);
	}

	// TODO: Remove this https://github.com/Automattic/wp-e2e-tests/issues/1264
	async viewerDisplayed( username ) {
		let viewers = await this.driver.findElements(
			By.css( '.people-list-item .people-profile__username' )
		);

		for ( let i = 0; i < viewers.length; i++ ) {
			let viewer = await viewers[ i ].getText();
			if ( viewer === username ) {
				return true;
			}
		}
		return false;
	}

	// TODO: Remove this https://github.com/Automattic/wp-e2e-tests/issues/1264
	async removeUserByName( username ) {
		let viewers = await this.driver.findElements( By.css( '.people-list-item' ) );

		for ( let i = 0; i < viewers.length; i++ ) {
			let viewer = await viewers[ i ]
				.findElement( By.css( '.people-profile__username' ) )
				.getText();
			if ( viewer === username ) {
				await viewers[ i ].findElement( By.css( '.people-list-item__remove-button' ) ).click();
				return await DriverHelper.clickWhenClickable(
					this.driver,
					By.css( '.dialog button.is-primary' )
				);
			}
		}
		throw new Error( `The username '${ username }' is not displayed as a viewer to remove` );
	}

	async searchForUser( username ) {
		// This has to be a username without the @
		await this.ensureSearchOpened();
		await DriverHelper.setWhenSettable( this.driver, this.searchInputSelector, username );
		return await this.waitForSearchResults();
	}

	async ensureSearchOpened() {
		const searchElement = await this.driver.findElement( this.searchButtonSelector );
		const classNames = await searchElement.getAttribute( 'class' );
		if ( classNames.includes( 'is-open' ) === false ) {
			await DriverHelper.clickWhenClickable( this.driver, this.searchButtonSelector );
		}
		return await DriverHelper.waitTillPresentAndDisplayed( this.driver, this.searchInputSelector );
	}

	async waitForSearchResults() {
		return await DriverHelper.waitTillNotPresent( this.driver, this.searchResultsLoadingSelector );
	}

	async numberSearchResults() {
		let peopleItems = await this.driver.findElements( this.peopleListItemSelector );
		return peopleItems.length;
	}

	async selectOnlyPersonDisplayed() {
		return await DriverHelper.clickWhenClickable( this.driver, this.peopleListItemSelector );
	}

	async successNoticeDisplayed() {
		return DriverHelper.isEventuallyPresentAndDisplayed( this.driver, this.successNoticeSelector );
	}

	async inviteUser() {
		return await DriverHelper.clickWhenClickable(
			this.driver,
			By.css( '.people-list-section-header__add-button' )
		);
	}

	async pendingInviteDisplayedFor( emailAddress ) {
		return DriverHelper.isEventuallyPresentAndDisplayed(
			this.driver,
			By.css( `.people-invites__pending .people-profile__username[title="${ emailAddress }"]` )
		);
	}

	async goToRevokeInvitePage( emailAddress ) {
		return await DriverHelper.clickWhenClickable(
			this.driver,
			By.css( `.people-invites__pending .people-profile__username[title="${ emailAddress }"]` )
		);
	}
}
