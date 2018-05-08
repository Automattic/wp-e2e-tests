/** @format */

import webdriver from 'selenium-webdriver';
import config from 'config';

const emailWaitMS = config.get( 'emailWaitMS' );

export default class EmailClient {
	constructor( mailboxId ) {
		const apiKey = config.get( 'mailosaurAPIKey' );
		const Mailosaur = require( 'mailosaur' )( apiKey, 'https://mailosaur.com/api/' );
		this.mailbox = new Mailosaur.Mailbox( mailboxId );
	}

	/**
	 * Load emails for specific email address.
	 * It is possible to pass an optional function which will return list of emails only if validator will return "true"
	 * It's possible to pass a function to validate received emails. For example when you waiting for specific email - validator may check if expected email is present
	 * @param {string} emailAddress - Email address from where to get emails
	 * @param {function} validator - Optional function to validate received emails
	 * @returns {Promise} - Resolved when there is no errors and validator returns truthy
	 */
	getEmailsByRecipient( emailAddress, validator ) {
		const d = webdriver.promise.defer();
		if ( ! validator ) {
			validator = () => true;
		}
		this.mailbox.getEmailsByRecipient( emailAddress, ( err, emails ) => {
			if ( err ) {
				d.reject( err );
			} else if ( validator( emails ) ) {
				d.fulfill( emails );
			}
		} );
		return d.promise;
	}

	pollEmailsByRecipient( emailAddress, validator ) {
		if ( ! validator ) {
			validator = () => true;
		}
		const d = webdriver.promise.defer();
		const intervalMS = 1500;
		let retries = emailWaitMS / intervalMS;
		let interval;

		interval = setInterval(
			() =>
				this.getEmailsByRecipient( emailAddress, validator ).then(
					emails => {
						if ( emails.length > 0 ) {
							clearInterval( interval );
							d.fulfill( emails );
						} else if ( --retries <= 0 ) {
							clearInterval( interval );
							d.reject( new Error( 'No E-mails found in specified retries for ' + emailAddress ) );
						}
					},
					err => {
						clearInterval( interval );
						d.reject( err );
					}
				),
			intervalMS
		);

		return d.promise;
	}
}
