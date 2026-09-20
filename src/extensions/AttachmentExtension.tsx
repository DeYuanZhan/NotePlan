import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { FileText, Download, Eye } from 'lucide-react';

// 附件组件
function AttachmentComponent({ node, updateAttributes }: any) {
  const { fileName, fileSize, fileType, fileData, mimeType } = node.attrs;

  const handleOpen = () => {
    if (!fileData) {
      alert('文件数据不可用');
      return;
    }

    // 创建 Blob URL
    const byteCharacters = atob(fileData.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    const url = URL.createObjectURL(blob);

    // 在新窗口打开
    window.open(url, '_blank');
    
    // 延迟释放 URL
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  const handleDownload = () => {
    if (!fileData) {
      alert('文件数据不可用');
      return;
    }

    // 创建下载链接
    const link = document.createElement('a');
    link.href = fileData;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFileIcon = () => {
    switch (fileType) {
      case 'PDF':
        return '📄';
      case 'Word':
        return '📝';
      case 'Excel':
        return '📊';
      case 'PPT':
        return '📽️';
      default:
        return '📎';
    }
  };

  return (
    <NodeViewWrapper>
      <div className="attachment-block" style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '12px',
        margin: '8px 0',
        background: '#f9fafb',
        transition: 'all 0.2s'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>{getFileIcon()}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontWeight: 500,
              color: '#1f2937',
              marginBottom: '2px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {fileName}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              {fileType} · {fileSize} KB
            </div>
          </div>
          <button
            onClick={handleOpen}
            style={{
              padding: '6px 12px',
              background: '#4f46e5',
              color: 'white',
              borderRadius: '6px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              whiteSpace: 'nowrap'
            }}
            title="在新窗口打开"
          >
            <Eye size={14} />
            打开
          </button>
          <button
            onClick={handleDownload}
            style={{
              padding: '6px 12px',
              background: '#e5e7eb',
              color: '#374151',
              borderRadius: '6px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              whiteSpace: 'nowrap'
            }}
            title="下载文件"
          >
            <Download size={14} />
            下载
          </button>
        </div>
      </div>
    </NodeViewWrapper>
  );
}

// 自定义附件节点扩展
export const Attachment = Node.create({
  name: 'attachment',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      fileName: {
        default: null,
      },
      fileSize: {
        default: null,
      },
      fileType: {
        default: null,
      },
      fileData: {
        default: null,
      },
      mimeType: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="attachment"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'attachment' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(AttachmentComponent);
  },
});
