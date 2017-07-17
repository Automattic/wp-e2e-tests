const fs = require( 'fs' );

function uploadMedia( service, siteID, formData ) {
	var r = service.sites['${site}'].media.new.POST( {
		params: { site: siteID },
		formData: formData
	} );

	return r;
}

function prepareUpload( locales, flows, imageFolder ) {
	var imageFormData;
	var imageFormDataCollection = {};

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
						'media[0]': fs.createReadStream( imageFolder + image )
					} );
				}
			}

			// Collect the formData for this locale & flow
			imageFormDataCollection[locale][flow] = imageFormData;
		}
	}

	return imageFormDataCollection;
}

module.exports.upload = uploadMedia;
module.exports.prepareUpload = prepareUpload;
