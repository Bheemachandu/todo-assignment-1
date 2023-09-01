const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
app.use(express.json());
const path = require("path");
const format = require("date-fns/format");
const isMatch = require("date-fns/isMatch");
const isValid = require("date-fns/isValid");
dbPath = path.join(__dirname, "todoApplication.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at https://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB error:${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
priorityList = ["HIGH", "MEDIUM", "LOW"];
statusList = ["TO DO", "IN PROGRESS", "DONE"];
categoryList = ["WORK", "HOME", "LEARNING"];
function statusFun(query) {
  return query.status !== undefined;
}
function priorityFun(query) {
  return query.priority !== undefined;
}
function categoryFun(query) {
  return query.category !== undefined;
}

//API-1
app.get("/todos/", async (request, response) => {
  let getQuery = "";
  let getData = null;
  const { category, status, priority, search_q = "" } = request.query;
  switch (true) {
    case priorityFun(request.query) && statusFun(request.query):
      if (priorityList.includes(request.query.priority)) {
        if (statusList.includes(request.query.status)) {
          getQuery = `SELECT id,todo,priority,status,category,due_date as dueDate FROM todo WHERE priority="${priority}" AND status="${status}";`;
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case categoryFun(request.query) && statusFun(request.query):
      if (statusList.includes(request.query.status)) {
        if (categoryList.includes(request.query.category)) {
          getQuery = `SELECT id,todo,priority,status,category,due_date as dueDate FROM todo WHERE category="${category}" AND status="${status}";`;
        } else {
          response.status(400);
          response.send("Invalid Todo Category");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;

    case categoryFun(request.query) && priorityFun(request.query):
      if (priorityList.includes(request.query.priority)) {
        if (categoryList.includes(request.query.category)) {
          getQuery = `SELECT id,todo,priority,status,category,due_date as dueDate FROM todo WHERE category="${category}" AND priority="${priority}";`;
        } else {
          response.status(400);
          response.send("Invalid Todo Category");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case statusFun(request.query):
      if (statusList.includes(request.query.status)) {
        getQuery = `SELECT id,todo,priority,status,category,due_date as dueDate FROM todo WHERE status="${status}";`;
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case categoryFun(request.query):
      if (categoryList.includes(request.query.category)) {
        getQuery = `SELECT id,todo,priority,status,category,due_date as dueDate FROM todo WHERE category="${category}";`;
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case priorityFun(request.query):
      console.log("bheem");
      if (priorityList.includes(request.query.priority)) {
        getQuery = `SELECT id,todo,priority,status,category,due_date as dueDate FROM todo WHERE priority="${priority}";`;
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;

    default:
      getQuery = `SELECT id,todo,priority,status,category,due_date as dueDate FROM todo WHERE todo like "%${search_q}%";`;
      break;
  }
  getData = await db.all(getQuery);
  response.send(getData);
});

//API-2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getIdQuery = `SELECT id,todo,priority,status,category,due_date as dueDate FROM todo WHERE id="${todoId}";`;
  const getIdData = await db.get(getIdQuery);
  response.send(getIdData);
});

//API-3
app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  if (isMatch(date, "yyyy-MM-dd")) {
    const newDate = format(new Date(date), "yyyy-MM-dd");
    const requestQuery = `SELECT id,todo,priority,status,category,due_date as dueDate FROM todo WHERE due_date="${newDate}";`;
    const responseResult = await db.all(requestQuery);
    response.send(responseResult);
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

//API-4
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  if (priorityList.includes(priority)) {
    if (statusList.includes(status)) {
      if (categoryList.includes(category)) {
        const postQuery = `INSERT INTO todo(id,todo,priority,status,category,due_date) VALUES ("${id}","${todo}","${priority}","${status}","${category}","${dueDate}");`;
        await db.run(postQuery);
        response.send("Todo Successfully Added");
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
});

//API-5
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let putQuery = "";
  const { id, todo, priority, status, category, dueDate } = request.body;
  switch (true) {
    case status !== undefined:
      if (statusList.includes(status)) {
        putQuery = `UPDATE todo SET status="${status}" WHERE id="${todoId}";`;
        await db.run(putQuery);
        response.send("Status Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case category !== undefined:
      if (categoryList.includes(category)) {
        putQuery = `UPDATE todo SET category="${category}" WHERE id="${todoId}";`;
        await db.run(putQuery);
        response.send("Category Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case priority !== undefined:
      if (priorityList.includes(priority)) {
        putQuery = `UPDATE todo SET priority="${priority}" WHERE id="${todoId}";`;
        await db.run(putQuery);
        response.send("Priority Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case dueDate !== undefined:
      if (isMatch(dueDate, "yyyy-MM-dd")) {
        const newDate = format(new Date(dueDate), "yyyy-MM-dd");
        putQuery = `UPDATE todo SET due_date="${dueDate}" WHERE id="${todoId}";`;
        await db.run(putQuery);
        response.send("Due Date Updated");
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }
      break;
    case todo !== undefined:
      putQuery = `UPDATE todo SET todo="${todo}" WHERE id="${todoId}";`;
      await db.run(putQuery);
      response.send("Todo Updated");
      break;
  }
});

//API-6
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `DELETE FROM todo WHERE id = ${todoId};`;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});
module.exports = app;
