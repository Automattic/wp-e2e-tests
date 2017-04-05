import { By, until } from 'selenium-webdriver';
import * as driverHelper from '../driver-helper.js';
import BaseContainer from '../base-container.js';

export default class PostEditorSidebarComponent extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.post-editor__sidebar' ) );
		this.publicizeMessageSelector = By.css( 'div.editor-sharing__message-input textarea' );
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

	addNewCategory( category ) {
		const addNewCategoryButtonSelector = By.css( 'div.editor-categories-tags__accordion button.button' );
		const categoryNameInputSelector = By.css( 'div.dialog__content input[type=text]' );
		const saveCategoryButtonSelector = By.css( 'div.dialog__action-buttons button.is-primary' );
		const driver = this.driver;

		driverHelper.waitTillPresentAndDisplayed( driver, addNewCategoryButtonSelector );
		driverHelper.clickWhenClickable( driver, addNewCategoryButtonSelector );

		driverHelper.waitTillPresentAndDisplayed( driver, categoryNameInputSelector );
		driverHelper.waitForFieldClearable( driver, categoryNameInputSelector );
		driverHelper.setWhenSettable( driver, categoryNameInputSelector, category );

		driverHelper.waitTillPresentAndDisplayed( driver, saveCategoryButtonSelector );
		return driverHelper.clickWhenClickable( driver, saveCategoryButtonSelector );
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
		const twitterAccountSelector = By.xpath( `//h5[text()='Twitter']/..//label` );
		this.driver.wait( until.elementLocated( twitterAccountSelector ), this.explicitWaitMS, 'Could not locate a twitter account configured to share' );
		return this.driver.findElement( twitterAccountSelector ).getText();
	}

	publicizeMessagePlaceholder() {
		return this.driver.findElement( this.publicizeMessageSelector ).getAttribute( 'placeholder' );
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

	setVisibilityToPrivate() {
		let visibilitySelector;
		const driver = this.driver;
		this._expandOrCollapseSection( 'status', true );
		visibilitySelector = By.css( '.editor-visibility button' );
		driverHelper.clickWhenClickable( driver, visibilitySelector );
		driverHelper.clickWhenClickable( driver, By.css( 'input[value=private]' ) );
		return driverHelper.clickWhenClickable( driver, By.css( '.dialog button.is-primary' ) ); //Click Yes to publish
	}

	setVisibilityToPasswordProtected( password ) {
		let visibilitySelector;
		const driver = this.driver;
		this._expandOrCollapseSection( 'status', true );
		visibilitySelector = By.css( '.editor-visibility button' );
		driverHelper.clickWhenClickable( driver, visibilitySelector );
		driverHelper.clickWhenClickable( driver, By.css( 'input[value=password]' ) );
		return driverHelper.setWhenSettable( driver, By.css( 'div.editor-visibility__dialog input[type=text]' ), password, { secureValue: true } );
	}

	trashPost() {
		const trashSelector = By.css( 'button.editor-delete-post__button' );
		driverHelper.waitTillPresentAndDisplayed( this.driver, trashSelector );
		driverHelper.clickWhenClickable( this.driver, trashSelector );
		return driverHelper.clickWhenClickable( this.driver, By.css( '.dialog button.is-primary' ) );
	}

	_expandOrCollapseSection( sectionName, expand = true ) {
		let headerSelector;
		let toggleSelector;
		if ( sectionName === 'status' ) {
			headerSelector = By.css( 'div.accordion' );
			toggleSelector = By.css( 'div.accordion button.accordion__toggle' );
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
