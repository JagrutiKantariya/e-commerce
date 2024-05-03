const path = require("path");
const fs = require("fs");

const helper = {
    deleteSingleFile : async (filename, filepath) => {
        try {
            console.log(filepath + filename)
            if (fs.existsSync(filepath + filename) && filename != '') {
                await fs.unlinkSync(filepath + filename);
                return true;
            } else {
                return false;
            }
        } catch (e) {
            console.log("un link single file : ", e);
            return false;
        }
    }
}

module.exports = helper