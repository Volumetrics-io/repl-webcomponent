class Repl extends HTMLElement {
    constructor() {
        super();

        const height = this.getAttribute('height') ? parseInt(this.getAttribute('height'), 10) : 300;

        const htmlSlot = this.querySelector('[slot="html"]');
        const cssSlot = this.querySelector('[slot="css"]');
        const jsSlot = this.querySelector('[slot="javascript"]');

        this.htmlContent = htmlSlot ? this.reindent(htmlSlot.innerHTML) : this.reindent(`
        <div class="frame">
            <h1>Hello</h1>
        </div>
        `);
        this.cssContent = cssSlot ? this.reindent(cssSlot.innerHTML) : this.reindent(`
        .frame {
            display: flex;
            flex-flow: column nowrap;
            align-items: center;
            justify-content: center;
            height: 100vh;
            width: 100vw;
        }
        
        h1 { color: rebeccaPurple; }`);
        this.jsContent = jsSlot ? this.reindent(jsSlot.innerHTML) : ``;

        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `<style>
            :host {
                display: block;
                padding: 0;
                margin: 0;
                border-radius: 16px;
                overflow: hidden;
            }

            :root {
                --paper: white;
                --track: #f8f8f8;
                --ink: #242424;
                --faded: #666;
            
                --accent: hsl(260, 100%, 75%);
                --accent-text: hsl(260, 84%, 40%);
                --center: hsl(230, 100%, 70%);
                --alt-accent: hsl(200, 70%, 65%);
                --alt-accent-text: hsl(200, 100%, 30%);
            
                --border: #00000011;
            }
            
            @media (prefers-color-scheme:dark) {
                :root {
                    --paper: #141414;
                    --track: #000;
                    --ink: #f8f8f8;
                    --faded: #888888;
            
                    --accent: hsl(245, 100%, 75%);
                    --accent-text: hsl(245, 100%, 80%);
                    --center: hsl(268, 100%, 75%);
                    --alt-accent: hsl(290, 100%, 75%);
                    --alt-accent-text: hsl(290, 100%, 80%);
            
                    --border: #FFFFFF22;
                }
            }

            .repl {
                position: relative;
                margin: 0;
                display: grid;
                grid-template-columns: 60% 40%;
                width: 100%;
                height: ${height}px;
                background-color: var(--track);
            }

            nav {
                display: flex;
                flex-flow: row nowrap;
                position: absolute;
                bottom: 1rem;
                left: 60%;
                transform: translate(calc(-100% - 1rem), 0%);
                z-index: 99;
                border-radius: 6px;
                border: 1px solid var(--border);
                overflow: hidden;
            }

            .refresh {
                display: flex;
                flex-flow: column nowrap;
                position: absolute;
                bottom: 1rem;
                right: 1rem;
                background-color: black;
                z-index: 99;
                border-radius: 6px;
                overflow: hidden;
            }

            .tabs {
                background-color: var(--paper);
                color: var(--ink);
                padding: .5rem .75rem;
                font-size: 12px;
                font-weight: 700;
                line-height: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                text-decoration: none;
                border: none;
                gap: 6px;
            }

            .tabs:hover,
            .tabs:focus {
                color: black;
                background-color: var(--alt-accent);
            }

            .tabs.selected {
                color: black;
                background-color: var(--accent);
            }

            .wrapper {
                position: relative;
                height: ${height}px;
            }

            .ace_editor, .ace_gutter {
                background-color: var(--track) !important;
            }

            .ace_gutter-cell {
                color: var(--faded) !important;
                font-size: 12px !important;
            }

            .ace_editor {
                font-family: monospace !important;
                font-size: 14px !important;
                font-weight: 400 !important;
                letter-spacing: 0 !important;
                line-height: 150%;
            }

            .ace_gutter-active-line {
                background: none !important;
            }            

            iframe {
                width: 100%;
                height: ${height}px;
                border: none;
                border-left: 1px solid var(--border);
            }

            @media only screen and (max-width: 600px) {
                .repl {
                    grid-template-columns: 1fr;
                    grid-template-rows: 50% 50%;
                    height: ${Math.round(height * 2)}px;
                }
            
                nav {
                    bottom: 1rem;
                    left: 50%;
                    flex-flow: row nowrap;
                    transform: translate(-50%, 0%);
                }

                iframe {
                    border-left: unset;
                    border-bottom: 1px solid var(--border);
                    z-index: 9;
                }

                #render {
                    order: -1;
                }
            }

            </style>
                
            <div class="repl">
                <aside>
                    <div id="html" class="wrapper"></div>
                    <div id="css" class="wrapper"></div>
                    <div id="javascript" class="wrapper"></div>
                </aside>
                <iframe id="render"></iframe>
                <nav>
                    <button class="tabs" id="button_html">HTML</button>
                    <button class="tabs" id="button_css">CSS</button>
                    <button class="tabs" id="button_js">JS</button>
                </nav>
                <!-- <div class="refresh">
                    <button class="tabs" id="button_refresh">Refresh</button>
                </div> -->
            </div>
            
            <!-- load ace -->
            <script src="/ace/ace.js"></script>
            <!-- load ace language tools -->
            <script src="/ace/ext-language_tools.js"></script>
            `;
    }

    connectedCallback(script = document.createElement("script")) {

        script.src = `https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.12/ace.js`;
        // script.src = `/ace/ace.js`;
        script.onload = () => {

            // ace.config.set("basePath", "ace/");
            // ace.require("ace/ext/language_tools");

            this.editors = [
                {
                    id: "html",
                    button: this.shadowRoot.querySelector("#button_html"),
                    value: this.htmlContent
                },
                {
                    id: "css",
                    button: this.shadowRoot.querySelector("#button_css"),
                    value: this.cssContent
                },
                {
                    id: "javascript",
                    button: this.shadowRoot.querySelector("#button_js"),
                    value: this.jsContent
                }
            ]

            this.editors.forEach(mode => {

                mode.editor = ace.edit(this.shadowRoot.getElementById(mode.id), {
                    mode: `ace/mode/${mode.id}`,
                    value: mode.value,
                    autoScrollEditorIntoView: true,
                    showGutter: true,
                    highlightActiveLine: false,
                    useWorker: true,
                    enableBasicAutocompletion: true,
                    enableSnippets: true,
                    enableLiveAutocompletion: true
                });

                // Mandatory when running inside a shadowDom (for positioning)
                mode.editor.renderer.attachToShadowRoot();

                // Add margins above and below code
                mode.editor.renderer.setScrollMargin(10, 60)

                // Hide all the editors by default
                this.shadowRoot.getElementById(mode.id).style.display = "none";

                // Update the rendered view on change
                this.render = this.render.bind(this);
                mode.editor.on("input", this.render);

                mode.button.addEventListener("click", () => {
                    this.selectedEditor = mode.id;
                    this.selectEditor();
                })
            })

            // this.shadowRoot.querySelector("#button_refresh").addEventListener("click", () => {
            //     this.render();
            // })

            // Add listener for changes in the color scheme
            this.themeListener = window.matchMedia('(prefers-color-scheme: dark)');
            this.themeListener.addEventListener('change', e => {
                this.updateTheme(e);
            });

            this.selectedEditor = "html";
            this.selectEditor();
            this.updateTheme();
            this.render();
        }
        document.head.append(script);
    }

    selectEditor() {
        this.editors.forEach(mode => {
            if (this.selectedEditor === mode.id) {
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
        this.shadowRoot.querySelector("#render").srcdoc = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>untitled project</title>
      <script src="https://cdn.jsdelivr.net/npm/mrjs@latest/dist/mr.js"><\/script>
    </head>
    <body>
        ${this.editors[0].editor.getValue()}
        <script type="module">${this.editors[2].editor.getValue()}<\/script>
        <style>
          ${this.editors[1].editor.getValue()}
          <\/style>
      <\/body>
    <\/html>
      `
    }

    reindent(code) {
        // Code editor tends to reformat around the <inline-repl> custom elements
        // So we might end up with extra lines above and below the text in the slot
        // And we might have extra indentation we need to trim down

        // Split the string into lines
        let lines = code.split('\n');

        // Find the smallest indentation
        let minIndent = lines.reduce((min, line) => {
            let currentIndent = line.match(/^\s*/)[0].length;
            if (line.trim().length > 0 && currentIndent < min) {
                return currentIndent;
            }
            return min;
        }, Infinity);

        // If the first line is empty, remove it
        if (lines[0].trim() == "") {
            lines.shift();
        }

        // Adjust indentation and join the lines back together
        return lines.map(line => line.substring(minIndent)).join('\n');
    }

    setTheme(scheme) {
        this.editors.forEach(mode => {
            if (scheme === 'dark') {
                mode.editor.setTheme("ace/theme/dracula"); // Example dark theme
                mode.editor.container.style.background = "#282a36";
            } else {
                mode.editor.setTheme("ace/theme/chrome"); // Example light theme
                mode.editor.container.style.background = "#f8f8f8";
            }
        })
    }

    updateTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.setTheme('dark');
        } else {
            this.setTheme('light');
        }
    }

    disconnectedCallback() {

    }
}

customElements.define('inline-repl', Repl);
