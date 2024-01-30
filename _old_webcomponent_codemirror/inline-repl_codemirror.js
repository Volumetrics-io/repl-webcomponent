class Repl extends HTMLElement {
    constructor() {
        super();

        const htmlSlot = this.querySelector('[slot="html-content"]') ? this.querySelector('[slot="html-content"]').innerHTML : `<h1>Hello</h1>`;
        const cssSlot = this.querySelector('[slot="css-content"]') ? this.querySelector('[slot="css-content"]').innerHTML : `h1 { color: red; }`;
        const jsSlot = this.querySelector('[slot="js-content"]') ? this.querySelector('[slot="js-content"]').innerHTML : `console.log("hello")`;

        // console.log(htmlSlot, cssSlot, jsSlot)

        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
<style>

:host {
    display: block;
    position: relative;
}

.repl {
    position: relative;
    margin: 0;
    font-family: sans-serif;
    display: grid;
    grid-template-columns: 50% 50%;
    width: 100%;
    height: 300px;
}

nav {
    display: flex;
    flex-flow: column nowrap;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: white;
    z-index: 99;
    border-radius: 10px;
    overflow: hidden;
}

iframe {
    width: 100%;
    height: 100%;
    border: none;
}

button,
a {
    background: rgba(255, 255, 255, .3);
    color: black;
    padding: .5em;
    font-size: 0.85rem;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
}

button:hover,
button:focus,
a:hover,
a:focus {
    border-color: rgba(0, 0, 0, .25);
}

.selected {
    background-color: #56bbff;
    color: white;
}

.CodeMirror {
    font-family: monospace;
    font-size: 15px;
    /* height: 300px; */
}

</style>
        
        
<div class="repl">
    <aside>
        <div id="html"><textarea id="html-textarea"></textarea></div>
        <div id="css"><textarea id="css-textarea"></textarea></div>
        <div id="js"><textarea id="js-textarea"></textarea></div>
    </aside>
    <iframe id="render" sandbox="allow-scripts allow-same-origin"></iframe>
    <nav>
        <button id="button_html">HTML</button>
        <button id="button_css">CSS</button>
        <button id="button_js">JS</button>
    </nav>
</div>`;

        const script = document.createElement("script");
        script.src = "//cdnjs.cloudflare.com/ajax/libs/ace/1.4.12/ace.js";
        script.onload = () => {
            this.innerHTML += `<div id=editor_container>console.log("here");</div>`;
            ace.edit("editor_container", {
                mode: "ace/mode/javascript",
                theme: "ace/theme/cobalt"
            });
        }

        this.state = {
            selectedEditor: "html",
            render: this.shadowRoot.querySelector("#render"),
            editors: [
                {
                    id: "html",
                    editor: CodeMirror.fromTextArea(this.shadowRoot.querySelector("#html-textarea"), {
                        mode: "xml",
                        htmlMode: true,
                        theme: "base16-light",
                        lineNumbers: true,
                        lineWrapping: false,
                    }),
                    domElement: this.shadowRoot.querySelector("#html"),
                    button: this.shadowRoot.querySelector("#button_html")
                },
                {
                    id: "css",
                    editor: CodeMirror.fromTextArea(this.shadowRoot.querySelector("#css-textarea"), {
                        mode: "css",
                        theme: "base16-light",
                        lineNumbers: true,
                        lineWrapping: false
                    }),
                    domElement: this.shadowRoot.querySelector("#css"),
                    button: this.shadowRoot.querySelector("#button_css")
                },
                {
                    id: "js",
                    editor: CodeMirror.fromTextArea(this.shadowRoot.querySelector("#js-textarea"), {
                        mode: "javascript",
                        theme: "base16-light",
                        lineNumbers: true,
                        lineWrapping: false
                    }),
                    domElement: this.shadowRoot.querySelector("#js"),
                    button: this.shadowRoot.querySelector("#button_js")
                }
            ],
            content: {
                html: htmlSlot,
                css: cssSlot,
                js: jsSlot,
            }
        }

        const stylesheets = [
            "https://cdn.jsdelivr.net/npm/codemirror@latest/lib/codemirror.min.css",
            "https://cdn.jsdelivr.net/npm/codemirror@latest/theme/material.min.css",
            "https://cdn.jsdelivr.net/npm/codemirror@latest/theme/nord.min.css",
            "https://cdn.jsdelivr.net/npm/codemirror@latest/theme/juejin.min.css",
            "https://cdn.jsdelivr.net/npm/codemirror@latest/theme/base16-light.min.css"
        ]

        stylesheets.forEach(stylesheet => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = stylesheet;
            this.shadowRoot.appendChild(link);
        });

    }

    connectedCallback() {

        // if (typeof CodeMirror === 'undefined') {
        //     // CodeMirror not loaded yet, wait for it
        //     return;
        // }

        // <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/codemirror@5.63.1/lib/codemirror.min.css" />
        // <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/codemirror@5.65.3/theme/material.min.css" />
        // <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/codemirror@5.65.3/theme/nord.min.css" />
        // <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/codemirror@5.65.3/theme/juejin.min.css" />
        // <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/codemirror@5.65.3/theme/base16-light.min.css" />

        this.state.editors.forEach(mode => {

            console.log(this.state.content[mode.id])

            // mode.editor.setValue(this.state.content[mode.id]);

            // mode.domElement.innerText = this.state.content[mode.id];

            // Hide all the editors by default
            this.shadowRoot.getElementById(mode.id).style.display = "none";

            // When the user types, the content is saved
            // and the render view is updated
            mode.editor.on('change', () => {
                localStorage[mode.id] = mode.content[mode.id] = mode.editor.getValue();
                this.render();
            })

            mode.button.addEventListener("click", () => {
                this.state.selectedEditor = mode.id;
                this.selectEditor();
            })
        })

        this.state.selectedEditor = "html";
        this.selectEditor();
        this.render();

    }


    selectEditor() {
        this.state.editors.forEach(mode => {
            if (this.state.selectedEditor === mode.id) {
                mode.button.classList.add("selected");
                // mode.button.style.outline = "1px solid red";
                this.shadowRoot.getElementById(mode.id).style.display = "block";
            } else {
                mode.button.classList.remove("selected");
                mode.button.style.outline = "0px solid red";
                this.shadowRoot.getElementById(mode.id).style.display = "none";
            }
        })
    }

    render() {
        this.state.render.srcdoc = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>untitled project</title>
      <script src="https://cdn.jsdelivr.net/npm/mrjs@latest/dist/mr.js"><\/script>
    </head>
    <body>
        ${this.state.content.html}
        <script type="module">${this.state.content.js}<\/script>
        <style>
          ${this.state.content.css}
          <\/style>
      <\/body>
    <\/html>
      `
    }

    disconnectedCallback() {

    }
}

