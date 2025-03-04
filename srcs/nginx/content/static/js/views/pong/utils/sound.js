import * as THREE from "three";

export const soundBtn = (camera) => {
  let soundBool = false;
  let sound = null;
  let volume = 0.5;

  const volumeBar = document.getElementById("volume");
  volumeBar.addEventListener("input", (e) => {
    volume = e.target.valueAsNumber / 100;
    if (sound) sound.setVolume(volume);
  });

  const soundBtn = document.getElementById("soundBtn");
  soundBtn.addEventListener("click", () => {
    soundBool = !soundBool;
    soundBtn.innerHTML = soundBool
      ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-2"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/></svg>'
      : '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-off"><path d="M16 9a5 5 0 0 1 .95 2.293"/><path d="M19.364 5.636a9 9 0 0 1 1.889 9.96"/><path d="m2 2 20 20"/><path d="m7 7-.587.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298V11"/><path d=""M9.828 4.172A.686.686 0 0 1 11 4.657v.686"/></svg>';
    if (soundBool && !sound) sound = addSound(camera, volume);
    else if (soundBool) sound.play();
    else sound.pause();
  });
};

export const addSound = (camera, volume) => {
  const listener = new THREE.AudioListener();
  camera.add(listener);

  const sound = new THREE.Audio(listener);

  const audioLoader = new THREE.AudioLoader();
  audioLoader.load(
    "/static/js/views/pong/utils/sounds/sound.ogg",
    function (buffer) {
      sound.setBuffer(buffer);
      sound.setLoop(true);
      sound.setVolume(volume);
      sound.play();
    }
  );
  return sound;
};
