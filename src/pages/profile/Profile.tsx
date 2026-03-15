import { useState } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { User, Bell, Shield, Moon, LogOut, Trash2, AlertTriangle } from 'lucide-react';
import { Preferences } from '@capacitor/preferences';

export default function Profile() {
  const { user } = useUser();
  const { signOut } = useClerkAuth();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleLogout = async () => {
    await signOut();
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setDeleteError('');

    try {
      // Call delete endpoint
      const response = await fetch('/api/user', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: '' }), // Clerk handles re-authentication
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete account');
      }

      // Clear local storage
      await Preferences.clear();

      // Sign out from Clerk
      await signOut();

      // Redirect to auth page
      navigate('/', { replace: true });
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete account');
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-sanctuary-light">Profile & Settings</h1>

      <Card>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-sanctuary-glow/20 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-sanctuary-glow" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-sanctuary-light">{user?.fullName || 'User'}</h2>
            <p className="text-sanctuary-light/50">{user?.primaryEmailAddress?.emailAddress}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-sanctuary-dark/30 rounded-xl">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-sanctuary-light/70" />
              <span className="text-sanctuary-light">Push Notifications</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-sanctuary-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sanctuary-glow"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-sanctuary-dark/30 rounded-xl">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-sanctuary-light/70" />
              <span className="text-sanctuary-light">End-to-End Encryption</span>
            </div>
            <span className="text-green-400 text-sm font-medium">Enabled</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-sanctuary-dark/30 rounded-xl">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-sanctuary-light/70" />
              <span className="text-sanctuary-light">Dark Mode</span>
            </div>
            <span className="text-sanctuary-light/50 text-sm">Always On</span>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-sanctuary-accent/30 space-y-3">
          <Button 
            variant="secondary" 
            className="w-full flex items-center justify-center gap-2"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
          
          <Button 
            variant="danger" 
            className="w-full flex items-center justify-center gap-2"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
          </Button>
        </div>
      </Card>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-sanctuary-dark border border-red-500/30 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <h3 className="text-xl font-bold text-red-400">Delete Account?</h3>
            </div>
            
            <p className="text-sanctuary-light/80 mb-4">
              This action cannot be undone. This will permanently delete:
            </p>
            
            <ul className="list-disc list-inside text-sanctuary-light/70 mb-6 space-y-1">
              <li>Your profile and account</li>
              <li>All mood entries and history</li>
              <li>All goals and milestones</li>
              <li>All memories in your vault</li>
              <li>Crisis event history</li>
              <li>Chat history</li>
            </ul>

            {deleteError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {deleteError}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteError('');
                }}
                disabled={deleteLoading}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
