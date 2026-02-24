import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "react-bootstrap";
import ImagePreviewModal from "../../components/common/ImagePreview";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpFromBracket, faCopy, faEdit, faEye, faFileImage, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import CustomPagination from "../../components/common/pagination";

const CardBg = () => {
    const [visible, setVisible] = useState(false);
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState([]);
    const [id, setId] = useState();
    const [loading, setLoading] = useState(true);
    const [imageFileLabel, setImageFileLabel] = useState('Image Prank Image Upload');
    const [filteredData, setFilteredData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [inputType, setInputType] = useState('file');
    const [imageUrlText, setImageUrlText] = useState('');
    const [selectedItems, setSelectedItems] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [existingImageUrl, setExistingImageUrl] = useState(''); // NEW: Store existing image URL
    const MAX_FILES = 5;

    const [previewIndex, setPreviewIndex] = useState(0);
    const [showPreview, setShowPreview] = useState(false);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData;

    const getData = useCallback((page = null) => {
        setLoading(true);
        const payload = {
            page: page !== null ? page : currentPage,
            limit: itemsPerPage,
        };

        axios.post('https://api.lolcards.link/api/cardbg/read', payload)
            .then((res) => {
                setData(res.data.data);
                setPagination(res.data.pagination);
                setFilteredData(res.data.data);
                if (res.data.pagination) {
                    const totalPages = res.data.pagination.totalPages;
                    const requestedPage = page !== null ? page : currentPage;
                    if (requestedPage > totalPages && totalPages > 0) {
                        setCurrentPage(totalPages);
                        getData(totalPages);
                    }
                }
                setSelectedItems([]);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
                toast.error("Failed to fetch data");
            });
    }, [currentPage, itemsPerPage]);

    useEffect(() => {
        getData();
    }, [itemsPerPage]);

    useEffect(() => {
        if (!loading) {
            getData();
        }
    }, [currentPage]);

    const handleDelete = (cardbgId) => {
        if (window.confirm("Are you sure you want to delete this Annoy Funny CardBg?")) {
            axios.delete(`https://api.lolcards.link/api/cardbg/delete/${cardbgId}`)
                .then((res) => {
                    if (currentItems.length === 1 && currentPage > 1) {
                        setCurrentPage(currentPage - 1);
                    } else {
                        getData(currentPage);
                    }
                    toast.success(res.data.message);
                })
                .catch((err) => {
                    console.error(err);
                    toast.error("An error occurred. Please try again.");
                });
        }
    };

    const isValidImageUrl = (url) => {
        const imageExtensions = /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;
        const urlPattern = /^https?:\/\/.+/i;
        return urlPattern.test(url) && imageExtensions.test(url);
    };

    const handleShowPreview = (currentPageIndex) => {
        // Now we're just setting the index within the current page
        setPreviewIndex(currentPageIndex);
        setShowPreview(true);
    }

    const handlePreviewNavigation = async (newIndex, direction) => {
        // Calculate actual global index
        const globalIndex = (currentPage - 1) * itemsPerPage + newIndex;

        // Check if we need to load next/previous page
        if (direction === 'next' && newIndex >= currentItems.length) {
            // Need to load next page
            if (currentPage < (data.pagination ? data.pagination.totalPages : Math.ceil(filteredData.length / itemsPerPage))) {
                const nextPage = currentPage + 1;
                setPreviewIndex(0); // First item in next page
                setCurrentPage(nextPage);
                // Either wait for the useEffect to load data or call getData here
                await getData(nextPage);
            }
        } else if (direction === 'prev' && newIndex < 0) {
            // Need to load previous page
            if (currentPage > 1) {
                const prevPage = currentPage - 1;
                setCurrentPage(prevPage);
                // Load previous page data
                await getData(prevPage);
                // Set index to last item in the previous page
                setPreviewIndex(itemsPerPage - 1);
            }
        } else {
            // Just update the index within current page
            setPreviewIndex(newIndex);
        }
    }

    const toggleModal = (mode) => {
        if (!visible) {
            if (mode === 'add') {
                setId(undefined);
                setImageFileLabel('Image Prank Image Upload');
                setImageUrlText('');
                setSelectedFiles([]);
                setPreviewUrls([]);
                setExistingImageUrl(''); // NEW: Clear existing image
                setPreviewUrl(null);
            }
        } else {
            setPreviewUrl(null);
            setImageUrlText('');
            setSelectedFiles([]);
            setPreviewUrls([]);
            setExistingImageUrl(''); // NEW: Clear existing image
            setImageFileLabel('Image Prank Image Upload');
            setInputType('file');
        }
        setVisible(!visible);
    };

    const compressImage = (file) => {
        return new Promise((resolve, reject) => {

            // ✅ GIF compress na karvu
            if (file.type === "image/gif") {
                resolve(file);
                return;
            }

            // ✅ Small files (under 2MB) direct use — no compression
            if (file.size < 2 * 1024 * 1024) {
                resolve(file);
                return;
            }

            const reader = new FileReader();

            reader.onload = (event) => {
                const img = new Image();

                img.onload = () => {

                    let width = img.width;
                    let height = img.height;

                    // ✅ Resize only if very large image
                    const MAX_WIDTH = 2000;
                    const MAX_HEIGHT = 2000;

                    if (width > MAX_WIDTH || height > MAX_HEIGHT) {
                        if (width > height) {
                            height = Math.round((height * MAX_WIDTH) / width);
                            width = MAX_WIDTH;
                        } else {
                            width = Math.round((width * MAX_HEIGHT) / height);
                            height = MAX_HEIGHT;
                        }
                    }

                    const canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext("2d");

                    // ✅ High quality rendering (important for cards/text)
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = "high";

                    ctx.drawImage(img, 0, 0, width, height);

                    // ✅ PNG keep as PNG (text sharp)
                    const outputType =
                        file.type === "image/png" ? "image/png" : "image/jpeg";

                    // ✅ Higher quality to avoid blur
                    const quality =
                        outputType === "image/png" ? 1 : 0.92;

                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                reject(new Error("Canvas to Blob failed"));
                                return;
                            }

                            const compressedFile = new File(
                                [blob],
                                file.name,
                                {
                                    type: outputType,
                                    lastModified: Date.now(),
                                }
                            );

                            resolve(compressedFile);
                        },
                        outputType,
                        quality
                    );
                };

                img.onerror = () =>
                    reject(new Error("Failed to load image"));

                img.src = event.target.result;
            };

            reader.onerror = () =>
                reject(new Error("Failed to read file"));

            reader.readAsDataURL(file);
        });
    };


    const handleFileChange = async (event) => {
        const files = Array.from(event.currentTarget.files);

        if (id) {
            if (files.length > 1) {
                toast.error('You can only upload one image when editing');
                return;
            }
            setSelectedFiles([]);
            setPreviewUrls([]);
        } else {
            if (selectedFiles.length + files.length > MAX_FILES) {
                toast.error(`You can only upload a maximum of ${MAX_FILES} images`);
                return;
            }
        }

        const processedFiles = [];
        const newPreviewUrls = [];

        for (const file of files) {
            try {
                const processedFile = await compressImage(file);
                const maxSizeInBytes = 5 * 1024 * 1024;
                if (processedFile.size > maxSizeInBytes) {
                    toast.error(`${file.name} exceeds 5 MB. Skipping this file.`);
                    continue;
                }
                processedFiles.push(processedFile);
                newPreviewUrls.push(URL.createObjectURL(processedFile));
            } catch (error) {
                toast.error(`Error processing ${file.name}`);
                console.error(error);
            }
        }

        if (id) {
            setSelectedFiles(processedFiles);
            setPreviewUrls(newPreviewUrls);
        } else {
            setSelectedFiles([...selectedFiles, ...processedFiles]);
            setPreviewUrls([...previewUrls, ...newPreviewUrls]);
        }
    };

    const removeFile = (index) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        const newPreviews = previewUrls.filter((_, i) => i !== index);
        URL.revokeObjectURL(previewUrls[index]);
        setSelectedFiles(newFiles);
        setPreviewUrls(newPreviews);
    };

    const onDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (isSubmitting) return;

        const files = Array.from(e.dataTransfer.files);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));

        if (imageFiles.length === 0) {
            toast.error('Please upload image files only');
            return;
        }

        if (selectedFiles.length + imageFiles.length > MAX_FILES) {
            toast.error(`You can only upload a maximum of ${MAX_FILES} images`);
            return;
        }

        const syntheticEvent = {
            currentTarget: { files: imageFiles }
        };
        handleFileChange(syntheticEvent);
    }, [isSubmitting, selectedFiles]);

    const onDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isSubmitting) {
            setIsDragging(true);
        }
    }, [isSubmitting]);

    const onDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting) return;

        try {
            setIsSubmitting(true);

            if (id) {
                // Edit mode
                if (selectedFiles.length > 0) {
                    // NEW: User selected a new file, upload it
                    const formData = new FormData();
                    formData.append('CardBg', selectedFiles[0]);

                    const response = await axios.patch(
                        `https://api.lolcards.link/api/cardbg/update/${id}`,
                        formData
                    );
                    toast.success(response.data.message || 'Successfully updated image');
                } else if (existingImageUrl) {
                    // NEW: No new file selected, keep existing image
                    // Send a request with the existing image URL or no file
                    toast.success('No changes made to the image');
                } else {
                    toast.error('Please select an image');
                    setIsSubmitting(false);
                    return;
                }
            } else {
                // Create mode - upload multiple files
                if (selectedFiles.length === 0) {
                    toast.error('Please select at least one image');
                    setIsSubmitting(false);
                    return;
                }

                const uploadPromises = [];
                for (const file of selectedFiles) {
                    const formData = new FormData();
                    formData.append('CardBg', file);
                    uploadPromises.push(
                        axios.post('https://api.lolcards.link/api/cardbg/create', formData)
                    );
                }

                const results = await Promise.all(uploadPromises);
                toast.success(`Successfully uploaded ${results.length} image(s)`);
            }

            // Reset form state
            setSelectedFiles([]);
            setPreviewUrls([]);
            setId(undefined);
            setExistingImageUrl(''); // NEW: Clear existing image
            setImageFileLabel('Image Prank Image Upload');
            setImageUrlText('');
            setPreviewUrl(null);
            setInputType('file');
            setVisible(false);
            getData(currentPage);

        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (cardbg) => {
        const fileName = cardbg.CardBg.split('/').pop();
        setImageUrlText(cardbg.CardBg);
        setInputType('file');
        setExistingImageUrl(cardbg.CardBg);
        setPreviewUrls([cardbg.CardBg]);
        setSelectedFiles([]);
        setId(cardbg._id);
        setImageFileLabel('Image Prank Image Upload (Select new file to replace, or keep existing)');
        setVisible(true); // Changed from toggleModal('edit')
    };



    // Add this useEffect to reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
        // Reset selections when filters change
        setSelectedItems([]);
    }, []);


    // Effect to update selectAll status when currentItems change
    useEffect(() => {
        if (currentItems.length > 0 && selectedItems.length > 0) {
            const allCurrentItemsSelected = currentItems.every(item =>
                selectedItems.includes(item._id)
            );
        }
    }, [currentItems, selectedItems]);

    const handleCopyToClipboard = (cardbg) => {
        if (cardbg?.CardBg) {
            navigator.clipboard.writeText(cardbg.CardBg)
                .then(() => {
                    toast.success("Image URL copied to clipboard!");
                })
                .catch((error) => {
                    console.error("Failed to copy: ", error);
                });
        } else {
            alert("No URL to copy!");
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
    return (
        <div>
            <PageBreadcrumb pageTitle="Annoy Funny CardBg" />

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
                                <FontAwesomeIcon icon={faPlus} className='pe-2' /> Add CardBg
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
                                        <TableCell isHeader className="py-7 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Annoy Funny CardBg</TableCell>
                                        <TableCell isHeader className="py-7 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Actions</TableCell>
                                    </TableRow>
                                </TableHeader>

                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-center">
                                    {currentItems && currentItems.length > 0 ? (
                                        currentItems.map((cardbg, index) => (
                                            <TableRow key={cardbg._id}>
                                                <TableCell className="text-center px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">
                                                    {indexOfFirstItem + index + 1}
                                                </TableCell>

                                                <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700 relative group">
                                                    <div className="relative w-[70px] h-[100px] mx-auto">
                                                        {/* Loading placeholder - shown while image loads */}
                                                        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
                                                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                            </svg>
                                                        </div>

                                                        {/* Actual cardbg image with onLoad handler */}
                                                        <img
                                                            src={cardbg.CardBg}
                                                            alt="CardBg thumbnail"
                                                            className="w-full h-full object-cover cursor-pointer relative z-10"
                                                            onLoad={(e) => {
                                                                // Make image visible and hide placeholder when loaded
                                                                e.target.style.opacity = 1;
                                                                e.target.previousSibling.style.display = 'none';
                                                            }}
                                                            // Start with transparent until loaded
                                                            style={{ opacity: 0 }}
                                                        />

                                                        <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity duration-200 z-20">
                                                            <button
                                                                onClick={() => handleShowPreview(index)}
                                                                className="text-white hover:text-blue-300 transition-colors"
                                                                title="Preview Image"
                                                            >
                                                                <FontAwesomeIcon icon={faEye} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleCopyToClipboard(cardbg)}
                                                                className="text-white hover:text-blue-300 transition-colors"
                                                                title="Copy URL"
                                                            >
                                                                <FontAwesomeIcon icon={faCopy} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </TableCell>



                                                <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700">
                                                    <div className="flex align-middle justify-center gap-4 h-full">
                                                        <button style={{ color: "#0385C3" }} onClick={() => handleEdit(cardbg)}>
                                                            <FontAwesomeIcon icon={faEdit} className="text-lg" />
                                                        </button>
                                                        <button className="text-red-600" onClick={() => handleDelete(cardbg._id)}>
                                                            <FontAwesomeIcon icon={faTrash} className="text-lg" />
                                                        </button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="text-center pt-5 pb-4 dark:text-gray-400">No Data Found</td>
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
                // Use server-provided total pages
                totalPages={pagination ? pagination.totalPages : Math.ceil(filteredData.length / itemsPerPage)}
                onPageChange={(page) => {
                    setCurrentPage(page);
                    setSelectedItems([]);
                    getData(page); // Important: Call getData with the new page number
                }}
                itemsPerPage={itemsPerPage}
                // Use server-provided total items
                totalItems={pagination ? pagination.total : filteredData.length}
            />



            {visible && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center">
                    <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => !isSubmitting && toggleModal('add')}></div>
                    <div className="relative bg-white rounded-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b">
                            <h3 className="text-xl font-semibold">
                                {id ? "Edit Card Background" : "Add Card Background"}
                            </h3>
                        </div>

                        <div className="px-6 py-4">
                            <form onSubmit={handleSubmit}>
                                <div className="py-2">
                                    <label className="block font-medium mb-2">
                                        {imageFileLabel} <span className="text-xs">(Max {MAX_FILES} images, 5 MB each)</span>
                                        <span className="text-red-500 pl-2 font-normal text-lg">*</span>
                                    </label>

                                    <div className="flex flex-col">
                                        <input
                                            type="file"
                                            id="CardBg"
                                            name="CardBg"
                                            onChange={handleFileChange}
                                            disabled={isSubmitting || (!id && selectedFiles.length >= MAX_FILES)}
                                            className="hidden"
                                            accept="image/*,.png,.jpg,.jpeg,.gif,.webp"
                                            multiple={!id}
                                            ref={fileInputRef}
                                        />

                                        <div
                                            onClick={() => !isSubmitting && (!id ? selectedFiles.length < MAX_FILES : true) && fileInputRef.current?.click()}
                                            onDragOver={onDragOver}
                                            onDragLeave={onDragLeave}
                                            onDrop={onDrop}
                                            className={`flex flex-col items-center justify-center p-6 border-2 ${isDragging ? 'border-purple-600 bg-purple-50' : 'border-dashed border-purple-500'
                                                } rounded-lg cursor-pointer transition-all duration-300 ${isSubmitting || selectedFiles.length >= MAX_FILES ? 'cursor-not-allowed opacity-70' : 'hover:bg-gray-50'
                                                }`}
                                            style={{ background: isDragging ? "#F5F3FF" : "#F9FAFB" }}
                                        >
                                            <FontAwesomeIcon
                                                icon={isDragging ? faFileImage : faArrowUpFromBracket}
                                                className={`text-2xl mb-2 ${isDragging ? 'text-purple-600' : 'text-gray-400'}`}
                                            />
                                            <div className="flex flex-col items-center gap-1 text-center">
                                                {isDragging ? (
                                                    <span className="text-purple-600 font-medium">Drop images here</span>
                                                ) : (
                                                    <>
                                                        <span className="text-gray-500">Drag & drop images or</span>
                                                        <span className="text-purple-600 font-medium">Browse files</span>
                                                        {!id && (
                                                            <span className="text-sm text-gray-400 mt-1">
                                                                {selectedFiles.length}/{MAX_FILES} images selected
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {previewUrls.length > 0 && (
                                            <div className="grid grid-cols-3 gap-3 mt-4">
                                                {previewUrls.map((url, index) => (
                                                    <div key={index} className="relative group">
                                                        <div className="border overflow-hidden rounded-md bg-[#F9FAFB] flex justify-center h-32">
                                                            <img
                                                                src={url}
                                                                alt={`Preview ${index + 1}`}
                                                                className="object-contain w-full h-full"
                                                            />
                                                        </div>
                                                        {selectedFiles.length > 0 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeFile(index)}
                                                                disabled={isSubmitting}
                                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                                                            >
                                                                ×
                                                            </button>
                                                        )}
                                                        <div className="text-xs text-center mt-1 text-gray-500 truncate">
                                                            {selectedFiles[index]?.name || 'Existing image'}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
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

            <ToastContainer position="top-center" className="!z-[99999]" />

            <ImagePreviewModal
                show={showPreview}
                onHide={() => setShowPreview(false)}
                images={currentItems.map(item => item.CardBg)} // Only use current page items
                currentIndex={previewIndex % itemsPerPage} // Index within the current page
                onNavigate={handlePreviewNavigation}
                totalImages={pagination ? pagination.total : filteredData.length}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
            />
        </div>
    );
};

export default CardBg;