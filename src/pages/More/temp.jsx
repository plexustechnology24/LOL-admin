import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { faTrash, faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CustomPagination from "../../components/common/pagination";
import { faCopy } from "@fortawesome/free-regular-svg-icons";
import { Button } from "react-bootstrap";

const Temp = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchEmail, setSearchEmail] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Bulk delete states
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, isBulk: false });
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    console.log(data);

    const getData = useCallback((page = 1) => {
        setLoading(true);

        axios.get('https://api.lolcards.link/api/temp/read')
            .then((res) => {
                // Reverse the data to show newest first
                const reversedData = res.data.data ? [...res.data.data].reverse() : [];
                setData(reversedData);
                setLoading(false);
                // Reset selection when data is refreshed
                setSelectedItems([]);
                setSelectAll(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
                toast.error("Failed to fetch data");
            });
    }, []);

    useEffect(() => {
        getData(currentPage);
    }, [currentPage]);

    function formatDate(timestamp) {
        const date = new Date(Number(timestamp));

        const yyyy = date.getUTCFullYear();
        const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(date.getUTCDate()).padStart(2, '0');

        const hh = String(date.getUTCHours()).padStart(2, '0');
        const min = String(date.getUTCMinutes()).padStart(2, '0');
        const ss = String(date.getUTCSeconds()).padStart(2, '0');

        return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss} +0000`;
    }

    // Modal handlers
    const openDeleteModal = (id = null, isBulk = false) => {
        if (isBulk && selectedItems.length === 0) {
            toast.info("No items selected for deletion.");
            return;
        }
        setDeleteModal({ isOpen: true, id, isBulk });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ isOpen: false, id: null, isBulk: false });
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await axios.delete(
                `https://api.lolcards.link/api/temp/delete/${deleteModal.id}`,
                { data: { type: "push" } }
            );
            toast.success(response.data.message);
            getData(currentPage);
            closeDeleteModal();
        } catch (err) {
            console.error(err);
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    // Bulk delete handler
    const handleDeleteSelected = () => {
        setIsDeleting(true);

        const payload = {
            ids: selectedItems,
            TypeId: "9" // TypeId for temp component
        };

        axios.post('https://api.lolcards.link/api/admin/deleteMultiple', payload)
            .then(() => {
                toast.success(`Successfully deleted ${selectedItems.length} items.`);
                getData();
            })
            .catch((err) => {
                console.error(err);
                toast.error("Failed to delete selected items. Please try again.");
            })
            .finally(() => {
                setIsDeleting(false);
                closeDeleteModal();
            });
    };

    // Selection handlers
    const handleSelectAll = () => {
        if (!selectAll) {
            const allIds = paginatedData.map(item => item._id);
            setSelectedItems(allIds);
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
            setSelectedItems([...selectedItems, id]);
            const allSelected = paginatedData.every(item =>
                selectedItems.includes(item._id) || item._id === id
            );
            setSelectAll(allSelected);
        }
    };

    const clearAllFilters = () => {
        setSearchEmail("");
        setSelectedItems([]);
        setSelectAll(false);
        setCurrentPage(1);
        toast.info("All filters cleared");
    };

    // Helper function to check if app data exists
    const hasAppData = (item) => {
        return item.transactionId || item.ogTransactionId || item.purchaseDate || item.exDate || item.status;
    };

    // Helper function to check if backend data exists
    const hasBackendData = (item) => {
        return item.btransactionId || item.bogTransactionId || item.bpurchaseDate || item.bexDate || item.bstatus;
    };

    // Filter data based on email search
    const filteredData = data.filter(item => {
        if (!searchEmail) return true;
        return item.EmailId && item.EmailId.toLowerCase().includes(searchEmail.toLowerCase());
    });

    const handleCopyToClipboard = (email) => {
        if (email) {
            navigator.clipboard.writeText(email)
                .then(() => {
                    toast.success("Email Id copied to clipboard!");
                })
                .catch((error) => {
                    console.error("Failed to copy: ", error);
                });
        } else {
            toast.error("No Content to copy!");
        }
    };

    // Calculate pagination for filtered data
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchEmail]);

    // Update selectAll based on current items
    useEffect(() => {
        if (paginatedData.length > 0 && selectedItems.length > 0) {
            const allCurrentItemsSelected = paginatedData.every(item =>
                selectedItems.includes(item._id)
            );
            setSelectAll(allCurrentItemsSelected);
        } else {
            setSelectAll(false);
        }
    }, [paginatedData, selectedItems]);

    if (loading) return (
        <div style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="border p-4 flex items-center space-x-2 rounded-md">
                <div className="w-10 h-10 border-2 border-gray-300 rounded-full animate-spin" style={{ borderTop: "2px solid #FA4B56" }}></div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <PageBreadcrumb pageTitle="Temporary Data" />

            <div className="max-w-7xl mx-auto">
                {/* Search Bar and Bulk Actions */}
                <div className="p-4 mb-4">
                    <div className="flex items-center justify-between gap-3 mb-4">
                        {/* Left side - Bulk Actions */}
                        <div className="flex gap-4">
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
                                                <span>DELETE SELECTED ({selectedItems.length})</span>
                                            </>
                                        )}
                                    </Button>

                                    <Button
                                        onClick={clearAllFilters}
                                        variant="outline-secondary"
                                        className="d-flex align-items-center gap-2 py-1 border-0 bg-transparent"
                                        style={{ fontSize: "14px", color: "#f13838" }}
                                    >
                                        CLEAR ALL
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="relative flex-1 max-w-md mt-5 pt-3">
                            <FontAwesomeIcon
                                icon={faSearch}
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="text"
                                placeholder="Search by Email ID..."
                                value={searchEmail}
                                onChange={(e) => setSearchEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            {searchEmail && (
                                <button
                                    onClick={() => setSearchEmail("")}
                                >
                                    <FontAwesomeIcon icon={faTimes} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-600" />
                                </button>
                            )}
                        </div>

                        {/* Pagination */}
                        {filteredData.length > 0 && (
                            <div className=" px-4 py-3">
                                <CustomPagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={(page) => {
                                        setCurrentPage(page);
                                        setSelectedItems([]);
                                        setSelectAll(false);
                                    }}
                                    itemsPerPage={itemsPerPage}
                                    totalItems={filteredData.length}
                                    unshow={true}
                                />

                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-4 text-left text-md font-medium text-gray-800 border-r border-gray-200 w-10">
                                        <div className="flex items-center justify-center">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                checked={selectAll}
                                                onChange={handleSelectAll}
                                            />
                                        </div>
                                    </th>
                                    <th className="px-4 py-4 text-left text-md font-medium text-gray-800 border-r border-gray-200">Index</th>
                                    <th className="px-4 py-4 text-left text-md font-medium text-gray-800 border-r border-gray-200 w-[200px]">Email ID</th>
                                    <th className="px-4 py-4 text-left text-md font-medium text-gray-800 border-r border-gray-200">Case</th>
                                    <th className="px-4 py-4 text-left text-md font-medium text-gray-800 border-r border-gray-200">Type</th>
                                    <th className="px-4 py-4 text-left text-md font-medium text-gray-800 border-r border-gray-200">Transaction ID</th>
                                    <th className="px-4 py-4 text-left text-md font-medium text-gray-800 border-r border-gray-200">Original Transaction ID</th>
                                    <th className="px-4 py-4 text-left text-md font-medium text-gray-800 border-r border-gray-200">Purchase Date</th>
                                    <th className="px-4 py-4 text-left text-md font-medium text-gray-800 border-r border-gray-200">Expiry Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {paginatedData && paginatedData.length > 0 ? (
                                    paginatedData.map((item, index) => {
                                        const showAppRow = hasAppData(item);
                                        const showBackendRow = hasBackendData(item);
                                        const rowSpan = (showAppRow ? 1 : 0) + (showBackendRow ? 1 : 0);
                                        const globalIndex = startIndex + index + 1;

                                        return (
                                            <React.Fragment key={item._id || index}>
                                                {/* App Data Row - Only show if app data exists */}
                                                {showAppRow && (
                                                    <>
                                                        <tr className="hover:bg-gray-50">
                                                            <td
                                                                rowSpan={rowSpan}
                                                                className="px-4 py-3 border-r border-gray-200 align-middle"
                                                            >
                                                                <div className="flex items-center justify-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                                        checked={selectedItems.includes(item._id)}
                                                                        onChange={() => handleSelectItem(item._id)}
                                                                    />
                                                                </div>
                                                            </td>

                                                            <td
                                                                rowSpan={rowSpan}
                                                                className={`px-4 py-3 text-sm text-gray-900 border-r border-gray-200 align-middle`}
                                                            >
                                                                {globalIndex}
                                                            </td>

                                                            <td
                                                                rowSpan={rowSpan}
                                                                className="px-4 py-3 border-r border-gray-200 align-middle w-[300px]"
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm text-gray-900 break-all w-[100px]">
                                                                        {item.EmailId || "-"}
                                                                    </span>
                                                                    <button
                                                                        className="text-gray-600 hover:text-gray-800"
                                                                        onClick={() => handleCopyToClipboard(item.EmailId)}
                                                                    >
                                                                        <FontAwesomeIcon icon={faCopy} />
                                                                    </button>
                                                                </div>
                                                            </td>

                                                            <td
                                                                rowSpan={rowSpan}
                                                                className="px-4 py-3 border-r border-gray-200 align-middle w-[300px]"
                                                            >
                                                                <div className="flex items-center h-100 justify-center gap-2">
                                                                    <span className="text-sm text-gray-900 break-all">
                                                                        {item.case || "-"}
                                                                    </span>
                                                                </div>
                                                            </td>

                                                            <td className="px-4 py-3 text-sm font-medium text-blue-600 border-r border-gray-200">
                                                                App
                                                            </td>
                                                            <td className="px-4 py-3 border-r border-gray-200">
                                                                <div className="flex items-center gap-2 break-all w-[120px]">
                                                                    <span className="text-sm text-gray-900">{item.transactionId || "-"}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 border-r border-gray-200">
                                                                <div className="flex items-center gap-2 break-all w-[120px]">
                                                                    <span className="text-sm text-gray-900">{item.ogTransactionId || "-"}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 border-r border-gray-200">
                                                                <div className="flex items-center gap-2 w-[170px]">
                                                                    <span className="text-sm text-gray-900">
                                                                        {item.purchaseDate ? item.purchaseDate : "-"}
                                                                    </span>
                                                                </div>
                                                            </td>

                                                            <td className="px-4 py-3 border-r border-gray-200">
                                                                <div className="flex items-center gap-2 w-[170px]">
                                                                    <span className="text-sm text-gray-900">
                                                                        {item.exDate ? item.exDate : "-"}
                                                                    </span>
                                                                </div>
                                                            </td>

                                                        </tr>

                                                        <tr className="bg-gray-50 hover:bg-gray-100 transition">

                                                            <td className="px-4 py-3 border-r border-gray-200 text-center">

                                                            </td>
                                                            {/* Status */}
                                                            <td colSpan={3} className="px-4 py-3 border-r border-gray-200 text-center">

                                                                <div className="flex gap-4 items-center text-center justify-between leading-tight">
                                                                    <span className="text-md font-medium text-black-500">
                                                                        Status
                                                                    </span>
                                                                    <span
                                                                        className={`inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full capitalize
            ${item.status === "active"
                                                                                ? "bg-green-100 text-green-700"
                                                                                : "bg-gray-200 text-gray-700"
                                                                            }`}
                                                                    >
                                                                        {item.status || "-"}
                                                                    </span>
                                                                </div>
                                                            </td>

                                                            {/* Updated Date */}
                                                            <td colSpan={4} className="px-4 py-3 border-r border-gray-200">
                                                                <div className="flex gap-4 items-center text-center justify-between leading-tight">
                                                                    <span className="text-md font-medium text-black-500">
                                                                        Date & Time
                                                                    </span>
                                                                    <span className="text-sm text-gray-800">
                                                                        {item.updatedAt
                                                                            ? new Date(item.updatedAt).toLocaleString()
                                                                            : "-"}
                                                                    </span>
                                                                </div>
                                                            </td>

                                                            {/* Action */}
                                                            <td
                                                                rowSpan={rowSpan}
                                                                className="px-4 py-3 align-middle w-[300px]"
                                                            >
                                                                <div className="flex justify-center">
                                                                    <button
                                                                        onClick={() => openDeleteModal(item._id)}
                                                                        className="flex items-center justify-center w-9 h-9 rounded-full
                bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700
                transition"
                                                                        title="Delete"
                                                                    >
                                                                        <FontAwesomeIcon icon={faTrash} className="text-sm" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </>
                                                )}

                                                {/* Backend Data Row - Only show if backend data exists */}
                                                {showBackendRow && (
                                                    <>
                                                        <tr className="hover:bg-gray-50 bg-blue-50/30">
                                                            {/* Only show these cells if App row is not shown */}
                                                            {!showAppRow && (
                                                                <>
                                                                    <td
                                                                        rowSpan={rowSpan}
                                                                        className="px-4 py-3 border-r border-gray-200 align-middle"
                                                                    >
                                                                        <div className="flex items-center justify-center">
                                                                            <input
                                                                                type="checkbox"
                                                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                                                checked={selectedItems.includes(item._id)}
                                                                                onChange={() => handleSelectItem(item._id)}
                                                                            />
                                                                        </div>
                                                                    </td>

                                                                    <td
                                                                        rowSpan={rowSpan}
                                                                        className={`px-4 py-3 text-sm text-gray-900 border-r border-gray-200 align-middle`}
                                                                    >
                                                                        {globalIndex}
                                                                    </td>

                                                                    <td
                                                                        rowSpan={rowSpan}
                                                                        className="px-4 py-3 border-r border-gray-200 align-middle w-[300px]"
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-sm text-gray-900 break-all w-[100px]">
                                                                                {item.EmailId || "-"}
                                                                            </span>
                                                                            <button
                                                                                className="text-gray-600 hover:text-gray-800"
                                                                                onClick={() => handleCopyToClipboard(item.EmailId)}
                                                                            >
                                                                                <FontAwesomeIcon icon={faCopy} />
                                                                            </button>
                                                                        </div>
                                                                    </td>

                                                                    <td
                                                                        rowSpan={rowSpan}
                                                                        className="px-4 py-3 border-r border-gray-200 align-middle w-[300px]"
                                                                    >
                                                                        <div className="flex items-center h-100 justify-center gap-2">
                                                                            <span className="text-sm text-gray-900 break-all">
                                                                                {item.case || "-"}
                                                                            </span>
                                                                        </div>
                                                                    </td>
                                                                </>
                                                            )}

                                                            <td className="px-4 py-3 text-sm font-medium text-purple-600 border-r border-gray-200">
                                                                Backend
                                                            </td>
                                                            <td className="px-4 py-3 border-r border-gray-200">
                                                                <div className="flex items-center gap-2 break-all w-[120px]">
                                                                    <span className="text-sm text-gray-900">{item.btransactionId || "-"}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 border-r border-gray-200">
                                                                <div className="flex items-center gap-2 break-all w-[120px]">
                                                                    <span className="text-sm text-gray-900">{item.bogTransactionId || "-"}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 border-r border-gray-200">
                                                                <div className="flex items-center gap-2 w-[170px]">
                                                                    <span className="text-sm text-gray-900">
                                                                        {item.bpurchaseDate ? formatDate(item.bpurchaseDate) : "-"}
                                                                    </span>
                                                                </div>
                                                            </td>

                                                            <td className="px-4 py-3 border-r border-gray-200">
                                                                <div className="flex items-center gap-2 w-[170px]">
                                                                    <span className="text-sm text-gray-900">
                                                                        {item.bexDate ? formatDate(item.bexDate) : "-"}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                        </tr>

                                                        <tr className="bg-gray-50 hover:bg-gray-100 transition">

                                                            <td className="px-4 py-3 border-r border-gray-200 text-center">

                                                            </td>
                                                            {/* Status */}
                                                            <td colSpan={3} className="px-4 py-3 border-r border-gray-200 text-center">

                                                                <div className="flex gap-4 items-center text-center justify-between leading-tight">
                                                                    <span className="text-md font-medium text-black-500">
                                                                        Status
                                                                    </span>
                                                                    <span
                                                                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${item.bstatus === "1" || item.bstatus === "3"
                                                                            ? "bg-green-200 text-green-700"
                                                                            : "bg-red-200 text-red-700"
                                                                            }`}
                                                                    >
                                                                        {item.bstatus === "1" || item.bstatus === "3" ? "True" : "False"}
                                                                    </span>
                                                                </div>
                                                            </td>

                                                            {/* Updated Date */}
                                                            <td colSpan={4} className="px-4 py-3 border-r border-gray-200">
                                                                <div className="flex gap-4 items-center text-center justify-between leading-tight">
                                                                    <span className="text-md font-medium text-black-500">
                                                                        Date & Time
                                                                    </span>
                                                                    <span className="text-sm text-gray-800">
                                                                        {item.createdAt
                                                                            ? new Date(item.createdAt).toLocaleString()
                                                                            : "-"}
                                                                    </span>
                                                                </div>
                                                            </td>

                                                            {/* Action */}
                                                            {!showAppRow && (
                                                                <td
                                                                    rowSpan={rowSpan}
                                                                    className="px-4 py-3 align-middle w-[300px]"
                                                                >
                                                                    <div className="flex justify-center">
                                                                        <button
                                                                            onClick={() => openDeleteModal(item._id)}
                                                                            className="flex items-center justify-center w-9 h-9 rounded-full
                bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700
                transition"
                                                                            title="Delete"
                                                                        >
                                                                            <FontAwesomeIcon icon={faTrash} className="text-sm" />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            )}
                                                        </tr>
                                                    </>
                                                )}
                                            </React.Fragment>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={11} className="text-center py-8 text-gray-500">
                                            {searchEmail ? "No matching results found" : "No Data Found"}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>


                </div>
            </div>

            {/* Delete Modal */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999]">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4 shadow-lg">
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">
                            {deleteModal.isBulk ? 'Delete Selected Items' : 'Delete Temporary Data'}
                        </h2>

                        <p className="text-gray-700 mb-6">
                            {deleteModal.isBulk
                                ? `Are you sure you want to delete ${selectedItems.length} selected items?`
                                : 'Are you sure you want to delete this data?'
                            }
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={closeDeleteModal}
                                disabled={isDeleting}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-70"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={deleteModal.isBulk ? handleDeleteSelected : handleDelete}
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

export default Temp;