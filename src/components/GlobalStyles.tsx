import React from 'react';
import { Global, css } from '@emotion/react';

interface GlobalStylesProps {
  fontSize: number;
  theme: any;
}

const GlobalStyles: React.FC<GlobalStylesProps> = ({ fontSize, theme }) => {
  const globalStyles = css`
    :root {
      --global-font-size: ${fontSize}px;
      --global-font-scale: ${fontSize / 16};
      --theme-primary: ${theme.palette.primary.main};
      --theme-secondary: ${theme.palette.secondary.main};
      --theme-background: ${theme.palette.background.default};
      --theme-paper: ${theme.palette.background.paper};
      --theme-text-primary: ${theme.palette.text.primary};
      --theme-text-secondary: ${theme.palette.text.secondary};
    }

    body {
      font-size: var(--global-font-size) !important;
      background-color: var(--theme-background) !important;
    }

    /* 强制应用Claude主题背景色到所有主要容器 */
    ${theme.palette.mode === 'claude' ? `
      #root,
      .MuiBox-root:not([style*="background"]):not(.message-content):not(.code-block) {
        background-color: ${theme.palette.background.default} !important;
      }

      /* 确保AppBar使用Claude主题色 */
      .MuiAppBar-root {
        background-color: ${theme.palette.mode === 'light'
          ? 'rgba(254, 247, 237, 0.95)'
          : 'rgba(41, 37, 36, 0.95)'} !important;
        backdrop-filter: blur(12px) !important;
      }

      /* 确保主要容器使用Claude背景 */
      .css-fha6rj,
      .css-120w7cc,
      .css-17guv08,
      .css-kyhwyq,
      .css-1x2616z,
      .css-1ttaoha {
        background-color: ${theme.palette.background.default} !important;
      }
    ` : ''}

    /* 聊天消息字体大小 */
    .message-content {
      font-size: var(--global-font-size) !important;
    }

    /* 代码块字体大小 */
    .code-block {
      font-size: calc(var(--global-font-size) * 0.875) !important;
    }

    /* 输入框字体大小 */
    .chat-input {
      font-size: var(--global-font-size) !important;
    }

    /* 按钮字体大小 */
    .MuiButton-root {
      font-size: calc(var(--global-font-size) * 0.875) !important;
    }

    /* 表单控件字体大小 */
    .MuiFormControl-root .MuiInputBase-input {
      font-size: var(--global-font-size) !important;
    }

    /* 菜单项字体大小 */
    .MuiMenuItem-root {
      font-size: var(--global-font-size) !important;
    }

    /* 工具提示字体大小 */
    .MuiTooltip-tooltip {
      font-size: calc(var(--global-font-size) * 0.75) !important;
    }
  `;

  return <Global styles={globalStyles} />;
};

export default GlobalStyles;
