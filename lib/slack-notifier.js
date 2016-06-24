import config from 'config';
import slack from 'slack-notify';

import * as driverManager from './driver-manager';

let messages = [];

export function warn( message, { suppressDuplicateMessages = false } = {} ) {
	if ( ( suppressDuplicateMessages === true && messages.indexOf( message ) === -1 ) || ( suppressDuplicateMessages === false ) ) {
		console.log( message );
		if ( config.has( 'slackHook' ) && config.has( 'reportWarningsToSlack' ) && ( config.get( 'reportWarningsToSlack' ) === true ) ) {
			const currentScreenSize = driverManager.currentScreenSize();
			const detailedMessage = `${message} - encountered on screen size '${currentScreenSize}' in CircleCI build #${process.env.CIRCLE_BUILD_NUM} on branch '${process.env.CIRCLE_BRANCH}'`;
			const slackClient = slack( config.get( 'slackHook' ) );
			slackClient.send( {
				icon_emoji: ':a8c:',
				text: detailedMessage,
				username: 'WebDriverJS'
			} );
		}
		messages.push( message );
	}
}
