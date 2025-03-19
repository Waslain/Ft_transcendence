import Main from "./views/Main.js";
import Login from "./views/Login.js";
import Register from "./views/Register.js";
import WaitingRoom from "./views/WaitingRoom.js";
import Pong from "./views/Pong.js";
import { loadAndSetFont } from "./views/pong/utils/font.js";

export const navigateTo = (url) => {
  history.pushState(null, null, url);
  router();
};

let view = null;
let fontLoad = false;

const router = async () => {
  const routes = [
    { path: "/", view: Main },
    { path: "/user/login", view: Login },
    { path: "/user/register", view: Register },
    { path: "/pong", view: WaitingRoom },
    { path: "/pong/:room_id", view: Pong },
  ];

  const potentialMatches = routes.map((route) => {
    const resultMatch = checkMatch(route.path);
    return {
      route: route,
      result: resultMatch,
    };
  });

  let match = potentialMatches.find(
    (potentialMatch) => potentialMatch.result !== null
  );

  if (!match) {
    match = {
      route: routes[0],
      result: [location.pathname],
    };
  }

  await view?.cleanUp?.();
  if (!fontLoad) {
    await loadAndSetFont("/static/js/views/pong/utils/typeFont/typeFont.json");
    fontLoad = true;
  }
  const params = getParams(match);
  view = new match.route.view(params);

  document.querySelector("#style").innerHTML = await view.getStyle();
  document.querySelector("#app").innerHTML = await view.getHtml();
  await view.getJavaScript();
};

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () => {
  document.body.addEventListener("click", (e) => {
    const link = e.target.closest("a[data-link]");
    if (link) {
      e.preventDefault();
      navigateTo(link.getAttribute("href"));
    }
  });

  router();
});

const getParams = (match) => {
  const values = match.result.slice(1);
  if (!values) return {};
  const keys = [...match.route.path.matchAll(/:(\w+)/g)].map(
    (result) => result[1]
  );
  return keys.reduce((acc, key, i) => {
    acc[key] = values[i];
    return acc;
  }, {});
};

const checkMatch = (path) => {
  const regex = new RegExp(
    "^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "([^\\/]+)") + "$"
  );
  return location.pathname.match(regex);
};
