const cTable = require('console.table')
const inquirer = require('inquirer')

function whatWouldYouLikeToDo(db) {
    return inquirer.prompt([{
        name: "thingToDo",
        type: 'list',
        message: "What would you like to do?",
        choices: [
            'View All Employees',
            'View All Employees By Department',
            'Add Employee',
            'Quit'
        ]
    }]).then(function (answer) {
        if (answer.thingToDo === 'View All Employees') {
            viewAllEmployees(db).then(() => whatWouldYouLikeToDo(db))
        }
        if (answer.thingToDo === 'View All Employees By Department') {
            viewAllEmployeesByDepartment(db).then(() => whatWouldYouLikeToDo(db))
        }
        if (answer.thingToDo === 'Add Employee') {
            addEmployee(db).then(() => whatWouldYouLikeToDo(db))
        }
        if (answer.thingToDo === 'Quit') {
            db.close(); // and don't recurse
        }
    })

}

function viewAllEmployees(db) {
    let querystring = `SELECT this_employee.first_name, this_employee.last_name, role.title, CONCAT(managers.first_name, " ", managers.last_name) as manager
    FROM employee as this_employee
    INNER JOIN employee as managers
    INNER JOIN role
    ON this_employee.manager_id = managers.id AND this_employee.role_id = role.id`

    return db.query(querystring).then(results => {
        let tab = cTable.getTable(results)
        console.log(tab)
    })
}

function viewAllEmployeesByDepartment(db) {
    let querystring = `SELECT this_employee.first_name, this_employee.last_name, role.title, CONCAT(managers.first_name, " ", managers.last_name) as manager
    FROM employee as this_employee
    INNER JOIN employee as managers
    INNER JOIN role
    ON this_employee.manager_id = managers.id AND this_employee.role_id = role.id
    WHERE role.department_id = ?
    `

    return askForDepartments(db).then(depId => {
            return db.query(querystring, depId)
        }).then(results => {
            let tab = cTable.getTable(results)
            console.log(tab)
        })
}

function getDepartments(db) {
    let querystring = "SELECT * FROM department"

    return db.query(querystring)
}

function askForDepartments(db) {
    let querystring = "SELECT id,name FROM department"
    let queryResults = null
    let foundId = null

    return new Promise((resolve, reject) => {
        db.query(querystring)
            .then(qResults => {
                queryResults = qResults
                return queryResults.map(roleRow => roleRow.name)
            })
            .then(depNames => {
                console.log("all Dep Names: " + depNames)
                inquirer.prompt([{
                    name: 'depName',
                    type: 'list',
                    choices: depNames
                }])
                    .then(answers => {
                        console.log("queryResults: " + JSON.stringify(queryResults))
                        console.log("answers.title: " + answers.depName)
                        let foundId = 0;
                        for (let i = 0; i < queryResults.length; ++i) {
                            let qr = queryResults[i]
                            if (answers.depName === qr.name) {
                                foundId = qr.id
                            }
                        }
                        resolve(foundId)
                    })
            }).catch(e => reject(e))
    })
}

function askForRole(db) {
    let querystring = "SELECT id, title FROM role"
    let queryResults = null
    let idForRole = null

    return new Promise((resolve, reject) => {
        db.query(querystring)
            .then(qResults => {
                queryResults = qResults
                return queryResults.map(roleRow => roleRow.title)
            })
            .then(titles => {
                console.log("all Titles: " + titles)
                inquirer.prompt([{
                    name: 'title',
                    type: 'list',
                    choices: titles
                }])
                    .then(answers => {
                        console.log("queryResults: " + JSON.stringify(queryResults))
                        console.log("answers.title: " + answers.title)
                        let foundId = 0;
                        for (let i = 0; i < queryResults.length; ++i) {
                            let qr = queryResults[i]
                            if (answers.title === qr.title) {
                                foundId = qr.id
                            }
                        }
                        resolve(foundId)
                    })
            }).catch(e => reject(e))
    })
}

function askForManager(db) {
    let querystring = 'SELECT id, CONCAT(first_name, " ", last_name) as ManagerName FROM employee'
    let queryResults = null
    
    return new Promise((resolve, reject) => {
        db.query(querystring)
            .then(qResults => {
                queryResults = qResults
                return queryResults.map(roleRow => roleRow.ManagerName)
            })
            .then(wouldbeManagers => {
                inquirer.prompt([{
                    name: 'ManagerName',
                    type: 'list',
                    choices: wouldbeManagers
                }])
                    .then(answers => {
                        let foundId = 0;
                        for (let i = 0; i < queryResults.length; ++i) {
                            let qr = queryResults[i]
                            if (answers.ManagerName === qr.ManagerName) {
                                foundId = qr.id
                            }
                        }
                        let found = queryResults.find(role => role.ManagerName == answers.ManagerName)

                        resolve(foundId)
                    })
            }).catch(e => reject(e))
    })
}


function viewAllEmployeesByManager(db) {
}

function addEmployee(db) {
    return new Promise((resolve, reject) => {
        // I need:
        // first name
        // last name
        // role
        // manager
    var namePromise = inquirer.prompt([
        { name: 'firstName', type: 'input', message: 'First Name:' },
        { name: 'lastName', type: 'input', message: 'Last Name:' }])
        
    namePromise.then(nameAnswers => {
        let firstName = nameAnswers.firstName
        let lastName = nameAnswers.lastName
        let roleIdPromise = askForRole(db)
        roleIdPromise.then(roleId => {
            let managerIdPromise = askForManager(db)
            managerIdPromise.then(managerId => {

        db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`, [firstName, lastName, roleId, managerId])
        .then(() => resolve(true))
        .catch(e => reject(e))
        })})})})
}

function removeEmployee(db) {

}

function updateEmployeeRole(db) {

}

function updateEmployeeManager(db) {

}

module.exports.whatWouldYouLikeToDo = whatWouldYouLikeToDo;