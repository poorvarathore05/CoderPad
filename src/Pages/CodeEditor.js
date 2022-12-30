import { useEffect, useRef, useState } from "react";
import "./Editor.css";
import CodeMirror from "react-codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/monokai.css";
import "codemirror/mode/javascript/javascript.js";
import ACTIONS from "../ACTIONS";

function CodeEditor({ socketRef, roomId, onCodeChange }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null) {
          editorRef.current.codeMirror.setValue(code);
        }
      });
    }
  }, [socketRef.current]);

  useEffect(() => {
    async function init() {
      editorRef.current.codeMirror.on("change", (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();
        onCodeChange(code);
        if (origin !== "setValue") {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code,
          });
        }
      });
    }
    init();
  }, []);

  const options = {
    lineNumbers: true,
    mode: "javascript",
    theme: "monokai",
  };

  return <CodeMirror ref={editorRef} options={options} />;
}

export default CodeEditor;
