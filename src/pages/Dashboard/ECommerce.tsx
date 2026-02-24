import React, { useEffect, useState } from "react";
import axios from "axios";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { faBell, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router";

const MoreDashboard = () => {
    const [countData, setCountData] = useState({
        userCount: 0,
        autoCount: 0,
        pushCount: 0,
    });

    const fetchData = async () => {
        try {
            const res = await axios.get("https://api.lolcards.link/api/admin/dashboard");
            if (res.data.status === 1) {
                setCountData(res.data);
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const navigate = useNavigate();

    return (
        <div>
            <PageBreadcrumb pageTitle="Dashboard" />

            {/* Users */}
            <h1 className="dark:text-white/90 my-4 font-semibold text-lg">Users</h1>
            <div className="rounded-2xl dark:bg-white/[0.06] bg-[#ede9fe] p-5 my-5">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl" style={{ background: "#8b5cf6" }}>
                    <FontAwesomeIcon icon={faUser} className="text-white dark:text-white/90" />
                </div>
                <div className="flex items-end justify-between mt-5">
                    <p className="text-[17px] text-gray-600 dark:text-gray-400 mb-2">Total Users</p>
                    <h4 className="mt-2 font-bold text-title-sm text-gray-600 dark:text-gray-400 mb-1">
                        {countData.userCount}
                    </h4>
                </div>
            </div>

            {/* Push Notifications */}
            <h1 className="dark:text-white/90 my-4 font-semibold text-lg">Push Notifications</h1>
            <div className="rounded-2xl dark:bg-white/[0.06] bg-[#dcfce7] p-5 my-5" onClick={() => navigate("/push-notification")}>
                <div className="flex items-center justify-center w-10 h-10 rounded-xl" style={{ background: "#3cd856" }}>
                    <FontAwesomeIcon icon={faBell} className="text-white dark:text-white/90" />
                </div>
                <div className="flex items-end justify-between mt-5">
                    <p className="text-[17px] text-gray-600 dark:text-gray-400 mb-2">Total Push Notifications</p>
                    <h4 className="mt-2 font-bold text-title-sm text-gray-600 dark:text-gray-400 mb-1">
                        {countData.pushCount}
                    </h4>
                </div>
            </div>

            {/* Auto Notifications */}
            <h1 className="dark:text-white/90 my-4 font-semibold text-lg">Auto Notifications</h1>
            <div className="rounded-2xl dark:bg-white/[0.06] bg-[#FFF4DE] p-5 my-5" onClick={() => navigate("/auto-notification")}>
                <div className="flex items-center justify-center w-10 h-10 rounded-xl" style={{ background: "#FF947A" }}>
                    <FontAwesomeIcon icon={faBell} className="text-white dark:text-white/90" />
                </div>
                <div className="flex items-end justify-between mt-5">
                    <p className="text-[17px] text-gray-600 dark:text-gray-400 mb-2">Total Auto Notifications</p>
                    <h4 className="mt-2 font-bold text-title-sm text-gray-600 dark:text-gray-400 mb-1">
                        {countData.autoCount}
                    </h4>
                </div>
            </div>
        </div>
    );
};

export default MoreDashboard;
