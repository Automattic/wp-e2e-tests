/** @format */
import { WebClient } from '@slack/client';
import fs from 'fs';
import { PassThrough } from 'stream';
import webdriver from 'selenium-webdriver';
import pngitxt from 'png-itxt';

export default class SlackBot {
	constructor( token, channelName, defaultOpts = {} ) {
		this.defaultOpts = defaultOpts;
		this.web = new WebClient( token );
		this.channelName = channelName;
	}

	async findChannelByName( name = this.channelName ) {
		let list = await this.web.channels.list();

		this.channel = list.channels.find( c => c.name === name.replace( '#', '' ) );

		return this.channel;
	}

	async send( text, opts = {} ) {
		opts = Object.assign(
			{},
			this.defaultOpts,
			{
				text,
				channel: this.channel.id,
			},
			opts
		);

		console.log( '+++++++++++++++++++++++++++++++++++' );
		console.log( opts.attachments[ 0 ].fields );
		console.log( '+++++++++++++++++++++++++++++++++++' );
		let res = await this.web.chat.postMessage( opts );
		console.log( 'Message sent: ', res.ts );
		return res;
	}

	async updateMessage( text, messageTS, opts = {} ) {
		opts = Object.assign(
			{},
			this.defaultOpts,
			{
				text,
				channel: this.channel.id,
				ts: messageTS,
			},
			opts
		);

		let res = await this.web.chat.update( opts );
		console.log( 'Message updated: ', res.ts );
		return res;
	}

	async sendToThread( text, threadTS, opts = {} ) {
		if ( ! threadTS ) {
			throw 'threadTS is required!';
		}
		opts = Object.assign(
			{},
			this.defaultOpts,
			{
				channel: this.channel.id,
				thread_ts: threadTS,
			},
			opts
		);

		return await this.send( text, opts );
	}

	extractURL( filename ) {
		const d = webdriver.promise.defer();
		let pt = new PassThrough();

		pt = pt.pipe( fs.createReadStream( filename ) );
		pt.pipe(
			pngitxt.get( 'url', ( err, data ) => {
				return d.fulfill( data ? data : '' );
			} )
		);

		return d.promise;
	}

	async uploadFile( filename, opts = {} ) {
		// let url = await this.extractURL( filename );

		opts = Object.assign(
			{},
			this.defaultOpts,
			{
				// filename,
				file: fs.createReadStream( filename ),
				title: `${ filename } - # ${ process.env.CIRCLE_BUILD_NUM }`,
				channels: this.channel.id,
			},
			opts
		);

		let res = await this.web.files.upload( opts );
		console.log( 'File uploaded: ', res.file.id );

		return res;
	}
}
