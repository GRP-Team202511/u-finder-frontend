// This code was completed by GRP Team 2025.11.
import MarkdownIt from "markdown-it"
import hljs from "highlight.js"
import DOMPurify from "dompurify"
import "highlight.js/styles/github.css"

const md: MarkdownIt = new MarkdownIt({
  html: false, // prevent raw HTML injection
  linkify: true,
  breaks: true,
})

md.set({
  highlight: (str: string, lang: string): string => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        const highlighted = hljs.highlight(str, { language: lang }).value
        return `<pre class="hljs"><code>${highlighted}</code></pre>`
      } catch (__) {}
    }

    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
  },
})

export function renderMarkdown(text: string): string {
  const rawHtml = md.render(text)
  return DOMPurify.sanitize(rawHtml)
}