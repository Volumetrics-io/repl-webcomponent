const App = {
    selectedEditor: "html",
    render: document.querySelector("#render"),
    editors: [
        {
            id: "html",
            editor: CodeMirror.fromTextArea(document.getElementById("html-textarea"), {
                mode: "xml",
                htmlMode: true,
                theme: "base16-light",
                lineNumbers: true,
                lineWrapping: false,
            }),
            button: document.querySelector("#button_html")
        },
        {
            id: "css",
            editor: CodeMirror.fromTextArea(document.getElementById("css-textarea"), {
                mode: "css",
                theme: "base16-light",
                lineNumbers: true,
                lineWrapping: false
            }),
            button: document.querySelector("#button_css")
        },
        {
            id: "js",
            editor: CodeMirror.fromTextArea(document.getElementById("js-textarea"), {
                mode: "javascript",
                theme: "base16-light",
                lineNumbers: true,
                lineWrapping: false
            }),
            button: document.querySelector("#button_js")
        }
    ],
    content: {
        html: localStorage.html ?? `<mr-app>
    <mr-panel>
        <mr-text>An clickable image</mr-text>
        <mr-a href="https://docs.mrjs.io">
            <mr-img src="assets/humpback.jpg"
                    alt="A Humpback whale breaking the water">
                </mr-img>
        </mr-a>
    </mr-panel>
</mr-app>`,
        css: localStorage.css ?? `mr-panel {
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    justify-content: center;
    padding: 10vw;
    gap: 10px;
    width: 100vw;
    height: 100vh;
}

mr-img {
    max-width: 320px;
    border-radius: 50px;
}

mr-img.hover {
    border-radius: 30px;
}`,
        js: localStorage.js ?? "",
    }
}

window.addEventListener('load', event => {
    // const params = location.search ? new URLSearchParams(location.search) : null;

    // For each editor (html, css, and javascript)
    App.editors.forEach(mode => {

        mode.editor.setValue(App.content[mode.id]);

        // Hide all the editors by default
        document.getElementById(mode.id).style.display = "none";

        // When the user types, the content is saved
        // and the render view is updated
        mode.editor.on('change', () => {
            localStorage[mode.id] = mode.editor.getValue();
            render();
        })

        mode.button.addEventListener("click", () => {
            App.selectedEditor = mode.id;
            selectEditor();
        })
    })

    App.selectedEditor = "html";
    selectEditor();
    render();
})

function selectEditor() {
    App.editors.forEach(mode => {
        if (App.selectedEditor === mode.id) {
            mode.button.classList.add("selected");
            // mode.button.style.outline = "1px solid red";
            document.getElementById(mode.id).style.display = "block";
        } else {
            mode.button.classList.remove("selected");
            mode.button.style.outline = "0px solid red";
            document.getElementById(mode.id).style.display = "none";
        }
    })
}

function render() {
    App.render.srcdoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>untitled project</title>
  <script src="https://cdn.jsdelivr.net/npm/mrjs@latest/dist/mr.js"><\/script>
</head>
<body>
    ${App.editors[0].editor.getValue()}
    <script type="module">${App.editors[2].editor.getValue()}<\/script>
    <style>
      ${App.editors[1].editor.getValue()}
      <\/style>
  <\/body>
<\/html>
  `
}
