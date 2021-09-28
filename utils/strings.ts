export function camelCase(str: string) {
  return str.replace(/-([a-zA-Z])/g, (_, $1: string) => $1.toUpperCase());
}

/**
 * a-b-c
 */
export function kebabCase(str: string) {
  return str.replace(
    /[A-Z]+(?![a-z])|[A-Z]/g,
    ($, ofs) => (ofs ? '-' : '') + $.toLowerCase()
  );
}

export function escape(
  str: string,
  rep = /[&<>"']/g,
  escapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }
) {
  return str && rep.test(str)
    ? str.replace(rep, (replacer) => {
        if (escapes[replacer]) {
          return escapes[replacer];
        } else return '';
      })
    : str;
}
