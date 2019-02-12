module.exports = {
	fileDependencies: {
		alias: {

			ignore: ['eventbroker', 'associations', 'videojs'],

			includeImport: [
				{
					variable: 'Backbone',
					path: 'ui-legacy-core',
					namedImport: 'Backbone'
				}
			],

			replace: {
				'jquery': {
					path: 'ui-legacy-core',
					namedImport: '$'
				},
				'jquery-block': {
					path: 'ui-legacy-core',
					namedImport: '$'
				},
				'preloader': {
					path: 'vendor/js/jquery-preloader',
					rootRelative: true
				},
				'cookie': {
					path: 'ui-legacy-core',
					namedImport: '$'
				},
				'underscore': {
					path: 'ui-legacy-core',
					namedImport: '_'
				},
				'bangular': {
					path: 'ui-legacy-core',
					namedImport: 'Bangular'
				},
				'backbone': {
					path: 'ui-legacy-core',
					namedImport: 'Backbone'
				},
				'bootstrap': {
					path: 'ui-legacy-core',
					namedImport: '$'
				},
				'moment': {
					path: 'ui-legacy-core',
					namedImport: 'moment'
				},
				'q': {
					path: 'ui-legacy-core',
					namedImport: 'Q'
				},
				'select': {
					path: 'ui-legacy-core',
					namedImport: '$'
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
							const replacer = `Log.get('ui-publication-viewer').debug(${logsContentList[index]});`;
							index++;
							return replacer;
						}
					});
				}
			}
		]
	},

	//entryFilePath: 'H:/leap/leap-ui/dev_online/js/library/controllers/CatalogEntriesController.js', //'D:/Trabalho/Leya/leap-ui/dev_online/js/library/templates/base/AsideAreaContainerView.html', // //
	projectRootDir: 'viewer'
};