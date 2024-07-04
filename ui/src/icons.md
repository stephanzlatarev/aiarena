Read all icons:

```
const fs = require("node:fs");

console.log(fs.readdirSync("./src/unit").map(file => (`import ${file.split(".")[0]} from "./unit/${file}";`)).join("\r\n"));
console.log();
console.log("const icons = new Map();");
console.log();
console.log(fs.readdirSync("./src/unit").map(file => (`icons.set("${file.split(".")[0]}", ${file.split(".")[0]});`)).join("\r\n"));
```
