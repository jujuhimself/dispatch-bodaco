import React, { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  Wifi, 
  Battery, 
  Download,
  Share,
  Maximize,
  Minimize
} from 'lucide-react';

interface NetworkInfo {
  effectiveType: string;
  downlink: number;
  rtt: number;
}

interface BatteryManager {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
  addEventListener: (type: string, listener: EventListener) => void;
  removeEventListener: (type: string, listener: EventListener) => void;
}

declare global {
  interface Navigator {
    getBattery?(): Promise<BatteryManager>;
  }
}

export const MobileOptimizer: React.FC = () => {
  const isMobile = useIsMobile();
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);

  useEffect(() => {
    // Network information
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setNetworkInfo({
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0
      });

      const updateConnection = () => {
        setNetworkInfo({
          effectiveType: connection.effectiveType || 'unknown',
          downlink: connection.downlink || 0,
          rtt: connection.rtt || 0
        });
      };

      connection.addEventListener('change', updateConnection);
      return () => connection.removeEventListener('change', updateConnection);
    }
  }, []);

  useEffect(() => {
    // Battery API
    if (navigator.getBattery) {
      navigator.getBattery().then((battery) => {
        setBatteryLevel(Math.round(battery.level * 100));
        
        const updateBattery = () => {
          setBatteryLevel(Math.round(battery.level * 100));
        };
        
        battery.addEventListener('levelchange', updateBattery);
        return () => battery.removeEventListener('levelchange', updateBattery);
      }).catch(() => {
        // Battery API not supported
        setBatteryLevel(null);
      });
    }
  }, []);

  useEffect(() => {
    // PWA install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    // Fullscreen change detection
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleInstallPWA = async () => {
    if (installPrompt) {
      const result = await installPrompt.prompt();
      if (result.outcome === 'accepted') {
        setInstallPrompt(null);
      }
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.log('Fullscreen not supported');
    }
  };

  const shareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Rapid Response Guardian',
          text: 'Emergency management platform',
          url: window.location.href
        });
      } catch (error) {
        console.log('Share failed');
      }
    }
  };

  const getNetworkBadgeVariant = (effectiveType: string) => {
    switch (effectiveType) {
      case '4g': return 'default';
      case '3g': return 'secondary';
      case '2g': return 'destructive';
      case 'slow-2g': return 'destructive';
      default: return 'outline';
    }
  };

  const getBatteryStatus = () => {
    if (batteryLevel === null) return 'Unknown';
    if (batteryLevel > 80) return 'Excellent';
    if (batteryLevel > 50) return 'Good';
    if (batteryLevel > 20) return 'Low';
    return 'Critical';
  };

  const getBatteryVariant = () => {
    if (batteryLevel === null) return 'outline';
    if (batteryLevel > 50) return 'default';
    if (batteryLevel > 20) return 'secondary';
    return 'destructive';
  };

  if (!isMobile) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 z-30">
      <Card className="w-64">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Smartphone className="h-4 w-4" />
            Mobile Mode
          </div>

          {/* Network Status */}
          {networkInfo && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                <span className="text-sm">Network</span>
              </div>
              <Badge variant={getNetworkBadgeVariant(networkInfo.effectiveType)}>
                {networkInfo.effectiveType.toUpperCase()}
              </Badge>
            </div>
          )}

          {/* Battery Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Battery className="h-4 w-4" />
              <span className="text-sm">Battery</span>
            </div>
            <Badge variant={getBatteryVariant()}>
              {batteryLevel !== null ? `${batteryLevel}%` : getBatteryStatus()}
            </Badge>
          </div>

          {/* PWA Install */}
          {installPrompt && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleInstallPWA}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Install App
            </Button>
          )}

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className="flex-1"
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
            
            {navigator.share && (
              <Button
                variant="outline"
                size="sm"
                onClick={shareApp}
                className="flex-1"
              >
                <Share className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Performance Tips */}
          {networkInfo && networkInfo.effectiveType !== '4g' && (
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              💡 Slow connection detected. Some features may be limited.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
