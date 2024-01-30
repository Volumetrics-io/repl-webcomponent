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
                lineWrapping: true,
            }),
            button: document.querySelector("#button_html")
        },
        {
            id: "css",
            editor: CodeMirror.fromTextArea(document.getElementById("css-textarea"), {
                mode: "css",
                theme: "base16-light",
                lineNumbers: true,
                lineWrapping: true
            }),
            button: document.querySelector("#button_css")
        },
        {
            id: "js",
            editor: CodeMirror.fromTextArea(document.getElementById("js-textarea"), {
                mode: "javascript",
                theme: "base16-light",
                lineNumbers: true,
                lineWrapping: true
            }),
            button: document.querySelector("#button_js")
        }
    ],
    content: {
        html: localStorage.html ?? `<mr-app>
  <mr-surface>
    <mr-container>
      <mr-row>
        <mr-column>
          <mr-text>OH LOOK IT'S BLUE</mr-text>
        </mr-column>
      </mr-row>
    </mr-container>
  </mr-surface>
</mr-app>`,
        css: localStorage.css ?? `mr-text {
    color: red;
    font-size: 100px;
}`,
        js: localStorage.js ?? `console.log("hello!")`,
    }
}

// const App = new Proxy(state, {
//     set: function (target, key, value) {
//         console.log(`${key} set to ${value}`);
//         target[key] = value;
//         render();
//         return true;
//     }
// });

window.addEventListener('load', event => {
    const params = location.search ? new URLSearchParams(location.search) : null;

    // For each editor (html, css, and javascript)
    App.editors.forEach(mode => {
        let value;

        // If url parameters are present
        // (a url generated from the share button)
        if(params && params.get(mode.id)) {
            value = decode(params.get(mode.id))
        } else {
            value = App.content[mode.id]
        }
        
        mode.editor.setValue(value);

        // Hide all the editors by default
        document.getElementById(mode.id).style.display = "none";

        // When the user types, the content is saved
        // and the render view is updated
        mode.editor.on('change', () => {
            localStorage[mode.id] = mode.editor.getValue();
            // App.content[mode.id] = mode.editor.getValue();
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
    const htmlvalue = App.editors[0].editor.getValue();
    const cssvalue = App.editors[1].editor.getValue();
    const jsvalue = App.editors[2].editor.getValue();

    document.querySelector("#share").onclick = () => {
        let urlparams = `?html=${encode(htmlvalue)}&css=${encode(cssvalue)}&js=${encode(jsvalue)}`
        // location.assign(urlparams);
        window.open(urlparams, '_blank');
    }

    App.render.srcdoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>untitled project</title>
  <script src="https://cdn.jsdelivr.net/npm/mrjs@latest/dist/mr.js"><\/script>
</head>
<body>
    ${htmlvalue}
    <script type="module">${jsvalue}<\/script>
    <style>
      * {
          padding: 0;
          margin: 0;
          border: none;
          border-collapse: collapse;
      }

      html {
          overflow: hidden;
          overscroll-behavior: none;
      }

      body {
          position: fixed;
      }

      mr-container {
          height: 100vh;
          width: 100%;
      }

      mr-app * {
          display: block;
      }

      ${cssvalue}
      
      <\/style>
  <\/body>
<\/html>
  `
}

function encode(string) {
    return btoa(escape(encodeURIComponent(string)))
}

function decode(string) {
    return decodeURIComponent(unescape(atob(string)))
}

