
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/dashboard/Header';
import Sidebar from '@/components/dashboard/Sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { AccessibilityPanel } from '@/components/accessibility/AccessibilityPanel';
import { MobileOptimizer } from '@/components/mobile/MobileOptimizer';
import { GestureHandler } from '@/components/mobile/GestureHandler';
import { 
  Smartphone, 
  Accessibility, 
  Zap, 
  Users,
  TrendingUp,
  Settings
} from 'lucide-react';

const EnhancedUX: React.FC = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    {
      title: 'Mobile Users',
      value: '78%',
      change: '+12%',
      trend: 'up',
      icon: Smartphone
    },
    {
      title: 'Accessibility Score',
      value: '94/100',
      change: '+8',
      trend: 'up',
      icon: Accessibility
    },
    {
      title: 'Page Load Speed',
      value: '1.2s',
      change: '-0.3s',
      trend: 'up',
      icon: Zap
    },
    {
      title: 'User Satisfaction',
      value: '4.8/5',
      change: '+0.2',
      trend: 'up',
      icon: Users
    }
  ];

  const handleGesture = (direction: string) => {
    console.log(`Gesture detected: ${direction}`);
    // Handle gesture-based navigation
    if (direction === 'swipeLeft') {
      // Navigate to next tab
      const tabs = ['overview', 'mobile', 'accessibility', 'performance'];
      const currentIndex = tabs.indexOf(activeTab);
      if (currentIndex < tabs.length - 1) {
        setActiveTab(tabs[currentIndex + 1]);
      }
    } else if (direction === 'swipeRight') {
      // Navigate to previous tab
      const tabs = ['overview', 'mobile', 'accessibility', 'performance'];
      const currentIndex = tabs.indexOf(activeTab);
      if (currentIndex > 0) {
        setActiveTab(tabs[currentIndex - 1]);
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Enhanced UX | Rapid Response Guardian</title>
      </Helmet>
      
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <GestureHandler
            onSwipeLeft={() => handleGesture('swipeLeft')}
            onSwipeRight={() => handleGesture('swipeRight')}
            onDoubleTap={() => console.log('Double tap detected')}
          >
            <div className="flex-1 overflow-auto p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div>
                  <h1 className="text-2xl font-bold">Enhanced User Experience</h1>
                  <p className="text-muted-foreground">Mobile optimization and accessibility features</p>
                </div>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Phase 8 Active
                </Badge>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {stats.map((stat, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-2xl font-bold">{stat.value}</p>
                            <Badge variant={stat.trend === 'up' ? 'default' : 'destructive'} className="text-xs">
                              {stat.change}
                            </Badge>
                          </div>
                        </div>
                        <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <stat.icon className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Main Content */}
              <div className="h-[calc(100vh-16rem)]">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="mobile" className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      Mobile
                    </TabsTrigger>
                    <TabsTrigger value="accessibility" className="flex items-center gap-2">
                      <Accessibility className="h-4 w-4" />
                      Accessibility
                    </TabsTrigger>
                    <TabsTrigger value="performance" className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Performance
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-6 h-[calc(100%-3rem)] overflow-auto">
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>User Experience Features</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <h4 className="font-medium">Mobile Optimization</h4>
                              <p className="text-sm text-muted-foreground">
                                Responsive design, touch gestures, and PWA support
                              </p>
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-medium">Accessibility</h4>
                              <p className="text-sm text-muted-foreground">
                                Screen reader support, high contrast, and keyboard navigation
                              </p>
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-medium">Performance</h4>
                              <p className="text-sm text-muted-foreground">
                                Fast loading, efficient caching, and network awareness
                              </p>
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-medium">Onboarding</h4>
                              <p className="text-sm text-muted-foreground">
                                Guided setup and interactive tutorials
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="mobile" className="mt-6 h-[calc(100%-3rem)] overflow-auto">
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Mobile Features</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">
                            Enhanced mobile experience with gesture support and optimization.
                          </p>
                          <div className="space-y-2 text-sm">
                            <div>📱 Responsive design for all screen sizes</div>
                            <div>👆 Touch gesture recognition</div>
                            <div>⚡ PWA installation support</div>
                            <div>📶 Network-aware functionality</div>
                            <div>🔋 Battery status monitoring</div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="accessibility" className="mt-6 h-[calc(100%-3rem)] overflow-auto">
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Accessibility Features</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">
                            Comprehensive accessibility support for all users.
                          </p>
                          <div className="space-y-2 text-sm">
                            <div>🔍 High contrast mode</div>
                            <div>📝 Adjustable font sizes</div>
                            <div>⌨️ Keyboard navigation</div>
                            <div>🔊 Screen reader support</div>
                            <div>🎯 Enhanced focus indicators</div>
                            <div>🚫 Reduced motion options</div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="performance" className="mt-6 h-[calc(100%-3rem)] overflow-auto">
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Performance Metrics</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">1.2s</div>
                              <div className="text-sm text-muted-foreground">Load Time</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">94</div>
                              <div className="text-sm text-muted-foreground">Performance Score</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600">2.1MB</div>
                              <div className="text-sm text-muted-foreground">Bundle Size</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </GestureHandler>
        </div>
        
        {/* UX Enhancement Components */}
        <MobileOptimizer />
        <AccessibilityPanel />
        
        {/* Onboarding */}
        {showOnboarding && (
          <OnboardingWizard
            onComplete={() => setShowOnboarding(false)}
            onSkip={() => setShowOnboarding(false)}
          />
        )}
      </div>
    </>
  );
};

export default EnhancedUX;
