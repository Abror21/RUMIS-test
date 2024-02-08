// @ts-ignore
import { createRoot } from 'react-dom/client';
import { CKEditor as CKEditorComponent } from '@ckeditor/ckeditor5-react';
import Event from '@ckeditor/ckeditor5-utils/src/eventinfo'
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import CkeditorClissifierButton from './ckeditorClassifierButton';
import useQueryApiClient from '@/app/utils/useQueryApiClient';
import { useState } from 'react';
import { Spin } from 'antd';

type CkeditorProps = {
  text: string
  setText: Function
}

const Ckeditor = ({ setText, text }: CkeditorProps) => {
  const [classifiersLoading, setClassifiersLoading] = useState(true);

  const { data: classifiers } = useQueryApiClient({
    request: {
      url: `/classifiers`,
    },
    onFinally: () => {
      setTimeout(() => {
        setClassifiersLoading(false)
      }, 100);
    },
  });

  const initEditor = (editor: any) => {
    const handleClick = (e: any) => {
      editor.model.change((writer: any) => {
        const insertPosition = editor.model.document.selection.getFirstPosition();
        writer.insertText(e, insertPosition);
        editor.editing.view.focus()
      });
    }

    editor.ui.view.toolbar.element.style.border = 'none';
    editor.ui.view.toolbar.element.style.borderBottom = '1px solid #e5e7eb';
    const items = editor?.ui?.view?.toolbar?.element?.querySelector('.ck-toolbar__items');

    const seperator = document.createElement('span');
    seperator.classList.add('ck', 'ck-toolbar__separator');
    items.append(seperator)
    const container = document.createElement('div');
    container.classList.add('ckeditor-classifier-button');
    createRoot(container).render(<CkeditorClissifierButton handleClick={handleClick} values={classifiers} />);
    items.appendChild(container);

    editor.ui.getEditableElement().parentElement.insertBefore(
      editor.ui.view.toolbar.element,
      editor.ui.getEditableElement()
    );
  };
  const config = {
    toolbar: [
      "heading",
      "|",
      "undo",
      "redo",
      "|",
      "bold",
      "italic",
      "|",
      "underline",
      "strikethrough",
      "|",
      "link",
      "|",
      "alignment",
      "indent",
      "outdent",
      "|",
      "bulletedList",
      "numberedList",
    ]
  }
  return (
    <div className='border'>
      <Spin spinning={classifiersLoading} size="small">
        {
          !classifiersLoading &&
          <CKEditorComponent
            editor={DecoupledEditor}
            config={config}
            onReady={editor => initEditor(editor)}
            data={text}
            onChange={(_: Event, editor: any) => {
              const data = editor.getData();
              setText(data);
            }}
          />
        }
      </Spin>
    </div>
  )
}

export default Ckeditor
