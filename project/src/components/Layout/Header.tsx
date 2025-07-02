import React, { useState } from 'react';
import { Bell, ChevronDown, LogOut, User, Settings, X, CheckCircle, Clock, AlertTriangle, MessageSquare, Calendar, TrendingUp, Users, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, getSimpleDesignation, isDirector, isManager } from '../../utils/auth';
import { mockNotifications, mockLeaveRequests, mockUsers } from '../../data/mockData';
import { formatDate, getRelativeDate } from '../../utils/dateUtils';
import ProfileModal from '../Profile/ProfileModal';

interface HeaderProps {
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const user = getCurrentUser();
  
  const isDir = isDirector(user.role);
  const isMgr = isManager(user.role);

  // Enhanced notifications with real-time data
  const getEnhancedNotifications = () => {
    const baseNotifications = [...notifications];
    
    // Add leave request notifications for directors/managers
    if (isDir || isMgr) {
      const pendingLeaveRequests = mockLeaveRequests.filter(lr => {
        if (lr.status !== 'pending') return false;
        
        const requester = mockUsers.find(u => u.id === lr.userId);
        if (!requester) return false;

        if (isDir) {
          // Directors see manager leave requests
          return requester.managerId === user.id && requester.role.includes('manager');
        } else if (isMgr) {
          // Managers see employee/intern leave requests
          return requester.managerId === user.id && (requester.role === 'employee' || requester.role === 'intern');
        }
        
        return false;
      });

      // Add notifications for pending leave requests
      pendingLeaveRequests.forEach(request => {
        const requester = mockUsers.find(u => u.id === request.userId);
        if (requester) {
          baseNotifications.unshift({
            id: `leave-${request.id}`,
            userId: user.id,
            title: `${isDir ? 'Manager' : 'Employee'} Leave Request`,
            message: `${requester.name} has requested ${request.type} leave from ${formatDate(request.startDate)} to ${formatDate(request.endDate)}. Please review and approve.`,
            type: 'info' as const,
            read: false,
            createdAt: request.createdAt,
            actionUrl: isDir ? '/manager-leave-approvals' : '/leave-management'
          });
        }
      });
    }

    // Add project approval notifications for directors
    if (isDir) {
      // Mock pending project approvals
      baseNotifications.unshift({
        id: 'project-approval-1',
        userId: user.id,
        title: 'Project Approval Required',
        message: 'New project proposal "Mobile App Development" submitted by Anna Martinez requires your approval.',
        type: 'warning' as const,
        read: false,
        createdAt: new Date().toISOString(),
        actionUrl: '/projects'
      });
    }

    // Add team progress notifications for managers
    if (isMgr) {
      baseNotifications.unshift({
        id: 'team-progress-1',
        userId: user.id,
        title: 'Team Progress Update',
        message: 'Weekly team progress report is ready for review. 3 team members have submitted their progress reports.',
        type: 'success' as const,
        read: false,
        createdAt: new Date().toISOString(),
        actionUrl: '/team-progress'
      });
    }

    return baseNotifications.filter(n => n.userId === user.id).slice(0, 15);
  };

  const enhancedNotifications = getEnhancedNotifications();
  const unreadCount = enhancedNotifications.filter(n => !n.read).length;

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    setShowProfileMenu(false);
    setShowProfileModal(true);
  };

  const handleSettingsClick = () => {
    setShowProfileMenu(false);
    setShowProfileModal(true);
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => 
        n.userId === user.id ? { ...n, read: true } : n
      )
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-l-green-500 bg-green-50';
      case 'warning': return 'border-l-yellow-500 bg-yellow-50';
      case 'error': return 'border-l-red-500 bg-red-50';
      default: return 'border-l-blue-500 bg-blue-50';
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 h-16 fixed top-0 right-0 left-64 z-20">
        <div className="flex items-center justify-end h-full px-6">
          <div className="flex items-center space-x-4">
            {/* Enhanced Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden">
                  {/* Notification Header */}
                  <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                          <Bell className="w-5 h-5 text-blue-600" />
                          <span>Notifications</span>
                        </h3>
                        {unreadCount > 0 && (
                          <p className="text-sm text-gray-600 mt-1">{unreadCount} unread notifications</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            Mark all read
                          </button>
                        )}
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Notifications List */}
                  <div className="max-h-80 overflow-y-auto">
                    {enhancedNotifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">No notifications yet</p>
                        <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
                      </div>
                    ) : (
                      enhancedNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 ${
                            !notification.read ? getNotificationColor(notification.type) : 'border-l-gray-300 bg-white'
                          }`}
                          onClick={() => {
                            markNotificationAsRead(notification.id);
                            if (notification.actionUrl) {
                              navigate(notification.actionUrl);
                              setShowNotifications(false);
                            }
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                {getNotificationIcon(notification.type)}
                                <p className="text-sm font-bold text-gray-900">{notification.title}</p>
                                {!notification.read && (
                                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                )}
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed mb-2">{notification.message}</p>
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-500">
                                  {getRelativeDate(notification.createdAt)}
                                </p>
                                {notification.actionUrl && (
                                  <span className="text-xs text-blue-600 font-medium">Click to view →</span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  {/* Notification Footer */}
                  {enhancedNotifications.length > 0 && (
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          Showing {enhancedNotifications.length} notifications
                        </span>
                        <button className="text-blue-600 hover:text-blue-800 font-medium">
                          View all notifications
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{getSimpleDesignation(user.role)}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="py-2">
                    <button
                      onClick={handleProfileClick}
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </button>
                    <button
                      onClick={handleSettingsClick}
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
      />
    </>
  );
};

export default Header;