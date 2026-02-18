"use client";

import type { ForwardedRef } from "react";
import "@mdxeditor/editor/style.css";
import { basicDark } from "cm6-theme-basic-dark";
import {
  MDXEditor,
  UndoRedo,
  BoldItalicUnderlineToggles,
  toolbarPlugin,
  CodeToggle,
  InsertCodeBlock,
  codeBlockPlugin,
  headingsPlugin,
  listsPlugin,
  linkPlugin,
  quotePlugin,
  markdownShortcutPlugin,
  ListsToggle,
  linkDialogPlugin,
  CreateLink,
  InsertImage,
  InsertTable,
  tablePlugin,
  imagePlugin,
  codeMirrorPlugin,
  ConditionalContents,
  ChangeCodeMirrorLanguage,
  Separator,
  InsertThematicBreak,
  diffSourcePlugin,
  MDXEditorMethods,
} from "@mdxeditor/editor";
import { useTheme } from "next-themes";

interface Props {
  value: string;
  fieldChange: (value: string) => void;
  editorRef: ForwardedRef<MDXEditorMethods> | null;
}

const Editor = ({ value, fieldChange, editorRef }: Props) => {
  const { resolvedTheme } = useTheme();

  const themeExtension = resolvedTheme === "dark" ? [basicDark] : [];

  return (
    <MDXEditor
      key={resolvedTheme}
      markdown={value}
      ref={editorRef}
      onChange={fieldChange}
      className="background-light800_dark200 light-border-2 markdown-editor dark-editor grid w-full border"
      plugins={[
        headingsPlugin(),
        listsPlugin(),
        linkPlugin(),
        linkDialogPlugin(),
        quotePlugin(),
        markdownShortcutPlugin(),
        tablePlugin(),
        imagePlugin(),
        codeBlockPlugin({ defaultCodeBlockLanguage: "plaintext" }),
        codeMirrorPlugin({
          codeBlockLanguages: {
            plaintext: "Plain Text",
            txt: "Plain Text",

            js: "JavaScript",
            javascript: "JavaScript",

            ts: "TypeScript",
            typescript: "TypeScript",

            py: "Python",
            python: "Python",

            html: "HTML",
            css: "CSS",
            json: "JSON",
            bash: "Bash",
            shell: "Shell",
            sql: "SQL",

            tsx: "TypeScript (React)",
            jsx: "JavaScript (React)",
          },
          autoLoadLanguageSupport: true,
          codeMirrorExtensions: themeExtension,
        }),
        diffSourcePlugin({ viewMode: "rich-text", diffMarkdown: "" }),
        toolbarPlugin({
          toolbarContents: () => (
            <ConditionalContents
              options={[
                {
                  when: (editor) => editor?.editorType === "codeblock",
                  contents: () => <ChangeCodeMirrorLanguage />,
                },
                {
                  fallback: () => (
                    <>
                      <UndoRedo />
                      <Separator />

                      <BoldItalicUnderlineToggles />
                      <CodeToggle />
                      <Separator />

                      <ListsToggle />
                      <Separator />

                      <CreateLink />
                      <InsertImage />
                      <Separator />

                      <InsertTable />
                      <InsertThematicBreak />
                      <Separator />

                      <InsertCodeBlock />
                    </>
                  ),
                },
              ]}
            />
          ),
        }),
      ]}
    />
  );
};

export default Editor;
