import * as React from 'react';
import { Download, Upload } from 'reicon-react';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';
import { MutedText } from '@/components/ui/muted-text';
import { SettingField } from '../SettingField';
import { toolbarId } from '@/lib/sync';
import { KEYS } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

export function SettingsStorageTab() {
  const { t } = useTranslation();
  const [importing, setImporting] = React.useState(false);
  const [importSuccess, setImportSuccess] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleExportBookmarks = async () => {
    try {
      const id = toolbarId();
      const nodes = await browser.bookmarks.getSubTree(id);
      const blob = new Blob([JSON.stringify(nodes, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `syntive-bookmarks-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export bookmarks:', err);
    }
  };

  const handleImportBookmarks = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const targetFolderId = toolbarId();

      const importRecursive = async (node: any, parentId: string) => {
        if (node.children) {
          let currentParent = parentId;
          if (node.id !== targetFolderId && node.title) {
            const created = await browser.bookmarks.create({ parentId, title: node.title });
            currentParent = created.id;
          }
          for (const child of node.children) {
            await importRecursive(child, currentParent);
          }
        } else if (node.url && node.title) {
          await browser.bookmarks.create({ parentId, title: node.title, url: node.url });
        }
      };

      if (Array.isArray(data)) {
        for (const item of data) await importRecursive(item, targetFolderId);
      } else {
        await importRecursive(data, targetFolderId);
      }

      setImportSuccess(true);
      setTimeout(() => setImportSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to import bookmarks:', err);
      alert(t('importError'));
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClearCache = async () => {
    if (confirm(t('clearCacheConfirm'))) {
      await browser.storage.local.remove([KEYS.version, KEYS.lastSync, 'syntive.dirty']);
      alert(t('clearCacheSuccess'));
    }
  };

  return (
    <div className="space-y-6">
      <SettingField
        label={t('backupRecoveryLabel')}
        description={t('backupRecoveryDesc')}
      >
        <div className="grid grid-cols-2 gap-3 mt-2">
          {/* Export Box */}
          <Panel className="flex flex-col justify-between">
            <div className="space-y-1">
              <span className="font-semibold text-xs text-foreground block">{t('exportBookmarksTitle')}</span>
              <MutedText size="2xs">{t('exportBookmarksDesc')}</MutedText>
            </div>
            <Button
              type="button"
              onClick={handleExportBookmarks}
              className="w-full h-8 text-xs font-semibold bg-accent hover:bg-accent/80 border border-border text-foreground rounded-lg cursor-pointer gap-2"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{t('exportJsonBtn')}</span>
            </Button>
          </Panel>

          {/* Import Box */}
          <Panel className="flex flex-col justify-between">
            <div className="space-y-1">
              <span className="font-semibold text-xs text-foreground block">{t('importBookmarksTitle')}</span>
              <MutedText size="2xs">{t('importBookmarksDesc')}</MutedText>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportBookmarks}
              className="hidden"
            />
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className={cn(
                'w-full h-8 text-xs font-semibold border rounded-lg cursor-pointer gap-2 transition-all',
                importSuccess
                  ? 'bg-success/10 text-success border-success/30'
                  : 'bg-accent hover:bg-accent/80 border-border text-foreground'
              )}
            >
              <Upload className="h-3.5 w-3.5" />
              <span>{importing ? t('importingBtn') : importSuccess ? t('importedSuccessBtn') : t('importJsonBtn')}</span>
            </Button>
          </Panel>
        </div>
      </SettingField>

      {/* Reset Cache */}
      <SettingField
        label={t('cacheCleanupLabel')}
        description={t('cacheCleanupDesc')}
      >
        <Button
          type="button"
          variant="outline"
          onClick={handleClearCache}
          className="h-8 px-3 text-xs text-destructive hover:text-destructive/80 border-destructive/30 hover:bg-destructive/10 rounded-lg cursor-pointer mt-1"
        >
          {t('clearLocalCacheBtn')}
        </Button>
      </SettingField>
    </div>
  );
}