'use client'

import React from 'react';

interface CalendarProps {
    mode?: 'single' | 'range';
    selected?: Date | [Date, Date] | null;
    onSelect?: (value: Date | [Date, Date] | null) => void;
    initialFocus?: boolean;
    minDate?: Date;
    maxDate?: Date;
}

export function Calendar({ mode = 'single', selected, onSelect, initialFocus, minDate, maxDate }: CalendarProps) {
    // Basic calendar stub using an input. For 'range', this stub only supports single date selection for simplicity.
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = new Date(e.target.value);
        if (onSelect) {
            onSelect(mode === 'single' ? newDate : [newDate, newDate]);
        }
    };

    const value = selected
        ? selected instanceof Date
            ? selected.toISOString().slice(0, 10)
            : ''
        : '';

    return (
        <div>
            <input
                type="date"
                value={value}
                onChange={handleChange}
                min={minDate ? minDate.toISOString().slice(0, 10) : undefined}
                max={maxDate ? maxDate.toISOString().slice(0, 10) : undefined}
            />
        </div>
    );
} 