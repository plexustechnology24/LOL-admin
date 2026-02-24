import React, { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import 'react-toastify/dist/ReactToastify.css';

import TestingUrls from "../Monitoring/testingurls";
import TestingDevice from "../Monitoring/testingdevice";

const Device = () => {
    const [activeTab, setActiveTab] = useState("device");
 
    return (
        <div>
            <PageBreadcrumb pageTitle="Testing Device Control" />

            {/* Tab Buttons */}
            <div className="flex rounded-lg mb-6 w-full bg-gray-100 gap-5 ps-3 dark:bg-gray-800">
                <button
                    className={`py-3 px-6 font-medium text-base w-1/2 transition-all duration-300 ${activeTab === "device"
                        ? "bg-blue-100 text-blue-600 dark:bg-[#696CFF] dark:text-white rounded-lg scale-105"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                        }`}
                    onClick={() => setActiveTab("device")}
                >
                    Device Control
                </button>
                <button
                    className={`py-3 px-6 font-medium text-base w-1/2 transition-all duration-300 ${activeTab === "url"
                        ? "bg-blue-100 text-blue-600 dark:bg-[#696CFF] dark:text-white rounded-lg scale-105"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                        }`}
                    onClick={() => setActiveTab("url")}
                >
                    Testing Urls
                </button>
            </div>

            <div className="space-y-6 sticky left-0">
                <div
                    className={`rounded-2xl overflow-auto border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]`}
                    style={{ minHeight: "600px" }}
                >
                    {/* Card Header */}
                    <div className="px-6 pt-5">
                        {activeTab === "device" && (
                            <TestingDevice />
                        )}

                        {/* Add DeepLink Button - only show when DeepLink tab is active */}
                        {activeTab === "url" && (
                            <TestingUrls />
                        )}
                    </div>

                   
                </div>
            </div>
        </div>
    );
};

export default Device;