'use client';

import { } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollText, Trash2, Filter } from 'lucide-react';
import type { LogEntry } from '@/app/types/trading';

interface SystemLogsProps {
  logs: LogEntry[];
  onClearLogs?: () => void;
}

const getLogIcon = (type: LogEntry['type']) => {
  switch (type) {
    case 'success': return '✓';
    case 'warning': return '⚠';
    case 'error': return '✗';
    case 'info': return 'ℹ';
    default: return '•';
  }
};

const getLogColor = (type: LogEntry['type']) => {
  switch (type) {
    case 'success': return 'text-green-400';
    case 'warning': return 'text-yellow-400';
    case 'error': return 'text-red-400';
    case 'info': return 'text-blue-400';
    default: return 'text-muted-foreground';
  }
};

const getLogBadgeColor = (type: LogEntry['type']) => {
  switch (type) {
    case 'success': return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'warning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'info': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

export function SystemLogs({ logs, onClearLogs }: SystemLogsProps) {
  // 移除自动滚动功能，避免影响用户操作

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  // 统计各类型日志数量
  const logStats = logs.reduce((acc, log) => {
    acc[log.type] = (acc[log.type] || 0) + 1;
    return acc;
  }, {} as Record<LogEntry['type'], number>);

  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-blue-400 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ScrollText className="w-5 h-5" />
            <span>系统日志</span>
            <Badge variant="secondary" className="bg-muted/50">
              {logs.length}条
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* 日志统计 */}
            <div className="hidden md:flex space-x-1">
              {Object.entries(logStats).map(([type, count]) => (
                <Badge key={type} size="sm" className={getLogBadgeColor(type as LogEntry['type'])}>
                  {getLogIcon(type as LogEntry['type'])} {count}
                </Badge>
              ))}
            </div>
            
            {/* 清空按钮 */}
            {logs.length > 0 && onClearLogs && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearLogs}
                className="opacity-60 hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <div className="text-center">
              <ScrollText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">暂无系统日志</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border">
            <AnimatePresence initial={false}>
              {logs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-start space-x-3 p-3 rounded-lg border transition-all duration-300 ${
                    log.important 
                      ? 'border-primary/30 bg-primary/5' 
                      : 'border-border/50 bg-muted/30 hover:bg-muted/50'
                  }`}
                >
                  {/* 时间戳 */}
                  <div className="text-xs text-muted-foreground font-mono mt-0.5 flex-shrink-0">
                    {formatTime(log.timestamp)}
                  </div>
                  
                  {/* 日志图标 */}
                  <div className={`text-sm font-bold mt-0.5 flex-shrink-0 ${getLogColor(log.type)}`}>
                    {getLogIcon(log.type)}
                  </div>
                  
                  {/* 日志内容 */}
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm break-words ${
                      log.important ? 'font-medium text-foreground' : 'text-muted-foreground'
                    }`}>
                      {log.message}
                    </div>
                    
                    {log.important && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="mt-1"
                      >
                        <Badge size="sm" className="bg-primary/20 text-primary">
                          重要
                        </Badge>
                      </motion.div>
                    )}
                  </div>
                  
                  {/* 日志类型标签 */}
                  <Badge size="sm" className={getLogBadgeColor(log.type)}>
                    {log.type.toUpperCase()}
                  </Badge>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        
        {/* 日志控制说明 */}
        {logs.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-4">
                <span>最多保留100条记录</span>
              </div>
              <div className="flex items-center space-x-1">
                <Filter className="w-3 h-3" />
                <span>实时更新</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}