import { c as create_ssr_component, a as subscribe } from "../../chunks/index3.js";
import "@webcontainer/api";
import { w as webcontainer } from "../../chunks/webcontainer.js";
import "localforage";
const app = "";
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $webcontainer, $$unsubscribe_webcontainer;
  $$unsubscribe_webcontainer = subscribe(webcontainer, (value) => $webcontainer = value);
  $$unsubscribe_webcontainer();
  return `${$webcontainer ? `${slots.default ? slots.default({}) : ``}` : ``}`;
});
export {
  Layout as default
};
