document.addEventListener("DOMContentLoaded", () => {
    // simple stagger for fade-in blocks
    document.querySelectorAll(".fade-in").forEach((el, idx) => {
        el.style.animationDelay = `${0.12 * idx}s`;
    });
});
