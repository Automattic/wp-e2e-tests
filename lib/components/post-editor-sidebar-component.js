/** @format */

import { By, until } from 'selenium-webdriver';
import * as driverHelper from '../driver-helper.js';
import BaseContainer from '../base-container.js';

export default class PostEditorSidebarComponent extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.editor-sidebar' ) );
		this.publicizeMessageSelector = By.css( 'div.editor-sharing__message-input textarea' );
		this.visibilitySelector = By.css( '.editor-sidebar .editor-visibility__dropdown' );
		this.displayComponentIfNecessary();
	}

	displayComponentIfNecessary() {
		const contentSelector = By.css( 'div.is-section-post-editor' );
		const cogSelector = By.css( 'button.editor-ground-control__toggle-sidebar' );
		driverHelper.waitTillPresentAndDisplayed( this.driver, contentSelector );
		this.driver
			.findElement( contentSelector )
			.getAttribute( 'class' )
			.then( c => {
				if ( c.indexOf( 'focus-sidebar' ) < 0 ) {
					driverHelper.clickWhenClickable( this.driver, cogSelector );
				}
			} );
	}

	hideComponentIfNecessary() {
		const contentSelector = By.css( 'div.is-section-post-editor' );
		const cogSelector = By.css( 'button.editor-ground-control__toggle-sidebar' );
		driverHelper.waitTillPresentAndDisplayed( this.driver, contentSelector );
		return this.driver
			.findElement( contentSelector )
			.getAttribute( 'class' )
			.then( c => {
				if ( c.indexOf( 'focus-sidebar' ) !== -1 ) {
					return driverHelper.clickWhenClickable( this.driver, cogSelector );
				}
			} );
	}

	expandCategoriesAndTags() {
		return this._expandOrCollapseSection( 'categories-tags', true );
	}

	closeCategoriesAndTags() {
		return this._expandOrCollapseSection( 'categories-tags', false );
	}

	expandSharingSection() {
		return this._expandOrCollapseSection( 'sharing', true );
	}

	closeSharingSection() {
		return this._expandOrCollapseSection( 'sharing', false );
	}

	expandStatusSection() {
		return this._expandOrCollapseSection( 'status', true );
	}

	closeStatusSection() {
		return this._expandOrCollapseSection( 'status', false );
	}

	expandMoreOptions() {
		return this._expandOrCollapseSection( 'more-options', true );
	}

	closeMoreOptions() {
		return this._expandOrCollapseSection( 'more-options', false );
	}

	expandFeaturedImage() {
		return this._expandOrCollapseSection( 'featured-image', true );
	}

	closeFeaturedImage() {
		return this._expandOrCollapseSection( 'featured-image', false );
	}

	expandPageOptions() {
		return this._expandOrCollapseSection( 'page-options', true );
	}

	closePageOptions() {
		return this._expandOrCollapseSection( 'page-options', false );
	}

	expandStatusSection() {
		return this._expandOrCollapseSection( 'status', true );
	}

	closeStatusSection() {
		this.driver.executeScript( 'window.scrollTo(0,0);' );
		return this._expandOrCollapseSection( 'status', false );
	}

	expandPostFormat() {
		return this._expandOrCollapseSection( 'post-format', true );
	}

	closePostFormat() {
		return this._expandOrCollapseSection( 'post-format', false );
	}

	addNewCategory( category ) {
		const addNewCategoryButtonSelector = By.css(
			'div.editor-categories-tags__accordion button.button'
		);
		const categoryNameInputSelector = By.css( 'div.dialog__content input[type=text]' );
		const saveCategoryButtonSelector = By.css( 'div.dialog__action-buttons button.is-primary' );
		const driver = this.driver;

		driverHelper.clickWhenClickable( driver, addNewCategoryButtonSelector, this.explicitWaitMS );
		driverHelper.waitForFieldClearable( driver, categoryNameInputSelector, this.explicitWaitMS );
		driver.sleep( 500 );
		driverHelper.setWhenSettable( driver, categoryNameInputSelector, category );
		driverHelper.clickWhenClickable( driver, saveCategoryButtonSelector );
		driver.sleep( 500 );

		driverHelper.waitTillNotPresent( this.driver, saveCategoryButtonSelector );
	}

	getCategoriesAndTags() {
		const categoriesAndTagsSelector = By.css(
			'.editor-categories-tags__accordion span.accordion__subtitle'
		);

		return this.driver.findElement( categoriesAndTagsSelector ).getText();
	}

	addNewTag( tag ) {
		const tagEntrySelector = By.css( 'input.token-field__input' );

		driverHelper.waitForFieldClearable( this.driver, tagEntrySelector, this.explicitWaitMS );
		return this.driver.findElement( tagEntrySelector ).sendKeys( tag + '\n' );
	}

	setCommentsForPost( allow = true ) {
		const selector = By.css( 'input[name=comment_status]' );
		return this._clickIfNeeded( allow, selector );
	}

	setSharingButtons( allow = true ) {
		const selector = By.css( 'input[name=sharing_enabled]' );
		return this._clickIfNeeded( allow, selector );
	}

	_clickIfNeeded( allow, selector ) {
		return this.driver
			.findElement( selector )
			.isEnabled()
			.then( enabled => {
				if ( ( allow && ! enabled ) || ( ! allow && enabled ) ) {
					return driverHelper.clickWhenClickable( this.driver, selector );
				}
			} );
	}

	publicizeToTwitterAccountDisplayed() {
		const twitterAccountSelector = By.css( 'span[data-e2e-service="Twitter"]' );
		this.driver.wait(
			until.elementLocated( twitterAccountSelector ),
			this.explicitWaitMS,
			'Could not locate a twitter account configured to share'
		);
		return this.driver.findElement( twitterAccountSelector ).getText();
	}

	publicizeMessagePlaceholder() {
		return this.driver.findElement( this.publicizeMessageSelector ).getAttribute( 'placeholder' );
	}

	publicizeMessageDisplayed() {
		return this.driver.findElement( this.publicizeMessageSelector ).getAttribute( 'value' );
	}

	setPublicizeMessage( message ) {
		return driverHelper.setWhenSettable( this.driver, this.publicizeMessageSelector, message );
	}

	revertToDraft() {
		let revertDraftSelector = By.css( 'button.edit-post-status__revert-to-draft' );
		this._expandOrCollapseSection( 'status', true );
		driverHelper.waitTillPresentAndDisplayed( this.driver, revertDraftSelector );
		driverHelper.clickWhenClickable( this.driver, revertDraftSelector );
	}

	setVisibilityToPrivate() {
		const valueSelector = By.css(
			'.editor-sidebar a.select-dropdown__item[data-bold-text="private"]'
		);

		this._expandOrCollapseSection( 'status', true );
		driverHelper.clickWhenClickable( this.driver, this.visibilitySelector );
		driverHelper.clickWhenClickable( this.driver, valueSelector );
		return driverHelper.clickWhenClickable( this.driver, By.css( '.dialog button.is-primary' ) ); //Click Yes to publish
	}

	setVisibilityToPasswordProtected( password ) {
		const valueSelector = By.css(
			'.editor-sidebar a.select-dropdown__item[data-bold-text="password"]'
		);
		const passwordEntrySelector = By.css( '.editor-sidebar .editor-fieldset input[type="text"]' );

		this._expandOrCollapseSection( 'status', true );
		driverHelper.clickWhenClickable( this.driver, this.visibilitySelector );
		driverHelper.clickWhenClickable( this.driver, valueSelector );
		return driverHelper.setWhenSettable( this.driver, passwordEntrySelector, password, {
			secureValue: true,
		} );
	}

	trashPost() {
		const trashSelector = By.css( 'button.editor-delete-post__button' );
		const confirmationSelector = By.css( 'button[data-e2e-button="accept"]' );
		const doNotRestoreSelector = By.css( 'div.dialog__action-buttons button:not(.is-primary)' );

		driverHelper.waitTillPresentAndDisplayed( this.driver, trashSelector );
		driverHelper.clickWhenClickable( this.driver, trashSelector );

		driverHelper.clickWhenClickable( this.driver, confirmationSelector );
		driverHelper.waitTillNotPresent( this.driver, confirmationSelector );

		driverHelper.waitTillPresentAndDisplayed( this.driver, doNotRestoreSelector );
		return driverHelper.clickWhenClickable( this.driver, doNotRestoreSelector );
	}

	openFeaturedImageDialog() {
		const setButtonSelector = By.css(
			'[data-e2e-title="featured-image"] .editor-drawer-well__placeholder'
		);
		driverHelper.waitTillPresentAndDisplayed( this.driver, setButtonSelector );
		return driverHelper.clickWhenClickable( this.driver, setButtonSelector );
	}

	removeFeaturedImage() {
		const removeButtonSelector = By.css( '[data-e2e-title="featured-image"] button.remove-button' );
		driverHelper.waitTillPresentAndDisplayed( this.driver, removeButtonSelector );
		return driverHelper.clickWhenClickable( this.driver, removeButtonSelector );
	}

	// Selects the first day of the second week of next month - to (hopefully) always select a future date on the calendar
	chooseFutureDate() {
		const nextMonthSelector = By.css( '.date-picker__next-month' );
		const firstDayOfSecondWeekSelector = By.css(
			'.DayPicker-Body .DayPicker-Week:nth-of-type(2) .DayPicker-Day'
		);
		this._openClosePostDateSelector( { shouldOpen: true } );
		driverHelper.clickWhenClickable( this.driver, nextMonthSelector );
		return driverHelper.clickWhenClickable( this.driver, firstDayOfSecondWeekSelector );
	}

	getSelectedPublishDate() {
		const publishDateSelector = By.css( '.edit-post-status .editor-publish-date__header-chrono' );
		driverHelper.waitTillPresentAndDisplayed( this.driver, publishDateSelector );
		return this.driver.findElement( publishDateSelector ).getText();
	}

	_openClosePostDateSelector( { shouldOpen = true } = {} ) {
		const postDateDropdownSelector = By.css( '.editor-sidebar .editor-publish-date' );
		driverHelper.waitTillPresentAndDisplayed( this.driver, postDateDropdownSelector );
		return this.driver
			.findElement( postDateDropdownSelector )
			.getAttribute( 'class' )
			.then( elementClasses => {
				const currentlyOpen = elementClasses.indexOf( 'is-open' ) > -1;
				if ( ( shouldOpen && ! currentlyOpen ) || ( ! shouldOpen && currentlyOpen ) ) {
					return driverHelper.clickWhenClickable( this.driver, postDateDropdownSelector );
				}
			} );
	}

	_expandOrCollapseSection( sectionName, expand = true ) {
		const headerSelector = By.css( `div[data-e2e-title="${ sectionName }"]` );
		const toggleSelector = By.css(
			`div[data-e2e-title="${ sectionName }"] button.accordion__toggle`
		);

		driverHelper.waitTillPresentAndDisplayed( this.driver, headerSelector );
		return this.driver
			.findElement( headerSelector )
			.getAttribute( 'class' )
			.then( c => {
				if ( expand && c.indexOf( 'is-expanded' ) < 0 ) {
					return driverHelper.clickWhenClickable( this.driver, toggleSelector );
				}
				if ( ! expand && c.indexOf( 'is-expanded' ) > -1 ) {
					return driverHelper.clickWhenClickable( this.driver, toggleSelector );
				}
			} );
	}
}
