function publishPost( service, siteID, formData ) {
	var r = service.sites['${site}'].posts.new.POST( {
		params: { site: siteID },
		formData: formData
	} );

	return r;
}

module.exports.publish = publishPost;
