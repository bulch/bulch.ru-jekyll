function hoverBg(elCards, elBg) {
    const hoverIndex = localStorage.getItem("hoverIndex");
    const cardRect = elCards[hoverIndex].getBoundingClientRect();
    settingsBg(elBg, cardRect);
    setTimeout(function () {
        elBg.style.opacity = 1;
    }, 300);
    elCards.forEach(function (card, index) {
        card.addEventListener("mouseenter", function () {
            settingsBg(elBg, card.getBoundingClientRect());
            localStorage.setItem("hoverIndex", index);
        });
    });
}

function settingsBg(el, rect) {
    const x = rect.left + window.scrollX + rect.width / 2;
    const y = rect.top + window.scrollY + rect.height / 2;
    const tx = x - rect.width / 2;
    const ty = y - rect.height / 2;
    el.style.width = rect.width + "px";
    el.style.height = rect.height + "px";
    el.style.transform = `translate(${tx}px, ${ty}px)`;
    return [x, y];
}

document.addEventListener("DOMContentLoaded", function () {
    const cards = document.querySelectorAll("div.card");
    const bg = document.querySelector("div.background-card");
    localStorage.setItem("hoverIndex", 0);
    setTimeout(() => hoverBg(cards, bg), 1);
});
