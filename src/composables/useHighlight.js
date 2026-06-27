export function highlightCode(rawLine, language) {
  const slots = []

  function protect(html) {
    const id = `\x00${slots.length}\x00`
    slots.push(html)
    return id
  }

  function restore(text) {
    return text.replace(/\x00(\d+)\x00/g, (_, i) => slots[+i])
  }

  let h = rawLine
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

  const lang = (language ?? '').toLowerCase()

  if (lang === 'javascript' || lang === 'typescript') {
    h = h.replace(/(\/\/[^\n]*)/g, (m) =>
      protect(`<span class="hl-comment">${m}</span>`),
    )
    h = h.replace(/(`(?:[^`\\]|\\[\s\S])*`)/g, (m) =>
      protect(`<span class="hl-string">${m}</span>`),
    )
    h = h.replace(/('(?:[^'\\]|\\.)*')/g, (m) =>
      protect(`<span class="hl-string">${m}</span>`),
    )
    h = h.replace(/(&quot;(?:[^&]|&(?!quot;))*&quot;)/g, (m) =>
      protect(`<span class="hl-string">${m}</span>`),
    )
    h = h.replace(
      /\b(const|let|var|function\*?|class|return|import|export|from|default|if|else|for|of|in|while|new|await|async|this|super|extends|typeof|instanceof|throw|try|catch|finally|yield|static|true|false|null|undefined|void)\b/g,
      '<span class="hl-keyword">$1</span>',
    )
    h = h.replace(
      /\b([A-Z][A-Za-z0-9]+)\b/g,
      '<span class="hl-class">$1</span>',
    )
    h = h.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="hl-number">$1</span>')
  } else if (lang === 'css') {
    h = h.replace(/(\/\*[^]*?\*\/)/g, (m) =>
      protect(`<span class="hl-comment">${m}</span>`),
    )
    h = h.replace(/('[^']*'|&quot;[^&]*&quot;)/g, (m) =>
      protect(`<span class="hl-string">${m}</span>`),
    )
    h = h.replace(/(--[\w-]+)/g, '<span class="hl-variable">$1</span>')
    h = h.replace(/(@[\w-]+)/g, '<span class="hl-keyword">$1</span>')
    h = h.replace(
      /([\w-]+)(\s*:(?!:))/g,
      '<span class="hl-property">$1</span>$2',
    )
  } else if (lang === 'html') {
    h = h.replace(/(&lt;!--[\s\S]*?--&gt;)/g, (m) =>
      protect(`<span class="hl-comment">${m}</span>`),
    )
    h = h.replace(
      /(&lt;\/)([\w-]+)/g,
      '$1<span class="hl-tag">$2</span>',
    )
    h = h.replace(
      /(&lt;)([\w-]+)/g,
      '$1<span class="hl-tag">$2</span>',
    )
    h = h.replace(
      / ([\w-]+)(=&quot;)/g,
      ' <span class="hl-attr">$1</span>$2',
    )
    h = h.replace(/(&quot;[^&]*&quot;)/g, (m) =>
      protect(`<span class="hl-string">${m}</span>`),
    )
  } else if (lang === 'bash') {
    h = h.replace(/(#[^\n]*)/g, (m) =>
      protect(`<span class="hl-comment">${m}</span>`),
    )
    h = h.replace(/ (-{1,2}[\w-]+)/g, ' <span class="hl-flag">$1</span>')
    h = h.replace(/^([a-z][\w.-]*)/gm, '<span class="hl-keyword">$1</span>')
  }

  return restore(h)
}
