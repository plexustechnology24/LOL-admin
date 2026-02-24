import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "react-bootstrap";
import ImagePreviewModal2 from "../../components/common/ImagePreview2";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpFromBracket, faCheckCircle, faCopy, faEdit, faFileImage, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import CustomPagination from "../../components/common/pagination";
import { faEye } from "@fortawesome/free-regular-svg-icons";

const HotnessCategory = () => {
    const [visible, setVisible] = useState(false);
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [id, setId] = useState();
    const [loading, setLoading] = useState(true);
    const [filteredData, setFilteredData] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [categoryMode, setCategoryMode] = useState('existing'); // 'new' or 'existing'
    const [selectedExistingCategory, setSelectedExistingCategory] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(15);
    const [isDragging, setIsDragging] = useState({ category: false, subCategory: false, cardImage: false });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, isBulk: false });
    const [activeTab, setActiveTab] = useState('all');
    const [allCategories, setAllCategories] = useState([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [cardImageFile, setCardImageFile] = useState(null);
    const [cardImagePreview, setCardImagePreview] = useState('');
    const [selectedCardImage, setSelectedCardImage] = useState('');
    const [existingCardImages, setExistingCardImages] = useState([]);
    const [categoryTitleError, setCategoryTitleError] = useState(false);
    const [subCategoryTitleError, setSubCategoryTitleError] = useState(false);
    const cardImageFileInputRef = useRef(null);
    const [categoryEditModal, setCategoryEditModal] = useState(false);
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [editCategoryTitle, setEditCategoryTitle] = useState('');
    const [categoryOnlyMode, setCategoryOnlyMode] = useState(false);
    const [editCategoryImage, setEditCategoryImage] = useState(null);
    const [editCategoryImagePreview, setEditCategoryImagePreview] = useState('');
    const [isEditingCategory, setIsEditingCategory] = useState(false);
    const [editCategoryTitleError, setEditCategoryTitleError] = useState(false);
    const editCategoryFileInputRef = useRef(null);
    const [oldCategoryTitle, setOldCategoryTitle] = useState('');
    const [previewImages, setPreviewImages] = useState({ subCategory: '', cardImage: '', title: '' });


    // Form fields
    const [categoryTitle, setCategoryTitle] = useState('');
    const [subCatergoryTitle, setSubCatergoryTitle] = useState('');
    const [categoryImageFile, setCategoryImageFile] = useState(null);
    const [subCatergoryImageFile, setSubCatergoryImageFile] = useState(null);
    const [categoryImagePreview, setCategoryImagePreview] = useState('');
    const [subCatergoryImagePreview, setSubCatergoryImagePreview] = useState('');
    const [selectAll, setSelectAll] = useState(false);
    const [removeCardImage, setRemoveCardImage] = useState(false);

    const categoryFileInputRef = useRef(null);
    const subCategoryFileInputRef = useRef(null);

    const [previewIndex, setPreviewIndex] = useState(0);
    const [showPreview, setShowPreview] = useState(false);
    const [previewType, setPreviewType] = useState('category'); // 'category' or 'subCategory'

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData;

    const handleShowPreview = (index) => {
        const item = currentItems[index];
        setPreviewImages({
            subCategory: item.subCatergoryImage,
            cardImage: item.cardImage || '',
            title: item.subCatergoryTitle
        });
        setPreviewIndex(index);
        setShowPreview(true);
    };

    const getData = useCallback((page = null, categoryFilter = null) => {
        setLoading(true);
        const payload = {
            page: page !== null ? page : currentPage,
            limit: itemsPerPage,
            categoryFilter: categoryFilter !== null ? categoryFilter : (activeTab !== 'all' ? activeTab : null)
        };

        axios.post('https://api.lolcards.link/api/hotness/category/read', payload)
            .then((res) => {
                setData(res.data.data);
                setPagination(res.data.pagination);
                setFilteredData(res.data.data);

                if (res.data.allCategories) {
                    setAllCategories(res.data.allCategories);
                }

                if (res.data.data) {
                    const uniqueCardImages = [...new Set(
                        res.data.data
                            .filter(item => item.cardImage)
                            .map(item => item.cardImage)
                    )];
                    setExistingCardImages(uniqueCardImages);
                }

                if (res.data.pagination) {
                    const totalPages = res.data.pagination.totalPages;
                    const requestedPage = page !== null ? page : currentPage;
                    if (requestedPage > totalPages && totalPages > 0) {
                        setCurrentPage(totalPages);
                        getData(totalPages, categoryFilter);
                    }
                }
                setSelectedItems([]);
                setSelectAll(false);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
                toast.error("Failed to fetch data");
            });
    }, [currentPage, itemsPerPage, activeTab]);

    useEffect(() => {
        getData();
    }, [itemsPerPage]);

    useEffect(() => {
        if (!loading) {
            getData();
        }
    }, [currentPage, activeTab]);

    useEffect(() => {
        const handlePopState = (event) => {
            if (visible) {
                event.preventDefault();
                setVisible(false);
                resetForm();
            }
        };

        if (visible) {
            // Push a new state when modal opens
            window.history.pushState({ modalOpen: true }, '');
            window.addEventListener('popstate', handlePopState);
        }

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [visible]);

    useEffect(() => {
        if (!loading && allCategories.length > 0 && activeTab === 'all') {
            setActiveTab(allCategories[0].title);
        }
    }, [allCategories, loading]);

    const handleTabClick = (categoryTitle) => {
        setActiveTab(categoryTitle);
        setCurrentPage(1);
        getData(1, categoryTitle);
    };

    const handleCategoryEdit = (category, e) => {
        e.stopPropagation(); // Prevent tab switch
        setEditingCategoryId(category.categoryId);
        setEditCategoryTitle(category.title);
        setOldCategoryTitle(category.title);
        setEditCategoryImagePreview(category.image);
        setEditCategoryImage(null);
        setCategoryEditModal(true);
    };

    const handleCategoryUpdate = async (e) => {
        e.preventDefault();

        if (!editCategoryTitle.trim()) {
            toast.error('Category title is required');
            return;
        }

        if (editCategoryTitle.length > 15) {
            setEditCategoryTitleError(true);
            toast.error('Category title must be 15 characters or less');
            return;
        }

        // NEW: Check if the edited title already exists (excluding the current category)
        if (editCategoryTitle.trim().toLowerCase() !== oldCategoryTitle.trim().toLowerCase()) {
            const categoryExists = allCategories.some(
                cat => cat.title.toLowerCase() === editCategoryTitle.trim().toLowerCase()
            );

            if (categoryExists) {
                toast.error('A category with this title already exists. Please choose a different title.');
                return;
            }
        }

        try {
            setIsEditingCategory(true);

            const formData = new FormData();
            formData.append('categoryTitle', editCategoryTitle);
            formData.append('oldCategoryTitle', oldCategoryTitle);
            formData.append('categoryId', editingCategoryId);

            if (editCategoryImage) {
                formData.append('categoryImage', editCategoryImage);
            }

            const response = await axios.patch(
                `https://api.lolcards.link/api/hotness/category/update/694a7015b92b4f5ba297cf65`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            toast.success(response.data.message || 'Category updated successfully');
            setCategoryEditModal(false);
            setEditingCategoryId(null);
            setEditCategoryTitle('');
            setEditCategoryImage(null);
            setEditCategoryImagePreview('');
            setActiveTab(editCategoryTitle);
            getData(currentPage, editCategoryTitle);

        } catch (err) {
            console.error('Error:', err);
            toast.error(err.response?.data?.message || "Failed to update category");
        } finally {
            setIsEditingCategory(false);
        }
    };

    // 4. ADD this function to handle edit category image change:
    const handleEditCategoryImageChange = async (event) => {
        const file = event.currentTarget.files[0];
        if (!file) return;

        try {
            const processedFile = await compressImage(file);
            const maxSizeInBytes = 5 * 1024 * 1024;

            if (processedFile.size > maxSizeInBytes) {
                toast.error(`${file.name} exceeds 5 MB`);
                return;
            }

            const previewUrl = URL.createObjectURL(processedFile);
            setEditCategoryImage(processedFile);
            setEditCategoryImagePreview(previewUrl);
        } catch (error) {
            toast.error(`Error processing ${file.name}`);
            console.error(error);
        }
    };


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

    const closeDeleteModal = () => {
        setDeleteModal({ isOpen: false, id: null, isBulk: false });
    };

    const clearAllFilters = () => {
        setSelectedItems([]);
        setSelectAll(false);
        setCurrentPage(1);
        getData(1);
        toast.info("All filters cleared");
    };


    const getUniqueCategories = () => {
        // Return categories from API if available, otherwise fallback to local calculation
        if (allCategories.length > 0) {
            return allCategories;
        }

        // Fallback for initial load or if API doesn't return categories
        const uniqueMap = new Map();
        data.forEach(item => {
            if (!uniqueMap.has(item.categoryTitle)) {
                uniqueMap.set(item.categoryTitle, {
                    title: item.categoryTitle,
                    image: item.categoryImage
                });
            }
        });
        return Array.from(uniqueMap.values());
    };

    const openDeleteModal = (id = null, isBulk = false) => {
        if (isBulk && selectedItems.length === 0) {
            toast.info("No items selected for deletion.");
            return;
        }
        setDeleteModal({ isOpen: true, id, isBulk });
    };

    const handleDeleteSelected = () => {
        setIsDeleting(true);

        const payload = {
            ids: selectedItems,
            TypeId: "6"
        };

        axios.post('https://api.lolcards.link/api/admin/deleteMultiple', payload)
            .then(() => {
                toast.success(`Successfully deleted ${selectedItems.length} items.`);
                setSelectedItems([]);
                setSelectAll(false);

                // Check if we deleted all items on the current page
                const remainingItemsOnPage = currentItems.length - selectedItems.length;

                // If no items remain on current page and we're not on page 1, go to previous page
                if (remainingItemsOnPage === 0 && currentPage > 1) {
                    const newPage = currentPage - 1;
                    setCurrentPage(newPage);
                    getData(newPage, activeTab);
                } else {
                    // Otherwise, just refresh current page
                    getData(currentPage, activeTab);
                }
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

    const handleDelete = (categoryId) => {
        if (window.confirm("Are you sure you want to delete this Hotness Category?")) {
            axios.delete(`https://api.lolcards.link/api/hotness/category/delete/${categoryId}`)
                .then((res) => {
                    if (data.length === 1 && currentPage > 1) {
                        setCurrentPage(currentPage - 1);
                        getData(currentPage - 1, activeTab);
                    } else {
                        getData(currentPage, activeTab);
                    }
                    toast.success(res.data.message);
                })
                .catch((err) => {
                    console.error(err);
                    toast.error("An error occurred. Please try again.");
                });
        }
    };

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
                resetForm();
            }
        } else {
            resetForm();
        }
        setVisible(!visible);
    };

    const resetForm = () => {
        setId(undefined);
        setCategoryMode('existing');
        setSelectedExistingCategory('');
        setCategoryTitle('');
        setSubCatergoryTitle('');
        setCategoryImageFile(null);
        setSubCatergoryImageFile(null);
        setCategoryImagePreview('');
        setSubCatergoryImagePreview('');
        // **NEW: Reset hand image fields**
        setCardImageFile(null);
        setCardImagePreview('');
        setSelectedCardImage('');
        setRemoveCardImage(false); // Reset removal flag
    };

    const handleCategoryModeChange = (mode) => {
        setCategoryMode(mode);
        if (mode === 'existing') {
            // Clear new category fields
            setCategoryTitle('');
            setCategoryImageFile(null);
            setCategoryImagePreview('');
            setCategoryOnlyMode(false);
        } else {
            // Clear existing category selection
            setSelectedExistingCategory('');
            setCategoryOnlyMode(false);
        }
    };

    const handleExistingCategoryChange = (e) => {
        const selectedTitle = e.target.value;
        setSelectedExistingCategory(selectedTitle);

        // Find the category data
        const category = getUniqueCategories().find(cat => cat.title === selectedTitle);
        if (category) {
            setCategoryImagePreview(category.image);

            // Check if category has 8 or more subcategories
            const categoryData = allCategories.find(cat => cat.title === selectedTitle);
            if (categoryData && categoryData.count >= 8) {
                toast.error(`Maximum 8 subcategories allowed per category. "${selectedTitle}" already has ${categoryData.count} subcategories.`);
            }
        }
    };

    const isCategoryFull = () => {
        if (id || categoryMode === 'new') return false;

        if (!selectedExistingCategory) return false;

        const categoryData = allCategories.find(
            cat => cat.title === selectedExistingCategory
        );

        return categoryData && categoryData.count >= 8;
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


    const handleFileChange = async (event, type) => {
        const file = event.currentTarget.files[0];
        if (!file) return;

        try {
            const processedFile = await compressImage(file);
            const maxSizeInBytes = 5 * 1024 * 1024;

            if (processedFile.size > maxSizeInBytes) {
                toast.error(`${file.name} exceeds 5 MB`);
                return;
            }

            const previewUrl = URL.createObjectURL(processedFile);

            if (type === 'category') {
                setCategoryImageFile(processedFile);
                setCategoryImagePreview(previewUrl);
            } else if (type === 'subCategory') {
                setSubCatergoryImageFile(processedFile);
                setSubCatergoryImagePreview(previewUrl);
            } else if (type === 'cardImage') {
                // **NEW: Handle hand image**
                setCardImageFile(processedFile);
                setCardImagePreview(previewUrl);
                setSelectedCardImage(''); // Clear existing selection
            }
        } catch (error) {
            toast.error(`Error processing ${file.name}`);
            console.error(error);
        }
    };

    const onDrop = useCallback((e, type) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging({ category: false, subCategory: false, cardImage: false });

        if (isSubmitting) return;

        const files = Array.from(e.dataTransfer.files);
        const imageFile = files.find(file => file.type.startsWith('image/'));

        if (!imageFile) {
            toast.error('Please upload an image file');
            return;
        }

        const syntheticEvent = {
            currentTarget: { files: [imageFile] }
        };
        handleFileChange(syntheticEvent, type);
    }, [isSubmitting]);

    const onDragOver = useCallback((e, type) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isSubmitting) {
            setIsDragging(prev => ({ ...prev, [type]: true }));
        }
    }, [isSubmitting]);

    const onDragLeave = useCallback((e, type) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(prev => ({ ...prev, [type]: false }));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting) return;

        // Reset error states
        setCategoryTitleError(false);
        setSubCategoryTitleError(false);

        // NEW: If category only mode, validate only category fields
        if (categoryOnlyMode && categoryMode === 'new') {
            if (!categoryTitle.trim()) {
                toast.error('Category Title is required');
                return;
            }

            if (categoryTitle.length > 15) {
                setCategoryTitleError(true);
                toast.error('Category Title must be 15 characters or less');
                return;
            }

            const categoryExists = getUniqueCategories().some(
                cat => cat.title.toLowerCase() === categoryTitle.trim().toLowerCase()
            );

            if (categoryExists) {
                toast.error('This category already exists.');
                return;
            }

            if (!categoryImageFile) {
                toast.error('Category Image is required');
                return;
            }

            // Create category only
            try {
                setIsSubmitting(true);

                const formData = new FormData();
                const newCategoryId = allCategories.length + 1;

                formData.append('categoryId', newCategoryId);
                formData.append('categoryTitle', categoryTitle);
                formData.append('categoryImage', categoryImageFile);
                formData.append('categoryOnly', 'true'); // Flag to indicate category-only creation

                const response = await axios.post(
                    'https://api.lolcards.link/api/hotness/category/create',
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );

                toast.success(response.data.message || 'Category created successfully');
                resetForm();
                setVisible(false);

                setCategoryOnlyMode(false);
                // Switch to the new category tab
                setActiveTab(categoryTitle);
                setCurrentPage(1);
                getData(1, categoryTitle);

            } catch (err) {
                console.error('Error:', err);
                toast.error(err.response?.data?.message || "Failed to create category");
            } finally {
                setIsSubmitting(false);
            }

            return; // Exit early for category-only submission
        }

        // Validate sub-category title (for normal mode)
        if (!subCatergoryTitle.trim()) {
            toast.error('Sub-Category Title is required');
            return;
        }

        if (subCatergoryTitle.length > 15) {
            setSubCategoryTitleError(true);
            toast.error('Sub-Category Title must be 15 characters or less');
            return;
        }

        // Validate category based on mode
        if (categoryMode === 'new') {
            if (!categoryTitle.trim()) {
                toast.error('Category Title is required');
                return;
            }

            if (categoryTitle.length > 15) {
                setCategoryTitleError(true);
                toast.error('Category Title must be 15 characters or less');
                return;
            }

            if (!id) {
                const categoryExists = getUniqueCategories().some(
                    cat => cat.title.toLowerCase() === categoryTitle.trim().toLowerCase()
                );

                if (categoryExists) {
                    toast.error('This category already exists.');
                    return;
                }
            }

            if (!id && !categoryImageFile) {
                toast.error('Category Image is required');
                return;
            }
        } else {
            if (!selectedExistingCategory && !id) {
                toast.error('Please select an existing category');
                return;
            }
        }

        if (!id) {
            if (!subCatergoryImageFile) {
                toast.error('Sub-Category Image is required');
                return;
            }
            // if (!cardImageFile && !selectedCardImage) {
            //     toast.error('Hand Image is required');
            //     return;
            // }
        }

        try {
            setIsSubmitting(true);

            const formData = new FormData();
            formData.append('subCatergoryTitle', subCatergoryTitle);

            let targetCategoryTitle = '';

            if (categoryMode === 'new') {
                if (!id) {
                    const newCategoryId = allCategories.length + 1;
                    formData.append('categoryId', newCategoryId);
                }

                formData.append('categoryTitle', categoryTitle);
                targetCategoryTitle = categoryTitle;

                if (categoryImageFile) {
                    formData.append('categoryImage', categoryImageFile);
                }
            } else {
                const category = getUniqueCategories().find(cat => cat.title === selectedExistingCategory);

                if (!id) {
                    formData.append('categoryTitle', selectedExistingCategory);
                    formData.append('categoryId', category.categoryId);
                    formData.append('categoryImage2', categoryImagePreview);
                    targetCategoryTitle = selectedExistingCategory;
                }
            }

            if (subCatergoryImageFile) {
                formData.append('subCatergoryImage', subCatergoryImageFile);
            }

            if (cardImageFile) {
                formData.append('cardImage', cardImageFile);
            } else if (selectedCardImage) {
                formData.append('cardImage2', selectedCardImage);
            } else if (id && removeCardImage) {
                // Explicitly tell backend to remove the image
                formData.append('removeCardImage', 'true');
            }

            if (id) {
                const response = await axios.patch(
                    `https://api.lolcards.link/api/hotness/category/update/${id}`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
                toast.success(response.data.message || 'Successfully updated');
                getData(currentPage, activeTab);
            } else {
                const response = await axios.post(
                    'https://api.lolcards.link/api/hotness/category/create',
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
                toast.success(response.data.message || 'Successfully created');

                setActiveTab(targetCategoryTitle);
                setCategoryOnlyMode(false);
                setCurrentPage(1);
                getData(1, targetCategoryTitle);
            }

            resetForm();
            setVisible(false);

        } catch (err) {
            console.error('Error:', err);
            toast.error(err.response?.data?.message || "An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (category) => {
        setCategoryTitle(category.categoryTitle);
        setSubCatergoryTitle(category.subCatergoryTitle);
        setCategoryImagePreview(category.categoryImage);
        setSubCatergoryImagePreview(category.subCatergoryImage);
        // **NEW: Set hand image**
        if (category.cardImage) {
            setSelectedCardImage(category.cardImage);
            setCardImagePreview(category.cardImage);
        }
        setId(category._id);
        setRemoveCardImage(false); // Reset removal flag
        setVisible(true);
    };

    const handleCopyToClipboard = (url) => {
        if (url) {
            navigator.clipboard.writeText(url)
                .then(() => {
                    toast.success("Image URL copied to clipboard!");
                })
                .catch((error) => {
                    console.error("Failed to copy: ", error);
                });
        }
    };

    if (loading) return (
        <div style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="border p-4 flex items-center space-x-2 rounded-md">
                <div className="w-10 h-10 border-2 border-gray-300 rounded-full animate-spin" style={{ borderTop: "2px solid #FA4B56" }}></div>
            </div>
        </div>
    );

    return (
        <div className="p-6">
            <PageBreadcrumb pageTitle="Hotness Category" />

            <div className="space-y-6">
                <div
                    className={`rounded-2xl overflow-auto border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]`}
                    style={{ minHeight: "600px" }}
                >
                    {/* Card Header */}
                    <div className="px-6 pt-5">

                        <div className="flex justify-between items-center px-4 py-3 mt-4 dark:border-gray-800 border-gray-200">

                            <div className="flex gap-4">
                                {/* NEW: Delete Selected Button */}
                                {selectedItems.length > 0 && (
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
                                )}

                                {selectedItems.length > 0 && (
                                    <Button
                                        onClick={clearAllFilters}
                                        variant="outline-secondary"
                                        className="d-flex align-items-center gap-2 py-1 border-0 bg-transparent"
                                        style={{ fontSize: "14px", color: "#f13838" }}
                                    >
                                        CLEAR ALL
                                    </Button>
                                )}

                            </div>

                            <Button
                                onClick={() => toggleModal('add')}
                                className="rounded-md border-0 shadow-md px-4 py-2 text-white"
                                style={{ background: "#FA4B56" }}
                            >
                                <FontAwesomeIcon icon={faPlus} className='pe-2' /> Add Category
                            </Button>
                        </div>
                    </div>


                    <div className="px-6 pt-4">
                        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 flex-wrap">
                            {allCategories.length > 0 ? (
                                allCategories.map((category, idx) => (
                                    <div key={idx} className="relative group">
                                        <button
                                            onClick={() => handleTabClick(category.title)}
                                            className={`px-4 py-2 rounded-t-lg font-medium transition-all whitespace-nowrap flex-shrink-0 flex items-center gap-2 ${activeTab === category.title
                                                ? 'bg-[#FA4B56] text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                                                <img
                                                    src={category.image}
                                                    alt={category.title}
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                            <span>{category.title}</span>
                                            {category.count && (
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-xs ${activeTab === category.title
                                                        ? 'bg-white text-[#FA4B56]'
                                                        : 'bg-gray-200'
                                                        }`}
                                                >
                                                    {category.count}
                                                </span>
                                            )}

                                            {/* Edit button - appears on hover */}
                                            <button
                                                onClick={(e) => handleCategoryEdit(category, e)}
                                                className=" bg-white text-[#FA4B56] w-6 h-6 rounded-full flex items-center justify-center"
                                                title="Edit Category"
                                            >
                                                <FontAwesomeIcon icon={faEdit} className="text-xs" />
                                            </button>
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="w-full text-center py-4 text-gray-500">
                                    No categories available
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="p-4 pt-0 sm:p-6 sm:pt-0 overflow-auto">
                        <div className="space-y-6 rounded-lg border">
                            <Table>
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <TableRow>
                                        <TableCell isHeader className="py-7 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700 w-10">
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
                                        <TableCell isHeader className="py-7 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">SubCatergory Title</TableCell>
                                        <TableCell isHeader className="py-7 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">SubCatergory Image</TableCell>
                                        <TableCell isHeader className="py-7 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Hand Image</TableCell>
                                        <TableCell isHeader className="py-7 font-medium text-gray-500 px-2 border-r border-gray-200 dark:border-gray-700">Actions</TableCell>
                                    </TableRow>
                                </TableHeader>

                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-center">
                                    {currentItems && currentItems.length > 0 ? (
                                        currentItems.map((cardbg, index) => (
                                            <TableRow key={cardbg._id}>
                                                <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700">
                                                    <div className="flex items-center justify-center">
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                                                            checked={selectedItems.includes(cardbg._id)}
                                                            onChange={() => handleSelectItem(cardbg._id)}
                                                        />
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">
                                                    {indexOfFirstItem + index + 1}
                                                </TableCell>

                                                <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700 dark:text-gray-400">{cardbg.subCatergoryTitle}</TableCell>

                                                <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700 relative group">
                                                    <div className="relative w-[70px] h-[70px] mx-auto">
                                                        {/* Loading placeholder - shown while image loads */}
                                                        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
                                                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                            </svg>
                                                        </div>

                                                        {/* Actual cardbg image with onLoad handler */}
                                                        <img
                                                            src={cardbg.subCatergoryImage}
                                                            alt="Category"
                                                            className="w-full h-full object-contain bg-white cursor-pointer relative z-10"
                                                            onLoad={(e) => {
                                                                e.target.style.opacity = 1;
                                                                e.target.previousSibling.style.display = 'none';
                                                            }}
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
                                                                onClick={() => handleCopyToClipboard(cardbg.subCatergoryImage)}
                                                                className="text-white hover:text-blue-300 transition-colors"
                                                                title="Copy URL"
                                                            >
                                                                <FontAwesomeIcon icon={faCopy} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </TableCell>


                                                <TableCell className="py-3 px-2 border-r border-gray-200 dark:border-gray-700 relative group">
                                                    <div className="relative w-[70px] h-[70px] mx-auto">
                                                        {/* Actual cardbg image with onLoad handler */}
                                                        {cardbg.cardImage ? (
                                                            <img
                                                                src={cardbg.cardImage}
                                                                alt="Category"
                                                                className="w-full h-full object-contain bg-white cursor-pointer relative z-10"
                                                                onLoad={(e) => {
                                                                    e.target.style.opacity = 1;
                                                                    if (e.target.previousSibling) {
                                                                        e.target.previousSibling.style.display = 'none';
                                                                    }
                                                                }}
                                                                style={{ opacity: 0 }}
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full d-flex align-items-center justify-content-center bg-light">
                                                                -
                                                            </div>
                                                        )}

                                                        <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity duration-200 z-20">
                                                            <button
                                                                onClick={() => handleShowPreview(index)}
                                                                className="text-white hover:text-blue-300 transition-colors"
                                                                title="Preview Image"
                                                            >
                                                                <FontAwesomeIcon icon={faEye} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleCopyToClipboard(cardbg.cardImage)}
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
                    <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => !isSubmitting && toggleModal()}></div>
                    <div className="relative bg-white rounded-lg w-full max-w-5xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b">
                            <h3 className="text-xl font-semibold">
                                {id ? "Edit Hotness Category" : "Add Hotness Category"}
                            </h3>
                        </div>

                        <div className="px-6 py-4">
                            <form onSubmit={handleSubmit}>
                                {!id && (
                                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                        <label className="block font-medium mb-3">Category Selection</label>
                                        <div className="flex gap-6">
                                            <label className="flex items-center cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="categoryMode"
                                                    value="new"
                                                    checked={categoryMode === 'new'}
                                                    onChange={(e) => {
                                                        handleCategoryModeChange('new');
                                                        setCategoryOnlyMode(e.target.checked);
                                                    }} disabled={isSubmitting}
                                                    className="mr-2"
                                                />
                                                <span>Add New Category</span>
                                            </label>
                                            <label className="flex items-center cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="categoryMode"
                                                    value="existing"
                                                    checked={categoryMode === 'existing'}
                                                    onChange={() => handleCategoryModeChange('existing')}
                                                    disabled={isSubmitting}
                                                    className="mr-2"
                                                />
                                                <span>Select Existing Category</span>
                                            </label>
                                        </div>

                                    </div>
                                )}

                                {!id && (
                                    <>
                                        {categoryMode === 'new' ? (
                                            <>
                                                {/* Category Section */}
                                                <div className="mb-6">
                                                    <label className="block font-medium mb-3">
                                                        Category <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                        <div className="space-y-2">
                                                            <label className="block text-sm font-medium text-gray-700">Title</label>
                                                            <input
                                                                type="text"
                                                                value={categoryTitle}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    if (value.length <= 15) {
                                                                        setCategoryTitle(value);
                                                                        setCategoryTitleError(false);
                                                                    } else {
                                                                        setCategoryTitleError(true);
                                                                    }
                                                                }}
                                                                disabled={isSubmitting}
                                                                className={`w-full p-2 border rounded h-[120px] ${categoryTitleError ? 'border-red-500 border-2' : ''
                                                                    }`}
                                                                placeholder="Enter category title (max 15 chars)"
                                                                maxLength={15}
                                                            />
                                                            {categoryTitleError && (
                                                                <p className="text-red-500 text-xs mt-1">Maximum 15 characters allowed</p>
                                                            )}
                                                            <p className="text-gray-500 text-xs mt-1">
                                                                {categoryTitle.length}/15 characters
                                                            </p>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <label className="block text-sm font-medium text-gray-700">Image</label>
                                                            <input
                                                                type="file"
                                                                ref={categoryFileInputRef}
                                                                onChange={(e) => handleFileChange(e, 'category')}
                                                                disabled={isSubmitting}
                                                                className="hidden"
                                                                accept="image/*"
                                                            />
                                                            <div
                                                                onClick={() => !isSubmitting && categoryFileInputRef.current?.click()}
                                                                onDragOver={(e) => onDragOver(e, 'category')}
                                                                onDragLeave={(e) => onDragLeave(e, 'category')}
                                                                onDrop={(e) => onDrop(e, 'category')}
                                                                className={`flex flex-col items-center justify-center p-4 border-2 ${isDragging.category ? 'border-purple-600 bg-purple-50' : 'border-dashed border-purple-500'
                                                                    } rounded-lg cursor-pointer transition-all h-[120px]`}
                                                            >
                                                                {categoryImagePreview ? (
                                                                    <img src={categoryImagePreview} alt="Category Preview" className="h-full object-contain" />
                                                                ) : (
                                                                    <>
                                                                        <FontAwesomeIcon icon={faArrowUpFromBracket} className="text-xl mb-1 text-gray-400" />
                                                                        <span className="text-gray-500 text-sm text-center">Click or drag to upload</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                {/* Existing Category Dropdown */}
                                                <div className="mb-6">
                                                    <label className="block font-medium mb-2">
                                                        Select Existing Category <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                        <div>
                                                            <select
                                                                value={selectedExistingCategory}
                                                                onChange={handleExistingCategoryChange}
                                                                disabled={isSubmitting}
                                                                className="w-full p-2 border rounded"
                                                            >
                                                                <option value="">-- Select Category --</option>
                                                                {getUniqueCategories().map((cat, idx) => {
                                                                    const categoryData = allCategories.find(c => c.title === cat.title);
                                                                    const isFull = categoryData && categoryData.count >= 8;
                                                                    return (
                                                                        <option
                                                                            key={idx}
                                                                            value={cat.title}
                                                                            disabled={isFull}
                                                                        >
                                                                            {cat.title} {isFull ? '(Full - 8/8)' : categoryData ? `(${categoryData.count}/8)` : ''}
                                                                        </option>
                                                                    );
                                                                })}
                                                            </select>
                                                        </div>

                                                        {categoryImagePreview && (
                                                            <div className="flex items-center justify-center border rounded p-2 bg-gray-50">
                                                                <img src={categoryImagePreview} alt="Category" className="h-[100px] object-contain" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}

                                {/* Sub-Category Section - Title and Image in One Row */}
                                {!categoryOnlyMode && (
                                    <>
                                        <div className="mb-6">
                                            <label className="block font-medium mb-3">
                                                Sub-Category <span className="text-red-500">*</span>
                                            </label>
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                {/* Sub-Category Title */}
                                                <div className="space-y-2">
                                                    <label className="block text-sm font-medium text-gray-700">Title</label>
                                                    <input
                                                        type="text"
                                                        value={subCatergoryTitle}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            if (value.length <= 15) {
                                                                setSubCatergoryTitle(value);
                                                                setSubCategoryTitleError(false);
                                                            } else {
                                                                setSubCategoryTitleError(true);
                                                            }
                                                        }}
                                                        disabled={isSubmitting || isCategoryFull()}
                                                        placeholder="Enter sub-category title (max 15 chars)"
                                                        className={`w-full h-[120px] p-3 border rounded flex items-center ${subCategoryTitleError ? 'border-red-500 border-2' : ''
                                                            } ${isCategoryFull() ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                                        maxLength={15}
                                                    />
                                                    {subCategoryTitleError && (
                                                        <p className="text-red-500 text-xs mt-1">Maximum 15 characters allowed</p>
                                                    )}
                                                    <p className="text-gray-500 text-xs mt-1">
                                                        {subCatergoryTitle.length}/15 characters
                                                    </p>

                                                </div>

                                                {/* Sub-Category Image Upload and Preview */}
                                                <div className="space-y-2">
                                                    <label className="block text-sm font-medium text-gray-700">Image</label>
                                                    <input
                                                        type="file"
                                                        ref={subCategoryFileInputRef}
                                                        onChange={(e) => handleFileChange(e, 'subCategory')}
                                                        disabled={isSubmitting}
                                                        className="hidden"
                                                        accept="image/*"
                                                    />
                                                    <div
                                                        onClick={() => !isSubmitting && subCategoryFileInputRef.current?.click()}
                                                        onDragOver={(e) => onDragOver(e, 'subCategory')}
                                                        onDragLeave={(e) => onDragLeave(e, 'subCategory')}
                                                        onDrop={(e) => onDrop(e, 'subCategory')}
                                                        className={`flex flex-col items-center justify-center p-4 border-2 ${isDragging.subCategory ? 'border-purple-600 bg-purple-50' : 'border-dashed border-purple-500'
                                                            } rounded-lg cursor-pointer transition-all h-[120px]`}
                                                    >
                                                        {subCatergoryImagePreview ? (
                                                            <img src={subCatergoryImagePreview} alt="Sub-Category Preview" className="h-full object-contain" />
                                                        ) : (
                                                            <>
                                                                <FontAwesomeIcon icon={faArrowUpFromBracket} className="text-xl mb-1 text-gray-400" />
                                                                <span className="text-gray-500 text-sm text-center">Click or drag to upload</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card Image Section */}
                                        <div className="mb-6">
                                            <label className="block font-medium mb-3">
                                                Hand Image
                                            </label>

                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                {/* Upload New Hand Image */}
                                                <div className="space-y-3">
                                                    <h4 className="text-sm font-medium text-gray-700">Upload New Image</h4>
                                                    <input
                                                        type="file"
                                                        ref={cardImageFileInputRef}
                                                        onChange={(e) => handleFileChange(e, 'cardImage')}
                                                        disabled={isSubmitting}
                                                        className="hidden"
                                                        accept="image/*"
                                                    />
                                                    <div
                                                        onClick={() => !isSubmitting && cardImageFileInputRef.current?.click()}
                                                        onDragOver={(e) => onDragOver(e, 'cardImage')}
                                                        onDragLeave={(e) => onDragLeave(e, 'cardImage')}
                                                        onDrop={(e) => onDrop(e, 'cardImage')}
                                                        className={`flex flex-col items-center justify-center p-8 border-2 rounded-lg cursor-pointer transition-all min-h-[200px] ${isDragging.cardImage
                                                            ? 'border-purple-600 bg-purple-50'
                                                            : cardImagePreview && !selectedCardImage
                                                                ? 'border-solid border-purple-500'
                                                                : 'border-dashed border-gray-300 hover:border-purple-400'
                                                            }`}
                                                    >
                                                        {cardImagePreview && !selectedCardImage ? (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <img
                                                                    src={cardImagePreview}
                                                                    alt="Card Preview"
                                                                    className="max-w-full max-h-[180px] object-contain rounded"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <FontAwesomeIcon
                                                                    icon={faArrowUpFromBracket}
                                                                    className="text-3xl mb-3 text-gray-400"
                                                                />
                                                                <span className="text-gray-600 text-center text-sm">
                                                                    Click or drag to upload<br />hand image
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Select Existing Hand Image */}
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-sm font-medium text-gray-700">Select Existing Image</h4>
                                                        {(selectedCardImage || cardImagePreview) && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedCardImage('');
                                                                    setCardImageFile(null);
                                                                    setCardImagePreview('');
                                                                    setRemoveCardImage(true); // Mark for removal
                                                                }}
                                                                className="text-xs text-red-500 hover:text-red-700 underline"
                                                                disabled={isSubmitting}
                                                            >
                                                                Remove Selection
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="border-2 border-gray-300 rounded-lg p-4 min-h-[200px] max-h-[200px] overflow-y-auto bg-gray-50">
                                                        {existingCardImages && existingCardImages.length > 0 ? (
                                                            <div className="grid grid-cols-5 gap-3">
                                                                {existingCardImages.map((imageUrl, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        onClick={() => {
                                                                            if (!isSubmitting) {
                                                                                setSelectedCardImage(imageUrl);
                                                                                setCardImageFile(null);
                                                                                setCardImagePreview(null);
                                                                            }
                                                                        }}
                                                                        className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${selectedCardImage === imageUrl
                                                                            ? 'border-purple-500 ring-2 ring-purple-300'
                                                                            : 'border-gray-200 hover:border-purple-300'
                                                                            }`}
                                                                    >
                                                                        <img
                                                                            src={imageUrl}
                                                                            alt={`Card ${idx + 1}`}
                                                                            className="w-full h-full object-contain bg-white p-1"
                                                                        />
                                                                        {selectedCardImage === imageUrl && (
                                                                            <div className="absolute top-0 right-0 p-1">
                                                                                <FontAwesomeIcon
                                                                                    icon={faCheckCircle}
                                                                                    className="text-md text-purple-500"
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                                                                <FontAwesomeIcon icon={faFileImage} className="mr-2" />
                                                                No existing images
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="flex gap-4 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            toggleModal();
                                            setCategoryOnlyMode(false);
                                        }}
                                        disabled={isSubmitting}
                                        className="w-1/2 py-2 px-4 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-1/2 py-2 px-4 text-white rounded-lg disabled:opacity-50"
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

            {deleteModal.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999]">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4 shadow-lg">

                        <h2 className="text-xl font-semibold text-gray-800 mb-3">
                            {deleteModal.isBulk ? 'Delete Selected Items' : 'Delete Emotion CardBg'}
                        </h2>

                        <p className="text-gray-700 mb-6">
                            {deleteModal.isBulk
                                ? `Are you sure you want to delete ${selectedItems.length} selected items?`
                                : 'Are you sure you want to delete this Emotion CardBg?'
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

            {categoryEditModal && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center">
                    <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => !isEditingCategory && setCategoryEditModal(false)}></div>
                    <div className="relative bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b">
                            <h3 className="text-xl font-semibold">Edit Category</h3>
                        </div>

                        <div className="px-6 py-4">
                            <form onSubmit={handleCategoryUpdate}>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                    {/* Category Title */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Category Title <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={editCategoryTitle}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value.length <= 15) {
                                                    setEditCategoryTitle(value);
                                                    setEditCategoryTitleError(false);
                                                } else {
                                                    setEditCategoryTitleError(true);
                                                }
                                            }}
                                            disabled={isEditingCategory}
                                            className={`w-full p-3 border rounded h-[120px] ${editCategoryTitleError ? 'border-red-500 border-2' : ''
                                                }`}
                                            placeholder="Enter category title (max 15 chars)"
                                            maxLength={15}
                                        />
                                        {editCategoryTitleError && (
                                            <p className="text-red-500 text-xs mt-1">Maximum 15 characters allowed</p>
                                        )}
                                        <p className="text-gray-500 text-xs mt-1">
                                            {editCategoryTitle.length}/15 characters
                                        </p>
                                    </div>

                                    {/* Category Image */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Category Image</label>
                                        <input
                                            type="file"
                                            ref={editCategoryFileInputRef}
                                            onChange={handleEditCategoryImageChange}
                                            disabled={isEditingCategory}
                                            className="hidden"
                                            accept="image/*"
                                        />
                                        <div
                                            onClick={() => !isEditingCategory && editCategoryFileInputRef.current?.click()}
                                            className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-purple-500 rounded-lg cursor-pointer transition-all h-[120px] hover:border-purple-600"
                                        >
                                            {editCategoryImagePreview ? (
                                                <img
                                                    src={editCategoryImagePreview}
                                                    alt="Category Preview"
                                                    className="h-full object-contain"
                                                />
                                            ) : (
                                                <>
                                                    <FontAwesomeIcon icon={faArrowUpFromBracket} className="text-xl mb-1 text-gray-400" />
                                                    <span className="text-gray-500 text-sm text-center">Click to upload new image</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setCategoryEditModal(false)}
                                        disabled={isEditingCategory}
                                        className="w-1/2 py-2 px-4 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isEditingCategory}
                                        className="w-1/2 py-2 px-4 text-white rounded-lg disabled:opacity-50"
                                        style={{ backgroundColor: "#FA4B56" }}
                                    >
                                        {isEditingCategory ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                                        ) : (
                                            'Update Category'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}


            <ToastContainer position="top-center" className="!z-[99999]" />


            <ImagePreviewModal2
                show={showPreview}
                onHide={() => setShowPreview(false)}
                images={previewImages}
                currentIndex={previewIndex}
                onNavigate={(newIndex) => {
                    if (newIndex >= 0 && newIndex < currentItems.length) {
                        handleShowPreview(newIndex);
                    }
                }}
                totalImages={currentItems.length}
            />
        </div>
    );
};

export default HotnessCategory;