import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, Filter, Search, User, MessageSquare, AlertTriangle, FileText, Send, Eye, Users, TrendingUp, Award, Star } from 'lucide-react';
import { getCurrentUser, isDirector } from '../utils/auth';
import { mockLeaveRequests, mockUsers } from '../data/mockData';
import { formatDate, getRelativeDate } from '../utils/dateUtils';
import { getRoleDisplayName } from '../utils/auth';

const ManagerLeaveApprovals: React.FC = () => {
  const user = getCurrentUser();
  const [leaveRequests, setLeaveRequests] = useState(mockLeaveRequests);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [approvalComments, setApprovalComments] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  const isDir = isDirector(user.role);

  if (!isDir) {
    return (
      <div className="text-center py-16">
        <Users className="w-20 h-20 text-gray-400 mx-auto mb-6" />
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h3>
        <p className="text-gray-600 text-lg">This page is only available for Directors.</p>
      </div>
    );
  }

  // Get managers under this director
  const managersUnderDirector = mockUsers.filter(u => 
    u.managerId === user.id && u.role.includes('manager')
  );

  // Get leave requests from managers under this director
  const managerLeaveRequests = leaveRequests.filter(lr => 
    managersUnderDirector.some(manager => manager.id === lr.userId)
  );

  // Filter requests
  const filteredRequests = managerLeaveRequests.filter(request => {
    const requester = mockUsers.find(u => u.id === request.userId);
    const matchesSearch = !searchTerm || 
      requester?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      requester?.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || request.status === filterStatus;
    const matchesType = !filterType || request.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const pendingRequests = filteredRequests.filter(r => r.status === 'pending');
  const approvedRequests = filteredRequests.filter(r => r.status === 'approved');
  const rejectedRequests = filteredRequests.filter(r => r.status === 'rejected');

  const handleApproval = (requestId: string, approved: boolean, comments?: string) => {
    setLeaveRequests(prev => prev.map(request => {
      if (request.id === requestId) {
        return {
          ...request,
          status: approved ? 'approved' : 'rejected',
          approverChain: request.approverChain.map(step => 
            step.approverId === user.id 
              ? { ...step, status: approved ? 'approved' : 'rejected', timestamp: new Date().toISOString(), comments }
              : step
          )
        };
      }
      return request;
    }));
    
    setShowApprovalModal(false);
    setSelectedRequest(null);
    setApprovalComments('');
    
    // Show success notification
    const action = approved ? 'approved' : 'rejected';
    console.log(`Manager leave request ${action} successfully`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vacation': return 'bg-blue-100 text-blue-800';
      case 'sick': return 'bg-red-100 text-red-800';
      case 'personal': return 'bg-purple-100 text-purple-800';
      case 'emergency': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const ApprovalModal = ({ requestId }: { requestId: string }) => {
    const request = leaveRequests.find(r => r.id === requestId);
    const requester = mockUsers.find(u => u.id === request?.userId);
    
    if (!request || !requester) return null;

    const daysDifference = Math.ceil((new Date(request.endDate).getTime() - new Date(request.startDate).getTime()) / (1000 * 3600 * 24)) + 1;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <MessageSquare className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Review Manager Leave Request</h3>
                <p className="text-purple-100 mt-1">Director approval required</p>
              </div>
            </div>
          </div>
          
          <div className="p-8 space-y-8">
            {/* Manager Info */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center space-x-4">
                <img
                  src={requester.avatar}
                  alt={requester.name}
                  className="w-16 h-16 rounded-full object-cover ring-4 ring-white shadow-lg"
                />
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-gray-900">{requester.name}</h4>
                  <p className="text-lg text-gray-600">{getRoleDisplayName(requester.role)}</p>
                  <p className="text-sm text-gray-500 capitalize">{requester.department.replace('_', ' ')} Department</p>
                </div>
                <div className="text-right">
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-sm text-gray-600">Leave Balance</p>
                    <p className="text-2xl font-bold text-blue-600">{requester.leaveBalance}</p>
                    <p className="text-xs text-gray-500">days remaining</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Leave Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <h5 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span>Leave Details</span>
                </h5>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Leave Type</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(request.type)}`}>
                      {request.type.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-bold text-gray-900">{daysDifference} day{daysDifference > 1 ? 's' : ''}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Dates</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(request.startDate)} - {formatDate(request.endDate)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <h5 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  <span>Request Information</span>
                </h5>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Submitted</p>
                    <p className="font-medium text-gray-900">{getRelativeDate(request.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border-2 ${getStatusColor(request.status)}`}>
                      {request.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reason */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
              <h5 className="font-bold text-gray-900 mb-3 flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-yellow-600" />
                <span>Reason for Leave</span>
              </h5>
              <p className="text-gray-700 leading-relaxed bg-white rounded-lg p-4 border border-yellow-200">
                {request.reason}
              </p>
            </div>

            {/* Director Comments */}
            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
              <label className="block text-sm font-bold text-gray-900 mb-3">
                Director Comments (Optional)
              </label>
              <textarea
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
                rows={4}
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                placeholder="Add any comments for the manager..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-8 border-t border-gray-200 bg-gray-50">
            <div className="flex space-x-4">
              <button
                onClick={() => handleApproval(request.id, true, approvalComments)}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-bold flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <CheckCircle className="w-6 h-6" />
                <span>Approve Leave Request</span>
              </button>
              <button
                onClick={() => handleApproval(request.id, false, approvalComments)}
                className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 text-white py-4 px-6 rounded-xl hover:from-red-700 hover:to-pink-700 transition-all duration-300 font-bold flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <XCircle className="w-6 h-6" />
                <span>Reject Request</span>
              </button>
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setSelectedRequest(null);
                  setApprovalComments('');
                }}
                className="px-8 py-4 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent">
            Manager Leave Approvals
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Review and approve leave requests from your managers</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl px-4 py-2 border border-purple-200">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-600" />
              <span className="font-bold text-purple-900">{managersUnderDirector.length} Managers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100">Pending Approval</p>
              <p className="text-3xl font-bold mt-2">{pendingRequests.length}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Approved</p>
              <p className="text-3xl font-bold mt-2">{approvedRequests.length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100">Rejected</p>
              <p className="text-3xl font-bold mt-2">{rejectedRequests.length}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Requests</p>
              <p className="text-3xl font-bold mt-2">{managerLeaveRequests.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search managers by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="vacation">Vacation</option>
            <option value="sick">Sick Leave</option>
            <option value="personal">Personal</option>
            <option value="emergency">Emergency</option>
          </select>
        </div>
      </div>

      {/* Leave Requests */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Manager Leave Requests</h3>
          <p className="text-gray-600 mt-1">Review and approve leave requests from your managers</p>
        </div>

        <div className="p-6">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No leave requests found</h3>
              <p className="text-gray-600">
                {searchTerm || filterStatus || filterType 
                  ? 'Try adjusting your search criteria.' 
                  : 'No manager leave requests to review at this time.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => {
                const requester = mockUsers.find(u => u.id === request.userId);
                const daysDifference = Math.ceil((new Date(request.endDate).getTime() - new Date(request.startDate).getTime()) / (1000 * 3600 * 24)) + 1;
                
                return (
                  <div key={request.id} className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-purple-300">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                          <img
                            src={requester?.avatar}
                            alt={requester?.name}
                            className="w-14 h-14 rounded-full object-cover ring-4 ring-white shadow-lg"
                          />
                          <div className="flex-1">
                            <h4 className="text-xl font-bold text-gray-900">{requester?.name}</h4>
                            <p className="text-gray-600 font-medium">{getRoleDisplayName(requester?.role || 'employee')}</p>
                            <p className="text-sm text-gray-500 capitalize">{requester?.department.replace('_', ' ')} Department</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${getStatusColor(request.status)}`}>
                              {request.status.toUpperCase()}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(request.type)}`}>
                              {request.type.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <p className="text-sm text-blue-600 font-medium">Duration</p>
                            <p className="text-lg font-bold text-blue-900">{daysDifference} day{daysDifference > 1 ? 's' : ''}</p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                            <p className="text-sm text-green-600 font-medium">Dates</p>
                            <p className="text-sm font-bold text-green-900">
                              {formatDate(request.startDate)} - {formatDate(request.endDate)}
                            </p>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                            <p className="text-sm text-purple-600 font-medium">Submitted</p>
                            <p className="text-sm font-bold text-purple-900">{getRelativeDate(request.createdAt)}</p>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
                          <p className="text-sm text-gray-600 font-medium mb-2">Reason for Leave</p>
                          <p className="text-gray-800 leading-relaxed">{request.reason}</p>
                        </div>
                      </div>
                    </div>

                    {request.status === 'pending' && (
                      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => {
                            setSelectedRequest(request.id);
                            setShowApprovalModal(true);
                          }}
                          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 font-bold flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <Eye className="w-5 h-5" />
                          <span>Review Request</span>
                        </button>
                      </div>
                    )}

                    {request.status !== 'pending' && (
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {request.status === 'approved' ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-600" />
                            )}
                            <span className="text-sm font-medium text-gray-700">
                              {request.status === 'approved' ? 'Approved' : 'Rejected'} by you
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {request.approverChain.find(step => step.approverId === user.id)?.timestamp && 
                              getRelativeDate(request.approverChain.find(step => step.approverId === user.id)!.timestamp!)
                            }
                          </span>
                        </div>
                        {request.approverChain.find(step => step.approverId === user.id)?.comments && (
                          <div className="mt-3 bg-blue-50 rounded-lg p-3 border border-blue-200">
                            <p className="text-sm font-medium text-blue-900 mb-1">Your Comments:</p>
                            <p className="text-sm text-blue-800">
                              {request.approverChain.find(step => step.approverId === user.id)?.comments}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedRequest && <ApprovalModal requestId={selectedRequest} />}
    </div>
  );
};

export default ManagerLeaveApprovals;