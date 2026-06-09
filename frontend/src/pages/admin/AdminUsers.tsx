import { useState, useEffect } from 'react';
import { Search, Eye, Lock, Unlock, X } from 'lucide-react';
import { adminUserApi, type AdminUserResponse } from '../../api/adminUserApi';

export default function AdminUsers() {
    const [users, setUsers] = useState<AdminUserResponse[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<AdminUserResponse | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchUsers(searchTerm);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const fetchUsers = async (keyword = '') => {
        setIsLoading(true);
        try {
            const data = await adminUserApi.getUsers({ keyword });

            setUsers(data.content || []);
        } catch (error) {
            console.error("Lỗi khi tải danh sách người dùng", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const toggleLockStatus = async (userId: number, currentLocked: boolean) => {
        try {
            if (currentLocked) {
                await adminUserApi.unlockUser(userId);
            } else {
                await adminUserApi.lockUser(userId, "Khóa tài khoản do vi phạm");
            }


            setUsers(users.map(user => {
                if (user.id === userId) {
                    return { ...user, locked: !currentLocked };
                }
                return user;
            }));

            if (selectedUser && selectedUser.id === userId) {
                setSelectedUser({ ...selectedUser, locked: !currentLocked });
            }
        } catch (error) {
            console.error("Lỗi khi thay đổi trạng thái tài khoản", error);
            alert("Không thể thay đổi trạng thái tài khoản lúc này!");
        }
    };

    const openUserDetails = (user: AdminUserResponse) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm min-h-full flex flex-col">
            {/* Header / Actions */}
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Quản lý Khách hàng</h1>
                    <p className="text-sm text-gray-500 mt-1">Xem chi tiết, khóa hoặc mở khóa tài khoản người dùng</p>
                </div>

                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm user..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                            <th className="px-6 py-4 font-medium">Người dùng</th>
                            <th className="px-6 py-4 font-medium">Vai trò</th>
                            <th className="px-6 py-4 font-medium">Trạng thái</th>
                            <th className="px-6 py-4 font-medium">Ngày tham gia</th>
                            <th className="px-6 py-4 font-medium text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                    Đang tải dữ liệu...
                                </td>
                            </tr>
                        ) : users.length > 0 ? (
                            users.map((user) => (
                                <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800">{user.username}</p>
                                                <p className="text-sm text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-max ${!user.locked ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {!user.locked ? <span className="w-2 h-2 rounded-full bg-green-500"></span> : <span className="w-2 h-2 rounded-full bg-red-500"></span>}
                                            {!user.locked ? 'Hoạt động' : 'Đã khóa'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">
                                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openUserDetails(user)}
                                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors tooltip"
                                                title="Xem chi tiết"
                                            >
                                                <Eye size={18} />
                                            </button>

                                            {user.role !== 'ADMIN' && (
                                                <button
                                                    onClick={() => toggleLockStatus(user.id, user.locked)}
                                                    className={`p-2 rounded-lg transition-colors tooltip ${!user.locked
                                                            ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                                                            : 'text-red-500 hover:text-green-600 hover:bg-green-50'
                                                        }`}
                                                    title={!user.locked ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                                                >
                                                    {!user.locked ? <Lock size={18} /> : <Unlock size={18} />}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                    Không tìm thấy người dùng nào.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* User Details Modal */}
            {isModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800">Chi tiết người dùng</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <div className="flex flex-col items-center mb-6">
                                <div className="w-20 h-20 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl font-bold mb-4 shadow-inner">
                                    {selectedUser.username.charAt(0).toUpperCase()}
                                </div>
                                <h4 className="text-xl font-bold text-gray-800">{selectedUser.username}</h4>
                                <p className="text-gray-500">{selectedUser.email}</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between py-2 border-b border-gray-50">
                                    <span className="text-gray-500">Vai trò</span>
                                    <span className="font-medium text-gray-800">{selectedUser.role}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-50">
                                    <span className="text-gray-500">Trạng thái</span>
                                    <span className={`font-medium ${!selectedUser.locked ? 'text-green-600' : 'text-red-600'}`}>
                                        {!selectedUser.locked ? 'Hoạt động' : 'Đã khóa'}
                                    </span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-50">
                                    <span className="text-gray-500">Ngày tham gia</span>
                                    <span className="font-medium text-gray-800">{new Date(selectedUser.createdAt).toLocaleDateString('vi-VN')}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-50">
                                    <span className="text-gray-500">ID tài khoản</span>
                                    <span className="font-mono text-sm text-gray-600">{selectedUser.id}</span>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                            >
                                Đóng
                            </button>
                            {selectedUser.role !== 'ADMIN' && (
                                <button
                                    onClick={() => toggleLockStatus(selectedUser.id, selectedUser.locked)}
                                    className={`px-4 py-2 text-white rounded-lg transition-colors shadow-sm font-medium flex items-center gap-2 ${!selectedUser.locked ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                                        }`}
                                >
                                    {!selectedUser.locked ? (
                                        <><Lock size={16} /> Khóa tài khoản</>
                                    ) : (
                                        <><Unlock size={16} /> Mở khóa tài khoản</>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
