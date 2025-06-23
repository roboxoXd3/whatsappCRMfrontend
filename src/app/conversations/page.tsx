'use client';

import { useState } from 'react';
import { ConversationList } from '@/components/conversations/conversation-list';
import { ConversationDetail } from '@/components/conversations/conversation-detail';
import { NewConversationModal } from '@/components/conversations/new-conversation-modal';
import { Conversation } from '@/lib/types/api';

export default function ConversationsPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isNewConversationModalOpen, setIsNewConversationModalOpen] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(true);

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleNewConversation = () => {
    setIsNewConversationModalOpen(true);
  };

  const handleCloseNewConversationModal = () => {
    setIsNewConversationModalOpen(false);
  };

  const handleConversationCreated = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setIsNewConversationModalOpen(false);
  };

  const toggleContactInfo = () => {
    setShowContactInfo(!showContactInfo);
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Left Panel - Conversations List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* WhatsApp-style Header - Exact match */}
        <div className="bg-[#00a884] text-white px-4 py-3 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#00a884]">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.690"/>
            </svg>
          </div>
          <h1 className="text-xl font-medium">Conversations</h1>
        </div>
        
        <ConversationList
          selectedConversationId={selectedConversation?.id}
          onConversationSelect={handleConversationSelect}
          onNewConversation={handleNewConversation}
        />
      </div>

      {/* Center Panel - Chat Area */}
      <div className="flex-1 flex flex-col bg-[#f0f2f5]">
        {selectedConversation ? (
          <ConversationDetail
            conversation={selectedConversation}
            onBack={() => setSelectedConversation(null)}
            onToggleContactInfo={toggleContactInfo}
            showContactInfo={showContactInfo}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#f0f2f5]">
            <div className="text-center max-w-md px-8">
              <div className="w-80 h-80 mx-auto mb-8 opacity-20">
                <svg viewBox="0 0 303 172" className="w-full h-full">
                  <defs>
                    <linearGradient id="a" x1="50%" x2="50%" y1="100%" y2="0%">
                      <stop offset="0%" stopColor="#1fa855" stopOpacity=".106"/>
                      <stop offset="100%" stopColor="#1fa855" stopOpacity=".325"/>
                    </linearGradient>
                  </defs>
                  <g fill="none" fillRule="evenodd">
                    <g transform="translate(61.000000, 24.000000)">
                      <rect width="182" height="124" fill="url(#a)" rx="27"/>
                      <rect width="182" height="124" stroke="#42CBA5" strokeWidth="1" rx="27"/>
                      <rect width="158" height="93" x="12" y="15" fill="#FFF" rx="12"/>
                      <rect width="136" height="4" x="23" y="30" fill="#4FC3F7" rx="2"/>
                      <rect width="136" height="4" x="23" y="39" fill="#4FC3F7" rx="2"/>
                      <rect width="97" height="4" x="23" y="48" fill="#4FC3F7" rx="2"/>
                      <rect width="124" height="4" x="23" y="66" fill="#4FC3F7" rx="2"/>
                      <rect width="136" height="4" x="23" y="75" fill="#4FC3F7" rx="2"/>
                      <rect width="65" height="4" x="23" y="84" fill="#4FC3F7" rx="2"/>
                    </g>
                    <g transform="translate(0.000000, 0.000000)">
                      <rect width="182" height="124" fill="url(#a)" rx="27"/>
                      <rect width="182" height="124" stroke="#42CBA5" strokeWidth="1" rx="27"/>
                      <rect width="158" height="93" x="12" y="15" fill="#FFF" rx="12"/>
                      <rect width="136" height="4" x="23" y="30" fill="#4FC3F7" rx="2"/>
                      <rect width="136" height="4" x="23" y="39" fill="#4FC3F7" rx="2"/>
                      <rect width="97" height="4" x="23" y="48" fill="#4FC3F7" rx="2"/>
                      <rect width="124" height="4" x="23" y="66" fill="#4FC3F7" rx="2"/>
                      <rect width="136" height="4" x="23" y="75" fill="#4FC3F7" rx="2"/>
                      <rect width="65" height="4" x="23" y="84" fill="#4FC3F7" rx="2"/>
                    </g>
                    <g transform="translate(121.000000, 48.000000)">
                      <rect width="182" height="124" fill="url(#a)" rx="27"/>
                      <rect width="182" height="124" stroke="#42CBA5" strokeWidth="1" rx="27"/>
                      <rect width="158" height="93" x="12" y="15" fill="#FFF" rx="12"/>
                      <rect width="136" height="4" x="23" y="30" fill="#4FC3F7" rx="2"/>
                      <rect width="136" height="4" x="23" y="39" fill="#4FC3F7" rx="2"/>
                      <rect width="97" height="4" x="23" y="48" fill="#4FC3F7" rx="2"/>
                      <rect width="124" height="4" x="23" y="66" fill="#4FC3F7" rx="2"/>
                      <rect width="136" height="4" x="23" y="75" fill="#4FC3F7" rx="2"/>
                      <rect width="65" height="4" x="23" y="84" fill="#4FC3F7" rx="2"/>
                    </g>
                  </g>
                </svg>
              </div>
              <h3 className="text-[32px] font-light text-[#41525d] mb-3 leading-normal">
                WhatsApp Web
              </h3>
              <p className="text-[#667781] text-sm leading-relaxed mb-6">
                Send and receive messages without keeping your phone online.<br />
                Use WhatsApp on up to 4 linked devices and 1 phone at the same time.
              </p>
              <div className="bg-[#fdf6e3] border border-[#e9dcc9] rounded-lg p-4 text-sm text-[#8696a0] flex items-center gap-2">
                <svg viewBox="0 0 10 12" className="w-3 h-3 fill-current">
                  <path d="M5 0C3.346 0 2 1.346 2 3v1H1a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H8V3c0-1.654-1.346-3-3-3zM5 1c1.103 0 2 .897 2 2v1H3V3c0-1.103.897-2 2-2z"/>
                </svg>
                <span>Your personal messages are end-to-end encrypted</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      <NewConversationModal
        isOpen={isNewConversationModalOpen}
        onClose={handleCloseNewConversationModal}
        onConversationCreated={handleConversationCreated}
      />
    </div>
  );
} 