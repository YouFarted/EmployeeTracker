const cTable = require('console.table')
const inquirer = require ('inquirer')

function whatWouldYouLikeToDo(db) {
    return inquirer.prompt([{
        name: "thingToDo",
        type: 'list',
        message: "What would you like to do?",
        choices: ['View All Employees', 'Quit']
    }]).then(function(answer) {
        if(answer.thingToDo === 'View All Employees') {
            viewAllEmployees(db).then(() => whatWouldYouLikeToDo(db))
        }
        if(answer.thingToDo === 'Quit') {
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

function viewAllEmployeesByDepartment() {
}

function viewAllEmployeesByManager() {
}

function addEmployee() {
}

function removeEmployee() {

}

function updateEmployeeRole() {

}

function updateEmployeeManager() {

}
    /*
    const table = cTable.getTable([
        {
          name: 'foo',
          age: 10
        }, {
          name: 'bar',
          age: 20
        }
      ]);
    console.log(table)
    return Promise.resolve(100) */


module.exports.whatWouldYouLikeToDo = whatWouldYouLikeToDo;