customElements.define('inline-repl', Repl);

// require.config({ paths: { "ace": "../src" } });
// require(["ace/ace"], function (ace) {

//     class AcePlayground extends HTMLElement {
//         constructor() {
//             super();

//             var shadow = this.attachShadow({ mode: "open" });

//             var dom = require("ace/lib/dom");
//             dom.buildDom(["div", { id: "host" },
//                 ["div", { id: "html" }],
//                 ["div", { id: "css" }],
//                 ["iframe", { id: "preview" }],
//                 ["style", `
//                 #host {
//                     border: solid 1px gray;
//                     display: grid;
//                     grid-template-areas: "html preview" "css preview";
//                 }
//                 #html {
//                     grid-area: html;
//                     height: 200px;
//                 }
//                 #css {
//                     grid-area: css;
//                     height: 200px;
//                 }
//                 #preview {
//                     grid-area: preview;
//                     width: 100%;
//                     height: 100%;
//                     border: none;
//                 }
//             `]
//             ], shadow);

//             var htmlEditor = ace.edit(shadow.querySelector("#html"), {
//                 theme: "ace/theme/solarized_light",
//                 mode: "ace/mode/html",
//                 value: "<div>\n\thollow world!\n</div>\n<script><\/script>",
//                 autoScrollEditorIntoView: true
//             });
//             var cssEditor = ace.edit(shadow.querySelector("#css"), {
//                 theme: "ace/theme/solarized_dark",
//                 mode: "ace/mode/css",
//                 value: "*{\n\tcolor:red\n}",
//                 autoScrollEditorIntoView: true
//             });

//             var preview = shadow.querySelector("#preview");

//             this.htmlEditor = htmlEditor;
//             this.cssEditor = cssEditor;
//             this.preview = preview;

//             htmlEditor.renderer.attachToShadowRoot();

//             this.updatePreview = this.updatePreview.bind(this)
//             htmlEditor.on("input", this.updatePreview);
//             cssEditor.on("input", this.updatePreview);

//             this.updatePreview();
//         }
//         updatePreview() {
//             var code = this.htmlEditor.getValue() + "<style>" + this.cssEditor.getValue() + "</style>";
//             this.preview.src = "data:text/html," + encodeURIComponent(code)
//         }
//     }

//     customElements.define('ace-playground', AcePlayground);

//     window.add = function () {
//         var el = document.createElement("ace-playground");
//         document.body.appendChild(el);
//     };

// });