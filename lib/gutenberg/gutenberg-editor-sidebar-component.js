/** @format */
import { By, Key } from 'selenium-webdriver';
import * as driverHelper from '../driver-helper';
import AsyncBaseContainer from '../async-base-container';

export default class GutenbergEditorSidebarComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.edit-post-sidebar' ) );
	}

	async sidebarSections() {
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.components-panel__body-toggle' )
		);
		return await this.driver.findElements( By.css( '.components-panel__body-toggle' ) );
	}

	async selectTab( name ) {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( `.edit-post-sidebar__panel-tab[data-label='${ name }'` )
		);
	}
	async selectDocumentTab() {
		return await this.selectTab( 'Document' );
	}

	async expandStatusAndVisibility() {
		return this._expandOrCollapseSection( 0, true );
	}

	async expandCategories() {
		return this._expandOrCollapseSection( 1, true );
	}

	async expandTags() {
		return this._expandOrCollapseSection( 2, true );
	}

	async expandFeaturedImage() {
		return this._expandOrCollapseSection( 3, true );
	}

	async expandExcerpt() {
		return this._expandOrCollapseSection( 4, true );
	}

	async expandDiscussion() {
		return this._expandOrCollapseSection( 5, true );
	}

	async collapseStatusAndVisibility() {
		return this._expandOrCollapseSection( 0, false );
	}

	async collapseCategories() {
		return this._expandOrCollapseSection( 1, false );
	}

	async collapseTags() {
		return this._expandOrCollapseSection( 2, false );
	}

	async collapseFeaturedImage() {
		return this._expandOrCollapseSection( 3, false );
	}

	async collapseExcerpt() {
		return this._expandOrCollapseSection( 4, false );
	}

	async collapseDiscussion() {
		return this._expandOrCollapseSection( 5, false );
	}

	async _expandOrCollapseSection( sectionNumber, expand = true ) {
		const sidebarButtons = await this.sidebarSections();
		const sectionButton = sidebarButtons[ sectionNumber ];

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
}
