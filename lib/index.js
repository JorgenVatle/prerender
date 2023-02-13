const fs = require('fs');
const path = require('path');
const http = require('http');
const util = require('./util');
const basename = path.basename;
const server = require('./server');
const express = require('express');
const expressApp = express();
const bodyParser = require('body-parser');
const compression = require('compression');

exports = module.exports = (options = {
	logRequests: process.env.PRERENDER_LOG_REQUESTS === 'true'
}) => {
	server.onRequest = server.onRequest.bind(server);

	expressApp.disable('x-powered-by');
	expressApp.use(compression());

	expressApp.get('*', server.onRequest);

	//dont check content-type and just always try to parse body as json
	expressApp.post('*', bodyParser.json({ type: () => true }), server.onRequest);

	server.init(options, expressApp);

	return server;
};

fs.readdirSync(__dirname + '/plugins').forEach((filename) => {
	if (!/\.js$/.test(filename)) return;

	var name = basename(filename, '.js');

	function load() {
		return require('./plugins/' + name);
	};

	Object.defineProperty(exports, name, {
		value: load
	});
});
