import React, { useMemo, memo, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
// @ts-ignore rehype-mathjax is not typed
import rehypeMathjax from 'rehype-mathjax';
import remarkGfm from 'remark-gfm';
import remarkCjkFriendly from 'remark-cjk-friendly';
import remarkMath from 'remark-math';
import { Box, Link, useTheme } from '@mui/material';
import CodeRenderer from './blocks/CodeRenderer';
import AdvancedImagePreview from './blocks/AdvancedImagePreview';
import 'katex/dist/katex.min.css';
import { getCodeBlockId } from '../../utils/markdown';

// 🔥 参考最佳实例：工具函数
const ALLOWED_ELEMENTS = /<(style|p|div|span|b|i|strong|em|ul|ol|li|table|tr|td|th|thead|tbody|h[1-6]|blockquote|pre|code|br|hr|svg|path|circle|rect|line|polyline|polygon|text|g|defs|title|desc|tspan|sub|sup)/i;
const DISALLOWED_ELEMENTS = ['iframe'];

/**
 * 转义括号 - 参考最佳实例实现
 */
function escapeBrackets(text: string): string {
  const pattern = /(```[\s\S]*?```|`.*?`)|\\\[([\s\S]*?[^\\])\\]|\\\((.*?)\\\)/g;
  return text.replace(pattern, (match, codeBlock, squareBracket, roundBracket) => {
    if (codeBlock) {
      return codeBlock;
    } else if (squareBracket) {
      return `\n$$\n${squareBracket}\n$$\n`;
    } else if (roundBracket) {
      return `$${roundBracket}$`;
    }
    return match;
  });
}

/**
 * 移除SVG空行 - 参考最佳实例实现
 */
function removeSvgEmptyLines(text: string): string {
  const svgPattern = /(<svg[\s\S]*?<\/svg>)/g;
  return text.replace(svgPattern, (svgMatch) => {
    return svgMatch
      .split('\n')
      .filter((line) => line.trim() !== '')
      .join('\n');
  });
}

interface MarkdownProps {
  content: string;
  allowHtml?: boolean;
  mathEngine?: 'KaTeX' | 'MathJax' | 'none'; // 🔥 升级：支持双数学引擎
  onCodeBlockUpdate?: (id: string, content: string) => void; // 添加代码块更新回调
}

const Markdown: React.FC<MarkdownProps> = ({ content, allowHtml = false, mathEngine = 'KaTeX', onCodeBlockUpdate }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // 🔥 参考最佳实例：remark 插件配置
  const remarkPlugins = useMemo(() => {
    const plugins = [remarkGfm, remarkCjkFriendly];
    if (mathEngine !== 'none') {
      plugins.push(remarkMath);
    }
    return plugins;
  }, [mathEngine]);

  // 🔥 简化内容预处理 - 最小化干预
  const messageContent = useMemo(() => {
    if (!content) return '';

    // 只进行必要的预处理，避免过度干预
    let processedContent = removeSvgEmptyLines(escapeBrackets(content));

    // 移除所有复杂的保护逻辑，让 react-markdown 自然处理
    return processedContent;
  }, [content]);

  // 🔥 升级：rehype 插件配置 - 支持双数学引擎
  const rehypePlugins = useMemo(() => {
    const plugins: any[] = [];
    if (allowHtml && ALLOWED_ELEMENTS.test(messageContent)) {
      plugins.push(rehypeRaw);
    }
    if (mathEngine === 'KaTeX') {
      plugins.push(rehypeKatex as any);
    } else if (mathEngine === 'MathJax') {
      plugins.push(rehypeMathjax as any);
    }
    return plugins;
  }, [mathEngine, messageContent, allowHtml]);

  // 处理代码块更新
  const handleCodeUpdate = useCallback((id: string, newContent: string) => {
    if (onCodeBlockUpdate) {
      onCodeBlockUpdate(id, newContent);
    }
  }, [onCodeBlockUpdate]);

  return (
    <Box sx={{
      // 基础样式
      color: 'text.primary',
      lineHeight: 1.6,
      userSelect: 'text',
      wordBreak: 'break-word',

      // 图片样式
      '& img': { maxWidth: '100%', height: 'auto' },

      // 链接样式
      '& a': {
        color: 'primary.main',
        textDecoration: 'none',
        wordBreak: 'break-all', /* 新增：长链接换行 */
        '&:hover': { textDecoration: 'underline' }
      },

      // 标题样式
      '& h1, & h2, & h3, & h4, & h5, & h6': {
        mt: 2,
        mb: 1,
        fontWeight: 'bold',
        '&:first-of-type': { mt: 0 }
      },
      '& h1': {
        fontSize: '2em',
        borderBottom: 1,
        borderColor: 'divider',
        pb: 0.3
      },
      '& h2': {
        fontSize: '1.5em',
        borderBottom: 1,
        borderColor: 'divider',
        pb: 0.3
      },
      '& h3': { fontSize: '1.2em' },
      '& h4': { fontSize: '1em' },
      '& h5': { fontSize: '0.9em' },
      '& h6': { fontSize: '0.8em' },

      // 段落样式 - 优化换行处理
      '& p': {
        my: 1,
        whiteSpace: 'pre-wrap', // 保持换行符和空格
        wordBreak: 'break-word', // 长单词换行
        lineHeight: 1.6,
        '&:last-child': { mb: 0.5 },
        '&:first-of-type': { mt: 0 }
      },

      // 列表样式
      '& ul, & ol': {
        pl: 3,
        my: 1
      },
      '& li': {
        mb: 0.5,
        '& > ul, & > ol': { my: 0.5 }
      },
      '& ul': { listStyle: 'initial' },

      // 引用样式
      '& blockquote': {
        borderLeft: 4,
        borderColor: 'grey.300',
        pl: 2,
        ml: 0,
        my: 2,
        color: 'text.secondary'
      },

      // 分隔线样式
      '& hr': {
        border: 'none',
        borderTop: 1,
        borderColor: 'divider',
        my: 2.5
      },

      // 行内代码样式
      '& code': {
        fontFamily: 'monospace',
        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        px: 0.5,
        py: 0.25,
        borderRadius: 0.5,
        color: isDarkMode ? '#e3e3e3' : 'inherit',
        wordBreak: 'break-all', /* 修改：允许长命令在任意字符处换行 */
        whiteSpace: 'pre-wrap' /* 修改：允许在必要时换行 */
      },

      // 代码块容器样式
      '& pre': {
        m: 0,
        p: 0,
        backgroundColor: 'transparent',
      },

      // span 元素保持预格式化
      '& span': {
        whiteSpace: 'pre'
      },

      // 🔥 升级：表格样式现在通过自定义组件处理
    }}>
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        disallowedElements={DISALLOWED_ELEMENTS}
        remarkRehypeOptions={{
          // 🔥 参考最佳实例配置 + 强化换行处理
          footnoteLabel: '脚注',
          footnoteLabelTagName: 'h4',
          footnoteBackContent: ' ',
          // 强制保持换行符
          allowDangerousHtml: false,
          // 确保换行符被正确处理
          handlers: {}
        }}
        components={{
          a: ({ ...props }) => (
            <Link
              {...props}
              target="_blank"
              rel="noopener noreferrer"
            />
          ),
          // 🔥 升级：自定义表格渲染 - 参考实现 + 移动端优化
          table: ({ children, ...props }: any) => (
            <Box
              sx={{
                margin: '1em 0',
                width: '100%',
                overflowX: 'auto', // 移动端横向滚动
                borderRadius: '8px',
                border: `0.5px solid ${isDarkMode ? '#404040' : '#d0d0d0'}`,
                boxShadow: isDarkMode
                  ? '0 2px 8px rgba(0, 0, 0, 0.3)'
                  : '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            >
              <Box
                component="table"
                sx={{
                  borderCollapse: 'collapse',
                  width: '100%',
                  minWidth: '300px', // 确保表格有最小宽度
                  backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff'
                }}
                {...props}
              >
                {children}
              </Box>
            </Box>
          ),
          thead: ({ children, ...props }: any) => (
            <Box
              component="thead"
              sx={{
                backgroundColor: isDarkMode ? '#2d2d2d' : '#f8f8f8'
              }}
              {...props}
            >
              {children}
            </Box>
          ),
          tbody: ({ children, ...props }: any) => (
            <Box component="tbody" {...props}>
              {children}
            </Box>
          ),
          tr: ({ children, ...props }: any) => (
            <Box
              component="tr"
              sx={{
                '&:nth-of-type(odd)': {
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)'
                },
                '&:hover': {
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'
                },
                transition: 'background-color 0.2s ease'
              }}
              {...props}
            >
              {children}
            </Box>
          ),
          th: ({ children, ...props }: any) => (
            <Box
              component="th"
              sx={{
                border: `0.5px solid ${isDarkMode ? '#404040' : '#d0d0d0'}`,
                padding: { xs: '0.5em', sm: '0.75em' }, // 移动端减少内边距
                textAlign: 'left',
                verticalAlign: 'top',
                fontWeight: 'bold',
                color: isDarkMode ? '#ffffff' : '#333333',
                borderBottom: `1px solid ${isDarkMode ? '#555555' : '#cccccc'}`,
                fontSize: { xs: '13px', sm: '14px' }, // 移动端字体稍小
                whiteSpace: 'nowrap',
                minWidth: '80px' // 确保最小宽度
              }}
              {...props}
            >
              {children}
            </Box>
          ),
          td: ({ children, ...props }: any) => (
            <Box
              component="td"
              sx={{
                border: `0.5px solid ${isDarkMode ? '#404040' : '#d0d0d0'}`,
                padding: { xs: '0.5em', sm: '0.75em' }, // 移动端减少内边距
                textAlign: 'left',
                verticalAlign: 'top',
                fontSize: { xs: '13px', sm: '14px' }, // 移动端字体稍小
                lineHeight: 1.5,
                wordBreak: 'break-word',
                minWidth: '80px', // 确保最小宽度
                maxWidth: '200px' // 限制最大宽度，避免过宽
              }}
              {...props}
            >
              {children}
            </Box>
          ),
          img: ({ src, alt, ...props }: any) => {
            // 🔥 升级：使用高级图片预览组件
            if (!src) {
              return null;
            }

            return (
              <AdvancedImagePreview
                src={src}
                alt={alt || 'Generated Image'}
                {...props}
              />
            );
          },
          code: ({ node, inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            const lang = match ? match[1] : 'text';
            const codeContent = String(children).replace(/\n$/, '');

            // 获取代码块ID
            let codeBlockId = null;
            if (!inline && node?.position?.start) {
              codeBlockId = getCodeBlockId(node.position.start);
            }

            // 🔥 新增：检查是否为LaTeX数学公式，避免被Shiki渲染
            const isLatexMath = (content: string, language: string): boolean => {
              // 检查语言是否为latex相关
              const latexLanguages = ['latex', 'tex', 'math'];
              if (latexLanguages.includes(language.toLowerCase())) {
                return true;
              }

              // 检查内容是否包含LaTeX数学公式特征
              const latexPatterns = [
                /\\[a-zA-Z]+\{.*?\}/,  // LaTeX命令，如 \frac{1}{2}
                /\\\(/,                // 内联数学公式开始
                /\\\)/,                // 内联数学公式结束
                /\\\[/,                // 块级数学公式开始
                /\\\]/,                // 块级数学公式结束
                /\$\$.*\$\$/,          // 块级数学公式
                /\$.*\$/,              // 内联数学公式
                /\\begin\{.*?\}/,      // LaTeX环境开始
                /\\end\{.*?\}/,        // LaTeX环境结束
                /\\[a-zA-Z]+/          // 简单LaTeX命令
              ];

              return latexPatterns.some(pattern => pattern.test(content));
            };

            // 检查是否为代码块
            const isCodeBlock = match || (typeof children === 'string' && children.includes('\n'));

            // 🔥 如果是LaTeX数学公式，不使用Shiki渲染，而是作为普通代码处理
            if (!inline && isCodeBlock && isLatexMath(codeContent, lang)) {
              return (
                <Box
                  component="pre"
                  sx={{
                    backgroundColor: isDarkMode ? '#1e1e1e' : '#f8f8f8',
                    color: isDarkMode ? '#e6e6e6' : '#2d3748',
                    padding: '16px',
                    borderRadius: '8px',
                    border: isDarkMode ? '1px solid #404040' : '1px solid #d0d0d0',
                    overflow: 'auto',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    margin: '16px 0',
                    position: 'relative',
                    '&::before': {
                      content: '"LaTeX • 数学公式"',
                      position: 'absolute',
                      top: '8px',
                      right: '12px',
                      fontSize: '12px',
                      color: isDarkMode ? '#888' : '#666',
                      backgroundColor: isDarkMode ? '#2d2d2d' : '#e8e8e8',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: 'bold'
                    }
                  }}
                >
                  <code>{codeContent}</code>
                </Box>
              );
            }

            return inline || !isCodeBlock ? (
              <code className={className} {...props}>
                {children}
              </code>
            ) : (
              <CodeRenderer
                code={codeContent}
                language={lang}
                codeBlockId={codeBlockId}
                onUpdate={handleCodeUpdate}
              />
            );
          },
          // 简化段落渲染，使用默认行为
          // p: 使用默认的段落渲染，通过CSS控制样式
        }}
      >
        {messageContent}
      </ReactMarkdown>
    </Box>
  );
};

export default memo(Markdown);