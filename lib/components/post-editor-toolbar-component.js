/** @format */

import { By } from 'selenium-webdriver';
import * as driverHelper from '../driver-helper.js';
import * as driverManager from '../driver-manager.js';

import BaseContainer from '../base-container.js';
import PostPreviewComponent from './post-preview-component.js';
import EditorConfirmationSidebarComponent from './editor-confirmation-sidebar-component';

export default class PostEditorToolbarComponent extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.editor-ground-control' ) );
		this.publishButtonSelector = By.css( '.editor-publish-button' );
		this.successNoticeSelector = By.css(
			'.post-editor__notice.is-success,.post-editor-notice.is-success,.notice.is-success,.post-editor-notice.is-success'
		);
	}

	ensureSaved( { clickSave = true } = {} ) {
		const onMobile = driverManager.currentScreenSize() === 'mobile';

		const mobileSaveSelector = By.css(
			'div.post-editor__content .editor-ground-control__status button.editor-ground-control__save'
		);
		const desktopSaveSelector = By.css(
			'div.card.editor-ground-control .editor-ground-control__status button.editor-ground-control__save'
		);
		const saveSelector = onMobile ? mobileSaveSelector : desktopSaveSelector;

		const savedSelector = By.css(
			'span.editor-ground-control__save-status[data-e2e-status="Saved"]'
		);

		if ( clickSave === true ) {
			driverHelper.clickIfPresent( this.driver, saveSelector, 3 );
		}

		return driverHelper.waitTillPresentAndDisplayed( this.driver, savedSelector );
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
		return driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'button.editor-ground-control__preview-button' ),
			this.explicitWaitMS
		);
	}

	waitForPostSucessNotice() {
		return driverHelper.waitTillPresentAndDisplayed( this.driver, this.successNoticeSelector );
	}

	waitForSuccessViewPostNotice() {
		driverHelper.waitTillPresentAndDisplayed( this.driver, this.successNoticeSelector );
		return driverHelper.waitTillPresentAndDisplayed( this.driver, By.css( '.notice.is-success' ) );
	}

	publishAndPreviewPublished( { useConfirmStep = false } = {} ) {
		this.clickPublishPost();
		if ( useConfirmStep === true ) {
			this.editorConfirmationSidebarComponent = new EditorConfirmationSidebarComponent(
				this.driver
			);
			this.editorConfirmationSidebarComponent.confirmAndPublish();
		}
		this.waitForSuccessViewPostNotice();
		return this.previewPublishedPostOrPage();
	}

	publishAndViewContent( { reloadPageTwice = false, useConfirmStep = false } = {} ) {
		this.clickPublishPost();
		if ( useConfirmStep === true ) {
			this.editorConfirmationSidebarComponent = new EditorConfirmationSidebarComponent(
				this.driver
			);
			this.editorConfirmationSidebarComponent.confirmAndPublish();
		}

		let previewComponent = new PostPreviewComponent( this.driver );
		previewComponent.edit();

		return this.viewPublishedPostOrPage( { reloadPageTwice: reloadPageTwice } );
	}

	publishThePost( { useConfirmStep = false } = {} ) {
		let result = this.clickPublishPost();
		if ( useConfirmStep === true ) {
			this.editorConfirmationSidebarComponent = new EditorConfirmationSidebarComponent(
				this.driver
			);
			return this.editorConfirmationSidebarComponent.confirmAndPublish();
		}
		return result;
	}

	viewPublishedPostOrPage( { reloadPageTwice = false } = {} ) {
		const viewPostSelector = By.css( '.editor-action-bar__cell.is-right a' );
		const driver = this.driver;

		driverHelper.waitTillPresentAndDisplayed( this.driver, viewPostSelector );

		return driver
			.findElement( viewPostSelector )
			.getAttribute( 'href' )
			.then( function( url ) {
				driver.get( url );
				if ( reloadPageTwice === true ) {
					driver.get( url );
				}
			} );
	}

	previewPublishedPostOrPage() {
		return driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.editor-notice a.notice__action' )
		);
	}

	waitForPublishButtonToBeEnabled() {
		const self = this;

		return self.driver.wait(
			function() {
				return self.driver
					.findElement( self.publishButtonSelector )
					.getAttribute( 'disabled' )
					.then( d => {
						return d !== 'true';
					} );
			},
			self.explicitWaitMS,
			'The publish button is still disabled after waiting for it'
		);
	}

	waitForIsPendingStatus() {
		return driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.editor-status-label.is-pending' )
		);
	}

	statusIsPending() {
		return this.driver
			.findElement( By.css( '.editor-status-label' ) )
			.getAttribute( 'class' )
			.then( classNames => {
				return classNames.includes( 'is-pending' );
			} );
	}

	waitForIsDraftStatus() {
		return driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.editor-status-label.is-draft' )
		);
	}

	statusIsDraft() {
		return this.driver
			.findElement( By.css( '.editor-status-label' ) )
			.getAttribute( 'class' )
			.then( classNames => {
				return classNames.includes( 'is-draft' );
			} );
	}

	waitForSuccessAndViewPost() {
		driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.notice.is-success' ),
			this.explicitWaitMS * 2
		);
		return driverHelper.clickWhenClickable( this.driver, By.css( '.notice.is-success a' ) );
	}

	closeEditor() {
		return driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'button.editor-ground-control__back' )
		);
	}
}
