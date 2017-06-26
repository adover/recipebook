// - Pull down repository
// - Image Diff
// 	- Provide CSV of URLs
// 	- Provide folder to save diff screenshots into
// 	- Generate report of files which failed diff
// Recipe
// 	- Ask which recipe to download
// 	- Download that recipe
// 	- Run make installer for that recipe (child_process)
// 	- Create gitlab repo - https://www.npmjs.com/package/gitlab
// Vanilla
// 	- Run make installer
// 	- Create gitlab repo
// DNA Component
// 	- Get list of available components in library
// 	- Specify working directory
// 	- Specify type of project 
// 		- Add folder structure definitions
// 	- Copy files
// 	- Execute post build commands
// CI 
// 	- 


const chalk = require('chalk');
const clear = require('clear');
const CLI = require('clui');
const figlet = require('figlet');
const inquirer = require('inquirer');
const Preferences = require('preferences');
const Spinner = CLI.Spinner;
const _ = require('lodash');
const git = require('nodegit');
const fs = require('fs');
const { exec } = require('child_process');

const namespace = 'com.dna.helpers.recipebook';

// Store preferences (site working directory)
// Ask questions
// Clone repo



const repos = [
	{
		key: 'a',
		name: 'DNA Vanilla',
		desc: 'building a website from a predefined template',
		value: 'vanilla'
	},
	{
		key: 'b',
		name: 'DNA Recipe',
		desc: 'building a website from the foundations',
		value: 'recipe',
		url: 'https://github.com/dnadesign/dna-recipe'
	},
	{
		key: 'c',
		name: 'DNA Component',
		desc: 'to go into the component library',
		value: 'component'
	},
	{
		key: 'd',
		name: 'DNA CI',
		desc: 'creating a build/test suite to plug in to a site',
		value: 'ci'
	},
	{
		key: 'e',
		name: 'DNA Image Diff',
		desc: 'creating a diffing suite',
		value: 'image',
		url: 'https://github.com/adover/imagediff'
	},
]


class RecipeBook {
	constructor() {

		clear();
		console.log(chalk.green(figlet.textSync('DNA Recipe Book', {horizontalLayout: 'full'})));
		console.log(chalk.yellow('The starting point for all great projects!'));

		this.initPrefs();

		// this is where we'll store the project information
		this.project = {};
	}

	initPrefs() {

		this.prefs = new Preferences('namespace');

		if(!this.prefs.baseFolder) {
			console.log(chalk.yellow('You\'re new here, add a base folder for where you keep your projects'));
			
			const questions = [
				this.getQuestion('baseFolder','input',`Enter base project folder.`, (value) => this.validate(value, 'path'), null, '/Users/andy.dover/Sites/') //process.cwd())
			]

			this.askQuestions(questions, this.setPrefs.bind(this));	
		}

	}

	setPrefs() {

		this.prefs = {
			baseFolder: arguments[0]['baseFolder']
		}

		this.setFolder();
	}

	async setFolder() {

		const questions = [
			this.getQuestion('folderName','input','Name the folder to install into', (value) => this.validate(value)),
		]

		this.askQuestions(questions, async (answers) => {
			if(answers.folderName){
				await this.testDirectory(answers.folderName).then((a) => {
					this.chooseProjectType();
				}, (e) => {
					console.log(e);
					this.setFolder();
				});
			}
		})

	}

	chooseProjectType() {
		
		const question = this.getQuestion('projectType','expand','What type of project are you undertaking?', null, repos)

		this.askQuestions([question], this.initTask.bind(this));
	}

	initTask(answers) {

		console.log('Initialising Project...');

		const status = new Spinner();
    	status.start();

    	repos.forEach(async (repo, k) => {
    		if(repo.value === answers.projectType){
    			git.Clone(repos[k]['url'], this.project.dir).then(function(repo) { 
					console.log('Repo cloned successfully');
					status.stop();
				})
    		}
    	})

	}

	getQuestion(name, type, message, validate, choices = null, defaultResponse = null) {

		return {
		  name: name,
		  type,
		  choices,
		  default: defaultResponse,
		  message,
		  validate
		}
	}

	validate(value, type) {	

		if (value.length) {
			if(type === 'path' && value.indexOf('/') < 0){
				return 'BaseFolder is invalid. Try again';
			}else{
				return true;
			}
			

		} else {
			return 'Don\'t leave it blank';         
		}
	}

	testDirectory(value) {

		return new Promise((resolve, reject) => {

			this.project.dir = `${this.prefs.baseFolder}/${value}`.replace('//', '/');
			fs.stat(this.project.dir, async (err, stats) => {
				if(err || !stats.isDirectory()){
					fs.mkdir(this.project.dir, (err) => {
						if(err){
							reject('That didn\'t work, try again');
						}
						resolve(true);
					});
				}else{

					// TODO
					exec(`ls -A ${this.project.dir} | wc -l`, (err, stdout, stderr) => {
						if(err || stdout.trim() > 0){
							reject('Folder is not empty. Please choose another');
						}
						resolve('hello');
					})
				}
			})
		})

	}

	askQuestions(questions, callback) {

		return inquirer.prompt(questions).then(callback);

	}

}

const recipeBook = new RecipeBook();