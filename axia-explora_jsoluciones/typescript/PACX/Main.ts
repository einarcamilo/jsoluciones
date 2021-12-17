import { Element } from "./Element.js";
import { Menu } from "./Menu.js";
import { User } from "./User.js";

const _user: User = User.getInstance();
const _menu: Menu= new Menu();
const _element = Element.getInstance();
window.addEventListener('load',async() =>{
  await _user.GetUser();
  await _menu.Draw();
  await _element.Initial();
  _menu.Navigate();
});
window.addEventListener("hashchange", ()=>{_menu.Navigate();});