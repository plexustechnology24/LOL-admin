import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "react-bootstrap";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPlus, faTrash, faTimes, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import CustomPagination from "../../components/common/pagination";
import { faCopy } from "@fortawesome/free-regular-svg-icons";


const TestingDevice = () => {
    const [visible, setVisible] = useState(false);
    const [data, setData] = useState([]);
    const [id, setId] = useState();
    const [loading, setLoading] = useState(true);
    const [deviceName, setdeviceName] = useState('');
    const [devicePerson, setdevicePerson] = useState('');
    const [deviceId, setdeviceId] = useState('');
    const [emailIds, setEmailIds] = useState([]);
    const [currentEmail, setCurrentEmail] = useState('');
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [filteredData, setFilteredData] = useState([]);
    const [selectedEmails, setSelectedEmails] = useState([]);
    const [selectAllEmails, setSelectAllEmails] = useState(false);
    const [pagination, setPagination] = useState([]);

    // NEW: Delete modal state
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        id: null,
        isBulk: false,
        isEmailDelete: false,
        emailToDelete: null
    });
    const [isDeleting, setIsDeleting] = useState(false);

    // NEW: Multiple selection state
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    const [deviceType, setDeviceType] = useState('');
    const [isDeviceTypeOpen, setIsDeviceTypeOpen] = useState(false);
    const [deviceTypeFilter, setDeviceTypeFilter] = useState('');


    // Define device types
    const deviceTypes = [
        { id: 'android', label: 'Android' },
        { id: 'ios', label: 'iOS' }
    ];

    // Pagination logic
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [Items, setTotalItems] = useState();

    const toggleModal = (mode) => {
        if (!isSubmitting) {
            if (mode === 'add') {
                setdeviceName('');
                setdevicePerson('');
                setdeviceId('');
                setDeviceType(''); // Add this line
                setEmailIds([]);
                setCurrentEmail('');
                setId(undefined);
            }
            setErrors({});
            setVisible(!visible);
        }
    };
    // NEW: Open delete modal
    const openDeleteModal = (id = null, isBulk = false, isEmailDelete = false, emailToDelete = null) => {
        if (isBulk && selectedItems.length === 0) {
            toast.info("No items selected for deletion.");
            return;
        }
        // NEW: Check for email bulk delete
        if (isEmailDelete && !emailToDelete && selectedEmails.length === 0) {
            toast.info("No emails selected for deletion.");
            return;
        }
        setDeleteModal({
            isOpen: true,
            id,
            isBulk,
            isEmailDelete,
            emailToDelete: emailToDelete || (isEmailDelete ? selectedEmails : null)
        });
    };

    // NEW: Close delete modal
    const closeDeleteModal = () => {
        setDeleteModal({
            isOpen: false,
            id: null,
            isBulk: false,
            isEmailDelete: false,
            emailToDelete: null
        });
    };

    // NEW: Clear all filters
    const clearAllFilters = () => {
        setSelectedItems([]);
        setSelectAll(false);
        toast.info("Selection cleared");
    };

    const handleSelectAllEmails = () => {
        if (!selectAllEmails) {
            const allEmails = currentItems.flatMap(item => item.emailIds || []);
            setSelectedEmails(allEmails);
        } else {
            setSelectedEmails([]);
        }
        setSelectAllEmails(!selectAllEmails);
    };

    // NEW: Handle individual email checkbox
    const handleSelectEmail = (email) => {
        if (selectedEmails.includes(email)) {
            setSelectedEmails(selectedEmails.filter(e => e !== email));
            if (selectAllEmails) setSelectAllEmails(false);
        } else {
            setSelectedEmails([...selectedEmails, email]);
        }
    };

    // NEW: Clear email selection
    const clearEmailSelection = () => {
        setSelectedEmails([]);
        setSelectAllEmails(false);
        toast.info("Email selection cleared");
    };

    // API calls - Modified to maintain current page
    const getData = async (page = currentPage) => {
        try {
            setLoading(true);

            const requestData = {
                page: page,
                limit: itemsPerPage,
                deviceType: deviceTypeFilter || undefined // Add this line
            };

            const response = await axios.post('https://api.lolcards.link/api/device/read', requestData);

            setData(response.data.data);
            setPagination(response.data.pagination);
            setFilteredData(response.data.data);

            setCurrentPage(response.data.pagination.currentPage);
            setTotalItems(response.data.pagination.totalItems);

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
    }, [itemsPerPage]);

    useEffect(() => {
        getData(1);
    }, [deviceTypeFilter]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (setIsDeviceTypeOpen && !event.target.closest('.relative')) {
                setIsDeviceTypeOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [setIsDeviceTypeOpen]);

    // Get current items for display
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData;

    // NEW: Handle select all checkbox
    const handleSelectAll = () => {
        if (!selectAll) {
            const allIds = currentItems.map(item => item._id);
            setSelectedItems(allIds);
        } else {
            setSelectedItems([]);
        }
        setSelectAll(!selectAll);
    };

    // NEW: Handle individual checkbox change
    const handleSelectItem = (id) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter(itemId => itemId !== id));
            if (selectAll) setSelectAll(false);
        } else {
            setSelectedItems([...selectedItems, id]);
            const allSelected = currentItems.every(item =>
                selectedItems.includes(item._id) || item._id === id
            );
            setSelectAll(allSelected);
        }
    };

    // NEW: Update selectAll state when currentItems or selectedItems change
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

    // Email validation function
    const validateEmail = (input) => {
        const emailRegex = /^[^\s@]+@[^\s@]+$/;
        return emailRegex.test(input);
    };

    // Add email to the list
    const handleAddEmail = () => {
        const trimmedEmail = currentEmail.trim();

        if (!trimmedEmail) {
            setErrors(prev => ({ ...prev, currentEmail: 'Email cannot be empty' }));
            return;
        }

        if (!validateEmail(trimmedEmail)) {
            setErrors(prev => ({ ...prev, currentEmail: 'Invalid email format' }));
            return;
        }

        if (emailIds.includes(trimmedEmail)) {
            setErrors(prev => ({ ...prev, currentEmail: 'Email already added' }));
            return;
        }

        setEmailIds([...emailIds, trimmedEmail]);
        setCurrentEmail('');
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.currentEmail;
            delete newErrors.emailIds;
            return newErrors;
        });
    };

    // Remove email from the list
    const handleRemoveEmail = (emailToRemove) => {
        setEmailIds(emailIds.filter(email => email !== emailToRemove));
    };

    // Handle Enter key press in email input
    const handleEmailKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddEmail();
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!deviceName.trim()) newErrors.deviceName = 'Device Name is required';
        if (!devicePerson.trim()) newErrors.devicePerson = 'Person name is required';
        if (!deviceId.trim()) newErrors.deviceId = 'Device ID is required';
        if (!deviceType) newErrors.deviceType = 'Device Type is required';
        if (emailIds.length === 0) newErrors.emailIds = 'At least one email is required';

        return newErrors;
    };

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
                ? `https://api.lolcards.link/api/device/update/${id}`
                : 'https://api.lolcards.link/api/device/create';
            const method = id ? 'patch' : 'post';

            const response = await axios[method](endpoint, {
                deviceName: deviceName,
                devicePerson: devicePerson,
                deviceId: deviceId,
                deviceType: deviceType, // Add this line
                emailIds: emailIds
            });

            toast.success(response.data.message);
            resetForm();
            getData(currentPage);
        } catch (err) {
            console.error(err);
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // UI handlers
    const resetForm = () => {
        setdeviceName('');
        setdevicePerson('');
        setdeviceId('');
        setDeviceType(''); // Add this line
        setEmailIds([]);
        setCurrentEmail('');
        setId(null);
        setErrors({});
        setVisible(false);
    };

    const handleEdit = (premium) => {
        if (!isSubmitting) {
            setdeviceName(premium.deviceName || '');
            setdevicePerson(premium.devicePerson || '');
            setdeviceId(premium.deviceId || '');
            setDeviceType(premium.deviceType || ''); // Add this line
            setEmailIds(premium.emailIds || []);
            setCurrentEmail('');
            setId(premium._id);
            setVisible(true);
        }
    };

    // MODIFIED: Single delete with modal
    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            const response = await axios.delete(`https://api.lolcards.link/api/device/delete/${deleteModal.id}`);
            toast.success(response.data.message);

            if (currentItems.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
                getData(currentPage - 1);
            } else {
                getData(currentPage);
            }
            closeDeleteModal();
        } catch (err) {
            console.error(err);
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    // NEW: Delete multiple devices
    const handleDeleteSelected = async () => {
        try {
            setIsDeleting(true);
            const payload = {
                ids: selectedItems,
                TypeId: "4" // Adjust TypeId as needed for devices
            };

            const response = await axios.post('https://api.lolcards.link/api/admin/deleteMultiple', payload);
            toast.success(`Successfully deleted ${selectedItems.length} device(s).`);

            getData(currentPage);
            closeDeleteModal();
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete selected devices. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    // MODIFIED: Delete email data with confirmation modal
    const handleDeleteData = async () => {
        try {
            setIsDeleting(true);

            // Support both single and multiple email deletion
            const emailsToDelete = Array.isArray(deleteModal.emailToDelete)
                ? deleteModal.emailToDelete
                : [deleteModal.emailToDelete];

            const response = await axios.delete(
                "https://api.lolcards.link/api/device/deletedata",
                {
                    data: { id: emailsToDelete }
                }
            );

            // Handle response with details
            if (response.data.details) {
                const { successful, notFound, failed } = response.data.details;

                if (successful.length > 0) {
                    toast.success(response.data.message);
                }

                if (notFound.length > 0) {
                    toast.error(`No data found for: ${notFound.join(", ")}`);
                }

                if (failed.length > 0) {
                    toast.error(`Failed to delete: ${failed.map(f => f.email).join(", ")}`);
                }
            } else {
                toast.success(response.data.message);
            }

            // Clear email selection after delete
            setSelectedEmails([]);
            setSelectAllEmails(false);

            getData(currentPage);
            closeDeleteModal();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "An error occurred. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCopyToClipboard = (url) => {
        navigator.clipboard.writeText(url)
            .then(() => {
                toast.success("Device Id copied to clipboard!");
            })
            .catch(() => {
                alert("No id to copy!");
            });
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

    return (
        <div>
            {/* <PageBreadcrumb pageTitle="Testing Device" /> */}
            <div className="space-y-6 sticky left-0">
                <div
                    className={`rounded-2xl overflow-auto border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]`}
                    style={{ minHeight: "600px" }}
                >
                    {/* Card Header */}
                    <div className="px-6 pt-5">
                        <div className="flex justify-between items-center px-4 py-3 mt-4 dark:border-gray-800 border-gray-200">
                            {/* Left side - Delete and Clear buttons */}
                            <div className="flex gap-4 items-center">
                                {/* Filter Dropdown */}
                                <div className="relative inline-block w-64">
                                    <button
                                        className="w-full flex items-center justify-between px-4 py-2 bg-white dark:border-gray-800 border rounded-md text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
                                        onClick={() => setIsDeviceTypeOpen(!isDeviceTypeOpen)}
                                    >
                                        <div className="flex items-center">
                                            <span>{!deviceTypeFilter ? 'All Device Types' : deviceTypes.find(t => t.id === deviceTypeFilter)?.label}</span>
                                        </div>
                                        <FontAwesomeIcon icon={faChevronDown} />
                                    </button>
                                    {isDeviceTypeOpen && (
                                        <div className="absolute w-full mt-2 bg-white shadow-lg rounded-lg border dark:bg-gray-800 z-50 px-1">
                                            <button
                                                onClick={() => {
                                                    setDeviceTypeFilter('');
                                                    setIsDeviceTypeOpen(false);
                                                    setCurrentPage(1);
                                                }}
                                                className={`flex items-center w-full px-4 py-2 my-1 text-left text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10 rounded-md ${deviceTypeFilter === "" ? "bg-gray-100 dark:bg-white/10" : ""}`}
                                            >
                                                All Device Types
                                            </button>
                                            {deviceTypes.map((type) => (
                                                <button
                                                    key={type.id}
                                                    onClick={() => {
                                                        setDeviceTypeFilter(type.id);
                                                        setIsDeviceTypeOpen(false);
                                                        setCurrentPage(1);
                                                    }}
                                                    className={`flex items-center w-full px-4 py-2 my-1 text-left text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10 rounded-md ${deviceTypeFilter === type.id ? "bg-gray-100 dark:bg-white/10" : ""}`}
                                                >
                                                    {type.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {selectedItems.length > 0 && (
                                    <>
                                        <Button
                                            onClick={() => openDeleteModal(null, true)}
                                            disabled={isDeleting}
                                            variant="danger"
                                            className="d-flex align-items-center gap-2 py-1"
                                            style={{ fontSize: "14px", color: "#f13838", border: "none" }}
                                        >
                                            {isDeleting ? (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <>
                                                    <FontAwesomeIcon icon={faTrash} className="pe-3" />
                                                    <span>DELETE SELECTED DEVICES ({selectedItems.length})</span>
                                                </>
                                            )}
                                        </Button>

                                        {/* <Button
                                            onClick={clearAllFilters}
                                            variant="outline-secondary"
                                            className="d-flex align-items-center gap-2 py-1 border-0 bg-transparent"
                                            style={{ fontSize: "14px", color: "#f13838" }}
                                        >
                                            CLEAR DEVICE SELECTION
                                        </Button> */}
                                    </>
                                )}

                                {/* NEW: Email bulk delete buttons */}
                                {selectedEmails.length > 0 && (
                                    <>
                                        <Button
                                            onClick={() => openDeleteModal(null, false, true)}
                                            disabled={isDeleting}
                                            variant="danger"
                                            className="d-flex align-items-center gap-2 py-1"
                                            style={{ fontSize: "14px", color: "#f13838", border: "none" }}
                                        >
                                            {isDeleting ? (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <>
                                                    <FontAwesomeIcon icon={faTrash} className="pe-3" />
                                                    <span>DELETE SELECTED EMAILS DATA ({selectedEmails.length})</span>
                                                </>
                                            )}
                                        </Button>

                                        {/* <Button
                                            onClick={clearEmailSelection}
                                            variant="outline-secondary"
                                            className="d-flex align-items-center gap-2 py-1 border-0 bg-transparent"
                                            style={{ fontSize: "14px", color: "#f13838" }}
                                        >
                                            CLEAR EMAIL SELECTION
                                        </Button> */}
                                    </>
                                )}
                            </div>

                            {/* Right side - Add button */}
                            <Button
                                onClick={() => toggleModal('add')}
                                className="rounded-md border-0 shadow-md px-4 py-2 text-white"
                                style={{ background: "#FA4B56" }}
                            >
                                <FontAwesomeIcon icon={faPlus} className='pe-2' /> Add Testing Device
                            </Button>
                        </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 border-gray-100 dark:border-gray-800 sm:p-6 overflow-auto">
                        <div className="space-y-6 rounded-lg xl:border dark:border-gray-800">
                            <Table>
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <TableRow>
                                        {/* NEW: Select All Checkbox */}
                                        <TableCell isHeader className="py-4 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700 w-10">
                                            <div className="flex items-center justify-center">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                                                    checked={selectAll}
                                                    onChange={handleSelectAll}
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell isHeader className="py-4 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Index</TableCell>
                                        <TableCell isHeader className="py-4 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Device Person Name</TableCell>
                                        <TableCell isHeader className="py-4 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Device Name</TableCell>
                                        <TableCell isHeader className="py-4 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Device Type</TableCell>
                                        <TableCell isHeader className="py-4 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Device Id</TableCell>
                                        <TableCell isHeader className="py-4 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center justify-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                                                    checked={selectAllEmails}
                                                    onChange={handleSelectAllEmails}
                                                />
                                                <span>Email IDs</span>
                                            </div>
                                            <div className="w-full text-center mt-1">
                                                <span className="text-[13px] text-red-500 dark:text-gray-400 italic">
                                                    (💡 Click checkbox to select, click email to delete single)
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell isHeader className="py-7 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Action</TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-center">
                                    {currentItems.length > 0 ? (
                                        currentItems.map((premium, index) => {
                                            return (
                                                <TableRow key={premium._id}>
                                                    {/* NEW: Individual Checkbox */}
                                                    <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700">
                                                        <div className="flex items-center justify-center">
                                                            <input
                                                                type="checkbox"
                                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                                                                checked={selectedItems.includes(premium._id)}
                                                                onChange={() => handleSelectItem(premium._id)}
                                                            />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">
                                                        {indexOfFirstItem + index + 1}
                                                    </TableCell>
                                                    <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">{premium.devicePerson}</TableCell>
                                                    <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">{premium.deviceName}</TableCell>
                                                    <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400 border">
                                                        <span className={`px-2 py-1 rounded-full text-xs ${premium.deviceType === 'android' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
                                                            {premium.deviceType === 'android' ? 'Android' : 'iOS'}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="py-3 px-2 0 border-gray-200 dark:border-gray-700 dark:text-gray-400 ">
                                                        <div className="flex items-center justify-center gap-4">
                                                            <p>{premium.deviceId}</p>
                                                            <button
                                                                className="text-gray-600 hover:text-gray-800"
                                                                onClick={() => handleCopyToClipboard(premium.deviceId)}
                                                            >
                                                                <FontAwesomeIcon icon={faCopy} />
                                                            </button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-3 px-2 border-r border-l border-gray-200 dark:border-gray-700 dark:text-gray-400 ">
                                                        <div className="flex flex-wrap gap-2 justify-center items-center ">
                                                            {premium.emailIds && premium.emailIds.length > 0 ? (
                                                                <>
                                                                    {premium.emailIds.map((email, idx) => (
                                                                        <div
                                                                            key={idx}
                                                                            className="group relative inline-flex items-center gap-1.5 text-xs bg-blue-100 dark:bg-blue-100 px-3 py-1.5 rounded-md border border-transparent hover:border-red-300 dark:hover:border-red-700"
                                                                        >
                                                                            {/* NEW: Checkbox for email selection */}
                                                                            <input
                                                                                type="checkbox"
                                                                                className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                                                                checked={selectedEmails.includes(email)}
                                                                                onChange={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleSelectEmail(email);
                                                                                }}
                                                                                onClick={(e) => e.stopPropagation()}
                                                                            />

                                                                            <span
                                                                                onClick={() => openDeleteModal(null, false, true, email)}
                                                                                className="cursor-pointer hover:text-red-600 dark:hover:text-red-400 dark:text-black transition-colors"
                                                                                title="Click to delete data for this email"
                                                                            >
                                                                                {email}
                                                                            </span>

                                                                            <FontAwesomeIcon
                                                                                icon={faTrash}
                                                                                className="text-xs opacity-0 group-hover:opacity-100 text-red-600 dark:text-red-400 transition-opacity duration-200 cursor-pointer"
                                                                                onClick={() => openDeleteModal(null, false, true, email)}
                                                                            />
                                                                        </div>
                                                                    ))}
                                                                </>
                                                            ) : (
                                                                <span className="text-gray-400">No emails</span>
                                                            )}
                                                        </div>
                                                    </TableCell>

                                                    <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">
                                                        <div className="flex align-middle justify-center gap-4">
                                                            <button style={{ color: "#0385C3" }} onClick={() => handleEdit(premium)}>
                                                                <FontAwesomeIcon icon={faEdit}
                                                                    className="text-lg" />
                                                            </button>
                                                            <button
                                                                className={`text-red-600`}
                                                                onClick={() => openDeleteModal(premium._id)}
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
                                            <td colSpan={7} className="text-center pt-5 pb-4 dark:text-gray-400">No Data Found</td>
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
                totalPages={pagination ? pagination.totalPages : Math.ceil(filteredData.length / itemsPerPage)}
                onPageChange={(page) => {
                    setCurrentPage(page);
                    setSelectedItems([]);
                    setSelectAll(false);
                    getData(page);
                }}
                itemsPerPage={itemsPerPage}
                totalItems={pagination ? pagination.total : filteredData.length}
            />

            {/* Add/Edit Modal */}
            {visible && (
                <div className="fixed inset-0 z-99999 flex items-center justify-center">
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50"
                        onClick={() => !isSubmitting && toggleModal('add')}
                    ></div>

                    <div className="relative bg-white rounded-lg w-full max-w-lg mx-4 dark:bg-gray-800 dark:text-gray-300 max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b dark:border-gray-700">
                            <h3 className="text-xl font-semibold">
                                {id ? "Edit Device" : "Add Device"}
                            </h3>
                        </div>

                        <div className="px-6 py-4">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block font-medium mb-2">
                                        Device Name
                                        <span className="text-red-500 pl-2 font-normal text-lg">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={devicePerson}
                                        onChange={(e) => {
                                            setdevicePerson(e.target.value);
                                            if (errors.devicePerson) {
                                                setErrors(prev => {
                                                    const newErrors = { ...prev };
                                                    delete newErrors.devicePerson;
                                                    return newErrors;
                                                });
                                            }
                                        }}
                                        placeholder="Enter device Name"
                                        disabled={isSubmitting}
                                        className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 ${errors.devicePerson ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors.devicePerson && (
                                        <p className="text-red-500 text-sm mt-1">{errors.devicePerson}</p>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label className="block font-medium mb-2">
                                        Device Name
                                        <span className="text-red-500 pl-2 font-normal text-lg">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={deviceName}
                                        onChange={(e) => {
                                            setdeviceName(e.target.value);
                                            if (errors.deviceName) {
                                                setErrors(prev => {
                                                    const newErrors = { ...prev };
                                                    delete newErrors.deviceName;
                                                    return newErrors;
                                                });
                                            }
                                        }}
                                        placeholder="Enter device Name"
                                        disabled={isSubmitting}
                                        className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 ${errors.deviceName ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors.deviceName && (
                                        <p className="text-red-500 text-sm mt-1">{errors.deviceName}</p>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label className="block font-medium mb-2">
                                        Device Type
                                        <span className="text-red-500 pl-2 font-normal text-lg">*</span>
                                    </label>
                                    <select
                                        value={deviceType}
                                        onChange={(e) => {
                                            setDeviceType(e.target.value);
                                            if (errors.deviceType) {
                                                setErrors(prev => {
                                                    const newErrors = { ...prev };
                                                    delete newErrors.deviceType;
                                                    return newErrors;
                                                });
                                            }
                                        }}
                                        disabled={isSubmitting}
                                        className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 ${errors.deviceType ? 'border-red-500' : 'border-gray-300'}`}
                                    >
                                        <option value="">Select Device Type</option>
                                        <option value="android">Android</option>
                                        <option value="ios">iOS</option>
                                    </select>
                                    {errors.deviceType && (
                                        <p className="text-red-500 text-sm mt-1">{errors.deviceType}</p>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label className="block font-medium mb-2">
                                        Device ID
                                        <span className="text-red-500 pl-2 font-normal text-lg">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={deviceId}
                                        onChange={(e) => {
                                            setdeviceId(e.target.value);
                                            if (errors.deviceId) {
                                                setErrors(prev => {
                                                    const newErrors = { ...prev };
                                                    delete newErrors.deviceId;
                                                    return newErrors;
                                                });
                                            }
                                        }}
                                        placeholder="Enter Device ID"
                                        disabled={isSubmitting}
                                        className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 ${errors.deviceId ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors.deviceId && (
                                        <p className="text-red-500 text-sm mt-1">{errors.deviceId}</p>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label className="block font-medium mb-2">
                                        Email IDs
                                        <span className="text-red-500 pl-2 font-normal text-lg">*</span>
                                    </label>

                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="email"
                                            value={currentEmail}
                                            onChange={(e) => {
                                                setCurrentEmail(e.target.value);
                                                if (errors.currentEmail) {
                                                    setErrors(prev => {
                                                        const newErrors = { ...prev };
                                                        delete newErrors.currentEmail;
                                                        return newErrors;
                                                    });
                                                }
                                            }}
                                            onKeyPress={handleEmailKeyPress}
                                            placeholder="Enter email and press Enter or click Add"
                                            disabled={isSubmitting}
                                            className={`flex-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 ${errors.currentEmail ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddEmail}
                                            disabled={isSubmitting}
                                            className="px-4 py-2 text-white rounded-md transition-colors duration-200 disabled:opacity-50"
                                            style={{ backgroundColor: "#FA4B56" }}
                                        >
                                            Add
                                        </button>
                                    </div>

                                    {errors.currentEmail && (
                                        <p className="text-red-500 text-sm mb-2">{errors.currentEmail}</p>
                                    )}

                                    {emailIds.length > 0 && (
                                        <div className="flex flex-wrap gap-2 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                                            {emailIds.map((email, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                                                >
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

                                    {errors.emailIds && (
                                        <p className="text-red-500 text-sm mt-1">{errors.emailIds}</p>
                                    )}
                                </div>

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

            {/* NEW: Delete Confirmation Modal */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999]">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4 shadow-lg dark:bg-gray-800">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                            {deleteModal.isEmailDelete
                                ? 'Delete Email Data'
                                : deleteModal.isBulk
                                    ? 'Delete Selected Devices'
                                    : 'Delete Device'
                            }
                        </h2>

                        <p className="text-gray-700 dark:text-gray-300 mb-6">
                            {deleteModal.isEmailDelete
                                ? Array.isArray(deleteModal.emailToDelete)
                                    ? `Are you sure you want to delete all data for ${deleteModal.emailToDelete.length} selected email(s)?`
                                    : `Are you sure you want to delete all data for email "${deleteModal.emailToDelete}"?`
                                : deleteModal.isBulk
                                    ? `Are you sure you want to delete ${selectedItems.length} selected device(s)?`
                                    : 'Are you sure you want to delete this device?'
                            }
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
                                onClick={
                                    deleteModal.isEmailDelete
                                        ? handleDeleteData
                                        : deleteModal.isBulk
                                            ? handleDeleteSelected
                                            : handleDelete
                                }
                                disabled={isDeleting}
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-70"
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer position="top-center" className="!z-[99999]" />
        </div>
    );
};

export default TestingDevice;