import db from './Database.js';

class Delete {
    // Constructor
    constructor(data = {}) {
        this.actions = {};
        this.callbacks = {};
        this.success = () => true;
        this.error = () => true;

        this.success = data.success || this.success;
        this.error = data.error || this.error;
    }
    // Message Function
    msg(type, msgData = {}) {
        const data = {
            data: msgData,
            status: type,
        };
        return data;
    }
    // on callback calling
    on(action, callback) {
        this.callbacks[action] = callback;
    }
    // Set Function
    set(action) {
        if (action instanceof Object) {
            for (const key in action) {
                let tableName = action[key];
                this.actions[key] = tableName;
            }
        }
        return true;
    }
    // Callback Function
    callback(type) {
        if (type === "success") {
            const success = this.success();
            if (success !== false)
                return this.msg("success", "Data Deleted Successfully!");

            return true;
        }
        if (type === "error") {
            const error = this.error();
            if (error) {
                return this.msg("error");
            }
            return true;
        }
    }
    // Validate Function
    validate(action, dataId) {
        if (this.callbacks[action]) {
            const data = {
                action: action,
                id: dataId
            };
            const res = this.callbacks[action](this, data);
            return res;
        } else {
            return true;
        }
    }
    // Init Function
    init(req) {
        let params = req.body;
        if (!params.action || !params.target) {
            return false;
        }
        let action = params.action,
            dataId = params.target;

        if (this.actions[action]) {
            let tableName = this.actions[action];
            return this.delete(dataId, tableName, action);
        } else
            return this.callback("error", 'Invalid Action!');

    }
    // Delete Function
    delete(dataId, tableName, action) {
        const res = this.validate(action, dataId);
        if (res) {
            const deleteResult = db.delete(tableName, { id: dataId });
            if (deleteResult) 
                return this.callback("success");
            
            return this.callback("error");
        } else {
            return this.callback("error");
        }
    }
}

export default Delete;
