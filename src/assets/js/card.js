function hoverBg(elCards, elBg) {
    let hoverIndex = localStorage.getItem("hoverIndex") || 0;
    let cardRect = elCards[hoverIndex].getBoundingClientRect();
    let x = cardRect.left;
    let y = cardRect.top;
    [x, y] = settingsBg(elBg, cardRect);
    elCards.forEach(function (card, index) {
        card.addEventListener("mouseenter", function () {
            [x, y] = settingsBg(elBg, card.getBoundingClientRect());
            localStorage.setItem("hoverIndex", index);
        });
    });
}

function settingsBg(el, rect) {
    let x = rect.left + window.scrollX + rect.width / 2;
    let y = rect.top + window.scrollY + rect.height / 2;
    let tx = x - rect.width / 2;
    let ty = y - rect.height / 2;
    el.style.width = rect.width + "px";
    el.style.height = rect.height + "px";
    el.style.transform = `translate(${tx}px, ${ty}px)`;
    return [x, y];
}

document.addEventListener("DOMContentLoaded", function () {
    const cards = document.querySelectorAll("div.card");
    const bg = document.querySelector("div.background-card");
    localStorage.setItem("hoverIndex", 0);
    setTimeout(() => hoverBg(cards, bg), 1000);
});
