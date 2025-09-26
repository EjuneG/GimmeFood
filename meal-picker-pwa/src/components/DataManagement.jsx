// 数据管理组件 - 导入导出功能

import React, { useState } from 'react';
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">数据管理</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-lg"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 标签切换 */}
        <div className="flex border-b">
          <button
            onClick={() => setCurrentTab('export')}
            className={`flex-1 p-3 text-sm font-medium ${
              currentTab === 'export'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            导出数据
          </button>
          <button
            onClick={() => setCurrentTab('import')}
            className={`flex-1 p-3 text-sm font-medium ${
              currentTab === 'import'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            导入数据
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-96">
          {currentTab === 'export' ? (
            <ExportTab
              restaurants={restaurants}
              exportedText={exportedText}
              copySuccess={copySuccess}
              onExport={handleExport}
              onCopy={handleCopy}
            />
          ) : (
            <ImportTab
              importText={importText}
              setImportText={setImportText}
              importStatus={importStatus}
              duplicateConflicts={duplicateConflicts}
              onImport={handleImport}
              onConflictResolution={handleConflictResolution}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// 导出标签页组件
function ExportTab({ restaurants, exportedText, copySuccess, onExport, onCopy }) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-4xl mb-2">📤</div>
        <h3 className="font-bold text-gray-900">导出餐厅数据</h3>
        <p className="text-sm text-gray-600 mt-1">
          当前有 {restaurants.length} 家餐厅
        </p>
      </div>

      {!exportedText ? (
        <button
          onClick={onExport}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all"
        >
          生成导出数据
        </button>
      ) : (
        <div className="space-y-3">
          <textarea
            id="export-text-area"
            readOnly
            value={exportedText}
            className="w-full h-32 p-3 border border-gray-200 rounded-lg text-xs font-mono bg-gray-50 resize-none"
            placeholder="生成的数据将显示在这里..."
          />

          <button
            onClick={onCopy}
            className={`w-full py-3 rounded-xl font-medium transition-all ${
              copySuccess
                ? 'bg-green-500 text-white'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {copySuccess ? '✓ 已复制到剪贴板' : '复制数据'}
          </button>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              💡 <strong>使用说明：</strong>
              <br />
              1. 点击"复制数据"按钮
              <br />
              2. 在另一台设备上打开应用
              <br />
              3. 进入"数据管理 → 导入数据"
              <br />
              4. 粘贴刚才复制的文本并导入
            </p>
          </div>
        </div>
      )}
    </div>
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
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-4xl mb-2">⚠️</div>
          <h3 className="font-bold text-gray-900">发现重复餐厅</h3>
          <p className="text-sm text-gray-600">
            {importStatus.message}
          </p>
        </div>

        <div className="max-h-48 overflow-y-auto space-y-3">
          {duplicateConflicts.map((conflict, index) => (
            <div key={conflict.key} className="border border-gray-200 rounded-lg p-3">
              <h4 className="font-medium text-gray-900 mb-2">
                {conflict.existing.name} ({conflict.existing.tier})
              </h4>
              <select
                value={conflictResolutions[index] || 'smart_merge'}
                onChange={(e) => handleResolutionChange(index, e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm"
              >
                <option value="smart_merge">智能合并（推荐）</option>
                <option value="keep_existing">保留现有数据</option>
                <option value="keep_imported">使用导入数据</option>
              </select>
            </div>
          ))}
        </div>

        <button
          onClick={handleApplyResolutions}
          className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all"
        >
          应用合并策略并导入
        </button>
      </div>
    );
  }

  // 正常导入界面
  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-4xl mb-2">📥</div>
        <h3 className="font-bold text-gray-900">导入餐厅数据</h3>
        <p className="text-sm text-gray-600 mt-1">
          从其他设备同步餐厅数据
        </p>
      </div>

      <div className="space-y-3">
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder="在这里粘贴从其他设备导出的数据文本..."
          className="w-full h-32 p-3 border border-gray-300 rounded-lg text-sm resize-none"
        />

        <button
          onClick={onImport}
          disabled={!importText.trim()}
          className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          导入数据
        </button>

        {importStatus && (
          <div className={`p-3 rounded-lg ${
            importStatus.success
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <p className="text-sm">
              {importStatus.success ? '✓' : '✗'} {importStatus.message}
            </p>
          </div>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs text-amber-800">
            💡 <strong>导入提示：</strong>
            <br />
            • 重复餐厅将智能合并数据
            <br />
            • 导入不会删除现有餐厅
            <br />
            • 支持跨版本数据导入
          </p>
        </div>
      </div>
    </div>
  );
}