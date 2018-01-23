const fs = require( 'fs' );

function prepareUpload( locales, flows, imageFolder ) {
	let imageFormData;
	let imageFormDataCollection = {};

	// Prepare the images to upload for each locale
	for ( const locale of locales ) {
		imageFormDataCollection[locale] = {};

		// Prepare the images to upload for each flow in the current locale
		for ( const flow of flows ) {
			const imageFiles = fs.readdirSync( imageFolder );
			const filter = new RegExp( `^${locale}-(DESKTOP|MOBILE)--${flow}` );

			// Prepare the formData for each image in the current locale and flow
			imageFormData = [];
			for ( const image of imageFiles ) {
				if ( filter.test( image ) ) {
					imageFormData.push( {
						media: fs.createReadStream( imageFolder + image )
					} );
				}
			}

			// Collect the formData for this locale & flow
			imageFormDataCollection[locale][flow] = imageFormData;
		}
	}

	return imageFormDataCollection;
}

module.exports.prepareUpload = prepareUpload;
