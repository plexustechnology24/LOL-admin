import React, { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

import TestingUrls from "../Monitoring/testingurls";
import TestingDevice from "../Monitoring/testingdevice";

const Device = () => {
    const [activeTab, setActiveTab] = useState("device");

    // ── Delete modal state ───────────────────────────────────────────────────
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: null,
    });
    const [isDeleting, setIsDeleting] = useState(false);

    const openDeleteModal = ({ title, message, onConfirm }) => {
        setDeleteModal({ isOpen: true, title, message, onConfirm });
    };

    const closeDeleteModal = () => {
        if (!isDeleting) {
            setDeleteModal({ isOpen: false, title: "", message: "", onConfirm: null });
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteModal.onConfirm) return;
        setIsDeleting(true);
        try {
            await deleteModal.onConfirm();
        } finally {
            setIsDeleting(false);
            closeDeleteModal();
        }
    };

    // ── Form modal state (lifted from TestingDevice) ─────────────────────────
    const [formVisible, setFormVisible] = useState(false);
    const [formMode, setFormMode] = useState("add"); // "add" | "edit"
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form fields
    const [deviceName, setDeviceName] = useState('');
    const [devicePerson, setDevicePerson] = useState('');
    const [deviceId, setDeviceId] = useState('');
    const [deviceType, setDeviceType] = useState('');
    const [editId, setEditId] = useState(undefined);

    // Email IDs (required)
    const [emailIds, setEmailIds] = useState([]);
    const [currentEmail, setCurrentEmail] = useState('');

    // Web Device IDs (optional)
    const [webDeviceIds, setWebDeviceIds] = useState([]);
    const [currentWebDeviceId, setCurrentWebDeviceId] = useState('');

    const [formErrors, setFormErrors] = useState({});

    // ── Form modal open/close helpers ────────────────────────────────────────
    const openAddModal = () => {
        setFormMode("add");
        setDeviceName('');
        setDevicePerson('');
        setDeviceId('');
        setDeviceType('');
        setEmailIds([]);
        setCurrentEmail('');
        setWebDeviceIds([]);
        setCurrentWebDeviceId('');
        setEditId(undefined);
        setFormErrors({});
        setFormVisible(true);
    };

    const openEditModal = (item) => {
        setFormMode("edit");
        setDeviceName(item.deviceName || '');
        setDevicePerson(item.devicePerson || '');
        setDeviceId(item.deviceId || '');
        setDeviceType(item.deviceType || '');
        setEmailIds(item.emailIds || []);
        setCurrentEmail('');
        setWebDeviceIds(item.webDeviceIds || []);
        setCurrentWebDeviceId('');
        setEditId(item._id);
        setFormErrors({});
        setFormVisible(true);
    };

    const closeFormModal = () => {
        if (!isSubmitting) {
            setFormVisible(false);
            setFormErrors({});
        }
    };

    const resetForm = () => {
        setDeviceName('');
        setDevicePerson('');
        setDeviceId('');
        setDeviceType('');
        setEmailIds([]);
        setCurrentEmail('');
        setWebDeviceIds([]);
        setCurrentWebDeviceId('');
        setEditId(null);
        setFormErrors({});
        setFormVisible(false);
    };

    // ── Email helpers ────────────────────────────────────────────────────────
    const validateEmail = (input) => /^[^\s@]+@[^\s@]+$/.test(input);

    const handleAddEmail = () => {
        const trimmed = currentEmail.trim();
        if (!trimmed) return setFormErrors(prev => ({ ...prev, currentEmail: 'Email cannot be empty' }));
        if (!validateEmail(trimmed)) return setFormErrors(prev => ({ ...prev, currentEmail: 'Invalid email format' }));
        if (emailIds.includes(trimmed)) return setFormErrors(prev => ({ ...prev, currentEmail: 'Email already added' }));
        setEmailIds([...emailIds, trimmed]);
        setCurrentEmail('');
        setFormErrors(prev => { const e = { ...prev }; delete e.currentEmail; delete e.emailIds; return e; });
    };

    const handleRemoveEmail = (email) => setEmailIds(emailIds.filter(e => e !== email));

    const handleEmailKeyPress = (e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddEmail(); } };

    // ── Web Device ID helpers ────────────────────────────────────────────────
    const handleAddWebDeviceId = () => {
        const trimmed = currentWebDeviceId.trim();
        if (!trimmed) return setFormErrors(prev => ({ ...prev, currentWebDeviceId: 'Web Device ID cannot be empty' }));
        if (webDeviceIds.includes(trimmed)) return setFormErrors(prev => ({ ...prev, currentWebDeviceId: 'Web Device ID already added' }));
        setWebDeviceIds([...webDeviceIds, trimmed]);
        setCurrentWebDeviceId('');
        setFormErrors(prev => { const e = { ...prev }; delete e.currentWebDeviceId; return e; });
    };

    const handleRemoveWebDeviceId = (wid) => setWebDeviceIds(webDeviceIds.filter(w => w !== wid));

    const handleWebDeviceIdKeyPress = (e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddWebDeviceId(); } };

    // ── Form validation ──────────────────────────────────────────────────────
    const validateForm = () => {
        const newErrors = {};
        if (!deviceName.trim()) newErrors.deviceName = 'Device Name is required';
        if (!devicePerson.trim()) newErrors.devicePerson = 'Person name is required';
        if (!deviceId.trim()) newErrors.deviceId = 'Device ID is required';
        if (!deviceType) newErrors.deviceType = 'Device Type is required';
        if (emailIds.length === 0) newErrors.emailIds = 'At least one email is required';
        return newErrors;
    };

    // onSubmitSuccess is called by TestingDevice after a successful API call
    // so the child can trigger a data refresh; we pass it via formModalProps
    const [onFormSuccess, setOnFormSuccess] = useState(null);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) { setFormErrors(validationErrors); return; }

        try {
            setIsSubmitting(true);
            // We call back into TestingDevice's submit logic via the injected callback
            if (onFormSuccess) {
                await onFormSuccess({
                    editId,
                    deviceName,
                    devicePerson,
                    deviceId,
                    deviceType,
                    emailIds,
                    webDeviceIds,
                });
            }
            resetForm();
        } catch {
            // errors are toasted inside the callback
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Props bundle passed to TestingDevice ─────────────────────────────────
    const formModalProps = {
        openAddModal,
        openEditModal,
        closeFormModal,
        registerSubmitCallback: (fn) => setOnFormSuccess(() => fn),
    };

    return (
        <div>
            <PageBreadcrumb pageTitle="Testing Device Control" />

            {/* Tab Buttons */}
            <div className="flex rounded-lg mb-6 w-full bg-gray-100 gap-5 ps-3 dark:bg-gray-800">
                <button
                    className={`py-3 px-6 font-medium text-base w-1/2 transition-all duration-300 ${
                        activeTab === "device"
                            ? "bg-blue-100 text-blue-600 dark:bg-[#696CFF] dark:text-white rounded-lg scale-105"
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    }`}
                    onClick={() => setActiveTab("device")}
                >
                    Device Control
                </button>
                <button
                    className={`py-3 px-6 font-medium text-base w-1/2 transition-all duration-300 ${
                        activeTab === "url"
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
                    className="rounded-2xl overflow-auto border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"
                    style={{ minHeight: "600px" }}
                >
                    <div className="px-6 pt-5">
                        {activeTab === "device" && (
                            <TestingDevice
                                openDeleteModal={openDeleteModal}
                                closeDeleteModal={closeDeleteModal}
                                isDeleting={isDeleting}
                                formModalProps={formModalProps}
                                isSubmitting={isSubmitting}
                            />
                        )}
                        {activeTab === "url" && <TestingUrls />}
                    </div>
                </div>
            </div>

            {/* ── Delete Confirmation Modal ────────────────────────────────── */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999]">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4 shadow-lg dark:bg-gray-800">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                            {deleteModal.title}
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-6">
                            {deleteModal.message}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={closeDeleteModal}
                                disabled={isDeleting}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-70 dark:bg-gray-700 dark:text-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-70"
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Add / Edit Form Modal (lifted from TestingDevice) ────────── */}
            {formVisible && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center">
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50"
                        onClick={closeFormModal}
                    />
                    <div className="relative bg-white rounded-lg w-full max-w-lg mx-4 dark:bg-gray-800 dark:text-gray-300 max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b dark:border-gray-700">
                            <h3 className="text-xl font-semibold">
                                {formMode === "edit" ? "Edit Device" : "Add Device"}
                            </h3>
                        </div>
                        <div className="px-6 py-4">
                            <form onSubmit={handleFormSubmit}>

                                {/* Person Name */}
                                <div className="mb-4">
                                    <label className="block font-medium mb-2">
                                        Person Name <span className="text-red-500 pl-2 font-normal text-lg">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={devicePerson}
                                        onChange={(e) => {
                                            setDevicePerson(e.target.value);
                                            if (formErrors.devicePerson) setFormErrors(prev => { const n = { ...prev }; delete n.devicePerson; return n; });
                                        }}
                                        placeholder="Enter person name"
                                        disabled={isSubmitting}
                                        className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 ${formErrors.devicePerson ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {formErrors.devicePerson && <p className="text-red-500 text-sm mt-1">{formErrors.devicePerson}</p>}
                                </div>

                                {/* Device Name */}
                                <div className="mb-4">
                                    <label className="block font-medium mb-2">
                                        Device Name <span className="text-red-500 pl-2 font-normal text-lg">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={deviceName}
                                        onChange={(e) => {
                                            setDeviceName(e.target.value);
                                            if (formErrors.deviceName) setFormErrors(prev => { const n = { ...prev }; delete n.deviceName; return n; });
                                        }}
                                        placeholder="Enter device name"
                                        disabled={isSubmitting}
                                        className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 ${formErrors.deviceName ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {formErrors.deviceName && <p className="text-red-500 text-sm mt-1">{formErrors.deviceName}</p>}
                                </div>

                                {/* Device Type */}
                                <div className="mb-4">
                                    <label className="block font-medium mb-2">
                                        Device Type <span className="text-red-500 pl-2 font-normal text-lg">*</span>
                                    </label>
                                    <select
                                        value={deviceType}
                                        onChange={(e) => {
                                            setDeviceType(e.target.value);
                                            if (formErrors.deviceType) setFormErrors(prev => { const n = { ...prev }; delete n.deviceType; return n; });
                                        }}
                                        disabled={isSubmitting}
                                        className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 ${formErrors.deviceType ? 'border-red-500' : 'border-gray-300'}`}
                                    >
                                        <option value="">Select Device Type</option>
                                        <option value="android">Android</option>
                                        <option value="ios">iOS</option>
                                    </select>
                                    {formErrors.deviceType && <p className="text-red-500 text-sm mt-1">{formErrors.deviceType}</p>}
                                </div>

                                {/* Device ID */}
                                <div className="mb-4">
                                    <label className="block font-medium mb-2">
                                        Device ID <span className="text-red-500 pl-2 font-normal text-lg">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={deviceId}
                                        onChange={(e) => {
                                            setDeviceId(e.target.value);
                                            if (formErrors.deviceId) setFormErrors(prev => { const n = { ...prev }; delete n.deviceId; return n; });
                                        }}
                                        placeholder="Enter Device ID"
                                        disabled={isSubmitting}
                                        className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 ${formErrors.deviceId ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {formErrors.deviceId && <p className="text-red-500 text-sm mt-1">{formErrors.deviceId}</p>}
                                </div>

                                {/* Email IDs (required) */}
                                <div className="mb-4">
                                    <label className="block font-medium mb-2">
                                        Email IDs <span className="text-red-500 pl-2 font-normal text-lg">*</span>
                                    </label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="email"
                                            value={currentEmail}
                                            onChange={(e) => {
                                                setCurrentEmail(e.target.value);
                                                if (formErrors.currentEmail) setFormErrors(prev => { const n = { ...prev }; delete n.currentEmail; return n; });
                                            }}
                                            onKeyPress={handleEmailKeyPress}
                                            placeholder="Enter email and press Enter or click Add"
                                            disabled={isSubmitting}
                                            className={`flex-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 ${formErrors.currentEmail ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddEmail}
                                            disabled={isSubmitting}
                                            className="px-4 py-2 text-white rounded-md disabled:opacity-50"
                                            style={{ backgroundColor: "#FA4B56" }}
                                        >
                                            Add
                                        </button>
                                    </div>
                                    {formErrors.currentEmail && <p className="text-red-500 text-sm mb-2">{formErrors.currentEmail}</p>}
                                    {emailIds.length > 0 && (
                                        <div className="flex flex-wrap gap-2 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                                            {emailIds.map((email, i) => (
                                                <span key={i} className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                                                    {email}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveEmail(email)}
                                                        disabled={isSubmitting}
                                                        className="hover:text-red-600 transition-colors"
                                                    >
                                                        <FontAwesomeIcon icon={faTimes} className="text-xs" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    {formErrors.emailIds && <p className="text-red-500 text-sm mt-1">{formErrors.emailIds}</p>}
                                </div>

                                {/* Web Device IDs (optional) */}
                                <div className="mb-4">
                                    <label className="block font-medium mb-2">
                                        Web Device IDs
                                        <span className="text-gray-400 text-sm font-normal ml-2">(optional)</span>
                                    </label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={currentWebDeviceId}
                                            onChange={(e) => {
                                                setCurrentWebDeviceId(e.target.value);
                                                if (formErrors.currentWebDeviceId) setFormErrors(prev => { const n = { ...prev }; delete n.currentWebDeviceId; return n; });
                                            }}
                                            onKeyPress={handleWebDeviceIdKeyPress}
                                            placeholder="Enter web device ID and press Enter or click Add"
                                            disabled={isSubmitting}
                                            className={`flex-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 ${formErrors.currentWebDeviceId ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddWebDeviceId}
                                            disabled={isSubmitting}
                                            className="px-4 py-2 text-white rounded-md disabled:opacity-50"
                                            style={{ backgroundColor: "#FA4B56" }}
                                        >
                                            Add
                                        </button>
                                    </div>
                                    {formErrors.currentWebDeviceId && <p className="text-red-500 text-sm mb-2">{formErrors.currentWebDeviceId}</p>}
                                    {webDeviceIds.length > 0 && (
                                        <div className="flex flex-wrap gap-2 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                                            {webDeviceIds.map((wid, i) => (
                                                <span key={i} className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                                                    {wid}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveWebDeviceId(wid)}
                                                        disabled={isSubmitting}
                                                        className="hover:text-red-600 transition-colors"
                                                    >
                                                        <FontAwesomeIcon icon={faTimes} className="text-xs" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Submit / Cancel */}
                                <div className="flex gap-4 mt-4">
                                    <button
                                        type="button"
                                        onClick={closeFormModal}
                                        disabled={isSubmitting}
                                        className="w-1/2 py-2 px-4 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-1/2 py-2 px-4 text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
                                        style={{ backgroundColor: "#FA4B56" }}
                                    >
                                        {isSubmitting ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                                        ) : (
                                            formMode === "edit" ? "Update" : "Submit"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer position="top-center" className="!z-[99999]" />
        </div>
    );
};

export default Device;