(function () {
    const container = document.getElementById('md-content');
    if (!container) return;

    const mdFile = container.dataset.md;
    if (!mdFile) return;

    fetch(mdFile)
        .then((response) => {
            if (!response.ok) {
                throw new Error('File not found');
            }
            return response.text();
        })
        .then((markdown) => {
            // Extract math blocks BEFORE marked processes the text.
            // marked strips backslashes (\{ → {, \\ → \, etc.) and also uses
            // \x02/\x03 internally, so we use plain-string sentinels instead.
            const displayMath = [];
            const inlineMath = [];

            const protected_ = markdown
                // Display math $$...$$ must be extracted before inline $...$
                .replace(/\$\$([\s\S]*?)\$\$/g, (_match, math) => {
                    const idx = displayMath.push(math) - 1;
                    return `KATEXDISPLAY${idx}KATEXEND`;
                })
                // Inline math $...$
                .replace(/\$([^\n$]+?)\$/g, (_match, math) => {
                    const idx = inlineMath.push(math) - 1;
                    return `KATEXINLINE${idx}KATEXEND`;
                });

            let html = marked.parse(protected_);

            // Restore display math with KaTeX
            html = html.replace(/KATEXDISPLAY(\d+)KATEXEND/g, (_match, i) =>
                katex.renderToString(displayMath[+i], {
                    displayMode: true,
                    throwOnError: false,
                })
            );

            // Restore inline math with KaTeX
            html = html.replace(/KATEXINLINE(\d+)KATEXEND/g, (_match, i) =>
                katex.renderToString(inlineMath[+i], {
                    displayMode: false,
                    throwOnError: false,
                })
            );

            container.innerHTML = html;
        })
        .catch(() => {
            container.innerHTML =
                '<p class="md-error">Inhalt konnte nicht geladen werden. Bitte lokalen Webserver verwenden (z.&nbsp;B. <code>python3 -m http.server 8000</code>).</p>';
        });
})();
