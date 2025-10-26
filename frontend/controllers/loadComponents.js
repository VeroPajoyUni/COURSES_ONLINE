export async function loadHeaderFooter() {
  const headerContainer = document.getElementById("header-container");
  const footerContainer = document.getElementById("footer-container");

  if (headerContainer) {
    const headerHTML = await fetch("header.html").then(res => res.text());
    headerContainer.innerHTML = headerHTML;
  }

  if (footerContainer) {
    const footerHTML = await fetch("footer.html").then(res => res.text());
    footerContainer.innerHTML = footerHTML;
  }
}
