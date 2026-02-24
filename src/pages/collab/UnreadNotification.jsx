import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

const UnreadNotification = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const checkUnreadData = async () => {
        try {
            // Check if notification has already been shown in this session
            const hasShownNotification = sessionStorage.getItem('unreadNotificationShown');
            
            if (hasShownNotification === 'true') {
                return; // Don't show notification if already shown
            }

            const response = await axios.get('https://api.lolcards.link/api/collab/unread-count');
            const unreadCount = response.data.count;

            if (unreadCount > 0) {
                toast.info(
                    <div 
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => {
                            navigate('/collab');
                            toast.dismiss();
                        }}
                    >
                        <FontAwesomeIcon icon={faEnvelope} className="text-xl" />
                        <div>
                            <div className="font-semibold">New Collaboration Requests</div>
                            <div className="text-sm">You have {unreadCount} unread collaboration request{unreadCount > 1 ? 's' : ''}. Click to view.</div>
                        </div>
                    </div>,
                    {
                        autoClose: 5000,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    }
                );
                
                // Mark notification as shown in sessionStorage
                sessionStorage.setItem('unreadNotificationShown', 'true');
            }
        } catch (err) {
            console.error('Error checking unread data:', err);
        }
    };

    useEffect(() => {
        // Check on initial load
        checkUnreadData();
    }, [location.pathname]);

    return null;
};

export default UnreadNotification;