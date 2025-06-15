
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Accessibility, 
  Eye, 
  Type, 
  Volume2, 
  Contrast,
  MousePointer,
  Keyboard
} from 'lucide-react';

interface AccessibilitySettings {
  highContrast: boolean;
  fontSize: number;
  reduceMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  focusIndicators: boolean;
}

export const AccessibilityPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    fontSize: 16,
    reduceMotion: false,
    screenReader: false,
    keyboardNavigation: true,
    focusIndicators: true
  });

  useEffect(() => {
    // Apply accessibility settings to document
    const root = document.documentElement;
    
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (settings.reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    root.style.fontSize = `${settings.fontSize}px`;
    
    if (settings.focusIndicators) {
      root.classList.add('enhanced-focus');
    } else {
      root.classList.remove('enhanced-focus');
    }
  }, [settings]);

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40"
        aria-label="Open accessibility settings"
      >
        <Accessibility className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <Card className="w-80">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Accessibility className="h-5 w-5" />
              Accessibility
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              aria-label="Close accessibility panel"
            >
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Visual Settings */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Visual
            </h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <label className="text-sm font-medium">High Contrast</label>
                <p className="text-xs text-muted-foreground">Increase color contrast</p>
              </div>
              <Switch
                checked={settings.highContrast}
                onCheckedChange={(checked) => updateSetting('highContrast', checked)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Type className="h-3 w-3" />
                  Font Size
                </label>
                <Badge variant="outline">{settings.fontSize}px</Badge>
              </div>
              <Slider
                value={[settings.fontSize]}
                onValueChange={([value]) => updateSetting('fontSize', value)}
                min={12}
                max={24}
                step={1}
                className="w-full"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <label className="text-sm font-medium">Reduce Motion</label>
                <p className="text-xs text-muted-foreground">Minimize animations</p>
              </div>
              <Switch
                checked={settings.reduceMotion}
                onCheckedChange={(checked) => updateSetting('reduceMotion', checked)}
              />
            </div>
          </div>

          {/* Navigation Settings */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Keyboard className="h-4 w-4" />
              Navigation
            </h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <label className="text-sm font-medium">Enhanced Focus</label>
                <p className="text-xs text-muted-foreground">Visible focus indicators</p>
              </div>
              <Switch
                checked={settings.focusIndicators}
                onCheckedChange={(checked) => updateSetting('focusIndicators', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <label className="text-sm font-medium">Keyboard Navigation</label>
                <p className="text-xs text-muted-foreground">Enhanced keyboard support</p>
              </div>
              <Switch
                checked={settings.keyboardNavigation}
                onCheckedChange={(checked) => updateSetting('keyboardNavigation', checked)}
              />
            </div>
          </div>

          {/* Audio Settings */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Audio
            </h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <label className="text-sm font-medium">Screen Reader</label>
                <p className="text-xs text-muted-foreground">Enhanced screen reader support</p>
              </div>
              <Switch
                checked={settings.screenReader}
                onCheckedChange={(checked) => updateSetting('screenReader', checked)}
              />
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              // Reset to defaults
              setSettings({
                highContrast: false,
                fontSize: 16,
                reduceMotion: false,
                screenReader: false,
                keyboardNavigation: true,
                focusIndicators: true
              });
            }}
          >
            Reset to Defaults
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
