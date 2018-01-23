import phrase from 'asana-phrase';
import config from 'config';
import { map } from 'lodash';

String.prototype.toProperCase = function() {
	return this.replace( /\w\S*/g, function( txt ) {
		return txt.charAt( 0 ).toUpperCase() + txt.substr( 1 ).toLowerCase();
	} );
};

export function randomPhrase() {
	var gen = phrase.default32BitFactory().randomPhrase();
	return `${gen[ 1 ].toProperCase()} ${gen[ 2 ].toProperCase()} ${gen[ 3 ].toProperCase()} ${gen[ 4 ].toProperCase()}`;
}

export function getEmailAddress( prefix, inboxId ) {
	const domain = 'mailosaur.io';
	const globalEmailPrefix = config.has( 'emailPrefix' ) ? config.get( 'emailPrefix' ) : '';
	return `${globalEmailPrefix}${prefix}.${inboxId}@${domain}`;
}

export function getExpectedFreeAddresses( searchTerm ) {
	const suffixes = [ '.wordpress.com', 'blog.wordpress.com', 'site.wordpress.com' ];
	return map( suffixes, ( suffix ) => {
		return searchTerm + suffix;
	} );
}

export function getNewBlogName( ) {
	return `e2eflowtesting${new Date().getTime().toString()}${getRandomInt( 100, 999 )}`;
}

export function getMenuName() {
	return `menu${new Date().getTime().toString()}`;
}

export function getWidgetTitle() {
	return `WIDGET ${new Date().getTime().toString()}`;
}

export function getWidgetContent() {
	return this.randomPhrase();
}

function getRandomInt( min, max ) {
	return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
}

export function getJetpackHost() {
	return process.env.JETPACKHOST || 'WPCOM';
}

export function isRunningOnLiveBranch() {
	return config.has( 'liveBranch' ) && config.get( 'liveBranch' );
}

export function adjustInviteLinkToCorrectEnvironment( acceptInviteURL ) {
	const calypsoBaseUrl = config.get( 'calypsoBaseURL' );
	acceptInviteURL = acceptInviteURL.replace( 'https://wordpress.com', calypsoBaseUrl );
	if ( this.isRunningOnLiveBranch() ) {
		acceptInviteURL = acceptInviteURL + '?branch=' + config.get( 'branchName' );
	}
	return acceptInviteURL;
}

/**
* Gets the account configs from the local config file.
*
* If the local configuration doesn't exist, fall back to the environmental variable.
*
* @param {string} account The account entry to get
* @returns {object} account Username/Password pair
*/
export function getAccountConfig( account ) {
	const host = this.getJetpackHost();
	let localConfig;

	if ( config.has( 'testAccounts' ) ) {
		localConfig = config.get( 'testAccounts' );
	} else {
		localConfig = JSON.parse( process.env.ACCOUNT_INFO );
	}

	if ( host !== 'WPCOM' && account !== 'jetpackConnectUser' ) {
		account = 'jetpackUser' + host;
	}

	return localConfig[ account ];
}

export function getJetpackSiteName() {
	const host = this.getJetpackHost();

	if ( host === 'CI' ) {
		return `${process.env.CIRCLE_SHA1.substr( 0, 20 )}.wp-e2e-tests.pw`;
	}

	// Other Jetpack site
	let siteName = this.getAccountConfig( 'jetpackUser' + host )[2];
	return siteName.replace( /^https?:\/\//, '' ).replace( /\/wp-admin/, '' );
}

export function getTestCreditCardDetails() {
	return {
		cardHolder: 'End To End Testing',
		cardType: 'VISA',
		cardNumber: '4242424242424242', // https://stripe.com/docs/testing#cards
		cardExpiry: '02/19',
		cardCVV: '300',
		cardCountryCode: 'TR', // using Turkey to force Stripe as payment processor
		cardPostCode: '4000'
	};
}
