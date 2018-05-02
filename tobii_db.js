/**
 *
 */
class Tobii_db{
    /**
     * Initializes a webSQL database
     * @param name
     * @param version
     * @param description
     * @param size
     */
    constructor(name,version,description,size) {
        this.db = openDatabase(name, version, description, size);
    }

    // Complex functions

    /**
     * initializes a database: dbObj is an array. Each element of dbObj represents a tabele and is an object with the
     * properties {name,create,init,test}. name is the table name, create is the query to create the table, init contains
     * the elements that are inserted into the table at creation {column name: value,...}.
     * test is the same as init, but only for debugging purposes.
     * mode defines how much is executed.
     * @param dbObj
     * @param mode ["create","init","test"], default:"create"
     */
    createAll(dbObj,mode,followUp){
        var sql = [];
        for (let str of dbObj) {
            sql.push(str.create);
            console.log("Create table "+str.name);
        }
        if(mode!==undefined && (mode==="init" || mode==="test"))
        for (let str of dbObj){
            sql = sql.concat(Tobii_db.query_insert(str.init,str.name));
        }
        if(mode!==undefined && mode==="test"){
            for(let str of dbObj){
                sql = sql.concat(Tobii_db.query_insert(str.test,str.name));
            }
        }
        this.run_sql_array(sql,followUp);
    }

    dropAll(dbObj,followUp){
        var tables = [];
        for(let element of dbObj){
            tables.push(element.name);
        }
        this.run_sql_array(Tobii_db.query_drop_tables(tables),followUp);
    }

    // Basic functions

    run(sql,followUp){
        if(typeof sql === "string"){
            this.run_sql(sql,followUp);
        }else{
            this.run_sql_array(sql,followUp);
        }
    }

    run_sql(sql,followUp){
        this.db.transaction(function (tx) {
            tx.executeSql(sql);
            if(typeof followUp !== "undefined"){
                followUp();
            }
        })
    }

    run_sql_array(sqls,followUp){
        this.db.transaction(function (tx) {
            for(let ii = 0;ii<sqls.length;ii++){
                tx.executeSql(sqls[ii]);
            }
            if(typeof followUp !== "undefined"){
                followUp();
            }
        });
    }

    get_sql(sql,followUp){
        this.db.transaction(function (tx) {
            tx.executeSql(sql,[],function (tx,res) {
                followUp(Tobii_db.toJSON(res.rows));
            },function (err) {
                console.log(err);
            });
        });
    }

    get_sql_array(sqls,followUp,results){
        let n_db = this;
        if(typeof results === "undefined"){
            results = [];
        }
        this.db.transaction(function (tx) {
            let tmp = sqls.shift();
            tx.executeSql(tmp,[],function (tx,res) {
                results.push(Tobii_db.toJSON(res.rows));
                if(sqls.length>0){
                    n_db.get_sql_array(sqls,followUp,results);
                }else{
                    followUp(results);
                }
            },function(err){
                console.log(err);
            });
        });
    }

    test_sql(sql){
        this.get_sql(sql,function(res){console.log(res);})
    }

    /**
     *
     */
    addFutureExecution(execution_id,sql,timeout){
        let time = new Date();
        if(this.myFutureExecutions === "undefinded"){

        }
        this.myFutureExecutions[execution_id].sql = sql;
        this.myFutureExecutions[execution_id].executionTime = time + timeout*1000;
    }

    executeIntervall(){
        let keys = Object.keys(this.myFutureExecutions);
        let time = new Date();
        for(let key of keys){
            if(this.myFutureExecutions[key].executionTime<time.getTime()){
                this.run(this.myFutureExecutions[key].sql);
                delete this.myFutureExecutions[key];
            }
        }
    }

    /**
     * Static Functions
     */


    static query_insert(values,table){
        let val; var output = [];
        if(Array.isArray(values)){
            val = values;
        }else {
            val =[values];
        }
        for(let ii=0;ii<val.length;ii++){
            let keys = Object.keys(val[ii]);
            let vals = Object.values(val[ii]);

            let sql = "INSERT INTO "+table+" ("+keys[0];
            let sqlVal = "VALUES('"+vals[0]+"'";

            for(let qq=1;qq<keys.length;qq++){
                sql    += ", " +keys[qq];
                sqlVal += ", '"+vals[qq]+"'";
            }
            output.push(sql+") "+sqlVal+");");
        }
        return output;
    }

    static query_drop_tables(tables,schema){
        if(!Array.isArray(tables)){
            tables = [tables];
        }
        if(schema ===undefined){
            schema = "";
        }else{
            schema += "."
        }
        let output = [];
        for(let table of tables){
            output.push("DROP TABLE IF EXISTS "+schema+table+";");
        }
        return output;
    }


    static toJSON(obs){
        if (obs.constructor.name === "SQLResultSetRowList") {
            let res = [];
            for (let ii = 0; ii < obs.length; ii++) {
                if (typeof obs[ii] === "object") {
                    res.push(obs[ii]);//Tobii_db.toJSON(obs[ii]));
                } else {
                    res.push(obs[ii]);
                }
            }
            return res;
        }
        return obs;
    }


}