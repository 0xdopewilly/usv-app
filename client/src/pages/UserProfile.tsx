import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Camera, Edit3, Award, Coins, Star, Share } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import BottomNavigation from '@/components/BottomNavigation';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';

interface UserStats {
  totalClaims: number;
  totalTokens: number;
  rank: number;
  joinedDate: string;
  achievements: Achievement[];
  level: number;
  experience: number;
  nextLevelXP: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const userStats: UserStats = {
  totalClaims: 342,
  totalTokens: 8550,
  rank: 127,
  joinedDate: '2024-03-15',
  level: 12,
  experience: 2340,
  nextLevelXP: 3000,
  achievements: [
    {
      id: '1',
      name: 'First Steps',
      description: 'Completed your first QR scan',
      icon: '🎯',
      unlockedAt: '2024-03-15',
      rarity: 'common'
    },
    {
      id: '2',
      name: 'Token Collector',
      description: 'Earned 1,000 USV tokens',
      icon: '💰',
      unlockedAt: '2024-04-02',
      rarity: 'rare'
    },
    {
      id: '3',
      name: 'Streak Master',
      description: 'Maintained a 30-day claim streak',
      icon: '🔥',
      unlockedAt: '2024-05-18',
      rarity: 'epic'
    },
    {
      id: '4',
      name: 'Community Champion',
      description: 'Referred 10 friends to USV',
      icon: '👥',
      unlockedAt: '2024-06-10',
      rarity: 'legendary'
    }
  ]
};

export default function UserProfile() {
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: 'Amanda Johnson',
    username: '@amanda_usv',
    bio: 'Vape enthusiast and USV token collector 🌟',
    location: 'New York, NY',
    website: 'https://amanda.vape'
  });
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: false,
    publicProfile: true,
    shareStats: true
  });
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSaveProfile = () => {
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated",
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'USV Token Profile',
          text: `Check out my USV Token profile! I've earned ${userStats.totalTokens} tokens and completed ${userStats.totalClaims} claims.`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Profile Link Copied",
        description: "Share your profile link with friends!",
      });
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-600';
      case 'rare': return 'bg-blue-600';
      case 'epic': return 'bg-purple-600';
      case 'legendary': return 'bg-orange-600';
      default: return 'bg-gray-600';
    }
  };

  const experiencePercentage = (userStats.experience / userStats.nextLevelXP) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black relative pb-20">
      <BottomNavigation />
      
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="px-6 pt-12 pb-4 flex items-center justify-between"
      >
        <ArrowLeft 
          className="w-6 h-6 text-white cursor-pointer" 
          onClick={() => setLocation('/')}
        />
        <h1 className="text-white text-xl font-semibold">Profile</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleShare}
          className="text-white hover:bg-white/10"
          data-testid="button-share-profile"
        >
          <Share className="w-5 h-5" />
        </Button>
      </motion.div>

      {/* Profile Header */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="px-6 mb-6"
      >
        <div className="bg-gray-800/50 backdrop-blur rounded-3xl p-6 border border-gray-700/30">
          <div className="flex items-start space-x-4 mb-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-purple-500/30">
                <img 
                  src="https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=100&h=100&fit=crop&crop=face" 
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                size="icon"
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-purple-600 hover:bg-purple-700 rounded-full"
                data-testid="button-change-avatar"
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                    className="bg-gray-700/50 border-gray-600 text-white rounded-xl"
                    data-testid="input-full-name"
                  />
                  <Input
                    value={profileData.username}
                    onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                    className="bg-gray-700/50 border-gray-600 text-white rounded-xl"
                    data-testid="input-username"
                  />
                </div>
              ) : (
                <div>
                  <h2 className="text-white text-xl font-bold">{profileData.fullName}</h2>
                  <p className="text-purple-400 font-medium">{profileData.username}</p>
                  <p className="text-gray-400 text-sm mt-1">{profileData.bio}</p>
                </div>
              )}
              
              {/* Level Progress */}
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-sm font-medium">Level {userStats.level}</span>
                  <span className="text-gray-400 text-xs">{userStats.experience}/{userStats.nextLevelXP} XP</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${experiencePercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(!isEditing)}
              className="text-white hover:bg-white/10"
              data-testid="button-edit-profile"
            >
              <Edit3 className="w-5 h-5" />
            </Button>
          </div>

          {isEditing && (
            <div className="space-y-3 pt-4 border-t border-gray-700">
              <Input
                placeholder="Bio"
                value={profileData.bio}
                onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                className="bg-gray-700/50 border-gray-600 text-white rounded-xl"
                data-testid="input-bio"
              />
              <Input
                placeholder="Location"
                value={profileData.location}
                onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                className="bg-gray-700/50 border-gray-600 text-white rounded-xl"
                data-testid="input-location"
              />
              <Input
                placeholder="Website"
                value={profileData.website}
                onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                className="bg-gray-700/50 border-gray-600 text-white rounded-xl"
                data-testid="input-website"
              />
              <Button
                onClick={handleSaveProfile}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                data-testid="button-save-profile"
              >
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="px-6 mb-6 grid grid-cols-3 gap-4"
      >
        <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-4 border border-gray-700/30 text-center">
          <Coins className="w-6 h-6 text-purple-400 mx-auto mb-2" />
          <p className="text-white text-lg font-bold">{userStats.totalTokens.toLocaleString()}</p>
          <p className="text-gray-400 text-xs">Tokens</p>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-4 border border-gray-700/30 text-center">
          <Award className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <p className="text-white text-lg font-bold">{userStats.totalClaims}</p>
          <p className="text-gray-400 text-xs">Claims</p>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-4 border border-gray-700/30 text-center">
          <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
          <p className="text-white text-lg font-bold">#{userStats.rank}</p>
          <p className="text-gray-400 text-xs">Rank</p>
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="px-6 mb-6"
      >
        <h3 className="text-white text-lg font-semibold mb-4">Achievements</h3>
        <div className="grid grid-cols-2 gap-3">
          {userStats.achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="bg-gray-800/50 backdrop-blur rounded-2xl p-4 border border-gray-700/30"
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{achievement.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-white font-medium text-sm">{achievement.name}</h4>
                    <Badge className={`${getRarityColor(achievement.rarity)} text-white text-xs`}>
                      {achievement.rarity}
                    </Badge>
                  </div>
                  <p className="text-gray-400 text-xs">{achievement.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Settings */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="px-6"
      >
        <h3 className="text-white text-lg font-semibold mb-4">Privacy Settings</h3>
        <div className="bg-gray-800/50 backdrop-blur rounded-3xl p-6 border border-gray-700/30 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Push Notifications</p>
              <p className="text-gray-400 text-sm">Get notified about rewards and updates</p>
            </div>
            <Switch
              checked={settings.pushNotifications}
              onCheckedChange={(checked) => setSettings({...settings, pushNotifications: checked})}
              data-testid="switch-push-notifications"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Email Notifications</p>
              <p className="text-gray-400 text-sm">Receive updates via email</p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
              data-testid="switch-email-notifications"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Public Profile</p>
              <p className="text-gray-400 text-sm">Make your profile visible to others</p>
            </div>
            <Switch
              checked={settings.publicProfile}
              onCheckedChange={(checked) => setSettings({...settings, publicProfile: checked})}
              data-testid="switch-public-profile"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Share Statistics</p>
              <p className="text-gray-400 text-sm">Allow others to see your stats</p>
            </div>
            <Switch
              checked={settings.shareStats}
              onCheckedChange={(checked) => setSettings({...settings, shareStats: checked})}
              data-testid="switch-share-stats"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}