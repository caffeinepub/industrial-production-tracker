import { useState } from 'react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserRole } from '../backend';

export default function ProfileSetup() {
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.Admin);
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && department.trim()) {
      saveProfile.mutate({ 
        name: name.trim(), 
        department: department.trim(),
        role: role
      });
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome! Set up your profile</DialogTitle>
          <DialogDescription>
            Please provide your name, department, and role to continue.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department *</Label>
            <Input
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g., Production, Quality Control"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserRole.Admin}>Admin</SelectItem>
                <SelectItem value={UserRole.Viewer}>Viewer</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Admin: Can add/edit production data. Viewer: Can only view dashboard.
            </p>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={!name.trim() || !department.trim() || saveProfile.isPending}
          >
            {saveProfile.isPending ? 'Saving...' : 'Save Profile'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
