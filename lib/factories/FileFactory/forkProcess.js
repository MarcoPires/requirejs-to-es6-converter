const { join } = require('path');
const { fork } = require('child_process');


class FileFactoryForkProcess {
    constructor() {
        
        this._child = fork(join(__dirname, 'index.js'), [], { silent: false });
        this._handleMessage = evt => this._onMessage(evt);
        this._processing = false;
        this._child.on('message', this._handleMessage); //TODO REMOVE EVENT ON CLOSE
        this._setupGracefulShutdown();
        return this;
    }

    process(options) {
        return new Promise((resolve, reject) => {
            
            if (this._processing) {
                reject('processing') //TODO
                return this;
            };
            
            this._resolve = resolve;
            this._reject = reject;
            this._initChild(options);
        });
    }
     
    _setupGracefulShutdown() {
        /**
         * Task shutdown detected
         */
        process.on("SIGINT", () => this._closeChild());

        if (process.platform !== "win32") {
            return this;
        };

        const rl = require("readline").createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.on("SIGINT", function () {
            process.emit("SIGINT");
        });

        return this;
    }

    _initChild({ filePaths, options }) {

        this._processing = true;
        this._child.send({ 
            type: 'INIT',
            message: {
                filePaths,
                options
            }
        });
        return this;
    }

    _onMessage({ type, message }) {
        
        switch (type) {
            case 'COMPLETE':
                this._processing = false;
                this._resolve(message);
                this._closeChild.send({ type: 'CLOSE' });
                break;
            case 'ERROR':
                //TODO
                break;
        };
        return this;
    }

    _closeChild() {
        this._child.send({ type: 'CLOSE' }); //TODO constants
        this._child.kill('SIGKILL');
        process.exit(0);
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