import { w as writable } from "./index2.js";
async function read(wc, path) {
  const obj = {};
  const dir = await wc.fs.readdir(path, { withFileTypes: true });
  for (const item of dir) {
    if (item.name === "node_modules" || item.name.startsWith(".") || item.name === "pnpm-lock.yaml")
      continue;
    if (item.isDirectory()) {
      obj[item.name] = { directory: await read(wc, `${path}/${item.name}`) };
    } else if (item.isFile()) {
      obj[item.name] = {
        file: {
          contents: await wc.fs.readFile(`${path}/${item.name}`, "utf8")
        }
      };
    }
  }
  return obj;
}
function flat(tree, path = "", data = []) {
  for (const [name, item] of Object.entries(tree)) {
    if (name === "node_modules" || name.startsWith(".") || name === "pnpm-lock.yaml")
      continue;
    if (item.directory) {
      flat(item.directory, `${path}/${name}`, data);
      data.push([`${path}/${name}`, { directory: item.directory }]);
    } else if (item.file) {
      data.push([`${path}/${name}`, { file: item.file.contents }]);
    }
  }
  return data;
}
const webcontainer = writable(null);
export {
  flat as f,
  read as r,
  webcontainer as w
};
