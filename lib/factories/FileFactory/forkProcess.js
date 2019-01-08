const { join } = require('path');
const { fork } = require('child_process');
const { FORK_PROCESS_MESSAGE_TYPE } = require('../../constants');


const { INIT, COMPLETE, ERROR, CLOSE } = FORK_PROCESS_MESSAGE_TYPE;


class FileFactoryForkProcess {
    constructor() {
        
        this._child = fork(join(__dirname, 'index.js'), [], { silent: false });
        this._handleMessage = evt => this._onMessage(evt);
        this._processing = false;
        this._child.on('message', this._handleMessage);
        return this;
    }

    process(options) {
        return new Promise((resolve, reject) => {
            
            if (this._processing) {
                reject('Busy process, already processing a file!');
                return this;
            };
            
            this._resolve = resolve;
            this._reject = reject;
            this._initChild(options);
        });
    }

    isAvailable() {
        return !this._processing;
    }
     
    _initChild({ filePaths, options }) {
        
        this._processing = true;
        this._child.send({ 
            type: INIT,
            message: {
                filePaths,
                options
            }
        });
        return this;
    }

    _onMessage({ type, message }) {

        switch (type) {
            case COMPLETE:
                this._resolve(message);
                break;
            case ERROR:
                this._reject(message);
                break;
        };

        this._processing = false;
        this._child.send({ type: CLOSE });
        return this;
    }

    _closeChild() {
        this._child.send({ type: CLOSE });
        this._child.off('message', this._handleMessage);
        this._child.kill('SIGKILL');
        return this;
    }

    close() {
        this._closeChild();
        delete this._child;
        delete this._resolve;
        delete this._reject;
        return this;
    }
};

module.exports = FileFactoryForkProcess;