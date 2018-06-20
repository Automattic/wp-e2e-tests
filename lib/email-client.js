/** @format */

// import webdriver from 'selenium-webdriver';
import config from 'config';

const emailWaitMS = config.get( 'emailWaitMS' );

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
	 * Load emails for specific email address.
	 * It is possible to pass an optional function which will return list of emails only if validator will return "true"
	 * It's possible to pass a function to validate received emails. For example when you waiting for specific email - validator may check if expected email is present
	 * @param {string} emailAddress - Email address from where to get emails
	 * @param {function} validator - Optional function to validate received emails
	 * @returns {Object} - Returns `object`
	 */
	async pollEmailsByRecipient( emailAddress, validator = emails => emails.items.length > 0 ) {
		const intervalMS = 1500;
		let retries = emailWaitMS / intervalMS;
		let emails;

		while ( retries > 0 ) {
			emails = await this.mailbox.messages.search( this.mailboxId, {
				sentTo: emailAddress
			} );
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
}
