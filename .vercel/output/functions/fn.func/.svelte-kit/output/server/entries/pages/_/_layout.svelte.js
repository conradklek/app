import { c as create_ssr_component, b as createEventDispatcher, o as onDestroy, d as add_attribute, a as subscribe, e as escape, f as add_classes, v as validate_component, g as each, i as is_promise, n as noop } from "../../../chunks/index3.js";
import { p as page } from "../../../chunks/stores.js";
import "localforage";
import Markdoc from "@markdoc/markdoc";
import "codemirror-extension-inline-suggestion";
import { w as writable } from "../../../chunks/index2.js";
import { w as webcontainer, f as flat, r as read } from "../../../chunks/webcontainer.js";
import ansiRegex from "ansi-regex";
const Code = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { type = "text" } = $$props;
  let { hint = false } = $$props;
  let { mini = false } = $$props;
  let { tabs = false } = $$props;
  let { code = null } = $$props;
  let { file = "" } = $$props;
  let node = null;
  createEventDispatcher();
  onDestroy(() => {
    if (code)
      code.destroy();
    code = null;
  });
  if ($$props.type === void 0 && $$bindings.type && type !== void 0)
    $$bindings.type(type);
  if ($$props.hint === void 0 && $$bindings.hint && hint !== void 0)
    $$bindings.hint(hint);
  if ($$props.mini === void 0 && $$bindings.mini && mini !== void 0)
    $$bindings.mini(mini);
  if ($$props.tabs === void 0 && $$bindings.tabs && tabs !== void 0)
    $$bindings.tabs(tabs);
  if ($$props.code === void 0 && $$bindings.code && code !== void 0)
    $$bindings.code(code);
  if ($$props.file === void 0 && $$bindings.file && file !== void 0)
    $$bindings.file(file);
  return `<div class="${"code"}"${add_attribute("this", node, 0)}></div>`;
});
const codemirror = writable(null);
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let toggle;
  let opened;
  let search;
  let prompt;
  let memory;
  let reset;
  let $codemirror, $$unsubscribe_codemirror;
  let $webcontainer, $$unsubscribe_webcontainer;
  let $page, $$unsubscribe_page;
  $$unsubscribe_codemirror = subscribe(codemirror, (value) => $codemirror = value);
  $$unsubscribe_webcontainer = subscribe(webcontainer, (value) => $webcontainer = value);
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  let dialog;
  let editor;
  function mark(doc) {
    const ast = Markdoc.parse(doc);
    const content = Markdoc.transform(ast);
    const html = Markdoc.renderers.html(content);
    return html;
  }
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    toggle = false;
    opened = false;
    search = "";
    prompt = "";
    memory = [];
    reset = false;
    {
      {
        if ($webcontainer?.terminal?.stream) {
          console.clear();
          console.log($webcontainer.terminal?.stream?.replace(ansiRegex(), "").split("\n").slice(-100).join("\n") + search);
          console.table(memory);
          if ($codemirror)
            console.log($codemirror);
        }
      }
    }
    $$rendered = `<header><div><a href="${"/$/" + escape(
      $page.data.path?.length ? $page.data.path.split("/").slice(0, -1).join("/") : "",
      true
    )}"><!-- HTML_TAG_START -->${$page.data.path?.length ? "&larr;" : "&bull;"}<!-- HTML_TAG_END --></a></div>
	<nav>${$webcontainer?.terminal ? `${validate_component(Code, "Code").$$render($$result, { mini: true }, {}, {})}` : ``}</nav></header>

<nav><button type="${"button"}"></button></nav>

<main>${$webcontainer?.terminal ? `${function(__value) {
      if (is_promise(__value)) {
        __value.then(null, noop);
        return ``;
      }
      return function(items) {
        let item = flat(items).find(([item2]) => item2.slice(1) === $page.data.path) || ["/", { directory: true }];
        return `
			
			${Object.keys(item[1]).includes("directory") ? (() => {
          let list = $page.data.path?.length ? [item].concat(flat(items).filter(([, item2]) => item2.directory).concat(flat(items).filter(([, item2]) => !item2.directory)).filter(([path]) => path.slice(1).startsWith($page.data.path + "/") && path.slice(1).split("/").length === $page.data.path.split("/").length + 1).filter(([path]) => path.slice(1) !== $page.data.path)) : flat(items).filter(([, item2]) => item2.directory).concat(flat(items).filter(([, item2]) => !item2.directory)).filter(([path]) => path.slice(1).split("/").length === 1);
          return `
				<ul>${each(list, ([path, item2]) => {
            return `<li${add_attribute(
              "class",
              Object.keys(item2).includes("file") ? "file" : "directory",
              0
            )}><a href="${"/$" + escape(
              path.slice(1) === $page.data.path ? path.split("/").slice(0, -1).join("/") : path,
              true
            )}"${add_classes((path.slice(1) === $page.data.path ? "active" : "").trim())}><!-- HTML_TAG_START -->${path.slice(1) === $page.data.path ? "../" : path.split("/").pop()}<!-- HTML_TAG_END --></a>
						</li>`;
          })}</ul>`;
        })() : `${Object.keys(item[1]).includes("file") ? `${function(__value2) {
          if (is_promise(__value2)) {
            __value2.then(null, noop);
            return ``;
          }
          return function(file) {
            return `
					${validate_component(Code, "Code").$$render(
              $$result,
              {
                file,
                tabs: true,
                hint: true,
                type: $page.data.path.split(".").pop(),
                code: $codemirror
              },
              {
                code: ($$value) => {
                  $codemirror = $$value;
                  $$settled = false;
                }
              },
              {}
            )}
				`;
          }(__value2);
        }($webcontainer.fs.readFile($page.data.path, "utf8"))}` : ``}`}
		`;
      }(__value);
    }(read($webcontainer, "/"))}` : ``}</main>

<aside${add_classes((toggle ? "toggle" : "").trim())}>${$webcontainer?.host ? `<iframe title="${"app"}"${add_attribute("src", $webcontainer.host, 0)}></iframe>` : ``}</aside>

<footer></footer>

<dialog${add_attribute("this", dialog, 0)}><form method="${"dialog"}">${opened && !reset ? `${validate_component(Code, "Code").$$render($$result, { file: prompt, code: editor, tabs: false }, {}, {})}` : ``}
		<button type="${"submit"}"></button></form>
	<ul>${each(memory, (message) => {
      return `<li${add_attribute("class", message.role, 0)}><!-- HTML_TAG_START -->${mark(message.content)}<!-- HTML_TAG_END -->
			</li>`;
    })}</ul></dialog>

<nav${add_classes((toggle ? "toggle" : "").trim())}>${$webcontainer?.host ? `<button type="${"button"}" ${!$webcontainer.host ? "disabled" : ""}></button>` : ``}</nav>

${slots.default ? slots.default({}) : ``}`;
  } while (!$$settled);
  $$unsubscribe_codemirror();
  $$unsubscribe_webcontainer();
  $$unsubscribe_page();
  return $$rendered;
});
export {
  Layout as default
};
