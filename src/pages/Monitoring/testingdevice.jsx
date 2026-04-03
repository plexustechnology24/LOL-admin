import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "react-bootstrap";
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPlus, faTrash, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import CustomPagination from "../../components/common/pagination";
import { faCopy } from "@fortawesome/free-regular-svg-icons";

// Props from Device.jsx:
//   openDeleteModal, closeDeleteModal, isDeleting   — delete modal (unchanged)
//   formModalProps: { openAddModal, openEditModal, registerSubmitCallback }
//   isSubmitting                                    — form submit lock from parent
const TestingDevice = ({
    openDeleteModal,
    closeDeleteModal,
    isDeleting,
    formModalProps,
    isSubmitting,
}) => {
    const { openAddModal, openEditModal, registerSubmitCallback } = formModalProps;

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filteredData, setFilteredData] = useState([]);

    const [selectedEmails, setSelectedEmails] = useState([]);
    const [selectAllEmails, setSelectAllEmails] = useState(false);
    const [pagination, setPagination] = useState([]);

    // Multiple row selection
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    const [isDeviceTypeOpen, setIsDeviceTypeOpen] = useState(false);
    const [deviceTypeFilter, setDeviceTypeFilter] = useState('');

    const deviceTypes = [
        { id: 'android', label: 'Android' },
        { id: 'ios', label: 'iOS' }
    ];

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(15);

    // ── API ──────────────────────────────────────────────────────────────────
    const getData = async (page = currentPage) => {
        try {
            setLoading(true);
            const response = await axios.post('https://api.lolcards.link/api/device/read', {
                page,
                limit: itemsPerPage,
                deviceType: deviceTypeFilter || undefined
            });
            setData(response.data.data);
            setPagination(response.data.pagination);
            setFilteredData(response.data.data);
            setCurrentPage(response.data.pagination.currentPage);
            setSelectedItems([]);
            setSelectAll(false);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { getData(currentPage); }, [itemsPerPage]);
    useEffect(() => { getData(1); }, [deviceTypeFilter]);

    // ── Register submit callback with parent once on mount ───────────────────
    // The parent calls this function with the form payload; we do the API call
    // and refresh, then throw on error so the parent can catch it.
    useEffect(() => {
        registerSubmitCallback(async ({ editId, deviceName, devicePerson, deviceId, deviceType, emailIds, webDeviceIds }) => {
            const endpoint = editId
                ? `https://api.lolcards.link/api/device/update/${editId}`
                : 'https://api.lolcards.link/api/device/create';
            const method = editId ? 'patch' : 'post';

            try {
                const response = await axios[method](endpoint, {
                    deviceName,
                    devicePerson,
                    deviceId,
                    deviceType,
                    emailIds,
                    webDeviceIds,
                });
                toast.success(response.data.message);
                getData(currentPage);
            } catch (err) {
                console.error(err);
                toast.error("An error occurred. Please try again.");
                throw err; // re-throw so parent knows submit failed
            }
        });
    }, [currentPage]); // re-register when page changes so getData uses latest page

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.relative')) setIsDeviceTypeOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData;

    // ── Row selection ────────────────────────────────────────────────────────
    const handleSelectAll = () => {
        if (!selectAll) {
            setSelectedItems(currentItems.map(item => item._id));
        } else {
            setSelectedItems([]);
        }
        setSelectAll(!selectAll);
    };

    const handleSelectItem = (id) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter(itemId => itemId !== id));
            if (selectAll) setSelectAll(false);
        } else {
            const next = [...selectedItems, id];
            setSelectedItems(next);
            setSelectAll(currentItems.every(item => next.includes(item._id)));
        }
    };

    useEffect(() => {
        if (currentItems.length > 0 && selectedItems.length > 0) {
            setSelectAll(currentItems.every(item => selectedItems.includes(item._id)));
        } else {
            setSelectAll(false);
        }
    }, [currentItems, selectedItems]);

    // ── Email helpers ────────────────────────────────────────────────────────
    const handleSelectAllEmails = () => {
        if (!selectAllEmails) {
            const allEmails = currentItems.flatMap(item => item.emailIds || []);
            setSelectedEmails(allEmails);
        } else {
            setSelectedEmails([]);
        }
        setSelectAllEmails(!selectAllEmails);
    };

    const handleSelectEmail = (email) => {
        if (selectedEmails.includes(email)) {
            setSelectedEmails(selectedEmails.filter(e => e !== email));
            if (selectAllEmails) setSelectAllEmails(false);
        } else {
            setSelectedEmails([...selectedEmails, email]);
        }
    };

    // ── Delete actions ───────────────────────────────────────────────────────
    const handleDelete = async (deleteId) => {
        const response = await axios.delete(`https://api.lolcards.link/api/device/delete/${deleteId}`);
        toast.success(response.data.message);
        const goToPage = currentItems.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
        getData(goToPage);
    };

    const handleDeleteSelected = async () => {
        await axios.post('https://api.lolcards.link/api/admin/deleteMultiple', {
            ids: selectedItems,
            TypeId: "4"
        });
        toast.success(`Successfully deleted ${selectedItems.length} device(s).`);
        getData(currentPage);
    };

    const handleDeleteData = async (emailsToDelete) => {
        const arr = Array.isArray(emailsToDelete) ? emailsToDelete : [emailsToDelete];
        const response = await axios.delete("https://api.lolcards.link/api/device/deletedata", {
            data: { id: arr }
        });
        if (response.data.details) {
            const { successful, notFound, failed } = response.data.details;
            if (successful.length > 0) toast.success(response.data.message);
            if (notFound.length > 0) toast.error(`No data found for: ${notFound.join(", ")}`);
            if (failed.length > 0) toast.error(`Failed to delete: ${failed.map(f => f.email).join(", ")}`);
        } else {
            toast.success(response.data.message);
        }
        setSelectedEmails([]);
        setSelectAllEmails(false);
        getData(currentPage);
    };

    const confirmDeleteDevice = (id) => {
        openDeleteModal({
            title: 'Delete Device',
            message: 'Are you sure you want to delete this device?',
            onConfirm: () => handleDelete(id),
        });
    };

    const confirmDeleteSelected = () => {
        if (selectedItems.length === 0) { toast.info("No items selected for deletion."); return; }
        openDeleteModal({
            title: 'Delete Selected Devices',
            message: `Are you sure you want to delete ${selectedItems.length} selected device(s)?`,
            onConfirm: handleDeleteSelected,
        });
    };

    const confirmDeleteEmail = (emailOrEmails) => {
        const isMultiple = Array.isArray(emailOrEmails);
        if (isMultiple && emailOrEmails.length === 0) { toast.info("No emails selected for deletion."); return; }
        openDeleteModal({
            title: 'Delete Email Data',
            message: isMultiple
                ? `Are you sure you want to delete all data for ${emailOrEmails.length} selected email(s)?`
                : `Are you sure you want to delete all data for email "${emailOrEmails}"?`,
            onConfirm: () => handleDeleteData(emailOrEmails),
        });
    };

    const handleCopyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
            .then(() => toast.success("Device Id copied to clipboard!"))
            .catch(() => alert("No id to copy!"));
    };

    // ── Loading state ────────────────────────────────────────────────────────
    if (loading) return (
        <div style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="border p-4 flex items-center space-x-2 rounded-md">
                <div
                    className="w-10 h-10 border-2 border-gray-300 rounded-full animate-spin dark:border-gray-800"
                    style={{ borderTop: "2px solid #FA4B56" }}
                />
            </div>
        </div>
    );

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div>
            <div className="space-y-6 sticky left-0">
                <div
                    className="rounded-2xl overflow-auto border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"
                    style={{ minHeight: "600px" }}
                >
                    {/* Header / toolbar */}
                    <div className="px-6 pt-5">
                        <div className="flex justify-between items-center px-4 py-3 mt-4 dark:border-gray-800 border-gray-200">
                            {/* Left side */}
                            <div className="flex gap-4 items-center">
                                {/* Device Type filter */}
                                <div className="relative inline-block w-64">
                                    <button
                                        className="w-full flex items-center justify-between px-4 py-2 bg-white dark:border-gray-800 border rounded-md text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
                                        onClick={() => setIsDeviceTypeOpen(!isDeviceTypeOpen)}
                                    >
                                        <span>
                                            {!deviceTypeFilter ? 'All Device Types' : deviceTypes.find(t => t.id === deviceTypeFilter)?.label}
                                        </span>
                                        <FontAwesomeIcon icon={faChevronDown} />
                                    </button>
                                    {isDeviceTypeOpen && (
                                        <div className="absolute w-full mt-2 bg-white shadow-lg rounded-lg border dark:bg-gray-800 z-50 px-1">
                                            <button
                                                onClick={() => { setDeviceTypeFilter(''); setIsDeviceTypeOpen(false); setCurrentPage(1); }}
                                                className={`flex items-center w-full px-4 py-2 my-1 text-left text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10 rounded-md ${deviceTypeFilter === "" ? "bg-gray-100 dark:bg-white/10" : ""}`}
                                            >
                                                All Device Types
                                            </button>
                                            {deviceTypes.map(type => (
                                                <button
                                                    key={type.id}
                                                    onClick={() => { setDeviceTypeFilter(type.id); setIsDeviceTypeOpen(false); setCurrentPage(1); }}
                                                    className={`flex items-center w-full px-4 py-2 my-1 text-left text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10 rounded-md ${deviceTypeFilter === type.id ? "bg-gray-100 dark:bg-white/10" : ""}`}
                                                >
                                                    {type.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Bulk device delete */}
                                {selectedItems.length > 0 && (
                                    <Button
                                        onClick={confirmDeleteSelected}
                                        disabled={isDeleting}
                                        variant="danger"
                                        className="d-flex align-items-center gap-2 py-1"
                                        style={{ fontSize: "14px", color: "#f13838", border: "none" }}
                                    >
                                        <FontAwesomeIcon icon={faTrash} className="pe-3" />
                                        <span>DELETE SELECTED DEVICES ({selectedItems.length})</span>
                                    </Button>
                                )}

                                {/* Bulk email delete */}
                                {selectedEmails.length > 0 && (
                                    <Button
                                        onClick={() => confirmDeleteEmail(selectedEmails)}
                                        disabled={isDeleting}
                                        variant="danger"
                                        className="d-flex align-items-center gap-2 py-1"
                                        style={{ fontSize: "14px", color: "#f13838", border: "none" }}
                                    >
                                        <FontAwesomeIcon icon={faTrash} className="pe-3" />
                                        <span>DELETE SELECTED EMAILS DATA ({selectedEmails.length})</span>
                                    </Button>
                                )}
                            </div>

                            {/* Right side — Add button → opens parent modal */}
                            <Button
                                onClick={openAddModal}
                                className="rounded-md border-0 shadow-md px-4 py-2 text-white"
                                style={{ background: "#FA4B56" }}
                            >
                                <FontAwesomeIcon icon={faPlus} className="pe-2" /> Add Testing Device
                            </Button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="p-4 border-gray-100 dark:border-gray-800 sm:p-6 overflow-auto">
                        <div className="space-y-6 rounded-lg xl:border dark:border-gray-800">
                            <Table>
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <TableRow>
                                        <TableCell isHeader className="py-4 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700 w-10">
                                            <div className="flex items-center justify-center">
                                                <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700" checked={selectAll} onChange={handleSelectAll} />
                                            </div>
                                        </TableCell>
                                        <TableCell isHeader className="py-4 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Index</TableCell>
                                        <TableCell isHeader className="py-4 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Device Person Name</TableCell>
                                        <TableCell isHeader className="py-4 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Device Name</TableCell>
                                        <TableCell isHeader className="py-4 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Device Type</TableCell>
                                        <TableCell isHeader className="py-4 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Device Id</TableCell>
                                        <TableCell isHeader className="py-4 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center justify-center gap-2">
                                                <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700" checked={selectAllEmails} onChange={handleSelectAllEmails} />
                                                <span>Email IDs</span>
                                            </div>
                                            <div className="w-full text-center mt-1">
                                                <span className="text-[13px] text-red-500 dark:text-gray-400 italic">
                                                    (💡 Click checkbox to select, click email to delete single)
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell isHeader className="py-4 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Web Device IDs</TableCell>
                                        <TableCell isHeader className="py-7 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Action</TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-center">
                                    {currentItems.length > 0 ? (
                                        currentItems.map((item, index) => (
                                            <TableRow key={item._id}>
                                                <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700">
                                                    <div className="flex items-center justify-center">
                                                        <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700" checked={selectedItems.includes(item._id)} onChange={() => handleSelectItem(item._id)} />
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">
                                                    {indexOfFirstItem + index + 1}
                                                </TableCell>
                                                <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">{item.devicePerson}</TableCell>
                                                <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">{item.deviceName}</TableCell>
                                                <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${item.deviceType === 'android' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
                                                        {item.deviceType === 'android' ? 'Android' : 'iOS'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">
                                                    <div className="flex items-center justify-center gap-4">
                                                        <p>{item.deviceId}</p>
                                                        <button className="text-gray-600 hover:text-gray-800" onClick={() => handleCopyToClipboard(item.deviceId)}>
                                                            <FontAwesomeIcon icon={faCopy} />
                                                        </button>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-3 px-2 border-r border-l border-gray-200 dark:border-gray-700 dark:text-gray-400">
                                                    <div className="flex flex-wrap gap-2 justify-center items-center">
                                                        {item.emailIds && item.emailIds.length > 0 ? (
                                                            item.emailIds.map((email, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className="group relative inline-flex items-center gap-1.5 text-xs bg-blue-100 dark:bg-blue-100 px-3 py-1.5 rounded-md border border-transparent hover:border-red-300 dark:hover:border-red-700"
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                                                        checked={selectedEmails.includes(email)}
                                                                        onChange={(e) => { e.stopPropagation(); handleSelectEmail(email); }}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    />
                                                                    <span
                                                                        onClick={() => confirmDeleteEmail(email)}
                                                                        className="cursor-pointer hover:text-red-600 dark:hover:text-red-400 dark:text-black transition-colors"
                                                                        title="Click to delete data for this email"
                                                                    >
                                                                        {email}
                                                                    </span>
                                                                    <FontAwesomeIcon
                                                                        icon={faTrash}
                                                                        className="text-xs opacity-0 group-hover:opacity-100 text-red-600 dark:text-red-400 transition-opacity duration-200 cursor-pointer"
                                                                        onClick={() => confirmDeleteEmail(email)}
                                                                    />
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <span className="text-gray-400">No emails</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">
                                                    <div className="flex flex-wrap gap-2 justify-center items-center w-[230px]">
                                                        {item.webDeviceIds && item.webDeviceIds.length > 0 ? (
                                                            item.webDeviceIds.map((wid, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className="inline-flex items-center gap-1.5 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1.5 rounded-md"
                                                                >
                                                                    <span>{wid}</span>
                                                                    <button
                                                                        className="text-purple-400 hover:text-purple-800"
                                                                        onClick={() => handleCopyToClipboard(wid)}
                                                                        title="Copy"
                                                                    >
                                                                        <FontAwesomeIcon icon={faCopy} className="text-xs" />
                                                                    </button>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <span className="text-gray-400">—</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">
                                                    <div className="flex align-middle justify-center gap-4">
                                                        {/* Edit → opens parent modal pre-filled */}
                                                        <button style={{ color: "#0385C3" }} onClick={() => openEditModal(item)}>
                                                            <FontAwesomeIcon icon={faEdit} className="text-lg" />
                                                        </button>
                                                        <button className="text-red-600" onClick={() => confirmDeleteDevice(item._id)}>
                                                            <FontAwesomeIcon icon={faTrash} className="text-lg" />
                                                        </button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={9} className="text-center pt-5 pb-4 dark:text-gray-400">No Data Found</td>
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
        </div>
    );
};

export default TestingDevice;