const config = require( 'config' );
const bluecat = require( 'bluecat' );
const path = require( 'path' );
const expect = require( 'chai' ).expect;

const oauth = require( '../lib/wpcom-api/oauth.js' );
const posts = require( '../lib/wpcom-api/posts.js' );
const media = require( '../lib/wpcom-api/media.js' );

const api = bluecat.Api( 'wp' );
api.oauth2.host = 'https://public-api.wordpress.com';
const service = new bluecat.ServiceSync( api, 'public-api.wordpress.com/rest/v1.1' );

// Test account for the upload
const account = config.testAccounts.i18nScreenshotUser;

// Locales to include in upload
const locales = process.argv[2].toUpperCase().split( ',' );

// e2e flows to include in upload
// identified by the flow name as it appears in the screenshot filename
const e2eFlows = [
	'sign-up-for-a-site-on-a-premium-paid-plan-through-main-flow',
	'partially-sign-up-for-a-site-on-a-business-paid-plan-w--domain-name-coming-in-via--create-as-business-flow'
];

// Directory where screenshots are saved
const imageFolder = path.join( __dirname, '/../screenshots-i18n/' );

// Prepare the images for upload, grouping them by locale & flow
const imageFormDataCollection = media.prepareUpload( locales, e2eFlows, imageFolder );

// Start the API calls
service.run( function() {
	var imageIDs;
	var imageFormData;
	var niceFlowID;
	var postFormData;
	var postContent;
	var r;

	// Oauth login
	oauth.login( service, account );

	// Publish a post for each locale
	for ( const locale of locales ) {
		console.log( `- Uploading ${locale} screenshots` );

		// Upload the media for all flows in the locale and capture their media IDs
		imageIDs = {};
		for ( const flow of e2eFlows ) {
			imageFormData = imageFormDataCollection[ locale ][ flow ];
			imageIDs[ flow ] = [];

			for ( const formData of imageFormData ) {
				r = media.upload( service, account[2], formData );
				expect( r.data.statusCode ).to.equal( 200 );

				imageIDs[ flow ].push( r.data.body.media[0].ID );
			}
		}

		// Prepare post content with one gallery per flow
		postContent = '';
		for ( const flowID in imageIDs ) {
			if ( imageIDs.hasOwnProperty( flowID ) ) {
				niceFlowID = flowID.charAt( 0 ).toUpperCase() + flowID.slice( 1 ).replace( /-/g, ' ' );
				postContent += `<h2>${niceFlowID}</h2><p>[gallery ids="${imageIDs[ flowID ]}"]</p>`;
			}
		}

		postFormData = {
			title: `${locale} Signup Screenshots`,
			content: postContent,
			categories: 'Signup',
			tags: locale
		};

		// Publish post
		r = posts.publish( service, account[2], postFormData );
		expect( r.data.statusCode ).to.equal( 200 );

		console.log( ` - Successfully published ${locale} post` );
	}
} );
