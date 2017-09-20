import config from 'config';
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
		const driver = this.driver;
		const contentSelector = By.css( 'div.is-section-post-editor' );
		const cogSelector = By.css( 'button.editor-ground-control__toggle-sidebar' );
		driverHelper.waitTillPresentAndDisplayed( driver, contentSelector );
		driver.findElement( contentSelector ).getAttribute( 'class' ).then( ( c ) => {
			if ( c.indexOf( 'focus-sidebar' ) < 0 ) {
				driverHelper.clickWhenClickable( driver, cogSelector );
			}
		} );
	}

	expandCategoriesAndTags() {
		return this._expandOrCollapseSection( 'categories-tags__accordion', true );
	}

	closeCategoriesAndTags() {
		return this._expandOrCollapseSection( 'categories-tags__accordion', false );
	}

	expandSharingSection() {
		return this._expandOrCollapseSection( 'sharing__accordion', true );
	}

	closeSharingSection() {
		return this._expandOrCollapseSection( 'sharing__accordion', false );
	}

	expandMoreOptions() {
		return this._expandOrCollapseSection( 'drawer__more-options', true );
	}

	closeMoreOptions() {
		return this._expandOrCollapseSection( 'drawer__more-options', false );
	}

	expandFeaturedImage() {
		return this._expandOrCollapseSection( 'featured-image', true );
	}

	closeFeaturedImage() {
		return this._expandOrCollapseSection( 'featured-image', false );
	}

	addNewCategory( category ) {
		const addNewCategoryButtonSelector = By.css( 'div.editor-categories-tags__accordion button.button' );
		const categoryNameInputSelector = By.css( 'div.dialog__content input[type=text]' );
		const saveCategoryButtonSelector = By.css( 'div.dialog__action-buttons button.is-primary' );
		const driver = this.driver;

		driverHelper.clickWhenClickable( driver, addNewCategoryButtonSelector, this.explicitWaitMS );
		driverHelper.waitForFieldClearable( driver, categoryNameInputSelector, this.explicitWaitMS );
		driver.sleep( 500 );
		driverHelper.setWhenSettable( driver, categoryNameInputSelector, category );
		driverHelper.clickWhenClickable( driver, saveCategoryButtonSelector );
		driver.sleep( 500 );
		return driver.wait( function() {
			return driverHelper.isElementPresent( driver, saveCategoryButtonSelector ).then( function( present ) {
				return ! present;
			}, function() {
				return false;
			} );
		}, this.explicitWaitMS, 'The add category save button is still present when it should have disappeared' );
	}

	getCategoriesAndTags() {
		const categoriesAndTagsSelector = By.css( '.editor-categories-tags__accordion span.accordion__subtitle' );

		return this.driver.findElement( categoriesAndTagsSelector ).getText();
	}

	addNewTag( tag ) {
		const tagEntrySelector = By.css( 'input.token-field__input' );

		driverHelper.waitForFieldClearable( this.driver, tagEntrySelector, this.explicitWaitMS );
		return this.driver.findElement( tagEntrySelector ).sendKeys( tag + '\n' );
	}

	setCommentsForPost( allow = true ) {
		let driver = this.driver;
		const selector = By.css( 'input[name=comment_status]' );
		return driver.findElement( selector ).isEnabled().then( function( enabled ) {
			if ( ( allow && !enabled ) || ( !allow && enabled ) ) {
				return driverHelper.clickWhenClickable( driver, selector );
			}
		} );
	}

	publicizeToTwitterAccountDisplayed() {
		const twitterAccountSelector = By.css( 'span[data-e2e-service="Twitter"]' );
		this.driver.wait( until.elementLocated( twitterAccountSelector ), this.explicitWaitMS, 'Could not locate a twitter account configured to share' );
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

	setSharingButtons( allow = true ) {
		let driver = this.driver;
		const selector = By.css( 'input[name=sharing_enabled]' );
		return driver.findElement( selector ).isEnabled().then( function( enabled ) {
			if ( ( allow && !enabled ) || ( !allow && enabled ) ) {
				return driverHelper.clickWhenClickable( driver, selector );
			}
		} );
	}

	revertToDraft() {
		let revertDraftSelector = By.css( 'button.edit-post-status__revert-to-draft' );
		this._expandOrCollapseSection( 'status', true );
		driverHelper.waitTillPresentAndDisplayed( this.driver, revertDraftSelector );
		driverHelper.clickWhenClickable( this.driver, revertDraftSelector );
	}

	setVisibilityToPrivate() {
		const driver = this.driver;
		const valueSelector = By.css( '.editor-sidebar a.select-dropdown__item[data-bold-text="private"]' );

		this._expandOrCollapseSection( 'status', true );
		driverHelper.clickWhenClickable( driver, this.visibilitySelector );
		driverHelper.clickWhenClickable( driver, valueSelector );
		return driverHelper.clickWhenClickable( driver, By.css( '.dialog button.is-primary' ) ); //Click Yes to publish
	}

	setVisibilityToPasswordProtected( password ) {
		const driver = this.driver;
		const valueSelector = By.css( '.editor-sidebar a.select-dropdown__item[data-bold-text="password"]' );
		const passwordEntrySelector = By.css( '.editor-sidebar .editor-fieldset input[type="text"]' );

		this._expandOrCollapseSection( 'status', true );
		driverHelper.clickWhenClickable( driver, this.visibilitySelector );
		driverHelper.clickWhenClickable( driver, valueSelector );
		return driverHelper.setWhenSettable( driver, passwordEntrySelector, password, { secureValue: true } );
	}

	trashPost() {
		const trashSelector = By.css( 'button.editor-delete-post__button' );
		driverHelper.waitTillPresentAndDisplayed( this.driver, trashSelector );
		driverHelper.clickWhenClickable( this.driver, trashSelector );
		return driverHelper.clickWhenClickable( this.driver, By.css( '.dialog button.is-primary' ) );
	}

	openFeaturedImageDialog() {
		const setButtonSelector = By.css( '[data-e2e-title="featured-image"] .editor-drawer-well__placeholder' );
		driverHelper.waitTillPresentAndDisplayed( this.driver, setButtonSelector );
		return driverHelper.clickWhenClickable( this.driver, setButtonSelector );
	}

	removeFeaturedImage() {
		const removeButtonSelector = By.css( '[data-e2e-title="featured-image"] .editor-drawer-well__remove' );
		driverHelper.waitTillPresentAndDisplayed( this.driver, removeButtonSelector );
		return driverHelper.clickWhenClickable( this.driver, removeButtonSelector );
	}

	_expandOrCollapseSection( sectionName, expand = true ) {
		let headerSelector;
		let toggleSelector;
		if ( sectionName === 'status' ) {
			headerSelector = By.css( 'div.accordion' );
			toggleSelector = By.css( 'div.accordion button.accordion__toggle' );
		} else if ( sectionName === 'featured-image' ) {
			headerSelector = By.css( `div[data-e2e-title="${sectionName}"]` );
			toggleSelector = By.css( `div[data-e2e-title="${sectionName}"] button.accordion__toggle` );
		} else {
			headerSelector = By.css( `div.editor-${sectionName}` );
			toggleSelector = By.css( `div.editor-${sectionName} button.accordion__toggle` );
		}
		const explicitWaitMS = this.explicitWaitMS;
		const driver = this.driver;

		driver.wait( until.elementLocated( headerSelector ), explicitWaitMS, `Could not locate the toggle to open/close: '${sectionName}'` );
		return driver.findElement( headerSelector ).getAttribute( 'class' ).then( function( c ) {
			if ( expand && c.indexOf( 'is-expanded' ) < 0 ) {
				return driverHelper.clickWhenClickable( driver, toggleSelector, explicitWaitMS );
			}
			if ( !expand && c.indexOf( 'is-expanded' ) > -1 ) {
				return driverHelper.clickWhenClickable( driver, toggleSelector, explicitWaitMS );
			}
		} );
	}
}
