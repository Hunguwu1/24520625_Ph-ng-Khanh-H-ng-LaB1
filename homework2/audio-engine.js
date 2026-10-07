// audio-engine.js

export async function playSound(src) {
    const audio = new Audio(src);

    try {
        await audio.play();
        return true;
    } catch (error) {
        console.warn(`Unable to play "${src}":`, error);
        return false;
    }
}