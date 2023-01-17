import { useEffect, useRef } from "react";
import "./Editor.css";
import CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/clike/clike";
import "codemirror/mode/python/python";
import ACTIONS from "../ACTIONS";

function CodeEditor({ socketRef, roomId, onCodeChange, language }) {
  const editorRef = useRef(null);
  const language_mode = language.lang;
  console.log(language_mode);
  //  console.log(typeof language_mode);

  useEffect(() => {
    async function init() {
      editorRef.current = CodeMirror.fromTextArea(
        document.getElementById("textEditor"),
        {
          mode: { name: language_mode },
          theme: "dracula",
          lineNumbers: true,
        }
      );
      editorRef.current.on("change", (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();
        onCodeChange(code);
        if (origin !== "setValue") {
          editorRef.current.focus();
          const cursor = editorRef.current.getCursor();
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code,
            cursor,
          });
        }
      });
    }
    init();
  }, []);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code, cursor }) => {
        if (code !== null) {
          editorRef.current.setValue(code);
          const cursor_line = cursor.line;
          const cursor_ch = cursor.ch;
          editorRef.current.setCursor({ line: cursor_line, ch: cursor_ch });
        }
      });
    }
    return () => {
      socketRef.current.off(ACTIONS.CODE_CHANGE);
    };
  }, [socketRef.current]);

  return <textarea id="textEditor"></textarea>;
}

export default CodeEditor;
