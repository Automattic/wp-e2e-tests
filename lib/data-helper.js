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
	const domain = ( config.get( 'useNewMailosaur' ) === true ) ? 'mailosaur.io' : 'mailosaur.in';
	const globalEmailPrefix = config.has( 'emailPrefix' ) ? config.get( 'emailPrefix' ) : '';
	return `${globalEmailPrefix}${prefix}.${inboxId}@${domain}`;
}

export function getExpectedFreeAddresses( searchTerm ) {
	const suffixes = [ '.wordpress.com', 'blog.wordpress.com', 'site.wordpress.com' ];
	return map( suffixes, ( suffix ) => {
		return searchTerm + suffix
	} );
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
