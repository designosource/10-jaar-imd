# 10-jaar-imd

## Launch instructions

- Create a `config.js` file in `configuration/` and fill in the blanks found in `config.json.dist`
- Create a map `data/` in the root directory
- Run `mongod --dbpath path\to\app\imd_timeline\data`
- Open another terminal and run `mongo` and `use imd_timeline`
- Open another terminal, go to the root folder and run `npm start`
- The app will be running on [localhost port 3000](http://localhost:3000)
