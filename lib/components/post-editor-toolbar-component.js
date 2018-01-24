import config from 'config';
import { By } from 'selenium-webdriver';
import * as driverHelper from '../driver-helper.js';
import * as driverManager from '../driver-manager.js';
import * as dataHelper from '../data-helper';

import BaseContainer from '../base-container.js';
import PostPreviewComponent from './post-preview-component.js';
import EditorConfirmationSidebarComponent from './editor-confirmation-sidebar-component';
const host = dataHelper.getJetpackHost();
const httpsHost = config.get( 'httpsHosts' ).indexOf( host ) !== -1;

export default class PostEditorToolbarComponent extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.editor-ground-control' ) );
		this.publishButtonSelector = By.css( '.editor-publish-button' );
	}

	ensureSaved( { clickSave = true } = {} ) {
		let saveSelectorString = 'div.card.editor-ground-control .editor-ground-control__status button.editor-ground-control__save';
		if ( driverManager.currentScreenSize() === 'mobile' ) {
			saveSelectorString = 'div.post-editor__content .editor-ground-control__status button.editor-ground-control__save';
		}

		const saveSelector = By.css( saveSelectorString );
		const savedSelector = By.css( 'span.editor-ground-control__save-status[data-e2e-status="Saved"]' );
		const driver = this.driver;

		if ( clickSave === true ) {
			driverHelper.clickIfPresent( driver, saveSelector, 3 );
		}

		return driverHelper.waitTillPresentAndDisplayed( driver, savedSelector );
	}

	clickPublishPost() {
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
		const viewPostSelector = By.css( '.notice.is-success' );

		driverHelper.waitTillPresentAndDisplayed( this.driver, successNoticeSelector );
		return driverHelper.waitTillPresentAndDisplayed( this.driver, viewPostSelector );
	}

	dismissSuccessViewPostNotice() {
		return driverHelper.clickWhenClickable( this.driver, By.css( '.notice.is-success .notice__dismiss' ) );
	}

	publishAndPreviewPublished( { useConfirmStep = false } = {} ) {
		this.clickPublishPost();
		if ( useConfirmStep === true ) {
			this.editorConfirmationSidebarComponent = new EditorConfirmationSidebarComponent( this.driver );
			this.editorConfirmationSidebarComponent.confirmAndPublish();
		}
		this.waitForSuccessViewPostNotice();
		this.previewPublishedPostOrPage();
	}

	publishAndViewContent( { reloadPageTwice = false, useConfirmStep = false } = {} ) {
		this.clickPublishPost();
		if ( useConfirmStep === true ) {
			this.editorConfirmationSidebarComponent = new EditorConfirmationSidebarComponent( this.driver );
			this.editorConfirmationSidebarComponent.confirmAndPublish();
		}
		if ( httpsHost ) {
			let previewComponent = new PostPreviewComponent( this.driver );
			previewComponent.edit();
		} else {
			this.waitForSuccessViewPostNotice();
		}
		return this.viewPublishedPostOrPage( { reloadPageTwice: reloadPageTwice } );
	}

	publishThePost( { useConfirmStep = false } = {} ) {
		this.clickPublishPost();
		if ( useConfirmStep === true ) {
			this.editorConfirmationSidebarComponent = new EditorConfirmationSidebarComponent( this.driver );
			this.editorConfirmationSidebarComponent.confirmAndPublish();
		}
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

	waitForSuccessAndViewPost() {
		driverHelper.waitTillPresentAndDisplayed( this.driver, By.css( '.notice.is-success' ), this.explicitWaitMS * 2 );
		return driverHelper.clickWhenClickable( this.driver, By.css( '.notice.is-success a' ) );
	}

	closeEditor() {
		return driverHelper.clickWhenClickable( this.driver, By.css( 'button.editor-ground-control__back' ) );
	}
}
