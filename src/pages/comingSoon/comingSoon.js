import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "react-bootstrap";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPlus, faTrash, faCheck } from "@fortawesome/free-solid-svg-icons";
import CustomPagination from "../../components/common/pagination";

const DEFAULT_IMAGES = [
    "https://lol-image-bucket.s3.ap-south-1.amazonaws.com/cominsoon1.png",
    "https://lol-image-bucket.s3.ap-south-1.amazonaws.com/cominsoon2.png",
    "https://lol-image-bucket.s3.ap-south-1.amazonaws.com/cominsoon3.png",
    "https://lol-image-bucket.s3.ap-south-1.amazonaws.com/cominsoon4.png",
];

const ComingSoon = () => {
    const [visible, setVisible] = useState(false);
    const [data, setData] = useState([]);
    const [id, setId] = useState();
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [filteredData, setFilteredData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const searchContainerRef = useRef(null);

    // Form fields
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedImage, setSelectedImage] = useState('');
    const [fakeVotes, setFakeVotes] = useState('');
    const [originalVotes, setOriginalVotes] = useState(''); // display only

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [Items, setTotalItems] = useState(0);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData;

    const getData = async () => {
        try {
            setLoading(true);

            const response = await axios.post(
                'https://api.lolcards.link/api/coming-soon/read'
            );

            if (response.data.status === 1) {
                setData(response.data.data);
                setFilteredData(response.data.data);
            } else {
                toast.error(response.data.message);
            }

        } catch (err) {
            console.error(err);
            // toast.error("Failed to fetch data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getData(currentPage, searchTerm);
    }, [itemsPerPage]);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setSelectedImage('');
        setFakeVotes('');
        setOriginalVotes('');
        setId(null);
        setErrors({});
        setVisible(false);
    };

    const toggleModal = (mode) => {
        if (!isSubmitting) {
            if (mode === 'add') {
                console.log(currentItems);

                if (currentItems.length >= 4) {
                    toast.warning("You can only add up to 4 Coming Soon items.");
                    return;
                }
                resetForm();
                setVisible(true);
            } else {
                setErrors({});
                setVisible(!visible);
            }
        }
    };

    const handleEdit = (item) => {
        if (!isSubmitting) {
            setTitle(item.Title || '');
            setDescription(item.Description || '');
            setSelectedImage(item.Image || '');
            setFakeVotes(item.fakeVotes || '');
            setOriginalVotes(item.originalVotes || '');
            setId(item._id);
            setVisible(true);
        }
    };

    const handleImageSelect = (url) => {
        setSelectedImage(url);
        if (errors.image) {
            setErrors(prev => { const n = { ...prev }; delete n.image; return n; });
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!title.trim()) newErrors.title = 'Title is required';
        if (!description.trim()) newErrors.description = 'Description is required';
        if (!selectedImage) newErrors.image = 'Please select an image';
        if (!fakeVotes.toString().trim()) newErrors.fakeVotes = 'Fake votes is required';
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
                ? `https://api.lolcards.link/api/coming-soon/update/${id}`
                : 'https://api.lolcards.link/api/coming-soon/create';
            const method = id ? 'patch' : 'post';

            // When editing, do NOT send originalVotes (backend manages it)
            const payload = {
                Title: title,
                Description: description,
                Image: selectedImage,
                fakeVotes: fakeVotes,
            };

            const response = await axios[method](endpoint, payload);
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

    const handleDelete = async (itemId) => {
        if (!isSubmitting && window.confirm("Are you sure you want to delete this item?")) {
            try {
                setIsSubmitting(true);
                const response = await axios.delete(`https://api.lolcards.link/api/coming-soon/delete/${itemId}`);
                toast.success(response.data.message);
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
        <div style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="border p-4 flex items-center space-x-2 rounded-md">
                <div className="w-10 h-10 border-2 border-gray-300 rounded-full animate-spin dark:border-gray-800" style={{ borderTop: "2px solid #FA4B56" }}></div>
            </div>
        </div>
    );

    return (
        <div>
            <PageBreadcrumb pageTitle="Coming Soon" />
            <div className="space-y-6 sticky left-0">
                <div className="rounded-2xl overflow-auto border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]" style={{ minHeight: "600px" }}>

                    {/* Header */}
                    <div className="px-6 pt-5">
                        <div className="flex justify-between items-center px-4 py-3 mt-4 dark:border-gray-800 border-gray-200">

                            <Button
                                onClick={() => toggleModal('add')}
                                className="rounded-md border-0 shadow-md px-4 py-2 text-white"
                                style={{ background: "#FA4B56" }}
                            >
                                <FontAwesomeIcon icon={faPlus} className='pe-2' /> Add Coming Soon
                            </Button>
                        </div>
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
                                        <TableCell isHeader className="py-4 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Fake Votes</TableCell>
                                        <TableCell isHeader className="py-4 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Original Votes</TableCell>
                                        <TableCell isHeader className="py-4 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Actions</TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-center">
                                    {currentItems.length > 0 ? (
                                        currentItems.map((item, index) => (
                                            <TableRow key={item._id}>
                                                <TableCell className="text-center px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">
                                                    {indexOfFirstItem + index + 1}
                                                </TableCell>
                                                <TableCell className="py-2 px-2 border-r border-gray-200 dark:border-gray-700">
                                                    <img
                                                        src={item.Image}
                                                        alt={item.Title}
                                                        className="w-12 h-12 object-cover rounded-md mx-auto"
                                                    />
                                                </TableCell>
                                                <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">
                                                    {item.Title}
                                                </TableCell>
                                                <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400 max-w-xs truncate">
                                                    {item.Description}
                                                </TableCell>
                                                <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">
                                                    {item.fakeVotes}
                                                </TableCell>
                                                <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">
                                                    {item.originalVotes || 0} Votes
                                                </TableCell>
                                                <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">
                                                    <div className="flex align-middle justify-center gap-4">
                                                        <button style={{ color: "#0385C3" }} onClick={() => handleEdit(item)}>
                                                            <FontAwesomeIcon icon={faEdit} className="text-lg" />
                                                        </button>
                                                        <button className="text-red-600" onClick={() => handleDelete(item._id)}>
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
                </div>
            </div>

            {/* Modal */}
            {visible && (
                <div className="fixed inset-0 z-99999 flex items-center justify-center">
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50"
                        onClick={() => !isSubmitting && resetForm()}
                    ></div>

                    <div className="relative bg-white rounded-lg w-full max-w-lg mx-4 dark:bg-gray-800 dark:text-gray-300 max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="px-6 py-4 border-b sticky top-0 bg-white dark:bg-gray-800 z-10">
                            <h3 className="text-xl font-semibold">
                                {id ? "Edit Coming Soon" : "Add Coming Soon"}
                            </h3>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-4">
                            <form onSubmit={handleSubmit}>

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
                                    <div className={`grid grid-cols-3 gap-3 p-3 border rounded-lg ${errors.image ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}>
                                        {DEFAULT_IMAGES.map((url, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => !isSubmitting && handleImageSelect(url)}
                                                className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 ${selectedImage === url
                                                    ? 'border-[#FA4B56] shadow-md scale-[1.03]'
                                                    : 'border-transparent hover:border-gray-300 dark:hover:border-gray-500'
                                                    }`}
                                            >
                                                <img
                                                    src={url}
                                                    alt={`Option ${idx + 1}`}
                                                    className="w-full h-24 object-contain"
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
                                            <img src={selectedImage} alt="Selected" className="w-10 h-10 object-cover rounded border border-gray-200 dark:border-gray-600" />
                                        </div>
                                    )}
                                </div>

                                {/* Fake Votes */}
                                <div className="mb-4">
                                    <label className="block font-medium mb-1">
                                        Fake Votes <span className="text-red-500 text-lg">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={fakeVotes}
                                        onChange={(e) => {
                                            setFakeVotes(e.target.value);
                                            if (errors.fakeVotes) setErrors(prev => { const n = { ...prev }; delete n.fakeVotes; return n; });
                                        }}
                                        placeholder="Enter fake votes count"
                                        disabled={isSubmitting}
                                        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.fakeVotes ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors.fakeVotes && <p className="text-red-500 text-sm mt-1">{errors.fakeVotes}</p>}
                                </div>


                                {/* Actions */}
                                <div className="flex gap-4 mt-6">
                                    <button
                                        type="button"
                                        onClick={resetForm}
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

export default ComingSoon;