/** @format */

import { By, Key } from 'selenium-webdriver';
import * as driverHelper from '../driver-helper.js';
import AsyncBaseContainer from '../async-base-container';
import * as driverManager from '../driver-manager';

export default class GutenbergEditorSidebarComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.edit-post-header' ) );
		this.cogSelector = By.css( '[aria-label="Settings"]:not([disabled])' );
		this.closeSelector = By.css( '[aria-label="Close settings"]:not([disabled])' );
	}

	async selectTab( name ) {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( `.edit-post-sidebar__panel-tab[aria-label^=${ name }]` )
		);
	}
	async selectDocumentTab() {
		return await this.selectTab( 'Document' );
	}

	async expandStatusAndVisibility() {
		return await this._expandOrCollapseSectionByText( 'Status & Visibility', true );
	}

	async expandPermalink() {
		return this._expandOrCollapseSectionByText( 'Permalink', true );
	}

	async expandCategories() {
		return await this._expandOrCollapseSectionByText( 'Categories', true );
	}

	async expandTags() {
		return this._expandOrCollapseSectionByText( 'Tags', true );
	}

	async expandFeaturedImage() {
		return this._expandOrCollapseSectionByText( 'Featured Image', true );
	}

	async expandExcerpt() {
		return this._expandOrCollapseSectionByText( 'Excerpt', true );
	}

	async expandDiscussion() {
		return this._expandOrCollapseSectionByText( 'Discussion', true );
	}

	async collapseStatusAndVisibility() {
		return this._expandOrCollapseSectionByText( 'Status & Visibility', false );
	}

	async collapsePermalink() {
		return this._expandOrCollapseSectionByText( 'Permalink', false );
	}

	async collapseCategories() {
		return this._expandOrCollapseSectionByText( 'Categories', false );
	}

	async collapseTags() {
		return this._expandOrCollapseSectionByText( 'Tags', false );
	}

	async collapseFeaturedImage() {
		return this._expandOrCollapseSectionByText( 'Featured Image', false );
	}

	async collapseExcerpt() {
		return this._expandOrCollapseSectionByText( 'Excerpt', false );
	}

	async collapseDiscussion() {
		return this._expandOrCollapseSectionByText( 'Discussion', false );
	}

	async _expandOrCollapseSectionByText( text, expand = true ) {
		const sectionSelector = await driverHelper.getElementByText(
			this.driver,
			By.css( '.components-panel__body-toggle' ),
			text
		);
		await driverHelper.waitTillPresentAndDisplayed( this.driver, sectionSelector );
		const sectionButton = await this.driver.findElement( sectionSelector );
		let c = await sectionButton.getAttribute( 'aria-expanded' );
		if ( expand && c === 'false' ) {
			// TODO: Scroll into view
			return await sectionButton.click();
		}
		if ( ! expand && c === 'true' ) {
			// TODO: Scroll into view
			return await sectionButton.click();
		}
	}

	async setCommentsPreference( { allow = true } = {} ) {
		const labelSelector = await driverHelper.getElementByText(
			this.driver,
			By.css( '.components-checkbox-control__label' ),
			'Allow Comments'
		);
		const checkBoxSelectorID = await this.driver.findElement( labelSelector ).getAttribute( 'for' );
		const checkBoxSelector = By.id( checkBoxSelectorID );
		if ( allow === true ) {
			await driverHelper.setCheckbox( this.driver, checkBoxSelector );
		} else {
			await driverHelper.unsetCheckbox( this.driver, checkBoxSelector );
		}
	}

	async addNewCategory( category ) {
		const addNewCategoryButtonSelector = By.css(
			'.editor-post-taxonomies__hierarchical-terms-add'
		);
		const categoryNameInputSelector = By.css(
			'input.editor-post-taxonomies__hierarchical-terms-input[type=text]'
		);
		const saveCategoryButtonSelector = By.css(
			'button.editor-post-taxonomies__hierarchical-terms-submit'
		);
		const driver = this.driver;

		driver.sleep( 500 );
		await driverHelper.clickWhenClickable( driver, addNewCategoryButtonSelector );
		await driverHelper.waitForFieldClearable( driver, categoryNameInputSelector );
		driver.sleep( 500 );
		await driverHelper.setWhenSettable( driver, categoryNameInputSelector, category );
		await driverHelper.clickWhenClickable( driver, saveCategoryButtonSelector );
		return await driverHelper.waitTillPresentAndDisplayed(
			driver,
			By.xpath( `//label[contains(text(), '${ category }')]` )
		);
	}

	async addNewTag( tag ) {
		const tagEntrySelector = By.css( 'input.components-form-token-field__input' );

		await driverHelper.waitTillPresentAndDisplayed( this.driver, tagEntrySelector );
		await driverHelper.scrollIntoView( this.driver, tagEntrySelector );
		await driverHelper.waitForFieldClearable( this.driver, tagEntrySelector );
		let tagEntryElement = await this.driver.findElement( tagEntrySelector );
		await tagEntryElement.sendKeys( tag );
		return await tagEntryElement.sendKeys( Key.ENTER );
	}

	async _postInit() {
		return await this.displayComponentIfNecessary();
	}

	async displayComponentIfNecessary() {
		if ( driverManager.currentScreenSize() === 'mobile' ) {
			const driver = this.driver;
			let c = await driver.findElement( this.cogSelector ).getAttribute( 'class' );
			if ( c.indexOf( 'is-toggled' ) < 0 ) {
				return await driverHelper.clickWhenClickable( driver, this.cogSelector );
			}
		}
	}

	async hideComponentIfNecessary() {
		if ( driverManager.currentScreenSize() === 'mobile' ) {
			const driver = this.driver;

			let c = await driver.findElement( this.cogSelector ).getAttribute( 'class' );
			if ( c.indexOf( 'is-toggled' ) > -1 ) {
				return await driverHelper.clickWhenClickable( driver, this.closeSelector );
			}
		}
	}

	async chooseDocumentSetttings() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '[data-label="Document"]' )
		);
	}

	async setVisibilityToPasswordProtected( password ) {
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.edit-post-post-visibility__toggle' )
		);
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.editor-post-visibility__dialog-radio[value="password"]' )
		);
		return await driverHelper.setWhenSettable(
			this.driver,
			By.css( '.editor-post-visibility__dialog-password-input' ),
			password,
			{
				secureValue: true,
			}
		);
	}

	async setVisibilityToPrivate() {
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.edit-post-post-visibility__toggle' )
		);
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.editor-post-visibility__dialog-radio[value="private"]' )
		);
		const publishPrivateAlert = await this.driver.switchTo().alert();
		return await publishPrivateAlert.accept();
	}

	async scheduleFuturePost() {
		const nextMonthSelector = By.css( '.DayPickerNavigation_rightButton__horizontalDefault' );
		const firstDay = By.css( '.CalendarDay' );
		const publishDateSelector = By.css( '.edit-post-post-schedule__toggle' );

		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.edit-post-post-schedule__toggle' )
		);
		// schedulePost post for the first day of the next month
		await driverHelper.clickWhenClickable( this.driver, nextMonthSelector );
		await driverHelper.selectElementByText( this.driver, firstDay, '1' );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, publishDateSelector );
		let publishDate = await this.driver.findElement( publishDateSelector ).getText();

		if ( driverManager.currentScreenSize() === 'mobile' ) {
			await this.hideComponentIfNecessary();
		}
		return publishDate;
	}

	async getSelectedPublishDate() {
		const publishDateSelector = By.css( '.edit-post-post-schedule__toggle' );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, publishDateSelector );
		return await this.driver.findElement( publishDateSelector ).getText();
	}

	async trashPost() {
		const trashSelector = By.css( 'button.editor-post-trash' );

		await driverHelper.waitTillPresentAndDisplayed( this.driver, trashSelector );
		return await driverHelper.clickWhenClickable( this.driver, trashSelector );
	}
}
