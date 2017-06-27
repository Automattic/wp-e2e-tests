import webdriver from 'selenium-webdriver';
import config from 'config';

const emailWaitMS = config.get( 'emailWaitMS' );

export default class EmailClient {
	constructor( mailboxId ) {
		const apiKey = config.get( 'mailosaurAPIKey' );
		const Mailosaur = require( 'mailosaur' )( apiKey, 'https://www.mailosaur.com/api/' );
		this.mailbox = new Mailosaur.Mailbox( mailboxId );
	}

	deleteAllEmailByID( emailID ) {
		var d = webdriver.promise.defer();
		this.mailbox.deleteEmail( emailID, ( err ) => {
			if ( err ) {
				d.reject( err );
			} else {
				d.fulfill();
			}
		} );
		return d.promise;
	}

	deleteAllEmail() {
		var d = webdriver.promise.defer();
		this.mailbox.deleteAllEmail( ( err ) => {
			if ( err ) {
				d.reject( err );
			} else {
				d.fulfill();
			}
		} );
		return d.promise;
	}

	getEmailsByRecipient( emailAddress ) {
		var d = webdriver.promise.defer();
		this.mailbox.getEmailsByRecipient( emailAddress, function( err, emails ) {
			if ( err ) {
				d.reject( err );
			} else {
				d.fulfill( emails );
			}
		} );
		return d.promise;
	}

	pollEmailsByRecipient( emailAddress ) {
		var self = this;
		var interval;
		var d = webdriver.promise.defer();
		const intervalMS = 1500;
		let retries = emailWaitMS / intervalMS;

		interval = setInterval( function() {
			self.getEmailsByRecipient( emailAddress ).then( function success( emails ) {
				if ( emails.length > 0 ) {
					clearInterval( interval );
					d.fulfill( emails );
				} else if ( --retries <= 0 ) {
					clearInterval( interval );
					d.reject( new Error( 'No E-mails found in specified retries for ' + emailAddress ) );
				}
			}, function error( err ) {
				clearInterval( interval );
				d.reject( err );
			} );
		}, intervalMS );

		return d.promise;
	}
}
