const cTable = require('console.table')
const inquirer = require('inquirer')

async function whatWouldYouLikeToDo(db) {
    let answer = await inquirer.prompt([{
        name: "thingToDo",
        type: 'list',
        message: "What would you like to do?",
        choices: [
            'View All Employees',
            'View All Employees By Department',
            'View Employees By Manager',
            'View Department Budget',// TODO
            'Add Employee',
            'Remove Employee',
            'Update Employee Role',// TODO
            'Update Employee Manager',// TODO
            'View All Roles',// TODO
            'Add Role',// TODO
            'Remove Role',// TODO
            'Add Department',// TODO
            'Remove Department',// TODO
            'Quit'
        ]
    }])

    switch (answer.thingToDo) {

        case 'View All Employees':
            await viewAllEmployees(db)
            await whatWouldYouLikeToDo(db)
            break;
        case 'View All Employees By Department':
            await viewAllEmployeesByDepartment(db)
            await whatWouldYouLikeToDo(db)
            break;
        case 'View Employees By Manager':
            await viewAllEmployeesByManager(db)
            await whatWouldYouLikeToDo(db)
            break;
        case 'Add Employee':
            await addEmployee(db)
            await whatWouldYouLikeToDo(db)
            break;
        case 'Remove Employee':
            await removeEmployee(db)
            await whatWouldYouLikeToDo(db)
            break;
        case 'Quit':
            await db.close(); // and don't recurse
            break;
        default:
            console.error("not supported yet: " + answer.thingToDo)
    }
}


async function viewAllEmployees(db) {
    let querystring = `SELECT this_employee.first_name, this_employee.last_name, role.title, CONCAT(managers.first_name, " ", managers.last_name) as manager
    FROM employee as this_employee
    INNER JOIN employee as managers
    INNER JOIN role
    ON this_employee.manager_id = managers.id AND this_employee.role_id = role.id`

    let results = await db.query(querystring)
    let tab = cTable.getTable(results)
    console.log(tab)
}

async function viewAllEmployeesByDepartment(db) {
    let querystring = `SELECT this_employee.first_name, this_employee.last_name, role.title, CONCAT(managers.first_name, " ", managers.last_name) as manager
    FROM employee as this_employee
    INNER JOIN employee as managers
    INNER JOIN role
    ON this_employee.manager_id = managers.id AND this_employee.role_id = role.id
    WHERE role.department_id = ?
    `

    let depId = await askForDepartments(db)
    let results = await db.query(querystring, depId)
    let tab = cTable.getTable(results)
    console.log(tab)
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
        choices: wouldbeManagers
    }])

    return queryResults.find(role => role.ManagerName == answers.ManagerName).id
}

async function viewAllEmployeesByManager(db) {
    let querystring = `SELECT first_name, last_name, role.title
    FROM employee as this_employee
    INNER JOIN role
    ON this_employee.role_id = role.id
    WHERE manager_id = ?
    `
    let managerId = await askForManager(db)

    let results = await db.query(querystring, managerId)
    let tab = cTable.getTable(results)
    console.log(tab)
}

async function askForEmployee(db) {
    let querystring = 'SELECT id, CONCAT(first_name, " ", last_name) as name FROM employee'

    let queryResults = await db.query(querystring)

    let names = queryResults.map(roleRow => roleRow.name)

    let answers = await inquirer.prompt([{
        name: 'name',
        type: 'list',
        choices: names
    }])

    return queryResults.find(qr => answers.name === qr.name).id
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

    return await db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`, [firstName, lastName, roleId, managerId])
}

async function removeEmployee(db) {
    id = await askForEmployee(db)

    return await db.query(`DELETE FROM employee WHERE id = ?`, id)
}

function updateEmployeeRole(db) {

}

function updateEmployeeManager(db) {

}

module.exports.whatWouldYouLikeToDo = whatWouldYouLikeToDo;