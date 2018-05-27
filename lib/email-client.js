/** @format */

// import webdriver from 'selenium-webdriver';
import config from 'config';

// const emailWaitMS = config.get( 'emailWaitMS' );

export default class EmailClient {
	constructor( mailboxId ) {
		const Mailosaur = require( 'mailosaur' );
		this.mailbox = new Mailosaur( config.get( 'mailosaurAPIKey' ) );
		this.mailboxId = mailboxId;
	}

	// deleteAllEmailByID( emailID ) {
	// 	var d = webdriver.promise.defer();
	// 	this.mailbox.deleteEmail( emailID, err => {
	// 		if ( err ) {
	// 			d.reject( err );
	// 		} else {
	// 			d.fulfill();
	// 		}
	// 	} );
	// 	return d.promise;
	// }

	// deleteAllEmail() {
	// 	var d = webdriver.promise.defer();
	// 	this.mailbox.deleteAllEmail( err => {
	// 		if ( err ) {
	// 			d.reject( err );
	// 		} else {
	// 			d.fulfill();
	// 		}
	// 	} );
	// 	return d.promise;
	// }

	/**
	 * Waits for latest email for specific email address.
	 * Times out in under 10s if no email is received with error 204.
	 * Rejects email that does not have html format.
	 * @param {string} emailAddress - Email address from where to get emails
	 * @returns {Object} - Returns `object`
	 */
	async waitForEmailByRecipient( emailAddress ) {
		let email;

		try {
			email = await this.mailbox.messages.waitFor( this.mailboxId, {
				sentTo: emailAddress,
			} );
		} catch ( err ) {
			throw new Error(
				`Mailosaur API did not receive email for ${ emailAddress } on time with ${ err }`
			);
		}
		if ( ! email.html ) {
			throw new Error( `Could not locate email for ${ emailAddress } with correct format` );
		} else {
			return email;
		}
	}

	/*
	 async pollEmailsByRecipient( emailAddress, validator = () => true ) {
		const intervalMS = 1500;
		let retries = emailWaitMS / intervalMS;
		let emails;

		while ( retries > 0 ) {
			emails = await this.mailbox.getEmailsByRecipient( emailAddress );
			if ( validator( emails ) ) {
				return emails;
			}
			await this.resolveAfterTimeout( intervalMS );
			retries--;
		}
		throw new Error( `Could not locate email for '${ emailAddress }' in '${ emailWaitMS }'ms` );
	}

	resolveAfterTimeout( timeout ) {
		return new Promise( resolved => {
			setTimeout( () => {
				resolved( 'resolved' );
			}, timeout );
		} );
	}
	*/
}
