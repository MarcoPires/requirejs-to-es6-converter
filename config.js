module.exports = {
	fileDependencies: {
		alias: {

			ignore: ['eventbroker', 'associations'],

			includeImport: [
				{
					variable: 'Backbone',
					path: 'vendor/js/backbone',
					rootRelative: true
				}
			],

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

			ignore: ['text!library/configs.json'],

			replace: {
				'i18n!nls/leap_translations': {
					path: 'translations',
					rootRelative: true,
					ignoreFileProcessing: true
				}
			}
		}
	},

	transformFileData: {

		additionalSteps: [
			{
				handle: 'CODE_DEFINITION',

				fileType: ['js'],

				middleWare: async (data, regexHelper) => {
					const logsContentList = regexHelper.captureLogString(data, { logClassNamespace: 'Log' });
					let index = 0;

					return regexHelper.removeLog(data, {
						logClassNamespace: 'Log', 
						replacementCallback: () => {
							const replacer = `Log.get('ui-legacy-publications-library').debug(${logsContentList[index]});`;
							index++;
							return replacer;
						}
					});
				}
			}
		]
	},

	//entryFilePath: 'H:/leap/leap-ui/dev_online/js/library/controllers/CatalogEntriesController.js', //'D:/Trabalho/Leya/leap-ui/dev_online/js/library/templates/base/AsideAreaContainerView.html', // //
	projectRootDir: 'library'
};