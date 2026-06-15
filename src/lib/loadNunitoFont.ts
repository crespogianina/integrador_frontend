const FONT_LINK_ID = "font-nunito";
const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&display=swap";

export function loadNunitoFont() {
  if (document.getElementById(FONT_LINK_ID)) return;

  const preconnectGoogle = document.createElement("link");
  preconnectGoogle.rel = "preconnect";
  preconnectGoogle.href = "https://fonts.googleapis.com";
  document.head.appendChild(preconnectGoogle);

  const preconnectGstatic = document.createElement("link");
  preconnectGstatic.rel = "preconnect";
  preconnectGstatic.href = "https://fonts.gstatic.com";
  preconnectGstatic.crossOrigin = "anonymous";
  document.head.appendChild(preconnectGstatic);

  const link = document.createElement("link");
  link.id = FONT_LINK_ID;
  link.rel = "stylesheet";
  link.href = FONT_HREF;
  document.head.appendChild(link);
}
