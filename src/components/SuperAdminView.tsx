import React, { useEffect, useState } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { db } from '../lib/firebase';
import { Users, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface UserData {
  uid: string;
  email: string;
  whatsapp: string;
  role: string;
  createdAt: string;
}

export default function SuperAdminView() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map(doc => doc.data() as UserData);
        setUsers(usersList);
      } catch (err: any) {
        setError(err.message || "Failed to fetch users");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="backdrop-blur-md bg-white/5 p-6 rounded-2xl border border-white/10 shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Dashboard Super Admin</h2>
            <p className="text-sm text-slate-400">Total Pendaftar: {users.length}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-300">
            <thead className="text-xs uppercase bg-white/5 border-b border-white/10 text-slate-400">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Nomor WhatsApp</th>
                <th className="px-4 py-3">Tanggal Daftar</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <tr key={user.uid || idx} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 font-medium text-white">{user.email}</td>
                  <td className="px-4 py-3">{user.whatsapp || '-'}</td>
                  <td className="px-4 py-3">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID') : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              Belum ada pengguna yang mendaftar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
