class Klik {
    Keyboard = class Keyboard {
        constructor(keymap) { 
            this.keymap = keymap || {
                /* TODO: map keys */
            } 
        }
    
        get pressed() {
            return Object.keys(this.keymap)
                .filter(key => this.keymap[key].pressed)
                .sort((a, b) => this.keymap[a].keydownTime - this.keymap[b].keydownTime) // sorts the array numerically based off the time they were pressed, so they appear in order from [firstPressed, ... , lastPressed]
        }
    }

    keyboard = new this.Keyboard()

    _eventListeners = {
        'update':    []
        , 'keydown': []
        , 'keyup':   []
    }

    _callListeners = (eventName, ...eventArguments) => this._eventListeners[eventName].forEach(listener => listener(...eventArguments))

    _parseKeyEvent = (event, objectToMerge) => {
        const parsedObject = { _event: event }
        for (let key in objectToMerge) parsedObject[key] = objectToMerge[key]
        return parsedObject
    }

    _keydownCallback = key => {
        if (key.repeat) return 

        const keydownTime = Date.now()
              , oldKeymap = new this.Keyboard({ ...this.keyboard.keymap })
        
        const keyData = this._parseKeyEvent(key, {
            pressed:       true
            , keydownTime: keydownTime
        })

        this.keyboard.keymap[key.key] = keyData

        this._callListeners('update', new this.Keyboard({ ...this.keyboard.keymap }), oldKeymap)
        this._callListeners('keydown', keyData, new this.Keyboard({ ...this.keyboard.keymap }))
    }

    _keyupCallback = key => {
        const keyupTime   = Date.now()
              , oldKeymap = new this.Keyboard({ ...this.keyboard.keymap })

        const keyData = this._parseKeyEvent(key, { 
            pressed:       false 
            , keydownTime: this.keyboard.keymap[key.key].keydownTime
            , keyupTime:   keyupTime
            , pressTime:   keyupTime - this.keyboard.keymap[key.key].keydownTime
        })

        this.keyboard.keymap[key.key] = keyData

        this._callListeners('update', new this.Keyboard({ ...this.keyboard.keymap }), oldKeymap)
        this._callListeners('keyup', keyData, new this.Keyboard({ ...this.keyboard.keymap }))
    } 

    on(eventName, callback) {
        if (!this._eventListeners[eventName]) throw 'invalid event name placeholder'
        if (typeof callback !== 'function')   throw 'callback not function placeholder'

        if (eventName === 'keydown') document.addEventListener('keydown', this._keydownCallback)
        if (eventName === 'keyup')   document.addEventListener('keyup', this._keyupCallback)
        if (eventName === 'update')  document.addEventListener('keydown', this._keydownCallback), document.addEventListener('keyup', this._keyupCallback)

        this._eventListeners[eventName].push(callback)
    }
}

const klik = new Klik()

klik.on('update', (newKeyboard, oldKeyboard) => {
    console.log(newKeyboard, oldKeyboard)
})