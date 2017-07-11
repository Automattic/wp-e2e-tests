import { By } from 'selenium-webdriver';
import * as driverHelper from '../driver-helper.js';
import * as dataHelper from '../data-helper';

import BaseContainer from '../base-container.js';
import PostPreviewComponent from './post-preview-component.js';
const host = dataHelper.getJetpackHost();

export default class PostEditorToolbarComponent extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.editor-ground-control' ) );
		this.publishButtonSelector = By.css( '.editor-ground-control__publish-combo .editor-publish-button' );
	}

	ensureSaved() {
		const saveSelector = By.css( 'button.editor-ground-control__save' );
		const savingSelector = By.css( 'span.editor-ground-control__saving' );
		const driver = this.driver;

		driverHelper.clickIfPresent( driver, saveSelector, 3 );

		driver.wait( function() {
			return driverHelper.isElementPresent( driver, saveSelector ).then( function( present ) {
				return ! present;
			} );
		}, this.explicitWaitMS, 'The save selector was still present when it should have disappeared with auto-save.' );

		return driver.wait( function() {
			return driverHelper.isElementPresent( driver, savingSelector ).then( function( present ) {
				return ! present;
			} );
		}, this.explicitWaitMS, 'The saving selector was still present when it should have disappeared with auto-save.' );
	}

	publishPost() {
		driverHelper.waitTillPresentAndDisplayed( this.driver, this.publishButtonSelector );
		this.waitForPublishButtonToBeEnabled();
		return driverHelper.clickWhenClickable( this.driver, this.publishButtonSelector );
	}

	submitForReview() {
		return driverHelper.clickWhenClickable( this.driver, this.publishButtonSelector );
	}

	launchPreview() {
		return driverHelper.clickWhenClickable( this.driver, By.css( 'button.editor-ground-control__preview-button' ), this.explicitWaitMS );
	}

	waitForSuccessViewPostNotice() {
		const successNoticeSelector = By.css( '.post-editor__notice.is-success,.post-editor-notice.is-success,.notice.is-success,.post-editor-notice.is-success' );
		let viewPostSelector = By.css( '.notice.is-success' );
		if ( host !== 'WPCOM' ) {
			viewPostSelector = By.css( '.notice__action' );
		}

		driverHelper.waitTillPresentAndDisplayed( this.driver, successNoticeSelector );
		return driverHelper.waitTillPresentAndDisplayed( this.driver, viewPostSelector );
	}

	publishAndPreviewPublished() {
		this.publishPost();
		this.waitForSuccessViewPostNotice();
		this.previewPublishedPostOrPage();
	}

	publishAndViewContent( { reloadPageTwice = false } = {} ) {
		this.publishPost();
		if ( host === 'WPCOM' ) {
			let previewComponent = new PostPreviewComponent( this.driver );
			previewComponent.edit();
		} else {
			this.waitForSuccessViewPostNotice();
		}
		return this.viewPublishedPostOrPage( { reloadPageTwice: reloadPageTwice } );
	}

	viewPublishedPostOrPage( { reloadPageTwice = false } = {} ) {
		const viewPostSelector = By.css( '.editor-action-bar__cell.is-right a' );
		const driver = this.driver;

		driverHelper.waitTillPresentAndDisplayed( this.driver, viewPostSelector );

		return driver.findElement( viewPostSelector ).getAttribute( 'href' ).then( function( url ) {
			driver.get( url );
			if ( reloadPageTwice === true ) {
				driver.get( url );
			}
		} );
	}

	previewPublishedPostOrPage() {
		return driverHelper.clickWhenClickable( this.driver, By.css( '.editor-notice a.notice__action' ) );
	}

	waitForPublishButtonToBeEnabled() {
		const self = this;

		return self.driver.wait( function() {
			return self.driver.findElement( self.publishButtonSelector ).getAttribute( 'disabled' ).then( ( d ) => {
				return d !== 'true';
			} );
		}, self.explicitWaitMS, 'The publish button is still disabled after waiting for it' );
	}

	waitForIsPendingStatus() {
		return driverHelper.waitTillPresentAndDisplayed( this.driver, By.css( '.editor-status-label.is-pending' ) );
	}

	statusIsPending() {
		return this.driver.findElement( By.css( '.editor-status-label' ) ).getAttribute( 'class' ).then( ( classNames ) => {
			return classNames.includes( 'is-pending' );
		} );
	}

	waitForIsDraftStatus() {
		return driverHelper.waitTillPresentAndDisplayed( this.driver, By.css( '.editor-status-label.is-draft' ) );
	}

	statusIsDraft() {
		return this.driver.findElement( By.css( '.editor-status-label' ) ).getAttribute( 'class' ).then( ( classNames ) => {
			return classNames.includes( 'is-draft' );
		} );
	}
}
