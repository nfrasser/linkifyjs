---
---
beforeEl = document.getElementById('linkify-demo-before')
afterEl = document.getElementById('linkify-demo-after')

options =
  rel: 'nofollow noreferrer noopener'
  formatHref:
    hashtag: (val) ->
      "https://bsky.app/hashtag/#{val.substr(1)}"
    mention: (val) ->
      "https://github.com/#{val.substr(1)}"

afterEl.innerHTML = linkifyStr(beforeEl.value, options)
beforeEl.addEventListener 'input', ->
  afterEl.innerHTML = linkifyStr(beforeEl.value, options)
