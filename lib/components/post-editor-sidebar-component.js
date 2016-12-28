import { By, until } from 'selenium-webdriver';

import config from 'config';

import * as driverHelper from '../driver-helper.js';
import * as driverManager from '../driver-manager.js';

import BaseContainer from '../base-container.js';

export default class PostEditorSidebarComponent extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.post-editor__sidebar' ) );
		this.publicizeMessageSelector = By.css( 'div.editor-sharing__message-input textarea' );
		if ( driverManager.currentScreenSize() === 'mobile' ) {
			this.publishButtonSelector = By.css( '.editor-mobile-navigation .editor-publish-button' );
		} else {
			this.publishButtonSelector = By.css( '.editor-ground-control__publish-combo .editor-publish-button' )
		}
		this.switchToComponentOnMobileIfNecessary();
	}
	switchToComponentOnMobileIfNecessary() {
		const actionButtonsSelector = By.css( '.editor-mobile-navigation__tabs .gridicons-cog.editor-mobile-navigation__icon' );
		const postStatusSelector = By.css( '.editor-ground-control__status' );
		this.driver.findElement( postStatusSelector ).isDisplayed().then( ( postStatusDisplayed ) => {
			if ( postStatusDisplayed === false ) {
				driverHelper.clickWhenClickable( this.driver, actionButtonsSelector, this.explicitWaitMS );
				let postStatus = this.driver.findElement( postStatusSelector );
				this.driver.wait( until.elementIsVisible( postStatus ), this.explicitWaitMS, 'Could not locate the post status element in the editor sidebar when switching to it in mobile mode' );
			}
		} );
	}
	ensureSaved() {
		const saveSelector = By.css( 'button.editor-ground-control__save' );
		const savingSelector = By.css( 'span.editor-ground-control__saving' );
		const driver = this.driver;

		driverHelper.clickIfPresent( driver, saveSelector, 3 );

		driver.wait( function() {
			return driver.isElementPresent( saveSelector ).then( function( present ) {
				return ! present;
			} );
		}, this.explicitWaitMS, 'The save selector was still present when it should have disappeared with auto-save.' );

		return driver.wait( function() {
			return driver.isElementPresent( savingSelector ).then( function( present ) {
				return ! present;
			} );
		}, this.explicitWaitMS, 'The saving selector was still present when it should have disappeared with auto-save.' );
	}
	submitForReview() {
		return driverHelper.clickWhenClickable( this.driver, this.publishButtonSelector );
	}
	waitForIsPendingStatus() {
		return this.driver.wait( until.elementLocated( By.css( '.editor-status-label.is-pending' ) ), this.explicitWaitMS, 'Could not see the pending status in the specified time' );
	}
	statusIsPending() {
		return this.driver.findElement( By.css( '.editor-status-label' ) ).getAttribute( 'class' ).then( ( classNames ) => {
			return classNames.includes( 'is-pending' );
		} );
	}
	publishPost() {
		const explicitWaitMS = this.explicitWaitMS;
		const viewPostSelector = By.className( 'notice__action' );
		const publishButtonSelector = this.publishButtonSelector;
		const driver = this.driver;

		driver.wait( until.elementLocated( publishButtonSelector ), explicitWaitMS, 'Could not locate publish button' );
		let publishButton = driver.findElement( publishButtonSelector );
		driver.wait( until.elementIsEnabled( publishButton ), explicitWaitMS, 'The publish button is not enabled' );
		driverHelper.clickWhenClickable( driver, publishButtonSelector, explicitWaitMS );

		driver.isElementPresent( viewPostSelector ).then( function( viewPostLocated ) {
			if ( ! viewPostLocated ) {
				return driverHelper.clickWhenClickable( driver, publishButtonSelector, explicitWaitMS ); // sometimes first click doesnt work
			}
		} );
	}

	waitForSuccessViewPostNotice() {
		const successNoticeSelector = By.css( '.post-editor__notice.is-success,.post-editor-notice.is-success,.notice.is-success,.post-editor-notice.is-success' );
		const viewPostSelector = By.css( '.notice__action' );
		this.driver.wait( until.elementLocated( successNoticeSelector ), this.explicitWaitMS, 'Could not locate the successfully published notice.' );
		this.driver.wait( until.elementLocated( viewPostSelector ), this.explicitWaitMS, 'Could not locate the view blog post or page link.' );
	}

	publishAndViewContent() {
		this.publishPost();
		this.waitForSuccessViewPostNotice();
		return this.viewPublishedPostOrPage();
	}

	viewPublishedPostOrPage() {
		const viewPostSelector = By.css( '.editor-notice a.notice__action' );
		const driver = this.driver;

		driver.wait( until.elementLocated( viewPostSelector ), this.explicitWaitMS, 'Could not locate the view blog post or page link.' );
		return driver.findElement( viewPostSelector ).getAttribute( 'href' ).then( function( url ) {
			return driver.get( url );
		} );
	}
	launchPreview() {
		return driverHelper.clickWhenClickable( this.driver, By.css( 'button.editor-ground-control__preview-button' ), this.explicitWaitMS );
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

		driverHelper.clickWhenClickable( driver, addNewCategoryButtonSelector, this.explicitWaitMS );
		driverHelper.waitForFieldClearable( driver, categoryNameInputSelector, this.explicitWaitMS );
		driver.sleep( 500 );
		driverHelper.setWhenSettable( driver, categoryNameInputSelector, category );
		driverHelper.clickWhenClickable( driver, saveCategoryButtonSelector );
		driver.sleep( 500 );
		return driver.wait( function() {
			return driver.isElementPresent( saveCategoryButtonSelector ).then( function( present ) {
				return ! present;
			}, function( error ) {
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
		const visibilitySelector = By.css( '.post-editor__sidebar .editor-action-bar button.editor-visibility' );
		const driver = this.driver;
		driverHelper.clickWhenClickable( driver, visibilitySelector );
		driverHelper.clickWhenClickable( driver, By.css( 'input[value=private]' ) );
		driverHelper.clickWhenClickable( driver, By.css( '.dialog button.is-primary' ) ); //Click Yes to publish
		return this.waitForSuccessViewPostNotice();
	}

	setVisibilityToPasswordProtected( password ) {
		const visibilitySelector = By.css( '.post-editor__sidebar .editor-action-bar button.editor-visibility' );
		const driver = this.driver;
		driverHelper.clickWhenClickable( driver, visibilitySelector );
		driverHelper.clickWhenClickable( driver, By.css( 'input[value=password]' ) );
		return driverHelper.setWhenSettable( driver, By.css( 'div.editor-visibility__dialog input[type=text]' ), password, { secureValue: true } );
	}

	trashPost() {
		driverHelper.clickWhenClickable( this.driver, By.css( '.post-editor__sidebar button.editor-delete-post' ) );
		return driverHelper.clickWhenClickable( this.driver, By.css( '.dialog button.is-primary' ) );
	}

	_expandOrCollapseSection( sectionName, expand = true ) {
		const headerSelector = By.css( `div.editor-${sectionName}` );
		const toggleSelector = By.css( `div.editor-${sectionName} button.accordion__toggle` );
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
