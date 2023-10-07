const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initialize = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log(`Success`);
      process.exit(1);
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
  }
};

initialize();

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

// api 1

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query): //if this is true then below query is taken in the code
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
      break;
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`;
  }

  data = await db.all(getTodosQuery);
  response.send(data);
});

// api 2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoIdQuery = `
    SELECT 
    * 
    FROM 
    todo 
    WHERE 
        todo_id = ${todoId};
    `;

  const query = await db.get(getTodoIdQuery);
  response.send(query);
});

// api 3

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body; //Destructuring variables from the request body
  const insertTodo = `
            INSERT INTO todo (id, todo, priority, status)
            VALUES (${id},'${todo}','${priority}','${status}');`; //Updated the values with the variables
  await db.run(insertTodo);
  response.send("Todo Successfully Added");
});

// api 4

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const RequestBody = request.body;
  const updateTodos = "";

  switch (true) {
    case RequestBody.status !== undefined:
      updateTodos = "Status";
      break;
    case RequestBody.priority !== undefined:
      updateTodos = "Priority";
      break;
    case RequestBody.todo !== undefined:
      updateTodos = "Todo";
      break;
  }

  const previusCode = `
    SELECT 
    * 
    FROM  
        todo 
    WHERE 
        todo_id = ${todoId};
    `;

  const previousTodo = await db.get("previusCode");

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body;

  const update = `
    UPDATE todo 
    set 
        todo = '${todo}',
        priority = '${priority}',
        status = '${status}' 
    where 
        todo_id = ${todoId};
    `;

  await db.run(update);
  response.send(`${updateTodos}: updated`);
});

// api 5

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const delet = ` 
    delete from 
        todo 
    where  
        todo_id = ${todoId};
    `;

  await db.run(delet);
  response.send("Todo Deleted");
});

module.exports = app;
