(function(){

    class Validator{


        constructor(form){
            this._form = form;
            this._data = {};
            this._valid = true;
        }
        init(){
            this._inputs = Array.prototype.slice.call(this._form.elements);
            this._requiredInputs = this._inputs.filter(el => el.hasAttribute('required'));
            this.initListeners(self);
        }

        validate(self, e){
            let dataRegex = this.dataset.regexp;
            let reg = new RegExp(dataRegex);
            let parent = this.closest('.form-group');
        if (!reg.test(this.value) && this.value
            || !reg.test(this.value) && e.type === 'submit'
            || this.tagName === 'SELECT' && !this.value) {

            parent.classList.add('has-error');
            self._valid = false;
            self._data = {};
         }
         else {
            self._data[this.name] = this.value;
            parent.classList.remove('has-error');
            }
        }

saveData(){
    if (!this._valid) return;
    let user;
    switch (this._data.role) {
        case 'admin':
        user = new Admin(this._data.username, this._data.email);
        break;
        case 'user':
        user = new User(this._data.username, this._data.email);
        break;
        case 'guest':
        user = new Guest(this._data.username, this._data.email);
        break;
    }

    user.create(true);
    this._inputs.forEach(elem => {
        if (elem.tagName === 'SELECT') elem.selectedIndex = 0;
        else elem.value = null
    });
}


initListeners(){
    this._requiredInputs.forEach(el => el.addEventListener('change', e => this.validate.call(e.target, this, e)));
    this._form.addEventListener('submit', e => {
        e.preventDefault();
        this._valid = true;
        this._requiredInputs.forEach(el => this.validate.call(el, this, e));
        this.saveData();
    });
}
}

class Person {
    constructor(name, email) {
        this._username = name;
        this._email = email;
        this._table = document.querySelector('table');
        this._body = this._table.tBodies[0];
        this._columns = Array.prototype.map.call(document.querySelector('table').rows[0].cells, cell => cell.dataset.type);
        this._info = {username: this._username, email: this._email};
    }

    create(flag, index) {
        let row = document.createElement('tr');
        this._columns.forEach(type => {
            let cell = document.createElement('td');
            cell.textContent = this[`_${type}`];
            cell.dataset.id = type;
            row.appendChild(cell);
            row.addEventListener('click', e => this.edit.call(this, e));
        });
        if (index) {
            this._table.insertRow(index);
        } else {
            this._body.appendChild(row);
        }
        if (flag) this.save();
    }

    edit(e) {
        let target = e.target;
        if (target.tagName !== 'TD') return;
        let self = this,
        oldInfo = target.textContent,
        tempContent;


        if (target.dataset.id === 'role') {
            let select = document.querySelector('select').cloneNode(true);
            select.addEventListener('change', e => {
                let row = e.target.closest('tr'),
                index = row.rowIndex,
                user;
                console.log(index);
                this._info[target.dataset.id] = e.target.value;
                target.textContent = e.target.value;
                window.localStorage.removeItem(this._username);
                switch (e.target.value) {
                    case 'admin':
                    user = new Admin(this._info.username, this._info.email);
                    break;
                    case 'user':
                    user = new User(this._info.username, this._info.email);
                    break;
                    case 'guest':
                    user = new Guest(this._info.username, this._info.email);
                    break;
                }

                user.create(false, index);
                self.save();
            });
            tempContent = select;
        } else {
            let input = document.createElement('input');
            input.dataset.regexp = document.forms[0][target.dataset.id].dataset.regexp;
            input.value = oldInfo;
            input.addEventListener('change', e => {
                let reg = new RegExp(e.target.dataset.regexp);
                if (!reg.test(e.target.value) || !e.target.value) {
                    e.target.value = oldInfo;
                }
                target.textContent = e.target.value;
                this._info[target.dataset.id] = e.target.value;
                self.save();
            });
            tempContent = input;
            }
        target.textContent = '';
        target.appendChild(tempContent);
    }

    save() {
        if (window.localStorage.getItem(this._username)) {
            window.localStorage.removeItem(this._username);
            }
        window.localStorage.setItem(this._username, JSON.stringify(this._info));
         }

    static load() {
        let data = [];
        for (let i = 0; i < window.localStorage.length; i++) {
            data.push(JSON.parse(window.localStorage.getItem(window.localStorage.key(i))));
        }
        data = data.filter(obj => obj.hasOwnProperty('role') && obj.hasOwnProperty('username') && obj.hasOwnProperty('email'));
        data.forEach(el => {
            let user;
            switch (el.role) {
                case 'admin':
                user = new Admin(el.username, el.email);
                break;
                case 'user':
                user = new User(el.username, el.email);
                break;
                case 'guest':
                user = new Guest(el.username, el.email);
                break;
            }

            user.create(false);
        });
    }

}

class Admin extends Person {
    constructor(name, email) {
        super(name, email);
        this._role = 'admin';
        this._info = {username: this._username, email: this._email, role: this._role};
    }
}

class User extends Person {
    constructor(name, email) {
        super(name, email);
        this._role = 'user';
    }
}

class Guest extends Person {
    constructor(name, email) {
        super(name, email);
        this._role = 'guest';
        this._info = {username: this._username, email: this._email, role: this._role};
    }
}

const form = new Validator(document.forms[0]);
form.init();
Person.load();
})();