const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) { 
  const { username } = request.headers;

  const user = users.find((item) => item.username === username);

  if (!user) {
    return response.status(404).json({ error: "User Not Found" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const verifyIfUserExists = users.find((user) => user.username === username);

  if (verifyIfUserExists) {
    return response.status(400).json({ error: "User Already Exists" });
  }
  

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { title, deadline } = request.body;

  const todoData = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todoData);

  return response.json(201).json(todoData);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const findIdTodoByUser = user.todos.find((todo) => todo.id === id);

  if (!findIdTodoByUser) {
    return response.status(404).json({ error: "Todo Cannot be Updated" });
  }

  findIdTodoByUser.title = title;
  findIdTodoByUser.deadline = new Date(deadline);

  return response.json(findIdTodoByUser);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { users } = request;
  const { id } = request.params;

  const findIdTodoByUser = users.todos.find((todo) => todo.id === id);

  if (!findIdTodoByUser) {
    return response.status(404).json({ error: "Todo Cannot be Finished" });
  }

  findIdTodoByUser.done = true;
  return response.json(findIdTodoByUser);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const findIdTodoIndex = user.todos.findIndex((todo) => todo.id === id);

  // n foi encontrado
  if (!findIdTodoIndex === -1) {
    return response.status(404).json({ error: "Todo Cannot be Deleted" });
  }

  user.todos.splice(findIdTodoIndex, 1);

  return response.status(204).json();
});

module.exports = app;
