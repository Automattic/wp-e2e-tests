/** @format */

import { By } from 'selenium-webdriver';
import * as driverHelper from '../driver-helper.js';
import AsyncBaseContainer from '../async-base-container';
import * as driverManager from '../driver-manager';

export default class GutenbergEditorSidebarComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.block-editor.gutenberg' ) );
		this.cogSelector = By.css( '[aria-label="Settings"]:not([disabled])' );
		this.closeSelector = By.css( '[aria-label="Close settings"]:not([disabled])' );
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

	async trashPost() {
		const trashSelector = By.css( 'button.editor-post-trash' );

		await driverHelper.waitTillPresentAndDisplayed( this.driver, trashSelector );
		return await driverHelper.clickWhenClickable( this.driver, trashSelector );
	}
}
