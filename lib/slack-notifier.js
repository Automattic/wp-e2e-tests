import config from 'config';
import slack from 'slack-notify';

import * as driverManager from './driver-manager';
import * as dataHelper from './data-helper';

let messages = [];
const target = dataHelper.getTargetType();

export function warn( message, { suppressDuplicateMessages = false } = {} ) {
	if ( ( suppressDuplicateMessages === true && messages.indexOf( message ) === -1 ) || ( suppressDuplicateMessages === false ) ) {
		console.log( message );
		let hasSlackHook = false;
		if ( target && config.has( target ) ) {
			let targetConfig = config.get( target );
			if ( targetConfig.has( 'slackHook' ) ) {
				console.log( '====================================' );
				console.log( 'Using targetConfig to get slackHook from ' + target );
				console.log( '====================================' );
				hasSlackHook = true;
			}
		} else if ( config.has( 'slackHook' ) ) {
			hasSlackHook = true;
		}

		if ( hasSlackHook && config.has( 'reportWarningsToSlack' ) && ( config.get( 'reportWarningsToSlack' ) === true ) ) {
			const currentScreenSize = driverManager.currentScreenSize();
			const detailedMessage = `${message} - encountered on '${global.browserName}' at screen size '${currentScreenSize}' in CircleCI build #${process.env.CIRCLE_BUILD_NUM} on branch '${process.env.CIRCLE_BRANCH}'`;
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
