const fs = require("fs");
const path = require("path");

const COMMENTS_FILE = path.join(__dirname, "comments.json");
const ADMIN_PASSWORD = "dssteel-admin";

function readComments() {
  if (!fs.existsSync(COMMENTS_FILE)) return [];
  const data = fs.readFileSync(COMMENTS_FILE, "utf-8");
  return JSON.parse(data || "[]");
}

function saveComments(comments) {
  fs.writeFileSync(COMMENTS_FILE, JSON.stringify(comments, null, 2));
}

exports.handler = async (event) => {
  const { httpMethod, body, queryStringParameters } = event;

  if (httpMethod === "GET") {
    return { statusCode: 200, body: JSON.stringify(readComments()) };
  }

  if (httpMethod === "POST") {
    const { nombre, mensaje, stars } = JSON.parse(body);
    const comments = readComments();
    const id = Date.now().toString();

    comments.push({ id, nombre, mensaje, stars, respuestas: [] });
    saveComments(comments);

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  }

  if (httpMethod === "DELETE") {
    const { id, pass } = queryStringParameters;
    if (pass !== ADMIN_PASSWORD) {
      return { statusCode: 403, body: "No autorizado" };
    }

    let comments = readComments();
    comments = comments.filter(c => c.id !== id);
    saveComments(comments);

    return { statusCode: 200, body: "Eliminado" };
  }

  if (httpMethod === "PUT") {
    const { id, respuesta, pass } = JSON.parse(body);
    if (pass !== ADMIN_PASSWORD) {
      return { statusCode: 403, body: "No autorizado" };
    }

    const comments = readComments();
    const comment = comments.find(c => c.id === id);
    if (!comment) return { statusCode: 404, body: "No existe" };

    comment.respuestas.push(respuesta);
    saveComments(comments);

    return { statusCode: 200, body: "Respondido" };
  }

  return { statusCode: 405, body: "Método no permitido" };
};
