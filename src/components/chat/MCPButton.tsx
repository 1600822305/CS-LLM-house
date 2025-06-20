import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Chip,
  Avatar,
  Button,
  Divider,
  alpha,
  useTheme
} from '@mui/material';
import { Wrench, Settings, Database, Globe, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CustomSwitch from '../CustomSwitch';
import type { MCPServer, MCPServerType } from '../../shared/types';
import { mcpService } from '../../shared/services/mcp';
import { useMCPServerStateManager } from '../../hooks/useMCPServerStateManager';

interface MCPButtonProps {
  toolsEnabled: boolean;
  onToolsEnabledChange: (enabled: boolean) => void;
}

/**
 * MCP 按钮组件
 * 合并了工具开关和 MCP 工具管理功能，类似最佳实例的设计
 */
const MCPButton: React.FC<MCPButtonProps> = ({
  toolsEnabled,
  onToolsEnabledChange
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [activeServers, setActiveServers] = useState<MCPServer[]>([]);

  // 使用共享的MCP状态管理Hook
  const { createMCPToggleHandler } = useMCPServerStateManager();

  useEffect(() => {
    loadServers();
  }, []);

  const loadServers = () => {
    const allServers = mcpService.getServers();
    const active = mcpService.getActiveServers();
    setServers(allServers);
    setActiveServers(active);
  };

  const handleOpen = () => {
    setOpen(true);
    loadServers();
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleServerToggle = async (server: MCPServer) => {
    try {
      await mcpService.toggleServer(server.id, !server.isActive);
      loadServers();
    } catch (error) {
      console.error('切换服务器状态失败:', error);
    }
  };

  // 使用共享的MCP状态管理逻辑
  const handleToolsEnabledChange = createMCPToggleHandler(loadServers, onToolsEnabledChange);

  const handleManageServers = () => {
    handleClose();
    navigate('/settings/mcp-server');
  };

  const getServerTypeIcon = (type: MCPServerType) => {
    switch (type) {
      case 'httpStream':
        return <Globe size={16} />;
      case 'inMemory':
        return <Database size={16} />;
      default:
        return <Settings size={16} />;
    }
  };

  const getServerTypeColor = (type: MCPServerType) => {
    switch (type) {
      case 'httpStream':
        return '#9C27B0';
      case 'inMemory':
        return '#4CAF50';
      default:
        return '#9E9E9E';
    }
  };

  const hasActiveServers = activeServers.length > 0;

  return (
    <>
      {/* MCP 按钮 */}
      <Box
        onClick={handleOpen}
        sx={{
          display: 'flex',
          alignItems: 'center',
          background: isDarkMode ? 'rgba(30, 30, 30, 0.85)' : 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          color: toolsEnabled ? (isDarkMode ? '#90caf9' : '#1976d2') : (isDarkMode ? '#9E9E9E' : '#757575'),
          borderRadius: '16px',
          padding: '6px 12px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          border: `1px solid ${toolsEnabled ? (isDarkMode ? '#90caf9' : '#1976d2') : 'transparent'}`,
          '&:hover': {
            background: isDarkMode ? 'rgba(50, 50, 50, 0.9)' : 'rgba(245, 245, 245, 0.9)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          }
        }}
      >
        <Wrench
          size={18}
          color={toolsEnabled ? (isDarkMode ? '#90caf9' : '#1976d2') : (isDarkMode ? '#9E9E9E' : '#757575')}
          style={{ marginRight: '6px' }}
        />
        <Typography
          variant="body2"
          sx={{
            fontSize: '14px',
            fontWeight: 500,
            color: toolsEnabled ? (isDarkMode ? '#90caf9' : '#1976d2') : (isDarkMode ? '#9E9E9E' : '#757575')
          }}
        >
          MCP
        </Typography>
        {hasActiveServers && (
          <Chip
            label={activeServers.length}
            size="small"
            sx={{
              marginLeft: '6px',
              height: '18px',
              fontSize: '11px',
              backgroundColor: toolsEnabled ? (isDarkMode ? '#90caf9' : '#1976d2') : (isDarkMode ? '#555' : '#ccc'),
              color: toolsEnabled ? '#fff' : (isDarkMode ? '#ccc' : '#666'),
              '& .MuiChip-label': {
                padding: '0 6px'
              }
            }}
          />
        )}
      </Box>

      {/* MCP 管理对话框 */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            maxHeight: '80vh'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Wrench size={20} color="#10b981" />
              <Typography variant="h6" fontWeight={600}>
                MCP 工具服务器
              </Typography>
              {hasActiveServers && (
                <Chip
                  label={`${activeServers.length} 个运行中`}
                  size="small"
                  color="success"
                  variant="outlined"
                />
              )}
            </Box>
            <CustomSwitch
              checked={toolsEnabled}
              onChange={(e) => handleToolsEnabledChange(e.target.checked)}
            />
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          {servers.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Wrench size={48} color="rgba(0,0,0,0.4)" style={{ marginBottom: 16 }} />
              <Typography variant="body1" color="text.secondary" gutterBottom>
                暂无 MCP 服务器
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                添加 MCP 服务器来扩展 AI 的功能
              </Typography>
              <Button
                variant="contained"
                startIcon={<Plus size={16} />}
                onClick={handleManageServers}
                sx={{ borderRadius: '8px' }}
              >
                添加服务器
              </Button>
            </Box>
          ) : (
            <>
              <List sx={{ py: 0 }}>
                {servers.map((server) => (
                  <ListItem
                    key={server.id}
                    sx={{
                      borderRadius: '8px',
                      mb: 1,
                      backgroundColor: server.isActive
                        ? alpha(getServerTypeColor(server.type), 0.1)
                        : 'transparent',
                      border: server.isActive
                        ? `1px solid ${alpha(getServerTypeColor(server.type), 0.3)}`
                        : '1px solid transparent'
                    }}
                  >
                    <ListItemIcon>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          backgroundColor: getServerTypeColor(server.type),
                          fontSize: '14px'
                        }}
                      >
                        {getServerTypeIcon(server.type)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" fontWeight={500}>
                          {server.name}
                        </Typography>
                      }
                      secondary={
                        <Box component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Chip
                            label={server.type.toUpperCase()}
                            size="small"
                            variant="outlined"
                            sx={{
                              height: '20px',
                              fontSize: '10px',
                              borderColor: getServerTypeColor(server.type),
                              color: getServerTypeColor(server.type)
                            }}
                          />
                          {server.isActive && (
                            <Chip
                              label="运行中"
                              size="small"
                              color="success"
                              variant="filled"
                              sx={{ height: '20px', fontSize: '10px' }}
                            />
                          )}
                        </Box>
                      }
                      secondaryTypographyProps={{ component: 'div' }}
                    />
                    <ListItemSecondaryAction>
                      <CustomSwitch
                        checked={server.isActive}
                        onChange={() => handleServerToggle(server)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Settings size={16} />}
                  onClick={handleManageServers}
                  sx={{ borderRadius: '8px', flex: 1 }}
                >
                  管理服务器
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Plus size={16} />}
                  onClick={handleManageServers}
                  sx={{ borderRadius: '8px', flex: 1 }}
                >
                  添加服务器
                </Button>
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MCPButton;
