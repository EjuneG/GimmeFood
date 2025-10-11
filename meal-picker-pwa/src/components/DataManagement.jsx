// 数据管理组件 - 导入导出功能

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Download, AlertTriangle, X, Copy, Check } from 'lucide-react';
import { useApp } from '../hooks/useApp.js';
import { useRestaurants } from '../hooks/useRestaurants.js';
import { getUserData } from '../utils/storage.js';
import {
  exportDataToText,
  importDataFromText,
  detectDuplicates,
  mergeDuplicateRestaurants,
  normalizeImportedRestaurants
} from '../utils/dataSync.js';
import { Button } from './ui/Button.jsx';
import { Card } from './ui/Card.jsx';
import { cn } from '../utils/cn.js';

export function DataManagement({ isOpen, onClose }) {
  const { dispatch, ActionTypes } = useApp();
  const { restaurants } = useRestaurants();
  const [currentTab, setCurrentTab] = useState('export');
  const [exportedText, setExportedText] = useState('');
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState(null);
  const [duplicateConflicts, setDuplicateConflicts] = useState([]);
  const [copySuccess, setCopySuccess] = useState(false);

  // 导出数据
  const handleExport = () => {
    try {
      const userData = getUserData();
      const exportText = exportDataToText(restaurants, userData);
      setExportedText(exportText);
    } catch (error) {
      setImportStatus({
        success: false,
        message: error.message
      });
    }
  };

  // 复制导出的数据到剪贴板
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportedText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      // 降级方案：选择文本
      const textArea = document.getElementById('export-text-area');
      if (textArea) {
        textArea.select();
        textArea.setSelectionRange(0, 99999);
        try {
          document.execCommand('copy');
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        } catch (e) {
          console.error('复制失败:', e);
        }
      }
    }
  };

  // 导入数据
  const handleImport = () => {
    if (!importText.trim()) {
      setImportStatus({
        success: false,
        message: '请粘贴数据文本'
      });
      return;
    }

    const importResult = importDataFromText(importText.trim());

    if (!importResult.success) {
      setImportStatus({
        success: false,
        message: importResult.error
      });
      return;
    }

    // 标准化导入的餐厅数据
    const normalizedRestaurants = normalizeImportedRestaurants(importResult.data.restaurants);

    // 检测重复
    const { duplicates, newRestaurants, hasDuplicates } = detectDuplicates(restaurants, normalizedRestaurants);

    if (hasDuplicates) {
      // 显示冲突解决界面
      setDuplicateConflicts(duplicates);
      setImportStatus({
        success: true,
        message: `发现 ${duplicates.length} 个重复餐厅，${newRestaurants.length} 个新餐厅`,
        duplicates: duplicates.length,
        newCount: newRestaurants.length,
        needsConflictResolution: true,
        newRestaurants
      });
    } else {
      // 直接导入
      processImport(newRestaurants, []);
    }
  };

  // 处理冲突解决后的导入
  const handleConflictResolution = (resolutions) => {
    const mergedRestaurants = duplicateConflicts.map((conflict, index) => {
      const strategy = resolutions[index] || 'smart_merge';
      return mergeDuplicateRestaurants(conflict.existing, conflict.imported, strategy);
    });

    processImport(importStatus.newRestaurants, mergedRestaurants);
  };

  // 执行导入操作
  const processImport = (newRestaurants, mergedRestaurants) => {
    // 更新现有餐厅
    mergedRestaurants.forEach(restaurant => {
      dispatch({
        type: ActionTypes.UPDATE_RESTAURANT,
        payload: restaurant
      });
    });

    // 添加新餐厅
    newRestaurants.forEach(restaurant => {
      dispatch({
        type: ActionTypes.ADD_RESTAURANT,
        payload: restaurant
      });
    });

    setImportStatus({
      success: true,
      message: `成功导入 ${newRestaurants.length} 个新餐厅${mergedRestaurants.length > 0 ? `，合并 ${mergedRestaurants.length} 个重复餐厅` : ''}`
    });

    // 重置状态
    setImportText('');
    setDuplicateConflicts([]);

    // 3秒后自动关闭
    setTimeout(() => {
      onClose();
      setImportStatus(null);
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-primary/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md max-h-[90vh] flex flex-col"
        >
          <Card className="flex flex-col max-h-full overflow-hidden">
            {/* 头部 */}
            <div className="bg-surface border-b border-divider p-4 flex items-center justify-between flex-shrink-0">
              <h2 className="text-section font-semibold">数据管理</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                aria-label="关闭"
              >
                <X size={20} className="text-secondary" />
              </button>
            </div>

            {/* 标签切换 */}
            <div className="flex border-b border-divider flex-shrink-0">
              <button
                onClick={() => setCurrentTab('export')}
                className={cn(
                  "flex-1 py-3 px-4 text-body font-medium transition-colors relative",
                  currentTab === 'export'
                    ? 'text-accent'
                    : 'text-secondary hover:text-primary'
                )}
              >
                <Upload size={16} className="inline mr-2" />
                导出数据
                {currentTab === 'export' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                  />
                )}
              </button>
              <button
                onClick={() => setCurrentTab('import')}
                className={cn(
                  "flex-1 py-3 px-4 text-body font-medium transition-colors relative",
                  currentTab === 'import'
                    ? 'text-accent'
                    : 'text-secondary hover:text-primary'
                )}
              >
                <Download size={16} className="inline mr-2" />
                导入数据
                {currentTab === 'import' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                  />
                )}
              </button>
            </div>

            {/* 内容区域 */}
            <div className="p-4 overflow-y-auto flex-1">
              <AnimatePresence mode="wait">
                {currentTab === 'export' ? (
                  <ExportTab
                    key="export"
                    restaurants={restaurants}
                    exportedText={exportedText}
                    copySuccess={copySuccess}
                    onExport={handleExport}
                    onCopy={handleCopy}
                  />
                ) : (
                  <ImportTab
                    key="import"
                    importText={importText}
                    setImportText={setImportText}
                    importStatus={importStatus}
                    duplicateConflicts={duplicateConflicts}
                    onImport={handleImport}
                    onConflictResolution={handleConflictResolution}
                  />
                )}
              </AnimatePresence>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// 导出标签页组件
function ExportTab({ restaurants, exportedText, copySuccess, onExport, onCopy }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
          <Upload size={32} className="text-accent" />
        </div>
        <h3 className="text-body font-semibold mb-1">导出餐厅数据</h3>
        <p className="text-caption text-secondary">
          当前有 {restaurants.length} 家餐厅
        </p>
      </div>

      {!exportedText ? (
        <Button
          variant="primary"
          size="large"
          onClick={onExport}
          className="w-full"
        >
          <Upload size={20} />
          生成导出数据
        </Button>
      ) : (
        <div className="space-y-3">
          <textarea
            id="export-text-area"
            readOnly
            value={exportedText}
            className="w-full h-32 p-3 border-2 border-divider rounded-xl text-caption font-mono bg-muted resize-none"
            placeholder="生成的数据将显示在这里..."
          />

          <Button
            variant={copySuccess ? "primary" : "secondary"}
            size="large"
            onClick={onCopy}
            className="w-full"
          >
            {copySuccess ? (
              <>
                <Check size={20} />
                已复制到剪贴板
              </>
            ) : (
              <>
                <Copy size={20} />
                复制数据
              </>
            )}
          </Button>

          <Card className="p-3 bg-muted">
            <p className="text-caption text-secondary">
              <strong>使用说明：</strong>
              <br />
              1. 点击"复制数据"按钮
              <br />
              2. 在另一台设备上打开应用
              <br />
              3. 进入"数据管理 → 导入数据"
              <br />
              4. 粘贴刚才复制的文本并导入
            </p>
          </Card>
        </div>
      )}
    </motion.div>
  );
}

