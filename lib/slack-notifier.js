import config from 'config';
import slack from 'slack-notify';

let messages = [];

export function warn( message, { suppressDuplicateMessages = false } = {} ) {
	if ( ( suppressDuplicateMessages === true && messages.indexOf( message ) === -1 ) || ( suppressDuplicateMessages === false ) ) {
		console.log( message );
		if ( config.has( 'slackHook' ) && config.has( 'reportWarningsToSlack' ) && ( config.get( 'reportWarningsToSlack' ) === true ) ) {
			let slackClient = slack( config.get( 'slackHook' ) );
			slackClient.send( {
				icon_emoji: ':a8c:',
				text: message,
				username: 'WebDriverJS'
			} );
		}
		messages.push( message );
	}
}
