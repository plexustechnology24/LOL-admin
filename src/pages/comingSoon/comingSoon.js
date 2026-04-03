import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "react-bootstrap";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPlus, faTrash, faCheck } from "@fortawesome/free-solid-svg-icons";
import CustomPagination from "../../components/common/pagination";

// ─── Default images for Coming Soon ──────────────────────────────────────────
const DEFAULT_IMAGES = [
    "https://lol-image-bucket.s3.ap-south-1.amazonaws.com/cominsoon1.png",
    "https://lol-image-bucket.s3.ap-south-1.amazonaws.com/cominsoon2.png",
    "https://lol-image-bucket.s3.ap-south-1.amazonaws.com/cominsoon3.png",
    "https://lol-image-bucket.s3.ap-south-1.amazonaws.com/cominsoon4.png",
];


// ─────────────────────────────────────────────────────────────────────────────
//  SHARED: Delete Confirmation Modal
// ─────────────────────────────────────────────────────────────────────────────
const DeleteModal = ({ deleteModal, isDeleting, onConfirm, onClose, selectedCount }) => {
    if (!deleteModal.isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999]">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4 shadow-lg dark:bg-gray-800">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    {deleteModal.isBulk ? 'Delete Selected Items' : 'Delete Suggestion'}
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                    {deleteModal.isBulk
                        ? `Are you sure you want to delete ${selectedCount} selected suggestion${selectedCount > 1 ? 's' : ''}?`
                        : 'Are you sure you want to delete this suggestion? This action cannot be undone.'}
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-70 dark:bg-gray-700 dark:text-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-70"
                    >
                        {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
};


// ─────────────────────────────────────────────────────────────────────────────
//  SHARED: Coming Soon Form Modal
// ─────────────────────────────────────────────────────────────────────────────
const ComingSoonFormModal = ({
    visible,
    isSubmitting,
    id,
    title, setTitle,
    description, setDescription,
    selectedImage, setSelectedImage,
    fakeVotes, setFakeVotes,
    errors, setErrors,
    onSubmit,
    onClose,
}) => {
    if (!visible) return null;

    const handleImageSelect = (url) => {
        setSelectedImage(url);
        if (errors.image) setErrors(prev => { const n = { ...prev }; delete n.image; return n; });
    };

    const handleFakeVotesChange = (e) => {
        const raw = e.target.value;
        if (raw === '') {
            setFakeVotes('');
            if (errors.fakeVotes) setErrors(prev => { const n = { ...prev }; delete n.fakeVotes; return n; });
            return;
        }
        const digits = raw.replace(/\D/g, '');
        const num = parseInt(digits, 10);
        if (isNaN(num)) { setFakeVotes(''); return; }
        const clamped = Math.min(100, Math.max(0, num));
        setFakeVotes(String(clamped));
        if (errors.fakeVotes) setErrors(prev => { const n = { ...prev }; delete n.fakeVotes; return n; });
    };

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50"
                onClick={() => !isSubmitting && onClose()}
            />

            <div className="relative bg-white rounded-lg w-full max-w-lg mx-4 dark:bg-gray-800 dark:text-gray-300 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="px-6 py-4 border-b sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <h3 className="text-xl font-semibold">
                        {id ? "Edit Coming Soon" : "Add Coming Soon"}
                    </h3>
                </div>

                {/* Body */}
                <div className="px-6 py-4">
                    <form onSubmit={onSubmit}>

                        {/* Title */}
                        <div className="mb-4">
                            <label className="block font-medium mb-1">
                                Title <span className="text-red-500 text-lg">*</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => {
                                    setTitle(e.target.value);
                                    if (errors.title) setErrors(prev => { const n = { ...prev }; delete n.title; return n; });
                                }}
                                placeholder="Enter title"
                                disabled={isSubmitting}
                                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                        </div>

                        {/* Description */}
                        <div className="mb-4">
                            <label className="block font-medium mb-1">
                                Description <span className="text-red-500 text-lg">*</span>
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => {
                                    setDescription(e.target.value);
                                    if (errors.description) setErrors(prev => { const n = { ...prev }; delete n.description; return n; });
                                }}
                                placeholder="Enter description"
                                rows={3}
                                disabled={isSubmitting}
                                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                        </div>

                        {/* Image Selection Grid */}
                        <div className="mb-4">
                            <label className="block font-medium mb-2">
                                Select Image <span className="text-red-500 text-lg">*</span>
                            </label>
                            <div className={`grid grid-cols-4 gap-3 p-3 border rounded-lg ${errors.image ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}>
                                {DEFAULT_IMAGES.map((url, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => !isSubmitting && handleImageSelect(url)}
                                        className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 ${selectedImage === url
                                            ? 'border-[#FA4B56] shadow-md scale-[1.03]'
                                            : 'border-transparent hover:border-gray-300 dark:hover:border-gray-500'}`}
                                    >
                                        <img
                                            src={url}
                                            alt={`Option ${idx + 1}`}
                                            className="w-full h-20 object-contain"
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Error'; }}
                                        />
                                        {selectedImage === url && (
                                            <div className="absolute inset-0 bg-[#FA4B56]/10 flex items-center justify-center">
                                                <div className="bg-[#FA4B56] rounded-full w-6 h-6 flex items-center justify-center shadow">
                                                    <FontAwesomeIcon icon={faCheck} className="text-white text-xs" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
                            {selectedImage && (
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Selected:</span>
                                    <img
                                        src={selectedImage}
                                        alt="Selected"
                                        className="w-10 h-10 object-cover rounded border border-gray-200 dark:border-gray-600"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Fake Votes (%) */}
                        <div className="mb-4">
                            <label className="block font-medium mb-1">
                                Fake Votes (%) <span className="text-red-500 text-lg">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={fakeVotes}
                                    onChange={handleFakeVotesChange}
                                    placeholder="0 – 100"
                                    disabled={isSubmitting}
                                    className={`w-full border rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.fakeVotes ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold pointer-events-none">%</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Enter a value between 0 and 100</p>
                            {errors.fakeVotes && <p className="text-red-500 text-sm mt-1">{errors.fakeVotes}</p>}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="w-1/2 py-2 px-4 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-1/2 py-2 px-4 text-white rounded-lg transition-colors duration-200"
                                style={{ backgroundColor: "#FA4B56" }}
                            >
                                {isSubmitting
                                    ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                                    : id ? 'Update' : 'Submit'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};


// ─────────────────────────────────────────────────────────────────────────────
//  COMING SOON TAB
// ─────────────────────────────────────────────────────────────────────────────
const ComingSoonTab = ({ onOpenForm }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filteredData, setFilteredData] = useState([]);
    const [isDeleting, setIsDeleting] = useState(false);

    const currentItems = filteredData;

    const getData = async () => {
        try {
            setLoading(true);
            const response = await axios.post('https://api.lolcards.link/api/coming-soon/read');
            if (response.data.status === 1) {
                setData(response.data.data);
                setFilteredData(response.data.data);
            } else {
                toast.error(response.data.message);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { getData(); }, []);

    const handleDelete = async (itemId) => {
        if (!isDeleting && window.confirm("Are you sure you want to delete this item?")) {
            try {
                setIsDeleting(true);
                const response = await axios.delete(`https://api.lolcards.link/api/coming-soon/delete/${itemId}`);
                toast.success(response.data.message);
                getData();
            } catch (err) {
                console.error(err);
                toast.error("An error occurred. Please try again.");
            } finally {
                setIsDeleting(false);
            }
        }
    };

    if (loading) return (
        <div style={{ height: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="border p-4 flex items-center space-x-2 rounded-md">
                <div
                    className="w-10 h-10 border-2 border-gray-300 rounded-full animate-spin dark:border-gray-800"
                    style={{ borderTop: "2px solid #FA4B56" }}
                />
            </div>
        </div>
    );

    return (
        <>
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-3 mt-4 dark:border-gray-800 border-gray-200">
                <Button
                    onClick={() => onOpenForm('add', null, currentItems.length, getData)}
                    className="rounded-md border-0 shadow-md px-4 py-2 text-white"
                    style={{ background: "#FA4B56" }}
                >
                    <FontAwesomeIcon icon={faPlus} className='pe-2' /> Add Coming Soon
                </Button>
            </div>

            {/* Table */}
            <div className="p-4 border-gray-100 dark:border-gray-800 sm:p-6 overflow-auto">
                <div className="space-y-6 rounded-lg xl:border dark:border-gray-800">
                    <Table>
                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                            <TableRow>
                                <TableCell isHeader className="py-4 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Index</TableCell>
                                <TableCell isHeader className="py-4 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Image</TableCell>
                                <TableCell isHeader className="py-4 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Title</TableCell>
                                <TableCell isHeader className="py-4 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Description</TableCell>
                                <TableCell isHeader className="py-4 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Fake Votes (%)</TableCell>
                                <TableCell isHeader className="py-4 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Original Votes</TableCell>
                                <TableCell isHeader className="py-4 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Actions</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-center">
                            {currentItems.length > 0 ? (
                                currentItems.map((item, index) => (
                                    <TableRow key={item._id}>
                                        <TableCell className="text-center px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">
                                            {index + 1}
                                        </TableCell>
                                        <TableCell className="py-2 px-2 border-r border-gray-200 dark:border-gray-700">
                                            <img src={item.Image} alt={item.Title} className="w-12 h-12 object-cover rounded-md mx-auto" />
                                        </TableCell>
                                        <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">{item.Title}</TableCell>
                                        <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400 max-w-xs truncate">{item.Description}</TableCell>
                                        <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">
                                            {item.fakeVotes !== undefined ? `${item.fakeVotes}%` : '—'}
                                        </TableCell>
                                        <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">
                                            {item.originalVotes || 0} Votes
                                        </TableCell>
                                        <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">
                                            <div className="flex align-middle justify-center gap-4">
                                                <button
                                                    style={{ color: "#0385C3" }}
                                                    onClick={() => onOpenForm('edit', item, currentItems.length, getData)}
                                                >
                                                    <FontAwesomeIcon icon={faEdit} className="text-lg" />
                                                </button>
                                                <button
                                                    className="text-red-600"
                                                    onClick={() => handleDelete(item._id)}
                                                    disabled={isDeleting}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} className="text-lg" />
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="text-center pt-5 pb-4 dark:text-gray-400">No Data Found</td>
                                </tr>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </>
    );
};


// ─────────────────────────────────────────────────────────────────────────────
//  SUGGESTION TAB
// ─────────────────────────────────────────────────────────────────────────────
const SuggestionTab = ({ deleteModal, onOpenDeleteModal, onCloseDeleteModal, isDeleting, onDelete, onBulkDelete }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(15);

    const [selectedItems, setSelectedItems] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    // ── Fetch ────────────────────────────────────────────────────────────────
    const getData = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const response = await axios.post('https://api.lolcards.link/api/coming-soon/suggestion/read', {
                page,
                limit: itemsPerPage,
            });
            if (response.data.status === 1) {
                setData(response.data.data);
                setPagination(response.data.pagination);
            } else {
                toast.error(response.data.message || 'Failed to fetch suggestions');
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch suggestions.");
        } finally {
            setLoading(false);
        }
    }, [itemsPerPage]);

    useEffect(() => {
        getData(currentPage);
        setSelectedItems([]);
        setSelectAll(false);
    }, [currentPage]);

    // Refresh after delete — expose via ref so parent can call after delete
    const refreshAfterSingleDelete = useCallback(() => {
        if (data.length === 1 && currentPage > 1) {
            setCurrentPage(prev => prev - 1); // triggers useEffect → getData
        } else {
            getData(currentPage);
        }
    }, [data.length, currentPage, getData]);

    const refreshAfterBulkDelete = useCallback((deletedCount) => {
        // If all items on current page were deleted and we're not on page 1, go back
        if (deletedCount >= data.length && currentPage > 1) {
            setCurrentPage(prev => prev - 1); // triggers useEffect → getData
        } else {
            getData(currentPage);
        }
        setSelectedItems([]);
        setSelectAll(false);
    }, [data.length, currentPage, getData]);

    const indexOfFirstItem = (currentPage - 1) * itemsPerPage;

    // ── Column helpers ───────────────────────────────────────────────────────
    const HIDDEN_KEYS = ['_id', '__v', 'updatedAt'];
    const columnKeys = data.length > 0
        ? Object.keys(data[0]).filter(k => !HIDDEN_KEYS.includes(k))
        : [];

    const formatHeader = (key) => key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());

    const formatCell = (key, value) => {
        if (value === null || value === undefined) return '—';
        if (key === 'createdAt') return new Date(value).toLocaleString();
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
    };

    // ── Selection ────────────────────────────────────────────────────────────
    const handleSelectAll = () => {
        if (!selectAll) {
            setSelectedItems(data.map(item => item._id));
        } else {
            setSelectedItems([]);
        }
        setSelectAll(!selectAll);
    };

    const handleSelectItem = (id) => {
        const next = selectedItems.includes(id)
            ? selectedItems.filter(i => i !== id)
            : [...selectedItems, id];
        setSelectedItems(next);
        setSelectAll(next.length === data.length && data.length > 0);
    };

    useEffect(() => {
        if (data.length > 0 && selectedItems.length > 0) {
            setSelectAll(data.every(item => selectedItems.includes(item._id)));
        } else {
            setSelectAll(false);
        }
    }, [data, selectedItems]);

    const clearAll = () => {
        setSelectedItems([]);
        setSelectAll(false);
        toast.info("Selection cleared");
    };

    if (loading) return (
        <div style={{ height: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="border p-4 flex items-center space-x-2 rounded-md">
                <div
                    className="w-10 h-10 border-2 border-gray-300 rounded-full animate-spin dark:border-gray-800"
                    style={{ borderTop: "2px solid #FA4B56" }}
                />
            </div>
        </div>
    );

    const colSpanTotal = columnKeys.length + 3;

    return (
        <>
            {/* ── Top action bar ─────────────────────────────────────────── */}
            <div className="flex justify-between items-center px-4 py-3 mt-4 gap-4">
                <div className="flex gap-4">
                    {selectedItems.length > 0 && (
                        <Button
                            onClick={() => {
                                if (selectedItems.length === 0) {
                                    toast.info("No items selected for deletion.");
                                    return;
                                }
                                // Pass refresh callback to parent via onOpenDeleteModal
                                onOpenDeleteModal(null, true, selectedItems, refreshAfterBulkDelete);
                            }}
                            disabled={isDeleting}
                            variant="danger"
                            className="d-flex align-items-center gap-2 py-1"
                            style={{ fontSize: "14px", color: "#f13838", border: "none" }}
                        >
                            {isDeleting ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faTrash} className="pe-3" />
                                    <span>DELETE SELECTED ({selectedItems.length})</span>
                                </>
                            )}
                        </Button>
                    )}
                    {selectedItems.length > 0 && (
                        <Button
                            onClick={clearAll}
                            variant="outline-secondary"
                            className="d-flex align-items-center gap-2 py-1 border-0 bg-transparent"
                            style={{ fontSize: "14px", color: "#f13838" }}
                        >
                            CLEAR ALL
                        </Button>
                    )}
                </div>
            </div>

            {/* ── Table ──────────────────────────────────────────────────── */}
            <div className="p-4 border-gray-100 dark:border-gray-800 sm:p-6 overflow-auto">
                <div className="space-y-6 rounded-lg xl:border dark:border-gray-800">
                    <Table>
                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                            <TableRow>
                                <TableCell isHeader className="py-7 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700 w-10">
                                    <div className="flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            checked={selectAll}
                                            onChange={handleSelectAll}
                                        />
                                    </div>
                                </TableCell>
                                <TableCell isHeader className="py-4 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Index</TableCell>
                                {columnKeys.map(key => (
                                    <TableCell key={key} isHeader className="py-7 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">
                                        {formatHeader(key)}
                                    </TableCell>
                                ))}
                                <TableCell isHeader className="py-7 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Actions</TableCell>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-center">
                            {data.length > 0 ? (
                                data.map((item, index) => (
                                    <TableRow key={item._id || index}>
                                        <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center justify-center">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                    checked={selectedItems.includes(item._id)}
                                                    onChange={() => handleSelectItem(item._id)}
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">
                                            {indexOfFirstItem + index + 1}
                                        </TableCell>
                                        {columnKeys.map(key => (
                                            <TableCell key={key} className="py-3 px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400 max-w-xs truncate">
                                                {formatCell(key, item[key])}
                                            </TableCell>
                                        ))}
                                        <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center justify-center">
                                                <button
                                                    className="text-red-600 hover:text-red-800 transition-colors"
                                                    title="Delete"
                                                    onClick={() => onOpenDeleteModal(item._id, false, [], refreshAfterSingleDelete)}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} className="text-lg" />
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={colSpanTotal} className="text-center pt-5 pb-4 dark:text-gray-400">
                                        No Suggestions Found
                                    </td>
                                </tr>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* ── Pagination ─────────────────────────────────────────────── */}
            <CustomPagination
                currentPage={currentPage}
                totalPages={pagination ? pagination.totalPages : 1}
                onPageChange={(page) => {
                    setCurrentPage(page);
                    setSelectedItems([]);
                    setSelectAll(false);
                }}
                itemsPerPage={itemsPerPage}
                totalItems={pagination ? pagination.total : data.length}
            />
        </>
    );
};


// ─────────────────────────────────────────────────────────────────────────────
//  MAIN COMPONENT  (tab switcher + shared modal state)
// ─────────────────────────────────────────────────────────────────────────────
const ComingSoonPage = () => {
    const [activeTab, setActiveTab] = useState("comingsoon");

    // ── Shared: Form Modal state (Coming Soon) ────────────────────────────────
    const [formVisible, setFormVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formId, setFormId] = useState(null);
    const [formTitle, setFormTitle] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formSelectedImage, setFormSelectedImage] = useState('');
    const [formFakeVotes, setFormFakeVotes] = useState('');
    const [formErrors, setFormErrors] = useState({});

    // Callback to re-fetch Coming Soon data after submit
    const comingSoonRefreshRef = React.useRef(null);

    const resetForm = () => {
        setFormTitle('');
        setFormDescription('');
        setFormSelectedImage('');
        setFormFakeVotes('');
        setFormId(null);
        setFormErrors({});
        setFormVisible(false);
    };

    // Called by ComingSoonTab to open add/edit
    const handleOpenForm = (mode, item, currentCount, refreshFn) => {
        comingSoonRefreshRef.current = refreshFn;

        if (mode === 'add') {
            if (currentCount >= 4) {
                toast.warning("You can only add up to 4 Coming Soon items.");
                return;
            }
            resetForm();
            setFormVisible(true);
        } else {
            // edit
            setFormTitle(item.Title || '');
            setFormDescription(item.Description || '');
            setFormSelectedImage(item.Image || '');
            setFormFakeVotes(item.fakeVotes !== undefined ? String(item.fakeVotes) : '');
            setFormId(item._id);
            setFormErrors({});
            setFormVisible(true);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formTitle.trim()) newErrors.title = 'Title is required';
        if (!formDescription.trim()) newErrors.description = 'Description is required';
        if (!formSelectedImage) newErrors.image = 'Please select an image';
        if (formFakeVotes === '' || formFakeVotes === undefined) {
            newErrors.fakeVotes = 'Fake votes (%) is required';
        } else {
            const num = parseInt(formFakeVotes, 10);
            if (isNaN(num) || num < 0 || num > 100) {
                newErrors.fakeVotes = 'Fake votes must be between 0 and 100';
            }
        }
        return newErrors;
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) { setFormErrors(validationErrors); return; }

        try {
            setIsSubmitting(true);
            const endpoint = formId
                ? `https://api.lolcards.link/api/coming-soon/update/${formId}`
                : 'https://api.lolcards.link/api/coming-soon/create';
            const method = formId ? 'patch' : 'post';

            const payload = {
                Title: formTitle,
                Description: formDescription,
                Image: formSelectedImage,
                fakeVotes: parseInt(formFakeVotes, 10),
            };

            const response = await axios[method](endpoint, payload);
            toast.success(response.data.message);
            resetForm();
            // Refresh Coming Soon tab data
            if (comingSoonRefreshRef.current) comingSoonRefreshRef.current();
        } catch (err) {
            console.error(err);
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Shared: Delete Modal state (Suggestion) ───────────────────────────────
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, isBulk: false });
    const [isDeleting, setIsDeleting] = useState(false);
    const deleteSelectedItemsRef = React.useRef([]);
    const deleteRefreshCallbackRef = React.useRef(null);

    // Called by SuggestionTab rows
    const handleOpenDeleteModal = (id, isBulk, selectedItems = [], refreshCallback) => {
        deleteSelectedItemsRef.current = selectedItems;
        deleteRefreshCallbackRef.current = refreshCallback;
        setDeleteModal({ isOpen: true, id, isBulk });
    };

    const handleCloseDeleteModal = () => {
        if (!isDeleting) setDeleteModal({ isOpen: false, id: null, isBulk: false });
    };

    // Single delete
    const handleSingleDelete = async () => {
        try {
            setIsDeleting(true);
            const response = await axios.delete(
                `https://api.lolcards.link/api/coming-soon/delete/${deleteModal.id}`,
                { data: { type: "suggestion" } }
            );
            toast.success(response.data.message || 'Deleted successfully');
            handleCloseDeleteModal();
            if (deleteRefreshCallbackRef.current) deleteRefreshCallbackRef.current();
        } catch (err) {
            console.error(err);
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    // Bulk delete  ← fixed: added await + correct page-back logic
    const handleBulkDelete = async () => {
        const ids = deleteSelectedItemsRef.current;
        try {
            setIsDeleting(true);
            await axios.post('https://api.lolcards.link/api/admin/deleteMultiple', {
                ids,
                TypeId: "21",
            });
            toast.success(`Successfully deleted ${ids.length} items.`);
            handleCloseDeleteModal();
            // Let the tab handle going back a page if needed
            if (deleteRefreshCallbackRef.current) deleteRefreshCallbackRef.current(ids.length);
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete selected items.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteConfirm = () => {
        if (deleteModal.isBulk) {
            handleBulkDelete();
        } else {
            handleSingleDelete();
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div>
            <PageBreadcrumb pageTitle="Coming Soon" />

            {/* Tab Buttons */}
            <div className="flex rounded-lg mb-6 w-full bg-gray-100 gap-5 ps-3 dark:bg-gray-800">
                <button
                    className={`py-3 px-6 font-medium text-base w-1/2 transition-all duration-300 ${activeTab === "comingsoon"
                        ? "bg-blue-100 text-blue-600 dark:bg-[#696CFF] dark:text-white rounded-lg scale-105"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                        }`}
                    onClick={() => setActiveTab("comingsoon")}
                >
                    Coming Soon
                </button>
                <button
                    className={`py-3 px-6 font-medium text-base w-1/2 transition-all duration-300 ${activeTab === "suggestion"
                        ? "bg-blue-100 text-blue-600 dark:bg-[#696CFF] dark:text-white rounded-lg scale-105"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                        }`}
                    onClick={() => setActiveTab("suggestion")}
                >
                    Suggestion
                </button>
            </div>

            <div className="space-y-6 sticky left-0">
                <div
                    className="rounded-2xl overflow-auto border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"
                    style={{ minHeight: "600px" }}
                >
                    <div className="px-6 pt-5">
                        {activeTab === "comingsoon" && (
                            <ComingSoonTab onOpenForm={handleOpenForm} />
                        )}
                        {activeTab === "suggestion" && (
                            <SuggestionTab
                                deleteModal={deleteModal}
                                onOpenDeleteModal={handleOpenDeleteModal}
                                onCloseDeleteModal={handleCloseDeleteModal}
                                isDeleting={isDeleting}
                                onDelete={handleSingleDelete}
                                onBulkDelete={handleBulkDelete}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* ── Coming Soon Form Modal (rendered at parent level) ───────── */}
            <ComingSoonFormModal
                visible={formVisible}
                isSubmitting={isSubmitting}
                id={formId}
                title={formTitle}           setTitle={setFormTitle}
                description={formDescription} setDescription={setFormDescription}
                selectedImage={formSelectedImage} setSelectedImage={setFormSelectedImage}
                fakeVotes={formFakeVotes}    setFakeVotes={setFormFakeVotes}
                errors={formErrors}          setErrors={setFormErrors}
                onSubmit={handleFormSubmit}
                onClose={resetForm}
            />

            {/* ── Delete Confirmation Modal (rendered at parent level) ─────── */}
            <DeleteModal
                deleteModal={deleteModal}
                isDeleting={isDeleting}
                onConfirm={handleDeleteConfirm}
                onClose={handleCloseDeleteModal}
                selectedCount={deleteSelectedItemsRef.current?.length ?? 0}
            />

            <ToastContainer position="top-center" className="!z-[99999]" />
        </div>
    );
};

export default ComingSoonPage;