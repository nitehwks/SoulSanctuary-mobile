import { useUser } from '@clerk/clerk-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { User, Bell, Shield, Moon } from 'lucide-react';

export default function Profile() {
  const { user } = useUser();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-sanctuary-light">Profile & Settings</h1>

      <Card>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-sanctuary-glow/20 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-sanctuary-glow" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-sanctuary-light">{user?.fullName}</h2>
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

        <div className="mt-6 pt-6 border-t border-sanctuary-accent/30">
          <Button variant="danger" className="w-full">Delete Account</Button>
        </div>
      </Card>
    </div>
  );
}
