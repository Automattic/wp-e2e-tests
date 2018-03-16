const BaseReporter = require( 'testarmada-magellan' ).Reporter;
const util = require( 'util' );

// Requirements for Slack output
const slack = require( 'slack-notify' );
const config = require( 'config' );
const fs = require( 'fs-extra' );
const XunitViewerParser = require( 'xunit-viewer/parser' );
const pngitxt = require( 'png-itxt' );

let Reporter = function() {
};

util.inherits( Reporter, BaseReporter );

Reporter.prototype.listenTo = function( testRun, test, source ) {
	// Print STDOUT/ERR to the screen for extra debugging
	if ( !! process.env.MAGELLANDEBUG ) {
		source.stdout.pipe( process.stdout );
		source.stderr.pipe( process.stderr );
	}

	// Create global report and screenshots directories
	let finalScreenshotDir = './screenshots';
	if ( process.env.SCREENSHOTDIR ) {
		finalScreenshotDir = `./${process.env.SCREENSHOTDIR}`;
	}

	fs.stat( './reports', function( err ) {
		if ( err && err.code === 'ENOENT' ) {
			fs.mkdir( './reports', function() {} );
		}
	} );
	fs.stat( finalScreenshotDir, function( err ) {
		if ( err && err.code === 'ENOENT' ) {
			fs.mkdir( finalScreenshotDir, function() {} );
		}
	} );

	// Only enable Slack messages on the master branch
	let slackClient = { send: function() {} };

	let slackHook = configGet( 'slackHook' );
	slackClient = slack( slackHook );
	// if ( process.env.CIRCLE_BRANCH === 'master' ) {
	// 	let slackHook = configGet( 'slackHook' );
	// 	slackClient = slack( slackHook );
	// }

	source.on( 'message', function( msg ) {
		if ( msg.type === 'worker-status' ) {
			const passCondition = msg.passed;
			const failCondition = !msg.passed && msg.status === 'finished' && test.maxAttempts === test.attempts + 1;
			const testObject = {
				title: test.locator.title,
				fullTitle: test.locator.name,
				duration: test.runningTime,
				err: {}
			};
			const reportDir = './reports';
			let screenshotDir = './screenshots';
			if ( process.env.SCREENSHOTDIR ) {
				screenshotDir = testRun.tempAssetPath + `/${process.env.SCREENSHOTDIR}`;
			}

			// Notify if the test was retried
			if ( passCondition && test.attempts > 0 ) {
				slackClient.send( {
					icon_emoji: ':a8c:',
					text: `FYI - The following test failed, retried, and passed: (${process.env.BROWSERSIZE}) ${testObject.title} - Build <https://circleci.com/gh/${process.env.CIRCLE_PROJECT_USERNAME}/${process.env.CIRCLE_PROJECT_REPONAME}/${process.env.CIRCLE_BUILD_NUM}|#${process.env.CIRCLE_BUILD_NUM}>`,
					username: 'e2e Test Runner'
				} );
			}

			// If the test failed on the final retry, send Slack notifications
			if ( failCondition ) {
				// Reports
				fs.readdir( reportDir, function( dirErr, files ) {
					if ( dirErr ) {
						return 1;
					}

					files.forEach( function( reportPath ) {
						if ( ! reportPath.match( /xml$/i ) ) {
							return;
						}

						// Parse out failure messages and send to Slack
						try {
							const xmlString = fs.readFileSync( `${reportDir}/${reportPath}`, 'utf-8' );
							const xmlData = XunitViewerParser.parse( xmlString );
							const failures = xmlData[0].tests.
								filter( ( t ) => {
									return t.status === 'fail';
								} );

							failures.forEach( function( failure ) {
								let fieldsObj = { Error: failure.message.split( /\n/ )[0] };
								let testName = failure.classname + ': ' + failure.name;
								if ( process.env.DEPLOY_USER ) {
									fieldsObj['Git Diff'] = '<https://github.com/Automattic/wp-calypso/compare/' + process.env.PROD_REVISION + '...' + process.env.TO_DEPLOY_REVISION + '|Compare Commits>';
									fieldsObj.Author = process.env.DEPLOY_USER;
								}

								slackClient.send( {
									icon_emoji: ':a8c:',
									text: `<!subteam^S0G7K98MB|flow-patrol-squad-team> Test Failed (${process.env.BROWSERSIZE}): *${testName}* - Build <https://circleci.com/gh/${process.env.CIRCLE_PROJECT_USERNAME}/${process.env.CIRCLE_PROJECT_REPONAME}/${process.env.CIRCLE_BUILD_NUM}|#${process.env.CIRCLE_BUILD_NUM}>`,
									fields: fieldsObj,
									username: 'e2e Test Runner'
								} );
								moveReports( slackClient, reportDir, reportPath, testRun.guid );
							} );
						} catch ( e ) {
							console.log( `Error reading report file, likely just timing race: ${e.message}` );
						}
					} );
				} );

				// Screenshots
				fs.readdir( screenshotDir, function( dirErr, files ) {
					if ( dirErr ) {
						return 1;
					}

					files.forEach( function( screenshotPath ) {
						if ( ! screenshotPath.match( /png$/i ) ) {
							return;
						}

						// Send screenshot to Slack on master branch only
						if ( config.has( 'slackTokenForScreenshots' ) ) {
						// if ( config.has( 'slackTokenForScreenshots' ) && process.env.CIRCLE_BRANCH === 'master' ) {
							const SlackUpload = require( 'node-slack-upload' );
							const slackUpload = new SlackUpload( config.get( 'slackTokenForScreenshots' ) );
							let slackChannel = configGet( 'slackChannelForScreenshots' );

							try {
								fs.createReadStream( `${screenshotDir}/${screenshotPath}` )
									.pipe( pngitxt.get( 'url', function( url ) {
										slackUpload.uploadFile( {
											file: fs.createReadStream( `${screenshotDir}/${screenshotPath}` ),
											title: `${screenshotPath} - # ${process.env.CIRCLE_BUILD_NUM}`,
											initialComment: url,
											channels: slackChannel
										}, ( err ) => {
											if ( ! err ) {
												return;
											}
											slackClient.send( {
												icon_emoji: ':a8c:',
												text: `Build <https://circleci.com/gh/${process.env.CIRCLE_PROJECT_USERNAME}/${process.env.CIRCLE_PROJECT_REPONAME}/${process.env.CIRCLE_BUILD_NUM}|#${process.env.CIRCLE_BUILD_NUM}> Upload to slack failed: '${err}'`,
												username: 'e2e Test Runner'
											} );
										} );
										moveScreenshots( slackClient, screenshotDir, screenshotPath, finalScreenshotDir );
									} ) );
							} catch ( e ) {
								console.log( `Error reading screenshot file, likely just timing race: ${e.message}` );
							}
						}
					} );
				} );
			}

			// Also move the report/screenshots files if the test passed
			if ( passCondition ) {
				// Reports
				fs.readdir( reportDir, function( dirErr, reportFiles ) {
					if ( dirErr ) {
						return 1;
					}

					reportFiles.forEach( function( reportPath ) {
						if ( ! reportPath.match( /xml$/i ) ) {
							return;
						}
						moveReports( slackClient, reportDir, reportPath, testRun.guid );
					} );
				} );

				// Screenshots
				fs.readdir( screenshotDir, function( dirErr, screenshotFiles ) {
					if ( dirErr ) {
						return 1;
					}

					screenshotFiles.forEach( function( screenshotPath ) {
						if ( ! screenshotPath.match( /png$/i ) ) {
							return;
						}

						moveScreenshots( slackClient, screenshotDir, screenshotPath, finalScreenshotDir );
					} );
				} );
			}
		}
	} );
};

