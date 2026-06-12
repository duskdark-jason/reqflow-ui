const FENCE_PATTERN = /^```([A-Za-z0-9_-]{0,32})\s*$/

export function renderMarkdown(content) {
  const lines = normalizeContent(content).split("\n")
  const html = []
  let paragraph = []
  let list = null
  let code = null

  function closeParagraph() {
    if (!paragraph.length) return
    html.push("<p>" + paragraph.map(inlineMarkdown).join("<br>") + "</p>")
    paragraph = []
  }

  function closeList() {
    if (!list) return
    html.push("<" + list.type + ">" + list.items.map(item => "<li>" + inlineMarkdown(item) + "</li>").join("") + "</" + list.type + ">")
    list = null
  }

  function closeCode() {
    if (!code) return
    const languageClass = code.language ? " class=\"language-" + escapeHtml(code.language) + "\"" : ""
    html.push("<pre><code" + languageClass + ">" + escapeHtml(code.lines.join("\n")) + "</code></pre>")
    code = null
  }

  lines.forEach(line => {
    const fence = line.match(FENCE_PATTERN)
    if (fence) {
      if (code) {
        closeCode()
      } else {
        closeParagraph()
        closeList()
        code = { language: fence[1] || "", lines: [] }
      }
      return
    }

    if (code) {
      code.lines.push(line)
      return
    }

    if (!line.trim()) {
      closeParagraph()
      closeList()
      return
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/)
    if (heading) {
      closeParagraph()
      closeList()
      const level = heading[1].length
      html.push("<h" + level + ">" + inlineMarkdown(heading[2].trim()) + "</h" + level + ">")
      return
    }

    if (/^(-{3,}|\*{3,})\s*$/.test(line.trim())) {
      closeParagraph()
      closeList()
      html.push("<hr>")
      return
    }

    const unordered = line.match(/^\s*[-*]\s+(.+)$/)
    if (unordered) {
      closeParagraph()
      if (!list || list.type !== "ul") {
        closeList()
        list = { type: "ul", items: [] }
      }
      list.items.push(unordered[1])
      return
    }

    const ordered = line.match(/^\s*\d+\.\s+(.+)$/)
    if (ordered) {
      closeParagraph()
      if (!list || list.type !== "ol") {
        closeList()
        list = { type: "ol", items: [] }
      }
      list.items.push(ordered[1])
      return
    }

    const quote = line.match(/^>\s?(.+)$/)
    if (quote) {
      closeParagraph()
      closeList()
      html.push("<blockquote>" + inlineMarkdown(quote[1]) + "</blockquote>")
      return
    }

    paragraph.push(line)
  })

  closeCode()
  closeParagraph()
  closeList()
  return html.join("")
}

function normalizeContent(content) {
  return String(content || "")
    .replace(/\r\n?/g, "\n")
    .trim()
}

function inlineMarkdown(value) {
  let text = escapeHtml(value)
  text = text.replace(/`([^`]+)`/g, "<code>$1</code>")
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>")
  text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, "<a href=\"$2\" target=\"_blank\" rel=\"noopener noreferrer\">$1</a>")
  return text
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}
