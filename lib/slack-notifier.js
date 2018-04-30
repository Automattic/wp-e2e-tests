/** @format */

import config from 'config';

import SlackBot from '../slack-bot';
import * as driverManager from './driver-manager';
import * as dataHelper from './data-helper';

let messages = [];

export async function warn( message, { suppressDuplicateMessages = false } = {} ) {
	if (
		( suppressDuplicateMessages === true && messages.indexOf( message ) === -1 ) ||
		suppressDuplicateMessages === false
	) {
		console.log( message );
		let slackHook = dataHelper.configGet( 'slackHook' );

		if (
			slackHook &&
			config.has( 'reportWarningsToSlack' ) &&
			config.get( 'reportWarningsToSlack' ) === true
		) {
			const currentScreenSize = driverManager.currentScreenSize();
			const detailedMessage = `${ message } - encountered on '${
				global.browserName
			}' at screen size '${ currentScreenSize }' in CircleCI build #${
				process.env.CIRCLE_BUILD_NUM
			} on branch '${ process.env.CIRCLE_BRANCH }'`;
			let channel = config.get( 'slackChannelForScreenshots' );
			let token = config.get( 'slackTokenForScreenshots' );
			const slackClient = new SlackBot( token, channel, {
				icon_emoji: ':a8c:',
				username: 'e2e Test Runner',
			} );
			await slackClient.findChannelByName();
			await slackClient.sendMessage( detailedMessage );
		}
		messages.push( message );
	}
}
