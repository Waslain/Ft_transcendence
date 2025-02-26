import Main from "./views/Main.js";
import Page1 from "./views/Page1.js";
import Page2 from "./views/Page2.js";
import WaitingRoom from "./views/WaitingRoom.js";
import Pong from "./views/Pong.js";

export const navigateTo = (url) => {
  history.pushState(null, null, url);
  router();
};

let view = null;

const router = async () => {
  const routes = [
    { path: "/", view: Main },
    { path: "/page1", view: Page1 },
    { path: "/page2", view: Page2 },
    { path: "/pong", view: WaitingRoom },
    { path: "/pong/:room_id", view: Pong },
  ];

  const potentialMatches = routes.map((route) => {
    return {
      route: route,
      isMatch: checkMatch(route.path),
    };
  });

  let match = potentialMatches.find((potentialMatch) => potentialMatch.isMatch);

  if (!match) {
    match = {
      route: routes[0],
      isMatch: true,
    };
  }

  await view?.cleanUp?.();
  view = new match.route.view();

  document.querySelector("#app").innerHTML = await view.getHtml();
  await view.getJavaScript();
};

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () => {
  document.body.addEventListener("click", (e) => {
    if (e.target.matches("[data-link]")) {
      e.preventDefault();
      navigateTo(e.target.href);
    }
  });

  router();
});

const checkMatch = (path) => {
  const regex = new RegExp(
    "^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "([^\\/]+)") + "$"
  );
  if (location.pathname === path) return true;
  else if (location.pathname.match(regex)) {
    return true;
  }
  return false;
};
