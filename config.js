module.exports = {
	fileDependencies: {
		alias: {
			ignore: ['eventbroker', 'associations'],
			replace: {
				'jquery': {
					path: 'vendor/js/jquery',
					rootRelative: true
				},
				'underscore': {
					path: 'vendor/js/underscore',
					rootRelative: true
				},
				'bangular': {
					path: 'vendor/js/bangular',
					rootRelative: true
				},
				'backbone': {
					path: 'vendor/js/backbone',
					rootRelative: true
				},
				'moment': {
					path: 'vendor/js/moment',
					rootRelative: true
				},
				'q': {
					path: 'vendor/js/q',
					rootRelative: true
				},
				'select': {
					path: 'vendor/js/bootstrap-select',
					rootRelative: true
				}
			}
		},

		plugins: {
			replace: {
				'i18n!nls/leap_translations': {
					path: 'translations',
					rootRelative: true
				}
			}
		}
	},
	entryFilePath: 'D:/Trabalho/Leya/leap-ui/dev_online/js/library/controllers/LibraryController.js', //'D:/Trabalho/Leya/leap-ui/dev_online/js/library/templates/base/AsideAreaContainerView.html', // //
	projectRootDir: 'library'
};