var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Element } from "./Element.js";
import { Menu } from "./Menu.js";
import { User } from "./User.js";
const _user = User.getInstance();
const _menu = new Menu();
const _element = Element.getInstance();
window.addEventListener('load', () => __awaiter(void 0, void 0, void 0, function* () {
    yield _user.GetUser();
    yield _menu.Draw();
    yield _element.Initial();
    _menu.Navigate();
}));
window.addEventListener("hashchange", () => { _menu.Navigate(); });
