import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import apiCall from '@/lib/api';
import { 
  Shield, 
  Users, 
  Film, 
  MessageSquare, 
  Star, 
  AlertTriangle,
  FileText,
  Activity,
  Lock,
  Server,
  Key
} from 'lucide-react';

interface AdminStats {
  stats: {
    totalUsers: number;
    totalMovies: number;
    totalComments: number;
    totalReviews: number;
    totalDiscussions: number;
    moviesCount: number;
    seriesCount: number;
  };
  recentActivity: {
    newUsers: number;
    newComments: number;
    newReviews: number;
  };
  topMoods: Array<{ mood: string; count: number }>;
}

interface SecurityMemo {
  memo: {
    id: string;
    title: string;
    date: string;
    classification: string;
    content: string;
    recoveryKey: string;
    notes: string;
  };
}

const AdminDashboard = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [securityMemo, setSecurityMemo] = useState<SecurityMemo | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showWatchLater, setShowWatchLater] = useState(false);

  // Redirect non-admin users
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to access the admin dashboard.',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [isAdmin, isLoading, navigate]);

  // Fetch admin stats
  useEffect(() => {
    if (isAdmin) {
      fetchStats();
      fetchSecurityMemo();
    }
  }, [isAdmin]);

  const fetchStats = async () => {
    try {
      const response = await apiCall<AdminStats>('/admin/stats');
      if (response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load admin statistics.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  // CTF: Fetch the security memo containing the flag
  const fetchSecurityMemo = async () => {
    try {
      const response = await apiCall<SecurityMemo>('/admin/security-memo');
      if (response.data) {
        setSecurityMemo(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch security memo:', error);
    }
  };

  const onLogoClick = () => {
    navigate('/');
  };

  if (isLoading || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        favoritesCount={0}
        watchLaterCount={0}
        onFavoritesClick={() => setShowFavorites(true)}
        onWatchLaterClick={() => setShowWatchLater(true)}
        onLogoClick={onLogoClick}
      />

      <main className="flex-1 container mx-auto px-4 pt-24 pb-12">
        {/* Admin Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <Badge variant="default" className="bg-primary text-primary-foreground">
              <Lock className="w-3 h-3 mr-1" />
              Admin Only
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}. You have full system access.
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoadingStats ? '...' : stats?.stats.totalUsers || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +{stats?.recentActivity.newUsers || 0} this week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Content</CardTitle>
                  <Film className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoadingStats ? '...' : stats?.stats.totalMovies || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.stats.moviesCount || 0} movies, {stats?.stats.seriesCount || 0} series
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Comments</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoadingStats ? '...' : stats?.stats.totalComments || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +{stats?.recentActivity.newComments || 0} this week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Reviews</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoadingStats ? '...' : stats?.stats.totalReviews || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +{stats?.recentActivity.newReviews || 0} this week
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Top Moods */}
            <Card>
              <CardHeader>
                <CardTitle>Content Distribution by Mood</CardTitle>
                <CardDescription>Most popular moods in the database</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {stats?.topMoods.map((mood) => (
                    <Badge key={mood.mood} variant="secondary" className="text-sm">
                      {mood.mood}: {mood.count}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">New user registrations</span>
                    <Badge variant="default">{stats?.recentActivity.newUsers || 0}</Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm">New comments posted</span>
                    <Badge variant="default">{stats?.recentActivity.newComments || 0}</Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm">New reviews submitted</span>
                    <Badge variant="default">{stats?.recentActivity.newReviews || 0}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab - CTF: Contains the flag */}
          <TabsContent value="security" className="space-y-6">
            <Card className="border-2 border-primary">
              <CardHeader className="bg-primary/5">
                <div className="flex items-center gap-2">
                  <Shield className="w-6 h-6 text-primary" />
                  <CardTitle>Internal Security Memo</CardTitle>
                </div>
                <CardDescription>
                  Classified administrative information - Admin eyes only
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {securityMemo ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="w-4 h-4" />
                      <span>Memo ID: {securityMemo.memo.id}</span>
                      <Separator orientation="vertical" className="h-4" />
                      <span>Date: {new Date(securityMemo.memo.date).toLocaleDateString()}</span>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold mb-2">{securityMemo.memo.content}</h4>
                      
                      {/* CTF: The flag is displayed here in a realistic security memo */}
                      <div className="mt-4 p-4 bg-muted rounded-lg border border-dashed border-primary/50">
                        <div className="flex items-center gap-2 mb-2">
                          <Key className="w-4 h-4 text-primary" />
                          <span className="font-mono text-sm font-semibold">Recovery Key:</span>
                        </div>
                        <code className="block font-mono text-sm bg-background p-3 rounded border break-all">
                          {securityMemo.memo.recoveryKey}
                        </code>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        {securityMemo.memo.notes}
                      </p>
                    </div>

                    <Badge variant="destructive" className="mt-4">
                      {securityMemo.memo.classification}
                    </Badge>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    Loading security memo...
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Security Incident Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <CardTitle>Security Incidents</CardTitle>
                </div>
                <CardDescription>Recent security events and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-600 hover:bg-green-700 text-white">RESOLVED</Badge>
                      <span className="text-sm font-medium text-green-900 dark:text-green-100">System Health Check</span>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      All systems operational. Last check: {new Date().toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-600 hover:bg-blue-700 text-white">INFO</Badge>
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Authentication System</span>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Using enhanced authentication with role-based access control.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  <CardTitle>System Status</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-600" />
                      <span className="text-sm font-medium text-green-900 dark:text-green-100">API Server</span>
                    </div>
                    <Badge className="bg-green-600 hover:bg-green-700 text-white">Online</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-600" />
                      <span className="text-sm font-medium text-green-900 dark:text-green-100">Database</span>
                    </div>
                    <Badge className="bg-green-600 hover:bg-green-700 text-white">Connected</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-600" />
                      <span className="text-sm font-medium text-green-900 dark:text-green-100">Authentication</span>
                    </div>
                    <Badge className="bg-green-600 hover:bg-green-700 text-white">Active</Badge>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="text-sm text-muted-foreground">
                  <p>FilmSEC Admin Panel v1.0.0-ctf</p>
                  <p>Last updated: {new Date().toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>

            {/* Debug Panel - Hidden feature for CTF */}
            <Card className="border-dashed border-muted-foreground/30">
              <CardHeader>
                <CardTitle className="text-muted-foreground flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Debug Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Internal system diagnostics for troubleshooting purposes.
                </p>
                <div className="font-mono text-xs text-muted-foreground space-y-1">
                  <p>Session: Active</p>
                  <p>Role: {user?.role}</p>
                  <p>User ID: {user?.id}</p>
                  <p>Access Level: {isAdmin ? 'FULL' : 'LIMITED'}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
