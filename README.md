# 10-jaar-imd

## Launch instructions

- Run the `npm install` command in the root directory
- Create a `config.js` file in `configuration/` and fill in the blanks found in `config.json.dist` -> contact me for this
- Create a map `data/` in the root directory
- Download [MongoDB](https://www.mongodb.org/downloads)
- Run `mongod --dbpath path\to\app\imd_timeline\data` in MongoDB's `bin` folder
- Open another terminal and run `mongo` and `use imd_timeline` in MongoDB's `bin` folder
- Open another terminal, go to the root folder and run `npm start`
- The app will be running on [localhost port 3000](http://localhost:3000)
