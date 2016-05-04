import phrase from 'asana-phrase';
import config from 'config';

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
	const domain = ( config.get( 'useNewMailosaur' ) === true ) ? 'mailosaur.io' : 'mailosaur.in';
	return `${prefix}.${inboxId}@${domain}`;
}
