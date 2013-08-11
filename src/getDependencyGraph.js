define(function(require) {

	'use strict';


	var path = require('path');

	var getDependencies = require('./getDependencies');
	var resolve = require('./modules/resolve');


	var getDependencyGraph = function(file, rjsconfig) {

		var visited = {};

		var graph = function(file) {
			var node = {
				file: file,
				deps: []
			};

			if (visited[file]) {
				return visited[file]; // cycle
			}

			visited[file] = node;

			getDependencies(file, rjsconfig)
				.filter(function(dep) {
					return dep !== 'require' && (dep.search(/:\/\//) === -1);
				})
				.map(function(dep) {
					var resolved = resolve(dep, path.dirname(file), rjsconfig);
					if (!resolved) {
						throw new Error('Could not resolve dependency "' + dep + '" from file "' + file + '"');
					}
					return resolved;
				})
				.forEach(function(dep) {
					node.deps.push(graph(dep));
				});

			return node;
		};

		return graph(file);

	};


	return getDependencyGraph;

});
