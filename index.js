#!/usr/bin/env node --harmony
var chalk = require('chalk');
var request = require('superagent');
var co = require('co');
var prompt = require('co-prompt');
var program = require('commander');

program
	.arguments('<file>')
	.option('-u --username <username>', 'The user to authenticate as')
	.option('-p --password <password>', 'The user\'s password')
	.action(function(file) {
		co(function *() {
			var username = yield prompt('Username: ');
			var password = yield prompt.password('Password: ');
			// console.log('user: %s pass: %s file: %s', username, password, file);
			request
				.post('https://api.bitbucket.org/2.0/snippets/')
				.auth(username, password)
				.attach('file', file)
				.set('Accept', 'application/json')
				.end(function (err, res) {
					if (!err && res.ok) {
						var link = res.body.links.html.href;
						console.log(chalk.bold.cyan('Snippet created: ') + link);
						process.exit(0);
					}

					var errorMessage;
					if (res && res.status === 401) {
						errorMessage = "Authentication failed! Wrong username/password";
					} else if (err) {
						errorMessage = err;
					} else {
						errorMessage = res.text;
					}
					console.error(chalk.red(errorMessage));
					process.exit(1);
				});
		});
	}).parse(process.argv);