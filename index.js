const path = require('path')
const inquirer = require('inquirer')
const mysql = require('mysql')
const figlet = require('figlet')
const Database = require(path.join(__dirname, "lib", "database"))
const employeeEntry = require(path.join(__dirname, "lib", "employeeEntry"))
const myMysqlRootPassword = process.env.MYSQLROOTPASSWORD
const student_unique_database_name = "andrewo_employee_assignment_db"

const title = figlet.textSync('Employee Manager', { horizontalLayout: 'full' })
console.log(title)


let db = new Database({
    host: "localhost",
    user: "root",
    password: myMysqlRootPassword,
    database: "sys"
})

async function main() {
    let results = await db.query(`SHOW DATABASES LIKE '${student_unique_database_name}'`)

    if(results.length === 0) {
        createTheDatabase()
        .then(() => playInquirer())
        .then(() => db.close())
        .catch(e => console.error(e))
    }
    else {
        useTheDatabase()
        .then(() => playInquirer())
        .catch(e => console.error(e))
    }
}

function useTheDatabase() {
    return db.query(`USE ${student_unique_database_name}`)
}

async function createTheDatabase() {
    await db.query(`CREATE DATABASE ${student_unique_database_name}`)
    await db.query(`USE ${student_unique_database_name}`)
    await db.query(`CREATE TABLE department ( 
            id INT NOT NULL AUTO_INCREMENT,
            name VARCHAR(30) NOT NULL,
            PRIMARY KEY (id) )`)
    await db.query(`CREATE TABLE role ( 
            id INT NOT NULL AUTO_INCREMENT,
            title VARCHAR(30) NOT NULL,
            salary DECIMAL NOT NULL,
            department_id INT NOT NULL,
            CONSTRAINT fk_department
            FOREIGN KEY (department_id)
            REFERENCES department(id),
            PRIMARY KEY (id) )`)
    await db.query(`CREATE TABLE employee ( 
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
        PRIMARY KEY (id) )`)
    await db.query(`INSERT INTO department (id, name) VALUES (1, "OWNERSHIP")`)
    await db.query(`INSERT INTO role (id, title, salary, department_id) VALUES (1, "CEO", 0, 1)`)
    await db.query(`INSERT INTO employee (id, first_name, last_name, role_id, manager_id) VALUES (1, "Lord", "Farquaad", 1, 1)`)
}

function playInquirer() {
    employeeEntry.whatWouldYouLikeToDo(db)
}

main().catch(e =>console.error(e))