// 导入标签页组件
function ImportTab({
  importText,
  setImportText,
  importStatus,
  duplicateConflicts,
  onImport,
  onConflictResolution
}) {
  const [conflictResolutions, setConflictResolutions] = useState({});

  const handleResolutionChange = (index, strategy) => {
    setConflictResolutions(prev => ({
      ...prev,
      [index]: strategy
    }));
  };

  const handleApplyResolutions = () => {
    onConflictResolution(conflictResolutions);
  };

  // 如果需要解决冲突
  if (importStatus?.needsConflictResolution) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        className="space-y-4"
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} className="text-accent" />
          </div>
          <h3 className="text-body font-semibold mb-1">发现重复餐厅</h3>
          <p className="text-caption text-secondary">
            {importStatus.message}
          </p>
        </div>

        <div className="max-h-48 overflow-y-auto space-y-3">
          {duplicateConflicts.map((conflict, index) => (
            <Card key={conflict.key} className="p-3">
              <h4 className="text-body font-medium mb-2">
                {conflict.existing.name} ({conflict.existing.tier})
              </h4>
              <select
                value={conflictResolutions[index] || 'smart_merge'}
                onChange={(e) => handleResolutionChange(index, e.target.value)}
                className="w-full p-2 border-2 border-divider rounded-lg text-body bg-surface
                  focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
              >
                <option value="smart_merge">智能合并（推荐）</option>
                <option value="keep_existing">保留现有数据</option>
                <option value="keep_imported">使用导入数据</option>
              </select>
            </Card>
          ))}
        </div>

        <Button
          variant="primary"
          size="large"
          onClick={handleApplyResolutions}
          className="w-full"
        >
          <Check size={20} />
          应用合并策略并导入
        </Button>
      </motion.div>
    );
  }

  // 正常导入界面
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
          <Download size={32} className="text-accent" />
        </div>
        <h3 className="text-body font-semibold mb-1">导入餐厅数据</h3>
        <p className="text-caption text-secondary">
          从其他设备同步餐厅数据
        </p>
      </div>

      <div className="space-y-3">
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder="在这里粘贴从其他设备导出的数据文本..."
          className="w-full h-32 p-3 border-2 border-divider rounded-xl text-body resize-none
            focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent bg-surface"
        />

        <Button
          variant="primary"
          size="large"
          onClick={onImport}
          disabled={!importText.trim()}
          className="w-full"
        >
          <Download size={20} />
          导入数据
        </Button>

        {importStatus && (
          <Card className={cn(
            "p-3",
            importStatus.success
              ? 'bg-accent/10 border-accent/20'
              : 'bg-accent/10 border-accent'
          )}>
            <p className="text-body">
              {importStatus.success ? (
                <>
                  <Check size={16} className="inline text-accent mr-1" />
                  {importStatus.message}
                </>
              ) : (
                <>
                  <X size={16} className="inline text-accent mr-1" />
                  {importStatus.message}
                </>
              )}
            </p>
          </Card>
        )}

        <Card className="p-3 bg-muted">
          <p className="text-caption text-secondary">
            <strong>导入提示：</strong>
            <br />
            • 重复餐厅将智能合并数据
            <br />
            • 导入不会删除现有餐厅
            <br />
            • 支持跨版本数据导入
          </p>
        </Card>
      </div>
    </motion.div>
  );
}
