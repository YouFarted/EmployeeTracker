const path = require('path')
const inquirer = require('inquirer')
const mysql = require('mysql')
const Database = require(path.join(__dirname, "lib", "database"))

const myMysqlRootPassword = process.env.MYSQLROOTPASSWORD

const student_unique_database_name = "andrewo_employee_assignment_db"


let db = new Database({
    host: "localhost",
    user: "root",
    password: myMysqlRootPassword,
    database: "sys"
})

db.query(`SHOW DATABASES LIKE '${student_unique_database_name}'`)
.then(function (results) {
    if(results.length === 0) {
        createTheDatabase()
        .then(() => playInquirer())
        .then(() => db.close())
        .catch(e => console.error(e))
    }
    else {
        playInquirer()
        .then(() => db.close())
        .catch(e => console.error(e))
    }
});

function createTheDatabase() {
    return db.query(`CREATE DATABASE ${student_unique_database_name}`)
    .then(() => db.query(`USE ${student_unique_database_name}`))
    .then(() => db.query(`CREATE TABLE farts ( 
        id INT NOT NULL AUTO_INCREMENT,
        artist VARCHAR(100) NULL,
        PRIMARY KEY (id) )`))
    .then(() => db.query(`CREATE TABLE department ( 
            id INT NOT NULL AUTO_INCREMENT,
            name VARCHAR(30) NOT NULL,
            PRIMARY KEY (id) )`))
    .then(() => db.query(`CREATE TABLE role ( 
            id INT NOT NULL AUTO_INCREMENT,
            title VARCHAR(30) NOT NULL,
            salary DECIMAL NOT NULL,
            department_id INT NOT NULL,
            CONSTRAINT fk_department
            FOREIGN KEY (department_id)
            REFERENCES department(id),
            PRIMARY KEY (id) )`))
    .then(() => db.query(`CREATE TABLE employee ( 
        id INT NOT NULL AUTO_INCREMENT,
        first_name VARCHAR(30) NOT NULL,
        last_name VARCHAR(30) NOT NULL,
        role_id INT NOT NULL,
        manager_id INT NOT NULL,
        CONSTRAINT fk_role
        FOREIGN KEY (role_id)
        REFERENCES role(id),
        CONSTRAINT fk_manager
        FOREIGN KEY (manager_id)
        REFERENCES employee(id),
        PRIMARY KEY (id) )`))
}

function playInquirer() {
    return Promise.resolve(100)
}