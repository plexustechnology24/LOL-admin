import React, { useState, useEffect, useRef } from 'react';

/**
 * CountryStateCityDropdown Component
 * 
 * A dropdown with search functionality that:
 * - Shows recently selected values at the top
 * - Stores recent selections in sessionStorage
 * - Supports country, state, and city selection
 * - Matches the existing design system
 */

const CountryStateCityDropdown = ({
    label,
    type = 'country', // 'country', 'state', or 'city'
    value,
    searchValue,
    onSearchChange,
    onChange,
    options = [],
    recentOptions = [],
    disabled = false,
    loading = false,
    placeholder = 'Search...',
    required = false,
    onRemove = null,
    storageKey = 'recentSelections',
    maxRecent = 5,
    contextInfo = '' // For showing "(in CountryName)" for state/city
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter options based on search
    const getFilteredOptions = () => {
        if (!searchValue.trim()) return options;
        return options.filter(option => {
            const optionName = typeof option === 'string' ? option : (option.name || option.state_name);
            return optionName.toLowerCase().includes(searchValue.toLowerCase());
        });
    };

    const filteredOptions = getFilteredOptions();
    const showRecent = recentOptions.length > 0 && !searchValue.trim();

    // Handle selection
    const handleSelect = (selectedOption) => {
        // Handle both string and object options
        const selectedValue = typeof selectedOption === 'string' 
            ? selectedOption 
            : (selectedOption.name || selectedOption.state_name);
        
        onChange(selectedValue);
        setIsOpen(false);
        onSearchChange('');
    };

    return (
        <div className="mb-4" ref={dropdownRef}>
            <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">
                {label}
                {contextInfo && (
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        {contextInfo}
                    </span>
                )}
                {required && <span className="text-red-500 pl-2 font-normal text-lg">*</span>}
            </label>

            <div className="relative">
                {/* Selected Value Display / Search Input */}
                <div className="relative">
                    <input
                        type="text"
                        className={`w-full py-2 px-3 border ${
                            isOpen ? 'rounded-t border-gray-300' : 'rounded border-gray-300'
                        } dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:border-[#FA5054] transition-colors ${
                            disabled ? 'bg-gray-100 dark:bg-gray-900 cursor-not-allowed' : ''
                        }`}
                        placeholder={value || placeholder}
                        value={isOpen ? searchValue : value}
                        onChange={(e) => {
                            onSearchChange(e.target.value);
                            if (!isOpen) setIsOpen(true);
                        }}
                        onFocus={() => setIsOpen(true)}
                        disabled={disabled || loading}
                        autoComplete="off"
                    />

                    {/* Loading Spinner */}
                    {loading && (
                        <div className="absolute right-10 top-1/2 -translate-y-1/2">
                            <div className="w-4 h-4 border-2 border-[#FA5054] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}

                    {/* Remove Button */}
                    {value && onRemove && !disabled && !loading && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove();
                                setIsOpen(false);
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Dropdown Menu */}
                {isOpen && !disabled && !loading && (
                    <div
                        className="absolute w-full z-50 bg-white dark:bg-gray-800 border-x border-b border-gray-300 dark:border-gray-600 rounded-b shadow-lg max-h-60 overflow-y-auto"
                        style={{ top: '100%' }}
                    >
                        {/* Recently Selected Section */}
                        {showRecent && (
                            <>
                                <div className="px-3 py-2 text-xs font-bold text-[#FA5054] bg-gray-50 dark:bg-gray-900/50 sticky top-0 z-10">
                                    Recently Selected
                                </div>
                                {recentOptions.map((option, index) => {
                                    const optionValue = typeof option === 'string' ? option : (option.name || option.state_name);
                                    return (
                                        <button
                                            key={`recent-${index}`}
                                            type="button"
                                            onClick={() => handleSelect(option)}
                                            className={`w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                                                value === optionValue
                                                    ? 'bg-[#FA5054]/10 text-[#FA5054] dark:bg-[#FA5054]/20'
                                                    : 'text-gray-700 dark:text-gray-300'
                                            }`}
                                        >
                                            {optionValue}
                                        </button>
                                    );
                                })}
                                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                            </>
                        )}

                        {/* All Options */}
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option, index) => {
                                const optionValue = typeof option === 'string' ? option : (option.name || option.state_name);
                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => handleSelect(option)}
                                        className={`w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                                            value === optionValue
                                                ? 'bg-[#FA5054]/10 text-[#FA5054] dark:bg-[#FA5054]/20'
                                                : 'text-gray-700 dark:text-gray-300'
                                        }`}
                                    >
                                        {optionValue}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm text-center">
                                No {type} found
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CountryStateCityDropdown;