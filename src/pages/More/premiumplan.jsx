import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "react-bootstrap";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import CustomPagination from "../../components/common/pagination";
import { EditorState } from 'draft-js';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';


const PremiumPlan = () => {
    const [visible, setVisible] = useState(false);
    const [data, setData] = useState([]);
    const [id, setId] = useState();
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [androidId, setAndroidId] = useState('');
    const [iosId, setIosId] = useState('');
    const [isActive, setIsActive] = useState(false);
    const [editorState, setEditorState] = useState(EditorState.createEmpty());
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen2, setIsOpen2] = useState(false);
    const [filteredData, setFilteredData] = useState([]);
    const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const languageDropdownRef = useRef(null);
    const emojiPickerRef = useRef(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [togglingId, setTogglingId] = useState(null);


    // Pagination logic
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [Items, setTotalItems] = useState();



    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                languageDropdownRef.current && !languageDropdownRef.current.contains(event.target)
            ) {
                setIsOpen2(false);
                setIsLanguageDropdownOpen(false);
            }

            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };

        if (isOpen2 || isLanguageDropdownOpen || showEmojiPicker) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen2, isLanguageDropdownOpen, showEmojiPicker]);

    const toggleModal = (mode) => {
        if (!isSubmitting) {
            if (mode === 'add') {
                setTitle('');
                setAndroidId('');
                setIosId('');
                // Set isActive to true if no active plans exist
                const hasActivePlan = data.some(plan => plan.isActive);
                setIsActive(!hasActivePlan);
                setEditorState(EditorState.createEmpty());
                setId(undefined);
            }
            setErrors({});
            setVisible(!visible);
        }
    };


    // API calls - Modified to maintain current page
    const getData = async (page = currentPage) => {
        try {
            setLoading(true);

            const requestData = {
                page: page,
                limit: itemsPerPage,
            };

            const response = await axios.post('https://api.lolcards.link/api/premium/read', requestData);

            setData(response.data.data);
            setFilteredData(response.data.data);

            setCurrentPage(response.data.pagination.currentPage);
            setTotalItems(response.data.pagination.totalItems);

            // Reset selection when data is refreshed
            setSelectedItems([]);
            setSelectAll(false);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getData(currentPage);
    }, [itemsPerPage]); // Re-fetch when items per page changes


    // Get current items for display
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData;

    useEffect(() => {
        if (currentItems.length > 0 && selectedItems.length > 0) {
            const allCurrentItemsSelected = currentItems.every(item =>
                selectedItems.includes(item._id)
            );
            setSelectAll(allCurrentItemsSelected);
        } else {
            setSelectAll(false);
        }
    }, [currentItems, selectedItems]);

    const validate = () => {
        const newErrors = {};

        if (!title.trim()) newErrors.title = 'Premium Plan Title is required';
        if (!androidId.trim()) newErrors.androidId = 'Android ID is required';
        if (!iosId.trim()) newErrors.iosId = 'iOS ID is required';


        return newErrors;
    };


    // Modified handleSubmit to maintain current page and ensure one active plan
    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            setIsSubmitting(true);
            const endpoint = id
                ? `https://api.lolcards.link/api/premium/update/${id}`
                : 'https://api.lolcards.link/api/premium/create';
            const method = id ? 'patch' : 'post';

            // Get plain text for submission
            const plainText = editorState.getCurrentContent().getPlainText();

            const response = await axios[method](endpoint, {
                title: title,
                androidId: androidId,
                iosId: iosId,
                isActive: isActive
            });

            toast.success(response.data.message);
            resetForm();
            // Pass current page to maintain pagination
            getData(currentPage);
        } catch (err) {
            console.error(err);
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle toggle status with validation
    const handleToggleStatus = async (premiumId, currentStatus) => {
        // Prevent disabling if this is the only active plan
        if (currentStatus) {
            const activeCount = data.filter(plan => plan.isActive).length;
            if (activeCount === 1) {
                toast.warning("At least one premium plan must be active. Please activate another plan first.");
                return;
            }
        }

        try {
            setTogglingId(premiumId);
            const newStatus = !currentStatus;

            const response = await axios.patch(
                `https://api.lolcards.link/api/premium/update/${premiumId}`,
                {
                    isActive: newStatus
                }
            );

            toast.success(response.data.message);
            // Refresh data to get updated status
            getData(currentPage);
        } catch (err) {
            console.error(err);
            toast.error("Failed to update status.");
        } finally {
            setTogglingId(null);
        }
    };

    // UI handlers
    const resetForm = () => {
        setTitle('');
        setAndroidId('');
        setIosId('');
        setIsActive(false);
        setEditorState(EditorState.createEmpty());
        setId(null);
        setErrors({});
        setVisible(false);
    };

    const handleEdit = (premium) => {
        if (!isSubmitting) {
            setTitle(premium.title || '');
            setAndroidId(premium.androidId || '');
            setIosId(premium.iosId || '');
            setIsActive(premium.isActive || false);
            setId(premium._id);
            setVisible(true);
        }
    };

    // Modified handleDelete to prevent deleting the last active plan
    const handleDelete = async (id) => {
        const planToDelete = data.find(plan => plan._id === id);
        
        // Check if trying to delete the only active plan
        if (planToDelete?.isActive) {
            const activeCount = data.filter(plan => plan.isActive).length;
            if (activeCount === 1) {
                toast.warning("Cannot delete the only active premium plan. Please activate another plan first.");
                return;
            }
        }

        if (!isSubmitting && window.confirm("Are you sure you want to delete this Premium Plan?")) {
            try {
                setIsSubmitting(true);
                const response = await axios.delete(`https://api.lolcards.link/api/premium/delete/${id}`);
                toast.success(response.data.message);
                // Pass current page to maintain pagination
                getData(currentPage);
            } catch (err) {
                console.error(err);
                toast.error("An error occurred. Please try again.");
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    if (loading) return (
        <div
            style={{
                height: '80vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: "hidden"
            }}
        >
            <div className="border p-4 flex items-center space-x-2 rounded-md">
                <div className="w-10 h-10 border-2 border-gray-300 rounded-full animate-spin dark:border-gray-800" style={{ borderTop: "2px solid #FA4B56" }}></div>
            </div>
        </div>
    );

    // Custom toolbar configuration for the editor - simplified for plain text
    const toolbarOptions = {
        options: [], // Empty array to hide all toolbar options
    };

    return (
        <div>
            <PageBreadcrumb pageTitle="Premium Plan" />
            <div className="space-y-6 sticky left-0">
                <div
                    className={`rounded-2xl overflow-auto border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]`}
                    style={{ minHeight: "600px" }}
                >
                    {/* Card Header */}
                    <div className="px-6 pt-5">
                        <div className="flex justify-end items-center px-4 py-3 mt-4 dark:border-gray-800 border-gray-200">

                            <Button
                                onClick={() => toggleModal('add')}
                                className="rounded-md border-0 shadow-md px-4 py-2 text-white"
                                style={{ background: "#FA4B56" }}
                            >
                                <FontAwesomeIcon icon={faPlus} className='pe-2' /> Add Premium Plan
                            </Button>
                        </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 border-gray-100 dark:border-gray-800 sm:p-6 overflow-auto">
                        <div className="space-y-6 rounded-lg xl:border dark:border-gray-800">
                            <Table>
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <TableRow>
                                        <TableCell isHeader className="py-4 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Index</TableCell>
                                        <TableCell isHeader className="py-7 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Premium Plan Title</TableCell>
                                        <TableCell isHeader className="py-7 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Android Id</TableCell>
                                        <TableCell isHeader className="py-7 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">IOS Id</TableCell>
                                        <TableCell isHeader className="py-7 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Status</TableCell>
                                        <TableCell isHeader className="py-7 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Action</TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-center">
                                    {currentItems.length > 0 ? (
                                        currentItems.map((premium, index) => {
                                            const isOnlyActivePlan = premium.isActive && data.filter(p => p.isActive).length === 1;
                                            
                                            return (
                                                <TableRow key={premium._id}>
                                                    <TableCell className="text-center px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">
                                                        {indexOfFirstItem + index + 1}
                                                    </TableCell>
                                                    <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">{premium.title}</TableCell>
                                                    <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400 flex items-center justify-center gap-4">
                                                        {premium.androidId}
                                                    </TableCell>
                                                    <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">{premium.iosId}</TableCell>
                                                    <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">
                                                        <div className="flex items-center justify-center">
                                                            <button
                                                                onClick={() => handleToggleStatus(premium._id, premium.isActive)}
                                                                disabled={togglingId === premium._id || isOnlyActivePlan}
                                                                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                                                                    premium.isActive ? 'bg-green-500' : 'bg-gray-300'
                                                                } ${
                                                                    togglingId === premium._id || isOnlyActivePlan 
                                                                        ? 'cursor-not-allowed' 
                                                                        : 'cursor-pointer'
                                                                }`}
                                                                title={isOnlyActivePlan ? "At least one plan must be active" : ""}
                                                            >
                                                                <span
                                                                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                                                        premium.isActive ? 'translate-x-6' : 'translate-x-1'
                                                                    }`}
                                                                />
                                                            </button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">
                                                        <div className="flex align-middle justify-center gap-4">
                                                            <button style={{ color: "#0385C3" }} onClick={() => handleEdit(premium)}>
                                                                <FontAwesomeIcon icon={faEdit}
                                                                    className="text-lg" />
                                                            </button>
                                                            <button 
                                                                className={`text-red-600 ${isOnlyActivePlan ? 'cursor-not-allowed' : ''}`}
                                                                onClick={() => handleDelete(premium._id)}
                                                                disabled={isOnlyActivePlan}
                                                                title={isOnlyActivePlan ? "Cannot delete the only active plan" : ""}
                                                            >
                                                                <FontAwesomeIcon icon={faTrash}
                                                                    className="text-lg" />
                                                            </button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="text-center pt-5 pb-4 dark:text-gray-400">No Data Found</td>
                                        </tr>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>

            <CustomPagination
                currentPage={currentPage}
                totalPages={Math.ceil(Items / itemsPerPage)}
                onPageChange={(page) => {
                    setSelectedItems([]);
                    setSelectAll(false);
                    getData(page);
                }}
                itemsPerPage={itemsPerPage}
                totalItems={Items}
            />

            {visible && (
                <div className="fixed inset-0 z-99999 flex items-center justify-center">
                    {/* Modal Backdrop */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50"
                        onClick={() => !isSubmitting && toggleModal('add')}
                    ></div>

                    {/* Modal Content */}
                    <div className="relative bg-white rounded-lg w-full max-w-lg mx-4 dark:bg-gray-800 dark:text-gray-300 max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="px-6 py-4 border-b dark:border-gray-700">
                            <h3 className="text-xl font-semibold">
                                {id ? "Edit Premium Plan" : "Add Premium Plan"}
                            </h3>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-4">
                            <form onSubmit={handleSubmit}>
                                {/* Premium Plan Title */}
                                <div className="mb-4">
                                    <label className="block font-medium mb-2">
                                        Premium Plan Title
                                        <span className="text-red-500 pl-2 font-normal text-lg">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => {
                                            setTitle(e.target.value);
                                            if (errors.title) {
                                                setErrors(prev => {
                                                    const newErrors = { ...prev };
                                                    delete newErrors.title;
                                                    return newErrors;
                                                });
                                            }
                                        }}
                                        placeholder="Enter premium plan title"
                                        disabled={isSubmitting}
                                        className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors.title && (
                                        <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                                    )}
                                </div>

                                {/* Android ID */}
                                <div className="mb-4">
                                    <label className="block font-medium mb-2">
                                        Android ID
                                        <span className="text-red-500 pl-2 font-normal text-lg">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={androidId}
                                        onChange={(e) => {
                                            setAndroidId(e.target.value);
                                            if (errors.androidId) {
                                                setErrors(prev => {
                                                    const newErrors = { ...prev };
                                                    delete newErrors.androidId;
                                                    return newErrors;
                                                });
                                            }
                                        }}
                                        placeholder="Enter Android ID"
                                        disabled={isSubmitting}
                                        className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 ${errors.androidId ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors.androidId && (
                                        <p className="text-red-500 text-sm mt-1">{errors.androidId}</p>
                                    )}
                                </div>

                                {/* iOS ID */}
                                <div className="mb-4">
                                    <label className="block font-medium mb-2">
                                        iOS ID
                                        <span className="text-red-500 pl-2 font-normal text-lg">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={iosId}
                                        onChange={(e) => {
                                            setIosId(e.target.value);
                                            if (errors.iosId) {
                                                setErrors(prev => {
                                                    const newErrors = { ...prev };
                                                    delete newErrors.iosId;
                                                    return newErrors;
                                                });
                                            }
                                        }}
                                        placeholder="Enter iOS ID"
                                        disabled={isSubmitting}
                                        className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 ${errors.iosId ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors.iosId && (
                                        <p className="text-red-500 text-sm mt-1">{errors.iosId}</p>
                                    )}
                                </div>

                                {/* Status Toggle */}
                                <div className="mb-4">
                                    <label className="block font-medium mb-2">
                                        Active Status
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                // Prevent disabling if editing the only active plan
                                                if (id && isActive) {
                                                    const activeCount = data.filter(plan => plan.isActive).length;
                                                    if (activeCount === 1) {
                                                        toast.warning("At least one premium plan must be active.");
                                                        return;
                                                    }
                                                }
                                                setIsActive(!isActive);
                                            }}
                                            disabled={isSubmitting || (!id && data.filter(p => p.isActive).length === 0)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                isActive ? 'bg-green-500' : 'bg-gray-300'
                                            } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                    isActive ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                            />
                                        </button>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    {!id && data.filter(p => p.isActive).length === 0 && (
                                        <p className="text-sm text-gray-500 mt-1">First plan must be active</p>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-4 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => toggleModal()}
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
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                                        ) : (
                                            id ? 'Update' : 'Submit'
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

export default PremiumPlan;