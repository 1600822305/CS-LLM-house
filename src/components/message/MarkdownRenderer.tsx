import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Typography, Box, useTheme } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import CodeBlock from './blocks/CodeBlock';
import 'katex/dist/katex.min.css';
import remarkGfm from 'remark-gfm';
import remarkCjkFriendly from 'remark-cjk-friendly';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const renderRef = useRef<number>(0);
  const [renderKey, setRenderKey] = useState<number>(0);

  // 预处理内容
  const processedContent = useMemo(() => {
    return content.trim();
  }, [content]);

  // 渲染次数有限
  useEffect(() => {
    if (renderRef.current < 3) {
      // 延迟一点时间再次触发渲染以确保公式渲染正确
      const timer = setTimeout(() => {
        setRenderKey(prev => prev + 1);
        renderRef.current += 1;
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [processedContent]);

  // 自定义Markdown样式
  const markdownStyles = {
    h1: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      borderBottom: theme.palette.mode === 'dark' ? '1px solid #666' : '1px solid #e0e0e0',
      paddingBottom: '8px',
      marginTop: '16px',
      marginBottom: '16px',
      color: theme.palette.mode === 'dark' ? '#fff' : '#000'
    },
    h2: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      marginTop: '16px',
      marginBottom: '12px',
      color: theme.palette.mode === 'dark' ? '#e0e0e0' : '#202020'
    },
    h3: {
      fontSize: '1.1rem',
      fontWeight: 'bold',
      marginTop: '12px',
      marginBottom: '8px',
      color: theme.palette.mode === 'dark' ? '#d0d0d0' : '#303030'
    },
    h4: {
      fontSize: '1rem',
      fontWeight: 'bold',
      marginTop: '8px',
      marginBottom: '4px',
      color: theme.palette.mode === 'dark' ? '#c0c0c0' : '#404040'
    },
    strong: {
      fontWeight: 'bold',
      color: theme.palette.mode === 'dark' ? '#fff' : 'inherit',
    },
    ol: {
      paddingLeft: '20px',
    },
    ul: {
      paddingLeft: '20px',
    },
    li: {
      marginBottom: '4px',
    },
    blockquote: {
      borderLeft: '4px solid #e0e0e0',
      paddingLeft: '12px',
      margin: '8px 0',
      color: '#555',
      fontStyle: 'italic'
    },
    table: {
      borderCollapse: 'collapse' as const,
      width: '100%',
      marginBottom: '16px',
    },
    th: {
      border: '1px solid #e0e0e0',
      padding: '8px',
      backgroundColor: '#f5f5f5',
      textAlign: 'left' as const
    },
    td: {
      border: '1px solid #e0e0e0',
      padding: '8px'
    },
    a: {
      color: theme.palette.mode === 'dark'
        ? theme.palette.primary.light
        : theme.palette.primary.main,
      textDecoration: 'none',
      borderBottom: `1px solid ${theme.palette.mode === 'dark'
        ? 'rgba(144, 202, 249, 0.5)'
        : 'rgba(25, 118, 210, 0.5)'}`,
      paddingBottom: '1px',
      transition: 'color 0.2s, border-color 0.2s',
    }
  };

  return (
    <Box sx={{
      fontFamily: 'inherit',
      fontSize: 'inherit',
      lineHeight: 1.6,
      width: '100%',
      userSelect: 'text',
      wordBreak: 'break-word',

      // 段落样式 - 关键的 white-space: pre-wrap
      '& p': {
        whiteSpace: 'pre-wrap',
        margin: '1em 0',
        '&:first-of-type': { marginTop: 0 },
        '&:last-child': { marginBottom: 0.5 }
      },

      // span 元素保持预格式化
      '& span': {
        whiteSpace: 'pre'
      },

      // Markdown样式
      '& .katex-display': {
        overflow: 'auto hidden',
        padding: '0.5em 0',
      },
      '& .katex': {
        fontSize: '1.1em',
      },
      '& .katex-error': {
        color: theme.palette.error.main,
      },
      '& .katex-html': {
        maxWidth: '100%',
      },
      // 为代码块添加样式
      '& pre': {
        backgroundColor: 'transparent !important',
      },
      '& code': {
        fontFamily: '"JetBrains Mono", "Fira Code", "SF Mono", Consolas, "Liberation Mono", Menlo, Courier, monospace',
        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
        color: isDarkMode ? '#e6e6e6' : '#2d3748',
        padding: '3px 6px',
        borderRadius: '4px',
        whiteSpace: 'pre',
        wordBreak: 'keep-all',
        fontSize: '0.9em',
        fontWeight: '500',
        letterSpacing: '0.025em',
        border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
      },
      // 确保代码块内的代码没有背景色
      '& pre code': {
        backgroundColor: 'transparent !important',
        padding: 0,
      },
    }}>
      <ReactMarkdown
        key={renderKey}
        remarkPlugins={[remarkGfm, remarkCjkFriendly, remarkMath]}
        rehypePlugins={[
          [rehypeKatex, {
            // KaTeX配置，增强对各种公式格式的支持
            throwOnError: false, // 遇到错误时不抛出异常，继续渲染
            strict: false,       // 宽松模式，更容易处理各种格式
            output: 'html',      // 输出为HTML
            trust: true,         // 允许所有命令（谨慎使用）
            macros: {            // 自定义宏，可根据需要添加
              // 示例: "\\RR": "\\mathbb{R}"
            }
          }]
        ]}
        components={{
          code({className, children, ...props}) {
            const match = /language-(\w+)/.exec(className || '')
            // 使用与最佳实例相同的判定逻辑：有 language- 类名或者包含换行符
            const isCodeBlock = match || (typeof children === 'string' && children.includes('\n'));
            const isInline = !isCodeBlock;
            return !isInline ? (
              <CodeBlock
                code={String(children).replace(/\n$/, '')}
                language={match ? match[1] : 'text'}
              />
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            )
          },
          h1: ({children}) => (
            <Typography
              variant="h1"
              component="h1"
              style={markdownStyles.h1}
              sx={{
                fontWeight: 'bold',
                color: theme.palette.mode === 'dark' ? '#ffffff !important' : 'inherit',
              }}
            >
              {children}
            </Typography>
          ),
          h2: ({children}) => (
            <Typography
              variant="h2"
              component="h2"
              style={markdownStyles.h2}
              sx={{
                fontWeight: 'bold',
                color: theme.palette.mode === 'dark' ? '#f0f0f0 !important' : 'inherit',
              }}
            >
              {children}
            </Typography>
          ),
          h3: ({children}) => (
            <Typography
              variant="h3"
              component="h3"
              style={markdownStyles.h3}
              sx={{
                fontWeight: 'bold',
                color: theme.palette.mode === 'dark' ? '#e0e0e0 !important' : 'inherit',
              }}
            >
              {children}
            </Typography>
          ),
          h4: ({children}) => (
            <Typography
              variant="h4"
              component="h4"
              style={markdownStyles.h4}
              sx={{
                fontWeight: 'bold',
                color: theme.palette.mode === 'dark' ? '#d0d0d0 !important' : 'inherit',
              }}
            >
              {children}
            </Typography>
          ),
          ol: ({children}) => (
            <ol style={markdownStyles.ol}>{children}</ol>
          ),
          ul: ({children}) => (
            <ul style={markdownStyles.ul}>{children}</ul>
          ),
          li: ({children}) => (
            <li style={markdownStyles.li}>{children}</li>
          ),
          blockquote: ({children}) => (
            <blockquote style={markdownStyles.blockquote}>
              {children}
            </blockquote>
          ),
          table: ({children}) => (
            <div style={{overflowX: 'auto', width: '100%'}}>
              <table style={markdownStyles.table}>{children}</table>
            </div>
          ),
          th: ({children}) => (
            <th style={markdownStyles.th}>{children}</th>
          ),
          td: ({children}) => (
            <td style={markdownStyles.td}>{children}</td>
          ),
          strong: ({children}) => (
            <strong
              style={markdownStyles.strong}
              className={theme.palette.mode === 'dark' ? 'darkmode-bold' : ''}
            >
              {children}
            </strong>
          ),
          a: ({children, href}) => (
            <a
              href={href}
              style={markdownStyles.a}
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          // 自定义段落渲染，避免嵌套问题
          p: ({ children, ...props }: any) => {
            // 递归检查子元素中是否包含块级元素
            const hasBlockElement = (elements: any): boolean => {
              return React.Children.toArray(elements).some((child: any) => {
                // 检查是否是代码块
                if (child?.props?.className?.includes('language-') ||
                    (typeof child === 'object' && child?.type?.name === 'SyntaxHighlighter')) {
                  return true;
                }

                // 检查是否是 Box 组件（我们的代码块容器）
                if (typeof child === 'object' && child?.type?.name === 'Box') {
                  return true;
                }

                // 检查是否是其他块级元素
                if (typeof child === 'object' && child?.type) {
                  const tagName = child.type?.name || child.type;
                  if (['div', 'pre', 'blockquote', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
                    return true;
                  }
                }

                // 递归检查子元素
                if (child?.props?.children) {
                  return hasBlockElement(child.props.children);
                }

                return false;
              });
            };

            if (hasBlockElement(children)) {
              // 如果包含块级元素，使用div而不是p
              return <Box component="div" sx={{ mb: 2, lineHeight: 1.6 }} {...props}>{children}</Box>;
            }

            // 普通段落，只包含内联元素
            return <Box component="p" sx={{ mb: 2, lineHeight: 1.6 }} {...props}>{children}</Box>;
          },
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </Box>
  );
};

export default MarkdownRenderer;