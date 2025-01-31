import { GetToken, route } from '@/api/route';
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import React, { useState } from 'react'
import UserTable from './UserTable';

function Users() {
  const [loading, setLoading] = useState(true);
  const [apiloading, setApiLoading] = useState(false);
  const [userForm, setUserForm] = useState<boolean>(false);
  const [VPNPeer, setVPNPeer] = useState({
    username: '',
    device_name: ''
  });

  const CreateVpn = async () => {
    console.log(VPNPeer);
    const { username, device_name } = VPNPeer;
    const response = await fetch(route.vpn_add(username, device_name), {

      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GetToken()}`,
      },
    }
  );
  }
  return (
    <div className='h-screen  w-full flex flex-col gap-4'>
      <div className='flex  p-4 justify-between items-center'>
      <h1>Users</h1>
      <Button onClick={() =>setUserForm(e => !e)}>Add User</Button>


      <Dialog open={userForm} onOpenChange={setUserForm}>
        <DialogContent>
          <DialogHeader>
        <DialogTitle>Create New VPN</DialogTitle>
          </DialogHeader>
          <div className='flex flex-col gap-4'>
        <div className="flex flex-col gap-2">
          <Input placeholder='Username' aria-describedby="username-help" value={VPNPeer.username} name='username' onChange={(e) => setVPNPeer(val => ({ ...val, [e.target.name]: e.target.value }))} />
          <small id="username-help">
            Enter username to Create VPN Peer.
          </small>
        </div>
        <div className="flex flex-col gap-2">
          <Input placeholder='Device Name' aria-describedby="device-name-help" value={VPNPeer.device_name} name='device_name' onChange={(e) => setVPNPeer(val => ({ ...val, [e.target.name]: e.target.value }))} />
          <small id="device-name-help">
            Enter Device Name to Attach Through the VPN Peer.
          </small>
        </div>
        <Button onClick={CreateVpn} disabled={apiloading}>
          {apiloading ? "Creating..." : "Create VPN"}
        </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>

      <div>
      <UserTable />
      </div>
    </div>
  )
}

export default Users
