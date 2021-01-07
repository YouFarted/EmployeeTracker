const path = require('path')
const inquirer = require('inquirer')
const mysql = require('mysql')
const Database = require(path.join(__dirname, "lib", "database"))
const employeeEntry = require(path.join(__dirname, "lib", "employeeEntry"))

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
        useTheDatabase()
        .then(() => playInquirer())
        //.then(() => db.close())
        .catch(e => console.error(e))
    }
}).catch(e => console.error(e))

function useTheDatabase() {
    return db.query(`USE ${student_unique_database_name}`)
}

function createTheDatabase() {
    return db.query(`CREATE DATABASE ${student_unique_database_name}`)
    .then(() => db.query(`USE ${student_unique_database_name}`))
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
        CONSTRAINT fk_manager  -- There will be ONE root manager, the CEO.
        FOREIGN KEY (manager_id)
        REFERENCES employee(id),
        PRIMARY KEY (id) )`))
    .then(() => db.query(`INSERT INTO department (id, name) VALUES (1, "OWNERSHIP")`))
    .then(() => db.query(`INSERT INTO role (id, title, salary, department_id) VALUES (1, "CEO", 0, 1)`))
    .then(() => db.query(`INSERT INTO employee (id, first_name, last_name, role_id, manager_id) VALUES (1, "Lord", "Farquaad", 1, 1)`))
}

function playInquirer() {
    return employeeEntry.whatWouldYouLikeToDo(db)
    //return Promise.resolve(100)
}

/*

USE andrewo_employee_assignment_db;

SET foreign_key_checks = 0;
DELETE FROM employee WHERE id=1;
DELETE FROM role WHERE id=1;
DELETE FROM department WHERE id=1;

INSERT INTO department (id, name) VALUES (1, "OWNERSHIP");
INSERT INTO role (id, title, salary, department_id) VALUES (1, "CEO", 0, 1);
INSERT INTO employee (id, first_name, last_name, role_id, manager_id) VALUES (1, "Lord", "Farquaad", 1, 1);

*/