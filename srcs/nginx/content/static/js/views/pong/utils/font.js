import { FontLoader } from "three/addons/loaders/FontLoader";

export let theFont;

export const loadAndSetFont = async (url) => {
  try {
    const font = await new Promise((resolve, reject) => {
      const loader = new FontLoader();

      loader.load(
        url,
        function (font) {
          resolve(font);
        },
        undefined,
        function (error) {
          reject(error);
        }
      );
    });

    theFont = font;
  } catch (error) {
    console.error("the font could not be loaded: " + error);
  }
};
