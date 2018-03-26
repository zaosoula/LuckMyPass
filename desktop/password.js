const { app, Tray, Menu, BrowserView, BrowserWindow, shell, ipcMain, dialog } = require('electron')
const settings = require("electron-settings")
const menubar = require('menubar')
const path = require('path')
const url = require('url')
const fs = require('fs')
var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'itsdefaultpassword%';
var config_json = {
    crypted_file_path: './lmp.v'
}

const regen_crypt = false //if you want to generate new crypted file with the basic pass_hash, turn true

fs.open('./config.json', 'r', (err, fd) => {
    if (err) {
        if (err.code === 'ENOENT') {
            fs.writeFile('./config.json', JSON.stringify(config_json), function (err) {
                console.log('configuration file created')
            })
            console.error('configuration file does not exist');
            return;
        }

        throw err;
    }

    fs.readFile('./config.json', {encoding: 'utf-8'}, function(err,data){
        config_json = JSON.parse(data)
});
});

if(regen_crypt === true){
    fs.unlink(config_json.crypted_file_path, (err) => {
        if (err) throw err;
        console.log('crypted file was regenerated');
    });
}

var pass_hash = [

]

const iconPath = path.join(__dirname, '/logo.png');


    var mb = menubar({
    index: "file://" + __dirname + "/index.html",
    tooltip: "Luck My Pass",
    icon: iconPath,
    width:360,
    height:640,
    resizable: false,
    title: "SoLucky",
    preloadWindow: true,
    autoHideMenuBar: true,
    alwaysOnTop: true,
    frame: false,
    skipTaskbar: true
});

const contextMenu = Menu.buildFromTemplate([
    {
        label: 'Who is the author',
        click() {
            //We open the website at about
            shell.openExternal('https://thomas-t.fr/')
        }
    },
    {type: 'separator'},
    {
        label: 'Quit',
        click() {
            mb.app.quit();
            console.log('stopping');
        }
    }

]);

mb.on('ready', function () {
    console.log('Luck My Pass is ready');
    if (process.platform == 'win32') {
        mb.tray.setContextMenu(contextMenu);
    }
});

function encrypt(text){
    var cipher = crypto.createCipher(algorithm,password)
    var crypted = cipher.update(text,'utf8','hex')
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt(text){
    var decipher = crypto.createDecipher(algorithm,password)
    var dec = decipher.update(text,'hex','utf8')
    dec += decipher.final('utf8');
    return dec;
}

function findAndRemove(array, property, value) {
    array.forEach(function(result, index) {
        if(result[property] === value) {
            //Remove from array
            array.splice(index, 1);
        }
    });
}

function update_crypt(){
    fs.writeFile(config_json.crypted_file_path, encrypt('51onefile'+JSON.stringify(pass_hash)), function (err) {
        console.log('crypted file created')
    })
}

function add_id(id){
    pass_hash.push(id)
    update_crypt()
}

function remove_id(id){
    findAndRemove(pass_hash, 'domain', id)
    update_crypt()
}

ipcMain.on('synchronous-message', (event, arg) => {
    console.log(arg)  // affiche "ping"
    event.returnValue = pass_hash
})

ipcMain.on('new-item', (event, arg) => {
    add_id(arg)
    event.returnValue = pass_hash
})

ipcMain.on('remove-item', (event, arg) => {
    remove_id(arg)
    event.returnValue = pass_hash
})

ipcMain.on('password', (event, arg) => {
    password = crypto.createHash('sha256').update(arg+'@5DZVa').digest('base64');

    fs.open(config_json.crypted_file_path, 'r', (err, fd) => {
    if (err) {
        if (err.code === 'ENOENT') {
            fs.writeFile(config_json.crypted_file_path, encrypt('51onefile'+JSON.stringify(pass_hash)), function (err) {
                console.log('crypted file created')
                event.returnValue = true
            })
            return;
        }

        throw err;
    }

    fs.readFile(config_json.crypted_file_path, {encoding: 'utf-8'}, function(err,data){
    decr = decrypt(data)
    if(decr.substr(0, 9) === '51onefile'){
        pass_hash = JSON.parse(decr.substr(9))
        event.returnValue = true
    } else {
        event.returnValue = false
        //mb.app.quit();
    }
});
});
})

ipcMain.on('select-new-path', (event, arg) => {
    config_json.crypted_file_path = dialog.showOpenDialog({properties: ['openDirectory']}) + '/lmp.v'
    fs.writeFile('./config.json', JSON.stringify(config_json), function (err) {})
    event.returnValue = true
})

ipcMain.on('select-default-path', (event, arg) => {
    config_json.crypted_file_path = './lmp.v'
    fs.writeFile('./config.json', JSON.stringify(config_json), function (err) {})
    event.returnValue = true
})

//https://howsecureismypassword.net/