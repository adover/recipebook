const chalk = require('chalk');
const clear = require('clear');
const CLI = require('clui');
const figlet = require('figlet');
const inquirer = require('inquirer');
const Preferences = require('preferences');
const Spinner = CLI.Spinner;
const GitHubApi = require('github');
const _ = require('lodash');
const git = require('nodegit');
const fs = require('fs');
const { exec } = require('child_process');

const namespace = 'com.dna.helpers.recipebook';

// Store preferences (site working directory)
// Ask questions
// Clone repo

const urls = {
	recipe: 'https://github.com/dnadesign/dna-recipe'
	image: 'https://github.com/adover/imagediff'
}
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

		this.projectSetup();
	}

	async projectSetup() {

		const choices = [
			{
				key: 'a',
				name: 'DNA Vanilla (building a website from a predefined template)',
				value: 'vanilla'
			},
			{
				key: 'b',
				name: 'DNA Recipe (building a website from the foundations)',
				value: 'recipe'
			},
			{
				key: 'c',
				name: 'DNA Component (to go into the component library)',
				value: 'component'
			},
			{
				key: 'd',
				name: 'DNA CI (creating a build/test suite to plug in to a site)',
				value: 'ci'
			},
			{
				key: 'e',
				name: 'DNA Image Diff (creating a diffing suite)',
				value: 'image'
			},
		]
			
		const questions = [
			this.getQuestion('folderName','input','Name the folder to install into', this.testDirectory.bind(this)),
			this.getQuestion('projectType','expand','What type of project are you undertaking?', null, choices)
		]

		this.askQuestions(questions, (answers) => {
			this.initTask(answers)
		})

	}

	initTask(answers) {

		const status = new Spinner('Initialising Project...');
    	status.start();

		switch(answers.projectType) {
			case 'vanilla':
				git.clone(urls.vanilla, this.project.dir)  .then(function(repo) {
    				//
  				})
			case 'recipe':
				git.clone(urls.recipe, this.project.dir)  .then(function(repo) {
    				//
  				})
			case 'component':
				git.clone(urls.component, this.project.dir)  .then(function(repo) {
    				//
  				})
			case 'ci':
				git.clone(urls.ci, this.project.dir)  .then(function(repo) {
    				//
  				})
			case 'image':
				git.clone(urls.image, this.project.dir)  .then(function(repo) {
    				//
  				})
		}
	}

	getQuestion(name, type, message, validate, choices = null, defaultResponse = null) {

		return {
		  name,
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

			this.project.dir = `${this.prefs.baseFolder}/${value}`.replace('//', '/')
			fs.stat(this.project.dir, async (err, stats) => {
				if(err || !stats.isDirectory()){
					fs.mkdirSync(this.project.dir, (err) => {
						if(err){
							resolve('That didn\'t work, try again');
						}
						resolve(true);
					});
				}else{

					// TODO
					exec(`ls -A ${this.project.dir} | wc -l`, (err, stdout, stderr) => {
						if(err || stdout.trim() > 0){
							// console.log(stdout.trim());
							resolve('That didn\'t work, try again');
						}
						resolve(true);
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