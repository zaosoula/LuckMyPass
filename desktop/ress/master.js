var app = new Vue({
    el: '#app',
    data: {
        page: 'menu',
        search: '',
        password: false,
        acpassword: '',
        newdomain: '',
        newid: '',
        newpass: '',
        new: {
            domain: '',
            id: '',
            pass: '',
            show: false
        },
        passwords: {

        },
        freepass: ''
    },

    methods: {
        down: function(v){
            if(v.indexOf(this.search) === -1 && this.search !== ''){
                return false
            } else {
                return true
            }
        },
        changestate: function (item) {
            if(item.show){
                item.show = false
            } else {
                item.show = true
            }
        },
        add: function () {
            this.passwords = ipcRenderer.sendSync('new-item', {
                domain: this.newdomain,
                id: this.newid,
                pass: this.newpass,
                show: false
            })
        },
        testpass: function () {
            var value = ipcRenderer.sendSync('password', this.acpassword)
            if(value){
                this.password = true
                this.acpassword = ''
                this.passwords = ipcRenderer.sendSync('synchronous-message', 'ping')
            }
        },
        password_gen: function () {
            var table = "0123456789!µ*@1éabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!µ*@1é"
            var gen = ''
            for(i = 0; i <= 20; i++){
                gen += table[Math.floor((Math.random() * table.length) + 0)]
            }
            this.freepass = gen

            /*navigator.clipboard.writeText(gen).then(function() {
                console.log('Async: Copying to clipboard was successful!');
            }, function(err) {
                console.error('Async: Could not copy text: ', err);
            });*/
        },
        cpage: function (i) {
            this.page = i
        },
        suppr: function (i) {
            this.passwords = ipcRenderer.sendSync('remove-item', i)
        },
        update: function (i) {

        },
        changepath: function () {
            var result = ipcRenderer.sendSync('select-new-path')
            if(result){
                this.passwords = ipcRenderer.sendSync('synchronous-message', 'ping')
            }
        },
        changepathdefault: function () {
            var result = ipcRenderer.sendSync('select-default-path')
            if(result){
                this.passwords = ipcRenderer.sendSync('synchronous-message', 'ping')
            }
        }
    },

    filters: {
        Upp(v){
            return v.toUpperCase()
        }
    }
})

const {ipcRenderer} = require('electron')
//app.passwords = ipcRenderer.sendSync('synchronous-message', 'ping') // affiche "pong"