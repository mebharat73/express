import path from "path";
import url from "url";
const filePath = "folder1/folder2/folder3/folder4/file.txt";

// baseName()
console.log(path.basename(filePath));

// dirName()
console.log(path.dirname(filePath));

// extName()
console.log(path.extname(filePath));

// parse
console.log(path.parse(filePath));

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(__filename);
console.log(__dirname);
