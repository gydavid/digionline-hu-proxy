export function safeXML(html: string): string {
  const replaceMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };

  return html.replace(/[&<>"'\/\\]/g, function (match) {
    return replaceMap[match];
  });
}
