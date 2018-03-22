/** @format */

const config = require( 'config' );
const bluecat = require( 'bluecat' );
const WPcom = require( 'wpcom' );
const path = require( 'path' );

const oauth = require( '../lib/wpcom-api/oauth.js' );
const media = require( '../lib/wpcom-api/media.js' );

const api = bluecat.Api( 'wp' );
api.oauth2.host = 'https://public-api.wordpress.com';
const service = new bluecat.ServiceSync( api, 'public-api.wordpress.com/rest/v1.1' );

// Test account for the upload
const account = config.testAccounts.i18nScreenshotUser;

// Locales to include in upload
const locales = process.argv[ 2 ].toUpperCase().split( ',' );

// e2e flows to include in upload
// identified by the flow name as it appears in the screenshot filename
const e2eFlows = [
	'sign-up-for-a-site-on-a-premium-paid-plan-through-main-flow',
	'partially-sign-up-for-a-site-on-a-business-paid-plan-w--domain-name-coming-in-via--create-as-business-flow',
];

// Directory where screenshots are saved
const imageFolder = path.join( __dirname, '/../screenshots-i18n/' );

// Prepare the images for upload, grouping them by locale & flow
const imageFormDataCollection = media.prepareUpload( locales, e2eFlows, imageFolder );

service.run( function() {
	// Oauth login
	const token = oauth.login( service, account );

	uploadImagesAndPost( WPcom( token.accessToken ) );
} );

// Start the API calls
function uploadImagesAndPost( wpcom ) {
	let imageIDs;
	let imageFormData;
	let site = wpcom.site( account[ 2 ] );

	// Publish a post for each locale
	return locales.reduce( function( localePromise, locale ) {
		imageIDs = {};
		return localePromise
			.then( function() {
				console.log( `- Uploading ${ locale } screenshots` );
				// Loop through flows
				return e2eFlows.reduce( function( flowPromise, flow ) {
					return flowPromise.then( function() {
						imageFormData = imageFormDataCollection[ locale ][ flow ];
						imageIDs[ flow ] = [];

						// Loop through images
						return imageFormData.reduce( function( imagePromise, formData ) {
							return imagePromise.then( function() {
								// Upload images
								return ( site
										.media()
										.addFiles( {
											file: formData.media.path,
										} )
										.timeout( 60000 )
										// Add image info to array
										.then( data => imageIDs[ flow ].push( data.media[ 0 ].ID ) ) );
							} );
						}, Promise.resolve() );
					} );
				}, Promise.resolve() );

				// After looping through all the flows and images, call the post function
			} )
			.then( () => postImages( locale, imageIDs, site ) );
	}, Promise.resolve() );
}

function postImages( locale, imageIDs, site ) {
	return new Promise( function( resolve, reject ) {
		let niceFlowID;
		let postFormData;
		let postContent;
		let postLink;

		// Prepare post content with one gallery per flow
		const dateString = new Date().toDateString();
		postContent = '';
		for ( const flowID in imageIDs ) {
			if ( imageIDs.hasOwnProperty( flowID ) ) {
				niceFlowID = flowID.charAt( 0 ).toUpperCase() + flowID.slice( 1 ).replace( /-/g, ' ' );
				postContent += `<h2>${ niceFlowID }</h2><p>[gallery ids="${ imageIDs[ flowID ] }"]</p>`;
			}
		}

		postFormData = {
			title: `${ locale } Signup Screenshots (${ dateString })`,
			slug: `${ locale }-signup-screenshots`,
			content: postContent,
			categories: 'Signup',
			tags: locale,
		};

		// Publish post
		site
			.post()
			.add( postFormData )
			.timeout( 60000 )
			.then( data => {
				postLink = data.URL;
				console.log( ` - Successfully published ${ locale } post: ${ postLink }` );
				resolve();
			} )
			.catch( e => {
				console.log( e );
				reject();
			} );
	} );
}
