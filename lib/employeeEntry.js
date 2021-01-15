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

async function askForDepartments(db) {
    let querystring = "SELECT id,name FROM department"
        
    let queryResults = await db.query(querystring)
        
    let depNames = queryResults.map(roleRow => roleRow.name)
          
    let answers = await inquirer.prompt([{
                    name: 'depName',
                    type: 'list',
                    choices: depNames
                }])
    
    return queryResults.find(qr => answers.depName === qr.name).id
}

async function askForRole(db) {
    let querystring = "SELECT id, title FROM role"
    
    let queryResults = await db.query(querystring)
    
    let titles = queryResults.map(roleRow => roleRow.title)
            
    let answers = await inquirer.prompt([{
                    name: 'title',
                    type: 'list',
                    choices: titles
                }])
    
    return queryResults.find(qr => answers.title === qr.title).id
}

async function askForManager(db) {
    let querystring = 'SELECT id, CONCAT(first_name, " ", last_name) as ManagerName FROM employee'
        
    let queryResults = await db.query(querystring)
            
    let wouldbeManagers = queryResults.map(roleRow => roleRow.ManagerName)

    let answers = await inquirer.prompt([{
                    name: 'ManagerName',
                    type: 'list',
                    choices: wouldbeManagers}])

    return queryResults.find(role => role.ManagerName == answers.ManagerName).id
}

function viewAllEmployeesByManager(db) {
}

async function addEmployee(db) {
        // I need:
        // first name
        // last name
        // role
        // manager
    var nameAnswers = await inquirer.prompt([
        { name: 'firstName', type: 'input', message: "What is the employee's first name? " },
        { name: 'lastName', type: 'input', message: "What is the employee's last name? " }])
        
    let firstName = nameAnswers.firstName
    let lastName = nameAnswers.lastName
    let roleId = await askForRole(db)

    
    let managerId = await askForManager(db)
    
    await db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`, [firstName, lastName, roleId, managerId])
}

function removeEmployee(db) {

}

function updateEmployeeRole(db) {

}

function updateEmployeeManager(db) {

}

module.exports.whatWouldYouLikeToDo = whatWouldYouLikeToDo;