function configGet( key ) {
	const target = process.env.TARGET || null;

	if ( target && config.has( target ) ) {
		let targetConfig = config.get( target );
		if ( targetConfig.has( key ) ) {
			return targetConfig.get( key );
		}
	}

	return config.get( key );
}

// Move to /reports for CircleCI artifacts
function moveReports( slackClient, reportDir, reportPath, guid ) {
	try {
		fs.rename( `${reportDir}/${reportPath}`, `./reports/${guid}_${reportPath}`, ( moveErr ) => {
			if ( ! moveErr ) {
				return;
			}
			slackClient.send( {
				icon_emoji: ':a8c:',
				text: `Build <https://circleci.com/gh/${process.env.CIRCLE_PROJECT_USERNAME}/${process.env.CIRCLE_PROJECT_REPONAME}/${process.env.CIRCLE_BUILD_NUM}|#${process.env.CIRCLE_BUILD_NUM}> Moving file to /reports failed: '${moveErr}'`,
				username: 'e2e Test Runner'
			} );
		} );
	} catch ( e ) {
		console.log( `Error moving file, likely just timing race: ${e.message}` );
	}
}

// Move to /screenshots for CircleCI artifacts
function moveScreenshots( slackClient, dir, path, finalScreenshotDir ) {
	try {
		fs.rename( `${dir}/${path}`, `${finalScreenshotDir}/${path}`, ( moveErr ) => {
			if ( ! moveErr ) {
				return;
			}
			slackClient.send( {
				icon_emoji: ':a8c:',
				text: `Build <https://circleci.com/gh/${process.env.CIRCLE_PROJECT_USERNAME}/${process.env.CIRCLE_PROJECT_REPONAME}/${process.env.CIRCLE_BUILD_NUM}|#${process.env.CIRCLE_BUILD_NUM}> Moving file to screenshots directory failed: '${moveErr}'`,
				username: 'e2e Test Runner'
			} );
		} );
	} catch ( e ) {
		console.log( `Error moving file, likely just timing race: ${e.message}` );
	}
}

module.exports = Reporter;

