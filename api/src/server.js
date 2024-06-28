import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { getBotInfo } from "./mongo.js";

const port = process.env.PORT || 3000;
const app = express();

app.disable("x-powered-by");

app.use(cors());
app.options("*", cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/api/bot/*", async function(request, response) {
  response.json(await getBotInfo(request.params[0]));
});

export const server = app.listen(port, () => {
  console.log(`Server successfully started on ${port}`);
});
