import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faTimes } from '@fortawesome/free-solid-svg-icons';
import CardPreview from './Cardpreview';
import CardPreviewQue4 from './CardPreviewQue4';
import CardPreviewQue6 from './CardPreviewQue6';
import CardPreviewQue7 from './CardPreviewQue7';
import CardPreviewQue9 from './CardPreviewQue9';
import CardPreviewQue11 from './CardPreviewQue11';

const ImagePreviewModal = ({ show, onHide, images, currentIndex, onNavigate, totalImages, currentPage, itemsPerPage, type }) => {

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (!show) return;
            if (e.key === 'ArrowLeft') {
                onNavigate(currentIndex - 1, 'prev');
            } else if (e.key === 'ArrowRight') {
                onNavigate(currentIndex + 1, 'next');
            } else if (e.key === 'Escape') {
                onHide();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [show, currentIndex, onNavigate, onHide]);

    if (!show || !images.length) return null;

    const renderCard = () => {
        switch (type) {
            case "3":
                return <CardPreview image={images[currentIndex]} />;
            case "4":
                return <CardPreviewQue4 image={images[currentIndex]} />;
            case "6":
                return null;
            case "7":
                return <CardPreviewQue7 image={images[currentIndex]} />;
            case "9":
                return <CardPreviewQue9 image={images[currentIndex]} />;
            case "11":
                return <CardPreviewQue11 image={images[currentIndex]} />;
            default:
                return null;
        }
    };

    const actualIndex = (currentPage - 1) * itemsPerPage + currentIndex + 1;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-99999">
            <div className={`relative flex items-center justify-center h-full ${type === "6" ? "w-[950px]" : "w-[500px]"}`}>

                {/* Close Button */}
                <button
                    onClick={onHide}
                    className="absolute top-4 right-4 bg-gray-800 text-white pt-1 rounded-full focus:outline-none hover:bg-white hover:text-black h-10 w-10 z-999"
                >
                    <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                </button>

                {/* Image Counter */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 z-999">
                    <div className="bg-gray-800 text-white px-4 py-2 rounded-full shadow-lg">
                        <span className="font-medium">{actualIndex} of {totalImages}</span>
                    </div>
                </div>

                {/* Type 6: Side-by-side layout */}
                {type === "6" ? (
                    <div className="flex items-center justify-center gap-6 w-full h-full">
                        {/* Full Card (layoutMode = false) */}
                        <div className="relative w-[450px] h-full flex flex-col items-center justify-center">
                            <div className="relative w-full flex-1 flex items-center justify-center">
                                <CardPreviewQue6 image={images[currentIndex]} layoutMode={false} />
                            </div>
                        </div>

                        {/* Compact Card (layoutMode = true) */}
                        <div className="relative w-[450px] h-full flex flex-col items-center justify-center">
                            <div className="relative w-full flex-1 flex items-center justify-center">
                                <CardPreviewQue6 image={images[currentIndex]} layoutMode={true} />
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Default: single card or image */
                    <div className="relative w-full h-full flex items-center justify-center">
                        {!type && (
                            <img
                                src={images[currentIndex]}
                                alt="Preview"
                                className="max-w-full max-h-full object-contain rounded-2xl"
                            />
                        )}
                        {renderCard()}
                    </div>
                )}

                {/* Left Navigation */}
                {(currentIndex > 0 || currentPage > 1) && (
                    <button
                        onClick={() => onNavigate(currentIndex - 1, 'prev')}
                        className="absolute left-[-50px] top-1/2 transform -translate-y-1/2 bg-white text-gray-700 pt-1 rounded-full shadow-lg hover:bg-gray-200 h-10 w-10 text-center z-999"
                    >
                        <FontAwesomeIcon icon={faChevronLeft} className="w-5 h-5" />
                    </button>
                )}

                {/* Right Navigation */}
                {actualIndex < totalImages && (
                    <button
                        onClick={() => onNavigate(currentIndex + 1, 'next')}
                        className="absolute right-[-50px] top-1/2 transform -translate-y-1/2 bg-white text-gray-700 pt-1 rounded-full shadow-lg hover:bg-gray-200 h-10 w-10 text-center z-999"
                    >
                        <FontAwesomeIcon icon={faChevronRight} className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default ImagePreviewModal;