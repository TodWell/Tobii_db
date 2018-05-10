class Tobii {
    /**
     * Transforms a list of objects to a table, not existing entries are set null
     * @param obs, list of
     * @returns {Array}
     */
    static toJSON(obs) {
        if (Array.isArray(obs)) {
            let res = [];
            for (let ii = 0; ii < obs.length; ii) {
                if (typeof obs[ii] === "object") {
                    res.push(Tobii.toJSON(obs[ii]));
                } else {
                    res.push(obs[ii]);
                }
            }
            return res;
        } else {
            let res = {};
            let keys = Object.keys(obs);
            let vals = Object.values(obs);
            for (let ii = 0; ii < keys.length; ii++) {
                if (typeof vals === "object") {
                    res[keys[ii]] = Tobii.toJSON(vals[ii]);
                } else {
                    res[keys[ii]] = vals[ii];
                }
            }
            return res;
        }
    }

    /**
     * Fill an html table with the given list
     * @param list
     * @param table
     * @param header (optional)
     */
    static tableToHtml(list,table,header){
        // Delete existing table
        table.innerHTML = "";
        // Extract column names
        let keys = Object.keys(list[0]);
        // If header is not defined, use keys
        if(header===undefined){
            header = keys;
        }
        // Create header
        {
            let table_head = document.createElement("thead");
            table.appendChild(table_head);
            let row = table_head.insertRow();
            for (let head of header) {
                row.insertCell().innerText = head;
            }
        }
        // Create Body
        {
            let table_body = document.createElement("tbody");
            table.appendChild(table_body);
            for(let line of list){
                let row = table_body.insertRow();
                for(let key of keys){
                    row.insertCell().innerText = line[key];
                }
            }
        }
    }
    
    static execFollowUp(followUp){
        if(typeof followUp === "function"){
            followUp();
        }
    }
}

